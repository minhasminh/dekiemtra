import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import {
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ExecutiveDashboardFilterState,
  ExecutiveDatasetScopeMode,
  ExecutiveDossierRowExtended,
  ExecutivePriorityAlertType,
  ExecutiveRolePermissionProfile,
  ExecutiveSemesterCode,
  GradeNumber,
  MenuSectionId,
  QuestionItem,
  StorageConfig,
  ToastNotification,
  WorkflowActorRole,
} from '../types/domain';
import { ASSESSMENT_RULES_BY_LEVEL } from '../services/business/assessmentRules';
import {
  deleteOfficialWorkflowDossier,
  isSampleOrTestWorkflowDossier,
  loadSavedWorkflows,
  purgeAllSampleWorkflowsFromLocal,
  saveWorkflowToLocal,
  syncWorkflowToBackend,
} from '../services/workflow/endToEndExamWorkflowService';
import { STANDARD_EXAM_PERIOD_LABELS } from '../services/workflow/dossierProgressManagementService';
import { emitWorkflowNotificationEvent } from '../services/workflow/workflowNotificationCenterService';
import {
  computeExecutiveDashboardCharts,
  computeExecutiveKpiSummary,
  computeExecutivePriorityAlerts,
  enrichWorkflowRow,
  EXECUTIVE_ROLE_PROFILES,
  executeExecutiveManagementAction,
  exportExecutiveReportDocument,
  filterExecutiveDossierRows,
  loadExecutiveDossierRows,
} from '../services/workflow/executiveDashboardService';

const PRIMARY_SUBJECTS: string[] = [
  ...ASSESSMENT_RULES_BY_LEVEL[EducationLevelId.PRIMARY].subjects,
];
const LOWER_SECONDARY_SUBJECTS: string[] = [
  ...ASSESSMENT_RULES_BY_LEVEL[EducationLevelId.LOWER_SECONDARY].subjects,
];
const ALL_PRIMARY_AND_LOWER_SECONDARY_SUBJECTS: string[] = Array.from(
  new Set([...PRIMARY_SUBJECTS, ...LOWER_SECONDARY_SUBJECTS])
);

interface SchoolDepartmentSummary {
  id: string;
  departmentName: string;
  educationLevels?: string[];
  headFullName?: string | null;
  memberUserIds?: string[];
  members?: Array<{ userId: string; fullName: string }>;
}

interface SchoolTeacherAccountSummary {
  id: string;
  fullName: string;
  departmentName: string;
  assignedGradesDisplay?: number[];
  subjectAllocations?: Array<{
    educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY';
    subjectName: string;
    grades?: number[];
  }>;
}

interface SchoolTeachingAssignmentSummary {
  teacherUserId: string;
  teacherFullName: string;
  departmentName: string;
  educationLevelId?: 'PRIMARY' | 'LOWER_SECONDARY';
  subjectName: string;
  gradeId?: number;
  grades?: number[];
  status?: string;
}

function isAdminManagementDept(raw?: string | null): boolean {
  const k = String(raw || '').trim().toLowerCase();
  return k.includes('ban giám hiệu') || k.includes('quản trị');
}

function normalizeDeptKey(raw?: string | null): string {
  const s = String(raw || '').trim().replace(/\s+/g, ' ').toLowerCase();
  if (!s) return '';
  if (s === 'tổ khtn' || s === 'tổ khoa học tự nhiên (thcs)') return 'tổ khoa học tự nhiên';
  if (s === 'tổ khxh' || s === 'tổ khoa học xã hội (thcs)') return 'tổ khoa học xã hội';
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

interface ExecutiveDashboardWorkspaceProps {
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  config: StorageConfig;
  activeMenu?: MenuSectionId;
  schoolId?: string;
  schoolName?: string;
  actorUserId?: string;
  actorFullName?: string;
  actorRole?: string;
  actorRoleTitle?: string;
  onOpenWorkflowInPipeline: (workflowId: string) => void;
  onNavigate: (menuId: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

export const ExecutiveDashboardWorkspace: React.FC<ExecutiveDashboardWorkspaceProps> = ({
  questions,
  matrices,
  exams,
  config,
  activeMenu,
  schoolId,
  schoolName,
  actorUserId,
  actorFullName,
  actorRole,
  actorRoleTitle,
  onOpenWorkflowInPipeline,
  onNavigate,
  onNotify,
}) => {
  const isAssignExamMenu = activeMenu === 'bgh-assign-exam';
  const isVicePrincipalView = actorRole === 'VICE_PRINCIPAL';

  const effectiveSchoolId = useMemo(() => {
    const s = String(schoolId || '').trim();
    if (s === 'SCHOOL_B' || s === 'sch-tieu-hoc-a') return 'SCHOOL_B';
    if (s === 'SCHOOL_C' || s === 'sch-thcs-b') return 'SCHOOL_C';
    if (actorUserId === 'user-school-admin-sia') return 'SCHOOL_B';
    if (actorUserId === 'user-school-admin-ddung') return 'SCHOOL_C';
    return 'SCHOOL_A';
  }, [schoolId, actorUserId]);

  const effectiveSchoolName = useMemo(() => {
    if (schoolName && schoolName.trim()) return schoolName.trim();
    if (effectiveSchoolId === 'SCHOOL_B') return 'Trường Tiểu học Sịa';
    if (effectiveSchoolId === 'SCHOOL_C') return 'Trường THCS Đặng Dung';
    return config.schoolName || 'Trường TH&THCS Nguyễn Đình Anh';
  }, [schoolName, effectiveSchoolId, config.schoolName]);

  const isPrimaryOnlySchool = useMemo(() => {
    const lower = effectiveSchoolName.toLowerCase();
    return (
      effectiveSchoolId === 'SCHOOL_B' ||
      (lower.includes('tiểu học') &&
        !lower.includes('th&thcs') &&
        !lower.includes('th &thcs') &&
        !lower.includes('thcs'))
    );
  }, [effectiveSchoolId, effectiveSchoolName]);

  const isLowerSecondaryOnlySchool = useMemo(() => {
    const lower = effectiveSchoolName.toLowerCase();
    return (
      effectiveSchoolId === 'SCHOOL_C' ||
      (lower.includes('thcs') &&
        !lower.includes('th&thcs') &&
        !lower.includes('th &thcs') &&
        !lower.includes('tiểu học'))
    );
  }, [effectiveSchoolId, effectiveSchoolName]);

  const allowedGrades = useMemo<number[]>(() => {
    if (isPrimaryOnlySchool) return [1, 2, 3, 4, 5];
    if (isLowerSecondaryOnlySchool) return [6, 7, 8, 9];
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }, [isPrimaryOnlySchool, isLowerSecondaryOnlySchool]);

  const gradeRangeLabel = useMemo(() => {
    if (isPrimaryOnlySchool) return '1–5';
    if (isLowerSecondaryOnlySchool) return '6–9';
    return '1–9';
  }, [isPrimaryOnlySchool, isLowerSecondaryOnlySchool]);

  const [schoolDepartments, setSchoolDepartments] = useState<SchoolDepartmentSummary[]>([]);
  const [schoolAccounts, setSchoolAccounts] = useState<SchoolTeacherAccountSummary[]>([]);
  const [schoolAssignments, setSchoolAssignments] = useState<SchoolTeachingAssignmentSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    const defaultAdminId =
      actorUserId ||
      (effectiveSchoolId === 'SCHOOL_B'
        ? 'user-school-admin-sia'
        : effectiveSchoolId === 'SCHOOL_C'
        ? 'user-school-admin-ddung'
        : 'user-school-admin-a');

    async function loadSchoolDepartmentsAndTeachers() {
      try {
        const deptRes = await fetch(
          `/api/admin/departments-and-assignments?schoolId=${encodeURIComponent(
            effectiveSchoolId
          )}&adminUserId=${encodeURIComponent(defaultAdminId)}`
        );
        if (!deptRes.ok || cancelled) return;
        const deptData = await deptRes.json();
        if (cancelled) return;

        if (Array.isArray(deptData?.departments)) {
          setSchoolDepartments(
            deptData.departments
              .map((d: any) => ({
                id: String(d?.id || ''),
                departmentName: String(d?.departmentName || d?.name || '').trim(),
                educationLevels: Array.isArray(d?.educationLevels) ? d.educationLevels : undefined,
                headFullName: d?.headFullName || null,
                memberUserIds: Array.isArray(d?.memberUserIds) ? d.memberUserIds : [],
                members: Array.isArray(d?.members) ? d.members : [],
              }))
              .filter(
                (d: SchoolDepartmentSummary) =>
                  Boolean(d.departmentName) && !isAdminManagementDept(d.departmentName)
              )
          );
        }

        if (Array.isArray(deptData?.accounts)) {
          setSchoolAccounts(
            deptData.accounts
              .map((acc: any) => ({
                id: String(acc?.id || ''),
                fullName: String(acc?.fullName || '').trim(),
                departmentName: String(acc?.departmentName || '').trim(),
                assignedGradesDisplay: Array.isArray(acc?.assignedGradesDisplay)
                  ? acc.assignedGradesDisplay.map(Number).filter(Boolean)
                  : undefined,
                subjectAllocations: Array.isArray(acc?.subjectAllocations)
                  ? acc.subjectAllocations
                  : undefined,
              }))
              .filter(
                (acc: SchoolTeacherAccountSummary) =>
                  Boolean(acc.fullName) && !isAdminManagementDept(acc.departmentName)
              )
          );
        }

        if (Array.isArray(deptData?.teachingAssignments)) {
          setSchoolAssignments(
            deptData.teachingAssignments
              .map((ta: any) => ({
                teacherUserId: String(ta?.teacherUserId || ''),
                teacherFullName: String(ta?.teacherFullName || '').trim(),
                departmentName: String(ta?.departmentName || '').trim(),
                educationLevelId:
                  ta?.educationLevelId === 'PRIMARY' || ta?.educationLevelId === 'LOWER_SECONDARY'
                    ? ta.educationLevelId
                    : undefined,
                subjectName: String(ta?.subjectName || '').trim(),
                gradeId: typeof ta?.gradeId === 'number' ? ta.gradeId : undefined,
                grades: Array.isArray(ta?.grades) ? ta.grades : undefined,
                status: ta?.status ? String(ta.status) : undefined,
              }))
              .filter((ta: SchoolTeachingAssignmentSummary) => Boolean(ta.subjectName))
          );
        }
      } catch {
        // Giữ danh sách dự phòng bên dưới nếu mất kết nối tạm thời
      }
    }

    loadSchoolDepartmentsAndTeachers();
    return () => {
      cancelled = true;
    };
  }, [effectiveSchoolId, actorUserId]);

  const allowedSubjects = useMemo<string[]>(() => {
    if (isPrimaryOnlySchool) return PRIMARY_SUBJECTS;
    if (isLowerSecondaryOnlySchool) return LOWER_SECONDARY_SUBJECTS;
    return ALL_PRIMARY_AND_LOWER_SECONDARY_SUBJECTS;
  }, [isPrimaryOnlySchool, isLowerSecondaryOnlySchool]);

  const allowedDepartments = useMemo<string[]>(() => {
    if (schoolDepartments.length > 0) {
      return Array.from(new Set(schoolDepartments.map((d) => d.departmentName)));
    }
    if (isPrimaryOnlySchool) {
      return ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4', 'Tổ 5'];
    }
    if (isLowerSecondaryOnlySchool) {
      return ['Tổ khoa học tự nhiên', 'Tổ khoa học xã hội', 'Tổ Tiếng Anh - GDTC'];
    }
    return [
      'Tổ 1-2-3',
      'Tổ 4-5',
      'Tổ khoa học tự nhiên',
      'Tổ khoa học xã hội',
      'Tổ Tiếng Anh - GDTC',
    ];
  }, [schoolDepartments, isPrimaryOnlySchool, isLowerSecondaryOnlySchool]);

  const schoolTeacherNames = useMemo<string[]>(() => {
    return Array.from(new Set(schoolAccounts.map((a) => a.fullName).filter(Boolean)));
  }, [schoolAccounts]);

  // Chế độ dữ liệu chính thức 100% (không nạp bộ 24 hồ sơ giả lập)
  const datasetMode: ExecutiveDatasetScopeMode = 'REAL_SCHOOL_DATA_ONLY';

  // Hồ sơ quyền thực tế theo tài khoản đang đăng nhập
  const activeRoleProfile: ExecutiveRolePermissionProfile = useMemo(() => {
    const resolvedRole: WorkflowActorRole =
      actorRole === 'VICE_PRINCIPAL'
        ? 'VICE_PRINCIPAL'
        : actorRole === 'HEAD_OF_DEPARTMENT'
        ? 'HEAD_OF_DEPARTMENT'
        : actorRole === 'TEACHER'
        ? 'TEACHER'
        : 'PRINCIPAL';

    const displayName = actorFullName
      ? `${actorFullName} (${actorRoleTitle || (resolvedRole === 'VICE_PRINCIPAL' ? 'Phó Hiệu trưởng' : 'Ban Giám hiệu')})`
      : resolvedRole === 'VICE_PRINCIPAL'
      ? 'Phó Hiệu trưởng'
      : EXECUTIVE_ROLE_PROFILES[0].fullName;

    return {
      accountId: actorUserId || 'exec-official-actor',
      fullName: displayName,
      role: resolvedRole,
      roleTitle:
        actorRoleTitle ||
        (resolvedRole === 'VICE_PRINCIPAL'
          ? 'Phó Hiệu trưởng – Quản lý Phân công ra đề & Thẩm định'
          : 'Ban Giám hiệu – Điều hành toàn trường'),
      allowedDepartments: 'ALL',
      allowedGrades: 'ALL',
      canViewAllSchool: resolvedRole !== 'TEACHER',
      canAssignOwnerOrReviewer: resolvedRole !== 'TEACHER',
      canSendInAppReminder: resolvedRole !== 'TEACHER',
      canRequestSupplement: resolvedRole !== 'TEACHER',
      canExportOfficialReport:
        resolvedRole === 'PRINCIPAL' || resolvedRole === 'VICE_PRINCIPAL',
    };
  }, [actorRole, actorFullName, actorRoleTitle, actorUserId]);

  // I. Bộ lọc 8 tiêu chí (Mặc định hiển thị tất cả năm học để không ẩn hồ sơ chính thức)
  const [filters, setFilters] = useState<ExecutiveDashboardFilterState>({
    schoolId: 'ALL',
    academicYearId: 'ALL',
    semester: 'ALL',
    examPeriod: 'ALL',
    gradeId: 'ALL',
    subjectId: 'ALL',
    departmentName: 'ALL',
    teacherName: 'ALL',
    statusCategory: 'ALL',
  });

  useEffect(() => {
    if (filters.gradeId !== 'ALL' && !allowedGrades.includes(Number(filters.gradeId))) {
      setFilters((p) => ({ ...p, gradeId: 'ALL' }));
    }
  }, [allowedGrades, filters.gradeId]);

  // Dữ liệu hồ sơ chính thức (làm sạch dữ liệu giả lập khi khởi tạo & đồng bộ từ máy chủ)
  const [rawAllRows, setAllRows] = useState<ExecutiveDossierRowExtended[]>(() => {
    purgeAllSampleWorkflowsFromLocal();
    return loadExecutiveDossierRows(questions, matrices, exams, 'REAL_SCHOOL_DATA_ONLY');
  });

  useEffect(() => {
    let cancelled = false;
    purgeAllSampleWorkflowsFromLocal();

    async function syncOfficialRowsFromServer() {
      try {
        const res = await fetch(
          `/api/workflows?officialOnly=true&schoolId=${encodeURIComponent(effectiveSchoolId)}`
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data?.workflows)) return;

        const serverOfficial: ExamWorkflow[] = data.workflows.filter(
          (w: ExamWorkflow) => !isSampleOrTestWorkflowDossier(w)
        );
        const localOfficial = loadSavedWorkflows(questions, matrices, exams);
        const mergedMap = new Map<string, ExamWorkflow>();
        serverOfficial.forEach((w) => mergedMap.set(w.workflowId, w));
        localOfficial.forEach((w) => {
          if (!mergedMap.has(w.workflowId)) {
            mergedMap.set(w.workflowId, w);
          }
        });
        const mergedWorkflows = Array.from(mergedMap.values()).filter(
          (w) => !w.schoolId || w.schoolId === effectiveSchoolId
        );
        mergedWorkflows.forEach((w) => saveWorkflowToLocal(w));
        if (!cancelled) {
          setAllRows(mergedWorkflows.map((wf) => enrichWorkflowRow(wf)));
        }
      } catch {
        if (!cancelled) {
          setAllRows(loadExecutiveDossierRows(questions, matrices, exams, 'REAL_SCHOOL_DATA_ONLY'));
        }
      }
    }

    syncOfficialRowsFromServer();
    return () => {
      cancelled = true;
    };
  }, [effectiveSchoolId, questions, matrices, exams]);

  const allRows = useMemo(
    () =>
      rawAllRows.filter(
        (r) =>
          (!r.workflow.schoolId || r.workflow.schoolId === effectiveSchoolId) &&
          allowedGrades.includes(Number(r.workflow.gradeId))
      ),
    [rawAllRows, effectiveSchoolId, allowedGrades]
  );

  const realSchoolRows = allRows;

  // Lọc theo phân quyền RBAC và 8 tiêu chí
  const filteredRows = useMemo(
    () => filterExecutiveDossierRows(allRows, filters, activeRoleProfile),
    [allRows, filters, activeRoleProfile]
  );

  // II. 8 Thẻ thống kê tính từ dữ liệu chính thức đang lọc
  const kpiSummary = useMemo(
    () =>
      computeExecutiveKpiSummary(
        filteredRows,
        effectiveSchoolName,
        filters.academicYearId === 'ALL' ? config.academicYear : filters.academicYearId,
        datasetMode
      ),
    [filteredRows, effectiveSchoolName, config.academicYear, filters.academicYearId]
  );

  // IV. 5 Biểu đồ điều hành
  const chartsData = useMemo(
    () => computeExecutiveDashboardCharts(filteredRows),
    [filteredRows]
  );

  // V. 5 Nhóm Cảnh báo ưu tiên
  const priorityAlerts = useMemo(
    () => computeExecutivePriorityAlerts(filteredRows),
    [filteredRows]
  );

  const [alertFilterType, setAlertFilterType] = useState<ExecutivePriorityAlertType | 'ALL'>(
    'ALL'
  );

  const filteredAlerts = useMemo(
    () =>
      alertFilterType === 'ALL'
        ? priorityAlerts
        : priorityAlerts.filter((a) => a.alertType === alertFilterType),
    [priorityAlerts, alertFilterType]
  );

  // Modal thao tác quản lý trên dòng hồ sơ (Phân công / Nhắc việc / Yêu cầu bổ sung / Lịch sử / Xóa)
  const [activeModal, setActiveModal] = useState<{
    mode: 'ASSIGN' | 'REMIND' | 'SUPPLEMENT' | 'HISTORY' | 'DELETE';
    row: ExecutiveDossierRowExtended;
  } | null>(null);

  const [modalCreatorInput, setModalCreatorInput] = useState<string>('');
  const [modalReviewerInput, setModalReviewerInput] = useState<string>('');
  const [modalAssigneeInput, setModalAssigneeInput] = useState<string>('');
  const [modalNoteInput, setModalNoteInput] = useState<string>(
    'Đề nghị xây dựng ma trận, ra đề và thẩm định đúng tiến độ kế hoạch của nhà trường.'
  );
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Modal Phân công ra đề mới & Làm sạch dữ liệu mẫu
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState<boolean>(false);
  const [showCleanConfirmModal, setShowCleanConfirmModal] = useState<boolean>(false);
  const [isCleaningData, setIsCleaningData] = useState<boolean>(false);

  const defaultAcademicYear = useMemo(
    () => String(config.academicYear || '2025-2026').trim(),
    [config.academicYear]
  );
  const [newAssignYear, setNewAssignYear] = useState<string>(defaultAcademicYear);
  const [newAssignPeriodLabel, setNewAssignPeriodLabel] = useState<string>('Giữa học kỳ 1');
  const [newAssignDept, setNewAssignDept] = useState<string>('');
  const [newAssignGrade, setNewAssignGrade] = useState<number>(allowedGrades[0] || 6);
  const [newAssignSubject, setNewAssignSubject] = useState<string>('Toán');
  const [newAssignCreator, setNewAssignCreator] = useState<string>('');
  const [newAssignReviewer, setNewAssignReviewer] = useState<string>('');
  const [newAssignDueDate, setNewAssignDueDate] = useState<string>(() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 9);
    return dt.toISOString().slice(0, 10);
  });
  const [newAssignExamDate, setNewAssignExamDate] = useState<string>(() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 14);
    return dt.toISOString().slice(0, 10);
  });
  const [newAssignConfidential, setNewAssignConfidential] = useState<boolean>(true);
  const [newAssignNote, setNewAssignNote] = useState<string>(
    'Thực hiện xây dựng ma trận, bản đặc tả và đề kiểm tra bám sát YCCĐ Chương trình GDPT 2018.'
  );

  const assignmentFormOptions = useMemo(() => {
    const effectiveDept =
      newAssignDept && allowedDepartments.includes(newAssignDept)
        ? newAssignDept
        : allowedDepartments[0] || '';
    const deptRec = schoolDepartments.find((d) =>
      areDeptNamesSame(d.departmentName, effectiveDept)
    );

    const memberIdSet = new Set<string>(deptRec?.memberUserIds || []);
    const deptAccounts = schoolAccounts.filter(
      (acc) => areDeptNamesSame(acc.departmentName, effectiveDept) || memberIdSet.has(acc.id)
    );
    deptAccounts.forEach((acc) => memberIdSet.add(acc.id));

    const gradeSet = new Set<number>();
    const deptKey = normalizeDeptKey(effectiveDept);
    if (deptKey === 'tổ 1-2-3') [1, 2, 3].forEach((g) => gradeSet.add(g));
    else if (deptKey === 'tổ 4-5') [4, 5].forEach((g) => gradeSet.add(g));
    else if (deptKey === 'tổ khoa học tự nhiên' || deptKey === 'tổ khoa học xã hội')
      [6, 7, 8, 9].forEach((g) => gradeSet.add(g));
    else if (deptKey.includes('tiếng anh'))
      allowedGrades.forEach((g) => gradeSet.add(g));

    deptAccounts.forEach((acc) => {
      (acc.assignedGradesDisplay || []).forEach((g) => gradeSet.add(Number(g)));
      (acc.subjectAllocations || []).forEach((al) =>
        (al.grades || []).forEach((g) => gradeSet.add(Number(g)))
      );
    });
    schoolAssignments.forEach((ta) => {
      if (ta.status === 'INACTIVE') return;
      if (
        areDeptNamesSame(ta.departmentName, effectiveDept) ||
        (ta.teacherUserId && memberIdSet.has(ta.teacherUserId))
      ) {
        if (typeof ta.gradeId === 'number') gradeSet.add(ta.gradeId);
        (ta.grades || []).forEach((g) => gradeSet.add(Number(g)));
      }
    });

    const grades = Array.from(gradeSet)
      .filter((g) => allowedGrades.includes(g))
      .sort((a, b) => a - b);
    const finalGrades = grades.length > 0 ? grades : allowedGrades;
    const effectiveGrade = finalGrades.includes(newAssignGrade)
      ? newAssignGrade
      : finalGrades[0] || allowedGrades[0] || 6;

    const targetLevel: 'PRIMARY' | 'LOWER_SECONDARY' =
      effectiveGrade <= 5 ? 'PRIMARY' : 'LOWER_SECONDARY';
    const subjSet = new Set<string>();
    schoolAssignments.forEach((ta) => {
      if (ta.status === 'INACTIVE') return;
      if (
        areDeptNamesSame(ta.departmentName, effectiveDept) ||
        (ta.teacherUserId && memberIdSet.has(ta.teacherUserId))
      ) {
        const taGrades =
          ta.grades && ta.grades.length > 0 ? ta.grades : ta.gradeId ? [ta.gradeId] : [];
        const matchesLvl =
          ta.educationLevelId === targetLevel ||
          taGrades.some((g) => (targetLevel === 'PRIMARY' ? Number(g) <= 5 : Number(g) >= 6));
        if (matchesLvl && ta.subjectName) subjSet.add(ta.subjectName);
      }
    });
    deptAccounts.forEach((acc) => {
      (acc.subjectAllocations || []).forEach((al) => {
        if (al.educationLevelId === targetLevel && al.subjectName) {
          subjSet.add(al.subjectName);
        }
      });
    });

    const fallbackSubjects =
      targetLevel === 'PRIMARY' ? PRIMARY_SUBJECTS : LOWER_SECONDARY_SUBJECTS;
    const subjects = subjSet.size > 0 ? Array.from(subjSet) : fallbackSubjects;

    const deptTeacherNames = Array.from(
      new Set([
        ...deptAccounts.map((a) => a.fullName).filter(Boolean),
        ...(deptRec?.members || []).map((m) => String(m.fullName || '').trim()).filter(Boolean),
      ])
    );
    const teachers = deptTeacherNames.length > 0 ? deptTeacherNames : schoolTeacherNames;

    return {
      effectiveDept,
      grades: finalGrades,
      effectiveGrade,
      subjects,
      teachers,
      headFullName: deptRec?.headFullName || teachers[0] || 'Tổ trưởng chuyên môn',
    };
  }, [
    newAssignDept,
    newAssignGrade,
    allowedDepartments,
    schoolDepartments,
    schoolAccounts,
    schoolAssignments,
    allowedGrades,
    schoolTeacherNames,
  ]);

  const [activeSectionTab, setActiveSectionTab] = useState<
    'OVERVIEW_TABLE_CHARTS' | 'PRIORITY_ALERTS' | 'EXPORT_REPORTS'
  >('OVERVIEW_TABLE_CHARTS');

  const uniqueTeachers = useMemo(() => {
    if (schoolTeacherNames.length > 0) return schoolTeacherNames;
    const set = new Set<string>();
    allRows.forEach((r) => {
      if (r.workflow.creatorName) set.add(r.workflow.creatorName);
    });
    return Array.from(set);
  }, [schoolTeacherNames, allRows]);

  const handleResetFilters = () => {
    setFilters({
      schoolId: 'ALL',
      academicYearId: 'ALL',
      semester: 'ALL',
      examPeriod: 'ALL',
      gradeId: 'ALL',
      subjectId: 'ALL',
      departmentName: 'ALL',
      teacherName: 'ALL',
      statusCategory: 'ALL',
    });
  };

  const handleOpenCreateAssignmentModal = () => {
    const initDept = assignmentFormOptions.effectiveDept;
    const initGrade = assignmentFormOptions.effectiveGrade;
    const initSubject = assignmentFormOptions.subjects[0] || 'Toán';
    const initCreator = assignmentFormOptions.teachers[0] || '';
    const initReviewer =
      assignmentFormOptions.teachers.find((t) => t !== initCreator) ||
      assignmentFormOptions.headFullName ||
      initCreator;

    setNewAssignDept(initDept);
    setNewAssignGrade(initGrade);
    setNewAssignSubject(initSubject);
    setNewAssignCreator(initCreator);
    setNewAssignReviewer(initReviewer);
    setShowCreateAssignmentModal(true);
  };

  const handleCreateOfficialAssignment = async () => {
    const chosenDept = assignmentFormOptions.effectiveDept;
    const chosenGrade = (
      assignmentFormOptions.grades.includes(newAssignGrade)
        ? newAssignGrade
        : assignmentFormOptions.effectiveGrade
    ) as GradeNumber;
    const chosenSubject = assignmentFormOptions.subjects.includes(newAssignSubject)
      ? newAssignSubject
      : assignmentFormOptions.subjects[0] || 'Toán';
    const chosenCreator =
      newAssignCreator.trim() || assignmentFormOptions.teachers[0] || 'Giáo viên bộ môn';
    const chosenReviewer =
      newAssignReviewer.trim() || assignmentFormOptions.headFullName || 'Tổ trưởng chuyên môn';

    const matchedAcc = schoolAccounts.find((a) => a.fullName.trim() === chosenCreator.trim());
    const periodCode: ExamWorkflow['examPeriod'] =
      newAssignPeriodLabel === 'Giữa học kỳ 1'
        ? 'MID_SEM_1'
        : newAssignPeriodLabel === 'Cuối học kỳ 1'
        ? 'END_SEM_1'
        : newAssignPeriodLabel === 'Giữa học kỳ 2'
        ? 'MID_SEM_2'
        : 'END_YEAR';
    const periodShort =
      periodCode === 'MID_SEM_1'
        ? 'GK1'
        : periodCode === 'END_SEM_1'
        ? 'CK1'
        : periodCode === 'MID_SEM_2'
        ? 'GK2'
        : 'CK2';
    const cleanSubjCode = chosenSubject
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 6);
    const timeSuffix = String(Date.now()).slice(-4);
    const wfId = `PC-${periodShort}-K${chosenGrade}-${cleanSubjCode}-${timeSuffix}`;
    const nowIso = new Date().toISOString();
    const eduLevel =
      chosenGrade <= 5 ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY;

    const newWf: ExamWorkflow = {
      workflowId: wfId,
      title: `Phân công ra đề ${newAssignPeriodLabel} – Môn ${chosenSubject} Khối ${chosenGrade} (${newAssignYear})`,
      schoolId: effectiveSchoolId,
      academicYearId: newAssignYear,
      gradeId: chosenGrade,
      subjectId: chosenSubject,
      examPeriod: periodCode,
      examPeriodLabel: newAssignPeriodLabel,
      examDate: newAssignExamDate,
      dueDate: newAssignDueDate,
      departmentName: chosenDept,
      creatorId: matchedAcc?.id || `teacher-${timeSuffix}`,
      creatorName: chosenCreator,
      matrixId: '',
      specificationId: '',
      examId: '',
      currentVersionId: 'v1.0',
      reviewReportId: '',
      approvalId: '',
      status: 'Draft',
      currentStep: 1,
      hasMatrixDocument: false,
      hasSpecificationDocument: false,
      isTestDataset: false,
      isConfidentialExam: newAssignConfidential,
      authorizedConfidentialRoles: [
        'TEACHER',
        'HEAD_OF_DEPARTMENT',
        'REVIEWER',
        'VICE_PRINCIPAL',
        'PRINCIPAL',
      ],
      assignedUsers: {
        creatorName: chosenCreator,
        creatorRole: 'TEACHER',
        matrixApproverName: assignmentFormOptions.headFullName,
        reviewerName: chosenReviewer,
        finalApproverName: actorFullName || 'Ban Giám hiệu',
        analyticsOwnerName: chosenCreator,
        currentAssigneeName: chosenCreator,
        currentAssigneeRole: 'TEACHER',
      },
      createdAt: nowIso,
      updatedAt: nowIso,
      step1QuestionBank: {
        selectedTopics: [],
        approvedQuestionIds: [],
        unapprovedQuestionBlockedCount: 0,
        supplementaryQuestionsCreatedCount: 0,
        coverageSatisfied: false,
        totalSelectedPoints: 0,
      },
      step2MatrixAndSpec: {
        educationLevel: eduLevel,
        templateCode: chosenGrade <= 5 ? 'TT27-TIEU-HOC' : 'CV7991-THCS',
        totalQuestions: 0,
        totalPoints: 10,
        durationMinutes: chosenGrade <= 5 ? 40 : 60,
        levelDistributionSummary:
          chosenGrade <= 5
            ? 'Mức 1: 40% · Mức 2: 40% · Mức 3: 20%'
            : 'Nhận biết: 40% · Thông hiểu: 30% · Vận dụng: 30%',
        learningOutcomesLinkedCount: 0,
        isValidStructure: false,
        matrixApprovalStatus: 'DRAFT',
        matrixSignature: '',
      },
      step3ExamGeneration: {
        variantCodes: [],
        questionIdsInExam: [],
        answerKeyComplete: false,
        gradingGuideComplete: false,
        matchesApprovedMatrix: false,
        totalExamPoints: 0,
      },
      step4AiQualityReview: {
        inspectedVersionId: '',
        criticalErrorsCount: 0,
        highErrorsCount: 0,
        mediumErrorsCount: 0,
        lowErrorsCount: 0,
        resolvedErrorsCount: 0,
        overallDashboardStatusLabel: 'Chưa chạy AI Quality Review',
        checked10Pillars: {
          curriculum: false,
          matrix: false,
          specification: false,
          questionContent: false,
          answerKey: false,
          gradingGuide: false,
          cognitiveLevel: false,
          points: false,
          language: false,
          formatting: false,
        },
      },
      step5TeacherRevision: {
        revisions: [],
        lastRevisionTriggeredMatrixReapproval: false,
        recheckedAffectedParts: false,
      },
      step6ProfessionalReview: { ballots: [] },
      step7OfficialApproval: {},
      step8DossierExport: { exports: [] },
      step9ResultsAnalysis: {},
      versionSnapshots: [
        {
          versionId: 'v1.0',
          versionNumber: 1,
          versionLabel: 'Khởi tạo phân công ra đề chính thức',
          createdAt: nowIso,
          createdBy: activeRoleProfile.fullName,
          createdByRole: activeRoleProfile.role,
          workflowStateAtCreation: 'Draft',
          stepNumberAtCreation: 1,
          matrixId: '',
          specificationId: '',
          examId: '',
          questionIds: [],
          totalPoints: 10,
          matrixStructureSignature: '',
          isImmutableApprovedLock: false,
          changeNote: `${activeRoleProfile.fullName} phân công ${chosenCreator} ra đề và ${chosenReviewer} phản biện. ${newAssignNote}`,
        },
      ],
      auditTrail: [
        {
          id: `audit-assign-new-${Date.now()}`,
          workflowId: wfId,
          timestamp: nowIso,
          actorId: activeRoleProfile.accountId,
          actorName: activeRoleProfile.fullName,
          actorRole: activeRoleProfile.role,
          actionType: 'WORKFLOW_CREATED',
          fromState: 'Draft',
          toState: 'Draft',
          fromStep: 1,
          toStep: 1,
          versionId: 'v1.0',
          backendVerified: true,
          summary: `[Phân công ra đề chính thức] ${activeRoleProfile.fullName} giao nhiệm vụ ra đề [${wfId}] (${newAssignPeriodLabel} – ${chosenSubject} Khối ${chosenGrade}) cho GV ${chosenCreator}, phản biện: ${chosenReviewer}, hạn nộp: ${newAssignDueDate}.`,
        },
      ],
    };

    const nextSaved = saveWorkflowToLocal(newWf);
    syncWorkflowToBackend(newWf, activeRoleProfile.fullName, activeRoleProfile.role);
    setAllRows(nextSaved.map((w) => enrichWorkflowRow(w)));

    try {
      await emitWorkflowNotificationEvent({
        workflowId: wfId,
        dossierTitle: newWf.title,
        subjectId: chosenSubject,
        gradeId: chosenGrade,
        departmentName: chosenDept,
        eventType: 'REVIEWER_ASSIGNED',
        senderUserId: activeRoleProfile.accountId,
        senderName: activeRoleProfile.fullName,
        senderRole: activeRoleProfile.role,
        recipientUserId: matchedAcc?.id || 'user-assigned-teacher',
        recipientName: chosenCreator,
        recipientRole: 'TEACHER',
        title: `[Phân công ra đề] ${chosenSubject} Khối ${chosenGrade} (${newAssignPeriodLabel})`,
        content: `${activeRoleProfile.fullName} đã phân công thầy/cô ra đề môn ${chosenSubject} Khối ${chosenGrade} (${newAssignPeriodLabel}). Cán bộ phản biện: ${chosenReviewer}. ${newAssignNote}`,
        priority: 'HIGH',
        targetMenuId: 'exam-workflow',
        targetWorkflowStep: 1,
        actionLabel: 'Nhận nhiệm vụ & Soạn ma trận',
        actionInstruction: newAssignNote,
        dueDate: newAssignDueDate,
      });
    } catch {
      // Bỏ qua lỗi thông báo ngoại tuyến
    }

    setShowCreateAssignmentModal(false);
    onNotify(
      'success',
      'Đã phân công ra đề chính thức',
      `Đã giao nhiệm vụ ra đề [${wfId}] (${chosenSubject} Khối ${chosenGrade} – ${newAssignPeriodLabel}) cho ${chosenCreator} (phản biện: ${chosenReviewer}).`
    );
  };

  const handleConfirmCleanSampleData = async () => {
    setIsCleaningData(true);
    try {
      purgeAllSampleWorkflowsFromLocal();
      await fetch('/api/workflows/clean-sample-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: effectiveSchoolId,
          actorUserId: activeRoleProfile.accountId,
          actorName: activeRoleProfile.fullName,
          actorRole: activeRoleProfile.role,
        }),
      });
      const res = await fetch(
        `/api/workflows?officialOnly=true&schoolId=${encodeURIComponent(effectiveSchoolId)}`
      );
      if (res.ok) {
        const data = await res.json();
        const serverClean: ExamWorkflow[] = Array.isArray(data?.workflows)
          ? data.workflows.filter((w: ExamWorkflow) => !isSampleOrTestWorkflowDossier(w))
          : [];
        const localClean = loadSavedWorkflows(questions, matrices, exams);
        const merged = new Map<string, ExamWorkflow>();
        serverClean.forEach((w) => merged.set(w.workflowId, w));
        localClean.forEach((w) => {
          if (!merged.has(w.workflowId)) merged.set(w.workflowId, w);
        });
        setAllRows(Array.from(merged.values()).map((w) => enrichWorkflowRow(w)));
      } else {
        setAllRows(loadExecutiveDossierRows(questions, matrices, exams, 'REAL_SCHOOL_DATA_ONLY'));
      }
      handleResetFilters();
      setShowCleanConfirmModal(false);
      onNotify(
        'success',
        'Đã làm sạch dữ liệu mẫu & giả lập',
        'Toàn bộ hồ sơ giả lập/kiểm thử đã được dọn sạch. Mục Phân công ra đề sẵn sàng 100% cho dữ liệu chính thức.'
      );
    } catch {
      setAllRows(loadExecutiveDossierRows(questions, matrices, exams, 'REAL_SCHOOL_DATA_ONLY'));
      setShowCleanConfirmModal(false);
      onNotify(
        'success',
        'Đã làm sạch dữ liệu mẫu cục bộ',
        'Đã dọn sạch các hồ sơ giả lập lưu trên trình duyệt để vận hành chính thức.'
      );
    } finally {
      setIsCleaningData(false);
    }
  };

  const handleConfirmModalAction = async () => {
    if (!activeModal) return;
    if (activeModal.mode === 'HISTORY') {
      setActiveModal(null);
      return;
    }

    if (activeModal.mode === 'DELETE') {
      setIsSubmittingAction(true);
      try {
        const targetId = activeModal.row.workflow.workflowId;
        const delRes = await deleteOfficialWorkflowDossier(targetId);
        if (!delRes.ok) {
          onNotify(
            'error',
            'Không thể xóa phân công',
            delRes.errorMessage || 'Hồ sơ đã được phê duyệt chính thức nên không thể xóa.'
          );
          return;
        }
        setAllRows(delRes.remaining.map((w) => enrichWorkflowRow(w)));
        setActiveModal(null);
        onNotify(
          'info',
          'Đã xóa phân công nháp',
          `Đã gỡ phân công [${targetId}] khỏi danh sách chính thức.`
        );
      } finally {
        setIsSubmittingAction(false);
      }
      return;
    }

    setIsSubmittingAction(true);
    try {
      const actionMap = {
        ASSIGN: 'ASSIGN_PERSONNEL' as const,
        REMIND: 'SEND_IN_APP_REMINDER' as const,
        SUPPLEMENT: 'REQUEST_SUPPLEMENT' as const,
      };
      const res = await executeExecutiveManagementAction({
        actionType: actionMap[activeModal.mode],
        row: activeModal.row,
        actorProfile: activeRoleProfile,
        creatorName: activeModal.mode === 'ASSIGN' ? modalCreatorInput : undefined,
        reviewerName: activeModal.mode === 'ASSIGN' ? modalReviewerInput : undefined,
        assigneeName: modalAssigneeInput,
        noteText: modalNoteInput,
      });

      if (!res.allowed) {
        onNotify('error', `Từ chối thao tác (HTTP ${res.httpStatus})`, res.message);
        return;
      }

      if (res.updatedWorkflow) {
        const updatedEnriched = enrichWorkflowRow(res.updatedWorkflow);
        setAllRows((prev) =>
          prev.map((item) =>
            item.workflow.workflowId === updatedEnriched.workflow.workflowId
              ? updatedEnriched
              : item
          )
        );
      }

      onNotify('success', 'Đã cập nhật phân công & chỉ đạo', res.message);
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleExportReport = (format: 'WORD_DOC' | 'EXCEL_CSV' | 'PDF_PRINT') => {
    if (!activeRoleProfile.canExportOfficialReport) {
      onNotify(
        'error',
        'Không đủ quyền xuất Báo cáo chính thức (HTTP 403)',
        `Vai trò [${activeRoleProfile.roleTitle}] không có quyền kết xuất Báo cáo chính thức cấp trường.`
      );
      return;
    }

    const targetRows = filteredRows;
    const targetKpis = computeExecutiveKpiSummary(
      targetRows,
      effectiveSchoolName,
      filters.academicYearId === 'ALL' ? config.academicYear : filters.academicYearId,
      'REAL_SCHOOL_DATA_ONLY'
    );
    const targetAlerts = computeExecutivePriorityAlerts(targetRows);

    exportExecutiveReportDocument({
      format,
      rows: targetRows,
      kpis: targetKpis,
      alerts: targetAlerts,
      schoolName: effectiveSchoolName,
      academicYear: config.academicYear,
      actorName: actorFullName || activeRoleProfile.fullName,
      isOfficialRealDataOnly: true,
    });

    onNotify(
      'success',
      `Đã kết xuất Báo cáo chính thức (${format})`,
      `Đã xuất báo cáo từ ${targetRows.length} hồ sơ phân công thực tế của ${effectiveSchoolName}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Mục 3. Phân công ra đề / Bảng điều khiển hồ sơ */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-900 text-amber-300">
                <ClipboardList className="w-3.5 h-3.5" />
                {isVicePrincipalView && isAssignExamMenu
                  ? 'PHÓ HIỆU TRƯỞNG · MỤC 3. PHÂN CÔNG RA ĐỀ CHÍNH THỨC'
                  : isAssignExamMenu
                  ? 'BAN GIÁM HIỆU · PHÂN CÔNG RA ĐỀ & THẨM ĐỊNH'
                  : 'BAN GIÁM HIỆU · ĐIỀU HÀNH HỒ SƠ KIỂM TRA TOÀN TRƯỜNG'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Dữ liệu Vận hành Chính thức · {effectiveSchoolName}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isAssignExamMenu
                ? 'PHÂN CÔNG RA ĐỀ KIỂM TRA & CÁN BỘ PHẢN BIỆN CHÍNH THỨC'
                : 'BẢNG ĐIỀU KHIỂN QUẢN LÝ HỒ SƠ KIỂM TRA TOÀN TRƯỜNG'}
            </h1>
            <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
              {isAssignExamMenu
                ? 'Phân công giáo viên ra đề, giáo viên phản biện/thẩm định theo Tổ chuyên môn, Khối lớp, Môn học, Kỳ kiểm tra định kỳ và đôn đốc tiến độ thực hiện chính thức của nhà trường.'
                : 'Giám sát thời gian thực công tác xây dựng Ma trận, Tạo đề, AI Kiểm tra chất lượng, Thẩm định chuyên môn và Phê duyệt chính thức theo Chương trình GDPT 2018.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreateAssignmentModal}
              className="px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Phân công ra đề mới</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportReport('WORD_DOC')}
              className="px-3 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Xuất Word</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportReport('EXCEL_CSV')}
              className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCleanConfirmModal(true)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Dọn sạch mọi hồ sơ giả lập / thử nghiệm còn lưu tạm (giữ nguyên dữ liệu chính thức)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Làm sạch dữ liệu mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* I. BỘ LỌC 8 TIÊU CHÍ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
            <Filter className="w-4 h-4 text-blue-700" />
            <span>BỘ LỌC PHÂN CÔNG & TIẾN ĐỘ (8 TIÊU CHÍ)</span>
            <span className="text-slate-500 font-normal">
              · Đang hiển thị <strong className="text-slate-900">{filteredRows.length}</strong>/
              {allRows.length} hồ sơ chính thức · Người điều hành:{' '}
              <strong className="text-blue-900">{activeRoleProfile.fullName}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-blue-700 cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
          {/* 1. Năm học */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              1. Năm học
            </label>
            <select
              value={filters.academicYearId}
              onChange={(e) => setFilters((p) => ({ ...p, academicYearId: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Tất cả năm học</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          {/* 2. Học kỳ */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              2. Học kỳ
            </label>
            <select
              value={filters.semester}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  semester: e.target.value as ExecutiveSemesterCode | 'ALL',
                }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Cả năm (HK I & II)</option>
              <option value="SEM_1">Học kỳ I</option>
              <option value="SEM_2">Học kỳ II</option>
            </select>
          </div>

          {/* 3. Kỳ kiểm tra */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              3. Kỳ kiểm tra
            </label>
            <select
              value={filters.examPeriod}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  examPeriod: e.target.value as ExecutiveDashboardFilterState['examPeriod'],
                }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Tất cả kỳ kiểm tra</option>
              <option value="MID_SEM_1">Giữa học kỳ 1</option>
              <option value="END_SEM_1">Cuối học kỳ 1</option>
              <option value="MID_SEM_2">Giữa học kỳ 2</option>
              <option value="END_YEAR">Cuối học kỳ 2</option>
            </select>
          </div>

          {/* 4. Khối lớp */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              4. Khối lớp
            </label>
            <select
              value={String(filters.gradeId)}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  gradeId:
                    e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as GradeNumber),
                }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Tất cả khối ({gradeRangeLabel})</option>
              {allowedGrades.map((g) => (
                <option key={g} value={String(g)}>
                  Khối lớp {g} ({g <= 5 ? 'Tiểu học' : 'THCS'})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Môn học */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              5. Môn học
            </label>
            <select
              value={filters.subjectId}
              onChange={(e) => setFilters((p) => ({ ...p, subjectId: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Tất cả môn học</option>
              {allowedSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Tổ chuyên môn */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              6. Tổ chuyên môn
            </label>
            <select
              value={filters.departmentName}
              onChange={(e) => setFilters((p) => ({ ...p, departmentName: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Tất cả tổ chuyên môn</option>
              {allowedDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Giáo viên */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              7. Giáo viên ra đề
            </label>
            <select
              value={filters.teacherName}
              onChange={(e) => setFilters((p) => ({ ...p, teacherName: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Tất cả giáo viên ({uniqueTeachers.length})</option>
              {uniqueTeachers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 8. Trạng thái */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              8. Trạng thái hồ sơ
            </label>
            <select
              value={filters.statusCategory}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  statusCategory:
                    e.target.value as ExecutiveDashboardFilterState['statusCategory'],
                }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="BUILDING">Đang xây dựng</option>
              <option value="AWAITING_REVIEW">Chờ thẩm định</option>
              <option value="REVISION_REQUIRED">Yêu cầu chỉnh sửa</option>
              <option value="AWAITING_APPROVAL">Chờ phê duyệt</option>
              <option value="APPROVED">Đã phê duyệt / Phát hành</option>
              <option value="OVERDUE">Hồ sơ quá hạn</option>
              <option value="UNRESOLVED_CRITICAL">Có lỗi nghiêm trọng AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* II. 8 THẺ THỐNG KÊ CHÍNH THỨC */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          {
            order: 1,
            label: 'Tổng số phân công',
            val: kpiSummary.totalDossiers,
            sub: 'Hồ sơ chính thức',
            border: 'border-slate-200 bg-white',
            numColor: 'text-slate-900',
          },
          {
            order: 2,
            label: 'Đang xây dựng',
            val: kpiSummary.buildingCount,
            sub: 'Ma trận / Đề / AI',
            border: 'border-blue-200 bg-blue-50/40',
            numColor: 'text-blue-900',
          },
          {
            order: 3,
            label: 'Chờ thẩm định',
            val: kpiSummary.awaitingReviewCount,
            sub: 'Đang phản biện',
            border: 'border-indigo-200 bg-indigo-50/40',
            numColor: 'text-indigo-900',
          },
          {
            order: 4,
            label: 'Yêu cầu chỉnh sửa',
            val: kpiSummary.revisionRequiredCount,
            sub: 'Cần GV hoàn thiện',
            border: 'border-amber-300 bg-amber-50/50',
            numColor: 'text-amber-900',
          },
          {
            order: 5,
            label: 'Chờ phê duyệt',
            val: kpiSummary.awaitingApprovalCount,
            sub: 'Trình BGH duyệt',
            border: 'border-purple-200 bg-purple-50/40',
            numColor: 'text-purple-900',
          },
          {
            order: 6,
            label: 'Đã phê duyệt',
            val: kpiSummary.approvedCount,
            sub: 'Khóa đề / Phát hành',
            border: 'border-emerald-300 bg-emerald-50/50',
            numColor: 'text-emerald-900',
          },
          {
            order: 7,
            label: 'Hồ sơ quá hạn',
            val: kpiSummary.overdueCount,
            sub: 'Cần đôn đốc ngay',
            border: 'border-rose-300 bg-rose-50/60',
            numColor: 'text-rose-800',
          },
          {
            order: 8,
            label: 'Lỗi nghiêm trọng',
            val: kpiSummary.unresolvedCriticalErrorCount,
            sub: 'AI phát hiện chưa sửa',
            border: 'border-red-300 bg-red-50/60',
            numColor: 'text-red-800',
          },
        ].map((card) => (
          <div
            key={card.order}
            className={`rounded-xl border p-3.5 shadow-2xs flex flex-col justify-between ${card.border}`}
          >
            <div className="text-[11px] font-bold text-slate-600">
              {card.order}. {card.label}
            </div>
            <div className={`text-2xl font-extrabold my-1 ${card.numColor}`}>
              {card.val}
            </div>
            <div className="text-[10px] text-slate-500">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Thanh chuyển đổi khu vực xem chính thức */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          {
            id: 'OVERVIEW_TABLE_CHARTS',
            label: `Danh sách Phân công Ra đề (${filteredRows.length}) & Biểu đồ Tổng hợp`,
          },
          {
            id: 'PRIORITY_ALERTS',
            label: `Cảnh báo Đôn đốc Ưu tiên (${priorityAlerts.length} cảnh báo)`,
          },
          {
            id: 'EXPORT_REPORTS',
            label: 'Kết xuất Báo cáo Chính thức (Word, Excel, PDF)',
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSectionTab(tab.id as typeof activeSectionTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSectionTab === tab.id
                ? 'bg-blue-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DANH SÁCH PHÂN CÔNG RA ĐỀ + BIỂU ĐỒ */}
      {activeSectionTab === 'OVERVIEW_TABLE_CHARTS' && (
        <div className="space-y-6">
          {/* BẢNG PHÂN CÔNG RA ĐỀ & TIẾN ĐỘ (Đưa lên đầu để Phó Hiệu trưởng thao tác thuận tiện nhất) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  DANH SÁCH PHÂN CÔNG RA ĐỀ, PHẢN BIỆN & TIẾN ĐỘ THỰC HIỆN CHÍNH THỨC
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Quản lý trực tiếp giáo viên ra đề, cán bộ phản biện thẩm định, hạn hoàn thành và nhắc việc trong ứng dụng.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateAssignmentModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold cursor-pointer self-start md:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phân công mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-3">1. Môn & Kỳ kiểm tra</th>
                    <th className="py-3 px-2.5">2. Khối</th>
                    <th className="py-3 px-3">3. Phân công Nhân sự</th>
                    <th className="py-3 px-2.5">4. Ma trận</th>
                    <th className="py-3 px-2.5">5. Trạng thái Đề</th>
                    <th className="py-3 px-3">6. Kiểm tra AI</th>
                    <th className="py-3 px-2.5">7. Thẩm định</th>
                    <th className="py-3 px-2.5">8. Phê duyệt</th>
                    <th className="py-3 px-2.5">9. Hạn hoàn thành</th>
                    <th className="py-3 px-3 text-right">10. Thao tác Điều hành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((row) => {
                    const wf = row.workflow;
                    return (
                      <tr key={wf.workflowId} className="hover:bg-slate-50/90">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{wf.subjectId}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {wf.workflowId} · {wf.examPeriodLabel}
                          </div>
                        </td>

                        <td className="py-3 px-2.5 whitespace-nowrap font-bold text-slate-800">
                          Khối {wf.gradeId}
                        </td>

                        <td className="py-3 px-3 space-y-0.5">
                          <div className="font-semibold text-slate-900">
                            GV ra đề: <span className="text-blue-950">{wf.creatorName}</span>
                          </div>
                          <div className="text-[11px] text-slate-700">
                            Phản biện:{' '}
                            <strong>{wf.assignedUsers.reviewerName || 'Chưa phân công'}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {wf.departmentName} · Đang xử lý:{' '}
                            {row.isUnassignedOwner
                              ? 'Chưa gán'
                              : wf.assignedUsers.currentAssigneeName}
                          </div>
                        </td>

                        <td className="py-3 px-2.5">
                          <span
                            className={
                              wf.step2MatrixAndSpec.matrixApprovalStatus === 'APPROVED'
                                ? 'text-emerald-800 font-semibold'
                                : 'text-amber-800 font-semibold'
                            }
                          >
                            {wf.step2MatrixAndSpec.matrixApprovalStatus === 'APPROVED'
                              ? 'Đã duyệt'
                              : wf.step2MatrixAndSpec.matrixApprovalStatus === 'PENDING_REVIEW'
                              ? 'Chờ duyệt'
                              : 'Bản nháp'}
                          </span>
                        </td>

                        <td className="py-3 px-2.5">
                          <div className="font-semibold text-blue-950">
                            Bước {wf.currentStep}/9 · {wf.status}
                          </div>
                          {row.returnedCount > 0 && (
                            <div className="text-[10px] text-rose-700 font-semibold">
                              Trả lại: {row.returnedCount} lần
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {row.hasUnresolvedCriticalAiError ? (
                            <span className="text-rose-700 font-extrabold">
                              {wf.step4AiQualityReview.criticalErrorsCount} lỗi nghiêm trọng
                            </span>
                          ) : wf.step4AiQualityReview.inspectedVersionId ? (
                            <span className="text-emerald-800 font-semibold">
                              Đạt (0 lỗi nghiêm trọng)
                            </span>
                          ) : (
                            <span className="text-slate-500">Chưa chạy AI</span>
                          )}
                        </td>

                        <td className="py-3 px-2.5">
                          {wf.step6ProfessionalReview.latestDecision ===
                          'ELIGIBLE_FOR_APPROVAL' ? (
                            <span className="text-emerald-800 font-semibold">Đạt thẩm định</span>
                          ) : wf.step6ProfessionalReview.latestDecision === 'REVISION_REQUIRED' ? (
                            <span className="text-rose-700 font-semibold">Yêu cầu sửa</span>
                          ) : (
                            <span className="text-slate-600">Chưa thẩm định</span>
                          )}
                        </td>

                        <td className="py-3 px-2.5">
                          {wf.step7OfficialApproval.approvalRecord ? (
                            <span className="text-emerald-800 font-bold">
                              Đã phê duyệt ({wf.currentVersionId})
                            </span>
                          ) : wf.status === 'AwaitingApproval' ? (
                            <span className="text-blue-800 font-semibold">Chờ BGH duyệt</span>
                          ) : (
                            <span className="text-slate-500">Chưa trình duyệt</span>
                          )}
                        </td>

                        <td className="py-3 px-2.5 whitespace-nowrap">
                          <div
                            className={`font-mono font-semibold ${
                              row.isOverdue ? 'text-rose-700 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            {wf.dueDate || wf.examDate}
                          </div>
                          <div className="text-[10px] text-slate-500">Ngày thi: {wf.examDate}</div>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenWorkflowInPipeline(wf.workflowId)}
                              className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setModalCreatorInput(
                                  wf.creatorName || uniqueTeachers[0] || ''
                                );
                                setModalReviewerInput(
                                  wf.assignedUsers.reviewerName ||
                                    uniqueTeachers[1] ||
                                    uniqueTeachers[0] ||
                                    ''
                                );
                                setModalAssigneeInput(
                                  wf.assignedUsers.currentAssigneeName ||
                                    wf.creatorName ||
                                    uniqueTeachers[0] ||
                                    ''
                                );
                                setActiveModal({ mode: 'ASSIGN', row });
                              }}
                              className="px-2 py-1 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-semibold cursor-pointer"
                            >
                              Phân công
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setModalNoteInput(
                                  `Đề nghị hoàn thành nhiệm vụ hồ sơ [${wf.workflowId}] trước hạn ${wf.dueDate || wf.examDate}.`
                                );
                                setActiveModal({ mode: 'REMIND', row });
                              }}
                              className="px-2 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-medium cursor-pointer"
                            >
                              Nhắc việc
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setModalNoteInput(
                                  `Yêu cầu bổ sung hoàn thiện đáp án, hướng dẫn chấm và rà soát lỗi AI cho hồ sơ [${wf.workflowId}].`
                                );
                                setActiveModal({ mode: 'SUPPLEMENT', row });
                              }}
                              className="px-2 py-1 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-medium cursor-pointer"
                            >
                              Yêu cầu bổ sung
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveModal({ mode: 'HISTORY', row })}
                              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] cursor-pointer"
                            >
                              Lịch sử
                            </button>
                            {wf.status !== 'Approved' &&
                              wf.status !== 'Released' &&
                              wf.status !== 'Archived' && (
                                <button
                                  type="button"
                                  onClick={() => setActiveModal({ mode: 'DELETE', row })}
                                  className="px-2 py-1 rounded border border-rose-200 bg-slate-50 hover:bg-rose-50 text-rose-700 text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"
                                  title="Xóa phân công chưa phê duyệt"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa</span>
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-10 text-center bg-slate-50/40">
                        <div className="max-w-xl mx-auto space-y-3">
                          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {allRows.length === 0
                              ? 'Dữ liệu đã được làm sạch — Sẵn sàng phân công ra đề chính thức'
                              : 'Không có hồ sơ phân công nào khớp với bộ lọc hiện tại'}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {allRows.length === 0
                              ? 'Toàn bộ dữ liệu giả lập (24 hồ sơ mẫu) và bản ghi thử nghiệm đã được loại bỏ hoàn toàn. Bấm "Phân công ra đề mới" để giao nhiệm vụ ra đề & phản biện cho giáo viên thực tế của nhà trường.'
                              : 'Vui lòng đặt lại bộ lọc để xem toàn bộ danh sách phân công ra đề chính thức.'}
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            {allRows.length === 0 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleOpenCreateAssignmentModal}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold cursor-pointer shadow-xs"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  <span>Phân công ra đề mới</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onNavigate('progress-management')}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold cursor-pointer"
                                >
                                  <ClipboardList className="w-4 h-4 text-blue-700" />
                                  <span>Mở mục 2. Kế hoạch kiểm tra</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Đặt lại bộ lọc</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5 BIỂU ĐỒ TỔNG HỢP CHÍNH THỨC (Dùng SVG thuần + Tailwind, không inline style) */}
          {filteredRows.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase">
                  Biểu đồ 1: Tiến độ theo Tổ chuyên môn
                </h3>
                <div className="mt-3 space-y-3">
                  {chartsData.byDepartment
                    .filter((d) => !isAdminManagementDept(d.departmentName))
                    .map((dept) => {
                      const inProgWidth =
                        dept.totalCount > 0
                          ? Math.max(
                              0,
                              Math.round(
                                ((dept.inProgressCount - dept.overdueCount) / dept.totalCount) * 100
                              )
                            )
                          : 0;
                      const overdueWidth =
                        dept.totalCount > 0
                          ? Math.max(0, Math.round((dept.overdueCount / dept.totalCount) * 100))
                          : 0;
                      return (
                        <div key={dept.departmentName} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">
                              {dept.departmentName}
                            </span>
                            <span className="text-[11px] text-slate-600 font-mono">
                              Hoàn thành: {dept.completedCount}/{dept.totalCount} (
                              {dept.completionPercent}%)
                              {dept.overdueCount > 0 ? ` · Quá hạn: ${dept.overdueCount}` : ''}
                            </span>
                          </div>
                          <svg
                            viewBox="0 0 100 6"
                            preserveAspectRatio="none"
                            className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100"
                          >
                            <rect
                              x={0}
                              y={0}
                              width={dept.completionPercent}
                              height={6}
                              className="fill-emerald-600"
                            />
                            <rect
                              x={dept.completionPercent}
                              y={0}
                              width={inProgWidth}
                              height={6}
                              className="fill-blue-500"
                            />
                            <rect
                              x={dept.completionPercent + inProgWidth}
                              y={0}
                              width={overdueWidth}
                              height={6}
                              className="fill-rose-500"
                            />
                          </svg>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase">
                  Biểu đồ 2: Tiến độ theo Khối lớp (Khối {allowedGrades[0]} → Khối{' '}
                  {allowedGrades[allowedGrades.length - 1]})
                </h3>
                <div
                  className={`mt-3 grid grid-cols-3 ${
                    allowedGrades.length === 5
                      ? 'sm:grid-cols-5'
                      : allowedGrades.length === 4
                      ? 'sm:grid-cols-4'
                      : 'sm:grid-cols-9'
                  } gap-2 items-end pt-2`}
                >
                  {chartsData.byGrade
                    .filter((g) => allowedGrades.includes(Number(g.gradeId)))
                    .map((g) => {
                      const barHeight = Math.round((Math.max(6, g.completionPercent) / 100) * 80);
                      return (
                        <div
                          key={g.gradeId}
                          className="flex flex-col items-center bg-slate-50 rounded-xl p-2 border border-slate-200/80"
                        >
                          <div className="text-[10px] font-mono font-bold text-emerald-700">
                            {g.completionPercent}%
                          </div>
                          <svg
                            viewBox="0 0 20 80"
                            preserveAspectRatio="none"
                            className="w-5 h-20 bg-slate-200 rounded-md overflow-hidden my-1"
                          >
                            <rect
                              x={0}
                              y={80 - barHeight}
                              width={20}
                              height={barHeight}
                              className="fill-emerald-600"
                            />
                          </svg>
                          <div className="text-[11px] font-bold text-slate-900">{g.gradeLabel}</div>
                          <div className="text-[10px] text-slate-500">
                            {g.completedCount}/{g.totalCount} HS
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase">
                  Biểu đồ 3: Số hồ sơ theo Trạng thái
                </h3>
                <div className="mt-3 space-y-2.5">
                  {chartsData.byStatus.map((st) => (
                    <div key={st.statusCode} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">{st.statusLabel}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {st.count} ({st.percent}%)
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 100 6"
                        preserveAspectRatio="none"
                        className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
                      >
                        <rect
                          x={0}
                          y={0}
                          width={st.percent}
                          height={6}
                          className="fill-blue-700"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase">
                  Biểu đồ 4: Số lỗi chất lượng đề theo Nhóm tiêu chí
                </h3>
                <div className="mt-3 space-y-2.5 text-xs">
                  {chartsData.byQualityErrorGroup.map((grp) => (
                    <div
                      key={grp.groupCode}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{grp.groupLabel}</div>
                        <div className="text-[10px] text-slate-500">
                          Nghiêm trọng: <strong className="text-rose-700">{grp.criticalCount}</strong>{' '}
                          · Cao: <strong className="text-amber-700">{grp.highCount}</strong> · TB/Thấp:{' '}
                          {grp.mediumLowCount}
                        </div>
                      </div>
                      <span className="font-mono font-extrabold text-sm text-slate-900">
                        {grp.totalCount} lỗi
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase">
                  Biểu đồ 5: Thời gian xử lý TB từng bước (Giờ)
                </h3>
                <div className="mt-3 space-y-1.5 text-xs">
                  {chartsData.avgProcessingTimeByStep.map((s) => (
                    <div key={s.stepNumber} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-700 truncate">{s.stepTitle}</span>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span
                          className={
                            s.isBottleneck
                              ? 'text-rose-700 font-bold'
                              : 'text-emerald-700 font-semibold'
                          }
                        >
                          TB: {s.avgHours}h
                        </span>
                        <span className="text-slate-400">/ Chuẩn {s.slaTargetHours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CẢNH BÁO ƯU TIÊN */}
      {activeSectionTab === 'PRIORITY_ALERTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                TRUNG TÂM CẢNH BÁO ĐÔN ĐỐC PHÂN CÔNG RA ĐỀ & THẨM ĐỊNH
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Tự động phát hiện: Hồ sơ chưa phân công người phụ trách, hồ sơ quá hạn, sát ngày kiểm tra chưa phê duyệt, hoặc có lỗi nghiêm trọng AI chưa xử lý.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: `Tất cả (${priorityAlerts.length})` },
                { id: 'UNASSIGNED_OWNER', label: 'Chưa phân công phụ trách' },
                { id: 'OVERDUE_DOSSIER', label: 'Hồ sơ quá hạn' },
                { id: 'RETURNED_MULTIPLE_TIMES', label: 'Trả lại nhiều lần' },
                { id: 'UNRESOLVED_CRITICAL_ERROR', label: 'Có lỗi nghiêm trọng' },
                { id: 'UNAPPROVED_NEAR_EXAM_DATE', label: 'Sát ngày thi chưa duyệt' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() =>
                    setAlertFilterType(btn.id as ExecutivePriorityAlertType | 'ALL')
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    alertFilterType === btn.id
                      ? 'bg-rose-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="p-8 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-emerald-950">
                Hiện không có cảnh báo tồn đọng (0 cảnh báo)
              </div>
              <p className="text-xs text-emerald-800">
                Khi có hồ sơ chính thức chưa phân công người phụ trách hoặc trễ hạn, hệ thống sẽ hiển thị tại đây để Phó Hiệu trưởng đôn đốc kịp thời.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAlerts.map((alert) => {
                const targetRow = filteredRows.find(
                  (r) => r.workflow.workflowId === alert.workflowId
                );
                return (
                  <div
                    key={alert.alertId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-extrabold text-rose-800">
                          [Ưu tiên #{alert.priorityRank} · {alert.severity}] {alert.alertTypeLabel}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono font-bold text-slate-900">
                          {alert.workflowId}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800">
                          Khối {alert.gradeId} {alert.subjectId} ({alert.departmentName})
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{alert.detailReason}</p>
                      <div className="text-[11px] text-slate-500">
                        Người phụ trách: <strong>{alert.ownerName}</strong> · Hạn hoàn thành:{' '}
                        <strong className="font-mono">{alert.dueDate}</strong> · Ngày kiểm tra:{' '}
                        <strong className="font-mono">{alert.examDate}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {targetRow && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setModalCreatorInput(targetRow.workflow.creatorName);
                              setModalReviewerInput(
                                targetRow.workflow.assignedUsers.reviewerName ||
                                  uniqueTeachers[0] ||
                                  ''
                              );
                              setModalAssigneeInput(
                                targetRow.workflow.assignedUsers.currentAssigneeName ||
                                  uniqueTeachers[0] ||
                                  ''
                              );
                              setActiveModal({ mode: 'ASSIGN', row: targetRow });
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                          >
                            Phân công
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalNoteInput(alert.recommendedAction);
                              setActiveModal({ mode: 'REMIND', row: targetRow });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold cursor-pointer"
                          >
                            Nhắc việc ngay
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenWorkflowInPipeline(alert.workflowId)}
                        className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                      >
                        Mở hồ sơ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KẾT XUẤT BÁO CÁO CHÍNH THỨC */}
      {activeSectionTab === 'EXPORT_REPORTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                KẾT XUẤT BÁO CÁO PHÂN CÔNG RA ĐỀ & TIẾN ĐỘ CHÍNH THỨC (WORD, EXCEL, PDF)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Báo cáo xuất ra từ <strong>{realSchoolRows.length} hồ sơ thực tế</strong> của{' '}
                {effectiveSchoolName} (không chứa bất kỳ dữ liệu giả lập nào).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportReport('WORD_DOC')}
                className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Word (.doc) Chính thức</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportReport('EXCEL_CSV')}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Excel (.csv) Chính thức</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportReport('PDF_PRINT')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Tải bản In PDF (.html) Chính thức</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-extrabold text-slate-900">
                Hồ sơ chưa hoàn thành / Chậm tiến độ (
                {filteredRows.filter((r) => Boolean(r.delayRootCause)).length})
              </div>
              {filteredRows.filter((r) => Boolean(r.delayRootCause)).length === 0 ? (
                <div className="text-slate-500 py-4">
                  Không có hồ sơ chậm tiến độ trong danh sách hiện tại.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredRows
                    .filter((r) => Boolean(r.delayRootCause))
                    .map((r) => (
                      <div
                        key={r.workflow.workflowId}
                        className="p-2.5 bg-white rounded-lg border border-slate-200"
                      >
                        <div className="font-bold text-slate-900">
                          [{r.workflow.workflowId}] {r.workflow.subjectId} Khối{' '}
                          {r.workflow.gradeId} — Bước {r.workflow.currentStep}
                        </div>
                        <div className="text-[11px] text-rose-800 mt-0.5">
                          Nguyên nhân: {r.delayRootCause}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-extrabold text-slate-900">
                Những việc cần xử lý ngay ({priorityAlerts.length} việc)
              </div>
              {priorityAlerts.length === 0 ? (
                <div className="text-slate-500 py-4">
                  Hiện không có công việc khẩn cấp tồn đọng.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {priorityAlerts.slice(0, 8).map((a) => (
                    <div
                      key={a.alertId}
                      className="p-2.5 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="font-bold text-slate-900">
                        [{a.workflowId}] {a.alertTypeLabel}
                      </div>
                      <div className="text-[11px] text-blue-900 mt-0.5">
                        Việc cần xử lý: {a.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL THAO TÁC TRÊN DÒNG HỒ SƠ (PHÂN CÔNG / NHẮC VIỆC / BỔ SUNG / LỊCH SỬ / XÓA) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase">
                {activeModal.mode === 'ASSIGN' && 'CẬP NHẬT PHÂN CÔNG RA ĐỀ & PHẢN BIỆN'}
                {activeModal.mode === 'REMIND' && 'GỬI NHẮC VIỆC TRONG ỨNG DỤNG'}
                {activeModal.mode === 'SUPPLEMENT' && 'YÊU CẦU BỔ SUNG HỒ SƠ KIỂM TRA'}
                {activeModal.mode === 'HISTORY' && 'LỊCH SỬ PHÂN CÔNG & THAO TÁC'}
                {activeModal.mode === 'DELETE' && 'XÁC NHẬN XÓA PHÂN CÔNG CHƯA PHÊ DUYỆT'}
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  [{activeModal.row.workflow.workflowId}] {activeModal.row.workflow.title}
                </div>
                <div className="text-slate-600 mt-0.5">
                  Tổ: {activeModal.row.workflow.departmentName} · Trạng thái:{' '}
                  <strong>{activeModal.row.workflow.status}</strong> · Người thao tác:{' '}
                  <strong className="text-blue-900">{activeRoleProfile.fullName}</strong>
                </div>
              </div>

              {activeModal.mode === 'HISTORY' ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeModal.row.workflow.auditTrail.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                        <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                        <span>
                          {log.actorName} ({log.actorRole})
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1">{log.summary}</div>
                    </div>
                  ))}
                </div>
              ) : activeModal.mode === 'DELETE' ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                  <div className="font-bold">
                    Xác nhận xóa phân công [{activeModal.row.workflow.workflowId}]?
                  </div>
                  <p className="text-rose-900 leading-relaxed">
                    Phân công môn <strong>{activeModal.row.workflow.subjectId}</strong> Khối{' '}
                    <strong>{activeModal.row.workflow.gradeId}</strong> (GV ra đề:{' '}
                    <strong>{activeModal.row.workflow.creatorName}</strong>) sẽ được gỡ khỏi danh sách chính thức.
                  </p>
                </div>
              ) : (
                <>
                  {activeModal.mode === 'ASSIGN' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          1. Giáo viên ra đề chính:
                        </label>
                        {uniqueTeachers.length > 0 ? (
                          <select
                            value={modalCreatorInput}
                            onChange={(e) => {
                              setModalCreatorInput(e.target.value);
                              if (activeModal.row.workflow.currentStep <= 5) {
                                setModalAssigneeInput(e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            {uniqueTeachers.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={modalCreatorInput}
                            onChange={(e) => setModalCreatorInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          2. Giáo viên / Tổ trưởng phản biện thẩm định:
                        </label>
                        {uniqueTeachers.length > 0 ? (
                          <select
                            value={modalReviewerInput}
                            onChange={(e) => setModalReviewerInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            {uniqueTeachers.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={modalReviewerInput}
                            onChange={(e) => setModalReviewerInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          3. Người phụ trách xử lý bước hiện tại:
                        </label>
                        {uniqueTeachers.length > 0 ? (
                          <select
                            value={modalAssigneeInput}
                            onChange={(e) => setModalAssigneeInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            {uniqueTeachers.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={modalAssigneeInput}
                            onChange={(e) => setModalAssigneeInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nội dung chỉ đạo / nhắc việc / yêu cầu chuyên môn:
                    </label>
                    <textarea
                      rows={3}
                      value={modalNoteInput}
                      onChange={(e) => setModalNoteInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                {activeModal.mode !== 'HISTORY' && (
                  <button
                    type="button"
                    onClick={handleConfirmModalAction}
                    disabled={isSubmittingAction}
                    className={`px-4 py-2 rounded-xl text-white font-bold cursor-pointer ${
                      activeModal.mode === 'DELETE'
                        ? 'bg-rose-700 hover:bg-rose-800'
                        : 'bg-blue-700 hover:bg-blue-800'
                    }`}
                  >
                    {isSubmittingAction
                      ? 'Đang xử lý...'
                      : activeModal.mode === 'DELETE'
                      ? 'Xác nhận xóa phân công'
                      : 'Xác nhận lưu & gửi thông báo'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHÂN CÔNG RA ĐỀ & PHẢN BIỆN CHÍNH THỨC MỚI */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold">
                  <UserPlus className="w-3 h-3" />
                  MỤC 3 · PHÂN CÔNG RA ĐỀ CHÍNH THỨC
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Giao nhiệm vụ Ra đề kiểm tra & Phân công Cán bộ Phản biện
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAssignmentModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Năm học:</label>
                <select
                  value={newAssignYear}
                  onChange={(e) => setNewAssignYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kỳ kiểm tra định kỳ:</label>
                <select
                  value={newAssignPeriodLabel}
                  onChange={(e) => setNewAssignPeriodLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {STANDARD_EXAM_PERIOD_LABELS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tổ chuyên môn:</label>
                <select
                  value={assignmentFormOptions.effectiveDept}
                  onChange={(e) => setNewAssignDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {allowedDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={String(assignmentFormOptions.effectiveGrade)}
                  onChange={(e) => setNewAssignGrade(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {assignmentFormOptions.grades.map((g) => (
                    <option key={g} value={String(g)}>
                      Khối lớp {g} ({g <= 5 ? 'Tiểu học' : 'THCS'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Môn học:</label>
                <select
                  value={
                    assignmentFormOptions.subjects.includes(newAssignSubject)
                      ? newAssignSubject
                      : assignmentFormOptions.subjects[0] || 'Toán'
                  }
                  onChange={(e) => setNewAssignSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {assignmentFormOptions.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Giáo viên được phân công ra đề:
                </label>
                {assignmentFormOptions.teachers.length > 0 ? (
                  <select
                    value={
                      assignmentFormOptions.teachers.includes(newAssignCreator)
                        ? newAssignCreator
                        : assignmentFormOptions.teachers[0]
                    }
                    onChange={(e) => setNewAssignCreator(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                  >
                    {assignmentFormOptions.teachers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newAssignCreator}
                    onChange={(e) => setNewAssignCreator(e.target.value)}
                    placeholder="Nhập họ tên giáo viên ra đề"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cán bộ phản biện / thẩm định đề:
                </label>
                {assignmentFormOptions.teachers.length > 0 ? (
                  <select
                    value={
                      assignmentFormOptions.teachers.includes(newAssignReviewer)
                        ? newAssignReviewer
                        : assignmentFormOptions.teachers[0]
                    }
                    onChange={(e) => setNewAssignReviewer(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                  >
                    {assignmentFormOptions.teachers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newAssignReviewer}
                    onChange={(e) => setNewAssignReviewer(e.target.value)}
                    placeholder="Nhập họ tên cán bộ thẩm định"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Hạn hoàn thành nộp đề:
                </label>
                <input
                  type="date"
                  value={newAssignDueDate}
                  onChange={(e) => setNewAssignDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ngày kiểm tra dự kiến:
                </label>
                <input
                  type="date"
                  value={newAssignExamDate}
                  onChange={(e) => setNewAssignExamDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Yêu cầu chuyên môn gửi giáo viên ra đề:
                </label>
                <textarea
                  rows={2}
                  value={newAssignNote}
                  onChange={(e) => setNewAssignNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
                />
              </div>

              <div className="sm:col-span-2 pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={newAssignConfidential}
                    onChange={(e) => setNewAssignConfidential(e.target.checked)}
                    className="rounded border-slate-300 text-blue-700"
                  />
                  <span>
                    Áp dụng chế độ <strong>Đề mật chính thức</strong> (ẩn nội dung câu hỏi & đáp án trên bảng tổng quan)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setShowCreateAssignmentModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateOfficialAssignment}
                className="px-4 py-2 rounded-xl bg-blue-800 text-white font-bold hover:bg-blue-900 cursor-pointer"
              >
                Giao nhiệm vụ & Lưu phân công chính thức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN LÀM SẠCH DỮ LIỆU MẪU / GIẢ LẬP */}
      {showCleanConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Làm sạch dữ liệu mẫu & hồ sơ giả lập</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCleanConfirmModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Thao tác này sẽ dọn sạch toàn bộ <strong>bộ 24 hồ sơ giả lập, hồ sơ mẫu và dữ liệu kiểm thử</strong> còn lưu tạm trên trình duyệt và máy chủ, đồng thời <strong>giữ nguyên 100% các phân công ra đề chính thức</strong> của nhà trường.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanConfirmModal(false)}
                disabled={isCleaningData}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCleanSampleData}
                disabled={isCleaningData}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer"
              >
                {isCleaningData ? 'Đang làm sạch...' : 'Thực hiện làm sạch ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
