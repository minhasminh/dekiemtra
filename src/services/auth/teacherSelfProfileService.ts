import {
  executeFirebaseSdkPasswordUpdateIfApplicable,
  executeFirebaseSendPasswordResetEmailNeutral,
  executeFirebaseUpdatePersonalDisplayNameAndPhoto,
  inspectFirebaseAuthProviderSupport,
} from '../firebase/firebaseClient';
import { getSimulateNetworkOffline, getStoredSessionToken } from './authSessionService';

export interface FunctionalPermissionBadge {
  code: string;
  label: string;
  category: string;
}

export interface SelfProfileAuditEvent {
  id: string;
  timestamp: string;
  action: string;
  summary: string;
  actorName: string;
}

export interface TeacherSelfProfileRecord {
  uid: string;
  schoolId: string;
  schoolName: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  contactPhone: string;
  contactNote: string;
  positionTitle: string;
  departmentName: string;
  educationLevels: string[];
  assignedSubjects: string[];
  assignedGrades: number[];
  roles: string[];
  roleLabels: string[];
  activeRole: string;
  functionalPermissions: FunctionalPermissionBadge[];
  status: string;
  statusLabel: string;
  authProvider: 'password' | 'google.com';
  updatedAt: string;
  lastPasswordChangedAt: string | null;
  zeroPasswordInFirestoreVerified: boolean;
  zeroPasswordInLocalStorageVerified: boolean;
  adminManagedLockNotice: string;
  emailChangePolicyNotice: string;
  auditTrail: SelfProfileAuditEvent[];
}

export interface PasswordValidationEvaluation {
  currentPasswordEmpty: boolean;
  newPasswordEmpty: boolean;
  confirmPasswordEmpty: boolean;
  minLengthPassed: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  matchesConfirmation: boolean;
  notSameAsCurrent: boolean;
  strengthScore: 0 | 1 | 2 | 3 | 4;
  strengthLabel: 'CHƯA NHẬP' | 'QUÁ YẾU' | 'TRUNG BÌNH' | 'KHÁ' | 'MẠNH';
  isPolicyCompliant: boolean;
  canSubmit: boolean;
  fieldErrors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  honestHistoryPolicyNote: string;
}

/**
 * Mục V: Kiểm tra mật khẩu tại giao diện trước khi gửi yêu cầu
 */
export function evaluateTeacherPasswordPolicy(params: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  touched?: {
    currentPassword?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  };
}): PasswordValidationEvaluation {
  const current = params.currentPassword || '';
  const next = params.newPassword || '';
  const confirm = params.confirmPassword || '';
  const touched = params.touched || {};

  const currentPasswordEmpty = current.length === 0;
  const newPasswordEmpty = next.length === 0;
  const confirmPasswordEmpty = confirm.length === 0;

  const minLengthPassed = next.length >= 8;
  const hasUppercase = /[A-Z]/.test(next);
  const hasLowercase = /[a-z]/.test(next);
  const hasNumber = /[0-9]/.test(next);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(next);

  const matchesConfirmation = !confirmPasswordEmpty && next === confirm;
  const notSameAsCurrent = currentPasswordEmpty || newPasswordEmpty || next !== current;

  let criteriaMet = 0;
  if (minLengthPassed) criteriaMet += 1;
  if (hasUppercase && hasLowercase) criteriaMet += 1;
  if (hasNumber) criteriaMet += 1;
  if (hasSpecialChar) criteriaMet += 1;

  let strengthScore: 0 | 1 | 2 | 3 | 4 = 0;
  let strengthLabel: PasswordValidationEvaluation['strengthLabel'] = 'CHƯA NHẬP';

  if (newPasswordEmpty) {
    strengthScore = 0;
    strengthLabel = 'CHƯA NHẬP';
  } else if (!minLengthPassed || criteriaMet <= 1) {
    strengthScore = 1;
    strengthLabel = 'QUÁ YẾU';
  } else if (criteriaMet === 2) {
    strengthScore = 2;
    strengthLabel = 'TRUNG BÌNH';
  } else if (criteriaMet === 3) {
    strengthScore = 3;
    strengthLabel = 'KHÁ';
  } else {
    strengthScore = 4;
    strengthLabel = 'MẠNH';
  }

  const isPolicyCompliant =
    minLengthPassed &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    notSameAsCurrent;

  const fieldErrors: PasswordValidationEvaluation['fieldErrors'] = {};

  if (touched.currentPassword && currentPasswordEmpty) {
    fieldErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại để xác thực lại phiên đăng nhập.';
  }

  if (touched.newPassword) {
    if (newPasswordEmpty) {
      fieldErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    } else if (!notSameAsCurrent) {
      fieldErrors.newPassword =
        'Mật khẩu mới không được trùng với mật khẩu hiện tại đang sử dụng.';
    } else if (!minLengthPassed) {
      fieldErrors.newPassword =
        'Mật khẩu mới quá yếu: Bắt buộc tối thiểu 8 ký tự (tương thích Firebase Authentication và chính sách bảo mật nhà trường).';
    } else if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      fieldErrors.newPassword =
        'Mật khẩu mới cần bao gồm chữ hoa (A-Z), chữ thường (a-z), chữ số (0-9) và ký tự đặc biệt (!@#$...).';
    }
  }

  if (touched.confirmPassword) {
    if (confirmPasswordEmpty) {
      fieldErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới để xác nhận.';
    } else if (!matchesConfirmation) {
      fieldErrors.confirmPassword = 'Xác nhận mật khẩu mới không khớp với mật khẩu mới.';
    }
  }

  const canSubmit =
    !currentPasswordEmpty &&
    !newPasswordEmpty &&
    !confirmPasswordEmpty &&
    isPolicyCompliant &&
    matchesConfirmation;

  return {
    currentPasswordEmpty,
    newPasswordEmpty,
    confirmPasswordEmpty,
    minLengthPassed,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    matchesConfirmation,
    notSameAsCurrent,
    strengthScore,
    strengthLabel,
    isPolicyCompliant,
    canSubmit,
    fieldErrors,
    honestHistoryPolicyNote:
      'Hệ thống kiểm tra trực tiếp không cho đặt mật khẩu mới trùng với mật khẩu hiện tại trong bước xác thực lại (Re-authentication). Hệ thống không lưu lịch sử nhiều mật khẩu cũ để tránh lưu trữ thêm dữ liệu nhạy cảm.',
  };
}

export interface EightStepPasswordChangeTrace {
  stepNumber: number;
  stepTitle: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  detail: string;
}

export interface PasswordChangeResponse {
  ok: boolean;
  errorCode?: string;
  message: string;
  steps: EightStepPasswordChangeTrace[];
  profile?: TeacherSelfProfileRecord;
}

export interface TeacherSelfProfile14ScenarioRow {
  scenarioOrder: number;
  scenarioCode: string;
  title: string;
  inputSummary: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
}

export interface TeacherSelfProfile14ScenarioReport {
  runId: string;
  executedAt: string;
  testAccountId: string;
  testAccountEmail: string;
  uidBefore: string;
  uidAfter: string;
  uidUnchanged: boolean;
  rolesUnchanged: boolean;
  permissionsUnchanged: boolean;
  questionsAndExamsIntact: boolean;
  zeroPasswordInFirestore: boolean;
  zeroPasswordInAuditLogs: boolean;
  all14Passed: boolean;
  passedCount: number;
  totalCount: number;
  scenarios: TeacherSelfProfile14ScenarioRow[];
}

export async function fetchTeacherSelfProfile(params?: {
  userIdOverride?: string;
  authProviderOverride?: 'password' | 'google.com';
}): Promise<{
  ok: boolean;
  profile?: TeacherSelfProfileRecord;
  message?: string;
}> {
  if (getSimulateNetworkOffline() || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      message: 'Mất kết nối mạng. Không thể tải hồ sơ cá nhân từ máy chủ.',
    };
  }

  try {
    const { token } = getStoredSessionToken();
    const qs = new URLSearchParams();
    if (params?.userIdOverride) qs.set('userId', params.userIdOverride);
    if (params?.authProviderOverride) qs.set('authProvider', params.authProviderOverride);

    const url = `/api/auth/self-profile${qs.toString() ? `?${qs.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (res.ok && data?.ok && data?.profile) {
      return {
        ok: true,
        profile: data.profile as TeacherSelfProfileRecord,
      };
    }
    return {
      ok: false,
      message: data?.message || 'Không thể tải thông tin cá nhân.',
    };
  } catch {
    return {
      ok: false,
      message: 'Mất kết nối mạng khi tải thông tin cá nhân.',
    };
  }
}

export async function updateTeacherSelfPersonalInfo(params: {
  userIdOverride?: string;
  fullName: string;
  avatarUrl?: string;
  contactPhone?: string;
  contactNote?: string;
  attemptedTamperFields?: Record<string, unknown>;
}): Promise<{
  ok: boolean;
  errorCode?: string;
  message: string;
  profile?: TeacherSelfProfileRecord;
}> {
  if (getSimulateNetworkOffline() || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      errorCode: 'NETWORK_OFFLINE',
      message: 'Mất kết nối mạng. Không thể lưu thay đổi hồ sơ cá nhân.',
    };
  }

  try {
    const { token } = getStoredSessionToken();
    const res = await fetch('/api/auth/self-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: params.userIdOverride,
        fullName: params.fullName,
        avatarUrl: params.avatarUrl || '',
        contactPhone: params.contactPhone || '',
        contactNote: params.contactNote || '',
        ...(params.attemptedTamperFields || {}),
      }),
    });
    const data = await res.json();
    if (res.ok && data?.ok && data?.profile) {
      await executeFirebaseUpdatePersonalDisplayNameAndPhoto({
        fullName: params.fullName,
        avatarUrl: params.avatarUrl,
      });
      return {
        ok: true,
        message: data.message || 'Đã cập nhật thông tin cá nhân thành công.',
        profile: data.profile as TeacherSelfProfileRecord,
      };
    }
    return {
      ok: false,
      errorCode: data?.errorCode || 'UPDATE_REJECTED',
      message: data?.message || 'Không thể cập nhật thông tin cá nhân.',
    };
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_OFFLINE',
      message: 'Mất kết nối mạng khi cập nhật thông tin cá nhân.',
    };
  }
}

/**
 * Mục VI: Quy trình Đổi Mật khẩu 8 Bước chuẩn bảo mật Firebase Authentication & Backend PBKDF2
 */
export async function changeTeacherPassword8Steps(params: {
  userIdOverride?: string;
  authProviderOverride?: 'password' | 'google.com';
  simulateRequiresRecentLogin?: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<PasswordChangeResponse> {
  if (getSimulateNetworkOffline() || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      errorCode: 'NETWORK_OFFLINE',
      message:
        'Mất kết nối mạng. Vui lòng kiểm tra đường truyền Internet trước khi thực hiện đổi mật khẩu.',
      steps: [
        {
          stepNumber: 1,
          stepTitle: 'Bước 1: Lấy người dùng đang đăng nhập từ Firebase Auth / Phiên xác thực',
          status: 'FAILED',
          detail: 'Không thể thực hiện do thiết bị đang mất kết nối mạng (auth/network-request-failed).',
        },
      ],
    };
  }

  // Kiểm tra trên Firebase Client SDK nếu có phiên đăng nhập trực tiếp
  const sdkProvider = inspectFirebaseAuthProviderSupport();
  if (
    params.authProviderOverride === 'google.com' ||
    (sdkProvider.hasFirebaseUser && sdkProvider.isGoogleOnlyAccount)
  ) {
    return {
      ok: false,
      errorCode: 'AUTH_PROVIDER_GOOGLE_ONLY',
      message:
        'Tài khoản này đang đăng nhập qua Google và không sử dụng mật khẩu Email/Password riêng trên hệ thống. Vui lòng quản lý mật khẩu trực tiếp tại tài khoản Google của bạn.',
      steps: [
        {
          stepNumber: 1,
          stepTitle: 'Bước 1: Lấy người dùng đang đăng nhập từ Firebase Auth',
          status: 'PASSED',
          detail: 'Đã xác định phiên đăng nhập hợp lệ.',
        },
        {
          stepNumber: 2,
          stepTitle: 'Bước 2: Kiểm tra tài khoản có hỗ trợ đăng nhập bằng mật khẩu hay không',
          status: 'FAILED',
          detail:
            'Phương thức xác thực hiện tại là Google (providerId = google.com), không sử dụng mật khẩu Email/Password.',
        },
      ],
    };
  }

  try {
    // Nếu người dùng đang có phiên Email/Password trên Firebase SDK, thực hiện reauthenticateWithCredential + updatePassword
    if (sdkProvider.hasFirebaseUser && sdkProvider.supportsEmailPassword) {
      const sdkOutcome = await executeFirebaseSdkPasswordUpdateIfApplicable({
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
      });
      if (sdkOutcome.attemptedOnFirebaseSdk && !sdkOutcome.sdkSucceeded) {
        return {
          ok: false,
          errorCode: sdkOutcome.errorCode || 'FIREBASE_AUTH_REJECTED',
          message:
            sdkOutcome.friendlyMessageVi ||
            'Firebase Authentication từ chối cập nhật mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.',
          steps: [],
        };
      }
    }

    const { token } = getStoredSessionToken();
    const res = await fetch('/api/auth/self-change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: params.userIdOverride,
        authProvider: params.authProviderOverride || 'password',
        simulateRequiresRecentLogin: Boolean(params.simulateRequiresRecentLogin),
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
        confirmPassword: params.confirmPassword,
      }),
    });
    const data = await res.json();
    return {
      ok: Boolean(res.ok && data?.ok),
      errorCode: data?.errorCode,
      message:
        data?.message ||
        (res.ok
          ? 'Đã đổi mật khẩu đăng nhập thành công.'
          : 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin.'),
      steps: Array.isArray(data?.steps) ? data.steps : [],
      profile: data?.profile as TeacherSelfProfileRecord | undefined,
    };
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_OFFLINE',
      message: 'Mất kết nối mạng máy chủ trong quá trình đổi mật khẩu. Vui lòng thử lại.',
      steps: [],
    };
  }
}

/**
 * Mục VIII: Quên mật khẩu – Gửi email đặt lại mật khẩu qua sendPasswordResetEmail
 * với thông báo trung tính tuyệt đối không lộ email có tồn tại hay không.
 */
export async function sendTeacherForgotPasswordReset(emailInput: string): Promise<{
  ok: boolean;
  neutralMessage: string;
  configurationNotice: string;
}> {
  const exactNeutralMessage =
    'Nếu email được đăng ký và đủ điều kiện, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.';

  if (getSimulateNetworkOffline() || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      neutralMessage: 'Mất kết nối mạng. Không thể gửi yêu cầu đặt lại mật khẩu.',
      configurationNotice: '',
    };
  }

  const cleaned = String(emailInput || '').trim();
  if (!cleaned) {
    return {
      ok: false,
      neutralMessage: 'Vui lòng nhập địa chỉ email đăng nhập của bạn.',
      configurationNotice: '',
    };
  }

  await executeFirebaseSendPasswordResetEmailNeutral(cleaned);

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: cleaned }),
    });
    const data = await res.json();
    return {
      ok: true,
      neutralMessage: data?.neutralMessage || exactNeutralMessage,
      configurationNotice:
        data?.configurationNotice ||
        'Lưu ý cấu hình Firebase Authentication: Mẫu email đặt lại mật khẩu (Password Reset Template) và tên miền chuyển hướng (Authorized Domains / Action URL) được quản lý tại Firebase Console → Authentication → Templates & Settings.',
    };
  } catch {
    return {
      ok: false,
      neutralMessage: 'Mất kết nối mạng. Không thể gửi yêu cầu đặt lại mật khẩu.',
      configurationNotice: '',
    };
  }
}

/**
 * Mục XII: Thực thi tự động 14 kịch bản kiểm thử Đổi mật khẩu & Quản lý thông tin cá nhân
 */
export async function runTeacherSelfProfile14ScenariosSuite(): Promise<TeacherSelfProfile14ScenarioReport | null> {
  try {
    const res = await fetch('/api/auth/self-profile/run-14-qa-scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.report as TeacherSelfProfile14ScenarioReport) || null;
  } catch {
    return null;
  }
}
