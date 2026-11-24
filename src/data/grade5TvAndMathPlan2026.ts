import {
  CognitiveLevelCode,
  CurriculumLessonItem,
  CurriculumTopic,
  EducationLevelId,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_G5_SOURCE_DOC =
  'KHGD Khối lớp 5 – Tổ 4, 5 Trường TH&THCS Nguyễn Đình Anh (Đan Điền, ngày 28/8/2026)';

export function buildGrade5Topic(params: {
  id: string;
  subject: string;
  semester: 'HK1' | 'HK2' | 'CA_NAM';
  weekRange: string;
  totalPeriods: number;
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  adjustedContentSummary: string;
  rawLessons: {
    week: string;
    lessonName: string;
    subLessonName?: string;
    periodAllocation: string;
    periodsCount: number;
    adjustedContent: string;
    note?: string;
  }[];
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

  for (const item of params.rawLessons) {
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

  return {
    id: params.id,
    levelId: EducationLevelId.PRIMARY,
    grade: 5,
    subject: params.subject,
    semester: params.semester,
    weekRange: params.weekRange,
    totalPeriods: params.totalPeriods,
    chapterCode: params.chapterCode,
    chapterTitle: params.chapterTitle,
    topicTitle: params.topicTitle,
    adjustedContentSummary: params.adjustedContentSummary,
    sourceDocument: NDA_G5_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1. MÔN TIẾNG VIỆT LỚP 5 (35 TUẦN – 245 TIẾT: HKI 126 TIẾT, HKII 119 TIẾT)
// ============================================================================

export const GRADE5_TIENG_VIET_TOPICS: CurriculumTopic[] = [
  buildGrade5Topic({
    id: 'g5-tv-cd1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 4',
    totalPeriods: 28,
    chapterCode: 'TV5-HK1-CD1',
    chapterTitle: 'Chủ điểm 1: Thế giới tuổi thơ (Tuần 1 – 4)',
    topicTitle:
      'Bài 1: Thanh âm của gió (3 tiết); Bài 2: Cánh đồng hoa (4 tiết); Bài 3: Tuổi Ngựa (3 tiết); Bài 4: Bến sông tuổi thơ (4 tiết); Bài 5: Tiếng hạt nảy mầm (3 tiết); Bài 6: Ngôi sao sân cỏ (4 tiết); Bài 7: Bộ sưu tập độc đáo (3 tiết); Bài 8: Hành tinh kì lạ (4 tiết)',
    adjustedContentSummary:
      'Tích hợp ĐĐLS (yêu quê hương, thiên nhiên, hợp tác, trung thực fair-play), QCN (quyền vui chơi, bày tỏ cảm xúc, sáng tạo), Tiết kiệm nước (giữ gìn bến sông, tưới cây vừa đủ), NLS (1.1.CB2b, 3.1.CB2a, 2.2.CB2a, 1.2.CB2a, 5.2.CB2a, 1.3.CB2a) và AI (5.A2.1, 5.C4.2, 5.A1.1, 5.A2.2).',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Thanh âm của gió',
        subLessonName:
          'Đọc: Thanh âm của gió; LT&C: Luyện tập về danh từ, động từ, tính từ; Viết: Tìm hiểu cách viết bài văn kể chuyện sáng tạo',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tình yêu quê hương, biết lắng nghe vẻ đẹp của thiên nhiên và sống chan hòa với bạn bè. Quyền con người: Lồng ghép quyền trẻ em được vui chơi, được bày tỏ cảm xúc và chia sẻ trải nghiệm khi tham gia các trò chơi ngoài trời. NLS: 1.1.CB2b - HS dùng Google/YouTube tìm và nghe âm thanh tự nhiên phục vụ bài đọc. AI: 5.A2.1 - Thảo luận AI có thể phân tích âm thanh nhưng không thay thế cảm nhận tình yêu quê hương của con người.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Cánh đồng hoa',
        subLessonName:
          'Đọc: Cánh đồng hoa; Viết: Tìm hiểu cách viết bài văn kể chuyện sáng tạo (tiếp theo); Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Hình thành ý thức hợp tác, biết chung tay cải tạo cảnh quan và làm việc có ích cho cộng đồng. Quyền con người: Giáo dục quyền được tham gia, đóng góp ý kiến để xây dựng môi trường sống xanh, sạch, đẹp. AI: 5.C4.2 - Trải nghiệm AutoDraw hoặc Scribble Diffusion để hiện thực hóa hình ảnh cánh đồng hoa. NLS: 3.1.CB2a - HS dùng AutoDraw/Canva thể hiện hình ảnh cánh đồng hoa theo trí tưởng tượng.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Tuổi Ngựa',
        subLessonName:
          'Đọc: Tuổi Ngựa; LT&C: Đại từ; Viết: Lập dàn ý cho bài văn kể chuyện sáng tạo',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tình yêu gia đình, yêu quê hương qua khát vọng đi xa nhưng vẫn nhớ về mẹ và nơi chốn thân thuộc. Quyền con người: Lồng ghép quyền được nuôi dưỡng ước mơ, được học tập, khám phá thế giới phù hợp với lứa tuổi. NLS: 1.1.CB2b - HS tra cứu thông tin về các vùng đất, danh lam thắng cảnh mà ngựa con muốn đi qua. AI: 5.A1.1 - Liên hệ robot thám hiểm tích hợp AI giúp con người khám phá các vùng đất xa xôi, nguy hiểm.',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Bến sông tuổi thơ',
        subLessonName:
          'Đọc: Bến sông tuổi thơ; Viết: Viết bài văn kể chuyện sáng tạo; Nói và nghe: Những câu chuyện thú vị',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục lòng biết ơn, trân trọng kỉ niệm tuổi thơ và nếp sống nghĩa tình nơi quê nhà. Tiết kiệm và bảo vệ nguồn nước: Liên hệ việc giữ gìn bến sông, ao hồ quê hương; không xả rác xuống sông, biết quý trọng nguồn nước sạch. NLS: 2.2.CB2a - HS chia sẻ cảm xúc về quê hương trên Padlet/Classroom theo hướng dẫn của GV. Quyền con người: Rèn quyền được bày tỏ ý kiến, biết lắng nghe và tôn trọng ý kiến khác biệt khi trao đổi về chủ điểm bến sông tuổi thơ.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Tiếng hạt nảy mầm',
        subLessonName:
          'Đọc: Tiếng hạt nảy mầm; LT&C: Luyện tập về đại từ; Viết: Đánh giá, chỉnh sửa bài văn kể chuyện sáng tạo',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục ý thức nâng niu sự sống, chăm sóc cây xanh và kiên trì quan sát sự phát triển của thiên nhiên. Tiết kiệm và bảo vệ nguồn nước: Liên hệ vai trò của nước đối với hạt mầm; hướng dẫn HS tưới cây vừa đủ, không lãng phí nước. NLS: 1.2.CB2a - HS xem video quá trình hạt nảy mầm, nhận biết kênh giáo dục tin cậy. AI: 5.A2.2 - Tìm hiểu AI giám sát độ ẩm, ánh sáng giúp hạt mầm phát triển tốt trong nông nghiệp thông minh.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Ngôi sao sân cỏ',
        subLessonName:
          'Đọc: Ngôi sao sân cỏ; Viết: Tìm hiểu cách viết báo cáo công việc; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tinh thần trung thực, fair-play, tôn trọng luật chơi và biết cổ vũ văn minh. Quyền con người: Lồng ghép quyền được vui chơi, rèn luyện thể thao trong môi trường an toàn, bình đẳng. AI: 5.A1.1 - Tìm hiểu công nghệ VAR/AI hỗ trợ trọng tài xác định tình huống chính xác, công bằng. NLS: 5.2.CB2a - HS tra cứu thuật ngữ bóng đá qua từ điển số và chọn công cụ số phù hợp.',
      },
      {
        week: '4',
        lessonName: 'Bài 7: Bộ sưu tập độc đáo',
        subLessonName:
          'Đọc: Bộ sưu tập độc đáo; LT&C: Luyện tập về đại từ (tiếp theo); Viết: Viết báo cáo công việc',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Rèn nếp sống cẩn thận, biết giữ gìn đồ vật, chia sẻ câu chuyện về đồ vật bằng thái độ lịch sự. Quyền con người: Giáo dục ý thức tôn trọng sở thích, tài sản và sản phẩm sưu tầm cá nhân của bạn. NLS: 1.3.CB2a - HS chụp ảnh món đồ yêu thích và lưu vào thư mục số có tên rõ ràng. AI: 5.C4.2 - Trải nghiệm Teachable Machine để dạy máy nhận diện, phân loại đồ vật trong bộ sưu tập.',
      },
      {
        week: '4',
        lessonName: 'Bài 8: Hành tinh kì lạ',
        subLessonName:
          'Đọc: Hành tinh kì lạ; Viết: Đánh giá, chỉnh sửa báo cáo công việc; Nói và nghe: Những nơi vui chơi lí thú',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục trách nhiệm khi sáng tạo công nghệ, biết dùng tri thức để phục vụ con người và cộng đồng. Quyền con người: Lồng ghép quyền được sáng tạo, tưởng tượng và tham gia hoạt động học tập an toàn, tôn trọng ý kiến khác biệt. NLS: 3.1.CB2a - HS dùng PowerPoint thiết kế slide kể chuyện sáng tạo về thế giới tương lai.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-cd2',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 8',
    totalPeriods: 28,
    chapterCode: 'TV5-HK1-CD2',
    chapterTitle: 'Chủ điểm 2: Thiên nhiên kì thú (Tuần 5 – 8)',
    topicTitle:
      'Bài 9: Trước cổng trời (3 tiết); Bài 10: Kì diệu rừng xanh (4 tiết); Bài 11: Hang Sơn Đoòng – những điều kì thú (3 tiết); Bài 12: Những hòn đảo trên vịnh Hạ Long (4 tiết); Bài 13: Mầm non (3 tiết); Bài 14: Những ngọn núi nóng rẫy (4 tiết); Bài 15: Bài ca về mặt trời (3 tiết); Bài 16: Xin chào, Xa-ha-ra (4 tiết)',
    adjustedContentSummary:
      'Tích hợp QPAN (tình yêu vùng cao biên cương, biển đảo vịnh Hạ Long), Tiết kiệm & bảo vệ nguồn nước (rừng đầu nguồn, sông ngầm, biển đảo, sa mạc), ĐĐLS, QCN, NLS (5.2.CB2a, 2.5.CB2a, 2.2.CB2a, 3.4.CB2a, 4.1.CB2a, 6.1.CB2a, 4.2.CB2a) và AI (5.C4.2, 5.A2.2, 5.A1.1).',
    rawLessons: [
      {
        week: '5',
        lessonName: 'Bài 9: Trước cổng trời',
        subLessonName:
          'Đọc: Trước cổng trời; LT&C: Từ đồng nghĩa; Viết: Tìm hiểu cách viết bài văn tả phong cảnh',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'QPAN: Bồi dưỡng tình yêu quê hương, tự hào về vẻ đẹp vùng cao, biên cương và ý thức giữ gìn khối đại đoàn kết các dân tộc. Quyền con người: Giáo dục tôn trọng bản sắc văn hóa, phong tục tốt đẹp của các dân tộc trên đất nước Việt Nam. NLS: 5.2.CB2a - HS quan sát hình ảnh 360 độ về vùng núi cao bằng Google Earth/Bản đồ số. AI: 5.C4.2 - Sử dụng Trợ lí ảo/AI Search tìm hiểu văn hóa, phong tục vùng cao được nhắc trong bài đọc.',
      },
      {
        week: '5',
        lessonName: 'Bài 10: Kì diệu rừng xanh',
        subLessonName:
          'Đọc: Kì diệu rừng xanh; Viết: Tìm hiểu cách viết bài văn tả phong cảnh (tiếp theo); Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục lối sống xanh, biết yêu thiên nhiên và có trách nhiệm bảo vệ môi trường sống. Tiết kiệm và bảo vệ nguồn nước: Liên hệ rừng là nơi giữ nước, bảo vệ nguồn nước đầu nguồn; nhắc HS không phá hoại cây xanh, không xả rác khi tham quan rừng. AI: 5.A2.2 - Giới thiệu hệ thống AI nghe âm thanh rừng để phát hiện sớm phá rừng, cháy rừng. NLS: 2.5.CB2a - HS tra cứu động thực vật rừng và thực hiện nghi thức số khi trao đổi trong nhóm trực tuyến.',
      },
      {
        week: '6',
        lessonName: 'Bài 11: Hang Sơn Đoòng – những điều kì thú',
        subLessonName:
          'Đọc: Hang Sơn Đoòng – những điều kì thú; LT&C: Luyện tập về từ đồng nghĩa; Viết: Viết mở bài và kết bài cho bài văn tả phong cảnh',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng niềm tự hào về di sản thiên nhiên Việt Nam và ý thức ứng xử văn minh khi du lịch. Tiết kiệm và bảo vệ nguồn nước: Liên hệ bảo vệ sông ngầm, suối trong hang; giữ vệ sinh khi tham quan di sản thiên nhiên. NLS: 5.2.CB2a - HS tham gia tham quan ảo để khám phá vẻ đẹp hang động qua màn hình. AI: 5.C4.2 - Trải nghiệm Virtual Tour tích hợp AI khám phá hang Sơn Đoòng sinh động, an toàn.',
      },
      {
        week: '6',
        lessonName: 'Bài 12: Những hòn đảo trên vịnh Hạ Long',
        subLessonName:
          'Đọc: Những hòn đảo trên vịnh Hạ Long; Viết: Quan sát phong cảnh; Nói và nghe: Bảo tồn động vật hoang dã',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'QPAN: Lồng ghép tình yêu biển đảo, ý thức giữ gìn chủ quyền, tài nguyên và vẻ đẹp vùng biển Việt Nam. Tiết kiệm và bảo vệ nguồn nước: Giáo dục không xả rác xuống biển, bảo vệ nguồn nước biển và môi trường sống của sinh vật biển. NLS: 2.2.CB2a - HS sưu tầm ảnh di sản thiên nhiên và ghi nguồn khi đưa vào bài viết. Quyền con người: Rèn quyền được bày tỏ ý kiến, biết lắng nghe và tôn trọng ý kiến khác biệt khi trao đổi về chủ điểm những hòn đảo trên vịnh Hạ Long.',
      },
      {
        week: '7',
        lessonName: 'Bài 13: Mầm non',
        subLessonName:
          'Đọc: Mầm non; LT&C: Từ đa nghĩa; Viết: Lập dàn ý cho bài văn tả phong cảnh',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tình yêu cây xanh, biết nâng niu mầm sống và hành động nhỏ để làm đẹp trường lớp. Tiết kiệm và bảo vệ nguồn nước: Hướng dẫn HS chăm sóc cây non bằng cách tưới nước vừa đủ, tận dụng nước sạch hợp lí. NLS: 3.4.CB2a - HS dùng cấu trúc Nếu... thì... để lập trình đoạn thơ trên Scratch. AI: 5.A2.2 - Tìm hiểu AI hỗ trợ dự báo thời tiết, chăm sóc cây trồng và bảo vệ môi trường sống.',
      },
      {
        week: '7',
        lessonName: 'Bài 14: Những ngọn núi nóng rẫy',
        subLessonName:
          'Đọc: Những ngọn núi nóng rẫy; Viết: Viết đoạn văn tả phong cảnh; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tinh thần bình tĩnh, trách nhiệm và biết chia sẻ khó khăn với cộng đồng vùng thiên tai. Quyền con người: Lồng ghép quyền được an toàn trước thiên tai; biết tìm kiếm sự hỗ trợ của người lớn khi có nguy cơ nguy hiểm. AI: 5.A1.1 - Liên hệ robot/AI quan trắc núi lửa giúp con người theo dõi nơi nguy hiểm. NLS: 4.1.CB2a - HS tìm hình ảnh núi lửa và thảo luận rủi ro khi xem nội dung giật gân trên mạng.',
      },
      {
        week: '8',
        lessonName: 'Bài 15: Bài ca về mặt trời',
        subLessonName:
          'Đọc: Bài ca về mặt trời; LT&C: Luyện tập về từ đa nghĩa; Viết: Viết bài văn tả phong cảnh',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục thái độ trân trọng thiên nhiên, biết sống hài hòa với các nguồn năng lượng của sự sống. Tiết kiệm và bảo vệ nguồn nước: Liên hệ nắng nóng làm nước bốc hơi nhanh; nhắc HS sử dụng nước sinh hoạt hợp lí trong ngày nắng. NLS: 6.1.CB2a - HS quan sát mô hình hệ Mặt Trời bằng ứng dụng số trực quan. AI: 5.C4.2 - Dùng mô phỏng AI trực quan để nhận biết chuyển động, vai trò của Mặt Trời đối với sự sống.',
      },
      {
        week: '8',
        lessonName: 'Bài 16: Xin chào, Xa-ha-ra',
        subLessonName:
          'Đọc: Xin chào, Xa-ha-ra; Viết: Đánh giá, chỉnh sửa bài văn tả phong cảnh; Nói và nghe: Cảnh đẹp thiên nhiên',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Quyền con người: Lồng ghép quyền được tiếp cận nước sạch và môi trường sống an toàn, phù hợp với điều kiện tự nhiên. Tiết kiệm và bảo vệ nguồn nước: Từ đặc điểm sa mạc, giáo dục ý thức tiết kiệm nước, bảo vệ nước sạch trong sinh hoạt hằng ngày. NLS: 4.2.CB2a - HS tìm thông tin về sa mạc và biết bảo vệ dữ liệu cá nhân khi truy cập website lạ.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-ot-ghk1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 9',
    totalPeriods: 7,
    chapterCode: 'TV5-HK1-OT1',
    chapterTitle: 'Ôn tập và Đánh giá giữa học kì I (Tuần 9)',
    topicTitle: 'Ôn tập và Đánh giá giữa học kì I (Tiết 1 – Tiết 7: Ôn tập, Kiểm tra đọc, Kiểm tra đọc hiểu - viết)',
    adjustedContentSummary:
      'Hệ thống hóa kiến thức Tiếng Việt nửa đầu học kì I (Thế giới tuổi thơ, Thiên nhiên kì thú); đánh giá kĩ năng Đọc thành tiếng, Đọc hiểu, Luyện từ và câu, Viết bài văn kể chuyện sáng tạo / tả phong cảnh.',
    rawLessons: [
      {
        week: '9',
        lessonName: 'Ôn tập và Đánh giá giữa học kì I',
        subLessonName: 'Ôn tập tiết 1–5; Kiểm tra đọc (Tiết 6); Kiểm tra đọc hiểu - viết (Tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Ôn tập hệ thống hóa kiến thức từ Tuần 1 đến Tuần 8 và thực hiện kiểm tra đánh giá định kỳ giữa học kì I theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-cd3',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 13',
    totalPeriods: 28,
    chapterCode: 'TV5-HK1-CD3',
    chapterTitle: 'Chủ điểm 3: Trên con đường học tập (Tuần 10 – 13)',
    topicTitle:
      'Bài 17: Thư gửi các học sinh (3 tiết); Bài 18: Tấm gương tự học (4 tiết); Bài 19: Trải nghiệm để sáng tạo (3 tiết); Bài 20: Khổ luyện thành tài (4 tiết); Bài 21: Thế giới trong trang sách (3 tiết); Bài 22: Từ những câu chuyện ấu thơ (4 tiết); Bài 23: Giới thiệu sách Dế Mèn phiêu lưu kí (3 tiết); Bài 24: Tinh thần học tập của nhà Phi-lít (4 tiết)',
    adjustedContentSummary:
      'Tích hợp QPAN, ĐĐLS (thực hiện lời Bác Hồ dạy, tự học, khổ luyện thành tài, văn hóa đọc), QCN (quyền học tập suốt đời, phát triển năng khiếu), NLS (6.2.CB2a, 1.2.CB2a, 3.1.CB2a, 2.5.CB2a, 1.3.CB2a, 2.2.CB2a) và AI (5.A3.1, 5.D2.1, 5.C4.2, 5.D1.1).',
    rawLessons: [
      {
        week: '10',
        lessonName: 'Bài 17: Thư gửi các học sinh',
        subLessonName:
          'Đọc: Thư gửi các học sinh; LT&C: Sử dụng từ điển; Viết: Tìm hiểu cách viết đoạn văn giới thiệu nhân vật trong một cuốn sách',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'QPAN: Liên hệ trách nhiệm của thế hệ trẻ trong giữ gìn thành quả độc lập, yêu Tổ quốc và có ý thức học tập vì tương lai đất nước. Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục HS thực hiện lời Bác dạy, chăm học, chăm làm, rèn luyện để góp phần xây dựng đất nước. NLS: 6.2.CB2a - HS dùng từ điển số/chatbot để giải nghĩa từ khó, đối chiếu với nguồn tin cậy. AI: 5.A3.1 - Sử dụng chatbot AI giải nghĩa từ khó trong thư của Bác Hồ; rèn thói quen kiểm chứng thông tin.',
      },
      {
        week: '10',
        lessonName: 'Bài 18: Tấm gương tự học',
        subLessonName:
          'Đọc: Tấm gương tự học; Viết: Tìm ý cho đoạn văn giới thiệu nhân vật trong một cuốn sách; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tinh thần tự học, vượt khó, kiên trì rèn luyện để hoàn thiện bản thân. Quyền con người: Lồng ghép quyền được học tập suốt đời và trách nhiệm sử dụng cơ hội học tập một cách tích cực. AI: 5.D2.1 - Liên hệ con người cần tự học thường xuyên cũng như AI cần dữ liệu cập nhật để cải tiến. NLS: 1.2.CB2a - HS tra cứu tư liệu về tấm gương tự học, chọn thông tin phù hợp và đáng tin cậy.',
      },
      {
        week: '11',
        lessonName: 'Bài 19: Trải nghiệm để sáng tạo',
        subLessonName:
          'Đọc: Trải nghiệm để sáng tạo; LT&C: Luyện tập sử dụng từ điển; Viết: Viết đoạn văn giới thiệu nhân vật trong một cuốn sách',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Rèn lối sống chủ động, dám thử nghiệm, biết rút kinh nghiệm từ hoạt động thực tế. Quyền con người: Giáo dục quyền được tham gia hoạt động trải nghiệm, được bày tỏ ý tưởng và phát triển năng lực sáng tạo. NLS: 3.1.CB2a - HS lập bản đồ ý tưởng số về trải nghiệm và vốn từ phục vụ viết sáng tạo. AI: 5.C4.2 - Dùng trợ lí số tìm từ đồng nghĩa, từ láy giàu hình ảnh để mở rộng vốn từ khi viết.',
      },
      {
        week: '11',
        lessonName: 'Bài 20: Khổ luyện thành tài',
        subLessonName:
          'Đọc: Khổ luyện thành tài; Viết: Đánh giá, chỉnh sửa đoạn văn giới thiệu nhân vật trong một cuốn sách; Nói và nghe: Cuốn sách tôi yêu',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục đức tính kiên trì, tự giác, vượt khó; hiểu thành công cần quá trình rèn luyện bền bỉ. Quyền con người: Lồng ghép quyền được phát triển năng khiếu và được khích lệ trong quá trình học tập, luyện tập. NLS: 2.5.CB2a - HS trao đổi trực tuyến văn minh về ý chí khổ luyện, biết phản hồi tích cực cho bạn.',
      },
      {
        week: '12',
        lessonName: 'Bài 21: Thế giới trong trang sách',
        subLessonName:
          'Đọc: Thế giới trong trang sách; LT&C: Dấu gạch ngang; Viết: Tìm hiểu cách viết đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục thói quen đọc sách lành mạnh, biết chọn sách phù hợp và chia sẻ điều hay từ sách. Quyền con người: Lồng ghép quyền được tiếp cận thông tin, được đọc sách và được học tập trong môi trường an toàn. NLS: 1.3.CB2a - HS lập thư mục/phiếu đọc sách số để lưu thông tin sách đã đọc. AI: 5.C4.2 - Dùng công cụ gợi ý sách phù hợp lứa tuổi, sau đó kiểm chứng và lựa chọn sách lành mạnh.',
      },
      {
        week: '12',
        lessonName: 'Bài 22: Từ những câu chuyện ấu thơ',
        subLessonName:
          'Đọc: Từ những câu chuyện ấu thơ; Viết: Tìm ý cho đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Rèn ý thức giữ gìn sách chung, đọc sách có trách nhiệm và tôn trọng tài sản tập thể. Quyền con người: Giáo dục quyền được đọc sách, được tham gia xây dựng tủ sách lớp và chia sẻ tri thức với bạn bè. AI: 5.A3.1 - Thảo luận cách dùng AI gợi ý sách an toàn, không sao chép cảm nhận cá nhân từ máy. NLS: 3.1.CB2a - HS tạo poster số giới thiệu tủ sách lớp và chia sẻ trong nhóm học tập.',
      },
      {
        week: '13',
        lessonName: 'Bài 23: Giới thiệu sách Dế Mèn phiêu lưu kí',
        subLessonName:
          'Đọc: Giới thiệu sách Dế Mèn phiêu lưu kí; LT&C: Luyện tập về dấu gạch ngang; Viết: Viết đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tình bạn, lòng nhân ái, biết nhận lỗi và sửa lỗi qua nhân vật văn học. Quyền con người: Lồng ghép thái độ tôn trọng sự khác biệt, không bắt nạt, biết bảo vệ bạn yếu thế trong tập thể. NLS: 1.2.CB2a - HS tra cứu thông tin về tác giả, tác phẩm từ nguồn tin cậy trước khi giới thiệu sách. AI: 5.D1.1 - HS đóng vai người huấn luyện máy, thu thập từ ngữ miêu tả ngoại hình nhân vật làm dữ liệu.',
      },
      {
        week: '13',
        lessonName: 'Bài 24: Tinh thần học tập của nhà Phi-lít',
        subLessonName:
          'Đọc: Tinh thần học tập của nhà Phi-lít; Viết: Đánh giá, chỉnh sửa đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện; Nói và nghe: Lợi ích của tự học',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tình yêu gia đình, biết quan tâm, chia sẻ và thể hiện lòng biết ơn với người thân. Quyền con người: Giáo dục quyền trẻ em được sống trong tình yêu thương, được chăm sóc và được lắng nghe trong gia đình. NLS: 2.2.CB2a - HS chia sẻ cảm nhận về câu chuyện trên Padlet lớp học, tôn trọng ý kiến khác biệt.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-cd4',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 35,
    chapterCode: 'TV5-HK1-CD4',
    chapterTitle: 'Chủ điểm 4: Nghệ thuật muôn màu & Ôn tập cuối HKI (Tuần 14 – 18)',
    topicTitle:
      'Bài 25: Tiếng đàn ba-la-lai-ca trên sông Đà (3 tiết); Bài 26: Trí tưởng tượng phong phú (4 tiết); Bài 27: Tranh làng Hồ (3 tiết); Bài 28: Tập hát quan họ (4 tiết); Bài 29: Phim hoạt hình Chú ốc sên bay (3 tiết); Bài 30: Nghệ thuật múa ba lê (4 tiết); Bài 31: Một ngôi chùa độc đáo (3 tiết); Bài 32: Sự tích chú Tễu (4 tiết); Ôn tập và Đánh giá cuối học kì I (7 tiết)',
    adjustedContentSummary:
      'Tích hợp ĐĐLS (tự hào lao động xây dựng đất nước, giữ gìn di sản văn hóa tranh Đông Hồ, quan họ, múa rối nước), Tiết kiệm nước (sông Đà, ao hồ rối nước), QCN, NLS (5.2.CB2a, 2.2.CB2a, 1.2.CB2a, 2.5.CB2a, 6.1.CB2a, 1.1.CB2b, 3.1.CB2a) và AI (5.A1.1, 5.C4.2, 5.D2.1).',
    rawLessons: [
      {
        week: '14',
        lessonName: 'Bài 25: Tiếng đàn ba-la-lai-ca trên sông Đà',
        subLessonName:
          'Đọc: Tiếng đàn ba-la-lai-ca trên sông Đà; LT&C: Biện pháp điệp từ, điệp ngữ; Viết: Tìm hiểu cách viết đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục niềm tự hào về lao động xây dựng đất nước và tinh thần cống hiến của con người Việt Nam. Tiết kiệm và bảo vệ nguồn nước: Liên hệ sông Đà, thủy điện và trách nhiệm bảo vệ dòng sông, sử dụng điện - nước tiết kiệm. NLS: 5.2.CB2a - HS nghe âm thanh nhạc cụ bằng học liệu số. AI: 5.A1.1 - Tìm hiểu AI hỗ trợ kĩ sư vận hành nhà máy thủy điện hiện đại an toàn, chính xác.',
      },
      {
        week: '14',
        lessonName: 'Bài 26: Trí tưởng tượng phong phú',
        subLessonName:
          'Đọc: Trí tưởng tượng phong phú; Viết: Tìm ý cho đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục sử dụng trí tưởng tượng theo hướng tích cực, biết tôn trọng sản phẩm sáng tạo của bạn. Quyền con người: Lồng ghép quyền được sáng tạo nghệ thuật, được trình bày ý tưởng cá nhân trong học tập. AI: 5.C4.2 - Dùng công cụ AI tạo hình minh họa ý tưởng, sau đó nhận xét điểm phù hợp và chưa phù hợp. NLS: 2.2.CB2a - HS tìm hình ảnh minh họa thơ và ghi nguồn khi chia sẻ.',
      },
      {
        week: '15',
        lessonName: 'Bài 27: Tranh làng Hồ',
        subLessonName:
          'Đọc: Tranh làng Hồ; LT&C: Luyện tập về điệp từ, điệp ngữ; Viết: Viết đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục ý thức giữ gìn di sản văn hóa dân tộc, trân trọng bàn tay lao động của nghệ nhân. Quyền con người: Lồng ghép quyền tham gia đời sống văn hóa và quyền được tiếp cận các giá trị nghệ thuật truyền thống. NLS: 1.2.CB2a - HS tra cứu tranh dân gian Đông Hồ từ bảo tàng/website uy tín. AI: 5.C4.2 - Quan sát hình ảnh số, thảo luận AI có thể phục dựng tranh nhưng cần tôn trọng giá trị truyền thống.',
      },
      {
        week: '15',
        lessonName: 'Bài 28: Tập hát quan họ',
        subLessonName:
          'Đọc: Tập hát quan họ; Viết: Đánh giá, chỉnh sửa đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ; Nói và nghe: Chương trình nghệ thuật em yêu thích',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tình yêu dân ca, ý thức bảo tồn di sản văn hóa phi vật thể của quê hương. Quyền con người: Giáo dục quyền được tham gia sinh hoạt văn hóa, nghệ thuật lành mạnh phù hợp với lứa tuổi. NLS: 2.5.CB2a - HS chia sẻ, nhận xét tiết mục nghệ thuật trên lớp học số bằng lời lẽ lịch sự.',
      },
      {
        week: '16',
        lessonName: 'Bài 29: Phim hoạt hình Chú ốc sên bay',
        subLessonName:
          'Đọc: Phim hoạt hình Chú ốc sên bay; LT&C: Kết từ; Viết: Tìm hiểu cách viết đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục thói quen xem phim có chọn lọc, biết nhận xét nhân vật và thông điệp tích cực. Quyền con người: Lồng ghép quyền trẻ em được tiếp cận sản phẩm văn hóa phù hợp, an toàn và có giá trị giáo dục. NLS: 6.1.CB2a - HS tìm hiểu công cụ dựng hoạt hình và nhận biết công nghệ số trong tạo chuyển động. AI: 5.D2.1 - Tìm hiểu AI học từ nhiều khung hình cũ để giúp chuyển động hoạt hình mượt mà hơn.',
      },
      {
        week: '16',
        lessonName: 'Bài 30: Nghệ thuật múa ba lê',
        subLessonName:
          'Đọc: Nghệ thuật múa ba lê; Viết: Tìm ý cho đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tinh thần kỉ luật, chăm chỉ luyện tập và tôn trọng công sức của nghệ sĩ. Quyền con người: Lồng ghép quyền được tham gia, thưởng thức nghệ thuật và phát triển năng khiếu cá nhân. AI: 5.C4.2 - Dùng học liệu số/AI gợi ý động tác mẫu, sau đó nhận xét vẻ đẹp kỉ luật của nghệ thuật biểu diễn. NLS: 5.2.CB2a - HS xem video tư liệu về múa ba lê, lựa chọn nguồn học liệu phù hợp.',
      },
      {
        week: '17',
        lessonName: 'Bài 31: Một ngôi chùa độc đáo',
        subLessonName:
          'Đọc: Một ngôi chùa độc đáo; LT&C: Luyện tập về kết từ; Viết: Viết đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục ý thức tôn trọng di sản kiến trúc, ứng xử văn minh nơi công cộng và nơi tham quan. Quyền con người: Lồng ghép thái độ tôn trọng giá trị văn hóa, tín ngưỡng và sự đa dạng trong đời sống cộng đồng. NLS: 1.1.CB2b - HS tra cứu hình ảnh 360 độ về kiến trúc chùa, ghi nhận thông tin chính. AI: 5.C4.2 - Trải nghiệm ảnh 3D/tham quan ảo, nhận biết AI hỗ trợ khám phá di sản văn hóa.',
      },
      {
        week: '17',
        lessonName: 'Bài 32: Sự tích chú Tễu',
        subLessonName:
          'Đọc: Sự tích chú Tễu; Viết: Đánh giá, chỉnh sửa đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình; Nói và nghe: Bộ phim yêu thích',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục ý thức giữ gìn nghệ thuật múa rối nước, trân trọng trí tuệ dân gian. Tiết kiệm và bảo vệ nguồn nước: Liên hệ sân khấu rối nước và ao hồ; nhắc HS bảo vệ nguồn nước, không làm ô nhiễm ao hồ làng quê. NLS: 3.1.CB2a - HS tạo phiếu giới thiệu phim yêu thích bằng mẫu số, trình bày ngắn gọn.',
      },
      {
        week: '18',
        lessonName: 'Ôn tập và Đánh giá cuối học kì I',
        subLessonName:
          'Ôn tập và Đánh giá cuối học kì I (Tiết 1–5: Phần 1 - Ôn tập; Tiết 6–7: Phần 2 - Đánh giá cuối học kì I)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt học kì I và thực hiện kiểm tra, đánh giá định kỳ cuối học kì I theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-cd5',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 22',
    totalPeriods: 28,
    chapterCode: 'TV5-HK2-CD5',
    chapterTitle: 'Chủ điểm 5: Vẻ đẹp cuộc sống (Tuần 19 – 22)',
    topicTitle:
      'Bài 1: Tiếng hát của người đá (3 tiết); Bài 2: Khúc hát ru những em bé lớn trên lưng mẹ (4 tiết); Bài 3: Hạt gạo làng ta (3 tiết); Bài 4: Hộp quà màu thiên thanh (4 tiết); Bài 5: Giỏ hoa tháng Năm (3 tiết); Bài 6: Thư của bố (4 tiết); Bài 7: Đoàn thuyền đánh cá (3 tiết); Bài 8: Khu rừng của Mát (4 tiết)',
    adjustedContentSummary:
      'Tích hợp ĐĐLS (tình mẫu tử, biết ơn người nông dân, hiếu thảo, bảo vệ rừng), QPAN (chủ quyền biển đảo qua bài Đoàn thuyền đánh cá), Tiết kiệm nước, QCN, NLS (6.2.CB2a, 3.1.CB2a, 1.3.CB2a, 2.5.CB2a, 2.2.CB2a, 4.3.CB2a, 3.4.CB2a, 4.4.CB2a) và AI (5.C4.2, 5.A2.1, 5.A2.2, 5.A3.1, 5.A1.1).',
    rawLessons: [
      {
        week: '19',
        lessonName: 'Bài 1: Tiếng hát của người đá',
        subLessonName:
          'Đọc: Tiếng hát của người đá; LT&C: Câu đơn và câu ghép; Viết: Tìm hiểu cách viết bài văn tả người',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tình yêu thiên nhiên, biết trân trọng những giá trị kì diệu của cuộc sống. Quyền con người: Lồng ghép quyền được sống trong môi trường an toàn, được bảo vệ trước những nguy cơ từ thiên nhiên và con người. NLS: 6.2.CB2a - HS dùng công cụ dịch thuật/tra cứu để tìm hiểu tên gọi di sản văn hóa. AI: 5.C4.2 - Dùng AI Search/hình ảnh 3D khám phá di sản.',
      },
      {
        week: '19',
        lessonName: 'Bài 2: Khúc hát ru những em bé lớn trên lưng mẹ',
        subLessonName:
          'Đọc: Khúc hát ru những em bé lớn trên lưng mẹ; Viết: Viết mở bài và kết bài cho bài văn tả người; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tình yêu mẹ, lòng biết ơn người lao động và ý thức chia sẻ việc nhà phù hợp với lứa tuổi. Quyền con người: Giáo dục quyền trẻ em được chăm sóc, yêu thương và được sống trong vòng tay gia đình. AI: 5.A2.1 - Thảo luận AI có thể tạo lời ru nhưng không thay thế tình mẫu tử và cảm xúc yêu thương. NLS: 3.1.CB2a - HS tạo poster số giới thiệu vẻ đẹp lao động và tình mẫu tử.',
      },
      {
        week: '20',
        lessonName: 'Bài 3: Hạt gạo làng ta',
        subLessonName:
          'Đọc: Hạt gạo làng ta; LT&C: Cách nối các vế câu ghép; Viết: Quan sát để viết bài văn tả người',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục lòng biết ơn người nông dân, biết quý trọng hạt gạo và tránh lãng phí thức ăn. Tiết kiệm và bảo vệ nguồn nước: Liên hệ quá trình làm ra hạt gạo cần nước; giáo dục sử dụng nước tiết kiệm trong sản xuất và sinh hoạt. NLS: 1.3.CB2a - HS nhập dữ liệu mùa vụ, hoạt động làm ra hạt gạo vào bảng tính để so sánh. AI: 5.A2.2 - Tìm hiểu AI trong nông nghiệp giúp dự báo sâu bệnh, thời tiết và nâng cao năng suất.',
      },
      {
        week: '20',
        lessonName: 'Bài 4: Hộp quà màu thiên thanh',
        subLessonName:
          'Đọc: Hộp quà màu thiên thanh; Viết: Lập dàn ý cho bài văn tả người; Nói và nghe: Nét đẹp học đường',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục văn hóa ứng xử học đường, biết trao lời chúc, lời cảm ơn và chia sẻ niềm vui với bạn. Quyền con người: Lồng ghép quyền được yêu thương, được nhận sự quan tâm và được sống trong môi trường học đường thân thiện. NLS: 2.5.CB2a - HS viết lời nhắn số lịch sự, chân thành gửi tặng bạn như một hộp quà tinh thần.',
      },
      {
        week: '21',
        lessonName: 'Bài 5: Giỏ hoa tháng Năm',
        subLessonName:
          'Đọc: Giỏ hoa tháng Năm; LT&C: Cách nối các vế câu ghép (Tiếp theo); Viết: Viết đoạn văn tả người',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục lòng biết ơn, biết dùng việc làm đẹp để thể hiện tình cảm với người thân, thầy cô, bạn bè. Tiết kiệm và bảo vệ nguồn nước: Liên hệ việc chăm sóc hoa, cây cảnh bằng cách tưới nước vừa đủ, tận dụng nước hợp lí. NLS: 2.2.CB2a - HS dùng phần mềm trình chiếu giới thiệu một loài hoa, biết trích dẫn hình ảnh. AI: 5.C4.2 - Dùng công cụ AI tạo bố cục poster loài hoa.',
      },
      {
        week: '21',
        lessonName: 'Bài 6: Thư của bố',
        subLessonName:
          'Đọc: Thư của bố; Viết: Viết bài văn tả người (Bài viết số 1); Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Rèn lòng hiếu thảo, biết tiếp nhận lời khuyên đúng đắn và sống có trách nhiệm với bản thân. Quyền con người: Giáo dục quyền trẻ em được lắng nghe, được yêu thương, được định hướng và bảo vệ trong gia đình. AI: 5.A3.1 - Thực hành đặt câu hỏi với AI an toàn, biết không thay thế lời khuyên của gia đình và thầy cô. NLS: 4.3.CB2a - HS thảo luận quy tắc an sinh số, cân bằng thời gian dùng thiết bị khi học ở nhà.',
      },
      {
        week: '22',
        lessonName: 'Bài 7: Đoàn thuyền đánh cá',
        subLessonName:
          'Đọc: Đoàn thuyền đánh cá; LT&C: Luyện tập về câu ghép; Viết: Đánh giá, chỉnh sửa bài văn tả người',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'QPAN: Lồng ghép tình yêu biển đảo, ý thức giữ gìn chủ quyền biển đảo và an toàn cho ngư dân khi lao động trên biển. Tiết kiệm và bảo vệ nguồn nước: Giáo dục bảo vệ môi trường biển, không xả rác xuống biển, giữ nguồn nước biển trong lành. NLS: 3.4.CB2a - HS dùng cấu trúc Nếu... thì... mô phỏng quy trình đánh cá an toàn trên biển. AI: 5.A1.1 - Tìm hiểu AI dự báo thời tiết biển, hỗ trợ tàu thuyền tránh bão và giảm rủi ro.',
      },
      {
        week: '22',
        lessonName: 'Bài 8: Khu rừng của Mát',
        subLessonName:
          'Đọc: Khu rừng của Mát; Viết: Viết bài văn tả người (Bài viết số 2); Nói và nghe: Những ý kiến khác biệt',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục trách nhiệm cá nhân trong trồng cây, bảo vệ rừng và sống thân thiện với thiên nhiên. Tiết kiệm và bảo vệ nguồn nước: Liên hệ rừng giữ nước, chống xói mòn, bảo vệ nguồn nước đầu nguồn và môi trường sống. NLS: 4.4.CB2a - HS tìm hiểu công nghệ số giám sát rừng giúp bảo vệ môi trường, ngăn cháy rừng.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-cd6',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 27',
    totalPeriods: 35,
    chapterCode: 'TV5-HK2-CD6',
    chapterTitle: 'Chủ điểm 6: Hương sắc trăm miền & Ôn tập giữa HKII (Tuần 23 – 27)',
    topicTitle:
      'Bài 9: Hội thổi cơm thi ở Đồng Vân (3 tiết); Bài 10: Những búp chè trên cây cổ thụ (4 tiết); Bài 11: Hương cốm mùa thu (3 tiết); Bài 12: Vũ điệu trên nền thổ cẩm (4 tiết); Bài 13: Đàn t’rưng – tiếng ca đại ngàn (3 tiết); Bài 14: Đường quê Đồng Tháp Mười (4 tiết); Bài 15: Xuồng ba lá quê tôi (3 tiết); Bài 16: Về thăm Đất Mũi (4 tiết); Ôn tập và Đánh giá giữa học kì II (7 tiết)',
    adjustedContentSummary:
      'Tích hợp ĐĐLS (lễ hội truyền thống, sản vật quê hương, đoàn kết các dân tộc), QPAN (tự hào cực Nam Tổ quốc Đất Mũi), Tiết kiệm nước (kênh rạch Nam Bộ, rừng ngập mặn), NLS (3.1.CB2a, 6.1.CB2a, 5.2.CB2a, 1.2.CB2a, 1.3.CB2a) và AI (5.C4.2, 5.D1.1, 5.A3.1).',
    rawLessons: [
      {
        week: '23',
        lessonName: 'Bài 9: Hội thổi cơm thi ở Đồng Vân',
        subLessonName:
          'Đọc: Hội thổi cơm thi ở Đồng Vân; LT&C: Liên kết câu bằng cách lặp từ ngữ; Viết: Tìm hiểu cách viết đoạn văn thể hiện tình cảm, cảm xúc về một sự việc',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục ý thức giữ gìn lễ hội truyền thống, tinh thần đoàn kết, khéo léo và trung thực khi tham gia hoạt động tập thể. Quyền con người: Lồng ghép quyền được tham gia đời sống văn hóa cộng đồng và tôn trọng phong tục tốt đẹp của địa phương. NLS: 3.1.CB2a - HS sưu tầm, chỉnh sửa ảnh/văn bản để giới thiệu lễ hội địa phương. AI: 5.C4.2 - Dùng AI Search tìm tư liệu lễ hội, sau đó đối chiếu nguồn và trình bày bằng lời của mình.',
      },
      {
        week: '23',
        lessonName: 'Bài 10: Những búp chè trên cây cổ thụ',
        subLessonName:
          'Đọc: Những búp chè trên cây cổ thụ; Viết: Tìm ý cho đoạn văn thể hiện tình cảm, cảm xúc về một sự việc; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục quý trọng lao động, tri thức địa phương và sản vật quê hương. Tiết kiệm và bảo vệ nguồn nước: Liên hệ sản xuất chè cần đất, rừng và nước sạch; giáo dục bảo vệ nguồn nước vùng cao. AI: 5.D1.1 - Tìm hiểu dữ liệu hình ảnh giúp AI học cách nhận diện giống chè, cây trồng địa phương. NLS: 6.1.CB2a - HS dùng ứng dụng số nhận diện giống chè và thảo luận về đạo đức, tính công bằng của dữ liệu.',
      },
      {
        week: '24',
        lessonName: 'Bài 11: Hương cốm mùa thu',
        subLessonName:
          'Đọc: Hương cốm mùa thu; LT&C: Liên kết câu bằng từ ngữ nối; Viết: Viết đoạn văn thể hiện tình cảm, cảm xúc về một sự việc',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tình yêu nghề truyền thống, biết quý trọng sản phẩm lao động bình dị. Tiết kiệm và bảo vệ nguồn nước: Liên hệ hạt lúa, hạt cốm gắn với ruộng đồng và nguồn nước; giáo dục không làm ô nhiễm kênh mương, ao hồ. NLS: 3.1.CB2a - HS dùng sơ đồ tư duy số hệ thống quy trình làm cốm từ lời kể của gió. AI: 5.C4.2 - Dùng AI/sơ đồ số gợi ý quy trình, sau đó HS chọn lọc và bổ sung cảm xúc cá nhân.',
      },
      {
        week: '24',
        lessonName: 'Bài 12: Vũ điệu trên nền thổ cẩm',
        subLessonName:
          'Đọc: Vũ điệu trên nền thổ cẩm; Viết: Đánh giá, chỉnh sửa đoạn văn thể hiện tình cảm, cảm xúc về một sự việc; Nói và nghe: Địa điểm tham quan, du lịch',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tinh thần đoàn kết, tôn trọng sự đa dạng văn hóa trong cộng đồng Việt Nam. Quyền con người: Giáo dục quyền được giữ gìn bản sắc văn hóa, được tôn trọng trang phục, tiếng nói, phong tục của các dân tộc. NLS: 6.1.CB2a - HS dùng phần mềm số phục dựng hoa văn truyền thống, nhận biết vai trò công nghệ trong bảo tồn văn hóa.',
      },
      {
        week: '25',
        lessonName: 'Bài 13: Đàn t’rưng – tiếng ca đại ngàn',
        subLessonName:
          'Đọc: Đàn t’rưng – tiếng ca đại ngàn; LT&C: Liên kết câu bằng từ ngữ thay thế; Viết: Tìm hiểu cách viết chương trình hoạt động',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tình yêu âm nhạc dân tộc, ý thức giữ gìn giá trị văn hóa Tây Nguyên. Quyền con người: Lồng ghép quyền được tham gia, thưởng thức và sáng tạo nghệ thuật của mọi học sinh. NLS: 5.2.CB2a - HS dùng công cụ nhạc cụ số mô phỏng âm thanh đàn t’rưng. AI: 5.C4.2 - Dùng ứng dụng âm thanh/AI mô phỏng nhạc cụ dân tộc.',
      },
      {
        week: '25',
        lessonName: 'Bài 14: Đường quê Đồng Tháp Mười',
        subLessonName:
          'Đọc: Đường quê Đồng Tháp Mười; Viết: Viết chương trình hoạt động (Bài viết số 1); Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tình yêu quê hương, tự hào về vẻ đẹp bình dị của đường quê Việt Nam. Tiết kiệm và bảo vệ nguồn nước: Liên hệ kênh rạch, vùng đất ngập nước Đồng Tháp Mười; giáo dục bảo vệ nguồn nước và cảnh quan quê hương. AI: 5.A3.1 - Thực hành dùng AI Search để tìm tư liệu nhưng phải kiểm chứng bằng nguồn chính thống. NLS: 1.2.CB2a - HS tìm hình ảnh, thông tin từ website chính thống của địa phương.',
      },
      {
        week: '26',
        lessonName: 'Bài 15: Xuồng ba lá quê tôi',
        subLessonName:
          'Đọc: Xuồng ba lá quê tôi; LT&C: Luyện tập về liên kết câu trong đoạn văn; Viết: Đánh giá, chỉnh sửa chương trình hoạt động',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng tình yêu quê hương sông nước, trân trọng phương tiện lao động và nét đẹp văn hóa địa phương. Tiết kiệm và bảo vệ nguồn nước: Giáo dục giữ gìn sông rạch Nam Bộ, không vứt rác xuống kênh rạch. NLS: 1.3.CB2a - HS lưu trữ đoạn văn, hình ảnh về sông nước Nam Bộ vào thư mục số có cấu trúc. AI: 5.C4.2 - Dùng mô hình/hình ảnh số để quan sát xuồng ba lá.',
      },
      {
        week: '26',
        lessonName: 'Bài 16: Về thăm Đất Mũi',
        subLessonName:
          'Đọc: Về thăm Đất Mũi; Viết: Viết chương trình hoạt động (Bài viết số 2); Nói và nghe: Sản vật địa phương',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'QPAN: Lồng ghép niềm tự hào về cực Nam Tổ quốc, ý thức bảo vệ chủ quyền lãnh thổ, biển đảo và tài nguyên quốc gia. Tiết kiệm và bảo vệ nguồn nước: Liên hệ bảo vệ rừng ngập mặn, phòng chống xâm nhập mặn và giữ nguồn nước cho đời sống vùng ven biển. NLS: 5.2.CB2a - HS dùng Google Maps xác định cực Nam Tổ quốc và trích dẫn bản đồ trong bài viết.',
      },
      {
        week: '27',
        lessonName: 'Ôn tập và Đánh giá giữa học kì II',
        subLessonName:
          'Ôn tập tiết 1–5; Kiểm tra đọc (Tiết 6); Kiểm tra đọc hiểu - viết (Tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Ôn tập hệ thống hóa kiến thức từ Tuần 19 đến Tuần 26 và thực hiện kiểm tra đánh giá giữa học kì II theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-cd7',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 31',
    totalPeriods: 28,
    chapterCode: 'TV5-HK2-CD7',
    chapterTitle: 'Chủ điểm 7: Tiếp bước cha ông (Tuần 28 – 31)',
    topicTitle:
      'Bài 17: Nghìn năm văn hiến (3 tiết); Bài 18: Người thầy của muôn đời (4 tiết); Bài 19: Danh y Tuệ Tĩnh (3 tiết); Bài 20: Cụ Đồ Chiểu (4 tiết); Bài 21: Anh hùng Lao động Trần Đại Nghĩa (3 tiết); Bài 22: Bộ đội về làng (4 tiết); Bài 23: Về ngôi nhà đang xây (3 tiết); Bài 24: Việt Nam quê hương ta (4 tiết)',
    adjustedContentSummary:
      'Tích hợp QPAN (truyền thống yêu nước, Trần Đại Nghĩa, tình quân dân Bộ đội về làng, chủ quyền quốc gia), ĐĐLS (tôn sư trọng đạo Chu Văn An, y đức Tuệ Tĩnh, nghị lực Nguyễn Đình Chiểu), QCN, Tiết kiệm nước, NLS (1.2.CB2a, 6.2.CB2a, 4.1.CB2a, 2.5.CB2a, 3.1.CB2a, 2.2.CB2a, 5.2.CB2a, 4.2.CB2a) và AI (5.D1.1, 5.A2.1, 5.A2.2, 5.A1.1, 5.C4.2).',
    rawLessons: [
      {
        week: '28',
        lessonName: 'Bài 17: Nghìn năm văn hiến',
        subLessonName:
          'Đọc: Nghìn năm văn hiến; LT&C: Luyện tập về đại từ và kết từ; Viết: Tìm hiểu cách viết đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'QPAN: Liên hệ trách nhiệm học tập để góp phần xây dựng, bảo vệ và phát triển đất nước trong thời đại mới. Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng niềm tự hào về truyền thống hiếu học, trọng người tài và văn hiến của dân tộc. NLS: 1.2.CB2a - HS tra cứu bảng thống kê khoa thi, đối chiếu dữ liệu để bảo vệ cái đúng. AI: 5.D1.1 - HS nhận biết dữ liệu thống kê là nguồn để AI học, phân tích và hỗ trợ tìm hiểu lịch sử.',
      },
      {
        week: '28',
        lessonName: 'Bài 18: Người thầy của muôn đời',
        subLessonName:
          'Đọc: Người thầy của muôn đời; Viết: Tìm ý cho đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục truyền thống tôn sư trọng đạo, kính trọng người thầy và biết học điều hay từ các bậc hiền tài. Quyền con người: Lồng ghép quyền được học tập, được thầy cô hướng dẫn và trách nhiệm tôn trọng người dạy học. AI: 5.A2.1 - Thảo luận AI hỗ trợ tra cứu nhưng không thay thế đạo học, lòng biết ơn người thầy. NLS: 6.2.CB2a - HS dùng trợ lý ảo tìm nghĩa từ Hán Việt cổ.',
      },
      {
        week: '29',
        lessonName: 'Bài 19: Danh y Tuệ Tĩnh',
        subLessonName:
          'Đọc: Danh y Tuệ Tĩnh; LT&C: Luyện tập về từ đồng nghĩa và từ đa nghĩa; Viết: Viết đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng (Bài viết số 1)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục y đức, lòng nhân ái, tinh thần vì dân và trân trọng tri thức y học dân tộc. Quyền con người: Lồng ghép quyền được chăm sóc sức khỏe, được tiếp cận kiến thức bảo vệ sức khỏe phù hợp lứa tuổi. NLS: 4.1.CB2a - HS xem video 3D về cây thuốc Nam và biết bảo vệ thiết bị khi xem nội dung trên mạng. AI: 5.A2.2 - Tìm hiểu AI hỗ trợ nhận diện cây thuốc, phục vụ chăm sóc sức khỏe cộng đồng.',
      },
      {
        week: '29',
        lessonName: 'Bài 20: Cụ Đồ Chiểu',
        subLessonName:
          'Đọc: Cụ Đồ Chiểu; Viết: Đánh giá, chỉnh sửa đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng; Nói và nghe: Đền ơn đáp nghĩa',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng lòng yêu nước, nghị lực vượt khó, nhân cách thanh cao và tinh thần sống có ích. Quyền con người: Lồng ghép quyền được học tập, sáng tạo, cống hiến của người khuyết tật; giáo dục thái độ tôn trọng, không kì thị. NLS: 2.5.CB2a - HS viết cảm nghĩ trên nền tảng số, tuân thủ quy tắc ứng xử mạng.',
      },
      {
        week: '30',
        lessonName: 'Bài 21: Anh hùng Lao động Trần Đại Nghĩa',
        subLessonName:
          'Đọc: Anh hùng Lao động Trần Đại Nghĩa; LT&C: Luyện tập về câu ghép; Viết: Viết đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng (Bài viết số 2)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'QPAN: Giáo dục truyền thống yêu nước, ý thức học tập khoa học kĩ thuật để góp phần xây dựng nền quốc phòng và bảo vệ Tổ quốc. Lý tưởng cách mạng, đạo đức, lối sống: Bồi dưỡng lí tưởng cống hiến, tinh thần sáng tạo, trách nhiệm với đất nước và nhân dân. NLS: 3.1.CB2a - HS thiết kế dòng thời gian số về cuộc đời, sự nghiệp của Giáo sư Trần Đại Nghĩa. AI: 5.A1.1 - Liên hệ AI hỗ trợ nghiên cứu kĩ thuật chính xác cao nhưng cần trí tuệ, trách nhiệm của nhà khoa học.',
      },
      {
        week: '30',
        lessonName: 'Bài 22: Bộ đội về làng',
        subLessonName:
          'Đọc: Bộ đội về làng; Viết: Luyện viết đoạn văn thể hiện tình cảm, cảm xúc về một sự việc; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'QPAN: Giáo dục tình cảm quân dân, lòng biết ơn bộ đội, ý thức trân trọng những người bảo vệ bình yên cho Tổ quốc. Lý tưởng cách mạng, đạo đức, lối sống: Rèn lòng biết ơn, tinh thần đền ơn đáp nghĩa và sống có trách nhiệm với cộng đồng. AI: 5.A2.1 - Thảo luận AI không thể thay thế tình quân dân và lòng biết ơn đối với người lính. NLS: 2.2.CB2a - HS chia sẻ bài thơ/đoạn văn ý nghĩa lên Padlet.',
      },
      {
        week: '31',
        lessonName: 'Bài 23: Về ngôi nhà đang xây',
        subLessonName:
          'Đọc: Về ngôi nhà đang xây; LT&C: Viết hoa danh từ chung để thể hiện sự tôn trọng đặc biệt; Viết: Luyện tập lập dàn ý cho bài văn tả phong cảnh',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Quyền con người: Lồng ghép quyền có nơi ở an toàn, môi trường sống phù hợp và trách nhiệm giữ gìn nhà cửa, khu dân cư sạch đẹp. Tiết kiệm và bảo vệ nguồn nước: Liên hệ thiết kế ngôi nhà xanh, sử dụng nước tiết kiệm, thu gom nước mưa. NLS: 5.2.CB2a - HS thảo luận giải pháp công nghệ, nhà thông minh và kiến trúc xanh hiện đại. AI: 5.C4.2 - Dùng công cụ số/AI phác thảo ngôi nhà mơ ước.',
      },
      {
        week: '31',
        lessonName: 'Bài 24: Việt Nam quê hương ta',
        subLessonName:
          'Đọc: Việt Nam quê hương ta; Viết: Luyện viết bài văn tả phong cảnh; Nói và nghe: Di tích lịch sử',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'QPAN: Bồi dưỡng tình yêu Tổ quốc, niềm tự hào về non sông, con người Việt Nam và ý thức giữ gìn chủ quyền quốc gia. Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục trách nhiệm học tập, rèn luyện để góp phần làm đẹp quê hương đất nước. NLS: 4.2.CB2a - HS tạo album số về vẻ đẹp đất nước và bảo mật dữ liệu định danh cá nhân.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-tv-cd8',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 28,
    chapterCode: 'TV5-HK2-CD8',
    chapterTitle: 'Chủ điểm 8: Thế giới của chúng ta & Ôn tập cuối năm học (Tuần 32 – 35)',
    topicTitle:
      'Bài 25: Bài ca trái đất (3 tiết); Bài 26: Những con hạc giấy (4 tiết); Bài 27: Một người hùng thầm lặng (3 tiết); Bài 28: Giờ Trái Đất (4 tiết); Bài 29: Điện thoại di động (3 tiết); Bài 30: Thành phố thông minh Mát-xđa (4 tiết); Ôn tập và Đánh giá cuối năm học (7 tiết)',
    adjustedContentSummary:
      'Tích hợp QCN & QPAN (khát vọng hòa bình, phản đối chiến tranh, quyền sống an toàn), Tiết kiệm nước & BVMT (Giờ Trái Đất, thành phố thông minh Mát-xđa), NLS (4.4.CB2a, 2.5.CB2a, 1.2.CB2a, 6.1.CB2a, 4.2.CB2a, 6.2.CB2a) và AI (5.A2.2, 5.A2.1, 5.A3.1).',
    rawLessons: [
      {
        week: '32',
        lessonName: 'Bài 25: Bài ca trái đất',
        subLessonName:
          'Đọc: Bài ca trái đất; LT&C: Cách viết tên người và tên địa lí nước ngoài; Viết: Luyện tập lập dàn ý cho bài văn tả người',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Quyền con người: Lồng ghép quyền được sống trong môi trường trong lành, hòa bình và an toàn. Tiết kiệm và bảo vệ nguồn nước: Giáo dục bảo vệ nước sạch, chống ô nhiễm nguồn nước và cùng hành động vì Trái Đất xanh. NLS: 4.4.CB2a - HS tìm hiểu công nghệ số cảnh báo biến đổi khí hậu, bảo vệ môi trường. AI: 5.A2.2 - Giới thiệu AI đo ô nhiễm, cảnh báo thiên tai sớm để mọi người bảo vệ ngôi nhà chung.',
      },
      {
        week: '32',
        lessonName: 'Bài 26: Những con hạc giấy',
        subLessonName:
          'Đọc: Những con hạc giấy; Viết: Luyện viết bài văn tả người; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'QPAN: Giáo dục khát vọng hòa bình, phản đối chiến tranh, trân trọng cuộc sống yên bình và tình hữu nghị giữa các dân tộc. Quyền con người: Lồng ghép quyền được sống trong hòa bình, được bảo vệ tính mạng, sức khỏe và tuổi thơ. AI: 5.A2.2 - Thảo luận AI/dịch thuật số giúp lan tỏa thông điệp hòa bình tới bạn bè quốc tế. NLS: 2.5.CB2a - HS chia sẻ thông điệp hòa bình qua email/diễn đàn số, giao tiếp văn minh.',
      },
      {
        week: '33',
        lessonName: 'Bài 27: Một người hùng thầm lặng',
        subLessonName:
          'Đọc: Một người hùng thầm lặng; LT&C: Luyện tập về dấu gạch ngang; Viết: Tìm hiểu cách viết đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục lòng dũng cảm, tinh thần trách nhiệm, biết làm việc tốt âm thầm vì cộng đồng. Quyền con người: Lồng ghép quyền được bảo vệ an toàn và trách nhiệm hỗ trợ người gặp khó khăn trong khả năng của mình. NLS: 1.2.CB2a - HS tra cứu gương người tốt việc tốt trên báo điện tử uy tín. AI: 5.A2.1 - Thảo luận AI có thể tìm thông tin nhưng không thay thế lòng dũng cảm, trách nhiệm của con người.',
      },
      {
        week: '33',
        lessonName: 'Bài 28: Giờ Trái Đất',
        subLessonName:
          'Đọc: Giờ Trái Đất; Viết: Tìm ý cho đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng; Nói và nghe: Trải nghiệm ngày hè',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Giáo dục lối sống xanh, biết tham gia hành động nhỏ vì môi trường và cộng đồng. Tiết kiệm và bảo vệ nguồn nước: Mở rộng từ tiết kiệm năng lượng sang tiết kiệm nước, tắt vòi nước khi không dùng, bảo vệ tài nguyên thiên nhiên. NLS: 6.1.CB2a - HS dùng công cụ số thiết kế biểu tượng tiết kiệm năng lượng.',
      },
      {
        week: '34',
        lessonName: 'Bài 29: Điện thoại di động',
        subLessonName:
          'Đọc: Điện thoại di động; LT&C: Luyện tập về liên kết câu trong đoạn văn; Viết: Viết đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Lý tưởng cách mạng, đạo đức, lối sống: Rèn nếp sống số văn minh, sử dụng điện thoại đúng mục đích, không lệ thuộc thiết bị. Quyền con người: Lồng ghép quyền riêng tư, quyền được an toàn thông tin cá nhân khi sử dụng điện thoại và môi trường mạng. NLS: 4.2.CB2a - HS tìm hiểu lịch sử công nghệ, thực hành an toàn dữ liệu và quyền riêng tư khi dùng điện thoại. AI: 5.A3.1 - Thảo luận dùng trợ lí AI trên điện thoại an toàn, không chia sẻ dữ liệu cá nhân tùy tiện.',
      },
      {
        week: '34',
        lessonName: 'Bài 30: Thành phố thông minh Mát-xđa',
        subLessonName:
          'Đọc: Thành phố thông minh Mát-xđa; Viết: Đánh giá, chỉnh sửa đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng; Đọc mở rộng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Quyền con người: Lồng ghép quyền được sống trong đô thị an toàn, sạch đẹp, thuận tiện và thân thiện với mọi người. Tiết kiệm và bảo vệ nguồn nước: Liên hệ thành phố thông minh với hệ thống tiết kiệm nước, xử lí nước thải, tái sử dụng nước và giảm ô nhiễm. AI: 5.A2.2 - Vẽ sơ đồ thành phố mơ ước có cảm biến AI giúp giao thông thông suốt, hạn chế rác thải. NLS: 6.2.CB2a - HS thực hiện dự án Thành phố ước mơ bằng phần mềm số.',
      },
      {
        week: '35',
        lessonName: 'Ôn tập và Đánh giá cuối năm học',
        subLessonName:
          'Ôn tập tiết 1–5; Kiểm tra đọc (Tiết 6); Kiểm tra đọc hiểu - viết (Tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Hệ thống hóa kiến thức Tiếng Việt cả năm học lớp 5 và thực hiện kiểm tra, đánh giá định kỳ cuối năm học theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),
];

// ============================================================================
// 2. MÔN TOÁN LỚP 5 (35 TUẦN – 12 CHỦ ĐỀ, 75 BÀI HỌC – 175 TIẾT: HKI 90 TIẾT, HKII 85 TIẾT)
// ============================================================================

export const GRADE5_TOAN_TOPICS: CurriculumTopic[] = [
  buildGrade5Topic({
    id: 'g5-toan-cd1',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 4',
    totalPeriods: 19,
    chapterCode: 'TOAN5-CD1',
    chapterTitle: 'Chủ đề 1: Ôn tập và bổ sung (19 tiết)',
    topicTitle:
      'Bài 1: Ôn tập số tự nhiên (2 tiết); Bài 2: Ôn tập các phép tính với số tự nhiên (2 tiết); Bài 3: Ôn tập phân số (2 tiết); Bài 4: Phân số thập phân (1 tiết); Bài 5: Ôn tập các phép tính với phân số (3 tiết); Bài 6: Cộng, trừ hai phân số khác mẫu số (2 tiết); Bài 7: Hỗn số (2 tiết); Bài 8: Ôn tập hình học và đo lường (2 tiết); Bài 9: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.D2.1, 5.A1.1, 5.A2.1, 5.D1.1, 5.C4.1, 5.C4.2, 5.A3.1), NLS (1.1.CB2a, 5.2.CB1b, 5.2.CB2a, 1.1.CB2b, 5.2.TC3b, 2.1.CB2a), ĐĐLS và Tiết kiệm nước.',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1. Ôn tập số tự nhiên',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D2.1: Thảo luận: AI xử lý hàng triệu số tự nhiên để nhận diện chữ viết tay. Càng nhiều số liệu (dữ liệu), máy càng nhận diện chính xác. Năng lực số 1.1.CB2a: Học sinh biết chọn từ khóa đơn giản, tra cứu số liệu phù hợp để đọc, viết và so sánh số tự nhiên.',
      },
      {
        week: '1',
        lessonName: 'Bài 2. Ôn tập các phép tính với số tự nhiên',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: Xem video ngắn: AI thực hiện hàng tỷ phép tính mỗi giây để dự báo bão, thay con người làm các tính toán khổng lồ. Năng lực số 5.2.CB1b: Học sinh làm quen với máy tính bỏ túi, nhận biết các phím chức năng và dùng để kiểm tra kết quả phép tính.',
      },
      {
        week: '1–2',
        lessonName: 'Bài 3. Ôn tập phân số',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A2.1: Khẳng định: Máy tính tính toán phân số rất nhanh, nhưng con người mới là người hiểu ý nghĩa thực tế (ví dụ: chia bánh cho bạn). Năng lực số 5.2.CB2a: Học sinh sử dụng phần mềm hoặc hình ảnh số trực quan để quan sát, so sánh và nhận biết phân số.',
      },
      {
        week: '2',
        lessonName: 'Bài 4. Phân số thập phân',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'AI 5.D1.1: Tìm hiểu cách AI chuyển đổi dữ liệu hình ảnh thành các dãy số (phân số thập phân) để máy có thể “hiểu” được hình ảnh.',
      },
      {
        week: '2',
        lessonName: 'Bài 5. Ôn tập các phép tính với phân số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A1.1: AI hỗ trợ phần mềm thiết kế cơ khí tính toán tỷ lệ phân số cực chính xác để lắp ráp các bộ phận robot siêu nhỏ. Đạo đức, lối sống: Qua bài toán quyên góp sách, thư viện hoặc chia sẻ học liệu, giáo dục học sinh biết quan tâm, chia sẻ và hình thành thói quen đọc sách.',
      },
      {
        week: '3',
        lessonName: 'Bài 6. Cộng, trừ hai phân số khác mẫu số',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.1: Sử dụng tư duy thuật toán “Tìm mẫu số chung” để hiểu cách lập trình AI thực hiện các bước giải quyết vấn đề. Tiết kiệm và bảo vệ nguồn nước: Từ tình huống lượng nước trong bình, giáo dục học sinh sử dụng nước vừa đủ, khóa vòi sau khi dùng và không làm bẩn nguồn nước.',
      },
      {
        week: '3',
        lessonName: 'Bài 7. Hỗn số',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D2.1: Liên hệ: Việc cập nhật thêm hỗn số vào kho kiến thức giúp học sinh (và cả hệ thống AI) xử lý các số liệu đo lường thực tế tốt hơn. Năng lực số 1.1.CB2b: Học sinh tra cứu một số thông tin thực tế có liên quan đến hỗn số để nhận biết cách dùng hỗn số trong đời sống.',
      },
      {
        week: '3–4',
        lessonName: 'Bài 8. Ôn tập hình học và đo lường',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.2: Trải nghiệm ứng dụng nhận diện hình dạng (như Google Lens): AI giúp phân loại đồ vật hình học dựa trên các đặc điểm đã học. Năng lực số 5.2.TC3b: Học sinh sử dụng thước đo hoặc công cụ hình học số để kiểm tra độ dài, góc và củng cố kiến thức đo lường.',
      },
      {
        week: '4',
        lessonName: 'Bài 9. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A3.1: Sử dụng Chatbot AI để tìm kiếm các bài toán đố vui về số tự nhiên và phân số, rèn luyện kỹ năng đặt câu hỏi cho máy. Năng lực số 2.1.CB2a: Học sinh trao đổi cách giải bài toán qua nhóm lớp hoặc nền tảng học tập trực tuyến để chia sẻ và hoàn thiện lời giải.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd2',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 7',
    totalPeriods: 12,
    chapterCode: 'TOAN5-CD2',
    chapterTitle: 'Chủ đề 2: Số thập phân (12 tiết)',
    topicTitle:
      'Bài 10: Khái niệm số thập phân (3 tiết); Bài 11: So sánh các số thập phân (2 tiết); Bài 12: Viết số đo đại lượng dưới dạng số thập phân (3 tiết); Bài 13: Làm tròn số thập phân (2 tiết); Bài 14: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A1.1, 5.B1.1, 5.A2.2, 5.A1.2, 5.D2.1), NLS (1.1.CB2a, 3.1.TC3a, 1.2.CB2a, 4.2.CB2a), BVMT và STEM Bài 2: Dụng cụ học số thập phân.',
    rawLessons: [
      {
        week: '5',
        lessonName: 'Bài 10. Khái niệm số thập phân',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A1.1: Nhận biết: Robot phẫu thuật cần độ chính xác đến hàng phần nghìn của số thập phân để đảm bảo an toàn tuyệt đối cho bệnh nhân. Năng lực số 1.1.CB2a: Học sinh tìm kiếm một số thông tin thực tế có dạng số thập phân để đọc, viết và nhận biết số thập phân.',
      },
      {
        week: '5',
        lessonName: 'Bài 11. So sánh các số thập phân',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.B1.1: Thảo luận: Nếu AI so sánh dữ liệu thiên lệch (chỉ ưu tiên một nhóm), kết quả sẽ không công bằng. AI cần tiêu chí so sánh minh bạch. Năng lực số 3.1.TC3a: Tạo một bảng so sánh số liệu thập phân trên phần mềm soạn thảo văn bản.',
      },
      {
        week: '6',
        lessonName: 'Bài 12. Viết số đo đại lượng dưới dạng số thập phân',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A2.2: Tìm hiểu cách AI dùng số thập phân để đo nồng độ ô nhiễm không khí (PM2.5) nhằm cảnh báo sức khỏe cho cộng đồng. BVMT: Khai thác số đo nồng độ bụi, chất lượng không khí hoặc lượng rác thải ở dạng số thập phân; giáo dục học sinh có ý thức bảo vệ môi trường sống.',
      },
      {
        week: '6',
        lessonName: 'Bài 13. Làm tròn số thập phân',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.2: Nhấn mạnh: AI có thể tự động làm tròn số liệu báo cáo, nhưng con người phải kiểm tra xem việc làm tròn đó có gây sai sót lớn không. Năng lực số 1.2.CB2a: Đánh giá độ tin cậy của các thông tin giá cả đã được làm tròn trên website bán hàng.',
      },
      {
        week: '7',
        lessonName: 'Bài 14. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2 (STEM: Bài 2. Dụng cụ học số thập phân)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D2.1: Ví dụ: Hệ thống AI dự báo giá cả thị trường sẽ chính xác hơn khi liên tục được cập nhật các số thập phân về giá trị thực tế hàng giờ. STEM: Bài 2. Dụng cụ học số thập phân. Năng lực số 4.2.CB2a: Tìm hiểu chính sách quyền riêng tư khi sử dụng các ứng dụng giải toán online.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd3',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 7 – Tuần 8',
    totalPeriods: 8,
    chapterCode: 'TOAN5-CD3',
    chapterTitle: 'Chủ đề 3: Một số đơn vị đo diện tích (8 tiết)',
    topicTitle:
      'Bài 15: Ki-lô-mét vuông. Héc-ta (2 tiết); Bài 16: Các đơn vị đo diện tích (2 tiết); Bài 17: Thực hành và trải nghiệm với một số đơn vị đo đại lượng (2 tiết); Bài 18: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A2.2, 5.A1.1, 5.C4.2, 5.D1.1), BVMT (diện tích rừng, vườn quốc gia, khuôn viên xanh), Tiết kiệm nước và ĐĐLS.',
    rawLessons: [
      {
        week: '7',
        lessonName: 'Bài 15. Ki-lô-mét vuông. Héc-ta',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A2.2: Tìm hiểu cách AI phân tích ảnh vệ tinh tính toán diện tích rừng (km²) bị mất để đưa ra cảnh báo cháy rừng kịp thời. BVMT: Dùng số liệu diện tích rừng, vườn quốc gia hoặc đất xanh để giáo dục học sinh ý thức bảo vệ tài nguyên thiên nhiên.',
      },
      {
        week: '7–8',
        lessonName: 'Bài 16. Các đơn vị đo diện tích',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: Robot nông nghiệp tích hợp AI tự động tính diện tích ruộng để phun thuốc trừ sâu chính xác đến từng cm², tránh lãng phí. BVMT: Tính diện tích vườn cây, bồn hoa, khuôn viên xanh; giáo dục học sinh trồng, chăm sóc cây và giữ gìn cảnh quan.',
      },
      {
        week: '8',
        lessonName: 'Bài 17. Thực hành và trải nghiệm với một số đơn vị đo đại lượng',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.2: Sử dụng ứng dụng thước đo điện tử có tích hợp AI trên điện thoại để đo kích thước các đồ vật thực tế trong lớp học. Tiết kiệm và bảo vệ nguồn nước: Khi thực hành đo đạc, vệ sinh lớp học hoặc chăm sóc cây, nhắc học sinh sử dụng nước hợp lí, không xả nước lãng phí.',
      },
      {
        week: '8',
        lessonName: 'Bài 18. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D1.1: HS thu thập số liệu diện tích nhà ở của các bạn trong nhóm để “huấn luyện” một sơ đồ tư duy về không gian sống của lớp. Đạo đức, lối sống: Qua bài toán diện tích nhà ở, khu sinh hoạt, giáo dục học sinh sống gọn gàng, sạch sẽ và biết giữ gìn không gian chung.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd4',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 9 – Tuần 12',
    totalPeriods: 16,
    chapterCode: 'TOAN5-CD4',
    chapterTitle: 'Chủ đề 4: Các phép tính với số thập phân (16 tiết)',
    topicTitle:
      'Bài 19: Phép cộng số thập phân (2 tiết); Bài 20: Phép trừ số thập phân (2 tiết); Bài 21: Phép nhân số thập phân (3 tiết); Bài 22: Phép chia số thập phân (4 tiết); Bài 23: Nhân, chia số thập phân với 10; 100; 1000;... hoặc với 0,1; 0,01; 0,001;... (2 tiết); Bài 24: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A1.1, 5.C4.1, 5.A3.1), NLS (1.3.CB2b, 2.1.CB2a, 3.4.CB2a, 3.4.CB1a, 5.2.CB2a) và Tiết kiệm nước.',
    rawLessons: [
      {
        week: '9',
        lessonName: 'Bài 19. Phép cộng số thập phân',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: AI xử lý việc cộng hàng triệu giao dịch ngân hàng mỗi giây để đảm bảo tài khoản của khách hàng luôn chính xác tuyệt đối. Năng lực số 1.3.CB2b: Nhận biết nơi lưu trữ tệp tin bảng tính quản lý chi tiêu cá nhân trong máy tính.',
      },
      {
        week: '9',
        lessonName: 'Bài 20. Phép trừ số thập phân',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: Ứng dụng AI quản lý kho: Tự động trừ số lượng hàng hóa (kg) khi có người mua để nhắc nhở nhân viên nhập hàng kịp thời. Năng lực số 2.1.CB2a: Chọn phương tiện giao tiếp số phù hợp để hỏi bạn cách thực hiện phép tính trừ.',
      },
      {
        week: '9–10',
        lessonName: 'Bài 21. Phép nhân số thập phân',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A1.1: AI tính toán quãng đường tàu vũ trụ dựa trên vận tốc và thời gian (số thập phân) để hạ cánh chính xác xuống các hành tinh. Năng lực số 3.4.CB2a: Xây dựng thuật toán từng bước để giải bài toán nhân quãng đường, vận tốc.',
      },
      {
        week: '10–11',
        lessonName: 'Bài 22. Phép chia số thập phân',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'AI 5.A1.1: Thảo luận: Xem video robot lắp ráp linh kiện, thảo luận về việc sai số 0,001 đơn vị trong phép chia có thể làm hỏng sản phẩm. Tiết kiệm và bảo vệ nguồn nước: Tạo tình huống chia lượng nước sử dụng trong ngày hoặc trong tuần để giáo dục học sinh giảm lãng phí nước trong sinh hoạt.',
      },
      {
        week: '11',
        lessonName: 'Bài 23. Nhân, chia số thập phân với 10; 100; 1000;... hoặc với 0,1; 0,01; 0,001;...',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.1: Nhận biết quy tắc dịch chuyển dấu phẩy tương tự như các “lệnh” trong lập trình AI để dịch chuyển dữ liệu nhanh chóng. Năng lực số 3.4.CB1a: Liệt kê các câu lệnh dịch chuyển dấu phẩy tương tự quy trình lập trình đơn giản.',
      },
      {
        week: '11–12',
        lessonName: 'Bài 24. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A3.1: Thực hành kiểm chứng kết quả phép tính số thập phân bằng cách hỏi Chatbot AI và đối chiếu với cách làm của mình. Năng lực số 5.2.CB2a: Lựa chọn các công cụ máy tính số phù hợp để kiểm tra kết quả bài làm.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd5',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 15',
    totalPeriods: 18,
    chapterCode: 'TOAN5-CD5',
    chapterTitle: 'Chủ đề 5: Một số hình phẳng. Chu vi và diện tích (18 tiết)',
    topicTitle:
      'Bài 25: Hình tam giác. Diện tích hình tam giác (4 tiết); Bài 26: Hình thang. Diện tích hình thang (4 tiết); Bài 27: Đường tròn. Chu vi và diện tích hình tròn (5 tiết); Bài 28: Thực hành đo, vẽ, lắp ghép, tạo hình (2 tiết); Bài 29: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.C4.2, 5.C4.1, 5.A1.1, 5.A2.1, 5.D2.1), NLS (3.4.CB2a, 3.1.CB2b, 2.2.CB1a), BVMT và STEM Bài 6: Thực hành trải nghiệm cùng bộ lắp ghép hình Tangram.',
    rawLessons: [
      {
        week: '12–13',
        lessonName: 'Bài 25. Hình tam giác. Diện tích hình tam giác',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'AI 5.C4.2: Sử dụng AutoDraw: HS vẽ phác thảo tam giác, AI sẽ nhận diện và gợi ý hình tam giác chuẩn để HS thực hành tính diện tích. BVMT: Tính diện tích bồn hoa, mảnh vườn hình tam giác; giáo dục học sinh yêu cây xanh, không hái hoa, bẻ cành.',
      },
      {
        week: '13',
        lessonName: 'Bài 26. Hình thang. Diện tích hình thang',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'AI 5.C4.1: HS lập luận logic: “Nếu tứ giác có 2 cạnh đáy song song Thì là hình thang”, áp dụng tư duy này vào lập trình robot. Năng lực số 3.4.CB2a: Viết chuỗi logic: “Nếu có 2 cạnh đáy song song Thì là hình thang”.',
      },
      {
        week: '13–14',
        lessonName: 'Bài 27. Đường tròn. Chu vi và diện tích hình tròn',
        subLessonName: 'Tiết 1 – Tiết 5',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'AI 5.A1.1: AI giúp thiết kế các ổ bi trong máy móc với độ tròn hoàn hảo để máy hoạt động êm ái, giảm thiểu tiếng ồn và hư hỏng. BVMT: Tính chu vi, diện tích bồn cây, hồ nước hoặc sân chơi hình tròn; giáo dục học sinh giữ gìn cảnh quan xanh - sạch - đẹp.',
      },
      {
        week: '15',
        lessonName: 'Bài 28. Thực hành đo, vẽ, lắp ghép, tạo hình',
        subLessonName: 'Tiết 1 – Tiết 2 (STEM: Bài 6. Thực hành trải nghiệm cùng bộ lắp ghép hình Tangram)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A2.1: Khẳng định: AI có thể gợi ý mẫu lắp ghép, nhưng sự khéo léo và sáng tạo để tạo ra mô hình độc bản là của con người. Năng lực số 3.1.CB2b: Quay video ngắn giới thiệu quy trình lắp ghép mô hình hình học của nhóm. STEM: Bài 6. Thực hành trải nghiệm cùng bộ lắp ghép hình Tangram.',
      },
      {
        week: '15',
        lessonName: 'Bài 29. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.D2.1: Khi HS học thêm nhiều loại hình mới, kho dữ liệu hình học của HS được cập nhật để giải các bài toán thiết kế phức tạp hơn. Năng lực số 2.2.CB1a: Thực hành chia sẻ ảnh chụp mô hình hình học lên Padlet để cả lớp cùng xem.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd6',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 16 – Tuần 18',
    totalPeriods: 17,
    chapterCode: 'TOAN5-CD6',
    chapterTitle: 'Chủ đề 6: Ôn tập học kì I (17 tiết)',
    topicTitle:
      'Bài 30: Ôn tập số thập phân (3 tiết); Bài 31: Ôn tập các phép tính với số thập phân (4 tiết); Bài 32: Ôn tập một số hình phẳng (2 tiết); Bài 33: Ôn tập diện tích, chu vi một số hình phẳng (3 tiết); Bài 34: Ôn tập đo lường (2 tiết); Bài 35: Ôn tập chung (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.D1.1, 5.A1.2, 5.C4.2, 5.A2.2, 5.A1.1, 5.D2.1), NLS (5.2.CB2a, 1.3.CB2a, 3.1.TC3a, 1.1.CB2b, 2.5.CB2a) và BVMT.',
    rawLessons: [
      {
        week: '16',
        lessonName: 'Bài 30. Ôn tập số thập phân',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.D1.1: HS đóng vai “người dán nhãn dữ liệu”: Phân loại các số thập phân vào các nhóm (nhóm > 1, nhóm < 1) để “dạy” máy học phân loại. Năng lực số 5.2.CB2a: Tham gia trò chơi ôn tập (Quizizz/Kahoot) để tự đánh giá năng lực về số thập phân.',
      },
      {
        week: '16–17',
        lessonName: 'Bài 31. Ôn tập các phép tính với số thập phân',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'AI 5.A1.2: Thảo luận: Nếu AI tính sai hóa đơn tiền điện, con người (nhân viên ngân hàng) phải phát hiện lỗi và chịu trách nhiệm xử lý. Năng lực số 1.3.CB2a: Thực hành nhập liệu và quản lý kết quả phép tính trong thư mục tệp tin số.',
      },
      {
        week: '17',
        lessonName: 'Bài 32. Ôn tập một số hình phẳng',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.2: Sử dụng Teachable Machine để dạy máy nhận diện và phân biệt giữa hình tam giác, hình thang và hình chữ nhật. Năng lực số 3.1.TC3a: Thiết kế sơ đồ tư duy (Mindmap) hệ thống hóa kiến thức các loại hình phẳng.',
      },
      {
        week: '17–18',
        lessonName: 'Bài 33. Ôn tập diện tích, chu vi một số hình phẳng',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A2.2: Ví dụ: AI giúp kiến trúc sư tính toán diện tích kính cần dùng cho tòa nhà xanh để tối ưu hóa ánh sáng và tiết kiệm năng lượng. BVMT: Tính diện tích kính, mái che hoặc khu cây xanh; liên hệ sử dụng vật liệu hợp lí, tiết kiệm năng lượng và bảo vệ môi trường.',
      },
      {
        week: '18',
        lessonName: 'Bài 34. Ôn tập đo lường',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: Nhận biết AI thay con người đo đạc trong các hầm mỏ sâu hoặc nơi có khí độc để đảm bảo an toàn cho các công nhân. Năng lực số 1.1.CB2b: Tìm kiếm và truy cập các website chuyển đổi đơn vị đo lường trực tuyến.',
      },
      {
        week: '18',
        lessonName: 'Bài 35. Ôn tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.D2.1: Tổng kết: Kiến thức toán học học kì I là “dữ liệu nguồn” giúp HS thông minh hơn và sẵn sàng cho các bài toán phức tạp hơn ở kì II. Năng lực số 2.5.CB2a: Tuân thủ các quy tắc ứng xử văn minh khi bình luận bài làm của bạn trên mạng.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd7',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 22',
    totalPeriods: 16,
    chapterCode: 'TOAN5-CD7',
    chapterTitle: 'Chủ đề 7: Tỉ số và các bài toán liên quan (16 tiết)',
    topicTitle:
      'Bài 36: Tỉ số. Tỉ số phần trăm (2 tiết); Bài 37: Tỉ lệ bản đồ và ứng dụng (2 tiết); Bài 38: Tìm hai số khi biết tổng và tỉ số của hai số đó (2 tiết); Bài 39: Tìm hai số khi biết hiệu và tỉ số của hai số đó (2 tiết); Bài 40: Tìm tỉ số phần trăm của hai số (2 tiết); Bài 41: Tìm giá trị phần trăm của một số (2 tiết); Bài 42: Máy tính cầm tay (1 tiết); Bài 43: Thực hành và trải nghiệm sử dụng máy tính cầm tay (1 tiết); Bài 44: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.B1.1, 5.A2.2, 5.C4.1, 5.D1.1, 5.A3.1, 5.B3.1), QPAN (bản đồ Việt Nam và chủ quyền lãnh thổ), BVMT, Tiết kiệm nước, ĐĐLS, STEM Bài 12: Sử dụng máy tính cầm tay và NLS (2.5.CB2b).',
    rawLessons: [
      {
        week: '19',
        lessonName: 'Bài 36. Tỉ số. Tỉ số phần trăm',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.B1.1: Thảo luận: Nếu dữ liệu huấn luyện AI chỉ lấy từ một nhóm người, tỉ số phần trăm phản hồi sẽ không công bằng cho các nhóm khác. BVMT: Từ tỉ số, tỉ số phần trăm của xe điện, xe xăng hoặc rác tái chế, giáo dục học sinh lựa chọn hành vi thân thiện với môi trường.',
      },
      {
        week: '19',
        lessonName: 'Bài 37. Tỉ lệ bản đồ và ứng dụng',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A2.2: Tìm hiểu cách AI trên Google Maps tính toán tỉ lệ khoảng cách và dự báo thời gian di chuyển chính xác dựa trên tình trạng giao thông. QPAN: Khi đọc bản đồ và tính khoảng cách, giáo dục học sinh hiểu ý nghĩa của bản đồ Việt Nam, yêu quê hương và có ý thức bảo vệ chủ quyền lãnh thổ.',
      },
      {
        week: '19–20',
        lessonName: 'Bài 38. Tìm hai số khi biết tổng và tỉ số của hai số đó',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.1: HS mô phỏng quy trình giải toán theo các bước (thuật toán) mà AI thực hiện để tìm ra đáp án nhanh và chính xác nhất. Đạo đức, lối sống: Qua bài toán góp sách, chia phần, giáo dục học sinh tinh thần công bằng, chia sẻ và hợp tác trong tập thể.',
      },
      {
        week: '20',
        lessonName: 'Bài 39. Tìm hai số khi biết hiệu và tỉ số của hai số đó',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D1.1: Liên hệ: Để giải toán, AI cần “dữ liệu đầu vào” là Hiệu và Tỉ số, tương tự như việc HS tóm tắt đề bài trước khi giải. BVMT: Dùng tình huống phân loại rác, chăm sóc cây trồng hoặc vật nuôi để giáo dục học sinh ý thức bảo vệ môi trường sống.',
      },
      {
        week: '20–21',
        lessonName: 'Bài 40. Tìm tỉ số phần trăm của hai số',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A3.1: Sử dụng các ứng dụng học tập tích hợp AI (adaptive learning) để tự luyện tập các bài toán về tỉ số phần trăm theo mức độ cá nhân. Tiết kiệm và bảo vệ nguồn nước: Khai thác các bài toán về tỉ lệ nước tiết kiệm được hoặc tỉ lệ tham gia vệ sinh trường lớp.',
      },
      {
        week: '21',
        lessonName: 'Bài 41. Tìm giá trị phần trăm của một số',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A2.2: Ví dụ: AI tính phần trăm lượng pin còn lại hoặc phần trăm hoàn thành nhiệm vụ của robot thám hiểm để thông báo cho con người. Tiết kiệm và bảo vệ nguồn nước: Tính lượng nước tiết kiệm được khi giảm 10%, 15% hoặc 20% lượng nước sử dụng hằng ngày.',
      },
      {
        week: '21',
        lessonName: 'Bài 42. Máy tính cầm tay',
        subLessonName: 'Tiết 1 (STEM: Bài 12. Sử dụng máy tính cầm tay)',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Đạo đức, lối sống: Giáo dục học sinh sử dụng máy tính cầm tay đúng mục đích, trung thực trong học tập và không phụ thuộc hoàn toàn vào công cụ. STEM: Bài 12. Sử dụng máy tính cầm tay.',
      },
      {
        week: '21',
        lessonName: 'Bài 43. Thực hành và trải nghiệm sử dụng máy tính cầm tay',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Đạo đức, lối sống: Học sinh dùng máy tính để kiểm tra kết quả, biết tự chịu trách nhiệm với bài làm và không sao chép máy móc.',
      },
      {
        week: '22',
        lessonName: 'Bài 44. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.B3.1: Khi dùng máy tính/AI để tính tỉ số, HS cần hiểu lý do máy ra kết quả đó (dựa trên thuật toán nào) để đảm bảo tính minh bạch. Năng lực số 2.5.CB2b: Chọn chiến lược giao tiếp phù hợp khi thảo luận bài tập trong nhóm học tập số.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd8',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 22 – Tuần 23',
    totalPeriods: 7,
    chapterCode: 'TOAN5-CD8',
    chapterTitle: 'Chủ đề 8: Thể tích. Đơn vị đo thể tích (7 tiết)',
    topicTitle:
      'Bài 45: Thể tích của một hình (1 tiết); Bài 46: Xăng-ti-mét khối. Đề-xi-mét khối (2 tiết); Bài 47: Mét khối (2 tiết); Bài 48: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Tích hợp Tiết kiệm và bảo vệ nguồn nước (thể tích nước trong bể, điều tiết nước sạch), AI (5.A1.1, 5.D2.1) và NLS (1.3.CB2a, 2.1.CB2a).',
    rawLessons: [
      {
        week: '22',
        lessonName: 'Bài 45. Thể tích của một hình',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tiết kiệm và bảo vệ nguồn nước: Liên hệ thể tích nước trong bể, chậu, bình; giáo dục học sinh không xả nước lãng phí và biết bảo quản nước sạch.',
      },
      {
        week: '22',
        lessonName: 'Bài 46. Xăng-ti-mét khối. Đề-xi-mét khối',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: AI tính toán thể tích linh kiện điện tử siêu nhỏ (cm³) để robot có thể lắp ráp điện thoại thông minh một cách chính xác tuyệt đối. Năng lực số 1.3.CB2a: Sắp xếp dữ liệu các vật thể theo đơn vị thể tích vào thư mục có cấu trúc.',
      },
      {
        week: '23',
        lessonName: 'Bài 47. Mét khối',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: AI hỗ trợ tính thể tích nước sạch cần cung cấp cho thành phố (m³) mỗi ngày dựa trên dữ liệu tiêu thụ thực tế để điều tiết hợp lý. Tiết kiệm và bảo vệ nguồn nước: Tính thể tích bể chứa nước, lượng nước sinh hoạt; nhắc học sinh bảo vệ nguồn nước sạch trong gia đình và nhà trường.',
      },
      {
        week: '23',
        lessonName: 'Bài 48. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D2.1: Ví dụ: AI ước lượng thể tích thức ăn cho vật nuôi chính xác hơn khi có thêm dữ liệu cập nhật về cân nặng và độ tuổi của con vật. Năng lực số 2.1.CB2a: Sử dụng phòng họp trực tuyến (Google Meet) để trao đổi bài giải về thể tích.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd9',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 26',
    totalPeriods: 15,
    chapterCode: 'TOAN5-CD9',
    chapterTitle: 'Chủ đề 9: Diện tích và thể tích của một số hình khối (15 tiết)',
    topicTitle:
      'Bài 49: Hình khai triển của hình lập phương, hình hộp chữ nhật và hình trụ (2 tiết); Bài 50: Diện tích xung quanh và diện tích toàn phần của hình hộp chữ nhật (3 tiết); Bài 51: Diện tích xung quanh và diện tích toàn phần của hình lập phương (2 tiết); Bài 52: Thể tích hình hộp chữ nhật (2 tiết); Bài 53: Thể tích hình lập phương (2 tiết); Bài 54: Thực hành tính toán và ước lượng thể tích một số hình khối (1 tiết); Bài 55: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.C4.2, 5.A2.2, 5.D1.1, 5.A1.1, 5.A1.2), NLS (3.1.CB2a, 1.3.CB2a), BVMT, Tiết kiệm nước và STEM Bài 14: Ngôi nhà nhỏ, tiện ích.',
    rawLessons: [
      {
        week: '23–24',
        lessonName: 'Bài 49. Hình khai triển của hình lập phương, hình hộp chữ nhật và hình trụ',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.2: Sử dụng phần mềm mô phỏng 3D để xem AI tự động tạo ra các hình khai triển từ bản vẽ phẳng của các loại bao bì sản phẩm. Năng lực số 3.1.CB2a: Sử dụng phần mềm vẽ 3D đơn giản để quan sát hình khai triển của khối hộp.',
      },
      {
        week: '24',
        lessonName: 'Bài 50. Diện tích xung quanh và diện tích toàn phần của hình hộp chữ nhật',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A2.2: AI giúp tính diện tích bề mặt tấm pin mặt trời cần lắp đặt để tối ưu hóa việc thu nhận năng lượng cho ngôi nhà thông minh. BVMT: Tính diện tích giấy bọc hộp hoặc vật liệu làm hộp; giáo dục học sinh tiết kiệm giấy, tái sử dụng bao bì và giảm rác thải.',
      },
      {
        week: '24–25',
        lessonName: 'Bài 51. Diện tích xung quanh và diện tích toàn phần của hình lập phương',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D1.1: HS tạo “bộ dữ liệu” bằng cách liệt kê diện tích 6 mặt bằng nhau để máy hiểu cấu trúc của hình lập phương. Năng lực số 3.1.CB2a: Tạo và chỉnh sửa hình ảnh khai triển 6 mặt của hình lập phương trên máy tính.',
      },
      {
        week: '25',
        lessonName: 'Bài 52. Thể tích hình hộp chữ nhật',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: AI tính thể tích nhiên liệu cần thiết cho máy bay dựa trên kích thước bồn chứa để đảm bảo an toàn cho các chuyến bay dài. Tiết kiệm và bảo vệ nguồn nước: Tính thể tích bể nước, thùng chứa nước; giáo dục học sinh sử dụng nước tiết kiệm và giữ gìn nguồn nước sạch.',
      },
      {
        week: '25',
        lessonName: 'Bài 53. Thể tích hình lập phương',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: Tìm hiểu cách AI sắp xếp các kiện hàng hình lập phương vào thùng xe tải để tận dụng tối đa thể tích không gian chứa hàng. Năng lực số 1.3.CB2a: Tổ chức bộ dữ liệu thể tích các khối rubik khác nhau vào bảng tính số.',
      },
      {
        week: '25',
        lessonName: 'Bài 54. Thực hành tính toán và ước lượng thể tích một số hình khối',
        subLessonName: 'Tiết 1 (STEM: Bài 14. Ngôi nhà nhỏ, tiện ích)',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'AI 5.C4.2: Trải nghiệm ứng dụng đo thể tích thực tế thông qua camera điện thoại có tích hợp công nghệ AI nhận diện không gian. STEM: Bài 14. Ngôi nhà nhỏ, tiện ích.',
      },
      {
        week: '26',
        lessonName: 'Bài 55. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A1.2: Khẳng định: Nếu AI tính sai diện tích xây dựng, kỹ sư con người phải là người kiểm tra lại bản vẽ và chịu trách nhiệm pháp lý. BVMT: Luyện tập bằng các bài toán về thùng chứa, bể nước, hộp tái chế; củng cố ý thức tiết kiệm vật liệu và bảo vệ môi trường.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd10',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 26 – Tuần 29',
    totalPeriods: 17,
    chapterCode: 'TOAN5-CD10',
    chapterTitle: 'Chủ đề 10: Số đo thời gian. Vận tốc. Các bài toán liên quan đến chuyển động đều (17 tiết)',
    topicTitle:
      'Bài 56: Các đơn vị đo thời gian (2 tiết); Bài 57: Cộng, trừ số đo thời gian (2 tiết); Bài 58: Nhân, chia số đo thời gian với một số (3 tiết); Bài 59: Vận tốc của một chuyển động đều (2 tiết); Bài 60: Quãng đường, thời gian của một chuyển động đều (3 tiết); Bài 61: Thực hành tính toán và ước lượng về vận tốc, quãng đường, thời gian trong chuyển động đều (2 tiết); Bài 62: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A1.1, 5.A3.1, 5.A2.2, 5.A1.2, 5.C4.2, 5.D2.1), NLS (1.1.CB2b, 5.2.CB2a, 3.1.CB2a, 1.2.CB2a) và ĐĐLS (chấp hành luật giao thông, đi đúng tốc độ, tình yêu quê hương đất nước).',
    rawLessons: [
      {
        week: '26–27',
        lessonName: 'Bài 56. Các đơn vị đo thời gian',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.1: Nhận biết AI giúp điều khiển tín hiệu đèn giao thông theo thời gian thực (từng giây) để giảm ùn tắc tại các ngã tư. Năng lực số 1.1.CB2b: Truy cập dữ liệu giờ bay, giờ tàu chạy trên các ứng dụng vận tải trực tuyến.',
      },
      {
        week: '27',
        lessonName: 'Bài 57. Cộng, trừ số đo thời gian',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A3.1: Sử dụng trợ lý ảo (Siri, Google) để đặt lịch hẹn và yêu cầu máy tính khoảng thời gian còn lại đến giờ vào lớp. Năng lực số 5.2.CB2a: Sử dụng ứng dụng đồng hồ bấm giờ và lịch kỹ thuật số để quản lý thời gian.',
      },
      {
        week: '27–28',
        lessonName: 'Bài 58. Nhân, chia số đo thời gian với một số',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A2.2: AI tính toán thời gian quay của các turbine gió để sản xuất điện năng hiệu quả nhất dựa trên vận tốc gió thay đổi liên tục. Năng lực số 3.1.CB2a: Thiết kế thời gian biểu cá nhân chi tiết bằng ứng dụng Google Calendar.',
      },
      {
        week: '28',
        lessonName: 'Bài 59. Vận tốc của một chuyển động đều',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.2: Phân tích xe tự lái: AI tính vận tốc để tránh vật cản, nhưng con người phải thiết lập các quy tắc an toàn và đạo đức. Đạo đức, lối sống: Qua bài toán vận tốc, giáo dục học sinh chấp hành luật giao thông, đi đúng tốc độ và bảo đảm an toàn cho bản thân, cộng đồng.',
      },
      {
        week: '28–29',
        lessonName: 'Bài 60. Quãng đường, thời gian của một chuyển động đều',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A1.1: AI trên các ứng dụng giao hàng tính toán quãng đường ngắn nhất và thời gian dự kiến để shipper giao hàng đến khách nhanh nhất. Lý tưởng cách mạng, đạo đức, lối sống: Tính quãng đường đến di tích lịch sử, cột mốc hoặc địa danh Việt Nam; giáo dục tình yêu quê hương, đất nước.',
      },
      {
        week: '29',
        lessonName: 'Bài 61. Thực hành tính toán và ước lượng về vận tốc, quãng đường, thời gian trong chuyển động đều',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.C4.2: Sử dụng Chatbot AI để tạo ra các kịch bản chuyển động khác nhau và HS thực hành tính toán lại các đại lượng dựa trên dữ liệu đó. Năng lực số 3.1.CB2a: Tạo một bảng nhật ký hành trình số ghi lại các thông số s, v, t sau chuyến đi.',
      },
      {
        week: '29–30',
        lessonName: 'Bài 62. Luyện tập chung',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.D2.1: Ví dụ: AI dự báo thời gian về đích của vận động viên chính xác hơn nhờ cập nhật dữ liệu vận tốc qua từng chặng đua. Năng lực số 1.2.CB2a: So sánh và đánh giá độ tin cậy của dữ liệu thời gian về đích giữa các trang báo.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd11',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 31',
    totalPeriods: 7,
    chapterCode: 'TOAN5-CD11',
    chapterTitle: 'Chủ đề 11: Một số yếu tố thống kê và xác suất (7 tiết)',
    topicTitle:
      'Bài 63: Thu thập, phân loại, sắp xếp các số liệu (1 tiết); Bài 64: Biểu đồ hình quạt tròn (2 tiết); Bài 65: Tỉ số của số lần lặp một sự kiện so với tổng số lần thực hiện (1 tiết); Bài 66: Thực hành và trải nghiệm thu thập, phân tích, biểu diễn các số liệu thống kê (2 tiết); Bài 67: Luyện tập chung (1 tiết)',
    adjustedContentSummary:
      'Tích hợp ĐĐLS (trung thực khi thu thập số liệu), AI (5.A2.2, 5.B3.1, 5.D1.1), BVMT (tỉ lệ rác tái chế, năng lượng sạch) và NLS (3.1.CB2a).',
    rawLessons: [
      {
        week: '30',
        lessonName: 'Bài 63. Thu thập, phân loại, sắp xếp các số liệu',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Đạo đức, lối sống: Khi thu thập số liệu, giáo dục học sinh ghi chép trung thực, tôn trọng dữ liệu thực tế và có trách nhiệm với kết quả trình bày.',
      },
      {
        week: '30',
        lessonName: 'Bài 64. Biểu đồ hình quạt tròn',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A2.2: Xem biểu đồ AI phân tích tỉ lệ sử dụng năng lượng sạch trên thế giới để hướng tới mục tiêu bảo vệ môi trường toàn cầu. BVMT: Biểu diễn tỉ lệ rác tái chế, rác hữu cơ hoặc rác khó phân hủy; giáo dục học sinh giảm rác thải nhựa.',
      },
      {
        week: '30',
        lessonName: 'Bài 65. Tỉ số của số lần lặp một sự kiện so với tổng số lần thực hiện',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'AI 5.B3.1: Thử nghiệm tung đồng xu và so sánh với kết quả dự đoán của AI để hiểu máy dựa trên cơ sở xác suất nào để ra quyết định.',
      },
      {
        week: '31',
        lessonName: 'Bài 66. Thực hành và trải nghiệm thu thập, phân tích, biểu diễn các số liệu thống kê',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D1.1: HS đóng vai “Kỹ sư dữ liệu”: Thu thập và sắp xếp dữ liệu rác thải trong trường để AI học cách nhận diện loại rác tái chế được. BVMT: Khảo sát số cây xanh, số chai nhựa hoặc lượng nước dùng; giáo dục học sinh biết phân tích số liệu để hành động vì môi trường.',
      },
      {
        week: '31',
        lessonName: 'Bài 67. Luyện tập chung',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Năng lực số 3.1.CB2a: Thiết kế poster (Canva) biểu diễn kết quả phân tích số liệu rác thải của lớp.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-toan-cd12',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 31 – Tuần 35',
    totalPeriods: 23,
    chapterCode: 'TOAN5-CD12',
    chapterTitle: 'Chủ đề 12: Ôn tập cuối năm (23 tiết)',
    topicTitle:
      'Bài 68: Ôn tập số tự nhiên, phân số, số thập phân (3 tiết); Bài 69: Ôn tập các phép tính với số tự nhiên, phân số, số thập phân (4 tiết); Bài 70: Ôn tập tỉ số, tỉ số phần trăm (2 tiết); Bài 71: Ôn tập hình học (4 tiết); Bài 72: Ôn tập đo lường (2 tiết); Bài 73: Ôn tập toán chuyển động đều (2 tiết); Bài 74: Ôn tập một số yếu tố thống kê và xác suất (2 tiết); Bài 75: Ôn tập chung (4 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A2.1, 5.A1.1, 5.B1.1, 5.C4.2, 5.A2.2, 5.A1.2, 5.D2.1), NLS (5.2.CB2a, 1.3.CB2a), Tiết kiệm nước, BVMT và ĐĐLS.',
    rawLessons: [
      {
        week: '31–32',
        lessonName: 'Bài 68. Ôn tập số tự nhiên, phân số, số thập phân',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'AI 5.A2.1: Ôn tập giúp con người củng cố tư duy bền vững, điều mà AI (chỉ làm theo dữ liệu có sẵn) không thể tự thay thế được. Năng lực số 5.2.CB2a: Thực hiện bài tập ôn tập qua trò chơi Kahoot để rèn luyện phản xạ tính toán.',
      },
      {
        week: '32',
        lessonName: 'Bài 69. Ôn tập các phép tính với số tự nhiên, phân số, số thập phân',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'AI 5.A1.1: Khẳng định AI là công cụ hỗ trợ tính toán tuyệt vời, giúp con người giải phóng khỏi những phép tính lặp lại nhàm chán. Năng lực số 1.3.CB2a: Tải bài làm lên không gian lưu trữ chung (Google Drive) để giáo viên chấm điểm.',
      },
      {
        week: '33',
        lessonName: 'Bài 70. Ôn tập tỉ số, tỉ số phần trăm',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.B1.1: Thảo luận về đạo đức AI: Đảm bảo tỉ lệ phần trăm hỗ trợ của AI phải công bằng cho mọi vùng miền, dân tộc khác nhau. Tiết kiệm và bảo vệ nguồn nước: Ôn tập bằng các bài toán về tỉ lệ nước tiết kiệm, tỉ lệ rác được phân loại hoặc tỉ lệ học sinh tham gia hoạt động xanh.',
      },
      {
        week: '33–34',
        lessonName: 'Bài 71. Ôn tập hình học',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'AI 5.C4.2: Tìm hiểu cách AI phục dựng lại các hình khối kiến trúc cổ (như tháp Chàm) từ các mảnh vỡ và số liệu hình học còn sót lại. BVMT: Dùng các bài toán về diện tích vườn trường, bồn hoa hoặc khu vui chơi xanh để giáo dục học sinh giữ gìn cảnh quan.',
      },
      {
        week: '34',
        lessonName: 'Bài 72. Ôn tập đo lường',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A2.2: AI hỗ trợ đo lường mực nước biển dâng để cảnh báo sớm về biến đổi khí hậu trên toàn cầu thông qua các trạm quan trắc. Tiết kiệm và bảo vệ nguồn nước: Ôn đơn vị đo dung tích, thể tích bằng các tình huống về lượng nước sinh hoạt và nước tưới cây; nhắc học sinh dùng nước hợp lí.',
      },
      {
        week: '34',
        lessonName: 'Bài 73. Ôn tập toán chuyển động đều',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.A1.2: Nhấn mạnh: Xe tự lái dùng toán chuyển động, nhưng con người phải chịu trách nhiệm cuối cùng nếu có sự cố xảy ra. Đạo đức, lối sống: Qua bài toán chuyển động đều, giáo dục học sinh tuân thủ luật giao thông, đi học đúng giờ và có trách nhiệm khi tham gia giao thông.',
      },
      {
        week: '35',
        lessonName: 'Bài 74. Ôn tập một số yếu tố thống kê và xác suất',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'AI 5.D2.1: Tổng kết: Càng có nhiều dữ liệu thống kê chính xác, các hệ thống AI càng phục vụ con người tốt hơn và thông minh hơn. Đạo đức, lối sống: Khi đọc bảng số liệu, biểu đồ và xác suất, giáo dục học sinh trung thực khi xử lí dữ liệu, không làm sai lệch kết quả.',
      },
      {
        week: '35',
        lessonName: 'Bài 75. Ôn tập chung',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'AI 5.A2.1: Khép lại chương trình: AI dù thông minh đến đâu vẫn chỉ là công cụ, trí tuệ và tấm lòng nhân văn của con người mới là yếu tố quyết định. Lý tưởng cách mạng, đạo đức, lối sống: Chọn bài toán tổng hợp về địa danh Việt Nam, phong trào tiết kiệm hoặc hoạt động cộng đồng; giáo dục học sinh trách nhiệm, chăm học và trung thực.',
      },
    ],
  }),
];
