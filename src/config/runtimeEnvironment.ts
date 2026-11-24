/**
 * CẤU HÌNH MÔI TRƯỜNG VẬN HÀNH & FEATURE FLAGS (PRODUCTION-ONLY ARCHITECTURE)
 * Phân biệt rõ 3 môi trường: DEVELOPMENT, STAGING, PRODUCTION.
 * Lưu ý bảo mật: Cấu hình tại Frontend chỉ phục vụ điều khiển hiển thị UI.
 * Mọi quyền truy cập dữ liệu, API quản trị, công cụ bảo trì và route kỹ thuật
 * đều được kiểm chứng độc lập tại Backend (/api/runtime/environment-policy & Middleware).
 */

export type AppRuntimeEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export interface RuntimeFeatureFlags {
  environment: AppRuntimeEnvironment;
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  /** Giao diện Debug kỹ thuật */
  enableDebugUi: boolean;
  /** Công cụ tạo dữ liệu mẫu / Seed Data */
  enableSampleDataGenerator: boolean;
  /** Trang Demo giới thiệu / thử nghiệm */
  enableDemoPages: boolean;
  /** Các nút chạy kịch bản Test / Nghiệm thu trên UI */
  enableQaTestButtons: boolean;
  /** Hiển thị thông tin cấu hình kỹ thuật nội bộ (UID, Collection Path, Schema) */
  showInternalTechConfig: boolean;
  /** Chỉ hiển thị menu đúng theo vai trò & quyền được cấp */
  enforceStrictRoleMenuFilter: boolean;
  /** Ẩn các chức năng chưa sẵn sàng / đang phát triển */
  hideExperimentalFeatures: boolean;
  /** Cô lập tuyệt đối dữ liệu thử nghiệm, không để truy cập nhầm vào Production */
  isolateTestDataFromProduction: boolean;
  /** Nguồn xác thực chính sách (BACKEND_VERIFIED hoặc STATIC_DEFAULT) */
  policySource: 'BACKEND_VERIFIED' | 'STATIC_DEFAULT';
}

function parseRuntimeEnvString(raw?: string | null): AppRuntimeEnvironment {
  const normalized = String(raw || '')
    .trim()
    .toUpperCase();
  if (normalized === 'DEVELOPMENT' || normalized === 'DEV') {
    return 'DEVELOPMENT';
  }
  if (normalized === 'STAGING' || normalized === 'STAGE' || normalized === 'QA') {
    return 'STAGING';
  }
  return 'PRODUCTION';
}

/**
 * Xác định môi trường mặc định an toàn:
 * Giao diện người dùng chính thức luôn mặc định ở chế độ PRODUCTION (Production-Only UI),
 * trừ khi biến môi trường VITE_APP_RUNTIME_ENV được cấu hình tường minh là DEVELOPMENT hoặc STAGING
 * và được đồng bộ xác nhận từ máy chủ Backend.
 */
export function resolveStaticRuntimeEnvironment(): AppRuntimeEnvironment {
  try {
    const envVar = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_APP_RUNTIME_ENV;
    if (envVar) {
      return parseRuntimeEnvString(envVar);
    }
  } catch {
    // Bỏ qua nếu không có import.meta.env
  }
  return 'PRODUCTION';
}

export function buildFeatureFlagsForEnvironment(
  env: AppRuntimeEnvironment,
  policySource: 'BACKEND_VERIFIED' | 'STATIC_DEFAULT' = 'STATIC_DEFAULT'
): RuntimeFeatureFlags {
  if (env === 'DEVELOPMENT') {
    return {
      environment: 'DEVELOPMENT',
      isProduction: false,
      isStaging: false,
      isDevelopment: true,
      enableDebugUi: true,
      enableSampleDataGenerator: true,
      enableDemoPages: true,
      enableQaTestButtons: true,
      showInternalTechConfig: true,
      enforceStrictRoleMenuFilter: true,
      hideExperimentalFeatures: false,
      isolateTestDataFromProduction: true,
      policySource,
    };
  }

  if (env === 'STAGING') {
    return {
      environment: 'STAGING',
      isProduction: false,
      isStaging: true,
      isDevelopment: false,
      enableDebugUi: false,
      enableSampleDataGenerator: true,
      enableDemoPages: false,
      enableQaTestButtons: true,
      showInternalTechConfig: false,
      enforceStrictRoleMenuFilter: true,
      hideExperimentalFeatures: true,
      isolateTestDataFromProduction: true,
      policySource,
    };
  }

  // PRODUCTION (Mặc định an toàn tuyệt đối cho người dùng chính thức)
  return {
    environment: 'PRODUCTION',
    isProduction: true,
    isStaging: false,
    isDevelopment: false,
    enableDebugUi: false,
    enableSampleDataGenerator: false,
    enableDemoPages: false,
    enableQaTestButtons: false,
    showInternalTechConfig: false,
    enforceStrictRoleMenuFilter: true,
    hideExperimentalFeatures: true,
    isolateTestDataFromProduction: true,
    policySource,
  };
}

let currentRuntimeFlags: RuntimeFeatureFlags = buildFeatureFlagsForEnvironment(
  resolveStaticRuntimeEnvironment(),
  'STATIC_DEFAULT'
);

export function getRuntimeFeatureFlags(): RuntimeFeatureFlags {
  return currentRuntimeFlags;
}

/**
 * Đồng bộ cấu hình môi trường & feature flags từ Backend có kiểm chứng quyền.
 * Đảm bảo không dựa vào một biến frontend đơn giản làm biện pháp bảo mật duy nhất.
 */
export async function syncRuntimeEnvironmentFromBackend(params?: {
  userId?: string;
  role?: string;
}): Promise<RuntimeFeatureFlags> {
  try {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.role) query.set('role', params.role);
    const res = await fetch(`/api/runtime/environment-policy?${query.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(params?.role ? { 'x-actor-role': params.role } : {}),
        ...(params?.userId ? { 'x-actor-id': params.userId } : {}),
      },
    });
    if (!res.ok) {
      currentRuntimeFlags = buildFeatureFlagsForEnvironment('PRODUCTION', 'BACKEND_VERIFIED');
      return currentRuntimeFlags;
    }
    const data = await res.json();
    if (data && data.ok && data.policy) {
      const verifiedEnv = parseRuntimeEnvString(data.policy.environment);
      currentRuntimeFlags = {
        ...buildFeatureFlagsForEnvironment(verifiedEnv, 'BACKEND_VERIFIED'),
        ...data.policy.flags,
        environment: verifiedEnv,
        isProduction: verifiedEnv === 'PRODUCTION',
        isStaging: verifiedEnv === 'STAGING',
        isDevelopment: verifiedEnv === 'DEVELOPMENT',
        policySource: 'BACKEND_VERIFIED',
      };
      return currentRuntimeFlags;
    }
  } catch {
    // Khi không kết nối được, rơi về chế độ an toàn cao nhất: PRODUCTION
  }
  currentRuntimeFlags = buildFeatureFlagsForEnvironment('PRODUCTION', 'STATIC_DEFAULT');
  return currentRuntimeFlags;
}
