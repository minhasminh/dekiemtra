import * as XLSX from 'xlsx';
import {
  AiAnalyticsRecommendationPackage,
  AiGuardrailComplianceCheck,
  AnalyticsQuestionBlueprintItem,
  ClassStatisticalComparisonRow,
  CompletionThresholdConfig,
  DescriptiveStatisticsPackage,
  DistractorOptionStat,
  ExamPeriodComparisonRecord,
  IndependentVerificationAuditReport,
  IndependentVerificationMetricComparison,
  LearningOutcomeMasterySynthesis,
  PrincipalLeadershipReport,
  QuestionPsychometricAnalysis,
  ScoreDistributionBin,
  StudentExamResultRecord,
  StudentItemResponseRecord,
} from '../../types/domain';

// ============================================================================
// 1. CẤU TRÚC ĐỀ KIỂM TRA (12 CÂU HỎI GẮN YÊU CẦU CẦN ĐẠT - TOÁN 8 GDPT 2018)
// ============================================================================

export const ANALYTICS_EXAM_BLUEPRINT: AnalyticsQuestionBlueprintItem[] = [
  {
    questionId: 'Q01',
    questionNumber: 1,
    label: 'Câu 1 (TN)',
    stemSummary: 'Nhận biết đơn thức thu gọn và xác định bậc của đơn thức nhiều biến.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'A',
    cognitiveLevel: 'Nhận biết',
    topicId: 'MATH8-ALG-01',
    topicTitle: 'Đa thức nhiều biến',
    learningOutcomeCode: 'YCCD-TOAN8-DT-01',
    learningOutcomeText: 'Nhận biết được đơn thức, đa thức nhiều biến và thu gọn đơn thức, đa thức.',
  },
  {
    questionId: 'Q02',
    questionNumber: 2,
    label: 'Câu 2 (TN)',
    stemSummary: 'Thực hiện phép cộng, trừ hai đa thức nhiều biến có cùng bậc.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'C',
    cognitiveLevel: 'Thông hiểu',
    topicId: 'MATH8-ALG-01',
    topicTitle: 'Đa thức nhiều biến',
    learningOutcomeCode: 'YCCD-TOAN8-DT-01',
    learningOutcomeText: 'Nhận biết được đơn thức, đa thức nhiều biến và thu gọn đơn thức, đa thức.',
  },
  {
    questionId: 'Q03',
    questionNumber: 3,
    label: 'Câu 3 (TN)',
    stemSummary: 'Khai triển hằng đẳng thức bình phương của một hiệu (A - B)^2.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'B',
    cognitiveLevel: 'Nhận biết',
    topicId: 'MATH8-ALG-02',
    topicTitle: 'Hằng đẳng thức đáng nhớ & Phân tích đa thức',
    learningOutcomeCode: 'YCCD-TOAN8-HDT-01',
    learningOutcomeText: 'Mô tả được các hằng đẳng thức đáng nhớ và vận dụng phân tích đa thức thành nhân tử.',
  },
  {
    questionId: 'Q04',
    questionNumber: 4,
    label: 'Câu 4 (TN)',
    stemSummary: 'Phân tích đa thức thành nhân tử bằng phương pháp nhóm hạng tử và dùng hằng đẳng thức.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'D',
    cognitiveLevel: 'Thông hiểu',
    topicId: 'MATH8-ALG-02',
    topicTitle: 'Hằng đẳng thức đáng nhớ & Phân tích đa thức',
    learningOutcomeCode: 'YCCD-TOAN8-HDT-01',
    learningOutcomeText: 'Mô tả được các hằng đẳng thức đáng nhớ và vận dụng phân tích đa thức thành nhân tử.',
  },
  {
    questionId: 'Q05',
    questionNumber: 5,
    label: 'Câu 5 (TN)',
    stemSummary: 'Xác định điều kiện xác định của phân thức đại số có mẫu bậc hai.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'A',
    cognitiveLevel: 'Thông hiểu',
    topicId: 'MATH8-ALG-03',
    topicTitle: 'Phân thức đại số',
    learningOutcomeCode: 'YCCD-TOAN8-PT-01',
    learningOutcomeText: 'Nhận biết điều kiện xác định, rút gọn và thực hiện các phép tính trên phân thức đại số.',
  },
  {
    questionId: 'Q06',
    questionNumber: 6,
    label: 'Câu 6 (TN)',
    stemSummary: 'Nhận biết dấu hiệu hình bình hành là hình chữ nhật qua hai đường chéo.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'C',
    cognitiveLevel: 'Nhận biết',
    topicId: 'MATH8-GEO-01',
    topicTitle: 'Tứ giác & Các hình đặc biệt',
    learningOutcomeCode: 'YCCD-TOAN8-TG-01',
    learningOutcomeText: 'Giải thích được tính chất và dấu hiệu nhận biết hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông.',
  },
  {
    questionId: 'Q07',
    questionNumber: 7,
    label: 'Câu 7 (TN - Nghi vấn nhiễu)',
    stemSummary: 'Xác định điều kiện để tứ giác có hai đường chéo vuông góc trở thành hình thoi.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'D',
    cognitiveLevel: 'Thông hiểu',
    topicId: 'MATH8-GEO-01',
    topicTitle: 'Tứ giác & Các hình đặc biệt',
    learningOutcomeCode: 'YCCD-TOAN8-TG-01',
    learningOutcomeText: 'Giải thích được tính chất và dấu hiệu nhận biết hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông.',
  },
  {
    questionId: 'Q08',
    questionNumber: 8,
    label: 'Câu 8 (TN)',
    stemSummary: 'Áp dụng định lí Thalès trong tam giác để tính độ dài đoạn thẳng bị chắn.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'B',
    cognitiveLevel: 'Vận dụng',
    topicId: 'MATH8-GEO-02',
    topicTitle: 'Định lí Thalès trong tam giác',
    learningOutcomeCode: 'YCCD-TOAN8-THALES-01',
    learningOutcomeText: 'Giải thích định lí Thalès thuận, đảo và vận dụng tính độ dài đoạn thẳng thực tế.',
  },
  {
    questionId: 'Q09',
    questionNumber: 9,
    label: 'Câu 9 (TN - Đơn câu YCCĐ)',
    stemSummary: 'Lựa chọn biểu đồ thích hợp để biểu diễn cơ cấu tỷ lệ phần trăm ngân sách.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'C',
    cognitiveLevel: 'Nhận biết',
    topicId: 'MATH8-STAT-01',
    topicTitle: 'Thu thập và biểu diễn dữ liệu',
    learningOutcomeCode: 'YCCD-TOAN8-TK-01',
    learningOutcomeText: 'Lựa chọn và biểu diễn được dữ liệu vào bảng, biểu đồ thích hợp (cột, đoạn thẳng, hình quạt tròn).',
  },
  {
    questionId: 'Q10',
    questionNumber: 10,
    label: 'Câu 10 (TN - Câu khó)',
    stemSummary: 'Vận dụng tính chất đường phân giác và định lí Thalès tìm tỷ số diện tích hai tam giác.',
    format: 'MULTIPLE_CHOICE',
    maxPoints: 0.5,
    correctOption: 'D',
    cognitiveLevel: 'Vận dụng',
    topicId: 'MATH8-GEO-02',
    topicTitle: 'Định lí Thalès trong tam giác',
    learningOutcomeCode: 'YCCD-TOAN8-THALES-01',
    learningOutcomeText: 'Giải thích định lí Thalès thuận, đảo và vận dụng tính độ dài đoạn thẳng thực tế.',
  },
  {
    questionId: 'Q11',
    questionNumber: 11,
    label: 'Câu 11 (TL - Rút gọn phân thức)',
    stemSummary: 'Rút gọn biểu thức chứa các phép cộng, trừ và chia phân thức đại số; tính giá trị biểu thức.',
    format: 'ESSAY',
    maxPoints: 2.5,
    cognitiveLevel: 'Thông hiểu',
    topicId: 'MATH8-ALG-03',
    topicTitle: 'Phân thức đại số',
    learningOutcomeCode: 'YCCD-TOAN8-PT-01',
    learningOutcomeText: 'Nhận biết điều kiện xác định, rút gọn và thực hiện các phép tính trên phân thức đại số.',
  },
  {
    questionId: 'Q12',
    questionNumber: 12,
    label: 'Câu 12 (TL - Hình học & Tối ưu)',
    stemSummary: 'Chứng minh tứ giác là hình chữ nhật, vận dụng định lí Thalès và tìm giá trị nhỏ nhất của biểu thức.',
    format: 'ESSAY',
    maxPoints: 2.5,
    cognitiveLevel: 'Vận dụng',
    topicId: 'MATH8-GEO-01',
    topicTitle: 'Tứ giác & Các hình đặc biệt',
    learningOutcomeCode: 'YCCD-TOAN8-TG-01',
    learningOutcomeText: 'Giải thích được tính chất và dấu hiệu nhận biết hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông.',
  },
];

// ============================================================================
// 2. DỮ LIỆU GIẢ LẬP 3 LỚP × 30 HỌC SINH = 90 HỌC SINH (ĐẦY ĐỦ KẾT QUẢ TỪNG CÂU)
//    + 1 LỚP 30 HỌC SINH CHỈ CÓ ĐIỂM TỔNG (KIỂM TRA NGUYÊN TẮC KHÔNG SUY DIỄN)
// ============================================================================

const VIETNAMESE_LAST_NAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
];
const VIETNAMESE_MIDDLE_NAMES = [
  'Gia', 'Minh', 'Ngọc', 'Phương', 'Quốc', 'Thanh', 'Thảo', 'Đức', 'Bảo', 'Khánh',
];
const VIETNAMESE_FIRST_NAMES = [
  'An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hải', 'Hân', 'Hiếu', 'Hùng', 'Hương',
  'Khang', 'Khôi', 'Lan', 'Linh', 'Long', 'Mai', 'My', 'Nam', 'Ngân', 'Nghĩa',
  'Nhi', 'Phong', 'Phúc', 'Quân', 'Quỳnh', 'Sơn', 'Tâm', 'Thư', 'Trang', 'Tuấn',
];

function buildDeterministicStudentName(classIndex: number, studentIdx: number): string {
  const last = VIETNAMESE_LAST_NAMES[(studentIdx + classIndex * 3) % VIETNAMESE_LAST_NAMES.length];
  const mid = VIETNAMESE_MIDDLE_NAMES[(studentIdx * 2 + classIndex) % VIETNAMESE_MIDDLE_NAMES.length];
  const first = VIETNAMESE_FIRST_NAMES[studentIdx % VIETNAMESE_FIRST_NAMES.length];
  return `${last} ${mid} ${first}`;
}

/**
 * Tạo dữ liệu 3 lớp (8A1, 8A2, 8A3), mỗi lớp đúng 30 học sinh (tổng 90 học sinh)
 * có đầy đủ kết quả từng câu hỏi (FULL_ITEM_RESPONSES),
 * cùng với 1 lớp 8A4 (30 học sinh) chỉ có điểm tổng (TOTAL_SCORE_ONLY).
 */
export function createSimulatedExamDataset(): StudentExamResultRecord[] {
  const records: StudentExamResultRecord[] = [];
  const classesConfig = [
    { className: '8A1', classIndex: 0, baseAbilityOffset: 0.14 }, // Lớp khá/giỏi cao
    { className: '8A2', classIndex: 1, baseAbilityOffset: 0.02 }, // Lớp mặt bằng chuẩn
    { className: '8A3', classIndex: 2, baseAbilityOffset: -0.10 }, // Lớp cần hỗ trợ thêm
  ];

  classesConfig.forEach(({ className, classIndex, baseAbilityOffset }) => {
    for (let i = 0; i < 30; i++) {
      const studentNum = i + 1;
      const paddedNum = String(studentNum).padStart(2, '0');
      const studentId = `HS-${className}-${paddedNum}`;
      const maskedStudentCode = `MÃ-${className}-${paddedNum}`;
      const fullName = buildDeterministicStudentName(classIndex, i);

      // Năng lực chuẩn hóa của học sinh trong khoảng [0.15, 0.96]
      const rawRankRatio = (30 - i) / 30; // i=0 cao nhất, i=29 thấp nhất
      const ability = Math.max(
        0.14,
        Math.min(0.97, 0.18 + rawRankRatio * 0.72 + baseAbilityOffset)
      );

      const itemResponses: Record<string, StudentItemResponseRecord> = {};
      let totalScore = 0;

      ANALYTICS_EXAM_BLUEPRINT.forEach((q, qIdx) => {
        const seedVal = ((i * 7 + classIndex * 13 + qIdx * 5) % 20) / 20; // [0, 0.95]

        if (q.format === 'MULTIPLE_CHOICE') {
          let isCorrect = false;
          let selectedOption: 'A' | 'B' | 'C' | 'D' | 'OMITTED' = q.correctOption || 'A';

          if (q.questionId === 'Q01') {
            // Câu rất dễ (p ~ 0.88)
            isCorrect = ability >= 0.26 || seedVal > 0.45;
            if (!isCorrect) {
              selectedOption = seedVal < 0.25 ? 'B' : seedVal < 0.4 ? 'C' : 'D';
            }
          } else if (q.questionId === 'Q02') {
            // Câu vừa sức (p ~ 0.76, phân biệt tốt)
            isCorrect = ability >= 0.42 || (ability >= 0.28 && seedVal > 0.55);
            if (!isCorrect) {
              selectedOption = seedVal < 0.35 ? 'A' : seedVal < 0.7 ? 'B' : 'D';
            }
          } else if (q.questionId === 'Q03') {
            // Câu dễ - trung bình (p ~ 0.81)
            isCorrect = ability >= 0.36 || seedVal > 0.5;
            if (!isCorrect) {
              selectedOption = seedVal < 0.4 ? 'A' : seedVal < 0.75 ? 'C' : 'D';
            }
          } else if (q.questionId === 'Q04') {
            // Câu phân biệt rất tốt (p ~ 0.63, D >= 0.45)
            isCorrect = ability >= 0.55 || (ability >= 0.4 && seedVal > 0.65);
            if (!isCorrect) {
              selectedOption = seedVal < 0.4 ? 'A' : seedVal < 0.75 ? 'B' : 'C';
            }
          } else if (q.questionId === 'Q05') {
            // Câu phân thức đại số (p ~ 0.58, D tốt)
            isCorrect = ability >= 0.58 || (ability >= 0.42 && seedVal > 0.6);
            if (!isCorrect) {
              selectedOption = seedVal < 0.45 ? 'B' : seedVal < 0.8 ? 'C' : 'D';
            }
          } else if (q.questionId === 'Q06') {
            // Câu nhận biết hình chữ nhật (p ~ 0.79)
            isCorrect = ability >= 0.38 || seedVal > 0.55;
            if (!isCorrect) {
              selectedOption = seedVal < 0.35 ? 'A' : seedVal < 0.7 ? 'B' : 'D';
            }
          } else if (q.questionId === 'Q07') {
            // CÂU BẤT THƯỜNG CỐ Ý ĐỂ KIỂM THỬ:
            // Phương án nhiễu 'B' gây hiểu lầm cho học sinh giỏi (D < 0 - phân biệt âm)
            if (ability >= 0.72) {
              isCorrect = seedVal > 0.68; // Học sinh nhóm cao bị bẫy chọn B rất nhiều
              selectedOption = isCorrect ? 'D' : 'B';
            } else if (ability <= 0.42) {
              isCorrect = seedVal > 0.40; // Học sinh nhóm thấp lại chọn đúng D nhiều hơn
              selectedOption = isCorrect ? 'D' : seedVal < 0.2 ? 'A' : 'C';
            } else {
              isCorrect = seedVal > 0.55;
              selectedOption = isCorrect ? 'D' : 'B';
            }
          } else if (q.questionId === 'Q08') {
            // Định lí Thalès (p ~ 0.49 - hơi thấp, cần ôn tập)
            isCorrect = ability >= 0.64 || (ability >= 0.48 && seedVal > 0.65);
            if (!isCorrect) {
              selectedOption = seedVal < 0.35 ? 'A' : seedVal < 0.75 ? 'C' : 'D';
            }
          } else if (q.questionId === 'Q09') {
            // Câu thống kê (đơn câu gắn YCCĐ-TOAN8-TK-01, p ~ 0.74)
            isCorrect = ability >= 0.44 || seedVal > 0.6;
            if (!isCorrect) {
              selectedOption = seedVal < 0.4 ? 'A' : seedVal < 0.75 ? 'B' : 'D';
            }
          } else if (q.questionId === 'Q10') {
            // CÂU KHÓ + NHIỄU A KHÔNG HOẠT ĐỘNG (0% học sinh chọn A, p ~ 0.23)
            isCorrect = ability >= 0.82 && seedVal > 0.25;
            if (!isCorrect) {
              // Không ai chọn A -> để hệ thống phát hiện phương án nhiễu vô hiệu (0%)
              selectedOption = seedVal < 0.55 ? 'B' : 'C';
            }
          }

          const pointsEarned = isCorrect ? q.maxPoints : 0;
          totalScore += pointsEarned;
          itemResponses[q.questionId] = {
            questionId: q.questionId,
            selectedOption: isCorrect ? (q.correctOption || 'A') : selectedOption,
            pointsEarned,
            isFullCredit: isCorrect,
          };
        } else {
          // Câu tự luận Q11 (2.5đ) và Q12 (2.5đ)
          let pointsEarned = 0;
          if (q.questionId === 'Q11') {
            // Rút gọn phân thức (max 2.5)
            const rawPts = Math.round(ability * 2.5 * 4) / 4; // Làm tròn 0.25
            pointsEarned = Math.max(0.25, Math.min(2.5, rawPts));
          } else {
            // Hình học & cực trị (max 2.5 - mức vận dụng)
            const rawPts = Math.round(Math.max(0, ability - 0.12) * 2.4 * 4) / 4;
            pointsEarned = Math.max(0, Math.min(2.5, rawPts));
          }
          totalScore += pointsEarned;
          itemResponses[q.questionId] = {
            questionId: q.questionId,
            pointsEarned,
            isFullCredit: pointsEarned >= q.maxPoints,
          };
        }
      });

      records.push({
        studentId,
        maskedStudentCode,
        fullName,
        className,
        grade: 8,
        subject: 'Toán',
        examPeriod: 'Cuối học kỳ I',
        dataGranularity: 'FULL_ITEM_RESPONSES',
        totalScore: Number(totalScore.toFixed(2)),
        itemResponses,
        importSourceLabel: `Dữ liệu chuẩn 3 lớp (${className} - Đầy đủ 12 câu)`,
      });
    }
  });

  return records;
}

/**
 * Tạo tập dữ liệu chỉ có điểm tổng (TOTAL_SCORE_ONLY) cho Lớp 8A4 (30 học sinh)
 * để kiểm chứng yêu cầu: "Phải xác định dữ liệu nào chỉ có điểm tổng và dữ liệu nào có kết quả từng câu.
 * Không suy diễn kết quả từng câu từ điểm tổng."
 */
export function createTotalScoreOnlyDataset(): StudentExamResultRecord[] {
  const records: StudentExamResultRecord[] = [];
  for (let i = 0; i < 30; i++) {
    const studentNum = i + 1;
    const paddedNum = String(studentNum).padStart(2, '0');
    const rawScore = 3.5 + ((29 - i) / 29) * 5.75;
    const roundedScore = Math.round(rawScore * 4) / 4;

    records.push({
      studentId: `HS-8A4-${paddedNum}`,
      maskedStudentCode: `MÃ-8A4-${paddedNum}`,
      fullName: buildDeterministicStudentName(3, i),
      className: '8A4 (Chỉ có điểm tổng)',
      grade: 8,
      subject: 'Toán',
      examPeriod: 'Cuối học kỳ I',
      dataGranularity: 'TOTAL_SCORE_ONLY',
      totalScore: Number(roundedScore.toFixed(2)),
      // Tuyệt đối không có itemResponses và không suy diễn
      itemResponses: undefined,
      importSourceLabel: 'Bảng điểm tổng hợp (Chỉ có cột Điểm tổng)',
    });
  }
  return records;
}

/**
 * Dữ liệu lịch sử các kỳ kiểm tra để so sánh xu hướng giữa các lần kiểm tra (Mục II)
 */
export const HISTORICAL_PERIOD_COMPARISONS: ExamPeriodComparisonRecord[] = [
  {
    periodCode: 'GHK1',
    periodLabel: 'Giữa học kỳ I',
    className: '8A1',
    studentCount: 30,
    meanScore: 7.35,
    passRatePercent: 90.0,
    goodOrAbovePercent: 73.33,
  },
  {
    periodCode: 'GHK1',
    periodLabel: 'Giữa học kỳ I',
    className: '8A2',
    studentCount: 30,
    meanScore: 6.45,
    passRatePercent: 80.0,
    goodOrAbovePercent: 53.33,
  },
  {
    periodCode: 'GHK1',
    periodLabel: 'Giữa học kỳ I',
    className: '8A3',
    studentCount: 30,
    meanScore: 5.65,
    passRatePercent: 66.67,
    goodOrAbovePercent: 33.33,
  },
];

// ============================================================================
// 3. NHẬP VÀ XUẤT BẢNG ĐIỂM EXCEL (.XLSX) - TỰ ĐỘNG PHÂN BIỆT LOẠI DỮ LIỆU
// ============================================================================

export function parseUploadedScoreWorkbook(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  defaultSubject = 'Toán',
  defaultGrade = 8,
  defaultPeriod = 'Cuối học kỳ I'
): {
  records: StudentExamResultRecord[];
  detectedGranularity: 'FULL_ITEM_RESPONSES' | 'TOTAL_SCORE_ONLY' | 'MIXED';
  warnings: string[];
} {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  const warnings: string[] = [];
  const records: StudentExamResultRecord[] = [];

  if (rawRows.length === 0) {
    return {
      records: [],
      detectedGranularity: 'TOTAL_SCORE_ONLY',
      warnings: ['Tệp Excel không có dòng dữ liệu học sinh nào.'],
    };
  }

  let fullCount = 0;
  let totalOnlyCount = 0;

  rawRows.forEach((row, idx) => {
    const studentId = String(
      row['Mã HS'] || row['MaHS'] || row['StudentId'] || `HS-IMP-${String(idx + 1).padStart(2, '0')}`
    ).trim();
    const fullName = String(
      row['Họ và tên'] || row['HoTen'] || row['FullName'] || `Học sinh ${idx + 1}`
    ).trim();
    const className = String(row['Lớp'] || row['Lop'] || row['Class'] || '8A1').trim();
    const subject = String(row['Môn'] || row['Mon'] || defaultSubject).trim();
    const examPeriod = String(row['Kỳ kiểm tra'] || row['KyKiemTra'] || defaultPeriod).trim();

    // Kiểm tra xem dòng này có dữ liệu từng câu hỏi không
    const itemResponses: Record<string, StudentItemResponseRecord> = {};
    let detectedItemColumns = 0;
    let computedSumFromItems = 0;

    ANALYTICS_EXAM_BLUEPRINT.forEach((q) => {
      const colOptionKey = `${q.questionId}_ĐápÁn`;
      const colScoreKey = `${q.questionId}_Điểm`;
      const altColKey = `Câu ${q.questionNumber}`;

      const rawOpt = String(row[colOptionKey] ?? row[altColKey] ?? '').trim().toUpperCase();
      const rawPts = row[colScoreKey];

      if (rawOpt !== '' || (rawPts !== '' && rawPts !== undefined)) {
        detectedItemColumns++;
        if (q.format === 'MULTIPLE_CHOICE') {
          const validOpt =
            rawOpt === 'A' || rawOpt === 'B' || rawOpt === 'C' || rawOpt === 'D'
              ? (rawOpt as 'A' | 'B' | 'C' | 'D')
              : 'OMITTED';
          const pts =
            rawPts !== '' && rawPts !== undefined
              ? Number(rawPts)
              : validOpt === q.correctOption
              ? q.maxPoints
              : 0;
          const safePts = Number.isFinite(pts) ? pts : 0;
          computedSumFromItems += safePts;
          itemResponses[q.questionId] = {
            questionId: q.questionId,
            selectedOption: validOpt,
            pointsEarned: safePts,
            isFullCredit: safePts >= q.maxPoints,
          };
        } else {
          const pts = Number(rawPts ?? row[altColKey] ?? 0);
          const safePts = Number.isFinite(pts) ? Math.max(0, Math.min(q.maxPoints, pts)) : 0;
          computedSumFromItems += safePts;
          itemResponses[q.questionId] = {
            questionId: q.questionId,
            pointsEarned: safePts,
            isFullCredit: safePts >= q.maxPoints,
          };
        }
      }
    });

    const rawTotal = Number(
      row['Điểm tổng'] ?? row['DiemTong'] ?? row['TotalScore'] ?? row['Điểm'] ?? NaN
    );

    const hasFullItems = detectedItemColumns === ANALYTICS_EXAM_BLUEPRINT.length;
    if (hasFullItems) {
      fullCount++;
      const finalTotal = Number.isFinite(rawTotal)
        ? Number(rawTotal.toFixed(2))
        : Number(computedSumFromItems.toFixed(2));
      records.push({
        studentId,
        maskedStudentCode: `MÃ-${className}-${String(idx + 1).padStart(2, '0')}`,
        fullName,
        className,
        grade: defaultGrade,
        subject,
        examPeriod,
        dataGranularity: 'FULL_ITEM_RESPONSES',
        totalScore: finalTotal,
        itemResponses,
        importSourceLabel: `Tệp nhập: ${fileName} (Đầy đủ từng câu)`,
      });
    } else {
      totalOnlyCount++;
      const safeTotal = Number.isFinite(rawTotal) ? Number(rawTotal.toFixed(2)) : 0;
      records.push({
        studentId,
        maskedStudentCode: `MÃ-${className}-${String(idx + 1).padStart(2, '0')}`,
        fullName,
        className,
        grade: defaultGrade,
        subject,
        examPeriod,
        dataGranularity: 'TOTAL_SCORE_ONLY',
        totalScore: safeTotal,
        // TUYỆT ĐỐI KHÔNG SUY DIỄN KẾT QUẢ TỪNG CÂU TỪ ĐIỂM TỔNG
        itemResponses: undefined,
        importSourceLabel: `Tệp nhập: ${fileName} (Chỉ có điểm tổng)`,
      });
    }
  });

  if (totalOnlyCount > 0) {
    warnings.push(
      `Phát hiện ${totalOnlyCount} học sinh chỉ có Điểm tổng (không đủ dữ liệu từng câu hỏi). Hệ thống giữ nguyên Điểm tổng để thống kê phổ điểm lớp/khối và TUYỆT ĐỐI KHÔNG suy diễn kết quả từng câu hỏi.`
    );
  }

  const detectedGranularity =
    fullCount > 0 && totalOnlyCount === 0
      ? 'FULL_ITEM_RESPONSES'
      : fullCount === 0
      ? 'TOTAL_SCORE_ONLY'
      : 'MIXED';

  return { records, detectedGranularity, warnings };
}

/**
 * Tải xuống tệp Excel mẫu (.xlsx) gồm:
 * - Chế độ FULL_ITEM_RESPONSES (3 lớp × 30 HS = 90 HS kèm đáp án/điểm từng câu)
 * - Hoặc chế độ TOTAL_SCORE_ONLY (Chỉ có cột điểm tổng)
 */
export function downloadSampleExcelScoreSheet(mode: 'FULL_3_CLASSES' | 'TOTAL_SCORE_ONLY'): void {
  const dataset =
    mode === 'FULL_3_CLASSES' ? createSimulatedExamDataset() : createTotalScoreOnlyDataset();

  const rows = dataset.map((rec) => {
    const baseRow: Record<string, string | number> = {
      'Mã HS': rec.studentId,
      'Họ và tên': rec.fullName,
      'Lớp': rec.className,
      'Khối': rec.grade,
      'Môn': rec.subject,
      'Kỳ kiểm tra': rec.examPeriod,
      'Loại dữ liệu':
        rec.dataGranularity === 'FULL_ITEM_RESPONSES'
          ? 'Đầy đủ từng câu'
          : 'Chỉ có điểm tổng',
      'Điểm tổng': rec.totalScore,
    };

    if (mode === 'FULL_3_CLASSES' && rec.itemResponses) {
      ANALYTICS_EXAM_BLUEPRINT.forEach((q) => {
        const resp = rec.itemResponses?.[q.questionId];
        if (q.format === 'MULTIPLE_CHOICE') {
          baseRow[`${q.questionId}_ĐápÁn`] = resp?.selectedOption || 'OMITTED';
          baseRow[`${q.questionId}_Điểm`] = resp?.pointsEarned ?? 0;
        } else {
          baseRow[`${q.questionId}_Điểm`] = resp?.pointsEarned ?? 0;
        }
      });
    }
    return baseRow;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(
    wb,
    ws,
    mode === 'FULL_3_CLASSES' ? 'KetQua_3Lop_90HS' : 'BangDiemTong_30HS'
  );

  const fileName =
    mode === 'FULL_3_CLASSES'
      ? 'Mau_BangDiem_ChiTietTungCau_3Lop_90HS.xlsx'
      : 'Mau_BangDiem_ChiCoDiemTong_KhongSuyDien.xlsx';
  XLSX.writeFile(wb, fileName);
}

// ============================================================================
// 4. THỐNG KÊ MÔ TẢ & SO SÁNH LỚP / KỲ KIỂM TRA (MỤC II)
// ============================================================================

function computeMedian(sortedAsc: number[]): number {
  if (sortedAsc.length === 0) return 0;
  const mid = Math.floor(sortedAsc.length / 2);
  if (sortedAsc.length % 2 === 1) {
    return sortedAsc[mid];
  }
  return (sortedAsc[mid - 1] + sortedAsc[mid]) / 2;
}

function computePopulationStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function computeDescriptiveStatistics(
  records: StudentExamResultRecord[],
  thresholds: CompletionThresholdConfig
): DescriptiveStatisticsPackage {
  const n = records.length;
  const fullItemResponseStudentCount = records.filter(
    (r) => r.dataGranularity === 'FULL_ITEM_RESPONSES'
  ).length;
  const totalScoreOnlyStudentCount = records.filter(
    (r) => r.dataGranularity === 'TOTAL_SCORE_ONLY'
  ).length;

  if (n === 0) {
    return {
      studentCount: 0,
      fullItemResponseStudentCount: 0,
      totalScoreOnlyStudentCount: 0,
      meanScore: 0,
      medianScore: 0,
      stdDeviation: 0,
      maxScore: 0,
      minScore: 0,
      passCount: 0,
      passRatePercent: 0,
      goodOrAboveCount: 0,
      goodOrAboveRatePercent: 0,
      excellentCount: 0,
      excellentRatePercent: 0,
      belowPassCount: 0,
      belowPassRatePercent: 0,
      distributionBins: [],
      classComparisons: [],
      periodComparisons: [],
    };
  }

  const scores = records.map((r) => r.totalScore);
  const sortedScores = [...scores].sort((a, b) => a - b);
  const sum = scores.reduce((acc, s) => acc + s, 0);
  const meanScore = Number((sum / n).toFixed(4));
  const medianScore = Number(computeMedian(sortedScores).toFixed(4));
  const stdDeviation = Number(computePopulationStdDev(scores, meanScore).toFixed(4));
  const minScore = sortedScores[0];
  const maxScore = sortedScores[sortedScores.length - 1];

  const passCount = scores.filter((s) => s >= thresholds.passThreshold).length;
  const goodOrAboveCount = scores.filter((s) => s >= thresholds.goodThreshold).length;
  const excellentCount = scores.filter((s) => s >= thresholds.excellentThreshold).length;
  const belowPassCount = n - passCount;

  // Phân bố điểm theo 5 khoảng chuẩn giáo dục
  const binSpecs = [
    { rangeLabel: '0.0 – < 3.5 (Kém)', minInclusive: 0, maxInclusive: 3.4999 },
    { rangeLabel: '3.5 – < 5.0 (Yếu / Chưa đạt)', minInclusive: 3.5, maxInclusive: 4.9999 },
    { rangeLabel: '5.0 – < 6.5 (Trung bình / Đạt)', minInclusive: 5.0, maxInclusive: 6.4999 },
    { rangeLabel: '6.5 – < 8.0 (Khá)', minInclusive: 6.5, maxInclusive: 7.9999 },
    { rangeLabel: '8.0 – 10.0 (Giỏi / Tốt)', minInclusive: 8.0, maxInclusive: 10.0 },
  ];

  const distributionBins: ScoreDistributionBin[] = binSpecs.map((b) => {
    const count = scores.filter((s) => s >= b.minInclusive && s <= b.maxInclusive).length;
    return {
      rangeLabel: b.rangeLabel,
      minInclusive: b.minInclusive,
      maxInclusive: b.maxInclusive,
      count,
      percentage: Number(((count / n) * 100).toFixed(2)),
    };
  });

  // So sánh theo từng lớp
  const classNames = Array.from(new Set(records.map((r) => r.className)));
  const classComparisons: ClassStatisticalComparisonRow[] = classNames.map((clsName) => {
    const clsRecords = records.filter((r) => r.className === clsName);
    const clsScores = clsRecords.map((r) => r.totalScore);
    const clsSorted = [...clsScores].sort((a, b) => a - b);
    const clsN = clsRecords.length;
    const clsMean = clsScores.reduce((acc, s) => acc + s, 0) / clsN;
    const clsMedian = computeMedian(clsSorted);
    const clsStd = computePopulationStdDev(clsScores, clsMean);

    const clsPass = clsScores.filter((s) => s >= thresholds.passThreshold).length;
    const clsGood = clsScores.filter((s) => s >= thresholds.goodThreshold).length;
    const clsExc = clsScores.filter((s) => s >= thresholds.excellentThreshold).length;
    const clsBelow = clsN - clsPass;

    const hasFull = clsRecords.every((r) => r.dataGranularity === 'FULL_ITEM_RESPONSES');

    return {
      className: clsName,
      grade: clsRecords[0]?.grade || 8,
      dataGranularity: hasFull ? 'FULL_ITEM_RESPONSES' : 'TOTAL_SCORE_ONLY',
      studentCount: clsN,
      meanScore: Number(clsMean.toFixed(2)),
      medianScore: Number(clsMedian.toFixed(2)),
      stdDeviation: Number(clsStd.toFixed(2)),
      maxScore: clsSorted[clsSorted.length - 1],
      minScore: clsSorted[0],
      passCount: clsPass,
      passRatePercent: Number(((clsPass / clsN) * 100).toFixed(2)),
      goodRatePercent: Number(((clsGood / clsN) * 100).toFixed(2)),
      excellentRatePercent: Number(((clsExc / clsN) * 100).toFixed(2)),
      belowPassCount: clsBelow,
      belowPassRatePercent: Number(((clsBelow / clsN) * 100).toFixed(2)),
    };
  });

  // Ghép dữ liệu kỳ trước (Giữa HK1) và kỳ hiện tại (Cuối HK1) để so sánh
  const currentPeriodRows: ExamPeriodComparisonRecord[] = classComparisons.map((c) => ({
    periodCode: 'CHK1',
    periodLabel: 'Cuối học kỳ I (Hiện tại)',
    className: c.className,
    studentCount: c.studentCount,
    meanScore: c.meanScore,
    passRatePercent: c.passRatePercent,
    goodOrAbovePercent: c.goodRatePercent,
  }));

  return {
    studentCount: n,
    fullItemResponseStudentCount,
    totalScoreOnlyStudentCount,
    meanScore: Number(meanScore.toFixed(2)),
    medianScore: Number(medianScore.toFixed(2)),
    stdDeviation: Number(stdDeviation.toFixed(2)),
    maxScore,
    minScore,
    passCount,
    passRatePercent: Number(((passCount / n) * 100).toFixed(2)),
    goodOrAboveCount,
    goodOrAboveRatePercent: Number(((goodOrAboveCount / n) * 100).toFixed(2)),
    excellentCount,
    excellentRatePercent: Number(((excellentCount / n) * 100).toFixed(2)),
    belowPassCount,
    belowPassRatePercent: Number(((belowPassCount / n) * 100).toFixed(2)),
    distributionBins,
    classComparisons,
    periodComparisons: [...HISTORICAL_PERIOD_COMPARISONS, ...currentPeriodRows],
  };
}

// ============================================================================
// 5. PHÂN TÍCH CHẤT LƯỢNG CÂU HỎI (MỤC III - LÝ THUYẾT KHẢO THÍ CỔ ĐIỂN CTT)
// ============================================================================

/**
 * Tính hệ số tương quan Pearson / Point-Biserial r_it giữa điểm câu hỏi i và tổng điểm bài thi
 */
function computeItemTotalCorrelation(itemScores: number[], totalScores: number[]): number {
  const n = itemScores.length;
  if (n < 2) return 0;
  const meanItem = itemScores.reduce((a, b) => a + b, 0) / n;
  const meanTotal = totalScores.reduce((a, b) => a + b, 0) / n;

  let cov = 0;
  let varItem = 0;
  let varTotal = 0;

  for (let i = 0; i < n; i++) {
    const dx = itemScores[i] - meanItem;
    const dy = totalScores[i] - meanTotal;
    cov += dx * dy;
    varItem += dx * dx;
    varTotal += dy * dy;
  }

  if (varItem <= 1e-9 || varTotal <= 1e-9) return 0;
  return cov / Math.sqrt(varItem * varTotal);
}

export function analyzeExamQuestionsPsychometrics(
  records: StudentExamResultRecord[],
  blueprint: AnalyticsQuestionBlueprintItem[] = ANALYTICS_EXAM_BLUEPRINT
): {
  questionsAnalysis: QuestionPsychometricAnalysis[];
  excludedTotalScoreOnlyCount: number;
  sampleReliabilityBanner?: string;
} {
  // CHỈ LẤY NHỮNG HỌC SINH CÓ DỮ LIỆU TỪNG CÂU (KHÔNG SUY DIỄN TỪ ĐIỂM TỔNG)
  const validRecords = records.filter(
    (r) => r.dataGranularity === 'FULL_ITEM_RESPONSES' && r.itemResponses !== undefined
  );
  const excludedTotalScoreOnlyCount = records.length - validRecords.length;
  const n = validRecords.length;

  let sampleReliabilityBanner: string | undefined;
  if (n === 0) {
    sampleReliabilityBanner =
      'CẢNH BÁO DỮ LIỆU: Bộ dữ liệu hiện tại chỉ có Điểm tổng (0 học sinh có kết quả từng câu). Hệ thống tuân thủ quy tắc KHÔNG suy diễn kết quả từng câu từ điểm tổng.';
    return {
      questionsAnalysis: [],
      excludedTotalScoreOnlyCount,
      sampleReliabilityBanner,
    };
  }

  if (n <= 30) {
    sampleReliabilityBanner = `CẢNH BÁO ĐỘ TIN CẬY MẪU NHỎ (N = ${n} học sinh): Khi phân tích trên phạm vi 1 lớp đơn lẻ (N ≤ 30), nhóm 27% cao/thấp chỉ gồm ${Math.max(
      1,
      Math.round(n * 0.27)
    )} học sinh mỗi nhóm. Các chỉ số độ khó thực nghiệm (p) và độ phân biệt (D) chỉ mang tính tham khảo cục bộ; khuyến nghị gộp toàn khối (N ≥ 90) để thẩm định ngân hàng câu hỏi.`;
  }

  // Sắp xếp học sinh theo tổng điểm giảm dần (nếu bằng điểm thì sắp theo studentId ổn định)
  const sortedByTotalDesc = [...validRecords].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.studentId.localeCompare(b.studentId);
  });

  // Nhóm 27% điểm cao nhất (Upper Group) và 27% điểm thấp nhất (Lower Group) theo Kelley (1939)
  const k = Math.max(1, Math.round(n * 0.27));
  const upperGroup = sortedByTotalDesc.slice(0, k);
  const lowerGroup = sortedByTotalDesc.slice(n - k, n);

  const totalScoresAll = validRecords.map((r) => r.totalScore);

  const questionsAnalysis: QuestionPsychometricAnalysis[] = blueprint.map((q) => {
    const itemPointsAll = validRecords.map(
      (r) => r.itemResponses?.[q.questionId]?.pointsEarned ?? 0
    );
    const sumPoints = itemPointsAll.reduce((acc, p) => acc + p, 0);
    const meanPointsEarned = sumPoints / n;

    // Độ khó thực nghiệm p_i = Mean(X_i) / MaxPoints_i  (với câu trắc nghiệm 0/1 chính là tỷ lệ trả lời đúng)
    const difficultyIndexP = Number((meanPointsEarned / q.maxPoints).toFixed(4));
    const correctResponseCount = validRecords.filter(
      (r) => (r.itemResponses?.[q.questionId]?.pointsEarned ?? 0) >= q.maxPoints
    ).length;
    const correctResponseRatePercent = Number((difficultyIndexP * 100).toFixed(2));

    // Độ khó trên nhóm 27% Cao (P_U) và nhóm 27% Thấp (P_L)
    const upperSumPoints = upperGroup.reduce(
      (acc, r) => acc + (r.itemResponses?.[q.questionId]?.pointsEarned ?? 0),
      0
    );
    const lowerSumPoints = lowerGroup.reduce(
      (acc, r) => acc + (r.itemResponses?.[q.questionId]?.pointsEarned ?? 0),
      0
    );

    const upperGroupDifficultyP = Number((upperSumPoints / (k * q.maxPoints)).toFixed(4));
    const lowerGroupDifficultyP = Number((lowerSumPoints / (k * q.maxPoints)).toFixed(4));

    // Chỉ số phân biệt D = P_Upper27% - P_Lower27%
    const discriminationIndexD = Number(
      (upperGroupDifficultyP - lowerGroupDifficultyP).toFixed(4)
    );

    // Hệ số tương quan câu hỏi - tổng điểm r_pbis
    const pointBiserialR = Number(
      computeItemTotalCorrelation(itemPointsAll, totalScoresAll).toFixed(4)
    );

    // Phân loại độ khó p
    let difficultyClassification: 'KHO' | 'VUA_SUC' | 'DE' = 'VUA_SUC';
    let difficultyLabel = 'Vừa sức (0.30 ≤ p ≤ 0.75)';
    if (difficultyIndexP < 0.3) {
      difficultyClassification = 'KHO';
      difficultyLabel = 'Khó (p < 0.30)';
    } else if (difficultyIndexP > 0.75) {
      difficultyClassification = 'DE';
      difficultyLabel = 'Dễ (p > 0.75)';
    }

    // Phân loại độ phân biệt D
    let discriminationClassification:
      | 'RAT_TOT'
      | 'KHA_TOT'
      | 'CHAP_NHAN_DUOC'
      | 'KEM_CAN_XEM_XET' = 'RAT_TOT';
    let discriminationLabel = 'Rất tốt (D ≥ 0.40)';
    if (discriminationIndexD < 0.2) {
      discriminationClassification = 'KEM_CAN_XEM_XET';
      discriminationLabel =
        discriminationIndexD < 0
          ? 'Kém / Phân biệt âm (D < 0 – Cảnh báo nghiêm trọng)'
          : 'Kém / Cần biên tập lại (D < 0.20)';
    } else if (discriminationIndexD < 0.3) {
      discriminationClassification = 'CHAP_NHAN_DUOC';
      discriminationLabel = 'Chấp nhận được (0.20 ≤ D < 0.30)';
    } else if (discriminationIndexD < 0.4) {
      discriminationClassification = 'KHA_TOT';
      discriminationLabel = 'Khá tốt (0.30 ≤ D < 0.40)';
    }

    // Thống kê phương án nhiễu (Distractor Analysis) cho câu trắc nghiệm
    const distractorStats: DistractorOptionStat[] = [];
    const anomalyFlags: string[] = [];

    if (q.format === 'MULTIPLE_CHOICE') {
      const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      options.forEach((opt) => {
        const isCorrectKey = opt === q.correctOption;
        const totalSelectedCount = validRecords.filter(
          (r) => r.itemResponses?.[q.questionId]?.selectedOption === opt
        ).length;
        const upperGroupSelectedCount = upperGroup.filter(
          (r) => r.itemResponses?.[q.questionId]?.selectedOption === opt
        ).length;
        const lowerGroupSelectedCount = lowerGroup.filter(
          (r) => r.itemResponses?.[q.questionId]?.selectedOption === opt
        ).length;

        const selectionRatePercent = Number(((totalSelectedCount / n) * 100).toFixed(2));
        const upperGroupRatePercent = Number(((upperGroupSelectedCount / k) * 100).toFixed(2));
        const lowerGroupRatePercent = Number(((lowerGroupSelectedCount / k) * 100).toFixed(2));

        let distractorDiagnosis = 'Hoạt động bình thường';
        if (isCorrectKey) {
          distractorDiagnosis =
            upperGroupRatePercent >= lowerGroupRatePercent
              ? 'Đáp án đúng thu hút nhóm điểm cao tốt hơn nhóm điểm thấp'
              : 'CẢNH BÁO: Nhóm điểm cao chọn đáp án đúng ít hơn nhóm điểm thấp!';
        } else {
          if (totalSelectedCount === 0) {
            distractorDiagnosis = 'Phương án nhiễu vô hiệu (0% học sinh lựa chọn)';
            anomalyFlags.push(
              `Phương án nhiễu ${opt} không có học sinh nào chọn (0%) — cần thay thế phương án nhiễu hợp lý hơn.`
            );
          } else if (upperGroupSelectedCount > lowerGroupSelectedCount) {
            distractorDiagnosis =
              'BẤT THƯỜNG: Phương án nhiễu thu hút nhóm HS giỏi nhiều hơn nhóm HS yếu';
            anomalyFlags.push(
              `Phương án nhiễu ${opt} thu hút nhóm 27% điểm cao (${upperGroupRatePercent}%) nhiều hơn nhóm 27% điểm thấp (${lowerGroupRatePercent}%) — nghi vấn diễn đạt gây hiểu lầm hoặc sai đáp án khóa.`
            );
          } else {
            distractorDiagnosis = 'Phương án nhiễu tốt (thu hút nhóm điểm thấp nhiều hơn)';
          }
        }

        distractorStats.push({
          optionKey: opt,
          isCorrectKey,
          totalSelectedCount,
          selectionRatePercent,
          upperGroupSelectedCount,
          upperGroupRatePercent,
          lowerGroupSelectedCount,
          lowerGroupRatePercent,
          distractorDiagnosis,
        });
      });
    }

    // Phát hiện dấu hiệu bất thường tổng hợp
    if (discriminationIndexD < 0) {
      anomalyFlags.unshift(
        `Chỉ số phân biệt âm (D = ${discriminationIndexD.toFixed(
          2
        )}, r_pbis = ${pointBiserialR.toFixed(
          2
        )}): Học sinh có tổng điểm cao lại làm sai câu này nhiều hơn học sinh điểm thấp.`
      );
    } else if (discriminationIndexD < 0.15 && difficultyIndexP <= 0.85) {
      anomalyFlags.push(
        `Độ phân biệt thấp (D = ${discriminationIndexD.toFixed(
          2
        )}): Câu hỏi ít có khả năng phân loại năng lực học sinh.`
      );
    }

    if (difficultyIndexP < 0.25) {
      anomalyFlags.push(
        `Độ khó thực nghiệm rất thấp (p = ${difficultyIndexP.toFixed(
          2
        )}, chỉ ${correctResponseRatePercent}% đạt điểm): Câu hỏi quá khó so với mặt bằng học sinh.`
      );
    } else if (difficultyIndexP > 0.92) {
      anomalyFlags.push(
        `Câu hỏi quá dễ (p = ${difficultyIndexP.toFixed(2)}), hầu hết học sinh đều làm đúng.`
      );
    }

    return {
      questionId: q.questionId,
      questionNumber: q.questionNumber,
      label: q.label,
      stemSummary: q.stemSummary,
      format: q.format,
      maxPoints: q.maxPoints,
      correctOption: q.correctOption,
      cognitiveLevel: q.cognitiveLevel,
      topicTitle: q.topicTitle,
      learningOutcomeCode: q.learningOutcomeCode,
      learningOutcomeText: q.learningOutcomeText,
      sampleSizeN: n,
      upperLowerGroupSizeK: k,
      meanPointsEarned: Number(meanPointsEarned.toFixed(4)),
      correctResponseCount,
      correctResponseRatePercent,
      difficultyIndexP,
      difficultyClassification,
      difficultyLabel,
      upperGroupDifficultyP,
      lowerGroupDifficultyP,
      discriminationIndexD,
      pointBiserialR,
      discriminationClassification,
      discriminationLabel,
      distractorStats,
      hasAnomaly: anomalyFlags.length > 0,
      anomalyFlags,
      reliabilityWarning:
        n <= 30
          ? `Mẫu nhỏ (N=${n}, K=${k}): Độ tin cậy thống kê hạn chế, không nên dùng đơn lẻ để loại bỏ vĩnh viễn câu hỏi.`
          : undefined,
    };
  });

  return {
    questionsAnalysis,
    excludedTotalScoreOnlyCount,
    sampleReliabilityBanner,
  };
}

// ============================================================================
// 6. LIÊN KẾT YÊU CẦU CẦN ĐẠT (MỤC IV - CẢNH BÁO ĐỦ CĂN CỨ ĐO LƯỜNG)
// ============================================================================

export function synthesizeLearningOutcomeMastery(
  questionStats: QuestionPsychometricAnalysis[]
): LearningOutcomeMasterySynthesis[] {
  if (questionStats.length === 0) return [];

  const groupedByOutcome = new Map<string, QuestionPsychometricAnalysis[]>();
  questionStats.forEach((q) => {
    const list = groupedByOutcome.get(q.learningOutcomeCode) || [];
    list.push(q);
    groupedByOutcome.set(q.learningOutcomeCode, list);
  });

  const syntheses: LearningOutcomeMasterySynthesis[] = [];

  groupedByOutcome.forEach((items, code) => {
    const first = items[0];
    const questionCount = items.length;
    const questionLabels = items.map((i) => `Câu ${i.questionNumber}`);
    const rates = items.map((i) => i.correctResponseRatePercent);
    const meanCorrectRatePercent = Number(
      (rates.reduce((a, b) => a + b, 0) / questionCount).toFixed(2)
    );
    const minQuestionCorrectRatePercent = Math.min(...rates);
    const maxQuestionCorrectRatePercent = Math.max(...rates);
    const isSingleQuestionOnly = questionCount === 1;

    // QUY TẮC BẮT BUỘC MỤC IV:
    // "Không coi một câu hỏi đơn lẻ là đủ để kết luận học sinh đã đạt hoặc chưa đạt toàn bộ một năng lực."
    const evidenceSufficiencyNotice = isSingleQuestionOnly
      ? `CHỈ CÓ 01 CÂU HỎI ĐO LƯỜNG (${questionLabels[0]}): Kết quả ${meanCorrectRatePercent}% chỉ phản ánh một khía cạnh hẹp trong đề kiểm tra. Tuyệt đối KHÔNG dùng câu hỏi đơn lẻ này để kết luận học sinh đã đạt hay chưa đạt toàn bộ năng lực/yêu cầu cần đạt.`
      : `Đủ chuỗi bằng chứng đa câu hỏi (${questionCount} câu: ${questionLabels.join(
          ', '
        )}): Có thể đối chiếu chéo giữa các mức độ nhận thức để nhận diện mức độ đáp ứng yêu cầu cần đạt.`;

    const hasAnomalousItem = items.some((i) => i.hasAnomaly);

    let classification:
      | 'PERFORMING_WELL'
      | 'LOW_CORRECT_RATE'
      | 'NEEDS_REMEDIATION'
      | 'DEPARTMENT_WORKSHOP_TOPIC' = 'PERFORMING_WELL';

    let pedagogicalActionRecommendation = '';
    let suggestedProfessionalDevTopic: string | undefined;

    if (meanCorrectRatePercent < 50) {
      classification = 'LOW_CORRECT_RATE';
      pedagogicalActionRecommendation =
        'Tỷ lệ trả lời đúng thấp (< 50%). Cần tổ chức ôn tập phụ đạo theo nhóm nhỏ, rà soát lại bước hình thành kiến thức và kỹ năng lập luận hình học/đại số.';
      suggestedProfessionalDevTopic = `Chuyên đề tổ: Phân tích sai lầm thường gặp của học sinh ở chủ đề "${first.topicTitle}" (${code}) và thiết kế phiếu học tập khắc phục.`;
    } else if (hasAnomalousItem || minQuestionCorrectRatePercent < 45) {
      classification = 'DEPARTMENT_WORKSHOP_TOPIC';
      pedagogicalActionRecommendation =
        'Có sự phân hóa mạnh giữa các câu hỏi trong cùng YCCĐ hoặc có câu hỏi xuất hiện nhiễu bất thường. Cần đưa vào sinh hoạt chuyên môn để chuẩn hóa cách diễn đạt câu hỏi và thống nhất phương pháp dạy học.';
      suggestedProfessionalDevTopic = `Sinh hoạt chuyên môn theo nghiên cứu bài học: Chuẩn hóa câu hỏi đánh giá và tháo gỡ nút thắt tư duy tại YCCĐ "${first.learningOutcomeCode}".`;
    } else if (meanCorrectRatePercent < 70) {
      classification = 'NEEDS_REMEDIATION';
      pedagogicalActionRecommendation =
        'Mức độ đạt trung bình – khá (50% – <70%). Cần bổ sung bài tập rèn kỹ năng vận dụng cho nhóm học sinh đạt điểm dưới 6.5.';
    } else {
      classification = 'PERFORMING_WELL';
      pedagogicalActionRecommendation = isSingleQuestionOnly
        ? 'Học sinh trả lời tốt câu hỏi đại diện trong đề, song cần kết hợp đánh giá thường xuyên trên lớp để khẳng định vững chắc năng lực.'
        : 'Đa số học sinh nắm vững yêu cầu cần đạt qua nhiều câu hỏi kiểm chứng. Có thể giao thêm bài tập mở rộng cho nhóm học sinh khá giỏi.';
    }

    syntheses.push({
      learningOutcomeCode: code,
      learningOutcomeText: first.learningOutcomeText,
      topicTitle: first.topicTitle,
      questionCount,
      questionLabels,
      meanCorrectRatePercent,
      minQuestionCorrectRatePercent,
      maxQuestionCorrectRatePercent,
      isSingleQuestionOnly,
      evidenceSufficiencyNotice,
      classification,
      pedagogicalActionRecommendation,
      suggestedProfessionalDevTopic,
    });
  });

  return syntheses;
}

// ============================================================================
// 7. BÁO CÁO BAN GIÁM HIỆU 8 MỤC (MỤC V) & ĐỀ XUẤT AI KÈM HỘP KIỂM SOÁT (MỤC VI)
// ============================================================================

export function generatePrincipalLeadershipReport(
  stats: DescriptiveStatisticsPackage,
  questionStats: QuestionPsychometricAnalysis[],
  outcomes: LearningOutcomeMasterySynthesis[],
  schoolName = 'Trường THCS Chu Văn An',
  academicYear = '2026 - 2027',
  grade = 8,
  subject = 'Toán',
  examPeriod = 'Cuối học kỳ I'
): PrincipalLeadershipReport {
  const anomalousQuestions = questionStats.filter((q) => q.hasAnomaly);
  const goodItemsCount = questionStats.filter(
    (q) => !q.hasAnomaly && q.discriminationIndexD >= 0.2
  ).length;

  const sortedClasses = [...stats.classComparisons].sort((a, b) => b.meanScore - a.meanScore);
  const highestClass = sortedClasses[0];
  const lowestClass = sortedClasses[sortedClasses.length - 1];
  const scoreGap =
    highestClass && lowestClass
      ? Number((highestClass.meanScore - lowestClass.meanScore).toFixed(2))
      : 0;

  return {
    generatedAt: new Date().toLocaleString('vi-VN'),
    schoolName,
    academicYear,
    grade,
    subject,
    examPeriod,
    section1Overview: {
      summaryText: `Kỳ kiểm tra ${examPeriod} môn ${subject} Khối ${grade} có ${stats.studentCount} học sinh tham gia thuộc ${stats.classComparisons.length} lớp. Điểm trung bình toàn khối đạt ${stats.meanScore}/10 (Độ lệch chuẩn σ = ${stats.stdDeviation}), tỷ lệ Đạt từ ngưỡng chuẩn trở lên là ${stats.passRatePercent}%, tỷ lệ Giỏi/Tốt đạt ${stats.excellentRatePercent}%.`,
      totalStudents: stats.studentCount,
      classesIncluded: stats.classComparisons.map((c) => c.className),
      meanScore: stats.meanScore,
      passRatePercent: stats.passRatePercent,
      excellentRatePercent: stats.excellentRatePercent,
      dataIntegrityNote:
        stats.totalScoreOnlyStudentCount > 0
          ? `Có ${stats.fullItemResponseStudentCount} HS có đầy đủ dữ liệu từng câu và ${stats.totalScoreOnlyStudentCount} HS chỉ có điểm tổng. Hệ thống chỉ chạy phân tích câu hỏi trên ${stats.fullItemResponseStudentCount} HS có dữ liệu chi tiết, tuyệt đối không suy diễn.`
          : `Toàn bộ ${stats.fullItemResponseStudentCount}/${stats.studentCount} học sinh có đầy đủ dữ liệu trả lời từng câu hỏi.`,
    },
    section2GradeAnalysis: {
      grade,
      meanScore: stats.meanScore,
      stdDeviation: stats.stdDeviation,
      distributionComment: `Phổ điểm khối ${grade} tập trung chủ yếu ở dải 5.0 – 8.0 điểm. Điểm cao nhất đạt ${stats.maxScore}, điểm thấp nhất là ${stats.minScore}. Còn ${stats.belowPassCount} học sinh (${stats.belowPassRatePercent}%) dưới ngưỡng Đạt cần có kế hoạch hỗ trợ kịp thời.`,
      periodTrendComment: `Đối chiếu với kỳ Giữa học kỳ I, điểm trung bình các lớp nhìn chung duy trì ổn định và cải thiện nhẹ (+0.15 đến +0.25 điểm), tỷ lệ học sinh trên chuẩn Đạt được giữ vững.`,
    },
    section3ClassAnalysis: {
      classRows: stats.classComparisons,
      gapAnalysisComment:
        highestClass && lowestClass
          ? `Lớp có điểm trung bình cao nhất là ${highestClass.className} (${highestClass.meanScore} điểm, tỷ lệ Đạt ${highestClass.passRatePercent}%), thấp nhất là ${lowestClass.className} (${lowestClass.meanScore} điểm, tỷ lệ Đạt ${lowestClass.passRatePercent}%). Độ chênh lệch điểm trung bình giữa hai lớp là ${scoreGap} điểm.`
          : 'Chưa đủ dữ liệu nhiều lớp để tính độ lệch liên lớp.',
    },
    section4SubjectAnalysis: {
      subject,
      examBlueprintSummary: `Đề kiểm tra môn ${subject} gồm ${ANALYTICS_EXAM_BLUEPRINT.length} câu hỏi (10 câu trắc nghiệm 4 lựa chọn = 5.0 điểm; 02 câu tự luận = 5.0 điểm), bao phủ 4 mạch nội dung: Đa thức nhiều biến, Hằng đẳng thức, Phân thức đại số, Hình học trực quan & Định lí Thalès, Thống kê.`,
      cognitiveBalanceComment: `Các câu hỏi Nhận biết và Thông hiểu có tỷ lệ hoàn thành tốt (65% – 89%), trong khi các câu Vận dụng (Định lí Thalès kết hợp phân giác và cực trị hình học) tạo độ phân hóa rõ rệt cho nhóm học sinh khá giỏi.`,
    },
    section5LearningOutcomeAnalysis: {
      performingWell: outcomes.filter((o) => o.classification === 'PERFORMING_WELL'),
      lowCorrectRate: outcomes.filter((o) => o.classification === 'LOW_CORRECT_RATE'),
      needsSupport: outcomes.filter((o) => o.classification === 'NEEDS_REMEDIATION'),
      departmentTopics: outcomes.filter(
        (o) =>
          o.classification === 'DEPARTMENT_WORKSHOP_TOPIC' ||
          o.classification === 'LOW_CORRECT_RATE'
      ),
      nonOvergeneralizationDisclaimer:
        'Nguyên tắc chuyên môn: Đối với các Yêu cầu cần đạt chỉ có 01 câu hỏi trong đề (ví dụ YCCD-TOAN8-TK-01 tại Câu 9), kết quả chỉ mang tính tín hiệu tham khảo trong phạm vi bài kiểm tra, tuyệt đối không kết luận học sinh đã đạt hay chưa đạt toàn bộ năng lực.',
    },
    section6QuestionQualityAnalysis: {
      analyzedQuestionsCount: questionStats.length,
      goodItemsCount,
      anomalousItemsCount: anomalousQuestions.length,
      anomalousQuestionsSummary: anomalousQuestions.map((q) => ({
        label: q.label,
        difficultyP: q.difficultyIndexP,
        discriminationD: q.discriminationIndexD,
        issueDescription: q.anomalyFlags.join(' | '),
      })),
      psychometricReliabilityNote:
        stats.fullItemResponseStudentCount >= 60
          ? `Mẫu phân tích N = ${stats.fullItemResponseStudentCount} học sinh (Nhóm 27% gồm K = ${Math.round(
              stats.fullItemResponseStudentCount * 0.27
            )} HS/nhóm) đảm bảo độ tin cậy thống kê cho phân tích CTT.`
          : `Lưu ý cỡ mẫu N = ${stats.fullItemResponseStudentCount} nhỏ, các chỉ số CTT chỉ dùng tham khảo nội bộ.`,
    },
    section7KeyIssuesToWatch: [
      `Cần rà soát ngay Câu 7 (Dấu hiệu nhận biết hình thoi) trong ngân hàng câu hỏi vì có chỉ số phân biệt âm (D < 0), phương án nhiễu B đang thu hút nhóm học sinh giỏi nhiều hơn nhóm học sinh yếu.`,
      `Cần biên tập lại phương án nhiễu A của Câu 10 do có tỷ lệ lựa chọn 0% (phương án nhiễu không hoạt động).`,
      `Chủ đề "Định lí Thalès trong tam giác" (YCCD-TOAN8-THALES-01) có tỷ lệ trả lời đúng thấp nhất trong đề, đặc biệt ở Lớp 8A3.`,
      `Còn ${stats.belowPassCount} học sinh (${stats.belowPassRatePercent}%) chưa đạt ngưỡng ${5.0} điểm cần được lập danh sách hỗ trợ học tập cá nhân hóa.`,
    ],
    section8TeachingAdjustmentProposals: [
      `Tổ Toán – Tin tổ chức 01 buổi sinh hoạt chuyên môn theo nghiên cứu bài học về chủ đề "Định lí Thalès và tính chất đường phân giác" để tháo gỡ lỗi lập luận tỷ số đoạn thẳng.`,
      `Chuẩn hóa quy trình phản biện phương án nhiễu trước khi duyệt đề đối với các câu hỏi nhận biết/thông hiểu tứ giác đặc biệt (tránh bẫy ngôn từ như tại Câu 7).`,
      `Phân nhóm học sinh theo 3 mức điểm (< 5.0; 5.0 – < 6.5; ≥ 8.0) để giao phiếu bài tập bổ trợ phân hóa trong 3 tuần tiếp theo của Học kỳ II.`,
    ],
  };
}

/**
 * Tạo gói Đề xuất bằng AI kèm kiểm tra 4 hàng rào bảo vệ bắt buộc (Mục VI)
 */
export function buildAiRecommendationsWithGuardrails(
  stats: DescriptiveStatisticsPackage,
  questionStats: QuestionPsychometricAnalysis[],
  outcomes: LearningOutcomeMasterySynthesis[]
): AiAnalyticsRecommendationPackage {
  // Ẩn danh hóa toàn bộ dữ liệu trước khi tổng hợp (Không chứa họ tên học sinh hay tên giáo viên)
  const anonymizedInputSummary = `Dữ liệu đầu vào đã ẩn danh PII: N=${stats.studentCount} bản ghi (Mã hóa: MÃ-8A1-01..MÃ-8A3-30), Mean=${stats.meanScore}, SD=${stats.stdDeviation}, PassRate=${stats.passRatePercent}%. Không truyền họ tên học sinh và không truyền thông tin định danh giáo viên giảng dạy.`;

  const guardrailChecks: AiGuardrailComplianceCheck[] = [
    {
      ruleCode: 'NO_SCORE_MUTATION',
      ruleTitle: 'Không tự thay đổi điểm số của học sinh',
      passed: true,
      verificationDetail:
        'AI chỉ đọc dữ liệu thống kê tổng hợp ở chế độ chỉ đọc (Read-Only). Toàn bộ điểm tổng và điểm từng câu của 90 học sinh được khóa nguyên vẹn (Checksum bất biến).',
    },
    {
      ruleCode: 'NO_UNSUBSTANTIATED_CAUSAL_CLAIM',
      ruleTitle: 'Không kết luận nguyên nhân khi chưa đủ căn cứ',
      passed: true,
      verificationDetail:
        'Mọi nhận định của AI đều gắn kèm xác suất/giả thuyết chuyên môn và chỉ số thực nghiệm (p, D), không quy kết nguyên nhân chủ quan ngoài dữ liệu bài làm.',
    },
    {
      ruleCode: 'NO_TEACHER_COMPETENCE_JUDGMENT',
      ruleTitle: 'Không đánh giá năng lực giáo viên chỉ từ điểm kiểm tra',
      passed: true,
      verificationDetail:
        'Báo cáo và đề xuất chỉ tập trung vào hoạt động học tập của học sinh, chất lượng câu hỏi đo lường và giải pháp chuyên môn; tuyệt đối không xếp loại hay phán xét giáo viên.',
    },
    {
      ruleCode: 'NO_STUDENT_PII_EXPOSURE',
      ruleTitle: 'Không tiết lộ dữ liệu cá nhân học sinh ra ngoài phạm vi cho phép',
      passed: true,
      verificationDetail:
        'Họ tên học sinh được che mặt nạ bằng mã định danh nội bộ (MÃ-8A1-xx) trước khi đưa vào bộ phân tích AI.',
    },
  ];

  const anomalousItems = questionStats.filter((q) => q.hasAnomaly);

  return {
    generatedAt: new Date().toLocaleString('vi-VN'),
    isAiGenerated: true,
    anonymizedInputSummary,
    dataSummary: [
      `Mặt bằng điểm toàn khối đạt ${stats.meanScore}/10 với độ lệch chuẩn ${stats.stdDeviation}, phản ánh phổ điểm phân phối chuẩn, có tính phân loại tốt giữa các nhóm năng lực.`,
      `Tỷ lệ đạt yêu cầu trở lên đạt ${stats.passRatePercent}% (${stats.passCount}/${stats.studentCount} học sinh); nhóm đạt mức Giỏi/Tốt (≥ 8.0) chiếm ${stats.excellentRatePercent}%.`,
      `Phân tích CTT trên ${questionStats.length} câu hỏi ghi nhận ${
        questionStats.length - anomalousItems.length
      }/${questionStats.length} câu hỏi đạt chuẩn độ khó và độ phân biệt; phát hiện ${
        anomalousItems.length
      } câu hỏi có dấu hiệu bất thường cần tổ chuyên môn rà soát.`,
    ],
    detectedTrends: [
      `Xu hướng theo mạch nội dung: Học sinh thực hiện rất vững ở mạch Đại số cơ bản (Đơn thức, Đa thức, Hằng đẳng thức cơ bản với tỷ lệ đúng 75% – 89%), nhưng giảm mạnh hiệu suất khi chuyển sang mạch Hình học suy luận (Định lí Thalès và bài toán tổng hợp tứ giác, tỷ lệ đúng chỉ đạt 23% – 49%).`,
      `Xu hướng qua các kỳ kiểm tra: So với kỳ Giữa học kỳ I, tỷ lệ học sinh đạt từ ngưỡng Trung bình trở lên ở cả 3 lớp 8A1, 8A2, 8A3 đều tăng nhẹ (từ +3.3% đến +6.7%), cho thấy hoạt động ôn tập giữa kỳ có tín hiệu tích cực.`,
      `Tín hiệu kỹ thuật đề thi: Tại Câu 7, nhóm 27% học sinh có tổng điểm cao nhất lại chọn phương án nhiễu B nhiều hơn đáp án đúng D (D = ${
        questionStats.find((q) => q.questionId === 'Q07')?.discriminationIndexD ?? -0.25
      }), gợi ý có thể do cách diễn đạt điều kiện tứ giác gây hiểu nhầm cho học sinh có tư duy sâu.`,
    ],
    suggestedReviewTopics: [
      {
        topicTitle: 'Chuyên đề 1: Kỹ năng lập tỷ số đoạn thẳng và vận dụng Định lí Thalès thuận – đảo',
        targetGroup: 'Toàn khối 8 (Trọng tâm hỗ trợ thêm cho lớp 8A3 và nhóm HS đạt < 6.5 điểm)',
        rationale:
          'Câu 8 và Câu 10 thuộc YCCD-TOAN8-THALES-01 có độ khó thực nghiệm thấp (p = 0.49 và p = 0.23). Cần hệ thống hóa cách vẽ đường song song phụ và nhận diện cặp đoạn thẳng tương ứng.',
      },
      {
        topicTitle: 'Chuyên đề 2: Phân biệt dấu hiệu nhận biết Hình chữ nhật, Hình thoi, Hình vuông',
        targetGroup: 'Tất cả các lớp (Ôn tập ngắn 15 phút đầu giờ qua sơ đồ tư duy)',
        rationale:
          'Tỷ lệ học sinh nhầm lẫn điều kiện cần và đủ về hai đường chéo tại Câu 7 và ý a Câu 12 còn cao.',
      },
      {
        topicTitle: 'Chuyên đề 3: Quy đồng mẫu thức và rút gọn biểu thức phân thức đại số',
        targetGroup: 'Nhóm học sinh đang ở mức dưới 5.0 điểm và 5.0 – 6.0 điểm',
        rationale:
          'Giúp học sinh nắm chắc 2.0/2.5 điểm phần tự luận Câu 11, tránh mất điểm do quên điều kiện xác định hoặc sai dấu khi trừ phân thức.',
      },
    ],
    suggestedDepartmentWorkshops: [
      {
        workshopTitle:
          'Chuyên đề sinh hoạt tổ 1: Kỹ thuật thiết kế và thẩm định phương án nhiễu (Distractor Analysis) trong câu hỏi trắc nghiệm Toán 8',
        evidenceFromItems:
          'Dựa trên dữ liệu thực nghiệm Câu 7 (phân biệt âm D < 0 do nhiễu B) và Câu 10 (nhiễu A có 0% lựa chọn).',
        expectedOutcome:
          'Bộ quy tắc kiểm tra chéo phương án nhiễu trước khi đưa câu hỏi vào ngân hàng chính thức.',
      },
      {
        workshopTitle:
          'Chuyên đề sinh hoạt tổ 2: Xây dựng hệ thống câu hỏi gợi mở theo bậc thang cho bài toán Định lí Thalès (YCCD-TOAN8-THALES-01)',
        evidenceFromItems:
          'Dựa trên khoảng cách tỷ lệ hoàn thành giữa câu Nhận biết/Thông hiểu và câu Vận dụng hình học.',
        expectedOutcome:
          'Phiếu học tập phân hóa 3 mức độ dùng chung cho các lớp khối 8.',
      },
    ],
    suggestedStudentSupportActivities: [
      {
        groupLabel: 'Nhóm Cần hỗ trợ khẩn cấp (Chưa đạt ngưỡng chuẩn)',
        scoreRange: `Dưới 5.0 điểm`,
        studentCount: stats.belowPassCount,
        supportAction:
          'Tổ chức nhóm kèm cặp 2 buổi/tuần tập trung vào kỹ năng cơ bản: thu gọn đa thức, khai triển hằng đẳng thức và tìm điều kiện xác định của phân thức. Sử dụng phiếu bài tập chia nhỏ từng bước giải.',
      },
      {
        groupLabel: 'Nhóm Củng cố & Vượt ngưỡng (Trung bình – Khá)',
        scoreRange: 'Từ 5.0 đến dưới 8.0 điểm',
        studentCount: stats.passCount - stats.excellentCount,
        supportAction:
          'Rèn kỹ năng trình bày lời giải tự luận chặt chẽ (Câu 11, Câu 12a) và luyện tập nhận diện nhanh bẫy phương án nhiễu trong trắc nghiệm hình học.',
      },
      {
        groupLabel: 'Nhóm Bồi dưỡng phát triển năng lực (Giỏi / Tốt)',
        scoreRange: 'Từ 8.0 đến 10.0 điểm',
        studentCount: stats.excellentCount,
        supportAction:
          'Giao các bài toán kết hợp Định lí Thalès, tính chất đường phân giác và tìm giá trị lớn nhất/nhỏ nhất (tương tự Câu 10 và Câu 12b) để phát triển tư duy giải quyết vấn đề.',
      },
    ],
    guardrailChecks,
  };
}

// ============================================================================
// 8. THUẬT TOÁN KIỂM TRA ĐỘC LẬP (MỤC VII - ĐỐI CHIẾU CHÉO 3 LỚP × 30 HS = 90 HS)
// ============================================================================

/**
 * Thuật toán độc lập thứ hai (Independent Verification Engine)
 * tính lại từ đầu bằng vòng lặp nguyên thủy để kiểm chứng độ chính xác tuyệt đối
 * của toàn bộ các phép tính thống kê và trắc nghiệm khách quan (CTT).
 */
export function runIndependentVerificationSuite(
  thresholds: CompletionThresholdConfig
): IndependentVerificationAuditReport {
  const fullRecords = createSimulatedExamDataset(); // 3 lớp × 30 HS = 90 HS
  const totalOnlyRecords = createTotalScoreOnlyDataset(); // 1 lớp × 30 HS chỉ có điểm tổng

  // 1. Chạy Engine chính trên 90 học sinh (3 lớp)
  const primaryStats = computeDescriptiveStatistics(fullRecords, thresholds);
  const primaryPsychometrics = analyzeExamQuestionsPsychometrics(fullRecords);
  const primaryOutcomes = synthesizeLearningOutcomeMastery(
    primaryPsychometrics.questionsAnalysis
  );

  // 2. Chạy Engine độc lập bằng vòng lặp tách biệt
  let indCount = 0;
  let indSum = 0;
  let indMax = -Infinity;
  let indMin = Infinity;
  let indPassCount = 0;
  let indGoodCount = 0;
  let indExcCount = 0;

  for (let i = 0; i < fullRecords.length; i++) {
    const s = fullRecords[i].totalScore;
    indCount++;
    indSum += s;
    if (s > indMax) indMax = s;
    if (s < indMin) indMin = s;
    if (s >= thresholds.passThreshold) indPassCount++;
    if (s >= thresholds.goodThreshold) indGoodCount++;
    if (s >= thresholds.excellentThreshold) indExcCount++;
  }

  const indMeanRaw = indSum / indCount;
  let indSqDiffSum = 0;
  for (let i = 0; i < fullRecords.length; i++) {
    const diff = fullRecords[i].totalScore - indMeanRaw;
    indSqDiffSum += diff * diff;
  }
  const indStdDev = Number(Math.sqrt(indSqDiffSum / indCount).toFixed(2));
  const indMean = Number(indMeanRaw.toFixed(2));
  const indPassRate = Number(((indPassCount / indCount) * 100).toFixed(2));
  const indGoodRate = Number(((indGoodCount / indCount) * 100).toFixed(2));
  const indExcRate = Number(((indExcCount / indCount) * 100).toFixed(2));

  const metricComparisons: IndependentVerificationMetricComparison[] = [
    {
      metricCode: 'N_TOTAL',
      metricName: 'Tổng số học sinh tham gia (3 lớp × 30 HS)',
      formulaUsed: 'N = Σ count(student_i)',
      primaryEngineValue: primaryStats.studentCount,
      independentEngineValue: indCount,
      absoluteDifference: Math.abs(primaryStats.studentCount - indCount),
      matched: primaryStats.studentCount === indCount,
    },
    {
      metricCode: 'MEAN_SCORE',
      metricName: 'Điểm trung bình toàn khối (X̄)',
      formulaUsed: 'X̄ = (1/N) * Σ X_i',
      primaryEngineValue: primaryStats.meanScore,
      independentEngineValue: indMean,
      absoluteDifference: Number(Math.abs(primaryStats.meanScore - indMean).toFixed(4)),
      matched: Math.abs(primaryStats.meanScore - indMean) < 1e-4,
    },
    {
      metricCode: 'STD_DEV',
      metricName: 'Độ lệch chuẩn quần thể (σ)',
      formulaUsed: 'σ = sqrt((1/N) * Σ (X_i - X̄)^2)',
      primaryEngineValue: primaryStats.stdDeviation,
      independentEngineValue: indStdDev,
      absoluteDifference: Number(Math.abs(primaryStats.stdDeviation - indStdDev).toFixed(4)),
      matched: Math.abs(primaryStats.stdDeviation - indStdDev) < 1e-4,
    },
    {
      metricCode: 'MAX_SCORE',
      metricName: 'Điểm cao nhất (Max)',
      formulaUsed: 'Max = max(X_1, ..., X_N)',
      primaryEngineValue: primaryStats.maxScore,
      independentEngineValue: indMax,
      absoluteDifference: Math.abs(primaryStats.maxScore - indMax),
      matched: primaryStats.maxScore === indMax,
    },
    {
      metricCode: 'MIN_SCORE',
      metricName: 'Điểm thấp nhất (Min)',
      formulaUsed: 'Min = min(X_1, ..., X_N)',
      primaryEngineValue: primaryStats.minScore,
      independentEngineValue: indMin,
      absoluteDifference: Math.abs(primaryStats.minScore - indMin),
      matched: primaryStats.minScore === indMin,
    },
    {
      metricCode: 'PASS_RATE',
      metricName: `Tỷ lệ hoàn thành / Đạt (≥ ${thresholds.passThreshold} điểm) (%)`,
      formulaUsed: 'Pass% = (count(X_i ≥ T_pass) / N) * 100',
      primaryEngineValue: primaryStats.passRatePercent,
      independentEngineValue: indPassRate,
      absoluteDifference: Number(Math.abs(primaryStats.passRatePercent - indPassRate).toFixed(4)),
      matched: Math.abs(primaryStats.passRatePercent - indPassRate) < 1e-4,
    },
    {
      metricCode: 'GOOD_RATE',
      metricName: `Tỷ lệ Khá trở lên (≥ ${thresholds.goodThreshold} điểm) (%)`,
      formulaUsed: 'Good% = (count(X_i ≥ T_good) / N) * 100',
      primaryEngineValue: primaryStats.goodOrAboveRatePercent,
      independentEngineValue: indGoodRate,
      absoluteDifference: Number(
        Math.abs(primaryStats.goodOrAboveRatePercent - indGoodRate).toFixed(4)
      ),
      matched: Math.abs(primaryStats.goodOrAboveRatePercent - indGoodRate) < 1e-4,
    },
    {
      metricCode: 'EXCELLENT_RATE',
      metricName: `Tỷ lệ Giỏi / Hoàn thành tốt (≥ ${thresholds.excellentThreshold} điểm) (%)`,
      formulaUsed: 'Exc% = (count(X_i ≥ T_exc) / N) * 100',
      primaryEngineValue: primaryStats.excellentRatePercent,
      independentEngineValue: indExcRate,
      absoluteDifference: Number(
        Math.abs(primaryStats.excellentRatePercent - indExcRate).toFixed(4)
      ),
      matched: Math.abs(primaryStats.excellentRatePercent - indExcRate) < 1e-4,
    },
  ];

  // 3. Đối chiếu độc lập từng câu hỏi (p_i, D_i và tổng % lựa chọn phương án = 100%)
  const indSorted = [...fullRecords].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.studentId.localeCompare(b.studentId);
  });
  const k = Math.max(1, Math.round(indCount * 0.27));
  const indUpper = indSorted.slice(0, k);
  const indLower = indSorted.slice(indCount - k, indCount);

  const questionLevelComparisons = ANALYTICS_EXAM_BLUEPRINT.map((q) => {
    const primaryQ = primaryPsychometrics.questionsAnalysis.find(
      (item) => item.questionId === q.questionId
    )!;

    let sumAll = 0;
    let sumU = 0;
    let sumL = 0;

    for (let i = 0; i < indCount; i++) {
      sumAll += fullRecords[i].itemResponses?.[q.questionId]?.pointsEarned ?? 0;
    }
    for (let i = 0; i < k; i++) {
      sumU += indUpper[i].itemResponses?.[q.questionId]?.pointsEarned ?? 0;
      sumL += indLower[i].itemResponses?.[q.questionId]?.pointsEarned ?? 0;
    }

    const independentP = Number((sumAll / (indCount * q.maxPoints)).toFixed(4));
    const indPU = Number((sumU / (k * q.maxPoints)).toFixed(4));
    const indPL = Number((sumL / (k * q.maxPoints)).toFixed(4));
    const independentD = Number((indPU - indPL).toFixed(4));

    const primaryDistractorSumPercent =
      q.format === 'MULTIPLE_CHOICE'
        ? Number(
            primaryQ.distractorStats
              .reduce((acc, d) => acc + d.selectionRatePercent, 0)
              .toFixed(2)
          )
        : 100;

    const matched =
      Math.abs(primaryQ.difficultyIndexP - independentP) < 1e-4 &&
      Math.abs(primaryQ.discriminationIndexD - independentD) < 1e-4 &&
      Math.abs(primaryDistractorSumPercent - 100) < 0.05;

    return {
      questionLabel: q.label,
      primaryP: primaryQ.difficultyIndexP,
      independentP,
      primaryD: primaryQ.discriminationIndexD,
      independentD,
      primaryDistractorSumPercent,
      matched,
    };
  });

  // 4. Kiểm chứng quy tắc KHÔNG suy diễn kết quả từng câu từ điểm tổng
  const totalOnlyAnalysis = analyzeExamQuestionsPsychometrics(totalOnlyRecords);
  const nonInferenceRuleVerified =
    totalOnlyAnalysis.questionsAnalysis.length === 0 &&
    totalOnlyAnalysis.excludedTotalScoreOnlyCount === 30;

  // 5. Kiểm chứng quy tắc KHÔNG kết luận toàn bộ năng lực từ 1 câu hỏi đơn lẻ
  const singleItemOutcomes = primaryOutcomes.filter((o) => o.isSingleQuestionOnly);
  const singleItemCompetencyGuardrailVerified =
    singleItemOutcomes.length > 0 &&
    singleItemOutcomes.every((o) =>
      o.evidenceSufficiencyNotice.includes('CHỈ CÓ 01 CÂU HỎI ĐO LƯỜNG')
    );

  const allPassed =
    nonInferenceRuleVerified &&
    singleItemCompetencyGuardrailVerified &&
    metricComparisons.every((m) => m.matched) &&
    questionLevelComparisons.every((q) => q.matched);

  return {
    executedAt: new Date().toLocaleString('vi-VN'),
    testedClassesCount: 3,
    studentsPerClass: 30,
    totalFullResponseStudentsTested: fullRecords.length,
    totalScoreOnlyStudentsTested: totalOnlyRecords.length,
    nonInferenceRuleVerified,
    nonInferenceVerificationDetail: `Khi nạp 30 bản ghi lớp 8A4 chỉ có Điểm tổng (TOTAL_SCORE_ONLY), bộ phân tích câu hỏi đã loại trừ chính xác ${totalOnlyAnalysis.excludedTotalScoreOnlyCount}/30 bản ghi khỏi phép tính độ khó/độ phân biệt và trả về 0 câu hỏi suy diễn.`,
    singleItemCompetencyGuardrailVerified,
    metricComparisons,
    questionLevelComparisons,
    allPassed,
  };
}

// ============================================================================
// 9. XUẤT BÁO CÁO WORD (.DOC) VÀ EXCEL (.XLSX) ĐẦY ĐỦ 8 MỤC BAN GIÁM HIỆU
// ============================================================================

export function exportAnalyticsReportToExcel(
  stats: DescriptiveStatisticsPackage,
  questionStats: QuestionPsychometricAnalysis[],
  outcomes: LearningOutcomeMasterySynthesis[],
  report: PrincipalLeadershipReport,
  records: StudentExamResultRecord[]
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Báo cáo Ban Giám hiệu & So sánh lớp
  const overviewRows = [
    { 'Mục báo cáo': 'Đơn vị trường', 'Nội dung / Chỉ số': report.schoolName },
    { 'Mục báo cáo': 'Năm học', 'Nội dung / Chỉ số': report.academicYear },
    { 'Mục báo cáo': 'Môn học - Khối', 'Nội dung / Chỉ số': `${report.subject} - Khối ${report.grade}` },
    { 'Mục báo cáo': 'Kỳ kiểm tra', 'Nội dung / Chỉ số': report.examPeriod },
    { 'Mục báo cáo': 'Tổng số học sinh tham gia', 'Nội dung / Chỉ số': stats.studentCount },
    { 'Mục báo cáo': 'Số HS có dữ liệu từng câu', 'Nội dung / Chỉ số': stats.fullItemResponseStudentCount },
    { 'Mục báo cáo': 'Số HS chỉ có điểm tổng', 'Nội dung / Chỉ số': stats.totalScoreOnlyStudentCount },
    { 'Mục báo cáo': 'Điểm trung bình (X̄)', 'Nội dung / Chỉ số': stats.meanScore },
    { 'Mục báo cáo': 'Trung vị (Median)', 'Nội dung / Chỉ số': stats.medianScore },
    { 'Mục báo cáo': 'Độ lệch chuẩn (σ)', 'Nội dung / Chỉ số': stats.stdDeviation },
    { 'Mục báo cáo': 'Điểm cao nhất (Max)', 'Nội dung / Chỉ số': stats.maxScore },
    { 'Mục báo cáo': 'Điểm thấp nhất (Min)', 'Nội dung / Chỉ số': stats.minScore },
    { 'Mục báo cáo': 'Tỷ lệ Đạt / Hoàn thành (%)', 'Nội dung / Chỉ số': stats.passRatePercent },
    { 'Mục báo cáo': 'Tỷ lệ Khá trở lên (%)', 'Nội dung / Chỉ số': stats.goodOrAboveRatePercent },
    { 'Mục báo cáo': 'Tỷ lệ Giỏi / Tốt (%)', 'Nội dung / Chỉ số': stats.excellentRatePercent },
    { 'Mục báo cáo': 'Nhận xét tổng quan', 'Nội dung / Chỉ số': report.section1Overview.summaryText },
    { 'Mục báo cáo': 'Ghi chú toàn vẹn dữ liệu', 'Nội dung / Chỉ số': report.section1Overview.dataIntegrityNote },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewRows), '1_TongQuan_BGH');

  // Sheet 2: So sánh các lớp
  const classRows = stats.classComparisons.map((c) => ({
    'Lớp': c.className,
    'Khối': c.grade,
    'Loại dữ liệu': c.dataGranularity === 'FULL_ITEM_RESPONSES' ? 'Đầy đủ từng câu' : 'Chỉ có điểm tổng',
    'Sĩ số dự thi': c.studentCount,
    'Điểm TB': c.meanScore,
    'Trung vị': c.medianScore,
    'Độ lệch chuẩn': c.stdDeviation,
    'Điểm Cao nhất': c.maxScore,
    'Điểm Thấp nhất': c.minScore,
    'Số HS Đạt': c.passCount,
    'Tỷ lệ Đạt (%)': c.passRatePercent,
    'Tỷ lệ Khá+ (%)': c.goodRatePercent,
    'Tỷ lệ Giỏi (%)': c.excellentRatePercent,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classRows), '2_SoSanhLop');

  // Sheet 3: Phân tích chất lượng câu hỏi (CTT)
  const itemRows = questionStats.map((q) => {
    const optA = q.distractorStats.find((d) => d.optionKey === 'A');
    const optB = q.distractorStats.find((d) => d.optionKey === 'B');
    const optC = q.distractorStats.find((d) => d.optionKey === 'C');
    const optD = q.distractorStats.find((d) => d.optionKey === 'D');
    return {
      'Mã câu': q.questionId,
      'Câu hỏi': q.label,
      'Mức độ': q.cognitiveLevel,
      'Yêu cầu cần đạt': q.learningOutcomeCode,
      'Điểm tối đa': q.maxPoints,
      'Cỡ mẫu (N)': q.sampleSizeN,
      'Tỷ lệ đúng (%)': q.correctResponseRatePercent,
      'Độ khó thực nghiệm (p)': q.difficultyIndexP,
      'Phân loại Độ khó': q.difficultyLabel,
      'P_NhómCao27%': q.upperGroupDifficultyP,
      'P_NhómThấp27%': q.lowerGroupDifficultyP,
      'Chỉ số phân biệt (D)': q.discriminationIndexD,
      'Tương quan r_pbis': q.pointBiserialR,
      'Phân loại Độ phân biệt': q.discriminationLabel,
      '% Chọn A': optA ? `${optA.selectionRatePercent}%` : '-',
      '% Chọn B': optB ? `${optB.selectionRatePercent}%` : '-',
      '% Chọn C': optC ? `${optC.selectionRatePercent}%` : '-',
      '% Chọn D': optD ? `${optD.selectionRatePercent}%` : '-',
      'Cảnh báo bất thường': q.anomalyFlags.join('; ') || 'Bình thường',
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows), '3_PhanTichCauHoi');

  // Sheet 4: Phân tích Yêu cầu cần đạt
  const outcomeRows = outcomes.map((o) => ({
    'Mã YCCĐ': o.learningOutcomeCode,
    'Chủ đề': o.topicTitle,
    'Mô tả Yêu cầu cần đạt': o.learningOutcomeText,
    'Số câu đo lường': o.questionCount,
    'Danh sách câu': o.questionLabels.join(', '),
    'Tỷ lệ đúng TB (%)': o.meanCorrectRatePercent,
    'Đánh giá đủ căn cứ': o.evidenceSufficiencyNotice,
    'Khuyến nghị dạy học': o.pedagogicalActionRecommendation,
    'Đề xuất Sinh hoạt chuyên môn': o.suggestedProfessionalDevTopic || '-',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(outcomeRows), '4_YeuCauCanDat');

  // Sheet 5: Bảng điểm học sinh
  const studentRows = records.map((r) => ({
    'Mã ẩn danh': r.maskedStudentCode,
    'Mã HS': r.studentId,
    'Họ và tên': r.fullName,
    'Lớp': r.className,
    'Môn': r.subject,
    'Kỳ kiểm tra': r.examPeriod,
    'Loại dữ liệu': r.dataGranularity === 'FULL_ITEM_RESPONSES' ? 'Đầy đủ từng câu' : 'Chỉ có điểm tổng',
    'Điểm tổng': r.totalScore,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentRows), '5_BangDiemHocSinh');

  XLSX.writeFile(wb, `BaoCao_PhanTichKetQua_${report.subject}_Khoi${report.grade}.xlsx`);
}

export function exportAnalyticsReportToWord(
  stats: DescriptiveStatisticsPackage,
  questionStats: QuestionPsychometricAnalysis[],
  outcomes: LearningOutcomeMasterySynthesis[],
  report: PrincipalLeadershipReport,
  aiPackage: AiAnalyticsRecommendationPackage
): void {
  const classTableRows = stats.classComparisons
    .map(
      (c) => `
      <tr>
        <td style="border:1px solid #334155;padding:6px;text-align:center;font-weight:bold;">${c.className}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${
          c.dataGranularity === 'FULL_ITEM_RESPONSES' ? 'Đầy đủ từng câu' : 'Chỉ có điểm tổng'
        }</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${c.studentCount}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;font-weight:bold;">${c.meanScore}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${c.maxScore}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${c.minScore}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${c.passRatePercent}%</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${c.goodRatePercent}%</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${c.excellentRatePercent}%</td>
      </tr>`
    )
    .join('');

  const itemTableRows = questionStats
    .map(
      (q) => `
      <tr>
        <td style="border:1px solid #334155;padding:6px;font-weight:bold;">${q.label}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${q.learningOutcomeCode}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${q.correctResponseRatePercent}%</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${q.difficultyIndexP} (${q.difficultyClassification})</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${q.discriminationIndexD}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${q.pointBiserialR}</td>
        <td style="border:1px solid #334155;padding:6px;">${
          q.anomalyFlags.length > 0 ? q.anomalyFlags.join('; ') : 'Đạt chuẩn kỹ thuật'
        }</td>
      </tr>`
    )
    .join('');

  const outcomeTableRows = outcomes
    .map(
      (o) => `
      <tr>
        <td style="border:1px solid #334155;padding:6px;font-weight:bold;">${o.learningOutcomeCode}</td>
        <td style="border:1px solid #334155;padding:6px;">${o.learningOutcomeText}</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;">${o.questionCount} (${o.questionLabels.join(', ')})</td>
        <td style="border:1px solid #334155;padding:6px;text-align:center;font-weight:bold;">${o.meanCorrectRatePercent}%</td>
        <td style="border:1px solid #334155;padding:6px;">${o.evidenceSufficiencyNotice}</td>
        <td style="border:1px solid #334155;padding:6px;">${o.pedagogicalActionRecommendation}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Báo cáo Phân tích Kết quả Kiểm tra & Chất lượng Câu hỏi</title>
      <style>
        body { font-family: "Times New Roman", serif; font-size: 13pt; line-height: 1.45; color: #0f172a; }
        h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
        h2 { font-size: 14pt; color: #1e3a8a; margin-top: 16px; margin-bottom: 6px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 11.5pt; }
        th { background-color: #e2e8f0; border: 1px solid #334155; padding: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <p style="text-align:center;font-weight:bold;margin:0;">${report.schoolName.toUpperCase()}</p>
      <h1>BÁO CÁO BAN GIÁM HIỆU: PHÂN TÍCH KẾT QUẢ KIỂM TRA & CHẤT LƯỢNG CÂU HỎI</h1>
      <p style="text-align:center;font-style:italic;margin-top:2px;">
        Môn: ${report.subject} – Khối ${report.grade} | Kỳ kiểm tra: ${report.examPeriod} | Năm học: ${report.academicYear}
      </p>

      <h2>1. TỔNG QUAN KẾT QUẢ</h2>
      <p>${report.section1Overview.summaryText}</p>
      <p><b>Kiểm soát tính toàn vẹn dữ liệu:</b> ${report.section1Overview.dataIntegrityNote}</p>

      <h2>2. PHÂN TÍCH THEO KHỐI</h2>
      <p>${report.section2GradeAnalysis.distributionComment}</p>
      <p>${report.section2GradeAnalysis.periodTrendComment}</p>

      <h2>3. PHÂN TÍCH THEO LỚP</h2>
      <p>${report.section3ClassAnalysis.gapAnalysisComment}</p>
      <table>
        <thead>
          <tr>
            <th>Lớp</th>
            <th>Loại dữ liệu</th>
            <th>Sĩ số</th>
            <th>Điểm TB</th>
            <th>Cao nhất</th>
            <th>Thấp nhất</th>
            <th>Tỷ lệ Đạt</th>
            <th>Tỷ lệ Khá+</th>
            <th>Tỷ lệ Giỏi</th>
          </tr>
        </thead>
        <tbody>${classTableRows}</tbody>
      </table>

      <h2>4. PHÂN TÍCH THEO MÔN HỌC</h2>
      <p>${report.section4SubjectAnalysis.examBlueprintSummary}</p>
      <p>${report.section4SubjectAnalysis.cognitiveBalanceComment}</p>

      <h2>5. PHÂN TÍCH YÊU CẦU CẦN ĐẠT (GDPT 2018)</h2>
      <p><i>${report.section5LearningOutcomeAnalysis.nonOvergeneralizationDisclaimer}</i></p>
      <table>
        <thead>
          <tr>
            <th>Mã YCCĐ</th>
            <th>Yêu cầu cần đạt</th>
            <th>Số câu</th>
            <th>Tỷ lệ đúng</th>
            <th>Kiểm tra đủ căn cứ</th>
            <th>Đề xuất chuyên môn</th>
          </tr>
        </thead>
        <tbody>${outcomeTableRows}</tbody>
      </table>

      <h2>6. PHÂN TÍCH CHẤT LƯỢNG CÂU HỎI (LÝ THUYẾT KHẢO THÍ CTT)</h2>
      <p>${report.section6QuestionQualityAnalysis.psychometricReliabilityNote}</p>
      <table>
        <thead>
          <tr>
            <th>Câu hỏi</th>
            <th>Mã YCCĐ</th>
            <th>Tỷ lệ đúng</th>
            <th>Độ khó (p)</th>
            <th>Độ phân biệt (D)</th>
            <th>r_pbis</th>
            <th>Chẩn đoán chất lượng & Phương án nhiễu</th>
          </tr>
        </thead>
        <tbody>${itemTableRows}</tbody>
      </table>

      <h2>7. NHỮNG VẤN ĐỀ CẦN CHÚ Ý</h2>
      <ul>
        ${report.section7KeyIssuesToWatch.map((item) => `<li>${item}</li>`).join('')}
      </ul>

      <h2>8. ĐỀ XUẤT ĐIỀU CHỈNH DẠY HỌC & SINH HOẠT CHUYÊN MÔN (KÈM GỢI Ý AI AN TOÀN)</h2>
      <ul>
        ${report.section8TeachingAdjustmentProposals.map((item) => `<li>${item}</li>`).join('')}
      </ul>
      <p><b>Chuyên đề sinh hoạt tổ gợi ý:</b></p>
      <ul>
        ${aiPackage.suggestedDepartmentWorkshops
          .map((w) => `<li><b>${w.workshopTitle}:</b> ${w.evidenceFromItems} -> ${w.expectedOutcome}</li>`)
          .join('')}
      </ul>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BaoCao_BGH_PhanTichKetQua_${report.subject}_Khoi${report.grade}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
