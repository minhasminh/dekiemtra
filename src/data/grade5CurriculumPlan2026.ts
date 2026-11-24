import { CurriculumTopic } from '../types/domain';
import {
  GRADE5_TIENG_VIET_TOPICS,
  GRADE5_TOAN_TOPICS,
  NDA_G5_SOURCE_DOC,
} from './grade5TvAndMathPlan2026';
import {
  GRADE5_DAO_DUC_TOPICS,
  GRADE5_HDTN_TOPICS,
  GRADE5_KHOA_HOC_TOPICS,
  GRADE5_LICH_SU_DIA_LI_TOPICS,
} from './grade5SciEthHistExpPlan2026';
import { GRADE5_CONG_NGHE_TOPICS } from './congNgheAndKhtnPlan2026';
import { GRADE5_TIN_HOC_TOPICS } from './tinHocTieuHocPlan2026';
import {
  GRADE5_AM_NHAC_TOPICS,
  GRADE5_MY_THUAT_TOPICS,
} from './tieuHocMyThuatAmNhacPlan2026';
import { GRADE5_TIENG_ANH_TOPICS } from './tiengAnhTieuHocPlan2026';
import { GRADE5_GDTC_TOPICS } from './gdtcTieuHocPlan2026';

export interface Grade5TeacherAssignment {
  stt: number;
  fullName: string;
  duty: string;
  studentCountText: string;
  note: string;
}

export const GRADE5_PLAN_METADATA = {
  schoolName: 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ 4, 5, TỔ TIẾNG ANH - GDTC & TỔ KHXH (MĨ THUẬT - ÂM NHẠC - HĐTN)',
  locationAndDate: 'Đan Điền, ngày 28 tháng 8 năm 2026',
  planTitle: 'KẾ HOẠCH Dạy học các môn học, hoạt động giáo dục khối lớp 5',
  academicYear: '2026 – 2027',
  textbookSeries: 'Bộ sách Kết nối tri thức với cuộc sống & Global Success (Chương trình GDPT 2018)',
  legalBases: [
    'Công văn số 2345/BGDĐT-GDTH ngày 07/6/2021 của Bộ GD&ĐT về việc Hướng dẫn xây dựng kế hoạch giáo dục của nhà trường cấp tiểu học',
    'Kế hoạch giáo dục và tình hình thực tế của Trường TH&THCS Nguyễn Đình Anh năm học 2026 – 2027',
    'Thông tư 02/2025/TT-BGDĐT về Khung năng lực số cho người học (Tích hợp Năng lực số - NLS)',
    'Quyết định 2422/QĐ-BGDĐT tháng 8/2026 về Giáo dục Trí tuệ nhân tạo (Tích hợp AI)',
    'Nội dung điều chỉnh bổ sung môn Lịch sử và Địa lí lớp 5 đã tập huấn vào tháng 8/2026 (Bài 1 về vùng biển Việt Nam và Bài 3 về chủ quyền quần đảo Hoàng Sa, Trường Sa)',
    'Quy định 12 nội dung giáo dục tích hợp của Sở GD&ĐT TP Huế (NLS, AI, QCN, BVMT, Tiết kiệm & bảo vệ nguồn nước, QPAN/ANQP, ATGT, KNS, STEM, TTHCM, Lý tưởng cách mạng - đạo đức - lối sống, GDĐP)',
  ],
  headOfDepartment: 'Ngô Thị Thúy Loan',
  studentSummary:
    'Tổng số học sinh khối 5: 112 HS / 53 nữ, biên chế thành 04 lớp (5/1, 5/2, 5/3, 5/4).',
  teacherSummary: 'Tổng số giáo viên giảng dạy: 04 GV / 02 nữ:',
  teachers: [
    {
      stt: 1,
      fullName: 'Nguyễn Hòa',
      duty: 'Giảng dạy & chủ nhiệm lớp 5/1',
      studentCountText: '20/10 nữ',
      note: '',
    },
    {
      stt: 2,
      fullName: 'Hoàng Văn Tuân',
      duty: 'Giảng dạy & chủ nhiệm lớp 5/2',
      studentCountText: '21/11 nữ',
      note: '',
    },
    {
      stt: 3,
      fullName: 'Hồ Thị Mỹ Trang',
      duty: 'Giảng dạy & chủ nhiệm lớp 5/3',
      studentCountText: '35/15 nữ',
      note: '',
    },
    {
      stt: 4,
      fullName: 'Phạm Thị Mai Hoa',
      duty: 'Giảng dạy & chủ nhiệm lớp 5/4',
      studentCountText: '36/17 nữ',
      note: '',
    },
  ] as Grade5TeacherAssignment[],
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
        '35 tuần (5 tiết/tuần, 12 chủ đề, 75 bài học): HKI 6 chủ đề, 35 bài học (90 tiết); HKII 6 chủ đề, 40 bài học (85 tiết)',
    },
    {
      subject: 'Tiếng Anh',
      totalPeriods: 140,
      detail:
        '35 tuần (4 tiết/tuần, SGK Global Success, 4 chủ đề, Starter + 20 Units + 4 Reviews + Extension + Kiểm tra HKI & HKII): HKI 18 tuần = 72 tiết; HKII 17 tuần = 68 tiết (Tích hợp AI 5.A3.2, 5.A2.1, 5.A2.MR1, 5.A3.1, NLS 4.2.CB2.b, 4.2.CB2.a, 1.1.CB2.c, 1.1.CB2.d, ATGT, QPAN, QCN, BVMT, Đạo đức - lối sống)',
    },
    {
      subject: 'Khoa học',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 6 chủ đề): gồm 63 tiết bài học (Bài 1–30) và 7 tiết ôn tập, kiểm tra đánh giá',
    },
    {
      subject: 'Đạo đức',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề, Bài 1–8 + 4 tiết Ôn tập, đánh giá giữa/cuối kì): HKI 18 tiết; HKII 17 tiết',
    },
    {
      subject: 'Lịch sử và Địa lí',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 6 chủ đề, Bài 1–28 + Kiểm tra cuối HKI & cuối năm): Đã cập nhật điều chỉnh bổ sung tháng 8/2026 tại Bài 1 và Bài 3',
    },
    {
      subject: 'Mĩ thuật',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề + Kiểm tra đánh giá HKI, HKII & Trưng bày sản phẩm cuối năm): HKI 17 tiết; HKII 18 tiết (Tích hợp ANQP, BVMT, NLS 1.1.CB2b, 2.2.CB2a)',
    },
    {
      subject: 'Âm nhạc',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề + Ôn tập & Kiểm tra đánh giá cuối HKI, cuối năm): HKI 18 tiết; HKII 17 tiết (Tích hợp AI 5.C4.2, 5.A2.1, 5.A3.1, GDQP-AN, NLS, GDĐP Huế, STEM làm trống con)',
    },
    {
      subject: 'Giáo dục thể chất',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 4 chủ đề: Đội hình đội ngũ [14 tiết], Bài tập thể dục với gậy [10 tiết], Tư thế và kĩ năng vận động cơ bản [26 tiết], Thể thao tự chọn – Bóng rổ [20 tiết]): HKI 18 tuần = 36 tiết; HKII 17 tuần = 34 tiết (Tích hợp AI 5.A1.1, 5.B1.2, NLS 1.1TC1a, 6.1TC2a, 5.2TC1a, GDQP-AN, ATGT, BVMT, KNS)',
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
        '35 tuần (1 tiết/tuần; Phần 1: Công nghệ và đời sống [Bài 1–5], Phần II: Thủ công kĩ thuật [Bài 6–9] + Ôn tập/Kiểm tra cuối HKI & HKII): HKI 18 tiết/18 tuần; HKII 17 tiết/17 tuần (Tích hợp NLS, AI 5.A2.2, 5.A2.1, 5.A3.1, 5.A1.1, Bài học STEM Bài 4)',
    },
    {
      subject: 'Tin học',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần; 6 chủ đề, Bài 1–16 + Ôn tập/Kiểm tra cuối HKI & HKII): HKI 18 tiết/18 tuần; HKII 17 tiết/17 tuần (Tích hợp NLS, AI 5.A2.1, 5.A3.1, 5.A1.1, 5.C4.1)',
    },
  ],
  sourceDocument: NDA_G5_SOURCE_DOC,
};

export const GRADE5_CURRICULUM_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE5_TIENG_VIET_TOPICS,
  ...GRADE5_TOAN_TOPICS,
  ...GRADE5_TIENG_ANH_TOPICS,
  ...GRADE5_KHOA_HOC_TOPICS,
  ...GRADE5_DAO_DUC_TOPICS,
  ...GRADE5_LICH_SU_DIA_LI_TOPICS,
  ...GRADE5_MY_THUAT_TOPICS,
  ...GRADE5_AM_NHAC_TOPICS,
  ...GRADE5_GDTC_TOPICS,
  ...GRADE5_HDTN_TOPICS,
  ...GRADE5_CONG_NGHE_TOPICS,
  ...GRADE5_TIN_HOC_TOPICS,
];

