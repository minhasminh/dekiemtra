import {
  CognitiveLevelCode,
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_TIEU_HOC_MY_THUAT_AM_NHAC_SOURCE_DOC =
  'Phụ lục I – Kế hoạch dạy học các môn học Mĩ thuật, Âm nhạc và Hoạt động trải nghiệm Khối Tiểu học (Lớp 1, 2, 3, 4, 5) năm học 2026 – 2027 (Tổ KHXH – Trường TH&THCS Nguyễn Đình Anh)';

interface RawPrimaryArtMusicLessonInput {
  id?: string;
  week: string;
  lessonName: string;
  subLessonName?: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
}

function buildPrimaryArtMusicTopic(params: {
  id: string;
  grade: GradeNumber;
  subject: 'Mĩ thuật' | 'Âm nhạc';
  semester: 'HK1' | 'HK2';
  weekRange: string;
  totalPeriods: number;
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  adjustedContentSummary: string;
  rawLessons: RawPrimaryArtMusicLessonInput[];
}): CurriculumTopic {
  const {
    id,
    grade,
    subject,
    semester,
    weekRange,
    totalPeriods,
    chapterCode,
    chapterTitle,
    topicTitle,
    adjustedContentSummary,
    rawLessons,
  } = params;

  const lessons = rawLessons.map((ls, idx) => ({
    id: ls.id || `${id}-ls-${idx + 1}`,
    week: ls.week,
    lessonName: ls.lessonName,
    subLessonName: ls.subLessonName,
    periodAllocation: ls.periodAllocation,
    periodsCount: ls.periodsCount,
    adjustedContent: ls.adjustedContent,
    integrationTags: extractIntegrationTags(`${ls.adjustedContent} ${ls.note || ''}`),
    note: ls.note,
  }));

  const learningOutcomes = lessons.map((ls, idx) => ({
    code: `${chapterCode}-YCCĐ${idx + 1}`,
    lessonName: ls.lessonName,
    duration: `${ls.periodAllocation} (${ls.periodsCount} tiết)`,
    week: ls.week,
    description: `${ls.lessonName}${ls.subLessonName ? ` [${ls.subLessonName}]` : ''} (${ls.week} – ${ls.periodAllocation}): ${ls.adjustedContent}`,
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
    subject,
    chapterCode,
    chapterTitle,
    topicTitle,
    semester,
    weekRange,
    durationText: `${totalPeriods} tiết (${weekRange})`,
    totalPeriods,
    adjustedContentSummary,
    sourceDocument: NDA_TIEU_HOC_MY_THUAT_AM_NHAC_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1.8. MÔN MĨ THUẬT (KHỐI TIỂU HỌC: LỚP 1, 2, 3, 4, 5 – 35 TIẾT/NĂM/LỚP)
// ============================================================================

/**
 * 1.8.1. MÔN MĨ THUẬT LỚP 1 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: Tuần 1 – Tuần 17 (17 tiết, Chủ đề 1 – Chủ đề 5 + Đánh giá định kỳ cuối HKI)
 * HKII: Tuần 18 – Tuần 35 (18 tiết, Chủ đề 6 – Chủ đề 9 + Đánh giá định kỳ cuối năm & Trưng bày sản phẩm)
 */
export const GRADE1_MY_THUAT_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g1-mt-hk1',
    grade: 1,
    subject: 'Mĩ thuật',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 17',
    totalPeriods: 17,
    chapterCode: 'MT1-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3, 4 & 5: Mĩ thuật trong nhà trường – Sáng tạo từ những chấm màu – Nét vẽ của em – Sáng tạo từ những hình cơ bản – Màu cơ bản trong Mĩ thuật (Tuần 1 – Tuần 17)',
    topicTitle:
      'Mĩ thuật trong nhà trường (1t); Sáng tạo từ những chấm màu (4t); Nét vẽ của em (3t); Sáng tạo từ những hình cơ bản (4t); Màu cơ bản trong Mĩ thuật (4t); Đánh giá định kỳ cuối HKI (1t)',
    adjustedContentSummary:
      'Nhận biết vẻ đẹp mĩ thuật trong nhà trường; thực hành sáng tạo từ chấm màu, nét vẽ, hình cơ bản và màu cơ bản. Tích hợp ANQP (tình yêu quê hương, yêu hòa bình), ATGT (màu đèn tín hiệu giao thông) và Giáo dục AI (1.C1.2 camera AI nhận biết nét vẽ; 1.A1.1 con người có cảm xúc thật trước màu sắc còn AI nhận diện màu qua dữ liệu).',
    rawLessons: [
      {
        week: 'Tuần 1',
        lessonName: 'Chủ đề 1: Mĩ thuật trong nhà trường',
        subLessonName: 'Tiết 1: Mĩ thuật trong nhà trường',
        periodAllocation: '1 tiết (Tiết 1)',
        periodsCount: 1,
        adjustedContent:
          'Nhận biết được một số đồ dùng học tập môn Mĩ thuật và sản phẩm mĩ thuật trong nhà trường. Tích hợp ANQP (HĐ3): Giáo dục học sinh tình yêu quê hương, yêu hòa bình; nhận biết vẻ đẹp ngôi trường, tình cảm bạn bè, thầy cô.',
      },
      {
        week: 'Tuần 2 – 5',
        lessonName: 'Chủ đề 2: Sáng tạo từ những chấm màu (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 2–5: Sáng tạo từ những chấm màu – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 2–5)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết được chấm màu trong tự nhiên và trong tranh; sử dụng được chấm màu để tạo hình và trang trí sản phẩm mĩ thuật theo ý thích.',
      },
      {
        week: 'Tuần 6 – 8',
        lessonName: 'Chủ đề 3: Nét vẽ của em (Tiết 1, 2, 3)',
        subLessonName: 'Tiết 6–8: Nét vẽ của em – T1, T2, T3',
        periodAllocation: '3 tiết (Tiết 6–8)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết các loại nét khác nhau và sử dụng nét để vẽ tranh, trang trí. Tích hợp AI (1.C1.2): Nhận biết các bộ phận của thiết bị AI (như camera là "mắt") có khả năng nhìn thấy và nhận diện các nét vẽ của em.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 4: Sáng tạo từ những hình cơ bản (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 9–12: Sáng tạo từ những hình cơ bản – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết hình vuông, hình tròn, hình tam giác, hình chữ nhật; thực hành cắt, dán và vẽ sáng tạo các hình ảnh quen thuộc từ những hình cơ bản.',
      },
      {
        week: 'Tuần 13 – 17',
        lessonName:
          'Chủ đề 5: Màu cơ bản trong Mĩ thuật (Tiết 1, 2, 3, 4) & Đánh giá định kỳ cuối học kỳ I',
        subLessonName:
          'Tiết 13–16: Màu cơ bản trong Mĩ thuật – T1, T2, T3, T4 | Tiết 17: Đánh giá định kỳ cuối HKI',
        periodAllocation: '5 tiết (Tiết 13–17)',
        periodsCount: 5,
        adjustedContent:
          'Nhận biết ba màu cơ bản (đỏ, vàng, lam) và vận dụng trong thực hành tạo sản phẩm; hoàn thành bài đánh giá định kỳ cuối HKI. Tích hợp ATGT: Nhận biết màu sắc đèn tín hiệu giao thông (đỏ dừng lại, vàng chậm lại, xanh được đi). Tích hợp AI (1.A1.1): Nhận biết màu sắc gợi lên cảm xúc ở con người, còn AI không có cảm xúc thật mà chỉ nhận diện màu sắc thông qua dữ liệu.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g1-mt-hk2',
    grade: 1,
    subject: 'Mĩ thuật',
    semester: 'HK2',
    weekRange: 'Tuần 18 – Tuần 35',
    totalPeriods: 18,
    chapterCode: 'MT1-HK2',
    chapterTitle:
      'Chủ đề 6, 7, 8 & 9: Sáng tạo từ những khối cơ bản – Hoa, Quả – Người thân của em – Em là học sinh lớp 1 (Tuần 18 – Tuần 35)',
    topicTitle:
      'Sáng tạo từ những khối cơ bản (4t); Hoa, Quả (4t); Người thân của em (4t); Em là học sinh lớp 1 (4t); Đánh giá định kỳ cuối năm (1t); Trưng bày sản phẩm cuối năm (1t)',
    adjustedContentSummary:
      'Tạo hình từ khối cơ bản, nặn và vẽ hoa quả, vẽ chân dung người thân và hoạt động học sinh lớp 1. Tích hợp AI (1.D2.1 phân biệt máy thông minh làm 1 việc và nhiều việc; 1.A1.2 biểu hiện cảm xúc trên màn hình AI là do lập trình), BVMT, ANQP (hình ảnh chiến sĩ Quân đội, Công an), NLS (1.1.CB1b, 2.2.CB1a).',
    rawLessons: [
      {
        week: 'Tuần 18 – 21',
        lessonName: 'Chủ đề 6: Sáng tạo từ những khối cơ bản (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 18–21: Sáng tạo từ những khối cơ bản – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 18–21)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết khối trụ, khối cầu, khối hộp và thực hành nặn/tạo hình đồ vật, con vật từ khối cơ bản. Tích hợp AI (1.D2.1): Nhận biết có nhiều loại máy thông minh: loại chỉ làm một việc (như nhìn khối hình), loại làm được nhiều việc (như robot di chuyển).',
      },
      {
        week: 'Tuần 22 – 25',
        lessonName: 'Chủ đề 7: Hoa, Quả (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 22–25: Hoa, Quả – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 22–25)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết hình dáng, màu sắc đặc trưng của một số loại hoa, quả quen thuộc và thực hành vẽ, nặn hoa quả. Tích hợp BVMT (HĐ 1: Tìm hiểu): Học sinh biết chăm sóc, bảo vệ cây xanh, giữ gìn môi trường xanh, sạch, đẹp.',
      },
      {
        week: 'Tuần 26 – 29',
        lessonName: 'Chủ đề 8: Người thân của em (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 26–29: Người thân của em – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 26–29)',
        periodsCount: 4,
        adjustedContent:
          'Vẽ, xé dán hoặc nặn được hình ảnh người thân trong gia đình. Tích hợp ANQP (HĐ1.Tiết 1): Giới thiệu hình ảnh các chiến sĩ Quân đội và Công an; vẽ chân dung hoặc làm thiệp tặng người thân đang công tác trong lực lượng vũ trang. Tích hợp AI (1.A1.2): Biết được biểu hiện cảm xúc của AI trên màn hình là do con người lập trình, không phải cảm xúc thật như tình cảm của người thân.',
      },
      {
        week: 'Tuần 30 – 35',
        lessonName:
          'Chủ đề 9: Em là học sinh lớp 1 (Tiết 1, 2, 3, 4), Đánh giá định kỳ cuối năm & Trưng bày sản phẩm',
        subLessonName:
          'Tiết 30–33: Em là học sinh lớp 1 – T1, T2, T3, T4 | Tiết 34: Đánh giá định kỳ cuối năm | Tiết 35: Trưng bày sản phẩm',
        periodAllocation: '6 tiết (Tiết 30–35)',
        periodsCount: 6,
        adjustedContent:
          'Thực hành sáng tạo sản phẩm về hoạt động học tập, vui chơi của học sinh lớp 1; đánh giá định kỳ cuối năm và trưng bày, giới thiệu sản phẩm. Tích hợp NLS (1.1.CB1b: Tìm được cách truy cập dữ liệu, thông tin và điều hướng chúng; 2.2.CB1a: Nhận biết được công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số).',
      },
    ],
  }),
];

/**
 * 1.8.2. MÔN MĨ THUẬT LỚP 2 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: Tuần 1 – Tuần 17 (17 tiết, Chủ đề 1 – Chủ đề 6 + Đánh giá định kỳ cuối HKI)
 * HKII: Tuần 18 – Tuần 35 (18 tiết, Chủ đề 7 – Chủ đề 10 + Đánh giá định kỳ cuối năm & Trưng bày sản phẩm)
 */
export const GRADE2_MY_THUAT_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g2-mt-hk1',
    grade: 2,
    subject: 'Mĩ thuật',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 17',
    totalPeriods: 17,
    chapterCode: 'MT2-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3, 4, 5 & 6: Mĩ thuật trong cuộc sống – Sự thú vị của nét – Sự kết hợp của các hình cơ bản – Những mảng màu yêu thích – Sự kết hợp thú vị của khối – Sắc màu thiên nhiên (Tuần 1 – Tuần 17)',
    topicTitle:
      'Mĩ thuật trong cuộc sống (1t); Sự thú vị của nét (2t); Sự kết hợp của các hình cơ bản (3t); Những mảng màu yêu thích (3t); Sự kết hợp thú vị của khối (3t); Sắc màu thiên nhiên (4t); Đánh giá định kỳ cuối HKI (1t)',
    adjustedContentSummary:
      'Khám phá mĩ thuật trong cuộc sống; thực hành tạo hình từ nét, hình cơ bản, mảng màu, khối cơ bản và sắc màu thiên nhiên. Tích hợp AI (2.A2.1 nhận biết robot hút bụi, đồ chơi thông minh tạo từ hình khối có AI hỗ trợ), ANQP (tình yêu quê hương, biển đảo, ý thức bảo vệ chủ quyền) và BVMT (giữ gìn cảnh đẹp thiên nhiên).',
    rawLessons: [
      {
        week: 'Tuần 1 – 3',
        lessonName: 'Chủ đề 1: Mĩ thuật trong cuộc sống (1 tiết) & Chủ đề 2: Sự thú vị của nét (2 tiết)',
        subLessonName: 'Tiết 1: Mĩ thuật trong cuộc sống | Tiết 2–3: Sự thú vị của nét – T1, T2',
        periodAllocation: '3 tiết (Tiết 1–3)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết sự đa dạng của mĩ thuật trong đời sống và sử dụng sự kết hợp của các nét để tạo hình sản phẩm.',
      },
      {
        week: 'Tuần 4 – 9',
        lessonName:
          'Chủ đề 3: Sự kết hợp của các hình cơ bản (3 tiết) & Chủ đề 4: Những mảng màu yêu thích (3 tiết)',
        subLessonName:
          'Tiết 4–6: Sự kết hợp của các hình cơ bản – T1, T2, T3 | Tiết 7–9: Những mảng màu yêu thích – T1, T2, T3',
        periodAllocation: '6 tiết (Tiết 4–9)',
        periodsCount: 6,
        adjustedContent:
          'Kết hợp các hình cơ bản và mảng màu đậm, nhạt yêu thích để vẽ, cắt dán tranh theo chủ đề.',
      },
      {
        week: 'Tuần 10 – 12',
        lessonName: 'Chủ đề 5: Sự kết hợp thú vị của khối (Tiết 1, 2, 3)',
        subLessonName: 'Tiết 10–12: Sự kết hợp thú vị của khối – T1, T2, T3',
        periodAllocation: '3 tiết (Tiết 10–12)',
        periodsCount: 3,
        adjustedContent:
          'Kết hợp các khối cơ bản để nặn, tạo hình đồ vật, con vật quen thuộc. Tích hợp AI (2.A2.1): Nhận biết và mô tả một số thiết bị/ứng dụng trong gia đình có sử dụng AI (như robot hút bụi, búp bê lật đật thông minh được tạo thành từ các hình khối và có AI hỗ trợ).',
      },
      {
        week: 'Tuần 13 – 17',
        lessonName:
          'Chủ đề 6: Sắc màu thiên nhiên (Tiết 1, 2, 3, 4) & Đánh giá định kỳ cuối học kỳ I',
        subLessonName:
          'Tiết 13–16: Sắc màu thiên nhiên – T1, T2, T3, T4 | Tiết 17: Đánh giá định kỳ cuối HKI',
        periodAllocation: '5 tiết (Tiết 13–17)',
        periodsCount: 5,
        adjustedContent:
          'Thực hành vẽ, xé dán cảnh đẹp thiên nhiên và hoàn thành bài đánh giá định kỳ cuối HKI. Tích hợp ANQP (HĐ2.Tiết 1): Giáo dục tình yêu quê hương, biển đảo và ý thức bảo vệ chủ quyền. Tích hợp BVMT: Giữ gìn cảnh đẹp thiên nhiên xanh, sạch, đẹp.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g2-mt-hk2',
    grade: 2,
    subject: 'Mĩ thuật',
    semester: 'HK2',
    weekRange: 'Tuần 18 – Tuần 35',
    totalPeriods: 18,
    chapterCode: 'MT2-HK2',
    chapterTitle:
      'Chủ đề 7, 8, 9 & 10: Gương mặt thân quen – Bữa cơm gia đình – Thầy cô của em – Đồ chơi từ tạo hình con vật (Tuần 18 – Tuần 35)',
    topicTitle:
      'Gương mặt thân quen (4t); Bữa cơm gia đình (4t); Thầy cô của em (4t); Đồ chơi từ tạo hình con vật (4t); Đánh giá định kỳ cuối năm (1t); Trưng bày sản phẩm cuối năm (1t)',
    adjustedContentSummary:
      'Sáng tạo tranh chân dung gương mặt thân quen, bữa cơm gia đình, hình ảnh thầy cô giáo và đồ chơi tạo hình con vật. Tích hợp ANQP (vẽ chân dung chú bộ đội, công an bảo vệ Tổ quốc) và NLS (2.1.CB1a, 2.2.CB1a tương tác, chia sẻ sản phẩm số).',
    rawLessons: [
      {
        week: 'Tuần 18 – 21',
        lessonName: 'Chủ đề 7: Gương mặt thân quen (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 18–21: Gương mặt thân quen – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 18–21)',
        periodsCount: 4,
        adjustedContent:
          'Thể hiện được đặc điểm gương mặt người thân, bạn bè bằng hình thức vẽ hoặc cắt dán. Tích hợp ANQP (HĐ2.Tiết 1): Giới thiệu hình ảnh cán bộ, chiến sĩ Quân đội, Công an bảo vệ Tổ quốc; gợi ý vẽ chân dung chú bộ đội, công an.',
      },
      {
        week: 'Tuần 22 – 25',
        lessonName: 'Chủ đề 8: Bữa cơm gia đình (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 22–25: Bữa cơm gia đình – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 22–25)',
        periodsCount: 4,
        adjustedContent:
          'Nặn, vẽ hoặc tạo hình các món ăn và khung cảnh đầm ấm của bữa cơm gia đình; bồi dưỡng tình cảm yêu thương, gắn kết gia đình.',
      },
      {
        week: 'Tuần 26 – 29',
        lessonName: 'Chủ đề 9: Thầy cô của em (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 26–29: Thầy cô của em – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 26–29)',
        periodsCount: 4,
        adjustedContent:
          'Sáng tạo sản phẩm mĩ thuật thể hiện hình ảnh và lòng biết ơn đối với thầy giáo, cô giáo. Tích hợp NLS (2.1.CB1a: Lựa chọn công nghệ số đơn giản để tương tác; 2.2.CB1a: Chia sẻ dữ liệu, thông tin sản phẩm học tập).',
      },
      {
        week: 'Tuần 30 – 35',
        lessonName:
          'Chủ đề 10: Đồ chơi từ tạo hình con vật (Tiết 1, 2, 3, 4), Đánh giá định kỳ cuối năm & Trưng bày sản phẩm',
        subLessonName:
          'Tiết 30–33: Đồ chơi từ tạo hình con vật – T1, T2, T3, T4 | Tiết 34: Đánh giá định kỳ cuối năm | Tiết 35: Trưng bày sản phẩm',
        periodAllocation: '6 tiết (Tiết 30–35)',
        periodsCount: 6,
        adjustedContent:
          'Tận dụng vật liệu sẵn có để tạo hình đồ chơi con vật ngộ nghĩnh; hoàn thành bài đánh giá định kỳ cuối năm và trưng bày sản phẩm mĩ thuật cuối năm học.',
      },
    ],
  }),
];

/**
 * 1.8.3. MÔN MĨ THUẬT LỚP 3 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: Tuần 1 – Tuần 17 (17 tiết, Chủ đề 1 – Chủ đề 6 + Kiểm tra/đánh giá HKI)
 * HKII: Tuần 18 – Tuần 35 (18 tiết, Chủ đề 7 – Chủ đề 10 + Kiểm tra/đánh giá cuối năm & Trưng bày sản phẩm)
 */
export const GRADE3_MY_THUAT_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g3-mt-hk1',
    grade: 3,
    subject: 'Mĩ thuật',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 17',
    totalPeriods: 17,
    chapterCode: 'MT3-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3, 4, 5 & 6: Em yêu Mĩ thuật – Hoa văn trên trang phục dân tộc – Màu sắc em yêu – Vẻ đẹp của khối – Vật liệu trong thực hành sáng tạo – Biết ơn thầy cô (Tuần 1 – Tuần 17)',
    topicTitle:
      'Em yêu Mĩ thuật (1t); Hoa văn trên trang phục một số dân tộc (2t); Màu sắc em yêu (3t); Vẻ đẹp của khối (3t); Một số vật liệu trong thực hành sáng tạo MT (3t); Biết ơn thầy cô (4t); Kiểm tra/đánh giá HKI (1t)',
    adjustedContentSummary:
      'Tìm hiểu hoa văn trang phục dân tộc, màu sắc, vẻ đẹp của khối, vật liệu tái chế và chủ đề biết ơn thầy cô. Tích hợp ANQP (tự hào bản sắc văn hóa dân tộc anh em, tình yêu quê hương), BVMT (tái chế vật liệu sẵn có) và AI (3.A2.2 nhận biết công cụ AI hỗ trợ tìm kiếm tư liệu, hình ảnh trong trường học).',
    rawLessons: [
      {
        week: 'Tuần 1 – 3',
        lessonName:
          'Chủ đề 1: Em yêu Mĩ thuật (1 tiết) & Chủ đề 2: Hoa văn trên trang phục của một số dân tộc (2 tiết)',
        subLessonName:
          'Tiết 1: Em yêu Mĩ thuật | Tiết 2–3: Hoa văn trên trang phục của một số dân tộc – T1, T2',
        periodAllocation: '3 tiết (Tiết 1–3)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết nét đẹp họa tiết hoa văn trên trang phục các dân tộc Việt Nam và thực hành mô phỏng, trang trí. Tích hợp ANQP (HĐ2.Tiết 1): Tự hào bản sắc văn hóa các dân tộc anh em, đoàn kết bảo vệ truyền thống dân tộc.',
      },
      {
        week: 'Tuần 4 – 9',
        lessonName: 'Chủ đề 3: Màu sắc em yêu (3 tiết) & Chủ đề 4: Vẻ đẹp của khối (3 tiết)',
        subLessonName: 'Tiết 4–6: Màu sắc em yêu – T1, T2, T3 | Tiết 7–9: Vẻ đẹp của khối – T1, T2, T3',
        periodAllocation: '6 tiết (Tiết 4–9)',
        periodsCount: 6,
        adjustedContent:
          'Vận dụng màu sắc đậm nhạt, nóng lạnh và kết hợp các hình khối để sáng tạo sản phẩm. Tích hợp ANQP (HĐ2.Tiết 1 Chủ đề 3): Bồi dưỡng tình yêu quê hương qua cảnh sắc thiên nhiên.',
      },
      {
        week: 'Tuần 10 – 12',
        lessonName: 'Chủ đề 5: Một số vật liệu sử dụng trong thực hành, sáng tạo Mĩ thuật (Tiết 1, 2, 3)',
        subLessonName: 'Tiết 10–12: Một số vật liệu sử dụng trong thực hành, sáng tạo MT – T1, T2, T3',
        periodAllocation: '3 tiết (Tiết 10–12)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết tính chất của các vật liệu tự nhiên và vật liệu đã qua sử dụng để tạo hình sản phẩm. Tích hợp BVMT: Bảo vệ môi trường thông qua tái chế vật liệu sẵn có để sáng tạo nghệ thuật.',
      },
      {
        week: 'Tuần 13 – 17',
        lessonName: 'Chủ đề 6: Biết ơn thầy cô (Tiết 1, 2, 3, 4) & Kiểm tra/đánh giá học kì I',
        subLessonName:
          'Tiết 13–16: Biết ơn thầy cô – T1, T2, T3, T4 | Tiết 17: Kiểm tra/đánh giá học kì I',
        periodAllocation: '5 tiết (Tiết 13–17)',
        periodsCount: 5,
        adjustedContent:
          'Sáng tạo tranh vẽ hoặc sản phẩm quà tặng tri ân thầy cô giáo và thực hiện đánh giá cuối HKI. Tích hợp AI (3.A2.2): Nhận biết đối tượng trong trường học mà AI có thể hỗ trợ (học sinh, giáo viên); công cụ AI hỗ trợ tìm kiếm tư liệu, hình ảnh tham khảo.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g3-mt-hk2',
    grade: 3,
    subject: 'Mĩ thuật',
    semester: 'HK2',
    weekRange: 'Tuần 18 – Tuần 35',
    totalPeriods: 18,
    chapterCode: 'MT3-HK2',
    chapterTitle:
      'Chủ đề 7, 8, 9 & 10: Cảnh vật quanh em – Chân dung người thân trong gia đình – Sinh hoạt trong gia đình – An toàn giao thông (Tuần 18 – Tuần 35)',
    topicTitle:
      'Cảnh vật quanh em (4t); Chân dung người thân trong gia đình (4t); Sinh hoạt trong gia đình (4t); An toàn giao thông (4t); Kiểm tra/đánh giá cuối năm (1t); Trưng bày sản phẩm cuối năm (1t)',
    adjustedContentSummary:
      'Sáng tạo tranh cảnh vật quanh em, chân dung người thân, sinh hoạt gia đình và an toàn giao thông. Tích hợp ANQP (danh lam thắng cảnh, di tích lịch sử, gia đình là nền tảng bình yên xã hội), BVMT, ATGT (chấp hành luật giao thông đường bộ) và NLS (1.1.CB1b, 2.2.CB1a).',
    rawLessons: [
      {
        week: 'Tuần 18 – 21',
        lessonName: 'Chủ đề 7: Cảnh vật quanh em (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 18–21: Cảnh vật quanh em – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 18–21)',
        periodsCount: 4,
        adjustedContent:
          'Quan sát và thể hiện cảnh vật xung quanh nơi ở, trường học bằng nhiều chất liệu. Tích hợp ANQP (HĐ2.Tiết 1): Tình yêu quê hương qua danh lam thắng cảnh, di tích lịch sử. Tích hợp BVMT: Hoạt động bảo vệ môi trường ở địa phương và nhà trường.',
      },
      {
        week: 'Tuần 22 – 25',
        lessonName: 'Chủ đề 8: Chân dung người thân trong gia đình (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 22–25: Chân dung người thân trong gia đình – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 22–25)',
        periodsCount: 4,
        adjustedContent:
          'Khắc họa đặc điểm gương mặt và biểu cảm của người thân trong gia đình. Tích hợp ANQP (HĐ2.Tiết 1): Giáo dục yêu thương, gắn kết gia đình là nền tảng của sự bình yên xã hội.',
      },
      {
        week: 'Tuần 26 – 29',
        lessonName: 'Chủ đề 9: Sinh hoạt trong gia đình (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 26–29: Sinh hoạt trong gia đình – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 26–29)',
        periodsCount: 4,
        adjustedContent:
          'Sáng tạo tranh đề tài sinh hoạt đầm ấm của các thành viên trong gia đình (cùng làm việc nhà, sum họp, vui chơi).',
      },
      {
        week: 'Tuần 30 – 35',
        lessonName:
          'Chủ đề 10: An toàn giao thông (Tiết 1, 2, 3, 4), Kiểm tra/đánh giá cuối năm & Trưng bày sản phẩm cuối năm',
        subLessonName:
          'Tiết 30–33: An toàn giao thông – T1, T2, T3, T4 | Tiết 34: Kiểm tra/đánh giá cuối năm | Tiết 35: Trưng bày sản phẩm cuối năm',
        periodAllocation: '6 tiết (Tiết 30–35)',
        periodsCount: 6,
        adjustedContent:
          'Vẽ tranh tuyên truyền về an toàn giao thông; thực hiện kiểm tra đánh giá cuối năm và trưng bày sản phẩm. Tích hợp ATGT (HĐ 1: Tìm hiểu): Giáo dục ý thức chấp hành luật giao thông đường bộ. Tích hợp NLS (1.1.CB1b, 2.2.CB1a: Truy cập thông tin và chia sẻ sản phẩm số đơn giản).',
      },
    ],
  }),
];

/**
 * 1.8.4. MÔN MĨ THUẬT LỚP 4 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: Tuần 1 – Tuần 17 (17 tiết, Chủ đề 1 – Chủ đề 4 + Kiểm tra đánh giá HKI)
 * HKII: Tuần 18 – Tuần 35 (18 tiết, Chủ đề 5 – Chủ đề 8 + Kiểm tra đánh giá HKII & Trưng bày sản phẩm cuối năm)
 */
export const GRADE4_MY_THUAT_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g4-mt-hk1',
    grade: 4,
    subject: 'Mĩ thuật',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 17',
    totalPeriods: 17,
    chapterCode: 'MT4-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3 & 4: Vẻ đẹp trong điêu khắc đình làng Việt Nam – Không gian trong tranh dân gian Việt Nam – Cảnh đẹp quê hương – Vẻ đẹp trong cuộc sống (Tuần 1 – Tuần 17)',
    topicTitle:
      'Vẻ đẹp trong điêu khắc đình làng Việt Nam (4t); Một số dạng không gian trong tranh dân gian Việt Nam (4t); Cảnh đẹp quê hương (4t); Vẻ đẹp trong cuộc sống (4t); Kiểm tra đánh giá HKI (1t)',
    adjustedContentSummary:
      'Tìm hiểu nghệ thuật điêu khắc đình làng và tranh dân gian Việt Nam; sáng tạo tranh cảnh đẹp quê hương và vẻ đẹp cuộc sống. Tích hợp AI (4.A1.1 vai trò của AI trong bảo tồn và lưu trữ hình ảnh tác phẩm điêu khắc truyền thống), NLS (1.1.CB2c, 1.1.CB2a) và ANQP (chủ quyền lãnh thổ vùng trời, vùng biển, cột mốc biên giới, tàu hải quân tuần tra).',
    rawLessons: [
      {
        week: 'Tuần 1 – 4',
        lessonName: 'Chủ đề 1: Vẻ đẹp trong điêu khắc đình làng Việt Nam (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 1–4: Vẻ đẹp trong điêu khắc đình làng Việt Nam – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Khám phá vẻ đẹp tạo hình của phù điêu, điêu khắc đình làng Việt Nam và mô phỏng bằng đất nặn/bìa giấy. Tích hợp AI (4.A1.1): Vai trò của AI trong bảo tồn, số hóa và lưu trữ hình ảnh tác phẩm điêu khắc truyền thống. Tích hợp NLS (1.1.CB2c): Tìm kiếm hình ảnh, video về điêu khắc đình làng bằng thiết bị số.',
      },
      {
        week: 'Tuần 5 – 8',
        lessonName: 'Chủ đề 2: Một số dạng không gian trong tranh dân gian Việt Nam (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 5–8: Một số dạng không gian trong tranh dân gian Việt Nam – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 5–8)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết cách sắp xếp bố cục, hình ảnh và không gian ước lệ trong tranh dân gian Đông Hồ, Hàng Trống, Làng Sình; vận dụng vào thực hành sáng tạo.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 3: Cảnh đẹp quê hương (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 9–12: Cảnh đẹp quê hương – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Thể hiện cảnh đẹp quê hương bằng chất liệu hội họa hoặc đồ họa. Tích hợp ANQP (HĐ2.Tiết 1): Giáo dục ý thức chủ quyền lãnh thổ vùng trời, vùng biển; gợi ý vẽ tranh phong cảnh quê hương có cột mốc biên giới hoặc tàu hải quân tuần tra bảo vệ biển đảo.',
      },
      {
        week: 'Tuần 13 – 17',
        lessonName: 'Chủ đề 4: Vẻ đẹp trong cuộc sống (Tiết 1, 2, 3, 4) & Kiểm tra đánh giá học kì I',
        subLessonName:
          'Tiết 13–16: Vẻ đẹp trong cuộc sống – T1, T2, T3, T4 | Tiết 17: Kiểm tra đánh giá học kì I',
        periodAllocation: '5 tiết (Tiết 13–17)',
        periodsCount: 5,
        adjustedContent:
          'Sáng tạo sản phẩm mĩ thuật ca ngợi nét đẹp lao động, sinh hoạt trong cuộc sống hàng ngày và hoàn thành bài đánh giá cuối HKI. Tích hợp NLS (1.1.CB2a): Xác định nhu cầu thông tin, tìm kiếm dữ liệu đơn giản trong môi trường số.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g4-mt-hk2',
    grade: 4,
    subject: 'Mĩ thuật',
    semester: 'HK2',
    weekRange: 'Tuần 18 – Tuần 35',
    totalPeriods: 18,
    chapterCode: 'MT4-HK2',
    chapterTitle:
      'Chủ đề 5, 6, 7 & 8: Những kỉ niệm đẹp – Mái trường yêu dấu – Môi trường xanh - sạch - đẹp – Quê hương thanh bình (Tuần 18 – Tuần 35)',
    topicTitle:
      'Những kỉ niệm đẹp (4t); Mái trường yêu dấu (4t); Môi trường xanh - sạch - đẹp (4t); Quê hương thanh bình (4t); Kiểm tra đánh giá HKII (1t); Trưng bày sản phẩm cuối năm (1t)',
    adjustedContentSummary:
      'Sáng tạo tranh và mô hình theo chủ đề kỉ niệm đẹp, mái trường yêu dấu, môi trường xanh - sạch - đẹp và quê hương thanh bình. Tích hợp AI (4.B2.1 bảo vệ quyền riêng tư và dữ liệu cá nhân khi dùng ứng dụng AI chỉnh sửa ảnh kỉ niệm), BVMT và ANQP (giá trị hòa bình, chiến sĩ hải quân canh giữ biển đảo quê hương).',
    rawLessons: [
      {
        week: 'Tuần 18 – 21',
        lessonName: 'Chủ đề 5: Những kỉ niệm đẹp (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 18–21: Những kỉ niệm đẹp – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 18–21)',
        periodsCount: 4,
        adjustedContent:
          'Thể hiện những kỉ niệm đáng nhớ bên gia đình, thầy cô, bạn bè bằng tranh vẽ hoặc sản phẩm tạo hình. Tích hợp AI (4.B2.1): Biết việc chia sẻ thông tin cá nhân (họ tên, địa chỉ, ảnh riêng tư) cho AI có thể gây rủi ro; có ý thức bảo vệ quyền riêng tư khi dùng ứng dụng AI chỉnh sửa ảnh kỉ niệm.',
      },
      {
        week: 'Tuần 22 – 25',
        lessonName: 'Chủ đề 6: Mái trường yêu dấu (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 22–25: Mái trường yêu dấu – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 22–25)',
        periodsCount: 4,
        adjustedContent:
          'Vẽ, tạo hình cảnh trường lớp và các hoạt động học tập, vui chơi sôi nổi dưới mái trường.',
      },
      {
        week: 'Tuần 26 – 29',
        lessonName: 'Chủ đề 7: Môi trường xanh - sạch - đẹp (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 26–29: Môi trường xanh - sạch - đẹp – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 26–29)',
        periodsCount: 4,
        adjustedContent:
          'Thực hành sáng tạo sản phẩm tuyên truyền bảo vệ môi trường từ vật liệu đa dạng. Tích hợp BVMT (HĐ 1: Tìm hiểu): Chăm sóc, bảo vệ cây xanh, giữ gìn môi trường sống xanh, sạch, đẹp.',
      },
      {
        week: 'Tuần 30 – 35',
        lessonName:
          'Chủ đề 8: Quê hương thanh bình (Tiết 1, 2, 3, 4), Kiểm tra đánh giá học kì II & Trưng bày sản phẩm cuối năm',
        subLessonName:
          'Tiết 30–33: Quê hương thanh bình – T1, T2, T3, T4 | Tiết 34: Kiểm tra đánh giá HKII | Tiết 35: Trưng bày sản phẩm cuối năm',
        periodAllocation: '6 tiết (Tiết 30–35)',
        periodsCount: 6,
        adjustedContent:
          'Xây dựng mô hình 3D hoặc tranh vẽ về cuộc sống thanh bình trên quê hương; hoàn thành đánh giá cuối HKII và trưng bày sản phẩm cuối năm. Tích hợp ANQP (HĐ2.Tiết 1): Trân trọng giá trị hòa bình, xây dựng bối cảnh 3D "Cả nhà đi biển" lồng ghép câu chuyện chiến sĩ hải quân canh giữ biển đảo quê hương.',
      },
    ],
  }),
];

/**
 * 1.8.5. MÔN MĨ THUẬT LỚP 5 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: Tuần 1 – Tuần 17 (17 tiết, Chủ đề 1 – Chủ đề 4 + Kiểm tra đánh giá HKI)
 * HKII: Tuần 18 – Tuần 35 (18 tiết, Chủ đề 5 – Chủ đề 8 + Kiểm tra đánh giá HKII & Trưng bày sản phẩm cuối năm)
 */
export const GRADE5_MY_THUAT_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g5-mt-hk1',
    grade: 5,
    subject: 'Mĩ thuật',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 17',
    totalPeriods: 17,
    chapterCode: 'MT5-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3 & 4: Yếu tố tạo hình trong thực hành sáng tạo – Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam – Gia đình – Những hoạt động yêu thích ở trường em (Tuần 1 – Tuần 17)',
    topicTitle:
      'Yếu tố tạo hình trong thực hành, sáng tạo theo chủ đề (4t); Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam (4t); Gia đình (4t); Những hoạt động yêu thích ở trường em (4t); Kiểm tra đánh giá HKI (1t)',
    adjustedContentSummary:
      'Vận dụng các yếu tố và nguyên lí tạo hình; tìm hiểu hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam; sáng tạo chủ đề gia đình và hoạt động ở trường. Tích hợp ANQP (tấm gương dũng cảm, tác phong nghiêm túc kỉ luật của cán bộ chiến sĩ QĐND và CAND) và BVMT (giữ gìn môi trường xanh sạch đẹp sau mỗi hoạt động).',
    rawLessons: [
      {
        week: 'Tuần 1 – 4',
        lessonName: 'Chủ đề 1: Yếu tố tạo hình trong thực hành, sáng tạo theo chủ đề (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 1–4: Yếu tố tạo hình trong thực hành, sáng tạo theo chủ đề – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Vận dụng linh hoạt chấm, nét, hình, khối, màu sắc, đậm nhạt và không gian trong thực hành sáng tạo sản phẩm mĩ thuật 2D, 3D.',
      },
      {
        week: 'Tuần 5 – 8',
        lessonName:
          'Chủ đề 2: Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam (Tiết 1, 2, 3, 4)',
        subLessonName:
          'Tiết 5–8: Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 5–8)',
        periodsCount: 4,
        adjustedContent:
          'Tìm hiểu các tác phẩm tượng đài, tranh vẽ về anh hùng dân tộc Việt Nam và thực hành mô phỏng, sáng tạo. Tích hợp ANQP (HĐ2.Tiết 1): Giới thiệu những tấm gương dũng cảm của cán bộ, chiến sĩ QĐND và CAND; sử dụng yếu tố tạo hình thể hiện tác phong nghiêm túc, kỉ luật của người chiến sĩ QĐND Việt Nam.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 3: Gia đình (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 9–12: Gia đình – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Thể hiện tình cảm yêu thương, sum họp gia đình qua tranh vẽ hoặc tạo hình đa chất liệu.',
      },
      {
        week: 'Tuần 13 – 17',
        lessonName:
          'Chủ đề 4: Những hoạt động yêu thích ở trường em (Tiết 1, 2, 3, 4) & Kiểm tra đánh giá học kì I',
        subLessonName:
          'Tiết 13–16: Những hoạt động yêu thích ở trường em – T1, T2, T3, T4 | Tiết 17: Kiểm tra đánh giá HKI',
        periodAllocation: '5 tiết (Tiết 13–17)',
        periodsCount: 5,
        adjustedContent:
          'Sáng tạo sản phẩm tái hiện các hoạt động văn nghệ, thể thao, trải nghiệm ở trường và hoàn thành bài kiểm tra đánh giá HKI. Tích hợp BVMT: Có ý thức giữ gìn môi trường xanh, sạch, đẹp sau mỗi hoạt động tập thể và thực hành mĩ thuật.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g5-mt-hk2',
    grade: 5,
    subject: 'Mĩ thuật',
    semester: 'HK2',
    weekRange: 'Tuần 18 – Tuần 35',
    totalPeriods: 18,
    chapterCode: 'MT5-HK2',
    chapterTitle:
      'Chủ đề 5, 6, 7 & 8: Những việc làm bình dị mà cao quý – Cảnh sắc quê hương – Việt Nam đất nước, con người – Vì một thế giới hoà bình (Tuần 18 – Tuần 35)',
    topicTitle:
      'Những việc làm bình dị mà cao quý trong cuộc sống (4t); Cảnh sắc quê hương (4t); Việt Nam đất nước, con người (4t); Vì một thế giới hoà bình (4t); Kiểm tra đánh giá HKII (1t); Trưng bày sản phẩm cuối năm (1t)',
    adjustedContentSummary:
      'Ca ngợi những việc làm bình dị mà cao quý, cảnh sắc quê hương, đất nước con người Việt Nam và ước mơ thế giới hòa bình. Tích hợp ANQP (cán bộ chiến sĩ bộ đội, công an cứu hộ cứu nạn khi thiên tai; chủ quyền biển đảo Việt Nam; vai trò LLVT giữ gìn hòa bình) và NLS (1.1.CB2b, 2.2.CB2a).',
    rawLessons: [
      {
        week: 'Tuần 18 – 21',
        lessonName: 'Chủ đề 5: Những việc làm bình dị mà cao quý trong cuộc sống (Tiết 1, 2, 3, 4)',
        subLessonName:
          'Tiết 18–21: Những việc làm bình dị mà cao quý trong cuộc sống – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 18–21)',
        periodsCount: 4,
        adjustedContent:
          'Sáng tạo tranh hoặc sản phẩm tạo hình tôn vinh những tấm gương người tốt, việc tốt trong đời sống. Tích hợp ANQP (HĐ2.Tiết 1): Khắc họa tấm gương dũng cảm của cán bộ, chiến sĩ bộ đội, công an giúp đỡ nhân dân khi gặp thiên tai, bão lũ, cứu hộ cứu nạn.',
      },
      {
        week: 'Tuần 22 – 25',
        lessonName: 'Chủ đề 6: Cảnh sắc quê hương (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 22–25: Cảnh sắc quê hương – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 22–25)',
        periodsCount: 4,
        adjustedContent:
          'Thể hiện vẻ đẹp thiên nhiên, di sản văn hóa quê hương bằng chất liệu màu vẽ, đất nặn hoặc tranh in.',
      },
      {
        week: 'Tuần 26 – 29',
        lessonName: 'Chủ đề 7: Việt Nam đất nước, con người (Tiết 1, 2, 3, 4)',
        subLessonName: 'Tiết 26–29: Việt Nam đất nước, con người – T1, T2, T3, T4',
        periodAllocation: '4 tiết (Tiết 26–29)',
        periodsCount: 4,
        adjustedContent:
          'Sáng tạo sản phẩm mĩ thuật giới thiệu nét đẹp đất nước, con người Việt Nam. Tích hợp ANQP (HĐ2.Tiết 1): Khẳng định chủ quyền, quyền chủ quyền biển đảo Việt Nam; bồi đắp niềm tự hào về lãnh thổ toàn vẹn qua các biểu tượng văn hóa và địa lí.',
      },
      {
        week: 'Tuần 30 – 35',
        lessonName:
          'Chủ đề 8: Vì một thế giới hoà bình (Tiết 1, 2, 3, 4), Kiểm tra đánh giá học kì II & Trưng bày sản phẩm cuối năm',
        subLessonName:
          'Tiết 30–33: Vì một thế giới hoà bình – T1, T2, T3, T4 | Tiết 34: Kiểm tra đánh giá HKII | Tiết 35: Trưng bày sản phẩm cuối năm',
        periodAllocation: '6 tiết (Tiết 30–35)',
        periodsCount: 6,
        adjustedContent:
          'Vẽ tranh, thiết kế áp phích tuyên truyền vì một thế giới hòa bình, hữu nghị; hoàn thành đánh giá cuối HKII và trưng bày tổng kết năm học. Tích hợp ANQP (HĐ2.Tiết 1): Hiểu vai trò của lực lượng vũ trang trong giữ gìn hòa bình, độc lập dân tộc. Tích hợp NLS (1.1.CB2b, 2.2.CB2a: Tìm kiếm tư liệu và chia sẻ thông điệp hòa bình qua môi trường số).',
      },
    ],
  }),
];

// ============================================================================
// 1.9. MÔN ÂM NHẠC (KHỐI TIỂU HỌC: LỚP 1, 2, 3, 4, 5 – 35 TIẾT/NĂM/LỚP)
// HKI: 18 TIẾT (TUẦN 1 – 18) | HKII: 17 TIẾT (TUẦN 19 – 35)
// ============================================================================

/**
 * 1.9.1. MÔN ÂM NHẠC LỚP 1 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: 18 tiết (Chủ đề 1 – Chủ đề 4 + Ôn tập & Kiểm tra cuối HKI)
 * HKII: 17 tiết (Chủ đề 5 – Chủ đề 8 + Ôn tập & Kiểm tra cuối năm)
 */
export const GRADE1_AM_NHAC_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g1-an-hk1',
    grade: 1,
    subject: 'Âm nhạc',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'AN1-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3 & 4: Âm thanh kì diệu – Việt Nam yêu thương – Mái trường thân yêu – Vòng tay bè bạn & Ôn tập, KT cuối HKI (Tiết 1 – Tiết 18)',
    topicTitle:
      'Hát: Vào rừng hoa, Tổ quốc ta, Lớp Một thân yêu, Chào người bạn mới đến; Đọc nhạc: Đô – Rê – Mi; Nhạc cụ: Trống con; TTÂN: Âm thanh kì diệu, Trống cái; Nghe nhạc: Quốc ca, Những bông hoa những bài ca, Vũ khúc Thiên nga',
    adjustedContentSummary:
      'Hát đúng giai điệu, lời ca các bài hát HKI; bước đầu làm quen đọc nhạc bậc thang Đô – Rê – Mi và gõ đệm trống con. Tích hợp AI (1.C1.4 nhận biết AI có khả năng "nghe" và phân biệt các loại âm thanh qua micro), GDQP-AN (chủ quyền biển đảo Việt Nam, yêu nước, đoàn kết) và STEM (làm nhạc cụ gõ Ma-ra-cat bằng vỏ chai nhựa).',
    rawLessons: [
      {
        week: 'Tuần 1 – 4',
        lessonName: 'Chủ đề 1: Âm thanh kì diệu (Hát: Vào rừng hoa; TTÂN: Âm thanh kì diệu; Đọc nhạc: Bậc thang Đô – Rê – Mi)',
        subLessonName:
          'T1: Hát Vào rừng hoa; TTÂN Âm thanh kì diệu | T2–3: Ôn hát; Đọc nhạc Bậc thang Đô – Rê – Mi | T4: Vận dụng - Sáng tạo: To - Nhỏ',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Lắng nghe, nhận biết âm thanh trong tự nhiên và hát đúng bài Vào rừng hoa; đọc cao độ Đô – Rê – Mi. Tích hợp AI (1.C1.4 ở Tiết 1): Nhận biết thiết bị AI có khả năng "nghe" và phân biệt các loại âm thanh thông qua bộ phận thu âm (micro).',
      },
      {
        week: 'Tuần 5 – 8',
        lessonName: 'Chủ đề 2: Việt Nam yêu thương (Học hát: Tổ quốc ta; Nhạc cụ: Trống con; Nghe nhạc: Quốc ca)',
        subLessonName:
          'T5: Học hát Tổ quốc ta | T6: Ôn hát; Nhạc cụ Trống con | T7: Nghe nhạc Quốc ca; Ôn nhạc cụ | T8: Vận dụng - Sáng tạo: Cao - Thấp',
        periodAllocation: '4 tiết (Tiết 5–8)',
        periodsCount: 4,
        adjustedContent:
          'Hát với tình cảm tự hào bài Tổ quốc ta; biết đứng nghiêm trang khi nghe Quốc ca; gõ đệm bằng trống con. Tích hợp GDQP-AN (Tiết 5): Giới thiệu chủ quyền biển, đảo Việt Nam và bồi dưỡng lòng yêu Tổ quốc.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 3: Mái trường thân yêu (Hát: Lớp Một thân yêu; Đọc nhạc: Ban nhạc Đô – Rê – Mi; Nghe nhạc: Những bông hoa những bài ca)',
        subLessonName:
          'T9: Hát Lớp Một thân yêu | T10: Ôn hát; Đọc nhạc Ban nhạc Đô – Rê – Mi | T11: Ôn đọc nhạc; Nghe nhạc Những bông hoa những bài ca | T12: Vận dụng - Sáng tạo: To - Nhỏ, Cao - Thấp',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Hát vui tươi bài Lớp Một thân yêu; đọc đúng cao độ Ban nhạc Đô – Rê – Mi và cảm thụ bài hát thiếu nhi về mái trường, thầy cô.',
      },
      {
        week: 'Tuần 13 – 18',
        lessonName: 'Chủ đề 4: Vòng tay bè bạn (Hát: Chào người bạn mới đến; TTÂN: Trống cái; Nghe nhạc: Vũ khúc Thiên nga) & Ôn tập, KT cuối HKI',
        subLessonName:
          'T13: Hát Chào người bạn mới đến | T14: Ôn hát; Nhạc cụ Trống con | T15: TTÂN Trống cái; Nghe nhạc Vũ khúc Thiên nga | T16–17: Ôn tập cuối HKI | T18: Kiểm tra cuối HKI',
        periodAllocation: '6 tiết (Tiết 13–18)',
        periodsCount: 6,
        adjustedContent:
          'Hát kết hợp vận động bài Chào người bạn mới đến; nhận biết nhạc cụ trống cái; hoàn thành đánh giá cuối HKI. Tích hợp QPAN (Tiết 13): Giáo dục tinh thần yêu nước, đoàn kết bạn bè. Tích hợp STEM (Tiết 16–17): Thực hành làm nhạc cụ gõ Ma-ra-cat tự tạo bằng vỏ chai nhựa.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g1-an-hk2',
    grade: 1,
    subject: 'Âm nhạc',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'AN1-HK2',
    chapterTitle:
      'Chủ đề 5, 6, 7 & 8: Nhịp điệu mùa xuân – Về miền dân ca – Gia đình – Vui đón hè & Ôn tập, KT cuối năm (Tiết 19 – Tiết 35)',
    topicTitle:
      'Hát: Xúc xắc xúc xẻ, Gà gáy, Cây gia đình, Ngôi sao lấp lánh; Đọc nhạc: Đô – Rê – Mi – Pha – Son; Nhạc cụ: Thanh phách, Triangle; TTÂN: Nhạc sĩ Mô-da, Câu chuyện về thanh phách; Nghe nhạc: Lí cây bông, Con chim vành khuyên',
    adjustedContentSummary:
      'Biểu diễn các bài hát chủ đề mùa xuân, dân ca, gia đình và mùa hè; sử dụng thanh phách, triangle và đọc nhạc 5 nốt Đô – Rê – Mi – Pha – Son. Tích hợp GDĐP (Tết cổ truyền và nếp sống văn hóa gia đình địa phương Huế) và Giáo dục AI (1.A2.2 nhận biết ứng dụng AI hỗ trợ khám phá thiên nhiên, ngắm sao nhận diện chòm sao).',
    rawLessons: [
      {
        week: 'Tuần 19 – 22',
        lessonName: 'Chủ đề 5: Nhịp điệu mùa xuân (Hát: Xúc xắc xúc xẻ; Đọc nhạc: Những người bạn của Đô – Rê – Mi; TTÂN: Nhạc sĩ Mô-da)',
        subLessonName:
          'T19: Hát Xúc xắc xúc xẻ | T20: Ôn hát; Đọc nhạc Những người bạn của Đô – Rê – Mi | T21: Ôn đọc nhạc; TTÂN Nhạc sĩ Mô-da | T22: Vận dụng - Sáng tạo: Dài – Ngắn',
        periodAllocation: '4 tiết (Tiết 19–22)',
        periodsCount: 4,
        adjustedContent:
          'Hát rộn ràng bài Xúc xắc xúc xẻ và tìm hiểu câu chuyện âm nhạc về thần đồng Mô-da. Tích hợp GDĐP (Tiết 19): Giới thiệu nét đẹp Tết cổ truyền và phong tục đón xuân tại địa phương.',
      },
      {
        week: 'Tuần 23 – 26',
        lessonName: 'Chủ đề 6: Về miền dân ca (Hát: Gà gáy; Nhạc cụ: Thanh phách; TTÂN: Câu chuyện về thanh phách; Nghe nhạc: Lí cây bông)',
        subLessonName:
          'T23: Hát Gà gáy (Dân ca Cống Khao) | T24: Ôn hát; Nhạc cụ Thanh phách | T25: TTÂN Câu chuyện về thanh phách; Vận dụng Dài - Ngắn | T26: Ôn hát; Nghe nhạc Lí cây bông',
        periodAllocation: '4 tiết (Tiết 23–26)',
        periodsCount: 4,
        adjustedContent:
          'Hát đúng giai điệu dân ca Gà gáy; biết sử dụng thanh phách gõ đệm theo phách, nhịp và cảm nhận làn điệu dân ca Nam Bộ Lí cây bông.',
      },
      {
        week: 'Tuần 27 – 30',
        lessonName: 'Chủ đề 7: Gia đình (Hát: Cây gia đình; Đọc nhạc: Hát cùng Đô – Rê – Mi – Pha – Son; Nghe nhạc: Con chim vành khuyên)',
        subLessonName:
          'T27: Hát Cây gia đình | T28: Ôn hát; Đọc nhạc Đô – Rê – Mi – Pha – Son | T29: Ôn đọc nhạc; Nghe nhạc Con chim vành khuyên | T30: Vận dụng - Sáng tạo: Góc âm nhạc',
        periodAllocation: '4 tiết (Tiết 27–30)',
        periodsCount: 4,
        adjustedContent:
          'Hát tình cảm bài Cây gia đình; đọc nhạc kết hợp kí hiệu bàn tay 5 nốt Đô – Rê – Mi – Pha – Son. Tích hợp GDĐP (Tiết 27): Bồi dưỡng tình yêu gia đình, quê hương và nếp sống văn hóa gia đình địa phương.',
      },
      {
        week: 'Tuần 31 – 35',
        lessonName: 'Chủ đề 8: Vui đón hè (Hát: Ngôi sao lấp lánh; Nhạc cụ: Trai-en-cô / Triangle) & Ôn tập, KT cuối năm',
        subLessonName:
          'T31: Hát Ngôi sao lấp lánh | T32: Ôn hát; Nhạc cụ Triangle | T33–34: Ôn tập cuối năm | T35: Kiểm tra và đánh giá cuối năm',
        periodAllocation: '5 tiết (Tiết 31–35)',
        periodsCount: 5,
        adjustedContent:
          'Hát nhịp nhàng bài Ngôi sao lấp lánh; thực hành gõ đệm bằng nhạc cụ Triangle và hoàn thành kiểm tra đánh giá cuối năm. Tích hợp AI (1.A2.2 ở Tiết 31): Nhận biết ứng dụng AI hỗ trợ con người khám phá thiên nhiên (ứng dụng ngắm sao thông minh nhận diện các chòm sao trên bầu trời).',
      },
    ],
  }),
];

/**
 * 1.9.2. MÔN ÂM NHẠC LỚP 2 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: 18 tiết (Chủ đề 1 – Chủ đề 4 + Ôn tập & Kiểm tra cuối HKI)
 * HKII: 17 tiết (Chủ đề 5 – Chủ đề 8 + Ôn tập & Kiểm tra cuối năm)
 */
export const GRADE2_AM_NHAC_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g2-an-hk1',
    grade: 2,
    subject: 'Âm nhạc',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'AN2-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3 & 4: Sắc màu âm thanh – Em yêu làn điệu dân ca – Mái trường thân yêu – Tuổi thơ & Ôn tập, KT cuối HKI (Tiết 1 – Tiết 18)',
    topicTitle:
      'Hát: Dàn nhạc trong vườn, Con chim chích chòe, Học sinh lớp 2 chăm ngoan, Chú chim nhỏ dễ thương; Đọc nhạc: Bài số 1, Bài số 2; Nhạc cụ: Song loan; TTÂN: Ước mơ của bạn Đô, Đàn bầu Việt Nam; Nghe nhạc: Vui đến trường, Múa sư tử thật là vui',
    adjustedContentSummary:
      'Hát đúng giai điệu các bài hát HKI lớp 2; đọc nhạc Bài số 1, Bài số 2 và gõ đệm bằng song loan. Tích hợp GDQP-AN, BVMT, NLS (An toàn số bảo vệ sức khỏe khi xem qua thiết bị số), GDĐP (liên hệ đàn bầu với đời sống âm nhạc truyền thống Huế), AI (2.C3.2 so sánh cách con người và AI phân loại vận động như robot múa sư tử) và STEM (làm nhạc cụ Ma-ra-cát bằng chai nhựa).',
    rawLessons: [
      {
        week: 'Tuần 1 – 4',
        lessonName: 'Chủ đề 1: Sắc màu âm thanh (Hát: Dàn nhạc trong vườn; TTÂN: Ước mơ của bạn Đô; Đọc nhạc: Bài số 1)',
        subLessonName:
          'T1: Hát Dàn nhạc trong vườn | T2: Ôn hát; TTÂN Ước mơ của bạn Đô | T3: Đọc nhạc Bài số 1 | T4: Ôn đọc nhạc Bài số 1; Ôn hát',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Hát trong sáng bài Dàn nhạc trong vườn; đọc đúng Bài đọc nhạc số 1. Tích hợp GDQP-AN & BVMT (Tiết 1): Bảo vệ môi trường thiên nhiên và tinh thần đoàn kết, kỷ luật. Tích hợp NLS (Tiết 2): An toàn số – giữ khoảng cách và bảo vệ sức khỏe mắt, tai khi xem qua thiết bị số.',
      },
      {
        week: 'Tuần 5 – 8',
        lessonName: 'Chủ đề 2: Em yêu làn điệu dân ca (Hát: Con chim chích chòe; Nhạc cụ: Song Loan; TTÂN: Đàn bầu Việt Nam)',
        subLessonName:
          'T5: Hát Con chim chích chòe | T6: Ôn hát; Nhạc cụ Song Loan | T7: TTÂN Đàn bầu Việt Nam | T8: Ôn tập bài hát Con chim chích chòe',
        periodAllocation: '4 tiết (Tiết 5–8)',
        periodsCount: 4,
        adjustedContent:
          'Hát vui tươi bài Con chim chích chòe (Bắc Kim Thang); biết gõ đệm bằng song loan và nhận biết âm sắc độc đáo của đàn bầu. Tích hợp GDĐP (Tiết 7): Liên hệ nhạc cụ đàn bầu với đời sống văn hóa âm nhạc truyền thống ở thành phố Huế.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 3: Mái trường thân yêu (Hát: Học sinh lớp 2 chăm ngoan; Đọc nhạc: Bài số 2; Nghe nhạc: Vui đến trường)',
        subLessonName:
          'T9: Hát Học sinh lớp 2 chăm ngoan | T10: Ôn hát; Đọc nhạc Bài số 2 | T11: Ôn đọc nhạc; Nghe nhạc Vui đến trường | T12: Ôn đọc nhạc Bài số 2; Ôn hát',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Hát nhịp nhàng bài Học sinh lớp 2 chăm ngoan; đọc đúng cao độ, trường độ Bài đọc nhạc số 2 và vận động theo bài nghe nhạc Vui đến trường.',
      },
      {
        week: 'Tuần 13 – 18',
        lessonName: 'Chủ đề 4: Tuổi thơ (Hát: Chú chim nhỏ dễ thương; Nghe nhạc: Múa sư tử thật là vui; Nhạc cụ gõ) & Ôn tập, KT cuối HKI',
        subLessonName:
          'T13: Hát Chú chim nhỏ dễ thương | T14: Ôn hát; Nghe nhạc Múa sư tử thật là vui | T15: Nhạc cụ gõ thể hiện hình tiết tấu | T16–17: Ôn tập cuối HKI | T18: Kiểm tra cuối HKI',
        periodAllocation: '6 tiết (Tiết 13–18)',
        periodsCount: 6,
        adjustedContent:
          'Hát bài Chú chim nhỏ dễ thương; thực hành gõ tiết tấu và hoàn thành kiểm tra cuối HKI. Tích hợp AI (2.C3.2 ở Tiết 14): So sánh cách con người và AI phân loại các loại hình vận động (ví dụ robot múa sư tử lập trình sẵn so với điệu múa linh hoạt của con người). Tích hợp STEM (Tiết 16–17): Làm nhạc cụ gõ Ma-ra-cát bằng chai nhựa tái chế.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g2-an-hk2',
    grade: 2,
    subject: 'Âm nhạc',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'AN2-HK2',
    chapterTitle:
      'Chủ đề 5, 6, 7 & 8: Mùa xuân – Gia đình yêu thương – Những con vật quanh em – Mùa hè vui & Ôn tập, KT cuối năm (Tiết 19 – Tiết 35)',
    topicTitle:
      'Hát: Hoa lá mùa xuân, Mẹ ơi có biết, Trang trại vui vẻ, Ngày hè vui; Đọc nhạc: Bài số 3, Bài số 4; TTÂN: Chú voi con ở Bản Đôn, Nhạc cụ Ma-ra-cát; Nghe nhạc: Ru con, Vũ khúc đàn gà con, Mùa hè ước mong',
    adjustedContentSummary:
      'Biểu diễn các bài hát HKII lớp 2; đọc nhạc Bài số 3, Bài số 4 và thực hành nhạc cụ gõ. Tích hợp GDQP-AN (tình yêu hòa bình, đoàn kết và trách nhiệm), AI (2.A2.1 nhận biết trợ lý ảo AI hỗ trợ tìm thông tin nhạc sĩ, bài hát), QCN (quyền trẻ em) và ATGT (an toàn giao thông dịp hè).',
    rawLessons: [
      {
        week: 'Tuần 19 – 22',
        lessonName: 'Chủ đề 5: Mùa xuân (Hát: Hoa lá mùa xuân; Đọc nhạc: Bài số 3; TTÂN: Câu chuyện về bài hát Chú voi con ở Bản Đôn)',
        subLessonName:
          'T19: Hát Hoa lá mùa xuân | T20: Ôn hát; Đọc nhạc Bài số 3 | T21: Ôn đọc nhạc; TTÂN Câu chuyện về bài hát Chú voi con ở Bản Đôn | T22: Ôn đọc nhạc Bài số 3; Ôn hát',
        periodAllocation: '4 tiết (Tiết 19–22)',
        periodsCount: 4,
        adjustedContent:
          'Hát tươi vui bài Hoa lá mùa xuân và đọc đúng Bài đọc nhạc số 3. Tích hợp GDQP-AN (Tiết 19): Giáo dục tình yêu hòa bình, quê hương đất nước và tinh thần đoàn kết. Tích hợp AI (2.A2.1 ở Tiết 21): Nhận biết thiết bị/ứng dụng có sử dụng AI (trợ lý ảo thông minh hỗ trợ tìm kiếm thông tin nhạc sĩ, bài hát).',
      },
      {
        week: 'Tuần 23 – 26',
        lessonName: 'Chủ đề 6: Gia đình yêu thương (Hát: Mẹ ơi có biết; Nghe nhạc: Ru con; TTÂN: Nhạc cụ Ma-ra-cát)',
        subLessonName:
          'T23: Hát Mẹ ơi có biết | T24: Ôn hát; Nghe nhạc Ru con | T25: TTÂN Nhạc cụ ma-ra-cát (maracas) | T26: Ôn tập bài hát Mẹ ơi có biết',
        periodAllocation: '4 tiết (Tiết 23–26)',
        periodsCount: 4,
        adjustedContent:
          'Hát tha thiết bài Mẹ ơi có biết; cảm nhận giai điệu ngọt ngào của bài Ru con và tìm hiểu nhạc cụ ma-ra-cát. Tích hợp QCN (Tiết 26): Giáo dục quyền trẻ em được yêu thương, chăm sóc và bổn phận hiếu thảo với cha mẹ.',
      },
      {
        week: 'Tuần 27 – 30',
        lessonName: 'Chủ đề 7: Những con vật quanh em (Hát: Trang trại vui vẻ; Đọc nhạc: Bài số 4; Nghe nhạc: Vũ khúc đàn gà con)',
        subLessonName:
          'T27: Hát Trang trại vui vẻ | T28: Ôn hát; Đọc nhạc Bài số 4 | T29: Ôn đọc nhạc; Nghe nhạc Vũ khúc đàn gà con | T30: Ôn đọc nhạc Bài số 4; Ôn hát',
        periodAllocation: '4 tiết (Tiết 27–30)',
        periodsCount: 4,
        adjustedContent:
          'Hát kết hợp mô phỏng âm thanh các con vật trong bài Trang trại vui vẻ; đọc đúng Bài đọc nhạc số 4. Tích hợp GDQP-AN (Tiết 27): Rèn tinh thần đoàn kết và trách nhiệm bảo vệ vật nuôi, môi trường.',
      },
      {
        week: 'Tuần 31 – 35',
        lessonName: 'Chủ đề 8: Mùa hè vui (Hát: Ngày hè vui; Nhạc cụ gõ; Nghe nhạc: Mùa hè ước mong) & Ôn tập, KT cuối năm',
        subLessonName:
          'T31: Hát Ngày hè vui | T32: Ôn hát; Nhạc cụ gõ thể hiện hình tiết tấu | T33: Nghe nhạc Mùa hè ước mong; Ôn hát | T34: Ôn tập cuối năm | T35: Kiểm tra cuối năm',
        periodAllocation: '5 tiết (Tiết 31–35)',
        periodsCount: 5,
        adjustedContent:
          'Hát sôi nổi bài Ngày hè vui; thực hành gõ đệm tiết tấu và hoàn thành bài kiểm tra cuối năm. Tích hợp ATGT (Tiết 31): Giáo dục ý thức chấp hành an toàn giao thông khi tham gia vui chơi, sinh hoạt mùa hè.',
      },
    ],
  }),
];

/**
 * 1.9.3. MÔN ÂM NHẠC LỚP 3 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: 18 tiết (Chủ đề 1 – Chủ đề 4 + Ôn tập & Kiểm tra cuối HKI)
 * HKII: 17 tiết (Chủ đề 5 – Chủ đề 8 + Ôn tập & Kiểm tra cuối năm)
 */
export const GRADE3_AM_NHAC_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g3-an-hk1',
    grade: 3,
    subject: 'Âm nhạc',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'AN3-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3 & 4: Lễ hội âm thanh – Em yêu Tổ quốc Việt Nam – Vui đến trường – Em yêu làn điệu dân ca & Ôn tập, KT cuối HKI (Tiết 1 – Tiết 18)',
    topicTitle:
      'Hát: Múa lân, Quốc ca Việt Nam, Vui đến trường, Khúc nhạc trên nương xa; Đọc nhạc: Bài số 1, Bài số 2; Nhạc cụ: Ma-ra-cat; TTÂN: Dàn trống dân tộc, Những khúc hát ru; Nghe nhạc: Ca ngợi Tổ quốc, Đi học, Suối đàn T’rưng',
    adjustedContentSummary:
      'Hát đúng giai điệu các bài hát HKI lớp 3, đặc biệt hát trang nghiêm Quốc ca Việt Nam; đọc nhạc Bài số 1, Bài số 2 và chơi nhạc cụ Ma-ra-cat. Tích hợp GDĐP (lễ hội truyền thống quê hương), AI (3.C5.2 AI nhận dạng và phân biệt âm sắc trống cái, trống con), GDQP-AN, ATGT (cổng trường an toàn giao thông), NLS và STEM (làm nhạc cụ gõ bằng vỏ chai nhựa, vỏ hộp sữa chua).',
    rawLessons: [
      {
        week: 'Tuần 1 – 4',
        lessonName: 'Chủ đề 1: Lễ hội âm thanh (Học hát: Múa lân; Đọc nhạc: Bài số 1; TTÂN: Dàn trống dân tộc)',
        subLessonName:
          'T1: Học hát Múa lân | T2: Ôn hát; Đọc nhạc Bài số 1 | T3: Ôn đọc nhạc; TTÂN Dàn trống dân tộc | T4: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Hát rộn ràng bài Múa lân; đọc đúng Bài đọc nhạc số 1 và tìm hiểu dàn trống dân tộc. Tích hợp GDĐP (Tiết 1): Giới thiệu lễ hội truyền thống và sinh hoạt văn hóa dân gian quê hương Huế. Tích hợp AI (3.C5.2 ở Tiết 3): Nhận biết cách AI nhận dạng và phân biệt âm sắc các loại nhạc cụ (như tiếng trống cái trầm hùng và tiếng trống con giòn giã).',
      },
      {
        week: 'Tuần 5 – 8',
        lessonName: 'Chủ đề 2: Em yêu Tổ quốc Việt Nam (Học bài hát: Quốc ca Việt Nam; Nghe nhạc: Ca ngợi Tổ quốc; Nhạc cụ: Ma-ra-cat)',
        subLessonName:
          'T5: Học bài hát Quốc ca Việt Nam | T6: Ôn hát Quốc ca; Nghe nhạc Ca ngợi Tổ quốc | T7: Nhạc cụ Ma-ra-cat (Maracas) | T8: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 5–8)',
        periodsCount: 4,
        adjustedContent:
          'Hát đúng giai điệu, lời ca và thể hiện tư thế nghiêm trang khi hát Quốc ca Việt Nam. Tích hợp GDQP-AN (Tiết 5): Bồi dưỡng lòng yêu nước, tự hào dân tộc. Tích hợp STEM (Tiết 7): Thực hành chế tạo nhạc cụ gõ Ma-ra-cat bằng vỏ chai nhựa và hạt đậu.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 3: Vui đến trường (Học bài hát: Vui đến trường; Đọc nhạc: Bài số 2; Nghe nhạc: Đi học)',
        subLessonName:
          'T9: Học bài hát Vui đến trường | T10: Đọc nhạc Bài số 2; Ôn hát | T11: Nghe nhạc Đi học; Ôn đọc nhạc Bài số 2 | T12: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Hát vui tươi bài Vui đến trường; đọc đúng Bài đọc nhạc số 2 và cảm nhận giai điệu bài Đi học. Tích hợp ATGT (Tiết 9): Giáo dục văn hóa giao thông và thực hiện "Cổng trường an toàn giao thông".',
      },
      {
        week: 'Tuần 13 – 18',
        lessonName: 'Chủ đề 4: Em yêu làn điệu dân ca (Học hát: Khúc nhạc trên nương xa; Nghe nhạc: Suối đàn T’rưng; TTÂN: Những khúc hát ru) & Ôn tập, KT cuối HKI',
        subLessonName:
          'T13: Học hát Khúc nhạc trên nương xa | T14: Nhạc cụ gõ; Ôn hát | T15: Nghe nhạc Suối đàn T’rưng; TTÂN Những khúc hát ru | T16: Vận dụng sáng tạo | T17: Ôn tập cuối HKI | T18: Kiểm tra đánh giá HKI',
        periodAllocation: '6 tiết (Tiết 13–18)',
        periodsCount: 6,
        adjustedContent:
          'Hát bài Khúc nhạc trên nương xa; cảm nhận âm sắc đàn T’rưng và những khúc hát ru truyền thống; hoàn thành đánh giá cuối HKI. Tích hợp NLS (Tiết 13): Tìm kiếm hình ảnh, thông tin về nhạc cụ gõ Tây Nguyên. Tích hợp STEM (Tiết 16): Làm nhạc cụ gõ tự tạo bằng vỏ hộp sữa chua.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g3-an-hk2',
    grade: 3,
    subject: 'Âm nhạc',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'AN3-HK2',
    chapterTitle:
      'Chủ đề 5, 6, 7 & 8: Đón xuân về – Đẹp mãi tuổi thơ – Âm nhạc nước ngoài – Vui đón hè & Ôn tập, KT cuối năm (Tiết 19 – Tiết 35)',
    topicTitle:
      'Hát: Đón xuân về, Đẹp mãi tuổi thơ, Con chim non, Hè về vui quá; Đọc nhạc: Bài số 3, Bài số 4; TTÂN: Giới thiệu đàn Vi-ô-lông, Cá heo với Âm nhạc; Nghe nhạc: Mùa xuân ơi, Ước mơ hồng, Valse Favorite',
    adjustedContentSummary:
      'Biểu diễn các bài hát HKII lớp 3; đọc nhạc Bài số 3, Bài số 4; tìm hiểu đàn Vi-ô-lông và âm nhạc nước ngoài. Tích hợp GDĐP (nét đẹp Tết cổ truyền Huế như bánh in, hoa giấy Thanh Tiên), NLS (khai thác phần mềm âm nhạc, tìm kiếm thông tin văn hóa Pháp) và AI (3.D2.2 hiểu rằng AI cũng có thể "học sai" nếu dữ liệu cung cấp không chính xác).',
    rawLessons: [
      {
        week: 'Tuần 19 – 22',
        lessonName: 'Chủ đề 5: Đón xuân về (Học bài hát: Đón xuân về; Đọc nhạc: Bài số 3; TTÂN: Đàn Vi-ô-lông; Nghe nhạc: Mùa xuân ơi)',
        subLessonName:
          'T19: Học hát Đón xuân về | T20: Ôn hát; Đọc nhạc Bài số 3 | T21: Ôn đọc nhạc; TTÂN Giới thiệu đàn Vi-ô-lông; Nghe nhạc Mùa xuân ơi | T22: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 19–22)',
        periodsCount: 4,
        adjustedContent:
          'Hát rộn ràng bài Đón xuân về; đọc đúng Bài đọc nhạc số 3 và nhận biết hình dáng, âm sắc đàn Vi-ô-lông. Tích hợp GDĐP (Tiết 19): Giới thiệu nét đẹp Tết cổ truyền Huế (bánh in, hoa giấy Thanh Tiên). Tích hợp NLS (Tiết 21): Quan sát hình ảnh và nghe âm thanh đàn vi-ô-lông qua phần mềm/trang web âm nhạc.',
      },
      {
        week: 'Tuần 23 – 26',
        lessonName: 'Chủ đề 6: Đẹp mãi tuổi thơ (Học bài hát: Đẹp mãi tuổi thơ; Nghe nhạc: Ước mơ hồng; Nhạc cụ gõ)',
        subLessonName:
          'T23: Học bài hát Đẹp mãi tuổi thơ | T24: Nghe nhạc Ước mơ hồng; Ôn hát | T25: Nhạc cụ thể hiện hình tiết tấu | T26: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 23–26)',
        periodsCount: 4,
        adjustedContent:
          'Hát trong sáng bài Đẹp mãi tuổi thơ; gõ đệm theo tiết tấu và vận động phụ họa nhịp nhàng.',
      },
      {
        week: 'Tuần 27 – 30',
        lessonName: 'Chủ đề 7: Âm nhạc nước ngoài (Học bài hát: Con chim non; Đọc nhạc: Bài số 4; Nghe nhạc: Valse Favorite)',
        subLessonName:
          'T27: Học bài hát Con chim non (Dân ca Pháp) | T28: Ôn hát; Ôn đọc nhạc Bài số 4 | T29: Nghe nhạc Van-xơ Pha-vô-rít; Đọc nhạc Bài số 4 | T30: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 27–30)',
        periodsCount: 4,
        adjustedContent:
          'Hát êm dịu bài Con chim non (Dân ca Pháp); đọc đúng Bài đọc nhạc số 4 và cảm nhận nhịp điệu Valse Favorite. Tích hợp NLS (Tiết 27): Tìm kiếm hình ảnh, thông tin đơn giản về đất nước Pháp trên internet dưới sự hướng dẫn của giáo viên.',
      },
      {
        week: 'Tuần 31 – 35',
        lessonName: 'Chủ đề 8: Vui đón hè (Học bài hát: Hè về vui quá; TTÂN: Cá heo với Âm nhạc) & Ôn tập, KT cuối năm',
        subLessonName:
          'T31: Học bài hát Hè về vui quá | T32: Nhạc cụ gõ; Ôn hát | T33: TTÂN Cá heo với Âm nhạc; Vận dụng – trải nghiệm | T34: Ôn tập cuối năm | T35: Kiểm tra và đánh giá cuối năm',
        periodAllocation: '5 tiết (Tiết 31–35)',
        periodsCount: 5,
        adjustedContent:
          'Hát sôi nổi bài Hè về vui quá; tìm hiểu câu chuyện Cá heo với Âm nhạc và hoàn thành đánh giá cuối năm. Tích hợp AI (3.D2.2 ở Tiết 33): Qua câu chuyện huấn luyện cá heo và huấn luyện máy tính, học sinh hiểu rằng AI cũng có thể "học sai" nếu dữ liệu con người cung cấp không tốt hoặc không chính xác.',
      },
    ],
  }),
];

/**
 * 1.9.4. MÔN ÂM NHẠC LỚP 4 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: 18 tiết (Chủ đề 1 – Chủ đề 4 + Ôn tập & Kiểm tra cuối HKI)
 * HKII: 17 tiết (Chủ đề 5 – Chủ đề 8 + Ôn tập & Kiểm tra cuối năm)
 */
export const GRADE4_AM_NHAC_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g4-an-hk1',
    grade: 4,
    subject: 'Âm nhạc',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'AN4-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3 & 4: Âm thanh ngày mới – Giai điệu quê hương – Thầy cô với chúng em – Vui đón Tết & Ôn tập, KT cuối HKI (Tiết 1 – Tiết 18)',
    topicTitle:
      'Hát: Chuông gió leng keng, Chim sáo, Nếu em là..., Vui đón tết; LTÂN: Kí hiệu ghi nhạc, Các hình nốt; Đọc nhạc: Bài số 1, Bài số 2; TTÂN: Hình thức biểu diễn ca hát, Đàn tranh, Pi-tơ và chó sói; Nghe nhạc: Lý ngựa ô, Điều mong ước tặng thầy',
    adjustedContentSummary:
      'Nắm vững kí hiệu ghi nhạc, các hình nốt; hát đúng các bài hát HKI lớp 4; đọc nhạc Bài số 1, Bài số 2 và chơi nhạc cụ gõ/giai điệu (recorder/kèn phím). Tích hợp NLS, AI (4.C2.1 AI phân loại hình thức biểu diễn đơn ca, song ca, tốp ca qua nhận diện số người), STEM (làm nhạc cụ gõ bằng vỏ hộp sữa chua) và GDQP-AN.',
    rawLessons: [
      {
        week: 'Tuần 1 – 4',
        lessonName: 'Chủ đề 1: Âm thanh ngày mới (LTÂN: Kí hiệu ghi nhạc; Đọc nhạc: Bài số 1; Hát: Chuông gió leng keng; TTÂN: Hình thức biểu diễn trong ca hát)',
        subLessonName:
          'T1: LTÂN Một số kí hiệu ghi nhạc; Đọc nhạc Bài số 1 | T2: Ôn đọc nhạc; Hát Chuông gió leng keng | T3: Ôn hát; TTÂN Hình thức biểu diễn trong ca hát | T4: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết khuông nhạc, khóa Son, tên nốt; đọc nhạc Bài số 1 và hát bài Chuông gió leng keng. Tích hợp NLS (Tiết 2): Tìm kiếm thông tin về nhạc sĩ Lê Vinh Phúc và bài hát Chuông gió leng keng trên Google. Tích hợp AI (4.C2.1 ở Tiết 3): Nhận biết cách AI phân loại hình thức biểu diễn (đơn ca, song ca, tốp ca) thông qua nhận diện số lượng người trong ảnh/video.',
      },
      {
        week: 'Tuần 5 – 8',
        lessonName: 'Chủ đề 2: Giai điệu quê hương (Hát: Chim sáo; Nhạc cụ gõ/giai điệu; TTÂN: Giới thiệu đàn tranh; Nghe nhạc: Lý ngựa ô)',
        subLessonName:
          'T5: Hát Chim sáo (Dân ca Khơ-me) | T6: Ôn hát; Nhạc cụ gõ/giai điệu | T7: TTÂN Giới thiệu đàn tranh; Nghe nhạc Lý ngựa ô | T8: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 5–8)',
        periodsCount: 4,
        adjustedContent:
          'Hát rộn ràng bài dân ca Khơ-me Chim sáo; nhận biết âm sắc đàn tranh và dân ca Lý ngựa ô. Tích hợp STEM (Tiết 8): Chế tạo nhạc cụ gõ tự tạo bằng vỏ hộp sữa chua.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 3: Thầy cô với chúng em (LTÂN: Các hình nốt; Đọc nhạc: Bài số 2; Hát: Nếu em là...; Nghe nhạc: Điều mong ước tặng thầy)',
        subLessonName:
          'T9: LTÂN Giới thiệu các hình nốt; Đọc nhạc Bài số 2 | T10: Ôn đọc nhạc; Hát Nếu em là... | T11: Ôn hát; Nghe nhạc Điều mong ước tặng thầy | T12: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết hình nốt trắng, nốt đen, nốt móc đơn; đọc nhạc Bài số 2 và hát tha thiết bài Nếu em là... Tích hợp GDQP-AN (Tiết 10): Giáo dục tình yêu quê hương, đất nước và niềm tự hào dân tộc.',
      },
      {
        week: 'Tuần 13 – 18',
        lessonName: 'Chủ đề 4: Vui đón Tết (Hát: Vui đón tết; Nhạc cụ; TTÂN: Hình tượng âm nhạc qua câu chuyện Pi-tơ và chó sói) & Ôn tập, KT cuối HKI',
        subLessonName:
          'T13: Hát Vui đón tết | T14: Ôn hát; Nhạc cụ gõ/giai điệu | T15: TTÂN Hình tượng âm nhạc qua câu chuyện Pi-tơ và chó sói | T16: Vận dụng sáng tạo | T17: Ôn tập cuối HKI | T18: Kiểm tra cuối HKI',
        periodAllocation: '6 tiết (Tiết 13–18)',
        periodsCount: 6,
        adjustedContent:
          'Hát rộn ràng bài Vui đón tết; nhận biết tính cách nhân vật qua âm sắc nhạc cụ trong truyện âm nhạc Pi-tơ và chó sói; hoàn thành kiểm tra cuối HKI.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g4-an-hk2',
    grade: 4,
    subject: 'Âm nhạc',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'AN4-HK2',
    chapterTitle:
      'Chủ đề 5, 6, 7 & 8: Thiên nhiên tươi đẹp – Tình bạn tuổi thơ – Âm nhạc nước ngoài – Chào mùa hè & Ôn tập, KT cuối năm (Tiết 19 – Tiết 35)',
    topicTitle:
      'Hát: Hạt mưa kể chuyện, Tình bạn tuổi thơ, Miền quê em, Em yêu mùa hè quê em; LTÂN: Dấu lặng; Đọc nhạc: Bài số 3, Bài số 4; TTÂN: Nhạc sĩ Lưu Hữu Phước, Kèn trumpet; Nghe nhạc: Không gian xanh, Khúc nhạc mở đầu, Khúc ca vào hè',
    adjustedContentSummary:
      'Nhận biết dấu lặng đen, dấu lặng đơn; đọc nhạc Bài số 3, Bài số 4 và biểu diễn các bài hát HKII lớp 4. Tích hợp AI (4.A2.1 AI hỗ trợ giám sát và bảo vệ môi trường xanh, phân tích mật độ rừng, dự báo lũ), GDQP-AN (bản đồ hành chính Việt Nam, chủ quyền Hoàng Sa và Trường Sa, bảo vệ môi trường biển đảo), NLS và ATGT.',
    rawLessons: [
      {
        week: 'Tuần 19 – 22',
        lessonName: 'Chủ đề 5: Thiên nhiên tươi đẹp (LTÂN: Dấu lặng; Đọc nhạc: Bài số 3; Hát: Hạt mưa kể chuyện; Nghe nhạc: Không gian xanh)',
        subLessonName:
          'T19: LTÂN Dấu lặng; Đọc nhạc Bài số 3 | T20: Ôn đọc nhạc; Hát Hạt mưa kể chuyện | T21: Ôn hát; Nghe nhạc Không gian xanh | T22: Vận dụng - sáng tạo',
        periodAllocation: '4 tiết (Tiết 19–22)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết dấu lặng trong bản nhạc; đọc đúng Bài đọc nhạc số 3 và hát sinh động bài Hạt mưa kể chuyện. Tích hợp AI (4.A2.1 ở Tiết 21): Nhận biết ứng dụng AI hỗ trợ con người giám sát và bảo vệ môi trường xanh (nhận diện cây xanh, phân tích mật độ rừng, dự báo lũ lụt).',
      },
      {
        week: 'Tuần 23 – 26',
        lessonName: 'Chủ đề 6: Tình bạn tuổi thơ (Hát: Tình bạn tuổi thơ; TTÂN: Nhạc sĩ Lưu Hữu Phước và bài hát Reo vang bình minh; Nhạc cụ)',
        subLessonName:
          'T23: Hát Tình bạn tuổi thơ | T24: Ôn hát; TTÂN Nhạc sĩ Lưu Hữu Phước & Reo vang bình minh | T25: Nhạc cụ gõ/giai điệu | T26: Vận dụng sáng tạo',
        periodAllocation: '4 tiết (Tiết 23–26)',
        periodsCount: 4,
        adjustedContent:
          'Hát trong sáng bài Tình bạn tuổi thơ; tìm hiểu cuộc đời, sự nghiệp nhạc sĩ Lưu Hữu Phước và thực hành nhạc cụ gõ/giai điệu.',
      },
      {
        week: 'Tuần 27 – 30',
        lessonName: 'Chủ đề 7: Âm nhạc nước ngoài (LTÂN: Ôn tập; Đọc nhạc: Bài số 4; Hát: Miền quê em; TTÂN: Kèn trumpet; Nghe nhạc: Khúc nhạc mở đầu)',
        subLessonName:
          'T27: LTÂN Ôn tập; Đọc nhạc Bài số 4 | T28: Ôn đọc nhạc; Hát Miền quê em | T29: Ôn hát; TTÂN Giới thiệu kèn trumpet; Nghe nhạc Khúc nhạc mở đầu (U-vec-tuya) | T30: Vận dụng - sáng tạo',
        periodAllocation: '4 tiết (Tiết 27–30)',
        periodsCount: 4,
        adjustedContent:
          'Đọc đúng Bài đọc nhạc số 4; hát bài Miền quê em và nhận biết âm sắc kèn trumpet. Tích hợp GDQP-AN (Tiết 28): Giới thiệu bản đồ hành chính Việt Nam, khẳng định chủ quyền quần đảo Hoàng Sa và Trường Sa, giáo dục ý thức bảo vệ môi trường biển đảo. Tích hợp NLS (Tiết 29): Tìm kiếm, khai thác học liệu số và bảo vệ sức khỏe thính giác, thị giác.',
      },
      {
        week: 'Tuần 31 – 35',
        lessonName: 'Chủ đề 8: Chào mùa hè (Hát: Em yêu mùa hè quê em; Nhạc cụ; Nghe nhạc: Khúc ca vào hè) & Ôn tập, KT cuối năm',
        subLessonName:
          'T31: Hát Em yêu mùa hè quê em | T32: Ôn hát; Nhạc cụ gõ/giai điệu | T33: Nghe nhạc Khúc ca vào hè; Vận dụng - sáng tạo | T34: Ôn tập cuối năm | T35: Kiểm tra cuối năm',
        periodAllocation: '5 tiết (Tiết 31–35)',
        periodsCount: 5,
        adjustedContent:
          'Hát tươi vui bài Em yêu mùa hè quê em; thực hành nhạc cụ và hoàn thành đánh giá cuối năm học. Tích hợp ATGT (Tiết 31): Đảm bảo an toàn giao thông khi vui chơi, du lịch hè. Tích hợp NLS (Tiết 32): Thực hiện tìm kiếm trực tuyến đơn giản và rèn kĩ năng an sinh số.',
      },
    ],
  }),
];

/**
 * 1.9.5. MÔN ÂM NHẠC LỚP 5 (35 TUẦN x 1 TIẾT = 35 TIẾT/NĂM)
 * HKI: 18 tiết (Chủ đề 1 – Chủ đề 4 + Ôn tập & Kiểm tra đánh giá cuối HKI)
 * HKII: 17 tiết (Chủ đề 5 – Chủ đề 8 + Ôn tập & Kiểm tra đánh giá cuối năm)
 */
export const GRADE5_AM_NHAC_TOPICS: CurriculumTopic[] = [
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g5-an-hk1',
    grade: 5,
    subject: 'Âm nhạc',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'AN5-HK1',
    chapterTitle:
      'Chủ đề 1, 2, 3 & 4: Khúc ca ngày mới – Giai điệu quê hương – Bay vào tương lai – Chào mùa xuân đến & Ôn tập, ĐG cuối HKI (Tiết 1 – Tiết 18)',
    topicTitle:
      'Hát: Chim sơn ca, Lý đất giồng, Bay vào tương lai, Duyên dáng mùa xuân; LTÂN: Trọng âm, phách, vạch nhịp, ô nhịp, Nhịp 2/4; Đọc nhạc: Bài số 1, Bài số 2; TTÂN: Hình thức biểu diễn nhạc cụ, Đàn nhị, Bản Xô-nát ánh trăng; Nghe nhạc: Đường đến trường vui lắm',
    adjustedContentSummary:
      'Nắm vững lý thuyết trọng âm, phách, ô nhịp, nhịp 2/4; đọc nhạc Bài số 1, Bài số 2 và biểu diễn các bài hát HKI lớp 5. Tích hợp AI (5.C4.2 AI phân loại hình thức biểu diễn nhạc cụ; 5.A2.1 AI chỉ hỗ trợ chứ không thay thế tư duy và cảm xúc của thiên tài âm nhạc như Beethoven), GDQP-AN (chủ quyền biển đảo), NLS (YouTube Kids, quy tắc bảo vệ mắt 30–40cm) và STEM (làm trống con bằng vỏ hộp bánh).',
    rawLessons: [
      {
        week: 'Tuần 1 – 4',
        lessonName: 'Chủ đề 1: Khúc ca ngày mới (LTÂN: Trọng âm, phách, vạch nhịp, ô nhịp; Đọc nhạc: Bài số 1; Hát: Chim sơn ca; TTÂN: Một số hình thức biểu diễn nhạc cụ)',
        subLessonName:
          'T1: LTÂN Trọng âm, phách, vạch nhịp, ô nhịp; Đọc nhạc Bài số 1 | T2: Ôn đọc nhạc; Học hát Chim sơn ca | T3: Ôn hát; TTÂN Một số hình thức biểu diễn nhạc cụ | T4: Vận dụng - Sáng tạo',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết trọng âm, phách, vạch nhịp, ô nhịp; đọc nhạc Bài số 1 và hát trong sáng bài Chim sơn ca. Tích hợp AI (5.C4.2 ở Tiết 3): Nhận biết cách AI hỗ trợ phân loại hình thức biểu diễn nhạc cụ (độc tấu, song tấu, hòa tấu) dựa trên nhận diện hình ảnh số lượng người và nhạc cụ.',
      },
      {
        week: 'Tuần 5 – 8',
        lessonName: 'Chủ đề 2: Giai điệu quê hương (Học bài hát: Lý đất giồng; Nhạc cụ tiết tấu & giai điệu; TTÂN: Đàn nhị)',
        subLessonName:
          'T5: Học bài hát Lý đất giồng (Dân ca Nam Bộ) | T6: Ôn hát; Nhạc cụ tiết tấu và giai điệu | T7: Ôn nhạc cụ; TTÂN Đàn nhị | T8: Vận dụng - Sáng tạo',
        periodAllocation: '4 tiết (Tiết 5–8)',
        periodsCount: 4,
        adjustedContent:
          'Hát đúng tính chất vui tươi, nhịp nhàng của dân ca Nam Bộ Lý đất giồng; thực hành nhạc cụ và nhận biết âm sắc đàn nhị.',
      },
      {
        week: 'Tuần 9 – 12',
        lessonName: 'Chủ đề 3: Bay vào tương lai (LTÂN: Nhịp 2/4; Đọc nhạc: Bài số 2; Hát: Bay vào tương lai; Nghe nhạc: Đường đến trường vui lắm)',
        subLessonName:
          'T9: LTÂN Nhịp 2/4; Đọc nhạc Bài số 2 | T10: Ôn đọc nhạc; Học hát Bay vào tương lai | T11: Ôn hát; Nghe nhạc Đường đến trường vui lắm | T12: Vận dụng - Sáng tạo',
        periodAllocation: '4 tiết (Tiết 9–12)',
        periodsCount: 4,
        adjustedContent:
          'Hiểu ý nghĩa số chỉ nhịp 2/4; đọc đúng Bài đọc nhạc số 2 và hát bài Bay vào tương lai. Tích hợp GDQP-AN (Tiết 10): Bồi dưỡng tình yêu quê hương, đất nước và ý thức bảo vệ chủ quyền biển đảo. Tích hợp NLS (Tiết 11): Tìm kiếm bài hát trên kênh giáo dục chính thống (YouTube Kids) và thực hiện quy tắc bảo vệ mắt (giữ khoảng cách 30–40cm).',
      },
      {
        week: 'Tuần 13 – 18',
        lessonName: 'Chủ đề 4: Chào mùa xuân đến (Hát: Duyên dáng mùa xuân; TTÂN: Câu chuyện về bản Xô-nát ánh trăng) & Ôn tập, đánh giá cuối HKI',
        subLessonName:
          'T13: Học hát Duyên dáng mùa xuân | T14: Nhạc cụ; Ôn hát | T15: TTÂN Câu chuyện về bản Xô-nát ánh trăng; Ôn nhạc cụ | T16: Vận dụng – sáng tạo | T17: Ôn tập cuối HKI | T18: Kiểm tra đánh giá cuối HKI',
        periodAllocation: '6 tiết (Tiết 13–18)',
        periodsCount: 6,
        adjustedContent:
          'Hát tươi vui bài Duyên dáng mùa xuân; cảm nhận giá trị nhân văn của bản Xô-nát ánh trăng và hoàn thành đánh giá cuối HKI. Tích hợp GDQP-AN (Tiết 13): Yêu thiên nhiên, đất nước, giữ gìn chủ quyền biển đảo. Tích hợp AI (5.A2.1 ở Tiết 15): Hiểu mục đích của AI là hỗ trợ chứ không thay thế vai trò, tư duy và cảm xúc chân thật của các thiên tài âm nhạc như Beethoven. Tích hợp STEM (Tiết 16): Làm nhạc cụ gõ trống con bằng vỏ hộp bánh.',
      },
    ],
  }),
  buildPrimaryArtMusicTopic({
    id: 'nda-2026-g5-an-hk2',
    grade: 5,
    subject: 'Âm nhạc',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'AN5-HK2',
    chapterTitle:
      'Chủ đề 5, 6, 7 & 8: Thiên nhiên tươi đẹp – Tình bạn tuổi thơ – Âm nhạc nước ngoài – Khúc ca hè về & Ôn tập cuối năm (Tiết 19 – Tiết 35)',
    topicTitle:
      'Hát: Em đi giữa biển vàng, Tuổi hồng ơi, Đất nước tươi đẹp sao, Khúc ca hè về; LTÂN: Nhịp 3/4; Đọc nhạc: Bài số 3, Bài số 4; TTÂN: Nhạc sĩ Bùi Đình Thảo, Nhạc cụ gõ nước ngoài; Nghe nhạc: Ngôi sao sáng, Vũ điệu Tây Ban Nha, Khúc ca bốn mùa',
    adjustedContentSummary:
      'Hiểu nhịp 3/4; đọc nhạc Bài số 3, Bài số 4 và biểu diễn các bài hát HKII lớp 5. Tích hợp GDQP-AN (sự đóng góp của chiến sĩ QĐND, CAND giữ bình yên quê hương; chủ quyền Hoàng Sa, Trường Sa), AI (5.A3.1 sử dụng AI dịch thuật/tìm kiếm văn hóa Malaysia an toàn), NLS và GDĐP (vẻ đẹp thiên nhiên, văn hóa Thành phố Huế trong mùa hè).',
    rawLessons: [
      {
        week: 'Tuần 19 – 22',
        lessonName: 'Chủ đề 5: Thiên nhiên tươi đẹp (LTÂN: Nhịp 3/4; Đọc nhạc: Bài số 3; TTÂN: Nhạc sĩ Bùi Đình Thảo & Sách bút thân yêu ơi; Hát: Em đi giữa biển vàng)',
        subLessonName:
          'T19: LTÂN Nhịp 3/4; Đọc nhạc Bài số 3 | T20: TTÂN Nhạc sĩ Bùi Đình Thảo & Sách bút thân yêu ơi; Ôn đọc nhạc | T21: Học hát Em đi giữa biển vàng | T22: Ôn hát; Vận dụng - Sáng tạo',
        periodAllocation: '4 tiết (Tiết 19–22)',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết tính chất nhịp nhàng của nhịp 3/4; đọc nhạc Bài số 3 và hát thiết tha bài Em đi giữa biển vàng. Tích hợp GDQP-AN (Tiết 21): Ca ngợi vẻ đẹp bình yên, ấm no của quê hương và biết ơn sự đóng góp của các chiến sĩ QĐND, CAND bảo vệ cuộc sống thanh bình.',
      },
      {
        week: 'Tuần 23 – 26',
        lessonName: 'Chủ đề 6: Tình bạn tuổi thơ (Học bài hát: Tuổi hồng ơi; Nhạc cụ tiết tấu & giai điệu; Nghe nhạc: Ngôi sao sáng)',
        subLessonName:
          'T23: Học bài hát Tuổi hồng ơi | T24: Ôn hát; Nhạc cụ tiết tấu và giai điệu | T25: Ôn nhạc cụ; Nghe nhạc Ngôi sao sáng | T26: Vận dụng - Sáng tạo',
        periodAllocation: '4 tiết (Tiết 23–26)',
        periodsCount: 4,
        adjustedContent:
          'Hát vui tươi bài Tuổi hồng ơi; thực hành gõ đệm và chơi nhạc cụ giai điệu theo bài học.',
      },
      {
        week: 'Tuần 27 – 30',
        lessonName: 'Chủ đề 7: Âm nhạc nước ngoài (LTÂN: Ôn tập; Đọc nhạc: Bài số 4; Hát: Đất nước tươi đẹp sao; TTÂN: Nhạc cụ gõ nước ngoài; Nghe nhạc: Vũ điệu Tây Ban Nha)',
        subLessonName:
          'T27: LTÂN Ôn tập; Đọc nhạc Bài số 4 | T28: Học hát Đất nước tươi đẹp sao (Nhạc Malaysia); Ôn đọc nhạc | T29: TTÂN Nhạc cụ gõ nước ngoài; Nghe nhạc Vũ điệu Tây Ban Nha (E-xơ-pa-nha Ca-ni); Ôn hát | T30: Vận dụng - Sáng tạo',
        periodAllocation: '4 tiết (Tiết 27–30)',
        periodsCount: 4,
        adjustedContent:
          'Đọc đúng Bài đọc nhạc số 4; hát bài Đất nước tươi đẹp sao và tìm hiểu nhạc cụ gõ nước ngoài (trống التمباني timpani, bộ trống dàn, castanets). Tích hợp GDQP-AN (Tiết 28): Liên hệ chủ quyền biển đảo Hoàng Sa, Trường Sa qua hình ảnh "Biển xanh dập dờn cánh buồm". Tích hợp AI (5.A3.1 ở Tiết 28): Sử dụng công cụ AI dịch thuật/tìm kiếm văn hóa Malaysia an toàn, hiệu quả. Tích hợp NLS (Tiết 29): Tìm kiếm hình ảnh, âm thanh bộ trống nước ngoài trên Google và lưu vào thư mục học tập.',
      },
      {
        week: 'Tuần 31 – 35',
        lessonName: 'Chủ đề 8: Khúc ca hè về (Học bài hát: Khúc ca hè về; Nhạc cụ; Nghe nhạc: Khúc ca bốn mùa) & Ôn tập, KT cuối năm',
        subLessonName:
          'T31: Học bài hát Khúc ca hè về | T32: Ôn hát; Nhạc cụ tiết tấu và giai điệu | T33: Nghe nhạc Khúc ca bốn mùa; Vận dụng - Sáng tạo | T34: Ôn tập cuối năm | T35: Kiểm tra và đánh giá cuối năm',
        periodAllocation: '5 tiết (Tiết 31–35)',
        periodsCount: 5,
        adjustedContent:
          'Hát rộn ràng bài Khúc ca hè về; cảm nhận bài Nghe nhạc Khúc ca bốn mùa và hoàn thành kiểm tra đánh giá cuối năm học. Tích hợp GDĐP (Tiết 31): Liên hệ vẻ đẹp thiên nhiên, lễ hội và văn hóa Thành phố Huế trong mùa hè.',
      },
    ],
  }),
];
