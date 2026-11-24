import { CurriculumTopic } from '../types/domain';
import { buildThcsTopic } from './thcsToanAndTinPlan2026';
import { NDA_THCS_KHXH_SOURCE_DOC } from './thcsKhxhNguVanAndLsDlPlan2026';

// ============================================================================
// 1.5. NỘI DUNG GIÁO DỤC ĐỊA PHƯƠNG (GDĐP 6, 7, 8, 9) – THÀNH PHỐ HUẾ (35 TIẾT/NĂM)
// ============================================================================

export const GRADE6_GDDP_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-gddp-hk1',
    grade: 6,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP6-HK1',
    chapterTitle:
      'GDĐP 6 – Học kì I: Mạch Lịch sử – Văn hóa (Thời nguyên thủy, Văn hóa Sa Huỳnh, Thời kì Champa ở Huế) & Kinh tế – Chính trị – Xã hội (Cộng đồng dân cư Huế)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Mạch Lịch sử – Văn hóa (Bài 1–3, 8 tiết) & Mạch Kinh tế – Chính trị – Xã hội (Bài 1–2, 8 tiết) + Kiểm tra giữa kì I & cuối kì I (2 tiết). Lồng ghép & Định hướng NLS: Tích hợp NLS 1.1.TC1a (Bài 2 Văn hóa Sa Huỳnh ở Huế, Bài 3 Huế thời kì Champa).',
    rawLessons: [
      {
        id: 'gddp6-lsvh-b1',
        week: 'HKI (Tiết PPCT 1, 2, 3)',
        lessonName: 'Mạch Lịch sử – Văn hóa – Bài 1: Dấu tích thời nguyên thủy ở Huế',
        periodAllocation: 'Tiết PPCT 1, 2, 3',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nhận biết được các di tích/di chỉ tiêu biểu gắn với thời kì đá mới ở Thành phố Huế thời tiền sử, từ đó khẳng định được nguồn gốc lâu đời của vùng đất Huế; liên hệ được các di tích, di chỉ tiêu biểu thời nguyên thủy trên địa bàn tỉnh gắn với địa danh hành chính hiện nay; trân trọng, tự hào, có ý thức gìn giữ, bảo tồn và quảng bá những di sản quý báu đó. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp6-lsvh-b2',
        week: 'HKI (Tiết PPCT 4, 5, 6)',
        lessonName: 'Mạch Lịch sử – Văn hóa – Bài 2: Dấu tích của văn hóa Sa Huỳnh ở Huế',
        periodAllocation: 'Tiết PPCT 4, 5, 6',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nhận biết được các di tích/di chỉ tiêu biểu gắn với thời kì văn hóa Sa Huỳnh ở Thành phố Huế thời tiền sử, từ đó khẳng định được nguồn gốc lâu đời của vùng đất Huế; liên hệ được các di tích, di chỉ tiêu biểu thời Văn hóa Sa Huỳnh trên địa bàn TP gắn với địa danh hành chính hiện nay; trân trọng, tự hào, có ý thức gìn giữ, bảo tồn và quảng bá những di sản quý báu đó. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a (Tìm kiếm, khai thác thông tin số về di tích văn hóa Sa Huỳnh tại Thành phố Huế). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp6-lsvh-b3-gk1',
        week: 'HKI (Tiết PPCT 7, 8, 9)',
        lessonName: 'Mạch Lịch sử – Văn hóa – Bài 3: Huế thời kì Champa (2 tiết) & Kiểm tra giữa kỳ I (1 tiết)',
        periodAllocation: 'Tiết PPCT 7, 8, 9',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Trình bày được những nét chính của Thành phố Huế thời Champa; liên hệ được các di tích, di chỉ tiêu biểu thời kì Champa trên địa bàn tỉnh gắn với địa danh hành chính hiện nay; trân trọng, tự hào, có ý thức gìn giữ, bảo tồn và quảng bá những di sản quý báu đó. Kiểm tra giữa kỳ I (Tiết 9). Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp6-ktxh-b1',
        week: 'HKI (Tiết PPCT 10, 11, 12, 13)',
        lessonName: 'Mạch Kinh tế – Chính trị – Xã hội – Bài 1: Sự hình thành và phát triển cộng đồng dân cư Huế',
        periodAllocation: 'Tiết PPCT 10, 11, 12, 13',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết sơ lược về quá trình hình thành, tồn tại và phát triển của một cộng đồng dân cư; nêu được đặc điểm cơ bản của một cộng đồng dân cư; liên hệ thực tế địa phương Thành phố Huế. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp6-ktxh-b2-ck1',
        week: 'HKI (Tiết PPCT 14, 15, 16, 17, 18)',
        lessonName: 'Mạch Kinh tế – Chính trị – Xã hội – Bài 2: Đặc điểm cơ bản của cộng đồng dân cư Huế (4 tiết) & Kiểm tra cuối kỳ I (1 tiết)',
        periodAllocation: 'Tiết PPCT 14, 15, 16, 17, 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết sơ lược về quá trình hình thành, tồn tại và phát triển của một cộng đồng dân cư; nêu được đặc điểm cơ bản của cộng đồng dân cư Huế và liên hệ thực tế địa phương. Kiểm tra cuối kỳ I (Tiết 18). Lồng ghép GDĐP.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-gddp-hk2',
    grade: 6,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP6-HK2',
    chapterTitle:
      'GDĐP 6 – Học kì II: Mạch Văn học (Truyện kể dân gian, Ca dao, Từ ngữ địa phương Huế), Mạch Nghệ thuật (Âm nhạc truyền thống & Nhã nhạc cung đình) & Mạch Địa lý môi trường',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Mạch Văn học (Bài 1–3: Truyện kể dân gian Huế, Ca dao Huế, Từ ngữ địa phương Huế), Mạch Nghệ thuật (Bài 1–2: Âm nhạc truyền thống dân gian & Nhã nhạc cung đình Huế), Mạch Địa lý môi trường (Bài 1–2: Vị trí địa lí, phạm vi lãnh thổ & Các đơn vị hành chính Huế). Định hướng NLS: Tích hợp NLS 1.1.TC1a.',
    rawLessons: [
      {
        id: 'gddp6-vh-b1-b2',
        week: 'HKII (Tiết PPCT 19 – 23)',
        lessonName: 'Mạch Văn học – Bài 1: Truyện kể dân gian Huế (3 tiết, PPCT 19–21) & Bài 2: Ca dao Huế (2 tiết, PPCT 22–23)',
        periodAllocation: 'Tiết PPCT 19, 20, 21, 22, 23',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết được một số yếu tố hình thức và nội dung của truyện kể dân gian Huế; kể được một truyện truyền thuyết hoặc cổ tích Huế; nhận biết được một số yếu tố hình thức và nội dung của ca dao Huế; nhớ được một số bài ca dao tiêu biểu của Huế. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a tại Bài 1 (Truyện kể dân gian Huế). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp6-vh-b3-gk2',
        week: 'HKII (Tiết PPCT 24, 25, 26)',
        lessonName: 'Mạch Văn học – Bài 3: Từ ngữ địa phương Huế (2 tiết, PPCT 24–25) & Kiểm tra giữa kỳ II (1 tiết, PPCT 26)',
        periodAllocation: 'Tiết PPCT 24, 25, 26',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Biết được một số đặc điểm cơ bản của từ ngữ địa phương Huế, bước đầu biết cách sử dụng từ ngữ địa phương phù hợp; nhận biết, hiểu được nghĩa và tác dụng của một số từ ngữ địa phương được dùng trong ca dao Huế; biết trân trọng, tự hào, có ý thức giữ gìn, phát huy giá trị văn hóa, ngôn ngữ và tiếng nói địa phương. Kiểm tra giữa kỳ II (Tiết 26). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp6-nt-b1-b2',
        week: 'HKII (Tiết PPCT 27 – 31)',
        lessonName: 'Mạch Nghệ thuật – Bài 1: Âm nhạc truyền thống dân gian Huế (3 tiết, PPCT 27–29) & Bài 2: Âm nhạc truyền thống chuyên nghiệp Huế - Nhã nhạc cung đình (2 tiết, PPCT 30–31)',
        periodAllocation: 'Tiết PPCT 27, 28, 29, 30, 31',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Trình bày được các hoạt động chính của âm nhạc truyền thống Huế trong đời sống hiện đại; trình bày được những nét chính về các thể loại âm nhạc truyền thống chuyên nghiệp ở Huế và Nhã nhạc cung đình Huế; biết tự hào về nền âm nhạc truyền thống của quê hương. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a tại Bài 2 (Âm nhạc truyền thống chuyên nghiệp Huế - Nhã nhạc cung đình). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp6-dlmt-b1-b2-ck2',
        week: 'HKII (Tiết PPCT 32 – 35)',
        lessonName: 'Mạch Địa lý môi trường – Bài 1: Vị trí địa lí và phạm vi lãnh thổ Huế (2 tiết, PPCT 32–33); Bài 2: Các đơn vị hành chính Huế (1 tiết, PPCT 34) & Kiểm tra cuối kỳ II (1 tiết, PPCT 35)',
        periodAllocation: 'Tiết PPCT 32, 33, 34, 35',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Xác định được vị trí địa lí, phạm vi lãnh thổ của tỉnh/thành phố trên bản đồ, nhận biết các tỉnh, quốc gia tiếp giáp; kể tên được các đơn vị hành chính của Thành phố Huế; nêu được ý nghĩa về vị trí địa lí của Huế. Kiểm tra cuối kỳ II (Tiết 35). Lồng ghép GDĐP.',
      },
    ],
  }),
];

export const GRADE7_GDDP_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-gddp-hk1',
    grade: 7,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP7-HK1',
    chapterTitle:
      'GDĐP 7 – Học kì I: Chủ đề Thiên nhiên Thành phố Huế, Chủ đề Chính sách an sinh xã hội Thành phố Huế & Chủ đề Văn học trung đại Thành phố Huế',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Thiên nhiên Thành phố Huế (Bài 1–3, 4 tiết); Chủ đề 2: Chính sách an sinh xã hội Thành phố Huế (4 tiết); Kiểm tra giữa kỳ I (1 tiết); Chủ đề 4: Văn học trung đại Thành phố Huế (Bài 1–2, 8 tiết); Kiểm tra cuối kỳ I (1 tiết). Lồng ghép GDĐP & BVMT.',
    rawLessons: [
      {
        id: 'gddp7-tn-b1-b3',
        week: 'HKI (Tiết PPCT 1, 2, 3, 4)',
        lessonName: 'Chủ đề: Thiên nhiên Thành phố Huế – Bài 1: Địa hình và Khoáng sản (2 tiết); Bài 2: Khí hậu và Thủy văn (1 tiết); Bài 3: Đất và Sinh vật (1 tiết)',
        periodAllocation: 'Tiết PPCT 1, 2, 3, 4',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Trình bày được đặc điểm cơ bản về tự nhiên, tài nguyên thiên nhiên và mối quan hệ giữa các yếu tố của tự nhiên Thành phố Huế; nêu được những thuận lợi, khó khăn về điều kiện tự nhiên và tài nguyên thiên nhiên đối với đời sống và sản xuất của Thành phố Huế, liên hệ thực tế nơi em ở; xác định được một số đối tượng của tự nhiên trên bản đồ. Lồng ghép GDĐP & BVMT.',
      },
      {
        id: 'gddp7-asxh-gk1',
        week: 'HKI (Tiết PPCT 5 – 9)',
        lessonName: 'Chủ đề: Chính sách an sinh xã hội Thành phố Huế (4 tiết, PPCT 5–8) & Kiểm tra giữa kỳ I (1 tiết, PPCT 9)',
        periodAllocation: 'Tiết PPCT 5, 6, 7, 8, 9',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết được cơ bản vai trò của an sinh xã hội; nêu được những chính sách an sinh xã hội của Thành phố Huế. Kiểm tra giữa kỳ I (Tiết 9). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp7-vhtd-b1',
        week: 'HKI (Tiết PPCT 10, 11, 12, 13)',
        lessonName: 'Chủ đề: Văn học trung đại Thành phố Huế – Bài 1: Thơ ca trung đại Thành phố Huế',
        periodAllocation: 'Tiết PPCT 10, 11, 12, 13',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết sơ lược đặc điểm giá trị nội dung, nghệ thuật nổi bật của thơ ca trung đại Thành phố Huế; có tình cảm, thái độ tích cực với di sản văn học trung đại của địa phương. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp7-vhtd-b2-ck1',
        week: 'HKI (Tiết PPCT 14, 15, 16, 17, 18)',
        lessonName: 'Chủ đề: Văn học trung đại Thành phố Huế – Bài 2: Văn xuôi trung đại Thành phố Huế (4 tiết) & Kiểm tra cuối kỳ I (1 tiết)',
        periodAllocation: 'Tiết PPCT 14, 15, 16, 17, 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nêu được một số tác giả, tác phẩm văn học trung đại tiêu biểu của Thành phố Huế; nhận biết sơ lược đặc điểm giá trị nội dung, nghệ thuật nổi bật và có tình cảm, thái độ tích cực với di sản văn học trung đại của địa phương. Kiểm tra cuối kỳ I (Tiết 18). Lồng ghép GDĐP.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-gddp-hk2',
    grade: 7,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP7-HK2',
    chapterTitle:
      'GDĐP 7 – Học kì II: Chủ đề Thành phố Huế từ thế kỉ X đến thế kỉ XVI & Chủ đề Mĩ thuật truyền thống Thành phố Huế',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề: Thành phố Huế từ thế kỉ X đến thế kỉ XVI (Bài 1: Thời Trần - Hồ; Bài 2: Thời Lê Sơ và dấu ấn chúa Tiên) & Chủ đề: Mĩ thuật truyền thống Thành phố Huế (Bài 1: Tranh dân gian Làng Sình; Bài 2: Kiến trúc thời Nguyễn ở Huế; Bài 3: Nghệ thuật điêu khắc). Định hướng NLS: Tích hợp NLS 1.1.TC1a.',
    rawLessons: [
      {
        id: 'gddp7-ls-b1',
        week: 'HKII (Tiết PPCT 19, 20, 21, 22)',
        lessonName: 'Chủ đề: Thành phố Huế từ thế kỉ X đến thế kỉ XVI – Bài 1: Thành phố Huế thời Trần - Hồ',
        periodAllocation: 'Tiết PPCT 19, 20, 21, 22',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Trình bày được những nét chính của Thành phố Huế thời Trần và những ngày đầu của chúa Tiên - Nguyễn Hoàng ở TP Huế; xác định được các tên gọi chính và địa giới hành chính của Thành phố Huế qua các thời kì (từ đầu thế kỉ X đến thế kỉ XVI); liên hệ các sự kiện địa danh tên đường, trường học, công trình văn hoá... ở địa phương hiện nay. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp7-ls-b2-gk2',
        week: 'HKII (Tiết PPCT 23, 24, 25, 26)',
        lessonName: 'Chủ đề: Thành phố Huế từ thế kỉ X đến thế kỉ XVI – Bài 2: Thành phố Huế thời Lê Sơ và dấu ấn chúa Tiên (3 tiết, PPCT 23–25) & Kiểm tra giữa kỳ II (1 tiết, PPCT 26)',
        periodAllocation: 'Tiết PPCT 23, 24, 25, 26',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Trình bày được những nét chính của Thành phố Huế thời Lê sơ và những ngày đầu của chúa Tiên - Nguyễn Hoàng ở TP Huế; xác định được các tên gọi chính và địa giới hành chính của Thành phố Huế qua các thời kì (từ đầu thế kỉ X đến thế kỉ XVI); liên hệ các sự kiện địa danh tên đường, trường học, công trình văn hoá... ở địa phương hiện nay. Kiểm tra giữa kỳ II (Tiết 26). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp7-mt-b1-b2',
        week: 'HKII (Tiết PPCT 27 – 32)',
        lessonName: 'Chủ đề: Mĩ thuật truyền thống Thành phố Huế – Bài 1: Tranh dân gian Làng Sình (3 tiết, PPCT 27–29) & Bài 2: Kiến trúc thời Nguyễn ở Huế (3 tiết, PPCT 30–32)',
        periodAllocation: 'Tiết PPCT 27, 28, 29, 30, 31, 32',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nhận biết được những yếu tố đặc trưng, ý nghĩa và giá trị của tranh dân gian Làng Sình trong đời sống; nhận biết được những đặc trưng cơ bản về kiến trúc (dân gian và cung đình), các hoa văn trang trí tiêu biểu trên các công trình kiến trúc thời Nguyễn. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp7-mt-b3-ck2',
        week: 'HKII (Tiết PPCT 33, 34, 35)',
        lessonName: 'Chủ đề: Mĩ thuật truyền thống Thành phố Huế – Bài 3: Nghệ thuật điêu khắc (2 tiết, PPCT 33–34) & Kiểm tra cuối kỳ II (1 tiết, PPCT 35)',
        periodAllocation: 'Tiết PPCT 33, 34, 35',
        periodsCount: 3,
        adjustedContent:
          'YCCĐ: Nhận diện được các đặc trưng cơ bản của nghệ thuật điêu khắc thông qua các tác phẩm tại các công trình thuộc quần thể di tích cố đô Huế; biết trân trọng, có ý thức giữ gìn và quảng bá các giá trị tiêu biểu của mĩ thuật thời Nguyễn. Kiểm tra cuối kỳ II (Tiết 35). Lồng ghép GDĐP.',
      },
    ],
  }),
];

export const GRADE8_GDDP_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-gddp-hk1',
    grade: 8,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP8-HK1',
    chapterTitle:
      'GDĐP 8 – Học kì I: Hệ thống chính trị ở Thành phố Huế, Âm nhạc hiện đại ở Thành phố Huế & Văn học Thành phố Huế từ 1900 đến 1945',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Kinh tế – Chính trị – Xã hội (Chủ đề: Hệ thống chính trị ở Thành phố Huế, 4 tiết); Nghệ thuật (Chủ đề: Âm nhạc hiện đại ở Thành phố Huế, 4 tiết); Kiểm tra giữa kỳ I (1 tiết); Văn học (Bài 1: Thơ ca & Bài 2: Văn xuôi Thành phố Huế từ 1900 đến 1945, 8 tiết); Kiểm tra cuối kỳ I (1 tiết). Định hướng NLS: Tích hợp NLS 1.1.TC2a.',
    rawLessons: [
      {
        id: 'gddp8-htct',
        week: 'HKI (Tiết PPCT 1, 2, 3, 4)',
        lessonName: 'Kinh tế – Chính trị – Xã hội – Chủ đề: Hệ thống chính trị ở Thành phố Huế',
        periodAllocation: 'Tiết PPCT 1, 2, 3, 4',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Biết được cơ cấu tổ chức của hệ thống chính trị ở Thành phố Huế từ cấp phường/xã đến cấp tỉnh/thành phố; biết sơ lược về vai trò cơ bản của một số bộ phận, phòng ban, cơ quan chuyên môn ở từng cấp chính quyền (từ cấp phường/xã đến cấp tỉnh) trong hệ thống chính trị. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp8-anhd-gk1',
        week: 'HKI (Tiết PPCT 5 – 9)',
        lessonName: 'Nghệ thuật – Chủ đề: Âm nhạc hiện đại ở Thành phố Huế (4 tiết, PPCT 5–8) & Kiểm tra giữa kỳ I (1 tiết, PPCT 9)',
        periodAllocation: 'Tiết PPCT 5, 6, 7, 8, 9',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết được một số tác giả, tác phẩm âm nhạc hiện đại tiêu biểu của Thành phố Huế; trình bày được những nét chính về hoạt động âm nhạc hiện đại ở Thành phố Huế; tự hào về các tác giả, tác phẩm âm nhạc hiện đại tiêu biểu của quê hương. Kiểm tra giữa kỳ I (Tiết 9). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp8-vh-b1',
        week: 'HKI (Tiết PPCT 10, 11, 12, 13)',
        lessonName: 'Văn học – Bài 1: Thơ ca Thành phố Huế từ 1900 đến 1945',
        periodAllocation: 'Tiết PPCT 10, 11, 12, 13',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết được một số tác giả, tác phẩm thơ ca tiêu biểu của Thành phố Huế từ 1900 - 1945; có tình cảm, thái độ tích cực với di sản văn học Thành phố Huế. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp8-vh-b2-ck1',
        week: 'HKI (Tiết PPCT 14, 15, 16, 17, 18)',
        lessonName: 'Văn học – Bài 2: Văn xuôi Thành phố Huế từ 1900 đến 1945 (4 tiết, PPCT 14–17) & Kiểm tra cuối kỳ I (1 tiết, PPCT 18)',
        periodAllocation: 'Tiết PPCT 14, 15, 16, 17, 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết được một số tác giả, tác phẩm văn xuôi tiêu biểu của Thành phố Huế từ 1900 - 1945; có tình cảm, thái độ tích cực với di sản văn học Thành phố Huế. Kiểm tra cuối kỳ I (Tiết 18). Định hướng phát triển NLS: Tích hợp NLS 1.1.TC2a. Lồng ghép GDĐP.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-gddp-hk2',
    grade: 8,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP8-HK2',
    chapterTitle:
      'GDĐP 8 – Học kì II: Địa lí – Môi trường (Dân số, Lao động việc làm, Đô thị hóa) & Lịch sử – Văn hóa (Thuận Hóa - Phú Xuân TK XVI–XIX, Phong trào yêu nước chống Pháp 1885–1918)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Địa lí – Môi trường (Bài 1: Dân số, gia tăng dân số và cơ cấu dân số; Bài 2: Lao động và việc làm; Bài 3: Đô thị hóa – 7 tiết); Kiểm tra giữa kỳ II (1 tiết); Lịch sử – Văn hóa (Bài 1: Thuận Hóa - Phú Xuân từ TK XVI đến giữa TK XIX; Bài 2: Phong trào yêu nước chống thực dân Pháp ở Huế 1885-1918 – 8 tiết); Kiểm tra cuối kỳ II (1 tiết). Lồng ghép GD QP & AN.',
    rawLessons: [
      {
        id: 'gddp8-dlmt-b1-b3-gk2',
        week: 'HKII (Tiết PPCT 19 – 26)',
        lessonName: 'Địa lí – Môi trường – Bài 1: Dân số, gia tăng dân số và cơ cấu dân số (3 tiết, PPCT 19–21); Bài 2: Lao động và việc làm (2 tiết, PPCT 22–23); Bài 3: Đô thị hóa (2 tiết, PPCT 24–25) & Kiểm tra giữa kỳ II (1 tiết, PPCT 26)',
        periodAllocation: 'Tiết PPCT 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Trình bày được các đặc điểm cơ bản về dân cư địa phương; nhận biết được đặc điểm nguồn lao động, phân tích được mối quan hệ giữa dân số, lao động và việc làm ở Thành phố Huế; liên hệ thực tế địa phương về vấn đề lao động, việc làm và đô thị hóa; sử dụng biểu đồ, bản đồ, bảng số liệu để phân tích/trình bày được một số vấn đề dân cư và nguồn lao động Thành phố Huế. Kiểm tra giữa kỳ II (Tiết 26). Lồng ghép GDĐP.',
      },
      {
        id: 'gddp8-lsvh-b1',
        week: 'HKII (Tiết PPCT 27, 28, 29, 30)',
        lessonName: 'Lịch sử – Văn hóa – Bài 1: Thuận Hóa - Phú Xuân từ TK XVI đến giữa TK XIX',
        periodAllocation: 'Tiết PPCT 27, 28, 29, 30',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Trình bày được những nét cơ bản về một số nhân vật tiêu biểu của Thuận Hóa - Phú Xuân từ TK XVI đến giữa TK XIX; liên hệ các sự kiện, nhân vật tiêu biểu gắn với địa danh, tên đường, trường học,... ở địa phương hiện nay. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp8-lsvh-b2-ck2',
        week: 'HKII (Tiết PPCT 31, 32, 33, 34, 35)',
        lessonName: 'Lịch sử – Văn hóa – Bài 2: Phong trào yêu nước chống thực dân Pháp ở Huế 1885-1918 (4 tiết, PPCT 31–34) & Kiểm tra cuối kỳ II (1 tiết, PPCT 35)',
        periodAllocation: 'Tiết PPCT 31, 32, 33, 34, 35',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Trình bày được những nét cơ bản về một số nhân vật tiêu biểu và phong trào đấu tranh của nhân dân Thành phố Huế giai đoạn từ năm 1885 đến năm 1918; liên hệ các sự kiện, nhân vật tiêu biểu gắn với địa danh, tên đường, trường học,... ở địa phương hiện nay. Kiểm tra cuối kỳ II (Tiết 35). Lồng ghép nội dung GD QP & AN: "Giáo dục lòng tự hào, tự tôn dân tộc và sức mạnh đại đoàn kết toàn dân tộc trong đấu tranh chống giặc ngoại xâm". Lồng ghép GDĐP.',
      },
    ],
  }),
];

export const GRADE9_GDDP_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-gddp-hk1',
    grade: 9,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP9-HK1',
    chapterTitle:
      'GDĐP 9 – Học kì I: Nghệ thuật (Mĩ thuật hiện đại ở Huế), Địa lí – Môi trường (Bảo vệ môi trường, Thiên tai & Dự án môi trường) & Lịch sử – Văn hóa (Phong trào cách mạng 1930–1945, Kháng chiến 1945–1975 & Đổi mới)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Nghệ thuật (Bài 1–2: Khái quát về Mĩ thuật hiện đại & Các họa sĩ tiêu biểu của Thành phố Huế thời hiện đại, 4 tiết); Địa lí – Môi trường (Bài 1–3: Bảo vệ môi trường, Thiên tai và cách phòng tránh, Dự án bảo vệ môi trường tự nhiên, 4 tiết); Kiểm tra giữa kỳ I (1 tiết); Lịch sử – Văn hóa (Bài 1–3: Phong trào cách mạng 1930–1945, Kháng chiến chống Pháp và Mĩ 1945–1975, Công cuộc xây dựng đổi mới và hội nhập, 8 tiết); Kiểm tra cuối kỳ I (1 tiết).',
    rawLessons: [
      {
        id: 'gddp9-nt-b1-b2',
        week: 'HKI (Tiết PPCT 1, 2, 3, 4)',
        lessonName: 'Nghệ thuật – Bài 1: Khái quát về Mĩ thuật hiện đại ở Thành phố Huế (2 tiết, PPCT 1–2) & Bài 2: Các họa sĩ tiêu biểu của Thành phố Huế thời hiện đại (2 tiết, PPCT 3–4)',
        periodAllocation: 'Tiết PPCT 1, 2, 3, 4',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Trình bày được một số đặc điểm tổng quan về mĩ thuật hiện đại Thành phố Huế; nhận biết được một số kĩ thuật cơ bản về chất liệu của các tác phẩm mĩ thuật; nhận diện được phong cách, đề tài của các hoạ sĩ tiêu biểu tại Thành phố Huế và nhận biết được giá trị của các tác phẩm mĩ thuật trong đời sống. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp9-dlmt-b1-b3-gk1',
        week: 'HKI (Tiết PPCT 5, 6, 7, 8, 9)',
        lessonName: 'Địa lí – Môi trường – Bài 1: Một số vấn đề về bảo vệ Môi trường và tài nguyên thiên nhiên (2 tiết, PPCT 5–6); Bài 2: Một số thiên tai và cách phòng tránh (1 tiết, PPCT 7); Bài 3: Dự án bảo vệ môi trường tự nhiên (1 tiết, PPCT 8) & Kiểm tra giữa kỳ I (1 tiết, PPCT 9)',
        periodAllocation: 'Tiết PPCT 5, 6, 7, 8, 9',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Trình bày được một số vấn đề về môi trường tự nhiên của Thành phố Huế (hiện trạng, nguyên nhân, các biện pháp bảo vệ môi trường và tài nguyên thiên nhiên); phân tích tác động của dân cư - xã hội đến bảo vệ môi trường và tài nguyên thiên nhiên của tỉnh; biết được các thiên tai thường xảy ra ở Thành phố Huế và các biện pháp phòng tránh; lựa chọn và thực hiện được một dự án nhằm góp phần bảo vệ môi trường tự nhiên tại địa phương. Kiểm tra giữa kỳ I (Tiết 9). Lồng ghép GDĐP, BVMT & BĐKH - PCTT.',
      },
      {
        id: 'gddp9-lsvh-b1-b3-ck1',
        week: 'HKI (Tiết PPCT 10 – 18)',
        lessonName: 'Lịch sử – Văn hóa – Bài 1: Phong trào cách mạng ở Thành phố Huế những năm 1930-1945 (3 tiết, PPCT 10–12); Bài 2: Thành phố Huế trong cuộc kháng chiến chống thực dân Pháp và đế quốc Mĩ 1945-1975 (3 tiết, PPCT 13–15); Bài 3: Thành phố Huế trong công cuộc xây dựng, đổi mới và hội nhập (2 tiết, PPCT 16–17) & Kiểm tra cuối kỳ I (1 tiết, PPCT 18)',
        periodAllocation: 'Tiết PPCT 10 – 18',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nêu được những nét chính về phong trào dân tộc dân chủ ở Thành phố Huế (1918–1930) và những dấu mốc quan trọng trong quá trình ra đời, lãnh đạo cách mạng của Đảng bộ Thành phố Huế giai đoạn 1930–1945; nêu được những đóng góp tiêu biểu của quân và dân Thành phố Huế trong cuộc kháng chiến chống thực dân Pháp và đế quốc Mĩ (1945–1975), rút ra bài học kinh nghiệm; nhận biết được sự thay đổi về mọi mặt của vùng đất Thành phố Huế thời kì đổi mới. Kiểm tra cuối kỳ I (Tiết 18). Lồng ghép GDĐP & QPAN.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-gddp-hk2',
    grade: 9,
    subject: 'Giáo dục địa phương',
    chapterCode: 'GDĐP9-HK2',
    chapterTitle:
      'GDĐP 9 – Học kì II: Kinh tế – Chính trị – Xã hội (Nông - lâm - thủy sản, Công nghiệp và xây dựng, Dịch vụ) & Văn học Thành phố Huế từ 1945 đến nay',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Kinh tế – Chính trị – Xã hội (Bài 1: Nông nghiệp - lâm nghiệp - thủy sản; Bài 2: Công nghiệp và xây dựng; Bài 3: Dịch vụ – 7 tiết); Kiểm tra giữa kỳ II (1 tiết); Văn học (Bài 1: Thơ ca Thành phố Huế từ 1945 đến nay; Bài 2: Văn xuôi Thành phố Huế từ 1945 đến nay – 7 tiết); Kiểm tra cuối kỳ II (1 tiết). Định hướng NLS: Tích hợp NLS 1.1.TC2b.',
    rawLessons: [
      {
        id: 'gddp9-ktxh-b1-b3-gk2',
        week: 'HKII (Tiết PPCT 19 – 26)',
        lessonName: 'Kinh tế – Chính trị – Xã hội – Bài 1: Nông nghiệp - lâm nghiệp - thủy sản (3 tiết, PPCT 19–21); Bài 2: Công nghiệp và xây dựng (2 tiết, PPCT 22–23); Bài 3: Dịch vụ (2 tiết, PPCT 24–25) & Kiểm tra giữa kỳ II (1 tiết, PPCT 26)',
        periodAllocation: 'Tiết PPCT 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Nhận xét, phân tích được một số dạng biểu đồ và bảng số liệu về các vấn đề liên quan đến dịch vụ, công nghiệp, nông lâm ngư nghiệp; nêu dự báo của bản thân về nền kinh tế của Thành phố Huế. Kiểm tra giữa kỳ II (Tiết 26). Định hướng phát triển NLS: Tích hợp NLS 1.1.TC2b. Lồng ghép GDĐP.',
      },
      {
        id: 'gddp9-vh-b1-b2-ck2',
        week: 'HKII (Tiết PPCT 27 – 35)',
        lessonName: 'Văn học – Bài 1: Thơ ca Thành phố Huế từ 1945 đến nay (4 tiết, PPCT 27–30); Bài 2: Văn xuôi Thành phố Huế từ 1945 đến nay (3 tiết, PPCT 31–34) & Kiểm tra cuối kỳ II (1 tiết, PPCT 35)',
        periodAllocation: 'Tiết PPCT 27 – 35',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Biết được một số tác giả, tác phẩm văn học tiêu biểu của Thành phố Huế từ 1945 đến nay; trình bày sơ lược đặc điểm, giá trị nội dung, nghệ thuật nổi bật của thơ ca, văn xuôi Thành phố Huế từ 1945 đến nay; có tình cảm, thái độ tích cực với di sản văn học Thành phố Huế. Kiểm tra cuối kỳ II (Tiết 35). Định hướng phát triển NLS: Tích hợp NLS 1.1.TC2b. Lồng ghép GDĐP.',
      },
    ],
  }),
];

// ============================================================================
// 1.6. MÔN NGHỆ THUẬT – PHÂN MÔN ÂM NHẠC (KHỐI 6, 7, 8, 9 – 35 TIẾT/NĂM)
// ============================================================================

export const GRADE6_AM_NHAC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-amnhac-hk1',
    grade: 6,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN6-HK1',
    chapterTitle:
      'Âm nhạc 6 – Học kì I: Chủ đề 1 (Tuổi học trò), Chủ đề 2 (Cuộc sống tươi đẹp), Chủ đề 3 (Nhớ ơn thầy cô) & Chủ đề 4 (Ước mơ hòa bình)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Tiết PPCT chẵn 2..36)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Tuổi học trò (4 tiết); Chủ đề 2: Cuộc sống tươi đẹp & Kiểm tra giữa kỳ 1 (5 tiết); Chủ đề 3: Nhớ ơn thầy cô (4 tiết); Chủ đề 4: Ước mơ hòa bình & Kiểm tra cuối kỳ 1 (5 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1TC1b, 2.1TC1b, 3.1TC1b; AI 6.A3.1; Lồng ghép QPAN.',
    rawLessons: [
      {
        id: 'an6-cd1',
        week: 'HKI (Tiết 1–4 | PPCT 2, 4, 6, 8)',
        lessonName: 'Chủ đề 1: Tuổi học trò (Học bài hát: Con đường học trò; Nghe nhạc: Tháng năm học trò; TTÂN: Giới thiệu đàn piano; LTÂN: Các thuộc tính cơ bản của âm thanh có tính nhạc; Đọc nhạc: Bài đọc nhạc số 1; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 2, 4, 6, 8',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Con đường học trò; nghe và cảm nhận bài hát Tháng năm học trò; nêu được một số đặc điểm về đàn piano; nhận biết và phân biệt được các thuộc tính cơ bản của âm thanh có tính nhạc; đọc đúng tên nốt, cao độ, trường độ Bài đọc nhạc số 1 kết hợp gõ đệm. Định hướng phát triển NLS - AI: Tích hợp NLS 1.1TC1b (Tiết PPCT 2) và Năng lực AI 6.A3.1 (Tiết PPCT 4: Thường thức âm nhạc Giới thiệu đàn piano).',
      },
      {
        id: 'an6-cd2-gk1',
        week: 'HKI (Tiết 5–9 | PPCT 10, 12, 14, 16, 18)',
        lessonName: 'Chủ đề 2: Cuộc sống tươi đẹp (Học bài hát: Đời sống không già vì có chúng em; Nghe nhạc: Tác phẩm The Blue Danube; LTÂN: Kí hiệu âm nhạc bằng chữ cái Latin; Nhạc cụ giai điệu: Recorder - Kèn phím; Ôn tập & Kiểm tra giữa kỳ 1)',
        periodAllocation: 'Tiết PPCT 10, 12, 14, 16, 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Đời sống không già vì có chúng em; nghe và cảm nhận giai điệu, nhịp điệu tác phẩm The Blue Danube; nhận biết các kí hiệu âm bằng hệ thống chữ cái Latin; hiểu được cấu tạo, cách chơi của sáo Recorder và kèn phím; thực hiện kiểm tra thực hành giữa kì I (Tiết PPCT 18). Định hướng phát triển NLS: Tích hợp NLS 2.1TC1b (Tiết PPCT 12).',
      },
      {
        id: 'an6-cd3',
        week: 'HKI (Tiết 10–13 | PPCT 20, 22, 24, 26)',
        lessonName: 'Chủ đề 3: Nhớ ơn thầy cô (Học bài hát: Thầy cô là tất cả; Nghe nhạc: Bài hát Nhớ ơn thầy cô; LTÂN: Tìm hiểu nhịp 4/4; Đọc nhạc: Bài đọc nhạc số 2; TTÂN: Giới thiệu hình thức hát bè; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 20, 22, 24, 26',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Thầy cô là tất cả; nghe và cảm nhận bài hát Nhớ ơn thầy cô; biết được khái niệm và cách đánh nhịp 4/4; đọc đúng tên nốt, cao độ, trường độ Bài đọc nhạc số 2; nhận biết các hình thức hát bè và vận dụng vào bài hát. Định hướng phát triển NLS - AI: Tích hợp NLS 3.1TC1b (Tiết PPCT 22) và Năng lực AI 6.A3.1 (Tiết PPCT 26: Vận dụng - Sáng tạo).',
      },
      {
        id: 'an6-cd4-ck1',
        week: 'HKI (Tiết 14–18 | PPCT 28, 30, 32, 34, 36)',
        lessonName: 'Chủ đề 4: Ước mơ hòa bình (Học bài hát: Những ước mơ; Nghe nhạc: Trích đoạn chương IV bản Giao hưởng số 9 của Beethoven; TTÂN: Nhạc sĩ Văn Ký và tác phẩm Bài ca hy vọng; Nhạc cụ giai điệu: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kỳ 1)',
        periodAllocation: 'Tiết PPCT 28, 30, 32, 34, 36',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Những ước mơ; nghe và cảm nhận âm điệu hùng tráng trích đoạn chương IV Giao hưởng số 9 của Beethoven; biết đôi nét về nhạc sĩ Văn Ký và tác phẩm Bài ca hy vọng; thể hiện được nốt Đô 2 và bài luyện mẫu âm trên recorder hoặc nét nhạc Bài đọc nhạc số 1 trên kèn phím; thực hiện kiểm tra thực hành cuối kì I (Tiết PPCT 36). Lồng ghép QPAN (Tiết PPCT 30): Giáo dục HS biết về lịch sử hào hùng của dân tộc, biết cố gắng phấn đấu trong học tập và rèn luyện, để xây dựng đất nước.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-amnhac-hk2',
    grade: 6,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN6-HK2',
    chapterTitle:
      'Âm nhạc 6 – Học kì II: Chủ đề 5 (Giai điệu quê hương), Chủ đề 6 (Mẹ trong trái tim em), Chủ đề 7 (Âm nhạc nước ngoài) & Chủ đề 8 (Bác Hồ với thiếu nhi)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Tiết PPCT chẵn 38..70)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5: Giai điệu quê hương (4 tiết); Chủ đề 6: Mẹ trong trái tim em & Kiểm tra giữa kì 2 (5 tiết); Chủ đề 7: Âm nhạc nước ngoài (4 tiết); Chủ đề 8: Bác Hồ với thiếu nhi & Kiểm tra cuối kỳ 2 (4 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1TC1b, 2.2TC1a; AI 6.A1.1; Lồng ghép QPAN.',
    rawLessons: [
      {
        id: 'an6-cd5',
        week: 'HKII (Tiết 19–22 | PPCT 38, 40, 42, 44)',
        lessonName: 'Chủ đề 5: Giai điệu quê hương (Học bài hát: Mưa rơi; Nghe nhạc: Hòa tấu nhạc cụ dân tộc Mừng hội hoa bông; Đọc nhạc: Bài đọc nhạc số 3; TTÂN: Giới thiệu khèn và sáo trúc; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 38, 40, 42, 44',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Mưa rơi; nghe và cảm nhận bản hòa tấu Mừng hội hoa bông; đọc đúng cao độ, trường độ Bài đọc nhạc số 3; nhận biết và nêu được một số đặc điểm của nhạc cụ dân tộc khèn và sáo trúc; biết đặt lời ca theo giai điệu Bài đọc nhạc số 3 với chủ đề Giai điệu quê hương. Định hướng phát triển NLS: Tích hợp NLS 1.1TC1b (Tiết PPCT 38) và 2.2TC1a (Tiết PPCT 44).',
      },
      {
        id: 'an6-cd6-gk2',
        week: 'HKII (Tiết 23–27 | PPCT 46, 48, 50, 52, 54)',
        lessonName: 'Chủ đề 6: Mẹ trong trái tim em (Học bài hát: Chỉ có một trên đời; TTÂN: Nhạc sĩ Johannes Brahms và tác phẩm Lullaby; LTÂN: Giới thiệu cung và nửa cung; Đọc nhạc: Bài đọc nhạc số 4; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra giữa kì 2)',
        periodAllocation: 'Tiết PPCT 46, 48, 50, 52, 54',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Chỉ có một trên đời; biết đôi nét về nhạc sĩ Johannes Brahms và tác phẩm Lullaby; nhận biết cung và nửa cung; đọc đúng Bài đọc nhạc số 4; biết chơi nốt Rê 2 và ứng dụng đệm bài Mưa rơi trên recorder hoặc Bài đọc nhạc số 1 trên kèn phím; kiểm tra thực hành giữa kì II (Tiết PPCT 54). Định hướng phát triển AI: Tích hợp AI 6.A1.1 (Tiết PPCT 46).',
      },
      {
        id: 'an6-cd7',
        week: 'HKII (Tiết 28–31 | PPCT 56, 58, 60, 62)',
        lessonName: 'Chủ đề 7: Âm nhạc nước ngoài (Học bài hát: Hãy để mặt trời luôn chiếu sáng; LTÂN: Các bậc chuyển hóa, dấu hóa; Nghe nhạc: Bài hát Auld Lang Syne; Đọc nhạc: Bài đọc nhạc số 5; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 56, 58, 60, 62',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng cao độ, trường độ, sắc thái và lời ca bài hát Hãy để mặt trời luôn chiếu sáng; hiểu được tác dụng của dấu hóa, các bậc chuyển hóa; nghe và cảm nhận giai điệu bài hát Auld Lang Syne; đọc đúng cao độ, trường độ và ghép lời ca Bài đọc nhạc số 5 kết hợp vận động theo nhịp 3/4.',
      },
      {
        id: 'an6-cd8-ck2',
        week: 'HKII (Tiết 32–35 | PPCT 64, 66, 68, 70)',
        lessonName: 'Chủ đề 8: Bác Hồ với thiếu nhi (Học bài hát: Bác Hồ - Người cho em tất cả; Nghe nhạc: Việt Nam quê hương tôi; TTÂN: Bài hát Như có Bác trong ngày đại thắng; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kỳ 2)',
        periodAllocation: 'Tiết PPCT 64, 66, 68, 70',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Bác Hồ - Người cho em tất cả; nghe và cảm nhận bài hát Việt Nam quê hương tôi; biết đôi nét về bài hát Như có Bác trong ngày đại thắng và thực hành đệm trích đoạn trên recorder hoặc kèn phím; kiểm tra thực hành cuối kì II (Tiết PPCT 70). Lồng ghép QPAN & TTHCM (Tiết PPCT 64 & 66): Giáo dục HS thêm yêu quê hương đất nước, lòng tự hào dân tộc, biết về lịch sử hào hùng của dân tộc, cố gắng phấn đấu trong học tập và rèn luyện để xây dựng và bảo vệ Tổ quốc.',
      },
    ],
  }),
];

export const GRADE7_AM_NHAC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-amnhac-hk1',
    grade: 7,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN7-HK1',
    chapterTitle:
      'Âm nhạc 7 – Học kì I: Chủ đề 1 (Ngày khai trường), Chủ đề 2 (Môi trường xanh), Chủ đề 3 (Thầy cô và mái trường) & Chủ đề 4 (Giai điệu quê hương)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Tiết PPCT chẵn 2..36)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Ngày khai trường (4 tiết); Chủ đề 2: Môi trường xanh & Kiểm tra giữa kỳ 1 (5 tiết); Chủ đề 3: Thầy cô và mái trường (4 tiết); Chủ đề 4: Giai điệu quê hương & Kiểm tra cuối kì 1 (5 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1TC1b, 3.1TC1b, 2.2TC1a; AI 7.A1.1; Lồng ghép QPAN & BVMT.',
    rawLessons: [
      {
        id: 'an7-cd1',
        week: 'HKI (Tiết 1–4 | PPCT 2, 4, 6, 8)',
        lessonName: 'Chủ đề 1: Ngày khai trường (Học bài hát: Khai trường; LTÂN: Nhịp lấy đà; Đọc nhạc: Bài đọc nhạc số 1; TTÂN: Nhạc sĩ Trịnh Công Sơn và bài hát Tuổi đời mênh mông; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 2, 4, 6, 8',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Khai trường; nhận biết và thể hiện được nhịp lấy đà; đọc đúng tên nốt, cao độ, trường độ Bài đọc nhạc số 1; nêu được đôi nét về cuộc đời và sự nghiệp sáng tác của nhạc sĩ Trịnh Công Sơn và cảm nhận bài hát Tuổi đời mênh mông. Định hướng phát triển NLS - AI: Tích hợp NLS 1.1TC1b (Tiết PPCT 2), NLS 3.1TC1b & Năng lực AI 7.A1.1 (Tiết PPCT 6).',
      },
      {
        id: 'an7-cd2-gk1',
        week: 'HKI (Tiết 5–9 | PPCT 10, 12, 14, 16, 18)',
        lessonName: 'Chủ đề 2: Môi trường xanh (Học bài hát: Vì cuộc sống tươi đẹp; Nghe nhạc: Tác phẩm Alouette; Nhạc cụ: Recorder - Kèn phím; TTÂN: Nhạc sĩ Hoàng Việt và ca khúc Nhạc rừng; Vận dụng - Sáng tạo & Kiểm tra giữa kỳ 1)',
        periodAllocation: 'Tiết PPCT 10, 12, 14, 16, 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Vì cuộc sống tươi đẹp; nghe và cảm nhận tác phẩm Alouette; nhớ được thế bấm, cách chơi sáo Recorder và kèn phím; nêu được đôi nét về nhạc sĩ Hoàng Việt và ca khúc Nhạc rừng; vẽ tranh hoặc làm sản phẩm về đề tài Bảo vệ môi trường; kiểm tra thực hành giữa kì I (Tiết PPCT 18). Lồng ghép QPAN & BVMT (Tiết PPCT 14): Giáo dục HS biết về lịch sử hào hùng của dân tộc, biết cố gắng phấn đấu trong học tập và rèn luyện để xây dựng đất nước.',
      },
      {
        id: 'an7-cd3',
        week: 'HKI (Tiết 10–13 | PPCT 20, 22, 24, 26)',
        lessonName: 'Chủ đề 3: Thầy cô và mái trường (Học bài hát: Nhớ ơn thầy cô; LTÂN: Dấu nhắc lại, dấu quay lại, khung thay đổi; Đọc nhạc: Bài đọc nhạc số 2; TTÂN: Giới thiệu một số thể loại ca khúc; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 20, 22, 24, 26',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Nhớ ơn thầy cô; nhận biết kí hiệu và tác dụng của dấu nhắc lại, dấu quay lại và khung thay đổi; đọc đúng Bài đọc nhạc số 2; nhận biết và nêu được đặc điểm của các thể loại ca khúc: hành khúc, nghi lễ, nghi thức, trữ tình, hát ru; biết ghép lời ca vào Bài đọc nhạc số 2 kết hợp đánh nhịp 2/4.',
      },
      {
        id: 'an7-cd4-ck1',
        week: 'HKI (Tiết 14–18 | PPCT 28, 30, 32, 34, 36)',
        lessonName: 'Chủ đề 4: Giai điệu quê hương (Học bài hát: Lí kéo chài; TTÂN: Dân ca một số vùng miền Việt Nam; Đọc nhạc: Bài đọc nhạc số 3; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kì 1)',
        periodAllocation: 'Tiết PPCT 28, 30, 32, 34, 36',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Lí kéo chài; nhận biết và nêu được đặc điểm dân ca một số vùng miền Việt Nam; đọc đúng cao độ, trường độ và ghép lời ca Bài đọc nhạc số 3; biết chơi nốt Mi và bài luyện tập trên recorder hoặc thể hiện nét giai điệu Bài đọc nhạc số 3 trên kèn phím; kiểm tra thực hành cuối kì I (Tiết PPCT 36). Định hướng phát triển NLS: Tích hợp NLS 2.2TC1a (Tiết PPCT 32).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-amnhac-hk2',
    grade: 7,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN7-HK2',
    chapterTitle:
      'Âm nhạc 7 – Học kì II: Chủ đề 5 (Nhịp điệu mùa xuân), Chủ đề 6 (Âm nhạc nước ngoài), Chủ đề 7 (Cuộc sống tươi đẹp) & Chủ đề 8 (Mùa hè của em)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Tiết PPCT chẵn 38..70)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5: Nhịp điệu mùa xuân (4 tiết); Chủ đề 6: Âm nhạc nước ngoài & Kiểm tra giữa kì 2 (5 tiết); Chủ đề 7: Cuộc sống tươi đẹp (4 tiết); Chủ đề 8: Mùa hè của em & Kiểm tra cuối kì 2 (4 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1TC1b, 2.2TC1a; AI 7.A2.1, 7.A1.1; Lồng ghép QPAN.',
    rawLessons: [
      {
        id: 'an7-cd5',
        week: 'HKII (Tiết 19–22 | PPCT 38, 40, 42, 44)',
        lessonName: 'Chủ đề 5: Nhịp điệu mùa xuân (Học bài hát: Mùa xuân ơi; Nghe nhạc: Sông Đakrông mùa xuân về; TTÂN: Giới thiệu cồng chiêng, đàn t\'rưng của Tây Nguyên; LTÂN: Các kí hiệu tăng trường độ; Đọc nhạc: Bài đọc nhạc số 4; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 38, 40, 42, 44',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Mùa xuân ơi, biết hát bè đơn giản; nghe và cảm nhận bài hát Sông Đakrông mùa xuân về; nhận biết đặc điểm của cồng chiêng, đàn t\'rưng của Tây Nguyên; nhận biết và thể hiện một số kí hiệu tăng trường độ nốt nhạc (dấu nối, dấu chấm dôi, dấu miễn nhịp); đọc đúng Bài đọc nhạc số 4 kết hợp gõ đệm và ghép lời ca. Lồng ghép QPAN (Tiết PPCT 38): Giáo dục HS thêm yêu quê hương đất nước, lòng tự hào dân tộc và trách nhiệm xây dựng và bảo vệ Tổ quốc.',
      },
      {
        id: 'an7-cd6-gk2',
        week: 'HKII (Tiết 23–27 | PPCT 46, 48, 50, 52, 54)',
        lessonName: 'Chủ đề 6: Âm nhạc nước ngoài (Học bài hát: Santa Lucia; LTÂN: Một số kí hiệu, thuật ngữ về nhịp độ và sắc thái cường độ; Nhạc cụ: Recorder - Kèn phím; TTÂN: Giới thiệu đàn cello và contrabass; Vận dụng - Sáng tạo & Kiểm tra giữa kì 2)',
        periodAllocation: 'Tiết PPCT 46, 48, 50, 52, 54',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Santa Lucia; nhận biết và thể hiện một số kí hiệu, thuật ngữ về nhịp độ và sắc thái cường độ; biết chơi nốt Rê 1 và bài Five hundred miles trên recorder hoặc kĩ thuật luyến âm và bài Cầu vượt trên kèn phím; nhận biết đặc điểm và âm sắc của đàn cello và contrabass; kiểm tra thực hành giữa kì II (Tiết PPCT 54). Định hướng phát triển NLS - AI: Tích hợp NLS 1.1TC1b (Tiết PPCT 46) và Năng lực AI 7.A2.1 (Tiết PPCT 50).',
      },
      {
        id: 'an7-cd7',
        week: 'HKII (Tiết 28–31 | PPCT 56, 58, 60, 62)',
        lessonName: 'Chủ đề 7: Cuộc sống tươi đẹp (Học bài hát: Đời cho em những nốt nhạc vui; TTÂN: Nhạc sĩ Pyotr Ilyich Tchaikovsky và khúc nhạc Chèo thuyền; Đọc nhạc: Bài đọc nhạc số 5; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 56, 58, 60, 62',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Đời cho em những nốt nhạc vui; biết đôi nét về cuộc đời và sự nghiệp sáng tác của nhạc sĩ Pyotr Ilyich Tchaikovsky và tính chất âm nhạc của khúc nhạc Chèo thuyền; đọc đúng cao độ, trường độ Bài đọc nhạc số 5 kết hợp gõ đệm và đánh nhịp 2/4, biết thể hiện Bài đọc nhạc số 5 với hình thức hai bè. Định hướng phát triển AI: Tích hợp AI 7.A1.1 (Tiết PPCT 56).',
      },
      {
        id: 'an7-cd8-ck2',
        week: 'HKII (Tiết 32–35 | PPCT 64, 66, 68, 70)',
        lessonName: 'Chủ đề 8: Mùa hè của em (Học bài hát: Mùa hè; Nghe nhạc: Bài hát Hè về; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kì 2)',
        periodAllocation: 'Tiết PPCT 64, 66, 68, 70',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Mùa hè; nghe và cảm nhận bài hát Hè về; biết đệm trích đoạn bài Mùa hè trên recorder và kèn phím; kiểm tra thực hành cuối kì II (Tiết PPCT 70). Định hướng phát triển NLS: Tích hợp NLS 2.2TC1a (Tiết PPCT 68).',
      },
    ],
  }),
];

export const GRADE8_AM_NHAC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-amnhac-hk1',
    grade: 8,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN8-HK1',
    chapterTitle:
      'Âm nhạc 8 – Học kì I: Chủ đề 1 (Chào năm học mới), Chủ đề 2 (Tôi yêu Việt Nam), Chủ đề 3 (Hòa ca) & Chủ đề 4 (Biển đảo quê hương)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Tiết PPCT chẵn 2..36)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Chào năm học mới (4 tiết); Chủ đề 2: Tôi yêu Việt Nam & Kiểm tra giữa kỳ 1 (5 tiết); Chủ đề 3: Hòa ca (4 tiết); Chủ đề 4: Biển đảo quê hương & Kiểm tra cuối kì 1 (5 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1TC2b; AI 8.A1.1; Lồng ghép QPAN.',
    rawLessons: [
      {
        id: 'an8-cd1',
        week: 'HKI (Tiết 1–4 | PPCT 2, 4, 6, 8)',
        lessonName: 'Chủ đề 1: Chào năm học mới (Học bài hát: Chào năm học mới; LTÂN: Gam trưởng, giọng trưởng, giọng Đô trưởng; Nghe nhạc: Bay lên nhé nụ cười; Đọc nhạc: Bài đọc nhạc số 1; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 2, 4, 6, 8',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Chào năm học mới; nêu được đặc điểm của gam trưởng, giọng trưởng và giọng Đô trưởng; biết lắng nghe và biểu lộ cảm xúc bài hát Bay lên nhé nụ cười; đọc đúng tên nốt, cao độ, trường độ và sắc thái bè 2 của Bài đọc nhạc số 1. Định hướng phát triển NLS - AI: Tích hợp AI 8.A1.1 (Tiết PPCT 2) và NLS 1.1TC2b (Tiết PPCT 4).',
      },
      {
        id: 'an8-cd2-gk1',
        week: 'HKI (Tiết 5–9 | PPCT 10, 12, 14, 16, 18)',
        lessonName: 'Chủ đề 2: Tôi yêu Việt Nam (Học bài hát: Việt Nam ơi; Nghe nhạc: Ngàn ước mơ Việt Nam; TTÂN: Dân ca Quan họ Bắc Ninh; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra giữa kỳ 1)',
        periodAllocation: 'Tiết PPCT 10, 12, 14, 16, 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Việt Nam ơi (có hình thức hát bè đuổi); cảm nhận vẻ đẹp bài hát Ngàn ước mơ Việt Nam; nhận biết đặc điểm Dân ca Quan họ Bắc Ninh và bài Khách đến chơi nhà; nhớ thế bấm và thể hiện bài luyện tập với sáo Recorder và kèn phím; kiểm tra thực hành giữa kì I (Tiết PPCT 18). Lồng ghép QPAN (Tiết PPCT 12): Giáo dục HS biết thể hiện ước mơ của bản thân, sống lạc quan, yêu đời vượt qua mọi khó khăn, không ngừng học tập để đạt ước mơ góp phần xây dựng quê hương, đất nước giàu mạnh, phát triển.',
      },
      {
        id: 'an8-cd3',
        week: 'HKI (Tiết 10–13 | PPCT 20, 22, 24, 26)',
        lessonName: 'Chủ đề 3: Hòa ca (Hát hai bè trích đoạn bài Ngàn ước mơ Việt Nam, liên khúc Tôi yêu Việt Nam; TTÂN: Thể loại hợp xướng; LTÂN: Nhịp 3/8; Đọc nhạc: Bài đọc nhạc số 2; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 20, 22, 24, 26',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng cao độ, trường độ, sắc thái trong trích đoạn hai bè bài Ngàn ước mơ Việt Nam và liên khúc Tôi yêu Việt Nam với hình thức hát đồng ca có hai bè; nêu được đặc điểm thể loại hợp xướng và phân biệt với các hình thức ca hát khác; nêu đặc điểm của nhịp 3/8, so sánh nhịp 3/8 và 3/4; đọc đúng Bài đọc nhạc số 2 kết hợp gõ đệm.',
      },
      {
        id: 'an8-cd4-ck1',
        week: 'HKI (Tiết 14–18 | PPCT 28, 30, 32, 34, 36)',
        lessonName: 'Chủ đề 4: Biển đảo quê hương (Học bài hát: Nơi ấy Trường Sa; Nghe nhạc: Bài hát Nơi đảo xa; TTÂN: Đàn guitar và ukulele; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kì 1)',
        periodAllocation: 'Tiết PPCT 28, 30, 32, 34, 36',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Nơi ấy Trường Sa; nghe và cảm nhận bài hát Nơi đảo xa; nêu được đặc điểm, âm sắc của đàn guitar và ukulele; thể hiện được nốt Đô 1 và bài hòa tấu hai bè trên recorder hoặc bài hòa tấu Xòe hoa trên kèn phím; kiểm tra thực hành cuối kì I (Tiết PPCT 36). Lồng ghép QPAN (Tiết PPCT 28): Giáo dục HS thêm yêu quê hương đất nước, lòng tự hào dân tộc và trân quý những hi sinh thầm lặng của người lính hải quân trên mặt trận giữ gìn chủ quyền biển đảo thiêng liêng của Tổ quốc. Định hướng phát triển NLS: Tích hợp NLS 1.1TC2b (Tiết PPCT 30).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-amnhac-hk2',
    grade: 8,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN8-HK2',
    chapterTitle:
      'Âm nhạc 8 – Học kì II: Chủ đề 5 (Chào xuân), Chủ đề 6 (Âm nhạc nước ngoài), Chủ đề 7 (Giai điệu quê hương) & Chủ đề 8 (Nhịp điệu mùa hè)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Tiết PPCT chẵn 38..70)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5: Chào xuân (4 tiết); Chủ đề 6: Âm nhạc nước ngoài & Kiểm tra giữa kì 2 (5 tiết); Chủ đề 7: Giai điệu quê hương (4 tiết); Chủ đề 8: Nhịp điệu mùa hè & Kiểm tra cuối kì 2 (4 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1TC2b, 2.1TC2b; AI 8.A1.1; Lồng ghép QPAN.',
    rawLessons: [
      {
        id: 'an8-cd5',
        week: 'HKII (Tiết 19–22 | PPCT 38, 40, 42, 44)',
        lessonName: 'Chủ đề 5: Chào xuân (Học bài hát: Ngày Tết quê em; TTÂN: Nhạc sĩ Trần Hoàn và ca khúc Một mùa xuân nho nhỏ; LTÂN: Nhịp 6/8; Đọc nhạc: Bài đọc nhạc số 3; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 38, 40, 42, 44',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Ngày Tết quê em; nêu đôi nét về cuộc đời và sự nghiệp sáng tác của nhạc sĩ Trần Hoàn và ca khúc Một mùa xuân nho nhỏ; nêu được đặc điểm của nhịp 6/8, so sánh nhịp 3/8 và 6/8; đọc đúng và ghép lời ca vào Bài đọc nhạc số 3. Lồng ghép QPAN (Tiết PPCT 40): Giáo dục HS biết về lịch sử hào hùng của dân tộc, cố gắng phấn đấu trong học tập và rèn luyện để xây dựng đất nước.',
      },
      {
        id: 'an8-cd6-gk2',
        week: 'HKII (Tiết 23–27 | PPCT 46, 48, 50, 52, 54)',
        lessonName: 'Chủ đề 6: Âm nhạc nước ngoài (Học bài hát: Hát lên cho ngày mai; Nghe nhạc: Bài hát Trở về Suriento; Nhạc cụ: Recorder - Kèn phím; LTÂN: Gam thứ, giọng thứ, giọng La thứ; Đọc nhạc: Bài đọc nhạc số 4; Vận dụng - Sáng tạo & Kiểm tra giữa kì 2)',
        periodAllocation: 'Tiết PPCT 46, 48, 50, 52, 54',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Hát lên cho ngày mai (biết hát theo nhịp độ nhanh dần); nghe và cảm nhận bài hát Trở về Suriento; chơi được Bài đọc nhạc số 3 trên recorder và bài Trở về Suriento trên kèn phím; biết đặc điểm của gam thứ, giọng thứ, giọng La thứ và đọc đúng Bài đọc nhạc số 4; kiểm tra thực hành giữa kì II (Tiết PPCT 54). Định hướng phát triển AI: Tích hợp AI 8.A1.1 (Tiết PPCT 46).',
      },
      {
        id: 'an8-cd7',
        week: 'HKII (Tiết 28–31 | PPCT 56, 58, 60, 62)',
        lessonName: 'Chủ đề 7: Giai điệu quê hương (Học bài hát: Soi bóng bên hồ; TTÂN: Đàn nguyệt và đàn tính; LTÂN: Đảo phách; Đọc nhạc: Bài đọc nhạc số 5; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 56, 58, 60, 62',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Soi bóng bên hồ; nhận biết đặc điểm và âm sắc của đàn nguyệt và đàn tính; biết đặc điểm và thể hiện được đảo phách ở một số bản nhạc; đọc đúng tên nốt, cao độ, trường độ và đặt lời mới theo giai điệu Bài đọc nhạc số 5. Định hướng phát triển NLS: Tích hợp NLS 1.1TC2b (Tiết PPCT 56).',
      },
      {
        id: 'an8-cd8-ck2',
        week: 'HKII (Tiết 32–35 | PPCT 64, 66, 68, 70)',
        lessonName: 'Chủ đề 8: Nhịp điệu mùa hè (Nghe nhạc: Bài hát Xôn xao mùa hè; TTÂN: Nhạc sĩ Frederic Chopin và tác phẩm Khúc tùy hứng giọng Đô thăng thứ; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kì 2)',
        periodAllocation: 'Tiết PPCT 64, 66, 68, 70',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Cảm nhận giai điệu bài hát Xôn xao mùa hè; biết đôi nét về cuộc đời, thành tựu âm nhạc của nhạc sĩ F. Chopin và tác phẩm Khúc tùy hứng giọng Đô thăng thứ; thể hiện được bài Row, row, row your boat trên recorder hoặc hòa tấu bài Trở về Suriento trên kèn phím; kiểm tra thực hành cuối kì II (Tiết PPCT 70). Định hướng phát triển NLS - AI: Tích hợp AI 8.A1.1 (Tiết PPCT 64) và NLS 2.1TC2b (Tiết PPCT 68).',
      },
    ],
  }),
];

export const GRADE9_AM_NHAC_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-amnhac-hk1',
    grade: 9,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN9-HK1',
    chapterTitle:
      'Âm nhạc 9 – Học kì I: Chủ đề 1 (Nối vòng tay lớn), Chủ đề 2 (Khát vọng tuổi trẻ), Chủ đề 3 (Kỉ niệm dưới mái trường) & Chủ đề 4 (Giai điệu quê hương)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Tiết PPCT chẵn 2..36)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1: Nối vòng tay lớn (4 tiết); Chủ đề 2: Khát vọng tuổi trẻ & Kiểm tra giữa kỳ 1 (5 tiết); Chủ đề 3: Kỉ niệm dưới mái trường (4 tiết); Chủ đề 4: Giai điệu quê hương & Kiểm tra cuối kì 1 (5 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1TC2b, 3.1TC2b; AI 9.A1.1; Lồng ghép QPAN.',
    rawLessons: [
      {
        id: 'an9-cd1',
        week: 'HKI (Tiết 1–4 | PPCT 2, 4, 6, 8)',
        lessonName: 'Chủ đề 1: Nối vòng tay lớn (Học bài hát: Nối vòng tay lớn; Đọc nhạc: Bài đọc nhạc số 1; LTÂN: Sơ lược về quãng, cách xác định và gọi tên quãng; TTÂN: Nhạc sĩ Huy Du và bài hát Đường chúng ta đi; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 2, 4, 6, 8',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Nối vòng tay lớn; đọc đúng tên nốt, cao độ, trường độ và ghép lời Bài đọc nhạc số 1; nêu được khái niệm về quãng, cách xác định và gọi tên quãng theo độ lớn số lượng, chất; nêu đôi nét về nhạc sĩ Huy Du và bài hát Đường chúng ta đi. Lồng ghép QPAN (Tiết PPCT 2 & 6): Giáo dục HS biết phát huy truyền thống hiếu học, tinh thần yêu nước, tình đoàn kết, biết về lịch sử hào hùng của dân tộc để xây dựng đất nước.',
      },
      {
        id: 'an9-cd2-gk1',
        week: 'HKI (Tiết 5–9 | PPCT 10, 12, 14, 16, 18)',
        lessonName: 'Chủ đề 2: Khát vọng tuổi trẻ (Học bài hát: Bảy sắc cầu vồng; Nghe nhạc: Bài hát Thời thanh niên sôi nổi; TTÂN: Kèn oboe và kèn cor; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra giữa kỳ 1)',
        periodAllocation: 'Tiết PPCT 10, 12, 14, 16, 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Bảy sắc cầu vồng với hình thức hát hai bè; nghe và cảm nhận bài hát Thời thanh niên sôi nổi; nêu đặc điểm và phân biệt âm sắc của kèn oboe và kèn cor; thể hiện bài hòa tấu Chiếc cầu Luân Đôn (London Bridge) bằng recorder hoặc bài Vui đến trường (Happy school) bằng kèn phím; kiểm tra thực hành giữa kì I (Tiết PPCT 18). Định hướng phát triển AI: Tích hợp AI 9.A1.1 (Tiết PPCT 10).',
      },
      {
        id: 'an9-cd3',
        week: 'HKI (Tiết 10–13 | PPCT 20, 22, 24, 26)',
        lessonName: 'Chủ đề 3: Kỉ niệm dưới mái trường (Học bài hát: Tháng năm học trò; TTÂN: Một số thể loại nhạc đàn; LTÂN: Sơ lược về dịch giọng; Đọc nhạc: Bài đọc nhạc số 2; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 20, 22, 24, 26',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng cao độ, trường độ, sắc thái bài hát Tháng năm học trò; nhận biết và nêu được đặc điểm một số thể loại nhạc đàn; nêu sơ lược về dịch giọng; đọc đúng cao độ gam La thứ và ghép lời ca vào Bài đọc nhạc số 2 kết hợp gõ đệm. Định hướng phát triển NLS: Tích hợp NLS 1.1TC2b (Tiết PPCT 22).',
      },
      {
        id: 'an9-cd4-ck1',
        week: 'HKI (Tiết 14–18 | PPCT 28, 30, 32, 34, 36)',
        lessonName: 'Chủ đề 4: Giai điệu quê hương (Học bài hát: Lí ngựa ô - Dân ca Nam Bộ; Nghe nhạc: Lí ngựa ô - Dân ca Trung Bộ; TTÂN: Nhã nhạc Cung đình Huế; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kì 1)',
        periodAllocation: 'Tiết PPCT 28, 30, 32, 34, 36',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Lí ngựa ô (Dân ca Nam Bộ); nghe và cảm nhận bài Lí ngựa ô (Dân ca Trung Bộ); nhận biết và nêu được vài nét đặc trưng về Nhã nhạc Cung đình Huế; thể hiện được nốt Si giáng trong bài Cùng múa vui trên recorder hoặc kèn phím; kiểm tra thực hành cuối kì I (Tiết PPCT 36). Định hướng phát triển NLS - AI: Tích hợp AI 9.A1.1 (Tiết PPCT 30: Nhã nhạc Cung đình Huế) và NLS 3.1TC2b (Tiết PPCT 34).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-amnhac-hk2',
    grade: 9,
    subject: 'Nghệ thuật (Âm nhạc)',
    chapterCode: 'ÂN9-HK2',
    chapterTitle:
      'Âm nhạc 9 – Học kì II: Chủ đề 5 (Trái đất xanh), Chủ đề 6 (Tiếng hát hòa bình), Chủ đề 7 (Âm nhạc nước ngoài) & Chủ đề 8 (Một thời để nhớ)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Tiết PPCT chẵn 38..70)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5: Trái đất xanh (4 tiết); Chủ đề 6: Tiếng hát hòa bình & Kiểm tra giữa kì 2 (5 tiết); Chủ đề 7: Âm nhạc nước ngoài (4 tiết); Chủ đề 8: Một thời để nhớ & Kiểm tra cuối kì 2 (4 tiết). Định hướng NLS - AI & Lồng ghép: NLS 2.1TC2b; AI 9.A1.1; Lồng ghép QPAN.',
    rawLessons: [
      {
        id: 'an9-cd5',
        week: 'HKII (Tiết 19–22 | PPCT 38, 40, 42, 44)',
        lessonName: 'Chủ đề 5: Trái đất xanh (Học bài hát: Ngôi nhà của chúng ta; Nghe nhạc: Tác phẩm Mùa xuân của A.Vivaldi; LTÂN: Sơ lược về hợp âm; Đọc nhạc: Bài đọc nhạc số 3; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 38, 40, 42, 44',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Ngôi nhà của chúng ta; cảm nhận giai điệu, vẻ đẹp của tác phẩm Mùa xuân của nhạc sĩ A.Vivaldi; hiểu được một số kí hiệu, khái niệm về hợp âm và cách xây dựng hợp âm; đọc đúng tên nốt, cao độ, trường độ theo bè Bài đọc nhạc số 3. Lồng ghép QPAN (Tiết PPCT 38): Giáo dục HS nhận thức được tinh thần trách nhiệm bảo vệ Tổ quốc, tinh thần hòa bình và đoàn kết toàn cầu, lên án chiến tranh và tôn trọng chủ quyền, sự bình yên của các quốc gia trên thế giới.',
      },
      {
        id: 'an9-cd6-gk2',
        week: 'HKII (Tiết 23–27 | PPCT 46, 48, 50, 52, 54)',
        lessonName: 'Chủ đề 6: Tiếng hát hòa bình (Học bài hát: Nụ cười; Nghe nhạc: Bài hát Chúng em cần hòa bình; Nhạc cụ: Recorder - Kèn phím; TTÂN: Đàn đá và đàn đáy; Vận dụng - Sáng tạo & Kiểm tra giữa kì 2)',
        periodAllocation: 'Tiết PPCT 46, 48, 50, 52, 54',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca bài hát Nụ cười (thể hiện đoạn 1 theo hình thức bè đuổi); nghe và cảm nhận bài hát Chúng em cần hòa bình; chơi được bài Donna Donna trên recorder hoặc bài Deck the Halls trên kèn phím; nhận biết đặc điểm và âm sắc của đàn đá và đàn đáy; kiểm tra thực hành giữa kì II (Tiết PPCT 54). Lồng ghép QPAN (Tiết PPCT 46): Giáo dục HS nhận thức được tinh thần trách nhiệm xây dựng và bảo vệ Tổ quốc, ủng hộ tình hữu nghị, đoàn kết và lên án chiến tranh đối với các nước trên toàn thế giới.',
      },
      {
        id: 'an9-cd7',
        week: 'HKII (Tiết 28–31 | PPCT 56, 58, 60, 62)',
        lessonName: 'Chủ đề 7: Âm nhạc nước ngoài (Học bài hát: Donna Donna; TTÂN: Nhạc sĩ Franz Peter Schubert và khúc nhạc Serenade; LTÂN: Một số hợp âm của giọng Đô trưởng và giọng La thứ; Đọc nhạc: Bài đọc nhạc số 4; Vận dụng - Sáng tạo)',
        periodAllocation: 'Tiết PPCT 56, 58, 60, 62',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Donna Donna; biết đôi nét về cuộc đời, thành tựu âm nhạc của nhạc sĩ Franz Peter Schubert và khúc nhạc Serenade; nhận biết một số hợp âm ba trên bậc I, IV, V của giọng Đô trưởng và giọng La thứ; đọc đúng Bài đọc nhạc số 4 kết hợp gõ đệm hoặc đánh nhịp. Định hướng phát triển NLS: Tích hợp NLS 2.1TC2b (Tiết PPCT 58).',
      },
      {
        id: 'an9-cd8-ck2',
        week: 'HKII (Tiết 32–35 | PPCT 64, 66, 68, 70)',
        lessonName: 'Chủ đề 8: Một thời để nhớ (Học bài hát: Một thời để nhớ; Nghe nhạc: Bài hát Khi tóc thầy bạc trắng; Nhạc cụ: Recorder - Kèn phím; Vận dụng - Sáng tạo & Kiểm tra cuối kì 2)',
        periodAllocation: 'Tiết PPCT 64, 66, 68, 70',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hát đúng giai điệu, lời ca, sắc thái bài hát Một thời để nhớ (biết hát theo hình thức hát bè); nghe và cảm nhận bài hát Khi tóc thầy bạc trắng; thể hiện đúng cao độ, trường độ trích đoạn bài hát Tháng năm học trò trên recorder hoặc kèn phím; kiểm tra thực hành cuối kì II (Tiết PPCT 70). Định hướng phát triển AI: Tích hợp AI 9.A1.1 (Tiết PPCT 64).',
      },
    ],
  }),
];

// ============================================================================
// 1.7. MÔN NGHỆ THUẬT – PHÂN MÔN MĨ THUẬT (KHỐI 6, 7, 8, 9 – 35 TIẾT/NĂM)
// ============================================================================

export const GRADE6_MI_THUAT_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-mithuat-hk1',
    grade: 6,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT6-HK1',
    chapterTitle:
      'Mĩ thuật 6 – Học kì I: Chủ đề 1 (Xây dựng ý tưởng trong sáng tác mĩ thuật), Chủ đề 2 (Ngôi nhà yêu thương), Chủ đề 3 (Hoạt động trong trường học) & Chủ đề 4 (Mĩ thuật thời kỳ tiền sử)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Bài 1 đến Bài 9, Tiết PPCT lẻ 1..35)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1 (Bài 1–2, 4 tiết); Chủ đề 2 (Bài 3–4 & KT giữa kì I, 4 tiết); Chủ đề 3 (Bài 5–6, 4 tiết); Chủ đề 4 (Bài 7–9 & KT cuối kì I, 6 tiết). Định hướng NLS: Tích hợp NLS 1.1.TC1a, 2.1.TC1a, 3.1.TC1a, 5.3.TC1b, 1.1.TC1b.',
    rawLessons: [
      {
        id: 'mt6-cd1-b1-b2',
        week: 'HKI (Tiết PPCT 1–3, 5–7)',
        lessonName: 'Chủ đề 1: Xây dựng ý tưởng trong sáng tác mĩ thuật – Bài 1: Một số thể loại mĩ thuật (2 tiết) & Bài 2: Xây dựng ý tưởng trong sáng tác theo chủ đề (2 tiết)',
        periodAllocation: 'Tiết PPCT 1–3, 5–7',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết được một số đặc điểm cơ bản của mĩ thuật tạo hình và mĩ thuật ứng dụng thông qua tìm hiểu một số tác phẩm/sản phẩm mĩ thuật; nhận biết vẻ đẹp của một bức tranh, tượng và sử dụng chất liệu thực hiện sản phẩm mĩ thuật; xác định nội dung của chủ đề, biết khai thác hình ảnh trong thiên nhiên, cuộc sống để thể hiện về chủ đề và phân tích được yếu tố, nguyên lí tạo hình. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a, 2.1.TC1a tại Bài 1.',
      },
      {
        id: 'mt6-cd2-b3-b4',
        week: 'HKI (Tiết PPCT 9–11, 13–15)',
        lessonName: 'Chủ đề 2: Ngôi nhà yêu thương – Bài 3: Tạo hình ngôi nhà (2 tiết) & Bài 4: Thiết kế quà lưu niệm + KIỂM TRA GIỮA KÌ I (2 tiết)',
        periodAllocation: 'Tiết PPCT 9–11, 13–15',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết hình dáng, đặc điểm của ngôi nhà và sử dụng các yếu tố tạo hình (nét, hình, khối, màu sắc) để thể hiện sản phẩm mĩ thuật về ngôi nhà ở dạng 2D và 3D; xác định mục đích sử dụng của sản phẩm mĩ thuật có tính ứng dụng, hoàn thành sản phẩm quà lưu niệm đúng quy trình. Kiểm tra giữa kì I. Định hướng phát triển NLS: Tích hợp NLS 3.1.TC1a, 5.3.TC1b tại Bài 4.',
      },
      {
        id: 'mt6-cd3-b5-b6',
        week: 'HKI (Tiết PPCT 17–19, 21–23)',
        lessonName: 'Chủ đề 3: Hoạt động trong trường học – Bài 5: Tạo hình hoạt động trong nhà trường (2 tiết) & Bài 6: Thiết kế đồ chơi (2 tiết)',
        periodAllocation: 'Tiết PPCT 17–19, 21–23',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hình thành kĩ năng quan sát, khai thác hình ảnh hoạt động trong nhà trường và sử dụng nét, hình, màu, khối để thể hiện dáng người; xác định mục đích sử dụng của sản phẩm đồ chơi và biết sử dụng những vật liệu sẵn có để tạo những món đồ chơi phù hợp với lứa tuổi.',
      },
      {
        id: 'mt6-cd4-b7-b9',
        week: 'HKI (Tiết PPCT 25–27, 29–31, 33–35)',
        lessonName: 'Chủ đề 4: Mĩ thuật thời kỳ tiền sử – Bài 7: Mĩ thuật thế giới thời kì tiền sử (2 tiết); Bài 8: Mĩ thuật Việt Nam thời kì tiền sử (2 tiết) & Bài 9: Sáng tạo mĩ thuật với trò chơi dân gian + KIỂM TRA CUỐI KÌ I (2 tiết)',
        periodAllocation: 'Tiết PPCT 25–27, 29–31, 33–35',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Biết được một số di sản mĩ thuật thế giới và Việt Nam thời kì Tiền sử; biết cách khai thác vẻ đẹp tạo hình ở thời kì này trong mô phỏng, trang trí sản phẩm mĩ thuật; biết khai thác hình ảnh từ trò chơi dân gian và sử dụng chấm, nét, hình, màu, khối để thể hiện hoạt động trong trò chơi dân gian. Kiểm tra cuối kì I. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a, 2.1.TC1a (Bài 8) và NLS 1.1.TC1b, 3.1.TC1a (Bài 9).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-mithuat-hk2',
    grade: 6,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT6-HK2',
    chapterTitle:
      'Mĩ thuật 6 – Học kì II: Chủ đề 5 (Trò chơi dân gian), Chủ đề 6 (Sắc màu lễ hội), Chủ đề 7 (Hoạt động trong trường học) & Chủ đề 8 (Mĩ thuật thời kỳ cổ đại)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Bài 10 đến Bài 16, Tiết PPCT lẻ 37..69)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 (Bài 10: Thiết kế thiệp chúc mừng, 2 tiết); Chủ đề 6 (Bài 11–12: Sắc màu lễ hội, 4 tiết); Chủ đề 7 (Bài 13–14 & KT giữa kì II, 5 tiết); Chủ đề 8 (Bài 15–16: Mĩ thuật thời kỳ cổ đại, KT cuối kì II & Trưng bày tổng kết năm, 6 tiết). Định hướng NLS - AI & Lồng ghép: NLS 1.1.TC1a, 2.1.TC1a; AI 8.A2.1, 8.D2.1; Lồng ghép ANQP.',
    rawLessons: [
      {
        id: 'mt6-cd5-cd6-b10-b12',
        week: 'HKII (Tiết PPCT 37–39, 41–43, 45–47)',
        lessonName: 'Chủ đề 5: Trò chơi dân gian – Bài 10: Thiết kế thiệp chúc mừng (2 tiết); Chủ đề 6: Sắc màu lễ hội – Bài 11: Hoà sắc trong tranh chủ đề lễ hội (2 tiết) & Bài 12: Màu sắc lễ hội trong thiết kế lịch treo tường (2 tiết)',
        periodAllocation: 'Tiết PPCT 37–39, 41–43, 45–47',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Thực hiện được việc kết hợp các màu và họa tiết để tạo nên một hoà sắc chung trong thiệp chúc mừng và trong tranh chủ đề lễ hội; sử dụng màu sắc đặc trưng của lễ hội, tạo bố cục màu trong thiết kế lịch treo tường và phân tích yếu tố sắc độ của màu. Lồng ghép ANQP tại Bài 10: Hướng dẫn HS làm thiệp chúc mừng gửi tặng các chú Bộ đội để tỏ lòng biết ơn.',
      },
      {
        id: 'mt6-cd7-b13-b14',
        week: 'HKII (Tiết PPCT 49–51, 53, 55–57)',
        lessonName: 'Chủ đề 7: Hoạt động trong trường học – Bài 13: Sáng tạo mĩ thuật với hình ảnh trong cuộc sống (2 tiết); KIỂM TRA GIỮA KÌ II (1 tiết, PPCT 53) & Bài 14: Thiết kế thời gian biểu (2 tiết)',
        periodAllocation: 'Tiết PPCT 49–51, 53, 55–57',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Biết và sử dụng được đường nét, màu sắc để thể hiện sản phẩm mĩ thuật về cuộc sống thường ngày; phân tích mối liên hệ giữa mĩ thuật với cuộc sống; biết cách sử dụng hình ảnh, biểu tượng và nét tạo hình cách điệu để thiết kế thời gian biểu hằng ngày và trang trí đồ dùng học tập. Kiểm tra giữa kì II (Tiết PPCT 53).',
      },
      {
        id: 'mt6-cd8-b15-b16-ck2',
        week: 'HKII (Tiết PPCT 59–61, 63–65, 67, 69)',
        lessonName: 'Chủ đề 8: Mĩ thuật thời kỳ cổ đại – Bài 15: Mĩ thuật thế giới thời kì cổ đại (2 tiết); Bài 16: Mĩ thuật Việt Nam thời kì cổ đại (2 tiết); KIỂM TRA CUỐI KÌ II (1 tiết, PPCT 67) & Trưng bày sản phẩm tổng kết năm (1 tiết, PPCT 69)',
        periodAllocation: 'Tiết PPCT 59–61, 63–65, 67, 69',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Biết được một số di sản mĩ thuật thế giới và Việt Nam thời kì Cổ đại; khai thác giá trị tạo hình và một số hoa văn thời kì Cổ đại trong mô phỏng, thiết kế, trang trí một sản phẩm mĩ thuật; nhận xét, phân tích cách sử dụng màu, đường nét và bố cục trong các sản phẩm trưng bày tổng kết năm. Kiểm tra cuối kì II (Tiết PPCT 67). Định hướng phát triển NLS - AI: Tích hợp AI 8.A2.1, 8.D2.1 (Bài 15) và NLS 1.1.TC1a, 2.1.TC1a (Bài 16).',
      },
    ],
  }),
];

export const GRADE7_MI_THUAT_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-mithuat-hk1',
    grade: 7,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT7-HK1',
    chapterTitle:
      'Mĩ thuật 7 – Học kì I: Chủ đề 1 (Mĩ thuật thế giới thời kì trung đại), Chủ đề 2 (Vẻ đẹp di tích), Chủ đề 3 (Yếu tố dân tộc trong mĩ thuật), Chủ đề 4 (Vẻ đẹp trong tác phẩm hội họa) & Bài 9',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Bài 1 đến Bài 9, Tiết PPCT lẻ 1..35)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1 (Bài 1–2, 4 tiết); Chủ đề 2 (Bài 3–4 & KT giữa kì I, 4 tiết); Chủ đề 3 (Bài 5–6, 4 tiết); Chủ đề 4 (Bài 7–8 & KT cuối kì I, 4 tiết); Chủ đề 5 phần đầu (Bài 9: Tìm hiểu nguồn sáng trong tranh, 2 tiết). Định hướng NLS & Lồng ghép: NLS 1.1.TC1a, 2.1.TC1a, 5.3.TC1b; Lồng ghép ANQP.',
    rawLessons: [
      {
        id: 'mt7-cd1-b1-b2',
        week: 'HKI (Tiết PPCT 1–3, 5–7)',
        lessonName: 'Chủ đề 1: Mĩ thuật thế giới thời kì trung đại – Bài 1: Mĩ thuật tạo hình thời kì trung đại (2 tiết) & Bài 2: Mĩ thuật ứng dụng thời kì trung đại (2 tiết)',
        periodAllocation: 'Tiết PPCT 1–3, 5–7',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hình thành, phát triển kĩ năng quan sát; biết khai thác giá trị tạo hình và hoa văn trang trí ở thời kì Trung đại trong mô phỏng, thiết kế, trang trí một SPMT; lựa chọn công cụ, vật liệu phù hợp để tạo sản phẩm, trưng bày và giới thiệu sản phẩm của cá nhân/nhóm. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a, 2.1.TC1a tại Bài 1.',
      },
      {
        id: 'mt7-cd2-b3-b4',
        week: 'HKI (Tiết PPCT 9–11, 13–15)',
        lessonName: 'Chủ đề 2: Vẻ đẹp di tích – Bài 3: Hình ảnh di tích trong sáng tạo mĩ thuật (2 tiết) & Bài 4: Hình ảnh di tích trong thiết kế tem bưu chính + KIỂM TRA GIỮA KÌ I (2 tiết)',
        periodAllocation: 'Tiết PPCT 9–11, 13–15',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Biết khai thác vốn văn hóa truyền thống và mối quan hệ giữa cảnh quan, không gian di tích để chủ động sử dụng hình, màu/khối thể hiện SPMT; biết chọn lọc sử dụng hình ảnh di tích văn hóa - lịch sử ở địa phương trong sáng tạo thiết kế tem bưu chính. Kiểm tra giữa kì I.',
      },
      {
        id: 'mt7-cd3-b5-b6',
        week: 'HKI (Tiết PPCT 17–19, 21–23)',
        lessonName: 'Chủ đề 3: Yếu tố dân tộc trong mĩ thuật – Bài 5: Yếu tố dân tộc trong tranh của một số họa sĩ (2 tiết) & Bài 6: Thiết kế logo (2 tiết)',
        periodAllocation: 'Tiết PPCT 17–19, 21–23',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Biết được một số yếu tố dân tộc được thể hiện trong tranh xoay quanh đề tài, màu sắc, cách thể hiện; nêu được tính chất biểu tượng của logo thương hiệu, biết tìm ý tưởng và thiết kế được logo lớp học đơn giản. Lồng ghép ANQP tại Bài 5: Thể hiện lòng kính trọng, yêu quý qua cách thể hiện tác phẩm về các lực lượng Quân đội Nhân dân Việt Nam và Công an Nhân dân Việt Nam đang bảo vệ Tổ quốc. Định hướng phát triển NLS: Tích hợp NLS 5.3.TC1b, 2.1.TC1a tại Bài 6.',
      },
      {
        id: 'mt7-cd4-cd5-b7-b9',
        week: 'HKI (Tiết PPCT 25–27, 29–31, 33–35)',
        lessonName: 'Chủ đề 4: Vẻ đẹp trong tác phẩm hội họa – Bài 7: Không gian trong tác phẩm hội họa thế giới thời kì trung đại (2 tiết); Bài 8: Tranh tĩnh vật + KIỂM TRA CUỐI KÌ I (2 tiết) & Chủ đề 5: Bài 9: Tìm hiểu nguồn sáng trong tranh (2 tiết)',
        periodAllocation: 'Tiết PPCT 25–27, 29–31, 33–35',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Biết khai thác không gian trong TPMT thời kì Trung đại và thể hiện được không gian trong tranh tĩnh vật bằng cách xây dựng bố cục và màu sắc; xác định được nguồn sáng và bóng đổ trong tranh. Kiểm tra cuối kì I (Tiết PPCT 29–31).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-mithuat-hk2',
    grade: 7,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT7-HK2',
    chapterTitle:
      'Mĩ thuật 7 – Học kì II: Chủ đề 5 (Hiện thực cuộc sống trong sáng tạo mĩ thuật), Chủ đề 6 (Tạo hình ngôi nhà), Chủ đề 7 (Sum họp gia đình) & Chủ đề 8 (Mĩ thuật Việt Nam thời kì trung đại)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Bài 10 đến Bài 16, Tiết PPCT lẻ 37..69)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 tiếp (Bài 10: Thiết kế tạo mẫu trang phục, 2 tiết); Chủ đề 6 (Bài 11–12: Tạo hình ngôi nhà từ vật liệu sẵn có & Tranh cổ động, 4 tiết); Chủ đề 7 (Bài 13–14: Sum họp gia đình & KT giữa HKII, 5 tiết); Chủ đề 8 (Bài 15–16: Mĩ thuật Việt Nam thời kì trung đại, KT cuối kì II & Trưng bày tổng kết năm, 6 tiết). Định hướng NLS - AI: NLS 5.3.TC1b, 2.1.TC1a, 1.1.TC1b, 3.1.TC1a; AI 8.A2.1, 8.D2.1.',
    rawLessons: [
      {
        id: 'mt7-cd5-cd6-b10-b12',
        week: 'HKII (Tiết PPCT 37–39, 41–43, 45–47)',
        lessonName: 'Chủ đề 5 (tiếp): Bài 10: Thiết kế tạo mẫu trang phục (2 tiết); Chủ đề 6: Tạo hình ngôi nhà trong sáng tạo mĩ thuật – Bài 11: Tạo hình ngôi nhà từ vật liệu sẵn có (2 tiết) & Bài 12: Tranh cổ động (2 tiết)',
        periodAllocation: 'Tiết PPCT 37–39, 41–43, 45–47',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Xác định được phong cách chủ đạo, ngôn ngữ thiết kế trong bộ trang phục đơn giản; khai thác, tìm ý tưởng tạo hình ngôi nhà từ vật liệu đã qua sử dụng; biết cảm nhận vẻ đẹp và hiểu ý nghĩa tạo hình trong tranh cổ động, vẽ được tranh cổ động có tạo hình ngôi nhà theo đúng chủ đề tuyên truyền bảo vệ môi trường. Định hướng phát triển NLS - AI: Tích hợp NLS 5.3.TC1b, 2.1.TC1a (Bài 10); AI 8.A2.1, 8.D2.1 (Bài 11); NLS 1.1.TC1b, 3.1.TC1a & BVMT (Bài 12).',
      },
      {
        id: 'mt7-cd7-b13-b14',
        week: 'HKII (Tiết PPCT 49–51, 53, 55–57)',
        lessonName: 'Chủ đề 7: Sum họp gia đình – Bài 13: Đề tài gia đình trong sáng tạo mĩ thuật (2 tiết); KIỂM TRA GIỮA HKII (1 tiết, PPCT 53) & Bài 14: Thiết kế khung ảnh từ vật liệu sẵn có (2 tiết)',
        periodAllocation: 'Tiết PPCT 49–51, 53, 55–57',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Biết khai thác những kỉ niệm đẹp, sinh hoạt hằng ngày ở gia đình để tạo tác phẩm mĩ thuật bằng các hình thức vẽ, in độc bản, nặn; vận dụng tính chất đậm nhạt của màu và nhịp điệu của hoa văn trong thiết kế khung ảnh bằng vật liệu sẵn có. Kiểm tra giữa HKII (Tiết PPCT 53).',
      },
      {
        id: 'mt7-cd8-b15-b16-ck2',
        week: 'HKII (Tiết PPCT 59–61, 63–65, 67, 69)',
        lessonName: 'Chủ đề 8: Mĩ thuật Việt Nam thời kì trung đại – Bài 15: Di sản mĩ thuật Việt Nam thời kì trung đại (2 tiết); Bài 16: Khai thác giá trị tạo hình truyền thống trong trang trí đồ vật (2 tiết); KIỂM TRA CUỐI KÌ II (1 tiết, PPCT 67) & Trưng bày sản phẩm tổng kết năm (1 tiết, PPCT 69)',
        periodAllocation: 'Tiết PPCT 59–61, 63–65, 67, 69',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Biết được một số đặc điểm về nghệ thuật tạo hình và giá trị thẩm mĩ của sản phẩm mĩ thuật có tính ứng dụng ở thời kì Trung đại ở Việt Nam; khai thác giá trị nghệ thuật của di sản trong trang trí đồ vật; trưng bày và phân tích các sản phẩm tổng kết năm. Kiểm tra cuối kì II (Tiết PPCT 67). Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1b, 2.1.TC1a tại Bài 16.',
      },
    ],
  }),
];

export const GRADE8_MI_THUAT_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-mithuat-hk1',
    grade: 8,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT8-HK1',
    chapterTitle:
      'Mĩ thuật 8 – Học kì I: Chủ đề 1 (Hình tượng con người trong mĩ thuật), Chủ đề 2 (Vẻ đẹp trong nghệ thuật truyền thống), Chủ đề 3 (Niềm vui, hạnh phúc) & Chủ đề 4 (Mĩ thuật thế giới thời kì hiện đại)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Bài 1 đến Bài 9, Tiết PPCT lẻ 1..35)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1 (Bài 1–2, 4 tiết); Chủ đề 2 (Bài 3–4 & KT giữa kì I, 4 tiết); Chủ đề 3 (Bài 5–6, 4 tiết); Chủ đề 4 (Bài 7–9 & KT cuối kì I, 6 tiết). Định hướng NLS & Lồng ghép: NLS 3.1.TC2a, 2.1.TC2a, 1.1.TC2b, 1.1.TC2a; Lồng ghép ANQP.',
    rawLessons: [
      {
        id: 'mt8-cd1-b1-b2',
        week: 'HKI (Tiết PPCT 1–3, 5–7)',
        lessonName: 'Chủ đề 1: Hình tượng con người trong mĩ thuật – Bài 1: Hình tượng con người trong sáng tạo mĩ thuật (2 tiết) & Bài 2: Một số dạng bố cục trong tranh sinh hoạt (2 tiết)',
        periodAllocation: 'Tiết PPCT 1–3, 5–7',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hiểu về cách thức tạo hình con người trong sáng tạo mĩ thuật theo nhiều hình thức khác nhau phù hợp với tương quan tỷ lệ cơ thể người; biết cách khai thác đề tài và xây dựng bố cục tranh sinh hoạt có nhân vật làm trọng tâm. Định hướng phát triển NLS: Tích hợp NLS 3.1.TC2a, 2.1.TC2a tại Bài 1.',
      },
      {
        id: 'mt8-cd2-b3-b4',
        week: 'HKI (Tiết PPCT 9–11, 13–15)',
        lessonName: 'Chủ đề 2: Vẻ đẹp trong nghệ thuật truyền thống – Bài 3: Nghệ thuật truyền thống (2 tiết) & Bài 4: Thiết kế trang phục với hoa văn dân tộc thiểu số + KIỂM TRA GIỮA KÌ I (2 tiết)',
        periodAllocation: 'Tiết PPCT 9–11, 13–15',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Hiểu được vẻ đẹp nghệ thuật truyền thống của một số đồng bào dân tộc; có kỹ năng thu thập tư liệu, khai thác tài liệu cho việc thực hiện sản phẩm mĩ thuật; nhận biết tính tượng trưng, tính biểu tượng trong tạo hình hoa văn trên trang phục truyền thống của một số đồng bào dân tộc thiểu số và vận dụng vào thiết kế trang phục. Kiểm tra giữa kì I. Lồng ghép ANQP tại Bài 3: Giáo dục lòng tự hào, tự tôn dân tộc và sức mạnh đoàn kết của dân tộc trong đấu tranh và bảo vệ Tổ quốc.',
      },
      {
        id: 'mt8-cd3-b5-b6',
        week: 'HKI (Tiết PPCT 17–19, 21–23)',
        lessonName: 'Chủ đề 3: Niềm vui, hạnh phúc – Bài 5: Tác phẩm hội hoạ chủ đề Niềm vui, hạnh phúc (2 tiết) & Bài 6: Thiết kế quà sinh nhật từ vật liệu sẵn có (2 tiết)',
        periodAllocation: 'Tiết PPCT 17–19, 21–23',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết các yếu tố tạo hình làm nổi bật chủ đề niềm vui, hạnh phúc trong tác phẩm; hiểu được vai trò của thiết kế trong tạo dáng sản phẩm, sử dụng mầu sắc tự thân của vật liệu sẵn có để thiết kế, trang trí sản phẩm quà sinh nhật đẹp mắt.',
      },
      {
        id: 'mt8-cd4-b7-b9',
        week: 'HKI (Tiết PPCT 25–27, 29–31, 33–35)',
        lessonName: 'Chủ đề 4: Mĩ thuật thế giới thời kì hiện đại – Bài 7: Một số trường phái mĩ thuật phương Tây thời kì hiện đại (2 tiết); Bài 8: Nghệ thuật trang trí đồ gia dụng (2 tiết) & Bài 9: Vẻ đẹp người lao động trong sáng tạo mĩ thuật + KIỂM TRA CUỐI KÌ I (2 tiết)',
        periodAllocation: 'Tiết PPCT 25–27, 29–31, 33–35',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Hiểu sơ lược về mĩ thuật phương Tây thời kỳ hiện đại và đặc điểm tạo hình của một số trường phái nghệ thuật hiện đại; khai thác phong cách tạo hình hiện đại trong thiết kế, trang trí đồ gia dụng; nhận biết vẻ đẹp dáng người lao động và thực hiện bức tranh bằng kỹ thuật in nổi. Kiểm tra cuối kì I. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC2b, 3.1.TC2a (Bài 7) và NLS 1.1.TC2a, 3.1.TC2a (Bài 8).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-mithuat-hk2',
    grade: 8,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT8-HK2',
    chapterTitle:
      'Mĩ thuật 8 – Học kì II: Chủ đề 5 (Vẻ đẹp trong lao động), Chủ đề 6 (Giao thông công cộng), Chủ đề 7 (Mĩ thuật Việt Nam thời kì hiện đại) & Chủ đề 8 (Hướng nghiệp)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Bài 10 đến Bài 16, Tiết PPCT lẻ 37..69)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 (Bài 10: Nghệ thuật trổ giấy trong trang trí, 2 tiết); Chủ đề 6 (Bài 11–12: Giao thông công cộng & Thiết kế áo phông, 4 tiết); Chủ đề 7 (Bài 13–14: Mĩ thuật Việt Nam thời kì hiện đại & KT giữa kì II, 5 tiết); Chủ đề 8 (Bài 15–16: Hướng nghiệp, KT cuối kì II & Trưng bày tổng kết năm, 6 tiết). Định hướng NLS - AI: NLS 1.1.TC2a, 3.1.TC2a, 2.1.TC2a; AI 8.A2.1, 8.D2.1.',
    rawLessons: [
      {
        id: 'mt8-cd5-cd6-b10-b12',
        week: 'HKII (Tiết PPCT 37–39, 41–43, 45–47)',
        lessonName: 'Chủ đề 5: Vẻ đẹp trong lao động – Bài 10: Nghệ thuật trổ giấy trong trang trí (2 tiết); Chủ đề 6: Giao thông công cộng trong sáng tạo mĩ thuật – Bài 11: Phương tiện giao thông công cộng trong sáng tạo mĩ thuật (2 tiết) & Bài 12: Thiết kế, trang trí áo phông (2 tiết)',
        periodAllocation: 'Tiết PPCT 37–39, 41–43, 45–47',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Hiểu và vận dụng kỹ thuật trổ giấy trong thực hành làm sản phẩm trang trí trong gia đình; hiểu đặc điểm tạo hình và lợi ích của phương tiện giao thông công cộng trong xã hội hiện đại; hiểu vai trò của truyền thông qua hình ảnh và thiết kế, trang trí áo phông phục vụ văn hóa giao thông. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC2a, 3.1.TC2a tại Bài 10. Lồng ghép ATGT.',
      },
      {
        id: 'mt8-cd7-b13-b14',
        week: 'HKII (Tiết PPCT 49–51, 53, 55–57)',
        lessonName: 'Chủ đề 7: Mĩ Thuật Việt Nam thời kì hiện đại – Bài 13: Một số tác giả, tác phẩm mĩ thuật Việt Nam thời kì hiện đại (2 tiết); KIỂM TRA GIỮA KÌ II (1 tiết, PPCT 53) & Bài 14: Nghệ thuật thiết kế Việt Nam thời kì hiện đại (2 tiết)',
        periodAllocation: 'Tiết PPCT 49–51, 53, 55–57',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Hiểu biết hơn về nền mĩ thuật Việt Nam thời kỳ hiện đại qua một số tác giả, tác phẩm tiêu biểu; vận dụng kiến thức đã học xây dựng một video clip từ báo tường về nghệ thuật Việt Nam hiện đại; biết khái quát về lịch sử nghệ thuật thiết kế Việt Nam thời kỳ hiện đại và thiết kế sản phẩm mĩ thuật ứng dụng. Kiểm tra giữa kì II (Tiết PPCT 53). Định hướng phát triển AI: Tích hợp AI 8.A2.1, 8.D2.1 tại Bài 13.',
      },
      {
        id: 'mt8-cd8-b15-b16-ck2',
        week: 'HKII (Tiết PPCT 59–61, 63–65, 67, 69)',
        lessonName: 'Chủ đề 8: Hướng nghiệp – Bài 15: Ngành, nghề liên quan đến mĩ thuật tạo hình (2 tiết); Bài 16: Đặc trưng của ngành, nghề liên quan đến mĩ thuật tạo hình (2 tiết); KIỂM TRA CUỐI KÌ II (1 tiết, PPCT 67) & Trưng bày sản phẩm tổng kết năm (1 tiết, PPCT 69)',
        periodAllocation: 'Tiết PPCT 59–61, 63–65, 67, 69',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Học sinh biết được nét đặc trưng của sản phẩm, tác phẩm mĩ thuật và một số yếu tố đặc trưng của ngành nghề liên quan đến mĩ thuật tạo hình; thể hiện được kiến thức liên môn trong thực hành sáng tạo sản phẩm mĩ thuật; trưng bày và phân tích các sản phẩm tổng kết năm. Kiểm tra cuối kì II (Tiết PPCT 67). Định hướng phát triển NLS: Tích hợp NLS 3.1.TC2a, 2.1.TC2a tại Bài 16.',
      },
    ],
  }),
];

export const GRADE9_MI_THUAT_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-mithuat-hk1',
    grade: 9,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT9-HK1',
    chapterTitle:
      'Mĩ thuật 9 – Học kì I: Chủ đề 1 (Cuộc sống muôn màu), Chủ đề 2 (Nghệ thuật đương đại thế giới), Chủ đề 3 (Thiết kế mĩ thuật sách), Chủ đề 4 (Cảm hứng trong sáng tác mĩ thuật) & Bài 9',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (18 tiết – Bài 1 đến Bài 9, Tiết PPCT lẻ 1..35)',
    totalPeriods: 18,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 1 (Bài 1–2, 4 tiết); Chủ đề 2 (Bài 3–4 & KT giữa kì I, 4 tiết); Chủ đề 3 (Bài 5–6, 4 tiết); Chủ đề 4 (Bài 7–8, 4 tiết); Chủ đề 5 phần đầu (Bài 9: Tỉ lệ và hình khối của đồ vật & KT cuối kì I, 2 tiết). Định hướng NLS - AI: NLS 1.1.TC1a, 2.1.TC1a, 3.1.TC1a, 3.1.TC1b, 1.1.TC1b; AI 8.A2.1, 8.D2.1.',
    rawLessons: [
      {
        id: 'mt9-cd1-b1-b2',
        week: 'HKI (Tiết PPCT 1–3, 5–7)',
        lessonName: 'Chủ đề 1: Cuộc sống muôn màu – Bài 1: Vẻ đẹp cuộc sống trong tác phẩm mĩ thuật (2 tiết) & Bài 2: Thiết kế phụ kiện thời trang (2 tiết)',
        periodAllocation: 'Tiết PPCT 1–3, 5–7',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết vẻ đẹp cuộc sống trong tác phẩm mĩ thuật với các hình thức khác nhau; lựa chọn bố cục, mô phỏng hình ảnh có tỉ lệ phù hợp với nguyên mẫu; nhận biết vẻ đẹp của hình ảnh, họa tiết, màu sắc và tính liên kết đồng bộ giữa phụ kiện và trang phục trong thiết kế phụ kiện thời trang. Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a, 2.1.TC1a tại Bài 1.',
      },
      {
        id: 'mt9-cd2-b3-b4',
        week: 'HKI (Tiết PPCT 9–11, 13–15)',
        lessonName: 'Chủ đề 2: Nghệ thuật đương đại thế giới – Bài 3: Một số trào lưu của nghệ thuật đương đại thế giới (2 tiết) & Bài 4: Thiết kế giá đỡ thiết bị công nghệ + KIỂM TRA GIỮA KÌ I (2 tiết)',
        periodAllocation: 'Tiết PPCT 9–11, 13–15',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết và hiểu đặc điểm sáng tạo của một số trào lưu nghệ thuật đương đại trên thế giới; biết được một số kiểu dáng giá đỡ thiết bị công nghệ (điện thoại, máy tính bảng...) và vận dụng kiến thức thiết kế tạo dáng sản phẩm giá đỡ thiết bị công nghệ. Kiểm tra giữa kì I. Định hướng phát triển NLS: Tích hợp NLS 3.1.TC1a, 3.1.TC1b tại Bài 4.',
      },
      {
        id: 'mt9-cd3-b5-b6',
        week: 'HKI (Tiết PPCT 17–19, 21–23)',
        lessonName: 'Chủ đề 3: Thiết kế mĩ thuật sách – Bài 5: Thiết kế bìa sách (2 tiết) & Bài 6: Tranh minh họa (2 tiết)',
        periodAllocation: 'Tiết PPCT 17–19, 21–23',
        periodsCount: 4,
        adjustedContent:
          'YCCĐ: Nhận biết các thành phần cơ bản của một bìa sách và vận dụng kiến thức bố cục, màu sắc, nghệ thuật chữ trong thiết kế bìa sách; hiểu vai trò của tranh minh họa trong thể hiện nội dung sách và biết chuyển thể từ hình tượng văn học sang hình tượng tạo hình trong tranh minh họa. Định hướng phát triển AI: Tích hợp AI 8.A2.1, 8.D2.1 tại Bài 5.',
      },
      {
        id: 'mt9-cd4-cd5-b7-b9',
        week: 'HKI (Tiết PPCT 25–27, 29–31, 33–35)',
        lessonName: 'Chủ đề 4: Cảm hứng trong sáng tác mĩ thuật – Bài 7: Cảm hứng trong sáng tác hội họa (2 tiết); Bài 8: Thiết kế hình ảnh nhận diện thương hiệu (2 tiết) & Chủ đề 5: Bài 9: Tỉ lệ và hình khối của đồ vật + KIỂM TRA CUỐI KÌ I (2 tiết)',
        periodAllocation: 'Tiết PPCT 25–27, 29–31, 33–35',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nhận biết dạng cảm hứng sáng tạo trực tiếp và chủ quan trong sáng tác hội họa 2D; phân biệt tín hiệu nhận biết riêng biệt của thương hiệu và hiểu vai trò thiết kế hình ảnh nhận diện thương hiệu trong lĩnh vực thiết kế đồ họa; nhận biết cấu trúc tỉ lệ của đồ vật theo các khối cơ bản và mô phỏng đồ vật từ yếu tố tạo hình chấm, nét, hình, màu. Kiểm tra cuối kì I (Tiết PPCT 33–35). Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a, 2.1.TC1a (Bài 8) và NLS 1.1.TC1b, 3.1.TC1a (Bài 9).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-mithuat-hk2',
    grade: 9,
    subject: 'Nghệ thuật (Mĩ thuật)',
    chapterCode: 'MT9-HK2',
    chapterTitle:
      'Mĩ thuật 9 – Học kì II: Chủ đề 5 (Nguyên mẫu trong tác phẩm điêu khắc), Chủ đề 6 (Nghệ thuật múa rối), Chủ đề 7 (Mĩ thuật đương đại Việt Nam) & Chủ đề 8 (Hướng nghiệp)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (17 tiết – Bài 10 đến Bài 16, Tiết PPCT lẻ 37..69)',
    totalPeriods: 17,
    sourceDocument: NDA_THCS_KHXH_SOURCE_DOC,
    adjustedContentSummary:
      'Chủ đề 5 tiếp (Bài 10: Nguyên mẫu trong tác phẩm điêu khắc, 2 tiết); Chủ đề 6 (Bài 11–12: Nghệ thuật múa rối, 4 tiết); Chủ đề 7 (Bài 13–14: Mĩ thuật đương đại Việt Nam & KT giữa kì II, 5 tiết); Chủ đề 8 (Bài 15–16: Hướng nghiệp mĩ thuật ứng dụng, KT cuối kì II & Trưng bày tổng kết năm, 6 tiết). Định hướng NLS & Lồng ghép: NLS 1.1.TC1a, 2.1.TC1a; Lồng ghép ANQP.',
    rawLessons: [
      {
        id: 'mt9-cd5-cd6-b10-b12',
        week: 'HKII (Tiết PPCT 37–39, 41–43, 45–47)',
        lessonName: 'Chủ đề 5 (tiếp): Bài 10: Nguyên mẫu trong tác phẩm điêu khắc (2 tiết); Chủ đề 6: Nghệ thuật múa rối – Bài 11: Vẻ đẹp tạo hình con rối (2 tiết) & Bài 12: Tạo hình nhân vật múa rối nước (2 tiết)',
        periodAllocation: 'Tiết PPCT 37–39, 41–43, 45–47',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nhận biết và mô phỏng vẻ đẹp của nguyên mẫu trong tác phẩm điêu khắc trên bình diện kỹ thuật và phong cách; nhận biết một số loại hình múa rối, hiểu cách tạo hình con rối que, rối bóng và nhân vật múa rối nước theo kịch bản yêu cầu, có ý thức bảo tồn văn hóa truyền thống của dân tộc.',
      },
      {
        id: 'mt9-cd7-b13-b14',
        week: 'HKII (Tiết PPCT 49–51, 53, 55–57)',
        lessonName: 'Chủ đề 7: Mĩ thuật đương đại Việt Nam – Bài 13: Khuynh hướng sáng tác mĩ thuật (2 tiết); KIỂM TRA GIỮA KÌ II (1 tiết, PPCT 53) & Bài 14: Thiết kế sản phẩm đồ gia dụng từ vật liệu đã qua sử dụng (2 tiết)',
        periodAllocation: 'Tiết PPCT 49–51, 53, 55–57',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Biết đến một số khuynh hướng sáng tác và sự đa dạng của Mĩ thuật đương đại Việt Nam; hiểu biết thiết kế đồ gia dụng đảm bảo sự hài hòa giữa tính công năng và thẩm mỹ, vận dụng kiến thức tạo hình để thiết kế và trang trí sản phẩm đồ gia dụng từ vật liệu đã qua sử dụng. Kiểm tra giữa kì II (Tiết PPCT 53). Lồng ghép ANQP tại Bài 13: Hướng dẫn HS khuynh hướng sáng tác MT với một số hình ảnh về phát triển KTXH và bảo đảm QPAN.',
      },
      {
        id: 'mt9-cd8-b15-b16-ck2',
        week: 'HKII (Tiết PPCT 59–61, 63–65, 67, 69)',
        lessonName: 'Chủ đề 8: Hướng nghiệp – Bài 15: Ngành, nghề liên quan đến mĩ thuật ứng dụng (2 tiết); Bài 16: Đặc trưng của ngành, nghề liên quan đến mĩ thuật ứng dụng (2 tiết); KIỂM TRA CUỐI KÌ II (1 tiết, PPCT 67) & Trưng bày sản phẩm tổng kết năm (1 tiết, PPCT 69)',
        periodAllocation: 'Tiết PPCT 59–61, 63–65, 67, 69',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Hiểu được vai trò của mĩ thuật ứng dụng trong đời sống văn hoá xã hội; liệt kê một số ngành nghề liên quan đến mĩ thuật ứng dụng và viết bài luận hoặc làm đoạn video clip giới thiệu ngành nghề; lên ý tưởng và thực hiện bản vẽ thiết kế sản phẩm mĩ thuật ứng dụng; trưng bày và phân tích các sản phẩm tổng kết năm. Kiểm tra cuối kì II (Tiết PPCT 67). Định hướng phát triển NLS: Tích hợp NLS 1.1.TC1a, 2.1.TC1a tại Bài 16.',
      },
    ],
  }),
];

export const THCS_KHXH_GDDP_AND_NGHE_THUAT_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE6_GDDP_TOPICS_2026,
  ...GRADE7_GDDP_TOPICS_2026,
  ...GRADE8_GDDP_TOPICS_2026,
  ...GRADE9_GDDP_TOPICS_2026,
  ...GRADE6_AM_NHAC_TOPICS_2026,
  ...GRADE7_AM_NHAC_TOPICS_2026,
  ...GRADE8_AM_NHAC_TOPICS_2026,
  ...GRADE9_AM_NHAC_TOPICS_2026,
  ...GRADE6_MI_THUAT_TOPICS_2026,
  ...GRADE7_MI_THUAT_TOPICS_2026,
  ...GRADE8_MI_THUAT_TOPICS_2026,
  ...GRADE9_MI_THUAT_TOPICS_2026,
];
