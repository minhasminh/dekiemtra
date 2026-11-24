import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseClient';
import { FirestoreOperationType } from '../firebase/firestoreDatabaseService';

// ============================================================================
// CHUẨN XỬ LÝ LỖI FIRESTORE THEO FIREBASE INTEGRATION SKILL
// ============================================================================

export interface FirestoreErrorInfo {
  error: string;
  operationType: FirestoreOperationType;
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
  operationType: FirestoreOperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// MỤC I: RÀ SOÁT HIỆN TRẠNG 16 MODULE TRONG HỆ THỐNG EDU TEST AI
// ============================================================================

export interface ModuleDataSourceAuditRow {
  moduleOrder: number;
  moduleCode: string;
  moduleName: string;
  dalRepositoryName: string;
  firestoreCollectionPath: string;
  inReactState: string;
  inLocalStorage: string;
  inSampleSeedData: string;
  inCloudFirestore: string;
  inOtherSource: string;
  crudAndPaginationReady: boolean;
  autoSaveSupported: boolean;
  migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE' | 'ĐANG CHUYỂN ĐỔI';
}

export const STAGE17_16_MODULES_AUDIT: ModuleDataSourceAuditRow[] = [
  {
    moduleOrder: 1,
    moduleCode: 'MOD_01_ACCOUNTS',
    moduleName: '1. Tài khoản giáo viên & cán bộ',
    dalRepositoryName: 'userRepository',
    firestoreCollectionPath: 'schools/{schoolId}/users/{userId}',
    inReactState: 'Bộ đệm danh sách tài khoản trang hiện tại & bộ lọc tìm kiếm',
    inLocalStorage: 'Không lưu hồ sơ hay mật khẩu trong localStorage',
    inSampleSeedData: '59 tài khoản chuẩn của trường (khởi tạo ban đầu)',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/users/{userId} (tách PII sang /users/{userId}/private/pii)',
    inOtherSource: 'Mật khẩu băm PBKDF2-SHA256-100000 chỉ lưu tại Backend Auth Store',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 2,
    moduleCode: 'MOD_02_DEPARTMENTS',
    moduleName: '2. Tổ chuyên môn',
    dalRepositoryName: 'departmentRepository',
    firestoreCollectionPath: 'schools/{schoolId}/departments/{departmentId}',
    inReactState: 'Trạng thái chọn tổ, modal gán tổ trưởng/tổ phó',
    inLocalStorage: 'Không sử dụng',
    inSampleSeedData: '6 tổ chuyên môn mặc định chuẩn của trường',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/departments/{departmentId}',
    inOtherSource: 'Đồng bộ Multi-Tenant Server DB',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 3,
    moduleCode: 'MOD_03_TEACHING_ASSIGNMENTS',
    moduleName: '3. Phân công giảng dạy',
    dalRepositoryName: 'departmentRepository',
    firestoreCollectionPath: 'schools/{schoolId}/teachingAssignments/{assignmentId}',
    inReactState: 'Bảng lọc phân công theo năm học, cấp học, môn, khối lớp',
    inLocalStorage: 'Không sử dụng',
    inSampleSeedData: 'Danh mục phân công chuẩn theo 6 tổ chuyên môn',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/teachingAssignments/{assignmentId}',
    inOtherSource: 'Đồng bộ trực tiếp với tài khoản và phạm vi phân quyền',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 4,
    moduleCode: 'MOD_04_PERMISSIONS',
    moduleName: '4. Phân quyền & Mẫu phân quyền giáo viên',
    dalRepositoryName: 'permissionRepository',
    firestoreCollectionPath: 'schools/{schoolId}/permissions/{permissionId}',
    inReactState: 'Ma trận checkbox phân quyền & xem trước mẫu quyền',
    inLocalStorage: 'Không sử dụng',
    inSampleSeedData: '6 mẫu phân quyền chuẩn (GVBM, GVCN, TTCM, GVPB, PHT, HT)',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/permissions & teacherPermissionTemplates',
    inOtherSource: 'Thực thi đồng thời trên Firestore Security Rules & Backend RBAC Middleware',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 5,
    moduleCode: 'MOD_05_CURRICULUM',
    moduleName: '5. Chương trình giáo dục (GDPT 2018)',
    dalRepositoryName: 'curriculumRepository',
    firestoreCollectionPath: 'schools/{schoolId}/curriculum/{curriculumId}',
    inReactState: 'Cây chọn cấp học -> khối lớp -> môn học -> chủ đề -> YCCĐ',
    inLocalStorage: 'Đã ngừng dùng làm nguồn chính (chỉ đọc di trú 1 lần nếu có)',
    inSampleSeedData: 'SEED_CURRICULUM_TOPICS (Thông tư 32/2018 & Thông tư 27/2020)',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/curriculum/{curriculumId}',
    inOtherSource: 'Kho ngữ liệu chuẩn đọc hiểu (/schools/{schoolId}/corpus_items)',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 6,
    moduleCode: 'MOD_06_QUESTION_BANK',
    moduleName: '6. Ngân hàng câu hỏi chuẩn hóa',
    dalRepositoryName: 'questionRepository',
    firestoreCollectionPath: 'schools/{schoolId}/questions/{questionId} (+ /versions/{versionId})',
    inReactState: 'Danh sách câu hỏi đang lọc, biểu mẫu soạn câu hỏi',
    inLocalStorage: 'Chỉ dùng cho hàng đợi khôi phục mất mạng (offlineMutationQueue)',
    inSampleSeedData: 'SEED_QUESTIONS & SEED_QUESTION_GROUPS',
    inCloudFirestore: 'Mỗi câu hỏi là 1 document tại schools/{schoolId}/questions + lịch sử bất biến tại subcollection versions',
    inOtherSource: 'Hình ảnh/âm thanh lưu trên Firebase Storage qua mediaStoragePath',
    crudAndPaginationReady: true,
    autoSaveSupported: true,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 7,
    moduleCode: 'MOD_07_AI_QUESTION_GENERATOR',
    moduleName: '7. AI tạo câu hỏi theo YCCĐ & Ngữ liệu',
    dalRepositoryName: 'questionRepository',
    firestoreCollectionPath: 'schools/{schoolId}/questions/{questionId}',
    inReactState: 'Đợt sinh câu hỏi nháp (AIGenerationBatch) trước khi duyệt lưu vào ngân hàng',
    inLocalStorage: 'Chỉ lưu tạm hàng đợi khi mất mạng',
    inSampleSeedData: 'Mẫu cấu hình prompt chuẩn GDPT 2018',
    inCloudFirestore: 'Lưu đợt tạo và câu hỏi đã chọn vào schools/{schoolId}/questions',
    inOtherSource: 'Gọi Gemini API qua Backend Proxy (/api/gemini/*, /api/corpus/generate-questions) - ẩn 100% API Key',
    crudAndPaginationReady: true,
    autoSaveSupported: true,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 8,
    moduleCode: 'MOD_08_EXAM_MATRIX',
    moduleName: '8. Ma trận đề kiểm tra định kỳ',
    dalRepositoryName: 'matrixRepository',
    firestoreCollectionPath: 'schools/{schoolId}/matrices/{matrixId}',
    inReactState: 'Bảng lưới thiết kế ma trận, tỷ lệ mức độ nhận thức & kiểm tra tổng điểm',
    inLocalStorage: 'Chỉ dùng cho hàng đợi khôi phục mất mạng (offlineMutationQueue)',
    inSampleSeedData: 'SEED_MATRICES & mẫu cấu trúc tổ chuyên môn (CV 7991 / TT 27)',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/matrices/{matrixId} kèm kiểm soát phiên bản',
    inOtherSource: 'Đồng bộ liên kết với ExamWorkflows',
    crudAndPaginationReady: true,
    autoSaveSupported: true,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 9,
    moduleCode: 'MOD_09_SPECIFICATION',
    moduleName: '9. Bản đặc tả đề kiểm tra',
    dalRepositoryName: 'matrixRepository',
    firestoreCollectionPath: 'schools/{schoolId}/specifications/{specificationId}',
    inReactState: 'Các dòng đặc tả YCCĐ gắn với từng ô ma trận',
    inLocalStorage: 'Chỉ dùng cho hàng đợi khôi phục mất mạng',
    inSampleSeedData: 'Bản đặc tả chuẩn đi kèm SEED_MATRICES',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/specifications/{specificationId} (liên kết matrixId)',
    inOtherSource: 'Đồng bộ 1-1 với phiên bản Ma trận đề',
    crudAndPaginationReady: true,
    autoSaveSupported: true,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 10,
    moduleCode: 'MOD_10_EXAM_BUILDER',
    moduleName: '10. Tạo đề kiểm tra & Sinh mã đề hoán vị',
    dalRepositoryName: 'examRepository',
    firestoreCollectionPath: 'schools/{schoolId}/exams/{examId} (+ /versions/{versionId})',
    inReactState: 'Trình soạn thảo đề, danh sách mã đề hoán vị (101, 102, 103, 104)',
    inLocalStorage: 'Chỉ dùng cho hàng đợi khôi phục mất mạng (offlineMutationQueue)',
    inSampleSeedData: 'SEED_EXAMS',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/exams/{examId} + subcollection versions bất biến',
    inOtherSource: 'Tệp đề xuất bản lưu trên Firebase Storage qua exportedFileStoragePath',
    crudAndPaginationReady: true,
    autoSaveSupported: true,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 11,
    moduleCode: 'MOD_11_AI_QUALITY_REVIEW',
    moduleName: '11. AI kiểm tra chất lượng đề (Lớp A + Lớp B)',
    dalRepositoryName: 'reviewRepository',
    firestoreCollectionPath: 'schools/{schoolId}/aiReviews/{reviewId}',
    inReactState: 'Báo cáo phát hiện lỗi và đề xuất chỉnh sửa từng câu hỏi',
    inLocalStorage: 'Không sử dụng',
    inSampleSeedData: 'Bộ quy tắc kiểm định Toán/Tiếng Việt/KHTN chuẩn',
    inCloudFirestore: 'Lưu chính thức báo cáo tại schools/{schoolId}/aiReviews/{reviewId} gắn với examId & testedVersion',
    inOtherSource: 'Backend Gemini Quality Review Engine (/api/ai-quality-review) có chặn gửi đề mật trái phép',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 12,
    moduleCode: 'MOD_12_PROFESSIONAL_REVIEW',
    moduleName: '12. Thẩm định & Phản biện chuyên môn',
    dalRepositoryName: 'reviewRepository',
    firestoreCollectionPath: 'schools/{schoolId}/approvals/{approvalId}',
    inReactState: 'Phiếu nhận xét thẩm định của Tổ trưởng / Giáo viên phản biện',
    inLocalStorage: 'Không sử dụng',
    inSampleSeedData: 'Mẫu biên bản phản biện tổ chuyên môn',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/approvals & reviewRecords',
    inOtherSource: 'Ghi nhật ký bất biến vào schools/{schoolId}/auditLogs',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 13,
    moduleCode: 'MOD_13_APPROVAL',
    moduleName: '13. Phê duyệt hồ sơ kiểm tra (Tổ trưởng / Ban Giám hiệu)',
    dalRepositoryName: 'reviewRepository',
    firestoreCollectionPath: 'schools/{schoolId}/approvals/{approvalId}',
    inReactState: 'Hàng đợi hồ sơ chờ phê duyệt & hộp thoại ký duyệt/yêu cầu sửa',
    inLocalStorage: 'Không sử dụng',
    inSampleSeedData: 'Lịch sử phê duyệt mẫu',
    inCloudFirestore: 'Lưu quyết định phê duyệt tại schools/{schoolId}/approvals/{approvalId}',
    inOtherSource: 'Firestore Rules chặn tuyệt đối client thường tự ghi status = APPROVED',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 14,
    moduleCode: 'MOD_14_DOSSIER_EXPORT',
    moduleName: '14. Xuất hồ sơ kiểm tra định kỳ (Word/PDF/Excel/ZIP)',
    dalRepositoryName: 'resultRepository',
    firestoreCollectionPath: 'schools/{schoolId}/auditLogs/{logId}',
    inReactState: 'Cấu hình mẫu quốc hiệu, tiêu đề trường, tùy chọn xuất 10 tài liệu',
    inLocalStorage: 'Không lưu tệp xuất trong localStorage',
    inSampleSeedData: 'Mẫu biểu xuất hồ sơ chuẩn của trường',
    inCloudFirestore: 'Lưu siêu dữ liệu đường dẫn tệp (exportedFileStoragePath) & nhật ký xuất tại auditLogs',
    inOtherSource: 'Lưu tệp nhị phân DOCX/PDF/XLSX trên Firebase Storage (taodeai-513007.firebasestorage.app)',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 15,
    moduleCode: 'MOD_15_RESULT_ANALYSIS',
    moduleName: '15. Phân tích kết quả kiểm tra & Thống kê CTT',
    dalRepositoryName: 'resultRepository',
    firestoreCollectionPath: 'schools/{schoolId}/examResults/{resultId}',
    inReactState: 'Biểu đồ phổ điểm, bảng độ khó (P) và độ phân biệt (D)',
    inLocalStorage: 'Không sử dụng',
    inSampleSeedData: 'SEED_EXAM_ANALYTICS',
    inCloudFirestore: 'Lưu chính thức chỉ số tổng hợp tại schools/{schoolId}/examResults/{resultId}',
    inOtherSource: 'Liên kết ngược về Ngân hàng câu hỏi để gợi ý hiệu chỉnh câu hỏi',
    crudAndPaginationReady: true,
    autoSaveSupported: false,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
  {
    moduleOrder: 16,
    moduleCode: 'MOD_16_NINE_STEP_WORKFLOW',
    moduleName: '16. Quy trình khảo thí 9 bước khép kín',
    dalRepositoryName: 'workflowRepository',
    firestoreCollectionPath: 'schools/{schoolId}/examWorkflows/{workflowId}',
    inReactState: 'Thanh tiến độ 9 bước & trạng thái máy trạng thái (State Machine)',
    inLocalStorage: 'Chỉ dùng cho hàng đợi khôi phục mất mạng',
    inSampleSeedData: 'Hồ sơ quy trình mẫu',
    inCloudFirestore: 'Lưu chính thức tại schools/{schoolId}/examWorkflows/{workflowId} (liên kết toàn bộ ID hồ sơ)',
    inOtherSource: 'Hỗ trợ 6 truy vấn Composite Index (theo người tạo, tổ CM, chờ duyệt, tiến độ toàn trường)',
    crudAndPaginationReady: true,
    autoSaveSupported: true,
    migrationStatus: 'ĐÃ CHUYỂN SANG FIRESTORE',
  },
];

// ============================================================================
// MỤC II & III: DATA ACCESS LAYER (DAL) & CHUẨN CRUD + SOFT DELETE + PAGINATION
// ============================================================================

export type DalSaveStatus =
  | 'IDLE'
  | 'UNSAVED'
  | 'SAVING'
  | 'SAVED_SERVER'
  | 'OFFLINE_CACHED'
  | 'CONFLICT'
  | 'ERROR';

export interface DalActorContext {
  schoolId: string;
  actorUserId: string;
  actorName: string;
  actorRole: string;
  permissions?: string[];
  deviceId?: string;
}

export interface DalPaginationParams {
  page?: number;
  pageSize?: number;
  cursorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DalPaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  nextCursorId: string | null;
  source: 'FIRESTORE_AND_CENTRAL_SERVER' | 'OFFLINE_CACHE';
}

export interface DalMutationResult<T> {
  ok: boolean;
  saveStatus: DalSaveStatus;
  serverConfirmed: boolean;
  record: T | null;
  version: number;
  updatedAt: string;
  message: string;
  conflictDetails?: {
    hasConflict: boolean;
    baseVersionSent: number;
    currentServerVersion: number;
    lastModifiedBy: string;
    lastModifiedAt: string;
    serverRecord: T;
    localAttemptedPatch: Partial<T>;
  };
}

export interface DalBaseEntity {
  id: string;
  schoolId: string;
  status: string;
  version: number;
  isSoftDeleted?: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface OfflineQueuedMutation {
  queueId: string;
  repositoryName: string;
  collectionName: string;
  operation: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'AUTO_SAVE_DRAFT';
  schoolId: string;
  recordId: string;
  payload: Record<string, unknown>;
  baseVersion?: number;
  actorContext: DalActorContext;
  queuedAt: string;
  retryCount: number;
  lastError?: string;
}

export interface DalGlobalSyncState {
  saveStatus: DalSaveStatus;
  networkState: 'ONLINE' | 'OFFLINE';
  simulatedOfflineMode: boolean;
  lastServerConfirmedAt: string | null;
  lastStatusMessage: string;
  pendingOfflineMutations: OfflineQueuedMutation[];
  activeConflicts: Array<{
    conflictId: string;
    repositoryName: string;
    recordId: string;
    detectedAt: string;
    baseVersionSent: number;
    currentServerVersion: number;
    lastModifiedBy: string;
    serverRecord: Record<string, unknown>;
    localDraft: Record<string, unknown>;
  }>;
}

const OFFLINE_QUEUE_STORAGE_KEY = 'edutest_stage17_dal_offline_mutation_queue';

class DalSyncStateManager {
  private state: DalGlobalSyncState = {
    saveStatus: 'IDLE',
    networkState:
      typeof window !== 'undefined' && window.navigator.onLine === false ? 'OFFLINE' : 'ONLINE',
    simulatedOfflineMode: false,
    lastServerConfirmedAt: null,
    lastStatusMessage: 'Đã kết nối Cloud Firestore & Kho lưu trữ tập trung.',
    pendingOfflineMutations: [],
    activeConflicts: [],
  };

  private listeners = new Set<(state: DalGlobalSyncState) => void>();

  constructor() {
    this.loadOfflineQueueFromDisk();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (!this.state.simulatedOfflineMode) {
          this.updateState({
            networkState: 'ONLINE',
            lastStatusMessage: 'Đã có mạng trở lại. Sẵn sàng đồng bộ hàng đợi ngoại tuyến.',
          });
        }
      });
      window.addEventListener('offline', () => {
        this.updateState({
          networkState: 'OFFLINE',
          saveStatus:
            this.state.pendingOfflineMutations.length > 0 ? 'OFFLINE_CACHED' : this.state.saveStatus,
          lastStatusMessage:
            'Đang mất kết nối mạng (Offline). Mọi thay đổi sẽ được giữ trong bộ đệm tạm thời tại máy trạm, chưa lưu lên máy chủ.',
        });
      });
    }
  }

  private loadOfflineQueueFromDisk() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.state.pendingOfflineMutations = parsed;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private persistOfflineQueueToDisk() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          OFFLINE_QUEUE_STORAGE_KEY,
          JSON.stringify(this.state.pendingOfflineMutations)
        );
      }
    } catch {
      // ignore
    }
  }

  public getState(): DalGlobalSyncState {
    return {
      ...this.state,
      pendingOfflineMutations: [...this.state.pendingOfflineMutations],
      activeConflicts: [...this.state.activeConflicts],
    };
  }

  public subscribe(listener: (state: DalGlobalSyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public updateState(patch: Partial<DalGlobalSyncState>) {
    this.state = {
      ...this.state,
      ...patch,
    };
    this.persistOfflineQueueToDisk();
    const snapshot = this.getState();
    this.listeners.forEach((fn) => fn(snapshot));
  }

  public setSimulatedOfflineMode(offline: boolean) {
    this.updateState({
      simulatedOfflineMode: offline,
      networkState: offline ? 'OFFLINE' : 'ONLINE',
      lastStatusMessage: offline
        ? 'Đang bật chế độ mô phỏng mất mạng (Offline). Dữ liệu mới sẽ chỉ lưu vào bộ đệm cục bộ, KHÔNG báo đã lưu lên máy chủ.'
        : 'Đã tắt mô phỏng mất mạng (Online). Có thể thử lại đồng bộ lên Cloud Firestore.',
    });
  }

  public isEffectivelyOffline(): boolean {
    if (this.state.simulatedOfflineMode) return true;
    if (typeof window !== 'undefined' && window.navigator.onLine === false) return true;
    return false;
  }

  public enqueueOfflineMutation(mutation: OfflineQueuedMutation) {
    // Hợp nhất nếu cùng recordId và repositoryName đang chờ trong hàng đợi
    const existingIdx = this.state.pendingOfflineMutations.findIndex(
      (m) => m.repositoryName === mutation.repositoryName && m.recordId === mutation.recordId
    );
    const updatedQueue = [...this.state.pendingOfflineMutations];
    if (existingIdx >= 0) {
      updatedQueue[existingIdx] = {
        ...updatedQueue[existingIdx],
        payload: {
          ...updatedQueue[existingIdx].payload,
          ...mutation.payload,
        },
        queuedAt: mutation.queuedAt,
      };
    } else {
      updatedQueue.push(mutation);
    }

    this.updateState({
      saveStatus: 'OFFLINE_CACHED',
      networkState: 'OFFLINE',
      pendingOfflineMutations: updatedQueue,
      lastStatusMessage: `Đang ngoại tuyến: Bản ghi [${mutation.recordId}] mới được giữ trong bộ nhớ đệm tạm thời (${updatedQueue.length} thao tác chờ mạng), CHƯA lưu lên máy chủ Firestore.`,
    });
  }

  public registerConflict(conflict: DalGlobalSyncState['activeConflicts'][number]) {
    const filtered = this.state.activeConflicts.filter((c) => c.recordId !== conflict.recordId);
    this.updateState({
      saveStatus: 'CONFLICT',
      activeConflicts: [conflict, ...filtered],
      lastStatusMessage: `CẢNH BÁO XUNG ĐỘT: Hồ sơ [${conflict.recordId}] đã được cập nhật lên phiên bản v${conflict.currentServerVersion} bởi ${conflict.lastModifiedBy}. Hệ thống đã chặn ghi đè để bảo vệ nội dung của cả hai người dùng!`,
    });
  }

  public resolveConflict(recordId: string) {
    this.updateState({
      activeConflicts: this.state.activeConflicts.filter((c) => c.recordId !== recordId),
      saveStatus: 'IDLE',
    });
  }
}

export const dalSyncStateManager = new DalSyncStateManager();

// ============================================================================
// LỚP CƠ SỞ REPOSITORY TRUNG TÂM (CENTRAL FIRESTORE REPOSITORY)
// ============================================================================

export class FirestoreScopedRepository<T extends DalBaseEntity = DalBaseEntity> {
  public readonly repositoryName: string;
  public readonly collectionName: string;
  public readonly vietnameseLabel: string;
  private readonly requiredWritePermission?: string;
  private readonly disallowSelfApproval: boolean;

  constructor(config: {
    repositoryName: string;
    collectionName: string;
    vietnameseLabel: string;
    requiredWritePermission?: string;
    disallowSelfApproval?: boolean;
  }) {
    this.repositoryName = config.repositoryName;
    this.collectionName = config.collectionName;
    this.vietnameseLabel = config.vietnameseLabel;
    this.requiredWritePermission = config.requiredWritePermission;
    this.disallowSelfApproval = Boolean(config.disallowSelfApproval);
  }

  private validateActorPermission(
    operation: 'CREATE' | 'UPDATE' | 'SOFT_DELETE',
    payload: Record<string, unknown>,
    ctx: DalActorContext
  ): { allowed: boolean; reason?: string } {
    if (!ctx.schoolId || !ctx.schoolId.trim()) {
      return { allowed: false, reason: 'Thiếu mã trường học (schoolId) khi thực hiện thao tác dữ liệu.' };
    }
    if (!ctx.actorUserId || !ctx.actorUserId.trim()) {
      return { allowed: false, reason: 'Người dùng chưa xác thực (thiếu actorUserId).' };
    }
    if (payload.schoolId && String(payload.schoolId) !== ctx.schoolId) {
      return {
        allowed: false,
        reason: `Vi phạm cô lập đa trường: Không được phép thao tác dữ liệu của trường [${payload.schoolId}] từ tài khoản thuộc trường [${ctx.schoolId}].`,
      };
    }

    const isLeadership = ['SYSTEM_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_OF_DEPARTMENT'].includes(
      String(ctx.actorRole || '').toUpperCase()
    );

    if (
      this.disallowSelfApproval &&
      !isLeadership &&
      (payload.status === 'APPROVED' || payload.status === 'PUBLISHED')
    ) {
      return {
        allowed: false,
        reason:
          'Vi phạm phân quyền phê duyệt: Giáo viên soạn thảo không được tự chuyển trạng thái hồ sơ sang ĐÃ PHÊ DUYỆT (APPROVED) hoặc PHÁT HÀNH (PUBLISHED).',
      };
    }

    if (
      this.requiredWritePermission &&
      !isLeadership &&
      Array.isArray(ctx.permissions) &&
      ctx.permissions.length > 0 &&
      !ctx.permissions.includes(this.requiredWritePermission)
    ) {
      return {
        allowed: false,
        reason: `Tài khoản chưa được cấp quyền chức năng [${this.requiredWritePermission}] trên ${this.vietnameseLabel}.`,
      };
    }

    void operation;
    return { allowed: true };
  }

  private validateInputPayload(
    id: string,
    payload: Record<string, unknown>,
    ctx: DalActorContext
  ): { valid: boolean; reason?: string } {
    if (!id || id.includes('@') || id.includes(' ') || id.length > 128) {
      return {
        valid: false,
        reason: `Khóa chính [${id}] không hợp lệ. Nguyên tắc thiết kế: Mỗi bản ghi phải có ID ổn định, không dùng email hoặc họ tên làm khóa chính.`,
      };
    }
    if ('password' in payload || 'rawPassword' in payload || 'plainPassword' in payload) {
      return {
        valid: false,
        reason: 'Vi phạm bảo mật: Tuyệt đối không lưu mật khẩu vào Cloud Firestore.',
      };
    }
    const serializedSize = JSON.stringify(payload).length;
    if (serializedSize > 900_000) {
      return {
        valid: false,
        reason: `Kích thước document (${Math.round(serializedSize / 1024)} KB) vượt ngưỡng an toàn của Firestore. Không lưu trực tiếp tệp PDF, Word hoặc hình ảnh lớn trong Firestore.`,
      };
    }
    void ctx;
    return { valid: true };
  }

  /**
   * 1. CREATE: Tạo bản ghi mới với kiểm tra quyền, kiểm tra dữ liệu đầu vào và xác nhận từ Firestore/Server
   */
  public async create(
    input: Partial<T> & { id?: string },
    ctx: DalActorContext
  ): Promise<DalMutationResult<T>> {
    const nowIso = new Date().toISOString();
    const recordId =
      input.id && String(input.id).trim()
        ? String(input.id).trim()
        : `${this.collectionName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const normalizedRecord: DalBaseEntity = {
      ...input,
      id: recordId,
      schoolId: ctx.schoolId,
      status: String(input.status || 'ACTIVE'),
      version: Number(input.version || 1),
      isSoftDeleted: false,
      createdBy: String(input.createdBy || ctx.actorUserId),
      updatedBy: ctx.actorUserId,
      createdAt: String(input.createdAt || nowIso),
      updatedAt: nowIso,
    };

    const permCheck = this.validateActorPermission('CREATE', normalizedRecord, ctx);
    if (!permCheck.allowed) {
      dalSyncStateManager.updateState({
        saveStatus: 'ERROR',
        lastStatusMessage: permCheck.reason || 'Từ chối truy cập.',
      });
      return {
        ok: false,
        saveStatus: 'ERROR',
        serverConfirmed: false,
        record: null,
        version: 0,
        updatedAt: nowIso,
        message: permCheck.reason || 'Không đủ quyền thực hiện thao tác.',
      };
    }

    const inputCheck = this.validateInputPayload(recordId, normalizedRecord, ctx);
    if (!inputCheck.valid) {
      dalSyncStateManager.updateState({
        saveStatus: 'ERROR',
        lastStatusMessage: inputCheck.reason || 'Dữ liệu đầu vào không hợp lệ.',
      });
      return {
        ok: false,
        saveStatus: 'ERROR',
        serverConfirmed: false,
        record: null,
        version: 0,
        updatedAt: nowIso,
        message: inputCheck.reason || 'Dữ liệu đầu vào không hợp lệ.',
      };
    }

    dalSyncStateManager.updateState({
      saveStatus: 'SAVING',
      lastStatusMessage: `Đang lưu ${this.vietnameseLabel} [${recordId}] lên Cloud Firestore...`,
    });

    if (dalSyncStateManager.isEffectivelyOffline()) {
      dalSyncStateManager.enqueueOfflineMutation({
        queueId: `qmut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        repositoryName: this.repositoryName,
        collectionName: this.collectionName,
        operation: 'CREATE',
        schoolId: ctx.schoolId,
        recordId,
        payload: normalizedRecord,
        actorContext: ctx,
        queuedAt: nowIso,
        retryCount: 0,
      });
      return {
        ok: false,
        saveStatus: 'OFFLINE_CACHED',
        serverConfirmed: false,
        record: normalizedRecord as T,
        version: normalizedRecord.version,
        updatedAt: nowIso,
        message:
          'Đang mất mạng (Offline): Dữ liệu mới chỉ được giữ trong bộ nhớ đệm tạm thời tại máy trạm, CHƯA được xác nhận lưu trên máy chủ Firestore.',
      };
    }

    try {
      // Nếu người dùng đã đăng nhập Google OAuth trên Firebase Client, đồng bộ trực tiếp lên Cloud Firestore SDK
      if (auth?.currentUser) {
        const fsPath = `schools/${ctx.schoolId}/${this.collectionName}/${recordId}`;
        try {
          await setDoc(doc(db, 'schools', ctx.schoolId, this.collectionName, recordId), normalizedRecord, {
            merge: true,
          });
        } catch (fsErr) {
          // Nếu lỗi phân quyền Firestore Rules khi gọi trực tiếp SDK thì ghi nhận qua handleFirestoreError
          if (
            fsErr instanceof Error &&
            fsErr.message.toLowerCase().includes('missing or insufficient permissions')
          ) {
            try {
              handleFirestoreError(fsErr, FirestoreOperationType.CREATE, fsPath);
            } catch {
              // Tiếp tục đồng bộ qua Backend DAL Gateway được ủy quyền
            }
          }
        }
      }

      const res = await fetch(`/api/firebase/dal/${this.repositoryName}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: ctx.schoolId,
          collectionName: this.collectionName,
          record: normalizedRecord,
          actorContext: ctx,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const confirmedRecord = (data.record || normalizedRecord) as T;
      dalSyncStateManager.updateState({
        saveStatus: 'SAVED_SERVER',
        networkState: 'ONLINE',
        lastServerConfirmedAt: data.confirmedAt || nowIso,
        lastStatusMessage: `Cloud Firestore đã xác nhận lưu thành công ${this.vietnameseLabel} [${recordId}] (v${confirmedRecord.version}).`,
      });

      return {
        ok: true,
        saveStatus: 'SAVED_SERVER',
        serverConfirmed: true,
        record: confirmedRecord,
        version: confirmedRecord.version,
        updatedAt: confirmedRecord.updatedAt,
        message: `Đã lưu thành công ${this.vietnameseLabel} [${recordId}] lên Cloud Firestore.`,
      };
    } catch (err) {
      dalSyncStateManager.enqueueOfflineMutation({
        queueId: `qmut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        repositoryName: this.repositoryName,
        collectionName: this.collectionName,
        operation: 'CREATE',
        schoolId: ctx.schoolId,
        recordId,
        payload: normalizedRecord,
        actorContext: ctx,
        queuedAt: nowIso,
        retryCount: 0,
        lastError: err instanceof Error ? err.message : String(err),
      });
      return {
        ok: false,
        saveStatus: 'OFFLINE_CACHED',
        serverConfirmed: false,
        record: normalizedRecord as T,
        version: normalizedRecord.version,
        updatedAt: nowIso,
        message:
          'Không thể kết nối máy chủ lúc này. Dữ liệu đang soạn đã được giữ an toàn trong bộ đệm khôi phục ngoại tuyến (chưa lưu lên máy chủ).',
      };
    }
  }

  /**
   * 2. READ: Đọc chi tiết 1 bản ghi theo ID ổn định từ Cloud Firestore / Central DAL
   */
  public async read(id: string, ctx: DalActorContext): Promise<T | null> {
    if (!id || !ctx.schoolId) return null;

    if (auth?.currentUser && !dalSyncStateManager.isEffectivelyOffline()) {
      try {
        const snap = await getDoc(doc(db, 'schools', ctx.schoolId, this.collectionName, id));
        if (snap.exists()) {
          const data = snap.data() as T;
          if (!data.isSoftDeleted) {
            return data;
          }
        }
      } catch {
        // Fallback sang Central DAL Gateway
      }
    }

    try {
      const res = await fetch(`/api/firebase/dal/${this.repositoryName}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: ctx.schoolId,
          collectionName: this.collectionName,
          id,
          actorContext: ctx,
        }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return (json.record as T) || null;
    } catch {
      return null;
    }
  }

  /**
   * 3. UPDATE: Cập nhật bản ghi có kiểm soát phiên bản (Optimistic Concurrency Control)
   * Không bao giờ ghi đè âm thầm thay đổi của người dùng khác nếu baseVersion < currentServerVersion!
   */
  public async update(
    id: string,
    patch: Partial<T>,
    ctx: DalActorContext,
    options?: {
      baseVersion?: number;
      forceResolveConflict?: boolean;
      changeNote?: string;
    }
  ): Promise<DalMutationResult<T>> {
    const nowIso = new Date().toISOString();
    const permCheck = this.validateActorPermission('UPDATE', patch as Record<string, unknown>, ctx);
    if (!permCheck.allowed) {
      dalSyncStateManager.updateState({
        saveStatus: 'ERROR',
        lastStatusMessage: permCheck.reason || 'Từ chối cập nhật.',
      });
      return {
        ok: false,
        saveStatus: 'ERROR',
        serverConfirmed: false,
        record: null,
        version: 0,
        updatedAt: nowIso,
        message: permCheck.reason || 'Không có quyền cập nhật bản ghi này.',
      };
    }

    const inputCheck = this.validateInputPayload(id, patch as Record<string, unknown>, ctx);
    if (!inputCheck.valid) {
      return {
        ok: false,
        saveStatus: 'ERROR',
        serverConfirmed: false,
        record: null,
        version: 0,
        updatedAt: nowIso,
        message: inputCheck.reason || 'Dữ liệu cập nhật không hợp lệ.',
      };
    }

    dalSyncStateManager.updateState({
      saveStatus: 'SAVING',
      lastStatusMessage: `Đang lưu cập nhật ${this.vietnameseLabel} [${id}]...`,
    });

    if (dalSyncStateManager.isEffectivelyOffline()) {
      dalSyncStateManager.enqueueOfflineMutation({
        queueId: `qmut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        repositoryName: this.repositoryName,
        collectionName: this.collectionName,
        operation: 'UPDATE',
        schoolId: ctx.schoolId,
        recordId: id,
        payload: patch as Record<string, unknown>,
        baseVersion: options?.baseVersion,
        actorContext: ctx,
        queuedAt: nowIso,
        retryCount: 0,
      });
      return {
        ok: false,
        saveStatus: 'OFFLINE_CACHED',
        serverConfirmed: false,
        record: null,
        version: options?.baseVersion || 1,
        updatedAt: nowIso,
        message:
          'Đang mất mạng (Offline): Thay đổi mới chỉ nằm trong bộ nhớ đệm tạm thời, CHƯA lưu lên máy chủ Firestore. Sẽ tự động thử lại khi có mạng.',
      };
    }

    try {
      const res = await fetch(`/api/firebase/dal/${this.repositoryName}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: ctx.schoolId,
          collectionName: this.collectionName,
          id,
          patch,
          baseVersion: options?.baseVersion,
          forceResolveConflict: Boolean(options?.forceResolveConflict),
          changeNote: options?.changeNote || 'Cập nhật dữ liệu qua Data Access Layer',
          actorContext: ctx,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data.conflictDetails) {
        dalSyncStateManager.registerConflict({
          conflictId: `conf_${id}_${Date.now()}`,
          repositoryName: this.repositoryName,
          recordId: id,
          detectedAt: nowIso,
          baseVersionSent: data.conflictDetails.baseVersionSent,
          currentServerVersion: data.conflictDetails.currentServerVersion,
          lastModifiedBy: data.conflictDetails.lastModifiedBy,
          serverRecord: data.conflictDetails.serverRecord,
          localDraft: patch as Record<string, unknown>,
        });
        return {
          ok: false,
          saveStatus: 'CONFLICT',
          serverConfirmed: false,
          record: data.conflictDetails.serverRecord as T,
          version: data.conflictDetails.currentServerVersion,
          updatedAt: data.conflictDetails.lastModifiedAt || nowIso,
          message:
            data.message ||
            `Phát hiện xung đột phiên bản: Người dùng khác (${data.conflictDetails.lastModifiedBy}) đã lưu phiên bản v${data.conflictDetails.currentServerVersion}. Hệ thống không ghi đè để bảo vệ dữ liệu!`,
          conflictDetails: data.conflictDetails,
        };
      }

      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      const confirmedRecord = data.record as T;
      if (auth?.currentUser && confirmedRecord) {
        try {
          await setDoc(
            doc(db, 'schools', ctx.schoolId, this.collectionName, id),
            confirmedRecord,
            { merge: true }
          );
        } catch {
          // ignore client mirror error if rules restrict
        }
      }

      dalSyncStateManager.updateState({
        saveStatus: 'SAVED_SERVER',
        networkState: 'ONLINE',
        lastServerConfirmedAt: data.confirmedAt || nowIso,
        lastStatusMessage: `Cloud Firestore đã xác nhận cập nhật ${this.vietnameseLabel} [${id}] lên phiên bản v${confirmedRecord.version}.`,
      });

      return {
        ok: true,
        saveStatus: 'SAVED_SERVER',
        serverConfirmed: true,
        record: confirmedRecord,
        version: confirmedRecord.version,
        updatedAt: confirmedRecord.updatedAt,
        message: `Đã cập nhật và xác nhận trên Cloud Firestore (Phiên bản v${confirmedRecord.version}).`,
      };
    } catch (err) {
      dalSyncStateManager.enqueueOfflineMutation({
        queueId: `qmut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        repositoryName: this.repositoryName,
        collectionName: this.collectionName,
        operation: 'UPDATE',
        schoolId: ctx.schoolId,
        recordId: id,
        payload: patch as Record<string, unknown>,
        baseVersion: options?.baseVersion,
        actorContext: ctx,
        queuedAt: nowIso,
        retryCount: 0,
        lastError: err instanceof Error ? err.message : String(err),
      });
      return {
        ok: false,
        saveStatus: 'OFFLINE_CACHED',
        serverConfirmed: false,
        record: null,
        version: options?.baseVersion || 1,
        updatedAt: nowIso,
        message:
          'Mất kết nối máy chủ khi đang lưu. Nội dung đang soạn đã được giữ trong hàng đợi ngoại tuyến (chưa lưu lên máy chủ).',
      };
    }
  }

  /**
   * 4. SOFT DELETE: Xóa mềm bản ghi (đánh dấu isSoftDeleted = true, status = SOFT_DELETED), bảo toàn lịch sử
   */
  public async softDelete(
    id: string,
    ctx: DalActorContext,
    reason = 'Xóa mềm theo yêu cầu người dùng'
  ): Promise<DalMutationResult<T>> {
    const nowIso = new Date().toISOString();
    const permCheck = this.validateActorPermission('SOFT_DELETE', { schoolId: ctx.schoolId }, ctx);
    if (!permCheck.allowed) {
      return {
        ok: false,
        saveStatus: 'ERROR',
        serverConfirmed: false,
        record: null,
        version: 0,
        updatedAt: nowIso,
        message: permCheck.reason || 'Không đủ quyền xóa bản ghi.',
      };
    }

    dalSyncStateManager.updateState({
      saveStatus: 'SAVING',
      lastStatusMessage: `Đang thực hiện xóa mềm ${this.vietnameseLabel} [${id}]...`,
    });

    try {
      const res = await fetch(`/api/firebase/dal/${this.repositoryName}/softDelete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: ctx.schoolId,
          collectionName: this.collectionName,
          id,
          reason,
          actorContext: ctx,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      dalSyncStateManager.updateState({
        saveStatus: 'SAVED_SERVER',
        lastServerConfirmedAt: nowIso,
        lastStatusMessage: `Đã xóa mềm ${this.vietnameseLabel} [${id}] trên Cloud Firestore (bảo toàn lịch sử).`,
      });
      return {
        ok: true,
        saveStatus: 'SAVED_SERVER',
        serverConfirmed: true,
        record: data.record as T,
        version: data.record?.version || 1,
        updatedAt: nowIso,
        message: `Đã đánh dấu xóa mềm bản ghi [${id}] và xác nhận từ Firestore.`,
      };
    } catch (err) {
      return {
        ok: false,
        saveStatus: 'ERROR',
        serverConfirmed: false,
        record: null,
        version: 0,
        updatedAt: nowIso,
        message: err instanceof Error ? err.message : 'Không thể xóa mềm bản ghi lúc này.',
      };
    }
  }

  /**
   * 5. LIST: Lấy danh sách bản ghi đang hoạt động (isSoftDeleted != true)
   */
  public async list(ctx: DalActorContext): Promise<T[]> {
    const result = await this.paginate({ page: 1, pageSize: 200 }, ctx);
    return result.items;
  }

  /**
   * 6. FILTER: Lọc bản ghi theo nhiều tiêu chí chuyên môn (cấp học, khối lớp, môn học, trạng thái, người tạo...)
   */
  public async filter(
    criteria: Record<string, unknown>,
    ctx: DalActorContext,
    pagination?: DalPaginationParams
  ): Promise<DalPaginatedResult<T>> {
    return this.paginate(pagination || { page: 1, pageSize: 50 }, ctx, criteria);
  }

  /**
   * 7. PAGINATION: Phân trang chuẩn có kiểm soát pageSize, cursorId, hasMore, totalCount
   */
  public async paginate(
    params: DalPaginationParams,
    ctx: DalActorContext,
    filters?: Record<string, unknown>
  ): Promise<DalPaginatedResult<T>> {
    const page = Math.max(Number(params.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(params.pageSize) || 20, 1), 200);

    if (auth?.currentUser && !dalSyncStateManager.isEffectivelyOffline()) {
      try {
        const constraints: QueryConstraint[] = [
          where('schoolId', '==', ctx.schoolId),
          orderBy('updatedAt', 'desc'),
          limit(pageSize),
        ];
        const q = query(collection(db, 'schools', ctx.schoolId, this.collectionName), ...constraints);
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docs = snap.docs
            .map((d) => d.data() as T)
            .filter((item) => !item.isSoftDeleted);
          if (docs.length > 0) {
            return {
              items: docs,
              page,
              pageSize,
              totalCount: docs.length,
              hasMore: docs.length === pageSize,
              nextCursorId: docs[docs.length - 1]?.id || null,
              source: 'FIRESTORE_AND_CENTRAL_SERVER',
            };
          }
        }
      } catch {
        // Fallback sang Central DAL Gateway
      }
    }

    try {
      const res = await fetch(`/api/firebase/dal/${this.repositoryName}/paginate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: ctx.schoolId,
          collectionName: this.collectionName,
          page,
          pageSize,
          cursorId: params.cursorId,
          sortBy: params.sortBy || 'updatedAt',
          sortOrder: params.sortOrder || 'desc',
          filters: filters || {},
          actorContext: ctx,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          items: (data.items || []) as T[],
          page: data.page || page,
          pageSize: data.pageSize || pageSize,
          totalCount: data.totalCount || 0,
          hasMore: Boolean(data.hasMore),
          nextCursorId: data.nextCursorId || null,
          source: 'FIRESTORE_AND_CENTRAL_SERVER',
        };
      }
    } catch {
      // ignore
    }

    return {
      items: [],
      page,
      pageSize,
      totalCount: 0,
      hasMore: false,
      nextCursorId: null,
      source: 'OFFLINE_CACHE',
    };
  }
}

// ============================================================================
// KHỞI TẠO 10 REPOSITORY CHUYÊN BIỆT TRONG DATA ACCESS LAYER (MỤC II)
// ============================================================================

export const userRepository = new FirestoreScopedRepository({
  repositoryName: 'userRepository',
  collectionName: 'users',
  vietnameseLabel: 'Hồ sơ Tài khoản Giáo viên',
  requiredWritePermission: 'MANAGE_USERS',
});

export const departmentRepository = new FirestoreScopedRepository({
  repositoryName: 'departmentRepository',
  collectionName: 'departments',
  vietnameseLabel: 'Tổ Chuyên môn & Phân công Giảng dạy',
  requiredWritePermission: 'MANAGE_DEPARTMENTS',
});

export const permissionRepository = new FirestoreScopedRepository({
  repositoryName: 'permissionRepository',
  collectionName: 'permissions',
  vietnameseLabel: 'Phân quyền Chuyên môn & Mẫu Quyền',
  requiredWritePermission: 'GRANT_PERMISSIONS',
});

export const curriculumRepository = new FirestoreScopedRepository({
  repositoryName: 'curriculumRepository',
  collectionName: 'curriculum',
  vietnameseLabel: 'Chương trình Giáo dục & Yêu cầu cần đạt',
});

export const questionRepository = new FirestoreScopedRepository({
  repositoryName: 'questionRepository',
  collectionName: 'questions',
  vietnameseLabel: 'Ngân hàng Câu hỏi Chuẩn hóa',
  requiredWritePermission: 'CREATE_QUESTION',
  disallowSelfApproval: true,
});

export const matrixRepository = new FirestoreScopedRepository({
  repositoryName: 'matrixRepository',
  collectionName: 'matrices',
  vietnameseLabel: 'Ma trận & Bản Đặc tả Đề kiểm tra',
  requiredWritePermission: 'CREATE_EXAM_MATRIX',
  disallowSelfApproval: true,
});

export const examRepository = new FirestoreScopedRepository({
  repositoryName: 'examRepository',
  collectionName: 'exams',
  vietnameseLabel: 'Đề Kiểm tra Định kỳ',
  requiredWritePermission: 'CREATE_EXAM_PAPER',
  disallowSelfApproval: true,
});

export const workflowRepository = new FirestoreScopedRepository({
  repositoryName: 'workflowRepository',
  collectionName: 'examWorkflows',
  vietnameseLabel: 'Hồ sơ Quy trình Khảo thí 9 Bước',
  disallowSelfApproval: true,
});

export const reviewRepository = new FirestoreScopedRepository({
  repositoryName: 'reviewRepository',
  collectionName: 'approvals',
  vietnameseLabel: 'Hồ sơ AI Kiểm định, Thẩm định & Phê duyệt',
});

export const resultRepository = new FirestoreScopedRepository({
  repositoryName: 'resultRepository',
  collectionName: 'examResults',
  vietnameseLabel: 'Kết quả Kiểm tra, Xuất Hồ sơ & Nhật ký Kiểm toán',
});

export const fileStorageRepository = new FirestoreScopedRepository({
  repositoryName: 'fileStorageRepository',
  collectionName: 'fileAssets',
  vietnameseLabel: 'Metadata Tệp Tài liệu Firebase Storage',
});

export const ALL_DAL_REPOSITORIES = {
  userRepository,
  departmentRepository,
  permissionRepository,
  curriculumRepository,
  questionRepository,
  matrixRepository,
  examRepository,
  workflowRepository,
  reviewRepository,
  resultRepository,
  fileStorageRepository,
};

// ============================================================================
// MỤC IV: BỘ ĐIỀU KHIỂN LƯU TỰ ĐỘNG CÓ KIỂM SOÁT (CONTROLLED AUTO-SAVE ENGINE)
// Dành cho Câu hỏi, Ma trận và Đề đang soạn:
// - Không ghi Firestore sau mỗi ký tự (Debounce 2500ms + Kiểm tra mã băm nội dung)
// - Có trạng thái: UNSAVED / SAVING / SAVED_SERVER / OFFLINE_CACHED / CONFLICT / ERROR
// - Không ghi đè thay đổi của người dùng khác (Kiểm tra baseVersion)
// ============================================================================

export interface AutoSaveDraftState {
  entityType: 'QUESTION_DRAFT' | 'MATRIX_DRAFT' | 'EXAM_DRAFT';
  recordId: string;
  baseVersion: number;
  status: DalSaveStatus;
  keystrokeCountSinceLastSave: number;
  firestoreWritesCount: number;
  lastSavedAt: string | null;
  statusMessage: string;
}

class ControlledAutoSaveEngine {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private lastSavedContentHashes = new Map<string, string>();
  private draftStates = new Map<string, AutoSaveDraftState>();
  private listeners = new Set<(states: AutoSaveDraftState[]) => void>();

  private computeHash(payload: unknown): string {
    const str = JSON.stringify(payload || {});
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `h_${Math.abs(hash)}_${str.length}`;
  }

  public subscribe(listener: (states: AutoSaveDraftState[]) => void): () => void {
    this.listeners.add(listener);
    listener(Array.from(this.draftStates.values()));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = Array.from(this.draftStates.values());
    this.listeners.forEach((fn) => fn(snapshot));
  }

  public getDraftStates(): AutoSaveDraftState[] {
    return Array.from(this.draftStates.values());
  }

  /**
   * Ghi nhận thay đổi khi giáo viên đang gõ phím soạn Câu hỏi / Ma trận / Đề:
   * - Đánh dấu ngay trạng thái UNSAVED (Chưa lưu)
   * - Hủy timer cũ và đặt lịch lưu nháp sau debounceMs (mặc định 2500ms) để tránh ghi Firestore sau mỗi ký tự.
   */
  public scheduleControlledAutoSave<T extends DalBaseEntity>(params: {
    entityType: 'QUESTION_DRAFT' | 'MATRIX_DRAFT' | 'EXAM_DRAFT';
    recordId: string;
    baseVersion: number;
    draftPayload: Partial<T>;
    ctx: DalActorContext;
    debounceMs?: number;
  }): void {
    const { entityType, recordId, baseVersion, draftPayload, ctx, debounceMs = 2500 } = params;
    const key = `${entityType}:${recordId}`;
    const currentHash = this.computeHash(draftPayload);
    const previousSavedHash = this.lastSavedContentHashes.get(key);

    if (previousSavedHash === currentHash) {
      return;
    }

    const existingState = this.draftStates.get(key);
    const nextKeystrokes = (existingState?.keystrokeCountSinceLastSave || 0) + 1;

    this.draftStates.set(key, {
      entityType,
      recordId,
      baseVersion,
      status: 'UNSAVED',
      keystrokeCountSinceLastSave: nextKeystrokes,
      firestoreWritesCount: existingState?.firestoreWritesCount || 0,
      lastSavedAt: existingState?.lastSavedAt || null,
      statusMessage: `Chưa lưu (${nextKeystrokes} thao tác gõ phím đã gộp - tự động lưu sau ${(debounceMs / 1000).toFixed(1)}s ngừng gõ)`,
    });
    dalSyncStateManager.updateState({
      saveStatus: 'UNSAVED',
      lastStatusMessage: `Đang soạn nháp [${recordId}] — Chưa lưu lên máy chủ.`,
    });
    this.notify();

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    const timer = setTimeout(() => {
      void this.flushDraftNow({
        entityType,
        recordId,
        baseVersion,
        draftPayload,
        ctx,
      });
    }, debounceMs);

    this.timers.set(key, timer);
  }

  public async flushDraftNow<T extends DalBaseEntity>(params: {
    entityType: 'QUESTION_DRAFT' | 'MATRIX_DRAFT' | 'EXAM_DRAFT';
    recordId: string;
    baseVersion: number;
    draftPayload: Partial<T>;
    ctx: DalActorContext;
  }): Promise<DalMutationResult<T>> {
    const { entityType, recordId, baseVersion, draftPayload, ctx } = params;
    const key = `${entityType}:${recordId}`;
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }

    const existingState = this.draftStates.get(key);
    this.draftStates.set(key, {
      entityType,
      recordId,
      baseVersion,
      status: 'SAVING',
      keystrokeCountSinceLastSave: existingState?.keystrokeCountSinceLastSave || 1,
      firestoreWritesCount: existingState?.firestoreWritesCount || 0,
      lastSavedAt: existingState?.lastSavedAt || null,
      statusMessage: 'Đang lưu bản nháp lên Cloud Firestore...',
    });
    this.notify();

    const targetRepo =
      entityType === 'QUESTION_DRAFT'
        ? questionRepository
        : entityType === 'MATRIX_DRAFT'
        ? matrixRepository
        : examRepository;

    const result = await targetRepo.update(
      recordId,
      {
        ...draftPayload,
        status: String(draftPayload.status || 'DRAFT'),
      } as Partial<T>,
      ctx,
      {
        baseVersion,
        changeNote: `Lưu nháp tự động có kiểm soát (${entityType})`,
      }
    );

    if (result.ok && result.serverConfirmed) {
      this.lastSavedContentHashes.set(key, this.computeHash(draftPayload));
      this.draftStates.set(key, {
        entityType,
        recordId,
        baseVersion: result.version,
        status: 'SAVED_SERVER',
        keystrokeCountSinceLastSave: 0,
        firestoreWritesCount: (existingState?.firestoreWritesCount || 0) + 1,
        lastSavedAt: result.updatedAt,
        statusMessage: `Đã lưu nháp lên Firestore (v${result.version} lúc ${new Date(result.updatedAt).toLocaleTimeString('vi-VN')})`,
      });
    } else if (result.saveStatus === 'CONFLICT') {
      this.draftStates.set(key, {
        entityType,
        recordId,
        baseVersion,
        status: 'CONFLICT',
        keystrokeCountSinceLastSave: existingState?.keystrokeCountSinceLastSave || 1,
        firestoreWritesCount: existingState?.firestoreWritesCount || 0,
        lastSavedAt: existingState?.lastSavedAt || null,
        statusMessage: result.message,
      });
    } else if (result.saveStatus === 'OFFLINE_CACHED') {
      this.draftStates.set(key, {
        entityType,
        recordId,
        baseVersion,
        status: 'OFFLINE_CACHED',
        keystrokeCountSinceLastSave: existingState?.keystrokeCountSinceLastSave || 1,
        firestoreWritesCount: existingState?.firestoreWritesCount || 0,
        lastSavedAt: existingState?.lastSavedAt || null,
        statusMessage:
          'Đang ngoại tuyến (Offline): Bản nháp mới chỉ nằm trong bộ nhớ đệm máy trạm, CHƯA lưu lên máy chủ.',
      });
    } else {
      this.draftStates.set(key, {
        entityType,
        recordId,
        baseVersion,
        status: 'ERROR',
        keystrokeCountSinceLastSave: existingState?.keystrokeCountSinceLastSave || 1,
        firestoreWritesCount: existingState?.firestoreWritesCount || 0,
        lastSavedAt: existingState?.lastSavedAt || null,
        statusMessage: result.message,
      });
    }

    this.notify();
    return result as DalMutationResult<T>;
  }
}

export const controlledAutoSaveEngine = new ControlledAutoSaveEngine();

// ============================================================================
// MỤC VII: CƠ CHẾ THỬ LẠI HÀNG ĐỢI NGOẠI TUYẾN (OFFLINE RETRY ENGINE)
// ============================================================================

export async function retryAllOfflineQueuedMutations(): Promise<{
  attemptedCount: number;
  succeededCount: number;
  conflictCount: number;
  remainingCount: number;
  summaryMessage: string;
}> {
  const state = dalSyncStateManager.getState();
  if (dalSyncStateManager.isEffectivelyOffline()) {
    return {
      attemptedCount: 0,
      succeededCount: 0,
      conflictCount: 0,
      remainingCount: state.pendingOfflineMutations.length,
      summaryMessage:
        'Thiết bị vẫn đang ở trạng thái Offline. Vui lòng tắt mô phỏng Offline hoặc kiểm tra kết nối mạng trước khi thử lại.',
    };
  }

  const queue = [...state.pendingOfflineMutations];
  if (queue.length === 0) {
    return {
      attemptedCount: 0,
      succeededCount: 0,
      conflictCount: 0,
      remainingCount: 0,
      summaryMessage: 'Không có thao tác nào tồn đọng trong hàng đợi ngoại tuyến.',
    };
  }

  dalSyncStateManager.updateState({
    pendingOfflineMutations: [],
    saveStatus: 'SAVING',
    lastStatusMessage: `Đang đồng bộ lại ${queue.length} thao tác từ bộ nhớ đệm lên Cloud Firestore...`,
  });

  let succeededCount = 0;
  let conflictCount = 0;
  const stillPending: OfflineQueuedMutation[] = [];

  for (const item of queue) {
    const repo =
      ALL_DAL_REPOSITORIES[item.repositoryName as keyof typeof ALL_DAL_REPOSITORIES] ||
      questionRepository;

    if (item.operation === 'CREATE') {
      const res = await repo.create(item.payload as Partial<DalBaseEntity>, item.actorContext);
      if (res.ok && res.serverConfirmed) {
        succeededCount++;
      } else {
        stillPending.push({ ...item, retryCount: item.retryCount + 1 });
      }
    } else {
      const res = await repo.update(
        item.recordId,
        item.payload as Partial<DalBaseEntity>,
        item.actorContext,
        {
          baseVersion: item.baseVersion,
          changeNote: 'Đồng bộ khôi phục từ hàng đợi ngoại tuyến (Offline Recovery)',
        }
      );
      if (res.ok && res.serverConfirmed) {
        succeededCount++;
      } else if (res.saveStatus === 'CONFLICT') {
        conflictCount++;
      } else {
        stillPending.push({ ...item, retryCount: item.retryCount + 1 });
      }
    }
  }

  dalSyncStateManager.updateState({
    pendingOfflineMutations: stillPending,
    saveStatus:
      conflictCount > 0
        ? 'CONFLICT'
        : stillPending.length > 0
        ? 'OFFLINE_CACHED'
        : 'SAVED_SERVER',
    lastServerConfirmedAt: succeededCount > 0 ? new Date().toISOString() : state.lastServerConfirmedAt,
    lastStatusMessage:
      stillPending.length === 0 && conflictCount === 0
        ? `Đã đồng bộ thành công 100% (${succeededCount}/${queue.length}) thao tác ngoại tuyến lên Cloud Firestore.`
        : `Đã xử lý ${queue.length} thao tác: Thành công=${succeededCount}, Xung đột=${conflictCount}, Còn chờ=${stillPending.length}.`,
  });

  return {
    attemptedCount: queue.length,
    succeededCount,
    conflictCount,
    remainingCount: stillPending.length,
    summaryMessage: `Đồng bộ lại hoàn tất: Đã xác nhận từ máy chủ ${succeededCount}/${queue.length} bản ghi (Xung đột: ${conflictCount}, Còn chờ: ${stillPending.length}).`,
  };
}
