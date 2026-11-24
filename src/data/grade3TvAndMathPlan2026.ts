import {
  CognitiveLevelCode,
  CurriculumLessonItem,
  CurriculumTopic,
  EducationLevelId,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_G3_SOURCE_DOC =
  'KHGD Khối lớp 3 – Tổ 1-2-3 Trường TH&THCS Nguyễn Đình Anh (Đan Điền, ngày 28/8/2026)';

export interface Grade3LessonInput {
  id?: string;
  week: string;
  lessonName: string;
  subLessonName?: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
}

export function buildGrade3Topic(params: {
  id: string;
  subject: string;
  semester: 'HK1' | 'HK2' | 'CA_NAM';
  weekRange: string;
  totalPeriods?: number;
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  adjustedContentSummary?: string;
  rawLessons?: Grade3LessonInput[];
  lessons?: Grade3LessonInput[];
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
    grade: 3,
    subject: params.subject,
    semester: params.semester,
    weekRange: params.weekRange,
    totalPeriods: computedTotalPeriods,
    durationText: `${computedTotalPeriods} tiết (${params.weekRange})`,
    chapterCode: params.chapterCode,
    chapterTitle: params.chapterTitle,
    topicTitle: params.topicTitle,
    adjustedContentSummary: computedSummary,
    sourceDocument: NDA_G3_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1. MÔN TIẾNG VIỆT LỚP 3 (35 TUẦN – 245 TIẾT: HKI 126 TIẾT, HKII 119 TIẾT)
// ============================================================================

export const GRADE3_TIENG_VIET_TOPICS: CurriculumTopic[] = [
  buildGrade3Topic({
    id: 'g3-tv-hk1-cd1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 4',
    totalPeriods: 28,
    chapterCode: 'TV3-HK1-CD1',
    chapterTitle: 'Chủ đề 1: Những trải nghiệm thú vị (Tuần 1 – 4)',
    topicTitle:
      'Bài 1: Ngày gặp lại (3 tiết); Bài 2: Về thăm quê (4 tiết); Bài 3: Cánh rừng trong nắng (3 tiết); Bài 4: Lần đầu ra biển (4 tiết); Bài 5: Nhật kí tập bơi (3 tiết); Bài 6: Tập nấu ăn (4 tiết); Bài 7: Mùa hè lấp lánh (3 tiết); Bài 8: Tạm biệt mùa hè (4 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.A1.2, 3.A1.1), QCN (yêu thương, kính trọng người thân), NLS (2.3.CB1a, 4.2.CB1a, 1.1.CB1a, 3.1.CB1a), ĐĐLS (nhân ái, tha thứ, đoàn kết), QPAN (bảo vệ chủ quyền biển đảo) và KNS (phòng tránh đuối nước, an toàn khi tập nấu ăn).',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Ngày gặp lại',
        subLessonName:
          'Đọc: Ngày gặp lại; Nói và nghe: Mùa hè của em (2 tiết); Viết: Nghe – viết: Em yêu mùa hè. Phân biệt c/k (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI - 3.A1.2: HS hiểu AI có thể mô phỏng văn bản nhưng không thể có cảm xúc như con người; biết AI chỉ hỗ trợ gợi ý, còn cảm xúc vui khi gặp lại bạn là trải nghiệm thật của con người.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Về thăm quê',
        subLessonName:
          'Đọc: Về thăm quê; Viết: Ôn chữ hoa A, Ă, Â (2 tiết); Luyện tập: Từ chỉ sự vật, hoạt động; Câu giới thiệu, câu nêu hoạt động (1 tiết); Luyện tập: Viết tin nhắn (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp QCN: HS biết yêu thương, kính trọng người thân; hiểu trẻ em có quyền được chăm sóc trong gia đình và có bổn phận ứng xử lễ phép. Tích hợp NLS 2.3.CB1a, 4.2.CB1a: HS biết tin nhắn là hình thức giao tiếp trong môi trường số; viết nội dung ngắn gọn, lịch sự, đúng người nhận; không chia sẻ địa chỉ, số điện thoại, hình ảnh cá nhân hoặc thông tin riêng tư khi nhắn tin.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Cánh rừng trong nắng',
        subLessonName:
          'Đọc: Cánh rừng trong nắng; Nói và nghe: Sự tích loài hoa của mùa hạ (2 tiết); Viết: Nghe – viết: Cánh rừng trong nắng. Phân biệt g/gh (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng cho HS lối sống nhân ái, biết tha thứ, đoàn kết và sẵn sàng giúp đỡ người khác qua câu chuyện Sự tích loài hoa của mùa hạ.',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Lần đầu ra biển',
        subLessonName:
          'Đọc: Lần đầu ra biển; Đọc mở rộng (2 tiết); Luyện tập: Từ ngữ chỉ đặc điểm. Câu nêu đặc điểm (1 tiết); Luyện tập: Viết đoạn văn kể lại sự việc đã làm cùng người thân (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp QPAN: Giáo dục HS lòng yêu quê hương, ý thức bảo vệ chủ quyền biển đảo và an ninh Tổ quốc. Tích hợp NLS 1.1.CB1a, 3.1.CB1a: HS biết tìm kiếm, quan sát thông tin/hình ảnh minh họa bài học từ nguồn phù hợp lứa tuổi. Tích hợp AI (Khung 3439) - 3.A1.1: GV dùng ChatGPT/Gemini minh họa cách gợi ý dàn ý kể lại hoạt động đã làm cùng người thân; HS hiểu AI chỉ hỗ trợ gợi ý, không viết thay và không nhập thông tin riêng tư của gia đình.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Nhật kí tập bơi',
        subLessonName:
          'Đọc: Nhật kí tập bơi; Nói và nghe: Một buổi tập luyện (2 tiết); Viết: Nghe – viết: Mặt trời nhỏ. Phân biệt ng/ngh (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD KNS về phòng tránh đuối nước: HS nhận thức học bơi là kĩ năng sinh tồn; biết bơi ở nơi an toàn, có người lớn hướng dẫn, không bơi một mình và không đùa nghịch nguy hiểm dưới nước.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Tập nấu ăn',
        subLessonName:
          'Đọc: Tập nấu ăn; Viết: Ôn chữ hoa B, C (2 tiết); Luyện tập: Từ ngữ chỉ hoạt động. Câu hoạt động (1 tiết); Luyện tập: Viết đoạn văn nêu các bước làm một món ăn (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GDKNS: HS biết bảo đảm an toàn khi tập nấu ăn; chỉ thực hiện việc phù hợp với lứa tuổi, dùng dao, bếp, nước nóng khi có người lớn hướng dẫn; giữ vệ sinh khi chế biến món ăn. Tích hợp AI (Khung 3439) - 3.A1.1: HS nhận biết AI như ChatGPT/Gemini có thể gợi ý từ nối và dàn ý nêu các bước làm món ăn; HS chỉ tham khảo, tự chọn lọc, viết bằng lời của mình.',
      },
      {
        week: '4',
        lessonName: 'Bài 7: Mùa hè lấp lánh',
        subLessonName:
          'Đọc: Mùa hè lấp lánh; Nói và nghe: Kể chuyện Chó đốm con và mặt trời (2 tiết); Viết: Nghe – viết: Mùa hè lấp lánh. Phân biệt ch/tr, v/d (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Rèn kĩ năng đọc hiểu văn bản thơ, kể chuyện sáng tạo và viết chính tả phân biệt ch/tr, v/d.',
      },
      {
        week: '4',
        lessonName: 'Bài 8: Tạm biệt mùa hè',
        subLessonName:
          'Đọc: Tạm biệt mùa hè; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về mùa hè. Dấu chấm, dấu hai chấm (1 tiết); Luyện tập: Viết đoạn văn nêu tình cảm, cảm xúc đối với một người bạn (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI 3.A1.1: HS nhận biết AI như ChatGPT/Gemini có thể gợi ý từ ngữ, ý tưởng khi viết về tình cảm với bạn; HS chỉ tham khảo qua phần GV trình chiếu, tự chọn ý phù hợp, viết bằng lời của mình, tôn trọng cảm xúc thật và không nhập thông tin riêng tư của bạn lên công cụ số.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-tv-hk1-cd2',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 9',
    totalPeriods: 35,
    chapterCode: 'TV3-HK1-CD2',
    chapterTitle: 'Chủ đề 2: Cổng trường rộng mở & Ôn tập giữa HKI (Tuần 5 – 9)',
    topicTitle:
      'Bài 9: Đi học vui sao (3 tiết); Bài 10: Con đường đến trường (4 tiết); Bài 11: Lời giải toán đặc biệt (3 tiết); Bài 12: Bài tập làm văn (4 tiết); Bài 13: Bàn tay cô giáo (3 tiết); Bài 14: Cuộc họp của chữ viết (4 tiết); Bài 15: Thư viện (3 tiết); Bài 16: Ngày em vào Đội (4 tiết); Ôn tập giữa học kì I (7 tiết)',
    adjustedContentSummary:
      'Tích hợp QCN (quyền được đến trường học tập, phát triển tài năng), KNS/ATGT (đi học an toàn), AI (3.A1.1), NLS (2.1.CB1b, 4.2.CB1a, 2.2.CB1a), BVMT (giữ lớp học xanh - sạch - đẹp) và ĐĐLS (yêu quý thư viện, tự hào Đội viên).',
    rawLessons: [
      {
        week: '5',
        lessonName: 'Bài 9: Đi học vui sao',
        subLessonName:
          'Đọc: Đi học vui sao; Nói và nghe: Tới lớp, tới trường (2 tiết); Viết: Nhớ – viết: Đi học vui sao. Phân biệt s/x, dấu hỏi/dấu ngã (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QCN: HS hiểu trẻ em có quyền được đến trường học tập, được bày tỏ cảm xúc, ý kiến về trường lớp; biết hợp tác, lắng nghe, chia sẻ niềm vui đi học và ứng xử thân thiện với bạn.',
      },
      {
        week: '5',
        lessonName: 'Bài 10: Con đường đến trường',
        subLessonName:
          'Đọc: Con đường đến trường; Viết: Ôn chữ hoa D, Đ (2 tiết); Luyện tập: Từ chỉ đặc điểm. Câu nêu đặc điểm (1 tiết); Luyện tập: Viết đoạn văn nêu tình cảm, cảm xúc với một người thân (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp KNS/ATGT: HS biết đi học an toàn, quan sát đường đi, không đùa nghịch, không đi vào nơi nguy hiểm; biết nhờ người lớn hỗ trợ khi gặp mưa lũ, đường trơn, khu vực khó đi.',
      },
      {
        week: '6',
        lessonName: 'Bài 11: Lời giải toán đặc biệt',
        subLessonName:
          'Đọc: Lời giải toán đặc biệt; Nói và nghe: Kể chuyện Đội viên tương lai (2 tiết); Viết: Nghe – viết: Lời giải toán đặc biệt. Phân biệt r/d/gi, an/ang (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QCN: HS hiểu trẻ em có quyền được học tập, phát triển tài năng và bộc lộ năng khiếu riêng; cần tôn trọng sự khác biệt của mỗi bạn.',
      },
      {
        week: '6',
        lessonName: 'Bài 12: Bài tập làm văn',
        subLessonName:
          'Đọc: Bài tập làm văn; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về nhà trường; Câu hỏi (1 tiết); Luyện tập: Điền thông tin vào mẫu đơn xin vào Đội (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.1: HS nhận biết AI có thể là công cụ gợi ý ý tưởng khi viết bài; HS chỉ tham khảo, không để AI viết thay và không cung cấp thông tin riêng tư. Tích hợp NLS 2.1.CB1b, 4.2.CB1a: Xác định phương tiện giao tiếp số phù hợp khi thực hiện mẫu đơn; không để lộ dữ liệu cá nhân.',
      },
      {
        week: '7',
        lessonName: 'Bài 13: Bàn tay cô giáo',
        subLessonName:
          'Đọc: Bàn tay cô giáo; Nói và nghe: Một giờ học thú vị (2 tiết); Viết: Nghe – viết: Nghe thầy đọc thơ. Phân biệt l/n, ăn/ăng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD BVMT: HS biết sau mỗi tiết học thủ công, mĩ thuật và các buổi học cần vệ sinh sạch sẽ chỗ ngồi, nhặt giấy vụn, bỏ rác vào thùng rác, giữ lớp học xanh - sạch - đẹp.',
      },
      {
        week: '7',
        lessonName: 'Bài 14: Cuộc họp của chữ viết',
        subLessonName:
          'Đọc: Cuộc họp của chữ viết; Viết: Ôn chữ hoa E, Ê (2 tiết); Luyện tập: Câu kể; Các dấu câu kết thúc (1 tiết); Luyện tập: Viết đoạn văn giới thiệu về bản thân (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 4.2.CB1a: HS biết lựa chọn thông tin phù hợp khi giới thiệu về bản thân; không chia sẻ địa chỉ, số điện thoại, tài khoản hoặc dữ liệu riêng tư trên môi trường số.',
      },
      {
        week: '8',
        lessonName: 'Bài 15: Thư viện',
        subLessonName:
          'Đọc: Thư viện; Nói và nghe: Kể chuyện Mặt trời mọc ở đằng... tây! (2 tiết); Viết: Nghe – viết: Thư viện. Phân biệt ch/tr, ân/âng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lí tưởng cách mạng, đạo đức, lối sống: HS rèn tính cẩn thận, trung thực khi nghe - viết; biết giữ gìn sách vở, yêu quý thư viện và có ý thức đọc sách phù hợp.',
      },
      {
        week: '8',
        lessonName: 'Bài 16: Ngày em vào Đội',
        subLessonName:
          'Đọc: Ngày em vào Đội; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về thư viện; Câu cảm (1 tiết); Luyện tập: Viết thông báo (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD LTCM, đạo đức, lối sống: HS hiểu được vào Đội là niềm tự hào của thiếu nhi; biết phấn đấu học tập, rèn luyện, đoàn kết, làm việc tốt để xứng đáng là đội viên. Tích hợp NLS 2.2.CB1a: Chia sẻ thông báo tới bạn bè, thầy cô rõ ràng, không chia sẻ thông tin cá nhân không cần thiết.',
      },
      {
        week: '9',
        lessonName: 'Ôn tập giữa học kì I',
        subLessonName: 'Ôn tập giữa học kì I (Tiết 1 – Tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt nửa đầu học kì I (Chủ đề 1 & Chủ đề 2) và kiểm tra đánh giá giữa học kì I.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-tv-hk1-cd3',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 13',
    totalPeriods: 28,
    chapterCode: 'TV3-HK1-CD3',
    chapterTitle: 'Chủ đề 3: Mái nhà yêu thương (Tuần 10 – 13)',
    topicTitle:
      'Bài 17: Ngưỡng cửa (3 tiết); Bài 18: Món quà đặc biệt (4 tiết); Bài 19: Khi cả nhà bé tí (3 tiết); Bài 20: Trò chuyện cùng mẹ (4 tiết); Bài 21: Tia nắng bé nhỏ (3 tiết); Bài 22: Để cháu nắm tay ông (4 tiết); Bài 23: Tôi yêu em tôi (3 tiết); Bài 24: Bạn nhỏ trong nhà (4 tiết)',
    adjustedContentSummary:
      'Tích hợp QCN (yêu thương, kính trọng người thân), AI (3.A1.1, 4.A1.1, 3.C5.2), ĐĐLS (lời nhờ, lời mời lễ phép), NLS (2.3.CB1a, 4.2.CB1a) và GDĐP (danh lam thắng cảnh quê hương).',
    rawLessons: [
      {
        week: '10',
        lessonName: 'Bài 17: Ngưỡng cửa',
        subLessonName:
          'Đọc: Ngưỡng cửa; Nói và nghe: Kể chuyện Sự tích nhà sàn (2 tiết); Viết: Nghe – viết: Đồ đạc trong nhà. Phân biệt iêu/ươu, en/eng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QCN: HS biết yêu thương, kính trọng người thân; hiểu trẻ em có quyền được chăm sóc trong gia đình và có bổn phận ứng xử lễ phép.',
      },
      {
        week: '10',
        lessonName: 'Bài 18: Món quà đặc biệt',
        subLessonName:
          'Đọc: Món quà đặc biệt; Viết: Ôn chữ hoa G, H (2 tiết); Luyện tập: Từ chỉ đặc điểm; Câu khiến (1 tiết); Luyện tập: Viết đoạn văn tả một đồ vật (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.1 & 4.A1.1: Sử dụng AI hỗ trợ thiết kế hoặc gợi ý mẫu lời chúc, bảng gợi ý từ ngữ tả đồ vật (màu sắc, hình dáng, kích thước, công dụng). Tích hợp LTCM, đạo đức, lối sống: Biết dùng lời nhờ, lời mời, lời đề nghị lễ phép.',
      },
      {
        week: '11',
        lessonName: 'Bài 19: Khi cả nhà bé tí',
        subLessonName:
          'Đọc: Khi cả nhà bé tí; Nói và nghe: Những người yêu thương (2 tiết); Viết: Nghe – viết: Khi cả nhà bé tí. Phân biệt iu/ưu, iên/iêng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QCN: HS biết yêu thương, kính trọng người thân; hiểu trẻ em có quyền được chăm sóc trong gia đình và có bổn phận ứng xử lễ phép.',
      },
      {
        week: '11',
        lessonName: 'Bài 20: Trò chuyện cùng mẹ',
        subLessonName:
          'Đọc: Trò chuyện cùng mẹ; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về người thân; Dấu hai chấm (1 tiết); Luyện tập: Viết đoạn văn tả ngôi nhà của mình (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 2.3.CB1a, 4.2.CB1a: Lựa chọn cách giao tiếp phù hợp với người thân qua điện thoại, tin nhắn, cuộc gọi video; không chia sẻ thông tin riêng tư của gia đình. Tích hợp AI (4.A1.1): Hỗ trợ gợi ý câu hỏi lập dàn ý đoạn văn tả ngôi nhà.',
      },
      {
        week: '12',
        lessonName: 'Bài 21: Tia nắng bé nhỏ',
        subLessonName:
          'Đọc: Tia nắng bé nhỏ; Nói và nghe: Kể chuyện Tia nắng bé nhỏ (2 tiết); Viết: Nghe – viết: Kho sách của ông bà. Phân biệt s/x, uôn/uông (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Bồi dưỡng tình cảm hiếu thảo, sự quan tâm chăm sóc ông bà và người thân trong gia đình.',
      },
      {
        week: '12',
        lessonName: 'Bài 22: Để cháu nắm tay ông',
        subLessonName:
          'Đọc: Để cháu nắm tay ông; Viết: Ôn chữ hoa I, K (2 tiết); Luyện tập: Từ ngữ chỉ hoạt động, đặc điểm; Câu kể (1 tiết); Luyện tập: Viết đoạn văn nêu tình cảm, cảm xúc đối với người thân (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Giáo dục địa phương: Kể được tên một số danh lam, thắng cảnh nổi tiếng trên quê hương em. Nêu được một số việc làm phù hợp để giữ gìn và bảo vệ các danh lam, thắng cảnh.',
      },
      {
        week: '13',
        lessonName: 'Bài 23: Tôi yêu em tôi',
        subLessonName:
          'Đọc: Tôi yêu em tôi; Nói và nghe: Tình cảm anh chị em (2 tiết); Viết: Nghe – viết: Tôi yêu em tôi. Phân biệt r/d/gi; ươn/ương (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QCN: HS biết yêu thương, kính trọng người thân; hiểu trẻ em có quyền được chăm sóc trong gia đình và có bổn phận ứng xử lễ phép.',
      },
      {
        week: '13',
        lessonName: 'Bài 24: Bạn nhỏ trong nhà',
        subLessonName:
          'Đọc: Bạn nhỏ trong nhà; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về bạn trong nhà; Biện pháp so sánh (1 tiết); Luyện tập: Viết đoạn văn tả đồ vật (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Làm quen với khả năng AI nhận dạng âm thanh và hình ảnh vật nuôi.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-tv-hk1-cd4',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 35,
    chapterCode: 'TV3-HK1-CD4',
    chapterTitle: 'Chủ đề 4: Cộng đồng gắn bó & Ôn tập cuối HKI (Tuần 14 – 18)',
    topicTitle:
      'Bài 25: Những bậc đá chạm mây (3 tiết); Bài 26: Đi tìm mặt trời (4 tiết); Bài 27: Những chiếc áo ấm (3 tiết); Bài 28: Con đường của bé (4 tiết); Bài 29: Ngôi nhà trong cỏ (3 tiết); Bài 30: Những ngọn hải đăng (4 tiết); Bài 31: Người làm đồ chơi (3 tiết); Bài 32: Cây bút thần (4 tiết); Ôn tập và Đánh giá cuối học kì I (7 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.C5.2, 3.B2.1), ĐĐLS & KNS (tôn trọng các nghề nghiệp, giao tiếp lịch sự), BVMT (bảo vệ môi trường sống của loài vật và cảnh đẹp thiên nhiên) và NLS (1.1.CB1a, 2.3.CB1a, 4.1.CB1b, 2.1.CB1a, 3.1.CB1a).',
    rawLessons: [
      {
        week: '14',
        lessonName: 'Bài 25: Những bậc đá chạm mây',
        subLessonName:
          'Đọc: Những bậc đá chạm mây; Nói và nghe: Kể chuyện Những bậc đá chạm mây (2 tiết); Viết: Nghe – viết: Những bậc đá chạm mây. Phân biệt ch/tr, ăn/ăng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI 3.C5.2: Nhận biết AI hỗ trợ đo đạc và khảo sát địa hình khó khăn (robot AI khảo sát vùng núi cao giúp con người làm đường).',
      },
      {
        week: '14',
        lessonName: 'Bài 26: Đi tìm mặt trời',
        subLessonName:
          'Đọc: Đi tìm mặt trời; Viết: Ôn chữ hoa L (2 tiết); Luyện tập: Từ trái nghĩa; Câu khiến (1 tiết); Luyện tập: Viết đoạn văn nêu lí do thích hoặc không thích một nhân vật trong câu chuyện (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp LTCM, ĐĐ, KNS: HS rèn thói quen dùng từ, đặt câu lịch sự, rõ ràng; biết lắng nghe, phản hồi phù hợp trong giao tiếp hằng ngày.',
      },
      {
        week: '15',
        lessonName: 'Bài 27: Những chiếc áo ấm',
        subLessonName:
          'Đọc: Những chiếc áo ấm; Nói và nghe: Thêm sức thêm tài (2 tiết); Viết: Nghe – viết: Trong vườn. Phân biệt l/n, dấu hỏi/dấu ngã (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Nhận biết AI gợi ý đồ dùng phù hợp với điều kiện thời tiết (gợi ý áo ấm khi dữ liệu thời tiết báo trời lạnh).',
      },
      {
        week: '15',
        lessonName: 'Bài 28: Con đường của bé',
        subLessonName:
          'Đọc: Con đường của bé; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về nghề nghiệp; Câu hỏi (1 tiết); Luyện tập: Viết đoạn văn nêu lí do thích hoặc không thích một nhân vật (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp đạo đức, lối sống/KNS: HS biết tôn trọng các nghề nghiệp, dùng câu hỏi lịch sự khi tìm hiểu công việc của người khác; biết lắng nghe, hợp tác và phản hồi phù hợp.',
      },
      {
        week: '16',
        lessonName: 'Bài 29: Ngôi nhà trong cỏ',
        subLessonName:
          'Đọc: Ngôi nhà trong cỏ; Nói và nghe: Kể chuyện Hàng xóm của tắc kè (2 tiết); Viết: Nghe – viết: Gió. Phân biệt s/x, ao/au (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD BVMT: HS biết mỗi loài vật đều cần môi trường sống phù hợp; có ý thức không phá tổ, không làm hại côn trùng có ích và giữ gìn môi trường xung quanh.',
      },
      {
        week: '16',
        lessonName: 'Bài 30: Những ngọn hải đăng',
        subLessonName:
          'Đọc: Những ngọn hải đăng; Viết: Ôn chữ hoa M, N (2 tiết); Luyện tập: Từ chỉ sự vật, hoạt động; Hỏi – đáp về sự vật, hoạt động (1 tiết); Luyện tập: Viết thư (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GDBVMT: Giáo dục tình cảm yêu mến cảnh đẹp của thiên nhiên, có ý thức bảo vệ môi trường. Tích hợp NLS 1.1.CB1a, 2.3.CB1a, 4.1.CB1b: Biết tìm kiếm thông tin để viết thư cho người thân; giao tiếp lịch sự, an toàn, không chia sẻ thông tin cá nhân khi liên lạc trực tuyến.',
      },
      {
        week: '17',
        lessonName: 'Bài 31: Người làm đồ chơi',
        subLessonName:
          'Đọc: Người làm đồ chơi; Nói và nghe: Kể chuyện Người làm đồ chơi (2 tiết); Viết: Nghe – viết: Người làm đồ chơi; Viết phiếu mượn sách (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Bồi dưỡng lòng trân trọng người lao động và các nghề truyền thống tốt đẹp.',
      },
      {
        week: '17',
        lessonName: 'Bài 32: Cây bút thần',
        subLessonName:
          'Đọc: Cây bút thần; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về thành thị và nông thôn. So sánh (1 tiết); Luyện tập: Viết thư và phong bì thư (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.B2.1: Phân biệt sự khác nhau giữa vật thật và hình ảnh do AI tạo ra (Generative AI). Tích hợp NLS 2.1.CB1a, 3.1.CB1a: Lựa chọn phương tiện giao tiếp phù hợp, viết thư giao lưu đúng mực.',
      },
      {
        week: '18',
        lessonName: 'Ôn tập và Đánh giá cuối học kì I',
        subLessonName: 'Ôn tập và đánh giá cuối học kì I (Tiết 1 – Tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt học kì I và thực hiện kiểm tra, đánh giá cuối học kì I theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-tv-hk2-cd1',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 22',
    totalPeriods: 28,
    chapterCode: 'TV3-HK2-CD1',
    chapterTitle: 'Chủ đề 1 (HKII): Những sắc màu thiên nhiên (Tuần 19 – 22)',
    topicTitle:
      'Bài 1: Bầu trời (3 tiết); Bài 2: Mưa (4 tiết); Bài 3: Cóc kiện trời (3 tiết); Bài 4: Những cái tên đáng yêu (4 tiết); Bài 5: Ngày hội rừng xanh (3 tiết); Bài 6: Cây gạo (4 tiết); Bài 7: Mặt trời xanh của tôi (3 tiết); Bài 8: Bầy voi rừng Trường Sơn (4 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.C5.2 dự báo thời tiết), Tiết kiệm và BVNN (bảo vệ nguồn nước sạch, phòng chống hạn hán lũ lụt), GDBVMT (bảo vệ rừng và muông thú) và NLS (1.1.CB1a).',
    rawLessons: [
      {
        week: '19',
        lessonName: 'Bài 1 (HKII): Bầu trời',
        subLessonName:
          'Đọc: Bầu trời; Nói và nghe: Bầu trời trong mắt em (2 tiết); Viết: Nghe – viết: Buổi sáng. Phân biệt ch/tr, at/ac (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Nhận biết AI thu thập dữ liệu bầu trời để dự báo thời tiết (phân tích ảnh mây cảnh báo mưa).',
      },
      {
        week: '19',
        lessonName: 'Bài 2 (HKII): Mưa',
        subLessonName:
          'Đọc: Mưa; Viết: Ôn chữ hoa O, Ô, Ơ (2 tiết); Luyện tập: Mở rộng vốn từ hiện tượng thiên nhiên; Câu cảm, câu khiến (1 tiết); Luyện tập: Viết đoạn văn kể lại diễn biến một hoạt động ngoài trời (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD Tiết kiệm và BVNN: Giáo dục ý thức bảo vệ nguồn nước sạch để các sinh vật và cây cối sinh sống.',
      },
      {
        week: '20',
        lessonName: 'Bài 3 (HKII): Cóc kiện trời',
        subLessonName:
          'Đọc: Cóc kiện trời; Nói và nghe: Kể chuyện Cóc kiện trời (2 tiết); Viết: Nghe – viết: Trăng trên biển. Phân biệt s/x, ăt/ăc (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD Tiết kiệm và BVNN: Liên hệ hạn hán, lũ lụt có thể xảy ra do thiên nhiên và do con người thiếu ý thức bảo vệ môi trường; HS biết tiết kiệm nước, giữ vệ sinh nguồn nước.',
      },
      {
        week: '20',
        lessonName: 'Bài 4 (HKII): Những cái tên đáng yêu',
        subLessonName:
          'Đọc: Những cái tên đáng yêu; Đọc mở rộng (2 tiết); Luyện tập: Từ ngữ có nghĩa giống nhau. Đặt và trả lời câu hỏi: Khi nào? (1 tiết); Luyện tập: Viết đoạn văn kể lại hoạt động quan sát được trong tranh (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Bồi dưỡng tình yêu thiên nhiên, cây cối xung quanh và rèn kĩ năng đặt câu hỏi Khi nào?.',
      },
      {
        week: '21',
        lessonName: 'Bài 5 (HKII): Ngày hội rừng xanh',
        subLessonName:
          'Đọc: Ngày hội rừng xanh; Nói và nghe: Rừng (2 tiết); Viết: Nghe – viết: Chim chích bông; Viết hoa tên riêng địa lí; Phân biệt iêu/ươu, ât/âc (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GDBVMT: Nhắc nhở các em phải biết bảo vệ rừng, tuyên truyền vận động mọi người không chặt, phá rừng để bảo vệ ngôi nhà cho các loài động vật và bảo vệ môi trường sống.',
      },
      {
        week: '21',
        lessonName: 'Bài 6 (HKII): Cây gạo',
        subLessonName:
          'Đọc: Cây gạo; Viết: Ôn chữ hoa P, Q (2 tiết); Luyện tập: So sánh. Đặt và TLCH: Ở đâu? (1 tiết); Luyện tập: Viết đoạn văn nêu tình cảm, cảm xúc về cảnh vật trong tranh (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Rèn kĩ năng sử dụng biện pháp so sánh, đặt và trả lời câu hỏi Ở đâu? và viết đoạn văn nêu cảm xúc về cảnh vật thiên nhiên.',
      },
      {
        week: '22',
        lessonName: 'Bài 7 (HKII): Mặt trời xanh của tôi',
        subLessonName:
          'Đọc: Mặt trời xanh của tôi; Nói và nghe: Kể chuyện Sự tích hoa mào gà (2 tiết); Viết: Nhớ – viết: Mặt trời xanh của tôi. Phân biệt r/d/gi, in/inh (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Giáo dục tình yêu cây xanh, thiên nhiên và lòng nhân ái, sẻ chia qua câu chuyện Sự tích hoa mào gà.',
      },
      {
        week: '22',
        lessonName: 'Bài 8 (HKII): Bầy voi rừng Trường Sơn',
        subLessonName:
          'Đọc: Bầy voi rừng Trường Sơn; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về núi rừng. Đặt và TLCH: Khi nào?, Ở đâu? (1 tiết); Luyện tập: Viết đoạn văn nêu tình cảm, cảm xúc về cảnh vật em yêu thích (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 1.1.CB1a: HS xác định được thông tin cần ghi trong phiếu đọc sách và thực hiện tìm kiếm đơn giản trong môi trường số để chọn lọc bài đọc phù hợp chủ điểm.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-tv-hk2-cd2',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 27',
    totalPeriods: 35,
    chapterCode: 'TV3-HK2-CD2',
    chapterTitle: 'Chủ đề 2 (HKII): Bài học từ cuộc sống & Ôn tập giữa HKII (Tuần 23 – 27)',
    topicTitle:
      'Bài 9: Lời kêu gọi toàn dân tập thể dục (3 tiết); Bài 10: Quả hồng của thỏ con (4 tiết); Bài 11: Chuyện bên cửa sổ (3 tiết); Bài 12: Tay trái và tay phải (4 tiết); Bài 13: Mèo đi câu cá (3 tiết); Bài 14: Học nghề (4 tiết); Bài 15: Ngày như thế nào là đẹp? (3 tiết); Bài 16: A lô, tớ đây (4 tiết); Ôn tập giữa học kì II (7 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.A1.1, 3.C5.2), ĐĐLS (nhân ái, sẻ chia, nhường nhịn, biết nói lời cảm ơn), NLS (1.2.CB1a, 2.3.CB1a, 4.1.CB1b).',
    rawLessons: [
      {
        week: '23',
        lessonName: 'Bài 9 (HKII): Lời kêu gọi toàn dân tập thể dục',
        subLessonName:
          'Đọc: Lời kêu gọi toàn dân tập thể dục; Nói và nghe: Học từ bạn (2 tiết); Viết: Nghe – viết: Lời kêu gọi toàn dân tập thể dục. Phân biệt l/n, dấu hỏi/dấu ngã (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.1: Nhận biết các ứng dụng AI nhắc nhở rèn luyện sức khỏe (đồng hồ thông minh nhắc HS vận động bảo vệ cột sống).',
      },
      {
        week: '23',
        lessonName: 'Bài 10 (HKII): Quả hồng của thỏ con',
        subLessonName:
          'Đọc: Quả hồng của thỏ con; Viết: Ôn chữ hoa R, S (2 tiết); Luyện tập: Từ ngữ có nghĩa giống nhau; Dấu gạch ngang (1 tiết); Luyện tập: Viết đoạn văn nêu lí do thích hoặc không thích một nhân vật (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Giáo dục HS lối sống nhân ái, biết sẻ chia và đặt lợi ích của người khác đúng lúc; biết nhường nhịn, trung thực và nói lời cảm ơn.',
      },
      {
        week: '24',
        lessonName: 'Bài 11 (HKII): Chuyện bên cửa sổ',
        subLessonName:
          'Đọc: Chuyện bên cửa sổ; Nói và nghe: Kể chuyện Cậu bé đánh giày (2 tiết); Viết: Nghe – viết: Chuyện bên cửa sổ. Phân biệt iu/ưu, im/iêm (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Rèn kĩ năng đọc hiểu, kể chuyện và viết chính tả phân biệt iu/ưu, im/iêm.',
      },
      {
        week: '24',
        lessonName: 'Bài 12 (HKII): Tay trái và tay phải',
        subLessonName:
          'Đọc: Tay trái và tay phải; Đọc mở rộng (2 tiết); Luyện tập: Dấu ngoặc kép; Đặt và trả lời câu hỏi: Bằng gì? (1 tiết); Luyện tập: Viết đoạn văn nêu lí do thích hoặc không thích một nhân vật (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 1.2.CB1a: HS biết lựa chọn sách, báo, nội dung đọc số phù hợp lứa tuổi; bước đầu nhận biết nguồn thông tin đáng tin cậy.',
      },
      {
        week: '25',
        lessonName: 'Bài 13 (HKII): Mèo đi câu cá',
        subLessonName:
          'Đọc: Mèo đi câu cá; Nói và nghe: Cùng vui làm việc (2 tiết); Viết: Nghe – viết: Bài học của gấu. Phân biệt s/x, v/d (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Giáo dục tính tập trung, chăm chỉ và tinh thần trách nhiệm khi làm việc, học tập.',
      },
      {
        week: '25',
        lessonName: 'Bài 14 (HKII): Học nghề',
        subLessonName:
          'Đọc: Học nghề; Viết: Ôn chữ hoa T, U, Ư (2 tiết); Luyện tập: Dấu gạch ngang, Dấu ngoặc kép (1 tiết); Luyện tập: Viết đoạn văn về ước mơ của em (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Bồi dưỡng ước mơ nghề nghiệp, sự kiên trì học hỏi và rèn kĩ năng viết đoạn văn về ước mơ của em.',
      },
      {
        week: '26',
        lessonName: 'Bài 15 (HKII): Ngày như thế nào là đẹp?',
        subLessonName:
          'Đọc: Ngày như thế nào là đẹp?; Nói và nghe: Kể chuyện Ngày như thế nào là đẹp? (2 tiết); Viết: Nghe – viết: Ngày như thế nào là đẹp?. Phân biệt r/d/gi, dấu hỏi/dấu ngã (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Giáo dục ý thức lao động có ích, làm việc tốt mỗi ngày để tạo nên một ngày ý nghĩa.',
      },
      {
        week: '26',
        lessonName: 'Bài 16 (HKII): A lô, tớ đây.',
        subLessonName:
          'Đọc: A lô, tớ đây; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về giao tiếp; Câu kể, câu hỏi (1 tiết); Luyện tập: Viết thư điện tử (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Hiểu AI giúp vượt qua rào cản ngôn ngữ khi giao tiếp. Tích hợp NLS 2.3.CB1a, 4.1.CB1b: Biết viết thư điện tử/lời nhắn lịch sự, đúng người nhận; không chia sẻ thông tin cá nhân khi gửi thư điện tử.',
      },
      {
        week: '27',
        lessonName: 'Ôn tập giữa học kì II',
        subLessonName: 'Ôn tập giữa học kì II (Tiết 1 – Tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt nửa đầu học kì II (Tuần 19 – 26) và kiểm tra đánh giá giữa học kì II.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-tv-hk2-cd3',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 31',
    totalPeriods: 28,
    chapterCode: 'TV3-HK2-CD3',
    chapterTitle: 'Chủ đề 3 (HKII): Đất nước ngàn năm (Tuần 28 – 31)',
    topicTitle:
      'Bài 17: Đất nước là gì? (3 tiết); Bài 18: Núi quê tôi (4 tiết); Bài 19: Sông Hương (3 tiết); Bài 20: Tiếng nước mình (4 tiết); Bài 21: Nhà rông (3 tiết); Bài 22: Sự tích ông Đùng, bà Đùng (4 tiết); Bài 23: Hai Bà Trưng (3 tiết); Bài 24: Cùng Bác qua suối (4 tiết)',
    adjustedContentSummary:
      'Tích hợp QPAN (tình yêu đất nước, bảo vệ Tổ quốc, biển đảo, non sông, truyền thống Hai Bà Trưng), GDĐP (danh lam thắng cảnh, di tích lịch sử, danh nhân quê hương) và ĐĐLS (kính yêu Bác Hồ, biết ơn người có công).',
    rawLessons: [
      {
        week: '28',
        lessonName: 'Bài 17 (HKII): Đất nước là gì?',
        subLessonName:
          'Đọc: Đất nước là gì?; Nói và nghe: Cảnh đẹp đất nước (2 tiết); Viết: Nghe – viết: Bản em. Phân biệt ch/tr, ươc/ươt (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QPAN: HS bước đầu nhận thức tình yêu đất nước gắn với ý thức bảo vệ Tổ quốc; biết trân trọng cờ Tổ quốc, quê hương, biển đảo, non sông Việt Nam.',
      },
      {
        week: '28',
        lessonName: 'Bài 18 (HKII): Núi quê tôi',
        subLessonName:
          'Đọc: Núi quê tôi; Viết: Ôn viết chữ hoa V, X (2 tiết); Luyện tập: Từ ngữ có nghĩa giống nhau; Biện pháp So sánh (1 tiết); Luyện tập: Viết đoạn văn nêu tình cảm, cảm xúc về một cảnh đẹp của đất nước (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp QPAN: HS bồi dưỡng tình yêu quê hương, niềm tự hào về cảnh đẹp núi non của đất nước; biết trân trọng và có trách nhiệm gìn giữ hình ảnh quê hương Việt Nam.',
      },
      {
        week: '29',
        lessonName: 'Bài 19 (HKII): Sông Hương',
        subLessonName:
          'Đọc: Sông Hương; Nói và nghe: Kể chuyện Sơn Tinh, Thủy Tinh (2 tiết); Viết: Nghe – viết: Chợ Hòn Gai; Viết hoa tên riêng địa lý (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GDĐP: Biết được vị trí, địa điểm của các danh lam, thắng cảnh nổi tiếng trên quê hương em (Sông Hương). Tích hợp GD LTCM, đạo đức, lối sống: Trân trọng vẻ đẹp quê hương, có ý thức viết đúng tên riêng địa lí.',
      },
      {
        week: '29',
        lessonName: 'Bài 20 (HKII): Tiếng nước mình',
        subLessonName:
          'Đọc: Tiếng nước mình; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về đất nước; Câu cảm, câu khiến (1 tiết); Luyện tập: Viết đoạn văn nêu tình cảm, cảm xúc về một cảnh đẹp của đất nước (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp QPAN: HS biết yêu quý tiếng Việt, tự hào về đất nước, con người Việt Nam; có ý thức giữ gìn bản sắc văn hóa dân tộc. Tích hợp GDĐP: Kể được tên các di tích lịch sử văn hóa nổi tiếng trên quê hương em.',
      },
      {
        week: '30',
        lessonName: 'Bài 21 (HKII): Nhà rông',
        subLessonName:
          'Đọc: Nhà rông; Nói và nghe: Quê hương em (2 tiết); Viết: Nghe – viết: Nhà rông. Phân biệt s/x; dấu hỏi/dấu ngã (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QPAN: HS biết trân trọng bản sắc văn hóa dân tộc, hiểu mỗi vùng miền đều góp phần làm nên vẻ đẹp của Tổ quốc Việt Nam.',
      },
      {
        week: '30',
        lessonName: 'Bài 22 (HKII): Sự tích ông Đùng, bà Đùng',
        subLessonName:
          'Đọc: Sự tích ông Đùng, bà Đùng; Viết: Ôn chữ hoa Y (2 tiết); Luyện tập: Dấu ngoặc kép, dấu gạch ngang (1 tiết); Luyện tập: Viết đoạn nêu lí do yêu thích một nhân vật trong câu chuyện (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD LTCM, đạo đức, lối sống: Giáo dục học sinh lòng biết ơn những người có công với đất nước, biết trân trọng những con người đã góp sức chinh phục thiên nhiên, xây dựng cuộc sống cho cộng đồng.',
      },
      {
        week: '31',
        lessonName: 'Bài 23 (HKII): Hai Bà Trưng',
        subLessonName:
          'Đọc: Hai Bà Trưng; Nói và nghe: Kể chuyện Hai Bà Trưng (2 tiết); Viết: Nghe – viết: Hai Bà Trưng. Phân biệt ch/tr, ai/ay (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QPAN: Giáo dục HS lòng yêu nước, niềm tự hào dân tộc, ý thức biết ơn các anh hùng chống giặc ngoại xâm. Tích hợp GDĐP: Kể tên được các danh nhân tiêu biểu trên quê hương em thời xưa.',
      },
      {
        week: '31',
        lessonName: 'Bài 24 (HKII): Cùng Bác qua suối',
        subLessonName:
          'Đọc: Cùng Bác qua suối; Đọc mở rộng (2 tiết); Luyện tập: Mở rộng vốn từ về lễ hội; Dấu ngoặc kép, dấu gạch ngang (1 tiết); Luyện tập: Viết đoạn văn về nhân vật yêu thích (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp LTCM, ĐĐ, LS: HS biết kính yêu Bác Hồ, bồi dưỡng lòng biết ơn và ý thức trách nhiệm với quê hương, đất nước qua câu chuyện về Bác.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-tv-hk2-cd4',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 28,
    chapterCode: 'TV3-HK2-CD4',
    chapterTitle: 'Chủ đề 4 (HKII): Trái Đất của chúng mình & Ôn tập cuối năm (Tuần 32 – 35)',
    topicTitle:
      'Bài 25: Ngọn lửa Ô-lim-pích (3 tiết); Bài 26: Rô-bốt ở quanh ta (4 tiết); Bài 27: Thư của ông Trái Đất gửi các bạn nhỏ (3 tiết); Bài 28: Những điều nhỏ tớ làm cho Trái Đất (4 tiết); Bài 29: Bác sĩ Y-éc-xanh (3 tiết); Bài 30: Một mái nhà chung (4 tiết); Ôn tập và Đánh giá cuối học kì II (7 tiết)',
    adjustedContentSummary:
      'Tích hợp ĐĐLS (tinh thần thể thao, đoàn kết), AI (3.D1.1, 3.C5.2), NLS (1.2.CB1a, 3.2.CB1a, 2.3.CB1a, 4.1.CB1b, 3.1.CB1a), Tiết kiệm & BVNN, BVMT và QCN/KNS.',
    rawLessons: [
      {
        week: '32',
        lessonName: 'Bài 25 (HKII): Ngọn lửa Ô-lim-pích',
        subLessonName:
          'Đọc: Ngọn lửa Ô-lim-pích; Nói và nghe: Kể chuyện Đất quý, đất yêu (2 tiết); Viết: Nghe – viết: Ngọn lửa Ô-lim-pích; Viết hoa tên riêng nước ngoài (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp LTCM, đạo đức, lối sống: HS biết trân trọng tinh thần thể thao, đoàn kết, trung thực và cố gắng vượt khó.',
      },
      {
        week: '32',
        lessonName: 'Bài 26 (HKII): Rô-bốt ở quanh ta',
        subLessonName:
          'Đọc: Rô-bốt ở quanh ta; Viết: Ôn chữ hoa A, Ă, Â, Q kiểu 2 (2 tiết); Luyện tập: Dấu hai chấm, dấu phẩy. Đặt và trả lời câu hỏi: Để làm gì? (1 tiết); Luyện tập: Viết bản tin (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.D1.1: Trình bày quá trình huấn luyện đơn giản để robot thực hiện nhiệm vụ (Teachable Machine dạy robot phân biệt rác và đồ chơi). Tích hợp NLS 1.2.CB1a, 3.2.CB1a, 2.3.CB1a, 4.1.CB1b: Tìm kiếm nguồn thông tin đáng tin cậy để viết bản tin.',
      },
      {
        week: '33',
        lessonName: 'Bài 27 (HKII): Thư của ông Trái Đất gửi các bạn nhỏ',
        subLessonName:
          'Đọc: Thư của ông Trái Đất gửi các bạn nhỏ; Nói và nghe: Môi trường của chúng ta (2 tiết); Viết: Nghe – viết: Em nghĩ về Trái Đất. Phân biệt r/d/gi, dấu hỏi/dấu ngã (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Nhận biết AI dự báo sớm ô nhiễm môi trường trên phạm vi rộng. Tích hợp GD Tiết kiệm và BVNN, BVMT: Yêu thiên nhiên, bảo vệ cây xanh, nguồn nước, động vật.',
      },
      {
        week: '33',
        lessonName: 'Bài 28 (HKII): Những điều nhỏ tớ làm cho Trái Đất',
        subLessonName:
          'Đọc: Những điều nhỏ tớ làm cho Trái Đất; Đọc mở rộng (2 tiết); Luyện tập: Ôn tập các dấu câu, các kiểu câu đã học (1 tiết); Luyện tập: Viết đoạn văn kể lại một việc làm góp phần bảo vệ môi trường (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD Tiết kiệm và BVNN, BVMT: Bảo vệ cây xanh, nguồn nước, không xả rác. Tích hợp NLS 3.1.CB1a: Sử dụng công cụ số đơn giản để ghi lại hoặc trình bày một việc làm góp phần bảo vệ môi trường.',
      },
      {
        week: '34',
        lessonName: 'Bài 29 (HKII): Bác sĩ Y-éc-xanh',
        subLessonName:
          'Đọc: Bác sĩ Y-éc-xanh; Nói và nghe: Người nổi tiếng (2 tiết); Viết: Nghe – viết: Bác sĩ Y-éc-xanh; Viết hoa tên riêng nước ngoài (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QCN/KNS: HS hiểu trẻ em có quyền được chăm sóc sức khỏe; tôn trọng những người làm nghề chăm sóc sức khỏe; biết đặt câu hỏi lịch sự.',
      },
      {
        week: '34',
        lessonName: 'Bài 30 (HKII): Một mái nhà chung',
        subLessonName:
          'Đọc: Một mái nhà chung; Viết: Ôn chữ hoa M, N, V kiểu 2 (2 tiết); Luyện tập: Mở rộng vốn từ Trái Đất. Ôn tập về câu (1 tiết); Luyện tập: Viết đoạn văn tả bức tranh về Trái Đất (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp QCN: HS hiểu mọi người có quyền được sống trong môi trường an toàn, hòa bình; biết tôn trọng sự khác biệt và cùng chung tay xây dựng “mái nhà chung” Trái Đất.',
      },
      {
        week: '35',
        lessonName: 'Ôn tập và Đánh giá cuối học kì II',
        subLessonName: 'Ôn tập và đánh giá cuối học kì II (Tiết 1 – Tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt cả năm học lớp 3 và thực hiện kiểm tra, đánh giá cuối học kì II theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),
];

// ============================================================================
// 2. MÔN TOÁN LỚP 3 (35 TUẦN – 16 CHỦ ĐỀ, 81 BÀI HỌC – 175 TIẾT: HKI 90 TIẾT, HKII 85 TIẾT)
// ============================================================================

export const GRADE3_TOAN_TOPICS: CurriculumTopic[] = [
  buildGrade3Topic({
    id: 'g3-toan-cd1-2',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 7',
    totalPeriods: 33,
    chapterCode: 'TOAN3-CD1-2',
    chapterTitle: 'Chủ đề 1 & 2: Ôn tập và bổ sung; Bảng nhân, bảng chia (33 tiết)',
    topicTitle:
      'Bài 1: Ôn tập các số đến 1 000 (2 tiết); Bài 2: Ôn tập phép cộng, phép trừ trong phạm vi 1 000 (2 tiết); Bài 3: Tìm thành phần trong phép cộng, phép trừ (2 tiết); Bài 4: Ôn tập bảng nhân 2, 5; bảng chia 2, 5 (2 tiết); Bài 5: Bảng nhân 3, bảng chia 3 (2 tiết); Bài 6: Bảng nhân 4, bảng chia 4 (2 tiết); Bài 7: Ôn tập hình học và đo lường (2 tiết); Bài 8: Luyện tập chung (3 tiết); Bài 9: Bảng nhân 6, bảng chia 6 (2 tiết); Bài 10: Bảng nhân 7, bảng chia 7 (2 tiết); Bài 11: Bảng nhân 8, bảng chia 8 (2 tiết); Bài 12: Bảng nhân 9, bảng chia 9 (3 tiết); Bài 13: Tìm thành phần trong phép nhân, phép chia (2 tiết); Bài 14: Một phần mấy (2 tiết); Bài 15: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.A1.1, 3.A3.1), NLS (5.2.CB1a), GDBVMT (yêu quý động vật hoang dã) và ĐĐLS (tương thân tương ái).',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Ôn tập các số đến 1 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.1: Biết sử dụng AI như công cụ hỗ trợ tìm kiếm và tra cứu thông tin số liệu.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Ôn tập phép cộng, phép trừ trong phạm vi 1 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.1: Nhận biết AI hỗ trợ tính toán nhanh nhưng con người cần làm chủ quy trình tính.',
      },
      {
        week: '1–2',
        lessonName: 'Bài 3: Tìm thành phần trong phép cộng, phép trừ',
        subLessonName: 'Tiết 1: Tìm số hạng trong một tổng; Tiết 2: Tìm số bị trừ, số trừ',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 5.2.CB1a: GV chọn các câu trắc nghiệm trên Quizizz về tìm số hạng, số bị trừ, số trừ; HS xem phản hồi và ghi rõ lỗi nhầm quy tắc.',
      },
      {
        week: '2',
        lessonName: 'Bài 4. Ôn tập bảng nhân 2, 5; bảng chia 2, 5',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Ôn tập và vận dụng bảng nhân 2, 5; bảng chia 2, 5 vào giải toán.',
      },
      {
        week: '2',
        lessonName: 'Bài 5. Bảng nhân 3, bảng chia 3',
        subLessonName: 'Tiết 1: Bảng nhân 3; Tiết 2: Bảng chia 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.1: Sử dụng trợ lý học tập để luyện tập và ghi nhớ kiến thức bảng nhân 3.',
      },
      {
        week: '3',
        lessonName: 'Bài 6. Bảng nhân 4, bảng chia 4',
        subLessonName: 'Tiết 1: Bảng nhân 4; Tiết 2: Bảng chia 4',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Hình thành và vận dụng bảng nhân 4, bảng chia 4.',
      },
      {
        week: '3',
        lessonName: 'Bài 7. Ôn tập hình học và đo lường',
        subLessonName: 'Tiết 1: Ôn tập hình học; Tiết 2: Ôn tập đo lường',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A3.1: Biết AI có thể nhận diện nhầm hình ảnh nếu dữ liệu bị mờ hoặc méo.',
      },
      {
        week: '3–4',
        lessonName: 'Bài 8. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GDBVMT: Qua bài toán về cân nặng các con vật, HS biết yêu quý động vật hoang dã. Tích hợp ĐĐLS: Tương thân tương ái qua tình huống góp vở giúp bạn vùng lũ lụt.',
      },
      {
        week: '4',
        lessonName: 'Bài 9. Bảng nhân 6, bảng chia 6',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.1: HS nhận biết AI/trợ lí học tập có thể tạo câu đố luyện bảng nhân, bảng chia nhưng HS vẫn cần tự tính và kiểm tra kết quả.',
      },
      {
        week: '4–5',
        lessonName: 'Bài 10. Bảng nhân 7, bảng chia 7',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Hình thành và vận dụng bảng nhân 7, bảng chia 7.',
      },
      {
        week: '5',
        lessonName: 'Bài 11. Bảng nhân 8, bảng chia 8',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Hình thành và vận dụng bảng nhân 8, bảng chia 8.',
      },
      {
        week: '5–6',
        lessonName: 'Bài 12. Bảng nhân 9, bảng chia 9',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Hình thành và vận dụng bảng nhân 9, bảng chia 9.',
      },
      {
        week: '6',
        lessonName: 'Bài 13. Tìm thành phần trong phép nhân, phép chia',
        subLessonName: 'Tiết 1: Tìm thừa số trong một tích; Tiết 2: Tìm số bị chia, số chia',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Tìm thừa số chưa biết, số bị chia và số chia.',
      },
      {
        week: '6',
        lessonName: 'Bài 14. Một phần mấy',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Nhận biết một phần mấy của một hình hoặc một nhóm đồ vật.',
      },
      {
        week: '7',
        lessonName: 'Bài 15. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Củng cố toàn bộ bảng nhân, bảng chia từ 2 đến 9 và tìm thành phần phép tính.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-toan-cd3-4',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 7 – Tuần 12',
    totalPeriods: 27,
    chapterCode: 'TOAN3-CD3-4',
    chapterTitle:
      'Chủ đề 3 & 4: Làm quen với hình phẳng, hình khối; Phép nhân, phép chia trong phạm vi 100 (27 tiết)',
    topicTitle:
      'Bài 16: Điểm ở giữa, trung điểm của đoạn thẳng (2 tiết); Bài 17: Hình tròn. Tâm, bán kính, đường kính (1 tiết); Bài 18: Góc, góc vuông, góc không vuông (1 tiết); Bài 19: Hình tam giác, hình tứ giác. Hình vuông, hình chữ nhật (3 tiết); Bài 20: Thực hành vẽ góc vuông, đường tròn, hình vuông, hình chữ nhật (2 tiết); Bài 21: Khối lập phương, khối hộp chữ nhật (1 tiết); Bài 22: Luyện tập chung (2 tiết); Bài 23: Nhân số có 2 chữ số với số có một chữ số (2 tiết); Bài 24: Gấp một số lên một số lần (2 tiết); Bài 25: Phép chia hết, phép chia có dư (2 tiết); Bài 26: Chia số có hai chữ số cho số có một chữ số (3 tiết); Bài 27: Giảm một số đi một số lần (2 tiết); Bài 28: Bài toán giải bằng hai phép tính (2 tiết); Bài 29: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.A3.1, 3.A1.2) và NLS (5.1.CB1a dùng GeoGebra vẽ hình tròn).',
    rawLessons: [
      {
        week: '7',
        lessonName: 'Bài 16. Điểm ở giữa, trung điểm của đoạn thẳng',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A3.1: Hiểu rằng AI cần dữ liệu chính xác để xác định tọa độ các điểm.',
      },
      {
        week: '7',
        lessonName: 'Bài 17. Hình tròn. Tâm, bán kính, đường kính của hình tròn',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp NLS 5.1.CB1a: GV dùng GeoGebra để vẽ hình tròn, kéo điểm tâm và bán kính; HS quan sát và nêu đúng tên tâm, bán kính, đường kính.',
      },
      {
        week: '8',
        lessonName: 'Bài 18. Góc, góc vuông, góc không vuông',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Nhận biết góc, góc vuông, góc không vuông và sử dụng ê-ke để kiểm tra góc vuông.',
      },
      {
        week: '8',
        lessonName: 'Bài 19. Hình tam giác, hình tứ giác. Hình vuông, hình chữ nhật',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A3.1: Hiểu AI nhận diện hình học dựa trên đặc trưng (số cạnh, góc) và có thể sai sót.',
      },
      {
        week: '8–9',
        lessonName:
          'Bài 20. Thực hành vẽ góc vuông, vẽ đường tròn, hình vuông, hình chữ nhật và vẽ trang trí',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hành vẽ góc vuông, đường tròn, hình vuông, hình chữ nhật.',
      },
      {
        week: '9',
        lessonName: 'Bài 21. Khối lập phương, khối hộp chữ nhật',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Nhận biết đỉnh, cạnh, mặt của khối lập phương và khối hộp chữ nhật.',
      },
      {
        week: '9',
        lessonName: 'Bài 22. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.2: Phân biệt việc dùng AI hỗ trợ và việc để AI làm thay hoàn toàn bài tập.',
      },
      {
        week: '9–10',
        lessonName: 'Bài 23. Nhân số có 2 chữ số với số có một chữ số',
        subLessonName: 'Tiết 1 (không nhớ) – Tiết 2 (có nhớ)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hiện phép nhân số có hai chữ số với số có một chữ số.',
      },
      {
        week: '10',
        lessonName: 'Bài 24. Gấp một số lên một số lần',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Giải bài toán gấp một số lên một số lần.',
      },
      {
        week: '10',
        lessonName: 'Bài 25. Phép chia hết, phép chia có dư',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Nhận biết phép chia hết, phép chia có dư và số dư luôn bé hơn số chia.',
      },
      {
        week: '11',
        lessonName: 'Bài 26. Chia số có hai chữ số cho số có một chữ số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A3.1: HS biết kết quả do AI hoặc công cụ tính toán đưa ra cần được kiểm chứng bằng quy tắc toán học (kiểm tra lại thương, số dư bằng phép nhân và phép cộng).',
      },
      {
        week: '11',
        lessonName: 'Bài 27. Giảm một số đi một số lần',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Giải bài toán giảm một số đi một số lần.',
      },
      {
        week: '12',
        lessonName: 'Bài 28. Bài toán giải bằng hai phép tính',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.2: Sử dụng AI như trợ lý gợi ý các bước giải thay vì đưa đáp số cuối cùng.',
      },
      {
        week: '12',
        lessonName: 'Bài 29. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Củng cố phép nhân, phép chia trong phạm vi 100 và bài toán giải bằng hai phép tính.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-toan-cd5-6-7',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 18',
    totalPeriods: 30,
    chapterCode: 'TOAN3-CD5-6-7',
    chapterTitle:
      'Chủ đề 5, 6 & 7: Đơn vị đo độ dài, khối lượng, dung tích, nhiệt độ; Phép nhân, phép chia trong phạm vi 1 000 & Ôn tập HKI (30 tiết)',
    topicTitle:
      'Bài 30: Mi-li-mét (2 tiết); Bài 31: Gam (1 tiết); Bài 32: Mi-li-lít (1 tiết); Bài 33: Nhiệt độ. Đơn vị đo nhiệt độ (1 tiết); Bài 34: Thực hành và trải nghiệm với các đơn vị mi-li-mét, gam, mi-li-lít, độ C (2 tiết); Bài 35: Luyện tập chung (2 tiết); Bài 36: Nhân số có ba chữ số với số có một chữ số (2 tiết); Bài 37: Chia số có ba chữ số cho số có một chữ số (3 tiết); Bài 38: Biểu thức số. Tính giá trị của biểu thức số (4 tiết); Bài 39: So sánh số lớn gấp mấy lần số bé (2 tiết); Bài 40: Luyện tập chung (2 tiết); Bài 41: Ôn tập phép nhân, phép chia trong phạm vi 100, 1 000 (3 tiết); Bài 42: Ôn tập biểu thức số (2 tiết); Bài 43: Ôn tập hình học và đo lường (2 tiết); Bài 44: Ôn tập chung & Kiểm tra cuối HKI (2 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.C5.2, 3.C5.1, 3.A1.2) và NLS (5.1.CB1a).',
    rawLessons: [
      {
        week: '12–13',
        lessonName: 'Bài 30. Mi-li-mét',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Nhận biết đơn vị đo độ dài mi-li-mét (mm) và quan hệ giữa cm, dm, m với mm.',
      },
      {
        week: '13',
        lessonName: 'Bài 31. Gam',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Nhận biết đơn vị đo khối lượng gam (g) và quan hệ giữa kg và g.',
      },
      {
        week: '13',
        lessonName: 'Bài 32. Mi-li-lít',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Nhận biết đơn vị đo dung tích mi-li-lít (ml) và quan hệ giữa l và ml.',
      },
      {
        week: '13',
        lessonName: 'Bài 33. Nhiệt độ. Đơn vị đo nhiệt độ',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Biết AI sử dụng dữ liệu nhiệt độ hằng ngày để thực hiện bài toán dự đoán thời tiết.',
      },
      {
        week: '13–14',
        lessonName:
          'Bài 34. Thực hành và trải nghiệm với các đơn vị mi-li-mét, gam, mi-li-lít, độ C',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hành đo độ dài, cân khối lượng, đong dung tích và đọc nhiệt kế.',
      },
      {
        week: '14',
        lessonName: 'Bài 35. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Củng cố các đơn vị đo độ dài, khối lượng, dung tích, nhiệt độ.',
      },
      {
        week: '14',
        lessonName: 'Bài 36. Nhân số có ba chữ số với số có một chữ số',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hiện phép nhân số có ba chữ số với số có một chữ số.',
      },
      {
        week: '15',
        lessonName: 'Bài 37. Chia số có ba chữ số cho số có một chữ số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Thực hiện phép chia số có ba chữ số cho số có một chữ số.',
      },
      {
        week: '15–16',
        lessonName: 'Bài 38. Biểu thức số. Tính giá trị của biểu thức số',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 5.1.CB1a & AI (Khung 3439) - 3.C5.1: Hiểu máy tính/AI thực hiện biểu thức theo quy tắc và câu lệnh rõ ràng; phải nhập đúng dấu ngoặc, đúng thứ tự phép tính thì công cụ mới cho kết quả phù hợp.',
      },
      {
        week: '16',
        lessonName: 'Bài 39. So sánh số lớn gấp mấy lần số bé',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Giải bài toán so sánh số lớn gấp mấy lần số bé.',
      },
      {
        week: '16–17',
        lessonName: 'Bài 40. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Củng cố phép nhân, phép chia trong phạm vi 1 000 và tính giá trị biểu thức số.',
      },
      {
        week: '17',
        lessonName: 'Bài 41. Ôn tập phép nhân, phép chia trong phạm vi 100, 1 000',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.2: HS phân biệt dùng AI để hỗ trợ ôn tập, kiểm tra kết quả với việc để AI làm thay bài.',
      },
      {
        week: '17–18',
        lessonName: 'Bài 42. Ôn tập biểu thức số',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 5.1.CB1a: GV dùng PowerPoint tương tác cho HS kéo thả thứ tự thực hiện phép tính trong biểu thức.',
      },
      {
        week: '18',
        lessonName: 'Bài 43. Ôn tập hình học và đo lường',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Ôn tập tổng hợp về hình phẳng, hình khối và các đơn vị đo lường đã học ở học kì I.',
      },
      {
        week: '18',
        lessonName: 'Bài 44. Ôn tập chung & Kiểm tra cuối HKI',
        subLessonName: 'Bài 44. Ôn tập chung (1 tiết) & Ôn tập và kiểm tra cuối HKI (1 tiết)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hiện kiểm tra định kỳ cuối học kì I môn Toán lớp 3 theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-toan-cd8-9-10',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 25',
    totalPeriods: 35,
    chapterCode: 'TOAN3-CD8-9-10',
    chapterTitle:
      'Chủ đề 8, 9 & 10: Các số đến 10 000; Chu vi, diện tích một số hình phẳng; Cộng, trừ, nhân, chia trong phạm vi 10 000 (35 tiết)',
    topicTitle:
      'Bài 45: Các số có bốn chữ số. Số 10 000 (3 tiết); Bài 46: So sánh các số trong phạm vi 10 000 (2 tiết); Bài 47: Làm quen với chữ số La Mã (2 tiết); Bài 48: Làm tròn số đến hàng chục, hàng trăm (1 tiết); Bài 49: Luyện tập chung (3 tiết); Bài 50: Chu vi hình tam giác, tứ giác, chữ nhật, hình vuông (3 tiết); Bài 51: Diện tích của một hình. Xăng-ti-mét vuông (2 tiết); Bài 52: Diện tích hình chữ nhật, diện tích hình vuông (3 tiết); Bài 53: Luyện tập chung (3 tiết); Bài 54: Phép cộng trong phạm vi 10 000 (2 tiết); Bài 55: Phép trừ trong phạm vi 10 000 (2 tiết); Bài 56: Nhân số có bốn chữ số với số có một chữ số (3 tiết); Bài 57: Chia số có bốn chữ số cho số có một chữ số (3 tiết); Bài 58: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Tích hợp GDĐP (công trình giao thông đất nước), AI (3.C5.2, 3.A3.1), GDBVMT, ĐĐLS, NLS (5.1.CB1a), ATGT và QPAN.',
    rawLessons: [
      {
        week: '19',
        lessonName: 'Bài 45. Các số có bốn chữ số. Số 10 000',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Đọc, viết, xác định cấu tạo thập phân của các số có bốn chữ số và số 10 000.',
      },
      {
        week: '19',
        lessonName: 'Bài 46. So sánh các số trong phạm vi 10 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp giáo dục địa phương: HS tự hào về các công trình giao thông của đất nước; biết đọc, so sánh số liệu gắn với thực tế Việt Nam.',
      },
      {
        week: '19–20',
        lessonName: 'Bài 47. Làm quen với chữ số La Mã',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Nhận biết AI hỗ trợ nhận dạng các ký tự ngôn ngữ hoặc ký hiệu đặc biệt (dịch chữ viết tay La Mã sang chữ số hiện đại).',
      },
      {
        week: '20',
        lessonName: 'Bài 48. Làm tròn số đến hàng chục, hàng trăm',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A3.1: Hiểu AI thường đưa ra kết quả dự báo mang tính ước lượng, cần con người kiểm chứng.',
      },
      {
        week: '20–21',
        lessonName: 'Bài 49. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GDBVMT: Yêu quý, bảo vệ động vật hoang dã. Tích hợp đạo đức, lối sống: Trân trọng Tết cổ truyền, yêu quý gia đình.',
      },
      {
        week: '21',
        lessonName: 'Bài 50. Chu vi hình tam giác, hình tứ giác, hình chữ nhật, hình vuông',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Tính được chu vi hình tam giác, hình tứ giác, hình chữ nhật và hình vuông.',
      },
      {
        week: '21–22',
        lessonName: 'Bài 51. Diện tích của một hình. Xăng-ti-mét vuông',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Nhận biết biểu tượng diện tích và đơn vị đo diện tích xăng-ti-mét vuông (cm²).',
      },
      {
        week: '22',
        lessonName: 'Bài 52. Diện tích hình chữ nhật, diện tích hình vuông',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 5.1.CB1a: HS dùng bảng ô vuông tương tác trên GeoGebra và Liveworksheets để đếm số ô trong hình vuông, nhận ra diện tích bằng độ dài một cạnh nhân với chính nó.',
      },
      {
        week: '22–23',
        lessonName: 'Bài 53. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Vận dụng công thức tính chu vi, diện tích hình chữ nhật, hình vuông vào giải bài toán thực tế.',
      },
      {
        week: '23',
        lessonName: 'Bài 54. Phép cộng trong phạm vi 10 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A3.1: HS biết AI/công cụ tính toán chỉ cho kết quả phù hợp khi dữ liệu nhập vào chính xác.',
      },
      {
        week: '23–24',
        lessonName: 'Bài 55. Phép trừ trong phạm vi 10 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hiện phép trừ các số trong phạm vi 10 000.',
      },
      {
        week: '24',
        lessonName: 'Bài 56. Nhân số có bốn chữ số với số có một chữ số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp ATGT: Qua tình huống có phương tiện di chuyển trong SGK, HS biết đi tàu, xe an toàn. Tích hợp QPAN: Trân trọng công lao của bộ đội, giữ gìn hòa bình và an ninh đất nước.',
      },
      {
        week: '24–25',
        lessonName: 'Bài 57. Chia số có bốn chữ số cho số có một chữ số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp QPAN: Qua tình huống gắn với thành lũy, quân lính trong SGK, HS thêm tự hào về truyền thống dựng nước, giữ nước.',
      },
      {
        week: '25–26',
        lessonName: 'Bài 58. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Củng cố phép cộng, trừ, nhân, chia các số trong phạm vi 10 000.',
      },
    ],
  }),

  buildGrade3Topic({
    id: 'g3-toan-cd11-12-13-14-15-16',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 26 – Tuần 35',
    totalPeriods: 50,
    chapterCode: 'TOAN3-CD11-16',
    chapterTitle:
      'Chủ đề 11–16: Các số đến 100 000; Cộng, trừ, nhân, chia trong phạm vi 100 000; Thời gian, Tiền Việt Nam; Thống kê, xác suất & Ôn tập cuối năm (50 tiết)',
    topicTitle:
      'Bài 59: Các số có năm chữ số. Số 100 000 (4 tiết); Bài 60: So sánh các số trong phạm vi 100 000 (2 tiết); Bài 61: Làm tròn các số đến hàng nghìn, hàng chục nghìn (1 tiết); Bài 62: Luyện tập chung (3 tiết); Bài 63: Phép cộng trong phạm vi 100 000 (2 tiết); Bài 64: Phép trừ trong phạm vi 100 000 (2 tiết); Bài 65: Luyện tập chung (1 tiết); Bài 66: Xem đồng hồ. Tháng – năm (2 tiết); Bài 67: Thực hành xem đồng hồ, xem lịch (2 tiết); Bài 68: Tiền Việt Nam (2 tiết); Bài 69: Luyện tập chung (3 tiết); Bài 70: Nhân số có năm chữ số với số có một chữ số (3 tiết); Bài 71: Chia số có năm chữ số cho số có một chữ số (3 tiết); Bài 72: Luyện tập chung (3 tiết); Bài 73: Thu thập, phân loại, ghi chép số liệu. Bảng số liệu (3 tiết); Bài 74: Khả năng xảy ra của một sự kiện (1 tiết); Bài 75: Thực hành và trải nghiệm thu thập, phân loại, ghi chép số liệu (2 tiết); Bài 76–81: Ôn tập cuối năm & Kiểm tra cuối năm học (11 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (3.A3.1, 3.D2.1, 3.A1.2, 3.C4.1, 3.C5.2, 3.D2.2), NLS (1.1.CB1a, 4.1.CB1b, 5.2.CB1a), ĐĐLS (quý trọng đồng tiền, chi tiêu hợp lí), KNS, ATGT và GDBVMT.',
    rawLessons: [
      {
        week: '26',
        lessonName: 'Bài 59. Các số có năm chữ số. Số 100 000',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent: 'Đọc, viết, xác định hàng và lớp của các số có năm chữ số và số 100 000.',
      },
      {
        week: '26–27',
        lessonName: 'Bài 60. So sánh các số trong phạm vi 100 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'So sánh và sắp thứ tự các số trong phạm vi 100 000.',
      },
      {
        week: '27',
        lessonName: 'Bài 61. Làm tròn các số đến hàng nghìn, hàng chục nghìn',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Làm tròn các số đến hàng nghìn, hàng chục nghìn.',
      },
      {
        week: '27–28',
        lessonName: 'Bài 62. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Củng cố đọc, viết, so sánh và làm tròn các số trong phạm vi 100 000.',
      },
      {
        week: '28',
        lessonName: 'Bài 63. Phép cộng trong phạm vi 100 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A3.1: HS thể hiện thái độ tin tưởng công nghệ mức hợp lý nhưng vẫn kiểm soát kết quả.',
      },
      {
        week: '28–29',
        lessonName: 'Bài 64. Phép trừ trong phạm vi 100 000',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.D2.1: Ý thức được tầm quan trọng của dữ liệu chính xác đối với kết quả của AI.',
      },
      {
        week: '29',
        lessonName: 'Bài 65. Luyện tập chung',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Củng cố phép cộng, phép trừ trong phạm vi 100 000.',
      },
      {
        week: '29',
        lessonName: 'Bài 66. Xem đồng hồ. Tháng – năm',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Xem đồng hồ chính xác đến từng phút; nhận biết số ngày trong từng tháng của năm.',
      },
      {
        week: '29–30',
        lessonName: 'Bài 67. Thực hành xem đồng hồ, xem lịch',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB1a: GV trình chiếu Google Calendar hoặc đồng hồ số trực tuyến để HS xác định ngày, giờ, thứ trong tuần; lập thời gian biểu học tập.',
      },
      {
        week: '30',
        lessonName: 'Bài 68. Tiền Việt Nam',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GD Lý tưởng cách mạng, đạo đức, lối sống: Quý trọng đồng tiền, sử dụng tiền đúng mục đích, tiết kiệm. Tích hợp NLS 4.1.CB1b: Nhận biết mệnh giá tiền Việt Nam từ nguồn chính thống.',
      },
      {
        week: '30–31',
        lessonName: 'Bài 69. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp KNS & ATGT: Đọc giờ, xem lịch để sắp xếp việc học; biết đi xe buýt an toàn, xếp hàng nơi công cộng.',
      },
      {
        week: '31',
        lessonName: 'Bài 70. Nhân số có năm chữ số với số có một chữ số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GDBVMT: Qua tình huống sản xuất, cây trồng trong SGK, HS biết trân trọng lao động nông nghiệp, bảo vệ cây xanh.',
      },
      {
        week: '31–32',
        lessonName: 'Bài 71. Chia số có năm chữ số cho số có một chữ số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.A1.2: HS hiểu con người là trung tâm, AI chỉ hỗ trợ các phép tính lặp lại.',
      },
      {
        week: '32',
        lessonName: 'Bài 72. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Củng cố phép nhân, phép chia số có năm chữ số với/cho số có một chữ số.',
      },
      {
        week: '32–33',
        lessonName: 'Bài 73. Thu thập, phân loại, ghi chép số liệu. Bảng số liệu',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C4.1: Nhận biết các số liệu mình thu thập chính là “Dữ liệu” để dạy AI học.',
      },
      {
        week: '33',
        lessonName: 'Bài 74. Khả năng xảy ra của một sự kiện',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI (Khung 3439) - 3.C5.2: Hiểu dự đoán của AI dựa trên xác suất, không phải lúc nào cũng chắc chắn đúng.',
      },
      {
        week: '33',
        lessonName:
          'Bài 75. Thực hành và trải nghiệm thu thập, phân loại, ghi chép số liệu, đọc bảng số liệu',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp KNS: Hợp tác khi lập kế hoạch, tôn trọng ý kiến bạn; giữ vệ sinh nơi cắm trại.',
      },
      {
        week: '34–35',
        lessonName:
          'Bài 76 – Bài 81: Ôn tập cuối năm & Kiểm tra cuối năm học',
        subLessonName:
          'Bài 76: Ôn tập các số trong phạm vi 10 000, 100 000 (2 tiết); Bài 77: Ôn tập phép cộng, phép trừ (2 tiết); Bài 78: Ôn tập phép nhân, phép chia (3 tiết); Bài 79: Ôn tập hình học và đo lường (2 tiết); Bài 80: Ôn tập bảng số liệu, khả năng xảy ra của một sự kiện (1 tiết); Bài 81: Ôn tập chung & Kiểm tra cuối năm học (2 tiết)',
        periodAllocation: '12 tiết',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp NLS 5.2.CB1a, GDBVMT & AI (Khung 3439) - 3.D2.2: Kiểm tra lại kết quả phép chia có dư bằng phép nhân, cộng số dư; thực hiện kiểm tra định kỳ cuối năm học.',
      },
    ],
  }),
];
