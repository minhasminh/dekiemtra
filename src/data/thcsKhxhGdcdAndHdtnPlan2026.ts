import { CurriculumTopic } from '../types/domain';
import { buildThcsTopic } from './thcsToanAndTinPlan2026';
import {
  GRADE6_LS_DL_TOPICS_2026,
  GRADE6_NGU_VAN_TOPICS_2026,
  GRADE7_LS_DL_TOPICS_2026,
  GRADE7_NGU_VAN_TOPICS_2026,
  GRADE8_LS_DL_TOPICS_2026,
  GRADE8_NGU_VAN_TOPICS_2026,
  GRADE9_LS_DL_TOPICS_2026,
  GRADE9_NGU_VAN_TOPICS_2026,
  NDA_THCS_KHXH_SOURCE_DOC,
} from './thcsKhxhNguVanAndLsDlPlan2026';
import { THCS_KHXH_GDDP_AND_NGHE_THUAT_TOPICS_2026 } from './thcsKhxhGddpAndNgheThuatPlan2026';

// ============================================================================
// 1.3. MÔN GIÁO DỤC CÔNG DÂN – KHỐI 6, 7, 8, 9 (CẢ NĂM: 35 TIẾT = HKI 18 + HKII 17)
// ============================================================================

export const GRADE6_GDCD_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-gdcd-hk1',
    grade: 6,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD6-HK1',
    chapterTitle: 'GDCD 6 – Học kì I: Bài 1 đến Bài 6 (Truyền thống gia đình, Yêu thương con người, Siêng năng kiên trì, Tôn trọng sự thật, Tự lập, Tự nhận thức bản thân)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Tự hào về truyền thống gia đình, dòng họ; Yêu thương con người; Siêng năng, kiên trì; Tôn trọng sự thật; Tự lập; Tự nhận thức bản thân và Kiểm tra giữa kì 1, cuối kì 1. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, NLS (1.2, 2.5, 1.1, 5.3, 3.1) & AI (NLb).',
    rawLessons: [
      {
        id: 'gdcd6-b1',
        week: 'HKI (Tiết PPCT 1 – 3)',
        lessonName: 'Bài 1. Tự hào về truyền thống gia đình, dòng họ',
        periodAllocation: 'Tiết PPCT 1, 2, 3',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nêu một số truyền thống của gia đình, dòng họ; giải thích ý nghĩa và biết giữ gìn, phát huy truyền thống gia đình, dòng họ bằng những việc làm cụ thể phù hợp. Lồng ghép & Định hướng NLS - AI: Tích hợp quyền con người (Bộ phận); Lồng ghép GD QP&AN (Lịch sử và truyền thống QĐND, CAND Việt Nam); Tích hợp khung năng lực số (NL: 1.2, NL: 2.5) và Nội dung giáo dục trí tuệ nhân tạo AI: NLb.',
      },
      {
        id: 'gdcd6-b2',
        week: 'HKI (Tiết PPCT 4 – 5)',
        lessonName: 'Bài 2. Yêu thương con người',
        periodAllocation: 'Tiết PPCT 4, 5',
        periodsCount: 2,
        adjustedContent:
          'YCCĐ: Nêu khái niệm, biểu hiện và trình bày giá trị của tình yêu thương con người; thực hiện những việc làm thể hiện tình yêu thương con người. Lồng ghép & Định hướng NLS: Tích hợp quyền con người (Liên hệ: Quyền không bị phân biệt đối xử, quyền của trẻ em và người khuyết tật); Lồng ghép GD QP&AN (Hình ảnh Bác Hồ và bộ đội, công an giúp đỡ nhân dân vùng lũ lụt thiên tai); Tích hợp khung năng lực số (NL: 1.1).',
      },
      {
        id: 'gdcd6-b3-gk1',
        week: 'HKI (Tiết PPCT 6 – 8)',
        lessonName: 'Bài 3. Siêng năng, kiên trì (2 tiết); Kiểm tra giữa học kì 1 (1 tiết)',
        periodAllocation: 'Tiết PPCT 6, 7, 8',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nêu khái niệm, biểu hiện và ý nghĩa của siêng năng, kiên trì; đánh giá sự siêng năng, kiên trì của bản thân và người khác trong học tập, lao động. Kiểm tra giữa học kì 1. Lồng ghép & Định hướng NLS: Tích hợp quyền con người (Bộ phận: Quyền được làm việc, giáo dục và phát triển năng khiếu); Lồng ghép GD QP&AN ("Vượt nắng, thắng mưa, huấn luyện giỏi, kỉ luật nghiêm"); Tích hợp khung năng lực số (NL: 5.3).',
      },
      {
        id: 'gdcd6-b4-b6-ck1',
        week: 'HKI (Tiết PPCT 9 – 18)',
        lessonName: 'Bài 4. Tôn trọng sự thật (3 tiết); Bài 5. Tự lập (3 tiết); Bài 6. Tự nhận thức bản thân (3 tiết); Kiểm tra cuối học kì 1 (1 tiết)',
        periodAllocation: 'Tiết PPCT 9 – 18',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Nhận biết biểu hiện và hiểu vì sao phải tôn trọng sự thật, luôn nói thật; nêu khái niệm, biểu hiện và ý nghĩa của tự lập, tự thực hiện nhiệm vụ của bản thân; nhận biết điểm mạnh, điểm yếu của bản thân và xây dựng kế hoạch phát huy điểm mạnh, khắc phục điểm yếu. Kiểm tra cuối kì 1. Lồng ghép & Định hướng NLS: Bài 4 tích hợp Quyền con người & GDQP&AN; Bài 5 tích hợp GDQP&AN & Khung năng lực số (NL: 3.1); Bài 6 tích hợp Quyền con người.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-gdcd-hk2',
    grade: 6,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD6-HK2',
    chapterTitle: 'GDCD 6 – Học kì II: Bài 7 đến Bài 12 (Ứng phó tình huống nguy hiểm, Tiết kiệm, Công dân nước CHXHCN Việt Nam, Quyền và nghĩa vụ công dân, Quyền trẻ em)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Ứng phó với các tình huống nguy hiểm, Tiết kiệm, Công dân nước CHXHCN Việt Nam, Quyền và nghĩa vụ cơ bản của công dân, Quyền cơ bản của trẻ em, Thực hiện quyền trẻ em và Kiểm tra giữa kì 2, cuối kì 2. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, Tư tưởng Hồ Chí Minh, NLS (2.1) & AI (NLd).',
    rawLessons: [
      {
        id: 'gdcd6-b7-b8-gk2',
        week: 'HKII (Tiết PPCT 19 – 26)',
        lessonName: 'Bài 7. Ứng phó với các tình huống nguy hiểm (4 tiết); Bài 8. Tiết kiệm (3 tiết); Kiểm tra giữa học kì 2 (1 tiết)',
        periodAllocation: 'Tiết PPCT 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nhận biết các tình huống nguy hiểm và thực hành cách ứng phó để đảm bảo an toàn; nêu khái niệm, biểu hiện của tiết kiệm (tiền bạc, đồ dùng, thời gian, điện, nước) và thực hành tiết kiệm trong cuộc sống, học tập. Kiểm tra giữa học kì 2. Lồng ghép & Định hướng NLS - AI: Bài 7 tích hợp Quyền con người, GDQP&AN, Khung năng lực số (NL: 2.1) và Nội dung giáo dục trí tuệ nhân tạo AI: NLd; Bài 8 tích hợp Quyền con người & Tư tưởng, đạo đức, phong cách Hồ Chí Minh.',
      },
      {
        id: 'gdcd6-b9-b12-ck2',
        week: 'HKII (Tiết PPCT 27 – 35)',
        lessonName: 'Bài 9. Công dân nước Cộng hòa xã hội chủ nghĩa Việt Nam (2 tiết); Bài 10. Quyền và nghĩa vụ cơ bản của công dân (2 tiết); Bài 11. Quyền cơ bản của trẻ em (2 tiết); Bài 12. Thực hiện quyền trẻ em (2 tiết); Kiểm tra cuối học kì 2 (1 tiết)',
        periodAllocation: 'Tiết PPCT 27 – 35',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nêu khái niệm công dân và căn cứ xác định công dân nước CHXHCN Việt Nam; nêu quy định của Hiến pháp về quyền và nghĩa vụ cơ bản của công dân; nêu các quyền cơ bản của trẻ em, ý nghĩa và trách nhiệm của gia đình, nhà trường, xã hội trong việc thực hiện quyền trẻ em. Kiểm tra cuối học kì 2. Lồng ghép: Bài 9 tích hợp Quyền con người & GDQP&AN; Bài 11 tích hợp Quyền con người (Toàn phần).',
      },
    ],
  }),
];

export const GRADE7_GDCD_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-gdcd-hk1',
    grade: 7,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD7-HK1',
    chapterTitle: 'GDCD 7 – Học kì I: Bài 1 đến Bài 6 (Truyền thống quê hương, Quan tâm cảm thông, Học tập tự giác, Giữ chữ tín, Bảo tồn di sản, Ứng phó tâm lí căng thẳng)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Tự hào về truyền thống quê hương; Quan tâm, cảm thông và chia sẻ; Học tập tự giác, tích cực; Giữ chữ tín; Bảo tồn di sản văn hóa; Ứng phó với tâm lí căng thẳng và Kiểm tra giữa HKI, cuối HKI. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, Đạo đức lối sống, NLS (2.2, 2.3, 1.1, 5.3) & AI (NLc, NLb).',
    rawLessons: [
      {
        id: 'gdcd7-b1-b3-gk1',
        week: 'HKI (Tiết PPCT 1 – 8)',
        lessonName: 'Bài 1. Tự hào về truyền thống quê hương (3 tiết); Bài 2. Quan tâm, cảm thông và chia sẻ (2 tiết); Bài 3. Học tập tự giác, tích cực (2 tiết); Kiểm tra giữa HKI (1 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 8',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nêu một số truyền thống văn hóa, truyền thống yêu nước của quê hương và thực hiện việc làm giữ gìn, phát huy; nêu biểu hiện và ý nghĩa của sự quan tâm, cảm thông, chia sẻ; thực hiện học tập tự giác, tích cực. Kiểm tra giữa HKI. Lồng ghép & Định hướng NLS - AI: Bài 1 tích hợp Quyền con người, GDQP&AN, NLS 2.2 & AI NLc; Bài 2 tích hợp Quyền con người, GDQP&AN, NLS 2.3 & AI NLb; Bài 3 tích hợp Quyền con người & NLS 1.1 (Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số).',
      },
      {
        id: 'gdcd7-b4-b6-ck1',
        week: 'HKI (Tiết PPCT 9 – 18)',
        lessonName: 'Bài 4. Giữ chữ tín (3 tiết); Bài 5. Bảo tồn di sản văn hóa (3 tiết); Bài 6. Ứng phó với tâm lí căng thẳng (3 tiết); Kiểm tra cuối HKI (1 tiết)',
        periodAllocation: 'Tiết PPCT 9 – 18',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Hiểu chữ tín là gì, biểu hiện và vì sao phải giữ chữ tín; nêu khái niệm di sản văn hóa và quy định cơ bản của pháp luật về bảo vệ di sản văn hóa; nêu các tình huống gây căng thẳng và cách ứng phó tích cực khi tâm lí căng thẳng. Kiểm tra cuối HKI. Lồng ghép & Định hướng NLS: Bài 4 tích hợp đạo đức lối sống Bác Hồ; Bài 5 tích hợp GDQP&AN; Bài 6 tích hợp GDQP&AN & Khung năng lực số (NL: 5.3).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-gdcd-hk2',
    grade: 7,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD7-HK2',
    chapterTitle: 'GDCD 7 – Học kì II: Bài 7 đến Bài 10 (Phòng chống bạo lực học đường, Quản lý tiền, Phòng chống tệ nạn xã hội, Quyền và nghĩa vụ trong gia đình)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Phòng, chống bạo lực học đường; Quản lý tiền; Thực hiện phòng, chống tệ nạn xã hội; Quyền và nghĩa vụ của công dân trong gia đình và Kiểm tra giữa HKII, cuối HKII. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, Đạo đức lối sống, NLS (1.2, 2.3, 1.3) & AI (NLd).',
    rawLessons: [
      {
        id: 'gdcd7-b7-b8-gk2',
        week: 'HKII (Tiết PPCT 19 – 26)',
        lessonName: 'Bài 7. Phòng, chống bạo lực học đường (4 tiết); Bài 8. Quản lý tiền (3 tiết); Kiểm tra giữa HKII (1 tiết)',
        periodAllocation: 'Tiết PPCT 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nêu biểu hiện, nguyên nhân, tác hại và quy định pháp luật về phòng, chống bạo lực học đường; nêu ý nghĩa và nguyên tắc quản lí tiền có hiệu quả. Kiểm tra giữa HKII. Lồng ghép & Định hướng NLS - AI: Bài 7 tích hợp Quyền con người, GDQP&AN, NLS 1.2 & Nội dung giáo dục trí tuệ nhân tạo AI: NLd; Bài 8 tích hợp Đạo đức lối sống & NLS 2.3 (Sử dụng công nghệ số để thực hiện trách nhiệm công dân: xây dựng kỹ năng quản lý tiền phù hợp qua môi trường số).',
      },
      {
        id: 'gdcd7-b9-b10-ck2',
        week: 'HKII (Tiết PPCT 27 – 35)',
        lessonName: 'Bài 9. Thực hiện phòng, chống tệ nạn xã hội (4 tiết); Bài 10. Quyền và nghĩa vụ của công dân trong gia đình (4 tiết); Kiểm tra cuối HKII (1 tiết)',
        periodAllocation: 'Tiết PPCT 27 – 35',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nêu khái niệm tệ nạn xã hội, nguyên nhân, hậu quả và quy định của pháp luật về phòng, chống tệ nạn xã hội; nêu khái niệm, vai trò của gia đình và quy định cơ bản của pháp luật về quyền và nghĩa vụ của các thành viên trong gia đình. Kiểm tra cuối HKII. Lồng ghép & Định hướng NLS: Bài 9 tích hợp Quyền con người & GDQP&AN (Bảo vệ thông tin cá nhân khi tham gia mạng xã hội); Bài 10 tích hợp Quyền con người & Khung năng lực số (NL: 1.3).',
      },
    ],
  }),
];

export const GRADE8_GDCD_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-gdcd-hk1',
    grade: 8,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD8-HK1',
    chapterTitle: 'GDCD 8 – Học kì I: Bài 1 đến Bài 6 (Truyền thống dân tộc, Tôn trọng sự đa dạng, Lao động cần cù sáng tạo, Bảo vệ lẽ phải, Bảo vệ môi trường, Xác định mục tiêu cá nhân)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Tự hào về truyền thống dân tộc Việt Nam; Tôn trọng sự đa dạng của các dân tộc; Lao động cần cù, sáng tạo; Bảo vệ lẽ phải; Bảo vệ môi trường và tài nguyên thiên nhiên; Xác định mục tiêu cá nhân và Kiểm tra giữa HKI, cuối HKI. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, Đạo đức lối sống, NLS (2.2, 2.3, 1.1) & AI (NLc, NLb).',
    rawLessons: [
      {
        id: 'gdcd8-b1-b3-gk1',
        week: 'HKI (Tiết PPCT 1 – 8)',
        lessonName: 'Bài 1. Tự hào về truyền thống dân tộc Việt Nam (3 tiết); Bài 2. Tôn trọng sự đa dạng của các dân tộc (2 tiết); Bài 3. Lao động cần cù, sáng tạo (2 tiết); Kiểm tra giữa HKI (1 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 8',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nêu một số truyền thống của dân tộc Việt Nam và giữ gìn, phát huy; hiểu ý nghĩa của việc tôn trọng sự đa dạng của các dân tộc và các nền văn hóa trên thế giới; nêu khái niệm, biểu hiện và ý nghĩa của cần cù, sáng tạo trong lao động. Kiểm tra giữa HKI. Lồng ghép & Định hướng NLS - AI: Bài 1 tích hợp Quyền con người, GDQP&AN, NLS 2.2 & AI NLc; Bài 2 tích hợp Quyền con người, GDQP&AN, NLS 2.3 & AI NLb; Bài 3 tích hợp Quyền con người & GDQP&AN.',
      },
      {
        id: 'gdcd8-b4-b6-ck1',
        week: 'HKI (Tiết PPCT 9 – 18)',
        lessonName: 'Bài 4. Bảo vệ lẽ phải (2 tiết); Bài 5. Bảo vệ môi trường và tài nguyên thiên nhiên (3 tiết); Bài 6. Xác định mục tiêu cá nhân (4 tiết); Kiểm tra cuối kỳ 1 (1 tiết)',
        periodAllocation: 'Tiết PPCT 9 – 18',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Giải thích sự cần thiết phải bảo vệ lẽ phải; nêu quy định cơ bản của pháp luật và trách nhiệm của học sinh trong việc bảo vệ môi trường và tài nguyên thiên nhiên; nhận biết mục tiêu cá nhân và xây dựng kế hoạch hành động nhằm đạt mục tiêu. Kiểm tra cuối kỳ 1. Lồng ghép & Định hướng NLS: Bài 4 tích hợp Quyền con người, GDQP&AN & NLS 1.1; Bài 5 tích hợp Quyền con người & GDQP&AN; Bài 6 tích hợp Đạo đức lối sống.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-gdcd-hk2',
    grade: 8,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD8-HK2',
    chapterTitle: 'GDCD 8 – Học kì II: Bài 7 đến Bài 10 (Phòng chống bạo lực gia đình, Lập kế hoạch chi tiêu, Phòng ngừa tai nạn vũ khí/cháy nổ, Quyền và nghĩa vụ lao động)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Phòng, chống bạo lực gia đình; Lập kế hoạch chi tiêu; Phòng ngừa tai nạn vũ khí, cháy, nổ và các chất độc hại; Quyền và nghĩa vụ lao động của công dân và Kiểm tra giữa HKII, cuối HKII. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, Tư tưởng Hồ Chí Minh, NLS (1.2) & AI (NLd).',
    rawLessons: [
      {
        id: 'gdcd8-b7-b8-gk2',
        week: 'HKII (Tiết PPCT 19 – 26)',
        lessonName: 'Bài 7. Phòng, chống bạo lực gia đình (4 tiết); Bài 8. Lập kế hoạch chi tiêu (3 tiết); Kiểm tra giữa HKII (1 tiết)',
        periodAllocation: 'Tiết PPCT 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Kể được các hình thức bạo lực gia đình phổ biến, tác hại và quy định pháp luật về phòng, chống bạo lực gia đình; nhận biết sự cần thiết và biết cách lập kế hoạch chi tiêu hợp lí. Kiểm tra giữa HKII. Lồng ghép & Định hướng NLS - AI: Bài 7 tích hợp Quyền con người, NLS 1.2 & Nội dung giáo dục trí tuệ nhân tạo AI: NLd; Bài 8 tích hợp Đạo đức lối sống & Tư tưởng Hồ Chí Minh.',
      },
      {
        id: 'gdcd8-b9-b10-ck2',
        week: 'HKII (Tiết PPCT 27 – 35)',
        lessonName: 'Bài 9. Phòng ngừa tai nạn vũ khí, cháy, nổ và các chất độc hại (4 tiết); Bài 10. Quyền và nghĩa vụ lao động của công dân (4 tiết); Kiểm tra cuối HKII (1 tiết)',
        periodAllocation: 'Tiết PPCT 27 – 35',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Kể tên, trình bày hậu quả và quy định cơ bản của pháp luật về phòng ngừa tai nạn vũ khí, cháy, nổ và các chất độc hại; phân tích tầm quan trọng của lao động, quy định pháp luật về quyền, nghĩa vụ lao động của công dân và lao động chưa thành niên, lập hợp đồng lao động đơn giản. Kiểm tra cuối HKII. Lồng ghép: Bài 9 tích hợp Quyền con người & GDQP&AN; Bài 10 tích hợp Quyền con người & Đạo đức lối sống.',
      },
    ],
  }),
];

export const GRADE9_GDCD_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-gdcd-hk1',
    grade: 9,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD9-HK1',
    chapterTitle: 'GDCD 9 – Học kì I: Bài 1 đến Bài 6 (Sống có lí tưởng, Khoan dung, Hoạt động cộng đồng, Khách quan công bằng, Bảo vệ hòa bình, Quản lí thời gian hiệu quả)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Sống có lí tưởng; Khoan dung; Tích cực tham gia các hoạt động cộng đồng; Khách quan và công bằng; Bảo vệ hòa bình; Quản lí thời gian hiệu quả và Kiểm tra giữa HKI, cuối HKI. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, Tư tưởng Hồ Chí Minh, NLS (2.2, 2.3, 1.1) & AI (NLc, NLb).',
    rawLessons: [
      {
        id: 'gdcd9-b1-b3-gk1',
        week: 'HKI (Tiết PPCT 1 – 9)',
        lessonName: 'Bài 1. Sống có lí tưởng (3 tiết); Bài 2. Khoan dung (2 tiết); Bài 3. Tích cực tham gia các hoạt động cộng đồng (3 tiết); Kiểm tra giữa HKI (1 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 9',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nêu khái niệm, ý nghĩa của việc sống có lí tưởng và nhận biết lí tưởng sống của thanh niên Việt Nam; nêu khái niệm, biểu hiện và giá trị của khoan dung; hiểu thế nào là hoạt động cộng đồng và trách nhiệm tham gia hoạt động cộng đồng. Kiểm tra giữa HKI. Lồng ghép & Định hướng NLS - AI: Bài 1 tích hợp Quyền con người, GDQP&AN, NLS 2.2 & AI NLc; Bài 2 tích hợp Quyền con người, NLS 2.3 & AI NLb; Bài 3 tích hợp Quyền con người & GDQP&AN.',
      },
      {
        id: 'gdcd9-b4-b6-ck1',
        week: 'HKI (Tiết PPCT 10 – 18)',
        lessonName: 'Bài 4. Khách quan và công bằng (2 tiết); Bài 5. Bảo vệ hòa bình (3 tiết); Bài 6. Quản lí thời gian hiệu quả (3 tiết); Kiểm tra cuối HKI (1 tiết)',
        periodAllocation: 'Tiết PPCT 10 – 18',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nhận biết biểu hiện, ý nghĩa của khách quan, công bằng; nêu thế nào là hòa bình, bảo vệ hòa bình và các biện pháp thúc đẩy, bảo vệ hòa bình; hiểu sự cần thiết và cách quản lí thời gian hiệu quả. Kiểm tra cuối HKI. Lồng ghép & Định hướng NLS: Bài 4 tích hợp Quyền con người & NLS 1.1; Bài 5 tích hợp Quyền con người, GDQP&AN & NLS 2.2; Bài 6 tích hợp Đạo đức lối sống & Tư tưởng Hồ Chí Minh.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-gdcd-hk2',
    grade: 9,
    subject: 'Giáo dục công dân',
    chapterCode: 'GDCD9-HK2',
    chapterTitle: 'GDCD 9 – Học kì II: Bài 7 đến Bài 10 (Thích ứng với thay đổi, Tiêu dùng thông minh, Vi phạm pháp luật & trách nhiệm pháp lí, Quyền tự do kinh doanh & nghĩa vụ nộp thuế)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Thích ứng với thay đổi; Tiêu dùng thông minh; Vi phạm pháp luật và trách nhiệm pháp lí; Quyền tự do kinh doanh và nghĩa vụ nộp thuế và Kiểm tra giữa HKII, cuối HKII. Định hướng NLS - AI & Lồng ghép: Tích hợp Quyền con người, GDQP&AN, Đạo đức lối sống, NLS (1.2, 1.3) & AI (NLc).',
    rawLessons: [
      {
        id: 'gdcd9-b7-b8-gk2',
        week: 'HKII (Tiết PPCT 19 – 26)',
        lessonName: 'Bài 7. Thích ứng với thay đổi (4 tiết); Bài 8. Tiêu dùng thông minh (3 tiết); Kiểm tra giữa HKII (1 tiết)',
        periodAllocation: 'Tiết PPCT 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nêu một số thay đổi có khả năng xảy ra trong cuộc sống và các biện pháp để thích ứng với thay đổi; nhận biết thế nào là tiêu dùng thông minh, lợi ích và cách tiêu dùng thông minh (nắm bắt thông tin sản phẩm, sử dụng an toàn, phương thức thanh toán). Kiểm tra giữa HKII. Lồng ghép & Định hướng NLS: Bài 7 tích hợp Quyền con người, GDQP&AN & NLS 1.2; Bài 8 tích hợp Quyền con người & Đạo đức lối sống ("Người Việt Nam ưu tiên dùng hàng Việt Nam").',
      },
      {
        id: 'gdcd9-b9-b10-ck2',
        week: 'HKII (Tiết PPCT 27 – 35)',
        lessonName: 'Bài 9. Vi phạm pháp luật và trách nhiệm pháp lí (4 tiết); Bài 10. Quyền tự do kinh doanh và nghĩa vụ nộp thuế (4 tiết); Kiểm tra cuối HKII (1 tiết)',
        periodAllocation: 'Tiết PPCT 27 – 35',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nêu khái niệm, các loại vi phạm pháp luật và trách nhiệm pháp lí, ý nghĩa của trách nhiệm pháp lí; nêu quy định cơ bản của pháp luật về quyền tự do kinh doanh và nghĩa vụ nộp thuế, trách nhiệm của công dân trong việc thực hiện. Kiểm tra cuối HKII. Lồng ghép & Định hướng NLS - AI: Bài 9 tích hợp Quyền con người, GDQP&AN & NLS 1.2; Bài 10 tích hợp Quyền con người, NLS 1.3 & Nội dung giáo dục trí tuệ nhân tạo AI: NLc.',
      },
    ],
  }),
];

// ============================================================================
// 1.4. HOẠT ĐỘNG TRẢI NGHIỆM, HƯỚNG NGHIỆP – KHỐI 6, 7, 8, 9 (CẢ NĂM: 105 TIẾT = HKI 54 + HKII 51)
// ============================================================================

export const GRADE6_HDTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-hdtn-hk1',
    grade: 6,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN6-HK1',
    chapterTitle: 'HĐTN, HN 6 – Học kì I: Chủ đề 1 đến Chủ đề 5 (Em với nhà trường, Khám phá bản thân, Trách nhiệm với bản thân, Rèn luyện bản thân, Em với gia đình)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (54 tiết)',
    totalPeriods: 54,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Em với nhà trường (Tiết 1–12), Chủ đề 2: Khám phá bản thân (Tiết 13–24), Chủ đề 3: Trách nhiệm với bản thân (Tiết 25–36), Chủ đề 4: Rèn luyện bản thân (Tiết 37–48), Chủ đề 5: Em với gia đình (Tiết 49–54, phần HKI). Định hướng NLS - AI & Lồng ghép: NLS 1.1, 3.1; AI 6.D2.1, 6.A1.2; GDQP-AN.',
    rawLessons: [
      {
        id: 'hdtn6-cd1',
        week: 'HKI (Tiết PPCT 1 – 12)',
        lessonName: 'Chủ đề 1: Em với nhà trường (Lớp học mới của em, Truyền thống trường em, Phòng chống bạo lực học đường, Em và các bạn)',
        periodAllocation: 'Tiết PPCT 1 – 12',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nêu cảm xúc khi trở thành học sinh lớp 6; khám phá hoạt động và truyền thống nhà trường; kinh nghiệm thích nghi với môi trường mới, bạn mới; xây dựng quy tắc ứng xử tạo môi trường lớp học an toàn, thân thiện, phòng chống bạo lực học đường. Định hướng phát triển NLS: Tích hợp NLS 1.1 tại Tiết 10 (Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số về Bạo lực học đường).',
      },
      {
        id: 'hdtn6-cd2',
        week: 'HKI (Tiết PPCT 13 – 24)',
        lessonName: 'Chủ đề 2: Khám phá bản thân (Em đã lớn hơn, Đức tính đặc trưng của em, Sở thích và khả năng của em, Những giá trị của bản thân)',
        periodAllocation: 'Tiết PPCT 13 – 24',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận ra sự thay đổi tích cực của bản thân, giới thiệu đức tính đặc trưng, sở thích, khả năng và những giá trị của bản thân; xây dựng kế hoạch rèn luyện bản thân và thiết lập mối quan hệ với bạn bè. Định hướng phát triển NLS: Tích hợp NLS 3.1 tại Tiết 16 (Phát triển nội dung số giới thiệu về tấm gương đạo đức, phong cách Hồ Chí Minh) & Tiết 20–21 (Giới thiệu bản thân qua sản phẩm số: Tạo slide/thiệp điện tử giới thiệu sở thích, điểm mạnh, năng khiếu; thảo luận quy tắc an toàn mạng).',
      },
      {
        id: 'hdtn6-cd3-gk1',
        week: 'HKI (Tiết PPCT 25 – 36)',
        lessonName: 'Chủ đề 3: Trách nhiệm với bản thân (Tự chăm sóc bản thân, Đóng vai chuyên gia tâm lí hỗ trợ học sinh, Ôn tập & Kiểm tra giữa kỳ I, Ứng phó với thiên tai)',
        periodAllocation: 'Tiết PPCT 25 – 36',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Xây dựng kế hoạch chăm sóc bản thân; nhận biết những dấu hiệu của thiên tai và biết cách tự bảo vệ trong một số tình huống thiên tai cụ thể; tuyên truyền giảm thiểu biến đổi khí hậu. Kiểm tra giữa kỳ I. Định hướng phát triển AI: Tích hợp AI 6.D2.1 tại Tiết 29 (Đóng vai đối chiếu: Đưa một tình huống áp lực học tập cho Chatbot AI khuyên nhủ, sau đó đối chiếu với lời khuyên chân thành, ấm áp từ một người bạn thân đóng vai chuyên gia; giúp HS thấu hiểu giới hạn của AI so với con người vì AI không có cảm xúc thật và sự đồng cảm tinh tế).',
      },
      {
        id: 'hdtn6-cd4',
        week: 'HKI (Tiết PPCT 37 – 48)',
        lessonName: 'Chủ đề 4: Rèn luyện bản thân (Nhiệm vụ đội viên, Góc học tập của em, Sắp xếp nơi ở của em, Giao tiếp phù hợp trên mạng xã hội, Chi tiêu hợp lí)',
        periodAllocation: 'Tiết PPCT 37 – 48',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Lập và thực hiện kế hoạch sắp xếp nơi ở, góc học tập gọn gàng, ngăn nắp; tìm hiểu giao tiếp phù hợp trên mạng xã hội; xây dựng kế hoạch tiêu dùng thông minh và chi tiêu hợp lí. Lồng ghép GD QP và AN: HS biết các địa danh lịch sử của địa phương gắn liền với các cuộc kháng chiến chống giặc ngoại xâm và truyền thống của QĐND Việt Nam.',
      },
      {
        id: 'hdtn6-cd5-hk1',
        week: 'HKI (Tiết PPCT 49 – 54)',
        lessonName: 'Chủ đề 5: Em với gia đình – Phần HKI (Động viên, chăm sóc người thân trong gia đình; Giải quyết một số vấn đề thường gặp trong gia đình; Ôn tập & Kiểm tra cuối kỳ I)',
        periodAllocation: 'Tiết PPCT 49 – 54',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Thể hiện sự động viên, chăm sóc người thân trong gia đình bằng lời nói và hành động cụ thể; tham gia giải quyết một số vấn đề nảy sinh trong quan hệ gia đình. Kiểm tra cuối kỳ I. Lồng ghép & Định hướng AI: Lồng ghép GD QP và AN (Tiết 49); Tích hợp AI 6.A1.2 tại Tiết 52 (Tối ưu hóa lời khuyên: Nhóm HS nhập một tình huống tranh chấp góc học tập giữa hai anh em vào AI để hỏi cách xử lý, thảo luận điều chỉnh lời khuyên của AI; giúp HS nhận thức AI chỉ là công cụ hỗ trợ đề xuất giải pháp, con người mới là chủ thể quyết định dựa trên sự thấu cảm và tình yêu thương).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-hdtn-hk2',
    grade: 6,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN6-HK2',
    chapterTitle: 'HĐTN, HN 6 – Học kì II: Chủ đề 5 (tiếp), Chủ đề 6, 7, 8, 9 (Gia đình, Cộng đồng, Thiên nhiên & môi trường, Thế giới nghề nghiệp, Hiểu bản thân – Chọn đúng nghề)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (51 tiết)',
    totalPeriods: 51,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 (tiếp: Tiết 55–60), Chủ đề 6: Em với cộng đồng (Tiết 61–72), Chủ đề 7: Em với thiên nhiên và môi trường (Tiết 73–84), Chủ đề 8: Khám phá thế giới nghề nghiệp (Tiết 85–96), Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Tiết 97–105). Định hướng NLS - AI: NLS 3.1; AI 6.A3.2, 6.C1.2, 6.D2.MR2.',
    rawLessons: [
      {
        id: 'hdtn6-cd5-hk2-cd6',
        week: 'HKII (Tiết PPCT 55 – 72)',
        lessonName: 'Chủ đề 5 (tiếp): Em làm việc nhà (Tiết 55–60); Chủ đề 6: Em với cộng đồng (Thiết lập quan hệ cộng đồng, Tham gia hoạt động thiện nguyện, Hành vi có văn hóa nơi công cộng, Truyền thống quê em – Tiết 61–72)',
        periodAllocation: 'Tiết PPCT 55 – 72',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Chủ động, tự giác thực hiện công việc trong gia đình; xây dựng quy tắc ứng xử văn hóa nơi công cộng; lập kế hoạch và tham gia hoạt động thiện nguyện; giới thiệu lễ hội truyền thống quê em. Định hướng phát triển AI: Tích hợp AI 6.A3.2 tại Tiết 65 (Thực hành nhanh: HS sử dụng AI để truy vấn nhanh "Hãy liệt kê 3 lợi ích của việc học sinh lớp 6 tham gia phong trào kế hoạch nhỏ gom giấy vụn", chọn lọc thông tin để vẽ tranh cổ động tuyên truyền ý nghĩa hoạt động thiện nguyện).',
      },
      {
        id: 'hdtn6-cd7-gk2',
        week: 'HKII (Tiết PPCT 73 – 84)',
        lessonName: 'Chủ đề 7: Em với thiên nhiên và môi trường (Khám phá, bảo tồn cảnh quan thiên nhiên; Làm sản phẩm sáng tạo từ vật liệu tái chế; Ứng phó với biến đổi khí hậu; Ôn tập & Kiểm tra giữa kỳ II)',
        periodAllocation: 'Tiết PPCT 73 – 84',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Tìm hiểu và giới thiệu di sản thế giới tại Việt Nam; thực hành làm sản phẩm từ vật liệu tái chế; tuyên truyền giảm thiểu biến đổi khí hậu, bảo tồn cảnh quan thiên nhiên và bảo vệ động vật quý hiếm. Kiểm tra giữa kỳ II. Định hướng phát triển NLS: Tích hợp NLS 3.1 tại Tiết 73 (Tạo slide/thiệp điện tử giới thiệu di sản thế giới Việt Nam).',
      },
      {
        id: 'hdtn6-cd8-cd9-ck2',
        week: 'HKII (Tiết PPCT 85 – 105)',
        lessonName: 'Chủ đề 8: Khám phá thế giới nghề nghiệp (Thế giới nghề nghiệp quanh ta, Khám phá nghề truyền thống ở nước ta, Trải nghiệm nghề truyền thống – Tiết 85–96); Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Em với nghề truyền thống, Ôn tập & Kiểm tra cuối kỳ II, Tổng kết năm học – Tiết 97–105)',
        periodAllocation: 'Tiết PPCT 85 – 105',
        periodsCount: 21,
        adjustedContent:
          'YCCĐ: Tìm hiểu một số nghề truyền thống ở Việt Nam, giá trị, trang thiết bị, dụng cụ và an toàn lao động trong nghề truyền thống; tham gia làm sản phẩm nghề truyền thống; xây dựng kế hoạch hè an toàn, bổ ích. Kiểm tra cuối kỳ II. Định hướng phát triển NLS - AI: Tích hợp AI 6.C1.2 tại Tiết 85 (Trò chơi phân loại nhanh: Liệt kê các công việc dễ bị AI thay thế và công việc đòi hỏi sự sáng tạo, thấu cảm cao của con người; nhận thức tác động hai mặt của AI đối với tương lai nghề nghiệp); Tích hợp NLS 3.1 tại Tiết 93 (Tạo slide báo cáo thu hoạch về hoạt động trải nghiệm nghề truyền thống); Tích hợp AI 6.D2.MR2 tại Tiết 98 (Ứng dụng thực tế: HS nhập câu lệnh cho AI "Gợi ý ý tưởng thiết kế một logo hiện đại nhưng mang đậm bản sắc dân gian cho thương hiệu Nón lá Huế", dựa vào mô tả của AI để tự phác thảo logo quảng bá sản phẩm làng nghề truyền thống).',
      },
    ],
  }),
];

export const GRADE7_HDTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-hdtn-hk1',
    grade: 7,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN7-HK1',
    chapterTitle: 'HĐTN, HN 7 – Học kì I: Chủ đề 1 đến Chủ đề 5 (Em với nhà trường, Khám phá bản thân, Trách nhiệm với bản thân, Rèn luyện bản thân, Em với gia đình)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (54 tiết)',
    totalPeriods: 54,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Em với nhà trường (Tiết 1–9), Chủ đề 2: Khám phá bản thân (Tiết 10–21), Chủ đề 3: Trách nhiệm với bản thân (Tiết 22–36), Chủ đề 4: Rèn luyện bản thân (Tiết 37–49), Chủ đề 5: Em với gia đình (Tiết 50–54, phần HKI). Định hướng NLS - AI & Lồng ghép: NLS 1.1, 3.1; AI 7.A1.1, 7.A1.2; GDQP-AN.',
    rawLessons: [
      {
        id: 'hdtn7-cd1-cd2',
        week: 'HKI (Tiết PPCT 1 – 21)',
        lessonName: 'Chủ đề 1: Em với nhà trường (Phát triển mối quan hệ hòa đồng với thầy cô và các bạn, Xây dựng "Trường học hạnh phúc" – Tiết 1–9); Chủ đề 2: Khám phá bản thân (Điểm mạnh, điểm hạn chế của tôi; Kiểm soát cảm xúc của bản thân – Tiết 10–21)',
        periodAllocation: 'Tiết PPCT 1 – 21',
        periodsCount: 21,
        adjustedContent:
          'YCCĐ: Phát triển mối quan hệ hòa đồng với thầy cô và các bạn; nhận diện điểm mạnh, điểm hạn chế của bản thân và lập kế hoạch tự hoàn thiện; rèn luyện kĩ năng kiểm soát cảm xúc, giải tỏa cảm xúc tiêu cực. Lồng ghép & Định hướng AI: Lồng ghép GD QP và AN tại Tiết 4 (Kỹ năng bảo vệ thông tin cá nhân và phòng tránh lừa đảo khi tham gia mạng xã hội); Tích hợp AI-7.A1.1 tại Tiết 16 (Xem minh họa về công nghệ AI nhận diện cảm xúc qua khuôn mặt và thảo luận vì sao AI có thể đoán sai cảm xúc thật khi thiếu ngữ cảnh; hiểu giới hạn của AI chỉ phân tích biểu cảm bên ngoài chứ không thấu cảm sâu sắc như con người).',
      },
      {
        id: 'hdtn7-cd3-gk1',
        week: 'HKI (Tiết PPCT 22 – 36)',
        lessonName: 'Chủ đề 3: Trách nhiệm với bản thân (Vượt qua khó khăn; Ôn tập & Đánh giá giữa học kì I; Tự bảo vệ trong tình huống nguy hiểm; Giao lưu về phòng tránh lừa đảo)',
        periodAllocation: 'Tiết PPCT 22 – 36',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Biết cách vượt qua khó khăn trong các tình huống cụ thể; xác định một số tình huống nguy hiểm và biết cách tự bảo vệ bản thân; thiết kế áp phích, video, tiểu phẩm hướng dẫn cách tự bảo vệ trước tình huống nguy hiểm. Đánh giá giữa học kì I. Định hướng NLS & Lồng ghép: Tích hợp NLS 1.1 tại Tiết 32 & 35 (Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số); Lồng ghép GD QP và AN tại Tiết 34 (Phòng tránh lừa đảo trên mạng xã hội).',
      },
      {
        id: 'hdtn7-cd4-cd5-ck1',
        week: 'HKI (Tiết PPCT 37 – 54)',
        lessonName: 'Chủ đề 4: Rèn luyện bản thân (Rèn luyện thói quen ngăn nắp, gọn gàng, sạch sẽ; Rèn luyện tính kiên trì, chăm chỉ; Quản lí chi tiêu – Tiết 37–49); Chủ đề 5: Em với gia đình – Phần HKI (Kĩ năng chăm sóc người thân khi bị mệt, ốm; Ôn tập & Kiểm tra cuối học kỳ I – Tiết 50–54)',
        periodAllocation: 'Tiết PPCT 37 – 54',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Hình thành thói quen ngăn nắp, gọn gàng, sạch sẽ và tính kiên trì, chăm chỉ; bước đầu biết kiểm soát các khoản chi tiêu và tiết kiệm tiền; thực hiện kĩ năng chăm sóc người thân khi bị mệt, ốm. Kiểm tra cuối học kỳ I. Định hướng NLS - AI: Tích hợp NLS 3.1 tại Tiết 42 (Phát triển nội dung số lập kế hoạch chi tiêu cho một số sự kiện trong gia đình); Tích hợp AI-7.A1.2 tại Tiết 51 (Tình huống giả định: Bố mệt, em dùng AI tra cứu thuốc – thảo luận vì sao không được tự tiện cho bố uống thuốc theo đề xuất của AI mà phải hỏi ý kiến bác sĩ; nhận ra sự nguy hiểm từ việc tự ý dùng thuốc hoặc chẩn đoán y tế tự động từ AI mà không có sự xác thực của bác sĩ).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-hdtn-hk2',
    grade: 7,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN7-HK2',
    chapterTitle: 'HĐTN, HN 7 – Học kì II: Chủ đề 5 (tiếp), Chủ đề 6, 7, 8, 9 (Lắng nghe người thân, Cộng đồng, Hiệu ứng nhà kính, Nghề ở địa phương, Chọn đúng nghề)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (51 tiết)',
    totalPeriods: 51,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 (tiếp: Tiết 55–60), Chủ đề 6: Em với cộng đồng (Tiết 61–69), Chủ đề 7: Em với thiên nhiên và môi trường (Tiết 70–84), Chủ đề 8: Khám phá thế giới nghề nghiệp (Tiết 85–99), Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Tiết 100–105). Định hướng NLS - AI: AI 7.A1.1, 7.D2.1, 7.D2.MR1; NLS 1.1.',
    rawLessons: [
      {
        id: 'hdtn7-cd5-hk2-cd6',
        week: 'HKII (Tiết PPCT 55 – 69)',
        lessonName: 'Chủ đề 5 (tiếp): Kế hoạch lao động tại gia đình & Lắng nghe tích cực ý kiến người thân (Tiết 55–60); Chủ đề 6: Em với cộng đồng (Giao tiếp, ứng xử có văn hóa và tôn trọng sự khác biệt; Tham gia hoạt động thiện nguyện; Tự hào truyền thống quê hương – Tiết 61–69)',
        periodAllocation: 'Tiết PPCT 55 – 69',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Lập kế hoạch lao động tại gia đình và lắng nghe tích cực ý kiến người thân; thể hiện hành vi giao tiếp, ứng xử có văn hóa, tôn trọng sự khác biệt trong cộng đồng; tham gia hoạt động thiện nguyện và giới thiệu truyền thống đáng tự hào của quê hương. Định hướng NLS - AI: Tích hợp AI-7.A1.1 tại Tiết 59 (Hoạt động so sánh: Thảo luận so sánh giữa việc chia sẻ tâm sự với một Chatbot AI so với việc trò chuyện, lắng nghe trực tiếp cùng bố mẹ để đạt được sự thấu cảm); Tích hợp NLS 1.1 tại Tiết 65 (Duyệt, tìm kiếm và lọc dữ liệu, thông tin số về truyền thống địa phương).',
      },
      {
        id: 'hdtn7-cd7-gk2',
        week: 'HKII (Tiết PPCT 70 – 84)',
        lessonName: 'Chủ đề 7: Em với thiên nhiên và môi trường (Cảnh quan thiên nhiên quê hương tôi; Bảo vệ môi trường, giảm thiểu hiệu ứng nhà kính; Ôn tập & Kiểm tra giữa học kỳ II; Chiến dịch truyền thông bảo vệ môi trường)',
        periodAllocation: 'Tiết PPCT 70 – 84',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Thiết kế sản phẩm thể hiện sự hiểu biết, cảm xúc sau chuyến tham quan cảnh quan thiên nhiên; thực hiện các hành vi bảo vệ di tích, danh lam thắng cảnh; tìm hiểu ảnh hưởng của hiệu ứng nhà kính đến sự sống trên Trái Đất và thực hiện chiến dịch truyền thông bảo vệ môi trường, giảm thiểu hiệu ứng nhà kính. Kiểm tra giữa học kỳ II.',
      },
      {
        id: 'hdtn7-cd8-cd9-ck2',
        week: 'HKII (Tiết PPCT 85 – 105)',
        lessonName: 'Chủ đề 8: Khám phá thế giới nghề nghiệp (Tìm hiểu một số nghề hiện có ở địa phương; Dự án tìm hiểu đặc trưng nghề ở địa phương; Ngày hội trải nghiệm hướng nghiệp – Tiết 85–99); Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Kiểm tra cuối học kỳ II; Phẩm chất, năng lực của bản thân với yêu cầu của nghề ở địa phương; Tổng kết năm học – Tiết 100–105)',
        periodAllocation: 'Tiết PPCT 85 – 105',
        periodsCount: 21,
        adjustedContent:
          'YCCĐ: Nêu đặc trưng, trang thiết bị, dụng cụ, phẩm chất và năng lực cần có của người làm các nghề ở địa phương; lập và thực hiện dự án tìm hiểu đặc trưng nghề ở địa phương; chỉ ra phẩm chất và năng lực của bản thân phù hợp hoặc chưa phù hợp với yêu cầu của nghề ở địa phương. Kiểm tra cuối học kỳ II. Định hướng phát triển AI: Tích hợp AI-7.D2.1 tại Tiết 90 (Lập kế hoạch nhóm: Các tổ phân chia công việc thiết kế gian hàng giới thiệu nghề, đề xuất ứng dụng AI hỗ trợ như tạo logo, dịch thuật tài liệu quảng bá, xử lí và phân loại dữ liệu nghề ở địa phương); Tích hợp AI-7.D2.MR1 tại Tiết 104 (Thực hành sáng tạo: HS sử dụng công cụ thiết kế, trình bày văn bản hỗ trợ bởi AI như Canva Magic Write để thiết lập dàn ý và soạn thảo "Thư tự giới thiệu bản thân gửi nhà tuyển dụng giả định" một cách có trách nhiệm).',
      },
    ],
  }),
];

export const GRADE8_HDTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-hdtn-hk1',
    grade: 8,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN8-HK1',
    chapterTitle: 'HĐTN, HN 8 – Học kì I: Chủ đề 1 đến Chủ đề 5 (Em với nhà trường, Khám phá bản thân, Trách nhiệm với bản thân, Rèn luyện bản thân, Em với gia đình)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (54 tiết)',
    totalPeriods: 54,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Em với nhà trường (Tiết 1–9), Chủ đề 2: Khám phá bản thân (Tiết 10–21), Chủ đề 3: Trách nhiệm với bản thân (Tiết 22–36), Chủ đề 4: Rèn luyện bản thân (Tiết 37–51), Chủ đề 5: Em với gia đình (Tiết 52–54, phần HKI). Định hướng AI & Lồng ghép: AI 8.C5.1, 8.C5.MR1, 8.A3.3; GDQP-AN.',
    rawLessons: [
      {
        id: 'hdtn8-cd1-cd2',
        week: 'HKI (Tiết PPCT 1 – 21)',
        lessonName: 'Chủ đề 1: Em với nhà trường (Xây dựng và giữ gìn tình bạn; Phòng tránh bắt nạt học đường – Tiết 1–9); Chủ đề 2: Khám phá bản thân (Tính cách và cảm xúc của tôi; Khả năng tranh biện, thương thuyết của tôi – Tiết 10–21)',
        periodAllocation: 'Tiết PPCT 1 – 21',
        periodsCount: 21,
        adjustedContent:
          'YCCĐ: Xây dựng tình bạn, nhận diện dấu hiệu và có kĩ năng phòng, tránh bắt nạt học đường; nhận diện nét đặc trưng trong tính cách, sự thay đổi cảm xúc của bản thân và khả năng tranh biện, thương thuyết để bảo vệ quan điểm trong một số tình huống. Lồng ghép & Định hướng AI: Lồng ghép GD QP và AN tại Tiết 5 (Ý thức trách nhiệm phòng chống bạo lực học đường); Tích hợp AI 8.C5.1 & 8.C5.MR1 tại Tiết 11 (Trải nghiệm nhanh hoặc xem minh họa công cụ AI phân tích nét mặt facial recognition; so sánh cách con người nhận diện cảm xúc tự nhiên với cách AI sử dụng thị giác máy tính và thảo luận về giới hạn của AI khi cùng một nét mặt có thể biểu thị cảm xúc khác nhau tùy bối cảnh).',
      },
      {
        id: 'hdtn8-cd3-gk1',
        week: 'HKI (Tiết PPCT 22 – 36)',
        lessonName: 'Chủ đề 3: Trách nhiệm với bản thân (Trách nhiệm của HS THCS; Sống có trách nhiệm; Kĩ năng từ chối; Ôn tập & Kiểm tra giữa học kỳ I)',
        periodAllocation: 'Tiết PPCT 22 – 36',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Xác định và thể hiện trách nhiệm của bản thân với mọi người xung quanh và trong các hoạt động, thực hiện được các cam kết đề ra; nhận biết những tình huống cần từ chối và thực hiện kĩ năng từ chối trong một số tình huống cụ thể. Kiểm tra giữa học kỳ I. Lồng ghép & Định hướng AI: Lồng ghép GD QP và AN tại Tiết 23 (Sức mạnh đại đoàn kết dân tộc); Tích hợp AI 8.A3.3 tại Tiết 26 (HS ký vào "Bản cam kết học tập thời đại số": cam kết ghi rõ nguồn tham khảo và mức độ sử dụng AI khi dùng công nghệ hỗ trợ làm bài tập; ý thức trách nhiệm giải trình và tính trung thực học thuật).',
      },
      {
        id: 'hdtn8-cd4-cd5-ck1',
        week: 'HKI (Tiết PPCT 37 – 54)',
        lessonName: 'Chủ đề 4: Rèn luyện bản thân (Người tiêu dùng thông thái; Nhà kinh doanh nhỏ; Rèn luyện sự tự chủ – Tiết 37–51); Chủ đề 5: Em với gia đình – Phần HKI (Tôn trọng, thuyết phục và ứng xử làm người thân hài lòng; Ôn tập & Kiểm tra cuối học kỳ I – Tiết 52–54)',
        periodAllocation: 'Tiết PPCT 37 – 54',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Nhận ra ảnh hưởng của các yếu tố bên ngoài như tiếp thị, quảng cáo đến quyết định chi tiêu cá nhân; lập kế hoạch kinh doanh của bản thân phù hợp với lứa tuổi; thể hiện sự tự chủ trong các mối quan hệ trong đời sống và trên mạng xã hội. Kiểm tra cuối học kỳ I.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-hdtn-hk2',
    grade: 8,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN8-HK2',
    chapterTitle: 'HĐTN, HN 8 – Học kì II: Chủ đề 5 (tiếp), Chủ đề 6, 7, 8, 9 (Sống tiết kiệm, Hoạt động thiện nguyện, Phòng giảm nhẹ rủi ro thiên tai, Nghề phổ biến trong xã hội hiện đại, Định hướng học tập)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (51 tiết)',
    totalPeriods: 51,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 (tiếp: Tiết 55–60), Chủ đề 6: Em với cộng đồng (Tiết 61–69), Chủ đề 7: Em với thiên nhiên và môi trường (Tiết 70–84), Chủ đề 8: Khám phá thế giới nghề nghiệp (Tiết 85–99), Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Tiết 100–105). Định hướng NLS - AI & Lồng ghép: AI 8.D1.1, 8.D2.1, 8.A1.1, 8.A5.2; NLS 2.3, 3.4; GDQP-AN.',
    rawLessons: [
      {
        id: 'hdtn8-cd5-hk2-cd6',
        week: 'HKII (Tiết PPCT 55 – 69)',
        lessonName: 'Chủ đề 5 (tiếp): Tiết kiệm và thực hiện công việc gia đình (Tiết 55–60); Chủ đề 6: Em với cộng đồng (Tham gia các hoạt động giáo dục truyền thống; Lập và thực hiện kế hoạch hoạt động thiện nguyện; Tìm hiểu kĩ năng tìm kiếm sự hỗ trợ khi gặp khó khăn – Tiết 61–69)',
        periodAllocation: 'Tiết PPCT 55 – 69',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Thể hiện cách sống tiết kiệm, tôn trọng ý kiến khác nhau và sắp xếp công việc trong gia đình; tham gia các hoạt động giáo dục truyền thống ở địa phương; lập và thực hiện kế hoạch hoạt động thiện nguyện, biết tìm sự hỗ trợ khi gặp khó khăn. Định hướng phát triển AI: Tích hợp AI 8.D1.1 & 8.D2.1 tại Tiết 65 (Thiết kế kế hoạch dự án "Chung tay hỗ trợ trẻ em mồ côi": Thảo luận đề xuất ý tưởng ứng dụng AI đơn giản và tư duy thiết kế hệ thống thông minh nhằm tối ưu hóa việc phân chia nhân sự, dự trù vật phẩm cứu trợ hoặc xây dựng kịch bản chatbot tự động trả lời nhà hảo tâm).',
      },
      {
        id: 'hdtn8-cd7-gk2',
        week: 'HKII (Tiết PPCT 70 – 84)',
        lessonName: 'Chủ đề 7: Em với thiên nhiên và môi trường (Cảnh quan thiên nhiên quê hương tôi; Báo cáo về thiên tai và thiệt hại ở địa phương; Truyền thông về biện pháp đề phòng và giảm nhẹ rủi ro thiên tai; Ôn tập & Kiểm tra giữa học kỳ II)',
        periodAllocation: 'Tiết PPCT 70 – 84',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Thiết kế sản phẩm và tổ chức sự kiện giới thiệu vẻ đẹp danh lam thắng cảnh, cảnh quan thiên nhiên của địa phương và cách bảo tồn; sưu tầm tài liệu, viết báo cáo về thiên tai và xây dựng, thực hiện kế hoạch truyền thông cho người dân địa phương về những biện pháp đề phòng, giảm nhẹ rủi ro thiên tai. Kiểm tra giữa học kỳ II. Lồng ghép GD QP và AN: Tiết 75 (Biết được một số cột mốc biên giới, trách nhiệm bảo vệ chủ quyền của Việt Nam).',
      },
      {
        id: 'hdtn8-cd8-cd9-ck2',
        week: 'HKII (Tiết PPCT 85 – 105)',
        lessonName: 'Chủ đề 8: Khám phá thế giới nghề nghiệp (Nghề phổ biến trong xã hội hiện đại; Tác động của cuộc cách mạng 4.0 đến hoạt động nghề nghiệp; Hứng thú nghề nghiệp; Rèn luyện, học tập theo định hướng nghề nghiệp; Ôn tập & Kiểm tra cuối học kỳ II – Tiết 85–99); Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Ngày hội tư vấn hướng nghiệp; Định hướng các nhóm môn học ở THPT – Tiết 100–105)',
        periodAllocation: 'Tiết PPCT 85 – 105',
        periodsCount: 21,
        adjustedContent:
          'YCCĐ: Lập danh mục, nêu việc làm đặc trưng, trang thiết bị và thách thức của những nghề phổ biến trong xã hội hiện đại; xây dựng và thực hiện kế hoạch khảo sát hứng thú nghề nghiệp; định hướng các nhóm môn học ở THPT liên quan đến hướng nghiệp và xây dựng kế hoạch học tập hướng nghiệp. Kiểm tra cuối học kỳ II. Định hướng phát triển NLS - AI: Tích hợp AI 8.A1.1 tại Tiết 86 (Tìm hiểu nghề "Thợ cơ khí và sửa chữa xe": Thảo luận khi xe điện thông minh tích hợp AI phát triển, thợ sửa xe cần tự rèn luyện thêm kỹ năng số gì để không bị tụt hậu?); Tích hợp AI 8.A5.2 tại Tiết 92 (HS thực hành thiết kế biểu mẫu khảo sát trực tuyến "Hứng thú nghề nghiệp lớp 8" bằng Google Forms và tạo mã QR để tự động hóa quy trình khảo sát, thu thập dữ liệu nhanh chóng, khoa học); Tích hợp NLS 2.3 & 3.4 tại Tiết 95–96.',
      },
    ],
  }),
];

export const GRADE9_HDTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-hdtn-hk1',
    grade: 9,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN9-HK1',
    chapterTitle: 'HĐTN, HN 9 – Học kì I: Chủ đề 1 đến Chủ đề 5 (Em với nhà trường, Khám phá bản thân, Trách nhiệm với bản thân, Rèn luyện bản thân, Em với gia đình)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (54 tiết)',
    totalPeriods: 54,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Em với nhà trường (Tiết 1–9), Chủ đề 2: Khám phá bản thân (Tiết 10–21), Chủ đề 3: Trách nhiệm với bản thân (Tiết 22–36), Chủ đề 4: Rèn luyện bản thân (Tiết 37–51), Chủ đề 5: Em với gia đình (Tiết 52–54, phần HKI). Định hướng AI & Lồng ghép: AI 9.A3.2 (Canva AI Magic Design & Google Sheets 50/30/20); GDQP-AN.',
    rawLessons: [
      {
        id: 'hdtn9-cd1-cd2',
        week: 'HKI (Tiết PPCT 1 – 21)',
        lessonName: 'Chủ đề 1: Em với nhà trường (Tôn trọng sự khác biệt và sống hài hòa với các bạn, thầy cô; Xây dựng kế hoạch tổ chức hoạt động phòng chống bắt nạt học đường – Tiết 1–9); Chủ đề 2: Khám phá bản thân (Điểm tích cực và chưa tích cực trong hành vi giao tiếp, ứng xử; Thích nghi với sự thay đổi trong cuộc sống – Tiết 10–21)',
        periodAllocation: 'Tiết PPCT 1 – 21',
        periodsCount: 21,
        adjustedContent:
          'YCCĐ: Tôn trọng sự khác biệt và sống hài hòa với bạn bè, thầy cô; xây dựng kế hoạch tổ chức hoạt động phòng chống bắt nạt học đường; nhận diện điểm tích cực và chưa tích cực trong hành vi giao tiếp, ứng xử của bản thân và khám phá khả năng thích nghi với sự thay đổi trong cuộc sống. Định hướng phát triển AI: Tích hợp AI 9.A3.2 tại Tiết 5 (Thực hành thiết kế: HS làm việc theo nhóm, sử dụng công cụ Canva AI Magic Design nhập câu lệnh Prompt để tự động tạo một Poster tuyên truyền chống bạo lực học đường của lớp; ứng dụng công cụ thiết kế số có hỗ trợ AI để xây dựng các ấn phẩm truyền thông chống bạo lực số).',
      },
      {
        id: 'hdtn9-cd3-gk1',
        week: 'HKI (Tiết PPCT 22 – 36)',
        lessonName: 'Chủ đề 3: Trách nhiệm với bản thân (Sống có trách nhiệm với các nhiệm vụ được giao; Ôn tập & Kiểm tra giữa học kỳ I; Ứng phó với căng thẳng và áp lực học sinh lớp 9 thường gặp)',
        periodAllocation: 'Tiết PPCT 22 – 36',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Thực hiện có trách nhiệm với các nhiệm vụ được giao; ứng phó hiệu quả với những căng thẳng và áp lực trong quá trình học tập và trước những áp lực của cuộc sống. Kiểm tra giữa học kỳ I.',
      },
      {
        id: 'hdtn9-cd4-cd5-ck1',
        week: 'HKI (Tiết PPCT 37 – 54)',
        lessonName: 'Chủ đề 4: Rèn luyện bản thân (Thực hành tạo động lực cho bản thân; Xây dựng ngân sách cá nhân hợp lí; Bầu không khí vui vẻ, yêu thương trong gia đình – Tiết 37–51); Chủ đề 5: Em với gia đình – Phần HKI (Kĩ năng giải quyết bất đồng trong gia đình; Ôn tập & Kiểm tra cuối học kỳ I – Tiết 52–54)',
        periodAllocation: 'Tiết PPCT 37 – 54',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Biết cách tạo động lực cho bản thân để thực hiện hoạt động; xây dựng ngân sách cá nhân hợp lý (tính đến các khoản thu, chi, tiết kiệm, cho, tặng); tạo bầu không khí vui vẻ, yêu thương và biết giải quyết bất đồng trong quan hệ gia đình. Kiểm tra cuối học kỳ I. Lồng ghép & Định hướng AI: Lồng ghép GD QP và AN tại Tiết 43 (Ý nghĩa của việc phát triển kinh tế cá nhân, gia đình góp phần phát triển kinh tế xã hội, đảm bảo QP và AN); Tích hợp AI 9.A3.2 tại Tiết 44 (Thực hành bảng tính: HS thực hành nhập số liệu chi tiêu giả định vào biểu mẫu Google Sheets đã thiết lập sẵn công thức tự động phân bổ ngân sách theo quy tắc 50/30/20).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-hdtn-hk2',
    grade: 9,
    subject: 'Hoạt động trải nghiệm, hướng nghiệp',
    chapterCode: 'HDTN9-HK2',
    chapterTitle: 'HĐTN, HN 9 – Học kì II: Chủ đề 5 (tiếp), Chủ đề 6, 7, 8, 9 (Kinh tế gia đình, Mạng lưới quan hệ cộng đồng, Quảng bá danh lam thắng cảnh, Nghề nghiệp tương lai, Con đường sau THCS)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (51 tiết)',
    totalPeriods: 51,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 (tiếp: Tiết 55–60), Chủ đề 6: Em với cộng đồng (Tiết 61–69), Chủ đề 7: Em với thiên nhiên và môi trường (Tiết 70–84), Chủ đề 8: Khám phá thế giới nghề nghiệp (Tiết 85–93), Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Tiết 94–105). Định hướng NLS - AI & Lồng ghép: AI 9.A3.2 (Bing Image Creator), 9.C2.1 (ChatGPT tư vấn hướng nghiệp); NLS (Tạo CV điện tử/hồ sơ năng lực); GDQP-AN.',
    rawLessons: [
      {
        id: 'hdtn9-cd5-hk2-cd6',
        week: 'HKII (Tiết PPCT 55 – 69)',
        lessonName: 'Chủ đề 5 (tiếp): Tổ chức, sắp xếp khoa học công việc gia đình & Biện pháp phát triển kinh tế gia đình (Tiết 55–60); Chủ đề 6: Em với cộng đồng (Cách xây dựng mạng lưới quan hệ cộng đồng; Thực trạng giao tiếp của học sinh trên mạng xã hội; Truyền thông trong cộng đồng về những vấn đề học đường – Tiết 61–69)',
        periodAllocation: 'Tiết PPCT 55 – 69',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Tổ chức, sắp xếp các công việc trong gia đình một cách khoa học và đề xuất biện pháp phát triển kinh tế gia đình; biết cách xây dựng mạng lưới quan hệ cộng đồng; thực hiện đề tài khảo sát về thực trạng giao tiếp của học sinh trên mạng xã hội và xây dựng kế hoạch truyền thông cho cộng đồng về những vấn đề học đường.',
      },
      {
        id: 'hdtn9-cd7-gk2',
        week: 'HKII (Tiết PPCT 70 – 84)',
        lessonName: 'Chủ đề 7: Em với thiên nhiên và môi trường (Giới thiệu vẻ đẹp danh lam thắng cảnh, cảnh quan thiên nhiên của đất nước; Thiết kế công cụ khảo sát về nguyên nhân gây ô nhiễm môi trường; Ôn tập & Kiểm tra giữa học kì II; Các biện pháp phòng chống ô nhiễm, bảo vệ môi trường)',
        periodAllocation: 'Tiết PPCT 70 – 84',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Thiết kế sản phẩm và xây dựng kế hoạch quảng bá về danh lam thắng cảnh, cảnh quan thiên nhiên của đất nước; thực hiện đề tài khảo sát về nguyên nhân gây ô nhiễm môi trường (đất, nước, không khí) tại địa bàn sinh sống và tuyên truyền biện pháp bảo vệ môi trường. Kiểm tra giữa học kì II. Lồng ghép & Định hướng AI: Lồng ghép GD QP và AN tại Tiết 71 (Giới thiệu các bài hát về truyền thống QĐNDVN và CANDVN); Tích hợp AI 9.A3.2 tại Tiết 72 (Triển lãm tranh AI: HS viết Prompt mô tả vẻ đẹp thiên nhiên Việt Nam bằng tiếng Việt, ví dụ "Đầm phá Tam Giang", vào công cụ Generative AI như Bing Image Creator để hiện thực hóa ý tưởng nghệ thuật quảng bá danh thắng đất nước).',
      },
      {
        id: 'hdtn9-cd8-cd9-ck2',
        week: 'HKII (Tiết PPCT 85 – 105)',
        lessonName: 'Chủ đề 8: Khám phá thế giới nghề nghiệp (Nghề nghiệp và tương lai; Rèn luyện phẩm chất, năng lực liên quan đến nghề nghiệp – Tiết 85–93); Chủ đề 9: Hiểu bản thân – Chọn đúng nghề (Tìm hiểu hệ thống các cơ sở giáo dục nghề nghiệp; Con đường học tập, làm việc tiếp theo sau THCS; Ôn tập & Kiểm tra cuối học kì II; Tổng kết năm học – Tiết 94–105)',
        periodAllocation: 'Tiết PPCT 85 – 105',
        periodsCount: 21,
        adjustedContent:
          'YCCĐ: Kể tên, nêu hoạt động đặc trưng, trang thiết bị, phẩm chất và năng lực cần có của những nghề mà mình quan tâm; tìm hiểu hệ thống các cơ sở giáo dục nghề nghiệp của trung ương và địa phương; tham vấn ý kiến người thân, thầy cô và ra quyết định lựa chọn con đường học tập, làm việc sau THCS. Kiểm tra cuối học kì II. Định hướng phát triển NLS - AI: Tích hợp NLS tại Tiết 86 & 89 (Duyệt, tìm kiếm và lọc dữ liệu, thông tin số: HS tra cứu yêu cầu, triển vọng của 1 nghề; tạo CV điện tử/hồ sơ năng lực; dùng ứng dụng lập kế hoạch thời gian học tập); Tích hợp AI 9.C2.1 tại Tiết 98 (Tham vấn hướng nghiệp: HS viết một đoạn Prompt mô tả chi tiết sở thích, học lực các môn và tính cách của bản thân, yêu cầu ChatGPT đóng vai chuyên gia hướng nghiệp gợi ý lựa chọn trường THPT hoặc trường nghề phù hợp, vận dụng AI tạo sinh như trợ lý tư vấn định hướng cá nhân hóa lộ trình sau THCS).',
      },
    ],
  }),
];

export const THCS_KHXH_CURRICULUM_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE6_NGU_VAN_TOPICS_2026,
  ...GRADE7_NGU_VAN_TOPICS_2026,
  ...GRADE8_NGU_VAN_TOPICS_2026,
  ...GRADE9_NGU_VAN_TOPICS_2026,
  ...GRADE6_LS_DL_TOPICS_2026,
  ...GRADE7_LS_DL_TOPICS_2026,
  ...GRADE8_LS_DL_TOPICS_2026,
  ...GRADE9_LS_DL_TOPICS_2026,
  ...GRADE6_GDCD_TOPICS_2026,
  ...GRADE7_GDCD_TOPICS_2026,
  ...GRADE8_GDCD_TOPICS_2026,
  ...GRADE9_GDCD_TOPICS_2026,
  ...GRADE6_HDTN_TOPICS_2026,
  ...GRADE7_HDTN_TOPICS_2026,
  ...GRADE8_HDTN_TOPICS_2026,
  ...GRADE9_HDTN_TOPICS_2026,
  ...THCS_KHXH_GDDP_AND_NGHE_THUAT_TOPICS_2026,
];


