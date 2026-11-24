import { CurriculumTopic } from '../types/domain';
import {
  GRADE3_TIENG_VIET_TOPICS,
  GRADE3_TOAN_TOPICS,
  NDA_G3_SOURCE_DOC,
} from './grade3TvAndMathPlan2026';
import {
  GRADE3_DAO_DUC_TOPICS,
  GRADE3_HDTN_TOPICS,
  GRADE3_TNXH_TOPICS,
} from './grade3TnxhEthExpPlan2026';
import { GRADE3_CONG_NGHE_TOPICS } from './congNgheAndKhtnPlan2026';
import { GRADE3_TIN_HOC_TOPICS } from './tinHocTieuHocPlan2026';
import {
  GRADE3_AM_NHAC_TOPICS,
  GRADE3_MY_THUAT_TOPICS,
} from './tieuHocMyThuatAmNhacPlan2026';
import { GRADE3_TIENG_ANH_TOPICS } from './tiengAnhTieuHocPlan2026';
import { GRADE3_GDTC_TOPICS } from './gdtcTieuHocPlan2026';

export interface Grade3TeacherAssignment {
  stt: number;
  fullName: string;
  duty: string;
  studentCountText: string;
  note: string;
}

export const GRADE3_PLAN_METADATA = {
  schoolName: 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ 1-2-3, TỔ TIẾNG ANH - GDTC & TỔ KHXH (MĨ THUẬT - ÂM NHẠC - HĐTN)',
  locationAndDate: 'Đan Điền, ngày 28 tháng 8 năm 2026',
  planTitle: 'KẾ HOẠCH DẠY HỌC CÁC MÔN HỌC, HOẠT ĐỘNG GIÁO DỤC KHỐI LỚP 3',
  academicYear: '2026 – 2027',
  textbookSeries: 'Bộ sách Kết nối tri thức với cuộc sống & Global Success (Chương trình GDPT 2018)',
  legalBases: [
    'Công văn số 2345/BGDĐT-GDTH ngày 07/6/2021 của Bộ GD&ĐT về việc Hướng dẫn xây dựng kế hoạch giáo dục của nhà trường cấp tiểu học',
    'Kế hoạch giáo dục và tình hình thực tế của Trường TH&THCS Nguyễn Đình Anh năm học 2026 – 2027 (Duyệt của BGH: Phan Đức Quý)',
    'Thông tư 02/2025/TT-BGDĐT về Khung năng lực số cho người học (Tích hợp Năng lực số - NLS) & Quyết định 2422/QĐ-BGDĐT về Giáo dục Trí tuệ nhân tạo (AI: 3.A1.1, 3.A1.2, 3.A1.MR1, 3.A2.1, 3.A2.2, 3.B2.1, 3.C4.1, 3.C5.1, 3.C5.2, 3.C5.3, 3.D1.1, 3.D2.1, 3.D2.2)',
    'Tích hợp Bài học STEM môn Toán, Tự nhiên và Xã hội, Công nghệ, Tin học, Âm nhạc & Tiếng Anh lớp 3 (Thước gấp; Bảng nhân, bảng chia; Trải nghiệm cùng một phần mấy; Họ hàng nội, ngoại; Làm nhạc cụ gõ Ma-ra-cat; Thiết kế mô hình ngôi nhà thân thiện với môi trường...)',
    'Tích hợp Giáo dục địa phương tỉnh Thừa Thiên Huế lớp 3 (Chủ đề 1: Danh lam thắng cảnh; Chủ đề 2: Ca Huế; Chủ đề 3: Lễ hội truyền thống; Chủ đề 4: Danh nhân Tôn Thất Tùng; Chủ đề 5: Ẩm thực truyền thống; Chủ đề 6: Làm đồ chơi dân gian; Chủ đề 7: Trồng cây lưu niệm)',
    'Tích hợp Quyền con người (QCN), Bảo vệ môi trường (BVMT), An toàn giao thông (ATGT), Kĩ năng sống (KNS), Quốc phòng & An ninh (QPAN) và Học tập, làm theo tấm gương đạo đức, phong cách Hồ Chí Minh',
  ],
  headOfDepartment: 'Nguyễn Thị Trà My',
  studentSummary:
    'Tổng số học sinh khối 3: 127 HS / 65 nữ, biên chế thành 05 lớp (3/1: 21/13 nữ; 3/2: 22/9 nữ; 3/3: 32/14 nữ; 3/4: 31/15 nữ; 3/5: 21/14 nữ).',
  teacherSummary: 'Tổng số giáo viên giảng dạy khối 3: 05 GV / 04 nữ (Tổ trưởng chuyên môn: Nguyễn Thị Trà My):',
  teachers: [
    {
      stt: 1,
      fullName: 'GVCN Lớp 3/1',
      duty: 'Giảng dạy & chủ nhiệm lớp 3/1',
      studentCountText: '21/13 nữ',
      note: 'Tổ 1-2-3',
    },
    {
      stt: 2,
      fullName: 'GVCN Lớp 3/2',
      duty: 'Giảng dạy & chủ nhiệm lớp 3/2',
      studentCountText: '22/9 nữ',
      note: 'Tổ 1-2-3',
    },
    {
      stt: 3,
      fullName: 'GVCN Lớp 3/3',
      duty: 'Giảng dạy & chủ nhiệm lớp 3/3',
      studentCountText: '32/14 nữ',
      note: 'Tổ 1-2-3',
    },
    {
      stt: 4,
      fullName: 'GVCN Lớp 3/4',
      duty: 'Giảng dạy & chủ nhiệm lớp 3/4',
      studentCountText: '31/15 nữ',
      note: 'Tổ 1-2-3',
    },
    {
      stt: 5,
      fullName: 'GVCN Lớp 3/5',
      duty: 'Giảng dạy & chủ nhiệm lớp 3/5',
      studentCountText: '21/14 nữ',
      note: 'Tổ 1-2-3 (Tổ trưởng CM: Nguyễn Thị Trà My)',
    },
  ] as Grade3TeacherAssignment[],
  subjectAllocationSummary: [
    {
      subject: 'Tiếng Việt',
      totalPeriods: 245,
      detail:
        '35 tuần (7 tiết/tuần): HKI 18 tuần – 32 bài (4 chủ đề) + Ôn tập giữa HKI (7 tiết) + Cuối HKI (7 tiết) = 126 tiết; HKII 17 tuần – 30 bài (4 chủ đề) + Ôn tập giữa HKII (7 tiết) + Cuối HKII (7 tiết) = 119 tiết',
    },
    {
      subject: 'Toán',
      totalPeriods: 175,
      detail:
        '35 tuần (5 tiết/tuần, 16 chủ đề, 81 bài học): HKI 18 tuần = 90 tiết (Chủ đề 1–7, Bài 1–44 + Kiểm tra cuối HKI); HKII 17 tuần = 85 tiết (Chủ đề 8–16, Bài 45–81 + Kiểm tra cuối năm)',
    },
    {
      subject: 'Tiếng Anh',
      totalPeriods: 140,
      detail:
        '35 tuần (4 tiết/tuần, SGK Global Success, 4 chủ đề, Starter + 20 Units + 4 Reviews + Funtime + Kiểm tra HKI & HKII): HKI 18 tuần = 72 tiết; HKII 17 tuần = 68 tiết (Tích hợp AI 3.A1.MR1, 3.C5.1, 3.C5.3, NLS 2.5.CB1.a, 3.4.CB1.a, 4.2.CB1.b, STEM Unit 13, KNS, QCN, BVMT, Đạo đức - lối sống)',
    },
    {
      subject: 'Tự nhiên và Xã hội',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 6 chủ đề, Bài 1–30): HKI 36 tiết (Chủ đề 1–4 + Kiểm tra cuối HKI); HKII 34 tiết (Chủ đề 5–6 + Kiểm tra cuối HKII)',
    },
    {
      subject: 'Đạo đức',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề, Bài 1–10 + 4 tiết Ôn tập/Thực hành kĩ năng giữa & cuối kì): HKI 18 tiết; HKII 17 tiết',
    },
    {
      subject: 'Mĩ thuật',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 10 chủ đề + Kiểm tra/đánh giá cuối HKI, cuối năm & Trưng bày sản phẩm): HKI 17 tiết; HKII 18 tiết (Tích hợp ANQP, BVMT, ATGT, AI 3.A2.2, NLS 1.1.CB1b, 2.2.CB1a)',
    },
    {
      subject: 'Âm nhạc',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần, 8 chủ đề + Ôn tập & Kiểm tra cuối HKI, cuối năm): HKI 18 tiết; HKII 17 tiết (Tích hợp GDĐP, AI 3.C5.2, 3.D2.2, GDQP-AN, ATGT, NLS, STEM làm nhạc cụ gõ)',
    },
    {
      subject: 'Giáo dục thể chất',
      totalPeriods: 70,
      detail:
        '35 tuần (2 tiết/tuần, 4 chủ đề: Đội hình đội ngũ [16 tiết], Bài tập thể dục [8 tiết], Tư thế và kỹ năng vận động cơ bản [26 tiết], Môn thể thao tự chọn – Bóng rổ [20 tiết]): HKI 18 tuần = 36 tiết; HKII 17 tuần = 34 tiết (Tích hợp AI 3.C5.1, 3.C5.2, 3.A2.2, NLS 1.2.CB1a, 1.1.CB1a, 5.4.CB1a, 4.1.CB1a, GDQP-AN, ATGT, BVMT, KNS)',
    },
    {
      subject: 'Hoạt động trải nghiệm',
      totalPeriods: 105,
      detail:
        '35 tuần (3 tiết/tuần: Sinh hoạt dưới cờ, HĐGD theo chủ đề, Sinh hoạt lớp; 9 chủ đề, Bài 1–35): HKI 54 tiết; HKII 51 tiết (Tích hợp AI, NLS, GDĐP, QPAN, ATGT, BVMT, QCN)',
    },
    {
      subject: 'Công nghệ',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần; Phần 1: Công nghệ và đời sống [Bài 1–6], Phần 2: Thủ công kĩ thuật [Bài 7–10] + Ôn tập/Kiểm tra HKI & HKII): HKI 18 tiết/18 tuần; HKII 17 tiết/17 tuần (Tích hợp NLS, AI 3.C5.1, 3.B2.1, 3.A1.1, 3.A1.3, Bài học STEM Bài 5 & Bài 9)',
    },
    {
      subject: 'Tin học',
      totalPeriods: 35,
      detail:
        '35 tuần (1 tiết/tuần; 6 chủ đề, Bài 1–16 + Ôn tập/Kiểm tra cuối HKI & HKII): HKI 18 tiết/18 tuần; HKII 17 tiết/17 tuần (Tích hợp NLS, AI 3.B2.1, 3.A1.1, 3.A3.1, 3.C4.1, 3.B3.1, 3.D1.1, 3.C5.1, 3.A1.2 và Bài học STEM ở Bài 5 & Bài 11)',
    },
  ],
  sourceDocument: NDA_G3_SOURCE_DOC,
};

export const GRADE3_CURRICULUM_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE3_TIENG_VIET_TOPICS,
  ...GRADE3_TOAN_TOPICS,
  ...GRADE3_TIENG_ANH_TOPICS,
  ...GRADE3_TNXH_TOPICS,
  ...GRADE3_DAO_DUC_TOPICS,
  ...GRADE3_MY_THUAT_TOPICS,
  ...GRADE3_AM_NHAC_TOPICS,
  ...GRADE3_GDTC_TOPICS,
  ...GRADE3_HDTN_TOPICS,
  ...GRADE3_CONG_NGHE_TOPICS,
  ...GRADE3_TIN_HOC_TOPICS,
];

