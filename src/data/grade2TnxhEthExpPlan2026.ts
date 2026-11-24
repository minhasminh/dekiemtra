import { CurriculumTopic } from '../types/domain';
import { buildGrade2Topic } from './grade2TvAndMathPlan2026';

/**
 * 3. MÔN TỰ NHIÊN VÀ XÃ HỘI LỚP 2 (70 TIẾT / 35 TUẦN – 2 TIẾT/TUẦN)
 * HKI: 18 tuần = 36 tiết (Chủ đề 1: Gia đình; Chủ đề 2: Trường học; Chủ đề 3: Cộng đồng địa phương; Chủ đề 4: Thực vật và động vật)
 * HKII: 17 tuần = 34 tiết (Chủ đề 4 tiếp; Chủ đề 5: Con người và sức khỏe; Chủ đề 6: Trái đất và bầu trời)
 */
export const GRADE2_TNXH_TOPICS: CurriculumTopic[] = [
  buildGrade2Topic({
    id: 'nda-2026-g2-tnxh-cd1',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 6',
    totalPeriods: 11,
    chapterCode: 'TNXH2-CĐ1',
    chapterTitle: 'Chủ đề 1: Gia đình (Tiết 1 – Tiết 11)',
    topicTitle: 'Các thế hệ trong gia đình; Nghề nghiệp của người lớn trong gia đình; Phòng tránh ngộ độc khi ở nhà; Giữ sạch nhà ở; Ôn tập chủ đề Gia đình',
    adjustedContentSummary:
      'Nhận biết các thế hệ trong gia đình, nghề nghiệp của người lớn; phòng tránh ngộ độc khi ở nhà; giữ sạch nhà ở. Tích hợp GDĐP (Các làng nghề của TP Huế), AI (2.C3.1, 2.A2.2), Tiếp cận giới.',
    lessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Các thế hệ trong gia đình',
        subLessonName: 'Tiết 1, 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được các thành viên trong gia đình nhiều thế hệ (hai thế hệ, ba thế hệ, bốn thế hệ) và thể hiện tình cảm yêu thương, sự gắn bó giữa các thế hệ trong gia đình.',
      },
      {
        week: '2',
        lessonName: 'Bài 2: Nghề nghiệp của người lớn trong gia đình',
        subLessonName: 'Tiết 3, 4',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GD địa phương (GDĐP): Các làng nghề của thành phố Huế. Kể được tên công việc, nghề nghiệp của người lớn trong gia đình và ý nghĩa của các công việc đó đối với gia đình và xã hội.',
      },
      {
        week: '3',
        lessonName: 'Bài 3: Phòng tránh ngộ độc khi ở nhà',
        subLessonName: 'Tiết 5, 6',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.C3.1: Học sinh tìm hiểu cách AI có thể hỗ trợ phân loại thức ăn tươi/hỏng dựa trên hình ảnh để phòng tránh ngộ độc; biết kết quả AI chỉ là gợi ý ban đầu, con người vẫn phải quan sát, ngửi, kiểm tra hạn sử dụng trước khi sử dụng thực phẩm.',
      },
      {
        week: '4',
        lessonName: 'Bài 4: Giữ sạch nhà ở',
        subLessonName: 'Tiết 7, 8',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp tiếp cận giới: Trách nhiệm bình đẳng trong không gian sống – hình thành thói quen cùng nhau làm việc, không ỷ lại vào mẹ hoặc chị/em gái. Tích hợp AI - YCCĐ 2.A2.2: HS hiểu rằng một số thiết bị thông minh/AI như robot hút bụi, robot lau nhà, máy rửa bát có thể hỗ trợ con người làm việc nhà, giúp giảm bớt sức lao động.',
      },
      {
        week: '5–6',
        lessonName: 'Bài 5: Ôn tập chủ đề về Gia đình',
        subLessonName: 'Tiết 9, 10, 11',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Hệ thống hóa kiến thức về chủ đề Gia đình và vận dụng xử lí tình huống phòng tránh ngộ độc, giữ sạch nhà ở.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tnxh-cd2',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    weekRange: 'Tuần 6 – Tuần 11',
    totalPeriods: 11,
    chapterCode: 'TNXH2-CĐ2',
    chapterTitle: 'Chủ đề 2: Trường học (Tiết 12 – Tiết 22)',
    topicTitle: 'Chào đón ngày khai giảng; Ngày hội đọc sách của chúng em; An toàn khi ở trường; Giữ vệ sinh trường học; Ôn tập chủ đề Trường học',
    adjustedContentSummary:
      'Tham gia các sự kiện ở trường học; thực hiện quy tắc an toàn và giữ vệ sinh trường học. Tích hợp GD ATGT, GD PCCC và hoạt động ngoài trời dọn vệ sinh sân trường.',
    lessons: [
      {
        week: '6–7',
        lessonName: 'Bài 6: Chào đón ngày khai giảng',
        subLessonName: 'Tiết 12, 13 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Mô tả được một số hoạt động trong Lễ khai giảng năm học mới và bày tỏ cảm xúc vui tươi, hào hứng khi đến trường.',
      },
      {
        week: '7–8',
        lessonName: 'Bài 7: Ngày hội đọc sách của chúng em',
        subLessonName: 'Tiết 14, 15 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Giới thiệu được cuốn sách yêu thích và tham gia tích cực vào Ngày hội đọc sách tại trường, lớp.',
      },
      {
        week: '8–9',
        lessonName: 'Bài 8: An toàn khi ở trường',
        subLessonName: 'Tiết 16, 17 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GD ATGT: Biết lựa chọn những nơi vui chơi an toàn. Tích hợp GD PCCC (KNS): Biết cách ứng phó khi xảy ra hỏa hoạn tại trường.',
      },
      {
        week: '9–10',
        lessonName: 'Bài 9: Giữ vệ sinh trường học',
        subLessonName: 'Tiết 18, 19 (Tiết 1, 2 – Hoạt động ngoài trời: Tham gia dọn vệ sinh sân trường)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Thực hiện giữ vệ sinh lớp học, nhà vệ sinh và tham gia hoạt động ngoài trời dọn vệ sinh sân trường xanh - sạch - đẹp (BVMT).',
      },
      {
        week: '10–11',
        lessonName: 'Bài 10: Ôn tập chủ đề Trường học',
        subLessonName: 'Tiết 20, 21, 22',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Củng cố kiến thức và kĩ năng giữ an toàn, giữ vệ sinh khi học tập và vui chơi ở trường.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tnxh-cd3',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 16',
    totalPeriods: 10,
    chapterCode: 'TNXH2-CĐ3',
    chapterTitle: 'Chủ đề 3: Cộng đồng địa phương (Tiết 23 – Tiết 32)',
    topicTitle: 'Hoạt động mua bán hàng hóa; Thực hành mua bán hàng hóa; Hoạt động giao thông; Cùng tham gia giao thông; Ôn tập chủ đề Cộng đồng địa phương',
    adjustedContentSummary:
      'Tìm hiểu hoạt động mua bán hàng hóa và giao thông ở địa phương; nhận biết biển báo và tham gia giao thông an toàn. Tích hợp GDĐP, AI (2.A1.2), GD ATGT.',
    lessons: [
      {
        week: '12–13',
        lessonName: 'Bài 11: Hoạt động mua bán hàng hóa & Thực hành mua bán hàng hóa',
        subLessonName: 'Tiết 23, 24: Hoạt động mua bán hàng hóa | Tiết 25: Thực hành mua bán hàng hóa',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GDĐP: Phẩm chất người dân quê em. Kể được tên một số hàng hóa cần thiết cho cuộc sống hằng ngày và cách lựa chọn hàng hóa an toàn, phù hợp.',
      },
      {
        week: '13–14',
        lessonName: 'Bài 12: Hoạt động giao thông',
        subLessonName: 'Tiết 26, 27 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.A1.2: Học sinh biết xe tự lái, camera hoặc tín hiệu thông minh có thể hỗ trợ giao thông nhưng vẫn cần con người giám sát, tuân thủ luật và chịu trách nhiệm về an toàn. Tích hợp GD An toàn giao thông (ATGT): Biết thêm về các biển báo giao thông đường bộ.',
      },
      {
        week: '14–15',
        lessonName: 'Bài 13: Cùng tham gia giao thông',
        subLessonName: 'Tiết 28, 29 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GD An toàn giao thông (ATGT): Biết lên, xuống an toàn trên các phương tiện giao thông và đội mũ bảo hiểm đúng quy cách.',
      },
      {
        week: '15–16',
        lessonName: 'Bài 14: Ôn tập chủ đề Cộng đồng địa phương',
        subLessonName: 'Tiết 30, 31, 32',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Hệ thống hóa kiến thức chủ đề Cộng đồng địa phương và thực hành xử lí tình huống khi đi mua hàng, tham gia giao thông.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tnxh-cd4',
    subject: 'Tự nhiên và Xã hội',
    semester: 'CA_NAM',
    weekRange: 'Tuần 17 – Tuần 23',
    totalPeriods: 13,
    chapterCode: 'TNXH2-CĐ4',
    chapterTitle: 'Chủ đề 4: Thực vật và động vật (Tiết 33 – Tiết 45)',
    topicTitle: 'Thực vật sống ở đâu?; Động vật sống ở đâu?; Cần làm gì để bảo vệ môi trường sống của động vật và thực vật?; Thực vật và động vật quanh em; Ôn tập chủ đề',
    adjustedContentSummary:
      'Phân biệt môi trường sống trên cạn, dưới nước của thực vật và động vật; đề xuất việc làm bảo vệ môi trường sống của thực vật, động vật. Tích hợp BVMT, NLS (1.1.CB1a) và hoạt động quan sát vườn trường.',
    lessons: [
      {
        week: '17',
        lessonName: 'Bài 15: Thực vật sống ở đâu?',
        subLessonName: 'Tiết 33, 34',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Đặt và trả lời được câu hỏi về nơi sống của thực vật; phân loại được cây sống trên cạn và cây sống dưới nước.',
      },
      {
        week: '18',
        lessonName: 'Bài 16: Động vật sống ở đâu?',
        subLessonName: 'Tiết 35, 36',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nhận biết và phân loại được động vật sống trên cạn, dưới nước, vừa sống trên cạn vừa sống dưới nước; kiểm tra đánh giá cuối HKI.',
      },
      {
        week: '19–20',
        lessonName: 'Bài 17: Cần làm gì để bảo vệ môi trường sống của động vật và thực vật?',
        subLessonName: 'Tiết 37, 38, 39',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp BVMT: Giáo dục học sinh có ý thức bảo vệ môi trường sống của thực vật và động vật. Tích hợp năng lực số (NLS) 1.1.CB1a: HS xác định đúng thông tin cần tìm, quan sát hình ảnh/học liệu số do GV cung cấp, lựa chọn thông tin phù hợp về việc làm bảo vệ hoặc làm hại môi trường sống của thực vật và động vật.',
      },
      {
        week: '20–21',
        lessonName: 'Bài 18: Thực vật và động vật quanh em',
        subLessonName: 'Tiết 40, 41, 42 (Hoạt động ngoài trời: Quan sát vườn trường)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Quan sát thực tế tại vườn trường để nhận diện môi trường sống của cây cối, con vật xung quanh và thực hiện chăm sóc cây xanh.',
      },
      {
        week: '22–23',
        lessonName: 'Bài 19: Ôn tập chủ đề Động vật và thực vật',
        subLessonName: 'Tiết 43, 44, 45',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Hệ thống hóa kiến thức về môi trường sống và biện pháp bảo vệ môi trường sống của thực vật, động vật.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tnxh-cd5',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 30',
    totalPeriods: 15,
    chapterCode: 'TNXH2-CĐ5',
    chapterTitle: 'Chủ đề 5: Con người và sức khỏe (Tiết 46 – Tiết 60)',
    topicTitle: 'Tìm hiểu và chăm sóc, bảo vệ cơ quan vận động, cơ quan hô hấp, cơ quan bài tiết nước tiểu; Ôn tập chủ đề Con người và sức khỏe',
    adjustedContentSummary:
      'Nhận biết tên gọi, chức năng và cách chăm sóc, bảo vệ cơ quan vận động, cơ quan hô hấp, cơ quan bài tiết nước tiểu. Tích hợp QCN, AI (2.A1.1), Tiếp cận giới.',
    lessons: [
      {
        week: '23–24',
        lessonName: 'Bài 20: Tìm hiểu cơ quan vận động',
        subLessonName: 'Tiết 46, 47 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp quyền con người (QCN): Học sinh hiểu mỗi người có quyền được hỗ trợ để vận động, học tập, sinh hoạt an toàn; biết tôn trọng sản phẩm của bạn và hỗ trợ bạn khi gặp khó khăn.',
      },
      {
        week: '24–25',
        lessonName: 'Bài 21: Chăm sóc, bảo vệ cơ quan vận động',
        subLessonName: 'Tiết 48, 49 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp quyền con người (QCN): Học sinh nhận biết quyền được chăm sóc, bảo vệ sức khoẻ; được học tập trong môi trường an toàn, bàn ghế phù hợp, đủ ánh sáng; được vui chơi an toàn và phòng tránh chấn thương, cong vẹo cột sống.',
      },
      {
        week: '25–26',
        lessonName: 'Bài 22: Tìm hiểu cơ quan hô hấp',
        subLessonName: 'Tiết 50, 51 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Chỉ và nói được tên các bộ phận chính của cơ quan hô hấp trên sơ đồ và chức năng thực hiện hoạt động hít vào, thở ra.',
      },
      {
        week: '26–27',
        lessonName: 'Bài 23: Chăm sóc, bảo vệ cơ quan hô hấp',
        subLessonName: 'Tiết 52, 53 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.A1.1: Học sinh biết AI có thể hỗ trợ giám sát ô nhiễm không khí, cảnh báo bụi mịn; con người vẫn phải tự bảo vệ (đeo khẩu trang, giữ ấm cổ ngực) và làm theo hướng dẫn của người lớn.',
      },
      {
        week: '27–28',
        lessonName: 'Bài 24: Tìm hiểu cơ quan bài tiết nước tiểu',
        subLessonName: 'Tiết 54, 55 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Tiếp cận giới: Phân biệt điểm khác nhau giữa con trai và con gái ở hệ thống bài tiết nước tiểu; giới thiệu tên gọi bộ phận sinh dục một cách khoa học, tôn trọng.',
      },
      {
        week: '28–29',
        lessonName: 'Bài 25: Chăm sóc, bảo vệ cơ quan bài tiết nước tiểu',
        subLessonName: 'Tiết 56, 57 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp Tiếp cận giới: Biết uống đủ nước, không nhịn tiểu và biết cách chăm sóc, bảo vệ bộ phận riêng tư của mình.',
      },
      {
        week: '29–30',
        lessonName: 'Bài 26: Ôn tập về chủ đề Con người và sức khỏe',
        subLessonName: 'Tiết 58, 59, 60 (Tiết 1, 2, 3)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tổng hợp kiến thức chăm sóc, bảo vệ cơ quan vận động, hô hấp và bài tiết nước tiểu.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-tnxh-cd6',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK2',
    weekRange: 'Tuần 31 – Tuần 35',
    totalPeriods: 10,
    chapterCode: 'TNXH2-CĐ6',
    chapterTitle: 'Chủ đề 6: Trái đất và bầu trời (Tiết 61 – Tiết 70)',
    topicTitle: 'Các mùa trong năm; Một số thiên tai thường gặp; Luyện tập ứng phó với thiên tai; Ôn tập chủ đề Trái đất và bầu trời',
    adjustedContentSummary:
      'Nhận biết đặc điểm các mùa trong năm và một số thiên tai thường gặp (bão, lũ, hạn hán); thực hành kĩ năng ứng phó thiên tai. Tích hợp GDĐP Huế, Phòng tránh tai nạn thương tích, Kĩ năng công dân số.',
    lessons: [
      {
        week: '31',
        lessonName: 'Bài 27: Các mùa trong năm',
        subLessonName: 'Tiết 61, 62',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GDĐP: Dấu hiệu nhận biết thời tiết các mùa ở quê em (thành phố Huế); biết lựa chọn trang phục phù hợp với thời tiết từng mùa.',
      },
      {
        week: '32',
        lessonName: 'Bài 28: Một số thiên tai thường gặp',
        subLessonName: 'Tiết 63, 64',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GD phòng tránh tai nạn thương tích (KNS): Nhận biết một số thiên tai thường gặp ở địa phương (mưa bão, ngập lụt, sấm sét) và nguy cơ gây mất an toàn.',
      },
      {
        week: '33–34',
        lessonName: 'Bài 29: Luyện tập ứng phó với thiên tai',
        subLessonName: 'Tiết 65, 66, 67 (Tiết 1, 2, 3)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp kĩ năng công dân số (NLS): Sử dụng thiết bị điện tử để tìm kiếm thông tin dự báo thời tiết trên Google an toàn và thực hành kĩ năng ứng phó khi có bão, lũ.',
      },
      {
        week: '34–35',
        lessonName: 'Bài 30: Ôn tập chủ đề Trái đất và bầu trời & Kiểm tra cuối năm',
        subLessonName: 'Tiết 68, 69, 70 (Tiết 1, 2, 3)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Hệ thống hóa kiến thức chủ đề Trái đất và bầu trời và thực hiện bài kiểm tra đánh giá định kì cuối năm học.',
      },
    ],
  }),
];

/**
 * 4. MÔN ĐẠO ĐỨC LỚP 2 (35 TIẾT / 35 TUẦN – 1 TIẾT/TUẦN)
 * HKI: 18 tiết / 18 tuần (Chủ đề 1–5, Bài 1–8 + Thực hành kĩ năng giữa HKI & cuối HKI)
 * HKII: 17 tiết / 17 tuần (Chủ đề 5 tiếp – Chủ đề 8, Bài 8 tiếp – Bài 15 + Thực hành kĩ năng giữa HKII & cuối năm)
 */
export const GRADE2_DAO_DUC_TOPICS: CurriculumTopic[] = [
  buildGrade2Topic({
    id: 'nda-2026-g2-dd-cd1-2',
    subject: 'Đạo đức',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 10',
    totalPeriods: 10,
    chapterCode: 'ĐĐ2-CĐ1-2',
    chapterTitle: 'Chủ đề 1 & 2: Quê hương em – Kính trọng thầy giáo, cô giáo và yêu quý bạn bè (Bài 1 – Bài 4)',
    topicTitle: 'Vẻ đẹp quê hương em; Em yêu quê hương; Kính trọng thầy giáo, cô giáo; Yêu quý bạn bè; Thực hành kĩ năng giữa HKI',
    adjustedContentSummary:
      'Nhận biết vẻ đẹp quê hương và việc làm thể hiện tình yêu quê hương; kính trọng thầy cô giáo và yêu quý, giúp đỡ bạn bè. Tích hợp GDĐP Huế, QCN.',
    lessons: [
      {
        week: '1–2',
        lessonName: 'Bài 1: Vẻ đẹp quê hương em',
        subLessonName: 'Tiết 1, 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được địa chỉ, vẻ đẹp thiên nhiên và truyền thống văn hóa của quê hương em.',
      },
      {
        week: '3–5',
        lessonName: 'Bài 2: Em yêu quê hương',
        subLessonName: 'Tiết 3, 4, 5',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD địa phương (GDĐP): Cùng giữ gìn, bảo vệ quê hương em bằng những việc làm phù hợp với lứa tuổi.',
      },
      {
        week: '6–7',
        lessonName: 'Bài 3: Kính trọng thầy giáo, cô giáo',
        subLessonName: 'Tiết 6, 7',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp GD quyền con người (QCN): Quyền được vui chơi, giải trí, hoạt động văn hóa, nghệ thuật và bổn phận kính trọng, lễ phép, vâng lời thầy giáo, cô giáo.',
      },
      {
        week: '8 & 10',
        lessonName: 'Bài 4: Yêu quý bạn bè & Thực hành kĩ năng giữa HKI (Tuần 9)',
        subLessonName: 'Bài 4 (Tiết 8, 10) | Thực hành kĩ năng giữa HKI (Tiết 9)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện lời nói, việc làm thể hiện sự yêu quý, quan tâm, giúp đỡ bạn bè và thực hành kĩ năng đạo đức giữa học kì I.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-dd-cd3-4-5',
    subject: 'Đạo đức',
    semester: 'HK1',
    weekRange: 'Tuần 11 – Tuần 19',
    totalPeriods: 9,
    chapterCode: 'ĐĐ2-CĐ3-4-5',
    chapterTitle: 'Chủ đề 3, 4 & 5: Quý trọng thời gian – Nhận lỗi và sửa lỗi – Bảo quản đồ dùng cá nhân và gia đình (Bài 5 – Bài 8)',
    topicTitle: 'Quý trọng thời gian; Nhận lỗi và sửa lỗi; Bảo quản đồ dùng cá nhân; Bảo quản đồ dùng gia đình; Thực hành kĩ năng cuối HKI',
    adjustedContentSummary:
      'Biết quý trọng thời gian, dũng cảm nhận lỗi và sửa lỗi; bảo quản đồ dùng cá nhân và gia đình an toàn, tiết kiệm. Tích hợp AI (A2.2) và GD Phòng cháy chữa cháy.',
    lessons: [
      {
        week: '11–12',
        lessonName: 'Bài 5: Quý trọng thời gian',
        subLessonName: 'Tiết 11, 12',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nhận biết biểu hiện và lợi ích của việc quý trọng thời gian; thực hiện sử dụng thời gian hợp lí trong học tập và sinh hoạt.',
      },
      {
        week: '13–14',
        lessonName: 'Bài 6: Nhận lỗi và sửa lỗi',
        subLessonName: 'Tiết 13, 14',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Biết dũng cảm nhận lỗi và chủ động sửa lỗi khi có hành vi, lời nói chưa đúng; biết tha thứ khi bạn nhận lỗi.',
      },
      {
        week: '15–16',
        lessonName: 'Bài 7: Bảo quản đồ dùng cá nhân',
        subLessonName: 'Tiết 15, 16',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Thực hiện giữ gìn, bảo quản sách vở, đồ dùng học tập và đồ dùng cá nhân cẩn thận, ngăn nắp.',
      },
      {
        week: '17–19',
        lessonName: 'Bài 8: Bảo quản đồ dùng gia đình & Thực hành kĩ năng cuối HKI',
        subLessonName: 'Bài 8 Tiết 1 (Tuần 17) | Thực hành kĩ năng cuối HKI (Tuần 18) | Bài 8 Tiết 2 (Tuần 19)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI A2.2: Biết được rằng mục đích của các công nghệ và sản phẩm có AI trong gia đình là hỗ trợ con người trong sinh hoạt hằng ngày, giúp tiết kiệm thời gian, giảm công việc nhà, và nâng cao sự tiện nghi, an toàn. Tích hợp GD Phòng cháy chữa cháy (KNS): Khi sử dụng các thiết bị đồ dùng ở nhà cần phòng tránh hỏa hoạn và tai nạn thương tích.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-dd-cd6-7-8',
    subject: 'Đạo đức',
    semester: 'HK2',
    weekRange: 'Tuần 20 – Tuần 35',
    totalPeriods: 16,
    chapterCode: 'ĐĐ2-CĐ6-7-8',
    chapterTitle: 'Chủ đề 6, 7 & 8: Thể hiện cảm xúc bản thân – Tìm kiếm sự hỗ trợ – Tuân thủ quy định nơi công cộng (Bài 9 – Bài 15)',
    topicTitle: 'Cảm xúc của em; Kiềm chế cảm xúc tiêu cực; Tìm kiếm sự hỗ trợ khi ở nhà, ở trường, ở nơi công cộng; Tìm hiểu và tuân thủ quy định nơi công cộng',
    adjustedContentSummary:
      'Nhận diện cảm xúc bản thân, kiềm chế cảm xúc tiêu cực; biết tìm kiếm sự hỗ trợ tin cậy khi gặp khó khăn, nguy hiểm; tuân thủ quy định nơi công cộng. Tích hợp AI (2.A1.1), Tiếp cận giới (Quy tắc 5 ngón tay), Phòng tránh bom mìn và tai nạn thương tích.',
    lessons: [
      {
        week: '20–21',
        lessonName: 'Bài 9: Cảm xúc của em',
        subLessonName: 'Tiết 20, 21 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.A1.1: Học sinh nhận ra AI không có cảm xúc thật; từ đó trân trọng sự đồng cảm, chia sẻ chân thành giữa người với người.',
      },
      {
        week: '22–24',
        lessonName: 'Bài 10: Kiềm chế cảm xúc tiêu cực',
        subLessonName: 'Tiết 22, 23, 24 (Tiết 1, 2, 3)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Thực hành các cách kiềm chế cảm xúc tiêu cực (tức giận, buồn bã, sợ hãi) để ứng xử văn minh, tích cực.',
      },
      {
        week: '25–27',
        lessonName: 'Bài 11: Tìm kiếm sự hỗ trợ khi ở nhà & Thực hành kĩ năng giữa HKII',
        subLessonName: 'Bài 11 (Tiết 25, 26) | Thực hành kĩ năng giữa HKII (Tiết 27)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Biết tìm kiếm sự hỗ trợ từ người thân hoặc gọi số điện thoại khẩn cấp khi gặp tình huống khó khăn, nguy hiểm ở nhà.',
      },
      {
        week: '28–29',
        lessonName: 'Bài 12: Tìm kiếm sự hỗ trợ khi ở trường',
        subLessonName: 'Tiết 28, 29 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Biết chủ động nhờ thầy cô, nhân viên nhà trường và bạn bè hỗ trợ khi gặp khó khăn trong học tập, sinh hoạt tại trường.',
      },
      {
        week: '30',
        lessonName: 'Bài 13: Tìm kiếm sự hỗ trợ ở nơi công cộng',
        subLessonName: 'Tiết 30',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp Tiếp cận giới & KNS: Kỹ năng phòng tránh xâm hại và tự bảo vệ (Quy tắc 5 ngón tay) – biết cách từ chối, hô to và chạy trốn tìm người đáng tin cậy giúp đỡ khi có người (kể cả người quen) chạm vào vùng riêng tư hoặc có hành vi làm mình khó chịu.',
      },
      {
        week: '31–32',
        lessonName: 'Bài 14: Tìm hiểu quy định nơi công cộng',
        subLessonName: 'Tiết 31, 32 (Tiết 1, 2)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được một số quy định cần tuân thủ ở nơi công cộng (bệnh viện, thư viện, công viên, rạp chiếu phim, bến xe) và lợi ích của việc tuân thủ.',
      },
      {
        week: '33–35',
        lessonName: 'Bài 15: Em tuân thủ quy định nơi công cộng & Thực hành kĩ năng cuối năm',
        subLessonName: 'Bài 15 (Tiết 33, 34) | Thực hành kĩ năng cuối năm (Tiết 35)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD phòng tránh bom mìn, tai nạn thương tích: Tuân thủ quy định nơi công cộng, không đến gần những nơi có biển cấm hoặc tiềm ẩn rủi ro, nguy hiểm.',
      },
    ],
  }),
];

/**
 * 5. MÔN HOẠT ĐỘNG TRẢI NGHIỆM LỚP 2 (105 TIẾT / 35 TUẦN – 3 TIẾT/TUẦN)
 * Gồm: Tiết 1: Sinh hoạt dưới cờ (SHDC) | Tiết 2: Hoạt động giáo dục theo chủ đề (HĐGĐTCĐ) | Tiết 3: Sinh hoạt lớp (SHL)
 * HKI: 18 tuần x 3 tiết = 54 tiết | HKII: 17 tuần x 3 tiết = 51 tiết
 */
export const GRADE2_HDTN_TOPICS: CurriculumTopic[] = [
  buildGrade2Topic({
    id: 'nda-2026-g2-hdtn-cd1-2',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 8',
    totalPeriods: 24,
    chapterCode: 'HĐTN2-CĐ1-2',
    chapterTitle: 'Chủ đề 1 & 2: Khám phá bản thân – Rèn nếp sống (Tuần 1 – Tuần 8)',
    topicTitle: 'Hình ảnh của em; Nụ cười thân thiện; Luyện tay cho khéo; Tay khéo, tay đảm; Vui Trung thu; Góc học tập của em; Gọn gàng, ngăn nắp; Quý trọng đồng tiền',
    adjustedContentSummary:
      'Khám phá hình ảnh thân thiện của bản thân, rèn sự khéo léo của đôi bàn tay; sắp xếp góc học tập gọn gàng, ngăn nắp và biết quý trọng đồng tiền. Tích hợp GDĐP Huế, QCN, AI (2.A2.1), ATGT, NLS (2.3.CB1a).',
    lessons: [
      {
        week: '1',
        lessonName: 'Tuần 1: Hình ảnh của em',
        subLessonName: 'SHDC: Tham gia Lễ khai giảng | HĐGĐTCĐ: Hình ảnh của em | SHL: Hình ảnh của em',
        periodAllocation: '3 tiết (Tiết 1–3)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD địa phương (GDĐP): Các làng nghề của thành phố Huế. Giới thiệu được đặc điểm bên ngoài và nét đáng yêu của bản thân.',
      },
      {
        week: '2',
        lessonName: 'Tuần 2: Nụ cười thân thiện',
        subLessonName: 'SHDC: Xem tiết mục hài | HĐGĐTCĐ: Nụ cười thân thiện | SHL: Tham gia tổ chức "Ngày hội nụ cười"',
        periodAllocation: '3 tiết (Tiết 4–6)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD Quyền con người (QCN): Quyền được phát triển năng khiếu bản thân; rèn luyện thái độ cởi mở, thân thiện với thầy cô và bạn bè.',
      },
      {
        week: '3–5',
        lessonName: 'Tuần 3–5: Luyện tay cho khéo; Tay khéo, tay đảm; Vui Trung thu',
        subLessonName: 'Tuần 3: Luyện tay cho khéo (3t) | Tuần 4: Tay khéo, tay đảm (3t) | Tuần 5: Vui Trung thu (3t)',
        periodAllocation: '9 tiết (Tiết 7–15)',
        periodsCount: 9,
        adjustedContent:
          'Nghe giới thiệu về nghề thủ công địa phương; thực hành làm sản phẩm khéo tay và chia sẻ việc nhà em đã làm; vui đón Tết Trung thu.',
      },
      {
        week: '6',
        lessonName: 'Tuần 6: Góc học tập của em',
        subLessonName: 'SHDC: Hát, đọc thơ về đồ dùng học tập | HĐGĐTCĐ: Góc học tập của em | SHL: Theo chủ đề Góc học tập của em',
        periodAllocation: '3 tiết (Tiết 16–18)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD Quyền con người (QCN): Quyền được tôn trọng, bảo vệ tính mạng. Tích hợp AI - YCCĐ 2.A2.1: Nhận biết các thiết bị thông minh (AI) hỗ trợ việc học tập tiện nghi hơn.',
      },
      {
        week: '7',
        lessonName: 'Tuần 7: Gọn gàng, ngăn nắp',
        subLessonName: 'SHDC: Xem hoạt cảnh Đồ dùng ở đâu? | HĐGĐTCĐ: Gọn gàng, ngăn nắp | SHL: Theo chủ đề Gọn gàng, ngăn nắp',
        periodAllocation: '3 tiết (Tiết 19–21)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp GD an toàn giao thông (ATGT): Học sinh biết chấp hành tốt luật giao thông và rèn thói quen sắp xếp đồ dùng gọn gàng, ngăn nắp.',
      },
      {
        week: '8',
        lessonName: 'Tuần 8: Quý trọng đồng tiền',
        subLessonName: 'SHDC: Nghe chia sẻ chủ đề "Người tiêu dùng thông minh" | HĐGĐTCĐ: Quý trọng đồng tiền | SHL: Theo chủ đề Quý trọng đồng tiền',
        periodAllocation: '3 tiết (Tiết 22–24)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 2.3.CB1a: Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội; biết quý trọng và sử dụng đồng tiền tiết kiệm, hợp lí.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-hdtn-cd3-4',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 9 – Tuần 18',
    totalPeriods: 30,
    chapterCode: 'HĐTN2-CĐ3-4',
    chapterTitle: 'Chủ đề 3 & 4: Em yêu trường em – Tự phục vụ bản thân – Gia đình thân thương (Tuần 9 – Tuần 18)',
    topicTitle: 'Có bạn thật vui; Tìm sự trợ giúp để giữ gìn tình bạn; Trường học hạnh phúc; Biết ơn thầy cô; Em tự làm lấy việc của mình; Nghĩ nhanh, làm giỏi; Việc của mình không cần ai nhắc; Lựa chọn trang phục; Hành trang lên đường; Người trong một nhà',
    adjustedContentSummary:
      'Xây dựng tình bạn đẹp, biết ơn thầy cô giáo nhân dịp 20/11; rèn luyện tính tự giác, tự phục vụ bản thân và bày tỏ lòng biết ơn đối với người thân trong gia đình. Tích hợp AI (2.A1.2), NLS (2.3.CB1a), PCCC, QPAN, Đạo đức - lối sống.',
    lessons: [
      {
        week: '9',
        lessonName: 'Tuần 9: Có bạn thật vui',
        subLessonName: 'SHDC: Phát động phong trào góp sách cho "Tủ sách anh em" | HĐGĐTCĐ: Có bạn thật vui | SHL: Theo chủ đề Có bạn thật vui',
        periodAllocation: '3 tiết (Tiết 25–27)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.A1.2: Phân biệt tương tác máy móc và tình bạn chân thành giữa người với người.',
      },
      {
        week: '10',
        lessonName: 'Tuần 10: Tìm sự trợ giúp để giữ gìn tình bạn',
        subLessonName: 'SHDC: Tổng kết phong trào góp sách | HĐGĐTCĐ: Tìm sự trợ giúp để giữ gìn tình bạn | SHL: Theo chủ đề',
        periodAllocation: '3 tiết (Tiết 28–30)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 2.3.CB1a: Giao tiếp, hợp tác trong môi trường số bằng hình thức đơn giản, phù hợp để giữ gìn tình bạn.',
      },
      {
        week: '11–12',
        lessonName: 'Tuần 11–12: Trường học hạnh phúc & Biết ơn thầy cô (Chào mừng 20/11)',
        subLessonName: 'Tuần 11: Trường học hạnh phúc (3t) | Tuần 12: Biết ơn thầy cô – Chào mừng ngày Nhà giáo Việt Nam 20/11 (3t)',
        periodAllocation: '6 tiết (Tiết 31–36)',
        periodsCount: 6,
        adjustedContent:
          'Tham gia các hoạt động xây dựng trường học hạnh phúc và bày tỏ lòng biết ơn thầy giáo, cô giáo nhân ngày 20/11.',
      },
      {
        week: '13–17',
        lessonName: 'Tuần 13–17: Chủ đề Tự phục vụ bản thân (Em tự làm lấy việc của mình; Nghĩ nhanh, làm giỏi; Việc của mình không cần ai nhắc; Lựa chọn trang phục; Hành trang lên đường)',
        subLessonName: 'Tuần 13 (Tiết 37–39) | Tuần 14: Nghe cảnh sát PCCC hướng dẫn thoát hiểm (Tiết 40–42) | Tuần 15: Rèn luyện theo tác phong chú bộ đội (Tiết 43–45) | Tuần 16 (Tiết 46–48) | Tuần 17 (Tiết 49–51)',
        periodAllocation: '15 tiết (Tiết 37–51)',
        periodsCount: 15,
        adjustedContent:
          'Rèn luyện kĩ năng tự phục vụ cá nhân không cần ai nhắc, kĩ năng thoát hiểm khi xảy ra hỏa hoạn (KNS/PCCC) và tác phong kỉ luật theo gương chú bộ đội (QPAN).',
      },
      {
        week: '18',
        lessonName: 'Tuần 18: Người trong một nhà (Sơ kết Học kì I)',
        subLessonName: 'SHDC: Trò chuyện về "Lòng biết ơn và tình cảm gia đình" | HĐGĐTCĐ: Người trong một nhà | SHL: Theo chủ đề Người trong một nhà',
        periodAllocation: '3 tiết (Tiết 52–54)',
        periodsCount: 3,
        adjustedContent:
          'Giáo dục đạo đức, lối sống: Học sinh biết yêu thương, quan tâm, chăm sóc và thể hiện lòng biết ơn với ông bà, cha mẹ, người thân bằng việc làm phù hợp.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-hdtn-cd5-6',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 28',
    totalPeriods: 30,
    chapterCode: 'HĐTN2-CĐ5-6',
    chapterTitle: 'Chủ đề 5 & 6: Gia đình thân thương – Tự chăm sóc và bảo vệ bản thân – Chia sẻ cộng đồng (Tuần 19 – Tuần 28)',
    topicTitle: 'Tết Nguyên đán; Ngày đáng nhớ của gia đình; Tự chăm sóc sức khoẻ bản thân; Những vật dụng bảo vệ em; Câu chuyện lạc đường; Phòng tránh bị bắt cóc; Những người bạn hàng xóm; Tôi luôn bên bạn; Chia sẻ khó khăn với người khuyết tật; Cảnh đẹp quê em',
    adjustedContentSummary:
      'Tìm hiểu phong tục Tết Nguyên đán; rèn kĩ năng tự chăm sóc sức khỏe, xử lí khi bị lạc đường, phòng tránh bị bắt cóc; biết chia sẻ khó khăn với bạn bè và người khuyết tật. Tích hợp AI (2.A2.1), NLS (5.2.CB1a), QCN.',
    lessons: [
      {
        week: '19–20',
        lessonName: 'Tuần 19–20: Tết Nguyên đán & Ngày đáng nhớ của gia đình',
        subLessonName: 'Tuần 19: Tết Nguyên đán (Tiết 55–57) | Tuần 20: Ngày đáng nhớ của gia đình (Tiết 58–60)',
        periodAllocation: '6 tiết (Tiết 55–60)',
        periodsCount: 6,
        adjustedContent:
          'Tham gia văn nghệ mừng Đảng - mừng Xuân, tìm hiểu ý nghĩa Tết Nguyên đán và kỉ niệm những ngày đáng nhớ của gia đình.',
      },
      {
        week: '21–22',
        lessonName: 'Tuần 21–22: Tự chăm sóc sức khoẻ bản thân & Những vật dụng bảo vệ em',
        subLessonName: 'Tuần 21: Tự chăm sóc sức khoẻ bản thân (Tiết 61–63) | Tuần 22: Những vật dụng bảo vệ em (Tiết 64–66)',
        periodAllocation: '6 tiết (Tiết 61–66)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.A2.1: Nhận biết các ứng dụng AI giúp nâng cao sự an toàn cho gia đình; rèn kĩ năng tự chăm sóc sức khỏe phòng tránh dịch bệnh.',
      },
      {
        week: '23–24',
        lessonName: 'Tuần 23–24: Câu chuyện lạc đường & Phòng tránh bị bắt cóc',
        subLessonName: 'Tuần 23: Câu chuyện lạc đường (Tiết 67–69) | Tuần 24: Phòng tránh bị bắt cóc (Tiết 70–72)',
        periodAllocation: '6 tiết (Tiết 67–72)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp năng lực số (NLS) 5.2.CB1a: Sử dụng công cụ số đơn giản để giải quyết nhu cầu cá nhân dưới sự hướng dẫn; thực hành kĩ năng xử lí khi bị lạc và phòng tránh bị bắt cóc (KNS).',
      },
      {
        week: '25–26',
        lessonName: 'Tuần 25–26: Những người bạn hàng xóm (Giờ Trái Đất) & Tôi luôn bên bạn',
        subLessonName: 'Tuần 25: Hưởng ứng Giờ Trái Đất – Những người bạn hàng xóm (Tiết 73–75) | Tuần 26: Tôi luôn bên bạn (Tiết 76–78)',
        periodAllocation: '6 tiết (Tiết 73–78)',
        periodsCount: 6,
        adjustedContent:
          'Hưởng ứng phong trào Giờ Trái Đất (BVMT) và phong trào "Học nhân ái, biết sẻ chia" với bạn bè, hàng xóm.',
      },
      {
        week: '27–28',
        lessonName: 'Tuần 27–28: Chia sẻ khó khăn với người khuyết tật & Cảnh đẹp quê em',
        subLessonName: 'Tuần 27: Chia sẻ khó khăn với người khuyết tật (Tiết 79–81) | Tuần 28: Cảnh đẹp quê em (Tiết 82–84)',
        periodAllocation: '6 tiết (Tiết 79–84)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp quyền con người (QCN): Học sinh hiểu người khuyết tật có quyền được tôn trọng, tham gia và hòa nhập cộng đồng; biết hỗ trợ bằng lời nói, hành động đúng cách, không kì thị.',
      },
    ],
  }),
  buildGrade2Topic({
    id: 'nda-2026-g2-hdtn-cd7-8-9',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 29 – Tuần 35',
    totalPeriods: 21,
    chapterCode: 'HĐTN2-CĐ7-8-9',
    chapterTitle: 'Chủ đề 7, 8 & 9: Môi trường quanh em – Em tìm hiểu nghề nghiệp – Đón mùa hè trải nghiệm (Tuần 29 – Tuần 35)',
    topicTitle: 'Bảo vệ cảnh quan quê em; Giữ vệ sinh môi trường; Lớp học xanh; Nghề của mẹ, nghề của cha; Nghề nào tính nấy; Lao động an toàn; Đón mùa hè trải nghiệm',
    adjustedContentSummary:
      'Chung tay bảo vệ cảnh quan quê hương, xây dựng lớp học xanh; tìm hiểu nghề nghiệp của cha mẹ và an toàn trong lao động; tổng kết năm học. Tích hợp BVMT, AI (2.A1.2), TTHCM (Kỉ niệm ngày sinh Bác Hồ 19/5).',
    lessons: [
      {
        week: '29–31',
        lessonName: 'Tuần 29–31: Bảo vệ cảnh quan quê em; Giữ vệ sinh môi trường & Lớp học xanh',
        subLessonName: 'Tuần 29: Bảo vệ cảnh quan quê em (3t) | Tuần 30: Giữ vệ sinh môi trường – Chào mừng ngày thành lập Đội 15/5 (3t) | Tuần 31: Lớp học xanh (3t)',
        periodAllocation: '9 tiết (Tiết 85–93)',
        periodsCount: 9,
        adjustedContent:
          'Tích cực tham gia phong trào "Chung tay bảo vệ cảnh quan quê em", giữ vệ sinh môi trường và chăm sóc cây xanh xây dựng lớp học xanh (BVMT).',
      },
      {
        week: '32',
        lessonName: 'Tuần 32: Nghề của mẹ, nghề của cha',
        subLessonName: 'SHDC: Giao lưu với phụ huynh về nghề nghiệp | HĐGĐTCĐ: Nghề của mẹ, nghề của cha | SHL: Theo chủ đề',
        periodAllocation: '3 tiết (Tiết 94–96)',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI - YCCĐ 2.A1.2: Nêu ví dụ cần con người giám sát AI trong các ngành nghề thực tế; biết trân trọng nghề nghiệp của cha mẹ.',
      },
      {
        week: '33–34',
        lessonName: 'Tuần 33–34: Nghề nào tính nấy & Lao động an toàn (Kỉ niệm ngày sinh Bác Hồ 19/5)',
        subLessonName: 'Tuần 33: Nghề nào tính nấy (Tiết 97–99) | Tuần 34: Kỉ niệm ngày sinh Bác Hồ 19/5 – Lao động an toàn (Tiết 100–102)',
        periodAllocation: '6 tiết (Tiết 97–102)',
        periodsCount: 6,
        adjustedContent:
          'Tích hợp GD lí tưởng cách mạng, đạo đức, lối sống (TTHCM): Lòng biết ơn Bác Hồ nhân kỉ niệm ngày sinh Bác Hồ 19/5; rèn luyện đức tính cẩn thận và giữ an toàn trong lao động.',
      },
      {
        week: '35',
        lessonName: 'Tuần 35: Đón mùa hè trải nghiệm (Tổng kết năm học)',
        subLessonName: 'SHDC: Chuẩn bị tổng kết năm học | HĐGĐTCĐ: Đón mùa hè trải nghiệm | SHL: Theo chủ đề Đón mùa hè trải nghiệm',
        periodAllocation: '3 tiết (Tiết 103–105)',
        periodsCount: 3,
        adjustedContent:
          'Lập kế hoạch rèn luyện và vui chơi an toàn trong dịp nghỉ hè; tổng kết, đánh giá kết quả Hoạt động trải nghiệm lớp 2 cuối năm học.',
      },
    ],
  }),
];
