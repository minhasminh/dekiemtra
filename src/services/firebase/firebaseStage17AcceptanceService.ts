import { db } from './firebaseClient';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export type AcceptanceVerdictStatus = 'DAT' | 'KHONG_DAT' | 'CHUA_KIEM_THU';

export interface Stage17ConnectionCheckItem {
  componentCode:
    | 'FIREBASE_APP'
    | 'FIREBASE_AUTH'
    | 'CLOUD_FIRESTORE'
    | 'FIREBASE_STORAGE'
    | 'BACKEND_CLOUD_FUNCTIONS';
  componentName: string;
  targetResource: string;
  connected: boolean;
  latencyMs: number;
  evidenceSummary: string;
  status: AcceptanceVerdictStatus;
}

export interface Stage17Storage12PersistenceItem {
  order: number;
  groupCode: string;
  vietnameseName: string;
  collectionPath: string;
  createdRecordId: string;
  persistedBeforeLogout: boolean;
  verifiedAfterRelogin: boolean;
  sha256HashBeforeLogout: string;
  sha256HashAfterRelogin: string;
  hashMatched: boolean;
  sampleSummary: string;
}

export interface Stage17MultiDeviceSyncStep {
  stepOrder: number;
  deviceCode: 'DEVICE_A_DESKTOP' | 'DEVICE_B_LAPTOP';
  actionTitle: string;
  documentPath: string;
  versionBefore: number;
  versionAfter: number;
  payloadSnapshot: string;
  latencyMs: number;
  passed: boolean;
}

export interface Stage17OfflineSyncItem {
  operationCode:
    | 'OFFLINE_CREATE_QUESTION'
    | 'OFFLINE_SAVE_MATRIX'
    | 'OFFLINE_SUBMIT_REVIEW'
    | 'OFFLINE_APPROVE_EXAM';
  operationTitle: string;
  documentPath: string;
  whileOfflineState: 'PENDING_LOCAL_QUEUE';
  whileOfflineBadgeLabel: string;
  localQueueTimestamp: string;
  afterReconnectState: 'COMMITTED_ON_SERVER';
  afterReconnectBadgeLabel: string;
  serverCommitTimestamp: string;
  distinguishedPendingVsServer: boolean;
  passed: boolean;
}

export interface Stage17PerformanceBenchmarkRow {
  datasetCode:
    | 'BENCH_100_USERS'
    | 'BENCH_1000_QUESTIONS'
    | 'BENCH_10000_QUESTIONS'
    | 'BENCH_1000_EXAMS';
  datasetLabel: string;
  recordCountGenerated: number;
  seedCreationTimeMs: number;
  unindexedFullScanTimeMs: number;
  indexedPaginatedQueryTimeMs: number;
  pageSizeReturned: number;
  compositeIndexUsed: string;
  estimatedWritesCount: number;
  estimatedReadsFullScan: number;
  estimatedReadsPaginated: number;
  estimatedWriteCostUsd: number;
  estimatedReadCostFullScanUsd: number;
  estimatedReadCostPaginatedUsd: number;
  costReductionPercent: number;
  passed: boolean;
}

export interface Stage17AcceptanceReportRow {
  testCode: string;
  sectionRef: string;
  moduleName: string;
  operation: string;
  expectedResult: string;
  actualResult: string;
  status: AcceptanceVerdictStatus;
  detectedIssue: string;
  remediationPlan: string;
}

export interface Stage17MasterAcceptanceReport {
  acceptanceRunId: string;
  executedAt: string;
  projectId: string;
  databaseId: string;
  storageBucket: string;
  schoolId: string;
  // I. Kiểm tra kết nối
  connectionChecks: Stage17ConnectionCheckItem[];
  // II. Kiểm tra lưu trữ 12 nhóm + Đăng xuất & Đăng nhập lại
  storage12Items: Stage17Storage12PersistenceItem[];
  logoutReloginSessionCheck: {
    loggedOutAt: string;
    reloggedInAt: string;
    authUidVerified: string;
    all12GroupsIntactAfterRelogin: boolean;
  };
  // III. Kiểm tra đa thiết bị (Máy A <-> Máy B)
  multiDeviceSteps: Stage17MultiDeviceSyncStep[];
  // IV. Kiểm tra phân quyền (6 kịch bản cốt lõi)
  rbacVerificationSummary: {
    totalChecked: number;
    passedCount: number;
    allPassed: boolean;
  };
  // V. Kiểm tra tính toàn vẹn (6 tiêu chí)
  integrityCheckSummary: {
    noDataLoss: boolean;
    noDuplicateRecords: boolean;
    noOverwriteApprovedVersion: boolean;
    noBrokenForeignKeys: boolean;
    exactTotalExamScore10: boolean;
    noLostHistoryOrAuditLogs: boolean;
    verifiedExamTotalPoints: number;
  };
  // VI. Kiểm tra mất mạng & Đồng bộ lại
  offlineQueueTests: Stage17OfflineSyncItem[];
  // VII. Kiểm tra Firebase Security Rules (Emulator / AST Engine)
  securityRulesAuditSummary: {
    totalRulesScenarios: number;
    passedRulesScenarios: number;
    allowCasesVerified: number;
    denyCasesVerified: number;
  };
  // VIII. Kiểm tra Sao lưu & Khôi phục Staging
  backupRestoreAuditSummary: {
    snapshotId: string;
    stagingNamespace: string;
    reconciled12CollectionsMatch: boolean;
    storageFilesVerifiedCount: number;
    productionOverwritten: boolean;
  };
  // IX. Kiểm tra hiệu năng thực tế (100 TK, 1.000 CH, 10.000 CH, 1.000 Đề)
  performanceBenchmarks: Stage17PerformanceBenchmarkRow[];
  // X. Bảng báo cáo nghiệm thu tổng thể
  acceptanceTable: Stage17AcceptanceReportRow[];
  summaryCounts: {
    totalTests: number;
    passedCount: number;
    failedCount: number;
    untestedNeedsCloudInfraCount: number;
  };
  finalConclusion: {
    firebaseConnectedReal: boolean;
    durablePersistenceVerified: boolean;
    backendRbacVerified: boolean;
    securityRulesSafe: boolean;
    zeroCriticalBugs: boolean;
    backupRestoreTested: boolean;
    overallStage17Accepted: boolean;
    verdictStatement: string;
  };
}

export async function runStage17MasterAcceptanceService(
  schoolId = 'sch-th-thcs-nguyen-du'
): Promise<Stage17MasterAcceptanceReport> {
  // 1. Thực hiện kiểm tra vòng lặp đọc/ghi thực tế trên Cloud Firestore SDK từ trình duyệt (nếu trực tuyến)
  let clientFirestoreRoundtripMs = 0;
  let clientFirestoreVerified = false;
  const startClient = performance.now();
  try {
    if (db) {
      const probeRef = doc(
        db,
        'schools',
        schoolId,
        'auditLogs',
        'stage17_final_acceptance_probe'
      );
      await setDoc(
        probeRef,
        {
          probeId: 'stage17_final_acceptance_probe',
          schoolId,
          verifiedBy: 'STAGE17_MASTER_ACCEPTANCE_RUNNER',
          updatedAt: new Date().toISOString(),
          serverTime: serverTimestamp(),
        },
        { merge: true }
      );
      const snap = await getDoc(probeRef);
      clientFirestoreVerified = snap.exists();
      clientFirestoreRoundtripMs = Math.round(performance.now() - startClient);
    }
  } catch {
    clientFirestoreRoundtripMs = Math.round(performance.now() - startClient);
  }

  // 2. Gọi Backend thực thi toàn bộ 9 hạng mục kiểm thử tích hợp & đo hiệu năng thực tế (100 TK, 1.000 CH, 10.000 CH, 1.000 Đề)
  const response = await fetch('/api/firebase/stage17-acceptance/run-full-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schoolId,
      clientFirestoreVerified,
      clientFirestoreRoundtripMs,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lỗi khi chạy nghiệm thu Giai đoạn 17 (HTTP ${response.status}).`);
  }

  const data = await response.json();
  return data.report as Stage17MasterAcceptanceReport;
}
