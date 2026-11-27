import React, { useState } from 'react';
import {
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Building2,
  Search,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import {
  AuthenticatedUserSession,
  MenuSectionId,
  SchoolBrandingConfig,
} from '../types/domain';
import {
  loginWithCredentials,
  loginWithGoogleFirebase,
  requestSafePasswordReset,
  clearStoredSessionToken,
  resolveApiUrl,
} from '../services/auth/authSessionService';
import {
  getOfficialRoleDisplayLabel,
  normalizeToPrimaryRoleKey,
} from '../config/productionMenuRegistry';

export interface AuthorizedSchoolMembership {
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  levelLabel: string;
  role: string;
  roleLabel: string;
  departmentName?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  academicYear: string;
}

interface EduTestLoginWorkspaceProps {
  branding?: SchoolBrandingConfig;
  currentSession: AuthenticatedUserSession | null;
  interceptedProtectedRoute?: {
    menuId: MenuSectionId;
    label: string;
  } | null;
  onLoginSuccess: (
    session: AuthenticatedUserSession,
    selectedSchool?: AuthorizedSchoolMembership
  ) => void;
  onSessionUpdated?: (session: AuthenticatedUserSession) => void;
  onLogout?: () => void;
  onBrandingUpdated?: (branding: SchoolBrandingConfig) => void;
  onTriggerProtectedRouteAttempt?: (menuId: MenuSectionId, label: string) => void;
  onContinueToWorkspace?: () => void;
}

export const EduTestLoginWorkspace: React.FC<EduTestLoginWorkspaceProps> = ({
  interceptedProtectedRoute,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const [errorBanner, setErrorBanner] = useState<{
    code: string;
    message: string;
  } | null>(null);

  // Luồng xác định trường học sau khi xác thực thành công (Mục IV)
  const [pendingSession, setPendingSession] = useState<AuthenticatedUserSession | null>(null);
  const [schoolVerificationStep, setSchoolVerificationStep] = useState<
    'LOGIN_FORM' | 'MULTI_SCHOOL_SELECT' | 'NO_SCHOOL_ASSIGNED'
  >('LOGIN_FORM');
  const [authorizedSchools, setAuthorizedSchools] = useState<AuthorizedSchoolMembership[]>([]);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');

  // Luồng Quên mật khẩu an toàn
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    const trimmedEmail = identifier.trim();
    if (!trimmedEmail || !password) {
      setErrorBanner({
        code: 'EMPTY_FIELDS',
        message: 'Vui lòng nhập đầy đủ Email đăng nhập và Mật khẩu.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginWithCredentials({
        identifier: trimmedEmail,
        password,
        rememberMe,
      });

      if (!result.ok || !result.session) {
        setErrorBanner({
          code: result.noticeCode || 'LOGIN_FAILED',
          message:
            result.message ||
            'Thông tin đăng nhập không chính xác hoặc tài khoản không đủ điều kiện truy cập.',
        });
        return;
      }

      const session = result.session;

      // Super Admin quản trị toàn nền tảng -> vào thẳng Dashboard hệ thống
      const primaryRole = normalizeToPrimaryRoleKey(
        session.user.activeRole,
        session.user.email,
        session.user.username,
        session.user.positionTitle
      );
      if (primaryRole === 'SUPER_ADMIN') {
        onLoginSuccess(session);
        return;
      }

      // Kiểm tra danh sách trường học mà tài khoản có membership hợp lệ từ Backend (Mục IV)
      try {
        const verifyRes = await fetch(resolveApiUrl('/api/stage22/auth/context'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session.sessionToken
              ? { Authorization: `Bearer ${session.sessionToken}` }
              : {}),
          },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            username: session.user.username,
          }),
        });

        if (verifyRes.ok) {
          const ctxData = await verifyRes.json();
          const memberships: AuthorizedSchoolMembership[] = Array.isArray(ctxData?.memberships)
            ? ctxData.memberships
            : [];

          // 3. Nếu chưa thuộc trường nào -> hiển thị thông báo tài khoản chưa được phân quyền sử dụng
          if (memberships.length === 0) {
            setPendingSession(session);
            setSchoolVerificationStep('NO_SCHOOL_ASSIGNED');
            return;
          }

          // 2. Nếu thuộc nhiều trường -> hiển thị màn hình chọn trường
          if (memberships.length > 1) {
            setPendingSession(session);
            setAuthorizedSchools(memberships);
            setSchoolVerificationStep('MULTI_SCHOOL_SELECT');
            return;
          }

          // 1. Nếu thuộc 1 trường -> tự động vào trường đó
          const singleSchool = memberships[0];
          const enrichedSession: AuthenticatedUserSession = {
            ...session,
            user: {
              ...session.user,
              schoolId: singleSchool.schoolId,
            },
          };
          onLoginSuccess(enrichedSession, singleSchool);
          return;
        }
      } catch {
        // Fallback sử dụng thông tin trường trong session nếu có
      }

      if (!session.user.schoolId || !session.user.roles?.length) {
        setPendingSession(session);
        setSchoolVerificationStep('NO_SCHOOL_ASSIGNED');
        return;
      }

      onLoginSuccess(session);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorBanner(null);
    setIsGoogleSubmitting(true);
    try {
      const result = await loginWithGoogleFirebase(rememberMe);
      if (!result.ok || !result.session) {
        setErrorBanner({
          code: result.noticeCode || 'LOGIN_FAILED',
          message: result.message || 'Không thể đăng nhập bằng tài khoản Google.',
        });
        return;
      }

      const session = result.session;
      if (session.authProvider === 'FIREBASE_GOOGLE_DIRECT') {
        onLoginSuccess(session);
        return;
      }

      const primaryRole = normalizeToPrimaryRoleKey(
        session.user.activeRole,
        session.user.email,
        session.user.username,
        session.user.positionTitle
      );
      if (primaryRole === 'SUPER_ADMIN') {
        onLoginSuccess(session);
        return;
      }

      try {
        const verifyRes = await fetch(resolveApiUrl('/api/stage22/auth/context'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session.sessionToken
              ? { Authorization: `Bearer ${session.sessionToken}` }
              : {}),
          },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            username: session.user.username,
          }),
        });
        if (verifyRes.ok) {
          const ctxData = await verifyRes.json();
          const memberships: AuthorizedSchoolMembership[] = Array.isArray(ctxData?.memberships)
            ? ctxData.memberships
            : [];
          if (memberships.length > 1) {
            setPendingSession(session);
            setAuthorizedSchools(memberships);
            setSchoolVerificationStep('MULTI_SCHOOL_SELECT');
            return;
          }
          if (memberships.length === 1) {
            const singleSchool = memberships[0];
            onLoginSuccess(
              {
                ...session,
                user: {
                  ...session.user,
                  schoolId: singleSchool.schoolId,
                },
              },
              singleSchool
            );
            return;
          }
        }
      } catch {
        // Fallback dùng thông tin trường mặc định của phiên
      }

      onLoginSuccess(session);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSelectSchool = (school: AuthorizedSchoolMembership) => {
    if (!pendingSession) return;
    if (school.status === 'SUSPENDED') {
      setErrorBanner({
        code: 'SCHOOL_SUSPENDED',
        message: `Đơn vị "${school.schoolName}" hiện đang tạm ngưng hoạt động. Vui lòng liên hệ Quản trị viên hệ thống.`,
      });
      return;
    }
    const updatedSession: AuthenticatedUserSession = {
      ...pendingSession,
      user: {
        ...pendingSession.user,
        schoolId: school.schoolId,
        departmentName: school.departmentName || pendingSession.user.departmentName,
      },
    };
    onLoginSuccess(updatedSession, school);
  };

  const handleCancelSchoolFlow = () => {
    clearStoredSessionToken();
    setPendingSession(null);
    setAuthorizedSchools([]);
    setSchoolVerificationStep('LOGIN_FORM');
    setErrorBanner(null);
  };

  const handleRequestForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    if (!forgotIdentifier.trim()) {
      setForgotMessage({
        type: 'error',
        text: 'Vui lòng nhập địa chỉ email đăng nhập cần khôi phục.',
      });
      return;
    }
    setForgotSubmitting(true);
    try {
      const res = await requestSafePasswordReset(forgotIdentifier);
      setForgotMessage({
        type: res.ok ? 'success' : 'error',
        text: res.message,
      });
    } finally {
      setForgotSubmitting(false);
    }
  };

  const filteredSchools = authorizedSchools.filter((sch) => {
    const q = schoolSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      sch.schoolName.toLowerCase().includes(q) ||
      sch.schoolCode.toLowerCase().includes(q) ||
      sch.levelLabel.toLowerCase().includes(q)
    );
  });

  // MÀN HÌNH THÔNG BÁO TÀI KHOẢN CHƯA THUỘC TRƯỜNG NÀO / CHƯA ĐƯỢC PHÂN QUYỀN (Mục IV.3)
  if (schoolVerificationStep === 'NO_SCHOOL_ASSIGNED') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Tài khoản chưa được phân quyền sử dụng
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Tài khoản{' '}
            <span className="font-semibold text-slate-900">
              {pendingSession?.user.email}
            </span>{' '}
            đã xác thực thành công nhưng hiện chưa được gán vào đơn vị trường học hoặc phân quyền chức vụ nào trên hệ thống.
          </p>
          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left">
            Vui lòng liên hệ Quản trị viên nhà trường (School Admin) để được cấp quyền truy cập đơn vị và phân công chuyên môn.
          </div>
          <button
            type="button"
            onClick={handleCancelSchoolFlow}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Quay lại màn hình đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHỌN TRƯỜNG HỌC KHI TÀI KHOẢN THUỘC NHIỀU TRƯỜNG (Mục IV.2)
  if (schoolVerificationStep === 'MULTI_SCHOOL_SELECT' && pendingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-wide">EDU TEST AI</div>
                <div className="text-xs text-slate-300">Chọn đơn vị trường học làm việc</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelSchoolFlow}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Xin chào, {pendingSession.user.fullName}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Tài khoản của bạn được phân quyền công tác tại {authorizedSchools.length} đơn vị trường học. Vui lòng chọn trường để vào không gian làm việc.
              </p>
            </div>

            {errorBanner && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorBanner.message}</span>
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={schoolSearchQuery}
                onChange={(e) => setSchoolSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên trường, mã trường hoặc cấp học..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {filteredSchools.map((sch) => (
                <div
                  key={sch.schoolId}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{sch.schoolName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            sch.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {sch.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Cấp học: <span className="font-medium text-slate-800">{sch.levelLabel}</span> • Vai trò:{' '}
                        <span className="font-semibold text-indigo-700">
                          {sch.roleLabel || getOfficialRoleDisplayLabel(sch.role)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={sch.status !== 'ACTIVE'}
                    onClick={() => handleSelectSchool(sch)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                  >
                    <span>Vào làm việc</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐĂNG NHẬP CHÍNH THỨC (Mục II & III)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Header thương hiệu chính thức */}
        <div className="bg-slate-900 px-8 py-7 text-center text-white border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-950/50">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">EDU TEST AI</h1>
          <p className="text-xs font-semibold tracking-wider text-indigo-300 uppercase mt-1">
            NGÂN HÀNG ĐỀ KIỂM TRA THÔNG MINH
          </p>
        </div>

        {/* Biểu mẫu đăng nhập */}
        <div className="p-8">
          {interceptedProtectedRoute && !errorBanner && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
              Vui lòng đăng nhập để tiếp tục truy cập chức năng{' '}
              <span className="font-bold">{interceptedProtectedRoute.label}</span>.
            </div>
          )}

          {errorBanner && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-medium text-rose-800 leading-relaxed">
                {errorBanner.message}
              </div>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="edutest-login-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Email đăng nhập
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="edutest-login-email"
                  type="email"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập email công vụ của bạn"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edutest-login-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="edutest-login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Ghi nhớ phiên đăng nhập
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotIdentifier(identifier);
                  setForgotMessage(null);
                  setShowForgotModal(true);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-500 font-medium">
                hoặc đăng nhập nhanh qua Firebase
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-60 border border-slate-300 text-slate-800 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isGoogleSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Đang mở cửa sổ Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3.01h3.88c2.27-2.09 3.54-5.17 3.54-8.88Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.05 1.15-3.12 0-5.76-2.11-6.7-4.94H1.29v3.1A11.99 11.99 0 0 0 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.29a7.21 7.21 0 0 1 0-4.58v-3.1H1.29a12 12 0 0 0 0 10.78l4.01-3.1Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.61l4.01 3.1c.94-2.83 3.58-4.94 6.7-4.94Z"
                  />
                </svg>
                <span>Đăng nhập bằng Google</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Quên mật khẩu */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Khôi phục mật khẩu</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {forgotMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                  forgotMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {forgotMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{forgotMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRequestForgot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email đăng nhập cần khôi phục
                </label>
                <input
                  type="email"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="Nhập địa chỉ email công vụ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  {forgotSubmitting ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
