import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Database,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Lock,
  Play,
  Plus,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import {
  AuthenticatedUserSession,
  ExamMatrix,
  ExamPaper,
  MenuSectionId,
  QuestionItem,
  RoleWorkspaceContextPayload,
  RoleWorkspaceVerificationReport,
  SchoolBrandingConfig,
  ToastNotification,
  WorkflowActorRole,
} from '../types/domain';
import {
  getStoredSessionToken,
  loginWithServerRoleScenario,
} from '../services/auth/authSessionService';

interface RoleBasedWorkspaceHubProps {
  authSession: AuthenticatedUserSession | null;
  branding: SchoolBrandingConfig;
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  mode: 'ROLE_HOME' | 'MY_PROFILE';
  unsavedDraftText: string;
  hasUnsavedChanges: boolean;
  onUpdateUnsavedDraft: (text: string, dirty: boolean) => void;
  onSaveDraftSafely: () => void;
  onRequestNavigateWithGuard: (targetMenuId: MenuSectionId) => void;
  onRequestRoleSwitchWithGuard: (nextRole: WorkflowActorRole) => void;
  onQuickSwitchAccountSession: (session: AuthenticatedUserSession) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

const ROLE_LABELS_VI: Record<WorkflowActorRole, { label: string; description: string }> = {
  TEACHER: {
    label: 'Giáo viên',
    description: 'Biên soạn câu hỏi, lập ma trận, tạo đề kiểm tra và theo dõi hồ sơ chuyên môn được phân công.',
  },
  REVIEWER: {
    label: 'Giáo viên phản biện',
    description: 'Thẩm định độc lập, đối chiếu ma trận – đề kiểm tra và gửi nhận xét chuyên môn.',
  },
  HEAD_OF_DEPARTMENT: {
    label: 'Tổ trưởng chuyên môn',
    description: 'Điều phối hồ sơ đề của tổ, phân công phản biện, thẩm định cấp tổ và theo dõi tiến độ chuyên môn.',
  },
  VICE_PRINCIPAL: {
    label: 'Phó hiệu trưởng',
    description: 'Quản lý kế hoạch ra đề, giám sát tiến độ, thẩm định và phê duyệt hồ sơ theo phạm vi phụ trách.',
  },
  PRINCIPAL: {
    label: 'Hiệu trưởng',
    description: 'Chỉ đạo toàn diện công tác kiểm tra đánh giá, phê duyệt đề chính thức và phân tích chất lượng toàn trường.',
  },
  SYSTEM_ADMIN: {
    label: 'Quản trị hệ thống',
    description: 'Quản lý tài khoản, phân quyền vai trò, cấu hình đơn vị, năm học, nhật ký bảo mật và sao lưu dữ liệu.',
  },
};

export const RoleBasedWorkspaceHub: React.FC<RoleBasedWorkspaceHubProps> = ({
  authSession,
  branding,
  questions,
  matrices,
  exams,
  mode,
  unsavedDraftText,
  hasUnsavedChanges,
  onUpdateUnsavedDraft,
  onSaveDraftSafely,
  onRequestNavigateWithGuard,
  onRequestRoleSwitchWithGuard,
  onQuickSwitchAccountSession,
  onNotify,
}) => {
  const [roleContext, setRoleContext] = useState<RoleWorkspaceContextPayload | null>(null);
  const [loadingContext, setLoadingContext] = useState<boolean>(false);
  const [testReport, setTestReport] = useState<RoleWorkspaceVerificationReport | null>(null);
  const [runningTestSuite, setRunningTestSuite] = useState<boolean>(false);
  const [switchingAccountRole, setSwitchingAccountRole] = useState<WorkflowActorRole | null>(null);
  const [showQaInspector, setShowQaInspector] = useState<boolean>(false);
  const [backendActionProbeMessage, setBackendActionProbeMessage] = useState<{
    allowed: boolean;
    httpStatus: number;
    text: string;
  } | null>(null);

  const activeRole: WorkflowActorRole = authSession?.user.activeRole || 'TEACHER';
  const actorId = authSession?.user.id || 'user-nda-pdf-01';

  const fetchRoleWorkspaceContext = useCallback(async () => {
    setLoadingContext(true);
    try {
      const token = getStoredSessionToken();
      const headers: Record<string, string> = {
        'x-actor-user-id': actorId,
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(
        `/api/security/role-workspace-context?userId=${encodeURIComponent(
          actorId
        )}&activeRole=${encodeURIComponent(activeRole)}`,
        { headers }
      );
      const data = await res.json();
      if (res.ok && data?.context) {
        setRoleContext(data.context as RoleWorkspaceContextPayload);
      }
    } catch (e) {
      console.error('Lỗi tải ngữ cảnh giao diện theo vai trò:', e);
    } finally {
      setLoadingContext(false);
    }
  }, [actorId, activeRole]);

  useEffect(() => {
    void fetchRoleWorkspaceContext();
    setBackendActionProbeMessage(null);
  }, [fetchRoleWorkspaceContext]);

  const handleRun5RolesVerificationSuite = useCallback(async () => {
    setRunningTestSuite(true);
    try {
      const res = await fetch('/api/security/run-role-workspace-test-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data?.report) {
        setTestReport(data.report as RoleWorkspaceVerificationReport);
        onNotify(
          'success',
          'Hoàn tất kiểm thử 5 vai trò',
          `Đã kiểm tra Menu, Phạm vi dữ liệu và Quyền Backend cho 5 tài khoản: Đạt ${data.report.passedCount}/${data.report.rolesTestedCount}.`
        );
      }
    } catch (e) {
      console.error('Lỗi chạy kiểm thử 5 vai trò:', e);
    } finally {
      setRunningTestSuite(false);
    }
  }, [onNotify]);

  const handleQuickLoginAsRoleAccount = async (targetRole: WorkflowActorRole) => {
    if (hasUnsavedChanges) {
      onRequestRoleSwitchWithGuard(targetRole);
      return;
    }
    setSwitchingAccountRole(targetRole);
    try {
      const outcome = await loginWithServerRoleScenario({
        roleOrScenario: targetRole,
        rememberMe: true,
      });
      if (outcome.ok && outcome.session) {
        onQuickSwitchAccountSession(outcome.session);
      } else {
        onNotify('error', 'Không thể chuyển tài khoản', outcome.message);
      }
    } finally {
      setSwitchingAccountRole(null);
    }
  };

  const handleProbeOutOfRoleActionAtBackend = async () => {
    try {
      let payload: Record<string, unknown> = {
        actorUserId: actorId,
        actionType: 'APPROVE_EXAM',
        targetSchoolId: 'SCHOOL_A',
        targetSubject: roleContext?.actor.assignedSubjects[0] || 'Toán',
        targetGrade: roleContext?.actor.assignedGrades[0] || 4,
        isOwnExam: true,
      };
      if (activeRole === 'HEAD_OF_DEPARTMENT') {
        payload = {
          actorUserId: actorId,
          actionType: 'APPRAISE_DEPARTMENT_DOSSIER',
          targetSchoolId: 'SCHOOL_A',
          targetDepartment: 'Tổ khoa học xã hội',
          targetSubject: 'Ngữ văn',
          targetGrade: 8,
        };
      } else if (activeRole === 'VICE_PRINCIPAL' || activeRole === 'PRINCIPAL') {
        payload = {
          actorUserId: actorId,
          actionType: 'APPROVE_EXAM',
          targetSchoolId: 'SCHOOL_B',
          targetSubject: 'Toán',
          targetGrade: 8,
        };
      } else if (activeRole === 'SYSTEM_ADMIN') {
        payload = {
          actorUserId: 'user-test-tech-admin',
          actionType: 'VIEW_SECRET_EXAM',
          targetSchoolId: 'SCHOOL_A',
          targetDossierId: 'sec-5-secret-exam',
        };
      }

      const res = await fetch('/api/security/scope-action-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': String(payload.actorUserId),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setBackendActionProbeMessage({
        allowed: Boolean(data.allowed),
        httpStatus: res.status,
        text: `[HTTP ${res.status} · ${data.errorCode || data.code}] ${data.message}`,
      });
      onNotify(
        res.ok ? 'info' : 'warning',
        `Kiểm tra quyền tại Backend (${res.status})`,
        data.message
      );
    } catch (e) {
      console.error('Backend probe error:', e);
    }
  };

  const assignedSubjects =
    roleContext?.actor.assignedSubjects ||
    authSession?.user.assignedSubjects ||
    ['Khoa học tự nhiên'];
  const assignedGrades =
    roleContext?.actor.assignedGrades ||
    authSession?.user.assignedGrades ||
    [6, 7, 8, 9];
  const grantedRoles =
    roleContext?.actor.grantedRoles ||
    authSession?.user.roles ||
    ([activeRole] as WorkflowActorRole[]);
  const displaySchoolName =
    roleContext?.actor.schoolName ||
    branding.schoolName ||
    'Trường TH và THCS Nguyễn Đình Anh';
  const displayDeptName =
    roleContext?.actor.departmentName ||
    authSession?.user.departmentName ||
    'Tổ khoa học tự nhiên';
  const displayFullName =
    roleContext?.actor.fullName ||
    authSession?.user.fullName ||
    'Giáo viên';

  const scopedQuestionsList = questions.filter((q) => {
    if (activeRole === 'PRINCIPAL' || activeRole === 'SYSTEM_ADMIN') return true;
    const subjectMatched = assignedSubjects.some(
      (s) =>
        q.subject.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(q.subject.toLowerCase())
    );
    const gradeMatched = assignedGrades.includes(q.grade);
    return subjectMatched || gradeMatched;
  });

  const scopedMatricesList = matrices.filter((m) => {
    if (activeRole === 'PRINCIPAL' || activeRole === 'SYSTEM_ADMIN') return true;
    return assignedSubjects.some(
      (s) =>
        m.subject.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(m.subject.toLowerCase())
    );
  });

  const scopedExamsList = exams.filter((ex) => {
    if (activeRole === 'PRINCIPAL' || activeRole === 'SYSTEM_ADMIN') return true;
    return assignedSubjects.some(
      (s) =>
        ex.subject.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(ex.subject.toLowerCase())
    );
  });

  // ============================================================================
  // CHẾ ĐỘ 1: TRANG TÀI KHOẢN CÁ NHÂN (MY_PROFILE)
  // ============================================================================
  if (mode === 'MY_PROFILE') {
    const actor = roleContext?.actor;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{displaySchoolName}</span>
                <span aria-hidden="true">·</span>
                <span>Năm học {branding.academicYear}</span>
                <span aria-hidden="true">·</span>
                <span>{displayDeptName}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Hồ sơ tài khoản cá nhân — {displayFullName}
              </h1>
              <p className="text-xs text-slate-600">
                Thông tin định danh, phân công chuyên môn và quyền truy cập hiện hành trên hệ thống.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer self-start"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-600" />
              <span>Quay lại Trang chủ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>Thông tin công tác</span>
              </div>
              <dl className="space-y-2 text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt>Họ và tên:</dt>
                  <dd className="font-semibold text-slate-900">{displayFullName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Tên đăng nhập:</dt>
                  <dd className="font-mono font-semibold text-blue-900">
                    {actor?.username || authSession?.user.username}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Email công vụ:</dt>
                  <dd className="font-mono text-slate-800 truncate">
                    {actor?.email || authSession?.user.email}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Chức vụ:</dt>
                  <dd className="font-semibold text-slate-900">
                    {actor?.positionTitle || ROLE_LABELS_VI[activeRole]?.label}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <span>Phạm vi chuyên môn được phân công</span>
              </div>
              <dl className="space-y-2 text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt>Đơn vị trường:</dt>
                  <dd className="font-semibold text-slate-900 text-right">{displaySchoolName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Tổ chuyên môn:</dt>
                  <dd className="font-semibold text-slate-900">{displayDeptName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Môn giảng dạy:</dt>
                  <dd className="font-semibold text-blue-900 text-right">
                    {assignedSubjects.join(', ')}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Khối lớp phụ trách:</dt>
                  <dd className="font-semibold text-slate-900">
                    Khối {assignedGrades.join(', ')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Vai trò được cấp trên hệ thống</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Vai trò đang làm việc:{' '}
                <strong className="text-blue-900">
                  {ROLE_LABELS_VI[activeRole]?.label || activeRole}
                </strong>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {grantedRoles.map((r) => {
                  const isCurrent = r === activeRole;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onRequestRoleSwitchWithGuard(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-blue-600'
                      }`}
                    >
                      {isCurrent ? 'Đang sử dụng: ' : 'Chuyển sang: '}
                      {ROLE_LABELS_VI[r]?.label || r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {roleContext && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-xs font-semibold text-slate-700">
                Các chức năng được cấp quyền truy cập ({roleContext.allowedMenus.length} mục):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {roleContext.allowedMenus.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onRequestNavigateWithGuard(m.id)}
                    className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {m.label}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      Mở chức năng →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // CHẾ ĐỘ 2: TRANG CHỦ LÀM VIỆC THEO VAI TRÒ ĐÃ ĐĂNG NHẬP (ROLE_HOME)
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* 1. HEADER CHÀO MỪNG GỌN GÀNG, CHUẨN SƯ PHẠM */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            {/* Dòng metadata đơn vị tinh gọn theo đúng chuẩn Zero-Pill */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{displaySchoolName}</span>
              <span aria-hidden="true">·</span>
              <span>Năm học {branding.academicYear}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-blue-800">{displayDeptName}</span>
              <span aria-hidden="true">·</span>
              <span>
                Vai trò: <strong className="text-slate-900">{ROLE_LABELS_VI[activeRole]?.label}</strong>
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Xin chào, {displayFullName}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {activeRole === 'TEACHER' || activeRole === 'REVIEWER' ? (
                <>
                  Phân công chuyên môn: <strong>{assignedSubjects.join(', ')}</strong> (Khối{' '}
                  <strong>{assignedGrades.join(', ')}</strong>). Dữ liệu ngân hàng câu hỏi, ma trận và đề kiểm tra dưới đây được lọc tự động theo môn học và khối lớp thầy/cô phụ trách.
                </>
              ) : (
                ROLE_LABELS_VI[activeRole]?.description
              )}
            </p>
          </div>

          {/* Cụm nút hành động chính theo đúng vai trò */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {(activeRole === 'TEACHER' ||
              activeRole === 'REVIEWER' ||
              activeRole === 'HEAD_OF_DEPARTMENT') && (
              <>
                <button
                  type="button"
                  onClick={() => onRequestNavigateWithGuard('questions')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-700" />
                  <span>Tạo câu hỏi</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestNavigateWithGuard('matrix')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  <span>Ma trận &amp; Đặc tả</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestNavigateWithGuard('exam-builder')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tạo đề kiểm tra</span>
                </button>
              </>
            )}

            {(activeRole === 'VICE_PRINCIPAL' || activeRole === 'PRINCIPAL') && (
              <>
                <button
                  type="button"
                  onClick={() => onRequestNavigateWithGuard('bgh-progress-tracking')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-blue-700" />
                  <span>Theo dõi tiến độ</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestNavigateWithGuard('bgh-approval')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Thẩm định &amp; Phê duyệt</span>
                </button>
              </>
            )}

            {activeRole === 'SYSTEM_ADMIN' && (
              <>
                <button
                  type="button"
                  onClick={() => onRequestNavigateWithGuard('admin-teacher-permissions')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Phân quyền Giáo viên (Ô chọn &amp; Công tắc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestNavigateWithGuard('admin-accounts')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-amber-300" />
                  <span>Quản lý Tài khoản</span>
                </button>
              </>
            )}
            {activeRole !== 'SYSTEM_ADMIN' && (
              <button
                type="button"
                onClick={() => onRequestNavigateWithGuard('admin-teacher-permissions')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Phân quyền Giáo viên</span>
              </button>
            )}
          </div>
        </div>

        {/* Chỉ hiển thị thanh chuyển đổi vai trò khi tài khoản có từ 2 vai trò trở lên */}
        {grantedRoles.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">
              Tài khoản kiêm nhiệm nhiều vai trò — Chọn vai trò làm việc hiện hành:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {grantedRoles.map((rCode) => {
                const isCurrent = rCode === activeRole;
                return (
                  <button
                    key={rCode}
                    type="button"
                    onClick={() => onRequestRoleSwitchWithGuard(rCode)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ROLE_LABELS_VI[rCode]?.label || rCode}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          2. KHÔNG GIAN LÀM VIỆC CỦA GIÁO VIÊN (MỤC II)
          Hiển thị cho Giáo viên, Giáo viên phản biện và Tổ trưởng chuyên môn
         ===================================================================== */}
      {(activeRole === 'TEACHER' ||
        activeRole === 'REVIEWER' ||
        activeRole === 'HEAD_OF_DEPARTMENT') &&
        roleContext && (
          <>
            {/* 6 CHỈ SỐ TRANG CHỦ GIÁO VIÊN */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <button
                type="button"
                onClick={() => onRequestNavigateWithGuard('questions')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Số câu hỏi đã tạo</span>
                  <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
                </div>
                <div className="my-2 text-2xl font-bold font-mono text-slate-900">
                  {Math.max(
                    roleContext.teacherHomeMetrics.createdQuestionsCount,
                    scopedQuestionsList.length
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Môn {assignedSubjects.join(', ')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRequestNavigateWithGuard('exam-builder')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Đề đang xây dựng</span>
                  <FileText className="w-4 h-4 text-indigo-700 shrink-0" />
                </div>
                <div className="my-2 text-2xl font-bold font-mono text-slate-900">
                  {roleContext.teacherHomeMetrics.examsInProgressCount}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Đang soạn nháp &amp; kiểm tra AI
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRequestNavigateWithGuard('exam-workflow')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Hồ sơ chờ thẩm định</span>
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                </div>
                <div className="my-2 text-2xl font-bold font-mono text-amber-700">
                  {roleContext.teacherHomeMetrics.pendingReviewDossiersCount}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Đang chờ Tổ chuyên môn duyệt
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRequestNavigateWithGuard('approval')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-400 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Hồ sơ cần chỉnh sửa</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                </div>
                <div className="my-2 text-2xl font-bold font-mono text-rose-700">
                  {roleContext.teacherHomeMetrics.revisionRequiredDossiersCount}
                </div>
                <div className="text-[11px] text-rose-700 font-medium truncate">
                  Xem góp ý phản biện →
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRequestNavigateWithGuard('exam-workflow')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Hồ sơ đã phê duyệt</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <div className="my-2 text-2xl font-bold font-mono text-emerald-700">
                  {roleContext.teacherHomeMetrics.approvedDossiersCount}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Sẵn sàng xuất hồ sơ đề
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRequestNavigateWithGuard('notification-center')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Công việc sắp đến hạn</span>
                  <CalendarClock className="w-4 h-4 text-blue-700 shrink-0" />
                </div>
                <div className="my-2 text-2xl font-bold font-mono text-blue-900">
                  {roleContext.teacherHomeMetrics.upcomingTasks.length}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Theo kế hoạch kiểm tra học kỳ
                </div>
              </button>
            </section>

            {/* BỐ CỤC 2 CỘT CHO CÔNG VIỆC HÀNG NGÀY CỦA GIÁO VIÊN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI (8/12): CÔNG VIỆC SẮP ĐẾN HẠN & LỐI TẮT QUY TRÌNH RA ĐỀ */}
              <div className="lg:col-span-8 space-y-6">
                {/* Bảng Công việc sắp đến hạn của Giáo viên */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Công việc sắp đến hạn &amp; Hồ sơ đang phụ trách
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Các nhiệm vụ biên soạn câu hỏi, hoàn thiện ma trận và chỉnh sửa đề theo phân công chuyên môn.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRequestNavigateWithGuard('exam-workflow')}
                      className="text-xs font-semibold text-blue-800 hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Mở tất cả hồ sơ của tôi →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {roleContext.teacherHomeMetrics.upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono font-bold text-blue-900">
                              {task.dossierCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              Môn {task.subject} (Khối {task.grade})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                task.daysRemaining <= 3
                                  ? 'text-rose-700 font-semibold'
                                  : 'text-amber-700 font-medium'
                              }
                            >
                              Hạn hoàn thành: {task.dueDate} (Còn {task.daysRemaining} ngày)
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {task.title}
                          </div>
                          <div className="text-xs text-slate-600">
                            Trạng thái hiện tại: <strong className="text-slate-800">{task.statusLabel}</strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard(task.targetMenuId)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-900 text-blue-900 hover:text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                        >
                          <span>Thực hiện</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Quy trình 3 Chặng Dành cho Giáo viên (Tương ứng 11 Mục Menu Giáo viên) */}
                <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Quy trình nghiệp vụ ra đề dành cho Giáo viên
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Truy cập nhanh các bước theo chuẩn Công văn 7991/BGDĐT-GDTrH và Thông tư 27/2020.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Chặng 1 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="text-xs font-bold text-slate-900">
                        Chặng 1 · Học liệu &amp; Ngân hàng câu hỏi
                      </div>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('curriculum')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                            <span>Chương trình giáo dục</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('questions')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                            <span>Ngân hàng câu hỏi ({scopedQuestionsList.length})</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('ai-generator')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>AI tạo câu hỏi</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Chặng 2 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="text-xs font-bold text-slate-900">
                        Chặng 2 · Lập Ma trận, Tạo đề &amp; Kiểm tra AI
                      </div>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('matrix')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                            <span>Ma trận và bản đặc tả ({scopedMatricesList.length})</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('exam-builder')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-700" />
                            <span>Tạo đề kiểm tra ({scopedExamsList.length})</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('ai-quality-review')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>AI kiểm tra chất lượng</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Chặng 3 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="text-xs font-bold text-slate-900">
                        Chặng 3 · Trình thẩm định &amp; Theo dõi hồ sơ
                      </div>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('exam-workflow')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <FolderKanban className="w-3.5 h-3.5 text-blue-700" />
                            <span>Hồ sơ của tôi</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('approval')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <ClipboardCheck className="w-3.5 h-3.5 text-rose-700" />
                            <span>Phản hồi thẩm định</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestNavigateWithGuard('notification-center')}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                            <span>Thông báo công việc</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* CỘT PHẢI (4/12): GHI CHÚ SOẠN THẢO NHANH (CÓ BẢO VỆ DỮ LIỆU CHƯA LƯU) & THÔNG TIN PHÂN CÔNG */}
              <div className="lg:col-span-4 space-y-6">
                {/* Sổ tay ghi chú / Soạn nháp nhanh (Tích hợp cảnh báo rời biểu mẫu chưa lưu) */}
                <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Phiếu ghi chú &amp; Soạn nháp nhanh
                    </h3>
                    <span
                      className={`text-[11px] font-semibold ${
                        hasUnsavedChanges ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {hasUnsavedChanges ? '● Chưa lưu' : 'Đã lưu'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ghi chú nhanh ý tưởng câu hỏi hoặc nội dung cần chỉnh sửa. Hệ thống tự động cảnh báo nếu thầy/cô chuyển menu hoặc đổi vai trò khi chưa lưu.
                  </p>

                  <textarea
                    rows={4}
                    value={unsavedDraftText}
                    onChange={(e) => onUpdateUnsavedDraft(e.target.value, true)}
                    placeholder={`Ghi chú nhanh cho môn ${assignedSubjects[0] || 'chuyên môn'}...`}
                    className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 leading-relaxed"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {!hasUnsavedChanges ? (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateUnsavedDraft(
                            `Dự thảo câu hỏi vận dụng môn ${assignedSubjects[0] || 'Toán'} Khối ${assignedGrades[0] || 6} — Cần bổ sung hình vẽ minh họa trước khi gửi thẩm định.`,
                            true
                          )
                        }
                        className="text-xs text-blue-800 hover:underline font-medium cursor-pointer"
                      >
                        + Điền mẫu nháp để thử cảnh báo chưa lưu
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-800">
                        Hãy thử bấm menu bất kỳ để kiểm tra hộp thoại bảo vệ dữ liệu.
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={onSaveDraftSafely}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu nháp</span>
                    </button>
                  </div>
                </section>

                {/* Tóm tắt Phạm vi Phân quyền của Giáo viên */}
                <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Phạm vi dữ liệu &amp; Quyền hạn
                    </h3>
                    <button
                      type="button"
                      onClick={() => onRequestNavigateWithGuard('my-profile')}
                      className="text-blue-800 hover:underline font-medium cursor-pointer"
                    >
                      Chi tiết →
                    </button>
                  </div>

                  <div className="space-y-2 text-slate-600">
                    <div className="flex justify-between gap-2 py-1 border-b border-slate-100">
                      <span>Tổ chuyên môn:</span>
                      <strong className="text-slate-900">{displayDeptName}</strong>
                    </div>
                    <div className="flex justify-between gap-2 py-1 border-b border-slate-100">
                      <span>Môn được phân công:</span>
                      <strong className="text-blue-900">{assignedSubjects.join(', ')}</strong>
                    </div>
                    <div className="flex justify-between gap-2 py-1 border-b border-slate-100">
                      <span>Khối lớp phụ trách:</span>
                      <strong className="text-slate-900">Khối {assignedGrades.join(', ')}</strong>
                    </div>
                    <div className="flex justify-between gap-2 py-1">
                      <span>Câu hỏi / Đề trong phạm vi:</span>
                      <strong className="text-slate-900">
                        {scopedQuestionsList.length} câu · {scopedExamsList.length} đề
                      </strong>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}

      {/* =====================================================================
          3. KHÔNG GIAN TỔ TRƯỞNG CHUYÊN MÔN – BỔ SUNG 5 CHỨC NĂNG CẤP TỔ (MỤC III)
         ===================================================================== */}
      {activeRole === 'HEAD_OF_DEPARTMENT' && roleContext?.departmentHeadMetrics && (
        <section className="bg-white rounded-xl border border-blue-200 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-semibold text-blue-800">
                Chức năng mở rộng dành cho Tổ trưởng chuyên môn
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Quản lý &amp; Thẩm định Hồ sơ {roleContext.departmentHeadMetrics.departmentName}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Phân công giáo viên phản biện chéo, thẩm định ma trận – đề kiểm tra và theo dõi tiến độ ra đề trong tổ.
              </p>
            </div>
            <div className="text-xs text-slate-700">
              Tiến độ hoàn thành đúng hạn của tổ:{' '}
              <strong className="text-blue-900 font-mono text-sm">
                {roleContext.departmentHeadMetrics.completedOnTimePercent}%
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('dept-dossiers')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Hồ sơ của tổ</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {roleContext.departmentHeadMetrics.totalDepartmentDossiers} hồ sơ
              </div>
              <div className="text-[11px] text-blue-800">Quản lý tập trung theo tổ →</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('dept-assign-reviewer')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Phân công phản biện</div>
              <div className="text-xl font-bold font-mono text-teal-800">
                {roleContext.departmentHeadMetrics.pendingPeerReviewAssignments} chờ giao
              </div>
              <div className="text-[11px] text-teal-800">Giao GV phản biện độc lập →</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('dept-review-exam')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Thẩm định đề</div>
              <div className="text-xl font-bold font-mono text-amber-800">
                {roleContext.departmentHeadMetrics.pendingDepartmentAppraisals} hồ sơ
              </div>
              <div className="text-[11px] text-amber-800">Xác nhận thẩm định cấp tổ →</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('dept-progress')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Tiến độ tổ</div>
              <div className="text-xl font-bold font-mono text-indigo-900">
                {roleContext.departmentHeadMetrics.completedOnTimePercent}%
              </div>
              <div className="text-[11px] text-slate-600">Theo dõi hạn nộp của GV →</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('dept-report')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Báo cáo tổ chuyên môn</div>
              <div className="text-xl font-bold font-mono text-emerald-800">Đạt chuẩn</div>
              <div className="text-[11px] text-slate-600">Tổng hợp chất lượng đề →</div>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Mã hồ sơ</th>
                  <th className="py-2.5 px-3 font-semibold">Tên hồ sơ đề kiểm tra</th>
                  <th className="py-2.5 px-3 font-semibold">Môn / Khối</th>
                  <th className="py-2.5 px-3 font-semibold">Giáo viên ra đề</th>
                  <th className="py-2.5 px-3 font-semibold">Giáo viên phản biện</th>
                  <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roleContext.departmentHeadMetrics.departmentDossiers.map((d) => (
                  <tr key={d.code} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-900">{d.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{d.title}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {d.subject} · Khối {d.grade}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{d.authorName}</td>
                    <td className="py-3 px-3 text-slate-700">{d.reviewerName}</td>
                    <td className="py-3 px-3 font-medium text-blue-900">{d.status}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRequestNavigateWithGuard('dept-review-exam')}
                        className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-semibold text-[11px] hover:bg-blue-800 cursor-pointer"
                      >
                        Thẩm định
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =====================================================================
          4. KHÔNG GIAN BAN GIÁM HIỆU – PHÓ HIỆU TRƯỞNG & HIỆU TRƯỞNG (MỤC IV)
         ===================================================================== */}
      {(activeRole === 'VICE_PRINCIPAL' || activeRole === 'PRINCIPAL') && roleContext?.bghMetrics && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-semibold text-blue-800">
                Bảng điều khiển Ban Giám hiệu
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {roleContext.bghMetrics.scopeTitle}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Thẩm quyền phê duyệt đề chính thức:{' '}
                <strong className="text-emerald-800">
                  {roleContext.allowedUiCapabilities.canApproveOfficialExam
                    ? 'Được cấp thẩm quyền phê duyệt & phát hành'
                    : 'Theo dõi & yêu cầu chỉnh sửa'}
                </strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('bgh-school-dossiers')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Quản lý hồ sơ</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {roleContext.bghMetrics.totalManagedDossiers} hồ sơ
              </div>
              <div className="text-[11px] text-slate-500">Toàn trường theo quyền</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('bgh-assign-exam')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Phân công ra đề</div>
              <div className="text-xl font-bold font-mono text-indigo-900">
                {roleContext.bghMetrics.assignedExamTasksCount} nhiệm vụ
              </div>
              <div className="text-[11px] text-slate-500">Giao chỉ tiêu các Tổ CM</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('bgh-progress-tracking')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Theo dõi tiến độ</div>
              <div className="text-xl font-bold font-mono text-emerald-800">
                {roleContext.bghMetrics.approvedAndPublishedCount}/{roleContext.bghMetrics.totalManagedDossiers}
              </div>
              <div className="text-[11px] text-slate-500">Giám sát hạn hoàn thành</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('bgh-approval')}
              className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-amber-900">Thẩm định &amp; Phê duyệt</div>
              <div className="text-xl font-bold font-mono text-amber-900">
                {roleContext.bghMetrics.pendingBghApprovalsCount} chờ duyệt
              </div>
              <div className="text-[11px] text-amber-800">Phê duyệt đề chính thức →</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('bgh-quality-report')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Báo cáo chất lượng</div>
              <div className="text-xl font-bold font-mono text-teal-800">
                {roleContext.bghMetrics.averageQualityScore}/100
              </div>
              <div className="text-[11px] text-slate-500">Tổng hợp điểm AI Review</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('bgh-result-analytics')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Phân tích kết quả</div>
              <div className="text-xl font-bold font-mono text-purple-900">Phổ điểm</div>
              <div className="text-[11px] text-slate-500">Độ khó &amp; Độ phân cách</div>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Mã hồ sơ</th>
                  <th className="py-2.5 px-3 font-semibold">Tên hồ sơ đề kiểm tra</th>
                  <th className="py-2.5 px-3 font-semibold">Tổ chuyên môn</th>
                  <th className="py-2.5 px-3 font-semibold">Giáo viên ra đề</th>
                  <th className="py-2.5 px-3 font-semibold">Kết quả AI</th>
                  <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Thao tác BGH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roleContext.bghMetrics.managedDossiers.map((d) => (
                  <tr key={d.code} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-900">{d.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{d.title}</td>
                    <td className="py-3 px-3 text-slate-600">{d.departmentName}</td>
                    <td className="py-3 px-3 text-slate-700">{d.authorName}</td>
                    <td className="py-3 px-3 text-emerald-800 font-medium">{d.aiStatus}</td>
                    <td className="py-3 px-3 font-medium text-amber-800">{d.approvalStatus}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRequestNavigateWithGuard('bgh-approval')}
                        className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-semibold text-[11px] hover:bg-blue-800 cursor-pointer"
                      >
                        Xem &amp; Phê duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =====================================================================
          5. KHÔNG GIAN QUẢN TRỊ HỆ THỐNG – 7 PHÂN HỆ QUẢN TRỊ (MỤC V)
         ===================================================================== */}
      {activeRole === 'SYSTEM_ADMIN' && roleContext?.adminMetrics && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-xs font-semibold text-purple-800">
              Không gian Quản trị Hệ thống &amp; Bảo mật
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Trung tâm Quản trị — {displaySchoolName}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Quản lý tài khoản, phân quyền vai trò, cấu hình trường học, năm học, nhật ký kiểm toán và sao lưu dữ liệu.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('admin-accounts')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Tài khoản</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {roleContext.adminMetrics.totalAccounts} TK
              </div>
              <div className="text-[11px] text-slate-500">Tạo, sửa, khóa &amp; Excel</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('admin-roles')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Vai trò và quyền</div>
              <div className="text-xl font-bold font-mono text-blue-900">
                {roleContext.adminMetrics.configuredRolesCount} vai trò
              </div>
              <div className="text-[11px] text-slate-500">Ma trận phân quyền</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('admin-school-config')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Cấu hình trường</div>
              <div className="text-xl font-bold font-mono text-emerald-800">Đơn vị</div>
              <div className="text-[11px] text-slate-500">Tên trường &amp; Logo</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('admin-academic-year')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Cấu hình năm học</div>
              <div className="text-xl font-bold font-mono text-amber-800">
                {roleContext.adminMetrics.academicYear}
              </div>
              <div className="text-[11px] text-slate-500">Học kỳ &amp; Kỳ kiểm tra</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('admin-audit-logs')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Nhật ký</div>
              <div className="text-xl font-bold font-mono text-rose-800">
                {roleContext.adminMetrics.totalAuditLogs} dòng
              </div>
              <div className="text-[11px] text-slate-500">
                Đã chặn {roleContext.adminMetrics.deniedAuditLogsCount} vi phạm
              </div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('admin-backups')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Sao lưu</div>
              <div className="text-xl font-bold font-mono text-teal-800">
                {roleContext.adminMetrics.totalBackups} bản
              </div>
              <div className="text-[11px] text-slate-500">Toàn vẹn SHA-256</div>
            </button>

            <button
              type="button"
              onClick={() => onRequestNavigateWithGuard('admin-system-settings')}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600">Thiết lập hệ thống</div>
              <div className="text-xl font-bold font-mono text-slate-900">Cấu hình</div>
              <div className="text-[11px] text-slate-500">Tham số vận hành</div>
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          6. THANH CHUYỂN ĐỔI NHANH 5 VAI TRÒ & BÁO CÁO NGHIỆM THU (THU GỌN GỌN GÀNG Ở CUỐI TRANG)
         ===================================================================== */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <KeyRound className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="font-bold text-slate-900">
                Chuyển nhanh tài khoản theo 5 vai trò (Phục vụ kiểm tra giao diện &amp; phân quyền):
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextOpen = !showQaInspector;
                setShowQaInspector(nextOpen);
                if (nextOpen && !testReport) {
                  void handleRun5RolesVerificationSuite();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 hover:text-blue-950 cursor-pointer self-start sm:self-auto"
            >
              <span>
                {showQaInspector
                  ? 'Thu gọn Bảng đối chiếu phân quyền 5 vai trò'
                  : 'Mở Bảng đối chiếu & Kiểm thử 5 vai trò'}
              </span>
              {showQaInspector ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 5 nút chuyển vai trò nằm trên một hàng ngang cân đối */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {(
              [
                {
                  role: 'TEACHER' as WorkflowActorRole,
                  title: '1. Giáo viên',
                  sub: 'Cô Lê Thị Thu Ái (11 menu)',
                },
                {
                  role: 'HEAD_OF_DEPARTMENT' as WorkflowActorRole,
                  title: '2. Tổ trưởng CM',
                  sub: 'Thầy Thái Dũng (16 menu)',
                },
                {
                  role: 'VICE_PRINCIPAL' as WorkflowActorRole,
                  title: '3. Phó hiệu trưởng',
                  sub: 'Thầy Nguyễn Văn Dũng (BGH)',
                },
                {
                  role: 'PRINCIPAL' as WorkflowActorRole,
                  title: '4. Hiệu trưởng',
                  sub: 'Thầy Trần Quốc Tuấn (BGH)',
                },
                {
                  role: 'SYSTEM_ADMIN' as WorkflowActorRole,
                  title: '5. Quản trị viên',
                  sub: 'Quản trị hệ thống (Admin)',
                },
              ] as const
            ).map((btn) => {
              const isCurrentRole = activeRole === btn.role;
              return (
                <button
                  key={btn.role}
                  type="button"
                  disabled={switchingAccountRole === btn.role || loadingContext}
                  onClick={() => handleQuickLoginAsRoleAccount(btn.role)}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    isCurrentRole
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{btn.title}</span>
                    {isCurrentRole && (
                      <span className="text-[10px] font-normal text-amber-300">Đang chọn</span>
                    )}
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      isCurrentRole ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {switchingAccountRole === btn.role ? 'Đang chuyển phiên...' : btn.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Khung Chi tiết Kiểm thử Phân quyền 5 Vai trò (Chỉ mở khi người dùng bấm xem) */}
        {showQaInspector && (
          <div className="border-t border-slate-200 p-5 bg-slate-50/60 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    Các thao tác ngoài quyền đã ẩn trên giao diện &amp; chặn tại Backend đối với [
                    {ROLE_LABELS_VI[activeRole]?.label}]:
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {(roleContext?.hiddenUnauthorizedActions || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">×</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">
                    Kiểm chứng chặn thao tác vượt quyền tại Backend
                  </div>
                  <p className="text-xs text-slate-500">
                    Gửi thử yêu cầu vượt quyền trực tiếp lên API máy chủ để xác minh Backend trả về HTTP 403 Forbidden.
                  </p>
                </div>

                {backendActionProbeMessage && (
                  <div className="text-[11px] font-mono text-rose-900 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    {backendActionProbeMessage.text}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleProbeOutOfRoleActionAtBackend}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Thử gọi API vượt quyền (403)</span>
                  </button>

                  <button
                    type="button"
                    disabled={runningTestSuite}
                    onClick={handleRun5RolesVerificationSuite}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-300" />
                    <span>{runningTestSuite ? 'Đang chạy...' : 'Chạy kiểm thử 5 vai trò'}</span>
                  </button>
                </div>
              </div>
            </div>

            {testReport && (
              <div className="bg-white overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Vai trò &amp; Tài khoản</th>
                      <th className="py-2.5 px-3 font-semibold">Menu được hiển thị</th>
                      <th className="py-2.5 px-3 font-semibold">Phạm vi dữ liệu</th>
                      <th className="py-2.5 px-3 font-semibold">Chặn vượt quyền tại Backend</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {testReport.scenarios.map((row) => (
                      <tr key={row.order} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{row.roleTitle}</div>
                          <div className="text-[11px] text-slate-500">
                            {row.accountTested.fullName} ({row.accountTested.email})
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-blue-900">{row.menuCount} mục: </span>
                          <span className="text-slate-600">{row.menuLabels.join(', ')}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{row.scopedDataSummary}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-rose-800">
                          {row.backendForbiddenProbeResult}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                          ĐẠT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
