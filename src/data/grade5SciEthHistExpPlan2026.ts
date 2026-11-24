import { CurriculumTopic } from '../types/domain';
import { buildGrade5Topic } from './grade5TvAndMathPlan2026';

// ============================================================================
// 3. MÔN KHOA HỌC LỚP 5 (35 TUẦN – 70 TIẾT: 63 TIẾT BÀI HỌC + 7 TIẾT ÔN TẬP, ĐG)
// ============================================================================

export const GRADE5_KHOA_HOC_TOPICS: CurriculumTopic[] = [
  buildGrade5Topic({
    id: 'g5-kh-cd1',
    subject: 'Khoa học',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 6',
    totalPeriods: 12,
    chapterCode: 'KH5-CD1',
    chapterTitle: 'Chủ đề 1: Chất (12 tiết)',
    topicTitle:
      'Bài 1: Thành phần và vai trò của đất đối với cây trồng (2 tiết); Bài 2: Ô nhiễm, xói mòn đất và bảo vệ môi trường đất (3 tiết); Bài 3: Hỗn hợp và dung dịch (2 tiết); Bài 4: Đặc điểm của chất ở trạng thái rắn, lỏng, khí. Sự biến đổi trạng thái của chất (2 tiết); Bài 5: Sự biến đổi hoá học của chất (2 tiết); Bài 6: Ôn tập chủ đề Chất (1 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (1.1.CB2b, 3.1.CB2a, 1.1.CB2a), Tiết kiệm và bảo vệ nguồn nước (bảo vệ nguồn nước ngầm, không xả hóa chất xuống đất), AI (5.A2.2, 5.C4.1, 5.D1.1) và Bài học STEM (Tách muối ra khỏi dung dịch; Biến đổi chất).',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Bài 1: Thành phần và vai trò của đất đối với cây trồng',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2b: HS sử dụng Google Search hoặc Microsoft Edge để tìm và xem video thí nghiệm về thành phần không khí, nước trong đất; đối chiếu tư liệu số với kết quả thực hành tại lớp. Tích hợp tiết kiệm và bảo vệ nguồn nước: HS biết đất giữ nước, cung cấp nước cho cây; có ý thức không đổ rác, hóa chất, nước bẩn xuống đất để tránh làm ô nhiễm nguồn nước ngầm.',
      },
      {
        week: '2–3',
        lessonName: 'Bài 2: Ô nhiễm, xói mòn đất và bảo vệ môi trường đất',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a: HS sử dụng Canva hoặc PowerPoint để thiết kế poster số kêu gọi các biện pháp bảo vệ môi trường đất tại địa phương. Tích hợp tiết kiệm và bảo vệ nguồn nước: HS nhận biết rác thải, phân bón hóa học, thuốc trừ sâu có thể thấm xuống đất và làm ô nhiễm nguồn nước; biết tuyên truyền không xả rác, không đổ hóa chất ra môi trường. Tích hợp AI 5.A2.2: HS xem hình ảnh hoặc clip về robot lấy mẫu đất, cảm biến độ ẩm đất, cảm biến dinh dưỡng đất để hiểu AI hỗ trợ cảnh báo ô nhiễm, xói mòn đất.',
      },
      {
        week: '3–4',
        lessonName: 'Bài 3: Hỗn hợp và dung dịch',
        subLessonName: 'Tiết 1 – Tiết 2 (Bài học STEM: Tách muối ra khỏi dung dịch)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a: HS sử dụng Camera trên điện thoại hoặc máy tính bảng chụp các bước tách muối khỏi nước; dùng Markup hoặc PowerPoint để chú thích từng bước thực hiện. Bài học STEM: Tách muối ra khỏi dung dịch.',
      },
      {
        week: '4–5',
        lessonName:
          'Bài 4: Đặc điểm của chất ở trạng thái rắn, lỏng, khí. Sự biến đổi trạng thái của chất',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.C4.1: HS dùng Scratch hoặc phiếu lệnh mô phỏng cấu trúc “nếu... thì...”, ví dụ: nếu nhiệt độ dưới 0°C thì nước lỏng chuyển thành nước đá.',
      },
      {
        week: '5–6',
        lessonName: 'Bài 5: Sự biến đổi hoá học của chất',
        subLessonName: 'Tiết 1 – Tiết 2 (Bài học STEM: Biến đổi chất)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2a: HS xem video thí nghiệm an toàn trên YouTube Kids hoặc học liệu NXB Giáo dục về giấy cháy, đinh gỉ, đường bị đun nóng để nhận biết dấu hiệu biến đổi hoá học. Bài học STEM: Biến đổi chất.',
      },
      {
        week: '6',
        lessonName: 'Bài 6: Ôn tập chủ đề Chất',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI 5.D1.1: HS dùng Canva Whiteboard hoặc PowerPoint SmartArt lập sơ đồ dữ liệu “đất - hỗn hợp - dung dịch - biến đổi trạng thái - biến đổi hoá học”, mô tả cách “dạy” AI phân loại chất.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-kh-cd2',
    subject: 'Khoa học',
    semester: 'HK1',
    weekRange: 'Tuần 7 – Tuần 13',
    totalPeriods: 13,
    chapterCode: 'KH5-CD2',
    chapterTitle: 'Chủ đề 2: Năng lượng & Ôn tập giữa HKI (13 tiết)',
    topicTitle:
      'Bài 7: Vai trò của năng lượng (2 tiết); Bài 8: Sử dụng năng lượng điện (2 tiết); Bài 9: Mạch điện đơn giản. Vật dẫn điện và vật cách điện (2 tiết); Ôn tập giữa HKI (1 tiết); Bài 10: Năng lượng chất đốt (2 tiết); Bài 11: Sử dụng năng lượng mặt trời, năng lượng gió, năng lượng nước chảy (3 tiết); Bài 12: Ôn tập chủ đề Năng lượng (1 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (1.1.CB2a, 1.2.CB2a, 4.3.CB2a, 1.1.CB2b, 3.1.CB2a), AI (5.A2.2, 5.A1.1) và Bài học STEM (Mạch điện đơn giản; Mô hình thuyền buồm).',
    rawLessons: [
      {
        week: '7',
        lessonName: 'Bài 7: Vai trò của năng lượng',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2a: HS sử dụng Google Search hoặc Microsoft Edge tìm hình ảnh, video về các nguồn năng lượng trong đời sống, sản xuất và học tập. Tích hợp AI 5.A2.2: HS xem clip hoặc hình ảnh về nhà thông minh Google Home/Amazon Alexa hoặc lưới điện thông minh để biết AI giúp điều tiết, tiết kiệm năng lượng.',
      },
      {
        week: '8',
        lessonName: 'Bài 8: Sử dụng năng lượng điện',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.2.CB2a: HS tra cứu quy tắc an toàn điện trên website EVN hoặc website giáo dục .edu.vn; biết nhận diện thông tin tin cậy và tóm tắt lưu ý quan trọng. Tích hợp AI 5.A1.1: HS xem clip về drone hoặc robot kiểm tra đường dây điện cao thế để hiểu AI, robot có thể thay con người làm việc nguy hiểm.',
      },
      {
        week: '9',
        lessonName: 'Bài 9: Mạch điện đơn giản. Vật dẫn điện và vật cách điện',
        subLessonName: 'Tiết 1 – Tiết 2 (Bài học STEM: Mạch điện đơn giản)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 4.3.CB2a: HS sử dụng mô phỏng PhET Circuit Construction Kit để quan sát mạch điện đơn giản, vật dẫn điện và vật cách điện trong môi trường số an toàn. Bài học STEM: Mạch điện đơn giản.',
      },
      {
        week: '10',
        lessonName: 'Ôn tập giữa HKI',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Hệ thống hóa kiến thức chủ đề Chất và nửa đầu chủ đề Năng lượng phục vụ đánh giá giữa học kì I.',
      },
      {
        week: '10–11',
        lessonName: 'Bài 10: Năng lượng chất đốt',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2a: HS dùng Google Search hoặc Microsoft Edge tìm hình ảnh bếp gas, bếp than, xăng dầu và cách sử dụng an toàn, tiết kiệm. Tích hợp AI 5.A1.1: HS quan sát cảm biến khói, cảm biến gas thông minh qua ứng dụng Smart Life hoặc Tuya Smart để hiểu thiết bị có thể cảnh báo rò rỉ gas, khói, cháy.',
      },
      {
        week: '11–12',
        lessonName:
          'Bài 11: Sử dụng năng lượng mặt trời, năng lượng gió, năng lượng nước chảy',
        subLessonName: 'Tiết 1 – Tiết 3 (Bài học STEM: Mô hình thuyền buồm)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2b: HS dùng Google Earth tìm vị trí cánh đồng điện gió hoặc khu điện mặt trời ở Việt Nam. Tích hợp AI 5.A2.2: HS xem minh họa Windy hoặc Google Weather để hiểu AI dự báo nắng, gió, lượng mưa, dòng chảy hỗ trợ sản xuất năng lượng tái tạo. Bài học STEM: Mô hình thuyền buồm.',
      },
      {
        week: '13',
        lessonName: 'Bài 12: Ôn tập chủ đề Năng lượng',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a: HS dùng PowerPoint SmartArt hoặc Canva Mind Map lập sơ đồ ôn tập chủ đề Năng lượng.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-kh-cd3',
    subject: 'Khoa học',
    semester: 'HK1',
    weekRange: 'Tuần 13 – Tuần 19',
    totalPeriods: 12,
    chapterCode: 'KH5-CD3',
    chapterTitle: 'Chủ đề 3: Thực vật và động vật & Kiểm tra cuối HKI (12 tiết)',
    topicTitle:
      'Bài 13: Sinh sản của thực vật có hoa (2 tiết); Bài 14: Sự phát triển của cây con (3 tiết); Bài 15: Sinh sản của động vật (2 tiết); Bài 16: Vòng đời và sự phát triển của động vật (2 tiết); Ôn tập & Kiểm tra cuối HKI (2 tiết); Bài 17: Ôn tập chủ đề Thực vật và động vật (1 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (1.1.CB2a, 1.3.CB2a), AI (5.C4.2, 5.D2.1, 5.B3.1, 5.D1.1).',
    rawLessons: [
      {
        week: '13–14',
        lessonName: 'Bài 13: Sinh sản của thực vật có hoa',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2a: HS dùng Google Images tìm hình ảnh hoa, quả, hạt phục vụ bài Sinh sản của thực vật có hoa. Tích hợp AI 5.C4.2: HS dùng Google Teachable Machine hoặc Google Lens nhận diện hình ảnh hoa, quả, hạt; sau đó kiểm tra lại bằng kiến thức SGK.',
      },
      {
        week: '14–15',
        lessonName: 'Bài 14: Sự phát triển của cây con',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 1.3.CB2a: HS dùng Microsoft Excel hoặc Google Sheets lập bảng theo dõi chiều cao, số lá của cây. Tích hợp AI 5.D2.1: HS chụp ảnh cây bằng Camera điện thoại hoặc máy tính bảng, lưu vào Google Drive, sắp xếp ảnh theo thời gian để hiểu AI cần dữ liệu cập nhật.',
      },
      {
        week: '16',
        lessonName: 'Bài 15: Sinh sản của động vật',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2a: HS dùng Google Images hoặc YouTube Kids tìm hình ảnh, video động vật đẻ trứng, đẻ con. Tích hợp AI 5.C4.2: HS dùng Google Lens nhận diện hình ảnh động vật và phân nhóm đẻ trứng, đẻ con dưới sự hướng dẫn của GV.',
      },
      {
        week: '17',
        lessonName: 'Bài 16: Vòng đời và sự phát triển của động vật',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2a: HS xem video vòng đời bướm, ếch, gà trên YouTube Kids hoặc học liệu NXB Giáo dục. Tích hợp AI 5.B3.1: HS dùng ảnh mẫu trong Google Lens để nhận diện giai đoạn vòng đời, thảo luận vì sao AI có thể nhầm nòng nọc với cá.',
      },
      {
        week: '18',
        lessonName: 'Ôn tập & Kiểm tra cuối HKI',
        subLessonName: 'Ôn tập cuối HKI (1 tiết) & Kiểm tra cuối HKI (1 tiết)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hệ thống hóa kiến thức Khoa học học kì I và thực hiện bài kiểm tra định kỳ cuối học kì I theo Thông tư 27/2020/TT-BGDĐT.',
      },
      {
        week: '19',
        lessonName: 'Bài 17: Ôn tập chủ đề Thực vật và động vật',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI 5.D1.1: HS dùng Google Drive và Canva Whiteboard sắp xếp ảnh cây con, động vật đẻ trứng, động vật đẻ con, vòng đời động vật thành nhóm dữ liệu để “dạy” AI giả định.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-kh-cd4',
    subject: 'Khoa học',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 22',
    totalPeriods: 7,
    chapterCode: 'KH5-CD4',
    chapterTitle: 'Chủ đề 4: Vi khuẩn (7 tiết)',
    topicTitle:
      'Bài 18: Vi khuẩn xung quanh chúng ta (2 tiết); Bài 19: Vi khuẩn có ích trong chế biến thực phẩm (2 tiết); Bài 20: Vi khuẩn gây bệnh ở người và cách phòng tránh (2 tiết); Bài 21: Ôn tập chủ đề Vi khuẩn (1 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (1.1.CB2b, 4.3.CB2a), KNS (rửa tay phòng tránh vi khuẩn), AI (5.A2.2), QCN (quyền chăm sóc sức khỏe) và Bài học STEM: Vi khuẩn có ích trong chế biến thực phẩm.',
    rawLessons: [
      {
        week: '19–20',
        lessonName: 'Bài 18: Vi khuẩn xung quanh chúng ta',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2b: HS dùng Google Images tìm hình ảnh vi khuẩn dưới kính hiển vi. Tích hợp KNS: HS biết rửa tay đúng lúc, đúng cách để phòng tránh vi khuẩn có hại.',
      },
      {
        week: '20–21',
        lessonName: 'Bài 19: Vi khuẩn có ích trong chế biến thực phẩm',
        subLessonName:
          'Tiết 1 – Tiết 2 (Bài học STEM: Vi khuẩn có ích trong chế biến thực phẩm)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.A2.2: HS quan sát minh họa AI hỗ trợ bác sĩ hoặc nhà khoa học phân tích ảnh kính hiển vi để nhận biết vi khuẩn. Bài học STEM: Vi khuẩn có ích trong chế biến thực phẩm.',
      },
      {
        week: '21–22',
        lessonName: 'Bài 20: Vi khuẩn gây bệnh ở người và cách phòng tránh',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 4.3.CB2a: HS xem video phòng bệnh trên website Bộ Y tế, kênh YouTube Sức khỏe Việt Nam hoặc học liệu GV cung cấp; không tự ý tìm nguồn chưa kiểm chứng. Tích hợp quyền con người: HS hiểu quyền được chăm sóc, bảo vệ sức khỏe; biết thực hiện vệ sinh cá nhân và phòng bệnh cho bản thân, cộng đồng.',
      },
      {
        week: '22',
        lessonName: 'Bài 21: Ôn tập chủ đề Vi khuẩn',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI 5.A2.2: HS dùng hình ảnh mẫu trong Google Images hoặc PowerPoint để thảo luận AI có thể hỗ trợ phân tích hình ảnh vi khuẩn nhưng cần kiểm chứng.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-kh-cd5',
    subject: 'Khoa học',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 31',
    totalPeriods: 17,
    chapterCode: 'KH5-CD5',
    chapterTitle: 'Chủ đề 5: Con người và sức khỏe & Kiểm tra giữa HKII (17 tiết)',
    topicTitle:
      'Bài 22: Sự hình thành cơ thể người (2 tiết); Bài 23: Các giai đoạn phát triển chính của con người (3 tiết); Bài 24: Nam và nữ (2 tiết); Bài 25: Chăm sóc sức khoẻ tuổi dậy thì (3 tiết); Ôn tập & Kiểm tra giữa HKII (2 tiết); Bài 26: Phòng tránh bị xâm hại (4 tiết); Bài 27: Ôn tập chủ đề Con người và sức khoẻ (1 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (4.3.CB2a, 1.1.CB2a, 2.1.CB2a), QCN (quyền được tôn trọng sự riêng tư, bảo vệ thân thể, danh dự), KNS (chăm sóc tuổi dậy thì, phòng tránh xâm hại) và AI (5.B1.1, 5.A3.1).',
    rawLessons: [
      {
        week: '23',
        lessonName: 'Bài 22: Sự hình thành cơ thể người',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 4.3.CB2a: HS tìm hiểu sự hình thành cơ thể người từ video hoặc học liệu GV gửi trên Google Drive/PowerPoint; không chia sẻ thông tin riêng tư; không tự tìm kiếm hình ảnh nhạy cảm, không gửi thông tin cá nhân trên mạng.',
      },
      {
        week: '24–25',
        lessonName: 'Bài 23: Các giai đoạn phát triển chính của con người',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp quyền con người: HS hiểu mỗi người có quyền được tôn trọng trong từng giai đoạn phát triển; không trêu chọc sự khác biệt về ngoại hình, giới tính, tốc độ lớn lên. Tích hợp KNS: HS biết chăm sóc bản thân phù hợp với lứa tuổi, biết chia sẻ với người lớn đáng tin cậy. Tích hợp NLS 1.1.CB2a: HS quan sát tranh, video học liệu GV chọn trên PowerPoint hoặc Google Drive.',
      },
      {
        week: '25–26',
        lessonName: 'Bài 24: Nam và nữ',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 2.1.CB2a: HS thực hành lựa chọn Zalo nhóm lớp hoặc Email để trao đổi bài tập nhóm lịch sự giữa bạn nam và bạn nữ. Tích hợp AI 5.B1.1: HS thảo luận tình huống với chatbot mô phỏng trên PowerPoint: nếu robot chỉ chào bạn nam mà bỏ qua bạn nữ thì AI đó chưa công bằng.',
      },
      {
        week: '26–27',
        lessonName: 'Bài 25: Chăm sóc sức khoẻ tuổi dậy thì',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2a: HS dùng website Bộ Y tế, website trường học hoặc học liệu Google Drive của GV để tìm thông tin chăm sóc sức khỏe tuổi dậy thì. Tích hợp AI 5.A3.1: HS đặt câu hỏi mẫu cho ChatGPT, Gemini hoặc Copilot dưới sự hướng dẫn của GV; không nhập tên thật, địa chỉ, ảnh cá nhân. Tích hợp quyền con người: HS hiểu quyền được chăm sóc sức khỏe, được cung cấp kiến thức phù hợp và được tôn trọng sự riêng tư ở tuổi dậy thì.',
      },
      {
        week: '28',
        lessonName: 'Ôn tập & Kiểm tra giữa HKII',
        subLessonName: 'Ôn tập giữa HKII (1 tiết) & Kiểm tra giữa HKII (1 tiết)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hệ thống hóa kiến thức chủ đề Vi khuẩn và Con người & sức khỏe phục vụ kiểm tra giữa học kì II.',
      },
      {
        week: '29–30',
        lessonName: 'Bài 26: Phòng tránh bị xâm hại',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 4.3.CB2a: HS xem video an toàn số trên YouTube Kids, website Tổng đài 111 hoặc học liệu GV cung cấp để nhận diện rủi ro từ người lạ trên mạng; chọn cách phản hồi khi người lạ nhắn tin xin ảnh, địa chỉ, số điện thoại. Tích hợp AI 5.A3.1: HS xử lí tình huống chatbot lạ trên ChatGPT hoặc Gemini mô phỏng yêu cầu gửi ảnh cá nhân. Tích hợp quyền con người: HS biết quyền được bảo vệ thân thể, danh dự, nhân phẩm và sự riêng tư; biết tìm người tin cậy để được giúp đỡ.',
      },
      {
        week: '31',
        lessonName: 'Bài 27: Ôn tập chủ đề Con người và sức khoẻ',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp AI 5.A3.1: HS đọc một lời khuyên sức khỏe do ChatGPT, Gemini hoặc Copilot gợi ý, rồi đối chiếu SGK và học liệu của Bộ Y tế.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-kh-cd6',
    subject: 'Khoa học',
    semester: 'HK2',
    weekRange: 'Tuần 31 – Tuần 35',
    totalPeriods: 9,
    chapterCode: 'KH5-CD6',
    chapterTitle: 'Chủ đề 6: Sinh vật và môi trường & Kiểm tra cuối năm (9 tiết)',
    topicTitle:
      'Bài 28: Chức năng của môi trường đối với sinh vật (3 tiết); Bài 29: Tác động của con người và một số biện pháp bảo vệ môi trường (3 tiết); Bài 30: Ôn tập chủ đề Sinh vật và môi trường (1 tiết); Ôn tập & Kiểm tra cuối năm (2 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (4.4.CB2a, 5.2.CB2a), Tiết kiệm và bảo vệ nguồn nước, BVMT và AI (5.A2.2, 5.A1.1).',
    rawLessons: [
      {
        week: '31–32',
        lessonName: 'Bài 28: Chức năng của môi trường đối với sinh vật',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 4.4.CB2a: HS dùng Google Earth hoặc Google Maps quan sát rừng, sông, hồ, khu dân cư để nhận biết môi trường sống của sinh vật. Tích hợp tiết kiệm và bảo vệ nguồn nước: HS hiểu nước là điều kiện sống quan trọng của sinh vật; biết sử dụng nước tiết kiệm, không xả rác, dầu mỡ, hóa chất xuống ao, hồ, sông, suối. Tích hợp bảo vệ môi trường & AI 5.A2.2: HS xem clip về thiết bị AI nghe âm thanh rừng, camera bẫy ảnh AI, cảm biến quan trắc nước.',
      },
      {
        week: '33–34',
        lessonName:
          'Bài 29: Tác động của con người và một số biện pháp bảo vệ môi trường',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 5.2.CB2a: HS dùng Google Search hoặc Microsoft Edge tìm giải pháp công nghệ như robot dọn rác, cảm biến quan trắc nước, drone giám sát rừng. Tích hợp tiết kiệm và bảo vệ nguồn nước: Đề xuất việc không xả rác xuống kênh rạch, tiết kiệm nước, thu gom rác đúng nơi quy định. Tích hợp AI 5.A1.1: HS dùng Canva hoặc PowerPoint phác thảo ý tưởng robot AI thu gom rác trên mặt biển, cống rãnh.',
      },
      {
        week: '34',
        lessonName: 'Bài 30: Ôn tập chủ đề Sinh vật và môi trường',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp NLS 4.4.CB2a: HS dùng Canva Mind Map hoặc PowerPoint SmartArt hệ thống hóa kiến thức chủ đề Sinh vật và môi trường.',
      },
      {
        week: '35',
        lessonName: 'Ôn tập & Kiểm tra cuối năm',
        subLessonName: 'Ôn tập cuối năm (1 tiết) & Kiểm tra cuối năm (1 tiết)',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp tiết kiệm và bảo vệ nguồn nước: HS vận dụng kiến thức đã học để nêu việc làm bảo vệ nguồn nước ở gia đình, trường học, địa phương; thực hiện kiểm tra cuối năm học.',
      },
    ],
  }),
];

// ============================================================================
// 4. MÔN ĐẠO ĐỨC LỚP 5 (35 TUẦN – 35 TIẾT: HKI 18 TIẾT, HKII 17 TIẾT)
// ============================================================================

export const GRADE5_DAO_DUC_TOPICS: CurriculumTopic[] = [
  buildGrade5Topic({
    id: 'g5-dd-hk1',
    subject: 'Đạo đức',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    chapterCode: 'DD5-HK1',
    chapterTitle:
      'Học kì I: Biết ơn người có công, Tôn trọng sự khác biệt, Vượt qua khó khăn, Bảo vệ cái đúng cái tốt & Bảo vệ môi trường (Tuần 1 – 18)',
    topicTitle:
      'Bài 1: Biết ơn những người có công với quê hương, đất nước (4 tiết); Bài 2: Tôn trọng sự khác biệt của người khác (3 tiết); Bài 3: Vượt qua khó khăn (4 tiết); Ôn tập, đánh giá giữa HKI (1 tiết); Bài 4: Bảo vệ cái đúng, cái tốt (3 tiết); Bài 5: Bảo vệ môi trường sống - Tiết 1, 2 (2 tiết); Ôn tập, đánh giá cuối HKI (1 tiết)',
    adjustedContentSummary:
      'Tích hợp ANQP/QPAN (tri ân người có công, bảo vệ Tổ quốc), ĐĐLS, QCN (tôn trọng sự khác biệt, bảo vệ sự thật), KNS, BVMT, NLS (1.1.CB2b, 3.1.CB2a, 2.1.CB2a, 2.2.CB2a) và AI (5.A2.2, 5.B1.1, 5.A1.1, 5.A1.2, 5.D1.1).',
    rawLessons: [
      {
        week: '1–4',
        lessonName:
          'Bài 1. Biết ơn những người có công với quê hương, đất nước',
        subLessonName: 'Chủ đề 1: Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Năng lực số 1.1.CB2b & 3.1.CB2a: HS dùng Google/YouTube tìm và xem clip về chị Võ Thị Sáu hoặc Đại tướng Võ Nguyên Giáp; thiết kế poster số trên Canva/PowerPoint thể hiện lòng biết ơn. Tích hợp ANQP & ĐĐLS: Bồi dưỡng lòng biết ơn, tri ân anh hùng, liệt sĩ, thương binh, người có công; giữ gìn truyền thống uống nước nhớ nguồn.',
      },
      {
        week: '5–7',
        lessonName: 'Bài 2. Tôn trọng sự khác biệt của người khác',
        subLessonName: 'Chủ đề 2: Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 2.1.CB2a & 2.2.CB2a: HS lựa chọn phương tiện giao tiếp số lịch sự; tạo video ngắn/bài trình chiếu “Tôi khác biệt” chia sẻ lên Padlet. Tích hợp AI 5.B1.1 (Teachable Machine): Thảo luận nếu AI chỉ nhận diện một màu da, một giọng nói thì đó là thiếu công bằng. Tích hợp QCN: Tôn trọng quyền được đối xử bình đẳng của mọi người.',
      },
      {
        week: '8, 10–12',
        lessonName: 'Bài 3. Vượt qua khó khăn',
        subLessonName: 'Chủ đề 3: Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp Năng lực số 1.1.CB2b & 2.2.CB2a: Sưu tầm ca dao, tục ngữ về siêng năng, kiên trì; chia sẻ tấm gương vượt khó lên Google Classroom. Tích hợp AI 5.A1.1: Xem video về robot cứu hộ AI vào vùng thiên tai, vùng nguy hiểm. Tích hợp KNS & ĐĐLS: Rèn ý chí, tinh thần tự học, kiên trì vượt khó.',
      },
      {
        week: '9',
        lessonName: 'Ôn tập, đánh giá giữa học kì I',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'HS hệ thống hóa kiến thức đã học, luyện xử lí tình huống và thực hiện nội dung đánh giá giữa học kì I theo kế hoạch.',
      },
      {
        week: '13–15',
        lessonName: 'Bài 4. Bảo vệ cái đúng, cái tốt',
        subLessonName: 'Chủ đề 4: Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp Năng lực số 1.1.CB2b & 2.2.CB2a: Tìm kiếm thông tin về gương “Người tốt việc tốt” tại địa phương; bình luận ủng hộ hành vi đúng bằng lời lẽ văn minh. Tích hợp AI 5.A1.2: Thực hiện hoạt động kiểm chứng thông tin với chatbot AI. Tích hợp QCN: Bảo vệ sự thật, không lan truyền thông tin sai.',
      },
      {
        week: '16–17',
        lessonName: 'Bài 5. Bảo vệ môi trường sống (Tiết 1 – 2)',
        subLessonName: 'Chủ đề 5: Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.D1.1 (Scratch AI hoặc Teachable Machine): Dự án nhỏ “Dạy máy bảo vệ môi trường”, phân loại rác thải. Tích hợp NLS 1.1.CB2b & BVMT: Xem video về ô nhiễm không khí, rác thải nhựa; nêu việc làm giảm rác thải nhựa, tiết kiệm tài nguyên.',
      },
      {
        week: '18',
        lessonName: 'Ôn tập, đánh giá cuối học kì I',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'HS ôn tập, củng cố kiến thức, luyện xử lí tình huống và thực hiện nội dung đánh giá cuối học kì I theo kế hoạch.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-dd-hk2',
    subject: 'Đạo đức',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    chapterCode: 'DD5-HK2',
    chapterTitle:
      'Học kì II: Bảo vệ môi trường sống, Lập kế hoạch cá nhân, Phòng tránh xâm hại & Sử dụng tiền hợp lí (Tuần 19 – 35)',
    topicTitle:
      'Bài 5: Bảo vệ môi trường sống - Tiết 3, 4 (2 tiết); Bài 6: Lập kế hoạch cá nhân (4 tiết); Bài 7: Phòng, tránh xâm hại (5 tiết); Ôn tập, đánh giá giữa HKII (1 tiết); Bài 8: Sử dụng tiền hợp lí (4 tiết); Ôn tập, đánh giá cuối năm (1 tiết)',
    adjustedContentSummary:
      'Tích hợp BVMT, KNS (quản lí thời gian, kỹ năng phòng tránh xâm hại, chi tiêu tiết kiệm), QCN (bảo vệ an toàn thân thể và thông tin cá nhân), ĐĐLS, NLS (3.1.CB2a, 1.3.CB2a, 4.2.CB2a, 1.1.CB2b, 4.3.CB2a, 5.2.CB2a) và AI (5.C4.1, 5.A3.1, 5.D2.1).',
    rawLessons: [
      {
        week: '19–20',
        lessonName: 'Bài 5. Bảo vệ môi trường sống (Tiết 3 – 4)',
        subLessonName: 'Chủ đề 5: Tiết 3 – Tiết 4',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp BVMT: Đề xuất thông điệp xanh cho lớp học và cam kết tắt điện, tiết kiệm nước, phân loại rác. Tích hợp NLS 3.1.CB2a: Thực hiện bảng tự đánh giá số trên Google Forms về việc tham gia bảo vệ môi trường.',
      },
      {
        week: '21–24',
        lessonName: 'Bài 6. Lập kế hoạch cá nhân',
        subLessonName: 'Chủ đề 6: Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 1.3.CB2a: Sử dụng Excel hoặc Google Sheets để nhập liệu, sắp xếp kế hoạch học tập, rèn luyện sức khỏe. Tích hợp AI 5.C4.1: Thực hành tư duy “Nếu... thì...” trong lập kế hoạch cá nhân. Tích hợp KNS & ĐĐLS: Rèn tính tự giác, kỉ luật, quản lí thời gian và không trì hoãn.',
      },
      {
        week: '25–26, 28–30',
        lessonName: 'Bài 7. Phòng, tránh xâm hại',
        subLessonName: 'Chủ đề 7: Tiết 1 – Tiết 5',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp NLS 4.2.CB2a, 1.1.CB2b & 4.3.CB2a: Thảo luận rủi ro khi chia sẻ địa chỉ, hình ảnh nhạy cảm, mật khẩu; tra cứu tổng đài khẩn cấp 111; thực hành lưu bằng chứng số, chặn/báo cáo tài khoản lạ. Tích hợp AI 5.A3.1: Cảnh giác Deepfake, không chia sẻ ảnh cá nhân cho chatbot lạ. Tích hợp QCN & KNS: Bảo vệ quyền riêng tư, thân thể; thực hành nói “không” và tìm kiếm sự giúp đỡ.',
      },
      {
        week: '27',
        lessonName: 'Ôn tập, đánh giá giữa học kì II',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'HS hệ thống hóa kiến thức, luyện xử lí tình huống và thực hiện nội dung đánh giá giữa học kì II theo kế hoạch.',
      },
      {
        week: '31–34',
        lessonName: 'Bài 8. Sử dụng tiền hợp lí',
        subLessonName: 'Chủ đề 8: Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 5.2.CB2a & 3.1.CB2a: So sánh giá cả hàng hóa, lập bảng theo dõi chi tiêu cá nhân hằng tuần trên bảng tính. Tích hợp AI 5.D2.1: Tìm hiểu cách ứng dụng mua sắm dùng dữ liệu thói quen để gợi ý quảng cáo. Tích hợp ĐĐLS & KNS: Cân nhắc nhu cầu, tiêu dùng tiết kiệm, không chạy theo quảng cáo.',
      },
      {
        week: '35',
        lessonName: 'Ôn tập, đánh giá cuối năm',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'HS tổng hợp kiến thức toàn năm, tự đánh giá việc rèn luyện phẩm chất, năng lực và thực hiện nội dung đánh giá cuối năm theo kế hoạch.',
      },
    ],
  }),
];

// ============================================================================
// 5. MÔN LỊCH SỬ VÀ ĐỊA LÍ LỚP 5 (35 TUẦN – 70 TIẾT: HKI 36 TIẾT, HKII 34 TIẾT)
// ============================================================================

export const GRADE5_LICH_SU_DIA_LI_TOPICS: CurriculumTopic[] = [
  buildGrade5Topic({
    id: 'g5-lsdl-cd1',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 6',
    totalPeriods: 11,
    chapterCode: 'LSDL5-CD1',
    chapterTitle: 'Chủ đề 1: Đất nước và con người Việt Nam (11 tiết)',
    topicTitle:
      'Bài 1: Vị trí địa lí, lãnh thổ, đơn vị hành chính, Quốc kì, Quốc huy, Quốc ca (2 tiết); Bài 2: Thiên nhiên Việt Nam (4 tiết); Bài 3: Biển, đảo Việt Nam (2 tiết); Bài 4: Dân cư và dân tộc Việt Nam (3 tiết)',
    adjustedContentSummary:
      'Bao gồm đầy đủ nội dung điều chỉnh bổ sung tháng 8/2026 tại Bài 1 (vùng biển Việt Nam bao gồm một phần Biển Đông, Vịnh Bắc Bộ, Vịnh Thái Lan) và Bài 3 (thực thi chủ quyền liên tục, lâu dài và hiệu quả trên quần đảo Hoàng Sa và Trường Sa); tích hợp QPAN, QCN, BVMT, Tiết kiệm nước, NLS và AI.',
    rawLessons: [
      {
        week: '1',
        lessonName:
          'Bài 1. Vị trí địa lí, lãnh thổ, đơn vị hành chính, Quốc kì, Quốc huy, Quốc ca',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '* Điều chỉnh nội dung “Vùng biển nước ta thuộc Biển Đông, giáp với vùng biển của nhiều quốc gia” – Sửa thành “Vùng biển nước ta bao gồm một phần biển Đông, Vịnh Bắc Bộ, Vịnh Thái Lan, tiếp giáp với vùng biển của nhiều quốc gia”. Tích hợp NLS 5.2.CB2a: Sử dụng Google Maps/Google Earth xác định vị trí Việt Nam, các điểm cực, vùng biển, đảo. Tích hợp QCN & ĐĐLS: Tôn trọng chủ quyền, lãnh thổ, Quốc kì, Quốc huy, Quốc ca. Tích hợp AI 5.A1.1: Tìm hiểu cách AI tối ưu hóa định vị toàn cầu.',
      },
      {
        week: '2–3',
        lessonName: 'Bài 2. Thiên nhiên Việt Nam',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2b: Tìm kiếm bản đồ địa hình, khí hậu, khoáng sản Việt Nam. Tích hợp AI 5.A2.2: Tìm hiểu cách AI dự báo thời tiết, cảnh báo bão, lũ lụt. Tích hợp BVMT & Tiết kiệm và bảo vệ nguồn nước: Bảo vệ rừng, đất, phòng chống xói mòn; giữ gìn sông, suối, ao, hồ, không xả rác xuống kênh rạch.',
      },
      {
        week: '4',
        lessonName: 'Bài 3. Biển, đảo Việt Nam',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          '* Điều chỉnh nội dung: “Thế kỉ XVII, các chúa Nguyễn... đồng thời từng bước thực thi chủ quyền trên quần đảo Trường Sa và quần đảo Hoàng Sa” – Sửa thành “Thế kỉ XVII, các chúa Nguyễn... đồng thời từng bước thực thi chủ quyền trên quần đảo Trường Sa và quần đảo Hoàng Sa một cách liên tục, lâu dài và hiệu quả”. * Bổ sung nội dung sau ý “Thời Pháp thuộc, người Pháp cho dựng bia chủ quyền, lập đơn vị hành chính ở quần đảo Hoàng Sa và quần đảo Trường Sa,...”: Từ năm 1945 đến năm 1975, chính quyền Sài Gòn tiếp tục quản lí, thực thi chủ quyền đối với hai quần đảo như: cử quân đồn trú, dựng bia chủ quyền và ban hành các sắc lệnh hành chính sáp nhập quần đảo Hoàng Sa vào tỉnh Quảng Nam (nay thuộc thành phố Đà Nẵng) và quần đảo Trường Sa vào tỉnh Phước Tuy (nay thuộc thành phố Hồ Chí Minh),... - Lồng ghép GDQPAN. Tích hợp NLS 2.2.CB2a, AI 5.C4.2 & BVMT.',
      },
      {
        week: '5–6',
        lessonName: 'Bài 4. Dân cư và dân tộc Việt Nam',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 1.3.CB2a: Sử dụng Excel/Google Sheets nhập, sắp xếp số liệu dân số và phân bố dân cư. Tích hợp AI 5.D2.1: Liên hệ dữ liệu tổng điều tra dân số giúp AI dự báo xu hướng dân số. Tích hợp QCN & ĐĐLS: Các dân tộc Việt Nam đều bình đẳng, đoàn kết, tôn trọng bản sắc văn hóa.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-lsdl-cd2',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK1',
    weekRange: 'Tuần 6 – Tuần 9',
    totalPeriods: 6,
    chapterCode: 'LSDL5-CD2',
    chapterTitle: 'Chủ đề 2: Những quốc gia đầu tiên trên lãnh thổ Việt Nam (6 tiết)',
    topicTitle:
      'Bài 5: Nhà nước Văn Lang, Nhà nước Âu Lạc (3 tiết); Bài 6: Vương quốc Phù Nam (1 tiết); Bài 7: Vương quốc Chăm-pa (2 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (1.2.CB2a, 3.1.CB2a), AI (5.A2.1, 5.D1.1, 5.C4.2), ĐĐLS (tự hào cội nguồn dân tộc, tôn trọng sự đa dạng văn hóa) và BVMT.',
    rawLessons: [
      {
        week: '6–7',
        lessonName: 'Bài 5. Nhà nước Văn Lang, Nhà nước Âu Lạc',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 1.2.CB2a & AI 5.A2.1: Xem video/ảnh 3D phục dựng trống đồng Đông Sơn, thành Cổ Loa từ website bảo tàng, thư viện số. Tích hợp ĐĐLS: Bồi dưỡng lòng tự hào về cội nguồn dân tộc, trân trọng di sản và truyền thống dựng nước, giữ nước.',
      },
      {
        week: '8',
        lessonName: 'Bài 6. Vương quốc Phù Nam',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a & AI 5.D1.1: Tạo thẻ thông tin số trên Canva/PowerPoint giới thiệu hiện vật tiêu biểu của Vương quốc Phù Nam; mô phỏng quy trình “dạy” máy nhận diện hiện vật cổ Phù Nam.',
      },
      {
        week: '8–9',
        lessonName: 'Bài 7. Vương quốc Chăm-pa',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a & AI 5.C4.2: Tạo thẻ ghi nhớ điện tử và trải nghiệm tham quan ảo tích hợp AI khám phá đền tháp Chăm-pa. Tích hợp ĐĐLS & BVMT: Tôn trọng văn hóa Chăm-pa, giữ gìn cảnh quan sạch đẹp quanh di tích.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-lsdl-cd3',
    subject: 'Lịch sử và Địa lí',
    semester: 'CA_NAM',
    weekRange: 'Tuần 9 – Tuần 22',
    totalPeriods: 26,
    chapterCode: 'LSDL5-CD3',
    chapterTitle: 'Chủ đề 3: Xây dựng và bảo vệ đất nước Việt Nam (26 tiết)',
    topicTitle:
      'Bài 8: Đấu tranh giành độc lập thời kì Bắc thuộc (2 tiết); Bài 9: Triều Lý và việc định đô ở Thăng Long (3 tiết); Bài 10: Triều Trần xây dựng đất nước và kháng chiến chống quân Mông – Nguyên xâm lược (4 tiết); Bài 11: Ôn tập (2 tiết); Bài 12: Khởi nghĩa Lam Sơn và Triều Hậu Lê (3 tiết); Bài 13: Triều Nguyễn (3 tiết); Kiểm tra cuối HKI (1 tiết); Bài 14: Cách mạng tháng Tám năm 1945 (2 tiết); Bài 15: Chiến dịch Điện Biên Phủ năm 1954 (2 tiết); Bài 16: Chiến dịch Hồ Chí Minh năm 1975 (2 tiết); Bài 17: Đất nước Đổi mới (2 tiết)',
    adjustedContentSummary:
      'Tích hợp QPAN (chiến thắng Bạch Đằng, khởi nghĩa Lam Sơn, Điện Biên Phủ 1954, Chiến dịch Hồ Chí Minh 1975), ĐĐLS, QCN, NLS (3.1.CB2a, 1.1.CB2b, 2.3.CB2a, 1.3.CB2a, 5.2.CB2a, 6.1.CB2a) và AI (5.A1.1, 5.B3.1, 5.A1.2, 5.A3.1, 5.C4.1, 5.A2.2, 5.B1.2, 5.C4.2, 5.D2.1).',
    rawLessons: [
      {
        week: '9–10',
        lessonName: 'Bài 8. Đấu tranh giành độc lập thời kì Bắc thuộc',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a: Tạo sơ đồ thời gian số về các cuộc khởi nghĩa tiêu biểu thời Bắc thuộc. Tích hợp AI 5.A1.1: Tìm hiểu cách AI hỗ trợ số hóa, dịch văn bản Hán Nôm cổ. Tích hợp ĐĐLS: Bồi dưỡng lòng yêu nước, ý chí độc lập, tự chủ.',
      },
      {
        week: '10–11',
        lessonName: 'Bài 9. Triều Lý và việc định đô ở Thăng Long',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 1.1.CB2b: Tra cứu hình ảnh 360 độ về chùa Một Cột, Hoàng thành Thăng Long. Tích hợp AI 5.B3.1: Dùng chatbot AI liệt kê đóng góp của vua Lý Thái Tổ và đối chiếu SGK. Tích hợp ĐĐLS & QCN: Tự hào về Thăng Long – Hà Nội nghìn năm văn hiến, bảo vệ di sản văn hóa.',
      },
      {
        week: '12–13',
        lessonName:
          'Bài 10. Triều Trần xây dựng đất nước và kháng chiến chống quân Mông – Nguyên xâm lược',
        subLessonName: 'Tiết 1 – Tiết 4',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Tích hợp AI 5.A1.2: Xem video mô phỏng trận Bạch Đằng do AI hỗ trợ dựng lại. Tích hợp NLS 3.1.CB2a: Dùng Canva/PowerPoint tạo lược đồ kháng chiến chống quân Mông – Nguyên. Tích hợp QPAN & ĐĐLS: Hiểu bài học đoàn kết toàn dân, noi gương Trần Quốc Tuấn, Trần Quốc Toản.',
      },
      {
        week: '14',
        lessonName: 'Bài 11. Ôn tập',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.A3.1 & NLS 2.3.CB2a: Tham gia trò chơi ôn tập trên Wordwall/Quizizz/Kahoot để củng cố kiến thức về các quốc gia đầu tiên và các triều đại phong kiến. Tích hợp ĐĐLS: Trung thực khi làm bài ôn tập.',
      },
      {
        week: '15–16',
        lessonName: 'Bài 12. Khởi nghĩa Lam Sơn và Triều Hậu Lê',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a: Sử dụng sơ đồ tư duy số hệ thống hóa diễn biến khởi nghĩa Lam Sơn và đóng góp của Lê Lợi, Nguyễn Trãi. Tích hợp AI 5.C4.1: Dùng cấu trúc “Nếu… thì…” tái hiện chiến thuật nghĩa quân Lam Sơn. Tích hợp QPAN & ĐĐLS: Tinh thần nhân nghĩa, khoan dung, trọng hiền tài thời Hậu Lê.',
      },
      {
        week: '16–17',
        lessonName: 'Bài 13. Triều Nguyễn',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI 5.A2.2 & NLS 1.1.CB2b: Tìm hiểu AI trong bảo tồn Nhã nhạc cung đình Huế; tra cứu hình ảnh số về Kinh thành Huế, lăng tẩm triều Nguyễn. Tích hợp ĐĐLS & QCN: Giữ gìn di sản văn hóa Huế và nhìn nhận lịch sử khách quan.',
      },
      {
        week: '18',
        lessonName: 'Kiểm tra, đánh giá cuối học kì I',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Thực hiện bài kiểm tra, đánh giá định kỳ cuối học kì I môn Lịch sử và Địa lí lớp 5 theo Thông tư 27/2020/TT-BGDĐT.',
      },
      {
        week: '18–19',
        lessonName: 'Bài 14. Cách mạng tháng Tám năm 1945',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 1.3.CB2a: Tìm kiếm hình ảnh tư liệu về Cách mạng tháng Tám, ngày 2-9-1945 và lưu trữ vào thư mục rõ ràng. Tích hợp AI 5.B1.2: Tìm hiểu AI phục dựng âm thanh, hình ảnh Bác Hồ đọc Tuyên ngôn Độc lập; cảnh báo deepfake làm sai lệch lịch sử. Tích hợp ĐĐLS: Trân trọng giá trị độc lập, tự do.',
      },
      {
        week: '19–20',
        lessonName: 'Bài 15. Chiến dịch Điện Biên Phủ năm 1954',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.A1.1: Tìm hiểu robot AI hỗ trợ rà phá bom mìn sau chiến tranh. Tích hợp NLS 5.2.CB2a: Sử dụng lược đồ số xác định vị trí Điện Biên Phủ. Tích hợp QPAN & ĐĐLS: Hiểu ý nghĩa chiến thắng Điện Biên Phủ, biết ơn các anh hùng liệt sĩ.',
      },
      {
        week: '20–21',
        lessonName: 'Bài 16. Chiến dịch Hồ Chí Minh năm 1975',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.C4.2 & NLS 1.3.CB2a: Dùng AI Search sưu tầm và lưu trữ hình ảnh, video tư liệu về sự kiện 30-4-1975. Tích hợp QPAN & ĐĐLS: Hiểu ý nghĩa của đại thắng mùa Xuân 1975 đối với độc lập, thống nhất đất nước.',
      },
      {
        week: '21–22',
        lessonName: 'Bài 17. Đất nước Đổi mới',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 6.1.CB2a & AI 5.D2.1: Tra cứu thành tựu công nghệ, sự phát triển của máy tính, Internet và AI ở Việt Nam qua thời kì Đổi mới. Tích hợp ĐĐLS: Tự hào về thành tựu đất nước, có ý thức học tập, sáng tạo để thích ứng với thời đại số.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-lsdl-cd4',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 26',
    totalPeriods: 8,
    chapterCode: 'LSDL5-CD4',
    chapterTitle: 'Chủ đề 4: Các nước láng giềng (8 tiết)',
    topicTitle:
      'Bài 18: Nước Cộng hòa Nhân dân Trung Hoa (2 tiết); Bài 19: Nước Cộng hòa Dân chủ Nhân dân Lào (2 tiết); Bài 20: Vương quốc Cam-pu-chia (2 tiết); Bài 21: Hiệp hội các quốc gia Đông Nam Á (ASEAN) (2 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (5.2.CB2a, 1.1.CB2b, 2.5.CB2a), AI (5.C4.2, 5.D1.1, 5.A2.2, 5.B1.1), QCN, ĐĐLS (tình hữu nghị với các nước láng giềng), BVMT và QPAN.',
    rawLessons: [
      {
        week: '23',
        lessonName: 'Bài 18. Nước Cộng hòa Nhân dân Trung Hoa',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 5.2.CB2a: Sử dụng Google Earth/Google Maps xác định vị trí Trung Quốc, thủ đô Bắc Kinh, Vạn Lý Trường Thành, Cố cung Bắc Kinh. Tích hợp AI 5.C4.2: Dùng ứng dụng dịch thuật AI tìm hiểu nghĩa gốc địa danh. Tích hợp QCN & ĐĐLS: Tôn trọng sự khác biệt văn hóa, giao tiếp văn minh.',
      },
      {
        week: '24',
        lessonName: 'Bài 19. Nước Cộng hòa Dân chủ Nhân dân Lào',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.D1.1 & NLS 5.2.CB2a: Giả lập quy trình dạy robot AI giám sát, bảo vệ Cánh đồng Chum; sử dụng Google Maps xác định vị trí Lào, thủ đô Viêng Chăn, sông Mê Công. Tích hợp ĐĐLS & QCN: Trân trọng tình hữu nghị Việt Nam – Lào, tôn trọng chủ quyền, văn hóa nước bạn.',
      },
      {
        week: '25',
        lessonName: 'Bài 20. Vương quốc Cam-pu-chia',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.A2.2 & NLS 1.1.CB2b: Tìm hiểu AI hỗ trợ khách du lịch tại Ăng-co Vát; khai thác hình ảnh số về Ăng-co Vát, Biển Hồ, thủ đô Phnôm Pênh. Tích hợp BVMT & ĐĐLS: Bảo vệ cảnh quan tại di sản văn hóa, giữ thái độ hữu nghị với các nước láng giềng.',
      },
      {
        week: '25–26',
        lessonName: 'Bài 21. Hiệp hội các quốc gia Đông Nam Á (ASEAN)',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 2.5.CB2a: Trao đổi ý nghĩa cờ ASEAN, mục tiêu hợp tác ASEAN trên Padlet. Tích hợp AI 5.B1.1: Thảo luận chatbot AI cần dữ liệu đa dạng để phục vụ công bằng người dân các nước ASEAN. Tích hợp QCN & QPAN: Bình đẳng, hợp tác giữ gìn hòa bình, ổn định khu vực.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-lsdl-cd5',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK2',
    weekRange: 'Tuần 26 – Tuần 31',
    totalPeriods: 11,
    chapterCode: 'LSDL5-CD5',
    chapterTitle: 'Chủ đề 5: Tìm hiểu thế giới (11 tiết)',
    topicTitle:
      'Bài 22: Các châu lục và đại dương trên thế giới (5 tiết); Bài 23: Dân số và các chủng tộc trên thế giới (2 tiết); Bài 24: Văn minh Ai Cập (2 tiết); Bài 25: Văn minh Hy Lạp (2 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (5.2.CB2a, 3.1.CB2a, 1.1.CB2b), AI (5.A2.2, 5.B1.2, 5.C4.1, 5.A2.1), BVMT, Tiết kiệm và bảo vệ nguồn nước, QCN và ĐĐLS.',
    rawLessons: [
      {
        week: '26–28',
        lessonName: 'Bài 22. Các châu lục và đại dương trên thế giới',
        subLessonName: 'Tiết 1 – Tiết 5',
        periodAllocation: '5 tiết',
        periodsCount: 5,
        adjustedContent:
          'Tích hợp NLS 5.2.CB2a: Sử dụng Wordwall kéo thả tên các châu lục và đại dương vào lược đồ. Tích hợp AI 5.A2.2: Tìm hiểu hệ thống AI theo dõi biến đổi khí hậu toàn cầu và đo độ sâu đại dương. Tích hợp BVMT & Tiết kiệm và bảo vệ nguồn nước: Bảo vệ đại dương, sông ngòi, nguồn nước ngọt, giảm rác thải nhựa.',
      },
      {
        week: '29',
        lessonName: 'Bài 23. Dân số và các chủng tộc trên thế giới',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a: Sử dụng Canva tạo biểu đồ/infographic đơn giản từ số liệu dân số thế giới. Tích hợp AI 5.B1.2, QCN & ĐĐLS: Mọi người đều có quyền bình đẳng, AI cần phục vụ công bằng, không phân biệt chủng tộc, màu da.',
      },
      {
        week: '30',
        lessonName: 'Bài 24. Văn minh Ai Cập',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.C4.1: Thiết kế quy trình “Nếu phát hiện nhiệt độ trong kim tự tháp quá cao thì robot AI tự động điều chỉnh thông gió”. Tích hợp Tiết kiệm nước, NLS 1.1.CB2b & ĐĐLS: Liên hệ vai trò sông Nin; khai thác hình ảnh số về kim tự tháp, chữ tượng hình.',
      },
      {
        week: '31',
        lessonName: 'Bài 25. Văn minh Hy Lạp',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp AI 5.A2.1 & ĐĐLS: Thảo luận AI có thể tạo tác phẩm giống Hy Lạp cổ đại nhưng ý tưởng sáng tạo thuộc về con người; tôn trọng bản quyền. Tích hợp NLS 3.1.CB2a & QCN: Tạo thẻ thông tin số giới thiệu Thế vận hội, đền Pác-tê-nông.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-lsdl-cd6',
    subject: 'Lịch sử và Địa lí',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 8,
    chapterCode: 'LSDL5-CD6',
    chapterTitle: 'Chủ đề 6: Chung tay xây dựng thế giới & Kiểm tra cuối năm (8 tiết)',
    topicTitle:
      'Bài 26: Xây dựng thế giới xanh – sạch – đẹp (2 tiết); Bài 27: Xây dựng thế giới hòa bình (2 tiết); Bài 28: Ôn tập (3 tiết); Kiểm tra, đánh giá cuối năm (1 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (4.4.CB2a, 4.2.CB2a, 3.1.CB2a), AI (5.A2.2, 5.A2.1, 5.D2.1), BVMT, Tiết kiệm nước, QCN, QPAN và ĐĐLS.',
    rawLessons: [
      {
        week: '32',
        lessonName: 'Bài 26. Xây dựng thế giới xanh – sạch – đẹp',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 4.4.CB2a & AI 5.A2.2: Tìm hiểu robot AI thu gom rác đại dương hoặc AI nghe âm thanh rừng phát hiện phá rừng. Tích hợp BVMT & Tiết kiệm và bảo vệ nguồn nước: Giữ trường lớp, cộng đồng xanh – sạch – đẹp, bảo vệ nguồn nước sạch.',
      },
      {
        week: '33–34',
        lessonName: 'Bài 27. Xây dựng thế giới hòa bình',
        subLessonName: 'Tiết 1 – Tiết 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tích hợp NLS 4.2.CB2a: Soạn email/tin nhắn lan tỏa thông điệp yêu hòa bình, bảo mật thông tin cá nhân. Tích hợp AI 5.A2.1, QCN & QPAN: Quyền được sống trong hòa bình, an toàn; giữ gìn hòa bình gắn với trách nhiệm bảo vệ Tổ quốc.',
      },
      {
        week: '34–35',
        lessonName: 'Bài 28. Ôn tập',
        subLessonName: 'Tiết 1 – Tiết 3',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp NLS 3.1.CB2a & AI 5.D2.1: Sử dụng sơ đồ tư duy số Coggle/MindMeister/Canva để hệ thống hóa kiến thức Lịch sử và Địa lí 5. Tích hợp ĐĐLS: Tổng kết bài học về yêu nước, trách nhiệm công dân, tôn trọng di sản và bảo vệ môi trường.',
      },
      {
        week: '35',
        lessonName: 'Kiểm tra, đánh giá cuối năm',
        subLessonName: 'Tiết 1',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Thực hiện bài kiểm tra, đánh giá định kỳ cuối năm học môn Lịch sử và Địa lí lớp 5 theo Thông tư 27/2020/TT-BGDĐT.',
      },
    ],
  }),
];

// ============================================================================
// 6. HOẠT ĐỘNG TRẢI NGHIỆM LỚP 5 (35 TUẦN – 105 TIẾT: HKI 54 TIẾT, HKII 51 TIẾT)
// ============================================================================

export const GRADE5_HDTN_TOPICS: CurriculumTopic[] = [
  buildGrade5Topic({
    id: 'g5-hdtn-cd1',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 4',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD1',
    chapterTitle: 'Chủ đề 1: Em lớn lên mỗi ngày (12 tiết)',
    topicTitle:
      'Tuần 1: Chúng mình đã lớn (3 tiết); Tuần 2: Từng bước trưởng thành (3 tiết); Tuần 3: Cân bằng cảm xúc (3 tiết); Tuần 4: Thể hiện cảm xúc phù hợp (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A2.1, 5.A1.1, 5.A1.2), NLS (3.1.CB2a, 1.1.CB2b, 4.2.CB2a), QCN và ĐĐLS.',
    rawLessons: [
      {
        week: '1',
        lessonName: 'Tuần 1: Chúng mình đã lớn',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.1): Con người có sự trưởng thành về tâm hồn và kỉ niệm thật, AI chỉ mô phỏng dữ liệu. Tích hợp NLS 3.1.CB2a: Dùng Canva/PowerPoint tạo sơ đồ các cột mốc phát triển từ lớp 1 đến lớp 5. Tích hợp QCN & ĐĐLS: Tôn trọng sự phát triển riêng, tự tin, trách nhiệm trong năm học cuối cấp.',
      },
      {
        week: '2',
        lessonName: 'Tuần 2: Từng bước trưởng thành',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A1.1): Nhận biết ứng dụng AI như robot hút bụi, máy rửa bát hỗ trợ việc nhà. Tích hợp NLS 3.1.CB2a: Quay clip ngắn (30–60 giây) giới thiệu việc nhà em làm thạo. Tích hợp ĐĐLS & QCN: Yêu lao động, tự giác làm việc nhà vừa sức.',
      },
      {
        week: '3',
        lessonName: 'Tuần 3: Cân bằng cảm xúc',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.1): Phân biệt sự cảm thông thực sự giữa bạn bè với phản hồi lập trình sẵn của robot. Tích hợp NLS 1.1.CB2b: Tìm kiếm câu chuyện truyền cảm hứng về sự sẻ chia. Tích hợp QCN & ĐĐLS: Lắng nghe, tôn trọng cảm xúc của bạn, cân bằng cảm xúc tích cực.',
      },
      {
        week: '4',
        lessonName: 'Tuần 4: Thể hiện cảm xúc phù hợp',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A1.2): Con người là chủ thể điều khiển và chịu trách nhiệm về cảm xúc. Tích hợp NLS 4.2.CB2a: Thực hành viết “Nhật ký cảm xúc” trên ứng dụng ghi chú số và cài đặt mật khẩu bảo vệ quyền riêng tư. Tích hợp ĐĐLS & QCN: Làm chủ cảm xúc, ứng xử lịch sự.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd2',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 5 – Tuần 8',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD2',
    chapterTitle: 'Chủ đề 2: Giữ gìn tình bạn (12 tiết)',
    topicTitle:
      'Tuần 5: Các vấn đề nảy sinh trong mối quan hệ bạn bè và cách giải quyết (3 tiết); Tuần 6: Những vấn đề nảy sinh giữa bạn bè trong học tập và rèn luyện (3 tiết); Tuần 7: Giữ gìn tình bạn (3 tiết); Tuần 8: Kế hoạch hoạt động “Cùng làm nên kỉ niệm” (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.B1.1, 5.D2.1, 5.B2.1, 5.A3.1), NLS (3.1.CB2a, 2.4.CB2a, 1.1.CB2b, 1.3.CB2a), QCN và ĐĐLS.',
    rawLessons: [
      {
        week: '5',
        lessonName:
          'Tuần 5: Các vấn đề nảy sinh trong mối quan hệ bạn bè và cách giải quyết',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.B1.1): Áp dụng tư duy “công bằng” giải quyết mâu thuẫn khách quan, không thiên vị. Tích hợp NLS 3.1.CB2a: Dùng sơ đồ tư duy trực tuyến liệt kê các bước giải quyết mâu thuẫn. Tích hợp QCN & ĐĐLS: Không bắt nạt, cô lập bạn; biết xin lỗi và tha thứ.',
      },
      {
        week: '6',
        lessonName:
          'Tuần 6: Những vấn đề nảy sinh giữa bạn bè trong học tập và rèn luyện',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.D2.1): Liên hệ làm việc nhóm giống như “cập nhật dữ liệu”. Tích hợp NLS 2.4.CB2a: Dùng Zalo/Teams phân công nhiệm vụ làm sản phẩm học tập. Tích hợp ĐĐLS & QCN: Hợp tác, không đổ lỗi, tôn trọng ý kiến các thành viên.',
      },
      {
        week: '7',
        lessonName: 'Tuần 7: Giữ gìn tình bạn',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.B2.1): Đề xuất dùng AI có trách nhiệm hỗ trợ bạn bè khuyết tật giao tiếp. Tích hợp NLS 1.1.CB2b: Sưu tầm hình ảnh/video hoạt động thiện nguyện, kết nối cộng đồng. Tích hợp QCN & ĐĐLS: Nuôi dưỡng tình bạn trong sáng, nhân ái, thủy chung.',
      },
      {
        week: '8',
        lessonName: 'Tuần 8: Kế hoạch hoạt động “Cùng làm nên kỉ niệm”',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A3.1): Dùng trợ lý ảo gợi ý ý tưởng tổ chức hoạt động kỉ niệm của lớp. Tích hợp NLS 1.3.CB2a: Lập bảng kế hoạch số trên Excel/Sheets quản lý công việc và thời gian. Tích hợp ĐĐLS & QCN: Hợp tác, chia sẻ trách nhiệm tập thể.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd3',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 9 – Tuần 12',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD3',
    chapterTitle: 'Chủ đề 3: Tôn sư trọng đạo (12 tiết)',
    topicTitle:
      'Tuần 9: Sự kiện về truyền thống tôn sư trọng đạo (3 tiết); Tuần 10: Tâm sự thầy - trò (3 tiết); Tuần 11: Vun đắp tình thầy trò (3 tiết); Tuần 12: Chuẩn bị chào mừng Ngày Nhà giáo Việt Nam 20-11 (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A2.2, 5.A2.1, 5.A1.2, 5.A3.1), NLS (1.1.CB2b, 2.1.CB2a, 3.1.CB2a), ĐĐLS và QCN.',
    rawLessons: [
      {
        week: '9',
        lessonName: 'Tuần 9: Sự kiện về truyền thống tôn sư trọng đạo',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.2): Tìm hiểu cách AI hỗ trợ lưu trữ dữ liệu và phục dựng hình ảnh truyền thống nhà trường. Tích hợp NLS 1.1.CB2b: Truy cập website trường tìm hiểu lịch sử, thành tích truyền thống. Tích hợp ĐĐLS & QCN: Kính trọng thầy cô, tự hào về mái trường.',
      },
      {
        week: '10',
        lessonName: 'Tuần 10: Tâm sự thầy - trò',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.1): Thầy cô có tình yêu thương và sự thấu cảm mà máy móc AI không bao giờ thay thế được. Tích hợp NLS 2.1.CB2a: Lựa chọn phương tiện giao tiếp số phù hợp để gửi lời tri ân hoặc chia sẻ băn khoăn với thầy cô. Tích hợp QCN & ĐĐLS.',
      },
      {
        week: '11',
        lessonName: 'Tuần 11: Vun đắp tình thầy trò',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A1.2): Con người quyết định nội dung tri ân, AI chỉ hỗ trợ trình bày. Tích hợp NLS 3.1.CB2a: Thiết kế thiệp điện tử hoặc poster số gửi tặng thầy cô. Tích hợp ĐĐLS & QCN: Lễ phép, chăm học, biết nói lời cảm ơn.',
      },
      {
        week: '12',
        lessonName: 'Tuần 12: Chuẩn bị chào mừng Ngày Nhà giáo Việt Nam 20-11',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A3.1): Vận dụng công cụ tìm kiếm thông minh chọn bài hát, hình ảnh trang trí báo tường. Tích hợp NLS 3.1.CB2a: Biên tập video ngắn từ ảnh chụp hoạt động của lớp trình chiếu trong lễ kỷ niệm 20-11. Tích hợp ĐĐLS & QCN.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd4',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    weekRange: 'Tuần 13 – Tuần 16',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD4',
    chapterTitle: 'Chủ đề 4: Quản lí chi tiêu và lập kế hoạch kinh doanh (12 tiết)',
    topicTitle:
      'Tuần 13: Sổ tay ghi chép chi tiêu trong gia đình (3 tiết); Tuần 14: Ý tưởng kinh doanh (3 tiết); Tuần 15: Việc cần làm để thực hiện kế hoạch kinh doanh (3 tiết); Tuần 16: Xây dựng kế hoạch kinh doanh (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.D1.1, 5.D2.1, 5.B3.1), NLS (1.3.CB2a, 1.1.CB2b, 1.2.CB2a, 3.1.CB2a), ĐĐLS và QCN.',
    rawLessons: [
      {
        week: '13',
        lessonName: 'Tuần 13: Sổ tay ghi chép chi tiêu trong gia đình',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.D1.1): Lập quy tắc chi tiêu: “Dữ liệu đầu vào (tiền túi) -> Quy tắc (tiết kiệm) -> Kết quả”. Tích hợp NLS 1.3.CB2a: Nhập số liệu thu chi vào phần mềm bảng tính, dùng hàm tính tổng. Tích hợp ĐĐLS & QCN: Tiết kiệm, trân trọng công sức lao động của cha mẹ.',
      },
      {
        week: '14',
        lessonName: 'Tuần 14: Ý tưởng kinh doanh',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.D1.1): Thu thập dữ liệu (khảo sát) là khâu quan trọng để đưa ra phản hồi chính xác. Tích hợp NLS 1.1.CB2b: Thiết kế biểu mẫu khảo sát trực tuyến (Google Forms) về sản phẩm dự kiến. Tích hợp QCN & ĐĐLS: Trung thực, lựa chọn sản phẩm có ích, an toàn.',
      },
      {
        week: '15',
        lessonName: 'Tuần 15: Việc cần làm để thực hiện kế hoạch kinh doanh',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.D2.1): Liên tục cập nhật phản hồi từ khách hàng để cải tiến. Tích hợp NLS 1.2.CB2a: Tra cứu thông tin giá nguyên liệu và các bước làm sản phẩm từ nguồn tin cậy. Tích hợp ĐĐLS & QCN: Phân công nhiệm vụ công bằng, vừa sức.',
      },
      {
        week: '16',
        lessonName: 'Tuần 16: Xây dựng kế hoạch kinh doanh',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.B3.1): Đảm bảo tính minh bạch khi giải thích lý do lựa chọn sản phẩm. Tích hợp NLS 3.1.CB2a: Tạo bài trình bày (Slide) giới thiệu mục tiêu, dự trù chi phí và phân công nhiệm vụ. Tích hợp ĐĐLS & QCN: Minh bạch, công khai mục đích gây quỹ nhân ái.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd5',
    subject: 'Hoạt động trải nghiệm',
    semester: 'CA_NAM',
    weekRange: 'Tuần 17 – Tuần 20',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD5',
    chapterTitle: 'Chủ đề 5: Gia đình đầm ấm (12 tiết)',
    topicTitle:
      'Tuần 17: Trách nhiệm của em trong gia đình (3 tiết); Tuần 18: Biết ơn người thân trong gia đình (3 tiết); Tuần 19: Gia đình là tổ ấm (3 tiết); Tuần 20: Ngày cuối tuần vui vẻ, đầm ấm (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A1.1, 5.B2.1, 5.A2.2, 5.A3.1), NLS (1.1.CB2b, 1.3.CB2a, 2.1.CB2a, 5.2.CB2a), ĐĐLS và QCN.',
    rawLessons: [
      {
        week: '17',
        lessonName: 'Tuần 17: Trách nhiệm của em trong gia đình',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A1.1): Tìm hiểu thiết bị nhà thông minh (Smart Home) giám sát an toàn. Tích hợp NLS 1.1.CB2b: Xem video hướng dẫn kỹ năng làm việc nhà an toàn trên YouTube Kids. Tích hợp ĐĐLS & QCN: Quan tâm, chia sẻ việc vừa sức trong gia đình.',
      },
      {
        week: '18',
        lessonName: 'Tuần 18: Biết ơn người thân trong gia đình',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.B2.1): Sử dụng AI có trách nhiệm tạo thiệp điện tử, ảnh kỉ niệm tặng người thân. Tích hợp NLS 1.3.CB2a: Tổ chức và sắp xếp ảnh kỷ niệm gia đình vào thư mục máy tính/đám mây. Tích hợp ĐĐLS & QCN: Hiếu thảo, yêu thương người thân.',
      },
      {
        week: '19',
        lessonName: 'Tuần 19: Gia đình là tổ ấm',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.2) & NLS 2.1.CB2a: Sử dụng ứng dụng gọi video tích hợp dịch tự động/phụ đề để kết nối người thân ở xa. Tích hợp QCN & ĐĐLS: Vun đắp bầu không khí gia đình vui vẻ, đầm ấm.',
      },
      {
        week: '20',
        lessonName: 'Tuần 20: Ngày cuối tuần vui vẻ, đầm ấm',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A3.1): Tìm kiếm công thức món ăn hoặc danh sách phim phù hợp cho cả nhà. Tích hợp NLS 5.2.CB2a: Dùng ứng dụng Lịch số (Google Calendar) lập thời gian biểu hoạt động cuối tuần cùng gia đình. Tích hợp ĐĐLS & QCN.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd6',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 21 – Tuần 24',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD6',
    chapterTitle: 'Chủ đề 6: Sống an toàn và tự chủ (12 tiết)',
    topicTitle:
      'Tuần 21: Nhận diện các môi trường học tập mới (3 tiết); Tuần 22: Các đức tính cần thiết trong môi trường học tập mới (3 tiết); Tuần 23: Tự chủ và đảm bảo an toàn khi giao tiếp trên mạng (3 tiết); Tuần 24: Nguyên nhân và cách phòng chống hoả hoạn (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A3.1, 5.D2.1, 5.A1.1), NLS (3.1.CB2a, 5.2.CB2a, 4.2.CB2a, 1.2.CB2a), QCN, ĐĐLS và QPAN (an ninh mạng, phòng cháy chữa cháy).',
    rawLessons: [
      {
        week: '21',
        lessonName: 'Tuần 21: Nhận diện các môi trường học tập mới',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A3.1): Nhận diện các “trợ lý học tập AI” giúp cá nhân hóa việc học. Tích hợp NLS 3.1.CB2a: Lập bảng so sánh ngắn trên PowerPoint/Google Slides về môi trường học tập mới (THCS). Tích hợp QCN & ĐĐLS: Chủ động thích nghi.',
      },
      {
        week: '22',
        lessonName:
          'Tuần 22: Các đức tính cần thiết trong môi trường học tập mới',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.D2.1): Liên hệ khả năng thích ứng của con người. Tích hợp NLS 5.2.CB2a: Dùng bảng kiểm số hoặc Google Forms tự đánh giá mức độ thích ứng, kiên trì, chủ động. Tích hợp ĐĐLS & QCN.',
      },
      {
        week: '23',
        lessonName:
          'Tuần 23: Tự chủ và đảm bảo an toàn khi giao tiếp trên mạng',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A3.1): Tuyệt đối không chia sẻ thông tin cá nhân, địa chỉ, ảnh riêng tư cho các chatbot AI lạ. Tích hợp NLS 4.2.CB2a: Lập danh sách “5 việc nên làm - 5 việc không nên làm” khi giao tiếp trên mạng bằng Canva/PowerPoint. Tích hợp QCN & QPAN: Cảnh giác đường dẫn lạ, tin giả.',
      },
      {
        week: '24',
        lessonName: 'Tuần 24: Nguyên nhân và cách phòng chống hoả hoạn',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A1.1): Nhận biết robot chữa cháy, cảm biến báo khói tự động tích hợp AI. Tích hợp NLS 1.2.CB2a: Xem video hướng dẫn phòng cháy chữa cháy từ nguồn chính thống, ghi lại sơ đồ thoát hiểm. Tích hợp QPAN & QCN: Giữ an toàn phòng cháy chữa cháy.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd7',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 25 – Tuần 27',
    totalPeriods: 9,
    chapterCode: 'HDTN5-CD7',
    chapterTitle: 'Chủ đề 7: Tham gia hoạt động xã hội (9 tiết)',
    topicTitle:
      'Tuần 25: Tham gia lễ hội truyền thống ở địa phương (3 tiết); Tuần 26: Tham gia hoạt động xã hội (3 tiết); Tuần 27: Thân thiện với người xung quanh (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A2.2, 5.B2.1, 5.B1.1), NLS (1.1.CB2b, 2.4.CB2a, 3.1.CB2a), ĐĐLS, BVMT và QCN.',
    rawLessons: [
      {
        week: '25',
        lessonName: 'Tuần 25: Tham gia lễ hội truyền thống ở địa phương',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.2): Tìm hiểu cách AI giúp quảng bá và dịch thuật thông tin lễ hội địa phương. Tích hợp NLS 1.1.CB2b: Tìm kiếm hình ảnh, thông tin về lễ hội truyền thống địa phương trên trang chính thống. Tích hợp ĐĐLS & BVMT: Giữ trật tự, vệ sinh khu di tích.',
      },
      {
        week: '26',
        lessonName: 'Tuần 26: Tham gia hoạt động xã hội',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.B2.1): Đề xuất ứng dụng AI phân loại rác thải tự động tại sự kiện cộng đồng. Tích hợp NLS 2.4.CB2a: Dùng Padlet/Google Docs ghi ý tưởng và phân công nhiệm vụ hoạt động xã hội. Tích hợp BVMT & ĐĐLS.',
      },
      {
        week: '27',
        lessonName: 'Tuần 27: Thân thiện với người xung quanh',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.B1.1): AI cần phục vụ mọi người như nhau, không định kiến. Tích hợp NLS 3.1.CB2a: Thiết kế thông điệp số ngắn về ứng xử thân thiện, tôn trọng người xung quanh. Tích hợp QCN & ĐĐLS.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd8',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 28 – Tuần 31',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD8',
    chapterTitle: 'Chủ đề 8: Tự hào quê hương em (12 tiết)',
    topicTitle:
      'Tuần 28: Tự hào về cảnh quan thiên nhiên của quê hương, đất nước (3 tiết); Tuần 29: Biện pháp bảo tồn cảnh quan thiên nhiên (3 tiết); Tuần 30: Lập kế hoạch khảo sát thực trạng môi trường quanh em (3 tiết); Tuần 31: Chung tay bảo vệ môi trường quanh ta (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A2.2, 5.D1.1, 5.D2.1), NLS (1.1.CB2b, 3.1.CB2a, 1.3.CB2a), BVMT và Tiết kiệm & bảo vệ nguồn nước.',
    rawLessons: [
      {
        week: '28',
        lessonName:
          'Tuần 28: Tự hào về cảnh quan thiên nhiên của quê hương, đất nước',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.2): Tìm hiểu AI theo dõi đa dạng sinh học và bảo tồn động vật hoang dã. Tích hợp NLS 1.1.CB2b: Sưu tầm ảnh cảnh quan thiên nhiên quê hương. Tích hợp BVMT & Tiết kiệm nước: Giữ sạch ao hồ, sông suối, biển đảo.',
      },
      {
        week: '29',
        lessonName: 'Tuần 29: Biện pháp bảo tồn cảnh quan thiên nhiên',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.2): Phân tích ảnh vệ tinh phát hiện sớm đám cháy rừng hoặc vết dầu loang. Tích hợp NLS 3.1.CB2a: Làm poster số tuyên truyền biện pháp bảo tồn cảnh quan thiên nhiên. Tích hợp BVMT & Tiết kiệm nước.',
      },
      {
        week: '30',
        lessonName:
          'Tuần 30: Lập kế hoạch khảo sát thực trạng môi trường quanh em',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.D1.1): Vận dụng quy trình “Xác định vấn đề môi trường -> Thu thập dữ liệu thực tế -> Đưa ra kết luận”. Tích hợp NLS 1.3.CB2a: Thiết kế phiếu khảo sát ngắn bằng Google Forms về thực trạng môi trường và nguồn nước quanh em. Tích hợp BVMT & Tiết kiệm nước.',
      },
      {
        week: '31',
        lessonName: 'Tuần 31: Chung tay bảo vệ môi trường quanh ta',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.D2.1): Báo cáo dữ liệu môi trường hàng ngày giúp AI đưa ra dự báo chính xác hơn. Tích hợp NLS 3.1.CB2a: Tổng hợp hình ảnh, số liệu sau khảo sát vào bảng tin số của lớp. Tích hợp BVMT & Tiết kiệm nước: Cam kết dùng nước vừa đủ, không xả rác xuống cống rãnh.',
      },
    ],
  }),

  buildGrade5Topic({
    id: 'g5-hdtn-cd9',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 12,
    chapterCode: 'HDTN5-CD9',
    chapterTitle: 'Chủ đề 9: Ước mơ nghề nghiệp & Hồ sơ trải nghiệm (12 tiết)',
    topicTitle:
      'Tuần 32: Nghề em mơ ước (3 tiết); Tuần 33: An toàn nghề nghiệp (3 tiết); Tuần 34: Mơ ước nghề nghiệp của em (3 tiết); Tuần 35: Hồ sơ trải nghiệm (3 tiết)',
    adjustedContentSummary:
      'Tích hợp AI (5.A3.1, 5.A1.1, 5.A2.1), NLS (1.2.CB2a, 1.3.CB2a, 3.1.CB2a), QCN, QPAN (an toàn lao động) và ĐĐLS.',
    rawLessons: [
      {
        week: '32',
        lessonName: 'Tuần 32: Nghề em mơ ước',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A3.1): Thảo luận trong tương lai AI sẽ hỗ trợ nghề nghiệp mơ ước như thế nào. Tích hợp NLS 1.2.CB2a: Tìm kiếm thông tin cơ bản về nghề mơ ước từ nguồn tin cậy. Tích hợp QCN & ĐĐLS: Tôn trọng ước mơ nghề nghiệp, chăm chỉ học tập.',
      },
      {
        week: '33',
        lessonName: 'Tuần 33: An toàn nghề nghiệp',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A1.1): Tìm hiểu cảm biến AI trong nhà máy giúp cảnh báo nguy hiểm, bảo vệ người lao động. Tích hợp NLS 1.3.CB2a: Sưu tầm hình ảnh thiết bị bảo hộ lao động và sắp xếp bảng “nguy cơ - cách phòng tránh”. Tích hợp QPAN & QCN: Chấp hành quy định an toàn lao động.',
      },
      {
        week: '34',
        lessonName: 'Tuần 34: Mơ ước nghề nghiệp của em',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.1): Khẳng định giá trị sáng tạo, đạo đức của bản thân mà máy móc không thay thế được. Tích hợp NLS 3.1.CB2a: Thiết kế danh thiếp tương lai bằng Canva/PowerPoint. Tích hợp QCN & ĐĐLS.',
      },
      {
        week: '35',
        lessonName: 'Tuần 35: Hồ sơ trải nghiệm',
        subLessonName: 'HĐ SHDC (1 tiết) – HĐ GDTCĐ (1 tiết) – HĐ SHL (1 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Tích hợp AI (5.A2.1): Nhận biết AI có thể hỗ trợ sắp xếp hồ sơ trải nghiệm, nhưng cảm xúc, quá trình rèn luyện và sự trưởng thành thật là dữ liệu cá nhân của chính mỗi em. Tích hợp ĐĐLS: Tự đánh giá quá trình trải nghiệm lớp 5 trung thực, biết cảm ơn thầy cô, gia đình, bạn bè.',
      },
    ],
  }),
];
