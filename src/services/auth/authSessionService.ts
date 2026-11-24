import {
  AuthenticatedUserSession,
  AuthNoticeCode,
  AuthVerificationSuiteReport,
  MultiRoleResolutionPolicy,
  SchoolBrandingConfig,
  SchoolStaffDirectoryEntry,
  WorkflowActorRole,
} from '../../types/domain';
import { executeFirebaseSendPasswordResetEmailNeutral } from '../firebase/firebaseClient';

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

function resolveApiUrl(apiPath: string): string {
  try {
    const rawBase = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_API_BASE_URL;
    const cleaned = String(rawBase || '')
      .trim()
      .replace(/\/+$/, '');
    if (cleaned) {
      return `${cleaned}${apiPath.startsWith('/') ? apiPath : `/${apiPath}`}`;
    }
  } catch {
    // fallback same-origin
  }
  return apiPath;
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
    const res = await fetch('/api/auth/school-accounts-directory');
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
    const res = await fetch('/api/auth/branding', {
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
        message: `Máy chủ Backend API (/api/auth/login) chưa chạy hoặc hosting đang phục vụ bản tĩnh (HTTP ${res.status}). Hãy khởi chạy ứng dụng Node.js (server.ts hoặc app.js) trên hosting thay vì chỉ xuất thư mục dist/.`,
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
        'Không thể kết nối tới máy chủ Backend EDU TEST AI (/api/auth/login). Vui lòng kiểm tra ứng dụng Node.js trên hosting đã khởi chạy và đường truyền mạng ổn định.',
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
    const res = await fetch('/api/auth/sandbox-role-session', {
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
  const { token } = getStoredSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(resolveApiUrl('/api/auth/session'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401 || res.status === 403) {
      clearStoredSessionToken();
      return null;
    }
    if (!res.ok) {
      return null;
    }
    const data = await parseJsonOrNull(res);
    if (data?.ok && data?.session) {
      return data.session as AuthenticatedUserSession;
    }
    return null;
  } catch {
    return null;
  }
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
    const res = await fetch('/api/auth/select-role', {
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
    const res = await fetch('/api/auth/forgot-password', {
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
  if (!token) return;

  try {
    await fetch('/api/auth/logout', {
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
      `/api/auth/protected-check?route=${encodeURIComponent(targetRoute)}`,
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
    const res = await fetch('/api/auth/run-verification-suite', {
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
