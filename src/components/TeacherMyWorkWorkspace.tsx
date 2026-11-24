import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Database,
  ExternalLink,
  FileText,
  Filter,
  FolderKanban,
  Grid,
  Layers,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Table,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  ApprovalStatus,
  AuthenticatedUserSession,
  CurriculumLessonItem,
  CurriculumTopic,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  GradeNumber,
  MenuSectionId,
  MyAssignedTaskItem,
  QuestionItem,
  SchoolBrandingConfig,
  StorageConfig,
  TeacherPermissionProfileSummary,
  ToastNotification,
} from '../types/domain';
import { getRuleSetForLevel } from '../services/business/assessmentRules';
import { extractIntegrationTags } from '../data/grade4CurriculumPlan2026';
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
import {
  isSampleOrDemoAssignedTask,
  loadNotificationsAndTasks,
  purgeSampleNotificationsAndTasksFromLocal,
} from '../services/workflow/workflowNotificationCenterService';

type MyWorkTabId =
  | 'ASSIGNED_WORK_QUEUE'
  | 'TEACHING_ALLOCATIONS'
  | 'ASSIGNED_CURRICULUM';

type WorkStatusFilter =
  | 'ALL'
  | 'NEEDS_ACTION'
  | 'REVISION_REQUIRED'
  | 'IN_REVIEW'
  | 'COMPLETED';

interface AssignedSubjectGradeAllocation {
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  departmentName: string;
}

interface UnifiedTeacherWorkItem {
  id: string;
  code: string;
  title: string;
  roleType: 'EXAM_CREATOR' | 'EXAM_REVIEWER' | 'MATRIX_AUTHOR' | 'WORKFLOW_TASK';
  roleLabel: string;
  subject: string;
  grade: GradeNumber;
  examPeriodLabel: string;
  dueDateLabel: string;
  assignedByLabel: string;
  statusBucket: Exclude<WorkStatusFilter, 'ALL'>;
  statusLabel: string;
  targetMenu: MenuSectionId;
  workflowId?: string;
  actionLabel: string;
  updatedAt: string;
}

function normalizeText(val?: string | null): string {
  return String(val || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function areSubjectsSame(a?: string | null, b?: string | null): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const aliasGroups: string[][] = [
    ['lịch sử và địa lí', 'lịch sử & địa lí', 'lịch sử - địa lí', 'ls&đl'],
    ['giáo dục công dân', 'gdcd'],
    ['giáo dục thể chất', 'gdtc', 'thể dục'],
    ['hoạt động trải nghiệm, hướng nghiệp', 'hoạt động trải nghiệm', 'hđtn', 'hđtn, hn'],
    ['khoa học tự nhiên', 'khtn'],
    ['tin học và công nghệ', 'tin học & công nghệ'],
    ['nội dung giáo dục của địa phương', 'giáo dục địa phương', 'gdđp'],
  ];
  return aliasGroups.some((grp) => grp.includes(na) && grp.includes(nb));
}

function formatExamPeriod(rawPeriod?: string, fallbackTitle?: string): string {
  const p = String(rawPeriod || '').toUpperCase();
  if (p === 'MID_SEM_1' || p === 'GIUA_KY_1') return 'Giữa học kỳ I';
  if (p === 'END_SEM_1' || p === 'CUOI_KY_1') return 'Cuối học kỳ I';
  if (p === 'MID_SEM_2' || p === 'GIUA_KY_2') return 'Giữa học kỳ II';
  if (p === 'END_YEAR' || p === 'CUOI_KY_2') return 'Cuối học kỳ II';
  if (p === 'REGULAR' || p === 'THUONG_XUYEN') return 'Thường xuyên';
  const t = normalizeText(fallbackTitle);
  if (t.includes('giữa học kỳ i') || t.includes('giữa kỳ i')) return 'Giữa học kỳ I';
  if (t.includes('cuối học kỳ i') || t.includes('cuối kỳ i')) return 'Cuối học kỳ I';
  if (t.includes('giữa học kỳ ii') || t.includes('giữa kỳ ii')) return 'Giữa học kỳ II';
  if (t.includes('cuối học kỳ ii') || t.includes('cuối kỳ ii') || t.includes('cuối năm')) {
    return 'Cuối học kỳ II';
  }
  return rawPeriod || 'Theo kế hoạch năm học';
}

const PERMISSION_DISPLAY_LABELS: Record<string, string> = {
  VIEW_ASSIGNED_CURRICULUM: 'Xem chương trình được phân công',
  VIEW_QUESTION_BANK: 'Tra cứu ngân hàng câu hỏi',
  CREATE_OWN_QUESTION: 'Biên soạn câu hỏi mới',
  USE_AI_QUESTION_GENERATOR: 'Sử dụng AI tạo câu hỏi',
  AI_GENERATE_QUESTION: 'Sử dụng AI tạo câu hỏi',
  CREATE_EXAM_MATRIX: 'Xây dựng ma trận & bản đặc tả',
  CREATE_EXAM_PAPER: 'Tạo đề kiểm tra chính thức',
  USE_AI_QUALITY_REVIEW: 'Chạy AI kiểm tra chất lượng đề',
  AI_REVIEW_EXAM: 'Chạy AI kiểm tra chất lượng đề',
  REVIEW_DEPT_EXAM: 'Phản biện / Thẩm định đề cấp tổ',
  SUBMIT_FOR_REVIEW: 'Gửi hồ sơ thẩm định chuyên môn',
};

export interface TeacherMyWorkWorkspaceProps {
  topics: CurriculumTopic[];
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  config: StorageConfig;
  authSession?: AuthenticatedUserSession | null;
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  schoolBranding?: SchoolBrandingConfig;
  schoolAllowedGrades?: number[];
  onAddTopic: (topic: Omit<CurriculumTopic, 'id'>) => void;
  onCleanSampleData?: () => {
    removedTopics: number;
    removedQuestions: number;
    removedMatrices: number;
    removedExams: number;
  };
  onOpenWorkflowDossier: (workflowId: string, menuId?: MenuSectionId) => void;
  onNavigate: (menuId: MenuSectionId) => void;
  onNotify: (
    type: ToastNotification['type'],
    title: string,
    message: string
  ) => void;
}

export const TeacherMyWorkWorkspace: React.FC<TeacherMyWorkWorkspaceProps> = ({
  topics,
  questions,
  matrices,
  exams,
  config,
  authSession,
  teacherPermissionProfile,
  schoolBranding,
  schoolAllowedGrades,
  onAddTopic,
  onCleanSampleData,
  onOpenWorkflowDossier,
  onNavigate,
  onNotify,
}) => {
  const effectiveSchoolId = (
    authSession?.user?.schoolId ||
    schoolBranding?.schoolId ||
    'SCHOOL_A'
  ).trim();
  const effectiveSchoolName = (
    schoolBranding?.schoolName ||
    config.schoolName ||
    'Trường TH&THCS Nguyễn Đình Anh'
  ).trim();
  const effectiveAcademicYear = (
    schoolBranding?.academicYear ||
    config.academicYear ||
    '2026 - 2027'
  ).trim();

  const actorId = (
    authSession?.user?.id ||
    teacherPermissionProfile?.userId ||
    ''
  ).trim();
  const actorFullName = (
    teacherPermissionProfile?.fullName ||
    authSession?.user?.fullName ||
    'Giáo viên bộ môn'
  ).trim();
  const actorDepartmentName = (
    teacherPermissionProfile?.departmentName ||
    authSession?.user?.departmentName ||
    'Tổ chuyên môn'
  ).trim();

  const [activeTab, setActiveTab] = useState<MyWorkTabId>('ASSIGNED_WORK_QUEUE');
  const [serverAllocations, setServerAllocations] = useState<
    AssignedSubjectGradeAllocation[]
  >([]);
  const [resolvedDepartmentName, setResolvedDepartmentName] =
    useState<string>(actorDepartmentName);
  const [officialWorkflows, setOfficialWorkflows] = useState<ExamWorkflow[]>(() =>
    loadSavedWorkflows([], [], []).filter((w) => !isSampleOrTestWorkflowDossier(w))
  );
  const [officialTasks, setOfficialTasks] = useState<MyAssignedTaskItem[]>(() =>
    loadNotificationsAndTasks().tasks.filter((t) => !isSampleOrDemoAssignedTask(t))
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Bộ lọc Tab 1: Nhiệm vụ chuyên môn
  const [workStatusFilter, setWorkStatusFilter] =
    useState<WorkStatusFilter>('ALL');
  const [workSubjectFilter, setWorkSubjectFilter] = useState<string>('ALL');
  const [workGradeFilter, setWorkGradeFilter] = useState<number | 'ALL'>('ALL');
  const [workSearch, setWorkSearch] = useState<string>('');

  // Bộ lọc & Form Tab 3: Phân phối chương trình môn được giao
  const [curriculumViewMode, setCurriculumViewMode] = useState<
    'TABLE_2345' | 'TOPIC_CARDS'
  >('TABLE_2345');
  const [curGradeFilter, setCurGradeFilter] = useState<GradeNumber | 'ALL'>('ALL');
  const [curSubjectFilter, setCurSubjectFilter] = useState<string>('ALL');
  const [curSemesterFilter, setCurSemesterFilter] = useState<
    'ALL' | 'HK1' | 'HK2'
  >('ALL');
  const [curSearchKeyword, setCurSearchKeyword] = useState<string>('');
  const [expandedTopicIds, setExpandedTopicIds] = useState<
    Record<string, boolean>
  >({});
  const [showAddTopicForm, setShowAddTopicForm] = useState<boolean>(false);

  // State biểu mẫu bổ sung mạch chủ đề / bài học chính thức
  const [formGrade, setFormGrade] = useState<GradeNumber>(6);
  const [formSubject, setFormSubject] = useState<string>('');
  const [formSemester, setFormSemester] = useState<'HK1' | 'HK2' | 'CA_NAM'>(
    'HK1'
  );
  const [formWeekRange, setFormWeekRange] = useState<string>('Tuần 1');
  const [formChapterCode, setFormChapterCode] = useState<string>('');
  const [formChapterTitle, setFormChapterTitle] = useState<string>('');
  const [formTopicTitle, setFormTopicTitle] = useState<string>('');
  const [formSubLessonName, setFormSubLessonName] = useState<string>('');
  const [formDurationText, setFormDurationText] = useState<string>('1 tiết');
  const [formPeriodsCount, setFormPeriodsCount] = useState<number>(1);
  const [formOutcomeCode, setFormOutcomeCode] = useState<string>('');
  const [formOutcomeDesc, setFormOutcomeDesc] = useState<string>('');
  const [formNoteText, setFormNoteText] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Tự động làm sạch dữ liệu mẫu còn sót ngay khi mở mục 2. Công việc của tôi
  const autoCleanedRef = useRef(false);
  useEffect(() => {
    purgeAllSampleWorkflowsFromLocal();
    purgeSampleNotificationsAndTasksFromLocal();
    if (autoCleanedRef.current) return;
    const hasSampleT = topics.some((t) => Boolean(t.isSampleData));
    const hasSampleQ = questions.some((q) => isSampleOrDemoQuestion(q));
    const hasSampleM = matrices.some((m) => isSampleOrDemoMatrix(m));
    const hasSampleE = exams.some((e) => isSampleOrDemoExam(e));
    if (hasSampleT || hasSampleQ || hasSampleM || hasSampleE) {
      autoCleanedRef.current = true;
      onCleanSampleData?.();
    }
  }, [topics, questions, matrices, exams, onCleanSampleData]);

  // Nạp dữ liệu phân công thực tế, hồ sơ quy trình chính thức và công việc được giao từ máy chủ
  const loadOfficialTeacherWorkContext = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const defaultAdminId =
        actorId ||
        (effectiveSchoolId === 'SCHOOL_B'
          ? 'user-school-admin-sia'
          : effectiveSchoolId === 'SCHOOL_C'
          ? 'user-school-admin-ddung'
          : 'user-school-admin-a');

      const [deptRes, wfRes, notifRes] = await Promise.all([
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
        fetch('/api/notifications'),
      ]);

      if (deptRes.ok) {
        const deptJson = await deptRes.json();
        const accounts = Array.isArray(deptJson?.accounts)
          ? (deptJson.accounts as Array<Record<string, unknown>>)
          : [];
        const matchedAccount = accounts.find((acc) => {
          const idMatch =
            actorId && String(acc?.id || '').trim() === actorId;
          const nameMatch =
            actorFullName &&
            normalizeText(String(acc?.fullName || '')) ===
              normalizeText(actorFullName);
          return Boolean(idMatch || nameMatch);
        });

        if (matchedAccount) {
          const deptStr = String(matchedAccount.departmentName || '').trim();
          if (deptStr) {
            setResolvedDepartmentName(deptStr);
          }
          const rawAllocs = Array.isArray(matchedAccount.subjectAllocations)
            ? (matchedAccount.subjectAllocations as Array<{
                subjectName?: string;
                grades?: number[];
              }>)
            : [];
          const built: AssignedSubjectGradeAllocation[] = [];
          for (const item of rawAllocs) {
            const subj = String(item?.subjectName || '').trim();
            const grds = Array.isArray(item?.grades)
              ? item.grades.map(Number).filter((g) => g >= 1 && g <= 9)
              : [];
            for (const g of grds) {
              const gradeNum = g as GradeNumber;
              const lvl =
                gradeNum <= 5
                  ? EducationLevelId.PRIMARY
                  : EducationLevelId.LOWER_SECONDARY;
              if (
                subj &&
                !built.some(
                  (x) =>
                    x.grade === gradeNum && areSubjectsSame(x.subject, subj)
                )
              ) {
                built.push({
                  levelId: lvl,
                  grade: gradeNum,
                  subject: subj,
                  departmentName: deptStr || actorDepartmentName,
                });
              }
            }
          }
          setServerAllocations(built);
        } else {
          setServerAllocations([]);
        }
      }

      if (wfRes.ok) {
        const wfJson = await wfRes.json();
        const remoteWfs: ExamWorkflow[] = Array.isArray(wfJson?.workflows)
          ? wfJson.workflows
          : [];
        const localWfs = loadSavedWorkflows([], [], []);
        const byId = new Map<string, ExamWorkflow>();
        for (const wf of [...remoteWfs, ...localWfs]) {
          if (wf && wf.workflowId && !isSampleOrTestWorkflowDossier(wf)) {
            if (!wf.schoolId || wf.schoolId === effectiveSchoolId) {
              byId.set(wf.workflowId, wf);
            }
          }
        }
        setOfficialWorkflows(Array.from(byId.values()));
      }

      if (notifRes.ok) {
        const notifJson = await notifRes.json();
        const remoteTasks: MyAssignedTaskItem[] = Array.isArray(
          notifJson?.assignedTasks
        )
          ? notifJson.assignedTasks
          : [];
        const localTasks = loadNotificationsAndTasks().tasks;
        const taskMap = new Map<string, MyAssignedTaskItem>();
        for (const tk of [...remoteTasks, ...localTasks]) {
          if (tk && tk.taskId && !isSampleOrDemoAssignedTask(tk)) {
            taskMap.set(tk.taskId, tk);
          }
        }
        setOfficialTasks(Array.from(taskMap.values()));
      }
    } catch {
      // Giữ trạng thái cục bộ đã làm sạch nếu tạm mất kết nối
    } finally {
      setIsRefreshing(false);
    }
  }, [actorId, actorFullName, actorDepartmentName, effectiveSchoolId]);

  useEffect(() => {
    void loadOfficialTeacherWorkContext();
  }, [loadOfficialTeacherWorkContext]);

  // Chuẩn hóa danh sách Khối lớp hợp lệ của trường (chỉ Tiểu học 1-5 và/hoặc THCS 6-9, không bao giờ có khối mẫu THPT)
  const validSchoolGrades = useMemo<GradeNumber[]>(() => {
    const allowed = (schoolAllowedGrades || []).filter(
      (g): g is GradeNumber => g >= 1 && g <= 9
    );
    return allowed.length > 0 ? allowed : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }, [schoolAllowedGrades]);

  // Danh sách tổ hợp (Cấp học, Khối lớp, Môn học) được phân công chính thức cho Giáo viên đang đăng nhập
  const teacherAllocations = useMemo<AssignedSubjectGradeAllocation[]>(() => {
    const result: AssignedSubjectGradeAllocation[] = [];
    const pushUnique = (
      gradeNum: number,
      subjectName: string,
      deptName: string
    ) => {
      if (gradeNum < 1 || gradeNum > 9) return;
      const g = gradeNum as GradeNumber;
      if (!validSchoolGrades.includes(g)) return;
      const s = subjectName.trim();
      if (!s) return;
      if (result.some((r) => r.grade === g && areSubjectsSame(r.subject, s))) {
        return;
      }
      result.push({
        levelId:
          g <= 5 ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY,
        grade: g,
        subject: s,
        departmentName: deptName || resolvedDepartmentName,
      });
    };

    if (
      teacherPermissionProfile &&
      Array.isArray(teacherPermissionProfile.normalizedRecords) &&
      teacherPermissionProfile.normalizedRecords.length > 0
    ) {
      for (const rec of teacherPermissionProfile.normalizedRecords) {
        pushUnique(
          Number(rec.GradeId),
          String(rec.SubjectName || ''),
          resolvedDepartmentName
        );
      }
    }

    for (const srv of serverAllocations) {
      pushUnique(srv.grade, srv.subject, srv.departmentName);
    }

    if (result.length === 0) {
      const sessSubjs = authSession?.user?.assignedSubjects || [];
      const sessGrades = (authSession?.user?.assignedGrades || []).map(Number);
      for (const s of sessSubjs) {
        for (const g of sessGrades) {
          pushUnique(g, s, resolvedDepartmentName);
        }
      }
    }

    return result.sort((a, b) =>
      a.grade !== b.grade
        ? a.grade - b.grade
        : a.subject.localeCompare(b.subject, 'vi')
    );
  }, [
    teacherPermissionProfile,
    serverAllocations,
    authSession?.user?.assignedSubjects,
    authSession?.user?.assignedGrades,
    validSchoolGrades,
    resolvedDepartmentName,
  ]);

  const hasSpecificAllocation = teacherAllocations.length > 0;

  const allowedGradesForActor = useMemo<GradeNumber[]>(() => {
    if (hasSpecificAllocation) {
      return Array.from(new Set(teacherAllocations.map((a) => a.grade))).sort(
        (a, b) => a - b
      );
    }
    return validSchoolGrades;
  }, [hasSpecificAllocation, teacherAllocations, validSchoolGrades]);

  const allowedSubjectsForActor = useMemo<string[]>(() => {
    if (hasSpecificAllocation) {
      return Array.from(new Set(teacherAllocations.map((a) => a.subject)));
    }
    const subjs = new Set<string>();
    if (validSchoolGrades.some((g) => g <= 5)) {
      for (const s of getRuleSetForLevel(EducationLevelId.PRIMARY).subjects) {
        subjs.add(s);
      }
    }
    if (validSchoolGrades.some((g) => g >= 6)) {
      for (const s of getRuleSetForLevel(EducationLevelId.LOWER_SECONDARY)
        .subjects) {
        subjs.add(s);
      }
    }
    return Array.from(subjs);
  }, [hasSpecificAllocation, teacherAllocations, validSchoolGrades]);

  const allowedSubjectsForFormGrade = useMemo<string[]>(() => {
    if (hasSpecificAllocation) {
      const byGrade = teacherAllocations
        .filter((a) => a.grade === formGrade)
        .map((a) => a.subject);
      if (byGrade.length > 0) return Array.from(new Set(byGrade));
      return allowedSubjectsForActor;
    }
    const lvl =
      formGrade <= 5
        ? EducationLevelId.PRIMARY
        : EducationLevelId.LOWER_SECONDARY;
    return getRuleSetForLevel(lvl).subjects;
  }, [
    hasSpecificAllocation,
    teacherAllocations,
    formGrade,
    allowedSubjectsForActor,
  ]);

  // Đồng bộ giá trị mặc định hợp lệ cho biểu mẫu thêm bài học
  useEffect(() => {
    if (
      allowedGradesForActor.length > 0 &&
      !allowedGradesForActor.includes(formGrade)
    ) {
      setFormGrade(allowedGradesForActor[0]);
    }
  }, [allowedGradesForActor, formGrade]);

  useEffect(() => {
    if (
      allowedSubjectsForFormGrade.length > 0 &&
      !allowedSubjectsForFormGrade.some((s) => areSubjectsSame(s, formSubject))
    ) {
      setFormSubject(allowedSubjectsForFormGrade[0]);
    }
  }, [allowedSubjectsForFormGrade, formSubject]);

  // Dữ liệu chuyên môn chính thức (đã loại trừ 100% dữ liệu mẫu)
  const officialQuestions = useMemo(
    () =>
      questions.filter(
        (q) =>
          !isSampleOrDemoQuestion(q) &&
          validSchoolGrades.includes(Number(q.grade) as GradeNumber)
      ),
    [questions, validSchoolGrades]
  );

  const officialMatrices = useMemo(
    () =>
      matrices.filter(
        (m) =>
          !isSampleOrDemoMatrix(m) &&
          validSchoolGrades.includes(Number(m.grade) as GradeNumber)
      ),
    [matrices, validSchoolGrades]
  );

  const officialExams = useMemo(
    () =>
      exams.filter(
        (e) =>
          !isSampleOrDemoExam(e) &&
          validSchoolGrades.includes(Number(e.grade) as GradeNumber)
      ),
    [exams, validSchoolGrades]
  );

  const isMatchedToCurrentTeacher = useCallback(
    (candidateIds: Array<string | undefined>, candidateNames: Array<string | undefined>): boolean => {
      if (
        actorId &&
        candidateIds.some((cid) => cid && cid.trim() === actorId)
      ) {
        return true;
      }
      const normActor = normalizeText(actorFullName);
      if (
        normActor &&
        normActor !== 'giáo viên bộ môn' &&
        candidateNames.some((cname) => {
          const nc = normalizeText(cname);
          return Boolean(nc && (nc === normActor || nc.includes(normActor)));
        })
      ) {
        return true;
      }
      return false;
    },
    [actorId, actorFullName]
  );

  // Tổng hợp hàng đợi Công việc chuyên môn chính thức của Giáo viên đang đăng nhập
  const myWorkItems = useMemo<UnifiedTeacherWorkItem[]>(() => {
    const items: UnifiedTeacherWorkItem[] = [];
    const coveredWorkflowIds = new Set<string>();
    const coveredMatrixIds = new Set<string>();
    const coveredExamIds = new Set<string>();

    // 1. Hồ sơ quy trình chính thức được giao Ra đề hoặc Phản biện
    for (const wf of officialWorkflows) {
      if (isSampleOrTestWorkflowDossier(wf)) continue;
      const g = Number(wf.gradeId) as GradeNumber;
      if (!validSchoolGrades.includes(g)) continue;

      const isCreator = isMatchedToCurrentTeacher(
        [wf.creatorId],
        [wf.creatorName, wf.assignedUsers?.creatorName]
      );
      const isReviewer = isMatchedToCurrentTeacher(
        [],
        [wf.assignedUsers?.reviewerName]
      );
      const isCurrentAssignee = isMatchedToCurrentTeacher(
        [],
        [wf.assignedUsers?.currentAssigneeName]
      );

      if (!isCreator && !isReviewer && !isCurrentAssignee) continue;

      coveredWorkflowIds.add(wf.workflowId);
      if (wf.matrixId) coveredMatrixIds.add(wf.matrixId);
      if (wf.examId) coveredExamIds.add(wf.examId);

      let statusBucket: Exclude<WorkStatusFilter, 'ALL'> = 'NEEDS_ACTION';
      if (wf.status === 'RevisionRequired' || wf.status === 'TeacherRevision') {
        statusBucket = 'REVISION_REQUIRED';
      } else if (
        wf.status === 'Approved' ||
        wf.status === 'Released' ||
        wf.status === 'ResultsAnalysis' ||
        wf.status === 'Archived'
      ) {
        statusBucket = 'COMPLETED';
      } else if (
        isCreator &&
        !isReviewer &&
        (wf.status === 'MatrixReview' ||
          wf.status === 'ProfessionalReview' ||
          wf.status === 'AwaitingApproval')
      ) {
        statusBucket = 'IN_REVIEW';
      }

      const roleType = isReviewer && !isCreator ? 'EXAM_REVIEWER' : 'EXAM_CREATOR';
      const roleLabel =
        roleType === 'EXAM_REVIEWER'
          ? 'Giáo viên phản biện đề'
          : 'Giáo viên ra đề chính';

      items.push({
        id: `wf-${wf.workflowId}`,
        code: wf.workflowId,
        title: wf.title,
        roleType,
        roleLabel,
        subject: wf.subjectId,
        grade: g,
        examPeriodLabel:
          wf.examPeriodLabel || formatExamPeriod(wf.examPeriod, wf.title),
        dueDateLabel: wf.dueDate || wf.examDate || 'Theo kế hoạch trường',
        assignedByLabel:
          roleType === 'EXAM_REVIEWER'
            ? wf.assignedUsers?.matrixApproverName || 'Tổ trưởng chuyên môn'
            : wf.assignedUsers?.finalApproverName || 'Ban Giám hiệu',
        statusBucket,
        statusLabel: WORKFLOW_STATE_LABELS[wf.status]?.label || wf.status,
        targetMenu: 'exam-workflow',
        workflowId: wf.workflowId,
        actionLabel:
          roleType === 'EXAM_REVIEWER'
            ? 'Mở hồ sơ phản biện'
            : statusBucket === 'REVISION_REQUIRED'
            ? 'Chỉnh sửa & Gửi lại'
            : 'Thực hiện hồ sơ',
        updatedAt: wf.updatedAt || wf.createdAt || '',
      });
    }

    // 2. Nhiệm vụ nhắc việc phát sinh từ Quy trình (nếu chưa trùng hồ sơ trên)
    for (const tk of officialTasks) {
      if (isSampleOrDemoAssignedTask(tk)) continue;
      const g = Number(tk.gradeId) as GradeNumber;
      if (!validSchoolGrades.includes(g)) continue;
      const belongsToMe = isMatchedToCurrentTeacher(
        [tk.assigneeUserId],
        [tk.assigneeName]
      );
      if (!belongsToMe) continue;
      if (tk.workflowId && coveredWorkflowIds.has(tk.workflowId)) continue;

      const statusBucket: Exclude<WorkStatusFilter, 'ALL'> =
        tk.status === 'COMPLETED'
          ? 'COMPLETED'
          : tk.status === 'OVERDUE'
          ? 'REVISION_REQUIRED'
          : 'NEEDS_ACTION';

      items.push({
        id: `task-${tk.taskId}`,
        code: tk.workflowId || tk.taskId,
        title: tk.taskTitle,
        roleType: 'WORKFLOW_TASK',
        roleLabel: 'Nhiệm vụ quy trình được giao',
        subject: tk.subjectId,
        grade: g,
        examPeriodLabel: formatExamPeriod(undefined, tk.taskTitle),
        dueDateLabel: tk.dueDate || 'Theo kế hoạch',
        assignedByLabel: tk.assignedByName || 'Tổ chuyên môn / BGH',
        statusBucket,
        statusLabel:
          tk.status === 'COMPLETED'
            ? 'Đã hoàn thành'
            : tk.status === 'OVERDUE'
            ? 'Quá hạn xử lý'
            : tk.status === 'IN_PROGRESS'
            ? 'Đang thực hiện'
            : 'Chờ thực hiện',
        targetMenu: tk.targetMenuId || 'exam-workflow',
        workflowId: tk.workflowId,
        actionLabel: 'Mở thực hiện',
        updatedAt: tk.createdAt || '',
      });
    }

    // 3. Đề kiểm tra chính thức của tôi (hoặc được phân công phản biện) ngoài danh sách workflow
    for (const ex of officialExams) {
      if (coveredExamIds.has(ex.id)) continue;
      const isMyExam = isMatchedToCurrentTeacher([], [ex.authorName]);
      const isReviewerExam = isMatchedToCurrentTeacher(
        [],
        [ex.assignedReviewerName, ex.reviewerName]
      );
      if (!isMyExam && !isReviewerExam) continue;

      if (ex.matrixId) coveredMatrixIds.add(ex.matrixId);

      let statusBucket: Exclude<WorkStatusFilter, 'ALL'> = 'NEEDS_ACTION';
      let statusLabel = 'Đang soạn thảo (Nháp)';
      if (
        ex.status === ApprovalStatus.APPROVED ||
        ex.status === ApprovalStatus.PUBLISHED
      ) {
        statusBucket = 'COMPLETED';
        statusLabel = 'Đã phê duyệt chính thức';
      } else if (ex.status === ApprovalStatus.REVISION_REQUIRED) {
        statusBucket = 'REVISION_REQUIRED';
        statusLabel = 'Yêu cầu chỉnh sửa lại';
      } else if (
        ex.status === ApprovalStatus.PENDING ||
        ex.status === ApprovalStatus.IN_REVIEW ||
        ex.status === ApprovalStatus.PENDING_APPROVAL
      ) {
        statusBucket = isReviewerExam && !isMyExam ? 'NEEDS_ACTION' : 'IN_REVIEW';
        statusLabel =
          ex.status === ApprovalStatus.PENDING_APPROVAL
            ? 'Chờ BGH phê duyệt'
            : 'Đang thẩm định chuyên môn';
      }

      items.push({
        id: `exam-${ex.id}`,
        code: ex.code,
        title: ex.title,
        roleType: isReviewerExam && !isMyExam ? 'EXAM_REVIEWER' : 'EXAM_CREATOR',
        roleLabel:
          isReviewerExam && !isMyExam
            ? 'Giáo viên phản biện đề'
            : 'Biên soạn đề kiểm tra',
        subject: ex.subject,
        grade: Number(ex.grade) as GradeNumber,
        examPeriodLabel: formatExamPeriod(ex.examPeriod, ex.title),
        dueDateLabel: ex.updatedAt || ex.createdAt,
        assignedByLabel:
          ex.headOfDepartmentName || ex.finalApproverName || 'Tổ chuyên môn',
        statusBucket,
        statusLabel,
        targetMenu: 'exam-builder',
        actionLabel:
          statusBucket === 'REVISION_REQUIRED'
            ? 'Mở chỉnh sửa đề'
            : 'Mở đề kiểm tra',
        updatedAt: ex.updatedAt || ex.createdAt,
      });
    }

    // 4. Ma trận & Bản đặc tả chính thức của tôi (chưa gắn đề/workflow)
    for (const mat of officialMatrices) {
      if (coveredMatrixIds.has(mat.id)) continue;
      const isMyMatrix = isMatchedToCurrentTeacher([], [mat.authorName]);
      const isReviewerMatrix = isMatchedToCurrentTeacher(
        [],
        [mat.assignedReviewerName]
      );
      if (!isMyMatrix && !isReviewerMatrix) continue;

      let statusBucket: Exclude<WorkStatusFilter, 'ALL'> = 'NEEDS_ACTION';
      let statusLabel = 'Đang xây dựng ma trận';
      if (
        mat.status === ApprovalStatus.APPROVED ||
        mat.status === ApprovalStatus.PUBLISHED
      ) {
        statusBucket = 'COMPLETED';
        statusLabel = 'Ma trận đã duyệt';
      } else if (mat.status === ApprovalStatus.REVISION_REQUIRED) {
        statusBucket = 'REVISION_REQUIRED';
        statusLabel = 'Ma trận cần chỉnh sửa';
      } else if (
        mat.status === ApprovalStatus.PENDING ||
        mat.status === ApprovalStatus.IN_REVIEW ||
        mat.status === ApprovalStatus.PENDING_APPROVAL
      ) {
        statusBucket = 'IN_REVIEW';
        statusLabel = 'Chờ duyệt ma trận';
      }

      items.push({
        id: `mat-${mat.id}`,
        code: mat.code,
        title: mat.title,
        roleType: 'MATRIX_AUTHOR',
        roleLabel: 'Xây dựng Ma trận & Đặc tả',
        subject: mat.subject,
        grade: Number(mat.grade) as GradeNumber,
        examPeriodLabel: formatExamPeriod(mat.examPeriod, mat.title),
        dueDateLabel: mat.createdAt,
        assignedByLabel: mat.headOfDepartmentName || 'Tổ chuyên môn',
        statusBucket,
        statusLabel,
        targetMenu: 'matrix',
        actionLabel:
          statusBucket === 'COMPLETED' ? 'Sinh đề từ ma trận' : 'Mở ma trận',
        updatedAt: mat.createdAt,
      });
    }

    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [
    officialWorkflows,
    officialTasks,
    officialExams,
    officialMatrices,
    validSchoolGrades,
    isMatchedToCurrentTeacher,
  ]);

  const filteredWorkItems = useMemo(() => {
    const kw = normalizeText(workSearch);
    return myWorkItems.filter((item) => {
      if (workStatusFilter !== 'ALL' && item.statusBucket !== workStatusFilter) {
        return false;
      }
      if (
        workSubjectFilter !== 'ALL' &&
        !areSubjectsSame(item.subject, workSubjectFilter)
      ) {
        return false;
      }
      if (workGradeFilter !== 'ALL' && item.grade !== workGradeFilter) {
        return false;
      }
      if (kw) {
        const hay = normalizeText(
          `${item.code} ${item.title} ${item.subject} ${item.roleLabel} ${item.examPeriodLabel}`
        );
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [
    myWorkItems,
    workStatusFilter,
    workSubjectFilter,
    workGradeFilter,
    workSearch,
  ]);

  // Lọc Chương trình giáo dục chính thức theo đúng Môn & Khối được giao cho Giáo viên (không có mẫu, không có khối THPT)
  const scopedOfficialTopics = useMemo(() => {
    return topics.filter((t) => {
      if (t.isSampleData) return false;
      if (
        t.levelId !== EducationLevelId.PRIMARY &&
        t.levelId !== EducationLevelId.LOWER_SECONDARY
      ) {
        return false;
      }
      const g = Number(t.grade) as GradeNumber;
      if (!validSchoolGrades.includes(g)) return false;
      if (hasSpecificAllocation) {
        return teacherAllocations.some(
          (a) => a.grade === g && areSubjectsSame(a.subject, t.subject)
        );
      }
      return true;
    });
  }, [topics, validSchoolGrades, hasSpecificAllocation, teacherAllocations]);

  const filteredCurriculumTopics = useMemo(() => {
    const kw = normalizeText(curSearchKeyword);
    return scopedOfficialTopics.filter((t) => {
      if (curGradeFilter !== 'ALL' && t.grade !== curGradeFilter) return false;
      if (
        curSubjectFilter !== 'ALL' &&
        !areSubjectsSame(t.subject, curSubjectFilter)
      ) {
        return false;
      }
      if (
        curSemesterFilter !== 'ALL' &&
        t.semester &&
        t.semester !== curSemesterFilter
      ) {
        return false;
      }
      if (kw) {
        const matchTopic =
          normalizeText(t.chapterTitle).includes(kw) ||
          normalizeText(t.topicTitle).includes(kw) ||
          normalizeText(t.chapterCode).includes(kw) ||
          normalizeText(t.subject).includes(kw);
        const matchLessons = t.lessons?.some(
          (ls) =>
            normalizeText(ls.lessonName).includes(kw) ||
            normalizeText(ls.subLessonName).includes(kw) ||
            normalizeText(ls.adjustedContent).includes(kw)
        );
        const matchOutcomes = t.learningOutcomes.some(
          (lo) =>
            normalizeText(lo.code).includes(kw) ||
            normalizeText(lo.description).includes(kw)
        );
        if (!matchTopic && !matchLessons && !matchOutcomes) return false;
      }
      return true;
    });
  }, [
    scopedOfficialTopics,
    curGradeFilter,
    curSubjectFilter,
    curSemesterFilter,
    curSearchKeyword,
  ]);

  const flattenedLessonRows = useMemo(() => {
    const rows: Array<{
      topic: CurriculumTopic;
      lesson: CurriculumLessonItem;
    }> = [];
    const kw = normalizeText(curSearchKeyword);

    for (const topic of filteredCurriculumTopics) {
      if (topic.lessons && topic.lessons.length > 0) {
        for (const ls of topic.lessons) {
          if (kw) {
            const topicMatches =
              normalizeText(topic.chapterTitle).includes(kw) ||
              normalizeText(topic.subject).includes(kw);
            const lessonMatches =
              normalizeText(ls.lessonName).includes(kw) ||
              normalizeText(ls.subLessonName).includes(kw) ||
              normalizeText(ls.adjustedContent).includes(kw);
            if (!topicMatches && !lessonMatches) continue;
          }
          rows.push({ topic, lesson: ls });
        }
      } else {
        for (const lo of topic.learningOutcomes) {
          rows.push({
            topic,
            lesson: {
              id: `${topic.id}-${lo.code}`,
              week: topic.weekRange || 'Cả năm',
              lessonName: topic.topicTitle,
              subLessonName: lo.lessonName,
              periodAllocation:
                lo.duration || topic.durationText || 'Theo PPCT',
              periodsCount: topic.totalPeriods || 1,
              adjustedContent: lo.description,
              integrationTags: extractIntegrationTags(lo.description),
            },
          });
        }
      }
    }
    return rows;
  }, [filteredCurriculumTopics, curSearchKeyword]);

  const myAuthoredQuestionsCount = useMemo(() => {
    return officialQuestions.filter((q) => {
      if (hasSpecificAllocation) {
        return teacherAllocations.some(
          (a) =>
            a.grade === Number(q.grade) &&
            areSubjectsSame(a.subject, q.subject)
        );
      }
      return isMatchedToCurrentTeacher([], [q.authorName]);
    }).length;
  }, [
    officialQuestions,
    hasSpecificAllocation,
    teacherAllocations,
    isMatchedToCurrentTeacher,
  ]);

  const pendingActionCount = useMemo(
    () =>
      myWorkItems.filter(
        (i) =>
          i.statusBucket === 'NEEDS_ACTION' ||
          i.statusBucket === 'REVISION_REQUIRED'
      ).length,
    [myWorkItems]
  );

  const grantedPermissionLabels = useMemo(() => {
    const codes = teacherPermissionProfile?.permissionCodes || [
      'VIEW_ASSIGNED_CURRICULUM',
      'VIEW_QUESTION_BANK',
      'CREATE_OWN_QUESTION',
      'CREATE_EXAM_MATRIX',
      'CREATE_EXAM_PAPER',
      'USE_AI_QUALITY_REVIEW',
    ];
    const labels = codes
      .map((c) => PERMISSION_DISPLAY_LABELS[c])
      .filter(Boolean);
    return Array.from(new Set(labels));
  }, [teacherPermissionProfile?.permissionCodes]);

  const handleConfirmCleanSampleData = async () => {
    setIsCleaning(true);
    try {
      const localRes = onCleanSampleData?.() || {
        removedTopics: 0,
        removedQuestions: 0,
        removedMatrices: 0,
        removedExams: 0,
      };
      const removedLocalWfs = purgeAllSampleWorkflowsFromLocal();
      const removedLocalNotifs = purgeSampleNotificationsAndTasksFromLocal();

      let srvQuestions = 0;
      let srvMatrices = 0;
      let srvExams = 0;
      let srvWfs = 0;

      try {
        const [cleanAppraisalRes, cleanWfRes] = await Promise.all([
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
        if (cleanAppraisalRes.ok) {
          const j1 = await cleanAppraisalRes.json();
          srvQuestions = Number(j1?.removedQuestions || 0);
          srvMatrices = Number(j1?.removedMatrices || 0);
          srvExams = Number(j1?.removedExams || 0);
        }
        if (cleanWfRes.ok) {
          const j2 = await cleanWfRes.json();
          srvWfs = Number(j2?.removedWorkflowsCount || 0);
        }
      } catch {
        // Bỏ qua lỗi mạng tạm thời
      }

      await loadOfficialTeacherWorkContext();
      setShowCleanModal(false);

      const totalRemoved =
        localRes.removedTopics +
        Math.max(localRes.removedQuestions, srvQuestions) +
        Math.max(localRes.removedMatrices, srvMatrices) +
        Math.max(localRes.removedExams, srvExams) +
        Math.max(removedLocalWfs, srvWfs) +
        removedLocalNotifs.removedTasks;

      onNotify(
        'success',
        'Đã làm sạch dữ liệu Công việc của tôi',
        totalRemoved > 0
          ? `Đã dọn sạch ${totalRemoved} bản ghi mẫu/thử nghiệm. Không gian Công việc của tôi đã sẵn sàng vận hành chính thức.`
          : 'Không gian Công việc của tôi đã sạch 100% dữ liệu mẫu, chỉ hiển thị nhiệm vụ và phân công thực tế.'
      );
    } finally {
      setIsCleaning(false);
    }
  };

  const handleOpenWorkItem = (item: UnifiedTeacherWorkItem) => {
    if (item.workflowId) {
      onOpenWorkflowDossier(item.workflowId, item.targetMenu);
      return;
    }
    onNavigate(item.targetMenu);
  };

  const handleCreateOfficialTopic = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !formChapterTitle.trim() ||
      !formTopicTitle.trim() ||
      !formOutcomeDesc.trim() ||
      !formSubject.trim()
    ) {
      setFormError(
        'Vui lòng nhập đầy đủ Khối lớp, Môn học, Chủ đề / Mạch nội dung, Tên bài học và Yêu cầu cần đạt.'
      );
      return;
    }

    const targetLevel =
      formGrade <= 5
        ? EducationLevelId.PRIMARY
        : EducationLevelId.LOWER_SECONDARY;
    const ruleSet = getRuleSetForLevel(targetLevel);
    const cleanWeek = formWeekRange.trim() || 'Tuần 1';
    const cleanDuration = formDurationText.trim() || `${formPeriodsCount} tiết`;
    const generatedCode =
      formChapterCode.trim() ||
      `CĐ-K${formGrade}-${Date.now().toString().slice(-3)}`;

    onAddTopic({
      levelId: targetLevel,
      grade: formGrade,
      subject: formSubject.trim(),
      semester: formSemester,
      weekRange: cleanWeek,
      totalPeriods: formPeriodsCount,
      durationText: `${cleanDuration} (${cleanWeek})`,
      adjustedContentSummary: formOutcomeDesc.trim(),
      sourceDocument: `Kế hoạch dạy học chính thức – ${effectiveSchoolName} (${effectiveAcademicYear})`,
      chapterCode: generatedCode,
      chapterTitle: formChapterTitle.trim(),
      topicTitle: formTopicTitle.trim(),
      lessons: [
        {
          id: `ls-${Date.now()}`,
          week: cleanWeek.replace(/^Tuần\s*/i, ''),
          lessonName: formTopicTitle.trim(),
          subLessonName: formSubLessonName.trim() || undefined,
          periodAllocation: cleanDuration,
          periodsCount: Number(formPeriodsCount) || 1,
          adjustedContent: formOutcomeDesc.trim(),
          integrationTags: extractIntegrationTags(formOutcomeDesc.trim()),
          note: formNoteText.trim() || undefined,
        },
      ],
      learningOutcomes: [
        {
          code: formOutcomeCode.trim() || `${generatedCode}-YCCĐ1`,
          description: `${formTopicTitle.trim()} (${cleanDuration}): ${formOutcomeDesc.trim()}`,
          suggestedCognitiveLevel: ruleSet.cognitiveLevels[0].code,
          lessonName: formTopicTitle.trim(),
          duration: cleanDuration,
          week: cleanWeek,
        },
      ],
      isSampleData: false,
    });

    setFormChapterCode('');
    setFormChapterTitle('');
    setFormTopicTitle('');
    setFormSubLessonName('');
    setFormDurationText('1 tiết');
    setFormPeriodsCount(1);
    setFormOutcomeCode('');
    setFormOutcomeDesc('');
    setFormNoteText('');
    setShowAddTopicForm(false);

    onNotify(
      'success',
      'Đã lưu bài học chính thức',
      `Đã bổ sung "${formTopicTitle.trim()}" (${formSubject} – Khối ${formGrade}) vào phân phối chương trình.`
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER CHÍNH THỨC: GIÁO VIÊN · MỤC 2. CÔNG VIỆC CỦA TÔI */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>GIÁO VIÊN BỘ MÔN · MỤC 2. CÔNG VIỆC CỦA TÔI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Không gian Công việc Chuyên môn & Phân công Giảng dạy Cá nhân
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-4xl leading-relaxed">
              Quản lý tập trung các nhiệm vụ ra đề, phản biện đề được giao, phân công giảng dạy chính thức và phân phối chương trình GDPT 2018 đúng theo môn học – khối lớp phụ trách tại{' '}
              <strong className="text-white">{effectiveSchoolName}</strong> (Năm học{' '}
              <strong className="text-amber-300">{effectiveAcademicYear}</strong>).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-200">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Giáo viên:</span>
                <strong className="text-white">{actorFullName}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15">
                <Layers className="w-3.5 h-3.5 text-sky-300" />
                <span>Tổ chuyên môn:</span>
                <strong className="text-white">{resolvedDepartmentName}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Chế độ vận hành chính thức (Không dữ liệu mẫu)</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void loadOfficialTeacherWorkContext()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCleanModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 border border-rose-400/40 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Làm sạch dữ liệu mẫu</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('exam-workflow')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Mở Hồ sơ của tôi</span>
            </button>
          </div>
        </div>

        {/* 4 THẺ CHỈ SỐ CÔNG VIỆC CHÍNH THỨC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="bg-white/10 border border-white/15 rounded-xl p-3.5">
            <div className="text-[11px] text-blue-200 font-medium">
              Nhiệm vụ chuyên môn của tôi
            </div>
            <div className="text-2xl font-extrabold font-mono mt-1">
              {myWorkItems.length}
            </div>
            <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
              Cần xử lý ngay: {pendingActionCount} nhiệm vụ
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl p-3.5">
            <div className="text-[11px] text-blue-200 font-medium">
              Phân công môn – khối chính thức
            </div>
            <div className="text-2xl font-extrabold font-mono mt-1">
              {teacherAllocations.length}
            </div>
            <div className="text-[11px] text-blue-100 mt-0.5 truncate">
              {hasSpecificAllocation
                ? `${allowedSubjectsForActor.join(', ')} (${allowedGradesForActor
                    .map((g) => `K${g}`)
                    .join(', ')})`
                : 'Theo phân công chuyên môn nhà trường'}
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl p-3.5">
            <div className="text-[11px] text-blue-200 font-medium">
              Câu hỏi chính thức trong phạm vi
            </div>
            <div className="text-2xl font-extrabold font-mono mt-1">
              {myAuthoredQuestionsCount}
            </div>
            <div className="text-[11px] text-emerald-300 font-semibold mt-0.5">
              0 câu hỏi mẫu / thử nghiệm
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl p-3.5">
            <div className="text-[11px] text-blue-200 font-medium">
              Mạch chương trình môn phụ trách
            </div>
            <div className="text-2xl font-extrabold font-mono mt-1">
              {scopedOfficialTopics.length}
            </div>
            <div className="text-[11px] text-blue-100 mt-0.5">
              Chuẩn Chương trình GDPT 2018
            </div>
          </div>
        </div>
      </div>

      {/* THANH CHUYỂN ĐỔI 3 PHÂN MỤC CÔNG VIỆC CỦA TÔI */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('ASSIGNED_WORK_QUEUE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'ASSIGNED_WORK_QUEUE'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>1. Nhiệm vụ Ra đề & Phản biện ({myWorkItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEACHING_ALLOCATIONS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'TEACHING_ALLOCATIONS'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>
            2. Phân công giảng dạy & Quyền hạn ({teacherAllocations.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ASSIGNED_CURRICULUM')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'ASSIGNED_CURRICULUM'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>
            3. Phân phối chương trình môn được giao ({scopedOfficialTopics.length})
          </span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: NHIỆM VỤ RA ĐỀ, PHẢN BIỆN & HỒ SƠ CHUYÊN MÔN CỦA TÔI           */}
      {/* ===================================================================== */}
      {activeTab === 'ASSIGNED_WORK_QUEUE' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-blue-700" />
                  <span>Danh sách Công việc Chuyên môn Thực tế Được Giao</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động đồng bộ từ Phân công ra đề của Ban Giám hiệu, Phân công phản biện của Tổ trưởng chuyên môn và các Ma trận / Đề kiểm tra bạn đang biên soạn.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('matrix')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5 text-blue-700" />
                  <span>Lập Ma trận mới</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('exam-builder')}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tạo Đề kiểm tra</span>
                </button>
              </div>
            </div>

            {/* Bộ lọc công việc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Trạng thái xử lý
                </label>
                <select
                  value={workStatusFilter}
                  onChange={(e) =>
                    setWorkStatusFilter(e.target.value as WorkStatusFilter)
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="ALL">
                    Tất cả công việc ({myWorkItems.length})
                  </option>
                  <option value="NEEDS_ACTION">Cần thực hiện / Đang soạn</option>
                  <option value="REVISION_REQUIRED">
                    Cần chỉnh sửa lại / Quá hạn
                  </option>
                  <option value="IN_REVIEW">Đang chờ thẩm định / Phê duyệt</option>
                  <option value="COMPLETED">Đã hoàn thành / Đã phê duyệt</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Môn học phụ trách
                </label>
                <select
                  value={workSubjectFilter}
                  onChange={(e) => setWorkSubjectFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="ALL">Tất cả môn được giao</option>
                  {allowedSubjectsForActor.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Khối lớp
                </label>
                <select
                  value={workGradeFilter}
                  onChange={(e) =>
                    setWorkGradeFilter(
                      e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="ALL">Tất cả khối được giao</option>
                  {allowedGradesForActor.map((g) => (
                    <option key={g} value={g}>
                      Khối lớp {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tìm kiếm nhanh hồ sơ / nhiệm vụ
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={workSearch}
                    onChange={(e) => setWorkSearch(e.target.value)}
                    placeholder="Nhập mã hồ sơ, tên đề, đợt kiểm tra..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Bảng công việc hoặc Trạng thái sạch ban đầu */}
            {filteredWorkItems.length === 0 ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/60 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {myWorkItems.length === 0
                      ? 'Hiện chưa có nhiệm vụ ra đề hoặc phản biện nào đang chờ xử lý'
                      : 'Không có công việc nào khớp với bộ lọc hiện tại'}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                    {myWorkItems.length === 0
                      ? 'Toàn bộ dữ liệu mẫu/thử nghiệm đã được loại bỏ. Khi Phó Hiệu trưởng phân công ra đề, Tổ trưởng phân công phản biện hoặc khi bạn khởi tạo Ma trận – Đề kiểm tra mới, nhiệm vụ sẽ hiển thị chính thức tại đây.'
                      : 'Hãy nhấn đặt lại bộ lọc để xem toàn bộ danh sách công việc hiện có của bạn.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('questions')}
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Soạn Ngân hàng câu hỏi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('ai-generator')}
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Tạo câu hỏi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('matrix')}
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Grid className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xây dựng Ma trận & Đặc tả</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('exam-workflow')}
                    className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Khởi tạo Hồ sơ đề mới</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="py-3 px-4">1. Hồ sơ / Việc cần thực hiện</th>
                      <th className="py-3 px-3">2. Vai trò đảm nhận</th>
                      <th className="py-3 px-3">3. Môn & Khối</th>
                      <th className="py-3 px-3">4. Đợt & Hạn hoàn thành</th>
                      <th className="py-3 px-3">5. Nguồn giao</th>
                      <th className="py-3 px-3">6. Trạng thái</th>
                      <th className="py-3 px-4 text-right">7. Thực hiện</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredWorkItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-[11px] font-bold text-blue-800">
                            {item.code}
                          </div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {item.title}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${
                              item.roleType === 'EXAM_REVIEWER'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : item.roleType === 'MATRIX_AUTHOR'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {item.roleLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {item.subject}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Khối lớp {item.grade}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            {item.examPeriodLabel}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{item.dueDateLabel}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {item.assignedByLabel}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${
                              item.statusBucket === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.statusBucket === 'REVISION_REQUIRED'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : item.statusBucket === 'IN_REVIEW'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}
                          >
                            {item.statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenWorkItem(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                          >
                            <span>{item.actionLabel}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PHÂN CÔNG GIẢNG DẠY & QUYỀN HẠN CHÍNH THỨC CỦA TÔI            */}
      {/* ===================================================================== */}
      {activeTab === 'TEACHING_ALLOCATIONS' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Bảng Phân công Chuyên môn Cá nhân (Năm học {effectiveAcademicYear})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hiển thị chính xác các tổ hợp Môn học – Khối lớp do Quản trị nhà trường và Ban Giám hiệu phân công cho tài khoản{' '}
                  <strong className="text-slate-800">{actorFullName}</strong>.
                </p>
              </div>
            </div>

            {teacherAllocations.length === 0 ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/60 space-y-2">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-900">
                  Tài khoản hiện tại chưa gắn phân công giảng dạy cá nhân cố định
                </div>
                <p className="text-xs text-slate-600 max-w-xl mx-auto">
                  Nếu bạn là Giáo viên bộ môn, Quản trị viên nhà trường sẽ cập nhật tổ hợp Môn học & Khối lớp giảng dạy tại phân hệ Phân công giảng dạy / Phân quyền.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="py-3 px-4 w-14">STT</th>
                      <th className="py-3 px-4">Cấp học</th>
                      <th className="py-3 px-4">Khối lớp</th>
                      <th className="py-3 px-4">Môn học / HĐGD phụ trách</th>
                      <th className="py-3 px-4">Tổ chuyên môn</th>
                      <th className="py-3 px-4 text-center">Câu hỏi chính thức</th>
                      <th className="py-3 px-4 text-center">Ma trận / Đề</th>
                      <th className="py-3 px-4 text-right">Thao tác nhanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {teacherAllocations.map((alloc, idx) => {
                      const qCount = officialQuestions.filter(
                        (q) =>
                          Number(q.grade) === alloc.grade &&
                          areSubjectsSame(q.subject, alloc.subject)
                      ).length;
                      const mCount = officialMatrices.filter(
                        (m) =>
                          Number(m.grade) === alloc.grade &&
                          areSubjectsSame(m.subject, alloc.subject)
                      ).length;
                      const eCount = officialExams.filter(
                        (ex) =>
                          Number(ex.grade) === alloc.grade &&
                          areSubjectsSame(ex.subject, alloc.subject)
                      ).length;

                      return (
                        <tr
                          key={`${alloc.grade}-${alloc.subject}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                                alloc.levelId === EducationLevelId.PRIMARY
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                              }`}
                            >
                              {alloc.levelId === EducationLevelId.PRIMARY
                                ? 'Tiểu học (TT 27)'
                                : 'THCS (TT 22 / CV 7991)'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            Khối lớp {alloc.grade}
                          </td>
                          <td className="py-3 px-4 font-bold text-blue-950">
                            {alloc.subject}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {alloc.departmentName}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                            {qCount}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                            {mCount} MT · {eCount} Đề
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setCurGradeFilter(alloc.grade);
                                  setCurSubjectFilter(alloc.subject);
                                  setActiveTab('ASSIGNED_CURRICULUM');
                                }}
                                className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                              >
                                Xem PPCT
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigate('questions')}
                                className="px-2.5 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Soạn câu hỏi</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Danh mục quyền nghiệp vụ đã cấp */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-2">
                Quyền nghiệp vụ được kích hoạt cho tài khoản:
              </div>
              <div className="flex flex-wrap gap-2">
                {grantedPermissionLabels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lbl}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PHÂN PHỐI CHƯƠNG TRÌNH MÔN ĐƯỢC GIAO (GDPT 2018 CHÍNH THỨC)    */}
      {/* ===================================================================== */}
      {activeTab === 'ASSIGNED_CURRICULUM' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-start gap-2.5">
                <Filter className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Phân phối Chương trình & Yêu cầu cần đạt (GDPT 2018) trong phạm vi được giao
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chỉ hiển thị các môn học và khối lớp thuộc quyền phụ trách của bạn tại{' '}
                    <strong className="text-slate-700">{effectiveSchoolName}</strong>, phục vụ tra cứu nhanh khi biên soạn câu hỏi và ma trận đề.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCurriculumViewMode('TABLE_2345')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                      curriculumViewMode === 'TABLE_2345'
                        ? 'bg-blue-700 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Bảng Kế hoạch dạy học</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumViewMode('TOPIC_CARDS')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                      curriculumViewMode === 'TOPIC_CARDS'
                        ? 'bg-blue-700 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Mạch chủ đề & YCCĐ</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddTopicForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {showAddTopicForm
                      ? 'Đóng biểu mẫu'
                      : 'Bổ sung Bài học / Chủ đề'}
                  </span>
                </button>
              </div>
            </div>

            {/* Bộ lọc Chương trình giáo dục theo đúng phạm vi của Giáo viên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Khối lớp được giao
                </label>
                <select
                  value={curGradeFilter}
                  onChange={(e) =>
                    setCurGradeFilter(
                      e.target.value === 'ALL'
                        ? 'ALL'
                        : (Number(e.target.value) as GradeNumber)
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="ALL">
                    Tất cả khối ({allowedGradesForActor.join(', ')})
                  </option>
                  {allowedGradesForActor.map((g) => (
                    <option key={g} value={g}>
                      Khối lớp {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Môn học / HĐGD phụ trách
                </label>
                <select
                  value={curSubjectFilter}
                  onChange={(e) => setCurSubjectFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="ALL">Tất cả môn phụ trách</option>
                  {allowedSubjectsForActor.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Học kỳ
                </label>
                <select
                  value={curSemesterFilter}
                  onChange={(e) =>
                    setCurSemesterFilter(
                      e.target.value as 'ALL' | 'HK1' | 'HK2'
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="ALL">Cả năm học (Tuần 1 – 35)</option>
                  <option value="HK1">Học kỳ I (Tuần 1 – 18)</option>
                  <option value="HK2">Học kỳ II (Tuần 19 – 35)</option>
                </select>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tìm kiếm bài học / yêu cầu cần đạt
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={curSearchKeyword}
                    onChange={(e) => setCurSearchKeyword(e.target.value)}
                    placeholder="Nhập tên chủ đề, bài học, mã YCCĐ..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Biểu mẫu bổ sung Chủ đề / Bài học chính thức (giới hạn đúng Khối & Môn của Giáo viên) */}
          {showAddTopicForm && (
            <form
              onSubmit={handleCreateOfficialTopic}
              className="bg-white border-2 border-blue-600 rounded-xl p-6 space-y-4 shadow-xs"
            >
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Bổ sung Chủ đề / Bài học & Yêu cầu cần đạt vào Chương trình chính thức
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Liên kết trực tiếp với Ngân hàng câu hỏi và Ma trận đề kiểm tra của trường ({effectiveSchoolName}).
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  Các mục (*) là bắt buộc
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp (*)
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) =>
                      setFormGrade(Number(e.target.value) as GradeNumber)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    {allowedGradesForActor.map((g) => (
                      <option key={g} value={g}>
                        Khối lớp {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học / HĐGD (*)
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    {allowedSubjectsForFormGrade.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Học kỳ
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) =>
                      setFormSemester(
                        e.target.value as 'HK1' | 'HK2' | 'CA_NAM'
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    <option value="HK1">Học kỳ I</option>
                    <option value="HK2">Học kỳ II</option>
                    <option value="CA_NAM">Cả năm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tuần thực hiện
                  </label>
                  <input
                    type="text"
                    value={formWeekRange}
                    onChange={(e) => setFormWeekRange(e.target.value)}
                    placeholder="VD: Tuần 5"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã chủ đề (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formChapterCode}
                    onChange={(e) => setFormChapterCode(e.target.value)}
                    placeholder="VD: CĐ1"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Chủ đề / Mạch nội dung (*)
                  </label>
                  <input
                    type="text"
                    value={formChapterTitle}
                    onChange={(e) => setFormChapterTitle(e.target.value)}
                    placeholder="Nhập tên chương / chủ đề..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Tên bài học (*)
                  </label>
                  <input
                    type="text"
                    value={formTopicTitle}
                    onChange={(e) => setFormTopicTitle(e.target.value)}
                    placeholder="Nhập tên bài học..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phân môn / Tiết cụ thể
                  </label>
                  <input
                    type="text"
                    value={formSubLessonName}
                    onChange={(e) => setFormSubLessonName(e.target.value)}
                    placeholder="Tùy chọn..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời lượng (*)
                    </label>
                    <input
                      type="text"
                      value={formDurationText}
                      onChange={(e) => setFormDurationText(e.target.value)}
                      placeholder="1 tiết"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số tiết
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formPeriodsCount}
                      onChange={(e) =>
                        setFormPeriodsCount(Math.max(1, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Yêu cầu cần đạt / Nội dung điều chỉnh, tích hợp (*)
                  </label>
                  <textarea
                    rows={3}
                    value={formOutcomeDesc}
                    onChange={(e) => setFormOutcomeDesc(e.target.value)}
                    placeholder="Nhập yêu cầu cần đạt theo Chương trình GDPT 2018..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã YCCĐ
                    </label>
                    <input
                      type="text"
                      value={formOutcomeCode}
                      onChange={(e) => setFormOutcomeCode(e.target.value)}
                      placeholder="Tùy chọn..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={formNoteText}
                      onChange={(e) => setFormNoteText(e.target.value)}
                      placeholder="Ghi chú..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  Lưu vào Chương trình chính thức
                </button>
              </div>
            </form>
          )}

          {/* Hiển thị Bảng Kế hoạch dạy học hoặc Danh sách Mạch chủ đề */}
          {curriculumViewMode === 'TABLE_2345' ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bảng Phân phối Chương trình & Yêu cầu cần đạt ({effectiveSchoolName})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tuần · Chủ đề / Mạch nội dung · Tên bài học · Tiết học / Thời lượng · Yêu cầu cần đạt
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {flattenedLessonRows.length} bài học / tiết dạy
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-blue-950 text-white">
                      <th className="py-3 px-3 text-center font-bold border-r border-blue-800 w-24">
                        Tuần / Khối
                      </th>
                      <th className="py-3 px-4 text-left font-bold border-r border-blue-800 w-60">
                        Chủ đề / Mạch nội dung
                      </th>
                      <th className="py-3 px-4 text-left font-bold border-r border-blue-800 w-64">
                        Tên bài học
                      </th>
                      <th className="py-3 px-3 text-center font-bold border-r border-blue-800 w-32">
                        Thời lượng
                      </th>
                      <th className="py-3 px-4 text-left font-bold">
                        Yêu cầu cần đạt / Nội dung tích hợp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {flattenedLessonRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-slate-500"
                        >
                          Chưa có bài học nào khớp với bộ lọc môn học / khối lớp đang chọn.
                        </td>
                      </tr>
                    ) : (
                      flattenedLessonRows.map(({ topic, lesson }) => (
                        <tr
                          key={lesson.id}
                          className="hover:bg-blue-50/40 align-top transition-colors"
                        >
                          <td className="py-3 px-3 text-center font-mono font-bold text-blue-900 border-r border-slate-200 bg-slate-50/50">
                            <div>
                              {lesson.week.startsWith('Tuần')
                                ? lesson.week
                                : `Tuần ${lesson.week}`}
                            </div>
                            <div className="text-[10px] font-sans font-medium text-slate-500 mt-0.5">
                              Khối {topic.grade} ·{' '}
                              {topic.semester === 'HK2' ? 'HKII' : 'HKI'}
                            </div>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200">
                            <div className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 mb-1">
                              {topic.subject} · {topic.chapterCode}
                            </div>
                            <div className="font-bold text-slate-900 leading-snug">
                              {topic.chapterTitle}
                            </div>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200">
                            <div className="font-semibold text-slate-900">
                              {lesson.lessonName}
                            </div>
                            {lesson.subLessonName && (
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                {lesson.subLessonName}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800 border-r border-slate-200">
                            {lesson.periodAllocation}
                          </td>
                          <td className="py-3 px-4 text-slate-700 leading-relaxed">
                            <div>{lesson.adjustedContent}</div>
                            {lesson.integrationTags &&
                              lesson.integrationTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {lesson.integrationTags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-800"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCurriculumTopics.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                  Không có mạch chủ đề nào khớp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredCurriculumTopics.map((topic) => {
                  const isExpanded = expandedTopicIds[topic.id] ?? true;
                  return (
                    <div
                      key={topic.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTopicIds((prev) => ({
                            ...prev,
                            [topic.id]: !isExpanded,
                          }))
                        }
                        className="w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold">
                              Khối {topic.grade} · {topic.subject}
                            </span>
                            <span className="font-mono text-slate-500">
                              {topic.chapterCode}
                            </span>
                            <span className="font-bold text-slate-900">
                              {topic.chapterTitle}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {topic.topicTitle}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-5 divide-y divide-slate-100 text-xs">
                          {topic.learningOutcomes.map((lo) => (
                            <div
                              key={lo.code}
                              className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-2"
                            >
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-semibold text-slate-700 shrink-0">
                                {lo.code}
                              </span>
                              <span className="text-slate-700 leading-relaxed">
                                {lo.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL XÁC NHẬN LÀM SẠCH DỮ LIỆU MẪU */}
      {showCleanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Làm sạch dữ liệu mẫu tại Công việc của tôi
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Hệ thống sẽ rà soát và xóa triệt để toàn bộ câu hỏi mẫu, ma trận mẫu, đề kiểm tra mẫu, hồ sơ quy trình thử nghiệm và công việc giả lập còn sót trên máy chủ và trình duyệt.
                </p>
                <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-2.5">
                  An toàn 100%: Toàn bộ phân công giảng dạy thực tế, chương trình GDPT 2018 chính thức và câu hỏi / ma trận / đề thật do giáo viên biên soạn được giữ nguyên.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isCleaning}
                onClick={() => setShowCleanModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={isCleaning}
                onClick={() => void handleConfirmCleanSampleData()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isCleaning
                    ? 'Đang làm sạch...'
                    : 'Xác nhận làm sạch chính thức'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
