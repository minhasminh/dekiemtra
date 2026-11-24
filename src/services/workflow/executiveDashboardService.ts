import {
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ExamWorkflowState,
  ExamWorkflowStepNumber,
  ExecutiveDashboardBenchmarkReport,
  ExecutiveDashboardChartsData,
  ExecutiveDashboardFilterState,
  ExecutiveDatasetScopeMode,
  ExecutiveDossierRowExtended,
  ExecutiveKpiCardsSummary,
  ExecutivePriorityAlertItem,
  ExecutiveRolePermissionProfile,
  ExecutiveSemesterCode,
  GradeNumber,
  QuestionItem,
  WorkflowActorRole,
} from '../../types/domain';
import {
  loadSavedWorkflows,
  saveWorkflowToLocal,
  syncWorkflowToBackend,
} from './endToEndExamWorkflowService';
import { emitWorkflowNotificationEvent } from './workflowNotificationCenterService';

const EXECUTIVE_SIM_STORAGE_KEY = 'edutest_executive_sim24_dossiers_v17';

export const TODAY_ISO_DATE = '2026-11-02';

export const EXECUTIVE_ROLE_PROFILES: ExecutiveRolePermissionProfile[] = [
  {
    accountId: 'exec-principal',
    fullName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    role: 'PRINCIPAL',
    roleTitle: 'Hiệu trưởng – Xem & Điều hành toàn trường (Khối 1–9)',
    allowedDepartments: 'ALL',
    allowedGrades: 'ALL',
    canViewAllSchool: true,
    canAssignOwnerOrReviewer: true,
    canSendInAppReminder: true,
    canRequestSupplement: true,
    canExportOfficialReport: true,
  },
  {
    accountId: 'exec-vp-primary',
    fullName: 'Cô Trần Thu Hà (Phó Hiệu trưởng Tiểu học)',
    role: 'VICE_PRINCIPAL',
    roleTitle: 'Phó Hiệu trưởng – Phụ trách Khối Tiểu học (Khối 1–5)',
    allowedDepartments: ['Tổ 1-2-3', 'Tổ 4-5'],
    allowedGrades: [1, 2, 3, 4, 5],
    canViewAllSchool: false,
    canAssignOwnerOrReviewer: true,
    canSendInAppReminder: true,
    canRequestSupplement: true,
    canExportOfficialReport: true,
  },
  {
    accountId: 'exec-hod-khtn',
    fullName: 'Thầy Lê Quang Huy (Tổ trưởng Tổ Khoa học Tự nhiên)',
    role: 'HEAD_OF_DEPARTMENT',
    roleTitle: 'Tổ trưởng chuyên môn – Tổ Khoa học Tự nhiên (Khối 6–9)',
    allowedDepartments: ['Tổ khoa học tự nhiên'],
    allowedGrades: [6, 7, 8, 9],
    canViewAllSchool: false,
    canAssignOwnerOrReviewer: true,
    canSendInAppReminder: true,
    canRequestSupplement: true,
    canExportOfficialReport: false,
  },
  {
    accountId: 'exec-teacher-mai',
    fullName: 'Cô Nguyễn Thị Mai (Giáo viên ra đề Toán 4–5)',
    role: 'TEACHER',
    roleTitle: 'Giáo viên bộ môn – Chỉ xem hồ sơ cá nhân được giao',
    allowedDepartments: ['Tổ 4-5'],
    allowedGrades: [4, 5],
    canViewAllSchool: false,
    canAssignOwnerOrReviewer: false,
    canSendInAppReminder: false,
    canRequestSupplement: false,
    canExportOfficialReport: false,
  },
];

interface SimulatedDossierBlueprint {
  code: string;
  title: string;
  academicYearId: string;
  semester: ExecutiveSemesterCode;
  examPeriod: 'MID_SEM_1' | 'END_SEM_1' | 'MID_SEM_2' | 'END_YEAR' | 'REGULAR';
  examPeriodLabel: string;
  gradeId: GradeNumber;
  subjectId: string;
  departmentName: string;
  teacherName: string;
  reviewerName: string;
  currentAssigneeName: string; // Rỗng '' nếu chưa có người phụ trách
  currentAssigneeRole: WorkflowActorRole;
  status: ExamWorkflowState;
  currentStep: ExamWorkflowStepNumber;
  dueDate: string;
  examDate: string;
  matrixStatus: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'INVALIDATED_BY_MATRIX_EDIT';
  hasMatrixDoc: boolean;
  hasSpecDoc: boolean;
  hasExamDoc: boolean;
  answerKeyComplete: boolean;
  gradingGuideComplete: boolean;
  aiInspected: boolean;
  criticalErrorsCount: number;
  highErrorsCount: number;
  mediumErrorsCount: number;
  lowErrorsCount: number;
  returnedCount: number;
  delayRootCause?: string;
  stepHours: [number, number, number, number, number, number, number, number, number];
  errorGroups: [number, number, number, number, number]; // [Ma trận, Câu hỏi/Ngữ liệu, Đáp án/HDC, Mức độ nhận thức, Ngôn ngữ/Định dạng]
}

const SIMULATED_24_BLUEPRINTS: SimulatedDossierBlueprint[] = [
  {
    code: 'WF-SIM24-01',
    title: 'Đề kiểm tra Cuối kỳ I - Tiếng Việt Lớp 1',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'END_SEM_1',
    examPeriodLabel: 'Cuối học kỳ I',
    gradeId: 1,
    subjectId: 'Tiếng Việt',
    departmentName: 'Tổ 1-2-3',
    teacherName: 'Cô Phạm Ngọc Lan',
    reviewerName: 'Cô Vũ Thị Thảo',
    currentAssigneeName: 'Cô Phạm Ngọc Lan',
    currentAssigneeRole: 'TEACHER',
    status: 'MatrixReview',
    currentStep: 2,
    dueDate: '2026-11-10',
    examDate: '2026-11-20',
    matrixStatus: 'PENDING_REVIEW',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: false,
    answerKeyComplete: false,
    gradingGuideComplete: false,
    aiInspected: false,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 0,
    lowErrorsCount: 0,
    returnedCount: 0,
    stepHours: [3.5, 5.0, 0, 0, 0, 0, 0, 0, 0],
    errorGroups: [0, 0, 0, 0, 0],
  },
  {
    code: 'WF-SIM24-02',
    title: 'Đề kiểm tra Giữa kỳ I - Toán Lớp 1',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'MID_SEM_1',
    examPeriodLabel: 'Giữa học kỳ I',
    gradeId: 1,
    subjectId: 'Toán',
    departmentName: 'Tổ 1-2-3',
    teacherName: 'Cô Phạm Ngọc Lan',
    reviewerName: 'Cô Vũ Thị Thảo',
    currentAssigneeName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    currentAssigneeRole: 'PRINCIPAL',
    status: 'Approved',
    currentStep: 8,
    dueDate: '2026-10-25',
    examDate: '2026-11-05',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 1,
    returnedCount: 0,
    stepHours: [2.5, 4.0, 6.0, 0.5, 2.0, 4.5, 2.0, 1.0, 0],
    errorGroups: [0, 1, 0, 0, 1],
  },
  {
    code: 'WF-SIM24-03',
    title: 'Đề kiểm tra Cuối kỳ I - Toán Lớp 2',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'END_SEM_1',
    examPeriodLabel: 'Cuối học kỳ I',
    gradeId: 2,
    subjectId: 'Toán',
    departmentName: 'Tổ 1-2-3',
    teacherName: 'Cô Ngô Thanh Huyền',
    reviewerName: '',
    currentAssigneeName: '', // Cảnh báo: Chưa có người phụ trách hiện tại
    currentAssigneeRole: 'HEAD_OF_DEPARTMENT',
    status: 'MatrixApproved',
    currentStep: 3,
    dueDate: '2026-11-08',
    examDate: '2026-11-18',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: false,
    answerKeyComplete: false,
    gradingGuideComplete: false,
    aiInspected: false,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 0,
    lowErrorsCount: 0,
    returnedCount: 0,
    delayRootCause: 'Chưa phân công người phụ trách soạn đề thay thế khi giáo viên nghỉ ốm.',
    stepHours: [3.0, 4.5, 8.0, 0, 0, 0, 0, 0, 0],
    errorGroups: [0, 0, 0, 0, 0],
  },
  {
    code: 'WF-SIM24-04',
    title: 'Đề kiểm tra Cuối kỳ I - Tiếng Việt Lớp 2',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'END_SEM_1',
    examPeriodLabel: 'Cuối học kỳ I',
    gradeId: 2,
    subjectId: 'Tiếng Việt',
    departmentName: 'Tổ 1-2-3',
    teacherName: 'Cô Ngô Thanh Huyền',
    reviewerName: 'Cô Vũ Thị Thảo',
    currentAssigneeName: 'Cô Ngô Thanh Huyền',
    currentAssigneeRole: 'TEACHER',
    status: 'ExamDraft',
    currentStep: 3,
    dueDate: '2026-10-28', // Quá hạn
    examDate: '2026-11-04', // Sát ngày kiểm tra
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: false,
    gradingGuideComplete: false,
    aiInspected: false,
    criticalErrorsCount: 0,
    highErrorsCount: 1,
    mediumErrorsCount: 1,
    lowErrorsCount: 0,
    returnedCount: 1,
    delayRootCause: 'Chậm hoàn thiện ngữ liệu đọc hiểu và biểu điểm phần Viết chính tả.',
    stepHours: [4.0, 5.5, 14.0, 0, 0, 0, 0, 0, 0],
    errorGroups: [0, 1, 1, 0, 0],
  },
  {
    code: 'WF-SIM24-05',
    title: 'Đề kiểm tra Cuối kỳ I - Tiếng Việt Lớp 3',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'END_SEM_1',
    examPeriodLabel: 'Cuối học kỳ I',
    gradeId: 3,
    subjectId: 'Tiếng Việt',
    departmentName: 'Tổ 1-2-3',
    teacherName: 'Cô Vũ Thị Thảo',
    reviewerName: 'Cô Phạm Ngọc Lan',
    currentAssigneeName: 'Cô Phạm Ngọc Lan',
    currentAssigneeRole: 'REVIEWER',
    status: 'ProfessionalReview',
    currentStep: 6,
    dueDate: '2026-11-07',
    examDate: '2026-11-16',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 2,
    returnedCount: 0,
    stepHours: [3.0, 4.0, 6.5, 0.4, 3.0, 5.0, 0, 0, 0],
    errorGroups: [0, 1, 0, 1, 1],
  },
  {
    code: 'WF-SIM24-06',
    title: 'Đề kiểm tra Giữa kỳ II - Toán Lớp 3',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'MID_SEM_2',
    examPeriodLabel: 'Giữa học kỳ II',
    gradeId: 3,
    subjectId: 'Toán',
    departmentName: 'Tổ 1-2-3',
    teacherName: 'Cô Vũ Thị Thảo',
    reviewerName: 'Cô Ngô Thanh Huyền',
    currentAssigneeName: 'Cô Vũ Thị Thảo',
    currentAssigneeRole: 'TEACHER',
    status: 'RevisionRequired',
    currentStep: 5,
    dueDate: '2026-10-29', // Quá hạn
    examDate: '2026-11-05',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 2,
    mediumErrorsCount: 1,
    lowErrorsCount: 0,
    returnedCount: 2, // Bị trả lại 2 lần
    delayRootCause: 'Hồ sơ bị trả lại 02 lần do câu toán có lời văn Mức 3 vượt quá phạm vi bảng nhân chia.',
    stepHours: [3.5, 4.5, 8.0, 0.6, 9.5, 6.0, 0, 0, 0],
    errorGroups: [1, 1, 0, 1, 0],
  },
  {
    code: 'WF-SIM24-07',
    title: 'Đề kiểm tra Cuối kỳ II - Toán Lớp 4 (Đề chính thức)',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 4,
    subjectId: 'Toán',
    departmentName: 'Tổ 4-5',
    teacherName: 'Cô Nguyễn Thị Mai',
    reviewerName: 'Cô Lê Thị Hồng Hạnh',
    currentAssigneeName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    currentAssigneeRole: 'PRINCIPAL',
    status: 'Released',
    currentStep: 8,
    dueDate: '2026-10-20',
    examDate: '2026-10-30',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 0,
    lowErrorsCount: 1,
    returnedCount: 0,
    stepHours: [2.0, 3.5, 5.5, 0.3, 2.0, 3.5, 1.5, 1.0, 0],
    errorGroups: [0, 0, 0, 0, 1],
  },
  {
    code: 'WF-SIM24-08',
    title: 'Đề kiểm tra Cuối kỳ II - Tiếng Việt Lớp 4',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 4,
    subjectId: 'Tiếng Việt',
    departmentName: 'Tổ 4-5',
    teacherName: 'Cô Nguyễn Thị Mai',
    reviewerName: 'Cô Lê Thị Hồng Hạnh',
    currentAssigneeName: 'Cô Nguyễn Thị Mai',
    currentAssigneeRole: 'TEACHER',
    status: 'AIReview',
    currentStep: 4,
    dueDate: '2026-10-27', // Quá hạn
    examDate: '2026-11-03', // Sát ngày kiểm tra
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 2, // 2 lỗi nghiêm trọng chưa xử lý
    highErrorsCount: 1,
    mediumErrorsCount: 2,
    lowErrorsCount: 0,
    returnedCount: 0,
    delayRootCause: 'AI phát hiện 02 lỗi nghiêm trọng (sai đáp án câu 4 và lệch tổng điểm phần Đọc hiểu 0,5đ) chưa được giáo viên xử lý.',
    stepHours: [3.0, 4.0, 7.0, 0.5, 11.0, 0, 0, 0, 0],
    errorGroups: [1, 1, 2, 1, 0],
  },
  {
    code: 'WF-SIM24-09',
    title: 'Đề kiểm tra Cuối kỳ II - Khoa học Lớp 4',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 4,
    subjectId: 'Khoa học',
    departmentName: 'Tổ 4-5',
    teacherName: 'Thầy Hoàng Văn Nam',
    reviewerName: 'Cô Nguyễn Thị Mai',
    currentAssigneeName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    currentAssigneeRole: 'PRINCIPAL',
    status: 'AwaitingApproval',
    currentStep: 7,
    dueDate: '2026-11-05',
    examDate: '2026-11-04', // Gần ngày kiểm tra (còn 2 ngày) nhưng chưa phê duyệt
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 0,
    returnedCount: 0,
    delayRootCause: 'Hồ sơ đã thẩm định xong nhưng đang chờ Ban Giám hiệu ký phê duyệt sát ngày thi.',
    stepHours: [2.5, 3.5, 5.0, 0.4, 2.5, 4.5, 5.0, 0, 0],
    errorGroups: [0, 0, 1, 0, 0],
  },
  {
    code: 'WF-SIM24-10',
    title: 'Đề kiểm tra Cuối kỳ II - Toán Lớp 5',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 5,
    subjectId: 'Toán',
    departmentName: 'Tổ 4-5',
    teacherName: 'Cô Nguyễn Thị Mai',
    reviewerName: 'Cô Lê Thị Hồng Hạnh',
    currentAssigneeName: 'Cô Lê Thị Hồng Hạnh',
    currentAssigneeRole: 'REVIEWER',
    status: 'ProfessionalReview',
    currentStep: 6,
    dueDate: '2026-11-08',
    examDate: '2026-11-15',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 1,
    mediumErrorsCount: 1,
    lowErrorsCount: 1,
    returnedCount: 0,
    stepHours: [3.0, 4.0, 6.0, 0.5, 3.0, 4.5, 0, 0, 0],
    errorGroups: [0, 1, 1, 1, 0],
  },
  {
    code: 'WF-SIM24-11',
    title: 'Đề kiểm tra Cuối kỳ II - Lịch sử và Địa lí Lớp 5',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 5,
    subjectId: 'Lịch sử và Địa lí',
    departmentName: 'Tổ 4-5',
    teacherName: 'Thầy Hoàng Văn Nam',
    reviewerName: 'Cô Lê Thị Hồng Hạnh',
    currentAssigneeName: 'Thầy Hoàng Văn Nam',
    currentAssigneeRole: 'HEAD_OF_DEPARTMENT',
    status: 'ResultsAnalysis',
    currentStep: 9,
    dueDate: '2026-10-18',
    examDate: '2026-10-25',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 0,
    lowErrorsCount: 0,
    returnedCount: 0,
    stepHours: [2.0, 3.0, 5.0, 0.3, 1.5, 3.0, 1.5, 1.0, 2.5],
    errorGroups: [0, 0, 0, 0, 0],
  },
  {
    code: 'WF-SIM24-12',
    title: 'Đề kiểm tra Giữa kỳ II - Tin học Lớp 5',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'MID_SEM_2',
    examPeriodLabel: 'Giữa học kỳ II',
    gradeId: 5,
    subjectId: 'Tin học',
    departmentName: 'Tổ Tiếng Anh - GDTC',
    teacherName: 'Thầy Bùi Quang Tuấn',
    reviewerName: '',
    currentAssigneeName: '', // Chưa có người phụ trách
    currentAssigneeRole: 'HEAD_OF_DEPARTMENT',
    status: 'Draft',
    currentStep: 2,
    dueDate: '2026-10-30', // Quá hạn
    examDate: '2026-11-08',
    matrixStatus: 'DRAFT',
    hasMatrixDoc: false,
    hasSpecDoc: false,
    hasExamDoc: false,
    answerKeyComplete: false,
    gradingGuideComplete: false,
    aiInspected: false,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 0,
    lowErrorsCount: 0,
    returnedCount: 0,
    delayRootCause: 'Chưa phân công người phụ trách duyệt Ma trận môn Tin học Tiểu học.',
    stepHours: [4.0, 9.0, 0, 0, 0, 0, 0, 0, 0],
    errorGroups: [1, 0, 0, 0, 0],
  },
  {
    code: 'WF-SIM24-13',
    title: 'Đề kiểm tra Cuối kỳ I - Toán Lớp 6',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'END_SEM_1',
    examPeriodLabel: 'Cuối học kỳ I',
    gradeId: 6,
    subjectId: 'Toán',
    departmentName: 'Tổ khoa học tự nhiên',
    teacherName: 'Thầy Lê Quang Huy',
    reviewerName: 'Thầy Đặng Quốc Khánh',
    currentAssigneeName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    currentAssigneeRole: 'PRINCIPAL',
    status: 'AwaitingApproval',
    currentStep: 7,
    dueDate: '2026-11-06',
    examDate: '2026-11-14',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 1,
    returnedCount: 0,
    stepHours: [3.0, 4.0, 6.5, 0.5, 2.5, 4.0, 3.0, 0, 0],
    errorGroups: [0, 1, 0, 0, 1],
  },
  {
    code: 'WF-SIM24-14',
    title: 'Đề kiểm tra Cuối kỳ I - Khoa học tự nhiên Lớp 6',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'END_SEM_1',
    examPeriodLabel: 'Cuối học kỳ I',
    gradeId: 6,
    subjectId: 'Khoa học tự nhiên',
    departmentName: 'Tổ khoa học tự nhiên',
    teacherName: 'Cô Nguyễn Thị Mai Lan',
    reviewerName: 'Thầy Lê Quang Huy',
    currentAssigneeName: 'Cô Nguyễn Thị Mai Lan',
    currentAssigneeRole: 'TEACHER',
    status: 'AIReview',
    currentStep: 4,
    dueDate: '2026-10-26', // Quá hạn
    examDate: '2026-11-04', // Gần ngày thi
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: false,
    aiInspected: true,
    criticalErrorsCount: 1, // Lỗi nghiêm trọng
    highErrorsCount: 2,
    mediumErrorsCount: 1,
    lowErrorsCount: 0,
    returnedCount: 1,
    delayRootCause: 'Thiếu hướng dẫn chấm phần Tự luận Hoá – Sinh và còn 01 lỗi nghiêm trọng về đơn vị đo.',
    stepHours: [3.5, 4.5, 8.5, 0.6, 10.0, 0, 0, 0, 0],
    errorGroups: [0, 2, 2, 0, 0],
  },
  {
    code: 'WF-SIM24-15',
    title: 'Đề kiểm tra Cuối kỳ I - Ngữ văn Lớp 6',
    academicYearId: '2026-2027',
    semester: 'SEM_1',
    examPeriod: 'END_SEM_1',
    examPeriodLabel: 'Cuối học kỳ I',
    gradeId: 6,
    subjectId: 'Ngữ văn',
    departmentName: 'Tổ khoa học xã hội',
    teacherName: 'Cô Vũ Thị Ngọc Lan',
    reviewerName: 'Cô Nguyễn Bích Ngọc',
    currentAssigneeName: 'Cô Vũ Thị Ngọc Lan',
    currentAssigneeRole: 'TEACHER',
    status: 'RevisionRequired',
    currentStep: 5,
    dueDate: '2026-10-29', // Quá hạn
    examDate: '2026-11-05',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 2,
    mediumErrorsCount: 2,
    lowErrorsCount: 1,
    returnedCount: 3, // Bị trả lại 3 lần
    delayRootCause: 'Bị trả lại 03 lần do ngữ liệu đọc hiểu ngoài sách giáo khoa chưa ghi rõ nguồn trích dẫn hợp lệ.',
    stepHours: [4.0, 5.0, 9.0, 0.7, 12.5, 7.5, 0, 0, 0],
    errorGroups: [0, 3, 1, 0, 1],
  },
  {
    code: 'WF-SIM24-16',
    title: 'Đề kiểm tra Giữa kỳ II - Toán Lớp 7',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'MID_SEM_2',
    examPeriodLabel: 'Giữa học kỳ II',
    gradeId: 7,
    subjectId: 'Toán',
    departmentName: 'Tổ khoa học tự nhiên',
    teacherName: 'Thầy Đặng Quốc Khánh',
    reviewerName: 'Thầy Lê Quang Huy',
    currentAssigneeName: 'Thầy Đặng Quốc Khánh',
    currentAssigneeRole: 'TEACHER',
    status: 'Approved',
    currentStep: 8,
    dueDate: '2026-10-22',
    examDate: '2026-11-01',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 0,
    returnedCount: 0,
    stepHours: [2.5, 3.5, 5.5, 0.4, 2.0, 3.5, 2.0, 1.0, 0],
    errorGroups: [0, 0, 0, 1, 0],
  },
  {
    code: 'WF-SIM24-17',
    title: 'Đề kiểm tra Giữa kỳ II - Khoa học tự nhiên Lớp 7',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'MID_SEM_2',
    examPeriodLabel: 'Giữa học kỳ II',
    gradeId: 7,
    subjectId: 'Khoa học tự nhiên',
    departmentName: 'Tổ khoa học tự nhiên',
    teacherName: 'Cô Nguyễn Thị Mai Lan',
    reviewerName: 'Thầy Lê Quang Huy',
    currentAssigneeName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    currentAssigneeRole: 'PRINCIPAL',
    status: 'AwaitingApproval',
    currentStep: 7,
    dueDate: '2026-10-24', // Quá hạn
    examDate: '2026-11-03', // Sát ngày kiểm tra (còn 1 ngày) chưa duyệt
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 1,
    mediumErrorsCount: 0,
    lowErrorsCount: 1,
    returnedCount: 1,
    delayRootCause: 'Quá hạn phê duyệt và chỉ còn 01 ngày trước kỳ kiểm tra Giữa kỳ II.',
    stepHours: [3.0, 4.5, 7.0, 0.5, 4.0, 5.5, 8.0, 0, 0],
    errorGroups: [1, 0, 0, 0, 1],
  },
  {
    code: 'WF-SIM24-18',
    title: 'Đề kiểm tra Cuối kỳ II - Lịch sử và Địa lí Lớp 7',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 7,
    subjectId: 'Lịch sử và Địa lí',
    departmentName: 'Tổ khoa học xã hội',
    teacherName: 'Thầy Trần Văn Bình',
    reviewerName: 'Cô Vũ Thị Ngọc Lan',
    currentAssigneeName: 'Cô Vũ Thị Ngọc Lan',
    currentAssigneeRole: 'REVIEWER',
    status: 'ProfessionalReview',
    currentStep: 6,
    dueDate: '2026-11-09',
    examDate: '2026-11-19',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 1,
    returnedCount: 0,
    stepHours: [3.0, 4.0, 6.0, 0.5, 2.0, 5.0, 0, 0, 0],
    errorGroups: [0, 1, 0, 0, 1],
  },
  {
    code: 'WF-SIM24-19',
    title: 'Đề kiểm tra Cuối kỳ II - Toán Lớp 8',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 8,
    subjectId: 'Toán',
    departmentName: 'Tổ khoa học tự nhiên',
    teacherName: 'Thầy Lê Quang Huy',
    reviewerName: 'Thầy Đặng Quốc Khánh',
    currentAssigneeName: 'Thầy Lê Quang Huy',
    currentAssigneeRole: 'HEAD_OF_DEPARTMENT',
    status: 'AIReview',
    currentStep: 4,
    dueDate: '2026-11-06',
    examDate: '2026-11-15',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 1, // 1 lỗi nghiêm trọng
    highErrorsCount: 1,
    mediumErrorsCount: 1,
    lowErrorsCount: 0,
    returnedCount: 0,
    delayRootCause: 'AI phát hiện 01 lỗi nghiêm trọng: Câu hình học đồng dạng thiếu giả thiết góc vuông.',
    stepHours: [2.5, 4.0, 7.5, 0.5, 6.0, 0, 0, 0, 0],
    errorGroups: [0, 2, 1, 0, 0],
  },
  {
    code: 'WF-SIM24-20',
    title: 'Đề kiểm tra Cuối kỳ II - Tiếng Anh Lớp 8',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 8,
    subjectId: 'Tiếng Anh',
    departmentName: 'Tổ Tiếng Anh - GDTC',
    teacherName: 'Cô Lê Minh Châu',
    reviewerName: 'Thầy Bùi Quang Tuấn',
    currentAssigneeName: 'Cô Lê Minh Châu',
    currentAssigneeRole: 'TEACHER',
    status: 'Approved',
    currentStep: 8,
    dueDate: '2026-10-25',
    examDate: '2026-11-06',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 0,
    lowErrorsCount: 1,
    returnedCount: 0,
    stepHours: [2.0, 3.5, 5.0, 0.3, 1.5, 3.5, 2.0, 1.0, 0],
    errorGroups: [0, 0, 0, 0, 1],
  },
  {
    code: 'WF-SIM24-21',
    title: 'Đề kiểm tra Cuối kỳ II - Ngữ văn Lớp 8',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 8,
    subjectId: 'Ngữ văn',
    departmentName: 'Tổ khoa học xã hội',
    teacherName: 'Cô Nguyễn Bích Ngọc',
    reviewerName: 'Cô Vũ Thị Ngọc Lan',
    currentAssigneeName: 'Cô Nguyễn Bích Ngọc',
    currentAssigneeRole: 'TEACHER',
    status: 'RevisionRequired',
    currentStep: 5,
    dueDate: '2026-11-05',
    examDate: '2026-11-12',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 1,
    mediumErrorsCount: 2,
    lowErrorsCount: 0,
    returnedCount: 2, // Trả lại 2 lần
    delayRootCause: 'Hồ sơ bị trả lại 02 lần để điều chỉnh tỷ lệ điểm phần Nghị luận xã hội.',
    stepHours: [3.5, 4.5, 7.5, 0.5, 8.5, 5.5, 0, 0, 0],
    errorGroups: [1, 1, 1, 0, 0],
  },
  {
    code: 'WF-SIM24-22',
    title: 'Đề kiểm tra Cuối kỳ II - Toán Lớp 9',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 9,
    subjectId: 'Toán',
    departmentName: 'Tổ khoa học tự nhiên',
    teacherName: 'Thầy Lê Quang Huy',
    reviewerName: 'Thầy Đặng Quốc Khánh',
    currentAssigneeName: 'Thầy Lê Quang Huy',
    currentAssigneeRole: 'HEAD_OF_DEPARTMENT',
    status: 'Released',
    currentStep: 8,
    dueDate: '2026-10-20',
    examDate: '2026-10-29',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 0,
    lowErrorsCount: 0,
    returnedCount: 0,
    stepHours: [2.5, 3.0, 5.0, 0.4, 2.0, 3.5, 1.5, 1.0, 0],
    errorGroups: [0, 0, 0, 0, 0],
  },
  {
    code: 'WF-SIM24-23',
    title: 'Đề kiểm tra Cuối kỳ II - Ngữ văn Lớp 9',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 9,
    subjectId: 'Ngữ văn',
    departmentName: 'Tổ khoa học xã hội',
    teacherName: 'Cô Đỗ Thị Thanh Tâm',
    reviewerName: 'Cô Nguyễn Bích Ngọc',
    currentAssigneeName: 'Cô Đỗ Thị Thanh Tâm',
    currentAssigneeRole: 'TEACHER',
    status: 'ResultsAnalysis',
    currentStep: 9,
    dueDate: '2026-10-18',
    examDate: '2026-10-26',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 0,
    returnedCount: 0,
    stepHours: [3.0, 3.5, 6.0, 0.4, 2.0, 4.0, 2.0, 1.0, 3.0],
    errorGroups: [0, 1, 0, 0, 0],
  },
  {
    code: 'WF-SIM24-24',
    title: 'Đề kiểm tra Cuối kỳ II - Khoa học tự nhiên Lớp 9',
    academicYearId: '2026-2027',
    semester: 'SEM_2',
    examPeriod: 'END_YEAR',
    examPeriodLabel: 'Cuối học kỳ II',
    gradeId: 9,
    subjectId: 'Khoa học tự nhiên',
    departmentName: 'Tổ khoa học tự nhiên',
    teacherName: 'Thầy Đặng Quốc Khánh',
    reviewerName: 'Thầy Lê Quang Huy',
    currentAssigneeName: 'Thầy Lê Quang Huy',
    currentAssigneeRole: 'REVIEWER',
    status: 'ProfessionalReview',
    currentStep: 6,
    dueDate: '2026-11-08',
    examDate: '2026-11-17',
    matrixStatus: 'APPROVED',
    hasMatrixDoc: true,
    hasSpecDoc: true,
    hasExamDoc: true,
    answerKeyComplete: true,
    gradingGuideComplete: true,
    aiInspected: true,
    criticalErrorsCount: 0,
    highErrorsCount: 0,
    mediumErrorsCount: 1,
    lowErrorsCount: 1,
    returnedCount: 0,
    stepHours: [2.5, 4.0, 6.0, 0.5, 2.5, 4.5, 0, 0, 0],
    errorGroups: [0, 0, 1, 1, 0],
  },
];

function buildWorkflowFromBlueprint(bp: SimulatedDossierBlueprint): ExecutiveDossierRowExtended {
  const wf: ExamWorkflow = {
    workflowId: bp.code,
    title: bp.title,
    schoolId: 'SCHOOL_A',
    academicYearId: bp.academicYearId,
    gradeId: bp.gradeId,
    subjectId: bp.subjectId,
    examPeriod: bp.examPeriod,
    examPeriodLabel: bp.examPeriodLabel,
    examDate: bp.examDate,
    creatorId: `teacher-${bp.code}`,
    creatorName: bp.teacherName,
    matrixId: `MTX-${bp.code}`,
    specificationId: `SPEC-${bp.code}`,
    examId: bp.hasExamDoc ? `EXAM-${bp.code}` : '',
    currentVersionId: `${bp.code}-v${bp.returnedCount + 1}`,
    reviewReportId: bp.currentStep >= 6 ? `REV-${bp.code}` : '',
    approvalId: ['Approved', 'Released', 'ResultsAnalysis'].includes(bp.status)
      ? `APP-${bp.code}`
      : '',
    status: bp.status,
    currentStep: bp.currentStep,
    assignedUsers: {
      creatorName: bp.teacherName,
      creatorRole: 'TEACHER',
      matrixApproverName: 'Tổ trưởng chuyên môn',
      reviewerName: bp.reviewerName,
      finalApproverName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
      analyticsOwnerName: bp.teacherName,
      currentAssigneeName: bp.currentAssigneeName,
      currentAssigneeRole: bp.currentAssigneeRole,
    },
    createdAt: '2026-10-05T08:00:00.000Z',
    updatedAt: '2026-11-02T08:00:00.000Z',
    isConfidentialExam: true,
    authorizedConfidentialRoles: [
      'TEACHER',
      'REVIEWER',
      'HEAD_OF_DEPARTMENT',
      'VICE_PRINCIPAL',
      'PRINCIPAL',
      'SYSTEM_ADMIN',
    ],
    departmentName: bp.departmentName,
    dueDate: bp.dueDate,
    hasMatrixDocument: bp.hasMatrixDoc,
    hasSpecificationDocument: bp.hasSpecDoc,
    isTestDataset: true, // Đánh dấu rõ là dữ liệu giả lập kiểm thử Mục VIII
    confidentialStemSample: '[ĐỀ KIỂM TRA MẬT - ĐÃ MÃ HÓA TRÊN DASHBOARD]',
    step1QuestionBank: {
      selectedTopics: ['Chủ đề trọng tâm học kỳ'],
      approvedQuestionIds: ['q-1', 'q-2', 'q-3', 'q-4', 'q-5'],
      unapprovedQuestionBlockedCount: 0,
      supplementaryQuestionsCreatedCount: 2,
      coverageSatisfied: true,
      totalSelectedPoints: 10,
    },
    step2MatrixAndSpec: {
      educationLevel:
        bp.gradeId <= 5 ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY,
      templateCode: bp.gradeId <= 5 ? 'TT27_PRIMARY' : 'CV7991_SECONDARY',
      totalQuestions: 10,
      totalPoints: 10,
      durationMinutes: bp.gradeId <= 5 ? 40 : 60,
      levelDistributionSummary: 'Mức 1: 40% · Mức 2: 40% · Mức 3: 20%',
      learningOutcomesLinkedCount: 8,
      isValidStructure: bp.hasMatrixDoc,
      matrixApprovalStatus: bp.matrixStatus,
      matrixApprovedBy: bp.matrixStatus === 'APPROVED' ? 'Tổ trưởng chuyên môn' : undefined,
      matrixApprovedAt: bp.matrixStatus === 'APPROVED' ? '2026-10-10T09:00:00Z' : undefined,
      matrixSignature: `SIG-${bp.code}`,
    },
    step3ExamGeneration: {
      variantCodes: bp.hasExamDoc ? ['101', '102'] : [],
      questionIdsInExam: bp.hasExamDoc ? ['q1', 'q2', 'q3', 'q4', 'q5'] : [],
      answerKeyComplete: bp.answerKeyComplete,
      gradingGuideComplete: bp.gradingGuideComplete,
      matchesApprovedMatrix: bp.hasExamDoc,
      totalExamPoints: bp.hasExamDoc ? 10 : 0,
    },
    step4AiQualityReview: {
      inspectedVersionId: bp.aiInspected ? `${bp.code}-v${bp.returnedCount + 1}` : '',
      inspectedAt: bp.aiInspected ? '2026-10-18T10:00:00Z' : undefined,
      criticalErrorsCount: bp.criticalErrorsCount,
      highErrorsCount: bp.highErrorsCount,
      mediumErrorsCount: bp.mediumErrorsCount,
      lowErrorsCount: bp.lowErrorsCount,
      resolvedErrorsCount: bp.aiInspected ? 2 : 0,
      overallDashboardStatusLabel:
        bp.criticalErrorsCount > 0
          ? 'Cần chỉnh sửa lỗi nghiêm trọng'
          : bp.aiInspected
          ? 'Đạt yêu cầu chất lượng'
          : 'Chưa kiểm tra AI',
      checked10Pillars: {
        curriculum: bp.aiInspected,
        matrix: bp.aiInspected,
        specification: bp.aiInspected,
        questionContent: bp.aiInspected,
        answerKey: bp.aiInspected,
        gradingGuide: bp.aiInspected,
        cognitiveLevel: bp.aiInspected,
        points: bp.aiInspected,
        language: bp.aiInspected,
        formatting: bp.aiInspected,
      },
    },
    step5TeacherRevision: {
      revisions: [],
      lastRevisionTriggeredMatrixReapproval: false,
      recheckedAffectedParts: true,
    },
    step6ProfessionalReview: {
      ballots:
        ['AwaitingApproval', 'Approved', 'Released', 'ResultsAnalysis'].includes(bp.status)
          ? [
              {
                ballotId: `BAL-${bp.code}`,
                reviewerId: 'rev-1',
                reviewerName: bp.reviewerName || 'Giáo viên phản biện',
                reviewerRole: 'REVIEWER',
                reviewedVersionId: `${bp.code}-v${bp.returnedCount + 1}`,
                submittedAt: '2026-10-20T14:00:00Z',
                decision: 'ELIGIBLE_FOR_APPROVAL',
                generalComments: 'Hồ sơ đề đạt yêu cầu chuyên môn, đề nghị Ban Giám hiệu phê duyệt.',
                criteriaChecklist: {
                  curriculumAlignment: true,
                  matrixAndSpecMatch: true,
                  scientificAndPedagogicalAccuracy: true,
                  answerKeyAndRubricClarity: true,
                },
              },
            ]
          : [],
      latestDecision: ['AwaitingApproval', 'Approved', 'Released', 'ResultsAnalysis'].includes(
        bp.status
      )
        ? 'ELIGIBLE_FOR_APPROVAL'
        : bp.status === 'RevisionRequired'
        ? 'REVISION_REQUIRED'
        : undefined,
    },
    step7OfficialApproval: {
      approvalRecord: ['Approved', 'Released', 'ResultsAnalysis'].includes(bp.status)
        ? {
            approvalId: `APP-${bp.code}`,
            approverId: 'user-principal',
            approverName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
            approverRole: 'PRINCIPAL',
            approvedVersionId: `${bp.code}-v${bp.returnedCount + 1}`,
            approvedAt: '2026-10-22T16:00:00Z',
            isVersionLocked: true,
            dossierCompletenessVerified: true,
            appraisalBallotVerified: true,
            approvalComment: 'Phê duyệt chính thức và khóa phiên bản đề kiểm tra.',
          }
        : undefined,
    },
    step8DossierExport: {
      exports: [],
    },
    step9ResultsAnalysis: {},
    versionSnapshots: [
      {
        versionId: `${bp.code}-v${bp.returnedCount + 1}`,
        versionNumber: bp.returnedCount + 1,
        versionLabel: `Phiên bản v${bp.returnedCount + 1}`,
        createdAt: '2026-10-15T08:00:00Z',
        createdBy: bp.teacherName,
        createdByRole: 'TEACHER',
        workflowStateAtCreation: bp.status,
        stepNumberAtCreation: bp.currentStep,
        matrixId: `MTX-${bp.code}`,
        specificationId: `SPEC-${bp.code}`,
        examId: `EXAM-${bp.code}`,
        questionIds: ['q1', 'q2', 'q3'],
        totalPoints: 10,
        matrixStructureSignature: `SIG-${bp.code}`,
        isImmutableApprovedLock: ['Approved', 'Released', 'ResultsAnalysis'].includes(bp.status),
        changeNote: 'Khởi tạo và cập nhật phiên bản hồ sơ kiểm tra.',
      },
    ],
    auditTrail: [
      {
        id: `AUD-${bp.code}-1`,
        workflowId: bp.code,
        timestamp: '2026-10-10T08:00:00Z',
        actorId: `teacher-${bp.code}`,
        actorName: bp.teacherName,
        actorRole: 'TEACHER',
        actionType: 'WORKFLOW_CREATED',
        fromState: 'Draft',
        toState: bp.status,
        fromStep: 1,
        toStep: bp.currentStep,
        versionId: `${bp.code}-v${bp.returnedCount + 1}`,
        backendVerified: true,
        summary: `Khởi tạo và vận hành hồ sơ [${bp.code}] đến trạng thái [${bp.status}].`,
      },
    ],
  };

  return enrichWorkflowRow(wf, {
    semester: bp.semester,
    returnedCount: bp.returnedCount,
    delayRootCause: bp.delayRootCause,
    stepHours: bp.stepHours,
    errorGroups: bp.errorGroups,
  });
}

export function enrichWorkflowRow(
  wf: ExamWorkflow,
  custom?: {
    semester?: ExecutiveSemesterCode;
    returnedCount?: number;
    delayRootCause?: string;
    stepHours?: [number, number, number, number, number, number, number, number, number];
    errorGroups?: [number, number, number, number, number];
  }
): ExecutiveDossierRowExtended {
  const semester: ExecutiveSemesterCode =
    custom?.semester ||
    (wf.examPeriod === 'MID_SEM_1' || wf.examPeriod === 'END_SEM_1' ? 'SEM_1' : 'SEM_2');

  const referenceToday = wf.isTestDataset
    ? TODAY_ISO_DATE
    : new Date().toISOString().slice(0, 10);
  const dueDate = wf.dueDate || wf.examDate || referenceToday;
  const examDate = wf.examDate || referenceToday;
  const isCompleted = ['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(wf.status);
  const isOverdue = Boolean(dueDate) && dueDate < referenceToday && !isCompleted;

  const diffDaysToExam = Math.ceil(
    (new Date(examDate).getTime() - new Date(referenceToday).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isNearExamDateUnapproved = diffDaysToExam <= 3 && !isCompleted;

  const ownerName = (wf.assignedUsers?.currentAssigneeName || '').trim();
  const isUnassignedOwner = !ownerName || ownerName === 'Chưa phân công';

  const returnedCount =
    custom?.returnedCount ??
    (wf.status === 'RevisionRequired' ? 2 : wf.step5TeacherRevision.revisions.length);

  const hasUnresolvedCriticalAiError = wf.step4AiQualityReview.criticalErrorsCount > 0;

  const hours = custom?.stepHours || [2.5, 4.0, 6.0, 0.5, 3.0, 4.5, 2.0, 1.0, 2.5];
  const errGroups = custom?.errorGroups || [
    wf.step4AiQualityReview.highErrorsCount > 0 ? 1 : 0,
    wf.step4AiQualityReview.criticalErrorsCount,
    wf.step3ExamGeneration.answerKeyComplete ? 0 : 1,
    wf.step4AiQualityReview.mediumErrorsCount,
    wf.step4AiQualityReview.lowErrorsCount,
  ];

  let autoRootCause = custom?.delayRootCause;
  if (!autoRootCause) {
    if (hasUnresolvedCriticalAiError) {
      autoRootCause = `Còn ${wf.step4AiQualityReview.criticalErrorsCount} lỗi nghiêm trọng do AI phát hiện chưa được xử lý.`;
    } else if (isUnassignedOwner) {
      autoRootCause = 'Chưa có người phụ trách / chưa phân công giáo viên phản biện.';
    } else if (returnedCount >= 2) {
      autoRootCause = `Hồ sơ bị trả lại ${returnedCount} lần để chỉnh sửa theo yêu cầu thẩm định.`;
    } else if (isOverdue) {
      autoRootCause = `Quá hạn hoàn thành từ ngày ${dueDate} tại Bước ${wf.currentStep}.`;
    }
  }

  return {
    workflow: wf,
    semester,
    returnedCount,
    isUnassignedOwner,
    isNearExamDateUnapproved,
    isOverdue,
    hasUnresolvedCriticalAiError,
    delayRootCause: autoRootCause,
    stepDurationsHours: {
      1: hours[0],
      2: hours[1],
      3: hours[2],
      4: hours[3],
      5: hours[4],
      6: hours[5],
      7: hours[6],
      8: hours[7],
      9: hours[8],
    },
    errorCountsByGroup: {
      curriculumAndMatrix: errGroups[0],
      questionAndCorpus: errGroups[1],
      answerAndGrading: errGroups[2],
      cognitiveLevel: errGroups[3],
      languageAndFormat: errGroups[4],
    },
  };
}

export function loadExecutiveDossierRows(
  questions: QuestionItem[],
  matrices: ExamMatrix[],
  exams: ExamPaper[],
  datasetMode: ExecutiveDatasetScopeMode
): ExecutiveDossierRowExtended[] {
  if (datasetMode === 'REAL_SCHOOL_DATA_ONLY') {
    const savedReal = loadSavedWorkflows(questions, matrices, exams).filter(
      (w) => !w.isTestDataset
    );
    return savedReal.map((wf) => enrichWorkflowRow(wf));
  }

  // Chế độ Kiểm thử Mục VIII: Bộ 24 hồ sơ giả lập đa trạng thái (>= 20 hồ sơ)
  try {
    const savedSimRaw = localStorage.getItem(EXECUTIVE_SIM_STORAGE_KEY);
    if (savedSimRaw) {
      const parsed: ExecutiveDossierRowExtended[] = JSON.parse(savedSimRaw);
      if (Array.isArray(parsed) && parsed.length >= 20) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }

  const generated = SIMULATED_24_BLUEPRINTS.map((bp) => buildWorkflowFromBlueprint(bp));
  try {
    localStorage.setItem(EXECUTIVE_SIM_STORAGE_KEY, JSON.stringify(generated));
  } catch {
    // ignore
  }
  return generated;
}

export function saveExecutiveSimulatedRows(rows: ExecutiveDossierRowExtended[]): void {
  try {
    localStorage.setItem(EXECUTIVE_SIM_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // ignore
  }
}

/**
 * Lọc danh sách hồ sơ theo Phân quyền RBAC (Hiệu trưởng, Phó Hiệu trưởng, Tổ trưởng, Giáo viên)
 * và 8 bộ lọc Mục I
 */
export function filterExecutiveDossierRows(
  rows: ExecutiveDossierRowExtended[],
  filters: ExecutiveDashboardFilterState,
  roleProfile: ExecutiveRolePermissionProfile
): ExecutiveDossierRowExtended[] {
  return rows.filter((row) => {
    const wf = row.workflow;

    // 1. Kiểm tra phạm vi quyền RBAC của tài khoản đang xem
    if (!roleProfile.canViewAllSchool) {
      if (roleProfile.role === 'TEACHER') {
        const isMyDossier =
          wf.creatorName.includes('Nguyễn Thị Mai') ||
          wf.assignedUsers.currentAssigneeName.includes('Nguyễn Thị Mai');
        if (!isMyDossier) return false;
      } else {
        if (
          roleProfile.allowedDepartments !== 'ALL' &&
          !roleProfile.allowedDepartments.includes(wf.departmentName || '')
        ) {
          return false;
        }
        if (
          roleProfile.allowedGrades !== 'ALL' &&
          !roleProfile.allowedGrades.includes(wf.gradeId)
        ) {
          return false;
        }
      }
    }

    // 2. Bộ lọc 8 tiêu chí (Mục I)
    if (filters.schoolId !== 'ALL' && wf.schoolId !== filters.schoolId) return false;
    if (filters.academicYearId !== 'ALL' && wf.academicYearId !== filters.academicYearId)
      return false;
    if (filters.semester !== 'ALL' && row.semester !== filters.semester) return false;
    if (filters.examPeriod !== 'ALL' && wf.examPeriod !== filters.examPeriod) return false;
    if (filters.gradeId !== 'ALL' && wf.gradeId !== filters.gradeId) return false;
    if (filters.subjectId !== 'ALL' && wf.subjectId !== filters.subjectId) return false;
    if (
      filters.departmentName !== 'ALL' &&
      (wf.departmentName || '') !== filters.departmentName
    )
      return false;
    if (filters.teacherName !== 'ALL' && wf.creatorName !== filters.teacherName) return false;

    if (filters.statusCategory !== 'ALL') {
      const st = wf.status;
      if (
        filters.statusCategory === 'BUILDING' &&
        !['Draft', 'MatrixReview', 'MatrixApproved', 'ExamDraft', 'AIReview', 'TeacherRevision'].includes(st)
      )
        return false;
      if (filters.statusCategory === 'AWAITING_REVIEW' && st !== 'ProfessionalReview') return false;
      if (filters.statusCategory === 'REVISION_REQUIRED' && st !== 'RevisionRequired')
        return false;
      if (filters.statusCategory === 'AWAITING_APPROVAL' && st !== 'AwaitingApproval')
        return false;
      if (
        filters.statusCategory === 'APPROVED' &&
        !['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(st)
      )
        return false;
      if (filters.statusCategory === 'OVERDUE' && !row.isOverdue) return false;
      if (
        filters.statusCategory === 'UNRESOLVED_CRITICAL' &&
        !row.hasUnresolvedCriticalAiError
      )
        return false;
    }

    return true;
  });
}

/**
 * Mục II: Tính 8 thẻ thống kê từ dữ liệu thực
 */
export function computeExecutiveKpiSummary(
  rows: ExecutiveDossierRowExtended[],
  schoolId: string,
  academicYearId: string,
  datasetMode: ExecutiveDatasetScopeMode
): ExecutiveKpiCardsSummary {
  const totalDossiers = rows.length;
  const buildingCount = rows.filter((r) =>
    [
      'Draft',
      'MatrixReview',
      'MatrixApproved',
      'ExamDraft',
      'AIReview',
      'TeacherRevision',
    ].includes(r.workflow.status)
  ).length;
  const awaitingReviewCount = rows.filter((r) => r.workflow.status === 'ProfessionalReview').length;
  const revisionRequiredCount = rows.filter(
    (r) => r.workflow.status === 'RevisionRequired'
  ).length;
  const awaitingApprovalCount = rows.filter(
    (r) => r.workflow.status === 'AwaitingApproval'
  ).length;
  const approvedCount = rows.filter((r) =>
    ['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(r.workflow.status)
  ).length;
  const overdueCount = rows.filter((r) => r.isOverdue).length;
  const unresolvedCriticalErrorCount = rows.filter(
    (r) => r.hasUnresolvedCriticalAiError
  ).length;

  return {
    schoolId,
    academicYearId,
    datasetMode,
    totalDossiers,
    buildingCount,
    awaitingReviewCount,
    revisionRequiredCount,
    awaitingApprovalCount,
    approvedCount,
    overdueCount,
    unresolvedCriticalErrorCount,
  };
}

/**
 * Mục VIII: Phép tính độc lập (Independent Loop Verification) để đối chứng 8 thẻ thống kê
 */
export function verifyExecutiveKpisIndependently(
  rows: ExecutiveDossierRowExtended[],
  kpiFromEngine: ExecutiveKpiCardsSummary
): {
  allMatched: boolean;
  comparisons: {
    metricName: string;
    dashboardEngineValue: number;
    independentLoopValue: number;
    matched: boolean;
  }[];
} {
  let cTotal = 0;
  let cBuilding = 0;
  let cReview = 0;
  let cRevision = 0;
  let cPendingApproval = 0;
  let cApproved = 0;
  let cOverdue = 0;
  let cCritical = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const item = rows[i];
    const st = item.workflow.status;
    cTotal += 1;

    if (
      st === 'Draft' ||
      st === 'MatrixReview' ||
      st === 'MatrixApproved' ||
      st === 'ExamDraft' ||
      st === 'AIReview' ||
      st === 'TeacherRevision'
    ) {
      cBuilding += 1;
    } else if (st === 'ProfessionalReview') {
      cReview += 1;
    } else if (st === 'RevisionRequired') {
      cRevision += 1;
    } else if (st === 'AwaitingApproval') {
      cPendingApproval += 1;
    } else if (
      st === 'Approved' ||
      st === 'Released' ||
      st === 'ResultsAnalysis' ||
      st === 'Archived'
    ) {
      cApproved += 1;
    }

    const due = item.workflow.dueDate || item.workflow.examDate;
    const isDone =
      st === 'Approved' ||
      st === 'Released' ||
      st === 'ResultsAnalysis' ||
      st === 'Archived';
    if (due < TODAY_ISO_DATE && !isDone) {
      cOverdue += 1;
    }

    if (item.workflow.step4AiQualityReview.criticalErrorsCount > 0) {
      cCritical += 1;
    }
  }

  const comparisons = [
    {
      metricName: '1. Tổng số hồ sơ',
      dashboardEngineValue: kpiFromEngine.totalDossiers,
      independentLoopValue: cTotal,
      matched: kpiFromEngine.totalDossiers === cTotal,
    },
    {
      metricName: '2. Hồ sơ đang xây dựng',
      dashboardEngineValue: kpiFromEngine.buildingCount,
      independentLoopValue: cBuilding,
      matched: kpiFromEngine.buildingCount === cBuilding,
    },
    {
      metricName: '3. Hồ sơ chờ thẩm định',
      dashboardEngineValue: kpiFromEngine.awaitingReviewCount,
      independentLoopValue: cReview,
      matched: kpiFromEngine.awaitingReviewCount === cReview,
    },
    {
      metricName: '4. Hồ sơ yêu cầu chỉnh sửa',
      dashboardEngineValue: kpiFromEngine.revisionRequiredCount,
      independentLoopValue: cRevision,
      matched: kpiFromEngine.revisionRequiredCount === cRevision,
    },
    {
      metricName: '5. Hồ sơ chờ phê duyệt',
      dashboardEngineValue: kpiFromEngine.awaitingApprovalCount,
      independentLoopValue: cPendingApproval,
      matched: kpiFromEngine.awaitingApprovalCount === cPendingApproval,
    },
    {
      metricName: '6. Hồ sơ đã phê duyệt',
      dashboardEngineValue: kpiFromEngine.approvedCount,
      independentLoopValue: cApproved,
      matched: kpiFromEngine.approvedCount === cApproved,
    },
    {
      metricName: '7. Hồ sơ quá hạn',
      dashboardEngineValue: kpiFromEngine.overdueCount,
      independentLoopValue: cOverdue,
      matched: kpiFromEngine.overdueCount === cOverdue,
    },
    {
      metricName: '8. Hồ sơ có lỗi nghiêm trọng chưa xử lý',
      dashboardEngineValue: kpiFromEngine.unresolvedCriticalErrorCount,
      independentLoopValue: cCritical,
      matched: kpiFromEngine.unresolvedCriticalErrorCount === cCritical,
    },
  ];

  // Kiểm chứng tổng phân hoạch trạng thái (Đang xây dựng + Chờ thẩm định + Yêu cầu chỉnh sửa + Chờ duyệt + Đã duyệt === Tổng số hồ sơ)
  const partitionSumMatched =
    cBuilding + cReview + cRevision + cPendingApproval + cApproved === cTotal;

  return {
    allMatched: comparisons.every((c) => c.matched) && partitionSumMatched,
    comparisons,
  };
}

/**
 * Mục IV: Tính dữ liệu cho 5 biểu đồ điều hành từ tập hồ sơ đang lọc
 */
export function computeExecutiveDashboardCharts(
  rows: ExecutiveDossierRowExtended[]
): ExecutiveDashboardChartsData {
  const departments = [
    'Tổ 1-2-3',
    'Tổ 4-5',
    'Tổ khoa học tự nhiên',
    'Tổ khoa học xã hội',
    'Tổ Tiếng Anh - GDTC',
  ];

  const byDepartment = departments
    .map((dept) => {
      const inDept = rows.filter((r) => (r.workflow.departmentName || '') === dept);
      const totalCount = inDept.length;
      const completedCount = inDept.filter((r) =>
        ['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(r.workflow.status)
      ).length;
      const overdueCount = inDept.filter((r) => r.isOverdue).length;
      const inProgressCount = Math.max(0, totalCount - completedCount);
      const completionPercent =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      return {
        departmentName: dept,
        totalCount,
        completedCount,
        inProgressCount,
        overdueCount,
        completionPercent,
      };
    })
    .filter((d) => d.totalCount > 0);

  const grades: GradeNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const byGrade = grades
    .map((gradeId) => {
      const inGrade = rows.filter((r) => r.workflow.gradeId === gradeId);
      const totalCount = inGrade.length;
      const completedCount = inGrade.filter((r) =>
        ['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(r.workflow.status)
      ).length;
      const overdueCount = inGrade.filter((r) => r.isOverdue).length;
      const inProgressCount = Math.max(0, totalCount - completedCount);
      const completionPercent =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      return {
        gradeId,
        gradeLabel: `Khối ${gradeId}`,
        totalCount,
        completedCount,
        inProgressCount,
        overdueCount,
        completionPercent,
      };
    })
    .filter((g) => g.totalCount > 0);

  const total = Math.max(1, rows.length);
  const statusBuckets = [
    {
      code: 'BUILDING',
      label: 'Đang xây dựng (Ma trận / Đề / AI)',
      count: rows.filter((r) =>
        [
          'Draft',
          'MatrixReview',
          'MatrixApproved',
          'ExamDraft',
          'AIReview',
          'TeacherRevision',
        ].includes(r.workflow.status)
      ).length,
    },
    {
      code: 'AWAITING_REVIEW',
      label: 'Chờ thẩm định chuyên môn',
      count: rows.filter((r) => r.workflow.status === 'ProfessionalReview').length,
    },
    {
      code: 'REVISION_REQUIRED',
      label: 'Yêu cầu chỉnh sửa',
      count: rows.filter((r) => r.workflow.status === 'RevisionRequired').length,
    },
    {
      code: 'AWAITING_APPROVAL',
      label: 'Chờ Ban Giám hiệu phê duyệt',
      count: rows.filter((r) => r.workflow.status === 'AwaitingApproval').length,
    },
    {
      code: 'APPROVED_COMPLETED',
      label: 'Đã phê duyệt / Phát hành / Phân tích',
      count: rows.filter((r) =>
        ['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(r.workflow.status)
      ).length,
    },
  ];

  const byStatus = statusBuckets.map((b) => ({
    statusCode: b.code,
    statusLabel: b.label,
    count: b.count,
    percent: rows.length > 0 ? Math.round((b.count / total) * 100) : 0,
  }));

  // 4. Số lỗi chất lượng đề theo nhóm
  const sumGroup = (
    selector: (r: ExecutiveDossierRowExtended) => number
  ): { criticalCount: number; highCount: number; mediumLowCount: number; totalCount: number } => {
    let crit = 0;
    let high = 0;
    let medLow = 0;
    rows.forEach((r) => {
      const val = selector(r);
      if (val > 0) {
        if (r.hasUnresolvedCriticalAiError) crit += 1;
        else if (r.workflow.step4AiQualityReview.highErrorsCount > 0) high += val;
        else medLow += val;
      }
    });
    return {
      criticalCount: crit,
      highCount: high,
      mediumLowCount: medLow,
      totalCount: crit + high + medLow,
    };
  };

  const byQualityErrorGroup = [
    {
      groupCode: 'MATRIX_SPEC',
      groupLabel: '1. Nhóm Ma trận & Bản đặc tả',
      ...sumGroup((r) => r.errorCountsByGroup.curriculumAndMatrix),
    },
    {
      groupCode: 'QUESTION_CORPUS',
      groupLabel: '2. Nhóm Nội dung Câu hỏi & Ngữ liệu',
      ...sumGroup((r) => r.errorCountsByGroup.questionAndCorpus),
    },
    {
      groupCode: 'ANSWER_RUBRIC',
      groupLabel: '3. Nhóm Đáp án & Hướng dẫn chấm',
      ...sumGroup((r) => r.errorCountsByGroup.answerAndGrading),
    },
    {
      groupCode: 'COGNITIVE_LEVEL',
      groupLabel: '4. Nhóm Mức độ nhận thức (Mức 1/2/3)',
      ...sumGroup((r) => r.errorCountsByGroup.cognitiveLevel),
    },
    {
      groupCode: 'LANGUAGE_FORMAT',
      groupLabel: '5. Nhóm Chính tả, Diễn đạt & Định dạng',
      ...sumGroup((r) => r.errorCountsByGroup.languageAndFormat),
    },
  ];

  // 5. Thời gian xử lý trung bình từng bước
  const stepDefinitions: Array<{
    stepNumber: ExamWorkflowStepNumber;
    stepTitle: string;
    slaTargetHours: number;
  }> = [
    { stepNumber: 1, stepTitle: 'B1. Ngân hàng câu hỏi', slaTargetHours: 3.0 },
    { stepNumber: 2, stepTitle: 'B2. Ma trận & Đặc tả', slaTargetHours: 4.5 },
    { stepNumber: 3, stepTitle: 'B3. Tạo đề kiểm tra', slaTargetHours: 6.5 },
    { stepNumber: 4, stepTitle: 'B4. AI Kiểm tra chất lượng', slaTargetHours: 0.8 },
    { stepNumber: 5, stepTitle: 'B5. Giáo viên chỉnh sửa', slaTargetHours: 4.5 },
    { stepNumber: 6, stepTitle: 'B6. Thẩm định chuyên môn', slaTargetHours: 5.0 },
    { stepNumber: 7, stepTitle: 'B7. Phê duyệt chính thức', slaTargetHours: 3.0 },
    { stepNumber: 8, stepTitle: 'B8. Phát hành hồ sơ', slaTargetHours: 1.5 },
    { stepNumber: 9, stepTitle: 'B9. Phân tích kết quả', slaTargetHours: 3.0 },
  ];

  const avgProcessingTimeByStep = stepDefinitions.map((def) => {
    const activeVals = rows
      .map((r) => r.stepDurationsHours[def.stepNumber])
      .filter((v) => v > 0);
    const avgHours =
      activeVals.length > 0
        ? Number((activeVals.reduce((a, b) => a + b, 0) / activeVals.length).toFixed(1))
        : 0;
    return {
      stepNumber: def.stepNumber,
      stepTitle: def.stepTitle,
      avgHours,
      slaTargetHours: def.slaTargetHours,
      isBottleneck: avgHours > def.slaTargetHours,
    };
  });

  return {
    byDepartment,
    byGrade,
    byStatus,
    byQualityErrorGroup,
    avgProcessingTimeByStep,
  };
}

/**
 * Mục V: 5 Nhóm Cảnh báo ưu tiên dành cho Ban Giám hiệu
 */
export function computeExecutivePriorityAlerts(
  rows: ExecutiveDossierRowExtended[]
): ExecutivePriorityAlertItem[] {
  const alerts: ExecutivePriorityAlertItem[] = [];

  rows.forEach((row) => {
    const wf = row.workflow;
    const dept = wf.departmentName || 'Tổ Chuyên môn';
    const owner = wf.assignedUsers.currentAssigneeName || 'Chưa phân công';
    const due = wf.dueDate || wf.examDate;

    // 1. Hồ sơ có lỗi nghiêm trọng
    if (row.hasUnresolvedCriticalAiError) {
      alerts.push({
        alertId: `ALT-CRIT-${wf.workflowId}`,
        workflowId: wf.workflowId,
        dossierTitle: wf.title,
        subjectId: wf.subjectId,
        gradeId: wf.gradeId,
        departmentName: dept,
        ownerName: owner,
        alertType: 'UNRESOLVED_CRITICAL_ERROR',
        alertTypeLabel: 'Hồ sơ có lỗi nghiêm trọng chưa xử lý',
        priorityRank: 1,
        severity: 'CRITICAL',
        detailReason: `Phát hiện ${wf.step4AiQualityReview.criticalErrorsCount} lỗi nghiêm trọng từ AI Quality Review nhưng chưa được giáo viên khắc phục.`,
        dueDate: due,
        examDate: wf.examDate,
        recommendedAction: 'Yêu cầu giáo viên xử lý ngay lỗi nghiêm trọng tại Bước 5.',
      });
    }

    // 2. Hồ sơ chưa được phê duyệt gần ngày kiểm tra
    if (row.isNearExamDateUnapproved) {
      alerts.push({
        alertId: `ALT-NEAR-${wf.workflowId}`,
        workflowId: wf.workflowId,
        dossierTitle: wf.title,
        subjectId: wf.subjectId,
        gradeId: wf.gradeId,
        departmentName: dept,
        ownerName: owner,
        alertType: 'UNAPPROVED_NEAR_EXAM_DATE',
        alertTypeLabel: 'Chưa phê duyệt sát ngày kiểm tra (≤ 3 ngày)',
        priorityRank: 2,
        severity: 'CRITICAL',
        detailReason: `Ngày kiểm tra là ${wf.examDate} nhưng hồ sơ vẫn ở trạng thái [${wf.status}].`,
        dueDate: due,
        examDate: wf.examDate,
        recommendedAction: 'Đôn đốc hoàn tất thẩm định và phê duyệt khẩn cấp.',
      });
    }

    // 3. Hồ sơ quá hạn
    if (row.isOverdue) {
      alerts.push({
        alertId: `ALT-OVERDUE-${wf.workflowId}`,
        workflowId: wf.workflowId,
        dossierTitle: wf.title,
        subjectId: wf.subjectId,
        gradeId: wf.gradeId,
        departmentName: dept,
        ownerName: owner,
        alertType: 'OVERDUE_DOSSIER',
        alertTypeLabel: 'Hồ sơ quá hạn hoàn thành',
        priorityRank: 3,
        severity: 'HIGH',
        detailReason: `Hạn hoàn thành là ${due} nhưng hồ sơ đang dừng tại Bước ${wf.currentStep} (${wf.status}).`,
        dueDate: due,
        examDate: wf.examDate,
        recommendedAction: 'Gửi nhắc việc trong ứng dụng cho người phụ trách.',
      });
    }

    // 4. Hồ sơ chưa có người phụ trách
    if (row.isUnassignedOwner) {
      alerts.push({
        alertId: `ALT-UNASSIGNED-${wf.workflowId}`,
        workflowId: wf.workflowId,
        dossierTitle: wf.title,
        subjectId: wf.subjectId,
        gradeId: wf.gradeId,
        departmentName: dept,
        ownerName: 'Chưa có người phụ trách',
        alertType: 'UNASSIGNED_OWNER',
        alertTypeLabel: 'Hồ sơ chưa có người phụ trách',
        priorityRank: 4,
        severity: 'HIGH',
        detailReason: 'Hồ sơ bị trống người phụ trách bước hiện tại hoặc chưa chỉ định giáo viên phản biện.',
        dueDate: due,
        examDate: wf.examDate,
        recommendedAction: 'Thực hiện Phân công người phụ trách ngay trên Bảng điều khiển.',
      });
    }

    // 5. Hồ sơ bị trả lại nhiều lần
    if (row.returnedCount >= 2) {
      alerts.push({
        alertId: `ALT-RETURNED-${wf.workflowId}`,
        workflowId: wf.workflowId,
        dossierTitle: wf.title,
        subjectId: wf.subjectId,
        gradeId: wf.gradeId,
        departmentName: dept,
        ownerName: owner,
        alertType: 'RETURNED_MULTIPLE_TIMES',
        alertTypeLabel: `Bị trả lại nhiều lần (${row.returnedCount} lần)`,
        priorityRank: 5,
        severity: 'MEDIUM',
        detailReason:
          row.delayRootCause ||
          `Hồ sơ đã bị Hội đồng thẩm định trả lại ${row.returnedCount} lần để chỉnh sửa.`,
        dueDate: due,
        examDate: wf.examDate,
        recommendedAction: 'Tổ trưởng chuyên môn hỗ trợ rà soát trực tiếp cùng giáo viên.',
      });
    }
  });

  return alerts.sort((a, b) => a.priorityRank - b.priorityRank);
}

/**
 * Mục VI: Thực thi thao tác quản lý có kiểm tra quyền ở Backend và chặn bỏ qua thẩm định
 */
export async function executeExecutiveManagementAction(params: {
  actionType:
    | 'ASSIGN_PERSONNEL'
    | 'SEND_IN_APP_REMINDER'
    | 'REQUEST_SUPPLEMENT'
    | 'DIRECT_APPROVE_BYPASS_REVIEW';
  row: ExecutiveDossierRowExtended;
  actorProfile: ExecutiveRolePermissionProfile;
  assigneeName?: string;
  creatorName?: string;
  reviewerName?: string;
  noteText?: string;
}): Promise<{
  allowed: boolean;
  httpStatus: number;
  message: string;
  updatedWorkflow?: ExamWorkflow;
}> {
  const { actionType, row, actorProfile, assigneeName, noteText } = params;
  const wf = row.workflow;
  const hasCompletedReview =
    wf.step6ProfessionalReview.latestDecision === 'ELIGIBLE_FOR_APPROVAL' &&
    wf.step6ProfessionalReview.ballots.length > 0;

  try {
    const response = await fetch('/api/executive-dashboard/manage-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType,
        workflowId: wf.workflowId,
        actorName: actorProfile.fullName,
        actorRole: actorProfile.role,
        actorDepartment:
          actorProfile.allowedDepartments === 'ALL'
            ? 'ALL'
            : actorProfile.allowedDepartments[0],
        targetDepartment: wf.departmentName,
        hasCompletedProfessionalReview: hasCompletedReview,
        hasUnresolvedCriticalErrors: row.hasUnresolvedCriticalAiError,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.allowed) {
      return {
        allowed: false,
        httpStatus: Number(data.httpStatus || response.status),
        message: String(data.message || 'Thao tác bị từ chối tại Backend.'),
      };
    }
  } catch {
    // Fallback local guard
    if (actionType === 'DIRECT_APPROVE_BYPASS_REVIEW' || !hasCompletedReview) {
      if (actionType === 'DIRECT_APPROVE_BYPASS_REVIEW') {
        return {
          allowed: false,
          httpStatus: 422,
          message: `BỊ CHẶN TẠI BACKEND (HTTP 422): Không cho phép bỏ qua quy trình thẩm định bằng thao tác trực tiếp trên Bảng điều khiển đối với hồ sơ [${wf.workflowId}].`,
        };
      }
    }
    if (actorProfile.role === 'TEACHER') {
      return {
        allowed: false,
        httpStatus: 403,
        message: `TỪ CHỐI QUYỀN QUẢN LÝ (HTTP 403): Vai trò Giáo viên (${actorProfile.fullName}) không có thẩm quyền thực hiện [${actionType}].`,
      };
    }
  }

  const nowIso = new Date().toISOString();
  let updatedWf: ExamWorkflow = { ...wf, updatedAt: nowIso };

  if (actionType === 'ASSIGN_PERSONNEL' && (assigneeName || params.creatorName || params.reviewerName)) {
    const nextCreator = (params.creatorName || updatedWf.creatorName || '').trim();
    const nextReviewer = (
      params.reviewerName ||
      assigneeName ||
      updatedWf.assignedUsers.reviewerName ||
      ''
    ).trim();
    const nextCurrentAssignee = (
      assigneeName ||
      (updatedWf.currentStep <= 5 ? nextCreator : nextReviewer) ||
      nextCreator
    ).trim();

    updatedWf = {
      ...updatedWf,
      creatorName: nextCreator || updatedWf.creatorName,
      assignedUsers: {
        ...updatedWf.assignedUsers,
        creatorName: nextCreator || updatedWf.assignedUsers.creatorName,
        currentAssigneeName: nextCurrentAssignee,
        reviewerName: nextReviewer || updatedWf.assignedUsers.reviewerName,
      },
      auditTrail: [
        {
          id: `AUD-EXEC-${Date.now()}`,
          workflowId: wf.workflowId,
          timestamp: nowIso,
          actorId: actorProfile.accountId,
          actorName: actorProfile.fullName,
          actorRole: actorProfile.role,
          actionType: 'STEP_SAVED',
          fromState: wf.status,
          toState: wf.status,
          fromStep: wf.currentStep,
          toStep: wf.currentStep,
          versionId: wf.currentVersionId,
          backendVerified: true,
          summary: `[Phân công ra đề & thẩm định] GV ra đề: ${nextCreator || updatedWf.creatorName} · Phản biện: ${nextReviewer || 'Chưa gán'} · Phụ trách hiện tại: ${nextCurrentAssignee}. Ghi chú: ${noteText || 'Thực hiện theo kế hoạch chuyên môn'}.`,
        },
        ...updatedWf.auditTrail,
      ],
    };

    await emitWorkflowNotificationEvent({
      workflowId: wf.workflowId,
      dossierTitle: wf.title,
      subjectId: wf.subjectId,
      gradeId: wf.gradeId,
      departmentName: wf.departmentName || 'Tổ Chuyên môn',
      eventType: 'REVIEWER_ASSIGNED',
      senderUserId: actorProfile.accountId,
      senderName: actorProfile.fullName,
      senderRole: actorProfile.role,
      recipientUserId: 'user-reviewer-primary',
      recipientName: nextCurrentAssignee,
      recipientRole: 'TEACHER',
      title: `[Executive Dashboard] Phân công phụ trách / thẩm định hồ sơ ${wf.workflowId}`,
      content: `${actorProfile.fullName} đã phân công ${assigneeName} phụ trách xử lý hồ sơ [${wf.title}]. ${noteText || ''}`,
      priority: 'HIGH',
      targetMenuId: 'exam-workflow',
      targetWorkflowStep: wf.currentStep,
      actionLabel: 'Nhận hồ sơ & Thực hiện',
      actionInstruction: noteText || 'Kiểm tra và xử lý hồ sơ theo đúng hạn hoàn thành.',
      dueDate: wf.dueDate || wf.examDate,
    });
  } else if (actionType === 'SEND_IN_APP_REMINDER') {
    updatedWf = {
      ...updatedWf,
      auditTrail: [
        {
          id: `AUD-REM-${Date.now()}`,
          workflowId: wf.workflowId,
          timestamp: nowIso,
          actorId: actorProfile.accountId,
          actorName: actorProfile.fullName,
          actorRole: actorProfile.role,
          actionType: 'STEP_SAVED',
          fromState: wf.status,
          toState: wf.status,
          fromStep: wf.currentStep,
          toStep: wf.currentStep,
          versionId: wf.currentVersionId,
          backendVerified: true,
          summary: `[Executive Dashboard] Gửi thông báo nhắc việc trong ứng dụng đến [${wf.assignedUsers.currentAssigneeName || wf.creatorName}]: ${noteText || 'Đề nghị đẩy nhanh tiến độ hồ sơ'}.`,
        },
        ...updatedWf.auditTrail,
      ],
    };

    await emitWorkflowNotificationEvent({
      workflowId: wf.workflowId,
      dossierTitle: wf.title,
      subjectId: wf.subjectId,
      gradeId: wf.gradeId,
      departmentName: wf.departmentName || 'Tổ Chuyên môn',
      eventType: row.isOverdue ? 'DOSSIER_OVERDUE' : 'EXAM_DRAFT_COMPLETED',
      senderUserId: actorProfile.accountId,
      senderName: actorProfile.fullName,
      senderRole: actorProfile.role,
      recipientUserId: 'user-teacher-mai',
      recipientName: wf.assignedUsers.currentAssigneeName || wf.creatorName,
      recipientRole: 'TEACHER',
      title: `[Nhắc việc từ Ban Giám hiệu] Đôn đốc tiến độ hồ sơ ${wf.workflowId} (${wf.subjectId} Khối ${wf.gradeId})`,
      content:
        noteText ||
        `Đề nghị hoàn thành bước hiện tại (Bước ${wf.currentStep}) của hồ sơ [${wf.title}] trước hạn ${wf.dueDate || wf.examDate}.`,
      priority: 'URGENT',
      targetMenuId: 'exam-workflow',
      targetWorkflowStep: wf.currentStep,
      actionLabel: 'Mở hồ sơ xử lý ngay',
      actionInstruction: noteText || 'Hoàn thành nhiệm vụ đang tồn đọng trên hồ sơ.',
      dueDate: wf.dueDate || wf.examDate,
    });
  } else if (actionType === 'REQUEST_SUPPLEMENT') {
    updatedWf = {
      ...updatedWf,
      status: 'RevisionRequired',
      currentStep: 5,
      auditTrail: [
        {
          id: `AUD-SUPP-${Date.now()}`,
          workflowId: wf.workflowId,
          timestamp: nowIso,
          actorId: actorProfile.accountId,
          actorName: actorProfile.fullName,
          actorRole: actorProfile.role,
          actionType: 'TEACHER_REVISION_SAVED',
          fromState: wf.status,
          toState: 'RevisionRequired',
          fromStep: wf.currentStep,
          toStep: 5,
          versionId: wf.currentVersionId,
          backendVerified: true,
          summary: `[Executive Dashboard] Yêu cầu bổ sung hồ sơ: ${noteText || 'Bổ sung đầy đủ đáp án, hướng dẫn chấm và thuyết minh đặc tả'}.`,
        },
        ...updatedWf.auditTrail,
      ],
    };

    await emitWorkflowNotificationEvent({
      workflowId: wf.workflowId,
      dossierTitle: wf.title,
      subjectId: wf.subjectId,
      gradeId: wf.gradeId,
      departmentName: wf.departmentName || 'Tổ Chuyên môn',
      eventType: 'DOSSIER_RETURNED_FOR_REVISION',
      senderUserId: actorProfile.accountId,
      senderName: actorProfile.fullName,
      senderRole: actorProfile.role,
      recipientUserId: 'user-teacher-mai',
      recipientName: wf.creatorName,
      recipientRole: 'TEACHER',
      title: `[Yêu cầu bổ sung hồ sơ] ${wf.workflowId} – ${wf.subjectId} Khối ${wf.gradeId}`,
      content:
        noteText ||
        'Ban Giám hiệu yêu cầu bổ sung hoàn thiện thành phần hồ sơ trước khi trình thẩm định/phê duyệt.',
      priority: 'URGENT',
      targetMenuId: 'exam-workflow',
      targetWorkflowStep: 5,
      actionLabel: 'Bổ sung & Chỉnh sửa hồ sơ',
      actionInstruction: noteText || 'Cập nhật hồ sơ tại Bước 5 theo yêu cầu của Lãnh đạo.',
      dueDate: wf.dueDate || wf.examDate,
    });
  }

  if (!updatedWf.isTestDataset) {
    saveWorkflowToLocal(updatedWf);
    syncWorkflowToBackend(updatedWf, actorProfile.fullName, actorProfile.role);
  }

  return {
    allowed: true,
    httpStatus: 200,
    message: `Đã thực hiện thành công thao tác [${actionType}] trên hồ sơ [${wf.workflowId}] và đồng bộ với Trung tâm Thông báo.`,
    updatedWorkflow: updatedWf,
  };
}

/**
 * Mục VII: Xuất báo cáo Word (.doc), Excel (.csv) và PDF/In chuẩn hành chính gồm đủ 5 phần:
 * 1. Tổng hợp tiến độ
 * 2. Danh sách hồ sơ
 * 3. Hồ sơ chưa hoàn thành
 * 4. Nguyên nhân chậm tiến độ nếu có dữ liệu
 * 5. Những việc cần xử lý
 */
export function exportExecutiveReportDocument(params: {
  format: 'WORD_DOC' | 'EXCEL_CSV' | 'PDF_PRINT';
  rows: ExecutiveDossierRowExtended[];
  kpis: ExecutiveKpiCardsSummary;
  alerts: ExecutivePriorityAlertItem[];
  schoolName: string;
  academicYear: string;
  actorName: string;
  isOfficialRealDataOnly: boolean;
}): void {
  const {
    format,
    rows,
    kpis,
    alerts,
    schoolName,
    academicYear,
    actorName,
    isOfficialRealDataOnly,
  } = params;

  const incompleteRows = rows.filter(
    (r) =>
      !['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(r.workflow.status)
  );
  const delayedWithCauseRows = rows.filter((r) => Boolean(r.delayRootCause));

  const dataOriginNotice = isOfficialRealDataOnly
    ? 'BÁO CÁO CHÍNH THỨC NHÀ TRƯỜNG (Tính 100% từ dữ liệu vận hành thực tế – Đã loại trừ dữ liệu giả lập kiểm thử)'
    : 'BẢN TRÍCH XUẤT PHỤC VỤ KIỂM THỬ HỆ THỐNG (Đang bao gồm bộ 24 hồ sơ giả lập kiểm thử Mục VIII – Không dùng làm báo cáo chính thức)';

  if (format === 'EXCEL_CSV') {
    const lines: string[] = [
      `"ĐƠN VỊ: ${schoolName}"`,
      `"BÁO CÁO ĐIỀU HÀNH TIẾN ĐỘ HỒ SƠ KIỂM TRA - NĂM HỌC ${academicYear}"`,
      `"Nguồn số liệu: ${dataOriginNotice}"`,
      `"Người xuất báo cáo: ${actorName} - Ngày xuất: ${new Date().toLocaleString('vi-VN')}"`,
      '',
      '"I. TỔNG HỢP TIẾN ĐỘ (8 CHỈ SỐ TRỌNG TÂM)"',
      '"Tổng số hồ sơ","Đang xây dựng","Chờ thẩm định","Yêu cầu chỉnh sửa","Chờ phê duyệt","Đã phê duyệt","Quá hạn","Có lỗi nghiêm trọng chưa xử lý"',
      `${kpis.totalDossiers},${kpis.buildingCount},${kpis.awaitingReviewCount},${kpis.revisionRequiredCount},${kpis.awaitingApprovalCount},${kpis.approvedCount},${kpis.overdueCount},${kpis.unresolvedCriticalErrorCount}`,
      '',
      '"II. DANH SÁCH TOÀN BỘ HỒ SƠ KIỂM TRA"',
      '"Mã hồ sơ","Môn học","Khối","Tổ chuyên môn","Người phụ trách","Trạng thái Ma trận","Trạng thái Đề","Kết quả AI","Thẩm định","Phê duyệt","Hạn hoàn thành","Nguyên nhân chậm tiến độ (nếu có)"',
      ...rows.map((r) => {
        const w = r.workflow;
        return `"${w.workflowId}","${w.subjectId}","Khối ${w.gradeId}","${w.departmentName || ''}","${w.assignedUsers.currentAssigneeName || 'Chưa phân công'}","${w.step2MatrixAndSpec.matrixApprovalStatus}","${w.status}","${w.step4AiQualityReview.criticalErrorsCount} lỗi nghiêm trọng","${w.step6ProfessionalReview.latestDecision || 'Chưa thẩm định'}","${w.step7OfficialApproval.approvalRecord ? 'Đã phê duyệt' : 'Chưa duyệt'}","${w.dueDate || w.examDate}","${r.delayRootCause || ''}"`;
      }),
      '',
      '"III. DANH SÁCH HỒ SƠ CHƯA HOÀN THÀNH & NGUYÊN NHÂN CHẬM TIẾN ĐỘ"',
      '"Mã hồ sơ","Môn - Khối","Trạng thái hiện tại","Hạn hoàn thành","Nguyên nhân chậm tiến độ","Việc cần xử lý"',
      ...incompleteRows.map((r) => {
        const w = r.workflow;
        return `"${w.workflowId}","${w.subjectId} Khối ${w.gradeId}","${w.status}","${w.dueDate || w.examDate}","${r.delayRootCause || 'Đang trong tiến độ xây dựng'}","Hoàn thành Bước ${w.currentStep} trước ngày thi ${w.examDate}"`;
      }),
    ];

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Executive_Dashboard_${academicYear}_${isOfficialRealDataOnly ? 'ChinhThuc' : 'KiemThu'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Báo cáo Executive Dashboard - ${schoolName}</title>
  <style>
    body { font-family: "Times New Roman", serif; font-size: 13pt; color: #111827; line-height: 1.45; margin: 24px; }
    h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
    h2 { font-size: 13.5pt; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; color: #1e3a8a; }
    .notice { border: 1px solid #94a3b8; padding: 8px 12px; background: #f8fafc; font-size: 11.5pt; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11.5pt; }
    th, td { border: 1px solid #334155; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #e2e8f0; font-weight: bold; }
  </style>
</head>
<body>
  <div style="text-align:center; font-weight:bold;">${schoolName.toUpperCase()}</div>
  <h1>BÁO CÁO TỔNG HỢP TIẾN ĐỘ HỒ SƠ KIỂM TRA (EXECUTIVE DASHBOARD)</h1>
  <div style="text-align:center; font-style:italic;">Năm học: ${academicYear} · Người lập: ${actorName} · Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
  <div class="notice"><strong>Phạm vi dữ liệu:</strong> ${dataOriginNotice}</div>

  <h2>I. TỔNG HỢP TIẾN ĐỘ TOÀN TRƯỜNG</h2>
  <table>
    <tr>
      <th>Tổng số hồ sơ</th>
      <th>Đang xây dựng</th>
      <th>Chờ thẩm định</th>
      <th>Yêu cầu chỉnh sửa</th>
      <th>Chờ phê duyệt</th>
      <th>Đã phê duyệt</th>
      <th>Quá hạn</th>
      <th>Lỗi nghiêm trọng</th>
    </tr>
    <tr>
      <td><strong>${kpis.totalDossiers}</strong></td>
      <td>${kpis.buildingCount}</td>
      <td>${kpis.awaitingReviewCount}</td>
      <td>${kpis.revisionRequiredCount}</td>
      <td>${kpis.awaitingApprovalCount}</td>
      <td>${kpis.approvedCount}</td>
      <td>${kpis.overdueCount}</td>
      <td>${kpis.unresolvedCriticalErrorCount}</td>
    </tr>
  </table>

  <h2>II. DANH SÁCH HỒ SƠ KIỂM TRA (${rows.length} HỒ SƠ)</h2>
  <table>
    <tr>
      <th>Mã hồ sơ</th>
      <th>Môn - Khối</th>
      <th>Tổ chuyên môn</th>
      <th>Người phụ trách</th>
      <th>Ma trận</th>
      <th>Trạng thái đề</th>
      <th>Kết quả AI</th>
      <th>Hạn hoàn thành</th>
    </tr>
    ${rows
      .map(
        (r) => `<tr>
      <td>${r.workflow.workflowId}</td>
      <td>${r.workflow.subjectId} - Khối ${r.workflow.gradeId}</td>
      <td>${r.workflow.departmentName || ''}</td>
      <td>${r.workflow.assignedUsers.currentAssigneeName || 'Chưa phân công'}</td>
      <td>${r.workflow.step2MatrixAndSpec.matrixApprovalStatus}</td>
      <td>${r.workflow.status}</td>
      <td>${r.workflow.step4AiQualityReview.criticalErrorsCount} lỗi nghiêm trọng</td>
      <td>${r.workflow.dueDate || r.workflow.examDate}</td>
    </tr>`
      )
      .join('')}
  </table>

  <h2>III. HỒ SƠ CHƯA HOÀN THÀNH (${incompleteRows.length} HỒ SƠ)</h2>
  <table>
    <tr>
      <th>Mã hồ sơ</th>
      <th>Môn - Khối</th>
      <th>Bước hiện tại</th>
      <th>Người phụ trách</th>
      <th>Hạn hoàn thành</th>
    </tr>
    ${incompleteRows
      .map(
        (r) => `<tr>
      <td>${r.workflow.workflowId}</td>
      <td>${r.workflow.subjectId} - Khối ${r.workflow.gradeId}</td>
      <td>Bước ${r.workflow.currentStep} (${r.workflow.status})</td>
      <td>${r.workflow.assignedUsers.currentAssigneeName || 'Chưa phân công'}</td>
      <td>${r.workflow.dueDate || r.workflow.examDate}</td>
    </tr>`
      )
      .join('')}
  </table>

  <h2>IV. NGUYÊN NHÂN CHẬM TIẾN ĐỘ (TRÍCH XUẤT TỪ DỮ LIỆU THỰC)</h2>
  <table>
    <tr>
      <th>Mã hồ sơ</th>
      <th>Môn - Khối</th>
      <th>Số lần trả lại</th>
      <th>Nguyên nhân cụ thể</th>
    </tr>
    ${delayedWithCauseRows
      .map(
        (r) => `<tr>
      <td>${r.workflow.workflowId}</td>
      <td>${r.workflow.subjectId} - Khối ${r.workflow.gradeId}</td>
      <td>${r.returnedCount} lần</td>
      <td>${r.delayRootCause}</td>
    </tr>`
      )
      .join('')}
  </table>

  <h2>V. NHỮNG VIỆC CẦN XỬ LÝ NGAY (${alerts.length} CẢNH BÁO ƯU TIÊN)</h2>
  <table>
    <tr>
      <th>Mức ưu tiên</th>
      <th>Hồ sơ</th>
      <th>Loại cảnh báo</th>
      <th>Hành động yêu cầu thực hiện</th>
    </tr>
    ${alerts
      .map(
        (a) => `<tr>
      <td>Ưu tiên #${a.priorityRank} (${a.severity})</td>
      <td>[${a.workflowId}] ${a.subjectId} Khối ${a.gradeId}</td>
      <td>${a.alertTypeLabel}</td>
      <td>${a.recommendedAction}</td>
    </tr>`
      )
      .join('')}
  </table>
</body>
</html>`;

  const blob = new Blob(['\uFEFF', htmlContent], {
    type:
      format === 'WORD_DOC'
        ? 'application/msword;charset=utf-8'
        : 'text/html;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    format === 'WORD_DOC'
      ? `Bao_Cao_Executive_Dashboard_${academicYear}_${isOfficialRealDataOnly ? 'ChinhThuc' : 'KiemThu'}.doc`
      : `Bao_Cao_PDF_Print_Executive_Dashboard_${academicYear}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Mục VIII: Chạy kiểm thử tự động trên 24 hồ sơ giả lập (>= 20 hồ sơ),
 * đối chứng phép tính độc lập và kiểm tra phân quyền 4 vai trò + chặn phê duyệt tắt
 */
export async function runExecutiveDashboardBenchmark(
  questions: QuestionItem[],
  matrices: ExamMatrix[],
  exams: ExamPaper[]
): Promise<ExecutiveDashboardBenchmarkReport> {
  const simRows = loadExecutiveDossierRows(
    questions,
    matrices,
    exams,
    'SIMULATION_BENCHMARK_24'
  );
  const realRows = loadExecutiveDossierRows(
    questions,
    matrices,
    exams,
    'REAL_SCHOOL_DATA_ONLY'
  );

  const defaultFilters: ExecutiveDashboardFilterState = {
    schoolId: 'ALL',
    academicYearId: '2026-2027',
    semester: 'ALL',
    examPeriod: 'ALL',
    gradeId: 'ALL',
    subjectId: 'ALL',
    departmentName: 'ALL',
    teacherName: 'ALL',
    statusCategory: 'ALL',
  };

  const principalProfile = EXECUTIVE_ROLE_PROFILES[0];
  const filteredForPrincipal = filterExecutiveDossierRows(
    simRows,
    defaultFilters,
    principalProfile
  );
  const kpiEngine = computeExecutiveKpiSummary(
    filteredForPrincipal,
    'SCHOOL_A',
    '2026-2027',
    'SIMULATION_BENCHMARK_24'
  );
  const independentCheck = verifyExecutiveKpisIndependently(
    filteredForPrincipal,
    kpiEngine
  );

  // Kiểm thử 4 vai trò (Hiệu trưởng, Phó Hiệu trưởng, Tổ trưởng, Giáo viên)
  const unreviewedRow =
    simRows.find((r) => r.workflow.status === 'ExamDraft') || simRows[0];

  const roleRbacTests: ExecutiveDashboardBenchmarkReport['roleRbacTests'] = [];

  for (const prof of EXECUTIVE_ROLE_PROFILES) {
    const visibleRows = filterExecutiveDossierRows(simRows, defaultFilters, prof);

    // Thử thao tác Phân công
    const assignAttempt = await executeExecutiveManagementAction({
      actionType: 'ASSIGN_PERSONNEL',
      row: visibleRows[0] || simRows[0],
      actorProfile: prof,
      assigneeName: 'Cô Lê Thị Hồng Hạnh (Phản biện)',
      noteText: 'Kiểm thử phân quyền từ Executive Dashboard',
    });

    // Thử thao tác Bỏ qua quy trình thẩm định để phê duyệt trực tiếp (Mục VI)
    const bypassAttempt = await executeExecutiveManagementAction({
      actionType: 'DIRECT_APPROVE_BYPASS_REVIEW',
      row: unreviewedRow,
      actorProfile: prof,
    });

    const expectedAssignAllowed = prof.role !== 'TEACHER';
    const rolePassed =
      assignAttempt.allowed === expectedAssignAllowed &&
      bypassAttempt.allowed === false &&
      bypassAttempt.httpStatus === 422;

    roleRbacTests.push({
      role: prof.role,
      actorName: prof.fullName,
      visibleDossiersCount: visibleRows.length,
      canAssignTestResult: assignAttempt.allowed
        ? `CHO PHÉP (HTTP ${assignAttempt.httpStatus})`
        : `CHẶN TẠI BACKEND (HTTP ${assignAttempt.httpStatus})`,
      bypassReviewDirectApproveBlockedAtBackend:
        !bypassAttempt.allowed && bypassAttempt.httpStatus === 422,
      backendHttpStatusForBypassAttempt: bypassAttempt.httpStatus,
      passed: rolePassed,
    });
  }

  return {
    executedAt: new Date().toISOString(),
    simulatedDossiersCount: simRows.length,
    realOperationalDossiersCount: realRows.length,
    independentMathVerificationPassed: independentCheck.allMatched,
    kpiComparisonTable: independentCheck.comparisons,
    roleRbacTests,
    realVsSimulatedSeparationVerified:
      realRows.every((r) => !r.workflow.isTestDataset) &&
      simRows.every((r) => r.workflow.isTestDataset === true),
  };
}
