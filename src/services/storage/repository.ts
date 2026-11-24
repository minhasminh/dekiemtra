import {
  SEED_CURRICULUM_TOPICS,
  SEED_EXAMS,
  SEED_MATRICES,
  SEED_QUESTIONS,
  SEED_QUESTION_GROUPS,
} from '../../data/seedData';
import {
  cleanSingleTopicOrChapterTitle,
  extractCleanTopicTitles,
} from '../../data/matrixLessonCatalog';
import {
  AIGenerationBatch,
  ApprovalStatus,
  CurriculumTopic,
  ExamMatrix,
  ExamPaper,
  QuestionGroup,
  QuestionItem,
  SavedDepartmentMatrixPreset,
  StorageConfig,
  StoredFileAsset,
} from '../../types/domain';
import { isQuestionUsedInOfficialExam } from '../business/assessmentRules';
import {
  dalSyncStateManager,
  controlledAutoSaveEngine,
} from '../dal/firestoreDataAccessLayer';

const STORAGE_KEYS = {
  TOPICS: 'edutest_v3_curriculum_topics',
  QUESTIONS: 'edutest_v4_questions',
  QUESTION_GROUPS: 'edutest_v2_question_groups',
  MATRICES: 'edutest_v4_matrices',
  DEPARTMENT_MATRIX_PRESETS: 'edutest_v2_department_matrix_presets',
  EXAMS: 'edutest_v4_exams',
  CONFIG: 'edutest_v2_storage_config',
  FILE_ASSETS: 'edutest_v2_file_assets',
  QUESTION_DRAFT: 'edutest_v2_working_question_draft',
  AI_BATCHES: 'edutest_v2_ai_generation_batches',
};

const DEFAULT_CONFIG: StorageConfig = {
  provider: 'FIREBASE_FIRESTORE',
  schoolName: 'Trường TH &THCS Nguyễn Đình Anh',
  departmentName: 'Hội đồng Chuyên môn & Khảo thí',
  academicYear: '2026 - 2027',
  showSampleDataBanner: false,
};

const SEED_QUESTION_ID_SET = new Set(SEED_QUESTIONS.map((q) => q.id));
const SEED_MATRIX_ID_SET = new Set(SEED_MATRICES.map((m) => m.id));
const SEED_EXAM_ID_SET = new Set(SEED_EXAMS.map((e) => e.id));

const DEMO_ACTOR_REGEX =
  /(Cô Nguyễn Thị Lan|Thầy Trần Văn Bình|Thầy Lê Minh Châu|Cô Phạm Thu Dung|Thầy Hoàng Quốc Khánh|Cô Trần Thu Hà \(Tổ Lớp 2\)|Thầy Lê Văn Hùng \(Tổ Lớp 3\)|Tổ Kiểm thử|Giáo viên Kiểm thử|Ban Thẩm định QA)/i;

export function isSampleOrDemoQuestion(question?: QuestionItem | null): boolean {
  if (!question) return false;
  if (Boolean(question.isSampleData)) return true;
  const id = String(question.id || '');
  const code = String(question.code || '');
  if (
    SEED_QUESTION_ID_SET.has(id) ||
    /^(q-pri-|q-sec-|q-qa-|q-test-|q-sample-|q-demo-)/i.test(id)
  ) {
    return true;
  }
  if (/^(CH-QA-|CH-DEMO-|CH-SAMPLE-)/i.test(code)) {
    return true;
  }
  if (DEMO_ACTOR_REGEX.test(String(question.authorName || ''))) {
    return true;
  }
  return false;
}

export function isSampleOrDemoMatrix(matrix?: ExamMatrix | null): boolean {
  if (!matrix) return false;
  if (Boolean(matrix.isSampleData)) return true;
  const id = String(matrix.id || '');
  const code = String(matrix.code || '');
  const title = String(matrix.title || '');
  if (
    SEED_MATRIX_ID_SET.has(id) ||
    /^(mat-test-|mat-qa-|mat-pri-|mat-sec-|mat-sample-|mat-demo-)/i.test(id)
  ) {
    return true;
  }
  if (/^(MT-QA-|MT-DEMO-|MT-SAMPLE-|MAT-SAMPLE-|MT-THCS-K6-ERR|MT-TH-K4-WARN)/i.test(code)) {
    return true;
  }
  if (/\[(Quy trình mẫu|Hồ sơ mẫu|Dữ liệu thử nghiệm|Kịch bản kiểm thử)/i.test(title)) {
    return true;
  }
  const peopleText = `${matrix.authorName || ''} ${matrix.headOfDepartmentName || ''} ${matrix.finalApproverName || ''} ${matrix.assignedReviewerName || ''}`;
  if (DEMO_ACTOR_REGEX.test(peopleText)) {
    return true;
  }
  if (
    Array.isArray(matrix.versionHistory) &&
    matrix.versionHistory.some((h) =>
      DEMO_ACTOR_REGEX.test(`${h?.editorName || ''} ${h?.note || ''}`)
    )
  ) {
    return true;
  }
  return false;
}

export function isSampleOrDemoExam(exam?: ExamPaper | null): boolean {
  if (!exam) return false;
  if (Boolean(exam.isSampleData)) return true;
  const id = String(exam.id || '');
  const code = String(exam.code || '');
  const title = String(exam.title || '');
  if (
    SEED_EXAM_ID_SET.has(id) ||
    /^(exam-qa-|exam-pri-|exam-sec-|exam-sample-|exam-demo-)/i.test(id)
  ) {
    return true;
  }
  if (/^(ĐỀ-QA-|DE-QA-|DE-DEMO-|DE-SAMPLE-|EXAM-SAMPLE-)/i.test(code)) {
    return true;
  }
  if (/\[(Quy trình mẫu|Hồ sơ mẫu|Dữ liệu thử nghiệm|Kịch bản kiểm thử)/i.test(title)) {
    return true;
  }
  const peopleText = `${exam.authorName || ''} ${exam.headOfDepartmentName || ''} ${exam.finalApproverName || ''} ${exam.assignedReviewerName || ''} ${exam.reviewerName || ''}`;
  if (DEMO_ACTOR_REGEX.test(peopleText)) {
    return true;
  }
  if (
    Array.isArray(exam.statusHistory) &&
    exam.statusHistory.some((h) =>
      DEMO_ACTOR_REGEX.test(`${h?.actorName || ''} ${h?.note || ''}`)
    )
  ) {
    return true;
  }
  return false;
}

export interface UpdateQuestionOutcome {
  question: QuestionItem;
  createdNewVersion: boolean;
  reason?: string;
}

export interface UpdateMatrixOutcome {
  matrix: ExamMatrix;
  createdNewVersion: boolean;
  reason?: string;
}

export interface IDataRepository {
  getConfig(): StorageConfig;
  saveConfig(config: StorageConfig): void;
  getTopics(): CurriculumTopic[];
  addTopic(topic: Omit<CurriculumTopic, 'id'>): CurriculumTopic;

  // Ngân hàng câu hỏi (Giai đoạn 3)
  getQuestions(): QuestionItem[];
  addQuestion(question: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>): QuestionItem;
  updateQuestion(
    id: string,
    updates: Partial<Omit<QuestionItem, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean
  ): UpdateQuestionOutcome | null;
  duplicateQuestion(id: string): QuestionItem | null;
  bulkAddQuestions(items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]): QuestionItem[];
  deleteQuestion(id: string): { deleted: boolean; markedDeprecated: boolean; message: string };

  // Nhóm câu hỏi
  getQuestionGroups(): QuestionGroup[];
  addQuestionGroup(group: Omit<QuestionGroup, 'id' | 'code' | 'createdAt'>): QuestionGroup;
  assignQuestionsToGroup(groupId: string, questionIds: string[]): QuestionGroup | null;
  deleteQuestionGroup(groupId: string): void;

  // Cơ chế lưu trữ tệp tách biệt (không nhúng base64 lớn vào bản ghi câu hỏi)
  saveFileAsset(file: File): Promise<StoredFileAsset>;
  getFileAssetById(fileId: string): StoredFileAsset | undefined;
  getAllFileAssets(): StoredFileAsset[];

  // Lưu nháp tự động chống mất dữ liệu khi chuyển trang
  getWorkingQuestionDraft(): Record<string, unknown> | null;
  saveWorkingQuestionDraft(draft: Record<string, unknown> | null): void;

  // Đợt tạo câu hỏi AI (Giai đoạn 4 - Lưu bản nháp theo đợt tạo)
  getAIGenerationBatches(): AIGenerationBatch[];
  saveAIGenerationBatch(batch: AIGenerationBatch): AIGenerationBatch;
  deleteAIGenerationBatch(batchId: string): void;

  // Ma trận & Bản đặc tả (Giai đoạn 5)
  getMatrices(): ExamMatrix[];
  addMatrix(matrix: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>): ExamMatrix;
  updateMatrix(
    id: string,
    updates: Partial<Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean,
    editorNote?: string
  ): UpdateMatrixOutcome | null;
  deleteMatrix(id: string): { deleted: boolean; message: string };
  getDepartmentMatrixPresets(): SavedDepartmentMatrixPreset[];
  saveDepartmentMatrixPreset(
    preset: Omit<SavedDepartmentMatrixPreset, 'id' | 'createdAt'>
  ): SavedDepartmentMatrixPreset;
  deleteDepartmentMatrixPreset(id: string): void;

  // Đề kiểm tra & Thẩm định (Giai đoạn 6 & 7)
  getExams(): ExamPaper[];
  addExam(exam: Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>): ExamPaper;
  updateExam(
    examId: string,
    updates: Partial<Omit<ExamPaper, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean,
    editorNote?: string
  ): ExamPaper | null;
  updateExamApproval(
    examId: string,
    status: ApprovalStatus,
    reviewerName: string,
    reviewComment: string
  ): ExamPaper | null;
  purgeSampleMatricesAndExams(): { removedMatrices: number; removedExams: number };
  purgeSampleQuestions(): number;
  purgeSampleTopics(): number;
  resetToDefaultSeedData(): void;

  // Đồng bộ Kho dữ liệu tập trung & Khôi phục khi mất kết nối (Giai đoạn 17)
  setActiveTenant(schoolId: string, actorUserId?: string): void;
  initializeFromCentralServer(schoolId?: string): Promise<void>;
  getSyncDiagnostics(): {
    activeSchoolId: string;
    activeActorUserId: string;
    networkState: 'ONLINE' | 'OFFLINE';
    pendingOfflineOperationsCount: number;
    lastSyncedAt: string | null;
    hydratedFromServer: boolean;
  };
  syncToCentralServerNow(reason?: string): Promise<{ ok: boolean; message: string }>;
}

/**
 * Hệ thống Lưu trữ Tập trung Đồng bộ Cloud Firestore & Backend Multi-Tenant (Giai đoạn 17 - Mục I.8 & I.9):
 * - Không sử dụng localStorage làm nguồn dữ liệu chính sau khi chuyển sang hệ thống lưu trữ thực.
 * - Có hàng đợi khôi phục tự động (offlineRecoveryQueue) khi mất kết nối mạng.
 */
class LocalStorageRepository implements IDataRepository {
  private centralStore = new Map<string, unknown>();
  private activeSchoolId = 'sch-th-thcs-nguyen-du';
  private activeActorUserId = 'usr-admin-01';
  private networkState: 'ONLINE' | 'OFFLINE' = 'ONLINE';
  private lastSyncedAt: string | null = null;
  private offlineRecoveryQueue: Array<{
    key: string;
    value: unknown;
    queuedAt: string;
  }> = [];
  private hydratedFromServer = false;

  constructor() {
    void this.hydrateFromCentralStorageServer();
    if (typeof window !== 'undefined') {
      this.networkState = window.navigator.onLine === false ? 'OFFLINE' : 'ONLINE';
      window.addEventListener('online', () => {
        this.networkState = 'ONLINE';
        void this.flushOfflineRecoveryQueue();
      });
      window.addEventListener('offline', () => {
        this.networkState = 'OFFLINE';
      });
    }
  }

  public setActiveTenant(schoolId: string, actorUserId?: string): void {
    if (schoolId && schoolId.trim()) {
      this.activeSchoolId = schoolId.trim();
    }
    if (actorUserId && actorUserId.trim()) {
      this.activeActorUserId = actorUserId.trim();
    }
  }

  public async initializeFromCentralServer(schoolId?: string): Promise<void> {
    if (schoolId && schoolId.trim()) {
      this.activeSchoolId = schoolId.trim();
    }
    await this.hydrateFromCentralStorageServer();
  }

  public getSyncDiagnostics() {
    return {
      activeSchoolId: this.activeSchoolId,
      activeActorUserId: this.activeActorUserId,
      networkState: this.networkState,
      pendingOfflineOperationsCount: this.offlineRecoveryQueue.length,
      lastSyncedAt: this.lastSyncedAt,
      hydratedFromServer: this.hydratedFromServer,
    };
  }

  public async syncToCentralServerNow(
    reason = 'MANUAL_SYNC'
  ): Promise<{ ok: boolean; message: string }> {
    if (typeof fetch === 'undefined') {
      return { ok: false, message: 'Môi trường không hỗ trợ fetch.' };
    }
    try {
      const payload = {
        schoolId: this.activeSchoolId,
        actorUserId: this.activeActorUserId,
        reason,
        collections: {
          questions: this.getQuestions(),
          matrices: this.getMatrices(),
          exams: this.getExams(),
          questionGroups: this.getQuestionGroups(),
          config: this.getConfig(),
        },
      };
      const res = await fetch('/api/firebase/stage17/central-repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      this.networkState = 'ONLINE';
      this.lastSyncedAt = new Date().toISOString();
      await this.flushOfflineRecoveryQueue();
      return {
        ok: true,
        message: `Đã đồng bộ thành công kho dữ liệu tập trung của trường (${this.activeSchoolId}).`,
      };
    } catch {
      this.networkState = 'OFFLINE';
      this.offlineRecoveryQueue.push({
        key: 'FULL_SYNC',
        value: { reason },
        queuedAt: new Date().toISOString(),
      });
      return {
        ok: false,
        message:
          'Mất kết nối mạng tạm thời. Dữ liệu đã được xếp vào hàng đợi khôi phục (offlineRecoveryQueue) và sẽ tự động đồng bộ khi có mạng lại.',
      };
    }
  }

  private async hydrateFromCentralStorageServer(): Promise<void> {
    if (typeof fetch === 'undefined') return;
    try {
      const res = await fetch(
        `/api/firebase/stage17/central-repository?schoolId=${encodeURIComponent(this.activeSchoolId)}`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok && json.collections && typeof json.collections === 'object') {
        const cols = json.collections;
        if (Array.isArray(cols.questions)) {
          this.centralStore.set(
            STORAGE_KEYS.QUESTIONS,
            (cols.questions as QuestionItem[]).filter((q) => !isSampleOrDemoQuestion(q))
          );
        }
        if (Array.isArray(cols.matrices)) {
          this.centralStore.set(
            STORAGE_KEYS.MATRICES,
            (cols.matrices as ExamMatrix[]).filter((m) => !isSampleOrDemoMatrix(m))
          );
        }
        if (Array.isArray(cols.exams)) {
          this.centralStore.set(
            STORAGE_KEYS.EXAMS,
            (cols.exams as ExamPaper[]).filter((e) => !isSampleOrDemoExam(e))
          );
        }
        if (Array.isArray(cols.questionGroups)) {
          this.centralStore.set(
            STORAGE_KEYS.QUESTION_GROUPS,
            (cols.questionGroups as QuestionGroup[]).filter(
              (g) => !/^(grp-pri-|grp-sec-|grp-sample-|grp-demo-)/i.test(String(g?.id || ''))
            )
          );
        }
        if (cols.config && typeof cols.config === 'object') {
          const incomingCfg = { ...cols.config } as StorageConfig;
          if (
            !incomingCfg.schoolName ||
            incomingCfg.schoolName.includes('Nguyễn Du') ||
            incomingCfg.schoolName.includes('Chu Văn An')
          ) {
            incomingCfg.schoolName = 'Trường TH &THCS Nguyễn Đình Anh';
          }
          if (
            !incomingCfg.academicYear ||
            String(incomingCfg.academicYear).includes('2024') ||
            String(incomingCfg.academicYear).includes('2025')
          ) {
            incomingCfg.academicYear = '2026 - 2027';
          }
          this.centralStore.set(STORAGE_KEYS.CONFIG, incomingCfg);
        }
        this.hydratedFromServer = true;
        this.networkState = 'ONLINE';
        this.lastSyncedAt = cols.updatedAt || new Date().toISOString();
      }
    } catch {
      this.networkState = 'OFFLINE';
    }
  }

  public async flushOfflineRecoveryQueue(): Promise<number> {
    if (this.offlineRecoveryQueue.length === 0) return 0;
    const pending = [...this.offlineRecoveryQueue];
    this.offlineRecoveryQueue = [];
    let syncedCount = 0;
    for (const item of pending) {
      try {
        const res = await fetch('/api/firebase/stage17/central-repository', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: this.activeSchoolId,
            reason: 'OFFLINE_QUEUE_RECOVERY',
            collections: {
              questions: this.getQuestions(),
              matrices: this.getMatrices(),
              exams: this.getExams(),
              questionGroups: this.getQuestionGroups(),
              config: this.getConfig(),
            },
          }),
        });
        if (res.ok) {
          syncedCount++;
          this.networkState = 'ONLINE';
          this.lastSyncedAt = new Date().toISOString();
        } else {
          this.offlineRecoveryQueue.push(item);
        }
      } catch {
        this.offlineRecoveryQueue.push(item);
      }
    }
    return syncedCount;
  }

  private readJson<T>(key: string, fallback: T): T {
    if (this.centralStore.has(key)) {
      return this.centralStore.get(key) as T;
    }
    try {
      // Nếu có dữ liệu cũ từng lưu trước khi migration, đọc 1 lần để nạp vào Central Store (không làm mất dữ liệu cũ - Mục I.2)
      const legacyRaw =
        typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw) as T;
        this.centralStore.set(key, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
    this.centralStore.set(key, fallback);
    return fallback;
  }

  private writeJson<T>(key: string, value: T): void {
    this.centralStore.set(key, value);
    if (typeof fetch !== 'undefined') {
      if (dalSyncStateManager.isEffectivelyOffline()) {
        this.networkState = 'OFFLINE';
        this.offlineRecoveryQueue.push({
          key,
          value,
          queuedAt: new Date().toISOString(),
        });
        dalSyncStateManager.updateState({
          saveStatus: 'OFFLINE_CACHED',
          networkState: 'OFFLINE',
          lastStatusMessage:
            'Đang mất mạng (Offline): Dữ liệu mới chỉ nằm trong bộ nhớ đệm tạm thời, CHƯA lưu lên máy chủ Firestore.',
        });
        return;
      }

      const collectionsPayload: Record<string, unknown> = {};
      if (key === STORAGE_KEYS.QUESTIONS) collectionsPayload.questions = value;
      else if (key === STORAGE_KEYS.MATRICES) collectionsPayload.matrices = value;
      else if (key === STORAGE_KEYS.EXAMS) collectionsPayload.exams = value;
      else if (key === STORAGE_KEYS.QUESTION_GROUPS) collectionsPayload.questionGroups = value;
      else if (key === STORAGE_KEYS.CONFIG) collectionsPayload.config = value;

      dalSyncStateManager.updateState({
        saveStatus: 'SAVING',
        lastStatusMessage: `Đang đồng bộ dữ liệu (${key}) lên Cloud Firestore...`,
      });

      fetch('/api/firebase/stage17/central-repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: this.activeSchoolId,
          reason: `WRITE_${key}`,
          collections: collectionsPayload,
        }),
      })
        .then((res) => {
          if (res.ok) {
            this.networkState = 'ONLINE';
            this.lastSyncedAt = new Date().toISOString();
            dalSyncStateManager.updateState({
              saveStatus: 'SAVED_SERVER',
              networkState: 'ONLINE',
              lastServerConfirmedAt: this.lastSyncedAt,
              lastStatusMessage: `Đã lưu và xác nhận thành công trên Cloud Firestore (${this.activeSchoolId}).`,
            });
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        })
        .catch(() => {
          this.networkState = 'OFFLINE';
          this.offlineRecoveryQueue.push({
            key,
            value,
            queuedAt: new Date().toISOString(),
          });
          dalSyncStateManager.updateState({
            saveStatus: 'OFFLINE_CACHED',
            networkState: 'OFFLINE',
            lastStatusMessage:
              'Mất kết nối máy chủ: Dữ liệu đang giữ trong hàng đợi khôi phục ngoại tuyến, CHƯA lưu lên máy chủ.',
          });
        });
    }
  }

  getConfig(): StorageConfig {
    const cfg = this.readJson<StorageConfig>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    let changed = false;
    if (
      !cfg.schoolName ||
      cfg.schoolName.includes('Chu Văn An') ||
      cfg.schoolName.includes('Nguyễn Du')
    ) {
      cfg.schoolName = DEFAULT_CONFIG.schoolName;
      changed = true;
    }
    if (
      !cfg.academicYear ||
      String(cfg.academicYear).includes('2024') ||
      String(cfg.academicYear).includes('2025')
    ) {
      cfg.academicYear = DEFAULT_CONFIG.academicYear;
      changed = true;
    }
    if (cfg.exportTemplates && cfg.exportTemplates.length > 0) {
      cfg.exportTemplates = cfg.exportTemplates.map((tpl) => {
        if (
          tpl.governingBodyName &&
          (tpl.governingBodyName.includes('BA ĐÌNH') ||
            tpl.governingBodyName === 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO' ||
            tpl.governingBodyName === 'SỞ GIÁO DỤC VÀ ĐÀO TẠO')
        ) {
          changed = true;
          return { ...tpl, governingBodyName: 'UBND XÃ ĐAN ĐIỀN' };
        }
        return tpl;
      });
    }
    if (changed) {
      this.writeJson(STORAGE_KEYS.CONFIG, cfg);
    }
    return cfg;
  }

  saveConfig(config: StorageConfig): void {
    this.writeJson(STORAGE_KEYS.CONFIG, config);
  }

  getTopics(): CurriculumTopic[] {
    const officialSeedTopics = SEED_CURRICULUM_TOPICS.filter((t) => !t.isSampleData);
    const stored = this.readJson<CurriculumTopic[]>(STORAGE_KEYS.TOPICS, officialSeedTopics);
    const seedById = new Map(SEED_CURRICULUM_TOPICS.map((t) => [t.id, t]));
    const storedById = new Map(stored.map((t) => [t.id, t]));
    let changed = stored.some((t) => Boolean(t.isSampleData));

    const merged: CurriculumTopic[] = [];
    // Luôn đồng bộ đầy đủ dữ liệu chuẩn GDPT 2018 chính thức (loại bỏ bản ghi isSampleData)
    for (const seedTopic of officialSeedTopics) {
      const existing = storedById.get(seedTopic.id);
      if (
        !existing ||
        existing.chapterTitle !== seedTopic.chapterTitle ||
        existing.chapterCode !== seedTopic.chapterCode ||
        existing.topicTitle !== seedTopic.topicTitle ||
        (existing.lessons?.length || 0) !== (seedTopic.lessons?.length || 0) ||
        JSON.stringify(existing.lessons) !== JSON.stringify(seedTopic.lessons)
      ) {
        merged.push(seedTopic);
        changed = true;
      } else {
        merged.push(existing);
      }
    }
    // Giữ lại các chủ đề chính thức do giáo viên tự thêm ngoài danh mục gốc
    for (const item of stored) {
      if (!seedById.has(item.id) && !item.isSampleData) {
        merged.push(item);
      }
    }

    if (changed) {
      this.writeJson(STORAGE_KEYS.TOPICS, merged);
    }
    return merged;
  }

  addTopic(topicInput: Omit<CurriculumTopic, 'id'>): CurriculumTopic {
    const topics = this.getTopics();
    const newTopic: CurriculumTopic = {
      ...topicInput,
      id: `cur-${Date.now()}`,
      isSampleData: false,
    };
    const updated = [newTopic, ...topics];
    this.writeJson(STORAGE_KEYS.TOPICS, updated);
    return newTopic;
  }

  getQuestions(): QuestionItem[] {
    const raw = this.readJson<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, []);
    const officialOnly = raw.filter((q) => !isSampleOrDemoQuestion(q));
    if (officialOnly.length !== raw.length) {
      this.writeJson(STORAGE_KEYS.QUESTIONS, officialOnly);
    }
    return officialOnly.map((q) => {
      if (!q.topicTitle) return q;
      const needsClean =
        q.topicTitle.includes('tiết)') ||
        q.topicTitle.includes('Kiểm tra') ||
        (q.topicTitle.length > 90 && q.topicTitle.includes(';'));
      if (!needsClean) return q;
      const cleaned =
        extractCleanTopicTitles(q.topicTitle)[0] ||
        cleanSingleTopicOrChapterTitle(q.topicTitle) ||
        q.topicTitle;
      return cleaned !== q.topicTitle ? { ...q, topicTitle: cleaned } : q;
    });
  }

  private buildUniqueQuestionCode(
    levelId: QuestionItem['levelId'],
    grade: number,
    existingCount: number,
    version = 1
  ): string {
    const levelPrefix = levelId === 'PRIMARY' ? 'TH' : levelId === 'LOWER_SECONDARY' ? 'THCS' : 'THPT';
    const nextNumber = String(existingCount + 1).padStart(3, '0');
    const suffix = version > 1 ? `-v${version}` : '';
    return `CH-${levelPrefix}-K${grade}-${nextNumber}${suffix}`;
  }

  addQuestion(questionInput: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>): QuestionItem {
    const questions = this.getQuestions();
    const today = new Date().toISOString().slice(0, 10);
    const version = questionInput.version || 1;
    const code = this.buildUniqueQuestionCode(
      questionInput.levelId,
      questionInput.grade,
      questions.length,
      version
    );

    const newQuestion: QuestionItem = {
      ...questionInput,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code,
      version,
      createdAt: today,
      updatedAt: today,
    };
    const updated = [newQuestion, ...questions];
    this.writeJson(STORAGE_KEYS.QUESTIONS, updated);
    return newQuestion;
  }

  /**
   * Chỉnh sửa câu hỏi.
   * Quy tắc nghiệp vụ: Không ghi đè câu hỏi đã được dùng trong đề chính thức; tự động tạo phiên bản mới khi cần.
   */
  updateQuestion(
    id: string,
    updates: Partial<Omit<QuestionItem, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion = false
  ): UpdateQuestionOutcome | null {
    const questions = this.getQuestions();
    const exams = this.getExams();
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;

    const existing = questions[idx];
    const today = new Date().toISOString().slice(0, 10);
    const officialUsage = isQuestionUsedInOfficialExam(existing, exams);

    // Kiểm tra xem chỉ đổi trạng thái hay đổi nội dung câu hỏi
    const isContentModified =
      (updates.stem !== undefined && updates.stem !== existing.stem) ||
      (updates.correctAnswer !== undefined && updates.correctAnswer !== existing.correctAnswer) ||
      (updates.points !== undefined && updates.points !== existing.points) ||
      (updates.format !== undefined && updates.format !== existing.format);

    if ((officialUsage.usedInOfficial && isContentModified) || forceNewVersion) {
      // Tìm version cao nhất của nhánh câu hỏi này
      const rootId = existing.parentQuestionId || existing.id;
      const relatedVersions = questions.filter(
        (q) => q.id === rootId || q.parentQuestionId === rootId
      );
      const maxVersion = relatedVersions.reduce((max, q) => Math.max(max, q.version || 1), 1);
      const nextVersion = maxVersion + 1;

      const baseCode = existing.code.replace(/-v\d+$/, '');
      const newVersionItem: QuestionItem = {
        ...existing,
        ...updates,
        id: `q-${Date.now()}-v${nextVersion}`,
        code: `${baseCode}-v${nextVersion}`,
        version: nextVersion,
        parentQuestionId: rootId,
        versionNote:
          updates.versionNote ||
          `Tách phiên bản v${nextVersion} từ ${existing.code} (bảo toàn lịch sử đề chính thức)`,
        usageHistory: [],
        createdAt: today,
        updatedAt: today,
        isSampleData: false,
      };

      const updatedList = [newVersionItem, ...questions];
      this.writeJson(STORAGE_KEYS.QUESTIONS, updatedList);
      return {
        question: newVersionItem,
        createdNewVersion: true,
        reason: officialUsage.usedInOfficial
          ? `Câu hỏi gốc ${existing.code} đã dùng trong đề chính thức nên hệ thống tự động tạo phiên bản mới ${newVersionItem.code} để không ghi đè dữ liệu lịch sử.`
          : `Đã khởi tạo phiên bản mới ${newVersionItem.code}.`,
      };
    }

    const updatedItem: QuestionItem = {
      ...existing,
      ...updates,
      updatedAt: today,
    };
    questions[idx] = updatedItem;
    this.writeJson(STORAGE_KEYS.QUESTIONS, questions);
    return {
      question: updatedItem,
      createdNewVersion: false,
    };
  }

  duplicateQuestion(id: string): QuestionItem | null {
    const questions = this.getQuestions();
    const source = questions.find((q) => q.id === id);
    if (!source) return null;

    const today = new Date().toISOString().slice(0, 10);
    const code = this.buildUniqueQuestionCode(source.levelId, source.grade, questions.length, 1);
    const copy: QuestionItem = {
      ...source,
      id: `q-copy-${Date.now()}`,
      code,
      stem: `${source.stem} (Bản sao)`,
      status: ApprovalStatus.DRAFT,
      version: 1,
      parentQuestionId: undefined,
      usageHistory: [],
      createdAt: today,
      updatedAt: today,
      isSampleData: false,
    };

    const updated = [copy, ...questions];
    this.writeJson(STORAGE_KEYS.QUESTIONS, updated);
    return copy;
  }

  bulkAddQuestions(items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]): QuestionItem[] {
    const questions = this.getQuestions();
    const today = new Date().toISOString().slice(0, 10);
    const createdItems: QuestionItem[] = [];

    items.forEach((item, index) => {
      const code = this.buildUniqueQuestionCode(
        item.levelId,
        item.grade,
        questions.length + index,
        item.version || 1
      );
      createdItems.push({
        ...item,
        id: `q-bulk-${Date.now()}-${index}`,
        code,
        version: item.version || 1,
        createdAt: today,
        updatedAt: today,
      });
    });

    const updated = [...createdItems, ...questions];
    this.writeJson(STORAGE_KEYS.QUESTIONS, updated);
    return createdItems;
  }

  deleteQuestion(id: string): { deleted: boolean; markedDeprecated: boolean; message: string } {
    const questions = this.getQuestions();
    const exams = this.getExams();
    const target = questions.find((q) => q.id === id);
    if (!target) {
      return { deleted: false, markedDeprecated: false, message: 'Không tìm thấy câu hỏi.' };
    }

    const officialCheck = isQuestionUsedInOfficialExam(target, exams);
    if (officialCheck.usedInOfficial) {
      // Không xóa vật lý câu hỏi đã nằm trong đề chính thức -> Chuyển sang trạng thái Ngừng sử dụng (DEPRECATED)
      const updated = questions.map((q) =>
        q.id === id
          ? {
              ...q,
              status: ApprovalStatus.DEPRECATED,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : q
      );
      this.writeJson(STORAGE_KEYS.QUESTIONS, updated);
      return {
        deleted: false,
        markedDeprecated: true,
        message: `Câu hỏi ${target.code} đã được sử dụng trong đề chính thức nên không xóa vĩnh viễn mà được chuyển sang trạng thái "Ngừng sử dụng" để bảo toàn hồ sơ khảo thí.`,
      };
    }

    const filtered = questions.filter((q) => q.id !== id);
    this.writeJson(STORAGE_KEYS.QUESTIONS, filtered);
    return {
      deleted: true,
      markedDeprecated: false,
      message: `Đã xóa câu hỏi ${target.code} khỏi ngân hàng.`,
    };
  }

  getQuestionGroups(): QuestionGroup[] {
    const raw = this.readJson<QuestionGroup[]>(STORAGE_KEYS.QUESTION_GROUPS, []);
    return raw.filter(
      (g) => !/^(grp-pri-|grp-sec-|grp-sample-|grp-demo-)/i.test(String(g?.id || ''))
    );
  }

  addQuestionGroup(groupInput: Omit<QuestionGroup, 'id' | 'code' | 'createdAt'>): QuestionGroup {
    const groups = this.getQuestionGroups();
    const nextNum = String(groups.length + 1).padStart(2, '0');
    const newGroup: QuestionGroup = {
      ...groupInput,
      id: `grp-${Date.now()}`,
      code: `NHOM-${nextNum}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [newGroup, ...groups];
    this.writeJson(STORAGE_KEYS.QUESTION_GROUPS, updated);

    // Đồng bộ groupId trên các câu hỏi thành viên
    if (newGroup.questionIds.length > 0) {
      const questions = this.getQuestions().map((q) =>
        newGroup.questionIds.includes(q.id) ? { ...q, groupId: newGroup.id } : q
      );
      this.writeJson(STORAGE_KEYS.QUESTIONS, questions);
    }

    return newGroup;
  }

  assignQuestionsToGroup(groupId: string, questionIds: string[]): QuestionGroup | null {
    const groups = this.getQuestionGroups();
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx === -1) return null;

    const mergedIds = Array.from(new Set([...groups[idx].questionIds, ...questionIds]));
    groups[idx] = {
      ...groups[idx],
      questionIds: mergedIds,
    };
    this.writeJson(STORAGE_KEYS.QUESTION_GROUPS, groups);

    const questions = this.getQuestions().map((q) =>
      questionIds.includes(q.id) ? { ...q, groupId } : q
    );
    this.writeJson(STORAGE_KEYS.QUESTIONS, questions);
    return groups[idx];
  }

  deleteQuestionGroup(groupId: string): void {
    const groups = this.getQuestionGroups().filter((g) => g.id !== groupId);
    this.writeJson(STORAGE_KEYS.QUESTION_GROUPS, groups);
    const questions = this.getQuestions().map((q) =>
      q.groupId === groupId ? { ...q, groupId: undefined } : q
    );
    this.writeJson(STORAGE_KEYS.QUESTIONS, questions);
  }

  getAllFileAssets(): StoredFileAsset[] {
    return this.readJson<StoredFileAsset[]>(STORAGE_KEYS.FILE_ASSETS, []);
  }

  getFileAssetById(fileId: string): StoredFileAsset | undefined {
    return this.getAllFileAssets().find((f) => f.fileId === fileId);
  }

  async saveFileAsset(file: File): Promise<StoredFileAsset> {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Không thể đọc tệp'));
      reader.readAsDataURL(file);
    });

    try {
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'image/png',
          base64Data,
        }),
      });
      if (response.ok) {
        const asset = (await response.json()) as StoredFileAsset;
        const currentAssets = this.getAllFileAssets();
        this.writeJson(STORAGE_KEYS.FILE_ASSETS, [asset, ...currentAssets]);
        return asset;
      }
    } catch {
      // Nếu mất kết nối tạm thời, lưu vào bảng FILE_ASSETS tách biệt (vẫn chỉ giữ fileId trong QuestionItem)
    }

    const fallbackAsset: StoredFileAsset = {
      fileId: `local-file-${Date.now()}`,
      fileName: file.name,
      mimeType: file.type || 'image/png',
      sizeBytes: file.size,
      url: base64Data,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const currentAssets = this.getAllFileAssets();
    this.writeJson(STORAGE_KEYS.FILE_ASSETS, [fallbackAsset, ...currentAssets]);
    return fallbackAsset;
  }

  getWorkingQuestionDraft(): Record<string, unknown> | null {
    if (this.centralStore.has(STORAGE_KEYS.QUESTION_DRAFT)) {
      return (this.centralStore.get(STORAGE_KEYS.QUESTION_DRAFT) as Record<string, unknown>) || null;
    }
    try {
      const raw =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(STORAGE_KEYS.QUESTION_DRAFT)
          : null;
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  saveWorkingQuestionDraft(draft: Record<string, unknown> | null): void {
    this.centralStore.set(STORAGE_KEYS.QUESTION_DRAFT, draft);
    try {
      if (typeof localStorage !== 'undefined') {
        if (!draft) {
          localStorage.removeItem(STORAGE_KEYS.QUESTION_DRAFT);
        } else {
          localStorage.setItem(STORAGE_KEYS.QUESTION_DRAFT, JSON.stringify(draft));
        }
      }
      if (draft) {
        controlledAutoSaveEngine.scheduleControlledAutoSave({
          entityType: 'QUESTION_DRAFT',
          recordId: String(draft.id || 'q_working_draft'),
          baseVersion: Number(draft.version || 1),
          draftPayload: {
            id: String(draft.id || 'q_working_draft'),
            code: String(draft.code || 'CH-DRAFT'),
            levelId: String(draft.levelId || 'LOWER_SECONDARY'),
            grade: Number(draft.grade || 8),
            subject: String(draft.subject || 'Khoa học tự nhiên'),
            stem: String(draft.stem || ''),
            correctAnswer: String(draft.correctAnswer || 'A'),
            points: Number(draft.points || 0.25),
            securityClassification: 'DRAFT_QUESTION',
            status: 'DRAFT',
          },
          ctx: {
            schoolId: this.activeSchoolId,
            actorUserId: this.activeActorUserId,
            actorName: 'Giáo viên soạn thảo',
            actorRole: 'TEACHER',
          },
          debounceMs: 2500,
        });
      }
    } catch (err) {
      console.error('Draft save error:', err);
    }
  }

  getAIGenerationBatches(): AIGenerationBatch[] {
    return this.readJson<AIGenerationBatch[]>(STORAGE_KEYS.AI_BATCHES, []);
  }

  saveAIGenerationBatch(batch: AIGenerationBatch): AIGenerationBatch {
    const batches = this.getAIGenerationBatches();
    const idx = batches.findIndex((b) => b.id === batch.id);
    const updatedBatch: AIGenerationBatch = {
      ...batch,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    if (idx >= 0) {
      batches[idx] = updatedBatch;
      this.writeJson(STORAGE_KEYS.AI_BATCHES, batches);
    } else {
      this.writeJson(STORAGE_KEYS.AI_BATCHES, [updatedBatch, ...batches]);
    }
    return updatedBatch;
  }

  deleteAIGenerationBatch(batchId: string): void {
    const batches = this.getAIGenerationBatches().filter((b) => b.id !== batchId);
    this.writeJson(STORAGE_KEYS.AI_BATCHES, batches);
  }

  getMatrices(): ExamMatrix[] {
    const list = this.readJson<ExamMatrix[]>(STORAGE_KEYS.MATRICES, []);
    let changed = false;
    const filtered = list.filter((m) => {
      if (isSampleOrDemoMatrix(m)) {
        changed = true;
        return false;
      }
      return true;
    });
    const updated = filtered.map((m) => {
      if (m.schoolName && m.schoolName.includes('Chu Văn An')) {
        changed = true;
        return { ...m, schoolName: DEFAULT_CONFIG.schoolName };
      }
      return m;
    });
    if (changed) {
      this.centralStore.set(STORAGE_KEYS.MATRICES, updated);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.MATRICES, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    }
    return updated;
  }

  addMatrix(matrixInput: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>): ExamMatrix {
    const matrices = this.getMatrices();
    const levelPrefix = matrixInput.levelId === 'PRIMARY' ? 'TH' : 'THCS';
    const nextNumber = String(matrices.length + 1).padStart(2, '0');
    const today = new Date().toISOString().slice(0, 10);
    const version = matrixInput.version || 1;
    const isApproved = matrixInput.status === ApprovalStatus.APPROVED;
    const newMatrix: ExamMatrix = {
      ...matrixInput,
      id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: `MT-${levelPrefix}-K${matrixInput.grade}-${nextNumber}`,
      version,
      isLocked: isApproved ? true : Boolean(matrixInput.isLocked),
      versionHistory: matrixInput.versionHistory || [
        {
          version,
          updatedAt: today,
          editorName: matrixInput.authorName || 'Tổ Chuyên môn',
          note: isApproved
            ? 'Khởi tạo và phê duyệt khóa phiên bản chính thức'
            : 'Khởi tạo bản nháp ma trận & bản đặc tả',
          status: matrixInput.status,
        },
      ],
      createdAt: today,
      updatedAt: today,
    };
    const updated = [newMatrix, ...matrices];
    this.writeJson(STORAGE_KEYS.MATRICES, updated);
    return newMatrix;
  }

  updateMatrix(
    id: string,
    updates: Partial<Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion = false,
    editorNote?: string
  ): UpdateMatrixOutcome | null {
    const matrices = this.getMatrices();
    const idx = matrices.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const existing = matrices[idx];
    const today = new Date().toISOString().slice(0, 10);
    const isCurrentlyApprovedOrLocked =
      existing.status === ApprovalStatus.APPROVED || Boolean(existing.isLocked);

    const isMatrixContentModified =
      (updates.title !== undefined && updates.title !== existing.title) ||
      updates.specRows !== undefined ||
      updates.rows !== undefined ||
      (updates.totalPoints !== undefined && updates.totalPoints !== existing.totalPoints) ||
      (updates.totalQuestions !== undefined && updates.totalQuestions !== existing.totalQuestions);

    // QUY TẮC MỤC 8 & MỤC VIII: Không sửa trực tiếp ma trận đã được phê duyệt. Nếu chỉnh sửa nội dung một ma trận đã duyệt, bắt buộc tạo phiên bản mới!
    if ((isCurrentlyApprovedOrLocked && isMatrixContentModified) || forceNewVersion) {
      const nextVersion = (existing.version || 1) + 1;
      const baseCode = existing.code.replace(/-v\d+$/i, '');
      const newStatus = updates.status || ApprovalStatus.DRAFT;
      const newVersionMatrix: ExamMatrix = {
        ...existing,
        ...updates,
        id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: `${baseCode}-v${nextVersion}`,
        version: nextVersion,
        parentMatrixId: existing.id,
        status: newStatus,
        isLocked: newStatus === ApprovalStatus.APPROVED,
        createdAt: today,
        updatedAt: today,
        isSampleData: false,
        versionHistory: [
          {
            version: nextVersion,
            updatedAt: today,
            editorName: updates.authorName || existing.authorName || 'Tổ Chuyên môn',
            note:
              editorNote ||
              `Tách phiên bản mới v${nextVersion} từ ma trận đã phê duyệt (${existing.code}) để bảo toàn hồ sơ gốc.`,
            status: newStatus,
          },
          ...(existing.versionHistory || []),
        ],
      };

      const updatedList = [newVersionMatrix, ...matrices];
      this.writeJson(STORAGE_KEYS.MATRICES, updatedList);
      return {
        matrix: newVersionMatrix,
        createdNewVersion: true,
        reason: `Ma trận gốc (${existing.code}) đã được phê duyệt và khóa. Hệ thống tự động tạo phiên bản mới (${newVersionMatrix.code}) để không ghi đè âm thầm.`,
      };
    }

    const nextStatus = updates.status || existing.status;
    const updatedMatrix: ExamMatrix = {
      ...existing,
      ...updates,
      status: nextStatus,
      isLocked: nextStatus === ApprovalStatus.APPROVED,
      updatedAt: today,
      isSampleData: false,
      versionHistory: [
        {
          version: existing.version || 1,
          updatedAt: today,
          editorName: updates.authorName || existing.authorName || 'Tổ Chuyên môn',
          note:
            editorNote ||
            (nextStatus === ApprovalStatus.APPROVED
              ? 'Phê duyệt chính thức và khóa phiên bản ma trận'
              : nextStatus === ApprovalStatus.PENDING
              ? 'Gửi thẩm định ma trận & bản đặc tả'
              : 'Cập nhật nội dung ma trận & bản đặc tả'),
          status: nextStatus,
        },
        ...(existing.versionHistory || []),
      ],
    };

    matrices[idx] = updatedMatrix;
    this.writeJson(STORAGE_KEYS.MATRICES, matrices);
    return {
      matrix: updatedMatrix,
      createdNewVersion: false,
    };
  }

  deleteMatrix(id: string): { deleted: boolean; message: string } {
    const matrices = this.getMatrices();
    const target = matrices.find((m) => m.id === id);
    if (!target) {
      return { deleted: false, message: 'Không tìm thấy ma trận.' };
    }
    const usedByExam = this.getExams().some((e) => e.matrixId === id);
    if (usedByExam || target.status === ApprovalStatus.APPROVED || target.isLocked) {
      return {
        deleted: false,
        message:
          'Ma trận đã được phê duyệt hoặc đang gắn với đề kiểm tra chính thức, không được xóa.',
      };
    }
    this.writeJson(
      STORAGE_KEYS.MATRICES,
      matrices.filter((m) => m.id !== id)
    );
    return { deleted: true, message: `Đã xóa ma trận nháp ${target.code}.` };
  }

  getDepartmentMatrixPresets(): SavedDepartmentMatrixPreset[] {
    const defaultPresets: SavedDepartmentMatrixPreset[] = [
      {
        id: 'preset-thcs-cv7991-math',
        name: 'Cấu trúc Tổ Toán – Tin THCS (Chuẩn CV 7991: 40-30-30)',
        departmentName: 'Tổ Toán – Tin THCS',
        createdAt: '2026-09-05',
        levelId: 'LOWER_SECONDARY' as any,
        grade: 6,
        subject: 'Toán',
        templateCode: 'TEMPLATE_A_CV7991',
        activeFormatGroups: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
        targetLevelPercentages: { BIET: 40, HIEU: 30, VAN_DUNG: 30 },
        scoringRules: [
          {
            formatGroup: 'MCQ',
            defaultPointsPerQuestion: 0.25,
            gradingRuleDescription: '0,25 điểm / câu trắc nghiệm 4 lựa chọn',
          },
          {
            formatGroup: 'TRUE_FALSE',
            defaultPointsPerQuestion: 1.0,
            gradingRuleDescription: '1,0 điểm / câu Đúng - Sai 4 ý',
          },
          {
            formatGroup: 'SHORT_ANSWER',
            defaultPointsPerQuestion: 0.5,
            gradingRuleDescription: '0,5 điểm / câu Trả lời ngắn',
          },
          {
            formatGroup: 'ESSAY',
            defaultPointsPerQuestion: 1.0,
            gradingRuleDescription: 'Chấm theo hướng dẫn chấm chi tiết Tự luận',
          },
        ],
      },
      {
        id: 'preset-th-tt27-viet',
        name: 'Cấu trúc Tổ Tiểu học Khối 4–5 (Tiếng Việt TT 27: 40-40-20)',
        departmentName: 'Tổ Chuyên môn Khối 4–5',
        createdAt: '2026-09-10',
        levelId: 'PRIMARY' as any,
        grade: 4,
        subject: 'Tiếng Việt',
        templateCode: 'TEMPLATE_C_PRIMARY_APPROVED',
        activeFormatGroups: ['MCQ', 'SHORT_ANSWER', 'ESSAY'],
        targetLevelPercentages: { BIET: 40, HIEU: 40, VAN_DUNG: 20 },
        scoringRules: [
          {
            formatGroup: 'MCQ',
            defaultPointsPerQuestion: 0.5,
            gradingRuleDescription: '0,5 điểm / câu trắc nghiệm đọc hiểu',
          },
          {
            formatGroup: 'TRUE_FALSE',
            defaultPointsPerQuestion: 0.5,
            gradingRuleDescription: '0,5 điểm / câu',
          },
          {
            formatGroup: 'SHORT_ANSWER',
            defaultPointsPerQuestion: 1.0,
            gradingRuleDescription: '1,0 điểm / câu Luyện từ và câu',
          },
          {
            formatGroup: 'ESSAY',
            defaultPointsPerQuestion: 2.0,
            gradingRuleDescription: '2,0 điểm / câu Viết đoạn văn sáng tạo',
          },
        ],
      },
    ];
    return this.readJson<SavedDepartmentMatrixPreset[]>(
      STORAGE_KEYS.DEPARTMENT_MATRIX_PRESETS,
      defaultPresets
    );
  }

  saveDepartmentMatrixPreset(
    presetInput: Omit<SavedDepartmentMatrixPreset, 'id' | 'createdAt'>
  ): SavedDepartmentMatrixPreset {
    const presets = this.getDepartmentMatrixPresets();
    const created: SavedDepartmentMatrixPreset = {
      ...presetInput,
      id: `preset-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [created, ...presets];
    this.writeJson(STORAGE_KEYS.DEPARTMENT_MATRIX_PRESETS, updated);
    return created;
  }

  deleteDepartmentMatrixPreset(id: string): void {
    const presets = this.getDepartmentMatrixPresets().filter((p) => p.id !== id);
    this.writeJson(STORAGE_KEYS.DEPARTMENT_MATRIX_PRESETS, presets);
  }

  getExams(): ExamPaper[] {
    const list = this.readJson<ExamPaper[]>(STORAGE_KEYS.EXAMS, []);
    const clean = list.filter((e) => !isSampleOrDemoExam(e));
    if (clean.length !== list.length) {
      this.centralStore.set(STORAGE_KEYS.EXAMS, clean);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(clean));
        } catch {
          // ignore
        }
      }
    }
    return clean;
  }

  purgeSampleMatricesAndExams(): { removedMatrices: number; removedExams: number } {
    const rawMatrices = this.readJson<ExamMatrix[]>(STORAGE_KEYS.MATRICES, []);
    const rawExams = this.readJson<ExamPaper[]>(STORAGE_KEYS.EXAMS, []);
    const cleanMatrices = rawMatrices.filter((m) => !isSampleOrDemoMatrix(m));
    const cleanExams = rawExams.filter((e) => !isSampleOrDemoExam(e));
    const removedMatrices = rawMatrices.length - cleanMatrices.length;
    const removedExams = rawExams.length - cleanExams.length;

    this.writeJson(STORAGE_KEYS.MATRICES, cleanMatrices);
    this.writeJson(STORAGE_KEYS.EXAMS, cleanExams);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.MATRICES, JSON.stringify(cleanMatrices));
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(cleanExams));
      } catch {
        // ignore
      }
    }

    return { removedMatrices, removedExams };
  }

  purgeSampleQuestions(): number {
    const rawQuestions = this.readJson<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, []);
    const cleanQuestions = rawQuestions.filter(
      (q) => !isSampleOrDemoQuestion(q)
    );
    const removedQuestions = rawQuestions.length - cleanQuestions.length;

    this.writeJson(STORAGE_KEYS.QUESTIONS, cleanQuestions);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEYS.QUESTIONS,
          JSON.stringify(cleanQuestions)
        );
      } catch {
        // ignore
      }
    }
    return removedQuestions;
  }

  purgeSampleTopics(): number {
    const officialSeedTopics = SEED_CURRICULUM_TOPICS.filter((t) => !t.isSampleData);
    const rawTopics = this.readJson<CurriculumTopic[]>(
      STORAGE_KEYS.TOPICS,
      officialSeedTopics
    );
    const cleanTopics = rawTopics.filter((t) => !t.isSampleData);
    const removedTopics = rawTopics.length - cleanTopics.length;
    this.writeJson(STORAGE_KEYS.TOPICS, cleanTopics);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(cleanTopics));
      } catch {
        // ignore
      }
    }
    return removedTopics;
  }

  addExam(examInput: Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>): ExamPaper {
    const exams = this.getExams();
    const levelPrefix = examInput.levelId === 'PRIMARY' ? 'TH' : 'THCS';
    const nextNumber = String(exams.length + 1).padStart(2, '0');
    const today = new Date().toISOString().slice(0, 10);
    const nowTimestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newExam: ExamPaper = {
      ...examInput,
      id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: `ĐỀ-${levelPrefix}-K${examInput.grade}-${nextNumber}`,
      statusHistory: examInput.statusHistory || [
        {
          status: examInput.status,
          changedAt: nowTimestamp,
          actorName: examInput.authorName || 'Giáo viên Bộ môn',
          note: 'Khởi tạo đề kiểm tra từ Ma trận đã phê duyệt',
        },
      ],
      createdAt: today,
      updatedAt: today,
    };
    const updated = [newExam, ...exams];
    this.writeJson(STORAGE_KEYS.EXAMS, updated);

    // Ghi nhận lịch sử sử dụng vào các câu hỏi được đưa vào đề
    const questions = this.getQuestions().map((q) => {
      if (!newExam.questionIds.includes(q.id)) return q;
      const history = q.usageHistory || [];
      return {
        ...q,
        usageHistory: [
          {
            examId: newExam.id,
            examCode: newExam.code,
            examTitle: newExam.title,
            examPeriod: newExam.examPeriod,
            usedDate: today,
            isOfficialExam:
              newExam.status === ApprovalStatus.APPROVED ||
              newExam.status === ApprovalStatus.PUBLISHED,
          },
          ...history.filter((h) => h.examId !== newExam.id),
        ],
      };
    });
    this.writeJson(STORAGE_KEYS.QUESTIONS, questions);

    return newExam;
  }

  updateExam(
    examId: string,
    updates: Partial<Omit<ExamPaper, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion = false,
    editorNote?: string
  ): ExamPaper | null {
    const exams = this.getExams();
    const idx = exams.findIndex((e) => e.id === examId);
    if (idx === -1) return null;

    const existing = exams[idx];
    const today = new Date().toISOString().slice(0, 10);
    const nowTimestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const isLockedOrApproved =
      Boolean(existing.isLocked) ||
      existing.status === ApprovalStatus.APPROVED ||
      existing.status === ApprovalStatus.PUBLISHED ||
      existing.status === ApprovalStatus.ARCHIVED;

    const isExamContentModified =
      (updates.title !== undefined && updates.title !== existing.title) ||
      updates.questionIds !== undefined ||
      updates.variants !== undefined ||
      (updates.durationMinutes !== undefined &&
        updates.durationMinutes !== existing.durationMinutes);

    // QUY TẮC MỤC VIII: Đề đã duyệt không thể sửa trực tiếp; chỉnh sửa sau phê duyệt bắt buộc tạo phiên bản mới!
    if ((isLockedOrApproved && isExamContentModified) || forceNewVersion) {
      const nextVersion = (existing.version || 1) + 1;
      const baseCode = existing.code.replace(/-v\d+$/i, '');
      const newStatus = updates.status || ApprovalStatus.DRAFT;
      const newVersionExam: ExamPaper = {
        ...existing,
        ...updates,
        id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: `${baseCode}-v${nextVersion}`,
        version: nextVersion,
        parentExamId: existing.id,
        status: newStatus,
        isLocked: false,
        statusHistory: [
          {
            status: newStatus,
            changedAt: nowTimestamp,
            actorName: updates.authorName || existing.authorName || 'Giáo viên ra đề',
            note:
              editorNote ||
              `Tách phiên bản mới v${nextVersion} từ đề đã phê duyệt (${existing.code}) để chỉnh sửa mà không ghi đè đề gốc đã khóa.`,
          },
          ...(existing.statusHistory || []),
        ],
        createdAt: today,
        updatedAt: today,
        isSampleData: false,
      };
      const updatedList = [newVersionExam, ...exams];
      this.writeJson(STORAGE_KEYS.EXAMS, updatedList);
      return newVersionExam;
    }

    const updatedExam: ExamPaper = {
      ...existing,
      ...updates,
      updatedAt: today,
    };
    exams[idx] = updatedExam;
    this.writeJson(STORAGE_KEYS.EXAMS, exams);
    return updatedExam;
  }

  updateExamApproval(
    examId: string,
    status: ApprovalStatus,
    reviewerName: string,
    reviewComment: string
  ): ExamPaper | null {
    const exams = this.getExams();
    const idx = exams.findIndex((e) => e.id === examId);
    if (idx === -1) return null;

    const today = new Date().toISOString().slice(0, 10);
    const nowTimestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const prevHistory = exams[idx].statusHistory || [];
    const shouldLock =
      status === ApprovalStatus.APPROVED ||
      status === ApprovalStatus.PUBLISHED ||
      status === ApprovalStatus.ARCHIVED;

    const updatedExam: ExamPaper = {
      ...exams[idx],
      status,
      isLocked: shouldLock ? true : exams[idx].isLocked,
      reviewerName,
      reviewComment,
      statusHistory: [
        {
          status,
          changedAt: nowTimestamp,
          actorName: reviewerName || 'Hội đồng Khảo thí',
          note: reviewComment,
        },
        ...prevHistory,
      ],
      updatedAt: today,
    };
    exams[idx] = updatedExam;
    this.writeJson(STORAGE_KEYS.EXAMS, exams);

    // Nếu đề được phê duyệt chính thức (APPROVED) hoặc Đã phát hành (PUBLISHED), cập nhật trạng thái isOfficialExam = true trong lịch sử câu hỏi
    if (status === ApprovalStatus.APPROVED || status === ApprovalStatus.PUBLISHED) {
      const questions = this.getQuestions().map((q) => {
        if (!updatedExam.questionIds.includes(q.id)) return q;
        const existingHistory = q.usageHistory || [];
        const hasRecord = existingHistory.some((h) => h.examId === updatedExam.id);
        const nextHistory = hasRecord
          ? existingHistory.map((h) =>
              h.examId === updatedExam.id ? { ...h, isOfficialExam: true } : h
            )
          : [
              {
                examId: updatedExam.id,
                examCode: updatedExam.code,
                examTitle: updatedExam.title,
                examPeriod: updatedExam.examPeriod,
                usedDate: today,
                isOfficialExam: true,
              },
              ...existingHistory,
            ];
        return {
          ...q,
          usageHistory: nextHistory,
        };
      });
      this.writeJson(STORAGE_KEYS.QUESTIONS, questions);
    }

    return updatedExam;
  }

  resetToDefaultSeedData(): void {
    this.writeJson(STORAGE_KEYS.TOPICS, SEED_CURRICULUM_TOPICS);
    this.writeJson(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    this.writeJson(STORAGE_KEYS.QUESTION_GROUPS, SEED_QUESTION_GROUPS);
    this.writeJson(STORAGE_KEYS.MATRICES, SEED_MATRICES);
    this.writeJson(STORAGE_KEYS.EXAMS, SEED_EXAMS);
    this.writeJson(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.QUESTION_DRAFT);
  }
}

export const dataRepository: IDataRepository = new LocalStorageRepository();

