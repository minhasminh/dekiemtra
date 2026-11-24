import { CurriculumTopic } from '../types/domain';
import {
  GRADE6_TIN_HOC_TOPICS_2026,
  GRADE6_TOAN_TOPICS_2026,
  GRADE7_TIN_HOC_TOPICS_2026,
  GRADE7_TOAN_TOPICS_2026,
  GRADE8_TIN_HOC_TOPICS_2026,
  GRADE8_TOAN_TOPICS_2026,
  GRADE9_TIN_HOC_TOPICS_2026,
  GRADE9_TOAN_TOPICS_2026,
  NDA_THCS_KHTN_SOURCE_DOC,
  buildThcsTopic,
} from './thcsToanAndTinPlan2026';

export const THCS_KHTN_DEPT_METADATA = {
  schoolName: 'TRƯỜNG TH & THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ KHOA HỌC TỰ NHIÊN',
  locationAndDate: 'Đan Điền, ngày 28 tháng 8 năm 2026',
  planTitle:
    'KẾ HOẠCH DẠY HỌC CỦA TỔ CHUYÊN MÔN: TOÁN - TIN HỌC - KHOA HỌC TỰ NHIÊN - CÔNG NGHỆ (KHỐI LỚP 3, 4, 5, 6, 7, 8, 9)',
  academicYear: '2026 – 2027',
  headOfDepartment: 'Thái Dũng',
  principal: 'Phan Đức Quý',
  studentAndClassSummary:
    'Số lớp: 33 lớp | Tổng số học sinh: 1.014 HS | Số học sinh học chuyên đề lựa chọn: Không',
  teacherForceSummary:
    'Tổng số giáo viên: 13 GV | Trình độ đào tạo: Đại học: 10, Trên đại học: 02, Cao đẳng: 01 | Chuẩn nghề nghiệp (TT 20/2018/TT-BGDĐT): Khá: 13 GV',
  facilitiesSummary: [
    'Sân trường, bãi tập (01): Thực hành đo chiều cao, khoảng cách ngoài trời và trải nghiệm sinh vật ngoài thiên nhiên.',
    'Phòng bộ môn Tin học (01): Thực hành tìm kiếm thông tin trên web, thư điện tử, MindMaple Lite, Word, Excel, Scratch, GeoGebra.',
    'Phòng thực hành Hóa - Sinh (01): Dành cho các bài thực hành, thí nghiệm Hóa - Sinh và Công nghệ 6, 7.',
    'Phòng thực hành Lí - Công nghệ (01): Dành cho các bài thực hành, thí nghiệm Vật lí và Công nghệ 8, 9 (Mô đun Lắp đặt mạng điện trong nhà).',
  ],
  subjectAllocationByGrade: {
    6: [
      {
        subject: 'Toán',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 18 tuần = 72 tiết; HKII: 17 tuần = 68 tiết) | Tích hợp NLS, AI 6.A3.1, GeoGebra | Kiểm tra GK/CK: 90 phút (Viết trên giấy)',
      },
      {
        subject: 'Tin học',
        totalPeriods: 35,
        detail:
          '35 tuần x 1 tiết = 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | 6 chủ đề (Bài 1–17) | Tích hợp NLS & AI (6.C1.MR1, 6.C1.1, 6.C2.1, 6.C2.2, 6.A1.3, 6.C3.MR1, 6.A3.4, 6.D2.MR2, 6.A3.2, 6.A1.1) | Kiểm tra GK/CK: 45 phút',
      },
      {
        subject: 'Khoa học tự nhiên',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 72 tiết; HKII: 68 tiết) | Dạy song song Lí - Hóa - Sinh (Bài 1–55) | Tích hợp NLS, BĐKH & PCTT, AI (6.A1.1, 6.A3.1, 6.A1.2, 6.C1.1, 6.D1.1) & STEM Bài 28 (Làm sữa chua) | Kiểm tra GK/CK: 90 phút',
      },
      {
        subject: 'Công nghệ',
        totalPeriods: 35,
        detail:
          '35 tuần x 1 tiết = 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | 4 chương (Bài 1–14: Nhà ở, Thực phẩm, Trang phục, Đồ dùng điện) | Tích hợp NLS, BĐKH & PCTT, AI 6.A1.1 & STEM Bài 2 (Ngôi nhà mơ ước) | Kiểm tra GK/CK: 45 phút',
      },
    ],
    7: [
      {
        subject: 'Toán',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 72 tiết; HKII: 68 tiết) | 10 chương | Tích hợp NLS, AI (7.D1.1 Pathfinding, 7.A1.2, 7.A2.1) & Chuyên đề STEM (Hộp quà và chân đế lịch để bàn) | Kiểm tra GK/CK: 90 phút',
      },
      {
        subject: 'Tin học',
        totalPeriods: 35,
        detail:
          '35 tuần x 1 tiết = 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | 5 chủ đề (Bài 1–16) | Tích hợp NLS & AI (7.A3.1, 7.C4.1, 7.A2.1, 7.A1.MR1, 7.C4.MR1, 7.A1.1, 7.D2.1, 7.C5.2, 7.C5.1) | Kiểm tra GK/CK: 45 phút',
      },
      {
        subject: 'Khoa học tự nhiên',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 72 tiết; HKII: 68 tiết) | Bài 1–42 | Tích hợp NLS, BĐKH & PCTT, AI (7.D1.1, 7.A1.2, 7.B2.1) & STEM Bài 2 (Mô hình nguyên tử Rutherford-Bohr), Bài 20 (Chế tạo nam châm điện) | Kiểm tra GK/CK: 90 phút',
      },
      {
        subject: 'Công nghệ',
        totalPeriods: 35,
        detail:
          '35 tuần x 1 tiết = 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | Bài 1–16 (Trồng trọt, Lâm nghiệp, Chăn nuôi, Thủy sản) | Tích hợp NLS, BĐKH & PCTT, AI (7.C5.1, 7.D1.1, 7.A1.2) & STEM Bài 6 (Dự án trồng rau an toàn) | Kiểm tra GK/CK: 45 phút',
      },
    ],
    8: [
      {
        subject: 'Toán',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 72 tiết; HKII: 68 tiết) | 10 chương | Tích hợp NLS, AI 8.A1.2 & Chuyên đề STEM (Ứng dụng định lí Thales, Pythagore, tam giác đồng dạng đo chiều cao, khoảng cách) | Kiểm tra GK/CK: 90 phút',
      },
      {
        subject: 'Tin học',
        totalPeriods: 35,
        detail:
          '35 tuần x 1 tiết = 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | 6 chủ đề (Bài 1–16) | Tích hợp NLS & AI (8.A1.1, 8.A2.1, 8.A1.2, 8.B1.1, 8.B2.1, 8.A3.3, 8.A3.MR1, 8.A3.1, 8.C1.1, 8.C5.1) | Kiểm tra GK/CK: 45 phút',
      },
      {
        subject: 'Khoa học tự nhiên',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 72 tiết; HKII: 68 tiết) | Bài 1–47 | Tích hợp NLS, BĐKH & PCTT, AI (8.A1.1, 8.A2.1) & STEM Bài 9 (Giấy chỉ thị màu acid-base từ bắp cải tím), Bài 22 (Thiết kế mạch điện đơn giản) | Kiểm tra GK/CK: 90 phút',
      },
      {
        subject: 'Công nghệ',
        totalPeriods: 53,
        detail:
          'Cả năm: 53 tiết (HKI: 18 tuần = 27 tiết; HKII: 17 tuần = 26 tiết) | Bài 1–20 (Vẽ kĩ thuật, Cơ khí, Kĩ thuật điện, Thiết kế kĩ thuật) | Tích hợp NLS, BĐKH & PCTT, AI 8.A3.1 | Kiểm tra GK/CK: 45 phút',
      },
    ],
    9: [
      {
        subject: 'Toán',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 72 tiết; HKII: 68 tiết) | 10 chương | Tích hợp NLS, AI (9.B2.1, 9.A3.2) & Chuyên đề STEM (Tính chiều cao và xác định khoảng cách; GeoGebra & Excel) | Kiểm tra GK/CK: 90 phút',
      },
      {
        subject: 'Tin học',
        totalPeriods: 35,
        detail:
          '35 tuần x 1 tiết = 35 tiết (HKI: 18 tiết; HKII: 17 tiết) | 6 chủ đề (Bài 1–17) | Tích hợp NLS & AI (9.A2.1, 9.B2.3, 9.A3.1, 9.B2.1, 9.A3.3, 9.D1.1, 9.C4.1, 9.B3.2, 9.C2.MR1, 9.C2.1, 9.D1.MR1, 9.D2.1, 9.A3.4) | Kiểm tra GK/CK: 45 phút',
      },
      {
        subject: 'Khoa học tự nhiên',
        totalPeriods: 140,
        detail:
          '35 tuần x 4 tiết = 140 tiết (HKI: 72 tiết; HKII: 68 tiết) | Bài 1–51 | Tích hợp NLS, BĐKH & PCTT, AI (9.B3.1, 9.C2.1, 9.A1.1) & STEM Bài 38 (Mô hình xoắn kép ADN), Bài 17 (Mô hình Chong chóng phát điện từ gió) | Kiểm tra GK/CK: 90 phút',
      },
      {
        subject: 'Công nghệ',
        totalPeriods: 53,
        detail:
          'Cả năm: 53 tiết (HKI: 18 tuần = 27 tiết; HKII: 17 tuần = 26 tiết) | Định hướng nghề nghiệp (Bài 1–5) & Mô đun Lắp đặt mạng điện trong nhà (Bài 1–7) | Tích hợp NLS, BĐKH & PCTT, AI 9.A1.2 | Kiểm tra GK/CK: 45 phút',
      },
    ],
  },
  sourceDocument: NDA_THCS_KHTN_SOURCE_DOC,
};

// ============================================================================
// 1.3.1. MÔN KHOA HỌC TỰ NHIÊN – LỚP 6 (CẢ NĂM: 140 TIẾT = HKI 72 + HKII 68)
// ============================================================================
export const GRADE6_KHTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-khtn-open-meas-mat-hk1',
    grade: 6,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN6-C1-2',
    chapterTitle: 'Mở đầu về Khoa học tự nhiên; Các phép đo & Các thể của chất – Oxygen và Không khí (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (Mạch Lí - Hóa HKI)',
    totalPeriods: 26,
    adjustedContentSummary:
      'Giới thiệu về KHTN, an toàn trong phòng thực hành, sử dụng kính lúp và kính hiển vi quang học; đo chiều dài, khối lượng, thời gian, nhiệt độ; sự đa dạng của chất, các thể của chất và sự chuyển thể, Oxygen và không khí. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 4.1.TC1a, 1.2.TC1b; AI 6.A1.1, 6.C1.1; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn6-b1-b4',
        week: 'HKI (Tiết PPCT 1, 2, 5, 6, 9, 10)',
        lessonName: 'Bài 1. Giới thiệu về Khoa học tự nhiên (1 tiết); Bài 2. An toàn trong phòng thực hành (2 tiết); Bài 3. Sử dụng kính lúp (1 tiết); Bài 4. Sử dụng kính hiển vi quang học (2 tiết)',
        periodAllocation: '6 tiết (Phân môn Sinh)',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nêu khái niệm KHTN, phân biệt vật sống và vật không sống; quy định và kí hiệu cảnh báo an toàn trong phòng thực hành; biết cách sử dụng kính lúp và kính hiển vi quang học. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 4.1.TC1a; AI 6.A1.1; Tích hợp BĐKH và PCTT (Tìm hiểu tầm quan trọng của KHTN trong việc hiểu biết về BĐKH và PCTT).',
      },
      {
        id: 'khtn6-b5-b8',
        week: 'HKI (Tiết PPCT 3, 4, 7, 8, 11, 12, 15, 16, 19)',
        lessonName: 'Bài 5. Đo chiều dài (2 tiết); Bài 6. Đo khối lượng (2 tiết); Bài 7. Đo thời gian (2 tiết); Bài 8. Đo nhiệt độ (2 tiết) & Ôn tập chương I (1 tiết)',
        periodAllocation: '9 tiết (Phân môn Lí)',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Nêu cách đo, đơn vị đo và dụng cụ thường dùng để đo chiều dài, khối lượng, thời gian, nhiệt độ; thực hiện đúng thao tác đo bằng thước, cân, đồng hồ, nhiệt kế (thang nhiệt độ Celsius). Định hướng phát triển NLS - AI: 1.1.TC1a (Bài 5), 1.2.TC1b (Bài 6, Bài 7).',
      },
      {
        id: 'khtn6-b9-b11',
        week: 'HKI – HKII (Tiết PPCT 38, 42, 46, 50, 54, 58, 62, 66, 70, 76, 80)',
        lessonName: 'Bài 9. Sự đa dạng của chất (2 tiết); Bài 10. Các thể của chất và sự chuyển thể (3 tiết); Bài 11. Oxygen. Không khí (4 tiết) & Ôn tập chương II (2 tiết)',
        periodAllocation: '11 tiết (Phân môn Hóa)',
        periodsCount: 11,
        adjustedContent:
          'YCCĐ: Nêu sự đa dạng của chất, đặc điểm cơ bản 3 thể (rắn, lỏng, khí) và các quá trình nóng chảy, đông đặc, bay hơi, sôi, ngưng tụ; nêu tính chất của oxygen, thành phần không khí và biện pháp bảo vệ môi trường không khí. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a; AI 6.C1.1 (Bài 11 tiết 3); Tích hợp BĐKH và PCTT (Tìm hiểu sự ảnh hưởng của hiện tượng băng tan ở Bắc Cực tới khí hậu và con người).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-khtn-cell-Force-hk1',
    grade: 6,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN6-C5-6-8',
    chapterTitle: 'Tế bào – Từ tế bào đến cơ thể; Đa dạng thế giới sống (Vi khuẩn, Virus) & Lực trong đời sống (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 4 – Tuần 18 (Mạch Sinh - Lí HKI)',
    totalPeriods: 46,
    adjustedContentSummary:
      'Tế bào – đơn vị cơ bản của sự sống, cấu tạo và sự lớn lên/sinh sản của tế bào, cơ thể đơn bào và đa bào; phân loại thế giới sống, khóa lưỡng phân, vi khuẩn, thực hành làm sữa chua (STEM), virus; lực và tác dụng của lực, biểu diễn lực, biến dạng lò xo, trọng lực, lực ma sát, lực cản của nước, năng lượng và Kiểm tra giữa kì I, cuối kì I. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 1.1.TC1b; AI 6.A3.1, 6.A1.2; Chủ đề STEM Bài 28; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn6-b18-b24',
        week: 'HKI (Tiết PPCT 13, 14, 17, 18, 21, 22, 25, 26, 29, 30, 33, 43, 44, 47, 48, 51)',
        lessonName: 'Bài 18. Tế bào – đơn vị cơ bản của sự sống (2 tiết); Bài 19. Cấu tạo và chức năng các thành phần của tế bào (2 tiết); Bài 20. Sự lớn lên và sinh sản của tế bào (2 tiết); Bài 21. TH: Quan sát và phân biệt một số loại tế bào (2 tiết); Bài 22. Cơ thể sinh vật (2 tiết); Bài 23. Tổ chức cơ thể đa bào (2 tiết); Bài 24. TH: Quan sát và mô tả cơ thể đơn bào, cơ thể đa bào (2 tiết) & Ôn tập chương V, VI (2 tiết)',
        periodAllocation: '16 tiết (Phân môn Sinh)',
        periodsCount: 16,
        adjustedContent:
          'YCCĐ: Nêu khái niệm, cấu tạo và sự lớn lên, sinh sản của tế bào; thực hành quan sát tế bào lớn và tế bào dưới kính hiển vi; nêu quan hệ từ tế bào → mô → cơ quan → hệ cơ quan → cơ thể. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a; AI 6.A3.1 (Bài 18 tiết 2); Tích hợp BĐKH và PCTT (BĐKH, nhiệt độ và ô nhiễm ảnh hưởng đến sự phát triển, chức năng của tế bào, mô và cơ quan ở thực vật, động vật).',
      },
      {
        id: 'khtn6-b40-b47',
        week: 'HKI (Tiết PPCT 20, 23, 24, 27, 28, 31, 32, 35, 36, 37, 41, 45, 49, 53, 57, 61, 65, 69)',
        lessonName: 'Bài 40. Lực là gì? (2 tiết); Bài 41. Biểu diễn lực (2 tiết); Bài 42. Biến dạng của lò xo (2 tiết); Bài 43. Trọng lượng, lực hấp dẫn (2 tiết); Bài 44. Lực ma sát (2 tiết); Bài 45. Lực cản của nước (2 tiết); Bài 46. Năng lượng và sự truyền năng lượng (2 tiết); Bài 47. Một số dạng năng lượng (2 tiết) & Ôn tập chương VIII, cuối HKI (2 tiết)',
        periodAllocation: '18 tiết (Phân môn Lí)',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Nêu tác dụng của lực, lực tiếp xúc và không tiếp xúc; biểu diễn lực và đo lực bằng lực kế lò xo (Newton); chứng minh độ giãn lò xo tỉ lệ với khối lượng vật treo; nêu khái niệm khối lượng, trọng lượng, lực ma sát, lực cản của nước và các dạng năng lượng. Định hướng phát triển NLS - AI & Lồng ghép: AI 6.A1.2 (Bài 40 tiết 2); NLS 1.1.TC1a (Bài 46); Tích hợp BĐKH và PCTT (Ảnh hưởng của lực ma sát đến ô nhiễm môi trường; ảnh hưởng của nguồn năng lượng hóa thạch, năng lượng gió và tái tạo đến biến đổi khí hậu).',
      },
      {
        id: 'khtn6-b25-b29-kt-hk1',
        week: 'HKI (Tiết PPCT 34, 39, 40, 52, 55, 56, 59, 60, 63, 64, 67, 68, 71, 72)',
        lessonName: 'Bài 25. Hệ thống phân loại sinh vật (2 tiết); Bài 26. Khóa lưỡng phân (2 tiết); Bài 27. Vi khuẩn (2 tiết); Bài 28. TH: Làm sữa chua và quan sát vi khuẩn [Chủ đề STEM] (2 tiết); Bài 29. Virus (t1) (1 tiết) & Ôn tập, Kiểm tra giữa kì I, cuối kì I (5 tiết)',
        periodAllocation: '12 tiết (Phân môn Sinh & KT định kì)',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Phân biệt 5 giới sinh vật và các bậc phân loại; xây dựng khóa lưỡng phân; mô tả cấu tạo, vai trò của vi khuẩn và virus; thực hành làm sữa chua. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1b, 1.1.TC1a; Chủ đề STEM tại Bài 28 (STEM: Quy trình sản xuất sữa chua vị chuẩn); Tích hợp BĐKH và PCTT (Tác động của BĐKH, lũ lụt và hạn hán đến sự phân bố và phát triển của vi khuẩn).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-khtn-hk2',
    grade: 6,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN6-HK2',
    chapterTitle: 'Đa dạng thế giới sống (Nguyên sinh vật, Nấm, Thực vật, Động vật, Đa dạng sinh học); Vật liệu – Nguyên liệu – Nhiên liệu – Lương thực, Hỗn hợp; Năng lượng & Trái Đất và bầu trời (HKII)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (Tiết PPCT 73 – 140)',
    totalPeriods: 68,
    adjustedContentSummary:
      'Nguyên sinh vật, nấm, thực vật, động vật, đa dạng sinh học và tìm hiểu sinh vật ngoài thiên nhiên; vật liệu, nguyên liệu, nhiên liệu, lương thực - thực phẩm, hỗn hợp và tách chất khỏi hỗn hợp; sự chuyển hóa và bảo toàn năng lượng, năng lượng hao phí, năng lượng tái tạo, tiết kiệm năng lượng; chuyển động nhìn thấy của Mặt Trời, Mặt Trăng, Hệ Mặt Trời, Ngân Hà và Kiểm tra giữa kì II, cuối kì II. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 1.1.TC1b, 2.4.TC1a; AI 6.D1.1, 6.C1.1; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn6-b12-b17-hoa-hk2',
        week: 'HKII (Tiết PPCT 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140)',
        lessonName: 'Bài 12. Một số vật liệu (2 tiết); Bài 13. Một số nguyên liệu (2 tiết); Bài 14. Một số nhiên liệu (1 tiết); Bài 15. Một số lương thực, thực phẩm (2 tiết); Bài 16. Hỗn hợp các chất (2 tiết); Bài 17. Tách chất khỏi hỗn hợp (2 tiết) & Ôn tập, Kiểm tra cuối kì II (4 tiết)',
        periodAllocation: '15 tiết (Phân môn Hóa)',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Trình bày tính chất và cách sử dụng an toàn, hiệu quả, bền vững một số vật liệu, nguyên liệu, nhiên liệu, lương thực - thực phẩm; phân biệt chất tinh khiết, hỗn hợp đồng nhất/không đồng nhất, dung dịch, huyền phù, nhũ tương; thực hành tách chất bằng cách lọc, cô cạn, chiết. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1b; AI 6.C1.1 (Bài 13 tiết 2); Tích hợp BĐKH và PCTT (Ảnh hưởng của BĐKH đến độ bền và tính chất của các vật liệu xây dựng).',
      },
      {
        id: 'khtn6-b48-b55-li-hk2',
        week: 'HKII (Tiết PPCT 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137)',
        lessonName: 'Bài 48. Sự chuyển hóa năng lượng (2 tiết); Bài 49. Năng lượng hao phí (1 tiết); Bài 50. Năng lượng tái tạo (1 tiết); Bài 51. Tiết kiệm năng lượng (1 tiết); Bài 52. Chuyển động nhìn thấy của Mặt Trời. Thiên thể (2 tiết); Bài 53. Mặt Trăng (2 tiết); Bài 54. Hệ Mặt Trời (2 tiết); Bài 55. Ngân Hà (2 tiết) & Ôn tập chương IX, X, GK2, CK2 (4 tiết)',
        periodAllocation: '17 tiết (Phân môn Lí)',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Nêu định luật bảo toàn năng lượng, năng lượng hao phí, năng lượng tái tạo và đề xuất biện pháp tiết kiệm năng lượng; giải thích chuyển động nhìn thấy của Mặt Trời, các pha Mặt Trăng, cấu trúc Hệ Mặt Trời và Ngân Hà. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1b (Bài 49); AI 6.D1.1 (Bài 51); Tích hợp BĐKH và PCTT (Tìm hiểu hiện tượng thiên nhiên động đất, núi lửa, sóng thần và cách chuẩn bị ứng phó).',
      },
      {
        id: 'khtn6-b29-b39-sinh-hk2',
        week: 'HKII (Tiết PPCT 74, 75, 78, 79, 82, 83, 86, 87, 90, 91, 94, 95, 98, 99, 102, 103, 106, 107, 110, 111, 114, 115, 118, 119, 122, 123, 126, 127, 130, 131, 134, 135, 138, 139)',
        lessonName: 'Bài 29. Virus (t2) (1 tiết); Bài 30, 31. Nguyên sinh vật & Thực hành (4 tiết); Bài 32, 33. Nấm & Thực hành (4 tiết); Bài 34, 35. Thực vật & Thực hành (7 tiết); Bài 36, 37. Động vật & Thực hành (7 tiết); Bài 38. Đa dạng sinh học (3 tiết); Bài 39. Tìm hiểu sinh vật ngoài thiên nhiên (3 tiết) & Ôn tập, Kiểm tra GK2, CK2 (7 tiết)',
        periodAllocation: '36 tiết (Phân môn Sinh)',
        periodsCount: 36,
        adjustedContent:
          'YCCĐ: Nhận biết nguyên sinh vật, nấm, các nhóm thực vật (Rêu, Dương xỉ, Hạt trần, Hạt kín) và động vật (không xương sống, có xương sống); nêu vai trò và biện pháp bảo tồn đa dạng sinh học; thực hành tìm hiểu sinh vật ngoài thiên nhiên. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 2.4.TC1a, 1.1.TC1b; Tích hợp BĐKH và PCTT (Ảnh hưởng của BĐKH đến bệnh do virus, nguyên sinh vật, nấm, sự phân bố thực vật, hành vi động vật và bảo tồn đa dạng sinh học).',
      },
    ],
  }),
];

// ============================================================================
// 1.3.2. MÔN KHOA HỌC TỰ NHIÊN – LỚP 7 (CẢ NĂM: 140 TIẾT = HKI 72 + HKII 68)
// ============================================================================
export const GRADE7_KHTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-khtn-hk1',
    grade: 7,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN7-HK1',
    chapterTitle: 'Mở đầu; Nguyên tử & Bảng tuần hoàn; Tốc độ & Âm thanh; Trao đổi chất và chuyển hóa năng lượng ở sinh vật & Cảm ứng ở sinh vật (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (Tiết PPCT 1 – 72)',
    totalPeriods: 72,
    adjustedContentSummary:
      'Phương pháp và kĩ năng học tập môn KHTN; nguyên tử (Chủ đề STEM chế tạo mô hình nguyên tử Rutherford - Bohr), nguyên tố hóa học, sơ lược bảng tuần hoàn (t1, t2); tốc độ chuyển động, đo tốc độ, đồ thị quãng đường - thời gian, sóng âm (t1, t2); trao đổi chất, quang hợp, hô hấp tế bào, trao đổi khí, trao đổi nước và chất dinh dưỡng ở thực vật và động vật; cảm ứng ở sinh vật và Kiểm tra giữa kì I, cuối kì I. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 1.1.TC1b, 1.2.TC1b; AI 7.A1.2, 7.D1.1, 7.B2.1; Chủ đề STEM Bài 2; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn7-hoa-hk1',
        week: 'HKI (Tiết PPCT 1, 5, 9, 13, 17, 21, 25, 29, 33, 38, 42, 46, 50, 54, 58, 62, 66, 72)',
        lessonName: 'Bài 1. Phương pháp và kĩ năng học tập môn KHTN (5 tiết); Bài 2. Nguyên tử [Chủ đề STEM] (6 tiết); Bài 3. Nguyên tố hóa học (3 tiết); Bài 4. Sơ lược về bảng tuần hoàn các nguyên tố hóa học (t1, t2) (2 tiết); Ôn tập & Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: '18 tiết (Phân môn Hóa HKI)',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Vận dụng phương pháp tìm hiểu tự nhiên và kĩ năng tiến trình (quan sát, phân loại, liên kết, đo, dự báo); trình bày mô hình nguyên tử Rutherford - Bohr và khối lượng nguyên tử (amu); phát biểu khái niệm nguyên tố hóa học, kí hiệu 20 nguyên tố đầu tiên và nguyên tắc xây dựng bảng tuần hoàn. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1b, 1.1.TC1a; AI 7.A1.2 (Bài 1 tiết 3); Chủ đề STEM tại Bài 2 tiết 5, 6 (Chế tạo mô hình nguyên tử Rutherford - Bohr từ vật liệu tái chế: vòng nhựa, hạt xốp); Tích hợp BĐKH và PCTT (Giới thiệu nguyên tố Carbon, Oxygen trong hợp chất khí nhà kính CO2).',
      },
      {
        id: 'khtn7-li-hk1',
        week: 'HKI (Tiết PPCT 4, 8, 12, 16, 20, 24, 28, 32, 36, 37, 41, 45, 49, 53, 57, 61, 65, 71)',
        lessonName: 'Bài 8. Tốc độ chuyển động (3 tiết); Bài 9. Đo tốc độ (3 tiết); Bài 10. Đồ thị quãng đường - thời gian (3 tiết); Bài 11. Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông (2 tiết); Bài 12. Sóng âm (t1, t2) (2 tiết); Ôn tập & Kiểm tra giữa kì I, cuối kì I (5 tiết)',
        periodAllocation: '18 tiết (Phân môn Lí HKI)',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Xác định tốc độ qua quãng đường và thời gian, đo tốc độ bằng đồng hồ bấm giây và cổng quang điện; vẽ và đọc đồ thị quãng đường - thời gian; nêu ảnh hưởng của tốc độ trong ATGT; thực hiện thí nghiệm tạo sóng âm và giải thích sự truyền sóng âm. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 1.1.TC1b; Tích hợp BĐKH và PCTT (Tìm hiểu tốc độ di chuyển của các hiện tượng thời tiết cực đoan như bão, lốc xoáy, sóng thần và biện pháp nâng cao khả năng dự báo, cảnh báo).',
      },
      {
        id: 'khtn7-sinh-hk1',
        week: 'HKI (Tiết PPCT 2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23, 26, 27, 30, 31, 34, 35, 39, 40, 43, 44, 47, 48, 51, 52, 55, 56, 59, 60, 63, 64, 67, 68, 69, 70)',
        lessonName: 'Bài 21. Khái quát về trao đổi chất và chuyển hóa năng lượng (2 tiết); Bài 22, 23, 24. Quang hợp ở thực vật & Thực hành (6 tiết); Bài 25, 26, 27. Hô hấp tế bào & Thực hành (6 tiết); Bài 28. Trao đổi khí ở sinh vật (3 tiết); Bài 29, 30, 31, 32. Trao đổi nước và chất dinh dưỡng ở thực vật, động vật & Thực hành (13 tiết); Bài 33, 34, 35. Cảm ứng ở sinh vật & Thực hành (6 tiết)',
        periodAllocation: '36 tiết (Phân môn Sinh HKI)',
        periodsCount: 36,
        adjustedContent:
          'YCCĐ: Mô tả quá trình quang hợp, hô hấp tế bào, trao đổi khí qua khí khổng và phổi, con đường vận chuyển nước/chất khoáng ở thực vật và tiêu hóa/tuần hoàn ở người; trình bày khái niệm cảm ứng ở thực vật và tập tính ở động vật. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 1.1.TC1b, 1.2.TC1b; AI 7.D1.1 (Bài 22 tiết 1), AI 7.B2.1 (Bài 31 tiết 1); Tích hợp BĐKH và PCTT (Nhiệt độ toàn cầu tăng và lượng mưa không đều ảnh hưởng đến quang hợp và cảm ứng ở thực vật).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-khtn-hk2',
    grade: 7,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN7-HK2',
    chapterTitle: 'Bảng tuần hoàn (tiếp), Phân tử – Liên kết hóa học – Hóa trị; Âm thanh (tiếp), Ánh sáng & Từ; Sinh trưởng, phát triển và Sinh sản ở sinh vật (HKII)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (Tiết PPCT 73 – 140)',
    totalPeriods: 68,
    adjustedContentSummary:
      'Bảng tuần hoàn (t3–t7), phân tử - đơn chất - hợp chất, liên kết hóa học (ion, cộng hóa trị), hóa trị và công thức hóa học; độ to và độ cao của âm, phản xạ âm và chống ô nhiễm tiếng ồn, năng lượng ánh sáng, phản xạ ánh sáng, ảnh qua gương phẳng, nam châm, từ trường và chế tạo nam châm điện đơn giản (Chủ đề STEM); sinh trưởng và phát triển, sinh sản vô tính và hữu tính ở sinh vật, cơ thể sinh vật là một thể thống nhất và Kiểm tra giữa kì II, cuối kì II. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1b, 1.1.TC1a; Chủ đề STEM Bài 20; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn7-hoa-hk2',
        week: 'HKII (Tiết PPCT 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137)',
        lessonName: 'Bài 4. Sơ lược về bảng tuần hoàn (t3–t7) (5 tiết); Bài 5. Phân tử - Đơn chất - Hợp chất (4 tiết); Bài 6. Giới thiệu về liên kết hóa học (4 tiết); Bài 7. Hóa trị và công thức hóa học (3 tiết) & Ôn tập cuối kì II (1 tiết)',
        periodAllocation: '17 tiết (Phân môn Hóa HKII)',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Sử dụng bảng tuần hoàn chỉ ra nhóm kim loại, phi kim, khí hiếm; tính khối lượng phân tử theo amu; nêu sự hình thành liên kết ion và liên kết cộng hóa trị; lập công thức hóa học và tính phần trăm nguyên tố trong hợp chất. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a; Tích hợp BĐKH và PCTT (Giới thiệu các phân tử gây hiệu ứng nhà kính như CO2, CH4, N2O).',
      },
      {
        id: 'khtn7-li-hk2',
        week: 'HKII (Tiết PPCT 75, 76, 79, 80, 83, 84, 87, 88, 91, 92, 95, 96, 99, 100, 103, 104, 107, 108, 111, 112, 115, 116, 119, 120, 123, 124, 127, 128, 131, 132, 135, 136, 139, 140)',
        lessonName: 'Bài 12. Sóng âm (t3) (1 tiết); Bài 13. Độ to và độ cao của âm (3 tiết); Bài 14. Phản xạ âm, chống ô nhiễm tiếng ồn (4 tiết); Bài 15. Năng lượng ánh sáng. Tia sáng, vùng tối (3 tiết); Bài 16. Sự phản xạ ánh sáng (3 tiết); Bài 17. Ảnh của vật qua gương phẳng (4 tiết); Bài 18. Nam châm (3 tiết); Bài 19. Từ trường (4 tiết); Bài 20. Chế tạo nam châm điện đơn giản [Chủ đề STEM] (3 tiết) & Ôn tập, Kiểm tra GK2, CK2 (6 tiết)',
        periodAllocation: '34 tiết (Phân môn Lí HKII)',
        periodsCount: 34,
        adjustedContent:
          'YCCĐ: Xác định biên độ và tần số âm (Hz), đề xuất phương án chống ô nhiễm tiếng ồn; thực hiện thí nghiệm năng lượng ánh sáng, định luật phản xạ ánh sáng và dựng ảnh qua gương phẳng; khảo sát từ trường của nam châm, từ trường Trái Đất và chế tạo nam châm điện đơn giản. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1b; Chủ đề STEM tại Bài 20 tiết 2, 3 (Chế tạo nam châm điện đơn giản và thay đổi từ trường bằng dòng điện); Tích hợp BĐKH và PCTT (Hệ thống cảnh báo âm thanh phát hiện sóng thần, bão; sử dụng năng lượng Mặt Trời giảm ô nhiễm và tìm hiểu tác động của khí nhà kính đến phân tán ánh sáng, nhiệt độ Trái Đất).',
      },
      {
        id: 'khtn7-sinh-hk2',
        week: 'HKII (Tiết PPCT 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122, 126, 130, 134, 138)',
        lessonName: 'Bài 36, 37, 38. Sinh trưởng và phát triển ở sinh vật, Ứng dụng & Thực hành (7 tiết); Bài 39. Sinh sản vô tính ở sinh vật (3 tiết); Bài 40. Sinh sản hữu tính ở sinh vật (3 tiết); Bài 41. Một số yếu tố ảnh hưởng và điều khiển sinh sản ở sinh vật (3 tiết) & Bài 42. Cơ thể sinh vật là một thể thống nhất (1 tiết)',
        periodAllocation: '17 tiết (Phân môn Sinh HKII)',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Trình bày các giai đoạn sinh trưởng và phát triển ở sinh vật; phân biệt sinh sản vô tính (nhân giống vô tính, nuôi cấy mô) và sinh sản hữu tính (thụ phấn, thụ tinh); vận dụng các yếu tố điều khiển sinh sản trong trồng trọt, chăn nuôi; chứng minh cơ thể sinh vật là một thể thống nhất. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1b, 1.1.TC1a; Tích hợp BĐKH và PCTT (Tác động của nhiệt độ tăng đến sự nảy mầm và sinh trưởng của cây; bảo vệ các loài côn trùng thụ phấn cho cây).',
      },
    ],
  }),
];

// ============================================================================
// 1.3.3. MÔN KHOA HỌC TỰ NHIÊN – LỚP 8 (CẢ NĂM: 140 TIẾT = HKI 72 + HKII 68)
// ============================================================================
export const GRADE8_KHTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-khtn-hk1',
    grade: 8,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN8-HK1',
    chapterTitle: 'Mở đầu; Phản ứng hóa học & Acid – Base (t1); Khối lượng riêng, Áp suất, Moment lực, Đòn bẩy & Điện (t1); Sinh học cơ thể người (Vận động, Tiêu hóa, Tuần hoàn, Hô hấp, Bài tiết t1) (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (Tiết PPCT 1 – 72)',
    totalPeriods: 72,
    adjustedContentSummary:
      'Sử dụng hóa chất và thiết bị cơ bản trong phòng thí nghiệm; phản ứng hóa học, mol và tỉ khối chất khí, dung dịch và nồng độ, định luật bảo toàn khối lượng và PTHH, tính theo PTHH, tốc độ phản ứng và chất xúc tác, Acid, Base (t1); khối lượng riêng, áp suất trên một bề mặt, áp suất chất lỏng và khí quyển, lực đẩy Archimedes, moment lực, đòn bẩy, hiện tượng nhiễm điện do cọ xát, dòng điện - nguồn điện (t1); hệ vận động, dinh dưỡng và tiêu hóa, máu và hệ tuần hoàn, hệ hô hấp, hệ bài tiết (t1) và Kiểm tra giữa kì I, cuối kì I. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.2.TC2b, 1.1.TC2b, 1.1.TC2a; AI 8.A1.1, 8.A2.1; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn8-hoa-hk1',
        week: 'HKI (Tiết PPCT 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 36, 37, 41, 45, 49, 53, 57, 61, 65, 69)',
        lessonName: 'Bài 2. Phản ứng hóa học (3 tiết); Bài 3. Mol và tỉ khối chất khí (2 tiết); Bài 4. Dung dịch và nồng độ (4 tiết); Bài 5. Định luật bảo toàn khối lượng và PTHH (4 tiết); Bài 6. Tính theo PTHH (4 tiết); Bài 7. Tốc độ phản ứng và chất xúc tác (4 tiết); Bài 8. Acid (3 tiết); Bài 9. Base. Thang pH (t1) (1 tiết) & Kiểm tra giữa kì I (2 tiết)',
        periodAllocation: '27 tiết (Phân môn Hóa HKI)',
        periodsCount: 27,
        adjustedContent:
          'YCCĐ: Phân biệt biến đổi vật lí và hóa học; tính khối lượng mol, thể tích mol chất khí ở đkc (24,79 L/mol), độ tan, nồng độ C% và CM; lập PTHH, tính theo PTHH và hiệu suất phản ứng; khảo sát tốc độ phản ứng và tính chất hóa học của Acid. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.2.TC2b (Bài 2), 1.1.TC2b (Bài 7); AI 8.A2.1 (Bài 8 tiết 3); Tích hợp BĐKH và PCTT (Ảnh hưởng của BĐKH đến phản ứng hóa học và sự cân bằng nồng độ acid trong môi trường).',
      },
      {
        id: 'khtn8-li-hk1',
        week: 'HKI (Tiết PPCT 1, 5, 9, 13, 17, 21, 25, 29, 33, 38, 39, 42, 43, 46, 47, 50, 51, 54, 55, 58, 59, 62, 63, 66, 67, 70, 71)',
        lessonName: 'Bài 1. Sử dụng một số hóa chất, thiết bị cơ bản trong phòng thí nghiệm (3 tiết); Bài 13, 14. Khối lượng riêng & Thực hành (4 tiết); Bài 15. Áp suất trên một bề mặt (2 tiết); Bài 16. Áp suất chất lỏng. Áp suất khí quyển (3 tiết); Bài 17. Lực đẩy Archimedes (2 tiết); Bài 18. Tác dụng làm quay của lực. Moment lực (4 tiết); Bài 19. Đòn bẩy và ứng dụng (4 tiết); Bài 20. Hiện tượng nhiễm điện do cọ xát (2 tiết); Bài 21. Dòng điện, nguồn điện (t1) (1 tiết) & Ôn tập, Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: '27 tiết (Phân môn Lí HKI)',
        periodsCount: 27,
        adjustedContent:
          'YCCĐ: Xác định khối lượng riêng, áp suất trên bề mặt, áp suất chất lỏng, khí quyển và lực đẩy Archimedes; mô tả tác dụng làm quay của lực (moment lực) và ứng dụng đòn bẩy; giải thích hiện tượng nhiễm điện do cọ xát và định nghĩa dòng điện. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.2.TC2b (Bài 16, 19, 20), 1.1.TC2a (Bài 21); Tích hợp BĐKH và PCTT (Gió mạnh, bão và lũ lụt ảnh hưởng đến các công trình xây dựng và thiết bị quay; hiện tượng sét và ứng dụng tĩnh điện giảm thiểu ô nhiễm môi trường).',
      },
      {
        id: 'khtn8-sinh-hk1',
        week: 'HKI (Tiết PPCT 2, 6, 10, 14, 18, 22, 26, 30, 34, 40, 44, 48, 52, 56, 60, 64, 68, 72)',
        lessonName: 'Bài 30. Khái quát về cơ thể người (1 tiết); Bài 31. Hệ vận động ở người (3 tiết); Bài 32. Dinh dưỡng và tiêu hóa ở người (4 tiết); Bài 33. Máu và hệ tuần hoàn của cơ thể người (3 tiết); Bài 34. Hệ hô hấp ở người (3 tiết); Bài 35. Hệ bài tiết ở người (t1) (1 tiết) & Ôn tập, Kiểm tra GK1, CK1 (3 tiết)',
        periodAllocation: '18 tiết (Phân môn Sinh HKI)',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Trình bày cấu tạo, chức năng và biện pháp bảo vệ hệ vận động (sơ cứu gãy xương), hệ tiêu hóa (an toàn vệ sinh thực phẩm), máu và hệ tuần hoàn (nhóm máu, miễn dịch, đo huyết áp), hệ hô hấp (hô hấp nhân tạo, phòng chống tác hại thuốc lá) và hệ bài tiết. Định hướng phát triển NLS - AI: NLS 1.1.TC2b (Bài 31, 32, 33, 34, 35); AI 8.A1.1 (Bài 33 tiết 1).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-khtn-hk2',
    grade: 8,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN8-HK2',
    chapterTitle: 'Base – Thang pH (STEM), Oxide, Muối, Phân bón hóa học; Mạch điện (STEM), Tác dụng dòng điện, Cường độ dòng điện & Năng lượng nhiệt; Hệ thần kinh, Nội tiết, Sinh sản & Hệ sinh thái – Bảo vệ môi trường (HKII)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (Tiết PPCT 73 – 140)',
    totalPeriods: 68,
    adjustedContentSummary:
      'Base và thang pH (Chủ đề STEM chế tạo giấy chỉ thị màu từ bắp cải tím), Oxide, Muối, Phân bón hóa học; mạch điện đơn giản (Chủ đề STEM thiết kế mạch điện đơn giản), tác dụng của dòng điện, cường độ dòng điện và hiệu điện thế, năng lượng nhiệt và nội năng, sự truyền nhiệt, sự nở vì nhiệt; hệ bài tiết (t2, t3), điều hòa môi trường trong, hệ thần kinh và giác quan, hệ nội tiết, da và điều hòa thân nhiệt, sinh sản ở người; môi trường sống, quần thể, quần xã, hệ sinh thái, sinh quyển, cân bằng tự nhiên và bảo vệ môi trường. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2a, 1.1.TC2b, 1.2.TC2b; AI 8.A2.1; Chủ đề STEM Bài 9 & Bài 22; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn8-hoa-hk2',
        week: 'HKII (Tiết PPCT 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137)',
        lessonName: 'Bài 9. Base. Thang pH [Chủ đề STEM] (t2–t5) (4 tiết); Bài 10. Oxide (3 tiết); Bài 11. Muối (6 tiết); Bài 12. Phân bón hóa học (3 tiết) & Ôn tập cuối kì II (1 tiết)',
        periodAllocation: '17 tiết (Phân môn Hóa HKII)',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Nêu tính chất hóa học của Base, sử dụng thang pH đánh giá độ acid-base; phân loại và viết PTHH của Oxide, Muối; trình bày vai trò của phân bón hóa học và biện pháp giảm thiểu ô nhiễm phân bón. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b (Bài 11); Chủ đề STEM tại Bài 9 tiết 4, 5 (Chế tạo giấy chỉ thị màu nhận biết acid-base từ bắp cải tím); Tích hợp BĐKH và PCTT (Ảnh hưởng của thiên tai đến oxide trong môi trường và tác động của việc sử dụng phân bón không đúng cách đến đất, nước, sức khỏe).',
      },
      {
        id: 'khtn8-li-hk2',
        week: 'HKII (Tiết PPCT 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122, 126, 130, 134, 138)',
        lessonName: 'Bài 21. Dòng điện, nguồn điện (t2) (1 tiết); Bài 22. Mạch điện đơn giản [Chủ đề STEM] (2 tiết); Bài 23. Tác dụng của dòng điện (2 tiết); Bài 24, 25. Cường độ dòng điện và hiệu điện thế & Thực hành (3 tiết); Bài 26, 27. Năng lượng nhiệt và nội năng & Thực hành đo bằng joulemeter (4 tiết); Bài 28. Sự truyền nhiệt (3 tiết); Bài 29. Sự nở vì nhiệt (2 tiết)',
        periodAllocation: '17 tiết (Phân môn Lí HKII)',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Vẽ sơ đồ và lắp mạch điện đơn giản; nêu tác dụng nhiệt, phát sáng, hóa học, sinh lí của dòng điện; đo cường độ dòng điện (A) và hiệu điện thế (V); giải thích dẫn nhiệt, đối lưu, bức xạ nhiệt và sự nở vì nhiệt của chất rắn, lỏng, khí. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b (Bài 22, 28, 29); AI 8.A2.1 & Chủ đề STEM tại Bài 22 tiết 2 (Thiết kế và lắp đặt mạch điện đơn giản); Tích hợp BĐKH và PCTT (Sử dụng điốt phát quang nâng cao hiệu suất điện; vai trò của khí quyển và tầng ôzôn trong hiệu ứng nhà kính và giữ ổn định nhiệt độ Trái Đất).',
      },
      {
        id: 'khtn8-sinh-hk2',
        week: 'HKII (Tiết PPCT 75, 76, 79, 80, 83, 84, 87, 88, 91, 92, 95, 96, 99, 100, 103, 104, 107, 108, 111, 112, 115, 116, 119, 120, 123, 124, 127, 128, 131, 132, 135, 136, 139, 140)',
        lessonName: 'Bài 35. Hệ bài tiết (t2, t3) (2 tiết); Bài 36. Điều hòa môi trường trong (1 tiết); Bài 37. Hệ thần kinh và các giác quan (3 tiết); Bài 38. Hệ nội tiết (2 tiết); Bài 39. Da và điều hòa thân nhiệt (2 tiết); Bài 40. Sinh sản ở người (3 tiết); Bài 41. Môi trường sống và các nhân tố sinh thái (2 tiết); Bài 42. Quần thể sinh vật (2 tiết); Bài 43. Quần xã sinh vật (2 tiết); Bài 44. Hệ sinh thái (3 tiết); Bài 45. Sinh quyển (2 tiết); Bài 46. Cân bằng tự nhiên (2 tiết); Bài 47. Bảo vệ môi trường (2 tiết) & Ôn tập, Kiểm tra GK2, CK2 (6 tiết)',
        periodAllocation: '34 tiết (Phân môn Sinh HKII)',
        periodsCount: 34,
        adjustedContent:
          'YCCĐ: Bảo vệ hệ bài tiết, hệ thần kinh, các giác quan (mắt, tai), hệ nội tiết, da và sức khỏe sinh sản vị thành niên; phân tích các đặc trưng của quần thể, quần xã, hệ sinh thái (chuỗi và lưới thức ăn), cân bằng tự nhiên và các biện pháp bảo vệ môi trường, thích ứng với BĐKH. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2a, 1.1.TC2b, 1.2.TC2b; Tích hợp BĐKH và PCTT (Ảnh hưởng của BĐKH làm thay đổi các hệ sinh thái rừng, biển, đồng cỏ và các biện pháp hạn chế ô nhiễm môi trường, bảo vệ động vật hoang dã theo Công ước CITES).',
      },
    ],
  }),
];

// ============================================================================
// 1.3.4. MÔN KHOA HỌC TỰ NHIÊN – LỚP 9 (CẢ NĂM: 140 TIẾT = HKI 72 + HKII 68)
// ============================================================================
export const GRADE9_KHTN_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-khtn-hk1',
    grade: 9,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN9-HK1',
    chapterTitle: 'Mở đầu; Năng lượng cơ học & Ánh sáng (Khúc xạ, Phản xạ toàn phần, Lăng kính, Thấu kính t1–t3); Kim loại & Hợp chất hữu cơ – Hydrocarbon – Ethylic alcohol – Acetic acid (t1); Di truyền học Mendel – Nucleic acid (STEM) – Nhiễm sắc thể (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (Tiết PPCT 1 – 72)',
    totalPeriods: 72,
    adjustedContentSummary:
      'Nhận biết dụng cụ, hóa chất và thuyết trình vấn đề khoa học; động năng, thế năng, cơ năng, công và công suất, khúc xạ ánh sáng, phản xạ toàn phần, lăng kính, thấu kính (t1–t3); tính chất chung của kim loại, dãy hoạt động hóa học, tách kim loại và hợp kim, sự khác nhau giữa phi kim và kim loại, hợp chất hữu cơ, Alkane, Alkene, nguồn nhiên liệu, Ethylic alcohol, Acetic acid (t1); di truyền học Mendel, Nucleic acid và gene (Chủ đề STEM: Mô hình xoắn kép ADN), tái bản DNA, phiên mã, dịch mã, đột biến gene, nhiễm sắc thể, nguyên phân - giảm phân, cơ chế xác định giới tính (t1) và Kiểm tra giữa kì I, cuối kì I. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2a; Chủ đề STEM Bài 38; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn9-li-hk1',
        week: 'HKI (Tiết PPCT 3, 7, 11, 15, 19, 23, 27, 31, 35, 40, 44, 48, 52, 56, 60, 64, 68, 72)',
        lessonName: 'Bài 2. Động năng và thế năng (2 tiết); Bài 3. Cơ năng (1 tiết); Bài 4. Công và công suất (2 tiết); Bài 5. Khúc xạ ánh sáng (2 tiết); Bài 6. Phản xạ toàn phần (2 tiết); Bài 7. Lăng kính (2 tiết); Bài 8. Thấu kính (t1–t3) (3 tiết) & Ôn tập, Kiểm tra giữa kì I, cuối kì I (4 tiết)',
        periodAllocation: '18 tiết (Phân môn Lí HKI)',
        periodsCount: 18,
        adjustedContent:
          'YCCĐ: Viết biểu thức tính động năng, thế năng, cơ năng, công và công suất; thực hiện thí nghiệm định luật khúc xạ ánh sáng ($n = \\sin i / \\sin r$), điều kiện phản xạ toàn phần, tán sắc ánh sáng qua lăng kính và đường truyền tia sáng qua thấu kính hội tụ, phân kì. Định hướng phát triển NLS - AI & Lồng ghép: Tích hợp BĐKH và PCTT (Tìm hiểu sự biến đổi từ thế năng thành động năng trong các hiện tượng lũ quét, lũ ống và biện pháp phòng tránh; tác dụng của ánh sáng Mặt Trời đối với khí hậu Trái Đất và bảo vệ tầng khí quyển).',
      },
      {
        id: 'khtn9-hoa-hk1',
        week: 'HKI (Tiết PPCT 4, 8, 12, 16, 17, 18, 21, 22, 25, 26, 29, 30, 33, 34, 38, 39, 42, 43, 46, 47, 50, 51, 54, 55, 58, 59, 62, 63, 66, 67, 70, 71)',
        lessonName: 'Bài 18. Tính chất chung của kim loại (4 tiết); Bài 19. Dãy hoạt động hóa học (4 tiết); Bài 20. Tách kim loại và việc sử dụng hợp kim (4 tiết); Bài 21. Sự khác nhau cơ bản giữa phi kim và kim loại (4 tiết); Bài 22. Giới thiệu về hợp chất hữu cơ (3 tiết); Bài 23. Alkane (3 tiết); Bài 24. Alkene (2 tiết); Bài 25. Nguồn nhiên liệu (2 tiết); Bài 26. Ethylic alcohol (3 tiết); Bài 27. Acetic acid (t1) (1 tiết) & Ôn tập, Kiểm tra cuối kì I (2 tiết)',
        periodAllocation: '32 tiết (Phân môn Hóa HKI)',
        periodsCount: 32,
        adjustedContent:
          'YCCĐ: Trình bày tính chất vật lí, hóa học của kim loại, dãy hoạt động hóa học, phương pháp tách sắt, nhôm, kẽm và sản xuất gang, thép; phân biệt phi kim và kim loại; viết công thức cấu tạo và tính chất của Alkane (methane, butane), Alkene (ethylene, trùng hợp PE), sử dụng hiệu quả nguồn nhiên liệu dầu mỏ, khí thiên nhiên; tính chất và điều chế Ethylic alcohol, Acetic acid. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2a (Bài 24, 25, 27); Tích hợp BĐKH và PCTT (Ảnh hưởng của khai thác kim loại, sản xuất và sử dụng ethylic alcohol, acetic acid đến môi trường đất, nước, không khí; ứng dụng kim loại xây dựng công trình chống thiên tai bão, lũ).',
      },
      {
        id: 'khtn9-sinh-hk1',
        week: 'HKI (Tiết PPCT 1, 2, 5, 6, 9, 10, 13, 14, 20, 24, 28, 32, 36, 37, 41, 45, 49, 53, 57, 61, 65, 69)',
        lessonName: 'Bài 1. Nhận biết một số dụng cụ, hóa chất. Thuyết trình một vấn đề khoa học (3 tiết); Bài 36. Khái quát về Di truyền học (2 tiết); Bài 37. Các quy luật di truyền của Mendel (2 tiết); Bài 38. Nucleic acid và gene [Chủ đề STEM: Mô hình xoắn kép ADN] (2 tiết); Bài 39. Tái bản DNA và phiên mã tạo RNA (2 tiết); Bài 40. Dịch mã và mối quan hệ từ gene đến tính trạng (3 tiết); Bài 41. Đột biến gene (2 tiết); Bài 42. Nhiễm sắc thể và bộ nhiễm sắc thể (2 tiết); Bài 43. Nguyên phân - Giảm phân (2 tiết); Bài 44. Nhiễm sắc thể giới tính và cơ chế xác định giới tính (t1) (1 tiết) & Kiểm tra giữa kì I (1 tiết)',
        periodAllocation: '22 tiết (Phân môn Sinh HKI)',
        periodsCount: 22,
        adjustedContent:
          'YCCĐ: Giải thích quy luật phân li và phân li độc lập của Mendel; mô tả cấu trúc xoắn kép DNA, RNA, quá trình tái bản DNA, phiên mã, dịch mã (DNA → mRNA → protein → tính trạng) và đột biến gene; phân biệt bộ NST lưỡng bội, đơn bội, quá trình nguyên phân và giảm phân. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2a (Bài 36, 40, 42, 43); Chủ đề STEM tại Bài 38 tiết 2 (Chế tạo Mô hình xoắn kép ADN); Tích hợp BĐKH và PCTT (Tác động của biến đổi khí hậu và môi trường sống đến quần thể và đa dạng di truyền, bảo vệ nguồn gene).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-khtn-hk2',
    grade: 9,
    subject: 'Khoa học tự nhiên',
    chapterCode: 'KHTN9-HK2',
    chapterTitle: 'Thấu kính & Kính lúp, Điện một chiều, Điện từ & Năng lượng với cuộc sống (STEM); Acetic acid, Lipid, Carbohydrate, Protein, Polymer & Hóa học vỏ Trái Đất; Di truyền liên kết, Di truyền học người & Tiến hóa (HKII)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (Tiết PPCT 73 – 140)',
    totalPeriods: 68,
    adjustedContentSummary:
      'Thấu kính (t4), thực hành đo tiêu cự thấu kính hội tụ, kính lúp, điện trở và định luật Ohm, đoạn mạch nối tiếp và song song, năng lượng và công suất điện, cảm ứng điện từ và dòng điện xoay chiều, vòng năng lượng trên Trái Đất, một số dạng năng lượng tái tạo (Tích hợp bài học STEM: Chế tạo Mô hình Chong chóng phát điện từ gió); Acetic acid (t2, t3), Lipid, Carbohydrate (Glucose, Saccharose, Tinh bột, Cellulose), Protein, Polymer, sơ lược hóa học vỏ Trái Đất, khai thác đá vôi và công nghiệp silicate, khai thác nhiên liệu hóa thạch, chu trình carbon và sự ấm lên toàn cầu; di truyền liên kết, đột biến NST, di truyền học với con người, ứng dụng công nghệ di truyền, khái niệm và cơ chế tiến hóa, sự phát sinh và phát triển sự sống trên Trái Đất và Kiểm tra giữa kì II, cuối kì II. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2a, 1.1.TC2b; AI 9.B3.1, 9.C2.1, 9.A1.1; Bài học STEM Bài 17; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'khtn9-li-hk2',
        week: 'HKII (Tiết PPCT 76, 80, 84, 87, 88, 91, 92, 95, 96, 99, 100, 103, 104, 107, 108, 111, 112, 115, 116, 119, 120, 123, 124, 127, 128, 131, 132, 135, 136, 139, 140)',
        lessonName: 'Bài 8. Thấu kính (t4) (1 tiết); Bài 9. Thực hành đo tiêu cự của thấu kính hội tụ (2 tiết); Bài 10. Kính lúp. Bài tập thấu kính (2 tiết); Bài 11. Điện trở. Định luật Ohm (4 tiết); Bài 12. Đoạn mạch một chiều mắc nối tiếp, mắc song song (3 tiết); Bài 13. Năng lượng của dòng điện và công suất điện (2 tiết); Bài 14. Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều (4 tiết); Bài 15. Tác dụng của dòng điện xoay chiều (2 tiết); Bài 16. Vòng năng lượng trên Trái Đất - Năng lượng hóa thạch (2 tiết); Bài 17. Một số dạng năng lượng tái tạo [Tích hợp bài học STEM] (3 tiết) & Ôn tập, Kiểm tra GK2, CK2 (6 tiết)',
        periodAllocation: '31 tiết (Phân môn Lí HKII)',
        periodsCount: 31,
        adjustedContent:
          'YCCĐ: Đo tiêu cự thấu kính hội tụ và sử dụng kính lúp; xây dựng định luật Ohm, tính điện trở tương đương của đoạn mạch nối tiếp, song song, năng lượng và công suất điện; giải thích hiện tượng cảm ứng điện từ và nguyên tắc tạo dòng điện xoay chiều; phân tích ưu, nhược điểm của năng lượng hóa thạch và năng lượng tái tạo (mặt trời, gió, sóng biển). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b (Bài 12), 1.1.TC2a (Bài 15); AI 9.A1.1 (Bài 13 tiết 2); Tích hợp bài học STEM tại Bài 17 tiết 3 (Chế tạo Mô hình Chong chóng phát điện từ gió); Tích hợp BĐKH và PCTT (Sử dụng điện tiết kiệm và năng lượng tái tạo giảm phát thải khí nhà kính, ứng phó biến đổi khí hậu).',
      },
      {
        id: 'khtn9-hoa-hk2',
        week: 'HKII (Tiết PPCT 74, 75, 78, 79, 82, 83, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137)',
        lessonName: 'Bài 27. Acetic acid (t2, t3) (2 tiết); Bài 28. Lipid (2 tiết); Bài 29. Carbohydrate: Glucose và saccharose (2 tiết); Bài 30. Tinh bột và cellulose (2 tiết); Bài 31. Protein (2 tiết); Bài 32. Polymer (3 tiết); Bài 33. Sơ lược về hóa học vỏ Trái Đất và khai thác tài nguyên từ vỏ Trái Đất (2 tiết); Bài 34. Khai thác đá vôi. Công nghiệp silicate (2 tiết); Bài 35. Khai thác nhiên liệu hóa thạch. Nguồn carbon. Chu trình carbon và sự ấm lên toàn cầu (2 tiết) & Ôn tập cuối kì II (1 tiết)',
        periodAllocation: '20 tiết (Phân môn Hóa HKII)',
        periodsCount: 20,
        adjustedContent:
          'YCCĐ: Trình bày tính chất hóa học và ứng dụng của Acetic acid, Lipid (phản ứng xà phòng hóa), Glucose (tráng bạc), Saccharose, Tinh bột, Cellulose, Protein và Polymer (chất dẻo, tơ, cao su, vật liệu composite, giảm ô nhiễm rác thải nhựa PE, PP); trình bày ngành công nghiệp silicate (gốm, thủy tinh, xi măng), chu trình carbon và các biện pháp giảm phát thải khí nhà kính CO2, CH4 gây ấm lên toàn cầu. Định hướng phát triển NLS - AI & Lồng ghép: AI 9.C2.1 (Bài 28 tiết 2); NLS 1.1.TC2a (Bài 29, 32), 1.1.TC2b (Bài 30, 34, 35); Tích hợp BĐKH và PCTT (Tác động của khai thác đá vôi và công nghiệp silicate đến môi trường, biến đổi khí hậu).',
      },
      {
        id: 'khtn9-sinh-hk2',
        week: 'HKII (Tiết PPCT 73, 77, 81, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122, 126, 130, 134, 138)',
        lessonName: 'Bài 44. Nhiễm sắc thể giới tính và cơ chế xác định giới tính (t2) (1 tiết); Bài 45. Di truyền liên kết (2 tiết); Bài 46. Đột biến nhiễm sắc thể (2 tiết); Bài 47. Di truyền học với con người (2 tiết); Bài 48. Ứng dụng công nghệ di truyền vào đời sống (2 tiết); Bài 49. Khái niệm tiến hóa và các hình thức chọn lọc (2 tiết); Bài 50. Cơ chế tiến hóa (3 tiết); Bài 51. Sự phát sinh và phát triển sự sống trên Trái Đất (3 tiết)',
        periodAllocation: '17 tiết (Phân môn Sinh HKII)',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Giải thích cơ chế xác định giới tính, hiện tượng di truyền liên kết (Morgan) và đột biến cấu trúc/số lượng NST; nêu một số hội chứng di truyền ở người (Down, Turner, bạch tạng, câm điếc bẩm sinh) và ứng dụng công nghệ di truyền, đạo đức sinh học; trình bày chọn lọc nhân tạo, chọn lọc tự nhiên, học thuyết tiến hóa Lamarck, Darwin, tiến hóa tổng hợp hiện đại và sự phát sinh sự sống trên Trái Đất. Định hướng phát triển NLS - AI & Lồng ghép: AI 9.B3.1 (Bài 44 tiết 2); NLS 1.1.TC2a (Bài 47, 48); Tích hợp BĐKH và PCTT (Nhận biết ảnh hưởng của biến đổi khí hậu và thiên tai đến sự tiến hóa của sinh vật).',
      },
    ],
  }),
];

// ============================================================================
// 1.4.1 – 1.4.4. MÔN CÔNG NGHỆ – CẤP THCS (LỚP 6, 7: 35 TIẾT; LỚP 8, 9: 53 TIẾT)
// ============================================================================
export const GRADE6_CONG_NGHE_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g6-cn-hk1',
    grade: 6,
    subject: 'Công nghệ',
    chapterCode: 'CN6-HK1',
    chapterTitle: 'Chương I. Nhà ở; Chương II. Bảo quản và chế biến thực phẩm & Chương III. Trang phục và thời trang (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    adjustedContentSummary:
      'Khái quát về nhà ở, xây dựng nhà ở (Chủ đề STEM: Kĩ sư xây dựng nhí - Thiết kế và mô hình hóa ngôi nhà mơ ước), ngôi nhà thông minh; thực phẩm và dinh dưỡng, phương pháp bảo quản và chế biến thực phẩm, dự án Bữa ăn kết nối yêu thương; trang phục trong đời sống, sử dụng và bảo quản trang phục và Kiểm tra giữa kì I, cuối kì I. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a; AI 6.A1.1; Chủ đề STEM Bài 2; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn6-c1-b1-b3',
        week: 'Tuần 1 – 6',
        lessonName: 'Chương I: Bài 1. Khái quát về nhà ở (2 tiết); Bài 2. Xây dựng nhà ở [Chủ đề STEM] (2 tiết); Bài 3. Ngôi nhà thông minh (1 tiết) & Ôn tập chương 1 (1 tiết)',
        periodAllocation: 'Tiết 1 – 6',
        periodsCount: 6,
        adjustedContent:
          'YCCĐ: Nêu vai trò, đặc điểm chung và kiến trúc nhà ở đặc trưng của Việt Nam; mô tả các bước chính trong xây dựng nhà ở và đặc điểm ngôi nhà thông minh, sử dụng năng lượng tiết kiệm, hiệu quả. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a (Bài 1, 3); Chủ đề STEM tại Bài 2 tiết 2 (STEM Kĩ sư xây dựng nhí: Thiết kế và mô hình hoá ngôi nhà mơ ước); Tích hợp BĐKH và PCTT (Những biện pháp PCTT trong xây dựng nhà ở; trồng và chăm sóc cây xanh góp phần bảo vệ môi trường, hạn chế BĐKH).',
      },
      {
        id: 'cn6-c2-b4-b6-kt-gk1',
        week: 'Tuần 7 – 13',
        lessonName: 'Chương II: Bài 4. Thực phẩm và dinh dưỡng (2 tiết); Kiểm tra giữa kì 1 (1 tiết); Bài 5. Phương pháp bảo quản và chế biến thực phẩm (2 tiết); Bài 6. Dự án: Bữa ăn kết nối yêu thương (1 tiết) & Ôn tập chương 2 (1 tiết)',
        periodAllocation: 'Tiết 7 – 13',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Nhận biết các nhóm thực phẩm chính, ăn uống khoa học và tính toán sơ bộ dinh dưỡng, chi phí tài chính cho bữa ăn gia đình; trình bày phương pháp bảo quản, chế biến thực phẩm an toàn (chế biến món ăn không sử dụng nhiệt). Kiểm tra giữa kì 1 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: AI 6.A1.1 (Bài 4 tiết 2); NLS 1.1.TC1a (Bài 6); Tích hợp BĐKH và PCTT (Rèn luyện kĩ năng chế biến món ăn không sử dụng nhiệt hạn chế khí thải gây BĐKH và PCTT).',
      },
      {
        id: 'cn6-c3-b7-b8-kt-ck1',
        week: 'Tuần 14 – 18',
        lessonName: 'Chương III (HKI): Bài 7. Trang phục trong đời sống (1 tiết); Bài 8. Sử dụng và bảo quản trang phục (2 tiết); Ôn tập & Kiểm tra cuối học kì 1 (2 tiết)',
        periodAllocation: 'Tiết 14 – 18',
        periodsCount: 5,
        adjustedContent:
          'YCCĐ: Nhận biết vai trò, phân loại trang phục và các loại vải thông dụng; lựa chọn, sử dụng và bảo quản trang phục phù hợp. Kiểm tra cuối kì 1 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a (Bài 8 tiết 1); Tích hợp BĐKH và PCTT (Biết mối quan hệ nhân quả giữa việc sản xuất nguyên liệu dệt, nhuộm vải với ô nhiễm môi trường và BĐKH).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g6-cn-hk2',
    grade: 6,
    subject: 'Công nghệ',
    chapterCode: 'CN6-HK2',
    chapterTitle: 'Chương III. Thời trang (tiếp) & Chương IV. Đồ dùng điện trong gia đình (HKII)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    adjustedContentSummary:
      'Thời trang; khái quát về đồ dùng điện trong gia đình, đèn điện, nồi cơm điện, bếp hồng ngoại, dự án An toàn và tiết kiệm điện năng trong gia đình và Kiểm tra giữa kì 2, cuối kì 2. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a; AI 6.A1.1; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn6-c3-b9-c4-b10-b11-kt-gk2',
        week: 'Tuần 19 – 26',
        lessonName: 'Bài 9. Thời trang (1 tiết); Ôn tập chương 3 (1 tiết); Chương IV: Bài 10. Khái quát về đồ dùng điện trong gia đình (3 tiết); Bài 11. Đèn điện (2 tiết) & Kiểm tra giữa kì 2 (1 tiết)',
        periodAllocation: 'Tiết 19 – 26',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Trình bày kiến thức cơ bản về thời trang; kể tên, công dụng, đọc thông số kĩ thuật và lưu ý sử dụng đồ dùng điện an toàn, tiết kiệm; mô tả cấu tạo và nguyên lí làm việc của đèn điện. Kiểm tra giữa kì 2 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: AI 6.A1.1 (Bài 10 tiết 2); NLS 1.1.TC1a (Bài 11 tiết 1); Tích hợp BĐKH và PCTT (Hoạt động sản xuất và tiêu dùng thời trang nhanh dẫn tới bãi rác thải trang phục gây ô nhiễm môi trường).',
      },
      {
        id: 'cn6-c4-b12-b14-kt-ck2',
        week: 'Tuần 27 – 35',
        lessonName: 'Bài 12. Nồi cơm điện (2 tiết); Bài 13. Bếp hồng ngoại (2 tiết); Bài 14. Dự án: An toàn và tiết kiệm điện năng trong gia đình (2 tiết); Ôn tập chương 4, Ôn tập & Kiểm tra học kì 2 (3 tiết)',
        periodAllocation: 'Tiết 27 – 35',
        periodsCount: 9,
        adjustedContent:
          'YCCĐ: Vẽ sơ đồ khối, mô tả nguyên lí làm việc và sử dụng đúng cách, tiết kiệm, an toàn nồi cơm điện và bếp hồng ngoại; đánh giá thực trạng và đề xuất việc làm cụ thể tiết kiệm điện năng trong gia đình. Kiểm tra cuối kì 2 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a (Bài 14 tiết 1); Tích hợp BĐKH và PCTT (Lựa chọn và sử dụng đồ dùng điện tiết kiệm năng lượng tại Bài 14 tiết 2).',
      },
    ],
  }),
];

export const GRADE7_CONG_NGHE_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g7-cn-hk1',
    grade: 7,
    subject: 'Công nghệ',
    chapterCode: 'CN7-HK1',
    chapterTitle: 'Phần 1. Trồng trọt & Lâm nghiệp (HKI)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18',
    totalPeriods: 18,
    adjustedContentSummary:
      'Giới thiệu về trồng trọt, làm đất trồng cây, gieo trồng - chăm sóc - phòng trừ sâu bệnh, thu hoạch sản phẩm trồng trọt, nhân giống vô tính cây trồng, dự án trồng rau an toàn (Chủ đề STEM), giới thiệu về rừng, trồng - chăm sóc - bảo vệ rừng và Kiểm tra giữa kì 1, cuối kì 1. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 5.1.TC1a, 3.1.TC1a, 1.1.TC1b; AI 7.C5.1, 7.D1.1; Chủ đề STEM Bài 6; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn7-b1-b4-kt-gk1',
        week: 'Tuần 1 – 8',
        lessonName: 'Bài 1. Giới thiệu về trồng trọt (2 tiết); Bài 2. Làm đất trồng cây (1 tiết); Bài 3. Gieo trồng, chăm sóc và phòng trừ sâu bệnh cho cây trồng (2 tiết); Bài 4. Thu hoạch sản phẩm trồng trọt (1 tiết); Ôn tập & Kiểm tra giữa học kì 1 (2 tiết)',
        periodAllocation: 'Tiết 1 – 8',
        periodsCount: 8,
        adjustedContent:
          'YCCĐ: Trình bày vai trò, triển vọng của trồng trọt và đặc điểm trồng trọt công nghệ cao; nêu mục đích và yêu cầu kĩ thuật làm đất, gieo trồng, chăm sóc, phòng trừ sâu bệnh và thu hoạch sản phẩm trồng trọt. Kiểm tra giữa kì 1 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a (Bài 1), 5.1.TC1a (Bài 4); AI 7.C5.1 (Bài 3 tiết 1); Tích hợp BĐKH và PCTT (Vận dụng kiến thức khoa học vào quá trình trồng trọt để đảm bảo sự phát triển của cây trồng và bảo vệ môi trường, bảo vệ đất trồng).',
      },
      {
        id: 'cn7-b5-b8-kt-ck1',
        week: 'Tuần 9 – 18',
        lessonName: 'Bài 5. Nhân giống vô tính cây trồng (2 tiết); Bài 6. Dự án trồng rau an toàn [Chủ đề STEM] (3 tiết); Bài 7. Giới thiệu về rừng (1 tiết); Bài 8. Trồng, chăm sóc và bảo vệ rừng (2 tiết); Ôn tập & Kiểm tra cuối học kì 1 (2 tiết)',
        periodAllocation: 'Tiết 9 – 18',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Thực hiện nhân giống cây trồng bằng phương pháp giâm cành; lập kế hoạch, tính toán chi phí và thực hiện quy trình trồng, chăm sóc rau an toàn trong khay/thùng xốp; phân biệt các loại rừng và tóm tắt quy trình trồng, chăm sóc, bảo vệ rừng. Kiểm tra cuối kì 1 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 3.1.TC1a (Bài 5), 1.1.TC1b (Bài 7); Chủ đề STEM tại Bài 6 (Dự án trồng rau an toàn); AI 7.D1.1 & Tích hợp BĐKH và PCTT tại Bài 8 (Vai trò của rừng trong bảo vệ môi trường sống, vận động trồng và bảo vệ rừng).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g7-cn-hk2',
    grade: 7,
    subject: 'Công nghệ',
    chapterCode: 'CN7-HK2',
    chapterTitle: 'Phần 2. Chăn nuôi & Thủy sản (HKII)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35',
    totalPeriods: 17,
    adjustedContentSummary:
      'Giới thiệu về chăn nuôi, nuôi dưỡng và chăm sóc vật nuôi, phòng và trị bệnh cho vật nuôi, chăn nuôi gà thịt trong nông hộ, lập kế hoạch nuôi vật nuôi trong gia đình; giới thiệu về thủy sản, nuôi cá ao, lập kế hoạch nuôi cá cảnh và Kiểm tra giữa kì 2, cuối kì 2. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a, 3.1.TC1a; AI 7.A1.2; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn7-b9-b11-kt-gk2',
        week: 'Tuần 19 – 25',
        lessonName: 'Bài 9. Giới thiệu về chăn nuôi (2 tiết); Bài 10. Nuôi dưỡng và chăm sóc vật nuôi (2 tiết); Bài 11. Phòng và trị bệnh cho vật nuôi (1 tiết); Ôn tập & Kiểm tra giữa học kì 2 (2 tiết)',
        periodAllocation: 'Tiết 19 – 25',
        periodsCount: 7,
        adjustedContent:
          'YCCĐ: Nhận biết các vật nuôi đặc trưng vùng miền và phương thức chăn nuôi phổ biến; trình bày công việc nuôi dưỡng, chăm sóc và phòng trị bệnh cho vật nuôi. Kiểm tra giữa kì 2 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a (Bài 9), 3.1.TC1a & AI 7.A1.2 (Bài 11); Tích hợp BĐKH và PCTT (Tầm quan trọng của xử lí chất thải và vệ sinh môi trường trong chăn nuôi để giảm thiểu ô nhiễm không khí, đất, nước và hạn chế phát thải khí nhà kính).',
      },
      {
        id: 'cn7-b12-b16-kt-ck2',
        week: 'Tuần 26 – 35',
        lessonName: 'Bài 12. Chăn nuôi gà thịt trong nông hộ (2 tiết); Bài 13. Thực hành: Lập kế hoạch nuôi vật nuôi trong gia đình (2 tiết); Bài 14. Giới thiệu về thủy sản (1 tiết); Bài 15. Nuôi cá ao (2 tiết); Bài 16. Thực hành: Lập kế hoạch nuôi cá cảnh (1 tiết); Ôn tập & Kiểm tra cuối học kì 2 (2 tiết)',
        periodAllocation: 'Tiết 26 – 35',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Trình bày kĩ thuật chăn nuôi gà thịt trong nông hộ và lập kế hoạch tính toán chi phí nuôi vật nuôi; trình bày kĩ thuật chuẩn bị ao, chăm sóc, thu hoạch cá và đo nhiệt độ, độ trong của nước ao nuôi; lập kế hoạch nuôi cá cảnh. Kiểm tra cuối kì 2 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC1a (Bài 14); Tích hợp BĐKH và PCTT tại Bài 15 (Sự BĐKH có ảnh hưởng trực tiếp và gián tiếp tới hiệu suất sử dụng thức ăn của cá và sự phân hủy thức ăn trong ao, hồ).',
      },
    ],
  }),
];

export const GRADE8_CONG_NGHE_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g8-cn-hk1',
    grade: 8,
    subject: 'Công nghệ',
    chapterCode: 'CN8-HK1',
    chapterTitle: 'Phần 1. Vẽ kĩ thuật & Cơ khí (HKI – 27 tiết)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (9 tuần x 2 tiết + 9 tuần x 1 tiết = 27 tiết)',
    totalPeriods: 27,
    adjustedContentSummary:
      'Tiêu chuẩn trình bày bản vẽ kĩ thuật, hình chiếu vuông góc, bản vẽ chi tiết, bản vẽ lắp, bản vẽ nhà; vật liệu cơ khí, truyền và biến đổi chuyển động, gia công cơ khí bằng tay, ngành nghề trong lĩnh vực cơ khí, dự án Gia công chi tiết bằng dụng cụ cầm tay và Kiểm tra giữa kì 1, cuối kì 1. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.2.TC2b, 1.1.TC2d; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn8-b1-b5',
        week: 'HKI (Tiết PPCT 1 – 11)',
        lessonName: 'Chương I. Vẽ kĩ thuật: Bài 1. Một số tiêu chuẩn trình bày bản vẽ kĩ thuật (2 tiết); Bài 2. Hình chiếu vuông góc (3 tiết); Bài 3. Bản vẽ chi tiết (2 tiết); Bài 4. Bản vẽ lắp (2 tiết); Bài 5. Bản vẽ nhà (2 tiết)',
        periodAllocation: 'Tiết 1 – 11',
        periodsCount: 11,
        adjustedContent:
          'YCCĐ: Mô tả tiêu chuẩn khổ giấy, tỉ lệ, đường nét, ghi kích thước; vẽ hình chiếu vuông góc của vật thể đơn giản; đọc được bản vẽ chi tiết, bản vẽ lắp và bản vẽ nhà đơn giản. Định hướng phát triển NLS - AI: NLS 1.2.TC2b (Bài 4).',
      },
      {
        id: 'cn8-b6-b10-kt-hk1',
        week: 'HKI (Tiết PPCT 12 – 27)',
        lessonName: 'Chương II. Cơ khí: Bài 6. Vật liệu cơ khí (2 tiết); Bài 7. Truyền và biến đổi chuyển động (3 tiết); Ôn tập & Kiểm tra giữa kì 1 (2 tiết); Bài 8. Gia công cơ khí bằng tay (3 tiết); Bài 9. Ngành nghề trong lĩnh vực cơ khí (2 tiết); Bài 10. Dự án: Gia công chi tiết bằng dụng cụ cầm tay (2 tiết); Ôn tập & Kiểm tra cuối kì 1 (2 tiết)',
        periodAllocation: 'Tiết 12 – 27',
        periodsCount: 16,
        adjustedContent:
          'YCCĐ: Nhận biết các vật liệu cơ khí phổ biến; tháo lắp và tính tỉ số truyền của các cơ cấu truyền và biến đổi chuyển động; thực hiện gia công cơ khí bằng tay và nhận biết ngành nghề cơ khí. Kiểm tra giữa kì 1 & cuối kì 1 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2d (Bài 9); Tích hợp BĐKH và PCTT tại Bài 6 & Bài 8 (Tìm hiểu vật liệu thân thiện với môi trường, vật liệu tái chế, chịu lực tốt trong điều kiện thời tiết cực đoan; ý thức vệ sinh, không vứt bỏ phế liệu bừa bãi, tận dụng phế liệu để tái sinh).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g8-cn-hk2',
    grade: 8,
    subject: 'Công nghệ',
    chapterCode: 'CN8-HK2',
    chapterTitle: 'Phần 2. Kĩ thuật điện & Thiết kế kĩ thuật (HKII – 26 tiết)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (9 tuần x 2 tiết + 8 tuần x 1 tiết = 26 tiết)',
    totalPeriods: 26,
    adjustedContentSummary:
      'Tai nạn điện, biện pháp an toàn điện, sơ cứu người bị tai nạn điện; khái quát về mạch điện, cảm biến và mô đun cảm biến, mạch điện điều khiển sử dụng mô đun cảm biến, ngành nghề trong lĩnh vực kĩ thuật điện; giới thiệu về thiết kế kĩ thuật, các bước cơ bản trong thiết kế kĩ thuật, dự án Thiết kế hệ thống tưới cây tự động và Kiểm tra giữa kì 2, cuối kì 2. Định hướng phát triển NLS - AI & Lồng ghép: NLS 2.2.TC2a; AI 8.A3.1; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn8-b11-b17',
        week: 'HKII (Tiết PPCT 28 – 42)',
        lessonName: 'Chương III & IV. Kĩ thuật điện: Bài 11. Tai nạn điện (1 tiết); Bài 12. Biện pháp an toàn điện (2 tiết); Bài 13. Sơ cứu người bị tai nạn điện (2 tiết); Bài 14. Khái quát về mạch điện (2 tiết); Bài 15. Cảm biến và mô đun cảm biến (1 tiết); Bài 16. Mạch điện điều khiển sử dụng mô đun cảm biến (5 tiết); Bài 17. Ngành nghề trong lĩnh vực kĩ thuật điện (2 tiết)',
        periodAllocation: 'Tiết 28 – 42',
        periodsCount: 15,
        adjustedContent:
          'YCCĐ: Sử dụng dụng cụ bảo vệ an toàn điện và thực hiện sơ cứu người bị tai nạn điện; vẽ sơ đồ khối và lắp ráp mạch điện điều khiển sử dụng mô đun cảm biến (ánh sáng, nhiệt độ, độ ẩm); nhận biết ngành nghề kĩ thuật điện. Định hướng phát triển NLS - AI & Lồng ghép: AI 8.A3.1 (Bài 17); Tích hợp BĐKH và PCTT tại Bài 12, 14, 16 (Đảm bảo an toàn điện trong thiên tai giông, lốc, sét, lũ lụt, ngập úng mùa mưa bão; tích hợp thiết kế mạch điện sử dụng năng lượng xanh pin mặt trời và mạch điện thông minh tự động tắt thiết bị khi không có người để tiết kiệm điện, giảm phát thải khí nhà kính).',
      },
      {
        id: 'cn8-b18-b20-kt-hk2',
        week: 'HKII (Tiết PPCT 43 – 53)',
        lessonName: 'Chương V. Thiết kế kĩ thuật: Bài 18. Giới thiệu về thiết kế kĩ thuật (2 tiết); Ôn tập & Kiểm tra giữa kì 2 (2 tiết); Bài 19. Các bước cơ bản trong thiết kế kĩ thuật (2 tiết); Bài 20. Dự án: Thiết kế hệ thống tưới cây tự động (3 tiết); Ôn tập & Kiểm tra cuối học kì 2 (2 tiết)',
        periodAllocation: 'Tiết 43 – 53',
        periodsCount: 11,
        adjustedContent:
          'YCCĐ: Trình bày mục đích, vai trò và các bước cơ bản trong thiết kế kĩ thuật; thiết kế được hệ thống tưới cây tự động có sử dụng cảm biến. Kiểm tra giữa kì 2 & cuối kì 2 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 2.2.TC2a (Bài 18); Tích hợp BĐKH và PCTT tại Bài 19 (Đánh giá vòng đời sản phẩm thiết kế, đảm bảo giảm thiểu tối đa rác thải công nghệ ra môi trường).',
      },
    ],
  }),
];

export const GRADE9_CONG_NGHE_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'nda-g9-cn-hk1',
    grade: 9,
    subject: 'Công nghệ',
    chapterCode: 'CN9-HK1',
    chapterTitle: 'Phần 1. Định hướng nghề nghiệp & Phần 2. Trải nghiệm nghề nghiệp – Mô đun Lắp đặt mạng điện trong nhà (HKI – 27 tiết)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 18 (9 tuần x 2 tiết + 9 tuần x 1 tiết = 27 tiết)',
    totalPeriods: 27,
    adjustedContentSummary:
      'Nghề nghiệp trong lĩnh vực kĩ thuật và công nghệ, cơ cấu hệ thống giáo dục quốc dân, thị trường lao động kĩ thuật và công nghệ tại Việt Nam, quy trình lựa chọn nghề nghiệp, dự án Tự đánh giá mức độ phù hợp của bản thân với ngành nghề; thiết bị đóng cắt và lấy điện trong gia đình, dụng cụ đo điện cơ bản và Kiểm tra giữa kì 1, cuối kì 1. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b; AI 9.A1.2; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn9-dhnn-b1-b5-kt-gk1',
        week: 'HKI (Tiết PPCT 1 – 17)',
        lessonName: 'Định hướng nghề nghiệp: Bài 1. Nghề nghiệp trong lĩnh vực kĩ thuật và công nghệ (3 tiết); Bài 2. Cơ cấu hệ thống giáo dục quốc dân (2 tiết); Bài 3. Thị trường lao động kĩ thuật, công nghệ tại Việt Nam (4 tiết); Bài 4. Quy trình lựa chọn nghề nghiệp (3 tiết); Bài 5. Dự án: Tự đánh giá mức độ phù hợp của bản thân với một số ngành nghề trong lĩnh vực kĩ thuật, công nghệ (3 tiết); Ôn tập & Kiểm tra giữa học kì 1 (2 tiết)',
        periodAllocation: 'Tiết 1 – 17',
        periodsCount: 17,
        adjustedContent:
          'YCCĐ: Phân tích đặc điểm, yêu cầu của ngành nghề kĩ thuật - công nghệ; nhận ra thời điểm phân luồng sau THCS; tìm kiếm thông tin thị trường lao động và tự đánh giá mức độ phù hợp của bản thân với ngành nghề. Kiểm tra giữa kì 1 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b (Bài 1, 3, 4, 5); AI 9.A1.2 (Bài 1 tiết 3); Tích hợp BĐKH và PCTT tại Bài 1 & Bài 5 (Hình thành nhận thức về xu hướng phát triển các nghề xanh, lựa chọn nghề nghiệp gắn với bảo vệ môi trường, tiết kiệm năng lượng và thích ứng với biến đổi khí hậu).',
      },
      {
        id: 'cn9-ldmd-b1-b2-kt-ck1',
        week: 'HKI (Tiết PPCT 18 – 27)',
        lessonName: 'Mô đun Lắp đặt mạng điện trong nhà (HKI): Bài 1. Thiết bị đóng cắt và lấy điện trong gia đình (4 tiết); Bài 2. Dụng cụ đo điện cơ bản (4 tiết); Ôn tập & Kiểm tra cuối học kì 1 (2 tiết)',
        periodAllocation: 'Tiết 18 – 27',
        periodsCount: 10,
        adjustedContent:
          'YCCĐ: Mô tả chức năng, cấu tạo và thông số kĩ thuật của thiết bị đóng cắt, lấy điện trong gia đình (cầu dao, aptomat, ổ cắm, phích cắm); sử dụng một số dụng cụ đo điện cơ bản (đồng hồ vạn năng, ampe kìm, công tơ điện). Kiểm tra cuối kì 1 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b (Bài 2 tiết 3, 4); Tích hợp BĐKH và PCTT (Sử dụng thiết bị điện và dụng cụ đo điện an toàn, hợp lí góp phần tiết kiệm năng lượng và sử dụng tài nguyên bền vững).',
      },
    ],
  }),
  buildThcsTopic({
    id: 'nda-g9-cn-hk2',
    grade: 9,
    subject: 'Công nghệ',
    chapterCode: 'CN9-HK2',
    chapterTitle: 'Phần 2. Trải nghiệm nghề nghiệp – Mô đun Lắp đặt mạng điện trong nhà (HKII – 26 tiết)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 35 (9 tuần x 2 tiết + 8 tuần x 1 tiết = 26 tiết)',
    totalPeriods: 26,
    adjustedContentSummary:
      'Thiết kế mạng điện trong nhà, lựa chọn vật liệu - thiết bị - dụng cụ cho mạng điện trong nhà, tính toán chi phí mạng điện trong nhà, thực hành lắp đặt mạng điện trong nhà, một số nghề liên quan đến lắp đặt mạng điện trong nhà và Kiểm tra giữa kì 2, cuối kì 2. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b; AI 9.A1.2; Tích hợp BĐKH và PCTT.',
    rawLessons: [
      {
        id: 'cn9-ldmd-b3-b5',
        week: 'HKII (Tiết PPCT 28 – 39)',
        lessonName: 'Bài 3. Thiết kế mạng điện trong nhà (4 tiết); Bài 4. Vật liệu, thiết bị và dụng cụ cho mạng điện trong nhà (4 tiết); Bài 5. Tính toán chi phí mạng điện trong nhà (4 tiết)',
        periodAllocation: 'Tiết 28 – 39',
        periodsCount: 12,
        adjustedContent:
          'YCCĐ: Thiết kế sơ đồ nguyên lí và sơ đồ lắp đặt mạng điện trong nhà; lựa chọn vật liệu, thiết bị, dụng cụ phù hợp và tính toán chi phí cho mạng điện trong nhà. Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b (Bài 3, 4, 5); Tích hợp BĐKH và PCTT (Thiết kế mạng điện khoa học, lựa chọn thiết bị điện đạt tiêu chuẩn tiết kiệm năng lượng, thân thiện môi trường và thích ứng với điều kiện thiên tai, khí hậu).',
      },
      {
        id: 'cn9-ldmd-b6-b7-kt-hk2',
        week: 'HKII (Tiết PPCT 40 – 53)',
        lessonName: 'Bài 6. Thực hành: Lắp đặt mạng điện trong nhà (8 tiết); Kiểm tra giữa học kì 2 (1 tiết); Bài 7. Một số nghề liên quan đến lắp đặt mạng điện trong nhà (3 tiết); Ôn tập & Kiểm tra cuối học kì 2 (2 tiết)',
        periodAllocation: 'Tiết 40 – 53',
        periodsCount: 14,
        adjustedContent:
          'YCCĐ: Lắp đặt, kiểm tra và thử nghiệm mạng điện trong nhà theo thiết kế đảm bảo đúng yêu cầu kĩ thuật và an toàn điện; đánh giá khả năng, sở thích của bản thân đối với một số ngành nghề liên quan đến lắp đặt mạng điện trong nhà. Kiểm tra giữa kì 2 & cuối kì 2 (45 phút). Định hướng phát triển NLS - AI & Lồng ghép: NLS 1.1.TC2b (Bài 7 tiết 1); AI 9.A1.2 (Bài 7 tiết 3); Tích hợp BĐKH và PCTT tại Bài 6 (Thực hiện lắp đặt mạng điện đúng quy trình, bảo đảm an toàn, tiết kiệm điện và hình thành tác phong làm việc có trách nhiệm, góp phần sử dụng năng lượng hiệu quả trong gia đình và cộng đồng).',
      },
    ],
  }),
];

export const THCS_CURRICULUM_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE6_TOAN_TOPICS_2026,
  ...GRADE7_TOAN_TOPICS_2026,
  ...GRADE8_TOAN_TOPICS_2026,
  ...GRADE9_TOAN_TOPICS_2026,
  ...GRADE6_TIN_HOC_TOPICS_2026,
  ...GRADE7_TIN_HOC_TOPICS_2026,
  ...GRADE8_TIN_HOC_TOPICS_2026,
  ...GRADE9_TIN_HOC_TOPICS_2026,
  ...GRADE6_KHTN_TOPICS_2026,
  ...GRADE7_KHTN_TOPICS_2026,
  ...GRADE8_KHTN_TOPICS_2026,
  ...GRADE9_KHTN_TOPICS_2026,
  ...GRADE6_CONG_NGHE_TOPICS_2026,
  ...GRADE7_CONG_NGHE_TOPICS_2026,
  ...GRADE8_CONG_NGHE_TOPICS_2026,
  ...GRADE9_CONG_NGHE_TOPICS_2026,
];
