import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileCheck,
  FileDiff,
  FileSpreadsheet,
  FileText,
  History,
  Lock,
  MessageSquarePlus,
  RotateCcw,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  AppraisalCriterionConfigItem,
  AppraisalCriterionEvaluation,
  AppraisalCriterionRating,
  AppraisalSubmissionSheet,
  AppraisalTargetType,
  ApprovalStatus,
  DataSourceFilter,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ItemFeedbackRecord,
  MenuSectionId,
  QuestionItem,
  SchoolPermissionConfig,
  SchoolRoleCode,
  SchoolUserProfile,
  StorageConfig,
  VersionDiffChangeEntry,
} from '../types/domain';
import {
  filterByDataSource,
  getApprovalStatusInfo,
} from '../services/business/assessmentRules';
import {
  createInitialCriteriaEvaluations,
  DEFAULT_12_APPRAISAL_CRITERIA,
  DEFAULT_SCHOOL_PERMISSIONS,
  generateOfficialAppraisalMinutes,
  getApplicableCriteriaForTarget,
  NINE_LIFECYCLE_STATUS_ORDER,
  verifyWorkflowTransitionAuthorization,
} from '../services/business/appraisalWorkflowService';
import {
  isSampleOrDemoExam,
  isSampleOrDemoMatrix,
  UpdateMatrixOutcome,
} from '../services/storage/repository';
import {
  executeWorkflowStateTransition,
  isSampleOrTestWorkflowDossier,
  loadSavedWorkflows,
  purgeAllSampleWorkflowsFromLocal,
  saveWorkflowToLocal,
  WORKFLOW_STATE_LABELS,
} from '../services/workflow/endToEndExamWorkflowService';

interface SchoolDepartmentSummary {
  id: string;
  departmentName: string;
  headFullName?: string | null;
  memberUserIds?: string[];
}

interface RealReviewerTeacherOption {
  id: string;
  fullName: string;
  departmentName: string;
  subjectsLabel: string;
}

function isAdminManagementDept(raw?: string | null): boolean {
  const k = String(raw || '').trim().toLowerCase();
  return k.includes('ban giám hiệu') || k.includes('quản trị');
}

function normalizeDeptKey(raw?: string | null): string {
  const s = String(raw || '').trim().replace(/\s+/g, ' ').toLowerCase();
  if (!s) return '';
  if (s === 'tổ khtn' || s === 'tổ khoa học tự nhiên (thcs)') {
    return 'tổ khoa học tự nhiên';
  }
  if (s === 'tổ khxh' || s === 'tổ khoa học xã hội (thcs)') {
    return 'tổ khoa học xã hội';
  }
  if (s === 'tổ tiểu học (khối 1-2-3)') return 'tổ 1-2-3';
  if (s === 'tổ tiểu học (khối 4-5)') return 'tổ 4-5';
  if (s === 'tổ ngoại ngữ') return 'tổ tiếng anh - gdtc';
  return s;
}

function areDeptNamesSame(a?: string | null, b?: string | null): boolean {
  const ka = normalizeDeptKey(a);
  const kb = normalizeDeptKey(b);
  return Boolean(ka && kb && ka === kb);
}

function mapProductionRoleToAppraisalRole(
  actorRole?: string,
  activeMenu?: MenuSectionId
): { role: SchoolRoleCode; defaultLabel: string } {
  switch (actorRole) {
    case 'PRINCIPAL':
    case 'SCHOOL_ADMIN':
    case 'SUPER_ADMIN':
    case 'SYSTEM_ADMIN':
      return { role: 'PRINCIPAL', defaultLabel: 'Hiệu trưởng' };
    case 'VICE_PRINCIPAL':
      return {
        role: 'VICE_PRINCIPAL',
        defaultLabel: 'Phó hiệu trưởng chuyên môn',
      };
    case 'HEAD_OF_DEPARTMENT':
      return {
        role: 'HEAD_OF_DEPARTMENT',
        defaultLabel: 'Tổ trưởng chuyên môn',
      };
    case 'PEER_REVIEWER':
    case 'REVIEWER':
      return { role: 'PEER_REVIEWER', defaultLabel: 'Giáo viên phản biện' };
    case 'TEACHER':
      return { role: 'TEACHER_AUTHOR', defaultLabel: 'Giáo viên ra đề' };
    default:
      if (activeMenu === 'bgh-approval') {
        return { role: 'PRINCIPAL', defaultLabel: 'Hiệu trưởng' };
      }
      if (
        activeMenu === 'dept-review-exam' ||
        activeMenu === 'dept-assign-reviewer'
      ) {
        return {
          role: 'HEAD_OF_DEPARTMENT',
          defaultLabel: 'Tổ trưởng chuyên môn',
        };
      }
      return {
        role: 'VICE_PRINCIPAL',
        defaultLabel: 'Phó hiệu trưởng chuyên môn',
      };
  }
}

interface AppraisalAndApprovalWorkspaceProps {
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  questions: QuestionItem[];
  config: StorageConfig;
  sourceFilter: DataSourceFilter;
  activeMenu?: MenuSectionId;
  actorRole?: string;
  schoolId?: string;
  schoolName?: string;
  actorUserId?: string;
  actorFullName?: string;
  actorRoleTitle?: string;
  actorDepartmentName?: string;
  actorPermissionCodes?: string[];
  onAddMatrix: (
    matrix: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>
  ) => ExamMatrix;
  onUpdateMatrix: (
    id: string,
    updates: Partial<Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean,
    editorNote?: string
  ) => UpdateMatrixOutcome | null;
  onAddExam: (
    exam: Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>
  ) => ExamPaper;
  onUpdateExam: (
    examId: string,
    updates: Partial<Omit<ExamPaper, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean,
    editorNote?: string
  ) => ExamPaper | null;
  onUpdateApproval: (
    examId: string,
    status: ApprovalStatus,
    reviewerName: string,
    reviewComment: string
  ) => void;
  onCleanSampleAppraisalData?: () => {
    removedMatrices: number;
    removedExams: number;
  };
  onNavigate?: (menu: MenuSectionId) => void;
  onSaveConfig: (nextConfig: StorageConfig) => void;
  onNotify: (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => void;
}

export const AppraisalAndApprovalWorkspace: React.FC<
  AppraisalAndApprovalWorkspaceProps
> = ({
  matrices,
  exams,
  config,
  sourceFilter,
  activeMenu,
  actorRole,
  schoolId,
  schoolName,
  actorUserId,
  actorFullName,
  actorRoleTitle,
  actorDepartmentName,
  actorPermissionCodes,
  onUpdateMatrix,
  onUpdateExam,
  onUpdateApproval,
  onCleanSampleAppraisalData,
  onNavigate,
  onSaveConfig,
  onNotify,
}) => {
  const effectiveSchoolId = (schoolId || 'SCHOOL_A').trim();
  const effectiveSchoolName =
    (schoolName || config.schoolName || 'Trường TH&THCS Nguyễn Đình Anh').trim();

  const isApprovalByAuthorityMenu = activeMenu === 'bgh-approval';
  const isVicePrincipalApprovalView =
    actorRole === 'VICE_PRINCIPAL' && isApprovalByAuthorityMenu;

  // Tổ trưởng chuyên môn, Giáo viên, Phản biện và Phó Hiệu trưởng không có quyền Cấu hình Phân quyền Nhà trường
  const canConfigureSchoolPermissions = useMemo(() => {
    if (
      actorRole === 'HEAD_OF_DEPARTMENT' ||
      actorRole === 'TEACHER' ||
      actorRole === 'PEER_REVIEWER' ||
      actorRole === 'REVIEWER' ||
      actorRole === 'VICE_PRINCIPAL' ||
      activeMenu === 'dept-review-exam' ||
      activeMenu === 'dept-assign-reviewer'
    ) {
      return false;
    }
    if (!actorRole) return false;
    return ['PRINCIPAL', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(
      actorRole
    );
  }, [actorRole, activeMenu]);

  // Cán bộ đang đăng nhập thực tế trên hệ thống (không dùng tài khoản giả lập)
  const activeUser: SchoolUserProfile = useMemo(() => {
    const mapped = mapProductionRoleToAppraisalRole(actorRole, activeMenu);
    const resolvedRoleLabel = actorRoleTitle?.trim() || mapped.defaultLabel;
    const resolvedFullName = actorFullName?.trim() || resolvedRoleLabel;
    const resolvedDept =
      actorDepartmentName?.trim() ||
      config.departmentName ||
      'Hội đồng Chuyên môn & Khảo thí';
    return {
      id: actorUserId?.trim() || `actor-${mapped.role.toLowerCase()}`,
      code: mapped.role,
      fullName: resolvedFullName,
      role: mapped.role,
      roleLabel: resolvedRoleLabel,
      departmentName: resolvedDept,
      subjects: [],
    };
  }, [
    actorRole,
    activeMenu,
    actorRoleTitle,
    actorFullName,
    actorDepartmentName,
    actorUserId,
    config.departmentName,
  ]);

  // Tự động làm sạch các bản ghi mẫu/thử nghiệm còn sót trong bộ nhớ khi mở không gian chính thức
  const autoCleanedRef = useRef(false);
  useEffect(() => {
    purgeAllSampleWorkflowsFromLocal();
    if (autoCleanedRef.current) return;
    const hasSampleMatrix = matrices.some((m) => isSampleOrDemoMatrix(m));
    const hasSampleExam = exams.some((e) => isSampleOrDemoExam(e));
    if (hasSampleMatrix || hasSampleExam) {
      autoCleanedRef.current = true;
      onCleanSampleAppraisalData?.();
    }
  }, [matrices, exams, onCleanSampleAppraisalData]);

  // Danh sách giáo viên thực tế của trường để phân công phản biện độc lập
  const [schoolDepartments, setSchoolDepartments] = useState<
    SchoolDepartmentSummary[]
  >([]);
  const [realTeachers, setRealTeachers] = useState<RealReviewerTeacherOption[]>(
    []
  );
  const [selectedReviewerUserId, setSelectedReviewerUserId] =
    useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const defaultAdminId =
      actorUserId ||
      (effectiveSchoolId === 'SCHOOL_B'
        ? 'user-school-admin-sia'
        : effectiveSchoolId === 'SCHOOL_C'
        ? 'user-school-admin-ddung'
        : 'user-school-admin-a');

    async function loadSchoolTeachers() {
      try {
        const res = await fetch(
          `/api/admin/departments-and-assignments?schoolId=${encodeURIComponent(
            effectiveSchoolId
          )}&adminUserId=${encodeURIComponent(defaultAdminId)}`
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;

        const depts: SchoolDepartmentSummary[] = Array.isArray(
          data?.departments
        )
          ? data.departments
              .map((d: Record<string, unknown>) => ({
                id: String(d?.id || ''),
                departmentName: String(
                  d?.departmentName || d?.name || ''
                ).trim(),
                headFullName: d?.headFullName ? String(d.headFullName) : null,
                memberUserIds: Array.isArray(d?.memberUserIds)
                  ? d.memberUserIds.map(String)
                  : [],
              }))
              .filter(
                (d: SchoolDepartmentSummary) =>
                  Boolean(d.departmentName) &&
                  !isAdminManagementDept(d.departmentName)
              )
          : [];
        setSchoolDepartments(depts);

        if (Array.isArray(data?.accounts)) {
          const teacherOptions: RealReviewerTeacherOption[] = data.accounts
            .filter((acc: Record<string, unknown>) => {
              const fullName = String(acc?.fullName || '').trim();
              const deptName = String(acc?.departmentName || '').trim();
              const roles = Array.isArray(acc?.roles)
                ? acc.roles.map(String)
                : [];
              if (!fullName || isAdminManagementDept(deptName)) return false;
              if (
                roles.includes('SYSTEM_ADMIN') ||
                roles.includes('SUPER_ADMIN') ||
                roles.includes('SCHOOL_ADMIN')
              ) {
                return false;
              }
              return true;
            })
            .map((acc: Record<string, unknown>) => {
              const allocations = Array.isArray(acc?.subjectAllocations)
                ? (acc.subjectAllocations as Array<{ subjectName?: string }>)
                : [];
              const subjSet = Array.from(
                new Set(
                  allocations
                    .map((a) => String(a?.subjectName || '').trim())
                    .filter(Boolean)
                )
              );
              return {
                id: String(acc?.id || ''),
                fullName: String(acc?.fullName || '').trim(),
                departmentName: String(acc?.departmentName || '').trim(),
                subjectsLabel: subjSet.join(', '),
              };
            });
          setRealTeachers(teacherOptions);
        }
      } catch {
        // Giữ danh sách hiện tại nếu mất kết nối tạm thời
      }
    }

    void loadSchoolTeachers();
    return () => {
      cancelled = true;
    };
  }, [effectiveSchoolId, actorUserId]);

  // Cấu hình phân quyền theo quy chế nhà trường & quyền RBAC thực tế của cán bộ
  const [permissions, setPermissions] = useState<SchoolPermissionConfig>(
    () => config.permissionConfig || DEFAULT_SCHOOL_PERMISSIONS
  );
  const hasExplicitExamApprovalRbac = useMemo(() => {
    if (!Array.isArray(actorPermissionCodes)) return false;
    return (
      actorPermissionCodes.includes('APPROVE_EXAM') ||
      actorPermissionCodes.includes('APPROVE_FINAL_EXAM')
    );
  }, [actorPermissionCodes]);

  const effectivePermissions: SchoolPermissionConfig = useMemo(
    () => ({
      ...permissions,
      allowVicePrincipalFinalApproveExam:
        permissions.allowVicePrincipalFinalApproveExam ||
        hasExplicitExamApprovalRbac,
    }),
    [permissions, hasExplicitExamApprovalRbac]
  );

  const [criteriaConfig, setCriteriaConfig] = useState<
    AppraisalCriterionConfigItem[]
  >(() => config.criteriaConfig || DEFAULT_12_APPRAISAL_CRITERIA);
  const [showPermissionConfigModal, setShowPermissionConfigModal] =
    useState<boolean>(false);
  const [showCriteriaConfigModal, setShowCriteriaConfigModal] =
    useState<boolean>(false);
  const [showCleanSampleConfirmModal, setShowCleanSampleConfirmModal] =
    useState<boolean>(false);
  const [isCleaningSampleData, setIsCleaningSampleData] =
    useState<boolean>(false);

  // Bộ lọc hàng đợi phê duyệt dành cho Mục 6 (Phê duyệt theo phân quyền)
  const [approvalQueueFilter, setApprovalQueueFilter] = useState<
    'ALL' | 'WAITING_APPROVAL' | 'APPROVED_LOCKED'
  >('ALL');

  // Đồng bộ danh sách Hồ sơ Quy trình Khảo thí Chính thức (từ Kế hoạch kiểm tra & Phân công ra đề)
  const [officialWorkflows, setOfficialWorkflows] = useState<ExamWorkflow[]>(
    () => loadSavedWorkflows([], [], [])
  );

  useEffect(() => {
    if (!isApprovalByAuthorityMenu) return;
    let cancelled = false;
    async function loadOfficialServerWorkflows() {
      try {
        const res = await fetch(
          `/api/workflows?officialOnly=true&schoolId=${encodeURIComponent(
            effectiveSchoolId
          )}`
        );
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const serverItems: ExamWorkflow[] = Array.isArray(json?.workflows)
          ? json.workflows.filter(
              (wf: ExamWorkflow) => !isSampleOrTestWorkflowDossier(wf)
            )
          : [];
        const localItems = loadSavedWorkflows([], [], []);
        const mergedMap = new Map<string, ExamWorkflow>();
        for (const item of [...serverItems, ...localItems]) {
          if (item?.workflowId && !isSampleOrTestWorkflowDossier(item)) {
            mergedMap.set(item.workflowId, item);
          }
        }
        if (!cancelled) {
          setOfficialWorkflows(Array.from(mergedMap.values()));
        }
      } catch {
        if (!cancelled) {
          setOfficialWorkflows(loadSavedWorkflows([], [], []));
        }
      }
    }
    void loadOfficialServerWorkflows();
    return () => {
      cancelled = true;
    };
  }, [isApprovalByAuthorityMenu, effectiveSchoolId]);

  // Quy trình hai cấp: QUY TRÌNH A (Ma trận & Bản đặc tả) vs QUY TRÌNH B (Đề kiểm tra)
  const [activeProcessType, setActiveProcessType] =
    useState<AppraisalTargetType>('EXAM');
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  // Tab làm việc chuyên môn trong hồ sơ
  const [activeDetailTab, setActiveDetailTab] = useState<
    | 'WORKFLOW_AND_HISTORY'
    | 'APPRAISAL_SHEET_12'
    | 'FEEDBACK_AND_DIFF'
    | 'OFFICIAL_MINUTES'
  >('WORKFLOW_AND_HISTORY');

  // State cho Phiếu thẩm định 12 tiêu chí
  const [workingEvaluations, setWorkingEvaluations] = useState<
    AppraisalCriterionEvaluation[]
  >(() => createInitialCriteriaEvaluations(DEFAULT_12_APPRAISAL_CRITERIA));
  const [sheetOverallConclusion, setSheetOverallConclusion] = useState<
    'DAT' | 'CAN_CHINH_SUA' | 'KHONG_DAT'
  >('DAT');
  const [sheetGeneralNote, setSheetGeneralNote] = useState<string>(
    'Hồ sơ bám sát chuẩn kiến thức, kỹ năng và Yêu cầu cần đạt Chương trình GDPT 2018.'
  );

  // State cho Quản lý góp ý từng câu
  const [fbItemLocation, setFbItemLocation] = useState<string>('Câu 1');
  const [fbContent, setFbContent] = useState<string>('');
  const [fbAnswerError, setFbAnswerError] = useState<string>('');
  const [fbProposedFix, setFbProposedFix] = useState<string>('');

  // State cho ghi chú chuyển trạng thái & Thông báo xử lý nghiệp vụ
  const [transitionNote, setTransitionNote] = useState<string>('');
  const [actionNoticeBanner, setActionNoticeBanner] = useState<{
    type: 'SUCCESS' | 'BLOCKED_SECURITY';
    title: string;
    detail: string;
  } | null>(null);

  // Chỉ hiển thị hồ sơ chính thức (loại bỏ hoàn toàn dữ liệu mẫu / QA / kịch bản thử nghiệm)
  const allOfficialMatrices = useMemo(
    () =>
      filterByDataSource(matrices, sourceFilter).filter(
        (m) => !isSampleOrDemoMatrix(m)
      ),
    [matrices, sourceFilter]
  );

  const allOfficialExams = useMemo(
    () =>
      filterByDataSource(exams, sourceFilter).filter(
        (e) => !isSampleOrDemoExam(e)
      ),
    [exams, sourceFilter]
  );

  const matchesApprovalQueue = (status: ApprovalStatus, isLocked?: boolean) => {
    if (!isApprovalByAuthorityMenu || approvalQueueFilter === 'ALL') {
      return true;
    }
    const lockedOrDone =
      Boolean(isLocked) ||
      status === ApprovalStatus.APPROVED ||
      status === ApprovalStatus.PUBLISHED ||
      status === ApprovalStatus.ARCHIVED;
    if (approvalQueueFilter === 'APPROVED_LOCKED') {
      return lockedOrDone;
    }
    return (
      status === ApprovalStatus.PENDING_APPROVAL ||
      status === ApprovalStatus.IN_REVIEW ||
      status === ApprovalStatus.PENDING ||
      status === ApprovalStatus.REVISED
    );
  };

  const filteredMatrices = useMemo(
    () =>
      allOfficialMatrices.filter((m) =>
        matchesApprovalQueue(m.status, m.isLocked)
      ),
    [allOfficialMatrices, isApprovalByAuthorityMenu, approvalQueueFilter]
  );

  const filteredExams = useMemo(
    () =>
      allOfficialExams.filter((e) =>
        matchesApprovalQueue(e.status, e.isLocked)
      ),
    [allOfficialExams, isApprovalByAuthorityMenu, approvalQueueFilter]
  );

  const currentMatrix = useMemo(
    () =>
      filteredMatrices.find((m) => m.id === selectedMatrixId) ||
      filteredMatrices[0] ||
      undefined,
    [filteredMatrices, selectedMatrixId]
  );

  const currentExam = useMemo(
    () =>
      filteredExams.find((e) => e.id === selectedExamId) ||
      filteredExams[0] ||
      undefined,
    [filteredExams, selectedExamId]
  );

  const activeTargetRecord =
    activeProcessType === 'MATRIX' ? currentMatrix : currentExam;

  // Lọc danh sách giáo viên phản biện hợp lệ (ưu tiên cùng tổ nếu là Tổ trưởng, không trùng người ra đề)
  const scopedReviewerOptions = useMemo(() => {
    let pool = realTeachers;
    if (actorRole === 'HEAD_OF_DEPARTMENT') {
      const managedDepts = schoolDepartments.filter(
        (d) =>
          (actorFullName &&
            d.headFullName &&
            d.headFullName.trim().toLowerCase() ===
              actorFullName.trim().toLowerCase()) ||
          (actorDepartmentName &&
            areDeptNamesSame(d.departmentName, actorDepartmentName))
      );
      if (managedDepts.length > 0) {
        const memberIdSet = new Set(
          managedDepts.flatMap((d) => d.memberUserIds || [])
        );
        const byDept = pool.filter(
          (t) =>
            memberIdSet.has(t.id) ||
            managedDepts.some((d) =>
              areDeptNamesSame(t.departmentName, d.departmentName)
            )
        );
        if (byDept.length > 0) {
          pool = byDept;
        }
      }
    }

    const authorNorm = String(activeTargetRecord?.authorName || '')
      .trim()
      .toLowerCase();
    if (authorNorm) {
      const withoutAuthor = pool.filter(
        (t) => t.fullName.trim().toLowerCase() !== authorNorm
      );
      if (withoutAuthor.length > 0) {
        pool = withoutAuthor;
      }
    }
    return pool;
  }, [
    realTeachers,
    actorRole,
    actorFullName,
    actorDepartmentName,
    schoolDepartments,
    activeTargetRecord?.authorName,
  ]);

  useEffect(() => {
    if (scopedReviewerOptions.length === 0) {
      if (selectedReviewerUserId !== '') setSelectedReviewerUserId('');
      return;
    }
    if (!scopedReviewerOptions.some((t) => t.id === selectedReviewerUserId)) {
      setSelectedReviewerUserId(scopedReviewerOptions[0].id);
    }
  }, [scopedReviewerOptions, selectedReviewerUserId]);

  const activeTargetLevelId =
    activeProcessType === 'MATRIX'
      ? currentMatrix?.levelId || EducationLevelId.PRIMARY
      : currentExam?.levelId || EducationLevelId.PRIMARY;

  const activeTargetSubject =
    activeProcessType === 'MATRIX'
      ? currentMatrix?.subject || 'Toán'
      : currentExam?.subject || 'Toán';

  const applicableCriteria = useMemo(
    () =>
      getApplicableCriteriaForTarget(
        criteriaConfig,
        activeTargetLevelId,
        activeTargetSubject
      ),
    [criteriaConfig, activeTargetLevelId, activeTargetSubject]
  );

  const handleConfirmCleanSampleData = async () => {
    setIsCleaningSampleData(true);
    try {
      const localResult = onCleanSampleAppraisalData?.() || {
        removedMatrices: 0,
        removedExams: 0,
      };
      const localRemovedWorkflows = purgeAllSampleWorkflowsFromLocal();
      let serverRemovedM = 0;
      let serverRemovedE = 0;
      let serverRemovedW = 0;
      try {
        const [appraisalRes, workflowRes] = await Promise.all([
          fetch('/api/appraisal/clean-sample-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: effectiveSchoolId }),
          }),
          fetch('/api/workflows/clean-sample-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: effectiveSchoolId }),
          }),
        ]);
        if (appraisalRes.ok) {
          const json = await appraisalRes.json();
          serverRemovedM = Number(json?.removedMatrices || 0);
          serverRemovedE = Number(json?.removedExams || 0);
        }
        if (workflowRes.ok) {
          const wfJson = await workflowRes.json();
          serverRemovedW = Number(
            wfJson?.removedWorkflowsCount ?? wfJson?.removedCount ?? 0
          );
        }
      } catch {
        // Đã làm sạch bộ nhớ phía ứng dụng
      }

      const totalRemovedMatrices = Math.max(
        localResult.removedMatrices,
        serverRemovedM
      );
      const totalRemovedExams = Math.max(
        localResult.removedExams,
        serverRemovedE
      );
      const totalRemovedWorkflows = Math.max(
        localRemovedWorkflows,
        serverRemovedW
      );

      setOfficialWorkflows(loadSavedWorkflows([], [], []));
      setSelectedMatrixId('');
      setSelectedExamId('');
      setActionNoticeBanner(null);
      setShowCleanSampleConfirmModal(false);

      const totalRemovedAll =
        totalRemovedMatrices + totalRemovedExams + totalRemovedWorkflows;

      onNotify(
        'success',
        isApprovalByAuthorityMenu
          ? 'Đã làm sạch dữ liệu phê duyệt theo phân quyền'
          : 'Đã làm sạch dữ liệu thẩm định để sử dụng chính thức',
        totalRemovedAll > 0
          ? `Đã xóa ${totalRemovedMatrices} ma trận mẫu, ${totalRemovedExams} đề kiểm tra mẫu và ${totalRemovedWorkflows} hồ sơ quy trình thử nghiệm. Hệ thống chỉ giữ lại hồ sơ chính thức của nhà trường.`
          : 'Không còn hồ sơ mẫu hoặc dữ liệu thử nghiệm nào tồn đọng. Hệ thống đã sẵn sàng cho phê duyệt và vận hành chính thức.'
      );
    } finally {
      setIsCleaningSampleData(false);
    }
  };

  // Phê duyệt hoặc trả lại Hồ sơ Quy trình Khảo thí Chính thức ngay tại Mục 6 theo phân quyền
  const handleWorkflowApprovalDecision = async (
    wf: ExamWorkflow,
    decision: 'APPROVE' | 'RETURN_REVISION'
  ) => {
    const mappedWorkflowRole =
      activeUser.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'VICE_PRINCIPAL';

    if (decision === 'APPROVE') {
      if (wf.status === 'MatrixReview') {
        if (
          activeUser.role === 'VICE_PRINCIPAL' &&
          !effectivePermissions.allowVicePrincipalFinalApproveMatrix
        ) {
          onNotify(
            'error',
            'Ngoài phạm vi phân quyền phê duyệt Ma trận',
            'Theo quy chế hiện hành của nhà trường, Ma trận đề kiểm tra do Hiệu trưởng trực tiếp phê duyệt.'
          );
          return;
        }
        const res = await executeWorkflowStateTransition({
          workflow: wf,
          targetState: 'MatrixApproved',
          targetStep: 2,
          actorId: activeUser.id,
          actorName: activeUser.fullName,
          actorRole: mappedWorkflowRole,
          actionSummary: `${activeUser.fullName} (${activeUser.roleLabel}) phê duyệt Ma trận & Bản đặc tả theo phân quyền, cho phép triển khai biên soạn đề chính thức.`,
        });
        if (!res.ok || !res.updatedWorkflow) {
          onNotify(
            'error',
            'Không thể chuyển bước quy trình',
            res.errorMessage || 'Vui lòng kiểm tra trạng thái hồ sơ hiện tại.'
          );
          return;
        }
        const nextList = saveWorkflowToLocal(res.updatedWorkflow);
        setOfficialWorkflows(nextList);
        onNotify(
          'success',
          `Đã phê duyệt Ma trận hồ sơ ${wf.workflowId}`,
          `Hồ sơ "${wf.title}" đã được phê duyệt Ma trận và mở khóa bước tạo đề kiểm tra.`
        );
        return;
      }

      if (wf.status === 'AwaitingApproval') {
        if (
          activeUser.role === 'VICE_PRINCIPAL' &&
          !effectivePermissions.allowVicePrincipalFinalApproveExam
        ) {
          onNotify(
            'warning',
            'Chưa được ủy quyền phê duyệt cuối cùng Đề kiểm tra',
            'Theo phân quyền hiện hành, Phó Hiệu trưởng rà soát hồ sơ và trình Hiệu trưởng ký phê duyệt cuối cùng Đề kiểm tra.'
          );
          return;
        }
        const res = await executeWorkflowStateTransition({
          workflow: wf,
          targetState: 'Approved',
          targetStep: 7,
          actorId: activeUser.id,
          actorName: activeUser.fullName,
          actorRole: mappedWorkflowRole,
          actionSummary: `${activeUser.fullName} (${activeUser.roleLabel}) phê duyệt chính thức và khóa phiên bản hồ sơ đề kiểm tra theo phân quyền.`,
          lockApprovedVersion: true,
        });
        if (!res.ok || !res.updatedWorkflow) {
          onNotify(
            'error',
            'Không thể phê duyệt hồ sơ quy trình',
            res.errorMessage || 'Vui lòng kiểm tra điều kiện phê duyệt hồ sơ.'
          );
          return;
        }
        const nextList = saveWorkflowToLocal(res.updatedWorkflow);
        setOfficialWorkflows(nextList);
        onNotify(
          'success',
          `Đã phê duyệt chính thức hồ sơ ${wf.workflowId}`,
          `Phiên bản đề kiểm tra của "${wf.title}" đã được phê duyệt và khóa bất biến.`
        );
        return;
      }
    }

    if (decision === 'RETURN_REVISION') {
      const res = await executeWorkflowStateTransition({
        workflow: wf,
        targetState: 'RevisionRequired',
        targetStep: 6,
        actorId: activeUser.id,
        actorName: activeUser.fullName,
        actorRole: mappedWorkflowRole,
        actionSummary:
          transitionNote.trim() ||
          `${activeUser.fullName} (${activeUser.roleLabel}) trả lại hồ sơ yêu cầu chỉnh sửa chuyên môn.`,
      });
      if (!res.ok || !res.updatedWorkflow) {
        onNotify(
          'error',
          'Không thể trả lại hồ sơ ở bước hiện tại',
          res.errorMessage || 'Trạng thái hiện tại chưa hỗ trợ chuyển hoàn trả trực tiếp.'
        );
        return;
      }
      const nextList = saveWorkflowToLocal(res.updatedWorkflow);
      setOfficialWorkflows(nextList);
      setTransitionNote('');
      onNotify(
        'info',
        `Đã trả lại hồ sơ ${wf.workflowId} để chỉnh sửa`,
        `Giáo viên phụ trách sẽ nhận yêu cầu cập nhật phiên bản mới.`
      );
    }
  };

  // Lưu cấu hình phân quyền nhà trường
  const handleUpdatePermissionConfig = (nextPerm: SchoolPermissionConfig) => {
    if (!canConfigureSchoolPermissions) {
      onNotify(
        'error',
        'Không có thẩm quyền cấu hình',
        'Chức vụ hiện tại không có quyền thay đổi Cấu hình Phân quyền Nhà trường.'
      );
      return;
    }
    setPermissions(nextPerm);
    onSaveConfig({
      ...config,
      permissionConfig: nextPerm,
      criteriaConfig,
    });
    onNotify(
      'info',
      'Đã cập nhật Quy chế Phân quyền Nhà trường',
      'Hệ thống áp dụng tức thời bộ quy tắc phân quyền mới cho các bước phê duyệt và phát hành.'
    );
  };

  // Xử lý chuyển trạng thái hồ sơ có kiểm tra phân quyền nghiêm ngặt
  const handleExecuteStatusTransition = (nextStatus: ApprovalStatus) => {
    if (activeProcessType === 'MATRIX' && currentMatrix) {
      const hasSheet = Boolean(
        currentMatrix.appraisalSheets &&
          currentMatrix.appraisalSheets.length > 0
      );
      const authCheck = verifyWorkflowTransitionAuthorization({
        targetType: 'MATRIX',
        currentStatus: currentMatrix.status,
        nextStatus,
        actor: activeUser,
        permissions: effectivePermissions,
        hasPeerReviewSheet: hasSheet,
      });

      if (!authCheck.allowed) {
        setActionNoticeBanner({
          type: 'BLOCKED_SECURITY',
          title: `Chặn thao tác theo thẩm quyền (${activeUser.roleLabel})`,
          detail: authCheck.reason,
        });
        onNotify('error', 'Không có thẩm quyền thực hiện', authCheck.reason);
        return;
      }

      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const noteToSave = transitionNote.trim() || authCheck.reason;

      const nextHistory = [
        {
          version: currentMatrix.version || 1,
          updatedAt: nowStr,
          editorName: activeUser.fullName,
          editorRole: activeUser.role,
          note: noteToSave,
          status: nextStatus,
        },
        ...(currentMatrix.versionHistory || []),
      ];

      onUpdateMatrix(
        currentMatrix.id,
        {
          status: nextStatus,
          isLocked: nextStatus === ApprovalStatus.APPROVED,
          headOfDepartmentName:
            activeUser.role === 'HEAD_OF_DEPARTMENT'
              ? activeUser.fullName
              : currentMatrix.headOfDepartmentName,
          finalApproverName:
            nextStatus === ApprovalStatus.APPROVED
              ? activeUser.fullName
              : currentMatrix.finalApproverName,
          finalApproverRole:
            nextStatus === ApprovalStatus.APPROVED
              ? activeUser.role
              : currentMatrix.finalApproverRole,
          versionHistory: nextHistory,
        },
        false,
        noteToSave
      );

      setTransitionNote('');
      setActionNoticeBanner({
        type: 'SUCCESS',
        title: `Quy trình A (Ma trận): Đã chuyển sang "${
          getApprovalStatusInfo(nextStatus).label
        }"`,
        detail: `${activeUser.fullName} (${activeUser.roleLabel}) đã thực hiện: ${noteToSave}`,
      });
      onNotify(
        'success',
        `Đã cập nhật trạng thái Ma trận ${currentMatrix.code}`,
        noteToSave
      );
      return;
    }

    if (activeProcessType === 'EXAM' && currentExam) {
      const linkedMatrix = allOfficialMatrices.find(
        (m) => m.id === currentExam.matrixId
      );
      const hasSheet = Boolean(
        currentExam.appraisalSheets && currentExam.appraisalSheets.length > 0
      );

      const authCheck = verifyWorkflowTransitionAuthorization({
        targetType: 'EXAM',
        currentStatus: currentExam.status,
        nextStatus,
        actor: activeUser,
        permissions: effectivePermissions,
        hasPeerReviewSheet: hasSheet,
        matrixStatusOfExam: linkedMatrix?.status || ApprovalStatus.APPROVED,
      });

      if (!authCheck.allowed) {
        setActionNoticeBanner({
          type: 'BLOCKED_SECURITY',
          title: `Chặn thao tác theo quy chế (${activeUser.roleLabel})`,
          detail: authCheck.reason,
        });
        onNotify('error', 'Chặn thao tác theo quy chế', authCheck.reason);
        return;
      }

      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const noteToSave = transitionNote.trim() || authCheck.reason;

      onUpdateExam(currentExam.id, {
        headOfDepartmentName:
          activeUser.role === 'HEAD_OF_DEPARTMENT'
            ? activeUser.fullName
            : currentExam.headOfDepartmentName,
        departmentConfirmedAt:
          nextStatus === ApprovalStatus.PENDING_APPROVAL
            ? nowStr
            : currentExam.departmentConfirmedAt,
        finalApproverName:
          nextStatus === ApprovalStatus.APPROVED
            ? activeUser.fullName
            : currentExam.finalApproverName,
        finalApproverRole:
          nextStatus === ApprovalStatus.APPROVED
            ? activeUser.role
            : currentExam.finalApproverRole,
        publishedAt:
          nextStatus === ApprovalStatus.PUBLISHED
            ? nowStr
            : currentExam.publishedAt,
        publishedByName:
          nextStatus === ApprovalStatus.PUBLISHED
            ? activeUser.fullName
            : currentExam.publishedByName,
      });

      onUpdateApproval(
        currentExam.id,
        nextStatus,
        `${activeUser.fullName} (${activeUser.roleLabel})`,
        noteToSave
      );

      setTransitionNote('');
      setActionNoticeBanner({
        type: 'SUCCESS',
        title: `Quy trình B (Đề kiểm tra): Đã chuyển sang "${
          getApprovalStatusInfo(nextStatus).label
        }"`,
        detail: `${activeUser.fullName} (${activeUser.roleLabel}) đã thực hiện: ${noteToSave}`,
      });
      onNotify(
        'success',
        `Đã cập nhật trạng thái Đề ${currentExam.code}`,
        noteToSave
      );
    }
  };

  // Phân công Giáo viên phản biện độc lập từ danh sách giáo viên thực của trường
  const handleAssignPeerReviewer = () => {
    if (
      activeUser.role !== 'HEAD_OF_DEPARTMENT' &&
      activeUser.role !== 'VICE_PRINCIPAL' &&
      activeUser.role !== 'PRINCIPAL'
    ) {
      onNotify(
        'error',
        'Không có quyền phân công phản biện',
        'Chỉ Tổ trưởng chuyên môn hoặc Ban Giám hiệu mới có thẩm quyền phân công giáo viên phản biện.'
      );
      return;
    }

    const reviewerUser = scopedReviewerOptions.find(
      (u) => u.id === selectedReviewerUserId
    );
    if (!reviewerUser) {
      onNotify(
        'warning',
        'Chưa chọn giáo viên phản biện',
        'Vui lòng chọn giáo viên phản biện thuộc danh sách giáo viên của nhà trường.'
      );
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (activeProcessType === 'MATRIX' && currentMatrix) {
      onUpdateMatrix(
        currentMatrix.id,
        {
          assignedReviewerId: reviewerUser.id,
          assignedReviewerName: reviewerUser.fullName,
          headOfDepartmentName:
            activeUser.role === 'HEAD_OF_DEPARTMENT'
              ? activeUser.fullName
              : currentMatrix.headOfDepartmentName,
          status: ApprovalStatus.IN_REVIEW,
          versionHistory: [
            {
              version: currentMatrix.version || 1,
              updatedAt: nowStr,
              editorName: activeUser.fullName,
              editorRole: activeUser.role,
              note: `${activeUser.fullName} (${activeUser.roleLabel}) phân công ${reviewerUser.fullName} thẩm định phản biện Ma trận & Bản đặc tả.`,
              status: ApprovalStatus.IN_REVIEW,
            },
            ...(currentMatrix.versionHistory || []),
          ],
        },
        false
      );
      onNotify(
        'success',
        'Đã phân công Giáo viên phản biện Ma trận',
        `Đã giao hồ sơ ${currentMatrix.code} cho ${reviewerUser.fullName} và chuyển sang "Đang thẩm định".`
      );
    } else if (activeProcessType === 'EXAM' && currentExam) {
      onUpdateExam(currentExam.id, {
        assignedReviewerId: reviewerUser.id,
        assignedReviewerName: reviewerUser.fullName,
        headOfDepartmentName:
          activeUser.role === 'HEAD_OF_DEPARTMENT'
            ? activeUser.fullName
            : currentExam.headOfDepartmentName,
      });
      onUpdateApproval(
        currentExam.id,
        ApprovalStatus.IN_REVIEW,
        `${activeUser.fullName} (${activeUser.roleLabel})`,
        `Phân công ${reviewerUser.fullName} phản biện độc lập Đề kiểm tra.`
      );
      onNotify(
        'success',
        'Đã phân công Giáo viên phản biện Đề kiểm tra',
        `Đã giao đề ${currentExam.code} cho ${reviewerUser.fullName} và chuyển sang "Đang thẩm định".`
      );
    }
  };

  // Khởi tạo phiên bản mới hợp lệ từ hồ sơ đã khóa phê duyệt
  const handleCreateNewOfficialVersionFromLocked = () => {
    if (activeProcessType === 'MATRIX' && currentMatrix) {
      const outcome = onUpdateMatrix(
        currentMatrix.id,
        { status: ApprovalStatus.DRAFT },
        true,
        `${activeUser.fullName} khởi tạo phiên bản mới từ hồ sơ ${currentMatrix.code} đã khóa để điều chỉnh chuyên môn.`
      );
      if (outcome?.matrix) {
        setSelectedMatrixId(outcome.matrix.id);
        onNotify(
          'success',
          `Đã khởi tạo phiên bản mới (${outcome.matrix.code})`,
          'Bản gốc đã phê duyệt được giữ nguyên khóa bảo vệ; phiên bản mới đã sẵn sàng để cập nhật.'
        );
      }
    } else if (activeProcessType === 'EXAM' && currentExam) {
      const created = onUpdateExam(
        currentExam.id,
        { status: ApprovalStatus.DRAFT },
        true,
        `${activeUser.fullName} khởi tạo phiên bản mới từ đề ${currentExam.code} đã khóa để điều chỉnh chuyên môn.`
      );
      if (created) {
        setSelectedExamId(created.id);
        onNotify(
          'success',
          `Đã khởi tạo phiên bản mới (${created.code})`,
          'Đề gốc đã phê duyệt được giữ nguyên khóa bảo vệ; phiên bản mới đã sẵn sàng để cập nhật.'
        );
      }
    }
  };

  // Lưu Phiếu thẩm định 12 tiêu chí
  const handleSubmit12CriteriaSheet = () => {
    if (activeUser.role === 'TEACHER_AUTHOR') {
      onNotify(
        'error',
        'Giáo viên ra đề không tự thẩm định đề của mình',
        'Chỉ Giáo viên phản biện, Tổ trưởng chuyên môn hoặc Ban Giám hiệu mới thực hiện lập Phiếu thẩm định 12 tiêu chí.'
      );
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const targetId =
      activeProcessType === 'MATRIX'
        ? currentMatrix?.id || ''
        : currentExam?.id || '';
    const targetVer =
      activeProcessType === 'MATRIX'
        ? currentMatrix?.version || 1
        : currentExam?.version || 1;

    const newSheet: AppraisalSubmissionSheet = {
      id: `sheet-${Date.now()}`,
      targetType: activeProcessType,
      targetRecordId: targetId,
      targetVersion: targetVer,
      reviewerId: activeUser.id,
      reviewerName: `${activeUser.fullName} (${activeUser.roleLabel})`,
      reviewerRole: activeUser.role,
      submittedAt: nowStr,
      criteriaEvaluations: workingEvaluations.filter((ev) =>
        applicableCriteria.some((c) => c.code === ev.criterionCode)
      ),
      overallConclusion: sheetOverallConclusion,
      generalSummaryNote: sheetGeneralNote.trim(),
    };

    const nextStatusAfterSheet =
      sheetOverallConclusion === 'DAT'
        ? ApprovalStatus.IN_REVIEW
        : ApprovalStatus.REVISION_REQUIRED;

    if (activeProcessType === 'MATRIX' && currentMatrix) {
      const existingSheets = currentMatrix.appraisalSheets || [];
      onUpdateMatrix(
        currentMatrix.id,
        {
          appraisalSheets: [newSheet, ...existingSheets],
          status: nextStatusAfterSheet,
        },
        false,
        `Hoàn thành Phiếu thẩm định 12 tiêu chí – Kết luận: ${
          sheetOverallConclusion === 'DAT'
            ? 'ĐẠT'
            : sheetOverallConclusion === 'CAN_CHINH_SUA'
            ? 'CẦN CHỈNH SỬA'
            : 'KHÔNG ĐẠT'
        }.`
      );
    } else if (activeProcessType === 'EXAM' && currentExam) {
      const existingSheets = currentExam.appraisalSheets || [];
      onUpdateExam(currentExam.id, {
        appraisalSheets: [newSheet, ...existingSheets],
      });
      onUpdateApproval(
        currentExam.id,
        nextStatusAfterSheet,
        `${activeUser.fullName} (${activeUser.roleLabel})`,
        `Lập Phiếu thẩm định 12 tiêu chí – Kết luận: ${
          sheetOverallConclusion === 'DAT' ? 'Đạt yêu cầu' : 'Yêu cầu chỉnh sửa'
        }. ${sheetGeneralNote}`
      );
    }

    onNotify(
      'success',
      'Đã lưu Phiếu thẩm định 12 tiêu chí',
      `Phiếu thẩm định của ${activeUser.fullName} đã được lưu vào hồ sơ và cập nhật vào Biên bản thẩm định.`
    );
  };

  // Thêm góp ý trực tiếp vào từng câu / dòng ma trận
  const handleAddItemFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbContent.trim() || !fbProposedFix.trim()) {
      onNotify(
        'warning',
        'Thiếu nội dung góp ý',
        'Vui lòng nhập rõ nội dung nhận xét chuyên môn và phương án đề xuất chỉnh sửa.'
      );
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const targetId =
      activeProcessType === 'MATRIX'
        ? currentMatrix?.id || ''
        : currentExam?.id || '';
    const targetVer =
      activeProcessType === 'MATRIX'
        ? currentMatrix?.version || 1
        : currentExam?.version || 1;

    const newFeedback: ItemFeedbackRecord = {
      id: `fb-${Date.now()}`,
      targetType: activeProcessType,
      targetRecordId: targetId,
      versionAtFeedback: targetVer,
      itemNumberOrCode: fbItemLocation.trim(),
      reviewerName: `${activeUser.fullName} (${activeUser.roleLabel})`,
      reviewerRole: activeUser.role,
      createdAt: nowStr,
      feedbackContent: fbContent.trim(),
      answerErrorNote: fbAnswerError.trim() || undefined,
      proposedFix: fbProposedFix.trim(),
      resolutionStatus: 'OPEN',
    };

    if (activeProcessType === 'MATRIX' && currentMatrix) {
      onUpdateMatrix(
        currentMatrix.id,
        {
          itemFeedbacks: [newFeedback, ...(currentMatrix.itemFeedbacks || [])],
        },
        false,
        `Góp ý tại ${newFeedback.itemNumberOrCode}: ${newFeedback.feedbackContent}`
      );
    } else if (activeProcessType === 'EXAM' && currentExam) {
      onUpdateExam(currentExam.id, {
        itemFeedbacks: [newFeedback, ...(currentExam.itemFeedbacks || [])],
      });
    }

    setFbContent('');
    setFbAnswerError('');
    setFbProposedFix('');
    onNotify(
      'success',
      'Đã ghi nhận góp ý phản biện',
      `Góp ý tại "${newFeedback.itemNumberOrCode}" đã được lưu vĩnh viễn vào lịch sử phản biện.`
    );
  };

  // Tiếp thu góp ý, chỉnh sửa và tạo bản đối chiếu sự khác biệt giữa 2 phiên bản
  const handleResolveFeedbackWithVersionDiff = (
    feedback: ItemFeedbackRecord
  ) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const resolvedEditorName = activeUser.fullName;
    const resolvedEditorRole = activeUser.role;

    if (activeProcessType === 'MATRIX' && currentMatrix) {
      const oldVer = currentMatrix.version || 1;
      const newVer = oldVer + 1;
      const diffEntry: VersionDiffChangeEntry = {
        id: `diff-${Date.now()}`,
        fromVersion: oldVer,
        toVersion: newVer,
        locationLabel: feedback.itemNumberOrCode,
        beforeContent:
          feedback.beforeTextSnapshot ||
          `[Phiên bản v${oldVer}] Phân bổ trước khi chỉnh sửa tại ${feedback.itemNumberOrCode}`,
        afterContent: `[Phiên bản v${newVer}] Đã điều chỉnh theo đề xuất: "${feedback.proposedFix}"`,
        editorName: resolvedEditorName,
        editorRole: resolvedEditorRole,
        editedAt: nowStr,
        changeReason: `Tiếp thu góp ý của ${feedback.reviewerName}: ${feedback.feedbackContent}`,
      };

      const updatedFeedbacks = (currentMatrix.itemFeedbacks || []).map((f) =>
        f.id === feedback.id
          ? {
              ...f,
              resolutionStatus: 'RESOLVED' as const,
              resolvedByName: resolvedEditorName,
              resolvedAt: nowStr,
              resolutionSummary: `Đã chỉnh sửa trong phiên bản v${newVer}: ${feedback.proposedFix}`,
            }
          : f
      );

      onUpdateMatrix(
        currentMatrix.id,
        {
          version: newVer,
          status: ApprovalStatus.REVISED,
          itemFeedbacks: updatedFeedbacks,
          versionDiffs: [diffEntry, ...(currentMatrix.versionDiffs || [])],
        },
        false,
        `${resolvedEditorName} tiếp thu góp ý tại ${feedback.itemNumberOrCode}, cập nhật lên v${newVer} và chuyển sang "Đã chỉnh sửa".`
      );
    } else if (activeProcessType === 'EXAM' && currentExam) {
      const oldVer = currentExam.version || 1;
      const newVer = oldVer + 1;
      const diffEntry: VersionDiffChangeEntry = {
        id: `diff-${Date.now()}`,
        fromVersion: oldVer,
        toVersion: newVer,
        locationLabel: feedback.itemNumberOrCode,
        beforeContent:
          feedback.beforeTextSnapshot ||
          `[Phiên bản v${oldVer}] Nội dung câu hỏi / hướng dẫn chấm tại ${feedback.itemNumberOrCode} trước khi sửa`,
        afterContent: `[Phiên bản v${newVer}] Đã cập nhật câu lệnh & biểu điểm theo góp ý: "${feedback.proposedFix}"`,
        editorName: resolvedEditorName,
        editorRole: resolvedEditorRole,
        editedAt: nowStr,
        changeReason: `Khắc phục góp ý phản biện của ${feedback.reviewerName}`,
      };

      const updatedFeedbacks = (currentExam.itemFeedbacks || []).map((f) =>
        f.id === feedback.id
          ? {
              ...f,
              resolutionStatus: 'RESOLVED' as const,
              resolvedByName: resolvedEditorName,
              resolvedAt: nowStr,
              resolutionSummary: `Đã cập nhật trong phiên bản v${newVer}: ${feedback.proposedFix}`,
            }
          : f
      );

      onUpdateExam(currentExam.id, {
        version: newVer,
        itemFeedbacks: updatedFeedbacks,
        versionDiffs: [diffEntry, ...(currentExam.versionDiffs || [])],
      });
      onUpdateApproval(
        currentExam.id,
        ApprovalStatus.REVISED,
        resolvedEditorName,
        `Tiếp thu góp ý tại ${feedback.itemNumberOrCode}, hoàn thành chỉnh sửa phiên bản v${newVer}.`
      );
    }

    onNotify(
      'success',
      'Đã chỉnh sửa & ghi nhận so sánh 2 phiên bản',
      'Giữ nguyên lịch sử phản biện cũ và cập nhật bảng đối chiếu sự khác biệt giữa 2 phiên bản.'
    );
  };

  // Tạo Biên bản thẩm định tự động cho hồ sơ đang chọn
  const officialMinutes = useMemo(() => {
    return generateOfficialAppraisalMinutes({
      schoolName: effectiveSchoolName,
      departmentName: activeUser.departmentName || config.departmentName,
      targetType: activeProcessType,
      matrix: activeProcessType === 'MATRIX' ? currentMatrix : undefined,
      exam: activeProcessType === 'EXAM' ? currentExam : undefined,
    });
  }, [
    effectiveSchoolName,
    activeUser.departmentName,
    config.departmentName,
    activeProcessType,
    currentMatrix,
    currentExam,
  ]);

  // Xuất Biên bản thẩm định ra file Word (.doc)
  const handleExportAppraisalMinutesToWord = () => {
    const m = officialMinutes;
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${m.minutesCode}</title></head>
      <body style="font-family:'Times New Roman',serif; font-size:12pt; line-height:1.45;">
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
          <tr>
            <td style="width:45%; text-align:center; vertical-align:top;">
              <p style="margin:0; font-weight:bold; text-transform:uppercase;">${m.schoolName}</p>
              <p style="margin:2px 0; font-weight:bold; text-transform:uppercase;">${m.departmentName}</p>
              <p style="margin:2px 0;">Số: ${m.minutesCode}</p>
            </td>
            <td style="width:55%; text-align:center; vertical-align:top;">
              <p style="margin:0; font-weight:bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p style="margin:2px 0; font-weight:bold;">Độc lập - Tự do - Hạnh phúc</p>
            </td>
          </tr>
        </table>
        <h2 style="text-align:center; text-transform:uppercase; margin:16px 0 4px 0;">
          BIÊN BẢN THẨM ĐỊNH VÀ PHÊ DUYỆT ${
            m.targetType === 'MATRIX'
              ? 'MA TRẬN, BẢN ĐẶC TẢ ĐỀ KIỂM TRA'
              : 'ĐỀ KIỂM TRA, ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM'
          }
        </h2>
        <p style="text-align:center; margin:0 0 16px 0;"><em>Thời gian lập biên bản: ${
          m.appraisalTime
        }</em></p>
        <p><strong>1. Đơn vị trường học:</strong> ${m.schoolName}</p>
        <p><strong>2. Bộ phận chuyên môn:</strong> ${m.departmentName}</p>
        <p><strong>3. Môn học, Khối lớp:</strong> Môn ${m.subject} – Lớp ${
      m.grade
    }</p>
        <p><strong>4. Tên hồ sơ thẩm định:</strong> ${m.targetTitle} (Mã: ${
      m.targetCode
    } – Phiên bản v${m.targetVersion})</p>
        <p><strong>5. Thành phần tham gia:</strong></p>
        <ul>
          <li>Người ra đề: <strong>${m.authorName}</strong></li>
          <li>Tổ trưởng chuyên môn: <strong>${m.headOfDepartmentName}</strong></li>
          <li>Người phản biện chuyên môn: <strong>${m.peerReviewerName}</strong></li>
          <li>Người phê duyệt (${m.approverRoleLabel}): <strong>${
      m.approverName
    }</strong></li>
        </ul>
        <p><strong>6. Kết quả đánh giá chuyên môn (12 tiêu chí):</strong> ${
          m.evaluationSummary
        }</p>
        <p><strong>7. Nội dung yêu cầu điều chỉnh & lịch sử tiếp thu:</strong></p>
        <ul>
          ${
            m.adjustmentRequests.length > 0
              ? m.adjustmentRequests.map((r) => `<li>${r}</li>`).join('')
              : '<li>Không có nội dung tồn đọng cần điều chỉnh thêm.</li>'
          }
        </ul>
        <p><strong>8. Kết luận:</strong> ${m.conclusionText}</p>
        <p><strong>9. Xác nhận nghiệp vụ của các bên trên hệ thống:</strong></p>
        <p><em>(Ghi chú pháp lý: Hệ thống chỉ ghi nhận trạng thái xác nhận thực tế theo tài khoản phân quyền; không tự tạo chữ ký điện tử giả khi chưa kết nối chứng thư số hợp lệ).</em></p>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;" border="1" cellpadding="8">
          <tr>
            ${m.confirmations
              .map(
                (c) => `
              <td style="width:25%; text-align:center; vertical-align:top;">
                <p style="margin:0; font-weight:bold;">${c.partyTitle}</p>
                <p style="margin:6px 0; font-size:10pt;">${c.statusLabel}</p>
                <p style="margin:12px 0 0 0; font-weight:bold;">${c.personName}</p>
              </td>
            `
              )
              .join('')}
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${m.minutesCode}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      `Đã xuất Biên bản thẩm định (${m.minutesCode}.doc)`,
      'Biên bản đầy đủ 12 mục thông tin hành chính chuẩn A4 và tuân thủ quy định không tạo chữ ký giả.'
    );
  };

  const activeTargetStatus =
    activeTargetRecord?.status || ApprovalStatus.DRAFT;
  const activeTargetLocked = Boolean(
    activeTargetRecord?.isLocked ||
      activeTargetStatus === ApprovalStatus.APPROVED ||
      activeTargetStatus === ApprovalStatus.PUBLISHED ||
      activeTargetStatus === ApprovalStatus.ARCHIVED
  );
  const activeFeedbacks = activeTargetRecord?.itemFeedbacks || [];
  const activeDiffs = activeTargetRecord?.versionDiffs || [];
  const activeSheets = activeTargetRecord?.appraisalSheets || [];

  const headerBadgeText = useMemo(() => {
    if (actorRole === 'VICE_PRINCIPAL' && activeMenu === 'bgh-approval') {
      return 'PHÓ HIỆU TRƯỞNG · MỤC 6. PHÊ DUYỆT THEO PHÂN QUYỀN CHÍNH THỨC';
    }
    if (actorRole === 'VICE_PRINCIPAL' || activeMenu === 'approval') {
      return 'PHÓ HIỆU TRƯỞNG · MỤC 5. THẨM ĐỊNH CHUYÊN MÔN CHÍNH THỨC';
    }
    if (actorRole === 'PRINCIPAL' || activeMenu === 'bgh-approval') {
      return 'HIỆU TRƯỞNG · THẨM ĐỊNH & PHÊ DUYỆT HỒ SƠ CHÍNH THỨC';
    }
    if (activeMenu === 'dept-assign-reviewer') {
      return 'TỔ TRƯỞNG CHUYÊN MÔN · PHÂN CÔNG GIÁO VIÊN PHẢN BIỆN';
    }
    if (
      actorRole === 'HEAD_OF_DEPARTMENT' ||
      activeMenu === 'dept-review-exam'
    ) {
      return 'TỔ TRƯỞNG CHUYÊN MÔN · MỤC 6. THẨM ĐỊNH ĐỀ CHÍNH THỨC';
    }
    return 'THẨM ĐỊNH CHUYÊN MÔN, PHẢN BIỆN & PHÊ DUYỆT HỒ SƠ KHẢO THÍ';
  }, [actorRole, activeMenu]);

  const waitingMatricesCount = useMemo(
    () =>
      allOfficialMatrices.filter(
        (m) =>
          m.status === ApprovalStatus.PENDING_APPROVAL ||
          m.status === ApprovalStatus.IN_REVIEW ||
          m.status === ApprovalStatus.PENDING ||
          m.status === ApprovalStatus.REVISED
      ).length,
    [allOfficialMatrices]
  );

  const waitingExamsCount = useMemo(
    () =>
      allOfficialExams.filter(
        (e) =>
          e.status === ApprovalStatus.PENDING_APPROVAL ||
          e.status === ApprovalStatus.IN_REVIEW ||
          e.status === ApprovalStatus.PENDING ||
          e.status === ApprovalStatus.REVISED
      ).length,
    [allOfficialExams]
  );

  const approvedLockedCount = useMemo(
    () =>
      (activeProcessType === 'MATRIX'
        ? allOfficialMatrices
        : allOfficialExams
      ).filter(
        (item) =>
          Boolean(item.isLocked) ||
          item.status === ApprovalStatus.APPROVED ||
          item.status === ApprovalStatus.PUBLISHED ||
          item.status === ApprovalStatus.ARCHIVED
      ).length,
    [activeProcessType, allOfficialMatrices, allOfficialExams]
  );

  return (
    <div className="space-y-6">
      {/* KHỐI 1: HEADER CHÍNH THỨC THEO VAI TRÒ & QUY CHẾ NHÀ TRƯỜNG */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{headerBadgeText}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isApprovalByAuthorityMenu
                ? 'Phê Duyệt Hồ Sơ Khảo Thí Theo Phân Quyền Chính Thức'
                : 'Thẩm Định Ma Trận, Bản Đặc Tả & Đề Kiểm Tra Chính Thức'}
            </h1>
            <p className="text-xs text-slate-600">
              Đơn vị: <strong className="text-slate-900">{effectiveSchoolName}</strong> · Năm học:{' '}
              <strong className="text-slate-900">{config.academicYear}</strong> ·{' '}
              {isApprovalByAuthorityMenu
                ? 'Thực hiện phê duyệt, khóa phiên bản bất biến hoặc trình ký các hồ sơ Ma trận, Bản đặc tả và Đề kiểm tra theo đúng phạm vi thẩm quyền được giao.'
                : 'Tách biệt thẩm định Ma trận và thẩm định Đề kiểm tra, khóa cứng phiên bản sau phê duyệt.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCleanSampleConfirmModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Làm sạch dữ liệu mẫu
            </button>
            {canConfigureSchoolPermissions && (
              <button
                type="button"
                onClick={() => setShowPermissionConfigModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer transition-colors"
              >
                <Settings2 className="w-4 h-4 text-blue-700" />
                Cấu hình Phân quyền Nhà trường
              </button>
            )}
            {!isVicePrincipalApprovalView && (
              <button
                type="button"
                onClick={() => setShowCriteriaConfigModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer transition-colors"
              >
                <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                Cấu hình 12 Tiêu chí theo Môn/Cấp
              </button>
            )}
          </div>
        </div>

        {/* Thanh thông tin cán bộ đang thực hiện & Quy chế hiện hành */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-700">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              Cán bộ phê duyệt: {activeUser.fullName} ({activeUser.roleLabel})
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Dữ liệu chính thức sạch (0 hồ sơ mẫu)
            </span>
          </div>

          <div className="text-[11px] font-medium text-slate-600">
            Phân quyền hiện hành: Ma trận{' '}
            <strong className="text-slate-900">
              {effectivePermissions.allowVicePrincipalFinalApproveMatrix
                ? 'Phó Hiệu trưởng được duyệt'
                : 'Hiệu trưởng duyệt cuối'}
            </strong>{' '}
            · Đề kiểm tra{' '}
            <strong className="text-slate-900">
              {effectivePermissions.allowVicePrincipalFinalApproveExam
                ? 'Phó Hiệu trưởng được phân quyền duyệt cuối'
                : 'Phó Hiệu trưởng xác nhận & trình Hiệu trưởng duyệt cuối'}
            </strong>
          </div>
        </div>

        {/* KHUNG PHẠM VI THẨM QUYỀN PHÊ DUYỆT DÀNH CHO PHÓ HIỆU TRƯỞNG TẠI MỤC 6 */}
        {isVicePrincipalApprovalView && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  1. Ma trận &amp; Bản đặc tả
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    effectivePermissions.allowVicePrincipalFinalApproveMatrix
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {effectivePermissions.allowVicePrincipalFinalApproveMatrix
                    ? 'Được duyệt & khóa'
                    : 'Trình Hiệu trưởng'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {effectivePermissions.allowVicePrincipalFinalApproveMatrix
                  ? 'Phó Hiệu trưởng có thẩm quyền phê duyệt chính thức và khóa phiên bản Ma trận, Bản đặc tả.'
                  : 'Phó Hiệu trưởng kiểm tra chuyên môn và trình Hiệu trưởng phê duyệt cuối cùng.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  2. Đề kiểm tra chính thức
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    effectivePermissions.allowVicePrincipalFinalApproveExam
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {effectivePermissions.allowVicePrincipalFinalApproveExam
                    ? 'Được ủy quyền duyệt cuối'
                    : 'Xác nhận & trình ký'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {effectivePermissions.allowVicePrincipalFinalApproveExam
                  ? 'Tài khoản đã được cấp quyền phê duyệt cuối cùng và khóa phiên bản Đề kiểm tra chính thức.'
                  : 'Xác nhận kết quả thẩm định chuyên môn và chuyển trạng thái Chờ Hiệu trưởng phê duyệt cuối.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  3. Hoàn trả &amp; Bảo toàn lịch sử
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                  Đầy đủ thẩm quyền
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Trả lại yêu cầu chỉnh sửa đối với hồ sơ chưa đạt chuẩn; mọi thao tác lưu nhật ký bất biến theo tài khoản.
              </p>
            </div>
          </div>
        )}

        {actionNoticeBanner && (
          <div
            className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
              actionNoticeBanner.type === 'BLOCKED_SECURITY'
                ? 'bg-rose-950 text-white border-rose-800'
                : 'bg-blue-950 text-white border-blue-800'
            }`}
          >
            <div className="space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-2">
                {actionNoticeBanner.type === 'BLOCKED_SECURITY' ? (
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{actionNoticeBanner.title}</span>
              </div>
              <p className="text-slate-100 leading-relaxed">
                {actionNoticeBanner.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActionNoticeBanner(null)}
              className="text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* DANH SÁCH HỒ SƠ QUY TRÌNH KHẢO THÍ LIÊN THÔNG (NẾU CÓ HỒ SƠ TỪ KẾ HOẠCH KIỂM TRA / PHÂN CÔNG RA ĐỀ) */}
      {isApprovalByAuthorityMenu && officialWorkflows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Hồ Sơ Quy Trình Khảo Thí Chính Thức Liên Thông ({officialWorkflows.length} hồ sơ)
              </h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('bgh-progress-tracking')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Xem chi tiết tại Tiến độ hồ sơ
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {officialWorkflows.map((wf) => {
              const stateInfo = WORKFLOW_STATE_LABELS[wf.status];
              const canApproveMatrixStep =
                wf.status === 'MatrixReview' &&
                (activeUser.role === 'PRINCIPAL' ||
                  effectivePermissions.allowVicePrincipalFinalApproveMatrix);
              const canApproveExamStep =
                wf.status === 'AwaitingApproval' &&
                (activeUser.role === 'PRINCIPAL' ||
                  effectivePermissions.allowVicePrincipalFinalApproveExam);

              return (
                <div
                  key={wf.workflowId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-[11px] font-bold text-blue-700">
                        {wf.workflowId} · Khối {wf.gradeId} · {wf.subjectId}
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {wf.title}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white border border-slate-300 text-slate-800 shrink-0">
                      {stateInfo?.label || wf.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                    <span>Phụ trách: <strong>{wf.creatorName}</strong></span>
                    <span>·</span>
                    <span>Năm học: {wf.academicYearId}</span>
                  </div>
                  {(canApproveMatrixStep ||
                    canApproveExamStep ||
                    wf.status === 'MatrixReview' ||
                    wf.status === 'AwaitingApproval') && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {canApproveMatrixStep && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleWorkflowApprovalDecision(wf, 'APPROVE')
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                        >
                          Phê duyệt Ma trận (Chuyển Bước 3)
                        </button>
                      )}
                      {canApproveExamStep && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleWorkflowApprovalDecision(wf, 'APPROVE')
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                        >
                          Phê duyệt &amp; Khóa Đề chính thức
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          void handleWorkflowApprovalDecision(
                            wf,
                            'RETURN_REVISION'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold cursor-pointer"
                      >
                        Trả lại chỉnh sửa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KHỐI 2: CHỌN QUY TRÌNH HAI CẤP (QUY TRÌNH A: MA TRẬN & ĐẶC TẢ | QUY TRÌNH B: ĐỀ KIỂM TRA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveProcessType('MATRIX')}
          className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            activeProcessType === 'MATRIX'
              ? 'bg-blue-50/80 border-blue-700 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-800 uppercase">
              <FileSpreadsheet className="w-4 h-4" />
              {isApprovalByAuthorityMenu
                ? `QUY TRÌNH A – PHÊ DUYỆT MA TRẬN & BẢN ĐẶC TẢ (${allOfficialMatrices.length} hồ sơ)`
                : `QUY TRÌNH A – THẨM ĐỊNH MA TRẬN VÀ BẢN ĐẶC TẢ (${allOfficialMatrices.length} hồ sơ)`}
            </span>
            {activeProcessType === 'MATRIX' && (
              <span className="px-2.5 py-0.5 rounded bg-blue-700 text-white text-[11px] font-bold">
                Đang chọn
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-600 mt-2 flex flex-wrap items-center gap-1.5 font-medium">
            <span>GV lập ma trận</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Gửi thẩm định</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Tổ CM xem xét</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Chỉnh sửa nếu cần</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Cấp có thẩm quyền duyệt</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-emerald-700 font-bold">
              Khóa phiên bản ma trận
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveProcessType('EXAM')}
          className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            activeProcessType === 'EXAM'
              ? 'bg-blue-50/80 border-blue-700 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-800 uppercase">
              <FileText className="w-4 h-4" />
              {isApprovalByAuthorityMenu
                ? `QUY TRÌNH B – PHÊ DUYỆT ĐỀ KIỂM TRA THEO THẨM QUYỀN (${allOfficialExams.length} hồ sơ)`
                : `QUY TRÌNH B – THẨM ĐỊNH & PHÊ DUYỆT ĐỀ KIỂM TRA (${allOfficialExams.length} hồ sơ)`}
            </span>
            {activeProcessType === 'EXAM' && (
              <span className="px-2.5 py-0.5 rounded bg-blue-700 text-white text-[11px] font-bold">
                Đang chọn
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-600 mt-2 flex flex-wrap items-center gap-1.5 font-medium">
            <span>Tạo đề từ ma trận đã duyệt</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Gửi phản biện</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>GV phản biện đánh giá</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Tổ CM xác nhận</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>BGH phê duyệt theo quyền</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-emerald-700 font-bold">
              Khóa đề &amp; Phát hành
            </span>
          </div>
        </button>
      </div>

      {/* KHỐI 3: DANH SÁCH HỒ SƠ BÊN TRÁI (4 CỘT) & KHÔNG GIAN THẨM ĐỊNH CHI TIẾT BÊN PHẢI (8 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Danh sách Ma trận (Quy trình A) hoặc Đề kiểm tra (Quy trình B) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h2 className="text-xs font-bold uppercase text-slate-700">
              {activeProcessType === 'MATRIX'
                ? `Hồ sơ Ma trận & Bản đặc tả (${filteredMatrices.length})`
                : `Hồ sơ Đề kiểm tra (${filteredExams.length})`}
            </h2>
          </div>

          {isApprovalByAuthorityMenu && (
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setApprovalQueueFilter('ALL')}
                className={`py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                  approvalQueueFilter === 'ALL'
                    ? 'bg-white text-blue-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả (
                {activeProcessType === 'MATRIX'
                  ? allOfficialMatrices.length
                  : allOfficialExams.length}
                )
              </button>
              <button
                type="button"
                onClick={() => setApprovalQueueFilter('WAITING_APPROVAL')}
                className={`py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                  approvalQueueFilter === 'WAITING_APPROVAL'
                    ? 'bg-white text-amber-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chờ duyệt (
                {activeProcessType === 'MATRIX'
                  ? waitingMatricesCount
                  : waitingExamsCount}
                )
              </button>
              <button
                type="button"
                onClick={() => setApprovalQueueFilter('APPROVED_LOCKED')}
                className={`py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                  approvalQueueFilter === 'APPROVED_LOCKED'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã duyệt ({approvedLockedCount})
              </button>
            </div>
          )}

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {activeProcessType === 'MATRIX' ? (
              filteredMatrices.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-1.5">
                  <FileSpreadsheet className="w-7 h-7 text-slate-300 mx-auto" />
                  <div className="text-xs font-semibold text-slate-700">
                    Chưa có hồ sơ Ma trận chính thức
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Khi giáo viên biên soạn và gửi thẩm định Ma trận &amp; Bản đặc tả, hồ sơ sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                filteredMatrices.map((mat) => {
                  const st = getApprovalStatusInfo(mat.status);
                  const selected = currentMatrix?.id === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setSelectedMatrixId(mat.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-blue-50/90 border-blue-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono font-bold text-blue-700">
                          {mat.code} (v{mat.version || 1})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${st.colorClass}`}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">
                        {mat.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
                        <span>
                          Lớp {mat.grade} · {mat.subject}
                        </span>
                        <span>·</span>
                        <span>GV: {mat.authorName}</span>
                        {mat.isLocked && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Đã khóa
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )
            ) : filteredExams.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-1.5">
                <FileText className="w-7 h-7 text-slate-300 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">
                  Chưa có hồ sơ Đề kiểm tra chính thức
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Khi giáo viên nộp đề kiểm tra và Tổ chuyên môn chuyển thẩm định, hồ sơ sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              filteredExams.map((ex) => {
                const st = getApprovalStatusInfo(ex.status);
                const selected = currentExam?.id === ex.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setSelectedExamId(ex.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-blue-50/90 border-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-bold text-blue-700">
                        {ex.code} (v{ex.version || 1})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${st.colorClass}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">
                      {ex.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
                      <span>
                        Lớp {ex.grade} · {ex.subject}
                      </span>
                      <span>·</span>
                      <span>GV: {ex.authorName}</span>
                      {ex.isLocked && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> Đã khóa
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Cột phải (8 cột): Không gian xử lý thẩm định, phản biện, góp ý, diff & biên bản */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {activeTargetRecord ? (
            <>
              {/* Header thông tin hồ sơ đang chọn */}
              <div className="p-5 bg-slate-900 text-white space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300 font-mono">
                      <span>
                        {activeProcessType === 'MATRIX'
                          ? 'HỒ SƠ MA TRẬN & ĐẶC TẢ'
                          : 'HỒ SƠ ĐỀ KIỂM TRA'}
                      </span>
                      <span>·</span>
                      <strong className="text-amber-300">
                        {activeTargetRecord.code} (Phiên bản v
                        {activeTargetRecord.version || 1})
                      </strong>
                      <span>·</span>
                      <span>
                        Lớp {activeTargetRecord.grade} · Môn{' '}
                        {activeTargetRecord.subject}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">
                      {activeTargetRecord.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTargetLocked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        Đã khóa phiên bản
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold">
                      {getApprovalStatusInfo(activeTargetStatus).label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Người ra đề:</span>
                    <strong className="text-white">
                      {activeTargetRecord.authorName || 'Chưa ghi nhận'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">
                      GV phản biện được giao:
                    </span>
                    <strong className="text-amber-300">
                      {activeTargetRecord.assignedReviewerName ||
                        'Chưa phân công'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">
                      Tổ trưởng chuyên môn:
                    </span>
                    <strong className="text-white">
                      {activeTargetRecord.headOfDepartmentName ||
                        'Chưa ghi nhận'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">
                      Lãnh đạo phê duyệt:
                    </span>
                    <strong className="text-emerald-300">
                      {activeTargetRecord.finalApproverName || 'Chưa phê duyệt'}
                    </strong>
                  </div>
                </div>

                {/* 4 Tab chuyên môn */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('WORKFLOW_AND_HISTORY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                      activeDetailTab === 'WORKFLOW_AND_HISTORY'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    1. Trạng thái &amp; Phân công ({NINE_LIFECYCLE_STATUS_ORDER.length} bước)
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('APPRAISAL_SHEET_12')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                      activeDetailTab === 'APPRAISAL_SHEET_12'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    2. Phiếu thẩm định (12 tiêu chí)
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('FEEDBACK_AND_DIFF')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                      activeDetailTab === 'FEEDBACK_AND_DIFF'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <FileDiff className="w-3.5 h-3.5" />
                    3. Góp ý từng câu ({activeFeedbacks.length}) &amp; So sánh 2 phiên bản ({activeDiffs.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('OFFICIAL_MINUTES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                      activeDetailTab === 'OFFICIAL_MINUTES'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    4. Biên bản thẩm định tự động
                  </button>
                </div>
              </div>

              {/* NỘI DUNG TAB 1: 9 TRẠNG THÁI HỒ SƠ, PHÂN CÔNG PHẢN BIỆN & LỊCH SỬ XỬ LÝ */}
              {activeDetailTab === 'WORKFLOW_AND_HISTORY' && (
                <div className="p-6 space-y-6">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Nguyên tắc chuyên môn bắt buộc:</strong> Hệ thống không tự động phê duyệt dựa trên kiểm tra kỹ thuật. Mọi quyết định thẩm định, xác nhận và phê duyệt đều ghi nhận theo tài khoản cán bộ có thẩm quyền. Hồ sơ chưa phê duyệt không được đưa vào kho đề chính thức hoặc phát hành.
                    </div>
                  </div>

                  {/* Thanh thao tác Quyết định Phê duyệt nhanh tại Mục 6 */}
                  {isApprovalByAuthorityMenu && !activeTargetLocked && (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-blue-700" />
                          Quyết định Phê duyệt Theo Phân quyền ({activeUser.roleLabel})
                        </span>
                        <span className="text-[11px] text-blue-800 font-medium">
                          {activeProcessType === 'MATRIX'
                            ? effectivePermissions.allowVicePrincipalFinalApproveMatrix ||
                              activeUser.role === 'PRINCIPAL'
                              ? 'Được quyền phê duyệt & khóa Ma trận'
                              : 'Trình Hiệu trưởng phê duyệt cuối'
                            : effectivePermissions.allowVicePrincipalFinalApproveExam ||
                              activeUser.role === 'PRINCIPAL'
                            ? 'Được quyền phê duyệt & khóa Đề kiểm tra'
                            : 'Xác nhận thẩm định & trình Hiệu trưởng phê duyệt'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {((activeProcessType === 'MATRIX' &&
                          (activeUser.role === 'PRINCIPAL' ||
                            effectivePermissions.allowVicePrincipalFinalApproveMatrix)) ||
                          (activeProcessType === 'EXAM' &&
                            (activeUser.role === 'PRINCIPAL' ||
                              effectivePermissions.allowVicePrincipalFinalApproveExam))) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleExecuteStatusTransition(
                                ApprovalStatus.APPROVED
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Phê duyệt chính thức &amp; Khóa phiên bản
                          </button>
                        )}

                        {activeUser.role === 'VICE_PRINCIPAL' &&
                          activeProcessType === 'EXAM' &&
                          !effectivePermissions.allowVicePrincipalFinalApproveExam && (
                            <button
                              type="button"
                              onClick={() =>
                                handleExecuteStatusTransition(
                                  ApprovalStatus.PENDING_APPROVAL
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Xác nhận đạt &amp; Trình Hiệu trưởng phê duyệt
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            handleExecuteStatusTransition(
                              ApprovalStatus.REVISION_REQUIRED
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Trả lại yêu cầu chỉnh sửa
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sơ đồ 9 trạng thái hồ sơ */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-800">
                      TRẠNG THÁI HỒ SƠ (9 BƯỚC CHUẨN — THỰC HIỆN THEO THẨM QUYỀN CỦA {activeUser.roleLabel.toUpperCase()}):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NINE_LIFECYCLE_STATUS_ORDER.map((stCode, idx) => {
                        const stMeta = getApprovalStatusInfo(stCode);
                        const isCurrent = activeTargetStatus === stCode;
                        return (
                          <button
                            key={stCode}
                            type="button"
                            onClick={() =>
                              handleExecuteStatusTransition(stCode)
                            }
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                              <span>Bước {idx + 1}/9</span>
                              {isCurrent && <span>● HIỆN TẠI</span>}
                            </div>
                            <div className="text-xs font-bold mt-0.5">
                              {stMeta.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <input
                        type="text"
                        value={transitionNote}
                        onChange={(e) => setTransitionNote(e.target.value)}
                        placeholder={`Nhập ý kiến phê duyệt / nhận xét chỉ đạo của ${activeUser.fullName} (${activeUser.roleLabel})...`}
                        className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleExecuteStatusTransition(
                            ApprovalStatus.REVISION_REQUIRED
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Trả lại yêu cầu chỉnh sửa
                      </button>
                    </div>
                  </div>

                  {/* Khung Phân công Giáo viên phản biện độc lập từ danh sách giáo viên thực của trường */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900">
                        Phân công Giáo viên Phản biện độc lập
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Chọn giáo viên chuyên môn trong nhà trường để đánh giá độc lập và lập Phiếu thẩm định 12 tiêu chí.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={selectedReviewerUserId}
                        onChange={(e) =>
                          setSelectedReviewerUserId(e.target.value)
                        }
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white max-w-xs"
                      >
                        {scopedReviewerOptions.length === 0 ? (
                          <option value="">
                            -- Chưa có danh sách giáo viên --
                          </option>
                        ) : (
                          scopedReviewerOptions.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullName}
                              {u.departmentName ? ` (${u.departmentName})` : ''}
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssignPeerReviewer}
                        disabled={scopedReviewerOptions.length === 0}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold cursor-pointer disabled:cursor-not-allowed"
                      >
                        Giao phản biện
                      </button>
                    </div>
                  </div>

                  {/* Khung bảo vệ phiên bản đã phê duyệt */}
                  {activeTargetLocked && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-emerald-700" />
                          Phiên bản v{activeTargetRecord.version || 1} đã được phê duyệt và khóa bảo vệ!
                        </div>
                        <p className="text-emerald-900">
                          Hồ sơ đã phê duyệt được khóa nguyên trạng để bảo toàn tính pháp lý. Khi cần điều chỉnh nội dung sau phê duyệt, hệ thống khởi tạo phiên bản mới độc lập.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateNewOfficialVersionFromLocked}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shrink-0"
                      >
                        Tách phiên bản mới (v
                        {(activeTargetRecord.version || 1) + 1}) để chỉnh sửa
                      </button>
                    </div>
                  )}

                  {/* Nhật ký lịch sử xử lý bất biến */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Lịch sử xử lý hồ sơ (Ghi nhận đầy đủ Người thực hiện, Vai trò, Thời gian):
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {activeProcessType === 'MATRIX'
                        ? (currentMatrix?.versionHistory || []).map(
                            (h, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-bold ${
                                        getApprovalStatusInfo(h.status)
                                          .textClass
                                      }`}
                                    >
                                      [{getApprovalStatusInfo(h.status).label}]
                                    </span>
                                    <span className="font-bold text-slate-900">
                                      {h.editorName}
                                    </span>
                                    <span className="font-mono text-slate-500">
                                      (v{h.version})
                                    </span>
                                  </div>
                                  <p className="text-slate-700">{h.note}</p>
                                </div>
                                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                                  {h.updatedAt}
                                </span>
                              </div>
                            )
                          )
                        : (currentExam?.statusHistory || []).map((h, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-bold ${
                                      getApprovalStatusInfo(h.status).textClass
                                    }`}
                                  >
                                    [{getApprovalStatusInfo(h.status).label}]
                                  </span>
                                  <span className="font-bold text-slate-900">
                                    {h.actorName}
                                  </span>
                                </div>
                                <p className="text-slate-700">{h.note}</p>
                              </div>
                              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                                {h.changedAt}
                              </span>
                            </div>
                          ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NỘI DUNG TAB 2: PHIẾU THẨM ĐỊNH 12 TIÊU CHÍ */}
              {activeDetailTab === 'APPRAISAL_SHEET_12' && (
                <div className="p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Phiếu Thẩm Định Chuyên Môn ({applicableCriteria.length}/12 Tiêu Chí Áp Dụng Cho {activeTargetSubject} –{' '}
                        {activeTargetLevelId === EducationLevelId.PRIMARY
                          ? 'Cấp Tiểu học'
                          : 'Cấp THCS'}
                        )
                      </h3>
                      <p className="text-xs text-slate-500">
                        Người lập phiếu hiện tại: <strong>{activeUser.fullName}</strong> ({activeUser.roleLabel})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit12CriteriaSheet}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Lưu &amp; Gửi Phiếu Thẩm Định
                    </button>
                  </div>

                  {/* Bảng 12 tiêu chí */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                          <th className="p-2.5 border-r border-slate-200 w-64">
                            Tiêu chí thẩm định
                          </th>
                          <th className="p-2.5 border-r border-slate-200 w-44">
                            Mức đánh giá
                          </th>
                          <th className="p-2.5 border-r border-slate-200">
                            Nhận xét chuyên môn
                          </th>
                          <th className="p-2.5 w-40">
                            Vị trí câu hỏi cần sửa
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {applicableCriteria.map((crit) => {
                          const ev = workingEvaluations.find(
                            (e) => e.criterionCode === crit.code
                          ) || {
                            criterionCode: crit.code,
                            order: crit.order,
                            title: crit.title,
                            rating: 'DAT' as AppraisalCriterionRating,
                            comment: '',
                            questionPositions: '',
                          };

                          return (
                            <tr key={crit.code} className="hover:bg-slate-50/80">
                              <td className="p-2.5 border-r border-slate-200 align-top">
                                <div className="font-bold text-slate-900">
                                  {crit.title}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {crit.description}
                                </div>
                              </td>
                              <td className="p-2.5 border-r border-slate-200 align-top">
                                <select
                                  value={ev.rating}
                                  onChange={(e) => {
                                    const nextRating = e.target
                                      .value as AppraisalCriterionRating;
                                    setWorkingEvaluations((prev) =>
                                      prev.map((item) =>
                                        item.criterionCode === crit.code
                                          ? { ...item, rating: nextRating }
                                          : item
                                      )
                                    );
                                  }}
                                  className={`w-full rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                                    ev.rating === 'DAT'
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                      : ev.rating === 'CAN_CHINH_SUA'
                                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                                      : ev.rating === 'KHONG_DAT'
                                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                                      : 'bg-slate-100 border-slate-300 text-slate-600'
                                  }`}
                                >
                                  <option value="DAT">✓ Đạt</option>
                                  <option value="CAN_CHINH_SUA">
                                    ! Cần chỉnh sửa
                                  </option>
                                  <option value="KHONG_DAT">✕ Không đạt</option>
                                  <option value="KHONG_AP_DUNG">
                                    — Không áp dụng
                                  </option>
                                </select>
                              </td>
                              <td className="p-2.5 border-r border-slate-200 align-top">
                                <input
                                  type="text"
                                  value={ev.comment}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setWorkingEvaluations((prev) =>
                                      prev.map((item) =>
                                        item.criterionCode === crit.code
                                          ? { ...item, comment: val }
                                          : item
                                      )
                                    );
                                  }}
                                  placeholder="Ghi nhận xét chi tiết cho tiêu chí này..."
                                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                                />
                              </td>
                              <td className="p-2.5 align-top">
                                <input
                                  type="text"
                                  value={ev.questionPositions}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setWorkingEvaluations((prev) =>
                                      prev.map((item) =>
                                        item.criterionCode === crit.code
                                          ? { ...item, questionPositions: val }
                                          : item
                                      )
                                    );
                                  }}
                                  placeholder="VD: Câu 3, Câu 7b"
                                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono bg-white"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Kết luận tổng hợp của Phiếu thẩm định */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                    <div className="sm:col-span-4">
                      <label className="block font-bold text-slate-800 mb-1">
                        Kết luận của người thẩm định / phản biện:
                      </label>
                      <select
                        value={sheetOverallConclusion}
                        onChange={(e) =>
                          setSheetOverallConclusion(
                            e.target.value as
                              | 'DAT'
                              | 'CAN_CHINH_SUA'
                              | 'KHONG_DAT'
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white font-bold"
                      >
                        <option value="DAT">
                          ĐẠT (Đề nghị trình phê duyệt)
                        </option>
                        <option value="CAN_CHINH_SUA">
                          CẦN CHỈNH SỬA (Trả lại giáo viên ra đề)
                        </option>
                        <option value="KHONG_DAT">
                          KHÔNG ĐẠT (Yêu cầu biên soạn lại)
                        </option>
                      </select>
                    </div>
                    <div className="sm:col-span-8">
                      <label className="block font-bold text-slate-800 mb-1">
                        Nhận xét kết luận chung:
                      </label>
                      <input
                        type="text"
                        value={sheetGeneralNote}
                        onChange={(e) => setSheetGeneralNote(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                      />
                    </div>
                  </div>

                  {/* Danh sách các Phiếu thẩm định đã nộp trước đó */}
                  {activeSheets.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-800">
                        Lịch sử Phiếu thẩm định đã lưu ({activeSheets.length} phiếu):
                      </div>
                      {activeSheets.map((sh) => (
                        <div
                          key={sh.id}
                          className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              Người lập: {sh.reviewerName} (Phiên bản v
                              {sh.targetVersion})
                            </span>
                            <span className="font-mono text-slate-500">
                              {sh.submittedAt}
                            </span>
                          </div>
                          <div>
                            <strong>Kết luận:</strong>{' '}
                            <span className="font-bold text-emerald-800">
                              {sh.overallConclusion === 'DAT'
                                ? 'ĐẠT YÊU CẦU'
                                : 'CẦN CHỈNH SỬA'}
                            </span>{' '}
                            — {sh.generalSummaryNote}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NỘI DUNG TAB 3: QUẢN LÝ GÓP Ý TỪNG CÂU & SO SÁNH SỰ KHÁC BIỆT GIỮA 2 PHIÊN BẢN */}
              {activeDetailTab === 'FEEDBACK_AND_DIFF' && (
                <div className="p-6 space-y-6">
                  <form
                    onSubmit={handleAddItemFeedback}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <MessageSquarePlus className="w-4 h-4 text-blue-700" />
                      Thêm Góp Ý Trực Tiếp Vào Từng Câu Hỏi / Dòng Ma Trận (Người góp ý: {activeUser.fullName} — {activeUser.roleLabel})
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Vị trí câu hỏi / Dòng ma trận (*)
                        </label>
                        <input
                          type="text"
                          value={fbItemLocation}
                          onChange={(e) => setFbItemLocation(e.target.value)}
                          placeholder="VD: Câu 4"
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Ghi chú lỗi đáp án / biểu điểm (nếu có)
                        </label>
                        <input
                          type="text"
                          value={fbAnswerError}
                          onChange={(e) => setFbAnswerError(e.target.value)}
                          placeholder="VD: Đáp án phương án B chưa rút gọn tối giản; thiếu biểu điểm bước 2..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Nội dung góp ý chuyên môn (*)
                        </label>
                        <input
                          type="text"
                          value={fbContent}
                          onChange={(e) => setFbContent(e.target.value)}
                          placeholder="Mô tả lỗi khoa học, ngôn ngữ hoặc độ khó..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Đề xuất phương án chỉnh sửa (*)
                        </label>
                        <input
                          type="text"
                          value={fbProposedFix}
                          onChange={(e) => setFbProposedFix(e.target.value)}
                          placeholder="Nêu rõ cách sửa lại câu dẫn, phương án hoặc thang điểm..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                      >
                        Ghi nhận góp ý vào hồ sơ
                      </button>
                    </div>
                  </form>

                  {/* Danh sách các góp ý phản biện */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-900">
                      Danh sách Góp ý Phản biện theo từng Câu hỏi ({activeFeedbacks.length} góp ý — Bảo toàn lịch sử vĩnh viễn):
                    </div>
                    {activeFeedbacks.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                        Chưa có góp ý từng câu cho hồ sơ này.
                      </div>
                    ) : (
                      activeFeedbacks.map((fb) => (
                        <div
                          key={fb.id}
                          className={`p-4 rounded-xl border text-xs space-y-2 ${
                            fb.resolutionStatus === 'RESOLVED'
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-amber-50/60 border-amber-300'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">
                              {fb.itemNumberOrCode} (Góp ý ở v
                              {fb.versionAtFeedback} bởi {fb.reviewerName})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                fb.resolutionStatus === 'RESOLVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-200 text-amber-950'
                              }`}
                            >
                              {fb.resolutionStatus === 'RESOLVED'
                                ? `Đã tiếp thu & chỉnh sửa (${fb.resolvedByName})`
                                : 'Đang chờ Giáo viên ra đề chỉnh sửa'}
                            </span>
                          </div>

                          <div className="text-slate-800">
                            <strong>Nhận xét:</strong> {fb.feedbackContent}
                          </div>
                          {fb.answerErrorNote && (
                            <div className="text-rose-700">
                              <strong>Ghi chú lỗi đáp án:</strong>{' '}
                              {fb.answerErrorNote}
                            </div>
                          )}
                          <div className="text-blue-900">
                            <strong>Đề xuất sửa:</strong> {fb.proposedFix}
                          </div>

                          {fb.resolutionStatus === 'OPEN' && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleResolveFeedbackWithVersionDiff(fb)
                                }
                                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                              >
                                Xác nhận đã tiếp thu &amp; Chỉnh sửa (Tạo bản đối chiếu v
                                {(activeTargetRecord.version || 1) + 1})
                              </button>
                            </div>
                          )}

                          {fb.resolutionSummary && (
                            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-emerald-950">
                              <strong>Kết quả sửa ({fb.resolvedAt}):</strong>{' '}
                              {fb.resolutionSummary}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bảng đối chiếu sự khác biệt giữa hai phiên bản */}
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileDiff className="w-4 h-4 text-indigo-700" />
                      So Sánh Sự Khác Biệt Giữa Hai Phiên Bản (Trước chỉnh sửa ↔ Sau chỉnh sửa):
                    </div>

                    {activeDiffs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                        Chưa phát sinh lịch sử đối chiếu phiên bản cho hồ sơ này. Khi giáo viên tiếp thu góp ý và cập nhật phiên bản mới, bảng đối chiếu sẽ tự động hiển thị tại đây.
                      </div>
                    ) : (
                      activeDiffs.map((diff) => (
                        <div
                          key={diff.id}
                          className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-2.5 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-indigo-950">
                              Đối chiếu Phiên bản v{diff.fromVersion} → Phiên bản v
                              {diff.toVersion} · Vị trí: {diff.locationLabel}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              Người sửa: {diff.editorName} · {diff.editedAt}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-950">
                              <div className="font-bold text-[11px] uppercase text-rose-700 mb-1">
                                — Phiên bản cũ (v{diff.fromVersion})
                              </div>
                              <div>{diff.beforeContent}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                              <div className="font-bold text-[11px] uppercase text-emerald-700 mb-1">
                                + Phiên bản sau chỉnh sửa (v{diff.toVersion})
                              </div>
                              <div>{diff.afterContent}</div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-600">
                            <strong>Lý do chỉnh sửa:</strong>{' '}
                            {diff.changeReason}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* NỘI DUNG TAB 4: BIÊN BẢN THẨM ĐỊNH TỰ ĐỘNG */}
              {activeDetailTab === 'OFFICIAL_MINUTES' && (
                <div className="p-6 space-y-5 bg-slate-100/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-600">
                      <strong>Biên bản thẩm định chính thức:</strong> Ghi nhận trung thực theo hồ sơ thẩm định trên hệ thống; không tự tạo chữ ký điện tử giả khi chưa kết nối chứng thư số hợp lệ.
                    </div>
                    <button
                      type="button"
                      onClick={handleExportAppraisalMinutesToWord}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Xuất Word Biên Bản Thẩm Định (.doc)
                    </button>
                  </div>

                  {/* Tờ Biên bản chuẩn hành chính A4 */}
                  <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-xs space-y-5 text-xs leading-relaxed text-slate-900">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-300 text-center">
                      <div className="space-y-0.5">
                        <div className="font-bold uppercase">
                          {officialMinutes.schoolName}
                        </div>
                        <div className="font-bold uppercase text-blue-900">
                          {officialMinutes.departmentName}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          Số: {officialMinutes.minutesCode}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold uppercase">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div className="font-bold underline underline-offset-4">
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-base font-bold uppercase text-slate-950">
                        BIÊN BẢN THẨM ĐỊNH VÀ PHÊ DUYỆT{' '}
                        {officialMinutes.targetType === 'MATRIX'
                          ? 'MA TRẬN, BẢN ĐẶC TẢ ĐỀ KIỂM TRA'
                          : 'ĐỀ KIỂM TRA, ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM'}
                      </h3>
                      <div className="text-xs italic text-slate-600">
                        Thời gian lập biên bản: {officialMinutes.appraisalTime}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <strong>1. Tên trường:</strong>{' '}
                        {officialMinutes.schoolName}
                      </div>
                      <div>
                        <strong>2. Bộ phận chuyên môn:</strong>{' '}
                        {officialMinutes.departmentName}
                      </div>
                      <div>
                        <strong>3. Môn học, Khối lớp:</strong> Môn{' '}
                        {officialMinutes.subject} – Lớp {officialMinutes.grade}
                      </div>
                      <div>
                        <strong>4. Thời gian thẩm định:</strong>{' '}
                        {officialMinutes.appraisalTime}
                      </div>
                      <div className="sm:col-span-2">
                        <strong>5. Tên hồ sơ / Đề kiểm tra:</strong>{' '}
                        {officialMinutes.targetTitle} (Mã:{' '}
                        <span className="font-mono font-bold">
                          {officialMinutes.targetCode}
                        </span>{' '}
                        – Phiên bản v{officialMinutes.targetVersion})
                      </div>
                      <div>
                        <strong>6. Người ra đề:</strong>{' '}
                        {officialMinutes.authorName}
                      </div>
                      <div>
                        <strong>7. Người phản biện:</strong>{' '}
                        {officialMinutes.peerReviewerName}
                      </div>
                      <div>
                        <strong>8. Tổ trưởng chuyên môn:</strong>{' '}
                        {officialMinutes.headOfDepartmentName}
                      </div>
                      <div>
                        <strong>
                          9. Người phê duyệt ({officialMinutes.approverRoleLabel}
                          ):
                        </strong>{' '}
                        {officialMinutes.approverName}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <strong>10. Kết quả đánh giá chuyên môn:</strong>
                        <p className="mt-1 text-slate-700">
                          {officialMinutes.evaluationSummary}
                        </p>
                      </div>

                      <div>
                        <strong>
                          11. Nội dung yêu cầu điều chỉnh &amp; kết quả tiếp thu:
                        </strong>
                        {officialMinutes.adjustmentRequests.length === 0 ? (
                          <p className="mt-1 text-slate-600 italic">
                            Không có yêu cầu điều chỉnh tồn đọng.
                          </p>
                        ) : (
                          <ul className="list-disc list-inside mt-1 space-y-1 text-slate-700">
                            {officialMinutes.adjustmentRequests.map(
                              (req, i) => (
                                <li key={i}>{req}</li>
                              )
                            )}
                          </ul>
                        )}
                      </div>

                      <div>
                        <strong>12. Kết luận:</strong>
                        <p className="mt-1 font-semibold text-blue-950">
                          {officialMinutes.conclusionText}
                        </p>
                      </div>
                    </div>

                    {/* Khung xác nhận của các bên */}
                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700">
                          XÁC NHẬN CỦA CÁC BÊN THAM GIA QUY TRÌNH:
                        </span>
                        <span>
                          Trạng thái chữ ký số CA: Chưa kết nối thiết bị ký số hợp lệ (Không hiển thị chữ ký giả)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                        {officialMinutes.confirmations.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2"
                          >
                            <div className="font-bold text-slate-900 uppercase text-[11px]">
                              {c.partyTitle}
                            </div>
                            <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                              {c.statusLabel}
                            </div>
                            <div className="font-bold text-slate-900 pt-2">
                              {c.personName}
                            </div>
                            {c.confirmedAt && (
                              <div className="font-mono text-[10px] text-slate-400">
                                Thời gian: {c.confirmedAt}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-10 sm:p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-xl mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  {isApprovalByAuthorityMenu
                    ? activeProcessType === 'MATRIX'
                      ? 'Chưa có Hồ sơ Ma trận & Bản đặc tả chính thức chờ phê duyệt theo phân quyền'
                      : 'Chưa có Hồ sơ Đề kiểm tra chính thức chờ phê duyệt theo phân quyền'
                    : activeProcessType === 'MATRIX'
                    ? 'Chưa có Hồ sơ Ma trận & Bản đặc tả chính thức cần thẩm định'
                    : 'Chưa có Hồ sơ Đề kiểm tra chính thức cần thẩm định'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isApprovalByAuthorityMenu ? (
                    <>
                      Toàn bộ dữ liệu mẫu, kịch bản thử nghiệm và tài khoản giả lập đã được làm sạch hoàn toàn. Khi Tổ chuyên môn xác nhận thẩm định hoặc trình hồ sơ khảo thí chính thức của{' '}
                      <strong className="text-slate-900">
                        {effectiveSchoolName}
                      </strong>
                      , hồ sơ sẽ hiển thị tại đây để thực hiện phê duyệt và khóa phiên bản theo đúng thẩm quyền.
                    </>
                  ) : (
                    <>
                      Toàn bộ dữ liệu mẫu, kịch bản thử nghiệm và tài khoản giả lập đã được làm sạch. Hệ thống hiện chỉ tiếp nhận hồ sơ khảo thí chính thức do giáo viên của{' '}
                      <strong className="text-slate-900">
                        {effectiveSchoolName}
                      </strong>{' '}
                      biên soạn và trình thẩm định theo đúng phân công chuyên môn.
                    </>
                  )}
                </p>
              </div>

              {isApprovalByAuthorityMenu && (
                <div className="inline-flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Trạng thái kho chính thức: {allOfficialMatrices.length} Ma trận ·{' '}
                    {allOfficialExams.length} Đề kiểm tra ·{' '}
                    {officialWorkflows.length} Hồ sơ quy trình (0 dữ liệu mẫu)
                  </span>
                </div>
              )}

              {(actorRole === 'VICE_PRINCIPAL' ||
                actorRole === 'PRINCIPAL') &&
                onNavigate && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    {isVicePrincipalApprovalView ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onNavigate('approval')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Mở Mục 5. Thẩm định
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('bgh-progress-tracking')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 text-blue-700" />
                          Mở Tiến độ hồ sơ
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('progress-management')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <ClipboardList className="w-4 h-4 text-slate-700" />
                          Mở Kế hoạch kiểm tra
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onNavigate('progress-management')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <ClipboardList className="w-4 h-4 text-blue-700" />
                          Mở Kế hoạch kiểm tra
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('bgh-assign-exam')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          Mở Phân công ra đề
                        </button>
                      </>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL XÁC NHẬN LÀM SẠCH DỮ LIỆU MẪU */}
      {showCleanSampleConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                {isApprovalByAuthorityMenu
                  ? 'Làm sạch dữ liệu mẫu mục Phê duyệt theo phân quyền'
                  : 'Làm sạch dữ liệu mẫu & hồ sơ thử nghiệm'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCleanSampleConfirmModal(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Thao tác này sẽ rà soát và loại bỏ toàn bộ Ma trận mẫu, Đề kiểm tra thử nghiệm và Hồ sơ quy trình demo còn lưu trong bộ nhớ hoặc máy chủ, đồng thời giữ nguyên 100% các hồ sơ khảo thí chính thức của giáo viên nhà trường.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanSampleConfirmModal(false)}
                disabled={isCleaningSampleData}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCleanSampleData()}
                disabled={isCleaningSampleData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                {isCleaningSampleData
                  ? 'Đang làm sạch...'
                  : 'Xác nhận làm sạch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẤU HÌNH PHÂN QUYỀN THEO QUY CHẾ NHÀ TRƯỜNG */}
      {canConfigureSchoolPermissions && showPermissionConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Cấu Hình Phân Quyền Phê Duyệt Theo Quy Chế Nhà Trường
              </h3>
              <button
                type="button"
                onClick={() => setShowPermissionConfigModal(false)}
                className="text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Đóng [X]
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Các quyền phê duyệt cụ thể được cấu hình theo quy chế chuyên môn của đơn vị (không mặc định mọi Phó hiệu trưởng đều có quyền phê duyệt cuối cùng đối với Đề kiểm tra).
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.allowVicePrincipalFinalApproveExam}
                  onChange={(e) =>
                    handleUpdatePermissionConfig({
                      ...permissions,
                      allowVicePrincipalFinalApproveExam: e.target.checked,
                    })
                  }
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Ủy quyền cho Phó hiệu trưởng chuyên môn phê duyệt cuối cùng Đề kiểm tra
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Nếu tắt (mặc định): Phó hiệu trưởng kiểm tra quy trình, thẩm định chuyên môn và trình Hiệu trưởng phê duyệt cuối cùng.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.allowVicePrincipalFinalApproveMatrix}
                  onChange={(e) =>
                    handleUpdatePermissionConfig({
                      ...permissions,
                      allowVicePrincipalFinalApproveMatrix: e.target.checked,
                    })
                  }
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Cho phép Phó hiệu trưởng chuyên môn phê duyệt Ma trận &amp; Bản đặc tả (Quy trình A)
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.allowHeadOfDepartmentApproveMatrix}
                  onChange={(e) =>
                    handleUpdatePermissionConfig({
                      ...permissions,
                      allowHeadOfDepartmentApproveMatrix: e.target.checked,
                    })
                  }
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Ủy quyền cho Tổ trưởng chuyên môn phê duyệt Ma trận kiểm tra thường xuyên / định kỳ
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    permissions.requirePeerReviewBeforeDepartmentConfirm
                  }
                  onChange={(e) =>
                    handleUpdatePermissionConfig({
                      ...permissions,
                      requirePeerReviewBeforeDepartmentConfirm:
                        e.target.checked,
                    })
                  }
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-900">
                    Bắt buộc phải có Phiếu thẩm định 12 tiêu chí của Giáo viên phản biện trước khi Tổ chuyên môn trình duyệt
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowPermissionConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold cursor-pointer"
              >
                Hoàn tất cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẤU HÌNH 12 TIÊU CHÍ THẨM ĐỊNH THEO CẤP HỌC */}
      {showCriteriaConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl text-xs">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Cấu Hình 12 Tiêu Chí Phiếu Thẩm Định Theo Cấp Học &amp; Môn Học
              </h3>
              <button
                type="button"
                onClick={() => setShowCriteriaConfigModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                Đóng [X]
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
              {criteriaConfig.map((crit) => (
                <div
                  key={crit.code}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-bold text-slate-900">{crit.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {crit.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crit.enabledForPrimary}
                        onChange={(e) => {
                          const next = criteriaConfig.map((c) =>
                            c.code === crit.code
                              ? { ...c, enabledForPrimary: e.target.checked }
                              : c
                          );
                          setCriteriaConfig(next);
                          onSaveConfig({
                            ...config,
                            permissionConfig: permissions,
                            criteriaConfig: next,
                          });
                        }}
                      />
                      <span>Tiểu học</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crit.enabledForSecondary}
                        onChange={(e) => {
                          const next = criteriaConfig.map((c) =>
                            c.code === crit.code
                              ? { ...c, enabledForSecondary: e.target.checked }
                              : c
                          );
                          setCriteriaConfig(next);
                          onSaveConfig({
                            ...config,
                            permissionConfig: permissions,
                            criteriaConfig: next,
                          });
                        }}
                      />
                      <span>THCS</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
