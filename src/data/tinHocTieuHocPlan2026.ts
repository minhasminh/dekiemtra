import { CognitiveLevelCode, CurriculumTopic, EducationLevelId } from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_TIN_HOC_SOURCE_DOC =
  'Phụ lục I – Kế hoạch dạy học môn Tin học cấp Tiểu học (Lớp 3, 4, 5) năm học 2026 – 2027 (Tổ KHTN – Trường TH&THCS Nguyễn Đình Anh)';

type RawTinHocLessonInput = {
  id: string;
  week: string;
  lessonName: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
};

function buildTinHocTopic(params: {
  id: string;
  grade: 3 | 4 | 5;
  chapterCode: string;
  chapterTitle: string;
  semester: 'HK1' | 'HK2';
  weekRange: string;
  totalPeriods: number;
  adjustedContentSummary: string;
  rawLessons: RawTinHocLessonInput[];
}): CurriculumTopic {
  const {
    id,
    grade,
    chapterCode,
    chapterTitle,
    semester,
    weekRange,
    totalPeriods,
    adjustedContentSummary,
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
      idx % 3 === 0
        ? CognitiveLevelCode.PRIMARY_MUC_1
        : idx % 3 === 1
        ? CognitiveLevelCode.PRIMARY_MUC_2
        : CognitiveLevelCode.PRIMARY_MUC_3,
  }));

  return {
    id,
    levelId: EducationLevelId.PRIMARY,
    grade,
    subject: 'Tin học',
    chapterCode,
    chapterTitle,
    topicTitle: rawLessons.map((l) => `${l.lessonName} (${l.periodsCount} tiết)`).join('; '),
    semester,
    weekRange,
    durationText: `${totalPeriods} tiết (${weekRange})`,
    totalPeriods,
    adjustedContentSummary,
    sourceDocument: NDA_TIN_HOC_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1.2.5. MÔN TIN HỌC – LỚP 3 (35 TIẾT: HKI 18 TIẾT, HKII 17 TIẾT)
// ============================================================================
export const GRADE3_TIN_HOC_TOPICS: CurriculumTopic[] = [
  buildTinHocTopic({
    id: 'nda-g3-tinhoc-cd1',
    grade: 3,
    chapterCode: 'TH3-CĐ1',
    chapterTitle: 'Chủ đề 1. Máy tính và em',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 12',
    totalPeriods: 12,
    adjustedContentSummary:
      'Làm quen với thông tin và quyết định, xử lí thông tin, máy tính và các bộ phận cơ bản, tư thế làm việc và sử dụng bàn phím an toàn. Tích hợp Năng lực số (1.3.CB1a, 4.1.CB1a, 4.3.CB1a, 4.3.CB1b), Giáo dục AI (3.B2.1 nhận biết thông tin giả do AI tạo ra; 3.A1.1 mở rộng khái niệm trợ lí ảo AI xử lí thông tin) và Bài học STEM (Bài 3: Bộ dụng cụ luyện gõ phím ở Bài 5 tiết 10).',
    rawLessons: [
      {
        id: 'g3-th-b1',
        week: 'Tuần 1 – 2',
        lessonName: 'Bài 1. Thông tin và quyết định',
        periodAllocation: 'Tiết 1 – Tiết 2',
        periodsCount: 2,
        adjustedContent:
          'Tiết 1: Năng lực số (1.3.CB1a): Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số. Tiết 2: Tích hợp AI (3.B2.1): Giúp học sinh nhận thức được thông tin dạng hình ảnh/âm thanh do AI tạo ra có thể là giả, nếu tin vào thông tin giả sẽ dẫn đến quyết định sai lầm.',
      },
      {
        id: 'g3-th-b2',
        week: 'Tuần 3 – 4',
        lessonName: 'Bài 2. Xử lí thông tin',
        periodAllocation: 'Tiết 3 – Tiết 4',
        periodsCount: 2,
        adjustedContent:
          'Tiết 3: Năng lực số 1.3.CB1a: Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số. Tiết 4: Tích hợp AI 3.A1.1: Mở rộng khái niệm "máy móc xử lí thông tin": Trợ lí ảo (AI) cũng có thể "nghe" giọng nói, "xử lí" để tìm kiếm và trả lời, giúp em học tập.',
      },
      {
        id: 'g3-th-b3',
        week: 'Tuần 5 – 6',
        lessonName: 'Bài 3. Máy tính và em',
        periodAllocation: 'Tiết 5 – Tiết 6',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 4.1.CB1a: Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản.',
      },
      {
        id: 'g3-th-b4',
        week: 'Tuần 7 – 9',
        lessonName: 'Bài 4. Làm việc với máy tính',
        periodAllocation: 'Tiết 7 – Tiết 9',
        periodsCount: 3,
        adjustedContent:
          'Năng lực số 4.3.CB1a: Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Năng lực số 4.3.CB1b: Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.',
      },
      {
        id: 'g3-th-b5',
        week: 'Tuần 10 – 12',
        lessonName: 'Bài 5. Sử dụng bàn phím',
        periodAllocation: 'Tiết 10 – Tiết 12',
        periodsCount: 3,
        adjustedContent:
          'Tiết 10: Bài học STEM: Bài 3: Bộ dụng cụ luyện gõ phím. Tiết 11, 12: Năng lực số 4.3.CB1a: Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số; 4.3.CB1b: Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g3-tinhoc-cd2-cd3-hk1',
    grade: 3,
    chapterCode: 'TH3-CĐ2-3',
    chapterTitle: 'Chủ đề 2. Mạng máy tính và Internet & Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 13 – Tuần 18',
    totalPeriods: 6,
    adjustedContentSummary:
      'Khám phá thông tin trên Internet, sắp xếp để dễ tìm và Ôn tập, kiểm tra cuối kì 1. Tích hợp Năng lực số (1.3.CB1a, 1.3.CB1b) và Giáo dục AI (3.A3.1 cảnh giác câu trả lời sai lệch/ảo giác của AI tìm kiếm; 3.C4.1 phân loại dữ liệu theo đặc trưng để dạy AI nhận biết đồ vật).',
    rawLessons: [
      {
        id: 'g3-th-b6',
        week: 'Tuần 13 – 14',
        lessonName: 'Bài 6. Khám phá thông tin trên Internet',
        periodAllocation: 'Tiết 13 – Tiết 14',
        periodsCount: 2,
        adjustedContent:
          'Tiết 13: Năng lực số 1.3.CB1a: Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số. Tiết 14: Tích hợp AI 3.A3.1: Hiểu rằng các công cụ AI tìm kiếm trên Internet có thể đưa ra câu trả lời sai lệch hoặc ảo giác, học sinh cần biết nghi ngờ và hỏi người lớn.',
      },
      {
        id: 'g3-th-b7',
        week: 'Tuần 15 – 16',
        lessonName: 'Bài 7. Sắp xếp để dễ tìm',
        periodAllocation: 'Tiết 15 – Tiết 16',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 1.3.CB1a: Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số. 1.3.CB1b: Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc. Tích hợp AI 3.C4.1: Giúp học sinh hiểu rằng để "dạy" AI nhận biết đồ vật, con người cũng phải sắp xếp, phân loại dữ liệu theo các đặc điểm chung (đặc trưng).',
      },
      {
        id: 'g3-th-ot-hk1',
        week: 'Tuần 17',
        lessonName: 'Ôn tập cuối kỳ 1',
        periodAllocation: 'Tiết 17',
        periodsCount: 1,
        adjustedContent:
          'Hệ thống hóa kiến thức Học kì I về thông tin, xử lí thông tin, làm việc với máy tính, bàn phím, khám phá Internet và sắp xếp thông tin.',
      },
      {
        id: 'g3-th-kt-hk1',
        week: 'Tuần 18',
        lessonName: 'Kiểm tra cuối kì 1',
        periodAllocation: 'Tiết 18',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá định kì cuối học kì I môn Tin học lớp 3 theo yêu cầu cần đạt của Chương trình GDPT 2018.',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g3-tinhoc-cd3-cd4-cd5-hk2',
    grade: 3,
    chapterCode: 'TH3-CĐ3-4-5',
    chapterTitle: 'Chủ đề 3. Tổ chức lưu trữ (tiếp), Chủ đề 4. Đạo đức số & Chủ đề 5. Ứng dụng tin học',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 28',
    totalPeriods: 10,
    adjustedContentSummary:
      'Sơ đồ hình cây, thực hành tệp và thư mục, bảo vệ thông tin cá nhân khi dùng máy tính, làm bài trình chiếu và luyện tập chuột. Tích hợp Năng lực số (1.3.CB1a, 1.3.CB1b, 4.2.CB1a, 4.2.CB1b, 3.1.CB1a, 4.1.CB1a), Giáo dục AI (3.B3.1 phòng tránh người xấu thu thập hình ảnh/giọng nói dùng AI giả mạo lừa đảo) và Bài học STEM (Bài 12: Bài trình chiếu của em về hệ Mặt trời).',
    rawLessons: [
      {
        id: 'g3-th-b8',
        week: 'Tuần 19 – 20',
        lessonName: 'Bài 8. Sơ đồ hình cây. Tổ chức thông tin trong máy tính',
        periodAllocation: 'Tiết 19 – Tiết 20',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 1.3.CB1a: Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số. 1.3.CB1b: Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc.',
      },
      {
        id: 'g3-th-b9',
        week: 'Tuần 21 – 22',
        lessonName: 'Bài 9. Thực hành với tệp và thư mục trong máy tính',
        periodAllocation: 'Tiết 21 – Tiết 22',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 1.3.CB1a: Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số. 1.3.CB1b: Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc.',
      },
      {
        id: 'g3-th-b10',
        week: 'Tuần 23 – 24',
        lessonName: 'Bài 10. Bảo vệ thông tin khi dùng máy tính',
        periodAllocation: 'Tiết 23 – Tiết 24',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 4.2.CB1a: Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số. 4.2.CB1b: Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Tích hợp AI 3.B3.1: Nâng cao nhận thức: Người xấu có thể thu thập thông tin cá nhân (hình ảnh, giọng nói) để dùng AI làm giả, lừa đảo gia đình.',
      },
      {
        id: 'g3-th-b11',
        week: 'Tuần 25 – 26',
        lessonName: 'Bài 11. Bài trình chiếu của em',
        periodAllocation: 'Tiết 25 – Tiết 26',
        periodsCount: 2,
        adjustedContent:
          'Bài học STEM: Bài 12: Bài trình chiếu của em về hệ Mặt trời. Năng lực số 3.1.CB1a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.',
      },
      {
        id: 'g3-th-b13',
        week: 'Tuần 27 – 28',
        lessonName: 'Bài 13. Luyện tập sử dụng chuột',
        periodAllocation: 'Tiết 27 – Tiết 28',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 4.1.CB1a: Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản.',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g3-tinhoc-cd6-hk2',
    grade: 3,
    chapterCode: 'TH3-CĐ6',
    chapterTitle: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính',
    semester: 'HK2',
    weekRange: 'Tuần 29 – Tuần 35',
    totalPeriods: 7,
    adjustedContentSummary:
      'Chia công việc thành các bước theo thứ tự, công việc thực hiện theo điều kiện "Nếu... thì..." và công việc với sự trợ giúp của máy tính. Tích hợp Năng lực số (3.4.CB1a) và Giáo dục AI (3.D1.1 huấn luyện AI theo các bước logic; 3.C5.1 rô-bốt thông minh AI hoạt động dựa trên luật "Nếu... thì..."; 3.A1.2 máy tính và AI là công cụ hỗ trợ con người).',
    rawLessons: [
      {
        id: 'g3-th-b14',
        week: 'Tuần 29 – 30',
        lessonName: 'Bài 14. Em thực hiện công việc như thế nào?',
        periodAllocation: 'Tiết 29 – Tiết 30',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB1a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tích hợp AI 3.D1.1: Nhận biết được việc "dạy" (huấn luyện) một hệ thống AI học cũng là một công việc cần chia thành các bước theo thứ tự logic.',
      },
      {
        id: 'g3-th-b15',
        week: 'Tuần 31 – 32',
        lessonName: 'Bài 15. Công việc được thực hiện theo điều kiện',
        periodAllocation: 'Tiết 31 – Tiết 32',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB1a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tích hợp AI 3.C5.1: Giúp học sinh hiểu rằng các rô-bốt thông minh (AI) cũng hoạt động dựa trên các luật "Nếu... thì..." do con người lập trình ra.',
      },
      {
        id: 'g3-th-b16',
        week: 'Tuần 33',
        lessonName: 'Bài 16. Công việc của em và sự trợ giúp của máy tính',
        periodAllocation: 'Tiết 33',
        periodsCount: 1,
        adjustedContent:
          'Năng lực số 3.4.CB1a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tích hợp AI 3.A1.2: Củng cố ý thức: Máy tính hay AI chỉ là công cụ hỗ trợ để hoàn thành dự án, con người mới là người lên kế hoạch, tư duy và ra quyết định.',
      },
      {
        id: 'g3-th-ot-hk2',
        week: 'Tuần 34',
        lessonName: 'Ôn tập cuối học kì 2',
        periodAllocation: 'Tiết 34',
        periodsCount: 1,
        adjustedContent:
          'Ôn tập tổng hợp kiến thức và kĩ năng thực hành môn Tin học lớp 3 Học kì II.',
      },
      {
        id: 'g3-th-kt-hk2',
        week: 'Tuần 35',
        lessonName: 'Kiểm tra cuối học kì 2',
        periodAllocation: 'Tiết 35',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá định kì cuối năm học môn Tin học lớp 3 (Lý thuyết kết hợp Thực hành).',
      },
    ],
  }),
];

// ============================================================================
// 1.2.6. MÔN TIN HỌC – LỚP 4 (35 TIẾT: HKI 18 TIẾT, HKII 17 TIẾT)
// ============================================================================
export const GRADE4_TIN_HOC_TOPICS: CurriculumTopic[] = [
  buildTinHocTopic({
    id: 'nda-g4-tinhoc-cd1-2-3-4',
    grade: 4,
    chapterCode: 'TH4-CĐ1-4',
    chapterTitle: 'Chủ đề 1. Máy tính và em; Chủ đề 2. Mạng máy tính và Internet; Chủ đề 3. Tổ chức lưu trữ, tìm kiếm; Chủ đề 4. Đạo đức số',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 11',
    totalPeriods: 11,
    adjustedContentSummary:
      'Phần cứng và phần mềm máy tính, gõ bàn phím đúng cách, thông tin và tìm kiếm trên Internet, thao tác tệp/thư mục, sử dụng phần mềm khi được phép. Tích hợp Năng lực số (4.1.CB2a, 5.1.CB2a, 4.3.CB2a, 1.1.CB2b, 1.2.CB2a, 1.1.CB2d, 1.3.CB2a, 4.1.CB2c, 4.4.CB2c) và Giáo dục AI (4.A1.1, 4.B2.1, 4.A1.2).',
    rawLessons: [
      {
        id: 'g4-th-b1',
        week: 'Tuần 1 – 2',
        lessonName: 'Bài 1: Phần cứng và phần mềm máy tính',
        periodAllocation: 'Tiết 1 – Tiết 2',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 4.1.CB2a: Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản (Bảo quản phần cứng, phần mềm). 5.1.CB2a: Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số. Tích hợp AI 4.A1.1: Nhận biết các ứng dụng/phần mềm AI cũng cần chạy trên phần cứng máy tính và kể tên một số ứng dụng AI quen thuộc trong công việc hằng ngày.',
      },
      {
        id: 'g4-th-b2',
        week: 'Tuần 3 – 4',
        lessonName: 'Bài 2: Gõ bàn phím đúng cách',
        periodAllocation: 'Tiết 3 – Tiết 4',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 4.3.CB2a: Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số (Tư thế, thói quen gõ phím).',
      },
      {
        id: 'g4-th-b3',
        week: 'Tuần 5 – 6',
        lessonName: 'Bài 3: Thông tin trên trang web',
        periodAllocation: 'Tiết 5 – Tiết 6',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 1.1.CB2b: Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số. 1.2.CB2a: Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số. Tích hợp AI 4.B2.1: Khi xem thông tin trên các trang web (đặc biệt là web có ứng dụng AI chatbot), HS có ý thức bảo mật thông tin cá nhân.',
      },
      {
        id: 'g4-th-b4',
        week: 'Tuần 7 – 8',
        lessonName: 'Bài 4: Tìm kiếm thông tin trên Internet',
        periodAllocation: 'Tiết 7 – Tiết 8',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 1.1.CB2b: Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số. 1.1.CB2d: Xác định được các chiến lược tìm kiếm đơn giản. Tích hợp AI 4.A1.2: Hiểu rằng máy tìm kiếm dùng AI để gợi ý kết quả rất nhanh, nhưng HS cần tự đọc, suy nghĩ và chắt lọc thông tin chứ không sao chép hoàn toàn.',
      },
      {
        id: 'g4-th-b5',
        week: 'Tuần 9 – 10',
        lessonName: 'Bài 5: Thao tác với tệp và thư mục',
        periodAllocation: 'Tiết 9 – Tiết 10',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 1.3.CB2a: Tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số.',
      },
      {
        id: 'g4-th-b6',
        week: 'Tuần 11',
        lessonName: 'Bài 6: Sử dụng phần mềm khi được phép',
        periodAllocation: 'Tiết 11',
        periodsCount: 1,
        adjustedContent:
          'Năng lực số 4.1.CB2c: Tuân theo được các biện pháp an toàn và bảo mật đơn giản (Liên quan đến bản quyền và sử dụng hợp pháp). 4.4.CB2c: Nhận biết được bản quyền đối với các nội dung và dữ liệu số.',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g4-tinhoc-cd5-hk1',
    grade: 4,
    chapterCode: 'TH4-CĐ5-HK1',
    chapterTitle: 'Chủ đề 5. Ứng dụng tin học (HKI) & Kiểm tra cuối kì 1',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 18',
    totalPeriods: 7,
    adjustedContentSummary:
      'Tạo bài trình chiếu, định dạng văn bản trên trang chiếu, hiệu ứng chuyển trang (Tiết 1) và Ôn tập, kiểm tra cuối kì 1. Tích hợp Năng lực số (3.1.CB2a, 3.1.CB2b).',
    rawLessons: [
      {
        id: 'g4-th-b7',
        week: 'Tuần 12 – 13',
        lessonName: 'Bài 7: Tạo bài trình chiếu',
        periodAllocation: 'Tiết 12 – Tiết 13',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.',
      },
      {
        id: 'g4-th-b8',
        week: 'Tuần 14 – 15',
        lessonName: 'Bài 8: Định dạng văn bản trên trang chiếu',
        periodAllocation: 'Tiết 14 – Tiết 15',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.',
      },
      {
        id: 'g4-th-b9-t1',
        week: 'Tuần 16',
        lessonName: 'Bài 9: Hiệu ứng chuyển trang (T1)',
        periodAllocation: 'Tiết 16',
        periodsCount: 1,
        adjustedContent:
          'Năng lực số 3.1.CB2b: Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.',
      },
      {
        id: 'g4-th-ot-hk1',
        week: 'Tuần 17',
        lessonName: 'Ôn tập cuối kỳ 1',
        periodAllocation: 'Tiết 17',
        periodsCount: 1,
        adjustedContent:
          'Hệ thống hóa kiến thức Học kì I môn Tin học lớp 4 (Phần cứng/phần mềm, Internet, tệp/thư mục, bản quyền phần mềm và tạo bài trình chiếu).',
      },
      {
        id: 'g4-th-kt-hk1',
        week: 'Tuần 18',
        lessonName: 'Kiểm tra cuối kì 1',
        periodAllocation: 'Tiết 18',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá định kì cuối học kì I môn Tin học lớp 4.',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g4-tinhoc-cd5-hk2',
    grade: 4,
    chapterCode: 'TH4-CĐ5-HK2',
    chapterTitle: 'Chủ đề 5. Ứng dụng tin học (HKII)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 27',
    totalPeriods: 9,
    adjustedContentSummary:
      'Hiệu ứng chuyển trang (Tiết 2), phần mềm soạn thảo văn bản, chỉnh sửa văn bản, phần mềm luyện gõ bàn phím và chơi với máy tính. Tích hợp Năng lực số (3.1.CB2a, 3.1.CB2b, 3.2.CB2a, 5.2.CB2b) và Giáo dục AI (4.A1.2 nhận biết tính năng tự động phát hiện lỗi chính tả nhờ AI; 4.C5.1 làm quen tính năng thông minh nhận diện hình ảnh/nét vẽ qua trò chơi).',
    rawLessons: [
      {
        id: 'g4-th-b9-t2',
        week: 'Tuần 19',
        lessonName: 'Bài 9: Hiệu ứng chuyển trang (T2)',
        periodAllocation: 'Tiết 19',
        periodsCount: 1,
        adjustedContent:
          'Năng lực số 3.1.CB2b: Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.',
      },
      {
        id: 'g4-th-b10',
        week: 'Tuần 20 – 21',
        lessonName: 'Bài 10: Phần mềm soạn thảo văn bản',
        periodAllocation: 'Tiết 20 – Tiết 21',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản. Tích hợp AI 4.A1.2: Nhận biết phần mềm soạn thảo tích hợp tính năng tự động phát hiện lỗi chính tả (nhờ AI), nhưng HS vẫn cần nắm vững ngữ pháp để viết đúng.',
      },
      {
        id: 'g4-th-b11',
        week: 'Tuần 22 – 23',
        lessonName: 'Bài 11: Chỉnh sửa văn bản',
        periodAllocation: 'Tiết 22 – Tiết 23',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.1.CB2b: Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.',
      },
      {
        id: 'g4-th-b12b',
        week: 'Tuần 24 – 25',
        lessonName: 'Bài 12B: Phần mềm luyện gõ bàn phím',
        periodAllocation: 'Tiết 24 – Tiết 25',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.2.CB2a: Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo.',
      },
      {
        id: 'g4-th-b13',
        week: 'Tuần 26 – 27',
        lessonName: 'Bài 13: Chơi với máy tính',
        periodAllocation: 'Tiết 26 – Tiết 27',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 5.2.CB2b: Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó (giải trí lành mạnh). Tích hợp AI 4.C5.1: Thông qua trò chơi máy tính, HS bước đầu làm quen với tính năng "thông minh" của máy (nhận diện hình ảnh/nét vẽ).',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g4-tinhoc-cd6-hk2',
    grade: 4,
    chapterCode: 'TH4-CĐ6',
    chapterTitle: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 35',
    totalPeriods: 8,
    adjustedContentSummary:
      'Khám phá môi trường lập trình trực quan, tạo chương trình máy tính diễn tả ý tưởng, hoàn thiện chương trình của em và Ôn tập, kiểm tra cuối học kì 2. Tích hợp Năng lực số (3.4.CB2a) và Giáo dục AI (4.D1.1 lập trình dạy máy tính và thiết kế nhân vật tương tác mô phỏng trợ lý ảo; 4.D2.1 liên tục thử nghiệm, tìm lỗi và tinh chỉnh câu lệnh để máy tính/AI thông minh hơn).',
    rawLessons: [
      {
        id: 'g4-th-b14',
        week: 'Tuần 28 – 29',
        lessonName: 'Bài 14: Khám phá môi trường lập trình trực quan',
        periodAllocation: 'Tiết 28 – Tiết 29',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tích hợp AI 4.D1.1: Hiểu rằng bằng các câu lệnh, con người đang từng bước "dạy" máy tính thực hiện các hành động giải quyết vấn đề (nền tảng của lập trình AI).',
      },
      {
        id: 'g4-th-b15',
        week: 'Tuần 30 – 31',
        lessonName: 'Bài 15: Tạo chương trình máy tính để diễn tả ý tưởng',
        periodAllocation: 'Tiết 30 – Tiết 31',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tích hợp AI 4.D1.1: Áp dụng tư duy lập trình để thiết kế nhân vật có khả năng tương tác, giao tiếp cơ bản mô phỏng lại một "trợ lý ảo" đơn giản.',
      },
      {
        id: 'g4-th-b16',
        week: 'Tuần 32 – 33',
        lessonName: 'Bài 16: Chương trình của em',
        periodAllocation: 'Tiết 32 – Tiết 33',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tích hợp AI 4.D2.1: Nắm được nguyên tắc cốt lõi: Để máy tính (và AI) ngày càng thông minh, con người phải liên tục thử nghiệm, tìm lỗi và tinh chỉnh các câu lệnh.',
      },
      {
        id: 'g4-th-ot-hk2',
        week: 'Tuần 34',
        lessonName: 'Ôn tập cuối học kì 2',
        periodAllocation: 'Tiết 34',
        periodsCount: 1,
        adjustedContent:
          'Ôn tập tổng hợp kiến thức và kĩ năng lập trình trực quan, soạn thảo văn bản môn Tin học lớp 4.',
      },
      {
        id: 'g4-th-kt-hk2',
        week: 'Tuần 35',
        lessonName: 'Kiểm tra cuối học kì 2',
        periodAllocation: 'Tiết 35',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá định kì cuối học kì II môn Tin học lớp 4.',
      },
    ],
  }),
];

// ============================================================================
// 1.2.7. MÔN TIN HỌC – LỚP 5 (35 TIẾT: HKI 18 TIẾT, HKII 17 TIẾT)
// ============================================================================
export const GRADE5_TIN_HOC_TOPICS: CurriculumTopic[] = [
  buildTinHocTopic({
    id: 'nda-g5-tinhoc-cd1-2-3-4',
    grade: 5,
    chapterCode: 'TH5-CĐ1-4',
    chapterTitle: 'Chủ đề 1. Máy tính và em; Chủ đề 2. Mạng máy tính và Internet; Chủ đề 3. Tổ chức lưu trữ, tìm kiếm; Chủ đề 4. Đạo đức số',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 10',
    totalPeriods: 10,
    adjustedContentSummary:
      'Em có thể làm gì với máy tính, tìm kiếm thông tin trên website và trong giải quyết vấn đề, cây thư mục, bản quyền nội dung thông tin. Tích hợp Năng lực số (5.2.CB2a, 5.2.CB2b, 1.1.CB2a, 1.1.CB2b, 1.1.CB2c, 1.2.CB2a, 2.1.CB2a, 2.1.CB2b, 2.2.CB2a, 2.4.CB2a, 4.2.CB2a, 4.2.CB2b) và Giáo dục AI (5.A2.1 nhận biết AI là công cụ hỗ trợ; 5.A3.1 đánh giá kiểm chứng thông tin và bảo vệ tính riêng tư trong kỷ nguyên AI; 5.A1.1 chịu trách nhiệm với thông tin sử dụng).',
    rawLessons: [
      {
        id: 'g5-th-b1',
        week: 'Tuần 1 – 2',
        lessonName: 'Bài 1. Em có thể làm gì với máy tính?',
        periodAllocation: 'Tiết 1 – Tiết 2',
        periodsCount: 2,
        adjustedContent:
          'Tiết 1: Năng lực số 5.2.CB2a: Xác định được nhu cầu cá nhân. Tiết 2: 5.2.CB2b: Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó. Tích hợp AI 5.A2.1: Nhận biết AI là công cụ hỗ trợ: Máy tính và AI giúp tạo ra sản phẩm số nhanh chóng, nhưng con người vẫn là người làm chủ tư duy, sáng tạo và quyết định cuối cùng.',
      },
      {
        id: 'g5-th-b2',
        week: 'Tuần 3 – 4',
        lessonName: 'Bài 2. Tìm kiếm thông tin trên website',
        periodAllocation: 'Tiết 3 – Tiết 4',
        periodsCount: 2,
        adjustedContent:
          'Tiết 1 (Tiết 3): Năng lực số 1.1.CB2a (Xác định nhu cầu thông tin), 1.1.CB2b (Tìm dữ liệu qua tìm kiếm đơn giản), 1.1.CB2c (Truy cập và điều hướng dữ liệu). Tiết 2 (Tiết 4): 1.2.CB2a (Phát hiện độ tin cậy của nguồn dữ liệu), 2.1.CB2a, 2.1.CB2b, 2.2.CB2a, 2.4.CB2a. Tích hợp AI 5.A3.1: Đánh giá thông tin từ công cụ số: Hình thành thói quen kiểm chứng, không tin tưởng tuyệt đối vào mọi thông tin do website hoặc các công cụ AI tìm kiếm đề xuất.',
      },
      {
        id: 'g5-th-b3',
        week: 'Tuần 5 – 6',
        lessonName: 'Bài 3. Tìm kiếm thông tin trong giải quyết vấn đề',
        periodAllocation: 'Tiết 5 – Tiết 6',
        periodsCount: 2,
        adjustedContent:
          'Tiết 1 (Tiết 5): Năng lực số 1.1.CB2a, 1.1.CB2b. Tiết 2 (Tiết 6): 1.1.CB2c. Tích hợp AI 5.A1.1 (Cả 2 tiết): Chịu trách nhiệm với thông tin sử dụng: Khi sử dụng thông tin từ Internet hoặc AI để giải quyết vấn đề, học sinh phải là người đưa ra quyết định chọn lọc và chịu trách nhiệm với giải pháp của mình.',
      },
      {
        id: 'g5-th-b4',
        week: 'Tuần 7 – 8',
        lessonName: 'Bài 4. Cây thư mục',
        periodAllocation: 'Tiết 7 – Tiết 8',
        periodsCount: 2,
        adjustedContent:
          'Tiết 1 (Tiết 7): Năng lực số 4.2.CB2a: Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số. Tiết 2 (Tiết 8): 4.2.CB2b: Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác.',
      },
      {
        id: 'g5-th-b5',
        week: 'Tuần 9 – 10',
        lessonName: 'Bài 5. Bản quyền nội dung thông tin',
        periodAllocation: 'Tiết 9 – Tiết 10',
        periodsCount: 2,
        adjustedContent:
          'Tiết 1 (Tiết 9): Tìm hiểu quy định về bản quyền nội dung thông tin và tôn trọng quyền tác giả. Tiết 2 (Tiết 10): Tích hợp AI 5.A3.1: Bảo vệ tính riêng tư trong kỷ nguyên AI: Nhận thức được nguy cơ lộ thông tin cá nhân khi sử dụng các công cụ trực tuyến và AI, qua đó có ý thức bảo vệ dữ liệu bản thân và tôn trọng quyền của người khác.',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g5-tinhoc-cd5-hk1',
    grade: 5,
    chapterCode: 'TH5-CĐ5',
    chapterTitle: 'Chủ đề 5. Ứng dụng tin học & Kiểm tra cuối kì 1',
    semester: 'HK1',
    weekRange: 'Tuần 11 – Tuần 19',
    totalPeriods: 9,
    adjustedContentSummary:
      'Định dạng kí tự và bố trí hình ảnh trong văn bản, thực hành soạn thảo văn bản, làm quen và sử dụng phần mềm đồ hoạ tạo sản phẩm số, Ôn tập và Kiểm tra cuối kì 1. Tích hợp Năng lực số (3.1.CB2a, 3.1.CB2b).',
    rawLessons: [
      {
        id: 'g5-th-b6',
        week: 'Tuần 11 – 12',
        lessonName: 'Bài 6. Định dạng kí tự và bố trí hình ảnh trong văn bản',
        periodAllocation: 'Tiết 11 – Tiết 12',
        periodsCount: 2,
        adjustedContent:
          'Thực hiện định dạng phông chữ, cỡ chữ, kiểu chữ, màu chữ và đưa hình ảnh minh họa vào văn bản hợp lí, thẩm mĩ.',
      },
      {
        id: 'g5-th-b7',
        week: 'Tuần 13 – 14',
        lessonName: 'Bài 7. Thực hành soạn thảo văn bản',
        periodAllocation: 'Tiết 13 – Tiết 14',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản. 3.1.CB2b: Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.',
      },
      {
        id: 'g5-th-b8a',
        week: 'Tuần 15 – 16',
        lessonName: 'Bài 8A. Làm quen với phần mềm đồ hoạ',
        periodAllocation: 'Tiết 15 – Tiết 16',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.1.CB2a: Xác định các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản. 3.1.CB2b: Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.',
      },
      {
        id: 'g5-th-ot-hk1',
        week: 'Tuần 17',
        lessonName: 'Ôn tập cuối kỳ 1',
        periodAllocation: 'Tiết 17',
        periodsCount: 1,
        adjustedContent:
          'Hệ thống hóa kiến thức Học kì I môn Tin học lớp 5 (Tìm kiếm thông tin, cây thư mục, bản quyền thông tin, soạn thảo văn bản và đồ họa cơ bản).',
      },
      {
        id: 'g5-th-kt-hk1',
        week: 'Tuần 18',
        lessonName: 'Kiểm tra cuối kì 1',
        periodAllocation: 'Tiết 18',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá định kì cuối học kì I môn Tin học lớp 5.',
      },
      {
        id: 'g5-th-b9a',
        week: 'Tuần 19',
        lessonName: 'Bài 9A. Sử dụng phần mềm đồ hoạ tạo sản phẩm số',
        periodAllocation: 'Tiết 19',
        periodsCount: 1,
        adjustedContent:
          'Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản. 3.1.CB2b: Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.',
      },
    ],
  }),
  buildTinHocTopic({
    id: 'nda-g5-tinhoc-cd6-hk2',
    grade: 5,
    chapterCode: 'TH5-CĐ6',
    chapterTitle: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính',
    semester: 'HK2',
    weekRange: 'Tuần 20 – Tuần 35',
    totalPeriods: 16,
    adjustedContentSummary:
      'Cấu trúc tuần tự, cấu trúc lặp, thực hành sử dụng lệnh lặp, cấu trúc rẽ nhánh, sử dụng biến và biểu thức trong chương trình, từ kịch bản đến chương trình và Ôn tập, kiểm tra cuối học kì 2. Tích hợp Năng lực số (3.4.CB2a) và Giáo dục AI (5.C4.1 hiểu thuật toán AI dựa trên luật Rule-based AI thông qua cấu trúc rẽ nhánh "Nếu... thì...").',
    rawLessons: [
      {
        id: 'g5-th-b10',
        week: 'Tuần 20 – 21',
        lessonName: 'Bài 10. Cấu trúc tuần tự',
        periodAllocation: 'Tiết 20 – Tiết 21',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.',
      },
      {
        id: 'g5-th-b11',
        week: 'Tuần 22 – 23',
        lessonName: 'Bài 11. Cấu trúc lặp',
        periodAllocation: 'Tiết 22 – Tiết 23',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.',
      },
      {
        id: 'g5-th-b12',
        week: 'Tuần 24 – 25',
        lessonName: 'Bài 12. Thực hành sử dụng lệnh lặp',
        periodAllocation: 'Tiết 24 – Tiết 25',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.',
      },
      {
        id: 'g5-th-b13',
        week: 'Tuần 26 – 27',
        lessonName: 'Bài 13. Cấu trúc rẽ nhánh',
        periodAllocation: 'Tiết 26 – Tiết 27',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tích hợp AI 5.C4.1: Hiểu thuật toán AI dựa trên luật: Học sinh nắm được cấu trúc rẽ nhánh "Nếu... thì..." chính là cách tư duy nền tảng giúp máy tính/AI đưa ra quyết định đơn giản (Rule-based AI).',
      },
      {
        id: 'g5-th-b14',
        week: 'Tuần 28 – 29',
        lessonName: 'Bài 14. Sử dụng biến trong chương trình',
        periodAllocation: 'Tiết 28 – Tiết 29',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.',
      },
      {
        id: 'g5-th-b15',
        week: 'Tuần 30 – 31',
        lessonName: 'Bài 15. Sử dụng biểu thức trong chương trình',
        periodAllocation: 'Tiết 30 – Tiết 31',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.',
      },
      {
        id: 'g5-th-b16',
        week: 'Tuần 32 – 33',
        lessonName: 'Bài 16. Từ kịch bản đến chương trình',
        periodAllocation: 'Tiết 32 – Tiết 33',
        periodsCount: 2,
        adjustedContent:
          'Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.',
      },
      {
        id: 'g5-th-ot-hk2',
        week: 'Tuần 34',
        lessonName: 'Ôn tập cuối học kì 2',
        periodAllocation: 'Tiết 34',
        periodsCount: 1,
        adjustedContent:
          'Ôn tập tổng hợp kiến thức lập trình trực quan (cấu trúc tuần tự, lặp, rẽ nhánh, biến và biểu thức) môn Tin học lớp 5.',
      },
      {
        id: 'g5-th-kt-hk2',
        week: 'Tuần 35',
        lessonName: 'Kiểm tra cuối học kì 2',
        periodAllocation: 'Tiết 35',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá định kì cuối năm học môn Tin học lớp 5.',
      },
    ],
  }),
];
