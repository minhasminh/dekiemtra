import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCheck,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  AuthenticatedUserSession,
  ExamMatrix,
  ExamPaper,
  GradeNumber,
  MenuSectionId,
  MyAssignedTaskItem,
  MyAssignedTaskStatus,
  PrincipalNotificationDigestGroupItem,
  QuestionItem,
  SchoolBrandingConfig,
  StorageConfig,
  TeacherPermissionProfileSummary,
  ToastNotification,
  WorkflowActorRole,
  WorkflowNotificationCategoryGroup,
  WorkflowNotificationItem,
  WorkflowNotificationPriority,
} from '../types/domain';
import {
  isSampleOrTestWorkflowDossier,
  loadSavedWorkflows,
  purgeAllSampleWorkflowsFromLocal,
} from '../services/workflow/endToEndExamWorkflowService';
import {
  buildNotificationActorFromSession,
  buildPrincipalNotificationDigest,
  cleanSampleNotificationsEverywhere,
  deriveOfficialWorkflowNotificationsForActor,
  isAssignedTaskVisibleToActor,
  isNotificationVisibleToActor,
  loadNotificationsAndTasks,
  markNotificationReadStatus,
  NOTIFICATION_CATEGORY_LABELS,
  syncOfficialNotificationsFromServer,
  updateAssignedTaskStatusLocal,
  verifyAndOpenDossierFromNotification,
} from '../services/workflow/workflowNotificationCenterService';

const PRIORITY_TEXT_STYLES: Record<WorkflowNotificationPriority, string> = {
  URGENT: 'text-rose-700 font-semibold',
  HIGH: 'text-amber-700 font-semibold',
  MEDIUM: 'text-blue-700 font-medium',
  LOW: 'text-slate-600 font-medium',
};

const PRIORITY_LABELS: Record<WorkflowNotificationPriority, string> = {
  URGENT: 'Khẩn cấp',
  HIGH: 'Ưu tiên cao',
  MEDIUM: 'Thông thường',
  LOW: 'Thông tin',
};

const TASK_STATUS_LABELS: Record<MyAssignedTaskStatus, string> = {
  PENDING: 'Chờ thực hiện',
  IN_PROGRESS: 'Đang thực hiện',
  OVERDUE: 'Quá hạn',
  COMPLETED: 'Đã hoàn thành',
};

const TASK_STATUS_TEXT_STYLES: Record<MyAssignedTaskStatus, string> = {
  PENDING: 'text-amber-700 font-medium',
  IN_PROGRESS: 'text-blue-700 font-medium',
  OVERDUE: 'text-rose-700 font-semibold',
  COMPLETED: 'text-emerald-700 font-medium',
};

function formatDateTimeVi(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateVi(dateStr?: string): string {
  if (!dateStr) return '—';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}/${m}/${y}`;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ============================================================================
// 1. BIỂU TƯỢNG CHUÔNG TRÊN THANH ĐIỀU HƯỚNG
// ============================================================================

interface NotificationBellDropdownProps {
  authSession?: AuthenticatedUserSession | null;
  actorRole?: WorkflowActorRole;
  questions?: QuestionItem[];
  matrices?: ExamMatrix[];
  exams?: ExamPaper[];
  onOpenWorkflowDossier: (workflowId: string, menuId: MenuSectionId) => void;
  onOpenNotificationCenterPage: () => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({
  authSession,
  actorRole,
  questions = [],
  matrices = [],
  exams = [],
  onOpenWorkflowDossier,
  onOpenNotificationCenterPage,
  onNotify,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storedNotifications, setStoredNotifications] = useState<WorkflowNotificationItem[]>(
    () => loadNotificationsAndTasks().notifications
  );
  const [readDerivedIds, setReadDerivedIds] = useState<Set<string>>(() => new Set());
  const [selectedCategory, setSelectedCategory] = useState<
    WorkflowNotificationCategoryGroup | 'ALL'
  >('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeActor = useMemo(
    () => buildNotificationActorFromSession(authSession, actorRole || 'TEACHER'),
    [authSession, actorRole]
  );

  const officialWorkflows = useMemo(() => {
    return loadSavedWorkflows(questions, matrices, exams).filter(
      (w) => !isSampleOrTestWorkflowDossier(w)
    );
  }, [questions, matrices, exams]);

  const refreshData = useCallback(async () => {
    const synced = await syncOfficialNotificationsFromServer();
    setStoredNotifications(synced.notifications);
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (isOpen) {
      void refreshData();
    }
  }, [isOpen, refreshData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleNotifications = useMemo(() => {
    const baseVisible = storedNotifications.filter((n) =>
      isNotificationVisibleToActor(n, activeActor)
    );
    const derived = deriveOfficialWorkflowNotificationsForActor({
      actor: activeActor,
      existingNotifications: baseVisible,
      workflows: officialWorkflows,
      exams,
      matrices,
    }).map((d) =>
      readDerivedIds.has(d.notificationId) ? { ...d, isRead: true } : d
    );

    return [...derived, ...baseVisible].sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
  }, [storedNotifications, activeActor, officialWorkflows, exams, matrices, readDerivedIds]);

  const filteredNotifications = useMemo(() => {
    return visibleNotifications.filter((n) => {
      if (selectedCategory !== 'ALL' && n.categoryGroup !== selectedCategory) {
        return false;
      }
      if (unreadOnly && n.isRead) {
        return false;
      }
      return true;
    });
  }, [visibleNotifications, selectedCategory, unreadOnly]);

  const unreadCount = useMemo(
    () => visibleNotifications.filter((n) => !n.isRead).length,
    [visibleNotifications]
  );

  const handleMarkOneRead = async (notif: WorkflowNotificationItem) => {
    if (
      notif.notificationId.startsWith('NOTIF-WF-') ||
      notif.notificationId.startsWith('NOTIF-EXAM-') ||
      notif.notificationId.startsWith('NOTIF-MAT-')
    ) {
      setReadDerivedIds((prev) => new Set(prev).add(notif.notificationId));
      return;
    }
    const updated = await markNotificationReadStatus({
      notificationId: notif.notificationId,
    });
    setStoredNotifications(updated);
  };

  const handleMarkAllRead = async () => {
    const isLeadership = ['PRINCIPAL', 'VICE_PRINCIPAL', 'SYSTEM_ADMIN'].includes(
      activeActor.role
    );
    const updated = await markNotificationReadStatus(
      isLeadership
        ? { markAll: true }
        : {
            markAllForUserId: activeActor.userId,
            markAllForUserName: activeActor.fullName,
          }
    );
    setStoredNotifications(updated);
    setReadDerivedIds((prev) => {
      const next = new Set(prev);
      visibleNotifications.forEach((n) => next.add(n.notificationId));
      return next;
    });
    onNotify(
      'success',
      'Đã đánh dấu đã đọc',
      'Tất cả thông báo của thầy/cô đã được cập nhật trạng thái đã đọc.'
    );
  };

  const handleOpenDossierClick = async (notif: WorkflowNotificationItem) => {
    const res = await verifyAndOpenDossierFromNotification({
      notification: notif,
      actor: activeActor,
    });
    await handleMarkOneRead(notif);

    if (!res.allowed) {
      onNotify('error', 'Không có quyền truy cập hồ sơ', res.message);
      return;
    }

    setIsOpen(false);
    onOpenWorkflowDossier(notif.workflowId, notif.targetPath.menuId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Thông báo chuyên môn của tôi"
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
          isOpen
            ? 'border-blue-600 bg-blue-50 text-blue-900'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
        }`}
        aria-label="Thông báo chuyên môn"
      >
        <Bell className="w-4 h-4 text-blue-700" />
        <span className="hidden md:inline">Thông báo</span>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold tabular-nums text-white bg-rose-600 rounded-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] max-w-[94vw] bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Thông báo của tôi</div>
              <div className="text-xs text-slate-300 mt-0.5 truncate tabular-nums">
                {activeActor.fullName} · Chưa đọc: {unreadCount}/{visibleNotifications.length}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-100 flex items-center gap-1 cursor-pointer"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đọc hết</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'MATRIX_GROUP', label: 'Ma trận' },
                  { id: 'EXAM_AI_GROUP', label: 'Đề kiểm tra' },
                  { id: 'REVIEW_GROUP', label: 'Thẩm định' },
                  { id: 'APPROVAL_GROUP', label: 'Phê duyệt' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(tab.id as WorkflowNotificationCategoryGroup | 'ALL')
                    }
                    className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                      selectedCategory === tab.id
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setUnreadOnly((prev) => !prev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer transition-colors ${
                  unreadOnly
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {unreadOnly ? 'Chưa đọc' : 'Chỉ chưa đọc'}
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Chưa có thông báo mới
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Các thông báo phân công ra đề, góp ý thẩm định và phê duyệt hồ sơ sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              filteredNotifications.slice(0, 12).map((n) => (
                <div
                  key={n.notificationId}
                  className={`p-3.5 transition-colors ${
                    n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className={PRIORITY_TEXT_STYLES[n.priority]}>
                        {PRIORITY_LABELS[n.priority]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">
                        {n.subjectId} · Khối {n.gradeId}
                      </span>
                    </div>
                    <span className="shrink-0 tabular-nums">
                      {formatDateTimeVi(n.createdAt)}
                    </span>
                  </div>

                  <p
                    className={`text-xs mt-1 leading-snug ${
                      n.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-semibold'
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {n.content}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 truncate">
                      Từ: {n.senderName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => void handleMarkOneRead(n)}
                          className="px-2 py-1 text-[11px] rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Đã đọc
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleOpenDossierClick(n)}
                        className="px-2.5 py-1 text-[11px] rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Mở hồ sơ</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 truncate">{activeActor.departmentName}</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNotificationCenterPage();
              }}
              className="text-blue-700 hover:text-blue-900 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Xem tất cả thông báo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. KHÔNG GIAN LÀM VIỆC CHÍNH THỨC: MỤC 10. THÔNG BÁO
// ============================================================================

type WorkspaceTabId = 'MY_NOTIFICATIONS' | 'MY_TASKS' | 'SCHOOL_DIGEST';

interface WorkflowNotificationCenterWorkspaceProps {
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  config?: StorageConfig;
  authSession?: AuthenticatedUserSession | null;
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  schoolBranding?: SchoolBrandingConfig | null;
  schoolAllowedGrades?: number[];
  actorRole?: WorkflowActorRole;
  onOpenWorkflowDossier: (workflowId: string, menuId: MenuSectionId) => void;
  onCleanSampleData?: () => {
    removedTopics?: number;
    removedExams: number;
    removedMatrices: number;
    removedQuestions: number;
  };
  onNavigate?: (menuId: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

export const WorkflowNotificationCenterWorkspace: React.FC<
  WorkflowNotificationCenterWorkspaceProps
> = ({
  questions,
  matrices,
  exams,
  config,
  authSession,
  teacherPermissionProfile,
  schoolBranding,
  schoolAllowedGrades,
  actorRole,
  onOpenWorkflowDossier,
  onCleanSampleData,
  onNavigate,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('MY_NOTIFICATIONS');
  const [storedNotifications, setStoredNotifications] = useState<WorkflowNotificationItem[]>(
    () => loadNotificationsAndTasks().notifications
  );
  const [storedTasks, setStoredTasks] = useState<MyAssignedTaskItem[]>(
    () => loadNotificationsAndTasks().tasks
  );
  const [readDerivedIds, setReadDerivedIds] = useState<Set<string>>(() => new Set());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCleanModalOpen, setIsCleanModalOpen] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);

  // Bộ lọc
  const [categoryFilter, setCategoryFilter] = useState<
    WorkflowNotificationCategoryGroup | 'ALL'
  >('ALL');
  const [unreadFilter, setUnreadFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<GradeNumber | 'ALL'>('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'ALL' | 'OPEN' | 'COMPLETED'>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeActor = useMemo(
    () => buildNotificationActorFromSession(authSession, actorRole || 'TEACHER'),
    [authSession, actorRole]
  );

  const isSchoolLeadership = useMemo(
    () =>
      ['PRINCIPAL', 'VICE_PRINCIPAL', 'SYSTEM_ADMIN'].includes(
        String(actorRole || activeActor.role)
      ),
    [actorRole, activeActor.role]
  );

  useEffect(() => {
    if (!isSchoolLeadership && activeTab === 'SCHOOL_DIGEST') {
      setActiveTab('MY_NOTIFICATIONS');
    }
  }, [isSchoolLeadership, activeTab]);

  const syncData = useCallback(async (showFeedback = false) => {
    setIsSyncing(true);
    try {
      await cleanSampleNotificationsEverywhere();
      const synced = await syncOfficialNotificationsFromServer();
      setStoredNotifications(synced.notifications);
      setStoredTasks(synced.tasks);
      if (showFeedback) {
        onNotify(
          'info',
          'Đã đồng bộ thông báo',
          'Danh sách thông báo và nhắc việc đã được cập nhật mới nhất.'
        );
      }
    } finally {
      setIsSyncing(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void syncData(false);
  }, [syncData]);

  // Danh sách khối lớp hợp lệ của trường và phân công giáo viên
  const availableGrades = useMemo<GradeNumber[]>(() => {
    const teacherGrades = new Set<GradeNumber>();
    (teacherPermissionProfile?.subjectAllocations || []).forEach((alloc) => {
      (alloc.grades || []).forEach((g) => teacherGrades.add(g as GradeNumber));
    });

    const baseSchoolGrades: GradeNumber[] =
      schoolAllowedGrades && schoolAllowedGrades.length > 0
        ? schoolAllowedGrades.map((g) => g as GradeNumber)
        : ([1, 2, 3, 4, 5, 6, 7, 8, 9] as GradeNumber[]);

    if (!isSchoolLeadership && teacherGrades.size > 0) {
      const intersection = baseSchoolGrades.filter((g) => teacherGrades.has(g));
      if (intersection.length > 0) {
        return intersection;
      }
    }
    return baseSchoolGrades;
  }, [teacherPermissionProfile, schoolAllowedGrades, isSchoolLeadership]);

  // Hồ sơ quy trình chính thức (tuyệt đối không lấy dữ liệu mẫu/kiểm thử)
  const officialWorkflows = useMemo(() => {
    return loadSavedWorkflows(questions, matrices, exams).filter(
      (w) => !isSampleOrTestWorkflowDossier(w)
    );
  }, [questions, matrices, exams]);

  // Thông báo chính thức hiển thị cho người dùng đang đăng nhập
  const myOfficialNotifications = useMemo(() => {
    const allowedSet = new Set<number>(
      schoolAllowedGrades && schoolAllowedGrades.length > 0
        ? schoolAllowedGrades
        : [1, 2, 3, 4, 5, 6, 7, 8, 9]
    );

    const baseVisible = storedNotifications.filter(
      (n) =>
        isNotificationVisibleToActor(n, activeActor) &&
        (!n.gradeId || allowedSet.has(n.gradeId))
    );

    const derived = deriveOfficialWorkflowNotificationsForActor({
      actor: activeActor,
      existingNotifications: baseVisible,
      workflows: officialWorkflows,
      exams,
      matrices,
    })
      .filter((d) => !d.gradeId || allowedSet.has(d.gradeId))
      .map((d) =>
        readDerivedIds.has(d.notificationId) ? { ...d, isRead: true } : d
      );

    return [...derived, ...baseVisible].sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
  }, [
    storedNotifications,
    activeActor,
    officialWorkflows,
    exams,
    matrices,
    readDerivedIds,
    schoolAllowedGrades,
  ]);

  const myOfficialTasks = useMemo(() => {
    const allowedSet = new Set<number>(
      schoolAllowedGrades && schoolAllowedGrades.length > 0
        ? schoolAllowedGrades
        : [1, 2, 3, 4, 5, 6, 7, 8, 9]
    );
    const todayIso = new Date().toISOString().slice(0, 10);

    return storedTasks
      .filter(
        (t) =>
          isAssignedTaskVisibleToActor(t, activeActor) &&
          (!t.gradeId || allowedSet.has(t.gradeId))
      )
      .map((t) => {
        if (t.status !== 'COMPLETED' && t.dueDate && t.dueDate < todayIso) {
          return { ...t, status: 'OVERDUE' as MyAssignedTaskStatus };
        }
        return t;
      });
  }, [storedTasks, activeActor, schoolAllowedGrades]);

  const availableSubjects = useMemo<string[]>(() => {
    const subjectSet = new Set<string>();
    (teacherPermissionProfile?.subjectAllocations || []).forEach((alloc) => {
      if (alloc.subjectName) subjectSet.add(alloc.subjectName);
    });
    myOfficialNotifications.forEach((n) => {
      if (n.subjectId) subjectSet.add(n.subjectId);
    });
    myOfficialTasks.forEach((t) => {
      if (t.subjectId) subjectSet.add(t.subjectId);
    });
    return Array.from(subjectSet).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [teacherPermissionProfile, myOfficialNotifications, myOfficialTasks]);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return myOfficialNotifications.filter((n) => {
      if (categoryFilter !== 'ALL' && n.categoryGroup !== categoryFilter) {
        return false;
      }
      if (unreadFilter === 'UNREAD' && n.isRead) {
        return false;
      }
      if (subjectFilter !== 'ALL' && n.subjectId !== subjectFilter) {
        return false;
      }
      if (gradeFilter !== 'ALL' && n.gradeId !== gradeFilter) {
        return false;
      }
      if (q) {
        const haystack = [
          n.title,
          n.content,
          n.dossierTitle,
          n.workflowId,
          n.senderName,
          n.subjectId,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    myOfficialNotifications,
    categoryFilter,
    unreadFilter,
    subjectFilter,
    gradeFilter,
    searchQuery,
  ]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return myOfficialTasks.filter((t) => {
      if (taskStatusFilter === 'OPEN' && t.status === 'COMPLETED') {
        return false;
      }
      if (taskStatusFilter === 'COMPLETED' && t.status !== 'COMPLETED') {
        return false;
      }
      if (subjectFilter !== 'ALL' && t.subjectId !== subjectFilter) {
        return false;
      }
      if (gradeFilter !== 'ALL' && t.gradeId !== gradeFilter) {
        return false;
      }
      if (q) {
        const haystack = [
          t.taskTitle,
          t.dossierTitle,
          t.actionInstruction,
          t.assignedByName,
          t.workflowId,
          t.subjectId,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [myOfficialTasks, taskStatusFilter, subjectFilter, gradeFilter, searchQuery]);

  const principalDigest = useMemo(
    () => buildPrincipalNotificationDigest(officialWorkflows),
    [officialWorkflows]
  );

  // Thống kê tóm tắt
  const unreadCount = useMemo(
    () => myOfficialNotifications.filter((n) => !n.isRead).length,
    [myOfficialNotifications]
  );
  const urgentUnreadCount = useMemo(
    () =>
      myOfficialNotifications.filter(
        (n) => !n.isRead && (n.priority === 'URGENT' || n.priority === 'HIGH')
      ).length,
    [myOfficialNotifications]
  );
  const openTasksCount = useMemo(
    () => myOfficialTasks.filter((t) => t.status !== 'COMPLETED').length,
    [myOfficialTasks]
  );

  const handleMarkOneRead = async (notif: WorkflowNotificationItem) => {
    if (
      notif.notificationId.startsWith('NOTIF-WF-') ||
      notif.notificationId.startsWith('NOTIF-EXAM-') ||
      notif.notificationId.startsWith('NOTIF-MAT-')
    ) {
      setReadDerivedIds((prev) => new Set(prev).add(notif.notificationId));
      return;
    }
    const updated = await markNotificationReadStatus({
      notificationId: notif.notificationId,
    });
    setStoredNotifications(updated);
  };

  const handleMarkAllRead = async () => {
    const updated = await markNotificationReadStatus(
      isSchoolLeadership
        ? { markAll: true }
        : {
            markAllForUserId: activeActor.userId,
            markAllForUserName: activeActor.fullName,
          }
    );
    setStoredNotifications(updated);
    setReadDerivedIds((prev) => {
      const next = new Set(prev);
      myOfficialNotifications.forEach((n) => next.add(n.notificationId));
      return next;
    });
    onNotify(
      'success',
      'Đã đánh dấu tất cả đã đọc',
      'Toàn bộ thông báo hiện tại của thầy/cô đã chuyển sang trạng thái đã đọc.'
    );
  };

  const handleOpenNotificationDossier = async (notif: WorkflowNotificationItem) => {
    const res = await verifyAndOpenDossierFromNotification({
      notification: notif,
      actor: activeActor,
    });
    await handleMarkOneRead(notif);

    if (!res.allowed) {
      onNotify('error', 'Không có quyền mở hồ sơ', res.message);
      return;
    }

    onOpenWorkflowDossier(notif.workflowId, notif.targetPath.menuId);
  };

  const handleToggleTaskComplete = (task: MyAssignedTaskItem) => {
    const nextStatus: MyAssignedTaskStatus =
      task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const updatedTasks = updateAssignedTaskStatusLocal(task.taskId, nextStatus);
    setStoredTasks(updatedTasks);
    onNotify(
      'success',
      nextStatus === 'COMPLETED'
        ? 'Đã đánh dấu hoàn thành nhắc việc'
        : 'Đã mở lại nhắc việc',
      task.taskTitle
    );
  };

  const handleConfirmCleanSamples = async () => {
    setIsCleaning(true);
    try {
      const serverAndLocalNotifs = await cleanSampleNotificationsEverywhere();
      const removedWf = purgeAllSampleWorkflowsFromLocal();
      const globalResult = onCleanSampleData ? onCleanSampleData() : null;

      const synced = await syncOfficialNotificationsFromServer();
      setStoredNotifications(synced.notifications);
      setStoredTasks(synced.tasks);
      setIsCleanModalOpen(false);

      const totalRemoved =
        serverAndLocalNotifs.removedNotifications +
        serverAndLocalNotifs.removedTasks +
        removedWf +
        (globalResult
          ? globalResult.removedExams +
            globalResult.removedMatrices +
            globalResult.removedQuestions
          : 0);

      onNotify(
        'success',
        'Đã làm sạch dữ liệu mẫu',
        totalRemoved > 0
          ? `Đã gỡ bỏ ${totalRemoved} bản ghi mẫu/thử nghiệm. Hệ thống chỉ giữ lại thông báo và hồ sơ chính thức.`
          : 'Không còn dữ liệu mẫu tồn đọng. Mục Thông báo đang vận hành với dữ liệu chính thức.'
      );
    } finally {
      setIsCleaning(false);
    }
  };

  const resetFilters = () => {
    setCategoryFilter('ALL');
    setUnreadFilter('ALL');
    setSubjectFilter('ALL');
    setGradeFilter('ALL');
    setTaskStatusFilter('ALL');
    setSearchQuery('');
  };

  const hasActiveFilter =
    categoryFilter !== 'ALL' ||
    unreadFilter !== 'ALL' ||
    subjectFilter !== 'ALL' ||
    gradeFilter !== 'ALL' ||
    taskStatusFilter !== 'ALL' ||
    searchQuery.trim().length > 0;

  const schoolDisplayName =
    schoolBranding?.schoolName || config?.schoolName || 'Nhà trường';
  const academicYearDisplay =
    schoolBranding?.academicYear || config?.academicYear || '2025 - 2026';

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang & thao tác chính */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{schoolDisplayName}</span>
              <span aria-hidden="true">·</span>
              <span>Năm học {academicYearDisplay}</span>
              <span aria-hidden="true">·</span>
              <span>{activeActor.fullName}</span>
              <span aria-hidden="true">·</span>
              <span>{activeActor.departmentName}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Thông báo
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Theo dõi các thông báo phân công chuyên môn, kết quả thẩm định ma trận – đề kiểm tra, yêu cầu chỉnh sửa và phê duyệt hồ sơ của thầy/cô.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void syncData(true)}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCleanModalOpen(true)}
              className="px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Làm sạch dữ liệu mẫu</span>
            </button>
          </div>
        </div>

        {/* Chỉ số tóm tắt */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">Tổng thông báo của tôi</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {myOfficialNotifications.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Thông báo chưa đọc</div>
            <div className="text-2xl font-bold text-blue-700 mt-1 tabular-nums">
              {unreadCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Ưu tiên xử lý sớm</div>
            <div className="text-2xl font-bold text-rose-700 mt-1 tabular-nums">
              {urgentUnreadCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Nhắc việc đang mở</div>
            <div className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">
              {openTasksCount}
            </div>
          </div>
        </div>
      </div>

      {/* Thanh chuyển mục & bộ lọc */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 pt-4 pb-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('MY_NOTIFICATIONS')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'MY_NOTIFICATIONS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thông báo của tôi ({myOfficialNotifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MY_TASKS')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'MY_TASKS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhắc việc từ thông báo ({myOfficialTasks.length})
            </button>

            {isSchoolLeadership && (
              <button
                type="button"
                onClick={() => setActiveTab('SCHOOL_DIGEST')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'SCHOOL_DIGEST'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tổng hợp toàn trường
              </button>
            )}
          </div>

          {activeTab !== 'SCHOOL_DIGEST' && (
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tiêu đề, môn học, mã hồ sơ..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          )}
        </div>

        {/* Bộ lọc chi tiết */}
        {activeTab !== 'SCHOOL_DIGEST' && (
          <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === 'MY_NOTIFICATIONS' ? (
                <>
                  <select
                    aria-label="Lọc nhóm thông báo"
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(
                        e.target.value as WorkflowNotificationCategoryGroup | 'ALL'
                      )
                    }
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
                  >
                    <option value="ALL">Tất cả nhóm thông báo</option>
                    {(
                      Object.keys(
                        NOTIFICATION_CATEGORY_LABELS
                      ) as WorkflowNotificationCategoryGroup[]
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {NOTIFICATION_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>

                  <div className="inline-flex items-center p-0.5 bg-slate-200/70 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setUnreadFilter('ALL')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                        unreadFilter === 'ALL'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnreadFilter('UNREAD')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                        unreadFilter === 'UNREAD'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Chưa đọc ({unreadCount})
                    </button>
                  </div>
                </>
              ) : (
                <div className="inline-flex items-center p-0.5 bg-slate-200/70 rounded-lg">
                  {[
                    { id: 'ALL', label: 'Tất cả nhắc việc' },
                    { id: 'OPEN', label: `Đang mở (${openTasksCount})` },
                    { id: 'COMPLETED', label: 'Đã hoàn thành' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setTaskStatusFilter(st.id as 'ALL' | 'OPEN' | 'COMPLETED')
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                        taskStatusFilter === st.id
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              )}

              <select
                aria-label="Lọc môn học"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="ALL">Tất cả môn học</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    Môn {s}
                  </option>
                ))}
              </select>

              <select
                aria-label="Lọc khối lớp"
                value={gradeFilter}
                onChange={(e) =>
                  setGradeFilter(
                    e.target.value === 'ALL'
                      ? 'ALL'
                      : (Number(e.target.value) as GradeNumber)
                  )
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="ALL">Tất cả khối lớp</option>
                {availableGrades.map((g) => (
                  <option key={g} value={g}>
                    Khối {g}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 1: THÔNG BÁO CỦA TÔI */}
        {activeTab === 'MY_NOTIFICATIONS' && (
          <div>
            {filteredNotifications.length === 0 ? (
              <div className="px-6 py-14 text-center max-w-lg mx-auto">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <h2 className="text-base font-semibold text-slate-900">
                  {hasActiveFilter
                    ? 'Không tìm thấy thông báo phù hợp với bộ lọc'
                    : 'Hiện chưa có thông báo chuyên môn nào'}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  {hasActiveFilter
                    ? 'Thầy/cô có thể xóa bộ lọc để xem toàn bộ danh sách thông báo chính thức.'
                    : 'Khi Ban Giám hiệu hoặc Tổ trưởng chuyên môn phân công ra đề, phản biện hoặc phê duyệt hồ sơ, thông báo sẽ hiển thị trực tiếp tại đây.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                  {hasActiveFilter ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      Hiển thị tất cả thông báo
                    </button>
                  ) : (
                    onNavigate && (
                      <>
                        <button
                          type="button"
                          onClick={() => onNavigate('curriculum')}
                          className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Mở Công việc của tôi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('records')}
                          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Xem Hồ sơ của tôi
                        </button>
                      </>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((n) => (
                  <div
                    key={n.notificationId}
                    className={`p-6 transition-colors ${
                      n.isRead ? 'bg-white hover:bg-slate-50/70' : 'bg-blue-50/30 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className={PRIORITY_TEXT_STYLES[n.priority]}>
                            {PRIORITY_LABELS[n.priority]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{NOTIFICATION_CATEGORY_LABELS[n.categoryGroup]}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Môn {n.subjectId} · Khối {n.gradeId}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {formatDateTimeVi(n.createdAt)}
                          </span>
                          {!n.isRead && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-blue-700 font-semibold">Mới</span>
                            </>
                          )}
                        </div>

                        <h3
                          className={`text-base leading-snug ${
                            n.isRead
                              ? 'text-slate-800 font-medium'
                              : 'text-slate-950 font-bold'
                          }`}
                        >
                          {n.title}
                        </h3>

                        <p className="text-sm text-slate-600 leading-relaxed">
                          {n.content}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                          <span>Người gửi: {n.senderName}</span>
                          <span aria-hidden="true">·</span>
                          <span>Hồ sơ: {n.dossierTitle}</span>
                          {n.requiredAction?.dueDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                Hạn xử lý: {formatDateVi(n.requiredAction.dueDate)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void handleOpenNotificationDossier(n)}
                          className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>
                            {n.requiredAction?.actionLabel || 'Mở hồ sơ liên quan'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => void handleMarkOneRead(n)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đánh dấu đã đọc</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 2: NHẮC VIỆC TỪ THÔNG BÁO */}
        {activeTab === 'MY_TASKS' && (
          <div>
            {filteredTasks.length === 0 ? (
              <div className="px-6 py-14 text-center max-w-lg mx-auto">
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <h2 className="text-base font-semibold text-slate-900">
                  {hasActiveFilter
                    ? 'Không có nhắc việc phù hợp với bộ lọc'
                    : 'Hiện không có nhắc việc tồn đọng'}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Các đầu việc phát sinh từ thông báo quy trình ra đề và thẩm định của thầy/cô sẽ được tổng hợp tại đây để tiện theo dõi hạn hoàn thành.
                </p>
                {onNavigate && !hasActiveFilter && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => onNavigate('curriculum')}
                      className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem toàn bộ Công việc của tôi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-6">Nội dung công việc</th>
                      <th className="py-3 px-4">Môn · Khối</th>
                      <th className="py-3 px-4">Người giao</th>
                      <th className="py-3 px-4">Hạn xử lý</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTasks.map((task) => (
                      <tr key={task.taskId} className="hover:bg-slate-50/70">
                        <td className="py-4 px-6 max-w-md">
                          <div className="font-semibold text-slate-900">
                            {task.taskTitle}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {task.dossierTitle}
                          </div>
                          {task.actionInstruction && (
                            <div className="text-xs text-slate-600 mt-1">
                              {task.actionInstruction}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap">
                          Môn {task.subjectId} · Khối {task.gradeId}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap">
                          {task.assignedByName}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap tabular-nums">
                          {formatDateVi(task.dueDate)}
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          <span className={TASK_STATUS_TEXT_STYLES[task.status]}>
                            {TASK_STATUS_LABELS[task.status]}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskComplete(task)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                            >
                              {task.status === 'COMPLETED' ? 'Mở lại' : 'Hoàn thành'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onOpenWorkflowDossier(
                                  task.workflowId,
                                  task.targetMenuId
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Mở hồ sơ</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 3: TỔNG HỢP TOÀN TRƯỜNG (CHỈ HIỂN THỊ CHO BGH / QUẢN TRỊ) */}
        {activeTab === 'SCHOOL_DIGEST' && isSchoolLeadership && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'Hồ sơ chờ phê duyệt',
                  items: principalDigest.pendingApprovalDossiers,
                  menuId: 'exam-workflow' as MenuSectionId,
                },
                {
                  title: 'Hồ sơ quá hạn hoàn thành',
                  items: principalDigest.overdueDossiers,
                  menuId: 'bgh-progress-tracking' as MenuSectionId,
                },
                {
                  title: 'Hồ sơ cần khắc phục lỗi chuyên môn',
                  items: principalDigest.criticalAiErrorDossiers,
                  menuId: 'exam-workflow' as MenuSectionId,
                },
                {
                  title: 'Hồ sơ chờ biên bản thẩm định',
                  items: principalDigest.unreviewedDossiers,
                  menuId: 'exam-workflow' as MenuSectionId,
                },
                {
                  title: 'Hồ sơ cần bổ sung đáp án / hướng dẫn chấm',
                  items: principalDigest.missingAnswerKeyDossiers,
                  menuId: 'exam-workflow' as MenuSectionId,
                },
                {
                  title: 'Hồ sơ đã phê duyệt chính thức',
                  items: principalDigest.completedDossiers,
                  menuId: 'records' as MenuSectionId,
                },
              ].map((group) => (
                <div
                  key={group.title}
                  className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {group.title}
                      </h3>
                      <span className="text-lg font-bold text-slate-900 tabular-nums">
                        {group.items.length}
                      </span>
                    </div>

                    {group.items.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        Không có hồ sơ nào trong nhóm này.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                        {group.items.map((item: PrincipalNotificationDigestGroupItem) => (
                          <div key={item.workflowId} className="py-2.5 space-y-1">
                            <div className="text-xs font-semibold text-slate-900">
                              {item.dossierTitle}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Môn {item.subjectId} · Khối {item.gradeId} · GV:{' '}
                              {item.teacherName}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              {item.detailSafeNote}
                            </div>
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenWorkflowDossier(item.workflowId, group.menuId)
                                }
                                className="text-[11px] font-semibold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Mở hồ sơ</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hộp thoại xác nhận làm sạch dữ liệu mẫu */}
      {isCleanModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clean-notif-modal-title"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="clean-notif-modal-title"
                  className="text-base font-bold text-slate-900"
                >
                  Làm sạch dữ liệu mẫu trong mục Thông báo
                </h2>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Thao tác này sẽ kiểm tra và xóa toàn bộ thông báo mẫu, nhắc việc thử nghiệm và hồ sơ giả lập trên trình duyệt cũng như máy chủ, giữ nguyên 100% thông báo và hồ sơ chuyên môn chính thức của nhà trường.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCleanModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Đóng hộp thoại"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCleanModalOpen(false)}
                disabled={isCleaning}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCleanSamples()}
                disabled={isCleaning}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isCleaning ? 'Đang làm sạch...' : 'Xác nhận làm sạch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
