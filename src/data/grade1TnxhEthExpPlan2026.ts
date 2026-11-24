import { CurriculumTopic } from '../types/domain';
import { buildGrade1Topic } from './grade1TvAndMathPlan2026';

/**
 * 3. MÔN TỰ NHIÊN VÀ XÃ HỘI LỚP 1 (70 TIẾT / 35 TUẦN – 2 TIẾT/TUẦN)
 * HKI: 18 tuần x 2 tiết/tuần = 36 tiết (Chủ đề 1: Gia đình; Chủ đề 2: Trường học; Chủ đề 3: Cộng đồng địa phương; Chủ đề 4: Thực vật và động vật)
 * HKII: 17 tuần x 2 tiết/tuần = 34 tiết (Chủ đề 4 tiếp; Chủ đề 5: Con người và sức khỏe; Chủ đề 6: Trái đất và bầu trời)
 */
export const GRADE1_TNXH_TOPICS: CurriculumTopic[] = [
  buildGrade1Topic({
    id: 'nda-2026-g1-tnxh-cd1-2',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 11',
    totalPeriods: 22,
    chapterCode: 'TNXH1-CĐ1-2',
    chapterTitle: 'Chủ đề 1 & 2: Gia đình (11 tiết) – Trường học (11 tiết) (Bài 1 – Bài 9)',
    topicTitle: 'Kể về gia đình; Ngôi nhà của em; Đồ dùng trong nhà; An toàn khi sử dụng đồ dùng trong nhà; Lớp học của em; Cùng khám phá trường học; Cùng vui ở trường',
    adjustedContentSummary:
      'Giới thiệu các thành viên trong gia đình, ngôi nhà và cách sử dụng đồ dùng trong nhà an toàn; khám phá lớp học, trường học và vui chơi an toàn ở trường. Tích hợp QCN, Tiết kiệm nguồn nước, NLS (4.1.CB1b, 4.2.CB1a), AI (1.C1.2).',
    lessons: [
      {
        week: '1–2',
        lessonName: 'Bài 1: Kể về gia đình & Bài 2: Ngôi nhà của em',
        subLessonName: 'Bài 1 (Tiết 1, 2) | Bài 2 (Tiết 3, 4)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD Quyền con người (QCN): Quyền được sum họp với gia đình, quyền được lắng nghe ý kiến, quyền có nơi ở an toàn; đồng thời hiểu bổn phận chia sẻ, phụ giúp việc nhà, giữ gìn ngôi nhà.',
      },
      {
        week: '3–6',
        lessonName: 'Bài 3: Đồ dùng trong nhà; Bài 4: An toàn khi sử dụng đồ dùng trong nhà & Bài 5: Ôn tập chủ đề Gia đình',
        subLessonName: 'Bài 3 (Tiết 5, 6) | Bài 4 (Tiết 7, 8) | Bài 5 (Tiết 9, 10, 11)',
        periodAllocation: '7 tiết',
        periodsCount: 7,
        adjustedContent:
          'Tích hợp tiết kiệm và bảo vệ nguồn nước: Sử dụng nước tiết kiệm, khóa vòi nước sau khi dùng. Tích hợp KNS & NLS 4.1.CB1b: Không nghịch ổ điện, bếp, dao kéo; nhận biết nguy cơ khi chạm vào ổ điện, dây sạc hoặc thiết bị điện tử đang cắm điện và báo người lớn hỗ trợ.',
      },
      {
        week: '6–7',
        lessonName: 'Bài 6: Lớp học của em',
        subLessonName: 'Tiết 12, 13, 14',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Giáo dục HS biết yêu thích học tập, tôn trọng cô giáo và hợp tác với bạn bè trong lớp.',
      },
      {
        week: '8–9',
        lessonName: 'Bài 7: Cùng khám phá trường học',
        subLessonName: 'Tiết 15, 16, 17',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI 1.C1.2: Nhận biết các thiết bị AI có các bộ phận giống con người (camera là "mắt", micro là "tai"). Tích hợp NLS 4.1.CB1b: Phân biệt rủi ro đơn giản khi sử dụng đồ dùng, thiết bị số ở trường; biết sử dụng cẩn thận và nhờ giáo viên hỗ trợ.',
      },
      {
        week: '9–11',
        lessonName: 'Bài 8: Cùng vui ở trường & Bài 9: Ôn tập chủ đề Trường học',
        subLessonName: 'Bài 8 (Tiết 18, 19) | Bài 9 (Tiết 20, 21, 22)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp quyền con người (QCN): Trẻ em có quyền được vui chơi, giải trí trong môi trường an toàn, thân thiện. Tích hợp NLS 4.2.CB1a: Biết thông tin cá nhân (tên, lớp, ảnh cá nhân, số điện thoại) không chia sẻ cho người lạ qua điện thoại, tin nhắn, Zalo.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-tnxh-cd3-4',
    subject: 'Tự nhiên và Xã hội',
    semester: 'CA_NAM',
    weekRange: 'Tuần 12 – Tuần 23',
    totalPeriods: 24,
    chapterCode: 'TNXH1-CĐ3-4',
    chapterTitle: 'Chủ đề 3 & 4: Cộng đồng địa phương (11 tiết) – Thực vật và động vật (13 tiết) (Bài 10 – Bài 19)',
    topicTitle: 'Cùng khám phá quang cảnh xung quanh; Con người nơi em sống; Vui đón Tết; An toàn trên đường; Cây xung quanh em; Chăm sóc và bảo vệ cây trồng; Con vật quanh em; Chăm sóc và bảo vệ vật nuôi',
    adjustedContentSummary:
      'Nhận biết quang cảnh, công việc của người dân địa phương, phong tục Tết và an toàn giao thông; nhận diện các bộ phận của cây, con vật và cách chăm sóc, bảo vệ. Tích hợp GDĐP TP Huế, QPAN, QCN, Phòng tránh bom mìn, ATGT, BVMT, NLS (1.1.CB1a), AI (1.D1.1).',
    lessons: [
      {
        week: '12–14',
        lessonName: 'Bài 10: Cùng khám phá quang cảnh xung quanh; Bài 11: Con người nơi em sống & Bài 12: Vui đón Tết',
        subLessonName: 'Bài 10 (Tiết 23, 24) | Bài 11 (Tiết 25, 26) | Bài 12 (Tiết 27, 28)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp giáo dục địa phương (GDĐP): Biết nơi mình đang sinh sống thuộc vùng nào ở quê hương TP Huế. Tích hợp QPAN: Quý trọng những người giữ gìn an ninh, trật tự nơi em sống (công an, dân quân, bảo vệ dân phố). Tích hợp QCN: Quyền tham gia các hoạt động văn hóa truyền thống và tôn trọng phong tục, tập quán.',
      },
      {
        week: '15–17',
        lessonName: 'Bài 13: An toàn trên đường; Bài 14: Ôn tập chủ đề Cộng đồng địa phương & Ôn tập cuối kì I',
        subLessonName: 'Bài 13 (Tiết 29, 30) | Bài 14 (Tiết 31, 32) | Ôn tập cuối kì 1 (Tiết 33)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp Giáo dục phòng tránh tai nạn bom mìn bền vững: Không lại gần, tiếp xúc với vật lạ; không đi vào đường có cảnh báo nguy hiểm. Tích hợp ATGT: Phòng tránh tai nạn giao thông trên đường đến trường.',
      },
      {
        week: '17–19',
        lessonName: 'Bài 15: Cây xung quanh em & Bài 16: Chăm sóc và bảo vệ cây trồng',
        subLessonName: 'Bài 15 (Tiết 34, 35, 36) | Bài 16 (Tiết 37, 38)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp tiết kiệm và bảo vệ nguồn nước, BVMT: Biết tưới cây vừa đủ, không lãng phí nước; không bẻ cành, hái lá, biết chăm sóc cây xanh. Tích hợp NLS 1.1.CB1a: Xác định thông tin cần tìm về cây có gai/có độc để nêu lưu ý an toàn khi tiếp xúc.',
      },
      {
        week: '20–23',
        lessonName: 'Bài 17: Con vật quanh em; Bài 18: Chăm sóc và bảo vệ vật nuôi & Bài 19: Ôn tập chủ đề Thực vật và động vật',
        subLessonName: 'Bài 17 (Tiết 39, 40, 41) | Bài 18 (Tiết 42, 43) | Bài 19 (Tiết 44, 45, 46)',
        periodAllocation: '8 tiết',
        periodsCount: 8,
        adjustedContent:
          'Tích hợp AI 1.D1.1: Nêu được ví dụ về tình huống AI "học" từ hình ảnh hoặc thông tin (AI học nhận biết con mèo, quả táo... qua Google Lens) để giúp con người phân loại động vật nhanh chóng. Tích hợp BVMT & Tiết kiệm nguồn nước.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-tnxh-cd5-6',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK2',
    weekRange: 'Tuần 24 – Tuần 35',
    totalPeriods: 24,
    chapterCode: 'TNXH1-CĐ5-6',
    chapterTitle: 'Chủ đề 5 & 6: Con người và sức khỏe (15 tiết) – Trái đất và bầu trời (9 tiết) (Bài 20 – Bài 28)',
    topicTitle: 'Cơ thể em; Các giác quan của cơ thể; Ăn, uống hằng ngày; Vận động và nghỉ ngơi; Tự bảo vệ mình; Cùng khám phá bầu trời; Thời tiết luôn thay đổi; Ôn tập cuối kì II',
    adjustedContentSummary:
      'Nhận biết các bộ phận bên ngoài cơ thể, 5 giác quan, cách ăn uống, vận động hợp lí và tự bảo vệ bản thân; quan sát bầu trời ban ngày, ban đêm và sự thay đổi thời tiết. Tích hợp AI (1.C1.2, 1.B1.1), QCN, NLS (4.1.CB1b, 4.3.CB1a, 2.1.CB1a), Chăm sóc mắt & phòng chống mù lòa.',
    lessons: [
      {
        week: '24–26',
        lessonName: 'Bài 20: Cơ thể em & Bài 21: Các giác quan của cơ thể',
        subLessonName: 'Bài 20 (Tiết 47, 48, 49) | Bài 21 (Tiết 50, 51, 52)',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp AI 1.C1.2: Nhận biết các thiết bị AI có bộ phận mô phỏng con người (so sánh tay mình và cánh tay robot). Tích hợp QCN: Trân trọng cơ thể và sự khác biệt. Tích hợp NLS 4.1.CB1b & Chăm sóc mắt, phòng chống mù lòa: Bảo vệ mắt, tai khi sử dụng thiết bị số (không nhìn màn hình quá gần, không nghe âm thanh quá to).',
      },
      {
        week: '27–28',
        lessonName: 'Bài 22: Ăn, uống hằng ngày & Bài 23: Vận động và nghỉ ngơi',
        subLessonName: 'Bài 22 (Tiết 53, 54) | Bài 23 (Tiết 55, 56)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp quyền con người (QCN): Trẻ em có quyền được ăn uống đủ chất, an toàn và chăm sóc sức khỏe. Tích hợp NLS 4.3.CB1a: Không tin ngay quảng cáo đồ ăn, thức uống trên mạng; khi thấy thông tin lạ phải hỏi cha mẹ, thầy cô trước khi làm theo.',
      },
      {
        week: '29–31',
        lessonName: 'Bài 24: Tự bảo vệ mình & Bài 25: Ôn tập chủ đề Con người và sức khỏe',
        subLessonName: 'Bài 24 (Tiết 57, 58) | Bài 25 (Tiết 59, 60, 61)',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp AI 1.B1.1: Nhận biết việc người lạ dùng AI giả mạo hình ảnh/giọng nói người thân là hành vi xấu, cần cảnh giác và hỏi ý kiến cha mẹ. Tích hợp Quyền con người (QCN): Trẻ em có quyền được bảo vệ khỏi bạo lực, bỏ rơi, bắt cóc, xâm hại.',
      },
      {
        week: '31–35',
        lessonName: 'Bài 26: Cùng khám phá bầu trời; Bài 27: Thời tiết luôn thay đổi; Bài 28: Ôn tập chủ đề Trái đất và bầu trời & Ôn tập cuối kì II',
        subLessonName: 'Bài 26 (Tiết 62–64) | Bài 27 (Tiết 65–67) | Bài 28 (Tiết 68–69) | Ôn tập cuối kì 2 (Tiết 70)',
        periodAllocation: '9 tiết',
        periodsCount: 9,
        adjustedContent:
          'Tích hợp NLS 2.1.CB1a & 4.1.CB1b: Lựa chọn hình ảnh bầu trời/phiếu quan sát để trao đổi an toàn; biết bảo vệ thiết bị số khi xem dự báo thời tiết (không dùng điện thoại/máy tính bảng khi tay ướt, khi trời mưa to, sấm sét). Tích hợp KNS: Quan sát thời tiết để chọn trang phục phù hợp bảo vệ sức khỏe.',
      },
    ],
  }),
];

/**
 * 4. MÔN ĐẠO ĐỨC LỚP 1 (35 TIẾT / 35 TUẦN – 1 TIẾT/TUẦN)
 * HKI: 18 tiết / 18 tuần (Chủ đề 1–5, Bài 1–15 + Thực hành kĩ năng giữa HKI & Đánh giá cuối HKI)
 * HKII: 17 tiết / 17 tuần (Chủ đề 5 tiếp – Chủ đề 8, Bài 16–30 + Thực hành kĩ năng giữa HKII & Đánh giá cuối HKII)
 */
export const GRADE1_DAO_DUC_TOPICS: CurriculumTopic[] = [
  buildGrade1Topic({
    id: 'nda-2026-g1-dd-hk1',
    subject: 'Đạo đức',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'ĐĐ1-HK1',
    chapterTitle: 'Chủ đề 1, 2, 3, 4 & 5: Tự chăm sóc bản thân – Yêu thương gia đình – Quan tâm, chăm sóc người thân – Thực hiện nội quy trường, lớp – Sinh hoạt nền nếp (Bài 1 – Bài 15)',
    topicTitle: 'Em giữ sạch đôi tay, răng miệng, tắm gội, trang phục; Gia đình của em; Lễ phép, vâng lời, quan tâm ông bà, cha mẹ, em nhỏ; Đi học đúng giờ, học bài đầy đủ, giữ trật tự, giữ gìn tài sản, vệ sinh trường lớp; Gọn gàng, ngăn nắp',
    adjustedContentSummary:
      'Hình thành thói quen tự chăm sóc vệ sinh cá nhân; lễ phép, yêu thương ông bà, cha mẹ, anh chị em; thực hiện nghiêm túc nội quy trường, lớp và sống gọn gàng, ngăn nắp. Tích hợp QCN, AI (1.A2.2), BVMT & Tiết kiệm nguồn nước, LTCM - đạo đức - lối sống.',
    lessons: [
      {
        week: '1–4',
        lessonName: 'Chủ đề 1: Tự chăm sóc bản thân (Bài 1 – Bài 4)',
        subLessonName: 'Bài 1: Em giữ sạch đôi tay (T1) | Bài 2: Em giữ sạch răng miệng (T2) | Bài 3: Em tắm, gội sạch sẽ (T3) | Bài 4: Em giữ trang phục gọn gàng, sạch sẽ (T4)',
        periodAllocation: '4 tiết (Tiết 1–4)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp GD Quyền con người (QCN): Bổn phận trẻ em đối với bản thân – tự giác rửa tay sạch sẽ, bảo vệ sức khỏe của chính mình. Tích hợp GD LTCM, ĐĐ, KNS: Rèn kĩ năng tự phục vụ.',
      },
      {
        week: '5–11',
        lessonName: 'Chủ đề 2 & 3: Yêu thương gia đình – Quan tâm, chăm sóc người thân trong gia đình (Bài 5 – Bài 9 & Thực hành kĩ năng giữa HKI)',
        subLessonName: 'Bài 5: Gia đình của em (2t) | Bài 6: Lễ phép, vâng lời (1t) | Bài 7: Quan tâm, chăm sóc ông bà (1t) | Thực hành kĩ năng giữa HKI (1t) | Bài 8: Quan tâm, chăm sóc cha mẹ (1t) | Bài 9: Chăm sóc, giúp đỡ em nhỏ (1t)',
        periodAllocation: '7 tiết (Tiết 5–11)',
        periodsCount: 7,
        adjustedContent:
          'Tích hợp GD Quyền con người (QCN) & LTCM, ĐĐ, LS: Bổn phận của trẻ em đối với gia đình – yêu thương, kính trọng, hiếu thảo, vâng lời ông bà, cha mẹ và chăm sóc, nhường nhịn em nhỏ.',
      },
      {
        week: '12–16',
        lessonName: 'Chủ đề 4: Thực hiện nội quy trường, lớp (Bài 10 – Bài 14)',
        subLessonName: 'Bài 10: Đi học đúng giờ (1t) | Bài 11: Học bài và làm bài đầy đủ (1t) | Bài 12: Giữ trật tự trong trường, lớp (1t) | Bài 13: Giữ gìn tài sản của trường, lớp (1t) | Bài 14: Giữ vệ sinh trường, lớp (1t)',
        periodAllocation: '5 tiết (Tiết 12–16)',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp AI 1.A2.2: Nhận biết đồng hồ thông minh hoặc trợ lý ảo có thể nhắc giờ đến lớp, từ đó hình thành thói quen đi học đúng giờ và không phụ thuộc vào thiết bị. Tích hợp LTCM, ĐĐ, LS & Tiết kiệm nguồn nước, BVMT: Giữ trật tự và giữ vệ sinh trường, lớp.',
      },
      {
        week: '17–18',
        lessonName: 'Bài 15: Gọn gàng, ngăn nắp & Ôn tập - Đánh giá cuối Học kì I',
        subLessonName: 'Bài 15: Gọn gàng, ngăn nắp (Tiết 17) | Ôn tập - Đánh giá cuối HK 1 (Tiết 18)',
        periodAllocation: '2 tiết (Tiết 17–18)',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Hình thành thói quen sống gọn gàng, ngăn nắp, có trách nhiệm với bản thân và tập thể; đánh giá cuối học kì I.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-dd-hk2',
    subject: 'Đạo đức',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'ĐĐ1-HK2',
    chapterTitle: 'Chủ đề 5 (tiếp), 6, 7 & 8: Sinh hoạt nền nếp – Tự giác làm việc của mình – Thật thà – Phòng, tránh tai nạn, thương tích (Bài 16 – Bài 30)',
    topicTitle: 'Học tập, sinh hoạt đúng giờ; Tự giác học tập, tham gia hoạt động ở trường, làm việc nhà; Không nói dối, không tự ý lấy đồ người khác, nhặt được của rơi trả lại, biết nhận lỗi; Phòng tránh tai nạn giao thông, đuối nước, bỏng, ngã, điện giật, ngộ độc thực phẩm, xâm hại',
    adjustedContentSummary:
      'Rèn luyện tính tự giác, đức tính thật thà và kĩ năng phòng, tránh các tai nạn thương tích thường gặp. Tích hợp NLS (5.2.CB1a, 2.3.CB1a, 4.1.CB1b), ATGT, PCCC-CNCH, QCN.',
    lessons: [
      {
        week: '19–22',
        lessonName: 'Bài 16: Học tập, sinh hoạt đúng giờ & Chủ đề 6: Tự giác làm việc của mình (Bài 17 – Bài 19)',
        subLessonName: 'Bài 16: Học tập, sinh hoạt đúng giờ (T19) | Bài 17: Tự giác học tập (T20) | Bài 18: Tự giác tham gia hoạt động ở trường (T21) | Bài 19: Tự giác làm việc nhà (T22)',
        periodAllocation: '4 tiết (Tiết 19–22)',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 5.2.CB1a: Xác định nhu cầu cá nhân và sử dụng công cụ số đơn giản dưới sự hướng dẫn của người lớn để trình bày thời gian biểu học tập, sinh hoạt đúng giờ.',
      },
      {
        week: '23–27',
        lessonName: 'Chủ đề 7: Thật thà (Bài 20 – Bài 23 & Thực hành kĩ năng giữa HKII)',
        subLessonName: 'Bài 20: Không nói dối (T23) | Bài 21: Không tự ý lấy đồ của người khác (T24) | Bài 22: Nhặt được của rơi trả lại người đánh mất (T25) | Bài 23: Biết nhận lỗi (T26) | Thực hành kĩ năng giữa HK 2 (T27)',
        periodAllocation: '5 tiết (Tiết 23–27)',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp NLS 2.3.CB1a: Giao tiếp, hợp tác trong môi trường số; biết nói thật, không gửi thông tin sai sự thật trong nhóm học tập. Tích hợp LTCM, ĐĐ, LS: Đức tính trung thực, dũng cảm nhận lỗi.',
      },
      {
        week: '28–35',
        lessonName: 'Chủ đề 8: Phòng, tránh tai nạn, thương tích (Bài 24 – Bài 30 & Ôn tập - Đánh giá cuối HKII)',
        subLessonName: 'Bài 24: Tai nạn giao thông (T28) | Bài 25: Đuối nước (T29) | Bài 26: Bỏng (T30) | Bài 27: Ngã (T31) | Bài 28: Điện giật (T32) | Bài 29: Ngộ độc thực phẩm (T33) | Bài 30: Xâm hại (T34) | Ôn tập - ĐG cuối HK 2 (T35)',
        periodAllocation: '8 tiết (Tiết 28–35)',
        periodsCount: 8,
        adjustedContent:
          'Tích hợp ATGT (ngồi an toàn trên phương tiện giao thông), kĩ năng PCCC & CNCH (phòng tránh cháy nổ, bỏng), NLS 4.1.CB1b (nhận diện ổ cắm hở, dây sạc hỏng, không chạm tay ướt vào thiết bị đang cắm điện) và Quyền con người (QCN: quyền được bảo vệ thân thể, danh dự, nhân phẩm, phòng tránh xâm hại).',
      },
    ],
  }),
];

/**
 * 5. MÔN HOẠT ĐỘNG TRẢI NGHIỆM LỚP 1 (105 TIẾT / 35 TUẦN – 3 TIẾT/TUẦN)
 * HKI: 18 tuần x 3 tiết/tuần = 54 tiết (Chủ đề 1–5, Bài 1–12)
 * HKII: 17 tuần x 3 tiết/tuần = 51 tiết (Chủ đề 5 tiếp – Chủ đề 9, Bài 13–21)
 */
export const GRADE1_HDTN_TOPICS: CurriculumTopic[] = [
  buildGrade1Topic({
    id: 'nda-2026-g1-hdtn-hk1',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 54,
    chapterCode: 'HĐTN1-HK1',
    chapterTitle: 'Chủ đề 1, 2, 3, 4 & 5: Chào năm học mới – Em biết yêu thương – Truyền thống trường em – An toàn cho em – Em quý trọng bản thân (Bài 1 – Bài 12)',
    topicTitle: 'Làm quen với bạn mới; Những việc nên làm trong giờ học, giờ chơi; Cảm xúc của em; Yêu thương con người; Thân thiện với bạn bè; Thực hiện 5 điều Bác Hồ dạy; Kính yêu thầy cô; An toàn khi vui chơi; Phòng tránh bị bắt nạt; Sử dụng đồ dùng an toàn; Chân dung của em; Giữ vệ sinh cá nhân',
    adjustedContentSummary:
      'Làm quen bạn mới và nội quy trường lớp; nhận diện cảm xúc và biết yêu thương, chia sẻ; thực hiện 5 điều Bác Hồ dạy, kính yêu thầy cô; phòng tránh bị bắt nạt và giữ an toàn, vệ sinh cá nhân. Tích hợp NLS (2.3.CB1a, 2.5.CB1a, 4.1.CB1b, 4.2.CB1a), AI (1.A1.1), QCN, QPAN, Tiết kiệm nguồn nước.',
    lessons: [
      {
        week: '1–4',
        lessonName: 'Chủ đề 1: Chào năm học mới (Bài 1: Làm quen với bạn mới & Bài 2: Những việc nên làm trong giờ học, giờ chơi)',
        subLessonName: 'SHDC: Lễ Khai giảng, Nội quy nhà trường, Nói lời hay - làm việc tốt, Vui Trung thu | HĐGĐTCĐ: Bài 1 & Bài 2 | SHL: Sơ kết tuần, Làm quen Sao Nhi đồng',
        periodAllocation: '12 tiết (Tiết 1–12)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp NLS 2.3.CB1a: Biết chào hỏi, giới thiệu bản thân lịch sự khi tham gia nhóm lớp trực tuyến. Tích hợp GD đạo đức, lối sống & Quyền con người (QCN): Quyền được học tập, vui chơi trong môi trường an toàn và bổn phận tôn trọng nội quy lớp học.',
      },
      {
        week: '5–8',
        lessonName: 'Chủ đề 2: Em biết yêu thương (Bài 3: Cảm xúc của em & Bài 4: Yêu thương con người)',
        subLessonName: 'SHDC: Sao Nhi đồng chăm ngoan, Hoạt động nhân đạo, Chào mừng 20/10 | HĐGĐTCĐ: Bài 3 & Bài 4 | SHL: Chia sẻ cảm xúc, Giúp bạn khó khăn',
        periodAllocation: '12 tiết (Tiết 13–24)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp AI 1.A1.1: HS nhận biết con người có cảm xúc thật; biểu tượng cảm xúc, robot hoặc máy tính chỉ mô phỏng cảm xúc theo hình ảnh hoặc dữ liệu do con người tạo ra. Tích hợp QCN & LTCM, ĐĐ, LS: Quan tâm, chia sẻ, giúp đỡ bạn bè và người có hoàn cảnh khó khăn.',
      },
      {
        week: '9–12',
        lessonName: 'Chủ đề 3: Truyền thống trường em (Bài 5: Thân thiện với bạn bè; Bài 6: Thực hiện Năm điều Bác Hồ dạy & Bài 7: Kính yêu thầy cô)',
        subLessonName: 'SHDC: Truyền thống nhà trường, Thi đua 5 điều Bác Hồ dạy, Chào mừng 20/11 | HĐGĐTCĐ: Bài 5, 6, 7 | SHL: Góc tri ân thầy cô',
        periodAllocation: '12 tiết (Tiết 25–36)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp NLS 2.5.CB1a: Dùng lời chào, lời nhắn lịch sự trong nhóm lớp. Tích hợp QPAN & LTCM, ĐĐ, LS: Rèn luyện theo Năm điều Bác Hồ dạy và bồi dưỡng truyền thống tôn sư trọng đạo nhân ngày 20/11.',
      },
      {
        week: '13–16',
        lessonName: 'Chủ đề 4: An toàn cho em (Bài 8: An toàn khi vui chơi; Bài 9: Phòng tránh bị bắt nạt & Bài 10: Sử dụng đồ dùng an toàn trong gia đình)',
        subLessonName: 'SHDC: Quyền và bổn phận trẻ em, Chào mừng 22/12, Phòng chống bạo lực học đường | HĐGĐTCĐ: Bài 8, 9, 10 | SHL: Cam kết lớp học thân thiện',
        periodAllocation: '12 tiết (Tiết 37–48)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp KNS & QCN: Nhận diện trò chơi an toàn, quyền từ chối trò chơi nguy hiểm. Tích hợp NLS 4.1.CB1b: Nhận biết việc bị trêu chọc, đe dọa qua thiết bị số là không an toàn, biết báo người lớn tin cậy; nhận biết rủi ro khi tự ý dùng thiết bị điện tử, dây sạc, ổ cắm.',
      },
      {
        week: '17–18',
        lessonName: 'Chủ đề 5 (Phần 1): Em quý trọng bản thân (Bài 11: Chân dung của em & Bài 12: Giữ vệ sinh cá nhân)',
        subLessonName: 'SHDC: Giao lưu "Nét đẹp tuổi thơ", Ngày hội vì sức khỏe học đường | HĐGĐTCĐ: Bài 11 & Bài 12 | SHL: Sơ kết Học kì I',
        periodAllocation: '6 tiết (Tiết 49–54)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp NLS 4.2.CB1a: Bảo vệ dữ liệu cá nhân đơn giản (không tự ý chia sẻ ảnh chân dung, tên đầy đủ, địa chỉ, số điện thoại cho người lạ trên môi trường số). Tích hợp tiết kiệm và bảo vệ nguồn nước: Dùng nước vừa đủ khi rửa tay, rửa mặt, khóa vòi sau khi dùng.',
      },
    ],
  }),
  buildGrade1Topic({
    id: 'nda-2026-g1-hdtn-hk2',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 51,
    chapterCode: 'HĐTN1-HK2',
    chapterTitle: 'Chủ đề 5 (tiếp), 6, 7, 8 & 9: Em quý trọng bản thân – Vui đón mùa xuân – Tham gia hoạt động cộng đồng – Quê hương tươi đẹp – Em bảo vệ môi trường (Bài 13 – Bài 21)',
    topicTitle: 'Ăn uống hợp lí; Sử dụng trang phục hằng ngày; Sắp xếp nhà cửa gọn gàng đón Tết; Ứng xử khi nhận quà ngày Tết; Hàng xóm nhà em; Em tham gia hoạt động xã hội; Thiên nhiên tươi đẹp quê em; Em bảo vệ cảnh quan thiên nhiên; Giữ gìn môi trường sạch, đẹp',
    adjustedContentSummary:
      'Rèn thói quen ăn uống hợp lí, mặc trang phục phù hợp; đón Tết văn minh; quan tâm hàng xóm và tham gia hoạt động xã hội; yêu quý thiên nhiên quê hương và phân loại rác bảo vệ môi trường. Tích hợp NLS (4.3.CB1a, 2.5.CB1a, 1.1.CB1a, 3.1.CB1a, 2.2.CB1a), AI (1.D2.1), GDĐP Huế, BVMT & Tiết kiệm nguồn nước.',
    lessons: [
      {
        week: '19–20',
        lessonName: 'Chủ đề 5 (Phần 2): Bài 13: Ăn uống hợp lí & Bài 14: Sử dụng trang phục hằng ngày',
        subLessonName: 'SHDC: Vệ sinh an toàn thực phẩm, Ngày hội trình diễn thời trang | HĐGĐTCĐ: Bài 13 & Bài 14 | SHL: Chia sẻ thói quen ăn uống, trang phục',
        periodAllocation: '6 tiết (Tiết 55–60)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp NLS 4.3.CB1a: Quan sát hình ảnh/video về thực phẩm lành mạnh; không tin ngay quảng cáo đồ ăn, thức uống không rõ nguồn gốc trên mạng. Tích hợp KNS: Chọn quần áo phù hợp thời tiết.',
      },
      {
        week: '21–24',
        lessonName: 'Chủ đề 6: Vui đón mùa xuân (Bài 15: Sắp xếp nhà cửa gọn gàng đón Tết & Bài 16: Ứng xử khi được nhận quà ngày Tết)',
        subLessonName: 'SHDC: Ủng hộ "Tết yêu thương", Hội chợ xuân, Đón Tết cổ truyền | HĐGĐTCĐ: Bài 15 & Bài 16 | SHL: Kể việc đón Tết, chúc Tết',
        periodAllocation: '12 tiết (Tiết 61–72)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp tiết kiệm và BV nguồn nước, BVMT: Sử dụng đồ trang trí Tết hợp lí, không lãng phí giấy, túi, nước, điện. Tích hợp NLS 2.5.CB1a: Biết gửi lời cảm ơn lịch sự qua điện thoại, tin nhắn, ghi âm trên Zalo khi nhận quà và chúc Tết người thân.',
      },
      {
        week: '25–28',
        lessonName: 'Chủ đề 7: Tham gia hoạt động cộng đồng (Bài 17: Hàng xóm nhà em & Bài 18: Em tham gia các hoạt động xã hội)',
        subLessonName: 'SHDC: Chào mừng 8/3, Em làm kế hoạch nhỏ, Nuôi heo đất - Giúp bạn đến trường | HĐGĐTCĐ: Bài 17 & Bài 18 | SHL: Chia sẻ việc làm tốt',
        periodAllocation: '12 tiết (Tiết 73–84)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp QCN & GDĐP: Tôn trọng hàng xóm, giới thiệu sơ lược về những người hàng xóm, láng giềng của mình. Tích hợp LTCM, ĐĐ, LS: Tham gia phong trào Kế hoạch nhỏ, Nuôi heo đất giúp bạn đến trường.',
      },
      {
        week: '29–32',
        lessonName: 'Chủ đề 8: Quê hương tươi đẹp (Bài 19: Thiên nhiên tươi đẹp quê em & Bài 20: Em bảo vệ cảnh quan thiên nhiên)',
        subLessonName: 'SHDC: Chăm sóc vườn cây, Em tập làm hướng dẫn viên du lịch, Ngày hội sách | HĐGĐTCĐ: Bài 19 & Bài 20 | SHL: Bảo vệ cảnh quan thiên nhiên',
        periodAllocation: '12 tiết (Tiết 85–96)',
        periodsCount: 12,
        adjustedContent:
          'Tích hợp NLS 1.1.CB1a, 3.1.CB1a & 2.2.CB1a: Tìm hiểu cảnh đẹp quê hương qua hình ảnh/video; tạo thông điệp ngắn bảo vệ cảnh quan; chia sẻ hình ảnh chăm sóc cây, nhặt rác qua Padlet/Zalo nhóm lớp an toàn. Tích hợp GDĐP & BVMT.',
      },
      {
        week: '33–35',
        lessonName: 'Chủ đề 9: Em bảo vệ môi trường (Bài 21: Giữ gìn môi trường sạch, đẹp & Tổng kết năm học)',
        subLessonName: 'SHDC: Thân thiện với môi trường, Mừng Sinh nhật Bác Hồ 19/5, Lễ Tổng kết năm học | HĐGĐTCĐ: Bài 21 (Tiết 1, 2, 3) | SHL: Tổng kết năm học',
        periodAllocation: '9 tiết (Tiết 97–105)',
        periodsCount: 9,
        adjustedContent:
          'Tích hợp AI 1.D2.1: HS nhận biết máy thông minh có thể nhận diện, phân loại hình ảnh; quan sát GV minh họa nhận diện rác giấy, chai nhựa, lá cây và thảo luận cách bỏ rác đúng nơi quy định. Tích hợp tiết kiệm và bảo vệ nguồn nước, BVMT.',
      },
    ],
  }),
];
