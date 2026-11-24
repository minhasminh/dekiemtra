import {
  ApprovalStatus,
  CognitiveLevelCode,
  DataSourceFilter,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  GradeNumber,
  LevelAssessmentRuleSet,
  QuestionFormatCode,
  QuestionFormatDefinition,
  QuestionItem,
} from '../../types/domain';

export const ALL_QUESTION_FORMATS: QuestionFormatDefinition[] = [
  {
    code: QuestionFormatCode.MCQ_SINGLE,
    name: 'Trắc nghiệm một đáp án đúng',
    description: 'Chọn 1 phương án đúng duy nhất trong 4 lựa chọn A, B, C, D.',
    defaultPoints: 0.25,
  },
  {
    code: QuestionFormatCode.MCQ_MULTIPLE,
    name: 'Trắc nghiệm nhiều đáp án đúng',
    description: 'Chọn từ 2 phương án đúng trở lên trong danh sách lựa chọn.',
    defaultPoints: 0.5,
  },
  {
    code: QuestionFormatCode.TRUE_FALSE_CLUSTER,
    name: 'Đúng – Sai (hỗ trợ các ý nhỏ)',
    description: 'Câu hỏi chùm gồm các mệnh đề nhỏ (a, b, c, d), học sinh xét Đúng hoặc Sai cho từng ý.',
    defaultPoints: 1.0,
  },
  {
    code: QuestionFormatCode.SHORT_ANSWER,
    name: 'Trả lời ngắn',
    description: 'Học sinh tính toán hoặc suy luận để ghi kết quả số / cụm từ ngắn gọn.',
    defaultPoints: 0.5,
  },
  {
    code: QuestionFormatCode.FILL_IN_BLANK,
    name: 'Điền khuyết',
    description: 'Điền từ ngữ, số liệu hoặc ký hiệu thích hợp vào các vị trí khuyết (___) trong câu.',
    defaultPoints: 0.5,
  },
  {
    code: QuestionFormatCode.MATCHING,
    name: 'Ghép nối',
    description: 'Ghép nối các mệnh đề/khái niệm ở Cột A với nội dung tương ứng ở Cột B.',
    defaultPoints: 1.0,
  },
  {
    code: QuestionFormatCode.ORDERING,
    name: 'Sắp xếp',
    description: 'Sắp xếp các bước, sự kiện lịch sử hoặc quy trình khoa học theo trình tự đúng.',
    defaultPoints: 1.0,
  },
  {
    code: QuestionFormatCode.ESSAY_SHORT,
    name: 'Tự luận ngắn',
    description: 'Trả lời câu hỏi tự luận ngắn (1–2 ý hoặc bài toán nhỏ giải nhanh).',
    defaultPoints: 1.0,
  },
  {
    code: QuestionFormatCode.ESSAY,
    name: 'Tự luận dài',
    description: 'Trình bày chi tiết lời giải bài toán nhiều bước, viết đoạn văn hoặc bài văn hoàn chỉnh.',
    defaultPoints: 2.0,
  },
  {
    code: QuestionFormatCode.READING_COMPREHENSION,
    name: 'Đọc hiểu theo ngữ liệu chung',
    description: 'Đính kèm văn bản/ngữ liệu đọc hiểu chung và câu hỏi khai thác ngữ liệu.',
    defaultPoints: 1.5,
  },
  {
    code: QuestionFormatCode.MEDIA_FORMULA,
    name: 'Câu hỏi có hình ảnh, bảng biểu hoặc công thức',
    description: 'Câu hỏi tích hợp trực tiếp công thức LaTeX, bảng số liệu thực nghiệm hoặc hình vẽ trực quan.',
    defaultPoints: 1.0,
  },
];

export const ASSESSMENT_RULES_BY_LEVEL: Record<EducationLevelId, LevelAssessmentRuleSet> = {
  [EducationLevelId.PRIMARY]: {
    levelId: EducationLevelId.PRIMARY,
    levelName: 'Cấp Tiểu học (Lớp 1 – 5)',
    shortName: 'Tiểu học',
    grades: [1, 2, 3, 4, 5],
    legalBasis: 'Thông tư 27/2020/TT-BGDĐT quy định đánh giá học sinh tiểu học',
    periodicAssessmentNote:
      'Đề kiểm tra định kỳ phù hợp với yêu cầu cần đạt và biểu hiện cụ thể về các thành phần năng lực của môn học, gồm các câu hỏi, bài tập được thiết kế theo 3 mức độ nhận thức. Không mặc định mọi dạng câu hỏi phức tạp của cấp trên áp dụng cho lớp đầu cấp Tiểu học.',
    scoringScale: 10,
    allowHalfPointAtPrimary: false,
    cognitiveLevels: [
      {
        code: CognitiveLevelCode.PRIMARY_MUC_1,
        shortLabel: 'Mức 1 (Nhận biết)',
        name: 'Mức 1 – Nhận biết, nhắc lại',
        description:
          'Nhận biết, nhắc lại hoặc mô tả được nội dung đã học và áp dụng trực tiếp để giải quyết một số tình huống, vấn đề quen thuộc trong học tập.',
        recommendedPercentageRange: [40, 50],
      },
      {
        code: CognitiveLevelCode.PRIMARY_MUC_2,
        shortLabel: 'Mức 2 (Kết nối)',
        name: 'Mức 2 – Kết nối, sắp xếp',
        description:
          'Kết nối, sắp xếp được một số yếu tố kiến thức, kĩ năng đã học để giải quyết vấn đề có nội dung tương tự.',
        recommendedPercentageRange: [30, 40],
      },
      {
        code: CognitiveLevelCode.PRIMARY_MUC_3,
        shortLabel: 'Mức 3 (Vận dụng)',
        name: 'Mức 3 – Vận dụng giải quyết vấn đề mới',
        description:
          'Vận dụng các kiến thức, kĩ năng đã học để giải quyết một số vấn đề mới hoặc đưa ra những phản hồi hợp lý trong học tập và cuộc sống.',
        recommendedPercentageRange: [10, 20],
      },
    ],
    allowedFormats: [
      {
        code: QuestionFormatCode.MCQ_SINGLE,
        name: 'Trắc nghiệm một đáp án đúng (A, B, C, D)',
        description: 'Chọn 1 đáp án đúng nhất phù hợp với tâm sinh lý học sinh tiểu học.',
        defaultPoints: 0.5,
      },
      {
        code: QuestionFormatCode.TRUE_FALSE_CLUSTER,
        name: 'Đúng – Sai, hỗ trợ các ý nhỏ',
        description: 'Điền Đ (Đúng) hoặc S (Sai) vào các nhận định ngắn gọn.',
        defaultPoints: 1.0,
      },
      {
        code: QuestionFormatCode.SHORT_ANSWER,
        name: 'Trả lời ngắn',
        description: 'Viết số hoặc kết quả phép tính ngắn gọn.',
        defaultPoints: 0.5,
      },
      {
        code: QuestionFormatCode.FILL_IN_BLANK,
        name: 'Điền khuyết',
        description: 'Điền từ ngữ, vần, dấu câu hoặc số thích hợp vào chỗ chấm.',
        defaultPoints: 1.0,
      },
      {
        code: QuestionFormatCode.MATCHING,
        name: 'Ghép nối',
        description: 'Nối hai vế tương ứng giữa Cột A và Cột B.',
        defaultPoints: 1.0,
      },
      {
        code: QuestionFormatCode.ORDERING,
        name: 'Sắp xếp',
        description: 'Sắp xếp các số, từ ngữ thành câu hoặc thứ tự sự việc.',
        defaultPoints: 1.0,
      },
      {
        code: QuestionFormatCode.ESSAY_SHORT,
        name: 'Tự luận ngắn',
        description: 'Đặt câu, giải bài toán có lời văn 1 bước tính.',
        defaultPoints: 1.0,
      },
      {
        code: QuestionFormatCode.ESSAY,
        name: 'Tự luận dài',
        description: 'Giải bài toán nhiều bước tính hoặc viết đoạn văn ngắn.',
        defaultPoints: 2.0,
      },
      {
        code: QuestionFormatCode.READING_COMPREHENSION,
        name: 'Đọc hiểu theo ngữ liệu chung',
        description: 'Đọc bài văn/thơ ngắn và trả lời câu hỏi đọc hiểu (Môn Tiếng Việt, Tiếng Anh).',
        defaultPoints: 1.0,
        recommendedSubjects: ['Tiếng Việt', 'Ngoại ngữ 1 (Tiếng Anh)', 'Lịch sử và Địa lí'],
      },
      {
        code: QuestionFormatCode.MEDIA_FORMULA,
        name: 'Câu hỏi có hình ảnh, bảng biểu hoặc công thức',
        description: 'Quan sát hình minh họa, bảng số liệu đơn giản hoặc biểu thức để trả lời.',
        defaultPoints: 1.0,
      },
    ],
    recommendedDurationByGrade: {
      1: [35, 40],
      2: [35, 40],
      3: [40],
      4: [40, 60],
      5: [40, 60],
    },
    subjects: [
      'Tiếng Việt',
      'Toán',
      'Tiếng Anh',
      'Khoa học',
      'Tin học',
      'Công nghệ',
      'Đạo đức',
      'Lịch sử và Địa lí',
      'Mĩ thuật',
      'Âm nhạc',
      'Giáo dục thể chất',
      'Hoạt động trải nghiệm',
      'Tự nhiên và Xã hội',
      'Tin học và Công nghệ',
      'Ngoại ngữ 1 (Tiếng Anh)',
    ],
  },

  [EducationLevelId.LOWER_SECONDARY]: {
    levelId: EducationLevelId.LOWER_SECONDARY,
    levelName: 'Cấp THCS (Lớp 6 – 9)',
    shortName: 'THCS',
    grades: [6, 7, 8, 9],
    legalBasis: 'Thông tư 22/2021/TT-BGDĐT & Công văn 7991/BGDĐT-GDTrH',
    periodicAssessmentNote:
      'Đánh giá định kỳ theo 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao). Phân loại định dạng câu hỏi phù hợp theo đặc thù từng bộ môn (Toán/KHTN ưu tiên công thức & bảng số liệu; Ngữ văn ưu tiên Đọc hiểu ngữ liệu & Tự luận).',
    scoringScale: 10,
    cognitiveLevels: [
      {
        code: CognitiveLevelCode.SEC_NHAN_BIET,
        shortLabel: 'Nhận biết',
        name: 'Nhận biết (NB)',
        description: 'Nhận diện, ghi nhớ, tái hiện khái niệm, định lý, sự kiện, quy tắc cơ bản trong chương trình.',
        recommendedPercentageRange: [30, 40],
      },
      {
        code: CognitiveLevelCode.SEC_THONG_HIEU,
        shortLabel: 'Thông hiểu',
        name: 'Thông hiểu (TH)',
        description: 'Diễn giải, phân loại, so sánh, suy luận trực tiếp từ kiến thức đã học.',
        recommendedPercentageRange: [30, 35],
      },
      {
        code: CognitiveLevelCode.SEC_VAN_DUNG,
        shortLabel: 'Vận dụng',
        name: 'Vận dụng (VD)',
        description: 'Áp dụng kiến thức, kĩ năng vào tình huống quen thuộc hoặc bài tập tổng hợp.',
        recommendedPercentageRange: [20, 25],
      },
      {
        code: CognitiveLevelCode.SEC_VAN_DUNG_CAO,
        shortLabel: 'Vận dụng cao',
        name: 'Vận dụng cao (VDC)',
        description: 'Phân tích, tổng hợp, giải quyết tình huống thực tiễn mới, đòi hỏi tư duy phản biện.',
        recommendedPercentageRange: [5, 10],
      },
    ],
    allowedFormats: ALL_QUESTION_FORMATS,
    recommendedDurationByGrade: {
      6: [45, 60, 90],
      7: [45, 60, 90],
      8: [45, 60, 90],
      9: [45, 60, 90, 120],
    },
    subjects: [
      'Toán',
      'Ngữ văn',
      'Khoa học tự nhiên',
      'Lịch sử và Địa lí',
      'Tiếng Anh',
      'Giáo dục công dân',
      'Tin học',
      'Công nghệ',
      'Hoạt động trải nghiệm, hướng nghiệp',
      'Giáo dục địa phương',
      'Nghệ thuật (Âm nhạc)',
      'Nghệ thuật (Mĩ thuật)',
    ],
  },

  [EducationLevelId.UPPER_SECONDARY]: {
    levelId: EducationLevelId.UPPER_SECONDARY,
    levelName: 'Cấp THPT (Lớp 10 – 12) [Kiến trúc mở rộng]',
    shortName: 'THPT (Mở rộng)',
    grades: [10, 11, 12],
    isExpansionReadyOnly: true,
    legalBasis: 'Thông tư 22/2021/TT-BGDĐT & Định dạng đề thi tốt nghiệp THPT từ 2025',
    periodicAssessmentNote:
      'Kiến trúc dữ liệu và bộ quy tắc đã định nghĩa sẵn cho khối 10–12 (tổ hợp môn lựa chọn và chuyên đề học tập).',
    scoringScale: 10,
    cognitiveLevels: [
      {
        code: CognitiveLevelCode.SEC_NHAN_BIET,
        shortLabel: 'Nhận biết',
        name: 'Nhận biết (NB)',
        description: 'Nhận diện kiến thức cốt lõi và chuyên đề học tập THPT.',
        recommendedPercentageRange: [30, 40],
      },
      {
        code: CognitiveLevelCode.SEC_THONG_HIEU,
        shortLabel: 'Thông hiểu',
        name: 'Thông hiểu (TH)',
        description: 'Hiểu bản chất khái niệm, quy luật trong chương trình THPT.',
        recommendedPercentageRange: [30, 35],
      },
      {
        code: CognitiveLevelCode.SEC_VAN_DUNG,
        shortLabel: 'Vận dụng',
        name: 'Vận dụng (VD)',
        description: 'Giải quyết vấn đề gắn với bối cảnh thực tiễn.',
        recommendedPercentageRange: [20, 25],
      },
      {
        code: CognitiveLevelCode.SEC_VAN_DUNG_CAO,
        shortLabel: 'Vận dụng cao',
        name: 'Vận dụng cao (VDC)',
        description: 'Tư duy bậc cao, phân tích dữ liệu thực nghiệm phức tạp.',
        recommendedPercentageRange: [5, 10],
      },
    ],
    allowedFormats: ALL_QUESTION_FORMATS,
    recommendedDurationByGrade: {
      10: [45, 50, 90],
      11: [45, 50, 90],
      12: [50, 90, 120],
    },
    subjects: ['Toán', 'Ngữ văn', 'Vật lí', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lí', 'Tiếng Anh', 'KT&PL'],
  },
};

export const PRIMARY_VALID_GRADES_BY_SUBJECT: Record<string, GradeNumber[]> = {
  'Toán': [1, 2, 3, 4, 5],
  'Tiếng Việt': [1, 2, 3, 4, 5],
  'Tiếng Anh': [1, 2, 3, 4, 5],
  'Đạo đức': [1, 2, 3, 4, 5],
  'Tự nhiên và Xã hội': [1, 2, 3],
  'Khoa học': [4, 5],
  'Lịch sử và Địa lí': [4, 5],
  'Tin học': [3, 4, 5],
  'Công nghệ': [3, 4, 5],
  'Giáo dục thể chất': [1, 2, 3, 4, 5],
  'Nghệ thuật (Âm nhạc)': [1, 2, 3, 4, 5],
  'Nghệ thuật (Mĩ thuật)': [1, 2, 3, 4, 5],
  'Hoạt động trải nghiệm': [1, 2, 3, 4, 5],
};

/**
 * Kiểm tra tính phù hợp của dạng câu hỏi theo Cấp học, Khối lớp và Môn học.
 * Không mặc định tất cả dạng câu hỏi đều phù hợp với mọi môn hoặc mọi cấp học.
 */
export function checkFormatSuitabilityForSubjectAndGrade(
  levelId: EducationLevelId,
  grade: GradeNumber,
  subject: string,
  format: QuestionFormatCode
): { suitable: boolean; isRestricted: boolean; note?: string } {
  // 1. Hạn chế ở Lớp 1 - 2 Tiểu học: Tránh trắc nghiệm nhiều đáp án đúng hoặc chùm 4 mệnh đề phức tạp
  if (levelId === EducationLevelId.PRIMARY && grade <= 2) {
    if (format === QuestionFormatCode.MCQ_MULTIPLE) {
      return {
        suitable: false,
        isRestricted: true,
        note: 'Lớp 1–2 Tiểu học chưa phù hợp với dạng "Trắc nghiệm nhiều đáp án đúng" gây nhiễu tâm sinh lý học sinh đầu cấp.',
      };
    }
    if (format === QuestionFormatCode.ESSAY) {
      return {
        suitable: true,
        isRestricted: false,
        note: 'Ở Lớp 1–2, ưu tiên sử dụng "Tự luận ngắn" hoặc "Điền khuyết" thay vì bài Tự luận dài.',
      };
    }
  }

  // 2. Môn Ngữ văn ở THCS: Khuyến nghị Đọc hiểu theo ngữ liệu chung, Tự luận ngắn/dài
  if (subject === 'Ngữ văn') {
    if (
      format === QuestionFormatCode.MATCHING ||
      format === QuestionFormatCode.ORDERING ||
      format === QuestionFormatCode.MCQ_MULTIPLE
    ) {
      return {
        suitable: true,
        isRestricted: false,
        note: `Đối với môn Ngữ văn Lớp ${grade}, Công văn 3175/BGDĐT-GDTrH khuyến nghị ưu tiên "Đọc hiểu theo ngữ liệu chung", "Tự luận ngắn" và "Tự luận dài".`,
      };
    }
  }

  // 3. Môn Toán / KHTN: Khi chọn Đọc hiểu theo ngữ liệu chung -> gợi ý dùng Câu hỏi có hình ảnh, bảng biểu hoặc công thức
  if ((subject === 'Toán' || subject === 'Tin học') && format === QuestionFormatCode.READING_COMPREHENSION) {
    return {
      suitable: true,
      isRestricted: false,
      note: `Môn ${subject} thường sử dụng "Câu hỏi có hình ảnh, bảng biểu hoặc công thức" hoặc "Đúng – Sai các ý nhỏ" thay cho ngữ liệu văn bản dài.`,
    };
  }

  return { suitable: true, isRestricted: false };
}

export function getAllowedFormatsForContext(
  levelId: EducationLevelId,
  grade: GradeNumber,
  subject: string
): (QuestionFormatDefinition & { suitabilityNote?: string; isRestricted?: boolean })[] {
  const ruleSet = getRuleSetForLevel(levelId);
  const baseFormats = ruleSet.allowedFormats.length > 0 ? ruleSet.allowedFormats : ALL_QUESTION_FORMATS;

  return ALL_QUESTION_FORMATS.map((fmt) => {
    const inLevel = baseFormats.some((f) => f.code === fmt.code);
    const check = checkFormatSuitabilityForSubjectAndGrade(levelId, grade, subject, fmt.code);
    return {
      ...fmt,
      isRestricted: !inLevel || check.isRestricted,
      suitabilityNote: check.note,
    };
  });
}

export function getLevelForGrade(grade: GradeNumber): EducationLevelId {
  if (grade >= 1 && grade <= 5) return EducationLevelId.PRIMARY;
  if (grade >= 6 && grade <= 9) return EducationLevelId.LOWER_SECONDARY;
  return EducationLevelId.UPPER_SECONDARY;
}

export function getRuleSetForLevel(levelId: EducationLevelId): LevelAssessmentRuleSet {
  return ASSESSMENT_RULES_BY_LEVEL[levelId];
}

export function getCognitiveLevelLabel(code: CognitiveLevelCode): string {
  for (const level of Object.values(ASSESSMENT_RULES_BY_LEVEL)) {
    const found = level.cognitiveLevels.find((c) => c.code === code);
    if (found) return found.name;
  }
  return code;
}

export function getCognitiveShortLabel(code: CognitiveLevelCode): string {
  for (const level of Object.values(ASSESSMENT_RULES_BY_LEVEL)) {
    const found = level.cognitiveLevels.find((c) => c.code === code);
    if (found) return found.shortLabel;
  }
  return code;
}

export function getFormatLabel(code: QuestionFormatCode): string {
  const found = ALL_QUESTION_FORMATS.find((f) => f.code === code);
  if (found) return found.name;
  return code;
}

export function getExamPeriodLabel(period: ExamMatrix['examPeriod']): string {
  switch (period) {
    case 'GIUA_KY_1':
      return 'Giữa học kỳ I';
    case 'CUOI_KY_1':
      return 'Cuối học kỳ I';
    case 'GIUA_KY_2':
      return 'Giữa học kỳ II';
    case 'CUOI_KY_2':
      return 'Cuối học kỳ II';
  }
}

export function getApprovalStatusInfo(status: ApprovalStatus): {
  label: string;
  colorClass: string;
  textClass: string;
} {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return {
        label: 'Đã phê duyệt',
        colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        textClass: 'text-emerald-700',
      };
    case ApprovalStatus.PUBLISHED:
      return {
        label: 'Đã phát hành',
        colorClass: 'bg-blue-50 border-blue-200 text-blue-800',
        textClass: 'text-blue-700',
      };
    case ApprovalStatus.ARCHIVED:
      return {
        label: 'Lưu trữ',
        colorClass: 'bg-slate-200 border-slate-300 text-slate-800',
        textClass: 'text-slate-700',
      };
    case ApprovalStatus.PENDING_APPROVAL:
      return {
        label: 'Chờ phê duyệt',
        colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        textClass: 'text-indigo-700',
      };
    case ApprovalStatus.PENDING:
      return {
        label: 'Chờ thẩm định',
        colorClass: 'bg-amber-50 border-amber-200 text-amber-800',
        textClass: 'text-amber-700',
      };
    case ApprovalStatus.IN_REVIEW:
      return {
        label: 'Đang thẩm định',
        colorClass: 'bg-sky-50 border-sky-200 text-sky-800',
        textClass: 'text-sky-700',
      };
    case ApprovalStatus.REVISION_REQUIRED:
      return {
        label: 'Yêu cầu chỉnh sửa',
        colorClass: 'bg-rose-50 border-rose-200 text-rose-800',
        textClass: 'text-rose-700',
      };
    case ApprovalStatus.REVISED:
      return {
        label: 'Đã chỉnh sửa',
        colorClass: 'bg-teal-50 border-teal-200 text-teal-800',
        textClass: 'text-teal-700',
      };
    case ApprovalStatus.DEPRECATED:
      return {
        label: 'Ngừng sử dụng',
        colorClass: 'bg-slate-200 border-slate-300 text-slate-700',
        textClass: 'text-slate-500 line-through',
      };
    case ApprovalStatus.DRAFT:
    default:
      return {
        label: 'Bản nháp',
        colorClass: 'bg-slate-100 border-slate-200 text-slate-700',
        textClass: 'text-slate-600',
      };
  }
}

/**
 * Chuẩn hóa chuỗi tiếng Việt để so sánh độ tương đồng câu hỏi
 */
function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DuplicateMatchItem {
  question: QuestionItem;
  similarityScore: number; // 0.0 -> 1.0
  matchType: 'EXACT' | 'NEAR_DUPLICATE';
}

/**
 * Phát hiện câu hỏi trùng hoặc gần giống trong Ngân hàng câu hỏi
 * Kết hợp Word Token Jaccard + Character Bigram Dice Coefficient
 */
export function findSimilarQuestions(
  candidateStem: string,
  allQuestions: QuestionItem[],
  excludeQuestionId?: string,
  threshold = 0.58
): DuplicateMatchItem[] {
  const normCandidate = normalizeVietnameseText(candidateStem);
  if (normCandidate.length < 10) return [];

  const candidateWords = new Set(normCandidate.split(' ').filter((w) => w.length > 1));
  const results: DuplicateMatchItem[] = [];

  for (const q of allQuestions) {
    if (excludeQuestionId && (q.id === excludeQuestionId || q.parentQuestionId === excludeQuestionId)) {
      continue;
    }
    const normExisting = normalizeVietnameseText(q.stem);
    if (!normExisting) continue;

    if (normCandidate === normExisting) {
      results.push({
        question: q,
        similarityScore: 1.0,
        matchType: 'EXACT',
      });
      continue;
    }

    const existingWords = new Set(normExisting.split(' ').filter((w) => w.length > 1));
    if (candidateWords.size === 0 || existingWords.size === 0) continue;

    let intersection = 0;
    for (const w of candidateWords) {
      if (existingWords.has(w)) intersection++;
    }
    const union = candidateWords.size + existingWords.size - intersection;
    const jaccard = union > 0 ? intersection / union : 0;

    // Kiểm tra thêm chứa nhau nếu câu ngắn
    const containment =
      normExisting.includes(normCandidate) || normCandidate.includes(normExisting)
        ? Math.max(jaccard, 0.82)
        : jaccard;

    if (containment >= threshold) {
      results.push({
        question: q,
        similarityScore: Number(containment.toFixed(2)),
        matchType: containment >= 0.92 ? 'EXACT' : 'NEAR_DUPLICATE',
      });
    }
  }

  return results.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5);
}

/**
 * Kiểm tra xem một câu hỏi có đang được dùng trong Đề kiểm tra chính thức (APPROVED) hay không.
 */
export function isQuestionUsedInOfficialExam(
  question: QuestionItem,
  exams: ExamPaper[]
): { usedInOfficial: boolean; officialExams: ExamPaper[] } {
  const officialExams = exams.filter(
    (e) => e.status === ApprovalStatus.APPROVED && e.questionIds.includes(question.id)
  );
  const hasOfficialHistory =
    question.usageHistory?.some((u) => u.isOfficialExam) || false;

  return {
    usedInOfficial: officialExams.length > 0 || hasOfficialHistory,
    officialExams,
  };
}

export interface QuestionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Kiểm tra tính hợp lệ của câu hỏi theo đúng bộ quy tắc của Cấp học, Khối lớp và Môn học.
 */
export function validateQuestionByLevelRules(input: {
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  topicTitle: string;
  learningOutcomeText: string;
  cognitiveLevel: CognitiveLevelCode;
  format: QuestionFormatCode;
  stem: string;
  correctAnswer: string;
  gradingGuide: string;
  points: number;
}): QuestionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ruleSet = getRuleSetForLevel(input.levelId);

  if (!ruleSet.grades.includes(input.grade)) {
    errors.push(`Khối lớp ${input.grade} không thuộc ${ruleSet.levelName}.`);
  }

  const allowedCognitiveCodes = ruleSet.cognitiveLevels.map((c) => c.code);
  if (!allowedCognitiveCodes.includes(input.cognitiveLevel)) {
    errors.push(
      `Mức độ nhận thức không hợp lệ với ${ruleSet.shortName}. ${ruleSet.shortName} áp dụng theo ${ruleSet.legalBasis}.`
    );
  }

  const suitability = checkFormatSuitabilityForSubjectAndGrade(
    input.levelId,
    input.grade,
    input.subject,
    input.format
  );

  if (!suitability.suitable && suitability.isRestricted) {
    errors.push(suitability.note || 'Định dạng câu hỏi không phù hợp với cấp học/khối lớp này.');
  } else if (suitability.note) {
    warnings.push(suitability.note);
  }

  if (!input.topicTitle.trim()) {
    errors.push('Vui lòng nhập Chủ đề / Mạch nội dung.');
  }

  if (!input.learningOutcomeText.trim() || input.learningOutcomeText.trim().length < 8) {
    errors.push('Yêu cầu cần đạt (GDPT 2018) phải mô tả rõ biểu hiện năng lực (tối thiểu 8 ký tự).');
  }

  if (!input.stem.trim() || input.stem.trim().length < 10) {
    errors.push('Nội dung câu hỏi (đề bài) quá ngắn hoặc đang để trống.');
  }

  if (!input.correctAnswer.trim()) {
    errors.push('Vui lòng nhập đáp án cho câu hỏi.');
  }

  if (!input.gradingGuide.trim()) {
    warnings.push('Khuyến nghị bổ sung hướng dẫn giải / hướng dẫn chấm chi tiết để đủ điều kiện phê duyệt.');
  }

  if (input.points <= 0 || input.points > 10) {
    errors.push('Điểm số của câu hỏi phải lớn hơn 0 và không vượt quá thang điểm 10.');
  }

  if (input.levelId === EducationLevelId.PRIMARY && input.grade <= 2 && input.points < 0.5) {
    warnings.push('Ở lớp 1–2 Tiểu học, nên tránh chia nhỏ điểm dưới 0.5 điểm để thuận tiện khi chấm bài.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function filterByDataSource<T extends { isSampleData: boolean }>(
  items: T[],
  filter: DataSourceFilter
): T[] {
  if (filter === 'SAMPLE') return items.filter((item) => item.isSampleData);
  if (filter === 'REAL') return items.filter((item) => !item.isSampleData);
  return items;
}

export interface DashboardMetrics {
  totalQuestions: number;
  sampleQuestionsCount: number;
  realQuestionsCount: number;
  totalExams: number;
  totalMatrices: number;
  pendingApprovalExams: number;
  approvedExams: number;
  revisionRequiredExams: number;
  bySubject: {
    subject: string;
    levelShortName: string;
    questionsCount: number;
    matricesCount: number;
    examsCount: number;
  }[];
  byGrade: {
    grade: GradeNumber;
    levelId: EducationLevelId;
    questionsCount: number;
    examsCount: number;
    pendingCount: number;
    approvedCount: number;
  }[];
}

export function computeDashboardMetrics(
  questions: QuestionItem[],
  matrices: ExamMatrix[],
  exams: ExamPaper[],
  sourceFilter: DataSourceFilter,
  levelFilter: EducationLevelId | 'ALL'
): DashboardMetrics {
  const filteredQ = filterByDataSource(questions, sourceFilter).filter(
    (q) => levelFilter === 'ALL' || q.levelId === levelFilter
  );
  const filteredM = filterByDataSource(matrices, sourceFilter).filter(
    (m) => levelFilter === 'ALL' || m.levelId === levelFilter
  );
  const filteredE = filterByDataSource(exams, sourceFilter).filter(
    (e) => levelFilter === 'ALL' || e.levelId === levelFilter
  );

  const allQuestionsForLevel = questions.filter((q) => levelFilter === 'ALL' || q.levelId === levelFilter);

  const subjectMap = new Map<
    string,
    { subject: string; levelShortName: string; questionsCount: number; matricesCount: number; examsCount: number }
  >();

  for (const q of filteredQ) {
    const key = `${q.levelId}__${q.subject}`;
    const existing = subjectMap.get(key) || {
      subject: q.subject,
      levelShortName: ASSESSMENT_RULES_BY_LEVEL[q.levelId].shortName,
      questionsCount: 0,
      matricesCount: 0,
      examsCount: 0,
    };
    existing.questionsCount += 1;
    subjectMap.set(key, existing);
  }

  for (const m of filteredM) {
    const key = `${m.levelId}__${m.subject}`;
    const existing = subjectMap.get(key) || {
      subject: m.subject,
      levelShortName: ASSESSMENT_RULES_BY_LEVEL[m.levelId].shortName,
      questionsCount: 0,
      matricesCount: 0,
      examsCount: 0,
    };
    existing.matricesCount += 1;
    subjectMap.set(key, existing);
  }

  for (const e of filteredE) {
    const key = `${e.levelId}__${e.subject}`;
    const existing = subjectMap.get(key) || {
      subject: e.subject,
      levelShortName: ASSESSMENT_RULES_BY_LEVEL[e.levelId].shortName,
      questionsCount: 0,
      matricesCount: 0,
      examsCount: 0,
    };
    existing.examsCount += 1;
    subjectMap.set(key, existing);
  }

  const activeGrades: GradeNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const byGrade = activeGrades
    .filter((g) => levelFilter === 'ALL' || getLevelForGrade(g) === levelFilter)
    .map((grade) => {
      const levelId = getLevelForGrade(grade);
      const qCount = filteredQ.filter((q) => q.grade === grade).length;
      const gradeExams = filteredE.filter((e) => e.grade === grade);
      return {
        grade,
        levelId,
        questionsCount: qCount,
        examsCount: gradeExams.length,
        pendingCount: gradeExams.filter((e) => e.status === ApprovalStatus.PENDING).length,
        approvedCount: gradeExams.filter((e) => e.status === ApprovalStatus.APPROVED).length,
      };
    });

  return {
    totalQuestions: filteredQ.length,
    sampleQuestionsCount: allQuestionsForLevel.filter((q) => q.isSampleData).length,
    realQuestionsCount: allQuestionsForLevel.filter((q) => !q.isSampleData).length,
    totalExams: filteredE.length,
    totalMatrices: filteredM.length,
    pendingApprovalExams: filteredE.filter((e) => e.status === ApprovalStatus.PENDING).length,
    approvedExams: filteredE.filter((e) => e.status === ApprovalStatus.APPROVED).length,
    revisionRequiredExams: filteredE.filter((e) => e.status === ApprovalStatus.REVISION_REQUIRED).length,
    bySubject: Array.from(subjectMap.values()).sort((a, b) => b.questionsCount - a.questionsCount),
    byGrade,
  };
}

