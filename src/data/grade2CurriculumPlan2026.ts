import { CurriculumTopic } from '../types/domain';
import {
  GRADE2_TIENG_VIET_TOPICS,
  GRADE2_TOAN_TOPICS,
  NDA_G2_SOURCE_DOC,
} from './grade2TvAndMathPlan2026';
import {
  GRADE2_DAO_DUC_TOPICS,
  GRADE2_HDTN_TOPICS,
  GRADE2_TNXH_TOPICS,
} from './grade2TnxhEthExpPlan2026';
import {
  GRADE2_AM_NHAC_TOPICS,
  GRADE2_MY_THUAT_TOPICS,
} from './tieuHocMyThuatAmNhacPlan2026';
import { GRADE2_GDTC_TOPICS } from './gdtcTieuHocPlan2026';

export interface Grade2TeacherAssignment {
  stt: number;
  fullName: string;
  duty: string;
  studentCountText: string;
  note: string;
}

export const GRADE2_PLAN_METADATA = {
  schoolName: 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ 1-2-3, TỔ TIẾNG ANH - GDTC & TỔ KHXH (MĨ THUẬT - ÂM NHẠC - HĐTN)',
  locationAndDate: 'Đan Điền, ngày 28 tháng 8 năm 2026',
  planTitle: 'KẾ HOẠCH DẠY HỌC CÁC MÔN HỌC VÀ HOẠT ĐỘNG GIÁO DỤC KHỐI LỚP 2',
  academicYear: '2026 – 2027',
  textbookSeries: 'Bộ sách Kết nối tri thức với cuộc sống (Chương trình GDPT 2018)',
  legalBases: [
    'Công văn số 2345/BGDĐT-GDTH ngày 07/6/2021 của Bộ GD&ĐT về việc Hướng dẫn xây dựng kế hoạch giáo dục nhà trường cấp tiểu học',
    'Kế hoạch giáo dục năm học và tình hình thực tế của Trường TH&THCS Nguyễn Đình Anh năm học 2026 – 2027 (Duyệt của BGH: Phan Đức Quý)',
    'Tích hợp Giáo dục Trí tuệ nhân tạo (AI: YCCĐ 2.A1.1, 2.A1.2, 2.A2.1, 2.A2.2, 2.C3.1, 2.C3.2, 2.D1.1) và Năng lực số / Kĩ năng công dân số (NLS: 1.1.CB1a, 2.1.CB1a, 2.2.CB1a, 2.3.CB1a, 3.2.CB1a, 4.1.CB1b, 5.2.CB1a)',
    'Tích hợp Giáo dục địa phương thành phố Huế & liên hệ đơn vị hành chính mới sau sáp nhập (Trường TH&THCS Nguyễn Đình Anh; Thôn Hà Lạc và Sơn Công sáp nhập thành thôn Hà Sơn; thôn Tháp Nhuận và Hà Công sáp nhập thành thôn Tháp Hà)',
    'Tích hợp Tiếp cận giới (Bình đẳng giới, Quy tắc 5 ngón tay phòng tránh xâm hại), Quyền con người (QCN), Bảo vệ môi trường & Tiết kiệm nguồn nước (BVMT)',
    'Tích hợp An toàn giao thông (ATGT), Phòng cháy chữa cháy & Phòng tránh tai nạn thương tích / đuối nước / bom mìn (KNS), Quốc phòng & An ninh (QPAN/ANQP biển đảo Trường Sa) và Học tập, làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh',
  ],
  headOfDepartment: 'Nguyễn Thị Trà My',
  studentSummary:
    'Tổng số học sinh khối 2: 105 HS / 62 nữ (01 HSKT), biên chế thành 03 lớp (2/1: 33/19 nữ - 1 HSKT; 2/2: 36/22 nữ; 2/3: 36/21 nữ).',
  teacherSummary:
    'Tổng số giáo viên giảng dạy khối 2: 03 GV / 03 nữ (Trình độ Đại học: 1, Cao đẳng: 2; Tổ trưởng CM: Nguyễn Thị Trà My):',
  teachers: [
    {
      stt: 1,
      fullName: 'GVCN Lớp 2/1',
      duty: 'Giảng dạy & chủ nhiệm lớp 2/1',
      studentCountText: '33/19 nữ (01 HSKT)',
      note: 'Tổ 1-2-3 (Ti vi kết nối Internet)',
    },
    {
      stt: 2,
      fullName: 'GVCN Lớp 2/2',
      duty: 'Giảng dạy & chủ nhiệm lớp 2/2',
      studentCountText: '36/22 nữ',
      note: 'Tổ 1-2-3 (Ti vi kết nối Internet)',
    },
    {
      stt: 3,
      fullName: 'GVCN Lớp 2/3',
      duty: 'Giảng dạy & chủ nhiệm lớp 2/3',
      studentCountText: '36/21 nữ',
      note: 'Tổ 1-2-3 (Tổ trưởng CM: Nguyễn Thị Trà My)',
    },
  ] as Grade2TeacherAssignment[],
  subjectAllocationSummary: [
    {
      subject: 'Tiếng Việt',
      totalPeriods: 350,
      detail:
        '35 tuần (10 tiết/tuần): HKI 18 tuần = 180 tiết (32 bài/160 tiết + Ôn tập giữa HKI 10 tiết + Cuối HKI 10 tiết); HKII 17 tuần = 170 tiết (30 bài/150 tiết + Ôn tập giữa HKII 10 tiết + Cuối HKII 10 tiết)',
    },
    {
      subject: 'Toán',
      totalPeriods: 175,
      detail:
        '35 tuần (5 tiết/tuần, 14 chủ đề, 75 bài học): HKI 18 tuần = 90 tiết (Chủ đề 1–7, Bài 1–36 + Kiểm tra cuối HKI); HKII 17 tuần = 85 tiết (Chủ đề 8–14, Bài 37–75 + Kiểm tra cuối năm)',
    },
    {
      subject: 'Tự nhiên và Xã hội',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 6 chủ đề: Gia đình, Trường học, Cộng đồng địa phương, Thực vật và động vật, Con người và sức khỏe, Trái đất và bầu trời): HKI 36 tiết; HKII 34 tiết',
    },
    {
      subject: 'Đạo đức',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề, Bài 1–15 + 4 tiết Thực hành kĩ năng giữa/cuối HKI, HKII): HKI 18 tiết; HKII 17 tiết',
    },
    {
      subject: 'Mĩ thuật',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 10 chủ đề + Đánh giá định kỳ cuối HKI, cuối năm & Trưng bày sản phẩm): HKI 17 tiết; HKII 18 tiết (Tích hợp AI 2.A2.1, ANQP, BVMT, NLS 2.1.CB1a, 2.2.CB1a)',
    },
    {
      subject: 'Âm nhạc',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề + Ôn tập & Kiểm tra cuối HKI, cuối năm): HKI 18 tiết; HKII 17 tiết (Tích hợp GDQP-AN, BVMT, NLS, GDĐP, AI 2.C3.2, 2.A2.1, QCN, ATGT, STEM làm nhạc cụ Ma-ra-cát)',
    },
    {
      subject: 'Giáo dục thể chất',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 4 chủ đề: Đội hình đội ngũ [14 tiết], Bài tập thể dục [11 tiết], Tư thế và kỹ năng vận động cơ bản [26 tiết], Môn thể thao tự chọn – Bóng rổ [19 tiết]): HKI 18 tuần = 36 tiết; HKII 17 tuần = 34 tiết (Tích hợp AI 2.A1.3, 2.B1.1, NLS 1.3.CB1a, 4.3.CB1a, 1.2.CB1a, 5.1.CB1a, GDQP-AN, ATGT, BVMT, KNS)',
    },
    {
      subject: 'Hoạt động trải nghiệm',
      totalPeriods: 105,
      detail:
        '35 tuần (3 tiết/tuần: Sinh hoạt dưới cờ, HĐGD theo chủ đề, Sinh hoạt lớp; 9 chủ đề): HKI 18 tuần = 54 tiết; HKII 17 tuần = 51 tiết',
    },
  ],
  sourceDocument: NDA_G2_SOURCE_DOC,
};

export const GRADE2_CURRICULUM_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE2_TIENG_VIET_TOPICS,
  ...GRADE2_TOAN_TOPICS,
  ...GRADE2_TNXH_TOPICS,
  ...GRADE2_DAO_DUC_TOPICS,
  ...GRADE2_MY_THUAT_TOPICS,
  ...GRADE2_AM_NHAC_TOPICS,
  ...GRADE2_GDTC_TOPICS,
  ...GRADE2_HDTN_TOPICS,
];

