import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Filter,
  Lock,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ExamWorkflowAuditLogEntry,
  GradeNumber,
  MenuSectionId,
  PrincipalProgressAccountScope,
  QuestionItem,
  StorageConfig,
  ToastNotification,
} from '../types/domain';
import {
  deleteOfficialWorkflowDossier,
  isSampleOrTestWorkflowDossier,
  loadSavedWorkflows,
  purgeAllSampleWorkflowsFromLocal,
  saveWorkflowToLocal,
  syncWorkflowToBackend,
  WORKFLOW_9_STEPS_META,
  WORKFLOW_STATE_LABELS,
} from '../services/workflow/endToEndExamWorkflowService';
import {
  computeDossierColumnStatuses,
  computeDossierProgressStatistics,
  exportPrincipalProgressReportCsv,
  filterWorkflowsByAccountScope,
  generateAutomaticDossierWarnings,
  isWorkflowOverdue,
  normalizeExamPeriodLabel,
  resolveDepartmentForWorkflow,
  resolveDueDateForWorkflow,
  saveProgressDossierUpdate,
  STANDARD_EXAM_PERIOD_LABELS,
} from '../services/workflow/dossierProgressManagementService';
import { useSchoolContext } from '../contexts/SchoolContext';

interface DossierProgressManagementWorkspaceProps {
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
  actorDepartmentName?: string;
  onOpenWorkflowInPipeline: (workflowId: string) => void;
  onNavigate: (menuId: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

interface SchoolDepartmentRecord {
  id: string;
  departmentName: string;
  educationLevels?: string[];
  headUserId?: string | null;
  headFullName?: string | null;
  deputyUserId?: string | null;
  deputyFullName?: string | null;
  memberUserIds?: string[];
  members?: Array<{
    userId: string;
    fullName: string;
    assignedSubjectsDisplay?: string;
  }>;
}

interface SchoolAccountRecord {
  id: string;
  stt?: number;
  fullName: string;
  departmentName: string;
  roles?: string[];
  educationLevels?: ('PRIMARY' | 'LOWER_SECONDARY')[];
  assignedGradesDisplay?: number[];
  subjectAllocations?: Array<{
    educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY';
    subjectId?: string;
    subjectName: string;
    grades?: number[];
  }>;
}

interface SchoolTeachingAssignmentRecord {
  teacherUserId: string;
  teacherFullName: string;
  departmentName: string;
  educationLevelId?: 'PRIMARY' | 'LOWER_SECONDARY';
  subjectName: string;
  gradeId?: number;
  grades?: number[];
  status?: string;
}

interface SubjectFilterOption {
  value: string; // 'PRIMARY::Toán' | 'LOWER_SECONDARY::Toán'
  subjectName: string;
  educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY';
  label: string;
}

type ModalInspectMode =
  | 'PROGRESS'
  | 'AI_ERRORS'
  | 'REVIEW_COMMENTS'
  | 'REQUEST_REVISION'
  | 'ASSIGN_REVIEWER'
  | 'HISTORY'
  | 'DELETE_DOSSIER';

const PRIMARY_STANDARD_SUBJECTS: string[] = [
  'Tiếng Việt',
  'Toán',
  'Tiếng Anh',
  'Đạo đức',
  'Tự nhiên và Xã hội',
  'Khoa học',
  'Lịch sử và Địa lí',
  'Tin học',
  'Công nghệ',
  'Âm nhạc',
  'Mĩ thuật',
  'Giáo dục thể chất',
  'Hoạt động trải nghiệm',
];

const LOWER_SECONDARY_STANDARD_SUBJECTS: string[] = [
  'Ngữ văn',
  'Toán',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Lịch sử và Địa lí',
  'Giáo dục công dân',
  'Tin học',
  'Công nghệ',
  'Giáo dục thể chất',
  'Âm nhạc',
  'Mĩ thuật',
  'Hoạt động trải nghiệm, hướng nghiệp',
  'Giáo dục địa phương',
];

const CANONICAL_SUBJECTS_BY_DEPT_AND_LEVEL: Record<
  string,
  { primary: string[]; secondary: string[] }
> = {
  'tổ 1-2-3': {
    primary: [
      'Tiếng Việt',
      'Toán',
      'Đạo đức',
      'Tự nhiên và Xã hội',
      'Tin học',
      'Công nghệ',
      'Hoạt động trải nghiệm',
    ],
    secondary: [],
  },
  'tổ 4-5': {
    primary: [
      'Tiếng Việt',
      'Toán',
      'Khoa học',
      'Lịch sử và Địa lí',
      'Đạo đức',
      'Tin học',
      'Công nghệ',
      'Hoạt động trải nghiệm',
    ],
    secondary: [],
  },
  'tổ khoa học tự nhiên': {
    primary: ['Toán', 'Khoa học', 'Tự nhiên và Xã hội', 'Tin học', 'Công nghệ'],
    secondary: ['Toán', 'Khoa học tự nhiên', 'Tin học', 'Công nghệ'],
  },
  'tổ khoa học xã hội': {
    primary: [
      'Tiếng Việt',
      'Đạo đức',
      'Lịch sử và Địa lí',
      'Âm nhạc',
      'Mĩ thuật',
      'Hoạt động trải nghiệm',
    ],
    secondary: [
      'Ngữ văn',
      'Lịch sử và Địa lí',
      'Giáo dục công dân',
      'Âm nhạc',
      'Mĩ thuật',
      'Hoạt động trải nghiệm, hướng nghiệp',
      'Giáo dục địa phương',
    ],
  },
  'tổ tiếng anh - gdtc': {
    primary: ['Tiếng Anh', 'Giáo dục thể chất'],
    secondary: ['Tiếng Anh', 'Giáo dục thể chất'],
  },
  'tổ tiếng anh - năng khiếu': {
    primary: ['Tiếng Anh', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật'],
    secondary: ['Tiếng Anh', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật'],
  },
};

function normalizeDeptKey(raw?: string | null): string {
  const s = String(raw || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
  if (!s) return '';
  if (s === 'tổ khtn' || s === 'tổ khoa học tự nhiên (thcs)') return 'tổ khoa học tự nhiên';
  if (s === 'tổ khxh' || s === 'tổ khoa học xã hội (thcs)') return 'tổ khoa học xã hội';
  if (s === 'tổ tiểu học (khối 1-2-3)') return 'tổ 1-2-3';
  if (s === 'tổ tiểu học (khối 4-5)') return 'tổ 4-5';
  if (s === 'tổ ngoại ngữ') return 'tổ tiếng anh - gdtc';
  return s;
}

function areDepartmentNamesEquivalent(a?: string | null, b?: string | null): boolean {
  const ka = normalizeDeptKey(a);
  const kb = normalizeDeptKey(b);
  return Boolean(ka && kb && ka === kb);
}

function isAdminManagementDepartment(raw?: string | null): boolean {
  const k = normalizeDeptKey(raw);
  return k.includes('ban giám hiệu') || k.includes('quản trị');
}

function normalizeSubjectDisplayName(
  raw?: string | null,
  levelHint?: 'PRIMARY' | 'LOWER_SECONDARY'
): string {
  const s = String(raw || '').trim();
  if (!s) return '';
  const lower = s.toLowerCase();
  if (
    lower === 'ngoại ngữ 1' ||
    lower === 'ngoại ngữ 1 (tiếng anh)' ||
    lower === 'tiếng anh'
  ) {
    return 'Tiếng Anh';
  }
  if (lower === 'nội dung giáo dục địa phương' || lower === 'giáo dục địa phương') {
    return 'Giáo dục địa phương';
  }
  if (lower === 'nghệ thuật (âm nhạc)' || lower === 'âm nhạc') {
    return 'Âm nhạc';
  }
  if (lower === 'nghệ thuật (mĩ thuật)' || lower === 'mĩ thuật' || lower === 'mỹ thuật') {
    return 'Mĩ thuật';
  }
  if (lower === 'hđtn-hn') {
    return levelHint === 'PRIMARY'
      ? 'Hoạt động trải nghiệm'
      : 'Hoạt động trải nghiệm, hướng nghiệp';
  }
  if (lower === 'gdcd') return 'Giáo dục công dân';
  if (lower === 'gdtc') return 'Giáo dục thể chất';
  if (
    levelHint === 'LOWER_SECONDARY' &&
    (lower === 'vật lí' || lower === 'vật lý' || lower === 'hóa học' || lower === 'sinh học')
  ) {
    return 'Khoa học tự nhiên';
  }
  if (lower === 'lịch sử' || lower === 'địa lí' || lower === 'địa lý') {
    return 'Lịch sử và Địa lí';
  }
  return s;
}

function areSubjectsEquivalentForFilter(
  wfSubject?: string | null,
  filterSubject?: string | null
): boolean {
  const a = normalizeSubjectDisplayName(wfSubject).toLowerCase();
  const b = normalizeSubjectDisplayName(filterSubject).toLowerCase();
  return Boolean(a && b && a === b);
}

function doesWorkflowMatchSubjectFilter(wf: ExamWorkflow, filterValue: string): boolean {
  if (!filterValue || filterValue === 'ALL') return true;
  if (filterValue.includes('::')) {
    const [targetLevel, targetSubject] = filterValue.split('::');
    const wfLevel = Number(wf.gradeId) <= 5 ? 'PRIMARY' : 'LOWER_SECONDARY';
    return (
      wfLevel === targetLevel &&
      areSubjectsEquivalentForFilter(wf.subjectId, targetSubject)
    );
  }
  return areSubjectsEquivalentForFilter(wf.subjectId, filterValue);
}

function collectDepartmentMemberIdsAndAccounts(
  deptName: string,
  deptRecord: SchoolDepartmentRecord | undefined,
  accounts: SchoolAccountRecord[]
): { memberIdSet: Set<string>; deptAccounts: SchoolAccountRecord[] } {
  const memberIdSet = new Set<string>();
  if (deptRecord?.headUserId) memberIdSet.add(deptRecord.headUserId);
  if (deptRecord?.deputyUserId) memberIdSet.add(deptRecord.deputyUserId);
  (deptRecord?.memberUserIds || []).forEach((uid) => memberIdSet.add(uid));
  const deptAccounts = accounts.filter(
    (acc) =>
      !isAdminManagementDepartment(acc.departmentName) &&
      (areDepartmentNamesEquivalent(acc.departmentName, deptName) || memberIdSet.has(acc.id))
  );
  deptAccounts.forEach((acc) => memberIdSet.add(acc.id));
  return { memberIdSet, deptAccounts };
}

function resolveGradesForSingleDepartment(
  deptName: string,
  allowedSchoolGrades: number[],
  deptRecord?: SchoolDepartmentRecord,
  accounts: SchoolAccountRecord[] = [],
  assignments: SchoolTeachingAssignmentRecord[] = [],
  workflows: ExamWorkflow[] = []
): number[] {
  const key = normalizeDeptKey(deptName);
  const gradeSet = new Set<number>();
  const levels = deptRecord?.educationLevels || [];

  // 1. Khối nền theo đặc thù tổ & cấp học cấu hình trên tổ chuyên môn
  if (key === 'tổ 1-2-3') {
    [1, 2, 3].forEach((g) => gradeSet.add(g));
    if (levels.includes('LOWER_SECONDARY')) {
      [6, 7, 8, 9].forEach((g) => gradeSet.add(g));
    }
  } else if (key === 'tổ 4-5') {
    [4, 5].forEach((g) => gradeSet.add(g));
    if (levels.includes('LOWER_SECONDARY')) {
      [6, 7, 8, 9].forEach((g) => gradeSet.add(g));
    }
  } else if (key === 'tổ khoa học tự nhiên' || key === 'tổ khoa học xã hội') {
    [6, 7, 8, 9].forEach((g) => gradeSet.add(g));
    if (levels.includes('PRIMARY')) {
      [1, 2, 3, 4, 5].forEach((g) => gradeSet.add(g));
    }
  } else if (key === 'tổ tiếng anh - gdtc' || key === 'tổ tiếng anh - năng khiếu') {
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((g) => gradeSet.add(g));
  } else {
    if (levels.includes('PRIMARY')) {
      [1, 2, 3, 4, 5].forEach((g) => gradeSet.add(g));
    }
    if (levels.includes('LOWER_SECONDARY')) {
      [6, 7, 8, 9].forEach((g) => gradeSet.add(g));
    }
  }

  // 2. Hợp nhất toàn bộ khối lớp thực tế của giáo viên trong tổ (từ Phân công giảng dạy & Phân quyền)
  const { memberIdSet, deptAccounts } = collectDepartmentMemberIdsAndAccounts(
    deptName,
    deptRecord,
    accounts
  );

  deptAccounts.forEach((acc) => {
    (acc.assignedGradesDisplay || []).forEach((g) => {
      const n = Number(g);
      if (n >= 1 && n <= 12) gradeSet.add(n);
    });
    (acc.subjectAllocations || []).forEach((alloc) => {
      (alloc.grades || []).forEach((g) => {
        const n = Number(g);
        if (n >= 1 && n <= 12) gradeSet.add(n);
      });
    });
  });

  assignments.forEach((ta) => {
    if (ta.status === 'INACTIVE') return;
    if (
      areDepartmentNamesEquivalent(ta.departmentName, deptName) ||
      (ta.teacherUserId && memberIdSet.has(ta.teacherUserId))
    ) {
      if (typeof ta.gradeId === 'number') gradeSet.add(ta.gradeId);
      (ta.grades || []).forEach((g) => {
        const n = Number(g);
        if (n >= 1 && n <= 12) gradeSet.add(n);
      });
    }
  });

  workflows.forEach((wf) => {
    if (areDepartmentNamesEquivalent(resolveDepartmentForWorkflow(wf), deptName)) {
      const n = Number(wf.gradeId);
      if (n >= 1 && n <= 12) gradeSet.add(n);
    }
  });

  const intersected = Array.from(gradeSet)
    .filter((g) => allowedSchoolGrades.includes(g))
    .sort((a, b) => a - b);
  return intersected.length > 0 ? intersected : allowedSchoolGrades;
}

function resolveSubjectOptionsForSingleDepartment(
  deptName: string,
  allowedSchoolGrades: number[],
  deptRecord?: SchoolDepartmentRecord,
  accounts: SchoolAccountRecord[] = [],
  assignments: SchoolTeachingAssignmentRecord[] = [],
  workflows: ExamWorkflow[] = []
): SubjectFilterOption[] {
  const key = normalizeDeptKey(deptName);
  const schoolHasPrimary = allowedSchoolGrades.some((g) => g <= 5);
  const schoolHasSecondary = allowedSchoolGrades.some((g) => g >= 6);

  const deptGrades = resolveGradesForSingleDepartment(
    deptName,
    allowedSchoolGrades,
    deptRecord,
    accounts,
    assignments,
    workflows
  );
  const deptHasPrimary = schoolHasPrimary && deptGrades.some((g) => g <= 5);
  const deptHasSecondary = schoolHasSecondary && deptGrades.some((g) => g >= 6);

  const primarySet = new Set<string>();
  const secondarySet = new Set<string>();

  const addSubjectForLevel = (
    lvl: 'PRIMARY' | 'LOWER_SECONDARY',
    rawSubj?: string | null
  ) => {
    const norm = normalizeSubjectDisplayName(rawSubj, lvl);
    if (!norm) return;
    if (lvl === 'PRIMARY' && schoolHasPrimary) {
      primarySet.add(norm);
    } else if (lvl === 'LOWER_SECONDARY' && schoolHasSecondary) {
      secondarySet.add(norm);
    }
  };

  // 1. Môn học chuẩn theo đặc thù tổ & các cấp học thực tế có trong tổ
  const canonical = CANONICAL_SUBJECTS_BY_DEPT_AND_LEVEL[key];
  if (canonical) {
    if (deptHasPrimary) {
      canonical.primary.forEach((s) => addSubjectForLevel('PRIMARY', s));
    }
    if (deptHasSecondary) {
      canonical.secondary.forEach((s) => addSubjectForLevel('LOWER_SECONDARY', s));
    }
  }

  // 2. Hợp nhất đầy đủ các môn học Tiểu học & THCS được phân công / phân quyền cho giáo viên trong tổ
  const { memberIdSet, deptAccounts } = collectDepartmentMemberIdsAndAccounts(
    deptName,
    deptRecord,
    accounts
  );

  assignments.forEach((ta) => {
    if (ta.status === 'INACTIVE') return;
    if (
      areDepartmentNamesEquivalent(ta.departmentName, deptName) ||
      (ta.teacherUserId && memberIdSet.has(ta.teacherUserId))
    ) {
      const taGrades = ta.grades && ta.grades.length > 0 ? ta.grades : ta.gradeId ? [ta.gradeId] : [];
      if (ta.educationLevelId === 'PRIMARY' || taGrades.some((g) => Number(g) <= 5)) {
        addSubjectForLevel('PRIMARY', ta.subjectName);
      }
      if (ta.educationLevelId === 'LOWER_SECONDARY' || taGrades.some((g) => Number(g) >= 6)) {
        addSubjectForLevel('LOWER_SECONDARY', ta.subjectName);
      }
    }
  });

  deptAccounts.forEach((acc) => {
    (acc.subjectAllocations || []).forEach((alloc) => {
      const allocGrades = alloc.grades || [];
      if (alloc.educationLevelId === 'PRIMARY' || allocGrades.some((g) => Number(g) <= 5)) {
        addSubjectForLevel('PRIMARY', alloc.subjectName);
      }
      if (
        alloc.educationLevelId === 'LOWER_SECONDARY' ||
        allocGrades.some((g) => Number(g) >= 6)
      ) {
        addSubjectForLevel('LOWER_SECONDARY', alloc.subjectName);
      }
    });
  });

  // 3. Bổ sung môn của hồ sơ thực tế thuộc tổ (nếu có)
  workflows.forEach((wf) => {
    if (areDepartmentNamesEquivalent(resolveDepartmentForWorkflow(wf), deptName)) {
      const wfLvl = Number(wf.gradeId) <= 5 ? 'PRIMARY' : 'LOWER_SECONDARY';
      addSubjectForLevel(wfLvl, wf.subjectId);
    }
  });

  // 4. Dự phòng cho tổ chuyên môn tùy chỉnh mới tạo chưa có phân công giảng dạy
  if (primarySet.size === 0 && secondarySet.size === 0) {
    if (deptHasPrimary) {
      PRIMARY_STANDARD_SUBJECTS.forEach((s) => addSubjectForLevel('PRIMARY', s));
    }
    if (deptHasSecondary) {
      LOWER_SECONDARY_STANDARD_SUBJECTS.forEach((s) => addSubjectForLevel('LOWER_SECONDARY', s));
    }
  }

  const result: SubjectFilterOption[] = [];
  Array.from(primarySet).forEach((s) => {
    result.push({
      value: `PRIMARY::${s}`,
      subjectName: s,
      educationLevelId: 'PRIMARY',
      label: `${s} (Tiểu học)`,
    });
  });
  Array.from(secondarySet).forEach((s) => {
    result.push({
      value: `LOWER_SECONDARY::${s}`,
      subjectName: s,
      educationLevelId: 'LOWER_SECONDARY',
      label: `${s} (THCS)`,
    });
  });
  return result;
}

function normalizeSchoolId(raw?: string | null, actorId?: string | null): string {
  const s = String(raw || '').trim();
  if (s === 'SCHOOL_B' || s === 'sch-tieu-hoc-a') return 'SCHOOL_B';
  if (s === 'SCHOOL_C' || s === 'sch-thcs-b') return 'SCHOOL_C';
  if (s === 'SCHOOL_A' || s === 'sch-th-thcs-nguyen-du' || s === 'SCH-DAN-DIEN-NDA') return 'SCHOOL_A';
  if (actorId === 'user-school-admin-sia') return 'SCHOOL_B';
  if (actorId === 'user-school-admin-ddung') return 'SCHOOL_C';
  return 'SCHOOL_A';
}

export const DossierProgressManagementWorkspace: React.FC<
  DossierProgressManagementWorkspaceProps
> = ({
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
  actorDepartmentName,
  onOpenWorkflowInPipeline,
  onNavigate,
  onNotify,
}) => {
  const { activeSchoolId: ctxSchoolId } = useSchoolContext();
  const effectiveSchoolId = useMemo(
    () => normalizeSchoolId(schoolId || ctxSchoolId, actorUserId),
    [schoolId, ctxSchoolId, actorUserId]
  );

  // Xác định chế độ Tổ trưởng chuyên môn (Mục 4: Hồ sơ tổ chuyên môn / Mục 7: Tiến độ tổ)
  const isDepartmentHeadView = useMemo(
    () =>
      actorRole === 'HEAD_OF_DEPARTMENT' ||
      activeMenu === 'dept-dossiers' ||
      activeMenu === 'dept-progress',
    [actorRole, activeMenu]
  );

  const isExamPlanMenu = activeMenu === 'progress-management';
  const isProgressTrackingMenu = activeMenu === 'bgh-progress-tracking';
  const isVicePrincipalView = actorRole === 'VICE_PRINCIPAL';

  const [officialWorkflows, setOfficialWorkflows] = useState<ExamWorkflow[]>(() => {
    purgeAllSampleWorkflowsFromLocal();
    return loadSavedWorkflows(questions, matrices, exams);
  });

  // Đồng bộ danh sách Kế hoạch kiểm tra / Hồ sơ đề chính thức từ máy chủ (loại bỏ hoàn toàn dữ liệu mẫu/thử nghiệm)
  useEffect(() => {
    let cancelled = false;
    purgeAllSampleWorkflowsFromLocal();

    async function syncOfficialWorkflowsFromServer() {
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
        const mergedList = Array.from(mergedMap.values());
        mergedList.forEach((w) => saveWorkflowToLocal(w));
        if (!cancelled) {
          setOfficialWorkflows(mergedList);
        }
      } catch {
        // Giữ nguyên dữ liệu chính thức đã lưu cục bộ nếu ngoại tuyến
      }
    }

    syncOfficialWorkflowsFromServer();
    return () => {
      cancelled = true;
    };
  }, [effectiveSchoolId, questions, matrices, exams]);

  // Dữ liệu Tổ chuyên môn, Tài khoản giáo viên & Phân công giảng dạy thực tế của trường
  const [schoolDepartments, setSchoolDepartments] = useState<SchoolDepartmentRecord[]>([]);
  const [schoolAccounts, setSchoolAccounts] = useState<SchoolAccountRecord[]>([]);
  const [schoolTeachingAssignments, setSchoolTeachingAssignments] = useState<
    SchoolTeachingAssignmentRecord[]
  >([]);

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
                headUserId: d?.headUserId || null,
                headFullName: d?.headFullName || null,
                deputyUserId: d?.deputyUserId || null,
                deputyFullName: d?.deputyFullName || null,
                memberUserIds: Array.isArray(d?.memberUserIds) ? d.memberUserIds : [],
                members: Array.isArray(d?.members) ? d.members : [],
              }))
              .filter((d: SchoolDepartmentRecord) => Boolean(d.departmentName))
          );
        }

        if (Array.isArray(deptData?.accounts)) {
          setSchoolAccounts(
            deptData.accounts
              .map((acc: any) => ({
                id: String(acc?.id || ''),
                stt: typeof acc?.stt === 'number' ? acc.stt : undefined,
                fullName: String(acc?.fullName || '').trim(),
                departmentName: String(acc?.departmentName || '').trim(),
                roles: Array.isArray(acc?.roles) ? acc.roles : [],
                educationLevels: Array.isArray(acc?.educationLevels)
                  ? acc.educationLevels
                  : undefined,
                assignedGradesDisplay: Array.isArray(acc?.assignedGradesDisplay)
                  ? acc.assignedGradesDisplay.map(Number).filter(Boolean)
                  : undefined,
                subjectAllocations: Array.isArray(acc?.subjectAllocations)
                  ? acc.subjectAllocations
                  : undefined,
              }))
              .filter((acc: SchoolAccountRecord) => Boolean(acc.fullName))
          );
        }

        if (Array.isArray(deptData?.teachingAssignments)) {
          setSchoolTeachingAssignments(
            deptData.teachingAssignments
              .map((ta: any) => ({
                teacherUserId: String(ta?.teacherUserId || ''),
                teacherFullName: String(ta?.teacherFullName || '').trim(),
                departmentName: String(ta?.departmentName || '').trim(),
                educationLevelId:
                  ta?.educationLevelId === 'PRIMARY' ||
                  ta?.educationLevelId === 'LOWER_SECONDARY'
                    ? ta.educationLevelId
                    : undefined,
                subjectName: String(ta?.subjectName || '').trim(),
                gradeId: typeof ta?.gradeId === 'number' ? ta.gradeId : undefined,
                grades: Array.isArray(ta?.grades) ? ta.grades : undefined,
                status: ta?.status ? String(ta.status) : undefined,
              }))
              .filter((ta: SchoolTeachingAssignmentRecord) => Boolean(ta.subjectName))
          );
        }
      } catch {
        // fallback handled in filterOptions
      }
    }

    loadSchoolDepartmentsAndTeachers();
    return () => {
      cancelled = true;
    };
  }, [effectiveSchoolId, actorUserId]);

  const allowedGradesForSchool = useMemo<number[]>(() => {
    const lowerName = String(schoolName || config.schoolName || '').toLowerCase();
    if (
      effectiveSchoolId === 'SCHOOL_B' ||
      (lowerName.includes('tiểu học') &&
        !lowerName.includes('th&thcs') &&
        !lowerName.includes('th &thcs') &&
        !lowerName.includes('thcs'))
    ) {
      return [1, 2, 3, 4, 5];
    }
    if (
      effectiveSchoolId === 'SCHOOL_C' ||
      (lowerName.includes('thcs') &&
        !lowerName.includes('th&thcs') &&
        !lowerName.includes('th &thcs') &&
        !lowerName.includes('tiểu học'))
    ) {
      return [6, 7, 8, 9];
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }, [effectiveSchoolId, schoolName, config.schoolName]);

  // Danh sách các Tổ chuyên môn giảng dạy của trường (loại trừ tổ hành chính Ban Giám hiệu và quản trị)
  const schoolTeachingDepartmentNames = useMemo<string[]>(() => {
    const fromApi = schoolDepartments
      .map((d) => d.departmentName)
      .filter((name) => Boolean(name) && !isAdminManagementDepartment(name));
    if (fromApi.length > 0) {
      return Array.from(new Set(fromApi));
    }
    if (effectiveSchoolId === 'SCHOOL_B') {
      return ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4', 'Tổ 5'];
    }
    if (effectiveSchoolId === 'SCHOOL_C') {
      return ['Tổ khoa học tự nhiên', 'Tổ khoa học xã hội', 'Tổ Tiếng Anh - GDTC'];
    }
    return [
      'Tổ 1-2-3',
      'Tổ 4-5',
      'Tổ khoa học tự nhiên',
      'Tổ khoa học xã hội',
      'Tổ Tiếng Anh - GDTC',
    ];
  }, [schoolDepartments, effectiveSchoolId]);

  // Xác định chính xác Tổ chuyên môn mà Tổ trưởng chuyên môn đang đăng nhập quản lý
  const managedDepartments = useMemo<string[]>(() => {
    if (!isDepartmentHeadView) {
      return schoolTeachingDepartmentNames;
    }

    const matchTeachingDeptName = (candidate?: string | null): string | null => {
      const trimmed = String(candidate || '').trim();
      if (!trimmed || isAdminManagementDepartment(trimmed)) return null;
      const canonicalInSchool = schoolTeachingDepartmentNames.find((d) =>
        areDepartmentNamesEquivalent(d, trimmed)
      );
      return canonicalInSchool || trimmed;
    };

    // 1. Ưu tiên khớp theo Tổ trưởng / Tổ phó được gán trực tiếp trong danh mục Tổ chuyên môn
    const headOrDeputyDepts = schoolDepartments
      .filter((d) => {
        if (isAdminManagementDepartment(d.departmentName)) return false;
        if (actorUserId && (d.headUserId === actorUserId || d.deputyUserId === actorUserId)) {
          return true;
        }
        if (
          actorFullName &&
          (String(d.headFullName || '').trim() === actorFullName.trim() ||
            String(d.deputyFullName || '').trim() === actorFullName.trim())
        ) {
          return true;
        }
        return false;
      })
      .map((d) => d.departmentName);

    if (headOrDeputyDepts.length > 0) {
      return Array.from(new Set(headOrDeputyDepts));
    }

    // 2. Khớp theo Tổ chuyên môn trên hồ sơ tài khoản giáo viên đang đăng nhập
    const matchedAccount = schoolAccounts.find(
      (acc) =>
        (actorUserId && acc.id === actorUserId) ||
        (actorFullName && acc.fullName.trim() === actorFullName.trim())
    );
    const fromAccountDept = matchTeachingDeptName(matchedAccount?.departmentName);
    if (fromAccountDept) {
      return [fromAccountDept];
    }

    // 3. Khớp theo actorDepartmentName truyền từ phiên đăng nhập
    const fromPropDept = matchTeachingDeptName(actorDepartmentName);
    if (fromPropDept) {
      return [fromPropDept];
    }

    // 4. Khớp theo memberUserIds trong danh mục Tổ chuyên môn
    if (actorUserId) {
      const memberDept = schoolDepartments.find(
        (d) =>
          !isAdminManagementDepartment(d.departmentName) &&
          Array.isArray(d.memberUserIds) &&
          d.memberUserIds.includes(actorUserId)
      );
      if (memberDept) {
        return [memberDept.departmentName];
      }
    }

    // 5. Dự phòng khi tài khoản Quản trị hệ thống chuyển sang xem trước giao diện Tổ trưởng CM
    const defaultSingleDept =
      schoolTeachingDepartmentNames[0] ||
      (effectiveSchoolId === 'SCHOOL_B' ? 'Tổ 1' : 'Tổ khoa học tự nhiên');
    return [defaultSingleDept];
  }, [
    isDepartmentHeadView,
    schoolTeachingDepartmentNames,
    schoolDepartments,
    schoolAccounts,
    actorUserId,
    actorFullName,
    actorDepartmentName,
    effectiveSchoolId,
  ]);

  // Tài khoản điều hành hiện tại (Tự động khóa phạm vi theo Tổ trưởng CM hoặc Ban Giám hiệu thực tế đang đăng nhập)
  const activeAccount: PrincipalProgressAccountScope = useMemo(() => {
    if (isDepartmentHeadView) {
      const deptLabel = managedDepartments.join(', ');
      const displayActorName = String(actorFullName || 'Tổ trưởng chuyên môn').trim();
      return {
        accountId: actorUserId || 'acc-hod-active',
        fullName: `${displayActorName} (Tổ trưởng – ${deptLabel})`,
        role: 'HEAD_OF_DEPARTMENT',
        roleTitle: `Tổ trưởng chuyên môn — Quản lý ${deptLabel}`,
        assignedDepartments: managedDepartments,
        assignedGrades: 'ALL',
        canAssignReviewer: true,
        canRequestRevision: true,
        canExportProgressReport: true,
      };
    }

    if (actorRole === 'VICE_PRINCIPAL') {
      const displayActorName = String(actorFullName || 'Phó Hiệu trưởng').trim();
      return {
        accountId: actorUserId || 'acc-vp-active',
        fullName: `${displayActorName} (Phó Hiệu trưởng)`,
        role: 'VICE_PRINCIPAL',
        roleTitle: 'Phó Hiệu trưởng — Quản lý Kế hoạch kiểm tra & Tiến độ hồ sơ chính thức',
        assignedDepartments: 'ALL',
        assignedGrades: 'ALL',
        canAssignReviewer: true,
        canRequestRevision: true,
        canExportProgressReport: true,
      };
    }

    if (actorRole === 'PRINCIPAL') {
      const displayActorName = String(actorFullName || 'Hiệu trưởng').trim();
      return {
        accountId: actorUserId || 'acc-principal-active',
        fullName: `${displayActorName} (Hiệu trưởng)`,
        role: 'PRINCIPAL',
        roleTitle: 'Hiệu trưởng — Quản lý toàn bộ Kế hoạch kiểm tra & Hồ sơ nhà trường',
        assignedDepartments: 'ALL',
        assignedGrades: 'ALL',
        canAssignReviewer: true,
        canRequestRevision: true,
        canExportProgressReport: true,
      };
    }

    const fallbackAdminName = String(actorFullName || 'Ban Giám hiệu').trim();
    return {
      accountId: actorUserId || 'acc-admin-active',
      fullName: `${fallbackAdminName} (Ban Giám hiệu – Toàn trường)`,
      role: 'PRINCIPAL',
      roleTitle: 'Ban Giám hiệu — Giám sát toàn bộ các Tổ chuyên môn của nhà trường',
      assignedDepartments: 'ALL',
      assignedGrades: 'ALL',
      canAssignReviewer: true,
      canRequestRevision: true,
      canExportProgressReport: true,
    };
  }, [
    isDepartmentHeadView,
    managedDepartments,
    actorRole,
    actorUserId,
    actorFullName,
  ]);

  // 8 Bộ lọc điều hành tiến độ hồ sơ
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>(() =>
    isDepartmentHeadView && managedDepartments.length === 1 ? managedDepartments[0] : 'ALL'
  );
  const [filterTeacher, setFilterTeacher] = useState<string>('ALL');
  const [filterExamPeriod, setFilterExamPeriod] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterOverdueMode, setFilterOverdueMode] = useState<'ALL' | 'OVERDUE_ONLY' | 'ON_TIME'>(
    'ALL'
  );

  // Hộp thoại Thao tác chi tiết hồ sơ
  const [activeModalMode, setActiveModalMode] = useState<ModalInspectMode | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<ExamWorkflow | null>(null);
  const [revisionRequestNote, setRevisionRequestNote] = useState<string>(
    isDepartmentHeadView
      ? 'Tổ trưởng chuyên môn yêu cầu rà soát lại biểu điểm hướng dẫn chấm và xử lý dứt điểm các cảnh báo kỹ thuật trước khi trình phê duyệt.'
      : 'Ban Giám hiệu yêu cầu rà soát lại biểu điểm hướng dẫn chấm và xử lý dứt điểm các cảnh báo kỹ thuật trước khi trình phê duyệt.'
  );
  const [selectedReviewerToAssign, setSelectedReviewerToAssign] = useState<string>('');

  useEffect(() => {
    setRevisionRequestNote(
      isDepartmentHeadView
        ? 'Tổ trưởng chuyên môn yêu cầu rà soát lại biểu điểm hướng dẫn chấm và xử lý dứt điểm các cảnh báo kỹ thuật trước khi trình phê duyệt.'
        : 'Ban Giám hiệu yêu cầu rà soát lại biểu điểm hướng dẫn chấm và xử lý dứt điểm các cảnh báo kỹ thuật trước khi trình phê duyệt.'
    );
  }, [isDepartmentHeadView]);

  const [activeSectionTab, setActiveSectionTab] = useState<'SUMMARY_TABLE' | 'AUTO_WARNINGS_V'>(
    'SUMMARY_TABLE'
  );

  const normalizeAcademicYearValue = (raw?: string | null): string => {
    const cleaned = String(raw || '').replace(/\s+/g, '').trim();
    return cleaned;
  };

  // Nguồn hồ sơ chính thức cô lập theo trường
  const rawWorkflowsByDataset = useMemo(() => {
    return officialWorkflows.filter((wf) => {
      if (isSampleOrTestWorkflowDossier(wf)) return false;
      if (wf.schoolId && wf.schoolId !== effectiveSchoolId) return false;
      return allowedGradesForSchool.includes(Number(wf.gradeId));
    });
  }, [officialWorkflows, effectiveSchoolId, allowedGradesForSchool]);

  // Áp dụng phân quyền phạm vi Tổ trưởng chuyên môn / Ban Giám hiệu
  const scopedWorkflows = useMemo(
    () => filterWorkflowsByAccountScope(rawWorkflowsByDataset, activeAccount),
    [rawWorkflowsByDataset, activeAccount]
  );

  // Danh sách giá trị duy nhất cho các bộ lọc (Tự động giới hạn Môn học, Tổ CM, Giáo viên theo Tổ của Tổ trưởng)
  const filterOptions = useMemo(() => {
    const configuredYear = normalizeAcademicYearValue((config as any)?.academicYear) || '2026-2027';
    const years = Array.from(
      new Set([
        configuredYear,
        '2026-2027',
        '2025-2026',
        ...scopedWorkflows
          .map((w) => normalizeAcademicYearValue(w.academicYearId))
          .filter(Boolean),
      ])
    );

    // 4. Tổ chuyên môn:
    // - Vai trò Tổ trưởng chuyên môn: CHỈ hiển thị tổ chuyên môn mà tổ trưởng quản lý.
    // - Vai trò Ban Giám hiệu / Quản trị: Hiển thị các tổ chuyên môn của trường.
    const departments = isDepartmentHeadView
      ? managedDepartments
      : schoolTeachingDepartmentNames;

    // Xác định phạm vi tổ đang áp dụng cho Khối lớp, Môn học và Giáo viên ra đề
    const activeTargetDepartments: string[] | null = isDepartmentHeadView
      ? filterDepartment !== 'ALL' &&
        managedDepartments.some((d) => areDepartmentNamesEquivalent(d, filterDepartment))
        ? [filterDepartment]
        : managedDepartments
      : filterDepartment !== 'ALL'
      ? [filterDepartment]
      : null;

    // 2. Khối lớp: Đầy đủ cả cấp Tiểu học và cấp THCS theo giáo viên & cấu hình thực tế của tổ chuyên môn
    let grades = allowedGradesForSchool;
    if (activeTargetDepartments && activeTargetDepartments.length > 0) {
      const gradeSet = new Set<number>();
      activeTargetDepartments.forEach((deptName) => {
        const deptRec = schoolDepartments.find((d) =>
          areDepartmentNamesEquivalent(d.departmentName, deptName)
        );
        resolveGradesForSingleDepartment(
          deptName,
          allowedGradesForSchool,
          deptRec,
          schoolAccounts,
          schoolTeachingAssignments,
          scopedWorkflows
        ).forEach((g) => gradeSet.add(g));
      });
      const resolvedGrades = Array.from(gradeSet).sort((a, b) => a - b);
      if (resolvedGrades.length > 0) {
        grades = resolvedGrades;
      }
    }

    // 3. Môn học: Đầy đủ các môn học thuộc cả cấp Tiểu học và cấp THCS của tổ chuyên môn
    let subjectOptions: SubjectFilterOption[] = [];
    if (activeTargetDepartments && activeTargetDepartments.length > 0) {
      const seenValues = new Set<string>();
      const primaryOpts: SubjectFilterOption[] = [];
      const secondaryOpts: SubjectFilterOption[] = [];
      activeTargetDepartments.forEach((deptName) => {
        const deptRec = schoolDepartments.find((d) =>
          areDepartmentNamesEquivalent(d.departmentName, deptName)
        );
        resolveSubjectOptionsForSingleDepartment(
          deptName,
          allowedGradesForSchool,
          deptRec,
          schoolAccounts,
          schoolTeachingAssignments,
          scopedWorkflows
        ).forEach((opt) => {
          if (seenValues.has(opt.value)) return;
          seenValues.add(opt.value);
          if (opt.educationLevelId === 'PRIMARY') {
            primaryOpts.push(opt);
          } else {
            secondaryOpts.push(opt);
          }
        });
      });
      subjectOptions = [...primaryOpts, ...secondaryOpts];
    } else {
      const schoolHasPrimary = allowedGradesForSchool.some((g) => g <= 5);
      const schoolHasSecondary = allowedGradesForSchool.some((g) => g >= 6);
      const primaryOpts: SubjectFilterOption[] = schoolHasPrimary
        ? PRIMARY_STANDARD_SUBJECTS.map((s) => ({
            value: `PRIMARY::${s}`,
            subjectName: s,
            educationLevelId: 'PRIMARY',
            label: `${s} (Tiểu học)`,
          }))
        : [];
      const secondaryOpts: SubjectFilterOption[] = schoolHasSecondary
        ? LOWER_SECONDARY_STANDARD_SUBJECTS.map((s) => ({
            value: `LOWER_SECONDARY::${s}`,
            subjectName: s,
            educationLevelId: 'LOWER_SECONDARY',
            label: `${s} (THCS)`,
          }))
        : [];
      subjectOptions = [...primaryOpts, ...secondaryOpts];
    }
    const subjects = subjectOptions.map((o) => o.value);

    // 5. Giáo viên ra đề:
    // - Vai trò Tổ trưởng chuyên môn (hoặc khi chọn 1 tổ cụ thể): CHỈ hiển thị các giáo viên trong tổ đó.
    // - Vai trò Ban Giám hiệu xem toàn trường: Hiển thị danh sách giáo viên toàn trường.
    let teachers: string[];
    if (activeTargetDepartments && activeTargetDepartments.length > 0) {
      const matchingDepts = schoolDepartments.filter((d) =>
        activeTargetDepartments.some((td) => areDepartmentNamesEquivalent(d.departmentName, td))
      );
      const memberIdSet = new Set<string>();
      matchingDepts.forEach((d) => {
        if (d.headUserId) memberIdSet.add(d.headUserId);
        if (d.deputyUserId) memberIdSet.add(d.deputyUserId);
        (d.memberUserIds || []).forEach((uid) => memberIdSet.add(uid));
      });

      const teacherSet = new Set<string>();
      schoolAccounts.forEach((acc) => {
        if (isAdminManagementDepartment(acc.departmentName)) return;
        const inTargetDept =
          activeTargetDepartments.some((td) =>
            areDepartmentNamesEquivalent(acc.departmentName, td)
          ) || memberIdSet.has(acc.id);
        if (inTargetDept && acc.fullName) {
          teacherSet.add(acc.fullName);
        }
      });
      matchingDepts.forEach((d) => {
        (d.members || []).forEach((m) => {
          if (m?.fullName) teacherSet.add(String(m.fullName).trim());
        });
      });

      if (teacherSet.size > 0) {
        teachers = Array.from(teacherSet);
      } else {
        teachers = Array.from(
          new Set(
            scopedWorkflows
              .filter((wf) => {
                const wfDept = resolveDepartmentForWorkflow(wf);
                return activeTargetDepartments.some((td) =>
                  areDepartmentNamesEquivalent(td, wfDept)
                );
              })
              .map((wf) => wf.creatorName)
              .filter(Boolean)
          )
        );
      }
    } else {
      const allSchoolTeachers = schoolAccounts
        .filter((acc) => !isAdminManagementDepartment(acc.departmentName))
        .map((acc) => acc.fullName);
      teachers =
        allSchoolTeachers.length > 0
          ? Array.from(new Set(allSchoolTeachers))
          : Array.from(new Set(scopedWorkflows.map((w) => w.creatorName)));
    }

    // 6. Kỳ kiểm tra: Giữa học kỳ 1, Cuối học kỳ 1, Giữa học kỳ 2, Cuối học kỳ 2
    const periods = [...STANDARD_EXAM_PERIOD_LABELS];
    const statuses = Object.keys(WORKFLOW_STATE_LABELS) as ExamWorkflow['status'][];
    return { years, grades, subjects, subjectOptions, departments, teachers, periods, statuses };
  }, [
    scopedWorkflows,
    isDepartmentHeadView,
    managedDepartments,
    schoolTeachingDepartmentNames,
    filterDepartment,
    allowedGradesForSchool,
    schoolDepartments,
    schoolTeachingAssignments,
    schoolAccounts,
    config,
  ]);

  // Danh sách cán bộ phản biện thực tế của nhà trường (ưu tiên giáo viên cùng tổ chuyên môn, loại trừ người tự ra đề khi có lựa chọn khác)
  const availableOfficialReviewers = useMemo<string[]>(() => {
    const allRealTeachers = Array.from(
      new Set(
        schoolAccounts
          .filter((acc) => !isAdminManagementDepartment(acc.departmentName))
          .map((acc) => acc.fullName)
          .filter(Boolean)
      )
    );
    if (!selectedDossier) {
      return filterOptions.teachers.length > 0 ? filterOptions.teachers : allRealTeachers;
    }
    const targetDept = resolveDepartmentForWorkflow(selectedDossier);
    const deptRec = schoolDepartments.find((d) =>
      areDepartmentNamesEquivalent(d.departmentName, targetDept)
    );
    const { deptAccounts } = collectDepartmentMemberIdsAndAccounts(
      targetDept,
      deptRec,
      schoolAccounts
    );
    const deptCandidates = Array.from(
      new Set([
        ...(deptRec?.headFullName ? [String(deptRec.headFullName).trim()] : []),
        ...deptAccounts.map((a) => a.fullName).filter(Boolean),
        ...(deptRec?.members || []).map((m) => String(m.fullName || '').trim()).filter(Boolean),
      ])
    );
    const pool = deptCandidates.length > 0 ? deptCandidates : allRealTeachers;
    const withoutCreator = pool.filter(
      (name) => name.trim() !== String(selectedDossier.creatorName || '').trim()
    );
    return withoutCreator.length > 0 ? withoutCreator : pool;
  }, [selectedDossier, schoolAccounts, schoolDepartments, filterOptions.teachers]);

  // Đồng bộ giá trị đang chọn trên bộ lọc khi chuyển vai trò / tổ chuyên môn để không bị kẹt giá trị ngoài tổ
  useEffect(() => {
    if (isDepartmentHeadView && filterOptions.departments.length === 1) {
      const onlyDept = filterOptions.departments[0];
      if (filterDepartment !== onlyDept) {
        setFilterDepartment(onlyDept);
      }
    } else if (
      filterDepartment !== 'ALL' &&
      !filterOptions.departments.some((d) => areDepartmentNamesEquivalent(d, filterDepartment))
    ) {
      setFilterDepartment('ALL');
    }
  }, [isDepartmentHeadView, filterOptions.departments, filterDepartment]);

  useEffect(() => {
    if (filterGrade !== 'ALL' && !filterOptions.grades.includes(Number(filterGrade))) {
      setFilterGrade('ALL');
    }
  }, [filterOptions.grades, filterGrade]);

  useEffect(() => {
    if (
      filterSubject !== 'ALL' &&
      !filterOptions.subjectOptions.some(
        (o) =>
          o.value === filterSubject ||
          areSubjectsEquivalentForFilter(o.subjectName, filterSubject)
      )
    ) {
      setFilterSubject('ALL');
    }
  }, [filterOptions.subjectOptions, filterSubject]);

  useEffect(() => {
    if (filterTeacher !== 'ALL' && !filterOptions.teachers.includes(filterTeacher)) {
      setFilterTeacher('ALL');
    }
  }, [filterOptions.teachers, filterTeacher]);

  // Danh sách sau khi áp dụng 8 bộ lọc
  const filteredWorkflows = useMemo(() => {
    return scopedWorkflows.filter((wf) => {
      const dept = resolveDepartmentForWorkflow(wf);
      const overdue = isWorkflowOverdue(wf);
      const normalizedPeriod = normalizeExamPeriodLabel(wf.examPeriod, wf.examPeriodLabel);

      if (
        filterAcademicYear !== 'ALL' &&
        normalizeAcademicYearValue(wf.academicYearId) !==
          normalizeAcademicYearValue(filterAcademicYear)
      ) {
        return false;
      }
      if (filterGrade !== 'ALL' && String(wf.gradeId) !== filterGrade) return false;
      if (filterSubject !== 'ALL' && !doesWorkflowMatchSubjectFilter(wf, filterSubject)) {
        return false;
      }
      if (
        filterDepartment !== 'ALL' &&
        !areDepartmentNamesEquivalent(dept, filterDepartment)
      ) {
        return false;
      }
      if (filterTeacher !== 'ALL' && wf.creatorName !== filterTeacher) return false;
      if (filterExamPeriod !== 'ALL' && normalizedPeriod !== filterExamPeriod) return false;
      if (filterStatus !== 'ALL' && wf.status !== filterStatus) return false;
      if (filterOverdueMode === 'OVERDUE_ONLY' && !overdue) return false;
      if (filterOverdueMode === 'ON_TIME' && overdue) return false;

      return true;
    });
  }, [
    scopedWorkflows,
    filterAcademicYear,
    filterGrade,
    filterSubject,
    filterDepartment,
    filterTeacher,
    filterExamPeriod,
    filterStatus,
    filterOverdueMode,
  ]);

  // III. Thống kê 7 chỉ số
  const statistics = useMemo(
    () => computeDossierProgressStatistics(filteredWorkflows),
    [filteredWorkflows]
  );

  // V. Cảnh báo tự động 8 loại
  const autoWarnings = useMemo(
    () => generateAutomaticDossierWarnings(filteredWorkflows),
    [filteredWorkflows]
  );

  const handleResetFilters = () => {
    setFilterAcademicYear('ALL');
    setFilterGrade('ALL');
    setFilterSubject('ALL');
    setFilterDepartment(
      isDepartmentHeadView && filterOptions.departments.length === 1
        ? filterOptions.departments[0]
        : 'ALL'
    );
    setFilterTeacher('ALL');
    setFilterExamPeriod('ALL');
    setFilterStatus('ALL');
    setFilterOverdueMode('ALL');
  };

  // State cho Hộp thoại Lập Kế hoạch kiểm tra chính thức mới & Làm sạch dữ liệu mẫu
  const [showCreatePlanModal, setShowCreatePlanModal] = useState<boolean>(false);
  const [showCleanConfirmModal, setShowCleanConfirmModal] = useState<boolean>(false);
  const [isCleaningData, setIsCleaningData] = useState<boolean>(false);

  const defaultPlanYear = useMemo(() => {
    const cfgYear = normalizeAcademicYearValue((config as any)?.academicYear);
    return cfgYear || '2026-2027';
  }, [config]);

  const [newPlanAcademicYear, setNewPlanAcademicYear] = useState<string>(defaultPlanYear);
  const [newPlanPeriodLabel, setNewPlanPeriodLabel] = useState<string>('Giữa học kỳ 1');
  const [newPlanDepartment, setNewPlanDepartment] = useState<string>('');
  const [newPlanGrade, setNewPlanGrade] = useState<number>(allowedGradesForSchool[0] || 6);
  const [newPlanSubject, setNewPlanSubject] = useState<string>('Toán');
  const [newPlanCreatorName, setNewPlanCreatorName] = useState<string>('');
  const [newPlanReviewerName, setNewPlanReviewerName] = useState<string>('');
  const [newPlanExamDate, setNewPlanExamDate] = useState<string>(() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 14);
    return dt.toISOString().slice(0, 10);
  });
  const [newPlanDueDate, setNewPlanDueDate] = useState<string>(() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 9);
    return dt.toISOString().slice(0, 10);
  });
  const [newPlanConfidential, setNewPlanConfidential] = useState<boolean>(true);

  const planFormOptions = useMemo(() => {
    const availableDepts = isDepartmentHeadView
      ? managedDepartments
      : schoolTeachingDepartmentNames;
    const effectiveDept =
      newPlanDepartment && availableDepts.includes(newPlanDepartment)
        ? newPlanDepartment
        : availableDepts[0] || '';
    const deptRec = schoolDepartments.find((d) =>
      areDepartmentNamesEquivalent(d.departmentName, effectiveDept)
    );
    const grades = effectiveDept
      ? resolveGradesForSingleDepartment(
          effectiveDept,
          allowedGradesForSchool,
          deptRec,
          schoolAccounts,
          schoolTeachingAssignments,
          []
        )
      : allowedGradesForSchool;

    const effectiveGrade = grades.includes(newPlanGrade)
      ? newPlanGrade
      : grades[0] || allowedGradesForSchool[0] || 6;
    const gradeLevel: 'PRIMARY' | 'LOWER_SECONDARY' =
      effectiveGrade <= 5 ? 'PRIMARY' : 'LOWER_SECONDARY';

    const subjectOpts = effectiveDept
      ? resolveSubjectOptionsForSingleDepartment(
          effectiveDept,
          allowedGradesForSchool,
          deptRec,
          schoolAccounts,
          schoolTeachingAssignments,
          []
        ).filter((s) => s.educationLevelId === gradeLevel)
      : (gradeLevel === 'PRIMARY'
          ? PRIMARY_STANDARD_SUBJECTS
          : LOWER_SECONDARY_STANDARD_SUBJECTS
        ).map((s) => ({
          value: `${gradeLevel}::${s}`,
          subjectName: s,
          educationLevelId: gradeLevel,
          label: s,
        }));

    const fallbackSubjList =
      gradeLevel === 'PRIMARY' ? PRIMARY_STANDARD_SUBJECTS : LOWER_SECONDARY_STANDARD_SUBJECTS;
    const subjects =
      subjectOpts.length > 0
        ? Array.from(new Set(subjectOpts.map((o) => o.subjectName)))
        : fallbackSubjList;

    const { deptAccounts } = effectiveDept
      ? collectDepartmentMemberIdsAndAccounts(effectiveDept, deptRec, schoolAccounts)
      : {
          deptAccounts: schoolAccounts.filter(
            (acc) => !isAdminManagementDepartment(acc.departmentName)
          ),
        };

    const teacherNames = Array.from(
      new Set([
        ...deptAccounts.map((a) => a.fullName).filter(Boolean),
        ...(deptRec?.members || []).map((m) => String(m.fullName || '').trim()).filter(Boolean),
      ])
    );
    const allTeachersFallback = schoolAccounts
      .filter((acc) => !isAdminManagementDepartment(acc.departmentName))
      .map((acc) => acc.fullName)
      .filter(Boolean);

    const finalTeachers = teacherNames.length > 0 ? teacherNames : allTeachersFallback;
    return {
      availableDepts,
      effectiveDept,
      grades,
      effectiveGrade,
      subjects,
      teachers: finalTeachers,
      headFullName: deptRec?.headFullName || finalTeachers[0] || 'Tổ trưởng chuyên môn',
    };
  }, [
    isDepartmentHeadView,
    managedDepartments,
    schoolTeachingDepartmentNames,
    newPlanDepartment,
    newPlanGrade,
    schoolDepartments,
    allowedGradesForSchool,
    schoolAccounts,
    schoolTeachingAssignments,
  ]);

  const handleOpenCreatePlanModal = () => {
    const initDept = planFormOptions.effectiveDept;
    const initGrade = planFormOptions.effectiveGrade;
    const initSubject = planFormOptions.subjects[0] || 'Toán';
    const initTeacher = planFormOptions.teachers[0] || '';
    const initReviewer =
      planFormOptions.teachers.find((t) => t !== initTeacher) ||
      planFormOptions.headFullName ||
      initTeacher;

    setNewPlanDepartment(initDept);
    setNewPlanGrade(initGrade);
    setNewPlanSubject(initSubject);
    setNewPlanCreatorName(initTeacher);
    setNewPlanReviewerName(initReviewer);
    setShowCreatePlanModal(true);
  };

  const handleCreateOfficialExamPlan = () => {
    const chosenDept = planFormOptions.effectiveDept;
    const chosenGrade = (
      planFormOptions.grades.includes(newPlanGrade)
        ? newPlanGrade
        : planFormOptions.effectiveGrade
    ) as GradeNumber;
    const chosenSubject =
      planFormOptions.subjects.includes(newPlanSubject)
        ? newPlanSubject
        : planFormOptions.subjects[0] || 'Toán';
    const chosenTeacher =
      newPlanCreatorName.trim() || planFormOptions.teachers[0] || 'Giáo viên bộ môn';
    const chosenReviewer =
      newPlanReviewerName.trim() || planFormOptions.headFullName || 'Tổ trưởng chuyên môn';

    const matchedTeacherAcc = schoolAccounts.find(
      (a) => a.fullName.trim() === chosenTeacher.trim()
    );
    const deptRec = schoolDepartments.find((d) =>
      areDepartmentNamesEquivalent(d.departmentName, chosenDept)
    );
    const matrixApprover =
      deptRec?.headFullName || planFormOptions.headFullName || 'Tổ trưởng chuyên môn';
    const finalApprover = actorFullName || 'Ban Giám hiệu';

    const periodCode: ExamWorkflow['examPeriod'] =
      newPlanPeriodLabel === 'Giữa học kỳ 1'
        ? 'MID_SEM_1'
        : newPlanPeriodLabel === 'Cuối học kỳ 1'
        ? 'END_SEM_1'
        : newPlanPeriodLabel === 'Giữa học kỳ 2'
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
    const wfId = `KH-${periodShort}-K${chosenGrade}-${cleanSubjCode}-${timeSuffix}`;
    const nowIso = new Date().toISOString();
    const eduLevel =
      chosenGrade <= 5 ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY;

    const newWorkflow: ExamWorkflow = {
      workflowId: wfId,
      title: `Kế hoạch kiểm tra ${newPlanPeriodLabel} – Môn ${chosenSubject} Lớp ${chosenGrade} (${newPlanAcademicYear})`,
      schoolId: effectiveSchoolId,
      academicYearId: newPlanAcademicYear,
      gradeId: chosenGrade,
      subjectId: chosenSubject,
      examPeriod: periodCode,
      examPeriodLabel: newPlanPeriodLabel,
      examDate: newPlanExamDate,
      dueDate: newPlanDueDate,
      departmentName: chosenDept,
      creatorId: matchedTeacherAcc?.id || `teacher-${timeSuffix}`,
      creatorName: chosenTeacher,
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
      isConfidentialExam: newPlanConfidential,
      authorizedConfidentialRoles: [
        'TEACHER',
        'HEAD_OF_DEPARTMENT',
        'REVIEWER',
        'VICE_PRINCIPAL',
        'PRINCIPAL',
      ],
      assignedUsers: {
        creatorName: chosenTeacher,
        creatorRole: 'TEACHER',
        matrixApproverName: matrixApprover,
        reviewerName: chosenReviewer,
        finalApproverName: finalApprover,
        analyticsOwnerName: chosenTeacher,
        currentAssigneeName: chosenTeacher,
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
      step6ProfessionalReview: {
        ballots: [],
      },
      step7OfficialApproval: {},
      step8DossierExport: {
        exports: [],
      },
      step9ResultsAnalysis: {},
      versionSnapshots: [
        {
          versionId: 'v1.0',
          versionNumber: 1,
          versionLabel: 'Khởi tạo Kế hoạch kiểm tra chính thức',
          createdAt: nowIso,
          createdBy: activeAccount.fullName,
          createdByRole: activeAccount.role,
          workflowStateAtCreation: 'Draft',
          stepNumberAtCreation: 1,
          matrixId: '',
          specificationId: '',
          examId: '',
          questionIds: [],
          totalPoints: 10,
          matrixStructureSignature: '',
          isImmutableApprovedLock: false,
          changeNote: `${activeAccount.fullName} lập kế hoạch kiểm tra chính thức và giao nhiệm vụ ra đề cho ${chosenTeacher}.`,
        },
      ],
      auditTrail: [
        {
          id: `audit-plan-init-${Date.now()}`,
          workflowId: wfId,
          timestamp: nowIso,
          actorId: activeAccount.accountId,
          actorName: activeAccount.fullName,
          actorRole: activeAccount.role,
          actionType: 'WORKFLOW_CREATED',
          fromState: 'Draft',
          toState: 'Draft',
          fromStep: 1,
          toStep: 1,
          versionId: 'v1.0',
          backendVerified: true,
          summary: `[Kế hoạch kiểm tra chính thức] ${activeAccount.fullName} khởi tạo kế hoạch [${wfId}] (${newPlanPeriodLabel} – ${chosenSubject} Lớp ${chosenGrade}), phân công ra đề: ${chosenTeacher}, phản biện: ${chosenReviewer}, hạn nộp: ${newPlanDueDate}.`,
        },
      ],
    };

    const nextList = saveWorkflowToLocal(newWorkflow);
    setOfficialWorkflows(nextList);
    syncWorkflowToBackend(newWorkflow, activeAccount.fullName, activeAccount.role);
    setShowCreatePlanModal(false);
    onNotify(
      'success',
      'Đã lập Kế hoạch kiểm tra chính thức',
      `Đã tạo hồ sơ kế hoạch [${wfId}] (${chosenSubject} – Lớp ${chosenGrade}, ${newPlanPeriodLabel}) và giao nhiệm vụ cho ${chosenTeacher}.`
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
          actorUserId: activeAccount.accountId,
          actorName: activeAccount.fullName,
          actorRole: activeAccount.role,
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
        setOfficialWorkflows(Array.from(merged.values()));
      } else {
        setOfficialWorkflows(loadSavedWorkflows(questions, matrices, exams));
      }
      setShowCleanConfirmModal(false);
      const targetMenuLabel = isProgressTrackingMenu
        ? 'Mục 4. Tiến độ hồ sơ'
        : isExamPlanMenu
        ? 'Mục 2. Kế hoạch kiểm tra'
        : isDepartmentHeadView
        ? 'Hồ sơ tổ chuyên môn'
        : 'Quản lý tiến độ hồ sơ';
      onNotify(
        'success',
        'Đã làm sạch dữ liệu mẫu & thử nghiệm',
        `Toàn bộ hồ sơ mẫu, hồ sơ giả lập và dữ liệu kiểm thử đã được dọn sạch. ${targetMenuLabel} đã sẵn sàng 100% cho dữ liệu chính thức của nhà trường.`
      );
    } catch {
      setOfficialWorkflows(loadSavedWorkflows(questions, matrices, exams));
      setShowCleanConfirmModal(false);
      onNotify(
        'success',
        'Đã làm sạch dữ liệu mẫu cục bộ',
        'Đã xóa toàn bộ hồ sơ mẫu/thử nghiệm lưu trên trình duyệt để vận hành chính thức.'
      );
    } finally {
      setIsCleaningData(false);
    }
  };

  const handleConfirmDeleteDraftDossier = async () => {
    if (!selectedDossier) return;
    const targetId = selectedDossier.workflowId;
    const res = await deleteOfficialWorkflowDossier(targetId);
    if (!res.ok) {
      onNotify(
        'error',
        'Không thể xóa hồ sơ',
        res.errorMessage || 'Hồ sơ đã phê duyệt chính thức không được phép xóa.'
      );
      return;
    }
    setOfficialWorkflows(res.remaining);
    setSelectedDossier(null);
    setActiveModalMode(null);
    onNotify(
      'info',
      'Đã xóa hồ sơ chưa phê duyệt',
      `Hồ sơ [${targetId}] đã được gỡ khỏi danh sách theo dõi chính thức của nhà trường.`
    );
  };

  const refreshAllLists = () => {
    setOfficialWorkflows(loadSavedWorkflows(questions, matrices, exams));
  };

  // IV.5: Gửi yêu cầu chỉnh sửa
  const handleSendRevisionRequest = () => {
    if (!selectedDossier) return;
    if (!activeAccount.canRequestRevision) {
      onNotify(
        'error',
        'Không có thẩm quyền (RBAC)',
        `Vai trò [${activeAccount.role}] không có quyền gửi yêu cầu chỉnh sửa hồ sơ.`
      );
      return;
    }

    const nowIso = new Date().toISOString();
    const rolePrefixLabel =
      activeAccount.role === 'HEAD_OF_DEPARTMENT'
        ? 'Tổ trưởng chuyên môn yêu cầu chỉnh sửa'
        : 'Ban Giám hiệu yêu cầu chỉnh sửa';
    const auditEntry: ExamWorkflowAuditLogEntry = {
      id: `audit-rev-req-${Date.now()}`,
      workflowId: selectedDossier.workflowId,
      timestamp: nowIso,
      actorId: activeAccount.accountId,
      actorName: activeAccount.fullName,
      actorRole: activeAccount.role,
      actionType: 'STATE_TRANSITION',
      fromState: selectedDossier.status,
      toState: 'RevisionRequired',
      fromStep: selectedDossier.currentStep,
      toStep: 5,
      versionId: selectedDossier.currentVersionId,
      backendVerified: true,
      summary: `[${rolePrefixLabel}] ${activeAccount.fullName}: "${revisionRequestNote}"`,
    };

    const updated: ExamWorkflow = {
      ...selectedDossier,
      status: 'RevisionRequired',
      currentStep: 5,
      updatedAt: nowIso,
      assignedUsers: {
        ...selectedDossier.assignedUsers,
        currentAssigneeName: selectedDossier.creatorName,
        currentAssigneeRole: 'TEACHER',
      },
      step6ProfessionalReview: {
        ...selectedDossier.step6ProfessionalReview,
        latestDecision: 'REVISION_REQUIRED',
      },
      auditTrail: [auditEntry, ...selectedDossier.auditTrail],
    };

    saveProgressDossierUpdate(updated, questions, matrices, exams);
    refreshAllLists();
    setSelectedDossier(updated);
    setActiveModalMode(null);
    onNotify(
      'warning',
      'Đã gửi yêu cầu chỉnh sửa',
      `Hồ sơ [${updated.workflowId}] đã chuyển sang trạng thái "Yêu cầu chỉnh sửa (RevisionRequired)" và giao về cho ${updated.creatorName}.`
    );
  };

  // Phân công cán bộ phản biện chính thức
  const handleAssignReviewer = () => {
    if (!selectedDossier) return;
    if (!activeAccount.canAssignReviewer) {
      onNotify(
        'error',
        'Không có thẩm quyền (RBAC)',
        `Vai trò [${activeAccount.role}] không có quyền phân công người phản biện.`
      );
      return;
    }

    const effectiveReviewer = (
      availableOfficialReviewers.length > 0 &&
      !availableOfficialReviewers.includes(selectedReviewerToAssign)
        ? availableOfficialReviewers[0]
        : selectedReviewerToAssign
    ).trim();

    if (!effectiveReviewer) {
      onNotify(
        'warning',
        'Chưa chọn người phản biện',
        'Vui lòng chọn hoặc nhập họ tên cán bộ phản biện chính thức trước khi lưu.'
      );
      return;
    }

    const nowIso = new Date().toISOString();
    const auditEntry: ExamWorkflowAuditLogEntry = {
      id: `audit-assign-rev-${Date.now()}`,
      workflowId: selectedDossier.workflowId,
      timestamp: nowIso,
      actorId: activeAccount.accountId,
      actorName: activeAccount.fullName,
      actorRole: activeAccount.role,
      actionType: 'STEP_SAVED',
      fromState: selectedDossier.status,
      toState: selectedDossier.status,
      fromStep: selectedDossier.currentStep,
      toStep: selectedDossier.currentStep,
      versionId: selectedDossier.currentVersionId,
      backendVerified: true,
      summary: `[Phân công người phản biện] ${activeAccount.fullName} đã phân công "${effectiveReviewer}" làm cán bộ thẩm định hồ sơ [${selectedDossier.workflowId}].`,
    };

    const updated: ExamWorkflow = {
      ...selectedDossier,
      updatedAt: nowIso,
      assignedUsers: {
        ...selectedDossier.assignedUsers,
        reviewerName: effectiveReviewer,
        currentAssigneeName:
          selectedDossier.status === 'ProfessionalReview'
            ? effectiveReviewer
            : selectedDossier.assignedUsers.currentAssigneeName,
      },
      auditTrail: [auditEntry, ...selectedDossier.auditTrail],
    };

    saveProgressDossierUpdate(updated, questions, matrices, exams);
    refreshAllLists();
    setSelectedDossier(updated);
    setActiveModalMode(null);
    onNotify(
      'success',
      'Đã phân công người phản biện',
      `Đã gán ${effectiveReviewer} làm cán bộ thẩm định cho hồ sơ [${updated.workflowId}].`
    );
  };

  // IV.8: Xuất báo cáo tiến độ
  const handleExportProgressReport = (targetList: ExamWorkflow[], labelSuffix = 'Toan_Danh_Sach') => {
    if (!activeAccount.canExportProgressReport) {
      onNotify(
        'error',
        'Từ chối kết xuất báo cáo (RBAC)',
        `Vai trò [${activeAccount.role}] không có quyền xuất báo cáo tiến độ tổng hợp của Ban Giám hiệu.`
      );
      return;
    }

    const csv = exportPrincipalProgressReportCsv(targetList, activeAccount);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Tien_Do_Ho_So_Kiem_Tra_${labelSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      'Đã xuất Báo cáo Tiến độ Hồ sơ (.CSV)',
      `Đã kết xuất ${targetList.length} hồ sơ chính thức (tự động ẩn nội dung câu hỏi & đáp án đối với đề mật).`
    );
  };

  const renderToneBadge = (
    text: string,
    tone: 'emerald' | 'amber' | 'rose' | 'slate'
  ) => {
    const classes =
      tone === 'emerald'
        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
        : tone === 'amber'
        ? 'bg-amber-50 text-amber-900 border-amber-300'
        : tone === 'rose'
        ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold'
        : 'bg-slate-100 text-slate-700 border-slate-300';
    return (
      <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium ${classes}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Trang KẾ HOẠCH KIỂM TRA / TIẾN ĐỘ HỒ SƠ / HỒ SƠ TỔ CHUYÊN MÔN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-900 text-amber-300">
                <ClipboardList className="w-3.5 h-3.5" />
                {isDepartmentHeadView
                  ? `TỔ TRƯỞNG CHUYÊN MÔN · ${managedDepartments.join(', ').toUpperCase()}`
                  : isVicePrincipalView && isExamPlanMenu
                  ? 'PHÓ HIỆU TRƯỞNG · MỤC 2. KẾ HOẠCH KIỂM TRA'
                  : isVicePrincipalView && isProgressTrackingMenu
                  ? 'PHÓ HIỆU TRƯỞNG · MỤC 4. TIẾN ĐỘ HỒ SƠ CHÍNH THỨC'
                  : isVicePrincipalView
                  ? 'PHÓ HIỆU TRƯỞNG · THEO DÕI TIẾN ĐỘ HỒ SƠ'
                  : isExamPlanMenu
                  ? 'BAN GIÁM HIỆU · KẾ HOẠCH KIỂM TRA CHÍNH THỨC'
                  : 'BAN GIÁM HIỆU · QUẢN LÝ TIẾN ĐỘ HỒ SƠ CHÍNH THỨC'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Dữ liệu Chính thức · Bảo mật Đề mật
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {activeAccount.fullName} · {schoolName || config.schoolName}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isDepartmentHeadView
                ? activeMenu === 'dept-progress'
                  ? `THEO DÕI TIẾN ĐỘ HỒ SƠ — ${managedDepartments.join(', ').toUpperCase()}`
                  : `HỒ SƠ TỔ CHUYÊN MÔN — ${managedDepartments.join(', ').toUpperCase()}`
                : isProgressTrackingMenu
                ? 'THEO DÕI TIẾN ĐỘ HỒ SƠ KIỂM TRA CHÍNH THỨC TOÀN TRƯỜNG'
                : isExamPlanMenu
                ? 'KẾ HOẠCH KIỂM TRA ĐỊNH KỲ & QUẢN LÝ HỒ SƠ CHÍNH THỨC'
                : 'QUẢN LÝ TIẾN ĐỘ HỒ SƠ KIỂM TRA TOÀN TRƯỜNG'}
            </h1>
            <p className="text-xs text-slate-600">
              {isDepartmentHeadView
                ? `Giám sát Ma trận, Bản đặc tả, Đề kiểm tra, AI Quality Review, Phân công phản biện và Thẩm định hồ sơ đối với các môn học & giáo viên thuộc ${managedDepartments.join(', ')}.`
                : isProgressTrackingMenu
                ? 'Giám sát xuyên suốt tiến độ 9 bước (Ma trận, Bản đặc tả, Đề kiểm tra, AI Quality Review, Thẩm định chuyên môn, Phê duyệt & Khóa đề), cảnh báo hồ sơ quá hạn và điều phối phản biện chính thức của nhà trường.'
                : isExamPlanMenu
                ? 'Lập kế hoạch kiểm tra định kỳ (Giữa học kỳ 1, Cuối học kỳ 1, Giữa học kỳ 2, Cuối học kỳ 2), phân công giáo viên ra đề – phản biện và giám sát tiến độ hồ sơ chính thức của nhà trường.'
                : 'Giám sát tiến độ Ma trận, Bản đặc tả, Đề kiểm tra, AI Quality Review, Thẩm định, Phê duyệt và Cảnh báo quá hạn theo phạm vi phân quyền của Ban Giám hiệu.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreatePlanModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isProgressTrackingMenu ? 'Tạo hồ sơ kế hoạch mới' : 'Lập kế hoạch kiểm tra mới'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportProgressReport(filteredWorkflows)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-700" />
              <span>Xuất Báo cáo Tiến độ (.CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCleanConfirmModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Dọn dẹp triệt để mọi hồ sơ mẫu / thử nghiệm còn lưu tạm (giữ nguyên dữ liệu chính thức)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Làm sạch dữ liệu mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* THỐNG KÊ TIẾN ĐỘ HỒ SƠ (7 CHỈ SỐ)                                     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500">1. Tổng số hồ sơ</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {statistics.totalDossiers}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hồ sơ chính thức</div>
        </div>

        <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-blue-700">2. Đang xây dựng</div>
          <div className="text-2xl font-extrabold text-blue-900 mt-1">
            {statistics.buildingCount}
          </div>
          <div className="text-[11px] text-blue-700 mt-0.5">Bước 1 → Bước 5</div>
        </div>

        <div className="bg-white rounded-2xl border border-cyan-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-cyan-800">3. Chờ thẩm định</div>
          <div className="text-2xl font-extrabold text-cyan-950 mt-1">
            {statistics.awaitingReviewCount}
          </div>
          <div className="text-[11px] text-cyan-800 mt-0.5">Đang phản biện (Bước 6)</div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-rose-700">4. Yêu cầu chỉnh sửa</div>
          <div className="text-2xl font-extrabold text-rose-900 mt-1">
            {statistics.revisionRequiredCount}
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5">Cần GV hoàn thiện lại</div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-amber-800">5. Chờ phê duyệt</div>
          <div className="text-2xl font-extrabold text-amber-950 mt-1">
            {statistics.awaitingApprovalCount}
          </div>
          <div className="text-[11px] text-amber-800 mt-0.5">Trình BGH duyệt (Bước 7)</div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-emerald-700">6. Đã phê duyệt</div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">
            {statistics.approvedCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Đã khóa đề & Phát hành</div>
        </div>

        <div className="bg-rose-50/80 rounded-2xl border border-rose-300 p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-rose-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>7. Hồ sơ quá hạn</span>
          </div>
          <div className="text-2xl font-extrabold text-rose-950 mt-1">
            {statistics.overdueCount}
          </div>
          <div className="text-[11px] text-rose-800 font-medium mt-0.5">Cần đôn đốc ngay</div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BỘ LỌC TIẾN ĐỘ HỒ SƠ (8 TIÊU CHÍ)                                     */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-4 h-4 text-blue-700" />
            <span>Bộ lọc tiến độ hồ sơ (Năm học, Khối, Môn, Tổ chuyên môn, Giáo viên, Kỳ kiểm tra, Trạng thái, Quá hạn)</span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">1. Năm học:</label>
            <select
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            >
              <option value="ALL">Tất cả năm học</option>
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">2. Khối lớp:</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            >
              <option value="ALL">
                {isDepartmentHeadView
                  ? `Tất cả khối lớp trong tổ (${filterOptions.grades.length} khối)`
                  : 'Tất cả khối lớp'}
              </option>
              {filterOptions.grades.some((g) => g <= 5) && (
                <optgroup label="Cấp Tiểu học (Khối 1 – 5)">
                  {filterOptions.grades
                    .filter((g) => g <= 5)
                    .map((g) => (
                      <option key={g} value={String(g)}>
                        Khối lớp {g} (Tiểu học)
                      </option>
                    ))}
                </optgroup>
              )}
              {filterOptions.grades.some((g) => g >= 6) && (
                <optgroup label="Cấp Trung học cơ sở (Khối 6 – 9)">
                  {filterOptions.grades
                    .filter((g) => g >= 6)
                    .map((g) => (
                      <option key={g} value={String(g)}>
                        Khối lớp {g} (THCS)
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">3. Môn học:</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            >
              <option value="ALL">
                {isDepartmentHeadView
                  ? `Tất cả môn trong tổ (${filterOptions.subjectOptions.length} môn)`
                  : `Tất cả môn học (${filterOptions.subjectOptions.length} môn)`}
              </option>
              {filterOptions.subjectOptions.some((o) => o.educationLevelId === 'PRIMARY') && (
                <optgroup label="Cấp Tiểu học (Khối 1 – 5)">
                  {filterOptions.subjectOptions
                    .filter((o) => o.educationLevelId === 'PRIMARY')
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
              )}
              {filterOptions.subjectOptions.some(
                (o) => o.educationLevelId === 'LOWER_SECONDARY'
              ) && (
                <optgroup label="Cấp Trung học cơ sở (Khối 6 – 9)">
                  {filterOptions.subjectOptions
                    .filter((o) => o.educationLevelId === 'LOWER_SECONDARY')
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">4. Tổ chuyên môn:</label>
            <select
              value={
                isDepartmentHeadView && filterOptions.departments.length === 1
                  ? filterOptions.departments[0]
                  : filterDepartment
              }
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium text-slate-900"
            >
              {!(isDepartmentHeadView && filterOptions.departments.length === 1) && (
                <option value="ALL">
                  {isDepartmentHeadView ? 'Tất cả tổ quản lý' : 'Tất cả tổ chuyên môn'}
                </option>
              )}
              {filterOptions.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">5. Giáo viên ra đề:</label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            >
              <option value="ALL">
                {isDepartmentHeadView
                  ? `Tất cả giáo viên trong tổ (${filterOptions.teachers.length} GV)`
                  : 'Tất cả giáo viên'}
              </option>
              {filterOptions.teachers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">6. Kỳ kiểm tra:</label>
            <select
              value={filterExamPeriod}
              onChange={(e) => setFilterExamPeriod(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            >
              <option value="ALL">Tất cả kỳ kiểm tra</option>
              {filterOptions.periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">7. Trạng thái hồ sơ:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            >
              <option value="ALL">Tất cả trạng thái (13 trạng thái)</option>
              {filterOptions.statuses.map((st) => (
                <option key={st} value={st}>
                  {WORKFLOW_STATE_LABELS[st].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">8. Hồ sơ quá hạn:</label>
            <select
              value={filterOverdueMode}
              onChange={(e) =>
                setFilterOverdueMode(e.target.value as 'ALL' | 'OVERDUE_ONLY' | 'ON_TIME')
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-semibold"
            >
              <option value="ALL">Tất cả (Quá hạn & Trong hạn)</option>
              <option value="OVERDUE_ONLY">Chỉ hiển thị Hồ sơ QUÁ HẠN ({statistics.overdueCount})</option>
              <option value="ON_TIME">Chỉ hiển thị Hồ sơ đúng hạn / đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Thanh chuyển Tab giữa: Bảng tổng hợp tiến độ | Cảnh báo tự động */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSectionTab('SUMMARY_TABLE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSectionTab === 'SUMMARY_TABLE'
              ? 'bg-blue-900 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Bảng Tổng Hợp Tiến Độ & Thao Tác Điều Hành ({filteredWorkflows.length} hồ sơ)
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('AUTO_WARNINGS_V')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSectionTab === 'AUTO_WARNINGS_V'
              ? 'bg-rose-800 text-white'
              : 'bg-white border border-rose-200 text-rose-900 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Cảnh Báo Tiến Độ Tự Động ({autoWarnings.length} cảnh báo)</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* BẢNG TỔNG HỢP TIẾN ĐỘ HỒ SƠ CHÍNH THỨC                                */}
      {/* ===================================================================== */}
      {activeSectionTab === 'SUMMARY_TABLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/70">
            <div className="text-xs font-bold text-slate-800">
              {isProgressTrackingMenu
                ? 'BẢNG THEO DÕI TIẾN ĐỘ HỒ SƠ KIỂM TRA CHÍNH THỨC TOÀN TRƯỜNG'
                : 'BẢNG TỔNG HỢP TIẾN ĐỘ HỒ SƠ KIỂM TRA CHÍNH THỨC'}
            </div>
            <div className="text-[11px] text-slate-500">
              Đang hiển thị <span className="font-bold text-slate-900">{filteredWorkflows.length}</span> hồ sơ thuộc phạm vi của{' '}
              <span className="font-bold text-blue-900">{activeAccount.fullName}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-left">
                  <th className="p-2.5 border border-slate-200 text-center">1. STT</th>
                  <th className="p-2.5 border border-slate-200">2. Khối lớp</th>
                  <th className="p-2.5 border border-slate-200">3. Môn học</th>
                  <th className="p-2.5 border border-slate-200">4. Kỳ kiểm tra</th>
                  <th className="p-2.5 border border-slate-200">5. Giáo viên ra đề</th>
                  <th className="p-2.5 border border-slate-200">6. Tổ chuyên môn</th>
                  <th className="p-2.5 border border-slate-200">7. Trạng thái ma trận</th>
                  <th className="p-2.5 border border-slate-200">8. Trạng thái đề</th>
                  <th className="p-2.5 border border-slate-200">9. Kết quả AI kiểm tra</th>
                  <th className="p-2.5 border border-slate-200">10. Trạng thái thẩm định</th>
                  <th className="p-2.5 border border-slate-200">11. Trạng thái phê duyệt</th>
                  <th className="p-2.5 border border-slate-200">12. Hạn hoàn thành</th>
                  <th className="p-2.5 border border-slate-200">13. Người phụ trách hiện tại</th>
                  <th className="p-2.5 border border-slate-200">14. Thao tác điều hành</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map((wf, idx) => {
                  const cols = computeDossierColumnStatuses(wf);
                  const dept = resolveDepartmentForWorkflow(wf);
                  const due = resolveDueDateForWorkflow(wf);
                  const overdue = isWorkflowOverdue(wf);

                  return (
                    <tr
                      key={wf.workflowId}
                      className={`border-b border-slate-200 hover:bg-slate-50/90 ${
                        overdue ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="p-2.5 border border-slate-200 text-center font-mono font-bold">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                        Lớp {wf.gradeId}
                        <div className="text-[10px] font-mono text-slate-500">{wf.workflowId}</div>
                      </td>
                      <td className="p-2.5 border border-slate-200 font-semibold text-blue-950 whitespace-nowrap">
                        {wf.subjectId}
                      </td>
                      <td className="p-2.5 border border-slate-200 whitespace-nowrap">
                        {normalizeExamPeriodLabel(wf.examPeriod, wf.examPeriodLabel)}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-medium text-slate-800">
                        {wf.creatorName}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-slate-700">{dept}</td>
                      <td className="p-2.5 border border-slate-200">
                        {renderToneBadge(cols.matrixStatusLabel, cols.matrixStatusTone)}
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        {renderToneBadge(cols.examStatusLabel, cols.examStatusTone)}
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        {renderToneBadge(cols.aiReviewStatusLabel, cols.aiReviewStatusTone)}
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        {renderToneBadge(cols.appraisalStatusLabel, cols.appraisalStatusTone)}
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        {renderToneBadge(cols.approvalStatusLabel, cols.approvalStatusTone)}
                      </td>
                      <td className="p-2.5 border border-slate-200 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">{due}</div>
                        {overdue ? (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                            QUÁ HẠN
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            Đúng hạn
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-medium text-slate-900">
                        {wf.assignedUsers.currentAssigneeName}
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        <div className="flex flex-wrap gap-1 min-w-56">
                          {/* 1. Mở hồ sơ */}
                          <button
                            type="button"
                            onClick={() => onOpenWorkflowInPipeline(wf.workflowId)}
                            className="px-2 py-1 rounded bg-blue-700 text-white text-[11px] font-semibold hover:bg-blue-800 cursor-pointer"
                            title="1. Mở hồ sơ trong Quy trình 9 bước"
                          >
                            1. Mở hồ sơ
                          </button>

                          {/* 2. Xem tiến độ */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDossier(wf);
                              setActiveModalMode('PROGRESS');
                            }}
                            className="px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-medium hover:bg-slate-200 cursor-pointer"
                          >
                            2. Tiến độ
                          </button>

                          {/* 3. Xem lỗi AI */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDossier(wf);
                              setActiveModalMode('AI_ERRORS');
                            }}
                            className="px-2 py-1 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-medium hover:bg-indigo-100 cursor-pointer"
                          >
                            3. Lỗi AI
                          </button>

                          {/* 4. Xem nhận xét thẩm định */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDossier(wf);
                              setActiveModalMode('REVIEW_COMMENTS');
                            }}
                            className="px-2 py-1 rounded bg-cyan-50 text-cyan-900 border border-cyan-200 text-[11px] font-medium hover:bg-cyan-100 cursor-pointer"
                          >
                            4. Thẩm định
                          </button>

                          {/* 5. Gửi yêu cầu chỉnh sửa */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDossier(wf);
                              setActiveModalMode('REQUEST_REVISION');
                            }}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-900 border border-rose-200 text-[11px] font-medium hover:bg-rose-100 cursor-pointer"
                          >
                            5. Yêu cầu sửa
                          </button>

                          {/* 6. Phân công người phản biện */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDossier(wf);
                              const fallbackReviewer =
                                filterOptions.teachers.find((t) => t !== wf.creatorName) ||
                                filterOptions.teachers[0] ||
                                '';
                              setSelectedReviewerToAssign(
                                wf.assignedUsers.reviewerName || fallbackReviewer
                              );
                              setActiveModalMode('ASSIGN_REVIEWER');
                            }}
                            className="px-2 py-1 rounded bg-amber-50 text-amber-950 border border-amber-200 text-[11px] font-medium hover:bg-amber-100 cursor-pointer"
                          >
                            6. Phân công PB
                          </button>

                          {/* 7. Xem lịch sử */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDossier(wf);
                              setActiveModalMode('HISTORY');
                            }}
                            className="px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-medium hover:bg-slate-200 cursor-pointer"
                          >
                            7. Lịch sử
                          </button>

                          {/* 8. Xuất báo cáo tiến độ hồ sơ này */}
                          <button
                            type="button"
                            onClick={() => handleExportProgressReport([wf], wf.workflowId)}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-medium hover:bg-emerald-100 cursor-pointer"
                          >
                            8. Xuất BC
                          </button>

                          {/* Xóa kế hoạch nháp (chỉ áp dụng khi chưa phê duyệt/phát hành chính thức) */}
                          {wf.status !== 'Approved' &&
                            wf.status !== 'Released' &&
                            wf.status !== 'Archived' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDossier(wf);
                                  setActiveModalMode('DELETE_DOSSIER');
                                }}
                                className="px-2 py-1 rounded bg-slate-50 text-rose-700 border border-rose-200 text-[11px] font-medium hover:bg-rose-50 cursor-pointer inline-flex items-center gap-1"
                                title="Xóa hồ sơ chưa phê duyệt"
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
                {filteredWorkflows.length === 0 && (
                  <tr>
                    <td colSpan={14} className="p-10 text-center bg-slate-50/40">
                      <div className="max-w-2xl mx-auto space-y-3">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {scopedWorkflows.length === 0
                            ? isProgressTrackingMenu
                              ? 'Dữ liệu Tiến độ hồ sơ đã được làm sạch — Sẵn sàng theo dõi chính thức'
                              : 'Dữ liệu đã được làm sạch — Sẵn sàng sử dụng chính thức'
                            : 'Không có hồ sơ chính thức nào khớp với bộ lọc hiện tại'}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {scopedWorkflows.length === 0
                            ? isProgressTrackingMenu
                              ? 'Toàn bộ dữ liệu mẫu, hồ sơ giả lập và hồ sơ thử nghiệm đã được loại bỏ hoàn toàn (0 hồ sơ mẫu). Khi lập kế hoạch tại Mục 2. Kế hoạch kiểm tra, giao nhiệm vụ tại Mục 3. Phân công ra đề hoặc giáo viên nộp hồ sơ đề chính thức, tiến độ 9 bước sẽ tự động cập nhật trực tiếp tại đây.'
                              : 'Toàn bộ dữ liệu mẫu và hồ sơ thử nghiệm đã được loại bỏ hoàn toàn (0 hồ sơ mẫu). Bấm nút "Lập kế hoạch kiểm tra mới" bên dưới để bắt đầu khởi tạo kế hoạch kiểm tra định kỳ và phân công giáo viên ra đề chính thức cho nhà trường.'
                            : 'Vui lòng đặt lại các tiêu chí lọc bên trên để xem toàn bộ danh sách hồ sơ kiểm tra chính thức.'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          {scopedWorkflows.length === 0 ? (
                            isProgressTrackingMenu && isVicePrincipalView ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onNavigate('progress-management')}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 cursor-pointer shadow-xs"
                                >
                                  <Calendar className="w-4 h-4" />
                                  <span>Mở mục 2. Kế hoạch kiểm tra</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onNavigate('bgh-assign-exam')}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer"
                                >
                                  <UserPlus className="w-4 h-4 text-blue-700" />
                                  <span>Mở mục 3. Phân công ra đề</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onNavigate('approval')}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                                >
                                  <UserCheck className="w-4 h-4 text-emerald-700" />
                                  <span>Mở mục 5. Thẩm định</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleOpenCreatePlanModal}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 text-slate-600" />
                                  <span>Tạo hồ sơ kế hoạch mới</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={handleOpenCreatePlanModal}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 cursor-pointer shadow-xs"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Lập kế hoạch kiểm tra mới</span>
                                </button>
                                {isVicePrincipalView && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigate('bgh-assign-exam')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer"
                                  >
                                    <UserPlus className="w-4 h-4 text-blue-700" />
                                    <span>Mở mục 3. Phân công ra đề</span>
                                  </button>
                                )}
                              </>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Đặt lại tất cả bộ lọc</span>
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
      )}

      {/* ===================================================================== */}
      {/* CẢNH BÁO TIẾN ĐỘ TỰ ĐỘNG (8 LOẠI CẢNH BÁO - ẨN NỘI DUNG ĐỀ MẬT)       */}
      {/* ===================================================================== */}
      {activeSectionTab === 'AUTO_WARNINGS_V' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hệ thống Cảnh báo Tự động (8 Nhóm Cảnh báo Tiến độ & Chất lượng Hồ sơ)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Tự động phát hiện: Hồ sơ quá hạn, Thiếu ma trận, Thiếu bản đặc tả, Chưa kiểm tra AI, Có lỗi nghiêm trọng chưa xử lý, Chưa thẩm định, Chưa phê duyệt, Thiếu đáp án/hướng dẫn chấm. Tuyệt đối ẩn nội dung đề mật.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-900 text-xs font-bold shrink-0">
              Tổng số cảnh báo: {autoWarnings.length}
            </span>
          </div>

          {autoWarnings.length === 0 ? (
            <div className="p-8 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-emerald-950">
                Hiện không có cảnh báo tiến độ hay lỗi chất lượng tồn đọng (0 cảnh báo)
              </div>
              <p className="text-xs text-emerald-800">
                Khi có hồ sơ chính thức quá hạn hoặc thiếu thành phần bắt buộc, hệ thống sẽ tự động cảnh báo tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {autoWarnings.map((w) => (
                <div
                  key={w.id}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    w.severity === 'CRITICAL'
                      ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                      : w.severity === 'HIGH'
                      ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{w.warningLabel}</span>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                      {w.workflowId} · Lớp {w.gradeId} {w.subjectId}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-85">
                    Tổ chuyên môn: <strong>{w.departmentName}</strong> · Giáo viên: <strong>{w.teacherName}</strong>
                  </div>
                  <p className="leading-relaxed font-medium">{w.safeOverviewMessage}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL CHI TIẾT THAO TÁC (TIẾN ĐỘ, LỖI AI, THẨM ĐỊNH, SỬA, PHẢN BIỆN)  */}
      {/* ===================================================================== */}
      {activeModalMode && selectedDossier && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="text-xs font-mono font-bold text-blue-800">
                  Hồ sơ: {selectedDossier.workflowId} · Lớp {selectedDossier.gradeId} {selectedDossier.subjectId}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeModalMode === 'PROGRESS' && 'Xem Tiến độ 9 Bước của Hồ sơ Kiểm tra'}
                  {activeModalMode === 'AI_ERRORS' && 'Xem Báo cáo Kết quả AI Kiểm tra (AI Quality Review)'}
                  {activeModalMode === 'REVIEW_COMMENTS' && 'Xem Nhận xét Thẩm định Chuyên môn'}
                  {activeModalMode === 'REQUEST_REVISION' && 'Gửi Yêu cầu Chỉnh sửa Hồ sơ Đề'}
                  {activeModalMode === 'ASSIGN_REVIEWER' && 'Phân công Cán bộ Phản biện / Thẩm định'}
                  {activeModalMode === 'HISTORY' && 'Lịch sử Thao tác & Phiên bản Hồ sơ'}
                  {activeModalMode === 'DELETE_DOSSIER' && 'Xác nhận Xóa Hồ sơ Chưa Phê duyệt'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalMode(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thông báo bảo mật đề mật */}
            {selectedDossier.isConfidentialExam && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Bảo mật Đề mật:</strong> Chế độ xem tổng quan tiến độ chỉ hiển thị trạng thái hồ sơ và chỉ số kỹ thuật, không hiển thị nội dung câu hỏi và đáp án chi tiết của đề mật.
                </span>
              </div>
            )}

            {activeModalMode === 'PROGRESS' && (
              <div className="space-y-2.5 text-xs">
                {WORKFLOW_9_STEPS_META.map((st) => {
                  const done = st.stepNumber < selectedDossier.currentStep || selectedDossier.status === 'ResultsAnalysis';
                  const current = st.stepNumber === selectedDossier.currentStep;
                  return (
                    <div
                      key={st.stepNumber}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        current
                          ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                          : done
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span>{st.fullTitle}</span>
                      <span className="font-mono text-[11px] shrink-0 ml-2">
                        {current ? 'ĐANG THỰC HIỆN' : done ? 'HOÀN TẤT' : 'CHỜ'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeModalMode === 'AI_ERRORS' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="text-rose-700">Lỗi Nghiêm trọng</div>
                    <div className="text-lg font-bold text-rose-950">
                      {selectedDossier.step4AiQualityReview.criticalErrorsCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="text-amber-800">Lỗi Trung bình</div>
                    <div className="text-lg font-bold text-amber-950">
                      {selectedDossier.step4AiQualityReview.mediumErrorsCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-emerald-700">Đã xử lý</div>
                    <div className="text-lg font-bold text-emerald-950">
                      {selectedDossier.step4AiQualityReview.resolvedErrorsCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-slate-500">Phiên bản kiểm tra</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {selectedDossier.step4AiQualityReview.inspectedVersionId || 'Chưa chạy AI'}
                    </div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  Kết luận tổng thể AI Quality Review:{' '}
                  <strong>{selectedDossier.step4AiQualityReview.overallDashboardStatusLabel}</strong>
                </div>
              </div>
            )}

            {activeModalMode === 'REVIEW_COMMENTS' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  Người phản biện được phân công: <strong>{selectedDossier.assignedUsers.reviewerName}</strong>
                </div>
                {selectedDossier.step6ProfessionalReview.ballots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                    Hồ sơ này hiện chưa có biên bản nhận xét thẩm định chuyên môn.
                  </div>
                ) : (
                  selectedDossier.step6ProfessionalReview.ballots.map((b) => (
                    <div
                      key={b.ballotId}
                      className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-1.5"
                    >
                      <div className="font-bold text-cyan-950 flex justify-between">
                        <span>{b.reviewerName}</span>
                        <span className="font-mono">{b.submittedAt}</span>
                      </div>
                      <div className="font-semibold">
                        Kết luận:{' '}
                        {b.decision === 'ELIGIBLE_FOR_APPROVAL'
                          ? 'Đủ điều kiện trình phê duyệt'
                          : 'Yêu cầu chỉnh sửa lại'}
                      </div>
                      <p className="text-slate-700">{b.generalComments}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeModalMode === 'REQUEST_REVISION' && (
              <div className="space-y-3 text-xs">
                <label className="font-bold text-slate-800 block">
                  Nội dung yêu cầu chỉnh sửa gửi tới giáo viên ({selectedDossier.creatorName}):
                </label>
                <textarea
                  rows={3}
                  value={revisionRequestNote}
                  onChange={(e) => setRevisionRequestNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalMode(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRevisionRequest}
                    className="px-4 py-2 rounded-xl bg-rose-700 text-white font-bold hover:bg-rose-800 cursor-pointer"
                  >
                    Xác nhận gửi Yêu cầu chỉnh sửa
                  </button>
                </div>
              </div>
            )}

            {activeModalMode === 'ASSIGN_REVIEWER' && (
              <div className="space-y-3 text-xs">
                <label className="font-bold text-slate-800 block">
                  Chọn Cán bộ Phản biện / Thẩm định chuyên môn cho hồ sơ [{selectedDossier.workflowId}]:
                </label>
                {availableOfficialReviewers.length > 0 ? (
                  <select
                    value={
                      availableOfficialReviewers.includes(selectedReviewerToAssign)
                        ? selectedReviewerToAssign
                        : availableOfficialReviewers[0]
                    }
                    onChange={(e) => setSelectedReviewerToAssign(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  >
                    {availableOfficialReviewers.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedReviewerToAssign}
                    onChange={(e) => setSelectedReviewerToAssign(e.target.value)}
                    placeholder="Nhập họ tên giáo viên / cán bộ phản biện chính thức"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold"
                  />
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalMode(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignReviewer}
                    className="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 cursor-pointer"
                  >
                    Lưu phân công người phản biện
                  </button>
                </div>
              </div>
            )}

            {activeModalMode === 'HISTORY' && (
              <div className="space-y-2.5 text-xs">
                {selectedDossier.auditTrail.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>
                        {log.actorName} ({log.actorRole})
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-700">{log.summary}</div>
                  </div>
                ))}
              </div>
            )}

            {activeModalMode === 'DELETE_DOSSIER' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                  <div className="font-bold">
                    Bạn có chắc chắn muốn xóa hồ sơ kế hoạch [{selectedDossier.workflowId}]?
                  </div>
                  <p className="text-rose-900 leading-relaxed">
                    Môn <strong>{selectedDossier.subjectId}</strong> – Lớp{' '}
                    <strong>{selectedDossier.gradeId}</strong> ({selectedDossier.examPeriodLabel}) do giáo viên{' '}
                    <strong>{selectedDossier.creatorName}</strong> phụ trách sẽ bị gỡ khỏi danh sách Kế hoạch kiểm tra.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalMode(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                  >
                    Giữ lại
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteDraftDossier}
                    className="px-4 py-2 rounded-xl bg-rose-700 text-white font-bold hover:bg-rose-800 cursor-pointer"
                  >
                    Xác nhận xóa kế hoạch này
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL LẬP KẾ HOẠCH KIỂM TRA CHÍNH THỨC MỚI                             */}
      {/* ===================================================================== */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold">
                  <Calendar className="w-3 h-3" />
                  KẾ HOẠCH KIỂM TRA CHÍNH THỨC
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Lập Kế hoạch Kiểm tra & Phân công Hồ sơ Đề mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePlanModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Năm học:</label>
                <select
                  value={newPlanAcademicYear}
                  onChange={(e) => setNewPlanAcademicYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {filterOptions.years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kỳ kiểm tra định kỳ:</label>
                <select
                  value={newPlanPeriodLabel}
                  onChange={(e) => setNewPlanPeriodLabel(e.target.value)}
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
                <label className="font-semibold text-slate-700 block mb-1">Tổ chuyên môn phụ trách:</label>
                <select
                  value={planFormOptions.effectiveDept}
                  onChange={(e) => setNewPlanDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {planFormOptions.availableDepts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={String(planFormOptions.effectiveGrade)}
                  onChange={(e) => setNewPlanGrade(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {planFormOptions.grades.map((g) => (
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
                    planFormOptions.subjects.includes(newPlanSubject)
                      ? newPlanSubject
                      : planFormOptions.subjects[0] || 'Toán'
                  }
                  onChange={(e) => setNewPlanSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                >
                  {planFormOptions.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Giáo viên ra đề:</label>
                {planFormOptions.teachers.length > 0 ? (
                  <select
                    value={
                      planFormOptions.teachers.includes(newPlanCreatorName)
                        ? newPlanCreatorName
                        : planFormOptions.teachers[0]
                    }
                    onChange={(e) => setNewPlanCreatorName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                  >
                    {planFormOptions.teachers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newPlanCreatorName}
                    onChange={(e) => setNewPlanCreatorName(e.target.value)}
                    placeholder="Nhập họ tên giáo viên ra đề"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cán bộ phản biện / thẩm định:</label>
                {planFormOptions.teachers.length > 0 ? (
                  <select
                    value={
                      planFormOptions.teachers.includes(newPlanReviewerName)
                        ? newPlanReviewerName
                        : planFormOptions.teachers[0]
                    }
                    onChange={(e) => setNewPlanReviewerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-medium"
                  >
                    {planFormOptions.teachers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newPlanReviewerName}
                    onChange={(e) => setNewPlanReviewerName(e.target.value)}
                    placeholder="Nhập họ tên cán bộ thẩm định"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hạn hoàn thành hồ sơ:</label>
                <input
                  type="date"
                  value={newPlanDueDate}
                  onChange={(e) => setNewPlanDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngày tổ chức kiểm tra dự kiến:</label>
                <input
                  type="date"
                  value={newPlanExamDate}
                  onChange={(e) => setNewPlanExamDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-mono"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={newPlanConfidential}
                    onChange={(e) => setNewPlanConfidential(e.target.checked)}
                    className="rounded border-slate-300 text-blue-700"
                  />
                  <span>
                    Áp dụng chế độ <strong>Đề mật chính thức</strong> (ẩn nội dung câu hỏi & đáp án trên bảng tổng quan tiến độ)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setShowCreatePlanModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateOfficialExamPlan}
                className="px-4 py-2 rounded-xl bg-blue-800 text-white font-bold hover:bg-blue-900 cursor-pointer"
              >
                Lưu vào Kế hoạch kiểm tra chính thức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL XÁC NHẬN LÀM SẠCH DỮ LIỆU MẪU / THỬ NGHIỆM                       */}
      {/* ===================================================================== */}
      {showCleanConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Làm sạch dữ liệu mẫu & thử nghiệm</span>
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
              Thao tác này sẽ dọn sạch toàn bộ <strong>hồ sơ mẫu, hồ sơ giả lập và dữ liệu kiểm thử</strong> còn lưu tạm trên trình duyệt và máy chủ, đồng thời <strong>giữ nguyên 100% các hồ sơ chính thức</strong> đang theo dõi tại{' '}
              <strong>
                {isProgressTrackingMenu
                  ? 'Mục 4. Tiến độ hồ sơ'
                  : isExamPlanMenu
                  ? 'Mục 2. Kế hoạch kiểm tra'
                  : 'hệ thống nhà trường'}
              </strong>
              .
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
