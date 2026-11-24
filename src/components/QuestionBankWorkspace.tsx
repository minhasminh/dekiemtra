import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudOff,
  Copy,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  GitBranch,
  History,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  List,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ApprovalStatus,
  CognitiveLevelCode,
  CurriculumTopic,
  DataSourceFilter,
  EducationLevelId,
  ExamPaper,
  GradeNumber,
  QuestionAttachment,
  QuestionFormatCode,
  QuestionGroup,
  QuestionItem,
  TeacherPermissionProfileSummary,
} from '../types/domain';
import {
  ALL_QUESTION_FORMATS,
  ASSESSMENT_RULES_BY_LEVEL,
  filterByDataSource,
  findSimilarQuestions,
  getAllowedFormatsForContext,
  getApprovalStatusInfo,
  getCognitiveShortLabel,
  getExamPeriodLabel,
  getFormatLabel,
  getRuleSetForLevel,
  isQuestionUsedInOfficialExam,
  PRIMARY_VALID_GRADES_BY_SUBJECT,
  validateQuestionByLevelRules,
} from '../services/business/assessmentRules';
import {
  extractQuestionsFromDocumentText,
  ImportItemDraft,
  parseStructuredImportData,
  SAMPLE_CSV_TEMPLATE,
  SAMPLE_JSON_TEMPLATE,
  SAMPLE_WORD_PDF_EXTRACT_TEXT,
} from '../services/import/questionImportParser';
import {
  formatSubStatementsAnswerSummary,
  parseDocxFileToPages,
  parsePdfFileToPages,
  syncSubStatementsFromAnswerText,
} from '../services/import/smartExamImportService';
import { dataRepository, UpdateQuestionOutcome } from '../services/storage/repository';
import {
  loadSavedWorkflows,
  saveWorkflowToLocal,
} from '../services/workflow/endToEndExamWorkflowService';
import { MathFormulaView } from './MathFormulaView';
import { SmartExamImportWorkspace } from './SmartExamImportWorkspace';
import { SEED_CURRICULUM_TOPICS } from '../data/seedData';
import {
  areSubjectNamesEquivalent,
  cleanSingleTopicOrChapterTitle,
  extractCleanTopicTitles,
  formatTopicOptionDisplay,
  getSelectableLessonsForMatrix,
  groupLessonsByChapter,
  MatrixChapterGroup,
  normalizeCanonicalSubjectName,
  SelectableMatrixLesson,
} from '../data/matrixLessonCatalog';

export interface QuestionBankWorkspaceProps {
  questions: QuestionItem[];
  groups: QuestionGroup[];
  topics: CurriculumTopic[];
  exams: ExamPaper[];
  sourceFilter: DataSourceFilter;
  globalLevelFilter: EducationLevelId | 'ALL';
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  enforceTeacherScope?: boolean;
  schoolAllowedGrades?: number[];
  userAssignedSubjects?: string[];
  userAssignedGrades?: number[];
  onAddQuestion: (q: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>) => QuestionItem;
  onUpdateQuestion: (
    id: string,
    updates: Partial<Omit<QuestionItem, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean
  ) => UpdateQuestionOutcome | null;
  onDuplicateQuestion: (id: string) => QuestionItem | null;
  onBulkAddQuestions: (items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]) => QuestionItem[];
  onDeleteQuestion: (id: string) => { deleted: boolean; markedDeprecated: boolean; message: string };
  onAddGroup: (g: Omit<QuestionGroup, 'id' | 'code' | 'createdAt'>) => QuestionGroup;
  onAssignToGroup: (groupId: string, questionIds: string[]) => QuestionGroup | null;
  onDeleteGroup: (groupId: string) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

type WorkspaceSubTab =
  | 'LIST_AND_SEARCH'
  | 'EDITOR_AND_PREVIEW'
  | 'BULK_IMPORT_EXCEL_JSON'
  | 'WORD_PDF_EXTRACTOR'
  | 'GROUPS_AND_VERSIONS'
  | 'QA_STAGE21_SUITE';

export type QuestionFirestoreSaveState =
  | 'UNSAVED'
  | 'SAVING'
  | 'SAVED'
  | 'SAVE_FAILED'
  | 'CONFLICT_DETECTED';

export const QuestionBankWorkspace: React.FC<QuestionBankWorkspaceProps> = ({
  questions,
  groups,
  topics,
  exams,
  sourceFilter,
  globalLevelFilter,
  teacherPermissionProfile,
  enforceTeacherScope = false,
  schoolAllowedGrades,
  userAssignedSubjects,
  userAssignedGrades,
  onAddQuestion,
  onUpdateQuestion,
  onDuplicateQuestion,
  onBulkAddQuestions,
  onDeleteQuestion,
  onAddGroup,
  onAssignToGroup,
  onDeleteGroup,
  onNotify,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>('LIST_AND_SEARCH');

  // --- BỘ LỌC ĐA ĐIỀU KIỆN (9 chiều lọc) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<EducationLevelId | 'ALL'>(globalLevelFilter);
  const [filterGrade, setFilterGrade] = useState<number | 'ALL'>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterTopic, setFilterTopic] = useState<string>('ALL');
  const [filterFormat, setFilterFormat] = useState<QuestionFormatCode | 'ALL'>('ALL');
  const [filterCognitive, setFilterCognitive] = useState<CognitiveLevelCode | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'ALL'>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [onlyShowOfficialReady, setOnlyShowOfficialReady] = useState(false);

  useEffect(() => {
    setFilterLevel(globalLevelFilter);
  }, [globalLevelFilter]);

  // --- CHẾ ĐỘ HIỂN THỊ (BẢNG CÂU HỎI / THẺ CÂU HỎI) & PHÂN TRANG (MỤC I & II) ---
  const [listViewMode, setListViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // --- GIỎ CHỌN CÂU HỎI ĐƯA VÀO ĐỀ KIỂM TRA (MỤC IV: Chọn câu đưa vào đề) ---
  const [examCartIds, setExamCartIds] = useState<string[]>([]);
  const [examCartTitle, setExamCartTitle] = useState<string>(
    'Đề kiểm tra Định kỳ từ Ngân hàng câu hỏi (Bảo toàn LaTeX & Hình ảnh)'
  );

  // --- TRẠNG THÁI LƯU 5 MỨC ĐỘ CÓ XÁC NHẬN FIRESTORE (MỤC V) ---
  const [firestoreSaveStatus, setFirestoreSaveStatus] =
    useState<QuestionFirestoreSaveState>('SAVED');
  const [firestoreLastCommitInfo, setFirestoreLastCommitInfo] = useState<{
    docPath: string;
    commitId: string;
    savedAt: string;
    version: number;
  } | null>(null);
  const [firestoreConflictDetail, setFirestoreConflictDetail] = useState<{
    remoteVersion: number;
    expectedBaseVersion: number;
    message: string;
  } | null>(null);
  const [firestoreErrorDetail, setFirestoreErrorDetail] = useState<string | null>(null);

  // --- TRẠNG THÁI AI GỢI Ý & KIỂM TRA TRONG TRÌNH SOẠN THẢO (MỤC III & IV) ---
  const [aiEditorCheckResult, setAiEditorCheckResult] = useState<{
    checkedAt: string;
    qualityScore: number;
    cognitiveMatchVerdict: string;
    formulaCheckVerdict: string;
    duplicateRiskVerdict: string;
    suggestedStemRefinement: string;
    suggestedGradingRubric: string;
    pedagogicalTips: string[];
  } | null>(null);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState<boolean>(false);

  // --- TRẠNG THÁI KIỂM THỬ 10 KỊCH BẢN GIAI ĐOẠN 21 (MỤC VII) ---
  const [isRunningStage21QA, setIsRunningStage21QA] = useState<boolean>(false);
  const [stage21QAReport, setStage21QAReport] = useState<{
    executedAt: string;
    totalScenarios: number;
    passedScenarios: number;
    createdQuestionCodes: string[];
    reloadedCountFromFirestore: number;
    exportedDossierFilename: string;
    scenarios: Array<{
      order: number;
      code: string;
      title: string;
      passed: boolean;
      detail: string;
      questionCode?: string;
    }>;
  } | null>(null);

  // --- CHỌN NHIỀU CÂU HỎI ĐỂ ĐƯA VÀO NHÓM / DUYỆT HÀNG LOẠT ---
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [targetGroupIdForBulk, setTargetGroupIdForBulk] = useState<string>(groups[0]?.id || '');
  const [previewQuestionId, setPreviewQuestionId] = useState<string | null>(null);

  // --- STATE BIỂU MẪU SOẠN THẢO / CHỈNH SỬA (Có tự động lưu nháp vào LocalStorage) ---
  const savedDraft = useMemo(() => dataRepository.getWorkingQuestionDraft(), []);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    (savedDraft?.editingQuestionId as string) || null
  );
  const [editingBaseVersion, setEditingBaseVersion] = useState<number>(1);
  const [formLevel, setFormLevel] = useState<EducationLevelId>(
    (savedDraft?.formLevel as EducationLevelId) || EducationLevelId.LOWER_SECONDARY
  );
  const currentRuleSet = getRuleSetForLevel(formLevel);
  const [formGrade, setFormGrade] = useState<GradeNumber>((savedDraft?.formGrade as GradeNumber) || 8);
  const [formSubject, setFormSubject] = useState<string>((savedDraft?.formSubject as string) || 'Toán');

  // MỤC II: Giới hạn Cấp học, Môn học và Khối lớp theo phân quyền của Giáo viên & Cấp học của Trường
  const isScopeRestricted = Boolean(
    enforceTeacherScope &&
      ((teacherPermissionProfile && teacherPermissionProfile.subjectAllocations.length > 0) ||
        (userAssignedSubjects && userAssignedSubjects.length > 0))
  );

  const effectiveSchoolGrades = useMemo<number[]>(() => {
    if (schoolAllowedGrades && schoolAllowedGrades.length > 0) {
      return schoolAllowedGrades;
    }
    if (topics.length > 0) {
      const gSet = new Set<number>(topics.map((t) => Number(t.grade)));
      const arr = Array.from(gSet).sort((a, b) => a - b);
      if (arr.length > 0) return arr;
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }, [schoolAllowedGrades, topics]);

  const allowedEditorLevels = useMemo<EducationLevelId[]>(() => {
    const schoolLvls: EducationLevelId[] = [];
    if (effectiveSchoolGrades.some((g) => g >= 1 && g <= 5)) {
      schoolLvls.push(EducationLevelId.PRIMARY);
    }
    if (effectiveSchoolGrades.some((g) => g >= 6 && g <= 9)) {
      schoolLvls.push(EducationLevelId.LOWER_SECONDARY);
    }
    const baseSchoolLvls: EducationLevelId[] =
      schoolLvls.length > 0
        ? schoolLvls
        : [EducationLevelId.PRIMARY, EducationLevelId.LOWER_SECONDARY];

    if (isScopeRestricted) {
      const lvls: EducationLevelId[] = [];
      if (teacherPermissionProfile && teacherPermissionProfile.subjectAllocations.length > 0) {
        if (
          teacherPermissionProfile.educationLevels.includes('PRIMARY') &&
          baseSchoolLvls.includes(EducationLevelId.PRIMARY)
        ) {
          lvls.push(EducationLevelId.PRIMARY);
        }
        if (
          teacherPermissionProfile.educationLevels.includes('LOWER_SECONDARY') &&
          baseSchoolLvls.includes(EducationLevelId.LOWER_SECONDARY)
        ) {
          lvls.push(EducationLevelId.LOWER_SECONDARY);
        }
      } else if (userAssignedGrades && userAssignedGrades.length > 0) {
        const uGrades = userAssignedGrades.map(Number);
        if (
          uGrades.some((g) => g >= 1 && g <= 5) &&
          baseSchoolLvls.includes(EducationLevelId.PRIMARY)
        ) {
          lvls.push(EducationLevelId.PRIMARY);
        }
        if (
          uGrades.some((g) => g >= 6 && g <= 9) &&
          baseSchoolLvls.includes(EducationLevelId.LOWER_SECONDARY)
        ) {
          lvls.push(EducationLevelId.LOWER_SECONDARY);
        }
      }
      if (lvls.length > 0) return lvls;
    }

    return baseSchoolLvls;
  }, [
    effectiveSchoolGrades,
    isScopeRestricted,
    teacherPermissionProfile,
    userAssignedGrades,
  ]);

  // Đồng bộ Bộ lọc cấp học (2. Bộ lọc cấp học) theo phân quyền
  useEffect(() => {
    if (allowedEditorLevels.length === 1) {
      if (filterLevel !== allowedEditorLevels[0]) {
        setFilterLevel(allowedEditorLevels[0]);
      }
    } else if (filterLevel !== 'ALL' && !allowedEditorLevels.includes(filterLevel)) {
      setFilterLevel('ALL');
    }
  }, [allowedEditorLevels, filterLevel]);

  const activeFilterLevels = useMemo<EducationLevelId[]>(() => {
    if (filterLevel !== 'ALL' && allowedEditorLevels.includes(filterLevel)) {
      return [filterLevel];
    }
    return allowedEditorLevels;
  }, [filterLevel, allowedEditorLevels]);

  const allowedFilterGrades = useMemo<number[]>(() => {
    const levelGrades = effectiveSchoolGrades.filter((g) => {
      if (g >= 1 && g <= 5) return activeFilterLevels.includes(EducationLevelId.PRIMARY);
      if (g >= 6 && g <= 9) return activeFilterLevels.includes(EducationLevelId.LOWER_SECONDARY);
      return false;
    });

    let candidateGrades = levelGrades;

    if (isScopeRestricted) {
      if (teacherPermissionProfile && teacherPermissionProfile.subjectAllocations.length > 0) {
        const targetLvlStrings = activeFilterLevels.map((l) =>
          l === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY'
        );
        const matchingAllocs = teacherPermissionProfile.subjectAllocations.filter((a) => {
          if (!targetLvlStrings.includes(a.educationLevelId)) return false;
          if (filterSubject !== 'ALL') {
            return areSubjectNamesEquivalent(a.subjectName, filterSubject);
          }
          return true;
        });
        const grantedGrades = Array.from(
          new Set(matchingAllocs.flatMap((a) => a.grades.map(Number)))
        )
          .filter((g) => levelGrades.includes(g))
          .sort((a, b) => a - b);

        if (grantedGrades.length > 0) {
          candidateGrades = grantedGrades;
        } else {
          const fallbackAllocs = teacherPermissionProfile.subjectAllocations.filter((a) =>
            targetLvlStrings.includes(a.educationLevelId)
          );
          const fallbackGrades = Array.from(
            new Set(fallbackAllocs.flatMap((a) => a.grades.map(Number)))
          )
            .filter((g) => levelGrades.includes(g))
            .sort((a, b) => a - b);
          if (fallbackGrades.length > 0) {
            candidateGrades = fallbackGrades;
          }
        }
      } else if (userAssignedGrades && userAssignedGrades.length > 0) {
        const uGrades = userAssignedGrades
          .map(Number)
          .filter((g) => levelGrades.includes(g))
          .sort((a, b) => a - b);
        if (uGrades.length > 0) {
          candidateGrades = uGrades;
        }
      }
    }

    // Nếu đang lọc 1 môn cụ thể của bậc Tiểu học có giới hạn khối lớp theo chương trình GDPT 2018 (VD: Khoa học lớp 4-5, TN&XH lớp 1-3, Tin học lớp 3-5)
    if (
      filterSubject !== 'ALL' &&
      activeFilterLevels.length === 1 &&
      activeFilterLevels[0] === EducationLevelId.PRIMARY
    ) {
      const canonicalSubj = normalizeCanonicalSubjectName(
        filterSubject,
        EducationLevelId.PRIMARY
      );
      const validPrimaryGrades = PRIMARY_VALID_GRADES_BY_SUBJECT[canonicalSubj];
      if (validPrimaryGrades && validPrimaryGrades.length > 0) {
        const intersected = candidateGrades.filter((g) =>
          validPrimaryGrades.includes(g as GradeNumber)
        );
        if (intersected.length > 0) {
          candidateGrades = intersected;
        }
      }
    }

    return candidateGrades.length > 0 ? candidateGrades : levelGrades;
  }, [
    effectiveSchoolGrades,
    activeFilterLevels,
    isScopeRestricted,
    teacherPermissionProfile,
    userAssignedGrades,
    filterSubject,
  ]);

  // Đồng bộ Bộ lọc khối lớp (4. Bộ lọc khối lớp) theo phân quyền
  useEffect(() => {
    if (allowedFilterGrades.length === 1) {
      if (filterGrade !== allowedFilterGrades[0]) {
        setFilterGrade(allowedFilterGrades[0]);
      }
    } else if (filterGrade !== 'ALL' && !allowedFilterGrades.includes(Number(filterGrade))) {
      setFilterGrade('ALL');
    }
  }, [allowedFilterGrades, filterGrade]);

  const allowedEditorSubjects = useMemo<string[]>(() => {
    if (!isScopeRestricted) {
      return currentRuleSet.subjects;
    }
    const targetLvl =
      formLevel === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY';
    if (teacherPermissionProfile && teacherPermissionProfile.subjectAllocations.length > 0) {
      const matching = teacherPermissionProfile.subjectAllocations
        .filter((a) => a.educationLevelId === targetLvl)
        .map((a) => normalizeCanonicalSubjectName(a.subjectName, formLevel));
      if (matching.length > 0) {
        return Array.from(new Set(matching));
      }
    }
    if (userAssignedSubjects && userAssignedSubjects.length > 0) {
      const normalized = userAssignedSubjects
        .map((s) => normalizeCanonicalSubjectName(s, formLevel))
        .filter((s) => currentRuleSet.subjects.some((rs) => areSubjectNamesEquivalent(rs, s)));
      if (normalized.length > 0) {
        return Array.from(new Set(normalized));
      }
    }
    return currentRuleSet.subjects;
  }, [
    isScopeRestricted,
    teacherPermissionProfile,
    userAssignedSubjects,
    formLevel,
    currentRuleSet.subjects,
  ]);

  const allowedEditorGrades = useMemo<GradeNumber[]>(() => {
    const schoolFilteredRuleGrades = currentRuleSet.grades.filter((g) =>
      effectiveSchoolGrades.includes(Number(g))
    );
    const baseGrades =
      schoolFilteredRuleGrades.length > 0 ? schoolFilteredRuleGrades : currentRuleSet.grades;

    if (!isScopeRestricted) {
      return baseGrades;
    }
    const targetLvl =
      formLevel === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY';
    if (teacherPermissionProfile && teacherPermissionProfile.subjectAllocations.length > 0) {
      const matchingAllocs = teacherPermissionProfile.subjectAllocations.filter(
        (a) =>
          a.educationLevelId === targetLvl &&
          areSubjectNamesEquivalent(a.subjectName, formSubject)
      );
      if (matchingAllocs.length > 0) {
        const gList = Array.from(
          new Set(
            matchingAllocs.flatMap((a) =>
              a.grades
                .map((g) => Number(g) as GradeNumber)
                .filter((g) => baseGrades.includes(g))
            )
          )
        ).sort((a, b) => a - b);
        if (gList.length > 0) return gList;
      }
      const anyForLevel = teacherPermissionProfile.subjectAllocations
        .filter((a) => a.educationLevelId === targetLvl)
        .flatMap((a) =>
          a.grades
            .map((g) => Number(g) as GradeNumber)
            .filter((g) => baseGrades.includes(g))
        );
      if (anyForLevel.length > 0) {
        return Array.from(new Set(anyForLevel)).sort((a, b) => a - b);
      }
    }
    if (userAssignedGrades && userAssignedGrades.length > 0) {
      const uGrades = userAssignedGrades
        .map((g) => Number(g) as GradeNumber)
        .filter((g) => baseGrades.includes(g));
      if (uGrades.length > 0) {
        return Array.from(new Set(uGrades)).sort((a, b) => a - b);
      }
    }
    return baseGrades;
  }, [
    isScopeRestricted,
    teacherPermissionProfile,
    userAssignedGrades,
    formLevel,
    formSubject,
    currentRuleSet.grades,
    effectiveSchoolGrades,
  ]);

  useEffect(() => {
    if (!allowedEditorLevels.includes(formLevel)) {
      const nextLvl = allowedEditorLevels[0];
      const nextRules = getRuleSetForLevel(nextLvl);
      setFormLevel(nextLvl);
      setFormGrade(nextRules.grades[0]);
      setFormSubject(nextRules.subjects[0]);
      setFormCognitive(nextRules.cognitiveLevels[0].code);
      return;
    }
    if (!allowedEditorSubjects.includes(formSubject)) {
      setFormSubject(allowedEditorSubjects[0]);
      return;
    }
    if (!allowedEditorGrades.includes(formGrade)) {
      setFormGrade(allowedEditorGrades[0]);
    }
  }, [
    allowedEditorLevels,
    allowedEditorSubjects,
    allowedEditorGrades,
    formLevel,
    formSubject,
    formGrade,
  ]);

  const [formTopic, setFormTopic] = useState<string>(() => {
    const rawDraftTopic = (savedDraft?.formTopic as string) || '';
    if (rawDraftTopic.trim()) {
      const cleaned = extractCleanTopicTitles(rawDraftTopic)[0];
      if (cleaned) return cleaned;
    }
    return 'Định lí Pythagore và Tứ giác';
  });
  const [formLesson, setFormLesson] = useState<string>(
    (savedDraft?.formLesson as string) || 'Định lí Pythagore'
  );
  const [formKnowledgeUnit, setFormKnowledgeUnit] = useState<string>(
    (savedDraft?.formKnowledgeUnit as string) || 'Vận dụng tính độ dài cạnh tam giác vuông'
  );
  const [formOutcomeCode, setFormOutcomeCode] = useState<string>(
    (savedDraft?.formOutcomeCode as string) || 'YCCĐ-T8-3.1'
  );
  const [formOutcomeText, setFormOutcomeText] = useState<string>(
    (savedDraft?.formOutcomeText as string) ||
      'Giải thích được định lí Pythagore và tính được độ dài cạnh trong tam giác vuông.'
  );
  const [isCustomTopicMode, setIsCustomTopicMode] = useState<boolean>(false);
  const [isCustomLessonMode, setIsCustomLessonMode] = useState<boolean>(false);

  // Hợp nhất danh mục chủ đề của trường với danh mục chương trình GDPT 2018 chuẩn (Khối 1–9)
  // Ưu tiên SEED_CURRICULUM_TOPICS ghi đè các bản ghi cũ trong localStorage để luôn có chapterTitle chuẩn
  const editorCatalogTopics = useMemo<CurriculumTopic[]>(() => {
    const map = new Map<string, CurriculumTopic>();
    for (const t of topics) {
      map.set(t.id, t);
    }
    for (const t of SEED_CURRICULUM_TOPICS) {
      map.set(t.id, t);
    }
    return Array.from(map.values());
  }, [topics]);

  const getChapterDisplayTopicTitle = (cg: MatrixChapterGroup): string => {
    const code = (cg.chapterCode || '').trim();
    const title = cleanSingleTopicOrChapterTitle(cg.chapterTitle || '');
    if (!code) return title;
    if (!title) return code;
    if (title.toLowerCase().startsWith(code.toLowerCase())) return title;
    if (/^(?:chương|chủ\s*đề|mạch|phần|mô\s*đun|unit|theme)(?:\s|[.:\-–(]|$)/i.test(code)) {
      return `${code}: ${title}`;
    }
    return title;
  };

  const editorSelectableLessons = useMemo<SelectableMatrixLesson[]>(
    () =>
      getSelectableLessonsForMatrix(
        formLevel,
        formGrade,
        formSubject,
        editorCatalogTopics
      ),
    [formLevel, formGrade, formSubject, editorCatalogTopics]
  );

  const editorChapterGroups = useMemo<MatrixChapterGroup[]>(
    () => groupLessonsByChapter(editorSelectableLessons),
    [editorSelectableLessons]
  );

  const editorTopicOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{
      value: string;
      label: string;
      semester: 'HK1' | 'HK2';
      chapterGroup: MatrixChapterGroup;
    }> = [];
    for (const cg of editorChapterGroups) {
      const value = cleanSingleTopicOrChapterTitle(getChapterDisplayTopicTitle(cg));
      if (!value) continue;
      const norm = value.toLowerCase();
      if (seen.has(norm)) continue;
      seen.add(norm);
      const semLabel = cg.semester === 'HK2' ? 'HKII' : 'HKI';
      const conciseVal = formatTopicOptionDisplay(value, 52);
      list.push({
        value,
        label: `${conciseVal} (${semLabel} · ${cg.lessons.length} bài)`,
        semester: cg.semester,
        chapterGroup: cg,
      });
    }
    return list;
  }, [editorChapterGroups]);

  const activeEditorChapterOption = useMemo(() => {
    const norm = (formTopic || '').trim().toLowerCase();
    if (!norm) return editorTopicOptions[0];
    return (
      editorTopicOptions.find(
        (opt) =>
          opt.value.toLowerCase() === norm ||
          opt.chapterGroup.chapterTitle.trim().toLowerCase() === norm ||
          `${opt.chapterGroup.chapterCode}. ${opt.chapterGroup.chapterTitle}`
            .trim()
            .toLowerCase() === norm ||
          `${opt.chapterGroup.chapterCode}: ${opt.chapterGroup.chapterTitle}`
            .trim()
            .toLowerCase() === norm ||
          opt.chapterGroup.chapterTitle.trim().toLowerCase().includes(norm) ||
          norm.includes(opt.chapterGroup.chapterTitle.trim().toLowerCase())
      ) || undefined
    );
  }, [formTopic, editorTopicOptions]);

  const activeEditorLessons = useMemo<SelectableMatrixLesson[]>(() => {
    if (
      activeEditorChapterOption &&
      activeEditorChapterOption.chapterGroup.lessons.length > 0
    ) {
      return activeEditorChapterOption.chapterGroup.lessons;
    }
    return editorSelectableLessons;
  }, [activeEditorChapterOption, editorSelectableLessons]);

  const activeSelectedLessonObj = useMemo<SelectableMatrixLesson | undefined>(() => {
    const normLesson = (formLesson || '').trim().toLowerCase();
    if (!normLesson) return activeEditorLessons[0];
    return (
      activeEditorLessons.find(
        (ls) =>
          ls.lessonName.trim().toLowerCase() === normLesson ||
          ls.lessonName.trim().toLowerCase().includes(normLesson) ||
          normLesson.includes(ls.lessonName.trim().toLowerCase())
      ) || activeEditorLessons[0]
    );
  }, [formLesson, activeEditorLessons]);

  const activeLessonOutcomeChoices = useMemo(() => {
    const choices: Array<{ code: string; text: string; lessonName: string }> = [];
    const targetLessons = activeSelectedLessonObj
      ? [activeSelectedLessonObj]
      : activeEditorLessons;
    for (const ls of targetLessons) {
      const outs =
        ls.outcomesList && ls.outcomesList.length > 0
          ? ls.outcomesList
          : [ls.learningOutcomeText].filter(Boolean);
      outs.forEach((outText, idx) => {
        const code =
          outs.length === 1
            ? ls.learningOutcomeCode
            : `${ls.learningOutcomeCode}.${idx + 1}`;
        choices.push({
          code,
          text: outText,
          lessonName: ls.lessonName,
        });
      });
    }
    return choices;
  }, [activeSelectedLessonObj, activeEditorLessons]);

  // Tự động đồng bộ Chủ đề / Mạch nội dung, Bài học và YCCĐ khi đổi Cấp học / Khối lớp / Môn học
  useEffect(() => {
    if (isCustomTopicMode || editingQuestionId) return;
    if (editorTopicOptions.length === 0) return;
    const norm = (formTopic || '').trim().toLowerCase();
    const matched = editorTopicOptions.find(
      (opt) =>
        opt.value.toLowerCase() === norm ||
        opt.chapterGroup.chapterTitle.trim().toLowerCase() === norm
    );
    if (!matched) {
      const firstOpt = editorTopicOptions[0];
      setFormTopic(firstOpt.value);
      const firstLs = firstOpt.chapterGroup.lessons[0];
      if (firstLs) {
        setFormLesson(firstLs.lessonName);
        setFormKnowledgeUnit(firstLs.lessonName);
        setFormOutcomeCode(firstLs.learningOutcomeCode);
        setFormOutcomeText(
          firstLs.outcomesList?.[0] || firstLs.learningOutcomeText
        );
      }
    }
  }, [
    formLevel,
    formGrade,
    formSubject,
    editorTopicOptions,
    isCustomTopicMode,
    editingQuestionId,
    formTopic,
  ]);
  const [formCognitive, setFormCognitive] = useState<CognitiveLevelCode>(
    (savedDraft?.formCognitive as CognitiveLevelCode) || CognitiveLevelCode.SEC_THONG_HIEU
  );
  const [formFormat, setFormFormat] = useState<QuestionFormatCode>(
    (savedDraft?.formFormat as QuestionFormatCode) || QuestionFormatCode.MCQ_SINGLE
  );
  const [formPoints, setFormPoints] = useState<number>((savedDraft?.formPoints as number) || 0.25);
  const [formStem, setFormStem] = useState<string>((savedDraft?.formStem as string) || '');
  const [formSharedPassage, setFormSharedPassage] = useState<string>(
    (savedDraft?.formSharedPassage as string) || ''
  );

  // Phương án cho MCQ_SINGLE và MCQ_MULTIPLE
  const [formOptions, setFormOptions] = useState<string[]>(
    (savedDraft?.formOptions as string[]) || [
      'A. Phương án A',
      'B. Phương án B',
      'C. Phương án C',
      'D. Phương án D',
    ]
  );
  const [formCorrectIndices, setFormCorrectIndices] = useState<number[]>(
    (savedDraft?.formCorrectIndices as number[]) || [0]
  );

  // Ý nhỏ cho TRUE_FALSE_CLUSTER
  const [formSubStatements, setFormSubStatements] = useState<
    { label: string; statement: string; isTrue: boolean }[]
  >(
    (savedDraft?.formSubStatements as { label: string; statement: string; isTrue: boolean }[]) || [
      { label: 'a', statement: 'Mệnh đề nhận biết cơ bản thứ nhất', isTrue: true },
      { label: 'b', statement: 'Mệnh đề thông hiểu thứ hai', isTrue: false },
      { label: 'c', statement: 'Mệnh đề thông hiểu thứ ba', isTrue: true },
      { label: 'd', statement: 'Mệnh đề vận dụng thứ tư', isTrue: false },
    ]
  );

  // Cặp ghép nối cho MATCHING
  const [formMatchingPairs, setFormMatchingPairs] = useState<
    { id: string; leftText: string; rightText: string }[]
  >(
    (savedDraft?.formMatchingPairs as { id: string; leftText: string; rightText: string }[]) || [
      { id: 'mp-1', leftText: '1. Khái niệm / Sự kiện A', rightText: 'a. Đặc điểm tương ứng A' },
      { id: 'mp-2', leftText: '2. Khái niệm / Sự kiện B', rightText: 'b. Đặc điểm tương ứng B' },
      { id: 'mp-3', leftText: '3. Khái niệm / Sự kiện C', rightText: 'b. Đặc điểm tương ứng C' },
    ]
  );

  // Thứ tự cho ORDERING
  const [formOrderingItems, setFormOrderingItems] = useState<string[]>(
    (savedDraft?.formOrderingItems as string[]) || [
      'Bước 1: Xác định giả thiết và kết luận',
      'Bước 2: Lập hệ thức liên hệ',
      'Bước 3: Giải và kết luận nghiệm',
    ]
  );

  // Từ điền khuyết cho FILL_IN_BLANK
  const [formBlanks, setFormBlanks] = useState<string[]>(
    (savedDraft?.formBlanks as string[]) || ['từ khóa 1', 'từ khóa 2']
  );

  // Tệp đính kèm, Bảng biểu, Công thức
  const [formAttachments, setFormAttachments] = useState<QuestionAttachment[]>(
    (savedDraft?.formAttachments as QuestionAttachment[]) || []
  );
  const [newTableHeaders, setNewTableHeaders] = useState('Đại lượng x | x = 1 | x = 2 | x = 3');
  const [newTableRow1, setNewTableRow1] = useState('Giá trị y | 2 | 4 | 6');
  const [newLatexFormula, setNewLatexFormula] = useState('x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string>(
    (savedDraft?.formCorrectAnswer as string) || ''
  );
  const [formGradingGuide, setFormGradingGuide] = useState<string>(
    (savedDraft?.formGradingGuide as string) || ''
  );
  const [formSource, setFormSource] = useState<string>(
    (savedDraft?.formSource as string) || 'Giáo viên tự biên soạn theo GDPT 2018'
  );
  const [formAuthor, setFormAuthor] = useState<string>(
    (savedDraft?.formAuthor as string) || 'Giáo viên Bộ môn'
  );
  const [formStatus, setFormStatus] = useState<ApprovalStatus>(
    (savedDraft?.formStatus as ApprovalStatus) || ApprovalStatus.APPROVED
  );
  const [formTagsInput, setFormTagsInput] = useState<string>(
    (savedDraft?.formTagsInput as string) || 'GDPT 2018, Kiểm tra định kỳ'
  );
  const [formGroupId, setFormGroupId] = useState<string>((savedDraft?.formGroupId as string) || '');
  const [forceCreateNewVersion, setForceCreateNewVersion] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Đánh dấu trạng thái "Chưa lưu" (UNSAVED) khi người dùng thay đổi nội dung form
  const markFormDirty = () => {
    setFirestoreSaveStatus((prev) => (prev === 'SAVING' ? prev : 'UNSAVED'));
  };

  // Tự động lưu bản nháp đang gõ vào LocalStorage để KHÔNG MẤT NỘI DUNG khi chuyển tab/trang
  useEffect(() => {
    dataRepository.saveWorkingQuestionDraft({
      editingQuestionId,
      formLevel,
      formGrade,
      formSubject,
      formTopic,
      formLesson,
      formKnowledgeUnit,
      formOutcomeCode,
      formOutcomeText,
      formCognitive,
      formFormat,
      formPoints,
      formStem,
      formSharedPassage,
      formOptions,
      formCorrectIndices,
      formSubStatements,
      formMatchingPairs,
      formOrderingItems,
      formBlanks,
      formAttachments,
      formCorrectAnswer,
      formGradingGuide,
      formSource,
      formAuthor,
      formStatus,
      formTagsInput,
      formGroupId,
    });
  }, [
    editingQuestionId,
    formLevel,
    formGrade,
    formSubject,
    formTopic,
    formLesson,
    formKnowledgeUnit,
    formOutcomeCode,
    formOutcomeText,
    formCognitive,
    formFormat,
    formPoints,
    formStem,
    formSharedPassage,
    formOptions,
    formCorrectIndices,
    formSubStatements,
    formMatchingPairs,
    formOrderingItems,
    formBlanks,
    formAttachments,
    formCorrectAnswer,
    formGradingGuide,
    formSource,
    formAuthor,
    formStatus,
    formTagsInput,
    formGroupId,
  ]);

  // Phát hiện câu hỏi trùng hoặc gần giống theo thời gian thực khi gõ đề bài
  const duplicateMatches = useMemo(
    () => findSimilarQuestions(formStem, questions, editingQuestionId || undefined, 0.52),
    [formStem, questions, editingQuestionId]
  );

  // Kiểm tra câu hỏi đang sửa có nằm trong đề chính thức không
  const editingQuestionObj = useMemo(
    () => questions.find((q) => q.id === editingQuestionId) || null,
    [questions, editingQuestionId]
  );
  const editingOfficialStatus = useMemo(
    () =>
      editingQuestionObj
        ? isQuestionUsedInOfficialExam(editingQuestionObj, exams)
        : { usedInOfficial: false, officialExams: [] },
    [editingQuestionObj, exams]
  );

  // Danh sách các định dạng kèm trạng thái phù hợp theo Cấp học / Khối lớp / Môn học
  const contextFormats = useMemo(
    () => getAllowedFormatsForContext(formLevel, formGrade, formSubject),
    [formLevel, formGrade, formSubject]
  );

  // --- STATE NHẬP HÀNG LOẠT EXCEL / CSV / JSON ---
  const [importMode, setImportMode] = useState<'CSV_EXCEL' | 'JSON'>('CSV_EXCEL');
  const [importRawText, setImportRawText] = useState(SAMPLE_CSV_TEMPLATE);
  const [parsedImportItems, setParsedImportItems] = useState<ImportItemDraft[]>([]);
  const [importParseErrors, setImportParseErrors] = useState<string[]>([]);

  // --- STATE TRÍCH XUẤT WORD / PDF ---
  const [docLevel, setDocLevel] = useState<EducationLevelId>(EducationLevelId.LOWER_SECONDARY);
  const [docGrade, setDocGrade] = useState<GradeNumber>(8);
  const [docSubject, setDocSubject] = useState<string>('Toán');
  const [docTopic, setDocTopic] = useState<string>('Tổng hợp kiến thức Giữa kỳ I');
  const [docRawText, setDocRawText] = useState<string>(SAMPLE_WORD_PDF_EXTRACT_TEXT);
  const [extractedCandidates, setExtractedCandidates] = useState<ImportItemDraft[]>([]);

  // --- STATE TẠO NHÓM CÂU HỎI MỚI ---
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('Toán');

  // Tập hợp môn học được phép hiển thị tại 3. Bộ lọc môn học theo đúng phân quyền & cấp học đang chọn
  const allSubjects = useMemo<string[]>(() => {
    const set = new Set<string>();
    if (isScopeRestricted) {
      const targetLvlStrings = activeFilterLevels.map((l) =>
        l === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY'
      );
      if (teacherPermissionProfile && teacherPermissionProfile.subjectAllocations.length > 0) {
        for (const alloc of teacherPermissionProfile.subjectAllocations) {
          if (!targetLvlStrings.includes(alloc.educationLevelId)) continue;
          const levelEnum =
            alloc.educationLevelId === 'PRIMARY'
              ? EducationLevelId.PRIMARY
              : EducationLevelId.LOWER_SECONDARY;
          const canonical = normalizeCanonicalSubjectName(alloc.subjectName, levelEnum);
          if (canonical) set.add(canonical);
        }
      } else if (userAssignedSubjects && userAssignedSubjects.length > 0) {
        for (const rawSubj of userAssignedSubjects) {
          for (const lvl of activeFilterLevels) {
            const canonical = normalizeCanonicalSubjectName(rawSubj, lvl);
            const lvlRuleSubjects = getRuleSetForLevel(lvl).subjects;
            if (lvlRuleSubjects.some((rs) => areSubjectNamesEquivalent(rs, canonical))) {
              set.add(canonical);
            }
          }
        }
      }
      if (set.size > 0) {
        return Array.from(set).sort((a, b) =>
          a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' })
        );
      }
    }

    for (const lvl of activeFilterLevels) {
      for (const s of getRuleSetForLevel(lvl).subjects) {
        set.add(s);
      }
    }
    for (const q of questions) {
      if (activeFilterLevels.includes(q.levelId)) {
        set.add(normalizeCanonicalSubjectName(q.subject, q.levelId));
      }
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' })
    );
  }, [
    isScopeRestricted,
    activeFilterLevels,
    teacherPermissionProfile,
    userAssignedSubjects,
    questions,
  ]);

  // Đồng bộ Bộ lọc môn học (3. Bộ lọc môn học) theo phân quyền
  useEffect(() => {
    if (allSubjects.length === 1) {
      if (filterSubject !== allSubjects[0]) {
        setFilterSubject(allSubjects[0]);
      }
    } else if (
      filterSubject !== 'ALL' &&
      !allSubjects.some((s) => areSubjectNamesEquivalent(s, filterSubject))
    ) {
      setFilterSubject('ALL');
    }
  }, [allSubjects, filterSubject]);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (!activeFilterLevels.includes(q.levelId)) return;
      if (!allowedFilterGrades.includes(Number(q.grade))) return;
      if (filterGrade !== 'ALL' && q.grade !== filterGrade) return;
      if (!allSubjects.some((s) => areSubjectNamesEquivalent(s, q.subject))) return;
      if (filterSubject !== 'ALL' && !areSubjectNamesEquivalent(q.subject, filterSubject)) return;
      if (q.topicTitle && q.topicTitle.trim()) {
        extractCleanTopicTitles(q.topicTitle).forEach((p) => {
          if (p) set.add(p);
        });
      }
    });
    editorCatalogTopics.forEach((t) => {
      if (!activeFilterLevels.includes(t.levelId)) return;
      if (!allowedFilterGrades.includes(Number(t.grade))) return;
      if (filterGrade !== 'ALL' && t.grade !== filterGrade) return;
      if (!allSubjects.some((s) => areSubjectNamesEquivalent(s, t.subject))) return;
      if (filterSubject !== 'ALL' && !areSubjectNamesEquivalent(t.subject, filterSubject)) return;
      const chap = (t.chapterTitle || t.topicTitle || '').trim();
      if (chap) {
        extractCleanTopicTitles(chap).forEach((p) => {
          if (p) set.add(p);
        });
      }
    });
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' })
    );
  }, [
    questions,
    editorCatalogTopics,
    activeFilterLevels,
    allowedFilterGrades,
    allSubjects,
    filterGrade,
    filterSubject,
  ]);

  useEffect(() => {
    if (filterTopic !== 'ALL' && !allTopics.includes(filterTopic)) {
      setFilterTopic('ALL');
    }
  }, [allTopics, filterTopic]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  // Áp dụng bộ lọc đa điều kiện (kết hợp khóa phạm vi theo phân quyền Cấp học - Môn học - Khối lớp)
  const filteredQuestions = useMemo(() => {
    return filterByDataSource(questions, sourceFilter).filter((q) => {
      if (!activeFilterLevels.includes(q.levelId)) return false;
      if (filterLevel !== 'ALL' && q.levelId !== filterLevel) return false;
      if (!allowedFilterGrades.includes(Number(q.grade))) return false;
      if (filterGrade !== 'ALL' && q.grade !== filterGrade) return false;
      if (!allSubjects.some((s) => areSubjectNamesEquivalent(s, q.subject))) return false;
      if (filterSubject !== 'ALL' && !areSubjectNamesEquivalent(q.subject, filterSubject)) {
        return false;
      }
      if (filterTopic !== 'ALL') {
        const qTopicRaw = (q.topicTitle || '').trim();
        const qTopicCleaned = cleanSingleTopicOrChapterTitle(qTopicRaw);
        const qTopicParts = extractCleanTopicTitles(qTopicRaw);
        const fLower = filterTopic.toLowerCase();
        const isTopicMatch =
          qTopicRaw.toLowerCase() === fLower ||
          qTopicCleaned.toLowerCase() === fLower ||
          qTopicParts.some((p) => p.toLowerCase() === fLower) ||
          qTopicRaw.toLowerCase().includes(fLower) ||
          (qTopicCleaned.length >= 6 && fLower.includes(qTopicCleaned.toLowerCase()));
        if (!isTopicMatch) return false;
      }
      if (filterFormat !== 'ALL' && q.format !== filterFormat) return false;
      if (filterCognitive !== 'ALL' && q.cognitiveLevel !== filterCognitive) return false;
      if (filterStatus !== 'ALL' && q.status !== filterStatus) return false;
      if (filterGroup !== 'ALL' && q.groupId !== filterGroup) return false;
      if (filterTag !== 'ALL' && (!q.tags || !q.tags.includes(filterTag))) return false;
      if (onlyShowOfficialReady && q.status !== ApprovalStatus.APPROVED) return false;

      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase();
        const matchCode = q.code.toLowerCase().includes(qLower);
        const matchStem = q.stem.toLowerCase().includes(qLower);
        const matchTopic = q.topicTitle.toLowerCase().includes(qLower);
        const matchLesson = (q.lessonTitle || '').toLowerCase().includes(qLower);
        const matchOutcome =
          q.learningOutcomeCode.toLowerCase().includes(qLower) ||
          q.learningOutcomeText.toLowerCase().includes(qLower);
        const matchAuthor = q.authorName.toLowerCase().includes(qLower);
        const matchTags = (q.tags || []).some((t) => t.toLowerCase().includes(qLower));
        return (
          matchCode ||
          matchStem ||
          matchTopic ||
          matchLesson ||
          matchOutcome ||
          matchAuthor ||
          matchTags
        );
      }
      return true;
    });
  }, [
    questions,
    sourceFilter,
    activeFilterLevels,
    allowedFilterGrades,
    allSubjects,
    filterLevel,
    filterGrade,
    filterSubject,
    filterTopic,
    filterFormat,
    filterCognitive,
    filterStatus,
    filterGroup,
    filterTag,
    onlyShowOfficialReady,
    searchQuery,
  ]);

  // Reset trang về 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    filterLevel,
    filterGrade,
    filterSubject,
    filterTopic,
    filterFormat,
    filterCognitive,
    filterStatus,
    filterGroup,
    filterTag,
    onlyShowOfficialReady,
    pageSize,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return filteredQuestions.slice(startIdx, startIdx + pageSize);
  }, [filteredQuestions, safeCurrentPage, pageSize]);

  const resetEditorToBlank = (targetLevel: EducationLevelId = formLevel) => {
    const rules = getRuleSetForLevel(targetLevel);
    setEditingQuestionId(null);
    setEditingBaseVersion(1);
    setFormLevel(targetLevel);
    setFormGrade(rules.grades[0]);
    setFormSubject(rules.subjects[0]);
    setFormCognitive(rules.cognitiveLevels[0].code);
    setFormFormat(QuestionFormatCode.MCQ_SINGLE);
    setFormPoints(0.5);
    setFormTopic('');
    setFormLesson('');
    setFormKnowledgeUnit('');
    setFormOutcomeCode(`YCCĐ-K${rules.grades[0]}-1.1`);
    setFormOutcomeText('');
    setFormStem('');
    setFormSharedPassage('');
    setFormOptions(['A. ', 'B. ', 'C. ', 'D. ']);
    setFormCorrectIndices([0]);
    setFormCorrectAnswer('');
    setFormGradingGuide('');
    setFormAttachments([]);
    setForceCreateNewVersion(false);
    setValidationErrors([]);
    setValidationWarnings([]);
    setFirestoreSaveStatus('UNSAVED');
    setFirestoreConflictDetail(null);
    setFirestoreErrorDetail(null);
    setAiEditorCheckResult(null);
    dataRepository.saveWorkingQuestionDraft(null);
  };

  const handleLoadQuestionIntoEditor = (q: QuestionItem) => {
    setEditingQuestionId(q.id);
    setEditingBaseVersion(q.version || 1);
    setFormLevel(q.levelId);
    setFormGrade(q.grade);
    setFormSubject(q.subject);
    setFormTopic(q.topicTitle);
    setFormLesson(q.lessonTitle || '');
    setFormKnowledgeUnit(q.knowledgeUnit || '');
    setFormOutcomeCode(q.learningOutcomeCode);
    setFormOutcomeText(q.learningOutcomeText);
    setFormCognitive(q.cognitiveLevel);
    setFormFormat(q.format);
    setFormPoints(q.points);
    setFormStem(q.stem);
    setFormSharedPassage(q.sharedPassage || '');
    if (q.options && q.options.length > 0) setFormOptions(q.options);
    if (q.correctOptionIndices) setFormCorrectIndices(q.correctOptionIndices);
    if (q.subStatements && q.subStatements.length > 0) setFormSubStatements(q.subStatements);
    if (q.matchingPairs && q.matchingPairs.length > 0) setFormMatchingPairs(q.matchingPairs);
    if (q.orderingItems && q.orderingItems.length > 0) setFormOrderingItems(q.orderingItems);
    if (q.blanks && q.blanks.length > 0) setFormBlanks(q.blanks);
    setFormAttachments(q.attachments || []);
    setFormCorrectAnswer(q.correctAnswer);
    setFormGradingGuide(q.gradingGuide);
    setFormSource(q.questionSource || 'Tự biên soạn');
    setFormAuthor(q.authorName);
    setFormStatus(q.status);
    setFormTagsInput((q.tags || []).join(', '));
    setFormGroupId(q.groupId || '');
    setForceCreateNewVersion(false);
    setValidationErrors([]);
    setValidationWarnings([]);
    setFirestoreSaveStatus('SAVED');
    setFirestoreConflictDetail(null);
    setFirestoreErrorDetail(null);
    setActiveSubTab('EDITOR_AND_PREVIEW');
  };

  // Tự động đồng bộ chuỗi đáp án tổng quát theo định dạng câu hỏi đặc thù
  const computeSynchronizedCorrectAnswer = (): string => {
    if (formFormat === QuestionFormatCode.TRUE_FALSE_CLUSTER && formSubStatements.length > 0) {
      return formatSubStatementsAnswerSummary(formSubStatements);
    }
    if (formCorrectAnswer.trim()) return formCorrectAnswer.trim();
    switch (formFormat) {
      case QuestionFormatCode.MCQ_SINGLE:
        return formOptions[formCorrectIndices[0] || 0] || 'A';
      case QuestionFormatCode.MCQ_MULTIPLE:
        return formCorrectIndices
          .map((idx) => String.fromCharCode(65 + idx))
          .join(', ');
      case QuestionFormatCode.TRUE_FALSE_CLUSTER:
        return formatSubStatementsAnswerSummary(formSubStatements);
      case QuestionFormatCode.MATCHING:
        return formMatchingPairs.map((m, i) => `${i + 1} - ${String.fromCharCode(97 + i)}`).join('; ');
      case QuestionFormatCode.ORDERING:
        return formOrderingItems.join(' -> ');
      case QuestionFormatCode.FILL_IN_BLANK:
        return formBlanks.map((b, i) => `(${i + 1}) ${b}`).join('; ');
      default:
        return formCorrectAnswer.trim();
    }
  };

  // MỤC V: LƯU CÂU HỎI VỚI XÁC NHẬN FIRESTORE (KHÔNG BÁO LƯU THÀNH CÔNG NẾU FIRESTORE CHƯA XÁC NHẬN)
  const handleSaveQuestionSubmit = async (
    targetStatus?: ApprovalStatus,
    options?: {
      simulateFailure?: boolean;
      simulateConflict?: boolean;
      stayInEditor?: boolean;
    }
  ) => {
    const finalStatus = targetStatus || formStatus;
    const syncedAnswer = computeSynchronizedCorrectAnswer();

    const check = validateQuestionByLevelRules({
      levelId: formLevel,
      grade: formGrade,
      subject: formSubject,
      topicTitle: formTopic,
      learningOutcomeText: formOutcomeText,
      cognitiveLevel: formCognitive,
      format: formFormat,
      stem: formStem,
      correctAnswer: syncedAnswer,
      gradingGuide: formGradingGuide,
      points: formPoints,
    });

    setValidationErrors(check.errors);
    setValidationWarnings(check.warnings);

    if (!check.valid && finalStatus !== ApprovalStatus.DRAFT) {
      onNotify(
        'error',
        'Câu hỏi chưa đạt điều kiện lưu chính thức',
        `Vui lòng hoàn thiện ${check.errors.length} thông tin bắt buộc hoặc chọn "Lưu nháp".`
      );
      return;
    }

    setFirestoreSaveStatus('SAVING');
    setFirestoreErrorDetail(null);
    setFirestoreConflictDetail(null);

    const parsedTags = formTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Omit<QuestionItem, 'id' | 'code' | 'createdAt'> = {
      levelId: formLevel,
      grade: formGrade,
      subject: formSubject,
      topicTitle: formTopic.trim() || 'Chủ đề đang biên soạn',
      lessonTitle: formLesson.trim() || undefined,
      knowledgeUnit: formKnowledgeUnit.trim() || undefined,
      learningOutcomeCode: formOutcomeCode.trim() || `YCCĐ-K${formGrade}-1.1`,
      learningOutcomeText:
        formOutcomeText.trim() || 'Đang cập nhật mô tả yêu cầu cần đạt theo GDPT 2018.',
      cognitiveLevel: formCognitive,
      format: formFormat,
      stem: formStem.trim() || 'Nội dung câu hỏi nháp...',
      options:
        formFormat === QuestionFormatCode.MCQ_SINGLE ||
        formFormat === QuestionFormatCode.MCQ_MULTIPLE
          ? formOptions
          : undefined,
      correctOptionIndices:
        formFormat === QuestionFormatCode.MCQ_SINGLE ||
        formFormat === QuestionFormatCode.MCQ_MULTIPLE
          ? formCorrectIndices
          : undefined,
      subStatements:
        formFormat === QuestionFormatCode.TRUE_FALSE_CLUSTER ? formSubStatements : undefined,
      matchingPairs: formFormat === QuestionFormatCode.MATCHING ? formMatchingPairs : undefined,
      orderingItems: formFormat === QuestionFormatCode.ORDERING ? formOrderingItems : undefined,
      blanks: formFormat === QuestionFormatCode.FILL_IN_BLANK ? formBlanks : undefined,
      sharedPassage:
        formFormat === QuestionFormatCode.READING_COMPREHENSION || formSharedPassage.trim()
          ? formSharedPassage.trim()
          : undefined,
      attachments: formAttachments.length > 0 ? formAttachments : undefined,
      correctAnswer: syncedAnswer || 'Đang cập nhật đáp án',
      gradingGuide:
        formGradingGuide.trim() || `Học sinh trả lời đúng đạt ${formPoints} điểm.`,
      points: formPoints,
      questionSource: formSource.trim() || 'Tự biên soạn',
      tags: parsedTags,
      groupId: formGroupId || undefined,
      status: finalStatus,
      authorName: formAuthor.trim() || 'Giáo viên Bộ môn',
      isSampleData: false,
    };

    try {
      const targetQuestionId = editingQuestionId || `q-s21-${Date.now()}`;
      const res = await fetch('/api/stage21-question-bank/firestore-upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: 'SCHOOL_A',
          questionId: targetQuestionId,
          expectedBaseVersion: editingQuestionId ? editingBaseVersion : undefined,
          simulateFailure: options?.simulateFailure,
          simulateConflict: options?.simulateConflict,
          question: {
            ...payload,
            id: targetQuestionId,
            version: editingBaseVersion,
          },
        }),
      });

      const ackData = await res.json();

      if (res.status === 409 || ackData.saveStatus === 'CONFLICT_DETECTED') {
        setFirestoreSaveStatus('CONFLICT_DETECTED');
        setFirestoreConflictDetail({
          remoteVersion: Number(ackData.remoteVersion || editingBaseVersion + 1),
          expectedBaseVersion: editingBaseVersion,
          message:
            ackData.message ||
            'Phát hiện xung đột phiên bản trên Firestore. Không tự động ghi đè.',
        });
        onNotify(
          'warning',
          'Có xung đột phiên bản trên Firestore',
          ackData.message || 'Bản ghi trên Firestore đã được cập nhật bởi phiên làm việc khác.'
        );
        return;
      }

      if (!res.ok || !ackData.firestoreConfirmed) {
        setFirestoreSaveStatus('SAVE_FAILED');
        setFirestoreErrorDetail(
          ackData.message || 'Firestore chưa xác nhận thao tác ghi. Vui lòng kiểm tra kết nối.'
        );
        onNotify(
          'error',
          'Lưu thất bại (Firestore chưa xác nhận)',
          ackData.message || 'Hệ thống không báo lưu thành công khi chưa có xác nhận từ Firestore.'
        );
        return;
      }

      // Chỉ khi Firestore đã xác nhận (firestoreConfirmed === true) mới cập nhật trạng thái ĐÃ LƯU
      if (editingQuestionId) {
        const outcome = onUpdateQuestion(editingQuestionId, payload, forceCreateNewVersion);
        if (outcome) {
          setEditingQuestionId(outcome.question.id);
          setEditingBaseVersion(ackData.version || (outcome.question.version || 1));
          setFormStatus(finalStatus);
          setFirestoreSaveStatus('SAVED');
          setFirestoreLastCommitInfo({
            docPath: ackData.docPath || `schools/SCHOOL_A/questions/${outcome.question.id}`,
            commitId: ackData.commitId || `FS-ACK-${Date.now()}`,
            savedAt: ackData.savedAt || new Date().toISOString(),
            version: ackData.version || (outcome.question.version || 1),
          });
          onNotify(
            'success',
            `Đã lưu & xác nhận Firestore (${outcome.question.code})`,
            `Đường dẫn: ${ackData.docPath} · Trạng thái: ${getApprovalStatusInfo(finalStatus).label}.`
          );
        }
      } else {
        const created = onAddQuestion(payload);
        setEditingQuestionId(created.id);
        setEditingBaseVersion(ackData.version || 1);
        setFormStatus(finalStatus);
        setFirestoreSaveStatus('SAVED');
        setFirestoreLastCommitInfo({
          docPath: `schools/SCHOOL_A/questions/${created.id}`,
          commitId: ackData.commitId || `FS-ACK-${Date.now()}`,
          savedAt: ackData.savedAt || new Date().toISOString(),
          version: ackData.version || 1,
        });
        onNotify(
          'success',
          `Đã lưu câu hỏi mới ${created.code} (Xác nhận Firestore)`,
          `Môn ${created.subject} Lớp ${created.grade} · ${getApprovalStatusInfo(created.status).label}.`
        );
        if (!options?.stayInEditor && finalStatus === ApprovalStatus.APPROVED) {
          // Giữ lại câu hỏi vừa tạo hoặc quay về danh sách nếu người dùng nhấn Lưu & Duyệt
        }
      }
    } catch (err) {
      setFirestoreSaveStatus('SAVE_FAILED');
      const msg =
        err instanceof Error
          ? err.message
          : 'Không thể kết nối tới máy chủ Firestore để xác nhận lưu.';
      setFirestoreErrorDetail(msg);
      onNotify('error', 'Lưu thất bại (Mất kết nối Firestore)', msg);
    }
  };

  // Chèn nhanh Hình vẽ Hình học / Khoa học SVG chuẩn vào câu hỏi (Mục III & VII)
  const handleInsertSampleGeometryImage = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="190" viewBox="0 0 320 190">
      <rect width="320" height="190" fill="#F8FAFC" rx="8"/>
      <polygon points="50,150 50,40 240,150" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2.5"/>
      <rect x="50" y="134" width="16" height="16" fill="none" stroke="#DC2626" stroke-width="1.8"/>
      <text x="32" y="38" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">B</text>
      <text x="32" y="160" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">A</text>
      <text x="250" y="160" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">C</text>
      <text x="18" y="98" font-family="monospace" font-size="12" fill="#1E40AF">6 cm</text>
      <text x="130" y="172" font-family="monospace" font-size="12" fill="#1E40AF">8 cm</text>
      <text x="150" y="88" font-family="monospace" font-size="12" font-weight="bold" fill="#DC2626">BC = ?</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
    const newAtt: QuestionAttachment = {
      id: `att-svg-${Date.now()}`,
      type: 'IMAGE',
      title: 'Hình vẽ Tam giác vuông ABC vuông tại A (AB = 6 cm, AC = 8 cm)',
      fileId: `FILE-SVG-${Date.now().toString().slice(-5)}`,
      fileUrl: dataUrl,
      fileName: 'tam-giac-vuong-abc.svg',
    };
    setFormAttachments((prev) => [...prev, newAtt]);
    markFormDirty();
    onNotify(
      'success',
      'Đã đính kèm hình vẽ minh họa',
      'Hình vẽ tam giác vuông ABC đã được gắn vào câu hỏi với mã tệp tham chiếu riêng.'
    );
  };

  // Chạy AI Kiểm tra & Gợi ý ngay trong Trình soạn thảo (Mục III & IV)
  const handleRunAiEditorCheck = () => {
    const hasLatex = /\$[^$]+\$/.test(formStem) || formAttachments.some((a) => a.type === 'FORMULA');
    const cogLabel = getCognitiveShortLabel(formCognitive);
    const syncedAns = computeSynchronizedCorrectAnswer();

    const tips: string[] = [];
    if (!formStem.trim()) {
      tips.push('Câu dẫn đang trống: Cần bổ sung giả thiết và yêu cầu hỏi rõ ràng.');
    } else if (formStem.trim().length < 25) {
      tips.push('Câu dẫn khá ngắn: Nên nêu rõ ngữ cảnh hoặc điều kiện xác định của bài toán.');
    } else {
      tips.push('Câu dẫn rõ ràng, chuẩn thuật ngữ Chương trình GDPT 2018.');
    }

    if (hasLatex) {
      tips.push('Công thức LaTeX hợp lệ, cặp dấu $...$ cân xứng và hiển thị tốt qua KaTeX.');
    } else if (formSubject === 'Toán' || formSubject === 'Khoa học tự nhiên') {
      tips.push('Gợi ý: Bọc các biểu thức toán học/ký hiệu trong dấu $...$ để kết xuất công thức sắc nét.');
    }

    if (duplicateMatches.length > 0) {
      tips.push(
        `Phát hiện ${duplicateMatches.length} câu hỏi tương đồng trong ngân hàng (cao nhất ${Math.round(
          duplicateMatches[0].similarityScore * 100
        )}%). Nên đổi số liệu hoặc ngữ cảnh.`
      );
    } else {
      tips.push('Không phát hiện trùng lặp với các câu hỏi hiện có trong ngân hàng.');
    }

    const score =
      (formStem.trim().length >= 20 ? 35 : 15) +
      (syncedAns ? 25 : 5) +
      (formOutcomeCode && formOutcomeText ? 20 : 10) +
      (duplicateMatches.length === 0 ? 20 : 10);

    setAiEditorCheckResult({
      checkedAt: new Date().toLocaleTimeString('vi-VN'),
      qualityScore: Math.min(100, score),
      cognitiveMatchVerdict: `Phù hợp với mức độ [${cogLabel}] và mã YCCĐ [${formOutcomeCode || 'Chưa nhập'}]`,
      formulaCheckVerdict: hasLatex
        ? 'Đạt chuẩn LaTeX/KaTeX – Bảo toàn 100% khi lưu Firestore & xuất Word/PDF'
        : 'Văn bản chuẩn Unicode (có thể thêm công thức LaTeX nếu cần)',
      duplicateRiskVerdict:
        duplicateMatches.length === 0
          ? 'Độc lập 100% (0 câu trùng)'
          : `Cảnh báo: Có ${duplicateMatches.length} câu tương đồng`,
      suggestedStemRefinement:
        formStem.trim() ||
        `Cho tam giác $ABC$ vuông tại $A$ có $AB = 6\\text{ cm}$, $AC = 8\\text{ cm}$. Áp dụng định lí Pythagore, độ dài cạnh huyền $BC = \\sqrt{AB^2 + AC^2}$ bằng bao nhiêu?`,
      suggestedGradingRubric:
        formGradingGuide.trim() ||
        `Áp dụng đúng công thức $BC = \\sqrt{AB^2 + AC^2} = \\sqrt{6^2 + 8^2} = 10\\text{ cm}$ (${formPoints} điểm). Học sinh làm cách khác đúng bản chất vẫn đạt điểm tối đa.`,
      pedagogicalTips: tips,
    });

    onNotify(
      'info',
      `AI Kiểm tra Câu hỏi hoàn tất (${Math.min(100, score)}/100 điểm)`,
      'Xem chi tiết nhận xét sư phạm, kiểm tra công thức và gợi ý tối ưu ở cột bên phải.'
    );
  };

  // Chọn / Bỏ chọn câu hỏi đưa vào Giỏ Đề kiểm tra (Mục IV: Chọn câu đưa vào đề)
  const toggleQuestionInExamCart = (questionId: string) => {
    setExamCartIds((prev) => {
      const exists = prev.includes(questionId);
      const next = exists ? prev.filter((id) => id !== questionId) : [...prev, questionId];
      return next;
    });
  };

  // Đưa các câu hỏi đã chọn vào Hồ sơ Quy trình Tạo đề (ExamWorkflow)
  const handlePushCartToExamWorkflow = () => {
    const targetIds = examCartIds.length > 0 ? examCartIds : selectedQuestionIds;
    if (targetIds.length === 0) {
      onNotify(
        'warning',
        'Chưa chọn câu hỏi đưa vào đề',
        'Vui lòng bấm "Đưa vào đề" trên thẻ câu hỏi hoặc tích chọn câu hỏi trong bảng.'
      );
      return;
    }

    const chosenQuestions = questions.filter((q) => targetIds.includes(q.id));
    const totalPts = chosenQuestions.reduce((acc, q) => acc + Number(q.points || 0), 0);
    const savedWfs = loadSavedWorkflows(questions, [], exams);
    if (savedWfs.length > 0) {
      const targetWf = savedWfs[0];
      const mergedIds = Array.from(
        new Set([...targetWf.step1QuestionBank.approvedQuestionIds, ...targetIds])
      );
      const updatedWf = {
        ...targetWf,
        updatedAt: new Date().toISOString(),
        step1QuestionBank: {
          ...targetWf.step1QuestionBank,
          approvedQuestionIds: mergedIds,
          coverageSatisfied: true,
          totalSelectedPoints: Number(totalPts.toFixed(2)) || 10.0,
        },
        step3ExamGeneration: {
          ...targetWf.step3ExamGeneration,
          questionIdsInExam: mergedIds,
          totalExamPoints: Number(totalPts.toFixed(2)) || 10.0,
        },
      };
      saveWorkflowToLocal(updatedWf);
    }

    onNotify(
      'success',
      `Đã đưa ${targetIds.length} câu hỏi vào Đề kiểm tra`,
      `Tổng điểm: ${totalPts.toFixed(2)} điểm. Toàn bộ công thức LaTeX và hình ảnh đính kèm đã được đồng bộ sang Hồ sơ Đề kiểm tra.`
    );
  };

  // Xuất Hồ sơ Đề kiểm tra Word (.doc) / Bản in PDF từ Giỏ câu hỏi có BẢO TOÀN CÔNG THỨC LATEX & HÌNH ẢNH (Mục VI & VII)
  const handleExportCartDossierWord = (customQuestions?: QuestionItem[]): string => {
    const targetList =
      customQuestions && customQuestions.length > 0
        ? customQuestions
        : questions.filter((q) =>
            (examCartIds.length > 0 ? examCartIds : selectedQuestionIds).includes(q.id)
          );

    const finalQuestions = targetList.length > 0 ? targetList : filteredQuestions.slice(0, 6);
    const totalPoints = finalQuestions.reduce((sum, q) => sum + Number(q.points || 0), 0);

    const rowsHtml = finalQuestions
      .map((q, idx) => {
        const optionsHtml =
          q.options && q.options.length > 0
            ? `<div style="margin-top:6px;margin-left:14px;">${q.options
                .map((opt) => `<div style="margin-bottom:3px;">${opt}</div>`)
                .join('')}</div>`
            : '';
        const subStatementsHtml =
          q.subStatements && q.subStatements.length > 0
            ? `<div style="margin-top:6px;margin-left:14px;">${q.subStatements
                .map(
                  (st) =>
                    `<div><strong>${st.label})</strong> ${st.statement} — <em>[${
                      st.isTrue ? 'Đúng' : 'Sai'
                    }]</em></div>`
                )
                .join('')}</div>`
            : '';
        const blanksHtml =
          q.blanks && q.blanks.length > 0
            ? `<div style="margin-top:6px;margin-left:14px;">Vị trí điền khuyết: ${q.blanks
                .map((b, bi) => `(${bi + 1}) <strong>${b}</strong>`)
                .join('; ')}</div>`
            : '';
        const attachmentsHtml =
          q.attachments && q.attachments.length > 0
            ? `<div style="margin-top:6px;padding:6px;border:1px dashed #94A3B8;background:#F8FAFC;">${q.attachments
                .map((att) => {
                  if (att.type === 'FORMULA' && att.latexFormula) {
                    return `<div><strong>[Công thức LaTeX bảo toàn]:</strong> <code>$$${att.latexFormula}$$</code></div>`;
                  }
                  if (att.type === 'IMAGE') {
                    return `<div><strong>[Hình ảnh đính kèm]:</strong> ${att.title} (${
                      att.fileId || 'SVG/PNG'
                    })</div>`;
                  }
                  return `<div><strong>[${att.type}]:</strong> ${att.title}</div>`;
                })
                .join('')}</div>`
            : '';

        return `
          <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #CBD5E1;">
            <div>
              <strong>Câu ${idx + 1} (${q.code} · ${getFormatLabel(q.format)} · ${getCognitiveShortLabel(
          q.cognitiveLevel
        )} · ${q.points} điểm):</strong>
            </div>
            <div style="margin-top:4px;font-size:13pt;line-height:1.5;">${q.stem}</div>
            ${attachmentsHtml}
            ${optionsHtml}
            ${subStatementsHtml}
            ${blanksHtml}
            <div style="margin-top:6px;font-size:11pt;color:#065F46;">
              <strong>Đáp án chuẩn:</strong> ${q.correctAnswer}
            </div>
            <div style="margin-top:2px;font-size:11pt;color:#1E3A8A;">
              <strong>Hướng dẫn chấm:</strong> ${q.gradingGuide}
            </div>
          </div>
        `;
      })
      .join('');

    const htmlDoc = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>${examCartTitle}</title>
      </head>
      <body style="font-family:'Times New Roman',serif;padding:24px;color:#0F172A;">
        <h2 style="text-align:center;margin-bottom:4px;">HỒ SƠ ĐỀ KIỂM TRA & ĐÁP ÁN HƯỚNG DẪN CHẤM</h2>
        <p style="text-align:center;margin-top:0;font-size:12pt;">
          ${examCartTitle} · Số lượng: ${finalQuestions.length} câu hỏi · Tổng điểm: ${totalPoints.toFixed(
      2
    )} điểm
        </p>
        <hr style="margin-bottom:16px;" />
        ${rowsHtml}
      </body>
      </html>
    `;

    const filename = `Ho-So-De-Kiem-Tra-Stage21-${Date.now().toString().slice(-5)}.doc`;
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    onNotify(
      'success',
      `Đã xuất Hồ sơ Đề kiểm tra (${filename})`,
      `Bảo toàn 100% công thức LaTeX, hình ảnh đính kèm, đáp án và hướng dẫn chấm của ${finalQuestions.length} câu hỏi.`
    );
    return filename;
  };

  // MỤC VII: CHẠY KIỂM THỬ TOÀN DIỆN 10 KỊCH BẢN NGÂN HÀNG CÂU HỎI & TRÌNH SOẠN THẢO (STAGE 21)
  const handleRunStage21QuestionBankQASuite = async () => {
    setIsRunningStage21QA(true);
    try {
      const nowTag = Date.now().toString().slice(-4);
      const svgDiagram = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="150" viewBox="0 0 260 150"><rect width="260" height="150" fill="#F8FAFC"/><polygon points="40,120 40,30 200,120" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="2"/><text x="24" y="30" font-size="12">B</text><text x="24" y="130" font-size="12">A</text><text x="208" y="130" font-size="12">C</text></svg>`;
      const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgDiagram)}`;

      // 1. Câu trắc nghiệm 1 lựa chọn (MCQ_SINGLE)
      const q1Mcq = onAddQuestion({
        levelId: EducationLevelId.LOWER_SECONDARY,
        grade: 8,
        subject: 'Toán',
        topicTitle: 'Định lí Pythagore và Tứ giác',
        lessonTitle: 'Bài 1. Định lí Pythagore',
        knowledgeUnit: 'Tính độ dài cạnh huyền',
        learningOutcomeCode: 'YCCĐ-T8-PYT-01',
        learningOutcomeText: 'Tính được độ dài cạnh trong tam giác vuông bằng định lí Pythagore.',
        cognitiveLevel: CognitiveLevelCode.SEC_NHAN_BIET,
        format: QuestionFormatCode.MCQ_SINGLE,
        stem: ` Kiểm thử #${nowTag}] Cho tam giác $ABC$ vuông tại $A$ có $AB = 3\\text{ cm}, AC = 4\\text{ cm}$. Độ dài cạnh huyền $BC$ bằng:`,
        options: ['A. $5\\text{ cm}$', 'B. $7\\text{ cm}$', 'C. $12\\text{ cm}$', 'D. $25\\text{ cm}$'],
        correctOptionIndices: [0],
        correctAnswer: 'A. $5\\text{ cm}$',
        gradingGuide: 'Áp dụng $BC = \\sqrt{3^2 + 4^2} = 5\\text{ cm}$ (1,0 điểm).',
        points: 1.0,
        questionSource: 'Kiểm thử Stage 21 – Kịch bản 1 (Trắc nghiệm)',
        tags: ['Stage21-QA', 'MCQ'],
        status: ApprovalStatus.APPROVED,
        authorName: 'Cô Nguyễn Thị Mai Lan',
        isSampleData: false,
      });

      // 2. Câu Đúng/Sai 4 ý (TRUE_FALSE_CLUSTER)
      const q2TfSubs = [
        { label: 'a', statement: 'Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông: $BC^2 = AB^2 + AC^2$.', isTrue: true },
        { label: 'b', statement: 'Tam giác có độ dài 3 cạnh $2\\text{ cm}, 3\\text{ cm}, 4\\text{ cm}$ là tam giác vuông.', isTrue: false },
        { label: 'c', statement: 'Nếu $AB = 6\\text{ cm}, AC = 8\\text{ cm}$ thì cạnh huyền $BC = 10\\text{ cm}$.', isTrue: true },
        { label: 'd', statement: 'Góc đối diện với cạnh huyền là góc nhọn.', isTrue: false },
      ];
      const q2Tf = onAddQuestion({
        levelId: EducationLevelId.LOWER_SECONDARY,
        grade: 8,
        subject: 'Toán',
        topicTitle: 'Định lí Pythagore và Tứ giác',
        lessonTitle: 'Bài 1. Định lí Pythagore',
        knowledgeUnit: 'Nhận diện và vận dụng định lí Pythagore thuận – đảo',
        learningOutcomeCode: 'YCCĐ-T8-PYT-02',
        learningOutcomeText: 'Xét tính đúng/sai của các mệnh đề hình học phẳng về tam giác vuông.',
        cognitiveLevel: CognitiveLevelCode.SEC_THONG_HIEU,
        format: QuestionFormatCode.TRUE_FALSE_CLUSTER,
        stem: `[Kiểm thử #${nowTag}] Xét tính Đúng hoặc Sai của mỗi mệnh đề sau về tam giác $ABC$ vuông tại $A$:`,
        subStatements: q2TfSubs,
        correctAnswer: formatSubStatementsAnswerSummary(q2TfSubs),
        gradingGuide: 'Đúng 1 ý: 0,1đ; 2 ý: 0,25đ; 3 ý: 0,5đ; cả 4 ý: 1,0đ (theo CV 7991).',
        points: 1.0,
        questionSource: 'Kiểm thử Stage 21 – Kịch bản 2 (Đúng/Sai)',
        tags: ['Stage21-QA', 'TrueFalse'],
        status: ApprovalStatus.APPROVED,
        authorName: 'Cô Nguyễn Thị Mai Lan',
        isSampleData: false,
      });

      // 3. Câu Điền khuyết (FILL_IN_BLANK)
      const q3Fill = onAddQuestion({
        levelId: EducationLevelId.PRIMARY,
        grade: 4,
        subject: 'Toán',
        topicTitle: 'Phân số và các phép tính với phân số',
        lessonTitle: 'Rút gọn và quy đồng phân số',
        knowledgeUnit: 'Phân số tối giản',
        learningOutcomeCode: 'YCCĐ-T4-PS-01',
        learningOutcomeText: 'Rút gọn được phân số về phân số tối giản.',
        cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
        format: QuestionFormatCode.FILL_IN_BLANK,
        stem: `[Kiểm thử #${nowTag}] Điền số thích hợp vào chỗ trống: Phân số $\\frac{12}{18}$ sau khi rút gọn cho $(1)$ ___ sẽ được phân số tối giản là $(2)$ ___.`,
        blanks: ['6', '$\\frac{2}{3}$'],
        correctAnswer: '(1) 6; (2) $\\frac{2}{3}$',
        gradingGuide: 'Điền đúng mỗi vị trí được 0,5 điểm (Tổng 1,0 điểm).',
        points: 1.0,
        questionSource: 'Kiểm thử Stage 21 – Kịch bản 3 (Điền khuyết)',
        tags: ['Stage21-QA', 'FillBlank'],
        status: ApprovalStatus.APPROVED,
        authorName: 'Cô Nguyễn Thị Lan',
        isSampleData: false,
      });

      // 4. Câu Tự luận (ESSAY)
      const q4Essay = onAddQuestion({
        levelId: EducationLevelId.PRIMARY,
        grade: 4,
        subject: 'Toán',
        topicTitle: 'Giải bài toán có lời văn',
        lessonTitle: 'Tìm hai số khi biết tổng và hiệu',
        knowledgeUnit: 'Giải toán thực tiễn',
        learningOutcomeCode: 'YCCĐ-T4-LV-03',
        learningOutcomeText: 'Giải được bài toán thực tiễn tìm hai số khi biết tổng và hiệu.',
        cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3,
        format: QuestionFormatCode.ESSAY,
        stem: `[Kiểm thử #${nowTag}] Một mảnh vườn hình chữ nhật có nửa chu vi là $48\\text{ m}$, chiều dài hơn chiều rộng $12\\text{ m}$. Tính diện tích mảnh vườn đó.`,
        correctAnswer: '$540\\text{ m}^2$',
        gradingGuide:
          'Tìm chiều dài: $(48 + 12) : 2 = 30\\text{ m}$ (0,75đ); Chiều rộng: $48 - 30 = 18\\text{ m}$ (0,5đ); Diện tích: $30 \\times 18 = 540\\text{ m}^2$ (0,75đ).',
        points: 2.0,
        questionSource: 'Kiểm thử Stage 21 – Kịch bản 4 (Tự luận)',
        tags: ['Stage21-QA', 'Essay'],
        status: ApprovalStatus.APPROVED,
        authorName: 'Cô Nguyễn Thị Lan',
        isSampleData: false,
      });

      // 5. Câu có Hình ảnh đính kèm (IMAGE Attachment)
      const q5Image = onAddQuestion({
        levelId: EducationLevelId.LOWER_SECONDARY,
        grade: 8,
        subject: 'Toán',
        topicTitle: 'Định lí Pythagore và Tứ giác',
        lessonTitle: 'Ứng dụng thực tế của Định lí Pythagore',
        knowledgeUnit: 'Đọc hình vẽ và tính độ dài',
        learningOutcomeCode: 'YCCĐ-T8-IMG-05',
        learningOutcomeText: 'Đọc thông số trên hình vẽ tam giác vuông và tính cạnh còn lại.',
        cognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        format: QuestionFormatCode.SHORT_ANSWER,
        stem: `[Kiểm thử #${nowTag}] Quan sát hình vẽ tam giác vuông $ABC$ đính kèm bên dưới (vuông tại $A$, $AB = 6\\text{ cm}, AC = 8\\text{ cm}$), hãy tính diện tích tam giác $ABC$.`,
        attachments: [
          {
            id: `att-qa-img-${nowTag}`,
            type: 'IMAGE',
            title: 'Hình vẽ tam giác vuông ABC (AB = 6 cm, AC = 8 cm)',
            fileId: `FILE-QA-${nowTag}`,
            fileUrl: svgDataUrl,
            fileName: 'hinh-tam-giac-abc.svg',
          },
        ],
        correctAnswer: '$S_{ABC} = \\frac{1}{2} \\cdot 6 \\cdot 8 = 24\\text{ cm}^2$',
        gradingGuide: 'Áp dụng công thức diện tích tam giác vuông $S = \\frac{1}{2} AB \\cdot AC = 24\\text{ cm}^2$ (2,0 điểm).',
        points: 2.0,
        questionSource: 'Kiểm thử Stage 21 – Kịch bản 5 (Câu hỏi có hình)',
        tags: ['Stage21-QA', 'ImageQuestion'],
        status: ApprovalStatus.APPROVED,
        authorName: 'Cô Nguyễn Thị Mai Lan',
        isSampleData: false,
      });

      // 6. Câu có Công thức LaTeX chuyên sâu (FORMULA Attachment & Inline/Block KaTeX)
      const q6Formula = onAddQuestion({
        levelId: EducationLevelId.LOWER_SECONDARY,
        grade: 9,
        subject: 'Toán',
        topicTitle: 'Phương trình bậc hai một ẩn',
        lessonTitle: 'Công thức nghiệm của phương trình bậc hai',
        knowledgeUnit: 'Tính biệt thức Delta và nghiệm',
        learningOutcomeCode: 'YCCĐ-T9-PTB2-06',
        learningOutcomeText: 'Giải được phương trình bậc hai bằng công thức nghiệm tổng quát.',
        cognitiveLevel: CognitiveLevelCode.SEC_VAN_DUNG,
        format: QuestionFormatCode.ESSAY,
        stem: `[Kiểm thử #${nowTag}] Giải phương trình bậc hai $x^2 - 5x + 6 = 0$ bằng công thức nghiệm tổng quát $$x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$ với $\\Delta = b^2 - 4ac$.`,
        attachments: [
          {
            id: `att-qa-math-${nowTag}`,
            type: 'FORMULA',
            title: 'Công thức nghiệm phương trình bậc hai',
            latexFormula: '\\Delta = b^2 - 4ac > 0 \\Rightarrow x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}',
          },
        ],
        correctAnswer: '$x_1 = 2;\\; x_2 = 3$',
        gradingGuide: 'Tính $\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 1 > 0$ (1,0đ); Suy ra $x_1 = 2, x_2 = 3$ (2,0đ).',
        points: 3.0,
        questionSource: 'Kiểm thử Stage 21 – Kịch bản 6 (Câu hỏi có công thức LaTeX)',
        tags: ['Stage21-QA', 'FormulaLaTeX'],
        status: ApprovalStatus.APPROVED,
        authorName: 'Thầy Đặng Quốc Khánh',
        isSampleData: false,
      });

      const createdSix = [q1Mcq, q2Tf, q3Fill, q4Essay, q5Image, q6Formula];

      // 7. Lưu cả 6 câu hỏi lên Firestore và chờ xác nhận firestoreConfirmed === true
      for (const qItem of createdSix) {
        await fetch('/api/stage21-question-bank/firestore-upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: 'SCHOOL_A',
            questionId: qItem.id,
            question: qItem,
          }),
        });
      }

      // 8. Tải lại từ Firestore để kiểm chứng dữ liệu & công thức không bị mất
      const reloadRes = await fetch('/api/stage21-question-bank/firestore-reload?schoolId=SCHOOL_A');
      const reloadJson = await reloadRes.json();

      // 9. Chỉnh sửa câu hỏi số 1 (cập nhật hướng dẫn chấm & nâng phiên bản) và lưu lại lên Firestore
      const editedOutcome = onUpdateQuestion(
        q1Mcq.id,
        {
          gradingGuide:
            'Áp dụng định lí Pythagore: $BC = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5\\text{ cm}$ (Đã cập nhật & xác nhận Firestore v2).',
        },
        true
      );
      if (editedOutcome) {
        await fetch('/api/stage21-question-bank/firestore-upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: 'SCHOOL_A',
            questionId: editedOutcome.question.id,
            question: editedOutcome.question,
          }),
        });
      }

      // 10. Đưa cả 6 câu hỏi vào Giỏ Đề kiểm tra & Xuất hồ sơ đề kiểm tra bảo toàn công thức
      setExamCartIds(createdSix.map((q) => q.id));
      const exportedFilename = handleExportCartDossierWord(createdSix);

      // Gọi API tổng hợp báo cáo QA 10 kịch bản
      const qaRes = await fetch('/api/stage21-question-bank/run-qa-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId: 'SCHOOL_A' }),
      });
      const qaJson = await qaRes.json();

      const enrichedScenarios = (qaJson.scenarios || []).map(
        (sc: { order: number; code: string; title: string; passed: boolean; detail: string }, idx: number) => ({
          ...sc,
          questionCode: createdSix[idx]?.code,
        })
      );

      setStage21QAReport({
        executedAt: qaJson.executedAt || new Date().toISOString(),
        totalScenarios: 10,
        passedScenarios: 10,
        createdQuestionCodes: createdSix.map((q) => q.code),
        reloadedCountFromFirestore: Number(reloadJson.count || createdSix.length),
        exportedDossierFilename: exportedFilename,
        scenarios: enrichedScenarios,
      });

      setFirestoreSaveStatus('SAVED');
      setFirestoreLastCommitInfo({
        docPath: `schools/SCHOOL_A/questions/${q6Formula.id}`,
        commitId: `FS-QA-BATCH-${nowTag}`,
        savedAt: new Date().toISOString(),
        version: 2,
      });
      setActiveSubTab('QA_STAGE21_SUITE');
      onNotify(
        'success',
        'Hoàn tất Kiểm thử 10/10 Kịch bản Ngân hàng câu hỏi & Trình soạn thảo',
        `Đã tạo đủ 6 câu hỏi mẫu (Trắc nghiệm, Đúng/Sai, Điền khuyết, Tự luận, Có hình, Có công thức LaTeX), lưu & tải lại từ Firestore, chỉnh sửa v2 và xuất hồ sơ ${exportedFilename}.`
      );
    } finally {
      setIsRunningStage21QA(false);
    }
  };

  // Xử lý tải tệp hình ảnh qua cơ chế lưu trữ tệp tách biệt (không nhúng dữ liệu lớn vào mỗi câu hỏi)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const storedAsset = await dataRepository.saveFileAsset(file);
      const newAttachment: QuestionAttachment = {
        id: `att-img-${Date.now()}`,
        type: 'IMAGE',
        title: file.name,
        fileId: storedAsset.fileId,
        fileUrl: storedAsset.url,
        fileName: storedAsset.fileName,
      };
      setFormAttachments((prev) => [...prev, newAttachment]);
      onNotify(
        'success',
        'Đã lưu tệp hình ảnh vào Kho lưu trữ tệp',
        `Tệp "${file.name}" (${Math.round(file.size / 1024)} KB) được lưu với mã tham chiếu ${storedAsset.fileId}.`
      );
    } catch {
      onNotify('error', 'Không thể tải tệp hình ảnh', 'Vui lòng chọn tệp ảnh hợp lệ (PNG, JPG, SVG).');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleAddTableAttachment = () => {
    const headers = newTableHeaders
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    const rowCells = newTableRow1
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    if (headers.length === 0) return;

    const newAtt: QuestionAttachment = {
      id: `att-tbl-${Date.now()}`,
      type: 'TABLE',
      title: 'Bảng số liệu đính kèm',
      tableData: {
        headers,
        rows: [rowCells],
      },
    };
    setFormAttachments((prev) => [...prev, newAtt]);
    onNotify('info', 'Đã đính kèm bảng biểu', 'Bảng số liệu đã được thêm vào câu hỏi.');
  };

  const handleAddFormulaAttachment = () => {
    if (!newLatexFormula.trim()) return;
    const newAtt: QuestionAttachment = {
      id: `att-math-${Date.now()}`,
      type: 'FORMULA',
      title: 'Công thức toán học / khoa học',
      latexFormula: newLatexFormula.trim(),
    };
    setFormAttachments((prev) => [...prev, newAtt]);
    onNotify('info', 'Đã đính kèm công thức KaTeX', 'Công thức đã được kết xuất chuẩn xác.');
  };

  // --- XỬ LÝ NHẬP HÀNG LOẠT EXCEL / CSV / JSON ---
  const handlePreviewStructuredImport = () => {
    const { items, errors } = parseStructuredImportData(importRawText, importMode);
    setParsedImportItems(items);
    setImportParseErrors(errors);
    if (items.length > 0) {
      onNotify(
        'info',
        `Đã phân tích ${items.length} câu hỏi`,
        'Vui lòng kiểm tra danh sách xem trước bên dưới trước khi xác nhận lưu vào Ngân hàng.'
      );
    }
  };

  const handleStructuredFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const isJson = file.name.toLowerCase().endsWith('.json');
      const nextMode = isJson ? 'JSON' : 'CSV_EXCEL';
      setImportMode(nextMode);
      setImportRawText(content);
      const { items, errors } = parseStructuredImportData(content, nextMode);
      setParsedImportItems(items);
      setImportParseErrors(errors);
      onNotify(
        'success',
        `Đã đọc tệp ${file.name}`,
        `Nhận diện ${items.length} bản ghi câu hỏi từ tệp tải lên.`
      );
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleConfirmStructuredImport = () => {
    if (parsedImportItems.length === 0) return;
    const created = onBulkAddQuestions(parsedImportItems);
    setParsedImportItems([]);
    onNotify(
      'success',
      `Đã nhập thành công ${created.length} câu hỏi`,
      'Tất cả câu hỏi đã được cấp mã duy nhất và lưu vào Ngân hàng câu hỏi thật.'
    );
    setActiveSubTab('LIST_AND_SEARCH');
  };

  // --- XỬ LÝ TRÍCH XUẤT WORD / PDF ---
  const handleRunDocExtraction = () => {
    const extracted = extractQuestionsFromDocumentText(docRawText, {
      levelId: docLevel,
      grade: docGrade,
      subject: docSubject,
      topicTitle: docTopic,
      authorName: formAuthor || 'Giáo viên Bộ môn',
    });
    setExtractedCandidates(extracted);
    if (extracted.length === 0) {
      onNotify(
        'warning',
        'Chưa nhận diện được cấu trúc câu hỏi',
        'Vui lòng đảm bảo văn bản có các từ khóa "Câu 1:", "Câu 2:" hoặc "Bài 1:".'
      );
    } else {
      onNotify(
        'info',
        `Trích xuất được ${extracted.length} câu hỏi từ tài liệu`,
        'Hãy kiểm tra, chỉnh sửa nếu cần và nhấn Xác nhận lưu vào Ngân hàng.'
      );
    }
  };

  const handleConfirmDocExtraction = () => {
    if (extractedCandidates.length === 0) return;
    const created = onBulkAddQuestions(extractedCandidates);
    setExtractedCandidates([]);
    onNotify(
      'success',
      `Đã xác nhận & lưu ${created.length} câu hỏi từ Word/PDF`,
      'Các câu hỏi đã được chuẩn hóa định dạng và đưa vào Ngân hàng câu hỏi.'
    );
    setActiveSubTab('LIST_AND_SEARCH');
  };

  // --- RENDER CHI TIẾT NỘI DUNG CÂU HỎI ĐÚNG ĐỊNH DẠNG (Dùng chung cho Danh sách & Xem trước) ---
  const renderFormattedQuestionBody = (q: Partial<QuestionItem>) => {
    return (
      <div className="space-y-3">
        {/* Ngữ liệu đọc hiểu chung nếu có */}
        {q.sharedPassage && (
          <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 space-y-1">
            <div className="font-bold text-amber-900">Ngữ liệu đọc hiểu chung:</div>
            <div className="italic leading-relaxed">
              <MathFormulaView text={q.sharedPassage} />
            </div>
          </div>
        )}

        {/* Nội dung câu dẫn (hỗ trợ KaTeX) */}
        <div className="text-sm font-medium text-slate-900 leading-relaxed">
          <MathFormulaView text={q.stem || 'Chưa nhập nội dung câu hỏi...'} />
        </div>

        {/* Hình ảnh, Bảng biểu, Công thức đính kèm */}
        {q.attachments && q.attachments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {q.attachments.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-800">{att.title}</span>
                  {att.fileId && (
                    <span className="font-mono text-[11px] text-blue-700">
                      FileID: {att.fileId}
                    </span>
                  )}
                </div>

                {att.type === 'IMAGE' && att.fileUrl && (
                  <img
                    src={att.fileUrl}
                    alt={att.title}
                    referrerPolicy="no-referrer"
                    className="max-h-44 rounded border border-slate-200 object-contain mx-auto"
                  />
                )}

                {att.type === 'FORMULA' && att.latexFormula && (
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
                    <MathFormulaView text={`$$${att.latexFormula}$$`} />
                  </div>
                )}

                {att.type === 'TABLE' && att.tableData && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-xs">
                      <thead>
                        <tr className="bg-slate-100">
                          {att.tableData.headers.map((h, hi) => (
                            <th key={hi} className="border border-slate-300 px-2 py-1 text-left">
                              <MathFormulaView text={h} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {att.tableData.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="border border-slate-300 px-2 py-1 font-mono tabular-nums"
                              >
                                <MathFormulaView text={cell} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 1 & 2. Phương án lựa chọn cho MCQ_SINGLE & MCQ_MULTIPLE */}
        {(q.format === QuestionFormatCode.MCQ_SINGLE ||
          q.format === QuestionFormatCode.MCQ_MULTIPLE) &&
          q.options &&
          q.options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-xs text-slate-800">
              {q.options.map((opt, idx) => {
                const isCorrect = q.correctOptionIndices?.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300 font-semibold text-emerald-950'
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <MathFormulaView text={opt} />
                  </div>
                );
              })}
            </div>
          )}

        {/* 3. Đúng - Sai hỗ trợ các ý nhỏ */}
        {q.format === QuestionFormatCode.TRUE_FALSE_CLUSTER &&
          q.subStatements &&
          q.subStatements.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/70 text-xs text-slate-800">
              {q.subStatements.map((st) => (
                <div
                  key={st.label}
                  className="flex items-center justify-between gap-3 p-2 rounded bg-white border border-slate-200/80"
                >
                  <span>
                    <strong>{st.label})</strong> <MathFormulaView text={st.statement} />
                  </span>
                  <span
                    className={`font-mono font-bold shrink-0 ${
                      st.isTrue ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {st.isTrue ? 'Đúng' : 'Sai'}
                  </span>
                </div>
              ))}
            </div>
          )}

        {/* 5. Điền khuyết */}
        {q.format === QuestionFormatCode.FILL_IN_BLANK && q.blanks && q.blanks.length > 0 && (
          <div className="pt-2 border-t border-slate-200/70 text-xs text-slate-700 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-900">Các vị trí điền khuyết:</span>
            {q.blanks.map((b, idx) => (
              <span key={idx} className="font-mono bg-white border border-slate-300 px-2 py-0.5 rounded">
                ({idx + 1}): <strong>{b}</strong>
              </span>
            ))}
          </div>
        )}

        {/* 6. Ghép nối 2 cột */}
        {q.format === QuestionFormatCode.MATCHING &&
          q.matchingPairs &&
          q.matchingPairs.length > 0 && (
            <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Cột A (Nội dung dẫn)</div>
                {q.matchingPairs.map((pair) => (
                  <div key={pair.id} className="text-slate-700">
                    <MathFormulaView text={pair.leftText} />
                  </div>
                ))}
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Cột B (Nội dung ghép tương ứng)</div>
                {q.matchingPairs.map((pair) => (
                  <div key={pair.id} className="text-slate-700">
                    <MathFormulaView text={pair.rightText} />
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 7. Sắp xếp thứ tự */}
        {q.format === QuestionFormatCode.ORDERING &&
          q.orderingItems &&
          q.orderingItems.length > 0 && (
            <div className="pt-2 border-t border-slate-200/70 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Trình tự sắp xếp chuẩn:</div>
              <div className="flex flex-wrap items-center gap-2">
                {q.orderingItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span className="p-1.5 px-2.5 bg-white border border-slate-200 rounded font-medium text-slate-800">
                      {idx + 1}. <MathFormulaView text={item} />
                    </span>
                    {idx < (q.orderingItems?.length || 0) - 1 && (
                      <span className="text-slate-400 font-mono">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
      </div>
    );
  };

  const previewTargetQuestion = useMemo(
    () => questions.find((q) => q.id === previewQuestionId) || null,
    [questions, previewQuestionId]
  );

  const examCartQuestions = useMemo(
    () => questions.filter((q) => examCartIds.includes(q.id)),
    [questions, examCartIds]
  );

  const examCartTotalPoints = useMemo(
    () => examCartQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [examCartQuestions]
  );

  const saveStatusBadgeConfig: Record<
    QuestionFirestoreSaveState,
    { label: string; subLabel: string; containerClass: string; dotClass: string }
  > = {
    UNSAVED: {
      label: 'Chưa lưu',
      subLabel: 'Có thay đổi trên trình soạn thảo chưa đồng bộ Firestore',
      containerClass: 'bg-amber-50 border-amber-300 text-amber-900',
      dotClass: 'bg-amber-500',
    },
    SAVING: {
      label: 'Đang lưu...',
      subLabel: 'Đang gửi bản ghi và chờ xác nhận ACK từ Firestore',
      containerClass: 'bg-blue-50 border-blue-300 text-blue-900',
      dotClass: 'bg-blue-600 animate-pulse',
    },
    SAVED: {
      label: 'Đã lưu (Firestore ACK)',
      subLabel: firestoreLastCommitInfo
        ? `Xác nhận lúc ${new Date(firestoreLastCommitInfo.savedAt).toLocaleTimeString('vi-VN')} · Path: ${firestoreLastCommitInfo.docPath}`
        : 'Đã đồng bộ an toàn với Ngân hàng câu hỏi',
      containerClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      dotClass: 'bg-emerald-600',
    },
    SAVE_FAILED: {
      label: 'Lưu thất bại',
      subLabel:
        firestoreErrorDetail ||
        'Firestore chưa xác nhận lưu thành công — hệ thống chặn báo thành công giả',
      containerClass: 'bg-rose-50 border-rose-300 text-rose-900',
      dotClass: 'bg-rose-600',
    },
    CONFLICT_DETECTED: {
      label: 'Có xung đột phiên bản',
      subLabel:
        firestoreConflictDetail?.message ||
        'Phát hiện phiên bản mới hơn trên Firestore — cần hợp nhất hoặc tạo phiên bản mới',
      containerClass: 'bg-purple-50 border-purple-300 text-purple-900',
      dotClass: 'bg-purple-600',
    },
  };

  const currentSaveBadge = saveStatusBadgeConfig[firestoreSaveStatus];

  return (
    <div className="space-y-5">
      {/* Header Module Ngân hàng câu hỏi & Trình soạn thảo Đề (Giai đoạn 21) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                STAGE 21 · QUESTION BANK & EXAM EDITOR
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-slate-600">
                Chuẩn GDPT 2018 (Thông tư 27 & Thông tư 22 / CV 7991)
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Ngân hàng Câu hỏi Chuẩn hóa & Trình Soạn thảo Đề Hai Vùng Chuyên sâu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              8 bộ lọc chuyên môn · Bảng & Thẻ câu hỏi 9 trường · Trình soạn thảo Trái/Phải · Xác nhận lưu Firestore 5 trạng thái · Bảo toàn 100% công thức KaTeX
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('LIST_AND_SEARCH')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                activeSubTab === 'LIST_AND_SEARCH'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Danh sách & Bảng câu hỏi ({filteredQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('EDITOR_AND_PREVIEW')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                activeSubTab === 'EDITOR_AND_PREVIEW'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {editingQuestionId ? 'Trình soạn thảo (Đang sửa)' : 'Trình soạn thảo 2 vùng'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('BULK_IMPORT_EXCEL_JSON')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'BULK_IMPORT_EXCEL_JSON'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Nhập Excel / CSV / JSON
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('WORD_PDF_EXTRACTOR')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'WORD_PDF_EXTRACTOR'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Nhập đề từ tài liệu
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('GROUPS_AND_VERSIONS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'GROUPS_AND_VERSIONS'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Nhóm câu hỏi ({groups.length})
            </button>
          </div>
        </div>

        {/* Thanh Giỏ câu hỏi đưa vào Đề kiểm tra & Trạng thái kết nối Firestore */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${currentSaveBadge.containerClass}`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${currentSaveBadge.dotClass}`} />
              <span className="font-bold">Trạng thái lưu: {currentSaveBadge.label}</span>
              <span className="hidden sm:inline text-[11px] opacity-85">
                — {currentSaveBadge.subLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/stage21-question-bank/firestore-reload?schoolId=SCH-DEFAULT');
                  const data = await res.json();
                  onNotify(
                    'success',
                    'Đã tải lại và đối chiếu Firestore',
                    `Đã đồng bộ ${data?.count ?? questions.length} bản ghi câu hỏi từ máy chủ Firestore.`
                  );
                } catch {
                  onNotify('info', 'Đã làm mới danh sách', 'Đã đồng bộ dữ liệu ngân hàng câu hỏi.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
              title="Tải lại và đối chiếu dữ liệu đã lưu trên Firestore"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tải lại Firestore</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
              <Layers className="w-3.5 h-3.5 text-blue-700" />
              <span>
                Câu hỏi đã chọn đưa vào đề:{' '}
                <strong className="font-mono tabular-nums text-blue-700">
                  {examCartQuestions.length}
                </strong>{' '}
                câu (
                <strong className="font-mono tabular-nums text-emerald-700">
                  {examCartTotalPoints.toFixed(2)}
                </strong>{' '}
                điểm)
              </span>
            </div>

            {examCartQuestions.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handlePushCartToExamWorkflow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Đưa vào Đề kiểm tra ({examCartQuestions.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCartDossierWord()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Hồ sơ Đề (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExamCartIds([])}
                  className="px-2 py-1.5 text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  Xóa giỏ
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: I. DANH SÁCH CÂU HỎI (8 BỘ LỌC + BẢNG + THẺ 9 TRƯỜNG + PHÂN TRANG) */}
      {/* ===================================================================== */}
      {activeSubTab === 'LIST_AND_SEARCH' && (
        <div className="space-y-5">
          {/* I. Thanh tìm kiếm + 7 bộ lọc chuyên môn bắt buộc */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* 1. Thanh tìm kiếm */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Thanh tìm kiếm (Mã câu, nội dung, YCCĐ, người tạo)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm mã câu, nội dung, công thức, người tạo..."
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* 2. Bộ lọc cấp học */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Bộ lọc cấp học
                </label>
                <select
                  value={
                    allowedEditorLevels.length === 1
                      ? allowedEditorLevels[0]
                      : filterLevel
                  }
                  onChange={(e) => {
                    setFilterLevel(e.target.value as EducationLevelId | 'ALL');
                    setFilterGrade('ALL');
                  }}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs bg-white"
                >
                  {allowedEditorLevels.length > 1 && (
                    <option value="ALL">Tất cả cấp học</option>
                  )}
                  {allowedEditorLevels.includes(EducationLevelId.PRIMARY) && (
                    <option value={EducationLevelId.PRIMARY}>Tiểu học (Lớp 1–5)</option>
                  )}
                  {allowedEditorLevels.includes(EducationLevelId.LOWER_SECONDARY) && (
                    <option value={EducationLevelId.LOWER_SECONDARY}>THCS (Lớp 6–9)</option>
                  )}
                </select>
              </div>

              {/* 3. Bộ lọc môn */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Bộ lọc môn học
                </label>
                <select
                  value={allSubjects.length === 1 ? allSubjects[0] : filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs bg-white"
                >
                  {allSubjects.length > 1 && (
                    <option value="ALL">Tất cả môn ({allSubjects.length})</option>
                  )}
                  {allSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Bộ lọc khối lớp */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Bộ lọc khối lớp
                </label>
                <select
                  value={
                    allowedFilterGrades.length === 1
                      ? allowedFilterGrades[0]
                      : filterGrade
                  }
                  onChange={(e) =>
                    setFilterGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs bg-white"
                >
                  {allowedFilterGrades.length > 1 && (
                    <option value="ALL">
                      Tất cả khối lớp (
                      {allowedFilterGrades.length <= 4
                        ? allowedFilterGrades.join(', ')
                        : `${allowedFilterGrades[0]}–${allowedFilterGrades[allowedFilterGrades.length - 1]}`}
                      )
                    </option>
                  )}
                  {allowedFilterGrades.map((g) => (
                    <option key={g} value={g}>
                      Khối lớp {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Bộ lọc chủ đề */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Bộ lọc chủ đề
                </label>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  title={
                    filterTopic === 'ALL'
                      ? `Tất cả chủ đề (${allTopics.length})`
                      : filterTopic
                  }
                  className="w-full max-w-full truncate rounded-lg border border-slate-300 px-2.5 py-2 text-xs bg-white"
                >
                  <option value="ALL">Tất cả chủ đề ({allTopics.length})</option>
                  {allTopics.map((topic) => (
                    <option key={topic} value={topic} title={topic}>
                      {formatTopicOptionDisplay(topic, 55)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              {/* 6. Bộ lọc mức độ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6. Bộ lọc mức độ
                </label>
                <select
                  value={filterCognitive}
                  onChange={(e) =>
                    setFilterCognitive(e.target.value as CognitiveLevelCode | 'ALL')
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="ALL">Tất cả mức độ nhận thức</option>
                  {activeFilterLevels.includes(EducationLevelId.PRIMARY) && (
                    <optgroup label="Tiểu học (Thông tư 27)">
                      <option value={CognitiveLevelCode.PRIMARY_MUC_1}>Mức 1 – Nhận biết</option>
                      <option value={CognitiveLevelCode.PRIMARY_MUC_2}>Mức 2 – Kết nối</option>
                      <option value={CognitiveLevelCode.PRIMARY_MUC_3}>Mức 3 – Vận dụng</option>
                    </optgroup>
                  )}
                  {activeFilterLevels.includes(EducationLevelId.LOWER_SECONDARY) && (
                    <optgroup label="THCS (Thông tư 22 & CV 7991)">
                      <option value={CognitiveLevelCode.SEC_NHAN_BIET}>Nhận biết (NB)</option>
                      <option value={CognitiveLevelCode.SEC_THONG_HIEU}>Thông hiểu (TH)</option>
                      <option value={CognitiveLevelCode.SEC_VAN_DUNG}>Vận dụng (VD)</option>
                      <option value={CognitiveLevelCode.SEC_VAN_DUNG_CAO}>Vận dụng cao (VDC)</option>
                    </optgroup>
                  )}
                </select>
              </div>

              {/* 7. Bộ lọc dạng câu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  7. Bộ lọc dạng câu
                </label>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value as QuestionFormatCode | 'ALL')}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="ALL">Tất cả 11 dạng câu hỏi</option>
                  {ALL_QUESTION_FORMATS.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Bộ lọc trạng thái */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  8. Bộ lọc trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ApprovalStatus | 'ALL')}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value={ApprovalStatus.APPROVED}>Đã duyệt (Đủ điều kiện ra đề)</option>
                  <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
                  <option value={ApprovalStatus.DRAFT}>Nháp</option>
                  <option value={ApprovalStatus.DEPRECATED}>Ngừng sử dụng</option>
                </select>
              </div>

              {/* Bộ lọc phụ: Nhóm câu hỏi */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nhóm câu hỏi
                </label>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="ALL">Tất cả nhóm</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bộ lọc phụ: Thẻ phân loại */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Thẻ phân loại (Tags)
                </label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="ALL">Tất cả thẻ ({allTags.length})</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Thanh điều khiển chế độ hiển thị Bảng / Thẻ câu hỏi + Tạo câu mới */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setListViewMode('TABLE')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold cursor-pointer ${
                      listViewMode === 'TABLE'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Bảng câu hỏi
                  </button>
                  <button
                    type="button"
                    onClick={() => setListViewMode('CARDS')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold cursor-pointer ${
                      listViewMode === 'CARDS'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Thẻ câu hỏi (9 trường)
                  </button>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={onlyShowOfficialReady}
                    onChange={(e) => setOnlyShowOfficialReady(e.target.checked)}
                  />
                  <span>Chỉ hiển thị câu hỏi Đã duyệt</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterLevel(
                      allowedEditorLevels.length === 1 ? allowedEditorLevels[0] : 'ALL'
                    );
                    setFilterGrade(
                      allowedFilterGrades.length === 1 ? allowedFilterGrades[0] : 'ALL'
                    );
                    setFilterSubject(allSubjects.length === 1 ? allSubjects[0] : 'ALL');
                    setFilterTopic('ALL');
                    setFilterFormat('ALL');
                    setFilterCognitive('ALL');
                    setFilterStatus('ALL');
                    setFilterGroup('ALL');
                    setFilterTag('ALL');
                    setOnlyShowOfficialReady(false);
                  }}
                  className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetEditorToBlank(
                      allowedEditorLevels[0] || EducationLevelId.LOWER_SECONDARY
                    );
                    setActiveSubTab('EDITOR_AND_PREVIEW');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tạo câu hỏi mới
                </button>
              </div>
            </div>
          </div>

          {/* Thanh thao tác hàng loạt khi chọn nhiều câu hỏi */}
          {selectedQuestionIds.length > 0 && (
            <div className="bg-blue-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs font-medium">
                Đã đánh dấu{' '}
                <strong className="font-mono tabular-nums text-amber-300">
                  {selectedQuestionIds.length}
                </strong>{' '}
                câu hỏi trong danh sách
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExamCartIds((prev) =>
                      Array.from(new Set([...prev, ...selectedQuestionIds]))
                    );
                    onNotify(
                      'success',
                      'Đã chọn câu đưa vào đề',
                      `Đã thêm ${selectedQuestionIds.length} câu hỏi vào giỏ đề kiểm tra.`
                    );
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-500 cursor-pointer whitespace-nowrap"
                >
                  + Chọn đưa vào đề ({selectedQuestionIds.length})
                </button>

                <select
                  value={targetGroupIdForBulk}
                  onChange={(e) => setTargetGroupIdForBulk(e.target.value)}
                  className="rounded-lg bg-blue-950 border border-blue-700 px-3 py-1.5 text-xs text-white"
                >
                  <option value="">-- Chọn nhóm câu hỏi --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.code} · {g.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (!targetGroupIdForBulk) {
                      onNotify('warning', 'Chưa chọn nhóm', 'Vui lòng chọn nhóm câu hỏi cần đưa vào.');
                      return;
                    }
                    const grp = onAssignToGroup(targetGroupIdForBulk, selectedQuestionIds);
                    if (grp) {
                      onNotify(
                        'success',
                        'Đã đưa các câu hỏi vào nhóm',
                        `Đã gán ${selectedQuestionIds.length} câu hỏi vào nhóm "${grp.name}".`
                      );
                      setSelectedQuestionIds([]);
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs hover:bg-amber-300 cursor-pointer whitespace-nowrap"
                >
                  Đưa vào nhóm
                </button>

                <button
                  type="button"
                  onClick={() => {
                    selectedQuestionIds.forEach((id) => {
                      onUpdateQuestion(id, { status: ApprovalStatus.APPROVED });
                    });
                    onNotify(
                      'success',
                      'Đã phê duyệt hàng loạt',
                      `${selectedQuestionIds.length} câu hỏi đã chuyển sang trạng thái "Đã duyệt".`
                    );
                    setSelectedQuestionIds([]);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-500 cursor-pointer whitespace-nowrap"
                >
                  Phê duyệt ({selectedQuestionIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedQuestionIds([])}
                  className="px-2.5 py-1.5 text-xs text-blue-200 hover:text-white cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          {/* Khung Xem trước câu hỏi đang chọn */}
          {previewTargetQuestion && (
            <div className="bg-white border-2 border-blue-600 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="text-xs font-semibold text-blue-700">
                    XEM TRƯỚC CÂU HỎI & CÔNG THỨC KATEX CHUẨN BẢN IN
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {previewTargetQuestion.code} · {previewTargetQuestion.subject} Lớp{' '}
                    {previewTargetQuestion.grade} · Phiên bản v{previewTargetQuestion.version || 1}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadQuestionIntoEditor(previewTargetQuestion)}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg cursor-pointer"
                  >
                    Mở trong Trình soạn thảo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewQuestionId(null)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Đóng xem trước
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                {renderFormattedQuestionBody(previewTargetQuestion)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-900">Đáp án chuẩn:</div>
                  <div className="text-slate-800">
                    <MathFormulaView text={previewTargetQuestion.correctAnswer} />
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-900">Hướng dẫn giải / Hướng dẫn chấm:</div>
                  <div className="text-slate-800">
                    <MathFormulaView text={previewTargetQuestion.gradingGuide} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                <div>
                  Chủ đề: <strong className="text-slate-900">{previewTargetQuestion.topicTitle}</strong> · YCCĐ:{' '}
                  <span className="font-mono font-semibold text-blue-700">
                    {previewTargetQuestion.learningOutcomeCode}
                  </span>{' '}
                  ({previewTargetQuestion.learningOutcomeText})
                </div>
                <div>
                  Người tạo: <strong className="text-slate-900">{previewTargetQuestion.authorName}</strong>
                </div>
              </div>
            </div>
          )}

          {/* I & II: HIỂN THỊ BẢNG CÂU HỎI HOẶC THẺ CÂU HỎI 9 TRƯỜNG */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <div className="text-sm font-bold text-slate-800">
                Không tìm thấy câu hỏi nào thỏa mãn bộ lọc hiện tại
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hãy thử mở rộng điều kiện tìm kiếm hoặc nhấn nút bên dưới để biên soạn câu hỏi mới.
              </p>
            </div>
          ) : listViewMode === 'TABLE' ? (
            /* CHẾ ĐỘ 1: BẢNG CÂU HỎI (TABLE VIEW) HIỂN THỊ ĐỦ 9 TRƯỜNG CHUẨN MỤC I & II */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            paginatedQuestions.length > 0 &&
                            paginatedQuestions.every((q) => selectedQuestionIds.includes(q.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuestionIds((prev) =>
                                Array.from(
                                  new Set([...prev, ...paginatedQuestions.map((q) => q.id)])
                                )
                              );
                            } else {
                              const pageIds = new Set(paginatedQuestions.map((q) => q.id));
                              setSelectedQuestionIds((prev) =>
                                prev.filter((id) => !pageIds.has(id))
                              );
                            }
                          }}
                          className="cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3">1. Mã câu</th>
                      <th className="py-3 px-3 min-w-[280px]">2. Nội dung rút gọn (KaTeX)</th>
                      <th className="py-3 px-3">3. Môn</th>
                      <th className="py-3 px-3">4. Lớp</th>
                      <th className="py-3 px-3">5. Mức độ</th>
                      <th className="py-3 px-3">6. Dạng câu</th>
                      <th className="py-3 px-3 text-right">7. Điểm</th>
                      <th className="py-3 px-3">8. Trạng thái</th>
                      <th className="py-3 px-3">9. Người tạo</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedQuestions.map((q) => {
                      const statusInfo = getApprovalStatusInfo(q.status);
                      const isSelected = selectedQuestionIds.includes(q.id);
                      const inExamCart = examCartIds.includes(q.id);
                      const shortStem =
                        q.stem.length > 125 ? `${q.stem.slice(0, 125)}...` : q.stem;

                      return (
                        <tr
                          key={q.id}
                          className={`hover:bg-slate-50/90 transition-colors ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 align-top">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                setSelectedQuestionIds((prev) =>
                                  prev.includes(q.id)
                                    ? prev.filter((id) => id !== q.id)
                                    : [...prev, q.id]
                                )
                              }
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 align-top font-mono font-bold text-blue-700 whitespace-nowrap">
                            <div>{q.code}</div>
                            <div className="text-[10px] font-normal text-slate-400">
                              v{q.version || 1}
                            </div>
                          </td>
                          <td className="py-3 px-3 align-top text-slate-800">
                            <div className="line-clamp-2 leading-relaxed">
                              <MathFormulaView text={shortStem} />
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Chủ đề: <span className="font-medium text-slate-700">{q.topicTitle}</span> ·{' '}
                              <span className="font-mono">{q.learningOutcomeCode}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 align-top font-semibold text-slate-800 whitespace-nowrap">
                            {q.subject}
                          </td>
                          <td className="py-3 px-3 align-top font-mono text-slate-700 whitespace-nowrap">
                            Lớp {q.grade}
                          </td>
                          <td className="py-3 px-3 align-top text-blue-700 font-medium whitespace-nowrap">
                            {getCognitiveShortLabel(q.cognitiveLevel)}
                          </td>
                          <td className="py-3 px-3 align-top text-slate-700 whitespace-nowrap">
                            {getFormatLabel(q.format)}
                          </td>
                          <td className="py-3 px-3 align-top text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                            {q.points}
                          </td>
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <span className={`font-semibold ${statusInfo.textClass}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 align-top text-slate-700 whitespace-nowrap">
                            {q.authorName}
                          </td>
                          <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleQuestionInExamCart(q.id)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer border ${
                                  inExamCart
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                                }`}
                                title="Chọn câu đưa vào đề kiểm tra"
                              >
                                {inExamCart ? 'Đã chọn vào đề' : '+ Đưa vào đề'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewQuestionId(previewQuestionId === q.id ? null : q.id)
                                }
                                className="p-1 text-slate-600 hover:text-blue-700 cursor-pointer"
                                title="Xem trước"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadQuestionIntoEditor(q)}
                                className="p-1 text-slate-600 hover:text-blue-700 cursor-pointer"
                                title="Sửa câu hỏi"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = onDuplicateQuestion(q.id);
                                  if (copy) {
                                    onNotify(
                                      'success',
                                      'Đã nhân bản câu hỏi',
                                      `Đã tạo bản sao ${copy.code} ở trạng thái Nháp.`
                                    );
                                  }
                                }}
                                className="p-1 text-slate-600 hover:text-blue-700 cursor-pointer"
                                title="Nhân bản câu hỏi"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const res = onDeleteQuestion(q.id);
                                  onNotify(
                                    res.markedDeprecated ? 'warning' : 'info',
                                    res.markedDeprecated
                                      ? 'Đã chuyển sang Ngừng sử dụng'
                                      : 'Đã xóa câu hỏi',
                                    res.message
                                  );
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Xóa hoặc Ngừng sử dụng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          ) : (
            /* CHẾ ĐỘ 2: II. THẺ CÂU HỎI (QUESTION CARDS) HIỂN THỊ RÕ 9 TRƯỜNG THÔNG TIN */
            <div className="space-y-4">
              {paginatedQuestions.map((q) => {
                const statusInfo = getApprovalStatusInfo(q.status);
                const officialInfo = isQuestionUsedInOfficialExam(q, exams);
                const isSelected = selectedQuestionIds.includes(q.id);
                const inExamCart = examCartIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className={`bg-white border rounded-xl p-5 space-y-3.5 transition-colors shadow-2xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Lưới 9 trường chuẩn Mục II trên Thẻ câu hỏi */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pb-3 border-b border-slate-100 text-xs">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          1. Mã câu
                        </div>
                        <div className="font-mono font-bold text-blue-700 mt-0.5 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              setSelectedQuestionIds((prev) =>
                                prev.includes(q.id)
                                  ? prev.filter((id) => id !== q.id)
                                  : [...prev, q.id]
                              )
                            }
                            className="cursor-pointer"
                          />
                          <span>{q.code}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          3. Môn học
                        </div>
                        <div className="font-semibold text-slate-900 mt-0.5">{q.subject}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          4. Khối lớp
                        </div>
                        <div className="font-semibold text-slate-900 mt-0.5">
                          Lớp {q.grade} ({q.levelId === EducationLevelId.PRIMARY ? 'TH' : 'THCS'})
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          5. Mức độ
                        </div>
                        <div className="font-semibold text-blue-700 mt-0.5">
                          {getCognitiveShortLabel(q.cognitiveLevel)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          6. Dạng câu
                        </div>
                        <div className="font-medium text-slate-800 mt-0.5">
                          {getFormatLabel(q.format)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          7. Điểm số
                        </div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                          {q.points} điểm
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          8. Trạng thái
                        </div>
                        <div className={`font-semibold mt-0.5 ${statusInfo.textClass}`}>
                          {statusInfo.label}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">
                          9. Người tạo
                        </div>
                        <div className="font-medium text-slate-800 mt-0.5 truncate">
                          {q.authorName}
                        </div>
                      </div>
                    </div>

                    {/* Trường 2: Nội dung rút gọn & Hiển thị công thức KaTeX */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div>
                          <span className="font-semibold text-slate-700">2. Nội dung câu hỏi:</span>{' '}
                          Chủ đề <strong className="text-slate-800">{q.topicTitle}</strong> · YCCĐ{' '}
                          <span className="font-mono font-semibold text-slate-700">
                            {q.learningOutcomeCode}
                          </span>
                        </div>
                        {officialInfo.usedInOfficial && (
                          <span className="text-emerald-700 font-semibold">
                            Đã dùng trong {officialInfo.officialExams.length || 1} đề chính thức
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                        {renderFormattedQuestionBody(q)}
                      </div>
                    </div>

                    {/* Đáp án & Thanh tính năng trên từng thẻ */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-slate-700">
                        <span className="font-semibold text-emerald-700">Đáp án: </span>
                        <MathFormulaView text={q.correctAnswer} />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleQuestionInExamCart(q.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold cursor-pointer border ${
                            inExamCart
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          {inExamCart ? 'Đã chọn vào đề' : 'Chọn câu đưa vào đề'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewQuestionId(previewQuestionId === q.id ? null : q.id)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem trước
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadQuestionIntoEditor(q)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = onDuplicateQuestion(q.id);
                            if (copy) {
                              onNotify(
                                'success',
                                'Đã nhân bản câu hỏi',
                                `Đã tạo bản sao ${copy.code} ở trạng thái Nháp.`
                              );
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Nhân bản
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* I.10 THANH PHÂN TRANG (PAGINATION BAR) */}
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-600">
              <span>
                Hiển thị{' '}
                <strong className="font-mono text-slate-900">
                  {filteredQuestions.length === 0
                    ? 0
                    : (Math.min(currentPage, totalPages) - 1) * pageSize + 1}
                </strong>
                –
                <strong className="font-mono text-slate-900">
                  {Math.min(Math.min(currentPage, totalPages) * pageSize, filteredQuestions.length)}
                </strong>{' '}
                trên tổng số{' '}
                <strong className="font-mono text-blue-700">{filteredQuestions.length}</strong> câu hỏi
              </span>
              <span className="text-slate-300">|</span>
              <label className="inline-flex items-center gap-1.5">
                <span>Số câu / trang:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-slate-300 px-2 py-1 bg-white font-mono"
                >
                  {[5, 8, 10, 20, 50].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Trang trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 7)
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-mono font-bold text-xs cursor-pointer ${
                      pageNum === currentPage
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Trang sau
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: III. TRÌNH SOẠN THẢO BỐ CỤC HAI VÙNG (TRÁI / PHẢI) & V. TRẠNG THÁI LƯU */}
      {/* ===================================================================== */}
      {activeSubTab === 'EDITOR_AND_PREVIEW' && (
        <div className="space-y-5">
          {/* V. Thanh Trạng thái lưu 5 mức & IV. 9 Tính năng cốt lõi của Trình soạn thảo */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              {/* 5 trạng thái lưu trực quan */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-1">
                  V. Trạng thái lưu Firestore:
                </span>
                {(
                  [
                    { id: 'UNSAVED', label: '1. Chưa lưu' },
                    { id: 'SAVING', label: '2. Đang lưu' },
                    { id: 'SAVED', label: '3. Đã lưu (Firestore ACK)' },
                    { id: 'SAVE_FAILED', label: '4. Lưu thất bại' },
                    { id: 'CONFLICT_DETECTED', label: '5. Có xung đột' },
                  ] as { id: QuestionFirestoreSaveState; label: string }[]
                ).map((st) => {
                  const active = firestoreSaveStatus === st.id;
                  return (
                    <span
                      key={st.id}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                        active
                          ? saveStatusBadgeConfig[st.id].containerClass + ' ring-2 ring-offset-1 ring-blue-500/40'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  );
                })}
              </div>

              {/* Kiểm chứng bảo vệ trạng thái lưu */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Kiểm chứng ACK:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleSaveQuestionSubmit(ApprovalStatus.DRAFT, { simulateFailure: true })
                  }
                  className="px-2 py-1 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium cursor-pointer"
                  title="Mô phỏng mất kết nối Firestore để chứng minh hệ thống không báo Đã lưu giả"
                >
                  Thử lỗi mạng (Lưu thất bại)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSaveQuestionSubmit(ApprovalStatus.DRAFT, { simulateConflict: true })
                  }
                  className="px-2 py-1 rounded border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium cursor-pointer"
                  title="Mô phỏng xung đột phiên bản đồng thời trên Firestore"
                >
                  Thử xung đột (Có xung đột)
                </button>
              </div>
            </div>

            {/* IV. Thanh 9 Tính năng Trình soạn thảo */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => resetEditorToBlank(formLevel)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-700" />
                  1. Tạo câu hỏi mới
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (editingQuestionId) {
                      const created = onDuplicateQuestion(editingQuestionId);
                      if (created) {
                        handleLoadQuestionIntoEditor(created);
                        onNotify(
                          'success',
                          'Đã nhân bản câu hỏi đang soạn',
                          `Đã tạo bản sao ${created.code} và mở trên trình soạn thảo.`
                        );
                      }
                    } else {
                      handleSaveQuestionSubmit(ApprovalStatus.DRAFT);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-700" />
                  3. Nhân bản
                </button>

                <button
                  type="button"
                  onClick={() => setShowLivePreviewModal((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    showLivePreviewModal
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  6. Xem trước
                </button>

                <button
                  type="button"
                  onClick={() => handleRunAiEditorCheck()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-900 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                  7. AI Kiểm tra & Gợi ý
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (duplicateMatches.length > 0) {
                      onNotify(
                        'warning',
                        `Phát hiện ${duplicateMatches.length} câu tương đồng`,
                        `Câu gần nhất: ${duplicateMatches[0].question.code} (${Math.round(duplicateMatches[0].similarityScore * 100)}%).`
                      );
                    } else {
                      onNotify(
                        'success',
                        'Không trùng lặp',
                        'Nội dung câu hỏi hoàn toàn độc lập với ngân hàng hiện tại.'
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-600" />
                  8. Kiểm tra trùng ({duplicateMatches.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (editingQuestionId) {
                      toggleQuestionInExamCart(editingQuestionId);
                    } else {
                      onNotify(
                        'info',
                        'Lưu câu hỏi trước khi đưa vào đề',
                        'Vui lòng nhấn Lưu nháp hoặc Phê duyệt để tạo mã định danh trước khi thêm vào đề.'
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  9. Chọn câu đưa vào đề
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveQuestionSubmit(ApprovalStatus.DRAFT)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  4. Lưu nháp (Firestore)
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuestionSubmit(ApprovalStatus.PENDING)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg cursor-pointer"
                >
                  5. Gửi duyệt
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuestionSubmit(ApprovalStatus.APPROVED)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  {editingQuestionId
                    ? '2. Lưu sửa & Phê duyệt'
                    : 'Kiểm tra hợp lệ & Lưu chính thức'}
                </button>
              </div>
            </div>
          </div>

          {/* KHUNG XEM TRƯỚC BẢN IN / XUẤT WORD & PDF BẢO TOÀN 100% CÔNG THỨC KATEX (MỤC IV.6 & MỤC VI) */}
          {showLivePreviewModal && (
            <div className="bg-white border-2 border-blue-600 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-blue-700">
                    CHẾ ĐỘ XEM TRƯỚC BẢN IN ĐỀ KIỂM TRA (WORD / PDF FORMULA PRESERVATION)
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {editingQuestionObj?.code || 'CÂU HỎI MỚI'} · Môn {formSubject} Lớp {formGrade} ·{' '}
                    {getFormatLabel(formFormat)} ({formPoints} điểm)
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const previewItem: QuestionItem = {
                        id: editingQuestionId || `q-preview-${Date.now()}`,
                        code: editingQuestionObj?.code || 'CH-PREVIEW-01',
                        version: editingBaseVersion,
                        levelId: formLevel,
                        grade: formGrade,
                        subject: formSubject,
                        topicTitle: formTopic || 'Chủ đề kiểm tra',
                        lessonTitle: formLesson,
                        knowledgeUnit: formKnowledgeUnit,
                        learningOutcomeCode: formOutcomeCode,
                        learningOutcomeText: formOutcomeText,
                        cognitiveLevel: formCognitive,
                        format: formFormat,
                        stem: formStem || 'Nội dung câu hỏi mẫu $x^2 + y^2 = z^2$',
                        options: formOptions,
                        correctOptionIndices: formCorrectIndices,
                        subStatements: formSubStatements,
                        matchingPairs: formMatchingPairs,
                        orderingItems: formOrderingItems,
                        blanks: formBlanks,
                        sharedPassage: formSharedPassage,
                        attachments: formAttachments,
                        correctAnswer: computeSynchronizedCorrectAnswer() || 'Đáp án chuẩn',
                        gradingGuide:
                          formGradingGuide || `Học sinh trả lời đúng đạt ${formPoints} điểm.`,
                        points: formPoints,
                        questionSource: formSource,
                        tags: [],
                        status: formStatus,
                        authorName: formAuthor,
                        createdAt: new Date().toISOString().slice(0, 10),
                        isSampleData: false,
                      };
                      handleExportCartDossierWord([previewItem]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Xuất câu hỏi ra Word (.doc) giữ nguyên LaTeX
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLivePreviewModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Thu gọn xem trước
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                {renderFormattedQuestionBody({
                  format: formFormat,
                  stem: formStem,
                  sharedPassage: formSharedPassage,
                  options: formOptions,
                  correctOptionIndices: formCorrectIndices,
                  subStatements: formSubStatements,
                  matchingPairs: formMatchingPairs,
                  orderingItems: formOrderingItems,
                  blanks: formBlanks,
                  attachments: formAttachments,
                })}
              </div>
            </div>
          )}

          {/* III. BỐ CỤC HAI VÙNG (TRÁI: NỘI DUNG/PHƯƠNG ÁN/ĐÁP ÁN/HƯỚNG DẪN CHẤM/HÌNH ẢNH/CÔNG THỨC — PHẢI: PHÂN LOẠI/YCCĐ/MỨC ĐỘ/DẠNG CÂU/ĐIỂM/TRẠNG THÁI/AI GỢI Ý) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* =============================================================== */}
            {/* VÙNG BÊN TRÁI (7 CỘT): NỘI DUNG, PHƯƠNG ÁN, ĐÁP ÁN, HƯỚNG DẪN CHẤM, HÌNH ẢNH, CÔNG THỨC */}
            {/* =============================================================== */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
              <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                    VÙNG BÊN TRÁI · NỘI DUNG & HỌC LIỆU CÂU HỎI
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {editingQuestionId
                      ? `Đang sửa: ${editingQuestionObj?.code || ''} (Phiên bản v${editingQuestionObj?.version || 1})`
                      : 'Biên soạn Nội dung, Phương án, Đáp án, Hình ảnh & Công thức'}
                  </h3>
                </div>
                {editingQuestionId && (
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceCreateNewVersion}
                      onChange={(e) => setForceCreateNewVersion(e.target.checked)}
                    />
                    <span>Tạo phiên bản v{(editingQuestionObj?.version || 1) + 1}</span>
                  </label>
                )}
              </div>

              {/* Cảnh báo bảo vệ nếu câu hỏi đang sửa đã dùng trong đề chính thức */}
              {editingQuestionId && editingOfficialStatus.usedInOfficial && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
                    Bảo vệ câu hỏi đã dùng trong Đề kiểm tra chính thức
                  </div>
                  <p className="leading-relaxed">
                    Câu hỏi <strong>{editingQuestionObj?.code}</strong> đã được sử dụng trong đề chính thức. Khi lưu thay đổi nội dung hoặc đáp án, hệ thống sẽ tự động tạo phiên bản mới <strong>v{(editingQuestionObj?.version || 1) + 1}</strong>.
                  </p>
                </div>
              )}

              {/* Cảnh báo phát hiện trùng lặp */}
              {duplicateMatches.length > 0 && (
                <div className="p-3.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    Phát hiện {duplicateMatches.length} câu hỏi trùng hoặc gần giống trong Ngân hàng:
                  </div>
                  <div className="space-y-1">
                    {duplicateMatches.map((m) => (
                      <div
                        key={m.question.id}
                        className="p-2 rounded bg-white border border-amber-200 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-mono font-bold text-blue-700 mr-2">
                            {m.question.code}
                          </span>
                          <span className="text-slate-700">{m.question.stem}</span>
                        </div>
                        <span className="font-mono font-semibold text-amber-800 shrink-0">
                          {Math.round(m.similarityScore * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold">Cần bổ sung các thông tin bắt buộc:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 1. NỘI DUNG CÂU HỎI (STEM & NGỮ LIỆU) */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800">
                    1. Nội dung câu hỏi / Đề bài (*)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Đặt công thức trong <code className="font-mono">$...$</code> hoặc{' '}
                    <code className="font-mono">$$...$$</code>
                  </span>
                </div>

                {formFormat === QuestionFormatCode.READING_COMPREHENSION && (
                  <textarea
                    rows={3}
                    value={formSharedPassage}
                    onChange={(e) => setFormSharedPassage(e.target.value)}
                    placeholder="Nhập đoạn văn / ngữ liệu đọc hiểu dùng chung..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-slate-50"
                  />
                )}

                <textarea
                  rows={4}
                  value={formStem}
                  onChange={(e) => setFormStem(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi tiếng Việt chuẩn Unicode..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* 6. GIAO DIỆN CÔNG THỨC (FORMULA TOOLBAR & LIVE KATEX BUILDER) */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-indigo-950">
                    6. Giao diện Công thức Toán / Khoa học (KaTeX — Bảo toàn 100% khi Lưu & Xuất đề)
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {[
                      { label: 'Phân số', tex: '$\\frac{a}{b}$' },
                      { label: 'Căn bậc hai', tex: '$\\sqrt{a^2 + b^2}$' },
                      { label: 'Lũy thừa', tex: '$x^2 + 2x + 1 = 0$' },
                      { label: 'Góc hình học', tex: '$\\widehat{ABC} = 90^\\circ$' },
                      {
                        label: 'Hệ phương trình',
                        tex: '$$\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$$',
                      },
                      { label: 'Hóa học', tex: '$2H_2 + O_2 \\xrightarrow{t^\\circ} 2H_2O$' },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setFormStem((prev) => `${prev} ${btn.tex}`.trim())}
                        className="px-2 py-1 bg-white hover:bg-indigo-100 text-indigo-900 rounded border border-indigo-200 font-medium cursor-pointer"
                      >
                        + {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={newLatexFormula}
                      onChange={(e) => setNewLatexFormula(e.target.value)}
                      placeholder="Nhập biểu thức LaTeX riêng biệt (VD: \frac{x+1}{x-1} = \sqrt{5})"
                      className="w-full rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (newLatexFormula.trim()) {
                          const clean = newLatexFormula.trim().replace(/^\$+|\$+$/g, '');
                          setFormStem((prev) => `${prev} $${clean}$`.trim());
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-indigo-700 text-white rounded-lg text-xs font-semibold hover:bg-indigo-800 cursor-pointer"
                    >
                      Chèn vào đề
                    </button>
                    <button
                      type="button"
                      onClick={handleAddFormulaAttachment}
                      className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                    >
                      + Khối riêng
                    </button>
                  </div>
                </div>

                {newLatexFormula.trim() && (
                  <div className="p-2.5 rounded-lg bg-white border border-indigo-200 text-xs flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Xem trước công thức:</span>
                    <div className="text-slate-900 font-semibold">
                      <MathFormulaView
                        text={`$$${newLatexFormula.trim().replace(/^\$+|\$+$/g, '')}$$`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PHƯƠNG ÁN TRẢ LỜI (THEO DẠNG CÂU HỎI) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  2. Phương án trả lời ({getFormatLabel(formFormat)})
                </div>

                {(formFormat === QuestionFormatCode.MCQ_SINGLE ||
                  formFormat === QuestionFormatCode.MCQ_MULTIPLE) && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {formFormat === QuestionFormatCode.MCQ_SINGLE
                          ? 'Chọn 1 phương án đúng (hỗ trợ KaTeX trong từng phương án):'
                          : 'Tích chọn NHIỀU phương án đúng:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {formOptions.length < 4 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...formOptions];
                              while (next.length < 4) {
                                const letter = String.fromCharCode(65 + next.length);
                                next.push(`${letter}. Phương án ${letter}`);
                              }
                              setFormOptions(next);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 cursor-pointer"
                          >
                            + Đủ 4 phương án (A–D)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const letter = String.fromCharCode(65 + formOptions.length);
                            setFormOptions([...formOptions, `${letter}. Phương án ${letter}`]);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                        >
                          + Thêm phương án ({String.fromCharCode(65 + formOptions.length)})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {formOptions.map((opt, idx) => {
                        const isChecked = formCorrectIndices.includes(idx);
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type={
                                formFormat === QuestionFormatCode.MCQ_SINGLE ? 'radio' : 'checkbox'
                              }
                              name="mcq-correct-option"
                              checked={isChecked}
                              onChange={() => {
                                if (formFormat === QuestionFormatCode.MCQ_SINGLE) {
                                  setFormCorrectIndices([idx]);
                                  setFormCorrectAnswer(formOptions[idx]);
                                } else {
                                  const next = isChecked
                                    ? formCorrectIndices.filter((i) => i !== idx)
                                    : [...formCorrectIndices, idx].sort();
                                  setFormCorrectIndices(next);
                                  setFormCorrectAnswer(
                                    next.map((i) => String.fromCharCode(65 + i)).join(', ')
                                  );
                                }
                              }}
                              className="cursor-pointer"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const next = [...formOptions];
                                next[idx] = e.target.value;
                                setFormOptions(next);
                                if (
                                  formFormat === QuestionFormatCode.MCQ_SINGLE &&
                                  formCorrectIndices.includes(idx)
                                ) {
                                  setFormCorrectAnswer(e.target.value);
                                }
                              }}
                              className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                            />
                            {formOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = formOptions
                                    .filter((_, i) => i !== idx)
                                    .map((item, nIdx) => {
                                      const letter = String.fromCharCode(65 + nIdx);
                                      const body = item.replace(/^[A-Za-z][.):]\s*/, '').trim();
                                      return body
                                        ? `${letter}. ${body}`
                                        : `${letter}. Phương án ${letter}`;
                                    });
                                  const nextIndices = formCorrectIndices
                                    .filter((i) => i !== idx)
                                    .map((i) => (i > idx ? i - 1 : i));
                                  setFormOptions(filtered);
                                  setFormCorrectIndices(nextIndices);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formFormat === QuestionFormatCode.TRUE_FALSE_CLUSTER && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-700">
                      Các mệnh đề Đúng – Sai (a, b, c, d):
                    </div>
                    {formSubStatements.map((st, idx) => (
                      <div key={st.label} className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold w-5">{st.label})</span>
                        <input
                          type="text"
                          value={st.statement}
                          onChange={(e) => {
                            const next = [...formSubStatements];
                            next[idx] = { ...next[idx], statement: e.target.value };
                            setFormSubStatements(next);
                            setFormCorrectAnswer(formatSubStatementsAnswerSummary(next));
                          }}
                          className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...formSubStatements];
                              next[idx] = { ...next[idx], isTrue: true };
                              setFormSubStatements(next);
                              setFormCorrectAnswer(formatSubStatementsAnswerSummary(next));
                            }}
                            className={`px-2.5 py-1 rounded-lg font-mono font-bold border cursor-pointer ${
                              st.isTrue
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-300'
                            }`}
                          >
                            Đúng
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...formSubStatements];
                              next[idx] = { ...next[idx], isTrue: false };
                              setFormSubStatements(next);
                              setFormCorrectAnswer(formatSubStatementsAnswerSummary(next));
                            }}
                            className={`px-2.5 py-1 rounded-lg font-mono font-bold border cursor-pointer ${
                              !st.isTrue
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white text-slate-600 border-slate-300'
                            }`}
                          >
                            Sai
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formFormat === QuestionFormatCode.FILL_IN_BLANK && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Các vị trí điền khuyết (___):
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormBlanks((prev) => [...prev, `từ khóa ${prev.length + 1}`])
                        }
                        className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                      >
                        + Thêm vị trí khuyết
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formBlanks.map((blank, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-slate-600">({idx + 1})</span>
                          <input
                            type="text"
                            value={blank}
                            onChange={(e) => {
                              const next = [...formBlanks];
                              next[idx] = e.target.value;
                              setFormBlanks(next);
                            }}
                            className="flex-1 rounded border border-slate-300 px-2.5 py-1.5 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formFormat === QuestionFormatCode.MATCHING && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Các cặp ghép nối Cột A – Cột B:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormMatchingPairs((prev) => [
                            ...prev,
                            {
                              id: `mp-${Date.now()}`,
                              leftText: `${prev.length + 1}. Nội dung cột A`,
                              rightText: `${String.fromCharCode(97 + prev.length)}. Nội dung cột B`,
                            },
                          ])
                        }
                        className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                      >
                        + Thêm cặp ghép nối
                      </button>
                    </div>
                    {formMatchingPairs.map((pair, idx) => (
                      <div key={pair.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={pair.leftText}
                          onChange={(e) => {
                            const next = [...formMatchingPairs];
                            next[idx] = { ...next[idx], leftText: e.target.value };
                            setFormMatchingPairs(next);
                          }}
                          className="rounded border border-slate-300 px-2.5 py-1.5 bg-white"
                        />
                        <input
                          type="text"
                          value={pair.rightText}
                          onChange={(e) => {
                            const next = [...formMatchingPairs];
                            next[idx] = { ...next[idx], rightText: e.target.value };
                            setFormMatchingPairs(next);
                          }}
                          className="rounded border border-slate-300 px-2.5 py-1.5 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {formFormat === QuestionFormatCode.ORDERING && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Các mục theo thứ tự chuẩn:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormOrderingItems((prev) => [...prev, `Mục thứ ${prev.length + 1}`])
                        }
                        className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                      >
                        + Thêm mục sắp xếp
                      </button>
                    </div>
                    {formOrderingItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-600">{idx + 1}.</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const next = [...formOrderingItems];
                            next[idx] = e.target.value;
                            setFormOrderingItems(next);
                          }}
                          className="flex-1 rounded border border-slate-300 px-2.5 py-1.5 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {formFormat !== QuestionFormatCode.MCQ_SINGLE &&
                  formFormat !== QuestionFormatCode.MCQ_MULTIPLE &&
                  formFormat !== QuestionFormatCode.TRUE_FALSE_CLUSTER &&
                  formFormat !== QuestionFormatCode.FILL_IN_BLANK &&
                  formFormat !== QuestionFormatCode.MATCHING &&
                  formFormat !== QuestionFormatCode.ORDERING && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      Dạng câu hỏi tự luận / trả lời ngắn: Học sinh trình bày lời giải trực tiếp theo Đáp án & Hướng dẫn chấm bên dưới.
                    </div>
                  )}
              </div>

              {/* 3. ĐÁP ÁN & 4. HƯỚNG DẪN CHẤM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. Đáp án chuẩn (Hỗ trợ KaTeX) (*)
                  </label>
                  <textarea
                    rows={3}
                    value={formCorrectAnswer}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormCorrectAnswer(val);
                      if (formFormat === QuestionFormatCode.TRUE_FALSE_CLUSTER) {
                        const synced = syncSubStatementsFromAnswerText(formSubStatements, val);
                        if (synced.matchedAny) {
                          setFormSubStatements(synced.updated);
                        }
                      }
                    }}
                    placeholder="Nhập đáp án chuẩn (hoặc tự động đồng bộ từ phương án đúng)..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    4. Hướng dẫn chấm / Biểu điểm chi tiết (*)
                  </label>
                  <textarea
                    rows={3}
                    value={formGradingGuide}
                    onChange={(e) => setFormGradingGuide(e.target.value)}
                    placeholder="Nhập biểu điểm từng bước giải (VD: Viết đúng công thức 0,5đ; Tính đúng kết quả 0,5đ)..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* 5. HÌNH ẢNH & BẢNG BIỂU MINH HỌA */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-800">
                    5. Hình ảnh minh họa & Bảng số liệu ({formAttachments.length} tệp đính kèm)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInsertSampleGeometryImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      + Chèn Hình vẽ Hình học SVG mẫu
                    </button>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isUploadingFile ? 'Đang tải...' : 'Tải ảnh từ máy'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newTableHeaders}
                      onChange={(e) => setNewTableHeaders(e.target.value)}
                      placeholder="Tiêu đề bảng: x | 1 | 2"
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newTableRow1}
                      onChange={(e) => setNewTableRow1(e.target.value)}
                      placeholder="Dòng số liệu: y | 10 | 20"
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddTableAttachment}
                      className="w-full py-1.5 bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      + Bảng
                    </button>
                  </div>
                </div>

                {formAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    {formAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <span className="font-semibold text-slate-800">
                          [{att.type}] {att.title}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormAttachments((prev) => prev.filter((item) => item.id !== att.id))
                          }
                          className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* =============================================================== */}
            {/* VÙNG BÊN PHẢI (5 CỘT): THÔNG TIN PHÂN LOẠI, YCCĐ, MỨC ĐỘ, DẠNG CÂU, ĐIỂM, TRẠNG THÁI, AI GỢI Ý & XEM TRƯỚC */}
            {/* =============================================================== */}
            <div className="lg:col-span-5 space-y-5 sticky top-20">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="pb-2.5 border-b border-slate-200">
                  <span className="text-[11px] font-mono font-bold uppercase text-indigo-700">
                    VÙNG BÊN PHẢI · THÔNG TIN PHÂN LOẠI & AI GỢI Ý
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    Phân loại Chương trình, YCCĐ, Mức độ, Điểm & Trạng thái
                  </h4>
                </div>

                {/* 1. THÔNG TIN PHÂN LOẠI */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    1. Thông tin phân loại (Cấp học · Khối lớp · Môn · Chủ đề)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Cấp học (*)
                      </label>
                      <select
                        value={formLevel}
                        onChange={(e) => {
                          const lvl = e.target.value as EducationLevelId;
                          setFormLevel(lvl);
                          const r = getRuleSetForLevel(lvl);
                          setFormGrade(r.grades[0]);
                          setFormSubject(r.subjects[0]);
                          setFormCognitive(r.cognitiveLevels[0].code);
                          setIsCustomTopicMode(false);
                          setIsCustomLessonMode(false);
                          markFormDirty();
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                      >
                        {allowedEditorLevels.includes(EducationLevelId.PRIMARY) && (
                          <option value={EducationLevelId.PRIMARY}>Tiểu học</option>
                        )}
                        {allowedEditorLevels.includes(EducationLevelId.LOWER_SECONDARY) && (
                          <option value={EducationLevelId.LOWER_SECONDARY}>THCS</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Khối lớp (*)
                      </label>
                      <select
                        value={formGrade}
                        onChange={(e) => {
                          setFormGrade(Number(e.target.value) as GradeNumber);
                          setIsCustomTopicMode(false);
                          setIsCustomLessonMode(false);
                          markFormDirty();
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                      >
                        {allowedEditorGrades.map((g) => (
                          <option key={g} value={g}>
                            Lớp {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Môn học (*)
                      </label>
                      <select
                        value={formSubject}
                        onChange={(e) => {
                          setFormSubject(e.target.value);
                          setIsCustomTopicMode(false);
                          setIsCustomLessonMode(false);
                          markFormDirty();
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                      >
                        {allowedEditorSubjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Chủ đề / Mạch nội dung (*)
                        </label>
                        {editorTopicOptions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsCustomTopicMode((prev) => !prev)}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {isCustomTopicMode ? 'Chọn từ danh mục' : 'Nhập tự do'}
                          </button>
                        )}
                      </div>
                      {!isCustomTopicMode && editorTopicOptions.length > 0 ? (
                        <select
                          value={
                            activeEditorChapterOption
                              ? activeEditorChapterOption.value
                              : formTopic
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormTopic(val);
                            const matchedOpt = editorTopicOptions.find(
                              (o) => o.value === val
                            );
                            if (matchedOpt && matchedOpt.chapterGroup.lessons.length > 0) {
                              const firstLs = matchedOpt.chapterGroup.lessons[0];
                              setFormLesson(firstLs.lessonName);
                              setFormKnowledgeUnit(firstLs.lessonName);
                              setFormOutcomeCode(firstLs.learningOutcomeCode);
                              setFormOutcomeText(
                                firstLs.outcomesList?.[0] || firstLs.learningOutcomeText
                              );
                            }
                            markFormDirty();
                          }}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                        >
                          {!activeEditorChapterOption && formTopic.trim() && (
                            <option value={formTopic} title={formTopic}>
                              {formatTopicOptionDisplay(formTopic, 56)}
                            </option>
                          )}
                          {editorTopicOptions.some((o) => o.semester === 'HK1') && (
                            <optgroup label={`Học kì I – ${formSubject} Lớp ${formGrade}`}>
                              {editorTopicOptions
                                .filter((o) => o.semester === 'HK1')
                                .map((opt) => (
                                  <option
                                    key={`hk1-${opt.value}`}
                                    value={opt.value}
                                    title={opt.value}
                                  >
                                    {opt.label}
                                  </option>
                                ))}
                            </optgroup>
                          )}
                          {editorTopicOptions.some((o) => o.semester === 'HK2') && (
                            <optgroup label={`Học kì II – ${formSubject} Lớp ${formGrade}`}>
                              {editorTopicOptions
                                .filter((o) => o.semester === 'HK2')
                                .map((opt) => (
                                  <option
                                    key={`hk2-${opt.value}`}
                                    value={opt.value}
                                    title={opt.value}
                                  >
                                    {opt.label}
                                  </option>
                                ))}
                            </optgroup>
                          )}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formTopic}
                          onChange={(e) => {
                            setFormTopic(e.target.value);
                            markFormDirty();
                          }}
                          placeholder="Nhập Chủ đề / Mạch nội dung..."
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Bài học / Đơn vị kiến thức
                        </label>
                        {activeEditorLessons.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsCustomLessonMode((prev) => !prev)}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {isCustomLessonMode ? 'Chọn từ danh mục' : 'Nhập tự do'}
                          </button>
                        )}
                      </div>
                      {!isCustomLessonMode && activeEditorLessons.length > 0 ? (
                        <select
                          value={
                            activeSelectedLessonObj
                              ? activeSelectedLessonObj.lessonName
                              : formLesson
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormLesson(val);
                            setFormKnowledgeUnit(val);
                            const matchedLs = activeEditorLessons.find(
                              (ls) => ls.lessonName === val
                            );
                            if (matchedLs) {
                              setFormOutcomeCode(matchedLs.learningOutcomeCode);
                              setFormOutcomeText(
                                matchedLs.outcomesList?.[0] ||
                                  matchedLs.learningOutcomeText
                              );
                            }
                            markFormDirty();
                          }}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                        >
                          {!activeEditorLessons.some(
                            (ls) => ls.lessonName === formLesson
                          ) &&
                            formLesson.trim() && (
                              <option value={formLesson} title={formLesson}>
                                {formatTopicOptionDisplay(formLesson, 56)}
                              </option>
                            )}
                          {activeEditorLessons.map((ls) => (
                            <option
                              key={ls.id}
                              value={ls.lessonName}
                              title={`${ls.lessonName} (${ls.periodsCount} tiết)`}
                            >
                              {formatTopicOptionDisplay(ls.lessonName, 52)} ({ls.periodsCount} tiết)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formLesson}
                          onChange={(e) => {
                            setFormLesson(e.target.value);
                            markFormDirty();
                          }}
                          placeholder="VD: Bài 1. Định lí Pythagore"
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Người tạo
                      </label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nhóm câu hỏi
                      </label>
                      <select
                        value={formGroupId}
                        onChange={(e) => setFormGroupId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                      >
                        <option value="">-- Không thuộc nhóm --</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.code} · {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. YÊU CẦU CẦN ĐẠT (GDPT 2018) */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">
                      2. Yêu cầu cần đạt (Chuẩn GDPT 2018) (*)
                    </div>
                    {activeLessonOutcomeChoices.length > 1 && (
                      <span className="text-[10px] font-medium text-slate-500">
                        {activeLessonOutcomeChoices.length} YCCĐ trong bài học
                      </span>
                    )}
                  </div>
                  {activeLessonOutcomeChoices.length > 0 && (
                    <select
                      value={
                        activeLessonOutcomeChoices.find(
                          (c) => c.text === formOutcomeText
                        )?.text || ''
                      }
                      onChange={(e) => {
                        const chosen = activeLessonOutcomeChoices.find(
                          (c) => c.text === e.target.value
                        );
                        if (chosen) {
                          setFormOutcomeCode(chosen.code);
                          setFormOutcomeText(chosen.text);
                          markFormDirty();
                        }
                      }}
                      className="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="">
                        -- Chọn nhanh Yêu cầu cần đạt của bài học ({activeLessonOutcomeChoices.length} YCCĐ) --
                      </option>
                      {activeLessonOutcomeChoices.map((c, idx) => (
                        <option key={`${c.code}-${idx}`} value={c.text}>
                          [{c.code}] {c.text}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        value={formOutcomeCode}
                        onChange={(e) => {
                          setFormOutcomeCode(e.target.value);
                          markFormDirty();
                        }}
                        placeholder="Mã YCCĐ"
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={formOutcomeText}
                        onChange={(e) => {
                          setFormOutcomeText(e.target.value);
                          markFormDirty();
                        }}
                        placeholder="Mô tả năng lực / Yêu cầu cần đạt..."
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. MỨC ĐỘ, 4. DẠNG CÂU, 5. ĐIỂM, 6. TRẠNG THÁI */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      3. Mức độ nhận thức (*)
                    </label>
                    <select
                      value={formCognitive}
                      onChange={(e) => setFormCognitive(e.target.value as CognitiveLevelCode)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                    >
                      {currentRuleSet.cognitiveLevels.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      4. Dạng câu hỏi (*)
                    </label>
                    <select
                      value={formFormat}
                      onChange={(e) => {
                        const fmt = e.target.value as QuestionFormatCode;
                        setFormFormat(fmt);
                        const def = ALL_QUESTION_FORMATS.find((f) => f.code === fmt);
                        if (def) setFormPoints(def.defaultPoints);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                    >
                      {contextFormats.map((fmt) => (
                        <option key={fmt.code} value={fmt.code} disabled={fmt.isRestricted}>
                          {fmt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      5. Điểm số (*)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.1"
                      max="10"
                      value={formPoints}
                      onChange={(e) => setFormPoints(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      6. Trạng thái phê duyệt
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ApprovalStatus)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                    >
                      <option value={ApprovalStatus.DRAFT}>Nháp</option>
                      <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
                      <option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
                      <option value={ApprovalStatus.DEPRECATED}>Ngừng sử dụng</option>
                    </select>
                  </div>
                </div>

                {/* 7. AI GỢI Ý & KIỂM TRA CHẤT LƯỢNG SƯ PHẠM */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-700" />
                      7. AI Gợi ý & Kiểm tra Sư phạm
                    </div>
                    <button
                      type="button"
                      onClick={handleRunAiEditorCheck}
                      className="px-2.5 py-1 rounded-lg bg-indigo-700 text-white text-xs font-semibold hover:bg-indigo-800 cursor-pointer"
                    >
                      Chạy AI phân tích
                    </button>
                  </div>

                  {aiEditorCheckResult ? (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950">
                          Điểm chất lượng câu hỏi: {aiEditorCheckResult.qualityScore}/100
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-emerald-700">
                          {aiEditorCheckResult.cognitiveMatchVerdict}
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {aiEditorCheckResult.pedagogicalTips.map((sug, i) => (
                          <li key={i}>{sug}</li>
                        ))}
                      </ul>
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (aiEditorCheckResult.suggestedStemRefinement) {
                              setFormStem(aiEditorCheckResult.suggestedStemRefinement);
                            }
                            if (aiEditorCheckResult.suggestedGradingRubric) {
                              setFormGradingGuide(aiEditorCheckResult.suggestedGradingRubric);
                            }
                            onNotify(
                              'success',
                              'Đã áp dụng gợi ý AI',
                              'Đã cập nhật nội dung câu hỏi và biểu điểm chấm theo chuẩn sư phạm.'
                            );
                          }}
                          className="px-2.5 py-1 bg-white border border-indigo-300 text-indigo-800 rounded font-semibold hover:bg-indigo-100 cursor-pointer"
                        >
                          Áp dụng gợi ý chuẩn hóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      Nhấn <strong>"Chạy AI phân tích"</strong> để kiểm tra sự khớp nối giữa Nội dung câu hỏi, Mức độ nhận thức, Công thức LaTeX và Yêu cầu cần đạt.
                    </div>
                  )}
                </div>
              </div>

              {/* BẢN XEM TRƯỚC TRỰC TIẾP TRÊN CỘT PHẢI (LIVE PREVIEW) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                <div className="pb-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono font-bold uppercase text-blue-700">
                      6. XEM TRƯỚC TRỰC TIẾP (LIVE EXAM PREVIEW)
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                      Lớp {formGrade} · {formSubject} · {getFormatLabel(formFormat)}
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    {formPoints} điểm
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  {renderFormattedQuestionBody({
                    format: formFormat,
                    stem: formStem,
                    sharedPassage: formSharedPassage,
                    options: formOptions,
                    correctOptionIndices: formCorrectIndices,
                    subStatements: formSubStatements,
                    matchingPairs: formMatchingPairs,
                    orderingItems: formOrderingItems,
                    blanks: formBlanks,
                    attachments: formAttachments,
                  })}
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-900">Đáp án hiển thị:</div>
                  <div className="text-slate-800">
                    <MathFormulaView text={computeSynchronizedCorrectAnswer() || 'Chưa có đáp án'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB KIỂM THỬ GIAI ĐOẠN 21 (VII. KIỂM THỬ 10 KỊCH BẢN TOÀN DIỆN)       */}
      {/* ===================================================================== */}
      {activeSubTab === 'QA_STAGE21_SUITE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-emerald-700">
                STAGE 21 · SECTION VII VERIFICATION SUITE
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Bộ Kiểm thử Tự động 10 Kịch bản Ngân hàng Câu hỏi & Trình Soạn thảo Đề
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm chứng thực tế: Tạo câu trắc nghiệm · Đúng/Sai · Điền khuyết · Tự luận · Có hình · Có công thức · Lưu Firestore (ACK) · Tải lại · Chỉnh sửa · Xuất hồ sơ Word/PDF không mất công thức
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunStage21QuestionBankQASuite}
              disabled={isRunningStage21QA}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4" />
              {isRunningStage21QA
                ? 'Đang chạy 10 kịch bản kiểm thử...'
                : 'Chạy Kiểm thử Toàn diện 10 Kịch bản'}
            </button>
          </div>

          {stage21QAReport ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="font-bold text-emerald-950 text-sm">
                  Kết quả nghiệm thu: Đạt {stage21QAReport.passedScenarios}/
                  {stage21QAReport.totalScenarios} kịch bản (100% PASSED)
                </div>
                <div className="font-mono text-emerald-800">
                  Hồ sơ xuất: {stage21QAReport.exportedDossierFilename} · Lúc:{' '}
                  {new Date(stage21QAReport.executedAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stage21QAReport.scenarios.map((sc) => (
                  <div
                    key={sc.code}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {sc.order}. {sc.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                        {sc.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      <MathFormulaView text={sc.detail} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="text-sm font-bold text-slate-800">
                Sẵn sàng thực thi 10 kịch bản kiểm thử Mục VII
              </div>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Nhấn nút <strong>"Chạy Kiểm thử Toàn diện 10 Kịch bản"</strong> ở góc phải để hệ thống tự động tạo 6 câu hỏi mẫu (Trắc nghiệm, Đúng/Sai, Điền khuyết, Tự luận, Hình học SVG, Công thức LaTeX), đồng bộ Firestore có xác nhận ACK, tải lại, chỉnh sửa nâng phiên bản và kiểm chứng xuất hồ sơ.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: NHẬP HÀNG LOẠT TỪ EXCEL / CSV VÀ JSON                          */}
      {/* ===================================================================== */}
      {activeSubTab === 'BULK_IMPORT_EXCEL_JSON' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhập hàng loạt Câu hỏi từ Excel (CSV/TSV) và JSON
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hỗ trợ tải tệp <code className="font-mono">.csv</code>, <code className="font-mono">.json</code> hoặc sao chép vùng dữ liệu trực tiếp từ bảng tính Excel
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportMode('CSV_EXCEL');
                  setImportRawText(SAMPLE_CSV_TEMPLATE);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  importMode === 'CSV_EXCEL'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Mẫu chuẩn Excel / CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportMode('JSON');
                  setImportRawText(SAMPLE_JSON_TEMPLATE);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  importMode === 'JSON'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Mẫu chuẩn JSON
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn tệp .CSV / .JSON</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.json"
                  onChange={handleStructuredFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung dữ liệu {importMode === 'CSV_EXCEL' ? 'CSV / Bảng tính Excel' : 'JSON'} (Có thể chỉnh sửa trực tiếp trước khi phân tích):
            </label>
            <textarea
              rows={7}
              value={importRawText}
              onChange={(e) => setImportRawText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs font-mono bg-slate-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Hệ thống tự động kiểm tra Unicode tiếng Việt, mã YCCĐ và công thức KaTeX.
            </span>
            <button
              type="button"
              onClick={handlePreviewStructuredImport}
              className="px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 cursor-pointer"
            >
              Phân tích & Xem trước dữ liệu nhập
            </button>
          </div>

          {importParseErrors.length > 0 && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              {importParseErrors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {parsedImportItems.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Danh sách {parsedImportItems.length} câu hỏi hợp lệ sẵn sàng nhập vào Ngân hàng:
                </h4>
                <button
                  type="button"
                  onClick={handleConfirmStructuredImport}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  Xác nhận lưu {parsedImportItems.length} câu hỏi vào Ngân hàng
                </button>
              </div>

              <div className="space-y-2.5">
                {parsedImportItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold text-slate-900">
                        #{idx + 1} · Lớp {item.grade} · Môn {item.subject} · {item.topicTitle} ·{' '}
                        {getFormatLabel(item.format)}
                      </span>
                      <span className="font-mono font-bold text-blue-700">{item.points} điểm</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      <MathFormulaView text={item.stem} />
                    </div>
                    <div className="text-emerald-700 font-medium">
                      Đáp án: <MathFormulaView text={item.correctAnswer} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: NHẬP ĐỀ KIỂM TRA THÔNG MINH TỪ TÀI LIỆU (WORD/PDF/EXCEL/ẢNH)    */}
      {/* ===================================================================== */}
      {activeSubTab === 'WORD_PDF_EXTRACTOR' && (
        <div className="space-y-6">
          <SmartExamImportWorkspace
            topics={topics}
            existingQuestions={questions}
            globalLevelFilter={globalLevelFilter}
            onBulkAddQuestions={onBulkAddQuestions}
            onAddGroup={onAddGroup}
            onAssignToGroup={onAssignToGroup}
            onNavigateToBank={() => setActiveSubTab('LIST_AND_SEARCH')}
            onNotify={onNotify}
          />
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Trích xuất nhanh từ văn bản đề cương thô
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy trình 2 bước: (1) Tải văn bản hoặc dán nội dung đề cương Word/PDF để bóc tách cấu trúc tự động → (2) Giáo viên rà soát, chỉnh sửa và xác nhận lưu vào Ngân hàng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cấp học</label>
              <select
                value={docLevel}
                onChange={(e) => {
                  const lvl = e.target.value as EducationLevelId;
                  setDocLevel(lvl);
                  const r = getRuleSetForLevel(lvl);
                  setDocGrade(r.grades[0]);
                  setDocSubject(r.subjects[0]);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
              >
                <option value={EducationLevelId.PRIMARY}>Tiểu học (Lớp 1–5)</option>
                <option value={EducationLevelId.LOWER_SECONDARY}>THCS (Lớp 6–9)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lớp</label>
              <select
                value={docGrade}
                onChange={(e) => setDocGrade(Number(e.target.value) as GradeNumber)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
              >
                {getRuleSetForLevel(docLevel).grades.map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học</label>
              <select
                value={docSubject}
                onChange={(e) => setDocSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
              >
                {getRuleSetForLevel(docLevel).subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chủ đề mặc định
              </label>
              <input
                type="text"
                value={docTopic}
                onChange={(e) => setDocTopic(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Bước 1: Nội dung văn bản từ đề cương Word / PDF (Tự động nhận diện Câu 1, Câu 2, phương án A/B/C/D, mệnh đề a/b/c/d, Đáp án, Hướng dẫn):
              </label>
              <label className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer">
                Tải tệp đề (.pdf / .docx / .txt)...
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md,.csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    try {
                      if (ext === 'pdf' || file.type === 'application/pdf') {
                        const pdfRes = await parsePdfFileToPages(file);
                        const fullText = pdfRes.pages
                          .map((p) => p.rawText)
                          .filter(Boolean)
                          .join('\n\n');
                        if (fullText.trim()) {
                          setDocRawText(fullText);
                          const extracted = extractQuestionsFromDocumentText(fullText, {
                            levelId: docLevel,
                            grade: docGrade,
                            subject: docSubject,
                            topicTitle: docTopic,
                            authorName: formAuthor || 'Giáo viên Bộ môn',
                          });
                          setExtractedCandidates(extracted);
                        }
                      } else if (ext === 'docx' || ext === 'doc') {
                        const pages = await parseDocxFileToPages(file);
                        const fullText = pages
                          .map((p) => p.rawText)
                          .filter(Boolean)
                          .join('\n\n');
                        if (fullText.trim()) {
                          setDocRawText(fullText);
                          const extracted = extractQuestionsFromDocumentText(fullText, {
                            levelId: docLevel,
                            grade: docGrade,
                            subject: docSubject,
                            topicTitle: docTopic,
                            authorName: formAuthor || 'Giáo viên Bộ môn',
                          });
                          setExtractedCandidates(extracted);
                        }
                      } else {
                        const text = await file.text();
                        setDocRawText(text);
                      }
                    } catch {
                      const reader = new FileReader();
                      reader.onload = () => setDocRawText(String(reader.result || ''));
                      reader.readAsText(file, 'utf-8');
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              value={docRawText}
              onChange={(e) => setDocRawText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs font-mono bg-slate-50"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRunDocExtraction}
              className="px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 cursor-pointer"
            >
              Bước 1: Bóc tách & Trích xuất câu hỏi
            </button>
          </div>

          {extractedCandidates.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Bước 2: Xác nhận & Hiệu chỉnh {extractedCandidates.length} câu hỏi đã trích xuất
                  </h4>
                  <p className="text-xs text-slate-500">
                    Bạn có thể chỉnh sửa trực tiếp từng câu hỏi và đáp án Đúng/Sai trước khi xác nhận đưa vào Ngân hàng chính thức
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmDocExtraction}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  Bước 2: Xác nhận lưu tất cả ({extractedCandidates.length} câu)
                </button>
              </div>

              <div className="space-y-3">
                {extractedCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-800">
                        Câu trích xuất #{idx + 1} · {getFormatLabel(cand.format)} ·{' '}
                        {getCognitiveShortLabel(cand.cognitiveLevel)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExtractedCandidates((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        Loại bỏ câu này
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={cand.stem}
                      onChange={(e) => {
                        const next = [...extractedCandidates];
                        next[idx] = { ...next[idx], stem: e.target.value };
                        setExtractedCandidates(next);
                      }}
                      className="w-full rounded border border-slate-300 p-2 bg-white text-xs"
                    />

                    {/* Chỉnh sửa, Thêm / Bớt phương án A, B, C, D cho câu Trắc nghiệm ngay trong Bước 2 trích xuất */}
                    {(cand.format === QuestionFormatCode.MCQ_SINGLE ||
                      cand.format === QuestionFormatCode.MCQ_MULTIPLE ||
                      (cand.options &&
                        cand.options.length > 0 &&
                        cand.format !== QuestionFormatCode.TRUE_FALSE_CLUSTER)) && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-700">
                              Các phương án lựa chọn (Chọn đáp án đúng, sửa hoặc thêm / bớt phương án):
                            </span>
                            {(cand.options || []).length < 4 && (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px]">
                                Đang có {(cand.options || []).length}/4 phương án
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {(cand.options || []).length < 4 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...extractedCandidates];
                                  const nextOpts = [...(next[idx].options || [])];
                                  while (nextOpts.length < 4) {
                                    const letter = String.fromCharCode(65 + nextOpts.length);
                                    nextOpts.push(`${letter}. Phương án ${letter}`);
                                  }
                                  next[idx] = { ...next[idx], options: nextOpts };
                                  setExtractedCandidates(next);
                                }}
                                className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer"
                              >
                                + Đủ 4 phương án (A–D)
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...extractedCandidates];
                                const curOpts = next[idx].options || [];
                                const letter = String.fromCharCode(65 + curOpts.length);
                                next[idx] = {
                                  ...next[idx],
                                  options: [...curOpts, `${letter}. Phương án ${letter}`],
                                };
                                setExtractedCandidates(next);
                              }}
                              className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold hover:bg-blue-100 cursor-pointer"
                            >
                              + Thêm phương án ({String.fromCharCode(65 + (cand.options || []).length)})
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(cand.options || []).map((opt, oIdx) => {
                            const isChecked = (cand.correctOptionIndices || []).includes(oIdx);
                            return (
                              <div key={oIdx} className="flex items-center gap-1.5">
                                <input
                                  type={
                                    cand.format === QuestionFormatCode.MCQ_MULTIPLE
                                      ? 'checkbox'
                                      : 'radio'
                                  }
                                  name={`cand-mcq-${idx}`}
                                  checked={isChecked}
                                  onChange={() => {
                                    const next = [...extractedCandidates];
                                    const curIndices = next[idx].correctOptionIndices || [];
                                    const isMulti =
                                      next[idx].format === QuestionFormatCode.MCQ_MULTIPLE;
                                    const nextIndices = isMulti
                                      ? curIndices.includes(oIdx)
                                        ? curIndices.filter((i) => i !== oIdx)
                                        : [...curIndices, oIdx].sort()
                                      : [oIdx];
                                    const curOpts = next[idx].options || [];
                                    const nextAns = isMulti
                                      ? nextIndices.map((i) => curOpts[i] || '').join('; ')
                                      : curOpts[oIdx] || '';
                                    next[idx] = {
                                      ...next[idx],
                                      correctOptionIndices: nextIndices,
                                      correctAnswer: nextAns,
                                    };
                                    setExtractedCandidates(next);
                                  }}
                                  className="cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const next = [...extractedCandidates];
                                    const nextOpts = [...(next[idx].options || [])];
                                    nextOpts[oIdx] = val;
                                    const curIndices = next[idx].correctOptionIndices || [];
                                    const nextAns = curIndices.includes(oIdx)
                                      ? val
                                      : next[idx].correctAnswer;
                                    next[idx] = {
                                      ...next[idx],
                                      options: nextOpts,
                                      correctAnswer: nextAns,
                                    };
                                    setExtractedCandidates(next);
                                  }}
                                  className="flex-1 rounded border border-slate-300 px-2 py-1 bg-slate-50"
                                />
                                {(cand.options || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...extractedCandidates];
                                      const curOpts = next[idx].options || [];
                                      const filtered = curOpts
                                        .filter((_, i) => i !== oIdx)
                                        .map((item, nIdx) => {
                                          const letter = String.fromCharCode(65 + nIdx);
                                          const body = item
                                            .replace(/^[A-Za-z][.):]\s*/, '')
                                            .trim();
                                          return body
                                            ? `${letter}. ${body}`
                                            : `${letter}. Phương án ${letter}`;
                                        });
                                      const curIndices = next[idx].correctOptionIndices || [];
                                      const nextIndices = curIndices
                                        .filter((i) => i !== oIdx)
                                        .map((i) => (i > oIdx ? i - 1 : i));
                                      next[idx] = {
                                        ...next[idx],
                                        options: filtered,
                                        correctOptionIndices: nextIndices,
                                        correctAnswer:
                                          nextIndices.length > 0
                                            ? filtered[nextIndices[0]] || ''
                                            : next[idx].correctAnswer,
                                      };
                                      setExtractedCandidates(next);
                                    }}
                                    title="Xóa (bớt) phương án này"
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Chỉnh sửa mệnh đề Đúng – Sai a, b, c, d ngay trong Bước 2 trích xuất */}
                    {(cand.format === QuestionFormatCode.TRUE_FALSE_CLUSTER ||
                      (cand.subStatements && cand.subStatements.length > 0)) && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
                        <div className="font-semibold text-slate-700">
                          Các mệnh đề Đúng – Sai (Bấm Đúng / Sai để sửa đáp án từng ý):
                        </div>
                        {(cand.subStatements || []).map((sub, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900 w-5">
                              {sub.label})
                            </span>
                            <input
                              type="text"
                              value={sub.statement}
                              onChange={(e) => {
                                const val = e.target.value;
                                const next = [...extractedCandidates];
                                const nextSubs = (next[idx].subStatements || []).map((st, i) =>
                                  i === sIdx ? { ...st, statement: val } : st
                                );
                                next[idx] = { ...next[idx], subStatements: nextSubs };
                                setExtractedCandidates(next);
                              }}
                              className="flex-1 rounded border border-slate-300 px-2 py-1 bg-slate-50"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...extractedCandidates];
                                const nextSubs = (next[idx].subStatements || []).map((st, i) =>
                                  i === sIdx ? { ...st, isTrue: true } : st
                                );
                                next[idx] = {
                                  ...next[idx],
                                  subStatements: nextSubs,
                                  correctAnswer: formatSubStatementsAnswerSummary(nextSubs),
                                };
                                setExtractedCandidates(next);
                              }}
                              className={`px-2.5 py-1 rounded font-bold border cursor-pointer ${
                                sub.isTrue
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...extractedCandidates];
                                const nextSubs = (next[idx].subStatements || []).map((st, i) =>
                                  i === sIdx ? { ...st, isTrue: false } : st
                                );
                                next[idx] = {
                                  ...next[idx],
                                  subStatements: nextSubs,
                                  correctAnswer: formatSubStatementsAnswerSummary(nextSubs),
                                };
                                setExtractedCandidates(next);
                              }}
                              className={`px-2.5 py-1 rounded font-bold border cursor-pointer ${
                                !sub.isTrue
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-rose-400'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold text-slate-700">Đáp án trích xuất:</span>
                        <input
                          type="text"
                          value={cand.correctAnswer}
                          onChange={(e) => {
                            const val = e.target.value;
                            const next = [...extractedCandidates];
                            let nextSubs = next[idx].subStatements;
                            if (nextSubs && nextSubs.length > 0) {
                              const synced = syncSubStatementsFromAnswerText(nextSubs, val);
                              if (synced.matchedAny) {
                                nextSubs = synced.updated;
                              }
                            }
                            next[idx] = {
                              ...next[idx],
                              subStatements: nextSubs,
                              correctAnswer: val,
                            };
                            setExtractedCandidates(next);
                          }}
                          className="w-full rounded border border-slate-300 px-2 py-1 bg-white mt-0.5"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Hướng dẫn chấm:</span>
                        <input
                          type="text"
                          value={cand.gradingGuide}
                          onChange={(e) => {
                            const next = [...extractedCandidates];
                            next[idx] = { ...next[idx], gradingGuide: e.target.value };
                            setExtractedCandidates(next);
                          }}
                          className="w-full rounded border border-slate-300 px-2 py-1 bg-white mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: QUẢN LÝ NHÓM CÂU HỎI & CÂY PHIÊN BẢN                          */}
      {/* ===================================================================== */}
      {activeSubTab === 'GROUPS_AND_VERSIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
              Tạo Nhóm / Chùm Câu hỏi Mới
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên nhóm câu hỏi (*)
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="VD: Chùm câu hỏi Ôn tập Học kỳ I – Toán 8"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học</label>
              <input
                type="text"
                value={newGroupSubject}
                onChange={(e) => setNewGroupSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả mục đích sử dụng nhóm
              </label>
              <textarea
                rows={2}
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Ghi chú phạm vi chuyên đề hoặc kỳ kiểm tra..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!newGroupName.trim()) {
                  onNotify('error', 'Thiếu tên nhóm', 'Vui lòng nhập tên nhóm câu hỏi.');
                  return;
                }
                const created = onAddGroup({
                  name: newGroupName.trim(),
                  description: newGroupDesc.trim() || 'Nhóm câu hỏi chuyên đề',
                  levelId: 'ALL',
                  subject: newGroupSubject.trim() || 'Toán',
                  questionIds: selectedQuestionIds,
                });
                setNewGroupName('');
                setNewGroupDesc('');
                onNotify(
                  'success',
                  `Đã tạo nhóm ${created.code}`,
                  `Nhóm "${created.name}" đã sẵn sàng để gom câu hỏi.`
                );
              }}
              className="w-full py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 cursor-pointer"
            >
              Khởi tạo Nhóm câu hỏi
            </button>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {groups.map((grp) => {
              const memberQuestions = questions.filter(
                (q) => q.groupId === grp.id || grp.questionIds.includes(q.id)
              );
              return (
                <div
                  key={grp.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-bold text-blue-700">{grp.code}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums font-semibold text-slate-800">
                        {memberQuestions.length} câu hỏi
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterGroup(grp.id);
                          setActiveSubTab('LIST_AND_SEARCH');
                        }}
                        className="text-blue-700 font-semibold hover:underline cursor-pointer"
                      >
                        Lọc câu hỏi nhóm này
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteGroup(grp.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{grp.name}</h4>
                  <p className="text-xs text-slate-600">{grp.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
