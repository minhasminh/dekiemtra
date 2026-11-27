import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CloudDownload,
  CloudUpload,
  ExternalLink,
  GitBranch,
  History,
  RefreshCw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { getStoredSessionToken } from '../services/auth/authSessionService';
import { dataRepository } from '../services/storage/repository';

interface GitHubStorageConfigDTO {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  autoSyncEnabled: boolean;
  syncDebounceMs: number;
  commitAuthorName: string;
  commitAuthorEmail: string;
  updatedAt: string;
  updatedBy: string;
}

interface GitHubSyncLogDTO {
  id: string;
  timestamp: string;
  direction: 'PUSH' | 'PULL' | 'TEST';
  status: 'SUCCESS' | 'SKIPPED' | 'ERROR';
  reason: string;
  actorName: string;
  commitSha?: string;
  commitUrl?: string;
  sizeBytes?: number;
  message: string;
}

interface GitHubStorageStatusDTO {
  tokenConfigured: boolean;
  envSourceHint: string;
  config: GitHubStorageConfigDTO;
  readyForSync: boolean;
  isSyncing: boolean;
  lastPushAt: string | null;
  lastPullAt: string | null;
  lastCommitSha: string | null;
  lastCommitUrl: string | null;
  lastRemoteSha: string | null;
  lastSyncedSizeBytes: number | null;
  lastError: string | null;
  recentLogs: GitHubSyncLogDTO[];
}

interface GitHubDataStoragePanelProps {
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  onDataPulledFromGitHub?: () => Promise<void> | void;
}

export const GitHubDataStoragePanel: React.FC<GitHubDataStoragePanelProps> = ({
  onNotify,
  onDataPulledFromGitHub,
}) => {
  const [status, setStatus] = useState<GitHubStorageStatusDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [confirmPullOpen, setConfirmPullOpen] = useState(false);

  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [filePath, setFilePath] = useState('data/edutest_multitenant_db.json');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncDebounceSeconds, setSyncDebounceSeconds] = useState(4);
  const [loadError, setLoadError] = useState<string | null>(null);

  const buildAuthHeaders = (): Record<string, string> => {
    const { token } = getStoredSessionToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchStatus = useCallback(async (syncFormFields = false) => {
    setLoadError(null);
    try {
      const res = await fetch('/api/github-storage/status', {
        method: 'GET',
        headers: buildAuthHeaders(),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setLoadError(
          json?.message ||
            `Không thể tải trạng thái lưu trữ GitHub (HTTP ${res.status}). Vui lòng đăng nhập bằng tài khoản quản trị.`
        );
        return;
      }
      const st = json.status as GitHubStorageStatusDTO;
      setStatus(st);
      if (syncFormFields && st?.config) {
        setOwner(st.config.owner || '');
        setRepo(st.config.repo || '');
        setBranch(st.config.branch || 'main');
        setFilePath(st.config.filePath || 'data/edutest_multitenant_db.json');
        setAutoSyncEnabled(Boolean(st.config.autoSyncEnabled));
        setSyncDebounceSeconds(Math.max(2, Math.round((st.config.syncDebounceMs || 4000) / 1000)));
      }
    } catch {
      setLoadError('Không thể kết nối tới Backend API (/api/github-storage/status).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus(true);
  }, [fetchStatus]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Cho phép người dùng dán nhanh dạng "owner/repo" vào ô repo hoặc owner
      let nextOwner = owner.trim();
      let nextRepo = repo.trim();
      if (nextRepo.includes('/')) {
        const cleaned = nextRepo
          .replace(/^https?:\/\/github\.com\//i, '')
          .replace(/\.git$/i, '')
          .replace(/^\/+|\/+$/g, '');
        const parts = cleaned.split('/').filter(Boolean);
        if (parts.length === 2) {
          nextOwner = parts[0];
          nextRepo = parts[1];
          setOwner(nextOwner);
          setRepo(nextRepo);
        }
      }

      const res = await fetch('/api/github-storage/config', {
        method: 'PUT',
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          owner: nextOwner,
          repo: nextRepo,
          branch: branch.trim() || 'main',
          filePath: filePath.trim() || 'data/edutest_multitenant_db.json',
          autoSyncEnabled,
          syncDebounceMs: Math.max(2, Math.min(60, Number(syncDebounceSeconds) || 4)) * 1000,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        onNotify(
          'error',
          'Lưu cấu hình GitHub thất bại',
          json?.message || `Máy chủ trả về lỗi HTTP ${res.status}.`
        );
        return;
      }
      if (json.status) {
        setStatus(json.status as GitHubStorageStatusDTO);
      }
      onNotify(
        'success',
        'Đã lưu cấu hình kho lưu trữ GitHub',
        `Kho đích: ${nextOwner || '(chưa đặt)'}/${nextRepo || '(chưa đặt)'} @ ${branch.trim() || 'main'}`
      );
    } catch {
      onNotify('error', 'Lỗi kết nối', 'Không thể gửi cấu hình GitHub lên máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/github-storage/test-connection', {
        method: 'POST',
        headers: buildAuthHeaders(),
      });
      const json = await res.json().catch(() => null);
      if (json?.status) setStatus(json.status as GitHubStorageStatusDTO);
      if (res.ok && json?.ok) {
        onNotify('success', 'Kết nối GitHub thành công', json.message);
      } else {
        onNotify(
          'error',
          'Kiểm tra kết nối GitHub thất bại',
          json?.message || `Máy chủ trả về lỗi HTTP ${res.status}.`
        );
      }
    } catch {
      onNotify('error', 'Lỗi kết nối', 'Không thể kiểm tra kết nối tới GitHub.');
    } finally {
      setTesting(false);
    }
  };

  const handlePushNow = async () => {
    setPushing(true);
    try {
      // Đẩy toàn bộ dữ liệu câu hỏi/ma trận/đề thi mới nhất từ trình duyệt lên kho trung tâm trước khi commit lên GitHub
      await dataRepository.syncToCentralServerNow('GITHUB_MANUAL_PUSH');

      const res = await fetch('/api/github-storage/push', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ force: true, reason: 'MANUAL_ADMIN_PUSH' }),
      });
      const json = await res.json().catch(() => null);
      if (json?.status) setStatus(json.status as GitHubStorageStatusDTO);
      if (res.ok && json?.ok) {
        onNotify('success', 'Đã lưu trữ dữ liệu lên GitHub', json.message);
      } else {
        onNotify(
          'error',
          'Đồng bộ lên GitHub thất bại',
          json?.message || `Máy chủ trả về lỗi HTTP ${res.status}.`
        );
      }
    } catch {
      onNotify('error', 'Lỗi kết nối', 'Không thể thực hiện đẩy dữ liệu lên GitHub.');
    } finally {
      setPushing(false);
    }
  };

  const handleConfirmPull = async () => {
    setPulling(true);
    setConfirmPullOpen(false);
    try {
      const res = await fetch('/api/github-storage/pull', {
        method: 'POST',
        headers: buildAuthHeaders(),
      });
      const json = await res.json().catch(() => null);
      if (json?.status) setStatus(json.status as GitHubStorageStatusDTO);
      if (res.ok && json?.ok) {
        await dataRepository.initializeFromCentralServer();
        if (onDataPulledFromGitHub) {
          await onDataPulledFromGitHub();
        }
        onNotify('success', 'Đã khôi phục dữ liệu từ GitHub', json.message);
      } else {
        onNotify(
          'error',
          'Khôi phục dữ liệu từ GitHub thất bại',
          json?.message || `Máy chủ trả về lỗi HTTP ${res.status}.`
        );
      }
    } catch {
      onNotify('error', 'Lỗi kết nối', 'Không thể tải dữ liệu từ GitHub.');
    } finally {
      setPulling(false);
    }
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return 'Chưa có';
    try {
      return new Date(iso).toLocaleString('vi-VN');
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-700" />
            Lưu trữ & Đồng bộ Dữ liệu lên GitHub Repository
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Tự động sao lưu và khôi phục toàn bộ cơ sở dữ liệu (tài khoản, phân quyền, ngân hàng câu hỏi, ma trận, đề kiểm tra) dưới dạng tệp JSON trên kho GitHub của nhà trường.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchStatus(false)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loadError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Trạng thái khóa xác thực phía máy chủ (Tuyệt đối không nhập Token qua giao diện trình duyệt) */}
      <div
        className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          status?.tokenConfigured
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {status?.tokenConfigured ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold">
              {status?.tokenConfigured
                ? 'Khóa xác thực GITHUB_TOKEN đã sẵn sàng trên máy chủ'
                : 'Chưa khai báo biến môi trường GITHUB_TOKEN trên máy chủ'}
            </div>
            <p className="leading-relaxed opacity-90">
              {status?.tokenConfigured
                ? `${status.envSourceHint}. Token được giữ tuyệt đối ở máy chủ Backend và phiên đăng nhập người dùng luôn được tách bỏ trước khi đồng bộ lên GitHub.`
                : 'Để đảm bảo an toàn, không nhập GitHub Token trên trình duyệt. Hãy thêm biến môi trường GITHUB_TOKEN (Personal Access Token có quyền Contents: Read & Write) vào tệp .env hoặc mục Environment Variables trên hosting rồi khởi động lại ứng dụng.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form cấu hình thông số kho chứa không chứa bí mật */}
      <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tài khoản / Tổ chức GitHub (Owner)
          </label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Ví dụ: minhasminh"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên kho chứa (Repository)
          </label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="Ví dụ: dekiemtra hoặc minhasminh/dekiemtra"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nhánh lưu dữ liệu (Branch)
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Khuyến nghị tạo nhánh riêng như <code className="font-mono">data-storage</code> hoặc dùng nhánh <code className="font-mono">main</code> trên repo Private.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Đường dẫn tệp dữ liệu JSON
          </label>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="data/edutest_multitenant_db.json"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
        </div>

        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSyncEnabled}
              onChange={(e) => setAutoSyncEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">
                Tự động đồng bộ dữ liệu lên GitHub khi có thay đổi
              </div>
              <div className="text-[11px] text-slate-600">
                Tự động gom các thay đổi và commit về kho GitHub; khi máy chủ khởi động mới cũng tự động khôi phục từ GitHub.
              </div>
            </div>
          </label>

          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-medium text-slate-700">Độ trễ gom (giây):</label>
            <input
              type="number"
              min={2}
              max={60}
              value={syncDebounceSeconds}
              onChange={(e) => setSyncDebounceSeconds(Number(e.target.value))}
              className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono text-center bg-white"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình GitHub'}
          </button>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !status?.tokenConfigured}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </button>

          <button
            type="button"
            onClick={handlePushNow}
            disabled={pushing || !status?.readyForSync}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg cursor-pointer"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            {pushing ? 'Đang đẩy lên GitHub...' : 'Đẩy dữ liệu lên GitHub ngay'}
          </button>

          <button
            type="button"
            onClick={() => setConfirmPullOpen((prev) => !prev)}
            disabled={pulling || !status?.readyForSync}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 rounded-lg cursor-pointer"
          >
            <CloudDownload className="w-3.5 h-3.5" />
            {pulling ? 'Đang tải từ GitHub...' : 'Khôi phục dữ liệu từ GitHub'}
          </button>
        </div>
      </form>

      {confirmPullOpen && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-amber-950">
            <strong>Xác nhận khôi phục:</strong> Thao tác này sẽ tải tệp{' '}
            <code className="font-mono">{filePath}</code> từ GitHub và ghi đè lên cơ sở dữ liệu hiện tại của máy chủ (phiên đăng nhập hiện tại của bạn vẫn được giữ nguyên).
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmPullOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmPull}
              className="px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 cursor-pointer"
            >
              Xác nhận khôi phục
            </button>
          </div>
        </div>
      )}

      {/* Tóm tắt trạng thái đồng bộ gần nhất */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500">Lần đẩy lên GitHub gần nhất</div>
            <div className="font-semibold text-slate-900 mt-1">{formatTime(status.lastPushAt)}</div>
            {status.lastCommitSha && status.lastCommitUrl && (
              <a
                href={status.lastCommitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 hover:underline mt-1"
              >
                Commit {status.lastCommitSha.slice(0, 7)}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500">Lần khôi phục từ GitHub gần nhất</div>
            <div className="font-semibold text-slate-900 mt-1">{formatTime(status.lastPullAt)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Dung lượng bản lưu:{' '}
              {status.lastSyncedSizeBytes
                ? `${Math.max(1, Math.round(status.lastSyncedSizeBytes / 1024))} KB`
                : 'Chưa đo'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500">Trạng thái kết nối</div>
            <div
              className={`font-semibold mt-1 ${
                status.lastError
                  ? 'text-rose-700'
                  : status.readyForSync
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            >
              {status.lastError
                ? 'Có lỗi gần nhất'
                : status.readyForSync
                ? status.config.autoSyncEnabled
                  ? 'Sẵn sàng · Tự động đồng bộ'
                  : 'Sẵn sàng · Đồng bộ thủ công'
                : 'Chưa hoàn tất cấu hình'}
            </div>
            {status.lastError && (
              <div className="text-[11px] text-rose-700 mt-1 line-clamp-2">{status.lastError}</div>
            )}
          </div>
        </div>
      )}

      {/* Nhật ký đồng bộ GitHub gần đây */}
      {status && status.recentLogs.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-500" />
            Nhật ký đồng bộ GitHub gần nhất
          </div>
          <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {status.recentLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="px-3 py-2 text-xs flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'ERROR'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.direction} · {log.status}
                    </span>
                    <span className="text-slate-500 text-[11px]">{formatTime(log.timestamp)}</span>
                  </div>
                  <div className="text-slate-700">{log.message}</div>
                </div>
                {log.commitSha && log.commitUrl && (
                  <a
                    href={log.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-blue-700 hover:underline shrink-0"
                  >
                    {log.commitSha.slice(0, 7)}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
