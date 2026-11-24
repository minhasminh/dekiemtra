import {
  CognitiveLevelCode,
  CurriculumLessonItem,
  CurriculumTopic,
  EducationLevelId,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_G2_SOURCE_DOC =
  'KHGD Khối lớp 2 – Tổ 1-2-3 Trường TH&THCS Nguyễn Đình Anh (Đan Điền, ngày 28/8/2026)';

export interface Grade2LessonInput {
  id?: string;
  week: string;
  lessonName: string;
  subLessonName?: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
}

export function buildGrade2Topic(params: {
  id: string;
  subject: string;
  semester: 'HK1' | 'HK2' | 'CA_NAM';
  weekRange: string;
  totalPeriods?: number;
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  adjustedContentSummary?: string;
  rawLessons?: Grade2LessonInput[];
  lessons?: Grade2LessonInput[];
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
    grade: 2,
    subject: params.subject,
    semester: params.semester,
    weekRange: params.weekRange,
    totalPeriods: computedTotalPeriods,
    durationText: `${computedTotalPeriods} tiết (${params.weekRange})`,
    chapterCode: params.chapterCode,
    chapterTitle: params.chapterTitle,
    topicTitle: params.topicTitle,
    adjustedContentSummary: computedSummary,
    sourceDocument: NDA_G2_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

/**
 * 1. MÔN TIẾNG VIỆT LỚP 2 (350 TIẾT / 35 TUẦN – 10 TIẾT/TUẦN)
 * HKI: 18 tuần = 180 tiết (32 bài/160 tiết + Ôn tập và ĐG giữa HKI: 10 tiết + Ôn tập và ĐG cuối HKI: 10 tiết)
 * HKII: 17 tuần = 170 tiết (30 bài/150 tiết + Ôn tập và ĐG giữa HKII: 10 tiết + Ôn tập và ĐG cuối HKII: 10 tiết)
 */
export const GRADE2_TIENG_VIET_TOPICS: CurriculumTopic[] = [
  buildGrade2Topic({
    id: 'nda-2026-g2-tv-cd1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 4',
    totalPeriods: 40,
    chapterCode: 'TV2-CĐ1',
    chapterTitle: 'Chủ điểm 1: Em lớn lên từng ngày (Bài 1 – Bài 8)',
    topicTitle: 'Tôi là học sinh lớp 2; Ngày hôm qua đâu rồi?; Niềm vui của Bi và Bống; Làm việc thật là vui; Em có xinh không?; Một giờ học; Cây xấu hổ; Cầu thủ dự bị',
    adjustedContentSummary:
      'Đọc, Viết chữ hoa A, Ă, Â, B, C; LTVC về từ chỉ sự vật, hoạt động, đặc điểm, câu giới thiệu, câu nêu hoạt động, câu nêu đặc điểm; Viết đoạn văn giới thiệu bản thân, kể việc làm ở nhà, kể hoạt động thể thao. Tích hợp AI (2.A2.1), Tiếp cận giới, QCN, Phòng tránh tai nạn thương tích.',
    lessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Tôi là học sinh lớp 2',
        subLessonName: 'Đọc: Tôi là học sinh lớp 2 (2 tiết) | Viết: Chữ hoa A (1 tiết) | Nói và nghe: Những ngày hè của em (1 tiết)',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Đọc đúng, rõ ràng văn bản "Tôi là học sinh lớp 2"; viết đúng chữ hoa A; kể được những hoạt động đáng nhớ trong ngày hè của em.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Ngày hôm qua đâu rồi?',
        subLessonName: 'Đọc: Ngày hôm qua đâu rồi? (2t) | Nghe-viết + Bảng chữ cái (1t) | LTVC: Từ ngữ chỉ sự vật, hoạt động; Câu giới thiệu (1t) | Luyện viết đoạn: Giới thiệu bản thân & Đọc mở rộng (2t)',
        periodAllocation: '6 tiết (Tiết 5–10)',
        periodsCount: 6,
        adjustedContent:
          'Đọc thuộc khổ thơ và hiểu ý nghĩa quý trọng thời gian; thuộc bảng chữ cái; nhận biết từ ngữ chỉ sự vật, hoạt động và câu giới thiệu; viết được đoạn văn ngắn giới thiệu bản thân.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Niềm vui của Bi và Bống',
        subLessonName: 'Đọc: Niềm vui của Bi và Bống (2 tiết) | Viết: Chữ hoa Ă, Â (1 tiết) | Nói và nghe: Kể chuyện Niềm vui của Bi và Bống (1 tiết)',
        periodAllocation: '4 tiết (Tiết 11–14)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu câu chuyện về tình cảm anh em yêu thương, sẻ chia; viết đúng chữ hoa Ă, Â; kể lại được từng đoạn câu chuyện Niềm vui của Bi và Bống.',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Làm việc thật là vui',
        subLessonName: 'Đọc: Làm việc thật là vui (2t) | Nghe-viết + Bảng chữ cái (1t) | LTVC: Từ chỉ sự vật, hoạt động; Câu nêu hoạt động (1t) | Luyện viết đoạn: Kể một việc làm ở nhà & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 15–20)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.A2.1: Nhận biết một số ứng dụng AI/trợ lí ảo, thiết bị thông minh trong gia đình có thể hỗ trợ sinh hoạt hằng ngày. Đặt được câu nêu hoạt động và viết đoạn văn kể một việc làm ở nhà.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Em có xinh không?',
        subLessonName: 'Đọc: Em có xinh không? (2 tiết) | Viết: Chữ hoa B (1 tiết) | Nói và nghe: Kể chuyện Em có xinh không? (1 tiết)',
        periodAllocation: '4 tiết (Tiết 21–24)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Tiếp cận giới: Tôn trọng sự đa dạng, cá tính riêng; giúp học sinh hiểu rằng vẻ đẹp và giá trị của một người nằm ở sự tự tin và chính bản thân họ, không cần phải chạy theo các khuôn mẫu áp đặt.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Một giờ học',
        subLessonName: 'Đọc: Một giờ học (2t) | Nghe-viết + Bảng chữ cái (1t) | LTVC: Từ ngữ chỉ đặc điểm; Câu nêu đặc điểm (1t) | Luyện viết đoạn: Kể việc thường làm & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 25–30)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD về quyền con người (QCN): Quyền được bình đẳng về cơ hội học tập và giáo dục. Nhận diện từ ngữ chỉ đặc điểm, câu nêu đặc điểm; viết đoạn văn kể việc thường làm.',
      },
      {
        week: '4',
        lessonName: 'Bài 7: Cây xấu hổ',
        subLessonName: 'Đọc: Cây xấu hổ (2 tiết) | Viết: Chữ hoa C (1 tiết) | Nói và nghe: Kể chuyện Cây xấu hổ (1 tiết)',
        periodAllocation: '4 tiết (Tiết 31–34)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu bài Cây xấu hổ; viết đúng chữ hoa C; kể lại được câu chuyện Cây xấu hổ theo tranh.',
      },
      {
        week: '4',
        lessonName: 'Bài 8: Cầu thủ dự bị',
        subLessonName: 'Đọc: Cầu thủ dự bị (2t) | Nghe-viết + Viết hoa tên người (1t) | LTVC: MRVT về hoạt động thể thao, vui chơi; Câu nêu hoạt động (1t) | Luyện viết đoạn: Kể hoạt động thể thao/trò chơi & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 35–40)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD Quyền con người (QCN): Quyền được tham gia các hoạt động vui chơi, giải trí. Tích hợp GD phòng tránh tai nạn thương tích khi vui chơi và chơi các hoạt động thể thao.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tv-cd2',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 9',
    totalPeriods: 50,
    chapterCode: 'TV2-CĐ2',
    chapterTitle: 'Chủ điểm 2: Đi học vui sao (Bài 9 – Bài 16 & Ôn tập giữa HKI)',
    topicTitle: 'Cô giáo lớp em; Thời khóa biểu; Cái trống trường em; Danh sách học sinh; Yêu lắm trường ơi!; Em học vẽ; Cuốn sách của em; Khi trang sách mở ra; Ôn tập giữa HKI',
    adjustedContentSummary:
      'Đọc, Viết chữ hoa D, Đ, E, Ê, G; LTVC về từ ngữ chỉ đồ dùng học tập, sự vật, đặc điểm, dấu chấm, dấu chấm hỏi; Lập thời gian biểu, danh sách học sinh, tả đồ dùng học tập. Tích hợp NLS (2.3.CB1a, 4.1.CB1b), Kĩ năng công dân số, BVMT, ANQP, Liên hệ Trường TH&THCS Nguyễn Đình Anh.',
    lessons: [
      {
        week: '5',
        lessonName: 'Bài 9: Cô giáo lớp em',
        subLessonName: 'Đọc: Cô giáo lớp em (2 tiết) | Viết: Chữ hoa D (1 tiết) | Nói và nghe: Kể chuyện Cậu bé ham học (1 tiết)',
        periodAllocation: '4 tiết (Tiết 41–44)',
        periodsCount: 4,
        adjustedContent:
          'Đọc diễn cảm bài thơ Cô giáo lớp em; viết đúng chữ hoa D; kể chuyện Cậu bé ham học và bày tỏ tình cảm kính yêu thầy cô giáo.',
      },
      {
        week: '5',
        lessonName: 'Bài 10: Thời khóa biểu',
        subLessonName: 'Đọc: Thời khóa biểu (2t) | Nghe-viết + Phân biệt c/k, ch/tr, v/d (1t) | LTVC: Từ ngữ chỉ sự vật, hoạt động; Câu nêu hoạt động (1t) | Luyện viết đoạn: Viết thời gian biểu & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 45–50)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 2.3.CB1a: Xác định được công cụ số đơn giản có thể hỗ trợ nhắc việc học tập. Biết đọc và lập thời gian biểu cá nhân.',
      },
      {
        week: '6',
        lessonName: 'Bài 11: Cái trống trường em',
        subLessonName: 'Đọc: Cái trống trường em (2 tiết) | Viết: Chữ hoa Đ (1 tiết) | Nói và nghe: Ngôi trường của em (1 tiết)',
        periodAllocation: '4 tiết (Tiết 51–54)',
        periodsCount: 4,
        adjustedContent:
          'Liên hệ đơn vị hành chính mới: Trường TH & THCS Nguyễn Đình Anh. Giới thiệu được những nét đẹp về ngôi trường của em.',
      },
      {
        week: '6',
        lessonName: 'Bài 12: Danh sách học sinh',
        subLessonName: 'Đọc: Danh sách học sinh (2t) | Nghe-viết: Cái trống trường em + Phân biệt g/gh, s/x (1t) | LTVC: Từ ngữ chỉ sự vật, đặc điểm; Câu nêu đặc điểm (1t) | Luyện viết đoạn: Lập danh sách học sinh (tổ) & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 55–60)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 4.1.CB1b: Phân biệt được rủi ro, biết bảo vệ thông tin cá nhân khi đọc, lập hoặc chia sẻ danh sách học sinh.',
      },
      {
        week: '7',
        lessonName: 'Bài 13: Yêu lắm trường ơi!',
        subLessonName: 'Đọc: Yêu lắm trường ơi! (2 tiết) | Viết: Chữ hoa E, Ê (1 tiết) | Nói và nghe: Kể chuyện Bữa ăn trưa (1 tiết)',
        periodAllocation: '4 tiết (Tiết 61–64)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD BVMT: Giáo dục học sinh có ý thức chăm sóc, bảo vệ cây xanh tạo môi trường học tập thoáng mát.',
      },
      {
        week: '7',
        lessonName: 'Bài 14: Em học vẽ',
        subLessonName: 'Đọc: Em học vẽ (2t) | Nghe-viết + Phân biệt ng/ngh, r/d/gi, an/ang (1t) | LTVC: MRVT chỉ đồ dùng học tập; Dấu chấm, dấu chấm hỏi (1t) | Luyện viết đoạn: Giới thiệu về một đồ vật & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 65–70)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp ANQP: Giáo dục tình yêu quê hương đất nước. Sử dụng đúng dấu chấm, dấu chấm hỏi và viết đoạn văn giới thiệu một đồ vật.',
      },
      {
        week: '8',
        lessonName: 'Bài 15: Cuốn sách của em',
        subLessonName: 'Đọc: Cuốn sách của em (2 tiết) | Viết: Chữ hoa G (1 tiết) | Nói và nghe: Kể chuyện Họa mi, vẹt và quạ (1 tiết)',
        periodAllocation: '4 tiết (Tiết 71–74)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Giáo dục kĩ năng công dân số (NLS): Biết tìm kiếm thông tin theo mục lục sách điện tử.',
      },
      {
        week: '8',
        lessonName: 'Bài 16: Khi trang sách mở ra',
        subLessonName: 'Đọc: Khi trang sách mở ra (2t) | Nghe-viết + Phân biệt l/n, ăn/ăng, ân/âng (1t) | LTVC: Từ ngữ chỉ đặc điểm; Câu nêu đặc điểm; Dấu chấm, dấu chấm hỏi (1t) | Luyện viết đoạn: Tả đồ dùng học tập & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 75–80)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp ANQP: Giáo dục tình yêu quê hương đất nước. Viết được đoạn văn ngắn tả đồ dùng học tập thân thuộc.',
      },
      {
        week: '9',
        lessonName: 'Ôn tập giữa học kì I',
        subLessonName: 'Tiết 1–2: Đọc | Tiết 3–4: Viết + Nói và nghe | Tiết 5–6: Đọc | Tiết 7–8: Viết + LTVC | Tiết 9–10: Luyện viết đoạn + ĐMR (Kiểm tra ĐG giữa HKI)',
        periodAllocation: '10 tiết (Tiết 81–90)',
        periodsCount: 10,
        adjustedContent:
          'Hệ thống hóa kiến thức Đọc, Viết, LTVC, Nói và nghe trong nửa đầu Học kì I (Chủ điểm 1 & 2) và thực hiện đánh giá giữa học kì I.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tv-cd3',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 13',
    totalPeriods: 40,
    chapterCode: 'TV2-CĐ3',
    chapterTitle: 'Chủ điểm 3: Niềm vui tuổi thơ (Bài 17 – Bài 24)',
    topicTitle: 'Gọi bạn; Tớ nhớ cậu; Chữ A và những người bạn; Nhím Nâu kết bạn; Thả diều; Tớ là Lê-gô; Rồng rắn lên mây; Nặn đồ chơi',
    adjustedContentSummary:
      'Đọc, Viết chữ hoa H, I, K, L, M; LTVC mở rộng vốn từ về tình cảm bạn bè, đồ chơi, dấu chấm, dấu chấm hỏi, dấu chấm than, dấu phẩy; Viết đoạn văn kể hoạt động cùng bạn, giờ ra chơi, giới thiệu/tả đồ chơi. Tích hợp BVMT, AI (2.A1.1), ATGT, Lí tưởng CM - đạo đức - lối sống.',
    lessons: [
      {
        week: '10',
        lessonName: 'Bài 17: Gọi bạn',
        subLessonName: 'Đọc: Gọi bạn (2 tiết) | Viết: Chữ hoa H (1 tiết) | Nói và nghe: Kể chuyện Gọi bạn (1 tiết)',
        periodAllocation: '4 tiết (Tiết 91–94)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu bài thơ Gọi bạn, bồi dưỡng tình bạn gắn bó, giúp đỡ nhau lúc khó khăn; viết đúng chữ hoa H; kể lại được câu chuyện Gọi bạn.',
      },
      {
        week: '10',
        lessonName: 'Bài 18: Tớ nhớ cậu',
        subLessonName: 'Đọc: Tớ nhớ cậu (2t) | Nghe-viết + Phân biệt c/k, iêu/ươu, en/eng (1t) | LTVC: MRVT về tình cảm bạn bè; Dấu chấm, dấu chấm hỏi, dấu chấm than (1t) | Luyện viết đoạn: Kể hoạt động tham gia cùng bạn & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 95–100)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD BVMT: Giáo dục học sinh cùng nhau phân loại rác thải để giảm thiểu lượng rác thải ra ngoài môi trường.',
      },
      {
        week: '11',
        lessonName: 'Bài 19: Chữ A và những người bạn',
        subLessonName: 'Đọc: Chữ A và những người bạn (2 tiết) | Viết: Chữ hoa I, K (1 tiết) | Nói và nghe: Niềm vui của em (1 tiết)',
        periodAllocation: '4 tiết (Tiết 101–104)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI 2.A1.1: Nhận biết một số tình huống AI có thể hỗ trợ con người gợi ý lời nói trong giao tiếp đơn giản.',
      },
      {
        week: '11',
        lessonName: 'Bài 20: Nhím Nâu kết bạn',
        subLessonName: 'Đọc: Nhím Nâu kết bạn (2t) | Nghe-viết + Phân biệt g/gh, iu/ưu, iên/iêng (1t) | LTVC: Từ ngữ chỉ đặc điểm, hoạt động; Câu nêu hoạt động (1t) | Luyện viết đoạn: Kể về một giờ ra chơi & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 105–110)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD phòng tránh tai nạn thương tích trong giờ ra chơi ở trường học. Viết đoạn văn kể về một giờ ra chơi vui vẻ, an toàn.',
      },
      {
        week: '12',
        lessonName: 'Bài 21: Thả diều',
        subLessonName: 'Đọc: Thả diều (2 tiết) | Viết: Chữ hoa L (1 tiết) | Nói và nghe: Kể chuyện Chúng mình là bạn (1 tiết)',
        periodAllocation: '4 tiết (Tiết 111–114)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD ATGT: Học sinh biết lựa chọn và vui chơi ở nơi an toàn (không thả diều gần đường dây điện, đường giao thông).',
      },
      {
        week: '12',
        lessonName: 'Bài 22: Tớ là Lê-gô',
        subLessonName: 'Đọc: Tớ là Lê-gô (2t) | Nghe-viết: Đồ chơi yêu thích + Phân biệt ng/ngh, ch/tr, uôn/uông (1t) | LTVC: Từ ngữ chỉ sự vật, đặc điểm; Câu nêu đặc điểm (1t) | Luyện viết đoạn: Giới thiệu một đồ chơi & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 115–120)',
        periodsCount: 6,
        adjustedContent:
          'Đọc hiểu văn bản Tớ là Lê-gô; nhận biết từ ngữ chỉ sự vật, đặc điểm và viết đoạn văn giới thiệu một món đồ chơi em yêu thích.',
      },
      {
        week: '13',
        lessonName: 'Bài 23: Rồng rắn lên mây',
        subLessonName: 'Đọc: Rồng rắn lên mây (2 tiết) | Viết: Chữ hoa M (1 tiết) | Nói và nghe: Kể chuyện Búp bê biết khóc (1 tiết)',
        periodAllocation: '4 tiết (Tiết 121–124)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD lí tưởng cách mạng, đạo đức, lối sống: Biết trân trọng và giữ gìn các trò chơi dân gian truyền thống.',
      },
      {
        week: '13',
        lessonName: 'Bài 24: Nặn đồ chơi',
        subLessonName: 'Đọc: Nặn đồ chơi (2t) | Nghe-viết + Phân biệt d/gi, s/x, ươn/ương (1t) | LTVC: MRVT đồ chơi; Dấu phẩy (1t) | Luyện viết đoạn: Tả đồ chơi & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 125–130)',
        periodsCount: 6,
        adjustedContent:
          'Mở rộng vốn từ về đồ chơi, biết sử dụng dấu phẩy trong câu và viết đoạn văn ngắn tả một món đồ chơi.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tv-cd4',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 50,
    chapterCode: 'TV2-CĐ4',
    chapterTitle: 'Chủ điểm 4: Mái ấm gia đình (Bài 25 – Bài 32 & Ôn tập cuối HKI)',
    topicTitle: 'Sự tích hoa tỉ muội; Em mang về yêu thương; Mẹ; Trò chơi của bố; Cánh cửa nhớ bà; Thương ông; Ánh sáng của yêu thương; Chơi chong chóng; Ôn tập & ĐG cuối HKI',
    adjustedContentSummary:
      'Đọc, Viết chữ hoa N, O, Ô, Ơ, P và tên riêng địa lí; LTVC mở rộng vốn từ về gia đình, tình cảm gia đình, dấu câu; Viết đoạn văn về người thân, viết tin nhắn. Tích hợp AI (A2.2), Tiếp cận giới, QCN, NLS (2.3.CB1a), Liên hệ đơn vị hành chính mới thôn Hà Sơn, thôn Tháp Hà.',
    lessons: [
      {
        week: '14',
        lessonName: 'Bài 25: Sự tích hoa tỉ muội',
        subLessonName: 'Đọc: Sự tích hoa tỉ muội (2 tiết) | Viết: Chữ hoa N (1 tiết) | Nói và nghe: Kể chuyện Hai anh em (1 tiết)',
        periodAllocation: '4 tiết (Tiết 131–134)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI - A2.2: Nhận biết AI/thiết bị thông minh có thể hỗ trợ chăm sóc, nhắc nhở hoặc báo hiệu khi người thân cần giúp đỡ. Tích hợp GD lí tưởng CM, đạo đức, lối sống: Trong gia đình cần biết yêu thương, đoàn kết.',
      },
      {
        week: '14',
        lessonName: 'Bài 26: Em mang về yêu thương',
        subLessonName: 'Đọc: Em mang về yêu thương (2t) | Nghe-viết + Phân biệt iên/yên/uyên, r/d/gi, ai/ay (1t) | LTVC: MRVT về gia đình, từ ngữ chỉ đặc điểm; Câu nêu đặc điểm (1t) | Luyện viết đoạn: Kể việc người thân đã làm cho em & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 135–140)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp Tiếp cận giới: Sự bình đẳng trong tình yêu thương và trách nhiệm chăm sóc gia đình.',
      },
      {
        week: '15',
        lessonName: 'Bài 27: Mẹ',
        subLessonName: 'Đọc: Mẹ (2 tiết) | Viết: Chữ hoa O (1 tiết) | Nói và nghe: Kể chuyện Sự tích cây vú sữa (1 tiết)',
        periodAllocation: '4 tiết (Tiết 141–144)',
        periodsCount: 4,
        adjustedContent:
          'Đọc thuộc lòng bài thơ Mẹ; viết đúng chữ hoa O; kể chuyện Sự tích cây vú sữa và bày tỏ lòng biết ơn mẹ.',
      },
      {
        week: '15',
        lessonName: 'Bài 28: Trò chơi của bố',
        subLessonName: 'Đọc: Trò chơi của bố (2t) | Nghe-viết + Viết hoa tên riêng địa lí + Phân biệt l/n, ao/au (1t) | LTVC: MRVT về tình cảm gia đình; Dấu chấm, dấu chấm hỏi, dấu chấm than (1t) | Luyện viết đoạn: Thể hiện tình cảm với người thân & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 145–150)',
        periodsCount: 6,
        adjustedContent:
          'Liên hệ đơn vị hành chính mới (GDĐP): Thôn Hà Lạc và thôn Sơn Công sáp nhập thành thôn Hà Sơn; thôn Tháp Nhuận và thôn Hà Công sáp nhập thành thôn Tháp Hà.',
      },
      {
        week: '16',
        lessonName: 'Bài 29: Cánh cửa nhớ bà',
        subLessonName: 'Đọc: Cánh cửa nhớ bà (2 tiết) | Viết: Chữ hoa Ô, Ơ (1 tiết) | Nói và nghe: Kể chuyện Bà cháu (1 tiết)',
        periodAllocation: '4 tiết (Tiết 151–154)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Quyền con người (QCN): Bổn phận của em đối với ông bà và người thân trong gia đình.',
      },
      {
        week: '16',
        lessonName: 'Bài 30: Thương ông',
        subLessonName: 'Đọc: Thương ông (2t) | Nghe-viết + Phân biệt ch/tr, ac/at (1t) | LTVC: Từ chỉ sự vật, hoạt động; Câu nêu hoạt động (1t) | Luyện viết đoạn: Kể việc đã làm cùng người thân & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 155–160)',
        periodsCount: 6,
        adjustedContent:
          'Đọc hiểu bài thơ Thương ông; đặt câu nêu hoạt động và viết đoạn văn kể về một việc em đã làm cùng người thân.',
      },
      {
        week: '17',
        lessonName: 'Bài 31: Ánh sáng của yêu thương',
        subLessonName: 'Đọc: Ánh sáng của yêu thương (2 tiết) | Viết: Chữ hoa P (1 tiết) | Nói và nghe: Kể chuyện Ánh sáng của yêu thương (1 tiết)',
        periodAllocation: '4 tiết (Tiết 161–164)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu và kể lại câu chuyện Ánh sáng của yêu thương; viết đúng chữ hoa P.',
      },
      {
        week: '17',
        lessonName: 'Bài 32: Chơi chong chóng',
        subLessonName: 'Đọc: Chơi chong chóng (2t) | Nghe-viết + Phân biệt iu/ưu, ât/âc, ăt/ăc (1t) | LTVC: MRVT về tình cảm gia đình; Dấu phẩy (1t) | Luyện viết đoạn: Viết tin nhắn & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 165–170)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 2.3.CB1a: Giao tiếp, hợp tác trong môi trường số bằng hình thức đơn giản, phù hợp (viết tin nhắn ngắn gọn, lịch sự).',
      },
      {
        week: '18',
        lessonName: 'Ôn tập và Đánh giá cuối học kì I',
        subLessonName: 'Ôn tập cuối học kì 1 (Tiết 1–8) & Đánh giá cuối học kì 1 (Tiết 9–10)',
        periodAllocation: '10 tiết (Tiết 171–180)',
        periodsCount: 10,
        adjustedContent:
          'Tổng hợp, hệ thống hóa kiến thức Tiếng Việt Học kì I (Chủ điểm 1–4) và thực hiện bài kiểm tra đánh giá định kì cuối học kì I.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tv-cd5',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 22',
    totalPeriods: 40,
    chapterCode: 'TV2-CĐ5',
    chapterTitle: 'Chủ điểm 5: Vẻ đẹp quanh em (Bài 1 – Bài 8 HKII)',
    topicTitle: 'Chuyện bốn mùa; Mùa nước nổi; Họa mi hót; Tết đến rồi; Giọt nước và biển lớn; Mùa vàng; Hạt thóc; Lũy tre',
    adjustedContentSummary:
      'Đọc, Viết chữ hoa Q, R, S, T; LTVC mở rộng vốn từ về các mùa, ngày Tết, cây cối, thiên nhiên; Viết thiệp chúc Tết, kể việc chăm sóc cây cối. Tích hợp GDĐP Huế, Phòng tránh đuối nước, BVMT, An toàn vệ sinh thực phẩm, Tiết kiệm nguồn nước, AI (2.C3.1).',
    lessons: [
      {
        week: '19',
        lessonName: 'Bài 1 (HKII): Chuyện bốn mùa',
        subLessonName: 'Đọc: Chuyện bốn mùa (2 tiết) | Viết: Chữ hoa Q (1 tiết) | Nói và nghe: Kể chuyện Chuyện bốn mùa (1 tiết)',
        periodAllocation: '4 tiết (Tiết 1–4 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GDĐP: Thời tiết ở Huế qua bốn mùa. Đọc hiểu và kể lại câu chuyện Chuyện bốn mùa.',
      },
      {
        week: '19',
        lessonName: 'Bài 2 (HKII): Mùa nước nổi',
        subLessonName: 'Đọc: Mùa nước nổi (2t) | Nghe-viết + Phân biệt c/k, ch/tr, ac/at (1t) | LTVC: MRVT về các mùa; Dấu chấm, dấu chấm hỏi (1t) | Luyện viết đoạn: Tả một đồ vật & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 5–10 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD phòng tránh tai nạn đuối nước vào mùa mưa lũ (KNS). Mở rộng vốn từ về các mùa trong năm.',
      },
      {
        week: '20',
        lessonName: 'Bài 3 (HKII): Họa mi hót',
        subLessonName: 'Đọc: Họa mi hót (2 tiết) | Viết: Chữ hoa R (1 tiết) | Nói và nghe: Kể chuyện Hồ nước và mây (1 tiết)',
        periodAllocation: '4 tiết (Tiết 11–14 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD BVMT: Bảo vệ môi trường sống của các loài vật. Viết đúng chữ hoa R.',
      },
      {
        week: '20',
        lessonName: 'Bài 4 (HKII): Tết đến rồi',
        subLessonName: 'Đọc: Tết đến rồi (2t) | Nghe-viết + Phân biệt g/gh, s/x, uc/ut (1t) | LTVC: MRVT về ngày Tết; Dấu chấm, dấu chấm hỏi (1t) | Luyện viết đoạn: Viết thiệp chúc Tết & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 15–20 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD An toàn vệ sinh thực phẩm: Học sinh có ý thức ăn uống hợp vệ sinh trong dịp lễ, Tết để đảm bảo sức khoẻ.',
      },
      {
        week: '21',
        lessonName: 'Bài 5 (HKII): Giọt nước và biển lớn',
        subLessonName: 'Đọc: Giọt nước và biển lớn (2 tiết) | Viết: Chữ hoa S (1 tiết) | Nói và nghe: Chiếc đèn lồng (1 tiết)',
        periodAllocation: '4 tiết (Tiết 21–24 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp tiết kiệm và bảo vệ nguồn nước (BVMT): Học sinh nhận biết nước là tài nguyên quý, hình thành thói quen sử dụng nước tiết kiệm và không làm ô nhiễm nguồn nước.',
      },
      {
        week: '21',
        lessonName: 'Bài 6 (HKII): Mùa vàng',
        subLessonName: 'Đọc: Mùa vàng (2t) | Nghe-viết + Phân biệt ng/ngh, r/d/gi, ưc/ưt (1t) | LTVC: MRVT về cây cối (1t) | Luyện viết đoạn: Kể về việc chăm sóc cây cối & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 25–30 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp nội dung giáo dục địa phương (GDĐP): Thể hiện thái độ kính trọng và biết ơn những người nông dân.',
      },
      {
        week: '22',
        lessonName: 'Bài 7 (HKII): Hạt thóc',
        subLessonName: 'Đọc: Hạt thóc (2 tiết) | Viết: Chữ hoa T (1 tiết) | Nói và nghe: Sự tích cây khoai lang (1 tiết)',
        periodAllocation: '4 tiết (Tiết 31–34 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp đạo đức, lối sống: Giáo dục học sinh biết ơn người nông dân, trân trọng hạt thóc, hạt gạo.',
      },
      {
        week: '22',
        lessonName: 'Bài 8 (HKII): Lũy tre',
        subLessonName: 'Đọc: Lũy tre (2t) | Nghe-viết + Phân biệt uynh/uych, l/n, iêc/iêt (1t) | LTVC: MRVT về thiên nhiên; Câu nêu đặc điểm (1t) | Luyện viết đoạn: Kể một sự việc đã tham gia/chứng kiến & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 35–40 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp AI 2.C3.1: Học sinh nhận biết AI có thể hỗ trợ nhận diện cây tre hoặc cảnh vật thiên nhiên qua hình ảnh, nhưng cần quan sát kĩ và đối chiếu với hiểu biết thực tế vì AI có thể nhận nhầm.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tv-cd6',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 27',
    totalPeriods: 50,
    chapterCode: 'TV2-CĐ6',
    chapterTitle: 'Chủ điểm 6: Hành tinh xanh của em (Bài 9 – Bài 16 HKII & Ôn tập giữa HKII)',
    topicTitle: 'Vè chim; Khủng long; Sự tích cây thì là; Bờ tre đón khách; Tiếng chổi tre; Cỏ non cười rồi; Những con sao biển; Tạm biệt cánh cam; Ôn tập giữa HKII',
    adjustedContentSummary:
      'Đọc, Viết chữ hoa U, Ư, V, X, Y; LTVC mở rộng vốn từ về muông thú, vật nuôi, bảo vệ môi trường, các loài vật nhỏ bé; Viết đoạn văn giới thiệu con vật, viết lời xin lỗi, kể việc bảo vệ môi trường. Tích hợp Kĩ năng công dân số, NLS (3.2.CB1a), BVMT, Lí tưởng CM - đạo đức - lối sống.',
    lessons: [
      {
        week: '23',
        lessonName: 'Bài 9 (HKII): Vè chim',
        subLessonName: 'Đọc: Vè chim (2 tiết) | Viết: Chữ hoa U, Ư (1 tiết) | Nói và nghe: Kể chuyện Cảm ơn họa mi (1 tiết)',
        periodAllocation: '4 tiết (Tiết 41–44 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu bài Vè chim, nhận biết tên và đặc điểm một số loài chim; viết đúng chữ hoa U, Ư; kể chuyện Cảm ơn họa mi.',
      },
      {
        week: '23',
        lessonName: 'Bài 10 (HKII): Khủng long',
        subLessonName: 'Đọc: Khủng long (2t) | Nghe-viết + Phân biệt uya/uyu, iêu/ươu, uôt/uôc (1t) | LTVC: MRVT về muông thú (1t) | Luyện viết đoạn: Giới thiệu tranh ảnh về một con vật & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 45–50 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp kĩ năng công dân số (NLS): Sử dụng thiết bị điện tử để tìm kiếm thông tin về một số loài vật sống hoang dã.',
      },
      {
        week: '24',
        lessonName: 'Bài 11 (HKII): Sự tích cây thì là',
        subLessonName: 'Đọc: Sự tích cây thì là (2 tiết) | Viết: Chữ hoa V (1 tiết) | Nói và nghe: Kể chuyện Sự tích cây thì là (1 tiết)',
        periodAllocation: '4 tiết (Tiết 51–54 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu và kể lại câu chuyện Sự tích cây thì là; viết đúng chữ hoa V.',
      },
      {
        week: '24',
        lessonName: 'Bài 12 (HKII): Bờ tre đón khách',
        subLessonName: 'Đọc: Bờ tre đón khách (2t) | Nghe-viết + Phân biệt d/gi, iu/ưu, ươc/ươt (1t) | LTVC: MRVT vật nuôi; Câu nêu đặc điểm của các loài vật (1t) | Luyện viết đoạn: Kể về hoạt động của con vật & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 55–60 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp kĩ năng công dân số (NLS): Sử dụng thiết bị điện tử để tìm kiếm thông tin về một số loài vật.',
      },
      {
        week: '25',
        lessonName: 'Bài 13 (HKII): Tiếng chổi tre',
        subLessonName: 'Đọc: Tiếng chổi tre (2 tiết) | Viết: Chữ hoa X (1 tiết) | Nói và nghe: Kể chuyện Hạt giống nhỏ (1 tiết)',
        periodAllocation: '4 tiết (Tiết 61–64 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Trân trọng người lao động; sống xanh; có trách nhiệm giữ gìn môi trường.',
      },
      {
        week: '25',
        lessonName: 'Bài 14 (HKII): Cỏ non cười rồi',
        subLessonName: 'Đọc: Cỏ non biết cười (2t) | Nghe-viết + Phân biệt ng/ngh, tr/ch, êt/êch (1t) | LTVC: MRVT về bảo vệ môi trường; Dấu phẩy (1t) | Luyện viết đoạn: Viết lời xin lỗi & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 65–70 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Mở rộng vốn từ về bảo vệ môi trường; biết nói và viết lời xin lỗi chân thành, lịch sự.',
      },
      {
        week: '26',
        lessonName: 'Bài 15 (HKII): Những con sao biển',
        subLessonName: 'Đọc: Những con sao biển (2 tiết) | Viết: Chữ hoa Y (1 tiết) | Nói và nghe: Bảo vệ môi trường (1 tiết)',
        periodAllocation: '4 tiết (Tiết 71–74 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp giáo dục BVMT: Biết làm những việc để bảo vệ môi trường biển và các sinh vật biển. Tích hợp NLS 3.2.CB1a: HS biết chọn, điều chỉnh, bổ sung nội dung đơn giản trên tranh/phiếu số để trình bày việc làm bảo vệ môi trường.',
      },
      {
        week: '26',
        lessonName: 'Bài 16 (HKII): Tạm biệt cánh cam',
        subLessonName: 'Đọc: Tạm biệt cánh cam (2t) | Nghe-viết + Phân biệt oanh/oach, s/x (1t) | LTVC: MRVT về các loài vật nhỏ bé; Dấu chấm, dấu chấm hỏi (1t) | Luyện viết đoạn: Kể việc làm bảo vệ môi trường & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 75–80 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp giáo dục BVMT: Biết yêu quý, bảo vệ các loài vật có ích và viết đoạn văn kể việc làm bảo vệ môi trường.',
      },
      {
        week: '27',
        lessonName: 'Ôn tập giữa học kì II',
        subLessonName: 'Tiết 1–2: Đọc | Tiết 3–4: Viết + Nói và nghe | Tiết 5–6: Đọc | Tiết 7–8: Viết + LTVC | Tiết 9–10: Luyện viết đoạn + ĐMR (Kiểm tra ĐG giữa HKII)',
        periodAllocation: '10 tiết (Tiết 81–90 HKII)',
        periodsCount: 10,
        adjustedContent:
          'Hệ thống hóa kiến thức nửa đầu Học kì II (Chủ điểm 5 & 6) và thực hiện đánh giá định kì giữa học kì II.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tv-cd7-8',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 35',
    totalPeriods: 80,
    chapterCode: 'TV2-CĐ7-8',
    chapterTitle: 'Chủ điểm 7 & 8: Giao tiếp và kết nối – Việt Nam quê hương em (Bài 17 – Bài 30 HKII & Ôn tập cuối năm)',
    topicTitle: 'Những cách chào độc đáo; Thư viện biết đi; Cảm ơn anh hà mã; Từ chú bồ câu đến in-tơ-nét; Mai An Tiêm; Thư gửi bố ngoài đảo; Bóp nát quả cam; Chiếc rễ đa tròn; Đất nước chúng mình; Trên các miền đất nước; Chuyện quả bầu; Khám phá đáy biển ở Trường Sa; Hồ Gươm; Cánh đồng quê em',
    adjustedContentSummary:
      'Đọc, Viết chữ hoa kiểu 2 (A, M, N, Q, V) và tên riêng địa lí; LTVC mở rộng vốn từ về giao tiếp, kết nối, nghề nghiệp, Bác Hồ và nhân dân, sản phẩm truyền thống, loài vật dưới biển; Viết lời cảm ơn chú bộ đội hải quân, kể về công việc của một người. Tích hợp NLS (4.1.CB1b), QPAN/ANQP (biển đảo Trường Sa), TTHCM, GDĐP Huế.',
    lessons: [
      {
        week: '28',
        lessonName: 'Bài 17 (HKII): Những cách chào độc đáo',
        subLessonName: 'Đọc: Những cách chào độc đáo (2 tiết) | Viết: Chữ hoa A kiểu 2 (1 tiết) | Nói và nghe: Kể chuyện Lớp học viết thư (1 tiết)',
        periodAllocation: '4 tiết (Tiết 91–94 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu văn bản Những cách chào độc đáo; viết đúng chữ hoa A (kiểu 2); kể chuyện Lớp học viết thư.',
      },
      {
        week: '28',
        lessonName: 'Bài 18 (HKII): Thư viện biết đi',
        subLessonName: 'Đọc: Thư viện biết đi (2t) | Nghe-viết + Phân biệt d/gi, ch/tr (1t) | LTVC: Dấu chấm, dấu chấm than, dấu phẩy (1t) | Luyện viết đoạn: Giới thiệu đồ dùng học tập & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 95–100 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Xây dựng văn hóa đọc; ứng xử văn minh nơi công cộng; biết chia sẻ tri thức và tôn trọng nội quy thư viện.',
      },
      {
        week: '29',
        lessonName: 'Bài 19 (HKII): Cảm ơn anh hà mã',
        subLessonName: 'Đọc: Cảm ơn anh hà mã (2 tiết) | Viết: Chữ hoa M kiểu 2 (1 tiết) | Nói và nghe: Kể chuyện Cảm ơn anh hà mã (1 tiết)',
        periodAllocation: '4 tiết (Tiết 101–104 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Đọc hiểu câu chuyện về cách ứng xử lịch sự, biết nói lời cảm ơn; viết đúng chữ hoa M (kiểu 2).',
      },
      {
        week: '29',
        lessonName: 'Bài 20 (HKII): Từ chú bồ câu đến in-tơ-nét',
        subLessonName: 'Đọc: Từ chú bồ câu đến in-tơ-nét (2t) | Nghe-viết + Phân biệt eo/oe, l/n, ên/ênh (1t) | LTVC: MRVT về giao tiếp, kết nối; Dấu chấm, dấu phẩy (1t) | Luyện viết đoạn: Tả một đồ dùng trong gia đình & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 105–110 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 4.1.CB1b: Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số. Tích hợp kĩ năng công dân số: Sử dụng thiết bị điện tử để tìm kiếm cách sử dụng một số thiết bị điện (ti vi, máy ảnh, nồi cơm, máy giặt...).',
      },
      {
        week: '30',
        lessonName: 'Bài 21 (HKII): Mai An Tiêm',
        subLessonName: 'Đọc: Mai An Tiêm (2 tiết) | Viết: Chữ hoa N kiểu 2 (1 tiết) | Nói và nghe: Kể chuyện Mai An Tiêm (1 tiết)',
        periodAllocation: '4 tiết (Tiết 111–114 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Nêu gương ý chí vươn lên, tinh thần tự lực và lao động chân chính; giáo dục HS sống trung thực, kiên trì, có trách nhiệm.',
      },
      {
        week: '30',
        lessonName: 'Bài 22 (HKII): Thư gửi bố ngoài đảo',
        subLessonName: 'Đọc: Thư gửi bố ngoài đảo (2t) | Nghe-viết + Phân biệt d/gi, s/x, ip/iêp (1t) | LTVC: MRVT về nghề nghiệp (1t) | Luyện viết đoạn: Viết lời cảm ơn các chú bộ đội hải quân & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 115–120 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD QPAN / ANQP: Biết được công việc của những người làm việc trên biển, biết ơn và viết lời cảm ơn các chú bộ đội hải quân làm nhiệm vụ bảo vệ biển đảo Tổ quốc.',
      },
      {
        week: '31',
        lessonName: 'Bài 23 (HKII): Bóp nát quả cam',
        subLessonName: 'Đọc: Bóp nát quả cam (2 tiết) | Viết: Chữ hoa Q kiểu 2 (1 tiết) | Nói và nghe: Kể chuyện Bóp nát quả cam (1 tiết)',
        periodAllocation: '4 tiết (Tiết 121–124 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp ANQP: Qua nhân vật Trần Quốc Toản, học sinh biết trân trọng truyền thống chống giặc ngoại xâm, bồi dưỡng lòng yêu nước.',
      },
      {
        week: '31',
        lessonName: 'Bài 24 (HKII): Chiếc rễ đa tròn',
        subLessonName: 'Đọc: Chiếc rễ đa tròn (2t) | Nghe-viết + Viết hoa tên người; Phân biệt iu/ưu, im/iêm (1t) | LTVC: MRVT về Bác Hồ và nhân dân (1t) | Luyện viết đoạn: Kể một sự việc & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 125–130 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD lí tưởng cách mạng, đạo đức, lối sống (TTHCM): Học tập lối sống giản dị, tình yêu thương thiếu nhi và trách nhiệm của Bác Hồ.',
      },
      {
        week: '32',
        lessonName: 'Bài 25 (HKII): Đất nước chúng mình',
        subLessonName: 'Đọc: Đất nước chúng mình (2 tiết) | Viết: Chữ hoa V kiểu 2 (1 tiết) | Nói và nghe: Kể chuyện Thánh Gióng (1 tiết)',
        periodAllocation: '4 tiết (Tiết 131–134 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp ANQP: Tình yêu đất nước, tự hào bản sắc văn hóa dân tộc và con người Việt Nam; giải thích ý nghĩa lá cờ Tổ quốc.',
      },
      {
        week: '32',
        lessonName: 'Bài 26 (HKII): Trên các miền đất nước',
        subLessonName: 'Đọc: Trên các miền đất nước (2t) | Nghe-viết + Viết hoa tên riêng địa lí; Phân biệt ch/tr, iu/iêu (1t) | LTVC: MRVT về sản phẩm truyền thống của đất nước; Câu giới thiệu (1t) | Luyện viết đoạn: Giới thiệu đồ vật làm từ tre/gỗ & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 135–140 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Liên hệ đơn vị hành chính mới sau khi sáp nhập: Giới thiệu bản đồ hành chính mới của Việt Nam.',
      },
      {
        week: '33',
        lessonName: 'Bài 27 (HKII): Chuyện quả bầu',
        subLessonName: 'Đọc: Chuyện quả bầu (2 tiết) | Viết: Ôn chữ hoa A, M, N kiểu 2 (1 tiết) | Nói và nghe: Kể chuyện Chuyện quả bầu (1 tiết)',
        periodAllocation: '4 tiết (Tiết 141–144 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp ANQP: Tinh thần đoàn kết các dân tộc anh em trên đất nước Việt Nam và niềm tự hào dân tộc.',
      },
      {
        week: '33',
        lessonName: 'Bài 28 (HKII): Khám phá đáy biển ở Trường Sa',
        subLessonName: 'Đọc: Khám phá đáy biển ở Trường Sa (2t) | Nghe-viết + Phân biệt it/uyt, ươu/iêu, in/inh (1t) | LTVC: MRVT về các loài vật dưới biển; Dấu chấm, dấu phẩy (1t) | Luyện viết đoạn: Kể về một buổi đi chơi & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 145–150 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp ANQP: Yêu quý cảnh đẹp Trường Sa; khẳng định Trường Sa là một quần đảo thiêng liêng của Việt Nam.',
      },
      {
        week: '34',
        lessonName: 'Bài 29 (HKII): Hồ Gươm',
        subLessonName: 'Đọc: Hồ Gươm (2 tiết) | Viết: Ôn chữ hoa Q, V kiểu 2 (1 tiết) | Nói và nghe: Nói về quê hương, đất nước em (1 tiết)',
        periodAllocation: '4 tiết (Tiết 151–154 HKII)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD địa phương (GDĐP): Khám phá vẻ đẹp thiên nhiên và danh lam thắng cảnh quê hương Huế.',
      },
      {
        week: '34',
        lessonName: 'Bài 30 (HKII): Cánh đồng quê em',
        subLessonName: 'Đọc: Cánh đồng quê em (2t) | Nghe-viết: Cánh đồng quê em (1t) | LTVC: MRVT về nghề nghiệp (1t) | Luyện viết đoạn: Kể về công việc của một người & ĐMR (2t)',
        periodAllocation: '6 tiết (Tiết 155–160 HKII)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD BVMT: Yêu quý và bảo vệ thiên nhiên. Tích hợp GDĐP: Tìm hiểu nghề nghiệp của ba mẹ và hàng xóm của em.',
      },
      {
        week: '35',
        lessonName: 'Ôn tập và Đánh giá cuối học kì II (Cuối năm học)',
        subLessonName: 'Ôn tập cuối học kì 2 (Tiết 1–8) & Đánh giá cuối học kì 2 (Tiết 9–10)',
        periodAllocation: '10 tiết (Tiết 161–170 HKII)',
        periodsCount: 10,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt lớp 2 cả năm học và thực hiện bài kiểm tra đánh giá định kì cuối học kì II.',
      },
    ],
  }),
];

/**
 * 2. MÔN TOÁN LỚP 2 (175 TIẾT / 35 TUẦN – 5 TIẾT/TUẦN)
 * HKI: 90 tiết / 18 tuần (Chủ đề 1–7, Bài 1–36 + Kiểm tra cuối HKI)
 * HKII: 85 tiết / 17 tuần (Chủ đề 8–14, Bài 37–75 + Kiểm tra cuối năm)
 */
export const GRADE2_TOAN_TOPICS: CurriculumTopic[] = [
  buildGrade2Topic({
    id: 'nda-2026-g2-math-cd1-2',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 8',
    totalPeriods: 38,
    chapterCode: 'T2-CĐ1-2',
    chapterTitle: 'Chủ đề 1 & 2: Ôn tập và bổ sung – Phép cộng, phép trừ trong phạm vi 20 (Bài 1 – Bài 14)',
    topicTitle: 'Ôn tập các số đến 100; Tia số; Số hạng, tổng, số bị trừ, số trừ, hiệu; Hơn, kém nhau bao nhiêu; Phép cộng, phép trừ (qua 10) trong phạm vi 20',
    adjustedContentSummary:
      'Đọc, viết, so sánh các số đến 100; nhận biết tia số, số liền trước/sau; thực hiện thành thạo bảng cộng, bảng trừ (qua 10) trong phạm vi 20 và giải toán có lời văn. Tích hợp AI (2.D1.1), GD lí tưởng CM - đạo đức - lối sống, ATGT.',
    lessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Ôn tập các số đến 100',
        subLessonName: 'Tiết 1, 2, 3: Luyện tập',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Đọc, viết, so sánh, sắp thứ tự các số trong phạm vi 100; phân tích số có hai chữ số thành chục và đơn vị.',
      },
      {
        week: '1–2',
        lessonName: 'Bài 2: Tia số. Số liền trước, số liền sau',
        subLessonName: 'Tiết 4, 5',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nhận biết tia số, vị trí các số trên tia số; tìm được số liền trước, số liền sau của một số cho trước.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Các thành phần của phép cộng, phép trừ',
        subLessonName: 'Tiết 6: Số hạng, tổng | Tiết 7: Số bị trừ, số trừ, hiệu | Tiết 8: Luyện tập',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết tên gọi thành phần và kết quả của phép cộng (số hạng, tổng) và phép trừ (số bị trừ, số trừ, hiệu).',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Hơn, kém nhau bao nhiêu',
        subLessonName: 'Tiết 9, 10',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.D1.1: Nêu được một số vấn đề đơn giản trong đời sống có thể áp dụng AI để giải quyết. Biết tìm hai số hơn, kém nhau bao nhiêu đơn vị.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100',
        subLessonName: 'Tiết 11, 12, 13: Luyện tập',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện được phép cộng, phép trừ (không nhớ) các số trong phạm vi 100 và vận dụng giải toán.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Luyện tập chung',
        subLessonName: 'Tiết 14, 15',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Củng cố kiến thức Chủ đề 1 về các số và phép cộng, trừ không nhớ trong phạm vi 100.',
      },
      {
        week: '4',
        lessonName: 'Bài 7: Phép cộng (qua 10) trong phạm vi 20',
        subLessonName: 'Tiết 16–20',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Thực hiện được phép cộng (qua 10) trong phạm vi 20 bằng cách tách số. Tích hợp GD lí tưởng CM, đạo đức, lối sống: GDHS biết quan tâm, chia sẻ, giúp đỡ người gặp khó khăn. Tích hợp GD ATGT: Thực hiện tốt ATGT khi tham gia đường sắt.',
      },
      {
        week: '5',
        lessonName: 'Bài 8: Bảng cộng (qua 10)',
        subLessonName: 'Tiết 21, 22',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hình thành và ghi nhớ bảng cộng (qua 10) để tính nhẩm nhanh trong phạm vi 20.',
      },
      {
        week: '5',
        lessonName: 'Bài 9: Bài toán về thêm, bớt một số đơn vị',
        subLessonName: 'Tiết 23: Giải bài toán về thêm một số đơn vị | Tiết 24: Giải bài toán về bớt một số đơn vị',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Giải được bài toán có lời văn bằng một phép cộng hoặc một phép trừ (thêm, bớt một số đơn vị). Tích hợp giáo dục ATGT: Khi tham gia phương tiện tàu, thuyền; lên xuống xe buýt.',
      },
      {
        week: '5–6',
        lessonName: 'Bài 10: Luyện tập chung',
        subLessonName: 'Tiết 25, 26',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Luyện tập bảng cộng (qua 10) và giải bài toán về thêm, bớt một số đơn vị.',
      },
      {
        week: '6–7',
        lessonName: 'Bài 11: Phép trừ (qua 10) trong phạm vi 20',
        subLessonName: 'Tiết 27–31',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Thực hiện được phép trừ (qua 10) trong phạm vi 20.',
      },
      {
        week: '7',
        lessonName: 'Bài 12: Bảng trừ (qua 10)',
        subLessonName: 'Tiết 32, 33',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hình thành và vận dụng bảng trừ (qua 10) vào tính nhẩm và giải toán thực tế.',
      },
      {
        week: '7',
        lessonName: 'Bài 13: Bài toán về nhiều hơn, ít hơn một số đơn vị',
        subLessonName: 'Tiết 34: Nhiều hơn một số đơn vị | Tiết 35: Ít hơn một số đơn vị',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Giải được bài toán về nhiều hơn hoặc ít hơn một số đơn vị. Tích hợp giáo dục ATGT: Khi tham gia phương tiện tàu, thuyền; lên xuống xe buýt.',
      },
      {
        week: '8',
        lessonName: 'Bài 14: Luyện tập chung',
        subLessonName: 'Tiết 36, 37, 38',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tổng hợp, rèn kĩ năng cộng, trừ (qua 10) trong phạm vi 20 và giải toán có lời văn.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-math-cd3-4',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 8 – Tuần 14',
    totalPeriods: 28,
    chapterCode: 'T2-CĐ3-4',
    chapterTitle: 'Chủ đề 3 & 4: Làm quen với khối lượng, dung tích – Phép cộng, phép trừ (có nhớ) trong phạm vi 100 (Bài 15 – Bài 24)',
    topicTitle: 'Ki-lô-gam; Lít; Phép cộng, phép trừ (có nhớ) trong phạm vi 100',
    adjustedContentSummary:
      'Nhận biết đơn vị đo khối lượng (kg) và dung tích (l); thực hiện đặt tính và tính phép cộng, phép trừ (có nhớ) trong phạm vi 100. Tích hợp NLS (5.2.CB1a), Tiết kiệm và sử dụng nước hợp lý.',
    lessons: [
      {
        week: '8–9',
        lessonName: 'Bài 15: Ki-lô-gam',
        subLessonName: 'Tiết 39: Nặng hơn, nhẹ hơn | Tiết 40: Ki-lô-gam | Tiết 41: Luyện tập',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 5.2.CB1a: Nhận ra được các công cụ số đơn giản có thể có để giải quyết nhu cầu cá nhân. Nhận biết đơn vị đo khối lượng ki-lô-gam (kg), đọc số đo trên cân.',
      },
      {
        week: '9',
        lessonName: 'Bài 16: Lít',
        subLessonName: 'Tiết 42: Lít | Tiết 43: Luyện tập',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GD ý thức tiết kiệm và sử dụng nước hợp lý trong tình huống thực tế (BVMT). Nhận biết đơn vị đo dung tích lít (l).',
      },
      {
        week: '9–10',
        lessonName: 'Bài 17: Thực hành và trải nghiệm với các đơn vị ki-lô-gam, lít',
        subLessonName: 'Tiết 44, 45',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Thực hành cân đồ vật với đơn vị kg và đong nước với đơn vị lít.',
      },
      {
        week: '10',
        lessonName: 'Bài 18: Luyện tập chung',
        subLessonName: 'Tiết 46',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Củng cố phép tính và bài toán có lời văn gắn với đơn vị đo ki-lô-gam, lít.',
      },
      {
        week: '10',
        lessonName: 'Bài 19: Phép cộng (có nhớ) số có hai chữ số với số có một chữ số',
        subLessonName: 'Tiết 47, 48, 49',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện đặt tính và tính đúng phép cộng (có nhớ) số có hai chữ số với số có một chữ số.',
      },
      {
        week: '10–11',
        lessonName: 'Bài 20: Phép cộng (có nhớ) số có hai chữ số với số có hai chữ số',
        subLessonName: 'Tiết 50, 51, 52, 53',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Thực hiện được phép cộng (có nhớ) số có hai chữ số với số có hai chữ số trong phạm vi 100 và giải toán có lời văn.',
      },
      {
        week: '11',
        lessonName: 'Bài 21: Luyện tập chung',
        subLessonName: 'Tiết 54, 55',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Củng cố kĩ năng thực hiện phép cộng (có nhớ) trong phạm vi 100.',
      },
      {
        week: '11–12',
        lessonName: 'Bài 22: Phép trừ (có nhớ) số có hai chữ số cho số có một chữ số',
        subLessonName: 'Tiết 56, 57, 58, 59',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Thực hiện đặt tính và tính đúng phép trừ (có nhớ) số có hai chữ số cho số có một chữ số.',
      },
      {
        week: '12–13',
        lessonName: 'Bài 23: Phép trừ (có nhớ) số có hai chữ số cho số có hai chữ số',
        subLessonName: 'Tiết 60, 61, 62, 63, 64',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Thực hiện được phép trừ (có nhớ) số có hai chữ số cho số có hai chữ số trong phạm vi 100 và vận dụng giải toán thực tiễn.',
      },
      {
        week: '13–14',
        lessonName: 'Bài 24: Luyện tập chung',
        subLessonName: 'Tiết 65, 66',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Ôn tập, củng cố phép cộng, phép trừ (có nhớ) trong phạm vi 100.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-math-cd5-6-7',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 24,
    chapterCode: 'T2-CĐ5-6-7',
    chapterTitle: 'Chủ đề 5, 6 & 7: Làm quen với hình phẳng – Ngày-giờ, giờ-phút, ngày-tháng – Ôn tập HKI (Bài 25 – Bài 36)',
    topicTitle: 'Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng; Đường gấp khúc, hình tứ giác; Ngày-giờ, giờ-phút, ngày-tháng; Ôn tập & Kiểm tra cuối HKI',
    adjustedContentSummary:
      'Nhận diện hình phẳng, tính độ dài đường gấp khúc, vẽ đoạn thẳng; xem đồng hồ (giờ đúng, giờ hơn 15, 30 phút) và xem lịch tháng; ôn tập và kiểm tra cuối HKI. Tích hợp AI (A2.2) và KNS quý trọng thời gian.',
    lessons: [
      {
        week: '14',
        lessonName: 'Bài 25: Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng',
        subLessonName: 'Tiết 67, 68',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nhận biết điểm, đoạn thẳng, đường thẳng, đường cong và ba điểm thẳng hàng.',
      },
      {
        week: '14',
        lessonName: 'Bài 26: Đường gấp khúc. Hình tứ giác',
        subLessonName: 'Tiết 69, 70',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nhận dạng được đường gấp khúc, hình tứ giác và tính được độ dài đường gấp khúc khi biết độ dài các đoạn thẳng thành phần.',
      },
      {
        week: '15',
        lessonName: 'Bài 27: Thực hành gấp, cắt, ghép, xếp hình. Vẽ đoạn thẳng',
        subLessonName: 'Tiết 71, 72',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Thực hành gấp, cắt, ghép, xếp tạo hình phẳng và dùng thước thẳng vẽ đoạn thẳng có độ dài cho trước.',
      },
      {
        week: '15',
        lessonName: 'Bài 28: Luyện tập chung',
        subLessonName: 'Tiết 73',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Củng cố kiến thức về hình phẳng và độ dài đoạn thẳng, đường gấp khúc.',
      },
      {
        week: '15',
        lessonName: 'Bài 29: Ngày - giờ, giờ - phút',
        subLessonName: 'Tiết 74: Ngày - giờ, giờ - phút | Tiết 75: Thực hành và trải nghiệm xem đồng hồ',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nhận biết 1 ngày có 24 giờ, 1 giờ có 60 phút; xem đồng hồ khi kim phút chỉ số 12, số 3, số 6. Tích hợp GDHS biết quý trọng và tiết kiệm thời gian. Tích hợp AI A2.2: Nhận biết và kể tên được một số sản phẩm hoặc thiết bị có sử dụng trí tuệ nhân tạo (đồng hồ thông minh, trợ lí nhắc lịch...).',
      },
      {
        week: '16',
        lessonName: 'Bài 30: Ngày - tháng',
        subLessonName: 'Tiết 76, 77',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Biết xem tờ lịch tháng để xác định số ngày trong tháng, thứ, ngày.',
      },
      {
        week: '16',
        lessonName: 'Bài 31: Thực hành và trải nghiệm xem đồng hồ, xem lịch',
        subLessonName: 'Tiết 78, 79',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Vận dụng xem đồng hồ và xem lịch vào các tình huống sinh hoạt hằng ngày.',
      },
      {
        week: '16–18',
        lessonName: 'Bài 32 – Bài 36: Ôn tập học kì I & Kiểm tra cuối HKI',
        subLessonName: 'Bài 32: Luyện tập chung (1t) | Bài 33: Ôn tập phép cộng, trừ PV 20, 100 (4t) | Bài 34: Ôn tập hình phẳng (2t) | Bài 35: Ôn tập đo lường (2t) | Bài 36: Ôn tập chung & Kiểm tra cuối HKI (2t)',
        periodAllocation: '11 tiết (Tiết 80–90)',
        periodsCount: 11,
        adjustedContent:
          'Hệ thống hóa toàn bộ kiến thức Toán lớp 2 Học kì I và hoàn thành bài kiểm tra định kì cuối học kì I.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-math-cd8-9-10',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 26',
    totalPeriods: 40,
    chapterCode: 'T2-CĐ8-9-10',
    chapterTitle: 'Chủ đề 8, 9 & 10: Phép nhân, phép chia – Làm quen với hình khối – Các số trong phạm vi 1000 (Bài 37 – Bài 54)',
    topicTitle: 'Phép nhân, thừa số, tích; Bảng nhân 2, 5; Phép chia, số bị chia, số chia, thương; Bảng chia 2, 5; Khối trụ, khối cầu; Các số trong phạm vi 1000',
    adjustedContentSummary:
      'Hiểu ý nghĩa phép nhân, phép chia; thuộc bảng nhân 2, 5 và bảng chia 2, 5; nhận dạng khối trụ, khối cầu; đọc, viết, so sánh các số có ba chữ số trong phạm vi 1000. Tích hợp AI (2.D1.1, 2.C3.1).',
    lessons: [
      {
        week: '19',
        lessonName: 'Bài 37: Phép nhân & Bài 38: Thừa số, tích',
        subLessonName: 'Bài 37 (Tiết 91–92) | Bài 38 (Tiết 93–94)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết ý nghĩa của phép nhân là tổng các số hạng bằng nhau; gọi đúng tên các thành phần của phép nhân (thừa số, tích).',
      },
      {
        week: '19–20',
        lessonName: 'Bài 39: Bảng nhân 2 & Bài 40: Bảng nhân 5',
        subLessonName: 'Bài 39 (Tiết 95–96) | Bài 40 (Tiết 97–98)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lập và học thuộc bảng nhân 2, bảng nhân 5; vận dụng tính nhẩm và giải bài toán thực tế.',
      },
      {
        week: '20–21',
        lessonName: 'Bài 41: Phép chia & Bài 42: Số bị chia, số chia, thương',
        subLessonName: 'Bài 41 (Tiết 99–100) | Bài 42 (Tiết 101–102)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết ý nghĩa phép chia (chia thành các phần bằng nhau hoặc chia theo nhóm); nhận biết số bị chia, số chia, thương.',
      },
      {
        week: '21–23',
        lessonName: 'Bài 43: Bảng chia 2, Bài 44: Bảng chia 5 & Bài 45: Luyện tập chung',
        subLessonName: 'Bài 43 (Tiết 103–104) | Bài 44 (Tiết 105–106) | Bài 45 (Tiết 107–111)',
        periodAllocation: '9 tiết',
        periodsCount: 9,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.D1.1: Nêu được một số vấn đề đơn giản trong đời sống có thể áp dụng AI để giải quyết. Thuộc bảng chia 2, bảng chia 5 và giải toán liên quan đến phép nhân, phép chia.',
      },
      {
        week: '23',
        lessonName: 'Bài 46: Khối trụ, khối cầu & Bài 47: Luyện tập chung',
        subLessonName: 'Bài 46 (Tiết 112–113) | Bài 47 (Tiết 114–115)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nhận dạng được khối trụ, khối cầu thông qua vật thật và đồ dùng học tập.',
      },
      {
        week: '24',
        lessonName: 'Bài 48: Đơn vị, chục, trăm, nghìn & Bài 49: Các số tròn trăm, tròn chục',
        subLessonName: 'Bài 48 (Tiết 116–117) | Bài 49 (Tiết 118–119)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nhận biết quan hệ giữa đơn vị, chục, trăm, nghìn; đọc, viết các số tròn trăm, tròn chục đến 1000.',
      },
      {
        week: '24–25',
        lessonName: 'Bài 50: So sánh các số tròn trăm, tròn chục & Bài 51: Số có ba chữ số',
        subLessonName: 'Bài 50 (Tiết 120–121) | Bài 51 (Tiết 122–124)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.C3.1: So sánh được cách AI phân loại so với cách con người phân loại. Đọc, viết các số có ba chữ số.',
      },
      {
        week: '25–26',
        lessonName: 'Bài 52: Viết số thành tổng các trăm, chục, đơn vị; Bài 53: So sánh các số có ba chữ số & Bài 54: Luyện tập chung',
        subLessonName: 'Bài 52 (Tiết 125–126) | Bài 53 (Tiết 127–128) | Bài 54 (Tiết 129–130)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Viết được số có ba chữ số thành tổng các trăm, chục, đơn vị; so sánh và sắp xếp thứ tự các số có ba chữ số.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-math-cd11-12-13-14',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 35',
    totalPeriods: 45,
    chapterCode: 'T2-CĐ11-14',
    chapterTitle: 'Chủ đề 11, 12, 13 & 14: Độ dài, Tiền Việt Nam – Phép cộng, trừ PV 1000 – Thống kê, xác suất – Ôn tập cuối năm (Bài 55 – Bài 75)',
    topicTitle: 'Đề-xi-mét, Mét, Ki-lô-mét; Tiền Việt Nam; Phép cộng, trừ (không nhớ và có nhớ) trong PV 1000; Biểu đồ tranh; Chắc chắn, có thể, không thể; Ôn tập & Kiểm tra cuối năm',
    adjustedContentSummary:
      'Nhận biết dm, m, km và tiền Việt Nam; cộng, trừ các số có ba chữ số trong phạm vi 1000; đọc biểu đồ tranh và nhận biết khả năng xảy ra của sự kiện; ôn tập và kiểm tra cuối năm.',
    lessons: [
      {
        week: '27–28',
        lessonName: 'Bài 55: Đề-xi-mét. Mét. Ki-lô-mét; Bài 56: Giới thiệu tiền Việt Nam; Bài 57: Thực hành đo độ dài & Bài 58: Luyện tập chung',
        subLessonName: 'Bài 55 (3t) | Bài 56 (1t) | Bài 57 (2t) | Bài 58 (2t)',
        periodAllocation: '8 tiết (Tiết 131–138)',
        periodsCount: 8,
        adjustedContent:
          'Nhận biết các đơn vị đo độ dài dm, m, km và mối quan hệ giữa chúng; nhận biết các tờ tiền Việt Nam thông dụng; thực hành đo độ dài.',
      },
      {
        week: '28–29',
        lessonName: 'Bài 59: Phép cộng (không nhớ) trong phạm vi 1000 & Bài 60: Phép cộng (có nhớ) trong phạm vi 1000',
        subLessonName: 'Bài 59 (Tiết 139–140) | Bài 60 (Tiết 141–143)',
        periodAllocation: '5 tiết (Tiết 139–143)',
        periodsCount: 5,
        adjustedContent:
          'Thực hiện đặt tính và tính đúng phép cộng (không nhớ và có nhớ một lượt) các số trong phạm vi 1000.',
      },
      {
        week: '29–31',
        lessonName: 'Bài 61: Phép trừ (không nhớ) trong phạm vi 1000; Bài 62: Phép trừ (có nhớ) trong phạm vi 1000 & Bài 63: Luyện tập chung',
        subLessonName: 'Bài 61 (Tiết 144–146) | Bài 62 (Tiết 147–150) | Bài 63 (Tiết 151–152)',
        periodAllocation: '9 tiết (Tiết 144–152)',
        periodsCount: 9,
        adjustedContent:
          'Thực hiện đặt tính và tính đúng phép trừ (không nhớ và có nhớ một lượt) các số trong phạm vi 1000 và vận dụng giải toán.',
      },
      {
        week: '31–32',
        lessonName: 'Bài 64: Thu thập, phân loại, kiểm đếm số liệu; Bài 65: Biểu đồ tranh; Bài 66: Chắc chắn, có thể, không thể & Bài 67: Thực hành thống kê',
        subLessonName: 'Bài 64 (1t) | Bài 65 (2t) | Bài 66 (1t) | Bài 67 (1t)',
        periodAllocation: '5 tiết (Tiết 153–157)',
        periodsCount: 5,
        adjustedContent:
          'Biết thu thập, phân loại, kiểm đếm số liệu và đọc biểu đồ tranh đơn giản; sử dụng được thuật ngữ "chắc chắn", "có thể", "không thể" để mô tả khả năng xảy ra của một sự kiện.',
      },
      {
        week: '32–35',
        lessonName: 'Bài 68 – Bài 75: Ôn tập cuối năm & Kiểm tra định kì cuối năm học',
        subLessonName: 'Bài 68: Ôn tập các số PV 1000 (2t) | Bài 69–70: Ôn tập cộng, trừ PV 100, 1000 (6t) | Bài 71: Ôn tập nhân, chia (3t) | Bài 72–73: Ôn tập hình học, đo lường (4t) | Bài 74–75: Ôn tập thống kê, xác suất, Ôn tập chung & Kiểm tra cuối năm (3t)',
        periodAllocation: '18 tiết (Tiết 158–175)',
        periodsCount: 18,
        adjustedContent:
          'Hệ thống hóa toàn bộ kiến thức Toán lớp 2 cả năm học và thực hiện bài kiểm tra đánh giá định kì cuối năm.',
      },
    ],
  }),
];
