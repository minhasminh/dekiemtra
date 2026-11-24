/**
 * GIAI ĐOẠN 17: ĐỒNG BỘ FIREBASE AUTHENTICATION VỚI FIRESTORE
 * VÀ HỆ THỐNG PHÂN QUYỀN GIÁO VIÊN (MỤC I -> VIII)
 *
 * Đảm bảo:
 * - Liên kết chính xác 1-1 giữa Firebase Authentication (UID, Email, Auth Status, Session/Token)
 *   với Hồ sơ Giáo viên trên Firestore (users), Phân công giảng dạy (teachingAssignments)
 *   và Quyền chức năng & Phạm vi (permissions).
 * - TUYỆT ĐỐI KHÔNG lưu mật khẩu (password / passwordHash / plainPassword) trong Firestore.
 * - Quy trình tạo tài khoản 8 bước có Idempotency Key, tự động hoàn tác (Rollback/Compensation)
 *   hoặc thử lại an toàn (Safe Retry) khi lỗi giữa chừng, không tạo tài khoản trùng.
 * - Đồng bộ sửa đổi Email với Firebase Authentication.
 * - Thu hồi quyền có hiệu lực tức thì trên phiên đang hoạt động (không cần chờ đăng xuất).
 * - Khóa tài khoản vô hiệu hóa Auth, thu hồi Refresh Token (tokensValidAfterTime) và từ chối
 *   ngay cả khi ID Token cũ vẫn còn thời hạn (exp).
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseClient';

// ============================================================================
// MỤC II: CẤU TRÚC DỮ LIỆU FIREBASE AUTHENTICATION & FIRESTORE (KHÔNG MẬT KHẨU)
// ============================================================================

export type TeacherEducationLevel = 'TIEU_HOC' | 'THCS';

export type TeacherRoleCode =
  | 'TEACHER'
  | 'HEAD_OF_DEPARTMENT'
  | 'VICE_PRINCIPAL'
  | 'PRINCIPAL'
  | 'SYSTEM_ADMIN';

export type TeacherAccountStatus =
  | 'ACTIVE'
  | 'PENDING_ACTIVATION'
  | 'LOCKED'
  | 'INCOMPLETE_PROVISIONING';

export type FunctionalPermissionCode =
  | 'CREATE_QUESTION'
  | 'EDIT_OWN_QUESTION'
  | 'BUILD_MATRIX'
  | 'BUILD_SPECIFICATION'
  | 'CREATE_EXAM'
  | 'SUBMIT_FOR_REVIEW'
  | 'APPRAISE_DEPARTMENT_EXAM'
  | 'APPROVE_FINAL_EXAM'
  | 'EXPORT_EXAM_DOSSIER'
  | 'VIEW_RESULT_ANALYTICS';

export interface FirebaseAuthIdentityRecord {
  uid: string;
  email: string;
  emailVerified: boolean;
  disabled: boolean;
  displayName: string;
  providerId: 'password' | 'google.com';
  lastSignInTime: string;
  tokensValidAfterTime: string; // Mốc thu hồi Refresh Token / ID Token cũ (Mục VII)
  sessionRevocationEpoch: number;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreTeacherProfileRecord {
  authUid: string; // Liên kết 1-1 với Firebase Auth UID
  teacherProfileId: string; // Mã nghiệp vụ giáo viên (VD: GV-ND-TH-001)
  schoolId: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  educationLevels: TeacherEducationLevel[];
  subjects: string[];
  grades: string[];
  roles: TeacherRoleCode[];
  status: TeacherAccountStatus;
  functionalPermissions: FunctionalPermissionCode[];
  permissionScope: {
    schoolId: string;
    departmentId: string;
    educationLevels: TeacherEducationLevel[];
    allowedSubjects: string[];
    allowedGrades: string[];
    assignedClasses: string[];
    canReadConfidentialExam: boolean;
    canApproveFinalExam: boolean;
  };
  permissionVersion: number; // Tăng mỗi khi thay đổi/thu hồi quyền để đồng bộ phiên đang mở (Mục VI)
  securityStamp: string;
  passwordStoredInFirestore: false; // Cam kết 100% không lưu mật khẩu trong Firestore
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Provisioning8StepLogItem {
  stepNumber: number;
  stepCode: string;
  stepTitle: string;
  status: 'COMPLETED' | 'FAILED' | 'COMPENSATED' | 'SKIPPED_IDEMPOTENT';
  detail: string;
  executedAt: string;
}

export interface ProvisionTeacher8StepResult {
  ok: boolean;
  idempotencyKey: string;
  reusedExistingOnRetry: boolean;
  provisioningStatus: 'COMPLETED' | 'ROLLED_BACK_SAFE' | 'READY_FOR_SAFE_RETRY';
  authRecord: FirebaseAuthIdentityRecord | null;
  firestoreProfile: FirestoreTeacherProfileRecord | null;
  assignmentIds: string[];
  permissionDocId: string | null;
  auditLogId: string | null;
  steps: Provisioning8StepLogItem[];
  message: string;
}

export interface ActiveTeacherSessionToken {
  tokenId: string;
  uid: string;
  email: string;
  schoolId: string;
  deviceId: string;
  deviceLabel: string;
  issuedAt: string; // iat
  expiresAt: string; // exp (còn hạn 1 giờ)
  tokenPermissionVersion: number;
}

export interface LoginAndSyncSessionResult {
  ok: boolean;
  httpStatus: number;
  uid: string;
  deviceId: string;
  deviceLabel: string;
  authStatus: string;
  accountStatus: TeacherAccountStatus;
  roles: TeacherRoleCode[];
  functionalPermissions: FunctionalPermissionCode[];
  permissionScope: FirestoreTeacherProfileRecord['permissionScope'];
  visibleUiModules: string[];
  sessionToken: ActiveTeacherSessionToken | null;
  firestoreProfile: FirestoreTeacherProfileRecord | null;
  message: string;
}

export interface AuthRbacScenarioVerificationItem {
  order: number;
  scenarioCode: string;
  title: string;
  requirementRef: string;
  actorAccountLabel: string;
  actionPerformed: string;
  expectedOutcome: string;
  actualOutcome: string;
  httpStatus: number;
  authUidVerified: string;
  firestoreStateVerified: string;
  passed: boolean;
}

export interface AuthRbac8Stage17Report {
  runId: string;
  executedAt: string;
  schoolId: string;
  noPasswordInFirestoreVerified: boolean;
  idempotentProvisioningVerified: boolean;
  liveRevocationWithoutLogoutVerified: boolean;
  lockedAccountRejectsValidOldTokenVerified: boolean;
  crossDeviceSyncVerified: boolean;
  threeStandardAccounts: {
    accountType: 'PRIMARY_TEACHER' | 'LOWER_SECONDARY_TEACHER' | 'HEAD_OF_DEPARTMENT';
    vietnameseTitle: string;
    authRecord: FirebaseAuthIdentityRecord;
    firestoreProfile: FirestoreTeacherProfileRecord;
  }[];
  totalScenarios: number;
  passedScenarios: number;
  allPassed: boolean;
  scenarios: AuthRbacScenarioVerificationItem[];
}

// ============================================================================
// CÁC HÀM GỌI API BACKEND & ĐỒNG BỘ TRỰC TIẾP LÊN CLOUD FIRESTORE THẬT
// ============================================================================

async function mirrorSyncedTeacherToLiveFirestore(
  profile: FirestoreTeacherProfileRecord
): Promise<void> {
  try {
    if (!db) return;
    // Đảm bảo tuyệt đối không có bất kỳ trường mật khẩu nào trước khi ghi Firestore
    const cleanProfile: Record<string, unknown> = { ...profile };
    delete cleanProfile.password;
    delete cleanProfile.passwordHash;
    delete cleanProfile.plainPassword;

    await setDoc(
      doc(db, 'schools', profile.schoolId, 'users', profile.authUid),
      cleanProfile,
      { merge: true }
    );
  } catch {
    // Nếu Firestore Rules chặn ghi trực tiếp từ client (do chỉ cho phép Admin SDK),
    // Backend đã lưu trong kho tập trung và kiểm chứng qua Admin Guard.
  }
}

export async function runStage17AuthRbacFullVerificationService(): Promise<AuthRbac8Stage17Report | null> {
  try {
    const res = await fetch('/api/firebase/auth-rbac/run-full-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const report: AuthRbac8Stage17Report | null = data.report || null;
    if (report && Array.isArray(report.threeStandardAccounts)) {
      for (const acc of report.threeStandardAccounts) {
        if (acc.firestoreProfile) {
          await mirrorSyncedTeacherToLiveFirestore(acc.firestoreProfile);
        }
      }
    }
    return report;
  } catch {
    return null;
  }
}

export async function provisionTeacher8StepsService(params: {
  adminActorUid: string;
  adminActorRole: TeacherRoleCode;
  idempotencyKey: string;
  schoolId: string;
  teacherProfileId: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  educationLevels: TeacherEducationLevel[];
  subjects: string[];
  grades: string[];
  assignedClasses: string[];
  roles: TeacherRoleCode[];
  functionalPermissions: FunctionalPermissionCode[];
  simulateFailAtStep?: number; // Dùng để kiểm thử cơ chế hoàn tác / thử lại an toàn ở Mục III
}): Promise<ProvisionTeacher8StepResult> {
  const res = await fetch('/api/firebase/auth-rbac/provision-teacher-8-steps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.result?.firestoreProfile) {
    await mirrorSyncedTeacherToLiveFirestore(data.result.firestoreProfile);
  }
  return data.result;
}

export async function updateTeacherAccountSyncService(params: {
  adminActorUid: string;
  adminActorRole: TeacherRoleCode;
  targetUid: string;
  schoolId: string;
  mutationType:
    | 'UPDATE_FULL_NAME'
    | 'UPDATE_EMAIL_SYNC_AUTH'
    | 'TRANSFER_DEPARTMENT'
    | 'CHANGE_SUBJECTS'
    | 'CHANGE_GRADES'
    | 'ASSIGN_ROLES'
    | 'REVOKE_PERMISSIONS_LIVE'
    | 'LOCK_ACCOUNT_REVOKE_TOKENS'
    | 'UNLOCK_ACCOUNT';
  updates: {
    fullName?: string;
    newEmail?: string;
    departmentId?: string;
    departmentName?: string;
    subjects?: string[];
    grades?: string[];
    roles?: TeacherRoleCode[];
    functionalPermissions?: FunctionalPermissionCode[];
    revokedPermissions?: FunctionalPermissionCode[];
    reason?: string;
  };
}): Promise<{
  ok: boolean;
  httpStatus: number;
  message: string;
  authRecord: FirebaseAuthIdentityRecord | null;
  firestoreProfile: FirestoreTeacherProfileRecord | null;
  auditLogId: string | null;
  activeSessionsAffected: number;
}> {
  const res = await fetch('/api/firebase/auth-rbac/update-teacher-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.firestoreProfile) {
    await mirrorSyncedTeacherToLiveFirestore(data.firestoreProfile);
  }
  return {
    ok: res.ok && Boolean(data.ok),
    httpStatus: res.status,
    message: data.message || '',
    authRecord: data.authRecord || null,
    firestoreProfile: data.firestoreProfile || null,
    auditLogId: data.auditLogId || null,
    activeSessionsAffected: data.activeSessionsAffected || 0,
  };
}

export async function verifyBackendActionWithSessionTokenService(params: {
  sessionToken: ActiveTeacherSessionToken;
  requestedAction: 'CREATE_EXAM' | 'APPRAISE_DEPARTMENT_EXAM' | 'READ_PROFILE';
  targetSubject: string;
  targetGrade: string;
  targetDepartmentId?: string;
}): Promise<{
  allowed: boolean;
  httpStatus: number;
  reasonCode: string;
  message: string;
  refreshedPermissions?: FunctionalPermissionCode[];
  refreshedStatus?: TeacherAccountStatus;
}> {
  const res = await fetch('/api/firebase/auth-rbac/verify-backend-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return {
    allowed: Boolean(data.allowed),
    httpStatus: res.status,
    reasonCode: data.reasonCode || '',
    message: data.message || '',
    refreshedPermissions: data.refreshedPermissions,
    refreshedStatus: data.refreshedStatus,
  };
}
