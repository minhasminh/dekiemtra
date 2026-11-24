import { CurriculumTopic } from '../types/domain';
import {
  GRADE1_TIENG_VIET_TOPICS,
  GRADE1_TOAN_TOPICS,
  NDA_G1_SOURCE_DOC,
} from './grade1TvAndMathPlan2026';
import {
  GRADE1_DAO_DUC_TOPICS,
  GRADE1_HDTN_TOPICS,
  GRADE1_TNXH_TOPICS,
} from './grade1TnxhEthExpPlan2026';
import {
  GRADE1_AM_NHAC_TOPICS,
  GRADE1_MY_THUAT_TOPICS,
} from './tieuHocMyThuatAmNhacPlan2026';
import { GRADE1_GDTC_TOPICS } from './gdtcTieuHocPlan2026';

export interface Grade1TeacherAssignment {
  stt: number;
  fullName: string;
  duty: string;
  studentCountText: string;
  note: string;
}

export const GRADE1_PLAN_METADATA = {
  schoolName: 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ 1-2-3, TỔ TIẾNG ANH - GDTC & TỔ KHXH (MĨ THUẬT - ÂM NHẠC - HĐTN)',
  locationAndDate: 'Đan Điền, ngày 28 tháng 8 năm 2026',
  planTitle: 'KẾ HOẠCH DẠY HỌC CÁC MÔN HỌC, HOẠT ĐỘNG GIÁO DỤC KHỐI LỚP 1',
  academicYear: '2026 – 2027',
  textbookSeries: 'Bộ sách Kết nối tri thức với cuộc sống (Chương trình GDPT 2018)',
  legalBases: [
    'Công văn số 2345/BGDĐT-GDTH ngày 07/6/2021 của Bộ GD&ĐT về việc Hướng dẫn xây dựng kế hoạch giáo dục của nhà trường cấp tiểu học',
    'Kế hoạch giáo dục năm học và tình hình thực tế của Trường TH&THCS Nguyễn Đình Anh năm học 2026 – 2027 (Duyệt của BGH: Phan Đức Quý)',
    'Thông tư 37/2021/TT-BGDĐT ngày 30/12/2021 của Bộ GD&ĐT ban hành Danh mục thiết bị dạy học tối thiểu cấp tiểu học (100% lớp học có ti vi kết nối Internet & học liệu hành trang số)',
    'Tích hợp Giáo dục Trí tuệ nhân tạo (AI: 1.A1.1, 1.A1.2, 1.A2.1, 1.A2.2, 1.B1.1, 1.B3.1, 1.C1.2, 1.C1.4, 1.D1.1, 1.D2.1) và Năng lực số / Kĩ năng công dân số (NLS: 1.1.CB1a, 1.1.CB1b, 2.1.CB1a, 2.2.CB1a, 2.3.CB1a, 2.5.CB1a, 3.1.CB1a, 4.1.CB1b, 4.2.CB1a, 4.3.CB1a, 5.2.CB1a)',
    'Tích hợp Bài học STEM môn Toán & Âm nhạc lớp 1 (Thực hành trang trí lớp học bằng các hình hình học; Dụng cụ tính cộng, tính trừ; Bảng các số từ 1 đến 100; Đồng hồ tiện ích; Nhạc cụ gõ Ma-ra-cat tự tạo)',
    'Tích hợp Giáo dục địa phương thành phố Huế, Quốc phòng & An ninh (QPAN: Cột cờ Hà Nội/Lũng Cú, Bộ đội Cụ Hồ, biển đảo Việt Nam, 34 đơn vị hành chính cấp tỉnh sau sắp xếp năm 2025), Quyền con người (QCN), Bảo vệ môi trường & Tiết kiệm nguồn nước (BVMT), ATGT, PCCC-CNCH, Phòng tránh bom mìn, Chăm sóc mắt & phòng chống mù lòa',
  ],
  headOfDepartment: 'Nguyễn Thị Trà My',
  studentSummary:
    'Tổng số học sinh khối 1: 119 HS / 60 nữ, biên chế thành 04 lớp (1/1: 24/12 nữ; 1/2: 23/13 nữ; 1/3: 36/18 nữ; 1/4: 36/17 nữ).',
  teacherSummary:
    'Tổng số giáo viên giảng dạy khối 1: 04 GV (Tổ trưởng chuyên môn: Nguyễn Thị Trà My):',
  teachers: [
    {
      stt: 1,
      fullName: 'GVCN Lớp 1/1',
      duty: 'Giảng dạy & chủ nhiệm lớp 1/1',
      studentCountText: '24/12 nữ',
      note: 'Tổ 1-2-3 (Ti vi kết nối Internet)',
    },
    {
      stt: 2,
      fullName: 'GVCN Lớp 1/2',
      duty: 'Giảng dạy & chủ nhiệm lớp 1/2',
      studentCountText: '23/13 nữ',
      note: 'Tổ 1-2-3 (Ti vi kết nối Internet)',
    },
    {
      stt: 3,
      fullName: 'GVCN Lớp 1/3',
      duty: 'Giảng dạy & chủ nhiệm lớp 1/3',
      studentCountText: '36/18 nữ',
      note: 'Tổ 1-2-3 (Ti vi kết nối Internet)',
    },
    {
      stt: 4,
      fullName: 'GVCN Lớp 1/4',
      duty: 'Giảng dạy & chủ nhiệm lớp 1/4',
      studentCountText: '36/17 nữ',
      note: 'Tổ 1-2-3 (Tổ trưởng CM: Nguyễn Thị Trà My)',
    },
  ] as Grade1TeacherAssignment[],
  subjectAllocationSummary: [
    {
      subject: 'Tiếng Việt',
      totalPeriods: 420,
      detail:
        '35 tuần (12 tiết/tuần): HKI 18 tuần x 12 tiết = 216 tiết (Làm quen & Học vần Bài 1–83 + ĐG cuối HKI); HKII 17 tuần x 12 tiết = 204 tiết (Luyện tập tổng hợp 8 chủ đề + Ôn tập & ĐG cuối năm)',
    },
    {
      subject: 'Toán',
      totalPeriods: 105,
      detail:
        '35 tuần (3 tiết/tuần, 10 chủ đề, Bài 1–41): HKI 18 tuần x 3 tiết = 54 tiết (Chủ đề 1–5); HKII 17 tuần x 3 tiết = 51 tiết (Chủ đề 6–10), tích hợp 04 Bài học STEM',
    },
    {
      subject: 'Tự nhiên và Xã hội',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 6 chủ đề, Bài 1–28): HKI 18 tuần = 36 tiết (Gia đình, Trường học, Cộng đồng địa phương, Thực vật & động vật); HKII 17 tuần = 34 tiết (Thực vật & động vật tiếp, Con người & sức khỏe, Trái đất & bầu trời)',
    },
    {
      subject: 'Đạo đức',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề, Bài 1–30 + Thực hành kĩ năng giữa kì & Đánh giá cuối kì): HKI 18 tiết; HKII 17 tiết',
    },
    {
      subject: 'Mĩ thuật',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 9 chủ đề + Đánh giá định kỳ cuối HKI, cuối năm & Trưng bày sản phẩm): HKI 17 tiết; HKII 18 tiết (Tích hợp ANQP, ATGT, BVMT, NLS 1.1.CB1b, 2.2.CB1a, AI 1.C1.2, 1.A1.1, 1.D2.1, 1.A1.2)',
    },
    {
      subject: 'Âm nhạc',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề + Ôn tập & Kiểm tra cuối HKI, cuối năm): HKI 18 tiết; HKII 17 tiết (Tích hợp AI 1.C1.4, 1.A2.2, GDQP-AN, GDĐP, STEM làm nhạc cụ gõ Ma-ra-cat)',
    },
    {
      subject: 'Giáo dục thể chất',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 4 chủ đề: Đội hình đội ngũ [15 tiết], Bài thể dục phát triển chung [9 tiết], Bài tập rèn luyện tư thế và kỹ năng vận động cơ bản [26 tiết], Môn thể thao tự chọn – Bóng rổ [20 tiết]): HKI 18 tuần = 36 tiết; HKII 17 tuần = 34 tiết (Tích hợp AI 1.B3.2, 1.D1.2, NLS 5.2TC1a, 1.1TC1a, 4.1TC1a, 1.2TC1a, GDQP-AN, ATGT, BVMT, KNS)',
    },
    {
      subject: 'Hoạt động trải nghiệm',
      totalPeriods: 105,
      detail:
        '35 tuần (3 tiết/tuần: Sinh hoạt dưới cờ, HĐGD theo chủ đề, Sinh hoạt lớp/sao; 9 chủ đề, Bài 1–21): HKI 18 tuần = 54 tiết; HKII 17 tuần = 51 tiết',
    },
  ],
  sourceDocument: NDA_G1_SOURCE_DOC,
};

export const GRADE1_CURRICULUM_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE1_TIENG_VIET_TOPICS,
  ...GRADE1_TOAN_TOPICS,
  ...GRADE1_TNXH_TOPICS,
  ...GRADE1_DAO_DUC_TOPICS,
  ...GRADE1_MY_THUAT_TOPICS,
  ...GRADE1_AM_NHAC_TOPICS,
  ...GRADE1_GDTC_TOPICS,
  ...GRADE1_HDTN_TOPICS,
];

