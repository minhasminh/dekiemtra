import { ref, uploadBytes, getBytes } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from './firebaseClient';

// ============================================================================
// MỤC I: 8 LOẠI TỆP TÀI LIỆU CHUYÊN MÔN TRONG EDU TEST AI
// ============================================================================

export type StorageDocumentModuleType =
  | 'WORD_DOCUMENT'
  | 'PDF_DOCUMENT'
  | 'EXCEL_SPREADSHEET'
  | 'QUESTION_IMAGE'
  | 'CORPUS_MATERIAL'
  | 'EXAM_DOSSIER_PACKAGE'
  | 'APPRAISAL_REPORT'
  | 'RESULT_ANALYSIS_REPORT';

export type StorageAccessLevel =
  | 'SCHOOL_INTERNAL'
  | 'DEPARTMENT_SCOPED'
  | 'CONFIDENTIAL_EXAM'
  | 'SECRET_ANSWER_KEY'
  | 'LEADERSHIP_ONLY';

export type StorageRetentionPolicy =
  | 'STANDARD_ACTIVE'
  | 'ARCHIVED_5_YEARS'
  | 'LEGAL_HOLD_LOCKED';

export interface StorageModuleTypeCatalogItem {
  moduleCode: StorageDocumentModuleType;
  vietnameseName: string;
  description: string;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  defaultAccessLevel: StorageAccessLevel;
}

export const STORAGE_MODULE_TYPES_CATALOG: StorageModuleTypeCatalogItem[] = [
  {
    moduleCode: 'WORD_DOCUMENT',
    vietnameseName: '1. Tài liệu Word (.docx, .doc)',
    description: 'Bản thảo đề kiểm tra, hướng dẫn chấm và bản đặc tả định dạng Microsoft Word',
    allowedExtensions: ['.docx', '.doc'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
    maxSizeBytes: 15 * 1024 * 1024,
    defaultAccessLevel: 'DEPARTMENT_SCOPED',
  },
  {
    moduleCode: 'PDF_DOCUMENT',
    vietnameseName: '2. Tài liệu PDF (.pdf)',
    description: 'Đề kiểm tra chính thức đã khóa bố cục, quyết định phê duyệt và phiếu in',
    allowedExtensions: ['.pdf'],
    allowedMimeTypes: ['application/pdf'],
    maxSizeBytes: 15 * 1024 * 1024,
    defaultAccessLevel: 'CONFIDENTIAL_EXAM',
  },
  {
    moduleCode: 'EXCEL_SPREADSHEET',
    vietnameseName: '3. Bảng tính Excel (.xlsx, .xls, .csv)',
    description: 'Bảng ma trận đề kiểm tra, danh sách phân công giáo viên và bảng điểm mẫu',
    allowedExtensions: ['.xlsx', '.xls', '.csv'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ],
    maxSizeBytes: 15 * 1024 * 1024,
    defaultAccessLevel: 'SCHOOL_INTERNAL',
  },
  {
    moduleCode: 'QUESTION_IMAGE',
    vietnameseName: '4. Hình ảnh câu hỏi (.png, .jpg, .svg, .webp)',
    description: 'Hình vẽ hình học phẳng/không gian, đồ thị hàm số, sơ đồ thí nghiệm KHTN',
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'],
    maxSizeBytes: 10 * 1024 * 1024,
    defaultAccessLevel: 'SCHOOL_INTERNAL',
  },
  {
    moduleCode: 'CORPUS_MATERIAL',
    vietnameseName: '5. Ngữ liệu đọc hiểu & Tình huống (.docx, .pdf, .txt, .png)',
    description: 'Văn bản văn học, văn bản thông tin, bảng số liệu thống kê dùng cho câu hỏi chùm',
    allowedExtensions: ['.docx', '.pdf', '.txt', '.png', '.jpg'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'text/plain',
      'image/png',
      'image/jpeg',
    ],
    maxSizeBytes: 15 * 1024 * 1024,
    defaultAccessLevel: 'SCHOOL_INTERNAL',
  },
  {
    moduleCode: 'EXAM_DOSSIER_PACKAGE',
    vietnameseName: '6. Tệp hồ sơ kiểm tra định kỳ (.zip, .pdf, .docx)',
    description: 'Bộ hồ sơ khảo thí đầy đủ (Ma trận + Đặc tả + Đề + Đáp án + Hướng dẫn chấm)',
    allowedExtensions: ['.zip', '.pdf', '.docx'],
    allowedMimeTypes: [
      'application/zip',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSizeBytes: 15 * 1024 * 1024,
    defaultAccessLevel: 'CONFIDENTIAL_EXAM',
  },
  {
    moduleCode: 'APPRAISAL_REPORT',
    vietnameseName: '7. Báo cáo thẩm định & Phản biện (.pdf, .docx)',
    description: 'Biên bản thẩm định của Tổ chuyên môn và báo cáo kiểm định chất lượng đề',
    allowedExtensions: ['.pdf', '.docx'],
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSizeBytes: 15 * 1024 * 1024,
    defaultAccessLevel: 'DEPARTMENT_SCOPED',
  },
  {
    moduleCode: 'RESULT_ANALYSIS_REPORT',
    vietnameseName: '8. Báo cáo kết quả & Thống kê phổ điểm (.xlsx, .pdf)',
    description: 'Báo cáo thống kê phổ điểm sau kiểm tra, chỉ số độ khó (P) và độ phân biệt (D)',
    allowedExtensions: ['.xlsx', '.pdf', '.csv'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'text/csv',
    ],
    maxSizeBytes: 15 * 1024 * 1024,
    defaultAccessLevel: 'LEADERSHIP_ONLY',
  },
];

// ============================================================================
// MỤC III: CẤU TRÚC METADATA TỆP TRONG CLOUD FIRESTORE (12 TRƯỜNG BẮT BUỘC)
// ============================================================================

export interface FileVersionEntry {
  versionId: string;
  versionNumber: number;
  storagePath: string;
  originalFilename: string;
  contentType: string;
  size: number;
  checksumSha256: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
  changeNote: string;
}

export interface FirestoreFileAssetMetadata {
  // 12 trường bắt buộc theo Mục III
  fileId: string;
  schoolId: string;
  module: StorageDocumentModuleType;
  documentId: string;
  versionId: string;
  originalFilename: string;
  storagePath: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  accessLevel: StorageAccessLevel;

  // Các trường mở rộng phục vụ quản lý vòng đời, bảo mật đề mật và lịch sử phiên bản (Mục IV & V)
  uploadedByName?: string;
  departmentId?: string;
  assignedUserIds?: string[];
  publicUrlAllowed: boolean;
  retentionPolicy: StorageRetentionPolicy;
  checksumSha256?: string;
  isSoftDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  version: number;
  versionHistory: FileVersionEntry[];
  status: 'ACTIVE' | 'ARCHIVED' | 'SOFT_DELETED';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MỤC II: XÂY DỰNG VÀ KIỂM TRA ĐƯỜNG DẪN CHUẨN
// Cấu trúc: {schoolId}/{module}/{documentId}/{versionId}/{filename}
// Tuyệt đối không dùng tên người dùng hoặc email làm định danh chính!
// ============================================================================

const SAFE_ID_SEGMENT_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export function validateAndBuildStoragePath(params: {
  schoolId: string;
  module: StorageDocumentModuleType;
  documentId: string;
  versionId: string;
  originalFilename: string;
}): {
  valid: boolean;
  storagePath: string;
  sanitizedFilename: string;
  errorReason?: string;
} {
  const schoolId = String(params.schoolId || '').trim();
  const module = String(params.module || '').trim();
  const documentId = String(params.documentId || '').trim();
  const versionId = String(params.versionId || '').trim();
  const rawFilename = String(params.originalFilename || '').trim();

  // Kiểm tra cấm dùng email (@) hoặc họ tên có khoảng trắng trong các phân đoạn định danh
  const idSegments = [
    { name: 'schoolId', value: schoolId },
    { name: 'module', value: module },
    { name: 'documentId', value: documentId },
    { name: 'versionId', value: versionId },
  ];

  for (const seg of idSegments) {
    if (!seg.value) {
      return {
        valid: false,
        storagePath: '',
        sanitizedFilename: '',
        errorReason: `Thiếu định danh bắt buộc [${seg.name}] khi tạo đường dẫn Firebase Storage.`,
      };
    }
    if (seg.value.includes('@')) {
      return {
        valid: false,
        storagePath: '',
        sanitizedFilename: '',
        errorReason: `Vi phạm quy tắc cấu trúc đường dẫn (Mục II): Không được sử dụng email [${seg.value}] làm định danh [${seg.name}].`,
      };
    }
    if (!SAFE_ID_SEGMENT_REGEX.test(seg.value)) {
      return {
        valid: false,
        storagePath: '',
        sanitizedFilename: '',
        errorReason: `Vi phạm quy tắc cấu trúc đường dẫn (Mục II): Định danh [${seg.name} = "${seg.value}"] không được chứa khoảng trắng, tên cá nhân có dấu hoặc ký tự đặc biệt.`,
      };
    }
  }

  const sanitizedFilename = rawFilename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');

  if (!sanitizedFilename || sanitizedFilename.length < 3) {
    return {
      valid: false,
      storagePath: '',
      sanitizedFilename: '',
      errorReason: 'Tên tệp (filename) không hợp lệ.',
    };
  }

  const storagePath = `${schoolId}/${module}/${documentId}/${versionId}/${sanitizedFilename}`;
  return {
    valid: true,
    storagePath,
    sanitizedFilename,
  };
}

// ============================================================================
// MỤC V: CÁC HÀM QUẢN LÝ TỆP (UPLOAD, PREVIEW, DOWNLOAD, VERSION, SOFT DELETE, RETENTION)
// ============================================================================

export async function uploadFileToFirebaseStorageService(params: {
  schoolId: string;
  module: StorageDocumentModuleType;
  documentId: string;
  versionId?: string;
  originalFilename: string;
  contentType: string;
  size: number;
  base64Content: string;
  accessLevel: StorageAccessLevel;
  retentionPolicy?: StorageRetentionPolicy;
  uploadedBy: string;
  uploadedByName?: string;
  actorRole: string;
  departmentId?: string;
  assignedUserIds?: string[];
  changeNote?: string;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  fileMetadata?: FirestoreFileAssetMetadata;
}> {
  const versionId = params.versionId || 'v1';
  const pathCheck = validateAndBuildStoragePath({
    schoolId: params.schoolId,
    module: params.module,
    documentId: params.documentId,
    versionId,
    originalFilename: params.originalFilename,
  });

  if (!pathCheck.valid) {
    return {
      ok: false,
      httpStatus: 400,
      message: pathCheck.errorReason || 'Đường dẫn lưu trữ không hợp lệ.',
    };
  }

  // Nếu người dùng đang đăng nhập Google OAuth trên Firebase Client, đồng bộ tệp lên Firebase Storage SDK thực
  if (auth?.currentUser && params.base64Content) {
    try {
      const storageRef = ref(storage, pathCheck.storagePath);
      const cleanBase64 = params.base64Content.includes(',')
        ? params.base64Content.split(',')[1]
        : params.base64Content;
      const binaryStr = atob(cleanBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      await uploadBytes(storageRef, bytes, {
        contentType: params.contentType,
        customMetadata: {
          schoolId: params.schoolId,
          module: params.module,
          documentId: params.documentId,
          versionId,
          uploadedBy: auth.currentUser.uid,
          accessLevel: params.accessLevel,
        },
      });
    } catch {
      // Tiếp tục xử lý qua Backend Storage & Firestore Metadata Gateway
    }
  }

  try {
    const res = await fetch('/api/firebase/storage/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        httpStatus: res.status,
        message: data.message || `Lỗi tải tệp lên (HTTP ${res.status}).`,
      };
    }

    const fileMetadata = data.fileMetadata as FirestoreFileAssetMetadata;
    if (auth?.currentUser && fileMetadata) {
      try {
        await setDoc(
          doc(db, 'schools', params.schoolId, 'fileAssets', fileMetadata.fileId),
          fileMetadata,
          { merge: true }
        );
      } catch {
        // ignore client mirror rule restriction
      }
    }

    return {
      ok: true,
      httpStatus: 200,
      message: data.message || `Đã tải lên thành công [${fileMetadata.storagePath}].`,
      fileMetadata,
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 500,
      message: err instanceof Error ? err.message : 'Không thể kết nối dịch vụ Firebase Storage.',
    };
  }
}

export async function requestSecureFileDownloadOrPreview(params: {
  schoolId: string;
  fileId: string;
  versionId?: string;
  actorUserId: string;
  actorRole: string;
  actorDepartmentId?: string;
  mode: 'DOWNLOAD' | 'PREVIEW';
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  fileMetadata?: FirestoreFileAssetMetadata;
  ephemeralSignedToken?: string;
  ephemeralExpiresAt?: string;
  publicUrlAllowed?: boolean;
  base64Content?: string;
  previewTextSummary?: string;
}> {
  try {
    const res = await fetch('/api/firebase/storage/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        httpStatus: res.status,
        message: data.message || `Từ chối truy cập tệp (HTTP ${res.status}).`,
      };
    }

    // Nếu người dùng đã xác thực Firebase Client, thử đọc thêm từ Firebase Storage SDK
    if (auth?.currentUser && data.fileMetadata?.storagePath) {
      try {
        const storageRef = ref(storage, data.fileMetadata.storagePath);
        await getBytes(storageRef, 1024 * 64);
      } catch {
        // ignore
      }
    }

    return {
      ok: true,
      httpStatus: 200,
      message: data.message,
      fileMetadata: data.fileMetadata,
      ephemeralSignedToken: data.ephemeralSignedToken,
      ephemeralExpiresAt: data.ephemeralExpiresAt,
      publicUrlAllowed: data.publicUrlAllowed,
      base64Content: data.base64Content,
      previewTextSummary: data.previewTextSummary,
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 500,
      message: err instanceof Error ? err.message : 'Lỗi kết nối khi tải tệp.',
    };
  }
}

export async function createNewFileVersionService(params: {
  schoolId: string;
  fileId: string;
  originalFilename: string;
  contentType: string;
  size: number;
  base64Content: string;
  uploadedBy: string;
  uploadedByName?: string;
  actorRole: string;
  changeNote: string;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  fileMetadata?: FirestoreFileAssetMetadata;
}> {
  try {
    const res = await fetch('/api/firebase/storage/new-version', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      httpStatus: res.status,
      message: data.message || (res.ok ? 'Đã tạo phiên bản tệp mới.' : 'Không thể tạo phiên bản mới.'),
      fileMetadata: data.fileMetadata,
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 500,
      message: err instanceof Error ? err.message : 'Lỗi kết nối khi tạo phiên bản tệp.',
    };
  }
}

export async function softDeleteFileMetadataService(params: {
  schoolId: string;
  fileId: string;
  actorUserId: string;
  actorRole: string;
  reason?: string;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  fileMetadata?: FirestoreFileAssetMetadata;
}> {
  try {
    const res = await fetch('/api/firebase/storage/soft-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      httpStatus: res.status,
      message: data.message || (res.ok ? 'Đã xóa mềm metadata tệp.' : 'Không thể xóa mềm metadata tệp.'),
      fileMetadata: data.fileMetadata,
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 500,
      message: err instanceof Error ? err.message : 'Lỗi kết nối khi xóa mềm metadata tệp.',
    };
  }
}

export async function updateFileRetentionPolicyService(params: {
  schoolId: string;
  fileId: string;
  retentionPolicy: StorageRetentionPolicy;
  actorUserId: string;
  actorRole: string;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  fileMetadata?: FirestoreFileAssetMetadata;
}> {
  try {
    const res = await fetch('/api/firebase/storage/retention-policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      httpStatus: res.status,
      message: data.message || 'Đã cập nhật chính sách lưu trữ tệp.',
      fileMetadata: data.fileMetadata,
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 500,
      message: err instanceof Error ? err.message : 'Lỗi cập nhật chính sách lưu trữ.',
    };
  }
}

export type StorageModuleCategory = StorageDocumentModuleType;
export type FileAccessLevel = StorageAccessLevel;
export type FileRetentionPolicy = StorageRetentionPolicy;

export interface Storage9ScenarioQaItem {
  order: number;
  code: string;
  title: string;
  summary: string;
  actualResult: string;
  httpStatus: number;
  passed: boolean;
}

export interface Storage9ScenariosQaReport {
  runId: string;
  executedAt: string;
  sandboxSchoolId: string;
  storageBucket: string;
  officialDataPreserved: boolean;
  totalScenarios: number;
  passedScenarios: number;
  allPassed: boolean;
  scenarios: Storage9ScenarioQaItem[];
}

export async function listStorageFilesService(
  schoolId: string,
  includeSoftDeleted = true
): Promise<FirestoreFileAssetMetadata[]> {
  try {
    const res = await fetch(
      `/api/firebase/storage/list?schoolId=${encodeURIComponent(
        schoolId
      )}&includeSoftDeleted=${includeSoftDeleted ? 'true' : 'false'}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.files) ? data.files : [];
  } catch {
    return [];
  }
}

export async function run9StorageQaScenariosService(): Promise<Storage9ScenariosQaReport | null> {
  try {
    const res = await fetch('/api/firebase/storage/run-9-storage-qa-scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.report || null;
  } catch {
    return null;
  }
}

