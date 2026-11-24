/**
 * GIAI ĐOẠN 17: HỆ THỐNG SAO LƯU, KHÔI PHỤC VÀ QUẢN LÝ PHIÊN BẢN DỮ LIỆU FIREBASE
 * (MỤC I -> VII)
 *
 * Đảm bảo:
 * - Bảo vệ đầy đủ 12 nhóm dữ liệu cốt lõi trên Cloud Firestore.
 * - Phân tách rõ Sao lưu Firestore (JSON/Document) và Sao lưu Tệp Firebase Storage (Word, PDF, Excel, Hình ảnh).
 * - Minh bạch tuyệt đối: Phân biệt rõ những gì đã sao lưu thực tế ở tầng ứng dụng/kho tập trung
 *   với những cấu hình hạ tầng GCP (IAM, Cloud Scheduler, Managed Export, Billing) cần bật thêm.
 * - Quản lý phiên bản bất biến cho 6 đối tượng: Câu hỏi, Ma trận, Bản đặc tả, Đề kiểm tra, Đáp án, Hướng dẫn chấm.
 *   Cấm sửa trực tiếp phiên bản đã phê duyệt (APPROVED).
 * - Quy trình khôi phục 7 bước: Bắt buộc khôi phục vào Môi trường Kiểm thử (Staging Sandbox) trước,
 *   đối chiếu số lượng & nội dung, chỉ khôi phục lên môi trường chính thức khi có phê duyệt của Ban Giám hiệu.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseClient';

// ============================================================================
// MỤC I, II & III: CẤU TRÚC BẢN SAO LƯU FIRESTORE (12 NHÓM) & FIREBASE STORAGE
// ============================================================================

export type ProtectedCollectionGroupCode =
  | 'USERS_ACCOUNTS'
  | 'PERMISSIONS_AND_ASSIGNMENTS'
  | 'DEPARTMENTS'
  | 'CURRICULUM'
  | 'QUESTION_BANK'
  | 'MATRICES'
  | 'SPECIFICATIONS'
  | 'EXAMS'
  | 'AI_REVIEWS'
  | 'DEPARTMENT_APPRAISALS'
  | 'LEADERSHIP_APPROVALS'
  | 'EXAM_RESULTS';

export interface ProtectedCollectionBackupSummary {
  groupCode: ProtectedCollectionGroupCode;
  vietnameseName: string;
  firestoreCollectionPath: string;
  documentCount: number;
  containsConfidentialExamData: boolean;
  passwordAndSecretStripped: boolean;
  sha256Digest: string;
}

export interface StorageBackupManifestItem {
  fileId: string;
  originalFilename: string;
  moduleCategory: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
  accessLevel: string;
  versionId: string;
  binaryBackedUpInManifest: boolean;
  gcsBucketObjectVersioningRequired: boolean;
  sha256Checksum: string;
}

export interface BackupCoverageTransparencyItem {
  componentName: string;
  scopeType: 'FIRESTORE_DATA' | 'STORAGE_FILES' | 'GCP_INFRASTRUCTURE';
  protectionStatus: 'PROTECTED_IN_APP' | 'REQUIRES_GCP_IAM_AND_SCHEDULE_CONFIG';
  vietnameseStatusLabel: string;
  technicalDetails: string;
  requiredActionOrGcloudCommand: string;
}

export interface FirebaseBackupSnapshotRecord {
  snapshotId: string;
  schoolId: string;
  snapshotTitle: string;
  triggerType: 'MANUAL_ADMIN_BACKUP' | 'PRE_RESTORE_SAFETY_SNAPSHOT';
  createdByUid: string;
  createdByName: string;
  createdByRole: string;
  createdAt: string;
  status: 'COMPLETED' | 'FAILED' | 'VERIFYING';
  isPubliclyAccessible: false; // Mục VI: Không tạo tệp sao lưu công khai
  zeroPasswordsAndApiKeysVerified: true; // Mục VI: Không lưu mật khẩu hoặc khóa bí mật
  confidentialExamsEncryptedAndSealed: boolean;
  totalFirestoreDocuments: number;
  totalStorageFiles: number;
  totalStorageBytes: number;
  overallSha256Signature: string;
  collectionSummaries: ProtectedCollectionBackupSummary[];
  storageManifest: StorageBackupManifestItem[];
  auditLogId: string;
}

// ============================================================================
// MỤC IV: QUẢN LÝ PHIÊN BẢN BẤT BIẾN CHO 6 ĐỐI TƯỢNG CHUYÊN MÔN
// ============================================================================

export type VersionedEntityType =
  | 'QUESTION'
  | 'MATRIX'
  | 'SPECIFICATION'
  | 'EXAM_PAPER'
  | 'ANSWER_KEY'
  | 'GRADING_GUIDE';

export interface EntityVersionHistoryRecord {
  versionRecordId: string;
  schoolId: string;
  entityType: VersionedEntityType;
  entityTypeVietnamese: string;
  entityId: string;
  entityTitle: string;
  versionId: string; // v1, v2, v3...
  editedByUid: string;
  editedByName: string;
  editedAt: string;
  changeSummary: string;
  changeReason: string;
  contentSnapshot: Record<string, unknown>;
  status: 'DRAFT' | 'SUBMITTED' | 'APPRAISED' | 'APPROVED' | 'ARCHIVED';
  immutableLocked: boolean; // true khi status === 'APPROVED'
  sha256Hash: string;
}

// ============================================================================
// MỤC V: QUY TRÌNH KHÔI PHỤC 7 BƯỚC VÀ ĐỐI CHIẾU MÔI TRƯỜNG KIỂM THỬ (STAGING)
// ============================================================================

export interface RestoreReconciliationRow {
  groupCode: ProtectedCollectionGroupCode;
  vietnameseName: string;
  backupCount: number;
  liveProductionCount: number;
  stagingRestoredCount: number;
  countMatched: boolean;
  contentHashMatched: boolean;
  sampleDiffNote: string;
}

export interface StagingRestoreJobRecord {
  restoreJobId: string;
  snapshotId: string;
  schoolId: string;
  stagingNamespace: string; // VD: schools/sch-th-thcs-nguyen-du_staging_restore
  initiatedByUid: string;
  initiatedByName: string;
  initiatedByRole: string;
  initiatedAt: string;
  currentStepNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  workflowStatus:
    | 'STAGING_RESTORED_AND_RECONCILED'
    | 'APPROVED_FOR_PRODUCTION_PROMOTE'
    | 'REJECTED_UNAUTHORIZED';
  productionDataOverwrittenDuringStaging: false; // Cam kết không tự ghi đè dữ liệu đang dùng
  reconciliationRows: RestoreReconciliationRow[];
  storageFilesVerifiedCount: number;
  allCountsMatched: boolean;
  allContentHashesMatched: boolean;
  principalApprovalStatus: 'PENDING_PRINCIPAL_APPROVAL' | 'APPROVED_BY_PRINCIPAL';
  approvedByPrincipalUid?: string;
  approvedAt?: string;
  auditLogId: string;
}

// ============================================================================
// MỤC VII: BÁO CÁO KIỂM THỬ 7 HẠNG MỤC SAO LƯU, PHIÊN BẢN & KHÔI PHỤC
// ============================================================================

export interface BackupRestoreQaScenarioItem {
  order: number;
  scenarioCode: string;
  title: string;
  requirementRef: string;
  actionPerformed: string;
  expectedResult: string;
  actualResult: string;
  httpStatus: number;
  passed: boolean;
}

export interface Stage17BackupRestoreVersionReport {
  runId: string;
  executedAt: string;
  schoolId: string;
  scheduledBackupHonestStatus: {
    inAppManualBackupActive: boolean;
    gcpManagedScheduledBackupConfiguredInCloud: boolean;
    statusBanner: string;
    requiredIamRoles: string[];
    recommendedGcloudCommand: string;
    estimatedCostNote: string;
  };
  snapshots: FirebaseBackupSnapshotRecord[];
  versionHistoryRecords: EntityVersionHistoryRecord[];
  latestStagingRestoreJob: StagingRestoreJobRecord | null;
  coverageTransparencyMatrix: BackupCoverageTransparencyItem[];
  totalScenarios: number;
  passedScenarios: number;
  allPassed: boolean;
  scenarios: BackupRestoreQaScenarioItem[];
}

// ============================================================================
// CÁC HÀM GỌI API BACKEND & GHI SIÊU DỮ LIỆU SNAPSHOT LÊN FIRESTORE
// ============================================================================

async function mirrorBackupSnapshotMetadataToFirestore(
  snapshot: FirebaseBackupSnapshotRecord
): Promise<void> {
  try {
    if (!db) return;
    await setDoc(
      doc(db, 'schools', snapshot.schoolId, 'auditLogs', `bkp_meta_${snapshot.snapshotId}`),
      {
        logId: `bkp_meta_${snapshot.snapshotId}`,
        schoolId: snapshot.schoolId,
        action: 'BACKUP_SNAPSHOT_METADATA_SYNC',
        snapshotId: snapshot.snapshotId,
        totalFirestoreDocuments: snapshot.totalFirestoreDocuments,
        totalStorageFiles: snapshot.totalStorageFiles,
        zeroPasswordsAndApiKeysVerified: snapshot.zeroPasswordsAndApiKeysVerified,
        isPubliclyAccessible: snapshot.isPubliclyAccessible,
        overallSha256Signature: snapshot.overallSha256Signature,
        createdAt: snapshot.createdAt,
      },
      { merge: true }
    );
  } catch {
    // Firestore Rules bảo vệ auditLogs chỉ cho phép ghi từ Backend Admin SDK.
  }
}

export async function runStage17BackupRestoreFullQaService(): Promise<Stage17BackupRestoreVersionReport | null> {
  try {
    const res = await fetch('/api/firebase/backup-restore/run-7-scenarios-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const report: Stage17BackupRestoreVersionReport | null = data.report || null;
    if (report && report.snapshots.length > 0) {
      await mirrorBackupSnapshotMetadataToFirestore(report.snapshots[0]);
    }
    return report;
  } catch {
    return null;
  }
}

export async function triggerManualBackupSnapshotService(params: {
  actorUid: string;
  actorName: string;
  actorRole: string;
  schoolId: string;
  snapshotTitle: string;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  snapshot: FirebaseBackupSnapshotRecord | null;
}> {
  const res = await fetch('/api/firebase/backup-restore/create-manual-snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.snapshot) {
    await mirrorBackupSnapshotMetadataToFirestore(data.snapshot);
  }
  return {
    ok: res.ok && Boolean(data.ok),
    httpStatus: res.status,
    message: data.message || '',
    snapshot: data.snapshot || null,
  };
}

export async function attemptEditVersionedEntityService(params: {
  actorUid: string;
  actorName: string;
  actorRole: string;
  schoolId: string;
  entityType: VersionedEntityType;
  entityId: string;
  targetVersionId: string;
  mode: 'DIRECT_OVERWRITE_EXISTING_VERSION' | 'CREATE_NEW_DRAFT_VERSION_BRANCH';
  changeSummary: string;
  changeReason: string;
  newContentPatch: Record<string, unknown>;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  reasonCode: string;
  message: string;
  versionRecord: EntityVersionHistoryRecord | null;
}> {
  const res = await fetch('/api/firebase/backup-restore/mutate-entity-version', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return {
    ok: res.ok && Boolean(data.ok),
    httpStatus: res.status,
    reasonCode: data.reasonCode || '',
    message: data.message || '',
    versionRecord: data.versionRecord || null,
  };
}

export async function executeStagingRestore7StepsService(params: {
  actorUid: string;
  actorName: string;
  actorRole: string;
  schoolId: string;
  snapshotId: string;
  promoteToProductionWithPrincipalApproval?: boolean;
  principalApprovalCode?: string;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  restoreJob: StagingRestoreJobRecord | null;
}> {
  const res = await fetch('/api/firebase/backup-restore/execute-staging-restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return {
    ok: res.ok && Boolean(data.ok),
    httpStatus: res.status,
    message: data.message || '',
    restoreJob: data.restoreJob || null,
  };
}
