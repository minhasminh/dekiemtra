import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Building2,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderKanban,
  Layers,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  ApprovalStatus,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  GradeNumber,
  MenuSectionId,
  QuestionItem,
  StorageConfig,
  ToastNotification,
} from '../types/domain';
import { getApprovalStatusInfo } from '../services/business/assessmentRules';
import { areSubjectNamesEquivalent } from '../data/matrixLessonCatalog';
import {
  isSampleOrDemoExam,
  isSampleOrDemoMatrix,
  isSampleOrDemoQuestion,
} from '../services/storage/repository';
import {
  isSampleOrTestWorkflowDossier,
  loadSavedWorkflows,
  purgeAllSampleWorkflowsFromLocal,
  WORKFLOW_STATE_LABELS,
} from '../services/workflow/endToEndExamWorkflowService';

interface SchoolDepartmentSummary {
  id: string;
  departmentName: string;
  headFullName: string | null;
  memberUserIds: string[];
  managedSubjects: string[];
  managedGrades: number[];
}

interface RealTeacherSummary {
  id: string;
  fullName: string;
  departmentName: string;
  subjects: string[];
  grades: number[];
}

type ReportTabId =
  | 'BY_DEPARTMENT'
  | 'BY_GRADE_AND_SUBJECT'
  | 'APPRAISAL_QUALITY'
  | 'OFFICIAL_DOCUMENT_A4';

type PeriodFilterCode =
  | 'ALL'
  | 'GIUA_KY_1'
  | 'CUOI_KY_1'
  | 'GIUA_KY_2'
  | 'CUOI_KY_2';

const PERIOD_FILTER_LABELS: Record<PeriodFilterCode, string> = {
  ALL: 'Cả năm học (Tất cả đợt kiểm tra)',
  GIUA_KY_1: 'Kiểm tra Giữa học kỳ I',
  CUOI_KY_1: 'Kiểm tra Cuối học kỳ I',
  GIUA_KY_2: 'Kiểm tra Giữa học kỳ II',
  CUOI_KY_2: 'Kiểm tra Cuối học kỳ II',
};

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

function matchesExamPeriodFilter(
  rawPeriod: string | undefined,
  rawTitle: string | undefined,
  filter: PeriodFilterCode
): boolean {
  if (filter === 'ALL') return true;
  const p = String(rawPeriod || '').toUpperCase();
  const t = String(rawTitle || '').toLowerCase();
  if (p === filter) return true;
  if (filter === 'GIUA_KY_1' && p === 'MID_SEM_1') return true;
  if (filter === 'CUOI_KY_1' && p === 'END_SEM_1') return true;
  if (filter === 'GIUA_KY_2' && p === 'MID_SEM_2') return true;
  if (filter === 'CUOI_KY_2' && p === 'END_YEAR') return true;
  if (
    filter === 'GIUA_KY_1' &&
    (t.includes('giữa kỳ i') ||
      t.includes('giữa kì i') ||
      t.includes('giữa học kỳ i') ||
      t.includes('gk1'))
  ) {
    return true;
  }
  if (
    filter === 'CUOI_KY_1' &&
    (t.includes('cuối kỳ i') ||
      t.includes('cuối kì i') ||
      t.includes('cuối học kỳ i') ||
      t.includes('ck1'))
  ) {
    return true;
  }
  if (
    filter === 'GIUA_KY_2' &&
    (t.includes('giữa kỳ ii') ||
      t.includes('giữa kì ii') ||
      t.includes('giữa học kỳ ii') ||
      t.includes('gk2'))
  ) {
    return true;
  }
  if (
    filter === 'CUOI_KY_2' &&
    (t.includes('cuối kỳ ii') ||
      t.includes('cuối kì ii') ||
      t.includes('cuối học kỳ ii') ||
      t.includes('ck2'))
  ) {
    return true;
  }
  return false;
}

export interface BghProfessionalReportWorkspaceProps {
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  config: StorageConfig;
  activeMenu?: MenuSectionId;
  actorRole?: string;
  schoolId?: string;
  schoolName?: string;
  governingBody?: string;
  schoolAllowedGrades?: number[];
  actorUserId?: string;
  actorFullName?: string;
  actorRoleTitle?: string;
  actorDepartmentName?: string;
  onCleanSampleReportData?: () => {
    removedQuestions: number;
    removedMatrices: number;
    removedExams: number;
  };
  onNavigate?: (menu: MenuSectionId) => void;
  onNotify: (
    type: ToastNotification['type'],
    title: string,
    message: string
  ) => void;
}

export const BghProfessionalReportWorkspace: React.FC<
  BghProfessionalReportWorkspaceProps
> = ({
  questions,
  matrices,
  exams,
  config,
  activeMenu,
  actorRole,
  schoolId,
  schoolName,
  governingBody,
  schoolAllowedGrades,
  actorUserId,
  actorFullName,
  actorRoleTitle,
  actorDepartmentName,
  onCleanSampleReportData,
  onNavigate,
  onNotify,
}) => {
  const effectiveSchoolId = (schoolId || 'SCHOOL_A').trim();
  const effectiveSchoolName = (
    schoolName ||
    config.schoolName ||
    'Trường TH&THCS Nguyễn Đình Anh'
  ).trim();
  const effectiveGoverningBody = (
    governingBody ||
    (effectiveSchoolId === 'SCHOOL_B' || effectiveSchoolId === 'SCHOOL_C'
      ? 'UBND XÃ QUẢNG ĐIỀN'
      : 'UBND XÃ ĐAN ĐIỀN')
  ).trim();
  const effectiveAcademicYear = (config.academicYear || '2026 - 2027').trim();

  const resolvedRoleLabel = useMemo(() => {
    if (actorRoleTitle?.trim()) return actorRoleTitle.trim();
    if (actorRole === 'PRINCIPAL') return 'Hiệu trưởng';
    if (actorRole === 'HEAD_OF_DEPARTMENT' || activeMenu === 'dept-report') {
      return 'Tổ trưởng chuyên môn';
    }
    return 'Phó Hiệu trưởng';
  }, [actorRoleTitle, actorRole, activeMenu]);

  const resolvedActorName = (actorFullName || resolvedRoleLabel).trim();
  const isDeptScopedReport =
    actorRole === 'HEAD_OF_DEPARTMENT' || activeMenu === 'dept-report';

  const [activeTab, setActiveTab] = useState<ReportTabId>('BY_DEPARTMENT');
  const [levelFilter, setLevelFilter] = useState<EducationLevelId | 'ALL'>(
    'ALL'
  );
  const [selectedDepartmentId, setSelectedDepartmentId] =
    useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterCode>('ALL');

  const [departments, setDepartments] = useState<SchoolDepartmentSummary[]>([]);
  const [teachers, setTeachers] = useState<RealTeacherSummary[]>([]);
  const [officialWorkflows, setOfficialWorkflows] = useState<ExamWorkflow[]>(
    () => loadSavedWorkflows([], [], [])
  );
  const [showCleanModal, setShowCleanModal] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);

  // Tự động làm sạch dữ liệu mẫu/thử nghiệm còn sót trong bộ nhớ khi mở Báo cáo chuyên môn chính thức
  const autoCleanedRef = useRef(false);
  useEffect(() => {
    purgeAllSampleWorkflowsFromLocal();
    if (autoCleanedRef.current) return;
    const hasSampleQ = questions.some((q) => isSampleOrDemoQuestion(q));
    const hasSampleM = matrices.some((m) => isSampleOrDemoMatrix(m));
    const hasSampleE = exams.some((e) => isSampleOrDemoExam(e));
    if (hasSampleQ || hasSampleM || hasSampleE) {
      autoCleanedRef.current = true;
      onCleanSampleReportData?.();
    }
  }, [questions, matrices, exams, onCleanSampleReportData]);

  // Nạp danh sách Tổ chuyên môn, Giáo viên thực tế và Hồ sơ quy trình chính thức của trường
  useEffect(() => {
    let cancelled = false;
    const defaultAdminId =
      actorUserId ||
      (effectiveSchoolId === 'SCHOOL_B'
        ? 'user-school-admin-sia'
        : effectiveSchoolId === 'SCHOOL_C'
        ? 'user-school-admin-ddung'
        : 'user-school-admin-a');

    async function loadOfficialSchoolContext() {
      try {
        const [deptRes, wfRes] = await Promise.all([
          fetch(
            `/api/admin/departments-and-assignments?schoolId=${encodeURIComponent(
              effectiveSchoolId
            )}&adminUserId=${encodeURIComponent(defaultAdminId)}`
          ),
          fetch(
            `/api/workflows?officialOnly=true&schoolId=${encodeURIComponent(
              effectiveSchoolId
            )}`
          ),
        ]);

        if (!cancelled && deptRes.ok) {
          const data = await deptRes.json();
          const parsedTeachers: RealTeacherSummary[] = Array.isArray(
            data?.accounts
          )
            ? data.accounts
                .filter((acc: Record<string, unknown>) => {
                  const fullName = String(acc?.fullName || '').trim();
                  const deptName = String(acc?.departmentName || '').trim();
                  const roles = Array.isArray(acc?.roles)
                    ? acc.roles.map(String)
                    : [];
                  if (!fullName || isAdminManagementDept(deptName)) {
                    return false;
                  }
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
                    ? (acc.subjectAllocations as Array<{
                        subjectName?: string;
                        grades?: number[];
                      }>)
                    : [];
                  const subjSet = new Set<string>();
                  const gradeSet = new Set<number>();
                  for (const al of allocations) {
                    if (al?.subjectName) {
                      subjSet.add(String(al.subjectName).trim());
                    }
                    if (Array.isArray(al?.grades)) {
                      al.grades.forEach((g) => {
                        const gn = Number(g);
                        if (gn >= 1 && gn <= 12) gradeSet.add(gn);
                      });
                    }
                  }
                  if (Array.isArray(acc?.assignedSubjects)) {
                    acc.assignedSubjects.forEach((s: unknown) => {
                      const st = String(s || '').trim();
                      if (st) subjSet.add(st);
                    });
                  }
                  if (Array.isArray(acc?.assignedGrades)) {
                    acc.assignedGrades.forEach((g: unknown) => {
                      const gn = Number(g);
                      if (gn >= 1 && gn <= 12) gradeSet.add(gn);
                    });
                  }
                  return {
                    id: String(acc?.id || ''),
                    fullName: String(acc?.fullName || '').trim(),
                    departmentName: String(acc?.departmentName || '').trim(),
                    subjects: Array.from(subjSet),
                    grades: Array.from(gradeSet).sort((a, b) => a - b),
                  };
                })
            : [];

          const parsedDepts: SchoolDepartmentSummary[] = Array.isArray(
            data?.departments
          )
            ? data.departments
                .map((d: Record<string, unknown>) => {
                  const deptName = String(
                    d?.departmentName || d?.name || ''
                  ).trim();
                  const memberIds = Array.isArray(d?.memberUserIds)
                    ? d.memberUserIds.map(String)
                    : [];
                  const deptTeachers = parsedTeachers.filter(
                    (t) =>
                      memberIds.includes(t.id) ||
                      areDeptNamesSame(t.departmentName, deptName)
                  );
                  const subjSet = new Set<string>();
                  const gradeSet = new Set<number>();
                  if (Array.isArray(d?.managedSubjects)) {
                    d.managedSubjects.forEach((s: unknown) => {
                      const st = String(s || '').trim();
                      if (st) subjSet.add(st);
                    });
                  }
                  if (Array.isArray(d?.grades)) {
                    d.grades.forEach((g: unknown) => {
                      const gn = Number(g);
                      if (gn >= 1 && gn <= 12) gradeSet.add(gn);
                    });
                  }
                  deptTeachers.forEach((t) => {
                    t.subjects.forEach((s) => subjSet.add(s));
                    t.grades.forEach((g) => gradeSet.add(g));
                  });
                  return {
                    id: String(d?.id || deptName),
                    departmentName: deptName,
                    headFullName: d?.headFullName
                      ? String(d.headFullName).trim()
                      : null,
                    memberUserIds: memberIds,
                    managedSubjects: Array.from(subjSet),
                    managedGrades: Array.from(gradeSet).sort((a, b) => a - b),
                  };
                })
                .filter(
                  (d: SchoolDepartmentSummary) =>
                    Boolean(d.departmentName) &&
                    !isAdminManagementDept(d.departmentName)
                )
            : [];

          setTeachers(parsedTeachers);
          setDepartments(parsedDepts);
        }

        if (!cancelled) {
          let serverWfs: ExamWorkflow[] = [];
          if (wfRes.ok) {
            const wfJson = await wfRes.json();
            if (Array.isArray(wfJson?.workflows)) {
              serverWfs = wfJson.workflows.filter(
                (w: ExamWorkflow) => !isSampleOrTestWorkflowDossier(w)
              );
            }
          }
          const localWfs = loadSavedWorkflows([], [], []);
          const merged = new Map<string, ExamWorkflow>();
          for (const w of [...serverWfs, ...localWfs]) {
            if (w?.workflowId && !isSampleOrTestWorkflowDossier(w)) {
              merged.set(w.workflowId, w);
            }
          }
          setOfficialWorkflows(Array.from(merged.values()));
        }
      } catch {
        if (!cancelled) {
          setOfficialWorkflows(loadSavedWorkflows([], [], []));
        }
      }
    }

    void loadOfficialSchoolContext();
    return () => {
      cancelled = true;
    };
  }, [effectiveSchoolId, actorUserId]);

  // Nếu là Tổ trưởng chuyên môn xem Báo cáo tổ: tự động giới hạn vào tổ đang quản lý
  const visibleDepartments = useMemo(() => {
    if (!isDeptScopedReport) return departments;
    const managed = departments.filter(
      (d) =>
        (actorFullName &&
          d.headFullName &&
          d.headFullName.toLowerCase() === actorFullName.trim().toLowerCase()) ||
        (actorDepartmentName &&
          areDeptNamesSame(d.departmentName, actorDepartmentName))
    );
    return managed.length > 0 ? managed : departments;
  }, [isDeptScopedReport, departments, actorFullName, actorDepartmentName]);

  const activeGrades = useMemo<GradeNumber[]>(() => {
    const normalizedAllowed = (schoolAllowedGrades || []).filter(
      (n): n is GradeNumber => n >= 1 && n <= 9
    );
    const base: GradeNumber[] =
      normalizedAllowed.length > 0
        ? normalizedAllowed
        : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return base.filter((g) => {
      if (levelFilter === EducationLevelId.PRIMARY) return g >= 1 && g <= 5;
      if (levelFilter === EducationLevelId.LOWER_SECONDARY) {
        return g >= 6 && g <= 9;
      }
      return true;
    });
  }, [schoolAllowedGrades, levelFilter]);

  const hasPrimaryGrades = useMemo(
    () =>
      !schoolAllowedGrades ||
      schoolAllowedGrades.length === 0 ||
      schoolAllowedGrades.some((g) => g >= 1 && g <= 5),
    [schoolAllowedGrades]
  );

  const hasSecondaryGrades = useMemo(
    () =>
      !schoolAllowedGrades ||
      schoolAllowedGrades.length === 0 ||
      schoolAllowedGrades.some((g) => g >= 6 && g <= 9),
    [schoolAllowedGrades]
  );

  const selectedDeptObj = useMemo(
    () => visibleDepartments.find((d) => d.id === selectedDepartmentId) || null,
    [visibleDepartments, selectedDepartmentId]
  );

  // Hàm kiểm tra một bản ghi chuyên môn thuộc Tổ chuyên môn nào (dựa trên tác giả hoặc tổ hợp Môn + Khối)
  const recordBelongsToDepartment = useMemo(() => {
    return (
      dept: SchoolDepartmentSummary,
      params: {
        authorName?: string;
        subject?: string;
        grade?: number;
      }
    ): boolean => {
      const deptTeachers = teachers.filter(
        (t) =>
          dept.memberUserIds.includes(t.id) ||
          areDeptNamesSame(t.departmentName, dept.departmentName)
      );
      const authorNorm = String(params.authorName || '').trim().toLowerCase();
      if (
        authorNorm &&
        deptTeachers.some((t) => t.fullName.toLowerCase() === authorNorm)
      ) {
        return true;
      }
      if (params.subject) {
        const subjMatch = dept.managedSubjects.some((s) =>
          areSubjectNamesEquivalent(s, params.subject || '')
        );
        const gradeMatch =
          !params.grade ||
          dept.managedGrades.length === 0 ||
          dept.managedGrades.includes(params.grade);
        if (subjMatch && gradeMatch) {
          return true;
        }
      }
      return false;
    };
  }, [teachers]);

  // Lọc 100% dữ liệu chính thức (loại bỏ triệt để dữ liệu mẫu / QA / seed)
  const officialQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (isSampleOrDemoQuestion(q)) return false;
      if (levelFilter !== 'ALL' && q.levelId !== levelFilter) return false;
      if (!activeGrades.includes(q.grade)) return false;
      if (
        selectedDeptObj &&
        !recordBelongsToDepartment(selectedDeptObj, {
          authorName: q.authorName,
          subject: q.subject,
          grade: q.grade,
        })
      ) {
        return false;
      }
      return true;
    });
  }, [
    questions,
    levelFilter,
    activeGrades,
    selectedDeptObj,
    recordBelongsToDepartment,
  ]);

  const officialMatrices = useMemo(() => {
    return matrices.filter((m) => {
      if (isSampleOrDemoMatrix(m)) return false;
      if (levelFilter !== 'ALL' && m.levelId !== levelFilter) return false;
      if (!activeGrades.includes(m.grade)) return false;
      if (!matchesExamPeriodFilter(m.examPeriod, m.title, periodFilter)) {
        return false;
      }
      if (
        selectedDeptObj &&
        !recordBelongsToDepartment(selectedDeptObj, {
          authorName: m.authorName,
          subject: m.subject,
          grade: m.grade,
        })
      ) {
        return false;
      }
      return true;
    });
  }, [
    matrices,
    levelFilter,
    activeGrades,
    periodFilter,
    selectedDeptObj,
    recordBelongsToDepartment,
  ]);

  const officialExams = useMemo(() => {
    return exams.filter((e) => {
      if (isSampleOrDemoExam(e)) return false;
      if (levelFilter !== 'ALL' && e.levelId !== levelFilter) return false;
      if (!activeGrades.includes(e.grade)) return false;
      if (!matchesExamPeriodFilter(e.examPeriod, e.title, periodFilter)) {
        return false;
      }
      if (
        selectedDeptObj &&
        !recordBelongsToDepartment(selectedDeptObj, {
          authorName: e.authorName,
          subject: e.subject,
          grade: e.grade,
        })
      ) {
        return false;
      }
      return true;
    });
  }, [
    exams,
    levelFilter,
    activeGrades,
    periodFilter,
    selectedDeptObj,
    recordBelongsToDepartment,
  ]);

  const filteredWorkflows = useMemo(() => {
    return officialWorkflows.filter((wf) => {
      if (isSampleOrTestWorkflowDossier(wf)) return false;
      const g = Number(wf.gradeId) as GradeNumber;
      const wfLevel =
        wf.step2MatrixAndSpec?.educationLevel ||
        (g <= 5 ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY);
      if (levelFilter !== 'ALL' && wfLevel !== levelFilter) return false;
      if (g >= 1 && g <= 9 && !activeGrades.includes(g)) return false;
      if (
        !matchesExamPeriodFilter(
          wf.examPeriod,
          `${wf.examPeriodLabel || ''} ${wf.title || ''}`,
          periodFilter
        )
      ) {
        return false;
      }
      if (
        selectedDeptObj &&
        !recordBelongsToDepartment(selectedDeptObj, {
          authorName: wf.creatorName,
          subject: wf.subjectId,
          grade: g,
        })
      ) {
        return false;
      }
      return true;
    });
  }, [
    officialWorkflows,
    levelFilter,
    activeGrades,
    periodFilter,
    selectedDeptObj,
    recordBelongsToDepartment,
  ]);

  // Tổng hợp các chỉ số KPI chính thức
  const summaryKpis = useMemo(() => {
    const approvedMatrices = officialMatrices.filter(
      (m) =>
        m.status === ApprovalStatus.APPROVED ||
        m.status === ApprovalStatus.PUBLISHED ||
        Boolean(m.isLocked)
    ).length;

    const approvedExams = officialExams.filter(
      (e) =>
        e.status === ApprovalStatus.APPROVED ||
        e.status === ApprovalStatus.PUBLISHED ||
        Boolean(e.isLocked)
    ).length;

    const pendingReviewCount =
      officialMatrices.filter(
        (m) =>
          m.status === ApprovalStatus.PENDING ||
          m.status === ApprovalStatus.IN_REVIEW ||
          m.status === ApprovalStatus.PENDING_APPROVAL ||
          m.status === ApprovalStatus.REVISED
      ).length +
      officialExams.filter(
        (e) =>
          e.status === ApprovalStatus.PENDING ||
          e.status === ApprovalStatus.IN_REVIEW ||
          e.status === ApprovalStatus.PENDING_APPROVAL ||
          e.status === ApprovalStatus.REVISED
      ).length;

    const revisionRequiredCount =
      officialMatrices.filter(
        (m) => m.status === ApprovalStatus.REVISION_REQUIRED
      ).length +
      officialExams.filter((e) => e.status === ApprovalStatus.REVISION_REQUIRED)
        .length;

    const completedWorkflows = filteredWorkflows.filter(
      (w) =>
        w.status === 'Approved' ||
        w.status === 'Released' ||
        w.status === 'ResultsAnalysis' ||
        w.status === 'Archived'
    ).length;

    const allSheets = [
      ...officialMatrices.flatMap((m) => m.appraisalSheets || []),
      ...officialExams.flatMap((e) => e.appraisalSheets || []),
    ];
    const passedSheets = allSheets.filter(
      (s) => s.overallConclusion === 'DAT'
    ).length;

    const allFeedbacks = [
      ...officialMatrices.flatMap((m) => m.itemFeedbacks || []),
      ...officialExams.flatMap((e) => e.itemFeedbacks || []),
    ];
    const resolvedFeedbacks = allFeedbacks.filter(
      (f) => f.resolutionStatus === 'RESOLVED'
    ).length;

    return {
      approvedMatrices,
      approvedExams,
      pendingReviewCount,
      revisionRequiredCount,
      completedWorkflows,
      totalSheets: allSheets.length,
      passedSheets,
      totalFeedbacks: allFeedbacks.length,
      resolvedFeedbacks,
    };
  }, [officialMatrices, officialExams, filteredWorkflows]);

  // Bảng thống kê theo từng Tổ chuyên môn thực tế
  const departmentReportRows = useMemo(() => {
    const targetDepts = selectedDeptObj
      ? [selectedDeptObj]
      : visibleDepartments;

    return targetDepts.map((dept) => {
      const deptTeachers = teachers.filter(
        (t) =>
          dept.memberUserIds.includes(t.id) ||
          areDeptNamesSame(t.departmentName, dept.departmentName)
      );
      const deptQ = officialQuestions.filter((q) =>
        recordBelongsToDepartment(dept, {
          authorName: q.authorName,
          subject: q.subject,
          grade: q.grade,
        })
      );
      const deptM = officialMatrices.filter((m) =>
        recordBelongsToDepartment(dept, {
          authorName: m.authorName,
          subject: m.subject,
          grade: m.grade,
        })
      );
      const deptE = officialExams.filter((e) =>
        recordBelongsToDepartment(dept, {
          authorName: e.authorName,
          subject: e.subject,
          grade: e.grade,
        })
      );
      const deptWf = filteredWorkflows.filter((w) =>
        recordBelongsToDepartment(dept, {
          authorName: w.creatorName,
          subject: w.subjectId,
          grade: Number(w.gradeId),
        })
      );
      const approvedCount =
        deptM.filter(
          (m) =>
            m.status === ApprovalStatus.APPROVED ||
            m.status === ApprovalStatus.PUBLISHED ||
            Boolean(m.isLocked)
        ).length +
        deptE.filter(
          (e) =>
            e.status === ApprovalStatus.APPROVED ||
            e.status === ApprovalStatus.PUBLISHED ||
            Boolean(e.isLocked)
        ).length;

      const inProgressCount =
        deptM.filter(
          (m) =>
            m.status !== ApprovalStatus.APPROVED &&
            m.status !== ApprovalStatus.PUBLISHED &&
            !m.isLocked
        ).length +
        deptE.filter(
          (e) =>
            e.status !== ApprovalStatus.APPROVED &&
            e.status !== ApprovalStatus.PUBLISHED &&
            !e.isLocked
        ).length;

      return {
        id: dept.id,
        departmentName: dept.departmentName,
        headFullName: dept.headFullName || 'Chưa bổ nhiệm',
        teacherCount: deptTeachers.length,
        subjectsText:
          dept.managedSubjects.length > 0
            ? dept.managedSubjects.slice(0, 5).join(', ') +
              (dept.managedSubjects.length > 5
                ? ` (+${dept.managedSubjects.length - 5})`
                : '')
            : 'Chưa phân công môn',
        gradesText:
          dept.managedGrades.length > 0
            ? `Khối ${dept.managedGrades.join(', ')}`
            : '—',
        questionsCount: deptQ.length,
        matricesCount: deptM.length,
        examsCount: deptE.length,
        workflowsCount: deptWf.length,
        approvedCount,
        inProgressCount,
      };
    });
  }, [
    selectedDeptObj,
    visibleDepartments,
    teachers,
    officialQuestions,
    officialMatrices,
    officialExams,
    filteredWorkflows,
    recordBelongsToDepartment,
  ]);

  // Bảng thống kê theo Khối lớp thực tế của nhà trường
  const gradeReportRows = useMemo(() => {
    return activeGrades.map((grade) => {
      const qList = officialQuestions.filter((q) => q.grade === grade);
      const mList = officialMatrices.filter((m) => m.grade === grade);
      const eList = officialExams.filter((e) => e.grade === grade);
      const wfList = filteredWorkflows.filter(
        (w) => Number(w.gradeId) === grade
      );
      const approvedExams = eList.filter(
        (e) =>
          e.status === ApprovalStatus.APPROVED ||
          e.status === ApprovalStatus.PUBLISHED ||
          Boolean(e.isLocked)
      ).length;
      const pendingExams = eList.filter(
        (e) =>
          e.status === ApprovalStatus.PENDING ||
          e.status === ApprovalStatus.IN_REVIEW ||
          e.status === ApprovalStatus.PENDING_APPROVAL ||
          e.status === ApprovalStatus.REVISED
      ).length;

      return {
        grade,
        levelLabel:
          grade <= 5
            ? 'Tiểu học (TT 27/2020)'
            : 'THCS (TT 22/2021 & CV 7991)',
        questionsCount: qList.length,
        matricesCount: mList.length,
        examsCount: eList.length,
        workflowsCount: wfList.length,
        pendingExams,
        approvedExams,
      };
    });
  }, [activeGrades, officialQuestions, officialMatrices, officialExams, filteredWorkflows]);

  // Thống kê theo Môn học phát sinh hồ sơ chính thức
  const subjectSummaryRows = useMemo(() => {
    const map = new Map<
      string,
      {
        subject: string;
        questionsCount: number;
        matricesCount: number;
        examsCount: number;
        approvedCount: number;
      }
    >();

    for (const q of officialQuestions) {
      const cur = map.get(q.subject) || {
        subject: q.subject,
        questionsCount: 0,
        matricesCount: 0,
        examsCount: 0,
        approvedCount: 0,
      };
      cur.questionsCount += 1;
      map.set(q.subject, cur);
    }
    for (const m of officialMatrices) {
      const cur = map.get(m.subject) || {
        subject: m.subject,
        questionsCount: 0,
        matricesCount: 0,
        examsCount: 0,
        approvedCount: 0,
      };
      cur.matricesCount += 1;
      if (
        m.status === ApprovalStatus.APPROVED ||
        m.status === ApprovalStatus.PUBLISHED ||
        m.isLocked
      ) {
        cur.approvedCount += 1;
      }
      map.set(m.subject, cur);
    }
    for (const e of officialExams) {
      const cur = map.get(e.subject) || {
        subject: e.subject,
        questionsCount: 0,
        matricesCount: 0,
        examsCount: 0,
        approvedCount: 0,
      };
      cur.examsCount += 1;
      if (
        e.status === ApprovalStatus.APPROVED ||
        e.status === ApprovalStatus.PUBLISHED ||
        e.isLocked
      ) {
        cur.approvedCount += 1;
      }
      map.set(e.subject, cur);
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        b.examsCount + b.matricesCount + b.questionsCount -
        (a.examsCount + a.matricesCount + a.questionsCount)
    );
  }, [officialQuestions, officialMatrices, officialExams]);

  // Làm sạch triệt để toàn bộ dữ liệu mẫu
  const handleConfirmCleanSampleData = async () => {
    setIsCleaning(true);
    try {
      const localRes = onCleanSampleReportData?.() || {
        removedQuestions: 0,
        removedMatrices: 0,
        removedExams: 0,
      };
      const localRemovedWf = purgeAllSampleWorkflowsFromLocal();

      let serverRemovedQ = 0;
      let serverRemovedM = 0;
      let serverRemovedE = 0;
      let serverRemovedWf = 0;

      try {
        const [appRes, wfRes] = await Promise.all([
          fetch('/api/appraisal/clean-sample-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schoolId: effectiveSchoolId,
              cleanSampleQuestions: true,
            }),
          }),
          fetch('/api/workflows/clean-sample-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: effectiveSchoolId }),
          }),
        ]);
        if (appRes.ok) {
          const j = await appRes.json();
          serverRemovedQ = Number(j?.removedQuestions || 0);
          serverRemovedM = Number(j?.removedMatrices || 0);
          serverRemovedE = Number(j?.removedExams || 0);
        }
        if (wfRes.ok) {
          const wj = await wfRes.json();
          serverRemovedWf = Number(
            wj?.removedWorkflowsCount ?? wj?.removedCount ?? 0
          );
        }
      } catch {
        // Đã làm sạch phía trình duyệt
      }

      const totalQ = Math.max(localRes.removedQuestions, serverRemovedQ);
      const totalM = Math.max(localRes.removedMatrices, serverRemovedM);
      const totalE = Math.max(localRes.removedExams, serverRemovedE);
      const totalWf = Math.max(localRemovedWf, serverRemovedWf);
      const sumRemoved = totalQ + totalM + totalE + totalWf;

      setOfficialWorkflows(loadSavedWorkflows([], [], []));
      setShowCleanModal(false);

      onNotify(
        'success',
        'Đã làm sạch dữ liệu Báo cáo chuyên môn để sử dụng chính thức',
        sumRemoved > 0
          ? `Đã loại bỏ ${totalQ} câu hỏi mẫu, ${totalM} ma trận mẫu, ${totalE} đề kiểm tra mẫu và ${totalWf} hồ sơ quy trình thử nghiệm. Báo cáo hiện chỉ tổng hợp dữ liệu chính thức của đơn vị.`
          : 'Không còn dữ liệu mẫu hay hồ sơ thử nghiệm tồn đọng. Báo cáo chuyên môn đang phản ánh 100% dữ liệu thực tế của nhà trường.'
      );
    } finally {
      setIsCleaning(false);
    }
  };

  // Xuất bảng số liệu ra Excel (.csv UTF-8 BOM)
  const handleExportCsvReport = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lines: string[] = [
      `"${effectiveGoverningBody}"`,
      `"${effectiveSchoolName.toUpperCase()}"`,
      `"BÁO CÁO TỔNG HỢP CÔNG TÁC CHUYÊN MÔN VÀ KHẢO THÍ - NĂM HỌC ${effectiveAcademicYear}"`,
      `"Người xuất báo cáo: ${resolvedActorName} (${resolvedRoleLabel}) - Ngày lập: ${todayStr}"`,
      '',
      '"I. THỐNG KÊ THEO TỔ CHUYÊN MÔN"',
      '"STT","Tổ chuyên môn","Tổ trưởng","Số giáo viên","Khối phụ trách","Câu hỏi chính thức","Ma trận chính thức","Đề kiểm tra chính thức","Hồ sơ quy trình","Đã phê duyệt"',
    ];

    departmentReportRows.forEach((r, idx) => {
      lines.push(
        [
          idx + 1,
          `"${r.departmentName.replace(/"/g, '""')}"`,
          `"${r.headFullName.replace(/"/g, '""')}"`,
          r.teacherCount,
          `"${r.gradesText}"`,
          r.questionsCount,
          r.matricesCount,
          r.examsCount,
          r.workflowsCount,
          r.approvedCount,
        ].join(',')
      );
    });

    lines.push('');
    lines.push('"II. THỐNG KÊ THEO KHỐI LỚP"');
    lines.push(
      '"Khối lớp","Cấp học","Câu hỏi chính thức","Ma trận & Đặc tả","Đề kiểm tra","Hồ sơ quy trình","Đề chờ duyệt","Đề đã phê duyệt"'
    );
    gradeReportRows.forEach((g) => {
      lines.push(
        [
          `"Khối ${g.grade}"`,
          `"${g.levelLabel}"`,
          g.questionsCount,
          g.matricesCount,
          g.examsCount,
          g.workflowsCount,
          g.pendingExams,
          g.approvedExams,
        ].join(',')
      );
    });

    const blob = new Blob(['\ufeff' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao-cao-chuyen-mon-${effectiveSchoolId}-${todayStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      'Đã xuất bảng số liệu Báo cáo chuyên môn (.csv)',
      'Tệp bảng tính mã hóa chuẩn UTF-8 tiếng Việt đã được tải về máy.'
    );
  };

  // Xuất Văn bản Báo cáo Chuyên môn chuẩn A4 ra Word (.doc)
  const handleExportWordReport = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const deptRowsHtml =
      departmentReportRows.length === 0
        ? `<tr><td colspan="8" style="text-align:center; padding:8px;">Chưa có dữ liệu tổ chuyên môn</td></tr>`
        : departmentReportRows
            .map(
              (r, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>${r.departmentName}</td>
            <td>${r.headFullName}</td>
            <td style="text-align:center;">${r.teacherCount}</td>
            <td style="text-align:center;">${r.questionsCount}</td>
            <td style="text-align:center;">${r.matricesCount}</td>
            <td style="text-align:center;">${r.examsCount}</td>
            <td style="text-align:center;">${r.approvedCount}</td>
          </tr>`
            )
            .join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Báo cáo chuyên môn - ${effectiveSchoolName}</title></head>
      <body style="font-family:'Times New Roman',serif; font-size:13pt; line-height:1.45;">
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
          <tr>
            <td style="width:45%; text-align:center; vertical-align:top;">
              <p style="margin:0; text-transform:uppercase;">${effectiveGoverningBody}</p>
              <p style="margin:2px 0; font-weight:bold; text-transform:uppercase;">${effectiveSchoolName}</p>
              <p style="margin:4px 0 0 0;">Số: ....../BC-CM</p>
            </td>
            <td style="width:55%; text-align:center; vertical-align:top;">
              <p style="margin:0; font-weight:bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p style="margin:2px 0; font-weight:bold; text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</p>
              <p style="margin:6px 0 0 0; font-style:italic;">Ngày ${day} tháng ${month} năm ${year}</p>
            </td>
          </tr>
        </table>

        <h2 style="text-align:center; text-transform:uppercase; margin:18px 0 4px 0; font-size:14pt;">
          BÁO CÁO TỔNG HỢP CÔNG TÁC CHUYÊN MÔN VÀ KHẢO THÍ
        </h2>
        <p style="text-align:center; margin:0 0 16px 0; font-weight:bold;">
          Năm học: ${effectiveAcademicYear} · Phạm vi: ${PERIOD_FILTER_LABELS[periodFilter]}
        </p>

        <p><strong>I. SỐ LIỆU TỔNG HỢP TOÀN ĐƠN VỊ</strong></p>
        <ul>
          <li>Số tổ chuyên môn đang hoạt động: <strong>${departmentReportRows.length}</strong> tổ (${teachers.length} giáo viên giảng dạy).</li>
          <li>Ngân hàng câu hỏi chính thức của trường: <strong>${officialQuestions.length}</strong> câu hỏi.</li>
          <li>Hồ sơ Ma trận &amp; Bản đặc tả chính thức: <strong>${officialMatrices.length}</strong> hồ sơ (Đã phê duyệt: <strong>${summaryKpis.approvedMatrices}</strong>).</li>
          <li>Hồ sơ Đề kiểm tra chính thức: <strong>${officialExams.length}</strong> đề (Đã phê duyệt &amp; khóa: <strong>${summaryKpis.approvedExams}</strong>).</li>
          <li>Hồ sơ quy trình khảo thí đã lập: <strong>${filteredWorkflows.length}</strong> hồ sơ (Hoàn thành phê duyệt: <strong>${summaryKpis.completedWorkflows}</strong>).</li>
          <li>Số phiếu thẩm định 12 tiêu chí đã lập: <strong>${summaryKpis.totalSheets}</strong> phiếu (Kết luận Đạt: <strong>${summaryKpis.passedSheets}</strong>).</li>
        </ul>

        <p><strong>II. THỐNG KÊ KẾT QUẢ THỰC HIỆN THEO TỔ CHUYÊN MÔN</strong></p>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px;" border="1" cellpadding="6">
          <thead>
            <tr style="font-weight:bold; text-align:center;">
              <th>TT</th>
              <th>Tổ chuyên môn</th>
              <th>Tổ trưởng</th>
              <th>Số GV</th>
              <th>Câu hỏi</th>
              <th>Ma trận</th>
              <th>Đề KT</th>
              <th>Đã duyệt</th>
            </tr>
          </thead>
          <tbody>
            ${deptRowsHtml}
          </tbody>
        </table>

        <p><strong>III. ĐÁNH GIÁ CHUNG VÀ PHƯƠNG HƯỚNG CHỈ ĐẠO CHUYÊN MÔN</strong></p>
        <p>
          ${
            officialMatrices.length + officialExams.length + filteredWorkflows.length === 0
              ? 'Hệ thống dữ liệu khảo thí của đơn vị đã được làm sạch, chuẩn hóa tổ chuyên môn và phân công giảng dạy cho năm học mới. Đề nghị các Tổ trưởng chuyên môn đôn đốc giáo viên xây dựng ngân hàng câu hỏi, ma trận, bản đặc tả và đề kiểm tra đúng tiến độ kế hoạch nhà trường.'
              : `Các tổ chuyên môn đã triển khai biên soạn ${officialMatrices.length} ma trận và ${officialExams.length} đề kiểm tra chính thức; trong đó ${summaryKpis.pendingReviewCount} hồ sơ đang trong quá trình thẩm định/chờ duyệt và ${summaryKpis.revisionRequiredCount} hồ sơ đang chỉnh sửa hoàn thiện theo góp ý phản biện.`
          }
        </p>

        <table style="width:100%; border-collapse:collapse; margin-top:24px;">
          <tr>
            <td style="width:50%; vertical-align:top; font-size:11pt;">
              <p style="margin:0; font-weight:bold; font-style:italic;">Nơi nhận:</p>
              <p style="margin:2px 0;">- Hiệu trưởng (để b/c);</p>
              <p style="margin:2px 0;">- Các Tổ chuyên môn (để t/h);</p>
              <p style="margin:2px 0;">- Lưu: VT, Hồ sơ CM.</p>
            </td>
            <td style="width:50%; text-align:center; vertical-align:top;">
              <p style="margin:0; font-weight:bold; text-transform:uppercase;">${resolvedRoleLabel.toUpperCase()}</p>
              <p style="margin:4px 0 48px 0; font-style:italic; font-size:11pt;">(Ký và ghi rõ họ tên)</p>
              <p style="margin:0; font-weight:bold;">${resolvedActorName}</p>
            </td>
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
    a.download = `Bao-cao-chuyen-mon-${effectiveSchoolId}-${year}-${month}-${day}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      'Đã xuất Báo cáo chuyên môn ra Word (.doc)',
      'Văn bản báo cáo chuẩn hành chính A4 đã được tải xuống.'
    );
  };

  const headerBadgeText = useMemo(() => {
    if (actorRole === 'PRINCIPAL') {
      return 'HIỆU TRƯỞNG · MỤC 5. BÁO CÁO CHẤT LƯỢNG KHẢO THÍ CHÍNH THỨC';
    }
    if (isDeptScopedReport) {
      return 'TỔ TRƯỞNG CHUYÊN MÔN · MỤC 8. BÁO CÁO CHUYÊN MÔN CẤP TỔ';
    }
    return 'PHÓ HIỆU TRƯỞNG · MỤC 7. BÁO CÁO CHUYÊN MÔN CHÍNH THỨC';
  }, [actorRole, isDeptScopedReport]);

  const nowDateFormatted = useMemo(() => {
    const d = new Date();
    return `ngày ${String(d.getDate()).padStart(2, '0')} tháng ${String(
      d.getMonth() + 1
    ).padStart(2, '0')} năm ${d.getFullYear()}`;
  }, []);

  const hasAnyOfficialAssessmentData =
    officialQuestions.length > 0 ||
    officialMatrices.length > 0 ||
    officialExams.length > 0 ||
    filteredWorkflows.length > 0;

  return (
    <div className="space-y-6">
      {/* KHỐI 1: HEADER CHÍNH THỨC */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{headerBadgeText}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isDeptScopedReport
                ? 'Báo Cáo Công Tác Chuyên Môn & Hồ Sơ Khảo Thí Tổ Chuyên Môn'
                : 'Báo Cáo Tổng Hợp Công Tác Chuyên Môn & Khảo Thí Nhà Trường'}
            </h1>
            <p className="text-xs text-slate-600">
              Đơn vị: <strong className="text-slate-900">{effectiveSchoolName}</strong> · Năm học:{' '}
              <strong className="text-slate-900">{effectiveAcademicYear}</strong> · Tổng hợp 100% từ dữ liệu thực tế của các Tổ chuyên môn, không sử dụng số liệu mẫu hay hồ sơ thử nghiệm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!isDeptScopedReport && (
              <button
                type="button"
                onClick={() => setShowCleanModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Làm sạch dữ liệu mẫu
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCsvReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Xuất bảng số liệu (.csv)
            </button>
            <button
              type="button"
              onClick={handleExportWordReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất Báo cáo Word (.doc)
            </button>
          </div>
        </div>

        {/* Thanh cán bộ lập báo cáo & Bộ lọc chuyên môn */}
        <div className="pt-3 border-t border-slate-200 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              Người lập báo cáo: {resolvedActorName} ({resolvedRoleLabel})
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Dữ liệu chính thức sạch (0 hồ sơ mẫu)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Bộ lọc:
            </span>

            {hasPrimaryGrades && hasSecondaryGrades && (
              <select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(e.target.value as EducationLevelId | 'ALL')
                }
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="ALL">Tất cả cấp học (TH &amp; THCS)</option>
                <option value={EducationLevelId.PRIMARY}>
                  Cấp Tiểu học (Khối 1 – 5)
                </option>
                <option value={EducationLevelId.LOWER_SECONDARY}>
                  Cấp THCS (Khối 6 – 9)
                </option>
              </select>
            )}

            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="ALL">
                {isDeptScopedReport
                  ? 'Tổ chuyên môn phụ trách'
                  : `Tất cả Tổ chuyên môn (${visibleDepartments.length} tổ)`}
              </option>
              {visibleDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>

            <select
              value={periodFilter}
              onChange={(e) =>
                setPeriodFilter(e.target.value as PeriodFilterCode)
              }
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              {(Object.keys(PERIOD_FILTER_LABELS) as PeriodFilterCode[]).map(
                (code) => (
                  <option key={code} value={code}>
                    {PERIOD_FILTER_LABELS[code]}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* KHỐI 2: 6 CHỈ SỐ KPI CHUYÊN MÔN CHÍNH THỨC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Tổ CM &amp; Giáo viên</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {departmentReportRows.length} tổ
          </div>
          <div className="text-[11px] text-slate-600">
            {teachers.length} giáo viên thực tế của trường
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Kế hoạch &amp; Quy trình</span>
            <FolderKanban className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {filteredWorkflows.length}
          </div>
          <div className="text-[11px] text-slate-600">
            Đã hoàn thành duyệt: {summaryKpis.completedWorkflows} hồ sơ
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Ma trận &amp; Đặc tả</span>
            <FileSpreadsheet className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {officialMatrices.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Đã phê duyệt khóa: {summaryKpis.approvedMatrices}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Đề kiểm tra chính thức</span>
            <FileText className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {officialExams.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Đã phê duyệt &amp; khóa: {summaryKpis.approvedExams}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Phiếu thẩm định 12 TC</span>
            <ClipboardCheck className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {summaryKpis.totalSheets > 0
              ? `${summaryKpis.passedSheets}/${summaryKpis.totalSheets}`
              : '0'}
          </div>
          <div className="text-[11px] text-slate-600">
            {summaryKpis.totalSheets > 0
              ? `Đạt chuẩn chuyên môn (${Math.round(
                  (summaryKpis.passedSheets / summaryKpis.totalSheets) * 100
                )}%)`
              : 'Chưa phát sinh phiếu thẩm định'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Ngân hàng câu hỏi</span>
            <Database className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {officialQuestions.length}
          </div>
          <div className="text-[11px] text-slate-600">
            Câu hỏi chính thức của GV trường
          </div>
        </div>
      </div>

      {/* KHỐI 3: THANH CHUYỂN TAB BÁO CÁO CHUYÊN MÔN */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 pt-4 border-b border-slate-200 flex flex-wrap items-center gap-2 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab('BY_DEPARTMENT')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BY_DEPARTMENT'
                ? 'bg-white text-blue-800 border-blue-700'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            1. Tổng hợp theo Tổ chuyên môn ({departmentReportRows.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BY_GRADE_AND_SUBJECT')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BY_GRADE_AND_SUBJECT'
                ? 'bg-white text-blue-800 border-blue-700'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Thống kê theo Khối lớp &amp; Môn học ({gradeReportRows.length} khối)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPRAISAL_QUALITY')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'APPRAISAL_QUALITY'
                ? 'bg-white text-blue-800 border-blue-700'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            3. Chất lượng Thẩm định &amp; Hồ sơ chính thức
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('OFFICIAL_DOCUMENT_A4')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'OFFICIAL_DOCUMENT_A4'
                ? 'bg-white text-blue-800 border-blue-700'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            4. Văn bản Báo cáo Hành chính (A4)
          </button>
        </div>

        {/* NỘI DUNG TAB 1: TỔNG HỢP THEO TỔ CHUYÊN MÔN */}
        {activeTab === 'BY_DEPARTMENT' && (
          <div className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Bảng Tổng Hợp Tiến Độ &amp; Sản Phẩm Khảo Thí Theo Tổ Chuyên Môn
                </h2>
                <p className="text-xs text-slate-500">
                  Dữ liệu liên thông trực tiếp từ cơ cấu Tổ chuyên môn thực tế của {effectiveSchoolName}.
                </p>
              </div>
            </div>

            {departmentReportRows.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                Chưa có danh sách Tổ chuyên môn được cấu hình cho đơn vị này.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                      <th className="py-3 px-3 font-bold w-12 text-center">
                        TT
                      </th>
                      <th className="py-3 px-3 font-bold">Tổ chuyên môn</th>
                      <th className="py-3 px-3 font-bold">Tổ trưởng CM</th>
                      <th className="py-3 px-3 font-bold text-center">
                        Số GV
                      </th>
                      <th className="py-3 px-3 font-bold">
                        Phạm vi Khối &amp; Môn
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        Câu hỏi
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        Ma trận
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        Đề KT
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        Hồ sơ QT
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        Đã duyệt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {departmentReportRows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {row.departmentName}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {row.headFullName}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-blue-800">
                          {row.teacherCount}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div className="font-semibold text-slate-800">
                            {row.gradesText}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {row.subjectsText}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900">
                          {row.questionsCount}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900">
                          {row.matricesCount}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900">
                          {row.examsCount}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-indigo-800">
                          {row.workflowsCount}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {row.approvedCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!hasAnyOfficialAssessmentData && onNavigate && !isDeptScopedReport && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Hệ thống Báo cáo chuyên môn đã sẵn sàng cho năm học {effectiveAcademicYear}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Toàn bộ dữ liệu mẫu đã được dọn sạch. Khi Phó Hiệu trưởng giao kế hoạch ra đề và giáo viên các Tổ chuyên môn nộp Ma trận, Đề kiểm tra chính thức, số liệu báo cáo sẽ tự động cập nhật theo thời gian thực.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('progress-management')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-blue-700" />
                    Mở Kế hoạch kiểm tra
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('bgh-assign-exam')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Mở Phân công ra đề
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 2: THỐNG KÊ THEO KHỐI LỚP & MÔN HỌC */}
        {activeTab === 'BY_GRADE_AND_SUBJECT' && (
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900">
                1. Thống Kê Hồ Sơ Khảo Thí Chính Thức Theo Khối Lớp
              </h2>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                      <th className="py-2.5 px-3 font-bold">Khối lớp</th>
                      <th className="py-2.5 px-3 font-bold">
                        Cấp học &amp; Quy chuẩn đánh giá
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center">
                        Câu hỏi chính thức
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center">
                        Ma trận &amp; Đặc tả
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center">
                        Đề kiểm tra
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center">
                        Hồ sơ quy trình
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center">
                        Đề chờ duyệt
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center">
                        Đề đã duyệt &amp; Khóa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {gradeReportRows.map((g) => (
                      <tr key={g.grade} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          Khối {g.grade}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {g.levelLabel}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">
                          {g.questionsCount}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">
                          {g.matricesCount}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">
                          {g.examsCount}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-indigo-800">
                          {g.workflowsCount}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-amber-800 font-semibold">
                          {g.pendingExams}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-emerald-800 font-bold">
                          {g.approvedExams}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900">
                2. Phân Bố Hồ Sơ Chính Thức Theo Môn Học
              </h2>
              {subjectSummaryRows.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                  Chưa phát sinh câu hỏi, ma trận hoặc đề kiểm tra chính thức ở bộ lọc hiện tại (0 dữ liệu mẫu).
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectSummaryRows.map((s) => (
                    <div
                      key={s.subject}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-900 text-sm">
                        Môn {s.subject}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div>
                          Câu hỏi:{' '}
                          <strong className="font-mono text-slate-900">
                            {s.questionsCount}
                          </strong>
                        </div>
                        <div>
                          Ma trận:{' '}
                          <strong className="font-mono text-slate-900">
                            {s.matricesCount}
                          </strong>
                        </div>
                        <div>
                          Đề kiểm tra:{' '}
                          <strong className="font-mono text-slate-900">
                            {s.examsCount}
                          </strong>
                        </div>
                        <div>
                          Đã phê duyệt:{' '}
                          <strong className="font-mono text-emerald-700">
                            {s.approvedCount}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NỘI DUNG TAB 3: CHẤT LƯỢNG THẨM ĐỊNH & HỒ SƠ CHÍNH THỨC */}
        {activeTab === 'APPRAISAL_QUALITY' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-slate-500 font-semibold">
                  Hồ sơ đang thẩm định / chờ duyệt
                </div>
                <div className="text-xl font-bold font-mono text-amber-800">
                  {summaryKpis.pendingReviewCount}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-slate-500 font-semibold">
                  Hồ sơ yêu cầu chỉnh sửa
                </div>
                <div className="text-xl font-bold font-mono text-rose-700">
                  {summaryKpis.revisionRequiredCount}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-slate-500 font-semibold">
                  Phiếu thẩm định 12 tiêu chí Đạt
                </div>
                <div className="text-xl font-bold font-mono text-emerald-800">
                  {summaryKpis.passedSheets}/{summaryKpis.totalSheets}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-slate-500 font-semibold">
                  Góp ý phản biện đã tiếp thu
                </div>
                <div className="text-xl font-bold font-mono text-blue-800">
                  {summaryKpis.resolvedFeedbacks}/{summaryKpis.totalFeedbacks}
                </div>
              </div>
            </div>

            {officialMatrices.length === 0 &&
            officialExams.length === 0 &&
            filteredWorkflows.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 max-w-lg mx-auto">
                  <h3 className="text-sm font-bold text-slate-900">
                    Chưa phát sinh hồ sơ thẩm định &amp; phê duyệt chính thức
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mọi kịch bản kiểm thử lỗi mẫu và đề mẫu đã được gỡ bỏ hoàn toàn. Danh sách kết quả thẩm định chuyên môn và biên bản phê duyệt chính thức sẽ hiển thị tại đây ngay khi giáo viên nộp hồ sơ.
                  </p>
                </div>
                {onNavigate && !isDeptScopedReport && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('approval')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-blue-700" />
                      Mở Mục 5. Thẩm định
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('bgh-approval')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Mở Mục 6. Phê duyệt theo phân quyền
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('bgh-progress-tracking')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                      Mở Tiến độ hồ sơ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-700">
                  Danh mục Hồ sơ Ma trận, Đề kiểm tra &amp; Quy trình chính thức
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                        <th className="py-2.5 px-3 font-bold">Loại hồ sơ</th>
                        <th className="py-2.5 px-3 font-bold">Mã số</th>
                        <th className="py-2.5 px-3 font-bold">Tên hồ sơ</th>
                        <th className="py-2.5 px-3 font-bold">Khối · Môn</th>
                        <th className="py-2.5 px-3 font-bold">Giáo viên lập</th>
                        <th className="py-2.5 px-3 font-bold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {officialMatrices.map((m) => {
                        const st = getApprovalStatusInfo(m.status);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-teal-800">
                              Ma trận &amp; Đặc tả
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                              {m.code}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {m.title}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              Khối {m.grade} · {m.subject}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {m.authorName}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded border text-[11px] font-bold ${st.colorClass}`}
                              >
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {officialExams.map((e) => {
                        const st = getApprovalStatusInfo(e.status);
                        return (
                          <tr key={e.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-blue-800">
                              Đề kiểm tra
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                              {e.code}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {e.title}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              Khối {e.grade} · {e.subject}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {e.authorName}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded border text-[11px] font-bold ${st.colorClass}`}
                              >
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredWorkflows.map((w) => {
                        const stInfo = WORKFLOW_STATE_LABELS[w.status];
                        return (
                          <tr key={w.workflowId} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-indigo-800">
                              Hồ sơ quy trình
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                              {w.workflowId}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {w.title}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              Khối {w.gradeId} · {w.subjectId}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {w.creatorName}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded border border-slate-300 bg-white text-[11px] font-bold text-slate-800">
                                {stInfo?.label || w.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 4: VĂN BẢN BÁO CÁO HÀNH CHÍNH A4 */}
        {activeTab === 'OFFICIAL_DOCUMENT_A4' && (
          <div className="p-6 bg-slate-100/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 max-w-4xl mx-auto">
              <span>
                Bản xem trước văn bản chuẩn thể thức hành chính (Tự động kết nối số liệu thực tế của {effectiveSchoolName}).
              </span>
              <button
                type="button"
                onClick={handleExportWordReport}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file Word (.doc)
              </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-xl p-8 sm:p-10 shadow-xs space-y-6 text-xs leading-relaxed text-slate-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                <div className="space-y-0.5">
                  <div className="uppercase text-slate-700">
                    {effectiveGoverningBody}
                  </div>
                  <div className="font-bold uppercase text-slate-950">
                    {effectiveSchoolName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Số: ....../BC-CM
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold uppercase">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold underline underline-offset-4">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="italic text-[11px] text-slate-600 pt-1">
                    {nowDateFormatted}
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-base font-bold uppercase text-slate-950">
                  BÁO CÁO TỔNG HỢP CÔNG TÁC CHUYÊN MÔN VÀ KHẢO THÍ
                </h2>
                <div className="font-semibold text-slate-700">
                  Năm học: {effectiveAcademicYear} · Phạm vi:{' '}
                  {PERIOD_FILTER_LABELS[periodFilter]}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold uppercase text-slate-900">
                  I. Số liệu tổng hợp thực tế tại đơn vị
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-800">
                  <li>
                    Tổng số Tổ chuyên môn: <strong>{departmentReportRows.length}</strong> tổ (
                    <strong>{teachers.length}</strong> giáo viên được phân công giảng dạy).
                  </li>
                  <li>
                    Ngân hàng câu hỏi chính thức: <strong>{officialQuestions.length}</strong> câu hỏi.
                  </li>
                  <li>
                    Hồ sơ Ma trận &amp; Bản đặc tả chính thức:{' '}
                    <strong>{officialMatrices.length}</strong> hồ sơ (Đã phê duyệt khóa phiên bản:{' '}
                    <strong>{summaryKpis.approvedMatrices}</strong>).
                  </li>
                  <li>
                    Hồ sơ Đề kiểm tra chính thức: <strong>{officialExams.length}</strong> đề (Đã phê duyệt &amp; khóa:{' '}
                    <strong>{summaryKpis.approvedExams}</strong>).
                  </li>
                  <li>
                    Hồ sơ quy trình khảo thí liên thông:{' '}
                    <strong>{filteredWorkflows.length}</strong> hồ sơ (Đã phê duyệt hoàn tất:{' '}
                    <strong>{summaryKpis.completedWorkflows}</strong>).
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-bold uppercase text-slate-900">
                  II. Kết quả thực hiện theo Tổ chuyên môn
                </div>
                <div className="overflow-x-auto border border-slate-300">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-center font-bold">
                        <th className="p-2 border-r border-slate-300 w-10">
                          TT
                        </th>
                        <th className="p-2 border-r border-slate-300 text-left">
                          Tổ chuyên môn
                        </th>
                        <th className="p-2 border-r border-slate-300 text-left">
                          Tổ trưởng
                        </th>
                        <th className="p-2 border-r border-slate-300">Số GV</th>
                        <th className="p-2 border-r border-slate-300">
                          Câu hỏi
                        </th>
                        <th className="p-2 border-r border-slate-300">
                          Ma trận
                        </th>
                        <th className="p-2 border-r border-slate-300">Đề KT</th>
                        <th className="p-2">Đã duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {departmentReportRows.map((r, idx) => (
                        <tr key={r.id}>
                          <td className="p-2 border-r border-slate-300 text-center">
                            {idx + 1}
                          </td>
                          <td className="p-2 border-r border-slate-300 font-semibold">
                            {r.departmentName}
                          </td>
                          <td className="p-2 border-r border-slate-300">
                            {r.headFullName}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center">
                            {r.teacherCount}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center">
                            {r.questionsCount}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center">
                            {r.matricesCount}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center">
                            {r.examsCount}
                          </td>
                          <td className="p-2 text-center font-bold">
                            {r.approvedCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold uppercase text-slate-900">
                  III. Nhận xét chuyên môn &amp; Kiến nghị
                </div>
                <p className="text-slate-800">
                  {!hasAnyOfficialAssessmentData
                    ? `Hệ thống quản lý khảo thí của ${effectiveSchoolName} đã hoàn tất làm sạch dữ liệu thử nghiệm và đồng bộ danh sách ${departmentReportRows.length} tổ chuyên môn cùng ${teachers.length} giáo viên giảng dạy năm học ${effectiveAcademicYear}. Các tổ chuyên môn căn cứ kế hoạch kiểm tra định kỳ để triển khai biên soạn ngân hàng câu hỏi, ma trận, bản đặc tả và đề kiểm tra đúng quy định chuyên môn.`
                    : `Công tác xây dựng hồ sơ đề kiểm tra tại ${effectiveSchoolName} ghi nhận ${officialMatrices.length} ma trận và ${officialExams.length} đề kiểm tra chính thức, trong đó ${summaryKpis.approvedMatrices + summaryKpis.approvedExams} hồ sơ đã được phê duyệt khóa phiên bản và ${summaryKpis.pendingReviewCount} hồ sơ đang thực hiện thẩm định theo quy trình.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div className="font-bold italic text-slate-800">
                    Nơi nhận:
                  </div>
                  <div>- Hiệu trưởng (để báo cáo);</div>
                  <div>- Các Tổ trưởng chuyên môn (để thực hiện);</div>
                  <div>- Lưu: VT, Hồ sơ Chuyên môn.</div>
                </div>
                <div className="text-center space-y-10">
                  <div>
                    <div className="font-bold uppercase text-slate-950">
                      {resolvedRoleLabel}
                    </div>
                    <div className="text-[11px] italic text-slate-500">
                      (Ký và ghi rõ họ tên)
                    </div>
                  </div>
                  <div className="font-bold text-slate-950">
                    {resolvedActorName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN LÀM SẠCH DỮ LIỆU MẪU */}
      {showCleanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Làm sạch dữ liệu mẫu mục Báo cáo chuyên môn
              </h3>
              <button
                type="button"
                onClick={() => setShowCleanModal(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Thao tác này sẽ xóa toàn bộ Câu hỏi mẫu ban đầu, Ma trận mẫu, Đề kiểm tra thử nghiệm và Hồ sơ quy trình giả lập còn tồn đọng trong bộ nhớ hoặc máy chủ, chỉ giữ lại 100% dữ liệu chính thức do giáo viên của{' '}
              <strong className="text-slate-900">{effectiveSchoolName}</strong>{' '}
              tạo lập.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanModal(false)}
                disabled={isCleaning}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCleanSampleData()}
                disabled={isCleaning}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                {isCleaning ? 'Đang làm sạch...' : 'Xác nhận làm sạch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
