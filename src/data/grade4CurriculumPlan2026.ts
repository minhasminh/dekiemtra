import { CurriculumTopic } from '../types/domain';
import {
  GRADE4_TIENG_VIET_TOPICS,
  GRADE4_TOAN_TOPICS,
  NDA_G4_SOURCE_DOC,
  extractIntegrationTags,
} from './grade4TvAndMathPlan2026';

export { extractIntegrationTags };
import {
  GRADE4_DAO_DUC_TOPICS,
  GRADE4_HDTN_TOPICS,
  GRADE4_KHOA_HOC_TOPICS,
  GRADE4_LICH_SU_DIA_LI_TOPICS,
} from './grade4SciEthHistExpPlan2026';
import { GRADE4_CONG_NGHE_TOPICS } from './congNgheAndKhtnPlan2026';
import { GRADE4_TIN_HOC_TOPICS } from './tinHocTieuHocPlan2026';
import {
  GRADE4_AM_NHAC_TOPICS,
  GRADE4_MY_THUAT_TOPICS,
} from './tieuHocMyThuatAmNhacPlan2026';
import { GRADE4_TIENG_ANH_TOPICS } from './tiengAnhTieuHocPlan2026';
import { GRADE4_GDTC_TOPICS } from './gdtcTieuHocPlan2026';

export interface Grade4TeacherAssignment {
  stt: number;
  fullName: string;
  duty: string;
  studentCountText: string;
  note: string;
}

export const GRADE4_PLAN_METADATA = {
  schoolName: 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ 4, 5, TỔ TIẾNG ANH - GDTC & TỔ KHXH (MĨ THUẬT - ÂM NHẠC - HĐTN)',
  locationAndDate: 'Đan Điền, ngày 28 tháng 8 năm 2026',
  planTitle: 'KẾ HOẠCH Dạy học các môn học, hoạt động giáo dục khối lớp 4',
  academicYear: '2026 – 2027',
  textbookSeries: 'Bộ sách Kết nối tri thức với cuộc sống & Global Success (Chương trình GDPT 2018)',
  legalBases: [
    'Công văn số 2345/BGDĐT-GDTH ngày 07/6/2021 của Bộ GD&ĐT về việc Hướng dẫn xây dựng kế hoạch giáo dục của nhà trường cấp tiểu học',
    'Kế hoạch giáo dục và tình hình thực tế của Trường TH&THCS Nguyễn Đình Anh năm học 2026 – 2027',
    'Thông tư 02/2025/TT-BGDĐT về Khung năng lực số cho người học (Tích hợp Năng lực số - NLS)',
    'Quyết định 2422/QĐ-BGDĐT tháng 8/2026 về Giáo dục Trí tuệ nhân tạo (Tích hợp AI)',
    'Quy định 12 nội dung giáo dục tích hợp của Sở GD&ĐT TP Huế (NLS, AI, QCN, BVMT, Tiết kiệm & bảo vệ nguồn nước, QPAN/ANQP, ATGT, KNS, STEM, TTHCM, Lý tưởng cách mạng - đạo đức - lối sống, GDĐP)',
  ],
  headOfDepartment: 'Ngô Thị Thúy Loan',
  studentSummary: 'Tổng số học sinh khối 4: 126 HS / 60 nữ, biên chế thành 05 lớp (có 01 HSKT ở lớp 4/5).',
  teacherSummary: 'Tổng số giáo viên giảng dạy: 05 GV (04 nữ):',
  teachers: [
    {
      stt: 1,
      fullName: 'Ngô Thị Thúy Loan',
      duty: 'Giảng dạy & chủ nhiệm lớp 4/1 (Tổ trưởng)',
      studentCountText: '23/12 nữ',
      note: '',
    },
    {
      stt: 2,
      fullName: 'Hồ Văn Phú',
      duty: 'Giảng dạy & chủ nhiệm lớp 4/2',
      studentCountText: '22/11 nữ',
      note: '',
    },
    {
      stt: 3,
      fullName: 'Lê Thị Thanh Tâm',
      duty: 'Giảng dạy & chủ nhiệm lớp 4/3',
      studentCountText: '32/15 nữ',
      note: '',
    },
    {
      stt: 4,
      fullName: 'Hoàng Thị Điệp Thủy',
      duty: 'Giảng dạy & chủ nhiệm lớp 4/4',
      studentCountText: '31/12 nữ',
      note: '',
    },
    {
      stt: 5,
      fullName: 'Đặng Ngọc Quý',
      duty: 'Giảng dạy & chủ nhiệm lớp 4/5',
      studentCountText: '18/10 nữ',
      note: '1 HSKT',
    },
  ] as Grade4TeacherAssignment[],
  subjectAllocationSummary: [
    {
      subject: 'Tiếng Việt',
      totalPeriods: 245,
      detail:
        '35 tuần (7 tiết/tuần): HKI 18 tuần (32 bài/112 tiết + Ôn tập & ĐG giữa HKI 7 tiết + cuối HKI 7 tiết = 126 tiết); HKII 17 tuần (30 bài/105 tiết + Ôn tập & ĐG giữa HKII 7 tiết + cuối HKII 7 tiết = 119 tiết)',
    },
    {
      subject: 'Toán',
      totalPeriods: 175,
      detail:
        '35 tuần (5 tiết/tuần, 13 chủ đề, 73 bài học): HKI 7 chủ đề, 37 bài học (90 tiết); HKII 6 chủ đề, 36 bài học (85 tiết)',
    },
    {
      subject: 'Tiếng Anh',
      totalPeriods: 140,
      detail:
        '35 tuần (4 tiết/tuần, SGK Global Success, 4 chủ đề, Starter + 20 Units + 4 Reviews + Extension + Kiểm tra HKI & HKII): HKI 18 tuần = 72 tiết; HKII 17 tuần = 68 tiết (Tích hợp AI 4.A1.2, 4.A2.2, 4.B2.2, NLS 2.5.CB2.c, 4.2.CB2.b, 2.2.CB2.a, 2.6.CB2.b, Công dân số, QPAN, QCN, BVMT, Đạo đức - lối sống)',
    },
    {
      subject: 'Khoa học',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 6 chủ đề, 31 bài học kể cả ôn tập, kiểm tra): HKI 3 chủ đề, 17 bài học (35 tiết); HKII 3 chủ đề, 14 bài học (35 tiết)',
    },
    {
      subject: 'Đạo đức',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề, 9 bài học + 4 tiết Thực hành kĩ năng giữa/cuối kì): HKI 18 tiết; HKII 17 tiết',
    },
    {
      subject: 'Lịch sử và Địa lí',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 27 bài học + Kiểm tra cuối HKI & HKII): Đã điều chỉnh gộp Bài 23 tiết 3 và 4 thành Bài 23 tiết 3; chuyển Bài 24 tiết 1 lên tuần 31',
    },
    {
      subject: 'Mĩ thuật',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề + Kiểm tra đánh giá HKI, HKII & Trưng bày sản phẩm cuối năm): HKI 17 tiết; HKII 18 tiết (Tích hợp AI 4.A1.1, 4.B2.1, NLS 1.1.CB2c, 1.1.CB2a, ANQP, BVMT)',
    },
    {
      subject: 'Âm nhạc',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề + Ôn tập & Kiểm tra cuối HKI, cuối năm): HKI 18 tiết; HKII 17 tiết (Tích hợp NLS, AI 4.C2.1, 4.A2.1, GDQP-AN chủ quyền Hoàng Sa & Trường Sa, ATGT, STEM làm nhạc cụ gõ)',
    },
    {
      subject: 'Giáo dục thể chất',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 4 chủ đề: Đội hình đội ngũ [14 tiết], Bài thể dục phát triển chung với vòng [10 tiết], Bài tập rèn luyện tư thế và kỹ năng vận động cơ bản [26 tiết], Môn thể thao tự chọn – Bóng rổ [20 tiết]): HKI 18 tuần = 36 tiết; HKII 17 tuần = 34 tiết (Tích hợp AI 4.A1.1, 4.A3.1, NLS 1.3.CB2a, 5.1.CB2a, 4.3.CB2a, GDQP-AN, ATGT, BVMT, KNS)',
    },
    {
      subject: 'Hoạt động trải nghiệm',
      totalPeriods: 105,
      detail:
        '35 tuần (3 tiết/tuần: SHDC, GDTCĐ, SHL; 9 chủ đề): HKI 54 tiết/18 tuần; HKII 51 tiết/17 tuần',
    },
    {
      subject: 'Công nghệ',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần; Phần 1: Công nghệ và đời sống [Bài 1–6], Phần 2: Thủ công kĩ thuật [Bài 6 tiếp–Bài 12] + Ôn tập/Đánh giá cuối HKI & HKII): HKI 18 tiết/18 tuần; HKII 17 tiết/17 tuần (Tích hợp NLS, AI 4.A1.1, 4.A1.2, 4.A2.1, Bài học STEM Bài 4 & Bài 11)',
    },
    {
      subject: 'Tin học',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần; 6 chủ đề, Bài 1–16 + Ôn tập/Kiểm tra cuối HKI & HKII): HKI 18 tiết/18 tuần; HKII 17 tiết/17 tuần (Tích hợp NLS, AI 4.A1.1, 4.B2.1, 4.A1.2, 4.C5.1, 4.D1.1, 4.D2.1)',
    },
  ],
  sourceDocument: NDA_G4_SOURCE_DOC,
};

export const GRADE4_CURRICULUM_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE4_TIENG_VIET_TOPICS,
  ...GRADE4_TOAN_TOPICS,
  ...GRADE4_TIENG_ANH_TOPICS,
  ...GRADE4_KHOA_HOC_TOPICS,
  ...GRADE4_DAO_DUC_TOPICS,
  ...GRADE4_LICH_SU_DIA_LI_TOPICS,
  ...GRADE4_MY_THUAT_TOPICS,
  ...GRADE4_AM_NHAC_TOPICS,
  ...GRADE4_GDTC_TOPICS,
  ...GRADE4_HDTN_TOPICS,
  ...GRADE4_CONG_NGHE_TOPICS,
  ...GRADE4_TIN_HOC_TOPICS,
];

