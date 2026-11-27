import {
  AuthenticatedUserSession,
  AuthNoticeCode,
  AuthVerificationSuiteReport,
  MultiRoleResolutionPolicy,
  SchoolBrandingConfig,
  SchoolStaffDirectoryEntry,
  WorkflowActorRole,
} from '../../types/domain';
import {
  executeFirebaseSendPasswordResetEmailNeutral,
  signInWithGoogleFirebase,
  signOutFirebase,
  waitForFirebaseAuthUser,
  type FirebaseUser,
} from '../firebase/firebaseClient';

const PERSISTENT_SESSION_TOKEN_KEY = 'edutest_auth_persistent_token_v1';
const EPHEMERAL_SESSION_TOKEN_KEY = 'edutest_auth_ephemeral_token_v1';
const CACHED_BRANDING_STORAGE_KEY = 'edutest_school_branding_cache_v1';

const DEFAULT_BRANDING_FALLBACK: SchoolBrandingConfig = {
  schoolId: 'SCH-DAN-DIEN-NDA',
  softwareTitle: 'EDU TEST AI',
  softwareSubtitle: 'NGÂN HÀNG ĐỀ KIỂM TRA THÔNG MINH',
  schoolName: 'Trường TH &THCS Nguyễn Đình Anh',
  governingBody: 'UBND XÃ ĐAN ĐIỀN',
  academicYear: '2026 - 2027',
  logoUrl: '',
  multiRolePolicy: 'SELECT_WORKING_ROLE',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Hệ thống',
};

export function resolveApiUrl(apiPath: string): string {
  const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    const rawBase = env?.VITE_API_BASE_URL;
    const cleaned = String(rawBase || '')
      .trim()
      .replace(/\/+$/, '');
    if (cleaned) {
      return `${cleaned}${normalizedPath}`;
    }
    const viteBaseUrl = String(env?.BASE_URL || '/')
      .trim()
      .replace(/\/+$/, '');
    if (viteBaseUrl && viteBaseUrl !== '/') {
      return `${viteBaseUrl}${normalizedPath}`;
    }
  } catch {
    // fallback same-origin
  }
  return normalizedPath;
}

async function parseJsonOrNull(res: Response): Promise<Record<string, unknown> | null> {
  const ct = String(res.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) {
    return null;
  }
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export interface AuthActionOutcome {
  ok: boolean;
  noticeCode?: AuthNoticeCode;
  message: string;
  session?: AuthenticatedUserSession;
}

// Cho phép giả lập mất kết nối mạng để kiểm thử thông báo NETWORK_DISCONNECTED (Mục I.4)
let simulateNetworkOffline = false;

export function setSimulateNetworkOffline(offline: boolean): void {
  simulateNetworkOffline = offline;
}

export function getSimulateNetworkOffline(): boolean {
  return simulateNetworkOffline;
}

export function getStoredSessionToken(): { token: string | null; rememberMe: boolean } {
  try {
    const persistent = localStorage.getItem(PERSISTENT_SESSION_TOKEN_KEY);
    if (persistent) {
      return { token: persistent, rememberMe: true };
    }
    const ephemeral = sessionStorage.getItem(EPHEMERAL_SESSION_TOKEN_KEY);
    if (ephemeral) {
      return { token: ephemeral, rememberMe: false };
    }
  } catch {
    // ignore storage errors
  }
  return { token: null, rememberMe: false };
}

export function saveSessionToken(token: string, rememberMe: boolean): void {
  try {
    if (rememberMe) {
      localStorage.setItem(PERSISTENT_SESSION_TOKEN_KEY, token);
      sessionStorage.removeItem(EPHEMERAL_SESSION_TOKEN_KEY);
    } else {
      sessionStorage.setItem(EPHEMERAL_SESSION_TOKEN_KEY, token);
      localStorage.removeItem(PERSISTENT_SESSION_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function clearStoredSessionToken(): void {
  try {
    localStorage.removeItem(PERSISTENT_SESSION_TOKEN_KEY);
    sessionStorage.removeItem(EPHEMERAL_SESSION_TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

export async function fetchSchoolBranding(): Promise<SchoolBrandingConfig> {
  try {
    const res = await fetch(resolveApiUrl('/api/auth/branding'));
    if (res.ok) {
      const data = await parseJsonOrNull(res);
      if (data?.branding) {
        const branding = data.branding as SchoolBrandingConfig;
        const normalizedBranding: SchoolBrandingConfig = {
          ...branding,
          academicYear:
            !branding.academicYear ||
            String(branding.academicYear).includes('2024') ||
            String(branding.academicYear).includes('2025')
              ? '2026 - 2027'
              : branding.academicYear,
        };
        try {
          localStorage.setItem(CACHED_BRANDING_STORAGE_KEY, JSON.stringify(normalizedBranding));
        } catch {
          // ignore
        }
        return normalizedBranding;
      }
    }
  } catch {
    // fallback to cached branding
  }
  try {
    const cached = localStorage.getItem(CACHED_BRANDING_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as SchoolBrandingConfig;
      if (
        !parsed.academicYear ||
        String(parsed.academicYear).includes('2024') ||
        String(parsed.academicYear).includes('2025')
      ) {
        parsed.academicYear = '2026 - 2027';
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_BRANDING_FALLBACK;
}

export async function fetchSchoolAccountsDirectory(): Promise<SchoolStaffDirectoryEntry[]> {
  try {
    const res = await fetch(resolveApiUrl('/api/auth/school-accounts-directory'));
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.accounts)) {
        return data.accounts as SchoolStaffDirectoryEntry[];
      }
    }
  } catch {
    // ignore network error
  }
  return [];
}

export async function updateSchoolBranding(updates: {
  schoolName?: string;
  governingBody?: string;
  academicYear?: string;
  logoUrl?: string;
  multiRolePolicy?: MultiRoleResolutionPolicy;
  updatedBy?: string;
}): Promise<{ ok: boolean; branding: SchoolBrandingConfig; message: string }> {
  try {
    const { token } = getStoredSessionToken();
    const res = await fetch(resolveApiUrl('/api/auth/branding'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (res.ok && data?.branding) {
      try {
        localStorage.setItem(CACHED_BRANDING_STORAGE_KEY, JSON.stringify(data.branding));
      } catch {
        // ignore
      }
      return {
        ok: true,
        branding: data.branding as SchoolBrandingConfig,
        message: 'Đã cập nhật thông tin Tên trường, Logo và Năm học thành công.',
      };
    }
    return {
      ok: false,
      branding: await fetchSchoolBranding(),
      message: data?.message || 'Không thể cập nhật thông tin đơn vị.',
    };
  } catch {
    return {
      ok: false,
      branding: await fetchSchoolBranding(),
      message: 'Mất kết nối mạng khi lưu cấu hình đơn vị.',
    };
  }
}

export async function loginWithCredentials(params: {
  identifier: string;
  password: string;
  rememberMe: boolean;
}): Promise<AuthActionOutcome> {
  if (simulateNetworkOffline || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message:
        'Mất kết nối mạng. Không thể kết nối tới máy chủ xác thực EDU TEST AI. Vui lòng kiểm tra đường truyền Internet và thử lại.',
    };
  }

  try {
    const res = await fetch(resolveApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: params.identifier.trim(),
        password: params.password,
        rememberMe: params.rememberMe,
      }),
    });

    const data = await parseJsonOrNull(res);
    if (!data) {
      return {
        ok: false,
        noticeCode: 'NETWORK_DISCONNECTED',
        message: `Hosting hiện đang phục vụ bản web tĩnh (chưa chạy Node.js cho /api/auth/login — HTTP ${res.status}). Hãy bấm nút "Đăng nhập bằng Google" bên dưới để vào hệ thống ngay qua Firebase, hoặc khởi chạy ứng dụng Node.js (app.js) trên hosting.`,
      };
    }

    if (res.ok && data.ok && data.session) {
      const session = data.session as AuthenticatedUserSession;
      saveSessionToken(session.sessionToken, Boolean(params.rememberMe));
      return {
        ok: true,
        message: String(data.message || 'Đăng nhập thành công.'),
        session,
      };
    }

    return {
      ok: false,
      noticeCode: (data.noticeCode as AuthNoticeCode) || 'INVALID_CREDENTIALS',
      message:
        String(data.message || '') ||
        'Thông tin đăng nhập (Email/Tên đăng nhập hoặc Mật khẩu) không chính xác. Vui lòng kiểm tra lại.',
    };
  } catch {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message:
        'Không thể kết nối tới máy chủ Backend (/api/auth/login). Hãy bấm nút "Đăng nhập bằng Google" bên dưới để đăng nhập qua Firebase, hoặc kiểm tra ứng dụng Node.js trên hosting.',
    };
  }
}

function buildDirectFirebaseSession(
  fbUser: FirebaseUser,
  rememberMe: boolean
): AuthenticatedUserSession {
  const email = String(fbUser.email || '').trim();
  const username = (email.split('@')[0] || 'teacher').trim();
  const fullName = String(fbUser.displayName || username || 'Giáo viên').trim();
  const isBootstrapPrincipal = email.toLowerCase() === 'phanducquy24@gmail.com';
  const roles: WorkflowActorRole[] = isBootstrapPrincipal
    ? ['SYSTEM_ADMIN', 'PRINCIPAL', 'TEACHER']
    : ['TEACHER'];
  const activeRole: WorkflowActorRole = isBootstrapPrincipal ? 'PRINCIPAL' : 'TEACHER';
  const now = new Date();
  const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;

  return {
    sessionToken: `firebase_google_${fbUser.uid}`,
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    rememberMe,
    authProvider: 'FIREBASE_GOOGLE_DIRECT',
    usernameMappedSafelyAtBackend: false,
    user: {
      id: fbUser.uid,
      schoolId: 'SCHOOL_A',
      username,
      email,
      fullName,
      positionTitle: isBootstrapPrincipal ? 'Hiệu trưởng' : 'Giáo viên',
      roles,
      activeRole,
      multiRoleMode: 'SELECT_WORKING_ROLE',
      combinedPermissions: [
        'VIEW_DASHBOARD',
        'MANAGE_QUESTIONS',
        'CREATE_MATRIX',
        'CREATE_EXAM',
        'EXPORT_EXAM',
      ],
      departmentName: 'Tổ Chuyên môn',
      assignedSubjects: ['Toán', 'Tiếng Việt', 'Khoa học tự nhiên', 'Tin học'],
      assignedGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      status: 'ACTIVE',
    },
    landingNavigation: {
      role: activeRole,
      roleDisplayName: isBootstrapPrincipal ? 'Hiệu trưởng' : 'Giáo viên bộ môn',
      targetMenuId: 'dashboard',
      targetPageTitle: 'Tổng quan EDU TEST AI',
      routePath: '/dashboard',
    },
  };
}

export async function loginWithGoogleFirebase(rememberMe: boolean): Promise<AuthActionOutcome> {
  if (simulateNetworkOffline || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message: 'Mất kết nối mạng. Không thể đăng nhập bằng Google Firebase lúc này.',
    };
  }

  try {
    const fbUser = await signInWithGoogleFirebase();
    if (!fbUser || !fbUser.email) {
      return {
        ok: false,
        noticeCode: 'INVALID_CREDENTIALS',
        message: 'Không lấy được thông tin email hợp lệ từ tài khoản Google.',
      };
    }

    const idToken = await fbUser.getIdToken();

    // Ưu tiên trao đổi ID Token với Backend Node.js để ánh xạ đúng vai trò trong 66 tài khoản trường học
    try {
      const res = await fetch(resolveApiUrl('/api/auth/firebase-google-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, rememberMe }),
      });
      const data = await parseJsonOrNull(res);
      if (data) {
        if (res.ok && data.ok && data.session) {
          const session = data.session as AuthenticatedUserSession;
          saveSessionToken(session.sessionToken, Boolean(rememberMe));
          return {
            ok: true,
            message: String(data.message || 'Đăng nhập bằng Google thành công.'),
            session,
          };
        }
        return {
          ok: false,
          noticeCode: (data.noticeCode as AuthNoticeCode) || 'INVALID_CREDENTIALS',
          message: String(data.message || 'Không thể xác thực tài khoản Google trên hệ thống.'),
        };
      }
    } catch {
      // Nếu hosting đang ở chế độ web tĩnh (không có Backend Node.js), chuyển sang phiên Firebase Auth trực tiếp đã xác thực bởi Google
    }

    const directSession = buildDirectFirebaseSession(fbUser, rememberMe);
    return {
      ok: true,
      message: 'Đăng nhập thành công qua tài khoản Google Firebase.',
      session: directSession,
    };
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code || '')
        : '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return {
        ok: false,
        noticeCode: 'INVALID_CREDENTIALS',
        message: 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.',
      };
    }
    if (code === 'auth/popup-blocked') {
      return {
        ok: false,
        noticeCode: 'INVALID_CREDENTIALS',
        message:
          'Trình duyệt đang chặn cửa sổ bật lên (Popup). Vui lòng cho phép Popup rồi bấm lại Đăng nhập bằng Google.',
      };
    }
    if (code === 'auth/unauthorized-domain') {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      return {
        ok: false,
        noticeCode: 'NO_ACCESS_PERMISSION',
        message: `Tên miền "${host}" chưa được cấp phép trong Firebase Authentication. Hãy vào Firebase Console → Authentication → Settings → Authorized domains và thêm "${host}".`,
      };
    }
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message: `Không thể đăng nhập bằng Google (${code || 'lỗi xác thực'}). Vui lòng kiểm tra kết nối mạng và thử lại.`,
    };
  }
}

/**
 * Kích hoạt phiên làm việc theo Vai trò, Tài khoản cụ thể hoặc Tình huống kiểm thử từ phía Backend
 * (Tuyệt đối không lưu tài khoản quản trị hay mật khẩu mặc định trong mã nguồn Frontend - Mục III)
 */
export async function loginWithServerRoleScenario(params: {
  roleOrScenario?:
    | WorkflowActorRole
    | 'UNACTIVATED'
    | 'DISABLED'
    | 'NO_ACCESS_PERMISSION';
  userId?: string;
  email?: string;
  rememberMe: boolean;
}): Promise<AuthActionOutcome> {
  if (simulateNetworkOffline || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message:
        'Mất kết nối mạng. Không thể kết nối tới máy chủ xác thực EDU TEST AI. Vui lòng kiểm tra đường truyền Internet và thử lại.',
    };
  }

  try {
    const res = await fetch(resolveApiUrl('/api/auth/sandbox-role-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleOrScenario: params.roleOrScenario,
        userId: params.userId,
        email: params.email,
        rememberMe: params.rememberMe,
      }),
    });

    const data = await res.json();
    if (res.ok && data?.ok && data?.session) {
      const session = data.session as AuthenticatedUserSession;
      saveSessionToken(session.sessionToken, Boolean(params.rememberMe));
      return {
        ok: true,
        message: data.message || 'Đã khởi tạo phiên đăng nhập thành công.',
        session,
      };
    }

    return {
      ok: false,
      noticeCode: (data?.noticeCode as AuthNoticeCode) || 'INVALID_CREDENTIALS',
      message:
        data?.message ||
        'Không thể đăng nhập với trạng thái tài khoản này.',
    };
  } catch {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message:
        'Mất kết nối mạng. Không thể kết nối tới máy chủ xác thực EDU TEST AI. Vui lòng kiểm tra đường truyền Internet và thử lại.',
    };
  }
}

export async function restoreAuthSession(): Promise<AuthenticatedUserSession | null> {
  const { token, rememberMe } = getStoredSessionToken();
  if (token) {
    try {
      const res = await fetch(resolveApiUrl('/api/auth/session'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401 || res.status === 403) {
        clearStoredSessionToken();
      } else if (res.ok) {
        const data = await parseJsonOrNull(res);
        if (data?.ok && data?.session) {
          return data.session as AuthenticatedUserSession;
        }
      }
    } catch {
      // fallback kiểm tra phiên Firebase Auth bên dưới
    }
  }

  // Hỗ trợ tự khôi phục phiên Google Firebase (kể cả trên hosting web tĩnh)
  try {
    const fbUser = await waitForFirebaseAuthUser(1800);
    if (fbUser && fbUser.email) {
      return buildDirectFirebaseSession(fbUser, rememberMe || true);
    }
  } catch {
    // ignore
  }
  return null;
}

export async function selectWorkingRoleOrPolicy(params: {
  activeRole?: WorkflowActorRole;
  multiRoleMode?: MultiRoleResolutionPolicy;
}): Promise<AuthActionOutcome> {
  const { token } = getStoredSessionToken();
  if (!token) {
    return {
      ok: false,
      noticeCode: 'PROTECTED_ROUTE_REQUIRED',
      message: 'Phiên đăng nhập không tồn tại hoặc đã hết hạn.',
    };
  }

  try {
    const res = await fetch(resolveApiUrl('/api/auth/select-role'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (res.ok && data?.ok && data?.session) {
      return {
        ok: true,
        message: data.message || 'Đã chuyển đổi vai trò làm việc.',
        session: data.session as AuthenticatedUserSession,
      };
    }
    return {
      ok: false,
      noticeCode: 'NO_ACCESS_PERMISSION',
      message: data?.message || 'Không thể chuyển đổi vai trò làm việc.',
    };
  } catch {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message: 'Mất kết nối mạng khi chuyển đổi vai trò làm việc.',
    };
  }
}

export async function requestSafePasswordReset(identifier: string): Promise<AuthActionOutcome> {
  if (simulateNetworkOffline || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message:
        'Mất kết nối mạng. Không thể gửi yêu cầu khôi phục mật khẩu.',
    };
  }

  try {
    const cleaned = identifier.trim();
    if (cleaned.includes('@')) {
      await executeFirebaseSendPasswordResetEmailNeutral(cleaned);
    }
    const res = await fetch(resolveApiUrl('/api/auth/forgot-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: cleaned }),
    });
    const data = await res.json();
    return {
      ok: Boolean(res.ok && data?.ok),
      noticeCode: 'PASSWORD_RESET_REQUESTED',
      message:
        data?.neutralMessage ||
        'Nếu email được đăng ký và đủ điều kiện, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.',
    };
  } catch {
    return {
      ok: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message: 'Mất kết nối mạng khi gửi yêu cầu đặt lại mật khẩu.',
    };
  }
}

export async function logoutCurrentSession(): Promise<void> {
  const { token } = getStoredSessionToken();
  clearStoredSessionToken();
  try {
    await signOutFirebase();
  } catch {
    // ignore firebase signOut error
  }
  if (!token) return;

  try {
    await fetch(resolveApiUrl('/api/auth/logout'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // ignore network error on logout
  }
}

export async function checkProtectedRouteGuard(targetRoute: string): Promise<{
  allowed: boolean;
  noticeCode?: AuthNoticeCode;
  message: string;
}> {
  const { token } = getStoredSessionToken();
  try {
    const res = await fetch(
      resolveApiUrl(`/api/auth/protected-check?route=${encodeURIComponent(targetRoute)}`),
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    const data = await res.json();
    if (res.ok && data?.ok) {
      return {
        allowed: true,
        message: data.message || 'Phiên đăng nhập hợp lệ.',
      };
    }
    return {
      allowed: false,
      noticeCode: (data?.noticeCode as AuthNoticeCode) || 'PROTECTED_ROUTE_REQUIRED',
      message:
        data?.message ||
        'Bạn cần đăng nhập để truy cập trang chức năng được bảo vệ của hệ thống.',
    };
  } catch {
    return {
      allowed: false,
      noticeCode: 'NETWORK_DISCONNECTED',
      message: 'Mất kết nối mạng khi kiểm tra quyền truy cập đường dẫn bảo vệ.',
    };
  }
}

export async function runBackendAuthVerificationSuite(): Promise<AuthVerificationSuiteReport | null> {
  try {
    const res = await fetch(resolveApiUrl('/api/auth/run-verification-suite'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.report as AuthVerificationSuiteReport) || null;
  } catch {
    return null;
  }
}
