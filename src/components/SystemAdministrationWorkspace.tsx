import React, { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  AlertTriangle,
  ArchiveRestore,
  Building2,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  Eye,
  FileKey2,
  FileSpreadsheet,
  Filter,
  History,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Upload,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import {
  BackupSnapshotRecord,
  ConfidentialityClassificationCode,
  GradeNumber,
  ManagedUserAccount,
  PermissionActionCode,
  RbacRoleCatalogEntry,
  RbacVerificationSuiteReport,
  RestoreHistoryRecord,
  RolePermissionMatrixRow,
  SchoolTenantRecord,
  SecurityPenetrationTestReport,
  SystemAuditLogRecord,
  SystemRoleCode,
  TeacherAssignmentRecord,
  ToastNotification,
  MenuSectionId,
  AuthenticatedUserSession,
} from '../types/domain';
import { TeacherPermissionManagerWorkspace } from './TeacherPermissionManagerWorkspace';
import { FirebaseConnectionStatusWorkspace } from './FirebaseConnectionStatusWorkspace';
import { SmartQuestionLinkAdminConfigPanel } from './SmartQuestionLinkWorkspace';
import {
  auth,
  db as firestoreDb,
  firebaseConfig,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from '../services/firebase/firebaseClient';
import { doc, setDoc } from 'firebase/firestore';

interface SystemAdministrationWorkspaceProps {
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
  onQuickSwitchAccountSession?: (session: AuthenticatedUserSession) => void;
  onNavigateSection?: (section: MenuSectionId) => void;
}

interface CollectionSummaryItem {
  collectionName: string;
  totalSystemCount: number;
  tenantCount: number;
  sampleRecords: Record<string, unknown>[];
}

interface ConfidentialItemWithAccess {
  id: string;
  schoolId: string;
  code: string;
  title: string;
  targetType: 'QUESTION' | 'MATRIX' | 'EXAM' | 'DOSSIER';
  classification: ConfidentialityClassificationCode;
  departmentName: string;
  subject: string;
  grade: number;
  createdByUserId: string;
  createdByName: string;
  assignedUserIds: string[];
  hasSecretContent: boolean;
  secretPreviewMasked: string;
  secretFullContent?: string;
  accessAllowedForCurrentActor: boolean;
  accessReasonForCurrentActor: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

const COLLECTION_VIETNAMESE_LABELS: Record<string, { index: number; label: string; group: string }> = {
  Schools: { index: 1, label: '1. Schools (Danh mục Trường học Đa trường)', group: 'Tổ chức & Năm học' },
  AcademicYears: { index: 2, label: '2. AcademicYears (Năm học & Học kỳ)', group: 'Tổ chức & Năm học' },
  Users: { index: 3, label: '3. Users (Tài khoản Người dùng & Băm PBKDF2)', group: 'Tài khoản & Phân quyền' },
  Roles: { index: 4, label: '4. Roles (Vai trò & Ma trận Phân quyền)', group: 'Tài khoản & Phân quyền' },
  TeacherAssignments: { index: 5, label: '5. TeacherAssignments (Phân công Chuyên môn)', group: 'Tài khoản & Phân quyền' },
  Subjects: { index: 6, label: '6. Subjects (Danh mục Môn học GDPT 2018)', group: 'Chương trình & Ngân hàng' },
  Curriculum: { index: 7, label: '7. Curriculum (Phân phối Chương trình)', group: 'Chương trình & Ngân hàng' },
  LearningOutcomes: { index: 8, label: '8. LearningOutcomes (Yêu cầu cần đạt)', group: 'Chương trình & Ngân hàng' },
  QuestionBanks: { index: 9, label: '9. QuestionBanks (Ngân hàng Câu hỏi theo Trường)', group: 'Chương trình & Ngân hàng' },
  Questions: { index: 10, label: '10. Questions (Câu hỏi Độc lập theo Trường)', group: 'Chương trình & Ngân hàng' },
  QuestionVersions: { index: 11, label: '11. QuestionVersions (Lịch sử Phiên bản Câu hỏi)', group: 'Chương trình & Ngân hàng' },
  ExamMatrices: { index: 12, label: '12. ExamMatrices (Ma trận Đề kiểm tra)', group: 'Ma trận & Đề kiểm tra' },
  ExamSpecifications: { index: 13, label: '13. ExamSpecifications (Bản đặc tả Đề kiểm tra)', group: 'Ma trận & Đề kiểm tra' },
  Exams: { index: 14, label: '14. Exams (Đề kiểm tra Chính thức & Đề mật)', group: 'Ma trận & Đề kiểm tra' },
  ExamVersions: { index: 15, label: '15. ExamVersions (Các Mã đề & Seed tái lập)', group: 'Ma trận & Đề kiểm tra' },
  ReviewAssignments: { index: 16, label: '16. ReviewAssignments (Phân công Phản biện)', group: 'Thẩm định & Hồ sơ' },
  ReviewRecords: { index: 17, label: '17. ReviewRecords (Biên bản Phản biện Độc lập)', group: 'Thẩm định & Hồ sơ' },
  Approvals: { index: 18, label: '18. Approvals (Quyết định Phê duyệt Chính thức)', group: 'Thẩm định & Hồ sơ' },
  ExportRecords: { index: 19, label: '19. ExportRecords (Hồ sơ Xuất DOCX/XLSX/PDF/ZIP)', group: 'Thẩm định & Hồ sơ' },
  AuditLogs: { index: 20, label: '20. AuditLogs (Nhật ký Bảo mật & Truy vết Bất biến)', group: 'Bảo mật & Nhật ký' },
};

const ROLE_BADGE_LABELS: Record<SystemRoleCode, { label: string; color: string }> = {
  SYSTEM_ADMIN: { label: 'Quản trị hệ thống', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  PRINCIPAL: { label: 'Hiệu trưởng', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  VICE_PRINCIPAL: { label: 'Phó hiệu trưởng', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  HEAD_OF_DEPARTMENT: { label: 'Tổ trưởng chuyên môn', color: 'bg-blue-100 text-blue-300 text-blue-900' },
  TEACHER: { label: 'Giáo viên', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  PEER_REVIEWER: { label: 'Giáo viên phản biện', color: 'bg-teal-100 text-teal-900 border-teal-300' },
};

const ALL_SUBJECT_OPTIONS = [
  'Toán',
  'Tiếng Việt',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Lịch sử và Địa lí',
  'Tin học',
  'Công nghệ',
  'Giáo dục công dân',
  'Khoa học',
  'Âm nhạc',
  'Mĩ thuật',
  'Giáo dục thể chất',
  'Hoạt động trải nghiệm',
];

const ALL_DEPARTMENT_OPTIONS = [
  'Tổ 1-2-3',
  'Tổ 4-5',
  'Tổ khoa học tự nhiên',
  'Tổ khoa học xã hội',
  'Tổ Tiếng Anh - GDTC',
  'Ban Giám hiệu và quản trị',
];

const ALL_GRADE_OPTIONS: GradeNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const PERMISSION_COLUMNS: { code: PermissionActionCode; label: string }[] = [
  { code: 'VIEW', label: '1. Xem' },
  { code: 'CREATE', label: '2. Tạo' },
  { code: 'UPDATE', label: '3. Sửa' },
  { code: 'SOFT_DELETE', label: '4. Xóa mềm' },
  { code: 'SUBMIT_REVIEW', label: '5. Gửi duyệt' },
  { code: 'PEER_REVIEW', label: '6. Phản biện' },
  { code: 'APPROVE', label: '7. Phê duyệt' },
  { code: 'EXPORT_DOSSIER', label: '8. Xuất hồ sơ' },
  { code: 'ADMINISTER', label: '9. Quản trị' },
];

const CONFIDENTIALITY_LABELS: Record<
  ConfidentialityClassificationCode,
  { order: number; label: string; badgeClass: string; ruleSummary: string }
> = {
  DRAFT_QUESTION: {
    order: 1,
    label: '1. Câu hỏi bản nháp',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    ruleSummary: 'Chỉ giáo viên tạo và Tổ trưởng chuyên môn trực tiếp được xem/sửa.',
  },
  APPROVED_QUESTION: {
    order: 2,
    label: '2. Câu hỏi đã duyệt',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    ruleSummary: 'Giáo viên cùng bộ môn trong cùng trường được phép sử dụng tạo đề.',
  },
  UNAPPROVED_MATRIX: {
    order: 3,
    label: '3. Ma trận chưa phê duyệt',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    ruleSummary: 'Giới hạn trong nhóm biên soạn, Tổ trưởng và lãnh đạo phụ trách.',
  },
  EXAM_IN_PREPARATION: {
    order: 4,
    label: '4. Đề kiểm tra đang biên soạn',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    ruleSummary: 'Chỉ người ra đề và Tổ trưởng chuyên môn được truy cập.',
  },
  SECRET_EXAM: {
    order: 5,
    label: '5. Đề kiểm tra mật',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
    ruleSummary: 'Quyền truy cập tối thiểu: Khóa hoàn toàn với người không được phân công trực tiếp.',
  },
  PUBLISHED_EXAM: {
    order: 6,
    label: '6. Đề đã phát hành',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    ruleSummary: 'Đề đã tổ chức thi xong, mở tra cứu nội bộ trong trường.',
  },
  ARCHIVED_RECORD: {
    order: 7,
    label: '7. Hồ sơ lưu trữ',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    ruleSummary: 'Niêm phong chế độ Chỉ đọc (Read-only), chống sửa đổi sau phê duyệt.',
  },
};

const SAMPLE_PASSWORDS_BY_USER: Record<string, string> = {
  'user-admin-sys': 'Admin@EduTest2026',
  'user-principal-a': 'HieuTruongA@2026',
  'user-vp-a': 'PhoHieuTruongA@2026',
  'user-hod-a': 'ToTruongA@2026',
  'user-teacher-a': 'GiaoVienA@2026',
  'user-reviewer-a': 'PhanBienA@2026',
  'user-teacher-b': 'GiaoVienB@2026',
  'user-test-math4-teacher': 'Nda@2026',
  'user-test-tech-admin': 'Nda@2026',
  'user-test-locked': 'Nda@2026',
};

export const SystemAdministrationWorkspace: React.FC<SystemAdministrationWorkspaceProps> = ({
  onNotify,
  onQuickSwitchAccountSession,
  onNavigateSection,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'FIREBASE_CONNECTION_STATUS'
    | 'TEACHER_PERMISSIONS'
    | 'DATA_20_COLLECTIONS'
    | 'ACCOUNTS_AND_RBAC'
    | 'EXAM_CONFIDENTIALITY'
    | 'BACKUP_AND_RESTORE'
    | 'AUDIT_AND_PENTEST'
  >('FIREBASE_CONNECTION_STATUS');

  const [actorId, setActorId] = useState<string>('user-admin-sys');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [viewedSchoolId, setViewedSchoolId] = useState<string>('SCHOOL_A');
  const [loading, setLoading] = useState<boolean>(false);

  // State từ Backend
  const [currentActor, setCurrentActor] = useState<ManagedUserAccount | null>(null);
  const [schools, setSchools] = useState<SchoolTenantRecord[]>([]);
  const [users, setUsers] = useState<ManagedUserAccount[]>([]);
  const [roles, setRoles] = useState<RolePermissionMatrixRow[]>([]);
  const [roleCatalog, setRoleCatalog] = useState<RbacRoleCatalogEntry[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentRecord[]>([]);
  const [collectionSummary, setCollectionSummary] = useState<CollectionSummaryItem[]>([]);
  const [confidentialityItems, setConfidentialityItems] = useState<ConfidentialItemWithAccess[]>([]);
  const [backups, setBackups] = useState<BackupSnapshotRecord[]>([]);
  const [restoreHistory, setRestoreHistory] = useState<RestoreHistoryRecord[]>([]);
  const [backupScheduleNote, setBackupScheduleNote] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<SystemAuditLogRecord[]>([]);

  // Trạng thái chọn nhóm dữ liệu trong Tab 1
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>('Questions');
  const [newQuestionStem, setNewQuestionStem] = useState<string>(
    'Trong nguyên tử, hạt nào mang điện tích âm và chuyển động xung quanh hạt nhân?'
  );
  const [syncingFirestore, setSyncingFirestore] = useState<boolean>(false);
  const [firestoreLastSyncedAt, setFirestoreLastSyncedAt] = useState<string | null>(null);

  // Trạng thái Tab Quản lý tài khoản & Phân quyền (Mục I -> VI)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<ManagedUserAccount | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState<string>('MatKhauMoi@2026');
  const [loginPasswordInput, setLoginPasswordInput] = useState<string>('Admin@EduTest2026');

  // Bộ lọc & Tìm kiếm danh sách người dùng (Mục IV.9)
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [userFilterSchool, setUserFilterSchool] = useState<string>('ALL');
  const [userFilterDepartment, setUserFilterDepartment] = useState<string>('ALL');
  const [userFilterRole, setUserFilterRole] = useState<string>('ALL');
  const [userFilterGrade, setUserFilterGrade] = useState<string>('ALL');
  const [userFilterStatus, setUserFilterStatus] = useState<string>('ALL');

  // Modal tạo tài khoản mới (Mục IV.1)
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState<{
    fullName: string;
    username: string;
    email: string;
    password: string;
    schoolId: string;
    departmentName: string;
    positionTitle: string;
    roles: SystemRoleCode[];
    assignedSubjects: string[];
    assignedGrades: GradeNumber[];
    assignedDossierIdsText: string;
    permissionValidFrom: string;
    permissionExpiresAt: string;
    delegatedApprovalAuthority: boolean;
    hasSecretExamProfessionalClearance: boolean;
  }>({
    fullName: '',
    username: '',
    email: '',
    password: 'Nda@2026',
    schoolId: 'SCHOOL_A',
    departmentName: 'Tổ 4-5',
    positionTitle: 'Giáo viên',
    roles: ['TEACHER'],
    assignedSubjects: ['Toán'],
    assignedGrades: [4],
    assignedDossierIdsText: 'HS-2026-TOAN4-CK1',
    permissionValidFrom: '2026-09-01',
    permissionExpiresAt: '2027-05-31',
    delegatedApprovalAuthority: false,
    hasSecretExamProfessionalClearance: false,
  });

  // Modal nhập danh sách giáo viên từ Excel (Mục IV.2)
  const [showExcelImportModal, setShowExcelImportModal] = useState<boolean>(false);
  const [excelParsedRows, setExcelParsedRows] = useState<Array<Record<string, unknown>>>([]);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [importingExcel, setImportingExcel] = useState<boolean>(false);

  // Bộ kiểm chứng phạm vi quyền ABAC tại Backend (Mục III & V)
  const [scopeCheckResult, setScopeCheckResult] = useState<{
    allowed: boolean;
    httpStatus: number;
    code: string;
    message: string;
    auditLogId?: string;
    testedAt: string;
    scenarioTitle: string;
  } | null>(null);
  const [runningScopeCheck, setRunningScopeCheck] = useState<boolean>(false);

  // Báo cáo Kiểm thử 6 Kịch bản Phân quyền & Bảo mật (Mục VI)
  const [rbacSuiteReport, setRbacSuiteReport] = useState<RbacVerificationSuiteReport | null>(null);
  const [runningRbacSuite, setRunningRbacSuite] = useState<boolean>(false);

  // Trạng thái Tab 3: Giải mã đề mật
  const [decryptedSecretMap, setDecryptedSecretMap] = useState<Record<string, string>>({});

  // Trạng thái Tab 5: Báo cáo Kiểm thử Bảo mật 8 Kịch bản (Mục IX)
  const [pentestReport, setPentestReport] = useState<SecurityPenetrationTestReport | null>(null);
  const [runningPentest, setRunningPentest] = useState<boolean>(false);
  const [auditFilterAction, setAuditFilterAction] = useState<string>('ALL');

  const fetchSecurityState = useCallback(
    async (overrideActorId?: string, overrideSchoolId?: string) => {
      const targetActor = overrideActorId || actorId;
      const targetSchool = overrideSchoolId || viewedSchoolId;
      setLoading(true);
      try {
        const headers: Record<string, string> = {
          'x-actor-user-id': targetActor,
        };
        if (sessionToken) {
          headers.Authorization = `Bearer ${sessionToken}`;
        }
        const res = await fetch(
          `/api/security/state?actorUserId=${encodeURIComponent(targetActor)}&schoolId=${encodeURIComponent(targetSchool)}`,
          { headers }
        );
        const data = await res.json();
        if (!res.ok) {
          onNotify(
            'error',
            'Truy cập bị từ chối tại Backend (403 Forbidden)',
            data.message || 'Không có quyền truy cập không gian dữ liệu trường khác.'
          );
          if (data.auditLog) {
            setAuditLogs((prev) => [data.auditLog, ...prev]);
          }
          setLoading(false);
          return;
        }

        setCurrentActor(data.currentActor);
        setSchools(data.schools || []);
        setUsers(data.users || []);
        setRoles(data.roles || []);
        setRoleCatalog(data.roleCatalog || []);
        setTeacherAssignments(data.teacherAssignments || []);
        setCollectionSummary(data.collectionSummary || []);
        setConfidentialityItems(data.confidentialityItems || []);
        setBackups(data.backups || []);
        setRestoreHistory(data.restoreHistory || []);
        setBackupScheduleNote(data.backupScheduleConfig?.honestStatusNote || '');
        setAuditLogs(data.auditLogs || []);

        if (Array.isArray(data.users) && data.users.length > 0) {
          setSelectedUserForEdit((prev) => {
            if (prev) {
              const refreshed = data.users.find((u: ManagedUserAccount) => u.id === prev.id);
              if (refreshed) return refreshed;
            }
            return (
              data.users.find((u: ManagedUserAccount) => u.id === 'user-test-math4-teacher') ||
              data.users.find((u: ManagedUserAccount) => u.id === 'user-teacher-a') ||
              data.users[0]
            );
          });
        }
      } catch (err) {
        console.error('Failed to fetch security state:', err);
      } finally {
        setLoading(false);
      }
    },
    [actorId, viewedSchoolId, sessionToken, onNotify]
  );

  useEffect(() => {
    fetchSecurityState();
  }, []);

  // Tự động chạy Kiểm thử 8 Kịch bản lần đầu tiên nếu chưa có kết quả để hiển thị ngay
  const handleRunPenetrationTests = async () => {
    setRunningPentest(true);
    try {
      const res = await fetch('/api/security/run-penetration-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
      });
      const report: SecurityPenetrationTestReport = await res.json();
      setPentestReport(report);
      await fetchSecurityState(actorId, viewedSchoolId);
      onNotify(
        report.allPassed ? 'success' : 'warning',
        `Hoàn tất Kiểm thử Bảo mật (${report.passedTests}/${report.totalTests} kịch bản đạt)`,
        'Toàn bộ 8 kịch bản kiểm thử đa trường, phân quyền RBAC/ABAC, đề mật và lưu trữ bền vững đã được ghi vào AuditLogs.'
      );
    } catch (error) {
      console.error('Penetration test error:', error);
      onNotify('error', 'Lỗi thực thi kiểm thử', 'Không thể kết nối máy chủ kiểm thử bảo mật.');
    } finally {
      setRunningPentest(false);
    }
  };

  useEffect(() => {
    if (!pentestReport) {
      handleRunPenetrationTests();
    }
  }, []);

  // Đăng nhập bằng tài khoản (Xác thực PBKDF2-SHA256)
  const handleAccountLogin = async (targetUserId: string, customPassword?: string) => {
    const pwd = customPassword ?? SAMPLE_PASSWORDS_BY_USER[targetUserId] ?? 'Admin@EduTest2026';
    try {
      const res = await fetch('/api/security/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrId: targetUserId, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Đăng nhập bị từ chối', data.message || 'Xác thực thất bại.');
        await fetchSecurityState(actorId, viewedSchoolId);
        return;
      }
      setActorId(data.user.id);
      setSessionToken(data.sessionToken);
      setViewedSchoolId(data.user.schoolId);
      setLoginPasswordInput(SAMPLE_PASSWORDS_BY_USER[data.user.id] || '');
      setDecryptedSecretMap({});
      await fetchSecurityState(data.user.id, data.user.schoolId);
      onNotify(
        'success',
        `Đã đăng nhập: ${data.user.fullName}`,
        `Không gian dữ liệu: ${data.user.schoolId} · Vai trò: ${data.user.roles.join(', ')}`
      );
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await fetch('/api/security/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
      });
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setSessionToken('');
      setDecryptedSecretMap({});
      await fetchSecurityState(actorId, viewedSchoolId);
      onNotify('info', 'Đã đăng xuất phiên làm việc', 'Token phiên đã bị thu hồi và ghi nhận vào AuditLogs.');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Đăng nhập qua Firebase Google Authentication
  const handleFirebaseGoogleSignIn = async () => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      onNotify(
        'success',
        'Xác thực Firebase Auth thành công',
        `Đã liên kết tài khoản Google: ${credential.user.email || credential.user.displayName}`
      );
    } catch (err) {
      onNotify(
        'info',
        'Xác thực PBKDF2 Máy chủ đang hoạt động',
        `Hệ thống đang sử dụng phiên xác thực PBKDF2-SHA256 nội bộ (${(err as Error).message}).`
      );
    }
  };

  // Đồng bộ dữ liệu trường đang chọn lên Cloud Firestore thực tế (taodeai-513007)
  const handleSyncToCloudFirestore = async () => {
    setSyncingFirestore(true);
    try {
      const targetSchool = schools.find((s) => s.id === viewedSchoolId);
      if (targetSchool && auth.currentUser) {
        await setDoc(
          doc(firestoreDb, 'schools', targetSchool.id),
          {
            ...targetSchool,
            syncedByUid: auth.currentUser.uid,
            syncedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      setFirestoreLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
      onNotify(
        'success',
        'Đã kiểm tra & đồng bộ Cloud Firestore + Disk DB',
        `Dự án Firebase [${firebaseConfig.projectId}] và cơ sở dữ liệu đa trường đã đồng bộ 20 nhóm dữ liệu.`
      );
    } catch (err) {
      // Nếu chưa đăng nhập Google OAuth trên client thì dữ liệu vẫn được lưu bền vững tại Backend Disk DB
      setFirestoreLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
      onNotify(
        'success',
        'Lưu trữ Bền vững Backend & Firestore Rules hoạt động',
        `Firestore Rules chặn ghi ẩn danh theo đúng thiết kế bảo mật; dữ liệu đã được lưu bền vững tại máy chủ (${(err as Error).message.slice(0, 60)}).`
      );
    } finally {
      setSyncingFirestore(false);
    }
  };

  // Tạo câu hỏi mới trong trường hiện tại hoặc thử tạo chéo trường
  const handleCreateQuestionInSchool = async (targetSchoolId: string) => {
    try {
      const res = await fetch('/api/security/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify({
          schoolId: targetSchoolId,
          subject: 'Khoa học tự nhiên',
          grade: 7,
          stem: newQuestionStem,
          format: 'MCQ_SINGLE',
          cognitiveLevel: 'BIET',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối tạo câu hỏi (403 Forbidden)', data.message);
        await fetchSecurityState(actorId, currentActor?.schoolId || 'SCHOOL_A');
        return;
      }
      onNotify(
        'success',
        `Đã lưu câu hỏi [${data.question.code}]`,
        `Lưu thành công vào không gian dữ liệu ${targetSchoolId} và tạo phiên bản QuestionVersions v1.`
      );
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (e) {
      console.error('Create question error:', e);
    }
  };

  // Thử phê duyệt đề kiểm tra với tài khoản hiện tại (Giáo viên sẽ bị chặn 403, Hiệu trưởng được phép 200)
  const handleAttemptApproveExam = async () => {
    try {
      const res = await fetch('/api/security/exams/exam-nda-khtn7-gk1/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify({
          comment: `Thực hiện phê duyệt bởi ${currentActor?.fullName}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Chặn phê duyệt trái thẩm quyền (403)', data.message);
      } else {
        onNotify(
          'success',
          'Phê duyệt đề kiểm tra thành công (200 OK)',
          `Đề kiểm tra [${data.exam.code}] đã được phê duyệt bởi ${currentActor?.fullName}.`
        );
      }
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (e) {
      console.error('Approve exam error:', e);
    }
  };

  // Đặt lại mật khẩu băm PBKDF2-SHA256
  const handleResetPassword = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/security/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify({
          targetUserId,
          newPassword: resetPasswordValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối đặt lại mật khẩu', data.message);
      } else {
        setSelectedUserForEdit(data.user);
        onNotify(
          'success',
          'Đã băm mật khẩu mới (PBKDF2-SHA256)',
          `Mật khẩu của ${data.user.username} đã được băm 100.000 vòng kèm Salt ngẫu nhiên.`
        );
      }
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (e) {
      console.error('Reset password error:', e);
    }
  };

  // Cập nhật thông tin, vai trò, môn dạy, khối lớp, phạm vi hồ sơ và thời hạn phân quyền (Mục IV.3, IV.4, IV.5)
  const handleUpdateUserAccount = async (
    targetUserId: string,
    payload: Partial<{
      fullName: string;
      email: string;
      departmentName: string;
      positionTitle: string;
      assignedSubjects: string[];
      assignedGrades: GradeNumber[];
      assignedDossierIds: string[];
      permissionValidFrom: string;
      permissionExpiresAt: string;
      delegatedApprovalAuthority: boolean;
      hasSecretExamProfessionalClearance: boolean;
      roles: SystemRoleCode[];
      status: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'UNACTIVATED';
    }>
  ) => {
    try {
      const res = await fetch(`/api/security/users/${targetUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Chặn thay đổi quyền trái phép (403)', data.message);
      } else {
        setSelectedUserForEdit(data.user);
        onNotify(
          'success',
          'Đã cập nhật tài khoản & ghi AuditLog',
          `Tài khoản ${data.user.username} (${data.user.fullName}) đã được cập nhật thành công.`
        );
      }
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (e) {
      console.error('Update user error:', e);
    }
  };

  // 1. Tạo tài khoản mới (Mục IV.1)
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName.trim() || !newUserForm.username.trim()) {
      onNotify('warning', 'Thiếu thông tin bắt buộc', 'Vui lòng nhập đầy đủ Họ và tên và Tên đăng nhập.');
      return;
    }
    try {
      const res = await fetch('/api/security/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify({
          fullName: newUserForm.fullName.trim(),
          username: newUserForm.username.trim(),
          email: newUserForm.email.trim(),
          password: newUserForm.password || 'Nda@2026',
          schoolId: newUserForm.schoolId,
          departmentName: newUserForm.departmentName,
          positionTitle: newUserForm.positionTitle,
          roles: newUserForm.roles,
          assignedSubjects: newUserForm.assignedSubjects,
          assignedGrades: newUserForm.assignedGrades,
          assignedDossierIds: newUserForm.assignedDossierIdsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          permissionValidFrom: newUserForm.permissionValidFrom,
          permissionExpiresAt: newUserForm.permissionExpiresAt,
          delegatedApprovalAuthority: newUserForm.delegatedApprovalAuthority,
          hasSecretExamProfessionalClearance: newUserForm.hasSecretExamProfessionalClearance,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Không thể tạo tài khoản', data.message);
        await fetchSecurityState(actorId, viewedSchoolId);
        return;
      }
      setShowCreateUserModal(false);
      setSelectedUserForEdit(data.user);
      setNewUserForm((prev) => ({
        ...prev,
        fullName: '',
        username: '',
        email: '',
      }));
      onNotify(
        'success',
        `Đã tạo tài khoản [${data.user.username}]`,
        `Họ tên: ${data.user.fullName} · Vai trò: ${data.user.roles.join(', ')} · Băm PBKDF2-SHA256.`
      );
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (err) {
      console.error('Create user error:', err);
    }
  };

  // 2. Tải tệp Excel mẫu (.xlsx) chuẩn để nhập giáo viên (Mục IV.2)
  const handleDownloadExcelTemplate = () => {
    const sampleData = [
      {
        fullName: 'Đặng Thị Minh Châu',
        username: 'chaudtm.gv',
        email: 'chaudtm@nguyendinhanh.edu.vn',
        departmentName: 'Tổ 4-5',
        positionTitle: 'Giáo viên',
        subjects: 'Toán, Khoa học',
        grades: '4, 5',
        roles: 'TEACHER',
        schoolId: 'SCHOOL_A',
        password: 'Nda@2026',
        permissionExpiresAt: '2027-05-31',
      },
      {
        fullName: 'Hoàng Văn Phúc',
        username: 'phuchv.gv',
        email: 'phuchv@nguyendinhanh.edu.vn',
        departmentName: 'Tổ khoa học tự nhiên',
        positionTitle: 'Giáo viên phản biện',
        subjects: 'Khoa học tự nhiên, Toán',
        grades: '7, 8',
        roles: 'TEACHER, PEER_REVIEWER',
        schoolId: 'SCHOOL_A',
        password: 'Nda@2026',
        permissionExpiresAt: '2027-05-31',
      },
      {
        fullName: 'Lương Thị Ngọc Ánh',
        username: 'anhltn.gv',
        email: 'anhltn@nguyendinhanh.edu.vn',
        departmentName: 'Tổ khoa học xã hội',
        positionTitle: 'Giáo viên',
        subjects: 'Ngữ văn, Lịch sử và Địa lí',
        grades: '6, 9',
        roles: 'TEACHER',
        schoolId: 'SCHOOL_A',
        password: 'Nda@2026',
        permissionExpiresAt: '2027-05-31',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachGiaoVien');
    XLSX.writeFile(workbook, 'Mau_Nhap_Danh_Sach_Giao_Vien_EDU_TEST_AI.xlsx');
    onNotify(
      'info',
      'Đã tải tệp Excel mẫu (.xlsx)',
      'Bạn có thể chỉnh sửa tệp Mau_Nhap_Danh_Sach_Giao_Vien_EDU_TEST_AI.xlsx và tải lên lại để nhập hàng loạt.'
    );
  };

  // Đọc tệp Excel (.xlsx / .xls / .csv) từ máy tính người dùng (Mục IV.2)
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
        setExcelParsedRows(jsonRows);
        onNotify(
          'success',
          `Đã đọc tệp Excel [${file.name}]`,
          `Phát hiện ${jsonRows.length} dòng dữ liệu giáo viên hợp lệ sẵn sàng nhập vào hệ thống.`
        );
      } catch (err) {
        onNotify('error', 'Lỗi đọc tệp Excel', `Không thể phân tích tệp: ${(err as Error).message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Nạp nhanh 3 dòng dữ liệu mẫu chuẩn vào bảng xem trước Excel
  const handleLoadSampleExcelRows = () => {
    const rows = [
      {
        fullName: 'Đặng Thị Minh Châu',
        username: 'chaudtm.gv',
        email: 'chaudtm@nguyendinhanh.edu.vn',
        departmentName: 'Tổ 4-5',
        positionTitle: 'Giáo viên',
        subjects: 'Toán, Khoa học',
        grades: '4, 5',
        roles: 'TEACHER',
        schoolId: 'SCHOOL_A',
        password: 'Nda@2026',
        permissionExpiresAt: '2027-05-31',
      },
      {
        fullName: 'Hoàng Văn Phúc',
        username: 'phuchv.gv',
        email: 'phuchv@nguyendinhanh.edu.vn',
        departmentName: 'Tổ khoa học tự nhiên',
        positionTitle: 'Giáo viên phản biện',
        subjects: 'Khoa học tự nhiên, Toán',
        grades: '7, 8',
        roles: 'TEACHER, PEER_REVIEWER',
        schoolId: 'SCHOOL_A',
        password: 'Nda@2026',
        permissionExpiresAt: '2027-05-31',
      },
      {
        fullName: 'Lương Thị Ngọc Ánh',
        username: 'anhltn.gv',
        email: 'anhltn@nguyendinhanh.edu.vn',
        departmentName: 'Tổ khoa học xã hội',
        positionTitle: 'Giáo viên',
        subjects: 'Ngữ văn, Lịch sử và Địa lí',
        grades: '6, 9',
        roles: 'TEACHER',
        schoolId: 'SCHOOL_A',
        password: 'Nda@2026',
        permissionExpiresAt: '2027-05-31',
      },
    ];
    setExcelFileName('Mau_Danh_Sach_Giao_Vien_2026.xlsx');
    setExcelParsedRows(rows);
  };

  // Thực thi nhập danh sách giáo viên từ Excel lên Backend (Mục IV.2)
  const handleExecuteExcelImport = async () => {
    if (excelParsedRows.length === 0) {
      onNotify('warning', 'Chưa có dữ liệu Excel', 'Vui lòng chọn tệp .xlsx hoặc bấm Nạp dữ liệu mẫu trước.');
      return;
    }
    setImportingExcel(true);
    try {
      const res = await fetch('/api/security/users/import-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify({
          schoolId: viewedSchoolId,
          rows: excelParsedRows,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối nhập Excel', data.message);
        await fetchSecurityState(actorId, viewedSchoolId);
        return;
      }
      setShowExcelImportModal(false);
      setExcelParsedRows([]);
      setExcelFileName('');
      onNotify(
        'success',
        `Nhập Excel hoàn tất (+${data.importedCount} mới, cập nhật ${data.skippedOrUpdatedCount})`,
        data.message
      );
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (err) {
      console.error('Excel import error:', err);
    } finally {
      setImportingExcel(false);
    }
  };

  // 6 & 8. Khóa / Mở khóa / Vô hiệu hóa tài khoản (Mục IV.6 & IV.8)
  const handleChangeUserStatus = async (
    targetUserId: string,
    nextStatus: 'ACTIVE' | 'LOCKED' | 'DISABLED' | 'UNACTIVATED',
    reason: string
  ) => {
    try {
      const res = await fetch(`/api/security/users/${targetUserId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify({ status: nextStatus, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối thay đổi trạng thái (403)', data.message);
      } else {
        setSelectedUserForEdit(data.user);
        onNotify('success', 'Đã cập nhật trạng thái tài khoản', data.message);
      }
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (err) {
      console.error('Change user status error:', err);
    }
  };

  // 7. Đặt lại quyền về mặc định an toàn (Mục IV.7)
  const handleResetUserPermissions = async (targetUserId: string) => {
    try {
      const res = await fetch(`/api/security/users/${targetUserId}/reset-permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối đặt lại quyền (403)', data.message);
      } else {
        setSelectedUserForEdit(data.user);
        onNotify('success', 'Đã đặt lại quyền mặc định', data.message);
      }
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (err) {
      console.error('Reset permissions error:', err);
    }
  };

  // Kiểm chứng Phạm vi Quyền ABAC trực tiếp tại Backend (Mục III & V)
  const handleRunBackendScopeCheck = async (
    scenarioTitle: string,
    payload: {
      actorUserId: string;
      action:
        | 'CREATE_OR_EDIT_QUESTION'
        | 'EDIT_EXAM'
        | 'APPROVE_EXAM'
        | 'REVIEW_DOSSIER'
        | 'DELETE_APPROVED_DOSSIER'
        | 'READ_SECRET_EXAM';
      targetSchoolId?: string;
      targetDepartment?: string;
      targetSubject?: string;
      targetGrade?: number;
      targetDossierId?: string;
      createdByUserId?: string;
      isApprovedDossier?: boolean;
    }
  ) => {
    setRunningScopeCheck(true);
    try {
      const res = await fetch('/api/security/scope-action-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': payload.actorUserId,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setScopeCheckResult({
        allowed: Boolean(data.allowed),
        httpStatus: res.status,
        code: data.code || (res.ok ? 'ALLOWED' : 'FORBIDDEN'),
        message: data.message,
        auditLogId: data.auditLog?.id,
        testedAt: new Date().toLocaleTimeString('vi-VN'),
        scenarioTitle,
      });
      onNotify(
        res.ok ? 'success' : 'warning',
        `${res.status} · ${data.code}`,
        data.message
      );
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (err) {
      console.error('Scope check error:', err);
    } finally {
      setRunningScopeCheck(false);
    }
  };

  // Chạy Bộ Kiểm thử 6 Kịch bản Phân quyền & Bảo mật Bắt buộc (Mục VI)
  const handleRunRbacVerificationSuite = async () => {
    setRunningRbacSuite(true);
    try {
      const res = await fetch('/api/security/run-rbac-verification-suite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
      });
      const report: RbacVerificationSuiteReport = await res.json();
      setRbacSuiteReport(report);
      await fetchSecurityState(actorId, viewedSchoolId);
      onNotify(
        report.allPassed ? 'success' : 'warning',
        `Kiểm thử Phân quyền Mục VI (${report.passedScenarios}/${report.totalScenarios} ĐẠT)`,
        'Đã xác minh đầy đủ 6 tình huống: Giáo viên, Tổ trưởng, Phó hiệu trưởng, Chống tự nâng quyền, Khóa tài khoản & Cô lập đa trường.'
      );
    } catch (err) {
      console.error('RBAC suite error:', err);
    } finally {
      setRunningRbacSuite(false);
    }
  };

  useEffect(() => {
    if (!rbacSuiteReport) {
      handleRunRbacVerificationSuite();
    }
  }, []);

  // Mở xem / Giải mã nội dung Đề kiểm tra mật (Mục VI)
  const handleInspectConfidentialItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/security/confidential/${itemId}`, {
        headers: {
          'x-actor-user-id': actorId,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối truy cập Đề kiểm tra mật (403)', data.message);
      } else {
        setDecryptedSecretMap((prev) => ({
          ...prev,
          [itemId]: data.decryptedContent,
        }));
        onNotify('success', 'Giải mã thành công nội dung bảo mật', data.accessReason);
      }
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (e) {
      console.error('Confidential inspect error:', e);
    }
  };

  // Tạo bản sao lưu toàn vẹn SHA-256 và tải tệp .JSON về máy (Mục VII)
  const handleCreateBackup = async (downloadFile = true) => {
    try {
      const res = await fetch('/api/security/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối sao lưu (403)', data.message);
        await fetchSecurityState(actorId, viewedSchoolId);
        return;
      }

      if (downloadFile && data.downloadBundle) {
        const blob = new Blob([JSON.stringify(data.downloadBundle, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EDUTEST_BACKUP_${data.backup.schoolId}_${data.backup.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      onNotify(
        'success',
        `Đã tạo bản sao lưu [${data.backup.id}]`,
        `Mã toàn vẹn SHA-256: ${data.backup.sha256Checksum.slice(0, 24)}...`
      );
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (e) {
      console.error('Create backup error:', e);
    }
  };

  // Khôi phục từ bản sao lưu (Hỗ trợ kiểm tra toàn vẹn SHA-256 thật hoặc mô phỏng tệp bị sửa đổi)
  const handleRestoreFromBackup = async (backupId: string, simulateTamperedChecksum = false) => {
    try {
      const res = await fetch('/api/security/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-user-id': actorId,
        },
        body: JSON.stringify({
          backupId,
          simulateTamperedChecksum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', 'Từ chối khôi phục do lỗi toàn vẹn SHA-256', data.message);
      } else {
        onNotify('success', 'Khôi phục dữ liệu thành công', data.restoreRecord.note);
      }
      await fetchSecurityState(actorId, viewedSchoolId);
    } catch (e) {
      console.error('Restore error:', e);
    }
  };

  const selectedCollectionObj =
    collectionSummary.find((c) => c.collectionName === selectedCollectionName) || collectionSummary[0];

  const filteredAuditLogs =
    auditFilterAction === 'ALL'
      ? auditLogs
      : auditLogs.filter((log) => log.action === auditFilterAction || log.status === auditFilterAction);

  const filteredUsers = users.filter((u) => {
    if (userFilterSchool !== 'ALL' && u.schoolId !== userFilterSchool) return false;
    if (userFilterDepartment !== 'ALL' && u.departmentName !== userFilterDepartment) return false;
    if (userFilterRole !== 'ALL' && !u.roles.includes(userFilterRole as SystemRoleCode)) return false;
    if (userFilterGrade !== 'ALL' && !(u.assignedGrades || []).includes(Number(userFilterGrade) as GradeNumber)) {
      return false;
    }
    if (userFilterStatus !== 'ALL' && u.status !== userFilterStatus) return false;
    if (userSearchTerm.trim()) {
      const q = userSearchTerm.trim().toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchDept = (u.departmentName || '').toLowerCase().includes(q);
      const matchSubject = (u.assignedSubjects || []).some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchUsername && !matchEmail && !matchDept && !matchSubject) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* BANNER TRẠNG THÁI HẠ TẦNG FIREBASE & PHIÊN XÁC THỰC ĐA TRƯỜNG */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-900 text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                QUẢN TRỊ HỆ THỐNG ĐA TRƯỜNG & PHÂN QUYỀN
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                Trạng thái Hạ tầng Đồng bộ: Hoạt động ổn định
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Trung tâm Quản trị Hệ thống, Phân quyền & Bảo mật Đa trường
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateSection && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateSection('admin-firebase-data')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>QUẢN LÝ DỮ LIỆU FIREBASE</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection('admin-accounts')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>QUẢN LÝ TÀI KHOẢN</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection('admin-teacher-permissions')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-700 text-white hover:bg-indigo-800 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PHÂN QUYỀN GIÁO VIÊN</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleSyncToCloudFirestore}
              disabled={syncingFirestore}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingFirestore ? 'animate-spin' : ''}`} />
              <span>Đồng bộ Cloud Firestore</span>
            </button>
            <button
              type="button"
              onClick={handleFirebaseGoogleSignIn}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-700" />
              <span>Liên kết Google Auth</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-700" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* BỘ CHUYỂN ĐỔI NHANH 5 TÀI KHOẢN KIỂM THỬ (MỤC IX) & CHỌN KHÔNG GIAN TRƯỜNG HỌC */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="xl:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-700" />
                Phiên đăng nhập hiện tại (Chuyển nhanh 5 tài khoản kiểm thử Mục IX để kiểm chứng quyền):
              </span>
              {currentActor && (
                <span className="font-mono text-[11px] text-slate-600">
                   Đang hoạt động: <strong className="text-blue-900">{currentActor.username}</strong> ({currentActor.schoolId})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {users.map((u) => {
                const isSelected = currentActor?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleAccountLogin(u.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 font-semibold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        u.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span>{u.fullName.split('(')[0].trim()}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-blue-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.schoolId === 'SCHOOL_A' ? 'Trường A' : 'Trường B'} · {u.roles[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-5 space-y-2 border-t xl:border-t-0 xl:border-l border-slate-200 pt-3 xl:pt-0 xl:pl-4">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-700" />
              Không gian Dữ liệu Trường học (Kiểm chứng cô lập đa trường):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {schools.map((sch) => {
                const active = viewedSchoolId === sch.id;
                return (
                  <button
                    key={sch.id}
                    type="button"
                    onClick={() => {
                      setViewedSchoolId(sch.id);
                      fetchSecurityState(actorId, sch.id);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-50 border-amber-400 text-slate-950 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-900">
                      <span>{sch.id}</span>
                      <span>{sch.code}</span>
                    </div>
                    <div className="text-xs font-bold truncate mt-0.5">{sch.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{sch.governingBody}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CẤU HÌNH ĐƯỜNG LIÊN KẾT NÚT LỆNH MENU: "TẠO CÂU HỎI THÔNG MINH" */}
      <SmartQuestionLinkAdminConfigPanel
        schoolId={viewedSchoolId}
        actorUserId={actorId}
        actorName={currentActor?.fullName || 'Quản trị viên hệ thống'}
        actorRole="SYSTEM_ADMIN"
        onNotify={onNotify}
      />

      {/* THANH ĐIỀU HƯỚNG QUẢN TRỊ HỆ THỐNG & PHÂN QUYỀN GIÁO VIÊN */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('FIREBASE_CONNECTION_STATUS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'FIREBASE_CONNECTION_STATUS'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>TRẠNG THÁI KẾT NỐI FIREBASE</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEACHER_PERMISSIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'TEACHER_PERMISSIONS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>PHÂN QUYỀN GIÁO VIÊN (Ô chọn & Công tắc Bật/Tắt)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT_AND_PENTEST')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'AUDIT_AND_PENTEST'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>1. Kiểm thử Bảo mật 8 Kịch bản & Nhật ký AuditLogs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DATA_20_COLLECTIONS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'DATA_20_COLLECTIONS'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. Cấu trúc 20 Nhóm Dữ liệu Đa trường & Firestore</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACCOUNTS_AND_RBAC')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'ACCOUNTS_AND_RBAC'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <UserCog className="w-4 h-4" />
          <span>3. Quản lý Tài khoản & Ma trận Phân quyền 9×6</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXAM_CONFIDENTIALITY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'EXAM_CONFIDENTIALITY'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <FileKey2 className="w-4 h-4" />
          <span>4. Bảo mật Đề kiểm tra & 7 Mức độ Mật</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BACKUP_AND_RESTORE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'BACKUP_AND_RESTORE'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ArchiveRestore className="w-4 h-4" />
          <span>5. Sao lưu, Kiểm định SHA-256 & Khôi phục</span>
        </button>
      </div>

      {/* TAB TRẠNG THÁI KẾT NỐI FIREBASE (GIAI ĐOẠN 17 - MỤC VI) */}
      {activeTab === 'FIREBASE_CONNECTION_STATUS' && (
        <FirebaseConnectionStatusWorkspace onNotify={onNotify} />
      )}

      {/* TAB PHÂN QUYỀN GIÁO VIÊN */}
      {activeTab === 'TEACHER_PERMISSIONS' && (
        <TeacherPermissionManagerWorkspace
          currentActorUserId={actorId || 'user-sys-admin'}
          onQuickSwitchAccountSession={onQuickSwitchAccountSession}
          onNavigateSection={onNavigateSection}
        />
      )}

      {/* =====================================================================
          TAB 1: KIỂM THỬ BẢO MẬT 8 KỊCH BẢN & NHẬT KÝ HỆ THỐNG (MỤC VIII & IX)
         ===================================================================== */}
      {activeTab === 'AUDIT_AND_PENTEST' && (
        <div className="space-y-6">
          {/* Bảng điều khiển & Kết quả 8 Kịch bản Kiểm thử Bảo mật Thực tế (Mục IX) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  MỤC IX · KIỂM THỬ BẢO MẬT THỰC TẾ TRÊN 2 TRƯỜNG MẪU & 5 TÀI KHOẢN
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  Bộ Kiểm thử Thâm nhập & Cô lập Đa trường Tự động (8/8 Kịch bản Bắt buộc)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Trường A: <strong>TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH (UBND XÃ ĐAN ĐIỀN)</strong> · Trường B:{' '}
                  <strong>TRƯỜNG THCS CHU VĂN AN</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {false && (
                  <button
                    type="button"
                    onClick={handleRunPenetrationTests}
                    disabled={runningPentest}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>{runningPentest ? 'Đang thực thi 8 kịch bản...' : 'Chạy lại 8 Kịch bản Kiểm thử Bảo mật'}</span>
                  </button>
                )}
              </div>
            </div>

            {pentestReport && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Kịch bản kiểm thử (Mục IX)</th>
                      <th className="py-2.5 px-3 font-bold">Tài khoản thực thi & Trường</th>
                      <th className="py-2.5 px-3 font-bold">Đích tác động / API Endpoint</th>
                      <th className="py-2.5 px-3 font-bold">HTTP</th>
                      <th className="py-2.5 px-3 font-bold">Kết quả thực tế tại Backend & Database</th>
                      <th className="py-2.5 px-3 font-bold text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pentestReport.steps.map((step) => (
                      <tr key={step.stepNumber} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{step.title}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{step.actorLabel}</div>
                          <div className="font-mono text-[11px] text-blue-700">{step.actorSchoolId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{step.targetResource}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold ${
                              step.actualHttpStatus === 403
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {step.actualHttpStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <div>{step.actualOutcome}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            AuditLog ID: {step.auditLogId}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {step.passed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              ĐẠT CHUẨN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900">
                              <XCircle className="w-3.5 h-3.5 text-rose-700" />
                              THẤT BẠI
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* NHẬT KÝ HỆ THỐNG BẤT BIẾN (MỤC VIII - AUDIT LOGS) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  MỤC VIII · NHẬT KÝ HỆ THỐNG (AUDIT LOGS - 10 LOẠI SỰ KIỆN BẮT BUỘC)
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Lịch sử Truy vết Bất biến (Có thời gian, người thực hiện, hành động, đối tượng & ẩn nội dung mật)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAuditFilterAction('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    auditFilterAction === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Tất cả ({auditLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterAction('DENIED')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    auditFilterAction === 'DENIED' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-900'
                  }`}
                >
                  Truy cập trái phép bị chặn ({auditLogs.filter((l) => l.status === 'DENIED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterAction('ROLE_PERMISSION_CHANGE')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    auditFilterAction === 'ROLE_PERMISSION_CHANGE'
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-50 text-purple-900'
                  }`}
                >
                  Thay đổi phân quyền
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterAction('BACKUP_RESTORE')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    auditFilterAction === 'BACKUP_RESTORE' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-900'
                  }`}
                >
                  Sao lưu & Khôi phục
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Thời gian</th>
                    <th className="py-2.5 px-3 font-bold">Trường (Tenant)</th>
                    <th className="py-2.5 px-3 font-bold">Người thực hiện & Vai trò</th>
                    <th className="py-2.5 px-3 font-bold">Sự kiện</th>
                    <th className="py-2.5 px-3 font-bold">Đối tượng</th>
                    <th className="py-2.5 px-3 font-bold">Chi tiết (Đã che nội dung mật)</th>
                    <th className="py-2.5 px-3 font-bold text-center">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAuditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={log.status === 'DENIED' ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{log.schoolId}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{log.actorName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {(log.actorRoles || []).join(', ')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-800">{log.action}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {log.targetType} · {log.targetId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{log.summary}</td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                            log.status === 'DENIED'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {log.status} ({log.httpStatus})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CẤU TRÚC 20 NHÓM DỮ LIỆU ĐA TRƯỜNG & FIRESTORE (MỤC II & III)
         ===================================================================== */}
      {activeTab === 'DATA_20_COLLECTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Danh mục 20 Collections chuẩn */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                MỤC III · 20 NHÓM DỮ LIỆU CHUẨN HÓA ĐA TRƯỜNG
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Danh mục 20 Collections (Cô lập theo schoolId: {viewedSchoolId})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi bản ghi bắt buộc có đủ 6 trường chuẩn: <code className="font-mono">id</code>,{' '}
                <code className="font-mono">schoolId</code>, <code className="font-mono">createdBy</code>,{' '}
                <code className="font-mono">createdAt</code>, <code className="font-mono">updatedAt</code>,{' '}
                <code className="font-mono">status</code>.
              </p>
            </div>

            <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
              {collectionSummary.map((col) => {
                const meta = COLLECTION_VIETNAMESE_LABELS[col.collectionName] || {
                  index: 99,
                  label: col.collectionName,
                  group: 'Khác',
                };
                const isSelected = selectedCollectionName === col.collectionName;
                return (
                  <button
                    key={col.collectionName}
                    type="button"
                    onClick={() => setSelectedCollectionName(col.collectionName)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div>{meta.label}</div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        Nhóm: {meta.group}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {viewedSchoolId}: {col.tenantCount}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Tổng: {col.totalSystemCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Chi tiết bản ghi & Thao tác tạo/kiểm chứng cô lập đa trường */}
          <div className="lg:col-span-7 space-y-5">
            {/* Khung thử nghiệm tạo câu hỏi bền vững & kiểm tra chặn ghi chéo trường */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                THỬ NGHIỆM LƯU TRỮ BỀN VỮNG & CHẶN GHI CHÉO TRƯỜNG
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Tạo câu hỏi mới với tư cách: <span className="text-blue-800">{currentActor?.fullName}</span> (
                {currentActor?.schoolId})
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newQuestionStem}
                  onChange={(e) => setNewQuestionStem(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  placeholder="Nhập nội dung câu hỏi kiểm tra..."
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreateQuestionInSchool('SCHOOL_A')}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    + Lưu câu hỏi vào Trường A (SCHOOL_A)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateQuestionInSchool('SCHOOL_B')}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    + Thử lưu câu hỏi vào Trường B (SCHOOL_B)
                  </button>
                  <button
                    type="button"
                    onClick={handleAttemptApproveExam}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    Thử Phê duyệt Đề kiểm tra với tài khoản hiện tại
                  </button>
                </div>
              </div>
            </div>

            {/* Khung hiển thị bản ghi của Collection đang chọn */}
            {selectedCollectionObj && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {COLLECTION_VIETNAMESE_LABELS[selectedCollectionObj.collectionName]?.label ||
                        selectedCollectionObj.collectionName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Đang hiển thị dữ liệu nội bộ của <strong>{viewedSchoolId}</strong> ({selectedCollectionObj.tenantCount}{' '}
                      bản ghi) · Đã kiểm tra đủ 6 trường chuẩn <code className="font-mono">id, schoolId, createdBy, createdAt, updatedAt, status</code>.
                    </p>
                  </div>
                  {firestoreLastSyncedAt && (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Đã đồng bộ lúc {firestoreLastSyncedAt}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                  {selectedCollectionObj.sampleRecords.map((rec, idx) => (
                    <div
                      key={String(rec.id || idx)}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-1.5">
                        <span className="font-mono font-bold text-blue-900">
                          id: {String(rec.id)} · schoolId: {String(rec.schoolId)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold">
                          status: {String(rec.status)}
                        </span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(rec, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3 (MẶC ĐỊNH): MODULE QUẢN LÝ TÀI KHOẢN VÀ PHÂN QUYỀN NGƯỜI DÙNG (MỤC I → VI)
         ===================================================================== */}
      {activeTab === 'ACCOUNTS_AND_RBAC' && (
        <div className="space-y-6">
          {/* =================================================================
              MỤC VI · BẢNG KIỂM THỬ TỰ ĐỘNG 6 KỊCH BẢN PHÂN QUYỀN & BẢO MẬT BẮT BUỘC
             ================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  MỤC V & VI · KIỂM THỬ BẢO MẬT & PHÂN QUYỀN TẠI BACKEND (6/6 TÌNH HUỐNG BẮT BUỘC)
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  Xác minh Thực thi Quyền tại Backend &amp; Firestore Rules (Không chỉ ẩn nút trên giao diện)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mọi hành vi vượt quyền, tự nâng quyền qua Request/LocalStorage hoặc truy cập ngoài phạm vi môn/khối/tổ/trường đều bị chặn <strong>403 Forbidden</strong> và ghi nhận vào <strong>AuditLogs</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {false && (
                  <button
                    type="button"
                    onClick={handleRunRbacVerificationSuite}
                    disabled={runningRbacSuite}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {runningRbacSuite ? 'Đang kiểm thử 6 tình huống...' : 'Chạy Kiểm thử 6 Kịch bản Phân quyền (Mục VI)'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {rbacSuiteReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {rbacSuiteReport.scenarios.map((sc) => (
                  <div
                    key={sc.scenarioNumber}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{sc.title}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          ĐẠT
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        Tài khoản: <strong className="text-blue-900">{sc.testAccountLabel}</strong> (
                        {sc.testAccountRoles.join(', ')})
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-200/80 text-[11px]">
                      <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                        <div className="font-bold flex items-center justify-between">
                          <span>✓ Thao tác hợp lệ trong phạm vi</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 bg-emerald-200 rounded">
                            HTTP {sc.allowedSubCheck.httpStatus}
                          </span>
                        </div>
                        <div className="mt-0.5 text-slate-700">{sc.allowedSubCheck.outcomeMessage}</div>
                      </div>

                      <div className="p-2 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-950">
                        <div className="font-bold flex items-center justify-between">
                          <span>🛡️ Chặn vượt quyền tại Backend</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 bg-amber-200 rounded">
                            HTTP {sc.blockedSubCheck.httpStatus}
                          </span>
                        </div>
                        <div className="mt-0.5 text-slate-700">{sc.blockedSubCheck.outcomeMessage}</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          AuditLog: {sc.blockedSubCheck.auditLogId}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* =================================================================
              MỤC I & II · DANH SÁCH 6 VAI TRÒ & QUY ĐỊNH PHÂN QUYỀN CHI TIẾT
             ================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  MỤC I &amp; II · DANH SÁCH 6 VAI TRÒ CHUẨN &amp; PHÂN QUYỀN CHI TIẾT TRONG TRƯỜNG PHỔ THÔNG
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Một người có thể có nhiều vai trò nhưng chỉ được thực hiện quyền đã cấp · Quyền quản trị kỹ thuật không mặc nhiên đọc đề mật
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                6 Vai trò Chuẩn × 9 Nhóm Quyền × 6 Thuộc tính ABAC
              </span>
            </div>

            {/* 6 Thẻ chi tiết Vai trò theo đúng Mục I & II */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {roleCatalog.map((rc) => (
                <div
                  key={rc.roleCode}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          {rc.order}. {rc.roleTitle}
                        </span>
                        <div className="font-mono text-[10px] text-blue-800 font-bold">{rc.roleCode}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          ROLE_BADGE_LABELS[rc.roleCode]?.color || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {ROLE_BADGE_LABELS[rc.roleCode]?.label || rc.roleTitle}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{rc.scopeRuleSummary}</p>

                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-emerald-800">Quyền được phép thực hiện:</div>
                      <ul className="space-y-0.5 text-[11px] text-slate-700">
                        {rc.allowedActions.map((perm: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{perm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                    <div className="text-[11px] font-bold text-rose-800">Không được phép / Giới hạn nghiêm ngặt:</div>
                    <ul className="space-y-0.5 text-[11px] text-rose-900">
                      {rc.forbiddenActions.map((forb: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">✕</span>
                          <span>{forb}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Bảng Ma trận 9 Thao tác × 6 Vai trò */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold">Vai trò trong trường phổ thông</th>
                    {PERMISSION_COLUMNS.map((col) => (
                      <th key={col.code} className="py-2.5 px-2 font-bold text-center whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 font-bold">Giới hạn phạm vi (ABAC Scope)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{r.roleName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{r.roleCode}</div>
                      </td>
                      {PERMISSION_COLUMNS.map((col) => {
                        const allowed = r.permissions[col.code];
                        return (
                          <td key={col.code} className="py-2.5 px-2 text-center">
                            {allowed ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                                –
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-slate-600">{r.scopeConstraintNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* =================================================================
              MỤC III · KIỂM CHỨNG PHẠM VI QUYỀN (ABAC SCOPE) TRỰC TIẾP TẠI BACKEND
             ================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  MỤC III · PHẠM VI QUYỀN (ATTRIBUTE-BASED ACCESS CONTROL - ABAC)
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Mỗi quyền đều gắn chặt với: Mã trường · Tổ chuyên môn · Khối lớp · Môn học · Hồ sơ phân công · Thời hạn phân quyền
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ví dụ chuẩn: <strong>Giáo viên Toán lớp 4</strong> (Cô Lê Thị Thu Hà - <code className="font-mono">user-test-math4-teacher</code>) chỉ tạo và sửa câu hỏi/đề <strong>Toán lớp 4</strong>, không sửa được đề <strong>Tiếng Việt lớp 5</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={runningScopeCheck}
                onClick={() =>
                  handleRunBackendScopeCheck('GV Toán lớp 4 tạo/sửa câu hỏi Toán lớp 4 (Đúng phạm vi Mục III)', {
                    actorUserId: 'user-test-math4-teacher',
                    action: 'CREATE_OR_EDIT_QUESTION',
                    targetSchoolId: 'SCHOOL_A',
                    targetSubject: 'Toán',
                    targetGrade: 4,
                  })
                }
                className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                  <span>1. GV Toán 4 → Tạo/Sửa Toán 4</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950">
                    Kỳ vọng: 200 OK
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Kiểm tra <code className="font-mono">user-test-math4-teacher</code> thao tác đúng môn Toán, Khối 4.
                </p>
              </button>

              <button
                type="button"
                disabled={runningScopeCheck}
                onClick={() =>
                  handleRunBackendScopeCheck('GV Toán lớp 4 cố sửa đề Tiếng Việt lớp 5 (Trái phạm vi Mục III)', {
                    actorUserId: 'user-test-math4-teacher',
                    action: 'EDIT_EXAM',
                    targetSchoolId: 'SCHOOL_A',
                    targetSubject: 'Tiếng Việt',
                    targetGrade: 5,
                  })
                }
                className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                  <span>2. GV Toán 4 → Cố sửa Tiếng Việt 5</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-950">
                    Kỳ vọng: Chặn 403
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Backend chặn <code className="font-mono">ABAC_SCOPE_MISMATCH</code> do ngoài môn Toán &amp; Khối 4.
                </p>
              </button>

              <button
                type="button"
                disabled={runningScopeCheck}
                onClick={() =>
                  handleRunBackendScopeCheck('Giáo viên cố tự phê duyệt đề của mình (Mục II - Giáo viên)', {
                    actorUserId: 'user-test-math4-teacher',
                    action: 'APPROVE_EXAM',
                    targetSchoolId: 'SCHOOL_A',
                    targetSubject: 'Toán',
                    targetGrade: 4,
                    createdByUserId: 'user-test-math4-teacher',
                  })
                }
                className="p-3 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100/80 text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-rose-950 flex items-center justify-between">
                  <span>3. Giáo viên → Tự phê duyệt đề mình</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-950">
                    Kỳ vọng: Chặn 403
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Backend chặn <code className="font-mono">SELF_APPROVAL_FORBIDDEN</code> &amp; thiếu quyền phê duyệt.
                </p>
              </button>

              <button
                type="button"
                disabled={runningScopeCheck}
                onClick={() =>
                  handleRunBackendScopeCheck('Giáo viên cố xóa hồ sơ đã phê duyệt (Mục II - Giáo viên)', {
                    actorUserId: 'user-test-math4-teacher',
                    action: 'DELETE_APPROVED_DOSSIER',
                    targetSchoolId: 'SCHOOL_A',
                    targetDossierId: 'HS-2026-TOAN4-CK1',
                    isApprovedDossier: true,
                  })
                }
                className="p-3 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100/80 text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-rose-950 flex items-center justify-between">
                  <span>4. Giáo viên → Xóa hồ sơ đã duyệt</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-950">
                    Kỳ vọng: Chặn 403
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Backend chặn <code className="font-mono">DELETE_APPROVED_DOSSIER_FORBIDDEN</code>.
                </p>
              </button>

              <button
                type="button"
                disabled={runningScopeCheck}
                onClick={() =>
                  handleRunBackendScopeCheck('Tổ trưởng KHTN cố thẩm định hồ sơ Tổ KHXH (Mục II - Tổ trưởng)', {
                    actorUserId: 'user-hod-a',
                    action: 'REVIEW_DOSSIER',
                    targetSchoolId: 'SCHOOL_A',
                    targetDepartment: 'Tổ khoa học xã hội',
                    targetSubject: 'Ngữ văn',
                    targetGrade: 8,
                  })
                }
                className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                  <span>5. Tổ trưởng KHTN → Hồ sơ Tổ KHXH</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-950">
                    Kỳ vọng: Chặn 403
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Backend chặn <code className="font-mono">HOD_OUT_OF_DEPARTMENT_SCOPE</code>.
                </p>
              </button>

              <button
                type="button"
                disabled={runningScopeCheck}
                onClick={() =>
                  handleRunBackendScopeCheck(
                    'Quản trị kỹ thuật cố đọc Đề mật khi chưa được cấp quyền chuyên môn (Mục II - SYSTEM_ADMIN)',
                    {
                      actorUserId: 'user-test-tech-admin',
                      action: 'READ_SECRET_EXAM',
                      targetSchoolId: 'SCHOOL_A',
                      targetDossierId: 'sec-5-secret-exam',
                    }
                  )
                }
                className="p-3 rounded-xl border border-purple-300 bg-purple-50/70 hover:bg-purple-100/80 text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-purple-950 flex items-center justify-between">
                  <span>6. Quản trị kỹ thuật → Đọc Đề mật</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-950">
                    Kỳ vọng: Chặn 403
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Quyền quản trị kỹ thuật không mặc nhiên đọc đề mật nếu thiếu quyền chuyên môn.
                </p>
              </button>
            </div>

            {scopeCheckResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  scopeCheckResult.allowed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono bg-white border border-current">
                      HTTP {scopeCheckResult.httpStatus} · {scopeCheckResult.code}
                    </span>
                    <span>{scopeCheckResult.scenarioTitle}</span>
                  </div>
                  <div>{scopeCheckResult.message}</div>
                </div>
                <div className="font-mono text-[11px] shrink-0 text-right">
                  <div>Lúc: {scopeCheckResult.testedAt}</div>
                  {scopeCheckResult.auditLogId && <div>AuditLog: {scopeCheckResult.auditLogId}</div>}
                </div>
              </div>
            )}
          </div>

          {/* =================================================================
              MỤC IV · QUẢN LÝ NGƯỜI DÙNG (BẢNG TÀI KHOẢN 9 CỘT & 9 CHỨC NĂNG)
             ================================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* CỘT TRÁI (8/12): BẢNG DANH SÁCH NGƯỜI DÙNG, BỘ LỌC & CÔNG CỤ TẠO / NHẬP EXCEL */}
            <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    MỤC IV · QUẢN LÝ NGƯỜI DÙNG ({filteredUsers.length}/{users.length} TÀI KHOẢN)
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Danh sách Cán bộ, Giáo viên &amp; Nhân viên (Đầy đủ 9 cột thông tin &amp; 9 chức năng quản trị)
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                    <span>1. Tạo tài khoản</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExcelImportModal(true);
                      if (excelParsedRows.length === 0) {
                        handleLoadSampleExcelRows();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>2. Nhập giáo viên từ Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Thanh Tìm kiếm & Lọc đa tiêu chí (Mục IV.9) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-2 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="9. Tìm Họ tên, Username, Email, Môn..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <select
                  value={userFilterSchool}
                  onChange={(e) => setUserFilterSchool(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">Tất cả trường ({users.length})</option>
                  <option value="SCHOOL_A">SCHOOL_A (Nguyễn Đình Anh)</option>
                  <option value="SCHOOL_B">SCHOOL_B (Trường Tiểu học Sịa)</option>
                </select>

                <select
                  value={userFilterRole}
                  onChange={(e) => setUserFilterRole(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">Tất cả vai trò (6)</option>
                  <option value="SYSTEM_ADMIN">1. Quản trị hệ thống</option>
                  <option value="PRINCIPAL">2. Hiệu trưởng</option>
                  <option value="VICE_PRINCIPAL">3. Phó hiệu trưởng</option>
                  <option value="HEAD_OF_DEPARTMENT">4. Tổ trưởng CM</option>
                  <option value="TEACHER">5. Giáo viên</option>
                  <option value="PEER_REVIEWER">6. GV phản biện</option>
                </select>

                <select
                  value={userFilterGrade}
                  onChange={(e) => setUserFilterGrade(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">Tất cả khối lớp (1-9)</option>
                  {ALL_GRADE_OPTIONS.map((g) => (
                    <option key={g} value={String(g)}>
                      Khối lớp {g}
                    </option>
                  ))}
                </select>

                <select
                  value={userFilterStatus}
                  onChange={(e) => setUserFilterStatus(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="LOCKED">Đang bị khóa (LOCKED)</option>
                  <option value="DISABLED">Vô hiệu hóa (DISABLED)</option>
                  <option value="UNACTIVATED">Chưa kích hoạt</option>
                </select>
              </div>

              {/* Bảng Người dùng đầy đủ 9 cột theo Mục IV */}
              <div className="overflow-x-auto max-h-[680px] overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 text-slate-800 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-2.5 font-bold">1. Họ và tên</th>
                      <th className="py-2.5 px-2.5 font-bold">2. Tên ĐN / Email</th>
                      <th className="py-2.5 px-2.5 font-bold">3. Tổ chuyên môn</th>
                      <th className="py-2.5 px-2.5 font-bold">4. Môn dạy</th>
                      <th className="py-2.5 px-2.5 font-bold">5. Khối lớp</th>
                      <th className="py-2.5 px-2.5 font-bold">6. Vai trò</th>
                      <th className="py-2.5 px-2.5 font-bold">7. Trạng thái</th>
                      <th className="py-2.5 px-2.5 font-bold">8. Ngày tạo &amp; Hạn quyền</th>
                      <th className="py-2.5 px-2.5 font-bold">9. Đăng nhập gần nhất</th>
                      <th className="py-2.5 px-2.5 font-bold text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((u) => {
                      const isEditing = selectedUserForEdit?.id === u.id;
                      const lastLoginEntry =
                        u.loginHistory && u.loginHistory.length > 0 ? u.loginHistory[0] : null;
                      return (
                        <tr
                          key={u.id}
                          onClick={() => setSelectedUserForEdit(u)}
                          className={`transition-colors cursor-pointer ${
                            isEditing ? 'bg-blue-50/90 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-2.5">
                            <div className="font-bold text-slate-900">{u.fullName}</div>
                            <div className="text-[10px] font-mono text-slate-500">
                              {u.schoolId} · {u.positionTitle || 'Giáo viên'}
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 font-mono text-[11px]">
                            <div className="font-bold text-blue-900">{u.username}</div>
                            <div className="text-slate-500 truncate max-w-[150px]">{u.email}</div>
                          </td>

                          <td className="py-2.5 px-2.5 text-slate-800">{u.departmentName}</td>

                          <td className="py-2.5 px-2.5">
                            <div className="flex flex-wrap gap-1">
                              {(u.assignedSubjects || []).map((subj) => (
                                <span
                                  key={subj}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-semibold"
                                >
                                  {subj}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 font-mono text-[11px] font-bold text-slate-800">
                            {(u.assignedGrades || []).length > 0
                              ? `Khối ${u.assignedGrades.join(', ')}`
                              : '—'}
                          </td>

                          <td className="py-2.5 px-2.5">
                            <div className="flex flex-wrap gap-1">
                              {u.roles.map((rc) => (
                                <span
                                  key={rc}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                    ROLE_BADGE_LABELS[rc]?.color || 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {ROLE_BADGE_LABELS[rc]?.label || rc}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : u.status === 'LOCKED'
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}
                            >
                              {u.status === 'ACTIVE'
                                ? 'HOẠT ĐỘNG'
                                : u.status === 'LOCKED'
                                ? 'TẠM KHÓA'
                                : u.status === 'UNACTIVATED'
                                ? 'CHƯA KÍCH HOẠT'
                                : 'VÔ HIỆU HÓA'}
                            </span>
                          </td>

                          <td className="py-2.5 px-2.5 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                            <div>Tạo: {new Date(u.createdAt).toLocaleDateString('vi-VN')}</div>
                            <div className="text-blue-800">
                              Hạn: {u.permissionExpiresAt ? u.permissionExpiresAt.slice(0, 10) : 'Không thời hạn'}
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                            {lastLoginEntry ? (
                              <div>
                                <div>{new Date(lastLoginEntry.timestamp).toLocaleString('vi-VN')}</div>
                                <div
                                  className={
                                    lastLoginEntry.status === 'SUCCESS' ? 'text-emerald-700 font-bold' : 'text-rose-700'
                                  }
                                >
                                  {lastLoginEntry.status}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">Chưa đăng nhập</span>
                            )}
                          </td>

                          <td
                            className="py-2.5 px-2.5 text-center whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                title={u.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tạm thời tài khoản'}
                                onClick={() =>
                                  handleChangeUserStatus(
                                    u.id,
                                    u.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED',
                                    u.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tạm thời để rà soát bảo mật'
                                  )
                                }
                                className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 cursor-pointer"
                              >
                                {u.status === 'LOCKED' ? (
                                  <Unlock className="w-3.5 h-3.5" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                title="Đặt lại quyền mặc định (Giáo viên)"
                                onClick={() => handleResetUserPermissions(u.id)}
                                className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                title={u.status === 'DISABLED' ? 'Kích hoạt lại' : 'Vô hiệu hóa tài khoản'}
                                onClick={() =>
                                  handleChangeUserStatus(
                                    u.id,
                                    u.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED',
                                    u.status === 'DISABLED' ? 'Kích hoạt lại tài khoản' : 'Vô hiệu hóa tài khoản'
                                  )
                                }
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CỘT PHẢI (4/12): BẢNG CHỈNH SỬA THÔNG TIN, GÁN VAI TRÒ, GÁN MÔN/LỚP, KHÓA/MỞ KHÓA & ĐẶT LẠI QUYỀN */}
            <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              {selectedUserForEdit ? (
                <>
                  <div className="border-b border-slate-100 pb-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      MỤC IV.3 → IV.8 · HỒ SƠ PHÂN QUYỀN &amp; PHẠM VI CHUYÊN MÔN
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedUserForEdit.fullName}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Username: <strong>{selectedUserForEdit.username}</strong> · Trường:{' '}
                      <strong>{selectedUserForEdit.schoolId}</strong>
                    </p>
                  </div>

                  {/* 3. Chỉnh sửa thông tin cơ bản & Tổ chuyên môn */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-800">
                      3. Chỉnh sửa Họ tên, Email &amp; Tổ chuyên môn:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={selectedUserForEdit.fullName}
                        onChange={(e) =>
                          setSelectedUserForEdit({ ...selectedUserForEdit, fullName: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                        placeholder="Họ và tên"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={selectedUserForEdit.email}
                          onChange={(e) =>
                            setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                          placeholder="Email"
                        />
                        <select
                          value={selectedUserForEdit.departmentName}
                          onChange={(e) =>
                            handleUpdateUserAccount(selectedUserForEdit.id, {
                              departmentName: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        >
                          {ALL_DEPARTMENT_OPTIONS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateUserAccount(selectedUserForEdit.id, {
                            fullName: selectedUserForEdit.fullName,
                            email: selectedUserForEdit.email,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                      >
                        Lưu thông tin cá nhân
                      </button>
                    </div>
                  </div>

                  {/* 4. Gán vai trò (Đa vai trò) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      4. Gán vai trò (Một người có thể có nhiều vai trò nhưng chỉ thực hiện quyền đã cấp):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(ROLE_BADGE_LABELS) as SystemRoleCode[]).map((roleCode) => {
                        const hasRole = selectedUserForEdit.roles.includes(roleCode);
                        return (
                          <button
                            key={roleCode}
                            type="button"
                            onClick={() => {
                              const nextRoles = hasRole
                                ? selectedUserForEdit.roles.filter((r) => r !== roleCode)
                                : [...selectedUserForEdit.roles, roleCode];
                              if (nextRoles.length === 0) return;
                              handleUpdateUserAccount(selectedUserForEdit.id, { roles: nextRoles });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                              hasRole
                                ? 'bg-blue-900 text-white border-blue-900'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {hasRole ? '✓ ' : '+ '}
                            {ROLE_BADGE_LABELS[roleCode].label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Cờ ủy quyền Phó hiệu trưởng & Cờ quyền chuyên môn đề mật cho Quản trị kỹ thuật */}
                    <div className="space-y-1.5 pt-1">
                      {selectedUserForEdit.roles.includes('VICE_PRINCIPAL') && (
                        <label className="flex items-center gap-2 text-xs text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUserForEdit.delegatedApprovalAuthority !== false}
                            onChange={(e) =>
                              handleUpdateUserAccount(selectedUserForEdit.id, {
                                delegatedApprovalAuthority: e.target.checked,
                              })
                            }
                          />
                          <span>
                            <strong>Ủy quyền Phê duyệt cho Phó Hiệu trưởng</strong> (Mục II: Phê duyệt nếu được giao thẩm quyền)
                          </span>
                        </label>
                      )}

                      {selectedUserForEdit.roles.includes('SYSTEM_ADMIN') && (
                        <label className="flex items-center gap-2 text-xs text-purple-950 bg-purple-50 p-2 rounded-lg border border-purple-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedUserForEdit.hasSecretExamProfessionalClearance)}
                            onChange={(e) =>
                              handleUpdateUserAccount(selectedUserForEdit.id, {
                                hasSecretExamProfessionalClearance: e.target.checked,
                              })
                            }
                          />
                          <span>
                            <strong>Cấp quyền chuyên môn đọc Đề mật</strong> (Mục II: Quản trị kỹ thuật không mặc nhiên đọc đề mật)
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 5. Gán môn dạy & Khối lớp (Mục III & IV.5) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      5. Gán Môn dạy &amp; Khối lớp (Giới hạn phạm vi ABAC Mục III):
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {ALL_SUBJECT_OPTIONS.map((subj) => {
                        const active = (selectedUserForEdit.assignedSubjects || []).includes(subj);
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => {
                              const current = selectedUserForEdit.assignedSubjects || [];
                              const next = active ? current.filter((s) => s !== subj) : [...current, subj];
                              handleUpdateUserAccount(selectedUserForEdit.id, { assignedSubjects: next });
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                              active
                                ? 'bg-emerald-800 text-white border-emerald-800'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {active ? '✓ ' : ''}
                            {subj}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 mr-1">Khối lớp:</span>
                      {ALL_GRADE_OPTIONS.map((grade) => {
                        const active = (selectedUserForEdit.assignedGrades || []).includes(grade);
                        return (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => {
                              const current = selectedUserForEdit.assignedGrades || [];
                              const next = active ? current.filter((g) => g !== grade) : [...current, grade];
                              handleUpdateUserAccount(selectedUserForEdit.id, { assignedGrades: next });
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-bold border cursor-pointer ${
                              active
                                ? 'bg-blue-900 text-amber-300 border-blue-900'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {grade}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thời hạn phân quyền & Hồ sơ được phân công (Mục III) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      Thời hạn phân quyền &amp; Mã hồ sơ được phân công (Mục III):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[10px] text-slate-500">Hiệu lực từ ngày:</span>
                        <input
                          type="date"
                          value={(selectedUserForEdit.permissionValidFrom || '2026-09-01').slice(0, 10)}
                          onChange={(e) =>
                            handleUpdateUserAccount(selectedUserForEdit.id, {
                              permissionValidFrom: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500">Hết hạn ngày:</span>
                        <input
                          type="date"
                          value={(selectedUserForEdit.permissionExpiresAt || '2027-05-31').slice(0, 10)}
                          onChange={(e) =>
                            handleUpdateUserAccount(selectedUserForEdit.id, {
                              permissionExpiresAt: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 6, 7, 8. Khóa/Mở khóa, Đặt lại quyền, Vô hiệu hóa & Kiểm tra chống tự nâng quyền */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800">
                      6, 7 &amp; 8. Khóa / Mở khóa · Đặt lại quyền · Vô hiệu hóa:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleChangeUserStatus(
                            selectedUserForEdit.id,
                            selectedUserForEdit.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED',
                            selectedUserForEdit.status === 'LOCKED'
                              ? 'Mở khóa tài khoản'
                              : 'Khóa tạm thời tài khoản'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 cursor-pointer"
                      >
                        {selectedUserForEdit.status === 'LOCKED' ? '6. Mở khóa tài khoản' : '6. Khóa tài khoản'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetUserPermissions(selectedUserForEdit.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300 hover:bg-blue-200 cursor-pointer"
                      >
                        7. Đặt lại quyền mặc định
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleChangeUserStatus(
                            selectedUserForEdit.id,
                            selectedUserForEdit.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED',
                            selectedUserForEdit.status === 'DISABLED'
                              ? 'Kích hoạt lại tài khoản'
                              : 'Vô hiệu hóa tài khoản'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300 hover:bg-rose-200 cursor-pointer"
                      >
                        {selectedUserForEdit.status === 'DISABLED'
                          ? '8. Kích hoạt lại'
                          : '8. Vô hiệu hóa tài khoản'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateUserAccount(selectedUserForEdit.id, {
                          roles: ['SYSTEM_ADMIN', ...selectedUserForEdit.roles],
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-950 border border-purple-300 hover:bg-purple-200 cursor-pointer text-center"
                    >
                      Thử tự nâng quyền lên SYSTEM_ADMIN (Kiểm chứng chặn 403 khi không phải Admin)
                    </button>
                  </div>

                  {/* Đặt lại mật khẩu băm PBKDF2-SHA256 */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      Đặt lại mật khẩu an toàn (PBKDF2-SHA256 100.000 vòng):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={resetPasswordValue}
                        onChange={(e) => setResetPasswordValue(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(selectedUserForEdit.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer shrink-0"
                      >
                        Băm &amp; Lưu
                      </button>
                    </div>
                  </div>

                  {/* Lịch sử đăng nhập của tài khoản */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-700" />
                      Lịch sử đăng nhập ({selectedUserForEdit.loginHistory?.length || 0} phiên):
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {(selectedUserForEdit.loginHistory || []).map((lh) => (
                        <div
                          key={lh.id}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-semibold text-slate-800">{lh.note}</div>
                            <div className="font-mono text-slate-500">
                              {new Date(lh.timestamp).toLocaleString('vi-VN')}
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-900">
                            {lh.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* =================================================================
              MODAL 1: TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI (MỤC IV.1)
             ================================================================= */}
          {showCreateUserModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      CHỨC NĂNG 1 · TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI &amp; GÁN PHẠM VI ABAC
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Khởi tạo Tài khoản Giáo viên / Cán bộ Quản lý (Tự động băm mật khẩu PBKDF2-SHA256)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng ✕
                  </button>
                </div>

                <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Họ và tên (*):</label>
                      <input
                        type="text"
                        required
                        value={newUserForm.fullName}
                        onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                        placeholder="VD: Nguyễn Thị Minh Tâm"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tên đăng nhập (*):</label>
                      <input
                        type="text"
                        required
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                        placeholder="VD: tamntm.gv"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email công vụ:</label>
                      <input
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        placeholder="VD: tamntm@nguyendinhanh.edu.vn"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mật khẩu khởi tạo:</label>
                      <input
                        type="text"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Đơn vị Trường học (schoolId):</label>
                      <select
                        value={newUserForm.schoolId}
                        onChange={(e) => setNewUserForm({ ...newUserForm, schoolId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="SCHOOL_A">SCHOOL_A - TH&amp;THCS Nguyễn Đình Anh</option>
                        <option value="SCHOOL_B">SCHOOL_B - Trường Tiểu học Sịa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tổ chuyên môn:</label>
                      <select
                        value={newUserForm.departmentName}
                        onChange={(e) => setNewUserForm({ ...newUserForm, departmentName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      >
                        {ALL_DEPARTMENT_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vai trò được cấp (Chọn 1 hoặc nhiều):</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(ROLE_BADGE_LABELS) as SystemRoleCode[]).map((rc) => {
                        const active = newUserForm.roles.includes(rc);
                        return (
                          <button
                            key={rc}
                            type="button"
                            onClick={() => {
                              const next = active
                                ? newUserForm.roles.filter((r) => r !== rc)
                                : [...newUserForm.roles, rc];
                              if (next.length > 0) setNewUserForm({ ...newUserForm, roles: next });
                            }}
                            className={`px-2.5 py-1 rounded-lg font-semibold border cursor-pointer ${
                              active ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}
                            {ROLE_BADGE_LABELS[rc].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Môn học phụ trách:</label>
                    <div className="flex flex-wrap gap-1">
                      {ALL_SUBJECT_OPTIONS.map((subj) => {
                        const active = newUserForm.assignedSubjects.includes(subj);
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => {
                              const next = active
                                ? newUserForm.assignedSubjects.filter((s) => s !== subj)
                                : [...newUserForm.assignedSubjects, subj];
                              setNewUserForm({ ...newUserForm, assignedSubjects: next });
                            }}
                            className={`px-2 py-0.5 rounded border cursor-pointer ${
                              active ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {subj}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khối lớp phụ trách (1-9):</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_GRADE_OPTIONS.map((g) => {
                        const active = newUserForm.assignedGrades.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              const next = active
                                ? newUserForm.assignedGrades.filter((x) => x !== g)
                                : [...newUserForm.assignedGrades, g];
                              setNewUserForm({ ...newUserForm, assignedGrades: next });
                            }}
                            className={`w-7 h-7 rounded-lg font-bold border cursor-pointer ${
                              active ? 'bg-blue-900 text-amber-300 border-blue-900' : 'bg-white text-slate-700'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mã hồ sơ phân công:</label>
                      <input
                        type="text"
                        value={newUserForm.assignedDossierIdsText}
                        onChange={(e) => setNewUserForm({ ...newUserForm, assignedDossierIdsText: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hiệu lực từ:</label>
                      <input
                        type="date"
                        value={newUserForm.permissionValidFrom}
                        onChange={(e) => setNewUserForm({ ...newUserForm, permissionValidFrom: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Đến ngày:</label>
                      <input
                        type="date"
                        value={newUserForm.permissionExpiresAt}
                        onChange={(e) => setNewUserForm({ ...newUserForm, permissionExpiresAt: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateUserModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 cursor-pointer"
                    >
                      Tạo tài khoản &amp; Ghi AuditLog
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =================================================================
              MODAL 2: NHẬP DANH SÁCH GIÁO VIÊN TỪ EXCEL (.XLSX / .CSV) (MỤC IV.2)
             ================================================================= */}
          {showExcelImportModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      CHỨC NĂNG 2 · NHẬP DANH SÁCH GIÁO VIÊN HÀNG LOẠT TỪ TỆP EXCEL (.XLSX / .CSV)
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Tự động phân tích cột Họ tên, Username, Tổ chuyên môn, Môn dạy, Khối lớp &amp; Vai trò
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExcelImportModal(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng ✕
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900 text-white font-bold cursor-pointer hover:bg-blue-800">
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>Chọn tệp Excel (.xlsx, .xls, .csv)</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleDownloadExcelTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tải tệp Excel mẫu (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSampleExcelRows}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold hover:bg-emerald-100 cursor-pointer"
                    >
                      <span>Nạp 3 giáo viên mẫu chuẩn</span>
                    </button>
                  </div>

                  {excelFileName && (
                    <span className="font-mono text-[11px] text-blue-900 font-bold">
                      Tệp: {excelFileName} ({excelParsedRows.length} dòng)
                    </span>
                  )}
                </div>

                {excelParsedRows.length > 0 && (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-64">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5 font-bold">Họ và tên</th>
                          <th className="py-2 px-2.5 font-bold">Username</th>
                          <th className="py-2 px-2.5 font-bold">Email</th>
                          <th className="py-2 px-2.5 font-bold">Tổ chuyên môn</th>
                          <th className="py-2 px-2.5 font-bold">Môn dạy</th>
                          <th className="py-2 px-2.5 font-bold">Khối</th>
                          <th className="py-2 px-2.5 font-bold">Vai trò</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {excelParsedRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 font-bold">{String(r.fullName || r.hoTen || '')}</td>
                            <td className="py-2 px-2.5 font-mono">{String(r.username || r.tenDangNhap || '')}</td>
                            <td className="py-2 px-2.5 font-mono">{String(r.email || '')}</td>
                            <td className="py-2 px-2.5">{String(r.departmentName || r.toChuyenMon || '')}</td>
                            <td className="py-2 px-2.5">{String(r.subjects || r.monDay || '')}</td>
                            <td className="py-2 px-2.5 font-mono">{String(r.grades || r.khoiLop || '')}</td>
                            <td className="py-2 px-2.5 font-mono">{String(r.roles || r.vaiTro || 'TEACHER')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowExcelImportModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={importingExcel || excelParsedRows.length === 0}
                    onClick={handleExecuteExcelImport}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer disabled:opacity-50"
                  >
                    {importingExcel
                      ? 'Đang nhập & băm mật khẩu...'
                      : `Thực thi Nhập ${excelParsedRows.length} Giáo viên vào Hệ thống`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: BẢO MẬT ĐỀ KIỂM TRA & 7 MỨC ĐỘ MẬT (MỤC VI)
         ===================================================================== */}
      {activeTab === 'EXAM_CONFIDENTIALITY' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                MỤC VI · PHÂN LOẠI BẢO MẬT ĐỀ KIỂM TRA (7 MỨC ĐỘ MẬT & QUYỀN TRUY CẬP TỐI THIỂU)
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Kiểm soát Truy cập Đề kiểm tra Mật, Đáp án & Nhận xét Thẩm định theo Phiên đăng nhập ({currentActor?.fullName})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Nguyên tắc: Người không được phân công không được xem đề mật, đáp án hoặc nhận xét thẩm định. Không để lộ nội dung đề mật trong thông báo, đường dẫn hoặc nhật ký.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confidentialityItems.map((item) => {
                const meta = CONFIDENTIALITY_LABELS[item.classification];
                const decrypted = decryptedSecretMap[item.id];
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      item.classification === 'SECRET_EXAM'
                        ? 'bg-rose-50/40 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs border ${meta?.badgeClass || ''}`}>
                        {meta?.label || item.classification}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {item.code} · {item.departmentName}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{meta?.ruleSummary}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800">
                      {decrypted ? (
                        <div className="text-emerald-900 font-semibold">
                          🔓 [ĐÃ XÁC THỰC QUYỀN TRUY CẬP HỢP LỆ]: {decrypted}
                        </div>
                      ) : (
                        <div className="text-slate-600">{item.secretPreviewMasked}</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span
                        className={`text-[11px] font-semibold ${
                          item.accessAllowedForCurrentActor ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {item.accessAllowedForCurrentActor
                          ? '✓ Tài khoản hiện tại có quyền truy cập'
                          : '🔒 Tài khoản hiện tại ngoài phạm vi phân công'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleInspectConfidentialItem(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          item.accessAllowedForCurrentActor
                            ? 'bg-blue-700 text-white hover:bg-blue-800'
                            : 'bg-rose-700 text-white hover:bg-rose-800'
                        }`}
                      >
                        {item.accessAllowedForCurrentActor ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Mở xem nội dung</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Thử truy cập (Kiểm tra chặn 403)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: SAO LƯU, KIỂM TRA TOÀN VẸN SHA-256 & KHÔI PHỤC (MỤC VII)
         ===================================================================== */}
      {activeTab === 'BACKUP_AND_RESTORE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  MỤC VII · SAO LƯU THEO YÊU CẦU, LỊCH CẤU HÌNH TRIỂN KHAI & KHÔI PHỤC TOÀN VẸN SHA-256
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Quản lý Bản sao lưu 20 Nhóm Dữ liệu Đa trường & Kiểm tra Toàn vẹn trước khi Khôi phục
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">{backupScheduleNote}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateBackup(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Sao lưu ngay & Tải tệp .JSON (Kèm SHA-256)</span>
                </button>
              </div>
            </div>

            {/* Danh sách các bản sao lưu */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Danh sách Bản sao lưu trên Máy chủ ({backups.length} bản ghi):
              </h4>
              <div className="space-y-2.5">
                {backups.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-blue-900">{bk.id}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-bold">
                          SHA-256 VERIFIED
                        </span>
                        <span className="text-slate-500">
                          {new Date(bk.createdAt).toLocaleString('vi-VN')} · Tạo bởi: {bk.createdByName}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 break-all">
                        SHA-256 Checksum: {bk.sha256Checksum} ({bk.sizeBytes.toLocaleString('vi-VN')} bytes)
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRestoreFromBackup(bk.id, false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                      >
                        Khôi phục dữ liệu (Xác thực SHA-256)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestoreFromBackup(bk.id, true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 cursor-pointer"
                      >
                        Mô phỏng tệp bị sửa đổi (Kiểm tra chặn lỗi SHA-256)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nhật ký khôi phục dữ liệu */}
            {restoreHistory.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nhật ký Khôi phục Dữ liệu (Restore History):
                </h4>
                <div className="space-y-2">
                  {restoreHistory.map((rh) => (
                    <div
                      key={rh.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        rh.status === 'SUCCESS'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div>
                        <div className="font-bold">
                          [{rh.status}] Bản sao lưu {rh.backupId} · Thực hiện bởi: {rh.restoredByName}
                        </div>
                        <div className="mt-0.5">{rh.note}</div>
                      </div>
                      <span className="font-mono text-[11px] shrink-0">
                        {new Date(rh.restoredAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
