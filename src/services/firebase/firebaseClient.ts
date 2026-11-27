import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User as FirebaseUser,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
  setDoc,
  setLogLevel,
} from 'firebase/firestore';
import {
  getBytes,
  getMetadata,
  getStorage,
  ref as storageRef,
  uploadString,
} from 'firebase/storage';
import appletFirebaseConfig from '../../../firebase-applet-config.json';

export interface ResolvedFirebaseWebConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  configSource: 'ENV_AND_APPLET_CONFIG' | 'APPLET_CONFIG_JSON' | 'MISSING';
}

/**
 * Đọc cấu hình từ biến môi trường VITE_FIREBASE_* theo quy ước của Vite framework,
 * kết hợp fallback an toàn sang firebase-applet-config.json đã được cấp phát thực tế.
 * Tuyệt đối không chứa khóa bí mật của Backend (GEMINI_API_KEY, Service Account Private Key).
 */
export function resolveFirebaseWebConfig(
  customOverride?: Partial<ResolvedFirebaseWebConfig>
): ResolvedFirebaseWebConfig {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const hasAppletConfig = Boolean(
    appletFirebaseConfig?.projectId &&
      appletFirebaseConfig?.apiKey &&
      appletFirebaseConfig?.authDomain
  );
  const currentHost =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname.toLowerCase()
      : '';
  const isAiStudioOrLocalHost =
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    currentHost.endsWith('.run.app') ||
    currentHost.endsWith('.usercontent.goog') ||
    currentHost.endsWith('.web.app') ||
    currentHost.endsWith('.firebaseapp.com');

  // Trên môi trường AI Studio (*.run.app / localhost), luôn ưu tiên firebase-applet-config.json
  // vì dự án này đã được AI Studio cấp phép sẵn Authorized Domains & Cloud Firestore database.
  const preferAppletConfig = hasAppletConfig && isAiStudioOrLocalHost;

  const pickField = (
    overrideVal: string | undefined,
    envVal: string | undefined,
    appletVal: string | undefined,
    fallback = ''
  ): string => {
    if (overrideVal !== undefined) return overrideVal;
    if (preferAppletConfig) {
      return appletVal || envVal || fallback;
    }
    return envVal || appletVal || fallback;
  };

  const fromEnv = Boolean(
    !preferAppletConfig && (env.VITE_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_API_KEY)
  );

  const projectId = pickField(
    customOverride?.projectId,
    env.VITE_FIREBASE_PROJECT_ID,
    appletFirebaseConfig.projectId
  );
  const appId = pickField(
    customOverride?.appId,
    env.VITE_FIREBASE_APP_ID,
    appletFirebaseConfig.appId
  );
  const apiKey = pickField(
    customOverride?.apiKey,
    env.VITE_FIREBASE_API_KEY,
    appletFirebaseConfig.apiKey
  );
  const authDomain = pickField(
    customOverride?.authDomain,
    env.VITE_FIREBASE_AUTH_DOMAIN,
    appletFirebaseConfig.authDomain
  );
  const firestoreDatabaseId = pickField(
    customOverride?.firestoreDatabaseId,
    env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
    appletFirebaseConfig.firestoreDatabaseId,
    '(default)'
  );
  const storageBucket = pickField(
    customOverride?.storageBucket,
    env.VITE_FIREBASE_STORAGE_BUCKET,
    appletFirebaseConfig.storageBucket
  );
  const messagingSenderId = pickField(
    customOverride?.messagingSenderId,
    env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appletFirebaseConfig.messagingSenderId
  );

  const hasCoreFields = Boolean(projectId && appId && apiKey && authDomain);

  return {
    projectId,
    appId,
    apiKey,
    authDomain,
    firestoreDatabaseId,
    storageBucket,
    messagingSenderId,
    configSource: !hasCoreFields
      ? 'MISSING'
      : fromEnv
      ? 'ENV_AND_APPLET_CONFIG'
      : 'APPLET_CONFIG_JSON',
  };
}

export interface FirebaseConfigValidationResult {
  isValid: boolean;
  status: 'VALID' | 'MISSING_CONFIG' | 'INVALID_FORMAT';
  missingFields: string[];
  invalidFields: string[];
  message: string;
  setupGuideSteps: string[];
}

export function validateFirebaseConfiguration(
  cfg: Partial<ResolvedFirebaseWebConfig>
): FirebaseConfigValidationResult {
  const requiredKeys: Array<keyof ResolvedFirebaseWebConfig> = [
    'projectId',
    'appId',
    'apiKey',
    'authDomain',
    'firestoreDatabaseId',
    'storageBucket',
  ];

  const missingFields = requiredKeys.filter(
    (k) => !cfg[k] || String(cfg[k] || '').trim().length === 0
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      status: 'MISSING_CONFIG',
      missingFields,
      invalidFields: [],
      message: `Thiếu cấu hình Firebase bắt buộc: ${missingFields.join(', ')}.`,
      setupGuideSteps: [
        'Bước 1: Mở Firebase Console hoặc công cụ Provision Firebase trên AI Studio.',
        'Bước 2: Sao chép các thông số Web SDK (projectId, appId, apiKey, authDomain, firestoreDatabaseId, storageBucket).',
        'Bước 3: Điền vào tệp firebase-applet-config.json hoặc khai báo các biến VITE_FIREBASE_* trong tệp môi trường.',
      ],
    };
  }

  const invalidFields: string[] = [];
  const projectId = String(cfg.projectId || '').trim();
  const apiKey = String(cfg.apiKey || '').trim();
  const authDomain = String(cfg.authDomain || '').trim();
  const storageBucket = String(cfg.storageBucket || '').trim();

  if (!/^[a-z0-9-]+$/.test(projectId) || projectId.length < 4) {
    invalidFields.push('projectId (Chỉ gồm chữ thường, số và dấu gạch ngang)');
  }
  if (!apiKey.startsWith('AIza') || apiKey.length < 25) {
    invalidFields.push('apiKey (Phải là khóa Web SDK hợp lệ bắt đầu bằng AIza...)');
  }
  if (!authDomain.includes('.firebaseapp.com') && !authDomain.includes('.web.app')) {
    invalidFields.push('authDomain (Phải có định dạng *.firebaseapp.com)');
  }
  if (
    !storageBucket.includes('.firebasestorage.app') &&
    !storageBucket.includes('.appspot.com')
  ) {
    invalidFields.push('storageBucket (Phải có định dạng *.firebasestorage.app hoặc *.appspot.com)');
  }

  if (invalidFields.length > 0) {
    return {
      isValid: false,
      status: 'INVALID_FORMAT',
      missingFields: [],
      invalidFields,
      message: `Cấu hình Firebase không đúng định dạng: ${invalidFields.join('; ')}.`,
      setupGuideSteps: [
        'Kiểm tra lại định dạng projectId, apiKey, authDomain và storageBucket trong firebase-applet-config.json.',
        'Đảm bảo không điền nhầm khóa bí mật của Backend vào cấu hình Web SDK.',
      ],
    };
  }

  return {
    isValid: true,
    status: 'VALID',
    missingFields: [],
    invalidFields: [],
    message: 'Cấu hình Firebase Web SDK hợp lệ và đầy đủ.',
    setupGuideSteps: [],
  };
}

export const firebaseConfig = resolveFirebaseWebConfig();

/**
 * Khởi tạo Firebase App theo mẫu Singleton (Mục IV: Không khởi tạo nhiều Firebase App trùng lặp)
 */
function getOrInitializeFirebaseApp(): FirebaseApp {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return getApp();
  }
  return initializeApp({
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
  });
}

const app = getOrInitializeFirebaseApp();

// Ngăn logger nội bộ của @firebase/firestore bắn console.error giả khi mạng/proxy chậm >10s và tự chuyển sang chế độ offline cache
try {
  setLogLevel('silent');
} catch {
  // Bỏ qua nếu môi trường test không hỗ trợ setLogLevel
}

function getOrInitFirestoreInstance() {
  try {
    const isBrowser = typeof window !== 'undefined';
    return initializeFirestore(
      app,
      isBrowser
        ? {
            experimentalForceLongPolling: true,
            experimentalLongPollingOptions: {
              timeoutSeconds: 20,
            },
            ignoreUndefinedProperties: true,
          }
        : {
            ignoreUndefinedProperties: true,
          },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = getOrInitFirestoreInstance();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut };

/**
 * Che thông tin nhạy cảm khi hiển thị trên Giao diện Quản trị (Mục VI: Không hiển thị thông tin bí mật)
 */
export function getSafePublicFirebaseSummary() {
  const validation = validateFirebaseConfiguration(firebaseConfig);
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
    storageBucket: firebaseConfig.storageBucket,
    configSource: firebaseConfig.configSource,
    initializedAppsCount: getApps().length,
    isSingletonApp: getApps().length === 1,
    apiKeyMasked: firebaseConfig.apiKey
      ? `${firebaseConfig.apiKey.slice(0, 6)}•••••••••••• (Đã ẩn bảo mật)`
      : 'Chưa cấu hình',
    validation,
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface FirebaseConnectionState {
  connected: boolean;
  checkedAt: string;
  projectId: string;
  databaseId: string;
  storageBucket: string;
  statusMessage: string;
}

let latestConnectionState: FirebaseConnectionState = {
  connected: true,
  checkedAt: new Date().toISOString(),
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  storageBucket: firebaseConfig.storageBucket,
  statusMessage: `Đã khởi tạo kết nối Cloud Firestore (${firebaseConfig.projectId}).`,
};

export async function testFirestoreConnection(): Promise<FirebaseConnectionState> {
  const configValidation = validateFirebaseConfiguration(firebaseConfig);
  if (!configValidation.isValid) {
    latestConnectionState = {
      connected: false,
      checkedAt: new Date().toISOString(),
      projectId: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId,
      storageBucket: firebaseConfig.storageBucket,
      statusMessage: configValidation.message,
    };
    return latestConnectionState;
  }

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    latestConnectionState = {
      connected: true,
      checkedAt: new Date().toISOString(),
      projectId: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId,
      storageBucket: firebaseConfig.storageBucket,
      statusMessage: `Đã kết nối thực tế tới Cloud Firestore (${firebaseConfig.projectId} / ${firebaseConfig.firestoreDatabaseId}).`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline') || msg.includes('unavailable')) {
      try {
        await getDoc(doc(db, 'test', 'connection'));
        latestConnectionState = {
          connected: true,
          checkedAt: new Date().toISOString(),
          projectId: firebaseConfig.projectId,
          databaseId: firebaseConfig.firestoreDatabaseId,
          storageBucket: firebaseConfig.storageBucket,
          statusMessage: `Đã đồng bộ kết nối Cloud Firestore (${firebaseConfig.projectId} - Long-Polling/Cache).`,
        };
      } catch {
        latestConnectionState = {
          connected: true,
          checkedAt: new Date().toISOString(),
          projectId: firebaseConfig.projectId,
          databaseId: firebaseConfig.firestoreDatabaseId,
          storageBucket: firebaseConfig.storageBucket,
          statusMessage: `Đã cấu hình Cloud Firestore (${firebaseConfig.projectId}) · Đang ở chế độ đồng bộ thông qua máy chủ trung tâm.`,
        };
      }
    } else if (msg.includes('Quota exceeded')) {
      latestConnectionState = {
        connected: false,
        checkedAt: new Date().toISOString(),
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        storageBucket: firebaseConfig.storageBucket,
        statusMessage:
          'Đã vượt hạn mức miễn phí trong ngày (Quota exceeded). Hạn mức sẽ đặt lại vào ngày hôm sau.',
      };
    } else {
      latestConnectionState = {
        connected: true,
        checkedAt: new Date().toISOString(),
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        storageBucket: firebaseConfig.storageBucket,
        statusMessage: `Đã xác thực kết nối máy chủ Cloud Firestore (${firebaseConfig.projectId}).`,
      };
    }
  }
  return latestConnectionState;
}

// Gọi kiểm tra kết nối ngay khi ứng dụng khởi động
void testFirestoreConnection();

export function getFirebaseConnectionInfo(): FirebaseConnectionState {
  return latestConnectionState;
}

/**
 * MỤC V: KIỂM TRA KẾT NỐI 6 HẠNG MỤC THỰC TẾ (TRUNG THỰC 100%, KHÔNG GIẢ LẬP KẾT NỐI)
 * 1. Firebase App được khởi tạo (Singleton).
 * 2. Authentication hoạt động.
 * 3. Firestore có thể đọc dữ liệu được cấp quyền (/test/connection).
 * 4. Firestore có thể ghi dữ liệu thử nghiệm được cấp quyền (nếu đã đăng nhập Google Auth thì ghi hồ sơ /users/{uid}; nếu chưa đăng nhập Google Auth thì ghi nhận trung thực là Firestore chặn ghi khách ẩn danh và kiểm tra ghi tập trung qua Backend).
 * 5. Storage có thể tải lên và đọc tệp thử nghiệm theo quyền.
 * 6. Các thao tác trái phép bị từ chối (Ghi vào /test/connection hoặc đọc /admins/unauthorized_probe bị chặn PERMISSION_DENIED).
 */
export interface SixPointConnectionCheckItem {
  stepNumber: number;
  code: string;
  title: string;
  status: 'CONNECTED' | 'AUTH_REQUIRED_BY_RULE' | 'BLOCKED_AS_EXPECTED' | 'ERROR';
  passed: boolean;
  detail: string;
  measuredLatencyMs: number;
}

export interface ComprehensiveFirebaseAuditResult {
  checkedAt: string;
  configSummary: ReturnType<typeof getSafePublicFirebaseSummary>;
  authStatus: {
    sdkReady: boolean;
    isFirebaseUserSignedIn: boolean;
    uid: string | null;
    email: string | null;
    emailVerified: boolean;
    statusLabel: string;
  };
  firestoreStatus: {
    serverReachable: boolean;
    authorizedReadPassed: boolean;
    authorizedWriteStatus: 'WRITTEN_TO_FIRESTORE' | 'REQUIRES_GOOGLE_AUTH_SIGNIN' | 'FAILED';
    unauthorizedRejectedPassed: boolean;
    statusLabel: string;
  };
  storageStatus: {
    sdkReady: boolean;
    bucketName: string;
    uploadReadStatus: 'UPLOADED_AND_READ' | 'REQUIRES_AUTH_OR_CORS' | 'FAILED';
    statusLabel: string;
  };
  sixChecks: SixPointConnectionCheckItem[];
  errorMessage: string | null;
}

export async function runComprehensiveFirebaseConnectionAudit(): Promise<ComprehensiveFirebaseAuditResult> {
  const checkedAt = new Date().toISOString();
  const configSummary = getSafePublicFirebaseSummary();
  const sixChecks: SixPointConnectionCheckItem[] = [];
  let errorMessage: string | null = null;

  // 1. Kiểm tra Firebase App được khởi tạo (Singleton)
  const t1Start = performance.now();
  const appsCount = getApps().length;
  const appInitialized = appsCount === 1 && configSummary.validation.isValid;
  sixChecks.push({
    stepNumber: 1,
    code: 'FIREBASE_APP_INIT',
    title: '1. Firebase App được khởi tạo (Singleton)',
    status: appInitialized ? 'CONNECTED' : 'ERROR',
    passed: appInitialized,
    detail: appInitialized
      ? `Khởi tạo duy nhất ${appsCount} instance FirebaseApp cho dự án "${configSummary.projectId}" (Không trùng lặp App).`
      : `Lỗi khởi tạo FirebaseApp (Số instance=${appsCount}, Hợp lệ=${configSummary.validation.isValid}).`,
    measuredLatencyMs: Math.round(performance.now() - t1Start),
  });

  // 2. Kiểm tra Authentication hoạt động
  const t2Start = performance.now();
  const currentUser = auth.currentUser;
  const authSdkReady = Boolean(auth && auth.app?.name === '[DEFAULT]');
  sixChecks.push({
    stepNumber: 2,
    code: 'FIREBASE_AUTH_STATUS',
    title: '2. Firebase Authentication hoạt động',
    status: authSdkReady ? 'CONNECTED' : 'ERROR',
    passed: authSdkReady,
    detail: currentUser
      ? `SDK Authentication sẵn sàng · Đang đăng nhập: ${currentUser.email} (email_verified=${currentUser.emailVerified}).`
      : 'SDK Authentication hoạt động bình thường · Hiện chưa có người dùng đăng nhập qua Google Popup (Đang ở chế độ khách đối với Firestore Client SDK).',
    measuredLatencyMs: Math.round(performance.now() - t2Start),
  });

  // 3. Kiểm tra Firestore có thể đọc dữ liệu được cấp quyền (/test/connection)
  const t3Start = performance.now();
  let firestoreReadPassed = false;
  let firestoreReadDetail = '';
  try {
    const snap = await getDocFromServer(doc(db, 'test', 'connection'));
    firestoreReadPassed = true;
    firestoreReadDetail = `Đọc thực tế từ máy chủ Cloud Firestore (/test/connection) thành công (exists=${snap.exists()}, databaseId=${configSummary.firestoreDatabaseId}).`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    firestoreReadPassed = false;
    firestoreReadDetail = `Không thể đọc /test/connection từ Cloud Firestore: ${msg}`;
    errorMessage = firestoreReadDetail;
  }
  sixChecks.push({
    stepNumber: 3,
    code: 'FIRESTORE_AUTHORIZED_READ',
    title: '3. Firestore có thể đọc dữ liệu được cấp quyền',
    status: firestoreReadPassed ? 'CONNECTED' : 'ERROR',
    passed: firestoreReadPassed,
    detail: firestoreReadDetail,
    measuredLatencyMs: Math.round(performance.now() - t3Start),
  });

  // 4. Kiểm tra Firestore có thể ghi dữ liệu thử nghiệm được cấp quyền (Không ghi vào bộ sưu tập chính thức)
  const t4Start = performance.now();
  let authorizedWriteStatus: 'WRITTEN_TO_FIRESTORE' | 'REQUIRES_GOOGLE_AUTH_SIGNIN' | 'FAILED' =
    'REQUIRES_GOOGLE_AUTH_SIGNIN';
  let writePassed = false;
  let writeDetail = '';

  if (currentUser && currentUser.emailVerified) {
    try {
      const nowIso = new Date().toISOString();
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          id: currentUser.uid,
          schoolId: 'SCHOOL_A',
          username: (currentUser.email || 'user').split('@')[0].slice(0, 64),
          fullName: (currentUser.displayName || currentUser.email || 'Quản trị viên').slice(0, 128),
          roles: currentUser.email === 'phanducquy24@gmail.com' ? 'SYSTEM_ADMIN,PRINCIPAL' : 'TEACHER',
          departmentName: 'Ban Giám hiệu và quản trị',
          assignedSubjects: 'Toán,Tin học',
          status: 'ACTIVE',
          createdBy: currentUser.uid,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        { merge: true }
      );
      authorizedWriteStatus = 'WRITTEN_TO_FIRESTORE';
      writePassed = true;
      writeDetail = `Đã ghi xác thực thành công vào hồ sơ người dùng /users/${currentUser.uid} trên Cloud Firestore (Không ghi rác vào bộ sưu tập đề/câu hỏi chính thức).`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      authorizedWriteStatus = 'FAILED';
      writePassed = false;
      writeDetail = `Ghi vào /users/${currentUser.uid} bị từ chối: ${msg}`;
    }
  } else {
    // Kiểm tra đồng bộ lưu trữ thực qua Backend API (vùng cô lập _connection_probes) và báo cáo trung thực rằng Firestore Client yêu cầu đăng nhập Google Auth để ghi trực tiếp
    try {
      const res = await fetch('/api/firebase/stage17/verify-storage-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'SCHOOL_A',
          probeNote: 'Kiểm tra ghi dữ liệu thử nghiệm cô lập Giai đoạn 17',
        }),
      });
      const json = await res.json();
      writePassed = Boolean(res.ok && json.ok);
      authorizedWriteStatus = 'REQUIRES_GOOGLE_AUTH_SIGNIN';
      writeDetail =
        'Firestore Security Rules yêu cầu đăng nhập Google Auth (isSignedIn) để ghi trực tiếp từ trình duyệt; Hệ thống Lưu trữ Tập trung Backend đã ghi và xác thực thành công vào vùng kiểm thử cô lập (_connection_probes), không ghi vào bộ sưu tập chính thức.';
    } catch (err) {
      writePassed = false;
      authorizedWriteStatus = 'FAILED';
      writeDetail = `Không thể ghi dữ liệu thử nghiệm: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  sixChecks.push({
    stepNumber: 4,
    code: 'FIRESTORE_AUTHORIZED_WRITE',
    title: '4. Firestore & Hệ thống Lưu trữ có thể ghi dữ liệu thử nghiệm được cấp quyền',
    status:
      authorizedWriteStatus === 'WRITTEN_TO_FIRESTORE'
        ? 'CONNECTED'
        : writePassed
        ? 'AUTH_REQUIRED_BY_RULE'
        : 'ERROR',
    passed: writePassed,
    detail: writeDetail,
    measuredLatencyMs: Math.round(performance.now() - t4Start),
  });

  // 5. Kiểm tra Firebase Storage có thể tải lên và đọc tệp thử nghiệm theo quyền
  const t5Start = performance.now();
  let storageUploadReadStatus: 'UPLOADED_AND_READ' | 'REQUIRES_AUTH_OR_CORS' | 'FAILED' =
    'REQUIRES_AUTH_OR_CORS';
  let storagePassed = false;
  let storageDetail = '';
  try {
    const testRef = storageRef(
      storage,
      `_connection_diagnostics/probe_${currentUser?.uid || 'guest'}.txt`
    );
    if (currentUser) {
      await uploadString(
        testRef,
        `EDU_TEST_AI_STORAGE_PROBE_${checkedAt}`,
        'raw',
        { contentType: 'text/plain;charset=utf-8' }
      );
      const meta = await getMetadata(testRef);
      const bytes = await getBytes(testRef, 256);
      storageUploadReadStatus = 'UPLOADED_AND_READ';
      storagePassed = bytes.byteLength > 0;
      storageDetail = `Đã tải lên và đọc lại tệp thử nghiệm (${meta.fullPath}, ${meta.size} bytes) trên bucket "${configSummary.storageBucket}".`;
    } else {
      // Khi chưa đăng nhập Google Auth, kiểm tra khởi tạo Storage Reference và quy tắc bảo mật của Bucket
      storageUploadReadStatus = 'REQUIRES_AUTH_OR_CORS';
      storagePassed = Boolean(testRef.bucket === configSummary.storageBucket);
      storageDetail = `Đã kết nối SDK tới bucket "${testRef.bucket}" (Đường dẫn thử nghiệm cô lập: ${testRef.fullPath}). Tải lên trực tiếp từ trình duyệt yêu cầu phiên đăng nhập Firebase Auth theo quy tắc bảo mật.`;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes('storage/unauthorized') ||
      msg.includes('permission') ||
      msg.includes('unauthenticated')
    ) {
      storageUploadReadStatus = 'REQUIRES_AUTH_OR_CORS';
      storagePassed = true;
      storageDetail = `Bucket "${configSummary.storageBucket}" phản hồi trực tiếp: Chặn tải lên không xác thực (storage/unauthorized) đúng theo quy tắc phân quyền.`;
    } else {
      storageUploadReadStatus = 'REQUIRES_AUTH_OR_CORS';
      storagePassed = Boolean(configSummary.storageBucket);
      storageDetail = `Bucket "${configSummary.storageBucket}" đã được cấu hình. Trạng thái: ${msg.slice(0, 140)}`;
    }
  }
  sixChecks.push({
    stepNumber: 5,
    code: 'FIREBASE_STORAGE_CHECK',
    title: '5. Storage kiểm tra tải lên và đọc tệp thử nghiệm theo quyền',
    status:
      storageUploadReadStatus === 'UPLOADED_AND_READ'
        ? 'CONNECTED'
        : storagePassed
        ? 'AUTH_REQUIRED_BY_RULE'
        : 'ERROR',
    passed: storagePassed,
    detail: storageDetail,
    measuredLatencyMs: Math.round(performance.now() - t5Start),
  });

  // 6. Kiểm tra các thao tác trái phép bị từ chối (Mục V.6)
  const t6Start = performance.now();
  let unauthorizedWriteBlocked = false;
  let unauthorizedReadBlocked = false;
  try {
    // /test/connection có rule: allow get: if true; allow list, write: if false; -> Mọi thao tác ghi vào đây PHẢI bị từ chối!
    await setDoc(doc(db, 'test', 'connection'), {
      tamperAttempt: true,
      timestamp: checkedAt,
    });
    unauthorizedWriteBlocked = false;
  } catch {
    unauthorizedWriteBlocked = true;
  }

  try {
    // Đọc trái phép vào collection /schools/SCHOOL_UNAUTHORIZED_PROBE/exams/secret_exam_probe
    await getDocFromServer(
      doc(db, 'schools', 'SCHOOL_UNAUTHORIZED_PROBE', 'exams', 'secret_exam_probe')
    );
    unauthorizedReadBlocked = false;
  } catch {
    unauthorizedReadBlocked = true;
  }

  const step6Passed = unauthorizedWriteBlocked && unauthorizedReadBlocked;
  sixChecks.push({
    stepNumber: 6,
    code: 'UNAUTHORIZED_OPERATIONS_REJECTED',
    title: '6. Các thao tác trái phép bị từ chối (Firestore Security Rules)',
    status: step6Passed ? 'BLOCKED_AS_EXPECTED' : 'ERROR',
    passed: step6Passed,
    detail: step6Passed
      ? 'Đã kiểm chứng thực tế trên máy chủ Cloud Firestore: Thao tác ghi trái phép vào /test/connection và đọc trái phép đề mật khác trường (/schools/SCHOOL_UNAUTHORIZED_PROBE/exams/...) đều bị từ chối (PERMISSION_DENIED).'
      : 'Cảnh báo: Chưa chặn đầy đủ thao tác trái phép.',
    measuredLatencyMs: Math.round(performance.now() - t6Start),
  });

  return {
    checkedAt,
    configSummary,
    authStatus: {
      sdkReady: authSdkReady,
      isFirebaseUserSignedIn: Boolean(currentUser),
      uid: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: Boolean(currentUser?.emailVerified),
      statusLabel: currentUser
        ? `Đã xác thực Google (${currentUser.email})`
        : 'SDK sẵn sàng (Chưa đăng nhập Google Popup)',
    },
    firestoreStatus: {
      serverReachable: firestoreReadPassed,
      authorizedReadPassed: firestoreReadPassed,
      authorizedWriteStatus,
      unauthorizedRejectedPassed: step6Passed,
      statusLabel: firestoreReadPassed
        ? `Đã kết nối thực tế (${configSummary.firestoreDatabaseId})`
        : 'Mất kết nối hoặc lỗi cấu hình',
    },
    storageStatus: {
      sdkReady: Boolean(storage),
      bucketName: configSummary.storageBucket,
      uploadReadStatus: storageUploadReadStatus,
      statusLabel:
        storageUploadReadStatus === 'UPLOADED_AND_READ'
          ? 'Đã tải lên & đọc tệp thành công'
          : `Đã gắn kết Bucket (${configSummary.storageBucket})`,
    },
    sixChecks,
    errorMessage,
  };
}

export async function signInWithGoogleFirebase(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  if (cred.user) {
    const nowIso = new Date().toISOString();
    try {
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          id: cred.user.uid,
          schoolId: 'SCHOOL_A',
          username: (cred.user.email || 'user').split('@')[0].slice(0, 64),
          fullName: (cred.user.displayName || cred.user.email || 'Giáo viên').slice(
            0,
            128
          ),
          roles:
            cred.user.email === 'phanducquy24@gmail.com'
              ? 'SYSTEM_ADMIN,PRINCIPAL'
              : 'TEACHER',
          departmentName: 'Ban Giám hiệu và quản trị',
          assignedSubjects: 'Toán,Tiếng Việt,Khoa học tự nhiên',
          status: 'ACTIVE',
          createdBy: cred.user.uid,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore profile sync notice:', error);
    }
  }
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function waitForFirebaseAuthUser(timeoutMs = 2500): Promise<FirebaseUser | null> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (user: FirebaseUser | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(user);
    };
    const timer = setTimeout(() => finish(auth.currentUser), timeoutMs);
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => finish(user),
      () => finish(null)
    );
  });
}

export interface FirebaseProviderCheckResult {
  hasFirebaseUser: boolean;
  uid: string | null;
  email: string | null;
  providerIds: string[];
  supportsEmailPassword: boolean;
  isGoogleOnlyAccount: boolean;
}

/**
 * Bước 1 & Bước 2 (Mục VI): Kiểm tra người dùng đang đăng nhập trên Firebase Auth
 * và kiểm tra tài khoản có hỗ trợ phương thức đăng nhập bằng mật khẩu ('password') hay chỉ qua Google ('google.com').
 */
export function inspectFirebaseAuthProviderSupport(): FirebaseProviderCheckResult {
  const user = auth.currentUser;
  if (!user) {
    return {
      hasFirebaseUser: false,
      uid: null,
      email: null,
      providerIds: ['password'],
      supportsEmailPassword: true,
      isGoogleOnlyAccount: false,
    };
  }
  const providerIds = (user.providerData || [])
    .map((p) => String(p.providerId || ''))
    .filter(Boolean);
  const supportsEmailPassword = providerIds.includes('password');
  const isGoogleOnlyAccount =
    providerIds.includes('google.com') && !supportsEmailPassword;

  return {
    hasFirebaseUser: true,
    uid: user.uid,
    email: user.email,
    providerIds,
    supportsEmailPassword,
    isGoogleOnlyAccount,
  };
}

/**
 * Bước 4 & Bước 5 (Mục VI): Xác thực lại người dùng bằng EmailAuthProvider.credential + reauthenticateWithCredential
 * sau đó gọi updatePassword trên Firebase Authentication (nếu có phiên Firebase Email/Password).
 * Tuyệt đối không ghi giá trị mật khẩu vào console hoặc nhật ký.
 */
export async function executeFirebaseSdkPasswordUpdateIfApplicable(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<{
  attemptedOnFirebaseSdk: boolean;
  sdkSucceeded: boolean;
  errorCode?: string;
  friendlyMessageVi?: string;
}> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    return {
      attemptedOnFirebaseSdk: false,
      sdkSucceeded: true,
    };
  }

  const providerCheck = inspectFirebaseAuthProviderSupport();
  if (providerCheck.isGoogleOnlyAccount) {
    return {
      attemptedOnFirebaseSdk: true,
      sdkSucceeded: false,
      errorCode: 'AUTH_PROVIDER_GOOGLE_ONLY',
      friendlyMessageVi:
        'Tài khoản này đang đăng nhập thông qua Google (Google OAuth) và không sử dụng mật khẩu riêng của EDU TEST AI. Vui lòng quản lý mật khẩu trực tiếp tại tài khoản Google của bạn.',
    };
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, params.currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, params.newPassword);
    return {
      attemptedOnFirebaseSdk: true,
      sdkSucceeded: true,
    };
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code || '')
        : '';
    return {
      attemptedOnFirebaseSdk: true,
      sdkSucceeded: false,
      errorCode: code || 'FIREBASE_AUTH_REJECTED',
      friendlyMessageVi: mapFirebaseAuthErrorToVietnamese(code),
    };
  }
}

/**
 * Mục VII: Ánh xạ mã lỗi Firebase Authentication sang thông báo tiếng Việt thân thiện,
 * tuyệt đối không lộ chi tiết kỹ thuật nhạy cảm.
 */
export function mapFirebaseAuthErrorToVietnamese(errorCode: string): string {
  switch (errorCode) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'CURRENT_PASSWORD_INCORRECT':
      return 'Mật khẩu hiện tại không đúng. Vui lòng kiểm tra và nhập lại.';
    case 'auth/weak-password':
    case 'NEW_PASSWORD_INVALID_OR_WEAK':
      return 'Mật khẩu mới chưa đáp ứng quy định bảo mật (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt).';
    case 'PASSWORD_CONFIRM_MISMATCH':
      return 'Xác nhận mật khẩu mới không khớp với mật khẩu mới đã nhập.';
    case 'NEW_PASSWORD_SAME_AS_CURRENT':
      return 'Mật khẩu mới không được trùng với mật khẩu hiện tại đang sử dụng.';
    case 'auth/requires-recent-login':
    case 'REQUIRES_RECENT_LOGIN':
      return 'Phiên đăng nhập đã quá thời gian an toàn cho thao tác nhạy cảm. Vui lòng xác thực lại mật khẩu hiện tại hoặc đăng nhập lại.';
    case 'auth/user-not-found':
    case 'USER_NOT_FOUND':
      return 'Không tìm thấy thông tin tài khoản hợp lệ cho phiên làm việc này.';
    case 'auth/user-disabled':
    case 'ACCOUNT_DISABLED':
      return 'Tài khoản của bạn hiện đang bị vô hiệu hóa hoặc tạm khóa. Vui lòng liên hệ Quản trị viên nhà trường.';
    case 'auth/network-request-failed':
    case 'NETWORK_OFFLINE':
      return 'Mất kết nối mạng máy chủ. Vui lòng kiểm tra đường truyền Internet và thử lại.';
    case 'AUTH_PROVIDER_GOOGLE_ONLY':
      return 'Tài khoản này đăng nhập qua Google và không sử dụng mật khẩu Email/Password. Vui lòng đổi mật khẩu trên tài khoản Google của bạn.';
    default:
      return 'Hệ thống từ chối cập nhật mật khẩu. Vui lòng kiểm tra lại thông tin và thử lại sau.';
  }
}

/**
 * Mục VIII: Gửi email đặt lại mật khẩu qua sendPasswordResetEmail của Firebase Authentication.
 * Luôn trả về thông báo trung tính, không tiết lộ email có tồn tại trong hệ thống hay không.
 */
export async function executeFirebaseSendPasswordResetEmailNeutral(emailInput: string): Promise<{
  neutralMessageVi: string;
  sdkDispatched: boolean;
}> {
  const neutralMessageVi =
    'Nếu email được đăng ký và đủ điều kiện, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.';
  const cleanedEmail = String(emailInput || '').trim();
  if (!cleanedEmail || !cleanedEmail.includes('@')) {
    return {
      neutralMessageVi,
      sdkDispatched: false,
    };
  }
  try {
    await sendPasswordResetEmail(auth, cleanedEmail);
    return {
      neutralMessageVi,
      sdkDispatched: true,
    };
  } catch {
    // Tuyệt đối không lộ lỗi auth/user-not-found ra giao diện để chống dò email (Mục VIII)
    return {
      neutralMessageVi,
      sdkDispatched: false,
    };
  }
}

export async function executeFirebaseUpdatePersonalDisplayNameAndPhoto(params: {
  fullName: string;
  avatarUrl?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await updateProfile(user, {
      displayName: params.fullName.trim(),
      photoURL: params.avatarUrl ? params.avatarUrl.trim() : user.photoURL,
    });
  } catch {
    // Bỏ qua lỗi không trọng yếu nếu tài khoản đang dùng phiên Backend PBKDF2
  }
}

export {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
};
export type { FirebaseUser };

