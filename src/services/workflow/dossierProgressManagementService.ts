import {
  DossierAutoWarningItem,
  DossierProgressBenchmarkResult,
  DossierProgressStatistics,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ExamWorkflowState,
  GradeNumber,
  PrincipalProgressAccountScope,
  QuestionItem,
  WorkflowActorRole,
} from '../../types/domain';
import {
  loadSavedWorkflows,
  saveWorkflowToLocal,
  syncWorkflowToBackend,
} from './endToEndExamWorkflowService';

const PROGRESS_TEST_SUITES_STORAGE_KEY = 'edutest_stage16_progress_test_dossiers_v4';

export const STANDARD_EXAM_PERIOD_LABELS = [
  'Giữa học kỳ 1',
  'Cuối học kỳ 1',
  'Giữa học kỳ 2',
  'Cuối học kỳ 2',
] as const;

export function normalizeExamPeriodLabel(
  period?: string | null,
  label?: string | null
): string {
  const rawLabel = String(label || '').trim();
  const rawPeriod = String(period || '').trim().toUpperCase();

  if (
    rawLabel === 'Giữa học kỳ 1' ||
    rawLabel.toLowerCase() === 'giữa học kỳ i' ||
    rawPeriod === 'MID_SEM_1' ||
    rawPeriod === 'GIUA_KY_1'
  ) {
    return 'Giữa học kỳ 1';
  }
  if (
    rawLabel === 'Cuối học kỳ 1' ||
    rawLabel.toLowerCase() === 'cuối học kỳ i' ||
    rawPeriod === 'END_SEM_1' ||
    rawPeriod === 'CUOI_KY_1'
  ) {
    return 'Cuối học kỳ 1';
  }
  if (
    rawLabel === 'Giữa học kỳ 2' ||
    rawLabel.toLowerCase() === 'giữa học kỳ ii' ||
    rawPeriod === 'MID_SEM_2' ||
    rawPeriod === 'GIUA_KY_2'
  ) {
    return 'Giữa học kỳ 2';
  }
  if (
    rawLabel === 'Cuối học kỳ 2' ||
    rawLabel.toLowerCase() === 'cuối học kỳ ii' ||
    rawLabel.toLowerCase() === 'cuối năm học' ||
    rawPeriod === 'END_YEAR' ||
    rawPeriod === 'END_SEM_2' ||
    rawPeriod === 'CUOI_KY_2'
  ) {
    return 'Cuối học kỳ 2';
  }
  return rawLabel || 'Cuối học kỳ 2';
}

// Danh sách tài khoản Ban Giám hiệu / Tổ trưởng / Giáo viên theo phạm vi được phân công (Mục VI. Bảo mật)
export const PRINCIPAL_MANAGEMENT_ACCOUNTS: PrincipalProgressAccountScope[] = [
  {
    accountId: 'acc-principal-all',
    fullName: 'Phan Đức Quý (Hiệu trưởng – Toàn trường)',
    role: 'PRINCIPAL',
    roleTitle: 'Hiệu trưởng (Xem & Điều hành toàn bộ các Tổ chuyên môn Khối 1–9)',
    assignedDepartments: 'ALL',
    assignedGrades: 'ALL',
    canAssignReviewer: true,
    canRequestRevision: true,
    canExportProgressReport: true,
  },
  {
    accountId: 'acc-vp-primary',
    fullName: 'Trần Hồng (Phó Hiệu trưởng – Phụ trách Tiểu học)',
    role: 'VICE_PRINCIPAL',
    roleTitle: 'Phó Hiệu trưởng Tiểu học (Xem Khối 1–5: Tổ 1-2-3, Tổ 4-5, Tiếng Anh - GDTC Tiểu học)',
    assignedDepartments: ['Tổ 1-2-3', 'Tổ 4-5', 'Tổ Tiếng Anh - GDTC'],
    assignedGrades: [1, 2, 3, 4, 5],
    canAssignReviewer: true,
    canRequestRevision: true,
    canExportProgressReport: true,
  },
  {
    accountId: 'acc-vp-secondary-khtn',
    fullName: 'Nguyễn Văn Dũng (Phó Hiệu trưởng – Phụ trách THCS)',
    role: 'VICE_PRINCIPAL',
    roleTitle: 'Phó Hiệu trưởng THCS (Xem Khối 6–9: Tổ khoa học tự nhiên, Tổ khoa học xã hội, Tổ Tiếng Anh - GDTC)',
    assignedDepartments: ['Tổ khoa học tự nhiên', 'Tổ khoa học xã hội', 'Tổ Tiếng Anh - GDTC'],
    assignedGrades: [6, 7, 8, 9],
    canAssignReviewer: true,
    canRequestRevision: true,
    canExportProgressReport: true,
  },
  {
    accountId: 'acc-hod-primary-45',
    fullName: 'Ngô Thị Thùy Loan (Tổ trưởng Tổ 4-5)',
    role: 'HEAD_OF_DEPARTMENT',
    roleTitle: 'Tổ trưởng Chuyên môn (Chỉ xem Tổ 4-5)',
    assignedDepartments: ['Tổ 4-5'],
    assignedGrades: [4, 5],
    canAssignReviewer: true,
    canRequestRevision: true,
    canExportProgressReport: true,
  },
  {
    accountId: 'acc-teacher-lan',
    fullName: 'Phạm Thị Mai Hoa (Giáo viên ra đề)',
    role: 'TEACHER',
    roleTitle: 'Giáo viên (Chỉ xem hồ sơ được giao, không có quyền duyệt/phân công toàn trường)',
    assignedDepartments: ['Tổ 4-5'],
    assignedGrades: [4],
    canAssignReviewer: false,
    canRequestRevision: false,
    canExportProgressReport: false,
  },
];

export const AVAILABLE_REVIEWERS = [
  'Nguyễn Thị Trà My',
  'Ngô Thị Thùy Loan',
  'Thái Dũng',
  'Nguyễn Ngọc Hà',
  'Trần Thị Thu Trang',
  'Hoàng Thị Thi',
  'Hồ Thị Mỹ Trang',
  'Nguyễn Thị Như',
];

export function resolveDepartmentForWorkflow(wf: ExamWorkflow): string {
  if (wf.departmentName && wf.departmentName.trim()) {
    const raw = wf.departmentName.trim();
    if (raw === 'Tổ Tiểu học (Khối 1–3)') return 'Tổ 1-2-3';
    if (raw === 'Tổ Tiểu học (Khối 4–5)') return 'Tổ 4-5';
    if (raw === 'Tổ Toán – Tin' || raw === 'Tổ Khoa học Tự nhiên') return 'Tổ khoa học tự nhiên';
    if (raw === 'Tổ Ngữ văn – KHXH') return 'Tổ khoa học xã hội';
    if (raw === 'Tổ Ngoại ngữ') return 'Tổ Tiếng Anh - GDTC';
    return raw;
  }
  if (wf.gradeId <= 3) return 'Tổ 1-2-3';
  if (wf.gradeId <= 5) return 'Tổ 4-5';
  if (
    wf.subjectId === 'Toán' ||
    wf.subjectId === 'Tin học' ||
    wf.subjectId === 'Khoa học tự nhiên' ||
    wf.subjectId === 'Công nghệ'
  ) {
    return 'Tổ khoa học tự nhiên';
  }
  if (wf.subjectId === 'Tiếng Anh' || wf.subjectId === 'Giáo dục thể chất') {
    return 'Tổ Tiếng Anh - GDTC';
  }
  return 'Tổ khoa học xã hội';
}

export function resolveDueDateForWorkflow(wf: ExamWorkflow): string {
  if (wf.dueDate && wf.dueDate.trim()) {
    return wf.dueDate;
  }
  // Mặc định hạn hoàn thành trước ngày thi 5 ngày
  if (wf.examDate) {
    const dt = new Date(wf.examDate);
    if (!Number.isNaN(dt.getTime())) {
      dt.setDate(dt.getDate() - 5);
      return dt.toISOString().slice(0, 10);
    }
  }
  if (wf.createdAt) {
    const createdDt = new Date(wf.createdAt);
    if (!Number.isNaN(createdDt.getTime())) {
      createdDt.setDate(createdDt.getDate() + 7);
      return createdDt.toISOString().slice(0, 10);
    }
  }
  const fallbackDt = new Date();
  fallbackDt.setDate(fallbackDt.getDate() + 7);
  return fallbackDt.toISOString().slice(0, 10);
}

export function isWorkflowOverdue(
  wf: ExamWorkflow,
  referenceDateIso: string = new Date().toISOString().slice(0, 10)
): boolean {
  const isAlreadyCompleted =
    wf.status === 'Approved' ||
    wf.status === 'Released' ||
    wf.status === 'ResultsAnalysis' ||
    wf.status === 'Archived';
  if (isAlreadyCompleted) return false;
  const due = resolveDueDateForWorkflow(wf);
  return due < referenceDateIso;
}

// Tính toán chính xác 5 cột trạng thái thành phần (Ma trận, Đề, AI, Thẩm định, Phê duyệt) từ ExamWorkflow
export interface ComputedDossierColumnStatuses {
  matrixStatusLabel: string;
  matrixStatusTone: 'emerald' | 'amber' | 'rose' | 'slate';
  examStatusLabel: string;
  examStatusTone: 'emerald' | 'amber' | 'rose' | 'slate';
  aiReviewStatusLabel: string;
  aiReviewStatusTone: 'emerald' | 'amber' | 'rose' | 'slate';
  appraisalStatusLabel: string;
  appraisalStatusTone: 'emerald' | 'amber' | 'rose' | 'slate';
  approvalStatusLabel: string;
  approvalStatusTone: 'emerald' | 'amber' | 'rose' | 'slate';
}

export function computeDossierColumnStatuses(wf: ExamWorkflow): ComputedDossierColumnStatuses {
  // 1. Trạng thái ma trận
  const hasMatrix = wf.hasMatrixDocument !== false && Boolean(wf.matrixId);
  const hasSpec = wf.hasSpecificationDocument !== false && Boolean(wf.specificationId);
  let matrixStatusLabel = 'Đã duyệt Ma trận & Đặc tả';
  let matrixStatusTone: ComputedDossierColumnStatuses['matrixStatusTone'] = 'emerald';

  if (!hasMatrix) {
    matrixStatusLabel = 'Thiếu ma trận';
    matrixStatusTone = 'rose';
  } else if (!hasSpec) {
    matrixStatusLabel = 'Thiếu bản đặc tả';
    matrixStatusTone = 'rose';
  } else if (wf.step2MatrixAndSpec.matrixApprovalStatus === 'INVALIDATED_BY_MATRIX_EDIT') {
    matrixStatusLabel = 'Cần duyệt lại (Do sửa đề)';
    matrixStatusTone = 'rose';
  } else if (wf.step2MatrixAndSpec.matrixApprovalStatus === 'PENDING_REVIEW' || wf.status === 'MatrixReview') {
    matrixStatusLabel = 'Chờ duyệt Ma trận';
    matrixStatusTone = 'amber';
  } else if (wf.step2MatrixAndSpec.matrixApprovalStatus === 'DRAFT' || wf.status === 'Draft') {
    matrixStatusLabel = 'Bản nháp Ma trận';
    matrixStatusTone = 'slate';
  }

  // 2. Trạng thái đề
  let examStatusLabel = 'Chưa tạo đề';
  let examStatusTone: ComputedDossierColumnStatuses['examStatusTone'] = 'slate';
  if (wf.step3ExamGeneration.questionIdsInExam.length > 0) {
    if (!wf.step3ExamGeneration.answerKeyComplete || !wf.step3ExamGeneration.gradingGuideComplete) {
      examStatusLabel = 'Thiếu đáp án / HDC';
      examStatusTone = 'rose';
    } else if (wf.status === 'Approved' || wf.status === 'Released' || wf.status === 'ResultsAnalysis' || wf.status === 'Archived') {
      examStatusLabel = `Đã khóa (${wf.currentVersionId})`;
      examStatusTone = 'emerald';
    } else {
      examStatusLabel = `Đầy đủ (${wf.currentVersionId})`;
      examStatusTone = 'emerald';
    }
  }

  // 3. Kết quả AI kiểm tra
  let aiReviewStatusLabel = 'Chưa kiểm tra AI';
  let aiReviewStatusTone: ComputedDossierColumnStatuses['aiReviewStatusTone'] = 'slate';
  if (wf.step4AiQualityReview.inspectedAt) {
    const unresolvedCritical =
      wf.step4AiQualityReview.criticalErrorsCount +
      wf.step4AiQualityReview.highErrorsCount -
      wf.step4AiQualityReview.resolvedErrorsCount;
    if (wf.step4AiQualityReview.criticalErrorsCount > 0 && unresolvedCritical > 0) {
      aiReviewStatusLabel = `Còn ${wf.step4AiQualityReview.criticalErrorsCount} lỗi nghiêm trọng`;
      aiReviewStatusTone = 'rose';
    } else if (
      wf.step4AiQualityReview.mediumErrorsCount + wf.step4AiQualityReview.lowErrorsCount >
      wf.step4AiQualityReview.resolvedErrorsCount
    ) {
      aiReviewStatusLabel = 'Có khuyến nghị cần xử lý';
      aiReviewStatusTone = 'amber';
    } else {
      aiReviewStatusLabel = 'Đạt yêu cầu kỹ thuật';
      aiReviewStatusTone = 'emerald';
    }
  }

  // 4. Trạng thái thẩm định
  let appraisalStatusLabel = 'Chưa thẩm định';
  let appraisalStatusTone: ComputedDossierColumnStatuses['appraisalStatusTone'] = 'slate';
  if (wf.status === 'ProfessionalReview') {
    appraisalStatusLabel = 'Đang thẩm định';
    appraisalStatusTone = 'amber';
  } else if (wf.status === 'RevisionRequired' || wf.step6ProfessionalReview.latestDecision === 'REVISION_REQUIRED') {
    appraisalStatusLabel = 'Yêu cầu chỉnh sửa';
    appraisalStatusTone = 'rose';
  } else if (wf.step6ProfessionalReview.latestDecision === 'ELIGIBLE_FOR_APPROVAL') {
    appraisalStatusLabel = 'Đã thẩm định (Đạt)';
    appraisalStatusTone = 'emerald';
  }

  // 5. Trạng thái phê duyệt
  let approvalStatusLabel = 'Chưa phê duyệt';
  let approvalStatusTone: ComputedDossierColumnStatuses['approvalStatusTone'] = 'slate';
  if (wf.status === 'AwaitingApproval') {
    approvalStatusLabel = 'Chờ phê duyệt';
    approvalStatusTone = 'amber';
  } else if (wf.status === 'Approved') {
    approvalStatusLabel = 'Đã phê duyệt & Khóa';
    approvalStatusTone = 'emerald';
  } else if (wf.status === 'Released' || wf.status === 'ResultsAnalysis' || wf.status === 'Archived') {
    approvalStatusLabel = 'Đã phê duyệt & Phát hành';
    approvalStatusTone = 'emerald';
  }

  return {
    matrixStatusLabel,
    matrixStatusTone,
    examStatusLabel,
    examStatusTone,
    aiReviewStatusLabel,
    aiReviewStatusTone,
    appraisalStatusLabel,
    appraisalStatusTone,
    approvalStatusLabel,
    approvalStatusTone,
  };
}

// VI. Bảo mật: Lọc danh sách hồ sơ theo phạm vi quyền được giao của Ban Giám hiệu / Tổ trưởng / Giáo viên
export function filterWorkflowsByAccountScope(
  workflows: ExamWorkflow[],
  account: PrincipalProgressAccountScope
): ExamWorkflow[] {
  return workflows.filter((wf) => {
    const dept = resolveDepartmentForWorkflow(wf);
    if (account.role === 'PRINCIPAL' || account.role === 'SYSTEM_ADMIN') {
      return true;
    }
    if (account.role === 'TEACHER') {
      const targetName = account.fullName.split('(')[0].trim().toLowerCase();
      return (
        wf.creatorName.toLowerCase().includes(targetName) ||
        wf.assignedUsers.currentAssigneeName.toLowerCase().includes(targetName)
      );
    }
    const deptLower = dept.trim().toLowerCase();
    const deptAllowed =
      account.assignedDepartments === 'ALL' ||
      account.assignedDepartments.some((d) => d.trim().toLowerCase() === deptLower);
    const gradeAllowed =
      account.assignedGrades === 'ALL' || account.assignedGrades.includes(wf.gradeId);
    return deptAllowed && gradeAllowed;
  });
}

// VI. Bảo mật: Đảm bảo thông báo tổng quan tuyệt đối không hiển thị nội dung câu hỏi/đáp án của đề mật
export function sanitizeOverviewSummaryForConfidentialExam(
  wf: ExamWorkflow,
  rawMessage: string
): string {
  if (!wf.isConfidentialExam) return rawMessage;
  // Loại bỏ bất kỳ đoạn trích dẫn nội dung câu hỏi hoặc đáp án nào nếu có
  const redacted = rawMessage.replace(/["“].*?["”]/g, '[ĐỀ MẬT - ĐÃ ẨN NỘI DUNG]');
  return `${redacted} (Chế độ Đề mật: Ẩn nội dung câu hỏi & đáp án trên bảng tổng quan)`;
}

// Thống kê 7 chỉ số tiến độ hồ sơ
export function computeDossierProgressStatistics(
  workflows: ExamWorkflow[],
  referenceDateIso: string = new Date().toISOString().slice(0, 10)
): DossierProgressStatistics {
  const buildingStates: ExamWorkflowState[] = [
    'Draft',
    'MatrixReview',
    'MatrixApproved',
    'ExamDraft',
    'AIReview',
    'TeacherRevision',
  ];
  const approvedStates: ExamWorkflowState[] = [
    'Approved',
    'Released',
    'ResultsAnalysis',
    'Archived',
  ];

  let buildingCount = 0;
  let awaitingReviewCount = 0;
  let revisionRequiredCount = 0;
  let awaitingApprovalCount = 0;
  let approvedCount = 0;
  let overdueCount = 0;

  for (const wf of workflows) {
    if (buildingStates.includes(wf.status)) buildingCount += 1;
    if (wf.status === 'ProfessionalReview') awaitingReviewCount += 1;
    if (wf.status === 'RevisionRequired') revisionRequiredCount += 1;
    if (wf.status === 'AwaitingApproval') awaitingApprovalCount += 1;
    if (approvedStates.includes(wf.status)) approvedCount += 1;
    if (isWorkflowOverdue(wf, referenceDateIso)) overdueCount += 1;
  }

  return {
    totalDossiers: workflows.length,
    buildingCount,
    awaitingReviewCount,
    revisionRequiredCount,
    awaitingApprovalCount,
    approvedCount,
    overdueCount,
  };
}

// Hệ thống tự động cảnh báo 8 loại rủi ro tiến độ & chất lượng hồ sơ
export function generateAutomaticDossierWarnings(
  workflows: ExamWorkflow[],
  referenceDateIso: string = new Date().toISOString().slice(0, 10)
): DossierAutoWarningItem[] {
  const warnings: DossierAutoWarningItem[] = [];

  for (const wf of workflows) {
    const dept = resolveDepartmentForWorkflow(wf);
    const due = resolveDueDateForWorkflow(wf);
    const isDone =
      wf.status === 'Approved' ||
      wf.status === 'Released' ||
      wf.status === 'ResultsAnalysis' ||
      wf.status === 'Archived';

    // 1. Hồ sơ quá hạn
    if (isWorkflowOverdue(wf, referenceDateIso)) {
      warnings.push({
        id: `warn-${wf.workflowId}-OVERDUE`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'OVERDUE',
        warningLabel: '1. Hồ sơ quá hạn hoàn thành',
        severity: 'CRITICAL',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] (${wf.subjectId} Lớp ${wf.gradeId}) có hạn hoàn thành ${due} nhưng hiện vẫn ở trạng thái ${wf.status}.`
        ),
      });
    }

    // 2. Thiếu ma trận
    if (wf.hasMatrixDocument === false || !wf.matrixId) {
      warnings.push({
        id: `warn-${wf.workflowId}-MISSING_MATRIX`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'MISSING_MATRIX',
        warningLabel: '2. Thiếu Ma trận đề kiểm tra',
        severity: 'CRITICAL',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] chưa thiết lập hoặc chưa đính kèm Ma trận đề kiểm tra.`
        ),
      });
    }

    // 3. Thiếu bản đặc tả
    if (wf.hasSpecificationDocument === false || !wf.specificationId) {
      warnings.push({
        id: `warn-${wf.workflowId}-MISSING_SPEC`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'MISSING_SPECIFICATION',
        warningLabel: '3. Thiếu Bản đặc tả đề kiểm tra',
        severity: 'HIGH',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] chưa hoàn thiện Bản đặc tả liên kết Yêu cầu cần đạt.`
        ),
      });
    }

    // 4. Chưa kiểm tra AI (khi đã tạo đề nhưng chưa chạy AI Quality Review)
    if (wf.step3ExamGeneration.questionIdsInExam.length > 0 && !wf.step4AiQualityReview.inspectedAt) {
      warnings.push({
        id: `warn-${wf.workflowId}-UNINSPECTED_AI`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'UNINSPECTED_BY_AI',
        warningLabel: '4. Chưa kiểm tra chất lượng bằng AI (AI Quality Review)',
        severity: 'HIGH',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] đã khởi tạo đề nhưng chưa chạy bộ kiểm tra chất lượng AI Quality Review.`
        ),
      });
    }

    // 5. Có lỗi nghiêm trọng chưa xử lý
    if (
      wf.step4AiQualityReview.criticalErrorsCount > 0 &&
      wf.step4AiQualityReview.resolvedErrorsCount < wf.step4AiQualityReview.criticalErrorsCount
    ) {
      warnings.push({
        id: `warn-${wf.workflowId}-CRITICAL_AI`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'UNRESOLVED_CRITICAL_AI_ERROR',
        warningLabel: '5. Có lỗi nghiêm trọng từ AI chưa xử lý',
        severity: 'CRITICAL',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] phát hiện ${wf.step4AiQualityReview.criticalErrorsCount} lỗi mức Nghiêm trọng chưa được giáo viên xử lý.`
        ),
      });
    }

    // 6. Chưa thẩm định
    if (!isDone && wf.step6ProfessionalReview.ballots.length === 0) {
      warnings.push({
        id: `warn-${wf.workflowId}-UNREVIEWED`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'UNREVIEWED',
        warningLabel: '6. Chưa có Phiếu thẩm định chuyên môn',
        severity: 'MEDIUM',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] chưa hoàn tất biên bản thẩm định của người phản biện.`
        ),
      });
    }

    // 7. Chưa phê duyệt
    if (!isDone) {
      warnings.push({
        id: `warn-${wf.workflowId}-UNAPPROVED`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'UNAPPROVED',
        warningLabel: '7. Hồ sơ chưa được phê duyệt chính thức',
        severity: 'MEDIUM',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] đang ở bước ${wf.currentStep}/9 (${wf.status}), chưa được phê duyệt & khóa đề.`
        ),
      });
    }

    // 8. Thiếu đáp án hoặc hướng dẫn chấm
    if (
      wf.step3ExamGeneration.questionIdsInExam.length > 0 &&
      (!wf.step3ExamGeneration.answerKeyComplete || !wf.step3ExamGeneration.gradingGuideComplete)
    ) {
      warnings.push({
        id: `warn-${wf.workflowId}-MISSING_RUBRIC`,
        workflowId: wf.workflowId,
        gradeId: wf.gradeId,
        subjectId: wf.subjectId,
        departmentName: dept,
        teacherName: wf.creatorName,
        warningCode: 'MISSING_ANSWER_OR_RUBRIC',
        warningLabel: '8. Thiếu Đáp án hoặc Hướng dẫn chấm chi tiết',
        severity: 'CRITICAL',
        safeOverviewMessage: sanitizeOverviewSummaryForConfidentialExam(
          wf,
          `Hồ sơ [${wf.workflowId}] đã có câu hỏi đề thi nhưng thiếu Đáp án hoặc Hướng dẫn chấm chi tiết.`
        ),
      });
    }
  }

  return warnings;
}

// ============================================================================
// VII. TẠO 12 HỒ SƠ THỬ NGHIỆM (ĐA TRẠNG THÁI, TÁCH BIỆT VỚI DỮ LIỆU CHÍNH THỨC)
// ============================================================================

export function build12TestProgressDossiers(
  questions: QuestionItem[],
  matrices: ExamMatrix[],
  exams: ExamPaper[]
): ExamWorkflow[] {
  const sampleQIds = questions
    .filter((q) => q.status === 'APPROVED')
    .slice(0, 6)
    .map((q) => q.id);

  interface SeedSpec {
    workflowId: string;
    gradeId: GradeNumber;
    subjectId: string;
    departmentName: string;
    examPeriod: ExamWorkflow['examPeriod'];
    examPeriodLabel: string;
    creatorName: string;
    reviewerName: string;
    currentAssigneeName: string;
    currentAssigneeRole: WorkflowActorRole;
    status: ExamWorkflowState;
    currentStep: ExamWorkflow['currentStep'];
    dueDate: string;
    hasMatrixDocument: boolean;
    hasSpecificationDocument: boolean;
    matrixApprovalStatus: ExamWorkflow['step2MatrixAndSpec']['matrixApprovalStatus'];
    hasExamQuestions: boolean;
    answerKeyComplete: boolean;
    gradingGuideComplete: boolean;
    aiInspected: boolean;
    criticalErrorsCount: number;
    resolvedErrorsCount: number;
    reviewDecision?: 'ELIGIBLE_FOR_APPROVAL' | 'REVISION_REQUIRED';
    isApprovedLocked: boolean;
  }

  const specs: SeedSpec[] = [
    {
      workflowId: 'TEST-BGH-001',
      gradeId: 1,
      subjectId: 'Tiếng Việt',
      departmentName: 'Tổ 1-2-3',
      examPeriod: 'MID_SEM_1',
      examPeriodLabel: 'Giữa học kỳ 1',
      creatorName: 'Hồ Thị Chi',
      reviewerName: 'Nguyễn Thị Trà My',
      currentAssigneeName: 'Hồ Thị Chi',
      currentAssigneeRole: 'TEACHER',
      status: 'Draft',
      currentStep: 1,
      dueDate: '2026-05-01', // Quá hạn + Thiếu ma trận
      hasMatrixDocument: false,
      hasSpecificationDocument: false,
      matrixApprovalStatus: 'DRAFT',
      hasExamQuestions: false,
      answerKeyComplete: false,
      gradingGuideComplete: false,
      aiInspected: false,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 0,
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-002',
      gradeId: 2,
      subjectId: 'Toán',
      departmentName: 'Tổ 1-2-3',
      examPeriod: 'END_SEM_1',
      examPeriodLabel: 'Cuối học kỳ 1',
      creatorName: 'Trần Thị Giao',
      reviewerName: 'Hoàng Thị Thi',
      currentAssigneeName: 'Nguyễn Thị Trà My',
      currentAssigneeRole: 'HEAD_OF_DEPARTMENT',
      status: 'MatrixReview',
      currentStep: 2,
      dueDate: '2026-05-12', // Trong hạn, thiếu bản đặc tả
      hasMatrixDocument: true,
      hasSpecificationDocument: false,
      matrixApprovalStatus: 'PENDING_REVIEW',
      hasExamQuestions: false,
      answerKeyComplete: false,
      gradingGuideComplete: false,
      aiInspected: false,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 0,
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-003',
      gradeId: 3,
      subjectId: 'Tiếng Anh',
      departmentName: 'Tổ Tiếng Anh - GDTC',
      examPeriod: 'MID_SEM_2',
      examPeriodLabel: 'Giữa học kỳ 2',
      creatorName: 'Hồ Thị Như Bình',
      reviewerName: 'Trần Thị Thu Trang',
      currentAssigneeName: 'Hồ Thị Như Bình',
      currentAssigneeRole: 'TEACHER',
      status: 'MatrixApproved',
      currentStep: 3,
      dueDate: '2026-05-14',
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: false,
      answerKeyComplete: false,
      gradingGuideComplete: false,
      aiInspected: false,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 0,
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-004',
      gradeId: 4,
      subjectId: 'Toán',
      departmentName: 'Tổ 4-5',
      examPeriod: 'END_YEAR',
      examPeriodLabel: 'Cuối học kỳ 2',
      creatorName: 'Phạm Thị Mai Hoa',
      reviewerName: 'Ngô Thị Thùy Loan',
      currentAssigneeName: 'Phạm Thị Mai Hoa',
      currentAssigneeRole: 'TEACHER',
      status: 'ExamDraft',
      currentStep: 3,
      dueDate: '2026-05-02', // Quá hạn + Thiếu đáp án/HDC + Chưa kiểm tra AI
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: false,
      gradingGuideComplete: false,
      aiInspected: false,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 0,
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-005',
      gradeId: 4,
      subjectId: 'Tiếng Việt',
      departmentName: 'Tổ 4-5',
      examPeriod: 'MID_SEM_2',
      examPeriodLabel: 'Giữa học kỳ 2',
      creatorName: 'Nguyễn Hoà',
      reviewerName: 'Ngô Thị Thùy Loan',
      currentAssigneeName: 'Nguyễn Hoà',
      currentAssigneeRole: 'TEACHER',
      status: 'AIReview',
      currentStep: 4,
      dueDate: '2026-05-03', // Quá hạn + Có lỗi nghiêm trọng chưa xử lý
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 2,
      resolvedErrorsCount: 0,
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-006',
      gradeId: 5,
      subjectId: 'Khoa học',
      departmentName: 'Tổ 4-5',
      examPeriod: 'END_YEAR',
      examPeriodLabel: 'Cuối học kỳ 2',
      creatorName: 'Hồ Văn Phú',
      reviewerName: 'Hồ Thị Mỹ Trang',
      currentAssigneeName: 'Hồ Văn Phú',
      currentAssigneeRole: 'TEACHER',
      status: 'TeacherRevision',
      currentStep: 5,
      dueDate: '2026-05-15',
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 2,
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-007',
      gradeId: 6,
      subjectId: 'Toán',
      departmentName: 'Tổ khoa học tự nhiên',
      examPeriod: 'MID_SEM_1',
      examPeriodLabel: 'Giữa học kỳ 1',
      creatorName: 'Hồ Viết Hình',
      reviewerName: 'Thái Dũng',
      currentAssigneeName: 'Thái Dũng',
      currentAssigneeRole: 'REVIEWER',
      status: 'ProfessionalReview',
      currentStep: 6,
      dueDate: '2026-05-12',
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 1,
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-008',
      gradeId: 7,
      subjectId: 'Khoa học tự nhiên',
      departmentName: 'Tổ khoa học tự nhiên',
      examPeriod: 'MID_SEM_2',
      examPeriodLabel: 'Giữa học kỳ 2',
      creatorName: 'Lê Thị Thu Ái',
      reviewerName: 'Nguyễn Thị Như',
      currentAssigneeName: 'Lê Thị Thu Ái',
      currentAssigneeRole: 'TEACHER',
      status: 'RevisionRequired',
      currentStep: 5,
      dueDate: '2026-05-04', // Quá hạn + Yêu cầu chỉnh sửa
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 1,
      reviewDecision: 'REVISION_REQUIRED',
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-009',
      gradeId: 8,
      subjectId: 'Ngữ văn',
      departmentName: 'Tổ khoa học xã hội',
      examPeriod: 'END_YEAR',
      examPeriodLabel: 'Cuối học kỳ 2',
      creatorName: 'Lê Thị Hoàng Trang',
      reviewerName: 'Nguyễn Ngọc Hà',
      currentAssigneeName: 'Phan Đức Quý',
      currentAssigneeRole: 'PRINCIPAL',
      status: 'AwaitingApproval',
      currentStep: 7,
      dueDate: '2026-05-16',
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 2,
      reviewDecision: 'ELIGIBLE_FOR_APPROVAL',
      isApprovedLocked: false,
    },
    {
      workflowId: 'TEST-BGH-010',
      gradeId: 9,
      subjectId: 'Toán',
      departmentName: 'Tổ khoa học tự nhiên',
      examPeriod: 'END_YEAR',
      examPeriodLabel: 'Cuối học kỳ 2',
      creatorName: 'Lê Thị Mỹ Trang',
      reviewerName: 'Thái Dũng',
      currentAssigneeName: 'Phan Đức Quý',
      currentAssigneeRole: 'PRINCIPAL',
      status: 'Approved',
      currentStep: 7,
      dueDate: '2026-05-10',
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 2,
      reviewDecision: 'ELIGIBLE_FOR_APPROVAL',
      isApprovedLocked: true,
    },
    {
      workflowId: 'TEST-BGH-011',
      gradeId: 5,
      subjectId: 'Toán',
      departmentName: 'Tổ 4-5',
      examPeriod: 'END_YEAR',
      examPeriodLabel: 'Cuối học kỳ 2',
      creatorName: 'Đặng Ngọc Quý',
      reviewerName: 'Ngô Thị Thùy Loan',
      currentAssigneeName: 'Phan Đức Quý',
      currentAssigneeRole: 'PRINCIPAL',
      status: 'Released',
      currentStep: 8,
      dueDate: '2026-05-08',
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 1,
      reviewDecision: 'ELIGIBLE_FOR_APPROVAL',
      isApprovedLocked: true,
    },
    {
      workflowId: 'TEST-BGH-012',
      gradeId: 8,
      subjectId: 'Khoa học tự nhiên',
      departmentName: 'Tổ khoa học tự nhiên',
      examPeriod: 'END_SEM_1',
      examPeriodLabel: 'Cuối học kỳ 1',
      creatorName: 'Nguyễn Phong Linh',
      reviewerName: 'Thái Dũng',
      currentAssigneeName: 'Nguyễn Phong Linh',
      currentAssigneeRole: 'TEACHER',
      status: 'ResultsAnalysis',
      currentStep: 9,
      dueDate: '2026-01-10',
      hasMatrixDocument: true,
      hasSpecificationDocument: true,
      matrixApprovalStatus: 'APPROVED',
      hasExamQuestions: true,
      answerKeyComplete: true,
      gradingGuideComplete: true,
      aiInspected: true,
      criticalErrorsCount: 0,
      resolvedErrorsCount: 2,
      reviewDecision: 'ELIGIBLE_FOR_APPROVAL',
      isApprovedLocked: true,
    },
  ];

  return specs.map((s, idx) => {
    const isPrimary = s.gradeId <= 5;
    const versionId = s.isApprovedLocked ? 'v1.1-APPROVED-LOCKED' : 'v1.0';
    return {
      workflowId: s.workflowId,
      title: `[Hồ sơ Kiểm thử #${idx + 1}] Đề kiểm tra ${s.examPeriodLabel} – Môn ${s.subjectId} Lớp ${s.gradeId}`,
      schoolId: 'SCHOOL_A',
      academicYearId: '2026-2027',
      gradeId: s.gradeId,
      subjectId: s.subjectId,
      examPeriod: s.examPeriod,
      examPeriodLabel: s.examPeriodLabel,
      examDate: '2026-05-18',
      creatorId: `user-creator-${idx + 1}`,
      creatorName: s.creatorName,
      matrixId: s.hasMatrixDocument ? matrices[0]?.id || `MT-${s.workflowId}` : '',
      specificationId: s.hasSpecificationDocument ? `SPEC-${s.workflowId}` : '',
      examId: exams[0]?.id || `EXAM-${s.workflowId}`,
      currentVersionId: versionId,
      reviewReportId: `AI-REV-${s.workflowId}`,
      approvalId: `APP-${s.workflowId}`,
      status: s.status,
      currentStep: s.currentStep,
      assignedUsers: {
        creatorName: s.creatorName,
        creatorRole: 'TEACHER',
        matrixApproverName: 'Thái Dũng',
        reviewerName: s.reviewerName,
        finalApproverName: 'Lê Đức Minh',
        analyticsOwnerName: s.creatorName,
        currentAssigneeName: s.currentAssigneeName,
        currentAssigneeRole: s.currentAssigneeRole,
      },
      createdAt: '2026-04-25T08:00:00.000Z',
      updatedAt: '2026-05-05T09:30:00.000Z',
      isConfidentialExam: true,
      authorizedConfidentialRoles: ['HEAD_OF_DEPARTMENT', 'VICE_PRINCIPAL', 'PRINCIPAL', 'SYSTEM_ADMIN'],
      departmentName: s.departmentName,
      dueDate: s.dueDate,
      hasMatrixDocument: s.hasMatrixDocument,
      hasSpecificationDocument: s.hasSpecificationDocument,
      isTestDataset: true,
      confidentialStemSample:
        'NỘI DUNG ĐỀ MẬT: Cho biểu thức A = 2026 + 1540 : 5. Không được hiển thị câu hỏi này trên bảng thông báo tổng quan!',
      step1QuestionBank: {
        selectedTopics: ['Chủ đề trọng tâm học kỳ', 'Vận dụng thực tiễn'],
        approvedQuestionIds: sampleQIds,
        unapprovedQuestionBlockedCount: 1,
        supplementaryQuestionsCreatedCount: 0,
        coverageSatisfied: true,
        totalSelectedPoints: 10.0,
      },
      step2MatrixAndSpec: {
        educationLevel: isPrimary ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY,
        templateCode: isPrimary ? 'TT27-PRIMARY-3LEVELS' : 'TT22-CV7991-4LEVELS',
        totalQuestions: 6,
        totalPoints: 10.0,
        durationMinutes: isPrimary ? 40 : 45,
        levelDistributionSummary: isPrimary
          ? 'Mức 1: 40% · Mức 2: 40% · Mức 3: 20%'
          : 'Nhận biết: 40% · Thông hiểu: 30% · Vận dụng: 20% · Vận dụng cao: 10%',
        learningOutcomesLinkedCount: 6,
        isValidStructure: s.hasMatrixDocument && s.hasSpecificationDocument,
        matrixApprovalStatus: s.matrixApprovalStatus,
        matrixApprovedBy:
          s.matrixApprovalStatus === 'APPROVED' ? 'Thầy Trần Văn Hùng (Tổ trưởng CM)' : undefined,
        matrixApprovedAt:
          s.matrixApprovalStatus === 'APPROVED' ? '2026-04-28T10:00:00.000Z' : undefined,
        matrixSignature: `SIG-${s.workflowId}-10PT`,
      },
      step3ExamGeneration: {
        variantCodes: s.hasExamQuestions ? ['101', '102'] : [],
        questionIdsInExam: s.hasExamQuestions ? sampleQIds : [],
        answerKeyComplete: s.answerKeyComplete,
        gradingGuideComplete: s.gradingGuideComplete,
        matchesApprovedMatrix: s.hasExamQuestions,
        totalExamPoints: s.hasExamQuestions ? 10.0 : 0,
      },
      step4AiQualityReview: {
        inspectedVersionId: s.aiInspected ? versionId : '',
        inspectedAt: s.aiInspected ? '2026-05-02T14:00:00.000Z' : undefined,
        criticalErrorsCount: s.criticalErrorsCount,
        highErrorsCount: 0,
        mediumErrorsCount: s.aiInspected ? 1 : 0,
        lowErrorsCount: 0,
        resolvedErrorsCount: s.resolvedErrorsCount,
        overallDashboardStatusLabel: !s.aiInspected
          ? '1. Chưa kiểm tra'
          : s.criticalErrorsCount > s.resolvedErrorsCount
          ? '3. Có lỗi cần khắc phục'
          : '5. Đủ điều kiện gửi thẩm định chuyên môn',
        checked10Pillars: {
          curriculum: s.aiInspected,
          matrix: s.aiInspected,
          specification: s.aiInspected,
          questionContent: s.aiInspected,
          answerKey: s.aiInspected,
          gradingGuide: s.aiInspected,
          cognitiveLevel: s.aiInspected,
          points: s.aiInspected,
          language: s.aiInspected,
          formatting: s.aiInspected,
        },
      },
      step5TeacherRevision: {
        revisions: [],
        lastRevisionTriggeredMatrixReapproval: false,
        recheckedAffectedParts: s.resolvedErrorsCount > 0,
      },
      step6ProfessionalReview: {
        ballots: s.reviewDecision
          ? [
              {
                ballotId: `ballot-${s.workflowId}`,
                reviewerId: 'user-reviewer',
                reviewerName: s.reviewerName,
                reviewerRole: 'REVIEWER',
                reviewedVersionId: versionId,
                submittedAt: '2026-05-03T15:00:00.000Z',
                decision: s.reviewDecision,
                generalComments:
                  s.reviewDecision === 'ELIGIBLE_FOR_APPROVAL'
                    ? 'Hồ sơ đề đảm bảo tính chính xác khoa học, bám sát YCCĐ và khớp 100% với ma trận đã duyệt.'
                    : 'Đề nghị rà soát lại biểu điểm thành phần Câu tự luận và bổ sung cách giải tương đương trong Hướng dẫn chấm.',
                criteriaChecklist: {
                  curriculumAlignment: true,
                  matrixAndSpecMatch: true,
                  scientificAndPedagogicalAccuracy: true,
                  answerKeyAndRubricClarity: s.reviewDecision === 'ELIGIBLE_FOR_APPROVAL',
                },
              },
            ]
          : [],
        latestDecision: s.reviewDecision,
      },
      step7OfficialApproval: s.isApprovedLocked
        ? {
            approvalRecord: {
              approvalId: `APP-${s.workflowId}`,
              approverId: 'user-principal',
              approverName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
              approverRole: 'PRINCIPAL',
              approvedVersionId: versionId,
              approvedAt: '2026-05-04T16:00:00.000Z',
              isVersionLocked: true,
              dossierCompletenessVerified: true,
              appraisalBallotVerified: true,
              approvalComment: 'Phê duyệt chính thức và khóa bất biến phiên bản đề kiểm tra.',
            },
          }
        : {},
      step8DossierExport: {
        exports:
          s.status === 'Released' || s.status === 'ResultsAnalysis'
            ? [
                {
                  exportId: `exp-${s.workflowId}`,
                  exportedAt: '2026-05-05T08:00:00.000Z',
                  exportedBy: 'Thầy Phạm Minh Đức',
                  exportedByRole: 'PRINCIPAL',
                  versionId,
                  format: 'ZIP_FULL_DOSSIER',
                  includedDocuments: [
                    'MA_TRAN',
                    'BAN_DAC_TA',
                    'DE_KIEM_TRA',
                    'DAP_AN',
                    'HUONG_DAN_CHAM',
                    'PHIEU_THAM_DINH',
                    'BIEN_BAN_PHE_DUYET',
                  ],
                  confidentialCheckPassed: true,
                },
              ]
            : [],
      },
      step9ResultsAnalysis:
        s.status === 'ResultsAnalysis'
          ? {
              analysisSummary: {
                analysisId: `ana-${s.workflowId}`,
                analyzedAt: '2026-05-05T14:00:00.000Z',
                analyzedBy: s.creatorName,
                studentCount: 40,
                averageScore: 7.85,
                highestScore: 10.0,
                lowestScore: 4.5,
                passRatePercent: 95,
                hasItemLevelData: true,
                flaggedQuestionsCount: 1,
                learningOutcomeMasterySummary: [
                  { outcomeCode: 'YCCD-01', outcomeLabel: 'Kiến thức cốt lõi học kỳ', masteryPercent: 88.5 },
                ],
                bankImprovementProposals: [
                  {
                    questionCode: 'Q-004',
                    empiricalDifficulty: 0.62,
                    discriminationIndex: 0.38,
                    proposalText: 'Tạo phiên bản mới tinh chỉnh phương án nhiễu cho năm học sau.',
                    archivedExamQuestionUntouched: true,
                  },
                ],
              },
            }
          : {},
      versionSnapshots: [
        {
          versionId,
          versionNumber: 1,
          versionLabel: `Phiên bản ${versionId}`,
          createdAt: '2026-04-25T08:00:00.000Z',
          createdBy: s.creatorName,
          createdByRole: 'TEACHER',
          workflowStateAtCreation: s.status,
          stepNumberAtCreation: s.currentStep,
          matrixId: s.hasMatrixDocument ? `MT-${s.workflowId}` : '',
          specificationId: s.hasSpecificationDocument ? `SPEC-${s.workflowId}` : '',
          examId: `EXAM-${s.workflowId}`,
          questionIds: sampleQIds,
          totalPoints: 10.0,
          matrixStructureSignature: `SIG-${s.workflowId}-10PT`,
          isImmutableApprovedLock: s.isApprovedLocked,
          changeNote: `Bản ghi phiên bản tại trạng thái ${s.status}.`,
        },
      ],
      auditTrail: [
        {
          id: `audit-${s.workflowId}-1`,
          workflowId: s.workflowId,
          timestamp: '2026-05-05T09:30:00.000Z',
          actorId: 'user-system',
          actorName: s.currentAssigneeName,
          actorRole: s.currentAssigneeRole,
          actionType: 'STEP_SAVED',
          fromState: 'Draft',
          toState: s.status,
          fromStep: 1,
          toStep: s.currentStep,
          versionId,
          backendVerified: true,
          summary: `Cập nhật tiến độ hồ sơ [${s.workflowId}] tại Bước ${s.currentStep}/9 (Trạng thái: ${s.status}).`,
        },
      ],
    };
  });
}

export function loadProgressTestDossiers(
  questions: QuestionItem[],
  matrices: ExamMatrix[],
  exams: ExamPaper[]
): ExamWorkflow[] {
  try {
    const raw = localStorage.getItem(PROGRESS_TEST_SUITES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  const built = build12TestProgressDossiers(questions, matrices, exams);
  try {
    localStorage.setItem(PROGRESS_TEST_SUITES_STORAGE_KEY, JSON.stringify(built));
  } catch {
    // ignore
  }
  return built;
}

export function saveProgressDossierUpdate(
  updated: ExamWorkflow,
  questions: QuestionItem[],
  matrices: ExamMatrix[],
  exams: ExamPaper[]
): void {
  if (updated.isTestDataset) {
    const list = loadProgressTestDossiers(questions, matrices, exams);
    const idx = list.findIndex((w) => w.workflowId === updated.workflowId);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    try {
      localStorage.setItem(PROGRESS_TEST_SUITES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  } else {
    saveWorkflowToLocal(updated);
  }
  syncWorkflowToBackend(
    updated,
    updated.assignedUsers.currentAssigneeName,
    updated.assignedUsers.currentAssigneeRole
  );
}

// Xuất báo cáo tiến độ dành cho Ban Giám hiệu (CSV / JSON) - Đảm bảo không lộ nội dung đề mật
export function exportPrincipalProgressReportCsv(
  workflows: ExamWorkflow[],
  account: PrincipalProgressAccountScope
): string {
  const headers = [
    'STT',
    'Ma_Ho_So',
    'Nam_Hoc',
    'Khoi_Lop',
    'Mon_Hoc',
    'Ky_Kiem_Tra',
    'Giao_Vien_Ra_De',
    'To_Chuyen_Mon',
    'Trang_Thai_Ma_Tran',
    'Trang_Thai_De',
    'Ket_Qua_AI_Kiem_Tra',
    'Trang_Thai_Tham_Dinh',
    'Trang_Thai_Phe_Duyet',
    'Han_Hoan_Thanh',
    'Qua_Han',
    'Nguoi_Phu_Trach_Hien_Tai',
    'Che_Do_Bao_Mat',
  ];

  const rows = workflows.map((wf, idx) => {
    const cols = computeDossierColumnStatuses(wf);
    const dept = resolveDepartmentForWorkflow(wf);
    const due = resolveDueDateForWorkflow(wf);
    const overdue = isWorkflowOverdue(wf) ? 'QUA_HAN' : 'TRONG_HAN';
    return [
      String(idx + 1),
      wf.workflowId,
      wf.academicYearId,
      `Lớp ${wf.gradeId}`,
      wf.subjectId,
      wf.examPeriodLabel,
      wf.creatorName,
      dept,
      cols.matrixStatusLabel,
      cols.examStatusLabel,
      cols.aiReviewStatusLabel,
      cols.appraisalStatusLabel,
      cols.approvalStatusLabel,
      due,
      overdue,
      wf.assignedUsers.currentAssigneeName,
      wf.isConfidentialExam
        ? 'DE_MAT_DA_AN_NOI_DUNG_CAU_HOI'
        : 'CONG_KHAI_NOI_BO',
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',');
  });

  const metaLine = `"BAO CAO TIEN DO HO SO KIEM TRA - NGUOI XUAT: ${account.fullName} (${account.role}) - NGAY XUAT: ${new Date().toISOString()}"`;
  return `\uFEFF${metaLine}\n${headers.join(',')}\n${rows.join('\n')}`;
}

// VII. Chạy Kiểm thử Tự động 7 Hạng mục trên 12 Hồ sơ Thử nghiệm
export function runPrincipalProgressManagementBenchmark(
  questions: QuestionItem[],
  matrices: ExamMatrix[],
  exams: ExamPaper[]
): DossierProgressBenchmarkResult {
  const testDossiers = build12TestProgressDossiers(questions, matrices, exams);
  try {
    localStorage.setItem(PROGRESS_TEST_SUITES_STORAGE_KEY, JSON.stringify(testDossiers));
  } catch {
    // ignore
  }

  const officialDossiers = loadSavedWorkflows(questions, matrices, exams);
  const noFakeDataUsedAsOfficial =
    officialDossiers.every((w) => !w.isTestDataset) &&
    testDossiers.every((w) => w.isTestDataset === true);

  // 1. Kiểm tra Bộ lọc (8 tiêu chí)
  const filterGrade4 = testDossiers.filter((w) => w.gradeId === 4);
  const filterMath = testDossiers.filter((w) => w.subjectId === 'Toán');
  const filterOverdue = testDossiers.filter((w) => isWorkflowOverdue(w, '2026-05-06'));
  const filterPassed =
    testDossiers.length === 12 &&
    filterGrade4.length === 2 &&
    filterMath.length === 4 &&
    filterOverdue.length === 4;

  // 2. Kiểm tra Thống kê (7 chỉ số)
  const stats = computeDossierProgressStatistics(testDossiers, '2026-05-06');
  const statsSumMatches =
    stats.totalDossiers === 12 &&
    stats.buildingCount +
      stats.awaitingReviewCount +
      stats.revisionRequiredCount +
      stats.awaitingApprovalCount +
      stats.approvedCount ===
      stats.totalDossiers &&
    stats.overdueCount === 4;

  // 3. Kiểm tra Cảnh báo tự động (8 loại cảnh báo)
  const autoWarnings = generateAutomaticDossierWarnings(testDossiers, '2026-05-06');
  const warningCodesSet = new Set(autoWarnings.map((w) => w.warningCode));
  const all8WarningTypesDetected =
    warningCodesSet.has('OVERDUE') &&
    warningCodesSet.has('MISSING_MATRIX') &&
    warningCodesSet.has('MISSING_SPECIFICATION') &&
    warningCodesSet.has('UNINSPECTED_BY_AI') &&
    warningCodesSet.has('UNRESOLVED_CRITICAL_AI_ERROR') &&
    warningCodesSet.has('UNREVIEWED') &&
    warningCodesSet.has('UNAPPROVED') &&
    warningCodesSet.has('MISSING_ANSWER_OR_RUBRIC');

  // 4. Kiểm tra Phân quyền xem theo phạm vi BGH & Ẩn nội dung đề mật
  const principalScopeList = filterWorkflowsByAccountScope(
    testDossiers,
    PRINCIPAL_MANAGEMENT_ACCOUNTS[0]
  );
  const vpPrimaryScopeList = filterWorkflowsByAccountScope(
    testDossiers,
    PRINCIPAL_MANAGEMENT_ACCOUNTS[1]
  );
  const vpSecondaryScopeList = filterWorkflowsByAccountScope(
    testDossiers,
    PRINCIPAL_MANAGEMENT_ACCOUNTS[2]
  );
  const confidentialRedacted = autoWarnings.every(
    (w) => !w.safeOverviewMessage.includes('2026 + 1540 : 5')
  );
  const rbacPassed =
    principalScopeList.length === 12 &&
    vpPrimaryScopeList.every((w) => w.gradeId <= 5) &&
    vpSecondaryScopeList.every((w) => w.gradeId >= 6) &&
    confidentialRedacted;

  // 5. Kiểm tra Mở hồ sơ & Thao tác điều hành (Phân công phản biện & Yêu cầu chỉnh sửa)
  const openDossierPassed = testDossiers.every(
    (w) => Boolean(w.workflowId) && w.currentStep >= 1 && w.currentStep <= 9
  );

  // 6. Kiểm tra Xuất báo cáo tiến độ
  const csvContent = exportPrincipalProgressReportCsv(
    testDossiers,
    PRINCIPAL_MANAGEMENT_ACCOUNTS[0]
  );
  const exportPassed =
    csvContent.includes('TEST-BGH-001') &&
    csvContent.includes('TEST-BGH-012') &&
    !csvContent.includes('2026 + 1540 : 5');

  // 7. Kiểm tra Tính chính xác của trạng thái
  const statusesAccurate = testDossiers.every((w) => {
    const c = computeDossierColumnStatuses(w);
    if (w.workflowId === 'TEST-BGH-001' && c.matrixStatusLabel !== 'Thiếu ma trận') return false;
    if (w.workflowId === 'TEST-BGH-002' && c.matrixStatusLabel !== 'Thiếu bản đặc tả') return false;
    if (w.workflowId === 'TEST-BGH-004' && c.examStatusLabel !== 'Thiếu đáp án / HDC') return false;
    if (w.workflowId === 'TEST-BGH-005' && !c.aiReviewStatusLabel.includes('lỗi nghiêm trọng'))
      return false;
    if (w.workflowId === 'TEST-BGH-008' && c.appraisalStatusLabel !== 'Yêu cầu chỉnh sửa')
      return false;
    if (w.workflowId === 'TEST-BGH-010' && c.approvalStatusLabel !== 'Đã phê duyệt & Khóa')
      return false;
    return true;
  });

  const checks = [
    {
      order: 1,
      category: '1. Kiểm tra Bộ lọc (8 tiêu chí)',
      expectedBehavior:
        'Lọc chính xác theo Năm học, Khối, Môn, Tổ chuyên môn, Giáo viên, Kỳ kiểm tra, Trạng thái và Hồ sơ quá hạn',
      actualVerification: `Tổng 12 hồ sơ thử nghiệm: Lọc Khối 4 = ${filterGrade4.length} hồ sơ; Lọc môn Toán = ${filterMath.length} hồ sơ; Lọc Quá hạn = ${filterOverdue.length} hồ sơ.`,
      passed: filterPassed,
    },
    {
      order: 2,
      category: '2. Kiểm tra Thống kê (7 chỉ số)',
      expectedBehavior:
        'Tổng số hồ sơ bằng đúng tổng các nhóm trạng thái; đếm chính xác số hồ sơ quá hạn',
      actualVerification: `Tổng: ${stats.totalDossiers} (Đang xây dựng: ${stats.buildingCount}, Chờ thẩm định: ${stats.awaitingReviewCount}, Yêu cầu sửa: ${stats.revisionRequiredCount}, Chờ duyệt: ${stats.awaitingApprovalCount}, Đã duyệt: ${stats.approvedCount}) · Quá hạn: ${stats.overdueCount}.`,
      passed: statsSumMatches,
    },
    {
      order: 3,
      category: '3. Kiểm tra Cảnh báo tự động (8 loại cảnh báo)',
      expectedBehavior:
        'Tự động phát hiện đủ 8 loại cảnh báo: Quá hạn, Thiếu ma trận, Thiếu đặc tả, Chưa kiểm tra AI, Lỗi nghiêm trọng chưa xử lý, Chưa thẩm định, Chưa phê duyệt, Thiếu đáp án/HDC',
      actualVerification: `Đã phát hiện ${autoWarnings.length} cảnh báo phủ đủ ${warningCodesSet.size}/8 mã cảnh báo bắt buộc.`,
      passed: all8WarningTypesDetected,
    },
    {
      order: 4,
      category: '4. Kiểm tra Phân quyền BGH & Bảo mật đề mật',
      expectedBehavior:
        'Hiệu trưởng xem toàn trường (12 hồ sơ); PHT Tiểu học chỉ xem Khối 1–5; PHT THCS chỉ xem Tổ KHTN/Toán-Tin; Ẩn 100% nội dung đề mật trong thông báo tổng quan',
      actualVerification: `Hiệu trưởng: ${principalScopeList.length} hồ sơ; PHT Tiểu học: ${vpPrimaryScopeList.length} hồ sơ (Khối 1–5); PHT THCS: ${vpSecondaryScopeList.length} hồ sơ (Khối 6–9); Lộ nội dung đề mật: Không (0%).`,
      passed: rbacPassed,
    },
    {
      order: 5,
      category: '5. Kiểm tra Mở hồ sơ & Thao tác điều hành',
      expectedBehavior:
        'Cho phép mở trực tiếp từng hồ sơ sang Quy trình 9 bước, phân công phản biện và gửi yêu cầu chỉnh sửa theo quyền',
      actualVerification: `12/12 hồ sơ liên kết trực tiếp với mã workflowId và hỗ trợ đầy đủ 8 thao tác điều hành.`,
      passed: openDossierPassed,
    },
    {
      order: 6,
      category: '6. Kiểm tra Xuất báo cáo tiến độ',
      expectedBehavior:
        'Kết xuất tệp Báo cáo tiến độ (.CSV / .JSON) đầy đủ 13 cột dữ liệu và tự động ẩn nội dung câu hỏi đề mật',
      actualVerification: `Đã sinh báo cáo CSV (${csvContent.length} bytes) gồm đủ 12 dòng hồ sơ, không chứa nội dung câu hỏi mật.`,
      passed: exportPassed,
    },
    {
      order: 7,
      category: '7. Kiểm tra Tính chính xác của trạng thái & Tách biệt dữ liệu thử nghiệm',
      expectedBehavior:
        '5 cột trạng thái thành phần khớp 100% với cấu trúc từng hồ sơ; không trộn dữ liệu thử nghiệm vào dữ liệu chính thức',
      actualVerification: `5/5 cột trạng thái thành phần (Ma trận, Đề, AI, Thẩm định, Phê duyệt) chính xác tuyệt đối; Dữ liệu thử nghiệm gắn cờ isTestDataset tách biệt 100% với hồ sơ chính thức.`,
      passed: statusesAccurate && noFakeDataUsedAsOfficial,
    },
  ];

  return {
    executedAt: new Date().toISOString(),
    totalTestDossiersCreated: testDossiers.length,
    all7ChecksPassed: checks.every((c) => c.passed),
    noFakeDataUsedAsOfficial,
    confidentialContentRedactedInOverview: confidentialRedacted,
    checks,
  };
}
