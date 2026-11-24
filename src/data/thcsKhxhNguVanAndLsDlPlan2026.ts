import { CurriculumTopic } from '../types/domain';
import { buildThcsTopic } from './thcsToanAndTinPlan2026';

export const NDA_THCS_KHXH_SOURCE_DOC =
  'Phụ lục I – Kế hoạch dạy học của Tổ Khoa học Xã hội (Ngữ văn – Lịch sử & Địa lí 6-9 – GDCD – HĐTN, HN – Nghệ thuật Khối 1-9) năm học 2026 – 2027 (Trường TH&THCS Nguyễn Đình Anh)';

export const THCS_KHXH_DEPT_METADATA = {
  schoolName: 'TRƯỜNG TH & THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ KHOA HỌC XÃ HỘI',
  locationAndDate: 'Năm học 2026 – 2027',
  planTitle:
    'KẾ HOẠCH DẠY HỌC CỦA TỔ CHUYÊN MÔN: NGỮ VĂN - LỊCH SỬ & ĐỊA LÍ 6-9 - GDCD - HĐTN, HN - GDĐP, NGHỆ THUẬT KHỐI LỚP 1-9',
  academicYear: '2026 – 2027',
  headOfDepartment: 'Tổ trưởng Tổ KHXH',
  principal: 'Phan Đức Quý',
  studentAndClassSummary:
    'Số lớp: 33 lớp | Số học sinh: 1.014 HS (Nữ: 499 HS) | Số học sinh học chuyên đề lựa chọn: Không',
  teacherForceSummary:
    'Số giáo viên: 15 GV / 07 nữ (Ngữ văn: 03; Lịch sử và Địa lí: 02; GDCD: 02; Âm nhạc: 05; Mĩ thuật: 03) | Trình độ đào tạo: Đại học 15/15 (Cao đẳng: 0, Trên đại học: Không) | Chuẩn nghề nghiệp: Khá 15/15 GV',
  facilitiesSummary: [
    'Sân chơi, bãi tập (01): Tổ chức các hoạt động trải nghiệm theo chủ đề và giáo dục kĩ năng thực hành.',
    'Thiết bị dạy học Lịch sử & Địa lí 6, 7, 8, 9: Ti vi, máy chiếu, tranh ảnh, hộp phục chế lịch sử cổ đại, quả địa cầu, la bàn, nhiệt kế, lược đồ, tập bản đồ tự nhiên - kinh tế các châu lục và Việt Nam, phần mềm mô phỏng chuyển động Trái Đất.',
    'Thiết bị dạy học GDCD & HĐTN, HN 6, 7, 8, 9: Bộ tranh quyền con người, phòng chống bạo lực học đường, phòng ngừa tai nạn vũ khí/cháy nổ, bộ thẻ nghề truyền thống, video biến đổi khí hậu.',
    'Thiết bị dạy học Nghệ thuật (Âm nhạc & Mĩ thuật 6, 7, 8, 9): Đàn Organ, kèn phím Melodion, trống lục lạc (Tambourine), thanh phách, kẻng tam giác (Triangle), mẫu khối trụ/khối cầu, vật mẫu tĩnh vật.',
  ],
  subjectAllocationByGrade: {
    6: [
      {
        subject: 'Ngữ văn',
        totalPeriods: 140,
        detail:
          'Cả năm: 140 tiết (HKI: 18 tuần = 72 tiết; HKII: 17 tuần = 68 tiết) | 10 bài học (Bài 1–10) | Tích hợp GD QP-AN, NLS (2.1.TC2a, 4.2.TC2a, 1.1.TC1b, 2.1.TC1b) & Năng lực AI (A3, C3, A2, C1, D1)',
      },
      {
        subject: 'Lịch sử và Địa lí',
        totalPeriods: 105,
        detail:
          'Cả năm: 105 tiết (Phân môn Lịch sử: 53 tiết [Bài 1–20]; Phân môn Địa lí: 52 tiết [Bài Mở đầu & Bài 1–30]) | Tích hợp NLS, AI, GDQP-AN & Biến đổi khí hậu (BĐKH)',
      },
      {
        subject: 'Giáo dục công dân',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tuần = 18 tiết; HKII: 17 tuần = 17 tiết) | Bài 1–12 | Tích hợp Quyền con người, GDQP&AN, Tư tưởng Hồ Chí Minh, NLS (1.1, 1.2, 2.1, 2.5, 3.1, 5.3) & AI (NLb, NLd)',
      },
      {
        subject: 'Hoạt động trải nghiệm, hướng nghiệp',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 54 tiết; HKII: 51 tiết) | 9 chủ đề (SHDC, HĐGD, SHL) | Tích hợp NLS (1.1, 3.1), GDQP-AN & AI (6.D2.1, 6.A1.2, 6.A3.2, 6.C1.2, 6.D2.MR2)',
      },
      {
        subject: 'Giáo dục địa phương',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Mạch Lịch sử – Văn hóa, Kinh tế – Chính trị – Xã hội, Văn học, Nghệ thuật, Địa lý môi trường TP Huế | Tích hợp NLS (1.1.TC1a)',
      },
      {
        subject: 'Nghệ thuật (Âm nhạc)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT chẵn 2..70) | 8 chủ đề | Tích hợp NLS (1.1TC1b, 2.1TC1b, 3.1TC1b, 2.2TC1a), AI (6.A3.1, 6.A1.1) & GDQP-AN',
      },
      {
        subject: 'Nghệ thuật (Mĩ thuật)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT lẻ 1..69) | 8 chủ đề (Bài 1–16) | Tích hợp NLS (1.1.TC1a, 2.1.TC1a, 3.1.TC1a, 5.3.TC1b, 1.1.TC1b), AI (8.A2.1, 8.D2.1) & ANQP',
      },
    ],
    7: [
      {
        subject: 'Ngữ văn',
        totalPeriods: 140,
        detail:
          'Cả năm: 140 tiết (HKI: 18 tuần = 72 tiết; HKII: 17 tuần = 68 tiết) | 10 bài học (Bài 1–10) | Tích hợp GD QP-AN, NLS (TC2.1.1, TC2.2.1, TC2.3.3, 1.1.TC1c, 2.1.TC1a, 2.5.TC1c, 1.3.TC1a) & Năng lực AI (A2.1, A3.2, A1.1)',
      },
      {
        subject: 'Lịch sử và Địa lí',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (Lịch sử: 53 tiết [HKI 27, HKII 26 – Bài 1–18 & CĐ chung 2]; Địa lí: 52 tiết [HKI 27, HKII 25 – Bài 1–19 & CĐ chung]) | Tích hợp NLS, AI, GDQP-AN & BĐKH',
      },
      {
        subject: 'Giáo dục công dân',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Bài 1–10 | Tích hợp Quyền con người, GDQP&AN, Đạo đức lối sống, NLS (1.1, 1.2, 1.3, 2.2, 2.3, 5.3) & AI (NLb, NLc, NLd)',
      },
      {
        subject: 'Hoạt động trải nghiệm, hướng nghiệp',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 54 tiết; HKII: 51 tiết) | 9 chủ đề (Tiết 1–105) | Tích hợp NLS (1.1, 3.1), GDQP-AN & AI (7.A1.1, 7.A1.2, 7.D2.1, 7.D2.MR1)',
      },
      {
        subject: 'Giáo dục địa phương',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Thiên nhiên TP Huế, Chính sách an sinh xã hội, Văn học trung đại, TP Huế TK X–XVI, Mĩ thuật truyền thống Huế | Tích hợp NLS (1.1.TC1a)',
      },
      {
        subject: 'Nghệ thuật (Âm nhạc)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT chẵn 2..70) | 8 chủ đề | Tích hợp NLS (1.1TC1b, 3.1TC1b, 2.2TC1a), AI (7.A1.1, 7.A2.1) & GDQP-AN',
      },
      {
        subject: 'Nghệ thuật (Mĩ thuật)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT lẻ 1..69) | 8 chủ đề (Bài 1–16) | Tích hợp NLS (1.1.TC1a, 2.1.TC1a, 5.3.TC1b, 1.1.TC1b, 3.1.TC1a), AI (8.A2.1, 8.D2.1) & ANQP',
      },
    ],
    8: [
      {
        subject: 'Ngữ văn',
        totalPeriods: 140,
        detail:
          'Cả năm: 140 tiết (HKI: 18 tuần = 72 tiết; HKII: 17 tuần = 68 tiết) | 10 bài học (Bài 1–10) | Tích hợp NLS (1.1.TC2a, 1.3.TC2a, 2.2.TC2a) & Năng lực AI (A3.3, B1.1, C1.1, A1.2)',
      },
      {
        subject: 'Lịch sử và Địa lí',
        totalPeriods: 105,
        detail:
          'Cả năm: 105 tiết (Phân môn Lịch sử: 53 tiết [Bài 1–19 & CĐ chung 1]; Phân môn Địa lí: 52 tiết [Bài 1–12 & CĐ chung 2]) | Tích hợp NLS, AI (6.1b, 6.2c, D1, D2, C2, C5), GDQP-AN & BĐKH',
      },
      {
        subject: 'Giáo dục công dân',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Bài 1–10 | Tích hợp Quyền con người, GDQP&AN, Tư tưởng Hồ Chí Minh, NLS (1.1, 1.2, 2.2, 2.3) & AI (NLb, NLc, NLd)',
      },
      {
        subject: 'Hoạt động trải nghiệm, hướng nghiệp',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 54 tiết; HKII: 51 tiết) | 9 chủ đề (Tiết 1–105) | Tích hợp NLS (2.3, 3.4), GDQP-AN & AI (8.C5.1, 8.C5.MR1, 8.A3.3, 8.D1.1, 8.D2.1, 8.A1.1, 8.A5.2)',
      },
      {
        subject: 'Giáo dục địa phương',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Hệ thống chính trị TP Huế, Âm nhạc hiện đại, Văn học 1900–1945, Dân số - Lao động - Đô thị hóa, Thuận Hóa - Phú Xuân & Phong trào chống Pháp | Tích hợp NLS (1.1.TC2a) & GDQP-AN',
      },
      {
        subject: 'Nghệ thuật (Âm nhạc)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT chẵn 2..70) | 8 chủ đề | Tích hợp NLS (1.1TC2b, 2.1TC2b), AI (8.A1.1) & GDQP-AN',
      },
      {
        subject: 'Nghệ thuật (Mĩ thuật)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT lẻ 1..69) | 8 chủ đề (Bài 1–16) | Tích hợp NLS (3.1.TC2a, 2.1.TC2a, 1.1.TC2b, 1.1.TC2a), AI (8.A2.1, 8.D2.1) & ANQP',
      },
    ],
    9: [
      {
        subject: 'Ngữ văn',
        totalPeriods: 140,
        detail:
          'Cả năm: 140 tiết (HKI: 18 tuần = 72 tiết; HKII: 17 tuần = 68 tiết) | 10 bài học (Bài 1–10) | Tích hợp GD QP-AN, NLS (2.5.TC2a, 1.1.TC2a, 2.2.TC2a, 1.3.TC2a) & Năng lực AI (A2.2, A3.1, A3.2)',
      },
      {
        subject: 'Lịch sử và Địa lí',
        totalPeriods: 105,
        detail:
          'Cả năm: 105 tiết (Phân môn Lịch sử: 53 tiết [Bài 1–21, CĐ chung Đô thị & CĐ chung 3 Biển Đông]; Phân môn Địa lí: 52 tiết [Bài 1–21 & CĐ 2 Văn minh châu thổ]) | Tích hợp NLS, AI, GDQP-AN & BĐKH',
      },
      {
        subject: 'Giáo dục công dân',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Bài 1–10 | Tích hợp Quyền con người, GDQP&AN, Tư tưởng Hồ Chí Minh, NLS (1.1, 1.2, 1.3, 2.2, 2.3) & AI (NLb, NLc)',
      },
      {
        subject: 'Hoạt động trải nghiệm, hướng nghiệp',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 54 tiết; HKII: 51 tiết) | 9 chủ đề (Tiết 1–105) | Tích hợp NLS, GDQP-AN & AI (9.A3.2 Canva AI, Google Sheets 50/30/20, Bing Image Creator, 9.C2.1 ChatGPT hướng nghiệp)',
      },
      {
        subject: 'Giáo dục địa phương',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Mĩ thuật hiện đại ở Huế, Bảo vệ môi trường & Phòng tránh thiên tai, Lịch sử Huế 1930–nay, Kinh tế Huế & Văn học Huế từ 1945 đến nay | Tích hợp NLS (1.1.TC2b)',
      },
      {
        subject: 'Nghệ thuật (Âm nhạc)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT chẵn 2..70) | 8 chủ đề | Tích hợp NLS (1.1TC2b, 3.1TC2b, 2.1TC2b), AI (9.A1.1) & GDQP-AN',
      },
      {
        subject: 'Nghệ thuật (Mĩ thuật)',
        totalPeriods: 35,
        detail:
          'Cả năm: 35 tuần = 35 tiết (HKI: 18 tiết; HKII: 17 tiết – Tiết PPCT lẻ 1..69) | 8 chủ đề (Bài 1–16) | Tích hợp NLS (1.1.TC1a, 2.1.TC1a, 3.1.TC1a, 3.1.TC1b, 1.1.TC1b), AI (8.A2.1, 8.D2.1) & ANQP',
      },
    ],
  },
};

// ============================================================================
// 1.1. MÔN NGỮ VĂN – KHỐI 6, 7, 8, 9 (CẢ NĂM: 140 TIẾT = HKI 72 + HKII 68 TIẾT)
// ============================================================================

export const GRADE6_NGU_VAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-nv-hk1',
    grade: 6,
    subject: 'Ngữ văn',
    chapterCode: 'NV6-HK1',
    chapterTitle: 'Ngữ văn 6 – Học kì I: Bài 1 đến Bài 5 (Truyện đồng thoại, Thơ, Truyện kể, Thơ lục bát, Du kí)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (72 tiết)',
    totalPeriods: 72,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Truyện đồng thoại (Tôi và các bạn), Thơ (Gõ cửa trái tim), Truyện kể ngôi thứ ba (Yêu thương và chia sẻ), Thơ lục bát (Quê hương yêu dấu), Du kí (Những nẻo đường xứ sở), Ôn tập và kiểm tra giữa kì 1, cuối kì 1. Định hướng NLS - AI & Lồng ghép: AI A3, C3, A2; NLS 2.1.TC2a, 4.2.TC2a, 1.1.TC1b; GD QP-AN.',
    rawLessons: [
      {
        id: 'nv6-b1',
        week: 'HKI (Tiết 1 – 13)',
        lessonName: 'Bài 1. Tôi và các bạn',
        periodAllocation: 'Tiết 1 – 13',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết được một số yếu tố của truyện đồng thoại (cốt truyện, nhân vật, lời người kể chuyện, lời nhân vật); nhận biết và phân tích đặc điểm nhân vật thể hiện qua hình dáng, cử chỉ, hành động, ngôn ngữ, ý nghĩ; nhận biết từ đơn và từ phức (từ ghép và từ láy), hiểu tác dụng của từ láy trong văn bản; viết và kể được bài văn về một trải nghiệm đáng nhớ của bản thân. Định hướng phát triển NLS - AI: Năng lực AI: A3, C3.',
      },
      {
        id: 'nv6-b2',
        week: 'HKI (Tiết 14 – 25)',
        lessonName: 'Bài 2. Gõ cửa trái tim',
        periodAllocation: 'Tiết 14 – 25',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết một số đặc điểm của thơ (thể thơ, ngôn ngữ, nội dung); phân tích đặc điểm của thơ, nhân vật trữ tình, tình cảm cảm xúc thông điệp trong bài thơ; nhận biết phép tu từ so sánh, nhân hóa, điệp ngữ, ẩn dụ, các dấu câu; viết đoạn văn bày tỏ cảm xúc về một đoạn thơ, bài thơ có sử dụng yếu tố miêu tả và tự sự. Định hướng phát triển NLS - AI: Tích hợp NLS: 2.1.TC2a, 4.2.TC2a.',
      },
      {
        id: 'nv6-b3',
        week: 'HKI (Tiết 26 – 37)',
        lessonName: 'Bài 3. Yêu thương và chia sẻ',
        periodAllocation: 'Tiết 26 – 37',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết người kể chuyện ngôi thứ 3; nêu bài học về cách nghĩ và ứng xử của cá nhân do văn bản gợi ra; nhận biết cụm danh từ, cụm động từ, cụm tính từ và hiểu tác dụng dùng các cụm từ này để mở rộng thành phần chính của câu; viết và nói về một trải nghiệm đáng nhớ của bản thân. Định hướng phát triển NLS - AI: Năng lực AI: A2.',
      },
      {
        id: 'nv6-ot-gk1',
        week: 'HKI (Tiết 38 – 42)',
        lessonName: 'Ôn tập và kiểm tra giữa kì 1',
        periodAllocation: 'Tiết 38 – 42',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Tự học, giải quyết vấn đề, sáng tạo, sử dụng ngôn ngữ, giao tiếp; ôn tập các kiến thức đã học về truyện đồng thoại, thơ, chỉ ra từ đơn, từ phức (từ ghép, từ láy), cụm danh từ, cụm động từ, cụm tính từ; viết bài văn tự sự có bố cục rõ ràng, diễn đạt trôi chảy.',
      },
      {
        id: 'nv6-b4',
        week: 'HKI (Tiết 43 – 54)',
        lessonName: 'Bài 4. Quê hương yêu dấu',
        periodAllocation: 'Tiết 43 – 54',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Nhận biết số tiếng, số dòng, vần, nhịp của thơ lục bát; bước đầu nhận xét nét độc đáo của một bài thơ thể hiện qua từ ngữ, hình ảnh, biện pháp tu từ; nhận biết từ đồng âm, từ đa nghĩa, hoán dụ; bước đầu biết làm bài thơ lục bát và viết đoạn văn ghi lại cảm xúc sau khi đọc bài thơ lục bát; trình bày ý kiến về một vấn đề trong đời sống. Lồng ghép GD QP-AN & NLS: Giới thiệu truyền thống của Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam; Tích hợp NLS: 1.1.TC1b.',
      },
      {
        id: 'nv6-b5',
        week: 'HKI (Tiết 55 – 67)',
        lessonName: 'Bài 5. Những nẻo đường xứ sở',
        periodAllocation: 'Tiết 55 – 67',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết hình thức ghi chép, cách kể sự việc, người kể chuyện ngôi thứ nhất của du kí; hiểu công dụng của dấu ngoặc kép; viết bài văn tả cảnh sinh hoạt; chia sẻ một trải nghiệm về nơi em sống hoặc từng đến. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1b.',
      },
      {
        id: 'nv6-ot-ck1',
        week: 'HKI (Tiết 68 – 72)',
        lessonName: 'Ôn tập và kiểm tra cuối kì 1',
        periodAllocation: 'Tiết 68 – 72',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Ôn tập, củng cố kiến thức đã học; đánh giá kĩ năng đọc hiểu, kĩ năng viết đoạn văn, bài văn về các thể loại chủ đề đã học; nắm các kiến thức về từ đơn, từ phức, cụm danh từ, cụm động từ; vận dụng kiến thức để viết bài văn, đoạn văn cơ bản.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-nv-hk2',
    grade: 6,
    subject: 'Ngữ văn',
    chapterCode: 'NV6-HK2',
    chapterTitle: 'Ngữ văn 6 – Học kì II: Bài 6 đến Bài 10 (Truyền thuyết, Cổ tích, Văn bản nghị luận, Văn bản thông tin, Sách)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (68 tiết)',
    totalPeriods: 68,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Truyền thuyết (Chuyện kể về những người anh hùng), Truyện cổ tích (Thế giới cổ tích), Văn bản nghị luận (Khác biệt và gần gũi), Văn bản thông tin (Trái Đất – ngôi nhà chung), Nghị luận văn học (Cuốn sách tôi yêu), Ôn tập và kiểm tra giữa kì 2, cuối kì 2. Định hướng NLS - AI & Lồng ghép: NLS 2.1.TC1b; AI C1, D1; GD QP-AN.',
    rawLessons: [
      {
        id: 'nv6-b6',
        week: 'HKII (Tiết 73 – 85)',
        lessonName: 'Bài 6. Chuyện kể về những người anh hùng',
        periodAllocation: 'Tiết 73 – 85',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết một số yếu tố của truyền thuyết (cốt truyện, nhân vật, lời kể, yếu tố kì ảo); nhận biết VB thông tin thuật lại một sự kiện triển khai theo trật tự thời gian; hiểu công dụng của dấu chấm phẩy; bước đầu viết VB thông tin thuật lại một sự kiện; kể được một truyền thuyết. Lồng ghép GD QP-AN: Giới thiệu lịch sử và truyền thống Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam; cách đánh mưu trí, sáng tạo của quân và dân ta trong các cuộc kháng chiến chống giặc ngoại xâm (cách sử dụng sáng tạo vũ khí tự tạo: gậy tre, chông tre,...).',
      },
      {
        id: 'nv6-b7',
        week: 'HKII (Tiết 86 – 98)',
        lessonName: 'Bài 7. Thế giới cổ tích',
        periodAllocation: 'Tiết 86 – 98',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết một số yếu tố của truyện cổ tích (cốt truyện, nhân vật, lời người kể chuyện và yếu tố kì ảo); tóm tắt văn bản ngắn gọn; vận dụng kiến thức về nghĩa của từ ngữ và biện pháp tu từ để đọc, viết, nói, nghe; viết và kể lại sinh động một truyện cổ tích.',
      },
      {
        id: 'nv6-b8',
        week: 'HKII (Tiết 99 – 111)',
        lessonName: 'Bài 8. Khác biệt và gần gũi',
        periodAllocation: 'Tiết 99 – 111',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết các đặc điểm cơ bản về nội dung và hình thức của văn bản nghị luận; tóm tắt nội dung văn bản nghị luận có nhiều đoạn; nhận biết đặc điểm và chức năng của trạng ngữ; bước đầu viết và trình bày ý kiến về một hiện tượng (vấn đề) mà em quan tâm. Định hướng phát triển NLS: Tích hợp NLS 2.1.TC1b.',
      },
      {
        id: 'nv6-ot-gk2',
        week: 'HKII (Tiết 112 – 115)',
        lessonName: 'Ôn tập và kiểm tra giữa kì 2',
        periodAllocation: 'Tiết 112 – 115',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết và trình bày đặc trưng của truyện truyền thuyết, cổ tích và văn bản nghị luận; sử dụng dấu chấm phẩy, nghĩa của từ, trạng ngữ; viết bài văn thuyết minh thuật lại một sự kiện, kể lại câu chuyện cổ tích, viết bài văn nghị luận trình bày ý kiến về một hiện tượng.',
      },
      {
        id: 'nv6-b9',
        week: 'HKII (Tiết 115 – 128)',
        lessonName: 'Bài 9. Trái Đất – ngôi nhà chung',
        periodAllocation: 'Tiết 115 – 128',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Hiểu về văn bản thông tin và cách truyền đạt thông tin về sự sống trên Trái Đất; nhận biết cách triển khai VB thông tin theo quan hệ nhân quả, vai trò của nhan đề, sa-pô, đề mục, chữ đậm, phương tiện giao tiếp phi ngôn ngữ (hình ảnh, số liệu); nhận biết từ mượn; viết biên bản ghi chép đúng quy cách và tóm tắt bằng sơ đồ nội dung chính của VB; thảo luận về vấn đề bảo vệ môi trường sống trên Trái Đất. Định hướng phát triển NLS - AI: Tích hợp NLS: 2.1.TC1b; Năng lực AI: C1, D1.',
      },
      {
        id: 'nv6-b10',
        week: 'HKII (Tiết 129 – 135)',
        lessonName: 'Bài 10. Cuốn sách tôi yêu',
        periodAllocation: 'Tiết 129 – 135',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Phát triển kỹ năng tự đọc sách trên cơ sở vận dụng những điều đã học; nhận ra đặc điểm của bài nghị luận văn học; viết bài văn và trình bày ý kiến về một hiện tượng đời sống gợi ra từ cuốn sách đã đọc.',
      },
      {
        id: 'nv6-ot-ck2',
        week: 'HKII (Tiết 136 – 140)',
        lessonName: 'Ôn tập và kiểm tra cuối kì 2',
        periodAllocation: 'Tiết 136 – 140',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Tổng hợp, hệ thống hóa kiến thức đọc hiểu, thực hành tiếng Việt và viết văn học kì II; thực hiện bài kiểm tra đánh giá cuối học kì II theo ma trận và bản đặc tả.',
      },
    ],
  }),
];

export const GRADE7_NGU_VAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-nv-hk1',
    grade: 7,
    subject: 'Ngữ văn',
    chapterCode: 'NV7-HK1',
    chapterTitle: 'Ngữ văn 7 – Học kì I: Bài 1 đến Bài 5 (Truyện ngắn, Thơ bốn chữ/năm chữ, Tùy bút & Tản văn)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (72 tiết)',
    totalPeriods: 72,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Bầu trời tuổi thơ, Khúc nhạc tâm hồn, Cội nguồn yêu thương, Giai điệu đất nước, Màu sắc trăm miền và Ôn tập, kiểm tra giữa kì I, cuối kì I. Định hướng NLS - AI & Lồng ghép: NLS TC2.1.1, TC2.2.1, TC2.3.3, 1.1.TC1c; AI A2.1, A3.2, A1.1; GD QP&AN.',
    rawLessons: [
      {
        id: 'nv7-b1',
        week: 'HKI (Tiết 1 – 13)',
        lessonName: 'Bài 1. Bầu trời tuổi thơ',
        periodAllocation: 'Tiết 1 – 13',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nêu ấn tượng chung về văn bản và những trải nghiệm giúp bản thân hiểu thêm văn bản; nhận biết các chi tiết tiêu biểu, đề tài, câu chuyện, nhân vật và tính cách nhân vật trong truyện; hiểu tác dụng của việc dùng cụm từ để mở rộng thành phần chính và mở rộng trạng ngữ trong câu; biết tóm tắt văn bản theo những yêu cầu khác nhau về độ dài; trình bày ý kiến về một vấn đề đời sống. Định hướng phát triển NLS - AI: Tích hợp NLS: TC2.1.1; Năng lực AI: A2.1.',
      },
      {
        id: 'nv7-b2',
        week: 'HKI (Tiết 14 – 25)',
        lessonName: 'Bài 2. Khúc nhạc tâm hồn',
        periodAllocation: 'Tiết 14 – 25',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và nhận xét nét độc đáo của bài thơ bốn chữ, năm chữ thể hiện qua từ ngữ, hình ảnh, vần, nhịp, biện pháp tu từ; nhận biết biện pháp tu từ nói giảm nói tránh; bước đầu biết làm một bài thơ bốn chữ hoặc năm chữ, viết đoạn văn ghi lại cảm xúc sau khi đọc một bài thơ bốn chữ, năm chữ; trình bày ý kiến về một vấn đề đời sống. Định hướng phát triển NLS - AI: Tích hợp NLS: TC2.1.1; Năng lực AI: A3.2.',
      },
      {
        id: 'nv7-b3',
        week: 'HKI (Tiết 26 – 38)',
        lessonName: 'Bài 3. Cội nguồn yêu thương',
        periodAllocation: 'Tiết 26 – 38',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết tính cách nhân vật; nhận biết và nêu tác dụng của việc thay đổi kiểu người kể chuyện trong một truyện kể; nhận biết đặc điểm của số từ, phó từ và hiểu chức năng của từ loại này; bước đầu biết viết bài văn phân tích đặc điểm nhân vật trong một tác phẩm văn học. Lồng ghép GD QP&AN & NLS: Trách nhiệm của thanh niên, học sinh tham gia xây dựng và bảo vệ Tổ quốc; Tích hợp NLS: TC2.2.1, TC2.3.3.',
      },
      {
        id: 'nv7-ot-gk1',
        week: 'HKI (Tiết 39 – 42)',
        lessonName: 'Ôn tập và kiểm tra giữa kì I',
        periodAllocation: 'Tiết 39 – 42',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Ôn tập tổng hợp, kiểm tra đánh giá kĩ năng Đọc - hiểu, Viết (truyện kể theo ngôi 1 và ngôi 3, thơ bốn chữ, năm chữ, mở rộng trạng ngữ và thành phần chính của câu bằng cụm từ, số từ, phó từ; viết đoạn văn ghi lại cảm xúc hoặc bài văn phân tích đặc điểm nhân vật).',
      },
      {
        id: 'nv7-b4',
        week: 'HKI (Tiết 43 – 55)',
        lessonName: 'Bài 4. Giai điệu đất nước',
        periodAllocation: 'Tiết 43 – 55',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết và nhận xét nét độc đáo của bài thơ thể hiện qua từ ngữ, hình ảnh, vần, nhịp, biện pháp tu từ; nhận biết tình cảm, cảm xúc của người viết; hiểu khái niệm ngữ cảnh, nghĩa của từ ngữ trong ngữ cảnh; viết bài văn biểu cảm về con người và sự việc; trình bày ý kiến về một vấn đề trong đời sống. Định hướng phát triển NLS: Tích hợp NLS: 1.1.TC1c.',
      },
      {
        id: 'nv7-b5',
        week: 'HKI (Tiết 56 – 67)',
        lessonName: 'Bài 5. Màu sắc trăm miền',
        periodAllocation: 'Tiết 56 – 67',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết chất trữ tình, cái tôi tác giả, ngôn ngữ của tùy bút, tản văn và hiểu được chủ đề, thông điệp của văn bản; nhận biết sự phong phú, đa dạng của ngôn ngữ các vùng miền; viết được văn bản tường trình rõ ràng, đầy đủ, đúng quy cách. Định hướng phát triển NLS - AI: Tích hợp NLS: 1.1.TC1c; Năng lực AI: A1.1.',
      },
      {
        id: 'nv7-ot-ck1',
        week: 'HKI (Tiết 68 – 72)',
        lessonName: 'Ôn tập, kiểm tra HK I',
        periodAllocation: 'Tiết 68 – 72',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Ôn tập, củng cố kiến thức đã học; đánh giá kĩ năng đọc hiểu, kĩ năng viết đoạn văn, bài văn về các thể loại chủ đề đã học (thơ bốn chữ, năm chữ, bút kí, tản văn, văn bản tường trình); viết bài văn biểu cảm về con người hoặc sự vật.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-nv-hk2',
    grade: 7,
    subject: 'Ngữ văn',
    chapterCode: 'NV7-HK2',
    chapterTitle: 'Ngữ văn 7 – Học kì II: Bài 6 đến Bài 10 (Truyện ngụ ngôn, Tục ngữ, Khoa học viễn tưởng, Nghị luận, Văn bản thông tin)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (68 tiết)',
    totalPeriods: 68,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Bài học cuộc sống, Thế giới viễn tưởng, Trải nghiệm để trưởng thành, Hòa điệu với tự nhiên, Trang sách và cuộc sống và Ôn tập, kiểm tra giữa kì II, cuối kì II. Định hướng NLS - AI & Lồng ghép: AI A1.1, A3.2; NLS 2.1.TC1a, 2.5.TC1c, 1.3.TC1a; GD QP&AN.',
    rawLessons: [
      {
        id: 'nv7-b6',
        week: 'HKII (Tiết 73 – 84)',
        lessonName: 'Bài 6. Bài học cuộc sống',
        periodAllocation: 'Tiết 73 – 84',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết một số yếu tố của truyện ngụ ngôn (đề tài, tình huống, cốt truyện, nhân vật, chủ đề) và tục ngữ (số lượng câu, chữ, vần); hiểu đặc điểm và chức năng của thành ngữ, đặc điểm và tác dụng của biện pháp tu từ nói quá; bước đầu viết bài văn nghị luận về một vấn đề trong đời sống; kể lại được một truyện ngụ ngôn. Định hướng phát triển NLS - AI: Năng lực AI: A1.1.',
      },
      {
        id: 'nv7-b7',
        week: 'HKII (Tiết 85 – 96)',
        lessonName: 'Bài 7. Thế giới viễn tưởng',
        periodAllocation: 'Tiết 85 – 96',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết một số yếu tố của truyện khoa học viễn tưởng (đề tài, sự kiện, tình huống, cốt truyện, nhân vật, không gian, thời gian); hiểu đặc điểm và chức năng của liên kết và mạch lạc, công dụng của dấu chấm lửng; viết bài văn kể lại sự việc có thật liên quan đến nhân vật hoặc sự kiện lịch sử; thảo luận về một vấn đề gây tranh cãi. Lồng ghép GD QP&AN: Một số nội dung về bảo vệ thông tin cá nhân khi tham gia mạng xã hội.',
      },
      {
        id: 'nv7-b8',
        week: 'HKII (Tiết 97 – 109)',
        lessonName: 'Bài 8. Trải nghiệm để trưởng thành',
        periodAllocation: 'Tiết 97 – 109',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết đặc điểm của văn bản nghị luận về một vấn đề đời sống thể hiện qua ý kiến, lí lẽ, bằng chứng và mối liên hệ giữa các ý kiến, lí lẽ, bằng chứng; hiểu các biện pháp và từ ngữ liên kết thường dùng trong văn bản, đặc điểm và chức năng của thuật ngữ; viết bài văn nghị luận và trình bày ý kiến về một vấn đề trong đời sống. Định hướng phát triển NLS - AI: Tích hợp NLS: 2.1.TC1a; Năng lực AI: A3.2.',
      },
      {
        id: 'nv7-ot-gk2',
        week: 'HKII (Tiết 110 – 113)',
        lessonName: 'Ôn tập, kiểm tra giữa kì II',
        periodAllocation: 'Tiết 110 – 113',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết và trình bày đặc trưng của truyện ngụ ngôn, tục ngữ, khoa học viễn tưởng và văn bản nghị luận về một vấn đề đời sống; sử dụng thành ngữ, nói quá, dấu chấm lửng, liên kết và mạch lạc; viết bài văn kể lại sự việc có thật liên quan đến nhân vật/sự kiện lịch sử hoặc bài văn nghị luận xã hội.',
      },
      {
        id: 'nv7-b9',
        week: 'HKII (Tiết 114 – 127)',
        lessonName: 'Bài 9. Hòa điệu với tự nhiên',
        periodAllocation: 'Tiết 114 – 127',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Nhận biết thông tin cơ bản của văn bản thông tin, vai trò của các chi tiết, tác dụng của phương tiện phi ngôn ngữ; nhận biết đặc điểm văn bản giới thiệu một quy tắc hoặc luật lệ trong trò chơi hay hoạt động; hiểu chức năng của cước chú và tài liệu tham khảo, nghĩa của một số yếu tố Hán Việt thông dụng; viết bài văn thuyết minh và giải thích quy tắc hoặc luật lệ trong trò chơi hay hoạt động. Định hướng phát triển NLS - AI: Tích hợp NLS: 2.5.TC1c; Năng lực AI: A3.2.',
      },
      {
        id: 'nv7-b10',
        week: 'HKII (Tiết 128 – 135)',
        lessonName: 'Bài 10. Trang sách và cuộc sống',
        periodAllocation: 'Tiết 128 – 135',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Phát triển kĩ năng tự đọc sách; nhận biết đặc điểm của văn bản nghị luận phân tích một tác phẩm văn học; viết bài văn phân tích một nhân vật yêu thích; trình bày, trao đổi về sách, nhân vật yêu thích. Định hướng phát triển NLS: Tích hợp NLS: 1.3.TC1a.',
      },
      {
        id: 'nv7-ot-ck2',
        week: 'HKII (Tiết 136 – 140)',
        lessonName: 'Ôn tập và kiểm tra cuối kì II',
        periodAllocation: 'Tiết 136 – 140',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hiểu và trình bày kiến thức về văn bản thông tin và văn bản nghị luận văn học; thực hành sử dụng thuật ngữ, cước chú, các yếu tố Hán Việt; viết bài văn thuyết minh về một quy tắc/luật lệ hoặc bài văn phân tích một nhân vật văn học.',
      },
    ],
  }),
];

export const GRADE8_NGU_VAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-nv-hk1',
    grade: 8,
    subject: 'Ngữ văn',
    chapterCode: 'NV8-HK1',
    chapterTitle: 'Ngữ văn 8 – Học kì I: Bài 1 đến Bài 5 (Truyện lịch sử, Thơ Đường luật, Nghị luận, Thơ trào phúng, Hài kịch & Truyện cười)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (72 tiết)',
    totalPeriods: 72,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Câu chuyện của lịch sử, Vẻ đẹp cổ điển, Lời sông núi, Tiếng cười trào phúng trong thơ, Những câu chuyện hài và Ôn tập, kiểm tra giữa kì I, cuối kì I. Định hướng NLS - AI: NLS 1.1.TC2a, 1.3.TC2a, 2.2.TC2a; AI A3.3, B1.1, C1.1.',
    rawLessons: [
      {
        id: 'nv8-b1',
        week: 'HKI (Tiết 1 – 13)',
        lessonName: 'Bài 1. Câu chuyện của lịch sử',
        periodAllocation: 'Tiết 1 – 13',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết một số yếu tố của truyện lịch sử (cốt truyện, bối cảnh, nhân vật, ngôn ngữ); phân tích chủ đề, tư tưởng, thông điệp của văn bản; nhận biết biệt ngữ xã hội, từ ngữ địa phương; viết bài văn kể lại một chuyến đi hay hoạt động xã hội; trình bày bài giới thiệu ngắn về một cuốn sách. Định hướng phát triển NLS: Tích hợp NLS (1.1.TC2a; 1.3.TC2a).',
      },
      {
        id: 'nv8-b2',
        week: 'HKI (Tiết 14 – 25)',
        lessonName: 'Bài 2. Vẻ đẹp cổ điển',
        periodAllocation: 'Tiết 14 – 25',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết một số yếu tố thi luật của thơ thất ngôn bát cú và thơ tứ tuyệt Đường luật (bố cục, niêm, luật, vần, nhịp, đối); hiểu đặc điểm và tác dụng của biện pháp tu từ đảo ngữ, từ tượng hình, từ tượng thanh; viết bài văn phân tích một tác phẩm văn học (thơ Đường luật); trình bày ý kiến về một vấn đề xã hội. Định hướng phát triển NLS - AI: Tích hợp NL AI: A3.3, B1.1, C1.1.',
      },
      {
        id: 'nv8-b3',
        week: 'HKI (Tiết 26 – 38)',
        lessonName: 'Bài 3. Lời sông núi',
        periodAllocation: 'Tiết 26 – 38',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết nội dung bao quát, luận đề, luận điểm, lí lẽ và bằng chứng tiêu biểu trong văn bản nghị luận; phân biệt lí lẽ, bằng chứng khách quan với ý kiến, đánh giá chủ quan của người viết; nhận biết đặc điểm và chức năng của các kiểu đoạn văn diễn dịch, quy nạp, song song, phối hợp; viết văn bản nghị luận và thảo luận về một vấn đề của đời sống. Định hướng phát triển NLS: Tích hợp NLS (2.2.TC2a).',
      },
      {
        id: 'nv8-ot-gk1',
        week: 'HKI (Tiết 39 – 42)',
        lessonName: 'Ôn tập và kiểm tra giữa kì I',
        periodAllocation: 'Tiết 39 – 42',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Ôn tập tổng hợp, kiểm tra đánh giá kĩ năng Đọc – hiểu, Viết về truyện lịch sử, thơ Đường luật, văn bản nghị luận; từ ngữ địa phương, biệt ngữ xã hội, đảo ngữ, từ tượng hình, từ tượng thanh.',
      },
      {
        id: 'nv8-b4',
        week: 'HKI (Tiết 43 – 55)',
        lessonName: 'Bài 4. Tiếng cười trào phúng trong thơ',
        periodAllocation: 'Tiết 43 – 55',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết một số yếu tố thi luật của thơ thất ngôn bát cú và thơ tứ tuyệt Đường luật; nhận biết và phân tích tác dụng của một số thủ pháp nghệ thuật chính của thơ trào phúng; hiểu nghĩa của một số yếu tố Hán Việt thông dụng và sắc thái nghĩa của từ ngữ; viết bài văn phân tích một tác phẩm văn học. Định hướng phát triển NLS - AI: Tích hợp NL AI: C1.1, B1.1, A3.3.',
      },
      {
        id: 'nv8-b5',
        week: 'HKI (Tiết 56 – 67)',
        lessonName: 'Bài 5. Những câu chuyện hài',
        periodAllocation: 'Tiết 56 – 67',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích một số yếu tố của hài kịch (xung đột, hành động, nhân vật, lời thoại, thủ pháp trào phúng) và truyện cười (cốt truyện, bối cảnh, nhân vật, ngôn ngữ); nhận biết câu hỏi tu từ, nghĩa tường minh và nghĩa hàm ẩn của câu; viết bài văn nghị luận về một vấn đề đời sống. Định hướng phát triển NLS: Tích hợp NLS: 1.1.TC2a, 2.2.TC2a.',
      },
      {
        id: 'nv8-ot-ck1',
        week: 'HKI (Tiết 68 – 72)',
        lessonName: 'Ôn tập và kiểm tra cuối kì I',
        periodAllocation: 'Tiết 68 – 72',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Ôn tập, củng cố kiến thức đã học; đánh giá kĩ năng đọc hiểu, kĩ năng viết đoạn văn, bài văn về thơ Đường luật, hài kịch, truyện cười; sắc thái nghĩa của từ ngữ, câu hỏi tu từ, nghĩa tường minh và nghĩa hàm ẩn.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-nv-hk2',
    grade: 8,
    subject: 'Ngữ văn',
    chapterCode: 'NV8-HK2',
    chapterTitle: 'Ngữ văn 8 – Học kì II: Bài 6 đến Bài 10 (Truyện cốt truyện đơn/đa tuyến, Thơ tự do, Nghị luận văn học, Văn bản thông tin)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (68 tiết)',
    totalPeriods: 68,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chân dung cuộc sống, Tin yêu và ước vọng, Nhà văn và trang viết, Hôm nay và ngày mai (Văn bản thông tin), Sách – Người bạn đồng hành và Ôn tập, kiểm tra giữa kì II, cuối kì II. Định hướng NLS - AI: AI A1.2, C1.1; NLS 1.1.TC2a, 2.2.TC2a.',
    rawLessons: [
      {
        id: 'nv8-b6',
        week: 'HKII (Tiết 73 – 84)',
        lessonName: 'Bài 6. Chân dung cuộc sống',
        periodAllocation: 'Tiết 73 – 84',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết các chi tiết tiêu biểu, đề tài, câu chuyện, nhân vật trong tính chỉnh thể của tác phẩm văn học; phân tích cốt truyện đơn tuyến và cốt truyện đa tuyến; nhận biết đặc điểm của trợ từ, thán từ; viết bài văn phân tích một tác phẩm văn học (nêu chủ đề, phân tích tác dụng của một vài nét đặc sắc nghệ thuật); giới thiệu ngắn về một cuốn sách. Định hướng phát triển NLS - AI: Tích hợp NL AI: A1.2, C1.1.',
      },
      {
        id: 'nv8-b7',
        week: 'HKII (Tiết 85 – 96)',
        lessonName: 'Bài 7. Tin yêu và ước vọng',
        periodAllocation: 'Tiết 85 – 96',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích nét độc đáo của bài thơ thể hiện qua từ ngữ, hình ảnh, bố cục, mạch cảm xúc, cảm hứng chủ đạo; bước đầu biết làm một bài thơ tự do; viết đoạn văn ghi lại cảm nghĩ về một bài thơ tự do; thảo luận ý kiến về một vấn đề trong đời sống. Định hướng phát triển NLS: Tích hợp NLS: 1.1.TC2a, 2.2.TC2a.',
      },
      {
        id: 'nv8-b8',
        week: 'HKII (Tiết 97 – 109)',
        lessonName: 'Bài 8. Nhà văn và trang viết',
        periodAllocation: 'Tiết 97 – 109',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết luận đề, luận điểm, lí lẽ và bằng chứng tiêu biểu trong văn bản nghị luận; nhận biết đặc điểm và chức năng của các thành phần biệt lập trong câu; viết bài văn phân tích một tác phẩm văn học; trình bày ý kiến về một vấn đề xã hội. Định hướng phát triển NLS: Tích hợp NLS: 1.1.TC2a, 2.2.TC2a.',
      },
      {
        id: 'nv8-ot-gk2',
        week: 'HKII (Tiết 110 – 113)',
        lessonName: 'Ôn tập, kiểm tra giữa kì II',
        periodAllocation: 'Tiết 110 – 113',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết và trình bày đặc trưng của cốt truyện đơn tuyến, đa tuyến, bài thơ tự do, nghị luận văn học; trợ từ, thán từ, các thành phần biệt lập trong câu; viết bài văn phân tích một tác phẩm văn học.',
      },
      {
        id: 'nv8-b9',
        week: 'HKII (Tiết 114 – 127)',
        lessonName: 'Bài 9. Hôm nay và ngày mai (Văn bản thông tin)',
        periodAllocation: 'Tiết 114 – 127',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích đặc điểm của văn bản giải thích một hiện tượng tự nhiên, văn bản giới thiệu một bộ phim; đánh giá hiệu quả biểu đạt của phương tiện phi ngôn ngữ; nhận biết các kiểu câu phân loại theo mục đích nói, phân biệt câu phủ định và câu khẳng định; viết văn bản thuyết minh giải thích một hiện tượng tự nhiên và văn bản kiến nghị về một vấn đề đời sống.',
      },
      {
        id: 'nv8-b10',
        week: 'HKII (Tiết 128 – 135)',
        lessonName: 'Bài 10. Sách – Người bạn đồng hành',
        periodAllocation: 'Tiết 128 – 135',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích đặc điểm của văn bản giới thiệu một cuốn sách; vai trò của tưởng tượng trong tiếp nhận văn bản văn học; viết và trình bày bài thuyết minh giới thiệu một cuốn sách. Định hướng phát triển NLS: Tích hợp NLS: 2.2.TC2a.',
      },
      {
        id: 'nv8-ot-ck2',
        week: 'HKII (Tiết 136 – 140)',
        lessonName: 'Ôn tập và kiểm tra cuối kì II',
        periodAllocation: 'Tiết 136 – 140',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hiểu và trình bày kiến thức về văn bản thông tin và văn bản nghị luận văn học; thực hành sử dụng câu phân loại theo mục đích nói, câu khẳng định, câu phủ định; viết văn bản thuyết minh giải thích một hiện tượng tự nhiên và văn bản kiến nghị.',
      },
    ],
  }),
];

export const GRADE9_NGU_VAN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-nv-hk1',
    grade: 9,
    subject: 'Ngữ văn',
    chapterCode: 'NV9-HK1',
    chapterTitle: 'Ngữ văn 9 – Học kì I: Bài 1 đến Bài 5 (Truyện truyền kì, Thơ song thất lục bát, Nghị luận, Bi kịch)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (72 tiết)',
    totalPeriods: 72,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Thế giới kì ảo, Những cung bậc tâm trạng, Hồn nước nằm trong tiếng mẹ cha, Khám phá vẻ đẹp văn chương, Đối diện với nỗi đau và Ôn tập, kiểm tra giữa kì I, cuối kì I. Định hướng NLS - AI & Lồng ghép: NLS 2.5.TC2a, 1.1.TC2a, 2.2.TC2a; AI A2.2, A3.1, A3.2; GD QP&AN.',
    rawLessons: [
      {
        id: 'nv9-b1',
        week: 'HKI (Tiết 1 – 12)',
        lessonName: 'Bài 1. Thế giới kì ảo',
        periodAllocation: 'Tiết 1 – 12',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích một số yếu tố trong truyện truyền kì (không gian, thời gian, chi tiết, cốt truyện, nhân vật chính, lời người kể chuyện); vận dụng hiểu biết về lịch sử văn học Việt Nam để đọc hiểu VB văn học; nhận biết điển tích, điển cố và sự khác biệt về nghĩa của một số yếu tố Hán Việt dễ nhầm lẫn; viết bài văn nghị luận về một vấn đề cần giải quyết. Lồng ghép GD QP&AN & NLS: Hậu quả của các cuộc chiến tranh xâm lược đối với dân tộc Việt Nam; Tích hợp NLS: 2.5.TC2a.',
      },
      {
        id: 'nv9-b2',
        week: 'HKI (Tiết 13 – 24)',
        lessonName: 'Bài 2. Những cung bậc tâm trạng',
        periodAllocation: 'Tiết 13 – 24',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích một số yếu tố về thi luật của thơ song thất lục bát (vần, nhịp, số chữ, số dòng trong một khổ thơ); nhận biết và phân tích tác dụng của các biện pháp tu từ chơi chữ, điệp thanh và điệp vần; viết VB nghị luận phân tích một tác phẩm văn học (phân tích nội dung chủ đề, những nét đặc sắc về hình thức nghệ thuật). Lồng ghép GD QP&AN & NLS: Hậu quả của các cuộc chiến tranh xâm lược đối với dân tộc Việt Nam; Tích hợp NLS: 2.5.TC2a.',
      },
      {
        id: 'nv9-b3',
        week: 'HKI (Tiết 25 – 36)',
        lessonName: 'Bài 3. Hồn nước nằm trong tiếng mẹ cha',
        periodAllocation: 'Tiết 25 – 36',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích mối liên hệ giữa luận đề, luận điểm, lí lẽ và bằng chứng tiêu biểu trong văn bản nghị luận; phân biệt lí lẽ, bằng chứng khách quan với ý kiến, đánh giá chủ quan của người viết; vận dụng các kiểu đoạn văn diễn dịch, quy nạp, song song, phối hợp; viết văn bản nghị luận về một vấn đề của đời sống. Định hướng phát triển NLS - AI: Tích hợp NLS: 2.5.TC2a; Tích hợp NL AI: A2.2, A3.1, A3.2.',
      },
      {
        id: 'nv9-ot-gk1',
        week: 'HKI (Tiết 37 – 40)',
        lessonName: 'Ôn tập và kiểm tra, trả bài giữa kì I',
        periodAllocation: 'Tiết 37 – 40',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Phần đọc hiểu: Nhận biết yếu tố luận đề, luận điểm, lí lẽ, bằng chứng tiêu biểu trong văn bản nghị luận, vai trò của người đọc, xung đột của bi kịch, cách dẫn trực tiếp và gián tiếp, câu rút gọn, câu đặc biệt. Phần Viết: Viết bài văn phân tích một tác phẩm văn học (truyện) hoặc bài văn nghị luận về một vấn đề đời sống.',
      },
      {
        id: 'nv9-b4',
        week: 'HKI (Tiết 41 – 53)',
        lessonName: 'Bài 4. Khám phá vẻ đẹp văn chương',
        periodAllocation: 'Tiết 41 – 53',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích luận đề, luận điểm, lí lẽ và bằng chứng tiêu biểu trong VB; nhận biết vai trò của người đọc và bối cảnh tiếp nhận đối với việc đọc hiểu tác phẩm văn học; phân biệt cách dẫn trực tiếp và cách dẫn gián tiếp, biết cách trích dẫn tài liệu để tránh đạo văn; viết một VB nghị luận phân tích một tác phẩm văn học.',
      },
      {
        id: 'nv9-b5',
        week: 'HKI (Tiết 54 – 67)',
        lessonName: 'Bài 5. Đối diện với nỗi đau',
        periodAllocation: 'Tiết 54 – 67',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích một số yếu tố của bi kịch (xung đột, hành động, cốt truyện, nhân vật, lời thoại); nhận biết đặc điểm của câu rút gọn, câu đặc biệt và hiểu chức năng của các kiểu câu này; viết bài văn nghị luận phân tích một tác phẩm văn học. Định hướng phát triển NLS: Tích hợp NLS: 1.1.TC2a, 2.2.TC2a.',
      },
      {
        id: 'nv9-ot-ck1',
        week: 'HKI (Tiết 68 – 72)',
        lessonName: 'Ôn tập và kiểm tra, trả bài cuối kì I',
        periodAllocation: 'Tiết 68 – 72',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Ôn tập, củng cố kiến thức đã học; đánh giá kĩ năng đọc hiểu và viết bài văn phân tích một tác phẩm văn học, bài văn nghị luận về một vấn đề đời sống.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-nv-hk2',
    grade: 9,
    subject: 'Ngữ văn',
    chapterCode: 'NV9-HK2',
    chapterTitle: 'Ngữ văn 9 – Học kì II: Bài 6 đến Bài 10 (Truyện trinh thám, Thơ tám chữ, Nghị luận xã hội, Văn bản thông tin)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (68 tiết)',
    totalPeriods: 68,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Giải mã những bí mật, Hồn thơ muôn điệu, Tiếng nói của lương tri, Đi và suy ngẫm, Văn học – Lịch sử tâm hồn và Ôn tập, kiểm tra giữa kì II, cuối kì II. Định hướng NLS - AI & Lồng ghép: AI A2.2, A3.1, A3.2; NLS 1.1.TC2a, 2.2.TC2a, 1.3.TC2a; GD QP&AN.',
    rawLessons: [
      {
        id: 'nv9-b6',
        week: 'HKII (Tiết 73 – 84)',
        lessonName: 'Bài 6. Giải mã những bí mật',
        periodAllocation: 'Tiết 73 – 84',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích một số yếu tố trong truyện trinh thám (không gian, thời gian, chi tiết, cốt truyện, nhân vật chính, lời người kể chuyện); nhận biết các kiểu câu ghép, kết từ để nối các vế câu ghép; viết một truyện kể sáng tạo, sử dụng các yếu tố miêu tả và biểu cảm trong truyện. Định hướng phát triển NLS - AI: Tích hợp NL AI: A2.2, A3.1, A3.2.',
      },
      {
        id: 'nv9-b7',
        week: 'HKII (Tiết 85 – 97)',
        lessonName: 'Bài 7. Hồn thơ muôn điệu',
        periodAllocation: 'Tiết 85 – 97',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích nét độc đáo về hình thức của bài thơ thể hiện qua bố cục, kết cấu, ngôn ngữ, biện pháp tu từ; hiểu sự phát triển của ngôn ngữ thể hiện qua những nghĩa mới của từ ngữ; bước đầu biết làm một bài thơ tám chữ và viết đoạn văn ghi lại cảm nghĩ về một bài thơ tám chữ. Định hướng phát triển NLS: Tích hợp NLS: 1.1.TC2a, 2.2.TC2a.',
      },
      {
        id: 'nv9-b8',
        week: 'HKII (Tiết 98 – 113)',
        lessonName: 'Bài 8. Tiếng nói của lương tri',
        periodAllocation: 'Tiết 98 – 113',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích luận đề, luận điểm, lí lẽ và bằng chứng tiêu biểu trong VB; phân biệt cách trình bày vấn đề khách quan (chỉ đưa thông tin) và cách trình bày chủ quan (thể hiện tình cảm, quan điểm của người viết); hiểu nghĩa và cách dùng tên viết tắt các tổ chức quốc tế quan trọng (UN, UNESCO, UNICEF, WHO, WB, IMF, ASEAN, WTO); viết bài văn nghị luận về một vấn đề cần giải quyết. Lồng ghép GD QP&AN: Yêu hòa bình, hậu quả của các cuộc chiến tranh xâm lược đối với dân tộc Việt Nam.',
      },
      {
        id: 'nv9-ot-gk2',
        week: 'HKII (Tiết 110 – 113)',
        lessonName: 'Ôn tập, kiểm tra, trả bài giữa kì II',
        periodAllocation: 'Tiết 110 – 113',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Phần đọc hiểu: Nhận biết và trình bày đặc trưng của truyện trinh thám, thông tin khách quan và ý kiến chủ quan trong tác phẩm nghị luận, đặc điểm câu đơn, câu ghép, phương tiện nối các vế câu ghép. Phần Viết: Viết đoạn văn ghi lại cảm nghĩ về 1 bài thơ 8 chữ hoặc bài văn nghị luận về 1 vấn đề cần giải quyết trong đời sống xã hội.',
      },
      {
        id: 'nv9-b9',
        week: 'HKII (Tiết 114 – 126)',
        lessonName: 'Bài 9. Đi và suy ngẫm',
        periodAllocation: 'Tiết 114 – 126',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Nhận biết và phân tích đặc điểm của VB giới thiệu một danh lam thắng cảnh hoặc di tích lịch sử, tác dụng của cách trình bày thông tin trong VB; hiểu các hình thức làm biến đổi, mở rộng cấu trúc câu; viết và thuyết minh về một danh lam thắng cảnh hay một di tích lịch sử có sử dụng các sơ đồ, bảng biểu, hình ảnh minh họa. Định hướng phát triển NLS: Tích hợp NLS: 1.1.TC2a.',
      },
      {
        id: 'nv9-b10',
        week: 'HKII (Tiết 127 – 135)',
        lessonName: 'Bài 10. Văn học – Lịch sử tâm hồn',
        periodAllocation: 'Tiết 127 – 135',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Vận dụng một số hiểu biết về lịch sử văn học Việt Nam để đọc hiểu VB văn học; nhận biết và phân tích đặc điểm của bài phỏng vấn; viết được một quảng cáo hoặc tờ rơi về một sản phẩm hay một hoạt động sử dụng kết hợp phương tiện ngôn ngữ và phi ngôn ngữ; tiến hành một cuộc phỏng vấn ngắn. Định hướng phát triển NLS: Tích hợp NLS: 1.3.TC2a.',
      },
      {
        id: 'nv9-ot-ck2',
        week: 'HKII (Tiết 136 – 140)',
        lessonName: 'Ôn tập và kiểm tra cuối kì II',
        periodAllocation: 'Tiết 136 – 140',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Phần đọc hiểu: Nhận biết, hiểu và trình bày các yếu tố của văn bản thuyết minh về 1 danh lam thắng cảnh; thực hành biến đổi và mở rộng cấu trúc câu. Phần Viết: Viết bài văn thuyết minh một danh lam thắng cảnh hoặc bài văn nghị luận về 1 vấn đề cần giải quyết trong đời sống xã hội.',
      },
    ],
  }),
];

// ============================================================================
// 1.2. MÔN LỊCH SỬ VÀ ĐỊA LÍ – KHỐI 6, 7, 8, 9 (CẢ NĂM: 105 TIẾT = LS 53 + ĐL 52)
// ============================================================================

export const GRADE6_LS_DL_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-ls-hk1',
    grade: 6,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS6-HK1',
    chapterTitle: 'Phân môn Lịch sử 6 – Học kì I: Bài 1 đến Bài 12 (Xã hội nguyên thủy, Cổ đại thế giới & Đông Nam Á)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Lịch sử và cuộc sống, Nguồn gốc loài người, Xã hội nguyên thủy, Ai Cập - Lưỡng Hà - Ấn Độ - Trung Quốc - Hy Lạp & La Mã cổ đại, Đông Nam Á sơ kì và phong kiến. Định hướng NLS - AI & Lồng ghép: NLS 1.1.TC1b, 1.2.TC2b, 3.1.TC1a; AI NLb (B2, B3), NLc (C3); GDQP-AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls6-b1-b3',
        week: 'Tuần 1 – Tuần 3',
        lessonName: 'Bài 1. Lịch sử và cuộc sống (2 tiết); Bài 2. Dựa vào đâu để biết và phục dựng lịch sử (1 tiết); Bài 3. Thời gian trong lịch sử (2 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 5',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nêu khái niệm lịch sử và môn Lịch sử; phân biệt các nguồn sử liệu cơ bản; nêu một số khái niệm và cách tính thời gian trong lịch sử. Định hướng NLS - AI & Lồng ghép: NLS 1.1.TC1b (Bài 1); AI NLb B2 tại Bài 2 (Đặt câu hỏi kiểm tra tính an toàn/tin cậy của AI; trải nghiệm ứng dụng AI nhận diện hiện vật qua hình ảnh); Lồng ghép GDQP-AN tại Bài 3 (Giới thiệu lịch sử và truyền thống của Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam).',
      },
      {
        id: 'ls6-b4-b6',
        week: 'Tuần 3 – Tuần 6',
        lessonName: 'Bài 4. Nguồn gốc loài người (2 tiết); Bài 5. Xã hội nguyên thủy (2 tiết); Bài 6. Sự chuyển biến và phân hóa của xã hội nguyên thủy (2 tiết)',
        periodAllocation: 'Tiết PPCT 6 – 11',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Giới thiệu quá trình tiến hóa từ vượn người thành người và dấu tích người tối cổ ở Đông Nam Á, Việt Nam; mô tả đời sống người nguyên thủy và vai trò của lao động; trình bày quá trình phát hiện ra kim loại và sự hình thành xã hội có giai cấp. Định hướng NLS - AI: AI NLc C3 tại Bài 4 (Công nghệ AI nhận dạng hình ảnh: Xem video mô phỏng quá trình tiến hóa và phục dựng khuôn mặt người tối cổ từ hộp sọ hóa thạch bằng công nghệ AI); NLS 1.2.TC2b (Bài 6).',
      },
      {
        id: 'ls6-b7-b8-gk1',
        week: 'Tuần 6 – Tuần 9',
        lessonName: 'Bài 7. Ai Cập và Lưỡng Hà cổ đại (3 tiết); Bài 8. Ấn Độ cổ đại (2 tiết); Ôn tập & Kiểm tra giữa kì 1 (2 tiết)',
        periodAllocation: 'Tiết PPCT 12 – 18',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Nêu tác động của điều kiện tự nhiên (sông ngòi, đất đai), quá trình thành lập nhà nước và những thành tựu văn hóa chủ yếu ở Ai Cập, Lưỡng Hà và Ấn Độ cổ đại. Kiểm tra giữa kì 1. Lồng ghép BĐKH: Vai trò của sông ngòi, khí hậu và ảnh hưởng của gió mùa đến sự hình thành văn minh và đời sống cư dân.',
      },
      {
        id: 'ls6-b9-b10',
        week: 'Tuần 10 – Tuần 13',
        lessonName: 'Bài 9. Trung Quốc cổ đại (2 tiết); Bài 10. Hy Lạp và La Mã cổ đại (2 tiết)',
        periodAllocation: 'Tiết PPCT 19 – 22',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Mô tả quá trình thống nhất và xác lập chế độ phong kiến dưới thời Tần Thủy Hoàng, vẽ trục thời gian các giai đoạn phát triển của Trung Quốc cổ đại; trình bày tổ chức nhà nước thành bang ở Hy Lạp, nhà nước đế chế ở La Mã và thành tựu văn hóa tiêu biểu. Lồng ghép BĐKH: Tác động của thiên tai, khí hậu và điều kiện tự nhiên (hải cảng, biển đảo) đến sản xuất nông nghiệp và phát triển kinh tế.',
      },
      {
        id: 'ls6-b11-b12-ck1',
        week: 'Tuần 14 – Tuần 18',
        lessonName: 'Bài 11. Các quốc gia sơ kì ở Đông Nam Á (1 tiết); Bài 12. Sự hình thành và bước đầu phát triển của các vương quốc phong kiến ở Đông Nam Á từ thế kỉ VII đến thế kỉ X (2 tiết); Ôn tập & Kiểm tra cuối kì 1 (2 tiết)',
        periodAllocation: 'Tiết PPCT 23 – 27',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Trình bày vị trí địa lí của vùng Đông Nam Á, quá trình xuất hiện các vương quốc cổ và sự hình thành, phát triển của các vương quốc phong kiến Đông Nam Á đến thế kỉ X. Kiểm tra cuối kì 1. Định hướng NLS - AI & BĐKH: NLS 3.1.TC1a & BĐKH (Bài 11); AI NLb B3 tại Bài 12 (Hiểu lý do cần biết cách AI suy nghĩ: Tìm hiểu AI phân tích các dòng chảy thương mại cổ qua dữ liệu hải cảng đại dương).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-ls-hk2',
    grade: 6,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS6-HK2',
    chapterTitle: 'Phân môn Lịch sử 6 – Học kì II: Bài 13 đến Bài 20 (Văn Lang – Âu Lạc, Thời kì Bắc thuộc, Chăm-pa & Phù Nam)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (26 tiết)',
    totalPeriods: 26,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Giao lưu văn hóa Đông Nam Á, Nhà nước Văn Lang – Âu Lạc, Chính sách cai trị và các cuộc khởi nghĩa thời Bắc thuộc, Bước ngoặt lịch sử đầu thế kỉ X, Vương quốc Chăm-pa và Phù Nam. Định hướng NLS - AI & Lồng ghép: NLS 2.4.TC1a, 1.2.TC2b, 3.1.TC1a, 3.3.TC1a; AI NLd D1, NLb B3, NLc C2; GDQP-AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls6-b13-b15-gk2',
        week: 'Tuần 19 – Tuần 28',
        lessonName: 'Bài 13. Giao lưu văn hóa ở Đông Nam Á từ đầu công nguyên đến thế kỉ X (2 tiết); Bài 14. Nhà nước Văn Lang – Âu Lạc (3 tiết); Bài 15. Chính sách cai trị của các triều đại phong kiến phương Bắc và sự chuyển biến của xã hội Âu Lạc (4 tiết); Ôn tập & Kiểm tra giữa kì 2 (2 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 37',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Phân tích tác động của giao lưu thương mại và văn hóa ở Đông Nam Á; trình bày sự thành lập và tổ chức nhà nước của Văn Lang, Âu Lạc; nêu chính sách cai trị của phong kiến phương Bắc và chuyển biến kinh tế, xã hội, văn hóa ở Việt Nam thời Bắc thuộc. Định hướng NLS - AI & Lồng ghép: NLS 2.4.TC1a (Bài 13), 1.2.TC2b (Bài 15); Bài 14 tích hợp GDQP-AN, BĐKH (kinh nghiệm trị thủy) và AI NLd D1 (Thảo luận: "Có nên dùng AI để vẽ lại sơ đồ Loa Thành khi dữ liệu khảo cổ chưa đầy đủ?").',
      },
      {
        id: 'ls6-b16-b18',
        week: 'Tuần 28 – Tuần 32',
        lessonName: 'Bài 16. Các cuộc khởi nghĩa tiêu biểu giành độc lập trước thế kỉ X (4 tiết); Bài 17. Cuộc đấu tranh bảo tồn và phát triển văn hóa dân tộc của người Việt (3 tiết); Bài 18. Bước ngoặt lịch sử đầu thế kỉ X (3 tiết)',
        periodAllocation: 'Tiết PPCT 38 – 47',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Lập sơ đồ diễn biến, kết quả và ý nghĩa các cuộc khởi nghĩa tiêu biểu (Hai Bà Trưng, Bà Triệu, Lý Bí, Mai Thúc Loan, Phùng Hưng); giới thiệu cuộc đấu tranh bảo tồn bản sắc văn hóa dân tộc; mô tả trận chiến Bạch Đằng năm 938 của Ngô Quyền. Định hướng NLS - AI & Lồng ghép: NLS 3.1.TC1a & GDQP-AN (Bài 16); NLS 3.3.TC1a (Bài 17); AI NLb B3 tại Bài 18 (Đảm bảo tính minh bạch khi dùng AI: Xem mô phỏng trận Bạch Đằng do AI hỗ trợ và thảo luận về tính minh bạch của nguồn sử liệu đầu vào cho AI).',
      },
      {
        id: 'ls6-b19-b20-ck2',
        week: 'Tuần 33 – Tuần 35',
        lessonName: 'Bài 19. Vương quốc Chăm-pa từ thế kỉ II đến thế kỉ X (2 tiết); Bài 20. Vương quốc Phù Nam (2 tiết); Ôn tập & Kiểm tra cuối kì 2 (2 tiết)',
        periodAllocation: 'Tiết PPCT 48 – 53',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Mô tả sự thành lập, quá trình phát triển, tổ chức xã hội, kinh tế và thành tựu văn hóa của Vương quốc Chăm-pa và Vương quốc Phù Nam. Kiểm tra cuối kì 2. Định hướng phát triển NLS - AI: AI NLc C2 tại Bài 20 (Nhận biết và vận dụng các ứng dụng AI trong học tập và đời sống: Tìm hiểu AI trong phục dựng và nghiên cứu Vương quốc Phù Nam).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-dl-hk1',
    grade: 6,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL6-HK1',
    chapterTitle: 'Phân môn Địa lí 6 – Học kì I: Bài Mở đầu & Bài 1 đến Bài 14 (Bản đồ, Trái Đất, Cấu tạo Trái Đất & Địa hình)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Hệ thống kinh vĩ tuyến, Tọa độ địa lí, Bản đồ, Chuyển động của Trái Đất, Cấu tạo Trái Đất, Núi lửa và động đất, Các dạng địa hình và khoáng sản. Định hướng NLS - AI & Lồng ghép: NLS 5.2.TC1b, 1.2.TC2b, 3.1.TC2a, 1.2.TC2a, 1.1.TC1c; AI NLb (A3), NLc (C2, C3); BĐKH.',
    rawLessons: [
      {
        id: 'dl6-md-b1-b4-gk1',
        week: 'HKI (Tiết PPCT 1 – 10)',
        lessonName: 'Bài Mở đầu (1 tiết); Bài 1. Hệ thống kinh, vĩ tuyến. Tọa độ địa lí (2 tiết); Bài 2. Bản đồ. Một số lưới kinh, vĩ tuyến. Phương hướng trên bản đồ (2 tiết); Bài 3. Tỉ lệ bản đồ. Tính khoảng cách thực tế (2 tiết); Bài 4. Kí hiệu và bảng chú giải bản đồ (1 tiết); Ôn tập & Kiểm tra giữa kì I (2 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 10',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Xác định kinh tuyến, vĩ tuyến, tọa độ địa lí; xác định phương hướng, tính khoảng cách thực tế theo tỉ lệ bản đồ và đọc kí hiệu bản đồ. Kiểm tra giữa kì I. Định hướng NLS - AI: NLS 5.2.TC1b & AI NLb A3 tại Bài 1 (Đánh giá và sử dụng kết quả do AI tạo ra để xác định và giải thích tọa độ địa lí của một địa điểm); NLS 1.2.TC2b (Bài 3).',
      },
      {
        id: 'dl6-b5-b9',
        week: 'HKI (Tiết PPCT 11 – 17)',
        lessonName: 'Bài 5. Lược đồ trí nhớ (1 tiết); Bài 6. Trái Đất trong hệ Mặt Trời (1 tiết); Bài 7. Chuyển động tự quay quanh trục của Trái Đất và hệ quả (2 tiết); Bài 8. Chuyển động của Trái Đất quanh Mặt Trời và hệ quả (2 tiết); Bài 9. Xác định phương hướng ngoài thực tế (1 tiết)',
        periodAllocation: 'Tiết PPCT 11 – 17',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Vẽ lược đồ trí nhớ; xác định vị trí Trái Đất trong hệ Mặt Trời; trình bày hệ quả chuyển động tự quay quanh trục và quay quanh Mặt Trời của Trái Đất; xác định phương hướng ngoài thực tế bằng la bàn. Định hướng NLS - AI: NLS 3.1.TC2a (Bài 5); AI NLc C3 tại Bài 6 (Công nghệ AI nhận dạng hình ảnh vệ tinh: Tìm hiểu AI trong các vệ tinh chụp ảnh và phân tích kích thước, hình dạng Trái Đất từ không gian).',
      },
      {
        id: 'dl6-b10-b14-ck1',
        week: 'HKI (Tiết PPCT 18 – 27)',
        lessonName: 'Bài 10. Cấu tạo của Trái Đất. Các mảng kiến tạo (2 tiết); Bài 11. Quá trình nội sinh và quá trình ngoại sinh (2 tiết); Bài 12. Núi lửa và động đất (1 tiết); Bài 13. Các dạng địa hình chính trên Trái Đất. Khoáng sản (2 tiết); Bài 14. Thực hành: Đọc lược đồ địa hình (1 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết PPCT 18 – 27',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Trình bày cấu tạo Trái Đất, mảng kiến tạo, quá trình nội sinh và ngoại sinh; nguyên nhân và cách ứng phó với núi lửa, động đất; phân biệt các dạng địa hình chính và khoáng sản; đọc lược đồ địa hình tỉ lệ lớn. Định hướng NLS - AI & BĐKH: NLS 1.2.TC2a (Bài 10); Bài 12 tích hợp BĐKH (năng lượng địa nhiệt) & AI NLc C2 (Tìm hiểu hệ thống AI cảnh báo sớm động đất, sóng thần tại Việt Nam dựa trên phân tích dữ liệu địa chất thời gian thực); Bài 13 tích hợp BĐKH & NLS 1.1.TC1c.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-dl-hk2',
    grade: 6,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL6-HK2',
    chapterTitle: 'Phân môn Địa lí 6 – Học kì II: Bài 15 đến Bài 30 (Khí quyển, Thủy quyển, Thổ nhưỡng - Sinh quyển, Con người & Thiên nhiên)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (25 tiết)',
    totalPeriods: 25,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Lớp vỏ khí, Nhiệt độ - Mây và mưa, Thời tiết và khí hậu - Biến đổi khí hậu, Thủy quyển, Sông hồ - Biển và đại dương, Lớp đất và sinh vật, Rừng nhiệt đới, Dân số và mối quan hệ giữa con người với thiên nhiên. Định hướng NLS - AI & BĐKH: NLS 4.4.TC1a, 4.2.TC1a; AI NLa A3, NLc C2; Tích hợp BĐKH.',
    rawLessons: [
      {
        id: 'dl6-b15-b18',
        week: 'HKII (Tiết PPCT 28 – 34)',
        lessonName: 'Bài 15. Lớp vỏ khí của Trái Đất. Khí áp và gió (2 tiết); Bài 16. Nhiệt độ không khí. Mây và mưa (2 tiết); Bài 17. Thời tiết và khí hậu. Biến đổi khí hậu (2 tiết); Bài 18. Thực hành: Phân tích biểu đồ nhiệt độ, lượng mưa (1 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 34',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Trình bày các tầng khí quyển, đai khí áp và gió; sự thay đổi nhiệt độ không khí, mây và mưa; phân biệt thời tiết và khí hậu, nêu biểu hiện và biện pháp phòng tránh thiên tai, ứng phó với biến đổi khí hậu; phân tích biểu đồ nhiệt độ, lượng mưa. Định hướng NLS & BĐKH: Tích hợp BĐKH & NLS 4.4.TC1a tại Bài 17.',
      },
      {
        id: 'dl6-b19-b24-gk2',
        week: 'HKII (Tiết PPCT 35 – 42)',
        lessonName: 'Bài 19. Thủy quyển và vòng tuần hoàn lớn của nước (1 tiết); Bài 20. Sông và hồ. Nước ngầm và băng hà (2 tiết); Bài 21. Biển và đại dương (1 tiết); Bài 22. Lớp đất trên Trái Đất (1 tiết); Bài 23. Sự sống trên Trái Đất (1 tiết); Bài 24. Rừng nhiệt đới (1 tiết); Ôn tập & Kiểm tra giữa học kì II (2 tiết)',
        periodAllocation: 'Tiết PPCT 35 – 42',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Mô tả vòng tuần hoàn lớn của nước, sông hồ, nước ngầm, băng hà, biển và đại dương; các tầng đất, sự đa dạng sinh vật và đặc điểm rừng nhiệt đới. Kiểm tra giữa kì II. Định hướng AI & BĐKH: Tích hợp BĐKH tại Bài 19, 20, 21, 22; AI NLa A3 tại Bài 20 (Tìm hiểu AI trong vận hành và điều tiết mực nước tại các đập thủy điện lớn của Việt Nam như Hòa Bình); AI NLc C2 tại Bài 24 (Tìm hiểu hệ thống AI phát hiện sớm tiếng cưa máy hoặc khói để cảnh báo cháy rừng và nạn phá rừng).',
      },
      {
        id: 'dl6-b25-b30-ck2',
        week: 'HKII (Tiết PPCT 44 – 52)',
        lessonName: 'Bài 25. Sự phân bố các đới thiên nhiên trên Trái Đất (1 tiết); Bài 26. Thực hành: Tìm hiểu môi trường tự nhiên địa phương (1 tiết); Bài 27. Dân số và sự phân bố dân cư trên thế giới (2 tiết); Bài 28. Mối quan hệ giữa con người và thiên nhiên (1 tiết); Bài 29. Bảo vệ tự nhiên và khai thác thông minh các tài nguyên thiên nhiên (1 tiết); Bài 30. Thực hành: Tìm hiểu mối quan hệ giữa con người và thiên nhiên ở địa phương (1 tiết); Ôn tập & Kiểm tra cuối học kì II (2 tiết)',
        periodAllocation: 'Tiết PPCT 44 – 52',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Xác định sự phân bố các đới thiên nhiên; đọc biểu đồ quy mô dân số thế giới; trình bày tác động qua lại giữa con người và thiên nhiên, ý nghĩa của việc bảo vệ tự nhiên và khai thác thông minh tài nguyên vì sự phát triển bền vững. Định hướng NLS - AI & BĐKH: Tích hợp BĐKH (Bài 25, 28); Bài 29 tích hợp NLS 4.2.TC1a & AI NLc C2 (Ứng dụng AI trong bối cảnh Việt Nam: Tìm hiểu mô hình AI tối ưu hóa việc sử dụng năng lượng tái tạo mặt trời, gió tại các tỉnh miền Trung).',
      },
    ],
  }),
];

export const GRADE7_LS_DL_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-ls-hk1',
    grade: 7,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS7-HK1',
    chapterTitle: 'Phân môn Lịch sử 7 – Học kì I: Bài 1 đến Bài 7 & Chủ đề chung 2 (Tây Âu, Trung Quốc, Ấn Độ, Đông Nam Á trung đại)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Tây Âu từ thế kỉ V đến nửa đầu thế kỉ XVI (Bài 1–3), Trung Quốc và Ấn Độ thời phong kiến (Bài 4–5), Chủ đề chung 2 (Đô thị: Lịch sử và hiện đại), Các vương quốc phong kiến Đông Nam Á và Vương quốc Lào (Bài 6–7). Định hướng NLS - AI & Lồng ghép: NLS 3.1.TC2a, 1.2.TC2b, 2.1.TC2a; AI NLa, NLb; GDQP-AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls7-b1-b3-gk1',
        week: 'Tuần 1 – Tuần 10',
        lessonName: 'Chương 1. Tây Âu từ thế kỉ V đến nửa đầu thế kỉ XVI: Bài 1. Quá trình hình thành và phát triển chế độ phong kiến ở Tây Âu (3 tiết); Bài 2. Các cuộc phát kiến địa lí và sự hình thành quan hệ sản xuất tư bản chủ nghĩa ở Tây Âu (3 tiết); Bài 3. Phong trào Văn hóa Phục hưng và Cải cách tôn giáo (2 tiết); Ôn tập & Kiểm tra giữa kì 1 (2 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 10',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Kể lại quá trình hình thành xã hội phong kiến, lãnh địa và thành thị trung đại ở Tây Âu; nêu hệ quả của các cuộc phát kiến địa lí và sự nảy sinh CNTB; trình bày thành tựu văn hóa Phục hưng và Cải cách tôn giáo. Định hướng NLS - AI & Lồng ghép: GDQP-AN (Bài 1, 3: Quyền tự do tín ngưỡng, tôn giáo); Bài 2 tích hợp BĐKH & AI NLb (Tìm hiểu thuật toán AI hỗ trợ xử lý dữ liệu hàng hải cổ để mô phỏng lại các hải trình của C. Cô-lôm-bô); NLS 3.1.TC2a (Bài 3).',
      },
      {
        id: 'ls7-b4-cd2-b5',
        week: 'Tuần 10 – Tuần 16',
        lessonName: 'Bài 4. Trung Quốc từ thế kỉ VII đến giữa thế kỉ XIX (5 tiết); Chủ đề chung 2: Đô thị: Lịch sử và hiện đại (3 tiết); Bài 5. Ấn Độ từ thế kỉ IV đến giữa thế kỉ XIX (4 tiết)',
        periodAllocation: 'Tiết PPCT 11 – 22',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Lập sơ đồ tiến trình phát triển của Trung Quốc từ thời Đường đến Minh - Thanh; phân tích vai trò của đô thị đối với sự phát triển lịch sử; trình bày tình hình chính trị, kinh tế, xã hội Ấn Độ thời Gupta, Đê-li và Mô-gôn. Định hướng NLS - AI: NLS 1.2.TC2b (Bài 4); AI NLb tại Chủ đề chung 2 (Tìm hiểu mô hình AI phân tích dữ liệu khảo cổ để so sánh đô thị cổ đại phương Đông và phương Tây); AI NLa tại Bài 5 (Giới thiệu AI thám hiểm các đền tháp, hang động A-gian-ta mà con người khó tiếp cận).',
      },
      {
        id: 'ls7-b6-b7-ck1',
        week: 'Tuần 16 – Tuần 18',
        lessonName: 'Bài 6. Các vương quốc phong kiến Đông Nam Á từ nửa sau thế kỉ X đến nửa đầu thế kỉ XVI (2 tiết); Bài 7. Vương quốc Lào (1 tiết); Ôn tập & Kiểm tra cuối kì 1 (2 tiết)',
        periodAllocation: 'Tiết PPCT 23 – 27',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Mô tả quá trình hình thành, phát triển và thành tựu văn hóa của các quốc gia Đông Nam Á và Vương quốc Lào thời Lan Xang. Kiểm tra cuối kì 1. Định hướng NLS & BĐKH: BĐKH (Bài 6, 7: Thích ứng môi trường nhiệt đới gió mùa và vai trò sông Mê Công); NLS 2.1.TC2a (Bài 7).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-ls-hk2',
    grade: 7,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS7-HK2',
    chapterTitle: 'Phân môn Lịch sử 7 – Học kì II: Bài 8 đến Bài 18 (Vương quốc Campuchia & Lịch sử Việt Nam từ thời Ngô đến đầu thế kỉ XVI)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (26 tiết)',
    totalPeriods: 26,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Vương quốc Campuchia, Đất nước buổi đầu độc lập (Ngô – Đinh – Tiền Lê), Đại Việt thời Lý – Trần – Hồ, Khởi nghĩa Lam Sơn, Đại Việt thời Lê Sơ, Vương quốc Chăm-pa và vùng đất Nam Bộ. Định hướng NLS - AI & Lồng ghép: NLS 3.1.TC2a, 1.2.TC2b; AI NLa; GDQP-AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls7-b8-b12',
        week: 'Tuần 19 – Tuần 23',
        lessonName: 'Bài 8. Vương quốc Campuchia (1 tiết); Bài 9. Đất nước buổi đầu độc lập (939 – 967) (1 tiết); Bài 10. Đại Cồ Việt thời Đinh và Tiền Lê (968 – 1009) (2 tiết); Bài 11. Nhà Lý xây dựng và phát triển đất nước (1009 – 1225) (3 tiết); Bài 12. Cuộc kháng chiến chống quân xâm lược Tống (1075 – 1077) (2 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 36',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Đánh giá sự phát triển của Vương quốc Campuchia thời Ăng-co; trình bày công cuộc thống nhất đất nước thời Ngô – Đinh – Tiền Lê; sự thành lập nhà Lý và cuộc kháng chiến chống Tống (1075 – 1077) của Lý Thường Kiệt. Định hướng NLS - AI & Lồng ghép: NLS 3.1.TC2a (Bài 8); AI NLa tại Bài 9 (Mô phỏng trận quyết chiến trên sông Bạch Đằng do AI hỗ trợ dựng lại từ tư liệu sử học) & Bài 12 (Xem video AI mô phỏng chiến thuật "Tiên phát chế nhân" của Lý Thường Kiệt); GDQP-AN (Bài 10); BĐKH (Bài 11: Đắp đê, trị thủy thời Lý).',
      },
      {
        id: 'ls7-b13-b14-gk2',
        week: 'Tuần 23 – Tuần 27',
        lessonName: 'Bài 13. Đại Việt thời Trần (1226 – 1400) (3 tiết); Bài 14. Ba lần kháng chiến chống quân xâm lược Mông – Nguyên (3 tiết); Ôn tập & Kiểm tra giữa kì 2 (2 tiết)',
        periodAllocation: 'Tiết PPCT 37 – 44',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Mô tả sự thành lập nhà Trần, tình hình chính trị, kinh tế, văn hóa thời Trần; lập lược đồ diễn biến chính và phân tích nguyên nhân thắng lợi, ý nghĩa lịch sử của ba lần kháng chiến chống quân xâm lược Mông – Nguyên. Định hướng NLS & Lồng ghép: BĐKH (Bài 13: Chính sách khuyến nông, khai hoang, đê điều); NLS 3.1.TC2a & GDQP-AN tại Bài 14 (Bảo vệ chủ quyền biển, đảo Việt Nam).',
      },
      {
        id: 'ls7-b15-b18-ck2',
        week: 'Tuần 27 – Tuần 35',
        lessonName: 'Bài 15. Nước Đại Ngu thời Hồ (1400 – 1407) (2 tiết); Bài 16. Khởi nghĩa Lam Sơn (1418 – 1427) (2 tiết); Bài 17. Đại Việt thời Lê Sơ (1428 – 1527) (2 tiết); Bài 18. Vương quốc Chăm-pa và vùng đất Nam Bộ từ đầu thế kỉ X đến đầu thế kỉ XVI (1 tiết); Ôn tập & Kiểm tra cuối kì 2 (2 tiết)',
        periodAllocation: 'Tiết PPCT 45 – 53',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Giới thiệu cải cách của Hồ Quý Ly; trình bày các sự kiện tiêu biểu của khởi nghĩa Lam Sơn; mô tả tình hình kinh tế, xã hội, văn hóa Đại Việt thời Lê Sơ; nêu diễn biến cơ bản ở Chăm-pa và vùng đất Nam Bộ. Định hướng NLS - AI & Lồng ghép: NLS 1.2.TC2b (Bài 15); AI NLa tại Bài 16 (HS trình bày ý kiến về việc dùng chatbot AI để tóm tắt các sự kiện tiêu biểu của cuộc khởi nghĩa Lam Sơn); GDQP-AN tại Bài 18 (Bảo vệ chủ quyền biển, đảo Việt Nam).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-dl-hk1',
    grade: 7,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL7-HK1',
    chapterTitle: 'Phân môn Địa lí 7 – Học kì I: Chương 1, 2, 3 (Châu Âu, Châu Á & Châu Phi – Bài 1 đến Bài 10)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Châu Âu (Bài 1–4), Châu Á (Bài 5–8), Châu Phi (Bài 9–10) và Ôn tập, kiểm tra giữa kì I, cuối kì I. Định hướng NLS - AI & BĐKH: NLS 1.2.TC2b, 1.2.TC1a, 5.3.TC1a; AI NLa, NLb; Tích hợp BĐKH.',
    rawLessons: [
      {
        id: 'dl7-c1-b1-b4',
        week: 'HKI (Tiết PPCT 1 – 9)',
        lessonName: 'Chương 1. Châu Âu (9 tiết): Bài 1. Vị trí địa lí, đặc điểm tự nhiên châu Âu (3 tiết); Bài 2. Đặc điểm dân cư, xã hội châu Âu (2 tiết); Bài 3. Khai thác, sử dụng và bảo vệ thiên nhiên ở châu Âu (2 tiết); Bài 4. Liên minh châu Âu (2 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 9',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Trình bày đặc điểm vị trí địa lí, tự nhiên, cơ cấu dân cư, di cư và đô thị hóa ở châu Âu; lựa chọn và trình bày vấn đề bảo vệ môi trường ở châu Âu; nêu dẫn chứng về Liên minh châu Âu (EU) như một trong bốn trung tâm kinh tế lớn trên thế giới. Định hướng NLS - AI & BĐKH: Bài 2 tích hợp NLS 1.2.TC2b & AI NLa (Tìm hiểu mô hình AI dự báo xu hướng già hóa dân số và tác động đến kinh tế châu Âu); Bài 3 tích hợp BĐKH (Toàn phần); Bài 4 tích hợp NLS 1.2.TC1a.',
      },
      {
        id: 'dl7-c2-b5-b8-gk1',
        week: 'HKI (Tiết PPCT 10 – 21)',
        lessonName: 'Chương 2. Châu Á (12 tiết): Bài 5. Vị trí địa lí, đặc điểm tự nhiên châu Á (3 tiết); Bài 6. Đặc điểm dân cư, xã hội châu Á (2 tiết); Bài 7. Bản đồ chính trị châu Á, các khu vực của châu Á (3 tiết); Ôn tập & Kiểm tra giữa kì I (2 tiết); Bài 8. Thực hành: Tìm hiểu về các nền kinh tế lớn và kinh tế mới nổi của châu Á (2 tiết)',
        periodAllocation: 'Tiết PPCT 10 – 21',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Trình bày đặc điểm vị trí địa lí, tự nhiên, dân cư, tôn giáo châu Á; xác định trên bản đồ chính trị các khu vực của châu Á; sưu tầm tư liệu và trình bày về các nền kinh tế lớn và mới nổi của châu Á (Trung Quốc, Nhật Bản, Hàn Quốc, Singapore). Định hướng NLS - AI & BĐKH: Bài 5 tích hợp BĐKH; Bài 7 tích hợp NLS 5.3.TC1a; Bài 8 tích hợp AI NLb (Thực hành kỹ năng AI qua dự án nhỏ: HS sử dụng AI để tổng hợp, so sánh dữ liệu GDP và tốc độ phát triển kinh tế các nước).',
      },
      {
        id: 'dl7-c3-b9-b10-ck1',
        week: 'HKI (Tiết PPCT 22 – 27)',
        lessonName: 'Chương 3. Châu Phi (HKI): Bài 9. Vị trí địa lí, đặc điểm tự nhiên châu Phi (2 tiết); Bài 10. Đặc điểm dân cư, xã hội châu Phi (2 tiết); Ôn tập & Kiểm tra cuối kì 1 (2 tiết)',
        periodAllocation: 'Tiết PPCT 22 – 27',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Trình bày đặc điểm vị trí địa lí, tự nhiên và phân tích các vấn đề môi trường, dân cư, xã hội nổi cộm ở châu Phi. Kiểm tra cuối kì 1. Định hướng phát triển NLS - AI: Bài 9 tích hợp AI NLb (Tìm hiểu hệ thống AI dự báo sa mạc hóa và giám sát dự án "Vành đai xanh" tại châu Phi).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-dl-hk2',
    grade: 7,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL7-HK2',
    chapterTitle: 'Phân môn Địa lí 7 – Học kì II: Chương 3 (tiếp), Chương 4 & Chương 5 (Châu Mỹ, Châu Đại Dương, Châu Nam Cực & Chủ đề chung)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (25 tiết)',
    totalPeriods: 25,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Khai thác thiên nhiên châu Phi & Cộng hòa Nam Phi (Bài 11–12), Châu Mỹ (Bài 13–17), Châu Đại Dương và Châu Nam Cực (Bài 18–19), Chủ đề chung: Các cuộc phát kiến địa lí. Định hướng NLS - AI & BĐKH: NLS 5.3.TC1a, 1.1.TC1a, 1.2.TC2a; AI NLc (C2), NLb; Tích hợp BĐKH.',
    rawLessons: [
      {
        id: 'dl7-b11-b14-gk2',
        week: 'HKII (Tiết PPCT 28 – 36)',
        lessonName: 'Bài 11. Phương thức con người khai thác, sử dụng và bảo vệ thiên nhiên ở châu Phi (2 tiết); Bài 12. Thực hành: Tìm hiểu khái quát Cộng hòa Nam Phi (1 tiết); Chương 4. Châu Mỹ: Bài 13. Vị trí địa lí, phạm vi châu Mỹ. Sự phát kiến ra châu Mỹ (2 tiết); Bài 14. Đặc điểm tự nhiên Bắc Mỹ (2 tiết); Ôn tập & Kiểm tra đánh giá giữa kì II (2 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 36',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Trình bày cách thức người dân châu Phi khai thác thiên nhiên ở các môi trường khác nhau; tìm hiểu Cộng hòa Nam Phi; phân tích hệ quả cuộc phát kiến ra châu Mỹ và đặc điểm tự nhiên Bắc Mỹ. Kiểm tra giữa kì II. Định hướng NLS - AI: Bài 13 tích hợp NLS 5.3.TC1a; Bài 14 tích hợp AI NLc C2 (Tìm hiểu AI trong phân tích dữ liệu tự nhiên Bắc Mỹ từ ảnh vệ tinh và mô hình khí hậu).',
      },
      {
        id: 'dl7-b15-b17',
        week: 'HKII (Tiết PPCT 37 – 43)',
        lessonName: 'Bài 15. Đặc điểm dân cư, xã hội, phương thức khai thác tự nhiên bền vững ở Bắc Mỹ (2 tiết); Bài 16. Đặc điểm tự nhiên Trung và Nam Mỹ (3 tiết); Bài 17. Đặc điểm dân cư Trung và Nam Mỹ, vấn đề đô thị hóa, văn hóa Mỹ Latinh và bảo vệ rừng Amazon (2 tiết)',
        periodAllocation: 'Tiết PPCT 37 – 43',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Phân tích vấn đề nhập cư, đô thị hóa và phương thức khai thác tự nhiên bền vững ở Bắc Mỹ; trình bày sự phân hóa tự nhiên Trung và Nam Mỹ, đặc điểm rừng nhiệt đới Amazon và vấn đề bảo vệ rừng Amazon. Định hướng NLS - AI & BĐKH: Bài 15 tích hợp NLS 1.1.TC1a & AI NLb (Tìm hiểu AI trong quản lý vận hành lưới điện thông minh và năng lượng tái tạo tại Bắc Mỹ); Bài 16 tích hợp NLS 1.2.TC2a; Bài 17 tích hợp BĐKH.',
      },
      {
        id: 'dl7-c5-b18-b19-cd-ck2',
        week: 'HKII (Tiết PPCT 44 – 52)',
        lessonName: 'Chương 5. Châu Đại Dương và Châu Nam Cực: Bài 18. Châu Đại Dương (3 tiết); Bài 19. Châu Nam Cực (2 tiết); Chủ đề chung: Các cuộc phát kiến địa lí (2 tiết); Ôn tập & Kiểm tra cuối học kì II (2 tiết)',
        periodAllocation: 'Tiết PPCT 44 – 52',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Phân tích đặc điểm tự nhiên, dân cư và phương thức khai thác bền vững ở Australia; trình bày vị trí địa lí, lịch sử khám phá và kịch bản thiên nhiên châu Nam Cực khi có biến đổi khí hậu toàn cầu; giải thích nguyên nhân và tác động của các cuộc phát kiến địa lí. Định hướng NLS - AI & BĐKH: Bài 18 tích hợp BĐKH & AI NLb (Tìm hiểu AI giám sát rạn san hô Great Barrier và nhận diện các loài thú túi đặc hữu); Bài 19 tích hợp NLS 1.2.TC2a.',
      },
    ],
  }),
];

export const GRADE8_LS_DL_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-ls-hk1',
    grade: 8,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS8-HK1',
    chapterTitle: 'Phân môn Lịch sử 8 – Học kì I: Bài 1 đến Bài 12 (Cách mạng tư sản, Đông Nam Á, Việt Nam thế kỉ XVI–XVIII & Thế giới đến đầu thế kỉ XX)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Cách mạng tư sản Anh, Bắc Mỹ, Pháp và Cách mạng công nghiệp (Bài 1–3), Đông Nam Á (Bài 4), Việt Nam thế kỉ XVI–XVIII: Nam - Bắc triều, Trịnh - Nguyễn, Khai phá vùng đất phía Nam, Khởi nghĩa nông dân Đàng Ngoài, Phong trào Tây Sơn (Bài 5–9), Chủ nghĩa đế quốc, Phong trào công nhân và Chiến tranh thế giới thứ nhất (Bài 10–12). Định hướng NLS - AI & Lồng ghép: NLS 1.1.TC2b, 1.2.TC2a, 3.1.TC2a; AI NLc (6.1b), NLb (6.2c), NLd (D2); GDQP-AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls8-b1-b4',
        week: 'Tuần 1 – Tuần 3',
        lessonName: 'Chương 1 & 2: Bài 1. Cách mạng tư sản Anh và Chiến tranh giành độc lập của 13 thuộc địa Anh ở Bắc Mỹ (2 tiết); Bài 2. Cách mạng tư sản Pháp cuối thế kỉ XVIII (1 tiết); Bài 3. Cách mạng công nghiệp (nửa sau thế kỉ XVIII – giữa thế kỉ XIX) (1 tiết); Bài 4. Đông Nam Á từ nửa sau thế kỉ XVI đến giữa thế kỉ XIX (2 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 6',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nêu đặc điểm chính, nguyên nhân, kết quả, ý nghĩa của các cuộc cách mạng tư sản tiêu biểu ở Anh, Bắc Mỹ, Pháp; tác động của cách mạng công nghiệp; quá trình xâm nhập của tư bản phương Tây vào Đông Nam Á. Định hướng NLS - AI & BĐKH: NLS 1.1.TC2b (Bài 1), 1.2.TC2a (Bài 2); BĐKH tại Bài 3 (Tác động công nghiệp hóa, nhiên liệu hóa thạch đến phát thải khí nhà kính); AI NLc (6.1b) tại Bài 4 (Tìm hiểu ứng dụng AI trong việc dịch thuật các văn bản cổ về cuộc đấu tranh chống thực dân, thảo luận về sai số ngôn ngữ của AI).',
      },
      {
        id: 'ls8-b5-b9-gk1',
        week: 'Tuần 4 – Tuần 10',
        lessonName: 'Chương 3. Việt Nam từ đầu thế kỉ XVI đến thế kỉ XVIII: Bài 5. Cuộc xung đột Nam – Bắc triều và Trịnh – Nguyễn (2 tiết); Bài 6. Công cuộc khai phá vùng đất phía Nam và thực thi chủ quyền đối với quần đảo Trường Sa, quần đảo Hoàng Sa từ thế kỉ XVI đến thế kỉ XVIII (1 tiết); Bài 7. Khởi nghĩa nông dân ở Đàng Ngoài thế kỉ XVIII (2 tiết); Bài 8. Phong trào Tây Sơn (4 tiết); Bài 9. Tình hình kinh tế, văn hóa, tôn giáo trong các thế kỉ XVI – XVIII (2 tiết); Ôn tập & Kiểm tra giữa kì I (2 tiết)',
        periodAllocation: 'Tiết PPCT 7 – 19',
        periodsCount: 13,
        adjustedContent:
          'YCCĐ: Giải thích nguyên nhân và hệ quả xung đột Nam – Bắc triều, Trịnh – Nguyễn; trình bày công cuộc khai phá vùng đất phía Nam và quá trình thực thi chủ quyền đối với quần đảo Hoàng Sa, Trường Sa; nguyên nhân thắng lợi, ý nghĩa lịch sử của phong trào Tây Sơn và vai trò của Nguyễn Huệ – Quang Trung. Định hướng NLS - AI & Lồng ghép: AI NLc (6.1b) (Bài 5); BĐKH (Bài 6, 8); GDQP-AN (Bài 8); AI NLb (6.2c) tại Bài 9 (Sử dụng công cụ AI nhận diện các hoa văn kiến trúc phố cổ Hội An, Phố Hiến; thảo luận quyền riêng tư khi chụp ảnh di tích đưa lên môi trường số).',
      },
      {
        id: 'ls8-b10-b12-ck1',
        week: 'Tuần 11 – Tuần 18',
        lessonName: 'Bài 10. Sự hình thành của chủ nghĩa đế quốc ở các nước Âu – Mỹ (cuối thế kỉ XIX – đầu thế kỉ XX) (2 tiết); Bài 11. Phong trào công nhân từ cuối thế kỉ XVIII đến đầu thế kỉ XX và sự ra đời của chủ nghĩa xã hội khoa học (2 tiết); Bài 12. Chiến tranh thế giới thứ nhất (1914 – 1918) và Cách mạng tháng Mười Nga năm 1917 (2 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết PPCT 20 – 27',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Mô tả quá trình hình thành chủ nghĩa đế quốc; sự ra đời của giai cấp công nhân và chủ nghĩa xã hội khoa học; nguyên nhân, hậu quả Chiến tranh thế giới thứ nhất và ý nghĩa lịch sử của Cách mạng tháng Mười Nga năm 1917. Định hướng NLS - AI: Bài 10 tích hợp NLS 3.1.TC2a & AI NLd (D2) (Giải thích AI tốt hơn khi có thêm dữ liệu: Đánh giá tác động của các phát minh kỹ thuật cũ đối với tiền đề ra đời của thuật toán AI ngày nay).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-ls-hk2',
    grade: 8,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS8-HK2',
    chapterTitle: 'Phân môn Lịch sử 8 – Học kì II: Bài 13 đến Bài 19 & Chủ đề chung 1 (Châu Á thế kỉ XIX–XX, Việt Nam thời Nguyễn & Kháng chiến chống Pháp đến đầu thế kỉ XX)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (26 tiết)',
    totalPeriods: 26,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Khoa học kĩ thuật thế kỉ XVIII–XIX, Trung Quốc - Nhật Bản - Ấn Độ - Đông Nam Á (Bài 13–15), Việt Nam dưới thời Nguyễn, Kháng chiến chống Pháp (1858–1884), Phong trào Cần Vương, Yên Thế và Phong trào yêu nước đầu thế kỉ XX (Bài 16–19), Chủ đề chung 1: Văn minh châu thổ sông Hồng và sông Cửu Long. Định hướng NLS - AI & Lồng ghép: NLS 3.2.TC2a, 2.6.TC2a, 3.1.TC2a; AI NLd (D1), NLa (A1); GDQP-AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls8-b13-b15-gk2',
        week: 'Tuần 19 – Tuần 27',
        lessonName: 'Bài 13. Sự phát triển của khoa học, kĩ thuật, văn học, nghệ thuật trong các thế kỉ XVIII – XIX (2 tiết); Bài 14. Trung Quốc và Nhật Bản từ nửa sau thế kỉ XIX đến đầu thế kỉ XX (3 tiết); Bài 15. Ấn Độ và Đông Nam Á từ nửa sau thế kỉ XIX đến đầu thế kỉ XX (3 tiết); Ôn tập & Kiểm tra giữa kì 2 (2 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 36',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Phân tích tác động của sự phát triển khoa học, kĩ thuật thế kỉ XVIII–XIX; trình bày Cách mạng Tân Hợi, cuộc Duy tân Minh Trị và phong trào giải phóng dân tộc ở Ấn Độ, Đông Nam Á. Kiểm tra giữa kì 2. Định hướng NLS - AI & Lồng ghép: BĐKH (Bài 13); GDQP-AN (Bài 14); Bài 15 tích hợp NLS 3.2.TC2a & AI NLd (D1) (Xây dựng ý tưởng dự án: "Dùng AI để kể chuyện lịch sử giải phóng dân tộc bằng ngôn ngữ địa phương").',
      },
      {
        id: 'ls8-b16-b19-cd1-ck2',
        week: 'Tuần 27 – Tuần 35',
        lessonName: 'Bài 16. Việt Nam dưới thời Nguyễn (nửa đầu thế kỉ XIX) (4 tiết); Bài 17. Cuộc kháng chiến chống thực dân Pháp xâm lược từ năm 1858 đến năm 1884 (3 tiết); Bài 18. Phong trào chống Pháp trong những năm 1885 – 1896 (2 tiết); Bài 19. Phong trào yêu nước chống Pháp ở Việt Nam từ đầu thế kỉ XX đến năm 1917 (2 tiết); Chủ đề chung 1: Văn minh châu thổ sông Hồng và sông Cửu Long (4 tiết); Ôn tập & Kiểm tra cuối kì 2 (2 tiết)',
        periodAllocation: 'Tiết PPCT 37 – 53',
        periodsCount: 16,
        adjustedContent:
          'YCCĐ: Trình bày sự ra đời của nhà Nguyễn và quá trình thực thi chủ quyền đối với quần đảo Hoàng Sa, Trường Sa; cuộc kháng chiến chống Pháp (1858–1884), phong trào Cần Vương, khởi nghĩa Yên Thế; hoạt động yêu nước của Phan Bội Châu, Phan Châu Trinh, Nguyễn Tất Thành; văn minh châu thổ sông Hồng và sông Cửu Long. Định hướng NLS - AI & Lồng ghép: GDQP-AN & BĐKH (Bài 16); NLS 2.6.TC2a & GDQP-AN (Bài 17); NLS 3.1.TC2a & GDQP-AN (Bài 18); AI NLa (A1) tại Bài 19 (AI không thay thế được cảm xúc và ý tưởng riêng của con người: Sử dụng chatbot để đóng vai tranh luận giữa các xu hướng cứu nước của Phan Bội Châu và Phan Châu Trinh).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-dl-hk1',
    grade: 8,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL8-HK1',
    chapterTitle: 'Phân môn Địa lí 8 – Học kì I: Chương 1 & Chương 2 (Vị trí địa lí, Địa hình, Khoáng sản, Khí hậu & Thủy văn Việt Nam)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Vị trí địa lí và phạm vi lãnh thổ, Địa hình và khoáng sản Việt Nam (Bài 1–3), Khí hậu và thủy văn Việt Nam, Vai trò của tài nguyên khí hậu - nước và Tác động của biến đổi khí hậu (Bài 4–8). Định hướng NLS - AI & Lồng ghép: NLS 5.3.TC2a, 1.2.TC2b, 2.2.TC2c; AI NLd, NLb (B3), NLd (D2); GDQP-AN & BĐKH.',
    rawLessons: [
      {
        id: 'dl8-c1-b1-b3-gk1',
        week: 'HKI (Tiết PPCT 1 – 12)',
        lessonName: 'Chương 1. Vị trí địa lí và phạm vi lãnh thổ, địa hình và khoáng sản Việt Nam: Bài 1. Vị trí địa lí và phạm vi lãnh thổ Việt Nam (3 tiết); Bài 2. Địa hình Việt Nam (4 tiết); Ôn tập & Kiểm tra giữa kì I (2 tiết); Bài 3. Khoáng sản Việt Nam (3 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 12',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Trình bày đặc điểm vị trí địa lí, phạm vi lãnh thổ, đặc điểm các khu vực địa hình đồi núi, đồng bằng, bờ biển, thềm lục địa và tài nguyên khoáng sản Việt Nam. Kiểm tra giữa kì I. Định hướng NLS - AI & Lồng ghép: Bài 1 tích hợp GDQP&AN (Mốc quốc giới, bảo vệ chủ quyền lãnh thổ trên đất liền và Biển Đông) & BĐKH; Bài 2 tích hợp BĐKH, NLS 5.3.TC2a & AI NLd (Tìm hiểu hệ thống AI phân tích hình ảnh từ không gian để nhận diện sự thay đổi của các khối núi và vùng bờ biển); Bài 3 tích hợp BĐKH.',
      },
      {
        id: 'dl8-c2-b4-b8-ck1',
        week: 'HKI (Tiết PPCT 13 – 27)',
        lessonName: 'Chương 2. Khí hậu và thủy văn Việt Nam: Bài 4. Khí hậu Việt Nam (4 tiết); Bài 5. Thực hành: Vẽ và phân tích biểu đồ khí hậu (1 tiết); Bài 6. Thủy văn Việt Nam (4 tiết); Bài 7. Vai trò của biển đối với khí hậu và tài nguyên thiên nhiên nước ta (2 tiết); Bài 8. Tác động của biến đổi khí hậu đối với khí hậu và thủy văn Việt Nam (2 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết PPCT 13 – 27',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Trình bày tính chất nhiệt đới ẩm gió mùa và sự phân hóa khí hậu Việt Nam; vẽ và phân tích biểu đồ khí hậu; xác định lưu vực các hệ thống sông lớn; phân tích tác động của biến đổi khí hậu và đề xuất giải pháp ứng phó. Định hướng NLS - AI & BĐKH: NLS 5.3.TC2a (Bài 4); Bài 6 tích hợp BĐKH & AI NLb (B3) (Tìm hiểu hệ thống AI giám sát mực nước tự động tại các trạm thủy văn, phân tích tính minh bạch khi AI đưa ra cảnh báo xả lũ); Bài 7 tích hợp BĐKH & NLS 1.2.TC2b; Bài 8 tích hợp BĐKH, NLS 2.2.TC2c & AI NLd (D2) (Xem mô phỏng AI về kịch bản nước biển dâng tại ĐBSCL).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-dl-hk2',
    grade: 8,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL8-HK2',
    chapterTitle: 'Phân môn Địa lí 8 – Học kì II: Chương 3, Chương 4 & Chủ đề 2 (Thổ nhưỡng, Sinh vật & Biển đảo Việt Nam)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (25 tiết)',
    totalPeriods: 25,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Thổ nhưỡng và sinh vật Việt Nam (Bài 9–10), Phạm vi Biển Đông, môi trường và tài nguyên biển đảo Việt Nam (Bài 11–12), Chủ đề 2: Bảo vệ chủ quyền, các quyền và lợi ích hợp pháp của Việt Nam ở Biển Đông. Định hướng NLS - AI: NLS 1.1.TC2a, 3.3.TC2a; AI NLd (D1, D2), NLc (C5).',
    rawLessons: [
      {
        id: 'dl8-c3-b9-b10',
        week: 'HKII (Tiết PPCT 28 – 37)',
        lessonName: 'Chương 3. Thổ nhưỡng và sinh vật Việt Nam (10 tiết): Bài 9. Thổ nhưỡng Việt Nam (5 tiết); Bài 10. Sinh vật Việt Nam (5 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 37',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Chứng minh tính chất nhiệt đới gió mùa của lớp phủ thổ nhưỡng, đặc điểm phân bố 3 nhóm đất chính và tính cấp thiết của vấn đề chống thoái hóa đất; chứng minh sự đa dạng sinh vật và bảo tồn đa dạng sinh học ở Việt Nam. Định hướng NLS - AI: Bài 9 tích hợp AI NLd (D1) (Tìm hiểu mô hình AI trong nông nghiệp thông minh: phân tích thành phần đất để gợi ý loại cây trồng phù hợp tại địa phương); Bài 10 tích hợp NLS 1.1.TC2a.',
      },
      {
        id: 'dl8-c4-b11-b12-cd2-ck2',
        week: 'HKII (Tiết PPCT 38 – 52)',
        lessonName: 'Chương 4. Biển đảo Việt Nam & Chủ đề 2: Bài 11. Phạm vi Biển Đông. Vùng biển đảo và đặc điểm tự nhiên vùng biển đảo Việt Nam (4 tiết); Ôn tập & Kiểm tra giữa kì II (2 tiết); Bài 12. Môi trường và tài nguyên biển đảo (4 tiết); Chủ đề 2: Bảo vệ chủ quyền, các quyền và lợi ích hợp pháp của Việt Nam ở Biển Đông (4 tiết); Ôn tập & Kiểm tra cuối kì II (2 tiết)',
        periodAllocation: 'Tiết PPCT 38 – 52',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Xác định trên bản đồ phạm vi Biển Đông, các vùng biển của Việt Nam theo Luật Biển Việt Nam; trình bày đặc điểm tự nhiên, môi trường, tài nguyên biển đảo và quá trình xác lập, bảo vệ chủ quyền biển đảo Việt Nam trong lịch sử. Định hướng NLS - AI: Bài 11 tích hợp NLS 1.1.TC2a & AI NLc (C5) (Tìm hiểu việc sử dụng AI phân tích ảnh vệ tinh để nhận diện đặc điểm tự nhiên vùng biển đảo và giám sát môi trường biển); Bài 12 tích hợp NLS 3.3.TC2a & AI NLd (D2) (Lập kế hoạch dự án nhỏ: "Ứng dụng chatbot AI để giới thiệu du lịch biển đảo Việt Nam an toàn và có trách nhiệm").',
      },
    ],
  }),
];

export const GRADE9_LS_DL_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-ls-hk1',
    grade: 9,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS9-HK1',
    chapterTitle: 'Phân môn Lịch sử 9 – Học kì I: Chương 1, 2, 3 (Thế giới & Việt Nam 1918–1945; Thế giới từ năm 1945 đến năm 1991)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Thế giới từ năm 1918 đến năm 1945 (Bài 1–4), Việt Nam từ năm 1918 đến năm 1945: Phong trào dân tộc dân chủ, Nguyễn Ái Quốc và sự thành lập Đảng Cộng sản Việt Nam, Cách mạng tháng Tám năm 1945 (Bài 5–8), Thế giới từ năm 1945 đến năm 1991: Chiến tranh lạnh, Liên Xô, Mỹ, Tây Âu, Mĩ La-tinh và châu Á (Bài 9–12). Định hướng NLS - AI & Lồng ghép: NLS 1.1.TC2d, 5.2.TC2b; AI NLb (A3), NLc (D2); GDQP&AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls9-c1-b1-b4',
        week: 'Tuần 1 – Tuần 6',
        lessonName: 'Chương 1. Thế giới từ năm 1918 đến năm 1945 (6 tiết): Bài 1. Nước Nga và Liên Xô từ năm 1918 đến năm 1945 (1 tiết); Bài 2. Châu Âu và nước Mỹ từ năm 1918 đến năm 1945 (2 tiết); Bài 3. Châu Á từ năm 1918 đến năm 1945 (2 tiết); Bài 4. Chiến tranh thế giới thứ hai (1 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 6',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Trình bày thành tựu và hạn chế của công cuộc xây dựng CNXH ở Liên Xô; đại suy thoái kinh tế 1929–1933 và sự hình thành chủ nghĩa phát xít; tình hình châu Á 1918–1945; nguyên nhân, diễn biến, hậu quả Chiến tranh thế giới thứ hai và vai trò của Liên Xô, các nước Đồng minh. Định hướng NLS - AI & Lồng ghép: Bài 1 tích hợp AI NLb (A3) (Sử dụng AI để tóm tắt các thành tựu kinh tế của Liên Xô dựa trên tư liệu bảng số liệu); Bài 2 tích hợp BĐKH; Bài 3 tích hợp NLS 1.1.TC2d; Bài 4 tích hợp BĐKH & GDQP&AN (Trách nhiệm bảo vệ Tổ quốc và giữ gìn hòa bình).',
      },
      {
        id: 'ls9-c2-b5-b8-gk1',
        week: 'Tuần 7 – Tuần 13',
        lessonName: 'Chương 2. Việt Nam từ năm 1918 đến năm 1945 (9 tiết): Bài 5. Phong trào dân tộc dân chủ trong những năm 1918 – 1930 (1 tiết); Ôn tập & Kiểm tra giữa kì I (2 tiết); Bài 6. Hoạt động của Nguyễn Ái Quốc và sự thành lập Đảng Cộng sản Việt Nam (2 tiết); Bài 7. Phong trào cách mạng Việt Nam thời kì 1930 – 1939 (2 tiết); Bài 8. Cách mạng tháng Tám năm 1945 (3 tiết)',
        periodAllocation: 'Tiết PPCT 7 – 16',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Mô tả nét chính của phong trào dân tộc dân chủ 1918–1930; đánh giá vai trò của Nguyễn Ái Quốc trong quá trình thành lập Đảng Cộng sản Việt Nam; mô tả phong trào cách mạng 1930–1931 và 1936–1939; trình bày thời cơ, diễn biến chính, ý nghĩa lịch sử của Cách mạng tháng Tám năm 1945 và sự ra đời nước Việt Nam Dân chủ Cộng hòa. Định hướng AI & Lồng ghép: Bài 5 tích hợp AI NLc (D2) (Lập kịch bản hội thoại chatbot đóng vai thành viên tổ chức cách mạng để giới thiệu về tôn chỉ hoạt động); Bài 8 tích hợp GDQP&AN.',
      },
      {
        id: 'ls9-c3-b9-b12-ck1',
        week: 'Tuần 13 – Tuần 18',
        lessonName: 'Chương 3. Thế giới từ năm 1945 đến năm 1991: Bài 9. Chiến tranh lạnh (1 tiết); Bài 10. Liên Xô và Đông Âu từ năm 1945 đến năm 1991 (2 tiết); Bài 11. Nước Mĩ và Tây Âu từ năm 1945 đến năm 1991 (2 tiết); Bài 12. Khu vực Mĩ La-tinh và châu Á từ năm 1945 đến năm 1991 (4 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: 'Tiết PPCT 17 – 27',
        periodsCount: 11,
        adjustedContent:
          'YCCĐ: Nhận biết nguyên nhân, biểu hiện và hậu quả của Chiến tranh lạnh; giải thích sự sụp đổ của chế độ XHCN ở Liên Xô và Đông Âu; nêu nét chính về Mỹ, Tây Âu, Mĩ La-tinh, châu Á và sự hình thành ASEAN. Định hướng NLS - AI & BĐKH: Bài 9 tích hợp BĐKH; Bài 10 tích hợp AI NLb (A3) (Sử dụng AI phân tích các nguyên nhân sụp đổ của CNXH tại Đông Âu từ nhiều góc độ tư liệu khác nhau); Bài 11 tích hợp NLS 5.2.TC2b.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-ls-hk2',
    grade: 9,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'LS9-HK2',
    chapterTitle: 'Phân môn Lịch sử 9 – Học kì II: Chương 4, 5, 6 & Chủ đề chung (Kháng chiến chống Pháp, chống Mỹ; Thế giới & Việt Nam từ 1975 đến nay)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (26 tiết)',
    totalPeriods: 26,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Việt Nam kháng chiến chống Pháp (1945–1954) và kháng chiến chống Mỹ, cứu nước (1954–1975) (Bài 13–17), Trật tự thế giới mới và Châu Á từ năm 1991 đến nay (Bài 18–19), Việt Nam từ năm 1976 đến nay, Cách mạng KH-KT và xu thế toàn cầu hóa (Bài 20–21), Chủ đề chung Đô thị & Chủ đề chung 3 Bảo vệ chủ quyền Biển Đông. Định hướng NLS - AI & Lồng ghép: NLS 1.3.TC2a, 1.1.TC2d, 2.4.TC2a, 6.3.TC2a, 5.3.TC2a, 6.1.TC2a, 2.2.TC2c; AI NLc (C2), NL1 (A3); GDQP&AN & BĐKH.',
    rawLessons: [
      {
        id: 'ls9-c4-b13-b17',
        week: 'Tuần 19 – Tuần 23',
        lessonName: 'Chương 4. Việt Nam từ năm 1945 đến năm 1991: Bài 13. Việt Nam trong năm đầu sau Cách mạng tháng Tám năm 1945 (1 tiết); Bài 14. Việt Nam kháng chiến chống thực dân Pháp xâm lược giai đoạn 1946 – 1950 (2 tiết); Bài 15. Việt Nam kháng chiến chống thực dân Pháp xâm lược giai đoạn 1951 – 1954 (2 tiết); Bài 16. Việt Nam kháng chiến chống Mỹ, cứu nước, thống nhất đất nước giai đoạn 1954 – 1965 (2 tiết); Bài 17. Việt Nam kháng chiến chống Mỹ, cứu nước, thống nhất đất nước giai đoạn 1965 – 1975 (3 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 37',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Nêu biện pháp xây dựng và củng cố chính quyền cách mạng năm 1945–1946; trình bày các thắng lợi tiêu biểu trong kháng chiến chống Pháp (Việt Bắc 1947, Biên giới 1950, Điện Biên Phủ 1954) và kháng chiến chống Mỹ, cứu nước (Đồng khởi, Mậu Thân 1968, Đại thắng mùa Xuân 1975). Định hướng NLS - AI & Lồng ghép: Bài 13 tích hợp NLS 1.3.TC2a & AI NLc (C2) (Mô phỏng ứng dụng AI trong việc dạy học ngôn ngữ - diệt giặc dốt theo định hướng hiện đại); Bài 14, 15 tích hợp GDQP&AN; Bài 16 tích hợp NLS 1.1.TC2d & GDQP&AN; Bài 17 tích hợp NLS 2.4.TC2a & GDQP&AN.',
      },
      {
        id: 'ls9-b18-cd-gk2-b19',
        week: 'Tuần 24 – Tuần 27',
        lessonName: 'Bài 18. Trật tự thế giới mới từ năm 1991 đến nay. Liên bang Nga và nước Mỹ từ năm 1991 đến nay (2 tiết); Chủ đề chung: Đô thị: Lịch sử và hiện tại (2 tiết); Ôn tập & Kiểm tra giữa kì II (2 tiết); Bài 19. Châu Á từ năm 1991 đến nay (2 tiết)',
        periodAllocation: 'Tiết PPCT 38 – 45',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nhận biết xu hướng hình thành trật tự thế giới mới sau Chiến tranh lạnh; tình hình Liên bang Nga, Mỹ và sự phát triển của châu Á, Cộng đồng ASEAN từ năm 1991 đến nay. Kiểm tra giữa kì II. Định hướng NLS - AI & Lồng ghép: Bài 18 tích hợp GDQP&AN; Chủ đề chung tích hợp NLS 6.3.TC2a & GDQP&AN; Bài 19 tích hợp AI NLc (C2) (Thực hành tạo mô hình AI đơn giản nhận diện các biểu tượng văn hóa tiêu biểu của các nước ASEAN).',
      },
      {
        id: 'ls9-b20-b21-cd3-ck2',
        week: 'Tuần 28 – Tuần 35',
        lessonName: 'Bài 20. Việt Nam từ năm 1976 đến nay (3 tiết); Bài 21. Cách mạng KH-KT và xu thế toàn cầu hóa (1 tiết); Chủ đề chung 3: Bảo vệ chủ quyền, các quyền và lợi ích hợp pháp của Việt Nam ở Biển Đông (2 tiết); Ôn tập & Kiểm tra cuối kì II (2 tiết)',
        periodAllocation: 'Tiết PPCT 46 – 53',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Trình bày công cuộc Đổi mới đất nước từ năm 1986 đến nay; thành tựu cách mạng khoa học – kĩ thuật và xu thế toàn cầu hóa; chứng cứ lịch sử, pháp lí về chủ quyền biển đảo Việt Nam ở Biển Đông. Định hướng NLS - AI & Lồng ghép: Bài 20 tích hợp NLS 5.3.TC2a, GDQP-AN & BĐKH; Bài 21 tích hợp NLS 6.1.TC2a & AI NL1 (A3) (Phân tích AI là hạt nhân tạo ra xã hội thông minh và liệt kê các nghề nghiệp thay đổi do AI); Chủ đề chung 3 tích hợp NLS 2.2.TC2c & GDQP-AN.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-dl-hk1',
    grade: 9,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL9-HK1',
    chapterTitle: 'Phân môn Địa lí 9 – Học kì I: Chương 1, Chương 2 & Chương 3 (Địa lí dân cư, Các ngành kinh tế, Trung du miền núi phía Bắc & Đồng bằng sông Hồng)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (27 tiết)',
    totalPeriods: 27,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Địa lí dân cư Việt Nam (Bài 1–4), Địa lí các ngành kinh tế: Nông - Lâm - Thủy sản, Công nghiệp, Dịch vụ (Bài 5–11), Vùng Trung du và miền núi phía Bắc, Vùng Đồng bằng sông Hồng (Bài 12–13). Định hướng NLS - AI & Lồng ghép: NLS 1.3.TC2b, 5.2.TC2a, 3.1.TC2a, 6.2.TC2b, 2.1.TC2b; AI NLc (C2, C3), NLb (A3); GDQP&AN & BĐKH.',
    rawLessons: [
      {
        id: 'dl9-c1-b1-b4',
        week: 'HKI (Tiết PPCT 1 – 5)',
        lessonName: 'Chương 1. Địa lí dân cư Việt Nam: Bài 1. Dân tộc và dân số (2 tiết); Bài 2. Phân bố dân cư và các loại hình quần cư (1 tiết); Bài 3. Lao động và việc làm (1 tiết); Bài 4. Thực hành: Tìm hiểu vấn đề việc làm ở địa phương và phân hóa thu nhập theo vùng (1 tiết)',
        periodAllocation: 'Tiết PPCT 1 – 5',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Trình bày đặc điểm phân bố các dân tộc, quy mô dân số, cơ cấu dân số, phân bố dân cư, quần cư thành thị và nông thôn; phân tích vấn đề lao động, việc làm và phân hóa thu nhập theo vùng. Định hướng NLS & BĐKH: Bài 1 tích hợp BĐKH & NLS 1.3.TC2b; Bài 2 tích hợp BĐKH; Bài 3 tích hợp NLS 5.2.TC2a.',
      },
      {
        id: 'dl9-c2-b5-b11-gk1',
        week: 'HKI (Tiết PPCT 6 – 19)',
        lessonName: 'Chương 2. Địa lí các ngành kinh tế Việt Nam: Bài 5. Nông nghiệp (2 tiết); Bài 6. Lâm nghiệp và thủy sản (3 tiết); Bài 7. Thực hành: Viết báo cáo về một mô hình sản xuất nông nghiệp có hiệu quả (1 tiết); Bài 8. Công nghiệp (2 tiết); Bài 9. Thực hành: Xác định một số hình thức tổ chức lãnh thổ công nghiệp ở nước ta (1 tiết); Bài 10. Dịch vụ (2 tiết); Ôn tập & Kiểm tra giữa kì I (2 tiết); Bài 11. Thực hành: Tìm hiểu xu hướng phát triển ngành thương mại, du lịch (1 tiết)',
        periodAllocation: 'Tiết PPCT 6 – 19',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Phân tích các nhân tố ảnh hưởng, sự phát triển và phân bố nông nghiệp, lâm nghiệp, thủy sản, công nghiệp và dịch vụ; giải thích vì sao cần phát triển nông nghiệp xanh, công nghiệp xanh. Định hướng NLS - AI & BĐKH: Bài 5 tích hợp AI NLc (C2) (Thực hành tạo mô hình AI nhận diện sâu bệnh trên cây trồng bằng Teachable Machine); Bài 6 tích hợp BĐKH & NLS 3.1.TC2a; Bài 7 tích hợp AI NLc (C3) (Thực hiện cải thiện bộ dữ liệu hình ảnh, thông số để tăng độ chính xác cho báo cáo về nông nghiệp xanh); Bài 8 tích hợp BĐKH; Bài 9 tích hợp AI NLc (C2) (Vận dụng AI đề xuất mô hình quản lý kho bãi tự động tại các khu công nghệ cao); Bài 10 tích hợp BĐKH & NLS 6.2.TC2b; Bài 11 tích hợp AI NLb (A3) (Phản biện các gợi ý điểm đến từ AI dựa trên tính bền vững và đạo đức du lịch).',
      },
      {
        id: 'dl9-c3-b12-b13-ck1',
        week: 'HKI (Tiết PPCT 20 – 27)',
        lessonName: 'Chương 3. Địa lí các vùng kinh tế - xã hội (HKI): Bài 12. Vùng Trung du và miền núi phía Bắc (3 tiết); Bài 13. Vùng Đồng bằng sông Hồng (3 tiết); Ôn tập & Kiểm tra cuối học kì I (2 tiết)',
        periodAllocation: 'Tiết PPCT 20 – 27',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Trình bày vị trí địa lí, thế mạnh tự nhiên, dân cư và sự phát triển kinh tế - xã hội của Vùng Trung du và miền núi phía Bắc và Vùng Đồng bằng sông Hồng; phân tích vị thế của Thủ đô Hà Nội. Kiểm tra cuối kì I. Định hướng NLS & Lồng ghép: Bài 12 tích hợp BĐKH; Bài 13 tích hợp GDQP&AN, BĐKH & NLS 2.1.TC2b.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-dl-hk2',
    grade: 9,
    subject: 'Lịch sử và Địa lí',
    chapterCode: 'DL9-HK2',
    chapterTitle: 'Phân môn Địa lí 9 – Học kì II: Chương 3 (tiếp) & Chủ đề 2 (Bắc Trung Bộ, Duyên hải Nam Trung Bộ - Tây Nguyên, Đông Nam Bộ, ĐBSCL & Kinh tế biển đảo)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (25 tiết)',
    totalPeriods: 25,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Bắc Trung Bộ (Bài 14–15), Duyên hải Nam Trung Bộ và Tây Nguyên (Bài 16), Đông Nam Bộ (Bài 17–18), Đồng bằng sông Cửu Long (Bài 19–20), Phát triển tổng hợp kinh tế và bảo vệ tài nguyên, môi trường biển đảo (Bài 21), Chủ đề 2: Văn minh châu thổ sông Hồng và sông Cửu Long. Định hướng NLS - AI & Lồng ghép: NLS 2.4.TC2a, 1.3.TC2b, 6.3.TC2a, 4.2.TC2a, 3.3.TC2a; AI NLc (B2, C2), NLb (A3); GDQP&AN & BĐKH.',
    rawLessons: [
      {
        id: 'dl9-b14-b17-gk2',
        week: 'HKII (Tiết PPCT 28 – 38)',
        lessonName: 'Bài 14. Vùng Bắc Trung Bộ (3 tiết); Bài 15. Thực hành: Tìm hiểu vấn đề phòng, chống thiên tai và ứng phó với biến đổi khí hậu ở Bắc Trung Bộ (1 tiết); Bài 16. Vùng Duyên hải Nam Trung Bộ và Tây Nguyên (4 tiết); Bài 17. Vùng Đông Nam Bộ (Tiết 1) (1 tiết); Ôn tập & Kiểm tra giữa học kì 2 (2 tiết)',
        periodAllocation: 'Tiết PPCT 28 – 38',
        periodsCount: 11,
        adjustedContent:
          'YCCĐ: Phân tích vị trí địa lí, thế mạnh tự nhiên, kinh tế biển và vấn đề phòng chống thiên tai ở Bắc Trung Bộ, Duyên hải Nam Trung Bộ và Tây Nguyên; bước đầu tìm hiểu vùng Đông Nam Bộ. Kiểm tra giữa học kì 2. Định hướng NLS - AI & Lồng ghép: Bài 14 tích hợp GDQP&AN & BĐKH; Bài 15 tích hợp AI NLc (B2) (Thảo luận trách nhiệm của cá nhân trong việc phản hồi và giám sát độ chính xác của các cảnh báo thiên tai bằng AI); Bài 16 tích hợp GDQP&AN, BĐKH & NLS 2.4.TC2a; Bài 17 tích hợp GDQP&AN, BĐKH & NLS 1.3.TC2b.',
      },
      {
        id: 'dl9-b17tt-b21-cd2-ck2',
        week: 'HKII (Tiết PPCT 39 – 52)',
        lessonName: 'Bài 17. Vùng Đông Nam Bộ (tiếp theo) (2 tiết); Bài 18. Thực hành: Phân tích ý nghĩa của việc tăng cường kết nối liên vùng đối với sự phát triển của vùng Đông Nam Bộ (1 tiết); Bài 19. Vùng Đồng bằng sông Cửu Long (3 tiết); Bài 20. Thực hành: Tìm hiểu về tác động của biến đổi khí hậu đối với vùng Đồng bằng sông Cửu Long (1 tiết); Bài 21. Phát triển tổng hợp kinh tế và bảo vệ tài nguyên, môi trường biển, đảo (2 tiết); Chủ đề 2: Văn minh châu thổ sông Hồng và sông Cửu Long (3 tiết); Ôn tập & Kiểm tra cuối học kì II (2 tiết)',
        periodAllocation: 'Tiết PPCT 39 – 52',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Phân tích vị thế của TP. Hồ Chí Minh và kết nối liên vùng Đông Nam Bộ; trình bày thế mạnh và giải pháp ứng phó biến đổi khí hậu ở Đồng bằng sông Cửu Long; phân tích phát triển tổng hợp kinh tế biển đảo gắn với bảo vệ chủ quyền ở Biển Đông; trình bày văn minh châu thổ sông Hồng và sông Cửu Long. Định hướng NLS - AI & Lồng ghép: Bài 18 tích hợp AI NLb (A3) (Sử dụng AI để phân tích các luồng dữ liệu giao thông và đề xuất phương án kết nối tối ưu); Bài 19 tích hợp GDQP&AN, BĐKH & NLS 6.3.TC2a; Bài 21 tích hợp GDQP&AN & NLS 4.2.TC2a; Chủ đề 2 tích hợp NLS 3.3.TC2a & AI NLc (C2) (Sử dụng AI để mô phỏng và phục dựng không gian văn hóa dòng sông).',
      },
    ],
  }),
];
