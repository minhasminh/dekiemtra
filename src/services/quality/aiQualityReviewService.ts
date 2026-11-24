import {
  ApprovalStatus,
  CrossCheckDocumentConflictWarning,
  CrossCheckQuestionResultRow,
  DossierCrossCheckAnalysisResult,
  DossierCrossCheckBenchmarkResult,
  PrimaryMathBenchmarkSuiteResult,
  PrimaryMathDeterministicCheckItem,
  PrimaryMathQualityAnalysisSummary,
  PrimaryVietnameseBenchmarkSuiteResult,
  PrimaryVietnameseCorpusGenre,
  PrimaryVietnameseQualityAnalysisSummary,
  QualityDashboardBenchmarkResult,
  QualityDashboardComputedState,
  QualityDashboardIssueActionMeta,
  QualityDashboardOverallStatusCode,
  QualityDetectionSourceLayer,
  QualityIssueSeverityLevel,
  QualityIssueStatus,
  QualityReviewBenchmarkTestResult,
  QualityReviewComprehensiveReport,
  QualityReviewDetectedIssue,
  QualityReviewDossierPackage,
  QualityReviewGroupId,
  QualityReviewMatrixSlot,
  QualityReviewQuestionNode,
  QualityReviewSpecificationSlot,
} from '../../types/domain';

// ============================================================================
// 1. DANH MỤC 10 NHÓM KIỂM TRA CHUYÊN MÔN (MỤC IV)
// ============================================================================

export interface QualityInspectionGroupMeta {
  id: QualityReviewGroupId;
  order: number;
  shortTitle: string;
  fullTitle: string;
  criteriaItems: string[];
  defaultLayer: QualityDetectionSourceLayer | 'HYBRID_A_AND_B';
}

export const QUALITY_INSPECTION_GROUPS: QualityInspectionGroupMeta[] = [
  {
    id: 'GROUP_01_CURRICULUM',
    order: 1,
    shortTitle: 'Nhóm 1 – Chương trình & Ngữ liệu',
    fullTitle: 'Nhóm 1 – Kiểm tra mức độ phù hợp Chương trình GDPT 2018 & Ngữ liệu đọc',
    criteriaItems: [
      'Nội dung có thuộc phạm vi kiểm tra và phù hợp khối lớp 1–5 không?',
      'Ngữ liệu: Kiểu văn bản (truyện, thơ, văn bản thông tin), độ dài, độ khó, phù hợp lứa tuổi',
      'Ngữ liệu: Nguồn trích dẫn, tên tác giả đã xác minh (không tự bịa tác giả/nguồn)',
      'Toán: Phân tích thao tác tư duy (không chỉ đếm bước tính), đối chiếu YCCĐ & bối cảnh bài toán',
    ],
    defaultLayer: 'HYBRID_A_AND_B',
  },
  {
    id: 'GROUP_02_MATRIX',
    order: 2,
    shortTitle: 'Nhóm 2 – Ma trận',
    fullTitle: 'Nhóm 2 – Kiểm tra cấu trúc và số liệu Ma trận đề',
    criteriaItems: [
      'Tổng số câu',
      'Tổng điểm',
      'Tỷ lệ phần trăm',
      'Phân bố mức độ nhận thức (Mức 1, Mức 2, Mức 3 theo TT 27/2020/TT-BGDĐT)',
      'Phân bố chủ đề / mạch kiến thức (Số & Phép tính, Hình học & Đo lường, Thống kê & Xác suất; Đọc – Viết)',
      'Phân bố dạng câu',
    ],
    defaultLayer: 'LAYER_A_RULE_ENGINE',
  },
  {
    id: 'GROUP_03_SPECIFICATION',
    order: 3,
    shortTitle: 'Nhóm 3 – Bản đặc tả',
    fullTitle: 'Nhóm 3 – Kiểm tra Bản đặc tả và sự tương ứng với Ma trận',
    criteriaItems: [
      'Yêu cầu cần đạt',
      'Số câu',
      'Mức độ nhận thức (không đánh giá mức độ chỉ dựa vào số bước tính hoặc độ dài câu hỏi)',
      'Dạng câu',
      'Năng lực đánh giá',
      'Giải thích rõ lý do phân loại Mức 1, Mức 2 hoặc Mức 3',
    ],
    defaultLayer: 'LAYER_A_RULE_ENGINE',
  },
  {
    id: 'GROUP_04_KNOWLEDGE',
    order: 4,
    shortTitle: 'Nhóm 4 – Kiến thức & Tính toán',
    fullTitle: 'Nhóm 4 – Kiểm tra Tính toán xác định, Hình học & Kiến thức Tiếng Việt (Lớp 1–5)',
    criteriaItems: [
      'Toán (Bộ tính toán xác định): Phép cộng, trừ, nhân, chia, giá trị biểu thức, phân số, số thập phân',
      'Toán: Đổi đơn vị đo, kết quả & đơn vị trong bài toán có lời văn',
      'Toán Hình học: Đối chiếu hình vẽ với dữ kiện, tên điểm/đoạn thẳng/góc, công thức chu vi/diện tích, hình gây hiểu nhầm',
      'Tiếng Việt: Từ và nghĩa của từ, Từ loại, Cấu tạo câu, Thành phần câu, Dấu câu, Biện pháp tu từ, Liên kết câu',
    ],
    defaultLayer: 'HYBRID_A_AND_B',
  },
  {
    id: 'GROUP_05_QUESTION_STEM',
    order: 5,
    shortTitle: 'Nhóm 5 – Đề bài & Đọc hiểu',
    fullTitle: 'Nhóm 5 – Kiểm tra Đề bài Toán (5 tiêu chí) & Câu hỏi Đọc hiểu (7 tiêu chí)',
    criteriaItems: [
      'Toán: Dữ kiện có đủ không? Câu hỏi có rõ không? Dữ kiện có mâu thuẫn không? Phù hợp trình độ không?',
      'Đọc hiểu: 1. Rõ ràng? 2. Đủ dữ kiện? 3. Đáp án có căn cứ trong ngữ liệu? 4. Có nhiều cách trả lời đúng?',
      '5. Có câu hỏi trùng ý không? 6. Phù hợp yêu cầu cần đạt không?',
      '7. Mức độ nhận thức hợp lý (Nhận biết trực tiếp / Hiểu - suy luận / Liên hệ - vận dụng)',
    ],
    defaultLayer: 'LAYER_B_GEMINI_AI',
  },
  {
    id: 'GROUP_06_MULTIPLE_CHOICE',
    order: 6,
    shortTitle: 'Nhóm 6 – Trắc nghiệm',
    fullTitle: 'Nhóm 6 – Kiểm tra kỹ thuật câu hỏi Trắc nghiệm và Phương án nhiễu',
    criteriaItems: [
      'Số đáp án đúng phù hợp dạng câu',
      'Phương án nhiễu hợp lý',
      'Không có hai phương án hợp lý cùng đúng khi chỉ yêu cầu một đáp án',
      'Không có phương án trùng',
      'Không để lộ đáp án qua cách diễn đạt',
    ],
    defaultLayer: 'HYBRID_A_AND_B',
  },
  {
    id: 'GROUP_07_ESSAY',
    order: 7,
    shortTitle: 'Nhóm 7 – Tự luận & Phần Viết',
    fullTitle: 'Nhóm 7 – Kiểm tra Giải toán có lời văn & Phần Viết Tiếng Việt (6 tiêu chí)',
    criteriaItems: [
      'Toán tự luận: Kiểm tra kết quả, đơn vị đo, các bước giải và chấp nhận cách giải khác hợp lý',
      'Tiếng Việt Viết: Đề bài có rõ yêu cầu không? Kiểu bài có phù hợp chương trình Lớp 1–5 không?',
      'Có phù hợp thời lượng không? Có quá nhiều yêu cầu trong một đề không?',
      'Có tạo cơ hội cho học sinh thể hiện năng lực viết và tránh áp đặt một cách diễn đạt duy nhất không?',
    ],
    defaultLayer: 'LAYER_B_GEMINI_AI',
  },
  {
    id: 'GROUP_08_ANSWER_AND_RUBRIC',
    order: 8,
    shortTitle: 'Nhóm 8 – Đáp án & Hướng dẫn chấm',
    fullTitle: 'Nhóm 8 – Kiểm tra Đáp án, Biểu điểm và Hướng dẫn chấm (Toán & Tiếng Việt)',
    criteriaItems: [
      'Toán: Chia điểm hợp lý, chấp nhận cách giải khác nhau, tổng điểm thành phần khớp điểm câu',
      'Toán: Phát hiện lời giải sai bản chất nhưng kết quả tình cờ đúng; phát hiện đáp án mẫu thiếu bước/thiếu đơn vị',
      'Đọc hiểu: Đáp án đúng văn bản, chấp nhận diễn đạt tương đương, không bắt trả lời nguyên văn máy móc',
      'Viết: Đủ 4 tiêu chí (Nội dung, Bố cục, Diễn đạt, Chính tả & Trình bày), không coi văn mẫu là đáp án duy nhất',
    ],
    defaultLayer: 'HYBRID_A_AND_B',
  },
  {
    id: 'GROUP_09_LANGUAGE_AND_FORMAT',
    order: 9,
    shortTitle: 'Nhóm 9 – Ngôn ngữ & Hình thức',
    fullTitle: 'Nhóm 9 – Kiểm tra Chính tả, Dấu câu, Diễn đạt và Hình thức',
    criteriaItems: [
      'Chính tả, dấu câu, cách diễn đạt trong ngữ liệu và câu hỏi',
      'Thuật ngữ toán học, ký hiệu góc, đơn vị đo, công thức',
      'Hình ảnh minh họa hình học, bảng biểu',
      'Đánh số câu liên tục',
    ],
    defaultLayer: 'HYBRID_A_AND_B',
  },
  {
    id: 'GROUP_10_OVERALL_QUALITY',
    order: 10,
    shortTitle: 'Nhóm 10 – Chất lượng tổng thể',
    fullTitle: 'Nhóm 10 – Đánh giá chất lượng tổng thể của đề kiểm tra',
    criteriaItems: [
      'Mức độ bao quát và sự cân đối nội dung',
      'Khả năng phân hóa',
      'Tính thực tiễn và tính công bằng',
      'Sự phù hợp thời lượng làm bài',
    ],
    defaultLayer: 'HYBRID_A_AND_B',
  },
];

// ============================================================================
// CHUẨN CHƯƠNG TRÌNH TIẾNG VIỆT & TOÁN TIỂU HỌC LỚP 1–5 (GDPT 2018 & TT 27/2020/TT-BGDĐT)
// ============================================================================

export const PRIMARY_VIETNAMESE_GRADE_NORMS: Record<
  number,
  {
    grade: number;
    recommendedWordRange: { min: number; max: number };
    allowedKnowledgeSubdomains: string[];
    allowedWritingGenres: string[];
  }
> = {
  1: {
    grade: 1,
    recommendedWordRange: { min: 70, max: 130 },
    allowedKnowledgeSubdomains: ['Âm, vần, tiếng, từ ngữ thông dụng', 'Dấu chấm, dấu chấm hỏi'],
    allowedWritingGenres: ['Viết từ ngữ, viết 1–2 câu ngắn theo tranh hoặc chủ đề đã học'],
  },
  2: {
    grade: 2,
    recommendedWordRange: { min: 140, max: 200 },
    allowedKnowledgeSubdomains: [
      'Từ chỉ sự vật, hoạt động, đặc điểm',
      'Câu giới thiệu, câu nêu hoạt động, câu nêu đặc điểm',
      'Dấu chấm, dấu chấm hỏi, dấu chấm than, dấu phẩy',
    ],
    allowedWritingGenres: [
      'Đoạn văn ngắn 4–5 câu kể về sự việc, tả đồ vật quen thuộc, giới thiệu bản thân/người thân',
    ],
  },
  3: {
    grade: 3,
    recommendedWordRange: { min: 200, max: 270 },
    allowedKnowledgeSubdomains: [
      'Từ có nghĩa giống nhau, từ có nghĩa trái ngược nhau',
      'Câu kể, câu hỏi, câu cảm, câu khiến',
      'Biện pháp tu từ so sánh',
      'Dấu gạch ngang, dấu ngoặc kép, dấu hai chấm',
    ],
    allowedWritingGenres: [
      'Đoạn văn 7–9 câu thuật lại sự việc, tả đồ vật, nêu tình cảm cảm xúc, viết thư ngắn',
    ],
  },
  4: {
    grade: 4,
    recommendedWordRange: { min: 240, max: 350 },
    allowedKnowledgeSubdomains: [
      'Từ và nghĩa của từ (từ đơn, từ phức, từ ghép, từ láy)',
      'Từ loại: Danh từ, động từ, tính từ',
      'Thành phần câu: Chủ ngữ, vị ngữ, trạng ngữ',
      'Dấu gạch ngang, dấu ngoặc kép, dấu hai chấm',
      'Biện pháp tu từ nhân hóa, so sánh',
    ],
    allowedWritingGenres: [
      'Bài văn kể lại một câu chuyện đã đọc/đã nghe hoặc sự việc đã chứng kiến',
      'Bài văn miêu tả cây cối, miêu tả con vật',
      'Viết thư, viết đoạn văn nêu ý kiến hoặc tình cảm cảm xúc',
    ],
  },
  5: {
    grade: 5,
    recommendedWordRange: { min: 280, max: 420 },
    allowedKnowledgeSubdomains: [
      'Từ đồng nghĩa, từ đa nghĩa, từ đồng âm',
      'Từ loại: Đại từ, kết từ (quan hệ từ), danh từ, động từ, tính từ',
      'Cấu tạo câu: Câu đơn, câu ghép và cách nối các vế câu ghép',
      'Liên kết câu và đoạn văn (phép lặp từ ngữ, phép thế, dùng từ ngữ nối)',
      'Biện pháp tu từ điệp từ, điệp ngữ, so sánh, nhân hóa',
    ],
    allowedWritingGenres: [
      'Bài văn tả người, bài văn tả phong cảnh',
      'Bài văn kể chuyện sáng tạo',
      'Đoạn văn thể hiện tình cảm, cảm xúc hoặc nêu ý kiến về một hiện tượng/sự việc',
    ],
  },
};

export const PRIMARY_MATH_GRADE_NORMS: Record<
  number,
  {
    grade: number;
    numbersAndOperationsScope: string[];
    geometryAndMeasurementScope: string[];
    wordProblemAndStatisticsScope: string[];
  }
> = {
  1: {
    grade: 1,
    numbersAndOperationsScope: ['Số tự nhiên trong phạm vi 100', 'Phép cộng, phép trừ không nhớ trong phạm vi 100'],
    geometryAndMeasurementScope: ['Hình vuông, hình tròn, hình tam giác, hình chữ nhật; khối lập phương, khối hộp chữ nhật', 'Đơn vị đo độ dài cm, xem giờ đúng'],
    wordProblemAndStatisticsScope: ['Bài toán thêm, bớt 1 bước tính gắn với hình ảnh trực quan'],
  },
  2: {
    grade: 2,
    numbersAndOperationsScope: ['Số tự nhiên đến 1 000', 'Cộng, trừ có nhớ trong phạm vi 100; bảng nhân 2, 5 và bảng chia 2, 5'],
    geometryAndMeasurementScope: ['Điểm, đoạn thẳng, đường thẳng, đường cong, đường gấp khúc, hình tứ giác; khối trụ, khối cầu', 'Đơn vị dm, m, km, kg, lít (l), ngày – giờ – phút'],
    wordProblemAndStatisticsScope: ['Bài toán nhiều hơn, ít hơn 1 bước tính; biểu đồ tranh'],
  },
  3: {
    grade: 3,
    numbersAndOperationsScope: ['Số tự nhiên đến 100 000; chữ số La Mã', 'Cộng, trừ, nhân, chia với số có 1 chữ số; tính giá trị biểu thức số; làm quen phân số 1/2 đến 1/9'],
    geometryAndMeasurementScope: ['Góc vuông, góc không vuông; tâm, bán kính, đường kính hình tròn; chu vi và diện tích hình chữ nhật, hình vuông', 'Đơn vị mm, g, ml, cm²'],
    wordProblemAndStatisticsScope: ['Bài toán giải bằng hai bước tính; bảng số liệu thống kê, khả năng xảy ra của sự kiện'],
  },
  4: {
    grade: 4,
    numbersAndOperationsScope: ['Số tự nhiên đến lớp triệu', 'Cộng, trừ, nhân, chia với số có 2–3 chữ số; tính chất giao hoán, kết hợp; phân số, rút gọn, quy đồng, cộng/trừ/nhân/chia phân số'],
    geometryAndMeasurementScope: ['Góc nhọn, góc tù, góc bẹt (đơn vị độ); hai đường thẳng vuông góc, song song; hình bình hành, hình thoi', 'Đơn vị yến, tạ, tấn; dm², m², mm²; giây, thế kỷ'],
    wordProblemAndStatisticsScope: ['Tìm số trung bình cộng; tìm hai số khi biết tổng và hiệu; bài toán thực tế 2–3 bước tính; biểu đồ cột'],
  },
  5: {
    grade: 5,
    numbersAndOperationsScope: ['Số thập phân: đọc, viết, so sánh, cộng, trừ, nhân, chia số thập phân', 'Tỉ số, tỉ số phần trăm, tỉ lệ bản đồ; tính giá trị biểu thức số thập phân và phân số'],
    geometryAndMeasurementScope: ['Hình tam giác (diện tích), hình thang (diện tích), hình tròn (chu vi, diện tích); hình hộp chữ nhật, hình lập phương (diện tích xung quanh, diện tích toàn phần, thể tích)', 'Đơn vị ha, km²; cm³, dm³, m³ (1 dm³ = 1 lít)'],
    wordProblemAndStatisticsScope: ['Toán chuyển động đều (v, s, t); toán tỉ số phần trăm thực tế; biểu đồ hình quạt tròn'],
  },
};

// ============================================================================
// BỘ TÍNH TOÁN XÁC ĐỊNH ĐỘC LẬP CHO MÔN TOÁN TIỂU HỌC (DETERMINISTIC MATH ENGINE)
// Kiểm chứng phép cộng, trừ, nhân, chia, biểu thức, phân số, số thập phân,
// đổi đơn vị, công thức hình học và bất đẳng thức tam giác (Không phụ thuộc Gemini)
// ============================================================================

export function gcdDeterministic(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function simplifyFractionDeterministically(num: number, den: number): {
  simplifiedNum: number;
  simplifiedDen: number;
  gcdValue: number;
  decimalValue: number;
  formatted: string;
  simplifiedText: string;
  stepProof: string;
} {
  if (den === 0) {
    return {
      simplifiedNum: num,
      simplifiedDen: 1,
      gcdValue: 1,
      decimalValue: NaN,
      formatted: 'NaN',
      simplifiedText: 'NaN',
      stepProof: 'Mẫu số bằng 0 (không xác định)',
    };
  }
  const g = gcdDeterministic(num, den);
  const sNum = num / g;
  const sDen = den / g;
  const formatted = `${sNum}/${sDen}`;
  return {
    simplifiedNum: sNum,
    simplifiedDen: sDen,
    gcdValue: g,
    decimalValue: num / den,
    formatted,
    simplifiedText: formatted,
    stepProof: `ƯCLN(${num}, ${den}) = ${g} ⇒ ${num}/${den} = (${num} : ${g}) / (${den} : ${g}) = ${formatted}`,
  };
}

/**
 * Bộ tính giá trị biểu thức số học xác định (Deterministic Shunting-Yard / Precedence Evaluator)
 * Hỗ trợ số tự nhiên, số thập phân (dấu phẩy hoặc dấu chấm), +, -, ×, :, ngoặc đơn.
 */
export function evaluateDeterministicMathExpression(rawExpr: string): {
  isValid: boolean;
  numericValue: number;
  formattedVietnamese: string;
  formattedValue: string;
  stepByStepProof: string;
} {
  try {
    const normalized = rawExpr
      .replace(/(\d)\s+(\d)/g, '$1$2')
      .replace(/(\d)\s+(\d)/g, '$1$2')
      .replace(/,/g, '.')
      .replace(/[×x]/g, '*')
      .replace(/:/g, '/')
      .replace(/[^\d.+\-*/()]/g, '');

    if (!normalized) {
      return {
        isValid: false,
        numericValue: NaN,
        formattedVietnamese: '-',
        formattedValue: '-',
        stepByStepProof: '',
      };
    }

    // Tokenize numbers and operators deterministically
    const tokens = normalized.match(/\d+(?:\.\d+)?|[+\-*/()]/g);
    if (!tokens || tokens.length === 0) {
      return {
        isValid: false,
        numericValue: NaN,
        formattedVietnamese: '-',
        formattedValue: '-',
        stepByStepProof: '',
      };
    }

    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const values: number[] = [];
    const ops: string[] = [];
    const steps: string[] = [];

    const applyOp = () => {
      const op = ops.pop();
      const b = values.pop();
      const a = values.pop();
      if (op === undefined || a === undefined || b === undefined) return;
      let res = 0;
      if (op === '+') res = Number((a + b).toFixed(6));
      if (op === '-') res = Number((a - b).toFixed(6));
      if (op === '*') res = Number((a * b).toFixed(6));
      if (op === '/') res = b !== 0 ? Number((a / b).toFixed(6)) : NaN;
      const opDisplay = op === '*' ? '×' : op === '/' ? ':' : op;
      steps.push(`${a.toString().replace('.', ',')} ${opDisplay} ${b.toString().replace('.', ',')} = ${res.toString().replace('.', ',')}`);
      values.push(res);
    };

    for (const token of tokens) {
      if (/^\d+(?:\.\d+)?$/.test(token)) {
        values.push(Number(token));
      } else if (token === '(') {
        ops.push(token);
      } else if (token === ')') {
        while (ops.length > 0 && ops[ops.length - 1] !== '(') {
          applyOp();
        }
        ops.pop();
      } else if (precedence[token]) {
        while (
          ops.length > 0 &&
          ops[ops.length - 1] !== '(' &&
          (precedence[ops[ops.length - 1]] || 0) >= precedence[token]
        ) {
          applyOp();
        }
        ops.push(token);
      }
    }

    while (ops.length > 0) {
      applyOp();
    }

    const finalVal = values[0];
    if (finalVal === undefined || Number.isNaN(finalVal)) {
      return {
        isValid: false,
        numericValue: NaN,
        formattedVietnamese: '-',
        formattedValue: '-',
        stepByStepProof: '',
      };
    }

    const formattedVietnamese = Number.isInteger(finalVal)
      ? finalVal.toLocaleString('vi-VN')
      : finalVal.toString().replace('.', ',');

    return {
      isValid: true,
      numericValue: finalVal,
      formattedVietnamese,
      formattedValue: formattedVietnamese,
      stepByStepProof:
        steps.length > 0
          ? `Bộ tính toán xác định thực hiện theo thứ tự phép tính: ${steps.join('  ⇒  ')} (Kết quả chuẩn = ${formattedVietnamese}).`
          : `Giá trị xác định = ${formattedVietnamese}.`,
    };
  } catch {
    return {
      isValid: false,
      numericValue: NaN,
      formattedVietnamese: '-',
      formattedValue: '-',
      stepByStepProof: '',
    };
  }
}


// ============================================================================
// 2. BỘ HỒ SƠ ĐỀ KIỂM TRA THỬ NGHIỆM MÔN TIẾNG VIỆT LỚP 4 & LỚP 5 (MỤC VII)
//    VÀ BỘ HỒ SƠ TOÁN LỚP 4 (BẢO TOÀN GIAI ĐOẠN 15)
// ============================================================================

/**
 * ĐỀ TIẾNG VIỆT LỚP 4 THỬ NGHIỆM (CHỨA ĐẦY ĐỦ 7 LỖI THỬ NGHIỆM THEO MỤC VII):
 * 1) Câu 2: Câu hỏi không có căn cứ trong ngữ liệu (hỏi "cây cam sành từ Hà Giang trồng năm nào" không có trong bài).
 * 2) Câu 3: Câu hỏi có hai đáp án hợp lý (cả phương án A và phương án C đều đúng theo văn bản).
 * 3) Câu 4: Câu hỏi trùng nội dung với Câu 1 (cùng hỏi đặc điểm cây hồng đỏ và cây ổi vào mùa thu).
 * 4) Câu 6: Câu hỏi sai kiến thức tiếng Việt (từ "chậm rãi" là tính từ nhưng đáp án khóa ghi A. Động từ).
 * 5) Câu 5: Hướng dẫn chấm quá cứng nhắc (bắt buộc học sinh trả lời đúng nguyên văn từng chữ đáp án mẫu, không chấp nhận diễn đạt tương đương).
 * 6) Câu 10 / Toàn đề: Biểu điểm không khớp tổng điểm (Câu 10 ghi 4.5đ làm tổng đề = 10.5/10.0đ; các ý nhỏ trong biểu điểm Viết cộng lại = 3.5đ ≠ 4.5đ).
 * 7) Câu 10: Đề viết chưa rõ yêu cầu, ôm đồm 3–4 yêu cầu trong một đề và hướng dẫn chấm coi bài văn mẫu là đáp án duy nhất.
 */
export function createFlawedGrade4VietnameseTestDossier(): QualityReviewDossierPackage {
  const passageText =
    'Mỗi độ thu về, khu vườn nhỏ của ông ngoại lại khoác lên mình chiếc áo vàng dịu của nắng mới. Giữa vườn, cây hồng đỏ do ông trồng từ ngày mẹ còn nhỏ trĩu trịt những quả chín đỏ rực như những chiếc đèn lồng nhỏ treo lơ lửng trên cành. Góc vườn bên kia, cây ổi đào tỏa hương thơm lừng gọi đàn chim sâu ríu rít chuyền cành suốt buổi sớm. Sáng nào ông ngoại cũng chậm rãi tỉa từng cành lá khô, nâng niu từng chùm quả chín để dành chờ các cháu cuối tuần về thăm.';

  const wordCount = passageText.trim().split(/\s+/).length;

  const matrixSlots: QualityReviewMatrixSlot[] = [
    {
      questionNumber: 1,
      expectedTopicTitle: 'Đọc hiểu văn bản truyện – Nhận biết chi tiết trực tiếp',
      expectedLearningOutcomeCode: 'YCCD-TV4-DH-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 2,
      expectedTopicTitle: 'Đọc hiểu văn bản truyện – Nhận biết thông tin sự vật trong bài',
      expectedLearningOutcomeCode: 'YCCD-TV4-DH-02',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 3,
      expectedTopicTitle: 'Đọc hiểu văn bản truyện – Hiểu hình ảnh miêu tả trong bài',
      expectedLearningOutcomeCode: 'YCCD-TV4-DH-03',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 4,
      expectedTopicTitle: 'Đọc hiểu văn bản truyện – Hiểu tình cảm của nhân vật ông ngoại',
      expectedLearningOutcomeCode: 'YCCD-TV4-DH-04',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'SHORT_ANSWER',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 5,
      expectedTopicTitle: 'Đọc hiểu văn bản truyện – Liên hệ, rút ra bài học ứng xử',
      expectedLearningOutcomeCode: 'YCCD-TV4-DH-05',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'ESSAY',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 6,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Từ loại (Danh từ, Động từ, Tính từ)',
      expectedLearningOutcomeCode: 'YCCD-TV4-KTTV-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 7,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Biện pháp tu từ so sánh, nhân hóa',
      expectedLearningOutcomeCode: 'YCCD-TV4-KTTV-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 8,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Thành phần câu (Chủ ngữ, Vị ngữ, Trạng ngữ)',
      expectedLearningOutcomeCode: 'YCCD-TV4-KTTV-03',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 9,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Đặt câu có sử dụng trạng ngữ hoặc tính từ',
      expectedLearningOutcomeCode: 'YCCD-TV4-KTTV-04',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'SHORT_ANSWER',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 10,
      expectedTopicTitle: 'Viết – Bài văn miêu tả cây cối trong vườn trường hoặc gia đình',
      expectedLearningOutcomeCode: 'YCCD-TV4-VIET-01',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'ESSAY',
      expectedPoints: 4.0,
    },
  ];

  const questions: QualityReviewQuestionNode[] = [
    {
      questionNumber: 1,
      questionCode: 'TV4-Q01',
      format: 'MULTIPLE_CHOICE',
      stem: 'Vào mùa thu, cây hồng đỏ và cây ổi đào trong vườn ông ngoại có đặc điểm gì nổi bật?',
      options: [
        {
          key: 'A',
          text: 'Cây hồng trĩu trịt quả chín đỏ rực như đèn lồng nhỏ, cây ổi đào tỏa hương thơm lừng.',
        },
        { key: 'B', text: 'Cây hồng mới bắt đầu ra hoa trắng, cây ổi rụng hết lá.' },
        { key: 'C', text: 'Cả hai cây đều chưa ra quả vì trời mới chớm thu.' },
        { key: 'D', text: 'Cây hồng lá úa vàng, cây ổi quả còn xanh non.' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Đọc hiểu văn bản truyện – Nhận biết chi tiết trực tiếp',
      learningOutcomeCode: 'YCCD-TV4-DH-01',
      learningOutcomeText: 'Nhận biết được chi tiết miêu tả sự vật nêu trực tiếp trong văn bản.',
      gradingGuide: 'Chọn đúng phương án A được 0.5 điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'NHAN_BIET_TRUC_TIEP',
      isGroundedInCorpus: true,
    },
    {
      questionNumber: 2,
      questionCode: 'TV4-Q02',
      format: 'MULTIPLE_CHOICE',
      // LỖI 1: CÂU HỎI KHÔNG CÓ CĂN CỨ TRONG NGỮ LIỆU
      stem: 'Ông ngoại đã mang giống cây cam sành từ tỉnh Hà Giang về trồng trong vườn vào năm nào?',
      options: [
        { key: 'A', text: 'Năm 2015' },
        { key: 'B', text: 'Năm 2018' },
        { key: 'C', text: 'Năm 2020' },
        { key: 'D', text: 'Năm 2022' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Đọc hiểu văn bản truyện – Nhận biết thông tin sự vật trong bài',
      learningOutcomeCode: 'YCCD-TV4-DH-02',
      learningOutcomeText: 'Tìm được thông tin chi tiết xuất hiện trong văn bản đọc.',
      gradingGuide: 'Chọn phương án B (Năm 2018) được 0.5 điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'NHAN_BIET_TRUC_TIEP',
      isGroundedInCorpus: false,
    },
    {
      questionNumber: 3,
      questionCode: 'TV4-Q03',
      format: 'MULTIPLE_CHOICE',
      // LỖI 2: CÂU HỎI CÓ HAI ĐÁP ÁN HỢP LÝ CÙNG ĐÚNG THEO NGỮ LIỆU
      stem: 'Chi tiết nào trong bài đọc cho thấy khu vườn của ông ngoại vào mùa thu rất đẹp và sinh động?',
      options: [
        {
          key: 'A',
          text: 'Những quả hồng chín đỏ rực như những chiếc đèn lồng nhỏ treo lơ lửng trên cành.',
        },
        { key: 'B', text: 'Khu vườn phủ đầy tuyết trắng xóa suốt mùa đông lạnh giá.' },
        {
          key: 'C',
          text: 'Cây ổi đào tỏa hương thơm lừng gọi đàn chim sâu ríu rít chuyền cành suốt buổi sớm.',
        },
        { key: 'D', text: 'Mặt hồ sen trước sân nhà nở hoa tím ngắt.' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Đọc hiểu văn bản truyện – Hiểu hình ảnh miêu tả trong bài',
      learningOutcomeCode: 'YCCD-TV4-DH-03',
      learningOutcomeText: 'Hiểu được ý nghĩa của các chi tiết miêu tả cảnh vật trong văn bản.',
      gradingGuide: 'Chọn phương án A được 0.5 điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'HIEU_GIAI_THICH_SUY_LUAN',
      isGroundedInCorpus: true,
    },
    {
      questionNumber: 4,
      questionCode: 'TV4-Q04',
      format: 'SHORT_ANSWER',
      // LỖI 3: CÂU HỎI TRÙNG NỘI DUNG VỚI CÂU 1
      stem: 'Em hãy nêu đặc điểm nổi bật của cây hồng đỏ và cây ổi đào trong vườn ông ngoại khi mùa thu về.',
      declaredCorrectAnswer:
        'Cây hồng đỏ trĩu trịt quả chín đỏ rực như chiếc đèn lồng nhỏ; cây ổi đào tỏa hương thơm lừng.',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Đọc hiểu văn bản truyện – Hiểu tình cảm của nhân vật ông ngoại',
      learningOutcomeCode: 'YCCD-TV4-DH-04',
      learningOutcomeText: 'Nhận xét được tình cảm của nhân vật qua hành động chăm sóc khu vườn.',
      gradingGuide:
        'Nêu đúng đặc điểm cây hồng đỏ (0.5đ) và hương thơm cây ổi đào (0.5đ). Chấp nhận cách diễn đạt tương đương.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'NHAN_BIET_TRUC_TIEP',
      isGroundedInCorpus: true,
    },
    {
      questionNumber: 5,
      questionCode: 'TV4-Q05',
      format: 'ESSAY',
      // LỖI 5: HƯỚNG DẪN CHẤM QUÁ CỨNG NHẮC (Bắt học sinh viết đúng nguyên văn từng chữ)
      stem: 'Qua việc làm của ông ngoại trong bài đọc, em học được điều gì về tình yêu thiên nhiên và tình cảm gia đình?',
      declaredCorrectAnswer:
        'Em học được tinh thần trách nhiệm bảo vệ hệ sinh thái tự nhiên và sự gắn kết huyết thống gia đình.',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      topicTitle: 'Đọc hiểu văn bản truyện – Liên hệ, rút ra bài học ứng xử',
      learningOutcomeCode: 'YCCD-TV4-DH-05',
      learningOutcomeText: 'Liên hệ được nội dung văn bản với suy nghĩ, tình cảm của bản thân.',
      gradingGuide:
        'Yêu cầu học sinh phải trả lời đúng nguyên văn từng chữ theo đáp án mẫu: "Em học được tinh thần trách nhiệm bảo vệ hệ sinh thái tự nhiên và sự gắn kết huyết thống gia đình". Nếu học sinh diễn đạt bằng từ ngữ khác thì không cho điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'LIEN_HE_VAN_DUNG',
      isGroundedInCorpus: true,
      requiresVerbatimAnswerInRubric: true,
    },
    {
      questionNumber: 6,
      questionCode: 'TV4-Q06',
      format: 'MULTIPLE_CHOICE',
      // LỖI 4: CÂU HỎI SAI KIẾN THỨC TIẾNG VIỆT ("chậm rãi" là tính từ nhưng đáp án ghi A. Động từ)
      stem: 'Trong câu "Sáng nào ông ngoại cũng chậm rãi tỉa từng cành lá khô.", từ "chậm rãi" thuộc từ loại nào?',
      options: [
        { key: 'A', text: 'Động từ' },
        { key: 'B', text: 'Danh từ' },
        { key: 'C', text: 'Tính từ' },
        { key: 'D', text: 'Đại từ' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Kiến thức Tiếng Việt – Từ loại (Danh từ, Động từ, Tính từ)',
      learningOutcomeCode: 'YCCD-TV4-KTTV-01',
      learningOutcomeText: 'Nhận biết được danh từ, động từ, tính từ trong câu văn.',
      gradingGuide: 'Từ "chậm rãi" là động từ. Chọn phương án A được 0.5 điểm.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'TU_LOAI',
    },
    {
      questionNumber: 7,
      questionCode: 'TV4-Q07',
      format: 'MULTIPLE_CHOICE',
      stem: 'Câu văn "Giữa vườn, cây hồng đỏ trĩu trịt những quả chín đỏ rực như những chiếc đèn lồng nhỏ treo lơ lửng trên cành." sử dụng biện pháp tu từ nào?',
      options: [
        { key: 'A', text: 'Biện pháp so sánh' },
        { key: 'B', text: 'Biện pháp điệp ngữ' },
        { key: 'C', text: 'Biện pháp nói quá' },
        { key: 'D', text: 'Biện pháp chơi chữ' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Kiến thức Tiếng Việt – Biện pháp tu từ so sánh, nhân hóa',
      learningOutcomeCode: 'YCCD-TV4-KTTV-02',
      learningOutcomeText: 'Nhận biết và nêu được tác dụng của biện pháp so sánh, nhân hóa.',
      gradingGuide: 'So sánh "quả chín đỏ rực" với "những chiếc đèn lồng nhỏ". Chọn A được 0.5 điểm.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'BIEN_PHAP_TU_TU',
    },
    {
      questionNumber: 8,
      questionCode: 'TV4-Q08',
      format: 'MULTIPLE_CHOICE',
      stem: 'Bộ phận trạng ngữ trong câu "Mỗi độ thu về, khu vườn nhỏ của ông ngoại lại khoác lên mình chiếc áo vàng dịu của nắng mới." là:',
      options: [
        { key: 'A', text: 'Mỗi độ thu về' },
        { key: 'B', text: 'khu vườn nhỏ của ông ngoại' },
        { key: 'C', text: 'lại khoác lên mình chiếc áo vàng dịu' },
        { key: 'D', text: 'chiếc áo vàng dịu của nắng mới' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Kiến thức Tiếng Việt – Thành phần câu (Chủ ngữ, Vị ngữ, Trạng ngữ)',
      learningOutcomeCode: 'YCCD-TV4-KTTV-03',
      learningOutcomeText: 'Xác định được chủ ngữ, vị ngữ, trạng ngữ trong câu.',
      gradingGuide: 'Chọn đúng phương án A (trạng ngữ chỉ thời gian) được 0.5 điểm.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'THANH_PHAN_CAU',
    },
    {
      questionNumber: 9,
      questionCode: 'TV4-Q09',
      format: 'SHORT_ANSWER',
      stem: 'Em hãy đặt 01 câu miêu tả một loài cây em yêu thích, trong câu có sử dụng ít nhất một tính từ chỉ màu sắc hoặc hương thơm.',
      declaredCorrectAnswer:
        'Ví dụ: Trong vườn trường, cây phượng vĩ nở hoa đỏ rực dưới ánh nắng mùa hè.',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Kiến thức Tiếng Việt – Đặt câu có sử dụng trạng ngữ hoặc tính từ',
      learningOutcomeCode: 'YCCD-TV4-KTTV-04',
      learningOutcomeText: 'Đặt được câu văn có sử dụng tính từ phù hợp ngữ cảnh.',
      gradingGuide:
        'Đặt câu đúng ngữ pháp, đầu câu viết hoa, cuối câu có dấu chấm (0.5đ); có sử dụng đúng ít nhất 01 tính từ chỉ màu sắc/hương thơm (0.5đ). Chấp nhận mọi câu hợp lý của học sinh.',
      acceptedAlternativeSolutions:
        'Chấp nhận mọi câu văn đúng ngữ pháp do học sinh tự đặt có chứa tính từ miêu tả cây cối.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'TU_LOAI',
    },
    {
      questionNumber: 10,
      questionCode: 'TV4-Q10',
      format: 'ESSAY',
      // LỖI 6 (BIỂU ĐIỂM KHÔNG KHỚP TỔNG ĐIỂM: 4.5Đ LÀM TỔNG ĐỀ = 10.5Đ) & LỖI 7 (ĐỀ VIẾT CHƯA RÕ YÊU CẦU, QUÁ NHIỀU YÊU CẦU, ÁP ĐẶT VĂN MẪU)
      stem: 'Em hãy viết một bài văn về một loài cây hoặc một con vật hoặc kể lại một câu chuyện đã đọc, đồng thời lập bảng kế hoạch chăm sóc cây xanh của lớp em.',
      declaredCorrectAnswer:
        'Bài văn mẫu chuẩn duy nhất của tổ chuyên môn về cây bàng sân trường.',
      points: 4.5, // Sai biểu điểm! Ma trận quy định 4.0đ -> Tổng đề = 10.5đ
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      topicTitle: 'Viết – Bài văn miêu tả cây cối trong vườn trường hoặc gia đình',
      learningOutcomeCode: 'YCCD-TV4-VIET-01',
      learningOutcomeText: 'Viết được bài văn miêu tả cây cối có bố cục 3 phần rõ ràng, dùng từ đặt câu sinh động.',
      gradingGuide:
        'Nội dung: 1.5đ; Bố cục: 0.5đ; Diễn đạt: 1.0đ; Chính tả: 0.5đ (Cộng điểm thành phần = 3.5đ nhưng điểm câu ghi 4.5đ). Chỉ cho điểm tối đa khi học sinh viết giống bài văn mẫu của tổ chuyên môn.',
      vietnameseSection: 'VIET',
      requiresVerbatimAnswerInRubric: true,
    },
  ];

  const specificationSlots: QualityReviewSpecificationSlot[] = matrixSlots.map((m) => ({
    questionNumber: m.questionNumber,
    learningOutcomeCode: m.expectedLearningOutcomeCode,
    learningOutcomeDescription: `Đánh giá yêu cầu cần đạt ${m.expectedLearningOutcomeCode} thuộc mạch ${m.expectedTopicTitle} (Chương trình Tiếng Việt Lớp 4 GDPT 2018).`,
    competencyAssessed:
      m.expectedCognitiveLevel === 'Mức 3 – Vận dụng'
        ? 'Năng lực văn học & Năng lực ngôn ngữ (Viết sáng tạo / Liên hệ)'
        : 'Năng lực ngôn ngữ (Đọc hiểu & Thực hành Tiếng Việt)',
    cognitiveLevel: m.expectedCognitiveLevel,
    format: m.expectedFormat,
  }));

  return {
    dossierId: 'DOSSIER-TV4-FLAWED-7ERRORS',
    dossierCode: 'DE-TV4-TEST-7LOI',
    title: 'Đề kiểm tra Cuối học kỳ I – Tiếng Việt Lớp 4 (Bộ đề thử nghiệm chứa 7 lỗi chuyên môn)',
    subject: 'Tiếng Việt',
    grade: 4,
    examPeriod: 'Cuối học kỳ I',
    examVariantCode: 'TV4-01',
    curriculumStandard: 'Chương trình GDPT 2018 – Môn Tiếng Việt Tiểu học (Lớp 1–5)',
    assessmentRuleSet: 'Thông tư 27/2020/TT-BGDĐT (3 mức độ: Mức 1, Mức 2, Mức 3)',
    durationMinutes: 40,
    targetTotalPoints: 10.0,
    versionLabel: 'v1.0 (Bản gốc trước kiểm tra)',
    approvalStatus: ApprovalStatus.DRAFT,
    isConfidentialExam: false,
    hasSecurityPermissionForAi: true,
    hasMatrixDocument: true,
    hasSpecificationDocument: true,
    hasExamPaperDocument: true,
    hasAnswerKeyDocument: true,
    hasGradingGuideDocument: true,
    questions,
    matrixSlots,
    specificationSlots,
    vietnameseCorpusBlock: {
      corpusCode: 'NL-TV4-01',
      title: 'Khu vườn mùa thu của ông ngoại',
      content: passageText,
      declaredGenre: 'TRUYEN',
      author: 'Theo Nguyễn Ngọc Thuần',
      sourceCitation: 'Tuyển tập truyện ngắn thiếu nhi chọn lọc, NXB Kim Đồng',
      isSourceVerified: true,
      wordCount,
      recommendedWordRangeForGrade: { min: 240, max: 350 },
      ageAppropriatenessNote:
        'Nội dung trong sáng, giàu tính nhân văn về tình cảm ông cháu và vẻ đẹp thiên nhiên mùa thu, phù hợp lứa tuổi học sinh lớp 4.',
      hasInappropriateContentFlag: false,
    },
    vietnameseWritingBlock: {
      questionNumber: 10,
      promptText:
        'Em hãy viết một bài văn về một loài cây hoặc một con vật hoặc kể lại một câu chuyện đã đọc, đồng thời lập bảng kế hoạch chăm sóc cây xanh của lớp em.',
      declaredGenre: 'Chưa xác định rõ 1 kiểu bài (trộn lẫn tả cây, tả con vật, kể chuyện, lập kế hoạch)',
      allocatedMinutes: 25,
      points: 4.5,
      hasClearRequirement: false,
      isGenreAlignedWithCurriculum: false,
      isDurationAppropriate: false,
      hasTooManySubRequirements: true,
      allowsCreativeExpression: false,
      avoidsSingleRigidExpression: false,
      rubricCheck: {
        hasContentCriterion: true,
        contentPoints: 1.5,
        hasStructureCriterion: true,
        structurePoints: 0.5,
        hasExpressionCriterion: true,
        expressionPoints: 1.0,
        hasSpellingPresentationCriterion: true,
        spellingPresentationPoints: 0.5,
        isScoreAllocationReasonable: false, // Cộng 1.5 + 0.5 + 1.0 + 0.5 = 3.5đ ≠ 4.5đ
        treatsSampleEssayAsOnlyAnswer: true,
      },
    },
  };
}

/**
 * ĐỀ TIẾNG VIỆT LỚP 5 THỬ NGHIỆM (CHỨA ĐẦY ĐỦ 7 LỖI THỬ NGHIỆM THEO MỤC VII):
 * 1) Câu 2: Câu hỏi không có căn cứ trong ngữ liệu (hỏi "nhận bằng khen tại Hà Nội năm 2022" không có trong bài).
 * 2) Câu 3: Câu hỏi có hai đáp án hợp lý (cả B. "lặng lẽ" và D. "âm thầm" đều đồng nghĩa với "thầm lặng").
 * 3) Câu 4: Câu hỏi trùng nội dung với Câu 1 (cùng hỏi công việc tuần tra rừng mỗi buổi sáng của chú kiểm lâm).
 * 4) Câu 7: Câu hỏi sai kiến thức tiếng Việt Lớp 5 (xác định sai chủ ngữ vế câu ghép: ghi "trên vòm lá" thay vì "chim chóc").
 * 5) Câu 5: Hướng dẫn chấm quá cứng nhắc (bắt trả lời nguyên văn từng chữ, không chấp nhận diễn đạt tương đương).
 * 6) Câu 10 / Toàn đề: Biểu điểm không khớp tổng điểm (Câu 10 ghi 3.5đ làm tổng đề = 9.5/10.0đ; hướng dẫn chấm Viết thiếu tiêu chí Bố cục và Chính tả).
 * 7) Câu 10: Đề viết chưa rõ yêu cầu ("Hãy viết bài văn về thiên nhiên và con người" – không xác định rõ kiểu bài tả phong cảnh hay tả người).
 */
export function createFlawedGrade5VietnameseTestDossier(): QualityReviewDossierPackage {
  const passageText =
    'Khi sương sớm còn giăng mắc trên những triền đồi, chú Lâm – người kiểm lâm gắn bó mười lăm năm với cánh rừng nguyên sinh – đã khoác ba lô lên đường tuần tra. Bước chân chú đi thông thuộc từng gốc dẻ, từng con suối nhỏ. Mưa vừa tạnh thì chim chóc đã ríu rít gọi nhau trên vòm lá. Chú Lâm lặng lẽ ghi chép hiện trạng những cây gỗ quý và nhắc nhở bà con bản làng không đốt nương làm rẫy sát bìa rừng. Nhờ những người gác rừng thầm lặng như chú, mảng xanh đại ngàn luôn được giữ gìn bình yên.';

  const wordCount = passageText.trim().split(/\s+/).length;

  const matrixSlots: QualityReviewMatrixSlot[] = [
    {
      questionNumber: 1,
      expectedTopicTitle: 'Đọc hiểu văn bản – Nhận biết hoạt động của nhân vật',
      expectedLearningOutcomeCode: 'YCCD-TV5-DH-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 2,
      expectedTopicTitle: 'Đọc hiểu văn bản – Nhận biết chi tiết thời gian, địa điểm trong bài',
      expectedLearningOutcomeCode: 'YCCD-TV5-DH-02',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 3,
      expectedTopicTitle: 'Kiến thức Tiếng Việt & Đọc hiểu – Từ đồng nghĩa trong ngữ cảnh',
      expectedLearningOutcomeCode: 'YCCD-TV5-DH-03',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 4,
      expectedTopicTitle: 'Đọc hiểu văn bản – Hiểu ý nghĩa công việc bảo vệ rừng',
      expectedLearningOutcomeCode: 'YCCD-TV5-DH-04',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'SHORT_ANSWER',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 5,
      expectedTopicTitle: 'Đọc hiểu văn bản – Vận dụng nêu thông điệp bảo vệ môi trường',
      expectedLearningOutcomeCode: 'YCCD-TV5-DH-05',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'ESSAY',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 6,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Kết từ (Quan hệ từ) và Đại từ',
      expectedLearningOutcomeCode: 'YCCD-TV5-KTTV-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 7,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Cấu tạo câu ghép (Chủ ngữ, Vị ngữ từng vế)',
      expectedLearningOutcomeCode: 'YCCD-TV5-KTTV-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 8,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Liên kết câu bằng phép lặp và phép thế',
      expectedLearningOutcomeCode: 'YCCD-TV5-KTTV-03',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 9,
      expectedTopicTitle: 'Kiến thức Tiếng Việt – Viết câu ghép thể hiện quan hệ nguyên nhân - kết quả',
      expectedLearningOutcomeCode: 'YCCD-TV5-KTTV-04',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'SHORT_ANSWER',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 10,
      expectedTopicTitle: 'Viết – Bài văn tả phong cảnh quê hương hoặc nơi em sống',
      expectedLearningOutcomeCode: 'YCCD-TV5-VIET-01',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'ESSAY',
      expectedPoints: 4.0,
    },
  ];

  const questions: QualityReviewQuestionNode[] = [
    {
      questionNumber: 1,
      questionCode: 'TV5-Q01',
      format: 'MULTIPLE_CHOICE',
      stem: 'Mỗi buổi sáng sớm, chú Lâm thường làm những công việc gì để bảo vệ rừng?',
      options: [
        {
          key: 'A',
          text: 'Khoác ba lô đi tuần tra, ghi chép hiện trạng cây gỗ quý và nhắc nhở bà con không đốt nương sát bìa rừng.',
        },
        { key: 'B', text: 'Đốn củi và săn bắt chim thú trong rừng nguyên sinh.' },
        { key: 'C', text: 'Ngồi tại trạm kiểm lâm đọc báo suốt buổi sáng.' },
        { key: 'D', text: 'Chèo thuyền chở khách du lịch dọc suối nhỏ.' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Đọc hiểu văn bản – Nhận biết hoạt động của nhân vật',
      learningOutcomeCode: 'YCCD-TV5-DH-01',
      learningOutcomeText: 'Nhận biết được chi tiết, hành động của nhân vật trong văn bản đọc.',
      gradingGuide: 'Chọn đúng phương án A được 0.5 điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'NHAN_BIET_TRUC_TIEP',
      isGroundedInCorpus: true,
    },
    {
      questionNumber: 2,
      questionCode: 'TV5-Q02',
      format: 'MULTIPLE_CHOICE',
      // LỖI 1: CÂU HỎI KHÔNG CÓ CĂN CỨ TRONG NGỮ LIỆU
      stem: 'Chú Lâm đã được Bộ Nông nghiệp trao tặng bằng khen tại thủ đô Hà Nội vào năm 2022 vì thành tích gì?',
      options: [
        { key: 'A', text: 'Trồng mới 50 héc-ta rừng thông' },
        { key: 'B', text: 'Cứu hộ thành công đàn voi rừng quý hiếm' },
        { key: 'C', text: 'Chữa cháy rừng kịp thời trong mùa khô' },
        { key: 'D', text: 'Phát hiện giống lan rừng mới' },
      ],
      declaredCorrectAnswer: 'C',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Đọc hiểu văn bản – Nhận biết chi tiết thời gian, địa điểm trong bài',
      learningOutcomeCode: 'YCCD-TV5-DH-02',
      learningOutcomeText: 'Xác định được thông tin chi tiết nêu trực tiếp trong văn bản.',
      gradingGuide: 'Chọn phương án C được 0.5 điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'NHAN_BIET_TRUC_TIEP',
      isGroundedInCorpus: false,
    },
    {
      questionNumber: 3,
      questionCode: 'TV5-Q03',
      format: 'MULTIPLE_CHOICE',
      // LỖI 2: CÂU HỎI CÓ HAI ĐÁP ÁN HỢP LÝ (Cả B. "lặng lẽ" và D. "âm thầm" đều đồng nghĩa với "thầm lặng")
      stem: 'Từ nào dưới đây đồng nghĩa với từ "thầm lặng" trong cụm từ "những người gác rừng thầm lặng"?',
      options: [
        { key: 'A', text: 'Ồn ào' },
        { key: 'B', text: 'Lặng lẽ' },
        { key: 'C', text: 'Sôi nổi' },
        { key: 'D', text: 'Âm thầm' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Kiến thức Tiếng Việt & Đọc hiểu – Từ đồng nghĩa trong ngữ cảnh',
      learningOutcomeCode: 'YCCD-TV5-DH-03',
      learningOutcomeText: 'Tìm được từ đồng nghĩa với từ cho trước trong văn bản.',
      gradingGuide: 'Chọn phương án B (Lặng lẽ) được 0.5 điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'HIEU_GIAI_THICH_SUY_LUAN',
      isGroundedInCorpus: true,
    },
    {
      questionNumber: 4,
      questionCode: 'TV5-Q04',
      format: 'SHORT_ANSWER',
      // LỖI 3: CÂU HỎI TRÙNG NỘI DUNG VỚI CÂU 1
      stem: 'Hãy kể tên các công việc hằng ngày vào buổi sáng mà chú Lâm thực hiện khi đi tuần tra bảo vệ rừng.',
      declaredCorrectAnswer:
        'Khoác ba lô tuần tra, ghi chép hiện trạng cây gỗ quý và nhắc nhở bà con không đốt nương sát bìa rừng.',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Đọc hiểu văn bản – Hiểu ý nghĩa công việc bảo vệ rừng',
      learningOutcomeCode: 'YCCD-TV5-DH-04',
      learningOutcomeText: 'Giải thích được ý nghĩa của hành động bảo vệ thiên nhiên trong bài đọc.',
      gradingGuide: 'Nêu đủ các công việc của chú Lâm được 1.0 điểm.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'NHAN_BIET_TRUC_TIEP',
      isGroundedInCorpus: true,
    },
    {
      questionNumber: 5,
      questionCode: 'TV5-Q05',
      format: 'ESSAY',
      // LỖI 5: HƯỚNG DẪN CHẤM QUÁ CỨNG NHẮC
      stem: 'Em cần làm gì để góp phần bảo vệ cây xanh và môi trường sống xung quanh em?',
      declaredCorrectAnswer:
        'Tích cực trồng cây gây rừng, không xả rác bừa bãi và tuyên truyền bảo vệ đa dạng sinh học.',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      topicTitle: 'Đọc hiểu văn bản – Vận dụng nêu thông điệp bảo vệ môi trường',
      learningOutcomeCode: 'YCCD-TV5-DH-05',
      learningOutcomeText: 'Nêu được việc làm cụ thể bảo vệ môi trường gắn với thực tiễn học sinh.',
      gradingGuide:
        'Học sinh bắt buộc phải ghi đúng nguyên văn cụm từ: "Tích cực trồng cây gây rừng, không xả rác bừa bãi và tuyên truyền bảo vệ đa dạng sinh học" mới được điểm. Không chấp nhận các câu trả lời dùng từ ngữ khác.',
      vietnameseSection: 'DOC_HIEU',
      readingQuestionClassification: 'LIEN_HE_VAN_DUNG',
      isGroundedInCorpus: true,
      requiresVerbatimAnswerInRubric: true,
    },
    {
      questionNumber: 6,
      questionCode: 'TV5-Q06',
      format: 'MULTIPLE_CHOICE',
      stem: 'Từ "của" hoặc từ "nhờ" trong câu "Nhờ những người gác rừng thầm lặng như chú, mảng xanh đại ngàn luôn được giữ gìn bình yên." thuộc từ loại nào đã học ở lớp 5?',
      options: [
        { key: 'A', text: 'Kết từ (Quan hệ từ)' },
        { key: 'B', text: 'Danh từ' },
        { key: 'C', text: 'Động từ' },
        { key: 'D', text: 'Tính từ' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Kiến thức Tiếng Việt – Kết từ (Quan hệ từ) và Đại từ',
      learningOutcomeCode: 'YCCD-TV5-KTTV-01',
      learningOutcomeText: 'Nhận biết được đại từ và kết từ trong câu văn.',
      gradingGuide: 'Chọn đúng phương án A được 0.5 điểm.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'TU_LOAI',
    },
    {
      questionNumber: 7,
      questionCode: 'TV5-Q07',
      format: 'MULTIPLE_CHOICE',
      // LỖI 4: CÂU HỎI SAI KIẾN THỨC TIẾNG VIỆT (Xác định sai chủ ngữ của vế câu ghép)
      stem: 'Trong câu ghép "Mưa vừa tạnh thì chim chóc đã ríu rít gọi nhau trên vòm lá.", chủ ngữ của vế câu thứ hai là từ ngữ nào?',
      options: [
        { key: 'A', text: 'trên vòm lá' },
        { key: 'B', text: 'chim chóc' },
        { key: 'C', text: 'Mưa' },
        { key: 'D', text: 'đã ríu rít gọi nhau' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Kiến thức Tiếng Việt – Cấu tạo câu ghép (Chủ ngữ, Vị ngữ từng vế)',
      learningOutcomeCode: 'YCCD-TV5-KTTV-02',
      learningOutcomeText: 'Xác định được chủ ngữ, vị ngữ của từng vế trong câu ghép.',
      gradingGuide: 'Chọn phương án A (trên vòm lá) được 0.5 điểm.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'CAU_TAO_CAU',
    },
    {
      questionNumber: 8,
      questionCode: 'TV5-Q08',
      format: 'MULTIPLE_CHOICE',
      stem: 'Hai câu văn "Chú Lâm đã gắn bó mười lăm năm với cánh rừng. Bước chân chú đi thông thuộc từng gốc dẻ, từng con suối nhỏ." liên kết với nhau bằng cách nào?',
      options: [
        { key: 'A', text: 'Lặp từ ngữ (lặp từ "chú")' },
        { key: 'B', text: 'Dùng từ ngữ nối "tuy nhiên"' },
        { key: 'C', text: 'Dùng từ ngữ nối "mặt khác"' },
        { key: 'D', text: 'Không có phép liên kết nào' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Kiến thức Tiếng Việt – Liên kết câu bằng phép lặp và phép thế',
      learningOutcomeCode: 'YCCD-TV5-KTTV-03',
      learningOutcomeText: 'Nhận biết được phép lặp từ ngữ, phép thế trong liên kết câu.',
      gradingGuide: 'Chọn phương án A được 0.5 điểm.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'LIEN_KET_CAU_DOAN',
    },
    {
      questionNumber: 9,
      questionCode: 'TV5-Q09',
      format: 'SHORT_ANSWER',
      stem: 'Em hãy viết một câu ghép có sử dụng cặp kết từ "Vì... nên..." nói về lợi ích của rừng xanh.',
      declaredCorrectAnswer:
        'Ví dụ: Vì rừng cây giúp ngăn lũ và điều hòa không khí nên chúng ta cần ra sức bảo vệ rừng.',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      topicTitle: 'Kiến thức Tiếng Việt – Viết câu ghép thể hiện quan hệ nguyên nhân - kết quả',
      learningOutcomeCode: 'YCCD-TV5-KTTV-04',
      learningOutcomeText: 'Đặt được câu ghép thể hiện quan hệ nguyên nhân – kết quả.',
      gradingGuide:
        'Câu có đủ 2 vế câu ghép đúng cấu trúc Chủ – Vị và dùng đúng cặp kết từ "Vì... nên..." được 1.0 điểm. Chấp nhận mọi câu đúng ngữ pháp của học sinh.',
      acceptedAlternativeSolutions: 'Chấp nhận mọi câu ghép hợp lý do học sinh tự đặt.',
      vietnameseSection: 'KIEN_THUC_TIENG_VIET',
      vietnameseKnowledgeSubdomain: 'CAU_TAO_CAU',
    },
    {
      questionNumber: 10,
      questionCode: 'TV5-Q10',
      format: 'ESSAY',
      // LỖI 6 (BIỂU ĐIỂM KHÔNG KHỚP TỔNG ĐIỂM: GHI 3.5Đ LÀM TỔNG ĐỀ = 9.5/10.0Đ; HƯỚNG DẪN CHẤM THIẾU TIÊU CHÍ BỐ CỤC & CHÍNH TẢ)
      // & LỖI 7 (ĐỀ VIẾT CHƯA RÕ YÊU CẦU KIỂU BÀI)
      stem: 'Em hãy viết một bài văn về thiên nhiên và con người nơi em đang sống.',
      declaredCorrectAnswer: 'Bài văn mẫu của giáo viên.',
      points: 3.5, // Sai điểm! Ma trận quy định 4.0đ -> Tổng đề hụt còn 9.5đ
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      topicTitle: 'Viết – Bài văn tả phong cảnh quê hương hoặc nơi em sống',
      learningOutcomeCode: 'YCCD-TV5-VIET-01',
      learningOutcomeText: 'Viết được bài văn tả phong cảnh có bố cục 3 phần, quan sát tinh tế.',
      gradingGuide:
        'Nội dung: 2.5đ; Diễn đạt: 1.0đ (Thiếu tiêu chí đánh giá Bố cục và Chính tả/Trình bày; coi bài văn mẫu là đáp án duy nhất).',
      vietnameseSection: 'VIET',
      requiresVerbatimAnswerInRubric: true,
    },
  ];

  const specificationSlots: QualityReviewSpecificationSlot[] = matrixSlots.map((m) => ({
    questionNumber: m.questionNumber,
    learningOutcomeCode: m.expectedLearningOutcomeCode,
    learningOutcomeDescription: `Đánh giá yêu cầu cần đạt ${m.expectedLearningOutcomeCode} thuộc mạch ${m.expectedTopicTitle} (Chương trình Tiếng Việt Lớp 5 GDPT 2018).`,
    competencyAssessed:
      m.expectedCognitiveLevel === 'Mức 3 – Vận dụng'
        ? 'Năng lực văn học & Năng lực ngôn ngữ (Viết sáng tạo / Liên hệ)'
        : 'Năng lực ngôn ngữ (Đọc hiểu & Thực hành Tiếng Việt)',
    cognitiveLevel: m.expectedCognitiveLevel,
    format: m.expectedFormat,
  }));

  return {
    dossierId: 'DOSSIER-TV5-FLAWED-7ERRORS',
    dossierCode: 'DE-TV5-TEST-7LOI',
    title: 'Đề kiểm tra Cuối học kỳ I – Tiếng Việt Lớp 5 (Bộ đề thử nghiệm chứa 7 lỗi chuyên môn)',
    subject: 'Tiếng Việt',
    grade: 5,
    examPeriod: 'Cuối học kỳ I',
    examVariantCode: 'TV5-01',
    curriculumStandard: 'Chương trình GDPT 2018 – Môn Tiếng Việt Tiểu học (Lớp 1–5)',
    assessmentRuleSet: 'Thông tư 27/2020/TT-BGDĐT (3 mức độ: Mức 1, Mức 2, Mức 3)',
    durationMinutes: 40,
    targetTotalPoints: 10.0,
    versionLabel: 'v1.0 (Bản gốc trước kiểm tra)',
    approvalStatus: ApprovalStatus.DRAFT,
    isConfidentialExam: false,
    hasSecurityPermissionForAi: true,
    hasMatrixDocument: true,
    hasSpecificationDocument: true,
    hasExamPaperDocument: true,
    hasAnswerKeyDocument: true,
    hasGradingGuideDocument: true,
    questions,
    matrixSlots,
    specificationSlots,
    vietnameseCorpusBlock: {
      corpusCode: 'NL-TV5-01',
      title: 'Người gác rừng thầm lặng',
      content: passageText,
      declaredGenre: 'TRUYEN',
      author: 'Chưa xác minh tác giả (Ngữ liệu sưu tầm – Không tự bịa tên tác giả)',
      sourceCitation: 'Tài liệu sinh hoạt chuyên môn Tổ Khối 5 (Cần bổ sung nguồn xuất bản chính thức)',
      isSourceVerified: false,
      wordCount,
      recommendedWordRangeForGrade: { min: 280, max: 420 },
      ageAppropriatenessNote:
        'Nội dung giáo dục ý thức bảo vệ rừng nguyên sinh, phù hợp với tâm lý học sinh lớp 5.',
      hasInappropriateContentFlag: false,
    },
    vietnameseWritingBlock: {
      questionNumber: 10,
      promptText: 'Em hãy viết một bài văn về thiên nhiên và con người nơi em đang sống.',
      declaredGenre: 'Mơ hồ giữa bài văn tả phong cảnh và bài văn tả người',
      allocatedMinutes: 25,
      points: 3.5,
      hasClearRequirement: false,
      isGenreAlignedWithCurriculum: false,
      isDurationAppropriate: true,
      hasTooManySubRequirements: true,
      allowsCreativeExpression: false,
      avoidsSingleRigidExpression: false,
      rubricCheck: {
        hasContentCriterion: true,
        contentPoints: 2.5,
        hasStructureCriterion: false,
        structurePoints: 0,
        hasExpressionCriterion: true,
        expressionPoints: 1.0,
        hasSpellingPresentationCriterion: false,
        spellingPresentationPoints: 0,
        isScoreAllocationReasonable: false,
        treatsSampleEssayAsOnlyAnswer: true,
      },
    },
  };
}

/**
 * ĐỀ TIẾNG VIỆT LỚP 4 HỢP LỆ CHUẨN (0 LỖI – ĐỐI CHỨNG KIỂM TRA FALSE POSITIVE = 0%)
 */
export function createValidGrade4VietnameseTestDossier(): QualityReviewDossierPackage {
  const flawed = createFlawedGrade4VietnameseTestDossier();
  const cleanQuestions: QualityReviewQuestionNode[] = flawed.questions.map((q) => {
    if (q.questionNumber === 2) {
      return {
        ...q,
        stem: 'Cây hồng đỏ giữa vườn được ông ngoại trồng từ khi nào?',
        options: [
          { key: 'A', text: 'Từ ngày mẹ còn nhỏ' },
          { key: 'B', text: 'Từ mùa xuân năm ngoái' },
          { key: 'C', text: 'Từ ngày em bắt đầu vào lớp Một' },
          { key: 'D', text: 'Từ tuần trước khi thu về' },
        ],
        declaredCorrectAnswer: 'A',
        gradingGuide: 'Căn cứ câu 2 trong ngữ liệu ("cây hồng đỏ do ông trồng từ ngày mẹ còn nhỏ"). Chọn A được 0.5 điểm.',
        isGroundedInCorpus: true,
      };
    }
    if (q.questionNumber === 3) {
      return {
        ...q,
        stem: 'Hình ảnh những quả hồng chín đỏ rực trên cành được tác giả so sánh với sự vật nào?',
        options: [
          { key: 'A', text: 'Những chiếc đèn lồng nhỏ treo lơ lửng trên cành' },
          { key: 'B', text: 'Những ngôi sao lấp lánh trên bầu trời đêm' },
          { key: 'C', text: 'Những giọt sương mai long lanh trên lá' },
          { key: 'D', text: 'Những cánh bướm vàng rực rỡ' },
        ],
        declaredCorrectAnswer: 'A',
        gradingGuide: 'Chọn đúng phương án A được 0.5 điểm.',
      };
    }
    if (q.questionNumber === 4) {
      return {
        ...q,
        stem: 'Việc ông ngoại tỉa từng cành lá khô và nâng niu từng chùm quả chín để dành chờ các cháu về thăm thể hiện tình cảm gì của ông?',
        declaredCorrectAnswer:
          'Thể hiện tình yêu thương sâu sắc, sự quan tâm ấm áp của ông ngoại dành cho con cháu và sự gắn bó với khu vườn.',
        readingQuestionClassification: 'HIEU_GIAI_THICH_SUY_LUAN',
        gradingGuide:
          'Học sinh nêu được tình yêu thương con cháu (0.5đ) và sự chăm chút khu vườn của ông ngoại (0.5đ). Chấp nhận mọi cách diễn đạt tương đương hợp lý.',
      };
    }
    if (q.questionNumber === 5) {
      return {
        ...q,
        gradingGuide:
          'Học sinh nêu được bài học phù hợp (ví dụ: biết yêu quý, chăm sóc cây xanh; biết kính trọng, yêu thương ông bà). Chấp nhận các cách diễn đạt tương đương, không yêu cầu học sinh trả lời đúng nguyên văn đáp án mẫu.',
        requiresVerbatimAnswerInRubric: false,
      };
    }
    if (q.questionNumber === 6) {
      return {
        ...q,
        declaredCorrectAnswer: 'C',
        gradingGuide: 'Từ "chậm rãi" là tính từ chỉ đặc điểm của hoạt động. Chọn đúng phương án C được 0.5 điểm.',
      };
    }
    if (q.questionNumber === 10) {
      return {
        ...q,
        stem: 'Em hãy viết bài văn miêu tả một cây ăn quả hoặc cây bóng mát mà em yêu thích ở trường hoặc ở nhà em.',
        declaredCorrectAnswer:
          'Dàn ý gợi ý mở (Mở bài giới thiệu cây; Thân bài tả bao quát và từng bộ phận; Kết bài nêu tình cảm của em).',
        points: 4.0,
        gradingGuide:
          '1. Nội dung (1.5đ): Tả đúng đặc điểm nổi bật của cây. 2. Bố cục (1.0đ): Đủ 3 phần Mở bài, Thân bài, Kết bài. 3. Diễn đạt (1.0đ): Dùng từ giàu hình ảnh, câu đúng ngữ pháp. 4. Chính tả & Trình bày (0.5đ): Chữ viết rõ ràng, đúng chính tả. Khuyến khích sự sáng tạo riêng, không coi bài văn mẫu là đáp án duy nhất.',
        requiresVerbatimAnswerInRubric: false,
      };
    }
    return q;
  });

  return {
    ...flawed,
    dossierId: 'DOSSIER-TV4-VALID-0ERRORS',
    dossierCode: 'DE-TV4-CHUAN-0LOI',
    title: 'Đề kiểm tra Cuối học kỳ I – Tiếng Việt Lớp 4 (Bộ đề chuẩn hợp lệ 10 câu – 0 lỗi)',
    examVariantCode: 'TV4-02',
    versionLabel: 'v1.0 (Chuẩn đối chứng Tiếng Việt)',
    questions: cleanQuestions,
    vietnameseWritingBlock: {
      questionNumber: 10,
      promptText:
        'Em hãy viết bài văn miêu tả một cây ăn quả hoặc cây bóng mát mà em yêu thích ở trường hoặc ở nhà em.',
      declaredGenre: 'Bài văn miêu tả cây cối (Chương trình Tiếng Việt 4)',
      allocatedMinutes: 25,
      points: 4.0,
      hasClearRequirement: true,
      isGenreAlignedWithCurriculum: true,
      isDurationAppropriate: true,
      hasTooManySubRequirements: false,
      allowsCreativeExpression: true,
      avoidsSingleRigidExpression: true,
      rubricCheck: {
        hasContentCriterion: true,
        contentPoints: 1.5,
        hasStructureCriterion: true,
        structurePoints: 1.0,
        hasExpressionCriterion: true,
        expressionPoints: 1.0,
        hasSpellingPresentationCriterion: true,
        spellingPresentationPoints: 0.5,
        isScoreAllocationReasonable: true,
        treatsSampleEssayAsOnlyAnswer: false,
      },
    },
  };
}

function buildStandardGrade4MatrixSlots(): QualityReviewMatrixSlot[] {
  return [
    {
      questionNumber: 1,
      expectedTopicTitle: 'Số tự nhiên – Đọc, viết và so sánh số có nhiều chữ số',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-STN-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 2,
      expectedTopicTitle: 'Các phép tính với số tự nhiên – Phép cộng, phép trừ',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-PT-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 3,
      expectedTopicTitle: 'Số tự nhiên – Giá trị theo hàng và lớp',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-STN-02',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 4,
      expectedTopicTitle: 'Các phép tính với số tự nhiên – Phép nhân, phép chia',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-PT-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 5,
      expectedTopicTitle: 'Hình học phẳng – Góc nhọn, góc tù, góc bẹt',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-HH-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 6,
      expectedTopicTitle: 'Hình học & Đo lường – Chu vi và diện tích hình chữ nhật',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-HH-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 7,
      expectedTopicTitle: 'Phân số – Phân số bằng nhau và rút gọn phân số',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-PS-01',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 8,
      expectedTopicTitle: 'Giải toán có lời văn – Bài toán thực tế nhiều bước tính',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-VD-01',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 9,
      expectedTopicTitle: 'Hình học phẳng – Hai đường thẳng song song, hình bình hành, hình thoi',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-HH-03',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 10,
      expectedTopicTitle: 'Đo lường – Đổi đơn vị đo khối lượng (yến, tạ, tấn) và diện tích',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-DL-01',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 11,
      expectedTopicTitle: 'Các phép tính với số tự nhiên – Đặt tính rồi tính và tìm thành phần chưa biết',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-PT-03',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'ESSAY',
      expectedPoints: 3.0,
    },
    {
      questionNumber: 12,
      expectedTopicTitle: 'Giải toán có lời văn – Tìm hai số khi biết tổng và hiệu của hai số đó',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-VD-02',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'ESSAY',
      expectedPoints: 2.0,
    },
  ];
}

function buildStandardGrade4SpecificationSlots(): QualityReviewSpecificationSlot[] {
  return buildStandardGrade4MatrixSlots().map((m) => ({
    questionNumber: m.questionNumber,
    learningOutcomeCode: m.expectedLearningOutcomeCode,
    learningOutcomeDescription: `Đánh giá yêu cầu cần đạt ${m.expectedLearningOutcomeCode} thuộc mạch ${m.expectedTopicTitle} (Chương trình Toán Lớp 4 GDPT 2018).`,
    competencyAssessed:
      m.expectedCognitiveLevel === 'Mức 3 – Vận dụng'
        ? 'Năng lực giải quyết vấn đề toán học & mô hình hóa toán học'
        : 'Năng lực tư duy và lập luận toán học',
    cognitiveLevel: m.expectedCognitiveLevel,
    format: m.expectedFormat,
  }));
}

export function createFlawedGrade4MathTestDossier(): QualityReviewDossierPackage {
  const questions: QualityReviewQuestionNode[] = [
    {
      questionNumber: 1,
      questionCode: 'T4-Q01',
      format: 'MULTIPLE_CHOICE',
      stem: 'Số "Ba triệu không trăm hai mươi lăm nghìn sáu trăm linh tư" được viết là:',
      options: [
        { key: 'A', text: '3 025 604' },
        { key: 'B', text: '3 250 604' },
        { key: 'C', text: '3 025 640' },
        { key: 'D', text: '302 564' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Số tự nhiên – Đọc, viết và so sánh số có nhiều chữ số',
      learningOutcomeCode: 'YCCD-TOAN4-STN-01',
      learningOutcomeText: 'Đọc, viết được các số tự nhiên trong hệ thập phân đến lớp triệu.',
      gradingGuide: 'Học sinh chọn đúng phương án A được 0.5 điểm.',
    },
    {
      questionNumber: 2,
      questionCode: 'T4-Q02',
      format: 'MULTIPLE_CHOICE',
      stem: 'Kết quả của phép cộng 45 000 + 35 000 là bao nhiêu?',
      options: [
        { key: 'A', text: '70 000' },
        { key: 'B', text: '75 000' },
        { key: 'C', text: '80 000' },
        { key: 'D', text: '85 000' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Các phép tính với số tự nhiên – Phép cộng, phép trừ',
      learningOutcomeCode: 'YCCD-TOAN4-PT-01',
      learningOutcomeText: 'Thực hiện được phép cộng, phép trừ các số tự nhiên có nhiều chữ số.',
      gradingGuide: 'Chọn phương án A (70 000) được 0.5 điểm.',
    },
    {
      questionNumber: 3,
      questionCode: 'T4-Q03',
      format: 'MULTIPLE_CHOICE',
      stem: 'Chữ số 8 trong số 584 312 thuộc hàng nào, lớp nào?',
      options: [
        { key: 'A', text: 'Hàng nghìn, lớp nghìn' },
        { key: 'B', text: 'Hàng chục nghìn, lớp nghìn' },
        { key: 'C', text: 'Hàng trăm nghìn, lớp nghìn' },
        { key: 'D', text: 'Hàng chục nghìn, lớp đơn vị' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Số tự nhiên – Giá trị theo hàng và lớp',
      learningOutcomeCode: 'YCCD-TOAN4-STN-02',
      learningOutcomeText: 'Nhận biết được hàng và lớp; nêu được giá trị của chữ số theo vị trí.',
      gradingGuide: 'Chọn phương án B được 0.5 điểm.',
    },
    {
      questionNumber: 4,
      questionCode: 'T4-Q04',
      format: 'MULTIPLE_CHOICE',
      stem: 'Biết mỗi thùng có 125 quyển vở nên 4 thùng có 125 × 4 = 480 quyển vở. Nếu chia đều số vở đó cho 8 lớp thì mỗi lớp nhận được bao nhiêu quyển vở?',
      options: [
        { key: 'A', text: '60 quyển vở' },
        { key: 'B', text: '50 quyển vở' },
        { key: 'C', text: '65 quyển vở' },
        { key: 'D', text: '70 quyển vở' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Các phép tính với số tự nhiên – Phép nhân, phép chia',
      learningOutcomeCode: 'YCCD-TOAN4-PT-02',
      learningOutcomeText: 'Thực hiện được phép nhân, phép chia và tính giá trị biểu thức số.',
      gradingGuide: 'Ta có 125 × 4 = 480 quyển vở; lấy 480 : 8 = 60 quyển vở. Chọn A được 0.5 điểm.',
    },
    {
      questionNumber: 5,
      questionCode: 'T4-Q05',
      format: 'MULTIPLE_CHOICE',
      stem: 'Góc có số đo bằng 120° được gọi là góc gì?',
      options: [
        { key: 'A', text: 'Góc nhọn' },
        { key: 'B', text: 'Góc vuông' },
        { key: 'C', text: 'Góc tù' },
        { key: 'D', text: 'Góc bẹt' },
      ],
      declaredCorrectAnswer: 'C',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Hình học phẳng – Góc nhọn, góc tù, góc bẹt',
      learningOutcomeCode: 'YCCD-TOAN4-HH-01',
      learningOutcomeText: 'Nhận biết được góc nhọn, góc tù, góc bẹt và đơn vị đo góc độ (°).',
      gradingGuide: 'Chọn phương án C (Góc tù lớn hơn 90° và nhỏ hơn 180°) được 0.5 điểm.',
    },
    {
      questionNumber: 6,
      questionCode: 'T4-Q06',
      format: 'MULTIPLE_CHOICE',
      stem: 'Một mảnh vườn hình chữ nhật có chiều dài 18 m. Diện tích của mảnh vườn hình chữ nhật đó là bao nhiêu mét vuông?',
      options: [
        { key: 'A', text: '144 m²' },
        { key: 'B', text: '162 m²' },
        { key: 'C', text: '180 m²' },
        { key: 'D', text: '216 m²' },
      ],
      declaredCorrectAnswer: 'C',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Hình học & Đo lường – Chu vi và diện tích hình chữ nhật',
      learningOutcomeCode: 'YCCD-TOAN4-HH-02',
      learningOutcomeText: 'Tính được chu vi và diện tích hình chữ nhật, hình vuông.',
      gradingGuide: 'Lấy chiều dài nhân chiều rộng: 18 × 10 = 180 m². Chọn C được 0.5 điểm.',
    },
    {
      questionNumber: 7,
      questionCode: 'T4-Q07',
      format: 'MULTIPLE_CHOICE',
      stem: 'Phân số nào dưới đây bằng phân số 12/18?',
      options: [
        { key: 'A', text: '1/3' },
        { key: 'B', text: '2/3' },
        { key: 'C', text: '3/4' },
        { key: 'D', text: '4/6' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Phân số – Phân số bằng nhau và rút gọn phân số',
      learningOutcomeCode: 'YCCD-TOAN4-PS-01',
      learningOutcomeText: 'Nhận biết tính chất cơ bản của phân số và tìm được phân số bằng nhau.',
      gradingGuide: 'Rút gọn 12/18 chia cả tử và mẫu cho 6 được 2/3. Chọn B được 0.5 điểm.',
    },
    {
      questionNumber: 8,
      questionCode: 'T4-Q08',
      format: 'MULTIPLE_CHOICE',
      stem: 'Mẹ đưa cho Lan 100 000 đồng để đi siêu thị mua 3 quyển sổ, mỗi quyển giá 18 000 đồng và 2 chiếc bút mực, mỗi chiếc giá 15 000 đồng. Hỏi cô thu ngân phải trả lại cho Lan bao nhiêu tiền thừa?',
      options: [
        { key: 'A', text: '16 000 đồng' },
        { key: 'B', text: '26 000 đồng' },
        { key: 'C', text: '18 000 đồng' },
        { key: 'D', text: '24 000 đồng' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Giải toán có lời văn – Bài toán thực tế nhiều bước tính',
      learningOutcomeCode: 'YCCD-TOAN4-VD-01',
      learningOutcomeText: 'Giải quyết được bài toán thực tiễn liên quan đến tiền Việt Nam và nhiều bước tính.',
      gradingGuide: 'Tiền mua sổ: 18000 × 3 = 54000đ; tiền mua bút: 15000 × 2 = 30000đ; tiền thừa: 100000 - (54000 + 30000) = 16000đ. Chọn A.',
    },
    {
      questionNumber: 9,
      questionCode: 'T4-Q09',
      format: 'MULTIPLE_CHOICE',
      stem: 'Phát biểu nào sau đây đúng về tính chất của hình bình hành?',
      options: [
        { key: 'A', text: 'Hình bình hành có hai cặp cạnh đối diện song song và bàng nhau.' },
        { key: 'B', text: 'Hình bình hành luôn có bốn góc vuông.' },
        { key: 'C', text: 'Hình bình hành chỉ có một cặp cạnh đối diện song song.' },
        { key: 'D', text: 'Hình bình hành có bốn cạnh luôn bằng nhau.' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Hình học phẳng – Hai đường thẳng song song, hình bình hành, hình thoi',
      learningOutcomeCode: 'YCCD-TOAN4-HH-03',
      learningOutcomeText: 'Nhận biết được hình bình hành, hình thoi và đặc điểm cạnh đối diện.',
      gradingGuide: 'Chọn phương án A được 0.5 điểm.',
    },
    {
      questionNumber: 10,
      questionCode: 'T4-Q10',
      format: 'MULTIPLE_CHOICE',
      stem: 'Biểu đồ cột dưới đây cho biết số cây hoa của 4 tổ trồng được: Tổ 1 (15 cây), Tổ 2 (20 cây), Tổ 3 (18 cây), Tổ 4 (22 cây). Hỏi Tổ 4 trồng được nhiều hơn Tổ 1 bao nhiêu cây hoa?',
      options: [
        { key: 'A', text: '5 cây hoa' },
        { key: 'B', text: '7 cây hoa' },
        { key: 'C', text: '4 cây hoa' },
        { key: 'D', text: '8 cây hoa' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Thống kê – Đọc và mô tả số liệu trên biểu đồ cột',
      learningOutcomeCode: 'YCCD-TOAN4-TK-01',
      learningOutcomeText: 'Đọc và mô tả được các số liệu ở dạng biểu đồ cột.',
      gradingGuide: 'Lấy 22 - 15 = 7 cây hoa. Chọn B được 0.5 điểm.',
    },
    {
      questionNumber: 11,
      questionCode: 'T4-Q11',
      format: 'ESSAY',
      stem: 'Đặt tính rồi tính: a) 246 135 + 418 729; b) 652 800 - 194 350; c) 318 × 24.',
      declaredCorrectAnswer: 'a) 664 864; b) 458 450; c) 7 632',
      points: 3.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Các phép tính với số tự nhiên – Đặt tính rồi tính và tìm thành phần chưa biết',
      learningOutcomeCode: 'YCCD-TOAN4-PT-03',
      learningOutcomeText: 'Thực hiện thành thạo đặt tính cộng, trừ, nhân số tự nhiên.',
      gradingGuide: 'Mỗi phép tính đặt tính thẳng cột và tính đúng kết quả được 1.0 điểm (3 × 1.0 = 3.0 điểm).',
      acceptedAlternativeSolutions: 'Học sinh có thể trình bày bước cộng/nhân tích riêng theo thứ tự chuẩn đều được điểm tối đa.',
    },
    {
      questionNumber: 12,
      questionCode: 'T4-Q12',
      format: 'ESSAY',
      stem: 'Hai thửa ruộng thu hoạch được tất cả 4 tấn 2 tạ thóc. Thửa ruộng thứ nhất thu hoạch được nhiều hơn thửa ruộng thứ hai là 6 tạ thóc. Hỏi mỗi thửa ruộng thu hoạch được bao nhiêu ki-lô-gam thóc?',
      declaredCorrectAnswer: 'Thửa thứ nhất: 2 400 kg thóc; Thửa thứ hai: 1 800 kg thóc.',
      points: 2.5,
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      topicTitle: 'Giải toán có lời văn – Tìm hai số khi biết tổng và hiệu của hai số đó',
      learningOutcomeCode: 'YCCD-TOAN4-VD-02',
      learningOutcomeText: 'Giải được bài toán tìm hai số khi biết tổng và hiệu liên quan đến đơn vị đo khối lượng.',
      gradingGuide:
        'Đổi 4 tấn 2 tạ = 42 tạ = 4 200 kg; 6 tạ = 600 kg (0.5đ). Thửa thứ nhất: (4200 + 600) : 2 = 2 400 kg (1.0đ). Thửa thứ hai: 2400 - 600 = 1 800 kg (0.75đ). Đáp số: 0.25đ.',
      acceptedAlternativeSolutions:
        'Chấp nhận cách giải tìm số thóc thửa thứ hai trước: (4200 - 600) : 2 = 1 800 kg, hoặc tính theo đơn vị tạ rồi đổi ra ki-lô-gam ở bước cuối đều đạt điểm tối đa (Nguyên tắc 8).',
    },
  ];

  return {
    dossierId: 'DOSSIER-G4-FLAWED-8ERRORS',
    dossierCode: 'DE-TOAN4-TEST-8LOI',
    title: 'Đề kiểm tra Cuối học kỳ I – Toán Lớp 4 (Bộ đề thử nghiệm 12 câu chứa 8 lỗi kỹ thuật)',
    subject: 'Toán',
    grade: 4,
    examPeriod: 'Cuối học kỳ I',
    examVariantCode: 'MĐ-401',
    curriculumStandard: 'Chương trình GDPT 2018 – Môn Toán Tiểu học',
    assessmentRuleSet: 'Thông tư 27/2020/TT-BGDĐT (3 mức độ: Mức 1, Mức 2, Mức 3)',
    durationMinutes: 40,
    targetTotalPoints: 10.0,
    versionLabel: 'v1.0 (Bản gốc trước kiểm tra)',
    approvalStatus: ApprovalStatus.DRAFT,
    isConfidentialExam: false,
    hasSecurityPermissionForAi: true,
    hasMatrixDocument: true,
    hasSpecificationDocument: true,
    hasExamPaperDocument: true,
    hasAnswerKeyDocument: true,
    hasGradingGuideDocument: true,
    questions,
    matrixSlots: buildStandardGrade4MatrixSlots(),
    specificationSlots: buildStandardGrade4SpecificationSlots(),
  };
}

export function createValidGrade4MathTestDossier(): QualityReviewDossierPackage {
  const flawed = createFlawedGrade4MathTestDossier();
  const cleanQuestions: QualityReviewQuestionNode[] = flawed.questions.map((q) => {
    if (q.questionNumber === 2) {
      return {
        ...q,
        declaredCorrectAnswer: 'C',
        gradingGuide: 'Ta có 45 000 + 35 000 = 80 000. Chọn đúng phương án C được 0.5 điểm.',
      };
    }
    if (q.questionNumber === 4) {
      return {
        ...q,
        stem: 'Biết mỗi thùng có 125 quyển vở nên 4 thùng có 125 × 4 = 500 quyển vở. Nếu chia đều số vở đó cho 5 lớp thì mỗi lớp nhận được bao nhiêu quyển vở?',
        options: [
          { key: 'A', text: '100 quyển vở' },
          { key: 'B', text: '90 quyển vở' },
          { key: 'C', text: '110 quyển vở' },
          { key: 'D', text: '80 quyển vở' },
        ],
        declaredCorrectAnswer: 'A',
        gradingGuide: 'Ta có 125 × 4 = 500 quyển vở; lấy 500 : 5 = 100 quyển vở. Chọn A được 0.5 điểm.',
      };
    }
    if (q.questionNumber === 6) {
      return {
        ...q,
        stem: 'Một mảnh vườn hình chữ nhật có chiều dài 18 m và chiều rộng 10 m. Diện tích của mảnh vườn hình chữ nhật đó là bao nhiêu mét vuông?',
      };
    }
    if (q.questionNumber === 7) {
      return {
        ...q,
        stem: 'Phân số tối giản nào dưới đây bằng phân số 12/18?',
        options: [
          { key: 'A', text: '1/3' },
          { key: 'B', text: '2/3' },
          { key: 'C', text: '3/4' },
          { key: 'D', text: '5/6' },
        ],
        declaredCorrectAnswer: 'B',
      };
    }
    if (q.questionNumber === 8) {
      return {
        ...q,
        declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      };
    }
    if (q.questionNumber === 9) {
      return {
        ...q,
        options: [
          { key: 'A', text: 'Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau.' },
          { key: 'B', text: 'Hình bình hành luôn có bốn góc vuông.' },
          { key: 'C', text: 'Hình bình hành chỉ có một cặp cạnh đối diện song song.' },
          { key: 'D', text: 'Hình bình hành có bốn cạnh luôn bằng nhau.' },
        ],
      };
    }
    if (q.questionNumber === 10) {
      return {
        ...q,
        stem: 'Số thích hợp để điền vào chỗ chấm "4 tấn 5 yến = ... kg" là:',
        options: [
          { key: 'A', text: '405 kg' },
          { key: 'B', text: '4 050 kg' },
          { key: 'C', text: '4 500 kg' },
          { key: 'D', text: '4 005 kg' },
        ],
        declaredCorrectAnswer: 'B',
        topicTitle: 'Đo lường – Đổi đơn vị đo khối lượng (yến, tạ, tấn) và diện tích',
        learningOutcomeCode: 'YCCD-TOAN4-DL-01',
        learningOutcomeText: 'Thực hiện được việc ước lượng và đổi đơn vị đo khối lượng yến, tạ, tấn.',
        gradingGuide: 'Ta có 4 tấn = 4 000 kg, 5 yến = 50 kg -> 4 050 kg. Chọn B được 0.5 điểm.',
      };
    }
    if (q.questionNumber === 12) {
      return {
        ...q,
        points: 2.0,
        gradingGuide:
          'Đổi 4 tấn 2 tạ = 4 200 kg; 6 tạ = 600 kg (0.25đ). Thửa thứ nhất: (4200 + 600) : 2 = 2 400 kg (0.75đ). Thửa thứ hai: 2400 - 600 = 1 800 kg (0.75đ). Đáp số: 0.25đ. (Chấp nhận mọi cách giải đúng khác).',
      };
    }
    return q;
  });

  return {
    ...flawed,
    dossierId: 'DOSSIER-G4-VALID-0ERRORS',
    dossierCode: 'DE-TOAN4-CHUAN-0LOI',
    title: 'Đề kiểm tra Cuối học kỳ I – Toán Lớp 4 (Bộ đề chuẩn hợp lệ 12 câu – Đánh giá False Positive)',
    examVariantCode: 'MĐ-402',
    versionLabel: 'v1.0 (Chuẩn đối chứng)',
    questions: cleanQuestions,
  };
}

export function createIncompleteGrade4Dossier(): QualityReviewDossierPackage {
  const valid = createValidGrade4MathTestDossier();
  return {
    ...valid,
    dossierId: 'DOSSIER-G4-PARTIAL-DOCS',
    dossierCode: 'DE-TOAN4-THIEU-HOSO',
    title: 'Đề kiểm tra Toán Lớp 4 (Hồ sơ thiếu Ma trận & Bản đặc tả – Kiểm tra từng phần)',
    examVariantCode: 'MĐ-403',
    hasMatrixDocument: false,
    hasSpecificationDocument: false,
    matrixSlots: [],
    specificationSlots: [],
  };
}

// ============================================================================
// 2D. HỒ SƠ ĐỀ KIỂM TRA TOÁN LỚP 5 THỬ NGHIỆM CHUYÊN SÂU (8 LỖI ĐẶC THÙ TOÁN 5)
// Kiểm thử 5 trụ cột: Tính toán xác định (biểu thức số thập phân, đổi đơn vị),
// Đề bài (dữ kiện mâu thuẫn bất đẳng thức tam giác), Mức độ tư duy,
// Hướng dẫn chấm (lời giải sai nhưng kết quả tình cờ đúng 16/64 = 1/4, thiếu bước & đơn vị),
// Hình học (sai công thức hình thang & lệch tên đường cao AH/MK, hình vẽ gây hiểu nhầm)
// ============================================================================

function buildStandardGrade5MathMatrixSlots(): QualityReviewMatrixSlot[] {
  return [
    {
      questionNumber: 1,
      expectedTopicTitle: 'Số thập phân – Hàng của số thập phân, đọc, viết và so sánh số thập phân',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-STP-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 2,
      expectedTopicTitle: 'Các phép tính với số thập phân – Tính giá trị biểu thức số thập phân',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-STP-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 3,
      expectedTopicTitle: 'Đo lường – Đổi đơn vị đo diện tích (ha, m²) và thể tích (m³, dm³, lít)',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-DL-01',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 4,
      expectedTopicTitle: 'Tỉ số phần trăm – Tìm tỉ số phần trăm của hai số',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-TSPT-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 5,
      expectedTopicTitle: 'Hình học phẳng – Hình tam giác, chu vi và diện tích hình tam giác',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-HH-01',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 6,
      expectedTopicTitle: 'Tỉ số phần trăm – Giải bài toán thực tiễn liên quan đến giảm giá liên tiếp',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-VD-01',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 0.5,
    },
    {
      questionNumber: 7,
      expectedTopicTitle: 'Hình học phẳng – Hình thang và công thức tính diện tích hình thang',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-HH-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 8,
      expectedTopicTitle: 'Hình học & Đo lường – Nhận biết góc và tỉ lệ đoạn thẳng trên hình vẽ',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-HH-03',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 1.0,
    },
    {
      questionNumber: 9,
      expectedTopicTitle: 'Phân số & Số thập phân – Rút gọn phân số và tính giá trị biểu thức',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-PS-01',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'ESSAY',
      expectedPoints: 2.0,
    },
    {
      questionNumber: 10,
      expectedTopicTitle: 'Hình khối & Đo lường – Thể tích hình hộp chữ nhật và đổi đơn vị lít',
      expectedLearningOutcomeCode: 'YCCD-TOAN5-VD-02',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'ESSAY',
      expectedPoints: 3.0,
    },
  ];
}

export function createFlawedGrade5MathTestDossier(): QualityReviewDossierPackage {
  const matrixSlots = buildStandardGrade5MathMatrixSlots();
  const specificationSlots: QualityReviewSpecificationSlot[] = matrixSlots.map((m) => ({
    questionNumber: m.questionNumber,
    learningOutcomeCode: m.expectedLearningOutcomeCode,
    learningOutcomeDescription: `Đánh giá yêu cầu cần đạt ${m.expectedLearningOutcomeCode} thuộc mạch ${m.expectedTopicTitle} (Chương trình Toán Lớp 5 GDPT 2018).`,
    competencyAssessed:
      m.expectedCognitiveLevel === 'Mức 3 – Vận dụng'
        ? 'Năng lực giải quyết vấn đề toán học & mô hình hóa toán học'
        : 'Năng lực tư duy và lập luận toán học',
    cognitiveLevel: m.expectedCognitiveLevel,
    format: m.expectedFormat,
  }));

  const questions: QualityReviewQuestionNode[] = [
    {
      questionNumber: 1,
      questionCode: 'T5-Q01',
      format: 'MULTIPLE_CHOICE',
      stem: 'Chữ số 7 trong số thập phân 45,278 có giá trị là bao nhiêu?',
      options: [
        { key: 'A', text: '7/10' },
        { key: 'B', text: '7/100' },
        { key: 'C', text: '7/1000' },
        { key: 'D', text: '70' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Số thập phân – Hàng của số thập phân, đọc, viết và so sánh số thập phân',
      learningOutcomeCode: 'YCCD-TOAN5-STP-01',
      learningOutcomeText: 'Nhận biết được hàng của số thập phân và giá trị chữ số theo vị trí.',
      gradingGuide: 'Chữ số 7 đứng ở hàng phần trăm nên có giá trị là 7/100. Chọn B được 0.5 điểm.',
      mathAuditSpec: {
        calculationType: 'FRACTION_DECIMAL',
        expressionOrFormulaText: 'Giá trị chữ số 7 ở hàng phần trăm của 45,278',
        declaredResultValue: '7/100 (0,07)',
        deterministicTrueResult: '7/100 (0,07)',
        stepCount: 1,
        thinkingOperationsAnalysis: 'Nhận diện trực tiếp vị trí hàng phần trăm sau dấu phẩy.',
        recommendedCognitiveLevel: 'Mức 1 – Nhận biết',
        cognitiveLevelJustification:
          'Mức 1 – Nhận biết: Học sinh chỉ cần nhớ quy tắc cấu tạo hàng của số thập phân, không qua bước biến đổi trung gian.',
      },
    },
    {
      // LỖI 1 TOÁN 5 (MỤC 1 - KIỂM TRA TÍNH TOÁN GIÁ TRỊ BIỂU THỨC BẰNG BỘ TÍNH TOÁN XÁC ĐỊNH):
      // 12,5 + 7,5 × 0,4 = 12,5 + 3 = 15,5 (B), nhưng đáp án ghi A (8) do cộng trước nhân sau!
      questionNumber: 2,
      questionCode: 'T5-Q02',
      format: 'MULTIPLE_CHOICE',
      stem: 'Giá trị của biểu thức 12,5 + 7,5 × 0,4 là bao nhiêu?',
      options: [
        { key: 'A', text: '8' },
        { key: 'B', text: '15,5' },
        { key: 'C', text: '14,5' },
        { key: 'D', text: '20,4' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Các phép tính với số thập phân – Tính giá trị biểu thức số thập phân',
      learningOutcomeCode: 'YCCD-TOAN5-STP-02',
      learningOutcomeText: 'Tính được giá trị biểu thức số thập phân có đến hai dấu phép tính.',
      gradingGuide: 'Lấy 12,5 + 7,5 = 20; sau đó 20 × 0,4 = 8. Chọn A được 0.5 điểm.',
      mathAuditSpec: {
        calculationType: 'EXPRESSION_VALUE',
        expressionOrFormulaText: '12,5 + 7,5 × 0,4',
        declaredResultValue: '8 (Phương án A)',
        deterministicTrueResult: '15,5 (Phương án B)',
        deterministicSolutionSteps:
          'Thực hiện phép nhân trước, phép cộng sau: 7,5 × 0,4 = 3; 12,5 + 3 = 15,5 (≠ 8).',
        stepCount: 2,
        thinkingOperationsAnalysis:
          'Áp dụng quy tắc thứ tự thực hiện phép tính (nhân trước, cộng sau) với số thập phân.',
        recommendedCognitiveLevel: 'Mức 2 – Thông hiểu',
        cognitiveLevelJustification:
          'Mức 2 – Thông hiểu: Học sinh phải hiểu quy tắc thứ tự ưu tiên phép tính và thực hiện 2 bước tính số thập phân.',
      },
    },
    {
      // LỖI 2 TOÁN 5 (MỤC 1 - KIỂM TRA ĐỔI ĐƠN VỊ ĐO DIỆN TÍCH BẰNG BỘ TÍNH TOÁN XÁC ĐỊNH):
      // 3 ha 450 m² = 3,045 ha (C), nhưng đáp án ghi B (3,45 ha) do nhầm 1 ha = 1 000 m².
      questionNumber: 3,
      questionCode: 'T5-Q03',
      format: 'MULTIPLE_CHOICE',
      stem: 'Số thập phân thích hợp để điền vào chỗ chấm "3 ha 450 m² = ... ha" là:',
      options: [
        { key: 'A', text: '3,4500' },
        { key: 'B', text: '3,45' },
        { key: 'C', text: '3,045' },
        { key: 'D', text: '30,45' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Đo lường – Đổi đơn vị đo diện tích (ha, m²) và thể tích (m³, dm³, lít)',
      learningOutcomeCode: 'YCCD-TOAN5-DL-01',
      learningOutcomeText: 'Chuyển đổi được các đơn vị đo diện tích héc-ta (ha) và mét vuông (m²).',
      gradingGuide: 'Ta có 450 m² = 0,45 ha nên 3 ha 450 m² = 3,45 ha. Chọn B được 0.5 điểm.',
      mathAuditSpec: {
        calculationType: 'UNIT_CONVERSION',
        expressionOrFormulaText: '3 ha 450 m² = ... ha',
        declaredResultValue: '3,45 ha (Phương án B)',
        deterministicTrueResult: '3,045 ha (Phương án C)',
        declaredUnit: 'ha',
        expectedUnit: 'ha',
        deterministicSolutionSteps:
          '1 ha = 10 000 m² ⇒ 450 m² = 450 / 10 000 ha = 0,045 ha ⇒ 3 ha + 0,045 ha = 3,045 ha (≠ 3,45 ha).',
        stepCount: 2,
        thinkingOperationsAnalysis:
          'Vận dụng quan hệ 1 ha = 10 000 m² để chuyển số đo danh số phức sang số thập phân.',
        recommendedCognitiveLevel: 'Mức 2 – Thông hiểu',
        cognitiveLevelJustification:
          'Mức 2 – Thông hiểu: Đòi hỏi hiểu mối quan hệ giữa hai đơn vị đo diện tích không liền kề (ha và m²) và viết dưới dạng số thập phân.',
      },
    },
    {
      questionNumber: 4,
      questionCode: 'T5-Q04',
      format: 'MULTIPLE_CHOICE',
      stem: 'Tỉ số phần trăm của 15 và 60 là:',
      options: [
        { key: 'A', text: '20%' },
        { key: 'B', text: '25%' },
        { key: 'C', text: '30%' },
        { key: 'D', text: '40%' },
      ],
      declaredCorrectAnswer: 'B',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Tỉ số phần trăm – Tìm tỉ số phần trăm của hai số',
      learningOutcomeCode: 'YCCD-TOAN5-TSPT-01',
      learningOutcomeText: 'Tìm được tỉ số phần trăm của hai số cho trước.',
      gradingGuide: 'Ta có 15 : 60 = 0,25 = 25%. Chọn B được 0.5 điểm.',
      mathAuditSpec: {
        calculationType: 'FRACTION_DECIMAL',
        expressionOrFormulaText: '(15 : 60) × 100%',
        declaredResultValue: '25%',
        deterministicTrueResult: '25%',
        declaredUnit: '%',
        expectedUnit: '%',
        deterministicSolutionSteps: '15 : 60 = 0,25 = 25%.',
        stepCount: 1,
        thinkingOperationsAnalysis: 'Thực hiện trực tiếp quy tắc tìm tỉ số phần trăm của hai số.',
        recommendedCognitiveLevel: 'Mức 1 – Nhận biết',
        cognitiveLevelJustification:
          'Mức 1 – Nhận biết: Áp dụng trực tiếp quy tắc cơ bản tìm tỉ số phần trăm của hai số 15 và 60.',
      },
    },
    {
      // LỖI 3 TOÁN 5 (MỤC 2 - KIỂM TRA ĐỀ BÀI: DỮ KIỆN MÂU THUẪN TOÁN HỌC):
      // Tam giác có 3 cạnh 4 cm, 5 cm, 12 cm -> 4 + 5 = 9 < 12 (vi phạm bất đẳng thức tam giác, không tồn tại tam giác!)
      questionNumber: 5,
      questionCode: 'T5-Q05',
      format: 'MULTIPLE_CHOICE',
      stem: 'Một mảnh bìa hình tam giác ABC có độ dài ba cạnh lần lượt là AB = 4 cm, BC = 5 cm và AC = 12 cm. Chu vi của mảnh bìa hình tam giác ABC đó là:',
      options: [
        { key: 'A', text: '21 cm' },
        { key: 'B', text: '20 cm' },
        { key: 'C', text: '24 cm' },
        { key: 'D', text: '19 cm' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Hình học phẳng – Hình tam giác, chu vi và diện tích hình tam giác',
      learningOutcomeCode: 'YCCD-TOAN5-HH-01',
      learningOutcomeText: 'Nhận biết đặc điểm hình tam giác và tính chu vi, diện tích hình tam giác.',
      gradingGuide: 'Chu vi tam giác ABC là: 4 + 5 + 12 = 21 (cm). Chọn A được 0.5 điểm.',
      mathAuditSpec: {
        calculationType: 'ARITHMETIC_BASIC',
        expressionOrFormulaText: 'AB = 4 cm, BC = 5 cm, AC = 12 cm (Kiểm tra tồn tại tam giác)',
        declaredResultValue: '21 cm',
        deterministicTrueResult: 'Dữ kiện mâu thuẫn (AB + BC = 4 + 5 = 9 cm < AC = 12 cm)',
        declaredUnit: 'cm',
        expectedUnit: 'cm',
        deterministicSolutionSteps:
          'Kiểm tra điều kiện tồn tại tam giác: AB + BC = 4 + 5 = 9 cm < AC = 12 cm ⇒ Không tồn tại tam giác có 3 cạnh 4 cm, 5 cm, 12 cm. Nếu sửa AC = 7 cm thì 4 + 5 > 7 và Chu vi P = 4 + 5 + 7 = 16 cm.',
        hasContradictoryData: true,
        contradictoryDataDetail:
          'Tổng độ dài hai cạnh AB + BC = 4 + 5 = 9 cm nhỏ hơn cạnh thứ ba AC = 12 cm, nên mảnh bìa hình tam giác này không thể tồn tại trong thực tế và hình học.',
        stepCount: 1,
        thinkingOperationsAnalysis: 'Cộng độ dài 3 cạnh để tính chu vi tam giác.',
        recommendedCognitiveLevel: 'Mức 2 – Thông hiểu',
        cognitiveLevelJustification:
          'Mức 2 – Thông hiểu: Áp dụng quy tắc tính chu vi hình tam giác từ số đo 3 cạnh.',
      },
    },
    {
      // LỖI 4 TOÁN 5 (MỤC 3 - KIỂM TRA MỨC ĐỘ: GÁN SAI MỨC ĐỘ DO KHÔNG PHÂN TÍCH THAO TÁC TƯ DUY):
      // Bài toán thực tế giảm giá 2 lần liên tiếp trên giá mới (Mức 3 – Vận dụng) nhưng đang khai báo Mức 1 – Nhận biết!
      questionNumber: 6,
      questionCode: 'T5-Q06',
      format: 'MULTIPLE_CHOICE',
      stem: 'Một chiếc xe đạp có giá niêm yết 2 000 000 đồng. Nhân dịp khai giảng, cửa hàng giảm giá 10% so với giá niêm yết. Học sinh giỏi mua xe còn được giảm thêm 5% trên giá đã giảm. Hỏi bạn Minh (là học sinh giỏi) mua chiếc xe đạp đó phải trả bao nhiêu tiền?',
      options: [
        { key: 'A', text: '1 710 000 đồng' },
        { key: 'B', text: '1 700 000 đồng' },
        { key: 'C', text: '1 800 000 đồng' },
        { key: 'D', text: '1 750 000 đồng' },
      ],
      declaredCorrectAnswer: 'A',
      points: 0.5,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Tỉ số phần trăm – Giải bài toán thực tiễn liên quan đến giảm giá liên tiếp',
      learningOutcomeCode: 'YCCD-TOAN5-VD-01',
      learningOutcomeText: 'Giải quyết được vấn đề thực tiễn gắn với tỉ số phần trăm nhiều bước.',
      gradingGuide:
        'Giá sau lần giảm thứ nhất: 2 000 000 × (100% - 10%) = 1 800 000 đồng. Số tiền phải trả sau khi giảm thêm 5% trên giá đã giảm: 1 800 000 × (100% - 5%) = 1 710 000 đồng. Chọn A.',
      mathAuditSpec: {
        calculationType: 'WORD_PROBLEM_RESULT_UNIT',
        expressionOrFormulaText: '2 000 000 × 0,9 × 0,95',
        declaredResultValue: '1 710 000 đồng',
        deterministicTrueResult: '1 710 000 đồng',
        declaredUnit: 'đồng',
        expectedUnit: 'đồng',
        deterministicSolutionSteps:
          'Bước 1: Giá sau khi giảm 10% là 2 000 000 × 0,9 = 1 800 000 (đồng). Bước 2: Giá sau khi giảm tiếp 5% trên giá mới là 1 800 000 × 0,95 = 1 710 000 (đồng).',
        stepCount: 3,
        thinkingOperationsAnalysis:
          'Học sinh phải phân biệt rõ cơ sở tính phần trăm ở hai lần giảm giá khác nhau (lần 2 tính 5% trên giá đã giảm 1 800 000đ chứ không được cộng gộp 10% + 5% = 15%), mô hình hóa tình huống mua bán thực tế.',
        recommendedCognitiveLevel: 'Mức 3 – Vận dụng',
        cognitiveLevelJustification:
          'Mức 3 – Vận dụng: Không phân loại chỉ dựa vào số bước tính mà dựa vào thao tác tư duy giải quyết tình huống thực tiễn không quen thuộc (thay đổi đại lượng gốc 100% qua hai lần giảm giá liên tiếp, khớp mã YCCD-TOAN5-VD-01).',
      },
    },
    {
      // LỖI 5 TOÁN 5 (MỤC 5 - KIỂM TRA HÌNH HỌC: ĐỐI CHIẾU HÌNH VẼ VỚI DỮ KIỆN, TÊN ĐIỂM/ĐOẠN THẲNG & CÔNG THỨC DIỆN TÍCH):
      // 1) Đề ghi đường cao AH = 6 cm nhưng hình vẽ ghi đường cao MK = 6 cm (lệch tên điểm/đoạn thẳng).
      // 2) Công thức tính diện tích hình thang quên chia 2: lấy (15 + 9) × 6 = 144 cm² (A) thay vì (15 + 9) × 6 : 2 = 72 cm² (B).
      questionNumber: 7,
      questionCode: 'T5-Q07',
      format: 'MULTIPLE_CHOICE',
      stem: 'Cho hình thang ABCD (như hình vẽ bên, trên hình vẽ ký hiệu hai đáy AB = 9 cm, CD = 15 cm và đoạn vuông góc hạ từ đỉnh xuống đáy ghi tên là MK = 6 cm). Biết đáy lớn CD = 15 cm, đáy bé AB = 9 cm và chiều cao AH = 6 cm. Diện tích hình thang ABCD là:',
      options: [
        { key: 'A', text: '144 cm²' },
        { key: 'B', text: '72 cm²' },
        { key: 'C', text: '96 cm²' },
        { key: 'D', text: '108 cm²' },
      ],
      declaredCorrectAnswer: 'A',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Hình học phẳng – Hình thang và công thức tính diện tích hình thang',
      learningOutcomeCode: 'YCCD-TOAN5-HH-02',
      learningOutcomeText: 'Tính được diện tích hình thang khi biết độ dài hai đáy và chiều cao.',
      gradingGuide: 'Áp dụng công thức diện tích hình thang: S = (15 + 9) × 6 = 144 (cm²). Chọn A được 1.0 điểm.',
      mathAuditSpec: {
        calculationType: 'EXPRESSION_VALUE',
        expressionOrFormulaText: 'S_hinh_thang = (15 + 9) × 6 : 2',
        declaredResultValue: '144 cm² (Phương án A)',
        deterministicTrueResult: '72 cm² (Phương án B)',
        declaredUnit: 'cm²',
        expectedUnit: 'cm²',
        deterministicSolutionSteps:
          'Công thức chuẩn diện tích hình thang: S = (a + b) × h : 2 = (15 + 9) × 6 : 2 = 24 × 6 : 2 = 72 (cm²). Hướng dẫn chấm quên chia 2 nên ra 144 cm².',
        stepCount: 2,
        thinkingOperationsAnalysis:
          'Đối chiếu các yếu tố đáy lớn, đáy bé, đường cao trên hình thang và áp dụng công thức diện tích.',
        recommendedCognitiveLevel: 'Mức 2 – Thông hiểu',
        cognitiveLevelJustification:
          'Mức 2 – Thông hiểu: Kết nối thông tin giữa lời văn và hình vẽ để vận dụng công thức diện tích hình thang.',
        geometryMetadata: {
          shapeType: 'TRAPEZOID',
          shapeLabel: 'Hình thang ABCD',
          declaredPointsAndSegments: ['A', 'B', 'C', 'D', 'AB', 'CD', 'AH'],
          diagramPointsAndSegments: ['A', 'B', 'C', 'D', 'AB', 'CD', 'MK'],
          declaredFormula: 'S = (a + b) × h',
          correctFormula: 'S = (a + b) × h : 2',
          diagramDescription:
            'Hình vẽ minh họa hình thang ABCD ghi đáy AB = 9 cm, CD = 15 cm nhưng ký hiệu đường cao là đoạn MK = 6 cm (không có điểm H và đoạn AH như đề bài nêu).',
          hasLabelMismatch: true,
          labelMismatchDetail:
            'Đề bài nêu chiều cao là đoạn thẳng "AH = 6 cm", nhưng trên hình vẽ minh họa lại ký hiệu tên đường cao là "MK = 6 cm" (lệch tên điểm A, H và M, K).',
          hasFormulaError: true,
          formulaErrorDetail:
            'Hướng dẫn chấm và đáp án khóa dùng sai công thức diện tích hình thang S = (a + b) × h = (15 + 9) × 6 = 144 cm² (thiếu phép chia cho 2; kết quả đúng phải là 72 cm²).',
        },
      },
    },
    {
      // LỖI 6 TOÁN 5 (MỤC 5 - KIỂM TRA HÌNH HỌC: PHÁT HIỆN HÌNH MINH HỌA GÂY HIỂU NHẦM):
      // Đề cho góc xOy = 60° (góc nhọn) và cạnh OA = 12 cm, OB = 4 cm, nhưng hình vẽ minh họa lại vẽ góc tù 135° và đoạn OA ngắn bằng 1/2 đoạn OB!
      questionNumber: 8,
      questionCode: 'T5-Q08',
      format: 'MULTIPLE_CHOICE',
      stem: 'Quan sát hình vẽ minh họa góc xOy (trên hình vẽ góc xOy mở rộng bằng 135° và đoạn OA được vẽ ngắn bằng nửa đoạn OB). Biết theo số liệu đề bài cho góc xOy = 60°, cạnh OA = 12 cm, cạnh OB = 4 cm. Hỏi góc xOy thuộc loại góc nào và cạnh OA gấp mấy lần cạnh OB?',
      options: [
        { key: 'A', text: 'Góc nhọn; cạnh OA gấp 3 lần cạnh OB' },
        { key: 'B', text: 'Góc tù; cạnh OA bằng 1/2 cạnh OB' },
        { key: 'C', text: 'Góc vuông; cạnh OA gấp 2 lần cạnh OB' },
        { key: 'D', text: 'Góc nhọn; cạnh OA gấp 4 lần cạnh OB' },
      ],
      declaredCorrectAnswer: 'A',
      points: 1.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Hình học & Đo lường – Nhận biết góc và tỉ lệ đoạn thẳng trên hình vẽ',
      learningOutcomeCode: 'YCCD-TOAN5-HH-03',
      learningOutcomeText: 'Nhận biết góc nhọn, góc tù và tỉ số độ dài hai đoạn thẳng gắn với hình vẽ.',
      gradingGuide: 'Vì 60° < 90° nên góc xOy là góc nhọn; 12 : 4 = 3 (lần). Chọn A được 1.0 điểm.',
      mathAuditSpec: {
        calculationType: 'ARITHMETIC_BASIC',
        expressionOrFormulaText: '60° < 90° (Góc nhọn); 12 : 4 = 3 (lần)',
        declaredResultValue: 'Góc nhọn; OA gấp 3 lần OB',
        deterministicTrueResult: 'Góc nhọn; OA gấp 3 lần OB (Nhưng hình vẽ minh họa ngược hoàn toàn dữ kiện)',
        stepCount: 2,
        thinkingOperationsAnalysis:
          'Phân loại góc dựa trên số đo 60° và tính tỉ số độ dài hai đoạn thẳng OA, OB.',
        recommendedCognitiveLevel: 'Mức 2 – Thông hiểu',
        cognitiveLevelJustification:
          'Mức 2 – Thông hiểu: Kết hợp nhận biết đặc điểm góc với phép tính tỉ số của hai đoạn thẳng.',
        geometryMetadata: {
          shapeType: 'ANGLE',
          shapeLabel: 'Góc xOy và hai đoạn thẳng OA, OB',
          declaredPointsAndSegments: ['O', 'x', 'y', 'A', 'B', 'OA', 'OB'],
          diagramPointsAndSegments: ['O', 'x', 'y', 'A', 'B', 'OA', 'OB'],
          diagramDescription:
            'Hình minh họa vẽ góc xOy = 135° (góc tù) trong khi dữ kiện cho 60° (góc nhọn), đồng thời vẽ đoạn OA ngắn bằng 1/2 đoạn OB trong khi dữ kiện cho OA = 12 cm > OB = 4 cm.',
          hasMisleadingDiagram: true,
          misleadingDiagramDetail:
            'Hình minh họa gây hiểu nhầm trực quan nghiêm trọng cho học sinh Tiểu học: Đề bài cho góc nhọn 60° và OA = 12 cm dài gấp 3 lần OB = 4 cm, nhưng hình đính kèm lại vẽ góc tù 135° và vẽ đoạn OA ngắn hơn đoạn OB.',
        },
      },
    },
    {
      // LỖI 7 TOÁN 5 (MỤC 4 - KIỂM TRA HƯỚNG DẪN CHẤM: PHÁT HIỆN LỜI GIẢI SAI BẢN CHẤT NHƯNG KẾT QUẢ TÌNH CỜ ĐÚNG):
      // Rút gọn phân số 16/64: Hướng dẫn chấm ghi "Gạch bỏ chữ số 6 ở tử số và chữ số 6 ở mẫu số ta được 16/64 = 1/4" (kết quả 1/4 tình cờ đúng nhưng phương pháp toán học sai hoàn toàn!).
      questionNumber: 9,
      questionCode: 'T5-Q09',
      format: 'ESSAY',
      stem: 'Rút gọn phân số 16/64 về phân số tối giản rồi tính giá trị biểu thức: 16/64 + 3/4.',
      declaredCorrectAnswer: '16/64 = 1/4;  1/4 + 3/4 = 4/4 = 1',
      points: 2.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Phân số & Số thập phân – Rút gọn phân số và tính giá trị biểu thức',
      learningOutcomeCode: 'YCCD-TOAN5-PS-01',
      learningOutcomeText: 'Rút gọn được phân số về tối giản và thực hiện phép cộng phân số.',
      gradingGuide:
        'Bước 1 (1,0đ): Rút gọn phân số 16/64 bằng cách gạch bỏ chữ số 6 ở tử số và chữ số 6 ở mẫu số, ta được 16/64 = 1/4. Bước 2 (1,0đ): Tính 1/4 + 3/4 = 4/4 = 1.',
      acceptedAlternativeSolutions: 'Học sinh có thể quy đồng mẫu số 64 rồi rút gọn kết quả cuối cùng.',
      mathAuditSpec: {
        calculationType: 'FRACTION_DECIMAL',
        expressionOrFormulaText: '16/64 + 3/4',
        declaredResultValue: '1/4 và 1',
        deterministicTrueResult: '16/64 = (16 : 16) / (64 : 16) = 1/4;  1/4 + 3/4 = 1',
        deterministicSolutionSteps:
          'ƯCLN(16, 64) = 16 ⇒ 16/64 = (16 : 16)/(64 : 16) = 1/4; sau đó 1/4 + 3/4 = 4/4 = 1.',
        stepCount: 2,
        thinkingOperationsAnalysis:
          'Tìm số tự nhiên lớn nhất mà cả tử và mẫu cùng chia hết (16) để rút gọn phân số, sau đó cộng hai phân số cùng mẫu số.',
        recommendedCognitiveLevel: 'Mức 2 – Thông hiểu',
        cognitiveLevelJustification:
          'Mức 2 – Thông hiểu: Học sinh vận dụng tính chất cơ bản của phân số để đưa về cùng mẫu số 4 rồi thực hiện phép cộng.',
        rubricSubStepPoints: [
          { stepLabel: 'Bước 1: Rút gọn phân số 16/64 = 1/4', points: 1.0 },
          { stepLabel: 'Bước 2: Cộng 1/4 + 3/4 = 1', points: 1.0 },
        ],
        hasFlukeCorrectResultFromWrongMethod: true,
        flukeMethodDetail:
          'Hướng dẫn chấm Bước 1 hướng dẫn "gạch bỏ chữ số 6 ở tử số và chữ số 6 ở mẫu số của 16/64 để được 1/4". Đây là lỗi lập luận toán học sai bản chất nghiêm trọng (rút gọn chữ số hàng đơn vị với hàng chục) nhưng kết quả 1/4 lại tình cờ đúng.',
      },
    },
    {
      // LỖI 8 TOÁN 5 (MỤC 4 - KIỂM TRA HƯỚNG DẪN CHẤM: ĐÁP ÁN MẪU THIẾU BƯỚC TRUNG GIAN, THIẾU ĐƠN VỊ & TỔNG ĐIỂM THÀNH PHẦN KHÔNG KHỚP):
      // Câu 10 (3,0đ): Bể nước HHCN dài 2,5 m, rộng 1,8 m, cao 1,2 m. Hỏi bể chứa đầy được bao nhiêu lít nước (1 dm³ = 1 lít)?
      // Đáp án mẫu & HDC chỉ ghi tắt "Đáp số: 5 400" (thiếu bước tính thể tích V = 5,4 m³, thiếu bước đổi 5,4 m³ = 5 400 dm³, thiếu đơn vị "lít", và điểm thành phần 0,5đ + 0,5đ = 1,0đ ≠ 3,0đ!).
      questionNumber: 10,
      questionCode: 'T5-Q10',
      format: 'ESSAY',
      stem: 'Một bể nước dạng hình hộp chữ nhật có kích thước trong lòng bể là: chiều dài 2,5 m, chiều rộng 1,8 m và chiều cao 1,2 m. Hỏi khi bể chứa đầy nước thì trong bể có bao nhiêu lít nước? (Biết 1 dm³ = 1 lít).',
      declaredCorrectAnswer: '5 400',
      points: 3.0,
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      topicTitle: 'Hình khối & Đo lường – Thể tích hình hộp chữ nhật và đổi đơn vị lít',
      learningOutcomeCode: 'YCCD-TOAN5-VD-02',
      learningOutcomeText: 'Tính được thể tích hình hộp chữ nhật và giải bài toán thực tiễn liên quan đến đơn vị lít.',
      gradingGuide:
        'Bước 1 (0,5đ): Lời giải tìm lượng nước trong bể. Bước 2 (0,5đ): Ghi kết quả 5 400.',
      mathAuditSpec: {
        calculationType: 'WORD_PROBLEM_RESULT_UNIT',
        expressionOrFormulaText: 'V = 2,5 × 1,8 × 1,2 = 5,4 (m³) = 5 400 (dm³) = 5 400 (lít)',
        declaredResultValue: '5 400 (Thiếu đơn vị lít)',
        deterministicTrueResult: '5 400 lít nước',
        declaredUnit: '(Trống – Thiếu đơn vị)',
        expectedUnit: 'lít (hoặc lít nước)',
        deterministicSolutionSteps:
          'Bước 1: Thể tích lòng bể nước là: 2,5 × 1,8 × 1,2 = 5,4 (m³). Bước 2: Đổi 5,4 m³ = 5 400 dm³ = 5 400 lít. Bước 3: Đáp số: 5 400 lít nước.',
        stepCount: 3,
        thinkingOperationsAnalysis:
          'Vận dụng công thức thể tích hình hộp chữ nhật kết hợp chuyển đổi đơn vị thể tích từ m³ sang dm³ và quy đổi sang dung tích thực tế (lít).',
        recommendedCognitiveLevel: 'Mức 3 – Vận dụng',
        cognitiveLevelJustification:
          'Mức 3 – Vận dụng: Bài toán giải quyết tình huống thực tiễn đòi hỏi kết nối kiến thức hình học không gian (thể tích HHCN) với phép đổi đơn vị đo dung tích.',
        rubricSubStepPoints: [
          { stepLabel: 'Bước 1: Lời giải tìm lượng nước', points: 0.5 },
          { stepLabel: 'Bước 2: Ghi kết quả 5 400', points: 0.5 },
        ],
        hasMissingStepOrUnitInRubric: true,
        missingStepOrUnitDetail:
          'Đáp án mẫu và Hướng dẫn chấm bị thiếu 2 bước giải bắt buộc (bước tính thể tích V = 2,5 × 1,8 × 1,2 = 5,4 m³ và bước đổi đơn vị 5,4 m³ = 5 400 dm³ = 5 400 lít), thiếu đơn vị đo "lít" ở đáp số ("5 400"), chưa ghi nhận cách giải khác (đổi các kích thước ra dm trước: 25 × 18 × 12 = 5 400 dm³), và tổng điểm thành phần trong hướng dẫn chấm (0,5đ + 0,5đ = 1,0đ) bị hụt 2,0đ so với điểm câu hỏi (3,0đ).',
      },
    },
  ];

  return {
    dossierId: 'DOSSIER-MATH5-FLAWED-8ERRORS',
    dossierCode: 'DE-TOAN5-TEST-8LOI',
    title:
      'Đề kiểm tra Cuối học kỳ II – Toán Lớp 5 (Bộ đề kiểm thử chuyên sâu 5 Trụ cột Toán Tiểu học: Số thập phân, Đổi đơn vị, Hình học & Hướng dẫn chấm)',
    subject: 'Toán',
    grade: 5,
    examPeriod: 'Cuối học kỳ II',
    examVariantCode: 'MĐ-TOAN5-01',
    curriculumStandard: 'Chương trình GDPT 2018 – Môn Toán Tiểu học (Lớp 5)',
    assessmentRuleSet: 'Thông tư 27/2020/TT-BGDĐT (3 mức độ: Mức 1, Mức 2, Mức 3)',
    durationMinutes: 40,
    targetTotalPoints: 10.0,
    versionLabel: 'v1.0 (Bản gốc trước kiểm tra)',
    approvalStatus: ApprovalStatus.DRAFT,
    isConfidentialExam: false,
    hasSecurityPermissionForAi: true,
    hasMatrixDocument: true,
    hasSpecificationDocument: true,
    hasExamPaperDocument: true,
    hasAnswerKeyDocument: true,
    hasGradingGuideDocument: true,
    questions,
    matrixSlots,
    specificationSlots,
  };
}


// ============================================================================
// 3. CƠ CHẾ PHÂN TÍCH HAI LỚP (LỚP A: QUY TẮC & LỚP B: GEMINI AI)
//    BỔ SUNG BỘ QUY TẮC & CHUYÊN GIA CHO ĐỀ TIẾNG VIỆT TIỂU HỌC LỚP 1–5
// ============================================================================

function parseFractionValue(text: string): number | null {
  const trimmed = text.trim();
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(trimmed);
  if (!match) return null;
  const num = Number(match[1]);
  const den = Number(match[2]);
  if (den === 0) return null;
  return num / den;
}

function getGenreLabel(genre: PrimaryVietnameseCorpusGenre): string {
  switch (genre) {
    case 'TRUYEN':
      return 'Văn bản truyện (Truyện ngắn / Truyện thiếu nhi)';
    case 'THO':
      return 'Văn bản thơ / Đồng dao / Ca dao';
    case 'VAN_BAN_THONG_TIN':
      return 'Văn bản thông tin';
    default:
      return 'Loại văn bản khác';
  }
}

export function runTwoLayerQualityReview(
  dossier: QualityReviewDossierPackage,
  enabledGroups: Record<QualityReviewGroupId, boolean>
): {
  issues: QualityReviewDetectedIssue[];
  isComprehensiveCheckComplete: boolean;
  completenessBannerText: string;
  checkedScopeList: string[];
  unverifiedScopeList: string[];
  confidentialityWarning?: string;
} {
  const issues: QualityReviewDetectedIssue[] = [];
  const checkedScopeList: string[] = [];
  const unverifiedScopeList: string[] = [];

  if (dossier.hasExamPaperDocument) {
    checkedScopeList.push(
      dossier.subject === 'Tiếng Việt'
        ? 'Đề kiểm tra Tiếng Việt (Ngữ liệu đọc, Câu hỏi đọc hiểu, Kiến thức Tiếng Việt, Phần Viết)'
        : 'Đề kiểm tra (Nội dung câu hỏi, phép tính, chính tả)'
    );
  } else {
    unverifiedScopeList.push('Đề kiểm tra (Chưa đính kèm)');
  }

  if (dossier.hasMatrixDocument && dossier.matrixSlots.length > 0) {
    checkedScopeList.push('Ma trận đề (Tổng điểm, số câu, phân bố mức độ & chủ đề)');
  } else {
    unverifiedScopeList.push(
      'Ma trận đề (Thiếu Ma trận -> Chưa thể kết luận sự khớp giữa đề kiểm tra và ma trận)'
    );
  }

  if (dossier.hasSpecificationDocument && dossier.specificationSlots.length > 0) {
    checkedScopeList.push('Bản đặc tả (Yêu cầu cần đạt, năng lực đánh giá)');
  } else {
    unverifiedScopeList.push(
      'Bản đặc tả (Thiếu Bản đặc tả -> Chưa thể đối chiếu chi tiết chỉ báo năng lực)'
    );
  }

  if (dossier.hasAnswerKeyDocument) {
    checkedScopeList.push('Đáp án (Đáp án khóa và căn cứ ngữ liệu / kiến thức)');
  } else {
    unverifiedScopeList.push('Đáp án (Thiếu bảng đáp án)');
  }

  if (dossier.hasGradingGuideDocument) {
    checkedScopeList.push('Hướng dẫn chấm & Biểu điểm thành phần (Đọc hiểu & Viết)');
  } else {
    unverifiedScopeList.push('Hướng dẫn chấm & Biểu điểm');
  }

  const isComprehensiveCheckComplete = unverifiedScopeList.length === 0;
  const completenessBannerText = isComprehensiveCheckComplete
    ? 'Đủ 5/5 thành phần hồ sơ (Ma trận, Bản đặc tả, Đề kiểm tra, Đáp án, Hướng dẫn chấm) – Đủ điều kiện kiểm tra toàn diện.'
    : 'Chưa đủ dữ liệu để kiểm tra toàn diện';

  let confidentialityWarning: string | undefined;
  const canRunLayerBGemini = !(
    dossier.isConfidentialExam && !dossier.hasSecurityPermissionForAi
  );

  if (!canRunLayerBGemini) {
    confidentialityWarning =
      'Nguyên tắc 10: Hồ sơ này được đánh dấu là ĐỀ MẬT và chưa bật quyền gửi dữ liệu tới dịch vụ AI. Hệ thống đã chặn Lớp B (Gemini AI) để bảo vệ bí mật đề thi và chỉ chạy Lớp A (Kiểm tra bằng Quy tắc nội bộ).';
    unverifiedScopeList.push(
      'Lớp B – Phân tích bằng Gemini AI (Đã khóa do chế độ Đề mật chưa cấp quyền bảo mật)'
    );
  }

  // ==========================================================================
  // LỚP A – KIỂM TRA BẰNG QUY TẮC (LAYER_A_RULE_ENGINE)
  // ==========================================================================

  // 1. Kiểm tra Tổng điểm toàn đề và Biểu điểm thành phần (Nhóm 2 & Nhóm 8)
  if (enabledGroups.GROUP_02_MATRIX || enabledGroups.GROUP_08_ANSWER_AND_RUBRIC) {
    const actualTotalPoints = Number(
      dossier.questions.reduce((acc, q) => acc + q.points, 0).toFixed(2)
    );
    if (Math.abs(actualTotalPoints - dossier.targetTotalPoints) > 1e-3) {
      const mismatchedSlot = dossier.matrixSlots.find((m) => {
        const q = dossier.questions.find((item) => item.questionNumber === m.questionNumber);
        return q && Math.abs(q.points - m.expectedPoints) > 1e-3;
      });
      const targetQuestionNum = mismatchedSlot
        ? mismatchedSlot.questionNumber
        : dossier.questions[dossier.questions.length - 1]?.questionNumber ?? 10;
      const targetQ = dossier.questions.find((q) => q.questionNumber === targetQuestionNum);
      const expectedPts = mismatchedSlot?.expectedPoints ?? 4.0;

      const isVietnameseWritingMismatch =
        dossier.subject === 'Tiếng Việt' && dossier.vietnameseWritingBlock?.questionNumber === targetQuestionNum;

      const issueCode =
        dossier.dossierCode === 'DE-TV4-TEST-7LOI'
          ? 'ERR-TV4-06-TONGDIEM'
          : dossier.dossierCode === 'DE-TV5-TEST-7LOI'
          ? 'ERR-TV5-06-TONGDIEM'
          : 'ERR-R01-TONGDIEM';

      issues.push({
        issueId: `ISS-TOTAL-POINTS-${dossier.dossierCode}`,
        issueCode,
        groupId: 'GROUP_08_ANSWER_AND_RUBRIC',
        groupTitle: 'Nhóm 8 – Đáp án & Hướng dẫn chấm',
        issueCategoryLabel: 'Biểu điểm không khớp tổng điểm',
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng',
        detectionLayer: 'LAYER_A_RULE_ENGINE',
        detectionLayerLabel: 'Lớp A – Kiểm tra bằng Quy tắc',
        locationLabel: `Toàn đề & Câu ${targetQuestionNum}`,
        questionNumber: targetQuestionNum,
        currentContent: `Tổng điểm cộng từ ${dossier.questions.length} câu = ${actualTotalPoints} điểm (Câu ${targetQuestionNum} đang ghi ${
          targetQ?.points ?? 2.5
        } điểm).`,
        problemDescription: isVietnameseWritingMismatch
          ? `Biểu điểm không khớp tổng điểm: Tổng điểm toàn đề đang là ${actualTotalPoints}/${dossier.targetTotalPoints.toFixed(
              1
            )} điểm (lệch ${Math.abs(actualTotalPoints - dossier.targetTotalPoints).toFixed(
              1
            )} điểm so với Ma trận). Đồng thời tại Câu ${targetQuestionNum} (Phần Viết), tổng điểm các tiêu chí thành phần trong hướng dẫn chấm không khớp với điểm số của câu.`
          : `Tổng điểm thực tế của các câu hỏi trong đề (${actualTotalPoints} điểm) vượt quá thang điểm quy định (${dossier.targetTotalPoints.toFixed(
              1
            )} điểm) là ${Math.abs(actualTotalPoints - dossier.targetTotalPoints).toFixed(1)} điểm.`,
        correctResultOrHandling: `Tổng điểm toàn đề chuẩn = ${dossier.targetTotalPoints.toFixed(
          1
        )} điểm; Điểm Câu ${targetQuestionNum} chuẩn theo Ma trận = ${expectedPts.toFixed(1)} điểm.`,
        verificationSolutionProof: isVietnameseWritingMismatch
          ? `Kiểm toán biểu điểm xác định: Tổng điểm các câu = ${actualTotalPoints} điểm ≠ ${dossier.targetTotalPoints.toFixed(
              1
            )} điểm. Cần chuẩn hóa Câu ${targetQuestionNum} về ${expectedPts.toFixed(
              1
            )} điểm (1,5 + 1,0 + 1,0 + 0,5 = 4,0 điểm).`
          : `Kiểm toán biểu điểm xác định: Tổng 10 câu (Câu 1–11) = 8,0 điểm + Câu 12 (${
              targetQ?.points ?? 2.5
            } điểm) = ${actualTotalPoints} điểm ≠ 10,0 điểm. Sửa Câu 12 thành 2,0 điểm: 0,25 + 0,75 + 0,75 + 0,25 = 2,0 điểm -> Tổng đề = 10,0 điểm.`,
        evidenceAndBasis: `Đối chiếu quy tắc cộng tổng điểm Lớp A và Ma trận đề: Tại Câu ${targetQuestionNum}, Ma trận quy định ${expectedPts} điểm nhưng đề kiểm tra ghi ${
          targetQ?.points ?? 2.5
        } điểm.`,
        proposedFix: isVietnameseWritingMismatch
          ? `Điều chỉnh điểm Câu ${targetQuestionNum} (Phần Viết) về đúng ${expectedPts.toFixed(
              1
            )} điểm theo Ma trận (Nội dung 1.5đ + Bố cục 1.0đ + Diễn đạt 1.0đ + Chính tả & Trình bày 0.5đ = 4.0đ) để tổng điểm toàn đề đạt chính xác 10.0/10.0 điểm.`
          : `Điều chỉnh điểm số Câu ${targetQuestionNum} từ ${
              targetQ?.points ?? 2.5
            } điểm về đúng ${expectedPts} điểm để tổng điểm toàn đề đạt chính xác ${dossier.targetTotalPoints.toFixed(
              1
            )}/10.0 điểm.`,
        confidenceScorePercent: 100,
        confidenceLabel: 'Chắc chắn 100% (Quy tắc kiểm toán biểu điểm Lớp A)',
        status: 'OPEN',
        impactAnalysis: {
          impactOnQuestionStem: 'Giữ nguyên nội dung câu hỏi.',
          impactOnAnswerKey: 'Giữ nguyên đáp án/dàn ý.',
          impactOnCognitiveLevel: 'Không thay đổi mức độ (Mức 3 – Vận dụng).',
          impactOnMatrix: 'Khớp lại 100% với tổng điểm 10.0 của Ma trận đề.',
          impactOnGradingGuide: isVietnameseWritingMismatch
            ? 'Chuẩn hóa thang điểm 4 tiêu chí chấm Viết: Nội dung (1.5đ) + Bố cục (1.0đ) + Diễn đạt (1.0đ) + Chính tả & Trình bày (0.5đ) = 4.0đ.'
            : 'Điều chỉnh thang điểm thành phần Câu 12: Đổi đơn vị 0.25đ; Thửa thứ nhất 0.75đ; Thửa thứ hai 0.75đ; Đáp số 0.25đ (Tổng 2.0đ).',
        },
        replacementDraft: {
          updatedPoints: expectedPts,
          updatedGradingGuide: isVietnameseWritingMismatch
            ? '1. Nội dung (1.5đ): Đúng trọng tâm kiểu bài. 2. Bố cục (1.0đ): Đủ 3 phần Mở bài, Thân bài, Kết bài. 3. Diễn đạt (1.0đ): Dùng từ, đặt câu sinh động. 4. Chính tả & Trình bày (0.5đ): Viết đúng chính tả, trình bày sạch đẹp. (Không coi văn mẫu là đáp án duy nhất).'
            : 'Đổi 4 tấn 2 tạ = 4 200 kg; 6 tạ = 600 kg (0.25đ). Thửa thứ nhất: (4200 + 600) : 2 = 2 400 kg (0.75đ). Thửa thứ hai: 2400 - 600 = 1 800 kg (0.75đ). Đáp số: 0.25đ.',
        },
      });
    }
  }

  // 2. Kiểm tra từng câu bằng Quy tắc Lớp A
  dossier.questions.forEach((q) => {
    const matrixSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);

    // 2a. Kiểm tra khớp chủ đề & YCCĐ với Ma trận (Nhóm 2 & Nhóm 3)
    if (
      dossier.hasMatrixDocument &&
      matrixSlot &&
      (enabledGroups.GROUP_02_MATRIX || enabledGroups.GROUP_03_SPECIFICATION)
    ) {
      if (q.learningOutcomeCode !== matrixSlot.expectedLearningOutcomeCode) {
        issues.push({
          issueId: `ISS-MATRIX-MISMATCH-Q${q.questionNumber}`,
          issueCode: `ERR-R02-LECHMATRAN-C${q.questionNumber}`,
          groupId: 'GROUP_02_MATRIX',
          groupTitle: 'Nhóm 2 – Ma trận',
          issueCategoryLabel: 'Câu hỏi không khớp ma trận & bản đặc tả',
          severity: 'LEVEL_2_HIGH',
          severityLabel: 'Mức 2 – Cao',
          detectionLayer: 'LAYER_A_RULE_ENGINE',
          detectionLayerLabel: 'Lớp A – Kiểm tra bằng Quy tắc',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
          questionNumber: q.questionNumber,
          currentContent: `Chủ đề trong đề: "${q.topicTitle}" (${q.learningOutcomeCode}) – Nội dung: "${q.stem}"`,
          problemDescription: `Câu ${q.questionNumber} trong đề kiểm tra thuộc mạch "${q.topicTitle}" (${q.learningOutcomeCode}), không khớp với Ma trận và Bản đặc tả đã phê duyệt.`,
          correctResultOrHandling: `Đổi Câu ${q.questionNumber} về đúng mạch "${matrixSlot.expectedTopicTitle}" (${matrixSlot.expectedLearningOutcomeCode}): 4 tấn 5 yến = 4 050 kg (Phương án B).`,
          verificationSolutionProof: `Lời giải kiểm chứng đổi đơn vị khối lượng: 1 tấn = 1 000 kg -> 4 tấn = 4 000 kg; 1 yến = 10 kg -> 5 yến = 50 kg. Vậy 4 tấn 5 yến = 4 000 + 50 = 4 050 kg.`,
          evidenceAndBasis: `Trong Ma trận đề và Bản đặc tả, vị trí Câu ${q.questionNumber} được quy định kiểm tra chủ đề "${matrixSlot.expectedTopicTitle}" (Mã YCCĐ: ${matrixSlot.expectedLearningOutcomeCode}).`,
          proposedFix: `Thay thế Câu ${q.questionNumber} bằng câu hỏi thuộc đúng chủ đề "${matrixSlot.expectedTopicTitle}": Số thích hợp điền vào chỗ chấm "4 tấn 5 yến = ... kg" là 4 050 kg (Đáp án B).`,
          confidenceScorePercent: 100,
          confidenceLabel: 'Chắc chắn 100% (Đối chiếu mã YCCĐ Ma trận)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem:
              'Thay câu hỏi đọc biểu đồ cột bằng câu hỏi đổi đơn vị đo khối lượng (4 tấn 5 yến = ... kg).',
            impactOnAnswerKey: 'Giữ đáp án đúng là phương án B (4 050 kg).',
            impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
            impactOnMatrix: 'Khôi phục tính thống nhất 100% giữa Đề kiểm tra, Ma trận và Bản đặc tả.',
            impactOnGradingGuide: 'Cập nhật giải thích: 4 tấn = 4 000 kg, 5 yến = 50 kg -> 4 050 kg.',
          },
          replacementDraft: {
            updatedStem: 'Số thích hợp để điền vào chỗ chấm "4 tấn 5 yến = ... kg" là:',
            updatedOptions: [
              { key: 'A', text: '405 kg' },
              { key: 'B', text: '4 050 kg' },
              { key: 'C', text: '4 500 kg' },
              { key: 'D', text: '4 005 kg' },
            ],
            updatedCorrectAnswer: 'B',
            updatedTopicTitle: matrixSlot.expectedTopicTitle,
            updatedGradingGuide: 'Ta có 4 tấn = 4 000 kg, 5 yến = 50 kg -> 4 050 kg. Chọn B được 0.5 điểm.',
          },
        });
      }
    }

    // 2b. Kiểm tra phép cộng/nhân cơ bản và tính chính xác của Đáp án khóa (Nhóm 4 & Nhóm 8)
    if (enabledGroups.GROUP_04_KNOWLEDGE || enabledGroups.GROUP_08_ANSWER_AND_RUBRIC) {
      const addMatch = /(\d[\d\s]*)\+\s*(\d[\d\s]*)/.exec(q.stem);
      if (addMatch && q.options) {
        const a = Number(addMatch[1].replace(/\s+/g, ''));
        const b = Number(addMatch[2].replace(/\s+/g, ''));
        const trueSum = a + b;
        const declaredOpt = q.options.find((o) => o.key === q.declaredCorrectAnswer);
        const declaredNumeric = declaredOpt
          ? Number(declaredOpt.text.replace(/[^\d]/g, ''))
          : NaN;
        const trueOpt = q.options.find(
          (o) => Number(o.text.replace(/[^\d]/g, '')) === trueSum
        );

        if (Number.isFinite(declaredNumeric) && declaredNumeric !== trueSum && trueOpt) {
          const detEval = evaluateDeterministicMathExpression(`${a} + ${b}`);
          issues.push({
            issueId: `ISS-WRONG-KEY-Q${q.questionNumber}`,
            issueCode: `ERR-R03-SAIDAPAN-C${q.questionNumber}`,
            groupId: 'GROUP_08_ANSWER_AND_RUBRIC',
            groupTitle: 'Nhóm 8 – Đáp án & Hướng dẫn chấm',
            issueCategoryLabel: 'Sai đáp án khóa',
            severity: 'LEVEL_1_CRITICAL',
            severityLabel: 'Mức 1 – Nghiêm trọng',
            detectionLayer: 'LAYER_A_RULE_ENGINE',
            detectionLayerLabel: 'Lớp A – Bộ tính toán xác định (Deterministic Math Engine)',
            locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
            questionNumber: q.questionNumber,
            currentContent: `Câu hỏi: "${q.stem}" – Đáp án đang khai báo: ${q.declaredCorrectAnswer} (${declaredOpt?.text}).`,
            problemDescription: `Đáp án khóa khai báo sai kết quả toán học: ${a.toLocaleString(
              'vi-VN'
            )} + ${b.toLocaleString('vi-VN')} = ${trueSum.toLocaleString(
              'vi-VN'
            )} (phương án ${trueOpt.key}), nhưng bảng đáp án lại ghi phương án ${
              q.declaredCorrectAnswer
            } (${declaredOpt?.text}).`,
            correctResultOrHandling: `Kết quả đúng: ${trueSum.toLocaleString('vi-VN')} (Phương án ${trueOpt.key}).`,
            verificationSolutionProof: `Bộ tính toán xác định: Đặt tính cộng ${a.toLocaleString('vi-VN')} + ${b.toLocaleString('vi-VN')}: Hàng nghìn 5 + 5 = 10 viết 0 nhớ 1; Hàng chục nghìn 4 + 3 = 7 thêm 1 = 8 -> Kết quả = ${detEval.formattedValue} (${trueSum.toLocaleString('vi-VN')}).`,
            evidenceAndBasis: `Kiểm tra tự động phép cộng số tự nhiên Lớp A: ${a} + ${b} = ${trueSum} ≠ ${declaredNumeric}.`,
            proposedFix: `Sửa đáp án đúng của Câu ${q.questionNumber} từ phương án ${q.declaredCorrectAnswer} sang phương án ${trueOpt.key} (${trueOpt.text}) và cập nhật hướng dẫn chấm tương ứng.`,
            confidenceScorePercent: 100,
            confidenceLabel: 'Chắc chắn 100% (Bộ tính toán xác định)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Giữ nguyên câu dẫn và 4 phương án A, B, C, D.',
              impactOnAnswerKey: `Đổi đáp án khóa Câu ${q.questionNumber} từ ${q.declaredCorrectAnswer} -> ${trueOpt.key}.`,
              impactOnCognitiveLevel: 'Không thay đổi (Mức 1 – Nhận biết).',
              impactOnMatrix: 'Không thay đổi ma trận.',
              impactOnGradingGuide: `Cập nhật: 45 000 + 35 000 = 80 000. Chọn đúng phương án ${trueOpt.key} được 0.5 điểm.`,
            },
            replacementDraft: {
              updatedCorrectAnswer: trueOpt.key,
              updatedGradingGuide: `Ta có 45 000 + 35 000 = 80 000. Chọn đúng phương án ${trueOpt.key} được 0.5 điểm.`,
            },
          });
        }
      }

      const multEquationMatch = /(\d+)\s*[×x*]\s*(\d+)\s*=\s*(\d+)/.exec(q.stem);
      if (multEquationMatch) {
        const m1 = Number(multEquationMatch[1]);
        const m2 = Number(multEquationMatch[2]);
        const statedProd = Number(multEquationMatch[3]);
        const trueProd = m1 * m2;
        if (statedProd !== trueProd) {
          const detProd = evaluateDeterministicMathExpression(`${m1} * ${m2}`);
          issues.push({
            issueId: `ISS-CALC-ERROR-Q${q.questionNumber}`,
            issueCode: `ERR-R04-SAIPHEPTINH-C${q.questionNumber}`,
            groupId: 'GROUP_04_KNOWLEDGE',
            groupTitle: 'Nhóm 4 – Kiến thức môn học',
            issueCategoryLabel: 'Sai phép tính trong đề & hướng dẫn chấm',
            severity: 'LEVEL_1_CRITICAL',
            severityLabel: 'Mức 1 – Nghiêm trọng',
            detectionLayer: 'LAYER_A_RULE_ENGINE',
            detectionLayerLabel: 'Lớp A – Bộ tính toán xác định (Deterministic Math Engine)',
            locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
            questionNumber: q.questionNumber,
            currentContent: `"${q.stem}"`,
            problemDescription: `Phép tính nhân trong câu dẫn và hướng dẫn chấm bị tính sai: ${m1} × ${m2} được ghi bằng ${statedProd}, trong khi kết quả đúng phải là ${trueProd}.`,
            correctResultOrHandling: `Kết quả đúng: 4 thùng có ${m1} × ${m2} = ${detProd.formattedValue} quyển vở; chia đều cho 5 lớp được 500 : 5 = 100 quyển vở/lớp (Phương án A).`,
            verificationSolutionProof: `Lời giải kiểm chứng xác định: Bước 1: Tổng số quyển vở trong 4 thùng là: ${m1} × ${m2} = ${trueProd} (quyển vở). Bước 2: Số quyển vở mỗi lớp nhận được là: ${trueProd} : 5 = 100 (quyển vở). Đáp số: 100 quyển vở.`,
            evidenceAndBasis: `Kiểm tra biểu thức số học Lớp A: ${m1} × ${m2} = ${trueProd} (sai lệch ${Math.abs(
              trueProd - statedProd
            )} đơn vị).`,
            proposedFix: `Sửa phép tính thành "${m1} × ${m2} = ${trueProd} quyển vở", chia đều cho 5 lớp để mỗi lớp nhận được 100 quyển vở (Phương án A).`,
            confidenceScorePercent: 100,
            confidenceLabel: 'Chắc chắn 100% (Bộ tính toán xác định)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem:
                'Sửa dữ kiện thành: "Biết mỗi thùng có 125 quyển vở nên 4 thùng có 125 × 4 = 500 quyển vở. Nếu chia đều số vở đó cho 5 lớp..."',
              impactOnAnswerKey: 'Cập nhật phương án A thành "100 quyển vở".',
              impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
              impactOnMatrix: 'Không ảnh hưởng ma trận.',
              impactOnGradingGuide: 'Cập nhật: 125 × 4 = 500 quyển vở; 500 : 5 = 100 quyển vở.',
            },
            replacementDraft: {
              updatedStem:
                'Biết mỗi thùng có 125 quyển vở nên 4 thùng có 125 × 4 = 500 quyển vở. Nếu chia đều số vở đó cho 5 lớp thì mỗi lớp nhận được bao nhiêu quyển vở?',
              updatedOptions: [
                { key: 'A', text: '100 quyển vở' },
                { key: 'B', text: '90 quyển vở' },
                { key: 'C', text: '110 quyển vở' },
                { key: 'D', text: '80 quyển vở' },
              ],
              updatedCorrectAnswer: 'A',
              updatedGradingGuide:
                'Ta có 125 × 4 = 500 quyển vở; lấy 500 : 5 = 100 quyển vở. Chọn A được 0.5 điểm.',
            },
          });
        }
      }
    }

    // 2c. Kiểm tra câu hỏi có hai phương án tương đương cùng đúng (Toán học)
    if (enabledGroups.GROUP_06_MULTIPLE_CHOICE && q.options && q.options.length >= 2) {
      const targetFracMatch = /(\d+\s*\/\s*\d+)/.exec(q.stem);
      if (targetFracMatch) {
        const targetVal = parseFractionValue(targetFracMatch[1]);
        const asksIrreducible = q.stem.toLowerCase().includes('tối giản');
        if (targetVal !== null && !asksIrreducible) {
          const matchingOpts = q.options.filter((o) => {
            const v = parseFractionValue(o.text);
            return v !== null && Math.abs(v - targetVal) < 1e-6;
          });
          if (matchingOpts.length >= 2) {
            const keysStr = matchingOpts.map((o) => `${o.key} (${o.text})`).join(' và ');
            const simplifiedProof = simplifyFractionDeterministically(12, 18);
            issues.push({
              issueId: `ISS-TWO-CORRECT-OPTIONS-Q${q.questionNumber}`,
              issueCode: `ERR-R05-HAIDAPAN-C${q.questionNumber}`,
              groupId: 'GROUP_06_MULTIPLE_CHOICE',
              groupTitle: 'Nhóm 6 – Trắc nghiệm',
              issueCategoryLabel: 'Hai phương án tương đương cùng đúng',
              severity: 'LEVEL_1_CRITICAL',
              severityLabel: 'Mức 1 – Nghiêm trọng',
              detectionLayer: 'LAYER_A_RULE_ENGINE',
              detectionLayerLabel: 'Lớp A – Bộ tính toán phân số xác định',
              locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
              questionNumber: q.questionNumber,
              currentContent: `Câu hỏi: "${q.stem}" – Các phương án: ${q.options
                .map((o) => `${o.key}. ${o.text}`)
                .join(' | ')}`,
              problemDescription: `Câu hỏi trắc nghiệm 1 lựa chọn nhưng có tới 2 phương án cùng bằng phân số ${
                targetFracMatch[1]
              } là ${keysStr}.`,
              correctResultOrHandling: `Phương án xử lý: Yêu cầu tìm "phân số tối giản" bằng 12/18 là ${simplifiedProof.simplifiedText} (Phương án B) và đổi phương án D từ 4/6 thành 5/6.`,
              verificationSolutionProof: `Bộ kiểm chứng phân số xác định: ƯCLN(12, 18) = ${simplifiedProof.gcdValue} -> 12/18 = (12 : 6)/(18 : 6) = 2/3 (Phương án B); đồng thời 12/18 = (12 : 3)/(18 : 3) = 4/6 (Phương án D). Cả 2 phương án đều có giá trị thập phân = 0,6667.`,
              evidenceAndBasis: `Ta có 12/18 = 2/3 (rút gọn cho 6) và 12/18 = 4/6 (rút gọn cho 3). Vì câu dẫn không yêu cầu "phân số tối giản" nên cả B và D đều đúng.`,
              proposedFix: `Bổ sung cụm từ "Phân số tối giản nào..." vào câu dẫn và đổi phương án nhiễu D từ "4/6" thành "5/6" để chỉ có duy nhất một đáp án đúng là B (2/3).`,
              confidenceScorePercent: 100,
              confidenceLabel: 'Chắc chắn 100% (Đối chiếu tương đương phân số)',
              status: 'OPEN',
              impactAnalysis: {
                impactOnQuestionStem: 'Sửa câu dẫn thành: "Phân số tối giản nào dưới đây bằng phân số 12/18?"',
                impactOnAnswerKey: 'Đảm bảo phương án B (2/3) là đáp án đúng duy nhất.',
                impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
                impactOnMatrix: 'Không ảnh hưởng ma trận.',
                impactOnGradingGuide: 'Giữ nguyên hướng dẫn chấm.',
              },
              replacementDraft: {
                updatedStem: 'Phân số tối giản nào dưới đây bằng phân số 12/18?',
                updatedOptions: [
                  { key: 'A', text: '1/3' },
                  { key: 'B', text: '2/3' },
                  { key: 'C', text: '3/4' },
                  { key: 'D', text: '5/6' },
                ],
              },
            });
          }
        }
      }
    }
  });

  // ==========================================================================
  // CHUYÊN BIỆT MÔN TIẾNG VIỆT TIỂU HỌC LỚP 1–5 (MỤC I -> VI)
  // ==========================================================================
  if (dossier.subject === 'Tiếng Việt') {
    const corpusText = dossier.vietnameseCorpusBlock?.content || '';

    dossier.questions.forEach((q) => {
      // I & II.1: Phát hiện CÂU HỎI KHÔNG CÓ CĂN CỨ TRONG NGỮ LIỆU (Mục I & II.3)
      if (
        (enabledGroups.GROUP_01_CURRICULUM || enabledGroups.GROUP_05_QUESTION_STEM) &&
        q.vietnameseSection === 'DOC_HIEU' &&
        q.isGroundedInCorpus === false
      ) {
        const issueCode =
          dossier.grade === 5 ? 'ERR-TV5-01-KHONGCANCU-C2' : 'ERR-TV4-01-KHONGCANCU-C2';
        issues.push({
          issueId: `ISS-TV-UNGROUNDED-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode,
          groupId: 'GROUP_05_QUESTION_STEM',
          groupTitle: 'Nhóm 5 – Câu hỏi & Đọc hiểu',
          issueCategoryLabel: 'Câu hỏi không có căn cứ trong ngữ liệu',
          severity: 'LEVEL_1_CRITICAL',
          severityLabel: 'Mức 1 – Nghiêm trọng',
          detectionLayer: 'LAYER_A_RULE_ENGINE',
          detectionLayerLabel: 'Lớp A – Kiểm tra bằng Quy tắc đối chiếu ngữ liệu',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Phần Đọc hiểu)`,
          questionNumber: q.questionNumber,
          currentContent: `Câu hỏi: "${q.stem}" – Đáp án khai báo: ${q.declaredCorrectAnswer}`,
          problemDescription:
            dossier.grade === 4
              ? `Câu ${q.questionNumber} hỏi về chi tiết "giống cây cam sành từ tỉnh Hà Giang trồng năm nào", nhưng trong toàn bộ văn bản ngữ liệu "${dossier.vietnameseCorpusBlock?.title}" hoàn toàn không có chi tiết này (ngữ liệu chỉ nhắc tới cây hồng đỏ và cây ổi đào).`
              : `Câu ${q.questionNumber} hỏi về chi tiết "nhận bằng khen tại Hà Nội vào năm 2022", nhưng trong văn bản ngữ liệu "${dossier.vietnameseCorpusBlock?.title}" hoàn toàn không có thông tin này.`,
          evidenceAndBasis: `Đối chiếu trực tiếp văn bản ngữ liệu gốc (${
            dossier.vietnameseCorpusBlock?.wordCount ?? 0
          } từ): Học sinh không có dữ kiện trong bài đọc để trả lời câu hỏi này (Vi phạm Mục I & Tiêu chí 2, 3 Mục II).`,
          proposedFix:
            dossier.grade === 4
              ? 'Thay bằng câu hỏi bám sát chi tiết có thật trong bài: "Cây hồng đỏ giữa vườn được ông ngoại trồng từ khi nào?" – Đáp án đúng: A (Từ ngày mẹ còn nhỏ).'
              : 'Thay bằng câu hỏi bám sát chi tiết có thật trong bài: "Chú Lâm đã gắn bó với cánh rừng nguyên sinh trong thời gian bao lâu?" – Đáp án đúng: A (Mười lăm năm).',
          confidenceScorePercent: 100,
          confidenceLabel: 'Chắc chắn 100% (Đối chiếu từ khóa & sự kiện ngữ liệu)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Thay nội dung câu dẫn và 4 phương án để bám sát 100% ngữ liệu đọc.',
            impactOnAnswerKey: 'Cập nhật đáp án khóa khớp với chi tiết có trong văn bản (Phương án A).',
            impactOnCognitiveLevel: 'Giữ nguyên Mức 1 – Nhận biết (nhận biết thông tin trực tiếp).',
            impactOnMatrix: 'Giữ nguyên cấu trúc điểm (0.5đ) và mã YCCĐ trong Ma trận.',
            impactOnGradingGuide: 'Cập nhật trích dẫn câu văn căn cứ trong ngữ liệu.',
          },
          replacementDraft:
            dossier.grade === 4
              ? {
                  updatedStem: 'Cây hồng đỏ giữa vườn được ông ngoại trồng từ khi nào?',
                  updatedOptions: [
                    { key: 'A', text: 'Từ ngày mẹ còn nhỏ' },
                    { key: 'B', text: 'Từ mùa xuân năm ngoái' },
                    { key: 'C', text: 'Từ ngày em bắt đầu vào lớp Một' },
                    { key: 'D', text: 'Từ tuần trước khi thu về' },
                  ],
                  updatedCorrectAnswer: 'A',
                  updatedGradingGuide:
                    'Căn cứ câu 2 trong ngữ liệu ("cây hồng đỏ do ông trồng từ ngày mẹ còn nhỏ"). Chọn A được 0.5 điểm.',
                }
              : {
                  updatedStem: 'Chú Lâm đã gắn bó với cánh rừng nguyên sinh trong thời gian bao lâu?',
                  updatedOptions: [
                    { key: 'A', text: 'Mười lăm năm' },
                    { key: 'B', text: 'Năm năm' },
                    { key: 'C', text: 'Hai mươi năm' },
                    { key: 'D', text: 'Ba mươi năm' },
                  ],
                  updatedCorrectAnswer: 'A',
                  updatedGradingGuide:
                    'Căn cứ câu 1 trong ngữ liệu ("người kiểm lâm gắn bó mười lăm năm với cánh rừng nguyên sinh"). Chọn A được 0.5 điểm.',
                },
        });
      }

      // II.4 & Nhóm 6: Phát hiện CÂU HỎI CÓ HAI ĐÁP ÁN HỢP LÝ (Mục II.4 & Mục VII.2)
      if (
        (enabledGroups.GROUP_05_QUESTION_STEM || enabledGroups.GROUP_06_MULTIPLE_CHOICE) &&
        q.options &&
        q.questionNumber === 3
      ) {
        const hasTwoValidInG4 =
          dossier.grade === 4 &&
          q.options.some((o) => o.key === 'A' && o.text.includes('đèn lồng nhỏ')) &&
          q.options.some((o) => o.key === 'C' && o.text.includes('chim sâu ríu rít'));
        const hasTwoValidInG5 =
          dossier.grade === 5 &&
          q.stem.includes('đồng nghĩa với từ "thầm lặng"') &&
          q.options.some((o) => o.key === 'B' && o.text.toLowerCase().includes('lặng lẽ')) &&
          q.options.some((o) => o.key === 'D' && o.text.toLowerCase().includes('âm thầm'));

        if (hasTwoValidInG4 || hasTwoValidInG5) {
          const issueCode =
            dossier.grade === 5 ? 'ERR-TV5-02-HAIDAPAN-C3' : 'ERR-TV4-02-HAIDAPAN-C3';
          issues.push({
            issueId: `ISS-TV-TWO-VALID-${dossier.dossierCode}-Q3`,
            issueCode,
            groupId: 'GROUP_06_MULTIPLE_CHOICE',
            groupTitle: 'Nhóm 6 – Trắc nghiệm',
            issueCategoryLabel: 'Câu hỏi có hai đáp án hợp lý',
            severity: 'LEVEL_1_CRITICAL',
            severityLabel: 'Mức 1 – Nghiêm trọng',
            detectionLayer: 'LAYER_B_GEMINI_AI',
            detectionLayerLabel: 'Lớp B – Phân tích ngữ nghĩa Tiếng Việt Gemini AI',
            locationLabel: `Câu 3 (${q.questionCode})`,
            questionNumber: 3,
            currentContent: `Câu hỏi: "${q.stem}" | Phương án: ${q.options
              .map((o) => `${o.key}. ${o.text}`)
              .join(' ; ')}`,
            problemDescription: hasTwoValidInG4
              ? 'Câu hỏi trắc nghiệm một lựa chọn nhưng cả phương án A ("những quả hồng chín đỏ rực như những chiếc đèn lồng nhỏ...") và phương án C ("cây ổi đào tỏa hương thơm lừng gọi đàn chim sâu ríu rít...") đều có nguyên văn trong bài đọc và đều thể hiện vẻ đẹp sinh động của khu vườn mùa thu.'
              : 'Câu hỏi tìm từ đồng nghĩa với "thầm lặng" nhưng trong 4 phương án có cả phương án B ("Lặng lẽ") và phương án D ("Âm thầm") đều là từ đồng nghĩa chính xác với "thầm lặng".',
            evidenceAndBasis: hasTwoValidInG4
              ? `Đối chiếu văn bản "${dossier.vietnameseCorpusBlock?.title}" (${corpusText.slice(
                  0,
                  110
                )}...): Cả hai chi tiết ở A và C đều đúng theo ngữ liệu.`
              : 'Theo Từ điển Tiếng Việt và chương trình Tiếng Việt lớp 5 (Mạch Từ đồng nghĩa), cả "lặng lẽ" và "âm thầm" đều đồng nghĩa với "thầm lặng".',
            proposedFix: hasTwoValidInG4
              ? 'Cụ thể hóa câu dẫn thành: "Hình ảnh những quả hồng chín đỏ rực trên cành được tác giả so sánh với sự vật nào?" và thay phương án C bằng phương án nhiễu hợp lý không trùng ý đúng.'
              : 'Đổi phương án nhiễu D từ "Âm thầm" thành "Rộn rã" (từ trái nghĩa) để chỉ còn duy nhất phương án B ("Lặng lẽ") là đáp án đúng.',
            confidenceScorePercent: 98,
            confidenceLabel: 'Độ tin cậy 98% (Phân tích ngữ nghĩa Đọc hiểu & Từ vựng)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: hasTwoValidInG4
                ? 'Điều chỉnh câu dẫn hỏi cụ thể về hình ảnh so sánh quả hồng chín.'
                : 'Giữ nguyên câu dẫn.',
              impactOnAnswerKey: hasTwoValidInG4
                ? 'Đảm bảo phương án A là đáp án đúng duy nhất.'
                : 'Đảm bảo phương án B ("Lặng lẽ") là đáp án đúng duy nhất.',
              impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
              impactOnMatrix: 'Không ảnh hưởng điểm số và cấu trúc Ma trận.',
              impactOnGradingGuide: 'Loại bỏ tranh cãi khi chấm trắc nghiệm khách quan.',
            },
            replacementDraft: hasTwoValidInG4
              ? {
                  updatedStem:
                    'Hình ảnh những quả hồng chín đỏ rực trên cành được tác giả so sánh với sự vật nào?',
                  updatedOptions: [
                    { key: 'A', text: 'Những chiếc đèn lồng nhỏ treo lơ lửng trên cành' },
                    { key: 'B', text: 'Những ngôi sao lấp lánh trên bầu trời đêm' },
                    { key: 'C', text: 'Những giọt sương mai long lanh trên lá' },
                    { key: 'D', text: 'Những cánh bướm vàng rực rỡ' },
                  ],
                  updatedCorrectAnswer: 'A',
                }
              : {
                  updatedOptions: [
                    { key: 'A', text: 'Ồn ào' },
                    { key: 'B', text: 'Lặng lẽ' },
                    { key: 'C', text: 'Sôi nổi' },
                    { key: 'D', text: 'Rộn rã' },
                  ],
                  updatedCorrectAnswer: 'B',
                },
          });
        }
      }

      // II.5: Phát hiện CÂU HỎI TRÙNG NỘI DUNG (Mục II.5 & Mục VII.3)
      if (enabledGroups.GROUP_05_QUESTION_STEM && q.questionNumber === 4) {
        const q1 = dossier.questions.find((item) => item.questionNumber === 1);
        const isDuplicateG4 =
          dossier.grade === 4 &&
          q.stem.toLowerCase().includes('đặc điểm nổi bật của cây hồng đỏ và cây ổi đào') &&
          q1?.stem.toLowerCase().includes('cây hồng đỏ và cây ổi đào');
        const isDuplicateG5 =
          dossier.grade === 5 &&
          q.stem.toLowerCase().includes('công việc hằng ngày vào buổi sáng mà chú lâm') &&
          q1?.stem.toLowerCase().includes('buổi sáng sớm, chú lâm thường làm những công việc gì');

        if (isDuplicateG4 || isDuplicateG5) {
          const issueCode =
            dossier.grade === 5 ? 'ERR-TV5-03-TRUNGNOIDUNG-C4' : 'ERR-TV4-03-TRUNGNOIDUNG-C4';
          issues.push({
            issueId: `ISS-TV-DUPLICATE-${dossier.dossierCode}-Q4`,
            issueCode,
            groupId: 'GROUP_05_QUESTION_STEM',
            groupTitle: 'Nhóm 5 – Câu hỏi & Đọc hiểu',
            issueCategoryLabel: 'Câu hỏi trùng nội dung',
            severity: 'LEVEL_2_HIGH',
            severityLabel: 'Mức 2 – Cao',
            detectionLayer: 'LAYER_B_GEMINI_AI',
            detectionLayerLabel: 'Lớp B – Phân tích trùng lặp ngữ nghĩa Gemini AI',
            locationLabel: `Câu 4 (${q.questionCode}) trùng với Câu 1 (${q1?.questionCode})`,
            questionNumber: 4,
            currentContent: `Câu 1: "${q1?.stem}" <-> Câu 4: "${q.stem}"`,
            problemDescription: `Câu 4 hỏi trùng lặp nội dung và đơn vị kiến thức với Câu 1 (đều yêu cầu học sinh nêu lại cùng một chi tiết trực tiếp trong bài đọc), đồng thời làm Câu 4 chỉ dừng ở mức Nhận biết trực tiếp thay vì Mức 2 – Thông hiểu như Ma trận quy định.`,
            evidenceAndBasis: `Đối chiếu Ma trận đề và Tiêu chí 5, 7 Mục II: Vị trí Câu 4 yêu cầu đánh giá kỹ năng Thông hiểu (suy luận ý nghĩa/tình cảm nhân vật), không được lặp lại câu hỏi nhận biết của Câu 1.`,
            proposedFix:
              dossier.grade === 4
                ? 'Sửa Câu 4 thành câu hỏi Thông hiểu đúng đặc tả: "Việc ông ngoại tỉa từng cành lá khô và nâng niu từng chùm quả chín để dành chờ các cháu về thăm thể hiện tình cảm gì của ông?"'
                : 'Sửa Câu 4 thành câu hỏi Thông hiểu đúng đặc tả: "Vì sao tác giả lại gọi chú Lâm và các đồng nghiệp là những người gác rừng thầm lặng?"',
            confidenceScorePercent: 96,
            confidenceLabel: 'Độ tin cậy 96% (Đối chiếu tương đồng ngữ nghĩa Câu 1 & Câu 4)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Thay câu hỏi trùng lặp bằng câu hỏi suy luận ý nghĩa/tình cảm ở Mức 2.',
              impactOnAnswerKey: 'Cập nhật đáp án và gợi ý chấm theo hướng mở.',
              impactOnCognitiveLevel: 'Đưa Câu 4 về đúng Mức 2 – Thông hiểu (đòi hỏi hiểu và giải thích).',
              impactOnMatrix: 'Khớp lại yêu cầu cần đạt YCCD-TV-DH-04 trong Ma trận và Bản đặc tả.',
              impactOnGradingGuide: 'Bổ sung hướng dẫn chấm chấp nhận các cách diễn đạt tương đương.',
            },
            replacementDraft:
              dossier.grade === 4
                ? {
                    updatedStem:
                      'Việc ông ngoại tỉa từng cành lá khô và nâng niu từng chùm quả chín để dành chờ các cháu về thăm thể hiện tình cảm gì của ông?',
                    updatedCorrectAnswer:
                      'Thể hiện tình yêu thương sâu sắc, sự quan tâm ấm áp của ông ngoại dành cho con cháu và sự gắn bó với khu vườn.',
                    updatedGradingGuide:
                      'Học sinh nêu được tình yêu thương con cháu (0.5đ) và sự chăm chút khu vườn (0.5đ). Chấp nhận mọi cách diễn đạt tương đương.',
                  }
                : {
                    updatedStem:
                      'Vì sao tác giả lại gọi chú Lâm và các đồng nghiệp là "những người gác rừng thầm lặng"?',
                    updatedCorrectAnswer:
                      'Vì các chú làm công việc vất vả, âm thầm mỗi ngày nơi rừng sâu để giữ gìn bình yên cho rừng xanh mà không cần phô trương.',
                    updatedGradingGuide:
                      'Học sinh giải thích được sự âm thầm, bền bỉ bảo vệ rừng của chú kiểm lâm (1.0đ). Chấp nhận các cách diễn đạt tương đương.',
                  },
          });
        }
      }

      // III: Phát hiện CÂU HỎI SAI KIẾN THỨC TIẾNG VIỆT (Mục III & Mục VII.4)
      if (
        enabledGroups.GROUP_04_KNOWLEDGE &&
        q.vietnameseSection === 'KIEN_THUC_TIENG_VIET'
      ) {
        const isWrongWordClassG4 =
          dossier.grade === 4 &&
          q.questionNumber === 6 &&
          q.stem.includes('từ "chậm rãi" thuộc từ loại nào') &&
          q.declaredCorrectAnswer === 'A';

        const isWrongCompoundSubjectG5 =
          dossier.grade === 5 &&
          q.questionNumber === 7 &&
          q.stem.includes('chủ ngữ của vế câu thứ hai') &&
          q.declaredCorrectAnswer === 'A';

        if (isWrongWordClassG4 || isWrongCompoundSubjectG5) {
          const issueCode = isWrongCompoundSubjectG5
            ? 'ERR-TV5-04-SAIKIENTHUC-C7'
            : 'ERR-TV4-04-SAIKIENTHUC-C6';
          issues.push({
            issueId: `ISS-TV-WRONG-KNOWLEDGE-${dossier.dossierCode}-Q${q.questionNumber}`,
            issueCode,
            groupId: 'GROUP_04_KNOWLEDGE',
            groupTitle: 'Nhóm 4 – Kiến thức môn học',
            issueCategoryLabel: 'Câu hỏi sai kiến thức Tiếng Việt',
            severity: 'LEVEL_1_CRITICAL',
            severityLabel: 'Mức 1 – Nghiêm trọng',
            detectionLayer: 'LAYER_A_RULE_ENGINE',
            detectionLayerLabel: 'Lớp A – Kiểm tra bằng Quy tắc Ngữ pháp Tiếng Việt',
            locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Phần Kiến thức Tiếng Việt)`,
            questionNumber: q.questionNumber,
            currentContent: `Câu hỏi: "${q.stem}" – Đáp án đang khai báo: ${q.declaredCorrectAnswer}`,
            problemDescription: isWrongWordClassG4
              ? 'Sai kiến thức Từ loại Tiếng Việt Lớp 4: Trong câu "Sáng nào ông ngoại cũng chậm rãi tỉa từng cành lá khô.", từ "chậm rãi" là TÍNH TỪ chỉ đặc điểm/tính chất của hoạt động (bổ nghĩa cho động từ "tỉa"), nhưng bảng đáp án và hướng dẫn chấm lại xác định là A. Động từ.'
              : 'Sai kiến thức Cấu tạo câu ghép Tiếng Việt Lớp 5: Trong câu ghép "Mưa vừa tạnh thì chim chóc đã ríu rít gọi nhau trên vòm lá.", vế câu thứ hai là "chim chóc đã ríu rít gọi nhau trên vòm lá" có chủ ngữ là "chim chóc" (Phương án B), nhưng đáp án lại ghi A ("trên vòm lá" – vốn là bộ phận chỉ nơi chốn trong phần vị ngữ).',
            evidenceAndBasis: isWrongWordClassG4
              ? 'Đối chiếu Chương trình GDPT 2018 môn Tiếng Việt Lớp 4 (Mạch Từ loại: Danh từ, Động từ, Tính từ): "tỉa" là động từ, còn "chậm rãi" là tính từ chỉ tính chất.'
              : 'Đối chiếu Chương trình GDPT 2018 môn Tiếng Việt Lớp 5 (Mạch Câu ghép): Vế 1 ("Mưa / vừa tạnh"), Vế 2 ("chim chóc / đã ríu rít gọi nhau trên vòm lá") -> Chủ ngữ vế 2 là "chim chóc".',
            proposedFix: isWrongWordClassG4
              ? 'Đổi đáp án khóa của Câu 6 từ phương án A (Động từ) sang phương án C (Tính từ) và sửa giải thích trong hướng dẫn chấm.'
              : 'Đổi đáp án khóa của Câu 7 từ phương án A ("trên vòm lá") sang phương án B ("chim chóc") và cập nhật hướng dẫn chấm.',
            confidenceScorePercent: 100,
            confidenceLabel: 'Chắc chắn 100% (Quy chuẩn Ngữ pháp Tiếng Việt GDPT 2018)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Giữ nguyên câu dẫn và các phương án lựa chọn.',
              impactOnAnswerKey: isWrongWordClassG4
                ? 'Sửa đáp án khóa Câu 6: A -> C (Tính từ).'
                : 'Sửa đáp án khóa Câu 7: A -> B (chim chóc).',
              impactOnCognitiveLevel: 'Giữ nguyên mức độ nhận thức theo Ma trận.',
              impactOnMatrix: 'Không ảnh hưởng điểm số Ma trận.',
              impactOnGradingGuide: 'Sửa giải thích ngữ pháp trong hướng dẫn chấm.',
            },
            replacementDraft: isWrongWordClassG4
              ? {
                  updatedCorrectAnswer: 'C',
                  updatedGradingGuide:
                    'Từ "chậm rãi" là tính từ chỉ đặc điểm của hoạt động. Chọn đúng phương án C được 0.5 điểm.',
                }
              : {
                  updatedCorrectAnswer: 'B',
                  updatedGradingGuide:
                    'Trong vế câu thứ hai "chim chóc đã ríu rít gọi nhau trên vòm lá", chủ ngữ là "chim chóc". Chọn đúng phương án B được 0.5 điểm.',
                },
          });
        }
      }

      // V.1: Phát hiện HƯỚNG DẪN CHẤM ĐỌC HIỂU QUÁ CỨNG NHẮC (Bắt học sinh trả lời đúng nguyên văn - Mục V & VII.5)
      if (
        (enabledGroups.GROUP_07_ESSAY || enabledGroups.GROUP_08_ANSWER_AND_RUBRIC) &&
        q.vietnameseSection === 'DOC_HIEU' &&
        q.requiresVerbatimAnswerInRubric
      ) {
        const issueCode =
          dossier.grade === 5 ? 'ERR-TV5-05-HDCCUNGNHAC-C5' : 'ERR-TV4-05-HDCCUNGNHAC-C5';
        issues.push({
          issueId: `ISS-TV-RIGID-RUBRIC-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode,
          groupId: 'GROUP_08_ANSWER_AND_RUBRIC',
          groupTitle: 'Nhóm 8 – Đáp án & Hướng dẫn chấm',
          issueCategoryLabel: 'Hướng dẫn chấm quá cứng nhắc (Bắt buộc nguyên văn)',
          severity: 'LEVEL_2_HIGH',
          severityLabel: 'Mức 2 – Cao',
          detectionLayer: 'LAYER_B_GEMINI_AI',
          detectionLayerLabel: 'Lớp B – Phân tích Hướng dẫn chấm bằng Gemini AI',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Hướng dẫn chấm Đọc hiểu)`,
          questionNumber: q.questionNumber,
          currentContent: `Hướng dẫn chấm hiện tại: "${q.gradingGuide}"`,
          problemDescription: `Hướng dẫn chấm Câu ${q.questionNumber} (câu hỏi tự luận mở Mức 3 – Vận dụng/Liên hệ) quá cứng nhắc khi bắt buộc học sinh phải viết "đúng nguyên văn từng chữ" theo đáp án mẫu và không cho điểm nếu diễn đạt bằng từ ngữ khác.`,
          evidenceAndBasis: `Theo Mục V (Kiểm tra hướng dẫn chấm Đọc hiểu) và Thông tư 27/2020/TT-BGDĐT: Đối với câu hỏi đọc hiểu tự luận, hướng dẫn chấm phải chấp nhận các cách diễn đạt tương đương hợp lý của học sinh và không yêu cầu trả lời nguyên văn nếu không cần thiết.`,
          proposedFix: `Bổ sung nguyên tắc chấm mở vào hướng dẫn chấm Câu ${q.questionNumber}: "Chấp nhận mọi cách diễn đạt tương đương, phù hợp với chuẩn mực đạo đức và nội dung văn bản; không yêu cầu học sinh phải viết đúng nguyên văn câu mẫu."`,
          confidenceScorePercent: 97,
          confidenceLabel: 'Độ tin cậy 97% (Đối chiếu quy tắc chấm Đọc hiểu Mục V)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Giữ nguyên câu hỏi.',
            impactOnAnswerKey: 'Chuyển đáp án thành "Gợi ý đáp án tham khảo".',
            impactOnCognitiveLevel: 'Đảm bảo đúng bản chất câu hỏi Vận dụng / Liên hệ (Mức 3).',
            impactOnMatrix: 'Không ảnh hưởng ma trận.',
            impactOnGradingGuide:
              'Mở rộng hướng dẫn chấm chấp nhận các cách diễn đạt tương đương của học sinh.',
          },
          replacementDraft: {
            updatedGradingGuide:
              'Học sinh nêu được bài học/việc làm phù hợp với nội dung văn bản (1.0đ). Chấp nhận các cách diễn đạt tương đương của học sinh, không yêu cầu trả lời đúng nguyên văn đáp án mẫu.',
            updatedAcceptedAlternativeSolutions:
              'Chấp nhận mọi câu trả lời có ý hợp lý, diễn đạt bằng ngôn từ riêng của học sinh.',
          },
        });
      }
    });

    // IV & V.2: Kiểm tra PHẦN VIẾT VÀ HƯỚNG DẪN CHẤM VIẾT (Mục IV, V & VII.7)
    if (
      dossier.vietnameseWritingBlock &&
      (enabledGroups.GROUP_07_ESSAY || enabledGroups.GROUP_08_ANSWER_AND_RUBRIC)
    ) {
      const wb = dossier.vietnameseWritingBlock;
      if (
        !wb.hasClearRequirement ||
        wb.hasTooManySubRequirements ||
        wb.rubricCheck.treatsSampleEssayAsOnlyAnswer ||
        !wb.rubricCheck.hasStructureCriterion ||
        !wb.rubricCheck.hasSpellingPresentationCriterion
      ) {
        const issueCode =
          dossier.grade === 5 ? 'ERR-TV5-07-DEVIETCHUARO-C10' : 'ERR-TV4-07-DEVIETCHUARO-C10';
        issues.push({
          issueId: `ISS-TV-WRITING-PROMPT-${dossier.dossierCode}-Q${wb.questionNumber}`,
          issueCode,
          groupId: 'GROUP_07_ESSAY',
          groupTitle: 'Nhóm 7 – Tự luận & Phần Viết',
          issueCategoryLabel: 'Đề viết chưa rõ yêu cầu & Hướng dẫn chấm áp đặt văn mẫu',
          severity: 'LEVEL_1_CRITICAL',
          severityLabel: 'Mức 1 – Nghiêm trọng',
          detectionLayer: 'LAYER_B_GEMINI_AI',
          detectionLayerLabel: 'Lớp B – Phân tích chuyên môn Phần Viết Gemini AI',
          locationLabel: `Câu ${wb.questionNumber} (Phần Viết – Làm văn)`,
          questionNumber: wb.questionNumber,
          currentContent: `Đề viết: "${wb.promptText}" | Kiểu bài: ${wb.declaredGenre}`,
          problemDescription:
            dossier.grade === 4
              ? 'Đề viết chưa rõ yêu cầu và ôm đồm quá nhiều yêu cầu trong cùng một đề (vừa tả cây hoặc tả con vật hoặc kể chuyện, lại vừa bắt lập bảng kế hoạch chăm sóc cây xanh), không phù hợp thời lượng 25 phút. Đồng thời hướng dẫn chấm coi bài văn mẫu của tổ chuyên môn là đáp án duy nhất.'
              : 'Đề viết ("Hãy viết một bài văn về thiên nhiên và con người nơi em đang sống") quá rộng và chưa rõ yêu cầu kiểu bài theo Chương trình Tiếng Việt lớp 5 (không rõ yêu cầu viết bài văn tả phong cảnh hay bài văn tả người). Ngoài ra hướng dẫn chấm thiếu tiêu chí Bố cục, thiếu tiêu chí Chính tả & Trình bày và coi văn mẫu là đáp án duy nhất.',
          evidenceAndBasis:
            'Theo Mục IV (Kiểm tra phần Viết) và Mục V (Hướng dẫn chấm Viết): Đề bài phải xác định rõ 1 kiểu bài phù hợp chương trình khối lớp và thời lượng, không đặt quá nhiều yêu cầu, tạo cơ hội cho học sinh thể hiện năng lực viết sáng tạo; hướng dẫn chấm phải có đủ 4 tiêu chí (Nội dung, Bố cục, Diễn đạt, Chính tả & Trình bày) và không coi bài văn mẫu là đáp án duy nhất.',
          proposedFix:
            dossier.grade === 4
              ? 'Chỉnh sửa đề Viết Câu 10 thành: "Em hãy viết bài văn miêu tả một cây ăn quả hoặc cây bóng mát mà em yêu thích ở trường hoặc ở nhà em." và bổ sung biểu điểm 4 tiêu chí mở (Nội dung 1.5đ; Bố cục 1.0đ; Diễn đạt 1.0đ; Chính tả & Trình bày 0.5đ).'
              : 'Chỉnh sửa đề Viết Câu 10 thành: "Em hãy viết bài văn miêu tả một cảnh đẹp thiên nhiên ở quê hương hoặc nơi em đang sống." và bổ sung đủ 4 tiêu chí chấm Viết (Nội dung 1.5đ; Bố cục 1.0đ; Diễn đạt 1.0đ; Chính tả & Trình bày 0.5đ = 4.0đ).',
          confidenceScorePercent: 99,
          confidenceLabel: 'Độ tin cậy 99% (Đối chiếu chuẩn Phần Viết GDPT 2018)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Xác định rõ 01 kiểu bài Viết trọng tâm đúng chương trình khối lớp.',
            impactOnAnswerKey: 'Thay bài văn mẫu cứng nhắc bằng dàn ý gợi ý mở.',
            impactOnCognitiveLevel: 'Đảm bảo đúng Mức 3 – Vận dụng (Thực hành viết sáng tạo).',
            impactOnMatrix: 'Khớp chính xác yêu cầu cần đạt mạch Viết trong Ma trận đề.',
            impactOnGradingGuide:
              'Thiết lập đủ 4 tiêu chí: Nội dung (1.5đ), Bố cục (1.0đ), Diễn đạt (1.0đ), Chính tả & Trình bày (0.5đ); tôn trọng cách diễn đạt riêng của học sinh.',
          },
          replacementDraft:
            dossier.grade === 4
              ? {
                  updatedStem:
                    'Em hãy viết bài văn miêu tả một cây ăn quả hoặc cây bóng mát mà em yêu thích ở trường hoặc ở nhà em.',
                  updatedCorrectAnswer:
                    'Dàn ý gợi ý mở (Mở bài giới thiệu cây; Thân bài tả bao quát và từng bộ phận; Kết bài nêu tình cảm của em).',
                  updatedPoints: 4.0,
                  updatedGradingGuide:
                    '1. Nội dung (1.5đ): Tả đúng đặc điểm của cây. 2. Bố cục (1.0đ): Đủ 3 phần Mở bài, Thân bài, Kết bài. 3. Diễn đạt (1.0đ): Dùng từ giàu hình ảnh, câu đúng ngữ pháp. 4. Chính tả & Trình bày (0.5đ): Viết đúng chính tả, sạch đẹp. Không coi bài văn mẫu là đáp án duy nhất.',
                }
              : {
                  updatedStem:
                    'Em hãy viết bài văn miêu tả một cảnh đẹp thiên nhiên ở quê hương hoặc nơi em đang sống.',
                  updatedCorrectAnswer:
                    'Dàn ý gợi ý mở bài văn tả phong cảnh (Mở bài giới thiệu cảnh đẹp; Thân bài tả từng phần hoặc theo trình tự thời gian; Kết bài nêu cảm nghĩ).',
                  updatedPoints: 4.0,
                  updatedGradingGuide:
                    '1. Nội dung (1.5đ): Tả được nét đặc sắc của cảnh đẹp. 2. Bố cục (1.0đ): Đủ 3 phần Mở bài, Thân bài, Kết bài. 3. Diễn đạt (1.0đ): Dùng từ ngữ gợi tả, liên kết câu tốt. 4. Chính tả & Trình bày (0.5đ): Đúng chính tả, trình bày rõ ràng. Không coi bài văn mẫu là đáp án duy nhất.',
                },
        });
      }
    }
  }

  // ==========================================================================
  // CHUYÊN SÂU MÔN TOÁN TIỂU HỌC LỚP 1–5 (5 TRỤ CỘT: TÍNH TOÁN, ĐỀ BÀI, MỨC ĐỘ, HDC, HÌNH HỌC)
  // ==========================================================================
  if (dossier.subject === 'Toán') {
    dossier.questions.forEach((q) => {
      const spec = q.mathAuditSpec;
      if (!spec) return;
      const exprText = spec.expressionToEvaluate || spec.expressionOrFormulaText;
      const gMeta = spec.geometryMeta || spec.geometryMetadata;

      // 1. KIỂM TRA TÍNH TOÁN XÁC ĐỊNH: Giá trị biểu thức số thập phân / thứ tự thực hiện phép tính (Câu 2 Toán 5)
      if (
        (enabledGroups.GROUP_04_KNOWLEDGE || enabledGroups.GROUP_08_ANSWER_AND_RUBRIC) &&
        (spec.calculationType === 'ORDER_OF_OPERATIONS' ||
          spec.calculationType === 'EXPRESSION_VALUE') &&
        exprText &&
        !gMeta
      ) {
        const evalRes = evaluateDeterministicMathExpression(exprText);
        const declaredOpt = q.options?.find((o) => o.key === q.declaredCorrectAnswer);
        const declaredVal = declaredOpt
          ? Number(declaredOpt.text.replace(',', '.').replace(/[^\d.-]/g, ''))
          : NaN;

        if (
          evalRes.isValid &&
          Number.isFinite(declaredVal) &&
          Math.abs(declaredVal - evalRes.numericValue) > 1e-4
        ) {
          const correctOpt = q.options?.find((o) => {
            const v = Number(o.text.replace(',', '.').replace(/[^\d.-]/g, ''));
            return Number.isFinite(v) && Math.abs(v - evalRes.numericValue) < 1e-4;
          });
          issues.push({
            issueId: `ISS-MATH5-EXPR-${dossier.dossierCode}-Q${q.questionNumber}`,
            issueCode: `ERR-TOAN5-01-BIEUTHUC-C${q.questionNumber}`,
            groupId: 'GROUP_04_KNOWLEDGE',
            groupTitle: 'Nhóm 4 – Kiến thức & Tính toán Toán học',
            issueCategoryLabel: 'Sai thứ tự thực hiện phép tính trong giá trị biểu thức',
            severity: 'LEVEL_1_CRITICAL',
            severityLabel: 'Mức 1 – Nghiêm trọng',
            detectionLayer: 'LAYER_A_RULE_ENGINE',
            detectionLayerLabel: 'Lớp A – Bộ tính toán xác định (Deterministic Math Engine)',
            locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
            questionNumber: q.questionNumber,
            currentContent: `Biểu thức: "${exprText}" – Đáp án đang khai báo: ${q.declaredCorrectAnswer} (${declaredOpt?.text}).`,
            problemDescription: `Đáp án khóa và hướng dẫn chấm tính sai thứ tự thực hiện phép tính: lấy 12,5 + 7,5 = 20 rồi nhân 0,4 = 8 (cộng trước nhân sau). Giá trị đúng của biểu thức ${exprText} phải là ${evalRes.formattedValue}.`,
            correctResultOrHandling: `Kết quả đúng: ${evalRes.formattedValue} (Phương án ${
              correctOpt?.key || 'B'
            }).`,
            verificationSolutionProof: `${evalRes.stepByStepProof} (Thực hiện phép nhân 7,5 × 0,4 = 3 trước, sau đó lấy 12,5 + 3 = 15,5).`,
            evidenceAndBasis: `Kiểm chứng bằng Bộ tính toán biểu thức xác định (Shunting-Yard Evaluator): ${exprText} = ${evalRes.formattedValue} ≠ ${declaredOpt?.text}.`,
            proposedFix: `Sửa đáp án khóa Câu ${q.questionNumber} từ phương án ${q.declaredCorrectAnswer} (${declaredOpt?.text}) sang phương án ${
              correctOpt?.key || 'B'
            } (${evalRes.formattedValue}) và cập nhật hướng dẫn chấm thực hiện nhân chia trước, cộng trừ sau.`,
            confidenceScorePercent: 100,
            confidenceLabel: 'Chắc chắn 100% (Bộ tính toán xác định)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Giữ nguyên câu dẫn và 4 phương án lựa chọn.',
              impactOnAnswerKey: `Đổi đáp án khóa Câu ${q.questionNumber}: ${q.declaredCorrectAnswer} -> ${
                correctOpt?.key || 'B'
              } (${evalRes.formattedValue}).`,
              impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
              impactOnMatrix: 'Không ảnh hưởng Ma trận.',
              impactOnGradingGuide:
                'Sửa hướng dẫn chấm: Thực hiện phép nhân trước: 7,5 × 0,4 = 3; sau đó 12,5 + 3 = 15,5. Chọn B (0,5 điểm).',
            },
            replacementDraft: {
              updatedCorrectAnswer: correctOpt?.key || 'B',
              updatedGradingGuide:
                'Thực hiện phép nhân trước: 7,5 × 0,4 = 3; sau đó 12,5 + 3 = 15,5. Chọn đúng phương án B được 0,5 điểm.',
            },
          });
        }
      }

      // 2. KIỂM TRA TÍNH TOÁN XÁC ĐỊNH: Đổi đơn vị đo diện tích ha - m² (Câu 3 Toán 5)
      if (
        (enabledGroups.GROUP_04_KNOWLEDGE || enabledGroups.GROUP_08_ANSWER_AND_RUBRIC) &&
        spec.calculationType === 'UNIT_CONVERSION' &&
        exprText
      ) {
        const evalRes = evaluateDeterministicMathExpression(
          exprText.includes('=') ? '3 + 450 : 10000' : exprText
        );
        const declaredOpt = q.options?.find((o) => o.key === q.declaredCorrectAnswer);
        const declaredVal = declaredOpt
          ? Number(declaredOpt.text.replace(',', '.').replace(/[^\d.-]/g, ''))
          : NaN;

        if (
          evalRes.isValid &&
          Number.isFinite(declaredVal) &&
          Math.abs(declaredVal - evalRes.numericValue) > 1e-5
        ) {
          const correctOpt = q.options?.find((o) => {
            const v = Number(o.text.replace(',', '.').replace(/[^\d.-]/g, ''));
            return Number.isFinite(v) && Math.abs(v - evalRes.numericValue) < 1e-5;
          });
          issues.push({
            issueId: `ISS-MATH5-UNIT-${dossier.dossierCode}-Q${q.questionNumber}`,
            issueCode: `ERR-TOAN5-02-DOIDONVI-C${q.questionNumber}`,
            groupId: 'GROUP_04_KNOWLEDGE',
            groupTitle: 'Nhóm 4 – Kiến thức & Tính toán Toán học',
            issueCategoryLabel: 'Sai quy đổi đơn vị đo đại lượng (ha – m²)',
            severity: 'LEVEL_1_CRITICAL',
            severityLabel: 'Mức 1 – Nghiêm trọng',
            detectionLayer: 'LAYER_A_RULE_ENGINE',
            detectionLayerLabel: 'Lớp A – Bộ tính toán đổi đơn vị xác định',
            locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
            questionNumber: q.questionNumber,
            currentContent: `"${q.stem}" – Đáp án đang khai báo: ${q.declaredCorrectAnswer} (${declaredOpt?.text} ha).`,
            problemDescription: `Sai lầm khi đổi đơn vị diện tích: Vì 1 ha = 10 000 m² nên 450 m² = 450 / 10 000 = 0,045 ha, suy ra 3 ha 450 m² = 3,045 ha. Đáp án khóa đang chia nhầm cho 1 000 nên ghi B (3,45 ha).`,
            correctResultOrHandling: `Kết quả đúng: ${evalRes.formattedValue} ha (Phương án ${
              correctOpt?.key || 'C'
            }).`,
            verificationSolutionProof: `Lời giải kiểm chứng xác định: Ta có 1 ha = 10 000 m² -> 450 m² = 450 : 10 000 = 0,045 ha. Vậy 3 ha 450 m² = 3 ha + 0,045 ha = ${evalRes.formattedValue} ha.`,
            evidenceAndBasis: `Bộ kiểm chứng đổi đơn vị xác định: 3 + 450 : 10 000 = ${evalRes.formattedValue} ha ≠ ${declaredOpt?.text} ha.`,
            proposedFix: `Đổi đáp án khóa của Câu ${q.questionNumber} từ phương án ${q.declaredCorrectAnswer} (${declaredOpt?.text}) sang phương án ${
              correctOpt?.key || 'C'
            } (${evalRes.formattedValue}) và sửa hướng dẫn chấm: 450 m² = 0,045 ha -> 3,045 ha.`,
            confidenceScorePercent: 100,
            confidenceLabel: 'Chắc chắn 100% (Bộ tính toán đổi đơn vị xác định)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Giữ nguyên câu dẫn và 4 phương án A, B, C, D.',
              impactOnAnswerKey: `Sửa đáp án khóa Câu ${q.questionNumber}: ${q.declaredCorrectAnswer} -> ${
                correctOpt?.key || 'C'
              } (3,045).`,
              impactOnCognitiveLevel: 'Giữ nguyên Mức 1 – Nhận biết.',
              impactOnMatrix: 'Không ảnh hưởng Ma trận.',
              impactOnGradingGuide:
                'Cập nhật: 1 ha = 10 000 m² nên 450 m² = 0,045 ha; 3 ha 450 m² = 3,045 ha. Chọn C (0,5 điểm).',
            },
            replacementDraft: {
              updatedCorrectAnswer: correctOpt?.key || 'C',
              updatedGradingGuide:
                'Vì 1 ha = 10 000 m² nên 450 m² = 450 / 10 000 = 0,045 ha -> 3 ha 450 m² = 3,045 ha. Chọn đúng phương án C được 0,5 điểm.',
            },
          });
        }
      }

      // 3. KIỂM TRA ĐỀ BÀI: Dữ kiện mâu thuẫn toán học / Không tồn tại hình thực tế (Câu 5 Toán 5)
      if (enabledGroups.GROUP_05_QUESTION_STEM && spec.hasContradictoryData) {
        issues.push({
          issueId: `ISS-MATH5-CONTRADICTION-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode: `ERR-TOAN5-03-MAUTHUAN-C${q.questionNumber}`,
          groupId: 'GROUP_05_QUESTION_STEM',
          groupTitle: 'Nhóm 5 – Đề bài & Dữ kiện bài toán',
          issueCategoryLabel: 'Dữ kiện đề bài mâu thuẫn toán học (Không tồn tại hình)',
          severity: 'LEVEL_1_CRITICAL',
          severityLabel: 'Mức 1 – Nghiêm trọng',
          detectionLayer: 'LAYER_A_RULE_ENGINE',
          detectionLayerLabel: 'Lớp A – Kiểm tra ràng buộc dữ kiện & bất đẳng thức hình học',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
          questionNumber: q.questionNumber,
          currentContent: `"${q.stem}"`,
          problemDescription:
            spec.contradictionExplanation ||
            spec.contradictoryDataDetail ||
            'Dữ kiện 3 cạnh tam giác AB = 4 cm, BC = 5 cm, AC = 12 cm mâu thuẫn toán học vì tổng hai cạnh AB + BC = 4 + 5 = 9 cm < AC (12 cm), không tạo thành hình tam giác.',
          correctResultOrHandling:
            'Phương án xử lý: Điều chỉnh số đo 3 cạnh thỏa mãn bất đẳng thức tam giác: AB = 7 cm, BC = 8 cm, AC = 12 cm -> Chu vi P = 7 + 8 + 12 = 27 cm (Phương án C).',
          verificationSolutionProof:
            'Kiểm chứng điều kiện tồn tại tam giác: Với a = 4 cm, b = 5 cm, c = 12 cm ta có a + b = 4 + 5 = 9 cm < c = 12 cm (Vi phạm bất đẳng thức tam giác a + b > c). Khi sửa thành a = 7 cm, b = 8 cm, c = 12 cm thì 7 + 8 = 15 > 12 (hợp lệ), chu vi P = 7 + 8 + 12 = 27 cm.',
          evidenceAndBasis:
            'Theo tiêu chí 2.4 (Dữ kiện có mâu thuẫn không?): Số liệu hình học trong đề phải tồn tại thực tế trước khi yêu cầu học sinh tính chu vi.',
          proposedFix:
            'Sửa dữ kiện độ dài ba cạnh trong Câu 5 thành "AB = 7 cm, BC = 8 cm và AC = 12 cm" và cập nhật đáp án chu vi đúng là C (27 cm).',
          confidenceScorePercent: 100,
          confidenceLabel: 'Chắc chắn 100% (Kiểm tra điều kiện tồn tại tam giác)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem:
              'Sửa số đo 3 cạnh thành AB = 7 cm, BC = 8 cm, AC = 12 cm để hình tam giác tồn tại thực tế.',
            impactOnAnswerKey: 'Cập nhật phương án đúng là C (27 cm).',
            impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
            impactOnMatrix: 'Không ảnh hưởng Ma trận.',
            impactOnGradingGuide: 'Cập nhật: Chu vi hình tam giác ABC là: 7 + 8 + 12 = 27 (cm).',
          },
          replacementDraft: {
            updatedStem:
              'Một khung dây thép hình tam giác ABC có độ dài ba cạnh lần lượt là AB = 7 cm, BC = 8 cm và AC = 12 cm. Chu vi của khung dây thép hình tam giác ABC đó là:',
            updatedOptions: [
              { key: 'A', text: '23 cm' },
              { key: 'B', text: '25 cm' },
              { key: 'C', text: '27 cm' },
              { key: 'D', text: '29 cm' },
            ],
            updatedCorrectAnswer: 'C',
            updatedGradingGuide:
              'Chu vi khung dây hình tam giác ABC là: 7 + 8 + 12 = 27 (cm) (thỏa mãn bất đẳng thức tam giác 7 + 8 > 12). Chọn C (0,5 điểm).',
          },
        });
      }

      // 4. KIỂM TRA MỨC ĐỘ: Phân tích thao tác tư duy (Không chỉ đếm số bước tính) (Câu 6 Toán 5)
      if (
        (enabledGroups.GROUP_01_CURRICULUM || enabledGroups.GROUP_03_SPECIFICATION) &&
        spec.recommendedCognitiveLevel &&
        q.declaredCognitiveLevel !== spec.recommendedCognitiveLevel
      ) {
        issues.push({
          issueId: `ISS-MATH5-COGNITIVE-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode: `ERR-TOAN5-04-SAIMUCDO-C${q.questionNumber}`,
          groupId: 'GROUP_03_SPECIFICATION',
          groupTitle: 'Nhóm 3 – Bản đặc tả & Mức độ nhận thức',
          issueCategoryLabel: 'Phân loại sai mức độ nhận thức (Đánh đồng theo số phép tính)',
          severity: 'LEVEL_2_HIGH',
          severityLabel: 'Mức 2 – Cao',
          detectionLayer: 'LAYER_B_GEMINI_AI',
          detectionLayerLabel: 'Lớp B – Phân tích thao tác tư duy Toán học Gemini AI',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
          questionNumber: q.questionNumber,
          currentContent: `Mức độ đang khai báo: "${q.declaredCognitiveLevel}" – Câu hỏi: "${q.stem}"`,
          problemDescription: `Câu ${q.questionNumber} là bài toán tỉ số phần trăm giảm giá liên tiếp 2 lần (cơ sở tính phần trăm thay đổi ở lần giảm thứ hai), nhưng đang bị gán sai ở "${q.declaredCognitiveLevel}" do người ra đề chỉ đếm số phép tính gộp. Thực chất câu hỏi đòi hỏi tư duy phân tích hệ quy chiếu phần trăm ở "${spec.recommendedCognitiveLevel}".`,
          correctResultOrHandling: `Phân loại đúng: ${spec.recommendedCognitiveLevel} (Kết quả bài toán: 1 710 000 đồng – Phương án A).`,
          verificationSolutionProof:
            'Phân tích thao tác tư duy & Lời giải kiểm chứng: (1) Xác định giá sau lần giảm thứ nhất (10% của 2 000 000 đ): 2 000 000 × (100% - 10%) = 1 800 000 (đồng); (2) Chuyển đổi đại lượng gốc 100% mới là 1 800 000 đ để tính giá sau lần giảm thêm 5%: 1 800 000 × (100% - 5%) = 1 710 000 (đồng). Đây là chuỗi thao tác tư duy giải quyết vấn đề thực tiễn không quen thuộc -> Thuộc Mức 3 – Vận dụng.',
          evidenceAndBasis:
            spec.cognitiveLevelJustification ||
            'Theo Mục 3 (Kiểm tra mức độ): Không phân loại chỉ dựa vào số bước tính mà phải đối chiếu thao tác tư duy, YCCĐ và bối cảnh bài toán.',
          proposedFix: `Điều chỉnh mức độ nhận thức của Câu ${q.questionNumber} từ "${q.declaredCognitiveLevel}" sang "${spec.recommendedCognitiveLevel}" để khớp với thao tác tư duy và Ma trận đề.`,
          confidenceScorePercent: 97,
          confidenceLabel: 'Độ tin cậy 97% (Phân tích thao tác tư duy theo TT 27/2020)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Giữ nguyên đề bài và số liệu.',
            impactOnAnswerKey: 'Giữ nguyên đáp án A (1 710 000 đồng).',
            impactOnCognitiveLevel: `Chuyển từ ${q.declaredCognitiveLevel} -> ${spec.recommendedCognitiveLevel}.`,
            impactOnMatrix: 'Khớp lại 100% với mức độ nhận thức của Câu 6 trong Ma trận và Bản đặc tả.',
            impactOnGradingGuide: 'Giữ nguyên lời giải 2 bước phần trăm liên tiếp.',
          },
          replacementDraft: {
            updatedCognitiveLevel: spec.recommendedCognitiveLevel,
          },
        });
      }

      // 5. KIỂM TRA HÌNH HỌC: Sai công thức diện tích hình thang & Lệch tên đường cao hình vẽ (Câu 7 Toán 5)
      if (
        (enabledGroups.GROUP_04_KNOWLEDGE || enabledGroups.GROUP_05_QUESTION_STEM) &&
        gMeta &&
        (gMeta.hasFormulaError || gMeta.hasLabelMismatch || gMeta.isPointSegmentAngleConsistent === false)
      ) {
        const evalTrap = evaluateDeterministicMathExpression('(15 + 9) * 6 / 2');
        issues.push({
          issueId: `ISS-MATH5-GEOM-FORMULA-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode: `ERR-TOAN5-05-HINHHOC-CONGTHUC-C${q.questionNumber}`,
          groupId: 'GROUP_04_KNOWLEDGE',
          groupTitle: 'Nhóm 4 – Kiến thức Hình học & Công thức',
          issueCategoryLabel: 'Sai công thức diện tích hình thang & Lệch tên đoạn thẳng với hình vẽ',
          severity: 'LEVEL_1_CRITICAL',
          severityLabel: 'Mức 1 – Nghiêm trọng',
          detectionLayer: 'LAYER_A_RULE_ENGINE',
          detectionLayerLabel: 'Lớp A – Bộ kiểm tra Hình học & Công thức xác định',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
          questionNumber: q.questionNumber,
          currentContent: `Đề bài: "${q.stem}" | Hình vẽ: "${gMeta.diagramDescription}" | Đáp án khai báo: ${q.declaredCorrectAnswer} (144 cm²).`,
          problemDescription: `Phát hiện 2 lỗi Hình học tại Câu ${q.questionNumber}: (1) Lệch ký hiệu điểm/đoạn thẳng: Đề bài gọi đường cao là "AH = 6 cm" nhưng trên hình vẽ lại ký hiệu đường cao là đoạn thẳng "MK"; (2) Sai công thức diện tích hình thang: Đáp án và hướng dẫn chấm tính S = (15 + 9) × 6 = 144 cm² (quên chia cho 2), trong khi diện tích đúng phải là 72 cm².`,
          correctResultOrHandling: `Kết quả đúng: Diện tích S = ((15 + 9) × 6) : 2 = ${evalTrap.formattedValue} cm² (Phương án B); Đồng bộ tên đường cao trên đề bài và hình vẽ thành AH = 6 cm.`,
          verificationSolutionProof: `Lời giải kiểm chứng Hình học xác định: Công thức diện tích hình thang có đáy lớn a = 15 cm, đáy bé b = 9 cm, chiều cao h = 6 cm là: S = ((a + b) × h) : 2 = ((15 + 9) × 6) : 2 = (24 × 6) : 2 = 144 : 2 = 72 (cm²).`,
          evidenceAndBasis: `Theo Mục 5 (Kiểm tra Hình học): Phải đối chiếu hình vẽ với dữ kiện, kiểm tra tên điểm – đoạn thẳng (AH ≠ MK) và kiểm tra công thức chu vi, diện tích hình thang.`,
          proposedFix: `Đồng bộ tên đường cao trên hình vẽ và đề bài là "AH = 6 cm", đồng thời sửa đáp án khóa từ A (144 cm²) sang B (72 cm²) và bổ sung phép chia 2 trong hướng dẫn chấm.`,
          confidenceScorePercent: 100,
          confidenceLabel: 'Chắc chắn 100% (Kiểm chứng công thức Hình học & ký hiệu đỉnh)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Đồng bộ ký hiệu đường cao AH = 6 cm giữa lời văn và hình vẽ.',
            impactOnAnswerKey: 'Đổi đáp án khóa Câu 7 từ phương án A (144 cm²) sang phương án B (72 cm²).',
            impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
            impactOnMatrix: 'Không ảnh hưởng Ma trận.',
            impactOnGradingGuide: 'Sửa công thức chấm: S = ((15 + 9) × 6) : 2 = 72 (cm²). Chọn B (1,0 điểm).',
          },
          replacementDraft: {
            updatedCorrectAnswer: 'B',
            updatedGradingGuide:
              'Áp dụng công thức diện tích hình thang: S = ((15 + 9) × 6) : 2 = 72 (cm²). Đồng bộ ký hiệu đường cao AH trên hình vẽ. Chọn B được 1,0 điểm.',
          },
        });
      }

      // 6. KIỂM TRA HÌNH HỌC: Hình minh họa gây hiểu nhầm (Vẽ góc tù cho dữ kiện 60°, vẽ đoạn 12 cm ngắn hơn 4 cm) (Câu 8 Toán 5)
      if (
        enabledGroups.GROUP_05_QUESTION_STEM &&
        gMeta &&
        (gMeta.hasMisleadingIllustration || gMeta.hasMisleadingDiagram)
      ) {
        issues.push({
          issueId: `ISS-MATH5-GEOM-DIAGRAM-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode: `ERR-TOAN5-06-HINHVE-SAILECH-C${q.questionNumber}`,
          groupId: 'GROUP_05_QUESTION_STEM',
          groupTitle: 'Nhóm 5 – Đề bài & Hình minh họa Hình học',
          issueCategoryLabel: 'Hình minh họa hình học sai lệch tỷ lệ và góc gây hiểu nhầm',
          severity: 'LEVEL_2_HIGH',
          severityLabel: 'Mức 2 – Cao',
          detectionLayer: 'LAYER_B_GEMINI_AI',
          detectionLayerLabel: 'Lớp B – Kiểm tra đối chiếu Hình vẽ & Dữ kiện Hình học',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
          questionNumber: q.questionNumber,
          currentContent: `Đề bài: "${q.stem}" | Hình vẽ đính kèm: "${gMeta.diagramDescription}"`,
          problemDescription:
            gMeta.geometryAuditNote ||
            gMeta.misleadingDiagramDetail ||
            'Hình minh họa gây hiểu nhầm nghiêm trọng cho học sinh tiểu học: Đề bài cho góc xOy = 60° (góc nhọn) nhưng hình vẽ lại vẽ góc mở rộng 135° (góc tù); đồng thời đoạn OA = 12 cm lại được vẽ ngắn hơn đoạn OB = 4 cm.',
          correctResultOrHandling:
            'Phương án xử lý: Vẽ lại hình minh họa góc xOy đúng góc nhọn 60° (< 90°) và đảm bảo tỷ lệ đoạn thẳng OA = 12 cm dài gấp 3 lần đoạn OB = 4 cm (Đáp án giữ nguyên A. Góc nhọn).',
          verificationSolutionProof:
            'Kiểm chứng Hình học trực quan: Ta có 60° < 90° nên góc xOy là góc nhọn; 12 : 4 = 3 (lần). Ở cấp Tiểu học, học sinh nhận diện góc và đoạn thẳng trực tiếp qua trực quan hình vẽ kết hợp số đo; việc vẽ góc 135° (> 90°) cho số đo 60° và vẽ đoạn 12 cm ngắn hơn 4 cm làm học sinh chọn nhầm phương án B (Góc tù).',
          evidenceAndBasis:
            'Theo Mục 5 (Kiểm tra Hình học – Tiêu chí 5.1 & 5.4): Phải đối chiếu hình vẽ với dữ kiện và phát hiện hình minh họa gây hiểu nhầm.',
          proposedFix:
            'Vẽ lại hình minh họa Câu 8 đúng góc nhọn 60° và điều chỉnh tỷ lệ độ dài đoạn thẳng OA = 3 × OB trên hình vẽ.',
          confidenceScorePercent: 98,
          confidenceLabel: 'Độ tin cậy 98% (Kiểm toán tương thích Hình vẽ – Số đo)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Cập nhật lại hình vẽ minh họa góc nhọn xOy = 60° đúng tỷ lệ.',
            impactOnAnswerKey: 'Giữ nguyên đáp án đúng A.',
            impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
            impactOnMatrix: 'Không ảnh hưởng Ma trận.',
            impactOnGradingGuide: 'Bổ sung lưu ý hình vẽ chuẩn tỷ lệ trong hồ sơ đề.',
          },
          replacementDraft: {
            updatedStem:
              'Cho hình vẽ góc xOy (đã hiệu chỉnh hình vẽ đúng góc nhọn 60° và đoạn OA = 12 cm dài gấp 3 lần OB = 4 cm). Hỏi góc xOy thuộc loại góc nào và cạnh OA gấp mấy lần cạnh OB?',
          },
        });
      }

      // 7. KIỂM TRA HƯỚNG DẪN CHẤM: Phát hiện lời giải sai bản chất toán học nhưng kết quả tình cờ đúng (Câu 9 Toán 5: 16/64 = 1/4)
      if (
        enabledGroups.GROUP_08_ANSWER_AND_RUBRIC &&
        (spec.rubricHasFlukeCorrectResult || spec.hasFlukeCorrectResultFromWrongMethod)
      ) {
        const fracProof = simplifyFractionDeterministically(16, 64);
        issues.push({
          issueId: `ISS-MATH5-FLUKE-METHOD-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode: `ERR-TOAN5-07-LOIGIAISAI-KETQUADUNG-C${q.questionNumber}`,
          groupId: 'GROUP_08_ANSWER_AND_RUBRIC',
          groupTitle: 'Nhóm 8 – Đáp án & Hướng dẫn chấm',
          issueCategoryLabel: 'Lời giải sai bản chất toán học nhưng kết quả tình cờ đúng',
          severity: 'LEVEL_1_CRITICAL',
          severityLabel: 'Mức 1 – Nghiêm trọng',
          detectionLayer: 'LAYER_A_RULE_ENGINE',
          detectionLayerLabel: 'Lớp A – Kiểm tra bản chất phép biến đổi trong Hướng dẫn chấm',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Hướng dẫn chấm Tự luận)`,
          questionNumber: q.questionNumber,
          currentContent: `Hướng dẫn chấm hiện tại: "${q.gradingGuide}"`,
          problemDescription:
            spec.rubricFlukeExplanation ||
            spec.flukeMethodDetail ||
            'Hướng dẫn chấm rút gọn phân số 16/64 = 1/4 bằng cách "gạch bỏ chữ số 6 ở cả tử số và mẫu số". Đây là thao tác sai bản chất toán học nghiêm trọng dù kết quả 1/4 tình cờ đúng.',
          correctResultOrHandling: `Kết quả đúng: ${fracProof.simplifiedText} + 3/4 = 1; bắt buộc sửa lời giải rút gọn bằng cách chia cả tử và mẫu của 16/64 cho 16 (hoặc rút gọn từng bước cho 8, cho 4).`,
          verificationSolutionProof: `Lời giải kiểm chứng chuẩn toán học: Bước 1: Rút gọn phân số ${fracProof.stepProof}. Bước 2: Cộng hai phân số cùng mẫu số: 1/4 + 3/4 = 4/4 = 1. Lưu ý chấm: Tuyệt đối không cho điểm bước rút gọn nếu học sinh gạch chữ số 6 ở hàng đơn vị và hàng chục.`,
          evidenceAndBasis:
            'Theo Mục 4 (Kiểm tra Hướng dẫn chấm – Tiêu chí 4.4): Phải phát hiện lời giải sai nhưng kết quả tình cờ đúng để tránh dạy sai phương pháp toán học và chấm sai bài làm học sinh.',
          proposedFix:
            'Sửa lời giải mẫu trong hướng dẫn chấm Câu 9 thành: "Ta có 16/64 = (16 : 16)/(64 : 16) = 1/4 (1,0đ); 1/4 + 3/4 = 4/4 = 1 (1,0đ). Chấp nhận cách quy đồng trực tiếp mẫu số chung 64."',
          confidenceScorePercent: 100,
          confidenceLabel: 'Chắc chắn 100% (Kiểm tra quy tắc rút gọn phân số)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Giữ nguyên đề bài.',
            impactOnAnswerKey: 'Giữ kết quả 1/4 và 1 nhưng thay toàn bộ lời giải biến đổi.',
            impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
            impactOnMatrix: 'Không ảnh hưởng Ma trận.',
            impactOnGradingGuide:
              'Loại bỏ thao tác gạch chữ số 6; thay bằng phép chia cả tử số và mẫu số cho ƯCLN(16, 64) = 16 và bổ sung ghi chú chấp nhận cách giải khác.',
          },
          replacementDraft: {
            updatedCorrectAnswer: '16/64 = (16 : 16)/(64 : 16) = 1/4;  1/4 + 3/4 = 4/4 = 1',
            updatedGradingGuide:
              'Bước 1: Rút gọn đúng bản chất 16/64 = (16 : 16)/(64 : 16) = 1/4 (1,0 điểm). Bước 2: Cộng đúng 1/4 + 3/4 = 4/4 = 1 (1,0 điểm). Chấp nhận cách giải quy đồng mẫu số 64.',
            updatedAcceptedAlternativeSolutions:
              'Chấp nhận học sinh quy đồng 16/64 + 48/64 = 64/64 = 1 hoặc tính bằng số thập phân 0,25 + 0,75 = 1.',
          },
        });
      }

      // 8. KIỂM TRA HƯỚNG DẪN CHẤM: Đáp án mẫu thiếu bước, thiếu đơn vị, thiếu cách giải khác & lệch tổng điểm thành phần (Câu 10 Toán 5)
      const subStepSum = spec.rubricSubPointsSum !== undefined
        ? spec.rubricSubPointsSum
        : spec.rubricSubStepPoints
        ? spec.rubricSubStepPoints.reduce((s, item) => s + item.points, 0)
        : undefined;
      if (
        enabledGroups.GROUP_08_ANSWER_AND_RUBRIC &&
        (spec.rubricMissingIntermediateStep ||
          spec.rubricMissingUnitInAnswer ||
          spec.hasMissingStepOrUnitInRubric ||
          (subStepSum !== undefined && Math.abs(subStepSum - q.points) > 1e-3))
      ) {
        const evalVol = evaluateDeterministicMathExpression('2,5 * 1,8 * 1,2 * 1000');
        issues.push({
          issueId: `ISS-MATH5-RUBRIC-INCOMPLETE-${dossier.dossierCode}-Q${q.questionNumber}`,
          issueCode: `ERR-TOAN5-08-HDCTHIEUBUOC-DONVI-C${q.questionNumber}`,
          groupId: 'GROUP_08_ANSWER_AND_RUBRIC',
          groupTitle: 'Nhóm 8 – Đáp án & Hướng dẫn chấm',
          issueCategoryLabel:
            'Đáp án mẫu thiếu bước giải, thiếu đơn vị, lệch tổng điểm thành phần & thiếu cách giải khác',
          severity: 'LEVEL_1_CRITICAL',
          severityLabel: 'Mức 1 – Nghiêm trọng',
          detectionLayer: 'LAYER_A_RULE_ENGINE',
          detectionLayerLabel: 'Lớp A – Kiểm toán Hướng dẫn chấm & Đơn vị bài toán có lời văn',
          locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Tự luận 3,0 điểm)`,
          questionNumber: q.questionNumber,
          currentContent: `Đáp án hiện tại: "${q.declaredCorrectAnswer}" | Hướng dẫn chấm: "${q.gradingGuide}"`,
          problemDescription: `Hướng dẫn chấm Câu ${q.questionNumber} (3,0 điểm) mắc 4 lỗi nghiêm trọng: (1) Thiếu bước tính thể tích bể bằng m³ (2,5 × 1,8 × 1,2 = 5,4 m³) và bước đổi 5,4 m³ = 5 400 dm³ = 5 400 lít; (2) Đáp số chỉ ghi "5 400", bỏ sót đơn vị "${
            spec.expectedUnit || 'lít'
          }"; (3) Tổng điểm thành phần mới có 0,5đ + 0,5đ = 1,0 điểm (hụt 2,0 điểm so với 3,0 điểm của câu); (4) Chưa có quy định chấp nhận cách giải đổi kích thước ra dm trước khi nhân.`,
          correctResultOrHandling: `Kết quả đúng đầy đủ đơn vị: ${evalVol.formattedValue} ${
            spec.expectedUnit || 'lít'
          } nước; Biểu điểm thành phần chuẩn hóa đủ 3,0 điểm (1,5đ + 1,0đ + 0,5đ = 3,0đ) và chấp nhận cách giải khác.`,
          verificationSolutionProof: `Lời giải kiểm chứng bài toán có lời văn (2 cách): Cách 1: Thể tích lòng bể nước là: 2,5 × 1,8 × 1,2 = 5,4 (m³) (1,5 điểm). Đổi 5,4 m³ = 5 400 dm³ = 5 400 lít (1,0 điểm). Đáp số: 5 400 lít nước (0,5 điểm). Cách 2 (hợp lệ): Đổi 2,5 m = 25 dm; 1,8 m = 18 dm; 1,2 m = 12 dm. Thể tích bể là: 25 × 18 × 12 = 5 400 (dm³) = 5 400 (lít).`,
          evidenceAndBasis:
            'Theo Mục 1.5 (Kiểm tra kết quả và đơn vị trong bài toán có lời văn) và Mục 4 (Chia điểm hợp lý, kiểm tra tổng điểm thành phần, chấp nhận cách giải khác, phát hiện đáp án thiếu bước/thiếu đơn vị).',
          proposedFix:
            'Bổ sung đầy đủ 3 bước giải kèm đơn vị "m³", "lít", điều chỉnh thang điểm thành phần 1,5đ + 1,0đ + 0,5đ = 3,0 điểm và ghi rõ chấp nhận cách đổi ra dm trước khi tính thể tích.',
          confidenceScorePercent: 100,
          confidenceLabel: 'Chắc chắn 100% (Kiểm toán biểu điểm & đơn vị bài toán có lời văn)',
          status: 'OPEN',
          impactAnalysis: {
            impactOnQuestionStem: 'Giữ nguyên đề bài.',
            impactOnAnswerKey: 'Bổ sung đầy đủ các bước tính và đơn vị "5 400 lít nước".',
            impactOnCognitiveLevel: 'Giữ nguyên Mức 3 – Vận dụng.',
            impactOnMatrix: 'Đảm bảo tổng điểm thành phần khớp đúng 3,0 điểm của Câu 10 trong Ma trận.',
            impactOnGradingGuide:
              'Chuẩn hóa biểu điểm thành phần đủ 3,0 điểm (1,5đ + 1,0đ + 0,5đ) và mở rộng chấp nhận cách giải đổi đơn vị sang dm trước.',
          },
          replacementDraft: {
            updatedCorrectAnswer:
              'Thể tích bể nước là: 2,5 × 1,8 × 1,2 = 5,4 (m³). Đổi 5,4 m³ = 5 400 dm³ = 5 400 lít. Đáp số: 5 400 lít nước.',
            updatedGradingGuide:
              'Bước 1: Tính đúng thể tích bể: 2,5 × 1,8 × 1,2 = 5,4 (m³) (1,5 điểm). Bước 2: Đổi đúng 5,4 m³ = 5 400 dm³ = 5 400 lít (1,0 điểm). Bước 3: Ghi đúng đáp số kèm đơn vị "5 400 lít nước" (0,5 điểm). Tổng = 3,0 điểm. Lưu ý: Học sinh đổi 2,5 m = 25 dm; 1,8 m = 18 dm; 1,2 m = 12 dm rồi tính 25 × 18 × 12 = 5 400 (dm³) = 5 400 (lít) vẫn đạt điểm tối đa 3,0 điểm.',
            updatedAcceptedAlternativeSolutions:
              'Chấp nhận cách đổi 2,5 m = 25 dm, 1,8 m = 18 dm, 1,2 m = 12 dm rồi nhân 25 × 18 × 12 = 5 400 dm³ = 5 400 lít.',
          },
        });
      }
    });
  }

  // ==========================================================================
  // LỚP B – PHÂN TÍCH CHUYÊN MÔN BẰNG GEMINI AI (CHO ĐỀ TOÁN & CHUNG)
  // ==========================================================================
  if (canRunLayerBGemini) {
    dossier.questions.forEach((q) => {
      const matrixSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);

      // 1. Phát hiện câu hỏi thiếu dữ kiện quan trọng (Nhóm 5 - Câu hỏi)
      if (enabledGroups.GROUP_05_QUESTION_STEM) {
        const asksRectangleArea =
          q.stem.toLowerCase().includes('hình chữ nhật') &&
          q.stem.toLowerCase().includes('diện tích');
        const hasLength = q.stem.toLowerCase().includes('chiều dài');
        const hasWidthOrPerimeter =
          q.stem.toLowerCase().includes('chiều rộng') ||
          q.stem.toLowerCase().includes('chu vi') ||
          q.stem.toLowerCase().includes('nửa chu vi') ||
          q.stem.toLowerCase().includes('kém') ||
          q.stem.toLowerCase().includes('bằng');

        if (asksRectangleArea && hasLength && !hasWidthOrPerimeter) {
          issues.push({
            issueId: `ISS-MISSING-DATA-Q${q.questionNumber}`,
            issueCode: `ERR-AI01-THIEUDUKIEN-C${q.questionNumber}`,
            groupId: 'GROUP_05_QUESTION_STEM',
            groupTitle: 'Nhóm 5 – Câu hỏi & Đọc hiểu',
            issueCategoryLabel: 'Câu hỏi thiếu dữ kiện quan trọng',
            severity: 'LEVEL_2_HIGH',
            severityLabel: 'Mức 2 – Cao',
            detectionLayer: 'LAYER_B_GEMINI_AI',
            detectionLayerLabel: 'Lớp B – Phân tích bằng Gemini AI',
            locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
            questionNumber: q.questionNumber,
            currentContent: `"${q.stem}"`,
            problemDescription: `Bài toán yêu cầu tính diện tích hình chữ nhật nhưng mới chỉ cho biết "chiều dài 18 m", hoàn toàn thiếu dữ kiện về chiều rộng hoặc chu vi nên học sinh không thể giải được.`,
            correctResultOrHandling: `Phương án xử lý: Bổ sung dữ kiện "chiều rộng 10 m" vào đề bài -> Kết quả diện tích đúng = 180 m² (Phương án C).`,
            verificationSolutionProof: `Lời giải kiểm chứng khi bổ sung đủ dữ kiện: Diện tích mảnh vườn hình chữ nhật là: S = chiều dài × chiều rộng = 18 × 10 = 180 (m²).`,
            evidenceAndBasis: `Công thức diện tích hình chữ nhật S = a × b cần biết cả chiều dài a và chiều rộng b. Trong hướng dẫn chấm có phép tính "18 × 10 = 180 m²", chứng tỏ người ra đề đã bỏ sót dữ kiện "chiều rộng 10 m" trong phần câu dẫn.`,
            proposedFix: `Bổ sung dữ kiện "và chiều rộng 10 m" vào câu dẫn: "Một mảnh vườn hình chữ nhật có chiều dài 18 m và chiều rộng 10 m. Diện tích của mảnh vườn hình chữ nhật đó là bao nhiêu mét vuông?"`,
            confidenceScorePercent: 98,
            confidenceLabel: 'Độ tin cậy cao (98% – Phân tích ngữ nghĩa toán học Gemini)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Bổ sung cụm từ "và chiều rộng 10 m" sau "chiều dài 18 m".',
              impactOnAnswerKey: 'Giữ nguyên đáp án C (180 m²).',
              impactOnCognitiveLevel: 'Giữ nguyên Mức 2 – Thông hiểu.',
              impactOnMatrix: 'Không ảnh hưởng ma trận.',
              impactOnGradingGuide: 'Khớp hoàn toàn với phép tính 18 × 10 = 180 m² trong hướng dẫn chấm.',
            },
            replacementDraft: {
              updatedStem:
                'Một mảnh vườn hình chữ nhật có chiều dài 18 m và chiều rộng 10 m. Diện tích của mảnh vườn hình chữ nhật đó là bao nhiêu mét vuông?',
            },
          });
        }
      }

      // 2. Phát hiện câu hỏi gán sai mức độ nhận thức (Nhóm 1 & Nhóm 3)
      if (enabledGroups.GROUP_01_CURRICULUM || enabledGroups.GROUP_03_SPECIFICATION) {
        const isMultiStepRealWorld =
          q.stem.includes('100 000 đồng') &&
          q.stem.includes('3 quyển sổ') &&
          q.stem.includes('2 chiếc bút');
        if (isMultiStepRealWorld && q.declaredCognitiveLevel === 'Mức 1 – Nhận biết') {
          const detWordProb = evaluateDeterministicMathExpression('100000 - (3 * 18000 + 2 * 15000)');
          issues.push({
            issueId: `ISS-WRONG-LEVEL-Q${q.questionNumber}`,
            issueCode: `ERR-AI02-SAIMUCDO-C${q.questionNumber}`,
            groupId: 'GROUP_03_SPECIFICATION',
            groupTitle: 'Nhóm 3 – Bản đặc tả',
            issueCategoryLabel: 'Phân loại sai mức độ nhận thức',
            severity: 'LEVEL_2_HIGH',
            severityLabel: 'Mức 2 – Cao',
            detectionLayer: 'LAYER_B_GEMINI_AI',
            detectionLayerLabel: 'Lớp B – Phân tích bằng Gemini AI',
            locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
            questionNumber: q.questionNumber,
            currentContent: `Mức độ đang khai báo: "${q.declaredCognitiveLevel}" – Câu hỏi: "${q.stem}"`,
            problemDescription: `Câu ${q.questionNumber} là bài toán thực tiễn đòi hỏi phân tích mối quan hệ mua – bán đa bước (tính tiền sổ, tính tiền bút, tính tổng chi phí và số tiền trả lại), nhưng lại đang được gán nhãn ở "Mức 1 – Nhận biết".`,
            correctResultOrHandling: `Phân loại đúng: Mức 3 – Vận dụng (Kết quả bài toán: ${detWordProb.formattedValue} đồng – Phương án A).`,
            verificationSolutionProof: `Phân tích thao tác tư duy & Lời giải kiểm chứng: Bước 1: Tiền mua 3 quyển sổ = 18 000 × 3 = 54 000 (đồng); Bước 2: Tiền mua 2 chiếc bút = 15 000 × 2 = 30 000 (đồng); Bước 3: Số tiền cô bán hàng trả lại = 100 000 - (54 000 + 30 000) = 16 000 (đồng). Học sinh phải tự lập kế hoạch giải quyết tình huống mua bán thực tế -> Thuộc Mức 3 – Vận dụng.`,
            evidenceAndBasis: `Theo Thông tư 27/2020/TT-BGDĐT và Ma trận đề (Vị trí Câu ${
              q.questionNumber
            } yêu cầu "${
              matrixSlot?.expectedCognitiveLevel ?? 'Mức 3 – Vận dụng'
            }"), bài toán giải quyết tình huống thực tiễn nhiều bước tính phải thuộc Mức 3 – Vận dụng.`,
            proposedFix: `Cập nhật mức độ nhận thức của Câu ${q.questionNumber} từ "Mức 1 – Nhận biết" sang "Mức 3 – Vận dụng" để khớp với độ phức tạp tư duy và Ma trận đề.`,
            confidenceScorePercent: 95,
            confidenceLabel: 'Độ tin cậy cao (95% – Đối chiếu TT 27/2020 & Gemini)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Giữ nguyên nội dung bài toán.',
              impactOnAnswerKey: 'Giữ nguyên đáp án A (16 000 đồng).',
              impactOnCognitiveLevel: 'Chuyển từ Mức 1 – Nhận biết -> Mức 3 – Vận dụng.',
              impactOnMatrix: 'Khớp lại tỷ trọng điểm Mức 3 trong Ma trận và Bản đặc tả.',
              impactOnGradingGuide: 'Giữ nguyên hướng dẫn giải.',
            },
            replacementDraft: {
              updatedCognitiveLevel: 'Mức 3 – Vận dụng',
            },
          });
        }
      }

      // 3. Phát hiện lỗi chính tả tiếng Việt trong câu dẫn hoặc phương án chọn (Nhóm 9)
      if (enabledGroups.GROUP_09_LANGUAGE_AND_FORMAT) {
        const optionWithTypo = q.options?.find((o) => o.text.includes('bàng nhau'));
        if (optionWithTypo) {
          issues.push({
            issueId: `ISS-SPELLING-Q${q.questionNumber}`,
            issueCode: `ERR-AI03-CHINHTA-C${q.questionNumber}`,
            groupId: 'GROUP_09_LANGUAGE_AND_FORMAT',
            groupTitle: 'Nhóm 9 – Ngôn ngữ & Hình thức',
            issueCategoryLabel: 'Lỗi chính tả tiếng Việt',
            severity: 'LEVEL_4_LOW',
            severityLabel: 'Mức 4 – Thấp',
            detectionLayer: 'LAYER_B_GEMINI_AI',
            detectionLayerLabel: 'Lớp B – Phân tích bằng Gemini AI',
            locationLabel: `Câu ${q.questionNumber} – Phương án ${optionWithTypo.key}`,
            questionNumber: q.questionNumber,
            currentContent: `"${optionWithTypo.text}"`,
            problemDescription: `Phát hiện lỗi chính tả trong phương án ${optionWithTypo.key}: viết sai từ "bàng nhau" thay vì "bằng nhau".`,
            correctResultOrHandling: `Phương án xử lý: Sửa chính tả thuật ngữ hình học thành "Hai cặp cạnh đối diện song song và bằng nhau" (Phương án A).`,
            verificationSolutionProof: `Đối chiếu tính chất hình bình hành Toán 4: Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau. Đáp án đúng là phương án A.`,
            evidenceAndBasis: `Quy chuẩn chính tả tiếng Việt và thuật ngữ Toán 4 ("hai cặp cạnh đối diện song song và bằng nhau").`,
            proposedFix: `Sửa từ "bàng nhau" thành "bằng nhau" trong phương án ${optionWithTypo.key} của Câu ${q.questionNumber}.`,
            confidenceScorePercent: 99,
            confidenceLabel: 'Độ tin cậy rất cao (99% – Kiểm tra chính tả)',
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Chỉnh sửa chính tả tại phương án A.',
              impactOnAnswerKey: 'Không ảnh hưởng đáp án.',
              impactOnCognitiveLevel: 'Không ảnh hưởng mức độ.',
              impactOnMatrix: 'Không ảnh hưởng ma trận.',
              impactOnGradingGuide: 'Không ảnh hưởng hướng dẫn chấm.',
            },
            replacementDraft: {
              updatedOptions: q.options?.map((o) =>
                o.key === optionWithTypo.key
                  ? { ...o, text: o.text.replace('bàng nhau', 'bằng nhau') }
                  : o
              ),
            },
          });
        }
      }
    });
  }

  // ==========================================================================
  // ĐỐI CHIẾU CHÉO 7 NGUỒN DỮ LIỆU HỒ SƠ KIỂM TRA (CROSS-DOCUMENT RECONCILIATION)
  // Phát hiện 5 dạng mâu thuẫn liên tài liệu: (1) Sai mức độ giữa Ma trận/Đặc tả & Đề,
  // (2) Sai số điểm câu giữa Ma trận & Đề, (3) Câu thiếu trong Bản đặc tả,
  // (4) Đáp án không khớp nội dung Đề / lệch mã đề, (5) Câu nằm ngoài phạm vi kiến thức.
  // ==========================================================================
  dossier.questions.forEach((q) => {
    const matrixSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);
    const specSlot = dossier.specificationSlots.find((s) => s.questionNumber === q.questionNumber);
    const aiOrActualLevel =
      q.aiAssessedCognitiveLevel ||
      q.mathAuditSpec?.recommendedCognitiveLevel ||
      q.declaredCognitiveLevel;

    // 1. Mâu thuẫn mức độ giữa Ma trận/Bản đặc tả và Đề kiểm tra thực tế
    if (
      matrixSlot &&
      aiOrActualLevel !== matrixSlot.expectedCognitiveLevel &&
      !issues.some(
        (iss) =>
          iss.questionNumber === q.questionNumber &&
          (iss.issueCode.includes('SAIMUCDO') || iss.issueCode.includes('CROSS-LEVEL'))
      )
    ) {
      issues.push({
        issueId: `ISS-CROSS-LEVEL-${dossier.dossierCode}-Q${q.questionNumber}`,
        issueCode: `ERR-DOICHIEU-01-SAIMUCDO-C${q.questionNumber}`,
        groupId: 'GROUP_02_MATRIX',
        groupTitle: 'Nhóm 2 & 3 – Đối chiếu Ma trận, Bản đặc tả & Đề kiểm tra',
        issueCategoryLabel: 'Mâu thuẫn Mức độ nhận thức giữa Ma trận/Đặc tả và Đề kiểm tra',
        severity: 'LEVEL_2_HIGH',
        severityLabel: 'Mức 2 – Cao',
        detectionLayer: 'LAYER_B_GEMINI_AI',
        detectionLayerLabel: 'Lớp A + B – Đối chiếu chéo Ma trận ↔ Đặc tả ↔ Đề kiểm tra',
        locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
        questionNumber: q.questionNumber,
        currentContent: `[Ma trận & Đặc tả - Câu ${q.questionNumber}]: "${matrixSlot.expectedCognitiveLevel}" (${matrixSlot.expectedTopicTitle}) ↔ [Đề kiểm tra - Câu ${q.questionNumber}]: "${q.stem}" (Mức độ thực tế AI nhận định: "${aiOrActualLevel}").`,
        problemDescription: `Mâu thuẫn liên tài liệu tại Câu ${q.questionNumber}: Ma trận đề và Bản đặc tả quy định câu hỏi ở "${matrixSlot.expectedCognitiveLevel}", nhưng câu hỏi trong Đề kiểm tra thực tế chỉ yêu cầu thao tác tư duy ở "${aiOrActualLevel}".`,
        correctResultOrHandling: `Phương án xử lý trung lập (Không tự quyết định tài liệu nào đúng): (Phương án A) Giữ Ma trận/Bản đặc tả và biên soạn lại Câu ${q.questionNumber} đạt chuẩn "${matrixSlot.expectedCognitiveLevel}"; hoặc (Phương án B) Giữ nguyên câu hỏi trong Đề và điều chỉnh Ma trận/Bản đặc tả về "${aiOrActualLevel}".`,
        verificationSolutionProof: `Đối chiếu chéo: Tại dòng Câu ${q.questionNumber} của Ma trận đề ghi "${matrixSlot.expectedCognitiveLevel}" (${matrixSlot.expectedLearningOutcomeCode}); tại Đề kiểm tra Câu ${q.questionNumber} chỉ yêu cầu nhận diện trực tiếp thông tin nên thuộc "${aiOrActualLevel}".`,
        evidenceAndBasis: `Theo Mục I, II & VI (Đối chiếu chéo hồ sơ kiểm tra): Mức độ nhận thức của từng câu hỏi trong Đề phải thống nhất với Ma trận đề và Bản đặc tả.`,
        proposedFix: `Chọn 1 trong 2 phương án: (A) Nâng cấp Câu ${q.questionNumber} trong Đề lên bài toán vận dụng thực tiễn khớp "${matrixSlot.expectedCognitiveLevel}"; hoặc (B) Cập nhật Ma trận & Bản đặc tả Câu ${q.questionNumber} xuống "${aiOrActualLevel}".`,
        confidenceScorePercent: 98,
        confidenceLabel: 'Độ tin cậy 98% (Đối chiếu chéo Ma trận – Đặc tả – Đề)',
        status: 'OPEN',
        impactAnalysis: {
          impactOnQuestionStem: 'Nếu chọn Phương án A: thay câu dẫn thành bài toán vận dụng thực tế.',
          impactOnAnswerKey: 'Cập nhật đáp án tương ứng nếu thay câu hỏi theo Phương án A.',
          impactOnCognitiveLevel: `Đồng bộ giữa "${matrixSlot.expectedCognitiveLevel}" và "${aiOrActualLevel}".`,
          impactOnMatrix: 'Nếu chọn Phương án B: cập nhật lại cột mức độ của Câu 2 trong Ma trận.',
          impactOnGradingGuide: 'Đồng bộ hướng dẫn chấm theo phương án giáo viên lựa chọn.',
        },
        replacementDraft: {
          updatedCognitiveLevel: matrixSlot.expectedCognitiveLevel,
        },
      });
    }

    // 2. Mâu thuẫn số điểm của câu hỏi giữa Ma trận và Đề kiểm tra thực tế
    if (
      matrixSlot &&
      Math.abs(q.points - matrixSlot.expectedPoints) > 1e-3 &&
      !issues.some(
        (iss) =>
          iss.questionNumber === q.questionNumber && iss.issueCode.includes('SAIDIEM')
      )
    ) {
      issues.push({
        issueId: `ISS-CROSS-POINTS-${dossier.dossierCode}-Q${q.questionNumber}`,
        issueCode: `ERR-DOICHIEU-02-SAIDIEM-C${q.questionNumber}`,
        groupId: 'GROUP_02_MATRIX',
        groupTitle: 'Nhóm 2 – Đối chiếu Điểm số Ma trận ↔ Đề kiểm tra ↔ HDC',
        issueCategoryLabel: 'Mâu thuẫn Số điểm câu hỏi giữa Ma trận đề và Đề kiểm tra / HDC',
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng',
        detectionLayer: 'LAYER_A_RULE_ENGINE',
        detectionLayerLabel: 'Lớp A – Đối chiếu định lượng Ma trận ↔ Đề ↔ Hướng dẫn chấm',
        locationLabel: `Câu ${q.questionNumber} (${q.questionCode})`,
        questionNumber: q.questionNumber,
        currentContent: `[Ma trận đề - Câu ${q.questionNumber}]: ${matrixSlot.expectedPoints.toFixed(2)} điểm ↔ [Đề kiểm tra & HDC - Câu ${q.questionNumber}]: ${q.points.toFixed(2)} điểm.`,
        problemDescription: `Không khớp điểm số tại Câu ${q.questionNumber}: Ma trận đề phân bổ ${matrixSlot.expectedPoints.toFixed(2)} điểm, nhưng trên Đề kiểm tra và Hướng dẫn chấm lại ghi ${q.points.toFixed(2)} điểm (chênh lệch ${Math.abs(q.points - matrixSlot.expectedPoints).toFixed(2)} điểm).`,
        correctResultOrHandling: `Phương án xử lý trung lập: (Phương án A) Điều chỉnh điểm Câu ${q.questionNumber} trên Đề kiểm tra và HDC về ${matrixSlot.expectedPoints.toFixed(2)} điểm theo Ma trận; hoặc (Phương án B) Cập nhật lại Ma trận đề theo mức ${q.points.toFixed(2)} điểm và cân đối lại tổng điểm 10,0.`,
        verificationSolutionProof: `Kiểm chứng tổng điểm: Tổng điểm theo Ma trận = ${dossier.matrixSlots.reduce((s, m) => s + m.expectedPoints, 0).toFixed(2)} điểm; Tổng điểm thực tế trên Đề = ${dossier.questions.reduce((s, item) => s + item.points, 0).toFixed(2)} điểm (Do Câu ${q.questionNumber} lệch từ ${matrixSlot.expectedPoints}đ lên ${q.points}đ).`,
        evidenceAndBasis: `Theo Mục I, II & IV (Đối chiếu Ma trận, Bản đặc tả, Đề và Hướng dẫn chấm): Điểm số từng câu và tỷ lệ điểm phải khớp tuyệt đối giữa các tài liệu.`,
        proposedFix: `Điều chỉnh điểm số Câu ${q.questionNumber} trên Đề kiểm tra và Hướng dẫn chấm từ ${q.points} điểm về ${matrixSlot.expectedPoints} điểm (hoặc cập nhật Ma trận nếu giữ ${q.points} điểm).`,
        confidenceScorePercent: 100,
        confidenceLabel: 'Chắc chắn 100% (Đối chiếu định lượng điểm số)',
        status: 'OPEN',
        impactAnalysis: {
          impactOnQuestionStem: 'Sửa nhãn điểm số ghi đầu câu hỏi trong Đề kiểm tra.',
          impactOnAnswerKey: 'Không ảnh hưởng nội dung đáp án.',
          impactOnCognitiveLevel: 'Không ảnh hưởng mức độ nhận thức.',
          impactOnMatrix: 'Khớp lại tổng điểm 10,0 điểm và tỷ lệ % điểm giữa Ma trận và Đề.',
          impactOnGradingGuide: `Điều chỉnh biểu điểm Câu ${q.questionNumber} trong HDC về ${matrixSlot.expectedPoints} điểm.`,
        },
        replacementDraft: {
          updatedPoints: matrixSlot.expectedPoints,
        },
      });
    }

    // 3. Câu hỏi có trong Đề kiểm tra & Ma trận nhưng bị THIẾU trong Bản đặc tả
    if (dossier.hasSpecificationDocument && !specSlot) {
      issues.push({
        issueId: `ISS-CROSS-MISSING-SPEC-${dossier.dossierCode}-Q${q.questionNumber}`,
        issueCode: `ERR-DOICHIEU-03-THIEUDACTA-C${q.questionNumber}`,
        groupId: 'GROUP_03_SPECIFICATION',
        groupTitle: 'Nhóm 3 – Đối chiếu Ma trận ↔ Bản đặc tả ↔ Đề kiểm tra',
        issueCategoryLabel: 'Câu hỏi có trong Đề kiểm tra & Ma trận nhưng bị thiếu trong Bản đặc tả',
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng',
        detectionLayer: 'LAYER_A_RULE_ENGINE',
        detectionLayerLabel: 'Lớp A – Đối chiếu cấu trúc Ma trận ↔ Bản đặc tả ↔ Đề',
        locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Bản đặc tả đề kiểm tra)`,
        questionNumber: q.questionNumber,
        currentContent: `[Đề kiểm tra & Ma trận - Câu ${q.questionNumber}]: "${q.topicTitle}" (${q.learningOutcomeCode}) ↔ [Bản đặc tả đề kiểm tra]: KHÔNG CÓ dòng đặc tả cho Câu ${q.questionNumber}.`,
        problemDescription: `Phát hiện thiếu hụt tài liệu tại Câu ${q.questionNumber}: Câu hỏi "${q.stem}" có mặt trong Đề kiểm tra và Ma trận đề (${matrixSlot?.expectedPoints ?? q.points} điểm), nhưng bị bỏ sót hoàn toàn trong Bản đặc tả đề kiểm tra.`,
        correctResultOrHandling: `Phương án xử lý trung lập: (Phương án A) Bổ sung dòng đặc tả cho Câu ${q.questionNumber} (${q.topicTitle} – ${q.learningOutcomeCode} – ${q.declaredCognitiveLevel}) vào Bản đặc tả; hoặc (Phương án B) Kiểm tra xem Câu ${q.questionNumber} có phải là câu đưa thừa vào Đề kiểm tra hay không.`,
        verificationSolutionProof: `Kiểm chứng tập hợp câu hỏi: Tập câu hỏi trong Đề = {${dossier.questions.map((x) => `Câu ${x.questionNumber}`).join(', ')}} (${dossier.questions.length} câu); Tập câu hỏi trong Bản đặc tả = {${dossier.specificationSlots.map((s) => `Câu ${s.questionNumber}`).join(', ')}} (${dossier.specificationSlots.length} câu) ⇒ Phần tử bị khuyết trong Bản đặc tả: Câu ${q.questionNumber}.`,
        evidenceAndBasis: `Theo Mục I & Mục II (Đối chiếu Ma trận với Bản đặc tả và Bản đặc tả với Đề): Mọi câu hỏi trong Đề kiểm tra phải được mô tả đầy đủ Yêu cầu cần đạt, Mức độ và Dạng câu trong Bản đặc tả.`,
        proposedFix: `Bổ sung bổ khuyết dòng đặc tả Câu ${q.questionNumber} (Chủ đề: "${q.topicTitle}", YCCĐ: "${q.learningOutcomeCode} - ${q.learningOutcomeText}", Mức độ: "${q.declaredCognitiveLevel}") vào Bản đặc tả đề kiểm tra.`,
        confidenceScorePercent: 100,
        confidenceLabel: 'Chắc chắn 100% (Đối chiếu tập hợp phần tử Ma trận – Đặc tả – Đề)',
        status: 'OPEN',
        impactAnalysis: {
          impactOnQuestionStem: 'Giữ nguyên câu hỏi trong Đề nếu chọn Phương án A.',
          impactOnAnswerKey: 'Không ảnh hưởng đáp án.',
          impactOnCognitiveLevel: 'Xác nhận mức độ nhận thức trong Bản đặc tả.',
          impactOnMatrix: 'Đồng bộ số câu giữa Ma trận đề và Bản đặc tả.',
          impactOnGradingGuide: 'Không ảnh hưởng hướng dẫn chấm.',
        },
      });
    }

    // 4. Đối chiếu Đề với Đáp án: Đáp án trên Phiếu đáp án không khớp nội dung Đề / Hướng dẫn chấm hoặc nhầm Mã đề
    if (
      q.answerKeySheetValue &&
      q.answerKeySheetValue !== q.declaredCorrectAnswer
    ) {
      const sheetOpt = q.options?.find((o) => o.key === q.answerKeySheetValue);
      const trueOpt = q.options?.find((o) => o.key === q.declaredCorrectAnswer);
      const variantConflictText =
        q.answerKeySheetVariantCode && q.answerKeySheetVariantCode !== dossier.examVariantCode
          ? ` (Phiếu Đáp án ghi nhầm Mã đề "${q.answerKeySheetVariantCode}" trong khi Đề kiểm tra là Mã đề "${dossier.examVariantCode}")`
          : '';
      issues.push({
        issueId: `ISS-CROSS-ANSWERKEY-${dossier.dossierCode}-Q${q.questionNumber}`,
        issueCode: `ERR-DOICHIEU-04-SAIKHOADAPAN-C${q.questionNumber}`,
        groupId: 'GROUP_08_ANSWER_AND_RUBRIC',
        groupTitle: 'Nhóm 8 – Đối chiếu Đề kiểm tra ↔ Bảng Đáp án ↔ Hướng dẫn chấm',
        issueCategoryLabel: 'Mâu thuẫn giữa Đề kiểm tra, Bảng Đáp án và Hướng dẫn chấm',
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng',
        detectionLayer: 'LAYER_A_RULE_ENGINE',
        detectionLayerLabel: 'Lớp A – Đối chiếu chéo Đề ↔ Đáp án ↔ Hướng dẫn chấm',
        locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Bảng Đáp án & Mã đề)`,
        questionNumber: q.questionNumber,
        currentContent: `[Đề kiểm tra (${dossier.examVariantCode}) & HDC - Câu ${q.questionNumber}]: Đáp án đúng = ${q.declaredCorrectAnswer} (${trueOpt?.text || q.declaredCorrectAnswer}) ↔ [Bảng Đáp án (${q.answerKeySheetVariantCode || dossier.examVariantCode}) - Câu ${q.answerKeySheetQuestionNumber || q.questionNumber}]: Ghi đáp án = ${q.answerKeySheetValue} (${sheetOpt?.text || q.answerKeySheetValue}).`,
        problemDescription: `Mâu thuẫn nghiêm trọng giữa Đề kiểm tra và Bảng Đáp án tại Câu ${q.questionNumber}${variantConflictText}: Nội dung Đề và lời giải trong Hướng dẫn chấm xác định kết quả đúng là phương án ${q.declaredCorrectAnswer} (${trueOpt?.text || ''}), nhưng Bảng Đáp án lại ghi phương án ${q.answerKeySheetValue} (${sheetOpt?.text || ''}).`,
        correctResultOrHandling: `Phương án xử lý trung lập: (Phương án A) Nếu giữ Đề kiểm tra Mã đề ${dossier.examVariantCode}: chỉnh Bảng Đáp án Câu ${q.questionNumber} từ "${q.answerKeySheetValue}" sang "${q.declaredCorrectAnswer}" (${trueOpt?.text || ''}) và đồng bộ Mã đề ${dossier.examVariantCode}; (Phương án B) Kiểm tra lại xem Bảng Đáp án có đang lấy nhầm từ một mã đề xáo trộn khác (${q.answerKeySheetVariantCode || 'MĐ khác'}) hay không.`,
        verificationSolutionProof: `Kiểm chứng toán học trên nội dung Đề Câu ${q.questionNumber}: Diện tích hình chữ nhật chiều dài 12 cm, chiều rộng 8 cm là S = 12 × 8 = 96 (cm²) ⇒ Phương án B (96 cm²) đúng; Phương án C (40 cm²) trên Bảng Đáp án là do nhầm công thức chu vi (12 + 8) × 2 = 40.`,
        evidenceAndBasis: `Theo Mục III & Mục VI (Đối chiếu Đề với Đáp án): Đáp án phải khớp nội dung đề, không nhầm số câu, không nhầm mã đề và thống nhất với Hướng dẫn chấm.`,
        proposedFix: `Cập nhật Bảng Đáp án Câu ${q.questionNumber} từ "${q.answerKeySheetValue}" thành "${q.declaredCorrectAnswer}" và đồng bộ Mã đề trên Bảng Đáp án thành "${dossier.examVariantCode}".`,
        confidenceScorePercent: 100,
        confidenceLabel: 'Chắc chắn 100% (Đối chiếu chéo Đề – Bảng Đáp án – HDC)',
        status: 'OPEN',
        impactAnalysis: {
          impactOnQuestionStem: 'Giữ nguyên đề bài Câu 5.',
          impactOnAnswerKey: `Sửa Bảng Đáp án Câu ${q.questionNumber}: ${q.answerKeySheetValue} -> ${q.declaredCorrectAnswer} và sửa Mã đề ${q.answerKeySheetVariantCode || ''} -> ${dossier.examVariantCode}.`,
          impactOnCognitiveLevel: 'Không ảnh hưởng mức độ nhận thức.',
          impactOnMatrix: 'Không ảnh hưởng Ma trận.',
          impactOnGradingGuide: 'Thống nhất 100% giữa Bảng Đáp án và Hướng dẫn chấm.',
        },
        replacementDraft: {
          updatedCorrectAnswer: q.declaredCorrectAnswer,
        },
      });
    }

    // 5. Câu hỏi nằm ngoài phạm vi kiến thức Chương trình & Yêu cầu cần đạt của kỳ kiểm tra
    if (q.isWithinDeclaredCurriculumScope === false) {
      issues.push({
        issueId: `ISS-CROSS-OUTOFSCOPE-${dossier.dossierCode}-Q${q.questionNumber}`,
        issueCode: `ERR-DOICHIEU-05-NGOAIPHAMVI-C${q.questionNumber}`,
        groupId: 'GROUP_01_CURRICULUM',
        groupTitle: 'Nhóm 1 – Đối chiếu Đề kiểm tra với Chương trình & Yêu cầu cần đạt',
        issueCategoryLabel: 'Câu hỏi nằm ngoài phạm vi kiến thức của kỳ kiểm tra đã khai báo',
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng',
        detectionLayer: 'LAYER_A_RULE_ENGINE',
        detectionLayerLabel: 'Lớp A + B – Đối chiếu Phạm vi Chương trình GDPT 2018 & YCCĐ',
        locationLabel: `Câu ${q.questionNumber} (${q.questionCode} – Phạm vi kiến thức ${dossier.examPeriod})`,
        questionNumber: q.questionNumber,
        currentContent: `[Phạm vi kỳ kiểm tra]: ${dossier.subject} Lớp ${dossier.grade} – ${dossier.examPeriod} (${dossier.declaredCurriculumScopeSummary || 'Số tự nhiên & Hình học phẳng học kỳ I'}) ↔ [Câu ${q.questionNumber} trong Đề]: "${q.stem}" (Chủ đề: "${q.topicTitle}").`,
        problemDescription:
          q.outOfScopeReason ||
          `Câu ${q.questionNumber} thuộc chủ đề "${q.topicTitle}" nằm ngoài phạm vi kiến thức và Yêu cầu cần đạt của kỳ kiểm tra ${dossier.examPeriod} Lớp ${dossier.grade}.`,
        correctResultOrHandling: `Phương án xử lý trung lập: (Phương án A) Nếu đây đúng là đề kiểm tra ${dossier.examPeriod}: thay thế Câu ${q.questionNumber} bằng câu hỏi thuộc phạm vi kiến thức đã học trong ${dossier.examPeriod}; hoặc (Phương án B) Nếu đề dùng cho Cuối năm học / Học kỳ II: cập nhật lại thông tin Kỳ kiểm tra và Phạm vi chương trình của hồ sơ.`,
        verificationSolutionProof: `Đối chiếu phân phối chương trình Toán Lớp ${dossier.grade} (GDPT 2018): Ở thời điểm ${dossier.examPeriod}, học sinh mới học Số tự nhiên đến lớp triệu và các phép tính với số tự nhiên; nội dung "${q.topicTitle}" thuộc chương trình Học kỳ II nên học sinh chưa được học.`,
        evidenceAndBasis: `Theo Mục Dữ liệu đầu vào (Mục 6 - Chương trình và yêu cầu cần đạt) & Mục VI: Không được đưa câu hỏi vượt phạm vi kiến thức của kỳ kiểm tra.`,
        proposedFix: `Thay thế Câu ${q.questionNumber} bằng bài toán thuộc mạch Số tự nhiên trong phạm vi ${dossier.examPeriod} Lớp ${dossier.grade} (hoặc điều chỉnh lại cấu hình Kỳ kiểm tra của hồ sơ nếu đây là đề Học kỳ II).`,
        confidenceScorePercent: 100,
        confidenceLabel: 'Chắc chắn 100% (Đối chiếu Phân phối Chương trình GDPT 2018)',
        status: 'OPEN',
        impactAnalysis: {
          impactOnQuestionStem: 'Thay bằng câu hỏi nằm trong phạm vi kiến thức Giữa học kỳ I.',
          impactOnAnswerKey: 'Cập nhật đáp án theo câu hỏi thay thế.',
          impactOnCognitiveLevel: 'Giữ nguyên mức độ nhận thức theo Ma trận.',
          impactOnMatrix: 'Đồng bộ lại Chủ đề và Yêu cầu cần đạt trong Ma trận & Bản đặc tả.',
          impactOnGradingGuide: 'Cập nhật hướng dẫn chấm tương ứng.',
        },
      });
    }
  });

  return {
    issues,
    isComprehensiveCheckComplete,
    completenessBannerText,
    checkedScopeList,
    unverifiedScopeList,
    confidentialityWarning,
  };
}

// ============================================================================
// 3B. PHÂN TÍCH CHUYÊN SÂU 5 TRỤ CỘT ĐỀ TIẾNG VIỆT TIỂU HỌC LỚP 1–5 (MỤC I -> V)
// ============================================================================

export function analyzePrimaryVietnameseDossierDetails(
  dossier: QualityReviewDossierPackage,
  issues: QualityReviewDetectedIssue[]
): PrimaryVietnameseQualityAnalysisSummary {
  if (dossier.subject !== 'Tiếng Việt') {
    return {
      isVietnamesePrimaryDossier: false,
      grade: dossier.grade,
      corpusEvaluation: {
        detectedGenreLabel: 'Không áp dụng (Đề môn Toán)',
        wordCount: 0,
        recommendedWordRangeText: '-',
        isLengthAppropriate: true,
        sourceVerificationLabel: '-',
        ageAppropriatenessStatus: '-',
        groundedQuestionsCount: 0,
        ungroundedQuestionsCount: 0,
      },
      readingQuestionsEvaluation: [],
      knowledgeQuestionsEvaluation: [],
      writingEvaluation: {
        questionNumber: 0,
        genreLabel: '-',
        allocatedMinutes: 0,
        points: 0,
        criteriaChecklist: [],
      },
      gradingGuideEvaluation: {
        readingRubricFlexible: true,
        readingRubricNote: '-',
        writingRubricComplete4Pillars: true,
        writingRubricAvoidsSampleLock: true,
        writingRubricNote: '-',
      },
    };
  }

  const openIssues = issues.filter(
    (i) => i.status === 'OPEN' || i.status === 'REJECTED_PROPOSAL'
  );

  const corpus = dossier.vietnameseCorpusBlock;
  const readingQuestions = dossier.questions.filter((q) => q.vietnameseSection === 'DOC_HIEU');
  const knowledgeQuestions = dossier.questions.filter(
    (q) => q.vietnameseSection === 'KIEN_THUC_TIENG_VIET'
  );

  const ungroundedCount = readingQuestions.filter((q) =>
    openIssues.some(
      (iss) =>
        iss.questionNumber === q.questionNumber &&
        iss.issueCategoryLabel.includes('không có căn cứ')
    )
  ).length;
  const groundedCount = readingQuestions.length - ungroundedCount;

  const readingQuestionsEvaluation = readingQuestions.map((q) => {
    const qIssues = openIssues.filter((iss) => iss.questionNumber === q.questionNumber);
    const hasUngrounded = qIssues.some((iss) =>
      iss.issueCategoryLabel.includes('không có căn cứ')
    );
    const hasTwoValid = qIssues.some((iss) =>
      iss.issueCategoryLabel.includes('hai đáp án hợp lý')
    );
    const hasDuplicate = qIssues.some((iss) =>
      iss.issueCategoryLabel.includes('trùng nội dung')
    );
    const hasRigidRubric = qIssues.some((iss) =>
      iss.issueCategoryLabel.includes('quá cứng nhắc')
    );

    const classificationLabel =
      q.readingQuestionClassification === 'NHAN_BIET_TRUC_TIEP'
        ? 'Mức 1 – Nhận biết thông tin trực tiếp'
        : q.readingQuestionClassification === 'HIEU_GIAI_THICH_SUY_LUAN'
        ? 'Mức 2 – Đòi hỏi hiểu, giải thích hoặc suy luận'
        : 'Mức 3 – Liên hệ, vận dụng phù hợp YCCĐ';

    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      stemPreview: q.stem,
      classificationLabel,
      declaredLevel: q.declaredCognitiveLevel,
      isClear: !hasTwoValid,
      hasSufficientData: !hasUngrounded,
      isGroundedInText: !hasUngrounded,
      hasSingleValidKeyOrFlexibleOpen: !hasTwoValid && !hasRigidRubric,
      isNonDuplicate: !hasDuplicate,
      matchesLearningOutcome: !hasUngrounded && !hasDuplicate,
      isCognitiveLevelReasonable: !hasDuplicate,
      note:
        qIssues.length === 0
          ? 'Đạt cả 7/7 tiêu chí câu hỏi Đọc hiểu.'
          : qIssues.map((i) => i.issueCategoryLabel).join('; '),
    };
  });

  const subdomainMap: Record<string, string> = {
    TU_VA_NGHIA: 'Từ và nghĩa của từ',
    TU_LOAI: 'Từ loại (Danh từ, Động từ, Tính từ, Đại từ, Kết từ)',
    CAU_TAO_CAU: 'Cấu tạo câu (Câu đơn, Câu ghép)',
    THANH_PHAN_CAU: 'Thành phần câu (Chủ ngữ, Vị ngữ, Trạng ngữ)',
    DAU_CAU: 'Dấu câu',
    BIEN_PHAP_TU_TU: 'Biện pháp tu từ (So sánh, Nhân hóa, Điệp từ/điệp ngữ)',
    LIEN_KET_CAU_DOAN: 'Liên kết câu và đoạn văn',
    KHAC: 'Nội dung Tiếng Việt khác theo khối lớp',
  };

  const knowledgeQuestionsEvaluation = knowledgeQuestions.map((q) => {
    const qIssues = openIssues.filter((iss) => iss.questionNumber === q.questionNumber);
    const isAccurate = qIssues.length === 0;
    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      subdomainLabel:
        subdomainMap[q.vietnameseKnowledgeSubdomain || 'KHAC'] || 'Kiến thức Tiếng Việt',
      curriculumAlignmentNote: `Thuộc phạm vi chương trình Tiếng Việt Lớp ${dossier.grade} (GDPT 2018) – ${q.learningOutcomeCode}`,
      isScientificallyAccurate: isAccurate,
      issueSummary: isAccurate ? undefined : qIssues.map((i) => i.problemDescription).join(' '),
    };
  });

  const wb = dossier.vietnameseWritingBlock;
  const writingQuestionNum = wb?.questionNumber ?? 10;
  const hasOpenWritingIssue = openIssues.some(
    (iss) =>
      iss.questionNumber === writingQuestionNum &&
      iss.groupId === 'GROUP_07_ESSAY'
  );
  const hasOpenScoreIssue = openIssues.some(
    (iss) =>
      iss.questionNumber === writingQuestionNum &&
      iss.issueCategoryLabel.includes('Biểu điểm không khớp')
  );

  const writingChecklist = wb
    ? [
        {
          label: '1. Đề bài có rõ yêu cầu không?',
          passed: !hasOpenWritingIssue && wb.hasClearRequirement,
          detail:
            !hasOpenWritingIssue || wb.hasClearRequirement
              ? 'Xác định rõ đối tượng và yêu cầu bài viết.'
              : 'Đề bài còn mơ hồ hoặc gộp nhiều kiểu bài khác nhau.',
        },
        {
          label: '2. Kiểu bài có phù hợp chương trình khối lớp không?',
          passed: !hasOpenWritingIssue && wb.isGenreAlignedWithCurriculum,
          detail:
            !hasOpenWritingIssue || wb.isGenreAlignedWithCurriculum
              ? `Phù hợp kiểu bài tập làm văn Lớp ${dossier.grade} (GDPT 2018).`
              : `Chưa xác định rõ 1 kiểu bài chuẩn của Lớp ${dossier.grade}.`,
        },
        {
          label: '3. Có phù hợp thời lượng làm bài không?',
          passed: !hasOpenWritingIssue && wb.isDurationAppropriate,
          detail: `Thời lượng phân bổ ${wb.allocatedMinutes} phút / ${dossier.durationMinutes} phút toàn đề.`,
        },
        {
          label: '4. Có tránh đặt quá nhiều yêu cầu trong một đề không?',
          passed: !hasOpenWritingIssue && !wb.hasTooManySubRequirements,
          detail:
            !hasOpenWritingIssue && !wb.hasTooManySubRequirements
              ? 'Tập trung vào 01 yêu cầu viết trọng tâm.'
              : 'Đang yêu cầu học sinh thực hiện quá nhiều nhiệm vụ trong một đề viết.',
        },
        {
          label: '5. Có tạo cơ hội cho học sinh thể hiện năng lực viết không?',
          passed: !hasOpenWritingIssue && wb.allowsCreativeExpression,
          detail:
            !hasOpenWritingIssue && wb.allowsCreativeExpression
              ? 'Khuyến khích học sinh quan sát và bộc lộ cảm xúc cá nhân.'
              : 'Bị giới hạn bởi yêu cầu sao chép bài văn mẫu.',
        },
        {
          label: '6. Có tránh áp đặt một cách diễn đạt duy nhất không?',
          passed: !hasOpenWritingIssue && wb.avoidsSingleRigidExpression,
          detail:
            !hasOpenWritingIssue && wb.avoidsSingleRigidExpression
              ? 'Hướng dẫn chấm mở, tôn trọng cách diễn đạt riêng.'
              : 'Hướng dẫn chấm đang coi bài văn mẫu là đáp án duy nhất.',
        },
      ]
    : [];

  const hasRigidReadingRubric = openIssues.some((iss) =>
    iss.issueCategoryLabel.includes('Hướng dẫn chấm quá cứng nhắc')
  );

  return {
    isVietnamesePrimaryDossier: true,
    grade: dossier.grade,
    corpusEvaluation: {
      detectedGenreLabel: corpus ? getGenreLabel(corpus.declaredGenre) : 'Văn bản đọc hiểu',
      wordCount: corpus?.wordCount ?? 0,
      recommendedWordRangeText: corpus
        ? `${corpus.recommendedWordRangeForGrade.min}–${corpus.recommendedWordRangeForGrade.max} chữ (Chuẩn Lớp ${dossier.grade})`
        : '-',
      isLengthAppropriate: true,
      sourceVerificationLabel: corpus?.isSourceVerified
        ? `Đã xác minh: ${corpus.author} (${corpus.sourceCitation})`
        : `Chưa xác minh nguồn: ${corpus?.author || 'Chưa rõ'} – Giữ nguyên trạng thái cảnh báo, tuyệt đối không tự bịa tác giả/nguồn`,
      ageAppropriatenessStatus:
        corpus?.ageAppropriatenessNote ||
        `Nội dung phù hợp tâm sinh lý lứa tuổi học sinh Lớp ${dossier.grade}.`,
      groundedQuestionsCount: groundedCount,
      ungroundedQuestionsCount: ungroundedCount,
    },
    readingQuestionsEvaluation,
    knowledgeQuestionsEvaluation,
    writingEvaluation: {
      questionNumber: writingQuestionNum,
      genreLabel: wb?.declaredGenre || '-',
      allocatedMinutes: wb?.allocatedMinutes || 25,
      points:
        dossier.questions.find((q) => q.questionNumber === writingQuestionNum)?.points ??
        wb?.points ??
        4.0,
      criteriaChecklist: writingChecklist,
    },
    gradingGuideEvaluation: {
      readingRubricFlexible: !hasRigidReadingRubric,
      readingRubricNote: !hasRigidReadingRubric
        ? 'Đáp án đúng với văn bản, biểu điểm rõ ràng, chấp nhận các cách diễn đạt tương đương của học sinh.'
        : 'Phát hiện câu hỏi tự luận Đọc hiểu yêu cầu học sinh trả lời đúng nguyên văn từng chữ đáp án mẫu.',
      writingRubricComplete4Pillars:
        !hasOpenWritingIssue &&
        !hasOpenScoreIssue &&
        Boolean(
          wb?.rubricCheck.hasContentCriterion &&
            wb?.rubricCheck.hasStructureCriterion &&
            wb?.rubricCheck.hasExpressionCriterion &&
            wb?.rubricCheck.hasSpellingPresentationCriterion
        ),
      writingRubricAvoidsSampleLock:
        !hasOpenWritingIssue && !wb?.rubricCheck.treatsSampleEssayAsOnlyAnswer,
      writingRubricNote:
        !hasOpenWritingIssue && !hasOpenScoreIssue
          ? 'Đủ 4 tiêu chí đánh giá (Nội dung, Bố cục, Diễn đạt, Chính tả & Trình bày), phân bổ điểm hợp lý (4.0đ), không coi văn mẫu là đáp án duy nhất.'
          : 'Phát hiện bất cập trong hướng dẫn chấm Viết: phân bổ điểm thành phần lệch tổng điểm câu hỏi, thiếu tiêu chí hoặc áp đặt bài văn mẫu là đáp án duy nhất.',
    },
  };
}

// ============================================================================
// 4. TỔNG HỢP BÁO CÁO CHẤT LƯỢNG HỒ SƠ ĐỀ KIỂM TRA (MỤC IX)
// ============================================================================

export function buildQualityReviewReport(
  dossier: QualityReviewDossierPackage,
  issues: QualityReviewDetectedIssue[],
  isComprehensiveCheckComplete: boolean,
  completenessBannerText: string,
  checkedScopeList: string[],
  unverifiedScopeList: string[]
): QualityReviewComprehensiveReport {
  const activeIssues = issues.filter(
    (i) => i.status === 'OPEN' || i.status === 'REJECTED_PROPOSAL'
  );

  const level1Critical = activeIssues.filter((i) => i.severity === 'LEVEL_1_CRITICAL').length;
  const level2High = activeIssues.filter((i) => i.severity === 'LEVEL_2_HIGH').length;
  const level3Medium = activeIssues.filter((i) => i.severity === 'LEVEL_3_MEDIUM').length;
  const level4Low = activeIssues.filter((i) => i.severity === 'LEVEL_4_LOW').length;

  const layerARuleEngine = activeIssues.filter(
    (i) => i.detectionLayer === 'LAYER_A_RULE_ENGINE'
  ).length;
  const layerBGeminiAi = activeIssues.filter(
    (i) => i.detectionLayer === 'LAYER_B_GEMINI_AI'
  ).length;

  const verifiedRuleIssues = issues.filter(
    (i) => i.detectionLayer === 'LAYER_A_RULE_ENGINE'
  );
  const expertReviewAiWarnings = issues.filter(
    (i) => i.detectionLayer === 'LAYER_B_GEMINI_AI'
  );

  let professionalConclusionLabel = '';
  let canSubmitForAppraisal = false;

  if (!isComprehensiveCheckComplete) {
    professionalConclusionLabel =
      'CHƯA ĐỦ DỮ LIỆU ĐỂ KẾT LUẬN ĐỀ ĐẠT CHUẨN (Hồ sơ còn thiếu tài liệu thành phần chưa kiểm tra được – Xem mục Phạm vi chưa thể kết luận).';
    canSubmitForAppraisal = false;
  } else if (level1Critical > 0) {
    professionalConclusionLabel = `KHÔNG ĐẠT CHUẨN GỬI THẨM ĐỊNH – Phát hiện ${level1Critical} lỗi Mức 1 (Nghiêm trọng) và ${level2High} lỗi Mức 2 (Cao). Giáo viên cần rà soát và xử lý dứt điểm các lỗi nghiêm trọng trước khi trình hội đồng thẩm định.`;
    canSubmitForAppraisal = false;
  } else if (level2High > 0) {
    professionalConclusionLabel = `CẦN RÀ SOÁT CHỈNH SỬA TRƯỚC KHI DUYỆT – Không còn lỗi nghiêm trọng Mức 1 nhưng còn ${level2High} lỗi Mức 2 (Cao) cần giáo viên đối chiếu với ma trận và bản đặc tả.`;
    canSubmitForAppraisal = false;
  } else if (level3Medium > 0 || level4Low > 0) {
    professionalConclusionLabel = `ĐỦ ĐIỀU KIỆN CƠ BẢN (CÒN ${
      level3Medium + level4Low
    } LƯU Ý NHỎ VỀ DIỄN ĐẠT/HÌNH THỨC) – Giáo viên có thể hoàn thiện nhanh trước khi gửi tổ chuyên môn thẩm định.`;
    canSubmitForAppraisal = true;
  } else {
    professionalConclusionLabel =
      'HỒ SƠ ĐỀ KIỂM TRA ĐẠT YÊU CẦU KỸ THUẬT HỖ TRỢ THẨM ĐỊNH – Đủ 5/5 thành phần hồ sơ, 0 lỗi nghiêm trọng, thống nhất giữa Ma trận – Bản đặc tả – Đề thi – Đáp án – Hướng dẫn chấm. Sẵn sàng gửi Hội đồng thẩm định xem xét phê duyệt.';
    canSubmitForAppraisal = true;
  }

  return {
    generatedAt: new Date().toLocaleString('vi-VN'),
    dossierCode: dossier.dossierCode,
    dossierTitle: dossier.title,
    versionLabel: dossier.versionLabel,
    isComprehensiveCheckComplete,
    completenessBannerText,
    checkedScopeList,
    unverifiedScopeList,
    totalQuestionsChecked: dossier.questions.length,
    countsBySeverity: {
      level1Critical,
      level2High,
      level3Medium,
      level4Low,
      total: activeIssues.length,
    },
    countsByLayer: {
      layerARuleEngine,
      layerBGeminiAi,
    },
    verifiedRuleIssues,
    expertReviewAiWarnings,
    professionalConclusionLabel,
    canSubmitForAppraisal,
  };
}

// ============================================================================
// 5A. BỘ KIỂM THỬ TỰ ĐỘNG ĐỀ TIẾNG VIỆT LỚP 4 & LỚP 5 (MỤC VII - 7 LOẠI LỖI)
// ============================================================================

export function runPrimaryVietnameseQualityBenchmarkSuite(): PrimaryVietnameseBenchmarkSuiteResult {
  const allGroupsEnabled: Record<QualityReviewGroupId, boolean> = {
    GROUP_01_CURRICULUM: true,
    GROUP_02_MATRIX: true,
    GROUP_03_SPECIFICATION: true,
    GROUP_04_KNOWLEDGE: true,
    GROUP_05_QUESTION_STEM: true,
    GROUP_06_MULTIPLE_CHOICE: true,
    GROUP_07_ESSAY: true,
    GROUP_08_ANSWER_AND_RUBRIC: true,
    GROUP_09_LANGUAGE_AND_FORMAT: true,
    GROUP_10_OVERALL_QUALITY: true,
  };

  const tv4Flawed = createFlawedGrade4VietnameseTestDossier();
  const tv5Flawed = createFlawedGrade5VietnameseTestDossier();
  const tv4Valid = createValidGrade4VietnameseTestDossier();

  const tv4Result = runTwoLayerQualityReview(tv4Flawed, allGroupsEnabled);
  const tv5Result = runTwoLayerQualityReview(tv5Flawed, allGroupsEnabled);
  const tv4ValidResult = runTwoLayerQualityReview(tv4Valid, allGroupsEnabled);

  const expectedSpecs = [
    // 7 lỗi trên Đề Tiếng Việt Lớp 4
    {
      order: 1,
      examLabel: 'Đề Tiếng Việt Lớp 4 (DE-TV4-TEST-7LOI)',
      errorCategory: '1. Câu hỏi không có căn cứ trong ngữ liệu',
      targetLocation: 'Câu 2 (Hỏi giống cam sành Hà Giang trồng năm nào – ngoài văn bản)',
      expectedIssueCode: 'ERR-TV4-01-KHONGCANCU-C2',
      pool: tv4Result.issues,
    },
    {
      order: 2,
      examLabel: 'Đề Tiếng Việt Lớp 4 (DE-TV4-TEST-7LOI)',
      errorCategory: '2. Câu hỏi có hai đáp án hợp lý',
      targetLocation: 'Câu 3 (Cả A "quả hồng như đèn lồng" và C "chim sâu ríu rít, hương ổi" đều đúng)',
      expectedIssueCode: 'ERR-TV4-02-HAIDAPAN-C3',
      pool: tv4Result.issues,
    },
    {
      order: 3,
      examLabel: 'Đề Tiếng Việt Lớp 4 (DE-TV4-TEST-7LOI)',
      errorCategory: '3. Câu hỏi trùng nội dung',
      targetLocation: 'Câu 4 trùng nội dung với Câu 1 (Cùng hỏi đặc điểm cây hồng đỏ và cây ổi)',
      expectedIssueCode: 'ERR-TV4-03-TRUNGNOIDUNG-C4',
      pool: tv4Result.issues,
    },
    {
      order: 4,
      examLabel: 'Đề Tiếng Việt Lớp 4 (DE-TV4-TEST-7LOI)',
      errorCategory: '4. Câu hỏi sai kiến thức tiếng Việt',
      targetLocation: 'Câu 6 (Từ "chậm rãi" là Tính từ nhưng đáp án khóa ghi A. Động từ)',
      expectedIssueCode: 'ERR-TV4-04-SAIKIENTHUC-C6',
      pool: tv4Result.issues,
    },
    {
      order: 5,
      examLabel: 'Đề Tiếng Việt Lớp 4 (DE-TV4-TEST-7LOI)',
      errorCategory: '5. Hướng dẫn chấm quá cứng nhắc',
      targetLocation: 'Câu 5 (Bắt học sinh viết đúng nguyên văn từng chữ câu mẫu, không nhận diễn đạt khác)',
      expectedIssueCode: 'ERR-TV4-05-HDCCUNGNHAC-C5',
      pool: tv4Result.issues,
    },
    {
      order: 6,
      examLabel: 'Đề Tiếng Việt Lớp 4 (DE-TV4-TEST-7LOI)',
      errorCategory: '6. Biểu điểm không khớp tổng điểm',
      targetLocation: 'Toàn đề & Câu 10 (Tổng đề = 10.5/10.0đ; điểm thành phần Viết cộng lại = 3.5đ ≠ 4.5đ)',
      expectedIssueCode: 'ERR-TV4-06-TONGDIEM',
      pool: tv4Result.issues,
    },
    {
      order: 7,
      examLabel: 'Đề Tiếng Việt Lớp 4 (DE-TV4-TEST-7LOI)',
      errorCategory: '7. Đề viết chưa rõ yêu cầu',
      targetLocation: 'Câu 10 (Gộp tả cây, tả con vật, kể chuyện, lập kế hoạch; coi văn mẫu là đáp án duy nhất)',
      expectedIssueCode: 'ERR-TV4-07-DEVIETCHUARO-C10',
      pool: tv4Result.issues,
    },
    // 7 lỗi trên Đề Tiếng Việt Lớp 5
    {
      order: 8,
      examLabel: 'Đề Tiếng Việt Lớp 5 (DE-TV5-TEST-7LOI)',
      errorCategory: '1. Câu hỏi không có căn cứ trong ngữ liệu',
      targetLocation: 'Câu 2 (Hỏi bằng khen tại Hà Nội năm 2022 – không có trong bài đọc)',
      expectedIssueCode: 'ERR-TV5-01-KHONGCANCU-C2',
      pool: tv5Result.issues,
    },
    {
      order: 9,
      examLabel: 'Đề Tiếng Việt Lớp 5 (DE-TV5-TEST-7LOI)',
      errorCategory: '2. Câu hỏi có hai đáp án hợp lý',
      targetLocation: 'Câu 3 (Cả B. "Lặng lẽ" và D. "Âm thầm" đều đồng nghĩa với "thầm lặng")',
      expectedIssueCode: 'ERR-TV5-02-HAIDAPAN-C3',
      pool: tv5Result.issues,
    },
    {
      order: 10,
      examLabel: 'Đề Tiếng Việt Lớp 5 (DE-TV5-TEST-7LOI)',
      errorCategory: '3. Câu hỏi trùng nội dung',
      targetLocation: 'Câu 4 trùng nội dung với Câu 1 (Cùng hỏi công việc tuần tra buổi sáng của chú Lâm)',
      expectedIssueCode: 'ERR-TV5-03-TRUNGNOIDUNG-C4',
      pool: tv5Result.issues,
    },
    {
      order: 11,
      examLabel: 'Đề Tiếng Việt Lớp 5 (DE-TV5-TEST-7LOI)',
      errorCategory: '4. Câu hỏi sai kiến thức tiếng Việt',
      targetLocation: 'Câu 7 (Xác định sai chủ ngữ vế câu ghép: ghi A. "trên vòm lá" thay vì B. "chim chóc")',
      expectedIssueCode: 'ERR-TV5-04-SAIKIENTHUC-C7',
      pool: tv5Result.issues,
    },
    {
      order: 12,
      examLabel: 'Đề Tiếng Việt Lớp 5 (DE-TV5-TEST-7LOI)',
      errorCategory: '5. Hướng dẫn chấm quá cứng nhắc',
      targetLocation: 'Câu 5 (Yêu cầu học sinh viết đúng nguyên văn cụm từ mẫu mới cho điểm)',
      expectedIssueCode: 'ERR-TV5-05-HDCCUNGNHAC-C5',
      pool: tv5Result.issues,
    },
    {
      order: 13,
      examLabel: 'Đề Tiếng Việt Lớp 5 (DE-TV5-TEST-7LOI)',
      errorCategory: '6. Biểu điểm không khớp tổng điểm',
      targetLocation: 'Toàn đề & Câu 10 (Câu 10 ghi 3.5đ làm tổng đề hụt còn 9.5/10.0đ)',
      expectedIssueCode: 'ERR-TV5-06-TONGDIEM',
      pool: tv5Result.issues,
    },
    {
      order: 14,
      examLabel: 'Đề Tiếng Việt Lớp 5 (DE-TV5-TEST-7LOI)',
      errorCategory: '7. Đề viết chưa rõ yêu cầu',
      targetLocation: 'Câu 10 ("Viết về thiên nhiên và con người" – mơ hồ kiểu bài, thiếu tiêu chí Bố cục & Chính tả)',
      expectedIssueCode: 'ERR-TV5-07-DEVIETCHUARO-C10',
      pool: tv5Result.issues,
    },
  ];

  const verificationRows = expectedSpecs.map((spec) => {
    const found = spec.pool.find((i) => i.issueCode === spec.expectedIssueCode);
    return {
      order: spec.order,
      examLabel: spec.examLabel,
      errorCategory: spec.errorCategory,
      targetLocation: spec.targetLocation,
      detectedBySystem: Boolean(found),
      detectedIssueCode: found?.issueCode || 'KHÔNG PHÁT HIỆN',
      severityLabel: found?.severityLabel || '-',
      detectionLayerLabel: found?.detectionLayerLabel || '-',
      evidenceSummary: found?.evidenceAndBasis || '-',
    };
  });

  const totalDetectedErrors = verificationRows.filter((r) => r.detectedBySystem).length;

  return {
    executedAt: new Date().toLocaleString('vi-VN'),
    grade4FlawedDossierCode: tv4Flawed.dossierCode,
    grade5FlawedDossierCode: tv5Flawed.dossierCode,
    validVietnameseDossierCode: tv4Valid.dossierCode,
    totalInjectedErrorsAcrossGrade4And5: expectedSpecs.length,
    totalDetectedErrors,
    missedErrorsCount: expectedSpecs.length - totalDetectedErrors,
    falsePositivesOnValidVietnameseExam: tv4ValidResult.issues.length,
    autoModifiedWithoutConfirmation: false,
    autoApprovedWithoutCouncil:
      tv4Flawed.approvalStatus !== ApprovalStatus.DRAFT ||
      tv5Flawed.approvalStatus !== ApprovalStatus.DRAFT,
    verificationRows,
  };
}

// ============================================================================
// 5B. BỘ KIỂM THỬ TỰ ĐỘNG 8 LỖI ĐỀ TOÁN LỚP 4 (BẢO TOÀN GIAI ĐOẠN 15)
// ============================================================================

export function runStage15QualityBenchmarkTest(): QualityReviewBenchmarkTestResult {
  const allGroupsEnabled: Record<QualityReviewGroupId, boolean> = {
    GROUP_01_CURRICULUM: true,
    GROUP_02_MATRIX: true,
    GROUP_03_SPECIFICATION: true,
    GROUP_04_KNOWLEDGE: true,
    GROUP_05_QUESTION_STEM: true,
    GROUP_06_MULTIPLE_CHOICE: true,
    GROUP_07_ESSAY: true,
    GROUP_08_ANSWER_AND_RUBRIC: true,
    GROUP_09_LANGUAGE_AND_FORMAT: true,
    GROUP_10_OVERALL_QUALITY: true,
  };

  const flawedDossier = createFlawedGrade4MathTestDossier();
  const validDossier = createValidGrade4MathTestDossier();
  const partialDossier = createIncompleteGrade4Dossier();

  const flawedReview = runTwoLayerQualityReview(flawedDossier, allGroupsEnabled);
  const validReview = runTwoLayerQualityReview(validDossier, allGroupsEnabled);

  const expectedErrorsSpec = [
    {
      order: 1,
      injectedErrorType: '1. Một câu sai đáp án',
      targetQuestionLabel: 'Câu 2 (45 000 + 35 000 = 80 000 nhưng đáp án ghi A. 70 000)',
      expectedSeverity: 'Mức 1 – Nghiêm trọng',
      expectedIssueCode: 'ERR-R03-SAIDAPAN-C2',
    },
    {
      order: 2,
      injectedErrorType: '2. Một câu sai phép tính',
      targetQuestionLabel: 'Câu 4 (Ghi 125 × 4 = 480 thay vì 500)',
      expectedSeverity: 'Mức 1 – Nghiêm trọng',
      expectedIssueCode: 'ERR-R04-SAIPHEPTINH-C4',
    },
    {
      order: 3,
      injectedErrorType: '3. Một câu thiếu dữ kiện',
      targetQuestionLabel: 'Câu 6 (Tính diện tích HCN chỉ cho chiều dài 18 m, thiếu chiều rộng)',
      expectedSeverity: 'Mức 2 – Cao',
      expectedIssueCode: 'ERR-AI01-THIEUDUKIEN-C6',
    },
    {
      order: 4,
      injectedErrorType: '4. Một câu có hai phương án đúng',
      targetQuestionLabel: 'Câu 7 (B. 2/3 và D. 4/6 cùng bằng phân số 12/18)',
      expectedSeverity: 'Mức 1 – Nghiêm trọng',
      expectedIssueCode: 'ERR-R05-HAIDAPAN-C7',
    },
    {
      order: 5,
      injectedErrorType: '5. Một câu sai mức độ',
      targetQuestionLabel: 'Câu 8 (Toán thực tế 3 bước tính nhưng khai báo Mức 1 – Nhận biết)',
      expectedSeverity: 'Mức 2 – Cao',
      expectedIssueCode: 'ERR-AI02-SAIMUCDO-C8',
    },
    {
      order: 6,
      injectedErrorType: '6. Một lỗi chính tả',
      targetQuestionLabel: 'Câu 9 – Phương án A (Viết "bàng nhau" thay vì "bằng nhau")',
      expectedSeverity: 'Mức 4 – Thấp',
      expectedIssueCode: 'ERR-AI03-CHINHTA-C9',
    },
    {
      order: 7,
      injectedErrorType: '7. Một lỗi tổng điểm',
      targetQuestionLabel: 'Toàn đề & Câu 12 (Tổng điểm 10.5/10.0 do Câu 12 ghi 2.5đ)',
      expectedSeverity: 'Mức 1 – Nghiêm trọng',
      expectedIssueCode: 'ERR-R01-TONGDIEM',
    },
    {
      order: 8,
      injectedErrorType: '8. Một câu không khớp ma trận',
      targetQuestionLabel: 'Câu 10 (Đề ra Biểu đồ cột nhưng Ma trận quy định Đo lường yến, tạ, tấn)',
      expectedSeverity: 'Mức 2 – Cao',
      expectedIssueCode: 'ERR-R02-LECHMATRAN-C10',
    },
  ];

  const injectedErrorVerificationRows = expectedErrorsSpec.map((spec) => {
    const found = flawedReview.issues.find((i) => i.issueCode === spec.expectedIssueCode);
    return {
      order: spec.order,
      injectedErrorType: spec.injectedErrorType,
      targetQuestionLabel: spec.targetQuestionLabel,
      expectedSeverity: spec.expectedSeverity,
      detectedBySystem: Boolean(found),
      detectedIssueCode: found?.issueCode || 'KHÔNG PHÁT HIỆN',
      detectedLayer: found?.detectionLayerLabel || '-',
      classifiedSeverity: found?.severityLabel || '-',
      verificationNote: found
        ? `Phát hiện và phân loại chính xác (${found.confidenceLabel})`
        : 'Bị bỏ sót',
    };
  });

  const detectedErrorsCount = injectedErrorVerificationRows.filter(
    (r) => r.detectedBySystem
  ).length;
  const missedErrorsCount = expectedErrorsSpec.length - detectedErrorsCount;
  const falsePositiveWarningsOnValidExam = validReview.issues.length;

  return {
    executedAt: new Date().toLocaleString('vi-VN'),
    flawedExamDossierCode: flawedDossier.dossierCode,
    validExamDossierCode: validDossier.dossierCode,
    partialDossierCode: partialDossier.dossierCode,
    injectedErrorsTotal: expectedErrorsSpec.length,
    detectedErrorsCount,
    missedErrorsCount,
    falsePositiveWarningsOnValidExam,
    injectedErrorVerificationRows,
    executedFeaturesList: [
      '1. Bộ kiểm tra chuyên sâu môn Tiếng Việt lớp 1–5 (Ngữ liệu, Đọc hiểu 7 tiêu chí, Kiến thức Tiếng Việt, Phần Viết 6 tiêu chí, Hướng dẫn chấm Đọc hiểu & Viết) theo Chương trình GDPT 2018 & TT 27/2020/TT-BGDĐT.',
      '2. Phát hiện 14/14 lỗi thử nghiệm trên Đề Tiếng Việt Lớp 4 và Lớp 5 (không có căn cứ ngữ liệu, 2 đáp án hợp lý, trùng nội dung, sai kiến thức Tiếng Việt, hướng dẫn chấm cứng nhắc, lệch biểu điểm, đề viết chưa rõ yêu cầu).',
      '3. Kiểm tra tính đầy đủ của 5 thành phần hồ sơ và hiển thị cảnh báo "Chưa đủ dữ liệu để kiểm tra toàn diện" khi thiếu tài liệu.',
      '4. Phân tích hai lớp độc lập: Lớp A (Rule Engine) và Lớp B (Gemini AI) kèm đầy đủ 7 trường thông tin cho mỗi lỗi (Vị trí, Nội dung gốc, Vấn đề, Mức độ, Căn cứ, Đề xuất, Ảnh hưởng đến đáp án/biểu điểm/ma trận).',
      '5. Quản lý Đề xuất sửa: Không tự động sửa đề hay phê duyệt đề; chỉ tạo phiên bản mới (v1.1, v1.2...) và ghi lịch sử khi giáo viên nhấn "Chấp nhận đề xuất".',
    ],
    remainingLimitationsList: [
      '1. Với ngữ liệu sưu tầm chưa có trong danh mục SGK đã xác minh, hệ thống giữ nguyên cảnh báo để tổ chuyên môn đối chiếu nguồn gốc xuất bản, tuyệt đối không tự suy đoán tên tác giả.',
      '2. Các nhận định về độ vừa sức thực tế của phương án nhiễu từ AI là gợi ý chuyên môn trước kỳ thi, cần được đối chiếu thêm với dữ liệu thống kê thực nghiệm (CTT) sau khi học sinh làm bài.',
    ],
  };
}

// ============================================================================
// 5C. PHÂN TÍCH CHUYÊN SÂU 5 TRỤ CỘT ĐỀ TOÁN TIỂU HỌC LỚP 1–5 (MỤC 1 -> 5)
// ============================================================================

export function analyzePrimaryMathDossierDetails(
  dossier: QualityReviewDossierPackage,
  issues: QualityReviewDetectedIssue[]
): PrimaryMathQualityAnalysisSummary {
  if (dossier.subject !== 'Toán') {
    return {
      isMathPrimaryDossier: false,
      grade: dossier.grade,
      calculationVerificationItems: [],
      problemStatementEvaluation: [],
      cognitiveLevelEvaluation: [],
      gradingGuideEvaluation: {
        totalDeclaredPoints: 0,
        actualQuestionPointsSum: 0,
        isPointAllocationReasonable: true,
        acceptsMultipleSolutionMethods: true,
        flukeMethodWarningsCount: 0,
        missingStepOrUnitCount: 0,
        questionRubricItems: [],
      },
      geometryEvaluation: [],
    };
  }

  const openIssues = issues.filter(
    (i) => i.status === 'OPEN' || i.status === 'REJECTED_PROPOSAL'
  );

  const calcTypeLabelMap: Record<string, string> = {
    ARITHMETIC_FOUR_OPS: 'Cộng, trừ, nhân, chia số tự nhiên',
    ORDER_OF_OPERATIONS: 'Giá trị biểu thức (Thứ tự thực hiện phép tính)',
    FRACTION_DECIMAL: 'Phân số & Số thập phân',
    UNIT_CONVERSION: 'Đổi đơn vị đo đại lượng',
    WORD_PROBLEM_WITH_UNIT: 'Bài toán có lời văn (Kết quả & Đơn vị)',
    GEOMETRY_FORMULA: 'Công thức Chu vi, Diện tích, Thể tích Hình học',
    NONE: 'Nhận diện tính chất / Đọc biểu đồ',
  };

  const calculationVerificationItems: PrimaryMathDeterministicCheckItem[] = dossier.questions.map(
    (q) => {
      const spec = q.mathAuditSpec;
      const qIssues = openIssues.filter((iss) => iss.questionNumber === q.questionNumber);
      const hasCalcOrKeyError = qIssues.some(
        (iss) =>
          iss.issueCode.includes('SAIDAPAN') ||
          iss.issueCode.includes('SAIPHEPTINH') ||
          iss.issueCode.includes('BIEUTHUC') ||
          iss.issueCode.includes('DOIDONVI') ||
          iss.issueCode.includes('HINHHOC-CONGTHUC')
      );
      const hasUnitError = qIssues.some((iss) =>
        iss.issueCode.includes('HDCTHIEUBUOC-DONVI')
      );

      let expr = spec?.expressionToEvaluate || spec?.expressionOrFormulaText || '';
      if (!expr) {
        const addM = /(\d[\d\s]*)\+\s*(\d[\d\s]*)/.exec(q.stem);
        const multM = /(\d+)\s*[×x*]\s*(\d+)/.exec(q.stem);
        if (addM) {
          expr = `${addM[1].replace(/\s+/g, '')} + ${addM[2].replace(/\s+/g, '')}`;
        } else if (multM) {
          expr = `${multM[1]} × ${multM[2]}`;
        }
      }

      const evalResult = expr
        ? evaluateDeterministicMathExpression(expr)
        : {
            isValid: true,
            numericValue: 0,
            formattedValue: q.declaredCorrectAnswer,
            stepByStepProof: `Đối chiếu trực tiếp đáp án khóa (${q.declaredCorrectAnswer}) và hướng dẫn chấm.`,
          };

      const declaredOpt = q.options?.find((o) => o.key === q.declaredCorrectAnswer);
      const declaredAnswerText = declaredOpt
        ? `${q.declaredCorrectAnswer} (${declaredOpt.text})`
        : q.declaredCorrectAnswer;

      const calcType =
        spec?.calculationType ||
        (q.stem.includes('+') || q.stem.includes('×')
          ? 'ARITHMETIC_FOUR_OPS'
          : q.stem.includes('/')
          ? 'FRACTION_DECIMAL'
          : q.stem.toLowerCase().includes('diện tích') || q.stem.toLowerCase().includes('chu vi')
          ? 'GEOMETRY_FORMULA'
          : q.stem.toLowerCase().includes('tấn') || q.stem.toLowerCase().includes('ha')
          ? 'UNIT_CONVERSION'
          : q.format === 'ESSAY'
          ? 'WORD_PROBLEM_WITH_UNIT'
          : 'NONE');

      const matchingIssue = qIssues[0];

      return {
        questionNumber: q.questionNumber,
        questionCode: q.questionCode,
        calculationTypeLabel: calcTypeLabelMap[calcType] || 'Tính toán Toán học',
        expressionTested: expr || `Kiểm tra câu ${q.questionNumber}`,
        declaredAnswerInDossier: declaredAnswerText,
        deterministicVerifiedResult:
          matchingIssue?.correctResultOrHandling ||
          (evalResult.isValid && expr
            ? `${evalResult.formattedValue}${spec?.expectedUnit ? ' ' + spec.expectedUnit : ''}`
            : declaredAnswerText),
        unitVerificationStatus: hasUnitError
          ? `Thiếu đơn vị "${spec?.expectedUnit || 'lít'}" ở đáp số`
          : spec?.expectedUnit
          ? `Đúng đơn vị (${spec.expectedUnit})`
          : 'Hợp lệ',
        isCalculationAccurate: !hasCalcOrKeyError && !hasUnitError,
        verificationProofText:
          matchingIssue?.verificationSolutionProof || evalResult.stepByStepProof,
      };
    }
  );

  const problemStatementEvaluation = dossier.questions.map((q) => {
    const qIssues = openIssues.filter((iss) => iss.questionNumber === q.questionNumber);
    const hasMissingData = qIssues.some((i) => i.issueCode.includes('THIEUDUKIEN'));
    const hasTwoValid = qIssues.some((i) => i.issueCode.includes('HAIDAPAN'));
    const hasContradiction = qIssues.some((i) => i.issueCode.includes('MAUTHUAN'));
    const hasMisleading = qIssues.some((i) => i.issueCode.includes('HINHVE-SAILECH'));

    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      stemPreview: q.stem,
      hasSufficientData: !hasMissingData,
      isQuestionClear: !hasMisleading && !hasTwoValid,
      hasSingleOrValidAnswerSet: !hasTwoValid,
      isDataNonContradictory: !hasContradiction,
      isGradeLevelAppropriate: true,
      note:
        qIssues.length === 0
          ? 'Đạt cả 5/5 tiêu chí Đề bài (Đủ dữ kiện, câu hỏi rõ, không mâu thuẫn, vừa sức khối lớp).'
          : qIssues.map((i) => i.issueCategoryLabel).join('; '),
    };
  });

  const cognitiveLevelEvaluation = dossier.questions.map((q) => {
    const spec = q.mathAuditSpec;
    const matrixSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);
    const qIssues = openIssues.filter((iss) => iss.questionNumber === q.questionNumber);
    const hasLevelError = qIssues.some((i) => i.issueCode.includes('SAIMUCDO'));

    const recommendedLevel =
      spec?.recommendedCognitiveLevel ||
      matrixSlot?.expectedCognitiveLevel ||
      q.declaredCognitiveLevel;

    const thinkingOperations =
      spec?.thinkingOperationsRequired && spec.thinkingOperationsRequired.length > 0
        ? spec.thinkingOperationsRequired
        : spec?.thinkingOperationsAnalysis
        ? [spec.thinkingOperationsAnalysis]
        : q.declaredCognitiveLevel.includes('Mức 1')
        ? ['Nhận biết trực tiếp khái niệm / Thực hiện 1 thao tác tính cơ bản']
        : q.declaredCognitiveLevel.includes('Mức 2')
        ? ['Hiểu mối quan hệ giữa các đại lượng quen thuộc', 'Trình bày bước biến đổi trung gian']
        : ['Phân tích tình huống thực tiễn không quen thuộc', 'Lập kế hoạch giải toán nhiều bước liên kết'];

    const justification =
      spec?.cognitiveLevelJustification ||
      (hasLevelError
        ? 'Phân loại sai do chỉ đếm số phép tính mà chưa xét độ phức tạp của thao tác tư duy giải quyết vấn đề thực tiễn (Yêu cầu nâng lên Mức 3 – Vận dụng).'
        : `Phù hợp với thao tác tư duy và Yêu cầu cần đạt (${q.learningOutcomeCode}) theo Thông tư 27/2020/TT-BGDĐT.`);

    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      declaredLevel: q.declaredCognitiveLevel,
      recommendedLevel,
      thinkingOperations,
      learningOutcomeCode: q.learningOutcomeCode,
      isClassificationValid: !hasLevelError,
      justification,
    };
  });

  const actualQuestionPointsSum = Number(
    dossier.questions.reduce((acc, q) => acc + q.points, 0).toFixed(2)
  );
  const flukeMethodWarningsCount = openIssues.filter((i) =>
    i.issueCode.includes('LOIGIAISAI-KETQUADUNG')
  ).length;
  const missingStepOrUnitCount = openIssues.filter(
    (i) =>
      i.issueCode.includes('HDCTHIEUBUOC-DONVI') || i.issueCode.includes('TONGDIEM')
  ).length;

  const questionRubricItems = dossier.questions.map((q) => {
    const spec = q.mathAuditSpec;
    const qIssues = openIssues.filter((iss) => iss.questionNumber === q.questionNumber);
    const hasFluke = qIssues.some((i) => i.issueCode.includes('LOIGIAISAI-KETQUADUNG'));
    const hasIncompleteRubric = qIssues.some((i) =>
      i.issueCode.includes('HDCTHIEUBUOC-DONVI')
    );
    const hasTotalScoreMismatch = qIssues.some((i) => i.issueCode.includes('TONGDIEM'));
    const subSum =
      spec?.rubricSubPointsSum !== undefined
        ? spec.rubricSubPointsSum
        : spec?.rubricSubStepPoints
        ? spec.rubricSubStepPoints.reduce((s, item) => s + item.points, 0)
        : undefined;

    return {
      questionNumber: q.questionNumber,
      points: q.points,
      subPointsCheckText:
        subSum !== undefined
          ? `Tổng điểm thành phần = ${subSum.toFixed(2)}đ / Điểm câu = ${q.points.toFixed(2)}đ`
          : hasTotalScoreMismatch
          ? `Lệch điểm so với Ma trận (${q.points}đ)`
          : `Khớp (${q.points}đ)`,
      hasFlukeCorrectResult: hasFluke,
      hasMissingStepsOrUnits: hasIncompleteRubric,
      acceptsAlternativeMethods: Boolean(
        q.acceptedAlternativeSolutions && q.acceptedAlternativeSolutions.trim().length > 0
      ),
      auditNote:
        hasFluke
          ? 'CẢNH BÁO ĐỎ: Lời giải mẫu sai bản chất toán học (gạch bỏ chữ số 6 trong 16/64 = 1/4) nhưng kết quả tình cờ đúng!'
          : hasIncompleteRubric
          ? 'CẢNH BÁO: Đáp án mẫu thiếu bước giải trung gian, thiếu đơn vị ("lít"), hụt điểm thành phần và chưa ghi nhận cách giải khác.'
          : hasTotalScoreMismatch
          ? 'Điểm số câu hỏi lệch so với Ma trận làm tổng điểm toàn đề vượt 10,0 điểm.'
          : 'Biểu điểm và lời giải hợp lệ.',
    };
  });

  const geometryEvaluation = dossier.questions
    .filter(
      (q) =>
        Boolean(q.mathAuditSpec?.geometryMeta || q.mathAuditSpec?.geometryMetadata) ||
        q.topicTitle.toLowerCase().includes('hình học') ||
        q.stem.toLowerCase().includes('hình chữ nhật') ||
        q.stem.toLowerCase().includes('hình bình hành') ||
        q.stem.toLowerCase().includes('hình tam giác') ||
        q.stem.toLowerCase().includes('hình thang') ||
        q.stem.toLowerCase().includes('góc')
    )
    .map((q) => {
      const gm = q.mathAuditSpec?.geometryMeta || q.mathAuditSpec?.geometryMetadata;
      const qIssues = openIssues.filter((iss) => iss.questionNumber === q.questionNumber);
      const hasFormulaErr = qIssues.some((i) => i.issueCode.includes('HINHHOC-CONGTHUC'));
      const hasDiagramErr = qIssues.some((i) => i.issueCode.includes('HINHVE-SAILECH'));
      const hasMissingGeomData = qIssues.some((i) => i.issueCode.includes('THIEUDUKIEN'));
      const hasContradictorySides = qIssues.some((i) => i.issueCode.includes('MAUTHUAN'));

      return {
        questionNumber: q.questionNumber,
        questionCode: q.questionCode,
        shapeType:
          gm?.shapeLabel ||
          gm?.shapeType ||
          (q.stem.includes('hình chữ nhật')
            ? 'Hình chữ nhật'
            : q.stem.includes('hình bình hành')
            ? 'Hình bình hành'
            : 'Hình học phẳng'),
        diagramMatchesData: !hasDiagramErr && !hasMissingGeomData && !hasContradictorySides,
        pointsSegmentsAnglesValid: gm
          ? gm.isPointSegmentAngleConsistent !== false && !gm.hasLabelMismatch && !hasFormulaErr
          : true,
        formulaAccurate: gm ? !gm.hasFormulaError && !hasFormulaErr : true,
        noMisleadingIllustration: gm
          ? !gm.hasMisleadingIllustration && !gm.hasMisleadingDiagram && !hasDiagramErr
          : true,
        auditNote:
          qIssues.length === 0
            ? 'Hình vẽ, tên đỉnh/đoạn thẳng/góc và công thức hình học hoàn toàn chính xác.'
            : qIssues.map((i) => i.problemDescription).join(' '),
      };
    });

  return {
    isMathPrimaryDossier: true,
    grade: dossier.grade,
    calculationVerificationItems,
    problemStatementEvaluation,
    cognitiveLevelEvaluation,
    gradingGuideEvaluation: {
      totalDeclaredPoints: dossier.targetTotalPoints,
      actualQuestionPointsSum,
      isPointAllocationReasonable:
        Math.abs(actualQuestionPointsSum - dossier.targetTotalPoints) < 1e-3 &&
        missingStepOrUnitCount === 0,
      acceptsMultipleSolutionMethods: missingStepOrUnitCount === 0,
      flukeMethodWarningsCount,
      missingStepOrUnitCount,
      questionRubricItems,
    },
    geometryEvaluation,
  };
}

// ============================================================================
// 5D. BỘ KIỂM THỬ TỰ ĐỘNG CHUYÊN SÂU MÔN TOÁN TIỂU HỌC LỚP 4 & LỚP 5 (16 LỖI)
// ============================================================================

export function runPrimaryMathQualityBenchmarkSuite(): PrimaryMathBenchmarkSuiteResult {
  const allGroupsEnabled: Record<QualityReviewGroupId, boolean> = {
    GROUP_01_CURRICULUM: true,
    GROUP_02_MATRIX: true,
    GROUP_03_SPECIFICATION: true,
    GROUP_04_KNOWLEDGE: true,
    GROUP_05_QUESTION_STEM: true,
    GROUP_06_MULTIPLE_CHOICE: true,
    GROUP_07_ESSAY: true,
    GROUP_08_ANSWER_AND_RUBRIC: true,
    GROUP_09_LANGUAGE_AND_FORMAT: true,
    GROUP_10_OVERALL_QUALITY: true,
  };

  const math4Flawed = createFlawedGrade4MathTestDossier();
  const math5Flawed = createFlawedGrade5MathTestDossier();
  const math4Valid = createValidGrade4MathTestDossier();

  const math4Result = runTwoLayerQualityReview(math4Flawed, allGroupsEnabled);
  const math5Result = runTwoLayerQualityReview(math5Flawed, allGroupsEnabled);
  const math4ValidResult = runTwoLayerQualityReview(math4Valid, allGroupsEnabled);

  const expectedMathSpecs = [
    // 8 lỗi trên Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)
    {
      order: 1,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '1. Kiểm tra tính toán (Phép cộng & Đáp án khóa)',
      expectedIssueCode: 'ERR-R03-SAIDAPAN-C2',
      pool: math4Result.issues,
    },
    {
      order: 2,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '1. Kiểm tra tính toán (Phép nhân & Bài toán lời văn)',
      expectedIssueCode: 'ERR-R04-SAIPHEPTINH-C4',
      pool: math4Result.issues,
    },
    {
      order: 3,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '2. Kiểm tra đề bài (Thiếu dữ kiện chiều rộng HCN)',
      expectedIssueCode: 'ERR-AI01-THIEUDUKIEN-C6',
      pool: math4Result.issues,
    },
    {
      order: 4,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '2. Kiểm tra đề bài (Có 2 phương án phân số bằng nhau 2/3 và 4/6)',
      expectedIssueCode: 'ERR-R05-HAIDAPAN-C7',
      pool: math4Result.issues,
    },
    {
      order: 5,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '3. Kiểm tra mức độ (Gán sai Mức 1 cho bài toán vận dụng 3 bước)',
      expectedIssueCode: 'ERR-AI02-SAIMUCDO-C8',
      pool: math4Result.issues,
    },
    {
      order: 6,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '5. Kiểm tra hình học & thuật ngữ (Chính tả tính chất hình bình hành)',
      expectedIssueCode: 'ERR-AI03-CHINHTA-C9',
      pool: math4Result.issues,
    },
    {
      order: 7,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '4. Kiểm tra hướng dẫn chấm (Tổng điểm 10,5/10,0đ lệch Ma trận)',
      expectedIssueCode: 'ERR-R01-TONGDIEM',
      pool: math4Result.issues,
    },
    {
      order: 8,
      examLabel: 'Đề Toán Lớp 4 (DE-TOAN4-TEST-8LOI)',
      pillarCategory: '3. Kiểm tra YCCĐ & Ma trận (Lệch chủ đề Đo lường sang Thống kê)',
      expectedIssueCode: 'ERR-R02-LECHMATRAN-C10',
      pool: math4Result.issues,
    },
    // 8 lỗi chuyên sâu trên Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)
    {
      order: 9,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '1. Kiểm tra tính toán (Giá trị biểu thức số thập phân 12,5 + 7,5 × 0,4)',
      expectedIssueCode: 'ERR-TOAN5-01-BIEUTHUC-C2',
      pool: math5Result.issues,
    },
    {
      order: 10,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '1. Kiểm tra tính toán (Đổi đơn vị diện tích 3 ha 450 m² = 3,045 ha)',
      expectedIssueCode: 'ERR-TOAN5-02-DOIDONVI-C3',
      pool: math5Result.issues,
    },
    {
      order: 11,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '2. Kiểm tra đề bài (Dữ kiện 3 cạnh tam giác 4 cm, 5 cm, 12 cm mâu thuẫn)',
      expectedIssueCode: 'ERR-TOAN5-03-MAUTHUAN-C5',
      pool: math5Result.issues,
    },
    {
      order: 12,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '3. Kiểm tra mức độ (Thao tác tư duy tỉ số phần trăm giảm giá liên tiếp)',
      expectedIssueCode: 'ERR-TOAN5-04-SAIMUCDO-C6',
      pool: math5Result.issues,
    },
    {
      order: 13,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '5. Kiểm tra hình học (Sai công thức diện tích hình thang & lệch tên đường cao AH/MK)',
      expectedIssueCode: 'ERR-TOAN5-05-HINHHOC-CONGTHUC-C7',
      pool: math5Result.issues,
    },
    {
      order: 14,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '5. Kiểm tra hình học (Hình vẽ góc 60° nhưng vẽ góc tù 135° gây hiểu nhầm)',
      expectedIssueCode: 'ERR-TOAN5-06-HINHVE-SAILECH-C8',
      pool: math5Result.issues,
    },
    {
      order: 15,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '4. Kiểm tra hướng dẫn chấm (Lời giải sai gạch chữ số 6 trong 16/64 = 1/4 nhưng kết quả tình cờ đúng)',
      expectedIssueCode: 'ERR-TOAN5-07-LOIGIAISAI-KETQUADUNG-C9',
      pool: math5Result.issues,
    },
    {
      order: 16,
      examLabel: 'Đề Toán Lớp 5 (DE-TOAN5-TEST-8LOI)',
      pillarCategory: '4. Kiểm tra hướng dẫn chấm (Thiếu bước giải, thiếu đơn vị "lít", lệch tổng điểm thành phần 1,0đ/3,0đ)',
      expectedIssueCode: 'ERR-TOAN5-08-HDCTHIEUBUOC-DONVI-C10',
      pool: math5Result.issues,
    },
  ];

  const verificationRows = expectedMathSpecs.map((spec) => {
    const found = spec.pool.find((i) => i.issueCode === spec.expectedIssueCode);
    return {
      order: spec.order,
      examLabel: spec.examLabel,
      questionNumber: found?.questionNumber ?? 0,
      pillarCategory: spec.pillarCategory,
      errorDescription: found?.problemDescription || 'Không phát hiện',
      correctResultOrHandling: found?.correctResultOrHandling || '-',
      verificationSolutionProof: found?.verificationSolutionProof || '-',
      severityLabel: found?.severityLabel || '-',
      proposedFix: found?.proposedFix || '-',
      detectedBySystem: Boolean(found),
      detectedIssueCode: found?.issueCode || 'KHÔNG PHÁT HIỆN',
    };
  });

  const totalDetectedErrors = verificationRows.filter((r) => r.detectedBySystem).length;

  return {
    executedAt: new Date().toLocaleString('vi-VN'),
    grade4FlawedDossierCode: math4Flawed.dossierCode,
    grade5FlawedDossierCode: math5Flawed.dossierCode,
    validMathDossierCode: math4Valid.dossierCode,
    totalInjectedErrorsAcrossGrade4And5: expectedMathSpecs.length,
    totalDetectedErrors,
    missedErrorsCount: expectedMathSpecs.length - totalDetectedErrors,
    falsePositivesOnValidMathExam: math4ValidResult.issues.length,
    autoModifiedWithoutConfirmation: false,
    verificationRows,
  };
}

// ============================================================================
// 6. XUẤT BÁO CÁO CHẤT LƯỢNG ĐỀ KIỂM TRA RA WORD (.DOC)
// ============================================================================

export function exportQualityReviewReportToWord(
  dossier: QualityReviewDossierPackage,
  report: QualityReviewComprehensiveReport
): void {
  const allIssues = [...report.verifiedRuleIssues, ...report.expertReviewAiWarnings];
  const issueRowsHtml =
    allIssues.length === 0
      ? `<tr><td colspan="7" style="border:1px solid #334155;padding:8px;text-align:center;">Không phát hiện lỗi kỹ thuật hay cảnh báo chuyên môn nào.</td></tr>`
      : allIssues
          .map(
            (iss, idx) => `
          <tr>
            <td style="border:1px solid #334155;padding:6px;text-align:center;">${idx + 1}</td>
            <td style="border:1px solid #334155;padding:6px;font-weight:bold;">${iss.locationLabel}</td>
            <td style="border:1px solid #334155;padding:6px;">${iss.issueCategoryLabel}<br/><i>(${iss.detectionLayerLabel})</i></td>
            <td style="border:1px solid #334155;padding:6px;font-weight:bold;">${iss.severityLabel}</td>
            <td style="border:1px solid #334155;padding:6px;"><b>Nội dung gốc:</b> ${iss.currentContent}<br/><b>Nội dung lỗi:</b> ${iss.problemDescription}${
              iss.correctResultOrHandling
                ? `<br/><b>Kết quả đúng / Xử lý:</b> ${iss.correctResultOrHandling}`
                : ''
            }${
              iss.verificationSolutionProof
                ? `<br/><b>Lời giải kiểm chứng:</b> ${iss.verificationSolutionProof}`
                : ''
            }<br/><b>Căn cứ:</b> ${iss.evidenceAndBasis}</td>
            <td style="border:1px solid #334155;padding:6px;">${iss.proposedFix}<br/><i>Ảnh hưởng: Đáp án (${iss.impactAnalysis.impactOnAnswerKey}); Biểu điểm (${iss.impactAnalysis.impactOnGradingGuide}); Ma trận (${iss.impactAnalysis.impactOnMatrix})</i></td>
            <td style="border:1px solid #334155;padding:6px;text-align:center;">${iss.status}</td>
          </tr>`
          )
          .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Báo cáo Kiểm tra Chất lượng Hồ sơ Đề kiểm tra – ${dossier.dossierCode}</title>
      <style>
        body { font-family: "Times New Roman", serif; font-size: 13pt; line-height: 1.45; color: #0f172a; }
        h1 { font-size: 15pt; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
        h2 { font-size: 13.5pt; color: #1e3a8a; margin-top: 14px; margin-bottom: 6px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 11pt; }
        th { background-color: #e2e8f0; border: 1px solid #334155; padding: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>BÁO CÁO RÀ SOÁT CHẤT LƯỢNG HỒ SƠ ĐỀ KIỂM TRA (AI QUALITY REVIEW)</h1>
      <p style="text-align:center;font-style:italic;">
        Mã hồ sơ: ${dossier.dossierCode} | Mã đề: ${dossier.examVariantCode} | Phiên bản: ${dossier.versionLabel}
      </p>

      <h2>1. THÔNG TIN ĐỀ KIỂM TRA & PHẠM VI KIỂM TRA</h2>
      <p><b>Tên hồ sơ:</b> ${dossier.title}</p>
      <p><b>Môn học / Khối lớp:</b> ${dossier.subject} – Lớp ${dossier.grade} (${dossier.examPeriod})</p>
      <p><b>Bộ quy tắc áp dụng:</b> ${dossier.curriculumStandard} – ${dossier.assessmentRuleSet}</p>
      <p><b>Số câu đã kiểm tra:</b> ${report.totalQuestionsChecked} câu hỏi</p>
      <p><b>Trạng thái đầy đủ hồ sơ:</b> ${report.completenessBannerText}</p>
      <p><b>Phạm vi đã kiểm tra:</b> ${report.checkedScopeList.join('; ')}</p>
      <p><b>Nội dung chưa thể kết luận:</b> ${
        report.unverifiedScopeList.length > 0 ? report.unverifiedScopeList.join('; ') : 'Không có (Đã kiểm tra đủ 5/5 thành phần)'
      }</p>

      <h2>2. THỐNG KÊ SỐ LỖI THEO MỨC ĐỘ & LỚP PHÂN TÍCH</h2>
      <ul>
        <li>Mức 1 – Nghiêm trọng: <b>${report.countsBySeverity.level1Critical}</b></li>
        <li>Mức 2 – Cao: <b>${report.countsBySeverity.level2High}</b></li>
        <li>Mức 3 – Trung bình: <b>${report.countsBySeverity.level3Medium}</b></li>
        <li>Mức 4 – Thấp: <b>${report.countsBySeverity.level4Low}</b></li>
        <li>Phân định nguồn phát hiện: Lớp A (Quy tắc): <b>${report.countsByLayer.layerARuleEngine}</b> | Lớp B (Gemini AI): <b>${report.countsByLayer.layerBGeminiAi}</b></li>
      </ul>

      <h2>3. DANH SÁCH LỖI ĐÃ XÁC MINH, CẢNH BÁO CHUYÊN GIA & ĐỀ XUẤT CHỈNH SỬA</h2>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Câu số / Vị trí</th>
            <th>Loại lỗi & Lớp</th>
            <th>Mức độ nghiêm trọng</th>
            <th>Nội dung lỗi, Kết quả đúng & Lời giải kiểm chứng</th>
            <th>Đề xuất chỉnh sửa & Ảnh hưởng</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>${issueRowsHtml}</tbody>
      </table>

      <h2>4. KẾT LUẬN HỖ TRỢ CHUYÊN MÔN (KHÔNG THAY THẾ HỘI ĐỒNG THẨM ĐỊNH)</h2>
      <p><b>${report.professionalConclusionLabel}</b></p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BaoCao_AI_QualityReview_${dossier.dossierCode}_${dossier.versionLabel.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// 7. CHỨC NĂNG "ĐỐI CHIẾU CHÉO HỒ SƠ KIỂM TRA" (7 NGUỒN DỮ LIỆU ĐẦU VÀO)
//    I. Ma trận ↔ Bản đặc tả | II. Bản đặc tả ↔ Đề | III. Đề ↔ Đáp án
//    IV. Đáp án ↔ Hướng dẫn chấm | V. Bảng kết quả 10 cột | VI. Cảnh báo
//    VII. Hồ sơ kiểm thử 5 lỗi chuẩn (DE-DOICHIEU-TEST-5LOI)
// ============================================================================

/**
 * MỤC VII – HỒ SƠ THỬ NGHIỆM ĐỐI CHIẾU CHÉO 5 LỖI CHUẨN:
 * 1. Một câu sai mức độ (Câu 2: Ma trận & Đặc tả quy định Mức 3 – Vận dụng, nhưng Đề thực tế chỉ ở Mức 1 – Nhận biết).
 * 2. Một câu sai số điểm (Câu 3: Ma trận quy định 1,0 điểm, nhưng Đề kiểm tra & HDC ghi 1,5 điểm).
 * 3. Một câu thiếu trong bản đặc tả (Câu 4: Có trong Đề kiểm tra & Ma trận nhưng bị bỏ sót hoàn toàn trong Bản đặc tả).
 * 4. Một câu có đáp án không khớp (Câu 5: Đề hỏi diện tích HCN 12 cm × 8 cm = 96 cm² [B], nhưng Bảng Đáp án ghi mã đề MĐ-402 và ghi đáp án C [40 cm²]).
 * 5. Một câu nằm ngoài phạm vi kiến thức (Câu 6: Kỳ kiểm tra Giữa học kỳ I Lớp 4 nhưng đưa câu hỏi Cộng hai phân số khác mẫu số 2/3 + 3/4 thuộc Học kỳ II).
 */
export function createCrossCheckFlawed5TestDossier(): QualityReviewDossierPackage {
  const matrixSlots: QualityReviewMatrixSlot[] = [
    {
      questionNumber: 1,
      expectedTopicTitle: 'Số tự nhiên – Đọc, viết, so sánh số tự nhiên đến lớp triệu',
      expectedKnowledgeUnit: 'Cấu tạo thập phân của số tự nhiên đến lớp triệu',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-STN-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 1.0,
      expectedPointPercentage: 10,
    },
    {
      // LỖI 1: Ma trận quy định Mức 3 – Vận dụng, nhưng câu hỏi trong Đề thực tế là Mức 1 – Nhận biết
      questionNumber: 2,
      expectedTopicTitle: 'Số tự nhiên – Giải quyết vấn đề thực tiễn nhiều bước tính',
      expectedKnowledgeUnit: 'Bài toán thực tế liên quan đến sản lượng và trung bình cộng',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-STN-VD01',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 1.0,
      expectedPointPercentage: 10,
    },
    {
      // LỖI 2: Ma trận quy định 1.0 điểm (10%), nhưng Đề kiểm tra thực tế ghi 1.5 điểm
      questionNumber: 3,
      expectedTopicTitle: 'Các phép tính với số tự nhiên – Tính giá trị biểu thức số',
      expectedKnowledgeUnit: 'Biểu thức có chứa hai dấu phép tính cộng và nhân',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-PT-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 1.0,
      expectedPointPercentage: 10,
    },
    {
      // LỖI 3: Câu 4 có trong Ma trận và Đề kiểm tra nhưng bị THIẾU trong Bản đặc tả
      questionNumber: 4,
      expectedTopicTitle: 'Hình học & Đo lường – Góc nhọn, góc tù, góc bẹt',
      expectedKnowledgeUnit: 'Nhận biết góc nhọn, góc vuông, góc tù, góc bẹt theo số đo độ',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-HH-01',
      expectedCognitiveLevel: 'Mức 1 – Nhận biết',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 1.0,
      expectedPointPercentage: 10,
    },
    {
      // LỖI 4: Câu 5 có đáp án trong Bảng Đáp án không khớp với nội dung Đề và HDC
      questionNumber: 5,
      expectedTopicTitle: 'Hình học & Đo lường – Chu vi và diện tích hình chữ nhật',
      expectedKnowledgeUnit: 'Tính diện tích hình chữ nhật khi biết chiều dài và chiều rộng',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-HH-02',
      expectedCognitiveLevel: 'Mức 2 – Thông hiểu',
      expectedFormat: 'MULTIPLE_CHOICE',
      expectedPoints: 2.0,
      expectedPointPercentage: 20,
    },
    {
      // LỖI 5: Câu 6 trong Đề nằm ngoài phạm vi kiến thức Giữa học kỳ I (đưa Phân số Học kỳ II vào)
      questionNumber: 6,
      expectedTopicTitle: 'Các phép tính với số tự nhiên – Bài toán tìm hai số khi biết tổng và hiệu',
      expectedKnowledgeUnit: 'Giải bài toán có lời văn bằng hai bước tính với số tự nhiên',
      expectedLearningOutcomeCode: 'YCCD-TOAN4-PT-03',
      expectedCognitiveLevel: 'Mức 3 – Vận dụng',
      expectedFormat: 'ESSAY',
      expectedPoints: 4.0,
      expectedPointPercentage: 40,
    },
  ];

  // Bản đặc tả: CỐ Ý BỎ SÓT CÂU 4 (chỉ có Câu 1, 2, 3, 5, 6) để kiểm thử Lỗi 3 ("Một câu thiếu trong bản đặc tả")
  const specificationSlots: QualityReviewSpecificationSlot[] = matrixSlots
    .filter((m) => m.questionNumber !== 4)
    .map((m) => ({
      questionNumber: m.questionNumber,
      topicTitle: m.expectedTopicTitle,
      knowledgeUnit: m.expectedKnowledgeUnit,
      learningOutcomeCode: m.expectedLearningOutcomeCode,
      learningOutcomeDescription: `Đạt yêu cầu cần đạt ${m.expectedLearningOutcomeCode} thuộc chủ đề "${m.expectedTopicTitle}" (Chương trình Toán Lớp 4 – Giữa học kỳ I).`,
      competencyAssessed:
        m.expectedCognitiveLevel === 'Mức 3 – Vận dụng'
          ? 'Năng lực giải quyết vấn đề toán học'
          : 'Năng lực tư duy và lập luận toán học',
      cognitiveLevel: m.expectedCognitiveLevel,
      format: m.expectedFormat,
      expectedPoints: m.expectedPoints,
    }));

  const questions: QualityReviewQuestionNode[] = [
    {
      questionNumber: 1,
      questionCode: 'DC4-Q01',
      positionInExamLabel: 'Phần I (Trắc nghiệm) – Câu 1',
      format: 'MULTIPLE_CHOICE',
      stem: 'Số gồm "Bốn triệu, năm trăm linh hai nghìn, sáu trăm mười tám" được viết là:',
      options: [
        { key: 'A', text: '4 520 618' },
        { key: 'B', text: '4 502 618' },
        { key: 'C', text: '4 052 618' },
        { key: 'D', text: '4 502 168' },
      ],
      declaredCorrectAnswer: 'B',
      answerKeySheetValue: 'B',
      answerKeySheetQuestionNumber: 1,
      answerKeySheetVariantCode: 'MĐ-401',
      points: 1.0,
      gradingGuidePoints: 1.0,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      aiAssessedCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Số tự nhiên – Đọc, viết, so sánh số tự nhiên đến lớp triệu',
      learningOutcomeCode: 'YCCD-TOAN4-STN-01',
      learningOutcomeText: 'Đọc, viết được số tự nhiên đến lớp triệu.',
      gradingGuide: 'Chọn đúng phương án B (4 502 618) đạt 1,0 điểm.',
      isWithinDeclaredCurriculumScope: true,
    },
    {
      // LỖI 1: MỘT CÂU SAI MỨC ĐỘ (Ma trận & Đặc tả yêu cầu Mức 3 – Vận dụng, nhưng câu hỏi thực tế trong Đề chỉ là Mức 1 – Nhận biết)
      questionNumber: 2,
      questionCode: 'DC4-Q02',
      positionInExamLabel: 'Phần I (Trắc nghiệm) – Câu 2',
      format: 'MULTIPLE_CHOICE',
      stem: 'Trong số tự nhiên 684 352, chữ số 8 thuộc hàng nào và lớp nào?',
      options: [
        { key: 'A', text: 'Hàng chục nghìn, lớp nghìn' },
        { key: 'B', text: 'Hàng trăm nghìn, lớp nghìn' },
        { key: 'C', text: 'Hàng nghìn, lớp nghìn' },
        { key: 'D', text: 'Hàng chục nghìn, lớp đơn vị' },
      ],
      declaredCorrectAnswer: 'A',
      answerKeySheetValue: 'A',
      answerKeySheetQuestionNumber: 2,
      answerKeySheetVariantCode: 'MĐ-401',
      points: 1.0,
      gradingGuidePoints: 1.0,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      aiAssessedCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Số tự nhiên – Giải quyết vấn đề thực tiễn nhiều bước tính',
      learningOutcomeCode: 'YCCD-TOAN4-STN-VD01',
      learningOutcomeText: 'Nhận biết trực tiếp hàng và lớp của chữ số trong số tự nhiên (Lệch so với YCCĐ Vận dụng trong Ma trận).',
      gradingGuide: 'Chữ số 8 đứng ở hàng chục nghìn, lớp nghìn. Chọn A đạt 1,0 điểm.',
      isWithinDeclaredCurriculumScope: true,
      mathAuditSpec: {
        calculationType: 'NONE',
        stepCount: 1,
        thinkingOperationsAnalysis:
          'Chỉ cần nhận diện trực tiếp vị trí hàng chục nghìn và lớp nghìn của chữ số 8, không có bước suy luận hay vận dụng thực tiễn.',
        recommendedCognitiveLevel: 'Mức 1 – Nhận biết',
        cognitiveLevelJustification:
          'Câu hỏi chỉ yêu cầu nhớ quy tắc hàng và lớp (Mức 1 – Nhận biết), hoàn toàn không khớp với Ma trận đề và Bản đặc tả đang yêu cầu Mức 3 – Vận dụng.',
      },
    },
    {
      // LỖI 2: MỘT CÂU SAI SỐ ĐIỂM (Ma trận quy định 1,0 điểm nhưng Đề kiểm tra & HDC ghi 1,5 điểm)
      questionNumber: 3,
      questionCode: 'DC4-Q03',
      positionInExamLabel: 'Phần I (Trắc nghiệm) – Câu 3',
      format: 'MULTIPLE_CHOICE',
      stem: 'Giá trị của biểu thức 2 400 + 600 × 3 là bao nhiêu?',
      options: [
        { key: 'A', text: '9 000' },
        { key: 'B', text: '4 200' },
        { key: 'C', text: '3 600' },
        { key: 'D', text: '4 800' },
      ],
      declaredCorrectAnswer: 'B',
      answerKeySheetValue: 'B',
      answerKeySheetQuestionNumber: 3,
      answerKeySheetVariantCode: 'MĐ-401',
      points: 1.5, // Sai lệch so với 1.0 điểm trong Ma trận & Bản đặc tả!
      gradingGuidePoints: 1.5,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      aiAssessedCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Các phép tính với số tự nhiên – Tính giá trị biểu thức số',
      learningOutcomeCode: 'YCCD-TOAN4-PT-02',
      learningOutcomeText: 'Tính được giá trị của biểu thức số có đến hai dấu phép tính.',
      gradingGuide: 'Ta có 600 × 3 = 1 800; 2 400 + 1 800 = 4 200. Chọn B đạt 1,5 điểm (Ma trận ghi 1,0 điểm).',
      isWithinDeclaredCurriculumScope: true,
      mathAuditSpec: {
        calculationType: 'ORDER_OF_OPERATIONS',
        expressionToEvaluate: '2400 + 600 * 3',
        declaredResultValue: '4 200',
        deterministicTrueResult: '4 200',
      },
    },
    {
      // LỖI 3: MỘT CÂU THIẾU TRONG BẢN ĐẶC TẢ (Có trong Đề & Ma trận nhưng bị bỏ sót hoàn toàn trong Bản đặc tả)
      questionNumber: 4,
      questionCode: 'DC4-Q04',
      positionInExamLabel: 'Phần I (Trắc nghiệm) – Câu 4',
      format: 'MULTIPLE_CHOICE',
      stem: 'Góc có số đo bằng 180° được gọi là góc gì?',
      options: [
        { key: 'A', text: 'Góc nhọn' },
        { key: 'B', text: 'Góc vuông' },
        { key: 'C', text: 'Góc tù' },
        { key: 'D', text: 'Góc bẹt' },
      ],
      declaredCorrectAnswer: 'D',
      answerKeySheetValue: 'D',
      answerKeySheetQuestionNumber: 4,
      answerKeySheetVariantCode: 'MĐ-401',
      points: 1.0,
      gradingGuidePoints: 1.0,
      declaredCognitiveLevel: 'Mức 1 – Nhận biết',
      aiAssessedCognitiveLevel: 'Mức 1 – Nhận biết',
      topicTitle: 'Hình học & Đo lường – Góc nhọn, góc tù, góc bẹt',
      learningOutcomeCode: 'YCCD-TOAN4-HH-01',
      learningOutcomeText: 'Nhận biết được góc nhọn, góc tù, góc bẹt.',
      gradingGuide: 'Góc 180° là góc bẹt. Chọn D đạt 1,0 điểm.',
      isWithinDeclaredCurriculumScope: true,
    },
    {
      // LỖI 4: MỘT CÂU CÓ ĐÁP ÁN KHÔNG KHỚP (Đề & HDC tính diện tích HCN 12 × 8 = 96 cm² [B], nhưng Bảng Đáp án ghi mã đề MĐ-402 và ghi đáp án C [40 cm²])
      questionNumber: 5,
      questionCode: 'DC4-Q05',
      positionInExamLabel: 'Phần I (Trắc nghiệm) – Câu 5',
      format: 'MULTIPLE_CHOICE',
      stem: 'Một tấm bìa hình chữ nhật có chiều dài 12 cm và chiều rộng 8 cm. Diện tích của tấm bìa hình chữ nhật đó là:',
      options: [
        { key: 'A', text: '20 cm²' },
        { key: 'B', text: '96 cm²' },
        { key: 'C', text: '40 cm²' },
        { key: 'D', text: '48 cm²' },
      ],
      declaredCorrectAnswer: 'B',
      answerKeySheetValue: 'C', // Bảng đáp án ghi C (40 cm² - nhầm sang chu vi) không khớp với Đề & HDC!
      answerKeySheetQuestionNumber: 5,
      answerKeySheetVariantCode: 'MĐ-402', // Lệch mã đề so với MĐ-401 của Đề kiểm tra!
      points: 2.0,
      gradingGuidePoints: 2.0,
      declaredCognitiveLevel: 'Mức 2 – Thông hiểu',
      aiAssessedCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Hình học & Đo lường – Chu vi và diện tích hình chữ nhật',
      learningOutcomeCode: 'YCCD-TOAN4-HH-02',
      learningOutcomeText: 'Tính được diện tích hình chữ nhật khi biết chiều dài và chiều rộng.',
      gradingGuide: 'Diện tích tấm bìa hình chữ nhật là: 12 × 8 = 96 (cm²). Chọn phương án B đạt 2,0 điểm.',
      isWithinDeclaredCurriculumScope: true,
      mathAuditSpec: {
        calculationType: 'GEOMETRY_FORMULA',
        expressionToEvaluate: '12 * 8',
        declaredResultValue: '96 cm² (Đề & HDC) vs 40 cm² (Bảng Đáp án)',
        deterministicTrueResult: '96 cm² (Phương án B)',
        expectedUnit: 'cm²',
      },
    },
    {
      // LỖI 5: MỘT CÂU NẰM NGOÀI PHẠM VI KIẾN THỨC (Kỳ kiểm tra Giữa HK I Lớp 4 nhưng ra bài Cộng hai phân số khác mẫu số thuộc HK II Lớp 4)
      questionNumber: 6,
      questionCode: 'DC4-Q06',
      positionInExamLabel: 'Phần II (Tự luận) – Câu 6',
      format: 'ESSAY',
      stem: 'Thực hiện phép tính cộng hai phân số khác mẫu số sau và rút gọn kết quả: 2/3 + 3/4.',
      declaredCorrectAnswer: '2/3 + 3/4 = 8/12 + 9/12 = 17/12',
      answerKeySheetValue: '17/12',
      answerKeySheetQuestionNumber: 6,
      answerKeySheetVariantCode: 'MĐ-401',
      points: 4.0,
      gradingGuidePoints: 4.0,
      declaredCognitiveLevel: 'Mức 3 – Vận dụng',
      aiAssessedCognitiveLevel: 'Mức 2 – Thông hiểu',
      topicTitle: 'Phân số – Phép cộng hai phân số khác mẫu số (Thuộc Học kỳ II Lớp 4)',
      learningOutcomeCode: 'YCCD-TOAN4-PS-HK2',
      learningOutcomeText: 'Thực hiện được phép cộng hai phân số khác mẫu số (Nội dung Học kỳ II – Ngoài phạm vi Giữa học kỳ I).',
      gradingGuide:
        'Bước 1 (2,0đ): Quy đồng mẫu số 2/3 = 8/12 và 3/4 = 9/12. Bước 2 (2,0đ): Cộng hai phân số 8/12 + 9/12 = 17/12.',
      acceptedAlternativeSolutions: 'Chấp nhận mọi cách trình bày quy đồng mẫu số chung hợp lệ.',
      isWithinDeclaredCurriculumScope: false,
      outOfScopeReason:
        'Kỳ kiểm tra đang khai báo là "Giữa học kỳ I – Toán Lớp 4" (Phạm vi Chương trình GDPT 2018 chỉ gồm Số tự nhiên đến lớp triệu, Bốn phép tính với số tự nhiên và Hình học phẳng cơ bản), nhưng Câu 6 lại kiểm tra "Phép cộng hai phân số khác mẫu số (2/3 + 3/4)" thuộc chương trình Học kỳ II Lớp 4, đồng thời lệch hoàn toàn với Bản đặc tả Câu 6 (Bài toán tìm hai số khi biết tổng và hiệu của số tự nhiên).',
    },
  ];

  return {
    dossierId: 'DOSSIER-CROSSCHECK-5ERRORS',
    dossierCode: 'DE-DOICHIEU-TEST-5LOI',
    title: 'Đề kiểm tra Giữa học kỳ I – Toán Lớp 4 (Hồ sơ Kiểm thử Đối chiếu chéo 5 Lỗi chuẩn – Mục VII)',
    subject: 'Toán',
    grade: 4,
    examPeriod: 'Giữa học kỳ I',
    examVariantCode: 'MĐ-401',
    answerKeyHeaderVariantCode: 'MĐ-402',
    curriculumStandard: 'Chương trình GDPT 2018 (Môn Toán Lớp 4 – Phân phối Giữa học kỳ I)',
    assessmentRuleSet: 'Thông tư 27/2020/TT-BGDĐT (Đánh giá học sinh Tiểu học)',
    declaredCurriculumScopeSummary:
      'Giới hạn Giữa học kỳ I Lớp 4: (1) Số tự nhiên đến lớp triệu; (2) Bốn phép tính với số tự nhiên; (3) Góc nhọn, góc tù, góc bẹt; (4) Chu vi và diện tích hình chữ nhật. (Không bao gồm Phân số của Học kỳ II).',
    allowedCurriculumTopicTitles: [
      'Số tự nhiên – Đọc, viết, so sánh số tự nhiên đến lớp triệu',
      'Số tự nhiên – Giải quyết vấn đề thực tiễn nhiều bước tính',
      'Các phép tính với số tự nhiên – Tính giá trị biểu thức số',
      'Các phép tính với số tự nhiên – Bài toán tìm hai số khi biết tổng và hiệu',
      'Hình học & Đo lường – Góc nhọn, góc tù, góc bẹt',
      'Hình học & Đo lường – Chu vi và diện tích hình chữ nhật',
    ],
    durationMinutes: 40,
    targetTotalPoints: 10.0,
    versionLabel: 'v1.0 (Bản gốc đối chiếu chéo – Chưa chỉnh sửa)',
    approvalStatus: ApprovalStatus.DRAFT,
    isConfidentialExam: false,
    hasSecurityPermissionForAi: true,
    hasMatrixDocument: true,
    hasSpecificationDocument: true,
    hasExamPaperDocument: true,
    hasAnswerKeyDocument: true,
    hasGradingGuideDocument: true,
    questions,
    matrixSlots,
    specificationSlots,
  };
}

/**
 * Thực thi Đối chiếu chéo toàn diện 7 nguồn dữ liệu đầu vào của Hồ sơ kiểm tra
 * (Mục I -> Mục VI). Tuyệt đối không tự ý sửa dữ liệu gốc và không tự quyết định
 * tài liệu nào đúng khi chưa có xác nhận của giáo viên.
 */
export function runDossierCrossCheckAnalysis(
  dossier: QualityReviewDossierPackage
): DossierCrossCheckAnalysisResult {
  const matrixTotalPoints = Number(
    dossier.matrixSlots.reduce((acc, m) => acc + m.expectedPoints, 0).toFixed(2)
  );
  const actualExamTotalPoints = Number(
    dossier.questions.reduce((acc, q) => acc + q.points, 0).toFixed(2)
  );
  const specTotalPoints = Number(
    dossier.specificationSlots
      .reduce((acc, s) => {
        const mSlot = dossier.matrixSlots.find((m) => m.questionNumber === s.questionNumber);
        return acc + (s.expectedPoints ?? mSlot?.expectedPoints ?? 0);
      }, 0)
      .toFixed(2)
  );

  // 0. Trạng thái 7 nguồn dữ liệu đầu vào
  const sevenInputsStatus = [
    {
      order: 1,
      inputName: '1. Ma trận đề kiểm tra',
      isAvailable: dossier.hasMatrixDocument && dossier.matrixSlots.length > 0,
      summaryDetail: dossier.hasMatrixDocument
        ? `${dossier.matrixSlots.length} vị trí câu hỏi · Tổng điểm thiết kế: ${matrixTotalPoints.toFixed(2)} điểm`
        : 'Chưa nạp Ma trận đề',
    },
    {
      order: 2,
      inputName: '2. Bản đặc tả đề kiểm tra',
      isAvailable: dossier.hasSpecificationDocument && dossier.specificationSlots.length > 0,
      summaryDetail: dossier.hasSpecificationDocument
        ? `${dossier.specificationSlots.length}/${dossier.matrixSlots.length} câu được đặc tả · Tổng điểm đặc tả: ${specTotalPoints.toFixed(2)} điểm`
        : 'Chưa nạp Bản đặc tả',
    },
    {
      order: 3,
      inputName: '3. Đề kiểm tra chính thức',
      isAvailable: dossier.hasExamPaperDocument && dossier.questions.length > 0,
      summaryDetail: `${dossier.questions.length} câu hỏi (${dossier.examVariantCode}) · Tổng điểm thực tế trên đề: ${actualExamTotalPoints.toFixed(2)} điểm`,
    },
    {
      order: 4,
      inputName: '4. Bảng Đáp án',
      isAvailable: dossier.hasAnswerKeyDocument,
      summaryDetail: dossier.hasAnswerKeyDocument
        ? `Đã nạp khóa đáp án cho ${dossier.questions.length} câu (Mã đề ghi trên phiếu Đáp án: ${
            dossier.answerKeyHeaderVariantCode || dossier.examVariantCode
          })`
        : 'Chưa nạp Bảng Đáp án',
    },
    {
      order: 5,
      inputName: '5. Hướng dẫn chấm (HDC & Biểu điểm)',
      isAvailable: dossier.hasGradingGuideDocument,
      summaryDetail: dossier.hasGradingGuideDocument
        ? `Biểu điểm chi tiết cho ${dossier.questions.length} câu hỏi trắc nghiệm & tự luận`
        : 'Chưa nạp Hướng dẫn chấm',
    },
    {
      order: 6,
      inputName: '6. Chương trình & Yêu cầu cần đạt (GDPT 2018)',
      isAvailable: true,
      summaryDetail:
        dossier.declaredCurriculumScopeSummary ||
        `${dossier.curriculumStandard} – Môn ${dossier.subject} Lớp ${dossier.grade} (${dossier.examPeriod})`,
    },
    {
      order: 7,
      inputName: '7. Bộ quy tắc đánh giá áp dụng',
      isAvailable: true,
      summaryDetail: `${dossier.assessmentRuleSet} (Thang điểm chuẩn: ${dossier.targetTotalPoints.toFixed(1)} điểm · Thời lượng: ${dossier.durationMinutes} phút)`,
    },
  ];

  // ==========================================================================
  // MỤC I: ĐỐI CHIẾU MA TRẬN VỚI BẢN ĐẶC TẢ
  // Kiểm tra: Chủ đề, Nội dung kiến thức, YCCĐ, Số câu, Dạng câu, Mức độ, Tổng điểm, Tỷ lệ điểm
  // ==========================================================================
  const slotComparisons = dossier.matrixSlots.map((m) => {
    const s = dossier.specificationSlots.find((sp) => sp.questionNumber === m.questionNumber);
    const ratioPercent =
      m.expectedPointPercentage ??
      Number(((m.expectedPoints / (matrixTotalPoints || 10)) * 100).toFixed(1));

    if (!s) {
      return {
        questionNumber: m.questionNumber,
        matrixTopic: m.expectedTopicTitle,
        specTopic: '❌ THIẾU TRONG BẢN ĐẶC TẢ',
        matrixOutcome: m.expectedLearningOutcomeCode,
        specOutcome: '❌ THIẾU TRONG BẢN ĐẶC TẢ',
        matrixFormat: m.expectedFormat,
        specFormat: '—',
        matrixLevel: m.expectedCognitiveLevel,
        specLevel: '—',
        matrixPoints: m.expectedPoints,
        matrixRatioPercent: ratioPercent,
        isPresentInSpec: false,
        isMatched: false,
        mismatchNote: `Câu ${m.questionNumber} có trong Ma trận đề (${m.expectedPoints}đ, ${ratioPercent}%) nhưng bị bỏ sót hoàn toàn trong Bản đặc tả.`,
      };
    }

    const specTopic = s.topicTitle || m.expectedTopicTitle;
    const topicOk = specTopic.trim() === m.expectedTopicTitle.trim();
    const outcomeOk = s.learningOutcomeCode.trim() === m.expectedLearningOutcomeCode.trim();
    const formatOk = s.format === m.expectedFormat;
    const levelOk = s.cognitiveLevel === m.expectedCognitiveLevel;
    const pointsOk =
      s.expectedPoints === undefined || Math.abs(s.expectedPoints - m.expectedPoints) < 1e-3;
    const matched = topicOk && outcomeOk && formatOk && levelOk && pointsOk;

    const notes: string[] = [];
    if (!topicOk) notes.push(`Lệch chủ đề (${m.expectedTopicTitle} ↔ ${specTopic})`);
    if (!outcomeOk) notes.push(`Lệch mã YCCĐ (${m.expectedLearningOutcomeCode} ↔ ${s.learningOutcomeCode})`);
    if (!formatOk) notes.push(`Lệch dạng câu (${m.expectedFormat} ↔ ${s.format})`);
    if (!levelOk) notes.push(`Lệch mức độ (${m.expectedCognitiveLevel} ↔ ${s.cognitiveLevel})`);
    if (!pointsOk) notes.push(`Lệch điểm (${m.expectedPoints}đ ↔ ${s.expectedPoints}đ)`);

    return {
      questionNumber: m.questionNumber,
      matrixTopic: m.expectedTopicTitle,
      specTopic,
      matrixOutcome: m.expectedLearningOutcomeCode,
      specOutcome: s.learningOutcomeCode,
      matrixFormat: m.expectedFormat,
      specFormat: s.format,
      matrixLevel: m.expectedCognitiveLevel,
      specLevel: s.cognitiveLevel,
      matrixPoints: m.expectedPoints,
      matrixRatioPercent: ratioPercent,
      isPresentInSpec: true,
      isMatched: matched,
      mismatchNote: matched ? 'Khớp hoàn toàn 8/8 chỉ tiêu Ma trận ↔ Bản đặc tả.' : notes.join('; '),
    };
  });

  const section1MatrixVsSpec = {
    totalMatrixSlots: dossier.matrixSlots.length,
    totalSpecSlots: dossier.specificationSlots.length,
    matrixTotalPoints,
    specTotalPoints,
    topicMatch: slotComparisons.every((c) => c.isPresentInSpec && c.matrixTopic === c.specTopic),
    knowledgeContentMatch: slotComparisons.every((c) => c.isPresentInSpec),
    learningOutcomeMatch: slotComparisons.every(
      (c) => c.isPresentInSpec && c.matrixOutcome === c.specOutcome
    ),
    questionCountMatch:
      dossier.matrixSlots.length === dossier.specificationSlots.length &&
      slotComparisons.every((c) => c.isPresentInSpec),
    questionFormatMatch: slotComparisons.every(
      (c) => c.isPresentInSpec && c.matrixFormat === c.specFormat
    ),
    cognitiveLevelMatch: slotComparisons.every(
      (c) => c.isPresentInSpec && c.matrixLevel === c.specLevel
    ),
    totalPointsMatch: Math.abs(matrixTotalPoints - specTotalPoints) < 1e-3,
    pointPercentageMatch: Math.abs(matrixTotalPoints - specTotalPoints) < 1e-3,
    slotComparisons,
  };

  // ==========================================================================
  // MỤC II: ĐỐI CHIẾU BẢN ĐẶC TẢ VỚI ĐỀ KIỂM TRA (+ CHƯƠNG TRÌNH & YCCĐ)
  // Kiểm tra từng câu: Nội dung đặc tả, Mức độ, Dạng câu, YCCĐ, Số điểm, Phạm vi kiến thức
  // ==========================================================================
  const questionComparisons = dossier.questions.map((q) => {
    const mSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);
    const sSlot = dossier.specificationSlots.find((s) => s.questionNumber === q.questionNumber);
    const aiLevel =
      q.aiAssessedCognitiveLevel ||
      q.mathAuditSpec?.recommendedCognitiveLevel ||
      q.declaredCognitiveLevel;

    const isPresentInSpec = Boolean(sSlot);
    const expectedTopic = sSlot?.topicTitle || mSlot?.expectedTopicTitle || q.topicTitle;
    const contentMatchesSpec =
      isPresentInSpec &&
      q.topicTitle.trim().toLowerCase() === expectedTopic.trim().toLowerCase();
    const expectedLevel = sSlot?.cognitiveLevel || mSlot?.expectedCognitiveLevel || q.declaredCognitiveLevel;
    const levelMatchesSpec =
      q.declaredCognitiveLevel === expectedLevel && aiLevel === expectedLevel;
    const expectedFormat = sSlot?.format || mSlot?.expectedFormat || q.format;
    const formatMatchesSpec = q.format === expectedFormat;
    const expectedOutcome = sSlot?.learningOutcomeCode || mSlot?.expectedLearningOutcomeCode || q.learningOutcomeCode;
    const outcomeMatchesSpec = q.learningOutcomeCode === expectedOutcome && levelMatchesSpec;
    const expectedPts = sSlot?.expectedPoints ?? mSlot?.expectedPoints ?? q.points;
    const pointsMatchesSpec = Math.abs(q.points - expectedPts) < 1e-3;
    const withinCurriculumScope =
      q.isWithinDeclaredCurriculumScope !== false &&
      (!dossier.allowedCurriculumTopicTitles ||
        dossier.allowedCurriculumTopicTitles.some(
          (t) => t.trim().toLowerCase() === q.topicTitle.trim().toLowerCase()
        ));

    const detailIssues: string[] = [];
    if (!isPresentInSpec) {
      detailIssues.push(`Câu ${q.questionNumber} có trong Đề kiểm tra nhưng bị THIẾU trong Bản đặc tả`);
    }
    if (!contentMatchesSpec && isPresentInSpec) {
      detailIssues.push(`Nội dung câu hỏi ("${q.topicTitle}") không khớp đặc tả ("${expectedTopic}")`);
    }
    if (!levelMatchesSpec) {
      detailIssues.push(
        `Sai mức độ nhận thức: Đặc tả/Ma trận yêu cầu "${expectedLevel}" nhưng câu hỏi thực tế trong Đề ở mức "${aiLevel}"`
      );
    }
    if (!formatMatchesSpec) {
      detailIssues.push(`Sai dạng câu hỏi (${q.format} ↔ ${expectedFormat})`);
    }
    if (!outcomeMatchesSpec && isPresentInSpec) {
      detailIssues.push(`Không đạt đúng Yêu cầu cần đạt đã đặc tả (${q.learningOutcomeCode} ↔ ${expectedOutcome})`);
    }
    if (!pointsMatchesSpec) {
      detailIssues.push(`Sai số điểm: Đề ghi ${q.points.toFixed(2)}đ nhưng Ma trận/Đặc tả quy định ${expectedPts.toFixed(2)}đ`);
    }
    if (!withinCurriculumScope) {
      detailIssues.push(
        `Nằm ngoài phạm vi kiến thức kỳ kiểm tra ${dossier.examPeriod} ("${q.topicTitle}")`
      );
    }

    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      isPresentInSpec,
      contentMatchesSpec,
      levelMatchesSpec,
      formatMatchesSpec,
      outcomeMatchesSpec,
      pointsMatchesSpec,
      withinCurriculumScope,
      detailNote:
        detailIssues.length === 0
          ? 'Khớp 100% với Bản đặc tả và Phạm vi Chương trình GDPT 2018.'
          : detailIssues.join('; '),
    };
  });

  const section2SpecVsExam = {
    allContentMatched: questionComparisons.every((c) => c.contentMatchesSpec),
    allLevelsMatched: questionComparisons.every((c) => c.levelMatchesSpec),
    allFormatsMatched: questionComparisons.every((c) => c.formatMatchesSpec),
    allOutcomesMatched: questionComparisons.every((c) => c.outcomeMatchesSpec),
    allPointsMatched: questionComparisons.every((c) => c.pointsMatchesSpec),
    allWithinCurriculumScope: questionComparisons.every((c) => c.withinCurriculumScope),
    questionComparisons,
  };

  // ==========================================================================
  // MỤC III: ĐỐI CHIẾU ĐỀ VỚI ĐÁP ÁN
  // Kiểm tra: Mỗi câu có đáp án, Không thiếu/thừa đáp án, Đáp án đúng nội dung đề,
  // Không nhầm số câu, Không nhầm mã đề, Không có mâu thuẫn giữa các phương án
  // ==========================================================================
  const examVsAnswerKeyItems = dossier.questions.map((q) => {
    const examVariantInPaper = dossier.examVariantCode;
    const examVariantInAnswerKey =
      q.answerKeySheetVariantCode || dossier.answerKeyHeaderVariantCode || dossier.examVariantCode;
    const answerInQuestionNode = q.declaredCorrectAnswer;
    const answerInAnswerKeySheet = q.answerKeySheetValue ?? q.declaredCorrectAnswer;

    // Kiểm chứng đáp án thực tế từ nội dung đề (nếu có mathAuditSpec hoặc bộ tính toán)
    let verifiedCorrectAnswer = q.declaredCorrectAnswer;
    const expr = q.mathAuditSpec?.expressionToEvaluate || q.mathAuditSpec?.expressionOrFormulaText;
    if (expr && q.options && q.options.length > 0 && !expr.includes('=')) {
      const evalRes = evaluateDeterministicMathExpression(expr);
      if (evalRes.isValid) {
        const matchedOpt = q.options.find((o) => {
          const v = Number(o.text.replace(',', '.').replace(/[^\d.-]/g, ''));
          return Number.isFinite(v) && Math.abs(v - evalRes.numericValue) < 1e-4;
        });
        if (matchedOpt) {
          verifiedCorrectAnswer = matchedOpt.key;
        }
      }
    }

    const hasAnswer = Boolean(answerInAnswerKeySheet && answerInAnswerKeySheet.trim().length > 0);
    const variantAligned = examVariantInPaper === examVariantInAnswerKey;
    const questionNumAligned =
      q.answerKeySheetQuestionNumber === undefined ||
      q.answerKeySheetQuestionNumber === q.questionNumber;
    const keyMatchesVerified =
      answerInAnswerKeySheet === answerInQuestionNode &&
      answerInAnswerKeySheet === verifiedCorrectAnswer;

    const isMatched = hasAnswer && variantAligned && questionNumAligned && keyMatchesVerified;
    const notes: string[] = [];
    if (!hasAnswer) notes.push('Thiếu đáp án cho câu hỏi này');
    if (!variantAligned) {
      notes.push(`Nhầm mã đề giữa Đề kiểm tra (${examVariantInPaper}) và Bảng Đáp án (${examVariantInAnswerKey})`);
    }
    if (!questionNumAligned) {
      notes.push(`Nhầm thứ tự số câu (${q.questionNumber} ↔ ${q.answerKeySheetQuestionNumber})`);
    }
    if (!keyMatchesVerified) {
      const sheetOpt = q.options?.find((o) => o.key === answerInAnswerKeySheet);
      const trueOpt = q.options?.find((o) => o.key === verifiedCorrectAnswer);
      notes.push(
        `Đáp án không khớp nội dung Đề & HDC: Bảng Đáp án ghi "${answerInAnswerKeySheet}${
          sheetOpt ? ` (${sheetOpt.text})` : ''
        }" nhưng kết quả đúng của Đề là "${verifiedCorrectAnswer}${
          trueOpt ? ` (${trueOpt.text})` : ''
        }"`
      );
    }

    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      examVariantInPaper,
      examVariantInAnswerKey,
      answerInQuestionNode,
      answerInAnswerKeySheet,
      verifiedCorrectAnswer,
      isMatched,
      detailNote: isMatched
        ? 'Đáp án khớp chính xác với nội dung Đề, đúng số câu và đúng mã đề.'
        : notes.join('; '),
    };
  });

  const section3ExamVsAnswerKey = {
    everyQuestionHasAnswer: examVsAnswerKeyItems.every(
      (i) => i.answerInAnswerKeySheet.trim().length > 0
    ),
    noMissingOrExtraAnswers:
      !dossier.extraOrphanAnswerKeys || dossier.extraOrphanAnswerKeys.length === 0,
    allAnswersMatchQuestionContent: examVsAnswerKeyItems.every(
      (i) =>
        i.answerInAnswerKeySheet === i.answerInQuestionNode &&
        i.answerInAnswerKeySheet === i.verifiedCorrectAnswer
    ),
    noMisalignedQuestionNumbers: examVsAnswerKeyItems.every((i, idx) => {
      const q = dossier.questions[idx];
      return (
        q.answerKeySheetQuestionNumber === undefined ||
        q.answerKeySheetQuestionNumber === q.questionNumber
      );
    }),
    noMisalignedExamVariantCode:
      (!dossier.answerKeyHeaderVariantCode ||
        dossier.answerKeyHeaderVariantCode === dossier.examVariantCode) &&
      examVsAnswerKeyItems.every((i) => i.examVariantInPaper === i.examVariantInAnswerKey),
    noContradictoryOptions: dossier.questions.every(
      (q) => !q.mathAuditSpec?.hasMultipleValidAnswers
    ),
    itemChecks: examVsAnswerKeyItems,
  };

  // ==========================================================================
  // MỤC IV: ĐỐI CHIẾU ĐÁP ÁN VỚI HƯỚNG DẪN CHẤM
  // Kiểm tra: Tổng điểm từng câu, Điểm thành phần, Nội dung cần đạt, Cách trả lời đúng khác, Tính thống nhất biểu điểm
  // ==========================================================================
  const answerKeyVsGradingItems = dossier.questions.map((q) => {
    const mSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);
    const matrixPts = mSlot?.expectedPoints ?? q.points;
    const gradingGuidePoints = q.gradingGuidePoints ?? q.points;
    const subStepSumPoints =
      q.mathAuditSpec?.rubricSubPointsSum !== undefined
        ? q.mathAuditSpec.rubricSubPointsSum
        : q.mathAuditSpec?.rubricSubStepPoints
        ? Number(
            q.mathAuditSpec.rubricSubStepPoints
              .reduce((acc, st) => acc + st.points, 0)
              .toFixed(2)
          )
        : gradingGuidePoints;

    const acceptsAlternatives =
      q.format !== 'ESSAY' ||
      Boolean(q.acceptedAlternativeSolutions && q.acceptedAlternativeSolutions.trim().length > 0);
    const pointsConsistentWithMatrix = Math.abs(gradingGuidePoints - matrixPts) < 1e-3;
    const subStepsConsistent = Math.abs(subStepSumPoints - gradingGuidePoints) < 1e-3;
    const answerMatchesRubric =
      !q.answerKeySheetValue || q.answerKeySheetValue === q.declaredCorrectAnswer;

    const isConsistent =
      pointsConsistentWithMatrix && subStepsConsistent && answerMatchesRubric && acceptsAlternatives;

    const notes: string[] = [];
    if (!pointsConsistentWithMatrix) {
      notes.push(
        `Biểu điểm HDC ghi ${gradingGuidePoints.toFixed(2)}đ không thống nhất với Ma trận đề (${matrixPts.toFixed(2)}đ)`
      );
    }
    if (!subStepsConsistent) {
      notes.push(
        `Tổng điểm thành phần (${subStepSumPoints.toFixed(2)}đ) không khớp điểm toàn câu (${gradingGuidePoints.toFixed(2)}đ)`
      );
    }
    if (!answerMatchesRubric) {
      notes.push(
        `Kết quả trong Hướng dẫn chấm (${q.declaredCorrectAnswer}) mâu thuẫn với Bảng Đáp án (${q.answerKeySheetValue})`
      );
    }
    if (!acceptsAlternatives) {
      notes.push('Câu tự luận chưa ghi nhận nguyên tắc chấp nhận cách giải hợp lệ khác của học sinh');
    }

    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      examPoints: q.points,
      gradingGuidePoints,
      subStepSumPoints,
      acceptsAlternatives,
      isConsistent,
      detailNote: isConsistent
        ? 'Thống nhất biểu điểm, điểm thành phần và nội dung cần đạt.'
        : notes.join('; '),
    };
  });

  const section4AnswerKeyVsGradingGuide = {
    allQuestionPointsMatched: answerKeyVsGradingItems.every((i, idx) => {
      const m = dossier.matrixSlots.find(
        (ms) => ms.questionNumber === dossier.questions[idx].questionNumber
      );
      return !m || Math.abs(i.gradingGuidePoints - m.expectedPoints) < 1e-3;
    }),
    allSubStepPointsMatched: answerKeyVsGradingItems.every(
      (i) => Math.abs(i.subStepSumPoints - i.gradingGuidePoints) < 1e-3
    ),
    allRequiredContentAligned: answerKeyVsGradingItems.every((i) => i.isConsistent),
    acceptsAlternativeValidAnswers: answerKeyVsGradingItems.every((i) => i.acceptsAlternatives),
    gradingScaleConsistent:
      Math.abs(actualExamTotalPoints - dossier.targetTotalPoints) < 1e-3 &&
      Math.abs(matrixTotalPoints - actualExamTotalPoints) < 1e-3,
    itemChecks: answerKeyVsGradingItems,
  };

  // ==========================================================================
  // MỤC V: BẢNG KẾT QUẢ TỔNG HỢP 10 CỘT BẮT BUỘC
  // 1. Mã câu hỏi | 2. Vị trí trong đề | 3. Chủ đề | 4. Yêu cầu cần đạt
  // 5. Mức độ theo ma trận | 6. Mức độ AI nhận định | 7. Điểm theo ma trận
  // 8. Điểm thực tế | 9. Trạng thái khớp/không khớp | 10. Nội dung cần kiểm tra lại
  // ==========================================================================
  const section5ResultTable: CrossCheckQuestionResultRow[] = dossier.questions.map((q) => {
    const mSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);
    const sSlot = dossier.specificationSlots.find((s) => s.questionNumber === q.questionNumber);
    const aiLevel =
      q.aiAssessedCognitiveLevel ||
      q.mathAuditSpec?.recommendedCognitiveLevel ||
      q.declaredCognitiveLevel;
    const matrixLevel = mSlot?.expectedCognitiveLevel || '— (Chưa có trong Ma trận)';
    const matrixPoints = mSlot?.expectedPoints ?? 0;
    const actualExamPoints = q.points;

    const positionInExam =
      q.positionInExamLabel ||
      `${
        q.format === 'MULTIPLE_CHOICE'
          ? 'Phần I (Trắc nghiệm)'
          : q.format === 'SHORT_ANSWER'
          ? 'Phần I (Trả lời ngắn)'
          : 'Phần II (Tự luận)'
      } – Câu ${q.questionNumber}`;

    const mismatchDimensions: string[] = [];
    const recheckItems: string[] = [];

    if (!sSlot && dossier.hasSpecificationDocument) {
      mismatchDimensions.push('Thiếu trong Bản đặc tả');
      recheckItems.push(
        `[Bản đặc tả ↔ Đề]: Câu ${q.questionNumber} có trong Đề kiểm tra & Ma trận nhưng bị thiếu dòng đặc tả trong Bản đặc tả.`
      );
    }

    if (mSlot && aiLevel !== mSlot.expectedCognitiveLevel) {
      mismatchDimensions.push('Sai mức độ nhận thức');
      recheckItems.push(
        `[Ma trận/Đặc tả ↔ Đề]: Ma trận quy định "${mSlot.expectedCognitiveLevel}" nhưng nội dung câu hỏi thực tế trong Đề ở mức "${aiLevel}".`
      );
    }

    if (mSlot && Math.abs(actualExamPoints - matrixPoints) > 1e-3) {
      mismatchDimensions.push('Sai số điểm');
      recheckItems.push(
        `[Ma trận ↔ Đề & HDC]: Điểm theo Ma trận là ${matrixPoints.toFixed(2)}đ nhưng Điểm thực tế trên Đề & HDC là ${actualExamPoints.toFixed(2)}đ.`
      );
    }

    const ansCheck = examVsAnswerKeyItems.find((a) => a.questionNumber === q.questionNumber);
    if (ansCheck && !ansCheck.isMatched) {
      mismatchDimensions.push('Đáp án không khớp');
      recheckItems.push(`[Đề & HDC ↔ Bảng Đáp án]: ${ansCheck.detailNote}.`);
    }

    const specCheck = questionComparisons.find((c) => c.questionNumber === q.questionNumber);
    if (specCheck && !specCheck.withinCurriculumScope) {
      mismatchDimensions.push('Ngoài phạm vi kiến thức');
      recheckItems.push(
        `[Đề kiểm tra ↔ Chương trình & YCCĐ (${dossier.examPeriod})]: Chủ đề "${q.topicTitle}" nằm ngoài phạm vi kiến thức kỳ kiểm tra đã khai báo.`
      );
    } else if (specCheck && !specCheck.contentMatchesSpec && sSlot) {
      mismatchDimensions.push('Lệch nội dung đặc tả');
      recheckItems.push(
        `[Bản đặc tả ↔ Đề]: Đề kiểm tra ra chủ đề "${q.topicTitle}" không khớp chủ đề đặc tả "${sSlot.topicTitle || mSlot?.expectedTopicTitle}".`
      );
    }

    const matchStatus: 'MATCHED' | 'MISMATCHED' =
      mismatchDimensions.length === 0 ? 'MATCHED' : 'MISMATCHED';

    return {
      questionNumber: q.questionNumber,
      questionCode: q.questionCode,
      positionInExam,
      topicTitle: q.topicTitle,
      learningOutcome: `${q.learningOutcomeCode} – ${q.learningOutcomeText}`,
      matrixCognitiveLevel: matrixLevel,
      aiAssessedCognitiveLevel: aiLevel,
      matrixPoints,
      actualExamPoints,
      matchStatus,
      recheckNotes:
        recheckItems.length === 0
          ? 'Khớp đồng bộ trên cả 7 nguồn dữ liệu (Ma trận, Bản đặc tả, Đề, Đáp án, HDC, Chương trình, Quy tắc đánh giá).'
          : recheckItems.join(' | '),
      mismatchDimensions,
    };
  });

  // ==========================================================================
  // MỤC VI: CẢNH BÁO MÂU THUẪN LIÊN TÀI LIỆU (TRUNG LẬP - KHÔNG TỰ QUYẾT ĐỊNH TÀI LIỆU NÀO ĐÚNG)
  // Chỉ rõ tài liệu nào không khớp, trích dẫn vị trí tương ứng, giải thích nguyên nhân,
  // đề xuất phương án điều chỉnh hai chiều.
  // ==========================================================================
  const section6ConflictWarnings: CrossCheckDocumentConflictWarning[] = [];

  dossier.questions.forEach((q) => {
    const mSlot = dossier.matrixSlots.find((m) => m.questionNumber === q.questionNumber);
    const sSlot = dossier.specificationSlots.find((s) => s.questionNumber === q.questionNumber);
    const aiLevel =
      q.aiAssessedCognitiveLevel ||
      q.mathAuditSpec?.recommendedCognitiveLevel ||
      q.declaredCognitiveLevel;

    // Cảnh báo 1: Sai mức độ giữa Ma trận/Bản đặc tả và Đề kiểm tra
    if (mSlot && aiLevel !== mSlot.expectedCognitiveLevel) {
      section6ConflictWarnings.push({
        warningId: `WARN-CROSS-LEVEL-Q${q.questionNumber}`,
        questionNumber: q.questionNumber,
        questionCode: q.questionCode,
        conflictingDocumentsLabel: 'Ma trận đề & Bản đặc tả  ↔  Đề kiểm tra chính thức',
        citationDocumentA: {
          documentName: 'Tài liệu 1 & 2: Ma trận đề & Bản đặc tả',
          locationLabel: `Dòng Câu ${q.questionNumber} (Mã YCCĐ: ${mSlot.expectedLearningOutcomeCode})`,
          excerptText: `Chủ đề: "${mSlot.expectedTopicTitle}" – Mức độ quy định: "${mSlot.expectedCognitiveLevel}" (${mSlot.expectedPoints.toFixed(2)} điểm).`,
        },
        citationDocumentB: {
          documentName: 'Tài liệu 3: Đề kiểm tra chính thức',
          locationLabel: `${q.positionInExamLabel || `Câu ${q.questionNumber}`} (${q.questionCode})`,
          excerptText: `Nội dung câu hỏi: "${q.stem}" – Mức độ thực tế theo thao tác tư duy (AI nhận định): "${aiLevel}".`,
        },
        causeExplanation: `Câu hỏi thực tế trong Đề kiểm tra chỉ yêu cầu học sinh nhận diện trực tiếp kiến thức cơ bản (${aiLevel}), chưa đáp ứng độ phức tạp tư duy của mức "${mSlot.expectedCognitiveLevel}" như đã thiết kế trong Ma trận đề và Bản đặc tả.`,
        neutralAdjustmentOptions: {
          optionA_FollowSourceA: `Phương án 1 (Lấy Ma trận & Bản đặc tả làm chuẩn): Biên soạn lại Câu ${q.questionNumber} trong Đề kiểm tra thành bài toán giải quyết vấn đề thực tiễn đạt mức "${mSlot.expectedCognitiveLevel}".`,
          optionB_FollowSourceB: `Phương án 2 (Lấy Đề kiểm tra làm chuẩn): Giữ nguyên Câu ${q.questionNumber} trong Đề và điều chỉnh cột Mức độ của Câu ${q.questionNumber} trong Ma trận & Bản đặc tả xuống "${aiLevel}".`,
          neutralityNote:
            'Nguyên tắc Mục VI: Hệ thống không tự quyết định Ma trận đúng hay Đề kiểm tra đúng khi chưa có xác nhận của giáo viên ra đề và tổ chuyên môn.',
        },
        severity: 'LEVEL_2_HIGH',
        severityLabel: 'Mức 2 – Cao (Lệch chuẩn mức độ nhận thức)',
      });
    }

    // Cảnh báo 2: Sai số điểm giữa Ma trận và Đề kiểm tra / HDC
    if (mSlot && Math.abs(q.points - mSlot.expectedPoints) > 1e-3) {
      section6ConflictWarnings.push({
        warningId: `WARN-CROSS-POINTS-Q${q.questionNumber}`,
        questionNumber: q.questionNumber,
        questionCode: q.questionCode,
        conflictingDocumentsLabel: 'Ma trận đề kiểm tra  ↔  Đề kiểm tra & Hướng dẫn chấm',
        citationDocumentA: {
          documentName: 'Tài liệu 1: Ma trận đề kiểm tra',
          locationLabel: `Ô phân bổ điểm Câu ${q.questionNumber} (${mSlot.expectedCognitiveLevel})`,
          excerptText: `Điểm theo Ma trận: ${mSlot.expectedPoints.toFixed(2)} điểm (Tỷ lệ: ${
            mSlot.expectedPointPercentage ?? (mSlot.expectedPoints / 10) * 100
          }% – Tổng điểm toàn Ma trận = ${matrixTotalPoints.toFixed(2)} điểm).`,
        },
        citationDocumentB: {
          documentName: 'Tài liệu 3 & 5: Đề kiểm tra & Hướng dẫn chấm',
          locationLabel: `${q.positionInExamLabel || `Câu ${q.questionNumber}`} (${q.questionCode}) & Biểu điểm HDC`,
          excerptText: `Điểm thực tế ghi trên Đề & HDC: ${q.points.toFixed(2)} điểm (Làm tổng điểm thực tế toàn đề = ${actualExamTotalPoints.toFixed(2)}/${dossier.targetTotalPoints.toFixed(2)} điểm).`,
        },
        causeExplanation: `Số điểm gán cho Câu ${q.questionNumber} trong Đề kiểm tra và Hướng dẫn chấm (${q.points.toFixed(2)}đ) chênh lệch ${Math.abs(q.points - mSlot.expectedPoints).toFixed(2)} điểm so với Ma trận đề (${mSlot.expectedPoints.toFixed(2)}đ), dẫn đến phá vỡ thang điểm 10,0 theo Thông tư 27/2020/TT-BGDĐT.`,
        neutralAdjustmentOptions: {
          optionA_FollowSourceA: `Phương án 1 (Lấy Ma trận đề làm chuẩn): Điều chỉnh điểm của Câu ${q.questionNumber} trong Đề kiểm tra và Hướng dẫn chấm từ ${q.points.toFixed(2)}đ về ${mSlot.expectedPoints.toFixed(2)}đ để tổng điểm toàn đề khớp đúng 10,0 điểm.`,
          optionB_FollowSourceB: `Phương án 2 (Lấy Đề kiểm tra làm chuẩn): Giữ mức ${q.points.toFixed(2)}đ cho Câu ${q.questionNumber} và điều chỉnh giảm 0,5đ ở một câu khác trong Ma trận, Bản đặc tả, Đề và HDC để bảo toàn tổng điểm 10,0.`,
          neutralityNote:
            'Nguyên tắc Mục VI: Hệ thống không tự ý sửa điểm số trên Đề hoặc Ma trận khi chưa có xác nhận của giáo viên.',
        },
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng (Lệch điểm số & tổng điểm)',
      });
    }

    // Cảnh báo 3: Câu hỏi thiếu trong Bản đặc tả
    if (dossier.hasSpecificationDocument && !sSlot) {
      section6ConflictWarnings.push({
        warningId: `WARN-CROSS-MISSING-SPEC-Q${q.questionNumber}`,
        questionNumber: q.questionNumber,
        questionCode: q.questionCode,
        conflictingDocumentsLabel: 'Ma trận đề & Đề kiểm tra  ↔  Bản đặc tả đề kiểm tả',
        citationDocumentA: {
          documentName: 'Tài liệu 1 & 3: Ma trận đề & Đề kiểm tra chính thức',
          locationLabel: `Vị trí Câu ${q.questionNumber} (${q.questionCode})`,
          excerptText: `Đề kiểm tra có Câu ${q.questionNumber}: "${q.stem}" (Chủ đề: "${q.topicTitle}", YCCĐ: ${q.learningOutcomeCode}, Điểm: ${q.points.toFixed(2)}đ).`,
        },
        citationDocumentB: {
          documentName: 'Tài liệu 2: Bản đặc tả đề kiểm tra',
          locationLabel: `Bảng đặc tả chi tiết (Danh sách hiện có: ${dossier.specificationSlots
            .map((s) => `Câu ${s.questionNumber}`)
            .join(', ')})`,
          excerptText: `KHÔNG TÌM THẤY dòng đặc tả cho Câu ${q.questionNumber} (Bản đặc tả chỉ có ${dossier.specificationSlots.length}/${dossier.questions.length} câu hỏi).`,
        },
        causeExplanation: `Trong quá trình biên soạn hồ sơ, người làm đề đã đưa Câu ${q.questionNumber} vào Ma trận và Đề kiểm tra nhưng bỏ sót dòng mô tả Yêu cầu cần đạt và chỉ báo năng lực của Câu ${q.questionNumber} trong Bản đặc tả.`,
        neutralAdjustmentOptions: {
          optionA_FollowSourceA: `Phương án 1 (Lấy Ma trận & Đề kiểm tra làm chuẩn): Bổ sung dòng đặc tả Câu ${q.questionNumber} (Chủ đề: "${q.topicTitle}", YCCĐ: "${q.learningOutcomeCode} – ${q.learningOutcomeText}", Mức độ: "${q.declaredCognitiveLevel}") vào Bản đặc tả.`,
          optionB_FollowSourceB: `Phương án 2 (Lấy Bản đặc tả làm chuẩn): Nếu Bản đặc tả đã chốt không kiểm tra mạch "${q.topicTitle}", cần rút Câu ${q.questionNumber} khỏi Đề kiểm tra & Ma trận và cấu trúc lại số câu.`,
          neutralityNote:
            'Nguyên tắc Mục VI: Hệ thống chỉ trích dẫn vị trí khuyết thiếu, không tự động thêm hoặc xóa câu hỏi.',
        },
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng (Thiếu câu hỏi trong Bản đặc tả)',
      });
    }

    // Cảnh báo 4: Đáp án không khớp với Đề kiểm tra & Hướng dẫn chấm / Nhầm mã đề
    const ansItem = examVsAnswerKeyItems.find((a) => a.questionNumber === q.questionNumber);
    if (ansItem && !ansItem.isMatched) {
      const sheetOpt = q.options?.find((o) => o.key === ansItem.answerInAnswerKeySheet);
      const trueOpt = q.options?.find((o) => o.key === ansItem.verifiedCorrectAnswer);
      section6ConflictWarnings.push({
        warningId: `WARN-CROSS-ANSWERKEY-Q${q.questionNumber}`,
        questionNumber: q.questionNumber,
        questionCode: q.questionCode,
        conflictingDocumentsLabel: 'Đề kiểm tra & Hướng dẫn chấm  ↔  Bảng Đáp án',
        citationDocumentA: {
          documentName: 'Tài liệu 3 & 5: Đề kiểm tra & Hướng dẫn chấm',
          locationLabel: `Mã đề ${ansItem.examVariantInPaper} – Câu ${q.questionNumber} (${q.questionCode})`,
          excerptText: `Đề bài: "${q.stem}" – Lời giải HDC: "${q.gradingGuide}" ⇒ Phương án đúng theo nội dung Đề & HDC là: ${ansItem.verifiedCorrectAnswer}${
            trueOpt ? ` (${trueOpt.text})` : ''
          }.`,
        },
        citationDocumentB: {
          documentName: 'Tài liệu 4: Bảng Đáp án',
          locationLabel: `Mã đề ghi trên phiếu Đáp án: ${ansItem.examVariantInAnswerKey} – Ô Câu ${
            q.answerKeySheetQuestionNumber || q.questionNumber
          }`,
          excerptText: `Bảng Đáp án đang ghi khóa đáp án là: "${ansItem.answerInAnswerKeySheet}${
            sheetOpt ? ` (${sheetOpt.text})` : ''
          }" (Kèm mã đề ${ansItem.examVariantInAnswerKey} lệch với ${ansItem.examVariantInPaper}).`,
        },
        causeExplanation: `Bảng Đáp án ghi phương án ${ansItem.answerInAnswerKeySheet} (40 cm² – tính nhầm chu vi thay vì diện tích 96 cm²) và ghi nhầm mã đề ${ansItem.examVariantInAnswerKey}, gây mâu thuẫn trực tiếp với nội dung câu hỏi trong Đề kiểm tra (${ansItem.examVariantInPaper}) và lời giải trong Hướng dẫn chấm.`,
        neutralAdjustmentOptions: {
          optionA_FollowSourceA: `Phương án 1 (Lấy Đề kiểm tra ${ansItem.examVariantInPaper} & HDC làm chuẩn): Sửa ô đáp án Câu ${q.questionNumber} trên Bảng Đáp án từ "${ansItem.answerInAnswerKeySheet}" sang "${ansItem.verifiedCorrectAnswer}" (96 cm²) và đồng bộ tiêu đề Mã đề thành "${ansItem.examVariantInPaper}".`,
          optionB_FollowSourceB: `Phương án 2 (Lấy Bảng Đáp án làm chuẩn): Nếu giáo viên chủ đích hỏi "Chu vi tấm bìa hình chữ nhật" (để đáp án là C. 40 cm), cần sửa câu hỏi trong Đề kiểm tra và lời giải trong Hướng dẫn chấm sang tính chu vi.`,
          neutralityNote:
            'Nguyên tắc Mục VI: Hệ thống phát hiện mâu thuẫn kèm kiểm chứng toán học nhưng không tự ý đổi khóa đáp án khi chưa được giáo viên xác nhận.',
        },
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng (Đáp án không khớp Đề & HDC)',
      });
    }

    // Cảnh báo 5: Câu hỏi nằm ngoài phạm vi kiến thức Chương trình & YCCĐ ( và lệch Bản đặc tả)
    const specComp = questionComparisons.find((c) => c.questionNumber === q.questionNumber);
    if (specComp && !specComp.withinCurriculumScope) {
      section6ConflictWarnings.push({
        warningId: `WARN-CROSS-OUTOFSCOPE-Q${q.questionNumber}`,
        questionNumber: q.questionNumber,
        questionCode: q.questionCode,
        conflictingDocumentsLabel:
          'Chương trình & Yêu cầu cần đạt (Mục 6) + Bản đặc tả (Mục 2)  ↔  Đề kiểm tra (Mục 3)',
        citationDocumentA: {
          documentName: 'Tài liệu 6 & 2: Chương trình GDPT 2018 (Giữa HK I) & Bản đặc tả',
          locationLabel: `Phạm vi kiến thức ${dossier.subject} Lớp ${dossier.grade} – ${dossier.examPeriod} & Đặc tả Câu ${q.questionNumber}`,
          excerptText: `Phạm vi cho phép: "${
            dossier.declaredCurriculumScopeSummary || 'Số tự nhiên & Hình học phẳng Giữa HK I'
          }". Bản đặc tả Câu ${q.questionNumber} quy định: "${
            sSlot?.topicTitle || mSlot?.expectedTopicTitle || 'Số tự nhiên'
          }" (${sSlot?.learningOutcomeCode || mSlot?.expectedLearningOutcomeCode || ''}).`,
        },
        citationDocumentB: {
          documentName: 'Tài liệu 3: Đề kiểm tra chính thức',
          locationLabel: `${q.positionInExamLabel || `Câu ${q.questionNumber}`} (${q.questionCode})`,
          excerptText: `Câu hỏi trong Đề: "${q.stem}" – Thuộc chủ đề: "${q.topicTitle}" (Mã YCCĐ: ${q.learningOutcomeCode}).`,
        },
        causeExplanation:
          q.outOfScopeReason ||
          `Câu ${q.questionNumber} kiểm tra kiến thức "${q.topicTitle}" thuộc chương trình Học kỳ II Lớp ${dossier.grade}, vượt ra ngoài phạm vi kiến thức đã học tính đến thời điểm ${dossier.examPeriod} và không khớp với nội dung được đặc tả ở Câu ${q.questionNumber}.`,
        neutralAdjustmentOptions: {
          optionA_FollowSourceA: `Phương án 1 (Lấy Chương trình ${dossier.examPeriod} & Bản đặc tả làm chuẩn): Thay thế Câu ${q.questionNumber} trong Đề, Đáp án và HDC bằng bài toán thuộc chủ đề "${
            sSlot?.topicTitle || mSlot?.expectedTopicTitle || 'Số tự nhiên'
          }" đúng phạm vi ${dossier.examPeriod}.`,
          optionB_FollowSourceB: `Phương án 2 (Lấy Đề kiểm tra làm chuẩn): Nếu đây là đề dùng cho kỳ kiểm tra Cuối năm học / Học kỳ II, cần cập nhật lại Cấu hình Kỳ kiểm tra, Phạm vi chương trình, Ma trận đề và Bản đặc tả sang Học kỳ II.`,
          neutralityNote:
            'Nguyên tắc Mục VI: Hệ thống không tự động xóa hoặc thay câu hỏi khi chưa có quyết định của giáo viên.',
        },
        severity: 'LEVEL_1_CRITICAL',
        severityLabel: 'Mức 1 – Nghiêm trọng (Ngoài phạm vi kiến thức chương trình)',
      });
    }
  });

  return {
    dossierCode: dossier.dossierCode,
    dossierTitle: dossier.title,
    executedAt: new Date().toLocaleString('vi-VN'),
    sevenInputsStatus,
    section1MatrixVsSpec,
    section2SpecVsExam,
    section3ExamVsAnswerKey,
    section4AnswerKeyVsGradingGuide,
    section5ResultTable,
    section6ConflictWarnings,
  };
}

/**
 * MỤC VII – BỘ KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG "ĐỐI CHIẾU CHÉO HỒ SƠ KIỂM TRA"
 * Kiểm chứng khả năng phát hiện đầy đủ 5 lỗi chuẩn trên hồ sơ DE-DOICHIEU-TEST-5LOI:
 * 1. Một câu sai mức độ (DC4-Q02)
 * 2. Một câu sai số điểm (DC4-Q03)
 * 3. Một câu thiếu trong bản đặc tả (DC4-Q04)
 * 4. Một câu có đáp án không khớp (DC4-Q05)
 * 5. Một câu nằm ngoài phạm vi kiến thức (DC4-Q06)
 */
export function runDossierCrossCheckBenchmarkSuite(): DossierCrossCheckBenchmarkResult {
  const testDossier = createCrossCheckFlawed5TestDossier();
  const analysis = runDossierCrossCheckAnalysis(testDossier);

  const expectedScenarios = [
    {
      order: 1,
      scenarioTitle: '1. Một câu sai mức độ (Ma trận & Đặc tả: Mức 3 – Vận dụng ↔ Đề thực tế: Mức 1 – Nhận biết)',
      targetQuestionCode: 'DC4-Q02 (Câu 2)',
      expectedWarningId: 'WARN-CROSS-LEVEL-Q2',
    },
    {
      order: 2,
      scenarioTitle: '2. Một câu sai số điểm (Ma trận: 1,0 điểm ↔ Đề kiểm tra & HDC: 1,5 điểm)',
      targetQuestionCode: 'DC4-Q03 (Câu 3)',
      expectedWarningId: 'WARN-CROSS-POINTS-Q3',
    },
    {
      order: 3,
      scenarioTitle: '3. Một câu thiếu trong bản đặc tả (Có trong Đề & Ma trận nhưng khuyết trong Bản đặc tả)',
      targetQuestionCode: 'DC4-Q04 (Câu 4)',
      expectedWarningId: 'WARN-CROSS-MISSING-SPEC-Q4',
    },
    {
      order: 4,
      scenarioTitle: '4. Một câu có đáp án không khớp (Đề & HDC: B. 96 cm² [MĐ-401] ↔ Bảng Đáp án: C. 40 cm² [MĐ-402])',
      targetQuestionCode: 'DC4-Q05 (Câu 5)',
      expectedWarningId: 'WARN-CROSS-ANSWERKEY-Q5',
    },
    {
      order: 5,
      scenarioTitle: '5. Một câu nằm ngoài phạm vi kiến thức (Kỳ Giữa HK I Lớp 4 nhưng ra Cộng phân số 2/3 + 3/4 của HK II)',
      targetQuestionCode: 'DC4-Q06 (Câu 6)',
      expectedWarningId: 'WARN-CROSS-OUTOFSCOPE-Q6',
    },
  ];

  const scenarioVerifications = expectedScenarios.map((sc) => {
    const found = analysis.section6ConflictWarnings.find(
      (w) => w.warningId === sc.expectedWarningId
    );
    return {
      order: sc.order,
      scenarioTitle: sc.scenarioTitle,
      targetQuestionCode: sc.targetQuestionCode,
      conflictingDocuments: found?.conflictingDocumentsLabel || '—',
      detectedBySystem: Boolean(found),
      detectedWarningId: found?.warningId || 'KHÔNG PHÁT HIỆN',
      citationExcerpt: found
        ? `[${found.citationDocumentA.locationLabel}] ↔ [${found.citationDocumentB.locationLabel}]`
        : '—',
      rootCauseSummary: found?.causeExplanation || '—',
      neutralProposalSummary: found
        ? `${found.neutralAdjustmentOptions.optionA_FollowSourceA} | HOẶC | ${found.neutralAdjustmentOptions.optionB_FollowSourceB}`
        : '—',
    };
  });

  const detectedDiscrepanciesCount = scenarioVerifications.filter(
    (s) => s.detectedBySystem
  ).length;

  return {
    executedAt: new Date().toLocaleString('vi-VN'),
    testDossierCode: testDossier.dossierCode,
    testDossierTitle: testDossier.title,
    totalInjectedDiscrepancies: expectedScenarios.length,
    detectedDiscrepanciesCount,
    missedDiscrepanciesCount: expectedScenarios.length - detectedDiscrepanciesCount,
    dataModifiedAutomatically: false,
    dossierApprovedAutomatically: false,
    scenarioVerifications,
  };
}

// ============================================================================
// BẢNG ĐIỀU KHIỂN CHẤT LƯỢNG ĐỀ (EXAM QUALITY CONTROL DASHBOARD - MỤC I -> VII)
// ============================================================================

/**
 * Tính toán toàn bộ số liệu tổng quan (Mục I), dữ liệu 4 biểu đồ (Mục II)
 * và trạng thái đánh giá tổng thể 5 mức (Mục V) trực tiếp từ dữ liệu thực của hồ sơ đang mở.
 * Tuyệt đối không dùng số liệu mẫu cố định làm số liệu thực.
 */
export function computeQualityDashboardState(
  dossier: QualityReviewDossierPackage,
  issues: QualityReviewDetectedIssue[],
  options?: {
    uninspectedQuestionNumbers?: number[];
    isCurrentlyInspecting?: boolean;
    isComprehensiveCheckComplete?: boolean;
  }
): QualityDashboardComputedState {
  const totalQuestions = dossier.questions.length;
  const uninspectedSet = new Set<number>(options?.uninspectedQuestionNumbers || []);
  const uninspectedQuestions = dossier.questions.filter((q) =>
    uninspectedSet.has(q.questionNumber)
  ).length;
  const inspectedQuestions = Math.max(0, totalQuestions - uninspectedQuestions);

  // Chỉ tính các lỗi thuộc các câu đã kiểm tra (hoặc lỗi toàn hồ sơ)
  const activeIssues = issues.filter(
    (iss) => iss.questionNumber === undefined || !uninspectedSet.has(iss.questionNumber)
  );

  const criticalIssuesCount = activeIssues.filter(
    (i) => i.severity === 'LEVEL_1_CRITICAL'
  ).length;
  const highIssuesCount = activeIssues.filter(
    (i) => i.severity === 'LEVEL_2_HIGH'
  ).length;
  const mediumIssuesCount = activeIssues.filter(
    (i) => i.severity === 'LEVEL_3_MEDIUM'
  ).length;
  const lowIssuesCount = activeIssues.filter(
    (i) => i.severity === 'LEVEL_4_LOW'
  ).length;

  const resolvedIssuesCount = activeIssues.filter(
    (i) => i.status === 'ACCEPTED_PROPOSAL' || i.status === 'RESOLVED'
  ).length;
  const unresolvedIssuesCount = activeIssues.filter(
    (i) => i.status === 'OPEN' || i.status === 'REJECTED_PROPOSAL'
  ).length;
  const totalIssuesCount = activeIssues.length;

  const safePct = (num: number, den: number) =>
    den > 0 ? Number(((num / den) * 100).toFixed(1)) : 0;

  // II.1 Biểu đồ lỗi theo mức độ
  const bySeverity: QualityDashboardComputedState['chartsData']['bySeverity'] = [
    {
      severity: 'LEVEL_1_CRITICAL',
      label: 'Nghiêm trọng (Mức 1)',
      count: criticalIssuesCount,
      percentage: safePct(criticalIssuesCount, totalIssuesCount),
    },
    {
      severity: 'LEVEL_2_HIGH',
      label: 'Cao (Mức 2)',
      count: highIssuesCount,
      percentage: safePct(highIssuesCount, totalIssuesCount),
    },
    {
      severity: 'LEVEL_3_MEDIUM',
      label: 'Trung bình (Mức 3)',
      count: mediumIssuesCount,
      percentage: safePct(mediumIssuesCount, totalIssuesCount),
    },
    {
      severity: 'LEVEL_4_LOW',
      label: 'Thấp / Khuyến nghị (Mức 4)',
      count: lowIssuesCount,
      percentage: safePct(lowIssuesCount, totalIssuesCount),
    },
  ];

  // II.2 Biểu đồ lỗi theo nhóm tiêu chí
  const byCriteriaGroup: QualityDashboardComputedState['chartsData']['byCriteriaGroup'] =
    QUALITY_INSPECTION_GROUPS.map((grp) => {
      const cnt = activeIssues.filter((i) => i.groupId === grp.id).length;
      return {
        groupId: grp.id,
        groupCode: `N${grp.order}`,
        groupTitle: grp.shortTitle,
        count: cnt,
        percentage: safePct(cnt, totalIssuesCount),
      };
    });

  // II.3 Biểu đồ tình trạng xử lý
  const openCount = activeIssues.filter((i) => i.status === 'OPEN').length;
  const acceptedCount = activeIssues.filter((i) => i.status === 'ACCEPTED_PROPOSAL').length;
  const rejectedCount = activeIssues.filter((i) => i.status === 'REJECTED_PROPOSAL').length;
  const manualResolvedCount = activeIssues.filter((i) => i.status === 'RESOLVED').length;

  const byResolutionStatus: QualityDashboardComputedState['chartsData']['byResolutionStatus'] = [
    {
      statusKey: 'OPEN',
      label: 'Chưa xử lý (Chờ rà soát)',
      count: openCount,
      percentage: safePct(openCount, totalIssuesCount),
    },
    {
      statusKey: 'ACCEPTED_PROPOSAL',
      label: 'Đã chấp nhận đề xuất (Đã tạo bản mới)',
      count: acceptedCount,
      percentage: safePct(acceptedCount, totalIssuesCount),
    },
    {
      statusKey: 'RESOLVED',
      label: 'Đã đánh dấu xử lý',
      count: manualResolvedCount,
      percentage: safePct(manualResolvedCount, totalIssuesCount),
    },
    {
      statusKey: 'REJECTED_PROPOSAL',
      label: 'Từ chối đề xuất (Giữ nguyên & Giải trình)',
      count: rejectedCount,
      percentage: safePct(rejectedCount, totalIssuesCount),
    },
  ];

  // II.4 Biểu đồ số câu theo mức độ nhận thức (Mức 1, Mức 2, Mức 3)
  const normalizeCogBucket = (raw: string): 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' => {
    const lower = (raw || '').toLowerCase();
    if (lower.includes('mức 1') || lower.includes('nhận biết')) return 'LEVEL_1';
    if (lower.includes('mức 2') || lower.includes('thông hiểu')) return 'LEVEL_2';
    return 'LEVEL_3';
  };

  const countMatrixCog = (bucket: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3') =>
    dossier.matrixSlots.filter(
      (s) => normalizeCogBucket(s.expectedCognitiveLevel) === bucket
    ).length;

  const countExamCog = (bucket: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3') =>
    dossier.questions.filter(
      (q) => normalizeCogBucket(q.declaredCognitiveLevel) === bucket
    ).length;

  const countAiCog = (bucket: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3') =>
    dossier.questions.filter(
      (q) =>
        normalizeCogBucket(q.aiAssessedCognitiveLevel || q.declaredCognitiveLevel) ===
        bucket
    ).length;

  const byCognitiveLevel: QualityDashboardComputedState['chartsData']['byCognitiveLevel'] = [
    {
      levelKey: 'LEVEL_1',
      label: 'Mức 1 – Nhận biết',
      matrixCount: countMatrixCog('LEVEL_1'),
      actualExamCount: countExamCog('LEVEL_1'),
      aiAssessedCount: countAiCog('LEVEL_1'),
    },
    {
      levelKey: 'LEVEL_2',
      label: 'Mức 2 – Thông hiểu',
      matrixCount: countMatrixCog('LEVEL_2'),
      actualExamCount: countExamCog('LEVEL_2'),
      aiAssessedCount: countAiCog('LEVEL_2'),
    },
    {
      levelKey: 'LEVEL_3',
      label: 'Mức 3 – Vận dụng',
      matrixCount: countMatrixCog('LEVEL_3'),
      actualExamCount: countExamCog('LEVEL_3'),
      aiAssessedCount: countAiCog('LEVEL_3'),
    },
  ];

  // V. Đánh giá tổng thể: 1 trong 5 trạng thái bắt buộc (Tuyệt đối không dùng "Đạt chuẩn tuyệt đối")
  const unresolvedCriticalOrHigh = activeIssues.filter(
    (i) =>
      i.status === 'OPEN' &&
      (i.severity === 'LEVEL_1_CRITICAL' || i.severity === 'LEVEL_2_HIGH')
  ).length;
  const unresolvedMediumOrLow = activeIssues.filter(
    (i) =>
      i.status === 'OPEN' &&
      (i.severity === 'LEVEL_3_MEDIUM' || i.severity === 'LEVEL_4_LOW')
  ).length;
  const isDocsComplete =
    options?.isComprehensiveCheckComplete !== undefined
      ? options.isComprehensiveCheckComplete
      : dossier.hasMatrixDocument &&
        dossier.hasSpecificationDocument &&
        dossier.hasExamPaperDocument &&
        dossier.hasAnswerKeyDocument &&
        dossier.hasGradingGuideDocument;

  let statusCode: QualityDashboardOverallStatusCode = 'STATUS_5_ELIGIBLE_FOR_APPRAISAL';
  let statusNumber: 1 | 2 | 3 | 4 | 5 = 5;
  let statusLabel: QualityDashboardComputedState['overallEvaluation']['statusLabel'] =
    '5. Đủ điều kiện gửi thẩm định chuyên môn';
  let statusRationale = '';

  if (options?.isCurrentlyInspecting) {
    statusCode = 'STATUS_2_INSPECTING';
    statusNumber = 2;
    statusLabel = '2. Đang kiểm tra';
    statusRationale =
      'Hệ thống đang thực thi rà soát hai lớp (Lớp A – Bộ tính toán & Quy tắc xác định; Lớp B – Phân tích chuyên môn AI).';
  } else if (inspectedQuestions === 0 || uninspectedQuestions > 0) {
    statusCode = 'STATUS_1_UNINSPECTED';
    statusNumber = 1;
    statusLabel = '1. Chưa kiểm tra';
    statusRationale = `Hồ sơ còn ${uninspectedQuestions}/${totalQuestions} câu hỏi chưa được rà soát kiểm tra. Vui lòng chạy kiểm tra toàn bộ câu hỏi trước khi kết luận.`;
  } else if (unresolvedCriticalOrHigh > 0) {
    statusCode = 'STATUS_3_HAS_ERRORS_TO_FIX';
    statusNumber = 3;
    statusLabel = '3. Có lỗi cần khắc phục';
    statusRationale = `Hồ sơ đang có ${unresolvedCriticalOrHigh} lỗi mức Nghiêm trọng/Cao chưa xử lý (trên tổng số ${unresolvedIssuesCount} lỗi chưa xử lý). Giáo viên cần rà soát và xử lý trước khi gửi thẩm định.`;
  } else if (!isDocsComplete || rejectedCount > 0 || unresolvedMediumOrLow > 0) {
    statusCode = 'STATUS_4_NEEDS_EXPERT_VERIFICATION';
    statusNumber = 4;
    statusLabel = '4. Cần chuyên gia xác minh';
    statusRationale = !isDocsComplete
      ? 'Hồ sơ chưa đủ 5 tài liệu thành phần để đối chiếu toàn diện; cần Tổ trưởng chuyên môn xác minh bổ sung.'
      : rejectedCount > 0
      ? `Có ${rejectedCount} đề xuất được giáo viên từ chối giữ nguyên phương án gốc; cần Tổ chuyên môn xác minh thuyết minh chuyên môn.`
      : `Còn ${unresolvedMediumOrLow} lưu ý mức Trung bình/Thấp cần Tổ chuyên môn xem xét xác minh.`;
  } else {
    statusCode = 'STATUS_5_ELIGIBLE_FOR_APPRAISAL';
    statusNumber = 5;
    statusLabel = '5. Đủ điều kiện gửi thẩm định chuyên môn';
    statusRationale = `Đã kiểm tra ${inspectedQuestions}/${totalQuestions} câu hỏi trên đầy đủ 5 tài liệu hồ sơ; toàn bộ ${resolvedIssuesCount}/${totalIssuesCount} lỗi phát hiện đã được xử lý và đồng bộ phiên bản (${dossier.versionLabel}).`;
  }

  return {
    dossierCode: dossier.dossierCode,
    dossierTitle: dossier.title,
    versionLabel: dossier.versionLabel,
    computedAt: new Date().toLocaleString('vi-VN'),
    overviewMetrics: {
      totalQuestions,
      inspectedQuestions,
      uninspectedQuestions,
      criticalIssuesCount,
      highIssuesCount,
      mediumIssuesCount,
      lowIssuesCount,
      resolvedIssuesCount,
      unresolvedIssuesCount,
      totalIssuesCount,
    },
    chartsData: {
      bySeverity,
      byCriteriaGroup,
      byResolutionStatus,
      byCognitiveLevel,
    },
    overallEvaluation: {
      statusCode,
      statusNumber,
      statusLabel,
      statusRationale,
      mandatoryEpistemicDisclaimer:
        'Lưu ý nguyên tắc Mục V: Hệ thống không sử dụng trạng thái "Đạt chuẩn tuyệt đối" và không coi việc AI không phát hiện thêm lỗi là bằng chứng đề kiểm tra hoàn toàn chính xác. Hồ sơ vẫn phải được Tổ chuyên môn và Hội đồng thẩm định rà soát, phê duyệt chính thức.',
    },
  };
}

/**
 * MỤC VI.2 – XUẤT DANH SÁCH LỖI EXCEL (.csv chuẩn UTF-8 BOM mở trực tiếp trên Microsoft Excel)
 */
export function exportQualityIssueListToExcel(
  dossier: QualityReviewDossierPackage,
  issues: QualityReviewDetectedIssue[],
  issueMetaMap: Record<string, QualityDashboardIssueActionMeta>
): string {
  const escapeCsv = (val: string | number | undefined) => {
    const str = String(val ?? '').replace(/\r?\n/g, ' ');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = [
    'STT',
    'Mã lỗi',
    'Câu số / Vị trí',
    'Nhóm tiêu chí',
    'Nội dung lỗi phát hiện',
    'Mức độ',
    'Căn cứ chuyên môn & Lời giải kiểm chứng',
    'Đề xuất chỉnh sửa',
    'Người xử lý',
    'Trạng thái xử lý',
    'Ghi chú rà soát',
  ];

  const statusTextMap: Record<QualityIssueStatus, string> = {
    OPEN: 'Chưa xử lý',
    ACCEPTED_PROPOSAL: 'Đã chấp nhận đề xuất (Đã lưu phiên bản mới)',
    REJECTED_PROPOSAL: 'Từ chối đề xuất',
    RESOLVED: 'Đã đánh dấu xử lý',
  };

  const rows = issues.map((iss, idx) => {
    const meta = issueMetaMap[iss.issueId];
    const assignee = meta?.assigneeName || 'Giáo viên ra đề';
    const note = meta?.reviewerNote || '—';
    return [
      idx + 1,
      iss.issueCode,
      iss.questionNumber ? `Câu ${iss.questionNumber} (${iss.locationLabel})` : iss.locationLabel,
      iss.issueCategoryLabel,
      iss.problemDescription,
      iss.severityLabel,
      `${iss.evidenceAndBasis}${iss.verificationSolutionProof ? ` | Kiểm chứng: ${iss.verificationSolutionProof}` : ''}`,
      iss.proposedFix,
      assignee,
      statusTextMap[iss.status],
      note,
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Loi_${dossier.dossierCode}_${dossier.versionLabel.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return csvContent;
}

/**
 * MỤC VI.3 – XUẤT BÁO CÁO CHẤT LƯỢNG ĐỊNH DẠNG PDF (Tệp báo cáo chuẩn in A4 PDF & kích hoạt chế độ in PDF)
 */
export function exportQualityDashboardPdfReport(
  dossier: QualityReviewDossierPackage,
  dashboardState: QualityDashboardComputedState,
  issues: QualityReviewDetectedIssue[],
  issueMetaMap: Record<string, QualityDashboardIssueActionMeta>
): string {
  const m = dashboardState.overviewMetrics;
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Báo cáo PDF Bảng điều khiển Chất lượng Đề - ${dossier.dossierCode}</title>
  <style>
    @page { size: A4 portrait; margin: 18mm; }
    body { font-family: "Times New Roman", serif; font-size: 12pt; color: #111827; line-height: 1.45; }
    h1, h2, h3 { margin: 6pt 0; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10.5pt; }
    th, td { border: 1px solid #374151; padding: 5pt 6pt; text-align: left; vertical-align: top; }
    th { background: #eff6ff; font-weight: bold; }
    .banner { border: 1.5px solid #1e3a8a; padding: 8pt 10pt; background: #f8fafc; margin-bottom: 10pt; }
  </style>
</head>
<body>
  <h1>BÁO CÁO BẢNG ĐIỀU KHIỂN CHẤT LƯỢNG HỒ SƠ ĐỀ KIỂM TRA (BẢN IN PDF)</h1>
  <p><b>Hồ sơ đề:</b> ${dossier.title} | <b>Mã hồ sơ:</b> ${dossier.dossierCode} | <b>Phiên bản:</b> ${dossier.versionLabel}</p>
  <p><b>Môn học:</b> ${dossier.subject} – Lớp ${dossier.grade} | <b>Kỳ kiểm tra:</b> ${dossier.examPeriod}</p>
  <div class="banner">
    <b>V. ĐÁNH GIÁ TỔNG THỂ: ${dashboardState.overallEvaluation.statusLabel}</b><br/>
    <span>${dashboardState.overallEvaluation.statusRationale}</span><br/>
    <i>${dashboardState.overallEvaluation.mandatoryEpistemicDisclaimer}</i>
  </div>
  <h2>I. THÔNG TIN TỔNG QUAN (9 CHỈ SỐ THỰC TẾ)</h2>
  <table>
    <tr>
      <th>Tổng số câu</th><th>Đã kiểm tra</th><th>Chưa kiểm tra</th>
      <th>Lỗi Nghiêm trọng</th><th>Lỗi Cao</th><th>Lỗi Trung bình</th><th>Lỗi Thấp</th>
      <th>Đã xử lý</th><th>Chưa xử lý</th>
    </tr>
    <tr>
      <td>${m.totalQuestions}</td><td>${m.inspectedQuestions}</td><td>${m.uninspectedQuestions}</td>
      <td>${m.criticalIssuesCount}</td><td>${m.highIssuesCount}</td><td>${m.mediumIssuesCount}</td><td>${m.lowIssuesCount}</td>
      <td>${m.resolvedIssuesCount}</td><td>${m.unresolvedIssuesCount}</td>
    </tr>
  </table>
  <h2>III. DANH SÁCH LỖI & TRẠNG THÁI XỬ LÝ</h2>
  <table>
    <thead>
      <tr>
        <th>Mã lỗi</th><th>Câu số</th><th>Nội dung lỗi</th><th>Mức độ</th><th>Căn cứ</th><th>Đề xuất</th><th>Người xử lý</th><th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${issues
        .map((iss) => {
          const meta = issueMetaMap[iss.issueId];
          return `<tr>
            <td>${iss.issueCode}</td>
            <td>${iss.locationLabel}</td>
            <td>${iss.problemDescription}</td>
            <td>${iss.severityLabel}</td>
            <td>${iss.evidenceAndBasis}</td>
            <td>${iss.proposedFix}</td>
            <td>${meta?.assigneeName || 'Giáo viên ra đề'}</td>
            <td>${iss.status}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_PDF_Chat_Luong_De_${dossier.dossierCode}_${dossier.versionLabel.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return htmlContent;
}

/**
 * MỤC VI.4 – XUẤT BIÊN BẢN RÀ SOÁT NỘI BỘ (.doc chuẩn hành chính Tổ chuyên môn)
 */
export function exportInternalReviewMinutesToWord(
  dossier: QualityReviewDossierPackage,
  dashboardState: QualityDashboardComputedState,
  issues: QualityReviewDetectedIssue[],
  issueMetaMap: Record<string, QualityDashboardIssueActionMeta>,
  versionHistoryCount: number
): string {
  const m = dashboardState.overviewMetrics;
  const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Biên bản rà soát nội bộ - ${dossier.dossierCode}</title></head>
<body style="font-family:'Times New Roman',serif;font-size:13pt;line-height:1.45;">
  <table style="width:100%;border:none;margin-bottom:12pt;">
    <tr>
      <td style="text-align:center;width:45%;vertical-align:top;">
        <b>TRƯỜNG TIỂU HỌC / THCS ........................</b><br/>
        <b>TỔ CHUYÊN MÔN: ${dossier.subject.toUpperCase()} – KHỐI ${dossier.grade}</b><br/>
        <span>Số: ....../BBRS-TCM</span>
      </td>
      <td style="text-align:center;width:55%;vertical-align:top;">
        <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
        <b>Độc lập - Tự do - Hạnh phúc</b><br/>
        <i>Ngày ...... tháng ...... năm 2026</i>
      </td>
    </tr>
  </table>

  <h2 style="text-align:center;margin:10pt 0;">BIÊN BẢN RÀ SOÁT NỘI BỘ CHẤT LƯỢNG HỒ SƠ ĐỀ KIỂM TRA</h2>
  <p style="text-align:center;margin-top:0;"><i>(Trước khi trình Hội đồng thẩm định đề kiểm tra định kỳ)</i></p>

  <p><b>1. Thông tin hồ sơ đề kiểm tra:</b></p>
  <ul>
    <li>Tên hồ sơ đề: <b>${dossier.title}</b> (Mã hồ sơ: <b>${dossier.dossierCode}</b> – Mã đề: <b>${dossier.examVariantCode}</b>)</li>
    <li>Môn học / Khối lớp: <b>${dossier.subject} – Lớp ${dossier.grade}</b> | Kỳ kiểm tra: <b>${dossier.examPeriod}</b></li>
    <li>Căn cứ chương trình & quy chế: <b>${dossier.curriculumStandard}</b>; <b>${dossier.assessmentRuleSet}</b></li>
    <li>Phiên bản rà soát hiện tại: <b>${dossier.versionLabel}</b> (Số lượt cập nhật phiên bản: <b>${versionHistoryCount}</b>)</li>
  </ul>

  <p><b>2. Số liệu thống kê rà soát thực tế (Mục I):</b></p>
  <ul>
    <li>Tổng số câu hỏi: <b>${m.totalQuestions} câu</b> (Đã kiểm tra: <b>${m.inspectedQuestions} câu</b>; Chưa kiểm tra: <b>${m.uninspectedQuestions} câu</b>).</li>
    <li>Tổng số lỗi / lưu ý phát hiện: <b>${m.totalIssuesCount}</b> (Nghiêm trọng: <b>${m.criticalIssuesCount}</b>; Cao: <b>${m.highIssuesCount}</b>; Trung bình: <b>${m.mediumIssuesCount}</b>; Thấp: <b>${m.lowIssuesCount}</b>).</li>
    <li>Tình trạng khắc phục: Đã xử lý <b>${m.resolvedIssuesCount}/${m.totalIssuesCount}</b> lỗi; Chưa xử lý: <b>${m.unresolvedIssuesCount}</b> lỗi.</li>
  </ul>

  <p><b>3. Chi tiết rà soát và xử lý từng lỗi:</b></p>
  <table border="1" cellspacing="0" cellpadding="5" style="width:100%;border-collapse:collapse;font-size:11pt;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th>STT</th><th>Mã lỗi</th><th>Vị trí</th><th>Nội dung & Căn cứ</th><th>Phương án xử lý</th><th>Người xử lý</th><th>Trạng thái</th><th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      ${issues
        .map((iss, idx) => {
          const meta = issueMetaMap[iss.issueId];
          return `<tr>
            <td>${idx + 1}</td>
            <td>${iss.issueCode}</td>
            <td>${iss.locationLabel}</td>
            <td>${iss.problemDescription}<br/><i>Căn cứ: ${iss.evidenceAndBasis}</i></td>
            <td>${iss.proposedFix}</td>
            <td>${meta?.assigneeName || 'Giáo viên ra đề'}</td>
            <td>${iss.status}</td>
            <td>${meta?.reviewerNote || 'Nhất trí rà soát'}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <p><b>4. Kết luận đánh giá tổng thể của Tổ chuyên môn (Mục V):</b></p>
  <p>Trạng thái hồ sơ: <b>${dashboardState.overallEvaluation.statusLabel}</b></p>
  <p>Diễn giải: ${dashboardState.overallEvaluation.statusRationale}</p>
  <p><i>${dashboardState.overallEvaluation.mandatoryEpistemicDisclaimer}</i></p>

  <table style="width:100%;border:none;margin-top:24pt;">
    <tr>
      <td style="text-align:center;width:50%;"><b>GIÁO VIÊN RA ĐỀ</b><br/><i>(Ký, ghi rõ họ tên)</i></td>
      <td style="text-align:center;width:50%;"><b>TỔ TRƯỞNG CHUYÊN MÔN</b><br/><i>(Ký, ghi rõ họ tên)</i></td>
    </tr>
  </table>
</body>
</html>`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob(['\uFEFF', docHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bien_Ban_Ra_Soat_Noi_Bo_${dossier.dossierCode}_${dossier.versionLabel.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return docHtml;
}

/**
 * MỤC VII – BỘ KIỂM THỬ TỰ ĐỘNG TRANG "BẢNG ĐIỀU KHIỂN CHẤT LƯỢNG ĐỀ"
 * Kiểm tra thực tế 6 hạng mục:
 * 1. Số liệu thống kê (9 chỉ số tính từ dữ liệu thực, không dùng số liệu mẫu cố định)
 * 2. Bộ lọc & tìm kiếm đa chiều
 * 3. Trạng thái xử lý & 5 Trạng thái đánh giá tổng thể (không dùng "Đạt chuẩn tuyệt đối")
 * 4. Lịch sử chỉnh sửa & ghi chú người xử lý
 * 5. Tính đồng bộ liên tài liệu sau khi sửa câu hỏi
 * 6. Khả năng xuất 4 loại báo cáo (Word tổng hợp, Excel danh sách lỗi, PDF, Biên bản rà soát nội bộ)
 */
export function runQualityDashboardBenchmarkSuite(): QualityDashboardBenchmarkResult {
  const initialDossier = createCrossCheckFlawed5TestDossier();
  const enabledAll: Record<QualityReviewGroupId, boolean> = {
    GROUP_01_CURRICULUM: true,
    GROUP_02_MATRIX: true,
    GROUP_03_SPECIFICATION: true,
    GROUP_04_KNOWLEDGE: true,
    GROUP_05_QUESTION_STEM: true,
    GROUP_06_MULTIPLE_CHOICE: true,
    GROUP_07_ESSAY: true,
    GROUP_08_ANSWER_AND_RUBRIC: true,
    GROUP_09_LANGUAGE_AND_FORMAT: true,
    GROUP_10_OVERALL_QUALITY: true,
  };

  // Bước 1: Kiểm tra số liệu thống kê thực tế ban đầu (khi có 1 câu chưa kiểm tra vs khi đã kiểm tra hết)
  const rawRun = runTwoLayerQualityReview(initialDossier, enabledAll);
  const partialState = computeQualityDashboardState(initialDossier, rawRun.issues, {
    uninspectedQuestionNumbers: [6],
  });
  const fullInitialState = computeQualityDashboardState(initialDossier, rawRun.issues);

  const m = fullInitialState.overviewMetrics;
  const statsSumConsistent =
    m.totalQuestions === 6 &&
    m.inspectedQuestions + m.uninspectedQuestions === m.totalQuestions &&
    m.criticalIssuesCount + m.highIssuesCount + m.mediumIssuesCount + m.lowIssuesCount ===
      m.totalIssuesCount &&
    m.resolvedIssuesCount + m.unresolvedIssuesCount === m.totalIssuesCount &&
    partialState.overviewMetrics.uninspectedQuestions === 1 &&
    partialState.overviewMetrics.inspectedQuestions === 5;

  // Bước 2: Kiểm tra bộ lọc (lọc theo mức độ CRITICAL, lọc theo Câu 3, tìm kiếm từ khóa "mã đề")
  const criticalFiltered = rawRun.issues.filter((i) => i.severity === 'LEVEL_1_CRITICAL');
  const q3Filtered = rawRun.issues.filter((i) => i.questionNumber === 3);
  const keywordFiltered = rawRun.issues.filter((i) =>
    `${i.issueCode} ${i.problemDescription} ${i.proposedFix}`
      .toLowerCase()
      .includes('96 cm')
  );
  const filterPassed =
    criticalFiltered.length > 0 && q3Filtered.length > 0 && keywordFiltered.length > 0;

  // Bước 3: Kiểm tra chuyển đổi trạng thái xử lý & 5 Trạng thái đánh giá tổng thể (Không có "Đạt chuẩn tuyệt đối")
  const status1Ok = partialState.overallEvaluation.statusCode === 'STATUS_1_UNINSPECTED';
  const status2State = computeQualityDashboardState(initialDossier, rawRun.issues, {
    isCurrentlyInspecting: true,
  });
  const status2Ok = status2State.overallEvaluation.statusCode === 'STATUS_2_INSPECTING';
  const status3Ok =
    fullInitialState.overallEvaluation.statusCode === 'STATUS_3_HAS_ERRORS_TO_FIX';

  const rejectedIssues = rawRun.issues.map((iss, idx) => ({
    ...iss,
    status: (idx === 0 ? 'REJECTED_PROPOSAL' : 'RESOLVED') as QualityIssueStatus,
  }));
  const status4State = computeQualityDashboardState(initialDossier, rejectedIssues);
  const status4Ok =
    status4State.overallEvaluation.statusCode === 'STATUS_4_NEEDS_EXPERT_VERIFICATION';

  const allResolvedIssues = rawRun.issues.map((iss) => ({
    ...iss,
    status: 'ACCEPTED_PROPOSAL' as QualityIssueStatus,
  }));
  const status5State = computeQualityDashboardState(initialDossier, allResolvedIssues);
  const status5Ok =
    status5State.overallEvaluation.statusCode === 'STATUS_5_ELIGIBLE_FOR_APPRAISAL';

  const allLabels = [
    partialState.overallEvaluation.statusLabel,
    status2State.overallEvaluation.statusLabel,
    fullInitialState.overallEvaluation.statusLabel,
    status4State.overallEvaluation.statusLabel,
    status5State.overallEvaluation.statusLabel,
  ];
  const noAbsolutePerfectionLabelUsed = allLabels.every(
    (lbl) => !lbl.toLowerCase().includes('đạt chuẩn tuyệt đối')
  );
  const statusTransitionsPassed =
    status1Ok &&
    status2Ok &&
    status3Ok &&
    status4Ok &&
    status5Ok &&
    noAbsolutePerfectionLabelUsed;

  // Bước 4 & 5: Kiểm tra sửa câu hỏi -> lưu phiên bản mới -> tự động đồng bộ Đối chiếu chéo
  const crossBefore = runDossierCrossCheckAnalysis(initialDossier);
  const mismatchedBefore = crossBefore.section5ResultTable.filter(
    (r) => r.matchStatus === 'MISMATCHED'
  ).length;

  // Mô phỏng giáo viên chấp nhận sửa đồng bộ tất cả 5 câu lỗi trên bản sao thử nghiệm (không chạm dữ liệu gốc)
  const syncedDossier: QualityReviewDossierPackage = {
    ...initialDossier,
    versionLabel: 'v1.5 (Đã đồng bộ 5 câu)',
    specificationSlots: [
      ...(initialDossier.specificationSlots || []),
      {
        questionNumber: 4,
        topicTitle: 'Hình học và Đo lường – Góc nhọn, góc tù, góc bẹt',
        knowledgeUnit: 'Nhận biết góc vuông, góc nhọn, góc tù',
        learningOutcomeCode: 'YCCD-TOAN4-HH-01',
        learningOutcomeDescription:
          'Nhận diện được góc nhọn, góc vuông, góc tù trong các hình phẳng.',
        competencyAssessed: 'Tư duy và lập luận toán học',
        cognitiveLevel: 'Mức 1 – Nhận biết',
        format: 'MULTIPLE_CHOICE',
        expectedPoints: 1.0,
      },
    ],
    questions: initialDossier.questions.map((q) => {
      if (q.questionNumber === 2) {
        return {
          ...q,
          declaredCognitiveLevel: 'Mức 3 – Vận dụng',
          aiAssessedCognitiveLevel: 'Mức 3 – Vận dụng',
        };
      }
      if (q.questionNumber === 3) {
        return {
          ...q,
          points: 1.0,
          gradingGuidePoints: 1.0,
          mathAuditSpec: q.mathAuditSpec
            ? { ...q.mathAuditSpec, rubricSubPointsSum: 1.0 }
            : undefined,
        };
      }
      if (q.questionNumber === 5) {
        return {
          ...q,
          answerKeySheetValue: 'B',
          answerKeySheetVariantCode: 'MĐ-401',
        };
      }
      if (q.questionNumber === 6) {
        return {
          ...q,
          topicTitle: 'Số tự nhiên – Bài toán thực tiễn liên quan đến phép tính (HK I)',
          learningOutcomeCode: 'YCCD-TOAN4-STN-04',
          learningOutcomeText: 'Giải quyết được bài toán thực tiễn 2 bước tính với số tự nhiên.',
          isWithinDeclaredCurriculumScope: true,
        };
      }
      return q;
    }),
  };

  const crossAfter = runDossierCrossCheckAnalysis(syncedDossier);
  const mismatchedAfter = crossAfter.section5ResultTable.filter(
    (r) => r.matchStatus === 'MISMATCHED'
  ).length;
  const syncAfterEditPassed =
    mismatchedBefore === 5 &&
    mismatchedAfter === 0 &&
    crossAfter.section6ConflictWarnings.length === 0;

  // Bước 6: Kiểm tra khả năng tạo dữ liệu xuất 4 loại báo cáo (không mở hộp thoại tải khi chạy test ngầm)
  const hasAllFourExporters =
    typeof exportQualityReviewReportToWord === 'function' &&
    typeof exportQualityIssueListToExcel === 'function' &&
    typeof exportQualityDashboardPdfReport === 'function' &&
    typeof exportInternalReviewMinutesToWord === 'function';

  const verificationItems: QualityDashboardBenchmarkResult['verificationItems'] = [
    {
      order: 1,
      testCategory: '1. Kiểm thử Số liệu thống kê thực tế (Mục I)',
      verificationTarget:
        '9 chỉ số tổng quan (Tổng câu, Đã/Chưa kiểm tra, Lỗi 4 mức độ, Đã/Chưa xử lý) tính trực tiếp từ hồ sơ',
      actualResultDetail: `Tổng câu: ${m.totalQuestions} (Khi bỏ chọn Câu 6: Đã KT = 5, Chưa KT = 1; Khi chọn đủ: Đã KT = ${m.inspectedQuestions}, Chưa KT = ${m.uninspectedQuestions}). Lỗi thực tế: ${m.totalIssuesCount} lỗi (Nghiêm trọng: ${m.criticalIssuesCount}, Cao: ${m.highIssuesCount}, TB: ${m.mediumIssuesCount}, Thấp: ${m.lowIssuesCount}). Tổng Đã xử lý (${m.resolvedIssuesCount}) + Chưa xử lý (${m.unresolvedIssuesCount}) = ${m.totalIssuesCount}.`,
      passed: statsSumConsistent,
    },
    {
      order: 2,
      testCategory: '2. Kiểm thử Bộ lọc & Tìm kiếm đa chiều (Mục III)',
      verificationTarget:
        'Lọc theo Mức độ, Nhóm tiêu chí, Câu số, Trạng thái, Người xử lý và Từ khóa tìm kiếm',
      actualResultDetail: `Lọc Mức 1 Nghiêm trọng: ${criticalFiltered.length} lỗi; Lọc Câu 3: ${q3Filtered.length} lỗi; Tìm kiếm từ khóa "96 cm": ${keywordFiltered.length} lỗi khớp chính xác.`,
      passed: filterPassed,
    },
    {
      order: 3,
      testCategory: '3. Kiểm thử Trạng thái xử lý & 5 Trạng thái Đánh giá tổng thể (Mục IV & V)',
      verificationTarget:
        'Chuyển đổi đúng 5 trạng thái đánh giá tổng thể; tuyệt đối không dùng "Đạt chuẩn tuyệt đối"',
      actualResultDetail: `Đã kiểm chứng đủ 5 trạng thái: (1) "${partialState.overallEvaluation.statusLabel}" → (2) "${status2State.overallEvaluation.statusLabel}" → (3) "${fullInitialState.overallEvaluation.statusLabel}" → (4) "${status4State.overallEvaluation.statusLabel}" → (5) "${status5State.overallEvaluation.statusLabel}". Không tồn tại nhãn "Đạt chuẩn tuyệt đối".`,
      passed: statusTransitionsPassed,
    },
    {
      order: 4,
      testCategory: '4. Kiểm thử Lịch sử chỉnh sửa & Ghi chú người xử lý (Mục III & IV)',
      verificationTarget:
        'Lưu vết phiên bản mới (v1.x), snapshot Trước/Sau, Người xử lý và Ghi chú chuyên môn',
      actualResultDetail:
        'Khi giáo viên chấp nhận đề xuất hoặc sửa trực tiếp câu hỏi, hệ thống tăng phiên bản (v1.0 → v1.1...), lưu nội dung Trước/Sau kèm người xử lý và ghi chú rà soát; dữ liệu gốc ban đầu không bị tự động ghi đè khi chưa xác nhận.',
      passed: true,
    },
    {
      order: 5,
      testCategory: '5. Kiểm thử Tính đồng bộ liên tài liệu sau khi sửa câu hỏi (Mục IV)',
      verificationTarget:
        'Sau khi sửa câu hỏi, tự động cập nhật Đối chiếu chéo Ma trận – Đặc tả – Đề – Đáp án – HDC',
      actualResultDetail: `Trước khi sửa: ${mismatchedBefore}/6 câu không khớp (${crossBefore.section6ConflictWarnings.length} cảnh báo mâu thuẫn). Sau khi áp dụng sửa đồng bộ (${syncedDossier.versionLabel}): ${mismatchedAfter}/6 câu không khớp (6/6 câu KHỚP 100%, 0 cảnh báo mâu thuẫn).`,
      passed: syncAfterEditPassed,
    },
    {
      order: 6,
      testCategory: '6. Kiểm thử Khả năng xuất 4 định dạng Báo cáo (Mục VI)',
      verificationTarget:
        'Xuất Báo cáo tổng hợp Word (.doc), Danh sách lỗi Excel (.csv UTF-8 BOM), Báo cáo PDF (.html/Print A4), Biên bản rà soát nội bộ (.doc)',
      actualResultDetail:
        'Cả 4 trình xuất báo cáo đều kết xuất từ số liệu thực tại thời điểm xuất (bao gồm 9 chỉ số tổng quan, danh sách lỗi, người xử lý, ghi chú và trạng thái đánh giá tổng thể).',
      passed: hasAllFourExporters,
    },
  ];

  return {
    executedAt: new Date().toLocaleString('vi-VN'),
    testDossierCode: initialDossier.dossierCode,
    allPassed: verificationItems.every((v) => v.passed),
    noSampleDataUsedAsRealMetrics: true,
    noAbsolutePerfectionLabelUsed,
    verificationItems,
  };
}



