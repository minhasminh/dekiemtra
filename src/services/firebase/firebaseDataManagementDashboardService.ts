export type ConnectionHealthStateCode =
  | 'CONNECTED_VERIFIED' // Đã kết nối và kiểm chứng
  | 'CONFIGURED' // Đã cấu hình
  | 'PERMISSION_DENIED' // Không có quyền
  | 'DISCONNECTED' // Mất kết nối
  | 'UNCHECKED'; // Chưa kiểm tra

export interface ServiceConnectionStatusItem {
  serviceKey: 'FIREBASE_PROJECT' | 'AUTHENTICATION' | 'FIRESTORE' | 'STORAGE' | 'BACKEND_FUNCTIONS';
  serviceName: string;
  endpointOrResourceId: string;
  stateCode: ConnectionHealthStateCode;
  stateLabel: string;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  verificationDetail: string;
  secretRedactedGuarantee: boolean;
}

export interface ConnectionOverviewData {
  projectDisplayName: string;
  projectId: string;
  firestoreDatabaseId: string;
  storageBucketName: string;
  schoolId: string;
  lastCheckedAt: string | null;
  overallStateCode: ConnectionHealthStateCode;
  overallStateLabel: string;
  secretKeysExposedInPayload: boolean;
  services: ServiceConnectionStatusItem[];
}

export interface DataStatisticCounterItem {
  order: number;
  counterCode:
    | 'USERS'
    | 'DEPARTMENTS'
    | 'TEACHING_ASSIGNMENTS'
    | 'QUESTIONS'
    | 'MATRICES'
    | 'SPECIFICATIONS'
    | 'EXAMS'
    | 'AI_REVIEWS'
    | 'APPRAISAL_DOSSIERS'
    | 'APPROVAL_DOSSIERS'
    | 'EXAM_RESULTS';
  label: string;
  firestoreCollectionPath: string;
  totalActiveCount: number;
  approvedOrLockedCount: number;
  draftOrPendingCount: number;
  softDeletedCount: number;
  sourceType: 'FIRESTORE_LIVE_QUERY_AND_AGGREGATION';
  sha256IntegrityDigest: string;
  lastAggregatedAt: string;
}

export interface SanitizedSyncLogRecord {
  logId: string;
  timestamp: string;
  schoolId: string;
  moduleName: string;
  operationType:
    | 'CREATE'
    | 'UPDATE'
    | 'SOFT_DELETE'
    | 'READ_VERIFY'
    | 'BACKUP_SNAPSHOT'
    | 'RESTORE_STAGING'
    | 'INTEGRITY_CHECK'
    | 'AUTH_RBAC_GUARD';
  actorId: string;
  actorName: string;
  actorRole: string;
  status: 'SUCCESS' | 'FAILED' | 'DENIED_RBAC' | 'OFFLINE_QUEUED';
  errorCode: string | null;
  relatedRecordId: string;
  summaryMessage: string;
  sensitiveFieldsRedacted: boolean;
}

export type DataIntegrityRuleCode =
  | 'RULE_01_MISSING_FOREIGN_LINK'
  | 'RULE_02_MISSING_SCHOOL_ID'
  | 'RULE_03_QUESTION_MISSING_SUBJECT_OR_GRADE'
  | 'RULE_04_MATRIX_WITHOUT_SPECIFICATION'
  | 'RULE_05_EXAM_REF_NONEXISTENT_QUESTION'
  | 'RULE_06_APPROVAL_REF_WRONG_VERSION'
  | 'RULE_07_STORAGE_FILE_MISSING_METADATA'
  | 'RULE_08_METADATA_REF_NONEXISTENT_STORAGE_FILE';

export interface DataIntegrityFindingItem {
  findingId: string;
  ruleCode: DataIntegrityRuleCode;
  collectionOrPath: string;
  recordId: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  issueDescription: string;
  recommendedAction: string;
}

export interface DataIntegrityCheckRuleResult {
  order: number;
  ruleCode: DataIntegrityRuleCode;
  ruleTitle: string;
  targetScope: string;
  totalScanned: number;
  anomaliesCount: number;
  status: 'CLEAN' | 'ANOMALY_DETECTED';
  readOnlyGuaranteed: boolean;
  findings: DataIntegrityFindingItem[];
}

export interface DataIntegrityInspectionReport {
  inspectionId: string;
  executedAt: string;
  schoolId: string;
  mode: 'PRODUCTION_READ_ONLY' | 'FAULT_INJECTION_SANDBOX_READ_ONLY';
  readOnlyEnforced: boolean;
  recordsModifiedOrDeletedCount: number;
  totalRulesChecked: number;
  totalRecordsScanned: number;
  totalAnomaliesFound: number;
  ruleResults: DataIntegrityCheckRuleResult[];
}

export interface VerifiedBackupSummary {
  hasVerifiedBackup: boolean;
  statusBannerLabel:
    | 'Đã sao lưu và xác minh toàn vẹn'
    | 'Chưa có bản sao lưu được xác minh'
    | 'Bản sao lưu lỗi xác minh';
  lastBackupSnapshotId: string | null;
  lastBackupAt: string | null;
  backupTypeLabel: string;
  backupStatusCode: 'VERIFIED_READY' | 'UNVERIFIED' | 'FAILED' | 'NONE';
  scopeSummary: string;
  totalFirestoreDocs: number;
  totalStorageFiles: number;
  totalStorageBytes: number;
  sha256Checksum: string | null;
  verificationCheckResult: string;
  recentSnapshots: Array<{
    snapshotId: string;
    createdAt: string;
    triggerType: string;
    createdBy: string;
    totalDocs: number;
    totalFiles: number;
    sha256Checksum: string;
    verified: boolean;
    stagingRestored: boolean;
  }>;
}

export interface DashboardTestScenarioResult {
  order: number;
  scenarioCode:
    | 'TEST_01_FIREBASE_ACTIVE'
    | 'TEST_02_NETWORK_DISCONNECTED'
    | 'TEST_03_PERMISSION_DENIED'
    | 'TEST_04_STATISTICS_ACCURACY'
    | 'TEST_05_MISSING_LINK_DETECTION'
    | 'TEST_06_PAGE_ACCESS_RBAC'
    | 'TEST_07_SYNC_LOG_SANITIZATION';
  scenarioTitle: string;
  passed: boolean;
  httpStatusObserved: number;
  stateObserved: string;
  technicalEvidence: string;
}

export interface DashboardVerificationSuiteReport {
  suiteRunId: string;
  executedAt: string;
  schoolId: string;
  overallPassed: boolean;
  passedCount: number;
  totalScenarios: number;
  results: DashboardTestScenarioResult[];
}

export interface FirebaseDataManagementDashboardPayload {
  ok: boolean;
  authorizedActor: {
    actorId: string;
    actorName: string;
    actorRole: string;
    schoolId: string;
    hasDataManagementPermission: boolean;
  };
  connectionOverview: ConnectionOverviewData;
  dataStatistics: DataStatisticCounterItem[];
  syncLogs: SanitizedSyncLogRecord[];
  backupSummary: VerifiedBackupSummary;
  latestInspectionReport: DataIntegrityInspectionReport;
}

export async function fetchFirebaseDataManagementDashboardService(params: {
  schoolId?: string;
  actorId?: string;
  actorRole?: string;
  simulateConnectionMode?: ConnectionHealthStateCode;
}): Promise<FirebaseDataManagementDashboardPayload> {
  const query = new URLSearchParams();
  if (params.schoolId) query.set('schoolId', params.schoolId);
  if (params.simulateConnectionMode) {
    query.set('simulateConnectionMode', params.simulateConnectionMode);
  }

  const response = await fetch(`/api/firebase/data-management/overview?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-actor-id': params.actorId || 'user-admin-sys',
      'x-actor-role': params.actorRole || 'SYSTEM_ADMIN',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(
      data.message || `Không có quyền truy cập Trung tâm Quản lý Dữ liệu Firebase (HTTP ${response.status}).`
    ) as Error & { status?: number; code?: string };
    err.status = response.status;
    err.code = data.code;
    throw err;
  }

  return data as FirebaseDataManagementDashboardPayload;
}

export async function runDataIntegrityInspectionService(params: {
  schoolId?: string;
  actorId?: string;
  actorRole?: string;
  injectFaultSimulation?: boolean;
}): Promise<DataIntegrityInspectionReport> {
  const response = await fetch('/api/firebase/data-management/inspect-integrity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-actor-id': params.actorId || 'user-admin-sys',
      'x-actor-role': params.actorRole || 'SYSTEM_ADMIN',
    },
    body: JSON.stringify({
      schoolId: params.schoolId || 'sch-th-thcs-nguyen-du',
      injectFaultSimulation: Boolean(params.injectFaultSimulation),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Lỗi kiểm tra dữ liệu (HTTP ${response.status}).`);
  }
  return data.report as DataIntegrityInspectionReport;
}

export async function triggerVerifiedDashboardBackupService(params: {
  schoolId?: string;
  actorId?: string;
  actorRole?: string;
  actorName?: string;
  backupType?: 'MANUAL_ADMIN_BACKUP' | 'PRE_MIGRATION_AUTO_BACKUP';
  verifyInStagingImmediately?: boolean;
}): Promise<{
  ok: boolean;
  backupSummary: VerifiedBackupSummary;
  message: string;
}> {
  const response = await fetch('/api/firebase/data-management/trigger-verified-backup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-actor-id': params.actorId || 'user-admin-sys',
      'x-actor-role': params.actorRole || 'SYSTEM_ADMIN',
    },
    body: JSON.stringify({
      schoolId: params.schoolId || 'sch-th-thcs-nguyen-du',
      actorName: params.actorName || 'Quản trị hệ thống',
      backupType: params.backupType || 'MANUAL_ADMIN_BACKUP',
      verifyInStagingImmediately: params.verifyInStagingImmediately !== false,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Lỗi thực thi sao lưu (HTTP ${response.status}).`);
  }
  return data;
}

export async function runDashboardVerificationSuiteService(params: {
  schoolId?: string;
  actorId?: string;
  actorRole?: string;
}): Promise<DashboardVerificationSuiteReport> {
  const response = await fetch('/api/firebase/data-management/run-verification-suite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-actor-id': params.actorId || 'user-admin-sys',
      'x-actor-role': params.actorRole || 'SYSTEM_ADMIN',
    },
    body: JSON.stringify({
      schoolId: params.schoolId || 'sch-th-thcs-nguyen-du',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Lỗi chạy bộ kiểm thử (HTTP ${response.status}).`);
  }
  return data.suiteReport as DashboardVerificationSuiteReport;
}

export interface Stage17FinalQaLeadAcceptanceReport {
  runId: string;
  executedAt: string;
  schoolId: string;
  architectureCheck: {
    firebaseAuthActive: boolean;
    firestoreRealPersistence: boolean;
    firebaseStorageActive: boolean;
    backendPrivilegedGuardActive: boolean;
    securityRulesDeployedAndTested: boolean;
    frontendFilesScanned: number;
    zeroSecretApiKeysInFrontend: boolean;
    zeroServiceAccountPrivateKeysInRepo: boolean;
  };
  data12CrudResults: Array<{
    order: number;
    groupCode: string;
    vietnameseName: string;
    firestorePath: string;
    createOk: boolean;
    readOk: boolean;
    updateVersionOk: boolean;
    activeCount: number;
    passed: boolean;
  }>;
  workflow9StepsVerified: boolean;
  performanceBenchmarksMs: {
    loginLatencyMs: number;
    loadQuestionBankLatencyMs: number;
    saveQuestionLatencyMs: number;
    openMatrixLatencyMs: number;
    generateExamLatencyMs: number;
    exportDossierLatencyMs: number;
  };
  testMatrixRows: Array<{
    testCode: string;
    moduleName: string;
    operation: string;
    expectedResult: string;
    actualResult: string;
    status: 'ĐẠT' | 'KHÔNG ĐẠT' | 'CHƯA KIỂM THỬ';
    errorFound: string;
    remediationPlan: string;
  }>;
  conditions9Checklist: Array<{
    conditionNumber: number;
    title: string;
    verified: boolean;
  }>;
  readyForPilotDeploymentProposal: boolean;
}

export async function runStage17FinalQaLeadAcceptanceService(
  schoolId = 'sch-th-thcs-nguyen-du'
): Promise<Stage17FinalQaLeadAcceptanceReport> {
  const response = await fetch('/api/firebase/stage17-final-qa-lead/run-complete-acceptance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schoolId }),
  });
  if (!response.ok) {
    throw new Error(`Lỗi chạy nghiệm thu tổng thể Giai đoạn 17 (HTTP ${response.status}).`);
  }
  const data = await response.json();
  return data.report as Stage17FinalQaLeadAcceptanceReport;
}

