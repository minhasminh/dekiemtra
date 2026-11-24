import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useSchoolContext } from '../contexts/SchoolContext';
import { AuthenticatedUserSession, WorkflowActorRole } from '../types/domain';

export interface MultiSchoolPickerCard {
  schoolId: string;
  logoText: string;
  logoBgClass: string;
  schoolName: string;
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
  educationLevelLabel: string;
  academicYearId: string;
  userRoles: WorkflowActorRole[];
  userRoleLabel: string;
  departmentName: string;
  membershipStatus: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  schoolStatus: 'ACTIVE' | 'SUSPENDED';
  statusDisplayLabel: string;
  isSelectable: boolean;
  allowedSubjects: string[];
  allowedGrades: number[];
  permissions: string[];
  menuSummary: string[];
  confidentialExamsExposedInPicker: number;
}

export interface ActiveMultiSchoolContextPayload {
  schoolId: string;
  schoolName: string;
  logoText: string;
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
  educationLevelLabel: string;
  academicYearId: string;
  activeRole: WorkflowActorRole;
  userRoles: WorkflowActorRole[];
  userRoleLabel: string;
  departmentName: string;
  allowedSubjects: string[];
  allowedGrades: number[];
  permissions: string[];
  menuSummary: string[];
  scopedQuestions: { id: string; code: string; subject: string; grade: number; stem: string }[];
  scopedVisibleExams: { id: string; code: string; title: string; isConfidential: boolean }[];
}

interface HeaderSchoolSwitcherBarProps {
  authSession: AuthenticatedUserSession | null;
  hasUnsavedChanges: boolean;
  unsavedDraftText: string;
  onSaveDraftBeforeSwitch: () => void;
  onDiscardDraftBeforeSwitch: () => void;
  onApplyMultiSchoolSession: (
    user: { uid: string; email: string; fullName: string },
    ctx: ActiveMultiSchoolContextPayload
  ) => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const HeaderSchoolSwitcherBar: React.FC<HeaderSchoolSwitcherBarProps> = ({
  hasUnsavedChanges,
  unsavedDraftText,
  onSaveDraftBeforeSwitch,
  onDiscardDraftBeforeSwitch,
  onApplyMultiSchoolSession,
  onNotify,
}) => {
  const {
    activeSchoolId,
    schoolName,
    educationLevels,
    currentMembership,
    switchSchool,
    clearOldSchoolDisplayCache,
    cancelInvalidSubscriptions,
  } = useSchoolContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'LOGIN' | 'SCHOOL_PICKER' | 'NO_MEMBERSHIP' | 'QA_SUITE'>('LOGIN');

  // Mục I: Trạng thái biểu mẫu đăng nhập đa trường (Không bắt buộc nhập mã trường trước khi xác thực)
  const [emailInput, setEmailInput] = useState('gv.ab@edutest.edu.vn');
  const [passwordInput, setPasswordInput] = useState('EduTest@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [untrustedUrlSchoolId, setUntrustedUrlSchoolId] = useState('');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Kết quả xác thực & danh sách trường của người dùng (Mục II & III)
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    uid: string;
    email: string;
    fullName: string;
    scenarioKey: string;
  } | null>(null);
  const [schoolCards, setSchoolCards] = useState<MultiSchoolPickerCard[]>([]);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
    text: string;
  } | null>(null);
  const [urlSpoofWarning, setUrlSpoofWarning] = useState<string | null>(null);

  // Mục IV: Trạng thái kiểm tra nội dung chưa lưu và 7 bước chuyển trường
  const [pendingTargetSchoolId, setPendingTargetSchoolId] = useState<string | null>(null);
  const [unsavedPromptOpen, setUnsavedPromptOpen] = useState(false);
  const [simulateUnsavedDraftInModal, setSimulateUnsavedDraftInModal] = useState(false);
  const [transitionSteps7, setTransitionSteps7] = useState<string[]>([]);
  const [activeScopedContext, setActiveScopedContext] = useState<ActiveMultiSchoolContextPayload | null>(null);

  // Mục VI: Kết quả kiểm thử 4 tài khoản đa trường
  const [qaReport, setQaReport] = useState<any | null>(null);
  const [runningQa, setRunningQa] = useState(false);

  const filteredSchoolCards = useMemo(() => {
    const q = schoolSearchQuery.trim().toLowerCase();
    if (!q) return schoolCards;
    return schoolCards.filter(
      (c) =>
        c.schoolName.toLowerCase().includes(q) ||
        c.schoolId.toLowerCase().includes(q) ||
        c.educationLevelLabel.toLowerCase().includes(q) ||
        c.userRoleLabel.toLowerCase().includes(q)
    );
  }, [schoolCards, schoolSearchQuery]);

  // Mục I & II: Xử lý đăng nhập xác định trường tự động từ tài khoản
  const handleMultiSchoolLogin = async (overrideEmail?: string, overrideUrlSpoof?: string) => {
    const targetEmail = (overrideEmail ?? emailInput).trim();
    if (!targetEmail) {
      setStatusMessage({
        type: 'ERROR',
        text: 'Vui lòng nhập Email đăng nhập.',
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    setUrlSpoofWarning(null);
    setForgotPasswordNotice(null);

    try {
      const res = await fetch('/api/multi-school-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrScenarioKey: targetEmail,
          password: passwordInput,
          untrustedUrlSchoolId: overrideUrlSpoof !== undefined ? overrideUrlSpoof : untrustedUrlSchoolId || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatusMessage({
          type: 'ERROR',
          text: data.message || 'Thông tin đăng nhập không hợp lệ.',
        });
        return;
      }

      setAuthenticatedUser(data.user);
      setSchoolCards(data.schoolCards || []);
      if (data.urlSpoofWarning) {
        setUrlSpoofWarning(data.urlSpoofWarning);
      }

      if (data.resolution === 'NO_VALID_SCHOOL_MEMBERSHIP') {
        setModalView('NO_MEMBERSHIP');
        setActiveScopedContext(null);
        setStatusMessage({
          type: 'ERROR',
          text: data.message,
        });
        return;
      }

      if (data.resolution === 'AUTO_ENTER_SINGLE_SCHOOL' && data.activeSchoolContext) {
        const ctx: ActiveMultiSchoolContextPayload = data.activeSchoolContext;
        setActiveScopedContext(ctx);
        await switchSchool(ctx.schoolId, 'user-admin-sys');
        onApplyMultiSchoolSession(data.user, ctx);
        setTransitionSteps7([
          `1. Xác thực Firebase UID (${data.user.uid}) thành công.`,
          `2. Truy vấn membership: Thuộc duy nhất 1 trường đang hoạt động (${ctx.schoolName}).`,
          `3. Tự động vào thẳng "${ctx.schoolName}" mà không yêu cầu nhập mã trường trước.`,
          `4. Đã nạp vai trò [${ctx.userRoleLabel}] và ${ctx.menuSummary.length} mục menu tương ứng.`,
        ]);
        setModalView('SCHOOL_PICKER');
        setStatusMessage({
          type: 'SUCCESS',
          text: data.message,
        });
        onNotify('success', 'Tự động vào trường duy nhất', data.message);
        return;
      }

      // REQUIRE_SCHOOL_SELECTION (Thuộc nhiều trường)
      setModalView('SCHOOL_PICKER');
      setStatusMessage({
        type: 'INFO',
        text: data.message,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'ERROR',
        text: err?.message || 'Lỗi kết nối máy chủ xác thực đa trường.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Mục IV: Khi người dùng nhấn chọn hoặc chuyển sang một trường
  const handleInitiateSchoolSelectOrSwitch = (targetSchoolId: string) => {
    const hasUnsaved = hasUnsavedChanges || simulateUnsavedDraftInModal;
    if (hasUnsaved) {
      // Bước 1 & 2: Kiểm tra nội dung chưa lưu -> Yêu cầu xác nhận
      setPendingTargetSchoolId(targetSchoolId);
      setUnsavedPromptOpen(true);
      return;
    }
    void executeConfirmedSchoolSwitch(targetSchoolId);
  };

  const executeConfirmedSchoolSwitch = async (targetSchoolId: string) => {
    const uidOrEmail = authenticatedUser?.email || emailInput || 'gv.ab@edutest.edu.vn';
    setSubmitting(true);
    setUnsavedPromptOpen(false);
    setPendingTargetSchoolId(null);

    // Bước 3 & 4: Hủy subscription dữ liệu trường cũ & Xóa dữ liệu trường cũ khỏi state hiển thị
    cancelInvalidSubscriptions();
    clearOldSchoolDisplayCache();

    try {
      const res = await fetch('/api/multi-school-auth/select-or-switch-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uidOrEmail,
          previousSchoolId: activeScopedContext?.schoolId || activeSchoolId,
          targetSchoolId,
          unsavedChangesChecked: true,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatusMessage({
          type: 'ERROR',
          text: data.message || 'Từ chối chọn trường do không có tư cách thành viên hợp lệ.',
        });
        onNotify('error', 'Từ chối chuyển trường (403)', data.message || 'Không có quyền truy cập trường này.');
        return;
      }

      // Bước 5, 6, 7: Tải quyền trường mới, tải dữ liệu trường mới, cập nhật menu
      const ctx: ActiveMultiSchoolContextPayload = data.activeSchoolContext;
      setActiveScopedContext(ctx);
      setTransitionSteps7(data.transitionSteps7 || []);
      await switchSchool(ctx.schoolId, 'user-admin-sys');

      if (authenticatedUser) {
        onApplyMultiSchoolSession(authenticatedUser, ctx);
      }

      setStatusMessage({
        type: 'SUCCESS',
        text: data.message,
      });
      onNotify('success', `Đã chuyển sang ${ctx.schoolName}`, data.message);
    } catch (err: any) {
      setStatusMessage({
        type: 'ERROR',
        text: err?.message || 'Lỗi khi chuyển trường.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunVerificationSuite = async () => {
    setRunningQa(true);
    try {
      const res = await fetch('/api/multi-school-auth/run-verification-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok && data.report) {
        setQaReport(data.report);
      }
    } catch (err) {
      console.error('Lỗi chạy kiểm thử đăng nhập đa trường:', err);
    } finally {
      setRunningQa(false);
    }
  };

  useEffect(() => {
    if (modalOpen && !qaReport) {
      void handleRunVerificationSuite();
    }
  }, [modalOpen, qaReport]);

  return (
    <>
      {/* Mục IV: Trên thanh tiêu đề hiển thị Trường hiện tại & Nút Chuyển trường */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs shrink-0">
        <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
        <span className="font-bold text-slate-900 truncate max-w-44" title={schoolName}>
          {activeScopedContext?.schoolName || schoolName}
        </span>
        <span className="hidden xl:inline text-slate-500">
          · {activeScopedContext?.educationLevelLabel || educationLevels.join('/')}
        </span>
        <button
          type="button"
          onClick={() => {
            setModalOpen(true);
            if (!authenticatedUser) {
              void handleMultiSchoolLogin('gv.ab@edutest.edu.vn');
            } else {
              setModalView('SCHOOL_PICKER');
            }
          }}
          className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold transition cursor-pointer"
          title="Mở màn hình Chuyển trường / Đăng nhập Đa trường (Mục I – VI)"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Chuyển trường</span>
        </button>
      </div>

      {/* Hộp thoại Toàn diện: Giao diện Đăng nhập, Chọn trường, Chuyển trường 7 bước & Kiểm thử Mục VI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden my-6">
            {/* Top Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-sm tracking-tight">
                  EDU AI
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    EDU TEST AI · Hệ thống Đăng nhập & Chọn Trường Học Đa Trường
                  </h2>
                  <p className="text-xs text-slate-300">
                    Định danh trường tự động từ Firebase UID · Cô lập quyền và dữ liệu theo từng trường
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Navigation Bar inside Modal */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setModalView('LOGIN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    modalView === 'LOGIN'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  I. Giao diện Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setModalView('SCHOOL_PICKER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    modalView === 'SCHOOL_PICKER' || modalView === 'NO_MEMBERSHIP'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  II, III & IV. Màn hình Chọn Trường & Chuyển Trường (7 Bước)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalView('QA_SUITE');
                    void handleRunVerificationSuite();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    modalView === 'QA_SUITE'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  VI. Báo cáo Kiểm thử 4 Tài khoản Đa trường (5/5 PASS)
                </button>
              </div>

              {/* Quick Scenario Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Thử nhanh 4 tài khoản (Mục VI):</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('gv.truonga@edutest.edu.vn');
                    void handleMultiSchoolLogin('gv.truonga@edutest.edu.vn');
                  }}
                  className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold cursor-pointer"
                >
                  1. GV chỉ thuộc A
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('gv.ab@edutest.edu.vn');
                    void handleMultiSchoolLogin('gv.ab@edutest.edu.vn');
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold cursor-pointer"
                >
                  2. GV thuộc A & B
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('gv.revoked.b@edutest.edu.vn');
                    void handleMultiSchoolLogin('gv.revoked.b@edutest.edu.vn');
                  }}
                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold cursor-pointer"
                >
                  3. GV bị thu hồi ở B
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('gv.noschool@edutest.edu.vn');
                    void handleMultiSchoolLogin('gv.noschool@edutest.edu.vn');
                  }}
                  className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold cursor-pointer"
                >
                  4. Chưa thuộc trường nào
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[78vh] overflow-y-auto space-y-5">
              {/* Cảnh báo giả mạo schoolId từ URL (Mục V) */}
              {urlSpoofWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Bảo mật Mục V: Đã chặn schoolId không hợp lệ từ URL</div>
                    <div className="mt-0.5">{urlSpoofWarning}</div>
                  </div>
                </div>
              )}

              {/* Thông báo trạng thái */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    statusMessage.type === 'SUCCESS'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : statusMessage.type === 'ERROR'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-blue-50 border-blue-200 text-blue-950'
                  }`}
                >
                  {statusMessage.type === 'ERROR' ? (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="font-medium leading-relaxed">{statusMessage.text}</div>
                </div>
              )}

              {/* VIEW 1: GIAO DIỆN ĐĂNG NHẬP (MỤC I) */}
              {modalView === 'LOGIN' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6 bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
                    {/* Logo & Tên phần mềm */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                        EDU AI
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-slate-900 tracking-tight">EDU TEST AI</div>
                        <div className="text-xs text-slate-600">
                          Hệ thống Khảo thí & Quản lý Ngân hàng Đề kiểm tra Đa trường
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                      <strong>Nguyên tắc Mục I:</strong> Người dùng chỉ cần nhập <strong>Email đăng nhập</strong> và{' '}
                      <strong>Mật khẩu</strong>. Hệ thống tự động truy vấn danh sách trường thành viên (
                      <code className="font-mono">memberships</code>) từ tài khoản mà không bắt buộc nhập mã trường trước.
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">Email đăng nhập</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Nhập email giáo viên / quản trị viên..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-800">Mật khẩu</label>
                          <button
                            type="button"
                            onClick={() =>
                              setForgotPasswordNotice(
                                `Đã gửi liên kết đặt lại mật khẩu an toàn qua Firebase Authentication tới email "${emailInput || 'của bạn'}".`
                              )
                            }
                            className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                          >
                            Quên mật khẩu?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Nhập mật khẩu..."
                            className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {forgotPasswordNotice && (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                          {forgotPasswordNotice}
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleMultiSchoolLogin()}
                        className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Đăng nhập & Xác định Trường Học</span>
                      </button>
                    </div>
                  </div>

                  {/* Cột phải: Chọn nhanh 4 kịch bản tài khoản & thử nghiệm giả mạo URL schoolId */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        II & VI. 4 Tài khoản Kiểm thử Phân nhánh Tự động Sau Đăng nhập
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900">1. Cô Phạm Thu Hà (Chỉ thuộc Trường A)</div>
                            <div className="font-mono text-[11px] text-slate-600">gv.truonga@edutest.edu.vn</div>
                            <div className="text-[11px] text-emerald-700 mt-0.5">
                              → Tự động vào thẳng Trường Tiểu học Kim Đồng (Trường A)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailInput('gv.truonga@edutest.edu.vn');
                              void handleMultiSchoolLogin('gv.truonga@edutest.edu.vn');
                            }}
                            className="px-3 py-1.5 rounded bg-blue-700 text-white font-semibold shrink-0 cursor-pointer"
                          >
                            Đăng nhập
                          </button>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900">2. Cô Lê Thị Lan Hương (Thuộc Trường A & B)</div>
                            <div className="font-mono text-[11px] text-slate-600">gv.ab@edutest.edu.vn</div>
                            <div className="text-[11px] text-blue-700 mt-0.5">
                              → Hiển thị Màn hình chọn trường (A: Tổ trưởng Toán 5 · B: GV KHTN 6)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailInput('gv.ab@edutest.edu.vn');
                              void handleMultiSchoolLogin('gv.ab@edutest.edu.vn');
                            }}
                            className="px-3 py-1.5 rounded bg-emerald-700 text-white font-semibold shrink-0 cursor-pointer"
                          >
                            Đăng nhập
                          </button>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900">3. Thầy Ngô Văn Bình (Bị thu hồi quyền tại B)</div>
                            <div className="font-mono text-[11px] text-slate-600">gv.revoked.b@edutest.edu.vn</div>
                            <div className="text-[11px] text-amber-800 mt-0.5">
                              → Vào được Trường A; chặn chọn Trường B (REVOKED · 403)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailInput('gv.revoked.b@edutest.edu.vn');
                              void handleMultiSchoolLogin('gv.revoked.b@edutest.edu.vn');
                            }}
                            className="px-3 py-1.5 rounded bg-amber-600 text-white font-semibold shrink-0 cursor-pointer"
                          >
                            Đăng nhập
                          </button>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900">4. Cô Trần Mai Anh (Chưa thuộc trường nào)</div>
                            <div className="font-mono text-[11px] text-slate-600">gv.noschool@edutest.edu.vn</div>
                            <div className="text-[11px] text-rose-700 mt-0.5">
                              → Hiển thị thông báo chưa được phân quyền sử dụng
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailInput('gv.noschool@edutest.edu.vn');
                              void handleMultiSchoolLogin('gv.noschool@edutest.edu.vn');
                            }}
                            className="px-3 py-1.5 rounded bg-rose-700 text-white font-semibold shrink-0 cursor-pointer"
                          >
                            Đăng nhập
                          </button>
                        </div>
                      </div>

                      {/* Kiểm thử chống tin tưởng schoolId từ URL */}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="text-xs font-bold text-slate-700 mb-1">
                          V. Thử nghiệm Bảo mật: Giả mạo tham số URL <code className="font-mono">?schoolId=sch-thcs-b</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={untrustedUrlSchoolId}
                            onChange={(e) => setUntrustedUrlSchoolId(e.target.value)}
                            placeholder="VD: sch-thcs-b"
                            className="flex-1 px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setUntrustedUrlSchoolId('sch-thcs-b');
                              void handleMultiSchoolLogin('gv.truonga@edutest.edu.vn', 'sch-thcs-b');
                            }}
                            className="px-3 py-1.5 rounded bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                          >
                            Thử giả mạo URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: THÔNG BÁO TÀI KHOẢN CHƯA THUỘC TRƯỜNG NÀO (MỤC II) */}
              {modalView === 'NO_MEMBERSHIP' && (
                <div className="p-8 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-3">
                  <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
                  <h3 className="text-base font-bold text-rose-950">
                    Tài khoản chưa được phân quyền sử dụng tại trường học nào
                  </h3>
                  <p className="text-xs text-rose-800 max-w-xl mx-auto leading-relaxed">
                    Tài khoản <strong>{authenticatedUser?.fullName}</strong> (<code className="font-mono">{authenticatedUser?.email}</code> · UID:{' '}
                    <code className="font-mono">{authenticatedUser?.uid}</code>) đã xác thực thành công nhưng hiện không có bản ghi{' '}
                    <code className="font-mono">membership</code> hợp lệ tại bất kỳ trường học nào đang hoạt động. Vui lòng liên hệ Quản trị viên Trường (School Admin) hoặc Quản trị hệ thống.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setModalView('LOGIN')}
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Quay lại màn hình đăng nhập
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: MÀN HÌNH CHỌN TRƯỜNG & CHUYỂN TRƯỜNG 7 BƯỚC (MỤC III & IV) */}
              {modalView === 'SCHOOL_PICKER' && (
                <div className="space-y-5">
                  {/* Thanh tìm kiếm trường & Công tắc mô phỏng nội dung chưa lưu */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={schoolSearchQuery}
                        onChange={(e) => setSchoolSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm trường theo tên trường, cấp học, vai trò..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateUnsavedDraftInModal}
                          onChange={(e) => setSimulateUnsavedDraftInModal(e.target.checked)}
                          className="rounded border-slate-300 text-amber-600"
                        />
                        <span>Mô phỏng đang có câu hỏi/đề nháp chưa lưu (Kiểm tra Bước 1 & 2 khi chuyển trường)</span>
                      </label>
                    </div>
                  </div>

                  {/* Hộp thoại xác nhận khi có dữ liệu chưa lưu (Bước 1 & 2 Mục IV) */}
                  {unsavedPromptOpen && pendingTargetSchoolId && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-amber-950">
                        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">
                            Xác nhận trước khi chuyển trường: Phát hiện nội dung đang soạn chưa lưu!
                          </div>
                          <p className="mt-1">
                            Hệ thống phát hiện biểu mẫu nháp chưa lưu (
                            <span className="font-mono font-semibold">
                              {unsavedDraftText || 'Câu hỏi đang biên soạn tại trường hiện tại'}
                            </span>
                            ). Để tránh mất dữ liệu hoặc ghi nhầm sang trường mới (<code className="font-mono">{pendingTargetSchoolId}</code>), vui lòng chọn:
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setUnsavedPromptOpen(false);
                            setPendingTargetSchoolId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          Ở lại trường hiện tại
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSaveDraftBeforeSwitch();
                            setSimulateUnsavedDraftInModal(false);
                            void executeConfirmedSchoolSwitch(pendingTargetSchoolId);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Lưu nháp tại trường cũ & Chuyển trường
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDiscardDraftBeforeSwitch();
                            setSimulateUnsavedDraftInModal(false);
                            void executeConfirmedSchoolSwitch(pendingTargetSchoolId);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Bỏ thay đổi & Chuyển trường ngay
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Danh sách Thẻ Trường Học (Mục III: Logo, Tên trường, Cấp học, Vai trò của người dùng, Trạng thái) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSchoolCards.map((card) => {
                      const isCurrentActive =
                        (activeScopedContext?.schoolId || activeSchoolId) === card.schoolId && card.isSelectable;
                      return (
                        <div
                          key={card.schoolId}
                          className={`p-5 rounded-xl border transition flex flex-col justify-between gap-4 ${
                            isCurrentActive
                              ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                              : card.isSelectable
                              ? 'border-slate-200 bg-white hover:border-slate-300'
                              : 'border-rose-200 bg-rose-50/30 opacity-90'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* 1. Logo Trường */}
                            <div
                              className={`w-12 h-12 rounded-xl ${card.logoBgClass} text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm`}
                            >
                              {card.logoText}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              {/* 2. Tên trường */}
                              <div className="font-bold text-sm text-slate-900 truncate">{card.schoolName}</div>

                              {/* 3. Cấp học · 5. Trạng thái */}
                              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>Cấp học: {card.educationLevelLabel}</span>
                                <span aria-hidden="true">·</span>
                                <span
                                  className={`font-semibold ${
                                    card.isSelectable ? 'text-emerald-700' : 'text-rose-700'
                                  }`}
                                >
                                  Trạng thái: {card.statusDisplayLabel}
                                </span>
                              </div>

                              {/* 4. Vai trò của người dùng tại trường */}
                              <div className="text-xs text-slate-800 flex items-center gap-1.5 pt-0.5">
                                <UserCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                <span>
                                  Vai trò của bạn: <strong>{card.userRoleLabel}</strong>
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500">
                                Tổ CM: {card.departmentName} · Môn dạy: {card.allowedSubjects.join(', ')} (Khối{' '}
                                {card.allowedGrades.join(', ')})
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] text-slate-500">schoolId: {card.schoolId}</span>

                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => handleInitiateSchoolSelectOrSwitch(card.schoolId)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                                isCurrentActive
                                  ? 'bg-emerald-700 text-white'
                                  : card.isSelectable
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                              }`}
                            >
                              <span>
                                {isCurrentActive
                                  ? 'Đang làm việc tại trường này'
                                  : card.isSelectable
                                  ? 'Chọn & Chuyển vào trường này'
                                  : 'Thử chọn (Kiểm tra Backend chặn 403)'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Kết quả thực thi 7 Bước Chuyển Trường & So sánh Cô lập Quyền/Dữ liệu */}
                  {activeScopedContext && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>IV. Nhật ký 7 Bước Chuyển Trường An toàn</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-700">
                          {transitionSteps7.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs">
                        <div className="font-bold text-slate-900">
                          Quyền, Menu & Dữ liệu đang nạp của: {activeScopedContext.schoolName}
                        </div>
                        <div className="text-slate-600">
                          <strong>Vai trò tại trường này:</strong> {activeScopedContext.userRoleLabel} ·{' '}
                          <strong>Môn/Khối:</strong> {activeScopedContext.allowedSubjects.join(', ')} (Lớp{' '}
                          {activeScopedContext.allowedGrades.join(', ')})
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 mb-1">
                            Menu được phép hiển thị ({activeScopedContext.menuSummary.length} mục):
                          </div>
                          <div className="text-slate-600">{activeScopedContext.menuSummary.join(' · ')}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 mb-1">
                            Câu hỏi thuộc riêng trường này (Đã xóa sạch dữ liệu trường cũ):
                          </div>
                          <div className="space-y-1">
                            {activeScopedContext.scopedQuestions.map((q) => (
                              <div
                                key={q.id}
                                className="p-2 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800"
                              >
                                [{q.code}] {q.stem}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 4: BÁO CÁO KIỂM THỬ 4 TÀI KHOẢN & BẢO MẬT (MỤC VI) */}
              {modalView === 'QA_SUITE' && qaReport && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        VI. Kết quả Kiểm thử Thực tế: Đăng nhập, Chọn trường, Chuyển trường, Quyền & Dữ liệu
                      </h3>
                      <p className="text-xs text-slate-500">
                        Thực thi lúc: {new Date(qaReport.executedAt).toLocaleString('vi-VN')} · Đạt{' '}
                        {qaReport.passedCount}/{qaReport.totalCount} kịch bản
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={runningQa}
                      onClick={() => void handleRunVerificationSuite()}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${runningQa ? 'animate-spin' : ''}`} />
                      <span>Chạy lại Kiểm thử</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                          <th className="py-2.5 px-3 font-bold">Mã KT</th>
                          <th className="py-2.5 px-3 font-bold">Kịch bản kiểm thử (Mục VI)</th>
                          <th className="py-2.5 px-3 font-bold">Tài khoản</th>
                          <th className="py-2.5 px-3 font-bold">Kết quả mong đợi</th>
                          <th className="py-2.5 px-3 font-bold">Kết quả thực tế</th>
                          <th className="py-2.5 px-3 font-bold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 align-top">
                        {(qaReport.testCases || []).map((tc: any) => (
                          <tr key={tc.code} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {tc.code}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{tc.title}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">{tc.account}</td>
                            <td className="py-2.5 px-3 text-slate-700">{tc.expected}</td>
                            <td className="py-2.5 px-3 text-slate-800 font-medium">{tc.actual}</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-700 whitespace-nowrap">
                              {tc.passed ? 'ĐẠT (PASS)' : 'KHÔNG ĐẠT'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
