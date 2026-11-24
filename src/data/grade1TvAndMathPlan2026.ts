import {
  CognitiveLevelCode,
  CurriculumLessonItem,
  CurriculumTopic,
  EducationLevelId,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_G1_SOURCE_DOC =
  'KHGD Khối lớp 1 – Tổ 1-2-3 Trường TH&THCS Nguyễn Đình Anh (Đan Điền, ngày 28/8/2026)';

export interface Grade1LessonInput {
  id?: string;
  week: string;
  lessonName: string;
  subLessonName?: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
}

export function buildGrade1Topic(params: {
  id: string;
  subject: string;
  semester: 'HK1' | 'HK2' | 'CA_NAM';
  weekRange: string;
  totalPeriods?: number;
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  adjustedContentSummary?: string;
  rawLessons?: Grade1LessonInput[];
  lessons?: Grade1LessonInput[];
}): CurriculumTopic {
  const inputLessons = params.rawLessons ?? params.lessons ?? [];
  const lessons: CurriculumLessonItem[] = inputLessons.map((item, idx) => ({
    id: item.id || `${params.id}-ls-${idx + 1}`,
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

  for (const item of inputLessons) {
    const key = item.lessonName.trim();
    const existing = groupedByLesson.get(key);
    if (!existing) {
      groupedByLesson.set(key, {
        week: item.week,
        lessonName: key,
        totalPeriods: item.periodsCount,
        periodDetails: [
          item.subLessonName
            ? `${item.subLessonName} (${item.periodAllocation})`
            : item.periodAllocation,
        ],
        contents: item.adjustedContent ? [item.adjustedContent] : [],
      });
    } else {
      existing.totalPeriods += item.periodsCount;
      existing.periodDetails.push(
        item.subLessonName
          ? `${item.subLessonName} (${item.periodAllocation})`
          : item.periodAllocation
      );
      if (
        item.adjustedContent &&
        !existing.contents.includes(item.adjustedContent)
      ) {
        existing.contents.push(item.adjustedContent);
      }
    }
  }

  const levels = [
    CognitiveLevelCode.PRIMARY_MUC_1,
    CognitiveLevelCode.PRIMARY_MUC_2,
    CognitiveLevelCode.PRIMARY_MUC_3,
  ];

  const learningOutcomes = Array.from(groupedByLesson.values()).map(
    (grp, idx) => {
      const combinedContent =
        grp.contents.length > 0
          ? grp.contents.join(' | ')
          : `Thực hiện đầy đủ yêu cầu cần đạt của bài học "${grp.lessonName}" theo chương trình GDPT 2018 (Bộ sách Kết nối tri thức với cuộc sống).`;
      return {
        code: `${params.chapterCode}-B${idx + 1}`,
        description: `${grp.lessonName} [${grp.periodDetails.join('; ')}]: ${combinedContent}`,
        suggestedCognitiveLevel: levels[idx % levels.length],
        lessonName: grp.lessonName,
        duration: `${grp.totalPeriods} tiết`,
        week: `Tuần ${grp.week}`,
      };
    }
  );

  const computedTotalPeriods =
    params.totalPeriods ??
    inputLessons.reduce((sum, item) => sum + (item.periodsCount || 0), 0);

  const computedSummary =
    params.adjustedContentSummary ??
    inputLessons
      .map((item) => item.adjustedContent)
      .filter(Boolean)
      .slice(0, 2)
      .join(' | ');

  return {
    id: params.id,
    levelId: EducationLevelId.PRIMARY,
    grade: 1,
    subject: params.subject,
    semester: params.semester,
    weekRange: params.weekRange,
    totalPeriods: computedTotalPeriods,
    durationText: `${computedTotalPeriods} tiết (${params.weekRange})`,
    chapterCode: params.chapterCode,
    chapterTitle: params.chapterTitle,
    topicTitle: params.topicTitle,
    adjustedContentSummary: computedSummary,
    sourceDocument: NDA_G1_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

/**
 * 1. MÔN TIẾNG VIỆT LỚP 1 (420 TIẾT / 35 TUẦN – 12 TIẾT/TUẦN)
 * HKI: 18 tuần x 12 tiết/tuần = 216 tiết (Làm quen & Học vần Bài 1–83 + Đánh giá cuối HKI)
 * HKII: 17 tuần x 12 tiết/tuần = 204 tiết (Luyện tập tổng hợp Chủ đề 1–8 + Ôn tập & Đánh giá cuối năm)
 */
export const GRADE1_TIENG_VIET_TOPICS: CurriculumTopic[] = [
  buildGrade1Topic({
    id: 'nda-2026-g1-tv-hk1-p1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 4',
    totalPeriods: 48,
    chapterCode: 'TV1-HV1',
    chapterTitle: 'Học vần – Phần 1: Làm quen & Các âm chữ đầu tiên (Tuần 1 – Tuần 4, Bài 1 – Bài 15)',
    topicTitle: 'Làm quen với trường lớp, các nét cơ bản, chữ số, dấu thanh; Bài 1–15: A a, B b, C c, E e, Ê ê, O o, Ô ô, D d, Đ đ, Ơ ơ, I i, K k, H h, L l, U u, Ư ư, Ch ch, Kh kh',
    adjustedContentSummary:
      'Làm quen với trường lớp, tư thế đọc-viết-nói-nghe và các nét cơ bản; đọc, viết các âm chữ và dấu thanh đầu tiên. Tích hợp NLS (4.3.CB1a, 2.3.CB1a), QCN, ATGT, BVMT, Lí tưởng CM - đạo đức - lối sống.',
    lessons: [
      {
        week: '1',
        lessonName: 'Tuần 1: Làm quen với trường lớp, tư thế đọc viết nói nghe, các nét cơ bản, bảng chữ cái, dấu thanh',
        subLessonName: 'Làm quen trường lớp, bạn bè, đồ dùng học tập (2t) | Tư thế đọc viết nói nghe (2t) | Các nét cơ bản, chữ số, bảng chữ cái, dấu thanh (6t) | Ôn luyện viết nét cơ bản, đọc âm (2t)',
        periodAllocation: '12 tiết (Tiết 1–12)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp NLS 4.3.CB1a: HS nhận biết tivi, máy chiếu, máy tính bảng trong lớp là thiết bị hỗ trợ học tập; biết chỉ sử dụng khi GV cho phép, không tự ý chạm vào thiết bị. Tích hợp Quyền con người (QCN): Giáo dục quyền được chăm sóc sức khỏe và học tập trong điều kiện an toàn.',
      },
      {
        week: '2',
        lessonName: 'Bài 1 – Bài 5: A a; B b; C c, dấu huyền, dấu sắc; E e, Ê ê; Ôn tập và kể chuyện',
        subLessonName: 'Bài 1: A a (2t) | Bài 2: B b (2t) | Bài 3: C c / \' (2t) | Bài 4: E e, Ê ê (2t) | Bài 5: Ôn tập và kể chuyện (2t) | Thực hành củng cố tuần 2 (2t)',
        periodAllocation: '12 tiết (Tiết 13–24)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp NLS 2.3.CB1a: HS biết điện thoại/video call là công cụ số giúp chào hỏi, giao tiếp với người thân khi ở xa. Tích hợp Lý tưởng cách mạng, đạo đức, lối sống: HS biết kính yêu ông bà, biết nói lời cảm ơn khi được quan tâm, chăm sóc; tự giác giúp đỡ việc nhà phù hợp khả năng.',
      },
      {
        week: '3',
        lessonName: 'Bài 6 – Bài 10: O o, dấu hỏi; Ô ô, dấu nặng; D d, Đ đ; Ơ ơ, dấu ngã; Ôn tập và kể chuyện',
        subLessonName: 'Bài 6: O o ? (2t) | Bài 7: Ô ô . (2t) | Bài 8: D d, Đ đ (2t) | Bài 9: Ơ ơ ~ (2t) | Bài 10: Ôn tập và kể chuyện (2t) | Thực hành củng cố tuần 3 (2t)',
        periodAllocation: '12 tiết (Tiết 25–36)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp ATGT: Biết đi bộ trên vỉa hè, đi sát lề đường khi không có vỉa hè và quan sát an toàn khi tham gia giao thông. Tích hợp BVMT: Giáo dục HS biết giữ môi trường biển sạch đẹp. Tích hợp LTCM, ĐĐ, LS: Qua truyện "Đàn kiến con ngoan ngoãn", biết quan tâm, lễ phép, đoàn kết với bạn bè.',
      },
      {
        week: '4',
        lessonName: 'Bài 11 – Bài 15: I i, K k; H h, L l; U u, Ư ư; Ch ch, Kh kh; Ôn tập và kể chuyện',
        subLessonName: 'Bài 11: I i, K k (2t) | Bài 12: H h, L l (2t) | Bài 13: U u, Ư ư (2t) | Bài 14: Ch ch, Kh kh (2t) | Bài 15: Ôn tập và kể chuyện (2t) | Thực hành củng cố tuần 4 (2t)',
        periodAllocation: '12 tiết (Tiết 37–48)',
        periodsCount: 12,
        adjustedContent:
          'Đọc, viết đúng các âm chữ i, k, h, l, u, ư, ch, kh và các tiếng, từ, câu ứng dụng; nắm được quy tắc chính tả k + i, e, ê.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-tv-hk1-p2',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 9',
    totalPeriods: 60,
    chapterCode: 'TV1-HV2',
    chapterTitle: 'Học vần – Phần 2: Phụ âm ghép & Vần kết thúc bằng n, m, i, y (Tuần 5 – Tuần 9, Bài 16 – Bài 40)',
    topicTitle: 'Bài 16–30: M, N, G, Gi, Gh, Nh, Ng, Ngh, R, S, T, Tr, Th, ia, ua, ưa, Ph, Qu, V, X, Y; Bài 31–40: an, ăn, ân, on, ôn, ơn, en, ên, in, un, am, ăm, âm, om, ôm, ơm, em, êm, im, um, ai, ay, ây, oi, ôi, ơi',
    adjustedContentSummary:
      'Đọc, viết các phụ âm ghép và vần kết thúc bằng n, m, i, y; nắm vững quy tắc chính tả g/gh, ng/ngh. Tích hợp NLS (1.1.CB1a), QPAN (Cột cờ Hà Nội/Lũng Cú), QCN, Lí tưởng CM - đạo đức - lối sống.',
    lessons: [
      {
        week: '5',
        lessonName: 'Bài 16 – Bài 20: M m, N n; G g, Gi gi; Gh gh, Nh nh; Ng ng, Ngh ngh; Ôn tập và kể chuyện',
        subLessonName: 'Bài 16 (2t) | Bài 17 (2t) | Bài 18 (2t) | Bài 19 (2t) | Bài 20 (2t) | Thực hành củng cố tuần 5 (2t)',
        periodAllocation: '12 tiết (Tiết 49–60)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp NLS 1.1.CB1a: GV trải nghiệm tìm kiếm Google ảnh "vườn bách thú" cho HS quan sát, gọi tên con vật. Tích hợp LTCM, ĐĐ, LS: Qua truyện "Cô chủ không biết quý tình bạn", giáo dục HS biết trân trọng tình bạn, đối xử chân thành.',
      },
      {
        week: '6',
        lessonName: 'Bài 21 – Bài 25: R r, S s; T t, Tr tr; Th th, ia; ua, ưa; Ôn tập và kể chuyện',
        subLessonName: 'Bài 21 (2t) | Bài 22 (2t) | Bài 23 (2t) | Bài 24 (2t) | Bài 25 (2t) | Thực hành củng cố tuần 6 (2t)',
        periodAllocation: '12 tiết (Tiết 61–72)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp Quốc phòng và an ninh (QPAN): Qua hình ảnh Cột cờ Hà Nội hoặc Cột cờ Lũng Cú (Bài 23), giáo dục HS trân trọng biểu tượng của đất nước, bước đầu hình thành niềm tự hào dân tộc.',
      },
      {
        week: '7',
        lessonName: 'Bài 26 – Bài 30: Ph ph, Qu qu; V v, X x; Y y; Luyện tập chính tả; Ôn tập và kể chuyện',
        subLessonName: 'Bài 26 (2t) | Bài 27 (2t) | Bài 28 (2t) | Bài 29 (2t) | Bài 30 (2t) | Thực hành củng cố tuần 7 (2t)',
        periodAllocation: '12 tiết (Tiết 73–84)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp LTCM, ĐĐ, LS: Qua truyện "Kiến và dế mèn" (Bài 30), giáo dục HS biết chăm chỉ học tập, làm việc vừa sức, không lười biếng.',
      },
      {
        week: '8',
        lessonName: 'Bài 31 – Bài 35: an, ăn, ân; on, ôn, ơn; en, ên, in, un; am, ăm, âm; Ôn tập và kể chuyện',
        subLessonName: 'Bài 31 (2t) | Bài 32 (2t) | Bài 33 (2t) | Bài 34 (2t) | Bài 35 (2t) | Thực hành củng cố tuần 8 (2t)',
        periodAllocation: '12 tiết (Tiết 85–96)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp Quyền con người (QCN): Qua truyện "Dê con nghe lời mẹ" (Bài 35), giúp HS nhận biết quyền được chăm sóc, bảo vệ để sống an toàn.',
      },
      {
        week: '9',
        lessonName: 'Bài 36 – Bài 40: om, ôm, ơm; em, êm, im, um; ai, ay, ây; oi, ôi, ơi; Ôn tập và kể chuyện',
        subLessonName: 'Bài 36 (2t) | Bài 37 (2t) | Bài 38 (2t) | Bài 39 (2t) | Bài 40 (2t) | Thực hành củng cố tuần 9 (2t)',
        periodAllocation: '12 tiết (Tiết 97–108)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp LTCM, ĐĐ, LS: Qua truyện "Hai người bạn và con gấu" (Bài 40), giáo dục HS sống đoàn kết, chân thành, không bỏ mặc bạn khi gặp khó khăn.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-tv-hk1-p3',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 18',
    totalPeriods: 108,
    chapterCode: 'TV1-HV3',
    chapterTitle: 'Học vần – Phần 3: Các vần phức hợp & Ôn tập, Đánh giá cuối HKI (Tuần 10 – Tuần 18, Bài 41 – Bài 83)',
    topicTitle: 'Bài 41–80: ui, ưi, ao, eo, au, âu, êu, iu, ưu, ac, ăc, âc, oc, ôc, uc, ưc, at, ăt, ât, ot, ôt, ơt, et, êt, it, ut, ưt, ap, ăp, âp, op, ôp, ơp, ep, êp, ip, up, anh, ênh, inh, ach, êch, ich, ang, ăng, âng, ong, ông, ung, ưng, iêc, iên, iêp, iêng, iêm, iêt, iêu, yêu, uôt, uôm, uôc, uôn, uông, ươi, ươu, ươc, ươt, ươm, ươp, ươn, ương, oa, oe, oan, oăn, oat, oăt, oai, uê, uy, uân, uât, uyên, uyêt; Bài 81–83: Ôn tập & ĐG cuối HKI',
    adjustedContentSummary:
      'Hoàn thành chương trình Học vần lớp 1; đọc trơn đoạn văn, bài thơ ngắn và viết chính tả. Tích hợp BVMT, Tiết kiệm nguồn nước, QPAN (hình ảnh Bộ đội Cụ Hồ), ATGT đường thủy, QCN.',
    lessons: [
      {
        week: '10',
        lessonName: 'Bài 41 – Bài 45: ui, ưi; ao, eo; au, âu, êu; iu, ưu; Ôn tập và kể chuyện',
        subLessonName: 'Bài 41 (2t) | Bài 42 (2t) | Bài 43 (2t) | Bài 44 (2t) | Bài 45 (2t) | Thực hành củng cố tuần 10 (2t)',
        periodAllocation: '12 tiết (Tiết 109–120)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp Bảo vệ môi trường (BVMT): Giáo dục HS yêu quý chim có ích, không bắt chim, không phá tổ; biết giữ môi trường xanh để chim sinh sống (Bài 42).',
      },
      {
        week: '11',
        lessonName: 'Bài 46 – Bài 50: ac, ăc, âc; oc, ôc, uc, ưc; at, ăt, ât; ot, ôt, ơt; Ôn tập và kể chuyện',
        subLessonName: 'Bài 46 (2t) | Bài 47 (2t) | Bài 48 (2t) | Bài 49 (2t) | Bài 50 (2t) | Thực hành củng cố tuần 11 (2t)',
        periodAllocation: '12 tiết (Tiết 121–132)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp Quốc phòng và an ninh (QPAN): Giáo dục HS biết yêu quê hương, trân trọng và có ý thức giữ gìn cảnh quan đất nước (Bài 46). Tích hợp LTCM, ĐĐ, LS: Biết ứng xử lễ phép, lắng nghe lời dặn (Bài 50).',
      },
      {
        week: '12–13',
        lessonName: 'Bài 51 – Bài 60: et, êt, it; ut, ưt; ap, ăp, âp; op, ôp, ơp; ep, êp, ip, up; anh, ênh, inh; ach, êch, ich; ang, ăng, âng; Ôn tập và kể chuyện',
        subLessonName: 'Tuần 12: Bài 51–55 + Thực hành (12t) | Tuần 13: Bài 56–60 + Thực hành (12t)',
        periodAllocation: '24 tiết (Tiết 133–156)',
        periodsCount: 24,
        adjustedContent:
          'Đọc, viết thành thạo các vần kết thúc bằng t, p, nh, ch, ng và luyện đọc hiểu câu, đoạn ngắn.',
      },
      {
        week: '14–15',
        lessonName: 'Bài 61 – Bài 70: ong, ông, ung, ưng; iêc, iên, iêp; iêng, iêm, iêp; iêt, iêu, yêu; uôt, uôm; uôc, uôt; uôn, uông; ươi, ươu; Ôn tập và kể chuyện',
        subLessonName: 'Tuần 14: Bài 61–65 + Thực hành (12t) | Tuần 15: Bài 66–70 + Thực hành (12t)',
        periodAllocation: '24 tiết (Tiết 157–180)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp QPAN: Yêu quý danh lam, cảnh đẹp quê hương, giữ gìn hình ảnh đất nước Việt Nam (Bài 62). Tích hợp ATGT: Nhận biết phương tiện giao thông đường thủy, biết nghe người lớn hướng dẫn và mặc áo phao khi đi tàu, thuyền (Bài 66).',
      },
      {
        week: '16–17',
        lessonName: 'Bài 71 – Bài 80: ươc, ươt; ươm, ươp; ươn, ương; oa, oe; oan, oăn, oat, oăt; oai, uê, uy; uân, uât; uyên, uyêt; Ôn tập và kể chuyện',
        subLessonName: 'Tuần 16: Bài 71–75 + Thực hành (12t) | Tuần 17: Bài 76–80 + Thực hành (12t)',
        periodAllocation: '24 tiết (Tiết 181–204)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp BVMT & Tiết kiệm nguồn nước: Yêu hoa, chăm sóc cây xanh, tiết kiệm nước (Bài 74, 75). Tích hợp LTCM, ĐĐ, LS & QPAN: Lòng biết ơn các chú Bộ đội Cụ Hồ (Bài 78). Tích hợp QCN: Tôn trọng đặc điểm cơ thể và sự khác biệt qua truyện "Cặp sừng và đôi chân" (Bài 80).',
      },
      {
        week: '18',
        lessonName: 'Bài 81 – Bài 83: Ôn tập, Vận dụng thực hành & Đánh giá cuối học kì I',
        subLessonName: 'Bài 81–83: Ôn tập (6t) | Vận dụng, thực hành kiến thức (2t) | Tổng kết (2t) | Đánh giá cuối kì I (2t)',
        periodAllocation: '12 tiết (Tiết 205–216)',
        periodsCount: 12,
        adjustedContent:
          'Hệ thống hóa toàn bộ các âm, vần đã học trong Học kì I và thực hiện bài kiểm tra Đọc - Viết định kì cuối học kì I.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-tv-hk2-p1',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 26',
    totalPeriods: 96,
    chapterCode: 'TV1-HK2-CĐ1-4',
    chapterTitle: 'Luyện tập tổng hợp – Chủ đề 1, 2, 3 & 4: Tôi và các bạn – Mái ấm gia đình – Mái trường mến yêu – Điều em cần biết (Tuần 19 – Tuần 26)',
    topicTitle: 'Chủ đề 1: Tôi là học sinh lớp 1, Đôi tai xấu xí, Bạn của gió, Giải thưởng tình bạn, Sinh nhật của voi con; Chủ đề 2: Nụ hôn trên bàn tay, Làm anh, Cả nhà đi chơi núi, Quạt cho bà ngủ, Bữa cơm gia đình, Ngôi nhà; Chủ đề 3: Tôi đi học, Đi học, Hoa yêu thương, Cây bàng và lớp học, Bác trống trường, Giờ ra chơi; Chủ đề 4: Rửa tay trước khi ăn, Lời chào, Khi mẹ vắng nhà, Nếu không may bị lạc, Đèn giao thông',
    adjustedContentSummary:
      'Rèn kĩ năng Đọc trơn, Đọc hiểu, Viết chính tả và Nói - Nghe theo chủ điểm. Tích hợp QCN, KNS, NLS (1.1.CB1a, 2.1.CB1a, 2.3.CB1a, 2.5.CB1a, 4.1.CB1b, 4.2.CB1a), AI (1.A1.2, 1.A2.2), BVMT, ATGT.',
    lessons: [
      {
        week: '19–20',
        lessonName: 'Chủ đề 1: Tôi và các bạn (Bài 1 – Bài 5)',
        subLessonName: 'Bài 1: Tôi là học sinh lớp 1 (4t) | Bài 2: Đôi tai xấu xí (4t) | Bài 3: Bạn của gió (2t) | Bài 4: Giải thưởng tình bạn (4t) | Bài 5: Sinh nhật của voi con (4t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 217–240)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp QCN & KNS: Quyền được học tập, tôn trọng đặc điểm riêng; tự tin giới thiệu bản thân. Tích hợp NLS 2.1.CB1a & 1.1.CB1a: Quay clip ngắn giới thiệu bản thân; khai thác hình ảnh/video về hiện tượng gió. Tích hợp AI 1.A1.2: HS biết lời chúc hoặc biểu tượng cảm xúc do máy tính tạo ra là kết quả con người thiết kế, không phải tình cảm thật như tình bạn.',
      },
      {
        week: '21–22',
        lessonName: 'Chủ đề 2: Mái ấm gia đình (Bài 1 – Bài 6)',
        subLessonName: 'Bài 1: Nụ hôn trên bàn tay (4t) | Bài 2: Làm anh (2t) | Bài 3: Cả nhà đi chơi núi (4t) | Bài 4: Quạt cho bà ngủ (2t) | Bài 5: Bữa cơm gia đình (4t) | Bài 6: Ngôi nhà (2t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 241–264)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp QCN & LTCM, ĐĐ, LS: Quyền được yêu thương, chăm sóc; biết nhường nhịn em nhỏ. Tích hợp Tiết kiệm năng lượng: Tắt quạt, tắt điện khi không sử dụng. Tích hợp AI 1.A2.2: Kể tên thiết bị AI như robot hút bụi, nồi thông minh giúp gia đình tiết kiệm thời gian. Tích hợp NLS 4.2.CB1a: Không chia sẻ ảnh nhà, địa chỉ nhà, số điện thoại gia đình lên mạng hoặc với người lạ.',
      },
      {
        week: '23–24',
        lessonName: 'Chủ đề 3: Mái trường mến yêu (Bài 1 – Bài 6)',
        subLessonName: 'Bài 1: Tôi đi học (4t) | Bài 2: Đi học (2t) | Bài 3: Hoa yêu thương (4t) | Bài 4: Cây bàng và lớp học (2t) | Bài 5: Bác trống trường (4t) | Bài 6: Giờ ra chơi (2t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 265–288)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp ATGT: Biết đường đến trường, đi học đúng đường, không đi theo người lạ. Tích hợp NLS 2.5.CB1a: Biết nói lời yêu thương, cảm ơn, xin lỗi lịch sự khi gửi tin nhắn hoặc ghi âm trong nhóm lớp. Tích hợp LTCM, ĐĐ, LS: Quý trọng đồ dùng chung của trường, chơi đoàn kết trong giờ ra chơi.',
      },
      {
        week: '25–26',
        lessonName: 'Chủ đề 4: Điều em cần biết (Bài 1 – Bài 5)',
        subLessonName: 'Bài 1: Rửa tay trước khi ăn (4t) | Bài 2: Lời chào (2t) | Bài 3: Khi mẹ vắng nhà (4t) | Bài 4: Nếu không may bị lạc (4t) | Bài 5: Đèn giao thông (4t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 289–312)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp Tiết kiệm nguồn nước: Mở nước vừa đủ, khóa vòi sau khi rửa tay. Tích hợp NLS 2.5.CB1a, 4.1.CB1b & 2.3.CB1a: Lễ phép khi chào hỏi qua điện thoại; nhận biết tin nhắn/cuộc gọi của người lạ xin thông tin cá nhân là nguy cơ; biết gọi điện cho cha mẹ khi bị lạc. Tích hợp KNS & ATGT: Không mở cửa cho người lạ; tuân thủ đèn tín hiệu giao thông.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-tv-hk2-p2',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 35',
    totalPeriods: 108,
    chapterCode: 'TV1-HK2-CĐ5-8',
    chapterTitle: 'Luyện tập tổng hợp – Chủ đề 5, 6, 7 & 8: Bài học từ cuộc sống – Thiên nhiên kì thú – Thế giới trong mắt em – Đất nước và con người & Đánh giá cuối năm (Tuần 27 – Tuần 35)',
    topicTitle: 'Chủ đề 5: Kiến và chim bồ câu, Câu chuyện của rễ, Câu hỏi của sói, Chú bé chăn cừu, Tiếng vọng của núi; Chủ đề 6: Loài chim của biển cả, Bảy sắc cầu vồng, Chúa tể rừng xanh, Cuộc thi tài năng rừng xanh, Cây liễu dẻo dai; Chủ đề 7: Tia nắng đi đâu?, Trong giấc mơ buổi sáng, Ngày mới bắt đầu, Hỏi mẹ, Những cánh cò, Buổi trưa hè, Hoa phượng; Chủ đề 8: Cậu bé thông minh, Lính cứu hỏa, Lớn lên bạn làm gì?, Ruộng bậc thang ở Sa Pa, Nhớ ơn, Du lịch biển Việt Nam',
    adjustedContentSummary:
      'Đọc hiểu văn bản truyện và thơ, rèn kĩ năng viết chính tả và nói - nghe theo chủ đề. Tích hợp AI (1.B3.1, 1.B1.1, 1.A2.2), NLS (1.1.CB1a), BVMT, Tiết kiệm nguồn nước, PCCC-CHCN, QPAN biển đảo, GDĐP Huế.',
    lessons: [
      {
        week: '27–28',
        lessonName: 'Chủ đề 5: Bài học từ cuộc sống (Bài 1 – Bài 5)',
        subLessonName: 'Bài 1: Kiến và chim bồ câu (4t) | Bài 2: Câu chuyện của rễ (2t) | Bài 3: Câu hỏi của sói (4t) | Bài 4: Chú bé chăn cừu (4t) | Bài 5: Tiếng vọng của núi (4t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 313–336)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp AI 1.B3.1: Nhận biết robot cứu hộ được con người dùng cho mục đích tốt đẹp. Tích hợp AI 1.B1.1: Nhận biết việc dùng AI tạo giọng nói hoặc hình ảnh giả để lừa dối người khác là hành vi xấu (Bài 4: Chú bé chăn cừu). Tích hợp Tiết kiệm nguồn nước & LTCM, ĐĐ, LS.',
      },
      {
        week: '29–30',
        lessonName: 'Chủ đề 6: Thiên nhiên kì thú (Bài 1 – Bài 5)',
        subLessonName: 'Bài 1: Loài chim của biển cả (4t) | Bài 2: Bảy sắc cầu vồng (2t) | Bài 3: Chúa tể rừng xanh (4t) | Bài 4: Cuộc thi tài năng rừng xanh (4t) | Bài 5: Cây liễu dẻo dai (4t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 337–360)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp Bảo vệ môi trường (BVMT): Yêu quý các loài chim biển, động vật hoang dã và cây xanh; không săn bắt thú rừng, giữ gìn môi trường biển và rừng. Tích hợp NLS 1.1.CB1a: Quan sát hình ảnh/video về cầu vồng từ nguồn GV cung cấp.',
      },
      {
        week: '31–32',
        lessonName: 'Chủ đề 7: Thế giới trong mắt em (Bài 1 – Bài 7)',
        subLessonName: 'Bài 1: Tia nắng đi đâu? (2t) | Bài 2: Trong giấc mơ buổi sáng (2t) | Bài 3: Ngày mới bắt đầu (4t) | Bài 4: Hỏi mẹ (2t) | Bài 5: Những cánh cò (4t) | Bài 6: Buổi trưa hè (2t) | Bài 7: Hoa phượng (2t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 361–384)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp NLS 1.1.CB1a: Quan sát hình ảnh/video số về ánh nắng, ngày - đêm, chim cò, đồng ruộng. Tích hợp GDĐP: Nêu những việc làm phù hợp để bảo vệ, giữ gìn cảnh đẹp quê em (Bài 7: Hoa phượng).',
      },
      {
        week: '33–34',
        lessonName: 'Chủ đề 8: Đất nước và con người (Bài 1 – Bài 6)',
        subLessonName: 'Bài 1: Cậu bé thông minh (4t) | Bài 2: Lính cứu hỏa (4t) | Bài 3: Lớn lên bạn làm gì? (2t) | Bài 4: Ruộng bậc thang ở Sa Pa (2t) | Bài 5: Nhớ ơn (2t) | Bài 6: Du lịch biển Việt Nam (4t) | Ôn tập & Luyện tập (6t)',
        periodAllocation: '24 tiết (Tiết 385–408)',
        periodsCount: 24,
        adjustedContent:
          'Tích hợp PCCC, CHCN: Hiểu vai trò của lực lượng phòng cháy, chữa cháy. Tích hợp AI 1.B3.1 & 1.A2.2: Nhận biết một số nghề có sử dụng AI hỗ trợ (bác sĩ, giáo viên, lính cứu hỏa) và ứng dụng dịch ngôn ngữ bằng AI trong du lịch. Tích hợp QPAN & NLS 1.1.CB1a: Biết biển đảo Việt Nam là phần lãnh thổ thiêng liêng của đất nước, trân trọng chủ quyền.',
      },
      {
        week: '35',
        lessonName: 'Ôn tập và Đánh giá cuối năm học (Bài 1 – Bài 3 & Kiểm tra cuối năm)',
        subLessonName: 'Ôn tập Bài 1, 2, 3 (6t) | Luyện tập (2t) | Kiểm tra & Đánh giá cuối năm (4t)',
        periodAllocation: '12 tiết (Tiết 409–420)',
        periodsCount: 12,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt lớp 1 cả năm học và thực hiện kiểm tra, đánh giá định kì cuối năm.',
      },
    ],
  }),
];

/**
 * 2. MÔN TOÁN LỚP 1 (105 TIẾT / 35 TUẦN – 3 TIẾT/TUẦN)
 * HKI: 18 tuần x 3 tiết/tuần = 54 tiết (Chủ đề 1–5, Bài 1–20)
 * HKII: 17 tuần x 3 tiết/tuần = 51 tiết (Chủ đề 6–10, Bài 21–41)
 */
export const GRADE1_TOAN_TOPICS: CurriculumTopic[] = [
  buildGrade1Topic({
    id: 'nda-2026-g1-math-cd1-2',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 9',
    totalPeriods: 25,
    chapterCode: 'T1-CĐ1-2',
    chapterTitle: 'Chủ đề 1 & 2: Các số từ 0 đến 10 – Làm quen với một số hình phẳng (Tiết học đầu tiên & Bài 1 – Bài 9)',
    topicTitle: 'Tiết học đầu tiên; Các số 0–10; Nhiều hơn, ít hơn, bằng nhau; So sánh số; Mấy và mấy; Hình vuông, hình tròn, hình tam giác, hình chữ nhật; Thực hành lắp ghép, xếp hình (STEM)',
    adjustedContentSummary:
      'Đếm, đọc, viết, so sánh và tách-gộp các số trong phạm vi 10; nhận dạng hình vuông, hình tròn, hình tam giác, hình chữ nhật. Tích hợp AI (1.A2.1), BVMT, Bài học STEM (Trang trí lớp học bằng các hình hình học).',
    lessons: [
      {
        week: '1–2',
        lessonName: 'Tiết học đầu tiên & Bài 1: Các số 0, 1, 2, 3, 4, 5',
        subLessonName: 'Tiết học đầu tiên (Tiết 1) | Bài 1: Các số 0, 1, 2, 3, 4, 5 (Tiết 2, 3, 4)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI 1.A2.1: Nhận biết và kể tên được một số thiết bị có sử dụng AI (như rô-bốt); nhận biết nhân vật Rô-bốt trong sách là một đại diện tiêu biểu của AI hỗ trợ con người học tập. Tích hợp BVMT: Qua hoạt động đếm con vật, cây cối, giáo dục HS yêu quý thiên nhiên.',
      },
      {
        week: '2–3',
        lessonName: 'Bài 2: Các số 6, 7, 8, 9, 10 & Bài 3: Nhiều hơn, ít hơn, bằng nhau',
        subLessonName: 'Bài 2 (Tiết 5, 6, 7) | Bài 3 (Tiết 8, 9)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Đếm, đọc, viết các số từ 6 đến 10 và nhận biết quan hệ nhiều hơn, ít hơn, bằng nhau giữa hai nhóm đồ vật.',
      },
      {
        week: '4–7',
        lessonName: 'Bài 4: So sánh số; Bài 5: Mấy và mấy & Bài 6: Luyện tập chung',
        subLessonName: 'Bài 4 (Tiết 10–13) | Bài 5 (Tiết 14–16) | Bài 6 (Tiết 17–20)',
        periodAllocation: '11 tiết',
        periodsCount: 11,
        adjustedContent:
          'Sử dụng các dấu >, <, = để so sánh các số trong phạm vi 10; thực hiện tách - gộp số (mấy và mấy).',
      },
      {
        week: '7–9',
        lessonName: 'Bài 7: Hình vuông, hình tròn, hình tam giác, hình chữ nhật; Bài 8: Thực hành lắp ghép, xếp hình (STEM) & Bài 9: Luyện tập chung',
        subLessonName: 'Bài 7 (Tiết 21–22) | Bài 8 (Tiết 23–24) | Bài 9 (Tiết 25)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp STEM: Thực hành trang trí lớp học bằng các hình hình học (02 tiết). Nhận dạng được hình vuông, hình tròn, hình tam giác, hình chữ nhật.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-math-cd3-4-5',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 9 – Tuần 18',
    totalPeriods: 29,
    chapterCode: 'T1-CĐ3-4-5',
    chapterTitle: 'Chủ đề 3, 4 & 5: Phép cộng, phép trừ trong phạm vi 10 – Làm quen với một số hình khối – Ôn tập HKI (Bài 10 – Bài 20)',
    topicTitle: 'Phép cộng, phép trừ trong phạm vi 10; Bảng cộng, bảng trừ PV 10; Khối lập phương, khối hộp chữ nhật; Vị trí, định hướng trong không gian; Ôn tập HKI',
    adjustedContentSummary:
      'Thực hiện phép cộng, phép trừ trong phạm vi 10; nhận dạng khối lập phương, khối hộp chữ nhật và xác định vị trí trên-dưới, phải-trái, trước-sau, ở giữa. Tích hợp STEM (Dụng cụ tính cộng, tính trừ), KNS, LTCM - đạo đức - lối sống.',
    lessons: [
      {
        week: '9–11',
        lessonName: 'Bài 10: Phép cộng trong phạm vi 10',
        subLessonName: 'Tiết 26–31 (6 tiết)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp kĩ năng sống (KNS): Qua tình huống thêm vào, giáo dục HS biết hợp tác với bạn khi làm việc nhóm, biết chờ đến lượt mình trình bày. Thực hiện tính nhẩm phép cộng trong phạm vi 10.',
      },
      {
        week: '11–13',
        lessonName: 'Bài 11: Phép trừ trong phạm vi 10',
        subLessonName: 'Tiết 32–37 (6 tiết)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục HS biết giữ gìn đồ dùng chung, không tự ý lấy đồ của bạn, biết trung thực khi tham gia hoạt động học tập.',
      },
      {
        week: '13–15',
        lessonName: 'Bài 12: Bảng cộng, bảng trừ trong phạm vi 10 & Bài 13: Luyện tập chung (STEM)',
        subLessonName: 'Bài 12 (Tiết 38–40) | Bài 13 (Tiết 41–43)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp STEM: Dụng cụ tính cộng, tính trừ (02 tiết). Thuộc và vận dụng bảng cộng, bảng trừ trong phạm vi 10.',
      },
      {
        week: '15–16',
        lessonName: 'Bài 14: Khối lập phương, khối hộp chữ nhật; Bài 15: Vị trí, định hướng trong không gian & Bài 16: Luyện tập chung',
        subLessonName: 'Bài 14 (Tiết 44–45) | Bài 15 (Tiết 46–47) | Bài 16 (Tiết 48)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp kĩ năng sống (KNS): Rèn thói quen sắp xếp đồ dùng học tập, đồ chơi theo hình dạng và cất gọn sau khi sử dụng.',
      },
      {
        week: '17–18',
        lessonName: 'Bài 17 – Bài 20: Ôn tập học kì I & Kiểm tra cuối HKI',
        subLessonName: 'Bài 17: Ôn tập các số PV 10 (2t) | Bài 18: Ôn tập cộng, trừ PV 10 (2t) | Bài 19: Ôn tập hình học (1t) | Bài 20: Ôn tập chung & Kiểm tra cuối HKI (1t)',
        periodAllocation: '6 tiết (Tiết 49–54)',
        periodsCount: 6,
        adjustedContent:
          'Hệ thống hóa kiến thức Toán lớp 1 Học kì I và hoàn thành đánh giá định kì cuối học kì I.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-math-cd6-7-8',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 30',
    totalPeriods: 34,
    chapterCode: 'T1-CĐ6-7-8',
    chapterTitle: 'Chủ đề 6, 7 & 8: Các số đến 100 – Độ dài và đo độ dài – Phép cộng, phép trừ (không nhớ) trong phạm vi 100 (Bài 21 – Bài 33)',
    topicTitle: 'Số có hai chữ số; So sánh số có hai chữ số; Bảng các số từ 1 đến 100 (STEM); Dài hơn, ngắn hơn; Đơn vị đo độ dài (cm); Phép cộng, phép trừ (không nhớ) trong phạm vi 100',
    adjustedContentSummary:
      'Đọc, viết, so sánh các số đến 100; nhận biết đơn vị xăng-ti-mét (cm) và đo độ dài đoạn thẳng; đặt tính và tính phép cộng, trừ (không nhớ) trong phạm vi 100. Tích hợp BVMT, Bài học STEM (Bảng các số từ 1 đến 100), LTCM - đạo đức - lối sống, KNS, ATGT.',
    lessons: [
      {
        week: '19–20',
        lessonName: 'Bài 21: Số có hai chữ số',
        subLessonName: 'Tiết 55–60 (6 tiết)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp bảo vệ môi trường (BVMT): Qua tranh chim cánh cụt, cá, bể cá và các con vật dưới nước, giáo dục HS không xả rác xuống ao, hồ, biển; biết bảo vệ môi trường sống của các loài vật.',
      },
      {
        week: '21–22',
        lessonName: 'Bài 22: So sánh số có hai chữ số; Bài 23: Bảng các số từ 1 đến 100 & Bài 24: Luyện tập chung (STEM)',
        subLessonName: 'Bài 22 (Tiết 61–63) | Bài 23 (Tiết 64) | Bài 24 (Tiết 65–66)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp STEM: Bảng các số từ 1 đến 100 (02 tiết). Tích hợp LTCM, đạo đức, lối sống: Biết nhận lỗi, xin lỗi và giữ gìn đồ dùng chung.',
      },
      {
        week: '23–25',
        lessonName: 'Bài 25: Dài hơn, ngắn hơn; Bài 26: Đơn vị đo độ dài (cm); Bài 27: Thực hành ước lượng và đo độ dài & Bài 28: Luyện tập chung',
        subLessonName: 'Bài 25 (2t) | Bài 26 (2t) | Bài 27 (2t) | Bài 28 (2t)',
        periodAllocation: '8 tiết (Tiết 67–74)',
        periodsCount: 8,
        adjustedContent:
          'Nhận biết đơn vị đo độ dài xăng-ti-mét (cm); biết dùng thước có vạch chia cm để đo độ dài đoạn thẳng, đồ vật.',
      },
      {
        week: '25–26',
        lessonName: 'Bài 29: Phép cộng số có hai chữ số với số có một chữ số & Bài 30: Phép cộng số có hai chữ số với số có hai chữ số',
        subLessonName: 'Bài 29 (Tiết 75–76) | Bài 30 (Tiết 77–78)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp LTCM, ĐĐ, LS & KNS: Biết giúp bạn cùng hoàn thành nhiệm vụ, trình bày cách làm rõ ràng và nhận xét bài làm của bạn bằng lời nói lịch sự.',
      },
      {
        week: '27–30',
        lessonName: 'Bài 31: Phép trừ số có hai chữ số cho số có một chữ số; Bài 32: Phép trừ số có hai chữ số cho số có hai chữ số & Bài 33: Luyện tập chung',
        subLessonName: 'Bài 31 (Tiết 79–81) | Bài 32 (Tiết 82–84) | Bài 33 (Tiết 85–88)',
        periodAllocation: '10 tiết',
        periodsCount: 10,
        adjustedContent:
          'Tích hợp ATGT: Giúp HS nhận biết hành vi an toàn khi tham gia giao thông công cộng như lên, xuống xe buýt đúng trật tự, không chen lấn, xô đẩy; biết nhường nhịn, xếp hàng văn minh.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-math-cd9-10',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'T1-CĐ9-10',
    chapterTitle: 'Chủ đề 9 & 10: Thời gian, giờ và lịch – Ôn tập cuối năm (Bài 34 – Bài 41)',
    topicTitle: 'Xem giờ đúng trên đồng hồ (STEM); Các ngày trong tuần; Thực hành xem lịch và giờ; Ôn tập các số và phép tính trong PV 10, PV 100; Ôn tập hình học và đo lường; Kiểm tra cuối năm',
    adjustedContentSummary:
      'Biết xem giờ đúng trên đồng hồ và đọc các ngày trong tuần trên tờ lịch; ôn tập tổng hợp cuối năm. Tích hợp STEM (Đồng hồ tiện ích), KNS, QPAN (34 đơn vị hành chính cấp tỉnh), AI (1.A2.2).',
    lessons: [
      {
        week: '30',
        lessonName: 'Bài 34: Xem giờ đúng trên đồng hồ (STEM)',
        subLessonName: 'Tiết 89, 90',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp STEM: Đồng hồ tiện ích (02 tiết). Tích hợp KNS: Giáo dục HS biết quý trọng thời gian, đi học đúng giờ, thực hiện việc học tập, vui chơi, nghỉ ngơi hợp lí.',
      },
      {
        week: '31',
        lessonName: 'Bài 35: Các ngày trong tuần',
        subLessonName: 'Tiết 91, 92',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp QPAN: Giúp HS bước đầu nhận biết một số địa danh tiêu biểu của đất nước qua hành trình của bạn Rô-bốt trên bản đồ Việt Nam; bồi dưỡng tình yêu quê hương, lòng tự hào về Tổ quốc; biết Việt Nam có 34 đơn vị hành chính cấp tỉnh sau sắp xếp năm 2025.',
      },
      {
        week: '31–32',
        lessonName: 'Bài 36: Thực hành xem lịch và giờ & Bài 37: Luyện tập chung',
        subLessonName: 'Bài 36 (Tiết 93–94) | Bài 37 (Tiết 95–96)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI 1.A2.2: Hiểu AI có thể nhắc lịch học và giờ giấc bằng giọng nói thân thiện, giúp con người sinh hoạt nền nếp và dễ hợp tác hơn.',
      },
      {
        week: '33–35',
        lessonName: 'Bài 38 – Bài 41: Ôn tập cuối năm & Kiểm tra định kì cuối năm học',
        subLessonName: 'Bài 38: Ôn tập số và phép tính PV 10 (3t) | Bài 39: Ôn tập số và phép tính PV 100 (3t) | Bài 40: Ôn tập hình học và đo lường (2t) | Bài 41: Ôn tập chung & Kiểm tra cuối năm (1t)',
        periodAllocation: '9 tiết (Tiết 97–105)',
        periodsCount: 9,
        adjustedContent:
          'Hệ thống hóa toàn bộ kiến thức Toán lớp 1 cả năm học và thực hiện bài kiểm tra đánh giá định kì cuối năm.',
      },
    ],
  }),
];
