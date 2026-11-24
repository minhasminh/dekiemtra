import { CognitiveLevelCode, CurriculumTopic, EducationLevelId } from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_THCS_KHTN_SOURCE_DOC =
  'Phụ lục I – Kế hoạch dạy học của Tổ Khoa học Tự nhiên (Toán – Tin học – KHTN – Công nghệ Khối 6, 7, 8, 9) năm học 2026 – 2027 (Trường TH&THCS Nguyễn Đình Anh – Đan Điền, ngày 28/8/2026)';

export type RawThcsLessonInput = {
  id: string;
  week: string;
  lessonName: string;
  subLessonName?: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
};

export function buildThcsTopic(params: {
  id: string;
  grade: 6 | 7 | 8 | 9;
  subject:
    | 'Toán'
    | 'Tin học'
    | 'Khoa học tự nhiên'
    | 'Công nghệ'
    | 'Ngữ văn'
    | 'Lịch sử và Địa lí'
    | 'Giáo dục công dân'
    | 'Hoạt động trải nghiệm, hướng nghiệp'
    | 'Giáo dục địa phương'
    | 'Nghệ thuật (Âm nhạc)'
    | 'Nghệ thuật (Mĩ thuật)'
    | 'Tiếng Anh'
    | 'Giáo dục thể chất';
  chapterCode: string;
  chapterTitle: string;
  semester: 'HK1' | 'HK2';
  weekRange: string;
  totalPeriods: number;
  adjustedContentSummary: string;
  sourceDocument?: string;
  rawLessons: RawThcsLessonInput[];
}): CurriculumTopic {
  const {
    id,
    grade,
    subject,
    chapterCode,
    chapterTitle,
    semester,
    weekRange,
    totalPeriods,
    adjustedContentSummary,
    sourceDocument,
    rawLessons,
  } = params;

  const lessons = rawLessons.map((item) => ({
    ...item,
    integrationTags: extractIntegrationTags(`${item.adjustedContent} ${item.note || ''}`),
  }));

  const learningOutcomes = lessons.map((ls, idx) => ({
    code: `${chapterCode}-B${idx + 1}`,
    lessonName: ls.lessonName,
    duration: `${ls.periodAllocation} (${ls.periodsCount} tiết)`,
    description: `${ls.lessonName} [${ls.week} – ${ls.periodAllocation} (${ls.periodsCount} tiết)]: ${ls.adjustedContent}`,
    suggestedCognitiveLevel:
      idx % 4 === 0
        ? CognitiveLevelCode.SEC_NHAN_BIET
        : idx % 4 === 1
        ? CognitiveLevelCode.SEC_THONG_HIEU
        : idx % 4 === 2
        ? CognitiveLevelCode.SEC_VAN_DUNG
        : CognitiveLevelCode.SEC_VAN_DUNG_CAO,
  }));

  return {
    id,
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade,
    subject,
    chapterCode,
    chapterTitle,
    topicTitle: rawLessons.map((l) => `${l.lessonName} (${l.periodsCount} tiết)`).join('; '),
    semester,
    weekRange,
    durationText: `${totalPeriods} tiết (${weekRange})`,
    totalPeriods,
    adjustedContentSummary,
    sourceDocument: sourceDocument || NDA_THCS_KHTN_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1.1.1. MÔN TOÁN – LỚP 6 (CẢ NĂM: 140 TIẾT = HKI 72 TIẾT + HKII 68 TIẾT)
// ============================================================================
export const GRADE6_TOAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-toan-c1',
    grade: 6,
    subject: 'Toán',
    chapterCode: 'T6-C1',
    chapterTitle: 'Chương I. Tập hợp các số tự nhiên',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 3',
    totalPeriods: 12,
    adjustedContentSummary:
      'Tập hợp, cách ghi số tự nhiên, thứ tự và các phép tính cộng, trừ, nhân, chia, lũy thừa với số mũ tự nhiên. Định hướng phát triển NLS: 1.1.TC1b.',
    rawLessons: [
      {
        id: 't6-b1',
        week: 'Tuần 1',
        lessonName: 'Bài 1: Tập hợp',
        periodAllocation: 'Tiết 1',
        periodsCount: 1,
        adjustedContent:
          'YCCĐ: Nhận biết tập hợp và các phần tử của nó. Mô tả một tập hợp (cho một tập hợp). Sử dụng kí hiệu và cách diễn đạt toán học nhờ tập hợp. Định hướng phát triển NLS - AI: 1.1.TC1b.',
      },
      {
        id: 't6-b2',
        week: 'Tuần 1',
        lessonName: 'Bài 2: Cách ghi số tự nhiên',
        periodAllocation: 'Tiết 2',
        periodsCount: 1,
        adjustedContent:
          'YCCĐ: Nhận biết giá trị các chữ số của một số tự nhiên viết trong hệ thập phân. Biểu diễn mỗi số tự nhiên thành tổng giá trị các chữ số của nó. Đọc và viết số La Mã từ 1 đến 30.',
      },
      {
        id: 't6-b3',
        week: 'Tuần 1',
        lessonName: 'Bài 3: Thứ tự trong tập hợp các số tự nhiên',
        periodAllocation: 'Tiết 3',
        periodsCount: 1,
        adjustedContent:
          'YCCĐ: Nhận biết thứ tự trong tập hợp các số tự nhiên. So sánh hai số tự nhiên.',
      },
      {
        id: 't6-b4',
        week: 'Tuần 1',
        lessonName: 'Bài 4: Phép cộng và phép trừ số tự nhiên',
        periodAllocation: 'Tiết 4',
        periodsCount: 1,
        adjustedContent:
          'YCCĐ: Thực hiện phép cộng và phép trừ số tự nhiên. Áp dụng tính chất giao hoán, kết hợp của phép cộng để tính nhẩm, tính hợp lí. Giải quyết một số vấn đề thực tiễn gắn với việc thực hiện phép cộng và phép trừ.',
      },
      {
        id: 't6-b5',
        week: 'Tuần 2',
        lessonName: 'Bài 5: Phép nhân và phép chia số tự nhiên',
        periodAllocation: 'Tiết 5, 6',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Thực hiện phép nhân hai số tự nhiên; phép chia hai số tự nhiên (chia hết và chia có dư). Áp dụng tính chất của phép nhân và phép chia trong tính toán (tính nhẩm, tính hợp lí). Giải quyết được những vấn đề thực tiễn gắn với việc thực hiện phép nhân và phép chia số tự nhiên.',
      },
      {
        id: 't6-ltc1',
        week: 'Tuần 2',
        lessonName: 'Luyện tập chung (sau Bài 5)',
        periodAllocation: 'Tiết 7',
        periodsCount: 1,
        adjustedContent:
          'YCCĐ: Nâng cao kĩ năng giải toán và gắn kết các kiến thức, kĩ năng của các bài học (từ Bài 1 đến Bài 5) lại với nhau.',
      },
      {
        id: 't6-b6',
        week: 'Tuần 2, 3',
        lessonName: 'Bài 6: Lũy thừa với số mũ tự nhiên',
        periodAllocation: 'Tiết 8, 9',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Thực hiện phép tính nâng lên lũy thừa với số mũ tự nhiên. Nhân, chia hai lũy thừa cùng cơ số với số mũ tự nhiên. Giải quyết được những vấn đề thực tiễn gắn với thực hiện phép tính lũy thừa với số mũ tự nhiên.',
      },
      {
        id: 't6-b7',
        week: 'Tuần 3',
        lessonName: 'Bài 7: Thứ tự thực hiện các phép tính',
        periodAllocation: 'Tiết 10',
        periodsCount: 1,
        adjustedContent:
          'YCCĐ: Nhận biết thứ tự thực hiện các phép tính. Tính giá trị của một biểu thức.',
      },
      {
        id: 't6-ltc2-btcc1',
        week: 'Tuần 3',
        lessonName: 'Luyện tập chung & Bài tập cuối chương I',
        periodAllocation: 'Tiết 11, 12',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Củng cố kiến thức từ Bài 1 đến Bài 7, rèn luyện cho HS các kĩ năng vận dụng các kiến thức đã học để giải quyết các bài tập và các vấn đề thực tiễn.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-toan-c2',
    grade: 6,
    subject: 'Toán',
    chapterCode: 'T6-C2',
    chapterTitle: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên',
    semester: 'HK1',
    weekRange: 'Tuần 4 – Tuần 7',
    totalPeriods: 13,
    adjustedContentSummary:
      'Quan hệ chia hết, dấu hiệu chia hết cho 2, 5, 9, 3, số nguyên tố, ƯCLN và BCNN. Định hướng phát triển NLS - AI: 5.3.TC1a và 6.A3.1 (Hiểu cách AI hỗ trợ con người tìm "giải pháp tối ưu" giống như tìm ƯCLN để chia quà/phân nhóm).',
    rawLessons: [
      {
        id: 't6-b8',
        week: 'Tuần 4',
        lessonName: 'Bài 8: Quan hệ chia hết và tính chất',
        periodAllocation: 'Tiết 13, 14',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Nhận biết quan hệ chia hết, khái niệm ước và bội. Tìm các ước và bội của một số tự nhiên. Nhận biết tính chia hết của một tổng cho một số.',
      },
      {
        id: 't6-b9',
        week: 'Tuần 4',
        lessonName: 'Bài 9: Dấu hiệu chia hết',
        periodAllocation: 'Tiết 15, 16',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Vận dụng được dấu hiệu chia hết cho 2; 5; 9; 3 để xác định một số đã cho có chia hết cho 2; 5; 9; 3 hay không.',
      },
      {
        id: 't6-b10-ltc',
        week: 'Tuần 5',
        lessonName: 'Bài 10: Số nguyên tố & Luyện tập chung',
        periodAllocation: 'Tiết 17, 18, 19',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nhận biết khái niệm số nguyên tố và hợp số. Phân tích một số tự nhiên lớn hơn 1 ra thừa số nguyên tố trong những trường hợp đơn giản. Củng cố kiến thức từ Bài 8 đến Bài 10.',
      },
      {
        id: 't6-b11',
        week: 'Tuần 5, 6',
        lessonName: 'Bài 11: Ước chung. Ước chung lớn nhất',
        periodAllocation: 'Tiết 20, 21',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Xác định ước chung, ước chung lớn nhất của hai hoặc ba số tự nhiên đã cho. Nhận biết phân số tối giản. Định hướng phát triển NLS - AI: 5.3.TC1a; AI 6.A3.1: Hiểu cách AI hỗ trợ con người tìm "giải pháp tối ưu" (giống như tìm ƯCLN để chia quà/phân nhóm).',
      },
      {
        id: 't6-b12',
        week: 'Tuần 6',
        lessonName: 'Bài 12: Bội chung. Bội chung nhỏ nhất',
        periodAllocation: 'Tiết 22, 23',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Tìm bội chung, bội chung nhỏ nhất của hai hoặc ba số tự nhiên. Sử dụng bội chung nhỏ nhất để quy đồng mẫu các phân số và cộng, trừ phân số. Định hướng phát triển NLS - AI: 5.3.TC1a.',
      },
      {
        id: 't6-ltc-btcc2',
        week: 'Tuần 6, 7',
        lessonName: 'Luyện tập chung & Bài tập cuối chương II',
        periodAllocation: 'Tiết 24, 25',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Củng cố, rèn luyện kĩ năng phân tích một số ra thừa số nguyên tố, tìm ƯCLN và BCNN, vận dụng ƯCLN và BCNN trong một số bài toán thực tiễn. Định hướng phát triển NLS - AI: 5.3.TC1a.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-toan-c4-c3-c5-hk1',
    grade: 6,
    subject: 'Toán',
    chapterCode: 'T6-C3-4-5',
    chapterTitle: 'Chương IV. Một số hình phẳng trong thực tiễn; Chương III. Số nguyên & Chương V. Tính đối xứng của hình phẳng',
    semester: 'HK1',
    weekRange: 'Tuần 7 – Tuần 18',
    totalPeriods: 47,
    adjustedContentSummary:
      'Hình phẳng trong thực tiễn, kiểm tra giữa kì I, tập hợp số nguyên và 4 phép tính số nguyên, hình có trục đối xứng và tâm đối xứng, thực hành GeoGebra và kiểm tra học kì I. Định hướng phát triển NLS - AI: 1.1.TC1b, 5.2.TC1b, 2.1.TC1a, 5.3.TC2a.',
    rawLessons: [
      {
        id: 't6-b18',
        week: 'Tuần 7',
        lessonName: 'Bài 18: Hình tam giác đều. Hình vuông. Hình lục giác đều',
        periodAllocation: 'Tiết 26, 27, 28',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nhận dạng các hình trong bài. Mô tả một số yếu tố cơ bản của hình tam giác đều, hình vuông, hình lục giác đều. Vẽ hình tam giác đều, hình vuông bằng dụng cụ học tập. Tạo lập được hình lục giác đều thông qua việc lắp ghép các hình tam giác đều. Định hướng phát triển NLS - AI: 1.1.TC1b, 5.2.TC1b.',
      },
      {
        id: 't6-b19',
        week: 'Tuần 8',
        lessonName: 'Bài 19: Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân',
        periodAllocation: 'Tiết 29, 30, 31',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Mô tả một số yếu tố cơ bản (cạnh, đỉnh, góc) của hình chữ nhật, hình thoi, hình bình hành, hình thang cân. Vẽ hình chữ nhật, hình thoi, hình bình hành bằng các dụng cụ học tập. Định hướng phát triển NLS - AI: 1.1.TC1b, 5.2.TC1b.',
      },
      {
        id: 't6-ot-kt-gk1',
        week: 'Tuần 8, 9',
        lessonName: 'Ôn tập giữa kì I & Kiểm tra giữa kỳ I',
        periodAllocation: 'Tiết 32, 33, 34, 35',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hệ thống và củng cố các kiến thức đã học về Chương I, II, IV. Kiểm tra, đánh giá (90 phút, viết trên giấy) các kiến thức, kĩ năng học sinh được hình thành và rèn luyện trong nửa đầu học kì I.',
      },
      {
        id: 't6-b20-btcc4',
        week: 'Tuần 9 – 11',
        lessonName: 'Bài 20: Chu vi và diện tích của một số tứ giác đã học; Luyện tập chung & Bài tập cuối chương IV',
        periodAllocation: 'Tiết 36 – 42',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Giải quyết được một số vấn đề thực tiễn gắn với việc tính chu vi, tính diện tích của hình chữ nhật, hình thoi, hình bình hành, hình thang. Lồng ghép: Bảo vệ một số dữ liệu cá nhân của mình.',
      },
      {
        id: 't6-b13-b14',
        week: 'Tuần 11, 12',
        lessonName: 'Bài 13: Tập hợp các số nguyên & Bài 14: Phép cộng và phép trừ số nguyên',
        periodAllocation: 'Tiết 43 – 47',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết, đọc và viết số nguyên; ý nghĩa số nguyên âm trong thực tế; biểu diễn và so sánh số nguyên; tìm kiếm trên Internet các hình ảnh gắn với số nguyên. Thực hiện phép cộng, trừ hai số nguyên; lựa chọn phương tiện phù hợp để tính toán. Định hướng phát triển NLS - AI: 2.1.TC1a.',
      },
      {
        id: 't6-b15-b16-b17-btcc3',
        week: 'Tuần 12 – 15',
        lessonName: 'Bài 15: Quy tắc dấu ngoặc; Bài 16: Phép nhân số nguyên; Bài 17: Phép chia hết. Ước và bội của một số nguyên & Bài tập cuối chương III',
        periodAllocation: 'Tiết 48 – 57',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Áp dụng quy tắc dấu ngoặc; thực hiện phép nhân và phép chia hết đối với số nguyên; tìm ước và bội của một số nguyên; cách tìm và tạo bảng, nhập chỉnh kết quả khi tìm ước bội trên máy tính. Định hướng phát triển NLS - AI: 2.1.TC1a.',
      },
      {
        id: 't6-b21-b22-btcc5',
        week: 'Tuần 15, 16',
        lessonName: 'Bài 21: Hình có trục đối xứng; Bài 22: Hình có tâm đối xứng; Luyện tập chung & Bài tập cuối chương V',
        periodAllocation: 'Tiết 58 – 63',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nhận biết hình có trục đối xứng và hình có tâm đối xứng; gấp giấy để cắt chữ hoặc hoa văn trang trí có tính đối xứng; khôi phục hình đối xứng từ một phần cho trước. Định hướng phát triển NLS - AI: 1.1.TC1b.',
      },
      {
        id: 't6-hdtn-hk1-kt-hk1',
        week: 'Tuần 16 – 18',
        lessonName: 'Tấm thiệp và phòng học của em; Ôn tập & Kiểm tra học kì I; Vẽ hình đơn giản với phần mềm GeoGebra; Sử dụng máy tính cầm tay',
        periodAllocation: 'Tiết 64 – 72',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Ứng dụng kiến thức hình phẳng vào thực tiễn (mĩ thuật, thủ công, xác định phòng học đạt mức chuẩn ánh sáng). Ôn tập và Kiểm tra học kì I (90 phút). Sử dụng phần mềm GeoGebra vẽ các hình đơn giản và hình có tính chất đối xứng; sử dụng máy tính cầm tay. Định hướng phát triển NLS - AI: 5.3.TC2a.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-toan-c6-c7-hk2',
    grade: 6,
    subject: 'Toán',
    chapterCode: 'T6-C6-7',
    chapterTitle: 'Chương VI. Phân số & Chương VII. Số thập phân',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 25',
    totalPeriods: 25,
    adjustedContentSummary:
      'Mở rộng phân số, so sánh phân số, hỗn số dương, các phép tính về phân số và hai bài toán về phân số; số thập phân, tính toán với số thập phân, làm tròn và ước lượng, tỉ số và tỉ số phần trăm.',
    rawLessons: [
      {
        id: 't6-b23-b24-ltc',
        week: 'Tuần 19, 20',
        lessonName: 'Bài 23: Mở rộng phân số. Phân số bằng nhau; Bài 24: So sánh phân số. Hỗn số dương & Luyện tập chung',
        periodAllocation: 'Tiết 73 – 78',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nhận biết phân số với tử và mẫu là các số nguyên; hai phân số bằng nhau; rút gọn và quy đồng mẫu nhiều phân số; so sánh phân số và nhận biết hỗn số dương.',
      },
      {
        id: 't6-b25-b26-b27-btcc6',
        week: 'Tuần 20 – 22',
        lessonName: 'Bài 25: Phép cộng và phép trừ phân số; Bài 26: Phép nhân và phép chia phân số; Bài 27: Hai bài toán về phân số & Bài tập cuối chương VI',
        periodAllocation: 'Tiết 79 – 87',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Thực hiện phép cộng, trừ, nhân, chia phân số; vận dụng tính chất phép tính trong tính toán; tìm giá trị phân số của một số cho trước và tìm một số biết giá trị phân số của nó.',
      },
      {
        id: 't6-b28-b29-b30-b31-btcc7',
        week: 'Tuần 22 – 25',
        lessonName: 'Bài 28: Số thập phân; Bài 29: Tính toán với số thập phân; Bài 30: Làm tròn và ước lượng; Bài 31: Một số bài toán về tỉ số và tỉ số phần trăm & Bài tập cuối chương VII',
        periodAllocation: 'Tiết 88 – 97',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Nhận biết số thập phân âm, số đối và so sánh hai số thập phân; thực hiện cộng, trừ, nhân, chia số thập phân; làm tròn và ước lượng kết quả phép đo, phép tính; giải quyết bài toán thực tiễn liên quan đến tỉ số và tỉ số phần trăm.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-toan-c8-c9-hk2',
    grade: 6,
    subject: 'Toán',
    chapterCode: 'T6-C8-9',
    chapterTitle: 'Chương VIII. Những hình học cơ bản & Chương IX. Dữ liệu và xác suất thực nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 25 – Tuần 35',
    totalPeriods: 43,
    adjustedContentSummary:
      'Điểm, đường thẳng, tia, đoạn thẳng, trung điểm của đoạn thẳng, góc và số đo góc; thu thập dữ liệu, bảng thống kê, biểu đồ tranh, biểu đồ cột, biểu đồ cột kép, xác suất thực nghiệm, kế hoạch chi tiêu cá nhân và gia đình, thực hành GeoGebra. Định hướng phát triển NLS - AI: 1.1.TC1b, 5.2.TC1b, 5.1.TC1a, 5.2.TC1c, 5.3.TC2a, 1.2.TC1a, 2.2.TC1c, 6.2.TC1a và AI 6.A3.1.',
    rawLessons: [
      {
        id: 't6-b32-b33-b34-b35',
        week: 'Tuần 25 – 27',
        lessonName: 'Bài 32: Điểm và đường thẳng; Bài 33: Điểm nằm giữa hai điểm. Tia; Bài 34: Đoạn thẳng. Độ dài đoạn thẳng; Bài 35: Trung điểm của đoạn thẳng & Luyện tập chung',
        periodAllocation: 'Tiết 98 – 106',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nhận biết quan hệ điểm thuộc đường thẳng, ba điểm thẳng hàng, hai đường thẳng cắt nhau, song song; khái niệm tia, hai tia đối nhau; đo độ dài đoạn thẳng và trung điểm của đoạn thẳng. Định hướng phát triển NLS - AI: 1.1.TC1b, 5.2.TC1b.',
      },
      {
        id: 't6-ot-kt-gk2-b36-b37',
        week: 'Tuần 27 – 29',
        lessonName: 'Ôn tập & Kiểm tra giữa kì II; Bài 36: Góc; Bài 37: Số đo góc; Luyện tập chung & Bài tập cuối chương VIII',
        periodAllocation: 'Tiết 107 – 116',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Kiểm tra, đánh giá giữa kì II (90 phút). Nhận biết góc, đỉnh, cạnh của góc, góc bẹt, điểm trong của góc; nhận biết khái niệm số đo góc và các góc đặc biệt (vuông, nhọn, tù) thông qua đo, quan sát, vẽ bằng phần mềm. Định hướng phát triển NLS - AI: 5.1.TC1a, 5.2.TC1b, 5.2.TC1c, 5.3.TC2a.',
      },
      {
        id: 't6-b38-b39-b40-b41',
        week: 'Tuần 30 – 32',
        lessonName: 'Bài 38: Dữ liệu và thu thập dữ liệu; Bài 39: Bảng thống kê và biểu đồ tranh; Bài 40: Biểu đồ cột; Bài 41: Biểu đồ cột kép & Luyện tập chung',
        periodAllocation: 'Tiết 117 – 126',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Phân biệt dữ liệu định lượng và định tính; đọc, mô tả và biểu diễn dữ liệu vào bảng thống kê, biểu đồ tranh, biểu đồ cột và biểu đồ cột kép. Định hướng phát triển NLS - AI: 1.1.TC1b, 1.2.TC1a, 2.2.TC1c.',
      },
      {
        id: 't6-b42-b43-kt-hk2',
        week: 'Tuần 32 – 34',
        lessonName: 'Bài 42: Kết quả có thể và sự kiện trong trò chơi, thí nghiệm; Bài 43: Xác suất thực nghiệm; Bài tập cuối chương IX; Ôn tập & Kiểm tra kỳ II',
        periodAllocation: 'Tiết 127 – 136',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Nhận biết tính không đoán trước về kết quả trò chơi, thí nghiệm; biểu diễn khả năng xảy ra một sự kiện theo xác suất thực nghiệm. Ôn tập và Kiểm tra cuối học kì II (90 phút). Định hướng phát triển NLS - AI: 5.3.TC2a.',
      },
      {
        id: 't6-hdtn-hk2',
        week: 'Tuần 35',
        lessonName: 'Kế hoạch chi tiêu cá nhân và gia đình; Hoạt động thể thao nào được yêu thích nhất trong hè?; Vẽ hình đơn giản với phần mềm GeoGebra',
        periodAllocation: 'Tiết 137 – 140',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Xây dựng kế hoạch đơn giản về tài chính, giáo dục ý thức chi tiêu có kế hoạch; thu thập và phân tích dữ liệu thống kê; vẽ hình có trục đối xứng, tâm đối xứng bằng GeoGebra. Định hướng phát triển NLS - AI: AI 6.A3.1 (Nêu được ví dụ về tình huống con người ra quyết định với sự hỗ trợ của AI trong y tế, giao thông; thực hành ra quyết định trong tình huống giả định có gợi ý của AI); NLS 5.3.TC2a, 6.2.TC1a (Sử dụng được các công cụ AI trong công việc và học tập hàng ngày).',
      },
    ],
  }),
];

// ============================================================================
// 1.1.2. MÔN TOÁN – LỚP 7 (CẢ NĂM: 140 TIẾT = HKI 72 TIẾT + HKII 68 TIẾT)
// ============================================================================
export const GRADE7_TOAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-toan-c1-c2-c3-hk1',
    grade: 7,
    subject: 'Toán',
    chapterCode: 'T7-C1-2-3',
    chapterTitle: 'Chương I. Số hữu tỉ; Chương II. Số thực & Chương III. Góc và đường thẳng song song',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 10',
    totalPeriods: 38,
    adjustedContentSummary:
      'Tập hợp số hữu tỉ Q và các phép tính, lũy thừa của số hữu tỉ; số thập phân vô hạn tuần hoàn, số vô tỉ, căn bậc hai số học, tập hợp số thực R; góc ở vị trí đặc biệt, tia phân giác, hai đường thẳng song song, tiên đề Euclid, định lí và chứng minh định lí, Kiểm tra giữa HKI. Định hướng phát triển NLS - AI: 5.2.TC1b, 5.3.TC1a, 2.1.TC1a, 5.2.TC1a.',
    rawLessons: [
      {
        id: 't7-c1-b1-b4',
        week: 'Tuần 1 – 4',
        lessonName: 'Chương I: Bài 1. Tập hợp các số hữu tỉ; Bài 2. Cộng, trừ, nhân, chia số hữu tỉ; Bài 3. Lũy thừa với số mũ tự nhiên của một số hữu tỉ; Bài 4. Thứ tự thực hiện các phép tính. Quy tắc chuyển vế & Bài tập cuối chương I',
        periodAllocation: 'Tiết 1 – 13',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết số hữu tỉ, biểu diễn số hữu tỉ trên trục số; thực hiện cộng, trừ, nhân, chia, lũy thừa trong Q; vận dụng quy tắc chuyển vế và thứ tự thực hiện phép tính giải quyết vấn đề thực tiễn. Định hướng phát triển NLS - AI: 5.2.TC1b (Bài 1), 5.3.TC1a (Bài 2).',
      },
      {
        id: 't7-c2-b5-b7',
        week: 'Tuần 4 – 6',
        lessonName: 'Chương II: Bài 5. Làm quen với số thập phân vô hạn tuần hoàn; Bài 6. Số vô tỉ. Căn bậc hai số học; Bài 7. Tập hợp các số thực & Bài tập cuối chương II',
        periodAllocation: 'Tiết 14 – 23',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Nhận biết số thập phân hữu hạn và vô hạn tuần hoàn, làm tròn số theo độ chính xác cho trước; tính căn bậc hai số học bằng máy tính cầm tay; nhận biết số thực, số đối và giá trị tuyệt đối của số thực. Định hướng phát triển NLS - AI: 5.2.TC1b (Bài 6).',
      },
      {
        id: 't7-c3-b8-b11-kt-gk1',
        week: 'Tuần 6 – 10',
        lessonName: 'Chương III: Bài 8. Góc ở vị trí đặc biệt. Tia phân giác của một góc; Bài 9. Hai đường thẳng song song và dấu hiệu nhận biết; Bài 10. Tiên đề Euclid. Tính chất của hai đường thẳng song song; Bài 11. Định lý và chứng minh định lý; Ôn tập & Kiểm tra giữa HKI',
        periodAllocation: 'Tiết 24 – 38',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Nhận biết hai góc kề bù, đối đỉnh, tia phân giác của một góc; dấu hiệu nhận biết và tính chất hai đường thẳng song song; tiên đề Euclid; nhận biết giả thiết, kết luận và làm quen chứng minh định lí. Kiểm tra giữa HKI (90 phút). Định hướng phát triển NLS - AI: 5.2.TC1b (Bài 8), 2.1.TC1a & 5.2.TC1a (Bài 11).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-toan-c4-c5-hk1',
    grade: 7,
    subject: 'Toán',
    chapterCode: 'T7-C4-5',
    chapterTitle: 'Chương IV. Tam giác bằng nhau & Chương V. Thu thập và biểu diễn dữ liệu',
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 18',
    totalPeriods: 34,
    adjustedContentSummary:
      'Tổng các góc trong một tam giác, hai tam giác bằng nhau (c.c.c, c.g.c, g.c.g) và các trường hợp bằng nhau của tam giác vuông, tam giác cân, đường trung trực; thu thập và phân loại dữ liệu, biểu đồ hình quạt tròn, biểu đồ đoạn thẳng, thực hành GeoGebra và Kiểm tra cuối HKI. Định hướng phát triển NLS - AI: 2.1.TC1a, 5.2.TC1a, 1.1.TC1b, 2.3.TC1b, 2.4.TC1a, 5.2.TC1b.',
    rawLessons: [
      {
        id: 't7-c4-b12-b16',
        week: 'Tuần 10 – 13',
        lessonName: 'Chương IV: Bài 12. Tổng các góc của một tam giác; Bài 13, 14. Các trường hợp bằng nhau của tam giác; Bài 15. Các trường hợp bằng nhau của tam giác vuông; Bài 16. Tam giác cân. Đường trung trực của đoạn thẳng & Bài tập cuối chương IV',
        periodAllocation: 'Tiết 39 – 52',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Giải thích định lí tổng các góc trong một tam giác; lập luận và chứng minh hai tam giác bằng nhau, hai tam giác vuông bằng nhau; giải thích tính chất tam giác cân và đường trung trực của đoạn thẳng. Định hướng phát triển NLS - AI: 2.1.TC1a & 5.2.TC1a (Bài 12), 5.2.TC1a (Bài 16).',
      },
      {
        id: 't7-c5-b17-b19',
        week: 'Tuần 14 – 16',
        lessonName: 'Chương V: Bài 17. Thu thập và phân loại dữ liệu; Bài 18. Biểu đồ hình quạt tròn; Bài 19. Biểu đồ đoạn thẳng & Bài tập cuối chương V',
        periodAllocation: 'Tiết 53 – 63',
        periodsCount: 11,
        adjustedContent:
          'YCCĐ: Thu thập, phân loại dữ liệu và nhận biết tính đại diện của dữ liệu; đọc, mô tả, vẽ và phân tích dữ liệu từ biểu đồ hình quạt tròn và biểu đồ đoạn thẳng. Định hướng phát triển NLS - AI: 1.1.TC1b (Bài 17), 1.1.TC1b, 2.3.TC1b, 2.4.TC1a (Bài 18, Bài 19).',
      },
      {
        id: 't7-hdtn-kt-hk1',
        week: 'Tuần 16 – 18',
        lessonName: 'Hoạt động thực hành trải nghiệm: Vẽ hình với phần mềm GeoGebra; Dân số và cơ cấu dân số Việt Nam; Ôn tập & Kiểm tra cuối HKI',
        periodAllocation: 'Tiết 64 – 72',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Sử dụng phần mềm GeoGebra vẽ các hình đơn giản (đường thẳng song song, vuông góc, trung trực, phân giác, tam giác); tìm hiểu dân số và cơ cấu dân số Việt Nam. Ôn tập và Kiểm tra cuối HKI (90 phút). Định hướng phát triển NLS - AI: 5.2.TC1b, 2.4.TC1a.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-toan-c6-c9-c7-hk2',
    grade: 7,
    subject: 'Toán',
    chapterCode: 'T7-C6-9-7',
    chapterTitle: 'Chương VI. Tỉ lệ thức và đại lượng tỉ lệ; Chương IX. Quan hệ giữa các yếu tố trong một tam giác & Chương VII. Biểu thức đại số và đa thức một biến',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 30',
    totalPeriods: 45,
    adjustedContentSummary:
      'Tỉ lệ thức, tính chất dãy tỉ số bằng nhau, đại lượng tỉ lệ thuận và tỉ lệ nghịch; quan hệ giữa góc và cạnh đối diện, đường vuông góc và đường xiên, bất đẳng thức tam giác, sự đồng quy của ba đường trung tuyến, phân giác, trung trực, đường cao; biểu thức đại số và đa thức một biến. Định hướng phát triển NLS - AI: 1.1.TC1b, 6.2.TC1a, 5.2.TC1b, 5.2.TC1a và AI 7.D1.1.',
    rawLessons: [
      {
        id: 't7-c6-b20-b23',
        week: 'Tuần 19 – 21',
        lessonName: 'Chương VI: Bài 20. Tỉ lệ thức; Bài 21. Tính chất của dãy tỉ số bằng nhau; Bài 22. Đại lượng tỉ lệ thuận; Bài 23. Đại lượng tỉ lệ nghịch & Bài tập cuối chương VI',
        periodAllocation: 'Tiết 73 – 84',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và vận dụng tính chất tỉ lệ thức, dãy tỉ số bằng nhau; giải một số bài toán đơn giản về đại lượng tỉ lệ thuận và đại lượng tỉ lệ nghịch. Định hướng phát triển NLS - AI: 1.1.TC1b (Bài 22), 6.2.TC1a (Bài 23).',
      },
      {
        id: 't7-c9-b31-b35',
        week: 'Tuần 22 – 25',
        lessonName: 'Chương IX: Bài 31. Quan hệ giữa góc và cạnh đối diện trong tam giác; Bài 32. Quan hệ giữa đường vuông góc và đường xiên; Bài 33. Quan hệ giữa ba cạnh của một tam giác; Bài 34, 35. Sự đồng quy của ba đường trung tuyến, phân giác, trung trực, đường cao trong một tam giác & Bài tập cuối chương IX',
        periodAllocation: 'Tiết 85 – 97',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết quan hệ giữa góc và cạnh đối diện, đường vuông góc và đường xiên, liên hệ độ dài ba cạnh của một tam giác; nhận biết sự đồng quy của ba đường trung tuyến, ba đường phân giác, ba đường trung trực, ba đường cao trong một tam giác. Định hướng phát triển NLS - AI: AI 7.D1.1 tại Bài 32 (Giúp học sinh hiểu ứng dụng của nguyên lý hình học "đường vuông góc là khoảng cách ngắn nhất" trong việc thiết kế thuật toán tìm đường tối ưu Pathfinding cho robot học và xe tự lái); NLS 5.2.TC1b (Bài 34, 35).',
      },
      {
        id: 't7-c7-b24-b28-kt-gk2',
        week: 'Tuần 25 – 30',
        lessonName: 'Chương VII: Bài 24. Biểu thức đại số; Bài 25. Đa thức một biến; Bài 26. Phép cộng và phép trừ đa thức một biến; Ôn tập & Kiểm tra giữa HKII; Bài 27. Phép nhân đa thức một biến; Bài 28. Phép chia đa thức một biến & Bài tập cuối chương VII',
        periodAllocation: 'Tiết 98 – 117',
        periodsCount: 20,
        adjustedContent:
          'YCCĐ: Tính giá trị biểu thức đại số; thu gọn, sắp xếp, tìm bậc, hệ số và nghiệm của đa thức một biến; thực hiện cộng, trừ, nhân, chia đa thức một biến. Kiểm tra giữa HKII (90 phút). Định hướng phát triển NLS - AI: 5.2.TC1a (Bài 25).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-toan-c8-c10-hk2',
    grade: 7,
    subject: 'Toán',
    chapterCode: 'T7-C8-10',
    chapterTitle: 'Chương VIII. Làm quen với biến cố và xác suất của biến cố & Chương X. Một số hình khối trong thực tiễn',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 35',
    totalPeriods: 23,
    adjustedContentSummary:
      'Làm quen với biến cố và xác suất của biến cố; hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác và tứ giác; hoạt động thực hành trải nghiệm (Hộp quà và chân đế lịch để bàn của em - STEM) và Kiểm tra cuối kì II. Định hướng phát triển NLS - AI: 5.2.TC2a, 1.1.TC1b, 5.2.TC1b và AI 7.A1.2, 7.A2.1.',
    rawLessons: [
      {
        id: 't7-c8-b29-b30',
        week: 'Tuần 30, 31',
        lessonName: 'Chương VIII: Bài 29. Làm quen với biến cố; Bài 30. Làm quen với xác suất của biến cố; Luyện tập chung & Bài tập cuối chương VIII',
        periodAllocation: 'Tiết 118 – 123',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Làm quen với khái niệm biến cố ngẫu nhiên, biến cố chắc chắn, biến cố không thể và xác suất của biến cố ngẫu nhiên trong một số ví dụ đơn giản. Định hướng phát triển NLS - AI: 5.2.TC2a; AI 7.A1.2 & 7.A2.1 tại Bài 29 (Giúp học sinh nhận thức sâu sắc rằng các mô hình dự báo của AI luôn đối mặt với biến cố ngẫu nhiên như chẩn đoán sai, nhận diện nhầm; từ đó hiểu lý do vì sao con người phải giữ quyền quyết định cuối cùng trong các lĩnh vực quan trọng).',
      },
      {
        id: 't7-c10-b36-b37-kt-hk2',
        week: 'Tuần 31 – 35',
        lessonName: 'Chương X: Bài 36. Hình hộp chữ nhật và hình lập phương; Bài 37. Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác; Ôn tập & Kiểm tra cuối kỳ II; Hoạt động thực hành trải nghiệm (Đại lượng tỉ lệ trong đời sống; Vòng quay may mắn; STEM: Hộp quà và chân đế lịch để bàn của em)',
        periodAllocation: 'Tiết 124 – 140',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Mô tả yếu tố cơ bản và giải quyết vấn đề thực tiễn gắn với tính diện tích xung quanh, thể tích của hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác và tứ giác. Thực hành tính lãi suất tiết kiệm (Quy tắc 72) và thiết kế STEM Hộp quà, chân đế lịch để bàn. Kiểm tra cuối kì II (90 phút). Định hướng phát triển NLS - AI: 1.1.TC1b (Bài 36, 37), 5.2.TC1b (HĐ trải nghiệm).',
      },
    ],
  }),
];

// ============================================================================
// 1.1.3. MÔN TOÁN – LỚP 8 (CẢ NĂM: 140 TIẾT = HKI 72 TIẾT + HKII 68 TIẾT)
// ============================================================================
export const GRADE8_TOAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-toan-c1-c3-c2-hk1',
    grade: 8,
    subject: 'Toán',
    chapterCode: 'T8-C1-3-2',
    chapterTitle: 'Chương I. Đa thức; Chương III. Tứ giác & Chương II. Hằng đẳng thức đáng nhớ và ứng dụng',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 12',
    totalPeriods: 45,
    adjustedContentSummary:
      'Đơn thức, đa thức và các phép tính cộng, trừ, nhân, chia đa thức; tứ giác, hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông và Kiểm tra giữa HKI; bảy hằng đẳng thức đáng nhớ và phân tích đa thức thành nhân tử. Định hướng phát triển NLS - AI: 6.1.TC2a, 1.1.TC2b, 2.1.TC2a, 5.3.TC2a, 3.1.TC2b và AI 8.A1.2.',
    rawLessons: [
      {
        id: 't8-c1-b1-b5',
        week: 'Tuần 1 – 4',
        lessonName: 'Chương I: Bài 1. Đơn thức; Bài 2. Đa thức; Bài 3. Phép cộng và phép trừ đa thức; Bài 4. Phép nhân đa thức; Bài 5. Phép chia đa thức cho đơn thức & Bài tập cuối chương I',
        periodAllocation: 'Tiết 1 – 13',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết đơn thức, đa thức nhiều biến, thu gọn và tìm bậc; thực hiện cộng, trừ, nhân đa thức và chia đa thức cho đơn thức (trường hợp chia hết). Định hướng phát triển NLS - AI: 6.1.TC2a (Bài 1).',
      },
      {
        id: 't8-c3-b10-b14-kt-gk1',
        week: 'Tuần 4 – 8',
        lessonName: 'Chương III: Bài 10. Tứ giác; Bài 11. Hình thang cân; Bài 12. Hình bình hành; Bài 13. Hình chữ nhật; Bài 14. Hình thoi và hình vuông; Ôn tập & Kiểm tra giữa HKI',
        periodAllocation: 'Tiết 14 – 32',
        periodsCount: 19,
        adjustedContent:
          'YCCĐ: Giải thích định lí tổng các góc của tứ giác lồi; mô tả khái niệm, tính chất và dấu hiệu nhận biết hình thang cân, hình bình hành, hình chữ nhật, hình thoi và hình vuông. Kiểm tra giữa HKI (90 phút). Định hướng phát triển NLS - AI: 1.1.TC2b & 2.1.TC2a (Bài 11), 5.3.TC2a (Bài 12, 13, 14).',
      },
      {
        id: 't8-c2-b6-b9',
        week: 'Tuần 9 – 12',
        lessonName: 'Chương II: Bài 6. Hiệu hai bình phương. Bình phương của một tổng hay một hiệu; Bài 7. Lập phương của một tổng hay một hiệu; Bài 8. Tổng và hiệu hai lập phương; Bài 9. Phân tích đa thức thành nhân tử & Bài tập cuối chương II',
        periodAllocation: 'Tiết 33 – 45',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Mô tả và vận dụng 7 hằng đẳng thức đáng nhớ để khai triển, tính nhanh, rút gọn biểu thức; phân tích đa thức thành nhân tử (đặt nhân tử chung, nhóm các hạng tử, dùng hằng đẳng thức). Định hướng phát triển NLS - AI: 3.1.TC2b (Bài 6); AI 8.A1.2 tại Bài 9 (Hiểu rủi ro khi lạm dụng AI tạo sinh giải toán làm suy giảm tư duy phản biện, từ đó nhấn mạnh sự cần thiết của việc tự suy luận toán học).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-toan-c4-c5-hk1',
    grade: 8,
    subject: 'Toán',
    chapterCode: 'T8-C4-5',
    chapterTitle: 'Chương IV. Định lí Thalès & Chương V. Dữ liệu và biểu đồ',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 18',
    totalPeriods: 27,
    adjustedContentSummary:
      'Định lí Thalès trong tam giác, đường trung bình và tính chất đường phân giác của tam giác; thu thập, phân loại, biểu diễn và phân tích dữ liệu thống kê dựa vào biểu đồ; hoạt động thực hành trải nghiệm (Công thức lãi kép, GeoGebra, Phân tích đặc điểm khí hậu Việt Nam) và Kiểm tra cuối HKI. Định hướng phát triển NLS - AI: 5.3.TC2a, 1.1.TC2b, 5.2.TC2b, 1.2.TC2a, 2.2.TC2a.',
    rawLessons: [
      {
        id: 't8-c4-b15-b17',
        week: 'Tuần 12 – 14',
        lessonName: 'Chương IV: Bài 15. Định lí Thalès trong tam giác; Bài 16. Đường trung bình của tam giác; Bài 17. Tính chất đường phân giác của tam giác & Bài tập cuối chương IV',
        periodAllocation: 'Tiết 46 – 53',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nắm vững định lí Thalès thuận và đảo, tính chất đường trung bình và đường phân giác của tam giác để tính độ dài đoạn thẳng và giải quyết vấn đề thực tiễn. Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 15, Bài 17).',
      },
      {
        id: 't8-c5-b18-b20-kt-hk1',
        week: 'Tuần 14 – 18',
        lessonName: 'Chương V: Bài 18. Thu thập và phân loại dữ liệu; Bài 19. Biểu diễn dữ liệu bằng bảng, biểu đồ; Bài 20. Phân tích số liệu thống kê dựa vào biểu đồ; HĐ trải nghiệm (Công thức lãi kép; Tính toán đa thức và vẽ hình với GeoGebra; Phân tích đặc điểm khí hậu Việt Nam); Ôn tập & Kiểm tra cuối HKI',
        periodAllocation: 'Tiết 54 – 72',
        periodsCount: 19,
        adjustedContent:
          'YCCĐ: Thu thập, phân loại số liệu rời rạc và liên tục; chuyển dữ liệu giữa các dạng biểu diễn và phân tích số liệu thống kê; vận dụng công thức lãi kép và phần mềm GeoGebra. Kiểm tra cuối HKI (90 phút). Định hướng phát triển NLS - AI: 1.1.TC2b, 5.2.TC2b, 1.2.TC2a, 2.2.TC2a.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-toan-c6-c9-c7-hk2',
    grade: 8,
    subject: 'Toán',
    chapterCode: 'T8-C6-9-7',
    chapterTitle: 'Chương VI. Phân thức đại số; Chương IX. Tam giác đồng dạng & Chương VII. Phương trình bậc nhất và hàm số bậc nhất',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 30',
    totalPeriods: 46,
    adjustedContentSummary:
      'Phân thức đại số, tính chất cơ bản và các phép tính cộng, trừ, nhân, chia phân thức đại số; ba trường hợp đồng dạng của hai tam giác, định lí Pythagore, các trường hợp đồng dạng của tam giác vuông, hình đồng dạng và Kiểm tra giữa HKII; phương trình bậc nhất một ẩn, giải bài toán bằng cách lập phương trình, hàm số bậc nhất và hệ số góc của đường thẳng. Định hướng phát triển NLS - AI: 5.3.TC2a, 2.2.TC2b.',
    rawLessons: [
      {
        id: 't8-c6-b21-b24',
        week: 'Tuần 19 – 22',
        lessonName: 'Chương VI: Bài 21. Phân thức đại số; Bài 22. Tính chất cơ bản của phân thức đại số; Bài 23. Phép cộng và phép trừ phân thức đại số; Bài 24. Phép nhân và phép chia phân thức đại số & Bài tập cuối chương VI',
        periodAllocation: 'Tiết 73 – 85',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Viết điều kiện xác định và tính giá trị phân thức đại số; rút gọn, quy đồng mẫu thức và thực hiện cộng, trừ, nhân, chia phân thức đại số.',
      },
      {
        id: 't8-c9-b33-b37-kt-gk2',
        week: 'Tuần 22 – 26',
        lessonName: 'Chương IX: Bài 33. Hai tam giác đồng dạng; Bài 34. Ba trường hợp đồng dạng của hai tam giác; Bài 35. Định lí Pythagore và ứng dụng; Bài 36. Các trường hợp đồng dạng của hai tam giác vuông; Bài 37. Hình đồng dạng; Ôn tập & Kiểm tra giữa HKII',
        periodAllocation: 'Tiết 86 – 103',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Nhận biết và giải thích hai tam giác đồng dạng, tam giác vuông đồng dạng; vận dụng định lí Pythagore tính độ dài cạnh và giải quyết vấn đề thực tiễn. Kiểm tra giữa HKII (90 phút). Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 35).',
      },
      {
        id: 't8-c7-b25-b29',
        week: 'Tuần 26 – 30',
        lessonName: 'Chương VII: Bài 25. Phương trình bậc nhất một ẩn; Bài 26. Giải bài toán bằng cách lập phương trình; Bài 27. Khái niệm hàm số và đồ thị của hàm số; Bài 28. Hàm số bậc nhất và đồ thị của hàm số bậc nhất; Bài 29. Hệ số góc của đường thẳng & Bài tập cuối chương VII',
        periodAllocation: 'Tiết 104 – 118',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Giải phương trình bậc nhất một ẩn và giải bài toán bằng cách lập phương trình; vẽ đồ thị hàm số bậc nhất $y = ax + b (a \\neq 0)$ và sử dụng hệ số góc nhận biết hai đường thẳng song song hoặc cắt nhau. Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 25, Bài 29), 2.2.TC2b (Bài tập cuối chương VII).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-toan-c8-c10-hk2',
    grade: 8,
    subject: 'Toán',
    chapterCode: 'T8-C8-10',
    chapterTitle: 'Chương VIII. Mở đầu về tính xác suất của biến cố & Chương X. Một số hình khối trong thực tiễn',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 35',
    totalPeriods: 22,
    adjustedContentSummary:
      'Kết quả có thể và kết quả thuận lợi, cách tính xác suất của biến cố bằng tỉ số, mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng; hình chóp tam giác đều, hình chóp tứ giác đều; hoạt động trải nghiệm STEM (Đo chiều cao, khoảng cách bằng định lí Thales, Pythagore và tam giác đồng dạng) và Kiểm tra cuối HKII. Định hướng phát triển NLS - AI: 5.3.TC2a, 2.1.TC2a.',
    rawLessons: [
      {
        id: 't8-c8-b30-b32',
        week: 'Tuần 30 – 32',
        lessonName: 'Chương VIII: Bài 30. Kết quả có thể và kết quả thuận lợi; Bài 31. Cách tính xác suất của biến cố bằng tỉ số; Bài 32. Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng & Bài tập cuối chương VIII',
        periodAllocation: 'Tiết 119 – 127',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Xác định kết quả có thể và kết quả thuận lợi; tính xác suất lý thuyết bằng tỉ số và ước lượng xác suất của một biến cố bằng xác suất thực nghiệm. Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 32).',
      },
      {
        id: 't8-c10-b38-b39-kt-hk2',
        week: 'Tuần 32 – 35',
        lessonName: 'Chương X: Bài 38. Hình chóp tam giác đều; Bài 39. Hình chóp tứ giác đều; Ôn tập & Kiểm tra cuối HKII; HĐ trải nghiệm (Ứng dụng hàm số bậc nhất trong tài chính; STEM: Ứng dụng định lí Thales, định lí Pythagore và tam giác đồng dạng để đo chiều cao, khoảng cách)',
        periodAllocation: 'Tiết 128 – 140',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Mô tả yếu tố và tính diện tích xung quanh, thể tích của hình chóp tam giác đều và hình chóp tứ giác đều; thực hành STEM đo chiều cao, khoảng cách ngoài trời. Kiểm tra cuối HKII (90 phút). Định hướng phát triển NLS - AI: 2.1.TC2a (Bài 38).',
      },
    ],
  }),
];

// ============================================================================
// 1.1.4. MÔN TOÁN – LỚP 9 (CẢ NĂM: 140 TIẾT = HKI 72 TIẾT + HKII 68 TIẾT)
// ============================================================================
export const GRADE9_TOAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-toan-c1-c2-c4-hk1',
    grade: 9,
    subject: 'Toán',
    chapterCode: 'T9-C1-2-4',
    chapterTitle: 'Chương I. Hệ hai phương trình bậc nhất hai ẩn; Chương II. Bất phương trình bậc nhất một ẩn & Chương IV. Hệ thức lượng trong tam giác vuông',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 10',
    totalPeriods: 40,
    adjustedContentSummary:
      'Phương trình và hệ hai phương trình bậc nhất hai ẩn, giải bài toán bằng cách lập hệ phương trình; phương trình quy về phương trình bậc nhất một ẩn, bất đẳng thức và bất phương trình bậc nhất một ẩn; tỉ số lượng giác của góc nhọn, hệ thức giữa cạnh và góc trong tam giác vuông, thực hành STEM đo chiều cao/khoảng cách và Kiểm tra giữa HKI. Định hướng phát triển NLS - AI: 5.3.TC2a, 5.1.TC2a, 2.2.TC2a và AI 9.B2.1, 9.A3.2.',
    rawLessons: [
      {
        id: 't9-c1-b1-b3',
        week: 'Tuần 1 – 3',
        lessonName: 'Chương I: Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn; Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn; Bài 3. Giải bài toán bằng cách lập hệ phương trình & Bài tập cuối chương I',
        periodAllocation: 'Tiết 1 – 11',
        periodsCount: 11,
        adjustedContent:
          'YCCĐ: Giải hệ hai phương trình bậc nhất hai ẩn bằng phương pháp thế, cộng đại số và máy tính cầm tay; giải bài toán thực tiễn bằng cách lập hệ phương trình. Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 1, 2); AI 9.B2.1 tại Bài 2 (Học sinh hiểu năng lực giải toán của AI nhưng biết cách kiểm soát, chịu trách nhiệm và phát hiện sai sót của công cụ); AI 9.A3.2 tại Bài 3 (Học sinh biết cách tương tác và dùng AI để tóm tắt đề bài toán thực tế, phân tích mối quan hệ giữa các đại lượng).',
      },
      {
        id: 't9-c2-b4-b6',
        week: 'Tuần 3 – 6',
        lessonName: 'Chương II: Bài 4. Phương trình quy về phương trình bậc nhất một ẩn; Bài 5. Bất đẳng thức và tính chất; Bài 6. Bất phương trình bậc nhất một ẩn & Bài tập cuối chương II',
        periodAllocation: 'Tiết 12 – 23',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Giải phương trình tích và phương trình chứa ẩn ở mẫu; nhận biết tính chất bất đẳng thức và giải bất phương trình bậc nhất một ẩn. Định hướng phát triển NLS - AI: 5.1.TC2a (Bài 4).',
      },
      {
        id: 't9-c4-b11-b12-kt-gk1',
        week: 'Tuần 6 – 10',
        lessonName: 'Chương IV: Bài 11. Tỉ số lượng giác của góc nhọn; Bài 12. Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng; Ôn tập & Kiểm tra giữa học kì I; HĐ thực hành trải nghiệm (STEM: Tính chiều cao và xác định khoảng cách)',
        periodAllocation: 'Tiết 24 – 40',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Nhận biết và tính các tỉ số lượng giác sin, cos, tan, cot của góc nhọn; giải tam giác vuông và thực hành STEM đo chiều cao, khoảng cách khi có vật cản. Kiểm tra giữa HKI (90 phút). Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 11, 12), 2.2.TC2a (Ôn tập & Kiểm tra giữa HKI).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-toan-c3-c5-hk1',
    grade: 9,
    subject: 'Toán',
    chapterCode: 'T9-C3-5',
    chapterTitle: 'Chương III. Căn bậc hai và căn bậc ba & Chương V. Đường tròn',
    semester: 'HK1',
    weekRange: 'Tuần 11 – Tuần 18',
    totalPeriods: 32,
    adjustedContentSummary:
      'Căn bậc hai và căn thức bậc hai, khai căn bậc hai với phép nhân và phép chia, biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai, căn bậc ba; mở đầu về đường tròn, cung và dây, độ dài cung tròn, diện tích hình quạt tròn và hình vành khuyên, vị trí tương đối của đường thẳng và đường tròn, vị trí tương đối của hai đường tròn và Kiểm tra cuối HKI. Định hướng phát triển NLS - AI: 5.3.TC2a, 2.2.TC2a, 2.2.TC2b.',
    rawLessons: [
      {
        id: 't9-c3-b7-b10',
        week: 'Tuần 11 – 13',
        lessonName: 'Chương III: Bài 7. Căn bậc hai và căn thức bậc hai; Bài 8. Khai căn bậc hai với phép nhân và phép chia; Bài 9. Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai; Bài 10. Căn bậc ba và căn thức bậc ba & Bài tập cuối chương III',
        periodAllocation: 'Tiết 41 – 52',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Xác định điều kiện của căn thức bậc hai; thực hiện các phép biến đổi đưa thừa số ra ngoài/vào trong dấu căn, trục căn thức ở mẫu, rút gọn biểu thức chứa căn bậc hai và căn bậc ba. Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 7, 8, 10), 2.2.TC2a & 2.2.TC2b (Bài tập cuối chương III).',
      },
      {
        id: 't9-c5-b13-b17-kt-hk1',
        week: 'Tuần 14 – 18',
        lessonName: 'Chương V: Bài 13. Mở đầu về đường tròn; Bài 14. Cung và dây của một đường tròn; Bài 15. Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên; Bài 16. Vị trí tương đối của đường thẳng và đường tròn; Bài 17. Vị trí tương đối của hai đường tròn; Ôn tập & Kiểm tra cuối học kì I',
        periodAllocation: 'Tiết 53 – 72',
        periodsCount: 20,
        adjustedContent:
          'YCCĐ: Nhận biết tâm, bán kính, dây, cung, góc ở tâm; tính độ dài cung tròn, diện tích hình quạt tròn và hình vành khuyên; mô tả vị trí tương đối của đường thẳng và đường tròn, tính chất hai tiếp tuyến cắt nhau, vị trí tương đối của hai đường tròn. Kiểm tra cuối HKI (90 phút). Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 16, 17), 2.2.TC2a & 2.2.TC2b (Ôn tập HKI).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-toan-c6-c9-hk2',
    grade: 9,
    subject: 'Toán',
    chapterCode: 'T9-C6-9',
    chapterTitle: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn & Chương IX. Đường tròn ngoại tiếp và đường tròn nội tiếp',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 26',
    totalPeriods: 31,
    adjustedContentSummary:
      'Hàm số $y = ax^2 (a \\neq 0)$, phương trình bậc hai một ẩn, định lí Viète và ứng dụng, giải bài toán bằng cách lập phương trình; góc nội tiếp, đường tròn ngoại tiếp và nội tiếp của một tam giác, tứ giác nội tiếp, đa giác đều, phép quay và Kiểm tra giữa HKII. Định hướng phát triển NLS - AI: 5.3.TC2a, 6.1.TC2a, 1.1.TC2a, 1.1.TC2b.',
    rawLessons: [
      {
        id: 't9-c6-b18-b21',
        week: 'Tuần 19 – 22',
        lessonName: 'Chương VI: Bài 18. Hàm số y = ax² (a ≠ 0); Bài 19. Phương trình bậc hai một ẩn; Bài 20. Định lí Viète và ứng dụng; Bài 21. Giải bài toán bằng cách lập phương trình & Bài tập cuối chương VI',
        periodAllocation: 'Tiết 73 – 88',
        periodsCount: 16,
        adjustedContent:
          'YCCĐ: Vẽ đồ thị hàm số $y = ax^2 (a \\neq 0)$; giải phương trình bậc hai một ẩn và vận dụng định lí Viète tính nhẩm nghiệm, tìm hai số biết tổng và tích; giải bài toán bằng cách lập phương trình bậc hai. Định hướng phát triển NLS - AI: 5.3.TC2a (Bài 18), 6.1.TC2a (Bài tập cuối chương VI).',
      },
      {
        id: 't9-c9-b27-b30-kt-gk2',
        week: 'Tuần 23 – 26',
        lessonName: 'Chương IX: Bài 27. Góc nội tiếp; Bài 28. Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác; Bài 29. Tứ giác nội tiếp; Bài 30. Đa giác đều; Ôn tập & Kiểm tra giữa học kì II',
        periodAllocation: 'Tiết 89 – 103',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Giải thích mối liên hệ giữa số đo góc nội tiếp và góc ở tâm cùng chắn một cung; xác định tâm và bán kính đường tròn ngoại tiếp, nội tiếp tam giác; tính chất tứ giác nội tiếp; nhận dạng đa giác đều và phép quay. Kiểm tra giữa HKII (90 phút). Định hướng phát triển NLS - AI: 1.1.TC2a & 1.1.TC2b (Bài 30).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-toan-c7-c8-c10-hk2',
    grade: 9,
    subject: 'Toán',
    chapterCode: 'T9-C7-8-10',
    chapterTitle: 'Chương VII. Tần số và tần số tương đối; Chương VIII. Xác suất của biến cố & Chương X. Một số hình khối trong thực tiễn',
    semester: 'HK2',
    weekRange: 'Tuần 26 – Tuần 35',
    totalPeriods: 37,
    adjustedContentSummary:
      'Bảng tần số, tần số tương đối và bảng/biểu đồ tần số ghép nhóm; phép thử ngẫu nhiên, không gian mẫu và xác suất của biến cố; hình trụ, hình nón, hình cầu; hoạt động thực hành trải nghiệm (Gene trội trong các thế hệ lai; GeoGebra; Excel) và Kiểm tra cuối HKII. Định hướng phát triển NLS - AI: 1.1.TC2b, 5.3.TC2b.',
    rawLessons: [
      {
        id: 't9-c7-b22-b24',
        week: 'Tuần 26 – 29',
        lessonName: 'Chương VII: Bài 22. Bảng tần số và biểu đồ tần số; Bài 23. Bảng tần số tương đối và biểu đồ tần số tương đối; Bài 24. Bảng tần số, tần số tương đối ghép nhóm và biểu đồ & Bài tập cuối chương VII',
        periodAllocation: 'Tiết 104 – 113',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Thiết lập bảng tần số, tần số tương đối và bảng tần số, tần số tương đối ghép nhóm; vẽ biểu đồ cột, biểu đồ hình quạt tròn và biểu đồ đoạn thẳng tương ứng. Định hướng phát triển NLS - AI: 1.1.TC2b (Bài 22), 1.1.TC2b & 5.3.TC2b (Bài 24).',
      },
      {
        id: 't9-c8-b25-b26-mendel',
        week: 'Tuần 29 – 31',
        lessonName: 'Chương VIII: Bài 25. Phép thử ngẫu nhiên và không gian mẫu; Bài 26. Xác suất của biến cố liên quan tới phép thử; Bài tập cuối chương VIII & HĐ trải nghiệm: Gene trội trong các thế hệ lai',
        periodAllocation: 'Tiết 114 – 123',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Nhận biết phép thử ngẫu nhiên, không gian mẫu và tính xác suất của biến cố liên quan đến phép thử; kiểm chứng quy luật di truyền Mendel bằng cách tính xác suất mô phỏng.',
      },
      {
        id: 't9-c10-b31-b32-kt-hk2',
        week: 'Tuần 31 – 35',
        lessonName: 'Chương X: Bài 31. Hình trụ và hình nón; Bài 32. Hình cầu; HĐ thực hành trải nghiệm (Giải phương trình, hệ phương trình và vẽ đồ thị/hình khối với GeoGebra; Vẽ biểu đồ tần số bằng Excel); Ôn tập & Kiểm tra cuối học kì II',
        periodAllocation: 'Tiết 124 – 140',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Mô tả yếu tố và tính diện tích xung quanh, thể tích của hình trụ, hình nón, diện tích mặt cầu và thể tích hình cầu; sử dụng phần mềm GeoGebra và Excel trong giải toán và thống kê. Kiểm tra cuối HKII (90 phút). Định hướng phát triển NLS - AI: 1.1.TC2b & 5.3.TC2b (Bài 31, 32, HĐ trải nghiệm).',
      },
    ],
  }),
];

// ============================================================================
// 1.2.1 – 1.2.4. MÔN TIN HỌC – CẤP THCS (LỚP 6, 7, 8, 9 – MỖI KHỐI 35 TIẾT)
// ============================================================================
export const GRADE6_TIN_HOC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-tinhoc-hk1',
    grade: 6,
    subject: 'Tin học',
    chapterCode: 'TH6-HK1',
    chapterTitle: 'Chủ đề 1. Máy tính và cộng đồng; Chủ đề 2. Mạng máy tính và Internet & Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    adjustedContentSummary:
      'Thông tin và dữ liệu, xử lí thông tin, thông tin trong máy tính; mạng máy tính và Internet; mạng thông tin toàn cầu WWW, tìm kiếm thông tin trên Internet, thư điện tử và Kiểm tra giữa kì I, cuối kì I. Định hướng phát triển NLS - AI: 1.2.TC1a, 1.3.TC1a, 1.3.TC1b, 2.1.TC1a, 2.3.TC1a, 1.1.TC1b, 1.1.TC1d, 2.1.TC1b và AI 6.C1.MR1, 6.C1.1, 6.C2.2, 6.C2.1, 6.A1.3, 6.C3.MR1.',
    rawLessons: [
      {
        id: 'th6-b1-b2-b3',
        week: 'Tuần 1 – 5',
        lessonName: 'Chủ đề 1: Bài 1. Thông tin và dữ liệu (1 tiết); Bài 2. Xử lí thông tin (2 tiết); Bài 3. Thông tin trong máy tính (2 tiết)',
        periodAllocation: 'Tiết 1 – 5',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Phân biệt được thông tin với vật mang tin, sự khác nhau giữa thông tin và dữ liệu; nêu được các bước cơ bản trong xử lí thông tin; giải thích việc biểu diễn thông tin chỉ với hai kí hiệu 0 và 1; nêu các đơn vị đo dung lượng thông tin (Byte, KB, MB, GB). Định hướng phát triển NLS - AI: 1.2.TC1a & AI 6.C1.MR1 (Bài 1); 1.3.TC1a & AI 6.C1.1 (Bài 2); 1.3.TC1b (Bài 3).',
      },
      {
        id: 'th6-b4-b5-kt-gk1',
        week: 'Tuần 6 – 10',
        lessonName: 'Chủ đề 2: Bài 4. Mạng máy tính (2 tiết); Bài 5. Internet (2 tiết) & Kiểm tra giữa kì I (1 tiết)',
        periodAllocation: 'Tiết 6 – 10',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nêu khái niệm, lợi ích và thành phần chủ yếu của mạng máy tính; giới thiệu đặc điểm và lợi ích chính của Internet. Kiểm tra giữa kì I (45 phút). Định hướng phát triển NLS - AI: 2.1.TC1a & AI 6.C2.2 (Bài 4); 2.3.TC1a & AI 6.C2.1 (Bài 5).',
      },
      {
        id: 'th6-b6-b7-b8-kt-ck1',
        week: 'Tuần 11 – 18',
        lessonName: 'Chủ đề 3: Bài 6. Mạng thông tin toàn cầu (2 tiết); Bài 7. Tìm kiếm thông tin trên Internet (2 tiết); Bài 8. Thư điện tử (2 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết 11 – 18',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Trình bày khái niệm WWW, website, địa chỉ website, trình duyệt; xác định từ khóa ứng với mục đích tìm kiếm; đăng ký và sử dụng thư điện tử cơ bản. Kiểm tra cuối kì I (45 phút). Định hướng phát triển NLS - AI: 1.1.TC1b (Bài 6); 1.1.TC1d & AI 6.A1.3 (Bài 7); 2.1.TC1b & AI 6.C3.MR1 (Bài 8).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-tinhoc-hk2',
    grade: 6,
    subject: 'Tin học',
    chapterCode: 'TH6-HK2',
    chapterTitle: 'Chủ đề 4. Đạo đức, pháp luật và văn hóa trong môi trường số; Chủ đề 5. Ứng dụng Tin học & Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    adjustedContentSummary:
      'An toàn thông tin trên Internet; sơ đồ tư duy, định dạng văn bản, trình bày thông tin ở dạng bảng, tìm kiếm và thay thế, thực hành tổng hợp hoàn thành sổ lưu niệm; thuật toán, các cấu trúc điều khiển (tuần tự, rẽ nhánh, lặp) và chương trình máy tính. Định hướng phát triển NLS - AI: 4.2.TC1a, 2.5.TC1a, 3.1.TC1a, 5.3.TC1a, 3.1.TC1b, 3.2.TC1a, 5.2.TC1b, 3.4.TC1a, 5.3.TC1b, 5.4.TC1a và AI 6.A3.4, 6.D2.MR2, 6.A3.2, 6.C1.1, 6.A1.1.',
    rawLessons: [
      {
        id: 'th6-b9',
        week: 'Tuần 19, 20',
        lessonName: 'Chủ đề 4: Bài 9. An toàn thông tin trên Internet',
        periodAllocation: 'Tiết 19, 20',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Nêu một số tác hại và nguy cơ bị hại khi tham gia Internet; thực hiện biện pháp phòng ngừa, bảo vệ thông tin cá nhân và nhận diện thông điệp lừa đảo. Định hướng phát triển NLS - AI: 4.2.TC1a, 2.5.TC1a & AI 6.A3.4.',
      },
      {
        id: 'th6-b10-b14-kt-gk2',
        week: 'Tuần 21 – 29',
        lessonName: 'Chủ đề 5: Bài 10. Sơ đồ tư duy (2 tiết); Bài 11. Định dạng văn bản (2 tiết); Bài 12. Trình bày thông tin ở dạng bảng (2 tiết); Bài 13. Thực hành: Tìm kiếm và thay thế (1 tiết); Bài 14. Thực hành tổng hợp: Hoàn thành sổ lưu niệm (1 tiết) & Kiểm tra giữa kì II (1 tiết)',
        periodAllocation: 'Tiết 21 – 29',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Sắp xếp logic và tạo sơ đồ tư duy bằng phần mềm; thực hiện định dạng văn bản, trình bày thông tin dạng bảng, tìm kiếm và thay thế để hoàn thiện sổ lưu niệm. Kiểm tra giữa kì II (45 phút). Định hướng phát triển NLS - AI: 3.1.TC1a, 5.3.TC1a & AI 6.D2.MR2 (Bài 10); 3.1.TC1b (Bài 11); 3.2.TC1a (Bài 12); 5.2.TC1b (Bài 13); 3.1.TC1b & AI 6.A3.2 (Bài 14).',
      },
      {
        id: 'th6-b15-b17-kt-ck2',
        week: 'Tuần 30 – 35',
        lessonName: 'Chủ đề 6: Bài 15. Thuật toán (1 tiết); Bài 16. Các cấu trúc điều khiển (2 tiết); Bài 17. Chương trình máy tính (1 tiết); Ôn tập & Kiểm tra cuối kì II (2 tiết)',
        periodAllocation: 'Tiết 30 – 35',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Diễn tả khái niệm thuật toán; mô tả thuật toán đơn giản có cấu trúc tuần tự, rẽ nhánh và lặp dưới dạng liệt kê hoặc sơ đồ khối; biết chương trình là mô tả thuật toán để máy tính hiểu và thực hiện. Kiểm tra cuối kì II (45 phút). Định hướng phát triển NLS - AI: 3.4.TC1a & AI 6.C1.1 (Bài 15); 5.3.TC1b (Bài 16); 5.4.TC1a & AI 6.A1.1 (Bài 17).',
      },
    ],
  }),
];

export const GRADE7_TIN_HOC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-tinhoc-hk1',
    grade: 7,
    subject: 'Tin học',
    chapterCode: 'TH7-HK1',
    chapterTitle: 'Chủ đề 1. Máy tính và cộng đồng; Chủ đề 2. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin; Chủ đề 3. Đạo đức số & Chủ đề 4. Ứng dụng tin học (Bảng tính)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    adjustedContentSummary:
      'Thiết bị vào - ra, phần mềm máy tính, quản lý dữ liệu trong máy tính; mạng xã hội và một số kênh trao đổi thông tin trên Internet; ứng xử trên mạng; làm quen với phần mềm bảng tính, tính toán tự động và công cụ hỗ trợ tính toán (MAX, MIN, AVERAGE, COUNT). Định hướng phát triển NLS - AI: 4.1.TC1a, 5.1.TC1a, 5.1.TC1b, 5.2.TC1a, 5.2.TC1b, 5.2.TC1c, 1.3.TC1a, 1.3.TC1b, 2.1.TC1a, 2.1.TC1b, 2.2.TC1a, 2.2.TC1b, 2.5.TC1a, 2.5.TC1b, 2.5.TC1c, 4.3.TC1b, 3.1.TC1a, 3.1.TC1b và AI 7.A3.1, 7.C4.1, 7.A2.1, 7.A1.MR1, 7.C4.MR1.',
    rawLessons: [
      {
        id: 'th7-b1-b2-b3',
        week: 'Tuần 1 – 5',
        lessonName: 'Chủ đề 1: Bài 1. Thiết bị vào - ra (1 tiết); Bài 2. Phần mềm máy tính (2 tiết); Bài 3. Quản lý dữ liệu trong máy tính (2 tiết)',
        periodAllocation: 'Tiết 1 – 5',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết chức năng các thiết bị vào - ra; phân biệt hệ điều hành và phần mềm ứng dụng; thực hiện biện pháp an toàn dữ liệu (sao lưu, phòng chống virus). Định hướng phát triển NLS - AI: 4.1.TC1a, 5.1.TC1a, 5.1.TC1b & AI 7.A3.1 (Bài 1); 5.2.TC1a, 5.2.TC1b, 5.2.TC1c & AI 7.A3.1 (Bài 2); 1.3.TC1a, 1.3.TC1b, 4.1.TC1a & AI 7.C4.1 (Bài 3).',
      },
      {
        id: 'th7-b4',
        week: 'Tuần 6 – 7',
        lessonName: 'Chủ đề 2: Bài 4. Mạng xã hội và một số kênh trao đổi thông tin trên Internet (2 tiết)',
        periodAllocation: 'Tiết 6 – 7',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Sử dụng chức năng cơ bản của mạng xã hội để giao lưu và chia sẻ thông tin. Định hướng phát triển NLS - AI: 2.1.TC1a, 2.1.TC1b, 2.2.TC1a, 2.2.TC1b & AI 7.A2.1 (Bài 4).',
      },
      {
        id: 'th7-b5-kt-gk1',
        week: 'Tuần 8 – 10',
        lessonName: 'Chủ đề 3: Bài 5. Ứng xử trên mạng (2 tiết) & Kiểm tra giữa kì I (1 tiết)',
        periodAllocation: 'Tiết 8 – 10',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Giao tiếp qua mạng văn hóa, lịch sự; phòng tránh tác hại nghiện Internet và biết nhờ người lớn tư vấn khi gặp thông tin không phù hợp. Kiểm tra giữa kì I (45 phút). Định hướng phát triển NLS - AI: 2.5.TC1a, 2.5.TC1b, 2.5.TC1c, 4.3.TC1b & AI 7.A1.MR1 (Bài 5).',
      },
      {
        id: 'th7-b6-b7-b8-kt-ck1',
        week: 'Tuần 11 – 18',
        lessonName: 'Chủ đề 4 (HKI): Bài 6. Làm quen với phần mềm bảng tính (2 tiết); Bài 7. Tính toán tự động trên bảng tính (2 tiết); Bài 8. Công cụ hỗ trợ tính toán (2 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết 11 – 18',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nhập, điều chỉnh, định dạng dữ liệu trên bảng tính; nhập và sao chép công thức tính toán tự động; sử dụng các hàm đơn giản MAX, MIN, AVERAGE, COUNT. Kiểm tra cuối kì I (45 phút). Định hướng phát triển NLS - AI: 3.1.TC1a, 3.1.TC1b (Bài 6, 7); 3.1.TC1a & AI 7.C4.MR1 (Bài 8).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-tinhoc-hk2',
    grade: 7,
    subject: 'Tin học',
    chapterCode: 'TH7-HK2',
    chapterTitle: 'Chủ đề 4. Ứng dụng tin học (Hoàn thiện bảng tính & Bài trình chiếu) & Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính (Thuật toán tìm kiếm và sắp xếp)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    adjustedContentSummary:
      'Trình bày và hoàn thiện bảng tính (dự án Trường học xanh); tạo bài trình chiếu có cấu trúc phân cấp, định dạng đối tượng và hiệu ứng động; thuật toán tìm kiếm tuần tự, tìm kiếm nhị phân và thuật toán sắp xếp. Định hướng phát triển NLS - AI: 3.1.TC1a, 3.2.TC1a, 5.3.TC1a, 3.1.TC1b, 3.3.TC1a, 3.4.TC1a, 5.3.TC1b và AI 7.A1.1, 7.C4.1, 7.D2.1, 7.C5.2, 7.C5.1.',
    rawLessons: [
      {
        id: 'th7-b9-b13-kt-gk2',
        week: 'Tuần 19 – 28',
        lessonName: 'Chủ đề 4 (HKII): Bài 9. Trình bày bảng tính (2 tiết); Bài 10. Hoàn thiện bảng tính (1 tiết); Bài 11. Tạo bài trình chiếu (2 tiết); Bài 12. Định dạng đối tượng trên trang chiếu (2 tiết); Bài 13. Thực hành tổng hợp: Hoàn thiện bài trình chiếu (2 tiết) & Kiểm tra giữa kì II (1 tiết)',
        periodAllocation: 'Tiết 19 – 28',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Định dạng dữ liệu số, hoàn thiện và in bảng tính; tạo bài trình chiếu có tiêu đề, cấu trúc phân cấp, hình ảnh minh họa và hiệu ứng hợp lí. Kiểm tra giữa kì II (45 phút). Định hướng phát triển NLS - AI: 3.1.TC1a, 3.2.TC1a, 5.3.TC1a (Bài 9, 10); 3.1.TC1a, 3.1.TC1b & AI 7.A1.1 (Bài 11); 3.2.TC1a, 3.3.TC1a & AI 7.C4.1 (Bài 12); 3.1.TC1a, 3.2.TC1a, 5.3.TC1a & AI 7.D2.1 (Bài 13).',
      },
      {
        id: 'th7-b14-b16-kt-ck2',
        week: 'Tuần 29 – 35',
        lessonName: 'Chủ đề 5: Bài 14. Thuật toán tìm kiếm tuần tự (1 tiết); Bài 15. Thuật toán tìm kiếm nhị phân (2 tiết); Bài 16. Thuật toán sắp xếp (2 tiết); Ôn tập & Kiểm tra cuối kì II (2 tiết)',
        periodAllocation: 'Tiết 29 – 35',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Giải thích, biểu diễn và mô phỏng hoạt động của thuật toán tìm kiếm tuần tự, tìm kiếm nhị phân và thuật toán sắp xếp cơ bản trên bộ dữ liệu kích thước nhỏ; nêu mối liên quan giữa sắp xếp và tìm kiếm. Kiểm tra cuối kì II (45 phút). Định hướng phát triển NLS - AI: 3.4.TC1a, 5.3.TC1b & AI 7.C5.2 (Bài 14, 15); 3.4.TC1a, 5.3.TC1b & AI 7.C5.1 (Bài 16).',
      },
    ],
  }),
];

export const GRADE8_TIN_HOC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-tinhoc-hk1',
    grade: 8,
    subject: 'Tin học',
    chapterCode: 'TH8-HK1',
    chapterTitle: 'Chủ đề 1. Máy tính và cộng đồng; Chủ đề 2. Tổ chức lưu trữ, tìm kiếm; Chủ đề 3. Đạo đức số & Chủ đề 4. Ứng dụng tin học (Bảng tính & Văn bản nâng cao)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    adjustedContentSummary:
      'Lược sử công cụ tính toán; đặc điểm và khai thác thông tin trong môi trường số; đạo đức và văn hóa sử dụng công nghệ kĩ thuật số; địa chỉ tương đối/tuyệt đối, sắp xếp, lọc dữ liệu và biểu đồ trên bảng tính; làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản. Định hướng phát triển NLS - AI: 1.2.TC2b, 5.1.TC2a, 6.1.TC2b, 1.2.TC2a, 1.1.TC2a, 1.1.TC2b, 2.5.TC2a, 2.5.TC2b, 3.3.TC2a, 5.2.TC2b, 5.3.TC2a, 1.3.TC2a, 1.3.TC2b, 3.1.TC2a, 3.2.TC2a, 5.2.TC2a và AI 8.A1.1, 8.A2.1, 8.A1.2, 8.B1.1, 8.B2.1, 8.A3.3.',
    rawLessons: [
      {
        id: 'th8-b1',
        week: 'Tuần 1 – 2',
        lessonName: 'Chủ đề 1: Bài 1. Lược sử công cụ tính toán (2 tiết)',
        periodAllocation: 'Tiết 1 – 2',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Trình bày sơ lược lịch sử phát triển máy tính và nêu ví dụ về sự phát triển công cụ tính toán. Định hướng phát triển NLS - AI: 1.2.TC2b, 5.1.TC2a, 6.1.TC2b & AI 8.A1.1 (Bài 1).',
      },
      {
        id: 'th8-b2-b3',
        week: 'Tuần 3 – 6',
        lessonName: 'Chủ đề 2: Bài 2. Thông tin trong môi trường số (2 tiết); Bài 3. Thực hành khai thác thông tin số (2 tiết)',
        periodAllocation: 'Tiết 3 – 6',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nêu đặc điểm của thông tin trong môi trường số; khai thác nguồn thông tin đáng tin cậy và đánh giá sự phù hợp của thông tin. Định hướng phát triển NLS - AI: 1.2.TC2a, 1.2.TC2b, 1.1.TC2a & AI 8.A2.1 (Bài 2); 1.1.TC2a, 1.1.TC2b, 1.2.TC2a & AI 8.A1.2 (Bài 3).',
      },
      {
        id: 'th8-b4-kt-gk1',
        week: 'Tuần 7 – 8',
        lessonName: 'Chủ đề 3: Bài 4. Đạo đức và văn hóa trong sử dụng công nghệ kĩ thuật số (1 tiết) & Kiểm tra giữa kì I (1 tiết)',
        periodAllocation: 'Tiết 7 – 8',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Nhận biết biểu hiện vi phạm đạo đức, pháp luật, bản quyền và văn hóa trong sử dụng công nghệ kĩ thuật số. Kiểm tra giữa kì I (45 phút). Định hướng phát triển NLS - AI: 2.5.TC2a, 2.5.TC2b, 3.3.TC2a & AI 8.B1.1 (Bài 4).',
      },
      {
        id: 'th8-b5-b8a-kt-ck1',
        week: 'Tuần 9 – 18',
        lessonName: 'Chủ đề 4 (HKI): Bài 5. Sử dụng bảng tính giải quyết bài toán thực tế (2 tiết); Bài 6. Sắp xếp và lọc dữ liệu (2 tiết); Bài 7. Trình bày dữ liệu bằng biểu đồ (2 tiết); Bài 8a. Làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản (2 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết 9 – 18',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Phân biệt địa chỉ tương đối và tuyệt đối; thực hiện lọc, sắp xếp dữ liệu và tạo biểu đồ trong bảng tính; chèn hình ảnh, vẽ hình đồ họa và tạo danh sách dạng liệt kê trong văn bản. Kiểm tra cuối kì I (45 phút). Định hướng phát triển NLS - AI: 5.2.TC2b, 5.3.TC2a, 1.3.TC2a (Bài 5); 1.3.TC2a, 1.3.TC2b, 5.2.TC2b & AI 8.B2.1 (Bài 6); 3.1.TC2a, 3.2.TC2a, 5.2.TC2a (Bài 7); 3.1.TC2a, 3.2.TC2a, 5.2.TC2b & AI 8.A3.3 (Bài 8a).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-tinhoc-hk2',
    grade: 8,
    subject: 'Tin học',
    chapterCode: 'TH8-HK2',
    chapterTitle: 'Chủ đề 4a. Soạn thảo văn bản và trình chiếu nâng cao (HKII); Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính & Chủ đề 6. Hướng nghiệp với tin học',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    adjustedContentSummary:
      'Tạo đầu trang, chân trang cho văn bản; định dạng nâng cao và sử dụng bản mẫu (template) cho bài trình chiếu; từ thuật toán đến chương trình, biểu diễn dữ liệu, cấu trúc điều khiển, gỡ lỗi chương trình và tin học với nghề nghiệp. Định hướng phát triển NLS - AI: 3.1.TC2a, 5.2.TC2b, 3.1.TC2b, 3.2.TC2a, 2.4.TC2a, 3.4.TC2a, 5.3.TC2a, 5.1.TC2a, 5.1.TC2b, 5.4.TC2a, 2.3.TC2b và AI 8.A1.2, 8.A3.MR1, 8.A3.1, 8.C1.1, 8.C5.1, 8.A3.3.',
    rawLessons: [
      {
        id: 'th8-b9a-b11a-kt-gk2',
        week: 'Tuần 19 – 25',
        lessonName: 'Chủ đề 4a (HKII): Bài 9a. Tạo đầu trang, chân trang cho văn bản (2 tiết); Bài 10a. Định dạng nâng cao cho trang chiếu (2 tiết); Bài 11a. Sử dụng bản mẫu cho bài trình chiếu (2 tiết) & Kiểm tra giữa kì II (1 tiết)',
        periodAllocation: 'Tiết 19 – 25',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Đánh số trang, thêm đầu trang và chân trang; sử dụng bản mẫu (template) và nhúng đường dẫn video/tài liệu vào bài trình chiếu có tính thẩm mĩ. Kiểm tra giữa kì II (45 phút). Định hướng phát triển NLS - AI: 3.1.TC2a, 5.2.TC2b (Bài 9a); 3.1.TC2b, 3.2.TC2a & AI 8.A1.2 (Bài 10a); 3.1.TC2a, 3.2.TC2a, 2.4.TC2a & AI 8.A3.MR1 (Bài 11a).',
      },
      {
        id: 'th8-b12-b15',
        week: 'Tuần 26 – 32',
        lessonName: 'Chủ đề 5: Bài 12. Từ thuật toán đến chương trình (2 tiết); Bài 13. Biểu diễn dữ liệu (2 tiết); Bài 14. Cấu trúc điều khiển (2 tiết); Bài 15. Gỡ lỗi (1 tiết)',
        periodAllocation: 'Tiết 26 – 32',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Mô tả kịch bản dưới dạng thuật toán và tạo chương trình đơn giản; sử dụng hằng, biến, biểu thức và cấu trúc tuần tự, rẽ nhánh, lặp trong lập trình trực quan Scratch; phát hiện và sửa lỗi chương trình. Định hướng phát triển NLS - AI: 3.4.TC2a, 5.3.TC2a & AI 8.A3.1 (Bài 12); 3.4.TC2a & AI 8.C1.1 (Bài 13); 3.4.TC2a, 5.1.TC2a & AI 8.C5.1 (Bài 14); 5.1.TC2a, 5.1.TC2b, 5.3.TC2a & AI 8.A3.3 (Bài 15).',
      },
      {
        id: 'th8-b16-kt-ck2',
        week: 'Tuần 33 – 35',
        lessonName: 'Chủ đề 6: Bài 16. Tin học với nghề nghiệp (1 tiết); Ôn tập & Kiểm tra cuối kì II (2 tiết)',
        periodAllocation: 'Tiết 33 – 35',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nhận thức vấn đề bình đẳng giới và nêu được một số nghề nghiệp ứng dụng tin học trong xã hội hiện đại. Kiểm tra cuối kì II (45 phút). Định hướng phát triển NLS - AI: 5.4.TC2a, 2.3.TC2b & AI 8.A3.1 (Bài 16).',
      },
    ],
  }),
];

export const GRADE9_TIN_HOC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-tinhoc-hk1',
    grade: 9,
    subject: 'Tin học',
    chapterCode: 'TH9-HK1',
    chapterTitle: 'Chủ đề 1. Máy tính và cộng đồng; Chủ đề 2. Tổ chức lưu trữ, tìm kiếm; Chủ đề 3. Đạo đức và pháp luật số & Chủ đề 4. Ứng dụng tin học (Phần mềm mô phỏng, Trình bày thông tin & Bảng tính nâng cao)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    adjustedContentSummary:
      'Thế giới kĩ thuật số; đánh giá chất lượng thông tin trong giải quyết vấn đề; một số vấn đề pháp lí về sử dụng dịch vụ Internet; tìm hiểu và khai thác phần mềm mô phỏng; trình bày thông tin trong trao đổi và hợp tác; sử dụng công cụ xác thực dữ liệu (Data Validation). Định hướng phát triển NLS - AI: 5.3.TC2a, 5.3.TC2b, 5.4.TC2a, 1.2.TC2a, 1.2.TC2b, 1.1.TC2b, 2.5.TC2a, 2.5.TC2b, 3.3.TC2a, 5.2.TC2b, 5.1.TC2a, 2.4.TC2a, 3.1.TC2a, 3.2.TC2a, 2.2.TC2a, 1.3.TC2a, 1.3.TC2b và AI 9.A2.1, 9.B2.3, 9.A3.1, 9.B2.1, 9.A3.3, 9.D1.1, 9.C4.1.',
    rawLessons: [
      {
        id: 'th9-b1',
        week: 'Tuần 1 – 2',
        lessonName: 'Chủ đề 1: Bài 1. Thế giới kĩ thuật số (2 tiết)',
        periodAllocation: 'Tiết 1 – 2',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Nhận biết các thiết bị có gắn bộ xử lí thông tin và tác động của CNTT lên giáo dục, xã hội. Định hướng phát triển NLS - AI: 5.3.TC2a, 5.3.TC2b, 5.4.TC2a & AI 9.A2.1 (Bài 1).',
      },
      {
        id: 'th9-b2-b3',
        week: 'Tuần 3 – 5',
        lessonName: 'Chủ đề 2: Bài 2. Thông tin trong giải quyết vấn đề (2 tiết); Bài 3. Thực hành: Đánh giá chất lượng thông tin (1 tiết)',
        periodAllocation: 'Tiết 3 – 5',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Đánh giá được chất lượng thông tin trong giải quyết vấn đề (tính mới, tính chính xác, tính đầy đủ, tính sử dụng được). Định hướng phát triển NLS - AI: 1.2.TC2a, 1.2.TC2b, 1.1.TC2b & AI 9.B2.3 (Bài 2); 1.1.TC2b, 1.2.TC2a, 1.2.TC2b & AI 9.A3.1 (Bài 3).',
      },
      {
        id: 'th9-b4-kt-gk1',
        week: 'Tuần 6 – 8',
        lessonName: 'Chủ đề 3: Bài 4. Một số vấn đề pháp lí về sử dụng dịch vụ Internet (2 tiết) & Kiểm tra giữa kì I (1 tiết)',
        periodAllocation: 'Tiết 6 – 8',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nêu một số nội dung liên quan đến luật CNTT, nghị định về sử dụng dịch vụ Internet và các hành vi vi phạm pháp luật trong môi trường số. Kiểm tra giữa kì I (45 phút). Định hướng phát triển NLS - AI: 2.5.TC2a, 2.5.TC2b, 3.3.TC2a & AI 9.B2.1 (Bài 4).',
      },
      {
        id: 'th9-b5-b9a-kt-ck1',
        week: 'Tuần 9 – 18',
        lessonName: 'Chủ đề 4 (HKI): Bài 5. Tìm hiểu phần mềm mô phỏng (1 tiết); Bài 6. Thực hành: Khai thác phần mềm mô phỏng (2 tiết); Bài 7. Trình bày thông tin trong trao đổi và hợp tác (1 tiết); Bài 8. Thực hành: Sử dụng công cụ trực quan trình bày thông tin trong trao đổi và hợp tác (2 tiết); Bài 9a. Sử dụng công cụ xác thực dữ liệu (2 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết 9 – 18',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Khai thác phần mềm mô phỏng khám phá tri thức; sử dụng bài trình chiếu và sơ đồ tư duy đính kèm văn bản, ảnh, video, trang tính trong hợp tác; sử dụng công cụ Data Validation giải quyết bài toán quản lí tài chính. Kiểm tra cuối kì I (45 phút). Định hướng phát triển NLS - AI: 5.2.TC2b, 5.3.TC2a, 5.3.TC2b, 5.1.TC2a (Bài 5, 6); 2.4.TC2a, 3.1.TC2a, 3.2.TC2a & AI 9.A3.3 (Bài 7); 2.4.TC2a, 3.1.TC2a, 3.2.TC2a, 2.2.TC2a & AI 9.D1.1 (Bài 8); 1.3.TC2a, 1.3.TC2b, 5.2.TC2b & AI 9.C4.1 (Bài 9a).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-tinhoc-hk2',
    grade: 9,
    subject: 'Tin học',
    chapterCode: 'TH9-HK2',
    chapterTitle: 'Chủ đề 4a. Sử dụng bảng tính điện tử nâng cao (HKII); Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính & Chủ đề 6. Hướng nghiệp với tin học',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    adjustedContentSummary:
      'Sử dụng các hàm COUNTIF, SUMIF, IF hoàn thiện bảng tính quản lí tài chính gia đình; quy trình giải quyết vấn đề, bài toán trong tin học và lập chương trình máy tính; hướng nghiệp với tin học (nhóm nghề Tin học ứng dụng và Khoa học máy tính). Định hướng phát triển NLS - AI: 5.2.TC2b, 5.3.TC2a, 1.3.TC2a, 1.3.TC2b, 5.1.TC2a, 5.1.TC2b, 5.2.TC2a, 3.4.TC2a, 5.4.TC2a, 2.3.TC2b, 2.6.TC2b và AI 9.B3.2, 9.C2.MR1, 9.C2.1, 9.D1.MR1, 9.D2.1, 9.A3.4.',
    rawLessons: [
      {
        id: 'th9-b10a-b13a-kt-gk2',
        week: 'Tuần 19 – 26',
        lessonName: 'Chủ đề 4a (HKII): Bài 10a. Sử dụng hàm COUNTIF (2 tiết); Bài 11a. Sử dụng hàm SUMIF (2 tiết); Bài 12a. Sử dụng hàm IF (2 tiết); Bài 13a. Hoàn thiện bảng tính quản lí tài chính gia đình (1 tiết) & Kiểm tra giữa kì II (1 tiết)',
        periodAllocation: 'Tiết 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Sử dụng hàm đếm theo điều kiện COUNTIF(), hàm tính tổng theo điều kiện SUMIF() và hàm điều kiện IF() để hoàn thiện bảng tính tổng hợp thu, chi quản lí tài chính gia đình. Kiểm tra giữa kì II (45 phút). Định hướng phát triển NLS - AI: 5.2.TC2b, 5.3.TC2a & AI 9.B3.2 (Bài 10a); 5.2.TC2b, 1.3.TC2a (Bài 11a); 5.2.TC2b, 5.3.TC2a & AI 9.C2.MR1 (Bài 12a); 1.3.TC2a, 5.2.TC2b, 5.3.TC2a, 1.3.TC2b (Bài 13a).',
      },
      {
        id: 'th9-b14-b16',
        week: 'Tuần 27 – 32',
        lessonName: 'Chủ đề 5: Bài 14. Giải quyết vấn đề (2 tiết); Bài 15. Bài toán Tin học (2 tiết); Bài 16. Lập chương trình máy tính (2 tiết)',
        periodAllocation: 'Tiết 27 – 32',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Trình bày quá trình giải quyết vấn đề và mô tả giải pháp dưới dạng thuật toán; giải thích khái niệm bài toán trong tin học và quy trình giao bài toán cho máy tính giải quyết. Định hướng phát triển NLS - AI: 5.1.TC2a, 5.1.TC2b, 5.2.TC2a & AI 9.C2.1 (Bài 14); 3.4.TC2a, 5.3.TC2a, 5.2.TC2b & AI 9.D1.MR1 (Bài 15); 3.4.TC2a, 5.1.TC2a & AI 9.D2.1 (Bài 16).',
      },
      {
        id: 'th9-b17-kt-ck2',
        week: 'Tuần 33 – 35',
        lessonName: 'Chủ đề 6: Bài 17. Tin học với nghề nghiệp (1 tiết); Ôn tập & Kiểm tra cuối kì II (2 tiết)',
        periodAllocation: 'Tiết 33 – 35',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Trình bày đặc trưng cơ bản của nhóm nghề thuộc hướng Tin học ứng dụng và Khoa học máy tính, nhận thức bình đẳng giới trong nghề tin học. Kiểm tra cuối kì II (45 phút). Định hướng phát triển NLS - AI: 5.4.TC2a, 2.3.TC2b, 2.6.TC2b & AI 9.A3.4 (Bài 17).',
      },
    ],
  }),
];
