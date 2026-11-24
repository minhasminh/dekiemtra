import { CurriculumTopic } from '../types/domain';
import { buildGrade4Topic } from './grade4TvAndMathPlan2026';

// ============================================================================
// 3. MÔN KHOA HỌC LỚP 4 (6 CHỦ ĐỀ + ÔN TẬP CUỐI NĂM, 31 BÀI HỌC, 70 TIẾT)
// ============================================================================
export const GRADE4_KHOA_HOC_TOPICS: CurriculumTopic[] = [
  buildGrade4Topic({
    id: 'cur-nda-g4-kh-cd1',
    subject: 'Khoa học',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 7',
    totalPeriods: 13,
    chapterCode: 'KH4-CĐ1',
    chapterTitle: 'Chủ đề 1: Chất',
    topicTitle:
      'Bài 1: Tính chất của nước và nước với cuộc sống (2 tiết); Bài 2: Sự chuyển thể của nước và vòng tuần hoàn của nước trong tự nhiên (2 tiết); Bài 3: Sự ô nhiễm và bảo vệ nguồn nước. Một số cách làm sạch nước (2 tiết); Bài 4: Không khí có ở đâu? Tính chất và thành phần của không khí (2 tiết); Bài 5: Vai trò của không khí và bảo vệ bầu không khí trong lành (2 tiết); Bài 6: Gió, bão và phòng chống bão (2 tiết); Bài 7: Ôn tập chủ đề Chất (1 tiết)',
    adjustedContentSummary:
      'Tính chất, sự chuyển thể, vòng tuần hoàn và bảo vệ nguồn nước; thành phần, tính chất, vai trò và bảo vệ bầu không khí; phòng chống gió bão; Tích hợp Tiết kiệm nguồn nước, AI (4.A1.1, 4.D1.1, 4.C2.1, 4.A1.2), STEM, BVMT, NLS (1.1, 1.2), ANQP.',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Tính chất của nước và nước với cuộc sống (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS nhận biết vai trò của nước sạch đối với đời sống; biết sử dụng nước hợp lí, khóa vòi nước sau khi dùng, không xả rác hoặc chất bẩn vào nguồn nước và nhắc người thân cùng bảo vệ nguồn nước.\n- Tích hợp AI (4.A1.1): Nhận biết AI hỗ trợ giám sát và điều khiển nguồn nước hằng ngày thông qua các hệ thống vòi nước thông minh hoặc cảm biến đo lượng nước tiêu thụ.',
      },
      {
        week: '2',
        lessonName: 'Bài 2: Sự chuyển thể của nước và vòng tuần hoàn của nước trong tự nhiên (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.D1.1): Tìm hiểu cách AI thu thập dữ liệu về mây, gió để dự báo chính xác các giai đoạn của vòng tuần hoàn nước như mưa, bão nhằm bảo vệ con người.\n- Tích hợp STEM: Sự chuyển thể của nước và vòng tuần hoàn của nước trong tự nhiên.',
      },
      {
        week: '3',
        lessonName: 'Bài 3: Sự ô nhiễm và bảo vệ nguồn nước. Một số cách làm sạch nước (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 2; Tiết 2: Phần 3, 4',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp BVMT: HS nhận biết tác hại của ô nhiễm nguồn nước đối với sức khỏe, có ý thức không xả rác, không đổ chất bẩn xuống nguồn nước.\n- Tích hợp AI (4.A1.1): Nhận biết robot hoặc hệ thống AI giám sát nguồn nước tự động để phát hiện ô nhiễm, giúp con người tiết kiệm thời gian và đảm bảo an toàn.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS xác định thông tin cần tìm về nguyên nhân, tác hại của ô nhiễm nước; biết chọn nguồn thông tin đáng tin cậy do GV gợi ý.',
      },
      {
        week: '4',
        lessonName: 'Bài 4: Không khí có ở đâu? Tính chất và thành phần của không khí (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 3; Tiết 2: Phần 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): Biết AI hỗ trợ giám sát nồng độ các chất trong không khí qua cảm biến. Thảo luận cách máy lọc không khí AI tự động xử lý khi phát hiện bụi mịn.',
      },
      {
        week: '5',
        lessonName: 'Bài 5: Vai trò của không khí và bảo vệ bầu không khí trong lành (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 2; Tiết 2: Phần 3, 4',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp BVMT: HS biết vai trò của không khí trong lành, có hành vi giảm bụi, khói, rác thải và trồng cây xanh.\n- Tích hợp AI (4.C2.1): Trình bày ứng dụng AI như AirVisual trong việc dự báo chất lượng không khí (AQI) và đưa ra cảnh báo mức độ ô nhiễm tại Việt Nam.\n- Tích hợp NLS 1.1.CB2a: HS tìm kiếm ảnh/video về ô nhiễm không khí từ nguồn GV cung cấp và nêu được một việc làm bảo vệ bầu không khí trong lành.',
      },
      {
        week: '6',
        lessonName: 'Bài 6: Gió, bão và phòng chống bão (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.D1.1): Nêu ví dụ sử dụng AI để dự báo hướng di chuyển của bão. Thảo luận ý tưởng về một "Trợ lý AI" thông báo tin bão khẩn cấp đến từng nhà dân.\n- Tích hợp ANQP: HS biết một số cách phòng tránh rủi ro khi mưa bão, sấm sét; nghe theo hướng dẫn của người lớn và lực lượng chức năng.\n- Tích hợp STEM: Gió, bão.',
      },
      {
        week: '7',
        lessonName: 'Bài 7: Ôn tập chủ đề: Chất (1 tiết)',
        subLessonName: 'Tiết 1: Ôn tập tổng hợp chủ đề Chất',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): Sử dụng trợ lý ảo hoặc chatbot AI để gợi ý các từ khóa chính, hỗ trợ học sinh tự xây dựng sơ đồ tư duy tổng kết về nước và không khí.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-kh-cd2',
    subject: 'Khoa học',
    semester: 'HK1',
    weekRange: 'Tuần 7 – Tuần 14',
    totalPeriods: 14,
    chapterCode: 'KH4-CĐ2',
    chapterTitle: 'Chủ đề 2: Năng lượng',
    topicTitle:
      'Bài 8: Ánh sáng và sự truyền ánh sáng (2 tiết); Bài 9: Vai trò của ánh sáng (2 tiết); Bài 10: Âm thanh và sự truyền âm thanh (2 tiết); Bài 11: Âm thanh trong cuộc sống (3 tiết); Bài 12: Nhiệt độ và sự truyền nhiệt (2 tiết); Bài 13: Vật dẫn nhiệt tốt, vật dẫn nhiệt kém (2 tiết); Bài 14: Ôn tập chủ đề Năng lượng (1 tiết)',
    adjustedContentSummary:
      'Sự truyền và vai trò của ánh sáng, âm thanh, nhiệt năng; vật dẫn nhiệt tốt và kém; Tích hợp AI (4.C5.1, 4.A2.1, 4.C2.1, 4.A2.2, 4.A1.2), QCN, STEM, Giáo dục sức khỏe và Phòng tránh tai nạn thương tích.',
    rawLessons: [
      {
        week: '7 - 8',
        lessonName: 'Bài 8: Ánh sáng và sự truyền ánh sáng (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 2; Tiết 2: Phần 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.C5.1): Nhận biết AI (qua camera) cần ánh sáng để "nhìn" giống mắt người. Thử nghiệm che camera để HS thấy AI bị hạn chế khi thiếu sáng.',
      },
      {
        week: '8 - 9',
        lessonName: 'Bài 9: Vai trò của ánh sáng (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 2; Tiết 2: Phần 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A2.1): Trải nghiệm mô hình "Nhà thông minh" sử dụng AI cảm biến ánh sáng để tự động điều chỉnh rèm hoặc đèn, giúp bảo vệ thị lực và tiết kiệm điện.',
      },
      {
        week: '9 - 10',
        lessonName: 'Bài 10: Âm thanh và sự truyền âm thanh (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.C2.1): Nhận biết AI có khả năng phân tích âm thanh. Tìm hiểu cách các nhà khoa học dùng AI để phân loại tiếng kêu của động vật trong rừng để bảo tồn.',
      },
      {
        week: '10 - 11',
        lessonName: 'Bài 11: Âm thanh trong cuộc sống (3 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2; Tiết 3: Phần 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết quyền được sống trong môi trường an toàn, tránh tiếng ồn có hại và biết giữ trật tự nơi công cộng.\n- Tích hợp AI (4.A2.2): Trải nghiệm tính năng dịch trực tiếp (Live Caption) trên điện thoại để thấy AI hỗ trợ người khiếm thính chuyển đổi âm thanh thành văn bản.\n- Tích hợp STEM: Âm thanh trong cuộc sống.',
      },
      {
        week: '12',
        lessonName: 'Bài 12: Nhiệt độ và sự truyền nhiệt (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp giáo dục sức khỏe: HS biết đo và theo dõi nhiệt độ cơ thể đúng cách; nhận biết số đo nhiệt độ bất thường, báo ngay cho người lớn và không tự ý dùng thuốc khi chưa có hướng dẫn.\n- Tích hợp phòng tránh tai nạn thương tích: HS biết phòng tránh bỏng do nước nóng, vật nóng và các nguồn nhiệt; thực hiện thao tác an toàn, không tự ý chạm vào vật nóng và biết báo người lớn khi có nguy cơ mất an toàn.',
      },
      {
        week: '13',
        lessonName: 'Bài 13: Vật dẫn nhiệt tốt, vật dẫn nhiệt kém (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A2.1): Giới thiệu cảm biến nhiệt AI giúp cảnh báo cháy rừng hoặc tự động ngắt điện khi thiết bị gia dụng (bàn là, nồi cơm) quá nóng để bảo vệ an toàn.\n- Tích hợp STEM: Dẫn nhiệt.',
      },
      {
        week: '14',
        lessonName: 'Bài 14: Ôn tập chủ đề Năng lượng (1 tiết)',
        subLessonName: 'Tiết 1: Ôn tập tổng hợp chủ đề Năng lượng',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): So sánh giải thích của AI và bài học thực tế về hiện tượng truyền nhiệt, từ đó rèn luyện tư duy phản biện và kiểm chứng thông tin công nghệ.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-kh-cd3',
    subject: 'Khoa học',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 19',
    totalPeriods: 10,
    chapterCode: 'KH4-CĐ3',
    chapterTitle: 'Chủ đề 3: Thực vật và động vật',
    topicTitle:
      'Bài 15: Thực vật cần gì để sống? (3 tiết); Bài 16: Động vật cần gì để sống? (3 tiết); Bài 17: Chăm sóc cây trồng, vật nuôi (2 tiết); Ôn tập đánh giá HKI (1 tiết); Bài 18: Ôn tập chủ đề Thực vật và động vật (1 tiết)',
    adjustedContentSummary:
      'Các yếu tố cần cho sự sống của thực vật, động vật và cách chăm sóc cây trồng, vật nuôi; Tích hợp AI (4.A1.1, 4.C2.1, 4.D1.1, 4.D2.1) và BVMT.',
    rawLessons: [
      {
        week: '14 - 15',
        lessonName: 'Bài 15: Thực vật cần gì để sống? (3 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3; Tiết 3: Phần 4',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.A1.1): Xem clip về "Nông nghiệp thông minh" nơi AI phân tích hình ảnh lá cây để cảnh báo nông dân về tình trạng sâu bệnh hoặc thiếu nước.\n- Tích hợp BVMT: HS biết chăm sóc cây xanh, không bẻ cành, hái lá; có trách nhiệm bảo vệ môi trường sống của thực vật.',
      },
      {
        week: '16 - 17',
        lessonName: 'Bài 16: Động vật cần gì để sống? (3 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2; Tiết 3: Phần 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.C2.1): Tìm hiểu về vòng đeo cổ thông minh sử dụng AI để theo dõi nhu cầu dinh dưỡng, nhịp tim và sức khỏe của vật nuôi hằng ngày.',
      },
      {
        week: '17 - 18',
        lessonName: 'Bài 17: Chăm sóc cây trồng, vật nuôi (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.D1.1): Thảo luận và vẽ phác thảo ý tưởng một "Robot chăm sóc thú cưng" hoặc hệ thống tưới cây tự động tích hợp AI giúp làm việc thay con người.\n- Tích hợp BVMT: HS biết giữ vệ sinh khu nuôi/trồng, tiết kiệm nước, thu gom rác và chất thải đúng nơi quy định.',
      },
      {
        week: '18',
        lessonName: 'Ôn tập đánh giá HKI (1 tiết)',
        subLessonName: 'Kiểm tra, đánh giá định kì cuối học kì I môn Khoa học',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Hệ thống kiến thức học kì I và thực hiện đánh giá định kì cuối HKI theo Thông tư 27/2020/TT-BGDĐT.',
      },
      {
        week: '19',
        lessonName: 'Bài 18: Ôn tập chủ đề Thực vật và động vật (1 tiết)',
        subLessonName: 'Tiết 1: Ôn tập chủ đề 3',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.D2.1): Thảo luận về việc con người cần liên tục cập nhật hình ảnh các loài sinh vật mới cho AI để máy không nhận diện nhầm các loài động vật hiếm.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-kh-cd4',
    subject: 'Khoa học',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 22',
    totalPeriods: 7,
    chapterCode: 'KH4-CĐ4',
    chapterTitle: 'Chủ đề 4: Nấm',
    topicTitle:
      'Bài 19: Đặc điểm chung của nấm (2 tiết); Bài 20: Nấm ăn và nấm trong chế biến thực phẩm (2 tiết); Bài 21: Nấm gây hỏng thực phẩm và nấm độc (2 tiết); Bài 22: Ôn tập chủ đề Nấm (1 tiết)',
    adjustedContentSummary:
      'Nhận diện đặc điểm chung của nấm, nấm ăn, nấm men, nấm mốc gây hỏng thực phẩm và phòng tránh ngộ độc nấm độc; Tích hợp NLS (1.1, 1.2), AI (4.C5.1, 4.C2.1, 4.D2.1), KNS.',
    rawLessons: [
      {
        week: '19 - 20',
        lessonName: 'Bài 19: Đặc điểm chung của nấm (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 2; Tiết 2: Phần 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a: HS quan sát hình ảnh về các loại nấm từ nguồn GV cung cấp, biết tìm thông tin đơn giản và ghi lại đặc điểm chính.\n- Tích hợp AI (4.C5.1): Trải nghiệm công cụ Teachable Machine để dạy máy tính nhận diện và phân biệt 2-3 loại nấm khác nhau qua hình ảnh thực tế.',
      },
      {
        week: '20 - 21',
        lessonName: 'Bài 20: Nấm ăn và nấm trong chế biến thực phẩm (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm thông tin đơn giản về nấm ăn; biết phân biệt thông tin chính xác, không tự ý ăn nấm lạ theo hình ảnh trên mạng.\n- Tích hợp AI (4.C2.1): Sử dụng Chatbot AI để tra cứu giá trị dinh dưỡng của các loại nấm ăn được và gợi ý thực đơn món ăn lành mạnh từ nấm.',
      },
      {
        week: '21 - 22',
        lessonName: 'Bài 21: Nấm gây hỏng thực phẩm và nấm độc (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 2 (mục 1); Tiết 2: Phần 2 (mục 2, 3), phần 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm hình ảnh nấm độc/nấm làm hỏng thực phẩm từ nguồn tin cậy, biết đối chiếu với hướng dẫn của GV.\n- Tích hợp AI (4.D2.1): Thảo luận lý do AI vẫn có thể nhận nhầm nấm độc, từ đó hiểu rằng con người cần liên tục nâng cấp dữ liệu để đảm bảo an toàn tuyệt đối cho người dùng.\n- Tích hợp KNS: HS nhận biết nguy cơ ngộ độc do nấm lạ/thực phẩm hỏng; biết quyền được bảo vệ sức khỏe và báo người lớn khi nghi ngờ thực phẩm không an toàn.',
      },
      {
        week: '22',
        lessonName: 'Bài 22: Ôn tập chủ đề Nấm (1 tiết)',
        subLessonName: 'Tiết 1: Ôn tập chủ đề 4',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp AI (4.C5.1): Sử dụng ứng dụng AI để phân loại các loại nấm đã học thông qua hình ảnh vẽ tay của học sinh để kiểm tra khả năng học máy của thiết bị.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-kh-cd5',
    subject: 'Khoa học',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 29',
    totalPeriods: 14,
    chapterCode: 'KH4-CĐ5',
    chapterTitle: 'Chủ đề 5: Con người và sức khỏe',
    topicTitle:
      'Bài 23: Vai trò của chất dinh dưỡng đối với cơ thể (2 tiết); Bài 24: Chế độ ăn uống cân bằng (3 tiết); Bài 25: Một số bệnh liên quan đến dinh dưỡng (3 tiết); Bài 26: Thực phẩm an toàn (2 tiết); Bài 27: Phòng tránh đuối nước (2 tiết); Bài 28: Ôn tập chủ đề Con người và sức khỏe (2 tiết)',
    adjustedContentSummary:
      'Vai trò các nhóm chất dinh dưỡng, chế độ ăn uống cân bằng, phòng bệnh liên quan đến dinh dưỡng, lựa chọn thực phẩm an toàn và phòng tránh đuối nước; Tích hợp AI (4.B2.1, 4.A1.2, 4.C2.1, 4.A2.1), QCN, STEM, NLS, KNS.',
    rawLessons: [
      {
        week: '23',
        lessonName: 'Bài 23: Vai trò của chất dinh dưỡng đối với cơ thể (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.B2.1): Giáo dục an toàn số: Biết bảo vệ thông tin cá nhân (địa chỉ, số điện thoại) khi tham gia các ứng dụng AI theo dõi sức khỏe hoặc tư vấn dinh dưỡng.',
      },
      {
        week: '24 - 25',
        lessonName: 'Bài 24: Chế độ ăn uống cân bằng (3 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2 (mục 1, 2); Tiết 3: Phần 2 (mục 3)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết quyền được chăm sóc sức khỏe, được ăn uống đủ chất; biết lựa chọn thực phẩm phù hợp để cơ thể phát triển.\n- Tích hợp AI (4.A1.2): HS yêu cầu AI gợi ý 3 bữa ăn cân bằng, sau đó đối chiếu với Tháp dinh dưỡng để tự đánh giá tính hợp lý và quyết định thực đơn cuối cùng.\n- Tích hợp STEM: Ăn uống cân bằng.\n- Tích hợp NLS 5.2.CB2a: HS lập thực đơn cân bằng đơn giản bằng bảng/phiếu số theo hướng dẫn của GV.',
      },
      {
        week: '25 - 26',
        lessonName: 'Bài 25: Một số bệnh liên quan đến dinh dưỡng (3 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2; Tiết 3: Phần 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 1.2.CB2a: GV dùng AI/học liệu số gợi ý tình huống về dinh dưỡng; HS kiểm tra, chọn thông tin đúng và nêu cách phòng bệnh.\n- Tích hợp AI (4.A1.2): Đóng vai "Bác sĩ số", sử dụng ứng dụng AI giả định để phân tích thực đơn và cảnh báo các thói quen dẫn đến bệnh thừa cân, béo phì.',
      },
      {
        week: '27',
        lessonName: 'Bài 26: Thực phẩm an toàn (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết quyền được sử dụng thực phẩm an toàn, biết từ chối thực phẩm không bảo đảm vệ sinh và báo người lớn khi phát hiện nguy cơ.\n- Tích hợp KNS: HS biết đọc thông tin cần thiết trên bao bì, tránh thực phẩm không rõ nguồn gốc.\n- Tích hợp AI (4.C2.1): HS biết AI có thể hỗ trợ quét mã QR, truy xuất nguồn gốc và phân tích hình ảnh để kiểm tra thực phẩm, nhưng con người vẫn phải quan sát, kiểm tra hạn dùng và hỏi người lớn.',
      },
      {
        week: '28',
        lessonName: 'Bài 27: Phòng tránh đuối nước (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2, 3',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A2.1): HS nhận biết hệ thống camera AI tại bể bơi có thể hỗ trợ phát hiện sớm người gặp nguy hiểm dưới nước để cảnh báo cứu nạn.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm kiếm thông tin/hình ảnh về nguyên tắc an toàn khi bơi từ nguồn GV cung cấp; biết chọn thông tin đáng tin cậy, không làm theo video thử thách hoặc hướng dẫn nguy hiểm trên mạng.',
      },
      {
        week: '29',
        lessonName: 'Bài 28: Ôn tập chủ đề Con người và sức khỏe (2 tiết)',
        subLessonName: 'Tiết 1: Phần 1, 2; Tiết 2: Phần 3, 4',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS sử dụng bảng/phiếu số đơn giản để hệ thống kiến thức và lập bảng nhắc việc chăm sóc sức khỏe cá nhân.\n- Tích hợp AI (4.B2.1): Củng cố quy tắc không chia sẻ bí mật đời tư, thông tin sức khỏe cá nhân cho ứng dụng số.\n- Tích hợp QCN: HS hiểu trẻ em có quyền được chăm sóc sức khỏe, được bảo vệ khỏi nguy cơ mất an toàn.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-kh-cd6',
    subject: 'Khoa học',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 35',
    totalPeriods: 12,
    chapterCode: 'KH4-CĐ6',
    chapterTitle: 'Chủ đề 6: Sinh vật và môi trường & Ôn tập cuối năm',
    topicTitle:
      'Bài 29: Chuỗi thức ăn trong tự nhiên (3 tiết); Bài 30: Vai trò của thực vật trong chuỗi thức ăn (3 tiết); Bài 31: Ôn tập chủ đề Sinh vật và môi trường (1 tiết); Ôn tập và đánh giá cuối năm (3 tiết); Tổng kết môn học (1 tiết); Kiểm tra cuối học kì II (1 tiết)',
    adjustedContentSummary:
      'Chuỗi thức ăn trong tự nhiên, vai trò của thực vật đối với sự sống và cân bằng sinh thái; Tích hợp BVMT, STEM, QCN, AI (4.D1.1, 4.A1.1, 4.A3.1), NLS (1.1, 1.2, 3.1, 5.2), ĐĐLS.',
    rawLessons: [
      {
        week: '30 - 31',
        lessonName: 'Bài 29: Chuỗi thức ăn trong tự nhiên (3 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2; Tiết 3: Phần 3, 4, 5',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT: HS nhận biết các sinh vật phụ thuộc lẫn nhau qua quan hệ thức ăn, từ đó có ý thức bảo vệ môi trường sống.\n- Tích hợp STEM: HS vận dụng kiến thức khoa học, kĩ năng sắp xếp và thiết kế để tạo mô hình chuỗi thức ăn.\n- Tích hợp QCN & AI (4.D1.1): HS hình thành ý tưởng dùng AI/cảm biến theo dõi số lượng loài để cảnh báo mất cân bằng chuỗi thức ăn.\n- Tích hợp NLS 5.2.CB2a: Lựa chọn công cụ số đơn giản để lập danh sách, trình bày chuỗi thức ăn.',
      },
      {
        week: '31 - 32',
        lessonName: 'Bài 30: Vai trò của thực vật trong chuỗi thức ăn (3 tiết)',
        subLessonName: 'Tiết 1: Phần 1; Tiết 2: Phần 2 (mục 1, 2); Tiết 3: Phần 2 (mục 3, 4)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp BVMT: HS hiểu vai trò của thực vật, hình thành ý thức trồng, chăm sóc cây xanh và bảo vệ môi trường sống.\n- Tích hợp NLS 1.1.CB2a, 3.1.CB2a: Tìm hình ảnh sinh vật từ nguồn GV cung cấp, chọn hình phù hợp và sắp xếp thành sơ đồ chuỗi thức ăn.\n- Tích hợp AI (4.A1.1): HS nhận biết AI có thể phân tích ảnh vệ tinh để theo dõi độ phủ xanh, hỗ trợ quản lí rừng và bảo vệ đa dạng sinh học.',
      },
      {
        week: '33',
        lessonName: 'Bài 31: Ôn tập chủ đề Sinh vật và môi trường (1 tiết)',
        subLessonName: 'Tiết 1: Ôn tập chủ đề 6',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp NLS 1.2.CB2a: HS quan sát tranh/video, nhận biết thông tin chính và phân biệt thông tin phù hợp với nội dung bài học.\n- Tích hợp AI (4.D1.1): HS thiết kế ý tưởng hệ thống AI bảo vệ hệ sinh thái địa phương.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS không bẻ cành, hái hoa, phá tổ chim; biết giữ gìn cảnh quan và yêu thiên nhiên.',
      },
      {
        week: '33 - 34',
        lessonName: 'Ôn tập và đánh giá cuối năm (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2, Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS dùng phiếu/công cụ số đơn giản để hệ thống và ghi kết quả ôn tập.\n- Tích hợp AI (4.A3.1): HS hiểu AI tạo câu hỏi hoặc gợi ý có thể sai; con người phải dùng an toàn, kiểm tra và chịu trách nhiệm với đáp án.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS vận dụng kiến thức khoa học để sống an toàn, tiết kiệm, nhân ái, có trách nhiệm với cộng đồng và thiên nhiên.',
      },
      {
        week: '35',
        lessonName: 'Tổng kết môn học & Kiểm tra cuối học kì II (2 tiết)',
        subLessonName: 'Tiết 1: Tổng kết môn học; Tiết 2: Kiểm tra cuối học kì II',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: HS trình bày sản phẩm học tập yêu thích bằng tranh, sơ đồ hoặc slide đơn giản; biết chọn hình phù hợp, đặt tên tệp và không công khai thông tin cá nhân.\n- Đánh giá định kì Cuối năm học môn Khoa học lớp 4.',
      },
    ],
  }),
];

// ============================================================================
// 4. MÔN ĐẠO ĐỨC LỚP 4 (8 CHỦ ĐỀ, 9 BÀI HỌC + 4 TIẾT THỰC HÀNH KĨ NĂNG, 35 TIẾT)
// ============================================================================
export const GRADE4_DAO_DUC_TOPICS: CurriculumTopic[] = [
  buildGrade4Topic({
    id: 'cur-nda-g4-dd-cd1-2',
    subject: 'Đạo đức',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 9',
    totalPeriods: 9,
    chapterCode: 'DD4-CĐ1-2',
    chapterTitle: 'Chủ đề 1: Biết ơn người lao động & Chủ đề 2: Cảm thông, giúp đỡ người gặp khó khăn',
    topicTitle:
      'Bài 1: Biết ơn người lao động (4 tiết); Bài 2: Cảm thông, giúp đỡ người gặp khó khăn (4 tiết); Thực hành kĩ năng giữa học kỳ I (1 tiết)',
    adjustedContentSummary:
      'Thể hiện lòng biết ơn người lao động bằng lời nói, việc làm cụ thể; biết cảm thông, giúp đỡ người gặp khó khăn; Tích hợp AI (4.A1.1, 4.C2.1, 4.A2.2), QCN, NLS (1.1, 1.2, 2.3, 4.1), ĐĐLS.',
    rawLessons: [
      {
        week: '1 - 4',
        lessonName: 'Bài 1: Biết ơn người lao động (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1, 2; Tiết 2: Khám phá phần 3; Tiết 3: Luyện tập bài 1, 2; Tiết 4: Luyện tập bài 3, 4, vận dụng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp AI (4.A1.1; 4.C2.1): Nhận biết AI là công cụ hỗ trợ người lao động tăng năng suất. Tìm hiểu về các "người lao động thông minh" (Robot thu hoạch lúa, AI chẩn đoán bệnh).\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết thể hiện lòng biết ơn người lao động bằng lời nói và việc làm cụ thể; biết chào hỏi, cảm ơn, giúp đỡ người lao động phù hợp với khả năng.\n- Tích hợp QCN: HS biết người lao động có quyền được tôn trọng; hình thành thái độ biết ơn, lễ phép với người lao động.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm tranh ảnh, bài thơ, câu chuyện về người lao động từ nguồn phù hợp; biết ghi nguồn và chọn thông tin tin cậy.',
      },
      {
        week: '5 - 8',
        lessonName: 'Bài 2: Cảm thông, giúp đỡ người gặp khó khăn (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1; Tiết 2: Khám phá phần 2; Tiết 3: Luyện tập bài 1, 2, 3; Tiết 4: Luyện tập bài 4, vận dụng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp giáo dục quyền con người (QCN): HS nhận biết người gặp khó khăn có quyền được cảm thông, hỗ trợ, bảo vệ, chăm sóc và không bị phân biệt đối xử.\n- Tích hợp AI (4.A2.2): Nhận biết AI hỗ trợ người yếu thế để nối dài lòng nhân ái. Giới thiệu các ứng dụng AI giúp người khiếm thị "nhìn" vật dụng hoặc AI chuyển giọng nói thành văn bản cho người khiếm thính.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS chia sẻ thông điệp giúp đỡ người khó khăn trên môi trường số một cách lịch sự, không đăng hình ảnh/thông tin riêng tư khi chưa được đồng ý.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS sẵn sàng giúp đỡ người gặp khó khăn phù hợp với khả năng, biết lan tỏa tinh thần nhân ái.',
      },
      {
        week: '9',
        lessonName: 'Thực hành kĩ năng giữa học kỳ I (1 tiết)',
        subLessonName: 'Ôn tập và thực hành xử lý tình huống Chủ đề 1 & 2',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp giáo dục quyền con người: Củng cố nhận thức về quyền được tôn trọng, quyền được giúp đỡ khi gặp khó khăn.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Rèn lối sống nhân ái, chăm chỉ, trung thực, có trách nhiệm.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-dd-cd3-4-5',
    subject: 'Đạo đức',
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 20',
    totalPeriods: 11,
    chapterCode: 'DD4-CĐ3-5',
    chapterTitle: 'Chủ đề 3: Yêu lao động, Chủ đề 4: Tôn trọng tài sản của người khác & Chủ đề 5: Bảo vệ của công',
    topicTitle:
      'Bài 3: Yêu lao động (4 tiết); Bài 4: Tôn trọng tài sản của người khác (3 tiết); Thực hành kĩ năng cuối học kỳ I (1 tiết); Bài 5: Bảo vệ của công (3 tiết)',
    adjustedContentSummary:
      'Rèn tính chăm chỉ, tự giác yêu lao động; tôn trọng tài sản cá nhân, dữ liệu số của người khác và bảo vệ tài sản công cộng; Tích hợp AI (4.A1.2, 4.B2.1, 4.A2.1), NLS (4.1.CB2b), QCN, ANQP, ĐĐLS.',
    rawLessons: [
      {
        week: '10 - 13',
        lessonName: 'Bài 3: Yêu lao động (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1; Tiết 2: Khám phá phần 2; Tiết 3: Luyện tập bài 1, 2, 3; Tiết 4: Luyện tập bài 4, vận dụng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): Hiểu AI hỗ trợ làm việc nhưng không thay thế được ý chí của con người. Thảo luận: AI có thể làm giúp việc nhà lặp đi lặp lại, nhưng sự kiên trì và tự giác trong học tập, lao động của học sinh là điều AI không có được.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS rèn thói quen chăm chỉ, tự giác; biết yêu thương cha mẹ, quý trọng mồ hôi công sức của người lao động và chia sẻ việc nhà phù hợp với khả năng.\n- Tích hợp QCN: HS hiểu trẻ em được bảo vệ khỏi lao động nặng nhọc, độc hại; biết tham gia lao động vừa sức, phù hợp lứa tuổi.',
      },
      {
        week: '14 - 16',
        lessonName: 'Bài 4: Tôn trọng tài sản của người khác (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1; Tiết 2: Khám phá phần 2; Tiết 3: Luyện tập bài 1, 2, 3, 4, vận dụng',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.B2.1): Nhận thức dữ liệu cá nhân là "tài sản" cần được tôn trọng. Giáo dục học sinh không tự ý sử dụng tài khoản, mật khẩu hoặc hình ảnh của bạn bè để hỏi AI hoặc đăng tải lên mạng khi chưa được phép.\n- Tích hợp năng lực số 4.1.CB2b: HS phân biệt được một số rủi ro đơn giản khi tự ý sử dụng thiết bị, tài khoản, mật khẩu, hình ảnh hoặc dữ liệu của người khác; biết bảo vệ thông tin cá nhân của bản thân và tôn trọng tài sản số của người khác.\n- Tích hợp QCN & ĐĐLS: HS hiểu quyền về tài sản và quyền riêng tư; biết xin phép, giữ gìn và không tự ý sử dụng tài sản của người khác; không lấy của rơi làm của riêng.',
      },
      {
        week: '17',
        lessonName: 'Thực hành kĩ năng cuối học kỳ I (1 tiết)',
        subLessonName: 'Đánh giá cuối học kỳ I môn Đạo đức',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp giáo dục quyền con người & ĐĐLS: HS củng cố nhận thức về quyền sở hữu tài sản, quyền được tôn trọng và bổn phận không xâm phạm tài sản của người khác.',
      },
      {
        week: '18 - 20',
        lessonName: 'Bài 5: Bảo vệ của công (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1; Tiết 2: Khám phá phần 2, Luyện tập bài 1, 2; Tiết 3: Luyện tập bài 3, 4, vận dụng',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp AI (4.A2.1): Biết AI hỗ trợ xã hội bảo vệ các giá trị chung. Tìm hiểu về hệ thống camera thông minh (AI) tại công viên hoặc thư viện giúp phát hiện các hành vi phá hoại tài sản công để cảnh báo kịp thời.\n- Tích hợp ANQP & QCN & ĐĐLS: HS hiểu lợi ích của việc bảo vệ tài sản chung, công trình công cộng, cây xanh, thiết bị trường lớp; biết không phá hoại, không lãng phí của công, góp phần xây dựng trường lớp văn minh, sạch đẹp.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-dd-cd6-7-8',
    subject: 'Đạo đức',
    semester: 'HK2',
    weekRange: 'Tuần 21 – Tuần 35',
    totalPeriods: 15,
    chapterCode: 'DD4-CĐ6-8',
    chapterTitle:
      'Chủ đề 6: Thiết lập và duy trì quan hệ bạn bè, Chủ đề 7: Quý trọng đồng tiền & Chủ đề 8: Quyền và bổn phận của trẻ em',
    topicTitle:
      'Bài 6: Thiết lập quan hệ bạn bè (2 tiết); Bài 7: Duy trì quan hệ bạn bè (3 tiết); Thực hành kĩ năng giữa HKII (1 tiết); Bài 8: Quý trọng đồng tiền (4 tiết); Bài 9: Quyền và bổn phận của trẻ em (4 tiết); Thực hành kĩ năng cuối HKII (1 tiết)',
    adjustedContentSummary:
      'Biết thiết lập và duy trì tình bạn đẹp, văn minh cả trong đời thực và môi trường số; quý trọng đồng tiền, chi tiêu tiết kiệm; thực hiện quyền và bổn phận của trẻ em; Tích hợp AI (4.A1.2, 4.D2.1, 4.A2.1, 4.C2.1, 4.A3.1, 4.B2.1), QCN, NLS, ĐĐLS.',
    rawLessons: [
      {
        week: '21 - 22',
        lessonName: 'Bài 6: Thiết lập quan hệ bạn bè (2 tiết)',
        subLessonName: 'Tiết 1: Khám phá; Tiết 2: Luyện tập, vận dụng',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp AI (4.A1.2): Phân biệt tình bạn thực sự và tương tác mô phỏng của AI. Thảo luận: Một chatbot AI có thể nói lời ngọt ngào, nhưng nó có thực sự là "bạn" biết buồn vui và sẻ chia như người bạn thật sự không?\n- Tích hợp QCN: HS biết quyền được kết bạn, được tôn trọng; giao tiếp với bạn trong nhóm lớp/môi trường số lịch sự, không nói xấu, không chia sẻ thông tin riêng của bạn.',
      },
      {
        week: '23 - 25',
        lessonName: 'Bài 7: Duy trì quan hệ bạn bè (3 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1; Tiết 2: Khám phá phần 2, Luyện tập bài 1; Tiết 3: Luyện tập bài 2, 3, 4, vận dụng',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp giáo dục quyền con người (QCN): HS có quyền được tôn trọng, được kết bạn, được tham gia hoạt động cùng bạn bè trong môi trường an toàn; không bị phân biệt đối xử, không bị bắt nạt, trêu chọc.\n- Tích hợp AI (4.D2.1): Sử dụng công nghệ để gắn kết bạn bè một cách trách nhiệm. Đánh giá các ứng dụng liên lạc có AI, đề xuất các "quy tắc ứng xử lịch sự" để duy trì tình bạn đẹp trong môi trường số.\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS biết nhắn tin, trao đổi với bạn trên môi trường số bằng lời lẽ phù hợp; không đăng ảnh, video của bạn khi chưa được đồng ý.',
      },
      {
        week: '26',
        lessonName: 'Thực hành kĩ năng giữa học kỳ II (1 tiết)',
        subLessonName: 'Thực hành kĩ năng thiết lập và duy trì tình bạn',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp QCN & ĐĐLS: Rèn lối sống hòa đồng, đoàn kết, biết cảm thông, giúp đỡ bạn; xây dựng tập thể lớp thân thiện, an toàn.',
      },
      {
        week: '27 - 30',
        lessonName: 'Bài 8: Quý trọng đồng tiền (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1; Tiết 2: Khám phá phần 2; Tiết 3: Khám phá phần 3, 4; Tiết 4: Luyện tập, vận dụng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp AI (4.A2.1; 4.C2.1): Nhận biết AI hỗ trợ quản lý tài chính thông minh. Giới thiệu các ứng dụng quản lý chi tiêu sử dụng AI để giúp con người biết tiết kiệm và chi tiêu hợp lý theo điều kiện gia đình.\n- Tích hợp QCN & ĐĐLS: HS nhận biết quyền về tài sản cá nhân; biết quý trọng đồng tiền, hiểu công sức lao động tạo ra tiền; có thái độ tiết kiệm, không đua đòi.\n- Tích hợp NLS 5.2.CB2a: HS lập bảng kế hoạch chi tiêu tiết kiệm; GV có thể dùng AI gợi ý tình huống mua sắm, HS thảo luận và lựa chọn phương án phù hợp.',
      },
      {
        week: '31 - 34',
        lessonName: 'Bài 9: Quyền và bổn phận của trẻ em (4 tiết)',
        subLessonName: 'Tiết 1: Khám phá phần 1; Tiết 2: Khám phá phần 2; Tiết 3: Luyện tập bài 1, 2, 3; Tiết 4: Luyện tập bài 4, 5, vận dụng',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QCN: HS nhận biết các quyền cơ bản và bổn phận của trẻ em trong gia đình, nhà trường, cộng đồng; biết tôn trọng quyền của bản thân, bạn bè.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 4.1.CB2b: HS xem/quan sát video, tranh ảnh về quyền và bổn phận trẻ em từ nguồn GV cung cấp; tìm câu chuyện về tấm gương thực hiện tốt bổn phận trẻ em, bảo vệ thông tin cá nhân.\n- Tích hợp AI (4.A3.1; 4.B2.1): Trẻ em có quyền được an toàn và bảo mật khi dùng AI. Thảo luận về quyền từ chối cung cấp thông tin cá nhân cho các ứng dụng AI không rõ nguồn gốc để bảo vệ bản thân khỏi rủi ro bị lợi dụng.',
      },
      {
        week: '35',
        lessonName: 'Thực hành kĩ năng cuối học kỳ II (1 tiết)',
        subLessonName: 'Đánh giá cuối năm học môn Đạo đức lớp 4',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent: 'Tổng kết và đánh giá kết quả rèn luyện môn Đạo đức cuối học kỳ II.',
      },
    ],
  }),
];

// ============================================================================
// 5. MÔN LỊCH SỬ VÀ ĐỊA LÍ LỚP 4 (70 TIẾT / 35 TUẦN; 27 BÀI HỌC)
// ============================================================================
export const GRADE4_LICH_SU_DIA_LI_TOPICS: CurriculumTopic[] = [
  buildGrade4Topic({
    id: 'cur-nda-g4-lsdl-md-dp',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 3',
    totalPeriods: 6,
    chapterCode: 'LSĐL4-CĐ1',
    chapterTitle: 'Mở đầu & Địa phương em',
    topicTitle:
      'Bài 1: Làm quen với phương tiện học tập môn Lịch sử và Địa lí (2 tiết); Bài 2: Thiên nhiên và con người ở địa phương em (2 tiết); Bài 3: Lịch sử và văn hoá truyền thống địa phương em (2 tiết)',
    adjustedContentSummary:
      'Sử dụng bản đồ, lược đồ, biểu đồ, tranh ảnh học tập Lịch sử và Địa lí; tìm hiểu thiên nhiên, con người, lịch sử và văn hoá truyền thống địa phương; Tích hợp QPAN (xác định Hoàng Sa, Trường Sa), NLS (1.1, 1.2, 3.1, 5.2), AI (4.A1.2), BVMT, STEM, ĐĐLS.',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Làm quen với phương tiện học tập môn Lịch sử và Địa lí (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QPAN: Khai thác bản đồ Việt Nam, lược đồ khởi nghĩa Hai Bà Trưng để giáo dục lòng yêu nước, ý thức học đúng, nói đúng về chủ quyền, toàn vẹn lãnh thổ; xác định vị trí Hoàng Sa, Trường Sa trên bản đồ.\n- Tích hợp NLS 1.1.CB2a: HS quan sát bản đồ số/hình ảnh số theo hướng dẫn của GV; nhận biết thông tin cần tìm, không nhập thông tin cá nhân khi sử dụng học liệu số.\n- Tích hợp AI 4.A1.2: GV sử dụng Canva AI/ChatGPT/Gemini để tạo khung sơ đồ tư duy, câu hỏi gợi ý và phiếu phân hóa đã kiểm duyệt; HS dùng gợi ý để tự hoàn thiện sản phẩm, ghi lại điều cần sửa, không sao chép nguyên văn.',
      },
      {
        week: '2',
        lessonName: 'Bài 2: Thiên nhiên và con người ở địa phương em (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QPAN: HS sử dụng bản đồ hành chính Việt Nam mới để xác định vị trí địa phương, nhận biết địa danh sau sáp nhập và bồi dưỡng tình yêu quê hương, ý thức bảo vệ địa phương.\n- Tích hợp BVMT: HS nhận biết quyền được sống trong môi trường an toàn, trong lành; biết yêu quý, bảo vệ cảnh quan địa phương.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm thông tin cơ bản về địa phương từ nguồn GV giới thiệu; ghi nguồn, chọn lọc thông tin phù hợp và không chia sẻ dữ liệu cá nhân.',
      },
      {
        week: '3',
        lessonName: 'Bài 3: Lịch sử và văn hoá truyền thống địa phương em (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS tự hào, biết ơn các thế hệ đi trước; có ý thức giữ gìn truyền thống tốt đẹp của địa phương.\n- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: HS trình bày ngắn gọn một di tích, lễ hội hoặc nhân vật địa phương bằng tranh, sơ đồ hoặc slide đơn giản.\n- Tích hợp QPAN: Giáo dục tinh thần yêu nước, ý thức trách nhiệm bảo vệ Tổ quốc trong thời đại hôm nay.\n- Tích hợp STEM: Tạo bài trình chiếu giới thiệu lịch sử văn hoá truyền thống của địa phương.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-lsdl-tdmnpb',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK1',
    weekRange: 'Tuần 4 – Tuần 8',
    totalPeriods: 10,
    chapterCode: 'LSĐL4-CĐ2',
    chapterTitle: 'Trung du và miền núi phía Bắc',
    topicTitle:
      'Bài 4: Thiên nhiên vùng Trung du và miền núi phía Bắc (3 tiết); Bài 5: Dân cư và hoạt động sản xuất ở vùng Trung du và miền núi phía Bắc (3 tiết); Bài 6: Một số nét văn hoá ở vùng Trung du và miền núi phía Bắc (2 tiết); Bài 7: Đền Hùng và lễ giỗ Tổ Hùng Vương (2 tiết)',
    adjustedContentSummary:
      'Đặc điểm thiên nhiên, dân cư, hoạt động sản xuất, bản sắc văn hoá vùng Trung du và miền núi phía Bắc; truyền thống Đền Hùng và lễ giỗ Tổ Hùng Vương; Tích hợp QPAN, BVMT, NLS (1.1, 1.2, 4.1), QCN, AI (4.C2.1), ĐĐLS.',
    rawLessons: [
      {
        week: '4 - 5',
        lessonName: 'Bài 4: Thiên nhiên vùng Trung du và miền núi phía Bắc (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QPAN: HS nhận biết vị trí vùng biên giới phía Bắc; hình thành ý thức yêu quê hương, tôn trọng cột mốc, đường biên, chủ quyền lãnh thổ.\n- Tích hợp BVMT: HS biết vai trò của rừng đầu nguồn, nguồn nước; có ý thức phòng tránh thiên tai, bảo vệ cảnh quan miền núi.\n- Tích hợp NLS 1.1.CB2a: HS sử dụng lược đồ/bản đồ số do GV cung cấp để xác định vị trí, địa hình, sông ngòi của vùng; biết đọc chú giải và không tự ý truy cập nguồn lạ.',
      },
      {
        week: '5 - 6',
        lessonName: 'Bài 5: Dân cư và hoạt động sản xuất ở vùng Trung du và miền núi phía Bắc (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: HS tôn trọng sự đa dạng dân tộc, bình đẳng giữa các cộng đồng; không kì thị phong tục, trang phục, tiếng nói.\n- Tích hợp AI 4.C2.1: HS hiểu cách AI hỗ trợ quản lý ruộng bậc thang, phát hiện sâu bệnh hoặc vận hành nhà máy thủy điện an toàn dưới sự kiểm soát của con người.\n- Tích hợp BVMT: HS hiểu sản xuất nông nghiệp, thuỷ điện, khai thác khoáng sản cần gắn với bảo vệ rừng, đất, nước.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: GV dùng phiếu số/nguồn số đã kiểm duyệt gợi ý so sánh hoạt động sản xuất; HS kiểm chứng lại bằng SGK và nguồn GV cung cấp.',
      },
      {
        week: '7',
        lessonName: 'Bài 6: Một số nét văn hoá ở vùng Trung du và miền núi phía Bắc (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QCN: HS biết tôn trọng quyền giữ gìn bản sắc văn hoá của các dân tộc; ứng xử văn minh khi tham gia lễ hội.\n- Tích hợp AI 4.C2.1: HS biết AI có thể hỗ trợ dịch và bảo tồn điệu hát, ngôn ngữ của các dân tộc thiểu số nhưng cần kiểm chứng bằng nguồn chính thống.\n- Tích hợp NLS 1.2.CB2a, 4.1.CB2b: HS xem hình ảnh/video văn hoá từ nguồn GV cung cấp; biết không chia sẻ thông tin/hình ảnh sai lệch hoặc thiếu tôn trọng cộng đồng dân tộc.',
      },
      {
        week: '8',
        lessonName: 'Bài 7: Đền Hùng và lễ giỗ Tổ Hùng Vương (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS bồi dưỡng lòng biết ơn cội nguồn, tự hào truyền thống dựng nước và giữ nước.\n- Tích hợp QCN: HS trình bày thông điệp “Uống nước nhớ nguồn” bằng sản phẩm đơn giản; tôn trọng quyền tham gia hoạt động văn hoá phù hợp lứa tuổi.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-lsdl-dbbb',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK1',
    weekRange: 'Tuần 9 – Tuần 17',
    totalPeriods: 18,
    chapterCode: 'LSĐL4-CĐ3',
    chapterTitle: 'Đồng bằng Bắc Bộ & Ôn tập, kiểm tra cuối HKI',
    topicTitle:
      'Bài 8: Thiên nhiên vùng Đồng bằng Bắc Bộ (3 tiết); Bài 9: Dân cư và hoạt động sản xuất ở vùng Đồng bằng Bắc Bộ (3 tiết); Bài 10: Một số nét văn hoá ở vùng Đồng bằng Bắc Bộ (2 tiết); Bài 11: Sông Hồng và văn minh sông Hồng (2 tiết); Bài 12: Thăng Long - Hà Nội (3 tiết); Bài 13: Văn Miếu - Quốc Tử Giám (2 tiết); Bài 14: Ôn tập học kì I (1 tiết); Kiểm tra cuối học kì I (2 tiết)',
    adjustedContentSummary:
      'Thiên nhiên, dân cư, sản xuất, văn hoá vùng Đồng bằng Bắc Bộ; văn minh sông Hồng, lịch sử Thăng Long - Hà Nội, Văn Miếu - Quốc Tử Giám; Tích hợp Tiết kiệm nguồn nước, AI (4.D1.1, 4.A1.1, 4.A1.2, 4.A2.2), NLS (1.1, 1.2, 3.1, 5.2), QCN, ĐĐLS.',
    rawLessons: [
      {
        week: '9 - 10',
        lessonName: 'Bài 8: Thiên nhiên vùng Đồng bằng Bắc Bộ (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS hiểu vai trò của sông, đất phù sa, đê điều; có ý thức bảo vệ nguồn nước và phòng tránh ngập lụt.\n- Tích hợp AI 4.D1.1: HS nêu ý tưởng AI có thể quan sát mực nước sông Hồng để đưa ra cảnh báo lũ sớm cho người dân.\n- Tích hợp NLS 1.1.CB2a: HS đọc bản đồ/lược đồ để xác định vị trí, địa hình, sông ngòi của vùng.\n- Tích hợp QCN: Liên hệ quyền được sống an toàn trước thiên tai; HS biết việc cần làm khi có cảnh báo mưa bão, lũ lụt.',
      },
      {
        week: '10 - 11',
        lessonName: 'Bài 9: Dân cư và hoạt động sản xuất ở vùng Đồng bằng Bắc Bộ (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 5.2.CB2a: HS đọc số liệu dân cư, tìm kiếm/đối chiếu thông tin đơn giản; dùng bảng/sơ đồ số đơn giản để phân loại hoạt động sản xuất.\n- Tích hợp AI 4.A1.1: HS liên hệ việc trồng lúa ở đồng bằng Bắc Bộ với máy gặt đập thông minh tích hợp AI để tăng năng suất.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS trân trọng người lao động, quý trọng sản phẩm lao động trong nông nghiệp, thủ công nghiệp, dịch vụ.',
      },
      {
        week: '12',
        lessonName: 'Bài 10: Một số nét văn hoá ở vùng Đồng bằng Bắc Bộ (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QCN: HS tôn trọng quyền tham gia, thụ hưởng đời sống văn hoá; biết ứng xử văn minh nơi lễ hội.\n- Tích hợp NLS 3.1.CB2a: HS tạo thẻ thông tin/tranh giới thiệu một nét văn hoá vùng Đồng bằng Bắc Bộ theo mẫu GV hướng dẫn.',
      },
      {
        week: '13',
        lessonName: 'Bài 11: Sông Hồng và văn minh sông Hồng (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS nhận biết vai trò của sông Hồng đối với đời sống, sản xuất; biết sử dụng nước tiết kiệm, không xả rác xuống sông, kênh rạch.\n- Tích hợp AI 4.A1.2: HS sử dụng Canva AI/ChatGPT/Gemini do GV kiểm duyệt để gợi ý ý tưởng phục dựng hoặc vẽ lại đời sống người Việt cổ qua hoa văn trống đồng.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS tự hào về văn minh sông Hồng, trân trọng giá trị lao động và truyền thống dân tộc.',
      },
      {
        week: '14 - 15',
        lessonName: 'Bài 12: Thăng Long - Hà Nội (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS nhận biết Hà Nội là Thủ đô, trung tâm chính trị - văn hoá; bồi dưỡng tình yêu Tổ quốc; có ý thức giữ gìn di tích, nơi công cộng khi tham quan Thủ đô.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: HS tìm tư liệu đơn giản về Thăng Long - Hà Nội từ nguồn tin cậy, ghi tên nguồn và chọn lọc thông tin phù hợp.',
      },
      {
        week: '15 - 16',
        lessonName: 'Bài 13: Văn Miếu - Quốc Tử Giám (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS trân trọng truyền thống hiếu học, tôn sư trọng đạo; có ý thức chăm học và giữ gìn di tích.\n- Tích hợp AI 4.A2.2: HS đề xuất ứng dụng AI như trợ lý ảo/hướng dẫn viên ảo hỗ trợ tìm hiểu Văn Miếu cho người học và khách tham quan.\n- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: HS làm thẻ giới thiệu ngắn về Văn Miếu - Quốc Tử Giám bằng tranh, sơ đồ hoặc slide đơn giản.',
      },
      {
        week: '16 - 17',
        lessonName: 'Bài 14: Ôn tập học kì I (1 tiết) & Kiểm tra cuối học kì I (2 tiết)',
        subLessonName: 'Ôn tập HKI (1 tiết); Kiểm tra cuối HKI Tiết 1 & Tiết 2 (2 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a: GV có thể dùng Quizizz/Forms hoặc phiếu số để tạo câu hỏi ôn tập; HS làm bài theo hướng dẫn, tự nhận xét mức độ nắm bài.\n- Kiểm tra cuối HKI: Tổ chức đánh giá theo yêu cầu cần đạt, bảo đảm công bằng và bảo mật thông tin học sinh.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-lsdl-btb-ntb-tn',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK2',
    weekRange: 'Tuần 18 – Tuần 28',
    totalPeriods: 21,
    chapterCode: 'LSĐL4-CĐ4',
    chapterTitle: 'Bắc Trung Bộ và Nam Trung Bộ & Tây Nguyên',
    topicTitle:
      'Bài 15: Thiên nhiên vùng Bắc Trung Bộ và Nam Trung Bộ (6 tiết); Bài 16: Dân cư và hoạt động sản xuất ở vùng Bắc Trung Bộ và Nam Trung Bộ (4 tiết); Bài 17: Một số nét văn hoá ở vùng Bắc Trung Bộ và Nam Trung Bộ (3 tiết); Bài 18: Truyền thống yêu nước, cách mạng của đồng bào Bắc Trung Bộ và Nam Trung Bộ (2 tiết); Bài 19: Cố đô Huế (2 tiết); Bài 20: Phố cổ Hội An (2 tiết); Bài 21: Lễ hội Cồng chiêng Tây Nguyên (2 tiết)',
    adjustedContentSummary:
      'Thiên nhiên, biển đảo (Hoàng Sa, Trường Sa), dân cư, kinh tế biển, di sản văn hoá (Cố đô Huế, Phố cổ Hội An, Mộc bản Triều Nguyễn, Lễ Khao lề thế lính Hoàng Sa, Lễ hội Cồng chiêng Tây Nguyên); Tích hợp QPAN, AI (4.C2.1, 6.2.CB2a, 4.A3.1), BVMT, ATGT, NLS, QCN, ĐĐLS.',
    rawLessons: [
      {
        week: '18 - 20',
        lessonName: 'Bài 15: Thiên nhiên vùng Bắc Trung Bộ và Nam Trung Bộ (6 tiết)',
        subLessonName: 'Tiết 1, Tiết 2, Tiết 3, Tiết 4, Tiết 5 & Tiết 6',
        periodAllocation: '6 tiết',
        periodsCount: 6,
        adjustedContent:
          '- Tích hợp QPAN: HS xác định vị trí vùng ven biển, quần đảo Hoàng Sa, Trường Sa; bồi dưỡng ý thức chủ quyền biển, đảo Việt Nam; hiểu phòng, chống thiên tai là nhiệm vụ chung.\n- Tích hợp AI 4.C2.1: HS hiểu AI có thể hỗ trợ dự báo bão, mưa lớn, sạt lở để giảm thiệt hại cho đồng bào miền Trung.\n- Tích hợp BVMT: Nhận biết tác động của địa hình, khí hậu, bão lũ, hạn hán; giữ gìn rừng, nguồn nước, bờ biển.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: Đọc bản đồ/lược đồ để xác định sông ngòi, đất, rừng, biển đảo của vùng; phân biệt thông tin đáng tin cậy.',
      },
      {
        week: '21 - 22',
        lessonName: 'Bài 16: Dân cư và hoạt động sản xuất ở vùng Bắc Trung Bộ và Nam Trung Bộ (4 tiết)',
        subLessonName: 'Tiết 1, Tiết 2, Tiết 3 & Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          '- Tích hợp QCN: HS tôn trọng sự đa dạng cộng đồng dân cư, biết đoàn kết và không phân biệt vùng miền.\n- Tích hợp QPAN & ATGT: HS hiểu hoạt động biển gắn với ý thức bảo vệ chủ quyền; tuân thủ quy định an toàn khi tham gia giao thông đường biển, đường thủy.\n- Tích hợp NLS 1.1.CB2a, 5.2.CB2a: Tìm thông tin du lịch/kinh tế biển từ nguồn GV cung cấp, trình bày bằng bảng hoặc sơ đồ đơn giản.\n- Tích hợp BVMT: Hiểu sản xuất nông nghiệp, công nghiệp, thuỷ điện cần gắn với bảo vệ tài nguyên, môi trường và sinh kế bền vững.',
      },
      {
        week: '23 - 24',
        lessonName: 'Bài 17: Một số nét văn hoá ở vùng Bắc Trung Bộ và Nam Trung Bộ (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QPAN: Giáo dục ý thức chủ quyền biển đảo qua Mộc bản Triều Nguyễn có nội dung liên quan Hoàng Sa, Trường Sa; trân trọng công lao đội Hoàng Sa qua Lễ Khao lề thế lính Hoàng Sa.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết ứng xử văn minh khi tham gia lễ hội, không chen lấn, không xả rác, giữ gìn cảnh quan di sản.\n- Tích hợp tiết kiệm và bảo vệ nguồn nước & NLS 1.1.CB2a: Tìm kiếm, chọn lọc hình ảnh/thông tin đơn giản về nét văn hoá dưới sự hướng dẫn của GV.',
      },
      {
        week: '24 - 25',
        lessonName: 'Bài 18: Truyền thống yêu nước, cách mạng của đồng bào Bắc Trung Bộ và Nam Trung Bộ (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QPAN & ĐĐLS: Tự hào về truyền thống đấu tranh bảo vệ quê hương, trân trọng lòng dũng cảm, tinh thần đoàn kết của các nhân vật lịch sử.\n- Tích hợp AI 6.2.CB2a: HS biết sử dụng công cụ AI theo hướng dẫn của GV để gợi ý dàn ý/kịch bản kể chuyện đơn giản; biết kiểm tra lại thông tin bằng SGK và nguồn chính thống.',
      },
      {
        week: '25 - 26',
        lessonName: 'Bài 19: Cố đô Huế (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết giữ gìn di tích, cảnh quan, không viết vẽ lên di sản, không xả rác khi tham quan.\n- Tích hợp AI 4.A3.1: HS thảo luận về việc AI có thể hỗ trợ thuyết minh, tìm hiểu di sản nhưng không thay thế hoàn toàn hướng dẫn viên thực sự tại các di sản văn hoá.\n- Tích hợp NLS 3.1.CB2a: HS tạo thẻ giới thiệu ngắn về Cố đô Huế bằng tranh, sơ đồ hoặc slide đơn giản; biết chọn hình ảnh phù hợp, ghi nguồn và kiểm tra lại thông tin bằng SGK.',
      },
      {
        week: '26 - 27',
        lessonName: 'Bài 20: Phố cổ Hội An (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: HS biết trân trọng di sản văn hoá, ứng xử văn minh khi tham quan phố cổ Hội An.\n- Tích hợp AI 4.A3.1 & NLS 1.2.CB2a: Đối chiếu thông tin/hình ảnh về Hội An từ SGK với nguồn GV cung cấp; biết ghi nguồn, không sử dụng hình ảnh sai chú thích.',
      },
      {
        week: '27 - 28',
        lessonName: 'Bài 21: Lễ hội Cồng chiêng Tây Nguyên (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QCN & ĐĐLS: HS tôn trọng quyền giữ gìn bản sắc văn hoá của đồng bào Tây Nguyên; tự hào, trân trọng di sản cồng chiêng, giữ gìn nếp sống văn minh, đoàn kết.\n- Tích hợp NLS 4.1.CB2b: Nhận biết rủi ro khi chia sẻ video/hình ảnh lễ hội không rõ nguồn hoặc thiếu tôn trọng văn hoá cộng đồng.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-lsdl-nb-ot',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 35',
    totalPeriods: 15,
    chapterCode: 'LSĐL4-CĐ5',
    chapterTitle: 'Nam Bộ & Ôn tập, kiểm tra cuối năm',
    topicTitle:
      'Bài 22: Thiên nhiên vùng Nam Bộ (3 tiết); Bài 23: Dân cư và hoạt động sản xuất ở vùng Nam Bộ (3 tiết - đã điều chỉnh gộp tiết 3, 4); Bài 24: Một số nét văn hoá và truyền thống yêu nước, cách mạng của đồng bào Nam Bộ (2 tiết); Bài 25: Thành phố Hồ Chí Minh (2 tiết); Bài 26: Địa đạo Củ Chi (1 tiết); Bài 27: Ôn tập (2 tiết); Kiểm tra cuối học kì II (2 tiết)',
    adjustedContentSummary:
      'Thiên nhiên sông nước, dân cư, hoạt động sản xuất, văn hoá và truyền thống yêu nước vùng Nam Bộ; Thành phố Hồ Chí Minh và Địa đạo Củ Chi (Đã điều chỉnh PPCT: gộp Bài 23 tiết 3 và 4 thành Bài 23 tiết 3; chuyển Bài 24 tiết 1 lên tuần 31); Tích hợp Tiết kiệm nguồn nước, AI (4.D1.1, 4.A1.1, 6.2.CB2a, 4.A2.1), NLS, BVMT, ATGT, QPAN, ĐĐLS.',
    rawLessons: [
      {
        week: '28 - 29',
        lessonName: 'Bài 22: Thiên nhiên vùng Nam Bộ (3 tiết)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp tiết kiệm và bảo vệ nguồn nước: HS nhận biết vùng Nam Bộ có hệ thống sông ngòi, kênh rạch, vùng trũng và biển rộng; biết sử dụng nước tiết kiệm, không xả rác xuống sông, kênh rạch.\n- Tích hợp AI 4.D1.1: HS đề xuất ý tưởng dùng cảm biến/AI theo dõi mực nước, độ mặn, ngập lụt, hạn hán để hỗ trợ người dân Nam Bộ phòng tránh thiên tai.\n- Tích hợp NLS 1.1.CB2a & BVMT: Đọc lược đồ/bản đồ số do GV cung cấp; đề xuất biện pháp giảm tác động của lũ lụt, sạt lở, hạn hán, xâm nhập mặn.',
      },
      {
        week: '30 - 31',
        lessonName: 'Bài 23: Dân cư và hoạt động sản xuất ở vùng Nam Bộ (3 tiết - gộp tiết 3, 4)',
        subLessonName: 'Tiết 1, Tiết 2 & Tiết 3 (gộp tiết 3, 4)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          '- Tích hợp QCN: Tôn trọng sự đa dạng dân cư, văn hoá, nghề nghiệp của người dân Nam Bộ.\n- Tích hợp AI 4.A1.1: Nhận diện sự hiện diện của AI trong các khu công nghiệp hiện đại và các trang trại trái cây xuất khẩu ở Nam Bộ.\n- Tích hợp tiết kiệm và bảo vệ nguồn nước, BVMT, ATGT & NLS 5.2.CB2a: Dùng bảng/sơ đồ số đơn giản để phân loại hoạt động sản xuất; liên hệ sản xuất, giao thông đường thủy với bảo vệ môi trường, nguồn nước và an toàn khi đi ghe, xuồng, phà.',
      },
      {
        week: '31 - 32',
        lessonName: 'Bài 24: Một số nét văn hoá và truyền thống yêu nước, cách mạng của đồng bào Nam Bộ (2 tiết)',
        subLessonName: 'Tiết 1 (Tuần 31) & Tiết 2 (Tuần 32)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp QPAN: HS nhận biết đời sống sông nước gắn với an toàn, trật tự, giao thông đường thủy; biết chấp hành quy định khi đi ghe, xuồng, phà, bến tàu.\n- Tích hợp lý tưởng cách mạng, đạo đức, lối sống: Trân trọng tinh thần yêu nước, lòng dũng cảm, sự kiên trung của các nhân vật lịch sử Nam Bộ.\n- Tích hợp AI 6.2.CB2a: HS dùng AI theo hướng dẫn của GV để gợi ý dàn ý/đoạn văn, kiểm chứng lại bằng SGK và nguồn chính thống.',
      },
      {
        week: '32 - 33',
        lessonName: 'Bài 25: Thành phố Hồ Chí Minh (2 tiết)',
        subLessonName: 'Tiết 1 & Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '- Tích hợp lý tưởng cách mạng: HS tự hào về Thành phố Hồ Chí Minh, thành phố mang tên Bác; biết giữ gìn hình ảnh đô thị văn minh, nghĩa tình.\n- Tích hợp AI 4.A2.1: HS nhận diện Thành phố Hồ Chí Minh là thành phố thông minh, nơi AI hỗ trợ điều hành giao thông và dịch vụ công.\n- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: Sử dụng thông tin, hình ảnh từ SGK và nguồn học liệu do GV cung cấp để lập thẻ/sơ đồ/slide giới thiệu địa danh.',
      },
      {
        week: '33',
        lessonName: 'Bài 26: Địa đạo Củ Chi (1 tiết)',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          '- Tích hợp ANQP: HS biết ơn chiến sĩ cách mạng, hiểu giá trị lịch sử của Địa đạo Củ Chi; có ý thức giữ gìn di tích.',
      },
      {
        week: '34 - 35',
        lessonName: 'Bài 27: Ôn tập cuối năm (2 tiết) & Kiểm tra cuối học kì II (2 tiết)',
        subLessonName: 'Bài 27: Ôn tập (Tiết 1, 2); Kiểm tra cuối học kì II (Tiết 1, 2)',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Hệ thống hóa kiến thức môn Lịch sử và Địa lí lớp 4 và thực hiện đánh giá định kì cuối học kì II theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),
];

// ============================================================================
// 6. MÔN HOẠT ĐỘNG TRẢI NGHIỆM LỚP 4 (9 CHỦ ĐỀ, 105 TIẾT / 35 TUẦN)
// ============================================================================
export const GRADE4_HDTN_TOPICS: CurriculumTopic[] = [
  buildGrade4Topic({
    id: 'cur-nda-g4-hdtn-cd1-2',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 8',
    totalPeriods: 24,
    chapterCode: 'HĐTN4-CĐ1-2',
    chapterTitle: 'Chủ đề 1: Nhận diện bản thân & Chủ đề 2: Nếp sống và tư duy khoa học',
    topicTitle:
      'Chủ đề 1 (Tuần 1–4): Em tự hào về bản thân, Khả năng điều chỉnh cảm xúc, Suy nghĩ tích cực (12 tiết); Chủ đề 2 (Tuần 5–8): Nền nếp sinh hoạt, Kĩ năng đặt câu hỏi, Phân loại và sắp xếp hoạt động cá nhân, Nếp sống khoa học (12 tiết)',
    adjustedContentSummary:
      'Nhận diện điểm mạnh của bản thân, điều chỉnh cảm xúc, suy nghĩ tích cực; xây dựng nền nếp sinh hoạt và rèn tư duy khoa học; Tích hợp QCN, AI (4.A1.2, 4.A1.1, 4.C2.1, 4.C5.1), KNS, NLS (1.1, 1.2, 3.1, 5.2).',
    rawLessons: [
      {
        week: '1 - 2',
        lessonName: 'Chủ đề 1: Em tự hào về bản thân & Những việc làm đáng tự hào (6 tiết)',
        subLessonName: 'SHDC: Chào năm học mới / Câu lạc bộ của em; GDTCĐ: Em tự hào về bản thân / Những việc làm đáng tự hào; SHL: Tự hào thể hiện khả năng / Niềm tự hào trong tim',
        periodAllocation: '6 tiết (Tuần 1 – 2)',
        periodsCount: 6,
        adjustedContent:
          '- Tích hợp QCN: HS biết mỗi em có quyền được tôn trọng đặc điểm riêng, được bày tỏ cảm xúc và được lắng nghe khi giới thiệu về bản thân.\n- Tích hợp AI (4.A1.2): HS hiểu AI có thể hỗ trợ gợi ý cách trình bày hoặc minh họa ý tưởng, nhưng cảm xúc tự hào và sự lựa chọn hành động tích cực là của chính bản thân các em.\n- Tích hợp KNS: Rèn kĩ năng tự nhận thức, chia sẻ cảm xúc tích cực, biết lắng nghe và cổ vũ bạn.',
      },
      {
        week: '3 - 4',
        lessonName: 'Chủ đề 1: Khả năng điều chỉnh cảm xúc & Suy nghĩ tích cực (6 tiết)',
        subLessonName: 'SHDC: Giao lưu tài năng / Trung thu của em; GDTCĐ: Khả năng điều chỉnh cảm xúc / Suy nghĩ tích cực; SHL: Điều chỉnh cảm xúc / Nghĩ tích cực - Sống vui tươi',
        periodAllocation: '6 tiết (Tuần 3 – 4)',
        periodsCount: 6,
        adjustedContent:
          '- Tích hợp QCN: HS biết mình có quyền được bày tỏ cảm xúc, được bảo vệ tinh thần và có trách nhiệm tôn trọng cảm xúc của người khác.\n- Tích hợp KNS: Rèn kĩ năng điều chỉnh cảm xúc, biết hít thở sâu, suy nghĩ tích cực, lạc quan và tự động viên bản thân.',
      },
      {
        week: '5 - 6',
        lessonName: 'Chủ đề 2: Nền nếp sinh hoạt & Kĩ năng đặt câu hỏi tìm hiểu thông tin (6 tiết)',
        subLessonName: 'SHDC: Ngày hội Cùng làm cùng vui / Cuộc phiêu lưu của sách, bút; GDTCĐ: Nền nếp sinh hoạt / Kĩ năng đặt câu hỏi; SHL: Giúp nhau thực hiện nền nếp / Rèn luyện tư duy khoa học',
        periodAllocation: '6 tiết (Tuần 5 – 6)',
        periodsCount: 6,
        adjustedContent:
          '- Tích hợp AI (4.A1.1, 4.A1.2): HS nhận biết AI/công cụ số có thể hỗ trợ gợi ý cách sắp xếp thời gian biểu, gợi ý câu hỏi hoặc ý tưởng sơ đồ tư duy, nhưng cần kiểm tra và trình bày bằng hiểu biết của mình.\n- Tích hợp KNS: Rèn kĩ năng quản lí thời gian, điều chỉnh nền nếp sinh hoạt.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a: Biết đặt câu hỏi để tìm thông tin, chọn nguồn phù hợp và bước đầu ghi chép thông tin cần thiết.',
      },
      {
        week: '7 - 8',
        lessonName: 'Chủ đề 2: Phân loại, sắp xếp hoạt động cá nhân & Nếp sống khoa học (6 tiết)',
        subLessonName: 'SHDC: Hội chợ đồ tái chế / Ngày hội STEM; GDTCĐ: Phân loại và sắp xếp hoạt động cá nhân / Nếp sống khoa học; SHL: Triển lãm sơ đồ tư duy / Tự đánh giá việc rèn luyện tư duy khoa học',
        periodAllocation: '6 tiết (Tuần 7 – 8)',
        periodsCount: 6,
        adjustedContent:
          '- Tích hợp AI (4.C2.1, 4.C5.1): HS nhận biết AI có thể hỗ trợ phân loại thông tin và trực quan hóa kế hoạch hành động, nhưng cần tự đặt mục tiêu và tự chịu trách nhiệm thực hiện.\n- Tích hợp NLS 3.1.CB2a, 5.2.CB2a: Biết dùng sơ đồ tư duy/công cụ số để trình bày thời gian biểu, chia sẻ sản phẩm an toàn, văn minh.\n- Tích hợp KNS: Rèn kĩ năng tự đánh giá quá trình rèn luyện tư duy khoa học.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-hdtn-cd3-4-5',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 9 – Tuần 18',
    totalPeriods: 30,
    chapterCode: 'HĐTN4-CĐ3-5',
    chapterTitle:
      'Chủ đề 3: Yêu trường - mến lớp, Chủ đề 4: Tự lực thực hiện nhiệm vụ & Chủ đề 5: Mái ấm gia đình (HKI)',
    topicTitle:
      'Chủ đề 3 (Tuần 9–12): Giữ gìn trường học xanh sạch đẹp, Tình bạn, Chào mừng 20/11 (12 tiết); Chủ đề 4 (Tuần 13–16): Chủ động lập kế hoạch, Giới thiệu sách, Tự lực thực hiện nhiệm vụ ở nhà và ở trường (12 tiết); Chủ đề 5 (Tuần 17–18): Gắn kết yêu thương, Đồng hành bên nhau (6 tiết)',
    adjustedContentSummary:
      'Giữ gìn vệ sinh trường lớp, xây dựng cam kết tình bạn, tri ân thầy cô; rèn tính tự lực thực hiện nhiệm vụ ở nhà và trường; gắn kết yêu thương trong gia đình; Tích hợp QCN, BVMT, AI (4.D1.1, 4.A1.2, 4.A1.1), NLS, KNS, ANQP, STEM, ĐĐLS.',
    rawLessons: [
      {
        week: '9 - 12',
        lessonName: 'Chủ đề 3: Yêu trường - mến lớp (12 tiết)',
        subLessonName: 'Thực trạng vệ sinh trường lớp; Giữ gìn trường học xanh, sạch, đẹp; Tình bạn & Cam kết tình bạn; Thông điệp yêu thương chào mừng 20-11',
        periodAllocation: '12 tiết (Tuần 9 – 12)',
        periodsCount: 12,
        adjustedContent:
          '- Tích hợp QCN: Quyền tự do bày tỏ ý kiến, quyền tự do kết giao hòa bình.\n- Tích hợp BVMT & AI (4.D1.1): Lập kế hoạch giữ gìn trường học xanh, sạch, đẹp; hình thành ý tưởng dùng AI/công cụ số để đề xuất sáng kiến giữ gìn trường học xanh.\n- Tích hợp KNS & NLS 1.1.CB2a, 5.2.CB2a: Xây dựng cam kết tình bạn; tìm bài hát, bài thơ, hình ảnh về 20/11 từ nguồn phù hợp và trình bày lời chúc bằng sản phẩm số đơn giản.',
      },
      {
        week: '13 - 16',
        lessonName: 'Chủ đề 4: Tự lực thực hiện nhiệm vụ (12 tiết)',
        subLessonName: 'Chủ động lập kế hoạch; Luyện tập giới thiệu sách; Tự lực thực hiện nhiệm vụ ở nhà; Tự lực thực hiện nhiệm vụ ở trường & Triển lãm STEM cuối HKI',
        periodAllocation: '12 tiết (Tuần 13 – 16)',
        periodsCount: 12,
        adjustedContent:
          '- Tích hợp AI (4.A1.2, 4.A1.1): Hiểu AI hỗ trợ nhưng không thay thế tư duy sáng tạo; quan sát cách robot hút bụi (AI) vận hành và thảo luận những việc nhà con người vẫn cần tự làm.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 5.2.CB2a: Lập kế hoạch thực hiện nhiệm vụ bằng bảng/phiếu số đơn giản; tìm kiếm thông tin giới thiệu sách.\n- Tích hợp KNS, ANQP & STEM: Rèn kĩ năng tự giác phục vụ bản thân; tìm hiểu ý nghĩa ngày 22/12; triển lãm sản phẩm STEM cuối học kì I.',
      },
      {
        week: '17 - 18',
        lessonName: 'Chủ đề 5: Mái ấm gia đình – Học kì I (6 tiết)',
        subLessonName: 'Gắn kết yêu thương; Ngày cuối tuần yêu thương; Biết ơn người thân; Đồng hành bên nhau',
        periodAllocation: '6 tiết (Tuần 17 – 18)',
        periodsCount: 6,
        adjustedContent:
          '- Tích hợp QCN: Quyền được đoàn tụ, liên hệ và tiếp xúc với cha mẹ.\n- Tích hợp KNS & ĐĐLS: Rèn kĩ năng lập kế hoạch cho ngày cuối tuần yêu thương; chăm học, tự giác làm việc tốt, yêu thương và gắn kết gia đình.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-hdtn-cd5-6-7',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 27',
    totalPeriods: 27,
    chapterCode: 'HĐTN4-CĐ5-7',
    chapterTitle:
      'Chủ đề 5: Mái ấm gia đình (HKII), Chủ đề 6: Phòng tránh bị xâm hại & Chủ đề 7: Kết nối cộng đồng',
    topicTitle:
      'Chủ đề 5 (Tuần 19–20): Sử dụng tiền tiết kiệm, Chi tiêu tiết kiệm trong gia đình (6 tiết); Chủ đề 6 (Tuần 21–24): Phòng tránh hành vi xâm hại thân thể, tinh thần, tình dục (12 tiết); Chủ đề 7 (Tuần 25–27): Kết nối cộng đồng, Đền ơn đáp nghĩa, Ứng xử có văn hóa (9 tiết)',
    adjustedContentSummary:
      'Sử dụng tiền tiết kiệm và mua sắm thông minh; nhận diện nguy cơ và kĩ năng phòng tránh bị xâm hại thân thể, tinh thần, tình dục (trên thực tế và môi trường số); kết nối cộng đồng và đền ơn đáp nghĩa; Tích hợp QCN, NLS, AI (4.A2.1, 4.A3.1, 4.B2.1, 4.A2.2), ANQP, BVMT, ĐĐLS.',
    rawLessons: [
      {
        week: '19 - 20',
        lessonName: 'Chủ đề 5 (tiếp): Sử dụng tiền tiết kiệm cá nhân & Chi tiêu tiết kiệm trong gia đình (6 tiết)',
        subLessonName: 'Đón Tết bên người thân; Sử dụng tiền tiết kiệm cá nhân; Lựa chọn chi tiêu "Cần, muốn và có thể"; Chi tiêu tiết kiệm trong gia đình; Mua sắm thông minh',
        periodAllocation: '6 tiết (Tuần 19 – 20)',
        periodsCount: 6,
        adjustedContent:
          '- Tích hợp NLS 5.2.CB2a, 1.2.CB2a, 4.1.CB2b: Lập kế hoạch sử dụng tiền tiết kiệm và sơ đồ khoản thu - chi; kiểm tra thông tin giá, nguồn gốc sản phẩm, không mua hàng theo quảng cáo không rõ nguồn trên mạng.\n- Tích hợp AI (4.A2.1): Giới thiệu các ứng dụng quản lý tài chính (AI) giúp phân tích khoản thu/chi để đưa ra lời khuyên tiết kiệm hiệu quả.\n- Tích hợp QCN & ĐĐLS: Biết cân nhắc khi chi tiêu, không đua đòi; giữ gìn truyền thống gia đình ngày Tết.',
      },
      {
        week: '21 - 24',
        lessonName: 'Chủ đề 6: Phòng tránh bị xâm hại (12 tiết)',
        subLessonName: 'Hành vi xâm hại trẻ em; Hành vi xâm hại thân thể; Hành vi xâm hại tinh thần; Hành vi xâm hại tình dục & Tự bảo vệ bản thân',
        periodAllocation: '12 tiết (Tuần 21 – 24)',
        periodsCount: 12,
        adjustedContent:
          '- Tích hợp QCN & ANQP: Nhận diện hành vi xâm hại thân thể, tinh thần, tình dục; biết các bước tự bảo vệ: nói "không", rời khỏi nơi nguy hiểm, kêu cứu và báo người lớn tin cậy/tổng đài 111.\n- Tích hợp AI (4.A3.1, 4.B2.1): Tìm hiểu camera an ninh AI phát hiện hành vi lạ; đóng vai tình huống xử lý khi một ứng dụng AI yêu cầu chia sẻ ảnh riêng tư hoặc mật khẩu để được "tặng quà".\n- Tích hợp NLS 2.3.CB2a, 4.1.CB2b: Không làm theo lời rủ rê gặp mặt người lạ qua mạng; không gửi ảnh riêng tư, không trả lời người lạ hỏi thông tin cá nhân.',
      },
      {
        week: '25 - 27',
        lessonName: 'Chủ đề 7: Kết nối cộng đồng (9 tiết)',
        subLessonName: 'Kết nối những người sống quanh em; Cộng đồng cùng hành động; Đền ơn đáp nghĩa; Uống nước nhớ nguồn; Ứng xử có văn hóa; Cộng đồng văn minh',
        periodAllocation: '9 tiết (Tuần 25 – 27)',
        periodsCount: 9,
        adjustedContent:
          '- Tích hợp QCN & ĐĐLS & BVMT: Tự hào truyền thống quê hương, tri ân gia đình thương binh, liệt sĩ, người có công; tôn trọng, giúp đỡ người già, trẻ em, người khuyết tật; ứng xử lịch sự nơi công cộng.\n- Tích hợp AI (4.A2.2): Nhận biết cách AI (Google Dịch/Live Transcribe) giúp kết nối và hỗ trợ những người yếu thế trong cộng đồng.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 2.3.CB2a: Tìm hiểu thông tin hoạt động đền ơn đáp nghĩa ở địa phương; thiết kế poster/thông điệp ứng xử văn minh.',
      },
    ],
  }),

  buildGrade4Topic({
    id: 'cur-nda-g4-hdtn-cd8-9',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 35',
    totalPeriods: 24,
    chapterCode: 'HĐTN4-CĐ8-9',
    chapterTitle: 'Chủ đề 8: Quê hương em tươi đẹp & Chủ đề 9: Trải nghiệm nghề truyền thống',
    topicTitle:
      'Chủ đề 8 (Tuần 28–31): Xây dựng hành trình trải nghiệm, Cảnh quan thiên nhiên quê hương em, Khảo sát và chăm sóc bảo vệ cảnh quan thiên nhiên (12 tiết); Chủ đề 9 (Tuần 32–35): Nghề truyền thống, Khéo tay thạo việc, Triển lãm "Theo dấu nghệ nhân", Hồ sơ trải nghiệm (12 tiết)',
    adjustedContentSummary:
      'Lập hành trình trải nghiệm, khảo sát và bảo vệ cảnh quan thiên nhiên địa phương; tìm hiểu nghề truyền thống, thực hành sản phẩm và tổng kết hồ sơ trải nghiệm cuối năm; Tích hợp AI (4.C2.1, 4.A2.1, 4.A2.2, 4.D2.1), NLS (1.1, 1.2, 5.2), KNS, BVMT, GDĐP, STEM, ĐĐLS.',
    rawLessons: [
      {
        week: '28 - 31',
        lessonName: 'Chủ đề 8: Quê hương em tươi đẹp (12 tiết)',
        subLessonName: 'Xây dựng hành trình trải nghiệm; Cảnh quan thiên nhiên quê hương em; Khảo sát thực trạng và Thực hiện kế hoạch chăm sóc, bảo vệ cảnh quan thiên nhiên',
        periodAllocation: '12 tiết (Tuần 28 – 31)',
        periodsCount: 12,
        adjustedContent:
          '- Tích hợp AI (4.C2.1, 4.A2.1): Sử dụng AI để lập kế hoạch cho một chuyến du lịch địa phương; xem video về cách AI giám sát độ phủ rừng và phát hiện cháy rừng sớm để bảo vệ "lá phổi xanh" của quê hương.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a & GDĐP: Tìm thông tin/hình ảnh cảnh quan quê hương từ nguồn đáng tin cậy; giới thiệu và đề xuất cách bảo vệ cảnh quan địa phương.\n- Tích hợp BVMT & KNS: Khảo sát thực trạng, lập và thực hiện kế hoạch chăm sóc, bảo vệ cảnh quan thiên nhiên.',
      },
      {
        week: '32 - 35',
        lessonName: 'Chủ đề 9: Trải nghiệm nghề truyền thống & Tổng kết năm học (12 tiết)',
        subLessonName: 'Thế giới nghề nghiệp quanh em; Nghề truyền thống & Theo dấu nghệ nhân; Khéo tay, thạo việc; Triển lãm "Theo dấu nghệ nhân"; Hồ sơ trải nghiệm & Triển lãm STEM cuối HKII',
        periodAllocation: '12 tiết (Tuần 32 – 35)',
        periodsCount: 12,
        adjustedContent:
          '- Tích hợp AI (4.A2.2, 4.D2.1): Tìm hiểu cách AI hỗ trợ bác sĩ, kỹ sư, nông dân; hoàn thiện "Hồ sơ trải nghiệm AI": đánh giá công cụ AI hữu ích nhất trong năm và đề xuất điểm cần cải tiến.\n- Tích hợp NLS 1.1.CB2a, 1.2.CB2a, 5.2.CB2a: Tìm thông tin về nghề truyền thống ở địa phương; tạo hồ sơ/triển lãm "Theo dấu nghệ nhân" và hoàn thiện hồ sơ trải nghiệm bằng sản phẩm số đơn giản.\n- Tích hợp KNS, STEM & ĐĐLS: Rèn kĩ năng khéo léo, kiên trì, hợp tác; kính trọng người lao động và nghề truyền thống; triển lãm sản phẩm STEM cuối học kì II; chia sẻ yêu thương, tri ân thầy cô, bạn bè.',
      },
    ],
  }),
];
