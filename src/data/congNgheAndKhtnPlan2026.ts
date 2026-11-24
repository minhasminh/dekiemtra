import {
  CognitiveLevelCode,
  CurriculumLessonItem,
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_KHTN_CONG_NGHE_SOURCE_DOC =
  'Phụ lục I – Kế hoạch dạy học môn Công nghệ Tiểu học (Lớp 3, 4, 5) & Chuyên đề lựa chọn/STEM Tổ KHTN năm học 2026 – 2027 (Trường TH&THCS Nguyễn Đình Anh)';

interface RawCongNgheLessonInput {
  week: string;
  lessonName: string;
  subLessonName?: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
}

function buildPrimaryCongNgheTopic(params: {
  id: string;
  grade: GradeNumber;
  subject?: string;
  semester: 'HK1' | 'HK2' | 'CA_NAM';
  weekRange: string;
  totalPeriods: number;
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  adjustedContentSummary: string;
  rawLessons: RawCongNgheLessonInput[];
}): CurriculumTopic {
  const lessons: CurriculumLessonItem[] = params.rawLessons.map((item, idx) => ({
    id: `${params.id}-ls-${idx + 1}`,
    week: item.week,
    lessonName: item.lessonName,
    subLessonName: item.subLessonName,
    periodAllocation: item.periodAllocation,
    periodsCount: item.periodsCount,
    adjustedContent: item.adjustedContent,
    integrationTags: extractIntegrationTags(item.adjustedContent),
    note: item.note,
  }));

  const groupedByLesson = new Map<
    string,
    {
      week: string;
      lessonName: string;
      totalPeriods: number;
      periodDetails: string[];
      contents: string[];
    }
  >();

  for (const ls of params.rawLessons) {
    const key = ls.lessonName;
    const existing = groupedByLesson.get(key);
    const subDetail = ls.subLessonName
      ? `${ls.subLessonName} (${ls.periodAllocation})`
      : ls.periodAllocation;
    if (!existing) {
      groupedByLesson.set(key, {
        week: ls.week,
        lessonName: ls.lessonName,
        totalPeriods: ls.periodsCount,
        periodDetails: [subDetail],
        contents: ls.adjustedContent.trim() ? [ls.adjustedContent.trim()] : [],
      });
    } else {
      existing.totalPeriods += ls.periodsCount;
      existing.periodDetails.push(subDetail);
      if (ls.adjustedContent.trim()) {
        existing.contents.push(ls.adjustedContent.trim());
      }
    }
  }

  const levels = [
    CognitiveLevelCode.PRIMARY_MUC_1,
    CognitiveLevelCode.PRIMARY_MUC_2,
    CognitiveLevelCode.PRIMARY_MUC_3,
  ];

  const learningOutcomes = Array.from(groupedByLesson.values()).map((grp, idx) => {
    const combinedContent =
      grp.contents.length > 0
        ? grp.contents.join(' | ')
        : `Thực hiện đầy đủ yêu cầu cần đạt của bài học "${grp.lessonName}" theo Chương trình GDPT 2018.`;
    return {
      code: `${params.chapterCode}-B${idx + 1}`,
      description: `${grp.lessonName} [${grp.periodDetails.join('; ')}]: ${combinedContent}`,
      suggestedCognitiveLevel: levels[idx % levels.length],
      lessonName: grp.lessonName,
      duration: `${grp.totalPeriods} tiết`,
      week: `Tuần ${grp.week}`,
    };
  });

  return {
    id: params.id,
    levelId: EducationLevelId.PRIMARY,
    grade: params.grade,
    subject: params.subject || 'Công nghệ',
    semester: params.semester,
    weekRange: params.weekRange,
    totalPeriods: params.totalPeriods,
    durationText: `${params.totalPeriods} tiết (${params.weekRange})`,
    adjustedContentSummary: params.adjustedContentSummary,
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    chapterCode: params.chapterCode,
    chapterTitle: params.chapterTitle,
    topicTitle: params.topicTitle,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1.4.5. MÔN CÔNG NGHỆ – LỚP 3
// Tổng số tiết cả năm học: 35 tiết (35 tuần, 1 tiết/tuần)
// - Học kì I: 18 tuần x 1 tiết/tuần = 18 tiết
// - Học kì II: 17 tuần x 1 tiết/tuần = 17 tiết
// ============================================================================
export const GRADE3_CONG_NGHE_TOPICS: CurriculumTopic[] = [
  buildPrimaryCongNgheTopic({
    id: 'cur-nda-g3-cn-hk1-cd1',
    grade: 3,
    subject: 'Công nghệ',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 14',
    totalPeriods: 14,
    chapterCode: 'CN3-CĐ1',
    chapterTitle: 'Chủ đề 1: Tự nhiên và công nghệ',
    topicTitle:
      'Bài 1. Tự nhiên và công nghệ (2 tiết); Bài 2. Sử dụng đèn học (2 tiết); Bài 3. Sử dụng quạt điện (2 tiết); Bài 4. Sử dụng máy thu thanh (4 tiết); Bài 5. Sử dụng máy thu hình (4 tiết)',
    adjustedContentSummary:
      'Phân biệt đối tượng tự nhiên và sản phẩm công nghệ; sử dụng an toàn, đúng cách đèn học, quạt điện, máy thu thanh, máy thu hình; Tích hợp Năng lực số (5.2.CB1a, 5.2.CB1b, 4.3.CB1a, 1.3.CB1a) và Giáo dục AI (3.C5.1, 3.B2.1, 3.A1.1).',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1. Tự nhiên và công nghệ (2 tiết)',
        subLessonName: 'Tiết 1: Nhận biết đối tượng tự nhiên và sản phẩm công nghệ',
        periodAllocation: 'Tiết 1 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp Năng lực số 5.2.CB1a: Nhận biết được nhu cầu cá nhân đối với các sản phẩm công nghệ.',
      },
      {
        week: '2',
        lessonName: 'Bài 1. Tự nhiên và công nghệ (2 tiết)',
        subLessonName: 'Tiết 2: Vai trò của sản phẩm công nghệ trong đời sống',
        periodAllocation: 'Tiết 2 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp Năng lực số 5.2.CB1b: Nhận ra được các công cụ đơn giản có thể có để giải quyết những nhu cầu của bản thân.',
      },
      {
        week: '3',
        lessonName: 'Bài 2. Sử dụng đèn học (2 tiết)',
        subLessonName: 'Tiết 3: Các bộ phận chính và công dụng của đèn học',
        periodAllocation: 'Tiết 3 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp Năng lực số 4.3.CB1a: Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.',
      },
      {
        week: '4',
        lessonName: 'Bài 2. Sử dụng đèn học (2 tiết)',
        subLessonName: 'Tiết 4: Sử dụng đèn học đúng cách và an toàn',
        periodAllocation: 'Tiết 4 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI 3.C5.1: Hiểu được cấu trúc "nếu ... thì ..." trong việc giải quyết tình huống hoạt động của các thiết bị thông minh như đèn học tự động.',
      },
      {
        week: '5 – 6',
        lessonName: 'Bài 3. Sử dụng quạt điện (2 tiết)',
        subLessonName: 'Tiết 5 – Tiết 6: Tác dụng, các bộ phận và sử dụng quạt điện an toàn',
        periodAllocation: 'Tiết 5 – 6 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Nhận biết các bộ phận chính, công dụng của từng bộ phận và thực hành bật, tắt, điều chỉnh tốc độ quạt điện an toàn, tiết kiệm điện.',
      },
      {
        week: '7 – 9',
        lessonName: 'Bài 4. Sử dụng máy thu thanh (4 tiết)',
        subLessonName: 'Tiết 7 – Tiết 9: Tác dụng và cách chọn kênh chương trình phát thanh',
        periodAllocation: 'Tiết 7 – 9 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 1.3.CB1a: Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số.',
      },
      {
        week: '10',
        lessonName: 'Bài 4. Sử dụng máy thu thanh (4 tiết)',
        subLessonName: 'Tiết 10: Thực hành sử dụng máy thu thanh và kiểm chứng thông tin',
        periodAllocation: 'Tiết 10 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI 3.B2.1: Nhận biết và nêu được ví dụ về việc âm thanh, tin tức do AI tạo ra có thể không đúng với sự thật khi nghe đài phát thanh.',
      },
      {
        week: '11 – 14',
        lessonName: 'Bài 5. Sử dụng máy thu hình (4 tiết)',
        subLessonName: 'Tiết 11 – Tiết 14: Tác dụng của máy thu hình, chọn kênh truyền hình giáo dục và tư thế ngồi xem an toàn',
        periodAllocation: 'Tiết 11 – 14 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp Năng lực số 4.3.CB1a: Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.\n- Tích hợp AI 3.A1.1: Nhận biết và nêu được một số cách mà AI (như trợ lý ảo thông minh trên ti vi) có thể hỗ trợ học sinh tìm kiếm kênh truyền hình giáo dục an toàn, thuận tiện.',
      },
    ],
  }),

  buildPrimaryCongNgheTopic({
    id: 'cur-nda-g3-cn-hk1-cd2',
    grade: 3,
    subject: 'Công nghệ',
    semester: 'HK1',
    weekRange: 'Tuần 15 – Tuần 18',
    totalPeriods: 4,
    chapterCode: 'CN3-CĐ2-HK1',
    chapterTitle: 'Chủ đề: An toàn với môi trường công nghệ trong gia đình & Kiểm tra HKI',
    topicTitle:
      'Bài 6. An toàn với môi trường công nghệ trong gia đình (Tiết 15 – 16, 2 tiết); Ôn tập học kì 1 (1 tiết); Kiểm tra học kì 1 (1 tiết)',
    adjustedContentSummary:
      'Nhận biết và phòng tránh các tình huống mất an toàn trong môi trường công nghệ tại gia đình; bảo vệ quyền riêng tư trước các thiết bị AI giám sát; Ôn tập và Kiểm tra cuối Học kì I.',
    rawLessons: [
      {
        week: '15',
        lessonName: 'Bài 6. An toàn với môi trường công nghệ trong gia đình (4 tiết – Phần 1 HKI: 2 tiết)',
        subLessonName: 'Tiết 15: Nhận biết nguy cơ mất an toàn khi sử dụng thiết bị công nghệ trong gia đình',
        periodAllocation: 'Tiết 15 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp Năng lực số 4.3.CB1b: Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.',
      },
      {
        week: '16',
        lessonName: 'Bài 6. An toàn với môi trường công nghệ trong gia đình (4 tiết – Phần 1 HKI: 2 tiết)',
        subLessonName: 'Tiết 16: An toàn dữ liệu và quyền riêng tư với thiết bị thông minh trong gia đình',
        periodAllocation: 'Tiết 16 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI 3.A1.3: Nhận biết và giải thích được rằng cần xem xét cẩn thận các rủi ro (đặc biệt về quyền riêng tư và dữ liệu) trước khi sử dụng các thiết bị AI giám sát trong gia đình.',
      },
      {
        week: '17',
        lessonName: 'Ôn tập học kì 1 (1 tiết)',
        subLessonName: 'Tiết 17: Hệ thống hóa kiến thức Chủ đề Tự nhiên và công nghệ',
        periodAllocation: 'Tiết 17 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Ôn tập củng cố kiến thức, kĩ năng sử dụng an toàn đèn học, quạt điện, máy thu thanh, máy thu hình và phòng tránh rủi ro công nghệ trong gia đình.',
      },
      {
        week: '18',
        lessonName: 'Kiểm tra học kì 1 (1 tiết)',
        subLessonName: 'Tiết 18: Đánh giá định kì cuối Học kì I môn Công nghệ 3',
        periodAllocation: 'Tiết 18 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá kết quả học tập Học kì I theo chuẩn yêu cầu cần đạt Chương trình GDPT 2018 (Thông tư 27/2020/TT-BGDĐT).',
      },
    ],
  }),

  buildPrimaryCongNgheTopic({
    id: 'cur-nda-g3-cn-hk2-cd2',
    grade: 3,
    subject: 'Công nghệ',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'CN3-CĐ2-HK2',
    chapterTitle: 'Chủ đề: An toàn với môi trường công nghệ trong gia đình (tiếp) & Thủ công kĩ thuật',
    topicTitle:
      'Bài 6. An toàn với môi trường công nghệ trong gia đình (Tiết 19 – 20, 2 tiết); Bài 7. Dụng cụ và vật liệu làm thủ công (2 tiết); Bài 8. Làm đồ dùng học tập (3 tiết); Bài 9. Làm biển báo giao thông (4 tiết); Bài 10. Làm đồ chơi (4 tiết); Ôn tập học kì 2 (1 tiết); Kiểm tra học kì 2 (1 tiết)',
    adjustedContentSummary:
      'Thực hiện Bài học STEM Bộ thẻ thông tin An toàn với môi trường công nghệ và Sáng chế đồ chơi; làm đồ dùng học tập, biển báo giao thông, đồ chơi thủ công; Tích hợp NLS (4.3.CB1b, 5.2.CB1b, 3.1.CB1a) và AI (3.C5.1).',
    rawLessons: [
      {
        week: '19 – 20',
        lessonName: 'Bài 6. An toàn với môi trường công nghệ trong gia đình (Tiết 19 – 20: 2 tiết)',
        subLessonName: 'Tiết 19 – Tiết 20: Bài học STEM – Bài 5: Bộ thẻ thông tin “An toàn với môi trường công nghệ”',
        periodAllocation: 'Tiết 19 – 20 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          '- Bài học STEM: Bài 5: Bộ thẻ thông tin “An toàn với môi trường công nghệ”.\n- Tích hợp Năng lực số 4.3.CB1b: Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.',
      },
      {
        week: '21 – 22',
        lessonName: 'Bài 7. Dụng cụ và vật liệu làm thủ công (2 tiết)',
        subLessonName: 'Tiết 21 – Tiết 22: Nhận biết và sử dụng an toàn dụng cụ, vật liệu thủ công',
        periodAllocation: 'Tiết 21 – 22 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Năng lực số 5.2.CB1b: Nhận ra được các công cụ đơn giản có thể có để giải quyết những nhu cầu đó.',
      },
      {
        week: '23 – 25',
        lessonName: 'Bài 8. Làm đồ dùng học tập (3 tiết)',
        subLessonName: 'Tiết 23 – Tiết 25: Thực hành làm thước kẻ, hộp đựng bút hoặc thẻ đánh dấu trang',
        periodAllocation: 'Tiết 23 – 25 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 3.1.CB1a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.',
      },
      {
        week: '26 – 29',
        lessonName: 'Bài 9. Làm biển báo giao thông (4 tiết)',
        subLessonName: 'Tiết 26 – Tiết 29: Ý nghĩa biển báo và thực hành làm mô hình biển báo giao thông',
        periodAllocation: 'Tiết 26 – 29 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Năng lực số 3.1.CB1a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản; giáo dục An toàn giao thông (ATGT).',
      },
      {
        week: '30 – 33',
        lessonName: 'Bài 10. Làm đồ chơi (4 tiết)',
        subLessonName: 'Tiết 30 – Tiết 33: Bài học STEM – Bài 9: Sáng chế đồ chơi',
        periodAllocation: 'Tiết 30 – 33 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          '- Bài học STEM: Bài 9: Sáng chế đồ chơi.\n- Tích hợp Năng lực số 3.1.CB1a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.\n- Tích hợp AI 3.C5.1: Hiểu được cấu trúc "nếu ... thì ..." thông qua trò chơi mô phỏng điều khiển hệ thống xe đồ chơi tự hành.',
      },
      {
        week: '34',
        lessonName: 'Ôn tập học kì 2 (1 tiết)',
        subLessonName: 'Tiết 34: Tổng kết, trưng bày sản phẩm thủ công kĩ thuật và STEM',
        periodAllocation: 'Tiết 34 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Ôn tập quy trình lựa chọn vật liệu, dụng cụ và các bước làm đồ dùng học tập, biển báo giao thông, đồ chơi an toàn.',
      },
      {
        week: '35',
        lessonName: 'Kiểm tra học kì 2 (1 tiết)',
        subLessonName: 'Tiết 35: Đánh giá định kì cuối năm học môn Công nghệ 3',
        periodAllocation: 'Tiết 35 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá kết quả học tập cuối năm học theo chuẩn yêu cầu cần đạt Chương trình GDPT 2018 (Thông tư 27/2020/TT-BGDĐT).',
      },
    ],
  }),
];

// ============================================================================
// 1.4.6. MÔN CÔNG NGHỆ – LỚP 4
// Tổng số tiết cả năm học: 35 tiết (35 tuần, 1 tiết/tuần)
// - Học kì I: 18 tuần x 1 tiết/tuần = 18 tiết
// - Học kì II: 17 tuần x 1 tiết/tuần = 17 tiết
// ============================================================================
export const GRADE4_CONG_NGHE_TOPICS: CurriculumTopic[] = [
  buildPrimaryCongNgheTopic({
    id: 'cur-nda-g4-cn-hk1-p1',
    grade: 4,
    subject: 'Công nghệ',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'CN4-P1',
    chapterTitle: 'Phần 1: Công nghệ và đời sống (Trồng hoa, cây cảnh trong chậu)',
    topicTitle:
      'Bài 1: Lợi ích của hoa, cây cảnh đối với đời sống (3 tiết); Bài 2: Một số loại hoa, cây cảnh phổ biến (3 tiết); Bài 3: Vật liệu và dụng cụ trồng hoa, cây cảnh trong chậu (3 tiết); Bài 4: Gieo hạt hoa, cây cảnh trong chậu (3 tiết); Bài 5: Trồng hoa, cây cảnh trong chậu (3 tiết); Bài 6: Chăm sóc hoa, cây cảnh trong chậu (Tiết 16, 1 tiết); Ôn tập cuối kỳ 1 (1 tiết); Kiểm tra cuối kì 1 (1 tiết)',
    adjustedContentSummary:
      'Tìm hiểu lợi ích, nhận diện các loại hoa, cây cảnh phổ biến; chuẩn bị vật liệu, dụng cụ và thực hành gieo hạt, trồng, chăm sóc hoa, cây cảnh trong chậu; Bài học STEM Chậu cây thân thiện với môi trường; Tích hợp NLS (1.1.CB2b, 1.3.CB2b, 5.2.CB2b, 3.4.CB2a, 4.1.CB2c) và AI (4.A1.1, 4.A1.2).',
    rawLessons: [
      {
        week: '1 – 3',
        lessonName: 'Bài 1: Lợi ích của hoa, cây cảnh đối với đời sống (3 tiết)',
        subLessonName: 'Tiết 1 – Tiết 3: Vai trò, lợi ích của hoa và cây cảnh trong làm đẹp cảnh quan và làm sạch không khí',
        periodAllocation: 'Tiết 1 – 3 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp Năng lực số 1.1.CB2b: Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số (Tìm kiếm lợi ích, vai trò của cây cảnh).\n- Tích hợp AI 4.A1.1: Học sinh nhận biết được AI có thể hỗ trợ con người trong nông nghiệp (trồng hoa, cây cảnh) như phát hiện sâu bệnh, theo dõi thời tiết để cây phát triển tốt hơn.',
      },
      {
        week: '4 – 6',
        lessonName: 'Bài 2: Một số loại hoa, cây cảnh phổ biến (3 tiết)',
        subLessonName: 'Tiết 4 – Tiết 6: Nhận biết đặc điểm một số loại hoa và cây cảnh phổ biến theo mùa',
        periodAllocation: 'Tiết 4 – 6 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 1.3.CB2b: Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc (Phân loại, tổ chức thông tin về các loại cây).',
      },
      {
        week: '7 – 9',
        lessonName: 'Bài 3: Vật liệu và dụng cụ trồng hoa, cây cảnh trong chậu (3 tiết)',
        subLessonName: 'Tiết 7 – Tiết 9: Bài học STEM – Bài 4: Chậu cây thân thiện với môi trường',
        periodAllocation: 'Tiết 7 – 9 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          '- Bài học STEM: Bài 4: Chậu cây thân thiện với môi trường.\n- Tích hợp Năng lực số 5.2.CB2b: Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó (Tìm hiểu, lựa chọn vật liệu/dụng cụ).',
      },
      {
        week: '10 – 12',
        lessonName: 'Bài 4: Gieo hạt hoa, cây cảnh trong chậu (3 tiết)',
        subLessonName: 'Tiết 10 – Tiết 12: Quy trình kỹ thuật và thực hành gieo hạt hoa, cây cảnh trong chậu',
        periodAllocation: 'Tiết 10 – 12 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản (Áp dụng cho việc tuân thủ quy trình gieo hạt).',
      },
      {
        week: '13 – 15',
        lessonName: 'Bài 5: Trồng hoa, cây cảnh trong chậu (3 tiết)',
        subLessonName: 'Tiết 13 – Tiết 15: Các bước trồng cây con vào chậu và thực hành an toàn',
        periodAllocation: 'Tiết 13 – 15 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản (Áp dụng cho việc tuân thủ quy trình trồng cây).',
      },
      {
        week: '16',
        lessonName: 'Bài 6: Chăm sóc hoa, cây cảnh trong chậu (Tiết 16 – Phần 1 HKI: 1 tiết)',
        subLessonName: 'Tiết 16: Các công việc chăm sóc hoa, cây cảnh (tưới nước, bón phân, bắt sâu)',
        periodAllocation: 'Tiết 16 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp Năng lực số 4.1.CB2c: Tuân theo được các biện pháp an toàn và bảo mật đơn giản (Sử dụng dụng cụ an toàn, bảo quản).\n- Tích hợp AI 4.A1.2: Hiểu được hệ thống AI (cảm biến đất) có thể nhắc nhở thời gian tưới nước hoặc đo độ ẩm, nhưng con người vẫn là người trực tiếp ra quyết định chăm sóc và tưới cây.',
      },
      {
        week: '17',
        lessonName: 'Ôn tập cuối kỳ 1 (1 tiết)',
        subLessonName: 'Tiết 17: Hệ thống hóa kiến thức Phần 1 – Công nghệ và đời sống',
        periodAllocation: 'Tiết 17 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Ôn tập quy trình chuẩn bị giá thể, chậu trồng, gieo hạt và trồng hoa, cây cảnh trong chậu.',
      },
      {
        week: '18',
        lessonName: 'Kiểm tra cuối kì 1 (1 tiết)',
        subLessonName: 'Tiết 18: Đánh giá định kì cuối Học kì I môn Công nghệ 4',
        periodAllocation: 'Tiết 18 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá kết quả học tập Học kì I theo chuẩn yêu cầu cần đạt Chương trình GDPT 2018 (Thông tư 27/2020/TT-BGDĐT).',
      },
    ],
  }),

  buildPrimaryCongNgheTopic({
    id: 'cur-nda-g4-cn-hk2-p2',
    grade: 4,
    subject: 'Công nghệ',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'CN4-P2',
    chapterTitle: 'Phần 2: Thủ công kĩ thuật (Lắp ghép mô hình & Làm đồ chơi dân gian)',
    topicTitle:
      'Bài 6: Chăm sóc hoa, cây cảnh trong chậu (Tiết 19 – 20, 2 tiết); Bài 7: Giới thiệu bộ lắp ghép mô hình kĩ thuật (2 tiết); Bài 8: Lắp ghép mô hình bập bênh (2 tiết); Bài 9: Lắp ghép mô hình robot (3 tiết); Bài 10: Đồ chơi dân gian (2 tiết); Bài 11: Làm đèn lồng (2 tiết); Bài 12: Làm chuồn chuồn thăng bằng (2 tiết); Ôn tập cuối học kì 2 (1 tiết); Kiểm tra cuối học kì 2 (1 tiết)',
    adjustedContentSummary:
      'Hoàn thiện chăm sóc hoa, cây cảnh; sử dụng bộ lắp ghép mô hình kĩ thuật để lắp mô hình bập bênh, mô hình robot (Bài học STEM Lắp ghép rô-bốt); làm đồ chơi dân gian (đèn lồng, chuồn chuồn thăng bằng); Tích hợp NLS (4.1.CB2c, 3.4.CB2a, 3.1.CB2a) và AI (4.A1.2, 4.A2.1).',
    rawLessons: [
      {
        week: '19 – 20',
        lessonName: 'Bài 6: Chăm sóc hoa, cây cảnh trong chậu (Tiết 19 – 20: 2 tiết)',
        subLessonName: 'Tiết 19 – Tiết 20: Thực hành chăm sóc hoa, cây cảnh trong chậu',
        periodAllocation: 'Tiết 19 – 20 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp Năng lực số 4.1.CB2c: Tuân theo được các biện pháp an toàn và bảo mật đơn giản (Sử dụng dụng cụ an toàn, bảo quản).\n- Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản (Tuân thủ các bước chăm sóc).\n- Tích hợp AI 4.A1.2: Hiểu được hệ thống AI (cảm biến đất) có thể nhắc nhở thời gian tưới nước hoặc đo độ ẩm, nhưng con người vẫn là người trực tiếp ra quyết định chăm sóc và tưới cây.',
      },
      {
        week: '21 – 22',
        lessonName: 'Bài 7: Giới thiệu bộ lắp ghép mô hình kĩ thuật (2 tiết)',
        subLessonName: 'Tiết 21 – Tiết 22: Nhận biết các chi tiết, dụng cụ của bộ lắp ghép và cách ghép nối mối ghép',
        periodAllocation: 'Tiết 21 – 22 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Nhận diện tên gọi, công dụng các nhóm chi tiết và sử dụng cờ-lê, tua-vít để lắp, tháo vít đúng kĩ thuật, an toàn.',
      },
      {
        week: '23 – 24',
        lessonName: 'Bài 8: Lắp ghép mô hình bập bênh (2 tiết)',
        subLessonName: 'Tiết 23 – Tiết 24: Thực hành lắp ghép và kiểm tra hoạt động mô hình bập bênh',
        periodAllocation: 'Tiết 23 – 24 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản (Tuân thủ các bước lắp ghép).',
      },
      {
        week: '25 – 27',
        lessonName: 'Bài 9: Lắp ghép mô hình robot (3 tiết)',
        subLessonName: 'Tiết 25 – Tiết 27: Bài học STEM – Bài 11: Lắp ghép rô - bốt',
        periodAllocation: 'Tiết 25 – 27 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          '- Bài học STEM: Bài 11: Lắp ghép rô - bốt.\n- Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản (Tuân thủ các bước lắp ghép theo sơ đồ).\n- Tích hợp AI 4.A2.1: Hiểu được robot tích hợp AI được tạo ra để phục vụ đời sống xã hội và giúp đỡ con người làm việc tiết kiệm thời gian hơn.',
      },
      {
        week: '28 – 29',
        lessonName: 'Bài 10: Đồ chơi dân gian (2 tiết)',
        subLessonName: 'Tiết 28 – Tiết 29: Nhận biết và sử dụng một số đồ chơi dân gian truyền thống',
        periodAllocation: 'Tiết 28 – 29 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản (Áp dụng cho việc thiết kế/làm đồ chơi thủ công).',
      },
      {
        week: '30 – 31',
        lessonName: 'Bài 11: Làm đèn lồng (2 tiết)',
        subLessonName: 'Tiết 30 – Tiết 31: Thực hành làm đèn lồng thủ công trang trí',
        periodAllocation: 'Tiết 30 – 31 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản (Tạo ra sản phẩm thủ công, có thể coi là nội dung sáng tạo vật lý).',
      },
      {
        week: '32 – 33',
        lessonName: 'Bài 12: Làm chuồn chuồn thăng bằng (2 tiết)',
        subLessonName: 'Tiết 32 – Tiết 33: Thực hành làm mô hình chuồn chuồn thăng bằng',
        periodAllocation: 'Tiết 32 – 33 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản (Tạo ra sản phẩm thủ công, có thể coi là nội dung sáng tạo vật lý).',
      },
      {
        week: '34',
        lessonName: 'Ôn tập cuối học kì 2 (1 tiết)',
        subLessonName: 'Tiết 34: Tổng kết, trưng bày sản phẩm lắp ghép mô hình và đồ chơi dân gian',
        periodAllocation: 'Tiết 34 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Hệ thống hóa kiến thức, kĩ năng lắp ghép mô hình kĩ thuật và làm đồ chơi dân gian.',
      },
      {
        week: '35',
        lessonName: 'Kiểm tra cuối học kì 2 (1 tiết)',
        subLessonName: 'Tiết 35: Đánh giá định kì cuối năm học môn Công nghệ 4',
        periodAllocation: 'Tiết 35 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá kết quả học tập cuối năm học theo chuẩn yêu cầu cần đạt Chương trình GDPT 2018 (Thông tư 27/2020/TT-BGDĐT).',
      },
    ],
  }),
];

// ============================================================================
// 1.4.7. MÔN CÔNG NGHỆ – LỚP 5
// Tổng số tiết cả năm học: 35 tiết (35 tuần, 1 tiết/tuần)
// - Học kì I: 18 tuần x 1 tiết/tuần = 18 tiết
// - Học kì II: 17 tuần x 1 tiết/tuần = 17 tiết
// ============================================================================
export const GRADE5_CONG_NGHE_TOPICS: CurriculumTopic[] = [
  buildPrimaryCongNgheTopic({
    id: 'cur-nda-g5-cn-hk1-p1',
    grade: 5,
    subject: 'Công nghệ',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'CN5-P1',
    chapterTitle: 'Phần 1: Công nghệ và đời sống (Vai trò công nghệ, Thiết kế sản phẩm & Sử dụng điện thoại)',
    topicTitle:
      'Bài 1. Vai trò của công nghệ (2 tiết); Bài 2. Nhà sáng chế (4 tiết); Bài 3. Tìm hiểu thiết kế (2 tiết); Bài 4. Thiết kế sản phẩm (4 tiết); Bài 5. Sử dụng điện thoại (4 tiết); Ôn tập cuối kì 1 (1 tiết); Kiểm tra cuối kì 1 (1 tiết)',
    adjustedContentSummary:
      'Nhận biết vai trò của công nghệ, các sáng chế lịch sử, quy trình thiết kế sản phẩm (Bài học STEM Máy đánh trứng cầm tay) và sử dụng điện thoại an toàn, lịch sự; Tích hợp NLS (5.3.CB2a, 5.3.CB2b, 5.2.CB2a, 3.1.CB2a, 4.2.CB2a) và AI (5.A2.2, 5.A2.1, 5.A3.1).',
    rawLessons: [
      {
        week: '1 – 2',
        lessonName: 'Bài 1. Vai trò của công nghệ (2 tiết)',
        subLessonName: 'Tiết 1 – Tiết 2: Vai trò của sản phẩm công nghệ và mặt trái khi lạm dụng công nghệ',
        periodAllocation: 'Tiết 1 – 2 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp Năng lực số 5.3.CB2a: Nhận ra được một số công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm.\n- Tích hợp AI 5.A2.2: Nhận biết AI là một công nghệ tiên tiến mang lại nhiều lợi ích cho xã hội (y tế, giáo dục), đồng thời cũng cần sử dụng đúng cách để tránh sự phụ thuộc.',
      },
      {
        week: '3 – 6',
        lessonName: 'Bài 2. Nhà sáng chế (4 tiết)',
        subLessonName: 'Tiết 3 – Tiết 6: Các sáng chế tiêu biểu trong lịch sử và phẩm chất của nhà sáng chế',
        periodAllocation: 'Tiết 3 – 6 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp Năng lực số 5.3.CB2b: Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số.\n- Tích hợp AI 5.A2.1: HS hiểu rằng dù AI rất thông minh nhưng AI cũng là một "sáng chế". AI không có sự sáng tạo độc lập và cảm xúc nhân văn như các nhà sáng chế con người.',
      },
      {
        week: '7 – 8',
        lessonName: 'Bài 3. Tìm hiểu thiết kế (2 tiết)',
        subLessonName: 'Tiết 7 – Tiết 8: Vai trò của thiết kế và các công việc chính trong thiết kế sản phẩm',
        periodAllocation: 'Tiết 7 – 8 (2 tiết)',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Năng lực số 5.2.CB2a: Xác định được nhu cầu cá nhân đối với việc cải tiến, thiết kế sản phẩm phục vụ đời sống.',
      },
      {
        week: '9 – 12',
        lessonName: 'Bài 4. Thiết kế sản phẩm (4 tiết)',
        subLessonName: 'Tiết 9 – Tiết 12: Bài học STEM – Bài 4: Máy đánh trứng cầm tay',
        periodAllocation: 'Tiết 9 – 12 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          '- Bài học STEM: Bài 4: Máy đánh trứng cầm tay.\n- Tích hợp Năng lực số 3.1.CB2a: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.',
      },
      {
        week: '13 – 16',
        lessonName: 'Bài 5. Sử dụng điện thoại (4 tiết)',
        subLessonName: 'Tiết 13 – Tiết 16: Chức năng cơ bản, các số điện thoại khẩn cấp và sử dụng điện thoại an toàn, văn minh',
        periodAllocation: 'Tiết 13 – 16 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp Năng lực số 4.2.CB2a: Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.\n- Tích hợp AI 5.A3.1: Nhận biết các tính năng AI trên điện thoại (nhận diện khuôn mặt, trợ lí ảo) và có ý thức không chia sẻ thông tin cá nhân bảo mật cho AI.',
      },
      {
        week: '17',
        lessonName: 'Ôn tập cuối kì 1 (1 tiết)',
        subLessonName: 'Tiết 17: Hệ thống hóa kiến thức Phần 1 – Công nghệ và đời sống',
        periodAllocation: 'Tiết 17 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Ôn tập vai trò của công nghệ, quy trình thiết kế sản phẩm và nguyên tắc sử dụng điện thoại an toàn, bảo mật.',
      },
      {
        week: '18',
        lessonName: 'Kiểm tra cuối kì 1 (1 tiết)',
        subLessonName: 'Tiết 18: Đánh giá định kì cuối Học kì I môn Công nghệ 5',
        periodAllocation: 'Tiết 18 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá kết quả học tập Học kì I theo chuẩn yêu cầu cần đạt Chương trình GDPT 2018 (Thông tư 27/2020/TT-BGDĐT).',
      },
    ],
  }),

  buildPrimaryCongNgheTopic({
    id: 'cur-nda-g5-cn-hk2-p2',
    grade: 5,
    subject: 'Công nghệ',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'CN5-P2',
    chapterTitle: 'Phần II: Thủ công kĩ thuật (Sử dụng tủ lạnh & Lắp ráp mô hình năng lượng xanh)',
    topicTitle:
      'Bài 6. Sử dụng tủ lạnh (3 tiết); Bài 7. Lắp ráp mô hình xe điện chạy bằng pin (4 tiết); Bài 8. Mô hình máy phát điện gió (4 tiết); Bài 9. Mô hình điện mặt trời (4 tiết); Ôn tập cuối học kì 2 (1 tiết); Kiểm tra cuối học kì 2 (1 tiết)',
    adjustedContentSummary:
      'Sử dụng tủ lạnh đúng cách, tiết kiệm điện; lắp ráp và vận hành thử nghiệm mô hình xe điện chạy bằng pin, mô hình máy phát điện gió, mô hình điện mặt trời; Tích hợp NLS (4.1.CB2a, 3.4.CB2a) và AI (5.A1.1).',
    rawLessons: [
      {
        week: '19 – 21',
        lessonName: 'Bài 6. Sử dụng tủ lạnh (3 tiết)',
        subLessonName: 'Tiết 19 – Tiết 21: Tác dụng, cách sắp xếp thực phẩm và sử dụng tủ lạnh an toàn, tiết kiệm điện',
        periodAllocation: 'Tiết 19 – 21 (3 tiết)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 4.1.CB2a: Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản.',
      },
      {
        week: '22 – 25',
        lessonName: 'Bài 7. Lắp ráp mô hình xe điện chạy bằng pin (4 tiết)',
        subLessonName: 'Tiết 22 – Tiết 25: Tìm hiểu cấu tạo, lắp ráp và chạy thử mô hình xe điện chạy bằng pin',
        periodAllocation: 'Tiết 22 – 25 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.\n- Tích hợp AI 5.A1.1: Mở rộng hiểu biết từ xe điện đồ chơi sang xe ô tô điện tự lái (có tích hợp AI). Giáo dục đạo đức: Nếu xe tự lái mắc lỗi, kĩ sư hoặc con người phải chịu trách nhiệm.',
      },
      {
        week: '26 – 29',
        lessonName: 'Bài 8. Mô hình máy phát điện gió (4 tiết)',
        subLessonName: 'Tiết 26 – Tiết 29: Nguyên lí tạo ra điện từ gió và thực hành lắp ráp mô hình máy phát điện gió',
        periodAllocation: 'Tiết 26 – 29 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản; giáo dục tiết kiệm năng lượng & BVMT.',
      },
      {
        week: '30 – 33',
        lessonName: 'Bài 9. Mô hình điện mặt trời (4 tiết)',
        subLessonName: 'Tiết 30 – Tiết 33: Tìm hiểu pin mặt trời và thực hành lắp ráp mô hình điện mặt trời',
        periodAllocation: 'Tiết 30 – 33 (4 tiết)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Năng lực số 3.4.CB2a: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản; giáo dục năng lượng tái tạo & BVMT.',
      },
      {
        week: '34',
        lessonName: 'Ôn tập cuối học kì 2 (1 tiết)',
        subLessonName: 'Tiết 34: Tổng kết, trưng bày các mô hình kĩ thuật năng lượng sạch',
        periodAllocation: 'Tiết 34 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Hệ thống hóa kiến thức sử dụng tủ lạnh và quy trình lắp ráp các mô hình xe điện, máy phát điện gió, điện mặt trời.',
      },
      {
        week: '35',
        lessonName: 'Kiểm tra cuối học kì 2 (1 tiết)',
        subLessonName: 'Tiết 35: Đánh giá định kì cuối năm học môn Công nghệ 5',
        periodAllocation: 'Tiết 35 (1 tiết)',
        periodsCount: 1,
        adjustedContent:
          'Đánh giá kết quả học tập cuối năm học theo chuẩn yêu cầu cần đạt Chương trình GDPT 2018 (Thông tư 27/2020/TT-BGDĐT).',
      },
    ],
  }),
];

// ============================================================================
// 2. CHUYÊN ĐỀ LỰA CHỌN / CHUYÊN ĐỀ STEM TỔ KHTN (CẤP THCS - LỚP 6, 7, 8, 9)
// (Trích từ Phụ lục I – Tổ KHTN năm học 2026 – 2027, trang 368 – 370)
// ============================================================================
export const KHTN_STEM_SELECTED_TOPICS_2026: CurriculumTopic[] = [
  {
    id: 'cur-nda-thcs-toan7-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 7,
    subject: 'Toán',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề STEM (2 tiết)',
    totalPeriods: 2,
    durationText: '2 tiết',
    chapterCode: 'STEM-TOAN7-02',
    chapterTitle: 'Chuyên đề lựa chọn / Bài học STEM Toán 7',
    topicTitle: 'Chuyên đề STEM: Hộp quà và chân đế lịch để bàn của em (Toán 7)',
    adjustedContentSummary:
      'Vận dụng các kiến thức đã học về một số hình khối trong thực tiễn (hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác, tứ giác) vào giải quyết tình huống thực tiễn như mĩ thuật, thủ công.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-toan7-stem-1-ls1',
        week: 'Chuyên đề',
        lessonName: 'Chuyên đề STEM: Hộp quà và chân đế lịch để bàn của em (Toán 7)',
        subLessonName: 'Thiết kế, tính diện tích xung quanh và chế tạo hộp quà, chân đế lịch để bàn',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Vận dụng các kiến thức đã học về một số hình khối trong thực tiễn vào giải quyết một số tình huống trong thực tiễn như mĩ thuật, thủ công...',
        integrationTags: ['STEM', 'KNS'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-TOAN7-02.1',
        description:
          'Vận dụng các kiến thức đã học về một số hình khối trong thực tiễn vào giải quyết một số tình huống trong thực tiễn như mĩ thuật, thủ công (thiết kế hộp quà và chân đế lịch để bàn).',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName: 'Chuyên đề STEM: Hộp quà và chân đế lịch để bàn của em (Toán 7)',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-toan8-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 8,
    subject: 'Toán',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề STEM (2 tiết)',
    totalPeriods: 2,
    durationText: '2 tiết',
    chapterCode: 'STEM-TOAN8-03',
    chapterTitle: 'Chuyên đề lựa chọn / Bài học STEM Toán 8',
    topicTitle:
      'Chuyên đề STEM: Ứng dụng định lí Thales, định lí Pythagore và tam giác đồng dạng để đo chiều cao, khoảng cách',
    adjustedContentSummary:
      'Lựa chọn phương pháp đo phù hợp; vận dụng định lí Thalès, định lí Pythagore hoặc tam giác đồng dạng để tính chiều cao, khoảng cách; thực hiện phép đo, tính toán, đánh giá sai số và giải thích kết quả trong thực tiễn.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-toan8-stem-1-ls1',
        week: 'Chuyên đề',
        lessonName:
          'Chuyên đề STEM: Ứng dụng định lí Thales, định lí Pythagore và tam giác đồng dạng để đo chiều cao, khoảng cách',
        subLessonName: 'Thực hành đo đạc thực địa, tính toán và đánh giá sai số',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Lựa chọn được phương pháp đo phù hợp.\n- Vận dụng định lí Thalès, định lí Pythagore hoặc tam giác đồng dạng để tính chiều cao, khoảng cách.\n- Thực hiện phép đo, tính toán và đánh giá sai số.\n- Giải thích kết quả trong bối cảnh thực tiễn.',
        integrationTags: ['STEM', 'KNS'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-TOAN8-03.1',
        description:
          'Lựa chọn được phương pháp đo phù hợp; vận dụng định lí Thalès, định lí Pythagore hoặc tam giác đồng dạng để tính chiều cao, khoảng cách; thực hiện phép đo, tính toán, đánh giá sai số và giải thích kết quả trong bối cảnh thực tiễn.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG_CAO,
        lessonName:
          'Chuyên đề STEM: Ứng dụng định lí Thales, định lí Pythagore và tam giác đồng dạng để đo chiều cao, khoảng cách',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-toan9-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 9,
    subject: 'Toán',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề STEM (2 tiết)',
    totalPeriods: 2,
    durationText: '2 tiết',
    chapterCode: 'STEM-TOAN9-04',
    chapterTitle: 'Chuyên đề lựa chọn / Bài học STEM Toán 9',
    topicTitle: 'Chuyên đề STEM: Tính chiều cao và xác định khoảng cách (Toán 9)',
    adjustedContentSummary:
      'Vận dụng tỉ số lượng giác của góc nhọn để tính chiều cao, đo khoảng cách giữa hai vị trí mà ở giữa chúng có vật cản hoặc chỉ đến được một trong hai vị trí.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-toan9-stem-1-ls1',
        week: 'Chuyên đề',
        lessonName: 'Chuyên đề STEM: Tính chiều cao và xác định khoảng cách (Toán 9)',
        subLessonName: 'Chế tạo giác kế đơn giản và đo chiều cao, khoảng cách có vật cản',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tính chiều cao, đo khoảng cách giữa hai vị trí mà ở giữa chúng có vật cản hoặc chỉ đến được một trong hai vị trí.',
        integrationTags: ['STEM', 'KNS'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-TOAN9-04.1',
        description:
          'Tính chiều cao, đo khoảng cách giữa hai vị trí mà ở giữa chúng có vật cản hoặc chỉ đến được một trong hai vị trí bằng tỉ số lượng giác.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName: 'Chuyên đề STEM: Tính chiều cao và xác định khoảng cách (Toán 9)',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-tin6-cd-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 6,
    subject: 'Tin học',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề lựa chọn (2 tiết)',
    totalPeriods: 2,
    durationText: '2 tiết',
    chapterCode: 'CĐ-TIN6-05',
    chapterTitle: 'Chuyên đề lựa chọn Tin học 6',
    topicTitle: 'Nhà báo nhỏ tuổi (Tin học lớp 6)',
    adjustedContentSummary:
      'Biết cách sử dụng các trình duyệt tìm kiếm thông tin trên Internet; cập nhật các thông tin mới nhất, nhanh nhất và an toàn trên mạng Internet.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-tin6-cd-1-ls1',
        week: 'Chuyên đề',
        lessonName: 'Nhà báo nhỏ tuổi (Tin học lớp 6)',
        subLessonName: 'Thực hành tìm kiếm và khai thác thông tin bằng trình duyệt web',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Biết cách sử dụng các trình duyệt tìm kiếm thông tin trên Internet.\n- Cập nhật các thông tin mới nhất nhanh nhất trên mạng Internet.',
        integrationTags: ['NLS', 'KNS'],
      },
    ],
    learningOutcomes: [
      {
        code: 'CĐ-TIN6-05.1',
        description:
          'Biết cách sử dụng các trình duyệt tìm kiếm thông tin trên Internet; cập nhật các thông tin mới nhất, nhanh nhất trên mạng Internet.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName: 'Nhà báo nhỏ tuổi (Tin học lớp 6)',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-tin8-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 8,
    subject: 'Tin học',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề STEM (2 tiết)',
    totalPeriods: 2,
    durationText: '2 tiết',
    chapterCode: 'STEM-TIN8-06',
    chapterTitle: 'Chuyên đề lựa chọn / Bài học STEM Tin học 8',
    topicTitle:
      'Chuyên đề STEM: Làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản (Tin học lớp 8)',
    adjustedContentSummary:
      'Thực hiện thành thạo các thao tác chèn thêm, xoá bỏ, co dãn hình ảnh, vẽ hình đồ hoạ trong văn bản và tạo danh sách dạng liệt kê phục vụ trình bày ấn phẩm số.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-tin8-stem-1-ls1',
        week: 'Chuyên đề',
        lessonName:
          'Chuyên đề STEM: Làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản (Tin học lớp 8)',
        subLessonName: 'Thiết kế văn bản minh họa có danh sách liệt kê và hình đồ họa',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Thực hiện được các thao tác: chèn thêm, xoá bỏ, co dãn hình ảnh, vẽ hình đồ hoạ trong văn bản, tạo danh sách dạng liệt kê.',
        integrationTags: ['STEM', 'NLS'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-TIN8-06.1',
        description:
          'Thực hiện được các thao tác: chèn thêm, xoá bỏ, co dãn hình ảnh, vẽ hình đồ hoạ trong văn bản, tạo danh sách dạng liệt kê.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName:
          'Chuyên đề STEM: Làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản (Tin học lớp 8)',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-tin9-cd-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 9,
    subject: 'Tin học',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề lựa chọn (2 tiết)',
    totalPeriods: 2,
    durationText: '2 tiết',
    chapterCode: 'CĐ-TIN9-07',
    chapterTitle: 'Chuyên đề lựa chọn Tin học 9',
    topicTitle:
      'Thực hành sử dụng công cụ trực quan trình bày thông tin trong trao đổi và hợp tác (Tin học lớp 9)',
    adjustedContentSummary:
      'Sử dụng hợp lý hình ảnh, biểu đồ, video; tạo sơ đồ tư duy và bài trình chiếu có đính kèm văn bản, hình ảnh, biểu đồ, video và trang tính phục vụ trao đổi, hợp tác.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-tin9-cd-1-ls1',
        week: 'Chuyên đề',
        lessonName:
          'Thực hành sử dụng công cụ trực quan trình bày thông tin trong trao đổi và hợp tác (Tin học lớp 9)',
        subLessonName: 'Xây dựng sơ đồ tư duy và bài trình chiếu đa phương tiện',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Sử dụng được hình ảnh, biểu đồ, video một cách hợp lý.\n- Tạo được sơ đồ tư duy có đính kèm văn bản, hình ảnh, video và trang tính.\n- Tạo được bài trình chiếu có sử dụng hình ảnh, biểu đồ và video hợp lý.',
        integrationTags: ['NLS', 'KNS'],
      },
    ],
    learningOutcomes: [
      {
        code: 'CĐ-TIN9-07.1',
        description:
          'Sử dụng được hình ảnh, biểu đồ, video hợp lý; tạo được sơ đồ tư duy và bài trình chiếu có đính kèm văn bản, hình ảnh, biểu đồ, video và trang tính.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName:
          'Thực hành sử dụng công cụ trực quan trình bày thông tin trong trao đổi và hợp tác (Tin học lớp 9)',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-khtn6-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 6,
    subject: 'Khoa học tự nhiên',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề lựa chọn & STEM (5 tiết)',
    totalPeriods: 5,
    durationText: '5 tiết (2 chuyên đề)',
    chapterCode: 'STEM-KHTN6-08',
    chapterTitle: 'Chuyên đề thực hành & Bài học STEM Khoa học tự nhiên 6',
    topicTitle:
      'Tìm hiểu sinh vật ngoài thiên nhiên (3 tiết); STEM: Quy trình sản xuất sữa chua chuẩn vị (2 tiết)',
    adjustedContentSummary:
      'Thực hiện các phương pháp tìm hiểu sinh vật ngoài thiên nhiên, sử dụng khoá lưỡng phân, làm bộ sưu tập và báo cáo; Thực hành quan sát vi khuẩn dưới kính hiển vi quang học và thực hiện quy trình làm sữa chua chuẩn vị.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-khtn6-stem-1-ls1',
        week: 'Chuyên đề 8',
        lessonName: 'Tìm hiểu sinh vật ngoài thiên nhiên (KHTN lớp 6) (3 tiết)',
        subLessonName: 'Quan sát, phân loại sinh vật bằng khóa lưỡng phân và làm bộ sưu tập ảnh',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Thực hiện được một số phương pháp tìm hiểu sinh vật ngoài thiên nhiên: quan sát bằng mắt thường, kính lúp; ghi chép, đo đếm, nhận xét và rút ra kết luận.\n- Nhận biết được vai trò của sinh vật trong tự nhiên.\n- Sử dụng được khoá lưỡng phân để phân loại một số nhóm sinh vật.\n- Quan sát và phân biệt được một số nhóm thực vật, động vật ngoài thiên nhiên. Chụp ảnh, làm được bộ sưu tập ảnh về các nhóm sinh vật.\n- Làm và trình bày được báo cáo đơn giản về kết quả tìm hiểu sinh vật ngoài thiên nhiên.',
        integrationTags: ['BVMT', 'KNS'],
      },
      {
        id: 'cur-nda-thcs-khtn6-stem-1-ls2',
        week: 'Chuyên đề 9',
        lessonName: 'STEM: Quy trình sản xuất sữa chua chuẩn vị (KHTN lớp 6) (2 tiết)',
        subLessonName: 'Quan sát vi khuẩn lên men lactic và thực hành làm sữa chua',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Thực hành quan sát và vẽ được hình vi khuẩn quan sát được dưới kính hiển vi quang học.\n- Biết cách làm sữa chua.',
        integrationTags: ['STEM', 'GDSK'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-KHTN6-08.1',
        description:
          'Tìm hiểu sinh vật ngoài thiên nhiên (3 tiết): Thực hiện phương pháp quan sát, sử dụng khoá lưỡng phân phân loại sinh vật, làm bộ sưu tập ảnh và trình bày báo cáo kết quả tìm hiểu sinh vật ngoài thiên nhiên.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName: 'Tìm hiểu sinh vật ngoài thiên nhiên (KHTN lớp 6) (3 tiết)',
        duration: '3 tiết',
      },
      {
        code: 'STEM-KHTN6-09.1',
        description:
          'STEM: Quy trình sản xuất sữa chua chuẩn vị (2 tiết): Thực hành quan sát và vẽ được hình vi khuẩn dưới kính hiển vi quang học; biết cách làm sữa chua.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName: 'STEM: Quy trình sản xuất sữa chua chuẩn vị (KHTN lớp 6) (2 tiết)',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-khtn8-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 8,
    subject: 'Khoa học tự nhiên',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề STEM (2 tiết)',
    totalPeriods: 2,
    durationText: '2 tiết',
    chapterCode: 'STEM-KHTN8-10',
    chapterTitle: 'Chuyên đề lựa chọn / Bài học STEM Khoa học tự nhiên 8',
    topicTitle:
      'STEM: Chế tạo giấy chỉ thị màu nhận biết acid-base từ bắp cải tím (KHTN lớp 8)',
    adjustedContentSummary:
      'Tra bảng tính tan xác định kiềm/base không tan; nêu thang pH và tiến hành thí nghiệm đo pH bằng giấy chỉ thị chế tạo từ bắp cải tím trên thực phẩm; liên hệ pH trong dạ dày, máu, nước mưa, đất.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-khtn8-stem-1-ls1',
        week: 'Chuyên đề 10',
        lessonName:
          'STEM: Chế tạo giấy chỉ thị màu nhận biết acid-base từ bắp cải tím (KHTN lớp 8)',
        subLessonName: 'Chế tạo giấy chỉ thị màu tự nhiên và đo pH các dung dịch thực phẩm',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tra được bảng tính tan để biết một hydroxide cụ thể thuộc loại kiềm hay base không tan.\n- Nêu được thang pH, sử dụng pH để đánh giá độ acid-base của dung dịch.\n- Tiến hành được một số thí nghiệm đo pH (bằng giấy pH) một số loại thực phẩm (đồ uống, hoa quả...).\n- Liên hệ được pH trong dạ dày, trong máu, trong mưa, đất.',
        integrationTags: ['STEM', 'GDSK', 'BVMT'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-KHTN8-10.1',
        description:
          'Tra được bảng tính tan; nêu được thang pH; tiến hành thí nghiệm chế tạo giấy chỉ thị màu từ bắp cải tím để đo pH một số thực phẩm và liên hệ pH trong dạ dày, máu, mưa, đất.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName:
          'STEM: Chế tạo giấy chỉ thị màu nhận biết acid-base từ bắp cải tím (KHTN lớp 8)',
        duration: '2 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-khtn9-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 9,
    subject: 'Khoa học tự nhiên',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề STEM (3 tiết)',
    totalPeriods: 3,
    durationText: '3 tiết',
    chapterCode: 'STEM-KHTN9-11',
    chapterTitle: 'Chuyên đề lựa chọn / Bài học STEM Khoa học tự nhiên 9',
    topicTitle:
      'STEM: Chế tạo mô hình chong chóng phát điện từ gió gắn với Bài 17: Một số dạng năng lượng tái tạo (KHTN lớp 9)',
    adjustedContentSummary:
      'Nêu ưu, nhược điểm của các dạng năng lượng tái tạo; thảo luận biện pháp sử dụng hiệu quả năng lượng và bảo vệ môi trường; đề xuất ý tưởng, lập kế hoạch và chế tạo thử nghiệm mô hình chong chóng phát điện từ gió.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-khtn9-stem-1-ls1',
        week: 'Chuyên đề 11',
        lessonName:
          'STEM: Chế tạo mô hình chong chóng phát điện từ gió gắn với Bài 17: Một số dạng năng lượng tái tạo (KHTN lớp 9)',
        subLessonName: 'Thiết kế, chế tạo và thử nghiệm mô hình chong chóng phát điện từ gió',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Nêu được sơ lược ưu điểm và nhược điểm của một số dạng năng lượng tái tạo (năng lượng mặt trời, năng lượng từ gió, năng lượng từ sóng biển, năng lượng từ dòng sông).\n- Thảo luận để nêu được một số biện pháp sử dụng hiệu quả năng lượng và bảo vệ môi trường.\n- Đề xuất được các ý tưởng và lập kế hoạch thiết kế sản phẩm.\n- Thiết kế, chế tạo thử nghiệm được sản phẩm.',
        integrationTags: ['STEM', 'BVMT'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-KHTN9-11.1',
        description:
          'Nêu được ưu, nhược điểm của các dạng năng lượng tái tạo; đề xuất biện pháp tiết kiệm năng lượng, bảo vệ môi trường; lập kế hoạch, thiết kế và chế tạo thử nghiệm mô hình chong chóng phát điện từ gió.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG_CAO,
        lessonName:
          'STEM: Chế tạo mô hình chong chóng phát điện từ gió gắn với Bài 17: Một số dạng năng lượng tái tạo (KHTN lớp 9)',
        duration: '3 tiết',
      },
    ],
    isSampleData: false,
  },
  {
    id: 'cur-nda-thcs-cn7-stem-1',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 7,
    subject: 'Công nghệ',
    semester: 'CA_NAM',
    weekRange: 'Chuyên đề STEM (3 tiết)',
    totalPeriods: 3,
    durationText: '3 tiết',
    chapterCode: 'STEM-CN7-12',
    chapterTitle: 'Chuyên đề lựa chọn / Bài học STEM Công nghệ 7',
    topicTitle: 'STEM: Mô hình hệ thống trồng rau thủy canh tại nhà (Công nghệ lớp 7)',
    adjustedContentSummary:
      'Lập kế hoạch, tính toán chi phí trồng rau trong khay hoặc thùng xốp; thực hiện quy trình trồng và chăm sóc rau thủy canh an toàn; đảm bảo an toàn lao động và vệ sinh môi trường.',
    sourceDocument: NDA_KHTN_CONG_NGHE_SOURCE_DOC,
    lessons: [
      {
        id: 'cur-nda-thcs-cn7-stem-1-ls1',
        week: 'Chuyên đề 12',
        lessonName: 'STEM: Mô hình hệ thống trồng rau thủy canh tại nhà (Công nghệ lớp 7)',
        subLessonName: 'Thiết kế hệ thống, tính toán chi phí và thực hành trồng rau thủy canh an toàn',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Lập được kế hoạch, tính toán chi phí cho việc trồng một loại rau trong khay hoặc thùng xốp.\n- Thực hiện được quy trình trồng và chăm sóc rau an toàn.\n- Đảm bảo an toàn lao động, vệ sinh môi trường.',
        integrationTags: ['STEM', 'BVMT', 'KNS'],
      },
    ],
    learningOutcomes: [
      {
        code: 'STEM-CN7-12.1',
        description:
          'Lập được kế hoạch, tính toán chi phí cho việc trồng một loại rau trong khay hoặc thùng xốp; thực hiện quy trình trồng, chăm sóc rau thủy canh an toàn và đảm bảo vệ sinh môi trường.',
        suggestedCognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        lessonName: 'STEM: Mô hình hệ thống trồng rau thủy canh tại nhà (Công nghệ lớp 7)',
        duration: '3 tiết',
      },
    ],
    isSampleData: false,
  },
];
