import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface GitHubStorageConfig {
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

export interface GitHubSyncLogEntry {
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

export interface GitHubStorageStatusSnapshot {
  tokenConfigured: boolean;
  envSourceHint: string;
  config: GitHubStorageConfig;
  readyForSync: boolean;
  isSyncing: boolean;
  lastPushAt: string | null;
  lastPullAt: string | null;
  lastCommitSha: string | null;
  lastCommitUrl: string | null;
  lastRemoteSha: string | null;
  lastSyncedSizeBytes: number | null;
  lastError: string | null;
  recentLogs: GitHubSyncLogEntry[];
}

const GITHUB_API_ORIGIN = 'https://api.github.com';
const OWNER_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/;
const REPO_REGEX = /^[a-zA-Z0-9._-]{1,100}$/;
const BRANCH_REGEX = /^[a-zA-Z0-9._/-]{1,100}$/;
const JSON_FILE_PATH_REGEX = /^[a-zA-Z0-9._/-]{1,200}\.json$/;

export function parseGitHubOwnerAndRepo(raw: string): { owner: string; repo: string } | null {
  const cleaned = String(raw || '')
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length !== 2) return null;
  const [owner, repo] = parts;
  if (!OWNER_REGEX.test(owner) || !REPO_REGEX.test(repo)) return null;
  return { owner, repo };
}

export function validateGitHubStorageConfigInput(input: {
  owner?: string;
  repo?: string;
  branch?: string;
  filePath?: string;
  autoSyncEnabled?: boolean;
  syncDebounceMs?: number;
  commitAuthorName?: string;
  commitAuthorEmail?: string;
}): { ok: true; normalized: Partial<GitHubStorageConfig> } | { ok: false; message: string } {
  const normalized: Partial<GitHubStorageConfig> = {};

  if (input.owner !== undefined) {
    const owner = String(input.owner).trim();
    if (owner && !OWNER_REGEX.test(owner)) {
      return {
        ok: false,
        message: 'Tên tài khoản/tổ chức GitHub (owner) không hợp lệ. Chỉ dùng chữ cái, chữ số và dấu gạch ngang.',
      };
    }
    normalized.owner = owner;
  }

  if (input.repo !== undefined) {
    const repo = String(input.repo).trim().replace(/\.git$/i, '');
    if (repo && !REPO_REGEX.test(repo)) {
      return {
        ok: false,
        message: 'Tên kho chứa GitHub (repository) không hợp lệ.',
      };
    }
    normalized.repo = repo;
  }

  if (input.branch !== undefined) {
    const branch = String(input.branch).trim();
    if (
      !branch ||
      !BRANCH_REGEX.test(branch) ||
      branch.includes('..') ||
      branch.startsWith('/') ||
      branch.endsWith('/')
    ) {
      return {
        ok: false,
        message: 'Tên nhánh (branch) không hợp lệ (ví dụ: main hoặc data-backup).',
      };
    }
    normalized.branch = branch;
  }

  if (input.filePath !== undefined) {
    const filePath = String(input.filePath).trim().replace(/^\/+/, '');
    if (
      !filePath ||
      !JSON_FILE_PATH_REGEX.test(filePath) ||
      filePath.includes('..') ||
      filePath.includes('//')
    ) {
      return {
        ok: false,
        message:
          'Đường dẫn tệp dữ liệu phải là đường dẫn tương đối kết thúc bằng .json (ví dụ: data/edutest_multitenant_db.json).',
      };
    }
    normalized.filePath = filePath;
  }

  if (input.autoSyncEnabled !== undefined) {
    normalized.autoSyncEnabled = Boolean(input.autoSyncEnabled);
  }

  if (input.syncDebounceMs !== undefined) {
    const ms = Number(input.syncDebounceMs);
    if (!Number.isFinite(ms)) {
      return { ok: false, message: 'Thời gian gom đồng bộ không hợp lệ.' };
    }
    normalized.syncDebounceMs = Math.max(2000, Math.min(60000, Math.round(ms)));
  }

  if (input.commitAuthorName !== undefined) {
    const name = String(input.commitAuthorName).trim().slice(0, 80);
    if (name) normalized.commitAuthorName = name;
  }

  if (input.commitAuthorEmail !== undefined) {
    const email = String(input.commitAuthorEmail).trim().slice(0, 120);
    if (email && email.includes('@')) normalized.commitAuthorEmail = email;
  }

  return { ok: true, normalized };
}

function encodeRepoPathSegments(filePath: string): string {
  return filePath
    .split('/')
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

function sanitizeDbForGitHubSnapshot<T extends Record<string, unknown>>(
  dbData: T,
  meta: { syncedBy: string; reason: string }
): { serialized: string; contentHash: string; sizeBytes: number } {
  // Loại bỏ persistedAuthSessions để tuyệt đối không đẩy session token đang hoạt động lên GitHub
  const clone: Record<string, unknown> = { ...dbData };
  delete clone.persistedAuthSessions;

  const coreSerialized = JSON.stringify(clone);
  const contentHash = crypto.createHash('sha256').update(coreSerialized, 'utf8').digest('hex');

  const payloadWithMeta = {
    ...clone,
    _githubSyncMeta: {
      schemaVersion: 1,
      appName: 'EDU TEST AI',
      syncedAt: new Date().toISOString(),
      syncedBy: meta.syncedBy,
      reason: meta.reason,
      contentSha256: contentHash,
    },
  };

  const serialized = JSON.stringify(payloadWithMeta, null, 2);
  return {
    serialized,
    contentHash,
    sizeBytes: Buffer.byteLength(serialized, 'utf8'),
  };
}

export function createGitHubDataStorageEngine(uploadDir: string) {
  const configFilePath = path.join(uploadDir, 'github_storage_config.json');

  function getServerToken(): { token: string; source: string } {
    const primary = String(process.env.GITHUB_TOKEN || '').trim();
    if (primary) return { token: primary, source: 'GITHUB_TOKEN' };
    const fallback = String(process.env.GH_TOKEN || '').trim();
    if (fallback) return { token: fallback, source: 'GH_TOKEN' };
    return { token: '', source: 'NOT_SET' };
  }

  function buildDefaultConfigFromEnv(): GitHubStorageConfig {
    let owner = String(process.env.GITHUB_DATA_OWNER || '').trim();
    let repo = String(process.env.GITHUB_DATA_REPO || '').trim();

    if (repo.includes('/')) {
      const parsed = parseGitHubOwnerAndRepo(repo);
      if (parsed) {
        owner = owner || parsed.owner;
        repo = parsed.repo;
      }
    }

    const branch = String(process.env.GITHUB_DATA_BRANCH || 'main').trim() || 'main';
    const filePath =
      String(process.env.GITHUB_DATA_PATH || 'data/edutest_multitenant_db.json')
        .trim()
        .replace(/^\/+/, '') || 'data/edutest_multitenant_db.json';

    const hasToken = Boolean(getServerToken().token);
    const envAutoSyncRaw = String(process.env.GITHUB_DATA_AUTOSYNC || '').trim().toLowerCase();
    const autoSyncEnabled =
      envAutoSyncRaw === 'true'
        ? true
        : envAutoSyncRaw === 'false'
        ? false
        : Boolean(hasToken && owner && repo);

    return {
      owner,
      repo,
      branch,
      filePath,
      autoSyncEnabled,
      syncDebounceMs: 4000,
      commitAuthorName: 'EDU TEST AI Bot',
      commitAuthorEmail: 'edutest-bot@users.noreply.github.com',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Hệ thống (ENV)',
    };
  }

  function loadConfig(): GitHubStorageConfig {
    const envDefaults = buildDefaultConfigFromEnv();
    try {
      if (fs.existsSync(configFilePath)) {
        const raw = fs.readFileSync(configFilePath, 'utf8');
        const parsed = JSON.parse(raw) as Partial<GitHubStorageConfig>;
        return {
          owner: String(parsed.owner || envDefaults.owner || '').trim(),
          repo: String(parsed.repo || envDefaults.repo || '').trim(),
          branch: String(parsed.branch || envDefaults.branch || 'main').trim(),
          filePath: String(
            parsed.filePath || envDefaults.filePath || 'data/edutest_multitenant_db.json'
          )
            .trim()
            .replace(/^\/+/, ''),
          autoSyncEnabled:
            typeof parsed.autoSyncEnabled === 'boolean'
              ? parsed.autoSyncEnabled
              : envDefaults.autoSyncEnabled,
          syncDebounceMs:
            typeof parsed.syncDebounceMs === 'number' && Number.isFinite(parsed.syncDebounceMs)
              ? Math.max(2000, Math.min(60000, Math.round(parsed.syncDebounceMs)))
              : envDefaults.syncDebounceMs,
          commitAuthorName: String(parsed.commitAuthorName || envDefaults.commitAuthorName).trim(),
          commitAuthorEmail: String(
            parsed.commitAuthorEmail || envDefaults.commitAuthorEmail
          ).trim(),
          updatedAt: String(parsed.updatedAt || envDefaults.updatedAt),
          updatedBy: String(parsed.updatedBy || envDefaults.updatedBy),
        };
      }
    } catch (err) {
      console.warn('Warning reading github_storage_config.json:', err);
    }
    return envDefaults;
  }

  function persistConfig(next: GitHubStorageConfig): void {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const safeToStore: GitHubStorageConfig = {
        owner: next.owner,
        repo: next.repo,
        branch: next.branch,
        filePath: next.filePath,
        autoSyncEnabled: next.autoSyncEnabled,
        syncDebounceMs: next.syncDebounceMs,
        commitAuthorName: next.commitAuthorName,
        commitAuthorEmail: next.commitAuthorEmail,
        updatedAt: next.updatedAt,
        updatedBy: next.updatedBy,
      };
      fs.writeFileSync(configFilePath, JSON.stringify(safeToStore, null, 2), 'utf8');
    } catch (err) {
      console.warn('Warning saving github_storage_config.json:', err);
    }
  }

  let currentConfig = loadConfig();
  let isSyncing = false;
  let lastPushAt: string | null = null;
  let lastPullAt: string | null = null;
  let lastCommitSha: string | null = null;
  let lastCommitUrl: string | null = null;
  let lastRemoteSha: string | null = null;
  let lastSyncedContentHash: string | null = null;
  let lastSyncedSizeBytes: number | null = null;
  let lastError: string | null = null;
  const recentLogs: GitHubSyncLogEntry[] = [];

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingAutoPush = false;
  let pendingReason = 'AUTO_SYNC';
  let latestSnapshotGetter: (() => Record<string, unknown>) | null = null;

  function appendLog(entry: Omit<GitHubSyncLogEntry, 'id' | 'timestamp'>) {
    recentLogs.unshift({
      id: `ghlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
    if (recentLogs.length > 15) {
      recentLogs.length = 15;
    }
  }

  function buildHeaders(token: string): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'EDU-TEST-AI-Storage-Sync/1.0',
      'Content-Type': 'application/json',
    };
  }

  async function githubApiFetch(
    apiPath: string,
    init: RequestInit & { timeoutMs?: number } = {}
  ): Promise<Response> {
    const { token } = getServerToken();
    if (!token) {
      throw new Error(
        'Chưa cấu hình biến môi trường GITHUB_TOKEN trên máy chủ. Hãy thêm GITHUB_TOKEN trong cấu hình Environment Variables của hosting hoặc tệp .env.'
      );
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), init.timeoutMs || 20000);
    try {
      const targetUrl = `${GITHUB_API_ORIGIN}${apiPath.startsWith('/') ? apiPath : `/${apiPath}`}`;
      return await fetch(targetUrl, {
        ...init,
        headers: {
          ...buildHeaders(token),
          ...(init.headers || {}),
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function isConfigComplete(cfg: GitHubStorageConfig): boolean {
    return Boolean(
      cfg.owner &&
        OWNER_REGEX.test(cfg.owner) &&
        cfg.repo &&
        REPO_REGEX.test(cfg.repo) &&
        cfg.branch &&
        BRANCH_REGEX.test(cfg.branch) &&
        cfg.filePath &&
        JSON_FILE_PATH_REGEX.test(cfg.filePath)
    );
  }

  async function fetchRemoteFileMetadata(cfg: GitHubStorageConfig): Promise<{
    exists: boolean;
    sha?: string;
    size?: number;
    content?: string;
    encoding?: string;
    htmlUrl?: string;
  }> {
    const encodedPath = encodeRepoPathSegments(cfg.filePath);
    const apiPath = `/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(
      cfg.repo
    )}/contents/${encodedPath}?ref=${encodeURIComponent(cfg.branch)}`;

    const res = await githubApiFetch(apiPath, { method: 'GET' });
    if (res.status === 404) {
      return { exists: false };
    }
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`GitHub API trả về HTTP ${res.status}: ${errBody.slice(0, 220)}`);
    }
    const data = (await res.json()) as {
      type?: string;
      sha?: string;
      size?: number;
      content?: string;
      encoding?: string;
      html_url?: string;
    };
    if (data.type && data.type !== 'file') {
      throw new Error(`Đường dẫn "${cfg.filePath}" trên GitHub không phải là tệp tin.`);
    }
    return {
      exists: true,
      sha: data.sha,
      size: data.size,
      content: data.content,
      encoding: data.encoding,
      htmlUrl: data.html_url,
    };
  }

  async function testConnection(actorName = 'Quản trị viên'): Promise<{
    ok: boolean;
    message: string;
    repoFullName?: string;
    isPrivate?: boolean;
    canPush?: boolean;
    branchExists?: boolean;
    dataFileExists?: boolean;
    dataFileSizeBytes?: number;
    dataFileHtmlUrl?: string;
  }> {
    const { token } = getServerToken();
    if (!token) {
      const msg =
        'Chưa tìm thấy biến môi trường GITHUB_TOKEN trên máy chủ. Hãy khai báo GITHUB_TOKEN (Personal Access Token có quyền Contents: Read & Write) trên hosting hoặc tệp .env.';
      lastError = msg;
      appendLog({ direction: 'TEST', status: 'ERROR', reason: 'TEST_CONNECTION', actorName, message: msg });
      return { ok: false, message: msg };
    }

    if (!isConfigComplete(currentConfig)) {
      const msg =
        'Chưa cấu hình đầy đủ Owner, Repository, Branch hoặc Đường dẫn tệp JSON trên GitHub.';
      lastError = msg;
      appendLog({ direction: 'TEST', status: 'ERROR', reason: 'TEST_CONNECTION', actorName, message: msg });
      return { ok: false, message: msg };
    }

    try {
      const repoRes = await githubApiFetch(
        `/repos/${encodeURIComponent(currentConfig.owner)}/${encodeURIComponent(currentConfig.repo)}`,
        { method: 'GET' }
      );
      if (!repoRes.ok) {
        const errText = await repoRes.text().catch(() => '');
        const msg =
          repoRes.status === 404
            ? `Không tìm thấy kho chứa ${currentConfig.owner}/${currentConfig.repo} hoặc GITHUB_TOKEN không có quyền truy cập kho này.`
            : repoRes.status === 401
            ? 'GITHUB_TOKEN không hợp lệ hoặc đã hết hạn.'
            : `Lỗi kết nối GitHub (HTTP ${repoRes.status}): ${errText.slice(0, 180)}`;
        lastError = msg;
        appendLog({ direction: 'TEST', status: 'ERROR', reason: 'TEST_CONNECTION', actorName, message: msg });
        return { ok: false, message: msg };
      }

      const repoJson = (await repoRes.json()) as {
        full_name?: string;
        private?: boolean;
        permissions?: { push?: boolean; admin?: boolean };
      };

      const canPush = repoJson.permissions ? Boolean(repoJson.permissions.push || repoJson.permissions.admin) : true;

      const branchRes = await githubApiFetch(
        `/repos/${encodeURIComponent(currentConfig.owner)}/${encodeURIComponent(
          currentConfig.repo
        )}/branches/${encodeURIComponent(currentConfig.branch)}`,
        { method: 'GET' }
      );
      const branchExists = branchRes.ok;

      let dataFileExists = false;
      let dataFileSizeBytes = 0;
      let dataFileHtmlUrl: string | undefined;
      if (branchExists) {
        const fileMeta = await fetchRemoteFileMetadata(currentConfig);
        dataFileExists = fileMeta.exists;
        dataFileSizeBytes = fileMeta.size || 0;
        dataFileHtmlUrl = fileMeta.htmlUrl;
        if (fileMeta.sha) {
          lastRemoteSha = fileMeta.sha;
        }
      }

      if (!branchExists) {
        const msg = `Đã kết nối tới kho ${repoJson.full_name}, nhưng nhánh "${currentConfig.branch}" chưa tồn tại.`;
        lastError = msg;
        appendLog({ direction: 'TEST', status: 'ERROR', reason: 'TEST_CONNECTION', actorName, message: msg });
        return {
          ok: false,
          message: msg,
          repoFullName: repoJson.full_name,
          isPrivate: Boolean(repoJson.private),
          canPush,
          branchExists: false,
        };
      }

      if (!canPush) {
        const msg = `GITHUB_TOKEN chỉ có quyền đọc tại kho ${repoJson.full_name}. Cần cấp quyền ghi (repo hoặc Contents: Read and write) để lưu trữ dữ liệu.`;
        lastError = msg;
        appendLog({ direction: 'TEST', status: 'ERROR', reason: 'TEST_CONNECTION', actorName, message: msg });
        return {
          ok: false,
          message: msg,
          repoFullName: repoJson.full_name,
          isPrivate: Boolean(repoJson.private),
          canPush: false,
          branchExists: true,
        };
      }

      lastError = null;
      const okMsg = dataFileExists
        ? `Kết nối thành công tới ${repoJson.full_name} (nhánh ${currentConfig.branch}). Tệp dữ liệu "${currentConfig.filePath}" đã tồn tại (${Math.round(
            dataFileSizeBytes / 1024
          )} KB).`
        : `Kết nối thành công tới ${repoJson.full_name} (nhánh ${currentConfig.branch}). Tệp "${currentConfig.filePath}" sẽ được tự động tạo ở lần đồng bộ đầu tiên.`;
      appendLog({
        direction: 'TEST',
        status: 'SUCCESS',
        reason: 'TEST_CONNECTION',
        actorName,
        sizeBytes: dataFileSizeBytes,
        message: okMsg,
      });

      return {
        ok: true,
        message: okMsg,
        repoFullName: repoJson.full_name,
        isPrivate: Boolean(repoJson.private),
        canPush: true,
        branchExists: true,
        dataFileExists,
        dataFileSizeBytes,
        dataFileHtmlUrl,
      };
    } catch (err) {
      const msg =
        err instanceof Error
          ? `Không thể kết nối tới GitHub API: ${err.message}`
          : 'Không thể kết nối tới GitHub API.';
      lastError = msg;
      appendLog({ direction: 'TEST', status: 'ERROR', reason: 'TEST_CONNECTION', actorName, message: msg });
      return { ok: false, message: msg };
    }
  }

  async function pushSnapshot(
    dbData: Record<string, unknown>,
    options: { reason?: string; actorName?: string; force?: boolean } = {}
  ): Promise<{
    ok: boolean;
    skipped?: boolean;
    message: string;
    commitSha?: string;
    commitUrl?: string;
    sizeBytes?: number;
  }> {
    const reason = options.reason || 'MANUAL_PUSH';
    const actorName = options.actorName || 'Hệ thống EDU TEST AI';
    const { token } = getServerToken();

    if (!token) {
      const msg = 'Chưa cấu hình biến môi trường GITHUB_TOKEN trên máy chủ.';
      lastError = msg;
      return { ok: false, message: msg };
    }
    if (!isConfigComplete(currentConfig)) {
      const msg = 'Chưa cấu hình đầy đủ thông tin kho GitHub (owner/repo/branch/filePath).';
      lastError = msg;
      return { ok: false, message: msg };
    }

    const { serialized, contentHash, sizeBytes } = sanitizeDbForGitHubSnapshot(dbData, {
      syncedBy: actorName,
      reason,
    });

    if (!options.force && lastSyncedContentHash && lastSyncedContentHash === contentHash) {
      return {
        ok: true,
        skipped: true,
        message: 'Dữ liệu không thay đổi so với bản đã đồng bộ gần nhất trên GitHub.',
        commitSha: lastCommitSha || undefined,
        commitUrl: lastCommitUrl || undefined,
        sizeBytes,
      };
    }

    if (isSyncing) {
      return {
        ok: false,
        message: 'Đang có một tiến trình đồng bộ GitHub khác chạy. Vui lòng chờ vài giây và thử lại.',
      };
    }

    isSyncing = true;
    try {
      const encodedPath = encodeRepoPathSegments(currentConfig.filePath);
      const putPath = `/repos/${encodeURIComponent(currentConfig.owner)}/${encodeURIComponent(
        currentConfig.repo
      )}/contents/${encodedPath}`;
      const base64Content = Buffer.from(serialized, 'utf8').toString('base64');

      const performPut = async (existingSha?: string) => {
        const bodyPayload: Record<string, unknown> = {
          message: `[EDU TEST AI] Đồng bộ dữ liệu (${reason})`,
          content: base64Content,
          branch: currentConfig.branch,
          committer: {
            name: currentConfig.commitAuthorName || 'EDU TEST AI Bot',
            email: currentConfig.commitAuthorEmail || 'edutest-bot@users.noreply.github.com',
          },
        };
        if (existingSha) {
          bodyPayload.sha = existingSha;
        }
        return githubApiFetch(putPath, {
          method: 'PUT',
          body: JSON.stringify(bodyPayload),
          timeoutMs: 30000,
        });
      };

      const existingMeta = await fetchRemoteFileMetadata(currentConfig);
      let putRes = await performPut(existingMeta.exists ? existingMeta.sha : undefined);

      // Nếu gặp xung đột SHA (HTTP 409), tự động lấy lại SHA mới nhất và thử ghi lại 1 lần
      if (putRes.status === 409) {
        const refreshedMeta = await fetchRemoteFileMetadata(currentConfig);
        putRes = await performPut(refreshedMeta.exists ? refreshedMeta.sha : undefined);
      }

      if (!putRes.ok) {
        const errBody = await putRes.text().catch(() => '');
        throw new Error(`GitHub từ chối lưu tệp (HTTP ${putRes.status}): ${errBody.slice(0, 220)}`);
      }

      const resultJson = (await putRes.json()) as {
        content?: { sha?: string; html_url?: string };
        commit?: { sha?: string; html_url?: string };
      };

      lastPushAt = new Date().toISOString();
      lastRemoteSha = resultJson.content?.sha || lastRemoteSha;
      lastCommitSha = resultJson.commit?.sha || null;
      lastCommitUrl = resultJson.commit?.html_url || resultJson.content?.html_url || null;
      lastSyncedContentHash = contentHash;
      lastSyncedSizeBytes = sizeBytes;
      lastError = null;

      const msg = `Đã lưu dữ liệu thành công lên GitHub (${currentConfig.owner}/${currentConfig.repo}@${currentConfig.branch}:${currentConfig.filePath}).`;
      appendLog({
        direction: 'PUSH',
        status: 'SUCCESS',
        reason,
        actorName,
        commitSha: lastCommitSha || undefined,
        commitUrl: lastCommitUrl || undefined,
        sizeBytes,
        message: msg,
      });

      return {
        ok: true,
        message: msg,
        commitSha: lastCommitSha || undefined,
        commitUrl: lastCommitUrl || undefined,
        sizeBytes,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi đẩy dữ liệu lên GitHub.';
      lastError = msg;
      appendLog({
        direction: 'PUSH',
        status: 'ERROR',
        reason,
        actorName,
        sizeBytes,
        message: msg,
      });
      return { ok: false, message: msg };
    } finally {
      isSyncing = false;
      if (pendingAutoPush && latestSnapshotGetter && currentConfig.autoSyncEnabled) {
        pendingAutoPush = false;
        const getter = latestSnapshotGetter;
        const nextReason = pendingReason;
        setTimeout(() => {
          void pushSnapshot(getter(), { reason: nextReason, actorName: 'Tự động đồng bộ' });
        }, 1500);
      }
    }
  }

  async function pullSnapshot(actorName = 'Quản trị viên'): Promise<{
    ok: boolean;
    notFound?: boolean;
    message: string;
    data?: Record<string, unknown>;
    remoteSha?: string;
    sizeBytes?: number;
    syncedAt?: string | null;
  }> {
    const { token } = getServerToken();
    if (!token) {
      const msg = 'Chưa cấu hình biến môi trường GITHUB_TOKEN trên máy chủ.';
      lastError = msg;
      return { ok: false, message: msg };
    }
    if (!isConfigComplete(currentConfig)) {
      const msg = 'Chưa cấu hình đầy đủ thông tin kho GitHub (owner/repo/branch/filePath).';
      lastError = msg;
      return { ok: false, message: msg };
    }

    try {
      const meta = await fetchRemoteFileMetadata(currentConfig);
      if (!meta.exists || !meta.sha) {
        return {
          ok: false,
          notFound: true,
          message: `Chưa có tệp dữ liệu "${currentConfig.filePath}" trên nhánh ${currentConfig.branch} của kho ${currentConfig.owner}/${currentConfig.repo}.`,
        };
      }

      let rawJsonText = '';
      if (meta.content && meta.encoding === 'base64') {
        rawJsonText = Buffer.from(meta.content.replace(/\n/g, ''), 'base64').toString('utf8');
      } else {
        // Hỗ trợ tệp lớn > 1MB thông qua Git Blobs API (tối đa 100MB)
        const blobRes = await githubApiFetch(
          `/repos/${encodeURIComponent(currentConfig.owner)}/${encodeURIComponent(
            currentConfig.repo
          )}/git/blobs/${encodeURIComponent(meta.sha)}`,
          { method: 'GET', timeoutMs: 30000 }
        );
        if (!blobRes.ok) {
          const errBody = await blobRes.text().catch(() => '');
          throw new Error(`Không thể tải Git Blob từ GitHub (HTTP ${blobRes.status}): ${errBody.slice(0, 180)}`);
        }
        const blobJson = (await blobRes.json()) as { content?: string; encoding?: string };
        if (!blobJson.content) {
          throw new Error('Nội dung tệp dữ liệu từ GitHub Blob bị rỗng.');
        }
        rawJsonText = Buffer.from(blobJson.content.replace(/\n/g, ''), 'base64').toString('utf8');
      }

      const parsed = JSON.parse(rawJsonText) as Record<string, unknown>;
      const collections = parsed?.collections as Record<string, unknown> | undefined;
      if (!parsed || !collections || !Array.isArray(collections.Schools)) {
        throw new Error(
          'Tệp JSON trên GitHub không đúng cấu trúc dữ liệu EDU TEST AI (thiếu collections.Schools).'
        );
      }

      // Bảo đảm không nạp session token từ tệp từ xa
      delete parsed.persistedAuthSessions;

      const syncMeta = parsed._githubSyncMeta as { syncedAt?: string; contentSha256?: string } | undefined;
      const sizeBytes = Buffer.byteLength(rawJsonText, 'utf8');

      lastPullAt = new Date().toISOString();
      lastRemoteSha = meta.sha;
      lastSyncedSizeBytes = sizeBytes;
      if (syncMeta?.contentSha256) {
        lastSyncedContentHash = syncMeta.contentSha256;
      }
      lastError = null;

      const msg = `Đã tải dữ liệu thành công từ GitHub (${currentConfig.owner}/${currentConfig.repo}@${currentConfig.branch}:${currentConfig.filePath}, ${Math.round(
        sizeBytes / 1024
      )} KB).`;
      appendLog({
        direction: 'PULL',
        status: 'SUCCESS',
        reason: 'PULL_FROM_GITHUB',
        actorName,
        commitSha: meta.sha,
        commitUrl: meta.htmlUrl,
        sizeBytes,
        message: msg,
      });

      return {
        ok: true,
        message: msg,
        data: parsed,
        remoteSha: meta.sha,
        sizeBytes,
        syncedAt: syncMeta?.syncedAt || null,
      };
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Lỗi không xác định khi tải dữ liệu từ GitHub.';
      lastError = msg;
      appendLog({
        direction: 'PULL',
        status: 'ERROR',
        reason: 'PULL_FROM_GITHUB',
        actorName,
        message: msg,
      });
      return { ok: false, message: msg };
    }
  }

  function scheduleAutoPush(getSnapshot: () => Record<string, unknown>, reason = 'AUTO_SYNC'): void {
    const { token } = getServerToken();
    if (!token || !currentConfig.autoSyncEnabled || !isConfigComplete(currentConfig)) {
      return;
    }
    latestSnapshotGetter = getSnapshot;
    pendingReason = reason;

    if (isSyncing) {
      pendingAutoPush = true;
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (!latestSnapshotGetter || !currentConfig.autoSyncEnabled) return;
      void pushSnapshot(latestSnapshotGetter(), {
        reason: pendingReason,
        actorName: 'Tự động đồng bộ GitHub',
      });
    }, currentConfig.syncDebounceMs);
  }

  function updateConfig(
    updates: Partial<GitHubStorageConfig>,
    actorName: string
  ): { ok: true; config: GitHubStorageConfig } | { ok: false; message: string } {
    const validation = validateGitHubStorageConfigInput(updates);
    if (!validation.ok) {
      return { ok: false, message: validation.message };
    }
    currentConfig = {
      ...currentConfig,
      ...validation.normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName,
    };
    persistConfig(currentConfig);
    return { ok: true, config: currentConfig };
  }

  function getStatus(): GitHubStorageStatusSnapshot {
    const { token, source } = getServerToken();
    return {
      tokenConfigured: Boolean(token),
      envSourceHint: token ? `Đã cấu hình trên máy chủ (${source})` : 'Chưa thiết lập GITHUB_TOKEN trong .env / Hosting',
      config: { ...currentConfig },
      readyForSync: Boolean(token && isConfigComplete(currentConfig)),
      isSyncing,
      lastPushAt,
      lastPullAt,
      lastCommitSha,
      lastCommitUrl,
      lastRemoteSha,
      lastSyncedSizeBytes,
      lastError,
      recentLogs: [...recentLogs],
    };
  }

  return {
    getStatus,
    updateConfig,
    testConnection,
    pushSnapshot,
    pullSnapshot,
    scheduleAutoPush,
    isAutoSyncReady: () =>
      Boolean(getServerToken().token && currentConfig.autoSyncEnabled && isConfigComplete(currentConfig)),
  };
}
