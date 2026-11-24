import {
  CognitiveLevelCode,
  CurriculumLessonItem,
  CurriculumTopic,
  EducationLevelId,
} from '../types/domain';

export const NDA_G4_SOURCE_DOC =
  'KHGD Khối lớp 4 – Tổ 4, 5 Trường TH&THCS Nguyễn Đình Anh (Đan Điền, ngày 28/8/2026)';

export function extractIntegrationTags(text: string): string[] {
  const tags: string[] = [];
  if (/NLS|năng lực số|\d\.\d\s*\.?\s*(?:CB|TC)\d[a-d]/i.test(text)) tags.push('NLS');
  if (/\bAI\b|[3-9]\.[A-D]\d\.(?:\d|MR\d)/i.test(text)) tags.push('AI');
  if (/BĐKH|PCTT|biến đổi khí hậu|thiên tai/i.test(text)) tags.push('BĐKH & PCTT');
  if (/QCN|quyền con người/i.test(text)) tags.push('QCN');
  if (/BVMT|môi trường/i.test(text)) tags.push('BVMT');
  if (/nguồn nước/i.test(text)) tags.push('Tiết kiệm nước');
  if (/QPAN|ANQP/i.test(text)) tags.push('QPAN');
  if (/ATGT/i.test(text)) tags.push('ATGT');
  if (/KNS|kĩ năng/i.test(text)) tags.push('KNS');
  if (/STEM/i.test(text)) tags.push('STEM');
  if (/TTHCM|Bác Hồ/i.test(text)) tags.push('TTHCM');
  if (/GDĐP/i.test(text)) tags.push('GDĐP');
  if (/lý tưởng cách mạng|đạo đức, lối sống/i.test(text)) tags.push('ĐĐLS');
  if (/sức khỏe|tai nạn thương tích/i.test(text)) tags.push('GDSK');
  return tags;
}

export function buildGrade4Topic(params: {
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

  // Group by lessonName so each distinct Bài học generates a clear YCCĐ entry
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
        : `Thực hiện đầy đủ yêu cầu cần đạt của bài học "${grp.lessonName}" theo chương trình GDPT 2018 (Bộ sách Kết nối tri thức với cuộc sống).`;
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
    grade: 4,
    subject: params.subject,
    semester: params.semester,
    weekRange: params.weekRange,
    totalPeriods: params.totalPeriods,
    durationText: `${params.totalPeriods} tiết (${params.weekRange})`,
    adjustedContentSummary: params.adjustedContentSummary,
    sourceDocument: NDA_G4_SOURCE_DOC,
    chapterCode: params.chapterCode,
    chapterTitle: params.chapterTitle,
    topicTitle: params.topicTitle,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1. MÔN TIẾNG VIỆT LỚP 4 (35 TUẦN - 245 TIẾT: HKI 126 TIẾT, HKII 119 TIẾT)
// ============================================================================
export const GRADE4_TIENG_VIET_TOPICS: CurriculumTopic[] = [
  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 4',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ1',
    chapterTitle: 'Chủ điểm 1: Mỗi người một vẻ',
    topicTitle:
      'Bài 1: Điều kì diệu (3 tiết); Bài 2: Thi nhạc (4 tiết); Bài 3: Anh em sinh đôi (3 tiết); Bài 4: Công chúa và người dẫn chuyện (4 tiết); Bài 5: Thằn lằn xanh và tắc kè (3 tiết); Bài 6: Nghệ sĩ trống (4 tiết); Bài 7: Những bức chân dung (3 tiết); Bài 8: Đò ngang (4 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản truyện, thơ về nét riêng của mỗi người; LT&C: Danh từ, danh từ chung, danh từ riêng, quy tắc viết tên cơ quan tổ chức; Viết đoạn văn nêu ý kiến, báo cáo thảo luận nhóm; Tích hợp QCN, NLS (1.1, 1.2, 2.3, 3.2, 4.1, 5.2), AI (4.A1.1, 4.A1.2, 4.B2.1), BVMT, ATGT, ĐĐLS.',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Điều kì diệu (3 tiết)',
        subLessonName: 'Đọc: Điều kì diệu',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết mỗi người có đặc điểm, khả năng và giá trị riêng; biết tôn trọng sự khác biệt, không trêu chọc ngoại hình, giọng nói, sở thích của bạn.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS biết trao đổi ý kiến lịch sự khi làm việc nhóm; nếu chia sẻ thông tin trên công cụ số của lớp thì chỉ chia sẻ điều phù hợp, không công khai thông tin riêng tư.\n- Tích hợp AI (4.A1.1): HS nhận biết AI có thể hỗ trợ gợi ý câu hỏi hoặc phân nhóm ý kiến, nhưng cảm xúc, nhận xét về bạn bè cần xuất phát từ sự quan sát và suy nghĩ thật của con người.',
      },
      {
        week: '1',
        lessonName: 'Bài 1: Điều kì diệu (3 tiết)',
        subLessonName: 'Luyện từ và câu: Danh từ',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp QCN: HS hiểu quyền được lắng nghe, được bày tỏ ý kiến; biết dùng lời nói lịch sự khi nêu nhận xét về bản thân và người khác.\n- Tích hợp NLS 5.2.CB2a: HS biết sử dụng bảng phân loại từ đơn giản do GV trình chiếu để sắp xếp danh từ theo nhóm.\n- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý danh sách từ nhưng người học phải tự đọc, tự phân loại và kiểm chứng với kiến thức đã học.',
      },
      {
        week: '1',
        lessonName: 'Bài 1: Điều kì diệu (3 tiết)',
        subLessonName: 'Viết: Tìm hiểu đoạn văn và câu chủ đề',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 3.2.CB2a, 5.2.CB2a: HS biết quan sát bảng/sơ đồ cấu tạo đoạn văn do GV trình chiếu, biết dùng công cụ số đơn giản để sắp xếp ý chính và câu chủ đề.\n- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý câu chủ đề, nhưng người học phải đọc đoạn văn, kiểm tra ý nghĩa và tự chỉnh sửa cho phù hợp.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Thi nhạc (4 tiết)',
        subLessonName: 'Đọc: Thi nhạc',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS quan sát/nghe âm thanh, hình ảnh về các con vật từ nguồn GV chọn lọc; biết không tự ý tìm, mở video lạ khi chưa có hướng dẫn.\n- Tích hợp AI (4.A1.1): HS nhận biết AI có thể hỗ trợ nhận diện âm thanh hoặc gợi ý hình ảnh minh họa, nhưng cần con người kiểm tra và sử dụng phù hợp.\n- Tích hợp QCN: HS biết tôn trọng đặc điểm và giá trị riêng của bản thân, bạn bè; không chê bai năng lực hoặc sở thích của bạn.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Thi nhạc (4 tiết)',
        subLessonName: 'Viết: Tìm hiểu cách viết đoạn văn nêu ý kiến',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 3.2.CB2a, 5.2.CB2a: HS biết quan sát sơ đồ cấu trúc đoạn văn trên màn hình và sử dụng phiếu/bảng số đơn giản để sắp xếp ý kiến, lí do, kết đoạn.\n- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý lí do hoặc dàn ý, nhưng HS phải tự đọc câu chuyện, tự chọn lí do và viết bằng lời của mình.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Thi nhạc (4 tiết)',
        subLessonName: 'Nói và nghe: Tôi và bạn',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp QCN: HS biết tôn trọng bạn bè, lắng nghe khi bạn trình bày; có thái độ hợp tác, không chê bai năng lực hoặc sở thích của bạn.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS biết chia sẻ thông tin phù hợp về bản thân trên môi trường số; không công khai địa chỉ, số điện thoại, mật khẩu, hình ảnh riêng tư khi chưa được phép.\n- Tích hợp AI (4.B2.1): HS nhận biết khi dùng công cụ số/AI để gợi ý nội dung giới thiệu, cần bảo vệ thông tin cá nhân và kiểm tra lại ngôn ngữ cho lịch sự, đúng sự thật.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Anh em sinh đôi (3 tiết)',
        subLessonName: 'Đọc: Anh em sinh đôi',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): HS nhận biết AI có thể hỗ trợ phát hiện điểm giống, điểm khác trong hình ảnh nhưng cần con người kiểm chứng, nhận xét bằng thái độ tôn trọng, không gắn nhãn hoặc trêu chọc bạn.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Anh em sinh đôi (3 tiết)',
        subLessonName: 'Luyện từ và câu: Danh từ chung, danh từ riêng',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS biết tra cứu, đối chiếu tên người, tên địa danh trên nguồn tin cậy để viết hoa đúng danh từ riêng; không sao chép thông tin từ nguồn không rõ.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Anh em sinh đôi (3 tiết)',
        subLessonName: 'Viết: Tìm ý cho đoạn văn nêu ý kiến',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): GV minh họa cách ChatGPT/Gemini có thể gợi ý câu hỏi tìm ý; HS biết chọn lọc, bổ sung dẫn chứng, tự diễn đạt bằng lời của mình, không sao chép máy móc.',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Công chúa và người dẫn chuyện (4 tiết)',
        subLessonName: 'Đọc: Công chúa và người dẫn chuyện',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết trẻ em có quyền tham gia, quyền bày tỏ ý kiến trong hoạt động tập thể; biết tôn trọng vai trò của từng thành viên khi đọc, diễn hoặc kể chuyện.\n- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý cách tìm chi tiết, phân tích nhân vật nhưng cần đối chiếu với văn bản, tự chọn dẫn chứng và tự diễn đạt ý kiến.',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Công chúa và người dẫn chuyện (4 tiết)',
        subLessonName: 'Viết: Viết đoạn văn nêu ý kiến',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 3.2.CB2a, 5.2.CB2a: HS biết dùng bảng tiêu chí/công cụ soạn thảo đơn giản để đọc soát lỗi, chỉnh sửa đoạn văn; không công khai thông tin cá nhân khi chia sẻ bài viết trên môi trường số.',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Công chúa và người dẫn chuyện (4 tiết)',
        subLessonName: 'Đọc mở rộng',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm đọc câu chuyện từ nguồn GV giới thiệu, biết ghi tên truyện, tác giả, nguồn đọc; chọn lọc nội dung phù hợp lứa tuổi và không chia sẻ thông tin chưa kiểm chứng.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Thằn lằn xanh và tắc kè (3 tiết)',
        subLessonName: 'Đọc: Thằn lằn xanh và tắc kè',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp BVMT: HS biết yêu quý các loài vật nhỏ trong tự nhiên; có ý thức bảo vệ cây xanh, không phá hoại nơi ở của các loài vật, giữ gìn cân bằng sinh thái.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Thằn lằn xanh và tắc kè (3 tiết)',
        subLessonName: 'Luyện từ và câu: Luyện tập về danh từ',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS biết tra cứu hoặc quan sát thông tin về hiện tượng tự nhiên trên nguồn GV cung cấp; biết chọn từ khóa đơn giản và đối chiếu kết quả trước khi sử dụng.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Thằn lằn xanh và tắc kè (3 tiết)',
        subLessonName: 'Viết: Trả bài viết đoạn văn nêu ý kiến',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS biết AI có thể hỗ trợ gợi ý cách sửa câu, thay từ, làm câu văn rõ hơn; HS phải tự đọc lại, chọn lọc và chỉnh sửa dưới sự hướng dẫn của GV, không sao chép máy móc.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Nghệ sĩ trống (4 tiết)',
        subLessonName: 'Đọc: Nghệ sĩ trống',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): HS nhận biết AI có thể hỗ trợ luyện nghe nhịp, gợi ý cách tập nhạc hoặc tạo âm thanh minh họa, nhưng ước mơ và thành công vẫn cần sự nỗ lực, luyện tập của con người.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS biết tìm hiểu âm thanh/hình ảnh nhạc cụ từ nguồn GV giới thiệu; biết ghi tên nguồn, chọn lọc thông tin phù hợp, không mở đường dẫn lạ.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Nghệ sĩ trống (4 tiết)',
        subLessonName: 'Viết: Tìm hiểu cách viết báo cáo thảo luận nhóm',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 3.2.CB2a, 5.2.CB2a: HS biết trình bày báo cáo thảo luận nhóm bằng công cụ soạn thảo/bảng đơn giản dưới sự hướng dẫn của GV; biết lưu, đặt tên tệp phù hợp và không chia sẻ thông tin cá nhân không cần thiết.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Nghệ sĩ trống (4 tiết)',
        subLessonName: 'Nói và nghe: Kể chuyện: Bốn anh tài',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Qua câu chuyện Bốn anh tài, HS bồi dưỡng tinh thần đoàn kết, dũng cảm, biết hợp tác để làm việc có ích cho tập thể.',
      },
      {
        week: '4',
        lessonName: 'Bài 7: Những bức chân dung (3 tiết)',
        subLessonName: 'Đọc: Những bức chân dung',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết tôn trọng vẻ riêng của bản thân và bạn bè; không chê bai ngoại hình, biết nhận xét chân thành, lịch sự và nhân ái.',
      },
      {
        week: '4',
        lessonName: 'Bài 7: Những bức chân dung (3 tiết)',
        subLessonName: 'Luyện từ và câu: Quy tắc viết tên cơ quan, tổ chức',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS biết tìm kiếm, đối chiếu tên cơ quan, tổ chức trên nguồn chính thống hoặc nguồn do GV giới thiệu; không chép thông tin chưa kiểm chứng.\n- Tích hợp AI (4.A1.2): HS quan sát cách GV dùng ChatGPT/Gemini để gợi ý kiểm tra tên cơ quan, tổ chức, nhưng phải đối chiếu lại với nguồn chính thống và quy tắc viết hoa trong SGK.',
      },
      {
        week: '4',
        lessonName: 'Bài 7: Những bức chân dung (3 tiết)',
        subLessonName: 'Viết: Lập dàn ý cho báo cáo thảo luận nhóm',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS quan sát cách GV dùng ChatGPT/Gemini để gợi ý khung dàn ý báo cáo thảo luận nhóm; biết đối chiếu với mẫu SGK, chọn lọc và chỉnh sửa, không sao chép máy móc.',
      },
      {
        week: '4',
        lessonName: 'Bài 8: Đò ngang (4 tiết)',
        subLessonName: 'Đọc: Đò ngang',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết trân trọng lao động bình dị, hiểu mỗi công việc đều đáng quý; rèn lối sống chăm chỉ, có trách nhiệm với nhiệm vụ được giao.\n- Tích hợp ATGT: HS nhận biết một số nguy cơ khi đi đò, đi thuyền; biết mặc áo phao, ngồi ngay ngắn, nghe hướng dẫn của người lớn khi tham gia giao thông đường thuỷ.',
      },
      {
        week: '4',
        lessonName: 'Bài 8: Đò ngang (4 tiết)',
        subLessonName: 'Viết: Viết báo cáo thảo luận nhóm',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS quan sát gợi ý rà soát cấu trúc báo cáo do GV tạo bằng ChatGPT/Gemini; biết tự kiểm tra, chỉnh sửa và không sao chép máy móc.',
      },
      {
        week: '4',
        lessonName: 'Bài 8: Đò ngang (4 tiết)',
        subLessonName: 'Đọc mở rộng',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a: HS biết chọn nguồn đọc phù hợp, an toàn do GV/thư viện giới thiệu; ghi tên văn bản, tác giả và không chia sẻ thông tin chưa kiểm chứng.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết trân trọng điểm nổi bật của nhân vật và của bạn bè; biết học tập những nét tốt đẹp về tính cách, ý chí, lòng nhân ái.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd2',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 8',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ2',
    chapterTitle: 'Chủ điểm 2: Trải nghiệm và khám phá',
    topicTitle:
      'Bài 9: Bầu trời trong quả trứng (3 tiết); Bài 10: Tiếng nói của cỏ cây (4 tiết); Bài 11: Tập làm văn (3 tiết); Bài 12: Nhà phát minh 6 tuổi (4 tiết); Bài 13: Con vẹt xanh (3 tiết); Bài 14: Chân trời cuối phố (4 tiết); Bài 15: Gặt chữ trên non (3 tiết); Bài 16: Trước ngày xa quê (4 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản về khám phá thế giới tự nhiên và trải nghiệm tuổi thơ; LT&C: Động từ, Luyện tập về động từ, Cách dùng và công dụng của từ điển; Viết bài văn thuật lại một sự việc, bài văn kể lại một câu chuyện; Tích hợp NLS, AI, BVMT, QCN, ĐĐLS.',
    rawLessons: [
      {
        week: '5',
        lessonName: 'Bài 9: Bầu trời trong quả trứng (3 tiết)',
        subLessonName: 'Đọc: Bầu trời trong quả trứng',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS biết quan sát tranh/video do GV cung cấp về vòng đời gà con, chọn thông tin phù hợp, không tự ý truy cập nguồn lạ và biết hỏi người lớn khi cần tìm hiểu thêm.',
      },
      {
        week: '5',
        lessonName: 'Bài 9: Bầu trời trong quả trứng (3 tiết)',
        subLessonName: 'Luyện từ và câu: Động từ',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý từ ngữ như động từ, nhưng cần tự đọc ngữ cảnh, kiểm tra nghĩa và sửa lại cho đúng yêu cầu bài học.',
      },
      {
        week: '5',
        lessonName: 'Bài 9: Bầu trời trong quả trứng (3 tiết)',
        subLessonName: 'Viết: Tìm hiểu cách viết bài văn thuật lại một sự việc',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý trình tự sự việc hoặc khung dàn ý, nhưng cần chọn lọc, kiểm chứng với yêu cầu SGK và viết bằng trải nghiệm thật của mình.',
      },
      {
        week: '5',
        lessonName: 'Bài 10: Tiếng nói của cỏ cây (4 tiết)',
        subLessonName: 'Đọc: Tiếng nói của cỏ cây',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp BVMT: HS biết trồng, chăm sóc cây cối, không bẻ cành, hái hoa; hiểu cây xanh góp phần làm đẹp cảnh quan và bảo vệ môi trường sống.',
      },
      {
        week: '5',
        lessonName: 'Bài 10: Tiếng nói của cỏ cây (4 tiết)',
        subLessonName: 'Viết: Lập dàn ý cho bài văn thuật lại một sự việc',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: HS biết dùng bảng/sơ đồ đơn giản trên giấy hoặc công cụ số do GV hướng dẫn để sắp xếp trình tự hoạt động và trình bày dàn ý an toàn, rõ ràng.',
      },
      {
        week: '5',
        lessonName: 'Bài 10: Tiếng nói của cỏ cây (4 tiết)',
        subLessonName: 'Nói và nghe: Trải nghiệm đáng nhớ',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS biết trình bày trải nghiệm bằng lời nói hoặc hình ảnh đã được phép sử dụng; biết tôn trọng quyền riêng tư của bạn và không chia sẻ thông tin cá nhân trên môi trường số.',
      },
      {
        week: '6',
        lessonName: 'Bài 11: Tập làm văn (3 tiết)',
        subLessonName: 'Đọc: Tập làm văn',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết chăm chỉ quan sát, làm việc cẩn thận, trung thực khi viết bài; biết yêu quý và chăm sóc cây cối quanh em.',
      },
      {
        week: '6',
        lessonName: 'Bài 11: Tập làm văn (3 tiết)',
        subLessonName: 'Luyện từ và câu: Luyện tập về động từ',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Củng cố nhận diện và sử dụng động từ chỉ hoạt động, trạng thái trong câu.',
      },
      {
        week: '6',
        lessonName: 'Bài 11: Tập làm văn (3 tiết)',
        subLessonName: 'Viết: Viết bài văn thuật lại một sự việc',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp QCN: HS biết mình có quyền được chia sẻ trải nghiệm, bày tỏ suy nghĩ và cảm xúc cá nhân bằng lời văn phù hợp; đồng thời biết tôn trọng bài viết và cảm xúc của bạn.',
      },
      {
        week: '6',
        lessonName: 'Bài 12: Nhà phát minh 6 tuổi (4 tiết)',
        subLessonName: 'Đọc: Nhà phát minh 6 tuổi',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết trẻ em có quyền được học tập, khám phá, phát triển năng khiếu, sở trường và được người lớn khuyến khích những ý tưởng sáng tạo phù hợp lứa tuổi.\n- Tích hợp AI (4.A1.2): HS hiểu AI có thể gợi ý hoặc hỗ trợ tìm hiểu kiến thức khoa học, nhưng con người cần quan sát, đặt câu hỏi, kiểm chứng và tự đưa ra kết luận.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS học tập tinh thần chăm học, kiên trì quan sát, không bỏ cuộc khi gặp khó khăn.',
      },
      {
        week: '6',
        lessonName: 'Bài 12: Nhà phát minh 6 tuổi (4 tiết)',
        subLessonName: 'Viết: Tìm hiểu cách viết bài văn kể lại một câu chuyện',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết rút ra bài học sống nhân ái, hiền hậu, biết vượt qua khó khăn và biết mong muốn điều tốt đẹp cho bản thân, người khác.',
      },
      {
        week: '6',
        lessonName: 'Bài 12: Nhà phát minh 6 tuổi (4 tiết)',
        subLessonName: 'Đọc mở rộng',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS biết chọn bài đọc từ sách, thư viện lớp hoặc nguồn số do GV/người lớn giới thiệu; ghi rõ tên bài đọc, tác giả, không sao chép nội dung trên mạng máy móc.',
      },
      {
        week: '7',
        lessonName: 'Bài 13: Con vẹt xanh (3 tiết)',
        subLessonName: 'Đọc: Con vẹt xanh',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS biết quan sát thông tin/hình ảnh, âm thanh về loài vẹt từ nguồn do GV cung cấp; không tự ý truy cập trang lạ, biết ghi nhớ nguồn thông tin khi chia sẻ.',
      },
      {
        week: '7',
        lessonName: 'Bài 13: Con vẹt xanh (3 tiết)',
        subLessonName: 'Luyện từ và câu: Luyện tập về động từ',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý từ ngữ, câu văn nhưng cần tự kiểm tra, đối chiếu với kiến thức đã học; không chép nguyên đáp án của AI.',
      },
      {
        week: '7',
        lessonName: 'Bài 13: Con vẹt xanh (3 tiết)',
        subLessonName: 'Viết: Luyện viết mở bài, kết bài cho bài văn kể lại một câu chuyện',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 3.2.CB2a: HS biết sử dụng mẫu bảng/sơ đồ do GV cung cấp để sắp xếp ý mở bài, kết bài; trình bày sản phẩm rõ ràng, không sao chép văn mẫu trên mạng.',
      },
      {
        week: '7',
        lessonName: 'Bài 14: Chân trời cuối phố (4 tiết)',
        subLessonName: 'Đọc: Chân trời cuối phố',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết trẻ em có quyền vui chơi, khám phá trong môi trường an toàn; biết giữ an toàn khi ra ngoài và báo người lớn khi gặp nguy cơ.',
      },
      {
        week: '7',
        lessonName: 'Bài 14: Chân trời cuối phố (4 tiết)',
        subLessonName: 'Viết: Lập dàn ý cho bài văn kể lại một câu chuyện',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS biết AI có thể gợi ý trình tự sự việc hoặc dàn ý, nhưng phải tự kiểm tra, chỉnh sửa theo yêu cầu bài học và không sao chép máy móc.',
      },
      {
        week: '7',
        lessonName: 'Bài 14: Chân trời cuối phố (4 tiết)',
        subLessonName: 'Nói và nghe: Việc làm có ích',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 2.3.CB2a: HS biết ghi chép ý chính khi nghe bạn trình bày; nếu dùng thiết bị số để ghi âm/chụp sản phẩm học tập phải xin phép và chỉ dùng trong học tập.',
      },
      {
        week: '8',
        lessonName: 'Bài 15: Gặt chữ trên non (3 tiết)',
        subLessonName: 'Đọc: Gặt chữ trên non',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Đọc hiểu câu chuyện về nghị lực vượt khó đến trường của học sinh vùng cao.',
      },
      {
        week: '8',
        lessonName: 'Bài 15: Gặt chữ trên non (3 tiết)',
        subLessonName: 'Luyện từ và câu: Cách dùng và công dụng của từ điển',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS (3.1.CB2a): HS biết dùng từ điển giấy hoặc từ điển số dưới sự hướng dẫn của GV để tra nghĩa từ, đối chiếu kết quả và không nhập thông tin cá nhân khi sử dụng công cụ số.',
      },
      {
        week: '8',
        lessonName: 'Bài 15: Gặt chữ trên non (3 tiết)',
        subLessonName: 'Viết: Viết bài văn kể lại một câu chuyện',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): GV dùng ChatGPT/Gemini để tạo bảng kiểm đọc soát bài văn kể chuyện; HS nhận biết AI chỉ hỗ trợ gợi ý, không viết thay bài và không sao chép nguyên văn kết quả AI.',
      },
      {
        week: '8',
        lessonName: 'Bài 16: Trước ngày xa quê (4 tiết)',
        subLessonName: 'Đọc: Trước ngày xa quê',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS (2.3.CB2a): HS biết lựa chọn cách giao tiếp phù hợp, văn minh khi muốn gửi lời tạm biệt, lời cảm ơn tới thầy cô, bạn bè qua lời nói trực tiếp hoặc thông điệp số dưới sự hướng dẫn của GV.',
      },
      {
        week: '8',
        lessonName: 'Bài 16: Trước ngày xa quê (4 tiết)',
        subLessonName: 'Viết: Trả bài văn kể lại một câu chuyện',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): GV có thể dùng AI để tạo câu hỏi gợi ý sửa câu văn; HS chỉ sử dụng gợi ý dưới sự hướng dẫn của GV và tự quyết định cách sửa bài.',
      },
      {
        week: '8',
        lessonName: 'Bài 16: Trước ngày xa quê (4 tiết)',
        subLessonName: 'Đọc mở rộng',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS (3.2.CB2a): HS biết ghi chép thông tin đọc sách vào phiếu đọc sách; khi tìm thêm sách, biết ưu tiên nguồn sách phù hợp lứa tuổi, có tên tác giả hoặc nguồn rõ ràng.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-ot-gk1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 9',
    totalPeriods: 7,
    chapterCode: 'TV4-OTGK1',
    chapterTitle: 'Ôn tập và đánh giá giữa HKI',
    topicTitle: 'Phần 1: Ôn tập (Tiết 1 – 5); Phần 2: Kiểm tra Đọc & Kiểm tra Đọc hiểu – Viết (Tiết 6 – 7)',
    adjustedContentSummary:
      'Hệ thống hóa kiến thức Đọc hiểu, Luyện từ và câu (Danh từ, Động từ, Từ điển), Viết (Đoạn văn nêu ý kiến, Bài văn thuật lại một sự việc, Bài văn kể lại câu chuyện) và Đánh giá định kì giữa học kì I.',
    rawLessons: [
      {
        week: '9',
        lessonName: 'Phần 1: Ôn tập giữa HKI (5 tiết)',
        subLessonName: 'Ôn tập tiết 1, 2, 3, 4, 5',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Ôn tập tổng hợp kĩ năng đọc thành tiếng, đọc hiểu văn bản, kiến thức danh từ, động từ và lập dàn ý, viết bài văn kể chuyện/thuật lại sự việc.',
      },
      {
        week: '9',
        lessonName: 'Phần 2: Kiểm tra định kì giữa HKI (2 tiết)',
        subLessonName: 'Kiểm tra Đọc (tiết 6) & Kiểm tra Đọc hiểu – viết (tiết 7)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Đánh giá định kì Giữa học kì I theo Thông tư 27/2020/TT-BGDĐT (3 mức độ nhận thức).',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd3',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 13',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ3',
    chapterTitle: 'Chủ điểm 3: Niềm vui sáng tạo',
    topicTitle:
      'Bài 17: Vẽ màu (3 tiết); Bài 18: Đồng cỏ nở hoa (4 tiết); Bài 19: Thanh âm của núi (3 tiết); Bài 20: Bầu trời mùa thu (4 tiết); Bài 21: Làm thỏ con bằng giấy (3 tiết); Bài 22: Bức tường có nhiều phép lạ (4 tiết); Bài 23: Bét-tô-ven và bản xô-nát Ánh trăng (3 tiết); Bài 24: Người tìm đường lên các vì sao (4 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản về nghệ thuật, lao động sáng tạo và khoa học; LT&C: Biện pháp nhân hoá, Tính từ; Viết đoạn văn tưởng tượng, hướng dẫn thực hiện một công việc, viết đơn; Tích hợp AI (4.A1.1, 4.A1.2, 4.C5.1), NLS (1.1, 1.2, 3.1, 3.2, 5.2), BVMT, ĐĐLS.',
    rawLessons: [
      {
        week: '10',
        lessonName: 'Bài 17: Vẽ màu (3 tiết)',
        subLessonName: 'Đọc: Vẽ màu; LT&C: Biện pháp nhân hoá; Viết: Tìm hiểu cách viết đoạn văn tưởng tượng',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): HS nhận biết AI chỉ là công cụ hỗ trợ gợi ý câu văn nhân hoá; HS cần tự đọc, tự chọn, tự chỉnh sửa để câu văn đúng nghĩa, phù hợp và mang dấu ấn sáng tạo của mình.',
      },
      {
        week: '10',
        lessonName: 'Bài 18: Đồng cỏ nở hoa (4 tiết)',
        subLessonName: 'Đọc: Đồng cỏ nở hoa (2 tiết); Viết: Tìm ý cho đoạn văn tưởng tượng (1 tiết); Nói và nghe: Chúng em sáng tạo (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS hiểu người có ước mơ, năng khiếu cần chăm chỉ rèn luyện, tự tin, khiêm tốn tiếp thu góp ý; biết dùng khả năng sáng tạo để làm đẹp cuộc sống và trở thành người có ích.\n- Tích hợp AI (4.A1.1): HS biết dùng ChatGPT, Canva hoặc PowerPoint Designer dưới sự hướng dẫn của GV để tham khảo cách sắp xếp ý, tạo hình minh hoạ đơn giản cho phần giới thiệu sản phẩm; không sao chép nội dung AI và không đưa thông tin cá nhân lên công cụ số.',
      },
      {
        week: '11',
        lessonName: 'Bài 19: Thanh âm của núi (3 tiết)',
        subLessonName: 'Đọc: Thanh âm của núi (1 tiết); LT&C: Luyện tập về biện pháp nhân hoá (1 tiết); Viết: Viết đoạn văn tưởng tượng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS trân trọng âm thanh, nhạc cụ và nét đẹp văn hóa vùng miền; biết lắng nghe, chia sẻ cảm nhận về văn hóa dân tộc bằng thái độ tôn trọng.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS quan sát/nghe âm thanh, hình ảnh nhạc cụ và văn hóa vùng núi từ nguồn GV cung cấp; biết chọn thông tin phù hợp, không tự ý mở nguồn lạ.',
      },
      {
        week: '11',
        lessonName: 'Bài 20: Bầu trời mùa thu (4 tiết)',
        subLessonName: 'Đọc: Bầu trời mùa thu (2 tiết); Viết: Trả bài viết đoạn văn tưởng tượng (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp BVMT: HS biết quan sát vẻ đẹp thiên nhiên mùa thu; có ý thức giữ gìn cây xanh, cảnh quan trường lớp, không xả rác làm ảnh hưởng môi trường.',
      },
      {
        week: '12',
        lessonName: 'Bài 21: Làm thỏ con bằng giấy (3 tiết)',
        subLessonName: 'Đọc: Làm thỏ con bằng giấy (1 tiết); LT&C: Tính từ (1 tiết); Viết: Tìm hiểu cách viết hướng dẫn thực hiện một công việc (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết làm việc cẩn thận, khéo léo, kiên trì khi thực hiện sản phẩm thủ công; biết tiết kiệm giấy, giữ vệ sinh lớp học và chia sẻ sản phẩm với bạn.\n- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: HS sắp xếp các bước làm thỏ giấy thành sơ đồ/hình minh họa đơn giản bằng công cụ số dưới sự hướng dẫn của GV.',
      },
      {
        week: '12',
        lessonName: 'Bài 22: Bức tường có nhiều phép lạ (4 tiết)',
        subLessonName: 'Đọc: Bức tường có nhiều phép lạ (2 tiết); Viết: Viết hướng dẫn thực hiện một công việc (1 tiết); Nói và nghe: Kể chuyện Nhà phát minh và bà cụ (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS phát huy trí tưởng tượng, tinh thần hợp tác và sự tự tin khi khám phá điều mới; biết dùng phép lạ của trí tuệ, lòng tốt để làm việc có ích. Trân trọng người có ý tưởng mới, biết kiên trì, chủ động học hỏi.\n- Tích hợp NLS 3.2.CB2a, 1.2.CB2a: HS biết dùng bảng kiểm/công cụ số đơn giản để sắp xếp các bước hướng dẫn theo trình tự; đọc lại thông tin, điều chỉnh câu chữ rõ ràng.\n- Tích hợp AI (4.C5.1): Sử dụng tư duy thuật toán để hiểu cách huấn luyện máy tính thực hiện nhiệm vụ. Gợi ý hoạt động: Trải nghiệm dùng Teachable Machine dạy máy nhận diện đồ vật theo từng bước hướng dẫn cụ thể.',
      },
      {
        week: '13',
        lessonName: 'Bài 23: Bét-tô-ven và bản xô-nát Ánh trăng (3 tiết)',
        subLessonName: 'Đọc: Bét-tô-ven và bản xô-nát Ánh trăng (1 tiết); LT&C: Luyện tập về tính từ (1 tiết); Viết: Tìm hiểu cách viết đơn (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS trân trọng tài năng, nghị lực sáng tạo của người nghệ sĩ; biết lắng nghe âm nhạc bằng thái độ lịch sự, chia sẻ cảm xúc chân thành và tôn trọng cảm nhận của bạn.\n- Tích hợp AI (4.A1.2): Nhận thức sự rung cảm tâm hồn là giá trị nghệ thuật mà AI không bao giờ có được. Thảo luận: Tại sao bản nhạc của Bét-tô-ven lay động trái tim hơn bản nhạc do máy tính viết?',
      },
      {
        week: '13',
        lessonName: 'Bài 24: Người tìm đường lên các vì sao (4 tiết)',
        subLessonName: 'Đọc: Người tìm đường lên các vì sao (2 tiết); Viết: Viết đơn (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS bồi dưỡng ước mơ học tập, nghiên cứu khoa học; biết kiên trì, mạnh dạn đặt câu hỏi và theo đuổi mục tiêu tốt đẹp.\n- Tích hợp NLS 1.1.CB2a: HS tìm đọc thêm văn bản về nhà khoa học, nhà phát minh hoặc người có ước mơ đẹp; ghi tên văn bản, tác giả và thông tin nổi bật.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd4',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 17',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ4',
    chapterTitle: 'Chủ điểm 4: Chắp cánh ước mơ',
    topicTitle:
      'Bài 25: Bay cùng ước mơ (3 tiết); Bài 26: Con trai người làm vườn (4 tiết); Bài 27: Nếu em có một khu vườn (3 tiết); Bài 28: Bốn mùa mơ ước (4 tiết); Bài 29: Ở vương quốc tương lai (3 tiết); Bài 30: Cánh chim nhỏ (4 tiết); Bài 31: Nếu chúng mình có phép lạ (3 tiết); Bài 32: Anh Ba (4 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản về ước mơ, khát vọng và lòng yêu nước; LT&C: Luyện tập về tính từ, Dấu gạch ngang, Ôn tập danh từ, động từ, tính từ; Viết bài văn miêu tả con vật, viết thư; Tích hợp QCN, AI (4.C2.1, 4.A2.1, 4.D1.1), NLS, BVMT, Tiết kiệm nguồn nước, QPAN, ĐĐLS.',
    rawLessons: [
      {
        week: '14',
        lessonName: 'Bài 25: Bay cùng ước mơ (3 tiết)',
        subLessonName: 'Đọc: Bay cùng ước mơ (1 tiết); LT&C: Luyện tập về tính từ (1 tiết); Viết: Tìm hiểu cách viết bài văn miêu tả con vật (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS hiểu trẻ em có quyền được ước mơ, học tập và phát triển năng lực; biết nuôi dưỡng ước mơ phù hợp, có ích cho bản thân, gia đình và cộng đồng.\n- Tích hợp AI (4.C2.1): Nhận biết ứng dụng AI trong lĩnh vực hàng không và chinh phục không gian. Xem video: Cách AI hỗ trợ phi công điều khiển máy bay và hạ cánh an toàn trong điều kiện khó khăn.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm kiếm bài thơ/câu chuyện về ước mơ trên môi trường số; ghi tên tác giả, nguồn đọc và chọn lọc nội dung phù hợp lứa tuổi.',
      },
      {
        week: '14',
        lessonName: 'Bài 26: Con trai người làm vườn (4 tiết)',
        subLessonName: 'Đọc: Con trai người làm vườn (2 tiết); Viết: Quan sát con vật (1 tiết); Nói và nghe: Ước mơ của em (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết yêu lao động, trân trọng người làm vườn và thành quả chăm sóc cây trái; rèn tính kiên trì, trách nhiệm, biết giúp đỡ gia đình bằng việc vừa sức.\n- Tích hợp BVMT: HS quan sát con vật bằng thái độ yêu quý, không trêu chọc hoặc làm hại vật nuôi; biết chăm sóc cây, con vật phù hợp khả năng.\n- Tích hợp QCN: HS biết chia sẻ ước mơ của mình, lắng nghe ước mơ của bạn; tôn trọng sự khác biệt và động viên bạn thực hiện ước mơ đúng đắn.',
      },
      {
        week: '15',
        lessonName: 'Bài 27: Nếu em có một khu vườn (3 tiết)',
        subLessonName: 'Đọc: Nếu em có một khu vườn (1 tiết); LT&C: Dấu gạch ngang (1 tiết); Viết: Luyện viết đoạn văn miêu tả con vật (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT: HS biết yêu cây xanh, khu vườn và các con vật nhỏ quanh mình; có ý thức chăm sóc cây, giữ sạch sân vườn, không bẻ cành, hái hoa tùy tiện. Quan sát con vật/khu vườn bằng thái độ yêu quý.\n- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS biết chăm sóc khu vườn bằng cách tưới cây vừa đủ, tận dụng nước hợp lí khi phù hợp; không xả rác, hóa chất xuống ao hồ, kênh rạch quanh nhà và trường học.',
      },
      {
        week: '15',
        lessonName: 'Bài 28: Bốn mùa mơ ước (4 tiết)',
        subLessonName: 'Đọc: Bốn mùa mơ ước (2 tiết); Viết: Lập dàn ý cho bài văn miêu tả con vật (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QCN: HS hiểu trẻ em có quyền được ước mơ, vui chơi, học tập và bày tỏ mong muốn tốt đẹp; biết tôn trọng ước mơ của bạn, không chê bai hay áp đặt.\n- Tích hợp BVMT: HS tìm đọc, chia sẻ văn bản về thiên nhiên bốn mùa; biết yêu quý cảnh vật, cây cối, con vật và giữ gìn môi trường xung quanh.',
      },
      {
        week: '16',
        lessonName: 'Bài 29: Ở vương quốc tương lai (3 tiết)',
        subLessonName: 'Đọc: Ở vương quốc tương lai (1 tiết); LT&C: Luyện tập về dấu gạch ngang (1 tiết); Viết: Viết bài văn miêu tả con vật (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết tưởng tượng về tương lai tốt đẹp gắn với trách nhiệm học tập, sáng tạo; hiểu công nghệ cần phục vụ con người và cuộc sống nhân văn.\n- Tích hợp AI (4.A2.1): Nhận diện AI được tạo ra để hỗ trợ xã hội và nâng cao chất lượng cuộc sống. Gợi ý hoạt động: Thiết kế một "người bạn AI" (robot giúp việc, máy dò báu vật) cho vương quốc này.',
      },
      {
        week: '16',
        lessonName: 'Bài 30: Cánh chim nhỏ (4 tiết)',
        subLessonName: 'Đọc: Cánh chim nhỏ (2 tiết); Viết: Trả bài văn miêu tả con vật (1 tiết); Nói và nghe: Kể chuyện Đôi cánh của ngựa trắng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp BVMT: HS biết yêu quý loài chim và thiên nhiên; không bắt chim non, phá tổ chim, biết bảo vệ cây xanh và môi trường sống của các loài vật.',
      },
      {
        week: '17',
        lessonName: 'Bài 31: Nếu chúng mình có phép lạ (3 tiết)',
        subLessonName: 'Đọc: Nếu chúng mình có phép lạ (1 tiết); LT&C: Luyện tập về danh từ, động từ, tính từ (1 tiết); Viết: Tìm hiểu cách viết thư (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS hiểu trẻ em có quyền ước mơ, quyền học tập và phát triển năng lực; biết nuôi dưỡng ước mơ gắn với việc làm tốt cho bản thân, gia đình, cộng đồng.\n- Tích hợp AI (4.D1.1): Biến các ý tưởng "phép lạ" thành giải pháp AI thực tế để bảo vệ môi trường. Đề xuất một "thiết bị AI phép lạ" giúp gieo hạt phủ xanh đồi trọc tự động.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 2.3.CB2a, 4.1.CB2b: HS tra cứu thông tin về hiện tượng tự nhiên trên nguồn GV cung cấp; biết quy tắc giao tiếp lịch sự khi viết thư/thư điện tử; không chia sẻ địa chỉ, số điện thoại, hình ảnh cá nhân khi chưa được phép.',
      },
      {
        week: '17',
        lessonName: 'Bài 32: Anh Ba (4 tiết)',
        subLessonName: 'Đọc: Anh Ba (2 tiết); Viết: Viết thư (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QPAN: HS hiểu tình yêu nước và khát vọng tìm đường cứu nước của Bác Hồ thời trẻ; biết tự hào dân tộc, chăm học, rèn luyện để góp phần xây dựng và bảo vệ Tổ quốc.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS thực hành viết thư với lời lẽ chân thành, lịch sự; biết bảo vệ thông tin cá nhân khi giao tiếp trên môi trường số.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-ot-ck1',
    subject: 'Tiếng Việt',
    semester: 'HK1',
    weekRange: 'Tuần 18',
    totalPeriods: 7,
    chapterCode: 'TV4-OTCK1',
    chapterTitle: 'Ôn tập và đánh giá cuối HKI',
    topicTitle: 'Phần 1: Ôn tập (Tiết 1 – 5); Phần 2: Kiểm tra Đọc & Kiểm tra Đọc hiểu – Viết (Tiết 6 – 7)',
    adjustedContentSummary:
      'Tổng hợp kiến thức Học kì I môn Tiếng Việt lớp 4 (Danh từ, Động từ, Tính từ, Biện pháp nhân hoá, Dấu gạch ngang; Viết bài văn kể chuyện, thuật sự việc, tả con vật, viết đơn, viết thư) và Kiểm tra cuối HKI.',
    rawLessons: [
      {
        week: '18',
        lessonName: 'Phần 1: Ôn tập cuối HKI (5 tiết)',
        subLessonName: 'Ôn tập tiết 1, 2, 3, 4, 5',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Hệ thống hóa kiến thức đọc hiểu, luyện từ và câu, tập làm văn trong học kì I.',
      },
      {
        week: '18',
        lessonName: 'Phần 2: Kiểm tra định kì cuối HKI (2 tiết)',
        subLessonName: 'Kiểm tra Đọc (tiết 6) & Kiểm tra Đọc hiểu – viết (tiết 7)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Đánh giá định kì Cuối học kì I theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd5',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 22',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ5',
    chapterTitle: 'Chủ điểm 5: Sống để yêu thương',
    topicTitle:
      'Bài 1: Hải Thượng Lãn Ông (3 tiết); Bài 2: Vệt phấn trên mặt bàn (4 tiết); Bài 3: Ông Bụt đã đến (3 tiết); Bài 4: Quả ngọt cuối mùa (4 tiết); Bài 5: Tờ báo tường của tôi (3 tiết); Bài 6: Tiếng ru (4 tiết); Bài 7: Con muốn làm một cái cây (3 tiết); Bài 8: Trên khóm tre đầu ngõ (4 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản về lòng nhân ái, tình cảm gia đình, bạn bè; LT&C: Câu, Hai thành phần chính của câu, Chủ ngữ, Vị ngữ; Viết đoạn văn nêu tình cảm cảm xúc, hướng dẫn sử dụng một sản phẩm; Tích hợp QCN, AI (4.A1.1, 4.A2.2, 4.A1.2), KNS, NLS, BVMT, Tiết kiệm nguồn nước, ĐĐLS.',
    rawLessons: [
      {
        week: '19',
        lessonName: 'Bài 1: Hải Thượng Lãn Ông (3 tiết)',
        subLessonName: 'Đọc: Hải Thượng Lãn Ông (1 tiết); LT&C: Câu (1 tiết); Viết: Tìm hiểu cách viết đoạn văn nêu tình cảm, cảm xúc (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS hiểu quyền được chăm sóc sức khỏe; học tập tấm gương nhân ái, tận tụy vì người bệnh của Hải Thượng Lãn Ông.\n- Tích hợp AI (4.A1.1): Nhận biết các lĩnh vực cụ thể AI hỗ trợ con người như y tế và chăm sóc sức khỏe. Xem video: AI hỗ trợ bác sĩ chẩn đoán bệnh sớm (đọc phim X-quang) để nối dài lòng nhân ái.\n- Tích hợp KNS: Biết được ý nghĩa của việc làm chủ cảm xúc đối với bản thân.',
      },
      {
        week: '19',
        lessonName: 'Bài 2: Vệt phấn trên mặt bàn (4 tiết)',
        subLessonName: 'Đọc: Vệt phấn trên mặt bàn (2 tiết); Viết: Tìm ý cho đoạn văn nêu tình cảm, cảm xúc về một người gần gũi, thân thiết (1 tiết); Nói và nghe: Giúp bạn (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QCN: HS hiểu mỗi bạn đều có quyền được tôn trọng, lắng nghe và chia sẻ cảm xúc; biết quan tâm, giúp bạn đúng cách, không làm bạn tổn thương; không chế giễu, cô lập bạn và biết báo người lớn khi bạn gặp khó khăn.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS biết trao đổi, chia sẻ cảm xúc với bạn bằng lời nói lịch sự; nếu viết lời nhắn hoặc chia sẻ trên công cụ số của lớp thì dùng ngôn ngữ tôn trọng, không công khai chuyện riêng của bạn.',
      },
      {
        week: '20',
        lessonName: 'Bài 3: Ông Bụt đã đến (3 tiết)',
        subLessonName: 'Đọc: Ông Bụt đã đến (1 tiết); LT&C: Hai thành phần chính của câu (1 tiết); Viết: Viết đoạn văn nêu tình cảm, cảm xúc về một người gần gũi, thân thiết (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: Trẻ em có quyền được yêu thương, được tôn trọng, được lắng nghe và được bảo vệ; HS biết nói lời yêu thương, ứng xử nhân ái với người xung quanh.\n- Tích hợp AI (4.A2.2): Nhận biết AI hỗ trợ các đối tượng yếu thế trong xã hội (người khiếm thính, khuyết tật). Liên hệ: AI như "ông Bụt" hiện đại với các ứng dụng chuyển giọng nói thành văn bản cho bạn nhỏ.',
      },
      {
        week: '20',
        lessonName: 'Bài 4: Quả ngọt cuối mùa (4 tiết)',
        subLessonName: 'Đọc: Quả ngọt cuối mùa (2 tiết); Viết: Tìm ý cho đoạn văn nêu tình cảm, cảm xúc về một nhân vật trong văn học (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết yêu thương, kính trọng ông bà, cha mẹ; trân trọng sự chăm sóc của người thân và thể hiện tình cảm bằng việc làm vừa sức.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS xác định đúng thông tin cần tìm, tìm kiếm đơn giản trong môi trường số để chọn câu chuyện phù hợp chủ đề; ghi tên truyện, tác giả và nguồn đọc.',
      },
      {
        week: '21',
        lessonName: 'Bài 5: Tờ báo tường của tôi (3 tiết)',
        subLessonName: 'Đọc: Tờ báo tường của tôi (1 tiết); LT&C: Luyện tập về chủ ngữ (1 tiết); Viết: Viết đoạn văn nêu tình cảm, cảm xúc về một nhân vật trong văn học (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS bồi dưỡng lòng nhân ái, dũng cảm và trách nhiệm; biết sẵn sàng giúp đỡ người gặp nạn, lan tỏa yêu thương trong cuộc sống.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS biết chia sẻ thông tin giúp đỡ người gặp khó khăn bằng lời nói hoặc công cụ số của lớp; chỉ chia sẻ tin đã xác minh, không đăng hình ảnh người khác khi chưa được phép.',
      },
      {
        week: '21',
        lessonName: 'Bài 6: Tiếng ru (4 tiết)',
        subLessonName: 'Đọc: Tiếng ru (2 tiết); Viết: Trả bài viết đoạn văn nêu tình cảm, cảm xúc về một nhân vật trong văn học (1 tiết); Nói và nghe: Kể chuyện Bài học quý (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS cảm nhận tình yêu thương trong lời ru; biết kính yêu, biết ơn mẹ và người thân, trân trọng những giá trị gia đình bình dị.\n- Tích hợp AI (4.A1.2): Giải thích vì sao AI không thể thay thế sự gắn kết tình cảm thiêng liêng giữa người với người. Thảo luận: Nếu một robot ru em ngủ, em sẽ cảm thấy thế nào so với khi được mẹ ru trực tiếp?\n- Tích hợp QCN: HS biết yêu thương, chia sẻ với người thân, bạn bè; biết rút ra bài học về lòng tốt, sự biết ơn sau khi nghe kể chuyện.',
      },
      {
        week: '22',
        lessonName: 'Bài 7: Con muốn làm một cái cây (3 tiết)',
        subLessonName: 'Đọc: Con muốn làm một cái cây (1 tiết); LT&C: Luyện tập về vị ngữ (1 tiết); Viết: Tìm hiểu cách viết hướng dẫn sử dụng một sản phẩm (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT: HS nhận biết trẻ em cần được sống trong môi trường xanh, an toàn; biết yêu cây, yêu thiên nhiên và giữ gìn không gian sống quanh em.\n- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS hiểu cây cần nước sạch để lớn lên; biết tưới cây vừa đủ, khóa vòi sau khi dùng, không đổ rác hoặc nước bẩn làm ô nhiễm ao hồ, kênh rạch.\n- Tích hợp NLS 4.1.CB2b: HS biết đọc kĩ hướng dẫn sử dụng sản phẩm; nhận biết rủi ro đơn giản khi làm theo hướng dẫn trên mạng hoặc video không rõ nguồn.',
      },
      {
        week: '22',
        lessonName: 'Bài 8: Trên khóm tre đầu ngõ (4 tiết)',
        subLessonName: 'Đọc: Trên khóm tre đầu ngõ (2 tiết); Viết: Viết hướng dẫn sử dụng một sản phẩm (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp BVMT: HS biết yêu quý tre, cây xanh và cảnh vật quê hương; có ý thức bảo vệ cây, không bẻ măng, bẻ cành hoặc làm hại cảnh quan.\n- Tích hợp NLS 4.1.CB2b, 5.2.CB2a, 1.1.CB2a: HS viết hướng dẫn sử dụng sản phẩm rõ bước, an toàn; tìm đọc câu chuyện phù hợp chủ điểm trên nguồn an toàn do GV/thư viện giới thiệu.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết trân trọng điểm nổi bật của nhân vật và bạn bè; học tập những nét tốt đẹp về tính cách, ý chí, lòng nhân ái.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd6',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 26',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ6',
    chapterTitle: 'Chủ điểm 6: Uống nước nhớ nguồn',
    topicTitle:
      'Bài 9: Sự tích con Rồng, cháu Tiên (3 tiết); Bài 10: Cảm xúc Trường Sa (4 tiết); Bài 11: Sáng tháng Năm (3 tiết); Bài 12: Chàng trai làng Phù Ủng (4 tiết); Bài 13: Vườn của ông tôi (3 tiết); Bài 14: Trong lời mẹ hát (4 tiết); Bài 15: Người thầy đầu tiên của bố tôi (3 tiết); Bài 16: Ngựa biên phòng (4 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản về cội nguồn dân tộc, chủ quyền biển đảo, Bác Hồ và lòng biết ơn; LT&C: Hai thành phần chính của câu, Trạng ngữ, Trạng ngữ chỉ thời gian, nơi chốn, nguyên nhân, mục đích; Tích hợp QPAN, TTHCM, AI (4.C2.1, 4.A2.2), NLS, BVMT, ĐĐLS.',
    rawLessons: [
      {
        week: '23',
        lessonName: 'Bài 9: Sự tích con Rồng, cháu Tiên (3 tiết)',
        subLessonName: 'Đọc: Sự tích con Rồng, cháu Tiên (1 tiết); LT&C: Luyện tập về hai thành phần chính của câu (1 tiết); Viết: Lập dàn ý cho bài văn kể lại một câu chuyện (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QPAN: HS tự hào truyền thống con Rồng cháu Tiên, biết ơn các Vua Hùng; hình thành ý thức giữ gìn cội nguồn dân tộc.',
      },
      {
        week: '23',
        lessonName: 'Bài 10: Cảm xúc Trường Sa (4 tiết)',
        subLessonName: 'Đọc: Cảm xúc Trường Sa (2 tiết); Viết: Viết bài văn kể lại một câu chuyện (1 tiết); Nói và nghe: Những tấm gương sáng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QPAN: HS hiểu Trường Sa là phần lãnh thổ thiêng liêng của Việt Nam; biết ơn lực lượng bảo vệ biển đảo, hình thành ý thức chủ quyền và trách nhiệm với Tổ quốc.\n- Tích hợp AI (4.C2.1): Trình bày ứng dụng AI trong an ninh biển và dự báo thời tiết tại Việt Nam. Xem clip: Thiết bị bay không người lái (AI) hỗ trợ các chiến sĩ hải quân giám sát bờ biển.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm câu chuyện về tấm gương bảo vệ biển đảo, lựa chọn từ khóa, ghi nguồn và biết ưu tiên nguồn tin chính thống, đáng tin cậy.',
      },
      {
        week: '24',
        lessonName: 'Bài 11: Sáng tháng Năm (3 tiết)',
        subLessonName: 'Đọc: Sáng tháng Năm (1 tiết); LT&C: Trạng ngữ (1 tiết); Viết: Trả bài văn kể lại một câu chuyện (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp TTHCM: HS học tập tình yêu nước, lối sống giản dị, tinh thần chăm học, chăm làm và ý thức phục vụ quê hương, đất nước theo gương Bác Hồ.\n- Tích hợp QPAN: HS hiểu tình yêu nước, ý thức độc lập tự do qua hình ảnh Bác Hồ; biết kính trọng lãnh tụ, có trách nhiệm học tập, giữ gìn quê hương, đất nước.',
      },
      {
        week: '24',
        lessonName: 'Bài 12: Chàng trai làng Phù Ủng (4 tiết)',
        subLessonName: 'Đọc: Chàng trai làng Phù Ủng (2 tiết); Viết: Viết đoạn văn nêu ý kiến (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QPAN: HS biết về lòng yêu nước, ý chí luyện tập và tinh thần đánh giặc giữ nước của Phạm Ngũ Lão; bồi dưỡng trách nhiệm bảo vệ quê hương.\n- Tích hợp NLS 1.1.CB2a: HS tìm đọc thêm truyện/kí sự lịch sử phù hợp lứa tuổi về nhân vật yêu nước; ghi tên văn bản, nhân vật và việc làm tiêu biểu.',
      },
      {
        week: '25',
        lessonName: 'Bài 13: Vườn của ông tôi (3 tiết)',
        subLessonName: 'Đọc: Vườn của ông tôi (1 tiết); LT&C: Trạng ngữ chỉ thời gian, nơi chốn (1 tiết); Viết: Trả bài viết đoạn văn nêu ý kiến (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT (tiết kiệm và bảo vệ nguồn nước): HS biết yêu quý khu vườn, cây trái và công sức lao động của ông bà, cha mẹ; có ý thức tưới cây vừa đủ, không lãng phí nước và không làm bẩn nguồn nước khi chăm sóc cây trái.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS quan sát hình ảnh cây trái, khu vườn từ nguồn GV cung cấp; biết chọn thông tin phù hợp để liên hệ bài đọc, không sao chép từ nguồn chưa rõ.',
      },
      {
        week: '25',
        lessonName: 'Bài 14: Trong lời mẹ hát (4 tiết)',
        subLessonName: 'Đọc: Trong lời mẹ hát (2 tiết); Viết: Lập dàn ý cho một bài văn thuật lại một sự việc (1 tiết); Nói và nghe: Truyền thống uống nước nhớ nguồn (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS cảm nhận tình yêu thương, sự hi sinh của mẹ; biết ơn ông bà, cha mẹ, thầy cô và những người có công; biết giữ gìn truyền thống uống nước nhớ nguồn bằng việc làm cụ thể.\n- Tích hợp AI (4.A2.2): Nhận biết AI hỗ trợ lưu giữ giá trị truyền thống thông qua phục chế hình ảnh/âm thanh. Giới thiệu cách dùng AI phục chế những bức ảnh cũ hoặc giọng hát đã mờ để kết nối kỉ niệm.',
      },
      {
        week: '26',
        lessonName: 'Bài 15: Người thầy đầu tiên của bố tôi (3 tiết)',
        subLessonName: 'Đọc: Người thầy đầu tiên của bố tôi (1 tiết); LT&C: Trạng ngữ chỉ nguyên nhân, mục đích (1 tiết); Viết: Viết bài văn thuật lại một sự việc (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Giáo dục truyền thống tôn sư trọng đạo; HS biết kính trọng, biết ơn thầy cô, trân trọng sự dạy dỗ của người đi trước.\n- Tích hợp AI (4.A2.2): Nhận diện AI hỗ trợ tìm kiếm thông tin cũ giúp con người kết nối với quá khứ. Thảo luận: AI có thể giúp tìm lại những kỉ niệm trường xưa qua kho dữ liệu hình ảnh khổng lồ.',
      },
      {
        week: '26',
        lessonName: 'Bài 16: Ngựa biên phòng (4 tiết)',
        subLessonName: 'Đọc: Ngựa biên phòng (2 tiết); Viết: Trả bài văn thuật lại một sự việc (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QPAN: HS biết ơn chiến sĩ biên phòng, hiểu nhiệm vụ bảo vệ biên cương; bồi dưỡng ý thức chủ quyền lãnh thổ, rèn tinh thần kỉ luật và trách nhiệm.\n- Tích hợp NLS 1.1.CB2a: HS tìm đọc thêm văn bản về biên giới, biển đảo hoặc người lính; ghi nguồn đọc và chia sẻ thông tin phù hợp, chính xác.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-ot-gk2',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 27',
    totalPeriods: 7,
    chapterCode: 'TV4-OTGK2',
    chapterTitle: 'Ôn tập và đánh giá giữa HKII',
    topicTitle: 'Phần 1: Ôn tập (Tiết 1 – 5); Phần 2: Kiểm tra Đọc & Kiểm tra Đọc hiểu – Viết (Tiết 6 – 7)',
    adjustedContentSummary:
      'Hệ thống hóa kiến thức Chủ điểm 5 & 6 (Câu, Chủ ngữ, Vị ngữ, Trạng ngữ; Viết đoạn văn nêu tình cảm cảm xúc, hướng dẫn sử dụng sản phẩm, bài văn kể chuyện/thuật sự việc) và Đánh giá định kì giữa học kì II.',
    rawLessons: [
      {
        week: '27',
        lessonName: 'Phần 1: Ôn tập giữa HKII (5 tiết)',
        subLessonName: 'Ôn tập tiết 1, 2, 3, 4, 5',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Ôn tập đọc thành tiếng, đọc hiểu và hệ thống câu, thành phần chính của câu (chủ ngữ, vị ngữ), trạng ngữ.',
      },
      {
        week: '27',
        lessonName: 'Phần 2: Kiểm tra định kì giữa HKII (2 tiết)',
        subLessonName: 'Kiểm tra Đọc (tiết 6) & Kiểm tra Đọc hiểu – viết (tiết 7)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Đánh giá định kì Giữa học kì II theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd7',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 31',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ7',
    chapterTitle: 'Chủ điểm 7: Quê hương trong tôi',
    topicTitle:
      'Bài 17: Cây đa quê hương (3 tiết); Bài 18: Bước mùa xuân (4 tiết); Bài 19: Đi hội Chùa Hương (3 tiết); Bài 20: Chiều ngoại ô (4 tiết); Bài 21: Những cánh buồm (3 tiết); Bài 22: Cái cầu (4 tiết); Bài 23: Đường đi Sa Pa (3 tiết); Bài 24: Quê ngoại (4 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản về tình yêu quê hương, đất nước; LT&C: Trạng ngữ chỉ phương tiện, Dấu ngoặc kép, Dấu ngoặc đơn, Luyện tập viết tên cơ quan tổ chức; Viết bài văn miêu tả cây cối; Tích hợp BVMT, Tiết kiệm nguồn nước, AI (4.A2.1, 4.C2.1), NLS, QCN, ĐĐLS.',
    rawLessons: [
      {
        week: '28',
        lessonName: 'Bài 17: Cây đa quê hương (3 tiết)',
        subLessonName: 'Đọc: Cây đa quê hương (1 tiết); LT&C: Trạng ngữ chỉ phương tiện (1 tiết); Viết: Tìm hiểu cách viết bài văn miêu tả cây cối (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT: HS biết yêu cây đa, cảnh vật quê hương; có ý thức giữ gìn cây xanh, di tích, cảnh quan chung nơi mình sinh sống.\n- Tích hợp AI (4.A2.1): Nhận diện AI hỗ trợ bảo tồn di sản và giới thiệu vẻ đẹp quê hương. Khám phá: Cách dùng AI tạo bản đồ số hoặc hướng dẫn viên ảo giới thiệu các cây cổ thụ quý hiếm.',
      },
      {
        week: '28',
        lessonName: 'Bài 18: Bước mùa xuân (4 tiết)',
        subLessonName: 'Đọc: Bước mùa xuân (2 tiết); Viết: Tìm hiểu cách viết bài văn miêu tả cây cối (Tiếp theo) (1 tiết); Nói và nghe: Những miền quê yêu dấu (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp BVMT: HS cảm nhận vẻ đẹp mùa xuân, cây cối, hoa lá; biết giữ gìn môi trường xanh, không hái hoa bẻ cành, cùng chăm sóc cây trong trường/lớp.\n- Tích hợp NLS 1.1.CB2a, 5.2.CB2a: HS tìm hình ảnh/thông tin về một miền quê Việt Nam, chọn lọc nội dung phù hợp và trình bày bằng tranh, sơ đồ hoặc slide đơn giản.',
      },
      {
        week: '29',
        lessonName: 'Bài 19: Đi hội Chùa Hương (3 tiết)',
        subLessonName: 'Đọc: Đi hội Chùa Hương (1 tiết); LT&C: Dấu ngoặc kép (1 tiết); Viết: Quan sát cây cối (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết tham gia lễ hội văn minh, giữ trật tự, không chen lấn; không xả rác, không làm bẩn suối, ao hồ, nguồn nước ở khu di tích; tôn trọng phong tục, nét đẹp văn hóa truyền thống.\n- Tích hợp NLS 1.1.CB2a, 4.1.CB2b: HS xem hình ảnh/video lễ hội từ nguồn GV chọn lọc; biết chia sẻ cảm nhận văn minh, không công khai hình ảnh cá nhân của người khác khi chưa được phép.',
      },
      {
        week: '29',
        lessonName: 'Bài 20: Chiều ngoại ô (4 tiết)',
        subLessonName: 'Đọc: Chiều ngoại ô (2 tiết); Viết: Luyện viết văn miêu tả cây cối (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp BVMT: HS quan sát, cảm nhận vẻ đẹp ngoại ô; biết giữ gìn không gian xanh, không vứt rác nơi công cộng, góp phần làm đẹp quê hương.\n- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS biết giữ sạch dòng kênh, ao hồ, không vứt rác xuống nguồn nước; dùng nước tiết kiệm trong sinh hoạt để góp phần giữ vẻ đẹp bình yên của ngoại ô.',
      },
      {
        week: '30',
        lessonName: 'Bài 21: Những cánh buồm (3 tiết)',
        subLessonName: 'Đọc: Những cánh buồm (1 tiết); LT&C: Dấu ngoặc đơn (1 tiết); Viết: Luyện viết mở bài, kết bài cho bài văn miêu tả cây cối (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS hiểu trẻ em có quyền được yêu thương, học tập và ước mơ; biết trân trọng tình cảm gia đình, nuôi dưỡng ước mơ tốt đẹp.\n- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS liên hệ tình yêu biển, sông với việc không xả rác ra kênh rạch, bãi biển; biết dùng nước tiết kiệm trong sinh hoạt để góp phần bảo vệ nguồn nước.',
      },
      {
        week: '30',
        lessonName: 'Bài 22: Cái cầu (4 tiết)',
        subLessonName: 'Đọc: Cái cầu (2 tiết); Viết: Lập dàn ý cho bài văn miêu tả cây cối (1 tiết); Nói và nghe: Kể chuyện Về quê ngoại (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS cảm nhận cây cầu là biểu tượng kết nối con người, quê hương; biết giữ gìn công trình công cộng và ứng xử an toàn khi qua cầu, qua đường.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm hiểu hình ảnh cây cầu/công trình quê hương từ nguồn GV giới thiệu; biết ghi nguồn ngắn gọn và không sao chép thông tin chưa kiểm chứng.',
      },
      {
        week: '31',
        lessonName: 'Bài 23: Đường đi Sa Pa (3 tiết)',
        subLessonName: 'Đọc: Đường đi Sa Pa (1 tiết); LT&C: Luyện tập viết tên cơ quan, tổ chức (1 tiết); Viết: Viết bài văn miêu tả cây cối (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT: HS yêu vẻ đẹp Sa Pa, có ý thức giữ gìn cảnh quan du lịch; tôn trọng văn hóa địa phương khi tham quan, trải nghiệm.\n- Tích hợp AI (4.C2.1): Nhận biết ứng dụng AI trong dự báo thời tiết và cảnh báo thiên tai vùng núi. Xem clip: Hệ thống AI cảnh báo sớm sạt lở đất hoặc sương mù dày đặc để bảo vệ khách du lịch.\n- Tích hợp NLS 1.2.CB2a: HS tra cứu tên cơ quan, tổ chức, địa danh trên nguồn chính thống, nhất là tên hành chính mới; biết đối chiếu để viết đúng quy tắc viết hoa.',
      },
      {
        week: '31',
        lessonName: 'Bài 24: Quê ngoại (4 tiết)',
        subLessonName: 'Đọc: Quê ngoại (2 tiết); Viết: Trả bài văn miêu tả cây cối (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết yêu quê hương, trân trọng tình cảm gia đình, họ hàng; có ý thức giữ gìn nếp sống tốt đẹp và cảnh quan nơi quê ngoại.\n- Tích hợp NLS 1.1.CB2a: HS tìm kiếm, chọn lọc thông tin phù hợp về quê ngoại/quê hương; biết chia sẻ bằng lời nói chân thành, tôn trọng văn hóa gia đình.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-tv-cd8',
    subject: 'Tiếng Việt',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 28,
    chapterCode: 'TV4-CĐ8',
    chapterTitle: 'Chủ điểm 8: Vì một thế giới bình yên & Ôn tập cuối năm học',
    topicTitle:
      'Bài 25: Khu bảo tồn động vật hoang dã Ngô-rông-gô-rô (3 tiết); Bài 26: Ngôi nhà của yêu thương (4 tiết); Bài 27: Băng tan (3 tiết); Bài 28: Chuyến du lịch thú vị (4 tiết); Bài 29: Lễ hội ở Nhật Bản (3 tiết); Bài 30: Ngày hội (4 tiết); Ôn tập và Đánh giá cuối năm học (7 tiết)',
    adjustedContentSummary:
      'Đọc hiểu văn bản về bảo vệ môi trường toàn cầu, hòa bình và tình hữu nghị; LT&C: Lựa chọn từ ngữ, Luyện tập về dấu câu; Viết đoạn văn tưởng tượng, viết thư, viết giấy mời; Tích hợp BVMT, Tiết kiệm nguồn nước, AI (4.A1.1, 4.D1.1, 4.B2.1, 4.D2.1), NLS, QCN, ĐĐLS.',
    rawLessons: [
      {
        week: '32',
        lessonName: 'Bài 25: Khu bảo tồn động vật hoang dã Ngô-rông-gô-rô (3 tiết)',
        subLessonName: 'Đọc: Khu bảo tồn động vật hoang dã Ngô-rông-gô-rô (1 tiết); LT&C: Lựa chọn từ ngữ (1 tiết); Viết: Viết đoạn văn tưởng tượng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT: HS yêu quý, có ý thức bảo vệ động vật hoang dã và môi trường sống; biết giữ gìn môi trường tự nhiên, không tiếp tay cho hành vi săn bắt, mua bán động vật trái phép.\n- Tích hợp AI (4.A1.1): Nhận biết AI hỗ trợ giám sát môi trường và bảo vệ đa dạng sinh học. Video: Cách AI dùng ảnh vệ tinh đếm số lượng động vật quý hiếm nhằm ngăn chặn săn trộm.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm/quan sát hình ảnh động vật hoang dã từ nguồn tin cậy do GV cung cấp; biết ghi nguồn, không chia sẻ thông tin chưa kiểm chứng.',
      },
      {
        week: '32',
        lessonName: 'Bài 26: Ngôi nhà của yêu thương (4 tiết)',
        subLessonName: 'Đọc: Ngôi nhà của yêu thương (2 tiết); Viết: Trả bài viết đoạn văn tưởng tượng (1 tiết); Nói và nghe: Chung tay bảo vệ động vật (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết yêu thương, sẻ chia với những bạn nhỏ có hoàn cảnh khó khăn; nuôi dưỡng ước mơ về một thế giới hòa bình, ấm no.\n- Tích hợp BVMT: HS biết chung tay bảo vệ động vật bằng việc không săn bắt, mua bán, trêu chọc động vật; tuyên truyền việc làm phù hợp lứa tuổi.',
      },
      {
        week: '33',
        lessonName: 'Bài 27: Băng tan (3 tiết)',
        subLessonName: 'Đọc: Băng tan (1 tiết); LT&C: Luyện tập lựa chọn từ ngữ (1 tiết); Viết: Viết đoạn văn tưởng tượng (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT (tiết kiệm và bảo vệ nguồn nước): HS quan sát hình ảnh/video về băng tan từ nguồn GV cung cấp; hiểu băng tan, biến đổi khí hậu có thể ảnh hưởng nguồn nước và đời sống; biết sử dụng nước, điện tiết kiệm.\n- Tích hợp AI (4.D1.1): Đề xuất ý tưởng giải quyết vấn đề môi trường toàn cầu bằng công nghệ AI. Vẽ sơ đồ: Mô tả một hệ thống AI theo dõi tốc độ băng tan và đưa ra cảnh báo sớm vùng ven biển.',
      },
      {
        week: '33',
        lessonName: 'Bài 28: Chuyến du lịch thú vị (4 tiết)',
        subLessonName: 'Đọc: Chuyến du lịch thú vị (2 tiết); Viết: Hướng dẫn cách viết thư (1 tiết); Đọc mở rộng (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống & BVMT: HS biết tham gia du lịch văn minh, tôn trọng quy định nơi công cộng, giữ gìn di tích, cảnh quan; không xả rác khi đi tham quan, tiết kiệm nước.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 5.2.CB2a: HS tìm kiếm/quan sát thông tin về một công trình kiến trúc nổi tiếng từ nguồn GV giới thiệu; biết ghi nguồn, chọn 2-3 ý chính và trình bày ngắn gọn.',
      },
      {
        week: '34',
        lessonName: 'Bài 29: Lễ hội ở Nhật Bản (3 tiết)',
        subLessonName: 'Đọc: Lễ hội ở Nhật Bản (1 tiết); LT&C: Luyện tập về dấu câu (1 tiết); Viết: Viết thư (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết trẻ em có quyền được yêu thương, chăm sóc, vui chơi, tham gia hoạt động văn hóa phù hợp; biết tôn trọng văn hóa các dân tộc, quốc gia.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b, 5.2.CB2a: HS biết viết thư/thư điện tử lịch sự, trình bày rõ ràng bằng công cụ số; không đưa thông tin cá nhân lên môi trường mạng khi chưa được phép.\n- Tích hợp AI (4.B2.1): Biết rủi ro khi chia sẻ thông tin cá nhân cho AI và cần bảo mật. Thực hành: Thảo luận danh sách thông tin "Tuyệt đối không được gửi" để đảm bảo an toàn số.',
      },
      {
        week: '34',
        lessonName: 'Bài 30: Ngày hội (4 tiết)',
        subLessonName: 'Đọc: Ngày hội (2 tiết); Viết: Viết giấy mời (1 tiết); Nói và nghe: Cuộc sống xanh (1 tiết)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết trẻ em trên thế giới đều có quyền được sống trong hòa bình, được vui chơi, giao lưu, bày tỏ tình cảm, ước mơ và được tôn trọng không phân biệt màu da, quốc tịch, ngôn ngữ.\n- Tích hợp NLS 3.1.CB2a, 4.1.CB2b: HS tạo giấy mời đơn giản bằng công cụ số theo mẫu GV hướng dẫn; biết chỉ ghi thông tin cần thiết, tránh công khai thông tin riêng tư.\n- Tích hợp BVMT & Tiết kiệm bảo vệ nguồn nước: HS biết nêu việc làm xây dựng cuộc sống xanh như tiết kiệm điện, nước, phân loại rác, trồng cây; khóa vòi sau khi rửa tay, không xả rác/xà phòng xuống ao hồ, kênh rạch.',
      },
      {
        week: '35',
        lessonName: 'Ôn tập và Đánh giá cuối năm học (7 tiết)',
        subLessonName: 'Phần 1: Ôn tập (Tiết 1 – 5); Phần 2: Kiểm tra Đọc (tiết 6) & Kiểm tra viết (tiết 7)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          '- Tích hợp AI (4.D2.1) (Tiết 1): Nhận thức con người cần liên tục đánh giá và nâng cấp các sản phẩm AI. Trò chơi: "Nhà phát triển tương lai" - Đề xuất cải tiến cho 1 ứng dụng AI đã học trong năm.\n- Đánh giá định kì Cuối năm học theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),
];

// ============================================================================
// 2. MÔN TOÁN LỚP 4 (13 CHỦ ĐỀ, 73 BÀI HỌC, 175 TIẾT: HKI 90 TIẾT, HKII 85 TIẾT)
// ============================================================================
export const GRADE4_TOAN_TOPICS: CurriculumTopic[] = [
  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd1',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 3',
    totalPeriods: 14,
    chapterCode: 'TOAN4-CĐ1',
    chapterTitle: 'Chủ đề 1: Ôn tập và bổ sung',
    topicTitle:
      'Bài 1: Ôn tập các số đến 100 000 (2 tiết); Bài 2: Ôn tập các phép tính trong phạm vi 100 000 (3 tiết); Bài 3: Số chẵn, số lẻ (2 tiết); Bài 4: Biểu thức chứa chữ (3 tiết); Bài 5: Giải bài toán có ba bước tính (2 tiết); Bài 6: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Ôn tập số và phép tính trong phạm vi 100 000; nhận biết số chẵn, số lẻ, biểu thức chứa chữ và giải bài toán có 3 bước tính; Tích hợp AI (4.A1.1, 4.A1.2, 4.C4.1, 4.D1.1) và NLS (5.2.CB2a).',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Ôn tập các số đến 100 000 (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 6); Tiết 2: Luyện tập (Tr 7)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): HS nhận biết AI hỗ trợ xử lý và sắp xếp lượng dữ liệu số khổng lồ nhanh hơn con người. Hoạt động: So sánh tốc độ sắp xếp 10 số (người làm) và AI sắp xếp 100.000 số trong 1 giây.',
      },
      {
        week: '1',
        lessonName: 'Bài 2: Ôn tập các phép tính trong phạm vi 100 000 (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 9); Tiết 2: Luyện tập (Tr 10); Tiết 3: Luyện tập (Tr 11)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS hiểu máy tính/AI tính toán rất nhanh nhưng con người vẫn là bên chịu trách nhiệm kiểm tra kết quả. Thử thách: GV nhập phép tính sai vào máy tính, HS dùng kiến thức để phát hiện và sửa lại lỗi của máy.',
      },
      {
        week: '2',
        lessonName: 'Bài 3: Số chẵn, số lẻ (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, hoạt động (Tr 12); Tiết 2: Luyện tập (Tr 13)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.C4.1): HS làm quen với tư duy thuật toán dựa trên luật (Nếu... thì...) để phân loại dữ liệu. Dạy máy: Thiết lập luật cho Robot: "Nếu chữ số tận cùng là 0, 2, 4, 6, 8 thì đó là số chẵn".',
      },
      {
        week: '2',
        lessonName: 'Bài 4: Biểu thức chứa chữ (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 14) Hoạt động (Tr 15); Tiết 2: Luyện tập (Tr 16); Tiết 3: Luyện tập (Tr 17) Trò chơi (Tr 18)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS nhập giá trị đơn giản vào bảng tính/công cụ số theo hướng dẫn để kiểm tra giá trị của biểu thức chứa chữ.\n- Tích hợp AI (4.C4.1): Hiểu khái niệm "biến" (chữ số thay thế) trong lập trình điều khiển AI. Hoạt động: HS đóng vai Robot, thực hiện hành động dựa trên "biến" là các thẻ số thay đổi.',
      },
      {
        week: '3',
        lessonName: 'Bài 5: Giải bài toán có ba bước tính (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 19) Hoạt động (Tr 20); Tiết 2: Luyện tập (Tr 20)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.D1.1): Làm quen với quy trình giải quyết vấn đề (thu thập dữ liệu - xử lý - đánh giá) của AI. Quy trình: Thảo luận các bước để một "Robot tư vấn mua sắm" giúp khách hàng tính tổng tiền.',
      },
      {
        week: '3',
        lessonName: 'Bài 6: Luyện tập chung (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 21); Tiết 2: Luyện tập (Tr 22)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Củng cố kĩ năng thực hiện phép tính, tính giá trị biểu thức chứa chữ và giải bài toán có ba bước tính.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd2',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 3 – Tuần 5',
    totalPeriods: 7,
    chapterCode: 'TOAN4-CĐ2',
    chapterTitle: 'Chủ đề 2: Góc và đơn vị đo góc',
    topicTitle:
      'Bài 7: Đo góc, đơn vị đo góc (2 tiết); Bài 8: Góc nhọn, góc tù, góc bẹt (3 tiết); Bài 9: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Nhận biết đơn vị đo góc (độ), sử dụng thước đo góc, phân biệt góc nhọn, góc vuông, góc tù, góc bẹt; Tích hợp AI (4.C5.1 - Thị giác máy tính & Teachable Machine).',
    rawLessons: [
      {
        week: '3 - 4',
        lessonName: 'Bài 7: Đo góc, đơn vị đo góc (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 23) Hoạt động (Tr 24); Tiết 2: Luyện tập (Tr 25)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.C5.1): Nhận biết AI có thể sử dụng camera để nhận dạng và đo đạc hình ảnh vật thể. Trải nghiệm: Xem clip AI "nhìn" các góc của một ngôi nhà để gợi ý thiết kế kiến trúc.',
      },
      {
        week: '4',
        lessonName: 'Bài 8: Góc nhọn, góc tù, góc bẹt (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá, hoạt động (Tr 26); Tiết 2: Luyện tập (Tr 27); Tiết 3: Luyện tập, trò chơi (Tr 29)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.C5.1): Biết AI hỗ trợ phân loại hình ảnh dựa trên các đặc trưng hình học. Dạy AI: Sử dụng Teachable Machine để dạy máy phân biệt "Ảnh có góc nhọn" và "Ảnh có góc tù".',
      },
      {
        week: '4 - 5',
        lessonName: 'Bài 9: Luyện tập chung (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 31); Tiết 2: Luyện tập (Tr 32)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Luyện tập đo góc và nhận diện góc nhọn, góc vuông, góc tù, góc bẹt trong hình phẳng và thực tế.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd3',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 8',
    totalPeriods: 16,
    chapterCode: 'TOAN4-CĐ3',
    chapterTitle: 'Chủ đề 3: Số có nhiều chữ số',
    topicTitle:
      'Bài 10: Số có sáu chữ số. Số 1 000 000 (2 tiết); Bài 11: Hàng và lớp (3 tiết); Bài 12: Các số trong phạm vi lớp triệu (3 tiết); Bài 13: Làm tròn số đến hàng trăm nghìn (1 tiết); Bài 14: So sánh các số có nhiều chữ số (2 tiết); Bài 15: Làm quen với dãy số tự nhiên (2 tiết); Bài 16: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Đọc, viết, phân tích cấu tạo hàng và lớp của số có nhiều chữ số đến lớp triệu; làm tròn số đến hàng trăm nghìn; so sánh các số có nhiều chữ số và nhận biết dãy số tự nhiên; Tích hợp STEM, NLS (5.2.CB2a), AI (4.A1.1, 4.C4.1, 4.A3.1).',
    rawLessons: [
      {
        week: '5',
        lessonName: 'Bài 10: Số có sáu chữ số. Số 1 000 000 (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 33) Hoạt động (Tr 34); Tiết 2: Khám phá (Tr 35) Luyện tập (Tr 36)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp STEM: Bộ chữ số bí ẩn.\n- Tích hợp NLS 5.2.CB2a: HS dùng bảng giá trị vị trí/công cụ số đơn giản để đọc, viết, kiểm tra số có sáu chữ số và số 1 000 000 theo hướng dẫn.\n- Tích hợp AI (4.A1.1): Nhận biết AI trong ngân hàng hoặc dân số giúp quản lý hàng triệu dữ liệu chính xác. Ví dụ: Robot ngân hàng giúp kiểm đếm và quản lý số dư tài khoản của hàng triệu khách hàng.',
      },
      {
        week: '5 - 6',
        lessonName: 'Bài 11: Hàng và lớp (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 37); Tiết 2: Khám phá (Tr 38) Hoạt động (Tr 39); Tiết 3: Luyện tập (Tr 39)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.C4.1): Hiểu cách AI tổ chức dữ liệu theo từng "ngăn" để truy xuất thông tin nhanh. Hoạt động: Phân loại thẻ số vào đúng "lớp triệu", "lớp nghìn" như cách máy tính lưu trữ ảnh.',
      },
      {
        week: '6',
        lessonName: 'Bài 12: Các số trong phạm vi lớp triệu (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 41) Hoạt động (Tr 42); Tiết 2: Luyện tập (Tr 42); Tiết 3: Luyện tập (Tr 44)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Đọc, viết và xác định giá trị theo vị trí của từng chữ số trong các số thuộc phạm vi lớp triệu.',
      },
      {
        week: '6',
        lessonName: 'Bài 13: Làm tròn số đến hàng trăm nghìn (1 tiết)',
        subLessonName: 'Tiết 1: Khám phá, hoạt động (Tr 45) Luyện tập (Tr 46)',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A3.1): Hiểu rằng dự báo của AI (thời tiết, giá cả) thường là kết quả ước lượng từ dữ liệu. Thảo luận: Tại sao AI báo "ngày mai mưa 80%" (ước lượng) mà không nói "chắc chắn mưa"?',
      },
      {
        week: '7',
        lessonName: 'Bài 14: So sánh các số có nhiều chữ số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, hoạt động (Tr 47); Tiết 2: Luyện tập (Tr 48)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS nhập một dãy số có nhiều chữ số vào bảng/công cụ số, sắp xếp theo thứ tự và đối chiếu với kết quả so sánh bằng tay.\n- Tích hợp AI (4.A1.1): Nhận biết hiệu suất vượt trội của các thuật toán tìm kiếm và so sánh trong AI. Ví dụ: Tại sao Google có thể so sánh và tìm thấy hàng triệu kết quả chỉ trong 0.5 giây?',
      },
      {
        week: '7',
        lessonName: 'Bài 15: Làm quen với dãy số tự nhiên (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 50); Tiết 2: Luyện tập (Tr 51)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Nhận biết dãy số tự nhiên và một số đặc điểm cơ bản của dãy số tự nhiên.',
      },
      {
        week: '7 - 8',
        lessonName: 'Bài 16: Luyện tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 52); Tiết 2: Luyện tập (Tr 53); Tiết 3: Luyện tập (Tr 54)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Tổng hợp kiến thức về hàng và lớp, đọc viết, so sánh và làm tròn các số có nhiều chữ số.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd4',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 8 – Tuần 10',
    totalPeriods: 14,
    chapterCode: 'TOAN4-CĐ4',
    chapterTitle: 'Chủ đề 4: Một số đơn vị đo đại lượng',
    topicTitle:
      'Bài 17: Yến, tạ, tấn (3 tiết); Bài 18: Đề-xi-mét vuông, mét vuông, mi-li-mét vuông (4 tiết); Bài 19: Giây, thế kỉ (2 tiết); Bài 20: Thực hành và trải nghiệm sử dụng một số đơn vị đo đại lượng (3 tiết); Bài 21: Luyện tập chung (2 tiết)',
    adjustedContentSummary:
      'Chuyển đổi và tính toán với các đơn vị đo khối lượng (yến, tạ, tấn), diện tích (dm², m², mm²), thời gian (giây, thế kỉ); Tích hợp STEM, NLS (3.1, 5.2), AI (4.A1.1, 4.A2.2, 4.A2.1).',
    rawLessons: [
      {
        week: '8',
        lessonName: 'Bài 17: Yến, tạ, tấn (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 56); Tiết 2: Luyện tập (Tr 57); Tiết 3: Luyện tập (Tr 59)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS ghi kết quả đo/đổi đơn vị khối lượng vào bảng đơn giản, biết kiểm tra sự hợp lí của số liệu khi trình bày.\n- Tích hợp AI (4.A1.1): Nhận biết AI hỗ trợ điều khiển các thiết bị cân đo tự động trong nhà máy, cảng biển. Xem video: Hệ thống AI tại cảng biển tự động cân và phân loại container hàng chục tấn hàng.',
      },
      {
        week: '9',
        lessonName: 'Bài 18: Đề-xi-mét vuông, mét vuông, mi-li-mét vuông (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá, hoạt động (Tr 60); Tiết 2: Khám phá, Hoạt động (Tr 61-62); Tiết 3: Khám phá, Hoạt động (Tr 63); Tiết 4: Luyện tập (Tr 64) Trò chơi (Tr 65)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a: HS dùng lưới ô vuông hoặc công cụ vẽ đơn giản để biểu diễn đề-xi-mét vuông, mét vuông, mi-li-mét vuông và nhận biết mối quan hệ giữa các đơn vị.\n- Tích hợp AI (4.A2.2): Biết AI giúp giám sát môi trường và đo diện tích độ phủ rừng từ ảnh vệ tinh. Hoạt động: Tìm hiểu cách AI tính diện tích "vùng xanh" trên bản đồ để bảo vệ môi trường.',
      },
      {
        week: '9 - 10',
        lessonName: 'Bài 19: Giây, thế kỉ (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 66) Hoạt động (Tr 67); Tiết 2: Luyện tập (Tr 67)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp STEM: Thế kỉ.\n- Tích hợp AI (4.A2.1): Biết AI (trợ lý ảo) hỗ trợ con người quản lý thời gian và lập kế hoạch cuộc sống. Sắm vai: Đặt lệnh cho Robot: "Hãy nhắc mình học bài sau 3600 giây (1 giờ) nữa nhé".',
      },
      {
        week: '10',
        lessonName: 'Bài 20: Thực hành và trải nghiệm sử dụng một số đơn vị đo đại lượng (3 tiết)',
        subLessonName: 'Tiết 1: Hoạt động (Tr 69); Tiết 2: Hoạt động (Tr 70); Tiết 3: Hoạt động (Tr 72)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS ghi số liệu đo độ dài, khối lượng, thời gian vào bảng đơn giản và trình bày kết quả đo theo hướng dẫn.',
      },
      {
        week: '10 - 11',
        lessonName: 'Bài 21: Luyện tập chung (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 73); Tiết 2: Luyện tập (Tr 74)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Luyện tập tổng hợp chuyển đổi và giải bài toán thực tiễn gắn với đơn vị đo khối lượng, diện tích, thời gian.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd5',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 11 – Tuần 13',
    totalPeriods: 12,
    chapterCode: 'TOAN4-CĐ5',
    chapterTitle: 'Chủ đề 5: Phép cộng và phép trừ',
    topicTitle:
      'Bài 22: Phép cộng các số có nhiều chữ số (2 tiết); Bài 23: Phép trừ các số có nhiều chữ số (2 tiết); Bài 24: Tính chất giao hoán và kết hợp của phép cộng (3 tiết); Bài 25: Tìm hai số biết tổng và hiệu của hai số đó (2 tiết); Bài 26: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Thực hiện phép cộng, phép trừ các số có nhiều chữ số; vận dụng tính chất giao hoán, kết hợp để tính thuận tiện; giải bài toán tìm hai số khi biết tổng và hiệu; Tích hợp AI (4.B2.1, 4.C4.1, 4.A1.1), NLS (5.2.CB2a).',
    rawLessons: [
      {
        week: '11',
        lessonName: 'Bài 22: Phép cộng các số có nhiều chữ số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 76) Hoạt động (Tr 77); Tiết 2: Luyện tập (Tr 78)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.B2.1): Nhận thức dữ liệu chính xác là điều kiện để AI cho kết quả đúng; trách nhiệm của người nhập liệu. Thảo luận: Nếu một nhân viên nhập sai 1 chữ số trong máy tính tiền, hậu quả sẽ là gì?',
      },
      {
        week: '11',
        lessonName: 'Bài 23: Phép trừ các số có nhiều chữ số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 79) Hoạt động (Tr 80); Tiết 2: Luyện tập (Tr 81)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hiện phép trừ các số có nhiều chữ số và giải bài toán thực tế liên quan.',
      },
      {
        week: '12',
        lessonName: 'Bài 24: Tính chất giao hoán và kết hợp của phép cộng (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 82) Hoạt động (Tr 83); Tiết 2: Khám phá (Tr 84) Hoạt động (Tr 85); Tiết 3: Luyện tập (Tr 85)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS sử dụng bảng tính/công cụ số theo hướng dẫn để kiểm chứng tính chất giao hoán, kết hợp của phép cộng qua ví dụ cụ thể.\n- Tích hợp AI (4.C4.1): Hiểu AI sử dụng các quy tắc toán học để tối ưu hóa quy trình xử lý dữ liệu nhanh nhất. Hoạt động: HS tìm cách tính nhanh nhất và so sánh với cách AI chọn đường đi ngắn nhất trên bản đồ.',
      },
      {
        week: '12',
        lessonName: 'Bài 25: Tìm hai số biết tổng và hiệu của hai số đó (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 86) Hoạt động (Tr 87); Tiết 2: Luyện tập (Tr 87)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): Biết AI hỗ trợ giải các bài toán kinh tế (lời/lỗ) dựa trên công thức toán học. Ứng dụng: Tìm hiểu cách Robot quản lý kho hàng tính toán số lượng hàng nhập/xuất dựa trên tổng/hiệu.',
      },
      {
        week: '13',
        lessonName: 'Bài 26: Luyện tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 88); Tiết 2: Luyện tập (Tr 89); Tiết 3: Luyện tập (Tr 90)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Củng cố kĩ năng cộng, trừ số có nhiều chữ số, tính bằng cách thuận tiện và giải bài toán tìm hai số khi biết tổng và hiệu.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd6',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 13 – Tuần 16',
    totalPeriods: 14,
    chapterCode: 'TOAN4-CĐ6',
    chapterTitle: 'Chủ đề 6: Đường thẳng vuông góc, đường thẳng song song',
    topicTitle:
      'Bài 27: Hai đường thẳng vuông góc (2 tiết); Bài 28: Thực hành và trải nghiệm vẽ hai đường thẳng vuông góc (2 tiết); Bài 29: Hai đường thẳng song song (2 tiết); Bài 30: Thực hành và trải nghiệm vẽ hai đường thẳng song song (2 tiết); Bài 31: Hình bình hành, hình thoi (3 tiết); Bài 32: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Nhận biết và vẽ hai đường thẳng vuông góc, hai đường thẳng song song; nhận diện đặc điểm hình bình hành, hình thoi; Tích hợp AI (4.D1.1, 4.C4.1, 4.C5.1) và NLS (3.1.CB2a, 5.2.CB2a).',
    rawLessons: [
      {
        week: '13',
        lessonName: 'Bài 27: Hai đường thẳng vuông góc (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 91); Tiết 2: Luyện tập (Tr 92)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.D1.1): Hiểu AI cần dữ liệu mẫu (các góc vuông) để nhận diện các kiến trúc công trình. Dạy máy: Cung cấp cho Robot 10 ảnh đồ vật có góc vuông để máy học cách nhận diện khung cửa.',
      },
      {
        week: '14',
        lessonName: 'Bài 28: Thực hành và trải nghiệm vẽ hai đường thẳng vuông góc (2 tiết)',
        subLessonName: 'Tiết 1: Hoạt động (Tr 94); Tiết 2: Hoạt động (Tr 96)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: HS dùng công cụ vẽ đơn giản để tạo hai đường thẳng vuông góc, lưu hoặc trình bày sản phẩm theo hướng dẫn.',
      },
      {
        week: '14',
        lessonName: 'Bài 29: Hai đường thẳng song song (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 98) Hoạt động (Tr 99); Tiết 2: Luyện tập (Tr 99)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.C4.1): Nhận biết AI áp dụng quy tắc "song song" trong việc điều khiển xe tự lái di chuyển đúng làn đường. Xem video: Cách camera xe tự lái "nhìn" hai vạch kẻ đường song song để không đâm vào lề.',
      },
      {
        week: '15',
        lessonName: 'Bài 30: Thực hành và trải nghiệm vẽ hai đường thẳng song song (2 tiết)',
        subLessonName: 'Tiết 1: Hoạt động (Tr 101); Tiết 2: Hoạt động (Tr 103)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a: HS thực hành vẽ hai đường thẳng song song bằng thước hoặc công cụ số đơn giản, biết điều chỉnh sản phẩm cho đúng yêu cầu.',
      },
      {
        week: '15',
        lessonName: 'Bài 31: Hình bình hành, hình thoi (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 105) Hoạt động (Tr 106); Tiết 2: Khám phá, Hoạt động (Tr 107); Tiết 3: Luyện tập (Tr 108)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.C5.1): Biết AI nhận dạng hình ảnh qua việc phân tích các đặc trưng (cạnh đối diện song song, bằng nhau). Thực hành: Dùng app AI quét hình vẽ để máy đoán tên hình và nói các đặc điểm của hình đó.',
      },
      {
        week: '16',
        lessonName: 'Bài 32: Luyện tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 110); Tiết 2: Luyện tập (Tr 111); Tiết 3: Luyện tập (Tr 112)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Củng cố nhận biết và vẽ đường thẳng vuông góc, song song, hình bình hành, hình thoi.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd7',
    subject: 'Toán',
    semester: 'HK1',
    weekRange: 'Tuần 16 – Tuần 18',
    totalPeriods: 13,
    chapterCode: 'TOAN4-CĐ7',
    chapterTitle: 'Chủ đề 7: Ôn tập học kỳ 1',
    topicTitle:
      'Bài 33: Ôn tập các số đến lớp triệu (2 tiết); Bài 34: Ôn tập phép cộng, phép trừ (3 tiết); Bài 35: Ôn tập hình học (3 tiết); Bài 36: Ôn tập đo lường (2 tiết); Bài 37: Ôn tập chung (3 tiết)',
    adjustedContentSummary:
      'Hệ thống hóa kiến thức Học kì I môn Toán lớp 4 (Số đến lớp triệu, phép cộng trừ, hình học, đo lường); Tích hợp AI (4.A3.1 - Tự đánh giá thái độ sử dụng AI đúng cách).',
    rawLessons: [
      {
        week: '16 - 17',
        lessonName: 'Bài 33: Ôn tập các số đến lớp triệu (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 114); Tiết 2: Luyện tập (Tr 115)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Ôn tập đọc, viết, so sánh, làm tròn các số đến lớp triệu.',
      },
      {
        week: '17',
        lessonName: 'Bài 34: Ôn tập phép cộng, phép trừ (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 118); Tiết 2: Luyện tập (Tr 119); Tiết 3: Luyện tập (Tr 120)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Ôn tập phép cộng, phép trừ các số có nhiều chữ số và giải bài toán tìm hai số khi biết tổng và hiệu.',
      },
      {
        week: '17',
        lessonName: 'Bài 35: Ôn tập hình học (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 121); Tiết 2: Luyện tập (Tr 122); Tiết 3: Luyện tập (Tr 123) Trò chơi (Tr 124)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Ôn tập đo góc, góc nhọn, góc tù, góc bẹt, hai đường thẳng vuông góc, song song, hình bình hành, hình thoi.',
      },
      {
        week: '18',
        lessonName: 'Bài 36: Ôn tập đo lường (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 125); Tiết 2: Luyện tập (Tr 126)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Ôn tập chuyển đổi và tính toán với các đơn vị đo khối lượng, diện tích, thời gian.',
      },
      {
        week: '18',
        lessonName: 'Bài 37: Ôn tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 127); Tiết 2: Luyện tập (Tr 128); Tiết 3: Luyện tập (Tr 129)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.A3.1): HS tự đánh giá thái độ khi dùng AI: Không lạm dụng làm thay bài tập, biết bảo mật thông tin cá nhân. Hồ sơ: HS đánh dấu những kiến thức mình đã tự làm chủ và những công cụ AI mình dùng đúng cách.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd8',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 24',
    totalPeriods: 26,
    chapterCode: 'TOAN4-CĐ8',
    chapterTitle: 'Chủ đề 8: Phép nhân, phép chia',
    topicTitle:
      'Bài 38: Nhân với số có một chữ số (2 tiết); Bài 39: Chia cho số có một chữ số (2 tiết); Bài 40: Tính chất giao hoán và kết hợp của phép nhân (3 tiết); Bài 41: Nhân, chia với 10, 100, 1 000,... (2 tiết); Bài 42: Tính chất phân phối của phép nhân đối với phép cộng (3 tiết); Bài 43: Nhân với số có hai chữ số (3 tiết); Bài 44: Chia cho số có hai chữ số (3 tiết); Bài 45: Thực hành và trải nghiệm ước lượng trong tính toán (1 tiết); Bài 46: Tìm số trung bình cộng (2 tiết); Bài 47: Bài toán liên quan đến rút về đơn vị (2 tiết); Bài 48: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Thực hiện phép nhân, phép chia với số có một và hai chữ số; vận dụng tính chất giao hoán, kết hợp, phân phối; tìm số trung bình cộng và giải bài toán rút về đơn vị; Tích hợp AI (4.A1.2, 4.A3.1), NLS (2.1, 5.2), STEM.',
    rawLessons: [
      {
        week: '19',
        lessonName: 'Bài 38: Nhân với số có một chữ số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 4); Tiết 2: Luyện tập (Tr 5)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): HS đóng vai trò người giám sát, xác thực kết quả do máy tính thực hiện. Hoạt động: Một bạn làm máy tính, một bạn làm "Bác sĩ kiểm soát" để phê duyệt đáp án.',
      },
      {
        week: '19',
        lessonName: 'Bài 39: Chia cho số có một chữ số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 6) Hoạt động (Tr 7); Tiết 2: Luyện tập (Tr 8)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hiện phép chia số có nhiều chữ số cho số có một chữ số (chia hết và chia có dư).',
      },
      {
        week: '20',
        lessonName: 'Bài 40: Tính chất giao hoán và kết hợp của phép nhân (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 9) Hoạt động (Tr 10); Tiết 2: Khám phá (Tr 11) Hoạt động (Tr 12); Tiết 3: Luyện tập (Tr 13)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS dùng bảng tính/công cụ số để thử các ví dụ về tính chất giao hoán, kết hợp của phép nhân và trình bày nhận xét.',
      },
      {
        week: '20',
        lessonName: 'Bài 41: Nhân, chia với 10, 100, 1 000,... (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 14) Hoạt động (Tr 15); Tiết 2: Luyện tập (Tr 16)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Thực hiện tính nhẩm nhân, chia số tự nhiên với 10, 100, 1 000,...',
      },
      {
        week: '20 - 21',
        lessonName: 'Bài 42: Tính chất phân phối của phép nhân đối với phép cộng (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 17); Tiết 2: Luyện tập (Tr 18); Tiết 3: Luyện tập (Tr 19)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Vận dụng tính chất phân phối của phép nhân đối với phép cộng để tính giá trị biểu thức thuận tiện.',
      },
      {
        week: '21',
        lessonName: 'Bài 43: Nhân với số có hai chữ số (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 20) Hoạt động (Tr 21); Tiết 2: Luyện tập (Tr 21); Tiết 3: Luyện tập (Tr 22)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): Hiểu rủi ro nếu con người tin tưởng tuyệt đối vào kết quả tính toán của máy mà không hiểu quy trình. Phân tích: Nếu Robot báo diện tích sân trường là 10.000m² nhưng thực tế chỉ bé bằng lớp học, em sẽ làm gì?',
      },
      {
        week: '22',
        lessonName: 'Bài 44: Chia cho số có hai chữ số (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 23) Hoạt động (Tr 24); Tiết 2: Luyện tập (Tr 25); Tiết 3: Luyện tập (Tr 26)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a (Tiết 3): HS quét mã QR hoặc nhập mã để thực hiện Bài 3 trên Quizizz, trình bày đáp án, xem phản hồi và tự điều chỉnh cách tính; sử dụng thiết bị đúng mục đích, không chia sẻ thông tin cá nhân.',
      },
      {
        week: '22',
        lessonName: 'Bài 45: Thực hành và trải nghiệm ước lượng trong tính toán (1 tiết)',
        subLessonName: 'Tiết 1: Hoạt động (Tr 27) Trò chơi (Tr 29)',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp STEM: Thực hành ước lượng trong tính toán đơn giản.\n- Tích hợp AI (4.A3.1): Nhận biết dự đoán của AI chỉ mang tính xác suất (có thể xảy ra), cần con người quyết định cuối cùng. Thử thách: AI dự báo "khoảng 100 người tham dự", HS chuẩn bị phương án dự phòng (110 ghế).',
      },
      {
        week: '23',
        lessonName: 'Bài 46: Tìm số trung bình cộng (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 29); Tiết 2: Luyện tập (Tr 30)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS nhập dãy số liệu đơn giản vào bảng/công cụ số để kiểm tra kết quả tìm số trung bình cộng và trình bày nhận xét.',
      },
      {
        week: '23',
        lessonName: 'Bài 47: Bài toán liên quan đến rút về đơn vị (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 31); Tiết 2: Khám phá, Hoạt động, luyện tập (Tr 32)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Giải bài toán có lời văn liên quan đến rút về đơn vị (hai bước tính).',
      },
      {
        week: '23 - 24',
        lessonName: 'Bài 48: Luyện tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 33); Tiết 2: Luyện tập (Tr 34); Tiết 3: Luyện tập (Tr 35)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 2.1.CB2a (Tiết 2): HS biết quét mã QR để truy cập Quizizz, thực hiện và gửi đáp án theo hướng dẫn; sử dụng thiết bị đúng mục đích, không tự ý mở đường dẫn khác và biết xem kết quả để tự kiểm tra.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd9',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 24 – Tuần 25',
    totalPeriods: 7,
    chapterCode: 'TOAN4-CĐ9',
    chapterTitle: 'Chủ đề 9: Làm quen với yếu tố thống kê, xác suất',
    topicTitle:
      'Bài 49: Dãy số liệu thống kê (2 tiết); Bài 50: Biểu đồ cột (2 tiết); Bài 51: Số lần xuất hiện của một sự kiện (2 tiết); Bài 52: Luyện tập chung (1 tiết)',
    adjustedContentSummary:
      'Thu thập, phân loại, lập dãy số liệu thống kê; đọc và nhận xét biểu đồ cột; kiểm đếm số lần xuất hiện của một sự kiện; Tích hợp NLS (1.1, 1.2, 3.1, 5.2) và AI (4.D1.1, 4.A2.1, 4.A3.1).',
    rawLessons: [
      {
        week: '24',
        lessonName: 'Bài 49: Dãy số liệu thống kê (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 36) Hoạt động (Tr 37); Tiết 2: Luyện tập (Tr 38)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS thu thập dữ liệu đơn giản, ghi nguồn, kiểm tra tính hợp lí của số liệu trước khi lập dãy số liệu thống kê.\n- Tích hợp AI (4.D1.1): Hiểu rằng "dãy số liệu" chính là nguồn dữ liệu quan trọng nhất để huấn luyện AI học tập. Thực hành: Thu thập dữ liệu chiều cao tổ mình để "dạy" Robot biết kích cỡ áo trung bình của lớp.',
      },
      {
        week: '24 - 25',
        lessonName: 'Bài 50: Biểu đồ cột (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 39) Hoạt động (Tr 40); Tiết 2: Luyện tập (Tr 41)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: HS tạo biểu đồ cột đơn giản bằng công cụ số từ dữ liệu đã thu thập và trình bày nhận xét ngắn gọn.\n- Tích hợp AI (4.A2.1): Biết dùng AI hỗ trợ trình bày dữ liệu bằng hình ảnh sinh động giúp con người hiểu nhanh vấn đề. Trải nghiệm: Nhập số liệu vào phần mềm và xem AI tự động vẽ biểu đồ cột cho mình.',
      },
      {
        week: '25',
        lessonName: 'Bài 51: Số lần xuất hiện của một sự kiện (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 43); Tiết 2: Luyện tập (Tr 45)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS ghi số lần xuất hiện của một sự kiện vào bảng đơn giản, biết dùng công cụ số để kiểm tra và trình bày kết quả.\n- Tích hợp AI (4.A3.1): Hiểu cách AI dùng xác suất (số lần xảy ra trong quá khứ) để gợi ý sở thích cho người dùng. Ví dụ: Tại sao Youtube gợi ý đúng video em thích? (Dựa trên số lần em đã xem các clip tương tự).',
      },
      {
        week: '25',
        lessonName: 'Bài 52: Luyện tập chung (1 tiết)',
        subLessonName: 'Luyện tập chung (Tr 47)',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Củng cố đọc hiểu dãy số liệu, biểu đồ cột và kiểm đếm số lần xuất hiện của một sự kiện.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd10',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 25 – Tuần 28',
    totalPeriods: 16,
    chapterCode: 'TOAN4-CĐ10',
    chapterTitle: 'Chủ đề 10: Phân số',
    topicTitle:
      'Bài 53: Khái niệm phân số (2 tiết); Bài 54: Phân số và phép chia số tự nhiên (2 tiết); Bài 55: Tính chất cơ bản của phân số (2 tiết); Bài 56: Rút gọn phân số (2 tiết); Bài 57: Quy đồng mẫu số các phân số (2 tiết); Bài 58: So sánh phân số (3 tiết); Bài 59: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Nhận biết khái niệm phân số, thương của phép chia số tự nhiên, tính chất cơ bản của phân số, rút gọn, quy đồng mẫu số và so sánh phân số; Tích hợp NLS (3.1.CB2a, 5.2.CB2a) và AI (4.C4.1, 4.D1.1).',
    rawLessons: [
      {
        week: '25 - 26',
        lessonName: 'Bài 53: Khái niệm phân số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 49) Hoạt động (Tr 50); Tiết 2: Luyện tập (Tr 51)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a: HS quan sát mô phỏng phân số bằng hình ảnh/công cụ số để nhận biết tử số, mẫu số và ý nghĩa của phân số.\n- Tích hợp AI (4.C4.1): Hiểu AI có thể chia nhỏ dữ liệu thành các phần (segmentation) để nhận diện chi tiết vật thể. Minh họa: Xem cách AI "quét" một chiếc bánh và chia nó thành các vùng dữ liệu nhỏ để phân tích.',
      },
      {
        week: '26',
        lessonName: 'Bài 54: Phân số và phép chia số tự nhiên (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 52) Hoạt động (Tr 53); Tiết 2: Luyện tập (Tr 53)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Nhận biết mối liên hệ giữa phân số và phép chia hai số tự nhiên.',
      },
      {
        week: '26',
        lessonName: 'Bài 55: Tính chất cơ bản của phân số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 56) Hoạt động (Tr 57); Tiết 2: Luyện tập (Tr 57)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS quét mã QR hoặc truy cập Quizizz do GV cung cấp, lựa chọn và gửi đáp án Bài 3; biết xem phản hồi để tự kiểm tra, sử dụng thiết bị đúng mục đích và không tự ý mở đường dẫn khác.\n- Tích hợp AI (4.C4.1): Hiểu AI áp dụng các quy tắc biến đổi tương đương để đơn giản hóa các phép toán phức tạp. Hoạt động: HS thi rút gọn phân số với Chatbot để thấy sự chính xác của quy tắc logic.',
      },
      {
        week: '26 - 27',
        lessonName: 'Bài 56: Rút gọn phân số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 59) Hoạt động (Tr 60); Tiết 2: Luyện tập (Tr 61)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.D1.1): Hiểu quy trình làm sạch và tối giản dữ liệu giúp AI làm việc nhanh và hiệu quả hơn. Thảo luận: Tại sao cần loại bỏ thông tin rác trước khi đưa dữ liệu vào máy tính huấn luyện?',
      },
      {
        week: '27',
        lessonName: 'Bài 57: Quy đồng mẫu số các phân số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 62) Hoạt động (Tr 63); Tiết 2: Luyện tập (Tr 63)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a (Tiết 2): HS xác định nhu cầu tự kiểm tra mức độ hiểu bài; quét mã QR hoặc truy cập Quizizz do GV cung cấp, lựa chọn và gửi đáp án Bài 4, xem phản hồi để tự điều chỉnh.',
      },
      {
        week: '27 - 28',
        lessonName: 'Bài 58: So sánh phân số (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 64) Hoạt động (Tr 65); Tiết 2: Khám phá (Tr 66) Hoạt động (Tr 67); Tiết 3: Luyện tập (Tr 67)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a: HS dùng mô hình thanh phân số/hình chia phần trên công cụ số để so sánh phân số và kiểm chứng kết quả bằng lập luận toán học.\n- Tích hợp AI (4.C4.1): Nhận biết thuật toán so sánh là nền tảng để AI đưa ra các gợi ý "tốt nhất" cho con người. Ứng dụng: Cách AI so sánh giá của cùng 1 món đồ ở các cửa hàng để tìm giá rẻ nhất cho em.\n- Tích hợp NLS 5.2.CB2a (Tiết 3): Quét mã QR hoặc truy cập Quizizz do GV cung cấp để tự kiểm tra cách so sánh phân số.',
      },
      {
        week: '28',
        lessonName: 'Bài 59: Luyện tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 69); Tiết 2: Luyện tập (Tr 71); Tiết 3: Luyện tập (Tr 72)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS xác định nhu cầu tự kiểm tra kiến thức về phân số bằng nhau; truy cập Quizizz do GV cung cấp, lựa chọn và gửi đáp án Bài 2, xem phản hồi để tự sửa; bảo vệ thông tin cá nhân.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd11',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 29 – Tuần 30',
    totalPeriods: 10,
    chapterCode: 'TOAN4-CĐ11',
    chapterTitle: 'Chủ đề 11: Phép cộng, phép trừ phân số',
    topicTitle:
      'Bài 60: Phép cộng phân số (4 tiết); Bài 61: Phép trừ phân số (3 tiết); Bài 62: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Thực hiện phép cộng, phép trừ hai phân số cùng mẫu số và khác mẫu số; giải bài toán có lời văn liên quan đến cộng, trừ phân số; Tích hợp NLS (3.1.CB2a, 5.2.CB2a), AI (4.C4.1), Khoa học.',
    rawLessons: [
      {
        week: '29',
        lessonName: 'Bài 60: Phép cộng phân số (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 74); Tiết 2: Luyện tập (Tr 75); Tiết 3: Khám phá (Tr 77) Hoạt động (Tr 78); Tiết 4: Luyện tập (Tr 79)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a: HS dùng mô hình phân số trực quan trên công cụ số để minh họa phép cộng phân số, sau đó trình bày lại bằng cách tính trên vở.\n- Tích hợp NLS 5.2.CB2a: Truy cập Quizizz do GV cung cấp, điền và gửi đáp án Bài 3, xem phản hồi để tự điều chỉnh.\n- Tích hợp AI (4.C4.1): HS vận dụng tư duy logic để mô tả quy tắc tính tự động: nếu các phân số cùng mẫu số thì cộng các tử số và giữ nguyên mẫu số; biết kiểm tra điều kiện và kết quả trước khi sử dụng.',
      },
      {
        week: '29 - 30',
        lessonName: 'Bài 61: Phép trừ phân số (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá, Hoạt động (Tr 80); Tiết 2: Khám phá, Hoạt động (Tr 81); Tiết 3: Luyện tập (Tr 82)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a: HS dùng mô hình phân số trực quan trên công cụ số để minh họa phép trừ phân số, biết đối chiếu với quy tắc tính đã học.\n- Tích hợp Khoa học (Tiết 3): Qua ô chữ ở Bài 4, HS biết Sao Thổ là hành tinh thứ sáu tính từ Mặt Trời, nổi bật với hệ vành đai và là một hành tinh khí khổng lồ.',
      },
      {
        week: '30',
        lessonName: 'Bài 62: Luyện tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 83); Tiết 2: Luyện tập (Tr 84); Tiết 3: Luyện tập (Tr 84)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Củng cố kĩ năng cộng, trừ phân số và tính giá trị biểu thức phân số.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd12',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 31 – Tuần 33',
    totalPeriods: 12,
    chapterCode: 'TOAN4-CĐ12',
    chapterTitle: 'Chủ đề 12: Phép nhân, phép chia phân số',
    topicTitle:
      'Bài 63: Phép nhân phân số (4 tiết); Bài 64: Phép chia phân số (3 tiết); Bài 65: Tìm phân số của một số (2 tiết); Bài 66: Luyện tập chung (3 tiết)',
    adjustedContentSummary:
      'Thực hiện phép nhân, phép chia hai phân số; giải bài toán tìm phân số của một số; Tích hợp AI (4.A1.1, 4.B1.1), Khoa học, NLS (5.2.CB2a).',
    rawLessons: [
      {
        week: '31',
        lessonName: 'Bài 63: Phép nhân phân số (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 86) Hoạt động (Tr 87); Tiết 2: Luyện tập (Tr 87); Tiết 3: Luyện tập (Tr 88); Tiết 4: Luyện tập (Tr 90)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): Biết AI hỗ trợ các phép tính tỉ lệ cực nhanh trong thiết kế đồ họa và hoạt hình. Khám phá: Cách Robot vẽ hình hoặc nhân vật hoạt hình bằng các tỉ lệ phân số trên màn hình.\n- Tích hợp Khoa học (Tiết 2): HS biết tàu vũ trụ có thể chuyển động theo quỹ đạo quanh một thiên thể; biết dùng ki-lô-mét để biểu thị quãng đường bay và liên hệ kết quả phép nhân phân số với ý nghĩa thực tế.',
      },
      {
        week: '31 - 32',
        lessonName: 'Bài 64: Phép chia phân số (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 91) Hoạt động (Tr 92); Tiết 2: Luyện tập (Tr 92); Tiết 3: Luyện tập (Tr 93) Trò chơi (Tr 94)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Nhận biết phân số đảo ngược và thực hiện phép chia hai phân số.',
      },
      {
        week: '32',
        lessonName: 'Bài 65: Tìm phân số của một số (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá (Tr 95) Hoạt động (Tr 96); Tiết 2: Luyện tập (Tr 96)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.B1.1): Giáo dục sự công bằng: AI cần dùng thuật toán chia dữ liệu/tài nguyên công bằng cho mọi người. Thảo luận: Nếu Robot chia kẹo không đều giữa các bạn, liệu thuật toán đó có tốt không? Tại sao?',
      },
      {
        week: '32 - 33',
        lessonName: 'Bài 66: Luyện tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 98); Tiết 2: Luyện tập (Tr 99); Tiết 3: Luyện tập (Tr 100)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a (Tiết 1 & Tiết 3): HS xác định nhu cầu tự kiểm tra kiến thức về nhân, chia phân số; sử dụng mã hoặc đường liên kết Quizizz do GV cung cấp để trình bày đáp án, xem phản hồi và điều chỉnh cách làm; không cung cấp thông tin cá nhân không cần thiết.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-toan-cd13',
    subject: 'Toán',
    semester: 'HK2',
    weekRange: 'Tuần 33 – Tuần 35',
    totalPeriods: 14,
    chapterCode: 'TOAN4-CĐ13',
    chapterTitle: 'Chủ đề 13: Ôn tập cuối năm',
    topicTitle:
      'Bài 67: Ôn tập số tự nhiên (2 tiết); Bài 68: Ôn tập phép tính với số tự nhiên (2 tiết); Bài 69: Ôn tập phân số (2 tiết); Bài 70: Ôn tập phép tính với phân số (2 tiết); Bài 71: Ôn tập hình học và đo lường (2 tiết); Bài 72: Ôn tập một số yếu tố thống kê và xác suất (1 tiết); Bài 73: Ôn tập chung (3 tiết)',
    adjustedContentSummary:
      'Hệ thống hóa toàn bộ kiến thức Toán lớp 4 (Số tự nhiên, Phân số, Các phép tính, Hình học & Đo lường, Thống kê & Xác suất); Tích hợp NLS (1.1, 1.2, 3.1, 5.2) và STEM.',
    rawLessons: [
      {
        week: '33',
        lessonName: 'Bài 67: Ôn tập số tự nhiên (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 102); Tiết 2: Luyện tập (Tr 103)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS xác định nhu cầu tự kiểm tra kĩ năng so sánh số tự nhiên; sử dụng Quizizz để trình bày đáp án, xem phản hồi và tự điều chỉnh cách học.',
      },
      {
        week: '33 - 34',
        lessonName: 'Bài 68: Ôn tập phép tính với số tự nhiên (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 105); Tiết 2: Luyện tập (Tr 106)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Ôn tập bốn phép tính cộng, trừ, nhân, chia với số tự nhiên và giải toán có lời văn.',
      },
      {
        week: '34',
        lessonName: 'Bài 69: Ôn tập phân số (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 107); Tiết 2: Luyện tập (Tr 108)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a (Bài 1): HS xác định nhu cầu tự kiểm tra, sử dụng Quizizz để trình bày đáp án, xem phản hồi và điều chỉnh cách nhận biết phân số.',
      },
      {
        week: '34',
        lessonName: 'Bài 70: Ôn tập phép tính với phân số (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 110); Tiết 2: Luyện tập (Tr 111)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent: 'Ôn tập cộng, trừ, nhân, chia phân số và bài toán tìm phân số của một số.',
      },
      {
        week: '34 - 35',
        lessonName: 'Bài 71: Ôn tập hình học và đo lường (2 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 112); Tiết 2: Luyện tập (Tr 113)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 3.1.CB2a (Bài 1): HS dùng công cụ vẽ đơn giản để tạo sơ đồ góc theo đúng vị trí tương đối và trình bày sản phẩm theo hướng dẫn.\n- Tích hợp STEM (Bài 3): HS thực hành với bộ lắp ghép hình phẳng, tạo hình thoi và kiểm tra số đo các góc đối diện.\n- Tích hợp NLS 5.2.CB2a (Bài 5): HS dùng Quizizz để trình bày đáp án, xem phản hồi và tự điều chỉnh cách đếm khối lập phương.',
      },
      {
        week: '35',
        lessonName: 'Bài 72: Ôn tập một số yếu tố thống kê và xác suất (1 tiết)',
        subLessonName: 'Luyện tập (Tr 114)',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 5.2.CB2a: HS thu thập, kiểm tra và trình bày dữ liệu thống kê đơn giản bằng công cụ số theo hướng dẫn.',
      },
      {
        week: '35',
        lessonName: 'Bài 73: Ôn tập chung (3 tiết)',
        subLessonName: 'Tiết 1: Luyện tập (Tr 116); Tiết 2: Luyện tập (Tr 117); Tiết 3: Luyện tập (Tr 118)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent: 'Tổng kết và đánh giá định kì cuối năm học môn Toán lớp 4.',
      },
    ],
  }),
];
