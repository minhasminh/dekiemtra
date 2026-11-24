import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Layout,
  Link2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  AuthenticatedUserSession,
  MenuSectionId,
  SmartQuestionLinkConfig,
  ToastNotification,
} from '../types/domain';
import {
  SMART_QUESTION_LINK_UPDATED_EVENT,
  buildSmartQuestionEmbedProxyUrl,
  fetchSmartQuestionLinkConfig,
  getCachedSmartQuestionLinkConfig,
  normalizeClientSmartUrl,
  updateSmartQuestionLinkConfig,
} from '../services/smartQuestionLinkService';

interface SmartQuestionLinkAdminConfigPanelProps {
  schoolId?: string;
  actorUserId?: string;
  actorName?: string;
  actorRole?: string;
  sessionToken?: string;
  onNotify?: (type: ToastNotification['type'], title: string, message: string) => void;
  compact?: boolean;
}

export const SmartQuestionLinkAdminConfigPanel: React.FC<
  SmartQuestionLinkAdminConfigPanelProps
> = ({
  schoolId = 'GLOBAL',
  actorUserId,
  actorName = 'Quản trị viên',
  actorRole = 'SYSTEM_ADMIN',
  sessionToken,
  onNotify,
  compact = false,
}) => {
  const [savedConfig, setSavedConfig] = useState<SmartQuestionLinkConfig>(() =>
    getCachedSmartQuestionLinkConfig()
  );
  const [urlInput, setUrlInput] = useState<string>(() => getCachedSmartQuestionLinkConfig().url);
  const [descriptionInput, setDescriptionInput] = useState<string>(
    () => getCachedSmartQuestionLinkConfig().description
  );
  const [openModeInput, setOpenModeInput] = useState<'DIRECT_NEW_TAB' | 'IN_APP_WORKSPACE'>(
    () => getCachedSmartQuestionLinkConfig().openMode || 'IN_APP_WORKSPACE'
  );
  const [isEnabledInput, setIsEnabledInput] = useState<boolean>(
    () => getCachedSmartQuestionLinkConfig().isEnabled
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const syncFromConfig = useCallback((cfg: SmartQuestionLinkConfig) => {
    setSavedConfig(cfg);
    setUrlInput(cfg.url || '');
    setDescriptionInput(
      cfg.description ||
        'Công cụ hỗ trợ giáo viên biên soạn và phát triển câu hỏi thông minh theo đường liên kết do Quản trị viên cung cấp.'
    );
    setOpenModeInput(cfg.openMode || 'IN_APP_WORKSPACE');
    setIsEnabledInput(cfg.isEnabled !== undefined ? cfg.isEnabled : true);
  }, []);

  const reloadFromServer = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = await fetchSmartQuestionLinkConfig(schoolId);
      syncFromConfig(cfg);
    } finally {
      setLoading(false);
    }
  }, [schoolId, syncFromConfig]);

  useEffect(() => {
    void reloadFromServer();
  }, [reloadFromServer]);

  useEffect(() => {
    const handleUpdated = (evt: Event) => {
      const customEvt = evt as CustomEvent<SmartQuestionLinkConfig>;
      if (customEvt.detail) {
        syncFromConfig(customEvt.detail);
      }
    };
    window.addEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, handleUpdated);
    return () => window.removeEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, handleUpdated);
  }, [syncFromConfig]);

  const previewValidUrl = useMemo(() => normalizeClientSmartUrl(urlInput), [urlInput]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const trimmed = urlInput.trim();
    if (trimmed && !previewValidUrl) {
      const errMsg =
        'Đường liên kết không hợp lệ. Vui lòng nhập địa chỉ web hợp lệ (ví dụ: https://share.gemini.google/... hoặc https://...).';
      setStatusMessage({ type: 'error', text: errMsg });
      onNotify?.('error', 'Đường liên kết chưa hợp lệ', errMsg);
      return;
    }

    setSaving(true);
    try {
      const result = await updateSmartQuestionLinkConfig({
        url: trimmed,
        buttonLabel: 'Tạo câu hỏi thông minh',
        description: descriptionInput.trim(),
        openMode: openModeInput,
        isEnabled: isEnabledInput,
        schoolId,
        actorUserId,
        actorName,
        actorRole,
        sessionToken,
      });

      if (!result.ok) {
        setStatusMessage({ type: 'error', text: result.message });
        onNotify?.('error', 'Không thể lưu cấu hình liên kết', result.message);
        return;
      }

      if (result.config) {
        syncFromConfig(result.config);
      }
      setStatusMessage({ type: 'success', text: result.message });
      onNotify?.('success', 'Đã cập nhật nút lệnh "Tạo câu hỏi thông minh"', result.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearLink = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const result = await updateSmartQuestionLinkConfig({
        url: '',
        buttonLabel: 'Tạo câu hỏi thông minh',
        description: descriptionInput.trim(),
        openMode: openModeInput,
        isEnabled: isEnabledInput,
        schoolId,
        actorUserId,
        actorName,
        actorRole,
        sessionToken,
      });
      if (result.ok && result.config) {
        syncFromConfig(result.config);
        setStatusMessage({ type: 'success', text: result.message });
        onNotify?.('info', 'Đã xóa đường liên kết', result.message);
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-800">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>CẤU HÌNH QUẢN TRỊ VIÊN (ADMIN)</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Thiết lập Đường liên kết cho Nút lệnh Menu: &ldquo;Tạo câu hỏi thông minh&rdquo;</span>
          </h3>
          {!compact && (
            <p className="text-xs text-slate-600 leading-relaxed">
              Nhập địa chỉ liên kết (URL) công cụ tạo câu hỏi thông minh để cung cấp cho giáo viên và
              cán bộ chuyên môn khi bấm nút lệnh <strong>&ldquo;Tạo câu hỏi thông minh&rdquo;</strong>{' '}
              trên thanh Menu ứng dụng. Hệ thống tích hợp sẵn Cổng nhúng thông minh tự động vượt rào
              cản <code className="font-mono">X-Frame-Options</code>.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              savedConfig.url
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                savedConfig.url ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {savedConfig.url ? 'Đã gắn liên kết hoạt động' : 'Chưa nhập đường liên kết'}
          </span>
          <button
            type="button"
            onClick={() => void reloadFromServer()}
            disabled={loading}
            title="Tải lại cấu hình từ máy chủ"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            1. Đường liên kết đích (URL) cho nút lệnh &ldquo;Tạo câu hỏi thông minh&rdquo; (*)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Nhập đường liên kết (VD: https://share.gemini.google/... hoặc https://...)"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
              />
            </div>

            {previewValidUrl && (
              <a
                href={previewValidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-semibold whitespace-nowrap shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Kiểm tra thử liên kết</span>
              </a>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Hỗ trợ trực tiếp liên kết chia sẻ <strong>Gemini Canvas</strong> (
            <code className="font-mono">share.gemini.google/...</code>) và các đường dẫn chuẩn{' '}
            <code className="font-mono">https://</code> / <code className="font-mono">http://</code>{' '}
            mà không bị chặn bởi <code className="font-mono">X-Frame-Options</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              2. Hành vi khi người dùng bấm nút lệnh trên Menu
            </label>
            <select
              value={openModeInput}
              onChange={(e) =>
                setOpenModeInput(e.target.value as 'DIRECT_NEW_TAB' | 'IN_APP_WORKSPACE')
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="IN_APP_WORKSPACE">
                Nhúng trực tiếp trong khung ứng dụng (Khuyên dùng · Đã xử lý X-Frame-Options)
              </option>
              <option value="DIRECT_NEW_TAB">
                Mở thẳng sang Tab trình duyệt mới ngay khi bấm Menu
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              3. Trạng thái hiển thị nút lệnh trên Menu ứng dụng
            </label>
            <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabledInput}
                onChange={(e) => setIsEnabledInput(e.target.checked)}
                className="w-4 h-4 accent-blue-700 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800">
                Hiển thị nút lệnh &ldquo;Tạo câu hỏi thông minh&rdquo; trên thanh Menu của giáo viên
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            4. Ghi chú / Hướng dẫn sử dụng hiển thị cho Giáo viên (Tùy chọn)
          </label>
          <textarea
            rows={2}
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            placeholder="Nhập hướng dẫn ngắn cho giáo viên khi sử dụng liên kết Tạo câu hỏi thông minh..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Cập nhật gần nhất:{' '}
            <span className="font-semibold text-slate-700">
              {savedConfig.updatedBy || 'Hệ thống'}
            </span>{' '}
            ·{' '}
            <span className="font-mono">
              {savedConfig.updatedAt
                ? new Date(savedConfig.updatedAt).toLocaleString('vi-VN')
                : 'Chưa ghi nhận'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {savedConfig.url && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleClearLink()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa liên kết</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu đường liên kết'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

interface SmartQuestionLinkWorkspaceProps {
  authSession: AuthenticatedUserSession | null;
  activeRoleKey: string;
  schoolId?: string;
  onNavigateMenu: (menuId: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

export const SmartQuestionLinkWorkspace: React.FC<SmartQuestionLinkWorkspaceProps> = ({
  authSession,
  activeRoleKey,
  schoolId,
  onNavigateMenu,
  onNotify,
}) => {
  const [linkConfig, setLinkConfig] = useState<SmartQuestionLinkConfig>(() =>
    getCachedSmartQuestionLinkConfig()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showEmbeddedFrame, setShowEmbeddedFrame] = useState<boolean>(true);
  const [expandedFrame, setExpandedFrame] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [iframeRevision, setIframeRevision] = useState<number>(0);
  const [forceRefreshEmbed, setForceRefreshEmbed] = useState<boolean>(false);
  const [showAdminEditor, setShowAdminEditor] = useState<boolean>(false);

  const isAdminActor = useMemo(() => {
    const adminRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'SYSTEM_ADMIN'];
    if (adminRoles.includes(String(activeRoleKey || '').toUpperCase())) return true;
    if (adminRoles.includes(String(authSession?.user?.activeRole || '').toUpperCase())) return true;
    if (
      Array.isArray(authSession?.user?.roles) &&
      authSession.user.roles.some((r) => adminRoles.includes(String(r).toUpperCase()))
    ) {
      return true;
    }
    return false;
  }, [activeRoleKey, authSession]);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = await fetchSmartQuestionLinkConfig(schoolId);
      setLinkConfig(cfg);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    const handleUpdated = (evt: Event) => {
      const customEvt = evt as CustomEvent<SmartQuestionLinkConfig>;
      if (customEvt.detail) {
        setLinkConfig(customEvt.detail);
        setIframeLoading(true);
        setForceRefreshEmbed(true);
        setIframeRevision((prev) => prev + 1);
      }
    };
    window.addEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, handleUpdated);
    return () => window.removeEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, handleUpdated);
  }, []);

  useEffect(() => {
    const handleMessage = (evt: MessageEvent) => {
      if (evt.data && evt.data.type === 'EDUTEST_SMART_EMBED_READY') {
        setIframeLoading(false);
        setForceRefreshEmbed(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!iframeLoading) return;
    const timer = window.setTimeout(() => {
      setIframeLoading(false);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [iframeLoading, iframeRevision]);

  const validUrl = useMemo(() => normalizeClientSmartUrl(linkConfig.url), [linkConfig.url]);

  const embedProxyUrl = useMemo(
    () => buildSmartQuestionEmbedProxyUrl(validUrl, forceRefreshEmbed, iframeRevision),
    [validUrl, forceRefreshEmbed, iframeRevision]
  );

  const targetHostname = useMemo(() => {
    if (!validUrl) return '';
    try {
      return new URL(validUrl).hostname;
    } catch {
      return '';
    }
  }, [validUrl]);

  const handleCopyLink = async () => {
    if (!validUrl) return;
    try {
      await navigator.clipboard.writeText(validUrl);
      setCopied(true);
      onNotify(
        'success',
        'Đã sao chép đường liên kết',
        'Bạn có thể dán đường liên kết vào trình duyệt nếu muốn mở thủ công.'
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onNotify('warning', 'Không thể sao chép tự động', validUrl);
    }
  };

  const handleReloadEmbeddedFrame = () => {
    setIframeLoading(true);
    setForceRefreshEmbed(true);
    setIframeRevision((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Header của chức năng Tạo câu hỏi thông minh (Tự động thu gọn khi ở chế độ Phóng rộng khung) */}
      {!expandedFrame && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  <span>CÔNG CỤ LIÊN KẾT CHUYÊN MÔN</span>
                </span>
                {targetHostname && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-mono font-semibold text-emerald-800">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{targetHostname}</span>
                  </span>
                )}
              </div>

              <h1 className="text-lg font-bold text-slate-900">
                {linkConfig.buttonLabel || 'Tạo câu hỏi thông minh'}
              </h1>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                {linkConfig.description ||
                  'Công cụ hỗ trợ giáo viên biên soạn và phát triển câu hỏi thông minh theo đường liên kết do Quản trị viên cung cấp.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {validUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEmbeddedFrame((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                      showEmbeddedFrame
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Layout className="w-4 h-4" />
                    <span>{showEmbeddedFrame ? 'Đang hiển thị nhúng' : 'Hiển thị khung nhúng'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép liên kết</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Sao chép liên kết</span>
                      </>
                    )}
                  </button>

                  <a
                    href={validUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123D75] hover:bg-blue-900 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mở Tab mới</span>
                  </a>
                </>
              )}

              {isAdminActor && validUrl && (
                <button
                  type="button"
                  onClick={() => setShowAdminEditor((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-700" />
                  <span>{showAdminEditor ? 'Đóng cấu hình Admin' : 'Sửa liên kết (Admin)'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trạng thái khi Quản trị viên CHƯA nhập đường liên kết */}
      {!loading && !validUrl && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-amber-950">
                Đường liên kết &ldquo;Tạo câu hỏi thông minh&rdquo; chưa được thiết lập
              </h2>
              <p className="text-xs text-amber-900 leading-relaxed">
                {isAdminActor
                  ? 'Bạn đang đăng nhập với quyền Quản trị viên (Admin). Vui lòng nhập đường liên kết (URL) ngay tại biểu mẫu Quản trị bên dưới (hoặc trong mục Cấu hình hệ thống / Cấu hình trường) để kích hoạt nút lệnh cho giáo viên.'
                  : 'Hiện tại tài khoản Quản trị viên (Admin) chưa cung cấp đường liên kết cho nút lệnh này. Vui lòng liên hệ Quản trị viên nhà trường hoặc sử dụng công cụ AI tạo câu hỏi tích hợp sẵn.'}
              </p>
            </div>
          </div>

          {!isAdminActor && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigateMenu('ai-generator')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chuyển sang AI tạo câu hỏi tích hợp sẵn</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateMenu('questions')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                <span>Mở Ngân hàng câu hỏi</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Khung cấu hình nhanh chỉ hiển thị riêng cho tài khoản Quản trị viên (Admin) */}
      {isAdminActor && (!validUrl || showAdminEditor) && (
        <SmartQuestionLinkAdminConfigPanel
          schoolId={schoolId || authSession?.user?.schoolId || 'GLOBAL'}
          actorUserId={authSession?.user?.id}
          actorName={authSession?.user?.fullName}
          actorRole={activeRoleKey}
          sessionToken={authSession?.sessionToken}
          onNotify={onNotify}
        />
      )}

      {/* Thẻ thông tin truy cập nhanh khi người dùng tạm ẩn khung nhúng */}
      {validUrl && !showEmbeddedFrame && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto">
            <ExternalLink className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-xl mx-auto">
            <h2 className="text-base font-bold text-slate-900">
              Sẵn sàng truy cập công cụ &ldquo;Tạo câu hỏi thông minh&rdquo;
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bấm để hiển thị trực tiếp bên trong khung ứng dụng hoặc mở sang tab trình duyệt mới.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEmbeddedFrame(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
            >
              <Layout className="w-4 h-4" />
              <span>Hiển thị trực tiếp trong ứng dụng</span>
            </button>

            <a
              href={validUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123D75] hover:bg-blue-900 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              <span>Mở trong Tab mới</span>
            </a>
          </div>
        </div>
      )}

      {/* Khung nhúng trực tiếp qua Cổng Smart Embed Proxy (Đã xử lý X-Frame-Options & Gemini Canvas) */}
      {validUrl && showEmbeddedFrame && embedProxyUrl && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cổng nhúng trực tiếp hoạt động</span>
              </span>
              <span className="text-slate-500 font-mono truncate hidden sm:inline">
                {targetHostname}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReloadEmbeddedFrame}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                title="Tải lại nội dung khung nhúng"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${iframeLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Tải lại khung</span>
              </button>

              <button
                type="button"
                onClick={() => setExpandedFrame((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
              >
                {expandedFrame ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Thu gọn khung</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Mở rộng khung</span>
                  </>
                )}
              </button>

              <a
                href={validUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở sang Tab mới</span>
              </a>
            </div>
          </div>

          <div className="relative bg-slate-50">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 bg-white/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2.5 text-xs text-slate-600">
                <RefreshCw className="w-6 h-6 text-blue-700 animate-spin" />
                <div className="font-semibold text-slate-800">
                  Đang kết nối và khởi tạo không gian &ldquo;Tạo câu hỏi thông minh&rdquo;...
                </div>
              </div>
            )}
            <iframe
              key={`${embedProxyUrl}-${iframeRevision}`}
              src={embedProxyUrl}
              title="Tạo câu hỏi thông minh"
              allow="clipboard-read; clipboard-write; fullscreen; downloads"
              onLoad={() => {
                setIframeLoading(false);
                setForceRefreshEmbed(false);
              }}
              className={`w-full border-0 bg-white ${
                expandedFrame ? 'h-[86vh]' : 'h-[76vh]'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
