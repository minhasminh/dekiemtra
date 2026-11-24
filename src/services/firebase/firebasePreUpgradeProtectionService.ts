export interface CurrentState10AuditItem {
  order: number;
  categoryCode: string;
  categoryTitle: string;
  currentStatusLabel: string;
  findingsSummary: string;
  technicalEvidence: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'NONE';
  verified: boolean;
}

export interface DependencyMap12RelationItem {
  order: number;
  relationCode: string;
  relationTitle: string;
  sourceCollection: string;
  sourceKeyField: string;
  targetCollection: string;
  targetForeignKeyField: string;
  cardinality: '1:1' | '1:N' | 'M:N';
  activeLinksCount: number;
  orphanRecordsCount: number;
  deletionOrKeyChangeBlocked: boolean;
  integrityVerified: boolean;
}

export interface SchemaChangeProposalItem {
  schemaVersionCode: string;
  changeTitle: string;
  changeDescription: string;
  affectedCollections: string[];
  addedFields: string[];
  modifiedFields: string[];
  removedFields: string[];
  legacyDataImpact: string;
  securityRulesImpact: string;
  queryImpact: string;
  migrationPlan: string;
  rollbackPlan: string;
  isBackwardCompatible: boolean;
  requiresUserConfirmationForDestructiveChange: boolean;
}

export interface PostUpgrade10VerificationItem {
  order: number;
  checkCode: string;
  checkTitle: string;
  beforeUpgradeValue: string;
  afterUpgradeStagingValue: string;
  matchedAndIntact: boolean;
  evidenceDetail: string;
}

export interface PreUpgradeProtectionFullReport {
  runId: string;
  executedAt: string;
  schoolId: string;
  currentSchemaVersion: string;
  targetSchemaVersion: string;
  // I. Kiểm tra hiện trạng 10 hạng mục
  currentState10Audit: CurrentState10AuditItem[];
  // II. Bản đồ phụ thuộc 12 quan hệ
  dependencyMap12Relations: DependencyMap12RelationItem[];
  // III. Sao lưu trước khi thay đổi
  preUpgradeBackupSummary: {
    snapshotId: string;
    createdAt: string;
    schemaVersionTag: string;
    totalFirestoreDocsBackedUp: number;
    totalStorageFilesBackedUp: number;
    overallSha256Checksum: string;
    restoreStagingNamespace: string;
    backupVerifiedReady: boolean;
  };
  // IV. Quản lý thay đổi Schema
  schemaChangeRegistry: SchemaChangeProposalItem[];
  // V. 6 Nguyên tắc Migration
  migrationPrinciplesCompliance: {
    backwardCompatibleOnly: boolean;
    originalDataPreservedAfterMigration: boolean;
    approvedRecordsNeverOverwritten: boolean;
    entityIdsNeverChanged: boolean;
    crossSchoolTransferBlocked: boolean;
    testedInIsolatedStagingFirst: boolean;
  };
  // VI. Kiểm tra 10 hạng mục sau nâng cấp (trên Staging Sandbox)
  postUpgrade10Checks: PostUpgrade10VerificationItem[];
  // VII. Báo cáo Trước khi sửa & Sau khi nâng cấp thử nghiệm
  preModificationReport: {
    partsToChange: string[];
    partsPreservedUnchanged: string[];
    dataLossRisksIdentified: string[];
    protectionMeasuresApplied: string[];
    testingPlanSummary: string[];
  };
  postModificationReport: {
    modifiedSourceFiles: string[];
    modifiedSchemasSummary: string[];
    migratedDataSummary: string;
    reconciliationResultSummary: string;
    detectedErrorsCount: number;
    detectedErrorsDetail: string;
    rollbackCapabilityStatus: string;
    destructiveChangesExecuted: boolean;
  };
}

export async function runPreUpgradeProtectionGuardService(
  schoolId = 'sch-th-thcs-nguyen-du'
): Promise<PreUpgradeProtectionFullReport> {
  const response = await fetch('/api/firebase/pre-upgrade-protection/run-full-guard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schoolId }),
  });

  if (!response.ok) {
    throw new Error(
      `Lỗi khi thực thi quy trình Kiểm tra & Bảo vệ Dữ liệu trước nâng cấp (HTTP ${response.status}).`
    );
  }

  const data = await response.json();
  return data.report as PreUpgradeProtectionFullReport;
}
