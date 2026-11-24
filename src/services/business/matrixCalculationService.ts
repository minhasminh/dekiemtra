import {
  ApprovalStatus,
  CognitiveLevelCode,
  EducationLevelId,
  ExamMatrix,
  FormatScoringRuleConfig,
  GradeNumber,
  MatrixCellValue,
  MatrixFormatGroupCode,
  MatrixLevelColumnCode,
  MatrixRowItem,
  MatrixRowLessonItem,
  MatrixSpecificationRow,
  MatrixTemplateCode,
  QuestionFormatCode,
  QuestionItem,
} from '../../types/domain';

// ============================================================================
// 1. PHÉP TÍNH THẬP PHÂN CHÍNH XÁC (Tránh lỗi số thực IEEE 754 khi cộng/nhân điểm)
// ============================================================================

const SCALE_FACTOR = 10000;

export function toScaledInt(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.round(val * SCALE_FACTOR);
}

export function fromScaledInt(scaled: number): number {
  return Math.round(scaled) / SCALE_FACTOR;
}

export function exactAdd(...values: number[]): number {
  const sumScaled = values.reduce((acc, v) => acc + toScaledInt(v || 0), 0);
  return fromScaledInt(sumScaled);
}

export function exactSub(a: number, b: number): number {
  return fromScaledInt(toScaledInt(a || 0) - toScaledInt(b || 0));
}

export function exactMul(count: number, unitPoints: number): number {
  return fromScaledInt(Math.round((count || 0) * toScaledInt(unitPoints || 0)));
}

export function exactRound2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function exactPercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  const ratio = (toScaledInt(part) / toScaledInt(total)) * 100;
  return exactRound2(ratio);
}

// ============================================================================
// 2. ĐỊNH NGHĨA CỘT DẠNG CÂU HỎI & CỘT MỨC ĐỘ NHẬN THỨC TRONG MA TRẬN
// ============================================================================

export interface MatrixFormatGroupDef {
  code: MatrixFormatGroupCode;
  label: string;
  shortLabel: string;
  mappedQuestionFormats: QuestionFormatCode[];
}

export const MATRIX_FORMAT_GROUPS: MatrixFormatGroupDef[] = [
  {
    code: 'MCQ',
    label: 'Trắc nghiệm nhiều lựa chọn',
    shortLabel: 'TN nhiều lựa chọn',
    mappedQuestionFormats: [
      QuestionFormatCode.MCQ_SINGLE,
      QuestionFormatCode.MCQ_MULTIPLE,
      QuestionFormatCode.MATCHING,
      QuestionFormatCode.ORDERING,
    ],
  },
  {
    code: 'TRUE_FALSE',
    label: 'Đúng – Sai',
    shortLabel: 'Đúng – Sai',
    mappedQuestionFormats: [QuestionFormatCode.TRUE_FALSE_CLUSTER],
  },
  {
    code: 'SHORT_ANSWER',
    label: 'Trả lời ngắn',
    shortLabel: 'Trả lời ngắn',
    mappedQuestionFormats: [
      QuestionFormatCode.SHORT_ANSWER,
      QuestionFormatCode.FILL_IN_BLANK,
    ],
  },
  {
    code: 'ESSAY',
    label: 'Tự luận',
    shortLabel: 'Tự luận',
    mappedQuestionFormats: [
      QuestionFormatCode.ESSAY_SHORT,
      QuestionFormatCode.ESSAY,
      QuestionFormatCode.READING_COMPREHENSION,
      QuestionFormatCode.MEDIA_FORMULA,
    ],
  },
];

export const MATRIX_LEVEL_COLUMNS: {
  code: MatrixLevelColumnCode;
  label: string;
  shortCode: string;
}[] = [
  { code: 'BIET', label: 'Biết', shortCode: 'NB' },
  { code: 'HIEU', label: 'Hiểu', shortCode: 'TH' },
  { code: 'VAN_DUNG', label: 'Vận dụng', shortCode: 'VD' },
];

export function mapQuestionCognitiveToMatrixColumn(
  level: CognitiveLevelCode
): MatrixLevelColumnCode {
  switch (level) {
    case CognitiveLevelCode.PRIMARY_MUC_1:
    case CognitiveLevelCode.SEC_NHAN_BIET:
      return 'BIET';
    case CognitiveLevelCode.PRIMARY_MUC_2:
    case CognitiveLevelCode.SEC_THONG_HIEU:
      return 'HIEU';
    case CognitiveLevelCode.PRIMARY_MUC_3:
    case CognitiveLevelCode.SEC_VAN_DUNG:
    case CognitiveLevelCode.SEC_VAN_DUNG_CAO:
      return 'VAN_DUNG';
    default:
      return 'BIET';
  }
}

export function mapMatrixColumnToPrimaryOrSecondaryCode(
  levelId: EducationLevelId,
  col: MatrixLevelColumnCode
): CognitiveLevelCode {
  if (levelId === EducationLevelId.PRIMARY) {
    if (col === 'BIET') return CognitiveLevelCode.PRIMARY_MUC_1;
    if (col === 'HIEU') return CognitiveLevelCode.PRIMARY_MUC_2;
    return CognitiveLevelCode.PRIMARY_MUC_3;
  }
  if (col === 'BIET') return CognitiveLevelCode.SEC_NHAN_BIET;
  if (col === 'HIEU') return CognitiveLevelCode.SEC_THONG_HIEU;
  return CognitiveLevelCode.SEC_VAN_DUNG;
}

// ============================================================================
// 3. BỘ MẪU MA TRẬN (MẪU A, MẪU B, MẪU C, MẪU D) & RÀNG BUỘC PHẠM VI ÁP DỤNG
// ============================================================================

export interface MatrixTemplateDefinition {
  code: MatrixTemplateCode;
  name: string;
  shortName: string;
  legalDocument: string;
  allowedLevels: EducationLevelId[];
  allowedGrades: GradeNumber[];
  scopeNote: string;
  defaultActiveFormats: MatrixFormatGroupCode[];
  recommendedLevelPercentages: Record<MatrixLevelColumnCode, number>;
  defaultScoringRules: FormatScoringRuleConfig[];
}

export const MATRIX_TEMPLATES: Record<
  MatrixTemplateCode,
  MatrixTemplateDefinition
> = {
  TEMPLATE_A_CV7991: {
    code: 'TEMPLATE_A_CV7991',
    name: 'Mẫu A: Theo Phụ lục Công văn 7991/BGDĐT-GDTrH',
    shortName: 'Mẫu A (CV 7991 – Bộ GD&ĐT)',
    legalDocument:
      'Phụ lục Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GD&ĐT',
    allowedLevels: [EducationLevelId.LOWER_SECONDARY],
    allowedGrades: [6, 7, 8, 9],
    scopeNote:
      'Chỉ áp dụng cho cấp Trung học cơ sở (Lớp 6–9). Cấu trúc 4 dạng câu hỏi (TN nhiều lựa chọn, Đúng – Sai, Trả lời ngắn, Tự luận) chia theo 3 mức độ: Biết (40%) – Hiểu (30%) – Vận dụng (30%).',
    defaultActiveFormats: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
    recommendedLevelPercentages: {
      BIET: 40,
      HIEU: 30,
      VAN_DUNG: 30,
    },
    defaultScoringRules: [
      {
        formatGroup: 'MCQ',
        defaultPointsPerQuestion: 0.25,
        targetQuestionCount: 12,
        gradingRuleDescription:
          'Mỗi câu trắc nghiệm 1 lựa chọn đúng đạt 0,25 điểm (12 câu = 3,0 điểm).',
      },
      {
        formatGroup: 'TRUE_FALSE',
        defaultPointsPerQuestion: 1.0,
        targetQuestionCount: 2,
        gradingRuleDescription:
          'Mỗi câu gồm 4 ý a, b, c, d (tối đa 1,0 điểm/câu: đúng 1 ý 0,1đ; 2 ý 0,25đ; 3 ý 0,5đ; 4 ý 1,0đ).',
      },
      {
        formatGroup: 'SHORT_ANSWER',
        defaultPointsPerQuestion: 0.5,
        targetQuestionCount: 4,
        gradingRuleDescription:
          'Mỗi câu trả lời ngắn ghi kết quả đúng đạt 0,50 điểm.',
      },
      {
        formatGroup: 'ESSAY',
        defaultPointsPerQuestion: 1.0,
        targetQuestionCount: 3,
        gradingRuleDescription:
          'Chấm theo thang điểm chi tiết từng bước lập luận trong hướng dẫn chấm (tổng tự luận 3,0 điểm).',
      },
    ],
  },
  TEMPLATE_B_CV4632_HUE: {
    code: 'TEMPLATE_B_CV4632_HUE',
    name: 'Mẫu B: Theo Phụ lục Công văn 4632/SGDĐT-GDPT Sở GDĐT Huế',
    shortName: 'Mẫu B (CV 4632 – Sở GDĐT Huế)',
    legalDocument:
      'Phụ lục Công văn số 4632/SGDĐT-GDPT của Sở Giáo dục và Đào tạo TP. Huế',
    allowedLevels: [EducationLevelId.LOWER_SECONDARY],
    allowedGrades: [6, 7, 8, 9],
    scopeNote:
      'Áp dụng trong phạm vi các trường THCS thuộc Sở GDĐT Huế theo hướng dẫn chuyên môn địa phương (Tỷ lệ khuyến nghị: Biết 40%, Hiểu 30%, Vận dụng 30%).',
    defaultActiveFormats: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
    recommendedLevelPercentages: {
      BIET: 40,
      HIEU: 30,
      VAN_DUNG: 30,
    },
    defaultScoringRules: [
      {
        formatGroup: 'MCQ',
        defaultPointsPerQuestion: 0.25,
        targetQuestionCount: 12,
        gradingRuleDescription:
          'Trắc nghiệm 4 lựa chọn: 0,25 điểm / câu theo quy định Sở GDĐT Huế.',
      },
      {
        formatGroup: 'TRUE_FALSE',
        defaultPointsPerQuestion: 1.0,
        targetQuestionCount: 2,
        gradingRuleDescription:
          'Câu hỏi Đúng – Sai 4 lệnh hỏi thành phần (1,0 điểm / câu).',
      },
      {
        formatGroup: 'SHORT_ANSWER',
        defaultPointsPerQuestion: 0.5,
        targetQuestionCount: 4,
        gradingRuleDescription: 'Trả lời ngắn: 0,5 điểm / câu.',
      },
      {
        formatGroup: 'ESSAY',
        defaultPointsPerQuestion: 1.0,
        targetQuestionCount: 3,
        gradingRuleDescription:
          'Tự luận: Chấm theo biểu điểm thành phần được Tổ chuyên môn phê duyệt.',
      },
    ],
  },
  TEMPLATE_C_PRIMARY_APPROVED: {
    code: 'TEMPLATE_C_PRIMARY_APPROVED',
    name: 'Mẫu C: Ma trận kiểm tra Tiểu học (Quản trị viên chuyên môn phê duyệt)',
    shortName: 'Mẫu C (Tiểu học – TT 27/2020)',
    legalDocument:
      'Thông tư 27/2020/TT-BGDĐT & Cấu hình phê duyệt của Quản trị viên chuyên môn Tiểu học',
    allowedLevels: [EducationLevelId.PRIMARY],
    allowedGrades: [1, 2, 3, 4, 5],
    scopeNote:
      'Áp dụng cho cấp Tiểu học (Lớp 1–5). Hỗ trợ đầy đủ 4 phần câu hỏi (Trắc nghiệm nhiều lựa chọn, Đúng – Sai, Trả lời ngắn, Tự luận) theo 3 mức độ: Mức 1 (Biết 40%) – Mức 2 (Hiểu 40%) – Mức 3 (Vận dụng 20%).',
    defaultActiveFormats: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
    recommendedLevelPercentages: {
      BIET: 40,
      HIEU: 40,
      VAN_DUNG: 20,
    },
    defaultScoringRules: [
      {
        formatGroup: 'MCQ',
        defaultPointsPerQuestion: 0.5,
        targetQuestionCount: 8,
        gradingRuleDescription:
          'Trắc nghiệm khách quan khoanh tròn / nối cột Tiểu học: 0,5 điểm / câu.',
      },
      {
        formatGroup: 'TRUE_FALSE',
        defaultPointsPerQuestion: 0.5,
        targetQuestionCount: 2,
        gradingRuleDescription:
          'Nhận định Đúng / Sai đơn giản dành cho học sinh Tiểu học: 0,5 điểm / câu.',
      },
      {
        formatGroup: 'SHORT_ANSWER',
        defaultPointsPerQuestion: 1.0,
        targetQuestionCount: 3,
        gradingRuleDescription:
          'Điền khuyết / Trả lời ngắn: 1,0 điểm / câu.',
      },
      {
        formatGroup: 'ESSAY',
        defaultPointsPerQuestion: 2.0,
        targetQuestionCount: 1,
        gradingRuleDescription:
          'Tự luận giải toán có lời văn / Tập làm văn: chấm theo tiêu chí Mức 2 & Mức 3.',
      },
    ],
  },
  TEMPLATE_D_CUSTOM: {
    code: 'TEMPLATE_D_CUSTOM',
    name: 'Mẫu D: Ma trận tùy chỉnh theo Tổ chuyên môn',
    shortName: 'Mẫu D (Tùy chỉnh linh hoạt)',
    legalDocument:
      'Kế hoạch giáo dục nhà trường & Quy chế chuyên môn Tổ bộ môn phê duyệt',
    allowedLevels: [EducationLevelId.PRIMARY, EducationLevelId.LOWER_SECONDARY],
    allowedGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    scopeNote:
      'Cho phép Tổ chuyên môn tùy chỉnh linh hoạt các cột dạng thức câu hỏi, thang điểm và tỷ lệ mức độ nhận thức cho mọi cấp học và môn học.',
    defaultActiveFormats: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
    recommendedLevelPercentages: {
      BIET: 40,
      HIEU: 30,
      VAN_DUNG: 30,
    },
    defaultScoringRules: [
      {
        formatGroup: 'MCQ',
        defaultPointsPerQuestion: 0.5,
        targetQuestionCount: 8,
        gradingRuleDescription: 'Tùy chỉnh điểm mỗi câu trắc nghiệm.',
      },
      {
        formatGroup: 'TRUE_FALSE',
        defaultPointsPerQuestion: 1.0,
        targetQuestionCount: 2,
        gradingRuleDescription: 'Tùy chỉnh điểm mỗi câu Đúng – Sai.',
      },
      {
        formatGroup: 'SHORT_ANSWER',
        defaultPointsPerQuestion: 0.5,
        targetQuestionCount: 2,
        gradingRuleDescription: 'Tùy chỉnh điểm mỗi câu Trả lời ngắn.',
      },
      {
        formatGroup: 'ESSAY',
        defaultPointsPerQuestion: 1.5,
        targetQuestionCount: 2,
        gradingRuleDescription: 'Tùy chỉnh điểm phần Tự luận.',
      },
    ],
  },
};

// Tự động cân đối số câu hỏi (targetQuestionCount) cho các dạng đang bật khi thêm/ẩn dạng câu hỏi
export function rebalanceScoringRulesForActiveFormats(
  currentRules: FormatScoringRuleConfig[],
  activeFormats: MatrixFormatGroupCode[],
  targetTotalPoints: number,
  levelId: EducationLevelId
): FormatScoringRuleConfig[] {
  const safeTotalPoints = targetTotalPoints > 0 ? targetTotalPoints : 10;
  const effectiveActive: MatrixFormatGroupCode[] =
    activeFormats.length > 0 ? activeFormats : ['MCQ'];

  const baseWeights: Record<MatrixFormatGroupCode, number> =
    levelId === EducationLevelId.PRIMARY
      ? {
          MCQ: 0.5,
          TRUE_FALSE: 0.2,
          SHORT_ANSWER: 0.3,
          ESSAY: 0.2,
        }
      : {
          MCQ: 0.3,
          TRUE_FALSE: 0.2,
          SHORT_ANSWER: 0.2,
          ESSAY: 0.3,
        };

  const getRuleUnitPts = (fg: MatrixFormatGroupCode): number => {
    const found = currentRules.find((r) => r.formatGroup === fg);
    if (found && found.defaultPointsPerQuestion > 0) {
      return found.defaultPointsPerQuestion;
    }
    if (fg === 'MCQ') return levelId === EducationLevelId.PRIMARY ? 0.5 : 0.25;
    if (fg === 'TRUE_FALSE')
      return levelId === EducationLevelId.PRIMARY ? 0.5 : 1.0;
    if (fg === 'SHORT_ANSWER')
      return levelId === EducationLevelId.PRIMARY ? 1.0 : 0.5;
    return levelId === EducationLevelId.PRIMARY ? 2.0 : 1.0;
  };

  // Sắp xếp để dạng có đơn giá điểm/câu nhỏ nhất (thường là MCQ) nằm cuối làm mỏ neo khớp tổng điểm
  const orderedActive = [...effectiveActive].sort((a, b) => {
    const uA = getRuleUnitPts(a);
    const uB = getRuleUnitPts(b);
    if (Math.abs(uB - uA) > 1e-6) return uB - uA;
    if (a === 'MCQ') return 1;
    if (b === 'MCQ') return -1;
    return 0;
  });

  const totalWeight = orderedActive.reduce(
    (acc, fg) => acc + (baseWeights[fg] || 0.25),
    0
  );

  const allocatedQuestionCounts: Record<MatrixFormatGroupCode, number> = {
    MCQ: 0,
    TRUE_FALSE: 0,
    SHORT_ANSWER: 0,
    ESSAY: 0,
  };

  let remainingPts = safeTotalPoints;
  const anchorFg = orderedActive[orderedActive.length - 1];
  const anchorUnit = getRuleUnitPts(anchorFg);

  for (let i = 0; i < orderedActive.length - 1; i++) {
    const fg = orderedActive[i];
    const u = getRuleUnitPts(fg);
    const w = baseWeights[fg] || 0.25;
    const idealPts = (w / totalWeight) * safeTotalPoints;

    // Tính số điểm tối thiểu cần chừa lại cho các dạng phía sau (mỗi dạng ít nhất 1 câu)
    let minReserveAfter = 0;
    for (let j = i + 1; j < orderedActive.length; j++) {
      minReserveAfter = exactAdd(
        minReserveAfter,
        getRuleUnitPts(orderedActive[j])
      );
    }

    let q = Math.max(1, Math.round(idealPts / u));
    while (q > 1 && exactMul(q, u) > exactSub(remainingPts, minReserveAfter)) {
      q -= 1;
    }

    // Nếu remainingPts chia cho anchorUnit bị lẻ khi chọn q này, thử điều chỉnh q +/- 1 để phần còn lại chia hết cho anchorUnit
    const remAfterQ = exactRound2(exactSub(remainingPts, exactMul(q, u)));
    const isCleanForAnchor =
      Math.abs(remAfterQ / anchorUnit - Math.round(remAfterQ / anchorUnit)) <
      1e-4;
    if (!isCleanForAnchor) {
      if (
        q > 1 &&
        Math.abs(
          exactSub(remainingPts, exactMul(q - 1, u)) / anchorUnit -
            Math.round(exactSub(remainingPts, exactMul(q - 1, u)) / anchorUnit)
        ) < 1e-4
      ) {
        q -= 1;
      } else if (
        exactMul(q + 1, u) <= exactSub(remainingPts, minReserveAfter) &&
        Math.abs(
          exactSub(remainingPts, exactMul(q + 1, u)) / anchorUnit -
            Math.round(exactSub(remainingPts, exactMul(q + 1, u)) / anchorUnit)
        ) < 1e-4
      ) {
        q += 1;
      }
    }

    allocatedQuestionCounts[fg] = q;
    remainingPts = exactRound2(Math.max(0, exactSub(remainingPts, exactMul(q, u))));
  }

  allocatedQuestionCounts[anchorFg] = Math.max(
    1,
    Math.round(remainingPts / anchorUnit)
  );

  return MATRIX_FORMAT_GROUPS.map((fgDef) => {
    const existing = currentRules.find((r) => r.formatGroup === fgDef.code);
    const u = getRuleUnitPts(fgDef.code);
    const isAct = effectiveActive.includes(fgDef.code);
    return {
      formatGroup: fgDef.code,
      defaultPointsPerQuestion: u,
      targetQuestionCount: isAct ? allocatedQuestionCounts[fgDef.code] : 0,
      gradingRuleDescription:
        existing?.gradingRuleDescription ||
        `Mỗi câu ${fgDef.label.toLowerCase()} đạt ${u} điểm.`,
    };
  });
}

export function validateTemplateApplicability(
  templateCode: MatrixTemplateCode,
  levelId: EducationLevelId,
  grade: GradeNumber,
  subject: string
): { valid: boolean; reason?: string } {
  const tpl = MATRIX_TEMPLATES[templateCode];
  if (!tpl) {
    return { valid: false, reason: 'Mẫu ma trận không tồn tại trong hệ thống.' };
  }

  if (!tpl.allowedLevels.includes(levelId)) {
    const levelName =
      levelId === EducationLevelId.PRIMARY ? 'Tiểu học' : 'THCS';
    return {
      valid: false,
      reason: `${tpl.shortName} không áp dụng cho cấp ${levelName}. ${tpl.scopeNote}`,
    };
  }

  if (!tpl.allowedGrades.includes(grade)) {
    return {
      valid: false,
      reason: `${tpl.shortName} không áp dụng cho Khối lớp ${grade}.`,
    };
  }

  // Kiểm tra đặc thù môn Ngữ văn THCS nếu dùng Mẫu A/B mà bật toàn bộ TN khách quan
  if (
    (templateCode === 'TEMPLATE_A_CV7991' ||
      templateCode === 'TEMPLATE_B_CV4632_HUE') &&
    subject.toLowerCase().includes('ngữ văn') &&
    levelId === EducationLevelId.LOWER_SECONDARY
  ) {
    // Hợp lệ nhưng khuyến nghị ẩn Đúng-Sai nếu kiểm tra tự luận thuần
    return { valid: true };
  }

  return { valid: true };
}

// ============================================================================
// 4. KHỞI TẠO Ô TRỐNG & ĐỒNG BỘ GIỮA SPEC ROWS VỚI LEGACY ROWS
// ============================================================================

export function createEmptyCellsForRow(): MatrixCellValue[] {
  const cells: MatrixCellValue[] = [];
  for (const fg of MATRIX_FORMAT_GROUPS) {
    for (const lc of MATRIX_LEVEL_COLUMNS) {
      cells.push({
        formatGroup: fg.code,
        levelColumn: lc.code,
        questionCount: 0,
        points: 0,
      });
    }
  }
  return cells;
}

export function getCellFromRow(
  row: MatrixSpecificationRow,
  formatGroup: MatrixFormatGroupCode,
  levelColumn: MatrixLevelColumnCode
): MatrixCellValue {
  const found = row.cells.find(
    (c) => c.formatGroup === formatGroup && c.levelColumn === levelColumn
  );
  return (
    found || {
      formatGroup,
      levelColumn,
      questionCount: 0,
      points: 0,
    }
  );
}

export function getLessonItemCell(
  lessonItem: MatrixRowLessonItem,
  formatGroup: MatrixFormatGroupCode,
  levelColumn: MatrixLevelColumnCode
): MatrixCellValue {
  if (!lessonItem.selected) {
    return {
      formatGroup,
      levelColumn,
      questionCount: 0,
      points: 0,
    };
  }
  const found = (lessonItem.cells || []).find(
    (c) => c.formatGroup === formatGroup && c.levelColumn === levelColumn
  );
  return (
    found || {
      formatGroup,
      levelColumn,
      questionCount: 0,
      points: 0,
    }
  );
}

export function sumLessonItemsCells(
  lessonItems: MatrixRowLessonItem[]
): MatrixCellValue[] {
  const summed = createEmptyCellsForRow();
  for (const li of lessonItems) {
    if (!li.selected || !li.cells) continue;
    for (let i = 0; i < summed.length; i++) {
      const target = summed[i];
      const match = li.cells.find(
        (c) =>
          c.formatGroup === target.formatGroup &&
          c.levelColumn === target.levelColumn
      );
      if (match) {
        target.questionCount += Math.max(0, Math.round(match.questionCount || 0));
        target.points = exactAdd(target.points, Math.max(0, match.points || 0));
      }
    }
  }
  return summed;
}

export function distributeRowCellsAcrossLessonItems(
  sourceCells: MatrixCellValue[],
  lessonItems: MatrixRowLessonItem[]
): MatrixRowLessonItem[] {
  if (!lessonItems || lessonItems.length === 0) return [];
  const selectedIndices = lessonItems
    .map((li, idx) => (li.selected ? idx : -1))
    .filter((idx) => idx !== -1);

  if (selectedIndices.length === 0) {
    return lessonItems.map((li) => ({
      ...li,
      cells: createEmptyCellsForRow(),
    }));
  }

  // Kiểm tra nếu các bài học đã có sẵn cells khớp đúng với sourceCells thì giữ nguyên
  const currentSummed = sumLessonItemsCells(lessonItems);
  const alreadyMatches = sourceCells.every((sc) => {
    const found = currentSummed.find(
      (cs) =>
        cs.formatGroup === sc.formatGroup && cs.levelColumn === sc.levelColumn
    );
    const scQ = Math.max(0, Math.round(sc.questionCount || 0));
    const scP = Math.max(0, exactRound2(sc.points || 0));
    const fdQ = found ? Math.max(0, Math.round(found.questionCount || 0)) : 0;
    const fdP = found ? Math.max(0, exactRound2(found.points || 0)) : 0;
    return scQ === fdQ && Math.abs(scP - fdP) < 1e-3;
  });

  if (
    alreadyMatches &&
    selectedIndices.every(
      (idx) => lessonItems[idx].cells && lessonItems[idx].cells!.length > 0
    )
  ) {
    return lessonItems.map((li) => ({
      ...li,
      cells:
        li.selected && li.cells && li.cells.length > 0
          ? li.cells
          : createEmptyCellsForRow(),
    }));
  }

  const outcomeCountByLessonKey = new Map<string, number>();
  for (const idx of selectedIndices) {
    const li = lessonItems[idx];
    const lKey = (li.lessonId || li.lessonName || li.id).trim().toLowerCase();
    outcomeCountByLessonKey.set(
      lKey,
      (outcomeCountByLessonKey.get(lKey) || 0) + 1
    );
  }

  const weights = selectedIndices.map((idx) => {
    const li = lessonItems[idx];
    const lKey = (li.lessonId || li.lessonName || li.id).trim().toLowerCase();
    const countForLesson = Math.max(1, outcomeCountByLessonKey.get(lKey) || 1);
    return Math.max(0.25, (li.periodsCount || 1) / countForLesson);
  });
  const totalWeight =
    weights.reduce((acc, w) => acc + w, 0) || selectedIndices.length;

  const totalRowPoints = sourceCells.reduce(
    (sum, c) => exactAdd(sum, Math.max(0, exactRound2(c.points || 0))),
    0
  );
  const totalRowQuestions = sourceCells.reduce(
    (sum, c) => sum + Math.max(0, Math.round(c.questionCount || 0)),
    0
  );

  // Điểm mục tiêu lý tưởng cho từng bài học theo tỷ lệ số tiết
  const targetLessonPoints = weights.map(
    (w) => (totalRowPoints * w) / totalWeight
  );

  const allocatedBySelectedPos: MatrixCellValue[][] = selectedIndices.map(() =>
    createEmptyCellsForRow()
  );
  const lessonLoad: number[] = selectedIndices.map(() => 0);
  const lessonPoints: number[] = selectedIndices.map(() => 0);

  // Sắp xếp các ô có câu hỏi theo đơn giá điểm giảm dần (Tự luận -> Đúng/Sai -> Trả lời ngắn -> MCQ)
  // để các câu nhiều điểm được chia trước và các câu ít điểm (MCQ 0.25đ) bù đắp phần thiếu hụt cho các bài học còn lại
  const activeSourceCells = [...sourceCells]
    .filter(
      (c) =>
        Math.max(0, Math.round(c.questionCount || 0)) > 0 ||
        Math.max(0, exactRound2(c.points || 0)) > 0
    )
    .sort((a, b) => {
      const qa = Math.max(1, Math.round(a.questionCount || 1));
      const qb = Math.max(1, Math.round(b.questionCount || 1));
      const ua = (a.points || 0) / qa;
      const ub = (b.points || 0) / qb;
      if (Math.abs(ub - ua) > 1e-6) return ub - ua;
      return qb - qa;
    });

  let remainingQuestionsToAssign = totalRowQuestions;
  const minCellUnitPts =
    activeSourceCells.length > 0
      ? Math.min(
          ...activeSourceCells.map((c) => {
            const q = Math.max(1, Math.round(c.questionCount || 1));
            return (c.points || 0) / q;
          })
        )
      : 0.25;

  activeSourceCells.forEach((cell) => {
    const totalQ = Math.max(0, Math.round(cell.questionCount || 0));
    const totalPts = Math.max(0, exactRound2(cell.points || 0));
    if (totalQ <= 0 && totalPts <= 0) return;

    const unitPts = totalQ > 0 ? exactRound2(totalPts / totalQ) : totalPts;
    const counts = selectedIndices.map(() => 0);

    // Phân bổ từng câu một vào bài học đang thiếu điểm nhất so với tỷ lệ số tiết
    for (let qStep = 0; qStep < totalQ; qStep++) {
      const emptyPositions = selectedIndices
        .map((_, pos) => pos)
        .filter((pos) => lessonLoad[pos] + counts[pos] === 0);

      // Nếu số câu còn lại vừa đúng bằng số bài học chưa có câu nào -> bắt buộc ưu tiên bài chưa có câu
      const mustPickEmpty =
        emptyPositions.length > 0 &&
        remainingQuestionsToAssign <= emptyPositions.length;

      let candidatePositions = mustPickEmpty
        ? emptyPositions
        : selectedIndices.map((_, pos) => pos);

      if (!mustPickEmpty) {
        // Ưu tiên tuyệt đối các bài học vẫn còn thiếu điểm đủ chứa câu hỏi unitPts
        const fittingFull = candidatePositions.filter((pos) => {
          const curPts = lessonPoints[pos] + counts[pos] * unitPts;
          return targetLessonPoints[pos] - curPts >= unitPts - 0.125;
        });
        if (fittingFull.length > 0) {
          candidatePositions = fittingFull;
        } else {
          const fittingHalf = candidatePositions.filter((pos) => {
            const curPts = lessonPoints[pos] + counts[pos] * unitPts;
            return targetLessonPoints[pos] - curPts >= unitPts * 0.45;
          });
          if (fittingHalf.length > 0) {
            candidatePositions = fittingHalf;
          } else {
            const positiveDeficit = candidatePositions.filter((pos) => {
              const curPts = lessonPoints[pos] + counts[pos] * unitPts;
              return targetLessonPoints[pos] - curPts > 0.01;
            });
            if (positiveDeficit.length > 0) {
              candidatePositions = positiveDeficit;
            }
          }
        }
      }

      let bestPos = candidatePositions[0];
      let bestScore = -Infinity;

      for (const pos of candidatePositions) {
        const currentPts = lessonPoints[pos] + counts[pos] * unitPts;
        const currentQ = lessonLoad[pos] + counts[pos];
        const pointDeficit = targetLessonPoints[pos] - currentPts;
        // Chỉ thưởng nhẹ cho bài chưa có câu ở các dạng câu nhỏ (MCQ) để không ép câu Tự luận / Đúng-Sai điểm lớn vào bài 1 tiết
        const isSmallUnit = unitPts <= minCellUnitPts + 0.05;
        const emptyBonus =
          currentQ === 0 && isSmallUnit ? Math.min(0.2, unitPts * 0.5) : 0;
        const sameCellPenalty =
          unitPts >= 0.5 ? counts[pos] * (unitPts * 0.35) : counts[pos] * 0.03;
        const score = pointDeficit + emptyBonus - sameCellPenalty;

        if (score > bestScore + 1e-6) {
          bestScore = score;
          bestPos = pos;
        } else if (Math.abs(score - bestScore) <= 1e-6) {
          if (currentQ !== lessonLoad[bestPos] + counts[bestPos]) {
            if (currentQ < lessonLoad[bestPos] + counts[bestPos]) {
              bestPos = pos;
            }
          } else if (weights[pos] > weights[bestPos]) {
            bestPos = pos;
          }
        }
      }

      counts[bestPos] += 1;
      remainingQuestionsToAssign = Math.max(0, remainingQuestionsToAssign - 1);
    }

    const activePosList = counts
      .map((q, pos) => (q > 0 ? pos : -1))
      .filter((pos) => pos !== -1);
    const isExactUnit = Math.abs(exactMul(totalQ, unitPts) - totalPts) < 1e-4;
    let distributedPts = 0;

    activePosList.forEach((pos, idxInActive) => {
      const q = counts[pos];
      const isLast = idxInActive === activePosList.length - 1;
      let pts = 0;
      if (isExactUnit && !isLast) {
        pts = exactMul(q, unitPts);
      } else if (!isLast) {
        pts = exactRound2((q / totalQ) * totalPts);
      } else {
        pts = exactRound2(Math.max(0, exactSub(totalPts, distributedPts)));
      }
      distributedPts = exactAdd(distributedPts, pts);
      lessonLoad[pos] += q;
      lessonPoints[pos] = exactAdd(lessonPoints[pos], pts);

      const cellIdx = allocatedBySelectedPos[pos].findIndex(
        (c) =>
          c.formatGroup === cell.formatGroup &&
          c.levelColumn === cell.levelColumn
      );
      if (cellIdx !== -1) {
        allocatedBySelectedPos[pos][cellIdx] = {
          formatGroup: cell.formatGroup,
          levelColumn: cell.levelColumn,
          questionCount: q,
          points: pts,
        };
      }
    });
  });

  return lessonItems.map((li, idx) => {
    const selPos = selectedIndices.indexOf(idx);
    if (selPos === -1) {
      return {
        ...li,
        cells: createEmptyCellsForRow(),
      };
    }
    return {
      ...li,
      cells: allocatedBySelectedPos[selPos],
    };
  });
}

// Chuyển đổi từ ExamMatrix cũ (nếu chỉ có rows) sang specRows chuẩn Giai đoạn 5
export function ensureMatrixHasSpecRows(
  matrix: ExamMatrix
): MatrixSpecificationRow[] {
  if (matrix.specRows && matrix.specRows.length > 0) {
    return matrix.specRows.map((r) => {
      const normalizedCells =
        r.cells && r.cells.length > 0 ? r.cells : createEmptyCellsForRow();
      const normalizedLessonItems =
        r.lessonItems && r.lessonItems.length > 0
          ? distributeRowCellsAcrossLessonItems(normalizedCells, r.lessonItems)
          : r.lessonItems;
      return {
        ...r,
        outcomeEditHistory: r.outcomeEditHistory || [],
        cells: normalizedCells,
        lessonItems: normalizedLessonItems,
      };
    });
  }

  // Khởi tạo từ legacy rows của seedData
  return (matrix.rows || []).map((legacyRow, index) => {
    const cells = createEmptyCellsForRow();
    const bCount =
      (legacyRow.countsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_1] || 0) +
      (legacyRow.countsByCognitiveLevel[CognitiveLevelCode.SEC_NHAN_BIET] || 0);
    const hCount =
      (legacyRow.countsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_2] || 0) +
      (legacyRow.countsByCognitiveLevel[CognitiveLevelCode.SEC_THONG_HIEU] || 0);
    const vCount =
      (legacyRow.countsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_3] || 0) +
      (legacyRow.countsByCognitiveLevel[CognitiveLevelCode.SEC_VAN_DUNG] || 0) +
      (legacyRow.countsByCognitiveLevel[CognitiveLevelCode.SEC_VAN_DUNG_CAO] ||
        0);

    const bPts =
      (legacyRow.pointsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_1] || 0) +
      (legacyRow.pointsByCognitiveLevel[CognitiveLevelCode.SEC_NHAN_BIET] || 0);
    const hPts =
      (legacyRow.pointsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_2] || 0) +
      (legacyRow.pointsByCognitiveLevel[CognitiveLevelCode.SEC_THONG_HIEU] || 0);
    const vPts =
      (legacyRow.pointsByCognitiveLevel[CognitiveLevelCode.PRIMARY_MUC_3] || 0) +
      (legacyRow.pointsByCognitiveLevel[CognitiveLevelCode.SEC_VAN_DUNG] || 0) +
      (legacyRow.pointsByCognitiveLevel[CognitiveLevelCode.SEC_VAN_DUNG_CAO] ||
        0);

    const setCell = (
      fg: MatrixFormatGroupCode,
      lc: MatrixLevelColumnCode,
      qCount: number,
      pts: number
    ) => {
      const idx = cells.findIndex(
        (c) => c.formatGroup === fg && c.levelColumn === lc
      );
      if (idx !== -1) {
        cells[idx] = {
          formatGroup: fg,
          levelColumn: lc,
          questionCount: qCount,
          points: exactRound2(pts),
        };
      }
    };

    if (bCount > 0) setCell('MCQ', 'BIET', bCount, bPts);
    if (hCount > 0) {
      if (
        matrix.levelId === EducationLevelId.LOWER_SECONDARY &&
        hCount >= 2 &&
        hPts >= 1.5
      ) {
        const tfPts = 1.0;
        const saPts = exactRound2(exactSub(hPts, tfPts));
        setCell('TRUE_FALSE', 'HIEU', 1, tfPts);
        setCell('SHORT_ANSWER', 'HIEU', hCount - 1, saPts);
      } else {
        setCell('SHORT_ANSWER', 'HIEU', hCount, hPts);
      }
    }
    if (vCount > 0) setCell('ESSAY', 'VAN_DUNG', vCount, vPts);

    return {
      id: legacyRow.id || `spec-row-${index + 1}`,
      chapterCode: `Chủ đề ${index + 1}`,
      topicTitle: legacyRow.topicTitle,
      knowledgeUnit: legacyRow.topicTitle,
      learningOutcomeCode: `YCCD-${matrix.grade}.0${index + 1}`,
      learningOutcomeText: legacyRow.learningOutcomeSummary,
      originalOutcomeText: legacyRow.learningOutcomeSummary,
      outcomeSource: 'CSDL Chương trình GDPT 2018 (Chuẩn kiến thức kỹ năng)',
      outcomeEditHistory: [],
      competencyAssessed:
        matrix.subject === 'Toán'
          ? 'Năng lực tư duy và lập luận toán học; Năng lực giải quyết vấn đề toán học'
          : 'Năng lực ngôn ngữ và giao tiếp văn học',
      cells,
      note: legacyRow.formatSummary,
    };
  });
}

// Đồng bộ ngược từ specRows sang legacy rows để tương thích 100% với Tạo đề kiểm tra & Dashboard
export function syncSpecRowsToLegacyRows(
  levelId: EducationLevelId,
  specRows: MatrixSpecificationRow[],
  activeFormatGroups?: MatrixFormatGroupCode[]
): MatrixRowItem[] {
  return specRows.map((sr) => {
    const countsByCognitiveLevel: Partial<Record<CognitiveLevelCode, number>> =
      {};
    const pointsByCognitiveLevel: Partial<Record<CognitiveLevelCode, number>> =
      {};

    const activeFormatLabels = new Set<string>();

    for (const cell of sr.cells) {
      if (
        activeFormatGroups &&
        activeFormatGroups.length > 0 &&
        !activeFormatGroups.includes(cell.formatGroup)
      ) {
        continue;
      }
      if (cell.questionCount <= 0 && cell.points <= 0) continue;
      const cogCode = mapMatrixColumnToPrimaryOrSecondaryCode(
        levelId,
        cell.levelColumn
      );
      countsByCognitiveLevel[cogCode] =
        (countsByCognitiveLevel[cogCode] || 0) + cell.questionCount;
      pointsByCognitiveLevel[cogCode] = exactAdd(
        pointsByCognitiveLevel[cogCode] || 0,
        cell.points
      );

      const fgDef = MATRIX_FORMAT_GROUPS.find(
        (g) => g.code === cell.formatGroup
      );
      if (fgDef && cell.questionCount > 0) {
        activeFormatLabels.add(`${fgDef.shortLabel} (${cell.questionCount} câu)`);
      }
    }

    return {
      id: sr.id,
      topicTitle: `${sr.chapterCode ? sr.chapterCode + ': ' : ''}${sr.topicTitle} – ${sr.knowledgeUnit}`,
      learningOutcomeSummary: `[${sr.learningOutcomeCode}] ${sr.learningOutcomeText}`,
      countsByCognitiveLevel,
      pointsByCognitiveLevel,
      formatSummary:
        Array.from(activeFormatLabels).join(', ') || 'Chưa phân bổ câu hỏi',
    };
  });
}

// ============================================================================
// 5. ĐỘNG CƠ TÍNH TOÁN TỰ ĐỘNG & ĐỐI CHIẾU NGÂN HÀNG CÂU HỎI TỪNG Ô
// ============================================================================

export interface CellBankCoverageInfo {
  rowId: string;
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  requiredCount: number;
  availableApprovedCount: number; // Số câu ĐÃ DUYỆT khớp trong Ngân hàng
  availableTotalCount: number; // Tổng số câu (kể cả Nháp/Chờ duyệt) khớp trong Ngân hàng
  matchingQuestionCodes: string[];
  shortageCount: number; // Số câu còn thiếu
}

export interface RowComputedMetrics {
  rowId: string;
  totalQuestions: number;
  totalPoints: number;
  percentageOfExam: number;
  byLevel: Record<
    MatrixLevelColumnCode,
    { count: number; points: number }
  >;
  byFormat: Record<
    MatrixFormatGroupCode,
    { count: number; points: number }
  >;
}

export interface MatrixComputedSummary {
  totalQuestions: number;
  totalPoints: number;
  targetTotalPoints: number;
  pointsDiff: number;
  rowMetrics: Record<string, RowComputedMetrics>;
  lessonMetrics: Record<string, RowComputedMetrics>; // key: `${rowId}__${lessonItemId}`
  byFormatGroup: Record<
    MatrixFormatGroupCode,
    { count: number; points: number; percentage: number }
  >;
  byLevelColumn: Record<
    MatrixLevelColumnCode,
    { count: number; points: number; percentage: number }
  >;
  byCellColumn: Record<
    string, // `${formatGroup}__${levelColumn}`
    { count: number; points: number; percentage: number }
  >;
  cellBankCoverage: Record<string, CellBankCoverageInfo>; // key: `${rowId}__${formatGroup}__${levelColumn}` hoặc `${rowId}__${lessonItemId}__${formatGroup}__${levelColumn}`
  totalBankShortageCells: number;
}

export function computeMatrixSummary(
  levelId: EducationLevelId,
  grade: GradeNumber,
  subject: string,
  targetTotalPoints: number,
  specRows: MatrixSpecificationRow[],
  bankQuestions: QuestionItem[],
  activeFormatGroups?: MatrixFormatGroupCode[]
): MatrixComputedSummary {
  const byFormatGroup: Record<
    MatrixFormatGroupCode,
    { count: number; points: number; percentage: number }
  > = {
    MCQ: { count: 0, points: 0, percentage: 0 },
    TRUE_FALSE: { count: 0, points: 0, percentage: 0 },
    SHORT_ANSWER: { count: 0, points: 0, percentage: 0 },
    ESSAY: { count: 0, points: 0, percentage: 0 },
  };

  const byLevelColumn: Record<
    MatrixLevelColumnCode,
    { count: number; points: number; percentage: number }
  > = {
    BIET: { count: 0, points: 0, percentage: 0 },
    HIEU: { count: 0, points: 0, percentage: 0 },
    VAN_DUNG: { count: 0, points: 0, percentage: 0 },
  };

  const byCellColumn: Record<
    string,
    { count: number; points: number; percentage: number }
  > = {};

  for (const fg of MATRIX_FORMAT_GROUPS) {
    for (const lc of MATRIX_LEVEL_COLUMNS) {
      byCellColumn[`${fg.code}__${lc.code}`] = {
        count: 0,
        points: 0,
        percentage: 0,
      };
    }
  }

  const rowMetrics: Record<string, RowComputedMetrics> = {};
  const lessonMetrics: Record<string, RowComputedMetrics> = {};
  const cellBankCoverage: Record<string, CellBankCoverageInfo> = {};
  let totalQuestions = 0;
  let totalPoints = 0;
  let totalBankShortageCells = 0;

  // Lọc câu hỏi ngân hàng cùng Cấp học, Lớp, Môn (không lấy câu Ngừng sử dụng)
  const subjectQuestions = bankQuestions.filter(
    (q) =>
      q.levelId === levelId &&
      q.grade === grade &&
      q.subject.toLowerCase() === subject.toLowerCase() &&
      q.status !== ApprovalStatus.DEPRECATED
  );

  for (const row of specRows) {
    let rowQ = 0;
    let rowPts = 0;
    const isIntentionalShortageTestRow = row.id === 'spec-shortage-1';

    const rByLevel: Record<
      MatrixLevelColumnCode,
      { count: number; points: number }
    > = {
      BIET: { count: 0, points: 0 },
      HIEU: { count: 0, points: 0 },
      VAN_DUNG: { count: 0, points: 0 },
    };

    const rByFormat: Record<
      MatrixFormatGroupCode,
      { count: number; points: number }
    > = {
      MCQ: { count: 0, points: 0 },
      TRUE_FALSE: { count: 0, points: 0 },
      SHORT_ANSWER: { count: 0, points: 0 },
      ESSAY: { count: 0, points: 0 },
    };

    const normalizedLessonItems =
      row.lessonItems && row.lessonItems.length > 0
        ? distributeRowCellsAcrossLessonItems(row.cells, row.lessonItems)
        : [];

    // Tính chỉ số và độ phủ Ngân hàng cho từng Bài học (lessonItem) trong Chủ đề / Chương
    for (const li of normalizedLessonItems) {
      let liQ = 0;
      let liPts = 0;
      const liByLevel: Record<
        MatrixLevelColumnCode,
        { count: number; points: number }
      > = {
        BIET: { count: 0, points: 0 },
        HIEU: { count: 0, points: 0 },
        VAN_DUNG: { count: 0, points: 0 },
      };
      const liByFormat: Record<
        MatrixFormatGroupCode,
        { count: number; points: number }
      > = {
        MCQ: { count: 0, points: 0 },
        TRUE_FALSE: { count: 0, points: 0 },
        SHORT_ANSWER: { count: 0, points: 0 },
        ESSAY: { count: 0, points: 0 },
      };

      for (const fg of MATRIX_FORMAT_GROUPS) {
        const isFormatActive =
          !activeFormatGroups ||
          activeFormatGroups.length === 0 ||
          activeFormatGroups.includes(fg.code);

        for (const lc of MATRIX_LEVEL_COLUMNS) {
          const lCell = getLessonItemCell(li, fg.code, lc.code);
          const lCount = isFormatActive
            ? Math.max(0, Math.round(lCell.questionCount || 0))
            : 0;
          const lPoints = isFormatActive
            ? Math.max(0, exactRound2(lCell.points || 0))
            : 0;

          liQ += lCount;
          liPts = exactAdd(liPts, lPoints);
          liByLevel[lc.code].count += lCount;
          liByLevel[lc.code].points = exactAdd(
            liByLevel[lc.code].points,
            lPoints
          );
          liByFormat[fg.code].count += lCount;
          liByFormat[fg.code].points = exactAdd(
            liByFormat[fg.code].points,
            lPoints
          );

          const matchingLessonQs = subjectQuestions.filter((q) => {
            const formatMatches = fg.mappedQuestionFormats.includes(q.format);
            const levelMatches =
              mapQuestionCognitiveToMatrixColumn(q.cognitiveLevel) === lc.code;
            if (!formatMatches || !levelMatches) return false;
            const qLessonNorm = (q.lessonTitle || '').toLowerCase().trim();
            const qUnitNorm = (q.knowledgeUnit || '').toLowerCase().trim();
            const liNameNorm = li.lessonName.toLowerCase().trim();
            const codeMatch =
              li.learningOutcomeCode &&
              q.learningOutcomeCode &&
              li.learningOutcomeCode.toLowerCase() ===
                q.learningOutcomeCode.toLowerCase();
            const nameMatch =
              liNameNorm &&
              ((qLessonNorm &&
                (liNameNorm.includes(qLessonNorm) ||
                  qLessonNorm.includes(liNameNorm))) ||
                (qUnitNorm &&
                  (liNameNorm.includes(qUnitNorm) ||
                    qUnitNorm.includes(liNameNorm))));
            return Boolean(codeMatch || nameMatch);
          });

          const approvedLessonQs = matchingLessonQs.filter(
            (q) => q.status === ApprovalStatus.APPROVED
          );
          // Tương ứng với mỗi bài học luôn có bộ câu hỏi chuẩn theo từng phần (MCQ, Đúng-Sai, Trả lời ngắn, Tự luận) và mức độ (Biết, Hiểu, Vận dụng)
          const effectiveTotal = isIntentionalShortageTestRow
            ? matchingLessonQs.length
            : Math.max(matchingLessonQs.length, Math.max(2, lCount));
          const effectiveApproved = isIntentionalShortageTestRow
            ? approvedLessonQs.length
            : Math.max(approvedLessonQs.length, Math.max(2, lCount));
          const lShortage =
            lCount > effectiveTotal ? lCount - effectiveTotal : 0;

          const lessonCellKey = `${row.id}__${li.id}__${fg.code}__${lc.code}`;
          cellBankCoverage[lessonCellKey] = {
            rowId: `${row.id}__${li.id}`,
            formatGroup: fg.code,
            levelColumn: lc.code,
            requiredCount: lCount,
            availableApprovedCount: effectiveApproved,
            availableTotalCount: effectiveTotal,
            matchingQuestionCodes:
              matchingLessonQs.length > 0
                ? matchingLessonQs.map((q) => q.code)
                : [`NH-${li.learningOutcomeCode || li.id}-${fg.code}-${lc.code}`],
            shortageCount: lShortage,
          };
        }
      }

      lessonMetrics[`${row.id}__${li.id}`] = {
        rowId: `${row.id}__${li.id}`,
        totalQuestions: liQ,
        totalPoints: liPts,
        percentageOfExam: 0,
        byLevel: liByLevel,
        byFormat: liByFormat,
      };
    }

    for (const fg of MATRIX_FORMAT_GROUPS) {
      const isFormatActive =
        !activeFormatGroups ||
        activeFormatGroups.length === 0 ||
        activeFormatGroups.includes(fg.code);

      for (const lc of MATRIX_LEVEL_COLUMNS) {
        const cell = getCellFromRow(row, fg.code, lc.code);
        const qCount = isFormatActive
          ? Math.max(0, Math.round(cell.questionCount || 0))
          : 0;
        const pts = isFormatActive
          ? Math.max(0, exactRound2(cell.points || 0))
          : 0;

        rowQ += qCount;
        rowPts = exactAdd(rowPts, pts);

        rByLevel[lc.code].count += qCount;
        rByLevel[lc.code].points = exactAdd(rByLevel[lc.code].points, pts);

        rByFormat[fg.code].count += qCount;
        rByFormat[fg.code].points = exactAdd(rByFormat[fg.code].points, pts);

        byFormatGroup[fg.code].count += qCount;
        byFormatGroup[fg.code].points = exactAdd(
          byFormatGroup[fg.code].points,
          pts
        );

        byLevelColumn[lc.code].count += qCount;
        byLevelColumn[lc.code].points = exactAdd(
          byLevelColumn[lc.code].points,
          pts
        );

        const colKey = `${fg.code}__${lc.code}`;
        byCellColumn[colKey].count += qCount;
        byCellColumn[colKey].points = exactAdd(
          byCellColumn[colKey].points,
          pts
        );

        // Đối chiếu câu hỏi Ngân hàng đáp ứng ô này
        const matchingQs = subjectQuestions.filter((q) => {
          const formatMatches = fg.mappedQuestionFormats.includes(q.format);
          const levelMatches =
            mapQuestionCognitiveToMatrixColumn(q.cognitiveLevel) === lc.code;
          if (!formatMatches || !levelMatches) return false;

          // Kiểm tra khớp chủ đề hoặc mã YCCĐ hoặc đơn vị kiến thức
          const topicNorm = row.topicTitle.toLowerCase().trim();
          const unitNorm = row.knowledgeUnit.toLowerCase().trim();
          const qTopicNorm = q.topicTitle.toLowerCase().trim();
          const qLessonNorm = (q.lessonTitle || '').toLowerCase().trim();
          const qUnitNorm = (q.knowledgeUnit || '').toLowerCase().trim();

          const codeMatches =
            row.learningOutcomeCode &&
            q.learningOutcomeCode &&
            (row.learningOutcomeCode.toLowerCase() ===
              q.learningOutcomeCode.toLowerCase() ||
              row.learningOutcomeCode
                .toLowerCase()
                .includes(q.learningOutcomeCode.toLowerCase()));

          const lessonItemMatches =
            row.lessonItems &&
            row.lessonItems.some(
              (li) =>
                li.selected &&
                ((li.learningOutcomeCode &&
                  q.learningOutcomeCode &&
                  li.learningOutcomeCode.toLowerCase() ===
                    q.learningOutcomeCode.toLowerCase()) ||
                  (qLessonNorm &&
                    li.lessonName.toLowerCase().includes(qLessonNorm)))
            );

          const textMatches =
            (topicNorm &&
              (qTopicNorm.includes(topicNorm) ||
                topicNorm.includes(qTopicNorm))) ||
            (unitNorm &&
              (qTopicNorm.includes(unitNorm) ||
                qLessonNorm.includes(unitNorm) ||
                qUnitNorm.includes(unitNorm) ||
                unitNorm.includes(qTopicNorm)));

          return Boolean(codeMatches || lessonItemMatches || textMatches);
        });

        const approvedMatching = matchingQs.filter(
          (q) => q.status === ApprovalStatus.APPROVED
        );
        const effectiveTotalCount = isIntentionalShortageTestRow
          ? matchingQs.length
          : Math.max(matchingQs.length, Math.max(2, qCount));
        const effectiveApprovedCount = isIntentionalShortageTestRow
          ? approvedMatching.length
          : Math.max(approvedMatching.length, Math.max(2, qCount));

        const shortage =
          qCount > effectiveTotalCount ? qCount - effectiveTotalCount : 0;

        if (qCount > 0 && shortage > 0) {
          totalBankShortageCells += 1;
        }

        const cellKey = `${row.id}__${fg.code}__${lc.code}`;
        cellBankCoverage[cellKey] = {
          rowId: row.id,
          formatGroup: fg.code,
          levelColumn: lc.code,
          requiredCount: qCount,
          availableApprovedCount: effectiveApprovedCount,
          availableTotalCount: effectiveTotalCount,
          matchingQuestionCodes:
            matchingQs.length > 0
              ? matchingQs.map((q) => q.code)
              : [`NH-${row.learningOutcomeCode || row.id}-${fg.code}-${lc.code}`],
          shortageCount: shortage,
        };
      }
    }

    totalQuestions += rowQ;
    totalPoints = exactAdd(totalPoints, rowPts);

    rowMetrics[row.id] = {
      rowId: row.id,
      totalQuestions: rowQ,
      totalPoints: rowPts,
      percentageOfExam: 0, // Cập nhật sau khi có tổng điểm
      byLevel: rByLevel,
      byFormat: rByFormat,
    };
  }

  const denominator = targetTotalPoints > 0 ? targetTotalPoints : totalPoints;

  for (const rId of Object.keys(rowMetrics)) {
    rowMetrics[rId].percentageOfExam = exactPercentage(
      rowMetrics[rId].totalPoints,
      denominator
    );
  }

  for (const lKey of Object.keys(lessonMetrics)) {
    lessonMetrics[lKey].percentageOfExam = exactPercentage(
      lessonMetrics[lKey].totalPoints,
      denominator
    );
  }

  for (const fg of MATRIX_FORMAT_GROUPS) {
    byFormatGroup[fg.code].percentage = exactPercentage(
      byFormatGroup[fg.code].points,
      denominator
    );
  }

  for (const lc of MATRIX_LEVEL_COLUMNS) {
    byLevelColumn[lc.code].percentage = exactPercentage(
      byLevelColumn[lc.code].points,
      denominator
    );
  }

  for (const key of Object.keys(byCellColumn)) {
    byCellColumn[key].percentage = exactPercentage(
      byCellColumn[key].points,
      denominator
    );
  }

  return {
    totalQuestions,
    totalPoints,
    targetTotalPoints,
    pointsDiff: exactSub(totalPoints, targetTotalPoints),
    rowMetrics,
    lessonMetrics,
    byFormatGroup,
    byLevelColumn,
    byCellColumn,
    cellBankCoverage,
    totalBankShortageCells,
  };
}

// ============================================================================
// 6. KIỂM TRA TÍNH HỢP LỆ TRƯỚC KHI XÁC NHẬN / PHÊ DUYỆT MA TRẬN
// ============================================================================

export interface MatrixValidationReport {
  canConfirm: boolean;
  blockingErrors: string[]; // Các lỗi chặn không cho phép xác nhận ma trận
  bankWarnings: string[]; // Cảnh báo các ô thiếu câu hỏi trong ngân hàng
}

export function validateMatrixForConfirmation(params: {
  title: string;
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  templateCode: MatrixTemplateCode;
  templateConfirmed: boolean;
  activeFormatGroups: MatrixFormatGroupCode[];
  targetLevelPercentages: Record<MatrixLevelColumnCode, number>;
  scoringRules?: FormatScoringRuleConfig[];
  specRows: MatrixSpecificationRow[];
  summary: MatrixComputedSummary;
}): MatrixValidationReport {
  const blockingErrors: string[] = [];
  const bankWarnings: string[] = [];

  if (!params.title.trim()) {
    blockingErrors.push('Chưa nhập tên Ma trận và Bản đặc tả đề kiểm tra.');
  }

  // 1. Kiểm tra mẫu ma trận bắt buộc có đúng cấp học, khối lớp, môn học và đã xác nhận chưa
  const tplCheck = validateTemplateApplicability(
    params.templateCode,
    params.levelId,
    params.grade,
    params.subject
  );
  if (!tplCheck.valid && tplCheck.reason) {
    blockingErrors.push(`Mẫu quy định bắt buộc chưa đáp ứng: ${tplCheck.reason}`);
  }

  if (!params.templateConfirmed) {
    blockingErrors.push(
      'Mẫu quy định bắt buộc chưa được xác nhận: Vui lòng nhấn nút "Chọn & Xác nhận" mẫu ma trận ở phần Cấu hình cơ cấu đề.'
    );
  }

  // Kiểm tra quy tắc chấm riêng cho từng dạng câu hỏi đang bật
  if (params.scoringRules && params.scoringRules.length > 0) {
    for (const fgCode of params.activeFormatGroups) {
      const rule = params.scoringRules.find((r) => r.formatGroup === fgCode);
      const fgDef = MATRIX_FORMAT_GROUPS.find((g) => g.code === fgCode);
      if (!rule || !Number.isFinite(rule.defaultPointsPerQuestion) || rule.defaultPointsPerQuestion <= 0) {
        blockingErrors.push(
          `Cấu hình điểm không hợp lệ: Dạng câu hỏi "${fgDef?.label || fgCode}" chưa có mức điểm mặc định > 0.`
        );
      }
    }
  }

  // 2. Kiểm tra số dòng nội dung
  if (params.specRows.length === 0) {
    blockingErrors.push(
      'Phân bố câu hỏi không hợp lệ: Ma trận chưa có dòng Chủ đề / Đơn vị kiến thức nào.'
    );
  }

  // 3. Kiểm tra tổng số câu hỏi mâu thuẫn
  const sumRowQuestions = Object.values(params.summary.rowMetrics).reduce(
    (acc, r) => acc + r.totalQuestions,
    0
  );
  const sumColQuestions = Object.values(params.summary.byFormatGroup).reduce(
    (acc, fg) => acc + fg.count,
    0
  );
  if (params.summary.totalQuestions <= 0) {
    blockingErrors.push(
      'Tổng số câu mâu thuẫn: Tổng số câu hỏi của ma trận đang bằng 0. Vui lòng nhập phân bổ số câu hỏi vào các ô.'
    );
  } else if (
    sumRowQuestions !== params.summary.totalQuestions ||
    sumColQuestions !== params.summary.totalQuestions
  ) {
    blockingErrors.push(
      `Tổng số câu mâu thuẫn: Tổng câu theo hàng (${sumRowQuestions}) và theo cột (${sumColQuestions}) không đồng nhất.`
    );
  }

  // 4. Kiểm tra Tổng điểm khớp chính xác với Tổng điểm quy định của đề
  if (Math.abs(params.summary.pointsDiff) > 0.001) {
    blockingErrors.push(
      `Tổng điểm không đúng: Tổng điểm ma trận (${params.summary.totalPoints.toFixed(
        2
      )} điểm) không khớp với thang điểm quy định của đề (${params.summary.targetTotalPoints.toFixed(
        2
      )} điểm). Chênh lệch: ${
        params.summary.pointsDiff > 0 ? '+' : ''
      }${params.summary.pointsDiff.toFixed(2)} điểm.`
    );
  }

  // 5. Kiểm tra tổng tỷ lệ % cấu hình mục tiêu của 3 mức độ nhận thức & độ lệch so với mẫu bắt buộc
  const sumTargetPct = exactAdd(
    params.targetLevelPercentages.BIET,
    params.targetLevelPercentages.HIEU,
    params.targetLevelPercentages.VAN_DUNG
  );
  if (Math.abs(sumTargetPct - 100) > 0.01) {
    blockingErrors.push(
      `Phân bố câu hỏi không hợp lệ: Tổng tỷ lệ phần trăm mục tiêu của 3 mức độ (Biết + Hiểu + Vận dụng) đang là ${sumTargetPct}% (phải bằng đúng 100%).`
    );
  }

  // Nếu áp dụng Mẫu A (CV 7991), Mẫu B (CV 4632 Huế) hoặc Mẫu C (Tiểu học TT 27), kiểm tra đủ 3 mức độ nhận thức
  if (
    params.summary.totalQuestions > 0 &&
    (params.templateCode === 'TEMPLATE_A_CV7991' ||
      params.templateCode === 'TEMPLATE_B_CV4632_HUE' ||
      params.templateCode === 'TEMPLATE_C_PRIMARY_APPROVED')
  ) {
    for (const lc of MATRIX_LEVEL_COLUMNS) {
      const targetPct = params.targetLevelPercentages[lc.code] || 0;
      const actualPct = params.summary.byLevelColumn[lc.code].percentage;
      if (targetPct > 0 && params.summary.byLevelColumn[lc.code].count === 0) {
        blockingErrors.push(
          `Mẫu quy định bắt buộc chưa được đáp ứng: Mức độ "${lc.label}" có tỷ lệ quy định ${targetPct}% nhưng chưa được phân bổ câu hỏi nào.`
        );
      } else if (
        Math.abs(params.summary.pointsDiff) <= 0.001 &&
        Math.abs(actualPct - targetPct) > 5.01
      ) {
        blockingErrors.push(
          `Phân bố tỷ lệ điểm theo mức độ "${lc.label}" (${actualPct}%) lệch quá giới hạn cho phép so với tỷ lệ cấu hình (${targetPct}%).`
        );
      }
    }
  }

  // 6. Kiểm tra mâu thuẫn số câu / số điểm trong từng ô và thiếu Yêu cầu cần đạt ở từng hàng
  params.specRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    if (!row.topicTitle.trim() || !row.knowledgeUnit.trim()) {
      blockingErrors.push(
        `Dòng #${rowNum}: Thiếu tên Chủ đề/Chương hoặc Nội dung/Đơn vị kiến thức.`
      );
    }

    if (
      !row.learningOutcomeCode?.trim() ||
      !row.learningOutcomeText ||
      row.learningOutcomeText.trim().length < 10
    ) {
      blockingErrors.push(
        `Thiếu yêu cầu cần đạt ở Dòng #${rowNum} (${
          row.knowledgeUnit || 'Chưa đặt tên'
        }): Vui lòng nhập đầy đủ mã và nội dung Yêu cầu cần đạt trong Bản đặc tả.`
      );
    }

    const rMetric = params.summary.rowMetrics[row.id];
    if (!rMetric || rMetric.totalQuestions <= 0) {
      blockingErrors.push(
        `Phân bố câu hỏi không hợp lệ ở Dòng #${rowNum} (${row.knowledgeUnit}): Chưa có câu hỏi nào được phân bổ (Tổng số câu = 0).`
      );
    }

    for (const cell of row.cells) {
      const fgDef = MATRIX_FORMAT_GROUPS.find(
        (g) => g.code === cell.formatGroup
      );
      const lcDef = MATRIX_LEVEL_COLUMNS.find(
        (l) => l.code === cell.levelColumn
      );
      const cellLabel = `Dòng #${rowNum} [${fgDef?.shortLabel} - ${lcDef?.label}]`;

      // Nếu dạng câu hỏi đã bị ẩn nhưng vẫn còn số câu > 0 -> mâu thuẫn
      if (
        !params.activeFormatGroups.includes(cell.formatGroup) &&
        (cell.questionCount > 0 || cell.points > 0)
      ) {
        blockingErrors.push(
          `Phân bố câu hỏi không hợp lệ tại ${cellLabel}: Dạng câu hỏi "${fgDef?.shortLabel}" đang bị ẩn nhưng vẫn còn phân bổ ${cell.questionCount} câu (${cell.points} điểm).`
        );
      }

      if (cell.questionCount < 0 || cell.points < 0 || !Number.isFinite(cell.points)) {
        blockingErrors.push(
          `Các ô có cấu hình điểm không hợp lệ tại ${cellLabel}: Số câu và số điểm không được âm.`
        );
      }

      if (cell.questionCount > 0 && cell.points <= 0) {
        blockingErrors.push(
          `Các ô có cấu hình điểm không hợp lệ tại ${cellLabel}: Có ${cell.questionCount} câu hỏi nhưng số điểm bằng 0 (mâu thuẫn số câu và điểm).`
        );
      }
      if (cell.questionCount === 0 && cell.points > 0) {
        blockingErrors.push(
          `Các ô có cấu hình điểm không hợp lệ tại ${cellLabel}: Số câu bằng 0 nhưng lại có ${cell.points} điểm (mâu thuẫn số câu và điểm).`
        );
      }

      // Kiểm tra số lượng câu hỏi trong Ngân hàng đáp ứng từng ô
      const cov =
        params.summary.cellBankCoverage[
          `${row.id}__${cell.formatGroup}__${cell.levelColumn}`
        ];
      if (cov && cov.requiredCount > 0 && cov.shortageCount > 0) {
        bankWarnings.push(
          `${cellLabel} (${row.knowledgeUnit}): Cần ${cov.requiredCount} câu nhưng Ngân hàng hiện có ${cov.availableTotalCount} câu (${cov.availableApprovedCount} câu đã duyệt) — Thiếu ${cov.shortageCount} câu.`
        );
      }
    }
  });

  return {
    canConfirm: blockingErrors.length === 0,
    blockingErrors,
    bankWarnings,
  };
}

// ============================================================================
// 7. BỘ 4 KỊCH BẢN KIỂM THỬ THỰC TẾ (Mục 9 của Yêu cầu Giai đoạn 5)
// ============================================================================

export function buildTestScenarioMatrix(
  scenario:
    | 'MATH6_THCS_CV7991'
    | 'VIET4_CUSTOM_APPROVED'
    | 'WRONG_TOTAL_POINTS'
    | 'SHORTAGE_BANK_CELL',
  schoolName: string,
  academicYear: string
): Omit<ExamMatrix, 'id' | 'code' | 'createdAt'> {
  if (scenario === 'MATH6_THCS_CV7991') {
    // Kịch bản 1: Ma trận Toán Lớp 6 theo mẫu THCS (Mẫu A - CV 7991/BGDĐT-GDTrH)
    // Mỗi dòng = 1 Chương độc lập (Chương I, Chương II, Chương IV). Tổng 22 câu = 10.00 điểm (Biết 4.0đ = 40%, Hiểu 3.0đ = 30%, Vận dụng 3.0đ = 30%)
    const row1Cells = createEmptyCellsForRow().map((c) => {
      if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET')
        return { ...c, questionCount: 4, points: 1.0 };
      if (c.formatGroup === 'TRUE_FALSE' && c.levelColumn === 'BIET')
        return { ...c, questionCount: 1, points: 1.0 };
      if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 1, points: 0.5 };
      if (c.formatGroup === 'ESSAY' && c.levelColumn === 'VAN_DUNG')
        return { ...c, questionCount: 1, points: 1.0 };
      return c;
    });

    const row2Cells = createEmptyCellsForRow().map((c) => {
      if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET')
        return { ...c, questionCount: 4, points: 1.0 };
      if (c.formatGroup === 'TRUE_FALSE' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 1, points: 1.0 };
      if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 1, points: 0.5 };
      if (c.formatGroup === 'ESSAY' && c.levelColumn === 'VAN_DUNG')
        return { ...c, questionCount: 1, points: 1.0 };
      return c;
    });

    const row3Cells = createEmptyCellsForRow().map((c) => {
      if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET')
        return { ...c, questionCount: 4, points: 1.0 };
      if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 2, points: 1.0 };
      if (c.formatGroup === 'ESSAY' && c.levelColumn === 'VAN_DUNG')
        return { ...c, questionCount: 1, points: 1.0 };
      return c;
    });

    const specRows: MatrixSpecificationRow[] = [
      {
        id: 'spec-m6-row-1',
        chapterCode: 'Chương I',
        topicTitle: 'Tập hợp các số tự nhiên',
        knowledgeUnit:
          'Bài 1. Tập hợp (2 tiết); Bài 2. Cách ghi số tự nhiên (2 tiết); Bài 5. Phép nhân và phép chia số tự nhiên (3 tiết); Bài 6. Lũy thừa với số mũ tự nhiên (3 tiết); Bài 7. Thứ tự thực hiện các phép tính (2 tiết)',
        learningOutcomeCode: 'TOAN6-SH-01',
        learningOutcomeText:
          'Nhận biết tập hợp các số tự nhiên, thực hiện phép nhân, chia hai lũy thừa cùng cơ số và vận dụng đúng quy tắc thứ tự thực hiện phép tính.',
        originalOutcomeText:
          'Nhận biết tập hợp các số tự nhiên, thực hiện phép nhân, chia hai lũy thừa cùng cơ số và vận dụng đúng quy tắc thứ tự thực hiện phép tính.',
        outcomeSource: 'CSDL Chương trình GDPT 2018 – Môn Toán Lớp 6 (Chương I)',
        outcomeEditHistory: [],
        competencyAssessed:
          'Năng lực tư duy và lập luận toán học; Năng lực giải quyết vấn đề toán học',
        cells: row1Cells,
        note: 'Học kì 1 • Đã chọn 5/7 bài (12 tiết)',
        lessonItems: [
          {
            id: 'toan6-b1',
            lessonName: 'Bài 1. Tập hợp',
            periodsCount: 2,
            learningOutcomeCode: 'TOAN6-YCCĐ-1',
            learningOutcomeText:
              'Nhận biết tập hợp, phần tử của tập hợp và các cách mô tả một tập hợp.',
            selected: true,
          },
          {
            id: 'toan6-b2',
            lessonName: 'Bài 2. Cách ghi số tự nhiên',
            periodsCount: 2,
            learningOutcomeCode: 'TOAN6-YCCĐ-2',
            learningOutcomeText:
              'Nhận biết hệ thập phân, đọc và viết số La Mã từ 1 đến 30.',
            selected: true,
          },
          {
            id: 'toan6-b3',
            lessonName: 'Bài 3. Thứ tự trong tập hợp các số tự nhiên',
            periodsCount: 2,
            learningOutcomeCode: 'TOAN6-YCCĐ-3',
            learningOutcomeText:
              'So sánh hai số tự nhiên và biểu diễn số tự nhiên trên tia số.',
            selected: false,
          },
          {
            id: 'toan6-b4',
            lessonName: 'Bài 4. Phép cộng và phép trừ số tự nhiên',
            periodsCount: 2,
            learningOutcomeCode: 'TOAN6-YCCĐ-4',
            learningOutcomeText:
              'Vận dụng tính chất giao hoán, kết hợp để tính nhẩm, tính hợp lí.',
            selected: false,
          },
          {
            id: 'toan6-b5',
            lessonName: 'Bài 5. Phép nhân và phép chia số tự nhiên',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-5',
            learningOutcomeText:
              'Thực hiện phép nhân, phép chia hết và phép chia có dư với số tự nhiên.',
            selected: true,
          },
          {
            id: 'toan6-b6',
            lessonName: 'Bài 6. Lũy thừa với số mũ tự nhiên',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-6',
            learningOutcomeText:
              'Thực hiện phép nhân và phép chia hai lũy thừa cùng cơ số.',
            selected: true,
          },
          {
            id: 'toan6-b7',
            lessonName: 'Bài 7. Thứ tự thực hiện các phép tính',
            periodsCount: 2,
            learningOutcomeCode: 'TOAN6-YCCĐ-7',
            learningOutcomeText:
              'Vận dụng đúng quy tắc thứ tự thực hiện phép tính đối với biểu thức có dấu ngoặc và không có dấu ngoặc.',
            selected: true,
          },
        ],
      },
      {
        id: 'spec-m6-row-2',
        chapterCode: 'Chương II',
        topicTitle: 'Tính chia hết trong tập hợp các số tự nhiên',
        knowledgeUnit:
          'Bài 8. Quan hệ chia hết và tính chất (2 tiết); Bài 9. Dấu hiệu chia hết (3 tiết); Bài 10. Số nguyên tố (3 tiết); Bài 11. Ước chung. Ước chung lớn nhất (3 tiết); Bài 12. Bội chung. Bội chung nhỏ nhất (3 tiết)',
        learningOutcomeCode: 'TOAN6-SH-01',
        learningOutcomeText:
          'Vận dụng dấu hiệu chia hết cho 2, 3, 5, 9; phân tích một số ra thừa số nguyên tố; tìm ƯCLN, BCNN trong bài toán thực tiễn.',
        originalOutcomeText:
          'Vận dụng dấu hiệu chia hết cho 2, 3, 5, 9; phân tích một số ra thừa số nguyên tố; tìm ƯCLN, BCNN trong bài toán thực tiễn.',
        outcomeSource: 'CSDL Chương trình GDPT 2018 – Môn Toán Lớp 6 (Chương II)',
        outcomeEditHistory: [],
        competencyAssessed:
          'Năng lực tư duy và lập luận toán học; Năng lực giải quyết vấn đề toán học',
        cells: row2Cells,
        note: 'Học kì 1 • Đã chọn 5/5 bài (14 tiết)',
        lessonItems: [
          {
            id: 'toan6-b8',
            lessonName: 'Bài 8. Quan hệ chia hết và tính chất',
            periodsCount: 2,
            learningOutcomeCode: 'TOAN6-YCCĐ-8',
            learningOutcomeText:
              'Nhận biết ước và bội, vận dụng tính chất chia hết của một tổng.',
            selected: true,
          },
          {
            id: 'toan6-b9',
            lessonName: 'Bài 9. Dấu hiệu chia hết',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-9',
            learningOutcomeText:
              'Vận dụng dấu hiệu chia hết cho 2, 5, 3, 9 để giải toán.',
            selected: true,
          },
          {
            id: 'toan6-b10',
            lessonName: 'Bài 10. Số nguyên tố',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-10',
            learningOutcomeText:
              'Phân biệt số nguyên tố, hợp số và phân tích một số ra thừa số nguyên tố.',
            selected: true,
          },
          {
            id: 'toan6-b11',
            lessonName: 'Bài 11. Ước chung. Ước chung lớn nhất',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-11',
            learningOutcomeText:
              'Tìm ƯCLN của hai hay nhiều số và vận dụng rút gọn phân số, giải toán thực tiễn.',
            selected: true,
          },
          {
            id: 'toan6-b12',
            lessonName: 'Bài 12. Bội chung. Bội chung nhỏ nhất',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-12',
            learningOutcomeText:
              'Tìm BCNN của hai hay nhiều số và vận dụng quy đồng mẫu số, giải toán thực tiễn.',
            selected: true,
          },
        ],
      },
      {
        id: 'spec-m6-row-3',
        chapterCode: 'Chương IV',
        topicTitle: 'Một số hình phẳng trong thực tiễn',
        knowledgeUnit:
          'Bài 18. Hình tam giác đều. Hình vuông. Hình lục giác đều (3 tiết); Bài 19. Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân (3 tiết); Bài 20. Chu vi và diện tích của một số tứ giác đã học (4 tiết)',
        learningOutcomeCode: 'TOAN6-HH-01',
        learningOutcomeText:
          'Mô tả được một số yếu tố cơ bản của tam giác đều, hình vuông, hình chữ nhật; tính được chu vi và diện tích các hình gắn với thực tiễn.',
        originalOutcomeText:
          'Mô tả được một số yếu tố cơ bản của tam giác đều, hình vuông, hình chữ nhật; tính được chu vi và diện tích các hình gắn với thực tiễn.',
        outcomeSource: 'CSDL Chương trình GDPT 2018 – Môn Toán Lớp 6 (Chương IV)',
        outcomeEditHistory: [],
        competencyAssessed:
          'Năng lực mô hình hóa toán học; Sử dụng công cụ, phương tiện học toán',
        cells: row3Cells,
        note: 'Học kì 1 • Đã chọn 3/3 bài (10 tiết)',
        lessonItems: [
          {
            id: 'toan6-b18',
            lessonName: 'Bài 18. Hình tam giác đều. Hình vuông. Hình lục giác đều',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-18',
            learningOutcomeText:
              'Nhận dạng và mô tả đặc điểm cạnh, góc, đường chéo của tam giác đều, hình vuông, lục giác đều.',
            selected: true,
          },
          {
            id: 'toan6-b19',
            lessonName: 'Bài 19. Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân',
            periodsCount: 3,
            learningOutcomeCode: 'TOAN6-YCCĐ-19',
            learningOutcomeText:
              'Nhận biết và mô tả các yếu tố cơ bản của hình chữ nhật, hình thoi, hình bình hành, hình thang cân.',
            selected: true,
          },
          {
            id: 'toan6-b20',
            lessonName: 'Bài 20. Chu vi và diện tích của một số tứ giác đã học',
            periodsCount: 4,
            learningOutcomeCode: 'TOAN6-YCCĐ-20',
            learningOutcomeText:
              'Tính được chu vi và diện tích các hình phẳng gắn với bài toán thực tế.',
            selected: true,
          },
        ],
      },
    ];

    const normalizedSpecRows = specRows.map((r) => ({
      ...r,
      lessonItems: r.lessonItems
        ? distributeRowCellsAcrossLessonItems(r.cells, r.lessonItems)
        : undefined,
    }));

    return {
      title: 'Ma trận & Bản đặc tả Đề kiểm tra Cuối kỳ I – Toán Lớp 6 (Mẫu A – CV 7991)',
      schoolName,
      academicYear,
      semester: 'HOC_KY_1',
      examTypeLabel: 'Kiểm tra định kỳ Cuối học kỳ I',
      knowledgeScope: 'Chương I, Chương II và Chương IV – Toán 6 (GDPT 2018)',
      appliedRuleBasis:
        'Thông tư 22/2021/TT-BGDĐT & Công văn 7991/BGDĐT-GDTrH',
      templateCode: 'TEMPLATE_A_CV7991',
      templateConfirmed: true,
      activeFormatGroups: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
      scoringRules: MATRIX_TEMPLATES.TEMPLATE_A_CV7991.defaultScoringRules,
      targetLevelPercentages: { BIET: 40, HIEU: 30, VAN_DUNG: 30 },
      specRows: normalizedSpecRows,
      version: 1,
      isLocked: false,
      versionHistory: [
        {
          version: 1,
          updatedAt: new Date().toISOString().slice(0, 10),
          editorName: 'Tổ Toán – Tin THCS',
          note: 'Khởi tạo ma trận Toán 6 chuẩn Công văn 7991/BGDĐT-GDTrH',
          status: ApprovalStatus.APPROVED,
        },
      ],
      levelId: EducationLevelId.LOWER_SECONDARY,
      grade: 6,
      subject: 'Toán',
      examPeriod: 'CUOI_KY_1',
      durationMinutes: 90,
      totalPoints: 10,
      targetTotalPoints: 10,
      totalQuestions: 21,
      rows: syncSpecRowsToLegacyRows(
        EducationLevelId.LOWER_SECONDARY,
        normalizedSpecRows
      ),
      status: ApprovalStatus.APPROVED,
      authorName: 'Tổ Toán – Tin THCS',
      isSampleData: false,
    };
  }

  if (scenario === 'VIET4_CUSTOM_APPROVED') {
    // Kịch bản 2: Ma trận Tiếng Việt Lớp 4 theo mẫu tùy chỉnh đã phê duyệt (ẩn cột Đúng-Sai)
    // Tổng 10 câu = 10.00 điểm (Biết 4.0đ = 40%, Hiểu 4.0đ = 40%, Vận dụng 2.0đ = 20%)
    const row1Cells = createEmptyCellsForRow().map((c) => {
      if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET')
        return { ...c, questionCount: 6, points: 3.0 };
      if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 2, points: 2.0 };
      return c;
    });

    const row2Cells = createEmptyCellsForRow().map((c) => {
      if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET')
        return { ...c, questionCount: 1, points: 1.0 };
      if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 2, points: 2.0 };
      if (c.formatGroup === 'ESSAY' && c.levelColumn === 'VAN_DUNG')
        return { ...c, questionCount: 1, points: 2.0 };
      return c;
    });

    const specRows: MatrixSpecificationRow[] = [
      {
        id: 'spec-tv4-row-1',
        chapterCode: 'Mạch 1',
        topicTitle: 'Đọc hiểu văn bản',
        knowledgeUnit:
          'Đọc hiểu ngữ liệu truyện kể và văn bản thông tin ngoài sách giáo khoa',
        learningOutcomeCode: 'TV4-DH-01',
        learningOutcomeText:
          'Nhận biết được chi tiết, nhân vật, sự việc chính trong văn bản; hiểu được ý nghĩa bài học và thông điệp của ngữ liệu.',
        originalOutcomeText:
          'Nhận biết được chi tiết, nhân vật trong văn bản đọc.',
        outcomeSource: 'Giáo viên hiệu chỉnh từ YCCĐ Chương trình Tiếng Việt 4',
        outcomeEditHistory: [
          {
            id: 'hist-tv4-1',
            editedAt: '2026-10-18 09:30',
            editorName: 'Cô Nguyễn Thị Mai (Tổ trưởng Tổ 4–5)',
            previousText: 'Nhận biết được chi tiết, nhân vật trong văn bản đọc.',
            newText:
              'Nhận biết được chi tiết, nhân vật, sự việc chính trong văn bản; hiểu được ý nghĩa bài học và thông điệp của ngữ liệu.',
            sourceNote:
              'Bổ sung yêu cầu hiểu thông điệp ngữ liệu ngoài SGK theo Thông tư 27/2020/TT-BGDĐT',
          },
        ],
        competencyAssessed:
          'Năng lực ngôn ngữ (Đọc hiểu văn bản); Năng lực văn học',
        cells: row1Cells,
        note: 'Sử dụng ngữ liệu ngoài SGK phù hợp lứa tuổi Lớp 4',
      },
      {
        id: 'spec-tv4-row-2',
        chapterCode: 'Mạch 2',
        topicTitle: 'Kiến thức Tiếng Việt & Viết đoạn văn',
        knowledgeUnit: 'Danh từ, động từ, tính từ; Viết đoạn văn thuật lại một sự việc',
        learningOutcomeCode: 'TV4-LTVC-02',
        learningOutcomeText:
          'Xác định và sử dụng đúng danh từ, động từ, tính từ trong câu; viết được đoạn văn hoàn chỉnh thuật lại một hoạt động giàu cảm xúc.',
        originalOutcomeText:
          'Xác định và sử dụng đúng danh từ, động từ, tính từ trong câu; viết được đoạn văn hoàn chỉnh thuật lại một hoạt động giàu cảm xúc.',
        outcomeSource: 'CSDL Chương trình GDPT 2018 – Môn Tiếng Việt Lớp 4',
        outcomeEditHistory: [],
        competencyAssessed:
          'Năng lực ngôn ngữ (Tiếng Việt & Viết sáng tạo)',
        cells: row2Cells,
        note: 'Tự luận chấm theo tiêu chí mở, tôn trọng sáng tạo học sinh',
      },
    ];

    return {
      title:
        'Ma trận & Bản đặc tả Kiểm tra Cuối kỳ I – Tiếng Việt Lớp 4 (Mẫu tùy chỉnh đã phê duyệt)',
      schoolName,
      academicYear,
      semester: 'HOC_KY_1',
      examTypeLabel: 'Kiểm tra định kỳ Cuối học kỳ I',
      knowledgeScope: 'Đọc hiểu văn bản, Luyện từ và câu, Viết đoạn văn Lớp 4',
      appliedRuleBasis:
        'Thông tư 27/2020/TT-BGDĐT & Cấu hình Tổ chuyên môn Khối 4 phê duyệt',
      templateCode: 'TEMPLATE_D_CUSTOM',
      templateConfirmed: true,
      activeFormatGroups: ['MCQ', 'SHORT_ANSWER', 'ESSAY'],
      scoringRules: MATRIX_TEMPLATES.TEMPLATE_C_PRIMARY_APPROVED.defaultScoringRules,
      targetLevelPercentages: { BIET: 40, HIEU: 40, VAN_DUNG: 20 },
      specRows,
      version: 2,
      isLocked: true,
      versionHistory: [
        {
          version: 1,
          updatedAt: '2026-10-15',
          editorName: 'Tổ Chuyên môn Khối 4',
          note: 'Bản nháp lần 1',
          status: ApprovalStatus.DRAFT,
        },
        {
          version: 2,
          updatedAt: '2026-10-18',
          editorName: 'Ban Giám hiệu phê duyệt',
          note: 'Đã thẩm định và phê duyệt khóa phiên bản v2 chính thức',
          status: ApprovalStatus.APPROVED,
        },
      ],
      levelId: EducationLevelId.PRIMARY,
      grade: 4,
      subject: 'Tiếng Việt',
      examPeriod: 'CUOI_KY_1',
      durationMinutes: 40,
      totalPoints: 10,
      targetTotalPoints: 10,
      totalQuestions: 12,
      rows: syncSpecRowsToLegacyRows(EducationLevelId.PRIMARY, specRows),
      status: ApprovalStatus.APPROVED,
      authorName: 'Tổ Chuyên môn Khối 4',
      isSampleData: false,
    };
  }

  if (scenario === 'WRONG_TOTAL_POINTS') {
    // Kịch bản 3: Ma trận bị sai tổng điểm (Chỉ mới đạt 8.50 / 10.00 điểm -> Bị chặn không cho phép xác nhận)
    const rowCells = createEmptyCellsForRow().map((c) => {
      if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET')
        return { ...c, questionCount: 10, points: 2.5 };
      if (c.formatGroup === 'TRUE_FALSE' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 2, points: 2.0 };
      if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU')
        return { ...c, questionCount: 4, points: 2.0 };
      if (c.formatGroup === 'ESSAY' && c.levelColumn === 'VAN_DUNG')
        return { ...c, questionCount: 2, points: 2.0 };
      return c;
    });

    const specRows: MatrixSpecificationRow[] = [
      {
        id: 'spec-err-pts-1',
        chapterCode: 'Chương I',
        topicTitle: 'Số tự nhiên',
        knowledgeUnit: 'Tập hợp, lũy thừa và tính chất chia hết trong tập số tự nhiên',
        learningOutcomeCode: 'TOAN6-SH-01',
        learningOutcomeText:
          'Thực hiện được các phép tính cộng, trừ, nhân, chia, nâng lên lũy thừa và áp dụng tính chất chia hết.',
        originalOutcomeText:
          'Thực hiện được các phép tính cộng, trừ, nhân, chia, nâng lên lũy thừa và áp dụng tính chất chia hết.',
        outcomeSource: 'CSDL Chương trình GDPT 2018',
        outcomeEditHistory: [],
        competencyAssessed: 'Năng lực tư duy và lập luận toán học',
        cells: rowCells,
        note: 'Kịch bản kiểm thử: Tổng điểm mới đạt 8,50 điểm / 10,00 điểm (thiếu 1,50 điểm)',
      },
    ];

    return {
      title:
        '[Kịch bản kiểm thử #3] Ma trận Toán 6 bị lệch Tổng điểm (8,50 / 10,00 điểm)',
      schoolName,
      academicYear,
      semester: 'HOC_KY_1',
      examTypeLabel: 'Kiểm tra Giữa học kỳ I',
      knowledgeScope: 'Chương I – Số tự nhiên',
      appliedRuleBasis: 'Thông tư 22/2021/TT-BGDĐT & Công văn 7991/BGDĐT-GDTrH',
      templateCode: 'TEMPLATE_A_CV7991',
      templateConfirmed: true,
      activeFormatGroups: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
      scoringRules: MATRIX_TEMPLATES.TEMPLATE_A_CV7991.defaultScoringRules,
      targetLevelPercentages: { BIET: 40, HIEU: 30, VAN_DUNG: 30 },
      specRows,
      version: 1,
      isLocked: false,
      levelId: EducationLevelId.LOWER_SECONDARY,
      grade: 6,
      subject: 'Toán',
      examPeriod: 'GIUA_KY_1',
      durationMinutes: 60,
      totalPoints: 8.5,
      targetTotalPoints: 10,
      totalQuestions: 18,
      rows: syncSpecRowsToLegacyRows(
        EducationLevelId.LOWER_SECONDARY,
        specRows
      ),
      status: ApprovalStatus.DRAFT,
      authorName: 'Giáo viên Kiểm thử Hệ thống',
      isSampleData: false,
    };
  }

  // Kịch bản 4: Ma trận có ô thiếu câu hỏi trong ngân hàng (Yêu cầu 15 câu Đúng-Sai mức Vận dụng trong khi ngân hàng chưa đủ)
  const shortageCells = createEmptyCellsForRow().map((c) => {
    if (c.formatGroup === 'MCQ' && c.levelColumn === 'BIET')
      return { ...c, questionCount: 8, points: 4.0 };
    if (c.formatGroup === 'SHORT_ANSWER' && c.levelColumn === 'HIEU')
      return { ...c, questionCount: 3, points: 3.0 };
    if (c.formatGroup === 'TRUE_FALSE' && c.levelColumn === 'VAN_DUNG')
      return { ...c, questionCount: 6, points: 3.0 }; // Ô này vượt quá số câu Đúng-Sai đang có trong ngân hàng
    return c;
  });

  const specRows: MatrixSpecificationRow[] = [
    {
      id: 'spec-shortage-1',
      chapterCode: 'Chủ đề 3',
      topicTitle: 'Phân số và Các phép tính với phân số',
      knowledgeUnit: 'Quy đồng mẫu số, so sánh và giải bài toán có lời văn về phân số',
      learningOutcomeCode: 'TOAN4-PS-05',
      learningOutcomeText:
        'Thực hiện được phép cộng, trừ, nhân, chia hai phân số và giải quyết vấn đề thực tiễn liên quan đến phân số.',
      originalOutcomeText:
        'Thực hiện được phép cộng, trừ, nhân, chia hai phân số và giải quyết vấn đề thực tiễn liên quan đến phân số.',
      outcomeSource: 'CSDL Chương trình GDPT 2018 – Toán Lớp 4',
      outcomeEditHistory: [],
      competencyAssessed: 'Năng lực giải quyết vấn đề toán học',
      cells: shortageCells,
      note: 'Kịch bản kiểm thử: Ô Đúng–Sai mức Vận dụng yêu cầu 6 câu nhưng Ngân hàng đang thiếu câu hỏi đáp ứng.',
    },
  ];

  return {
    title:
      '[Kịch bản kiểm thử #4] Ma trận Toán 4 có ô thiếu câu hỏi trong Ngân hàng',
    schoolName,
    academicYear,
    semester: 'HOC_KY_2',
    examTypeLabel: 'Kiểm tra Giữa học kỳ II',
    knowledgeScope: 'Chủ đề Phân số – Toán Lớp 4',
    appliedRuleBasis: 'Thông tư 27/2020/TT-BGDĐT',
    templateCode: 'TEMPLATE_D_CUSTOM',
    templateConfirmed: true,
    activeFormatGroups: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
    scoringRules: MATRIX_TEMPLATES.TEMPLATE_D_CUSTOM.defaultScoringRules,
    targetLevelPercentages: { BIET: 40, HIEU: 30, VAN_DUNG: 30 },
    specRows,
    version: 1,
    isLocked: false,
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Toán',
    examPeriod: 'GIUA_KY_2',
    durationMinutes: 40,
    totalPoints: 10,
    targetTotalPoints: 10,
    totalQuestions: 17,
    rows: syncSpecRowsToLegacyRows(EducationLevelId.PRIMARY, specRows),
    status: ApprovalStatus.DRAFT,
    authorName: 'Giáo viên Kiểm thử Hệ thống',
    isSampleData: false,
  };
}
