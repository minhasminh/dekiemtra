export type AutosaveScopeEntityType =
  | 'QUESTION' // 1. Câu hỏi
  | 'CORPUS_PASSAGE' // 2. Ngữ liệu
  | 'MATRIX' // 3. Ma trận
  | 'SPECIFICATION' // 4. Bản đặc tả
  | 'EXAM_PAPER' // 5. Đề kiểm tra
  | 'GRADING_GUIDE' // 6. Hướng dẫn chấm
  | 'APPRAISAL_FEEDBACK'; // 7. Góp ý thẩm định

export type AutosaveVisualStateCode =
  | 'UNSAVED' // Chưa lưu
  | 'SAVING' // Đang lưu
  | 'SERVER_CONFIRMED' // Đã xác nhận lưu trên máy chủ
  | 'PENDING_SYNC' // Đang chờ đồng bộ (Lưu nháp cục bộ khi mất mạng — KHÔNG hiển thị "Đã lưu")
  | 'SAVE_FAILED' // Lưu thất bại
  | 'CONFLICT_DETECTED'; // Có xung đột dữ liệu

export type ConflictResolutionStrategy =
  | 'LOAD_LATEST_SERVER' // 1. Tải phiên bản mới nhất
  | 'SAVE_AS_COPY' // 2. Lưu nội dung hiện tại thành bản sao
  | 'MANUAL_COMPARE_AND_MERGE'; // 3. So sánh và hợp nhất thủ công

export interface AutosaveEntityContent {
  title: string;
  mainBodyText: string;
  answerOrRubricKey: string;
  pointsOrMatrixAllocation: string;
  professionalNote: string;
}

export interface AutosaveVersionHistoryEntry {
  versionNumber: number;
  versionLabel: string;
  updatedAt: string;
  updatedByUid: string;
  updatedByName: string;
  updatedByRole: string;
  approvalStatus: 'DRAFT' | 'PENDING_REAPPRAISAL' | 'APPROVED';
  operationNote: string;
  sha256Digest: string;
  contentSnapshot: AutosaveEntityContent;
}

export interface AutosaveManagedRecord {
  entityId: string;
  schoolId: string;
  entityType: AutosaveScopeEntityType;
  entityTypeVietnamese: string;
  subject: string;
  grade: string;
  version: number;
  versionLabel: string;
  updatedAt: string;
  updatedByUid: string;
  updatedByName: string;
  updatedByRole: string;
  approvalStatus: 'DRAFT' | 'PENDING_REAPPRAISAL' | 'APPROVED';
  immutableWhenApproved: boolean;
  reappraisalRequiredSteps: string[];
  sha256Digest: string;
  content: AutosaveEntityContent;
  versionHistory: AutosaveVersionHistoryEntry[];
}

export interface FieldDiffComparisonItem {
  fieldKey: keyof AutosaveEntityContent;
  fieldLabel: string;
  editingLocalValue: string;
  latestServerValue: string;
  isDifferent: boolean;
  affectsAnswerOrMatrixSafety: boolean;
}

export interface ConflictDetailPayload {
  entityId: string;
  entityType: AutosaveScopeEntityType;
  entityTypeVietnamese: string;
  expectedBaseVersion: number;
  latestServerVersion: number;
  editingActorName: string;
  latestServerUpdatedByName: string;
  latestServerUpdatedByRole: string;
  latestServerUpdatedAt: string;
  editingLocalContent: AutosaveEntityContent;
  latestServerContent: AutosaveEntityContent;
  fieldDiffs: FieldDiffComparisonItem[];
  autoMergeForbidden: boolean;
  autoMergeBlockedReason: string;
}

export interface TransactionalAutosaveResponse {
  ok: boolean;
  httpStatus: number;
  outcomeCode:
    | 'SERVER_SAVED_OK'
    | 'CONFLICT_DETECTED_409'
    | 'APPROVED_RECORD_LOCKED_403'
    | 'SAVE_ERROR';
  visualStateCode: AutosaveVisualStateCode;
  visualStateLabel: string;
  message: string;
  record?: AutosaveManagedRecord;
  conflict?: ConflictDetailPayload;
}

export interface AutosaveTestScenarioItem {
  order: number;
  scenarioCode:
    | 'AUTOSAVE_TEST_01_DEBOUNCED_SAVE'
    | 'AUTOSAVE_TEST_02_PAGE_RELOAD_PERSISTENCE'
    | 'AUTOSAVE_TEST_03_OTHER_DEVICE_SYNC'
    | 'AUTOSAVE_TEST_04_OFFLINE_DRAFT_QUEUE'
    | 'AUTOSAVE_TEST_05_RECONNECT_SAFE_SYNC'
    | 'AUTOSAVE_TEST_06_TWO_TEACHERS_CONFLICT'
    | 'AUTOSAVE_TEST_07_EDIT_APPROVED_DOSSIER'
    | 'AUTOSAVE_TEST_08_VERSION_HISTORY_AUDIT';
  scenarioTitle: string;
  passed: boolean;
  stateTransitionObserved: string;
  keystrokesSimulated: number;
  serverWritesExecuted: number;
  technicalEvidence: string;
}

export interface Autosave8ScenarioSuiteReport {
  runId: string;
  executedAt: string;
  schoolId: string;
  overallPassed: boolean;
  passedCount: number;
  totalScenarios: number;
  results: AutosaveTestScenarioItem[];
}

export const AUTOSAVE_STATE_META: Record<
  AutosaveVisualStateCode,
  {
    label: string;
    description: string;
  }
> = {
  UNSAVED: {
    label: 'Chưa lưu',
    description: 'Phát hiện thay đổi mới trên trình soạn thảo, đang đếm ngược thời gian ngừng gõ (Debounce).',
  },
  SAVING: {
    label: 'Đang lưu',
    description: 'Đang gửi transaction kiểm tra phiên bản và ghi dữ liệu lên Cloud Firestore.',
  },
  SERVER_CONFIRMED: {
    label: 'Đã xác nhận lưu trên máy chủ',
    description: 'Máy chủ Cloud Firestore đã xác nhận lưu thành công, tăng số phiên bản và cập nhật mã băm SHA-256.',
  },
  PENDING_SYNC: {
    label: 'Đang chờ đồng bộ',
    description: 'Đang mất kết nối mạng: Nội dung chỉ mới được giữ trong bộ nhớ đệm cục bộ, chưa lưu lên máy chủ.',
  },
  SAVE_FAILED: {
    label: 'Lưu thất bại',
    description: 'Không thể ghi đè (hồ sơ đã phê duyệt hoặc lỗi xác thực). Cần tạo phiên bản mới hoặc thử lại.',
  },
  CONFLICT_DETECTED: {
    label: 'Có xung đột dữ liệu',
    description: 'Máy chủ đang có phiên bản mới hơn do người dùng khác vừa cập nhật. Đã dừng ghi đè tự động.',
  },
};

export async function fetchAutosaveEntitiesService(
  schoolId = 'sch-th-thcs-nguyen-du'
): Promise<{
  ok: boolean;
  entities: AutosaveManagedRecord[];
}> {
  const response = await fetch(
    `/api/firebase/autosave-conflict/list-entities?schoolId=${encodeURIComponent(schoolId)}`
  );
  if (!response.ok) {
    throw new Error(`Không thể tải danh sách bản ghi Autosave (HTTP ${response.status}).`);
  }
  return response.json();
}

export async function saveEntityWithOccTransactionService(params: {
  schoolId?: string;
  entityId: string;
  expectedBaseVersion: number;
  actorUid: string;
  actorName: string;
  actorRole: string;
  content: AutosaveEntityContent;
  keystrokesCountInBatch?: number;
  triggerSource?: 'DEBOUNCED_AUTOSAVE' | 'MANUAL_SAVE' | 'RECONNECT_SYNC';
}): Promise<TransactionalAutosaveResponse> {
  const response = await fetch('/api/firebase/autosave-conflict/save-with-occ', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schoolId: params.schoolId || 'sch-th-thcs-nguyen-du',
      ...params,
    }),
  });
  return response.json();
}

export async function simulateColleagueConcurrentUpdateService(params: {
  schoolId?: string;
  entityId: string;
  colleagueUid?: string;
  colleagueName?: string;
  colleagueRole?: string;
  patchContent?: Partial<AutosaveEntityContent>;
}): Promise<{
  ok: boolean;
  message: string;
  record: AutosaveManagedRecord;
}> {
  const response = await fetch('/api/firebase/autosave-conflict/simulate-colleague-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schoolId: params.schoolId || 'sch-th-thcs-nguyen-du',
      ...params,
    }),
  });
  if (!response.ok) {
    throw new Error(`Lỗi giả lập đồng nghiệp cập nhật (HTTP ${response.status}).`);
  }
  return response.json();
}

export async function resolveDataConflictService(params: {
  schoolId?: string;
  entityId: string;
  strategy: ConflictResolutionStrategy;
  actorUid: string;
  actorName: string;
  actorRole: string;
  editingLocalContent: AutosaveEntityContent;
  manualMergedContent?: AutosaveEntityContent;
}): Promise<{
  ok: boolean;
  strategy: ConflictResolutionStrategy;
  message: string;
  primaryRecord: AutosaveManagedRecord;
  copiedRecord?: AutosaveManagedRecord | null;
}> {
  const response = await fetch('/api/firebase/autosave-conflict/resolve-conflict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schoolId: params.schoolId || 'sch-th-thcs-nguyen-du',
      ...params,
    }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Lỗi xử lý xung đột (HTTP ${response.status}).`);
  }
  return response.json();
}

export async function branchApprovedRecordForEditService(params: {
  schoolId?: string;
  entityId: string;
  actorUid: string;
  actorName: string;
  actorRole: string;
  changeReason: string;
  proposedContent?: AutosaveEntityContent;
}): Promise<{
  ok: boolean;
  message: string;
  record: AutosaveManagedRecord;
}> {
  const response = await fetch('/api/firebase/autosave-conflict/branch-approved-record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schoolId: params.schoolId || 'sch-th-thcs-nguyen-du',
      ...params,
    }),
  });
  if (!response.ok) {
    throw new Error(`Không thể tạo phiên bản nháp mới từ hồ sơ đã duyệt (HTTP ${response.status}).`);
  }
  return response.json();
}

export async function runAutosave8ScenariosQaService(
  schoolId = 'sch-th-thcs-nguyen-du'
): Promise<Autosave8ScenarioSuiteReport> {
  const response = await fetch('/api/firebase/autosave-conflict/run-8-scenarios-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schoolId }),
  });
  if (!response.ok) {
    throw new Error(`Lỗi chạy bộ kiểm thử 8 kịch bản Autosave (HTTP ${response.status}).`);
  }
  const data = await response.json();
  return data.suiteReport as Autosave8ScenarioSuiteReport;
}
