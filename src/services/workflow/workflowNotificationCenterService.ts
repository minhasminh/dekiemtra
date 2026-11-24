import {
  ApprovalStatus,
  AuthenticatedUserSession,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ExamWorkflowStepNumber,
  GradeNumber,
  MenuSectionId,
  MyAssignedTaskItem,
  MyAssignedTaskStatus,
  PrincipalNotificationDigestGroupItem,
  PrincipalNotificationDigestSummary,
  WorkflowActorRole,
  WorkflowNotificationCategoryGroup,
  WorkflowNotificationEventType,
  WorkflowNotificationItem,
  WorkflowNotificationPriority,
} from '../../types/domain';
import {
  isSampleOrDemoExam,
  isSampleOrDemoMatrix,
} from '../storage/repository';
import { isSampleOrTestWorkflowDossier } from './endToEndExamWorkflowService';

const NOTIFICATIONS_STORAGE_KEY = 'edutest_workflow_notifications_v17';
const TASKS_STORAGE_KEY = 'edutest_workflow_assigned_tasks_v17';

export interface NotificationEventMetadata {
  eventType: WorkflowNotificationEventType;
  orderNumber: number;
  label: string;
  categoryGroup: WorkflowNotificationCategoryGroup;
  categoryLabel: string;
  defaultPriority: WorkflowNotificationPriority;
  defaultSenderRole: WorkflowActorRole | 'AI_ENGINE' | 'WORKFLOW_SCHEDULER';
  defaultRecipientRole: WorkflowActorRole;
  defaultTargetStep: ExamWorkflowStepNumber;
  defaultTargetMenu: MenuSectionId;
  defaultActionLabel: string;
}

export const NOTIFICATION_CATEGORY_LABELS: Record<WorkflowNotificationCategoryGroup, string> = {
  MATRIX_GROUP: 'Ma trận & Bản đặc tả',
  EXAM_AI_GROUP: 'Soạn đề & Kiểm tra chất lượng',
  REVIEW_GROUP: 'Thẩm định & Phản biện',
  APPROVAL_GROUP: 'Phê duyệt & Phát hành',
  ALERT_RESULT_GROUP: 'Nhắc hạn & Kết quả kiểm tra',
};

export const NOTIFICATION_EVENT_CATALOG: NotificationEventMetadata[] = [
  {
    eventType: 'MATRIX_SUBMITTED_FOR_REVIEW',
    orderNumber: 1,
    label: 'Gửi ma trận chờ thẩm định',
    categoryGroup: 'MATRIX_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.MATRIX_GROUP,
    defaultPriority: 'HIGH',
    defaultSenderRole: 'TEACHER',
    defaultRecipientRole: 'HEAD_OF_DEPARTMENT',
    defaultTargetStep: 2,
    defaultTargetMenu: 'exam-workflow',
    defaultActionLabel: 'Thẩm định & Duyệt ma trận',
  },
  {
    eventType: 'MATRIX_REVISION_REQUESTED',
    orderNumber: 2,
    label: 'Ma trận cần chỉnh sửa',
    categoryGroup: 'MATRIX_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.MATRIX_GROUP,
    defaultPriority: 'HIGH',
    defaultSenderRole: 'HEAD_OF_DEPARTMENT',
    defaultRecipientRole: 'TEACHER',
    defaultTargetStep: 2,
    defaultTargetMenu: 'matrix',
    defaultActionLabel: 'Chỉnh sửa ma trận & đặc tả',
  },
  {
    eventType: 'MATRIX_APPROVED',
    orderNumber: 3,
    label: 'Ma trận đã được phê duyệt',
    categoryGroup: 'MATRIX_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.MATRIX_GROUP,
    defaultPriority: 'MEDIUM',
    defaultSenderRole: 'HEAD_OF_DEPARTMENT',
    defaultRecipientRole: 'TEACHER',
    defaultTargetStep: 3,
    defaultTargetMenu: 'exam-builder',
    defaultActionLabel: 'Tiến hành soạn đề kiểm tra',
  },
  {
    eventType: 'EXAM_DRAFT_COMPLETED',
    orderNumber: 4,
    label: 'Hoàn thành bản nháp đề kiểm tra',
    categoryGroup: 'EXAM_AI_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.EXAM_AI_GROUP,
    defaultPriority: 'MEDIUM',
    defaultSenderRole: 'TEACHER',
    defaultRecipientRole: 'TEACHER',
    defaultTargetStep: 4,
    defaultTargetMenu: 'ai-quality-review',
    defaultActionLabel: 'Kiểm tra chất lượng đề',
  },
  {
    eventType: 'AI_CRITICAL_ERROR_DETECTED',
    orderNumber: 5,
    label: 'Phát hiện lỗi nghiêm trọng trên đề',
    categoryGroup: 'EXAM_AI_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.EXAM_AI_GROUP,
    defaultPriority: 'URGENT',
    defaultSenderRole: 'AI_ENGINE',
    defaultRecipientRole: 'TEACHER',
    defaultTargetStep: 5,
    defaultTargetMenu: 'ai-quality-review',
    defaultActionLabel: 'Rà soát & khắc phục lỗi trên đề',
  },
  {
    eventType: 'EXAM_SUBMITTED_FOR_REVIEW',
    orderNumber: 6,
    label: 'Đề kiểm tra gửi thẩm định',
    categoryGroup: 'REVIEW_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.REVIEW_GROUP,
    defaultPriority: 'HIGH',
    defaultSenderRole: 'TEACHER',
    defaultRecipientRole: 'REVIEWER',
    defaultTargetStep: 6,
    defaultTargetMenu: 'exam-workflow',
    defaultActionLabel: 'Thực hiện thẩm định chuyên môn',
  },
  {
    eventType: 'REVIEWER_ASSIGNED',
    orderNumber: 7,
    label: 'Phân công phản biện chuyên môn',
    categoryGroup: 'REVIEW_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.REVIEW_GROUP,
    defaultPriority: 'HIGH',
    defaultSenderRole: 'HEAD_OF_DEPARTMENT',
    defaultRecipientRole: 'REVIEWER',
    defaultTargetStep: 6,
    defaultTargetMenu: 'approval',
    defaultActionLabel: 'Nhận hồ sơ & phản biện đề',
  },
  {
    eventType: 'REVIEWER_COMMENT_SUBMITTED',
    orderNumber: 8,
    label: 'Có nhận xét phản biện mới',
    categoryGroup: 'REVIEW_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.REVIEW_GROUP,
    defaultPriority: 'HIGH',
    defaultSenderRole: 'REVIEWER',
    defaultRecipientRole: 'HEAD_OF_DEPARTMENT',
    defaultTargetStep: 6,
    defaultTargetMenu: 'exam-workflow',
    defaultActionLabel: 'Xem phiếu nhận xét phản biện',
  },
  {
    eventType: 'DOSSIER_RETURNED_FOR_REVISION',
    orderNumber: 9,
    label: 'Hồ sơ được trả lại để chỉnh sửa',
    categoryGroup: 'REVIEW_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.REVIEW_GROUP,
    defaultPriority: 'URGENT',
    defaultSenderRole: 'REVIEWER',
    defaultRecipientRole: 'TEACHER',
    defaultTargetStep: 5,
    defaultTargetMenu: 'exam-workflow',
    defaultActionLabel: 'Chỉnh sửa hồ sơ & gửi lại',
  },
  {
    eventType: 'DOSSIER_PENDING_APPROVAL',
    orderNumber: 10,
    label: 'Hồ sơ trình chờ phê duyệt',
    categoryGroup: 'APPROVAL_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.APPROVAL_GROUP,
    defaultPriority: 'HIGH',
    defaultSenderRole: 'REVIEWER',
    defaultRecipientRole: 'PRINCIPAL',
    defaultTargetStep: 7,
    defaultTargetMenu: 'exam-workflow',
    defaultActionLabel: 'Phê duyệt chính thức & khóa đề',
  },
  {
    eventType: 'EXAM_APPROVED',
    orderNumber: 11,
    label: 'Đề kiểm tra đã được phê duyệt',
    categoryGroup: 'APPROVAL_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.APPROVAL_GROUP,
    defaultPriority: 'HIGH',
    defaultSenderRole: 'PRINCIPAL',
    defaultRecipientRole: 'TEACHER',
    defaultTargetStep: 8,
    defaultTargetMenu: 'records',
    defaultActionLabel: 'Xem hồ sơ đề chính thức',
  },
  {
    eventType: 'EXAM_RELEASED',
    orderNumber: 12,
    label: 'Đề kiểm tra đã được phát hành',
    categoryGroup: 'APPROVAL_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.APPROVAL_GROUP,
    defaultPriority: 'MEDIUM',
    defaultSenderRole: 'PRINCIPAL',
    defaultRecipientRole: 'HEAD_OF_DEPARTMENT',
    defaultTargetStep: 8,
    defaultTargetMenu: 'records',
    defaultActionLabel: 'Xem bộ hồ sơ đã phát hành',
  },
  {
    eventType: 'DOSSIER_OVERDUE',
    orderNumber: 13,
    label: 'Nhắc hạn hoàn thành hồ sơ',
    categoryGroup: 'ALERT_RESULT_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.ALERT_RESULT_GROUP,
    defaultPriority: 'URGENT',
    defaultSenderRole: 'WORKFLOW_SCHEDULER',
    defaultRecipientRole: 'TEACHER',
    defaultTargetStep: 5,
    defaultTargetMenu: 'curriculum',
    defaultActionLabel: 'Kiểm tra tiến độ & hoàn thiện hồ sơ',
  },
  {
    eventType: 'NEW_TEST_RESULTS_AVAILABLE',
    orderNumber: 14,
    label: 'Có kết quả kiểm tra mới',
    categoryGroup: 'ALERT_RESULT_GROUP',
    categoryLabel: NOTIFICATION_CATEGORY_LABELS.ALERT_RESULT_GROUP,
    defaultPriority: 'MEDIUM',
    defaultSenderRole: 'TEACHER',
    defaultRecipientRole: 'HEAD_OF_DEPARTMENT',
    defaultTargetStep: 9,
    defaultTargetMenu: 'exam-analytics',
    defaultActionLabel: 'Xem thống kê kết quả kiểm tra',
  },
];

export interface NotificationActorAccount {
  userId: string;
  fullName: string;
  role: WorkflowActorRole;
  roleLabel: string;
  departmentName: string;
}

function normalizeIdentityText(raw?: string | null): string {
  return String(raw || '')
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function buildNotificationActorFromSession(
  authSession?: AuthenticatedUserSession | null,
  fallbackRole: WorkflowActorRole = 'TEACHER'
): NotificationActorAccount {
  const user = authSession?.user;
  const activeRole = (user?.activeRole || fallbackRole) as WorkflowActorRole;
  const roleLabelMap: Record<string, string> = {
    PRINCIPAL: 'Hiệu trưởng',
    VICE_PRINCIPAL: 'Phó Hiệu trưởng',
    HEAD_OF_DEPARTMENT: 'Tổ trưởng chuyên môn',
    REVIEWER: 'Giáo viên phản biện',
    TEACHER: 'Giáo viên',
    SYSTEM_ADMIN: 'Quản trị hệ thống',
  };
  return {
    userId: user?.id || 'anonymous-user',
    fullName: user?.fullName || 'Giáo viên',
    role: activeRole,
    roleLabel: roleLabelMap[activeRole] || 'Giáo viên',
    departmentName: user?.departmentName || 'Tổ chuyên môn',
  };
}

export function sanitizeNotificationTextClient(rawText: string): {
  sanitizedText: string;
  redactedCount: number;
} {
  let text = String(rawText || '');
  let redactedCount = 0;

  const patterns: RegExp[] = [
    /Đáp\s*án\s*(đúng|chính\s*thức|chi\s*tiết)?\s*[:=]\s*[^\n.;]+/gi,
    /Nội\s*dung\s*câu\s*hỏi\s*(mật)?\s*[:=]\s*[^\n.;]+/gi,
    /Lời\s*giải\s*chi\s*tiết\s*[:=]\s*[^\n.;]+/gi,
    /Phương\s*án\s*[A-D]\s*[:.]\s*[^\n.;]+/gi,
    /\[SECRET_EXAM_CONTENT:[^\]]*\]/gi,
  ];

  for (const pattern of patterns) {
    text = text.replace(pattern, () => {
      redactedCount += 1;
      return '[Đã ẩn nội dung câu hỏi/đáp án theo quy định bảo mật đề kiểm tra]';
    });
  }

  return { sanitizedText: text, redactedCount };
}

export function isSampleOrDemoNotification(
  n?: WorkflowNotificationItem | null
): boolean {
  if (!n) return false;
  const id = String(n.notificationId || '');
  const wfId = String(n.workflowId || '');
  const title = String(n.title || '');
  const content = String(n.content || '');
  const senderId = String(n.senderUserId || '');
  const senderName = String(n.senderName || '');
  const recipientId = String(n.recipientUserId || '');
  const recipientName = String(n.recipientName || '');
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  if (
    id.startsWith('NOTIF-SEED') ||
    id.startsWith('NOTIF-TEST') ||
    id.startsWith('NOTIF-DEMO') ||
    wfId.includes('TEST') ||
    wfId.includes('DEMO') ||
    wfId.includes('SAMPLE') ||
    wfId.startsWith('WF-BGH-') ||
    wfId.startsWith('WF-QA-') ||
    wfId === 'WF-TOAN4-CK2-2026' ||
    senderId === 'user-teacher-mai' ||
    senderId === 'user-reviewer-primary' ||
    senderId === 'user-teacher-lan-khxh' ||
    recipientId === 'user-teacher-mai' ||
    recipientId === 'user-reviewer-primary' ||
    recipientId === 'user-teacher-lan-khxh' ||
    senderName.includes('Cô Nguyễn Thị Mai') ||
    senderName.includes('Cô Lê Thị Hồng Hạnh') ||
    senderName.includes('Phạm Minh Đức') ||
    recipientName.includes('Cô Nguyễn Thị Mai') ||
    recipientName.includes('Cô Lê Thị Hồng Hạnh') ||
    title.includes('[Kiểm thử') ||
    title.startsWith('[Sự kiện ') ||
    lowerTitle.includes('kiểm thử') ||
    lowerTitle.includes('dữ liệu mẫu') ||
    lowerTitle.includes('hồ sơ mẫu') ||
    lowerContent.includes('wf-notif-test')
  ) {
    return true;
  }
  return false;
}

export function isSampleOrDemoAssignedTask(
  t?: MyAssignedTaskItem | null
): boolean {
  if (!t) return false;
  const id = String(t.taskId || '');
  const wfId = String(t.workflowId || '');
  const title = String(t.taskTitle || '');
  const dossierTitle = String(t.dossierTitle || '');
  const assignedBy = String(t.assignedByName || '');
  const assignee = String(t.assigneeName || '');
  const assigneeId = String(t.assigneeUserId || '');
  const lowerTitle = title.toLowerCase();
  if (
    id.startsWith('TASK-SEED') ||
    id.startsWith('TASK-TEST') ||
    id.startsWith('TASK-DEMO') ||
    wfId.includes('TEST') ||
    wfId.includes('DEMO') ||
    wfId.includes('SAMPLE') ||
    wfId.startsWith('WF-BGH-') ||
    wfId.startsWith('WF-QA-') ||
    wfId === 'WF-TOAN4-CK2-2026' ||
    assigneeId === 'user-teacher-mai' ||
    assigneeId === 'user-reviewer-primary' ||
    assigneeId === 'user-teacher-lan-khxh' ||
    assignedBy.includes('Cô Nguyễn Thị Mai') ||
    assignedBy.includes('Cô Lê Thị Hồng Hạnh') ||
    assignedBy.includes('Phạm Minh Đức') ||
    assignee.includes('Cô Nguyễn Thị Mai') ||
    assignee.includes('Cô Lê Thị Hồng Hạnh') ||
    title.includes('[Kiểm thử') ||
    title.startsWith('[Sự kiện ') ||
    lowerTitle.includes('kiểm thử') ||
    lowerTitle.includes('dữ liệu mẫu') ||
    dossierTitle.toLowerCase().includes('kiểm thử')
  ) {
    return true;
  }
  return false;
}

export function isNotificationVisibleToActor(
  n: WorkflowNotificationItem,
  actor: NotificationActorAccount
): boolean {
  if (isSampleOrDemoNotification(n)) return false;

  const role = actor.role;
  if (role === 'PRINCIPAL' || role === 'VICE_PRINCIPAL' || role === 'SYSTEM_ADMIN') {
    return true;
  }

  const actorId = String(actor.userId || '').trim();
  const actorNameNorm = normalizeIdentityText(actor.fullName);
  const recipientNameNorm = normalizeIdentityText(n.recipientName);
  const senderNameNorm = normalizeIdentityText(n.senderName);
  const allowedUserIds = n.securityMetadata?.allowedUserIds || [];

  const isDirectRecipient =
    (Boolean(actorId) && n.recipientUserId === actorId) ||
    (Boolean(actorNameNorm) &&
      Boolean(recipientNameNorm) &&
      (recipientNameNorm === actorNameNorm ||
        recipientNameNorm.includes(actorNameNorm) ||
        actorNameNorm.includes(recipientNameNorm)));

  if (isDirectRecipient) return true;

  if (role === 'HEAD_OF_DEPARTMENT') {
    const actorDept = normalizeIdentityText(actor.departmentName);
    const notifDept = normalizeIdentityText(n.departmentName);
    if (
      Boolean(actorDept) &&
      actorDept !== 'all' &&
      notifDept &&
      (notifDept === actorDept ||
        notifDept.includes(actorDept) ||
        actorDept.includes(notifDept))
    ) {
      return true;
    }
    if (Boolean(actorId) && allowedUserIds.includes(actorId)) {
      return true;
    }
  }

  // Với Giáo viên / Người phản biện: chỉ hiển thị thông báo gửi tới cá nhân mình hoặc do chính mình tạo khi theo dõi phản hồi
  if (
    Boolean(actorId) &&
    n.senderUserId === actorId &&
    n.recipientUserId === actorId
  ) {
    return true;
  }
  if (
    Boolean(actorNameNorm) &&
    senderNameNorm === actorNameNorm &&
    recipientNameNorm === actorNameNorm
  ) {
    return true;
  }

  return false;
}

export function isAssignedTaskVisibleToActor(
  t: MyAssignedTaskItem,
  actor: NotificationActorAccount
): boolean {
  if (isSampleOrDemoAssignedTask(t)) return false;

  const role = actor.role;
  if (role === 'PRINCIPAL' || role === 'VICE_PRINCIPAL' || role === 'SYSTEM_ADMIN') {
    return true;
  }

  const actorId = String(actor.userId || '').trim();
  const actorNameNorm = normalizeIdentityText(actor.fullName);
  const assigneeNameNorm = normalizeIdentityText(t.assigneeName);

  if (Boolean(actorId) && t.assigneeUserId === actorId) return true;
  if (
    Boolean(actorNameNorm) &&
    Boolean(assigneeNameNorm) &&
    (assigneeNameNorm === actorNameNorm ||
      assigneeNameNorm.includes(actorNameNorm) ||
      actorNameNorm.includes(assigneeNameNorm))
  ) {
    return true;
  }

  if (role === 'HEAD_OF_DEPARTMENT') {
    const actorDept = normalizeIdentityText(actor.departmentName);
    const taskDept = normalizeIdentityText(t.departmentName);
    if (Boolean(actorDept) && taskDept && taskDept === actorDept) {
      return true;
    }
  }

  return false;
}

export function loadNotificationsAndTasks(): {
  notifications: WorkflowNotificationItem[];
  tasks: MyAssignedTaskItem[];
} {
  try {
    const savedNotifsRaw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const savedTasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
    const savedNotifs: WorkflowNotificationItem[] = savedNotifsRaw
      ? JSON.parse(savedNotifsRaw)
      : [];
    const savedTasks: MyAssignedTaskItem[] = savedTasksRaw
      ? JSON.parse(savedTasksRaw)
      : [];

    const filteredNotifs = savedNotifs.filter(
      (n) => !isSampleOrDemoNotification(n)
    );
    const filteredTasks = savedTasks.filter(
      (t) => !isSampleOrDemoAssignedTask(t)
    );

    if (
      filteredNotifs.length !== savedNotifs.length ||
      filteredTasks.length !== savedTasks.length
    ) {
      saveNotificationsAndTasksToLocal(filteredNotifs, filteredTasks);
    }

    return { notifications: filteredNotifs, tasks: filteredTasks };
  } catch {
    return { notifications: [], tasks: [] };
  }
}

export async function syncOfficialNotificationsFromServer(): Promise<{
  notifications: WorkflowNotificationItem[];
  tasks: MyAssignedTaskItem[];
}> {
  const local = loadNotificationsAndTasks();
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) return local;
    const data = await res.json();
    const serverNotifsRaw: WorkflowNotificationItem[] = Array.isArray(data?.notifications)
      ? data.notifications
      : [];
    const serverTasksRaw: MyAssignedTaskItem[] = Array.isArray(data?.assignedTasks)
      ? data.assignedTasks
      : [];

    const cleanServerNotifs = serverNotifsRaw.filter(
      (n) => !isSampleOrDemoNotification(n)
    );
    const cleanServerTasks = serverTasksRaw.filter(
      (t) => !isSampleOrDemoAssignedTask(t)
    );

    const localReadMap = new Map<string, { isRead: boolean; readAt?: string }>();
    local.notifications.forEach((n) => {
      if (n.isRead) {
        localReadMap.set(n.notificationId, { isRead: true, readAt: n.readAt });
      }
    });

    const notifMap = new Map<string, WorkflowNotificationItem>();
    [...cleanServerNotifs, ...local.notifications].forEach((n) => {
      if (isSampleOrDemoNotification(n)) return;
      const key = n.idempotencyKey || n.notificationId;
      const readOverride = localReadMap.get(n.notificationId);
      const mergedItem = readOverride
        ? { ...n, isRead: true, readAt: n.readAt || readOverride.readAt }
        : n;
      if (!notifMap.has(key)) {
        notifMap.set(key, mergedItem);
      }
    });

    const taskMap = new Map<string, MyAssignedTaskItem>();
    [...cleanServerTasks, ...local.tasks].forEach((t) => {
      if (isSampleOrDemoAssignedTask(t)) return;
      if (!taskMap.has(t.taskId)) {
        taskMap.set(t.taskId, t);
      }
    });

    const mergedNotifs = Array.from(notifMap.values()).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    const mergedTasks = Array.from(taskMap.values()).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );

    saveNotificationsAndTasksToLocal(mergedNotifs, mergedTasks);
    return { notifications: mergedNotifs, tasks: mergedTasks };
  } catch {
    return local;
  }
}

/**
 * Suy xuất thông báo thực tế từ các hồ sơ đề/ma trận/quy trình chính thức được phân công cho giáo viên
 * (khi hồ sơ chính thức chưa phát sinh bản ghi thông báo riêng nhưng cần giáo viên nắm bắt và xử lý)
 */
export function deriveOfficialWorkflowNotificationsForActor(params: {
  actor: NotificationActorAccount;
  existingNotifications: WorkflowNotificationItem[];
  workflows: ExamWorkflow[];
  exams: ExamPaper[];
  matrices: ExamMatrix[];
}): WorkflowNotificationItem[] {
  const { actor, existingNotifications, workflows, exams, matrices } = params;
  const actorId = String(actor.userId || '').trim();
  const actorNameNorm = normalizeIdentityText(actor.fullName);
  const existingKeys = new Set<string>();
  const existingWorkflowEvents = new Set<string>();

  existingNotifications.forEach((n) => {
    existingKeys.add(n.idempotencyKey || n.notificationId);
    existingWorkflowEvents.add(`${n.workflowId}:${n.eventType}`);
  });

  const derived: WorkflowNotificationItem[] = [];
  const matchesMe = (userId?: string, userName?: string): boolean => {
    if (actorId && userId && userId === actorId) return true;
    const norm = normalizeIdentityText(userName);
    if (actorNameNorm && norm) {
      return (
        norm === actorNameNorm ||
        norm.includes(actorNameNorm) ||
        actorNameNorm.includes(norm)
      );
    }
    return false;
  };

  // 1. Từ quy trình hồ sơ đề chính thức
  workflows
    .filter((w) => !isSampleOrTestWorkflowDossier(w))
    .forEach((wf) => {
      const isCreator =
        matchesMe(wf.creatorId, wf.creatorName) ||
        matchesMe(undefined, wf.assignedUsers?.creatorName);
      const isReviewer = matchesMe(undefined, wf.assignedUsers?.reviewerName);

      if (isCreator && wf.status === 'RevisionRequired') {
        const eventType: WorkflowNotificationEventType = 'DOSSIER_RETURNED_FOR_REVISION';
        const wfEventKey = `${wf.workflowId}:${eventType}`;
        if (!existingWorkflowEvents.has(wfEventKey)) {
          derived.push({
            notificationId: `NOTIF-WF-REV-${wf.workflowId}`,
            workflowId: wf.workflowId,
            dossierTitle: wf.title,
            subjectId: wf.subjectId,
            gradeId: wf.gradeId,
            departmentName: wf.departmentName || actor.departmentName,
            senderType: 'USER',
            senderUserId: 'reviewer-official',
            senderName: wf.assignedUsers?.reviewerName || 'Hội đồng thẩm định',
            senderRole: 'REVIEWER',
            recipientUserId: actor.userId,
            recipientName: actor.fullName,
            recipientRole: 'TEACHER',
            eventType,
            eventOrderNumber: 9,
            categoryGroup: 'REVIEW_GROUP',
            title: `Hồ sơ cần chỉnh sửa: ${wf.title}`,
            content: `Hồ sơ môn ${wf.subjectId} Khối ${wf.gradeId} đang ở trạng thái yêu cầu chỉnh sửa sau góp ý chuyên môn. Vui lòng rà soát và gửi thẩm định lại.`,
            createdAt: wf.updatedAt || wf.createdAt,
            isRead: false,
            priority: 'URGENT',
            targetPath: {
              menuId: 'exam-workflow',
              workflowId: wf.workflowId,
              workflowStep: wf.currentStep || 5,
              routeUri: `/workflows/${wf.workflowId}/step/${wf.currentStep || 5}`,
            },
            requiredAction: {
              actionCode: 'ACT_REVISION',
              actionLabel: 'Mở hồ sơ chỉnh sửa',
              actionInstruction: 'Cập nhật nội dung theo góp ý thẩm định và nộp lại.',
              dueDate: wf.dueDate || wf.examDate,
            },
            securityMetadata: {
              containsConfidentialExamOrAnswer: false,
              redactedSnippetsCount: 0,
              allowedActorRoles: [
                'TEACHER',
                'REVIEWER',
                'HEAD_OF_DEPARTMENT',
                'VICE_PRINCIPAL',
                'PRINCIPAL',
                'SYSTEM_ADMIN',
              ],
              allowedUserIds: [actor.userId],
              allowedDepartments: [wf.departmentName || actor.departmentName, 'ALL'],
            },
            idempotencyKey: `DERIVED:${wf.workflowId}:${eventType}:${actor.userId}`,
            deliveryChannels: {
              inAppStatus: 'DELIVERED',
              emailStatus: 'DISABLED',
              pushStatus: 'DISABLED',
              honestyDisclosureNote: 'Thông báo trực tiếp trong hệ thống.',
            },
          });
        }
      } else if (
        isCreator &&
        (wf.status === 'Approved' || wf.status === 'Released')
      ) {
        const eventType: WorkflowNotificationEventType = 'EXAM_APPROVED';
        const wfEventKey = `${wf.workflowId}:${eventType}`;
        if (!existingWorkflowEvents.has(wfEventKey)) {
          derived.push({
            notificationId: `NOTIF-WF-APP-${wf.workflowId}`,
            workflowId: wf.workflowId,
            dossierTitle: wf.title,
            subjectId: wf.subjectId,
            gradeId: wf.gradeId,
            departmentName: wf.departmentName || actor.departmentName,
            senderType: 'USER',
            senderUserId: 'approver-official',
            senderName: wf.assignedUsers?.finalApproverName || 'Ban Giám hiệu',
            senderRole: 'VICE_PRINCIPAL',
            recipientUserId: actor.userId,
            recipientName: actor.fullName,
            recipientRole: 'TEACHER',
            eventType,
            eventOrderNumber: 11,
            categoryGroup: 'APPROVAL_GROUP',
            title: `Hồ sơ đề đã được phê duyệt: ${wf.title}`,
            content: `Hồ sơ đề kiểm tra môn ${wf.subjectId} Khối ${wf.gradeId} đã được phê duyệt chính thức.`,
            createdAt: wf.updatedAt || wf.createdAt,
            isRead: true,
            priority: 'MEDIUM',
            targetPath: {
              menuId: 'records',
              workflowId: wf.workflowId,
              workflowStep: 8,
              routeUri: `/workflows/${wf.workflowId}/step/8`,
            },
            requiredAction: {
              actionCode: 'ACT_VIEW_APPROVED',
              actionLabel: 'Xem hồ sơ chính thức',
              actionInstruction: 'Tra cứu hồ sơ đề đã được phê duyệt.',
              dueDate: wf.dueDate || wf.examDate,
            },
            securityMetadata: {
              containsConfidentialExamOrAnswer: false,
              redactedSnippetsCount: 0,
              allowedActorRoles: [
                'TEACHER',
                'REVIEWER',
                'HEAD_OF_DEPARTMENT',
                'VICE_PRINCIPAL',
                'PRINCIPAL',
                'SYSTEM_ADMIN',
              ],
              allowedUserIds: [actor.userId],
              allowedDepartments: [wf.departmentName || actor.departmentName, 'ALL'],
            },
            idempotencyKey: `DERIVED:${wf.workflowId}:${eventType}:${actor.userId}`,
            deliveryChannels: {
              inAppStatus: 'DELIVERED',
              emailStatus: 'DISABLED',
              pushStatus: 'DISABLED',
              honestyDisclosureNote: 'Thông báo trực tiếp trong hệ thống.',
            },
          });
        }
      }

      if (isReviewer && wf.status === 'ProfessionalReview') {
        const eventType: WorkflowNotificationEventType = 'REVIEWER_ASSIGNED';
        const wfEventKey = `${wf.workflowId}:${eventType}`;
        if (!existingWorkflowEvents.has(wfEventKey)) {
          derived.push({
            notificationId: `NOTIF-WF-REVASSIGN-${wf.workflowId}`,
            workflowId: wf.workflowId,
            dossierTitle: wf.title,
            subjectId: wf.subjectId,
            gradeId: wf.gradeId,
            departmentName: wf.departmentName || actor.departmentName,
            senderType: 'USER',
            senderUserId: 'hod-official',
            senderName: 'Tổ chuyên môn / Ban Giám hiệu',
            senderRole: 'HEAD_OF_DEPARTMENT',
            recipientUserId: actor.userId,
            recipientName: actor.fullName,
            recipientRole: 'REVIEWER',
            eventType,
            eventOrderNumber: 7,
            categoryGroup: 'REVIEW_GROUP',
            title: `Phân công phản biện đề: ${wf.title}`,
            content: `Thầy/cô được phân công thẩm định chuyên môn hồ sơ môn ${wf.subjectId} Khối ${wf.gradeId}.`,
            createdAt: wf.updatedAt || wf.createdAt,
            isRead: false,
            priority: 'HIGH',
            targetPath: {
              menuId: 'exam-workflow',
              workflowId: wf.workflowId,
              workflowStep: 6,
              routeUri: `/workflows/${wf.workflowId}/step/6`,
            },
            requiredAction: {
              actionCode: 'ACT_REVIEW_DOSSIER',
              actionLabel: 'Mở hồ sơ phản biện',
              actionInstruction: 'Đối chiếu ma trận, rà soát câu hỏi và lập phiếu nhận xét.',
              dueDate: wf.dueDate || wf.examDate,
            },
            securityMetadata: {
              containsConfidentialExamOrAnswer: false,
              redactedSnippetsCount: 0,
              allowedActorRoles: [
                'TEACHER',
                'REVIEWER',
                'HEAD_OF_DEPARTMENT',
                'VICE_PRINCIPAL',
                'PRINCIPAL',
                'SYSTEM_ADMIN',
              ],
              allowedUserIds: [actor.userId],
              allowedDepartments: [wf.departmentName || actor.departmentName, 'ALL'],
            },
            idempotencyKey: `DERIVED:${wf.workflowId}:${eventType}:${actor.userId}`,
            deliveryChannels: {
              inAppStatus: 'DELIVERED',
              emailStatus: 'DISABLED',
              pushStatus: 'DISABLED',
              honestyDisclosureNote: 'Thông báo trực tiếp trong hệ thống.',
            },
          });
        }
      }
    });

  // 2. Từ đề kiểm tra chính thức cần chỉnh sửa (nếu chưa có thông báo từ workflow)
  exams
    .filter((e) => !isSampleOrDemoExam(e))
    .forEach((exam) => {
      if (exam.status !== ApprovalStatus.REVISION_REQUIRED) return;
      const isAuthor = matchesMe(undefined, exam.authorName);
      if (!isAuthor) return;
      const wfId = exam.id;
      const eventType: WorkflowNotificationEventType = 'DOSSIER_RETURNED_FOR_REVISION';
      if (existingWorkflowEvents.has(`${wfId}:${eventType}`)) return;
      derived.push({
        notificationId: `NOTIF-EXAM-REV-${exam.id}`,
        workflowId: wfId,
        dossierTitle: exam.title,
        subjectId: exam.subject,
        gradeId: exam.grade,
        departmentName: actor.departmentName,
        senderType: 'USER',
        senderUserId: 'reviewer-official',
        senderName: exam.reviewerName || exam.assignedReviewerName || 'Tổ chuyên môn',
        senderRole: 'HEAD_OF_DEPARTMENT',
        recipientUserId: actor.userId,
        recipientName: actor.fullName,
        recipientRole: 'TEACHER',
        eventType,
        eventOrderNumber: 9,
        categoryGroup: 'REVIEW_GROUP',
        title: `Đề kiểm tra cần chỉnh sửa: ${exam.title}`,
        content: `Đề môn ${exam.subject} Khối ${exam.grade} có góp ý chỉnh sửa chuyên môn. Vui lòng cập nhật và gửi duyệt lại.`,
        createdAt: exam.createdAt,
        isRead: false,
        priority: 'HIGH',
        targetPath: {
          menuId: 'exam-builder',
          workflowId: wfId,
          workflowStep: 5,
          routeUri: `/exams/${exam.id}`,
        },
        requiredAction: {
          actionCode: 'ACT_EDIT_EXAM',
          actionLabel: 'Mở đề kiểm tra để chỉnh sửa',
          actionInstruction: 'Rà soát góp ý và cập nhật nội dung đề kiểm tra.',
          dueDate: exam.createdAt.slice(0, 10),
        },
        securityMetadata: {
          containsConfidentialExamOrAnswer: false,
          redactedSnippetsCount: 0,
          allowedActorRoles: [
            'TEACHER',
            'REVIEWER',
            'HEAD_OF_DEPARTMENT',
            'VICE_PRINCIPAL',
            'PRINCIPAL',
            'SYSTEM_ADMIN',
          ],
          allowedUserIds: [actor.userId],
          allowedDepartments: [actor.departmentName, 'ALL'],
        },
        idempotencyKey: `DERIVED:EXAM:${exam.id}:${eventType}`,
        deliveryChannels: {
          inAppStatus: 'DELIVERED',
          emailStatus: 'DISABLED',
          pushStatus: 'DISABLED',
          honestyDisclosureNote: 'Thông báo trực tiếp trong hệ thống.',
        },
      });
    });

  // 3. Từ ma trận chính thức cần chỉnh sửa
  matrices
    .filter((m) => !isSampleOrDemoMatrix(m))
    .forEach((matrix) => {
      if (matrix.status !== ApprovalStatus.REVISION_REQUIRED) return;
      const isAuthor = matchesMe(undefined, matrix.authorName);
      if (!isAuthor) return;
      const wfId = matrix.id;
      const eventType: WorkflowNotificationEventType = 'MATRIX_REVISION_REQUESTED';
      if (existingWorkflowEvents.has(`${wfId}:${eventType}`)) return;
      derived.push({
        notificationId: `NOTIF-MAT-REV-${matrix.id}`,
        workflowId: wfId,
        dossierTitle: matrix.title,
        subjectId: matrix.subject,
        gradeId: matrix.grade,
        departmentName: actor.departmentName,
        senderType: 'USER',
        senderUserId: 'hod-official',
        senderName: matrix.assignedReviewerName || 'Tổ trưởng chuyên môn',
        senderRole: 'HEAD_OF_DEPARTMENT',
        recipientUserId: actor.userId,
        recipientName: actor.fullName,
        recipientRole: 'TEACHER',
        eventType,
        eventOrderNumber: 2,
        categoryGroup: 'MATRIX_GROUP',
        title: `Ma trận cần chỉnh sửa: ${matrix.title}`,
        content: `Ma trận đặc tả môn ${matrix.subject} Khối ${matrix.grade} cần rà soát, điều chỉnh theo góp ý của Tổ chuyên môn.`,
        createdAt: matrix.createdAt,
        isRead: false,
        priority: 'HIGH',
        targetPath: {
          menuId: 'matrix',
          workflowId: wfId,
          workflowStep: 2,
          routeUri: `/matrices/${matrix.id}`,
        },
        securityMetadata: {
          containsConfidentialExamOrAnswer: false,
          redactedSnippetsCount: 0,
          allowedActorRoles: [
            'TEACHER',
            'REVIEWER',
            'HEAD_OF_DEPARTMENT',
            'VICE_PRINCIPAL',
            'PRINCIPAL',
            'SYSTEM_ADMIN',
          ],
          allowedUserIds: [actor.userId],
          allowedDepartments: [actor.departmentName, 'ALL'],
        },
        requiredAction: {
          actionCode: 'ACT_EDIT_MATRIX',
          actionLabel: 'Mở ma trận & đặc tả',
          actionInstruction: 'Cập nhật ma trận đặc tả và gửi thẩm định lại.',
          dueDate: matrix.createdAt.slice(0, 10),
        },
        idempotencyKey: `DERIVED:MATRIX:${matrix.id}:${eventType}`,
        deliveryChannels: {
          inAppStatus: 'DELIVERED',
          emailStatus: 'DISABLED',
          pushStatus: 'DISABLED',
          honestyDisclosureNote: 'Thông báo trực tiếp trong hệ thống.',
        },
      });
    });

  return derived.filter((d) => !existingKeys.has(d.idempotencyKey));
}

export function purgeSampleNotificationsAndTasksFromLocal(): {
  removedNotifications: number;
  removedTasks: number;
} {
  try {
    const savedNotifsRaw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const savedTasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
    const savedNotifs: WorkflowNotificationItem[] = savedNotifsRaw
      ? JSON.parse(savedNotifsRaw)
      : [];
    const savedTasks: MyAssignedTaskItem[] = savedTasksRaw
      ? JSON.parse(savedTasksRaw)
      : [];
    const filteredNotifs = savedNotifs.filter(
      (n) => !isSampleOrDemoNotification(n)
    );
    const filteredTasks = savedTasks.filter(
      (t) => !isSampleOrDemoAssignedTask(t)
    );
    saveNotificationsAndTasksToLocal(filteredNotifs, filteredTasks);
    return {
      removedNotifications: savedNotifs.length - filteredNotifs.length,
      removedTasks: savedTasks.length - filteredTasks.length,
    };
  } catch {
    return { removedNotifications: 0, removedTasks: 0 };
  }
}

export async function cleanSampleNotificationsEverywhere(): Promise<{
  removedNotifications: number;
  removedTasks: number;
}> {
  const localPurged = purgeSampleNotificationsAndTasksFromLocal();
  let serverRemovedNotifs = 0;
  let serverRemovedTasks = 0;
  try {
    const res = await fetch('/api/notifications/clean-samples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      serverRemovedNotifs = Number(data?.removedNotifications || 0);
      serverRemovedTasks = Number(data?.removedTasks || 0);
    }
  } catch {
    // ignore network error
  }
  return {
    removedNotifications: localPurged.removedNotifications + serverRemovedNotifs,
    removedTasks: localPurged.removedTasks + serverRemovedTasks,
  };
}

export function saveNotificationsAndTasksToLocal(
  notifications: WorkflowNotificationItem[],
  tasks: MyAssignedTaskItem[]
): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore storage errors
  }
}

export interface EmitWorkflowNotificationPayload {
  workflowId: string;
  dossierTitle: string;
  subjectId: string;
  gradeId: GradeNumber;
  departmentName: string;
  eventType: WorkflowNotificationEventType;
  senderType?: 'USER' | 'SYSTEM';
  senderUserId: string;
  senderName: string;
  senderRole: WorkflowActorRole | 'AI_ENGINE' | 'WORKFLOW_SCHEDULER';
  recipientUserId: string;
  recipientName: string;
  recipientRole: WorkflowActorRole;
  title: string;
  content: string;
  priority?: WorkflowNotificationPriority;
  targetMenuId?: MenuSectionId;
  targetWorkflowStep?: ExamWorkflowStepNumber;
  actionCode?: string;
  actionLabel?: string;
  actionInstruction?: string;
  dueDate?: string;
  versionOrStepTag?: string;
  idempotencyKey?: string;
  createAssignedTask?: boolean;
  completePreviousTasksForWorkflow?: boolean;
  taskTitle?: string;
  taskStatus?: MyAssignedTaskStatus;
  allowedActorRoles?: WorkflowActorRole[];
  allowedUserIds?: string[];
  allowedDepartments?: string[];
}

export async function emitWorkflowNotificationEvent(
  payload: EmitWorkflowNotificationPayload
): Promise<{
  deduplicated: boolean;
  notification: WorkflowNotificationItem;
  assignedTask: MyAssignedTaskItem | null;
}> {
  const current = loadNotificationsAndTasks();
  const idempotencyKey =
    payload.idempotencyKey?.trim() ||
    `${payload.workflowId}:${payload.eventType}:${payload.versionOrStepTag || 'v1'}:${payload.recipientUserId}`;

  try {
    const response = await fetch('/api/notifications/emit-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, idempotencyKey }),
    });
    if (response.ok) {
      const data = await response.json();
      const notif = data.notification as WorkflowNotificationItem;
      const task = (data.assignedTask as MyAssignedTaskItem) || null;

      if (!data.deduplicated && !isSampleOrDemoNotification(notif)) {
        const nextNotifs = [
          notif,
          ...current.notifications.filter((n) => n.idempotencyKey !== notif.idempotencyKey),
        ];
        let nextTasks = [...current.tasks];
        if (payload.completePreviousTasksForWorkflow) {
          nextTasks = nextTasks.map((t) =>
            t.workflowId === payload.workflowId && t.status !== 'COMPLETED'
              ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() }
              : t
          );
        }
        if (task && !isSampleOrDemoAssignedTask(task)) {
          nextTasks = [task, ...nextTasks.filter((t) => t.taskId !== task.taskId)];
        }
        saveNotificationsAndTasksToLocal(nextNotifs, nextTasks);
      }

      return {
        deduplicated: Boolean(data.deduplicated),
        notification: notif,
        assignedTask: task,
      };
    }
  } catch {
    // Fallback local
  }

  const existing = current.notifications.find((n) => n.idempotencyKey === idempotencyKey);
  if (existing) {
    const existingTask =
      current.tasks.find((t) => t.notificationId === existing.notificationId) || null;
    return {
      deduplicated: true,
      notification: existing,
      assignedTask: existingTask,
    };
  }

  const eventMeta =
    NOTIFICATION_EVENT_CATALOG.find((e) => e.eventType === payload.eventType) ||
    NOTIFICATION_EVENT_CATALOG[5];
  const titleSan = sanitizeNotificationTextClient(payload.title);
  const contentSan = sanitizeNotificationTextClient(payload.content);
  const nowIso = new Date().toISOString();
  const defaultDueDate = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const notification: WorkflowNotificationItem = {
    notificationId,
    workflowId: payload.workflowId,
    dossierTitle: payload.dossierTitle,
    subjectId: payload.subjectId,
    gradeId: payload.gradeId,
    departmentName: payload.departmentName,
    senderType: payload.senderType || 'USER',
    senderUserId: payload.senderUserId,
    senderName: payload.senderName,
    senderRole: payload.senderRole,
    recipientUserId: payload.recipientUserId,
    recipientName: payload.recipientName,
    recipientRole: payload.recipientRole,
    eventType: payload.eventType,
    eventOrderNumber: eventMeta.orderNumber,
    categoryGroup: eventMeta.categoryGroup,
    title: titleSan.sanitizedText,
    content: contentSan.sanitizedText,
    createdAt: nowIso,
    isRead: false,
    priority: payload.priority || eventMeta.defaultPriority,
    targetPath: {
      menuId: payload.targetMenuId || eventMeta.defaultTargetMenu,
      workflowId: payload.workflowId,
      workflowStep: payload.targetWorkflowStep || eventMeta.defaultTargetStep,
      routeUri: `/workflows/${payload.workflowId}/step/${payload.targetWorkflowStep || eventMeta.defaultTargetStep}`,
    },
    requiredAction: {
      actionCode: payload.actionCode || `ACT_${payload.eventType}`,
      actionLabel: payload.actionLabel || eventMeta.defaultActionLabel,
      actionInstruction:
        payload.actionInstruction || 'Mở hồ sơ và thực hiện thao tác theo quy trình.',
      dueDate: payload.dueDate || defaultDueDate,
    },
    securityMetadata: {
      containsConfidentialExamOrAnswer: false,
      redactedSnippetsCount: titleSan.redactedCount + contentSan.redactedCount,
      allowedActorRoles: payload.allowedActorRoles || [
        'TEACHER',
        'REVIEWER',
        'HEAD_OF_DEPARTMENT',
        'VICE_PRINCIPAL',
        'PRINCIPAL',
        'SYSTEM_ADMIN',
      ],
      allowedUserIds: payload.allowedUserIds || [
        payload.senderUserId,
        payload.recipientUserId,
      ],
      allowedDepartments: payload.allowedDepartments || [payload.departmentName, 'ALL'],
    },
    idempotencyKey,
    deliveryChannels: {
      inAppStatus: 'DELIVERED',
      emailStatus: 'DISABLED',
      pushStatus: 'DISABLED',
      honestyDisclosureNote: 'Thông báo trực tiếp trong ứng dụng.',
    },
  };

  let nextTasks = [...current.tasks];
  if (payload.completePreviousTasksForWorkflow) {
    nextTasks = nextTasks.map((t) =>
      t.workflowId === payload.workflowId && t.status !== 'COMPLETED'
        ? { ...t, status: 'COMPLETED', completedAt: nowIso }
        : t
    );
  }

  let assignedTask: MyAssignedTaskItem | null = null;
  if (payload.createAssignedTask !== false) {
    assignedTask = {
      taskId: `TASK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      notificationId,
      workflowId: payload.workflowId,
      dossierTitle: payload.dossierTitle,
      taskTitle: payload.taskTitle || notification.requiredAction.actionLabel,
      actionInstruction: notification.requiredAction.actionInstruction,
      dueDate: notification.requiredAction.dueDate,
      subjectId: payload.subjectId,
      gradeId: payload.gradeId,
      departmentName: payload.departmentName,
      status: payload.taskStatus || 'PENDING',
      assignedByUserId: payload.senderUserId,
      assignedByName: payload.senderName,
      assignedByRoleLabel: String(payload.senderRole),
      assigneeUserId: payload.recipientUserId,
      assigneeName: payload.recipientName,
      assigneeRole: payload.recipientRole,
      priority: notification.priority,
      targetMenuId: notification.targetPath.menuId,
      targetWorkflowStep: notification.targetPath.workflowStep,
      createdAt: nowIso,
    };
    nextTasks = [assignedTask, ...nextTasks];
  }

  const nextNotifs = [notification, ...current.notifications];
  saveNotificationsAndTasksToLocal(nextNotifs, nextTasks);

  return {
    deduplicated: false,
    notification,
    assignedTask,
  };
}

export async function markNotificationReadStatus(params: {
  notificationId?: string;
  markAllForUserId?: string;
  markAllForUserName?: string;
  markAll?: boolean;
}): Promise<WorkflowNotificationItem[]> {
  const current = loadNotificationsAndTasks();
  const nowIso = new Date().toISOString();
  const targetNameNorm = normalizeIdentityText(params.markAllForUserName);

  const updatedNotifs = current.notifications.map((n) => {
    if (params.markAll) {
      return { ...n, isRead: true, readAt: n.readAt || nowIso };
    }
    if (params.markAllForUserId && n.recipientUserId === params.markAllForUserId) {
      return { ...n, isRead: true, readAt: n.readAt || nowIso };
    }
    if (targetNameNorm && normalizeIdentityText(n.recipientName) === targetNameNorm) {
      return { ...n, isRead: true, readAt: n.readAt || nowIso };
    }
    if (params.notificationId && n.notificationId === params.notificationId) {
      return { ...n, isRead: true, readAt: n.readAt || nowIso };
    }
    return n;
  });

  saveNotificationsAndTasksToLocal(updatedNotifs, current.tasks);

  try {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // ignore network error
  }

  return updatedNotifs;
}

export function updateAssignedTaskStatusLocal(
  taskId: string,
  nextStatus: MyAssignedTaskStatus
): MyAssignedTaskItem[] {
  const current = loadNotificationsAndTasks();
  const nowIso = new Date().toISOString();
  const updatedTasks = current.tasks.map((t) =>
    t.taskId === taskId
      ? {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'COMPLETED' ? nowIso : undefined,
        }
      : t
  );
  saveNotificationsAndTasksToLocal(current.notifications, updatedTasks);
  return updatedTasks;
}

export async function verifyAndOpenDossierFromNotification(params: {
  notification: WorkflowNotificationItem;
  actor: NotificationActorAccount;
}): Promise<{
  allowed: boolean;
  httpStatus: number;
  message: string;
  targetPath?: WorkflowNotificationItem['targetPath'];
}> {
  const { notification, actor } = params;

  // Với thông báo suy xuất trực tiếp từ hồ sơ chính thức được phân công cho người dùng đang đăng nhập
  if (
    notification.notificationId.startsWith('NOTIF-WF-') ||
    notification.notificationId.startsWith('NOTIF-EXAM-') ||
    notification.notificationId.startsWith('NOTIF-MAT-')
  ) {
    return {
      allowed: true,
      httpStatus: 200,
      message: `Đang mở hồ sơ "${notification.dossierTitle}".`,
      targetPath: notification.targetPath,
    };
  }

  try {
    const response = await fetch(
      `/api/notifications/${encodeURIComponent(notification.notificationId)}/open-dossier`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: actor.userId,
          actorName: actor.fullName,
          actorRole: actor.role,
          actorDepartment: actor.departmentName,
          notificationSnapshot: notification,
        }),
      }
    );
    const data = await response.json();
    if (response.ok && data.allowed) {
      await markNotificationReadStatus({ notificationId: notification.notificationId });
      return {
        allowed: true,
        httpStatus: 200,
        message: `Đang mở hồ sơ "${notification.dossierTitle}".`,
        targetPath: data.targetPath || notification.targetPath,
      };
    }
    return {
      allowed: false,
      httpStatus: Number(data.httpStatus || response.status),
      message:
        'Tài khoản hiện tại không thuộc danh sách được phân công xử lý hồ sơ này.',
      targetPath: data.targetPath || notification.targetPath,
    };
  } catch {
    const isLeadership = ['PRINCIPAL', 'VICE_PRINCIPAL', 'SYSTEM_ADMIN'].includes(actor.role);
    const isParticipant = isNotificationVisibleToActor(notification, actor);
    if (!isLeadership && !isParticipant) {
      return {
        allowed: false,
        httpStatus: 403,
        message:
          'Tài khoản hiện tại không thuộc danh sách được phân công xử lý hồ sơ này.',
      };
    }
    await markNotificationReadStatus({ notificationId: notification.notificationId });
    return {
      allowed: true,
      httpStatus: 200,
      message: `Đang mở hồ sơ "${notification.dossierTitle}".`,
      targetPath: notification.targetPath,
    };
  }
}

export function buildPrincipalNotificationDigest(
  workflows: ExamWorkflow[]
): PrincipalNotificationDigestSummary {
  const nowDate = new Date().toISOString().slice(0, 10);
  const officialWorkflows = workflows.filter((w) => !isSampleOrTestWorkflowDossier(w));

  const toDigestItem = (
    wf: ExamWorkflow,
    detailSafeNote: string
  ): PrincipalNotificationDigestGroupItem => ({
    workflowId: wf.workflowId,
    dossierTitle: wf.title,
    gradeId: wf.gradeId,
    subjectId: wf.subjectId,
    departmentName: wf.departmentName || 'Tổ chuyên môn',
    teacherName: wf.creatorName || wf.assignedUsers.creatorName,
    currentStep: wf.currentStep,
    statusLabel: wf.status,
    dueDate: wf.dueDate || wf.examDate,
    detailSafeNote,
  });

  const pendingApprovalDossiers = officialWorkflows
    .filter((w) => w.status === 'AwaitingApproval')
    .map((w) =>
      toDigestItem(
        w,
        `Đã thẩm định đạt yêu cầu (Phiên bản ${w.currentVersionId}) – Chờ Ban Giám hiệu phê duyệt.`
      )
    );

  const overdueDossiers = officialWorkflows
    .filter(
      (w) =>
        Boolean(w.dueDate || w.examDate) &&
        (w.dueDate || w.examDate) < nowDate &&
        !['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(w.status)
    )
    .map((w) =>
      toDigestItem(
        w,
        `Quá hạn hoàn thành từ ngày ${w.dueDate || w.examDate}. Hiện ở Bước ${w.currentStep}.`
      )
    );

  const criticalAiErrorDossiers = officialWorkflows
    .filter((w) => w.step4AiQualityReview.criticalErrorsCount > 0)
    .map((w) =>
      toDigestItem(
        w,
        `Còn ${w.step4AiQualityReview.criticalErrorsCount} lỗi chuyên môn nghiêm trọng cần khắc phục.`
      )
    );

  const unreviewedDossiers = officialWorkflows
    .filter(
      (w) =>
        w.step6ProfessionalReview.ballots.length === 0 &&
        !['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(w.status)
    )
    .map((w) =>
      toDigestItem(
        w,
        w.assignedUsers.reviewerName
          ? `Đã phân công phản biện (${w.assignedUsers.reviewerName}), chờ biên bản thẩm định.`
          : 'Chưa phân công người phản biện chuyên môn.'
      )
    );

  const missingAnswerKeyDossiers = officialWorkflows
    .filter(
      (w) =>
        !w.step3ExamGeneration.answerKeyComplete ||
        !w.step3ExamGeneration.gradingGuideComplete
    )
    .map((w) =>
      toDigestItem(
        w,
        `Cần bổ sung ${!w.step3ExamGeneration.answerKeyComplete ? 'Đáp án' : ''}${
          !w.step3ExamGeneration.answerKeyComplete &&
          !w.step3ExamGeneration.gradingGuideComplete
            ? ' & '
            : ''
        }${!w.step3ExamGeneration.gradingGuideComplete ? 'Hướng dẫn chấm' : ''}.`
      )
    );

  const completedDossiers = officialWorkflows
    .filter((w) => ['Approved', 'Released', 'ResultsAnalysis', 'Archived'].includes(w.status))
    .map((w) =>
      toDigestItem(
        w,
        `Đã phê duyệt chính thức – Phiên bản ${w.currentVersionId}.`
      )
    );

  return {
    generatedAt: new Date().toISOString(),
    pendingApprovalDossiers,
    overdueDossiers,
    criticalAiErrorDossiers,
    unreviewedDossiers,
    missingAnswerKeyDossiers,
    completedDossiers,
  };
}
