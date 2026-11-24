import { SmartQuestionLinkConfig } from '../types/domain';

const LOCAL_STORAGE_CACHE_KEY = 'edutest_smart_question_link_config_v1';
export const SMART_QUESTION_LINK_UPDATED_EVENT = 'edutest:smart-question-link-updated';

export function getDefaultSmartQuestionLinkConfig(): SmartQuestionLinkConfig {
  return {
    url: '',
    buttonLabel: 'Tạo câu hỏi thông minh',
    description:
      'Công cụ hỗ trợ giáo viên biên soạn và phát triển câu hỏi thông minh theo đường liên kết do Quản trị viên cung cấp.',
    openMode: 'IN_APP_WORKSPACE',
    isEnabled: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống Quản trị',
    updatedByRole: 'SUPER_ADMIN',
    schoolId: 'GLOBAL',
  };
}

export function getCachedSmartQuestionLinkConfig(): SmartQuestionLinkConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SmartQuestionLinkConfig>;
      if (parsed && typeof parsed === 'object') {
        return {
          ...getDefaultSmartQuestionLinkConfig(),
          ...parsed,
        };
      }
    }
  } catch {
    // Ignore storage read error
  }
  return getDefaultSmartQuestionLinkConfig();
}

function saveCachedSmartQuestionLinkConfig(cfg: SmartQuestionLinkConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(cfg));
  } catch {
    // Ignore storage write error
  }
}

export function notifySmartQuestionLinkUpdated(cfg: SmartQuestionLinkConfig): void {
  saveCachedSmartQuestionLinkConfig(cfg);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<SmartQuestionLinkConfig>(SMART_QUESTION_LINK_UPDATED_EVENT, {
        detail: cfg,
      })
    );
  }
}

export function normalizeClientSmartUrl(rawUrl: string): string {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withProtocol);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return u.toString();
  } catch {
    return '';
  }
}

export function buildSmartQuestionEmbedProxyUrl(
  targetUrl: string,
  forceRefresh = false,
  revision = 0
): string {
  const normalized = normalizeClientSmartUrl(targetUrl);
  if (!normalized) return '';
  const params = new URLSearchParams({ url: normalized });
  if (forceRefresh) {
    params.set('refresh', '1');
  }
  if (revision > 0) {
    params.set('rev', String(revision));
  }
  return `/api/system/smart-question-embed?${params.toString()}`;
}

export async function fetchSmartQuestionLinkConfig(
  schoolId?: string
): Promise<SmartQuestionLinkConfig> {
  try {
    const query = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : '';
    const res = await fetch(`/api/system/smart-question-link${query}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && data.config) {
        const merged: SmartQuestionLinkConfig = {
          ...getDefaultSmartQuestionLinkConfig(),
          ...data.config,
        };
        saveCachedSmartQuestionLinkConfig(merged);
        return merged;
      }
    }
  } catch {
    // Fallback to cached config if offline
  }
  return getCachedSmartQuestionLinkConfig();
}

export async function updateSmartQuestionLinkConfig(params: {
  url: string;
  buttonLabel?: string;
  description?: string;
  openMode?: 'DIRECT_NEW_TAB' | 'IN_APP_WORKSPACE';
  isEnabled?: boolean;
  schoolId?: string;
  actorUserId?: string;
  actorName?: string;
  actorRole?: string;
  sessionToken?: string;
}): Promise<{
  ok: boolean;
  config?: SmartQuestionLinkConfig;
  message: string;
}> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (params.actorRole) {
      headers['x-actor-role'] = params.actorRole;
    }
    if (params.sessionToken) {
      headers.Authorization = `Bearer ${params.sessionToken}`;
    }

    const res = await fetch('/api/system/smart-question-link', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        url: params.url,
        buttonLabel: params.buttonLabel || 'Tạo câu hỏi thông minh',
        description: params.description ?? '',
        openMode: params.openMode || 'IN_APP_WORKSPACE',
        isEnabled: params.isEnabled !== undefined ? params.isEnabled : true,
        schoolId: params.schoolId || 'GLOBAL',
        actorUserId: params.actorUserId,
        actorName: params.actorName,
        actorRole: params.actorRole,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        message: data?.message || 'Không thể lưu cấu hình đường liên kết.',
      };
    }

    const savedCfg: SmartQuestionLinkConfig = {
      ...getDefaultSmartQuestionLinkConfig(),
      ...data.config,
    };
    notifySmartQuestionLinkUpdated(savedCfg);
    return {
      ok: true,
      config: savedCfg,
      message: data.message || 'Đã lưu đường liên kết "Tạo câu hỏi thông minh" thành công.',
    };
  } catch (err: unknown) {
    const fallbackMsg =
      err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi lưu cấu hình liên kết.';
    return {
      ok: false,
      message: fallbackMsg,
    };
  }
}
