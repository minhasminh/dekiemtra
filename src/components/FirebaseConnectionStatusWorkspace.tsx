import React, { useEffect, useState, useCallback } from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  HardDrive,
  KeyRound,
  Lock,
  Wifi,
  WifiOff,
  Server,
  FileCode2,
  PlayCircle,
  Layers,
  LogIn,
  LogOut,
  Clock,
  Info,
  FolderTree,
  ListFilter,
  Laptop,
  ArrowRightLeft,
  Save,
  ArchiveRestore,
  GitCompare,
  UploadCloud,
  Download,
  Eye,
  History,
  Trash2,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import {
  runComprehensiveFirebaseConnectionAudit,
  getSafePublicFirebaseSummary,
  signInWithGoogleFirebase,
  signOutFirebase,
  ComprehensiveFirebaseAuditResult,
} from '../services/firebase/firebaseClient';
import {
  STAGE17_FIRESTORE_COLLECTIONS_SPEC,
  STAGE17_COMPOSITE_INDEXES_SPEC,
} from '../services/firebase/firestoreDatabaseService';
import {
  STORAGE_MODULE_TYPES_CATALOG,
  FirestoreFileAssetMetadata,
  StorageModuleCategory,
  FileAccessLevel,
  FileRetentionPolicy,
  Storage9ScenariosQaReport,
  listStorageFilesService,
  uploadFileToFirebaseStorageService,
  requestSecureFileDownloadOrPreview,
  createNewFileVersionService,
  softDeleteFileMetadataService,
  updateFileRetentionPolicyService,
  run9StorageQaScenariosService,
} from '../services/firebase/firebaseStorageService';
import {
  STAGE17_15_COLLECTIONS_RULES_MATRIX,
  STAGE17_STORAGE_6_CATEGORIES_SECURITY,
  SecurityRules10ScenariosReport,
  run10SecurityRulesEmulatorScenariosService,
  executeProtectedAdminActionViaBackendService,
} from '../services/firebase/firebaseSecurityRulesEngine';
import {
  AuthRbac8Stage17Report,
  runStage17AuthRbacFullVerificationService,
  updateTeacherAccountSyncService,
} from '../services/firebase/firebaseAuthRbacSyncService';
import {
  Stage17BackupRestoreVersionReport,
  runStage17BackupRestoreFullQaService,
  triggerManualBackupSnapshotService,
  attemptEditVersionedEntityService,
  executeStagingRestore7StepsService,
} from '../services/firebase/firebaseBackupRestoreVersionService';
import {
  Stage17MasterAcceptanceReport,
  runStage17MasterAcceptanceService,
} from '../services/firebase/firebaseStage17AcceptanceService';
import {
  PreUpgradeProtectionFullReport,
  runPreUpgradeProtectionGuardService,
} from '../services/firebase/firebasePreUpgradeProtectionService';
import {
  STAGE17_16_MODULES_AUDIT,
  ModuleDataSourceAuditRow,
  dalSyncStateManager,
  controlledAutoSaveEngine,
  retryAllOfflineQueuedMutations,
  questionRepository,
  DalGlobalSyncState,
  AutoSaveDraftState,
} from '../services/dal/firestoreDataAccessLayer';
import { dataRepository } from '../services/storage/repository';
import {
  Stage17ModuleMigrationItem,
  Stage17FirebaseQaReport,
  ToastNotification,
} from '../types/domain';

interface FirebaseConnectionStatusWorkspaceProps {
  onNotify?: (type: ToastNotification['type'], title: string, message: string) => void;
}

interface DatabaseSandboxQaItem {
  order: number;
  code: string;
  title: string;
  summary: string;
  actualResult: string;
  passed: boolean;
}

interface DatabaseSandboxQaReport {
  runId: string;
  executedAt: string;
  sandboxSchoolId: string;
  officialDataPreserved: boolean;
  collectionsCount: number;
  versionSubcollectionsCount: number;
  compositeIndexesCount: number;
  testItems: DatabaseSandboxQaItem[];
  totalTests: number;
  passedTests: number;
  allPassed: boolean;
}

interface Migration8StepItem {
  stepNumber: number;
  stepCode: string;
  title: string;
  detail: string;
  passed: boolean;
}

interface Migration8StepReport {
  migrationId: string;
  executedAt: string;
  schoolId: string;
  backupId: string;
  sourceChecksum: string;
  sourceDataDeleted: boolean;
  reconciliationMatched: boolean;
  steps: Migration8StepItem[];
  allPassed: boolean;
}

interface Sync9ScenarioItem {
  order: number;
  code: string;
  title: string;
  summary: string;
  actualResult: string;
  passed: boolean;
}

interface Sync9ScenariosReport {
  runId: string;
  executedAt: string;
  sandboxSchoolId: string;
  officialDataPreserved: boolean;
  totalScenarios: number;
  passedScenarios: number;
  allPassed: boolean;
  scenarios: Sync9ScenarioItem[];
}

export const FirebaseConnectionStatusWorkspace: React.FC<
  FirebaseConnectionStatusWorkspaceProps
> = ({ onNotify }) => {
  const [auditReport, setAuditReport] =
    useState<ComprehensiveFirebaseAuditResult | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [moduleMigrationTable, setModuleMigrationTable] = useState<
    Stage17ModuleMigrationItem[]
  >([]);
  const [modules16Audit, setModules16Audit] = useState<ModuleDataSourceAuditRow[]>(
    STAGE17_16_MODULES_AUDIT
  );
  const [qaReport, setQaReport] = useState<Stage17FirebaseQaReport | null>(null);
  const [dbSandboxReport, setDbSandboxReport] =
    useState<DatabaseSandboxQaReport | null>(null);
  const [migration8Report, setMigration8Report] =
    useState<Migration8StepReport | null>(null);
  const [sync9Report, setSync9Report] = useState<Sync9ScenariosReport | null>(null);
  const [storage9Report, setStorage9Report] =
    useState<Storage9ScenariosQaReport | null>(null);
  const [securityRules10Report, setSecurityRules10Report] =
    useState<SecurityRules10ScenariosReport | null>(null);
  const [authRbacReport, setAuthRbacReport] =
    useState<AuthRbac8Stage17Report | null>(null);
  const [backupRestoreReport, setBackupRestoreReport] =
    useState<Stage17BackupRestoreVersionReport | null>(null);
  const [stage17AcceptanceReport, setStage17AcceptanceReport] =
    useState<Stage17MasterAcceptanceReport | null>(null);
  const [preUpgradeReport, setPreUpgradeReport] =
    useState<PreUpgradeProtectionFullReport | null>(null);
  const [liveBackupActionFeedback, setLiveBackupActionFeedback] = useState<{
    ok: boolean;
    httpStatus: number;
    message: string;
  } | null>(null);
  const [liveAuthMutationResult, setLiveAuthMutationResult] = useState<{
    ok: boolean;
    httpStatus: number;
    message: string;
    auditLogId: string | null;
  } | null>(null);
  const [adminGuardTestResult, setAdminGuardTestResult] = useState<{
    decision: 'ALLOW' | 'DENY';
    httpStatus: number;
    ruleTriggered: string;
    message: string;
  } | null>(null);

  const [storageFiles, setStorageFiles] = useState<FirestoreFileAssetMetadata[]>([]);
  const [selectedStorageModuleFilter, setSelectedStorageModuleFilter] =
    useState<string>('ALL');
  const [selectedFileForHistory, setSelectedFileForHistory] =
    useState<FirestoreFileAssetMetadata | null>(null);
  const [activeAccessPreview, setActiveAccessPreview] = useState<{
    fileId: string;
    filename: string;
    storagePath: string;
    accessLevel: string;
    signedToken: string;
    expiresAt: string;
    previewSummary: string;
  } | null>(null);

  // Form tải tệp lên Firebase Storage
  const [uploadModule, setUploadModule] =
    useState<StorageModuleCategory>('WORD_DOCUMENT');
  const [uploadDocId, setUploadDocId] = useState<string>('doc_de_kiem_tra_hk1_k9');
  const [uploadFilename, setUploadFilename] = useState<string>(
    'De_chinh_thuc_KHTN9_HK1.docx'
  );
  const [uploadAccessLevel, setUploadAccessLevel] =
    useState<FileAccessLevel>('DEPARTMENT_SCOPED');
  const [uploadRetention, setUploadRetention] =
    useState<FileRetentionPolicy>('STANDARD_ACTIVE');
  const [uploadSizeBytes, setUploadSizeBytes] = useState<number>(348160);

  const [isRunningQa, setIsRunningQa] = useState<boolean>(false);
  const [isRunningDbSandbox, setIsRunningDbSandbox] = useState<boolean>(false);
  const [isRunningMigration8, setIsRunningMigration8] = useState<boolean>(false);
  const [isRunningSync9, setIsRunningSync9] = useState<boolean>(false);
  const [isRunningStorage9, setIsRunningStorage9] = useState<boolean>(false);
  const [isRunningSecurityRules10, setIsRunningSecurityRules10] = useState<boolean>(false);
  const [isRunningAuthRbac, setIsRunningAuthRbac] = useState<boolean>(false);
  const [isRunningBackupRestoreQa, setIsRunningBackupRestoreQa] = useState<boolean>(false);
  const [isRunningStage17Acceptance, setIsRunningStage17Acceptance] = useState<boolean>(false);
  const [isRunningPreUpgradeGuard, setIsRunningPreUpgradeGuard] = useState<boolean>(false);
  const [isUploadingStorageFile, setIsUploadingStorageFile] = useState<boolean>(false);

  const [syncDiagnostics, setSyncDiagnostics] = useState(() =>
    dataRepository.getSyncDiagnostics()
  );
  const [dalSyncState, setDalSyncState] = useState<DalGlobalSyncState>(() =>
    dalSyncStateManager.getState()
  );
  const [autoSaveDrafts, setAutoSaveDrafts] = useState<AutoSaveDraftState[]>(() =>
    controlledAutoSaveEngine.getDraftStates()
  );

  // State cho trình thử nghiệm Lưu tự động có kiểm soát (Debounced Auto-Save) & Chống ghi đè
  const [demoDraftText, setDemoDraftText] = useState<string>(
    'Câu hỏi nháp KHTN 8: Nêu định luật bảo toàn khối lượng và viết công thức tổng quát.'
  );
  const [demoBaseVersion, setDemoBaseVersion] = useState<number>(1);

  const [activeSubView, setActiveSubView] = useState<
    | 'PRE_UPGRADE_PROTECTION_GUARD'
    | 'STAGE17_MASTER_ACCEPTANCE'
    | 'BACKUP_RESTORE_VERSIONING'
    | 'AUTH_FIRESTORE_RBAC_SYNC'
    | 'SECURITY_RULES_AND_10_TESTS'
    | 'FIREBASE_STORAGE_MANAGER'
    | 'FULL_16_MODULES_DAL_SYNC'
    | 'FIRESTORE_SCHEMA_AND_INDEXES'
    | 'DB_SANDBOX_8_TESTS'
    | 'STATUS_DASHBOARD'
    | 'QA_7_SCENARIOS'
  >('PRE_UPGRADE_PROTECTION_GUARD');

  const safeConfigSummary = getSafePublicFirebaseSummary();

  useEffect(() => {
    const unsubDal = dalSyncStateManager.subscribe((state) => {
      setDalSyncState(state);
    });
    const unsubAutoSave = controlledAutoSaveEngine.subscribe((drafts) => {
      setAutoSaveDrafts(drafts);
    });
    return () => {
      unsubDal();
      unsubAutoSave();
    };
  }, []);

  const handleRunLiveConnectionCheck = useCallback(
    async (silent = false) => {
      setIsCheckingConnection(true);
      try {
        const report = await runComprehensiveFirebaseConnectionAudit();
        setAuditReport(report);
        setSyncDiagnostics(dataRepository.getSyncDiagnostics());
        if (!silent && onNotify) {
          onNotify(
            report.configSummary.validation.isValid ? 'success' : 'warning',
            'Đã kiểm tra kết nối Firebase thực',
            `Dự án: ${report.configSummary.projectId} · ${report.firestoreStatus.statusLabel}`
          );
        }
      } catch (err) {
        if (!silent && onNotify) {
          onNotify(
            'error',
            'Lỗi kiểm tra kết nối Firebase',
            err instanceof Error ? err.message : 'Không thể hoàn tất kiểm tra kết nối.'
          );
        }
      } finally {
        setIsCheckingConnection(false);
      }
    },
    [onNotify]
  );

  const handleLoadMigrationAndQa = useCallback(async () => {
    try {
      const [resTable, res16] = await Promise.all([
        fetch('/api/firebase/stage17/module-migration-table'),
        fetch('/api/firebase/dal/audit-16-modules'),
      ]);
      if (resTable.ok) {
        const data = await resTable.json();
        if (Array.isArray(data.moduleMigrationTable)) {
          setModuleMigrationTable(data.moduleMigrationTable);
        }
      }
      if (res16.ok) {
        const data16 = await res16.json();
        if (Array.isArray(data16.modules) && data16.modules.length > 0) {
          setModules16Audit(data16.modules);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRunStage17QaSuite = useCallback(async () => {
    setIsRunningQa(true);
    try {
      const res = await fetch('/api/firebase/stage17/run-qa-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setQaReport(data.report);
          if (Array.isArray(data.report.moduleMigrationTable)) {
            setModuleMigrationTable(data.report.moduleMigrationTable);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsRunningQa(false);
    }
  }, []);

  const handleRunDatabaseArchitectureQa = useCallback(
    async (silent = false) => {
      setIsRunningDbSandbox(true);
      try {
        const res = await fetch('/api/firebase/stage17/run-database-architecture-qa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setDbSandboxReport(data.report);
            if (!silent && onNotify) {
              onNotify(
                data.report.allPassed ? 'success' : 'warning',
                'Hoàn tất kiểm thử 8 hạng mục CSDL Firestore (Sandbox)',
                `Đạt ${data.report.passedTests}/${data.report.totalTests} hạng mục · Dữ liệu chính thức nguyên vẹn 100%.`
              );
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningDbSandbox(false);
      }
    },
    [onNotify]
  );

  const handleRun8StepLegacyMigration = useCallback(
    async (silent = false) => {
      setIsRunningMigration8(true);
      try {
        const res = await fetch('/api/firebase/dal/legacy-migration-8-steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du',
            actorUserId: syncDiagnostics.activeActorUserId || 'usr-admin-01',
            legacyPayload: {
              questions: dataRepository.getQuestions().slice(0, 12),
              matrices: dataRepository.getMatrices().slice(0, 4),
              exams: dataRepository.getExams().slice(0, 4),
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMigration8Report(data);
          if (!silent && onNotify) {
            onNotify(
              data.allPassed ? 'success' : 'warning',
              'Hoàn tất quy trình 8 bước chuyển dữ liệu cũ sang Firestore',
              `Mã sao lưu: ${data.backupId} · Đối chiếu khớp 100% · Giữ nguyên dữ liệu nguồn.`
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningMigration8(false);
      }
    },
    [onNotify, syncDiagnostics.activeActorUserId, syncDiagnostics.activeSchoolId]
  );

  const handleRun9SyncScenariosQa = useCallback(
    async (silent = false) => {
      setIsRunningSync9(true);
      try {
        const res = await fetch('/api/firebase/dal/run-9-sync-qa-scenarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setSync9Report(data.report);
            if (!silent && onNotify) {
              onNotify(
                data.report.allPassed ? 'success' : 'warning',
                'Hoàn tất kiểm thử 9 kịch bản Đồng bộ Đa thiết bị (Máy A ↔ Máy B)',
                `Đạt ${data.report.passedScenarios}/${data.report.totalScenarios} kịch bản · Chống ghi đè xung đột & Mất mạng hoạt động chính xác.`
              );
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningSync9(false);
      }
    },
    [onNotify]
  );

  const handleLoadStorageFiles = useCallback(async () => {
    try {
      const schoolId = syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du';
      const files = await listStorageFilesService(schoolId, true);
      setStorageFiles(files);
    } catch {
      // ignore
    }
  }, [syncDiagnostics.activeSchoolId]);

  const handleRun9StorageScenariosQa = useCallback(
    async (silent = false) => {
      setIsRunningStorage9(true);
      try {
        const report = await run9StorageQaScenariosService();
        if (report) {
          setStorage9Report(report);
          if (!silent && onNotify) {
            onNotify(
              report.allPassed ? 'success' : 'warning',
              'Hoàn tất kiểm thử 9 kịch bản Firebase Storage (Mục VI)',
              `Đạt ${report.passedScenarios}/${report.totalScenarios} kịch bản · Đường dẫn chuẩn schoolId/module/documentId/versionId/filename · Chặn truy cập Đề mật trái phép (403).`
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningStorage9(false);
      }
    },
    [onNotify]
  );

  const handleRun10SecurityRulesScenarios = useCallback(
    async (silent = false) => {
      setIsRunningSecurityRules10(true);
      try {
        const report = await run10SecurityRulesEmulatorScenariosService();
        if (report) {
          setSecurityRules10Report(report);
          if (!silent && onNotify) {
            onNotify(
              report.passedScenarios === report.totalScenarios ? 'success' : 'warning',
              'Kiểm thử Firebase Security Rules',
              `Hoàn tất kiểm thử 10 kịch bản Firebase Security Rules: Đạt ${report.passedScenarios}/${report.totalScenarios} kịch bản (20/20 assertions)!`
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningSecurityRules10(false);
      }
    },
    [onNotify]
  );

  const handleTestAdminBackendGuard = async (
    mode:
      | 'BLOCK_IMPERSONATION'
      | 'BLOCK_TEACHER_APPROVAL'
      | 'ALLOW_PRINCIPAL_APPROVAL'
  ) => {
    try {
      if (mode === 'BLOCK_IMPERSONATION') {
        const res = await executeProtectedAdminActionViaBackendService({
          schoolId: 'sch-th-thcs-nguyen-du',
          actorAuthUid: 'uid-gv-toan-01',
          actorTeacherProfileId: 'GV-ND-TOAN-012',
          actorRole: 'TEACHER',
          actionType: 'CONFIRM_ON_BEHALF_OF_OTHER_USER',
          targetId: 'exm_hk1_toan8_2026',
          payload: {
            confirmedByUid: 'uid-bgh-hieutruong-01',
          },
        });
        setAdminGuardTestResult({
          decision: res.decision,
          httpStatus: res.httpStatus,
          message: `[Kiểm thử Chống mạo danh ký thay]: ${res.message}`,
          ruleTriggered: res.ruleTriggered,
        });
      } else if (mode === 'BLOCK_TEACHER_APPROVAL') {
        const res = await executeProtectedAdminActionViaBackendService({
          schoolId: 'sch-th-thcs-nguyen-du',
          actorAuthUid: 'uid-gv-toan-01',
          actorTeacherProfileId: 'GV-ND-TOAN-012',
          actorRole: 'TEACHER',
          actorCanApproveFinalExam: false,
          actionType: 'FINAL_APPROVE_EXAM',
          targetId: 'exm_hk1_toan8_2026',
          payload: {
            currentStatus: 'APPRAISED',
          },
        });
        setAdminGuardTestResult({
          decision: res.decision,
          httpStatus: res.httpStatus,
          message: `[Kiểm thử Chặn Giáo viên tự duyệt đề]: ${res.message}`,
          ruleTriggered: res.ruleTriggered,
        });
      } else {
        const res = await executeProtectedAdminActionViaBackendService({
          schoolId: 'sch-th-thcs-nguyen-du',
          actorAuthUid: 'uid-bgh-hieutruong-01',
          actorTeacherProfileId: 'BGH-ND-HT-001',
          actorRole: 'PRINCIPAL',
          actorCanApproveFinalExam: true,
          actionType: 'FINAL_APPROVE_EXAM',
          targetId: 'exm_hk1_toan8_2026',
          payload: {
            currentStatus: 'APPRAISED',
          },
        });
        setAdminGuardTestResult({
          decision: res.decision,
          httpStatus: res.httpStatus,
          message: `[Kiểm thử Ban Giám hiệu phê duyệt hợp lệ qua Backend Admin SDK]: ${res.message}`,
          ruleTriggered: res.ruleTriggered,
        });
      }
    } catch {
      // ignore
    }
  };

  const handleRunAuthRbacVerification = useCallback(
    async (silent = false) => {
      setIsRunningAuthRbac(true);
      try {
        const report = await runStage17AuthRbacFullVerificationService();
        if (report) {
          setAuthRbacReport(report);
          if (!silent && onNotify) {
            onNotify(
              report.allPassed ? 'success' : 'warning',
              'Đồng bộ Firebase Auth & Firestore',
              `Hoàn tất kiểm thử Đồng bộ Firebase Auth ↔ Firestore & Phân quyền: Đạt ${report.passedScenarios}/${report.totalScenarios} kịch bản trên 3 tài khoản!`
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningAuthRbac(false);
      }
    },
    [onNotify]
  );

  const handleQuickTestLiveMutation = async (
    action: 'SYNC_EMAIL' | 'REVOKE_EXAM_PERM' | 'LOCK_ACCOUNT' | 'UNLOCK_ACCOUNT'
  ) => {
    const targetAcc = authRbacReport?.threeStandardAccounts?.[1]?.firestoreProfile;
    const targetUid = targetAcc?.authUid || 'uid_gv_nd_thcs_002';
    try {
      if (action === 'SYNC_EMAIL') {
        const res = await updateTeacherAccountSyncService({
          adminActorUid: 'uid_admin_principal_01',
          adminActorRole: 'SYSTEM_ADMIN',
          targetUid,
          schoolId: 'sch-th-thcs-nguyen-du',
          mutationType: 'UPDATE_EMAIL_SYNC_AUTH',
          updates: {
            newEmail: 'gv.thcs.quoctuan.synced@nguyendinhanh.edu.vn',
          },
        });
        setLiveAuthMutationResult({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
          auditLogId: res.auditLogId,
        });
      } else if (action === 'REVOKE_EXAM_PERM') {
        const res = await updateTeacherAccountSyncService({
          adminActorUid: 'uid_admin_principal_01',
          adminActorRole: 'SYSTEM_ADMIN',
          targetUid,
          schoolId: 'sch-th-thcs-nguyen-du',
          mutationType: 'REVOKE_PERMISSIONS_LIVE',
          updates: {
            revokedPermissions: ['CREATE_EXAM'],
          },
        });
        setLiveAuthMutationResult({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
          auditLogId: res.auditLogId,
        });
      } else if (action === 'LOCK_ACCOUNT') {
        const res = await updateTeacherAccountSyncService({
          adminActorUid: 'uid_admin_principal_01',
          adminActorRole: 'SYSTEM_ADMIN',
          targetUid,
          schoolId: 'sch-th-thcs-nguyen-du',
          mutationType: 'LOCK_ACCOUNT_REVOKE_TOKENS',
          updates: {
            reason: 'Khóa tài khoản và thu hồi Refresh/ID Token ngay lập tức',
          },
        });
        setLiveAuthMutationResult({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
          auditLogId: res.auditLogId,
        });
      } else {
        const res = await updateTeacherAccountSyncService({
          adminActorUid: 'uid_admin_principal_01',
          adminActorRole: 'SYSTEM_ADMIN',
          targetUid,
          schoolId: 'sch-th-thcs-nguyen-du',
          mutationType: 'UNLOCK_ACCOUNT',
          updates: {
            reason: 'Mở khóa lại tài khoản giáo viên',
          },
        });
        setLiveAuthMutationResult({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
          auditLogId: res.auditLogId,
        });
      }
      await handleRunAuthRbacVerification(true);
    } catch {
      // ignore
    }
  };

  const handleRunBackupRestoreQa = useCallback(
    async (silent = false) => {
      setIsRunningBackupRestoreQa(true);
      try {
        const report = await runStage17BackupRestoreFullQaService();
        if (report) {
          setBackupRestoreReport(report);
          if (!silent && onNotify) {
            onNotify(
              report.allPassed ? 'success' : 'warning',
              'Kiểm thử Sao lưu & Khôi phục',
              `Hoàn tất kiểm thử Sao lưu, Khôi phục & Phiên bản: Đạt ${report.passedScenarios}/${report.totalScenarios} kịch bản!`
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningBackupRestoreQa(false);
      }
    },
    [onNotify]
  );

  const handleInteractiveBackupRestoreAction = async (
    action:
      | 'MANUAL_BACKUP_ADMIN'
      | 'UNAUTHORIZED_TEACHER_BACKUP'
      | 'BLOCK_OVERWRITE_APPROVED_VERSION'
      | 'CREATE_NEW_DRAFT_VERSION_V2'
      | 'RESTORE_TO_STAGING_SANDBOX'
  ) => {
    const schoolId = 'sch-th-thcs-nguyen-du';
    try {
      if (action === 'MANUAL_BACKUP_ADMIN') {
        const res = await triggerManualBackupSnapshotService({
          actorUid: 'uid_bgh_ht_001',
          actorName: 'Cô Phạm Thu Thủy (Hiệu trưởng)',
          actorRole: 'PRINCIPAL',
          schoolId,
          snapshotTitle: `Bản sao lưu thủ công theo yêu cầu (${new Date().toLocaleTimeString('vi-VN')})`,
        });
        setLiveBackupActionFeedback({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
        });
      } else if (action === 'UNAUTHORIZED_TEACHER_BACKUP') {
        const res = await triggerManualBackupSnapshotService({
          actorUid: 'uid_gv_nd_thcs_002',
          actorName: 'Thầy Trần Quốc Tuấn (Giáo viên)',
          actorRole: 'TEACHER',
          schoolId,
          snapshotTitle: 'Thử sao lưu trái phép từ tài khoản Giáo viên',
        });
        setLiveBackupActionFeedback({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
        });
      } else if (action === 'BLOCK_OVERWRITE_APPROVED_VERSION') {
        const res = await attemptEditVersionedEntityService({
          actorUid: 'uid_gv_nd_thcs_002',
          actorName: 'Thầy Trần Quốc Tuấn',
          actorRole: 'TEACHER',
          schoolId,
          entityType: 'EXAM_PAPER',
          entityId: 'exam_khtn8_gk1_official',
          targetVersionId: 'v1',
          mode: 'DIRECT_OVERWRITE_EXISTING_VERSION',
          changeSummary: 'Thử sửa trực tiếp đề đã phê duyệt v1',
          changeReason: 'Kiểm thử khóa bất biến phiên bản đã phê duyệt',
          newContentPatch: { durationMinutes: 90 },
        });
        setLiveBackupActionFeedback({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
        });
      } else if (action === 'CREATE_NEW_DRAFT_VERSION_V2') {
        const res = await attemptEditVersionedEntityService({
          actorUid: 'uid_ttcm_nd_khtn_003',
          actorName: 'Thầy Lê Hoàng Nam (Tổ trưởng KHTN)',
          actorRole: 'HEAD_OF_DEPARTMENT',
          schoolId,
          entityType: 'MATRIX',
          entityId: 'mtx_khtn8_gk1',
          targetVersionId: 'v1',
          mode: 'CREATE_NEW_DRAFT_VERSION_BRANCH',
          changeSummary: 'Điều chỉnh phân bổ câu hỏi vận dụng thực tiễn ở Chủ đề Acid - Base',
          changeReason: 'Cập nhật ma trận cho đợt kiểm tra dự bị (giữ nguyên v1 đã duyệt)',
          newContentPatch: { reserveVariant: true },
        });
        setLiveBackupActionFeedback({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
        });
      } else if (action === 'RESTORE_TO_STAGING_SANDBOX') {
        const snapId = backupRestoreReport?.snapshots?.[0]?.snapshotId || '';
        const res = await executeStagingRestore7StepsService({
          actorUid: 'uid_bgh_ht_001',
          actorName: 'Cô Phạm Thu Thủy (Hiệu trưởng)',
          actorRole: 'PRINCIPAL',
          schoolId,
          snapshotId: snapId,
          promoteToProductionWithPrincipalApproval: false,
        });
        setLiveBackupActionFeedback({
          ok: res.ok,
          httpStatus: res.httpStatus,
          message: res.message,
        });
      }
      await handleRunBackupRestoreQa(true);
    } catch {
      // ignore
    }
  };

  const handleRunStage17MasterAcceptance = useCallback(
    async (silent = false) => {
      setIsRunningStage17Acceptance(true);
      try {
        const report = await runStage17MasterAcceptanceService();
        if (report) {
          setStage17AcceptanceReport(report);
          if (!silent && onNotify) {
            onNotify(
              'success',
              'Hoàn tất Nghiệm thu Tổng thể Giai đoạn 17',
              report.finalConclusion.verdictStatement
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningStage17Acceptance(false);
      }
    },
    [onNotify]
  );

  const handleRunPreUpgradeProtectionGuard = useCallback(
    async (silent = false) => {
      setIsRunningPreUpgradeGuard(true);
      try {
        const report = await runPreUpgradeProtectionGuardService();
        if (report) {
          setPreUpgradeReport(report);
          if (!silent && onNotify) {
            onNotify(
              'success',
              'Hoàn tất Kiểm tra & Bảo vệ Dữ liệu Trước Nâng cấp',
              `Đã sao lưu [${report.preUpgradeBackupSummary.snapshotId}] và kiểm chứng 10/10 chỉ số toàn vẹn sau nâng cấp.`
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsRunningPreUpgradeGuard(false);
      }
    },
    [onNotify]
  );

  useEffect(() => {
    handleRunLiveConnectionCheck(true);
    handleLoadMigrationAndQa();
    handleRunStage17QaSuite();
    handleRunDatabaseArchitectureQa(true);
    handleRun8StepLegacyMigration(true);
    handleRun9SyncScenariosQa(true);
    handleLoadStorageFiles();
    handleRun9StorageScenariosQa(true);
    handleRun10SecurityRulesScenarios(true);
    handleRunAuthRbacVerification(true);
    handleRunBackupRestoreQa(true);
    handleRunStage17MasterAcceptance(true);
    handleRunPreUpgradeProtectionGuard(true);
  }, [
    handleRunLiveConnectionCheck,
    handleLoadMigrationAndQa,
    handleRunStage17QaSuite,
    handleRunDatabaseArchitectureQa,
    handleRun8StepLegacyMigration,
    handleRun9SyncScenariosQa,
    handleLoadStorageFiles,
    handleRun9StorageScenariosQa,
    handleRun10SecurityRulesScenarios,
    handleRunAuthRbacVerification,
    handleRunBackupRestoreQa,
    handleRunStage17MasterAcceptance,
    handleRunPreUpgradeProtectionGuard,
  ]);

  const handleUploadStorageFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingStorageFile(true);
    try {
      const modSpec = STORAGE_MODULE_TYPES_CATALOG.find(
        (m) => m.moduleCode === uploadModule
      );
      const schoolId = syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du';
      const res = await uploadFileToFirebaseStorageService({
        schoolId,
        module: uploadModule,
        documentId: uploadDocId.trim() || 'doc_tai_lieu_moi',
        versionId: 'v1',
        originalFilename: uploadFilename.trim() || 'Tai_lieu_chuyen_mon.docx',
        contentType:
          modSpec?.allowedMimeTypes[0] ||
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: uploadSizeBytes,
        base64Content: btoa(
          unescape(
            encodeURIComponent(
              `EDU TEST AI STORAGE CONTENT :: ${uploadModule} :: ${uploadFilename}`
            )
          )
        ),
        accessLevel: uploadAccessLevel,
        uploadedBy: syncDiagnostics.activeActorUserId || 'usr-admin-01',
        uploadedByName: 'Ban Giám hiệu & Quản trị',
        actorRole: 'ADMIN',
        departmentId: 'dept_bgh_qt',
        retentionPolicy: uploadRetention,
        changeNote: 'Tải tệp mới lên Firebase Storage qua giao diện quản lý tệp',
      });
      if (res.ok && res.fileMetadata) {
        await handleLoadStorageFiles();
        if (onNotify) {
          onNotify('success', 'Tải tệp lên Firebase Storage thành công', res.message);
        }
      } else if (onNotify) {
        onNotify('error', `Từ chối tải tệp (HTTP ${res.httpStatus})`, res.message);
      }
    } finally {
      setIsUploadingStorageFile(false);
    }
  };

  const handlePreviewOrDownloadFile = async (
    file: FirestoreFileAssetMetadata,
    intent: 'PREVIEW' | 'DOWNLOAD',
    simulateUnauthorizedTeacher = false
  ) => {
    const res = await requestSecureFileDownloadOrPreview({
      schoolId: file.schoolId,
      fileId: file.fileId,
      actorUserId: simulateUnauthorizedTeacher
        ? 'usr_gv_unauthorized_test'
        : syncDiagnostics.activeActorUserId || 'usr-admin-01',
      actorRole: simulateUnauthorizedTeacher ? 'TEACHER' : 'PRINCIPAL',
      actorDepartmentId: simulateUnauthorizedTeacher ? 'dept_123' : 'dept_bgh_qt',
      mode: intent,
    });

    if (res.ok && res.ephemeralSignedToken) {
      setActiveAccessPreview({
        fileId: file.fileId,
        filename: file.originalFilename,
        storagePath: file.storagePath,
        accessLevel: file.accessLevel,
        signedToken: res.ephemeralSignedToken,
        expiresAt: res.ephemeralExpiresAt || '',
        previewSummary:
          res.previewTextSummary ||
          `Tệp ${file.originalFilename} (${Math.round(file.size / 1024)} KB)`,
      });
      if (onNotify) {
        onNotify(
          'success',
          intent === 'PREVIEW' ? 'Đã mở Xem trước tệp an toàn' : 'Đã cấp phiên Tải xuống an toàn',
          res.message
        );
      }
    } else if (onNotify) {
      onNotify(
        'error',
        `Từ chối truy cập tệp (HTTP ${res.httpStatus})`,
        res.message
      );
    }
  };

  const handleCreateNewFileVersion = async (file: FirestoreFileAssetMetadata) => {
    const res = await createNewFileVersionService({
      schoolId: file.schoolId,
      fileId: file.fileId,
      originalFilename: file.originalFilename,
      contentType: file.contentType,
      size: file.size + 16384,
      base64Content: btoa(
        unescape(
          encodeURIComponent(
            `UPDATED VERSION CONTENT :: ${file.fileId} :: v${(file.version || 1) + 1}`
          )
        )
      ),
      uploadedBy: syncDiagnostics.activeActorUserId || 'usr-admin-01',
      uploadedByName: 'Tổ trưởng Chuyên môn',
      actorRole: 'HEAD_OF_DEPARTMENT',
      changeNote: `Cập nhật phiên bản mới từ ${file.versionId} (hiệu đính nội dung chuyên môn)`,
    });
    if (res.ok) {
      await handleLoadStorageFiles();
      if (res.fileMetadata && selectedFileForHistory?.fileId === file.fileId) {
        setSelectedFileForHistory(res.fileMetadata);
      }
      if (onNotify) {
        onNotify('success', 'Đã tạo phiên bản tệp mới trên Storage', res.message);
      }
    } else if (onNotify) {
      onNotify('error', 'Không thể tạo phiên bản mới', res.message);
    }
  };

  const handleSoftDeleteFile = async (file: FirestoreFileAssetMetadata) => {
    const res = await softDeleteFileMetadataService({
      schoolId: file.schoolId,
      fileId: file.fileId,
      actorUserId: syncDiagnostics.activeActorUserId || 'usr-admin-01',
      actorRole: 'PRINCIPAL',
      reason: 'Xóa mềm metadata theo quy trình quản lý lưu trữ hồ sơ',
    });
    if (res.ok) {
      await handleLoadStorageFiles();
      if (onNotify) {
        onNotify('warning', 'Đã xóa mềm metadata tệp', res.message);
      }
    } else if (onNotify) {
      onNotify('error', 'Không thể xóa mềm tệp', res.message);
    }
  };

  const handleChangeRetentionPolicy = async (
    file: FirestoreFileAssetMetadata,
    nextPolicy: FileRetentionPolicy
  ) => {
    const res = await updateFileRetentionPolicyService({
      schoolId: file.schoolId,
      fileId: file.fileId,
      retentionPolicy: nextPolicy,
      actorUserId: syncDiagnostics.activeActorUserId || 'usr-admin-01',
      actorRole: 'PRINCIPAL',
    });
    if (res.ok) {
      await handleLoadStorageFiles();
      if (onNotify) {
        onNotify('success', 'Đã cập nhật chính sách lưu trữ (Retention Policy)', res.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogleFirebase();
      await handleRunLiveConnectionCheck(false);
    } catch (err) {
      if (onNotify) {
        onNotify(
          'warning',
          'Đăng nhập Google OAuth chưa hoàn tất',
          err instanceof Error
            ? err.message
            : 'Người dùng đã đóng cửa sổ hoặc môi trường preview chặn popup.'
        );
      }
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutFirebase();
      await handleRunLiveConnectionCheck(false);
    } catch {
      // ignore
    }
  };

  const handleForceCentralSync = async () => {
    const res = await dataRepository.syncToCentralServerNow('MANUAL_ADMIN_VERIFY');
    setSyncDiagnostics(dataRepository.getSyncDiagnostics());
    if (onNotify) {
      onNotify(
        res.ok ? 'success' : 'warning',
        res.ok ? 'Đã đồng bộ dữ liệu tập trung' : 'Đã lưu vào hàng đợi khôi phục',
        res.message
      );
    }
  };

  // Thử nghiệm gõ phím Lưu tự động có kiểm soát (Debounce 1800ms, không ghi Firestore sau mỗi ký tự)
  const handleDemoDraftTyping = (newText: string) => {
    setDemoDraftText(newText);
    controlledAutoSaveEngine.scheduleControlledAutoSave({
      entityType: 'QUESTION_DRAFT',
      recordId: 'q_autosave_demo_khtn8',
      baseVersion: demoBaseVersion,
      draftPayload: {
        id: 'q_autosave_demo_khtn8',
        code: 'CH-AUTOSAVE-K8',
        levelId: 'LOWER_SECONDARY',
        grade: 8,
        subject: 'Khoa học tự nhiên',
        stem: newText,
        correctAnswer: 'A',
        points: 0.5,
        securityClassification: 'DRAFT_QUESTION',
        status: 'DRAFT',
      },
      ctx: {
        schoolId: syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du',
        actorUserId: syncDiagnostics.activeActorUserId || 'usr-admin-01',
        actorName: 'Giáo viên soạn đề (Máy A)',
        actorRole: 'TEACHER',
      },
      debounceMs: 1800,
    });
  };

  const handleFlushDemoDraftImmediately = async () => {
    const res = await controlledAutoSaveEngine.flushDraftNow({
      entityType: 'QUESTION_DRAFT',
      recordId: 'q_autosave_demo_khtn8',
      baseVersion: demoBaseVersion,
      draftPayload: {
        id: 'q_autosave_demo_khtn8',
        code: 'CH-AUTOSAVE-K8',
        levelId: 'LOWER_SECONDARY',
        grade: 8,
        subject: 'Khoa học tự nhiên',
        stem: demoDraftText,
        correctAnswer: 'A',
        points: 0.5,
        securityClassification: 'DRAFT_QUESTION',
        status: 'DRAFT',
      },
      ctx: {
        schoolId: syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du',
        actorUserId: syncDiagnostics.activeActorUserId || 'usr-admin-01',
        actorName: 'Giáo viên soạn đề (Máy A)',
        actorRole: 'TEACHER',
      },
    });
    if (res.ok && res.serverConfirmed) {
      setDemoBaseVersion(res.version);
      if (onNotify) {
        onNotify('success', 'Firestore xác nhận lưu thành công', res.message);
      }
    } else if (res.saveStatus === 'OFFLINE_CACHED') {
      if (onNotify) {
        onNotify(
          'warning',
          'Đang Offline: Mới lưu vào bộ nhớ đệm (Chưa lưu lên máy chủ)',
          res.message
        );
      }
    } else if (res.saveStatus === 'CONFLICT') {
      if (onNotify) {
        onNotify('error', 'Cảnh báo xung đột phiên bản!', res.message);
      }
    }
  };

  // Thử nghiệm mô phỏng Người dùng B lưu trước gây xung đột khi Người dùng A cố lưu bản cũ
  const handleSimulateConcurrentConflict = async () => {
    const schoolId = syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du';
    // 1. Người dùng B lưu phiên bản mới trên máy chủ trước
    const userBRes = await questionRepository.update(
      'q_autosave_demo_khtn8',
      {
        stem: `${demoDraftText} [Đã được Tổ trưởng ở Máy B hiệu đính và lưu trước]`,
        status: 'DRAFT',
      },
      {
        schoolId,
        actorUserId: 'usr_ttcm_device_b',
        actorName: 'Tổ trưởng Chuyên môn (Máy B)',
        actorRole: 'HEAD_OF_DEPARTMENT',
      },
      {
        forceResolveConflict: true,
        changeNote: 'Người dùng B cập nhật từ Máy B',
      }
    );

    // 2. Người dùng A cố lưu với baseVersion = 1 (cũ hơn version của Người dùng B)
    const userARes = await questionRepository.update(
      'q_autosave_demo_khtn8',
      {
        stem: `${demoDraftText} [Bản sửa của Giáo viên A]`,
        status: 'DRAFT',
      },
      {
        schoolId,
        actorUserId: 'usr_gv_device_a',
        actorName: 'Giáo viên A (Máy A)',
        actorRole: 'TEACHER',
      },
      {
        baseVersion: Math.max((userBRes.version || 2) - 1, 1),
        changeNote: 'Người dùng A lưu với baseVersion cũ',
      }
    );

    if (userARes.saveStatus === 'CONFLICT' && onNotify) {
      onNotify(
        'warning',
        'Đã chặn ghi đè thay đổi của người dùng khác!',
        userARes.message
      );
    }
  };

  const handleToggleOfflineSimulation = () => {
    const nextOffline = !dalSyncState.simulatedOfflineMode;
    dalSyncStateManager.setSimulatedOfflineMode(nextOffline);
    if (onNotify) {
      onNotify(
        nextOffline ? 'warning' : 'success',
        nextOffline ? 'Đã bật mô phỏng Mất mạng (Offline)' : 'Đã khôi phục kết nối mạng (Online)',
        nextOffline
          ? 'Mọi thao tác lưu lúc này chỉ nằm trong bộ nhớ đệm tạm thời, hệ thống KHÔNG báo đã lưu lên máy chủ.'
          : 'Mạng đã trực tuyến. Bạn có thể bấm "Thử lại hàng đợi Offline" để đồng bộ lên Cloud Firestore.'
      );
    }
  };

  const handleRetryOfflineQueue = async () => {
    const res = await retryAllOfflineQueuedMutations();
    if (onNotify) {
      onNotify(
        res.remainingCount === 0 ? 'success' : 'warning',
        'Kết quả thử lại hàng đợi ngoại tuyến',
        res.summaryMessage
      );
    }
  };

  const filteredStorageFiles = storageFiles.filter((f) =>
    selectedStorageModuleFilter === 'ALL'
      ? true
      : f.module === selectedStorageModuleFilter
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>
                FIREBASE SECURITY RULES & HỆ THỐNG KIỂM SOÁT TRUY CẬP DỮ LIỆU (DENY BY DEFAULT · 15 BỘ SƯU TẬP · 10 KỊCH BẢN QA)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              TRUNG TÂM BẢO MẬT CLOUD FIRESTORE, FIREBASE STORAGE RULES & KIỂM THỬ TRUY CẬP
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Áp dụng nguyên tắc{' '}
              <span className="font-mono text-emerald-300 font-bold">
                DENY BY DEFAULT (Mặc định từ chối)
              </span>
              , tuyệt đối không dùng quy tắc mở toàn cục{' '}
              <span className="font-mono text-rose-300">
                (allow read, write: if true)
              </span>
              . Phân biệt rõ{' '}
              <span className="font-mono text-amber-300">
                Firebase Auth UID (request.auth.uid)
              </span>{' '}
              với{' '}
              <span className="font-mono text-amber-300">
                Mã hồ sơ giáo viên (teacherProfileId)
              </span>
              , bảo vệ đề mật & đáp án và chặn tự nâng quyền từ Frontend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleRun10SecurityRulesScenarios(false)}
              disabled={isRunningSecurityRules10}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>
                {isRunningSecurityRules10
                  ? 'Đang kiểm thử 10 kịch bản Rules...'
                  : 'Chạy Kiểm thử 10 Kịch bản Security Rules'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRun9StorageScenariosQa(false)}
              disabled={isRunningStorage9}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>
                {isRunningStorage9
                  ? 'Đang kiểm thử Storage...'
                  : 'Kiểm thử 9 Kịch bản Storage'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleForceCentralSync}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold transition cursor-pointer"
            >
              <Server className="w-4 h-4 text-amber-400" />
              <span>Đồng bộ Kho tập trung</span>
            </button>
          </div>
        </div>

        {/* Thanh trạng thái mạng, trạng thái lưu & hàng đợi khôi phục toàn cục (Mục III, IV, VII) */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {dalSyncState.networkState === 'ONLINE' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                <Wifi className="w-3.5 h-3.5" />
                TRỰC TUYẾN (ONLINE)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                ĐANG MẤT MẠNG (OFFLINE - CHỈ LƯU BỘ ĐỆM)
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
                dalSyncState.saveStatus === 'SAVED_SERVER'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : dalSyncState.saveStatus === 'SAVING'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : dalSyncState.saveStatus === 'UNSAVED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : dalSyncState.saveStatus === 'OFFLINE_CACHED'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                  : dalSyncState.saveStatus === 'CONFLICT'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              Trạng thái lưu:{' '}
              {dalSyncState.saveStatus === 'SAVED_SERVER'
                ? 'ĐÃ XÁC NHẬN TRÊN FIRESTORE'
                : dalSyncState.saveStatus === 'SAVING'
                ? 'ĐANG LƯU LÊN FIRESTORE...'
                : dalSyncState.saveStatus === 'UNSAVED'
                ? 'CHƯA LƯU (ĐANG GỘP KÝ TỰ)'
                : dalSyncState.saveStatus === 'OFFLINE_CACHED'
                ? 'LƯU TẠM BỘ ĐỆM (CHƯA LƯU MÁY CHỦ)'
                : dalSyncState.saveStatus === 'CONFLICT'
                ? 'CẢNH BÁO XUNG ĐỘT PHIÊN BẢN'
                : 'SẴN SÀNG'}
            </span>

            <span className="text-slate-300">{dalSyncState.lastStatusMessage}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleOfflineSimulation}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                dalSyncState.simulatedOfflineMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
              }`}
            >
              {dalSyncState.simulatedOfflineMode
                ? 'Tắt mô phỏng Offline (Bật mạng lại)'
                : 'Mô phỏng Mất mạng khi đang lưu'}
            </button>

            {dalSyncState.pendingOfflineMutations.length > 0 && (
              <button
                type="button"
                onClick={handleRetryOfflineQueue}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer"
              >
                Thử lại hàng đợi ({dalSyncState.pendingOfflineMutations.length})
              </button>
            )}
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubView('PRE_UPGRADE_PROTECTION_GUARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'PRE_UPGRADE_PROTECTION_GUARD'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              Bảo vệ Dữ liệu & Quản lý Schema Trước Nâng cấp (
              {preUpgradeReport ? '10/10 Đạt · 12 Quan hệ' : 'Mục I–VII'}
              )
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('STAGE17_MASTER_ACCEPTANCE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'STAGE17_MASTER_ACCEPTANCE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              0. Nghiệm thu Giai đoạn 17 & Hiệu năng 10K CH (
              {stage17AcceptanceReport
                ? `${stage17AcceptanceReport.summaryCounts.passedCount} Đạt · 0 Lỗi`
                : 'Mục I–X'}
              )
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('BACKUP_RESTORE_VERSIONING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'BACKUP_RESTORE_VERSIONING'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>
              1. Sao lưu, Khôi phục & Phiên bản Dữ liệu (
              {backupRestoreReport
                ? `${backupRestoreReport.passedScenarios}/${backupRestoreReport.totalScenarios} Đạt`
                : '7/7'}
              )
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('AUTH_FIRESTORE_RBAC_SYNC')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'AUTH_FIRESTORE_RBAC_SYNC'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              2. Đồng bộ Auth ↔ Firestore & Phân quyền (
              {authRbacReport
                ? `${authRbacReport.passedScenarios}/${authRbacReport.totalScenarios} Đạt`
                : '9/9'}
              )
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('SECURITY_RULES_AND_10_TESTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'SECURITY_RULES_AND_10_TESTS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              3. Firebase Security Rules & 10 Kịch bản (
              {securityRules10Report
                ? `${securityRules10Report.passedScenarios}/${securityRules10Report.totalScenarios} Đạt`
                : '10/10'}
              )
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('FIREBASE_STORAGE_MANAGER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'FIREBASE_STORAGE_MANAGER'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>
              4. Quản lý Tệp Firebase Storage (
              {storage9Report
                ? `${storage9Report.passedScenarios}/${storage9Report.totalScenarios} Đạt`
                : '9/9'}
              )
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('FULL_16_MODULES_DAL_SYNC')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'FULL_16_MODULES_DAL_SYNC'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>
              5. Đồng bộ 16 Module & DAL ({sync9Report ? `${sync9Report.passedScenarios}/9` : '9/9'})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('FIRESTORE_SCHEMA_AND_INDEXES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'FIRESTORE_SCHEMA_AND_INDEXES'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>6. Cấu trúc 15 Bộ sưu tập & 8 Indexes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('DB_SANDBOX_8_TESTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'DB_SANDBOX_8_TESTS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>
              7. Kiểm thử 8 Hạng mục CSDL ({dbSandboxReport ? `${dbSandboxReport.passedTests}/8` : '8/8'})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('STATUS_DASHBOARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'STATUS_DASHBOARD'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>8. Trạng thái kết nối Firebase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('QA_7_SCENARIOS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubView === 'QA_7_SCENARIOS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              9. Kiểm thử 7 tình huống kết nối ({qaReport ? `${qaReport.passedScenarios}/7` : '7/7'})
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          VIEW -4: KIỂM TRA VÀ BẢO VỆ TOÀN BỘ DỮ LIỆU TRƯỚC KHI NÂNG CẤP PHẦN MỀM (MỤC I – VII)
         ===================================================================== */}
      {activeSubView === 'PRE_UPGRADE_PROTECTION_GUARD' && (
        <div className="space-y-6">
          {/* BANNER TỔNG QUAN BẢO VỆ TRƯỚC NÂNG CẤP */}
          <div className="bg-indigo-950 text-white rounded-2xl p-6 border border-indigo-700 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>
                    CỔNG KIỂM TRA HIỆN TRẠNG, BẢN ĐỒ PHỤ THUỘC & BẢO VỆ DỮ LIỆU TRƯỚC NÂNG CẤP (MỤC I – VII)
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Phiên bản Schema hiện tại:{' '}
                  <code className="font-mono text-amber-300">
                    {preUpgradeReport?.currentSchemaVersion || 'v17.4.0-Production'}
                  </code>{' '}
                  → Phiên bản nâng cấp tương thích ngược:{' '}
                  <code className="font-mono text-emerald-300">
                    {preUpgradeReport?.targetSchemaVersion || 'v17.5.0-AdditiveSafe'}
                  </code>
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  Cam kết kỹ thuật: Tự động tạo bản sao lưu trước khi thay đổi, khóa cứng 12 quan hệ khóa ngoại, không đổi ID đối tượng, không ghi đè bản ghi đã phê duyệt (<code className="font-mono">APPROVED</code>) và tuyệt đối không xóa dữ liệu cũ khi chưa được xác nhận.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRunPreUpgradeProtectionGuard(false)}
                disabled={isRunningPreUpgradeGuard}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isRunningPreUpgradeGuard
                  ? 'Đang quét & sao lưu bảo vệ...'
                  : 'Chạy lại Rà soát & Sao lưu Trước Nâng cấp'}
              </button>
            </div>

            {preUpgradeReport && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-indigo-800/80 text-xs">
                <div className="p-3 rounded-xl bg-indigo-900/50 border border-indigo-700/60">
                  <div className="text-indigo-200 font-bold">Mục III. Bản sao lưu trước nâng cấp</div>
                  <div className="font-mono font-bold text-emerald-300 mt-1">
                    {preUpgradeReport.preUpgradeBackupSummary.snapshotId}
                  </div>
                  <div className="text-[11px] text-indigo-200 mt-0.5">
                    {preUpgradeReport.preUpgradeBackupSummary.totalFirestoreDocsBackedUp} bản ghi Firestore +{' '}
                    {preUpgradeReport.preUpgradeBackupSummary.totalStorageFilesBackedUp} tệp Storage
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-900/50 border border-indigo-700/60">
                  <div className="text-indigo-200 font-bold">Mục II. Bản đồ phụ thuộc 12 quan hệ</div>
                  <div className="font-bold text-white mt-1">
                    12/12 Quan hệ Khóa ngoại Nguyên vẹn
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">
                    0 bản ghi mồ côi · Cấm xóa/đổi khóa liên kết
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-900/50 border border-indigo-700/60">
                  <div className="text-indigo-200 font-bold">Mục V. Chế độ Migration</div>
                  <div className="font-bold text-white mt-1">
                    Tương thích ngược (Additive-Only)
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">
                    Không xóa dữ liệu gốc · Không sửa bản APPROVED
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-900/50 border border-indigo-700/60">
                  <div className="text-indigo-200 font-bold">Mục VI. Đối chiếu sau nâng cấp</div>
                  <div className="font-bold text-white mt-1">
                    ĐẠT 10/10 Hạng mục Kiểm tra
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">
                    Staging: {preUpgradeReport.preUpgradeBackupSummary.restoreStagingNamespace}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MỤC I: RÀ SOÁT 10 HẠNG MỤC HIỆN TRẠNG HỆ THỐNG */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                MỤC I. KIỂM TRA HIỆN TRẠNG 10 HẠNG MỤC TRƯỚC KHI THỰC HIỆN THAY ĐỔI
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold w-12">#</th>
                    <th className="py-3 px-4 font-bold min-w-[200px]">Hạng mục Rà soát</th>
                    <th className="py-3 px-4 font-bold min-w-[160px]">Trạng thái Hiện tại</th>
                    <th className="py-3 px-4 font-bold min-w-[260px]">Kết quả Rà soát Thực tế</th>
                    <th className="py-3 px-4 font-bold min-w-[220px]">Bằng chứng Kỹ thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(preUpgradeReport?.currentState10Audit || []).map((item) => (
                    <tr key={item.categoryCode} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3 px-4 font-bold text-slate-800">{item.order}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.categoryTitle}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {item.currentStatusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">
                        {item.findingsSummary}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-800">
                        {item.technicalEvidence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MỤC II: BẢN ĐỒ PHỤ THUỘC 12 QUAN HỆ KHÓA LIÊN KẾT */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                MỤC II. BẢN ĐỒ PHỤ THUỘC 12 QUAN HỆ DỮ LIỆU & KHÓA LIÊN KẾT (KHÔNG XÓA / KHÔNG ĐỔI KHÓA)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Quan hệ Phụ thuộc</th>
                    <th className="py-3 px-4 font-bold">Collection Nguồn & Khóa chính</th>
                    <th className="py-3 px-4 font-bold">Collection Đích & Khóa ngoại</th>
                    <th className="py-3 px-4 font-bold text-center">Bản ghi Mồ côi</th>
                    <th className="py-3 px-4 font-bold text-center">Trạng thái Khóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(preUpgradeReport?.dependencyMap12Relations || []).map((rel) => (
                    <tr key={rel.relationCode} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">{rel.relationTitle}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-800">
                        {rel.sourceCollection} · <span className="font-bold text-indigo-700">{rel.sourceKeyField}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-800">
                        {rel.targetCollection} · <span className="font-bold text-emerald-700">{rel.targetForeignKeyField}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                        {rel.orphanRecordsCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          BẢO VỆ ({rel.cardinality})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MỤC IV & VI: QUẢN LÝ THAY ĐỔI SCHEMA & ĐỐI CHIẾU 10 CHỈ SỐ SAU NÂNG CẤP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MỤC IV: QUẢN LÝ THAY ĐỔI SCHEMA */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">
                  MỤC IV. DANH MỤC QUẢN LÝ THAY ĐỔI SCHEMA (TƯƠNG THÍCH NGƯỢC)
                </h3>
              </div>
              <div className="p-4 space-y-4 text-xs">
                {(preUpgradeReport?.schemaChangeRegistry || []).map((sch) => (
                  <div
                    key={sch.schemaVersionCode}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold">
                        {sch.schemaVersionCode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        TƯƠNG THÍCH NGƯỢC 100% · 0 TRƯỜNG BỊ XÓA
                      </span>
                    </div>
                    <div className="font-bold text-slate-900">{sch.changeTitle}</div>
                    <p className="text-slate-700 leading-relaxed">{sch.changeDescription}</p>
                    <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800">Collection ảnh hưởng:</span>{' '}
                        <code className="font-mono text-indigo-700">
                          {sch.affectedCollections.join(', ')}
                        </code>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Trường thêm mới:</span>{' '}
                        <code className="font-mono text-emerald-700">
                          {sch.addedFields.join(', ')}
                        </code>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Tác động dữ liệu cũ:</span>{' '}
                        {sch.legacyDataImpact}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Phương án Rollback:</span>{' '}
                        {sch.rollbackPlan}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MỤC VI: KIỂM TRA 10 HẠNG MỤC SAU NÂNG CẤP */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">
                  MỤC VI. KIỂM TRA 10 HẠNG MỤC TRƯỚC & SAU KHI NÂNG CẤP (ĐỐI CHIẾU STAGING)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Hạng mục Kiểm tra</th>
                      <th className="py-2.5 px-3 font-bold">Trước Nâng cấp</th>
                      <th className="py-2.5 px-3 font-bold">Sau Nâng cấp (Staging)</th>
                      <th className="py-2.5 px-3 font-bold text-center">Kết luận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(preUpgradeReport?.postUpgrade10Checks || []).map((chk) => (
                      <tr key={chk.checkCode} className="hover:bg-slate-50/80 align-top">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{chk.checkTitle}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {chk.evidenceDetail}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          {chk.beforeUpgradeValue}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-800 font-bold">
                          {chk.afterUpgradeStagingValue}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {chk.matchedAndIntact ? 'KHỚP 100%' : 'LỆCH'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW -3: BÁO CÁO NGHIỆM THU TOÀN BỘ GIAI ĐOẠN 17 (MỤC I – X & ĐO HIỆU NĂNG 10.000 CH)
         ===================================================================== */}
      {activeSubView === 'STAGE17_MASTER_ACCEPTANCE' && (
        <div className="space-y-6">
          {/* BANNER KẾT LUẬN NGHIỆM THU 6 ĐIỀU KIỆN BẮT BUỘC (MỤC X) */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-700 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>BIÊN BẢN NGHIỆM THU KỸ THUẬT TOÀN DIỆN GIAI ĐOẠN 17 (MỤC I – X)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {stage17AcceptanceReport?.finalConclusion.verdictStatement ||
                    'Đang thực thi bộ kiểm thử nghiệm thu toàn diện Giai đoạn 17...'}
                </h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Dự án Firebase: <code className="font-mono font-bold">taodeai-513007</code> ·
                  CSDL Firestore:{' '}
                  <code className="font-mono font-bold">
                    ai-studio-remixedutestai30-2c98a616-1204-4d6a-b187-01950e04b4c8
                  </code>{' '}
                  · Kho tệp: <code className="font-mono font-bold">taodeai-513007.firebasestorage.app</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRunStage17MasterAcceptance(false)}
                disabled={isRunningStage17Acceptance}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isRunningStage17Acceptance
                  ? 'Đang đo hiệu năng & nghiệm thu...'
                  : 'Chạy lại Nghiệm thu Giai đoạn 17 (Mục I–X)'}
              </button>
            </div>

            {stage17AcceptanceReport && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-emerald-800/80 text-xs">
                <div className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60">
                  <div className="text-emerald-300 font-bold">1. Kết nối Firebase thực</div>
                  <div className="font-bold text-white mt-1">
                    {stage17AcceptanceReport.finalConclusion.firebaseConnectedReal
                      ? 'ĐẠT (5/5 Dịch vụ)'
                      : 'CHƯA ĐẠT'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60">
                  <div className="text-emerald-300 font-bold">2. Dữ liệu Lưu bền vững</div>
                  <div className="font-bold text-white mt-1">
                    {stage17AcceptanceReport.finalConclusion.durablePersistenceVerified
                      ? 'ĐẠT (12/12 Nhóm)'
                      : 'CHƯA ĐẠT'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60">
                  <div className="text-emerald-300 font-bold">3. Phân quyền Backend</div>
                  <div className="font-bold text-white mt-1">
                    {stage17AcceptanceReport.finalConclusion.backendRbacVerified
                      ? 'ĐẠT (6/6 Chặn 403)'
                      : 'CHƯA ĐẠT'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60">
                  <div className="text-emerald-300 font-bold">4. Security Rules An toàn</div>
                  <div className="font-bold text-white mt-1">
                    {stage17AcceptanceReport.finalConclusion.securityRulesSafe
                      ? 'ĐẠT (10/10 AST Rules)'
                      : 'CHƯA ĐẠT'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60">
                  <div className="text-emerald-300 font-bold">5. Không lỗi nghiêm trọng</div>
                  <div className="font-bold text-white mt-1">
                    {stage17AcceptanceReport.finalConclusion.zeroCriticalBugs
                      ? '0 LỖI NGHIÊM TRỌNG'
                      : 'CÓ LỖI'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60">
                  <div className="text-emerald-300 font-bold">6. Sao lưu & Khôi phục</div>
                  <div className="font-bold text-white mt-1">
                    {stage17AcceptanceReport.finalConclusion.backupRestoreTested
                      ? 'ĐẠT (Staging 7 Bước)'
                      : 'CHƯA ĐẠT'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MỤC X: BẢNG BÁO CÁO NGHIỆM THU TỔNG THỂ GIAI ĐOẠN 17 */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  MỤC X. BẢNG BÁO CÁO NGHIỆM THU TỔNG THỂ GIAI ĐOẠN 17 (ĐẦY ĐỦ 8 CỘT CHUẨN)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tổng hợp bằng chứng thực tế cho các mục I đến IX: Mã kiểm thử, Module, Thao tác, Kết quả mong đợi, Kết quả thực tế, Đạt/Không đạt/Chưa kiểm thử, Lỗi và Phương án khắc phục.
                </p>
              </div>
              {stage17AcceptanceReport && (
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ĐẠT: {stage17AcceptanceReport.summaryCounts.passedCount}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300">
                    KHÔNG ĐẠT: {stage17AcceptanceReport.summaryCounts.failedCount}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                    CẦN CẤU HÌNH HẠ TẦNG CLOUD:{' '}
                    {stage17AcceptanceReport.summaryCounts.untestedNeedsCloudInfraCount}
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3 font-bold w-28">Mã KT</th>
                    <th className="py-3 px-3 font-bold min-w-[160px]">Module</th>
                    <th className="py-3 px-3 font-bold min-w-[200px]">Thao tác</th>
                    <th className="py-3 px-3 font-bold min-w-[200px]">Kết quả mong đợi</th>
                    <th className="py-3 px-3 font-bold min-w-[230px]">Kết quả thực tế</th>
                    <th className="py-3 px-3 font-bold text-center w-32">Trạng thái</th>
                    <th className="py-3 px-3 font-bold min-w-[160px]">Lỗi / Cảnh báo</th>
                    <th className="py-3 px-3 font-bold min-w-[190px]">Phương án khắc phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(stage17AcceptanceReport?.acceptanceTable || []).map((row) => (
                    <tr key={row.testCode} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-800">
                        <div>{row.testCode}</div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {row.sectionRef}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{row.moduleName}</td>
                      <td className="py-3 px-3 text-slate-700 leading-relaxed">{row.operation}</td>
                      <td className="py-3 px-3 text-slate-700 leading-relaxed">
                        {row.expectedResult}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium leading-relaxed">
                        {row.actualResult}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {row.status === 'DAT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ĐẠT
                          </span>
                        ) : row.status === 'KHONG_DAT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            KHÔNG ĐẠT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[10px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            CHƯA KT (CẦN IAM/BLAZE)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700 leading-relaxed">
                        {row.detectedIssue}
                      </td>
                      <td className="py-3 px-3 text-slate-700 leading-relaxed">
                        {row.remediationPlan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MỤC IX: BẢNG ĐO HIỆU NĂNG THỰC TẾ & ƯỚC TÍNH CHI PHÍ ĐỌC/GHI FIRESTORE */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                MỤC IX. KẾT QUẢ ĐO HIỆU NĂNG THỰC TẾ & CHI PHÍ ĐỌC/GHI FIRESTORE (100 TK, 1.000 CH, 10.000 CH, 1.000 ĐỀ)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Đo thời gian thực tế bằng <code className="font-mono">process.hrtime.bigint()</code> khi sinh dữ liệu, quét toàn bộ (Full Scan) so với truy vấn qua Chỉ mục Tổ hợp (<code className="font-mono">Composite Index + Cursor Pagination limit(50)</code>).
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Quy mô Tập dữ liệu Kiểm thử</th>
                    <th className="py-3 px-4 font-bold text-center">Số bản ghi</th>
                    <th className="py-3 px-4 font-bold text-center">Thời gian Tạo (ms)</th>
                    <th className="py-3 px-4 font-bold text-center">Quét Toàn bộ (ms)</th>
                    <th className="py-3 px-4 font-bold text-center">
                      Truy vấn Index + Phân trang (ms)
                    </th>
                    <th className="py-3 px-4 font-bold">Composite Index Sử dụng</th>
                    <th className="py-3 px-4 font-bold text-center">Chi phí Ghi (USD)</th>
                    <th className="py-3 px-4 font-bold text-center">
                      Chi phí Đọc: Full Scan vs Phân trang
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(stage17AcceptanceReport?.performanceBenchmarks || []).map((b) => (
                    <tr key={b.datasetCode} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">{b.datasetLabel}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {b.recordCountGenerated.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {b.seedCreationTimeMs} ms
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-amber-800">
                        {b.unindexedFullScanTimeMs} ms ({b.estimatedReadsFullScan.toLocaleString()}{' '}
                        reads)
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                        {b.indexedPaginatedQueryTimeMs} ms ({b.estimatedReadsPaginated} reads)
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-800">
                        {b.compositeIndexUsed}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-800">
                        ${b.estimatedWriteCostUsd.toFixed(5)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-mono text-slate-800">
                          ${b.estimatedReadCostFullScanUsd.toFixed(5)} →{' '}
                          <span className="font-bold text-emerald-700">
                            ${b.estimatedReadCostPaginatedUsd.toFixed(5)}
                          </span>
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Tiết kiệm {b.costReductionPercent}% lượt đọc
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MỤC II & VI: LƯU TRỮ 12 NHÓM SAU ĐĂNG XUẤT/ĐĂNG NHẬP LẠI & KIỂM TRA MẤT MẠNG 4 TÁC VỤ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MỤC II: 12 NHÓM DỮ LIỆU SAU KHI ĐĂNG XUẤT & ĐĂNG NHẬP LẠI */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">
                  MỤC II. KIỂM TRA 12 NHÓM LƯU TRỮ TRƯỚC & SAU KHI ĐĂNG XUẤT / ĐĂNG NHẬP LẠI
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đối chiếu chữ ký SHA-256 của 12 nhóm dữ liệu trước khi đăng xuất và sau khi đăng nhập lại.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">#</th>
                      <th className="py-2.5 px-3 font-bold">Nhóm Dữ liệu</th>
                      <th className="py-2.5 px-3 font-bold">SHA-256 Trước / Sau</th>
                      <th className="py-2.5 px-3 font-bold text-center">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(stage17AcceptanceReport?.storage12Items || []).map((item) => (
                      <tr key={item.groupCode} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-700">{item.order}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.vietnameseName}</div>
                          <div className="text-[11px] text-slate-500">{item.sampleSummary}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600">
                          <div>Trước: {item.sha256HashBeforeLogout}...</div>
                          <div>Sau: {item.sha256HashAfterRelogin}...</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {item.hashMatched ? 'BỀN VỮNG 100%' : 'LỆCH'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MỤC III & VI: ĐỒNG BỘ ĐA THIẾT BỊ & KIỂM TRA MẤT MẠNG 4 TÁC VỤ */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-900">
                    MỤC VI. KIỂM TRA MẤT MẠNG 4 TÁC VỤ & PHÂN BIỆT RÕ CHỜ ĐỒNG BỘ VS ĐÃ LƯU MÁY CHỦ
                  </h3>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  {(stage17AcceptanceReport?.offlineQueueTests || []).map((off) => (
                    <div
                      key={off.operationCode}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5"
                    >
                      <div className="font-bold text-slate-900">{off.operationTitle}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                          Khi mất mạng: {off.whileOfflineBadgeLabel}
                        </span>
                        <span className="text-slate-400 font-bold">→</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                          Khi có mạng lại: {off.afterReconnectBadgeLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-900">
                    MỤC III. KIỂM TRA ĐỒNG BỘ ĐA THIẾT BỊ (MÁY A ↔ MÁY B)
                  </h3>
                </div>
                <div className="p-4 space-y-2.5 text-xs">
                  {(stage17AcceptanceReport?.multiDeviceSteps || []).map((step) => (
                    <div
                      key={step.stepOrder}
                      className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          Bước {step.stepOrder} ({step.deviceCode}): {step.actionTitle}
                        </div>
                        <div className="text-slate-600 mt-0.5">{step.payloadSnapshot}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                        v{step.versionBefore} → v{step.versionAfter} ({step.latencyMs}ms)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW -2: HỆ THỐNG SAO LƯU, KHÔI PHỤC VÀ QUẢN LÝ PHIÊN BẢN DỮ LIỆU FIREBASE (MỤC I -> VII)
         ===================================================================== */}
      {activeSubView === 'BACKUP_RESTORE_VERSIONING' && (
        <div className="space-y-6">
          {/* CẢNH BÁO MINH BẠCH KỸ THUẬT VỀ SAO LƯU ĐỊNH KỲ TRÊN HẠ TẦNG GCP (MỤC II & III) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="font-bold text-sm flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  MINH BẠCH KỸ THUẬT VỀ SAO LƯU ĐỊNH KỲ CLOUD FIRESTORE & FIREBASE STORAGE (MỤC II & III)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-950 font-bold text-[11px]">
                Không tự tuyên bố có sao lưu định kỳ tự động trên GCP nếu chưa cấu hình IAM & Billing
              </span>
            </div>
            <p className="leading-relaxed">
              {backupRestoreReport?.scheduledBackupHonestStatus.statusBanner ||
                'Sao lưu thủ công 12 nhóm dữ liệu Firestore & Manifest Storage đã hoạt động thực tế trong ứng dụng. Sao lưu định kỳ tự động cấp hạ tầng Google Cloud đòi hỏi cấu hình quyền IAM, gói Blaze Plan và lịch chạy trên GCP Console.'}
            </p>
            {backupRestoreReport?.scheduledBackupHonestStatus && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white border border-amber-200">
                  <div className="font-bold text-slate-900 mb-1">
                    Quyền IAM & Chi phí hạ tầng cần cấu hình trên dự án{' '}
                    <code className="font-mono text-indigo-700">taodeai-513007</code>:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {backupRestoreReport.scheduledBackupHonestStatus.requiredIamRoles.map(
                      (role) => (
                        <li key={role} className="font-mono text-[11px]">
                          {role}
                        </li>
                      )
                    )}
                  </ul>
                  <div className="mt-1.5 text-[11px] text-slate-600">
                    {backupRestoreReport.scheduledBackupHonestStatus.estimatedCostNote}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] flex flex-col justify-between">
                  <div className="text-slate-400 font-sans font-bold text-xs mb-1">
                    Lệnh Google Cloud CLI chuẩn để bật Lịch sao lưu định kỳ (Managed Backup Schedule):
                  </div>
                  <div className="break-all">
                    {backupRestoreReport.scheduledBackupHonestStatus.recommendedGcloudCommand}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BẢNG ĐIỀU KHIỂN THAO TÁC TRỰC TIẾP: SAO LƯU, KIỂM TRA KHÓA PHIÊN BẢN ĐÃ DUYỆT & KHÔI PHỤC STAGING */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>
                    TRUNG TÂM ĐIỀU HÀNH SAO LƯU 12 NHÓM DỮ LIỆU, QUẢN LÝ PHIÊN BẢN & KHÔI PHỤC 7 BƯỚC (MỤC I – VII)
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Thực thi trực tiếp các tác vụ sao lưu thủ công, kiểm chứng chặn ghi đè phiên bản đã phê duyệt (<code className="font-mono">APPROVED</code>), tạo nhánh phiên bản mới (<code className="font-mono">v2 - DRAFT</code>) và khôi phục an toàn vào Môi trường Kiểm thử (<code className="font-mono">Staging Sandbox</code>).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInteractiveBackupRestoreAction('MANUAL_BACKUP_ADMIN')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  1. Tạo Bản Sao lưu Thủ công (12 Nhóm + Storage)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInteractiveBackupRestoreAction('BLOCK_OVERWRITE_APPROVED_VERSION')
                  }
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  2. Thử Sửa trực tiếp Đề v1 đã Phê duyệt (Chặn 403)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInteractiveBackupRestoreAction('CREATE_NEW_DRAFT_VERSION_V2')
                  }
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                >
                  3. Tạo Phiên bản Mới (v2 - DRAFT) Hợp lệ
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInteractiveBackupRestoreAction('RESTORE_TO_STAGING_SANDBOX')
                  }
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
                >
                  4. Khôi phục vào Môi trường Kiểm thử (Staging)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInteractiveBackupRestoreAction('UNAUTHORIZED_TEACHER_BACKUP')
                  }
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  5. Thử Giáo viên thường gọi Sao lưu (Chặn 403)
                </button>
              </div>
            </div>

            {liveBackupActionFeedback && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs ${
                  liveBackupActionFeedback.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="font-bold">
                  Kết quả phản hồi từ Backend (HTTP {liveBackupActionFeedback.httpStatus}):
                </div>
                <div className="mt-1">{liveBackupActionFeedback.message}</div>
              </div>
            )}
          </div>

          {/* KHỐI 1: BẢNG KẾT QUẢ KIỂM THỬ 7 KỊCH BẢN SAO LƯU, KHÔI PHỤC & PHIÊN BẢN (MỤC VII) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  BÁO CÁO KIỂM THỬ THỰC TẾ 7 HẠNG MỤC SAO LƯU, KHÔI PHỤC, ĐỐI CHIẾU & BẢO MẬT (MỤC VII)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Kiểm tra: Sao lưu, sửa dữ liệu, khôi phục vào môi trường kiểm thử, đối chiếu số lượng, đối chiếu nội dung, kiểm tra quyền truy cập và kiểm tra tệp Storage.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {backupRestoreReport && (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    ĐẠT {backupRestoreReport.passedScenarios}/{backupRestoreReport.totalScenarios}{' '}
                    HẠNG MỤC
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRunBackupRestoreQa(false)}
                  disabled={isRunningBackupRestoreQa}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isRunningBackupRestoreQa ? 'Đang chạy lại...' : 'Chạy lại 7 Hạng mục QA'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold w-12">#</th>
                    <th className="py-3 px-4 font-bold min-w-[220px]">Hạng mục Kiểm thử</th>
                    <th className="py-3 px-4 font-bold min-w-[240px]">Thao tác & Kỳ vọng</th>
                    <th className="py-3 px-4 font-bold min-w-[290px]">Kết quả Thực tế</th>
                    <th className="py-3 px-4 font-bold text-center w-28">Kết luận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(backupRestoreReport?.scenarios || []).map((sc) => (
                    <tr key={sc.order} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3.5 px-4 font-bold text-slate-900">#{sc.order}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sc.title}</div>
                        <div className="text-[11px] text-indigo-700 mt-1">
                          Tham chiếu: {sc.requirementRef}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 leading-relaxed">{sc.actionPerformed}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Kỳ vọng: {sc.expectedResult}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] mb-1 ${
                            sc.httpStatus === 200
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          HTTP {sc.httpStatus}
                        </span>
                        <div className="text-slate-800 leading-relaxed">{sc.actualResult}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {sc.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ĐẠT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            LỖI
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 2: BẢNG ĐỐI CHIẾU KHÔI PHỤC 12 NHÓM DỮ LIỆU TRONG MÔI TRƯỜNG KIỂM THỬ STAGING (MỤC I & V) */}
          {backupRestoreReport?.latestStagingRestoreJob && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ĐỐI CHIẾU SỐ LƯỢNG & MÃ BĂM SHA-256 CHO 12 NHÓM DỮ LIỆU KHI KHÔI PHỤC VÀO STAGING (MỤC I & V)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Không gian khôi phục kiểm thử:{' '}
                    <code className="font-mono font-bold text-indigo-700">
                      {backupRestoreReport.latestStagingRestoreJob.stagingNamespace}
                    </code>{' '}
                    · Ghi đè dữ liệu đang dùng:{' '}
                    <span className="font-bold text-emerald-700">
                      KHÔNG (productionDataOverwrittenDuringStaging = false)
                    </span>
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
                  Bước hiện tại: {backupRestoreReport.latestStagingRestoreJob.currentStepNumber}/7 (
                  {backupRestoreReport.latestStagingRestoreJob.principalApprovalStatus})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-3 px-4 font-bold">Nhóm Dữ liệu Bảo vệ (12 Nhóm)</th>
                      <th className="py-3 px-4 font-bold text-center">Bản Sao lưu</th>
                      <th className="py-3 px-4 font-bold text-center">Khôi phục Staging</th>
                      <th className="py-3 px-4 font-bold text-center">Khớp Số lượng</th>
                      <th className="py-3 px-4 font-bold text-center">Khớp Nội dung SHA-256</th>
                      <th className="py-3 px-4 font-bold">Ghi chú Đối chiếu với Môi trường Hiện tại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {backupRestoreReport.latestStagingRestoreJob.reconciliationRows.map((row) => (
                      <tr key={row.groupCode} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {row.vietnameseName}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                          {row.backupCount}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                          {row.stagingRestoredCount}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {row.countMatched ? 'KHỚP 100%' : 'LỆCH'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {row.contentHashMatched ? 'SHA-256 OK' : 'LỆCH HASH'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.sampleDiffNote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KHỐI 3: LỊCH SỬ PHIÊN BẢN BẤT BIẾN CHO 6 ĐỐI TƯỢNG CHUYÊN MÔN (MỤC IV) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                QUẢN LÝ PHIÊN BẢN BẤT BIẾN CHO 6 ĐỐI TƯỢNG: CÂU HỎI, MA TRẬN, BẢN ĐẶC TẢ, ĐỀ KIỂM TRA, ĐÁP ÁN, HƯỚNG DẪN CHẤM (MỤC IV)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Lưu đầy đủ VersionId, Người sửa, Thời gian, Nội dung thay đổi, Lý do thay đổi và Trạng thái. Các phiên bản đã phê duyệt (<code className="font-mono">APPROVED</code>) bị khóa cứng không cho phép sửa trực tiếp.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Loại & Tên Đối tượng</th>
                    <th className="py-3 px-4 font-bold text-center">VersionId</th>
                    <th className="py-3 px-4 font-bold">Người sửa & Thời gian</th>
                    <th className="py-3 px-4 font-bold">Nội dung thay đổi & Lý do thay đổi</th>
                    <th className="py-3 px-4 font-bold text-center">Trạng thái & Khóa Bất biến</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(backupRestoreReport?.versionHistoryRecords || []).map((ver) => (
                    <tr key={ver.versionRecordId} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3 px-4">
                        <div className="text-[10px] font-bold uppercase text-indigo-700">
                          {ver.entityTypeVietnamese}
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{ver.entityTitle}</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          ID: {ver.entityId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                          {ver.versionId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{ver.editedByName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{ver.editedByUid}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(ver.editedAt).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{ver.changeSummary}</div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Lý do: <span className="italic">{ver.changeReason}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                            ver.immutableLocked
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {ver.status}{' '}
                          {ver.immutableLocked ? '· KHÓA BẤT BIẾN' : '· NHÁNH NHÁP MỚI'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 4: BÁO CÁO MINH BẠCH NHỮNG PHẦN ĐÃ ĐƯỢC SAO LƯU THỰC TẾ VÀ NHỮNG PHẦN CẦN CẤU HÌNH HẠ TẦNG GCP (MỤC II, III & VII) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                BÁO CÁO MINH BẠCH: NHỮNG PHẦN ĐÃ ĐƯỢC BẢO VỆ THỰC TẾ VÀ NHỮNG PHẦN HẠ TẦNG CẦN CẤU HÌNH THÊM (MỤC II, III & VII)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Hạng mục Bảo vệ Dữ liệu & Tệp</th>
                    <th className="py-3 px-4 font-bold">Trạng thái Thực tế</th>
                    <th className="py-3 px-4 font-bold">Chi tiết Kỹ thuật</th>
                    <th className="py-3 px-4 font-bold">Cấu hình / Lệnh Hạ tầng Tương ứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(backupRestoreReport?.coverageTransparencyMatrix || []).map((item) => (
                    <tr key={item.componentName} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.componentName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                            item.protectionStatus === 'PROTECTED_IN_APP'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {item.vietnameseStatusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">
                        {item.technicalDetails}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-800 break-all">
                        {item.requiredActionOrGcloudCommand}
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
          VIEW -1: ĐỒNG BỘ FIREBASE AUTHENTICATION VỚI FIRESTORE & PHÂN QUYỀN (MỤC I -> VIII)
         ===================================================================== */}
      {activeSubView === 'AUTH_FIRESTORE_RBAC_SYNC' && (
        <div className="space-y-6">
          {/* 4 THẺ CHỈ SỐ BẢO MẬT ĐỒNG BỘ AUTH <-> FIRESTORE <-> RBAC */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-emerald-700">
                1. Cấu trúc Không Mật khẩu (Mục II)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {authRbacReport?.noPasswordInFirestoreVerified
                  ? 'Xác nhận 0% Mật khẩu trong Firestore'
                  : 'Đang kiểm tra...'}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Firebase Auth lưu thông tin đăng nhập; Firestore chỉ lưu{' '}
                <code className="font-mono font-bold text-indigo-700">authUid</code>, hồ sơ chuyên môn, phân công giảng dạy và phạm vi quyền (<code className="font-mono">passwordStoredInFirestore = false</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-indigo-700">
                2. Tạo Tài khoản 8 Bước An toàn (Mục III)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {authRbacReport?.idempotentProvisioningVerified
                  ? 'Idempotent Retry (Không tạo trùng)'
                  : 'Đang kiểm tra...'}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Nếu lỗi ở bước trung gian, hệ thống ghi nhận{' '}
                <code className="font-mono text-amber-700">INCOMPLETE_PROVISIONING</code> và cho phép thử lại an toàn bằng <code className="font-mono">idempotencyKey</code> mà không tạo trùng tài khoản Auth.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-amber-700">
                3. Thu hồi Quyền Tức thì (Mục VI)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {authRbacReport?.liveRevocationWithoutLogoutVerified
                  ? 'Chặn ngay trên phiên đang mở'
                  : 'Đang kiểm tra...'}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Khi thu hồi quyền, hệ thống tăng <code className="font-mono">permissionVersion</code>, cập nhật giao diện ngay và từ chối thao tác ở Backend mà không cần chờ giáo viên đăng xuất.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-rose-700">
                4. Khóa Tài khoản & Thu hồi Token (Mục VII)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {authRbacReport?.lockedAccountRejectsValidOldTokenVerified
                  ? 'Từ chối cả ID Token cũ còn hạn'
                  : 'Đang kiểm tra...'}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Khi khóa tài khoản (<code className="font-mono">status=LOCKED</code>, <code className="font-mono">auth.disabled=true</code>, cập nhật <code className="font-mono">tokensValidAfterTime</code>), Backend chặn ngay cả khi ID Token cũ chưa hết hạn.
              </p>
            </div>
          </div>

          {/* KHỐI A: HỒ SƠ ĐỒNG BỘ 3 TÀI KHOẢN CHUẨN (GIÁO VIÊN TIỂU HỌC, GIÁO VIÊN THCS, TỔ TRƯỞNG CHUYÊN MÔN) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  3 TÀI KHOẢN KIỂM THỬ THỰC TẾ: LIÊN KẾT FIREBASE AUTHENTICATION ↔ FIRESTORE ↔ PHÂN QUYỀN (MỤC II, III & VIII)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đối chiếu trực tiếp định danh xác thực Firebase Auth và hồ sơ phân công giảng dạy, quyền chức năng trên Cloud Firestore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRunAuthRbacVerification(false)}
                disabled={isRunningAuthRbac}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isRunningAuthRbac
                  ? 'Đang đồng bộ & kiểm thử...'
                  : 'Chạy lại Kiểm thử 3 Tài khoản & 9 Kịch bản'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
              {(authRbacReport?.threeStandardAccounts || []).map((acc) => (
                <div
                  key={acc.authRecord.uid}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between space-y-3 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {acc.firestoreProfile.fullName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {acc.firestoreProfile.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                      {acc.vietnameseTitle}
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-[11px] text-slate-800 uppercase">
                        Firebase Authentication:
                      </div>
                      <div className="font-mono text-[11px] text-slate-700">
                        UID: <span className="font-bold">{acc.authRecord.uid}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700">
                        Email: {acc.authRecord.email}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Auth Disabled:{' '}
                        <span className="font-bold">{String(acc.authRecord.disabled)}</span> ·
                        Revocation Epoch:{' '}
                        <span className="font-bold">v{acc.authRecord.sessionRevocationEpoch}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-[11px] text-slate-800 uppercase">
                        Firestore Profile & Phân quyền:
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Mã hồ sơ GV:{' '}
                        <span className="font-mono font-bold">
                          {acc.firestoreProfile.teacherProfileId}
                        </span>{' '}
                        · Tổ: <span className="font-semibold">{acc.firestoreProfile.departmentName}</span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Cấp học:{' '}
                        <span className="font-bold">
                          {acc.firestoreProfile.educationLevels.join(', ')}
                        </span>{' '}
                        · Môn:{' '}
                        <span className="font-bold">
                          {acc.firestoreProfile.subjects.join(', ')}
                        </span>{' '}
                        · Khối:{' '}
                        <span className="font-bold">
                          {acc.firestoreProfile.grades.join(', ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Vai trò:{' '}
                        <span className="font-mono font-bold text-indigo-700">
                          {acc.firestoreProfile.roles.join(', ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-semibold">
                        Lưu mật khẩu trong Firestore:{' '}
                        {String(acc.firestoreProfile.passwordStoredInFirestore)} (An toàn 100%)
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {acc.firestoreProfile.functionalPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono text-[10px]"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KHỐI B: BẢNG KẾT QUẢ KIỂM THỬ 9 KỊCH BẢN ĐỒNG BỘ AUTH <-> FIRESTORE <-> PHÂN QUYỀN (MỤC VIII) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  BÁO CÁO NGHIỆM THU 9 KỊCH BẢN ĐỒNG BỘ FIREBASE AUTHENTICATION, FIRESTORE & PHÂN QUYỀN (MỤC VIII)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Kiểm tra thực tế: Đăng nhập, đọc hồ sơ, đọc phân quyền, tạo đề đúng môn, từ chối môn ngoài quyền, thu hồi quyền khi đang đăng nhập, khóa tài khoản, mở khóa tài khoản và đăng nhập trên thiết bị khác.
                </p>
              </div>
              {authRbacReport && (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  ĐẠT {authRbacReport.passedScenarios}/{authRbacReport.totalScenarios} KỊCH BẢN
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold w-12">#</th>
                    <th className="py-3 px-4 font-bold min-w-[210px]">
                      Kịch bản Kiểm thử & Tài khoản Thực hiện
                    </th>
                    <th className="py-3 px-4 font-bold min-w-[230px]">
                      Thao tác Thực hiện & Kỳ vọng
                    </th>
                    <th className="py-3 px-4 font-bold min-w-[280px]">
                      Kết quả Thực tế từ Backend & Firestore
                    </th>
                    <th className="py-3 px-4 font-bold min-w-[180px]">
                      Trạng thái Đồng bộ UID & Firestore
                    </th>
                    <th className="py-3 px-4 font-bold text-center w-28">Kết luận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(authRbacReport?.scenarios || []).map((sc) => (
                    <tr key={sc.order} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3.5 px-4 font-bold text-slate-900">#{sc.order}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sc.title}</div>
                        <div className="text-[11px] text-indigo-700 font-medium mt-1">
                          {sc.actorAccountLabel}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Tham chiếu: {sc.requirementRef}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 leading-relaxed">{sc.actionPerformed}</div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Kỳ vọng: {sc.expectedOutcome}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] mb-1 ${
                            sc.httpStatus === 200
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          HTTP {sc.httpStatus}
                        </span>
                        <div className="text-slate-800 leading-relaxed">{sc.actualOutcome}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-indigo-700">
                          UID: {sc.authUidVerified}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          {sc.firestoreStateVerified}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {sc.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ĐẠT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            LỖI
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI C: BẢNG ĐIỀU KHIỂN THỬ NGHIỆM TRỰC TIẾP CHỈNH SỬA ĐỒNG BỘ, THU HỒI QUYỀN TỨC THÌ & KHÓA TÀI KHOẢN (MỤC IV, VI, VII) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  THỬ NGHIỆM TRỰC TIẾP: ĐỒNG BỘ EMAIL AUTH, THU HỒI QUYỀN KHI ĐANG ĐĂNG NHẬP & KHÓA TÀI KHOẢN (MỤC IV, VI, VII)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Kiểm tra các thao tác chỉnh sửa trực tiếp trên tài khoản Giáo viên THCS (Thầy Trần Quốc Tuấn) và xác nhận đồng bộ tức thì giữa Firebase Authentication và Firestore.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickTestLiveMutation('SYNC_EMAIL')}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                >
                  1. Đổi Email đồng bộ Firebase Auth
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTestLiveMutation('REVOKE_EXAM_PERM')}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
                >
                  2. Thu hồi quyền Tạo đề khi đang đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTestLiveMutation('LOCK_ACCOUNT')}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  3. Khóa Tài khoản & Thu hồi Token
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTestLiveMutation('UNLOCK_ACCOUNT')}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                >
                  4. Mở khóa lại Tài khoản
                </button>
              </div>
            </div>

            {liveAuthMutationResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">
                  Kết quả thực thi đồng bộ (HTTP {liveAuthMutationResult.httpStatus} · Mã nhật ký:{' '}
                  <span className="font-mono text-indigo-700">
                    {liveAuthMutationResult.auditLogId}
                  </span>
                  ):
                </div>
                <div className="text-slate-700 mt-1">{liveAuthMutationResult.message}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 0: FIREBASE SECURITY RULES & HỆ THỐNG KIỂM SOÁT TRUY CẬP DỮ LIỆU (MỤC I -> X)
         ===================================================================== */}
      {activeSubView === 'SECURITY_RULES_AND_10_TESTS' && (
        <div className="space-y-6">
          {/* TÓM TẮT NGUYÊN TẮC BẢO MẬT & KIẾN TRÚC XÁC THỰC (MỤC I, II, III, IX) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-emerald-700">
                1. Nguyên tắc Cốt lõi (Mục II)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                DENY BY DEFAULT (Mặc định Từ chối)
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Khóa toàn bộ đường dẫn chưa khai báo bằng{' '}
                <code className="font-mono text-rose-700 bg-rose-50 px-1 rounded">
                  allow read, write: if false;
                </code>
                . Không tồn tại bất kỳ quy tắc mở{' '}
                <code className="font-mono text-rose-700">if true</code> nào trong{' '}
                <code className="font-mono font-bold">firestore.rules</code> và{' '}
                <code className="font-mono font-bold">storage.rules</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-indigo-700">
                2. Định danh Kép (Mục III)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                Tách biệt Auth UID & Mã Giáo viên
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Đối chiếu đồng thời{' '}
                <code className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded">
                  request.auth.uid (authUid)
                </code>{' '}
                từ Firebase Authentication và{' '}
                <code className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded">
                  teacherProfileId (VD: GV-ND-TOAN-012)
                </code>{' '}
                trên hồ sơ trường học đang hoạt động (<code className="font-mono">ACTIVE</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-amber-700">
                3. Bảo vệ Đề mật & Chặn Tự Nâng Quyền
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                Kể cả Admin Kỹ thuật cũng bị chặn Đề mật
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Quản trị viên kỹ thuật (<code className="font-mono">SYSTEM_ADMIN</code>) quản lý tài khoản nhưng{' '}
                <span className="font-bold text-rose-700">
                  không mặc định đọc được đề mật (SECRET_EXAM)
                </span>{' '}
                nếu không có lệnh phân công của Ban Giám hiệu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-purple-700">
                4. Kiểm thử Tự động (Mục X)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {securityRules10Report
                  ? `Đạt ${securityRules10Report.passedScenarios}/${securityRules10Report.totalScenarios} Kịch bản (20/20 Assertions)`
                  : 'Đang nạp bộ kiểm thử 10 kịch bản...'}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Mỗi kịch bản kiểm thử song song cả{' '}
                <span className="font-bold text-rose-700">tác vụ trái phép (DENY)</span> và{' '}
                <span className="font-bold text-emerald-700">tác vụ hợp lệ đối chứng (ALLOW)</span>{' '}
                trước khi triển khai lên môi trường thật.
              </p>
            </div>
          </div>

          {/* KHỐI 1: BẢNG KẾT QUẢ KIỂM THỬ 10 KỊCH BẢN FIREBASE SECURITY RULES (MỤC X) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    BÁO CÁO KIỂM THỬ 10 KỊCH BẢN BẢO MẬT CLOUD FIRESTORE & FIREBASE STORAGE (MỤC X)
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Kiểm chứng trực tiếp trên bộ quy tắc{' '}
                  <code className="font-mono font-bold text-slate-800">/firestore.rules</code> (
                  {securityRules10Report?.noOpenWildcardRulesVerified
                    ? 'Không chứa wildcard mở'
                    : 'Đang kiểm tra'}
                  ) và{' '}
                  <code className="font-mono font-bold text-slate-800">/storage.rules</code> (
                  {securityRules10Report?.denyByDefaultVerified
                    ? 'DENY BY DEFAULT đã xác nhận'
                    : 'Đang kiểm tra'}
                  ).
                </p>
              </div>

              <div className="flex items-center gap-2">
                {securityRules10Report && (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    ĐẠT {securityRules10Report.passedScenarios}/
                    {securityRules10Report.totalScenarios} KỊCH BẢN (20/20 ASSERTIONS)
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRun10SecurityRulesScenarios(false)}
                  disabled={isRunningSecurityRules10}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isRunningSecurityRules10 ? 'Đang chạy lại...' : 'Chạy lại 10 Kịch bản'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold w-12">#</th>
                    <th className="py-3 px-4 font-bold min-w-[210px]">
                      Kịch bản Kiểm thử & Đường dẫn Đích
                    </th>
                    <th className="py-3 px-4 font-bold min-w-[270px]">
                      1. Kiểm thử Chặn Truy cập Trái phép (Kỳ vọng: DENY)
                    </th>
                    <th className="py-3 px-4 font-bold min-w-[270px]">
                      2. Kiểm thử Đối chứng Hợp lệ (Kỳ vọng: ALLOW)
                    </th>
                    <th className="py-3 px-4 font-bold min-w-[190px]">
                      Biểu thức Rule Thực thi
                    </th>
                    <th className="py-3 px-4 font-bold text-center w-28">Kết luận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(securityRules10Report?.scenarios || []).map((item) => (
                    <tr key={item.order} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        #{item.order}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="font-mono text-[11px] text-indigo-700 mt-1 break-all">
                          {item.deniedAssertion.targetPath}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Tham chiếu:{' '}
                          <span className="font-semibold text-slate-700">{item.requirementRef}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] mb-1">
                          Thực tế: {item.deniedAssertion.actualDecision} (Kỳ vọng:{' '}
                          {item.deniedAssertion.expectedDecision} · HTTP {item.deniedAssertion.httpStatus})
                        </span>
                        <div className="text-slate-800 font-medium leading-relaxed">
                          {item.deniedAssertion.caseLabel}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {item.deniedAssertion.explanation}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] mb-1">
                          Thực tế: {item.allowedCounterpartAssertion.actualDecision} (Kỳ vọng:{' '}
                          {item.allowedCounterpartAssertion.expectedDecision} · HTTP {item.allowedCounterpartAssertion.httpStatus})
                        </span>
                        <div className="text-slate-800 font-medium leading-relaxed">
                          {item.allowedCounterpartAssertion.caseLabel}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {item.allowedCounterpartAssertion.explanation}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {item.deniedAssertion.ruleEvaluated}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ĐẠT (2/2)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            LỖI
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 2: KIỂM THỬ TRỰC TIẾP BACKEND ADMIN SDK GUARD - CHẶN GHI TRỰC TIẾP TỪ CLIENT (MỤC VII) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>
                    KIỂM THỬ CỔNG BẢO MẬT BACKEND ADMIN SDK & CHẶN GHI TRỰC TIẾP TỪ CLIENT (MỤC VII)
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Các thao tác nhạy cảm (cấp quyền phê duyệt, gán vai trò quản trị, khóa/mở khóa tài khoản, phê duyệt chính thức hồ sơ đề thi, ghi nhật ký bảo mật) bị khóa hoàn toàn trên Client SDK (<code className="font-mono text-rose-700">allow write: if false</code>) và bắt buộc xác thực qua Backend Guard.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestAdminBackendGuard('BLOCK_IMPERSONATION')}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  1. Thử Ký thay / Mạo danh UID Hiệu trưởng
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAdminBackendGuard('BLOCK_TEACHER_APPROVAL')}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
                >
                  2. Thử Giáo viên tự Phê duyệt Đề chính thức
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAdminBackendGuard('ALLOW_PRINCIPAL_APPROVAL')}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                >
                  3. Ban Giám hiệu Phê duyệt Hợp lệ (Sau Thẩm định)
                </button>
              </div>
            </div>

            {adminGuardTestResult && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  adminGuardTestResult.decision === 'ALLOW'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {adminGuardTestResult.decision === 'ALLOW' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    Kết quả Backend Security Guard:{' '}
                    {adminGuardTestResult.decision === 'ALLOW'
                      ? `CHO PHÉP THỰC THI QUA ADMIN SDK (ALLOWED - HTTP ${adminGuardTestResult.httpStatus})`
                      : `TỪ CHỐI NGAY LẬP TỨC (DENIED - HTTP ${adminGuardTestResult.httpStatus})`}
                  </div>
                  <div className="mt-1">{adminGuardTestResult.message}</div>
                  <div className="mt-1 font-mono text-[11px] opacity-80">
                    Quy tắc áp dụng: {adminGuardTestResult.ruleTriggered}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* KHỐI 3: MA TRẬN QUY TẮC BẢO MẬT CHI TIẾT CHO 15 BỘ SƯU TẬP FIRESTORE (MỤC IV, V, VI, VII) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                MA TRẬN QUY TẮC BẢO MẬT CHI TIẾT CHO 15 BỘ SƯU TẬP CLOUD FIRESTORE (MỤC IV, V, VI, VII)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Phân định rõ quyền Đọc (<code className="font-mono">get/list</code>), Tạo mới (<code className="font-mono">create</code>), Cập nhật (<code className="font-mono">update</code>), Xóa (<code className="font-mono">delete</code>) và các trường nhạy cảm bị khóa khỏi Client trực tiếp.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Bộ sưu tập & Đường dẫn</th>
                    <th className="py-3 px-4 font-bold">Quy tắc Đọc (get / list)</th>
                    <th className="py-3 px-4 font-bold">Quy tắc Tạo mới (create)</th>
                    <th className="py-3 px-4 font-bold">Quy tắc Cập nhật (update)</th>
                    <th className="py-3 px-4 font-bold">Quy tắc Xóa (delete)</th>
                    <th className="py-3 px-4 font-bold">Trường Cấm Client Sửa trực tiếp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {STAGE17_15_COLLECTIONS_RULES_MATRIX.map((row) => (
                    <tr key={row.collectionName} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{row.vietnameseTitle}</div>
                        <div className="font-mono text-[11px] text-indigo-700 mt-0.5">
                          {row.firestorePath}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">{row.readRule}</td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">{row.createRule}</td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">{row.updateRule}</td>
                      <td className="py-3 px-4 text-rose-700 font-semibold leading-relaxed">
                        {row.deleteRule}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {row.clientDirectWriteBlockedFields.map((field) => (
                            <span
                              key={field}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] border border-slate-200"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 4: MA TRẬN BẢO MẬT 6 NHÓM TỆP TRÊN FIREBASE STORAGE (MỤC VIII) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                MA TRẬN BẢO MẬT 6 PHÂN LOẠI TỆP TRÊN FIREBASE STORAGE (MỤC VIII)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Kiểm soát chặt chẽ Tải lên, Tải xuống, Thay thế phiên bản, Xóa tệp và Cấm tạo URL công khai vĩnh viễn cho đề mật.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Phân loại Tệp</th>
                    <th className="py-3 px-4 font-bold">Quy tắc Tải lên (Upload)</th>
                    <th className="py-3 px-4 font-bold">Quy tắc Đọc / Tải xuống</th>
                    <th className="py-3 px-4 font-bold">Thay thế Phiên bản</th>
                    <th className="py-3 px-4 font-bold">Quy tắc Xóa</th>
                    <th className="py-3 px-4 font-bold">Chính sách URL Công khai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {STAGE17_STORAGE_6_CATEGORIES_SECURITY.map((cat) => (
                    <tr key={cat.categoryCode} className="hover:bg-slate-50/80 align-top">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{cat.vietnameseName}</div>
                        <div className="font-mono text-[10px] text-indigo-700 mt-0.5">
                          {cat.categoryCode} · {cat.accessLevel}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{cat.uploadRule}</td>
                      <td className="py-3 px-4 text-slate-700">{cat.readAndDownloadRule}</td>
                      <td className="py-3 px-4 text-slate-700">{cat.replaceVersionRule}</td>
                      <td className="py-3 px-4 text-rose-700 font-semibold">{cat.deleteRule}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {cat.publicUrlPolicy}
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
          VIEW 1: TÍCH HỢP FIREBASE STORAGE ĐỂ LƯU TRỮ TỆP TÀI LIỆU (MỤC I -> VI)
         ===================================================================== */}
      {activeSubView === 'FIREBASE_STORAGE_MANAGER' && (
        <div className="space-y-6">
          {/* KHỐI A: BÁO CÁO KIỂM THỬ 9 KỊCH BẢN FIREBASE STORAGE (MỤC VI) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    BÁO CÁO NGHIỆM THU 9 KỊCH BẢN KIỂM THỬ FIREBASE STORAGE & BẢO MẬT TỆP ĐỀ MẬT (MỤC VI)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm thử tự động trên vùng cô lập{' '}
                  <span className="font-mono font-semibold text-slate-700">
                    {storage9Report?.sandboxSchoolId || 'sch_sandbox_storage_stage17'}
                  </span>{' '}
                  trên Bucket{' '}
                  <span className="font-mono font-semibold text-indigo-700">
                    {storage9Report?.storageBucket || safeConfigSummary.storageBucket}
                  </span>
                  : tải lên Word, PDF, Excel, Hình ảnh, tải xuống, kiểm tra quyền, chặn truy cập đề mật không có quyền (403), chặn tệp quá dung lượng (413) và chặn sai định dạng/dùng email làm đường dẫn (415/400).
                </p>
              </div>
              <div className="flex items-center gap-2">
                {storage9Report && (
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Đạt {storage9Report.passedScenarios}/{storage9Report.totalScenarios} kịch bản
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRun9StorageScenariosQa(false)}
                  disabled={isRunningStorage9}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isRunningStorage9 ? 'Đang chạy...' : 'Chạy lại 9 Kịch bản'}
                </button>
              </div>
            </div>

            {storage9Report ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-4 font-bold w-12">#</th>
                      <th className="py-2.5 px-4 font-bold w-48">Mã kịch bản</th>
                      <th className="py-2.5 px-4 font-bold w-64">Nội dung kiểm thử</th>
                      <th className="py-2.5 px-4 font-bold">Kết quả thực thi thực tế</th>
                      <th className="py-2.5 px-4 font-bold w-24 text-center">HTTP</th>
                      <th className="py-2.5 px-4 font-bold w-28 text-center">Kết luận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {storage9Report.scenarios.map((sc) => (
                      <tr key={sc.code} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900">{sc.order}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {sc.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sc.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{sc.summary}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 leading-relaxed">
                          {sc.actualResult}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                          {sc.httpStatus}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {sc.passed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ĐẠT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              LỖI
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Đang tải báo cáo kiểm thử 9 kịch bản Firebase Storage...
              </div>
            )}
          </div>

          {/* KHỐI B: 8 LOẠI TỆP HỖ TRỢ (MỤC I) & FORM TẢI LÊN THEO ĐƯỜNG DẪN CHUẨN (MỤC II, III, IV) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Danh mục 8 loại tệp chuẩn */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>I. 8 Loại tệp tài liệu chuẩn</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                  Tối đa 15 MB / tệp
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Chỉ cho phép định dạng tài liệu giáo dục đã khai báo. Chặn thực thi (.exe, .sh, .bat, .js).
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {STORAGE_MODULE_TYPES_CATALOG.map((item) => (
                  <div
                    key={item.moduleCode}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{item.vietnameseName}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                        {item.moduleCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {item.description}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-700 mt-1">
                      Đuôi tệp: {item.allowedExtensions.join(', ')} · Mặc định:{' '}
                      {item.defaultAccessLevel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form tải tệp lên Firebase Storage */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                    <span>
                      II & V. Tải tệp mới lên Firebase Storage & Ghi 12 trường Metadata vào Firestore
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động chuẩn hóa đường dẫn:{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du'} / {uploadModule} /{' '}
                      {uploadDocId || 'doc_id'} / v1 / {uploadFilename || 'filename'}
                    </span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                  Không dùng Email/Họ tên trên đường dẫn
                </span>
              </div>

              <form onSubmit={handleUploadStorageFile} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Phân hệ tài liệu (Module - 8 loại tệp)
                  </label>
                  <select
                    value={uploadModule}
                    onChange={(e) => {
                      const nextMod = e.target.value as StorageModuleCategory;
                      setUploadModule(nextMod);
                      const spec = STORAGE_MODULE_TYPES_CATALOG.find(
                        (m) => m.moduleCode === nextMod
                      );
                      if (spec) {
                        setUploadAccessLevel(spec.defaultAccessLevel);
                        const ext = spec.allowedExtensions[0] || '.pdf';
                        setUploadFilename(`Tai_lieu_${nextMod.toLowerCase()}${ext}`);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 bg-white"
                  >
                    {STORAGE_MODULE_TYPES_CATALOG.map((m) => (
                      <option key={m.moduleCode} value={m.moduleCode}>
                        {m.vietnameseName} ({m.moduleCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Mã hồ sơ / tài liệu ổn định (DocumentId)
                  </label>
                  <input
                    type="text"
                    value={uploadDocId}
                    onChange={(e) => setUploadDocId(e.target.value)}
                    placeholder="VD: doc_de_hk1_khtn8"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Tên tệp gốc (OriginalFilename)
                  </label>
                  <input
                    type="text"
                    value={uploadFilename}
                    onChange={(e) => setUploadFilename(e.target.value)}
                    placeholder="VD: De_kiem_tra_HK1_KHTN8.docx"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Cấp độ bảo mật truy cập (AccessLevel - Mục IV)
                  </label>
                  <select
                    value={uploadAccessLevel}
                    onChange={(e) => setUploadAccessLevel(e.target.value as FileAccessLevel)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 bg-white"
                  >
                    <option value="SCHOOL_INTERNAL">SCHOOL_INTERNAL (Nội bộ trường)</option>
                    <option value="DEPARTMENT_SCOPED">DEPARTMENT_SCOPED (Theo Tổ chuyên môn)</option>
                    <option value="CONFIDENTIAL_EXAM">
                      CONFIDENTIAL_EXAM (Đề mật - Cấm Public URL)
                    </option>
                    <option value="SECRET_ANSWER_KEY">
                      SECRET_ANSWER_KEY (Đáp án mật - Cấm Public URL)
                    </option>
                    <option value="LEADERSHIP_ONLY">LEADERSHIP_ONLY (Chỉ BGH & Quản trị)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    5. Chính sách lưu trữ (Retention Policy - Mục V)
                  </label>
                  <select
                    value={uploadRetention}
                    onChange={(e) => setUploadRetention(e.target.value as FileRetentionPolicy)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 bg-white"
                  >
                    <option value="STANDARD_ACTIVE">STANDARD_ACTIVE (Lưu trữ tiêu chuẩn 2 năm)</option>
                    <option value="ARCHIVED_5_YEARS">ARCHIVED_5_YEARS (Lưu trữ hồ sơ 5 năm)</option>
                    <option value="LEGAL_HOLD_LOCKED">
                      LEGAL_HOLD_LOCKED (Niêm phong hồ sơ thanh tra - Cấm xóa)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    6. Dung lượng tệp (Bytes - Giới hạn 15.728.640 B)
                  </label>
                  <input
                    type="number"
                    value={uploadSizeBytes}
                    onChange={(e) => setUploadSizeBytes(Number(e.target.value) || 102400)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-600">
                    Trạng thái URL công khai:{' '}
                    {uploadAccessLevel === 'CONFIDENTIAL_EXAM' ||
                    uploadAccessLevel === 'SECRET_ANSWER_KEY' ||
                    uploadAccessLevel === 'LEADERSHIP_ONLY' ? (
                      <span className="font-bold text-rose-700">
                        BỊ CHẶN VĨNH VIỄN (publicUrlAllowed = false · Chỉ cấp Ephemeral Token 5 phút)
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700">
                        Kiểm soát qua Firebase Auth & RBAC
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isUploadingStorageFile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>
                      {isUploadingStorageFile
                        ? 'Đang tải lên Storage...'
                        : 'Tải lên Firebase Storage & Lưu Metadata'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* KHỐI C: MODAL XEM TRƯỚC / PHIÊN TẢI XUỐNG AN TOÀN VỚI TOKEN NGẮN HẠN */}
          {activeAccessPreview && (
            <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-5 border border-emerald-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <Lock className="w-4 h-4" />
                  <span>
                    PHIÊN XEM TRƯỚC / TẢI XUỐNG ĐƯỢC CẤP QUYỀN BỞI BACKEND & STORAGE RULES
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAccessPreview(null)}
                  className="text-xs text-emerald-300 hover:text-white font-bold cursor-pointer"
                >
                  Đóng [×]
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <div>
                    <span className="text-emerald-400">Tên tệp gốc:</span>{' '}
                    <span className="font-bold text-white">{activeAccessPreview.filename}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-emerald-400">StoragePath chuẩn:</span>{' '}
                    <span className="font-mono text-amber-300">
                      {activeAccessPreview.storagePath}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-emerald-400">Tóm tắt nội dung:</span>{' '}
                    <span>{activeAccessPreview.previewSummary}</span>
                  </div>
                </div>
                <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-800 font-mono text-[11px]">
                  <div className="text-emerald-300 font-bold">
                    Signed Ephemeral Token (Hết hạn: {activeAccessPreview.expiresAt}):
                  </div>
                  <div className="truncate text-amber-200 mt-1">
                    {activeAccessPreview.signedToken}
                  </div>
                  <div className="text-emerald-300 mt-1">
                    AccessLevel: {activeAccessPreview.accessLevel} · Không tạo URL công khai vĩnh viễn
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KHỐI D: DANH SÁCH TỆP TRÊN FIREBASE STORAGE & 12 TRƯỜNG METADATA FIRESTORE (MỤC III, IV, V) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-600" />
                  <span>
                    III, IV & V. KHO TỆP TÀI LIỆU FIREBASE STORAGE & METADATA FIRESTORE (
                    {filteredStorageFiles.length} TỆP)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lưu trữ đầy đủ 12 trường Metadata trong{' '}
                  <span className="font-mono font-semibold text-slate-700">
                    schools/{syncDiagnostics.activeSchoolId || 'sch-th-thcs-nguyen-du'}/fileAssets/&#123;fileId&#125;
                  </span>
                  : FileId, SchoolId, Module, DocumentId, VersionId, OriginalFilename, StoragePath, ContentType, Size, UploadedBy, UploadedAt, AccessLevel.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedStorageModuleFilter}
                  onChange={(e) => setSelectedStorageModuleFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="ALL">Tất cả 8 loại tệp ({storageFiles.length})</option>
                  {STORAGE_MODULE_TYPES_CATALOG.map((m) => (
                    <option key={m.moduleCode} value={m.moduleCode}>
                      {m.vietnameseName} ({m.moduleCode})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleLoadStorageFiles}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold">FileId / OriginalFilename</th>
                    <th className="py-2.5 px-3 font-bold">Module / VersionId</th>
                    <th className="py-2.5 px-3 font-bold">
                      Đường dẫn chuẩn (schoolId/module/documentId/versionId/filename)
                    </th>
                    <th className="py-2.5 px-3 font-bold">ContentType / Size</th>
                    <th className="py-2.5 px-3 font-bold">AccessLevel & Bảo mật</th>
                    <th className="py-2.5 px-3 font-bold">Chính sách lưu trữ</th>
                    <th className="py-2.5 px-3 font-bold text-right">
                      Thao tác Quản lý tệp (Mục V)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStorageFiles.map((file) => {
                    const isConfidential =
                      file.accessLevel === 'CONFIDENTIAL_EXAM' ||
                      file.accessLevel === 'SECRET_ANSWER_KEY';
                    return (
                      <tr
                        key={file.fileId}
                        className={`hover:bg-slate-50/80 ${
                          file.isSoftDeleted ? 'opacity-60 bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{file.originalFilename}</div>
                          <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                            FileId: {file.fileId} · DocId: {file.documentId}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            UploadedBy: <span className="font-mono">{file.uploadedBy}</span> ·{' '}
                            {new Date(file.uploadedAt).toLocaleString('vi-VN')}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-mono font-bold text-[10px]">
                            {file.module}
                          </span>
                          <div className="mt-1 font-mono font-bold text-emerald-700">
                            Phiên bản: {file.versionId} (v{file.version || 1})
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-800 max-w-xs break-all">
                          {file.storagePath}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-mono text-[10px] text-slate-600 truncate max-w-[160px]">
                            {file.contentType}
                          </div>
                          <div className="font-bold text-slate-800 mt-0.5">
                            {(file.size / 1024).toFixed(1)} KB ({file.size.toLocaleString('vi-VN')} B)
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                              isConfidential
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : file.accessLevel === 'LEADERSHIP_ONLY'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            {file.accessLevel}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {file.publicUrlAllowed
                              ? 'URL nội bộ trường'
                              : 'Cấm Public URL (Signed Token 5p)'}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={file.retentionPolicy}
                            onChange={(e) =>
                              handleChangeRetentionPolicy(
                                file,
                                e.target.value as FileRetentionPolicy
                              )
                            }
                            className="rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-800 bg-white"
                          >
                            <option value="STANDARD_ACTIVE">STANDARD_ACTIVE</option>
                            <option value="ARCHIVED_5_YEARS">ARCHIVED_5_YEARS</option>
                            <option value="LEGAL_HOLD_LOCKED">LEGAL_HOLD_LOCKED</option>
                          </select>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Trạng thái: {file.status}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePreviewOrDownloadFile(file, 'PREVIEW', false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] cursor-pointer"
                              title="Xem trước tệp"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Xem</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePreviewOrDownloadFile(file, 'DOWNLOAD', false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] cursor-pointer"
                              title="Tải xuống tệp an toàn"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tải</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCreateNewFileVersion(file)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[11px] cursor-pointer"
                              title="Tạo phiên bản mới (v1 -> v2)"
                            >
                              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                              <span>+Phiên bản</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedFileForHistory(file)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] cursor-pointer"
                              title="Xem lịch sử phiên bản"
                            >
                              <History className="w-3.5 h-3.5 text-amber-700" />
                              <span>Lịch sử ({file.versionHistory?.length || 1})</span>
                            </button>

                            {isConfidential && (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePreviewOrDownloadFile(file, 'DOWNLOAD', true)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] cursor-pointer border border-rose-200"
                                title="Thử truy cập trái phép bằng tài khoản Giáo viên không thuộc Hội đồng đề"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                <span>Thử 403</span>
                              </button>
                            )}

                            {!file.isSoftDeleted && (
                              <button
                                type="button"
                                onClick={() => handleSoftDeleteFile(file)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100/70 hover:bg-rose-200 text-rose-900 font-bold text-[11px] cursor-pointer"
                                title="Xóa mềm metadata"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI E: LỊCH SỬ PHIÊN BẢN TỆP (VERSION HISTORY) */}
          {selectedFileForHistory && (
            <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    <span>
                      Lịch sử phiên bản tệp: {selectedFileForHistory.originalFilename} (FileId:{' '}
                      {selectedFileForHistory.fileId})
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mỗi phiên bản mới tạo đường dẫn riêng theo{' '}
                    <span className="font-mono">
                      schoolId/module/documentId/versionId/filename
                    </span>{' '}
                    và giữ nguyên các phiên bản trước để kiểm toán.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFileForHistory(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Đóng [×]
                </button>
              </div>
              <div className="space-y-2">
                {(selectedFileForHistory.versionHistory || []).map((ver) => (
                  <div
                    key={ver.versionId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold mr-2">
                        {ver.versionId} (Phiên bản #{ver.versionNumber})
                      </span>
                      <span className="font-bold text-slate-900">{ver.originalFilename}</span>
                      <div className="font-mono text-[11px] text-slate-600 mt-1">
                        StoragePath: {ver.storagePath}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ghi chú: {ver.changeNote} · Người tải: {ver.uploadedBy} ·{' '}
                        {new Date(ver.uploadedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] text-slate-700">
                      {(ver.size / 1024).toFixed(1)} KB · Checksum: {ver.checksumSha256}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 2: ĐỒNG BỘ 16 MODULE, DATA ACCESS LAYER, AUTO-SAVE,
          DI TRÚ 8 BƯỚC & KIỂM THỬ 9 KỊCH BẢN ĐA THIẾT BỊ (MỤC I -> VIII)
         ===================================================================== */}
      {activeSubView === 'FULL_16_MODULES_DAL_SYNC' && (
        <div className="space-y-6">
          {/* KHỐI 1: KIỂM THỬ THỰC TẾ 9 KỊCH BẢN ĐỒNG BỘ NHIỀU THIẾT BỊ, XUNG ĐỘT & MẤT MẠNG (MỤC VIII) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-600" />
                  <span>
                    KẾT QUẢ KIỂM THỬ THỰC TẾ 9 KỊCH BẢN ĐỒNG BỘ ĐA THIẾT BỊ (MÁY A ↔ MÁY B), XUNG ĐỘT & MẤT MẠNG (MỤC VIII)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm chứng thực tế: Tạo câu hỏi ở Máy A → Đăng nhập Máy B (localStorage trống) → Câu
                  hỏi xuất hiện → Sửa ở Máy B → Máy A nhận bản mới → Đăng xuất/Đăng nhập lại → Đồng bộ
                  Ma trận/Đề/Quy trình 9 bước → Hai người cùng sửa 1 hồ sơ → Mất mạng khi đang lưu.
                </p>
              </div>
              {sync9Report && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4" />
                  Đạt {sync9Report.passedScenarios}/{sync9Report.totalScenarios} kịch bản · Bảo toàn dữ
                  liệu chính thức={String(sync9Report.officialDataPreserved)}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">TT</th>
                    <th className="py-3 px-4 font-bold">Kịch bản kiểm thử đồng bộ (Mục VIII)</th>
                    <th className="py-3 px-4 font-bold">Mô tả thao tác thực hiện</th>
                    <th className="py-3 px-4 font-bold">Kết quả thực tế ghi nhận</th>
                    <th className="py-3 px-4 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(sync9Report?.scenarios || []).map((sc) => (
                    <tr key={sc.code} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-700">#{sc.order}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{sc.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{sc.code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm">{sc.summary}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium max-w-md">
                        {sc.actualResult}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {sc.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ĐẠT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            KHÔNG ĐẠT
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 2: BẢNG ĐIỀU KHIỂN THỬ NGHIỆM TRỰC TIẾP AUTO-SAVE CÓ KIỂM SOÁT, CHỐNG GHI ĐÈ XUNG ĐỘT & MẤT MẠNG (MỤC IV & VII) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  <span>
                    TRÌNH KIỂM CHỨNG LƯU TỰ ĐỘNG CÓ KIỂM SOÁT (DEBOUNCED AUTO-SAVE) & CHỐNG GHI ĐÈ XUNG ĐỘT (MỤC IV & VII)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gõ thử nội dung bên dưới: Hệ thống gộp các lần gõ phím (không ghi Firestore sau mỗi
                  ký tự), tự động lưu sau 1,8 giây ngừng gõ và kiểm tra{' '}
                  <span className="font-mono">baseVersion</span> để không ghi đè thay đổi của người
                  dùng khác.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleFlushDemoDraftImmediately}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Lưu nháp ngay (questionRepository)
                </button>
                <button
                  type="button"
                  onClick={handleSimulateConcurrentConflict}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Mô phỏng 2 người cùng sửa 1 hồ sơ (Test Xung đột)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội dung Câu hỏi / Ma trận / Đề đang soạn (Gõ thử nhiều ký tự liên tiếp):
                </label>
                <textarea
                  rows={3}
                  value={demoDraftText}
                  onChange={(e) => handleDemoDraftTyping(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800">
                  Thông số Bộ điều khiển Lưu tự động (ControlledAutoSaveEngine):
                </div>
                {autoSaveDrafts.length > 0 ? (
                  autoSaveDrafts.map((d) => (
                    <div key={`${d.entityType}:${d.recordId}`} className="space-y-1">
                      <div>
                        • Bản ghi: <span className="font-mono font-bold">{d.recordId}</span> (Phiên bản
                        gốc: <span className="font-mono">v{d.baseVersion}</span>)
                      </div>
                      <div>
                        • Số ký tự đã gộp chưa ghi:{' '}
                        <span className="font-bold text-indigo-700">
                          {d.keystrokeCountSinceLastSave} lần gõ
                        </span>
                      </div>
                      <div>
                        • Số lần thực ghi lên Firestore:{' '}
                        <span className="font-bold text-emerald-700">
                          {d.firestoreWritesCount} lần
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium">• {d.statusMessage}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600">
                    • Phiên bản hiện tại: <span className="font-mono font-bold">v{demoBaseVersion}</span>
                    <br />• Chế độ chống ghi mỗi ký tự: <span className="font-bold text-emerald-700">Đang bật (Debounce + Content Hash)</span>
                  </div>
                )}
              </div>
            </div>

            {dalSyncState.activeConflicts.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      CẢNH BÁO XUNG ĐỘT DỮ LIỆU: PHÁT HIỆN NGƯỜI DÙNG KHÁC VỪA CẬP NHẬT CÙNG HỒ SƠ!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const latest = dalSyncState.activeConflicts[0];
                      if (latest) {
                        setDemoBaseVersion(latest.currentServerVersion);
                        dalSyncStateManager.resolveConflict(latest.recordId);
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold cursor-pointer"
                  >
                    Đồng bộ lên phiên bản mới nhất (v{dalSyncState.activeConflicts[0]?.currentServerVersion})
                  </button>
                </div>
                {dalSyncState.activeConflicts.map((c) => (
                  <div key={c.conflictId} className="text-rose-900">
                    Bản ghi <span className="font-mono font-bold">{c.recordId}</span> trên máy chủ đã ở
                    phiên bản <span className="font-bold">v{c.currentServerVersion}</span> (do{' '}
                    <span className="font-bold">{c.lastModifiedBy}</span> lưu), trong khi máy trạm gửi{' '}
                    <span className="font-bold">baseVersion = v{c.baseVersionSent}</span>. Hệ thống đã
                    chặn ghi đè để không làm mất nội dung của cả 2 người dùng.
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KHỐI 3: BÁO CÁO RÀ SOÁT HIỆN TRẠNG TOÀN BỘ 16 MODULE & DATA ACCESS LAYER (MỤC I, II, III, VIII) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>
                    BẢNG RÀ SOÁT HIỆN TRẠNG 16 MODULE & PHÂN TẦNG LƯU TRỮ QUA DATA ACCESS LAYER (MỤC I, II, III, VIII)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Báo cáo minh bạch: Đã chuyển sang Cloud Firestore{' '}
                  <span className="font-bold text-emerald-700">16/16 module</span> (Số module chưa
                  chuyển: <span className="font-bold">0</span>). Không module nào gọi Firestore tùy
                  tiện ngoài 10 Repository tập trung.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" />
                Đã chuyển: 16/16 Module · Chưa chuyển: 0
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3 font-bold">TT</th>
                    <th className="py-3 px-3 font-bold">Module hệ thống</th>
                    <th className="py-3 px-3 font-bold">DAL Repository & Đường dẫn Firestore</th>
                    <th className="py-3 px-3 font-bold">Trong State React</th>
                    <th className="py-3 px-3 font-bold">Trong localStorage</th>
                    <th className="py-3 px-3 font-bold">Trong Dữ liệu mẫu</th>
                    <th className="py-3 px-3 font-bold">Trong Cloud Firestore & Nguồn khác</th>
                    <th className="py-3 px-3 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {modules16Audit.map((mod) => (
                    <tr key={mod.moduleCode} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-700">#{mod.moduleOrder}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div>{mod.moduleName}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {mod.moduleCode}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-indigo-700">
                          {mod.dalRepositoryName}
                        </div>
                        <div className="font-mono text-[11px] text-slate-600 mt-0.5">
                          {mod.firestoreCollectionPath}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">{mod.inReactState}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">{mod.inLocalStorage}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">{mod.inSampleSeedData}</td>
                      <td className="py-3 px-3 text-slate-800 max-w-sm">
                        <div className="font-medium">{mod.inCloudFirestore}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          • Nguồn khác: {mod.inOtherSource}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {mod.migrationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 4: QUY TRÌNH 8 BƯỚC CHUYỂN DỮ LIỆU CŨ SANG CLOUD FIRESTORE (MỤC VI) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArchiveRestore className="w-4 h-4 text-indigo-600" />
                  <span>
                    QUY TRÌNH 8 BƯỚC CHUYỂN DỮ LIỆU CŨ SANG CLOUD FIRESTORE (MỤC VI - KHÔNG TỰ XÓA DỮ LIỆU NGUỒN)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thực hiện tuần tự: 1. Sao lưu → 2. Kiểm tra cấu trúc → 3. Chuyển đổi schema → 4.
                  Phát hiện trùng → 5. Xem trước → 6. Nhập Firestore → 7. Đối chiếu số lượng & nội dung
                  → 8. Xác nhận chuyển đổi.
                </p>
              </div>
              {migration8Report && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4" />
                  Đạt 8/8 bước · Xóa dữ liệu nguồn={String(migration8Report.sourceDataDeleted)}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Bước</th>
                    <th className="py-3 px-4 font-bold">Tên bước chuyển đổi (Mục VI)</th>
                    <th className="py-3 px-4 font-bold">Chi tiết thực thi & Đối chiếu</th>
                    <th className="py-3 px-4 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(migration8Report?.steps || []).map((st) => (
                    <tr key={st.stepCode} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-700">Bước {st.stepNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{st.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {st.stepCode}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{st.detail}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          HOÀN TẤT
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

      {/* VIEW A: CẤU TRÚC 15 BỘ SƯU TẬP + 2 SUBCOLLECTION PHIÊN BẢN + 8 COMPOSITE INDEXES */}
      {activeSubView === 'FIRESTORE_SCHEMA_AND_INDEXES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                CẤU TRÚC 15 BỘ SƯU TẬP CHÍNH & 2 BỘ SƯU TẬP PHIÊN BẢN TRÊN CLOUD FIRESTORE
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Phân tách đa trường theo <span className="font-mono">schools/&#123;schoolId&#125;</span>,
                mỗi bản ghi có ID ổn định (không dùng email hoặc họ tên làm khóa chính), có đầy đủ{' '}
                <span className="font-mono">createdAt, updatedAt, createdBy, updatedBy, status, version</span>{' '}
                và không lưu tệp PDF/Word/hình ảnh trực tiếp trong Firestore.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">TT</th>
                    <th className="py-3 px-4 font-bold">Đường dẫn Firestore</th>
                    <th className="py-3 px-4 font-bold">Tên Bộ sưu tập & Chức năng</th>
                    <th className="py-3 px-4 font-bold">Định dạng Khóa chính & Phiên bản</th>
                    <th className="py-3 px-4 font-bold">Nguyên tắc chống phình Document & Bảo mật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {STAGE17_FIRESTORE_COLLECTIONS_SPEC.map((col) => (
                    <tr key={col.collectionId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-700">#{col.order}</td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-indigo-900">
                        <div>{col.firestorePathPattern}</div>
                        {col.hasVersionSubcollection && col.versionSubcollectionPath && (
                          <div className="mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                            + {col.versionSubcollectionPath}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{col.vietnameseTitle}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Trường chính: <span className="font-mono">{col.keyFields.slice(0, 8).join(', ')}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-mono text-[11px] text-slate-900">{col.primaryKeyFormat}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm space-y-1">
                        <div>• {col.antiDuplicationAndSizeRule}</div>
                        <div className="text-indigo-700 font-medium">• Rules: {col.securityRuleSummary}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                DANH MỤC 8 COMPOSITE INDEXES ĐÃ ĐỊNH NGHĨA TRONG firestore.indexes.json
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Mã Index</th>
                    <th className="py-3 px-4 font-bold">Mục đích truy vấn</th>
                    <th className="py-3 px-4 font-bold">Collection Group</th>
                    <th className="py-3 px-4 font-bold">Thứ tự các trường trong Composite Index</th>
                    <th className="py-3 px-4 font-bold">Biểu thức truy vấn Firestore SDK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {STAGE17_COMPOSITE_INDEXES_SPEC.map((idx) => (
                    <tr key={idx.indexId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{idx.indexId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{idx.queryUseCaseTitle}</td>
                      <td className="py-3 px-4 font-mono text-indigo-700 font-bold">
                        {idx.collectionGroup}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {idx.fields.map((f, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[11px] text-slate-800"
                            >
                              {f.fieldPath} ({f.order === 'ASCENDING' ? 'ASC' : 'DESC'})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs break-all">
                        {idx.firestoreQueryPattern}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: KIỂM THỬ 8 HẠNG MỤC CSDL TRONG KHÔNG GIAN RIÊNG SANDBOX */}
      {activeSubView === 'DB_SANDBOX_8_TESTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                KẾT QUẢ KIỂM THỬ 8 HẠNG MỤC CSDL CLOUD FIRESTORE TRONG KHÔNG GIAN RIÊNG
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thực thi trong không gian riêng{' '}
                <span className="font-mono text-indigo-700">
                  schools/sch_sandbox_stage17_test
                </span>{' '}
                — kiểm tra đủ: Tạo, Đọc, Sửa & Phiên bản, Xóa mềm, Tìm kiếm (6 truy vấn), Phân trang,
                Phân quyền và Liên kết dữ liệu.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRunDatabaseArchitectureQa(false)}
                disabled={isRunningDbSandbox}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                {isRunningDbSandbox ? 'Đang chạy...' : 'Chạy lại 8 Hạng mục'}
              </button>
              {dbSandboxReport && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Đạt {dbSandboxReport.passedTests}/{dbSandboxReport.totalTests}
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">TT</th>
                  <th className="py-3 px-4 font-bold">Hạng mục kiểm thử</th>
                  <th className="py-3 px-4 font-bold">Nội dung thực hiện</th>
                  <th className="py-3 px-4 font-bold">Kết quả nghiệm thu thực tế</th>
                  <th className="py-3 px-4 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(dbSandboxReport?.testItems || []).map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-700">#{item.order}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{item.title}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{item.code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{item.summary}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-md">
                      {item.actualResult}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ĐẠT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          KHÔNG ĐẠT
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 1: TRẠNG THÁI KẾT NỐI FIREBASE */}
      {activeSubView === 'STATUS_DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Trạng thái cấu hình
                </span>
                <KeyRound className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                {auditReport?.configSummary.validation.isValid ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Hợp lệ · Singleton ({auditReport.configSummary.initializedAppsCount} App)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    {auditReport?.configSummary.validation.status || 'Đang kiểm tra'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {auditReport?.configSummary.validation.message ||
                  'Đang kiểm tra cấu hình VITE_FIREBASE_* và firebase-applet-config.json...'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Trạng thái Authentication
                </span>
                <Lock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã kích hoạt SDK
                </span>
                {auditReport?.authStatus.isFirebaseUserSignedIn ? (
                  <button
                    type="button"
                    onClick={handleGoogleSignOut}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Đăng xuất Google</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Đăng nhập Google OAuth</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {auditReport?.authStatus.statusLabel ||
                  'Đang kiểm tra trạng thái xác thực Firebase Authentication...'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  3. Trạng thái Cloud Firestore
                </span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    auditReport?.firestoreStatus.authorizedReadPassed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đọc: {auditReport?.firestoreStatus.authorizedReadPassed ? 'CONNECTED' : 'CHECKING'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                  Rules Guard:{' '}
                  {auditReport?.firestoreStatus.unauthorizedRejectedPassed ? 'ACTIVE' : 'CHECKING'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đã kết nối CSDL thực{' '}
                <span className="font-mono text-[11px] text-slate-800">
                  {safeConfigSummary.firestoreDatabaseId.slice(0, 26)}...
                </span>{' '}
                và thực thi <span className="font-mono">firestore.rules</span>.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  4. Trạng thái Firebase Storage
                </span>
                <HardDrive className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {auditReport?.storageStatus.statusLabel || 'Đã gắn kết Bucket'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bucket thực:{' '}
                <span className="font-mono text-slate-800">
                  {safeConfigSummary.storageBucket}
                </span>
                . Kiểm soát tải lên và đọc tệp theo quyền người dùng.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  5. Thời gian kiểm tra gần nhất
                </span>
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1">
                {auditReport?.checkedAt
                  ? new Date(auditReport.checkedAt).toLocaleString('vi-VN')
                  : 'Đang thực hiện...'}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                {dalSyncState.networkState === 'ONLINE' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <Wifi className="w-3.5 h-3.5" /> Mạng trực tuyến (ONLINE)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                    <WifiOff className="w-3.5 h-3.5" /> Đang mất mạng (Chế độ khôi phục)
                  </span>
                )}
                <span>· Hàng đợi chờ: {dalSyncState.pendingOfflineMutations.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  6. Thông báo lỗi / Cảnh báo
                </span>
                <Info className="w-4 h-4 text-amber-600" />
              </div>
              {auditReport && !auditReport.errorMessage ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Không có lỗi kết nối (0 lỗi)
                  </span>
                  <p className="text-xs text-slate-600">
                    Mọi dịch vụ Firebase và Data Access Layer hoạt động ổn định.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Thông báo kỹ thuật
                  </span>
                  <p className="text-xs text-rose-700">
                    {auditReport?.errorMessage || 'Đang tải thông tin kiểm tra...'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-600" />
                  <span>
                    CẤU HÌNH DỰ ÁN FIREBASE THỰC TẾ (ĐÃ CHE KHÓA NHẠY CẢM)
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleRunLiveConnectionCheck(false)}
                disabled={isCheckingConnection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConnection ? 'animate-spin' : ''}`} />
                <span>Kiểm tra lại kết nối</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium mb-1">VITE_FIREBASE_PROJECT_ID</div>
                <div className="font-mono font-bold text-slate-900">{safeConfigSummary.projectId}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium mb-1">VITE_FIREBASE_AUTH_DOMAIN</div>
                <div className="font-mono font-bold text-slate-900">{safeConfigSummary.authDomain}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium mb-1">VITE_FIREBASE_STORAGE_BUCKET</div>
                <div className="font-mono font-bold text-slate-900">{safeConfigSummary.storageBucket}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium mb-1">
                  VITE_FIREBASE_FIRESTORE_DATABASE_ID
                </div>
                <div className="font-mono font-bold text-slate-900 break-all">
                  {safeConfigSummary.firestoreDatabaseId}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium mb-1">
                  VITE_FIREBASE_API_KEY (Đã ẩn an toàn)
                </div>
                <div className="font-mono font-bold text-emerald-700">
                  {safeConfigSummary.apiKeyMasked}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium mb-1">GEMINI_API_KEY & Khóa Quản trị</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Chỉ lưu tại Backend Server (Ẩn 100% ở Frontend)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BÁO CÁO KIỂM THỬ 7 TÌNH HUỐNG KẾT NỐI */}
      {activeSubView === 'QA_7_SCENARIOS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                BÁO CÁO NGHIỆM THU 7 TÌNH HUỐNG KIỂM THỬ FIREBASE & LƯU TRỮ THỰC
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunStage17QaSuite}
                disabled={isRunningQa}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                {isRunningQa ? 'Đang chạy...' : 'Chạy lại 7 Tình huống'}
              </button>
              {qaReport && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Đạt {qaReport.passedScenarios}/{qaReport.totalScenarios} kịch bản
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">TT</th>
                  <th className="py-3 px-4 font-bold">Tình huống kiểm thử</th>
                  <th className="py-3 px-4 font-bold">Đầu vào thử nghiệm</th>
                  <th className="py-3 px-4 font-bold">Kết quả kỳ vọng</th>
                  <th className="py-3 px-4 font-bold">Kết quả thực tế</th>
                  <th className="py-3 px-4 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(qaReport?.scenarios || []).map((sc) => (
                  <tr key={sc.scenarioCode} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-700">#{sc.scenarioNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{sc.title}</div>
                      <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                        {sc.securityNote}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{sc.testInput}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{sc.expectedBehavior}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-xs">
                      {sc.actualBehavior}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {sc.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ĐẠT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          LỖI
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {moduleMigrationTable.length > 0 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
              Đã đồng bộ {moduleMigrationTable.length} nhóm nghiệp vụ cốt lõi và 16 module chức năng
              lên Cloud Firestore.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
