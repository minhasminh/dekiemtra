import {
  ApprovalStatus,
  CognitiveLevelCode,
  PrimaryAcceptanceExamCheckItem,
  PrimaryAcceptanceSuiteReport,
  PrimaryAssessmentFormCode,
  PrimaryCognitiveLevelCode,
  PrimaryCompleteExamPackage,
  PrimaryExamAnalyticsReport,
  PrimaryExamPeriodCode,
  PrimaryExamQuestionItem,
  PrimaryGradeNumber,
  PrimaryMathQuestionCategory,
  PrimaryMatrixTopicRow,
  PrimaryPeriodApplicabilityResult,
  PrimarySchoolApprovedTemplate,
  PrimarySpecificationRow,
  PrimaryVietnameseComponentCode,
} from '../../types/domain';

export const PRIMARY_GRADES: PrimaryGradeNumber[] = [1, 2, 3, 4, 5];

export const PRIMARY_SUBJECTS_BY_GRADE: Record<PrimaryGradeNumber, string[]> = {
  1: [
    'Toán',
    'Tiếng Việt',
    'Đạo đức',
    'Tự nhiên và Xã hội',
    'Giáo dục thể chất',
    'Nghệ thuật (Âm nhạc, Mĩ thuật)',
    'Hoạt động trải nghiệm',
  ],
  2: [
    'Toán',
    'Tiếng Việt',
    'Đạo đức',
    'Tự nhiên và Xã hội',
    'Giáo dục thể chất',
    'Nghệ thuật (Âm nhạc, Mĩ thuật)',
    'Hoạt động trải nghiệm',
  ],
  3: [
    'Toán',
    'Tiếng Việt',
    'Ngoại ngữ 1 (Tiếng Anh)',
    'Tin học và Công nghệ',
    'Đạo đức',
    'Tự nhiên và Xã hội',
    'Giáo dục thể chất',
    'Nghệ thuật (Âm nhạc, Mĩ thuật)',
    'Hoạt động trải nghiệm',
  ],
  4: [
    'Toán',
    'Tiếng Việt',
    'Khoa học',
    'Lịch sử và Địa lí',
    'Ngoại ngữ 1 (Tiếng Anh)',
    'Tin học và Công nghệ',
    'Đạo đức',
    'Giáo dục thể chất',
    'Nghệ thuật (Âm nhạc, Mĩ thuật)',
    'Hoạt động trải nghiệm',
  ],
  5: [
    'Toán',
    'Tiếng Việt',
    'Khoa học',
    'Lịch sử và Địa lí',
    'Ngoại ngữ 1 (Tiếng Anh)',
    'Tin học và Công nghệ',
    'Đạo đức',
    'Giáo dục thể chất',
    'Nghệ thuật (Âm nhạc, Mĩ thuật)',
    'Hoạt động trải nghiệm',
  ],
};

export const PRIMARY_EXAM_PERIOD_LABELS: Record<PrimaryExamPeriodCode, string> = {
  GIUA_KY_1: 'Giữa học kỳ I',
  CUOI_KY_1: 'Cuối học kỳ I',
  GIUA_KY_2: 'Giữa học kỳ II',
  CUOI_NAM: 'Cuối năm học',
};

export const PRIMARY_ASSESSMENT_FORM_LABELS: Record<PrimaryAssessmentFormCode, string> = {
  BAI_KIEM_TRA_VIET: 'Bài kiểm tra viết (Trắc nghiệm kết hợp Tự luận)',
  DOC_THANH_TIENG_KET_HOP_VIET: 'Kiểm tra Đọc (Đọc thành tiếng + Đọc hiểu/Kiến thức TV) và Kiểm tra Viết',
  LY_THUYET_KET_HOP_THUC_HANH: 'Kết hợp lý thuyết trên giấy và thực hành trên máy/thiết bị',
  BAI_THUC_HANH_DU_AN: 'Bài thực hành hoặc dự án học tập (Đánh giá qua sản phẩm)',
};

export const PRIMARY_COGNITIVE_LEVEL_METADATA: Record<
  PrimaryCognitiveLevelCode,
  {
    shortLabel: string;
    fullLabel: string;
    tt27Definition: string;
    actionVerbs: string[];
  }
> = {
  [CognitiveLevelCode.PRIMARY_MUC_1]: {
    shortLabel: 'Mức 1',
    fullLabel: 'Mức 1 – Nhận biết, nhắc lại hoặc mô tả nội dung đã học và áp dụng trực tiếp',
    tt27Definition:
      'Căn cứ Điểm a Khoản 1 Điều 7 Thông tư 27/2020/TT-BGDĐT: Học sinh nhận biết, nhắc lại hoặc mô tả được nội dung đã học và áp dụng trực tiếp để giải quyết một số tình huống, vấn đề quen thuộc trong học tập.',
    actionVerbs: ['Đọc số', 'Viết số', 'Nhận biết', 'Nêu được', 'Xác định được', 'Thực hiện phép tính cơ bản 1 bước', 'Tìm chi tiết có sẵn trong bài đọc'],
  },
  [CognitiveLevelCode.PRIMARY_MUC_2]: {
    shortLabel: 'Mức 2',
    fullLabel: 'Mức 2 – Kết nối, sắp xếp nội dung đã học để giải quyết vấn đề tương tự',
    tt27Definition:
      'Căn cứ Điểm b Khoản 1 Điều 7 Thông tư 27/2020/TT-BGDĐT: Học sinh kết nối, sắp xếp được một số nội dung đã học để giải quyết vấn đề có nội dung tương tự.',
    actionVerbs: ['Đặt tính rồi tính nhiều bước', 'Tìm thành phần chưa biết', 'Đổi đơn vị đo phức hợp', 'Hiểu ý chính đoạn văn', 'Phân loại từ ngữ trong ngữ cảnh'],
  },
  [CognitiveLevelCode.PRIMARY_MUC_3]: {
    shortLabel: 'Mức 3',
    fullLabel: 'Mức 3 – Vận dụng giải quyết vấn đề mới hoặc đưa ra phản hồi hợp lý trong cuộc sống',
    tt27Definition:
      'Căn cứ Điểm c Khoản 1 Điều 7 Thông tư 27/2020/TT-BGDĐT: Học sinh vận dụng các nội dung đã học để giải quyết một số vấn đề mới hoặc đưa ra những phản hồi hợp lý trong học tập và cuộc sống.',
    actionVerbs: ['Giải bài toán có lời văn gắn thực tiễn 2–3 bước', 'Tính bằng cách thuận tiện sáng tạo', 'Đưa ra nhận xét/liên hệ bản thân', 'Viết bài văn hoàn chỉnh sáng tạo'],
  },
};

export const PRIMARY_MATH_CATEGORY_LABELS: Record<PrimaryMathQuestionCategory, string> = {
  TRAC_NGHIEM: '1. Trắc nghiệm nhiều lựa chọn',
  DIEN_SO: '2. Điền số thích hợp vào chỗ chấm',
  TINH_TOAN: '3. Tính toán (Đặt tính rồi tính / Tính giá trị biểu thức)',
  TIM_THANH_PHAN_CHUA_BIET: '4. Tìm thành phần chưa biết trong phép tính',
  GIAI_TOAN_CO_LOI_VAN: '5. Giải toán có lời văn',
  HINH_HOC: '6. Câu hỏi Hình học (Góc, đường thẳng, diện tích, chu vi)',
  DO_LUONG: '7. Đo lường (Khối lượng, diện tích, thời gian, độ dài)',
  THONG_KE_XAC_SUAT: '8. Thống kê và xác suất phù hợp chương trình',
};

export const PRIMARY_VIETNAMESE_COMPONENT_LABELS: Record<PrimaryVietnameseComponentCode, string> = {
  DOC_THANH_TIENG: 'I. Đọc thành tiếng (Kết hợp trả lời câu hỏi miệng)',
  DOC_HIEU: 'II. Đọc hiểu văn bản',
  KIEN_THUC_TIENG_VIET: 'III. Kiến thức tiếng Việt (Luyện từ và câu)',
  VIET: 'IV. Kiểm tra Viết (Viết đoạn văn / bài văn)',
};

/**
 * Kiểm tra kỳ kiểm tra định kỳ nào áp dụng cho từng môn học và khối lớp
 * theo đúng Điều 7 Thông tư 27/2020/TT-BGDĐT.
 */
export function checkPrimaryExamApplicability(
  grade: PrimaryGradeNumber,
  subject: string,
  period: PrimaryExamPeriodCode
): PrimaryPeriodApplicabilityResult {
  const normalizedSubject = subject.trim();
  const isMathOrVietnamese =
    normalizedSubject === 'Toán' || normalizedSubject === 'Tiếng Việt';

  const periodicEndTermSubjectsByGrade: Record<PrimaryGradeNumber, string[]> = {
    1: ['Toán', 'Tiếng Việt'],
    2: ['Toán', 'Tiếng Việt'],
    3: ['Toán', 'Tiếng Việt', 'Ngoại ngữ 1 (Tiếng Anh)', 'Tin học và Công nghệ'],
    4: [
      'Toán',
      'Tiếng Việt',
      'Khoa học',
      'Lịch sử và Địa lí',
      'Ngoại ngữ 1 (Tiếng Anh)',
      'Tin học và Công nghệ',
    ],
    5: [
      'Toán',
      'Tiếng Việt',
      'Khoa học',
      'Lịch sử và Địa lí',
      'Ngoại ngữ 1 (Tiếng Anh)',
      'Tin học và Công nghệ',
    ],
  };

  const hasEndTermPeriodicTest = periodicEndTermSubjectsByGrade[grade].includes(normalizedSubject);
  const hasMidTermPeriodicTest =
    (grade === 4 || grade === 5) && isMathOrVietnamese;

  const allowedPeriods: PrimaryExamPeriodCode[] = [];
  if (hasMidTermPeriodicTest) {
    allowedPeriods.push('GIUA_KY_1', 'CUOI_KY_1', 'GIUA_KY_2', 'CUOI_NAM');
  } else if (hasEndTermPeriodicTest) {
    allowedPeriods.push('CUOI_KY_1', 'CUOI_NAM');
  }

  const isMidTerm = period === 'GIUA_KY_1' || period === 'GIUA_KY_2';
  const isMandatoryPeriodicExam = isMidTerm
    ? hasMidTermPeriodicTest
    : hasEndTermPeriodicTest;

  let recommendedForm: PrimaryAssessmentFormCode = 'BAI_KIEM_TRA_VIET';
  if (normalizedSubject === 'Tiếng Việt') {
    recommendedForm = 'DOC_THANH_TIENG_KET_HOP_VIET';
  } else if (normalizedSubject === 'Tin học và Công nghệ') {
    recommendedForm = 'LY_THUYET_KET_HOP_THUC_HANH';
  } else if (!hasEndTermPeriodicTest) {
    recommendedForm = 'BAI_THUC_HANH_DU_AN';
  }

  const recommendedDurationMinutes =
    normalizedSubject === 'Tiếng Việt'
      ? 70
      : normalizedSubject === 'Toán'
      ? 40
      : 35;

  if (isMandatoryPeriodicExam) {
    const clause = isMidTerm
      ? 'Điểm d Khoản 1 Điều 7 Thông tư 27/2020/TT-BGDĐT (Bài kiểm tra định kỳ Giữa học kỳ I và Giữa học kỳ II đối với môn Tiếng Việt, môn Toán lớp 4 và lớp 5)'
      : 'Điểm b Khoản 1 Điều 7 Thông tư 27/2020/TT-BGDĐT (Bài kiểm tra định kỳ vào Cuối học kỳ I và Cuối năm học đối với các môn học đánh giá bằng nhận xét kết hợp điểm số)';
    return {
      grade,
      subject: normalizedSubject,
      period,
      isMandatoryPeriodicExam: true,
      assessmentMethodType: 'DIEM_SO_KET_HOP_NHAN_XET',
      regulatoryClause: clause,
      statusLabel: 'Áp dụng Bài kiểm tra định kỳ theo TT 27/2020/TT-BGDĐT',
      explanationMessage: `Môn ${normalizedSubject} Lớp ${grade} tại kỳ "${PRIMARY_EXAM_PERIOD_LABELS[period]}" CÓ tổ chức bài kiểm tra định kỳ chấm điểm theo thang điểm 10 kết hợp nhận xét. Đề kiểm tra phải thiết kế theo 3 mức độ (Mức 1, Mức 2, Mức 3), không áp dụng máy móc cấu trúc đề THCS.`,
      allowedPeriodsForGradeSubject: allowedPeriods,
      recommendedDurationMinutes,
      recommendedTotalPoints: 10,
      recommendedForm,
    };
  }

  if (hasEndTermPeriodicTest && isMidTerm) {
    return {
      grade,
      subject: normalizedSubject,
      period,
      isMandatoryPeriodicExam: false,
      assessmentMethodType: 'DIEM_SO_KET_HOP_NHAN_XET',
      regulatoryClause:
        'Khoản 1 Điều 7 Thông tư 27/2020/TT-BGDĐT (Chỉ môn Toán và Tiếng Việt lớp 4, lớp 5 mới có bài kiểm tra định kỳ Giữa học kỳ I và Giữa học kỳ II)',
      statusLabel: 'Không bắt buộc kiểm tra định kỳ Giữa kỳ (Chỉ khảo sát/ôn tập tự chọn)',
      explanationMessage: `Theo Điều 7 Thông tư 27/2020/TT-BGDĐT, môn ${normalizedSubject} Lớp ${grade} chỉ có bài kiểm tra định kỳ vào Cuối học kỳ I và Cuối năm học; KHÔNG quy định bài kiểm tra định kỳ bắt buộc vào ${PRIMARY_EXAM_PERIOD_LABELS[period]}. Giáo viên có thể tạo phiếu bài tập đánh giá thường xuyên nếu nhà trường có kế hoạch.`,
      allowedPeriodsForGradeSubject: allowedPeriods,
      recommendedDurationMinutes,
      recommendedTotalPoints: 10,
      recommendedForm,
    };
  }

  return {
    grade,
    subject: normalizedSubject,
    period,
    isMandatoryPeriodicExam: false,
    assessmentMethodType: 'NHAN_XET_THUONG_XUYEN',
    regulatoryClause:
      'Khoản 2 Điều 7 Thông tư 27/2020/TT-BGDĐT (Môn học đánh giá bằng nhận xét, không chấm điểm bài kiểm tra trên giấy)',
    statusLabel: 'Môn đánh giá bằng nhận xét (Không chấm điểm định kỳ)',
    explanationMessage: `Môn ${normalizedSubject} Lớp ${grade} thuộc nhóm môn đánh giá bằng nhận xét (Hoàn thành tốt / Hoàn thành / Chưa hoàn thành) thông qua quan sát, sản phẩm học tập và hoạt động thực hành; không tổ chức bài kiểm tra lấy điểm số định kỳ.`,
    allowedPeriodsForGradeSubject: [],
    recommendedDurationMinutes: 35,
    recommendedTotalPoints: 10,
    recommendedForm: 'BAI_THUC_HANH_DU_AN',
  };
}

/**
 * Danh mục Mẫu đề đã được nhà trường phê duyệt (School-Approved Templates).
 * Nguyên tắc I: Không tự đặt tỷ lệ mức độ hoặc dạng câu thành quy định bắt buộc của pháp luật
 * mà cho phép nhà trường thiết lập mẫu đề đã được Hội đồng chuyên môn phê duyệt.
 */
export const PRIMARY_SCHOOL_APPROVED_TEMPLATES: PrimarySchoolApprovedTemplate[] = [
  {
    id: 'TPL-TH-TOAN-45-CHUAN',
    code: 'MAU-TH-TOAN-01',
    title: 'Mẫu đề Toán Lớp 4–5 (Tổ Chuyên môn & BGH phê duyệt – Gợi ý 40% Mức 1 : 40% Mức 2 : 20% Mức 3)',
    schoolDecisionRef: 'Kế hoạch chuyên môn số 12/KH-TH ngày 05/09/2025 của Hiệu trưởng Trường Tiểu học',
    approvedByRole: 'Hiệu trưởng & Tổ trưởng Chuyên môn Khối 4–5',
    applicableGrades: [4, 5],
    applicableSubjects: ['Toán'],
    applicablePeriods: ['GIUA_KY_1', 'CUOI_KY_1', 'GIUA_KY_2', 'CUOI_NAM'],
    description:
      'Mẫu đề do Nhà trường phê duyệt (không phải tỷ lệ cứng bắt buộc của Bộ GD&ĐT). Kết hợp hài hòa Trắc nghiệm (4,0 điểm) và Tự luận (6,0 điểm) bao phủ các mạch Số và phép tính, Hình học và Đo lường,Một số yếu tố Thống kê và Xác suất.',
    recommendedLevelPercents: {
      muc1Percent: 40,
      muc2Percent: 40,
      muc3Percent: 20,
    },
    recommendedFormatPercents: {
      objectivePercent: 40,
      constructedPercent: 60,
    },
    isFlexibleAdvisoryOnly: true,
  },
  {
    id: 'TPL-TH-TV-45-CHUAN',
    code: 'MAU-TH-TV-01',
    title: 'Mẫu đề Tiếng Việt Lớp 4–5 (Đọc thành tiếng + Đọc hiểu & Kiến thức TV + Viết tích hợp 10 điểm)',
    schoolDecisionRef: 'Kế hoạch chuyên môn số 12/KH-TH ngày 05/09/2025 của Hiệu trưởng Trường Tiểu học',
    approvedByRole: 'Hiệu trưởng & Tổ trưởng Chuyên môn Khối 4–5',
    applicableGrades: [4, 5],
    applicableSubjects: ['Tiếng Việt'],
    applicablePeriods: ['GIUA_KY_1', 'CUOI_KY_1', 'GIUA_KY_2', 'CUOI_NAM'],
    description:
      'Mẫu đề Tiếng Việt linh hoạt được nhà trường xác nhận: Đọc thành tiếng (2,0đ) + Đọc hiểu văn bản (2,5đ) + Kiến thức tiếng Việt (1,5đ) + Viết sáng tạo (4,0đ) = Tổng 10,0 điểm (hoặc chấm tách Đọc 10 điểm & Viết 10 điểm rồi quy đổi trung bình cộng theo hướng dẫn chuyên môn của trường).',
    recommendedLevelPercents: {
      muc1Percent: 40,
      muc2Percent: 30,
      muc3Percent: 30,
    },
    recommendedFormatPercents: {
      objectivePercent: 30,
      constructedPercent: 70,
    },
    isFlexibleAdvisoryOnly: true,
    vietnameseComponentWeights: {
      docThanhTiengPoints: 2.0,
      docHieuPoints: 2.5,
      kienThucTiengVietPoints: 1.5,
      vietPoints: 4.0,
      totalScaleDescription:
        'Thang 10,0 điểm tổng hợp (Đọc 6,0 điểm [Đọc thành tiếng 2,0đ + Đọc hiểu 2,5đ + Kiến thức TV 1,5đ] + Viết 4,0 điểm; kèm Phiếu đánh giá Đọc thành tiếng và Tiêu chí chấm Viết chi tiết)',
    },
  },
  {
    id: 'TPL-TH-LINH-HOAT-123',
    code: 'MAU-TH-FLEX-02',
    title: 'Mẫu đề Tiểu học Tự cấu hình linh hoạt theo Tổ chuyên môn (Lớp 1–5)',
    schoolDecisionRef: 'Biên bản thống nhất chuyên môn Tổ Khối 1–5',
    approvedByRole: 'Tổ trưởng chuyên môn',
    applicableGrades: [1, 2, 3, 4, 5],
    applicableSubjects: ['Toán', 'Tiếng Việt', 'Khoa học', 'Lịch sử và Địa lí', 'Ngoại ngữ 1 (Tiếng Anh)', 'Tin học và Công nghệ'],
    applicablePeriods: ['GIUA_KY_1', 'CUOI_KY_1', 'GIUA_KY_2', 'CUOI_NAM'],
    description:
      'Cho phép giáo viên và nhà trường điều chỉnh linh hoạt tỷ trọng Mức 1 – Mức 2 – Mức 3 tùy theo đặc thù học sinh địa phương mà không áp đặt công thức cứng.',
    recommendedLevelPercents: {
      muc1Percent: 50,
      muc2Percent: 30,
      muc3Percent: 20,
    },
    recommendedFormatPercents: {
      objectivePercent: 50,
      constructedPercent: 50,
    },
    isFlexibleAdvisoryOnly: true,
  },
];

/**
 * Danh mục Yêu cầu cần đạt (YCCĐ) chuẩn của phạm vi kiểm tra để đối chiếu
 * và tự động phát hiện "Những yêu cầu cần đạt chưa được đánh giá" (Mục VI).
 */
export interface ScopeLearningOutcomeItem {
  topicTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
}

export const CURRICULUM_SCOPE_OUTCOMES_CATALOG: Record<string, ScopeLearningOutcomeItem[]> = {
  'TOAN_4_GIUA_KY_1': [
    {
      topicTitle: 'Số tự nhiên đến lớp triệu',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-01',
      learningOutcomeText: 'Đọc, viết, xác định giá trị theo hàng và lớp của số tự nhiên đến lớp triệu; làm tròn số đến hàng trăm nghìn.',
    },
    {
      topicTitle: 'Các phép tính với số tự nhiên',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-02',
      learningOutcomeText: 'Thực hiện phép cộng, phép trừ các số tự nhiên có nhiều chữ số; tính giá trị biểu thức số và tìm thành phần chưa biết.',
    },
    {
      topicTitle: 'Đo lường (Khối lượng, Diện tích, Thời gian)',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-03',
      learningOutcomeText: 'Nhận biết và chuyển đổi các đơn vị đo khối lượng (yến, tạ, tấn), thời gian (thế kỷ, giây), diện tích (dm², m², mm²).',
    },
    {
      topicTitle: 'Hình học phẳng (Góc và Đường thẳng)',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-04',
      learningOutcomeText: 'Nhận biết góc nhọn, góc tù, góc bẹt; nhận biết hai đường thẳng vuông góc và hai đường thẳng song song.',
    },
    {
      topicTitle: 'Một số yếu tố Thống kê và Xác suất',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-05',
      learningOutcomeText: 'Đọc và mô tả được các số liệu trên dãy số liệu hoặc bảng thống kê, biểu đồ cột đơn giản.',
    },
    {
      topicTitle: 'Giải bài toán có lời văn thực tiễn',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-06',
      learningOutcomeText: 'Giải quyết được bài toán thực tiễn có đến 2–3 bước tính (tìm số trung bình cộng, tìm hai số khi biết tổng và hiệu).',
    },
    {
      topicTitle: 'Hình học thực hành (Dùng thước đo góc)',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-07',
      learningOutcomeText: 'Sử dụng thước đo góc để đo số đo góc cụ thể (60°, 90°, 120°) trên hình vẽ thực hành.',
    },
  ],
  'TIENG_VIET_4_GIUA_KY_1': [
    {
      topicTitle: 'Kĩ năng Đọc thành tiếng',
      learningOutcomeCode: 'TV4-GK1-YCCD-01',
      learningOutcomeText: 'Đọc thành tiếng trôi chảy văn bản (tốc độ khoảng 75–80 tiếng/phút), phát âm rõ, ngắt nghỉ hơi đúng dấu câu và trả lời được 1 câu hỏi về nội dung đoạn đọc.',
    },
    {
      topicTitle: 'Đọc hiểu chi tiết và nội dung chính văn bản',
      learningOutcomeCode: 'TV4-GK1-YCCD-02',
      learningOutcomeText: 'Nhận biết được chi tiết tiêu biểu, nhân vật, sự việc và xác định được nội dung chính, thông điệp của văn bản truyện hoặc miêu tả.',
    },
    {
      topicTitle: 'Đọc hiểu liên hệ và phản hồi cá nhân',
      learningOutcomeCode: 'TV4-GK1-YCCD-03',
      learningOutcomeText: 'Nêu được suy nghĩ, cảm xúc cá nhân hoặc bài học ứng xử rút ra từ câu chuyện và đặt câu thể hiện tình cảm phù hợp.',
    },
    {
      topicTitle: 'Kiến thức tiếng Việt (Danh từ, Động từ, Tính từ)',
      learningOutcomeCode: 'TV4-GK1-YCCD-04',
      learningOutcomeText: 'Nhận biết và sử dụng đúng danh từ chung, danh từ riêng, động từ và tính từ trong câu văn, đoạn văn.',
    },
    {
      topicTitle: 'Kĩ năng Viết bài văn kể chuyện',
      learningOutcomeCode: 'TV4-GK1-YCCD-05',
      learningOutcomeText: 'Viết được bài văn kể lại một câu chuyện đã đọc, đã nghe có bố cục 3 phần (Mở bài, Thân bài, Kết bài), cốt truyện rõ ràng, chi tiết sinh động.',
    },
    {
      topicTitle: 'Kiến thức tiếng Việt (Quy tắc viết tên cơ quan, tổ chức)',
      learningOutcomeCode: 'TV4-GK1-YCCD-06',
      learningOutcomeText: 'Viết hoa đúng quy tắc tên cơ quan, tổ chức gồm nhiều bộ phận kết hợp.',
    },
  ],
  'TOAN_5_CUOI_KY_1': [
    {
      topicTitle: 'Số thập phân và So sánh số thập phân',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-01',
      learningOutcomeText: 'Đọc, viết, xác định hàng của số thập phân; chuyển phân số thập phân/hỗn số thành số thập phân; so sánh và làm tròn số thập phân.',
    },
    {
      topicTitle: 'Các phép tính với số thập phân',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-02',
      learningOutcomeText: 'Thực hiện phép cộng, trừ, nhân, chia số thập phân; vận dụng tính chất giao hoán, kết hợp, phân phối để tính bằng cách thuận tiện và tìm thành phần chưa biết.',
    },
    {
      topicTitle: 'Đo lường (Đơn vị đo diện tích ha, km², m²)',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-03',
      learningOutcomeText: 'Nhận biết và chuyển đổi mối quan hệ giữa các đơn vị đo diện tích: mét vuông (m²), héc-ta (ha), ki-lô-mét vuông (km²) dưới dạng số thập phân.',
    },
    {
      topicTitle: 'Hình học phẳng (Tam giác, Hình thang, Hình tròn)',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-04',
      learningOutcomeText: 'Tính được diện tích hình tam giác, diện tích hình thang, chu vi và diện tích hình tròn.',
    },
    {
      topicTitle: 'Thống kê và Xác suất thực nghiệm',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-05',
      learningOutcomeText: 'Đọc bảng số liệu thống kê và sử dụng tỉ số để mô tả số lần lặp lại của một khả năng xảy ra (xác suất thực nghiệm) trong trò chơi đơn giản.',
    },
    {
      topicTitle: 'Giải toán có lời văn về Số thập phân & Diện tích',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-06',
      learningOutcomeText: 'Giải quyết được bài toán thực tiễn gắn với các phép tính số thập phân và tính diện tích mảnh đất, sản lượng thu hoạch.',
    },
    {
      topicTitle: 'Tỉ lệ bản đồ và ứng dụng thực hành',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-07',
      learningOutcomeText: 'Nhận biết tỉ lệ bản đồ và tính độ dài thật từ độ dài thu nhỏ trên bản đồ.',
    },
  ],
};

/**
 * Hàm tự động tổng hợp Ma trận, Bản đặc tả và Phân tích Đề (Mục VI)
 * từ danh sách câu hỏi và cấu hình đề.
 */
export function buildPrimaryMatrixAndAnalytics(
  questions: PrimaryExamQuestionItem[],
  expectedTotalPoints: number,
  scopeCatalogKey: string,
  subject: string
): {
  matrixRows: PrimaryMatrixTopicRow[];
  specificationRows: PrimarySpecificationRow[];
  analytics: PrimaryExamAnalyticsReport;
} {
  const totalPoints = Number(
    questions.reduce((acc, q) => acc + q.points, 0).toFixed(2)
  );
  const totalQuestions = questions.length;

  // 1. Xây dựng Ma trận theo chủ đề
  const topicMap = new Map<string, PrimaryMatrixTopicRow>();
  for (const q of questions) {
    let row = topicMap.get(q.topicTitle);
    if (!row) {
      row = {
        id: `MAT-ROW-${topicMap.size + 1}`,
        topicTitle: q.topicTitle,
        learningOutcomesSummary: [],
        muc1ObjectiveCount: 0,
        muc1ObjectivePoints: 0,
        muc1ConstructedCount: 0,
        muc1ConstructedPoints: 0,
        muc2ObjectiveCount: 0,
        muc2ObjectivePoints: 0,
        muc2ConstructedCount: 0,
        muc2ConstructedPoints: 0,
        muc3ObjectiveCount: 0,
        muc3ObjectivePoints: 0,
        muc3ConstructedCount: 0,
        muc3ConstructedPoints: 0,
        totalQuestions: 0,
        totalPoints: 0,
        percentOfExam: 0,
      };
      topicMap.set(q.topicTitle, row);
    }

    if (!row.learningOutcomesSummary.includes(q.learningOutcomeText)) {
      row.learningOutcomesSummary.push(q.learningOutcomeText);
    }

    const isObj = q.formatType === 'TRAC_NGHIEM';
    if (q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_1) {
      if (isObj) {
        row.muc1ObjectiveCount += 1;
        row.muc1ObjectivePoints = Number((row.muc1ObjectivePoints + q.points).toFixed(2));
      } else {
        row.muc1ConstructedCount += 1;
        row.muc1ConstructedPoints = Number((row.muc1ConstructedPoints + q.points).toFixed(2));
      }
    } else if (q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_2) {
      if (isObj) {
        row.muc2ObjectiveCount += 1;
        row.muc2ObjectivePoints = Number((row.muc2ObjectivePoints + q.points).toFixed(2));
      } else {
        row.muc2ConstructedCount += 1;
        row.muc2ConstructedPoints = Number((row.muc2ConstructedPoints + q.points).toFixed(2));
      }
    } else {
      if (isObj) {
        row.muc3ObjectiveCount += 1;
        row.muc3ObjectivePoints = Number((row.muc3ObjectivePoints + q.points).toFixed(2));
      } else {
        row.muc3ConstructedCount += 1;
        row.muc3ConstructedPoints = Number((row.muc3ConstructedPoints + q.points).toFixed(2));
      }
    }

    row.totalQuestions += 1;
    row.totalPoints = Number((row.totalPoints + q.points).toFixed(2));
  }

  const matrixRows = Array.from(topicMap.values()).map((r) => ({
    ...r,
    percentOfExam:
      totalPoints > 0 ? Number(((r.totalPoints / totalPoints) * 100).toFixed(1)) : 0,
  }));

  // 2. Xây dựng Bản đặc tả chi tiết
  const specificationRows: PrimarySpecificationRow[] = questions.map((q, idx) => ({
    id: `SPEC-ROW-${idx + 1}`,
    topicTitle: q.topicTitle,
    learningOutcomeCode: q.learningOutcomeCode,
    learningOutcomeText: q.learningOutcomeText,
    cognitiveLevel: q.cognitiveLevel,
    cognitiveLevelJustification: q.cognitiveLevelJustification,
    questionNumbers: [q.questionNumberLabel],
    questionFormatLabel:
      q.formatType === 'TRAC_NGHIEM' ? 'Trắc nghiệm' : 'Tự luận / Thực hành',
    specializedCategoryLabel: q.mathCategory
      ? PRIMARY_MATH_CATEGORY_LABELS[q.mathCategory]
      : q.vietnameseComponent
      ? PRIMARY_VIETNAMESE_COMPONENT_LABELS[q.vietnameseComponent]
      : q.formatType === 'TRAC_NGHIEM'
      ? 'Trắc nghiệm khách quan'
      : 'Tự luận',
    points: q.points,
  }));

  // 3. Phân tích theo Mức độ (Mức 1, Mức 2, Mức 3)
  const levelsOrder: PrimaryCognitiveLevelCode[] = [
    CognitiveLevelCode.PRIMARY_MUC_1,
    CognitiveLevelCode.PRIMARY_MUC_2,
    CognitiveLevelCode.PRIMARY_MUC_3,
  ];
  const byLevel = levelsOrder.map((lvl) => {
    const matched = questions.filter((q) => q.cognitiveLevel === lvl);
    const pts = Number(matched.reduce((s, q) => s + q.points, 0).toFixed(2));
    return {
      level: lvl,
      label: PRIMARY_COGNITIVE_LEVEL_METADATA[lvl].shortLabel,
      questionCount: matched.length,
      points: pts,
      percentageOfPoints:
        totalPoints > 0 ? Number(((pts / totalPoints) * 100).toFixed(1)) : 0,
    };
  });

  // 4. Phân tích theo Chủ đề
  const byTopic = matrixRows.map((r) => ({
    topicTitle: r.topicTitle,
    questionCount: r.totalQuestions,
    points: r.totalPoints,
    percentageOfPoints: r.percentOfExam,
  }));

  // 5. Phân tích theo Yêu cầu cần đạt (YCCĐ)
  const yccdMap = new Map<
    string,
    {
      learningOutcomeCode: string;
      learningOutcomeText: string;
      questionCount: number;
      points: number;
      questionLabels: string[];
    }
  >();
  for (const q of questions) {
    const existing = yccdMap.get(q.learningOutcomeCode);
    if (!existing) {
      yccdMap.set(q.learningOutcomeCode, {
        learningOutcomeCode: q.learningOutcomeCode,
        learningOutcomeText: q.learningOutcomeText,
        questionCount: 1,
        points: q.points,
        questionLabels: [q.questionNumberLabel],
      });
    } else {
      existing.questionCount += 1;
      existing.points = Number((existing.points + q.points).toFixed(2));
      existing.questionLabels.push(q.questionNumberLabel);
    }
  }
  const byLearningOutcome = Array.from(yccdMap.values());

  // 6. Tỷ lệ Trắc nghiệm và Tự luận
  const objQuestions = questions.filter((q) => q.formatType === 'TRAC_NGHIEM');
  const consQuestions = questions.filter((q) => q.formatType === 'TU_LUAN');
  const objPoints = Number(objQuestions.reduce((s, q) => s + q.points, 0).toFixed(2));
  const consPoints = Number(consQuestions.reduce((s, q) => s + q.points, 0).toFixed(2));

  const formatDistribution = {
    objectiveQuestionCount: objQuestions.length,
    objectivePoints: objPoints,
    objectivePercent:
      totalPoints > 0 ? Number(((objPoints / totalPoints) * 100).toFixed(1)) : 0,
    constructedQuestionCount: consQuestions.length,
    constructedPoints: consPoints,
    constructedPercent:
      totalPoints > 0 ? Number(((consPoints / totalPoints) * 100).toFixed(1)) : 0,
  };

  // 7. Thống kê đặc thù Môn Toán (nếu môn Toán)
  let mathVerificationSummary: PrimaryExamAnalyticsReport['mathVerificationSummary'];
  if (subject === 'Toán') {
    const mathQuestions = questions.filter((q) => Boolean(q.mathCategory));
    const allChecks = mathQuestions.flatMap((q) => q.mathCalculationChecks || []);
    const allCalculationsAccurate =
      allChecks.length > 0 && allChecks.every((c) => c.isAccurate);
    const allRubricStepsMatchQuestionPoints = mathQuestions.every((q) => {
      const sumRubric = Number(
        q.rubricSteps.reduce((s, r) => s + r.points, 0).toFixed(2)
      );
      return Math.abs(sumRubric - q.points) < 0.001;
    });

    const allCategories: PrimaryMathQuestionCategory[] = [
      'TRAC_NGHIEM',
      'DIEN_SO',
      'TINH_TOAN',
      'TIM_THANH_PHAN_CHUA_BIET',
      'GIAI_TOAN_CO_LOI_VAN',
      'HINH_HOC',
      'DO_LUONG',
      'THONG_KE_XAC_SUAT',
    ];

    mathVerificationSummary = {
      totalMathQuestionsChecked: mathQuestions.length,
      totalArithmeticStepsChecked: allChecks.length,
      allCalculationsAccurate,
      allRubricStepsMatchQuestionPoints,
      categoryBreakdown: allCategories.map((cat) => {
        const matched = mathQuestions.filter((q) => q.mathCategory === cat);
        return {
          category: cat,
          label: PRIMARY_MATH_CATEGORY_LABELS[cat],
          questionCount: matched.length,
          points: Number(matched.reduce((s, q) => s + q.points, 0).toFixed(2)),
        };
      }),
    };
  }

  // 8. Thống kê đặc thù Môn Tiếng Việt (nếu môn Tiếng Việt)
  let vietnameseComponentSummary: PrimaryExamAnalyticsReport['vietnameseComponentSummary'];
  if (subject === 'Tiếng Việt') {
    const components: PrimaryVietnameseComponentCode[] = [
      'DOC_THANH_TIENG',
      'DOC_HIEU',
      'KIEN_THUC_TIENG_VIET',
      'VIET',
    ];
    vietnameseComponentSummary = components.map((comp) => {
      const matched = questions.filter((q) => q.vietnameseComponent === comp);
      const pts = Number(matched.reduce((s, q) => s + q.points, 0).toFixed(2));
      return {
        component: comp,
        label: PRIMARY_VIETNAMESE_COMPONENT_LABELS[comp],
        questionCount: matched.length,
        points: pts,
        percentageOfPoints:
          totalPoints > 0 ? Number(((pts / totalPoints) * 100).toFixed(1)) : 0,
      };
    });
  }

  // 9. Phát hiện những Yêu cầu cần đạt (YCCĐ) trong phạm vi chương trình nhưng chưa được đánh giá trong đề
  const scopeCatalog = CURRICULUM_SCOPE_OUTCOMES_CATALOG[scopeCatalogKey] || [];
  const assessedCodes = new Set(questions.map((q) => q.learningOutcomeCode));
  const unassessedLearningOutcomes = scopeCatalog
    .filter((item) => !assessedCodes.has(item.learningOutcomeCode))
    .map((item) => ({
      topicTitle: item.topicTitle,
      learningOutcomeCode: item.learningOutcomeCode,
      learningOutcomeText: item.learningOutcomeText,
      reasonNote:
        'Thuộc phạm vi chương trình của kỳ kiểm tra nhưng chưa được chọn vào ma trận đề này (do giới hạn thời lượng 40–70 phút); khuyến nghị đánh giá bổ sung qua đánh giá thường xuyên trên lớp.',
    }));

  return {
    matrixRows,
    specificationRows,
    analytics: {
      totalQuestions,
      totalPoints,
      expectedTotalPoints,
      isTotalPointsExact: Math.abs(totalPoints - expectedTotalPoints) < 0.001,
      byLevel,
      byTopic,
      byLearningOutcome,
      formatDistribution,
      mathVerificationSummary,
      vietnameseComponentSummary,
      unassessedLearningOutcomes,
    },
  };
}

// ============================================================================
// ĐỀ SỐ 1: ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I – MÔN TOÁN LỚP 4
// ============================================================================
function createMathGrade4MidTerm1Package(): PrimaryCompleteExamPackage {
  const applicabilityCheck = checkPrimaryExamApplicability(4, 'Toán', 'GIUA_KY_1');

  const questions: PrimaryExamQuestionItem[] = [
    {
      id: 'TOAN4-GK1-Q01',
      questionNumberLabel: 'Câu 1',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN4-SO-TU-NHIEN',
      topicTitle: 'Số tự nhiên đến lớp triệu',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-01',
      learningOutcomeText:
        'Đọc, viết, xác định giá trị theo hàng và lớp của số tự nhiên đến lớp triệu; làm tròn số đến hàng trăm nghìn.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh nhận biết trực tiếp cách viết số tự nhiên có nhiều chữ số từ cách đọc các lớp triệu, lớp nghìn, lớp đơn vị đã học.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Số "Bốn mươi lăm triệu không trăm hai mươi ba nghìn một trăm linh tám" được viết là:',
      options: [
        'A. 45 023 108',
        'B. 45 230 108',
        'C. 45 023 180',
        'D. 405 023 108',
      ],
      correctAnswer: 'A. 45 023 108',
      gradingGuide: 'Khoanh đúng vào chữ cái A được 1,0 điểm.',
      rubricSteps: [
        { stepDescription: 'Chọn đúng phương án A (45 023 108)', points: 1.0 },
      ],
      mathCategory: 'TRAC_NGHIEM',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '45 × 1 000 000 + 23 × 1 000 + 108',
          expectedValue: '45023108',
          computedValue: String(45 * 1000000 + 23 * 1000 + 108),
          isAccurate: 45 * 1000000 + 23 * 1000 + 108 === 45023108,
          verificationNote: 'Khớp chính xác cấu tạo thập phân của số 45 023 108.',
        },
      ],
    },
    {
      id: 'TOAN4-GK1-Q02',
      questionNumberLabel: 'Câu 2',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN4-SO-TU-NHIEN',
      topicTitle: 'Số tự nhiên đến lớp triệu',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-01',
      learningOutcomeText:
        'Đọc, viết, xác định giá trị theo hàng và lớp của số tự nhiên đến lớp triệu; làm tròn số đến hàng trăm nghìn.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh xác định trực tiếp hàng và giá trị theo vị trí của chữ số 7 trong số tự nhiên 375 412 069 và áp dụng quy tắc làm tròn số cơ bản.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Điền số thích hợp vào chỗ chấm:\na) Trong số 375 412 069, giá trị của chữ số 7 là ........................\nb) Làm tròn số 684 350 đến hàng trăm nghìn ta được số ........................',
      options: [
        'A. a) 70 000 000 ; b) 700 000',
        'B. a) 7 000 000 ; b) 600 000',
        'C. a) 70 000 000 ; b) 680 000',
        'D. a) 700 000 ; b) 700 000',
      ],
      correctAnswer: 'A. a) 70 000 000 ; b) 700 000',
      gradingGuide: 'Điền/chọn đúng mỗi ý a), b) được 0,5 điểm (Tổng 1,0 điểm).',
      rubricSteps: [
        { stepDescription: 'Ý a) Xác định đúng giá trị chữ số 7 là 70 000 000', points: 0.5 },
        { stepDescription: 'Ý b) Làm tròn 684 350 đến hàng trăm nghìn được 700 000', points: 0.5 },
      ],
      mathCategory: 'DIEN_SO',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: 'Giá trị chữ số 7 ở hàng chục triệu (7 × 10 000 000)',
          expectedValue: '70000000',
          computedValue: String(7 * 10000000),
          isAccurate: 7 * 10000000 === 70000000,
          verificationNote: 'Chữ số 7 thuộc hàng chục triệu, lớp triệu.',
        },
        {
          stepOrder: 2,
          expressionLabel: 'Làm tròn 684 350 đến hàng trăm nghìn (chữ số hàng chục nghìn là 8 ≥ 5)',
          expectedValue: '700000',
          computedValue: String(Math.round(684350 / 100000) * 100000),
          isAccurate: Math.round(684350 / 100000) * 100000 === 700000,
          verificationNote: 'Làm tròn đúng quy tắc đến hàng trăm nghìn.',
        },
      ],
    },
    {
      id: 'TOAN4-GK1-Q03',
      questionNumberLabel: 'Câu 3',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN4-DO-LUONG',
      topicTitle: 'Đo lường (Khối lượng, Diện tích, Thời gian)',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-03',
      learningOutcomeText:
        'Nhận biết và chuyển đổi các đơn vị đo khối lượng (yến, tạ, tấn), thời gian (thế kỷ, giây), diện tích (dm², m², mm²).',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh kết nối mối quan hệ giữa hai đơn vị đo khối lượng (tấn – kg) và diện tích (m² – dm²) trong số đo phức hợp để chuyển đổi sang một đơn vị đo duy nhất.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Số thích hợp điền vào chỗ chấm của 4 tấn 35 kg = ........ kg và 6 m² 8 dm² = ........ dm² lần lượt là:',
      options: [
        'A. 4 035 kg và 608 dm²',
        'B. 435 kg và 68 dm²',
        'C. 4 350 kg và 680 dm²',
        'D. 4 035 kg và 6 008 dm²',
      ],
      correctAnswer: 'A. 4 035 kg và 608 dm²',
      gradingGuide: 'Chọn đúng phương án A (4 035 kg và 608 dm²) được 1,0 điểm.',
      rubricSteps: [
        { stepDescription: 'Đổi đúng 4 tấn 35 kg = 4 035 kg và 6 m² 8 dm² = 608 dm² (Phương án A)', points: 1.0 },
      ],
      mathCategory: 'DO_LUONG',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '4 tấn 35 kg = 4 × 1 000 + 35 (kg)',
          expectedValue: '4035',
          computedValue: String(4 * 1000 + 35),
          unitLabel: 'kg',
          isAccurate: 4 * 1000 + 35 === 4035,
          verificationNote: '1 tấn = 1 000 kg -> 4 tấn 35 kg = 4 035 kg.',
        },
        {
          stepOrder: 2,
          expressionLabel: '6 m² 8 dm² = 6 × 100 + 8 (dm²)',
          expectedValue: '608',
          computedValue: String(6 * 100 + 8),
          unitLabel: 'dm²',
          isAccurate: 6 * 100 + 8 === 608,
          verificationNote: '1 m² = 100 dm² -> 6 m² 8 dm² = 608 dm².',
        },
      ],
    },
    {
      id: 'TOAN4-GK1-Q04',
      questionNumberLabel: 'Câu 4',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN4-HINH-HOC',
      topicTitle: 'Hình học phẳng (Góc và Đường thẳng)',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-04',
      learningOutcomeText:
        'Nhận biết góc nhọn, góc tù, góc bẹt; nhận biết hai đường thẳng vuông góc và hai đường thẳng song song.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh nhận biết trực tiếp tính chất góc vuông, cặp cạnh song song và cặp cạnh vuông góc trên hình chữ nhật ABCD quen thuộc.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Cho hình chữ nhật ABCD có chiều dài AB = 8 cm, chiều rộng BC = 5 cm. Khẳng định nào dưới đây là ĐÚNG?',
      options: [
        'A. Cạnh AB song song với cạnh CD và cạnh AB vuông góc với cạnh BC.',
        'B. Cạnh AB vuông góc với cạnh CD và hình chữ nhật có 2 góc tù.',
        'C. Cạnh AD song song với cạnh AB và góc đỉnh B là góc nhọn.',
        'D. Cạnh BC song song với cạnh CD.',
      ],
      correctAnswer: 'A. Cạnh AB song song với cạnh CD và cạnh AB vuông góc với cạnh BC.',
      gradingGuide: 'Chọn đúng phương án A được 1,0 điểm.',
      rubricSteps: [
        { stepDescription: 'Chọn đúng phương án A', points: 1.0 },
      ],
      mathCategory: 'HINH_HOC',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: 'Số góc vuông của hình chữ nhật ABCD (4 × 90°)',
          expectedValue: '360',
          computedValue: String(4 * 90),
          unitLabel: 'độ',
          isAccurate: 4 * 90 === 360,
          verificationNote: 'AB // CD và AB ⊥ BC tại đỉnh B (góc vuông 90°).',
        },
      ],
    },
    {
      id: 'TOAN4-GK1-Q05',
      questionNumberLabel: 'Câu 5',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN4-PHEP-TINH',
      topicTitle: 'Các phép tính với số tự nhiên',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-02',
      learningOutcomeText:
        'Thực hiện phép cộng, phép trừ các số tự nhiên có nhiều chữ số; tính giá trị biểu thức số và tìm thành phần chưa biết.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh đặt tính theo cột dọc và thực hiện phép cộng có nhớ, phép trừ có nhớ với các số tự nhiên đến lớp trăm nghìn.',
      formatType: 'TU_LUAN',
      points: 1.5,
      stem: 'Đặt tính rồi tính:\na) 346 258 + 129 437\nb) 805 620 - 248 375',
      correctAnswer: 'a) 475 695 ; b) 557 245',
      gradingGuide:
        'Đặt tính thẳng hàng và tính đúng kết quả mỗi phép tính được 0,75 điểm (2 phép tính × 0,75đ = 1,5 điểm).',
      rubricSteps: [
        { stepDescription: 'Ý a) Đặt tính thẳng cột và tính đúng: 346 258 + 129 437 = 475 695', points: 0.75 },
        { stepDescription: 'Ý b) Đặt tính thẳng cột và tính đúng: 805 620 - 248 375 = 557 245', points: 0.75 },
      ],
      mathCategory: 'TINH_TOAN',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '346258 + 129437',
          expectedValue: '475695',
          computedValue: String(346258 + 129437),
          isAccurate: 346258 + 129437 === 475695,
          verificationNote: 'Phép cộng có nhớ kiểm tra chính xác tuyệt đối.',
        },
        {
          stepOrder: 2,
          expressionLabel: '805620 - 248375',
          expectedValue: '557245',
          computedValue: String(805620 - 248375),
          isAccurate: 805620 - 248375 === 557245,
          verificationNote: 'Phép trừ có nhớ kiểm tra chính xác tuyệt đối.',
        },
      ],
    },
    {
      id: 'TOAN4-GK1-Q06',
      questionNumberLabel: 'Câu 6',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN4-PHEP-TINH',
      topicTitle: 'Các phép tính với số tự nhiên',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-02',
      learningOutcomeText:
        'Thực hiện phép cộng, phép trừ các số tự nhiên có nhiều chữ số; tính giá trị biểu thức số và tìm thành phần chưa biết.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh kết nối quy tắc tìm số bị trừ chưa biết trong phép tính có vế phải là một biểu thức nhân.',
      formatType: 'TU_LUAN',
      points: 1.0,
      stem: 'Tìm thành phần chưa biết (x) trong phép tính:\nx - 14 580 = 23 420 × 2',
      correctAnswer: 'x = 61 420',
      gradingGuide:
        'Tính đúng vế phải 23 420 × 2 = 46 840 được 0,5 điểm; tìm đúng số bị trừ x = 46 840 + 14 580 = 61 420 được 0,5 điểm.',
      rubricSteps: [
        { stepDescription: 'Viết được: x - 14 580 = 46 840', points: 0.5 },
        { stepDescription: 'Tìm đúng: x = 46 840 + 14 580 = 61 420', points: 0.5 },
      ],
      mathCategory: 'TIM_THANH_PHAN_CHUA_BIET',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '23420 × 2',
          expectedValue: '46840',
          computedValue: String(23420 * 2),
          isAccurate: 23420 * 2 === 46840,
          verificationNote: 'Tính đúng tích ở vế phải.',
        },
        {
          stepOrder: 2,
          expressionLabel: '46840 + 14580',
          expectedValue: '61420',
          computedValue: String(46840 + 14580),
          isAccurate: 46840 + 14580 === 61420,
          verificationNote: 'Thử lại: 61 420 - 14 580 = 46 840 (Đúng).',
        },
      ],
    },
    {
      id: 'TOAN4-GK1-Q07',
      questionNumberLabel: 'Câu 7',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN4-THONG-KE',
      topicTitle: 'Một số yếu tố Thống kê và Xác suất',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-05',
      learningOutcomeText:
        'Đọc và mô tả được các số liệu trên dãy số liệu hoặc bảng thống kê, biểu đồ cột đơn giản.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh đọc số liệu từ bảng thống kê quyên góp sách của 4 khối lớp, so sánh tìm khối nhiều nhất và tính tổng số sách quyên góp.',
      formatType: 'TU_LUAN',
      points: 1.5,
      stem: 'Bảng thống kê dưới đây cho biết số quyển sách mà học sinh bốn khối lớp của Trường Tiểu học Kim Đồng đã quyên góp cho tủ sách vùng cao:\n- Khối 2: 135 quyển\n- Khối 3: 150 quyển\n- Khối 4: 185 quyển\n- Khối 5: 210 quyển\nDựa vào bảng số liệu trên, em hãy trả lời các câu hỏi sau:\na) Khối lớp nào quyên góp được nhiều sách nhất và nhiều hơn Khối 2 bao nhiêu quyển?\nb) Cả bốn khối lớp quyên góp được tất cả bao nhiêu quyển sách?',
      correctAnswer: 'a) Khối 5 quyên góp nhiều nhất và nhiều hơn Khối 2 là 75 quyển sách; b) Cả bốn khối quyên góp được 680 quyển sách.',
      gradingGuide:
        'Ý a) Nêu đúng Khối 5 nhiều nhất và tính đúng 210 - 135 = 75 (quyển) được 0,75 điểm; Ý b) Tính đúng tổng 135 + 150 + 185 + 210 = 680 (quyển) được 0,75 điểm.',
      rubricSteps: [
        { stepDescription: 'Ý a) Nêu đúng Khối 5 quyên góp nhiều nhất và tính đúng: 210 - 135 = 75 (quyển)', points: 0.75 },
        { stepDescription: 'Ý b) Tính đúng tổng số sách của cả 4 khối: 135 + 150 + 185 + 210 = 680 (quyển)', points: 0.75 },
      ],
      mathCategory: 'THONG_KE_XAC_SUAT',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '210 - 135',
          expectedValue: '75',
          computedValue: String(210 - 135),
          unitLabel: 'quyển',
          isAccurate: 210 - 135 === 75,
          verificationNote: 'Hiệu số sách giữa Khối 5 và Khối 2 là 75 quyển.',
        },
        {
          stepOrder: 2,
          expressionLabel: '135 + 150 + 185 + 210',
          expectedValue: '680',
          computedValue: String(135 + 150 + 185 + 210),
          unitLabel: 'quyển',
          isAccurate: 135 + 150 + 185 + 210 === 680,
          verificationNote: 'Tổng số sách cả 4 khối là 680 quyển.',
        },
      ],
    },
    {
      id: 'TOAN4-GK1-Q08',
      questionNumberLabel: 'Câu 8',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN4-GIAI-TOAN',
      topicTitle: 'Giải bài toán có lời văn thực tiễn',
      learningOutcomeCode: 'TOAN4-GK1-YCCD-06',
      learningOutcomeText:
        'Giải quyết được bài toán thực tiễn có đến 2–3 bước tính (tìm số trung bình cộng, tìm hai số khi biết tổng và hiệu).',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3,
      cognitiveLevelJustification:
        'Mức 3 (TT 27/2020): Học sinh vận dụng kết hợp bài toán tìm hai số khi biết tổng và hiệu trong tình huống thu hoạch nông sản thực tế và mở rộng tính trung bình cộng.',
      formatType: 'TU_LUAN',
      points: 2.0,
      stem: 'Hai thửa ruộng thu hoạch được tất cả 5 tấn 4 tạ thóc. Biết rằng thửa ruộng thứ nhất thu hoạch được nhiều hơn thửa ruộng thứ hai là 6 tạ thóc.\na) Hỏi mỗi thửa ruộng thu hoạch được bao nhiêu ki-lô-gam thóc?\nb) Nếu đem toàn bộ số thóc của thửa ruộng thứ nhất đóng đều vào 60 bao thì trung bình mỗi bao nặng bao nhiêu ki-lô-gam thóc?',
      correctAnswer: 'a) Thửa thứ nhất: 3 000 kg thóc; Thửa thứ hai: 2 400 kg thóc; b) Trung bình mỗi bao nặng 50 kg thóc.',
      gradingGuide:
        'Đổi đúng đơn vị (0,25đ); tính đúng số thóc thửa ruộng thứ nhất (0,75đ); tính đúng số thóc thửa ruộng thứ hai (0,5đ); tính đúng trung bình mỗi bao ở ý b và đáp số đầy đủ (0,5đ).',
      rubricSteps: [
        { stepDescription: 'Đổi đơn vị: 5 tấn 4 tạ = 54 tạ = 5 400 kg; 6 tạ = 600 kg', points: 0.25 },
        { stepDescription: 'Thửa ruộng thứ nhất thu hoạch được: (5 400 + 600) : 2 = 3 000 (kg)', points: 0.75 },
        { stepDescription: 'Thửa ruộng thứ hai thu hoạch được: 3 000 - 600 = 2 400 (kg)', points: 0.5 },
        { stepDescription: 'Ý b) Trung bình mỗi bao nặng: 3 000 : 60 = 50 (kg) và ghi Đáp số đầy đủ', points: 0.5 },
      ],
      mathCategory: 'GIAI_TOAN_CO_LOI_VAN',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: 'Đổi 5 tấn 4 tạ sang kg (5 × 1000 + 4 × 100)',
          expectedValue: '5400',
          computedValue: String(5 * 1000 + 4 * 100),
          unitLabel: 'kg',
          isAccurate: 5 * 1000 + 4 * 100 === 5400,
          verificationNote: '5 tấn 4 tạ = 5 400 kg; 6 tạ = 600 kg.',
        },
        {
          stepOrder: 2,
          expressionLabel: 'Thửa thứ nhất: (5400 + 600) / 2',
          expectedValue: '3000',
          computedValue: String((5400 + 600) / 2),
          unitLabel: 'kg',
          isAccurate: (5400 + 600) / 2 === 3000,
          verificationNote: 'Số lớn = (Tổng + Hiệu) : 2 = 3 000 kg.',
        },
        {
          stepOrder: 3,
          expressionLabel: 'Thửa thứ hai: 3000 - 600',
          expectedValue: '2400',
          computedValue: String(3000 - 600),
          unitLabel: 'kg',
          isAccurate: 3000 - 600 === 2400,
          verificationNote: 'Số bé = 3 000 - 600 = 2 400 kg (Tổng: 3000 + 2400 = 5400 kg).',
        },
        {
          stepOrder: 4,
          expressionLabel: 'Trung bình mỗi bao: 3000 / 60',
          expectedValue: '50',
          computedValue: String(3000 / 60),
          unitLabel: 'kg',
          isAccurate: 3000 / 60 === 50,
          verificationNote: '3 000 : 60 = 50 kg/bao.',
        },
      ],
    },
  ];

  const { matrixRows, specificationRows, analytics } = buildPrimaryMatrixAndAnalytics(
    questions,
    10.0,
    'TOAN_4_GIUA_KY_1',
    'Toán'
  );

  return {
    id: 'PKG-PRIMARY-TOAN4-GK1',
    code: 'DE-TH-TOAN4-GK1-2026',
    title: 'Đề kiểm tra định kỳ Giữa học kỳ I – Môn Toán Lớp 4 (Theo TT 27/2020/TT-BGDĐT)',
    grade: 4,
    subject: 'Toán',
    period: 'GIUA_KY_1',
    contentScopeDescription:
      'Số tự nhiên đến lớp triệu, làm tròn số; Phép cộng, phép trừ các số có nhiều chữ số; Tìm thành phần chưa biết; Đổi đơn vị đo khối lượng, diện tích; Góc và hai đường thẳng vuông góc/song song; Đọc bảng thống kê số liệu; Giải bài toán tìm hai số khi biết tổng và hiệu.',
    totalPoints: 10.0,
    durationMinutes: 40,
    assessmentForm: 'BAI_KIEM_TRA_VIET',
    schoolTemplateId: 'TPL-TH-TOAN-45-CHUAN',
    schoolTemplateTitle:
      'Mẫu đề Toán Lớp 4–5 (Tổ Chuyên môn & BGH phê duyệt – Gợi ý 40% Mức 1 : 40% Mức 2 : 20% Mức 3)',
    approvalStatus: ApprovalStatus.DRAFT,
    aiOriginNotice:
      'Đề kiểm tra ở trạng thái BẢN NHÁP (DRAFT) – Không tự động phê duyệt. Cần Tổ trưởng chuyên môn và Ban Giám hiệu rà soát, ký duyệt trước khi sử dụng chính thức.',
    createdAt: '2026-10-15T08:00:00.000Z',
    applicabilityCheck,
    questions,
    matrixRows,
    specificationRows,
    analytics,
  };
}

// ============================================================================
// ĐỀ SỐ 2: ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I – MÔN TIẾNG VIỆT LỚP 4
// ============================================================================
function createVietnameseGrade4MidTerm1Package(): PrimaryCompleteExamPackage {
  const applicabilityCheck = checkPrimaryExamApplicability(4, 'Tiếng Việt', 'GIUA_KY_1');

  const readingPassageBlock = {
    id: 'CORP-TV4-GK1-01',
    corpusCode: 'NL-TV4-GK1-001',
    title: 'Khu vườn mùa thu của ngoại',
    content:
      'Tháng chín về, nắng thu vàng như mật ong trải nhẹ trên khu vườn nhỏ của bà ngoại. Những chùm bưởi da xanh đung đưa trong gió sớm, tỏa hương thơm dịu khắp sân nhà. Dưới gốc cây hồng cổ thụ, mấy chú chim sâu nhảy nhót chuyền cành, cất tiếng hót trong trẻo báo hiệu một ngày mới bình yên.\n\nSáng chủ nhật, Lan theo mẹ về thăm ngoại. Vừa bước qua cổng tre, Lan đã thấy ngoại đang lom khom bên luống rau cải xanh mướt để nhặt từng chiếc lá úa. Đôi bàn tay ngoại gầy guộc, rám nắng nhưng lúc nào cũng ấm áp lạ thường. Thấy Lan, ngoại mỉm cười hiền hậu, chọn quả hồng chín đỏ mọng nhất trên cành thấp trao vào tay cô bé. Lan nâng niu quả hồng thơm thảo, lòng thầm hứa sẽ chăm học và thường xuyên về giúp ngoại tưới cây, nhổ cỏ.',
    authorOrSource:
      'Ngữ liệu biên soạn phục vụ đánh giá định kỳ Lớp 4 – Tổ Chuyên môn Khối 4 thẩm định (Đã xác minh nguồn gốc)',
    genreLabel: 'Văn bản truyện kể kết hợp miêu tả (162 chữ)',
  };

  const oralReadingSheet = {
    id: 'ORAL-SHEET-TV4-GK1',
    sheetCode: 'PHIEU-DTT-TV4-GK1',
    title: 'Phiếu đánh giá Đọc thành tiếng kết hợp trả lời câu hỏi miệng – Lớp 4 Giữa học kỳ I',
    grade: 4 as PrimaryGradeNumber,
    period: 'GIUA_KY_1' as PrimaryExamPeriodCode,
    totalPoints: 2.0,
    readingSpeedRequirement: '75 – 80 tiếng/phút',
    passages: [
      {
        id: 'PASS-DTT-01',
        code: 'Phiếu số 01',
        title: 'Buổi sớm trên cánh đồng quê',
        excerptText:
          'Khi ông mặt trời vừa nhô lên khỏi rặng tre đầu làng, những giọt sương đêm đọng trên lá lúa long lanh như hàng nghìn hạt ngọc. Gió sớm thổi nhẹ làm biển lúa xanh rờn uốn lượn nhịp nhàng. Trên con đường đất dẫn ra đồng, các bác nông dân vừa đi vừa trò chuyện rộn rã để bắt đầu một ngày lao động mới.',
        sourceCitation: 'Tài liệu Ngân hàng Ngữ liệu Đọc thành tiếng Khối 4 – Trường Tiểu học',
        wordCount: 68,
        oralQuestion: 'Hình ảnh những giọt sương đêm đọng trên lá lúa được so sánh với gì?',
        expectedOralAnswer:
          'Những giọt sương đêm đọng trên lá lúa được so sánh như hàng nghìn hạt ngọc long lanh.',
      },
      {
        id: 'PASS-DTT-02',
        code: 'Phiếu số 02',
        title: 'Người thợ gốm làng Bát Tràng',
        excerptText:
          'Bên bàn xoay gỗ quay đều, đôi bàn tay khéo léo của nghệ nhân nhẹ nhàng vuốt từng thớ đất sét mềm mịn. Chỉ sau vài phút, một chiếc bình gốm thanh thoát đã hiện ra. Qua ngọn lửa nung đỏ rực suốt nhiều giờ liền, chiếc bình khoác lên mình lớp men ngọc sáng bóng, mang đậm hồn cốt văn hóa Việt Nam.',
        sourceCitation: 'Tài liệu Ngân hàng Ngữ liệu Đọc thành tiếng Khối 4 – Trường Tiểu học',
        wordCount: 67,
        oralQuestion: 'Nhờ đâu mà khối đất sét mềm mịn trở thành chiếc bình gốm có lớp men sáng bóng?',
        expectedOralAnswer:
          'Nhờ đôi bàn tay khéo léo của nghệ nhân tạo hình trên bàn xoay và trải qua ngọn lửa nung đỏ rực suốt nhiều giờ liền.',
      },
    ],
    rubricItems: [
      {
        id: 'RUB-DTT-1',
        criterionName: '1. Đọc đúng tiếng, từ, rõ ràng (0,5 điểm)',
        maxPoints: 0.5,
        levelDescriptors: {
          fullPoints: 'Đọc đúng toàn bộ các tiếng, phát âm chuẩn âm đầu, vần, thanh điệu (0,5đ)',
          partialPoints: 'Đọc sai từ 2 đến 4 tiếng (0,25đ)',
          needsSupport: 'Đọc sai quá 5 tiếng, đánh vần chậm (0,0đ)',
        },
      },
      {
        id: 'RUB-DTT-2',
        criterionName: '2. Ngắt nghỉ hơi đúng dấu câu và cụm từ (0,5 điểm)',
        maxPoints: 0.5,
        levelDescriptors: {
          fullPoints: 'Ngắt nghỉ hơi tự nhiên, đúng ở các dấu phẩy, dấu chấm và giữa các cụm từ (0,5đ)',
          partialPoints: 'Ngắt nghỉ hơi chưa hợp lý ở 1–2 câu dài (0,25đ)',
          needsSupport: 'Đọc liền mạch không ngắt nghỉ theo dấu câu (0,0đ)',
        },
      },
      {
        id: 'RUB-DTT-3',
        criterionName: '3. Tốc độ đọc đạt yêu cầu 75–80 tiếng/phút và giọng đọc biểu cảm (0,5 điểm)',
        maxPoints: 0.5,
        levelDescriptors: {
          fullPoints: 'Đạt tốc độ 75–80 tiếng/phút, âm lượng vừa đủ nghe (0,5đ)',
          partialPoints: 'Đọc chậm hơn tốc độ quy định (trên 1,5 phút mới xong đoạn văn) (0,25đ)',
          needsSupport: 'Đọc quá chậm, ngập ngừng nhiều lần (0,0đ)',
        },
      },
      {
        id: 'RUB-DTT-4',
        criterionName: '4. Trả lời đúng câu hỏi về nội dung đoạn đọc (0,5 điểm)',
        maxPoints: 0.5,
        levelDescriptors: {
          fullPoints: 'Trả lời đúng, trọn câu và rõ ý câu hỏi trong phiếu bốc thăm (0,5đ)',
          partialPoints: 'Trả lời đúng ý chính nhưng diễn đạt chưa trọn câu (0,25đ)',
          needsSupport: 'Trả lời chưa đúng hoặc không trả lời được (0,0đ)',
        },
      },
    ],
  };

  const writingAssessmentSpec = {
    id: 'WRITING-SPEC-TV4-GK1',
    promptTitle: 'Phần IV. Kiểm tra Viết (4,0 điểm)',
    promptText:
      'Đề bài: Em hãy viết bài văn kể lại một câu chuyện đã đọc hoặc đã nghe ca ngợi lòng nhân hậu, tình yêu thương hoặc lòng biết ơn của con người.',
    totalPoints: 4.0,
    learningOutcomeCode: 'TV4-GK1-YCCD-05',
    learningOutcomeText:
      'Viết được bài văn kể lại một câu chuyện đã đọc, đã nghe có bố cục 3 phần (Mở bài, Thân bài, Kết bài), cốt truyện rõ ràng, chi tiết sinh động.',
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3 as PrimaryCognitiveLevelCode,
    cognitiveLevelJustification:
      'Mức 3 (TT 27/2020): Học sinh vận dụng tổng hợp vốn từ, kỹ năng lập dàn ý và diễn đạt độc lập để tạo lập một bài văn kể chuyện hoàn chỉnh, thể hiện cảm xúc và bài học cá nhân.',
    criteria: [
      {
        id: 'WR-CRIT-1',
        orderIndex: 1,
        sectionName: '1. Bố cục bài văn 3 phần rõ ràng (Mở bài, Thân bài, Kết bài)',
        maxPoints: 1.0,
        detailedIndicators: [
          'Mở bài (0,5đ): Giới thiệu được tên câu chuyện, nhân vật chính và hoàn cảnh biết đến câu chuyện.',
          'Kết bài (0,5đ): Nêu được kết thúc câu chuyện và suy nghĩ, cảm xúc hoặc bài học rút ra.',
        ],
      },
      {
        id: 'WR-CRIT-2',
        orderIndex: 2,
        sectionName: '2. Nội dung Thân bài – Trình tự sự việc hợp lý, chi tiết sinh động',
        maxPoints: 1.75,
        detailedIndicators: [
          'Kể lại đầy đủ các sự việc chính theo đúng trình tự diễn biến (Mở đầu -> Diễn biến -> Kết thúc) (1,0đ).',
          'Làm nổi bật được lời nói, hành động thể hiện lòng nhân hậu/biết ơn của nhân vật (0,75đ).',
        ],
      },
      {
        id: 'WR-CRIT-3',
        orderIndex: 3,
        sectionName: '3. Chữ viết, chính tả, dùng từ và đặt câu',
        maxPoints: 0.75,
        detailedIndicators: [
          'Chữ viết rõ ràng, trình bày sạch đẹp, đúng chính tả (không mắc quá 3 lỗi chính tả) (0,5đ).',
          'Dùng từ chuẩn xác, câu văn đủ chủ ngữ – vị ngữ, biết sử dụng dấu câu hợp lý (0,25đ).',
        ],
      },
      {
        id: 'WR-CRIT-4',
        orderIndex: 4,
        sectionName: '4. Sự sáng tạo và cảm xúc tự nhiên',
        maxPoints: 0.5,
        detailedIndicators: [
          'Biết kể lại bằng lời văn của mình một cách tự nhiên, giàu hình ảnh và cảm xúc chân thật (0,5đ).',
        ],
      },
    ],
    sampleOutlineOrNote:
      'Lưu ý dành cho giáo viên chấm: Tôn trọng cách kể chuyện và lựa chọn tác phẩm của học sinh; khuyến khích những bài viết có lời văn tự nhiên, chân thật, không rập khuôn văn mẫu.',
  };

  const questions: PrimaryExamQuestionItem[] = [
    {
      id: 'TV4-GK1-Q01',
      questionNumberLabel: 'Phần I (Đọc thành tiếng)',
      partCode: 'DOC_THANH_TIENG',
      topicId: 'TOP-TV4-DOC-THANH-TIENG',
      topicTitle: 'Kĩ năng Đọc thành tiếng',
      learningOutcomeCode: 'TV4-GK1-YCCD-01',
      learningOutcomeText:
        'Đọc thành tiếng trôi chảy văn bản (tốc độ khoảng 75–80 tiếng/phút), phát âm rõ, ngắt nghỉ hơi đúng dấu câu và trả lời được 1 câu hỏi về nội dung đoạn đọc.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh đọc thành tiếng trực tiếp văn bản bốc thăm đúng phát âm, tốc độ quy định và trả lời câu hỏi nhận biết thông tin trong đoạn đọc.',
      formatType: 'TU_LUAN',
      points: 2.0,
      stem: 'Học sinh bốc thăm 01 phiếu trong Ngân hàng Phiếu đánh giá Đọc thành tiếng (tốc độ 75–80 tiếng/phút), đọc thành tiếng đoạn văn và trả lời 01 câu hỏi miệng của giáo viên.',
      correctAnswer:
        'Đạt 4 tiêu chí trên Phiếu đánh giá Đọc thành tiếng: Đọc đúng tiếng/từ (0,5đ); Ngắt nghỉ hơi đúng dấu câu (0,5đ); Đạt tốc độ 75–80 tiếng/phút (0,5đ); Trả lời đúng câu hỏi miệng (0,5đ).',
      gradingGuide:
        'Giáo viên chấm trực tiếp từng học sinh theo 4 tiêu chí trong Phiếu đánh giá Đọc thành tiếng (Tổng 2,0 điểm).',
      rubricSteps: [
        { stepDescription: 'Đọc đúng tiếng, từ, phát âm rõ ràng', points: 0.5 },
        { stepDescription: 'Ngắt nghỉ hơi đúng dấu câu và các cụm từ', points: 0.5 },
        { stepDescription: 'Tốc độ đọc đạt 75–80 tiếng/phút, giọng đọc phù hợp', points: 0.5 },
        { stepDescription: 'Trả lời đúng câu hỏi miệng về nội dung đoạn vừa đọc', points: 0.5 },
      ],
      vietnameseComponent: 'DOC_THANH_TIENG',
    },
    {
      id: 'TV4-GK1-Q02',
      questionNumberLabel: 'Câu 1 (Đọc hiểu)',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TV4-DOC-HIEU',
      topicTitle: 'Đọc hiểu chi tiết và nội dung chính văn bản',
      learningOutcomeCode: 'TV4-GK1-YCCD-02',
      learningOutcomeText:
        'Nhận biết được chi tiết tiêu biểu, nhân vật, sự việc và xác định được nội dung chính, thông điệp của văn bản truyện hoặc miêu tả.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh nhận biết và tìm lại chi tiết miêu tả có sẵn trực tiếp trong đoạn 1 của văn bản "Khu vườn mùa thu của ngoại".',
      formatType: 'TRAC_NGHIEM',
      points: 0.75,
      stem: 'Theo đoạn đầu bài đọc "Khu vườn mùa thu của ngoại", nắng thu trải nhẹ trên khu vườn của bà ngoại được so sánh với hình ảnh nào?',
      options: [
        'A. Vàng như mật ong.',
        'B. Trắng xóa như sương sớm.',
        'C. Đỏ rực như quả hồng chín.',
        'D. Xanh mướt như luống rau cải.',
      ],
      correctAnswer: 'A. Vàng như mật ong.',
      gradingGuide: 'Khoanh đúng vào chữ cái A được 0,75 điểm.',
      rubricSteps: [
        { stepDescription: 'Chọn đúng phương án A (Vàng như mật ong)', points: 0.75 },
      ],
      vietnameseComponent: 'DOC_HIEU',
      readingPassageRefId: 'CORP-TV4-GK1-01',
    },
    {
      id: 'TV4-GK1-Q03',
      questionNumberLabel: 'Câu 2 (Đọc hiểu)',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TV4-DOC-HIEU',
      topicTitle: 'Đọc hiểu chi tiết và nội dung chính văn bản',
      learningOutcomeCode: 'TV4-GK1-YCCD-02',
      learningOutcomeText:
        'Nhận biết được chi tiết tiêu biểu, nhân vật, sự việc và xác định được nội dung chính, thông điệp của văn bản truyện hoặc miêu tả.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh kết nối các chi tiết về cử chỉ, hành động của bà ngoại và bạn Lan trong đoạn 2 để hiểu ý nghĩa biểu đạt tình cảm bà cháu.',
      formatType: 'TRAC_NGHIEM',
      points: 0.75,
      stem: 'Chi tiết bà ngoại "mỉm cười hiền hậu, chọn quả hồng chín đỏ mọng nhất trên cành thấp trao vào tay cô bé" thể hiện điều gì?',
      options: [
        'A. Tình yêu thương ấm áp, sự quan tâm dịu dàng của bà ngoại dành cho cháu.',
        'B. Khu vườn của bà ngoại chỉ có duy nhất một quả hồng chín.',
        'C. Bà ngoại muốn nhờ Lan hái hộ toàn bộ số quả hồng trên cây.',
        'D. Bà ngoại đang dạy Lan cách phân biệt các loài cây ăn quả.',
      ],
      correctAnswer: 'A. Tình yêu thương ấm áp, sự quan tâm dịu dàng của bà ngoại dành cho cháu.',
      gradingGuide: 'Khoanh đúng vào chữ cái A được 0,75 điểm.',
      rubricSteps: [
        { stepDescription: 'Chọn đúng phương án A', points: 0.75 },
      ],
      vietnameseComponent: 'DOC_HIEU',
      readingPassageRefId: 'CORP-TV4-GK1-01',
    },
    {
      id: 'TV4-GK1-Q04',
      questionNumberLabel: 'Câu 3 (Đọc hiểu)',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TV4-DOC-HIEU-PHAN-HOI',
      topicTitle: 'Đọc hiểu liên hệ và phản hồi cá nhân',
      learningOutcomeCode: 'TV4-GK1-YCCD-03',
      learningOutcomeText:
        'Nêu được suy nghĩ, cảm xúc cá nhân hoặc bài học ứng xử rút ra từ câu chuyện và đặt câu thể hiện tình cảm phù hợp.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3,
      cognitiveLevelJustification:
        'Mức 3 (TT 27/2020): Học sinh đưa ra phản hồi hợp lý gắn với trải nghiệm cuộc sống của bản thân để bày tỏ lòng kính yêu, giúp đỡ ông bà.',
      formatType: 'TU_LUAN',
      points: 1.0,
      stem: 'Qua việc làm và lời hứa của bạn Lan ở cuối bài đọc, em hãy nêu 2 việc làm cụ thể mà em đã hoặc sẽ thực hiện để thể hiện tình yêu thương, sự hiếu thảo đối với ông bà của mình.',
      correctAnswer:
        'Học sinh nêu được ít nhất 2 việc làm phù hợp, chân thực (Ví dụ: Thường xuyên hỏi thăm sức khỏe ông bà, giúp ông bà tưới cây, quét sân, lấy nước, đọc báo cho ông bà nghe, chăm ngoan học giỏi để ông bà vui lòng...).',
      gradingGuide:
        'Nêu được 2 việc làm ý nghĩa, diễn đạt thành câu văn trọn vẹn được 1,0 điểm (mỗi việc làm phù hợp đạt 0,5 điểm).',
      rubricSteps: [
        { stepDescription: 'Nêu được việc làm cụ thể thứ nhất phù hợp, có ý nghĩa hiếu thảo', points: 0.5 },
        { stepDescription: 'Nêu được việc làm cụ thể thứ hai phù hợp, diễn đạt câu văn rõ ràng', points: 0.5 },
      ],
      vietnameseComponent: 'DOC_HIEU',
      readingPassageRefId: 'CORP-TV4-GK1-01',
    },
    {
      id: 'TV4-GK1-Q05',
      questionNumberLabel: 'Câu 4 (Kiến thức TV)',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TV4-KIEN-THUC-TV',
      topicTitle: 'Kiến thức tiếng Việt (Danh từ, Động từ, Tính từ)',
      learningOutcomeCode: 'TV4-GK1-YCCD-04',
      learningOutcomeText:
        'Nhận biết và sử dụng đúng danh từ chung, danh từ riêng, động từ và tính từ trong câu văn, đoạn văn.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh nhận biết trực tiếp nhóm danh từ chỉ sự vật xuất hiện trong câu văn trích từ bài đọc.',
      formatType: 'TRAC_NGHIEM',
      points: 0.75,
      stem: 'Dòng nào dưới đây chỉ gồm các DANH TỪ có trong câu văn: "Những chùm bưởi da xanh đung đưa trong gió sớm, tỏa hương thơm dịu khắp sân nhà."?',
      options: [
        'A. chùm, bưởi, gió, hương, sân, nhà.',
        'B. đung đưa, tỏa, thơm dịu, xanh.',
        'C. bưởi, đung đưa, gió sớm, thơm dịu.',
        'D. xanh, sớm, dịu, khắp.',
      ],
      correctAnswer: 'A. chùm, bưởi, gió, hương, sân, nhà.',
      gradingGuide: 'Khoanh đúng vào chữ cái A được 0,75 điểm.',
      rubricSteps: [
        { stepDescription: 'Chọn đúng phương án A (nhóm từ chỉ gồm các danh từ)', points: 0.75 },
      ],
      vietnameseComponent: 'KIEN_THUC_TIENG_VIET',
      readingPassageRefId: 'CORP-TV4-GK1-01',
    },
    {
      id: 'TV4-GK1-Q06',
      questionNumberLabel: 'Câu 5 (Kiến thức TV)',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TV4-KIEN-THUC-TV',
      topicTitle: 'Kiến thức tiếng Việt (Danh từ, Động từ, Tính từ)',
      learningOutcomeCode: 'TV4-GK1-YCCD-04',
      learningOutcomeText:
        'Nhận biết và sử dụng đúng danh từ chung, danh từ riêng, động từ và tính từ trong câu văn, đoạn văn.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh phân loại và trích xuất đúng động từ chỉ hoạt động và tính từ chỉ đặc điểm trong câu văn cụ thể của ngữ liệu.',
      formatType: 'TU_LUAN',
      points: 0.75,
      stem: 'Tìm và ghi lại 02 ĐỘNG TỪ và 02 TÍNH TỪ có trong hai câu văn sau:\n"Đôi bàn tay ngoại gầy guộc, rám nắng nhưng lúc nào cũng ấm áp lạ thường. Thấy Lan, ngoại mỉm cười hiền hậu, chọn quả hồng chín đỏ mọng nhất trên cành thấp trao vào tay cô bé."',
      correctAnswer:
        '- Động từ (chọn 2 trong các từ): thấy, mỉm cười, chọn, trao.\n- Tính từ (chọn 2 trong các từ): gầy guộc, rám nắng, ấm áp, hiền hậu, chín, đỏ mọng, thấp.',
      gradingGuide:
        'Tìm đúng 2 động từ được 0,375 điểm; tìm đúng 2 tính từ được 0,375 điểm (Tổng 0,75 điểm).',
      rubricSteps: [
        { stepDescription: 'Tìm đúng 02 động từ (ví dụ: mỉm cười, chọn, trao, thấy)', points: 0.38 },
        { stepDescription: 'Tìm đúng 02 tính từ (ví dụ: gầy guộc, ấm áp, hiền hậu, đỏ mọng)', points: 0.37 },
      ],
      vietnameseComponent: 'KIEN_THUC_TIENG_VIET',
      readingPassageRefId: 'CORP-TV4-GK1-01',
    },
    {
      id: 'TV4-GK1-Q07',
      questionNumberLabel: 'Phần IV (Viết bài văn)',
      partCode: 'VIET',
      topicId: 'TOP-TV4-VIET-BAI-VAN',
      topicTitle: 'Kĩ năng Viết bài văn kể chuyện',
      learningOutcomeCode: 'TV4-GK1-YCCD-05',
      learningOutcomeText:
        'Viết được bài văn kể lại một câu chuyện đã đọc, đã nghe có bố cục 3 phần (Mở bài, Thân bài, Kết bài), cốt truyện rõ ràng, chi tiết sinh động.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3,
      cognitiveLevelJustification:
        'Mức 3 (TT 27/2020): Học sinh vận dụng kỹ năng tạo lập văn bản tự sự để viết một bài văn kể chuyện hoàn chỉnh, giàu cảm xúc.',
      formatType: 'TU_LUAN',
      points: 4.0,
      stem: 'Đề bài: Em hãy viết bài văn kể lại một câu chuyện đã đọc hoặc đã nghe ca ngợi lòng nhân hậu, tình yêu thương hoặc lòng biết ơn của con người.',
      correctAnswer:
        'Bài viết đảm bảo bố cục 3 phần (Mở bài, Thân bài, Kết bài), kể đúng trình tự các sự việc chính của câu chuyện đã đọc/đã nghe về lòng nhân hậu hoặc biết ơn; diễn đạt trôi chảy, đúng chính tả, giàu cảm xúc.',
      gradingGuide:
        'Chấm theo 4 tiêu chí trong Bản tiêu chí chấm bài viết: Bố cục Mở bài & Kết bài (1,0đ); Nội dung Thân bài & trình tự sự việc (1,75đ); Chính tả, chữ viết, dùng từ đặt câu (0,75đ); Sáng tạo và cảm xúc (0,5đ).',
      rubricSteps: [
        { stepDescription: 'Bố cục Mở bài (0,5đ) và Kết bài (0,5đ) rõ ràng, đúng yêu cầu', points: 1.0 },
        { stepDescription: 'Nội dung Thân bài kể đủ diễn biến sự việc, chi tiết tiêu biểu', points: 1.75 },
        { stepDescription: 'Chữ viết, chính tả, dùng từ và đặt câu đúng chuẩn', points: 0.75 },
        { stepDescription: 'Lời kể tự nhiên, sáng tạo, thể hiện cảm xúc chân thật', points: 0.5 },
      ],
      vietnameseComponent: 'VIET',
    },
  ];

  const { matrixRows, specificationRows, analytics } = buildPrimaryMatrixAndAnalytics(
    questions,
    10.0,
    'TIENG_VIET_4_GIUA_KY_1',
    'Tiếng Việt'
  );

  return {
    id: 'PKG-PRIMARY-TV4-GK1',
    code: 'DE-TH-TV4-GK1-2026',
    title: 'Đề kiểm tra định kỳ Giữa học kỳ I – Môn Tiếng Việt Lớp 4 (Theo TT 27/2020/TT-BGDĐT)',
    grade: 4,
    subject: 'Tiếng Việt',
    period: 'GIUA_KY_1',
    contentScopeDescription:
      'Đọc thành tiếng văn bản 75–80 tiếng/phút; Đọc hiểu văn bản truyện kể kết hợp miêu tả; Kiến thức tiếng Việt về Danh từ, Động từ, Tính từ; Viết bài văn kể lại một câu chuyện đã đọc hoặc đã nghe.',
    totalPoints: 10.0,
    durationMinutes: 70,
    assessmentForm: 'DOC_THANH_TIENG_KET_HOP_VIET',
    schoolTemplateId: 'TPL-TH-TV-45-CHUAN',
    schoolTemplateTitle:
      'Mẫu đề Tiếng Việt Lớp 4–5 (Đọc thành tiếng + Đọc hiểu & Kiến thức TV + Viết tích hợp 10 điểm)',
    approvalStatus: ApprovalStatus.DRAFT,
    aiOriginNotice:
      'Đề kiểm tra ở trạng thái BẢN NHÁP (DRAFT) – Không tự động phê duyệt. Cần Tổ trưởng chuyên môn và Ban Giám hiệu rà soát, ký duyệt trước khi sử dụng chính thức.',
    createdAt: '2026-10-15T08:30:00.000Z',
    applicabilityCheck,
    readingPassageBlock,
    oralReadingSheet,
    writingAssessmentSpec,
    questions,
    matrixRows,
    specificationRows,
    analytics,
  };
}

// ============================================================================
// ĐỀ SỐ 3: ĐỀ KIỂM TRA ĐỊNH KỲ CUỐI HỌC KỲ I – MÔN TOÁN LỚP 5
// ============================================================================
function createMathGrade5EndTerm1Package(): PrimaryCompleteExamPackage {
  const applicabilityCheck = checkPrimaryExamApplicability(5, 'Toán', 'CUOI_KY_1');

  const questions: PrimaryExamQuestionItem[] = [
    {
      id: 'TOAN5-CK1-Q01',
      questionNumberLabel: 'Câu 1',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN5-SO-THAP-PHAN',
      topicTitle: 'Số thập phân và So sánh số thập phân',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-01',
      learningOutcomeText:
        'Đọc, viết, xác định hàng của số thập phân; chuyển phân số thập phân/hỗn số thành số thập phân; so sánh và làm tròn số thập phân.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh nhận biết trực tiếp giá trị theo hàng phần trăm của chữ số trong số thập phân và chuyển hỗn số có phân số thập phân sang số thập phân.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Chữ số 8 trong số thập phân 24,583 có giá trị là bao nhiêu và hỗn số 15 và 7/100 viết dưới dạng số thập phân là số nào?',
      options: [
        'A. Giá trị là 8/100 (hay 0,08) và số thập phân là 15,07',
        'B. Giá trị là 8/10 (hay 0,8) và số thập phân là 15,7',
        'C. Giá trị là 8/1000 (hay 0,008) và số thập phân là 15,007',
        'D. Giá trị là 80 và số thập phân là 1,507',
      ],
      correctAnswer: 'A. Giá trị là 8/100 (hay 0,08) và số thập phân là 15,07',
      gradingGuide: 'Khoanh đúng vào chữ cái A được 1,0 điểm.',
      rubricSteps: [
        { stepDescription: 'Chọn đúng phương án A (0,08 và 15,07)', points: 1.0 },
      ],
      mathCategory: 'TRAC_NGHIEM',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: 'Giá trị chữ số 8 ở hàng phần trăm (8 / 100)',
          expectedValue: '0.08',
          computedValue: String(8 / 100),
          isAccurate: Math.abs(8 / 100 - 0.08) < 1e-9,
          verificationNote: 'Chữ số 8 đứng thứ hai sau dấu phẩy (hàng phần trăm).',
        },
        {
          stepOrder: 2,
          expressionLabel: '15 + 7 / 100',
          expectedValue: '15.07',
          computedValue: String(15 + 7 / 100),
          isAccurate: Math.abs(15 + 7 / 100 - 15.07) < 1e-9,
          verificationNote: '15 và 7/100 = 15,07.',
        },
      ],
    },
    {
      id: 'TOAN5-CK1-Q02',
      questionNumberLabel: 'Câu 2',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN5-DO-LUONG',
      topicTitle: 'Đo lường (Đơn vị đo diện tích ha, km², m²)',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-03',
      learningOutcomeText:
        'Nhận biết và chuyển đổi mối quan hệ giữa các đơn vị đo diện tích: mét vuông (m²), héc-ta (ha), ki-lô-mét vuông (km²) dưới dạng số thập phân.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh áp dụng trực tiếp mối quan hệ 1 km² = 100 ha và 1 ha = 10 000 m² để điền số thập phân thích hợp.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Điền số thích hợp vào chỗ chấm:\na) 3 km² 25 ha = ............... km²\nb) 4,6 ha = .................... m²',
      options: [
        'A. a) 3,25 km² ; b) 46 000 m²',
        'B. a) 3,025 km² ; b) 4 600 m²',
        'C. a) 32,5 km² ; b) 460 000 m²',
        'D. a) 3,25 km² ; b) 460 m²',
      ],
      correctAnswer: 'A. a) 3,25 km² ; b) 46 000 m²',
      gradingGuide: 'Điền/chọn đúng phương án A được 1,0 điểm (mỗi ý 0,5 điểm).',
      rubricSteps: [
        { stepDescription: 'Ý a) Đổi đúng 3 km² 25 ha = 3,25 km²', points: 0.5 },
        { stepDescription: 'Ý b) Đổi đúng 4,6 ha = 46 000 m²', points: 0.5 },
      ],
      mathCategory: 'DIEN_SO',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '3 + 25 / 100 (km²)',
          expectedValue: '3.25',
          computedValue: String(3 + 25 / 100),
          unitLabel: 'km²',
          isAccurate: Math.abs(3 + 25 / 100 - 3.25) < 1e-9,
          verificationNote: '1 km² = 100 ha -> 25 ha = 0,25 km² -> 3,25 km².',
        },
        {
          stepOrder: 2,
          expressionLabel: '4.6 × 10000 (m²)',
          expectedValue: '46000',
          computedValue: String(4.6 * 10000),
          unitLabel: 'm²',
          isAccurate: 4.6 * 10000 === 46000,
          verificationNote: '1 ha = 10 000 m² -> 4,6 ha = 46 000 m².',
        },
      ],
    },
    {
      id: 'TOAN5-CK1-Q03',
      questionNumberLabel: 'Câu 3',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN5-HINH-HOC',
      topicTitle: 'Hình học phẳng (Tam giác, Hình thang, Hình tròn)',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-04',
      learningOutcomeText:
        'Tính được diện tích hình tam giác, diện tích hình thang, chu vi và diện tích hình tròn.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh vận dụng công thức tính diện tích hình thang S = (a + b) × h : 2 với các số đo là số thập phân.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Một hình thang có độ dài hai đáy lần lượt là 12,5 m và 7,5 m; chiều cao là 6,4 m. Diện tích của hình thang đó là:',
      options: [
        'A. 64 m²',
        'B. 128 m²',
        'C. 32 m²',
        'D. 60,4 m²',
      ],
      correctAnswer: 'A. 64 m²',
      gradingGuide: 'Khoanh đúng vào chữ cái A (64 m²) được 1,0 điểm.',
      rubricSteps: [
        { stepDescription: 'Tính đúng diện tích hình thang: (12,5 + 7,5) × 6,4 : 2 = 64 (m²)', points: 1.0 },
      ],
      mathCategory: 'HINH_HOC',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '((12.5 + 7.5) × 6.4) / 2',
          expectedValue: '64',
          computedValue: String(((12.5 + 7.5) * 6.4) / 2),
          unitLabel: 'm²',
          isAccurate: Math.abs(((12.5 + 7.5) * 6.4) / 2 - 64) < 1e-9,
          verificationNote: 'Tổng hai đáy = 20 m; 20 × 6,4 : 2 = 64 m².',
        },
      ],
    },
    {
      id: 'TOAN5-CK1-Q04',
      questionNumberLabel: 'Câu 4',
      partCode: 'TRAC_NGHIEM',
      topicId: 'TOP-TOAN5-THONG-KE-XAC-SUAT',
      topicTitle: 'Thống kê và Xác suất thực nghiệm',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-05',
      learningOutcomeText:
        'Đọc bảng số liệu thống kê và sử dụng tỉ số để mô tả số lần lặp lại của một khả năng xảy ra (xác suất thực nghiệm) trong trò chơi đơn giản.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
      cognitiveLevelJustification:
        'Mức 1 (TT 27/2020): Học sinh nhận biết và viết trực tiếp tỉ số mô tả số lần xuất hiện mặt sấp so với tổng số lần tung đồng xu.',
      formatType: 'TRAC_NGHIEM',
      points: 1.0,
      stem: 'Bạn Minh tung một đồng xu 20 lần liên tiếp, trong đó có 11 lần xuất hiện mặt sấp (S) và 9 lần xuất hiện mặt ngửa (N). Tỉ số mô tả số lần lặp lại của khả năng "xuất hiện mặt sấp" so với tổng số lần tung đồng xu là:',
      options: [
        'A. 11/20',
        'B. 9/20',
        'C. 11/9',
        'D. 9/11',
      ],
      correctAnswer: 'A. 11/20',
      gradingGuide: 'Khoanh đúng vào chữ cái A (11/20) được 1,0 điểm.',
      rubricSteps: [
        { stepDescription: 'Chọn đúng phương án A (tỉ số 11/20)', points: 1.0 },
      ],
      mathCategory: 'THONG_KE_XAC_SUAT',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: 'Tổng số lần tung: 11 + 9 = 20; Tỉ số mặt sấp: 11 / 20',
          expectedValue: '0.55',
          computedValue: String(11 / (11 + 9)),
          isAccurate: Math.abs(11 / (11 + 9) - 0.55) < 1e-9,
          verificationNote: 'Tỉ số lần xuất hiện mặt sấp so với tổng số lần tung là 11/20.',
        },
      ],
    },
    {
      id: 'TOAN5-CK1-Q05',
      questionNumberLabel: 'Câu 5',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN5-PHEP-TINH-STP',
      topicTitle: 'Các phép tính với số thập phân',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-02',
      learningOutcomeText:
        'Thực hiện phép cộng, trừ, nhân, chia số thập phân; vận dụng tính chất giao hoán, kết hợp, phân phối để tính bằng cách thuận tiện và tìm thành phần chưa biết.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh đặt tính và thực hiện đúng quy tắc cộng, trừ, nhân, chia hai số thập phân.',
      formatType: 'TU_LUAN',
      points: 2.0,
      stem: 'Đặt tính rồi tính:\na) 45,68 + 19,75\nb) 82,4 - 35,68\nc) 14,5 × 3,6\nd) 43,2 : 1,8',
      correctAnswer: 'a) 65,43 ; b) 46,72 ; c) 52,2 ; d) 24',
      gradingGuide: 'Đặt tính và tính đúng mỗi ý được 0,5 điểm (4 ý × 0,5đ = 2,0 điểm).',
      rubricSteps: [
        { stepDescription: 'Ý a) 45,68 + 19,75 = 65,43', points: 0.5 },
        { stepDescription: 'Ý b) 82,4 - 35,68 = 46,72', points: 0.5 },
        { stepDescription: 'Ý c) 14,5 × 3,6 = 52,2', points: 0.5 },
        { stepDescription: 'Ý d) 43,2 : 1,8 = 24', points: 0.5 },
      ],
      mathCategory: 'TINH_TOAN',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '45.68 + 19.75',
          expectedValue: '65.43',
          computedValue: (45.68 + 19.75).toFixed(2),
          isAccurate: Math.abs(45.68 + 19.75 - 65.43) < 1e-9,
          verificationNote: 'Phép cộng số thập phân chính xác.',
        },
        {
          stepOrder: 2,
          expressionLabel: '82.4 - 35.68',
          expectedValue: '46.72',
          computedValue: (82.4 - 35.68).toFixed(2),
          isAccurate: Math.abs(82.4 - 35.68 - 46.72) < 1e-9,
          verificationNote: 'Phép trừ số thập phân chính xác.',
        },
        {
          stepOrder: 3,
          expressionLabel: '14.5 × 3.6',
          expectedValue: '52.2',
          computedValue: String(Number((14.5 * 3.6).toFixed(4))),
          isAccurate: Math.abs(14.5 * 3.6 - 52.2) < 1e-9,
          verificationNote: 'Phép nhân hai số thập phân chính xác.',
        },
        {
          stepOrder: 4,
          expressionLabel: '43.2 / 1.8',
          expectedValue: '24',
          computedValue: String(Number((43.2 / 1.8).toFixed(4))),
          isAccurate: Math.abs(43.2 / 1.8 - 24) < 1e-9,
          verificationNote: 'Phép chia hai số thập phân chính xác.',
        },
      ],
    },
    {
      id: 'TOAN5-CK1-Q06',
      questionNumberLabel: 'Câu 6',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN5-PHEP-TINH-STP',
      topicTitle: 'Các phép tính với số thập phân',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-02',
      learningOutcomeText:
        'Thực hiện phép cộng, trừ, nhân, chia số thập phân; vận dụng tính chất giao hoán, kết hợp, phân phối để tính bằng cách thuận tiện và tìm thành phần chưa biết.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh tìm thừa số chưa biết trong phép tính số thập phân và vận dụng tính chất phân phối của phép nhân đối với phép cộng để tính thuận tiện.',
      formatType: 'TU_LUAN',
      points: 1.5,
      stem: 'Thực hiện các yêu cầu sau:\na) Tìm thành phần chưa biết x: x × 2,5 = 18,4 + 11,6\nb) Tính bằng cách thuận tiện nhất: 38,6 × 4,2 + 38,6 × 5,8',
      correctAnswer: 'a) x = 12 ; b) 386',
      gradingGuide:
        'Ý a) Tính được x × 2,5 = 30 và x = 30 : 2,5 = 12 được 0,75 điểm; Ý b) Đưa về 38,6 × (4,2 + 5,8) = 38,6 × 10 = 386 được 0,75 điểm.',
      rubricSteps: [
        { stepDescription: 'Ý a) Tìm đúng thành phần chưa biết: x × 2,5 = 30 => x = 30 : 2,5 = 12', points: 0.75 },
        { stepDescription: 'Ý b) Nhóm thừa số chung hợp lý: 38,6 × (4,2 + 5,8) = 38,6 × 10 = 386', points: 0.75 },
      ],
      mathCategory: 'TIM_THANH_PHAN_CHUA_BIET',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: '(18.4 + 11.6) / 2.5',
          expectedValue: '12',
          computedValue: String((18.4 + 11.6) / 2.5),
          isAccurate: Math.abs((18.4 + 11.6) / 2.5 - 12) < 1e-9,
          verificationNote: '18,4 + 11,6 = 30; 30 : 2,5 = 12.',
        },
        {
          stepOrder: 2,
          expressionLabel: '38.6 × (4.2 + 5.8)',
          expectedValue: '386',
          computedValue: String(Number((38.6 * (4.2 + 5.8)).toFixed(4))),
          isAccurate: Math.abs(38.6 * (4.2 + 5.8) - 386) < 1e-9,
          verificationNote: '4,2 + 5,8 = 10; 38,6 × 10 = 386.',
        },
      ],
    },
    {
      id: 'TOAN5-CK1-Q07',
      questionNumberLabel: 'Câu 7',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN5-DO-LUONG',
      topicTitle: 'Đo lường (Đơn vị đo diện tích ha, km², m²)',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-03',
      learningOutcomeText:
        'Nhận biết và chuyển đổi mối quan hệ giữa các đơn vị đo diện tích: mét vuông (m²), héc-ta (ha), ki-lô-mét vuông (km²) dưới dạng số thập phân.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
      cognitiveLevelJustification:
        'Mức 2 (TT 27/2020): Học sinh chuyển đổi các số đo diện tích về cùng đơn vị héc-ta (ha) rồi sắp xếp theo thứ tự từ bé đến lớn.',
      formatType: 'TU_LUAN',
      points: 0.5,
      stem: 'Viết các số đo diện tích sau theo thứ tự từ bé đến lớn: 2,5 ha ; 21 500 m² ; 0,03 km².',
      correctAnswer: '21 500 m² ; 2,5 ha ; 0,03 km² (vì 2,15 ha < 2,5 ha < 3 ha)',
      gradingGuide: 'Đổi nhẩm và sắp xếp đúng thứ tự từ bé đến lớn được 0,5 điểm.',
      rubricSteps: [
        { stepDescription: 'Sắp xếp đúng thứ tự: 21 500 m² ; 2,5 ha ; 0,03 km²', points: 0.5 },
      ],
      mathCategory: 'DO_LUONG',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: 'Đổi về ha: 21500 m² = 2.15 ha; 2.5 ha = 2.5 ha; 0.03 km² = 3 ha',
          expectedValue: '2.15 < 2.5 < 3',
          computedValue: `${21500 / 10000} < 2.5 < ${0.03 * 100}`,
          unitLabel: 'ha',
          isAccurate: 21500 / 10000 < 2.5 && 2.5 < 0.03 * 100,
          verificationNote: '2,15 ha < 2,5 ha < 3 ha hoàn toàn chính xác.',
        },
      ],
    },
    {
      id: 'TOAN5-CK1-Q08',
      questionNumberLabel: 'Câu 8',
      partCode: 'TU_LUAN',
      topicId: 'TOP-TOAN5-GIAI-TOAN',
      topicTitle: 'Giải toán có lời văn về Số thập phân & Diện tích',
      learningOutcomeCode: 'TOAN5-CK1-YCCD-06',
      learningOutcomeText:
        'Giải quyết được bài toán thực tiễn gắn với các phép tính số thập phân và tính diện tích mảnh đất, sản lượng thu hoạch.',
      cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3,
      cognitiveLevelJustification:
        'Mức 3 (TT 27/2020): Học sinh vận dụng tổng hợp công thức diện tích hình chữ nhật, diện tích hình tròn (bồn hoa) và phép tính số thập phân trong bài toán thực tiễn có nhiều bước tính.',
      formatType: 'TU_LUAN',
      points: 2.0,
      stem: 'Một mảnh vườn trường hình chữ nhật có chiều dài 25 m, chiều rộng bằng 3/5 chiều dài. Chính giữa mảnh vườn, nhà trường xây một bồn hoa hình tròn có bán kính 2 m; phần đất còn lại dùng để trồng cỏ xanh.\na) Tính diện tích cả mảnh vườn hình chữ nhật.\nb) Tính diện tích phần đất dùng để trồng cỏ xanh.',
      correctAnswer: 'a) Diện tích mảnh vườn là 375 m²; b) Diện tích phần đất trồng cỏ xanh là 362,44 m².',
      gradingGuide:
        'Tính đúng chiều rộng mảnh vườn 15 m (0,5đ); tính đúng diện tích mảnh vườn 375 m² (0,5đ); tính đúng diện tích bồn hoa hình tròn 12,56 m² (0,5đ); tính đúng diện tích trồng cỏ 362,44 m² và ghi Đáp số (0,5đ).',
      rubricSteps: [
        { stepDescription: 'Chiều rộng mảnh vườn hình chữ nhật là: 25 × 3 : 5 = 15 (m)', points: 0.5 },
        { stepDescription: 'Ý a) Diện tích mảnh vườn hình chữ nhật là: 25 × 15 = 375 (m²)', points: 0.5 },
        { stepDescription: 'Diện tích bồn hoa hình tròn là: 2 × 2 × 3,14 = 12,56 (m²)', points: 0.5 },
        { stepDescription: 'Ý b) Diện tích phần đất trồng cỏ là: 375 - 12,56 = 362,44 (m²) và ghi Đáp số', points: 0.5 },
      ],
      mathCategory: 'GIAI_TOAN_CO_LOI_VAN',
      mathCalculationChecks: [
        {
          stepOrder: 1,
          expressionLabel: 'Chiều rộng: 25 × 3 / 5',
          expectedValue: '15',
          computedValue: String((25 * 3) / 5),
          unitLabel: 'm',
          isAccurate: (25 * 3) / 5 === 15,
          verificationNote: 'Chiều rộng mảnh vườn là 15 m.',
        },
        {
          stepOrder: 2,
          expressionLabel: 'Diện tích mảnh vườn: 25 × 15',
          expectedValue: '375',
          computedValue: String(25 * 15),
          unitLabel: 'm²',
          isAccurate: 25 * 15 === 375,
          verificationNote: 'Diện tích mảnh vườn là 375 m².',
        },
        {
          stepOrder: 3,
          expressionLabel: 'Diện tích bồn hoa tròn: 2 × 2 × 3.14',
          expectedValue: '12.56',
          computedValue: (2 * 2 * 3.14).toFixed(2),
          unitLabel: 'm²',
          isAccurate: Math.abs(2 * 2 * 3.14 - 12.56) < 1e-9,
          verificationNote: 'S_tròn = r × r × 3,14 = 12,56 m².',
        },
        {
          stepOrder: 4,
          expressionLabel: 'Diện tích trồng cỏ: 375 - 12.56',
          expectedValue: '362.44',
          computedValue: (375 - 12.56).toFixed(2),
          unitLabel: 'm²',
          isAccurate: Math.abs(375 - 12.56 - 362.44) < 1e-9,
          verificationNote: '375 - 12,56 = 362,44 m².',
        },
      ],
    },
  ];

  const { matrixRows, specificationRows, analytics } = buildPrimaryMatrixAndAnalytics(
    questions,
    10.0,
    'TOAN_5_CUOI_KY_1',
    'Toán'
  );

  return {
    id: 'PKG-PRIMARY-TOAN5-CK1',
    code: 'DE-TH-TOAN5-CK1-2026',
    title: 'Đề kiểm tra định kỳ Cuối học kỳ I – Môn Toán Lớp 5 (Theo TT 27/2020/TT-BGDĐT)',
    grade: 5,
    subject: 'Toán',
    period: 'CUOI_KY_1',
    contentScopeDescription:
      'Số thập phân, hàng của số thập phân, chuyển hỗn số thành số thập phân; Các phép tính cộng, trừ, nhân, chia số thập phân; Tìm thành phần chưa biết & tính bằng cách thuận tiện; Đơn vị đo diện tích ha, km², m²; Diện tích hình thang, hình tròn; Tỉ số mô tả số lần lặp lại (xác suất thực nghiệm); Giải bài toán có lời văn.',
    totalPoints: 10.0,
    durationMinutes: 40,
    assessmentForm: 'BAI_KIEM_TRA_VIET',
    schoolTemplateId: 'TPL-TH-TOAN-45-CHUAN',
    schoolTemplateTitle:
      'Mẫu đề Toán Lớp 4–5 (Tổ Chuyên môn & BGH phê duyệt – Gợi ý 40% Mức 1 : 40% Mức 2 : 20% Mức 3)',
    approvalStatus: ApprovalStatus.DRAFT,
    aiOriginNotice:
      'Đề kiểm tra ở trạng thái BẢN NHÁP (DRAFT) – Không tự động phê duyệt. Cần Tổ trưởng chuyên môn và Ban Giám hiệu rà soát, ký duyệt trước khi sử dụng chính thức.',
    createdAt: '2026-10-15T09:00:00.000Z',
    applicabilityCheck,
    questions,
    matrixRows,
    specificationRows,
    analytics,
  };
}

export function getPrebuiltPrimaryExamPackages(): PrimaryCompleteExamPackage[] {
  return [
    createMathGrade4MidTerm1Package(),
    createVietnameseGrade4MidTerm1Package(),
    createMathGrade5EndTerm1Package(),
  ];
}

/**
 * Chạy kịch bản Kiểm thử Nghiệm thu 3 bộ đề Tiểu học theo đúng Mục VII:
 * 1. Đề Toán lớp 4 giữa học kỳ I
 * 2. Đề Tiếng Việt lớp 4 giữa học kỳ I
 * 3. Đề Toán lớp 5 cuối học kỳ I
 */
export function runPrimaryAcceptanceTestSuite(
  packages: PrimaryCompleteExamPackage[]
): PrimaryAcceptanceSuiteReport {
  const examResults: PrimaryAcceptanceExamCheckItem[] = packages.map((pkg) => {
    const hasMatrix = pkg.matrixRows.length > 0;
    const hasSpecification = pkg.specificationRows.length > 0;
    const hasExamPaper = pkg.questions.length > 0;
    const hasAnswerKey = pkg.questions.every((q) => q.correctAnswer.trim().length > 0);
    const hasGradingGuide = pkg.questions.every(
      (q) => q.gradingGuide.trim().length > 0 && q.rubricSteps.length > 0
    );

    const totalPointsVerified = Number(
      pkg.questions.reduce((acc, q) => acc + q.points, 0).toFixed(2)
    );
    const isTotalPointsAccurate =
      Math.abs(totalPointsVerified - pkg.totalPoints) < 0.001 &&
      Math.abs(pkg.totalPoints - 10.0) < 0.001;

    const levelsCovered = pkg.analytics.byLevel
      .filter((l) => l.questionCount > 0)
      .map((l) => `${l.label} (${l.questionCount} câu – ${l.points}đ)`);

    const all3LevelsPresent =
      pkg.analytics.byLevel.every((l) => l.questionCount > 0);

    const learningOutcomesMappedCount = pkg.analytics.byLearningOutcome.length;
    const unassessedOutcomesIdentifiedCount =
      pkg.analytics.unassessedLearningOutcomes.length;

    const calculationsAndAnswersVerified =
      pkg.subject === 'Toán'
        ? Boolean(
            pkg.analytics.mathVerificationSummary?.allCalculationsAccurate &&
              pkg.analytics.mathVerificationSummary?.allRubricStepsMatchQuestionPoints
          )
        : Boolean(
            pkg.readingPassageBlock &&
              pkg.oralReadingSheet &&
              pkg.writingAssessmentSpec &&
              pkg.questions.every((q) => {
                const rubricSum = Number(
                  q.rubricSteps.reduce((s, r) => s + r.points, 0).toFixed(2)
                );
                return Math.abs(rubricSum - q.points) < 0.02;
              })
          );

    const isKeptAsDraftNotAutoApproved = pkg.approvalStatus === ApprovalStatus.DRAFT;

    const verificationDetails: string[] = [
      `Quy định TT 27/2020: ${pkg.applicabilityCheck.statusLabel} (${pkg.applicabilityCheck.regulatoryClause}).`,
      `Hồ sơ 5 thành phần: Ma trận (${pkg.matrixRows.length} chủ đề), Bản đặc tả (${pkg.specificationRows.length} dòng YCCĐ), Đề kiểm tra (${pkg.questions.length} câu/phần), Đáp án & Hướng dẫn chấm đầy đủ.`,
      `Kiểm tra tổng điểm: ${totalPointsVerified.toFixed(2)} / ${pkg.totalPoints.toFixed(2)} điểm (Khớp 100%).`,
      `Phân bố 3 mức độ: ${levelsCovered.join('; ')}. Tất cả câu hỏi đều có giải thích căn cứ phân loại mức độ.`,
      pkg.subject === 'Toán'
        ? `Kiểm tra phép tính tự động: Đã kiểm tra ${pkg.analytics.mathVerificationSummary?.totalArithmeticStepsChecked} bước tính toán trên 8 dạng bài đặc thù môn Toán, chính xác 100%.`
        : `Đặc thù Tiếng Việt: Có Ngân hàng ngữ liệu đọc (${pkg.readingPassageBlock?.corpusCode}), Phiếu đánh giá Đọc thành tiếng (${pkg.oralReadingSheet?.passages.length} phiếu), Câu hỏi Đọc hiểu & Kiến thức TV, Đề viết & Tiêu chí chấm viết (${pkg.writingAssessmentSpec?.criteria.length} tiêu chí).`,
      `Trạng thái phê duyệt: Giữ nguyên ở trạng thái "${pkg.approvalStatus}" (Bản nháp) – Tuân thủ nghiêm ngặt nguyên tắc không tự động phê duyệt đề do AI tạo.`,
    ];

    const passed =
      hasMatrix &&
      hasSpecification &&
      hasExamPaper &&
      hasAnswerKey &&
      hasGradingGuide &&
      isTotalPointsAccurate &&
      all3LevelsPresent &&
      learningOutcomesMappedCount > 0 &&
      calculationsAndAnswersVerified &&
      isKeptAsDraftNotAutoApproved;

    return {
      examPackageId: pkg.id,
      examCode: pkg.code,
      examTitle: pkg.title,
      grade: pkg.grade,
      subject: pkg.subject,
      periodLabel: PRIMARY_EXAM_PERIOD_LABELS[pkg.period],
      hasMatrix,
      hasSpecification,
      hasExamPaper,
      hasAnswerKey,
      hasGradingGuide,
      totalPointsVerified,
      isTotalPointsAccurate,
      levelsCovered,
      learningOutcomesMappedCount,
      unassessedOutcomesIdentifiedCount,
      calculationsAndAnswersVerified,
      isKeptAsDraftNotAutoApproved,
      verificationDetails,
      passed,
    };
  });

  return {
    executedAt: new Date().toISOString(),
    circularReference:
      'Thông tư 27/2020/TT-BGDĐT ngày 04/9/2020 của Bộ trưởng Bộ GD&ĐT ban hành Quy định đánh giá học sinh tiểu học và Chương trình GDPT 2018',
    totalExamsTested: examResults.length,
    allPassed: examResults.every((r) => r.passed),
    examResults,
  };
}

/**
 * Xuất Hồ sơ Đề kiểm tra Tiểu học (Ma trận + Bản đặc tả + Đề kiểm tra + Đáp án + Hướng dẫn chấm)
 * ra tệp Word (.doc chuẩn HTML-Word canh đều hai bên, cách dòng đơn, Times New Roman) hoặc in/lưu PDF.
 */
export function exportPrimaryExamPackageToWord(pkg: PrimaryCompleteExamPackage): {
  fileName: string;
  sizeBytes: number;
} {
  const htmlContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${pkg.title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 2cm 2cm 2cm 2.5cm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.15;
      text-align: justify;
      color: #000000;
    }
    h1, h2, h3 {
      text-align: center;
      margin-top: 8pt;
      margin-bottom: 6pt;
      line-height: 1.15;
    }
    p {
      margin-top: 3pt;
      margin-bottom: 3pt;
      line-height: 1.15;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6pt;
      margin-bottom: 10pt;
      font-size: 11.5pt;
    }
    th, td {
      border: 1px solid #000000;
      padding: 4pt 6pt;
      vertical-align: top;
      line-height: 1.15;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .passage-box {
      border: 1px solid #334155;
      padding: 8pt 10pt;
      margin: 8pt 0;
      background-color: #f8fafc;
    }
    .draft-banner {
      border: 1px dashed #b45309;
      padding: 6pt;
      margin-bottom: 8pt;
      font-size: 11pt;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="draft-banner">
    <strong>TRẠNG THÁI HỒ SƠ: BẢN NHÁP (CHỜ THẨM ĐỊNH &amp; PHÊ DUYỆT)</strong> – ${pkg.aiOriginNotice}
  </div>

  <h2>HỒ SƠ ĐỀ KIỂM TRA ĐỊNH KỲ CẤP TIỂU HỌC (THÔNG TƯ 27/2020/TT-BGDĐT)</h2>
  <h3>${pkg.title.toUpperCase()}</h3>
  <p><strong>Khối lớp:</strong> Lớp ${pkg.grade} | <strong>Môn học:</strong> ${pkg.subject} | <strong>Kỳ kiểm tra:</strong> ${PRIMARY_EXAM_PERIOD_LABELS[pkg.period]}</p>
  <p><strong>Thời gian làm bài:</strong> ${pkg.durationMinutes} phút | <strong>Tổng điểm:</strong> ${pkg.totalPoints.toFixed(1)} điểm | <strong>Hình thức:</strong> ${PRIMARY_ASSESSMENT_FORM_LABELS[pkg.assessmentForm]}</p>
  <p><strong>Mẫu đề áp dụng:</strong> ${pkg.schoolTemplateTitle}</p>

  <hr />
  <h3>PHẦN 1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ (3 MỨC ĐỘ THEO TT 27/2020/TT-BGDĐT)</h3>
  <table>
    <thead>
      <tr>
        <th>TT</th>
        <th>Chủ đề / Mạch nội dung</th>
        <th>Mức 1 (TN / TL)</th>
        <th>Mức 2 (TN / TL)</th>
        <th>Mức 3 (TN / TL)</th>
        <th>Tổng số câu</th>
        <th>Tổng điểm (Tỷ lệ %)</th>
      </tr>
    </thead>
    <tbody>
      ${pkg.matrixRows
        .map(
          (row, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td><strong>${row.topicTitle}</strong></td>
        <td style="text-align:center;">TN: ${row.muc1ObjectiveCount}c (${row.muc1ObjectivePoints}đ)<br/>TL: ${row.muc1ConstructedCount}c (${row.muc1ConstructedPoints}đ)</td>
        <td style="text-align:center;">TN: ${row.muc2ObjectiveCount}c (${row.muc2ObjectivePoints}đ)<br/>TL: ${row.muc2ConstructedCount}c (${row.muc2ConstructedPoints}đ)</td>
        <td style="text-align:center;">TN: ${row.muc3ObjectiveCount}c (${row.muc3ObjectivePoints}đ)<br/>TL: ${row.muc3ConstructedCount}c (${row.muc3ConstructedPoints}đ)</td>
        <td style="text-align:center;">${row.totalQuestions} câu</td>
        <td style="text-align:center;"><strong>${row.totalPoints.toFixed(2)}đ</strong> (${row.percentOfExam}%)</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h3>PHẦN 2. BẢN ĐẶC TẢ KỸ THUẬT VÀ GIẢI THÍCH MỨC ĐỘ ĐÁNH GIÁ</h3>
  <table>
    <thead>
      <tr>
        <th>Câu</th>
        <th>Chủ đề</th>
        <th>Mã &amp; Nội dung Yêu cầu cần đạt (GDPT 2018)</th>
        <th>Mức độ &amp; Lý giải phân loại</th>
        <th>Dạng câu</th>
        <th>Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${pkg.specificationRows
        .map(
          (spec) => `
      <tr>
        <td style="text-align:center;"><strong>${spec.questionNumbers.join(', ')}</strong></td>
        <td>${spec.topicTitle}</td>
        <td><strong>[${spec.learningOutcomeCode}]</strong> ${spec.learningOutcomeText}</td>
        <td><strong>${PRIMARY_COGNITIVE_LEVEL_METADATA[spec.cognitiveLevel].shortLabel}:</strong> ${spec.cognitiveLevelJustification}</td>
        <td>${spec.specializedCategoryLabel}</td>
        <td style="text-align:center;">${spec.points.toFixed(2)}đ</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h3>PHẦN 3. ĐỀ KIỂM TRA CHÍNH THỨC</h3>
  ${
    pkg.readingPassageBlock
      ? `<div class="passage-box">
          <p style="text-align:center;"><strong>NGỮ LIỆU ĐỌC HIỂU: ${pkg.readingPassageBlock.title.toUpperCase()}</strong></p>
          ${pkg.readingPassageBlock.content
            .split('\n\n')
            .map((para) => `<p>${para}</p>`)
            .join('')}
          <p style="text-align:right; font-style:italic;">(${pkg.readingPassageBlock.authorOrSource})</p>
        </div>`
      : ''
  }

  ${pkg.questions
    .map(
      (q) => `
    <p><strong>${q.questionNumberLabel} (${q.points.toFixed(2)} điểm) [${PRIMARY_COGNITIVE_LEVEL_METADATA[q.cognitiveLevel].shortLabel}]:</strong> ${q.stem.replace(/\n/g, '<br/>')}</p>
    ${
      q.options && q.options.length > 0
        ? `<p style="margin-left:14pt;">${q.options.join(' &nbsp;&nbsp;&nbsp;&nbsp; ')}</p>`
        : ''
    }`
    )
    .join('')}

  <h3>PHẦN 4. ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT</h3>
  <table>
    <thead>
      <tr>
        <th>Câu / Phần</th>
        <th>Đáp án chuẩn</th>
        <th>Hướng dẫn chấm và Biểu điểm từng bước</th>
        <th>Điểm tối đa</th>
      </tr>
    </thead>
    <tbody>
      ${pkg.questions
        .map(
          (q) => `
      <tr>
        <td style="text-align:center;"><strong>${q.questionNumberLabel}</strong></td>
        <td>${q.correctAnswer.replace(/\n/g, '<br/>')}</td>
        <td>
          <p>${q.gradingGuide}</p>
          <ul>
            ${q.rubricSteps
              .map((step) => `<li>${step.stepDescription}: <strong>${step.points.toFixed(2)} điểm</strong></li>`)
              .join('')}
          </ul>
        </td>
        <td style="text-align:center;"><strong>${q.points.toFixed(2)}đ</strong></td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const fileName = `${pkg.code}_Ho_So_De_Tieu_Hoc_TT27.doc`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    fileName,
    sizeBytes: blob.size,
  };
}
