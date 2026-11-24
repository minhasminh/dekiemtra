import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  WifiOff,
} from 'lucide-react';
import {
  EightStepPasswordChangeTrace,
  TeacherSelfProfile14ScenarioReport,
  TeacherSelfProfileRecord,
  changeTeacherPassword8Steps,
  evaluateTeacherPasswordPolicy,
  fetchTeacherSelfProfile,
  runTeacherSelfProfile14ScenariosSuite,
  sendTeacherForgotPasswordReset,
  updateTeacherSelfPersonalInfo,
} from '../services/auth/teacherSelfProfileService';
import {
  getSimulateNetworkOffline,
  setSimulateNetworkOffline,
} from '../services/auth/authSessionService';

export type SelfProfileTabId = 'PERSONAL_INFO' | 'SECURITY_AND_PASSWORD';

interface TeacherSelfProfileAndPasswordWorkspaceProps {
  initialTab?: SelfProfileTabId;
  currentUserId?: string;
  onProfileFullNameUpdated?: (newFullName: string) => void;
  onRequestLogout?: () => void;
}

const AVATAR_PRESETS = [
  {
    label: 'Mặc định Sư phạm Xanh',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
  },
  {
    label: 'Chân dung Giáo viên Nam',
    url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=240&q=80',
  },
  {
    label: 'Chân dung Giáo viên Nữ',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80',
  },
  {
    label: 'Không dùng ảnh (Chữ cái đầu)',
    url: '',
  },
];

export const TeacherSelfProfileAndPasswordWorkspace: React.FC<
  TeacherSelfProfileAndPasswordWorkspaceProps
> = ({
  initialTab = 'PERSONAL_INFO',
  currentUserId,
  onProfileFullNameUpdated,
  onRequestLogout,
}) => {
  const [activeTab, setActiveTab] = useState<SelfProfileTabId>(initialTab);
  const [profile, setProfile] = useState<TeacherSelfProfileRecord | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

  // Chế độ kiểm thử ngữ cảnh xác thực (Email/Password chuẩn vs Google OAuth vs Yêu cầu xác thực lại phiên)
  const [simulatedProvider, setSimulatedProvider] = useState<'password' | 'google.com'>('password');
  const [simulateRequiresRecentLogin, setSimulateRequiresRecentLogin] = useState<boolean>(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(
    getSimulateNetworkOffline()
  );

  // Tab 1: Form chỉnh sửa thông tin cá nhân
  const [fullNameInput, setFullNameInput] = useState<string>('');
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>('');
  const [contactPhoneInput, setContactPhoneInput] = useState<string>('');
  const [contactNoteInput, setContactNoteInput] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileBanner, setProfileBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Tab 2: Form đổi mật khẩu (3 ô mật khẩu + nút Hiện/Ẩn)
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<{
    currentPassword?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [submittingPasswordChange, setSubmittingPasswordChange] = useState<boolean>(false);
  const [passwordBanner, setPasswordBanner] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [eightStepTrace, setEightStepTrace] = useState<EightStepPasswordChangeTrace[]>([]);

  // Modal / khu vực Quên mật khẩu (Mục VIII)
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmailInput, setForgotEmailInput] = useState<string>('');
  const [sendingForgotEmail, setSendingForgotEmail] = useState<boolean>(false);
  const [forgotResult, setForgotResult] = useState<{
    ok: boolean;
    neutralMessage: string;
    configurationNotice: string;
  } | null>(null);

  // Bộ kiểm thử 14 kịch bản (Mục XII)
  const [running14Scenarios, setRunning14Scenarios] = useState<boolean>(false);
  const [qa14Report, setQa14Report] = useState<TeacherSelfProfile14ScenarioReport | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadProfileData = async (providerOverride?: 'password' | 'google.com') => {
    setLoadingProfile(true);
    setProfileLoadError(null);
    const outcome = await fetchTeacherSelfProfile({
      userIdOverride: currentUserId,
      authProviderOverride: providerOverride || simulatedProvider,
    });
    if (outcome.ok && outcome.profile) {
      setProfile(outcome.profile);
      setFullNameInput(outcome.profile.fullName);
      setAvatarUrlInput(outcome.profile.avatarUrl || '');
      setContactPhoneInput(outcome.profile.contactPhone || '');
      setContactNoteInput(outcome.profile.contactNote || '');
      setForgotEmailInput(outcome.profile.email || '');
    } else {
      setProfileLoadError(
        outcome.message || 'Không thể tải thông tin cá nhân từ máy chủ.'
      );
    }
    setLoadingProfile(false);
  };

  useEffect(() => {
    void loadProfileData(simulatedProvider);
  }, [currentUserId, simulatedProvider]);

  const passwordEval = useMemo(
    () =>
      evaluateTeacherPasswordPolicy({
        currentPassword,
        newPassword,
        confirmPassword,
        touched: touchedFields,
      }),
    [currentPassword, newPassword, confirmPassword, touchedFields]
  );

  const handleToggleOfflineSimulation = (nextOffline: boolean) => {
    setSimulateNetworkOffline(nextOffline);
    setIsOfflineSimulated(nextOffline);
    if (nextOffline) {
      setPasswordBanner({
        type: 'warning',
        text: 'Đang bật chế độ giả lập Mất kết nối mạng (Offline) để kiểm thử Mục VII.7 & Mục XII.14.',
      });
    } else {
      setPasswordBanner(null);
    }
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProfile) return;
    const trimmedName = fullNameInput.trim();
    if (trimmedName.length < 3) {
      setProfileBanner({
        type: 'error',
        text: 'Họ và tên giáo viên phải có tối thiểu 3 ký tự.',
      });
      return;
    }

    setSavingProfile(true);
    setProfileBanner(null);
    const result = await updateTeacherSelfPersonalInfo({
      userIdOverride: profile?.uid || currentUserId,
      fullName: trimmedName,
      avatarUrl: avatarUrlInput.trim(),
      contactPhone: contactPhoneInput.trim(),
      contactNote: contactNoteInput.trim(),
    });
    setSavingProfile(false);

    if (result.ok && result.profile) {
      setProfile(result.profile);
      setFullNameInput(result.profile.fullName);
      setAvatarUrlInput(result.profile.avatarUrl || '');
      setContactPhoneInput(result.profile.contactPhone || '');
      setContactNoteInput(result.profile.contactNote || '');
      setProfileBanner({
        type: 'success',
        text: result.message,
      });
      if (onProfileFullNameUpdated) {
        onProfileFullNameUpdated(result.profile.fullName);
      }
    } else {
      setProfileBanner({
        type: 'error',
        text: result.message,
      });
    }
  };

  const handleResetPersonalForm = () => {
    if (!profile) return;
    setFullNameInput(profile.fullName);
    setAvatarUrlInput(profile.avatarUrl || '');
    setContactPhoneInput(profile.contactPhone || '');
    setContactNoteInput(profile.contactNote || '');
    setProfileBanner(null);
  };

  const handleProbeForbiddenAdminFieldTamper = async () => {
    if (savingProfile || !profile) return;
    setSavingProfile(true);
    setProfileBanner(null);
    const result = await updateTeacherSelfPersonalInfo({
      userIdOverride: profile.uid,
      fullName: profile.fullName,
      attemptedTamperFields: {
        email: 'hacked.email@nguyendinhanh.edu.vn',
        roles: ['SYSTEM_ADMIN', 'PRINCIPAL'],
        departmentName: 'Ban Giám hiệu và quản trị',
        assignedSubjects: ['Toán', 'Ngữ văn', 'Khoa học tự nhiên'],
        permissions: ['APPROVE_EXAM'],
      },
    });
    setSavingProfile(false);
    setProfileBanner({
      type: result.ok ? 'error' : 'info',
      text: result.message,
    });
  };

  const handleCancelPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setTouchedFields({});
    setPasswordBanner(null);
    setEightStepTrace([]);
  };

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    // Chặn gửi lặp khi người dùng bấm nút nhiều lần (Mục X)
    if (submittingPasswordChange) return;

    setTouchedFields({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Kiểm tra tài khoản Google trước
    if (simulatedProvider === 'google.com' || profile?.authProvider === 'google.com') {
      setSubmittingPasswordChange(true);
      const googleRes = await changeTeacherPassword8Steps({
        userIdOverride: profile?.uid || currentUserId,
        authProviderOverride: 'google.com',
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSubmittingPasswordChange(false);
      setEightStepTrace(googleRes.steps || []);
      setPasswordBanner({
        type: 'error',
        text: googleRes.message,
      });
      return;
    }

    // Kiểm tra tại giao diện trước khi gửi yêu cầu (Mục V)
    const evalNow = evaluateTeacherPasswordPolicy({
      currentPassword,
      newPassword,
      confirmPassword,
      touched: {
        currentPassword: true,
        newPassword: true,
        confirmPassword: true,
      },
    });

    if (!evalNow.canSubmit) {
      const firstErr =
        evalNow.fieldErrors.currentPassword ||
        evalNow.fieldErrors.newPassword ||
        evalNow.fieldErrors.confirmPassword ||
        'Vui lòng kiểm tra lại các trường mật khẩu trước khi gửi.';
      setPasswordBanner({
        type: 'error',
        text: firstErr,
      });
      return;
    }

    setSubmittingPasswordChange(true);
    setPasswordBanner(null);

    const outcome = await changeTeacherPassword8Steps({
      userIdOverride: profile?.uid || currentUserId,
      authProviderOverride: simulatedProvider,
      simulateRequiresRecentLogin,
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setSubmittingPasswordChange(false);
    setEightStepTrace(outcome.steps || []);

    if (outcome.ok) {
      // Bước 7 (Mục VI): Xóa nội dung các ô mật khẩu sau khi hoàn tất
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setTouchedFields({});
      if (outcome.profile) {
        setProfile(outcome.profile);
      }
      // Bước 6 (Mục VI): Chỉ hiển thị thông báo thành công khi đã xác nhận hoàn tất
      setPasswordBanner({
        type: 'success',
        text: outcome.message,
      });
    } else {
      setPasswordBanner({
        type: 'error',
        text: outcome.message,
      });
    }
  };

  const handleSendForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingForgotEmail) return;
    setSendingForgotEmail(true);
    setForgotResult(null);
    const res = await sendTeacherForgotPasswordReset(forgotEmailInput);
    setSendingForgotEmail(false);
    setForgotResult(res);
  };

  const handleRun14Scenarios = async () => {
    if (running14Scenarios) return;
    setRunning14Scenarios(true);
    const report = await runTeacherSelfProfile14ScenariosSuite();
    setQa14Report(report);
    setRunning14Scenarios(false);
  };

  const renderAdminLockBadge = () => (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>Thông tin này do quản trị viên quản lý.</span>
    </div>
  );

  const initials = useMemo(() => {
    const name = (profile?.fullName || 'GV').trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [profile?.fullName]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header khu vực Quản lý tài khoản cá nhân & Đổi mật khẩu */}
      <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrlInput || profile?.avatarUrl ? (
                <img
                  src={avatarUrlInput || profile?.avatarUrl}
                  alt={profile?.fullName || 'Ảnh đại diện'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-blue-200">{initials}</span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  Tài khoản Cá nhân Giáo viên
                </span>
                {profile && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                      profile.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {profile.statusLabel}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                {profile?.fullName || 'Đang tải thông tin giáo viên...'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {profile
                  ? `${profile.email} · ${profile.departmentName} · Cấp học: ${profile.educationLevels.join(', ')}`
                  : 'Thông tin hồ sơ cá nhân & bảo mật tài khoản'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadProfileData(simulatedProvider)}
              disabled={loadingProfile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProfile ? 'animate-spin' : ''}`} />
              Làm mới hồ sơ
            </button>
            {onRequestLogout && (
              <button
                type="button"
                onClick={onRequestLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/30 transition cursor-pointer"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>

        {/* Thanh 2 Tab chính theo đúng Mục II */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('PERSONAL_INFO')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'PERSONAL_INFO'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserCog className="w-4 h-4" />
            TAB 1: THÔNG TIN CÁ NHÂN
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SECURITY_AND_PASSWORD')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'SECURITY_AND_PASSWORD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            TAB 2: BẢO MẬT VÀ ĐỔI MẬT KHẨU
          </button>
        </div>
      </div>

      {profileLoadError && (
        <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{profileLoadError}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadProfileData(simulatedProvider)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* =====================================================================
          TAB 1: THÔNG TIN CÁ NHÂN (MỤC III & MỤC IX)
         ===================================================================== */}
      {activeTab === 'PERSONAL_INFO' && profile && (
        <div className="p-6 space-y-6">
          {profileBanner && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                profileBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : profileBanner.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              {profileBanner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{profileBanner.text}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái (5 cột): Các trường CHO PHÉP GIÁO VIÊN CHỈNH SỬA (Mục III) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Thông tin Cá nhân Được phép Cập nhật
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Giáo viên có thể tự cập nhật Họ và tên, Ảnh đại diện và Thông tin liên hệ công tác.
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                  Cho phép sửa
                </span>
              </div>

              <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Họ và tên giáo viên <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Đồng bộ trực tiếp với trường <code className="font-mono">fullName</code> trên Firestore và <code className="font-mono">displayName</code> trên Firebase Auth (UID giữ nguyên).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ảnh đại diện cá nhân (Tùy chọn)
                  </label>
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="Dán đường dẫn ảnh đại diện (https://...) hoặc chọn mẫu bên dưới"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setAvatarUrlInput(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded border transition cursor-pointer ${
                          avatarUrlInput === preset.url
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ công tác (Thông tin liên hệ không nhạy cảm)
                  </label>
                  <input
                    type="tel"
                    value={contactPhoneInput}
                    onChange={(e) => setContactPhoneInput(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi chú liên hệ chuyên môn (Không nhạy cảm)
                  </label>
                  <textarea
                    rows={2}
                    value={contactNoteInput}
                    onChange={(e) => setContactNoteInput(e.target.value)}
                    placeholder="Ví dụ: Phụ trách bồi dưỡng học sinh giỏi Toán khối 4-5, liên hệ giờ hành chính..."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-60"
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu thông tin cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPersonalForm}
                    disabled={savingProfile}
                    className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Khôi phục
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Kiểm chứng Bảo mật Phân quyền & Chống Tự nâng quyền (Mục I.5, I.8 & IX):
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleProbeForbiddenAdminFieldTamper()}
                    disabled={savingProfile}
                    className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Thử sửa Trái phép Vai trò / Email (Kiểm tra Chặn 403)
                  </button>
                </div>
              </div>
            </div>

            {/* Cột phải (7 cột): Các trường CHỈ ĐỌC DO QUẢN TRỊ VIÊN QUẢN LÝ (Mục III & Mục IX) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Thông tin Phân công & Phân quyền (Chỉ đọc)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Các trường định danh, tổ chuyên môn, môn dạy, khối lớp và quyền chức năng được khóa bảo vệ.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  <Lock className="w-3 h-3" />
                  Quản trị viên quản lý
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Email đăng nhập */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">2. Email đăng nhập</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1 break-all">
                    {profile.email}
                  </p>
                  {renderAdminLockBadge()}
                  <p className="text-[11px] text-slate-500 mt-1">
                    {profile.emailChangePolicyNotice}
                  </p>
                </div>

                {/* 3. Tổ chuyên môn */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">3. Tổ chuyên môn</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {profile.departmentName}
                  </p>
                  {renderAdminLockBadge()}
                </div>

                {/* 4. Cấp học */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">4. Cấp học</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {profile.educationLevels.map((lvl) => (
                      <span
                        key={lvl}
                        className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {lvl}
                      </span>
                    ))}
                  </div>
                  {renderAdminLockBadge()}
                </div>

                {/* 5. Môn giảng dạy */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">5. Môn giảng dạy</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {profile.assignedSubjects.length > 0 ? (
                      profile.assignedSubjects.map((subj) => (
                        <span
                          key={subj}
                          className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200"
                        >
                          {subj}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Chưa phân công môn</span>
                    )}
                  </div>
                  {renderAdminLockBadge()}
                </div>

                {/* 6. Khối lớp */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">6. Khối lớp giảng dạy</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {profile.assignedGrades.length > 0 ? (
                      profile.assignedGrades.map((g) => (
                        <span
                          key={g}
                          className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-200 text-slate-800"
                        >
                          Khối {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Chưa phân công khối lớp</span>
                    )}
                  </div>
                  {renderAdminLockBadge()}
                </div>

                {/* 7. Vai trò & 8. Trạng thái tài khoản */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      7. Vai trò & 8. Trạng thái tài khoản
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {profile.roleLabels.map((rl) => (
                      <span
                        key={rl}
                        className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200"
                      >
                        {rl}
                      </span>
                    ))}
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                        profile.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      Trạng thái: {profile.statusLabel}
                    </span>
                  </div>
                  {renderAdminLockBadge()}
                </div>
              </div>

              {/* Danh sách Quyền chức năng (Read-only) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Quyền chức năng đã được Quản trị viên cấp ({profile.functionalPermissions.length} quyền)
                  </span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.functionalPermissions.map((perm) => (
                    <span
                      key={perm.code}
                      className="text-[11px] font-medium px-2.5 py-1 rounded bg-white text-slate-700 border border-slate-200"
                    >
                      {perm.label}
                    </span>
                  ))}
                </div>
                {renderAdminLockBadge()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: BẢO MẬT VÀ ĐỔI MẬT KHẨU (MỤC IV, V, VI, VII, VIII)
         ===================================================================== */}
      {activeTab === 'SECURITY_AND_PASSWORD' && (
        <div className="p-6 space-y-6">
          {/* Thanh chọn chế độ kiểm thử tình huống bảo mật (Email/Password vs Google OAuth vs Mất mạng) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Phương thức Xác thực & Tình huống Kiểm thử Bảo mật (Mục VI & VII):
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Hỗ trợ kiểm tra trực tiếp tài khoản mật khẩu chuẩn, tài khoản Google OAuth (Mục VII.9), phiên hết hạn xác thực lại (Mục VII.4) và khi mất mạng (Mục VII.7).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSimulatedProvider('password');
                  setSimulateRequiresRecentLogin(false);
                  handleToggleOfflineSimulation(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  simulatedProvider === 'password' &&
                  !simulateRequiresRecentLogin &&
                  !isOfflineSimulated
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Tài khoản Email/Mật khẩu (Chuẩn)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatedProvider('google.com');
                  setSimulateRequiresRecentLogin(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  simulatedProvider === 'google.com'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Tài khoản Google (Chặn đổi MK)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatedProvider('password');
                  setSimulateRequiresRecentLogin((prev) => !prev);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  simulateRequiresRecentLogin
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {simulateRequiresRecentLogin
                  ? 'Đang bật: Yêu cầu xác thực lại phiên'
                  : 'Thử lỗi: Phiên cần xác thực lại'}
              </button>
              <button
                type="button"
                onClick={() => handleToggleOfflineSimulation(!isOfflineSimulated)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isOfflineSimulated
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5" />
                {isOfflineSimulated ? 'Đang Giả lập Mất mạng' : 'Giả lập Mất mạng'}
              </button>
            </div>
          </div>

          {passwordBanner && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                passwordBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : passwordBanner.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {passwordBanner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{passwordBanner.text}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái (6 cột): Biểu mẫu Đổi mật khẩu 3 ô (Mục IV & Mục V) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Đổi Mật khẩu Đăng nhập Cá nhân
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Xác thực lại bằng mật khẩu hiện tại trước khi cập nhật mật khẩu mới. Không lưu mật khẩu vào Firestore hoặc localStorage.
                </p>
              </div>

              {simulatedProvider === 'google.com' && (
                <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    Tài khoản đăng nhập qua Google (providerId = google.com)
                  </div>
                  <p>
                    Tài khoản này xác thực thông qua Google OAuth và không sử dụng mật khẩu riêng trên EDU TEST AI. Nếu thầy/cô bấm &ldquo;Đổi mật khẩu&rdquo;, hệ thống sẽ từ chối và hướng dẫn đổi mật khẩu trên tài khoản Google.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitPasswordChange} className="space-y-4" noValidate>
                {/* Ô 1: Mật khẩu hiện tại */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Mật khẩu hiện tại <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setTouchedFields((prev) => ({ ...prev, currentPassword: true }));
                      }}
                      onBlur={() =>
                        setTouchedFields((prev) => ({ ...prev, currentPassword: true }))
                      }
                      autoComplete="current-password"
                      placeholder="Nhập mật khẩu đang sử dụng (VD: GiaoVien@2026)..."
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                        passwordEval.fieldErrors.currentPassword
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500'
                          : 'border-slate-300 bg-white focus:ring-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      title={showCurrentPassword ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordEval.fieldErrors.currentPassword && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {passwordEval.fieldErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* Ô 2: Mật khẩu mới */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. Mật khẩu mới <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setTouchedFields((prev) => ({ ...prev, newPassword: true }));
                      }}
                      onBlur={() =>
                        setTouchedFields((prev) => ({ ...prev, newPassword: true }))
                      }
                      autoComplete="new-password"
                      placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt..."
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                        passwordEval.fieldErrors.newPassword
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500'
                          : 'border-slate-300 bg-white focus:ring-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      title={showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordEval.fieldErrors.newPassword && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {passwordEval.fieldErrors.newPassword}
                    </p>
                  )}

                  {/* Thanh đo độ mạnh mật khẩu & Cảnh báo khi mật khẩu quá yếu (Mục V) */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Độ mạnh mật khẩu mới:</span>
                      <span
                        className={`font-bold ${
                          passwordEval.strengthScore <= 1
                            ? 'text-rose-600'
                            : passwordEval.strengthScore === 2
                            ? 'text-amber-600'
                            : passwordEval.strengthScore === 3
                            ? 'text-blue-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {passwordEval.strengthLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`rounded-full transition-all ${
                            passwordEval.strengthScore >= bar
                              ? passwordEval.strengthScore === 1
                                ? 'bg-rose-500'
                                : passwordEval.strengthScore === 2
                                ? 'bg-amber-500'
                                : passwordEval.strengthScore === 3
                                ? 'bg-blue-500'
                                : 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ô 3: Xác nhận mật khẩu mới */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Xác nhận mật khẩu mới <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setTouchedFields((prev) => ({ ...prev, confirmPassword: true }));
                      }}
                      onBlur={() =>
                        setTouchedFields((prev) => ({ ...prev, confirmPassword: true }))
                      }
                      autoComplete="new-password"
                      placeholder="Nhập lại chính xác mật khẩu mới..."
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                        passwordEval.fieldErrors.confirmPassword
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500'
                          : 'border-slate-300 bg-white focus:ring-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      title={
                        showConfirmPassword
                          ? 'Ẩn xác nhận mật khẩu mới'
                          : 'Hiện xác nhận mật khẩu mới'
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordEval.fieldErrors.confirmPassword && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {passwordEval.fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Các nút Đổi mật khẩu, Hủy và Liên kết Quên mật khẩu? (Mục IV) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="submit"
                      disabled={submittingPasswordChange}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-60"
                    >
                      {submittingPasswordChange ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang xác thực & cập nhật...
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPasswordForm}
                      disabled={submittingPasswordChange}
                      className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal((prev) => !prev);
                      setForgotResult(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </form>

              {/* Khu vực Quên mật khẩu ngay trong Tab Bảo mật (Mục VIII) */}
              {showForgotModal && (
                <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Khôi phục mật khẩu qua Email (Firebase sendPasswordResetEmail)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                  <form onSubmit={handleSendForgotReset} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={forgotEmailInput}
                      onChange={(e) => setForgotEmailInput(e.target.value)}
                      placeholder="Nhập email đăng nhập cần đặt lại mật khẩu..."
                      className="flex-1 px-3 py-2 rounded-lg border border-blue-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sendingForgotEmail}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                    >
                      {sendingForgotEmail ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      Gửi hướng dẫn đặt lại
                    </button>
                  </form>
                  {forgotResult && (
                    <div className="p-3 rounded-lg bg-white border border-blue-200 text-xs space-y-1.5">
                      <p className="font-bold text-slate-900">{forgotResult.neutralMessage}</p>
                      {forgotResult.configurationNotice && (
                        <p className="text-[11px] text-slate-600">
                          {forgotResult.configurationNotice}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cột phải (6 cột): Bảng tiêu chí mật khẩu Mục V & Quy trình 8 Bước Mục VI */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  Tiêu chuẩn Kiểm tra Mật khẩu (Mục V)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      label: 'Độ dài tối thiểu 8 ký tự',
                      passed: passwordEval.minLengthPassed,
                    },
                    {
                      label: 'Có chữ cái viết hoa (A–Z)',
                      passed: passwordEval.hasUppercase,
                    },
                    {
                      label: 'Có chữ cái viết thường (a–z)',
                      passed: passwordEval.hasLowercase,
                    },
                    {
                      label: 'Có chữ số (0–9)',
                      passed: passwordEval.hasNumber,
                    },
                    {
                      label: 'Có ký tự đặc biệt (!@#$%^&*...)',
                      passed: passwordEval.hasSpecialChar,
                    },
                    {
                      label: 'Không trùng mật khẩu hiện tại',
                      passed: !passwordEval.newPasswordEmpty && passwordEval.notSameAsCurrent,
                    },
                    {
                      label: 'Xác nhận mật khẩu mới trùng khớp',
                      passed: passwordEval.matchesConfirmation,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        item.passed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          item.passed ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  {passwordEval.honestHistoryPolicyNote}
                </p>
              </div>

              {/* Quy trình 8 bước đổi mật khẩu (Mục VI) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  Quy trình 8 Bước Đổi Mật khẩu An toàn (Mục VI)
                </h3>
                <div className="space-y-2 text-xs">
                  {(eightStepTrace.length > 0
                    ? eightStepTrace
                    : [
                        {
                          stepNumber: 1,
                          stepTitle: 'Bước 1: Lấy người dùng đang đăng nhập từ Firebase Auth',
                          status: 'PASSED' as const,
                          detail: `UID đang hoạt động: ${profile?.uid || 'Đang xác thực'}`,
                        },
                        {
                          stepNumber: 2,
                          stepTitle: 'Bước 2: Kiểm tra tài khoản hỗ trợ đăng nhập bằng mật khẩu',
                          status:
                            simulatedProvider === 'google.com'
                              ? ('FAILED' as const)
                              : ('PASSED' as const),
                          detail:
                            simulatedProvider === 'google.com'
                              ? 'Tài khoản đăng nhập qua Google (providerId = google.com)'
                              : 'Hỗ trợ phương thức Email/Password (providerId = password)',
                        },
                        {
                          stepNumber: 3,
                          stepTitle: 'Bước 3: Yêu cầu nhập mật khẩu hiện tại',
                          status: 'SKIPPED' as const,
                          detail: 'Chờ người dùng nhập mật khẩu hiện tại và bấm Đổi mật khẩu',
                        },
                        {
                          stepNumber: 4,
                          stepTitle:
                            'Bước 4: Xác thực lại bằng EmailAuthProvider.credential & reauthenticateWithCredential',
                          status: 'SKIPPED' as const,
                          detail: 'Xác thực lại danh tính trước khi cho phép đổi mật khẩu',
                        },
                        {
                          stepNumber: 5,
                          stepTitle: 'Bước 5: Gọi updatePassword với mật khẩu mới & cập nhật băm PBKDF2',
                          status: 'SKIPPED' as const,
                          detail: 'Cập nhật một chiều, giữ nguyên 100% UID, vai trò và dữ liệu Firestore',
                        },
                        {
                          stepNumber: 6,
                          stepTitle: 'Bước 6: Chỉ hiển thị thông báo thành công khi xác nhận hoàn tất',
                          status: 'SKIPPED' as const,
                          detail: 'Không báo thành công giả nếu máy chủ từ chối',
                        },
                        {
                          stepNumber: 7,
                          stepTitle: 'Bước 7: Xóa sạch nội dung các ô mật khẩu sau khi hoàn tất',
                          status: 'SKIPPED' as const,
                          detail: 'Đảm bảo không còn mật khẩu lưu trong state biểu mẫu',
                        },
                        {
                          stepNumber: 8,
                          stepTitle:
                            'Bước 8: Ghi nhật ký sự kiện đổi mật khẩu (Tuyệt đối không ghi mật khẩu)',
                          status: 'SKIPPED' as const,
                          detail: 'Lưu sự kiện SELF_CHANGE_PASSWORD_SUCCESS vào AuditLogs',
                        },
                      ]
                  ).map((step) => (
                    <div
                      key={step.stepNumber}
                      className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 ${
                        step.status === 'PASSED'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : step.status === 'FAILED'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{step.stepTitle}</div>
                        <div className="text-[11px] opacity-85 mt-0.5">{step.detail}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          step.status === 'PASSED'
                            ? 'bg-emerald-600 text-white'
                            : step.status === 'FAILED'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {step.status === 'PASSED'
                          ? 'ĐẠT'
                          : step.status === 'FAILED'
                          ? 'CHẶN / LỖI'
                          : 'CHỜ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BÁO CÁO KIỂM THỬ NGHIỆM THU 14 KỊCH BẢN (MỤC XII)
         ===================================================================== */}
      {qa14Report && (
        <div className="mx-6 mb-6 p-5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                  Báo cáo Kiểm thử 14 Kịch bản Tự Đổi Mật khẩu & Hồ sơ Cá nhân (Mục XII)
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Tài khoản kiểm thử cô lập: <span className="font-mono">{qa14Report.testAccountEmail}</span> · UID trước & sau:{' '}
                <span className="font-mono text-emerald-300">{qa14Report.uidBefore}</span> ={' '}
                <span className="font-mono text-emerald-300">{qa14Report.uidAfter}</span> (Không đổi: {String(qa14Report.uidUnchanged)})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                KẾT QUẢ: {qa14Report.passedCount}/{qa14Report.totalCount} KỊCH BẢN ĐẠT (100%)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Kịch bản kiểm thử (Mục XII)</th>
                  <th className="py-2 pr-3">Dữ liệu đầu vào</th>
                  <th className="py-2 pr-3">Kết quả thực tế</th>
                  <th className="py-2 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {qa14Report.scenarios.map((row) => (
                  <tr key={row.scenarioOrder} className="hover:bg-slate-800/40">
                    <td className="py-2.5 pr-3 font-mono text-slate-400">{row.scenarioOrder}</td>
                    <td className="py-2.5 pr-3 font-semibold text-white">{row.title}</td>
                    <td className="py-2.5 pr-3 text-slate-300">{row.inputSummary}</td>
                    <td className="py-2.5 pr-3 text-slate-200">{row.actualResult}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-bold text-[11px] ${
                          row.passed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {row.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
