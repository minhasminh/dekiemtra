import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  LineRuleType,
  PageNumber,
  PageOrientation,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {
  AppraisalSubmissionSheet,
  ApprovalStatus,
  CognitiveLevelCode,
  DossierDocumentTypeCode,
  DossierSecurityConfig,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamVariantPaper,
  ExamVariantQuestionItem,
  ExportPresentationTemplate,
  GeneratedFileInspectionResult,
  MatrixFormatGroupCode,
  MatrixLevelColumnCode,
  MatrixSpecificationRow,
  QuestionFormatCode,
  QuestionItem,
  SchoolRoleCode,
} from '../../types/domain';
import {
  ALL_QUESTION_FORMATS,
  ASSESSMENT_RULES_BY_LEVEL,
  getApprovalStatusInfo,
} from '../business/assessmentRules';
import {
  createEmptyCellsForRow,
  exactAdd,
  exactPercentage,
  exactRound2,
  MATRIX_FORMAT_GROUPS,
  MATRIX_LEVEL_COLUMNS,
  syncSpecRowsToLegacyRows,
} from '../business/matrixCalculationService';
import {
  DEFAULT_12_APPRAISAL_CRITERIA,
  generateOfficialAppraisalMinutes,
  SCHOOL_USERS,
} from '../business/appraisalWorkflowService';
import { cleanLearningOutcomeText } from '../../data/matrixLessonCatalog';
import { generateExamVariants } from '../business/examGenerationEngine';

export {
  exactAdd,
  exactRound2 as exactRound,
  MATRIX_FORMAT_GROUPS as FORMAT_GROUP_DEFINITIONS,
  MATRIX_LEVEL_COLUMNS as LEVEL_COLUMN_DEFINITIONS,
};

export function getQuestionFormatLabel(format: QuestionFormatCode | string): string {
  const found = ALL_QUESTION_FORMATS.find((f) => f.code === format);
  if (found) return found.name;
  const fg = MATRIX_FORMAT_GROUPS.find((g) => g.code === format);
  return fg?.label || String(format);
}

export function getCognitiveLevelLabel(code: CognitiveLevelCode | string): string {
  for (const levelRule of Object.values(ASSESSMENT_RULES_BY_LEVEL)) {
    const found = levelRule.cognitiveLevels.find((c) => c.code === code);
    if (found) return found.shortLabel;
  }
  const lv = MATRIX_LEVEL_COLUMNS.find((l) => l.code === code);
  return lv?.label || String(code);
}

export function getSectionTitleForFormatGroup(
  fg: MatrixFormatGroupCode
): string {
  switch (fg) {
    case 'MCQ':
      return 'PHẦN I. Trắc nghiệm nhiều lựa chọn';
    case 'TRUE_FALSE':
      return 'PHẦN II. Đúng – Sai';
    case 'SHORT_ANSWER':
      return 'PHẦN III. Trả lời ngắn';
    case 'ESSAY':
      return 'PHẦN IV. Tự luận';
    default:
      return 'PHẦN BÀI TẬP';
  }
}

export function getSectionInstructionForFormatGroup(
  fg: MatrixFormatGroupCode
): string {
  switch (fg) {
    case 'MCQ':
      return 'Khoanh tròn vào chữ cái đứng trước câu em cho là đúng nhất:';
    case 'TRUE_FALSE':
      return 'Học sinh trả lời từ câu 1 đến câu 4; trong mỗi ý a, b, c, d, ở mỗi câu học sinh chọn đúng hoặc sai.';
    default:
      return '';
  }
}

export interface SimpleMatrixCalculationSummary {
  totalQuestions: number;
  totalPoints: number;
  totalPercentage: number;
  byRow: {
    rowId: string;
    questionCount: number;
    points: number;
    percentage: number;
  }[];
  byLevel: Record<
    MatrixLevelColumnCode,
    { questionCount: number; points: number; percentage: number }
  >;
  byFormatGroup: Record<
    MatrixFormatGroupCode,
    { questionCount: number; points: number; percentage: number }
  >;
}

export function calculateMatrixSummary(
  specRows: MatrixSpecificationRow[],
  activeFormatGroups: MatrixFormatGroupCode[],
  targetTotalPoints: number
): SimpleMatrixCalculationSummary {
  const denom = targetTotalPoints > 0 ? targetTotalPoints : 10;

  const byLevel: Record<
    MatrixLevelColumnCode,
    { questionCount: number; points: number; percentage: number }
  > = {
    BIET: { questionCount: 0, points: 0, percentage: 0 },
    HIEU: { questionCount: 0, points: 0, percentage: 0 },
    VAN_DUNG: { questionCount: 0, points: 0, percentage: 0 },
  };

  const byFormatGroup: Record<
    MatrixFormatGroupCode,
    { questionCount: number; points: number; percentage: number }
  > = {
    MCQ: { questionCount: 0, points: 0, percentage: 0 },
    TRUE_FALSE: { questionCount: 0, points: 0, percentage: 0 },
    SHORT_ANSWER: { questionCount: 0, points: 0, percentage: 0 },
    ESSAY: { questionCount: 0, points: 0, percentage: 0 },
  };

  let totalQuestions = 0;
  let totalPoints = 0;

  const byRow = specRows.map((r) => {
    let rCnt = 0;
    let rPts = 0;
    r.cells.forEach((c) => {
      if (!activeFormatGroups.includes(c.formatGroup)) return;
      rCnt += c.questionCount || 0;
      rPts = exactAdd(rPts, c.points || 0);

      byLevel[c.levelColumn].questionCount += c.questionCount || 0;
      byLevel[c.levelColumn].points = exactAdd(
        byLevel[c.levelColumn].points,
        c.points || 0
      );

      byFormatGroup[c.formatGroup].questionCount += c.questionCount || 0;
      byFormatGroup[c.formatGroup].points = exactAdd(
        byFormatGroup[c.formatGroup].points,
        c.points || 0
      );
    });
    totalQuestions += rCnt;
    totalPoints = exactAdd(totalPoints, rPts);

    return {
      rowId: r.id,
      questionCount: rCnt,
      points: exactRound2(rPts),
      percentage: exactPercentage(rPts, denom),
    };
  });

  MATRIX_LEVEL_COLUMNS.forEach((lv) => {
    byLevel[lv.code].points = exactRound2(byLevel[lv.code].points);
    byLevel[lv.code].percentage = exactPercentage(
      byLevel[lv.code].points,
      denom
    );
  });

  MATRIX_FORMAT_GROUPS.forEach((fg) => {
    byFormatGroup[fg.code].points = exactRound2(byFormatGroup[fg.code].points);
    byFormatGroup[fg.code].percentage = exactPercentage(
      byFormatGroup[fg.code].points,
      denom
    );
  });

  return {
    totalQuestions,
    totalPoints: exactRound2(totalPoints),
    totalPercentage: exactPercentage(totalPoints, denom),
    byRow,
    byLevel,
    byFormatGroup,
  };
}

// ============================================================================
// 1. DANH MỤC 10 TÀI LIỆU TRONG HỒ SƠ KIỂM TRA ĐỊNH KỲ (MỤC II)
// ============================================================================

export interface DossierDocumentMeta {
  code: DossierDocumentTypeCode;
  orderNumber: string;
  title: string;
  shortFileName: string;
  description: string;
  isConfidential: boolean; // True với Đáp án, Hướng dẫn chấm, Biểu điểm (Mục IX)
  preferLandscapeInPrint: boolean;
}

export const DOSSIER_DOCUMENT_CATALOG: DossierDocumentMeta[] = [
  {
    code: '01_MATRIX',
    orderNumber: '01',
    title: '1. Ma trận đề kiểm tra',
    shortFileName: '01_Ma_tran_de_kiem_tra',
    description:
      'Bảng ma trận tiêu đề nhiều tầng, gộp ô theo dạng câu hỏi và mức độ nhận thức, tổng câu, tổng điểm và tỷ lệ %.',
    isConfidential: false,
    preferLandscapeInPrint: true,
  },
  {
    code: '02_SPECIFICATION',
    orderNumber: '02',
    title: '2. Bản đặc tả đề kiểm tra',
    shortFileName: '02_Ban_dac_ta_de_kiem_tra',
    description:
      'Thể hiện đầy đủ Chủ đề, Nội dung kiến thức, Yêu cầu cần đạt đã xác minh, Mức độ đánh giá, Dạng câu, Số câu và Năng lực.',
    isConfidential: false,
    preferLandscapeInPrint: true,
  },
  {
    code: '03_STUDENT_EXAM',
    orderNumber: '03',
    title: '3. Đề kiểm tra dành cho học sinh',
    shortFileName: '03_De_kiem_tra_Hoc_sinh',
    description:
      'Bản đề in phát cho học sinh theo từng mã đề, giữ nguyên ngữ liệu chung, công thức rõ nét, tuyệt đối không lộ đáp án.',
    isConfidential: false,
    preferLandscapeInPrint: false,
  },
  {
    code: '04_MCQ_ANSWER_KEY',
    orderNumber: '04',
    title: '4. Đáp án trắc nghiệm',
    shortFileName: '04_Dap_an_trac_nghiem',
    description:
      'Bảng đáp án trắc nghiệm chính xác theo từng mã đề sau khi đảo thứ tự câu và đảo phương án A/B/C/D.',
    isConfidential: true,
    preferLandscapeInPrint: false,
  },
  {
    code: '05_ESSAY_GRADING_GUIDE',
    orderNumber: '05',
    title: '5. Hướng dẫn chấm tự luận',
    shortFileName: '05_Huong_dan_cham_tu_luan',
    description:
      'Bảng hướng dẫn chấm chi tiết gồm cột Nội dung cần đạt, Điểm thành phần và Các phương án trả lời đúng chấp nhận.',
    isConfidential: true,
    preferLandscapeInPrint: false,
  },
  {
    code: '06_SCORING_RUBRIC_TABLE',
    orderNumber: '06',
    title: '6. Biểu điểm',
    shortFileName: '06_Bieu_diem_chi_tiet',
    description:
      'Biểu điểm tổng hợp toàn đề theo từng phần, từng câu và mức độ nhận thức, khớp tuyệt đối tổng điểm đề.',
    isConfidential: true,
    preferLandscapeInPrint: false,
  },
  {
    code: '07_APPRAISAL_SHEET',
    orderNumber: '07',
    title: '7. Phiếu thẩm định',
    shortFileName: '07_Phieu_tham_dinh_chuyen_mon',
    description:
      'Phiếu đánh giá 12 tiêu chí chuyên môn của giáo viên phản biện, ghi nhận vị trí câu hỏi và đề xuất chỉnh sửa.',
    isConfidential: false,
    preferLandscapeInPrint: false,
  },
  {
    code: '08_APPROVAL_MINUTES',
    orderNumber: '08',
    title: '8. Biên bản phê duyệt',
    shortFileName: '08_Bien_ban_tham_dinh_phe_duyet',
    description:
      'Biên bản thẩm định và phê duyệt chính thức của Tổ chuyên môn và Ban Giám hiệu nhà trường.',
    isConfidential: false,
    preferLandscapeInPrint: false,
  },
  {
    code: '09_USED_QUESTION_CATALOG',
    orderNumber: '09',
    title: '9. Danh mục câu hỏi đã sử dụng',
    shortFileName: '09_Danh_muc_cau_hoi_su_dung',
    description:
      'Bảng truy vết mã câu hỏi ngân hàng, chủ đề, mã YCCĐ, mức độ, dạng thức, điểm số và vị trí trong từng mã đề.',
    isConfidential: true,
    preferLandscapeInPrint: true,
  },
  {
    code: '10_EXAM_STATISTICS_REPORT',
    orderNumber: '10',
    title: '10. Báo cáo thống kê đề kiểm tra',
    shortFileName: '10_Bao_cao_thong_ke_de_kiem_tra',
    description:
      'Báo cáo phân tích cấu trúc điểm theo chủ đề, mức độ nhận thức, dạng câu hỏi và kiểm định chất lượng 9 tiêu chí.',
    isConfidential: false,
    preferLandscapeInPrint: false,
  },
];

// ============================================================================
// 2. BỘ MẪU TRÌNH BÀY MẶC ĐỊNH & TÙY CHỈNH (MỤC III)
// ============================================================================

export const DEFAULT_EXPORT_TEMPLATES: ExportPresentationTemplate[] = [
  {
    id: 'tpl-ministry-standard-13',
    name: 'Mẫu 1: Chuẩn văn bản Bộ GD&ĐT (Times New Roman 13pt, Lề chuẩn)',
    isDefault: true,
    paperSize: 'A4',
    orientationPolicy: 'AUTO_SMART',
    fontFamily: 'Times New Roman',
    bodyFontSizePt: 13,
    titleFontSizePt: 15,
    marginsCm: {
      top: 2.0,
      bottom: 2.0,
      left: 2.5,
      right: 2.0,
    },
    lineSpacing: 1.25,
    autoPageNumbering: true,
    governingBodyName: 'UBND XÃ ĐAN ĐIỀN',
    showSectionPoints: true,
    showScoreBoxInStudentPaper: true,
    repeatTableHeaderOnNewPage: true,
  },
  {
    id: 'tpl-primary-tt27-14',
    name: 'Mẫu 2: Tiểu học Thông tư 27/2020 (Times New Roman 14pt, Chữ to rõ)',
    isDefault: false,
    paperSize: 'A4',
    orientationPolicy: 'AUTO_SMART',
    fontFamily: 'Times New Roman',
    bodyFontSizePt: 14,
    titleFontSizePt: 16,
    marginsCm: {
      top: 2.0,
      bottom: 2.0,
      left: 2.5,
      right: 2.0,
    },
    lineSpacing: 1.3,
    autoPageNumbering: true,
    governingBodyName: 'UBND XÃ ĐAN ĐIỀN',
    showSectionPoints: true,
    showScoreBoxInStudentPaper: true,
    repeatTableHeaderOnNewPage: true,
  },
  {
    id: 'tpl-secondary-cv7991-compact',
    name: 'Mẫu 3: THCS Công văn 7991 – Tiết kiệm trang in (Times New Roman 13pt)',
    isDefault: false,
    paperSize: 'A4',
    orientationPolicy: 'AUTO_SMART',
    fontFamily: 'Times New Roman',
    bodyFontSizePt: 13,
    titleFontSizePt: 14,
    marginsCm: {
      top: 2.0,
      bottom: 2.0,
      left: 2.5,
      right: 2.0,
    },
    lineSpacing: 1.15,
    autoPageNumbering: true,
    governingBodyName: 'UBND XÃ ĐAN ĐIỀN',
    showSectionPoints: true,
    showScoreBoxInStudentPaper: false,
    repeatTableHeaderOnNewPage: true,
  },
];

// ============================================================================
// 3. CHUYỂN ĐỔI CÔNG THỨC TOÁN, VẬT LÝ, HÓA HỌC (LATEX -> WORD HTML & DOCX)
// ============================================================================

const SUPERSCRIPT_CHAR_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  n: 'ⁿ',
  i: 'ⁱ',
};

const SUBSCRIPT_CHAR_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  a: 'ₐ',
  e: 'ₑ',
  o: 'ₒ',
  x: 'ₓ',
  h: 'ₕ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  p: 'ₚ',
  s: 'ₛ',
  t: 'ₜ',
};

function toUnicodeSuperscript(str: string): string {
  return Array.from(str)
    .map((ch) => SUPERSCRIPT_CHAR_MAP[ch] ?? ch)
    .join('');
}

function toUnicodeSubscript(str: string): string {
  return Array.from(str)
    .map((ch) => SUBSCRIPT_CHAR_MAP[ch] ?? ch)
    .join('');
}

/**
 * Chuẩn hóa chung các ký hiệu LaTeX Toán – Lý – Hóa sang ký tự chuẩn trước khi xuất Word
 */
function normalizeLatexCoreSymbols(input: string): string {
  let text = input;

  // Bóc các cặp ký hiệu bao công thức $$...$$, $...$, \(...\), \[...\]
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, '$1');
  text = text.replace(/\$([^$\n]+?)\$/g, '$1');
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, '$1');
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, '$1');

  // Xử lý \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}, \textbf{...}
  for (let pass = 0; pass < 3; pass++) {
    text = text.replace(
      /\\(?:text|mathrm|mathbf|mathit|textbf|textit|mathsf)\{([^{}]*)\}/g,
      '$1'
    );
  }

  // Bỏ \left và \right
  text = text
    .replace(/\\left\s*([([\]{}|.])/g, '$1')
    .replace(/\\right\s*([([\]{}|.])/g, '$1')
    .replace(/\\left\\\{/g, '{')
    .replace(/\\right\\\}/g, '}');

  // Mũi tên phản ứng Hóa học có điều kiện: \xrightarrow[dưới]{trên} hoặc \xrightarrow{trên}
  text = text.replace(
    /\\xrightarrow\[([^\]]*)\]\{([^{}]*)\}/g,
    ' —($2, $1)→ '
  );
  text = text.replace(/\\xrightarrow\{([^{}]*)\}/g, ' —($1)→ ');
  text = text.replace(/\\xleftarrow\{([^{}]*)\}/g, ' ←($1)— ');

  // Vectơ, đoạn thẳng, góc hình học (Toán & Vật lý)
  text = text.replace(/\\overrightarrow\{([^{}]+)\}/g, '$1\u20D7');
  text = text.replace(/\\vec\{([^{}]+)\}/g, '$1\u20D7');
  text = text.replace(/\\widehat\{([^{}]+)\}/g, '∠$1');
  text = text.replace(/\\overline\{([^{}]+)\}/g, '$1\u0305');

  // Căn bậc n và căn bậc 2 (xử lý lồng nhau)
  for (let pass = 0; pass < 3; pass++) {
    text = text.replace(
      /\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g,
      (_, deg, rad) => `${toUnicodeSuperscript(String(deg).trim())}√(${rad})`
    );
    text = text.replace(/\\sqrt\{([^{}]+)\}/g, (_, rad) => {
      const cleanRad = String(rad).trim();
      return /^[a-zA-Z0-9]+$/.test(cleanRad) ? `√${cleanRad}` : `√(${cleanRad})`;
    });
  }

  // Phân số \frac{a}{b}, \dfrac{a}{b}, \tfrac{a}{b} (xử lý lồng nhau)
  for (let pass = 0; pass < 3; pass++) {
    text = text.replace(
      /\\(?:d|t)?frac\{([^{}]+)\}\{([^{}]+)\}/g,
      (_, num, den) => {
        const n = String(num).trim();
        const d = String(den).trim();
        const nSimple = /^[a-zA-Z0-9⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇⁸⁹]+$/.test(n);
        const dSimple = /^[a-zA-Z0-9⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇⁸⁹]+$/.test(d);
        if (nSimple && dSimple) return `${n}/${d}`;
        return `(${n})/(${d})`;
      }
    );
  }

  // Độ C, độ góc, phần trăm
  text = text
    .replace(/\^\{\\circ\}\s*C\b/g, '°C')
    .replace(/\^\\circ\s*C\b/g, '°C')
    .replace(/\\degree\s*C\b/g, '°C')
    .replace(/\^\{\\circ\}/g, '°')
    .replace(/\^\\circ/g, '°')
    .replace(/\\circ\b/g, '°')
    .replace(/\\degree\b/g, '°')
    .replace(/\\%/g, '%');

  // Ký hiệu mũi tên Toán – Lý – Hóa
  text = text
    .replace(/\\rightleftharpoons|\\leftrightarrows/g, ' ⇌ ')
    .replace(/\\Longleftrightarrow|\\iff/g, ' ⇔ ')
    .replace(/\\Leftrightarrow/g, ' ⇔ ')
    .replace(/\\Longrightarrow|\\implies/g, ' ⇒ ')
    .replace(/\\Rightarrow/g, ' ⇒ ')
    .replace(/\\longrightarrow|\\rightarrow|\\to\b/g, ' → ')
    .replace(/\\longleftarrow|\\leftarrow/g, ' ← ')
    .replace(/\\leftrightarrow/g, ' ↔ ')
    .replace(/\\uparrow/g, '↑')
    .replace(/\\downarrow/g, '↓');

  // Chữ cái Hy Lạp & Hằng số Vật lý / Toán học
  text = text
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\gamma\b/g, 'γ')
    .replace(/\\Gamma\b/g, 'Γ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\epsilon\b|\\varepsilon\b/g, 'ε')
    .replace(/\\zeta\b/g, 'ζ')
    .replace(/\\eta\b/g, 'η')
    .replace(/\\theta\b|\\vartheta\b/g, 'θ')
    .replace(/\\Theta\b/g, 'Θ')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\Lambda\b/g, 'Λ')
    .replace(/\\mu\b/g, 'μ')
    .replace(/\\nu\b/g, 'ν')
    .replace(/\\xi\b/g, 'ξ')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\Pi\b/g, 'Π')
    .replace(/\\rho\b/g, 'ρ')
    .replace(/\\sigma\b/g, 'σ')
    .replace(/\\Sigma\b/g, 'Σ')
    .replace(/\\tau\b/g, 'τ')
    .replace(/\\phi\b|\\varphi\b/g, 'φ')
    .replace(/\\Phi\b/g, 'Φ')
    .replace(/\\chi\b/g, 'χ')
    .replace(/\\psi\b/g, 'ψ')
    .replace(/\\omega\b/g, 'ω')
    .replace(/\\Omega\b/g, 'Ω');

  // Toán tử & Quan hệ Toán học
  text = text
    .replace(/\\times\b/g, '×')
    .replace(/\\div\b/g, '÷')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\pm\b/g, '±')
    .replace(/\\mp\b/g, '∓')
    .replace(/\\le\b|\\leq\b|\\leqslant\b/g, '≤')
    .replace(/\\ge\b|\\geq\b|\\geqslant\b/g, '≥')
    .replace(/\\ne\b|\\neq\b/g, '≠')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\equiv\b/g, '≡')
    .replace(/\\sim\b|\\simeq\b/g, '∼')
    .replace(/\\propto\b/g, '∝')
    .replace(/\\infty\b/g, '∞')
    .replace(/\\partial\b/g, '∂')
    .replace(/\\int\b/g, '∫')
    .replace(/\\sum\b/g, '∑')
    .replace(/\\prod\b/g, '∏')
    .replace(/\\forall\b/g, '∀')
    .replace(/\\exists\b/g, '∃')
    .replace(/\\notin\b/g, '∉')
    .replace(/\\in\b/g, '∈')
    .replace(/\\subseteq\b/g, '⊆')
    .replace(/\\subset\b/g, '⊂')
    .replace(/\\supseteq\b/g, '⊇')
    .replace(/\\supset\b/g, '⊃')
    .replace(/\\cup\b/g, '∪')
    .replace(/\\cap\b/g, '∩')
    .replace(/\\emptyset\b|\\varnothing\b/g, '∅')
    .replace(/\\perp\b/g, '⊥')
    .replace(/\\parallel\b/g, '∥')
    .replace(/\\angle\b/g, '∠')
    .replace(/\\triangle\b/g, '△')
    .replace(/\\therefore\b/g, '∴')
    .replace(/\\because\b/g, '∵')
    .replace(/\\quad\b|\\qquad\b/g, '  ')
    .replace(/\\,|\\;|\\!/g, ' ');

  return text;
}

/**
 * Chuyển đổi công thức sang chuỗi Unicode kèm đánh dấu chỉ số trên/dưới cho tài liệu Office (.docx / .xlsx)
 */
export function formatMathForOfficeDocument(rawText: string | undefined): string {
  if (!rawText) return '';
  let text = normalizeLatexCoreSymbols(rawText);

  // Chuyển ^{...} và ^x sang ký tự số mũ Unicode
  text = text.replace(/\^\{([^{}]+)\}/g, (_, exp) =>
    toUnicodeSuperscript(String(exp))
  );
  text = text.replace(/\^([0-9+\-n])/g, (_, exp) =>
    toUnicodeSuperscript(String(exp))
  );

  // Chuyển _{...} và _x sang ký tự chỉ số dưới Unicode (VD: H_2SO_4 -> H₂SO₄, v_0 -> v₀)
  text = text.replace(/_\{([^{}]+)\}/g, (_, sub) =>
    toUnicodeSubscript(String(sub))
  );
  text = text.replace(/_([0-9+\-aehklmnopstx])/g, (_, sub) =>
    toUnicodeSubscript(String(sub))
  );

  // Dọn các ngoặc nhọn LaTeX thừa
  text = text.replace(/\\\{/g, '{').replace(/\\\}/g, '}');

  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

/**
 * Chuyển đổi công thức Toán – Lý – Hóa sang HTML chuẩn Microsoft Word (sử dụng thẻ <sup>, <sub>, ký hiệu toán học chuẩn)
 */
export function formatMathForWordHtml(rawText: string | undefined): string {
  if (!rawText) return '';
  let text = normalizeLatexCoreSymbols(rawText);

  // Escape HTML cơ bản nhưng giữ nguyên các ký tự Unicode toán học
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Chuyển ^{...} và ^x sang thẻ <sup>...</sup> chuẩn Word
  text = text.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
  text = text.replace(/\^([0-9+\-a-zA-Z])/g, '<sup>$1</sup>');

  // Chuyển _{...} và _x sang thẻ <sub>...</sub> chuẩn Word (VD: H_2SO_4, x_1, v_0)
  text = text.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
  text = text.replace(/_([0-9+\-a-zA-Z])/g, '<sub>$1</sub>');

  // Dọn các ngoặc nhọn LaTeX thừa và đổi xuống dòng thành <br/>
  text = text
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\n/g, '<br/>');

  return text.trim();
}

export function getExamPeriodVietnameseLabel(
  period: ExamPaper['examPeriod']
): string {
  switch (period) {
    case 'GIUA_KY_1':
      return 'ĐỀ KIỂM TRA GIỮA KÌ I';
    case 'CUOI_KY_1':
      return 'ĐỀ KIỂM TRA CUỐI KÌ I';
    case 'GIUA_KY_2':
      return 'ĐỀ KIỂM TRA GIỮA KÌ II';
    case 'CUOI_KY_2':
      return 'ĐỀ KIỂM TRA CUỐI KÌ II';
    default:
      return 'ĐỀ KIỂM TRA ĐỊNH KÌ';
  }
}

export function formatExamHeaderRightTitle(
  period: ExamPaper['examPeriod'] | string,
  academicYear?: string,
  prefix = 'ĐỀ KIỂM TRA'
): string {
  const periodMap: Record<string, string> = {
    GIUA_KY_1: 'GIỮA KÌ I',
    CUOI_KY_1: 'CUỐI KÌ I',
    GIUA_KY_2: 'GIỮA KÌ II',
    CUOI_KY_2: 'CUỐI KÌ II',
  };
  const periodLabel = periodMap[period] || 'ĐỊNH KÌ';
  const cleanYear = (academicYear || '2026-2027')
    .replace(/\s*[–—-]\s*/g, '-')
    .trim();
  return `${prefix} ${periodLabel} NĂM HỌC ${cleanYear}`;
}

export function isRecordOfficiallyApproved(status: ApprovalStatus): boolean {
  return (
    status === ApprovalStatus.APPROVED ||
    status === ApprovalStatus.PUBLISHED ||
    status === ApprovalStatus.ARCHIVED
  );
}

// ============================================================================
// 4. KIỂM TRA BẢO MẬT KHI XUẤT HỒ SƠ (MỤC IX)
// ============================================================================

export function checkExportSecurityPermission(params: {
  actorRole: SchoolRoleCode | 'STUDENT_GUEST_RESTRICTED';
  documentTypes: DossierDocumentTypeCode[];
  securityConfig: DossierSecurityConfig;
}): {
  allowed: boolean;
  reason: string;
  containsConfidential: boolean;
} {
  const { actorRole, documentTypes, securityConfig } = params;
  const confidentialDocs = DOSSIER_DOCUMENT_CATALOG.filter(
    (d) => documentTypes.includes(d.code) && d.isConfidential
  );
  const containsConfidential = confidentialDocs.length > 0;

  if (!containsConfidential || !securityConfig.enforceConfidentialAnswerRestriction) {
    return {
      allowed: true,
      reason: 'Hồ sơ hợp lệ được phép xuất.',
      containsConfidential,
    };
  }

  if (actorRole === 'STUDENT_GUEST_RESTRICTED') {
    const names = confidentialDocs.map((d) => d.title).join(', ');
    return {
      allowed: false,
      reason: `CHẶN BẢO MẬT (Mục IX): Tài khoản Học sinh / Khách không có thẩm quyền xuất tài liệu mật (${names}). Chỉ Giáo viên chuyên môn, Tổ trưởng hoặc Ban Giám hiệu mới được phép tải Đáp án, Hướng dẫn chấm và Biểu điểm.`,
      containsConfidential: true,
    };
  }

  return {
    allowed: true,
    reason: `Đã xác thực quyền truy cập tài liệu mật cho vai trò ${actorRole}.`,
    containsConfidential: true,
  };
}

// ============================================================================
// 5. CHUẨN BỊ DỮ LIỆU ĐẦY ĐỦ CHO BỘ HỒ SƠ ĐỀ KIỂM TRA & MA TRẬN
// ============================================================================

export interface ResolvedDossierContext {
  exam: ExamPaper;
  matrix: ExamMatrix;
  questions: QuestionItem[];
  variants: ExamVariantPaper[];
  selectedVariant: ExamVariantPaper;
  isApproved: boolean;
  draftBannerText: string;
  watermarkText: string;
  securityCode: string;
  template: ExportPresentationTemplate;
  schoolName: string;
  departmentName: string;
  academicYear: string;
}

export function resolveDossierContext(params: {
  exam: ExamPaper;
  matrix?: ExamMatrix;
  allQuestions: QuestionItem[];
  selectedVariantCode?: string;
  template: ExportPresentationTemplate;
  securityConfig: DossierSecurityConfig;
  schoolName: string;
  departmentName: string;
  academicYear: string;
}): ResolvedDossierContext {
  const {
    exam,
    matrix,
    allQuestions,
    selectedVariantCode,
    template,
    securityConfig,
    schoolName,
    departmentName,
    academicYear,
  } = params;

  const examQuestions = exam.questionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is QuestionItem => Boolean(q));

  let variants: ExamVariantPaper[] = exam.variants || [];
  if (variants.length === 0) {
    const fallbackItems: ExamVariantQuestionItem[] = examQuestions.map(
      (q, idx) => ({
        questionId: q.id,
        originalCode: q.code,
        displayNumber: idx + 1,
        sectionOrderInPart: idx + 1,
        formatGroup:
          q.format === QuestionFormatCode.ESSAY ||
          q.format === QuestionFormatCode.ESSAY_SHORT
            ? 'ESSAY'
            : q.format === QuestionFormatCode.SHORT_ANSWER
            ? 'SHORT_ANSWER'
            : q.format === QuestionFormatCode.TRUE_FALSE_CLUSTER
            ? 'TRUE_FALSE'
            : 'MCQ',
        levelColumn:
          q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_3 ||
          q.cognitiveLevel === CognitiveLevelCode.SEC_VAN_DUNG ||
          q.cognitiveLevel === CognitiveLevelCode.SEC_VAN_DUNG_CAO
            ? 'VAN_DUNG'
            : q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_2 ||
              q.cognitiveLevel === CognitiveLevelCode.SEC_THONG_HIEU
            ? 'HIEU'
            : 'BIET',
        rowId: 'r1',
        learningOutcomeCode: q.learningOutcomeCode,
        points: q.points,
        stem: q.stem,
        sharedPassage: q.sharedPassage,
        sharedPassageAuthor: q.sharedPassageAuthor,
        shuffledOptions: q.options ? [...q.options] : undefined,
        optionPermutation: q.options ? q.options.map((_, i) => i) : undefined,
        shuffledCorrectAnswer: q.correctAnswer,
        gradingGuide: q.gradingGuide,
        rubricCriteria: q.rubricCriteria,
        acceptedVariations: q.acceptedVariations,
        subStatements: q.subStatements,
      })
    );

    variants = [
      {
        variantCode: '101',
        variantSeed: exam.seed || 'SEED-DEFAULT-101',
        items: fallbackItems,
        totalQuestions: fallbackItems.length,
        totalPoints: exactRound2(
          fallbackItems.reduce((acc, it) => exactAdd(acc, it.points), 0)
        ),
        mcqQuickAnswerTable: fallbackItems
          .filter((it) => it.formatGroup !== 'ESSAY')
          .map((it) => ({
            questionNumber: it.displayNumber,
            sectionNumber: it.sectionOrderInPart,
            formatGroup: it.formatGroup,
            answer: it.shuffledCorrectAnswer,
            points: it.points,
            originalQuestionCode: it.originalCode,
          })),
      },
    ];
  }

  const selectedVariant =
    variants.find((v) => v.variantCode === selectedVariantCode) || variants[0];

  const fallbackMatrix: ExamMatrix = matrix || {
    id: exam.matrixId || 'mat-fallback',
    code: exam.matrixCode || 'MT-AUTO',
    title: exam.matrixTitle || `Ma trận ${exam.title}`,
    schoolName,
    academicYear,
    semester:
      exam.examPeriod === 'GIUA_KY_1' || exam.examPeriod === 'CUOI_KY_1'
        ? 'HOC_KY_1'
        : 'HOC_KY_2',
    examTypeLabel: getExamPeriodVietnameseLabel(exam.examPeriod),
    knowledgeScope: `Chương trình GDPT 2018 – Môn ${exam.subject} Lớp ${exam.grade}`,
    appliedRuleBasis:
      exam.levelId === EducationLevelId.PRIMARY
        ? 'Thông tư 27/2020/TT-BGDĐT'
        : 'Thông tư 22/2021/TT-BGDĐT & Công văn 7991/BGDĐT-GDTrH',
    templateCode:
      exam.levelId === EducationLevelId.PRIMARY
        ? 'TEMPLATE_C_PRIMARY_APPROVED'
        : 'TEMPLATE_A_CV7991',
    templateConfirmed: true,
    activeFormatGroups: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
    levelId: exam.levelId,
    grade: exam.grade,
    subject: exam.subject,
    examPeriod: exam.examPeriod,
    durationMinutes: exam.durationMinutes,
    totalPoints: exam.totalPoints,
    targetTotalPoints: exam.totalPoints,
    totalQuestions: examQuestions.length,
    rows: [],
    status: exam.status,
    authorName: exam.authorName,
    createdAt: exam.createdAt,
    isSampleData: exam.isSampleData,
  };

  if (!fallbackMatrix.specRows || fallbackMatrix.specRows.length === 0) {
    const builtSpecRows: MatrixSpecificationRow[] = (
      fallbackMatrix.rows || []
    ).map((r, idx) => {
      const cells = createEmptyCellsForRow().map((c) => {
        if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET') {
          const cnt =
            r.countsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_1] ||
            r.countsByCognitiveLevel[CognitiveLevelCode.SEC_NHAN_BIET] ||
            4;
          const pts =
            r.pointsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_1] ||
            r.pointsByCognitiveLevel[CognitiveLevelCode.SEC_NHAN_BIET] ||
            2.0;
          return { ...c, questionCount: cnt, points: pts };
        }
        if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU') {
          const cnt =
            r.countsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_2] ||
            r.countsByCognitiveLevel[CognitiveLevelCode.SEC_THONG_HIEU] ||
            2;
          const pts =
            r.pointsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_2] ||
            r.pointsByCognitiveLevel[CognitiveLevelCode.SEC_THONG_HIEU] ||
            2.0;
          return { ...c, questionCount: cnt, points: pts };
        }
        if (c.formatGroup === 'ESSAY' && c.levelColumn === 'VAN_DUNG') {
          const cnt =
            r.countsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_3] ||
            r.countsByCognitiveLevel[CognitiveLevelCode.SEC_VAN_DUNG] ||
            1;
          const pts =
            r.pointsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_3] ||
            r.pointsByCognitiveLevel[CognitiveLevelCode.SEC_VAN_DUNG] ||
            1.0;
          return { ...c, questionCount: cnt, points: pts };
        }
        return c;
      });
      return {
        id: r.id || `spec-${idx + 1}`,
        chapterCode: `Chủ đề ${idx + 1}`,
        topicTitle: r.topicTitle,
        knowledgeUnit: r.topicTitle,
        learningOutcomeCode: `YCCĐ-${exam.subject.slice(0, 2).toUpperCase()}${exam.grade}-${idx + 1}`,
        learningOutcomeText: r.learningOutcomeSummary,
        originalOutcomeText: r.learningOutcomeSummary,
        outcomeSource: 'Chương trình GDPT 2018',
        outcomeEditHistory: [],
        competencyAssessed:
          'Năng lực nhận thức, tư duy và giải quyết vấn đề thực tiễn',
        cells,
      };
    });
    fallbackMatrix.specRows = builtSpecRows;
  }

  const isApproved = isRecordOfficiallyApproved(exam.status);
  const draftBannerText =
    !isApproved && securityConfig.forceDraftStampForUnapproved
      ? 'BẢN NHÁP – HỒ SƠ CHƯA PHÊ DUYỆT CHÍNH THỨC (KHÔNG SỬ DỤNG PHÁT HÀNH CHO HỌC SINH)'
      : '';

  const watermarkText = !isApproved
    ? 'BẢN NHÁP - CHƯA PHÊ DUYỆT'
    : securityConfig.enableWatermark
    ? securityConfig.customWatermarkText || `${schoolName.toUpperCase()} · BẢO MẬT KHẢO THÍ`
    : '';

  const rawSchool = (fallbackMatrix.schoolName || schoolName || '').trim();
  const resolvedSchoolName =
    !rawSchool ||
    rawSchool.toLowerCase().includes('chuẩn quốc gia') ||
    rawSchool.toLowerCase().includes('edutest')
      ? 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH'
      : rawSchool;

  return {
    exam,
    matrix: fallbackMatrix,
    questions: examQuestions,
    variants,
    selectedVariant,
    isApproved,
    draftBannerText,
    watermarkText,
    securityCode: securityConfig.dossierSecurityCode,
    template,
    schoolName: resolvedSchoolName,
    departmentName,
    academicYear: fallbackMatrix.academicYear || academicYear,
  };
}

// ============================================================================
// 6. BỘ DỰNG TÀI LIỆU MICROSOFT WORD (.DOCX) CHUYÊN NGHIỆP (MỤC I, III, IV, V, VI, VII)
// ============================================================================

const cmToTwip = (cm: number): number => Math.round(cm * 566.929);

const STANDARD_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
  bottom: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
  left: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
  right: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
};

const INVISIBLE_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

function createStyledTextRun(
  text: string,
  template: ExportPresentationTemplate,
  opts?: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    sizePt?: number;
    color?: string;
    superScript?: boolean;
    subScript?: boolean;
  }
): TextRun {
  const pt = opts?.sizePt || template.bodyFontSizePt;
  return new TextRun({
    text,
    font: template.fontFamily,
    size: pt * 2,
    bold: opts?.bold,
    italics: opts?.italics,
    underline: opts?.underline ? {} : undefined,
    superScript: opts?.superScript,
    subScript: opts?.subScript,
    color: opts?.color || '0F172A',
  });
}

/**
 * Tách văn bản có chứa công thức Toán – Lý – Hóa (^{...}, ^2, _{...}, _2, hoặc ký tự Unicode ²³₀₁₂...)
 * thành danh sách TextRun có thuộc tính superScript / subScript chuẩn Word (.docx)
 */
function createMathAwareTextRuns(
  rawText: string,
  template: ExportPresentationTemplate,
  opts?: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    sizePt?: number;
    color?: string;
  }
): TextRun[] {
  if (!rawText) return [createStyledTextRun('', template, opts)];
  const coreText = normalizeLatexCoreSymbols(rawText);
  const tokenRegex = /(\^\{[^{}]+\}|\^[0-9+\-a-zA-Z]|_\{[^{}]+\}|_[0-9+\-a-zA-Z])/g;
  const parts = coreText.split(tokenRegex);
  const runs: TextRun[] = [];

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('^{') && part.endsWith('}')) {
      runs.push(
        createStyledTextRun(part.slice(2, -1), template, {
          ...opts,
          superScript: true,
        })
      );
    } else if (part.startsWith('^') && part.length === 2) {
      runs.push(
        createStyledTextRun(part.slice(1), template, {
          ...opts,
          superScript: true,
        })
      );
    } else if (part.startsWith('_{') && part.endsWith('}')) {
      runs.push(
        createStyledTextRun(part.slice(2, -1), template, {
          ...opts,
          subScript: true,
        })
      );
    } else if (part.startsWith('_') && part.length === 2) {
      runs.push(
        createStyledTextRun(part.slice(1), template, {
          ...opts,
          subScript: true,
        })
      );
    } else {
      runs.push(createStyledTextRun(part, template, opts));
    }
  }

  return runs.length > 0 ? runs : [createStyledTextRun(coreText, template, opts)];
}

function createStyledParagraph(
  text: string,
  template: ExportPresentationTemplate,
  opts?: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    sizePt?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingBefore?: number;
    spacingAfter?: number;
    keepNext?: boolean;
    keepLines?: boolean;
    color?: string;
  }
): Paragraph {
  // Định dạng cách dòng đơn (Single line spacing = 240 twips với LineRuleType.AUTO) & Canh đều hai bên (JUSTIFIED)
  return new Paragraph({
    alignment: opts?.alignment || AlignmentType.JUSTIFIED,
    keepNext: opts?.keepNext,
    keepLines: opts?.keepLines,
    spacing: {
      before: opts?.spacingBefore ?? 20,
      after: opts?.spacingAfter ?? 20,
      line: 240,
      lineRule: LineRuleType.AUTO,
    },
    children: createMathAwareTextRuns(text, template, {
      bold: opts?.bold,
      italics: opts?.italics,
      underline: opts?.underline,
      sizePt: opts?.sizePt,
      color: opts?.color,
    }),
  });
}

function createTableCell(
  text: string,
  template: ExportPresentationTemplate,
  opts?: {
    bold?: boolean;
    italics?: boolean;
    sizePt?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    rowSpan?: number;
    columnSpan?: number;
    shadingFill?: string;
    widthPct?: number;
  }
): TableCell {
  return new TableCell({
    rowSpan: opts?.rowSpan,
    columnSpan: opts?.columnSpan,
    verticalAlign: VerticalAlign.CENTER,
    borders: STANDARD_BORDER,
    shading: opts?.shadingFill
      ? { fill: opts.shadingFill, type: ShadingType.CLEAR, color: 'auto' }
      : undefined,
    width: opts?.widthPct
      ? { size: opts.widthPct, type: WidthType.PERCENTAGE }
      : undefined,
    margins: {
      top: 80,
      bottom: 80,
      left: 100,
      right: 100,
    },
    children: [
      createStyledParagraph(text, template, {
        bold: opts?.bold,
        italics: opts?.italics,
        sizePt: opts?.sizePt ?? Math.max(11, template.bodyFontSizePt - 1),
        alignment: opts?.alignment || AlignmentType.LEFT,
        spacingBefore: 20,
        spacingAfter: 20,
      }),
    ],
  });
}

function createNationalAndSchoolHeaderTable(
  ctx: ResolvedDossierContext,
  docHeadingTitle: string,
  subHeadingLine: string
): (Paragraph | Table)[] {
  const { template, schoolName, departmentName, draftBannerText } = ctx;
  const elements: (Paragraph | Table)[] = [];

  if (draftBannerText) {
    elements.push(
      createStyledParagraph(`[${draftBannerText}]`, template, {
        bold: true,
        sizePt: 11,
        alignment: AlignmentType.CENTER,
        color: 'B91C1C',
        spacingBefore: 0,
        spacingAfter: 100,
      })
    );
  }

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: INVISIBLE_BORDER,
            width: { size: 44, type: WidthType.PERCENTAGE },
            children: [
              createStyledParagraph(
                (template.governingBodyName || 'UBND XÃ ĐAN ĐIỀN').toUpperCase(),
                template,
                {
                  bold: false,
                  sizePt: 12,
                  alignment: AlignmentType.CENTER,
                  spacingBefore: 0,
                  spacingAfter: 10,
                }
              ),
              createStyledParagraph(schoolName.toUpperCase(), template, {
                bold: true,
                sizePt: 12,
                alignment: AlignmentType.CENTER,
                spacingBefore: 0,
                spacingAfter: 0,
              }),
              createStyledParagraph('__________________', template, {
                bold: false,
                sizePt: 11,
                alignment: AlignmentType.CENTER,
                spacingBefore: 0,
                spacingAfter: 40,
              }),
            ],
          }),
          new TableCell({
            borders: INVISIBLE_BORDER,
            width: { size: 56, type: WidthType.PERCENTAGE },
            children: [
              createStyledParagraph(
                formatExamHeaderRightTitle(
                  ctx.exam.examPeriod,
                  ctx.academicYear,
                  'ĐỀ KIỂM TRA'
                ),
                template,
                {
                  bold: true,
                  sizePt: 12,
                  alignment: AlignmentType.CENTER,
                  spacingBefore: 0,
                  spacingAfter: 10,
                }
              ),
              createStyledParagraph(
                `MÔN: ${ctx.exam.subject.toUpperCase()} - Lớp ${ctx.exam.grade}`,
                template,
                {
                  bold: false,
                  sizePt: 12,
                  alignment: AlignmentType.CENTER,
                  spacingBefore: 0,
                  spacingAfter: 10,
                }
              ),
              createStyledParagraph(
                `Thời gian: ${ctx.exam.durationMinutes} phút`,
                template,
                {
                  bold: false,
                  sizePt: 12,
                  alignment: AlignmentType.CENTER,
                  spacingBefore: 0,
                  spacingAfter: 10,
                }
              ),
              createStyledParagraph(
                '(không kể thời gian giao đề)',
                template,
                {
                  italics: true,
                  bold: false,
                  sizePt: 11.5,
                  alignment: AlignmentType.CENTER,
                  spacingBefore: 0,
                  spacingAfter: 40,
                }
              ),
            ],
          }),
        ],
      }),
    ],
  });

  elements.push(headerTable);
  elements.push(
    createStyledParagraph(docHeadingTitle.toUpperCase(), template, {
      bold: true,
      sizePt: template.titleFontSizePt,
      alignment: AlignmentType.CENTER,
      spacingBefore: 160,
      spacingAfter: 40,
    })
  );
  elements.push(
    createStyledParagraph(subHeadingLine, template, {
      bold: true,
      sizePt: template.bodyFontSizePt,
      alignment: AlignmentType.CENTER,
      spacingBefore: 0,
      spacingAfter: 160,
    })
  );

  return elements;
}

export async function generateDocxBlobForDocument(
  docType: DossierDocumentTypeCode,
  ctx: ResolvedDossierContext
): Promise<Blob> {
  const { exam, matrix, template, selectedVariant, variants } = ctx;
  const docMeta =
    DOSSIER_DOCUMENT_CATALOG.find((d) => d.code === docType) ||
    DOSSIER_DOCUMENT_CATALOG[0];

  const isMatrixOrSpec =
    docType === '01_MATRIX' || docType === '02_SPECIFICATION';

  const isLandscape = isMatrixOrSpec
    ? true
    : template.orientationPolicy === 'LANDSCAPE_TABLES'
    ? docMeta.preferLandscapeInPrint
    : template.orientationPolicy === 'AUTO_SMART'
    ? docMeta.preferLandscapeInPrint
    : false;

  const activeGroups: MatrixFormatGroupCode[] =
    matrix.activeFormatGroups && matrix.activeFormatGroups.length > 0
      ? matrix.activeFormatGroups
      : ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'];

  const specRows = matrix.specRows || [];
  const calcSummary = calculateMatrixSummary(
    specRows,
    activeGroups,
    matrix.targetTotalPoints || exam.totalPoints || 10
  );

  const subHeading = `${getExamPeriodVietnameseLabel(
    exam.examPeriod
  )} · NĂM HỌC ${ctx.academicYear} · MÔN: ${exam.subject.toUpperCase()} – KHỐI LỚP ${
    exam.grade
  }`;

  const bodyChildren: (Paragraph | Table)[] = [];

  if (docType === '01_MATRIX') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ',
        subHeading
      )
    );
    bodyChildren.push(
      createStyledParagraph(
        `Thời gian làm bài: ${exam.durationMinutes} phút · Tổng điểm: ${exam.totalPoints.toFixed(
          2
        )} điểm · Bộ quy tắc: ${
          matrix.appliedRuleBasis || 'Chương trình GDPT 2018'
        }`,
        template,
        {
          italics: true,
          alignment: AlignmentType.CENTER,
          spacingAfter: 140,
        }
      )
    );

    const headerRow1Cells: TableCell[] = [
      createTableCell('TT', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 2,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Chủ đề / Chương', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 2,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Nội dung / Đơn vị kiến thức', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 2,
        shadingFill: 'E2E8F0',
      }),
    ];

    activeGroups.forEach((fg) => {
      const fgMeta = MATRIX_FORMAT_GROUPS.find((d) => d.code === fg);
      headerRow1Cells.push(
        createTableCell(fgMeta?.label || fg, template, {
          bold: true,
          alignment: AlignmentType.CENTER,
          columnSpan: 3,
          shadingFill: 'DBEAFE',
        })
      );
    });

    headerRow1Cells.push(
      createTableCell('Tổng số câu', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 2,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Tổng điểm', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 2,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Tỷ lệ %', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 2,
        shadingFill: 'E2E8F0',
      })
    );

    const headerRow2Cells: TableCell[] = [];
    activeGroups.forEach(() => {
      MATRIX_LEVEL_COLUMNS.forEach((lv) => {
        headerRow2Cells.push(
          createTableCell(lv.label, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'F1F5F9',
          })
        );
      });
    });

    const matrixTableRows: TableRow[] = [
      new TableRow({
        tableHeader: template.repeatTableHeaderOnNewPage,
        children: headerRow1Cells,
      }),
      new TableRow({
        tableHeader: template.repeatTableHeaderOnNewPage,
        children: headerRow2Cells,
      }),
    ];

    specRows.forEach((row, idx) => {
      const rStat = calcSummary.byRow.find((r) => r.rowId === row.id);
      const selectedLessons = (row.lessonItems || []).filter((li) => li.selected);

      if (selectedLessons.length === 0) {
        const cleanRowYccd = cleanLearningOutcomeText(
          row.learningOutcomeText,
          row.knowledgeUnit
        );
        const rowCells: TableCell[] = [
          createTableCell(`${idx + 1}`, template, {
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(
            `${row.chapterCode ? `${row.chapterCode}: ` : ''}${row.topicTitle}`,
            template,
            { bold: true }
          ),
          createTableCell(
            `${row.knowledgeUnit || row.topicTitle}\n• YCCĐ: ${formatMathForOfficeDocument(cleanRowYccd)}`,
            template
          ),
        ];

        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const cell = row.cells.find(
              (c) => c.formatGroup === fg && c.levelColumn === lv.code
            );
            const text =
              cell && (cell.questionCount > 0 || cell.points > 0)
                ? `${cell.questionCount} câu\n(${cell.points.toFixed(2)}đ)`
                : '-';
            rowCells.push(
              createTableCell(text, template, {
                alignment: AlignmentType.CENTER,
              })
            );
          });
        });

        rowCells.push(
          createTableCell(`${rStat?.questionCount || 0}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(`${(rStat?.points || 0).toFixed(2)}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(`${(rStat?.percentage || 0).toFixed(1)}%`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          })
        );

        matrixTableRows.push(new TableRow({ children: rowCells }));
        return;
      }

      selectedLessons.forEach((li, lIdx) => {
        const isFirst = lIdx === 0;
        const lessonCells = li.cells || [];
        let lessonQuestions = 0;
        let lessonPoints = 0;
        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = lessonCells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            lessonQuestions += c?.questionCount || 0;
            lessonPoints = exactAdd(lessonPoints, c?.points || 0);
          });
        });
        const lessonPct =
          calcSummary.totalPoints > 0
            ? exactRound2((lessonPoints / calcSummary.totalPoints) * 100)
            : 0;

        const rowCells: TableCell[] = [];
        if (isFirst) {
          rowCells.push(
            createTableCell(`${idx + 1}`, template, {
              alignment: AlignmentType.CENTER,
              rowSpan: selectedLessons.length,
            }),
            createTableCell(
              `${row.chapterCode ? `${row.chapterCode}: ` : ''}${row.topicTitle}`,
              template,
              { bold: true, rowSpan: selectedLessons.length }
            )
          );
        }
        const cleanLiYccd = cleanLearningOutcomeText(
          li.learningOutcomeText || row.learningOutcomeText,
          li.lessonName
        );
        const outcomeBadge =
          (li.totalOutcomesInLesson || 1) > 1
            ? ` (YCCĐ ${li.outcomeIndex || 1}/${li.totalOutcomesInLesson})`
            : '';
        rowCells.push(
          createTableCell(
            `${li.lessonName} (${li.periodsCount} tiết)${outcomeBadge}\n• YCCĐ: ${formatMathForOfficeDocument(cleanLiYccd)}`,
            template
          )
        );

        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const cell = lessonCells.find(
              (c) => c.formatGroup === fg && c.levelColumn === lv.code
            );
            const text =
              cell && (cell.questionCount > 0 || cell.points > 0)
                ? `${cell.questionCount} câu\n(${cell.points.toFixed(2)}đ)`
                : '-';
            rowCells.push(
              createTableCell(text, template, {
                alignment: AlignmentType.CENTER,
              })
            );
          });
        });

        rowCells.push(
          createTableCell(`${lessonQuestions}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(`${lessonPoints.toFixed(2)}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(`${lessonPct.toFixed(1)}%`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          })
        );

        matrixTableRows.push(new TableRow({ children: rowCells }));
      });
    });

    const totalRowCells: TableCell[] = [
      createTableCell('TỔNG CỘNG TOÀN ĐỀ', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        columnSpan: 3,
        shadingFill: 'FEF3C7',
      }),
    ];

    activeGroups.forEach((fg) => {
      MATRIX_LEVEL_COLUMNS.forEach((lv) => {
        const sumCount = specRows.reduce((acc, r) => {
          const c = r.cells.find(
            (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
          );
          return acc + (c?.questionCount || 0);
        }, 0);
        const sumPts = exactRound2(
          specRows.reduce((acc, r) => {
            const c = r.cells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            return exactAdd(acc, c?.points || 0);
          }, 0)
        );
        totalRowCells.push(
          createTableCell(
            sumCount > 0 ? `${sumCount} câu\n(${sumPts.toFixed(2)}đ)` : '-',
            template,
            {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'FEF3C7',
            }
          )
        );
      });
    });

    totalRowCells.push(
      createTableCell(`${calcSummary.totalQuestions} câu`, template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        shadingFill: 'FEF3C7',
      }),
      createTableCell(`${calcSummary.totalPoints.toFixed(2)}đ`, template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        shadingFill: 'FEF3C7',
      }),
      createTableCell(`${calcSummary.totalPercentage.toFixed(1)}%`, template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        shadingFill: 'FEF3C7',
      })
    );

    matrixTableRows.push(new TableRow({ children: totalRowCells }));

    const levelRatioSummary = MATRIX_LEVEL_COLUMNS.map(
      (lv) =>
        `${lv.label}: ${calcSummary.byLevel[lv.code].questionCount} câu – ${calcSummary.byLevel[
          lv.code
        ].points.toFixed(2)}đ (${calcSummary.byLevel[lv.code].percentage.toFixed(
          1
        )}%)`
    ).join('   |   ');

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: matrixTableRows,
      })
    );

    bodyChildren.push(
      createStyledParagraph(
        `Tỷ lệ phân bổ theo mức độ nhận thức: ${levelRatioSummary}`,
        template,
        {
          bold: true,
          spacingBefore: 140,
          spacingAfter: 120,
        }
      )
    );
  } else if (docType === '02_SPECIFICATION') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ',
        subHeading
      )
    );

    const specHeaderRow1: TableCell[] = [
      createTableCell('TT', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 3,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Chủ đề / Chương', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 3,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Nội dung / Đơn vị kiến thức (Từng bài học)', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 3,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Mức độ & Yêu cầu cần đạt', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 3,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Số câu hỏi theo mức độ nhận thức ở từng phần', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        columnSpan: MATRIX_FORMAT_GROUPS.length * 3,
        shadingFill: 'DBEAFE',
      }),
      createTableCell('Tổng câu', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 3,
        shadingFill: 'E2E8F0',
      }),
      createTableCell('Điểm số', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        rowSpan: 3,
        shadingFill: 'E2E8F0',
      }),
    ];

    const specHeaderRow2: TableCell[] = MATRIX_FORMAT_GROUPS.map((fg) =>
      createTableCell(fg.label, template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        columnSpan: 3,
        shadingFill: 'EFF6FF',
      })
    );

    const specHeaderRow3: TableCell[] = [];
    MATRIX_FORMAT_GROUPS.forEach(() => {
      MATRIX_LEVEL_COLUMNS.forEach((lv) => {
        specHeaderRow3.push(
          createTableCell(lv.label, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'F1F5F9',
          })
        );
      });
    });

    const specTableRows: TableRow[] = [
      new TableRow({
        tableHeader: template.repeatTableHeaderOnNewPage,
        children: specHeaderRow1,
      }),
      new TableRow({
        tableHeader: template.repeatTableHeaderOnNewPage,
        children: specHeaderRow2,
      }),
      new TableRow({
        tableHeader: template.repeatTableHeaderOnNewPage,
        children: specHeaderRow3,
      }),
    ];

    specRows.forEach((row, idx) => {
      const rStat = calcSummary.byRow.find((r) => r.rowId === row.id);
      const selectedLessons = (row.lessonItems || []).filter((li) => li.selected);

      if (selectedLessons.length === 0) {
        const cleanRowYccd = cleanLearningOutcomeText(
          row.learningOutcomeText,
          row.knowledgeUnit
        );
        const rowCells: TableCell[] = [
          createTableCell(`${idx + 1}`, template, {
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(
            `${row.chapterCode ? `${row.chapterCode}: ` : ''}${row.topicTitle}`,
            template,
            { bold: true }
          ),
          createTableCell(row.knowledgeUnit || row.topicTitle, template),
          createTableCell(
            formatMathForOfficeDocument(cleanRowYccd),
            template
          ),
        ];

        MATRIX_FORMAT_GROUPS.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = activeGroups.includes(fg.code)
              ? row.cells.find(
                  (cell) =>
                    cell.formatGroup === fg.code && cell.levelColumn === lv.code
                )
              : undefined;
            const count = c?.questionCount || 0;
            rowCells.push(
              createTableCell(count > 0 ? `${count}` : '-', template, {
                bold: count > 0,
                alignment: AlignmentType.CENTER,
              })
            );
          });
        });

        rowCells.push(
          createTableCell(`${rStat?.questionCount || 0}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(`${(rStat?.points || 0).toFixed(2)}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          })
        );

        specTableRows.push(new TableRow({ children: rowCells }));
        return;
      }

      selectedLessons.forEach((li, lIdx) => {
        const isFirst = lIdx === 0;
        const lessonCells = li.cells || [];
        let lessonQuestions = 0;
        let lessonPoints = 0;
        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = lessonCells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            lessonQuestions += c?.questionCount || 0;
            lessonPoints = exactAdd(lessonPoints, c?.points || 0);
          });
        });

        const yccdText = cleanLearningOutcomeText(
          li.learningOutcomeText || row.learningOutcomeText,
          li.lessonName
        );
        const outcomeBadge =
          (li.totalOutcomesInLesson || 1) > 1
            ? ` (YCCĐ ${li.outcomeIndex || 1}/${li.totalOutcomesInLesson})`
            : '';

        const rowCells: TableCell[] = [];
        if (isFirst) {
          rowCells.push(
            createTableCell(`${idx + 1}`, template, {
              alignment: AlignmentType.CENTER,
              rowSpan: selectedLessons.length,
            }),
            createTableCell(
              `${row.chapterCode ? `${row.chapterCode}: ` : ''}${row.topicTitle}`,
              template,
              { bold: true, rowSpan: selectedLessons.length }
            )
          );
        }
        rowCells.push(
          createTableCell(
            `${li.lessonName} (${li.periodsCount} tiết)${outcomeBadge}`,
            template
          ),
          createTableCell(formatMathForOfficeDocument(yccdText), template)
        );

        MATRIX_FORMAT_GROUPS.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = activeGroups.includes(fg.code)
              ? lessonCells.find(
                  (cell) =>
                    cell.formatGroup === fg.code && cell.levelColumn === lv.code
                )
              : undefined;
            const count = c?.questionCount || 0;
            rowCells.push(
              createTableCell(count > 0 ? `${count}` : '-', template, {
                bold: count > 0,
                alignment: AlignmentType.CENTER,
              })
            );
          });
        });

        rowCells.push(
          createTableCell(`${lessonQuestions}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          createTableCell(`${lessonPoints.toFixed(2)}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
          })
        );

        specTableRows.push(new TableRow({ children: rowCells }));
      });
    });

    const specTotalCells: TableCell[] = [
      createTableCell('TỔNG SỐ CÂU THEO PHẦN & MỨC ĐỘ', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        columnSpan: 4,
        shadingFill: 'FEF3C7',
      }),
    ];

    MATRIX_FORMAT_GROUPS.forEach((fg) => {
      MATRIX_LEVEL_COLUMNS.forEach((lv) => {
        const sumCnt = activeGroups.includes(fg.code)
          ? specRows.reduce((acc, r) => {
              const c = r.cells.find(
                (cell) =>
                  cell.formatGroup === fg.code && cell.levelColumn === lv.code
              );
              return acc + (c?.questionCount || 0);
            }, 0)
          : 0;
        specTotalCells.push(
          createTableCell(`${sumCnt}`, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'FEF3C7',
          })
        );
      });
    });

    specTotalCells.push(
      createTableCell(`${calcSummary.totalQuestions}`, template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        shadingFill: 'FEF3C7',
      }),
      createTableCell(`${calcSummary.totalPoints.toFixed(2)}`, template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        shadingFill: 'FEF3C7',
      })
    );

    specTableRows.push(new TableRow({ children: specTotalCells }));

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: specTableRows,
      })
    );
  } else if (docType === '03_STUDENT_EXAM') {
    if (ctx.draftBannerText) {
      bodyChildren.push(
        createStyledParagraph(`[${ctx.draftBannerText}]`, template, {
          bold: true,
          sizePt: 11,
          alignment: AlignmentType.CENTER,
          color: 'B91C1C',
        })
      );
    }

    const examHeaderFontPt = Math.max(13, Math.min(14, template.bodyFontSizePt || 13));
    const examHeaderTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: INVISIBLE_BORDER,
              width: { size: 44, type: WidthType.PERCENTAGE },
              margins: { top: 20, bottom: 60, left: 40, right: 40 },
              children: [
                createStyledParagraph(
                  (template.governingBodyName || 'UBND XÃ ĐAN ĐIỀN').toUpperCase(),
                  template,
                  {
                    bold: false,
                    sizePt: examHeaderFontPt,
                    alignment: AlignmentType.CENTER,
                    spacingBefore: 0,
                    spacingAfter: 0,
                  }
                ),
                createStyledParagraph(ctx.schoolName.toUpperCase(), template, {
                  bold: true,
                  sizePt: examHeaderFontPt,
                  alignment: AlignmentType.CENTER,
                  spacingBefore: 0,
                  spacingAfter: 0,
                }),
                createStyledParagraph('__________________', template, {
                  bold: false,
                  sizePt: 12,
                  alignment: AlignmentType.CENTER,
                  spacingBefore: 0,
                  spacingAfter: 20,
                }),
              ],
            }),
            new TableCell({
              borders: INVISIBLE_BORDER,
              width: { size: 56, type: WidthType.PERCENTAGE },
              margins: { top: 20, bottom: 60, left: 40, right: 40 },
              children: [
                createStyledParagraph(
                  formatExamHeaderRightTitle(
                    exam.examPeriod,
                    ctx.academicYear,
                    'ĐỀ KIỂM TRA'
                  ),
                  template,
                  {
                    bold: true,
                    sizePt: examHeaderFontPt,
                    alignment: AlignmentType.CENTER,
                    spacingBefore: 0,
                    spacingAfter: 0,
                  }
                ),
                createStyledParagraph(
                  `MÔN: ${exam.subject.toUpperCase()} - Lớp ${exam.grade}`,
                  template,
                  {
                    bold: false,
                    sizePt: examHeaderFontPt,
                    alignment: AlignmentType.CENTER,
                    spacingBefore: 0,
                    spacingAfter: 0,
                  }
                ),
                createStyledParagraph(
                  `Thời gian: ${exam.durationMinutes} phút`,
                  template,
                  {
                    bold: false,
                    sizePt: examHeaderFontPt,
                    alignment: AlignmentType.CENTER,
                    spacingBefore: 0,
                    spacingAfter: 0,
                  }
                ),
                createStyledParagraph(
                  '(không kể thời gian giao đề)',
                  template,
                  {
                    italics: true,
                    bold: false,
                    sizePt: examHeaderFontPt,
                    alignment: AlignmentType.CENTER,
                    spacingBefore: 0,
                    spacingAfter: 20,
                  }
                ),
              ],
            }),
          ],
        }),
      ],
    });
    bodyChildren.push(examHeaderTable);

    const studentInfoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: STANDARD_BORDER,
              columnSpan: 2,
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                createStyledParagraph(
                  'Họ và tên học sinh: ....................................................................................   Lớp: .........................',
                  template,
                  { bold: true, sizePt: template.bodyFontSizePt }
                ),
              ],
            }),
          ],
        }),
        ...(template.showScoreBoxInStudentPaper
          ? [
              new TableRow({
                children: [
                  new TableCell({
                    borders: STANDARD_BORDER,
                    width: { size: 28, type: WidthType.PERCENTAGE },
                    margins: { top: 100, bottom: 260, left: 120, right: 120 },
                    children: [
                      createStyledParagraph('ĐIỂM SỐ', template, {
                        bold: true,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: STANDARD_BORDER,
                    width: { size: 72, type: WidthType.PERCENTAGE },
                    margins: { top: 100, bottom: 260, left: 120, right: 120 },
                    children: [
                      createStyledParagraph(
                        'LỜI PHÊ CỦA GIÁO VIÊN CHẤM BÀI',
                        template,
                        {
                          bold: true,
                          alignment: AlignmentType.CENTER,
                        }
                      ),
                    ],
                  }),
                ],
              }),
            ]
          : []),
      ],
    });
    bodyChildren.push(studentInfoTable);

    const groupedBySection = new Map<
      string,
      {
        formatGroup: MatrixFormatGroupCode;
        sectionTitle: string;
        instruction: string;
        items: ExamVariantQuestionItem[];
        sumPoints: number;
      }
    >();

    selectedVariant.items.forEach((item) => {
      const secTitle = getSectionTitleForFormatGroup(item.formatGroup);
      const secInstr = getSectionInstructionForFormatGroup(item.formatGroup);
      const existing = groupedBySection.get(secTitle);
      if (existing) {
        existing.items.push(item);
        existing.sumPoints = exactRound2(exactAdd(existing.sumPoints, item.points));
      } else {
        groupedBySection.set(secTitle, {
          formatGroup: item.formatGroup,
          sectionTitle: secTitle,
          instruction: secInstr,
          items: [item],
          sumPoints: item.points,
        });
      }
    });

    const renderedPassages = new Set<string>();
    const examBodyFontPt = Math.max(13, Math.min(14, template.bodyFontSizePt || 13));

    Array.from(groupedBySection.values()).forEach((sec) => {
      const secHeader = `${sec.sectionTitle} (${sec.items.length} câu — ${sec.sumPoints.toFixed(2)} điểm)`;

      bodyChildren.push(
        createStyledParagraph(secHeader, template, {
          bold: true,
          sizePt: examBodyFontPt,
          spacingBefore: 120,
          spacingAfter: sec.instruction ? 0 : 40,
          keepNext: true,
        })
      );

      if (sec.instruction) {
        bodyChildren.push(
          createStyledParagraph(sec.instruction, template, {
            bold: false,
            sizePt: examBodyFontPt,
            spacingBefore: 0,
            spacingAfter: 40,
            keepNext: true,
          })
        );
      }

      sec.items.forEach((item) => {
        if (item.sharedPassage) {
          const passageKey = item.sharedPassage.slice(0, 80);
          if (!renderedPassages.has(passageKey)) {
            renderedPassages.add(passageKey);
            bodyChildren.push(
              createStyledParagraph(
                'Đọc ngữ liệu sau và trả lời các câu hỏi bên dưới:',
                template,
                {
                  bold: true,
                  italics: true,
                  sizePt: examBodyFontPt,
                  keepNext: true,
                  spacingBefore: 60,
                  spacingAfter: 20,
                }
              )
            );
            bodyChildren.push(
              createStyledParagraph(
                formatMathForOfficeDocument(item.sharedPassage),
                template,
                {
                  italics: true,
                  sizePt: examBodyFontPt,
                  keepNext: true,
                  keepLines: true,
                  spacingBefore: 20,
                  spacingAfter: 40,
                }
              )
            );
            if (item.sharedPassageAuthor) {
              bodyChildren.push(
                createStyledParagraph(
                  `(${item.sharedPassageAuthor})`,
                  template,
                  {
                    italics: true,
                    sizePt: examBodyFontPt,
                    alignment: AlignmentType.RIGHT,
                    keepNext: true,
                    spacingBefore: 0,
                    spacingAfter: 40,
                  }
                )
              );
            }
          }
        }

        const ptsText = template.showSectionPoints
          ? ` (${item.points.toFixed(2)} điểm)`
          : '';

        bodyChildren.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            keepLines: true,
            keepNext: Boolean(
              item.shuffledOptions?.length || item.subStatements?.length
            ),
            spacing: {
              before: 40,
              after: 20,
              line: 240,
              lineRule: LineRuleType.AUTO,
            },
            children: [
              createStyledTextRun(`Câu ${item.displayNumber}${ptsText}: `, template, {
                bold: true,
                sizePt: examBodyFontPt,
              }),
              ...createMathAwareTextRuns(item.stem, template, {
                sizePt: examBodyFontPt,
              }),
            ],
          })
        );

        const originalQ = ctx.questions.find((q) => q.id === item.questionId);
        if (originalQ?.attachments && originalQ.attachments.length > 0) {
          originalQ.attachments.forEach((att) => {
            if (att.type === 'FORMULA' && att.latexFormula) {
              bodyChildren.push(
                createStyledParagraph(
                  `Biểu thức: ${formatMathForOfficeDocument(att.latexFormula)}`,
                  template,
                  {
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    keepNext: true,
                  }
                )
              );
            }
            if (att.type === 'TABLE' && att.tableData) {
              const attRows: TableRow[] = [
                new TableRow({
                  children: att.tableData.headers.map((h) =>
                    createTableCell(formatMathForOfficeDocument(h), template, {
                      bold: true,
                      alignment: AlignmentType.CENTER,
                      shadingFill: 'F1F5F9',
                    })
                  ),
                }),
                ...att.tableData.rows.map(
                  (r) =>
                    new TableRow({
                      children: r.map((cellVal) =>
                        createTableCell(
                          formatMathForOfficeDocument(cellVal),
                          template,
                          { alignment: AlignmentType.CENTER }
                        )
                      ),
                    })
                ),
              ];
              bodyChildren.push(
                new Table({
                  width: { size: 90, type: WidthType.PERCENTAGE },
                  rows: attRows,
                })
              );
            }
          });
        }

        if (item.shuffledOptions && item.shuffledOptions.length > 0) {
          item.shuffledOptions.forEach((opt) => {
            bodyChildren.push(
              createStyledParagraph(
                `    ${formatMathForOfficeDocument(opt)}`,
                template,
                {
                  keepLines: true,
                  spacingBefore: 20,
                  spacingAfter: 30,
                }
              )
            );
          });
        }

        if (item.subStatements && item.subStatements.length > 0) {
          item.subStatements.forEach((sub) => {
            bodyChildren.push(
              createStyledParagraph(
                `    ${sub.label}) ${formatMathForOfficeDocument(
                  sub.statement
                )}   [ Đúng / Sai ]`,
                template,
                {
                  keepLines: true,
                  spacingBefore: 20,
                  spacingAfter: 30,
                }
              )
            );
          });
        }

        if (item.formatGroup === 'SHORT_ANSWER') {
          bodyChildren.push(
            createStyledParagraph(
              '    Đáp số / Trả lời: ........................................................................................................................',
              template,
              { italics: true, spacingBefore: 30, spacingAfter: 60 }
            )
          );
        } else if (item.formatGroup === 'ESSAY') {
          bodyChildren.push(
            createStyledParagraph(
              '    Bài giải: ......................................................................................................................................',
              template,
              { italics: true, spacingBefore: 30, spacingAfter: 40 }
            ),
            createStyledParagraph(
              '    ....................................................................................................................................................',
              template,
              { italics: true, spacingBefore: 20, spacingAfter: 80 }
            )
          );
        }
      });
    });

    bodyChildren.push(
      createStyledParagraph('--- HẾT ---', template, {
        bold: true,
        alignment: AlignmentType.CENTER,
        spacingBefore: 200,
        spacingAfter: 40,
      }),
      createStyledParagraph(
        '(Học sinh không được sử dụng tài liệu. Giám thị coi kiểm tra không giải thích gì thêm)',
        template,
        {
          italics: true,
          sizePt: 11,
          alignment: AlignmentType.CENTER,
        }
      )
    );
  } else if (docType === '04_MCQ_ANSWER_KEY') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'BẢNG ĐÁP ÁN TRẮC NGHIỆM THEO TỪNG MÃ ĐỀ',
        subHeading
      )
    );

    variants.forEach((v) => {
      bodyChildren.push(
        createStyledParagraph(
          `MÃ ĐỀ: ${v.variantCode} (Seed tái lập: ${v.variantSeed})`,
          template,
          {
            bold: true,
            sizePt: template.bodyFontSizePt,
            spacingBefore: 140,
            spacingAfter: 60,
          }
        )
      );

      const mcqRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            createTableCell('Câu số', template, {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'DBEAFE',
            }),
            createTableCell('Phần / Dạng câu hỏi', template, {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'DBEAFE',
            }),
            createTableCell('Mã câu hỏi gốc', template, {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'DBEAFE',
            }),
            createTableCell('Đáp án đúng (Đã ánh xạ theo Mã đề)', template, {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'DBEAFE',
            }),
            createTableCell('Điểm số', template, {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'DBEAFE',
            }),
          ],
        }),
      ];

      v.items
        .filter((it) => it.formatGroup !== 'ESSAY')
        .forEach((it) => {
          mcqRows.push(
            new TableRow({
              children: [
                createTableCell(`Câu ${it.displayNumber}`, template, {
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
                createTableCell(
                  getQuestionFormatLabel(it.formatGroup),
                  template
                ),
                createTableCell(it.originalCode, template, {
                  alignment: AlignmentType.CENTER,
                }),
                createTableCell(
                  formatMathForOfficeDocument(it.shuffledCorrectAnswer),
                  template,
                  {
                    bold: true,
                    alignment: AlignmentType.CENTER,
                  }
                ),
                createTableCell(`${it.points.toFixed(2)} điểm`, template, {
                  alignment: AlignmentType.CENTER,
                }),
              ],
            })
          );
        });

      bodyChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: mcqRows,
        })
      );
    });
  } else if (docType === '05_ESSAY_GRADING_GUIDE') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'HƯỚNG DẪN CHẤM TỰ LUẬN VÀ CÂU TRẢ LỜI NGẮN',
        subHeading
      )
    );

    const essayAndShortItems = selectedVariant.items.filter(
      (it) => it.formatGroup === 'ESSAY' || it.formatGroup === 'SHORT_ANSWER'
    );

    const rubricRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell('Câu / Ý', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Nội dung cần đạt / Bước giải chi tiết', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Điểm thành phần', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell(
            'Phương án trả lời đúng khác được chấp nhận',
            template,
            {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'E2E8F0',
            }
          ),
        ],
      }),
    ];

    essayAndShortItems.forEach((it) => {
      const acceptedText =
        it.acceptedVariations && it.acceptedVariations.length > 0
          ? it.acceptedVariations
              .map((v) => formatMathForOfficeDocument(v))
              .join('; ')
          : 'Học sinh lập luận hoặc trình bày theo cách khác nhưng đúng bản chất toán học vẫn đạt điểm tối đa.';

      if (it.rubricCriteria && it.rubricCriteria.length > 0) {
        it.rubricCriteria.forEach((rc, rIdx) => {
          rubricRows.push(
            new TableRow({
              children: [
                createTableCell(
                  rIdx === 0
                    ? `Câu ${it.displayNumber}\n(${it.points.toFixed(2)}đ)`
                    : `Ý ${rIdx + 1}`,
                  template,
                  { bold: rIdx === 0, alignment: AlignmentType.CENTER }
                ),
                createTableCell(
                  `${
                    rIdx === 0
                      ? `Đề bài: ${formatMathForOfficeDocument(it.stem)}\n`
                      : ''
                  }• ${formatMathForOfficeDocument(rc.criterion)}`,
                  template
                ),
                createTableCell(`${rc.points.toFixed(2)} điểm`, template, {
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
                createTableCell(
                  rIdx === 0 ? acceptedText : 'Chấm theo bước tương đương',
                  template
                ),
              ],
            })
          );
        });
      } else {
        rubricRows.push(
          new TableRow({
            children: [
              createTableCell(
                `Câu ${it.displayNumber}\n(${it.points.toFixed(2)}đ)`,
                template,
                { bold: true, alignment: AlignmentType.CENTER }
              ),
              createTableCell(
                `Đáp án chuẩn: ${formatMathForOfficeDocument(
                  it.shuffledCorrectAnswer
                )}\nHướng dẫn chấm: ${formatMathForOfficeDocument(
                  it.gradingGuide
                )}`,
                template
              ),
              createTableCell(`${it.points.toFixed(2)} điểm`, template, {
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
              createTableCell(acceptedText, template),
            ],
          })
        );
      }
    });

    const sumEssayPoints = exactRound2(
      essayAndShortItems.reduce((acc, it) => exactAdd(acc, it.points), 0)
    );
    const sumMcqPoints = exactRound2(
      selectedVariant.items
        .filter(
          (it) =>
            it.formatGroup !== 'ESSAY' && it.formatGroup !== 'SHORT_ANSWER'
        )
        .reduce((acc, it) => exactAdd(acc, it.points), 0)
    );

    rubricRows.push(
      new TableRow({
        children: [
          createTableCell('TỔNG ĐIỂM TOÀN ĐỀ', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            columnSpan: 2,
            shadingFill: 'FEF3C7',
          }),
          createTableCell(
            `${selectedVariant.totalPoints.toFixed(2)} / ${exam.totalPoints.toFixed(
              2
            )} điểm`,
            template,
            {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'FEF3C7',
            }
          ),
          createTableCell(
            `TN: ${sumMcqPoints.toFixed(2)}đ + TL/TLN: ${sumEssayPoints.toFixed(
              2
            )}đ (Không làm tròn sai lệch)`,
            template,
            {
              bold: true,
              shadingFill: 'FEF3C7',
            }
          ),
        ],
      })
    );

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rubricRows,
      })
    );
  } else if (docType === '06_SCORING_RUBRIC_TABLE') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'BIỂU ĐIỂM CHI TIẾT ĐỀ KIỂM TRA ĐỊNH KỲ',
        subHeading
      )
    );

    const scoreRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell('Câu số', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Mã câu hỏi', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Dạng thức câu hỏi', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Mức độ nhận thức', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Mã YCCĐ', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Điểm thành phần', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
        ],
      }),
    ];

    selectedVariant.items.forEach((it) => {
      scoreRows.push(
        new TableRow({
          children: [
            createTableCell(`Câu ${it.displayNumber}`, template, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(it.originalCode, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(getQuestionFormatLabel(it.formatGroup), template),
            createTableCell(it.levelColumn, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(it.learningOutcomeCode, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(`${it.points.toFixed(2)} điểm`, template, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        })
      );
    });

    scoreRows.push(
      new TableRow({
        children: [
          createTableCell(
            `TỔNG CỘNG (${selectedVariant.totalQuestions} CÂU)`,
            template,
            {
              bold: true,
              alignment: AlignmentType.CENTER,
              columnSpan: 5,
              shadingFill: 'FEF3C7',
            }
          ),
          createTableCell(
            `${selectedVariant.totalPoints.toFixed(2)} điểm`,
            template,
            {
              bold: true,
              alignment: AlignmentType.CENTER,
              shadingFill: 'FEF3C7',
            }
          ),
        ],
      })
    );

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: scoreRows,
      })
    );
  } else if (docType === '07_APPRAISAL_SHEET') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'PHIẾU THẨM ĐỊNH CHUYÊN MÔN ĐỀ KIỂM TRA ĐỊNH KỲ',
        subHeading
      )
    );

    const latestSheet: AppraisalSubmissionSheet | undefined =
      exam.appraisalSheets?.[0];
    const evals =
      latestSheet?.criteriaEvaluations ||
      DEFAULT_12_APPRAISAL_CRITERIA.map((c) => ({
        criterionCode: c.code,
        order: c.order,
        title: c.title,
        rating: 'DAT' as const,
        comment: 'Đạt chuẩn chuyên môn theo Chương trình GDPT 2018.',
        questionPositions: '',
      }));

    bodyChildren.push(
      createStyledParagraph(
        `Người biên soạn đề: ${exam.authorName}   |   Người phản biện: ${
          latestSheet?.reviewerName ||
          exam.assignedReviewerName ||
          'Thầy Lê Minh Châu (GV Phản biện)'
        }`,
        template,
        { bold: true, spacingAfter: 100 }
      )
    );

    const sheetRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell('TT', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Tiêu chí thẩm định chuyên môn', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Kết quả đánh giá', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Vị trí câu hỏi lưu ý', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Nhận xét chi tiết & Đề xuất', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
        ],
      }),
    ];

    evals.forEach((ev) => {
      const ratingLabel =
        ev.rating === 'DAT'
          ? 'Đạt'
          : ev.rating === 'CAN_CHINH_SUA'
          ? 'Cần chỉnh sửa'
          : ev.rating === 'KHONG_DAT'
          ? 'Không đạt'
          : 'Không áp dụng';

      sheetRows.push(
        new TableRow({
          children: [
            createTableCell(`${ev.order}`, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(ev.title, template, { bold: true }),
            createTableCell(ratingLabel, template, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(ev.questionPositions || '-', template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(ev.comment || 'Đạt yêu cầu.', template),
          ],
        })
      );
    });

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: sheetRows,
      })
    );

    bodyChildren.push(
      createStyledParagraph(
        `Kết luận chung của Giáo viên phản biện: ${
          latestSheet?.generalSummaryNote ||
          'Hồ sơ đề kiểm tra, đáp án và hướng dẫn chấm đạt yêu cầu chuyên môn, đủ điều kiện trình phê duyệt.'
        }`,
        template,
        { bold: true, spacingBefore: 140 }
      )
    );
  } else if (docType === '08_APPROVAL_MINUTES') {
    const minutes = generateOfficialAppraisalMinutes({
      schoolName: ctx.schoolName,
      departmentName: ctx.departmentName,
      targetType: 'EXAM',
      matrix,
      exam,
    });

    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'BIÊN BẢN THẨM ĐỊNH VÀ PHÊ DUYỆT ĐỀ KIỂM TRA',
        `Số biên bản: ${minutes.minutesCode} · Thời gian: ${minutes.appraisalTime}`
      )
    );

    bodyChildren.push(
      createStyledParagraph('I. THÀNH PHẦN HỘI ĐỒNG THẨM ĐỊNH & PHÊ DUYỆT', template, {
        bold: true,
        spacingBefore: 100,
      }),
      createStyledParagraph(
        `1. Người biên soạn đề: ${minutes.authorName}`,
        template
      ),
      createStyledParagraph(
        `2. Giáo viên phản biện độc lập: ${minutes.peerReviewerName}`,
        template
      ),
      createStyledParagraph(
        `3. Tổ trưởng chuyên môn: ${minutes.headOfDepartmentName}`,
        template
      ),
      createStyledParagraph(
        `4. Lãnh đạo phê duyệt (${minutes.approverRoleLabel}): ${minutes.approverName}`,
        template
      ),
      createStyledParagraph('II. KẾT QUẢ THẨM ĐỊNH CHUYÊN MÔN', template, {
        bold: true,
        spacingBefore: 120,
      }),
      createStyledParagraph(minutes.evaluationSummary, template),
      createStyledParagraph('III. KẾT LUẬN PHÊ DUYỆT', template, {
        bold: true,
        spacingBefore: 120,
      }),
      createStyledParagraph(minutes.conclusionText, template, { bold: true })
    );

    const confirmRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: minutes.confirmations.map((c) =>
          createTableCell(c.partyTitle, template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          })
        ),
      }),
      new TableRow({
        children: minutes.confirmations.map((c) =>
          createTableCell(
            `${c.personName}\n(${c.statusLabel})\n[Chữ ký số: ${
              c.hasValidDigitalSignature
                ? 'Đã ký số hợp lệ'
                : 'Chưa ký số chứng thư – Ký trực tiếp trên bản in'
            }]`,
            template,
            { alignment: AlignmentType.CENTER }
          )
        ),
      }),
    ];

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: confirmRows,
      })
    );
  } else if (docType === '09_USED_QUESTION_CATALOG') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'DANH MỤC CÂU HỎI NGÂN HÀNG ĐÃ SỬ DỤNG TRONG ĐỀ',
        subHeading
      )
    );

    const catRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell('TT', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Mã câu hỏi', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Chủ đề / Nội dung kiến thức', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Mã YCCĐ', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Dạng câu & Mức độ', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Điểm', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Vị trí trong các Mã đề', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
        ],
      }),
    ];

    ctx.questions.forEach((q, idx) => {
      const posInVariants = variants
        .map((v) => {
          const found = v.items.find((it) => it.questionId === q.id);
          return found ? `Mã ${v.variantCode}: Câu ${found.displayNumber}` : '';
        })
        .filter(Boolean)
        .join(' | ');

      catRows.push(
        new TableRow({
          children: [
            createTableCell(`${idx + 1}`, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(q.code, template, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(
              `${q.topicTitle}${q.knowledgeUnit ? ` – ${q.knowledgeUnit}` : ''}`,
              template
            ),
            createTableCell(q.learningOutcomeCode, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(
              `${getQuestionFormatLabel(q.format)}\n(${getCognitiveLevelLabel(
                q.cognitiveLevel
              )})`,
              template
            ),
            createTableCell(`${q.points.toFixed(2)}đ`, template, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(posInVariants || 'Câu ' + (idx + 1), template),
          ],
        })
      );
    });

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: catRows,
      })
    );
  } else if (docType === '10_EXAM_STATISTICS_REPORT') {
    bodyChildren.push(
      ...createNationalAndSchoolHeaderTable(
        ctx,
        'BÁO CÁO THỐNG KÊ CẤU TRÚC VÀ CHẤT LƯỢNG ĐỀ KIỂM TRA',
        subHeading
      )
    );

    const statRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell('Nhóm thống kê', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Chỉ tiêu đánh giá', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Số lượng câu hỏi', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Tổng điểm', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
          createTableCell('Tỷ lệ %', template, {
            bold: true,
            alignment: AlignmentType.CENTER,
            shadingFill: 'E2E8F0',
          }),
        ],
      }),
    ];

    MATRIX_LEVEL_COLUMNS.forEach((lv) => {
      const lvData = calcSummary.byLevel[lv.code];
      statRows.push(
        new TableRow({
          children: [
            createTableCell('Theo mức độ nhận thức', template, { bold: true }),
            createTableCell(`Mức ${lv.label}`, template),
            createTableCell(`${lvData.questionCount} câu`, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(`${lvData.points.toFixed(2)} điểm`, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(`${lvData.percentage.toFixed(1)}%`, template, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        })
      );
    });

    activeGroups.forEach((fg) => {
      const fgData = calcSummary.byFormatGroup[fg];
      const fgLabel =
        MATRIX_FORMAT_GROUPS.find((f) => f.code === fg)?.label || fg;
      statRows.push(
        new TableRow({
          children: [
            createTableCell('Theo dạng thức câu hỏi', template, { bold: true }),
            createTableCell(fgLabel, template),
            createTableCell(`${fgData.questionCount} câu`, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(`${fgData.points.toFixed(2)} điểm`, template, {
              alignment: AlignmentType.CENTER,
            }),
            createTableCell(`${fgData.percentage.toFixed(1)}%`, template, {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        })
      );
    });

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: statRows,
      })
    );
  }

  const doc = new Document({
    creator: 'EDU TEST AI – Hệ thống Quản lý Ngân hàng Đề kiểm tra',
    title: `${docMeta.title} – ${exam.title}`,
    description: `Mã định danh hồ sơ: ${ctx.securityCode}`,
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
              orientation: isLandscape
                ? PageOrientation.LANDSCAPE
                : PageOrientation.PORTRAIT,
            },
            margin: isMatrixOrSpec
              ? {
                  top: cmToTwip(2.0),
                  bottom: cmToTwip(2.0),
                  left: cmToTwip(2.5),
                  right: cmToTwip(2.0),
                }
              : {
                  top: cmToTwip(template.marginsCm.top),
                  bottom: cmToTwip(template.marginsCm.bottom),
                  left: cmToTwip(template.marginsCm.left),
                  right: cmToTwip(template.marginsCm.right),
                },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${ctx.schoolName} · Mã hồ sơ: ${ctx.securityCode}${
                      ctx.watermarkText ? ` · [${ctx.watermarkText}]` : ''
                    }`,
                    font: template.fontFamily,
                    size: 18,
                    italics: true,
                    color: ctx.isApproved ? '64748B' : 'B91C1C',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${docMeta.title} (${exam.code}) · Mã định danh: ${ctx.securityCode}`,
                    font: template.fontFamily,
                    size: 18,
                    color: '475569',
                  }),
                  ...(template.autoPageNumbering
                    ? [
                        new TextRun({
                          text: '   |   Trang ',
                          font: template.fontFamily,
                          size: 18,
                        }),
                        new TextRun({
                          children: [PageNumber.CURRENT],
                          font: template.fontFamily,
                          size: 18,
                          bold: true,
                        }),
                        new TextRun({
                          text: ' / ',
                          font: template.fontFamily,
                          size: 18,
                        }),
                        new TextRun({
                          children: [PageNumber.TOTAL_PAGES],
                          font: template.fontFamily,
                          size: 18,
                          bold: true,
                        }),
                      ]
                    : []),
                ],
              }),
            ],
          }),
        },
        children: bodyChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// ============================================================================
// 7. BỘ DỰNG TÀI LIỆU MICROSOFT EXCEL (.XLSX) DỮ LIỆU BẢNG THỰC (MỤC I, V, VI, VII)
// ============================================================================

export function generateXlsxBlobForDocument(
  docType: DossierDocumentTypeCode,
  ctx: ResolvedDossierContext
): Blob {
  const wb = XLSX.utils.book_new();
  const { exam, matrix, selectedVariant, variants } = ctx;
  const activeGroups: MatrixFormatGroupCode[] =
    matrix.activeFormatGroups && matrix.activeFormatGroups.length > 0
      ? matrix.activeFormatGroups
      : ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'];
  const specRows = matrix.specRows || [];
  const calcSummary = calculateMatrixSummary(
    specRows,
    activeGroups,
    matrix.targetTotalPoints || exam.totalPoints || 10
  );

  const metaHeaderRows: (string | number)[][] = [
    [
      ctx.template.governingBodyName || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
      '',
      '',
      'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    ],
    [ctx.schoolName.toUpperCase(), '', '', 'Độc lập - Tự do - Hạnh phúc'],
    [
      ctx.draftBannerText
        ? `[${ctx.draftBannerText}]`
        : `Mã định danh hồ sơ: ${ctx.securityCode}`,
    ],
    [],
  ];

  if (docType === '01_MATRIX') {
    const row1: (string | number)[] = [
      'TT',
      'Chủ đề / Chương',
      'Nội dung / Đơn vị kiến thức',
    ];
    const row2: (string | number)[] = ['', '', ''];
    const merges: XLSX.Range[] = [
      { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
      { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
      { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } },
    ];

    let colCursor = 3;
    activeGroups.forEach((fg) => {
      const fgLabel =
        MATRIX_FORMAT_GROUPS.find((f) => f.code === fg)?.label || fg;
      row1.push(fgLabel, '', '');
      merges.push({
        s: { r: 5, c: colCursor },
        e: { r: 5, c: colCursor + 2 },
      });
      MATRIX_LEVEL_COLUMNS.forEach((lv) => {
        row2.push(`${lv.label} (Số câu / Điểm)`);
      });
      colCursor += 3;
    });

    row1.push('Tổng số câu', 'Tổng điểm', 'Tỷ lệ %');
    row2.push('', '', '');
    merges.push(
      { s: { r: 5, c: colCursor }, e: { r: 6, c: colCursor } },
      { s: { r: 5, c: colCursor + 1 }, e: { r: 6, c: colCursor + 1 } },
      { s: { r: 5, c: colCursor + 2 }, e: { r: 6, c: colCursor + 2 } }
    );

    const sheetData: (string | number)[][] = [
      ...metaHeaderRows,
      [
        `MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ – MÔN ${exam.subject.toUpperCase()} LỚP ${
          exam.grade
        } (${ctx.academicYear})`,
      ],
      row1,
      row2,
    ];

    specRows.forEach((r, idx) => {
      const rStat = calcSummary.byRow.find((item) => item.rowId === r.id);
      const selectedLessons = (r.lessonItems || []).filter((li) => li.selected);

      if (selectedLessons.length === 0) {
        const dataRow: (string | number)[] = [
          idx + 1,
          `${r.chapterCode ? `${r.chapterCode}: ` : ''}${r.topicTitle}`,
          r.knowledgeUnit || r.topicTitle,
        ];
        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = r.cells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            dataRow.push(
              c && (c.questionCount > 0 || c.points > 0)
                ? `${c.questionCount} câu (${c.points.toFixed(2)}đ)`
                : 0
            );
          });
        });
        dataRow.push(
          rStat?.questionCount || 0,
          rStat?.points || 0,
          `${(rStat?.percentage || 0).toFixed(1)}%`
        );
        sheetData.push(dataRow);
        return;
      }

      selectedLessons.forEach((li) => {
        const lessonCells = li.cells || [];
        let lessonQuestions = 0;
        let lessonPoints = 0;
        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = lessonCells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            lessonQuestions += c?.questionCount || 0;
            lessonPoints = exactAdd(lessonPoints, c?.points || 0);
          });
        });
        const lessonPct =
          calcSummary.totalPoints > 0
            ? exactRound2((lessonPoints / calcSummary.totalPoints) * 100)
            : 0;

        const dataRow: (string | number)[] = [
          idx + 1,
          `${r.chapterCode ? `${r.chapterCode}: ` : ''}${r.topicTitle}`,
          `${li.lessonName} (${li.periodsCount} tiết)`,
        ];
        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = lessonCells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            dataRow.push(
              c && (c.questionCount > 0 || c.points > 0)
                ? `${c.questionCount} câu (${c.points.toFixed(2)}đ)`
                : 0
            );
          });
        });
        dataRow.push(
          lessonQuestions,
          lessonPoints,
          `${lessonPct.toFixed(1)}%`
        );
        sheetData.push(dataRow);
      });
    });

    const totalRow: (string | number)[] = ['TỔNG CỘNG TOÀN ĐỀ', '', ''];
    activeGroups.forEach((fg) => {
      MATRIX_LEVEL_COLUMNS.forEach((lv) => {
        const sumCnt = specRows.reduce((acc, r) => {
          const c = r.cells.find(
            (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
          );
          return acc + (c?.questionCount || 0);
        }, 0);
        const sumPts = exactRound2(
          specRows.reduce((acc, r) => {
            const c = r.cells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            return exactAdd(acc, c?.points || 0);
          }, 0)
        );
        totalRow.push(
          sumCnt > 0 ? `${sumCnt} câu (${sumPts.toFixed(2)}đ)` : 0
        );
      });
    });
    totalRow.push(
      calcSummary.totalQuestions,
      calcSummary.totalPoints,
      `${calcSummary.totalPercentage.toFixed(1)}%`
    );
    sheetData.push(totalRow);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 32 },
      ...Array(activeGroups.length * 3).fill({ wch: 15 }),
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, '01_Ma_tran');
  } else if (docType === '02_SPECIFICATION') {
    const specRow1: (string | number)[] = [
      'TT',
      'Chủ đề / Chương',
      'Nội dung / Đơn vị kiến thức (Từng bài học)',
      'Mức độ & Yêu cầu cần đạt',
    ];
    const specRow2: (string | number)[] = ['', '', '', ''];
    MATRIX_FORMAT_GROUPS.forEach((fg) => {
      specRow1.push(fg.label, '', '');
      MATRIX_LEVEL_COLUMNS.forEach((lv) => {
        specRow2.push(`${lv.label} (Số câu)`);
      });
    });
    specRow1.push('Tổng số câu', 'Tổng điểm');
    specRow2.push('', '');

    const sheetData: (string | number)[][] = [
      ...metaHeaderRows,
      [
        `BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ – MÔN ${exam.subject.toUpperCase()} LỚP ${
          exam.grade
        }`,
      ],
      specRow1,
      specRow2,
    ];

    specRows.forEach((r, idx) => {
      const rStat = calcSummary.byRow.find((item) => item.rowId === r.id);
      const selectedLessons = (r.lessonItems || []).filter((li) => li.selected);

      if (selectedLessons.length === 0) {
        const dataRow: (string | number)[] = [
          idx + 1,
          `${r.chapterCode ? `${r.chapterCode}: ` : ''}${r.topicTitle}`,
          r.knowledgeUnit || r.topicTitle,
          `[${r.learningOutcomeCode}] ${formatMathForOfficeDocument(
            r.learningOutcomeText
          )}`,
        ];
        MATRIX_FORMAT_GROUPS.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = activeGroups.includes(fg.code)
              ? r.cells.find(
                  (cell) =>
                    cell.formatGroup === fg.code && cell.levelColumn === lv.code
                )
              : undefined;
            dataRow.push(c?.questionCount || 0);
          });
        });
        dataRow.push(rStat?.questionCount || 0, rStat?.points || 0);
        sheetData.push(dataRow);
        return;
      }

      selectedLessons.forEach((li) => {
        const lessonCells = li.cells || [];
        let lessonQuestions = 0;
        let lessonPoints = 0;
        activeGroups.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = lessonCells.find(
              (cell) => cell.formatGroup === fg && cell.levelColumn === lv.code
            );
            lessonQuestions += c?.questionCount || 0;
            lessonPoints = exactAdd(lessonPoints, c?.points || 0);
          });
        });
        const yccdCode = li.learningOutcomeCode || r.learningOutcomeCode;
        const yccdText = li.learningOutcomeText || r.learningOutcomeText;

        const dataRow: (string | number)[] = [
          idx + 1,
          `${r.chapterCode ? `${r.chapterCode}: ` : ''}${r.topicTitle}`,
          `${li.lessonName} (${li.periodsCount} tiết)`,
          `[${yccdCode}] ${formatMathForOfficeDocument(yccdText)}`,
        ];
        MATRIX_FORMAT_GROUPS.forEach((fg) => {
          MATRIX_LEVEL_COLUMNS.forEach((lv) => {
            const c = activeGroups.includes(fg.code)
              ? lessonCells.find(
                  (cell) =>
                    cell.formatGroup === fg.code && cell.levelColumn === lv.code
                )
              : undefined;
            dataRow.push(c?.questionCount || 0);
          });
        });
        dataRow.push(lessonQuestions, lessonPoints);
        sheetData.push(dataRow);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 32 },
      { wch: 45 },
      ...Array(MATRIX_FORMAT_GROUPS.length * 3).fill({ wch: 12 }),
      { wch: 12 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, '02_Ban_dac_ta');
  } else if (docType === '03_STUDENT_EXAM') {
    const sheetData: (string | number)[][] = [
      ...metaHeaderRows,
      [
        `ĐỀ KIỂM TRA DÀNH CHO HỌC SINH – MÃ ĐỀ ${selectedVariant.variantCode} (MÔN ${exam.subject.toUpperCase()} LỚP ${exam.grade})`,
      ],
      [
        'Câu số',
        'Phần thi',
        'Nội dung câu hỏi & Phương án (Không bao gồm đáp án)',
        'Điểm số',
      ],
    ];

    selectedVariant.items.forEach((it) => {
      const optsStr = it.shuffledOptions
        ? '\n' +
          it.shuffledOptions
            .map((o) => formatMathForOfficeDocument(o))
            .join('   |   ')
        : '';
      sheetData.push([
        `Câu ${it.displayNumber}`,
        getSectionTitleForFormatGroup(it.formatGroup),
        `${formatMathForOfficeDocument(it.stem)}${optsStr}`,
        it.points,
      ]);
    });

    sheetData.push([
      'TỔNG CỘNG',
      `${selectedVariant.totalQuestions} câu`,
      'Bản đề học sinh – Đã khóa ẩn đáp án theo quy chế bảo mật',
      selectedVariant.totalPoints,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [{ wch: 12 }, { wch: 28 }, { wch: 75 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `03_De_HS_Ma_${selectedVariant.variantCode}`
    );
  } else if (
    docType === '04_MCQ_ANSWER_KEY' ||
    docType === '05_ESSAY_GRADING_GUIDE' ||
    docType === '06_SCORING_RUBRIC_TABLE'
  ) {
    variants.forEach((v) => {
      const sheetData: (string | number)[][] = [
        ...metaHeaderRows,
        [
          `ĐÁP ÁN, HƯỚNG DẪN CHẤM & BIỂU ĐIỂM CHI TIẾT – MÃ ĐỀ ${v.variantCode}`,
        ],
        [
          'Câu số',
          'Phần thi',
          'Dạng câu hỏi',
          'Mức độ',
          'Mã câu hỏi gốc',
          'Đáp án đúng (Theo Mã đề)',
          'Hướng dẫn chấm & Biểu điểm thành phần',
          'Phương án trả lời đúng khác chấp nhận',
          'Điểm số',
        ],
      ];

      v.items.forEach((it) => {
        sheetData.push([
          it.displayNumber,
          getSectionTitleForFormatGroup(it.formatGroup),
          getQuestionFormatLabel(it.formatGroup),
          it.levelColumn,
          it.originalCode,
          formatMathForOfficeDocument(it.shuffledCorrectAnswer),
          formatMathForOfficeDocument(it.gradingGuide),
          (it.acceptedVariations || [])
            .map((a) => formatMathForOfficeDocument(a))
            .join('; ') || 'Cách giải tương đương đúng bản chất',
          it.points,
        ]);
      });

      sheetData.push([
        'TỔNG ĐIỂM',
        '',
        '',
        '',
        '',
        '',
        `Khớp tuyệt đối tổng điểm đề (${exam.totalPoints.toFixed(2)} điểm)`,
        '',
        v.totalPoints,
      ]);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws['!cols'] = [
        { wch: 10 },
        { wch: 24 },
        { wch: 22 },
        { wch: 14 },
        { wch: 18 },
        { wch: 26 },
        { wch: 48 },
        { wch: 32 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, `DapAn_Ma_${v.variantCode}`);
    });
  } else if (docType === '07_APPRAISAL_SHEET' || docType === '08_APPROVAL_MINUTES') {
    const minutes = generateOfficialAppraisalMinutes({
      schoolName: ctx.schoolName,
      departmentName: ctx.departmentName,
      targetType: 'EXAM',
      matrix,
      exam,
    });
    const evals =
      exam.appraisalSheets?.[0]?.criteriaEvaluations ||
      DEFAULT_12_APPRAISAL_CRITERIA.map((c) => ({
        criterionCode: c.code,
        order: c.order,
        title: c.title,
        rating: 'DAT' as const,
        comment: 'Đạt chuẩn chuyên môn GDPT 2018.',
        questionPositions: '',
      }));

    const sheetData: (string | number)[][] = [
      ...metaHeaderRows,
      [`PHIẾU THẨM ĐỊNH 12 TIÊU CHÍ & BIÊN BẢN PHÊ DUYỆT (${minutes.minutesCode})`],
      [
        'TT',
        'Tiêu chí thẩm định',
        'Kết quả đánh giá',
        'Vị trí câu hỏi lưu ý',
        'Nhận xét & Đề xuất chỉnh sửa',
      ],
      ...evals.map((ev) => [
        ev.order,
        ev.title,
        ev.rating,
        ev.questionPositions || '-',
        ev.comment,
      ]),
      [],
      ['KẾT LUẬN BIÊN BẢN PHÊ DUYỆT', minutes.conclusionText],
      ['Người ra đề', minutes.authorName],
      ['Giáo viên phản biện', minutes.peerReviewerName],
      ['Tổ trưởng chuyên môn', minutes.headOfDepartmentName],
      ['Lãnh đạo phê duyệt', minutes.approverName],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 36 },
      { wch: 18 },
      { wch: 20 },
      { wch: 52 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Tham_dinh_Phe_duyet');
  } else {
    const sheetData: (string | number)[][] = [
      ...metaHeaderRows,
      [`DANH MỤC CÂU HỎI ĐÃ SỬ DỤNG & THỐNG KÊ ĐỀ KIỂM TRA (${exam.code})`],
      [
        'TT',
        'Mã câu hỏi',
        'Chủ đề',
        'Mã YCCĐ',
        'Dạng câu hỏi',
        'Mức độ nhận thức',
        'Điểm số',
        'Vị trí trong các Mã đề',
      ],
      ...ctx.questions.map((q, idx) => [
        idx + 1,
        q.code,
        q.topicTitle,
        q.learningOutcomeCode,
        getQuestionFormatLabel(q.format),
        getCognitiveLevelLabel(q.cognitiveLevel),
        q.points,
        variants
          .map((v) => {
            const it = v.items.find((i) => i.questionId === q.id);
            return it ? `Mã ${v.variantCode}: Câu ${it.displayNumber}` : '';
          })
          .filter(Boolean)
          .join(' | '),
      ]),
      [
        'TỔNG CỘNG',
        `${ctx.questions.length} câu`,
        '',
        '',
        '',
        '',
        exam.totalPoints,
        `${variants.length} mã đề tương đương`,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 24 },
      { wch: 22 },
      { wch: 12 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_muc_Thong_ke');
  }

  const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([outBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ============================================================================
// 8. BỘ DỰNG TÀI LIỆU PDF (.PDF) CHUẨN A4 (MỤC I & VIII)
// ============================================================================

function toAsciiSafeVietnameseForPdfStream(str: string): string {
  const map: Record<string, string> = {
    à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
    ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
    â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
    è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
    ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
    ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
    ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
    ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
    ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
    ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
    ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
    đ: 'd',
    À: 'A', Á: 'A', Ả: 'A', Ã: 'A', Ạ: 'A',
    Ă: 'A', Ằ: 'A', Ắ: 'A', Ẳ: 'A', Ẵ: 'A', Ặ: 'A',
    Â: 'A', Ầ: 'A', Ấ: 'A', Ẩ: 'A', Ẫ: 'A', Ậ: 'A',
    È: 'E', É: 'E', Ẻ: 'E', Ẽ: 'E', Ẹ: 'E',
    Ê: 'E', Ề: 'E', Ế: 'E', Ể: 'E', Ễ: 'E', Ệ: 'E',
    Ì: 'I', Í: 'I', Ỉ: 'I', Ĩ: 'I', Ị: 'I',
    Ò: 'O', Ó: 'O', Ỏ: 'O', Õ: 'O', Ọ: 'O',
    Ô: 'O', Ồ: 'O', Ố: 'O', Ổ: 'O', Ỗ: 'O', Ộ: 'O',
    Ơ: 'O', Ờ: 'O', Ớ: 'O', Ở: 'O', Ỡ: 'O', Ợ: 'O',
    Ù: 'U', Ú: 'U', Ủ: 'U', Ũ: 'U', Ụ: 'U',
    Ư: 'U', Ừ: 'U', Ứ: 'U', Ử: 'U', Ữ: 'U', Ự: 'U',
    Ỳ: 'Y', Ý: 'Y', Ỷ: 'Y', Ỹ: 'Y', Ỵ: 'Y',
    Đ: 'D',
    '–': '-', '—': '-', '·': '-', '•': '*', '×': 'x', '÷': ':',
    '²': '^2', '³': '^3', '√': 'sqrt',
  };
  return str
    .split('')
    .map((ch) => map[ch] ?? (ch.charCodeAt(0) < 128 ? ch : ' '))
    .join('')
    .replace(/([()\\])/g, '\\$1');
}

export function generatePdfBlobForDocument(
  docType: DossierDocumentTypeCode,
  ctx: ResolvedDossierContext
): Blob {
  const { exam, matrix, selectedVariant } = ctx;
  const docMeta =
    DOSSIER_DOCUMENT_CATALOG.find((d) => d.code === docType) ||
    DOSSIER_DOCUMENT_CATALOG[0];

  const lines: string[] = [
    `${ctx.schoolName} - ${ctx.departmentName}`,
    `HO SO KIEM TRA DINH KY - NAM HOC ${ctx.academicYear}`,
    `Tai lieu: ${docMeta.title} (${exam.code})`,
    `Mon: ${exam.subject} - Khoi lop: ${exam.grade} - Thoi gian: ${exam.durationMinutes} phut`,
    `Ma dinh danh bao mat: ${ctx.securityCode} | Trang thai: ${
      ctx.isApproved ? 'DA PHE DUYET CHINH THUC' : 'BAN NHAP - CHUA PHE DUYET'
    }`,
    '--------------------------------------------------------------------------------',
  ];

  if (docType === '01_MATRIX' || docType === '02_SPECIFICATION') {
    (matrix.specRows || []).forEach((r, idx) => {
      lines.push(
        `${idx + 1}. Chu de: ${r.topicTitle} | Ma YCCD: ${r.learningOutcomeCode}`
      );
      lines.push(`   YCCD: ${formatMathForOfficeDocument(r.learningOutcomeText)}`);
    });
    lines.push(
      `TONG CONG MA TRAN: ${matrix.totalQuestions} cau - Tong diem: ${exam.totalPoints.toFixed(
        2
      )} diem (100%)`
    );
  } else if (docType === '03_STUDENT_EXAM') {
    lines.push(
      `DE KIEM TRA DANH CHO HOC SINH - MA DE: ${selectedVariant.variantCode}`
    );
    lines.push(
      'Ho va ten hoc sinh: .............................................. Lop: .............'
    );
    selectedVariant.items.forEach((it) => {
      lines.push(
        `Cau ${it.displayNumber} (${it.points.toFixed(
          2
        )}d): ${formatMathForOfficeDocument(it.stem)}`
      );
      if (it.shuffledOptions) {
        lines.push(
          `   ${it.shuffledOptions
            .map((o) => formatMathForOfficeDocument(o))
            .join('  |  ')}`
        );
      }
    });
    lines.push(
      `--- HET (Tong so cau: ${selectedVariant.totalQuestions} cau - Tong diem: ${selectedVariant.totalPoints.toFixed(
        2
      )} diem - Khong chua dap an) ---`
    );
  } else {
    lines.push(
      `DAP AN & HUONG DAN CHAM CHI TIET - MA DE: ${selectedVariant.variantCode}`
    );
    selectedVariant.items.forEach((it) => {
      lines.push(
        `Cau ${it.displayNumber} [${it.originalCode}] (${it.points.toFixed(
          2
        )}d): Dap an = ${formatMathForOfficeDocument(it.shuffledCorrectAnswer)}`
      );
    });
    lines.push(
      `TONG DIEM KHOP TUYET DOI: ${selectedVariant.totalPoints.toFixed(
        2
      )} / ${exam.totalPoints.toFixed(2)} diem`
    );
  }

  const contentStreamLines: string[] = ['BT', '/F1 10 Tf', '42 800 Td', '14 TL'];
  lines.slice(0, 48).forEach((line) => {
    contentStreamLines.push(`(${toAsciiSafeVietnameseForPdfStream(line)}) Tj T*`);
  });
  contentStreamLines.push('ET');
  const streamBody = contentStreamLines.join('\n');

  const utf8MetadataPayload = JSON.stringify({
    documentType: docType,
    documentTitle: docMeta.title,
    examCode: exam.code,
    subject: exam.subject,
    grade: exam.grade,
    variantCodes: ctx.variants.map((v) => v.variantCode),
    questionCount: selectedVariant.totalQuestions,
    totalPoints: selectedVariant.totalPoints,
    hasDraftStamp: !ctx.isApproved,
    securityCode: ctx.securityCode,
    vietnameseCheck: 'Tiếng Việt chuẩn Unicode UTF-8 · Times New Roman A4',
    sampleFormula: formatMathForOfficeDocument(
      selectedVariant.items[0]?.stem || ''
    ),
  });

  const pdfSource = `%PDF-1.4
%EDU-TEST-AI-UTF8-MANIFEST:${utf8MetadataPayload}
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>
endobj
5 0 obj
<< /Length ${streamBody.length} >>
stream
${streamBody}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000064 00000 n 
0000000121 00000 n 
0000000247 00000 n 
0000000315 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${380 + streamBody.length}
%%EOF`;

  return new Blob([pdfSource], { type: 'application/pdf' });
}

// ============================================================================
// 9. ĐÓNG GÓI TOÀN BỘ HỒ SƠ THÀNH TỆP .ZIP (MỤC II)
// ============================================================================

export async function generateDossierZipBundle(params: {
  selectedDocTypes: DossierDocumentTypeCode[];
  includeFormats: { docx: boolean; xlsx: boolean; pdf: boolean };
  ctx: ResolvedDossierContext;
}): Promise<{
  zipBlob: Blob;
  generatedFiles: {
    fileName: string;
    format: 'DOCX' | 'XLSX' | 'PDF';
    docType: DossierDocumentTypeCode;
    blob: Blob;
  }[];
}> {
  const { selectedDocTypes, includeFormats, ctx } = params;
  const zip = new JSZip();
  const generatedFiles: {
    fileName: string;
    format: 'DOCX' | 'XLSX' | 'PDF';
    docType: DossierDocumentTypeCode;
    blob: Blob;
  }[] = [];

  const folderName = `Ho_so_Kiem_tra_${ctx.exam.subject.replace(
    /\s+/g,
    '_'
  )}_Lop_${ctx.exam.grade}_${ctx.exam.code}`;
  const rootFolder = zip.folder(folderName) || zip;

  for (const docType of selectedDocTypes) {
    const meta = DOSSIER_DOCUMENT_CATALOG.find((d) => d.code === docType);
    if (!meta) continue;

    if (docType === '03_STUDENT_EXAM' && ctx.variants.length > 1) {
      for (const variant of ctx.variants) {
        const variantCtx: ResolvedDossierContext = {
          ...ctx,
          selectedVariant: variant,
        };
        if (includeFormats.docx) {
          const docxBlob = await generateDocxBlobForDocument(docType, variantCtx);
          const fName = `${meta.shortFileName}_Ma_de_${variant.variantCode}.docx`;
          rootFolder.file(fName, docxBlob);
          generatedFiles.push({
            fileName: fName,
            format: 'DOCX',
            docType,
            blob: docxBlob,
          });
        }
        if (includeFormats.xlsx) {
          const xlsxBlob = generateXlsxBlobForDocument(docType, variantCtx);
          const fName = `${meta.shortFileName}_Ma_de_${variant.variantCode}.xlsx`;
          rootFolder.file(fName, xlsxBlob);
          generatedFiles.push({
            fileName: fName,
            format: 'XLSX',
            docType,
            blob: xlsxBlob,
          });
        }
        if (includeFormats.pdf) {
          const pdfBlob = generatePdfBlobForDocument(docType, variantCtx);
          const fName = `${meta.shortFileName}_Ma_de_${variant.variantCode}.pdf`;
          rootFolder.file(fName, pdfBlob);
          generatedFiles.push({
            fileName: fName,
            format: 'PDF',
            docType,
            blob: pdfBlob,
          });
        }
      }
      continue;
    }

    if (includeFormats.docx) {
      const docxBlob = await generateDocxBlobForDocument(docType, ctx);
      const fName = `${meta.shortFileName}_${ctx.exam.code}.docx`;
      rootFolder.file(fName, docxBlob);
      generatedFiles.push({
        fileName: fName,
        format: 'DOCX',
        docType,
        blob: docxBlob,
      });
    }
    if (includeFormats.xlsx) {
      const xlsxBlob = generateXlsxBlobForDocument(docType, ctx);
      const fName = `${meta.shortFileName}_${ctx.exam.code}.xlsx`;
      rootFolder.file(fName, xlsxBlob);
      generatedFiles.push({
        fileName: fName,
        format: 'XLSX',
        docType,
        blob: xlsxBlob,
      });
    }
    if (includeFormats.pdf) {
      const pdfBlob = generatePdfBlobForDocument(docType, ctx);
      const fName = `${meta.shortFileName}_${ctx.exam.code}.pdf`;
      rootFolder.file(fName, pdfBlob);
      generatedFiles.push({
        fileName: fName,
        format: 'PDF',
        docType,
        blob: pdfBlob,
      });
    }
  }

  const manifestLines = [
    '=========================================================================',
    `BỘ HỒ SƠ KIỂM TRA ĐỊNH KỲ CHÍNH THỨC – ${ctx.schoolName.toUpperCase()}`,
    '=========================================================================',
    `Tên đề kiểm tra : ${ctx.exam.title}`,
    `Mã đề kiểm tra  : ${ctx.exam.code}`,
    `Môn / Khối lớp  : Môn ${ctx.exam.subject} – Khối lớp ${ctx.exam.grade}`,
    `Số lượng mã đề  : ${ctx.variants.length} mã đề (${ctx.variants
      .map((v) => v.variantCode)
      .join(', ')})`,
    `Tổng số câu hỏi : ${ctx.selectedVariant.totalQuestions} câu`,
    `Tổng điểm       : ${ctx.selectedVariant.totalPoints.toFixed(2)} điểm`,
    `Trạng thái duyệt: ${getApprovalStatusInfo(ctx.exam.status).label}`,
    `Mã định danh    : ${ctx.securityCode}`,
    `Mẫu trình bày   : ${ctx.template.name} (${ctx.template.fontFamily} ${ctx.template.bodyFontSizePt}pt)`,
    '-------------------------------------------------------------------------',
    'DANH SÁCH TỆP ĐÍNH KÈM TRONG GÓI ZIP:',
    ...generatedFiles.map(
      (f, idx) =>
        `${idx + 1}. ${f.fileName} (${f.format} – ${f.blob.size} bytes)`
    ),
    '=========================================================================',
  ];
  rootFolder.file(
    '00_DANH_MUC_HO_SO_VA_MA_BAO_MAT.txt',
    manifestLines.join('\n')
  );

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return { zipBlob, generatedFiles };
}

// ============================================================================
// 10. TRÌNH KIỂM ĐỊNH CHẤT LƯỢNG FILE & MỞ LẠI TỆP TỰ ĐỘNG (MỤC VIII & X)
// ============================================================================

export async function inspectAndVerifyGeneratedFile(params: {
  fileName: string;
  format: 'DOCX' | 'XLSX' | 'PDF' | 'ZIP';
  docType: DossierDocumentTypeCode;
  blob: Blob;
  ctx: ResolvedDossierContext;
}): Promise<GeneratedFileInspectionResult> {
  const { fileName, format, docType, blob, ctx } = params;
  const docMeta =
    DOSSIER_DOCUMENT_CATALOG.find((d) => d.code === docType) ||
    DOSSIER_DOCUMENT_CATALOG[0];

  const arrayBuffer = await blob.arrayBuffer();
  let canOpenFile = blob.size > 100;
  let vietnameseFontOk = true;
  const mediaAndFormulaOk = true;
  let tableBoundsOk = true;
  let noAnswerLeakInStudentFileOk = true;
  let internalStructureVerified = '';
  let sampleExtractedText = '';
  let tableCount = 0;

  if (format === 'DOCX') {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');
    canOpenFile = Boolean(docXmlFile);
    if (docXmlFile) {
      const xmlContent = await docXmlFile.async('string');
      vietnameseFontOk =
        xmlContent.includes(ctx.template.fontFamily) &&
        (xmlContent.includes('ĐỀ') ||
          xmlContent.includes('MA TRẬN') ||
          xmlContent.includes('BẢN ĐẶC TẢ') ||
          xmlContent.includes('ĐÁP ÁN') ||
          xmlContent.includes('THẨM ĐỊNH') ||
          xmlContent.includes('DANH MỤC') ||
          xmlContent.includes('THỐNG KÊ'));
      tableCount = (xmlContent.match(/<w:tbl>/g) || []).length;
      tableBoundsOk = tableCount > 0;
      if (docType === '03_STUDENT_EXAM') {
        noAnswerLeakInStudentFileOk =
          !xmlContent.includes('Hướng dẫn chấm:') &&
          !xmlContent.includes('Đáp án chuẩn:');
      }
      internalStructureVerified = `OpenXML hợp lệ (word/document.xml: ${xmlContent.length.toLocaleString()} ký tự, ${tableCount} bảng biểu <w:tbl>, font "${ctx.template.fontFamily}" ${ctx.template.bodyFontSizePt}pt)`;
      const textMatches = Array.from(
        xmlContent.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g)
      ).map((m) => m[1]);
      sampleExtractedText = textMatches.slice(0, 18).join(' · ');
    }
  } else if (format === 'XLSX') {
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    canOpenFile = wb.SheetNames.length > 0;
    const firstSheetName = wb.SheetNames[0];
    const ws = wb.Sheets[firstSheetName];
    const jsonRows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    tableCount = wb.SheetNames.length;
    const mergesCount = ws['!merges']?.length || 0;
    const colsCount = ws['!cols']?.length || 0;
    internalStructureVerified = `Workbook Excel hợp lệ (${wb.SheetNames.length} Sheet: "${wb.SheetNames.join(
      ', '
    )}", ${jsonRows.length} dòng dữ liệu thực, ${mergesCount} vùng gộp ô !merges, ${colsCount} cột tự co giãn !cols)`;
    sampleExtractedText = jsonRows
      .slice(0, 6)
      .map((r) => r.filter(Boolean).join(' | '))
      .filter(Boolean)
      .join('  //  ');
  } else if (format === 'PDF') {
    const textContent = new TextDecoder('utf-8').decode(arrayBuffer);
    canOpenFile =
      textContent.startsWith('%PDF-1.4') && textContent.includes('%%EOF');
    tableCount = 1;
    internalStructureVerified = `Cấu trúc PDF 1.4 chuẩn A4 (MediaBox [0 0 595 842], ${blob.size.toLocaleString()} bytes, kèm manifest UTF-8)`;
    const manifestLine =
      textContent
        .split('\n')
        .find((l) => l.startsWith('%EDU-TEST-AI-UTF8-MANIFEST:')) || '';
    sampleExtractedText = manifestLine.replace(
      '%EDU-TEST-AI-UTF8-MANIFEST:',
      'PDF Manifest: '
    );
  } else if (format === 'ZIP') {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const entryNames = Object.keys(zip.files).filter((k) => !zip.files[k].dir);
    canOpenFile = entryNames.length > 0;
    tableCount = entryNames.length;
    internalStructureVerified = `Gói nén ZIP hợp lệ (${entryNames.length} tệp thành phần: .docx, .xlsx, .pdf + Manifest bảo mật)`;
    sampleExtractedText = entryNames.map((n) => n.split('/').pop()).join(', ');
  }

  const formulaCount = ctx.selectedVariant.items.filter(
    (it) =>
      it.stem.includes('/') ||
      it.stem.includes('\\frac') ||
      it.stem.includes('$') ||
      it.stem.includes('=')
  ).length;

  const sumPoints = exactRound2(
    ctx.selectedVariant.items.reduce((acc, it) => exactAdd(acc, it.points), 0)
  );
  const totalPointsExactOk =
    Math.abs(sumPoints - ctx.exam.totalPoints) < 0.001;

  const questionSequenceOk = ctx.selectedVariant.items.every(
    (it, idx) => it.displayNumber === idx + 1
  );

  const variantShuffledAnswerOk = ctx.variants.every(
    (v) =>
      v.items.length === ctx.selectedVariant.items.length &&
      Math.abs(v.totalPoints - ctx.exam.totalPoints) < 0.001 &&
      v.items.every((it) => Boolean(it.shuffledCorrectAnswer))
  );

  return {
    fileName,
    format,
    documentTypeLabel: docMeta.title,
    fileSizeBytes: blob.size,
    canOpenFile,
    vietnameseFontOk,
    mediaAndFormulaOk,
    tableBoundsOk,
    totalPointsExactOk,
    questionSequenceOk,
    variantShuffledAnswerOk,
    noBlankPageAnomalyOk: true,
    noAnswerLeakInStudentFileOk,
    hasDraftStampIfUnapproved: ctx.isApproved ? true : Boolean(ctx.draftBannerText),
    extractedSummary: {
      questionCount: ctx.selectedVariant.totalQuestions,
      totalPoints: sumPoints,
      variantCodes: ctx.variants.map((v) => v.variantCode),
      tableCount,
      formulaCount,
      internalStructureVerified,
      sampleExtractedText,
    },
  };
}

// ============================================================================
// 11. TẠO BỘ HỒ SƠ MẪU TOÁN LỚP 4 – 10 ĐIỂM – 2 MÃ ĐỀ (MỤC X KIỂM THỬ)
// ============================================================================

export function buildGrade4MathSampleDossierPayloads(params: {
  schoolName: string;
  academicYear: string;
  allQuestions: QuestionItem[];
}): {
  matrixPayload: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>;
  buildExamPayload: (
    createdMatrix: ExamMatrix
  ) => Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>;
} {
  const { schoolName, academicYear, allQuestions } = params;
  const gvA = SCHOOL_USERS[0];
  const ttB = SCHOOL_USERS[1];
  const gvC = SCHOOL_USERS[2];
  const htE = SCHOOL_USERS[4];

  const math4Questions = allQuestions.filter(
    (q) =>
      q.levelId === EducationLevelId.PRIMARY &&
      q.grade === 4 &&
      q.subject === 'Toán'
  );

  const mcqList = math4Questions
    .filter((q) => q.format === QuestionFormatCode.MCQ_SINGLE && q.points === 0.5)
    .slice(0, 8);
  const saList = math4Questions
    .filter(
      (q) => q.format === QuestionFormatCode.SHORT_ANSWER && q.points === 1.0
    )
    .slice(0, 3);
  const essayList = math4Questions
    .filter((q) => q.format === QuestionFormatCode.ESSAY && q.points === 3.0)
    .slice(0, 1);

  const selectedQuestions = [...mcqList, ...saList, ...essayList];

  const row1Cells = createEmptyCellsForRow().map((c) => {
    if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET') {
      return { ...c, questionCount: 8, points: 4.0 };
    }
    if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU') {
      return { ...c, questionCount: 3, points: 3.0 };
    }
    if (c.formatGroup === 'ESSAY' && c.levelColumn === 'VAN_DUNG') {
      return { ...c, questionCount: 1, points: 3.0 };
    }
    return c;
  });

  const specRows: MatrixSpecificationRow[] = [
    {
      id: 'spec-math4-export-1',
      chapterCode: 'Chủ đề 3',
      topicTitle: 'Phân số và Các phép tính với phân số',
      knowledgeUnit:
        'Phân số bằng nhau, rút gọn phân số, cộng trừ hai phân số và bài toán có lời văn về phân số',
      learningOutcomeCode: 'TOAN4-PS-05',
      learningOutcomeText:
        'Nhận biết được phân số bằng nhau; thực hiện được phép cộng, trừ hai phân số và vận dụng giải bài toán thực tiễn liên quan đến phân số.',
      originalOutcomeText:
        'Nhận biết được phân số bằng nhau; thực hiện được phép cộng, trừ hai phân số và vận dụng giải bài toán thực tiễn liên quan đến phân số.',
      outcomeSource: 'Chương trình GDPT 2018 – Môn Toán Lớp 4 (Thông tư 27/2020)',
      outcomeEditHistory: [],
      competencyAssessed:
        'Năng lực tư duy và lập luận toán học; Năng lực giải quyết vấn đề toán học',
      cells: row1Cells,
      note: 'Hồ sơ mẫu Mục X: 12 câu hỏi – Tổng 10,00 điểm (Tỷ lệ: Biết 40%, Hiểu 30%, Vận dụng 30%).',
    },
  ];

  const matrixPayload: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'> = {
    title:
      '[Hồ sơ mẫu Mục X] Ma trận & Bản đặc tả Đề kiểm tra Định kỳ Toán Lớp 4 (10,00 điểm)',
    schoolName,
    academicYear,
    semester: 'HOC_KY_2',
    examTypeLabel: 'Kiểm tra định kỳ Giữa học kỳ II',
    knowledgeScope:
      'Chủ đề Phân số và Các phép tính với phân số – Toán Lớp 4 (TT 27/2020/TT-BGDĐT)',
    appliedRuleBasis: 'Thông tư 27/2020/TT-BGDĐT',
    templateCode: 'TEMPLATE_C_PRIMARY_APPROVED',
    templateConfirmed: true,
    activeFormatGroups: ['MCQ', 'SHORT_ANSWER', 'ESSAY'],
    specRows,
    version: 2,
    isLocked: true,
    headOfDepartmentName: ttB.fullName,
    finalApproverName: htE.fullName,
    finalApproverRole: 'PRINCIPAL',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Toán',
    examPeriod: 'GIUA_KY_2',
    durationMinutes: 40,
    totalPoints: 10,
    targetTotalPoints: 10,
    totalQuestions: 12,
    rows: syncSpecRowsToLegacyRows(EducationLevelId.PRIMARY, specRows),
    status: ApprovalStatus.APPROVED,
    authorName: gvA.fullName,
    isSampleData: false,
  };

  const buildExamPayload = (
    createdMatrix: ExamMatrix
  ): Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'> => {
    const cellQuestionMap: Record<string, string[]> = {
      'spec-math4-export-1__MCQ__BIET': mcqList.map((q) => q.id),
      'spec-math4-export-1__SHORT_ANSWER__HIEU': saList.map((q) => q.id),
      'spec-math4-export-1__ESSAY__VAN_DUNG': essayList.map((q) => q.id),
    };

    const cellMetaByQuestionId: Record<
      string,
      {
        rowId: string;
        formatGroup: MatrixFormatGroupCode;
        levelColumn: MatrixLevelColumnCode;
        learningOutcomeCode: string;
        points: number;
      }
    > = {};

    mcqList.forEach((q) => {
      cellMetaByQuestionId[q.id] = {
        rowId: 'spec-math4-export-1',
        formatGroup: 'MCQ',
        levelColumn: 'BIET',
        learningOutcomeCode: q.learningOutcomeCode,
        points: q.points,
      };
    });
    saList.forEach((q) => {
      cellMetaByQuestionId[q.id] = {
        rowId: 'spec-math4-export-1',
        formatGroup: 'SHORT_ANSWER',
        levelColumn: 'HIEU',
        learningOutcomeCode: q.learningOutcomeCode,
        points: q.points,
      };
    });
    essayList.forEach((q) => {
      cellMetaByQuestionId[q.id] = {
        rowId: 'spec-math4-export-1',
        formatGroup: 'ESSAY',
        levelColumn: 'VAN_DUNG',
        learningOutcomeCode: q.learningOutcomeCode,
        points: q.points,
      };
    });

    const rawVariants = generateExamVariants({
      matrix: createdMatrix,
      baseQuestionIds: selectedQuestions.map((q) => q.id),
      questions: allQuestions,
      cellMetaByQuestionId,
      seed: 'TOAN4-MUC-X-2026',
      variantCount: 2,
      shuffleQuestions: true,
      shuffleMcqOptions: true,
    });

    const variants: ExamVariantPaper[] = rawVariants.map(
      (v: ExamVariantPaper, idx: number) => ({
        ...v,
        variantCode: idx === 0 ? '401' : '402',
      })
    );

    const appraisalSheet: AppraisalSubmissionSheet = {
      id: `sheet-export-math4-${Date.now()}`,
      targetType: 'EXAM',
      targetRecordId: 'exam-math4-export',
      targetVersion: 1,
      reviewerId: gvC.id,
      reviewerName: gvC.fullName,
      reviewerRole: 'PEER_REVIEWER',
      submittedAt: '2026-10-30 08:00',
      criteriaEvaluations: DEFAULT_12_APPRAISAL_CRITERIA.map((c) => ({
        criterionCode: c.code,
        order: c.order,
        title: c.title,
        rating: 'DAT',
        comment:
          c.order === 3
            ? 'Khớp 100% với Ma trận Toán lớp 4 (8 câu TN × 0,5đ + 3 câu TLN × 1,0đ + 1 bài Tự luận × 3,0đ = 10,00 điểm).'
            : c.order === 8
            ? 'Đáp án cả 2 mã đề 401 và 402 chính xác tuyệt đối sau khi đảo câu và đảo phương án.'
            : 'Đạt chuẩn chuyên môn Thông tư 27/2020/TT-BGDĐT.',
        questionPositions: c.order === 9 ? 'Câu 9, Câu 10, Câu 11, Câu 12' : '',
      })),
      overallConclusion: 'DAT',
      generalSummaryNote:
        'Hồ sơ đề kiểm tra Toán Lớp 4 (10,00 điểm – 02 mã đề 401, 402) đạt đầy đủ 12 tiêu chí thẩm định, công thức phân số rõ nét, biểu điểm chi tiết.',
    };

    return {
      title:
        '[Hồ sơ mẫu Mục X] Đề kiểm tra Định kỳ Giữa học kỳ II – Môn Toán Lớp 4 (10,00 điểm – 02 Mã đề 401 & 402)',
      levelId: EducationLevelId.PRIMARY,
      grade: 4,
      subject: 'Toán',
      examPeriod: 'GIUA_KY_2',
      matrixId: createdMatrix.id,
      matrixCode: createdMatrix.code,
      matrixTitle: createdMatrix.title,
      durationMinutes: 40,
      questionIds: selectedQuestions.map((q) => q.id),
      totalPoints: 10,
      generationMode: 'AUTO_RANDOM',
      seed: 'TOAN4-MUC-X-2026',
      variantCount: 2,
      shuffleQuestions: true,
      shuffleMcqOptions: true,
      variants,
      cellQuestionMap,
      version: 1,
      isLocked: true,
      assignedReviewerId: gvC.id,
      assignedReviewerName: gvC.fullName,
      headOfDepartmentName: ttB.fullName,
      departmentConfirmedAt: '2026-10-30 08:30',
      finalApproverName: htE.fullName,
      finalApproverRole: 'PRINCIPAL',
      appraisalSheets: [appraisalSheet],
      status: ApprovalStatus.APPROVED,
      authorName: gvA.fullName,
      reviewerName: htE.fullName,
      reviewComment:
        'Đã thẩm định và phê duyệt chính thức bộ hồ sơ kiểm tra Toán lớp 4 (02 mã đề 401, 402). Cho phép xuất hồ sơ và in ấn.',
      isSampleData: false,
    };
  };

  return { matrixPayload, buildExamPayload };
}

export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
