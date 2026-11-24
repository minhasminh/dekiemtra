import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  CheckSquare,
  Copy,
  Edit3,
  FileText,
  FolderArchive,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  AIDocumentAnalysisResult,
  AIDocumentCategory,
  AIGeneratedQuestionDraft,
  AIGenerationBatch,
  AIPdfOcrMandatory13TestSuiteReport,
  AIPedagogicalQualityBenchmarkReport,
  AIRefineAction,
  AISourceMode,
  AITextbookMandatoryTestSuiteReport,
  AIUploadedSourceDocument,
  ApprovalStatus,
  CognitiveLevelCode,
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
  QuestionFormatCode,
  QuestionItem,
  TeacherPermissionProfileSummary,
} from '../types/domain';
import {
  getAllowedFormatsForContext,
  getCognitiveLevelLabel,
  getFormatLabel,
  getRuleSetForLevel,
} from '../services/business/assessmentRules';
import {
  analyzeQuestionQualityWithAI,
  analyzeUploadedDocumentsWithAI,
  buildPageRecordsFromRawPages,
  cleanStudentOptionOrStatement,
  cleanStudentQuestionStem,
  enrichWordOrTextDocumentWithSmartMeta,
  generateQuestionsBatchWithAI,
  getDocumentCategoryLabel,
  getDocumentCategoryShortLabel,
  MAX_AI_BATCH_SIZE,
  PdfSmartReadProgressCallbackParams,
  processUploadedImageWithSmartOcr,
  processUploadedPdfWithSmartOcr,
  refineQuestionDraftWithAI,
  runAutomatedQuestionVerification,
  runMandatory12TextbookBenchmarkTests,
  runMandatory13PdfOcrBenchmarkTests,
  runPedagogicalQualityUpgradeBenchmark,
  splitDocumentTextIntoPageRecords,
} from '../services/ai/aiQuestionService';
import { dataRepository } from '../services/storage/repository';
import { cleanLearningOutcomeText } from '../services/business/examGenerationEngine';
import {
  parseDocxFileToPages,
  parsePdfFileToPages,
} from '../services/import/smartExamImportService';
import { MathFormulaView } from './MathFormulaView';

interface AIQuestionGeneratorWorkspaceProps {
  topics: CurriculumTopic[];
  existingQuestions: QuestionItem[];
  globalLevelFilter: EducationLevelId | 'ALL';
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  enforceTeacherScope?: boolean;
  onSaveQuestionToBank: (
    q: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>
  ) => QuestionItem;
  onBulkSaveQuestionsToBank: (
    items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]
  ) => QuestionItem[];
  onNotify: (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => void;
}

const SOURCE_MODES: {
  id: AISourceMode;
  shortTitle: string;
  description: string;
}[] = [
  {
    id: 'CURRICULUM_OUTCOMES',
    shortTitle: 'A. Yêu cầu cần đạt đã lưu',
    description: 'Bám sát trực tiếp YCCĐ trong CSDL Chương trình GDPT 2018',
  },
  {
    id: 'TEACHER_PASSAGE',
    shortTitle: 'B. Văn bản / Ngữ liệu nhập',
    description: 'Tạo câu hỏi từ đoạn văn bản, ngữ liệu đọc hiểu hoặc tình huống giáo viên nhập',
  },
  {
    id: 'UPLOADED_DOCUMENT',
    shortTitle: 'C. Tài liệu giáo viên tải lên',
    description: 'Trích xuất nội dung từ tệp tài liệu (.txt, .md, .csv, .docx, .pdf, ảnh)',
  },
  {
    id: 'COMBINED_VERIFIED',
    shortTitle: 'D. Kết hợp nguồn đã xác minh',
    description: 'Kết hợp đồng thời YCCĐ đã lưu + Ngữ liệu nhập + Tài liệu tải lên',
  },
];

export const AIQuestionGeneratorWorkspace: React.FC<
  AIQuestionGeneratorWorkspaceProps
> = ({
  topics,
  existingQuestions,
  globalLevelFilter,
  teacherPermissionProfile,
  enforceTeacherScope = false,
  onSaveQuestionToBank,
  onBulkSaveQuestionsToBank,
  onNotify,
}) => {
  // 1. State cấu hình đầu vào (Mục 1)
  const initialLevel =
    globalLevelFilter === EducationLevelId.PRIMARY ||
    globalLevelFilter === EducationLevelId.LOWER_SECONDARY
      ? globalLevelFilter
      : EducationLevelId.LOWER_SECONDARY;

  const [levelId, setLevelId] = useState<EducationLevelId>(initialLevel);
  const ruleSet = useMemo(() => getRuleSetForLevel(levelId), [levelId]);

  const [grade, setGrade] = useState<GradeNumber>(
    initialLevel === EducationLevelId.PRIMARY ? 4 : 6
  );
  const [subject, setSubject] = useState<string>(ruleSet.subjects[0] || 'Toán');

  // MỤC V: Đồng bộ với AI (Chỉ được dùng AI tạo câu hỏi trong phạm vi được cấp)
  const isAiScopeRestricted = Boolean(
    enforceTeacherScope &&
      teacherPermissionProfile &&
      teacherPermissionProfile.subjectAllocations.length > 0
  );

  const hasAiGeneratorPermission = useMemo(() => {
    if (!isAiScopeRestricted || !teacherPermissionProfile) return true;
    return teacherPermissionProfile.permissionCodes.includes(
      'USE_AI_QUESTION_GENERATOR'
    );
  }, [isAiScopeRestricted, teacherPermissionProfile]);

  const allowedAiLevels = useMemo<EducationLevelId[]>(() => {
    if (!isAiScopeRestricted || !teacherPermissionProfile) {
      return [EducationLevelId.PRIMARY, EducationLevelId.LOWER_SECONDARY];
    }
    const list: EducationLevelId[] = [];
    if (teacherPermissionProfile.educationLevels.includes('PRIMARY')) {
      list.push(EducationLevelId.PRIMARY);
    }
    if (teacherPermissionProfile.educationLevels.includes('LOWER_SECONDARY')) {
      list.push(EducationLevelId.LOWER_SECONDARY);
    }
    return list.length > 0
      ? list
      : [EducationLevelId.PRIMARY, EducationLevelId.LOWER_SECONDARY];
  }, [isAiScopeRestricted, teacherPermissionProfile]);

  const allowedAiSubjects = useMemo<string[]>(() => {
    if (!isAiScopeRestricted || !teacherPermissionProfile) {
      return ruleSet.subjects;
    }
    const targetLvl =
      levelId === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY';
    const subjects = teacherPermissionProfile.subjectAllocations
      .filter((a) => a.educationLevelId === targetLvl)
      .map((a) => a.subjectName);
    return subjects.length > 0 ? Array.from(new Set(subjects)) : ruleSet.subjects;
  }, [isAiScopeRestricted, teacherPermissionProfile, levelId, ruleSet.subjects]);

  const allowedAiGrades = useMemo<GradeNumber[]>(() => {
    if (!isAiScopeRestricted || !teacherPermissionProfile) {
      return ruleSet.grades;
    }
    const targetLvl =
      levelId === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY';
    const alloc = teacherPermissionProfile.subjectAllocations.find(
      (a) =>
        a.educationLevelId === targetLvl &&
        a.subjectName.toLowerCase() === subject.toLowerCase()
    );
    if (alloc && alloc.grades.length > 0) {
      return alloc.grades.map((g) => Number(g) as GradeNumber);
    }
    const fallbackGrades = teacherPermissionProfile.subjectAllocations
      .filter((a) => a.educationLevelId === targetLvl)
      .flatMap((a) => a.grades.map((g) => Number(g) as GradeNumber));
    return fallbackGrades.length > 0
      ? Array.from(new Set(fallbackGrades))
      : ruleSet.grades;
  }, [isAiScopeRestricted, teacherPermissionProfile, levelId, subject, ruleSet.grades]);

  useEffect(() => {
    if (!isAiScopeRestricted || !teacherPermissionProfile) return;
    if (!allowedAiLevels.includes(levelId)) {
      setLevelId(allowedAiLevels[0]);
      return;
    }
    if (!allowedAiSubjects.includes(subject)) {
      setSubject(allowedAiSubjects[0]);
      return;
    }
    if (!allowedAiGrades.includes(grade)) {
      setGrade(allowedAiGrades[0]);
    }
  }, [
    isAiScopeRestricted,
    teacherPermissionProfile,
    allowedAiLevels,
    allowedAiSubjects,
    allowedAiGrades,
    levelId,
    subject,
    grade,
  ]);

  // Lọc danh sách chủ đề khớp cấp học, lớp, môn
  const matchingTopics = useMemo(
    () =>
      topics.filter(
        (t) =>
          t.levelId === levelId &&
          t.grade === grade &&
          t.subject.toLowerCase() === subject.toLowerCase()
      ),
    [topics, levelId, grade, subject]
  );

  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [additionalSelectedTopicIds, setAdditionalSelectedTopicIds] = useState<string[]>([]);
  const [customTopicTitle, setCustomTopicTitle] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [knowledgeUnit, setKnowledgeUnit] = useState<string>('');

  // Cho phép chọn 1 hoặc nhiều Yêu cầu cần đạt
  const [selectedOutcomeCodes, setSelectedOutcomeCodes] = useState<string[]>([]);
  const [customOutcomeText, setCustomOutcomeText] = useState<string>('');

  // Loại câu hỏi & Mức độ nhận thức (lọc theo đặc thù môn học & cấp học)
  const allowedFormats = useMemo(
    () =>
      getAllowedFormatsForContext(levelId, grade, subject).filter(
        (f) => !f.isRestricted
      ),
    [levelId, grade, subject]
  );

  const [format, setFormat] = useState<QuestionFormatCode>(
    QuestionFormatCode.MCQ_SINGLE
  );
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevelCode>(
    ruleSet.cognitiveLevels[0]?.code || CognitiveLevelCode.SEC_NHAN_BIET
  );
  // Mục VI: Cho phép giáo viên thiết lập số lượng câu hỏi theo từng mức độ nhận thức
  const [useMultiLevelAllocation, setUseMultiLevelAllocation] = useState<boolean>(false);
  const [cognitiveCounts, setCognitiveCounts] = useState<Partial<Record<CognitiveLevelCode, number>>>(() => {
    const initial: Partial<Record<CognitiveLevelCode, number>> = {};
    ruleSet.cognitiveLevels.forEach((cl, idx) => {
      initial[cl.code] = idx === 0 ? 2 : idx === 1 ? 1 : 1;
    });
    return initial;
  });
  const [quantity, setQuantity] = useState<number>(3);
  const [pointsPerQuestion, setPointsPerQuestion] = useState<number>(0.25);
  const [language, setLanguage] = useState<string>('Tiếng Việt chuẩn GDPT 2018');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');

  const effectiveQuantity = useMemo(() => {
    if (!useMultiLevelAllocation) {
      return Math.min(Math.max(quantity, 1), MAX_AI_BATCH_SIZE);
    }
    const sum = ruleSet.cognitiveLevels.reduce(
      (acc, cl) => acc + Math.max(0, Number(cognitiveCounts[cl.code] || 0)),
      0
    );
    return Math.min(Math.max(sum, 1), MAX_AI_BATCH_SIZE);
  }, [useMultiLevelAllocation, quantity, cognitiveCounts, ruleSet.cognitiveLevels]);

  // Cấu hình riêng cho câu Đúng - Sai
  const [trueFalseStatementCount, setTrueFalseStatementCount] = useState<number>(4);
  const [trueFalseScoringRule, setTrueFalseScoringRule] = useState<
    'EQUAL_PER_ITEM' | 'PROGRESSIVE_CV7991' | 'CUSTOM'
  >('PROGRESSIVE_CV7991');

  // Nguồn tài liệu (A, B, C, D) & Kho Tài liệu đưa lên (SGK, SGV, Tài liệu tham khảo, Tài liệu YCCĐ)
  const [sourceMode, setSourceMode] = useState<AISourceMode>('CURRICULUM_OUTCOMES');
  const [sourcePassage, setSourcePassage] = useState<string>('');
  const [sourcePassageCitation, setSourcePassageCitation] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedDocumentText, setUploadedDocumentText] = useState<string>('');
  const [uploadedInlineData, setUploadedInlineData] = useState<
    { mimeType: string; data: string } | undefined
  >(undefined);
  const [selectedUploadCategory, setSelectedUploadCategory] =
    useState<AIDocumentCategory>('TEXTBOOK');
  const [uploadedDocuments, setUploadedDocuments] = useState<
    AIUploadedSourceDocument[]
  >([]);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [documentAnalysis, setDocumentAnalysis] =
    useState<AIDocumentAnalysisResult | null>(null);
  const [isAnalyzingDocuments, setIsAnalyzingDocuments] = useState<boolean>(false);
  const [mandatory12TestReport, setMandatory12TestReport] =
    useState<AITextbookMandatoryTestSuiteReport | null>(null);
  const [mandatory13PdfOcrReport, setMandatory13PdfOcrReport] =
    useState<AIPdfOcrMandatory13TestSuiteReport | null>(null);
  const [pedagogicalBenchmarkReport, setPedagogicalBenchmarkReport] =
    useState<AIPedagogicalQualityBenchmarkReport | null>(null);
  const [pdfReadProgress, setPdfReadProgress] =
    useState<PdfSmartReadProgressCallbackParams | null>(null);
  const [rawPdfFilesMap, setRawPdfFilesMap] = useState<Record<string, File>>({});
  const [retryingPdfDocId, setRetryingPdfDocId] = useState<string | null>(null);

  // Tiến trình tạo & Kiểm soát chi phí
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStepIndex, setProgressStepIndex] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [lastGeneratedTimestamp, setLastGeneratedTimestamp] = useState<number>(0);

  // Quản lý các đợt tạo (AIGenerationBatch) và bản nháp hiện tại
  const [savedBatches, setSavedBatches] = useState<AIGenerationBatch[]>(() =>
    dataRepository.getAIGenerationBatches()
  );
  const [currentBatch, setCurrentBatch] = useState<AIGenerationBatch | null>(
    () => dataRepository.getAIGenerationBatches()[0] || null
  );
  const [showBatchHistoryModal, setShowBatchHistoryModal] = useState<boolean>(false);

  // State chỉnh sửa trực tiếp & tinh chỉnh từng câu hỏi
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editDraftBuffer, setEditDraftBuffer] =
    useState<AIGeneratedQuestionDraft | null>(null);
  const [refiningDraftId, setRefiningDraftId] = useState<string | null>(null);
  const [analyzingDraftId, setAnalyzingDraftId] = useState<string | null>(null);

  // Đồng bộ khi đổi cấp học
  useEffect(() => {
    const nextRule = getRuleSetForLevel(levelId);
    if (!nextRule.grades.includes(grade)) {
      setGrade(nextRule.grades[0]);
    }
    if (!nextRule.subjects.includes(subject)) {
      setSubject(nextRule.subjects[0]);
    }
    if (!nextRule.cognitiveLevels.some((c) => c.code === cognitiveLevel)) {
      setCognitiveLevel(nextRule.cognitiveLevels[0].code);
    }
    setCognitiveCounts((prev) => {
      const nextCounts: Partial<Record<CognitiveLevelCode, number>> = {};
      nextRule.cognitiveLevels.forEach((cl, idx) => {
        nextCounts[cl.code] =
          typeof prev[cl.code] === 'number' ? prev[cl.code] : idx === 0 ? 2 : 1;
      });
      return nextCounts;
    });
  }, [levelId]);

  const getConciseTopicTitle = (t: CurriculumTopic): string => {
    if (t.chapterTitle && t.chapterTitle.trim().length > 0) {
      return t.chapterTitle.trim();
    }
    const firstPart = t.topicTitle.split(';')[0].trim();
    return firstPart.length > 75 ? `${firstPart.slice(0, 72)}...` : firstPart;
  };

  const getTopicSelectOptionText = (t: CurriculumTopic): string => {
    const title = getConciseTopicTitle(t);
    const metaParts: string[] = [];
    if (t.weekRange) metaParts.push(t.weekRange);
    if (t.totalPeriods) metaParts.push(`${t.totalPeriods} tiết`);
    const metaSuffix = metaParts.length > 0 ? ` (${metaParts.join(' · ')})` : '';
    const fullLabel = `[${t.chapterCode}] ${title}${metaSuffix}`;
    return fullLabel.length > 88 ? `${fullLabel.slice(0, 85)}...` : fullLabel;
  };

  const getDistinctLessonsOfTopic = (t: CurriculumTopic | null): string[] => {
    if (!t) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    if (t.lessons && t.lessons.length > 0) {
      for (const ls of t.lessons) {
        const name = ls.lessonName.trim();
        if (name && !seen.has(name)) {
          seen.add(name);
          list.push(name);
        }
      }
      return list;
    }
    if (t.topicTitle.includes(';')) {
      for (const part of t.topicTitle.split(';')) {
        const name = part.trim();
        if (name && !seen.has(name)) {
          seen.add(name);
          list.push(name);
        }
      }
    }
    return list;
  };

  // Đồng bộ chủ đề & YCCĐ mặc định khi đổi Lớp / Môn
  useEffect(() => {
    if (matchingTopics.length > 0) {
      const firstTopic = matchingTopics[0];
      const conciseHeading = getConciseTopicTitle(firstTopic);
      const lessonsOfFirst = getDistinctLessonsOfTopic(firstTopic);
      setSelectedTopicId(firstTopic.id);
      setAdditionalSelectedTopicIds([]);
      setCustomTopicTitle(conciseHeading);
      setLessonTitle(lessonsOfFirst[0] || conciseHeading);
      setKnowledgeUnit(
        firstTopic.adjustedContentSummary
          ? firstTopic.adjustedContentSummary.split(';')[0].trim()
          : conciseHeading
      );
      setSelectedOutcomeCodes(
        firstTopic.learningOutcomes.map((lo) => lo.code)
      );
    } else {
      setSelectedTopicId('');
      setAdditionalSelectedTopicIds([]);
      setCustomTopicTitle(`Chủ đề trọng tâm ${subject} Lớp ${grade}`);
      setLessonTitle(`Bài học ${subject} Lớp ${grade}`);
      setKnowledgeUnit('Kiến thức cốt lõi theo CT GDPT 2018');
      setSelectedOutcomeCodes([]);
    }
  }, [matchingTopics, grade, subject]);

  // Đảm bảo format hợp lệ khi đổi môn học
  useEffect(() => {
    if (
      allowedFormats.length > 0 &&
      !allowedFormats.some((f) => f.code === format)
    ) {
      setFormat(allowedFormats[0].code);
      setPointsPerQuestion(allowedFormats[0].defaultPoints);
    }
  }, [allowedFormats, format]);

  const activeTopic = useMemo(
    () => matchingTopics.find((t) => t.id === selectedTopicId) || null,
    [matchingTopics, selectedTopicId]
  );

  const activeTopicLessons = useMemo(
    () => getDistinctLessonsOfTopic(activeTopic),
    [activeTopic]
  );

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setAdditionalSelectedTopicIds((prev) => prev.filter((id) => id !== topicId));
    const found = matchingTopics.find((t) => t.id === topicId);
    if (found) {
      const conciseHeading = getConciseTopicTitle(found);
      const lessonsList = getDistinctLessonsOfTopic(found);
      setCustomTopicTitle(conciseHeading);
      setLessonTitle(lessonsList[0] || conciseHeading);
      setKnowledgeUnit(
        found.adjustedContentSummary
          ? found.adjustedContentSummary.split(';')[0].trim()
          : conciseHeading
      );
      setSelectedOutcomeCodes(found.learningOutcomes.map((lo) => lo.code));
    }
  };

  const handleToggleAdditionalTopic = (topicId: string) => {
    if (topicId === selectedTopicId) return;
    setAdditionalSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSelectLessonInTopic = (selectedLessonName: string) => {
    setLessonTitle(selectedLessonName);
    if (!activeTopic) return;
    if (!selectedLessonName) {
      setSelectedOutcomeCodes(activeTopic.learningOutcomes.map((lo) => lo.code));
      return;
    }
    const matchedOutcomes = activeTopic.learningOutcomes.filter(
      (lo) =>
        lo.lessonName === selectedLessonName ||
        lo.description.toLowerCase().includes(selectedLessonName.toLowerCase())
    );
    if (matchedOutcomes.length > 0) {
      setSelectedOutcomeCodes(matchedOutcomes.map((lo) => lo.code));
    }
  };

  const handleToggleOutcomeCode = (code: string) => {
    setSelectedOutcomeCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const detectCategoryFromFileName = (
    fileName: string,
    fallbackCat: AIDocumentCategory
  ): AIDocumentCategory => {
    const lower = fileName.toLowerCase();
    if (lower.includes('sgv') || lower.includes('giao-vien') || lower.includes('giáo viên')) {
      return 'TEACHER_BOOK';
    }
    if (lower.includes('sbt') || lower.includes('sach-bai-tap') || lower.includes('sách bài tập')) {
      return 'WORKBOOK';
    }
    if (
      lower.includes('tham-khao') ||
      lower.includes('tham khảo') ||
      lower.includes('chuyen-de') ||
      lower.includes('chuyên đề') ||
      lower.includes('bai-tap') ||
      lower.includes('bài tập')
    ) {
      return 'REFERENCE_DOC';
    }
    if (lower.includes('yccd') || lower.includes('yccđ') || lower.includes('ppct')) {
      return 'CURRICULUM_SPEC';
    }
    if (lower.includes('sgk') || lower.includes('giao-khoa') || lower.includes('giáo khoa')) {
      return 'TEXTBOOK';
    }
    return fallbackCat;
  };

  const syncLegacyUploadFieldsFromDocs = (docs: AIUploadedSourceDocument[]) => {
    if (docs.length === 0) {
      setUploadedFileName('');
      setUploadedDocumentText('');
      setUploadedInlineData(undefined);
      return;
    }
    setUploadedFileName(
      docs.map((d) => `[${getDocumentCategoryShortLabel(d.category)}] ${d.fileName}`).join(', ')
    );
    setUploadedDocumentText(
      docs
        .map(
          (d) =>
            `=== [${getDocumentCategoryLabel(d.category)}: ${d.fileName}] ===\n${d.extractedText}`
        )
        .join('\n\n')
    );
    const firstWithInline = docs.find((d) => Boolean(d.inlineData));
    setUploadedInlineData(firstWithInline?.inlineData);
  };

  const extractSingleUploadedFile = async (
    file: File,
    preferredCategory: AIDocumentCategory
  ): Promise<AIUploadedSourceDocument> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const category = detectCategoryFromFileName(file.name, preferredCategory);
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (['txt', 'md', 'csv', 'json'].includes(ext)) {
      const text = await file.text();
      const baseDoc: AIUploadedSourceDocument = {
        id: docId,
        fileName: file.name,
        category,
        mimeType: file.type || 'text/plain',
        sizeBytes: file.size,
        pageCount: Math.max(1, Math.ceil(text.length / 1800)),
        extractedText: text,
        uploadedAt: nowStr,
      };
      const pageRecords = splitDocumentTextIntoPageRecords(baseDoc);
      return enrichWordOrTextDocumentWithSmartMeta({
        doc: {
          ...baseDoc,
          pageCount: pageRecords.length,
          pages: pageRecords,
        },
        detectedSourceFormat: 'TXT',
      });
    }

    if (ext === 'docx' || ext === 'doc') {
      try {
        const pages = await parseDocxFileToPages(file);
        const extractedText = pages
          .map((p, idx) => `--- Trang ${p.pageNumber || idx + 1} ---\n${p.rawText}`)
          .filter(Boolean)
          .join('\n\n');
        const pageRecords = buildPageRecordsFromRawPages(pages, false);
        return enrichWordOrTextDocumentWithSmartMeta({
          doc: {
            id: docId,
            fileName: file.name,
            category,
            mimeType:
              file.type ||
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            sizeBytes: file.size,
            pageCount: pages.length,
            extractedText:
              extractedText ||
              `[Tài liệu Word (${getDocumentCategoryLabel(category)}): ${file.name}]`,
            uploadedAt: nowStr,
            pages: pageRecords,
          },
          detectedSourceFormat: ext === 'doc' ? 'DOC' : 'DOCX',
        });
      } catch {
        // fallback below
      }
    }

    if (ext === 'pdf' || file.type === 'application/pdf') {
      try {
        const smartPdfDoc = await processUploadedPdfWithSmartOcr({
          file,
          category,
          onProgress: (p) => setPdfReadProgress(p),
        });
        setRawPdfFilesMap((prev) => ({ ...prev, [smartPdfDoc.id]: file }));
        return smartPdfDoc;
      } catch {
        try {
          const pdfRes = await parsePdfFileToPages(file);
          const extractedText = pdfRes.pages
            .map((p, idx) => `--- Trang ${p.pageNumber || idx + 1} ---\n${p.rawText}`)
            .filter(Boolean)
            .join('\n\n');
          const pageRecords = buildPageRecordsFromRawPages(
            pdfRes.pages,
            Boolean(pdfRes.base64Data)
          );
          return {
            id: docId,
            fileName: file.name,
            category,
            mimeType: 'application/pdf',
            sizeBytes: file.size,
            pageCount: pdfRes.pages.length,
            extractedText:
              extractedText.trim() ||
              `[Tài liệu PDF (${getDocumentCategoryLabel(category)}): ${file.name} - ${pdfRes.pages.length} trang. Đã đính kèm dữ liệu hình ảnh trang PDF để AI nhận diện OCR trực tiếp.]`,
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfRes.base64Data,
            },
            uploadedAt: nowStr,
            pages: pageRecords,
          };
        } catch {
          // fallback below
        }
      }
    }

    if (
      ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'tiff'].includes(ext) ||
      file.type.startsWith('image/')
    ) {
      try {
        const smartImgDoc = await processUploadedImageWithSmartOcr({
          file,
          category,
          onProgress: (p) => setPdfReadProgress(p),
        });
        setRawPdfFilesMap((prev) => ({ ...prev, [smartImgDoc.id]: file }));
        return smartImgDoc;
      } catch {
        // fallback below
      }
    }

    return new Promise<AIUploadedSourceDocument>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64Clean = result.includes('base64,')
          ? result.split('base64,')[1]
          : result;
        const isVisual =
          file.type.startsWith('image/') || file.type === 'application/pdf';
        resolve({
          id: docId,
          fileName: file.name,
          category,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          pageCount: 1,
          extractedText: `[Tài liệu đính kèm (${getDocumentCategoryLabel(
            category
          )}): ${file.name} (${Math.round(
            file.size / 1024
          )} KB)]. Hệ thống AI sẽ đọc trực tiếp nội dung từ tệp này.`,
          inlineData: isVisual
            ? {
                mimeType: file.type || 'application/pdf',
                data: base64Clean,
              }
            : undefined,
          uploadedAt: nowStr,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Xử lý tải lên 1 hoặc nhiều tài liệu (Sách giáo khoa, Sách giáo viên, Tài liệu tham khảo, Tài liệu YCCĐ)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    const extractedDocs: AIUploadedSourceDocument[] = [];
    for (const f of filesArray) {
      const docItem = await extractSingleUploadedFile(f, selectedUploadCategory);
      extractedDocs.push(docItem);
    }

    const nextDocs = [...uploadedDocuments, ...extractedDocs];
    setUploadedDocuments(nextDocs);
    syncLegacyUploadFieldsFromDocs(nextDocs);

    if (sourceMode === 'CURRICULUM_OUTCOMES') {
      setSourceMode('COMBINED_VERIFIED');
    }

    e.target.value = '';

    onNotify(
      'success',
      `Đã đưa lên ${extractedDocs.length} tài liệu cho AI`,
      `Đã trích xuất thành công: ${extractedDocs
        .map((d) => `${d.fileName} (${getDocumentCategoryShortLabel(d.category)})`)
        .join(', ')}. Bấm "AI Phân tích Tài liệu" hoặc "Tạo câu hỏi bằng AI" để khai thác.`
    );
  };

  const handleRemoveUploadedDocument = (docId: string) => {
    const nextDocs = uploadedDocuments.filter((d) => d.id !== docId);
    setUploadedDocuments(nextDocs);
    syncLegacyUploadFieldsFromDocs(nextDocs);
    if (editingDocId === docId) {
      setEditingDocId(null);
    }
    if (nextDocs.length === 0) {
      setDocumentAnalysis(null);
    }
  };

  const handleUpdateDocumentText = (docId: string, newText: string) => {
    const nextDocs = uploadedDocuments.map((d) =>
      d.id === docId ? { ...d, extractedText: newText } : d
    );
    setUploadedDocuments(nextDocs);
    syncLegacyUploadFieldsFromDocs(nextDocs);
  };

  const handleUpdateDocumentCategory = (
    docId: string,
    newCategory: AIDocumentCategory
  ) => {
    const nextDocs = uploadedDocuments.map((d) =>
      d.id === docId ? { ...d, category: newCategory } : d
    );
    setUploadedDocuments(nextDocs);
    syncLegacyUploadFieldsFromDocs(nextDocs);
  };

  // Nạp nhanh bộ 3 tài liệu mẫu (SGK + SGV + Tài liệu tham khảo) theo đúng môn & bài học đang chọn
  const handleLoadSampleDocumentsForCurrentLesson = () => {
    const targetLesson =
      lessonTitle || customTopicTitle || activeTopic?.topicTitle || `${subject} Lớp ${grade}`;
    const outcomesList =
      activeTopic?.learningOutcomes.map((lo) => `- [${lo.code}] ${lo.description}`).join('\n') ||
      `- Nắm vững khái niệm, tính chất và vận dụng kiến thức trọng tâm của bài ${targetLesson}.`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const sgkText = [
      `--- Trang 1 ---\nChủ đề: ${customTopicTitle || activeTopic?.topicTitle || subject}\nBài 1: ${targetLesson}\nMục 1. Khái niệm và định nghĩa cốt lõi\n- Trong bài học "${targetLesson}" (${subject} Lớp ${grade}), khái niệm nền tảng giúp xác định rõ đối tượng, phạm vi và các dấu hiệu bản chất cần nhận diện chính xác.\n- Mục tiêu cần đạt: ${outcomesList.replace(/\n/g, ' ')}`,
      `--- Trang 2 ---\nMục 2. Vai trò, nguyên lý và tính chất trọng tâm\n- Vai trò của kiến thức trong bài "${targetLesson}" là giúp giải thích bản chất khoa học của hiện tượng, kết nối dữ kiện lý thuyết với thực hành và tránh các suy luận cảm tính.\n- Bảng 1.1: Bảng đối chiếu đặc điểm nhận biết, điều kiện áp dụng và quy tắc chuẩn của bài học.`,
      `--- Trang 3 ---\nMục 3. Một số ví dụ minh họa và hình ảnh trực quan\n- Ví dụ 1: Phân tích tình huống mẫu trong sách giáo khoa để phân biệt trường hợp đúng điều kiện và trường hợp sai điều kiện.\n- Hình 1.2: Sơ đồ minh họa mối quan hệ giữa các thành phần kiến thức trọng tâm trong bài học.`,
      `--- Trang 4 ---\nMục 4. Quy trình khai thác và vận dụng vào thực tiễn\n- Bước 1: Xác định yêu cầu và dữ kiện đã cho trong tình huống học tập. Bước 2: Đối chiếu với quy tắc/khái niệm chuẩn trong bài. Bước 3: Thực hiện giải quyết vấn đề và kiểm tra lại kết quả thực tế.\n- Ghi nhớ: Luôn đối chiếu điều kiện áp dụng trước khi kết luận.`,
    ].join('\n\n');

    const rawSgkDoc: AIUploadedSourceDocument = {
      id: `doc-sgk-${Date.now()}`,
      fileName: `SGK_${subject.replace(/\s+/g, '_')}_Lop_${grade}_Bai_hoc.pdf`,
      category: 'TEXTBOOK',
      mimeType: 'application/pdf',
      sizeBytes: 428000,
      pageCount: 4,
      uploadedAt: nowStr,
      extractedText: sgkText,
    };

    const sampleDocs: AIUploadedSourceDocument[] = [
      {
        ...rawSgkDoc,
        pages: splitDocumentTextIntoPageRecords(rawSgkDoc),
      },
      {
        id: `doc-sgv-${Date.now() + 1}`,
        fileName: `SGV_Huong_dan_Giang_day_${subject.replace(/\s+/g, '_')}_Lop_${grade}.docx`,
        category: 'TEACHER_BOOK',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 215000,
        pageCount: 3,
        uploadedAt: nowStr,
        extractedText: `HƯỚNG DẪN SÁCH GIÁO VIÊN – MÔN ${subject.toUpperCase()} LỚP ${grade} (${targetLesson})
I. Yêu cầu cần đạt trọng tâm cần đánh giá:
${outcomesList}
II. Những sai lầm học sinh thường mắc phải (Lưu ý khi thiết kế phương án nhiễu):
- Học sinh thường nhầm lẫn điều kiện áp dụng khái niệm/công thức hoặc chỉ học thuộc lòng máy móc mà không hiểu bản chất.
- Khi làm bài tập vận dụng, học sinh dễ bỏ sót bước kiểm tra điều kiện hoặc nhầm lẫn đơn vị/dữ kiện đề bài.
III. Gợi ý kiểm tra, đánh giá phát triển năng lực:
- Kết hợp câu hỏi nhận biết khái niệm với câu hỏi hiểu bản chất (so sánh, giải thích vì sao) và câu hỏi vận dụng giải quyết tình huống mới.`,
      },
      {
        id: `doc-ref-${Date.now() + 2}`,
        fileName: `Tai_lieu_Tham_khao_Chuyen_de_${subject.replace(/\s+/g, '_')}_Lop_${grade}.pdf`,
        category: 'REFERENCE_DOC',
        mimeType: 'application/pdf',
        sizeBytes: 312000,
        pageCount: 5,
        uploadedAt: nowStr,
        extractedText: `TÀI LIỆU THAM KHẢO & BÀI TẬP PHÁT TRIỂN NĂNG LỰC – ${subject.toUpperCase()} LỚP ${grade}
Chuyên đề: ${customTopicTitle || targetLesson}
- Tổng hợp các dạng câu hỏi phân hóa từ Nhận biết, Thông hiểu đến Vận dụng.
- Các tình huống thực tiễn mở rộng nằm trong phạm vi Yêu cầu cần đạt của Chương trình GDPT 2018.
- Hướng dẫn giải chi tiết, phân tích nguyên nhân đúng/sai cho từng phương án và tiêu chí chấm điểm tự luận.`,
      },
    ];

    setUploadedDocuments(sampleDocs);
    syncLegacyUploadFieldsFromDocs(sampleDocs);
    setSourceMode('COMBINED_VERIFIED');
    onNotify(
      'success',
      'Đã nạp bộ 3 tài liệu mẫu (SGK 4 trang, SGV, Tài liệu tham khảo)',
      'Bạn có thể bấm "AI Phân tích Tài liệu" ngay bên dưới để xây dựng Kho kiến thức SGK từng trang hoặc bấm "Tạo câu hỏi bằng AI".'
    );
  };

  const handleRunMandatory12Tests = () => {
    const report = runMandatory12TextbookBenchmarkTests();
    setMandatory12TestReport(report);
    onNotify(
      report.allPassed ? 'success' : 'warning',
      `Kiểm thử bắt buộc 12 kịch bản SGK: Đạt ${report.passedCases}/${report.totalCases}`,
      'Đã thực thi trực tiếp 12 kịch bản đọc hiểu SGK, kiểm soát ảnh mờ, trang lỗi, chống suy diễn ngoài sách và kiểm chứng đáp án gốc.'
    );
  };

  const handleRunMandatory13PdfOcrTests = () => {
    const report = runMandatory13PdfOcrBenchmarkTests();
    setMandatory13PdfOcrReport(report);
    onNotify(
      report.allPassed ? 'success' : 'warning',
      `Kiểm thử 13 kịch bản PDF Ảnh & OCR (Mục XI): Đạt ${report.passedCases}/${report.totalCases}`,
      'Đã thực thi trực tiếp 13 kịch bản phân loại PDF, OCR tiếng Việt có dấu, bố cục 2 cột, trang xoay ngang, công thức, bảng biểu, bộ đệm cache và liên kết tạo câu hỏi.'
    );
  };

  const handleRunPedagogicalQualityBenchmark = () => {
    const report = runPedagogicalQualityUpgradeBenchmark();
    setPedagogicalBenchmarkReport(report);
    onNotify(
      report.allPassed ? 'success' : 'warning',
      `Đánh giá Chất lượng Câu hỏi Trước & Sau Nâng cấp (Mục XIV): Đạt ${report.passedCases}/${report.totalCases} (${report.averageScoreBefore10}/10 → ${report.averageScoreAfter10}/10)`,
      'Đã đối chiếu thực tế câu hỏi Trước và Sau nâng cấp trên nhiều bài học, 3 mức độ nhận thức và 4 dạng câu hỏi theo 8 tiêu chí sư phạm.'
    );
  };

  // Mục IV Bước 9 & Mục IX: Chỉ xử lý lại ở độ phân giải cao các trang PDF cần kiểm tra lại
  const handleRetryUncertainPdfPages = async (doc: AIUploadedSourceDocument) => {
    const rawFile = rawPdfFilesMap[doc.id];
    const pagesToRetry = doc.pdfReaderMeta?.pagesNeedingRecheckNumbers || [];
    if (!rawFile || pagesToRetry.length === 0) {
      onNotify(
        'info',
        'Không cần đọc lại toàn bộ tệp',
        'Các trang của tài liệu này đã được lưu trong bộ đệm hoặc không có trang lỗi cần đọc lại.'
      );
      return;
    }

    setRetryingPdfDocId(doc.id);
    try {
      const retriedDoc = await processUploadedPdfWithSmartOcr({
        file: rawFile,
        category: doc.category,
        forceBypassCache: true,
        highResRetryOnlyForPages: pagesToRetry,
        existingDocument: doc,
        onProgress: (p) => setPdfReadProgress(p),
      });
      const nextDocs = uploadedDocuments.map((d) =>
        d.id === doc.id ? retriedDoc : d
      );
      setUploadedDocuments(nextDocs);
      syncLegacyUploadFieldsFromDocs(nextDocs);
      const rMeta = retriedDoc.pdfReaderMeta;
      onNotify(
        'success',
        `Đã đọc lại độ phân giải cao Trang ${pagesToRetry.join(', ')}`,
        rMeta
          ? `Đang đọc sách giáo khoa: ${rMeta.readPagesCount}/${rMeta.totalPages} trang. · Đã nhận dạng nội dung: ${rMeta.recognizedOcrPagesCount} trang. · Có ${rMeta.pagesNeedingRecheckCount} trang cần kiểm tra lại.`
          : 'Đã cập nhật nội dung trang PDF.'
      );
    } catch {
      onNotify(
        'error',
        'Không thể đọc lại trang PDF',
        'Vui lòng kiểm tra lại tệp PDF gốc.'
      );
    } finally {
      setRetryingPdfDocId(null);
    }
  };

  // Quét lại toàn bộ tài liệu (PDF hoặc Ảnh) bằng công nghệ AI Vision OCR
  const handleRescanWithAiVisionOcr = async (doc: AIUploadedSourceDocument) => {
    const rawFile = rawPdfFilesMap[doc.id];
    if (!rawFile) {
      onNotify(
        'info',
        'Không tìm thấy tệp gốc để quét lại',
        'Vui lòng tải lại tệp PDF hoặc ảnh từ máy tính để thực hiện AI Vision OCR.'
      );
      return;
    }

    setRetryingPdfDocId(doc.id);
    try {
      const ext = rawFile.name.split('.').pop()?.toLowerCase() || '';
      const isImageFile =
        ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'tiff'].includes(ext) ||
        rawFile.type.startsWith('image/');

      const rescannedDoc = isImageFile
        ? await processUploadedImageWithSmartOcr({
            file: rawFile,
            category: doc.category,
            forceBypassCache: true,
            existingDocument: doc,
            onProgress: (p) => setPdfReadProgress(p),
          })
        : await processUploadedPdfWithSmartOcr({
            file: rawFile,
            category: doc.category,
            forceBypassCache: true,
            existingDocument: doc,
            onProgress: (p) => setPdfReadProgress(p),
          });

      const nextDocs = uploadedDocuments.map((d) =>
        d.id === doc.id ? rescannedDoc : d
      );
      setUploadedDocuments(nextDocs);
      syncLegacyUploadFieldsFromDocs(nextDocs);
      const rMeta = rescannedDoc.pdfReaderMeta;
      onNotify(
        'success',
        `AI Vision OCR đã nhận diện lại "${doc.fileName}"`,
        rMeta
          ? `Đã nhận diện ${rMeta.recognizedOcrPagesCount}/${rMeta.totalPages} trang bằng Công nghệ AI Vision OCR (chữ tiếng Việt, công thức, bảng biểu).`
          : 'Đã cập nhật văn bản nhận diện bằng AI Vision OCR.'
      );
    } catch {
      onNotify(
        'error',
        'Lỗi quét AI Vision OCR',
        'Không thể nhận diện lại tài liệu lúc này. Vui lòng thử lại.'
      );
    } finally {
      setRetryingPdfDocId(null);
    }
  };

  // Gọi AI phân tích toàn diện các tài liệu đã tải lên (SGK, SGV, Tài liệu tham khảo)
  const handleAnalyzeUploadedDocuments = async () => {
    if (uploadedDocuments.length === 0) {
      onNotify(
        'warning',
        'Chưa có tài liệu tải lên',
        'Vui lòng chọn tệp Sách giáo khoa, Sách giáo viên hoặc Tài liệu tham khảo trước khi phân tích.'
      );
      return;
    }

    setIsAnalyzingDocuments(true);
    try {
      const result = await analyzeUploadedDocumentsWithAI({
        levelId,
        grade,
        subject,
        topicTitle: customTopicTitle || activeTopic?.topicTitle || subject,
        lessonTitle,
        documents: uploadedDocuments,
      });
      setDocumentAnalysis(result);

      if (result.detectedLessonTitle) {
        setLessonTitle(result.detectedLessonTitle);
      }
      if (result.detectedKnowledgeUnit) {
        setKnowledgeUnit(result.detectedKnowledgeUnit);
      }
      if (result.extractedOutcomes.length > 0 && selectedOutcomeCodes.length === 0) {
        setCustomOutcomeText(result.extractedOutcomes[0].description);
      }

      onNotify(
        'success',
        `AI đã phân tích ${uploadedDocuments.length} tài liệu (${result.extractedOutcomes.length} YCCĐ)`,
        `Đã bóc tách cấu trúc kiến thức 6 thành phần, lỗi sai thường gặp từ SGV và đồng bộ vào cấu hình tạo câu hỏi.`
      );
    } catch (err) {
      console.error(err);
      onNotify(
        'error',
        'Lỗi phân tích tài liệu',
        'Không thể phân tích tài liệu lúc này. Vui lòng thử lại.'
      );
    } finally {
      setIsAnalyzingDocuments(false);
    }
  };

  // Lưu và đồng bộ đợt tạo hiện tại vào Repository
  const persistCurrentBatch = (updatedBatch: AIGenerationBatch) => {
    const saved = dataRepository.saveAIGenerationBatch(updatedBatch);
    setCurrentBatch(saved);
    setSavedBatches(dataRepository.getAIGenerationBatches());
  };

  // BƯỚC 1 -> 11: Thực thi Tạo câu hỏi bằng AI + Kiểm tra tự động 6 tiêu chí + Đối chiếu bao phủ
  const handleGenerateQuestions = async () => {
    if (isAiScopeRestricted && !hasAiGeneratorPermission) {
      onNotify(
        'error',
        'Từ chối sử dụng AI (Mục V · HTTP 403)',
        `Tài khoản ${teacherPermissionProfile?.fullName || 'hiện tại'} không được cấp quyền USE_AI_QUESTION_GENERATOR.`
      );
      return;
    }

    const now = Date.now();
    if (now - lastGeneratedTimestamp < 3000) {
      onNotify(
        'warning',
        'Thao tác quá nhanh',
        'Vui lòng đợi tối thiểu 3 giây giữa các lần gọi Gemini API để tiết kiệm chi phí.'
      );
      return;
    }

    // Chuẩn bị danh sách YCCĐ (bao gồm cả YCCĐ đã chọn + các chủ đề quét mở rộng + YCCĐ trích xuất từ tài liệu SGK/SGV nếu có)
    const activeOutcomes: { code: string; description: string }[] = [];
    if (activeTopic) {
      activeTopic.learningOutcomes
        .filter((lo) => selectedOutcomeCodes.includes(lo.code))
        .forEach((lo) =>
          activeOutcomes.push({ code: lo.code, description: lo.description })
        );
    }
    const additionalTopics = matchingTopics.filter((t) =>
      additionalSelectedTopicIds.includes(t.id)
    );
    additionalTopics.forEach((addTopic) => {
      addTopic.learningOutcomes.forEach((lo) => {
        if (!activeOutcomes.some((existing) => existing.code === lo.code)) {
          activeOutcomes.push({
            code: lo.code,
            description: `[${getConciseTopicTitle(addTopic)}] ${lo.description}`,
          });
        }
      });
    });
    if (customOutcomeText.trim().length > 0) {
      activeOutcomes.push({
        code: `YCCD-TC-${grade}`,
        description: customOutcomeText.trim(),
      });
    }
    if (
      activeOutcomes.length === 0 &&
      documentAnalysis &&
      documentAnalysis.extractedOutcomes.length > 0
    ) {
      documentAnalysis.extractedOutcomes.forEach((eo) => activeOutcomes.push(eo));
    }
    if (activeOutcomes.length === 0 && uploadedDocuments.length > 0) {
      activeOutcomes.push({
        code: `YCCD-TL-${grade}.1`,
        description: `Nắm vững và vận dụng kiến thức trọng tâm từ tài liệu ${uploadedDocuments
          .map((d) => d.fileName)
          .join(', ')}.`,
      });
    }

    if (activeOutcomes.length === 0) {
      onNotify(
        'warning',
        'Chưa chọn Yêu cầu cần đạt hoặc Tài liệu',
        'Vui lòng tích chọn ít nhất 01 Yêu cầu cần đạt, nhập yêu cầu cụ thể hoặc đưa tài liệu (SGK, SGV, Tài liệu tham khảo) lên để AI tạo câu hỏi.'
      );
      return;
    }

    if (
      sourceMode === 'TEACHER_PASSAGE' &&
      sourcePassage.trim().length < 15
    ) {
      onNotify(
        'warning',
        'Thiếu văn bản / ngữ liệu',
        'Bạn đang chọn chế độ "B. Văn bản hoặc ngữ liệu do giáo viên nhập". Vui lòng nhập đoạn ngữ liệu (tối thiểu 15 ký tự).'
      );
      return;
    }

    if (
      sourceMode === 'UPLOADED_DOCUMENT' &&
      uploadedDocuments.length === 0 &&
      !uploadedFileName &&
      uploadedDocumentText.trim().length < 10
    ) {
      onNotify(
        'warning',
        'Chưa tải lên tài liệu',
        'Bạn đang chọn chế độ "C. Tài liệu giáo viên tải lên". Vui lòng đưa tệp SGK, SGV hoặc tài liệu tham khảo lên.'
      );
      return;
    }

    setIsGenerating(true);
    setProgressStepIndex(1);
    setLastGeneratedTimestamp(now);

    try {
      const hasUploadedDocs =
        uploadedDocuments.length > 0 ||
        Boolean(uploadedFileName) ||
        uploadedDocumentText.trim().length > 0;

      const effectiveSourceMode: AISourceMode =
        hasUploadedDocs && sourceMode === 'CURRICULUM_OUTCOMES'
          ? 'COMBINED_VERIFIED'
          : sourceMode;

      const combinedMultiTopicTitle =
        additionalTopics.length > 0
          ? [
              customTopicTitle || (activeTopic ? getConciseTopicTitle(activeTopic) : subject),
              ...additionalTopics.map((t) => getConciseTopicTitle(t)),
            ].join(' + ')
          : customTopicTitle || activeTopic?.topicTitle || subject;

      const outcome = await generateQuestionsBatchWithAI({
        levelId,
        grade,
        subject,
        topicTitle: combinedMultiTopicTitle,
        lessonTitle,
        knowledgeUnit,
        learningOutcomes: activeOutcomes,
        format,
        cognitiveLevel,
        cognitiveDistribution: useMultiLevelAllocation ? cognitiveCounts : undefined,
        quantity: effectiveQuantity,
        pointsPerQuestion,
        language,
        additionalInstructions,
        sourceMode: effectiveSourceMode,
        sourcePassage:
          effectiveSourceMode === 'TEACHER_PASSAGE' ||
          effectiveSourceMode === 'COMBINED_VERIFIED'
            ? sourcePassage
            : undefined,
        sourcePassageCitation:
          effectiveSourceMode === 'TEACHER_PASSAGE' ||
          effectiveSourceMode === 'COMBINED_VERIFIED'
            ? sourcePassageCitation
            : undefined,
        uploadedDocumentText: hasUploadedDocs ? uploadedDocumentText : undefined,
        uploadedFileName: hasUploadedDocs ? uploadedFileName : undefined,
        uploadedInlineData: hasUploadedDocs ? uploadedInlineData : undefined,
        uploadedDocuments: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
        documentAnalysis: documentAnalysis || undefined,
        trueFalseStatementCount,
        trueFalseScoringRule,
        existingQuestions,
        onProgressStep: (stepIdx, msg) => {
          setProgressStepIndex(stepIdx);
          setProgressMessage(msg);
        },
      });

      const batchNumber = String(savedBatches.length + 1).padStart(2, '0');
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newBatch: AIGenerationBatch = {
        id: `batch-${Date.now()}`,
        batchCode: `ĐỢT-AI-K${grade}-${batchNumber}`,
        title: `${subject} Lớp ${grade} – ${
          customTopicTitle || activeTopic?.topicTitle || 'Chủ đề'
        } (${outcome.drafts.length} câu)`,
        createdAt: nowStr,
        updatedAt: nowStr,
        levelId,
        grade,
        subject,
        topicTitle: customTopicTitle || activeTopic?.topicTitle || subject,
        lessonTitle,
        knowledgeUnit,
        selectedOutcomeCodes: activeOutcomes.map((o) => o.code),
        sourceMode: effectiveSourceMode,
        sourcePassage: sourcePassage || undefined,
        uploadedFileName: uploadedFileName || undefined,
        uploadedDocuments: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
        documentAnalysis: documentAnalysis || undefined,
        textbookRepository: outcome.textbookRepository,
        scannedKnowledgeSummary: outcome.scannedKnowledgeSummary,
        language,
        additionalInstructions: additionalInstructions || undefined,
        engineMode: outcome.engineMode,
        drafts: outcome.drafts,
        knowledgeAnalysis: outcome.knowledgeAnalysis,
        coverageReport: outcome.coverageReport,
        fiveRoundAudit: outcome.fiveRoundAudit,
        cognitiveDistribution: useMultiLevelAllocation ? cognitiveCounts : undefined,
      };

      persistCurrentBatch(newBatch);

      if (outcome.coverageReport.coverageWarning) {
        onNotify(
          'warning',
          `Đã tạo ${outcome.drafts.length} câu hỏi (Độ bao phủ YCCĐ: ${outcome.coverageReport.coveragePercentage}%)`,
          outcome.coverageReport.coverageWarning
        );
      } else if (outcome.noticeMessage) {
        onNotify('info', 'Đã tạo bản nháp câu hỏi & Hậu kiểm tự động', outcome.noticeMessage);
      } else {
        onNotify(
          'success',
          'Hoàn tất Quy trình 11 bước tạo câu hỏi thông minh',
          `Đã sinh ${outcome.drafts.length} câu hỏi chuẩn GDPT 2018${
            uploadedDocuments.length > 0
              ? ` từ ${uploadedDocuments.length} tài liệu đã tải lên`
              : ''
          } và đạt kiểm định 6 tiêu chí >= 8.0/10.`
        );
      }
    } catch (error) {
      console.error(error);
      onNotify(
        'error',
        'Lỗi trong quá trình tạo câu hỏi',
        'Không thể hoàn tất yêu cầu tạo câu hỏi. Vui lòng kiểm tra lại cấu hình.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Tinh chỉnh 1 câu hỏi bằng AI (Tạo lại, Tương tự, Tăng/Giảm độ khó, Đổi bối cảnh, Viết rõ hơn)
  const handleRefineSingleDraft = async (
    draft: AIGeneratedQuestionDraft,
    action: AIRefineAction
  ) => {
    if (!currentBatch) return;
    setRefiningDraftId(draft.draftId);
    try {
      const refined = await refineQuestionDraftWithAI(
        draft,
        action,
        existingQuestions
      );

      let nextDrafts: AIGeneratedQuestionDraft[];
      if (action === 'SIMILAR') {
        const idx = currentBatch.drafts.findIndex(
          (d) => d.draftId === draft.draftId
        );
        nextDrafts = [...currentBatch.drafts];
        nextDrafts.splice(idx + 1, 0, refined);
        onNotify(
          'success',
          'Đã tạo thêm câu hỏi tương tự',
          'Câu hỏi tương đương đã được chèn ngay bên dưới và chạy kiểm tra tự động.'
        );
      } else {
        nextDrafts = currentBatch.drafts.map((d) =>
          d.draftId === draft.draftId ? refined : d
        );
        onNotify(
          'success',
          'Đã tinh chỉnh câu hỏi',
          'Nội dung câu hỏi đã được cập nhật và kiểm tra tự động lại.'
        );
      }

      persistCurrentBatch({
        ...currentBatch,
        drafts: nextDrafts,
      });
    } finally {
      setRefiningDraftId(null);
    }
  };

  // Phân tích chất lượng sư phạm của 1 câu hỏi
  const handleAnalyzeQuality = async (draft: AIGeneratedQuestionDraft) => {
    if (!currentBatch) return;
    setAnalyzingDraftId(draft.draftId);
    try {
      const analysis = await analyzeQuestionQualityWithAI(draft);
      const nextDrafts = currentBatch.drafts.map((d) =>
        d.draftId === draft.draftId ? { ...d, qualityAnalysis: analysis } : d
      );
      persistCurrentBatch({
        ...currentBatch,
        drafts: nextDrafts,
      });
      onNotify(
        'success',
        'Hoàn tất phân tích chất lượng',
        `Điểm chất lượng sư phạm tổng thể: ${analysis.overallScore}/100.`
      );
    } finally {
      setAnalyzingDraftId(null);
    }
  };

  // Bắt đầu sửa thủ công 1 câu nháp (Bước 4: Giáo viên xem và sửa)
  const handleStartEditDraft = (draft: AIGeneratedQuestionDraft) => {
    setEditingDraftId(draft.draftId);
    const cloned: AIGeneratedQuestionDraft = JSON.parse(JSON.stringify(draft));
    cloned.stem = cleanStudentQuestionStem(cloned.stem);
    if (cloned.options) {
      cloned.options = cloned.options.map((o) => cleanStudentOptionOrStatement(o));
    }
    if (cloned.subStatements) {
      cloned.subStatements = cloned.subStatements.map((s) => ({
        ...s,
        statement: cleanStudentOptionOrStatement(s.statement),
      }));
    }
    cloned.correctAnswer = cleanStudentOptionOrStatement(cloned.correctAnswer);
    setEditDraftBuffer(cloned);
  };

  const handleSaveManualEdit = () => {
    if (!currentBatch || !editDraftBuffer) return;

    // Chạy lại bộ kiểm tra tự động sau khi giáo viên sửa
    const rechecked = runAutomatedQuestionVerification(
      editDraftBuffer,
      existingQuestions,
      currentBatch.sourceMode,
      currentBatch.sourcePassage
    );

    const updatedDraft: AIGeneratedQuestionDraft = {
      ...editDraftBuffer,
      autoCheck: rechecked,
      teacherVerified: true,
    };

    const nextDrafts = currentBatch.drafts.map((d) =>
      d.draftId === updatedDraft.draftId ? updatedDraft : d
    );

    persistCurrentBatch({
      ...currentBatch,
      drafts: nextDrafts,
    });
    setEditingDraftId(null);
    setEditDraftBuffer(null);
    onNotify(
      'success',
      'Đã lưu chỉnh sửa & Xác minh',
      'Câu hỏi đã được cập nhật và kiểm tra tự động lại.'
    );
  };

  // Đánh dấu Giáo viên đã xác minh
  const handleToggleTeacherVerified = (draftId: string) => {
    if (!currentBatch) return;
    const nextDrafts = currentBatch.drafts.map((d) =>
      d.draftId === draftId ? { ...d, teacherVerified: !d.teacherVerified } : d
    );
    persistCurrentBatch({
      ...currentBatch,
      drafts: nextDrafts,
    });
  };

  // Xóa 1 câu nháp khỏi đợt
  const handleRemoveDraftFromBatch = (draftId: string) => {
    if (!currentBatch) return;
    const nextDrafts = currentBatch.drafts.filter((d) => d.draftId !== draftId);
    persistCurrentBatch({
      ...currentBatch,
      drafts: nextDrafts,
    });
  };

  // Chuyển đổi AIGeneratedQuestionDraft -> QuestionItem để lưu vào Ngân hàng
  const convertDraftToBankPayload = (
    draft: AIGeneratedQuestionDraft,
    targetStatus: ApprovalStatus
  ): Omit<QuestionItem, 'id' | 'code' | 'createdAt'> => {
    return {
      levelId: draft.levelId,
      grade: draft.grade,
      subject: draft.subject,
      topicTitle: draft.topicTitle,
      lessonTitle: draft.lessonTitle,
      knowledgeUnit: draft.knowledgeUnit,
      learningOutcomeCode: draft.learningOutcomeCode,
      learningOutcomeText: draft.learningOutcomeText,
      cognitiveLevel: draft.cognitiveLevel,
      format: draft.format,
      stem: cleanStudentQuestionStem(draft.stem),
      options: draft.options?.map((o) => cleanStudentOptionOrStatement(o)),
      correctOptionIndices: draft.correctOptionIndices,
      subStatements: draft.subStatements?.map((s) => ({
        ...s,
        statement: cleanStudentOptionOrStatement(s.statement),
      })),
      trueFalseScoringRule: draft.trueFalseScoringRule,
      acceptedVariations: draft.acceptedVariations,
      rubricCriteria: draft.rubricCriteria,
      matchingPairs: draft.matchingPairs,
      orderingItems: draft.orderingItems,
      blanks: draft.blanks,
      sharedPassage: draft.sharedPassage,
      sharedPassageAuthor: draft.sharedPassageCitation,
      correctAnswer: cleanStudentOptionOrStatement(draft.correctAnswer),
      gradingGuide: draft.explanation,
      points: draft.suggestedPoints,
      questionSource: `AI Gemini tạo (${draft.usedSourceSummary})`,
      tags: ['AI-Gemini', draft.learningOutcomeCode, `Lớp-${draft.grade}`],
      status: targetStatus,
      authorName: 'Giáo viên & Trợ lý AI',
      isSampleData: false,
    };
  };

  // Bước 5 & 6: Lưu 1 câu vào Ngân hàng (Nháp hoặc Gửi duyệt)
  const handleSaveSingleDraftToBank = (
    draft: AIGeneratedQuestionDraft,
    targetStatus: ApprovalStatus
  ) => {
    if (!currentBatch) return;
    if (draft.autoCheck.answerLeakDetected) {
      onNotify(
        'error',
        'Không thể lưu câu hỏi bị lộ đáp án',
        'Vui lòng bấm "Sửa nội dung" để xóa đáp án bị lộ trong câu dẫn trước khi lưu vào Ngân hàng.'
      );
      return;
    }

    const created = onSaveQuestionToBank(
      convertDraftToBankPayload(draft, targetStatus)
    );

    const nextDrafts = currentBatch.drafts.map((d) =>
      d.draftId === draft.draftId
        ? {
            ...d,
            teacherVerified: true,
            savedQuestionId: created.id,
            savedStatus: targetStatus,
          }
        : d
    );

    persistCurrentBatch({
      ...currentBatch,
      drafts: nextDrafts,
    });

    onNotify(
      'success',
      targetStatus === ApprovalStatus.PENDING
        ? 'Đã lưu Ngân hàng & Gửi duyệt'
        : 'Đã lưu vào Ngân hàng câu hỏi',
      `Mã câu hỏi mới: ${created.code} (${
        targetStatus === ApprovalStatus.PENDING ? 'Chờ duyệt' : 'Nháp'
      }).`
    );
  };

  // Lưu hàng loạt toàn bộ các câu chưa lưu trong đợt vào Ngân hàng
  const handleSaveAllBatchToBank = (targetStatus: ApprovalStatus) => {
    if (!currentBatch) return;
    const unsaved = currentBatch.drafts.filter(
      (d) => !d.savedQuestionId && !d.autoCheck.answerLeakDetected
    );
    if (unsaved.length === 0) {
      onNotify(
        'info',
        'Tất cả câu hỏi hợp lệ đã được lưu',
        'Không còn bản nháp mới nào cần lưu trong đợt này.'
      );
      return;
    }

    const payloads = unsaved.map((d) =>
      convertDraftToBankPayload(d, targetStatus)
    );
    const createdItems = onBulkSaveQuestionsToBank(payloads);

    let createdIdx = 0;
    const nextDrafts = currentBatch.drafts.map((d) => {
      if (!d.savedQuestionId && !d.autoCheck.answerLeakDetected) {
        const created = createdItems[createdIdx++];
        return {
          ...d,
          teacherVerified: true,
          savedQuestionId: created?.id || `saved-${Date.now()}`,
          savedStatus: targetStatus,
        };
      }
      return d;
    });

    persistCurrentBatch({
      ...currentBatch,
      drafts: nextDrafts,
    });

    onNotify(
      'success',
      targetStatus === ApprovalStatus.PENDING
        ? `Đã lưu & gửi duyệt ${createdItems.length} câu hỏi`
        : `Đã lưu ${createdItems.length} câu hỏi vào Ngân hàng`,
      `Đợt ${currentBatch.batchCode} đã được đồng bộ vào Ngân hàng câu hỏi.`
    );
  };

  // Tính bước quy trình hiện tại (1..6)
  const activeWorkflowStep = useMemo(() => {
    if (isGenerating) return 2;
    if (!currentBatch || currentBatch.drafts.length === 0) return 1;
    const anySentForApproval = currentBatch.drafts.some(
      (d) => d.savedStatus === ApprovalStatus.PENDING
    );
    if (anySentForApproval) return 6;
    const anySaved = currentBatch.drafts.some((d) => Boolean(d.savedQuestionId));
    if (anySaved) return 5;
    const anyVerified = currentBatch.drafts.some((d) => d.teacherVerified);
    if (anyVerified) return 4;
    return 3;
  }, [isGenerating, currentBatch]);

  const workflowSteps = [
    { step: 1, label: '1. Chọn chủ đề & YCCĐ' },
    { step: 2, label: '2. Tải tài liệu & Cấu hình' },
    { step: 3, label: '3. AI Tạo câu hỏi' },
    { step: 4, label: '4. Giáo viên rà soát & Sửa' },
    { step: 5, label: '5. Lưu vào Ngân hàng' },
    { step: 6, label: '6. Gửi duyệt chính thức' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Thanh quy trình biên soạn dành cho Giáo viên */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                TRỢ LÝ AI BIÊN SOẠN CÂU HỎI CHUẨN GDPT 2018
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                BAO QUÁT KIẾN THỨC · BÁM SÁT YCCĐ · PHÂN HÓA NĂNG LỰC · ĐÁP ÁN CHÍNH XÁC
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5">
              AI Tạo Câu Hỏi Kiểm Tra Đánh Giá
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowBatchHistoryModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <FolderArchive className="w-4 h-4 text-slate-600" />
              Đợt nháp đã lưu ({savedBatches.length})
            </button>
          </div>
        </div>

        {/* Stepper 6 bước */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-4">
          {workflowSteps.map((ws) => {
            const isDone = activeWorkflowStep > ws.step;
            const isCurrent = activeWorkflowStep === ws.step;
            return (
              <div
                key={ws.step}
                className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                    : isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? '✓' : ws.step}
                </span>
                <span className="truncate">{ws.label}</span>
              </div>
            );
          })}
        </div>

        {/* Hộp 5 Nguyên tắc Phân tích và Tạo câu hỏi chuẩn GDPT 2018 */}
        <details className="group mt-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs overflow-hidden">
          <summary className="px-4 py-2.5 cursor-pointer select-none flex flex-wrap items-center justify-between gap-2 font-bold text-slate-800 hover:bg-slate-100/80 transition">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                NGUYÊN TẮC PHÂN TÍCH VÀ TẠO CÂU HỎI (CHUẨN CHƯƠNG TRÌNH GDPT 2018)
              </span>
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-white px-2.5 py-0.5 rounded-md border border-blue-200">
              Xem 5 nguyên tắc cốt lõi
            </span>
          </summary>

          <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 text-[11px] text-slate-700 leading-relaxed">
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/80 space-y-1.5">
              <div className="font-bold text-blue-950 text-xs">
                1. Phân tích Dữ liệu (Đầu vào)
              </div>
              <p>
                <strong>• Bám sát tuyệt đối dữ liệu gốc (No Hallucination):</strong>{' '}
                Chỉ sử dụng dữ kiện, khái niệm từ chính Sách giáo khoa và Yêu cầu cần đạt giáo viên chọn/tải lên; không tự ý bịa đặt.
              </p>
              <p>
                <strong>• Bao quát toàn diện:</strong> Quét toàn bộ nội dung bài học/chủ đề để phân bổ câu hỏi rải đều từ đầu đến cuối bài.
              </p>
              <p>
                <strong>• Xử lý văn bản thông minh (OCR):</strong> Tự động nhận diện PDF dạng ảnh/scan và dùng AI Vision bóc tách từng trang.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-violet-50/50 border border-violet-200/80 space-y-1.5">
              <div className="font-bold text-violet-950 text-xs">
                2. Định dạng & Phân loại (Mức độ)
              </div>
              <p>
                <strong>• 3 mức độ nhận thức (Bloom – GDPT 2018):</strong> Chuẩn hóa theo <strong>BIẾT</strong> (Nhận biết), <strong>HIỂU</strong> (Thông hiểu) và <strong>VẬN DỤNG</strong>.
              </p>
              <p>
                <strong>• Đặc biệt (Câu hỏi Đúng/Sai):</strong> Từng ý nhỏ (<strong>a, b, c, d</strong>) trong một câu Đúng/Sai được đánh giá và gắn nhãn mức độ nhận thức độc lập thay vì gộp chung cả câu.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
              <div className="font-bold text-emerald-950 text-xs">
                3. Xây dựng Câu hỏi (Đầu ra)
              </div>
              <p>
                <strong>• Phát triển phẩm chất, năng lực:</strong> Ưu tiên lồng ghép tình huống thực tiễn gần gũi với học sinh, hạn chế học vẹt máy móc.
              </p>
              <p>
                <strong>• Phương án nhiễu logic:</strong> 3 phương án sai được thiết kế dựa trên lỗi sai hoặc sự nhầm lẫn khái niệm phổ biến của học sinh.
              </p>
              <p>
                <strong>• Chống trùng lặp:</strong> Tự động đối chiếu chéo để loại bỏ câu hỏi trùng ý tưởng.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-1.5">
              <div className="font-bold text-amber-950 text-xs">
                4. Đáp án & Lời giải chi tiết
              </div>
              <p>
                <strong>• Giải thích chi tiết 100%:</strong> Giải thích rõ tại sao đáp án đúng là đúng và tại sao các phương án còn lại là sai.
              </p>
              <p>
                <strong>• Truy xuất nguồn gốc:</strong> Hiển thị rõ ngay dưới đáp án: câu hỏi đáp ứng Yêu cầu cần đạt nào và nằm ở mục nào trong sách.
              </p>
              <p>
                <strong>• Tiêu chí chấm tự luận:</strong> Chia nhỏ đáp án thành từng bước kèm thang điểm gợi ý (<strong>Barem</strong>).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-100/80 border border-slate-300/80 space-y-1.5">
              <div className="font-bold text-slate-900 text-xs">
                5. Cơ chế Dự phòng (Fallback Offline)
              </div>
              <p>
                <strong>• Tự động chuyển đổi Rule-based NLP:</strong> Khi mất kết nối mạng hoặc máy chủ AI quá tải, hệ thống tự động kích hoạt thuật toán NLP cục bộ.
              </p>
              <p>
                <strong>• Quét từ khóa thông minh:</strong> Tìm các cấu trúc (<em>“là gì”</em>, <em>“được gọi là”</em>, <em>“bao gồm”</em>, số liệu...) để tạo câu hỏi điền khuyết, Đúng/Sai, Trắc nghiệm, Tự luận an toàn.
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Bố cục 2 cột: Cột trái Cấu hình tạo câu hỏi (5/12) - Cột phải Danh sách câu hỏi & Rà soát (7/12) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: FORM CẤU HÌNH CHI TIẾT */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              1. Cấu hình thông số & Nguồn tạo câu hỏi
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Tối đa {MAX_AI_BATCH_SIZE} câu/lần
            </span>
          </div>

          {/* Cấp học, Khối lớp, Môn học */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cấp học {isAiScopeRestricted && <span className="text-indigo-700">(Theo quyền)</span>}
              </label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value as EducationLevelId)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                {allowedAiLevels.includes(EducationLevelId.PRIMARY) && (
                  <option value={EducationLevelId.PRIMARY}>Tiểu học (TT 27)</option>
                )}
                {allowedAiLevels.includes(EducationLevelId.LOWER_SECONDARY) && (
                  <option value={EducationLevelId.LOWER_SECONDARY}>
                    THCS (TT 22 & CV 7991)
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối lớp
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeNumber)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                {allowedAiGrades.map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Môn học {isAiScopeRestricted && <span className="text-indigo-700">(Theo quyền)</span>}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                {allowedAiSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chủ đề, Bài học, Đơn vị kiến thức */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 overflow-hidden">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chủ đề từ CSDL Chương trình ({matchingTopics.length} chủ đề)
              </label>
              {matchingTopics.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={selectedTopicId}
                    onChange={(e) => handleSelectTopic(e.target.value)}
                    className="w-full max-w-full truncate rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    {matchingTopics.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        title={`[${t.chapterCode}] ${getConciseTopicTitle(t)}`}
                      >
                        {getTopicSelectOptionText(t)}
                      </option>
                    ))}
                  </select>

                  {activeTopic && (
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 text-[11px] text-slate-700 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="font-semibold text-slate-900 break-words">
                          <span className="font-mono text-blue-700 mr-1.5">
                            [{activeTopic.chapterCode}]
                          </span>
                          <span>{getConciseTopicTitle(activeTopic)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-500">
                          {activeTopic.semester && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {activeTopic.semester === 'HK1'
                                ? 'Học kì I'
                                : activeTopic.semester === 'HK2'
                                ? 'Học kì II'
                                : 'Cả năm'}
                            </span>
                          )}
                          {activeTopic.weekRange && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                              {activeTopic.weekRange}
                            </span>
                          )}
                          {activeTopic.totalPeriods && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                              {activeTopic.totalPeriods} tiết
                            </span>
                          )}
                        </div>
                      </div>

                      {activeTopicLessons.length > 1 && (
                        <div className="pt-1 border-t border-slate-100">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Chọn nhanh bài học thuộc chủ đề ({activeTopicLessons.length} bài):
                          </label>
                          <select
                            value={
                              activeTopicLessons.includes(lessonTitle)
                                ? lessonTitle
                                : ''
                            }
                            onChange={(e) =>
                              handleSelectLessonInTopic(e.target.value)
                            }
                            className="w-full max-w-full truncate rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
                          >
                            <option value="">
                              -- Tất cả bài học trong chủ đề ({activeTopicLessons.length} bài) --
                            </option>
                            {activeTopicLessons.map((lsName, idx) => (
                              <option key={idx} value={lsName}>
                                {lsName.length > 82
                                  ? `${lsName.slice(0, 79)}...`
                                  : lsName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {matchingTopics.length > 1 && (
                        <div className="pt-1.5 border-t border-slate-100 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                              Chọn kết hợp thêm chủ đề ({1 + additionalSelectedTopicIds.length}/{matchingTopics.length} chủ đề):
                            </span>
                            {additionalSelectedTopicIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setAdditionalSelectedTopicIds([])}
                                className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                              >
                                Chỉ giữ 1 chủ đề
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {matchingTopics
                              .filter((t) => t.id !== selectedTopicId)
                              .map((t) => {
                                const isAdded = additionalSelectedTopicIds.includes(t.id);
                                return (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => handleToggleAdditionalTopic(t.id)}
                                    className={`px-2 py-0.5 rounded border text-[10px] font-medium transition cursor-pointer ${
                                      isAdded
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50'
                                    }`}
                                    title={`Kết hợp chủ đề: [${t.chapterCode}] ${getConciseTopicTitle(t)}`}
                                  >
                                    {isAdded ? '✓ ' : '+ '}
                                    [{t.chapterCode}] {getConciseTopicTitle(t).slice(0, 32)}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={customTopicTitle}
                  onChange={(e) => setCustomTopicTitle(e.target.value)}
                  placeholder="Nhập tên chủ đề chương trình..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bài học cụ thể
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="VD: Bài 4. Phép cộng phân số"
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đơn vị kiến thức / Nội dung trọng tâm
                </label>
                <input
                  type="text"
                  value={knowledgeUnit}
                  onChange={(e) => setKnowledgeUnit(e.target.value)}
                  placeholder="VD: Quy đồng mẫu số & Rút gọn"
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Chọn một hoặc nhiều Yêu cầu cần đạt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Chọn Yêu cầu cần đạt ({selectedOutcomeCodes.length} đã chọn)
                </label>
                {activeTopic && activeTopic.learningOutcomes.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOutcomeCodes(
                        selectedOutcomeCodes.length ===
                          activeTopic.learningOutcomes.length
                          ? []
                          : activeTopic.learningOutcomes.map((lo) => lo.code)
                      )
                    }
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    {selectedOutcomeCodes.length ===
                    activeTopic.learningOutcomes.length
                      ? 'Bỏ chọn hết'
                      : 'Chọn tất cả'}
                  </button>
                )}
              </div>

              {activeTopic && activeTopic.learningOutcomes.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeTopic.learningOutcomes.map((lo) => {
                    const checked = selectedOutcomeCodes.includes(lo.code);
                    return (
                      <label
                        key={lo.code}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          checked
                            ? 'bg-blue-50/90 border-blue-300 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleOutcomeCode(lo.code)}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 leading-snug">
                          <span className="font-mono font-bold text-blue-700 mr-1.5">
                            [{lo.code}]
                          </span>
                          <span>{cleanLearningOutcomeText(lo.description)}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-2">
                <input
                  type="text"
                  value={customOutcomeText}
                  onChange={(e) => setCustomOutcomeText(e.target.value)}
                  placeholder="+ Hoặc nhập bổ sung Yêu cầu cần đạt chi tiết khác tại đây..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Loại câu hỏi, Mức độ nhận thức, Số lượng, Điểm, Ngôn ngữ */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại câu hỏi (theo môn & cấp học)
                </label>
                <select
                  value={format}
                  onChange={(e) => {
                    const nextFmt = e.target.value as QuestionFormatCode;
                    setFormat(nextFmt);
                    const def = allowedFormats.find((f) => f.code === nextFmt);
                    if (def) setPointsPerQuestion(def.defaultPoints);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
                >
                  {allowedFormats.map((fmt) => (
                    <option key={fmt.code} value={fmt.code}>
                      {fmt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điểm mỗi câu
                </label>
                <input
                  type="number"
                  step="0.25"
                  min={0.25}
                  max={10}
                  value={pointsPerQuestion}
                  onChange={(e) =>
                    setPointsPerQuestion(Math.max(Number(e.target.value) || 0.25, 0.25))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Phân hóa theo mức độ nhận thức (Chọn 1 mức độ hoặc Phân bổ số câu theo từng mức độ) */}
            <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200/80 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-950">
                  Phân hóa mức độ nhận thức & Số lượng câu
                </span>
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMultiLevelAllocation}
                    onChange={(e) => setUseMultiLevelAllocation(e.target.checked)}
                    className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Thiết lập số câu theo từng mức độ</span>
                </label>
              </div>

              {!useMultiLevelAllocation ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mức độ nhận thức
                    </label>
                    <select
                      value={cognitiveLevel}
                      onChange={(e) =>
                        setCognitiveLevel(e.target.value as CognitiveLevelCode)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    >
                      {ruleSet.cognitiveLevels.map((cl) => (
                        <option key={cl.code} value={cl.code}>
                          {cl.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Số lượng câu cần tạo (1–{MAX_AI_BATCH_SIZE})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={MAX_AI_BATCH_SIZE}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            Math.max(Number(e.target.value) || 1, 1),
                            MAX_AI_BATCH_SIZE
                          )
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {ruleSet.cognitiveLevels.map((cl) => (
                      <div
                        key={cl.code}
                        className="bg-white p-2 rounded-lg border border-indigo-200"
                      >
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1 truncate">
                          {cl.name}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={MAX_AI_BATCH_SIZE}
                          value={cognitiveCounts[cl.code] ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setCognitiveCounts((prev) => ({
                              ...prev,
                              [cl.code]: val,
                            }));
                          }}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-bold text-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-indigo-800 flex items-center justify-between">
                    <span>
                      Tổng số câu hỏi sẽ tạo theo phân bổ:{' '}
                      <strong>{effectiveQuantity} câu</strong> (Tối đa {MAX_AI_BATCH_SIZE} câu/đợt)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cấu hình riêng nếu chọn dạng Đúng - Sai */}
          {format === QuestionFormatCode.TRUE_FALSE_CLUSTER && (
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 space-y-2.5">
              <div className="text-xs font-bold text-amber-900">
                Cấu hình câu hỏi Đúng – Sai
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                    Số mệnh đề ý nhỏ (a, b, c...)
                  </label>
                  <select
                    value={trueFalseStatementCount}
                    onChange={(e) =>
                      setTrueFalseStatementCount(Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value={2}>2 ý nhỏ (a, b)</option>
                    <option value={3}>3 ý nhỏ (a, b, c)</option>
                    <option value={4}>4 ý nhỏ (a, b, c, d - Chuẩn CV 7991)</option>
                    <option value={5}>5 ý nhỏ (a, b, c, d, e)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                    Quy tắc tính điểm theo cấp học
                  </label>
                  <select
                    value={trueFalseScoringRule}
                    onChange={(e) =>
                      setTrueFalseScoringRule(
                        e.target.value as
                          | 'EQUAL_PER_ITEM'
                          | 'PROGRESSIVE_CV7991'
                          | 'CUSTOM'
                      )
                    }
                    className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value="PROGRESSIVE_CV7991">
                      Lũy tiến theo số ý đúng (0.1 - 0.25 - 0.5 - 1.0đ)
                    </option>
                    <option value="EQUAL_PER_ITEM">
                      Chia đều điểm cho mỗi ý đúng (Tiểu học / Tự chọn)
                    </option>
                    <option value="CUSTOM">
                      Tùy chỉnh theo hướng dẫn chấm của tổ chuyên môn
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Ngôn ngữ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngôn ngữ biên soạn
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900"
            >
              <option value="Tiếng Việt chuẩn GDPT 2018">
                Tiếng Việt chuẩn mực (Chương trình GDPT 2018)
              </option>
              <option value="Tiếng Anh (English Assessment)">
                Tiếng Anh (Dành cho môn Ngoại ngữ / Toán - Khoa học tiếng Anh)
              </option>
              <option value="Song ngữ Việt - Anh">
                Song ngữ Việt – Anh
              </option>
            </select>
          </div>

          {/* 4 Chế độ Nguồn tài liệu (A, B, C, D) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-800">
              Chế độ nguồn tài liệu dùng để tạo câu hỏi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOURCE_MODES.map((sm) => {
                const active = sourceMode === sm.id;
                return (
                  <button
                    key={sm.id}
                    type="button"
                    onClick={() => setSourceMode(sm.id)}
                    className={`text-left p-2.5 rounded-lg border transition cursor-pointer ${
                      active
                        ? 'bg-blue-50 border-blue-500 text-blue-950 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{sm.shortTitle}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {sm.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* KHU VỰC ĐƯA TÀI LIỆU LÊN ĐỂ AI PHÂN TÍCH TẠO CÂU HỎI (CÔNG NGHỆ AI VISION OCR) */}
            <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Tải tài liệu nguồn lên để AI tạo câu hỏi ({uploadedDocuments.length} tài liệu)
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Công nghệ AI Vision OCR
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Nhận diện tài liệu tự động bằng <strong>Công nghệ AI Vision OCR</strong>: Đọc chính xác chữ tiếng Việt có dấu, công thức toán/lý/hóa (<code>$...$</code>), bảng biểu và sơ đồ từ <strong>Sách giáo khoa (SGK)</strong>, <strong>Sách giáo viên (SGV)</strong>, <strong>Tài liệu tham khảo</strong>, <strong>Tài liệu YCCĐ/PPCT</strong> (<code>.pdf</code> bản in/scan, <code>.docx</code>, <code>.txt</code>, ảnh chụp trang sách).
              </p>

              {/* Chọn loại tài liệu trước khi tải lên */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {(
                  [
                    { id: 'TEXTBOOK', label: '1. Sách giáo khoa' },
                    { id: 'TEACHER_BOOK', label: '2. Sách giáo viên' },
                    { id: 'WORKBOOK', label: '3. Sách bài tập' },
                    { id: 'REFERENCE_DOC', label: '4. Tài liệu tham khảo' },
                    { id: 'CURRICULUM_SPEC', label: '5. Tài liệu YCCĐ' },
                  ] as { id: AIDocumentCategory; label: string }[]
                ).map((cat) => {
                  const activeCat = selectedUploadCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedUploadCategory(cat.id)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                        activeCat
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Nút chọn 1 hoặc nhiều tệp từ máy tính */}
              <label className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50/50 text-xs font-semibold text-blue-800 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>
                    Chọn tệp {getDocumentCategoryLabel(selectedUploadCategory)} từ máy tính (.pdf, .docx, .txt, ảnh...)
                  </span>
                </div>
                <span className="text-[11px] font-normal text-slate-500">
                  Có thể chọn nhiều tệp cùng lúc · Tự động nhận diện mặt chữ, công thức & bảng biểu bằng AI Vision OCR
                </span>
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.csv,.json,.docx,.doc,.pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Trạng thái đang nhận diện tài liệu bằng AI Vision OCR */}
              {pdfReadProgress &&
                pdfReadProgress.stage !== 'COMPLETED_SUCCESS' && (
                  <div className="p-2.5 rounded-lg bg-white border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
                    <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                      <span>
                        AI Vision OCR đang xử lý ({pdfReadProgress.readPagesCount}/{pdfReadProgress.totalPages} trang)...
                      </span>
                    </span>
                    <span className="text-[10px] text-indigo-700 font-medium">
                      {pdfReadProgress.statusDetailMessage || pdfReadProgress.stageLabel}
                    </span>
                  </div>
                )}

              {/* Danh sách các tài liệu đã tải lên */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Tài liệu nguồn đã nhận diện ({uploadedDocuments.length}):
                    </span>
                    <button
                      type="button"
                      disabled={isAnalyzingDocuments}
                      onClick={handleAnalyzeUploadedDocuments}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition cursor-pointer"
                    >
                      {isAnalyzingDocuments ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Đang phân tích tài liệu...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3" />
                          Phân tích Tài liệu ({uploadedDocuments.length})
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {uploadedDocuments.map((doc) => {
                      const isEditingThisDoc = editingDocId === doc.id;
                      const pdfMeta = doc.pdfReaderMeta;
                      const isVisionRecognized =
                        pdfMeta?.ocrEngineUsed === 'GEMINI_MULTIMODAL_VISION' ||
                        pdfMeta?.ocrEngineUsed === 'HYBRID_TEXT_AND_VISION' ||
                        doc.mimeType === 'application/pdf' ||
                        doc.mimeType.startsWith('image/');
                      return (
                        <div
                          key={doc.id}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <select
                                  value={doc.category}
                                  onChange={(e) =>
                                    handleUpdateDocumentCategory(
                                      doc.id,
                                      e.target.value as AIDocumentCategory
                                    )
                                  }
                                  className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800"
                                >
                                  <option value="TEXTBOOK">Sách giáo khoa (SGK)</option>
                                  <option value="TEACHER_BOOK">Sách giáo viên (SGV)</option>
                                  <option value="WORKBOOK">Sách bài tập (SBT)</option>
                                  <option value="REFERENCE_DOC">Tài liệu tham khảo</option>
                                  <option value="CURRICULUM_SPEC">Tài liệu YCCĐ / PPCT</option>
                                </select>
                                <span
                                  className="font-semibold text-slate-900 truncate"
                                  title={doc.fileName}
                                >
                                  {doc.fileName}
                                </span>
                                {isVisionRecognized && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                    AI Vision OCR
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                                <span>
                                  {Math.max(1, Math.round(doc.sizeBytes / 1024))} KB
                                  {doc.pageCount ? ` · ${doc.pageCount} trang` : ''}
                                  {pdfMeta
                                    ? ` · Đã nhận diện ${pdfMeta.recognizedOcrPagesCount}/${pdfMeta.totalPages} trang`
                                    : ''}
                                </span>
                                {rawPdfFilesMap[doc.id] && (
                                  <button
                                    type="button"
                                    disabled={retryingPdfDocId === doc.id}
                                    onClick={() => handleRescanWithAiVisionOcr(doc)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold hover:bg-indigo-100 cursor-pointer"
                                    title="Quét nhận diện lại tài liệu bằng công nghệ AI Vision OCR"
                                  >
                                    <RefreshCw
                                      className={`w-2.5 h-2.5 ${
                                        retryingPdfDocId === doc.id ? 'animate-spin' : ''
                                      }`}
                                    />
                                    Quét lại AI Vision OCR
                                  </button>
                                )}
                                {pdfMeta &&
                                  pdfMeta.pagesNeedingRecheckCount > 0 &&
                                  rawPdfFilesMap[doc.id] && (
                                    <button
                                      type="button"
                                      disabled={retryingPdfDocId === doc.id}
                                      onClick={() => handleRetryUncertainPdfPages(doc)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer"
                                    >
                                      <RefreshCw
                                        className={`w-2.5 h-2.5 ${
                                          retryingPdfDocId === doc.id ? 'animate-spin' : ''
                                        }`}
                                      />
                                      Đọc lại độ nét cao Trang {pdfMeta.pagesNeedingRecheckNumbers.join(', ')}
                                    </button>
                                  )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingDocId(isEditingThisDoc ? null : doc.id)
                                }
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                              >
                                {isEditingThisDoc ? 'Thu gọn' : 'Xem/Sửa'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveUploadedDocument(doc.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Xóa tài liệu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {isEditingThisDoc && (
                            <textarea
                              rows={4}
                              value={doc.extractedText}
                              onChange={(e) =>
                                handleUpdateDocumentText(doc.id, e.target.value)
                              }
                              className="w-full rounded border border-slate-300 bg-slate-50 p-2 text-[11px] text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                              placeholder="Nội dung trích xuất từ tài liệu..."
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tóm tắt gọn kết quả phân tích tài liệu dành cho Giáo viên */}
              {documentAnalysis && (
                <div className="p-3 rounded-lg bg-indigo-50/80 border border-indigo-200 space-y-1.5 text-[11px] text-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Đã phân tích {documentAnalysis.documentNames.length} tài liệu
                    </span>
                  </div>
                  <div>
                    <strong>Bài học:</strong> {documentAnalysis.detectedLessonTitle} ·{' '}
                    <strong>Trọng tâm:</strong> {documentAnalysis.detectedKnowledgeUnit}
                  </div>
                  {documentAnalysis.extractedOutcomes.length > 0 && (
                    <div>
                      <strong>Yêu cầu cần đạt trích xuất ({documentAnalysis.extractedOutcomes.length}):</strong>
                      <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                        {documentAnalysis.extractedOutcomes.slice(0, 3).map((eo) => (
                          <li key={eo.code}>
                            <span className="font-mono font-bold text-indigo-700">
                              [{eo.code}]
                            </span>{' '}
                            {eo.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Khung nhập văn bản / ngữ liệu trực tiếp (Khi chọn B hoặc D) */}
            {(sourceMode === 'TEACHER_PASSAGE' ||
              sourceMode === 'COMBINED_VERIFIED') && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  Văn bản hoặc ngữ liệu đọc hiểu do giáo viên nhập trực tiếp (Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  value={sourcePassage}
                  onChange={(e) => setSourcePassage(e.target.value)}
                  placeholder="Dán đoạn ngữ liệu đọc hiểu, tư liệu lịch sử/địa lý hoặc thông tin khoa học đã xác minh..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900"
                />
                <input
                  type="text"
                  value={sourcePassageCitation}
                  onChange={(e) => setSourcePassageCitation(e.target.value)}
                  placeholder="Nguồn trích dẫn & Tác giả xác thực (VD: SGK Ngữ văn 6 Tập 1 - Kết nối tri thức, tr. 42)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Yêu cầu bổ sung */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Yêu cầu bổ sung cho AI (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="VD: Gắn với tình huống tiết kiệm điện năng trong gia đình; sử dụng số liệu nguyên dương..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Thanh hiển thị tiến trình tạo câu hỏi */}
          {isGenerating && (
            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Đang phân tích tài liệu & biên soạn câu hỏi (Bước {progressStepIndex}/5)
                </span>
                <span>{Math.min(progressStepIndex * 20, 100)}%</span>
              </div>
              <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${Math.min(progressStepIndex * 20, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-blue-800">{progressMessage}</p>
            </div>
          )}

          {/* Nút Tạo câu hỏi bằng AI */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateQuestions}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shadow-xs transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang biên soạn câu hỏi chuẩn GDPT 2018...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Tạo {effectiveQuantity} câu hỏi bằng AI
              </>
            )}
          </button>
        </div>

        {/* CỘT PHẢI: DANH SÁCH CÂU HỎI AI, CHỈNH SỬA & LƯU NGÂN HÀNG */}
        <div className="xl:col-span-7 space-y-4">
          {!currentBatch || currentBatch.drafts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Chưa có câu hỏi nào trong phiên làm việc hiện tại
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Hãy chọn chủ đề, Yêu cầu cần đạt hoặc tải tài liệu nguồn ở cột bên trái, sau đó nhấn{' '}
                <strong>“Tạo câu hỏi bằng AI”</strong> để bắt đầu biên soạn.
              </p>
            </div>
          ) : (
            <>
              {/* Thanh điều khiển Đợt tạo câu hỏi hiện tại */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {currentBatch.batchCode}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {currentBatch.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Đã xác minh:{' '}
                    <strong>
                      {currentBatch.drafts.filter((d) => d.teacherVerified).length}/
                      {currentBatch.drafts.length}
                    </strong>{' '}
                    · Đã lưu Ngân hàng:{' '}
                    <strong>
                      {
                        currentBatch.drafts.filter((d) => Boolean(d.savedQuestionId))
                          .length
                      }
                      /{currentBatch.drafts.length}
                    </strong>{' '}
                    · Cập nhật: {currentBatch.updatedAt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveAllBatchToBank(ApprovalStatus.DRAFT)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu cả đợt (Nháp)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveAllBatchToBank(ApprovalStatus.PENDING)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Lưu & Gửi duyệt cả đợt
                  </button>
                </div>
              </div>

              {/* Tóm tắt gọn Độ bao phủ Yêu cầu cần đạt dành cho Giáo viên */}
              {currentBatch.coverageReport && (
                <div className="bg-white rounded-xl border border-indigo-200 p-3.5 shadow-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs font-bold text-indigo-950">
                        Tổng hợp phân bổ câu hỏi theo Yêu cầu cần đạt
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        currentBatch.coverageReport.hasComprehensiveCoverage
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      Độ bao phủ YCCĐ: {currentBatch.coverageReport.coveragePercentage}% (
                      {currentBatch.coverageReport.coveredOutcomesCount}/
                      {currentBatch.coverageReport.totalTargetOutcomes} nội dung)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    {currentBatch.coverageReport.distributionSummary}
                  </p>

                  {currentBatch.coverageReport.coverageWarning &&
                    currentBatch.coverageReport.uncoveredOutcomes.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            Yêu cầu cần đạt chưa có câu hỏi trong đợt này (do số lượng câu hỏi giới hạn):
                          </span>
                        </div>
                        <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                          {currentBatch.coverageReport.uncoveredOutcomes.map((uo) => (
                            <li key={uo.code}>
                              <span className="font-mono font-bold">[{uo.code}]</span>:{' '}
                              {uo.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* Danh sách từng thẻ câu hỏi */}
              <div className="space-y-4">
                {currentBatch.drafts.map((draft, idx) => {
                  const isEditing = editingDraftId === draft.draftId;
                  const isRefining = refiningDraftId === draft.draftId;

                  return (
                    <div
                      key={draft.draftId}
                      className={`bg-white rounded-xl border transition shadow-xs overflow-hidden ${
                        draft.savedQuestionId
                          ? 'border-emerald-300'
                          : draft.teacherVerified
                          ? 'border-blue-300'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Header thẻ câu hỏi */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
                            Câu #{idx + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {draft.learningOutcomeCode}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {getFormatLabel(draft.format)}
                          </span>
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {getCognitiveLevelLabel(draft.cognitiveLevel)}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {draft.suggestedPoints} điểm
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Trạng thái giáo viên xác minh */}
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleTeacherVerified(draft.draftId)
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
                              draft.teacherVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {draft.teacherVerified ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Đã xác minh
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                Xác minh câu hỏi
                              </>
                            )}
                          </button>

                          {draft.savedQuestionId && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white">
                              <Check className="w-3.5 h-3.5" />
                              {draft.savedStatus === ApprovalStatus.PENDING
                                ? 'Đã gửi duyệt'
                                : 'Đã lưu Ngân hàng'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cảnh báo nếu phát hiện lộ đáp án trong câu dẫn */}
                      {draft.autoCheck.answerLeakDetected && (
                        <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs text-rose-900 font-medium">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            Phát hiện dấu hiệu lộ đáp án trong câu dẫn. Vui lòng bấm &ldquo;Giáo viên sửa nội dung&rdquo; để kiểm tra trước khi lưu.
                          </span>
                        </div>
                      )}

                      {/* Nội dung câu hỏi hoặc Form Sửa trực tiếp */}
                      <div className="p-4 space-y-4">
                        {isEditing && editDraftBuffer ? (
                          <div className="space-y-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-900 uppercase">
                                Chỉnh sửa trực tiếp bản nháp câu hỏi
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDraftId(null);
                                    setEditDraftBuffer(null);
                                  }}
                                  className="px-2.5 py-1 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveManualEdit}
                                  className="px-3 py-1 rounded text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Lưu & Kiểm tra lại
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Nội dung câu dẫn (hỗ trợ công thức LaTeX $...$)
                              </label>
                              <textarea
                                rows={3}
                                value={editDraftBuffer.stem}
                                onChange={(e) =>
                                  setEditDraftBuffer({
                                    ...editDraftBuffer,
                                    stem: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900"
                              />
                            </div>

                            {editDraftBuffer.options && (
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <label className="block text-xs font-semibold text-slate-700">
                                    Các phương án lựa chọn (Chọn đáp án đúng, sửa hoặc thêm / bớt phương án)
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    {editDraftBuffer.options.length < 4 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextOpts = [...(editDraftBuffer.options || [])];
                                          while (nextOpts.length < 4) {
                                            const letter = String.fromCharCode(65 + nextOpts.length);
                                            nextOpts.push(`${letter}. Phương án ${letter}`);
                                          }
                                          setEditDraftBuffer({
                                            ...editDraftBuffer,
                                            options: nextOpts,
                                          });
                                        }}
                                        className="px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 cursor-pointer"
                                      >
                                        + Đủ 4 phương án (A–D)
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curOpts = editDraftBuffer.options || [];
                                        const letter = String.fromCharCode(65 + curOpts.length);
                                        setEditDraftBuffer({
                                          ...editDraftBuffer,
                                          options: [...curOpts, `${letter}. Phương án ${letter}`],
                                        });
                                      }}
                                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold hover:bg-blue-100 cursor-pointer"
                                    >
                                      + Thêm phương án ({String.fromCharCode(65 + editDraftBuffer.options.length)})
                                    </button>
                                  </div>
                                </div>
                                {editDraftBuffer.options.map((opt, oIdx) => {
                                  const isChecked = (
                                    editDraftBuffer.correctOptionIndices || []
                                  ).includes(oIdx);
                                  return (
                                    <div key={oIdx} className="flex items-center gap-2">
                                      <input
                                        type={
                                          editDraftBuffer.format === QuestionFormatCode.MCQ_MULTIPLE
                                            ? 'checkbox'
                                            : 'radio'
                                        }
                                        name={`ai-draft-opt-${editDraftBuffer.draftId}`}
                                        checked={isChecked}
                                        onChange={() => {
                                          const curIndices =
                                            editDraftBuffer.correctOptionIndices || [];
                                          const isMulti =
                                            editDraftBuffer.format ===
                                            QuestionFormatCode.MCQ_MULTIPLE;
                                          const nextIndices = isMulti
                                            ? curIndices.includes(oIdx)
                                              ? curIndices.filter((i) => i !== oIdx)
                                              : [...curIndices, oIdx].sort()
                                            : [oIdx];
                                          const curOpts = editDraftBuffer.options || [];
                                          const nextAns = isMulti
                                            ? nextIndices
                                                .map((i) => curOpts[i] || '')
                                                .filter(Boolean)
                                                .join('; ')
                                            : curOpts[oIdx] || '';
                                          setEditDraftBuffer({
                                            ...editDraftBuffer,
                                            correctOptionIndices: nextIndices,
                                            correctAnswer: nextAns,
                                          });
                                        }}
                                        className="cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const nextOpts = [
                                            ...(editDraftBuffer.options || []),
                                          ];
                                          nextOpts[oIdx] = val;
                                          const curIndices =
                                            editDraftBuffer.correctOptionIndices || [];
                                          const nextAns = curIndices.includes(oIdx)
                                            ? val
                                            : editDraftBuffer.correctAnswer;
                                          setEditDraftBuffer({
                                            ...editDraftBuffer,
                                            options: nextOpts,
                                            correctAnswer: nextAns,
                                          });
                                        }}
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                                      />
                                      {(editDraftBuffer.options || []).length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const curOpts = editDraftBuffer.options || [];
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
                                            const curIndices =
                                              editDraftBuffer.correctOptionIndices || [];
                                            const nextIndices = curIndices
                                              .filter((i) => i !== oIdx)
                                              .map((i) => (i > oIdx ? i - 1 : i));
                                            setEditDraftBuffer({
                                              ...editDraftBuffer,
                                              options: filtered,
                                              correctOptionIndices: nextIndices,
                                              correctAnswer:
                                                nextIndices.length > 0
                                                  ? filtered[nextIndices[0]] || ''
                                                  : editDraftBuffer.correctAnswer,
                                            });
                                          }}
                                          title="Xóa (bớt) phương án này"
                                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {editDraftBuffer.subStatements &&
                              editDraftBuffer.subStatements.length > 0 && (
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-semibold text-slate-700">
                                    Các mệnh đề Đúng – Sai (a, b, c, d) kèm mức độ nhận thức từng ý
                                  </label>
                                  {editDraftBuffer.subStatements.map((sub, sIdx) => (
                                    <div key={sIdx} className="flex flex-wrap items-center gap-2 text-xs">
                                      <span className="font-mono font-bold text-blue-900 w-5">
                                        {sub.label})
                                      </span>
                                      <input
                                        type="text"
                                        value={sub.statement}
                                        onChange={(e) => {
                                          const nextSubs = (
                                            editDraftBuffer.subStatements || []
                                          ).map((st, i) =>
                                            i === sIdx ? { ...st, statement: e.target.value } : st
                                          );
                                          setEditDraftBuffer({
                                            ...editDraftBuffer,
                                            subStatements: nextSubs,
                                          });
                                        }}
                                        className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                                      />
                                      <select
                                        value={String(sub.cognitiveLevel || 'BIẾT').toUpperCase()}
                                        onChange={(e) => {
                                          const nextSubs = (
                                            editDraftBuffer.subStatements || []
                                          ).map((st, i) =>
                                            i === sIdx
                                              ? { ...st, cognitiveLevel: e.target.value }
                                              : st
                                          );
                                          setEditDraftBuffer({
                                            ...editDraftBuffer,
                                            subStatements: nextSubs,
                                          });
                                        }}
                                        className="rounded-lg border border-violet-300 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-800"
                                      >
                                        <option value="BIẾT">MỨC ĐỘ: BIẾT</option>
                                        <option value="HIỂU">MỨC ĐỘ: HIỂU</option>
                                        <option value="VẬN DỤNG">MỨC ĐỘ: VẬN DỤNG</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextSubs = (
                                            editDraftBuffer.subStatements || []
                                          ).map((st, i) =>
                                            i === sIdx ? { ...st, isTrue: true } : st
                                          );
                                          const nextAns = nextSubs
                                            .map((s) => `${s.label}) ${s.isTrue ? 'Đúng' : 'Sai'}`)
                                            .join('; ');
                                          setEditDraftBuffer({
                                            ...editDraftBuffer,
                                            subStatements: nextSubs,
                                            correctAnswer: nextAns,
                                          });
                                        }}
                                        className={`px-2.5 py-1 rounded font-bold border cursor-pointer ${
                                          sub.isTrue
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-slate-600 border-slate-300'
                                        }`}
                                      >
                                        Đúng
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextSubs = (
                                            editDraftBuffer.subStatements || []
                                          ).map((st, i) =>
                                            i === sIdx ? { ...st, isTrue: false } : st
                                          );
                                          const nextAns = nextSubs
                                            .map((s) => `${s.label}) ${s.isTrue ? 'Đúng' : 'Sai'}`)
                                            .join('; ');
                                          setEditDraftBuffer({
                                            ...editDraftBuffer,
                                            subStatements: nextSubs,
                                            correctAnswer: nextAns,
                                          });
                                        }}
                                        className={`px-2.5 py-1 rounded font-bold border cursor-pointer ${
                                          !sub.isTrue
                                            ? 'bg-rose-600 text-white border-rose-600'
                                            : 'bg-white text-slate-600 border-slate-300'
                                        }`}
                                      >
                                        Sai
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Đáp án đúng
                                </label>
                                <input
                                  type="text"
                                  value={editDraftBuffer.correctAnswer}
                                  onChange={(e) =>
                                    setEditDraftBuffer({
                                      ...editDraftBuffer,
                                      correctAnswer: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Điểm đề xuất
                                </label>
                                <input
                                  type="number"
                                  step="0.25"
                                  value={editDraftBuffer.suggestedPoints}
                                  onChange={(e) =>
                                    setEditDraftBuffer({
                                      ...editDraftBuffer,
                                      suggestedPoints:
                                        Number(e.target.value) || 0.25,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Giải thích đáp án & Hướng dẫn chấm
                              </label>
                              <textarea
                                rows={2}
                                value={editDraftBuffer.explanation}
                                onChange={(e) =>
                                  setEditDraftBuffer({
                                    ...editDraftBuffer,
                                    explanation: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Ngữ liệu đọc hiểu chung nếu có */}
                            {draft.sharedPassage && (
                              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                                <div className="font-bold text-slate-700">
                                  Ngữ liệu đọc hiểu / Tình huống nguồn:
                                </div>
                                <p className="italic leading-relaxed whitespace-pre-line">
                                  “{draft.sharedPassage}”
                                </p>
                                {draft.sharedPassageCitation && (
                                  <div className="text-right text-[11px] font-semibold text-slate-500">
                                    — Nguồn: {draft.sharedPassageCitation}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Nội dung câu hỏi dành cho học sinh (Đã loại bỏ hoàn toàn chủ đề/tên bài thừa) */}
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                                  Nội dung chính của câu hỏi (Dành cho học sinh)
                                </span>
                                <div className="flex items-center gap-2">
                                  {draft.format !== QuestionFormatCode.TRUE_FALSE_CLUSTER && (
                                    <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200 text-[10px] font-bold uppercase tracking-wide">
                                      MỨC ĐỘ:{' '}
                                      {String(draft.cognitiveLevel).includes('VAN_DUNG') ||
                                      String(draft.cognitiveLevel).includes('MUC_3')
                                        ? 'VẬN DỤNG'
                                        : String(draft.cognitiveLevel).includes('HIEU') ||
                                          String(draft.cognitiveLevel).includes('MUC_2')
                                        ? 'HIỂU'
                                        : 'BIẾT'}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-emerald-700 font-medium">
                                    Chuẩn câu hỏi trực tiếp – ngắn gọn
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm font-medium text-slate-900 leading-relaxed">
                                <MathFormulaView text={cleanStudentQuestionStem(draft.stem)} />
                              </div>
                            </div>

                            {/* Phương án lựa chọn nếu là Trắc nghiệm */}
                            {draft.options && draft.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {draft.options.map((opt, oIdx) => {
                                  const cleanedOpt = cleanStudentOptionOrStatement(opt);
                                  const isCorrect =
                                    draft.correctOptionIndices?.includes(oIdx) ||
                                    draft.correctAnswer
                                      .trim()
                                      .startsWith(cleanedOpt.slice(0, 2));
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                                        isCorrect
                                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                                          : 'bg-slate-50/70 border-slate-200 text-slate-800'
                                      }`}
                                    >
                                      <MathFormulaView text={cleanedOpt} />
                                      {isCorrect && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shrink-0">
                                          Đáp án đúng
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Bảng các ý nhỏ Đúng - Sai kèm mức độ & giải thích riêng từng ý */}
                            {draft.subStatements &&
                              draft.subStatements.length > 0 && (
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                  <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 flex items-center justify-between">
                                    <span>
                                      Các nhận định Đúng – Sai ({draft.subStatements.length} ý nhỏ · Phân hóa mức độ từng ý)
                                    </span>
                                    <span>
                                      Quy tắc điểm:{' '}
                                      {draft.trueFalseScoringRule ===
                                      'EQUAL_PER_ITEM'
                                        ? 'Chia đều mỗi ý'
                                        : draft.trueFalseScoringRule ===
                                          'PROGRESSIVE_CV7991'
                                        ? 'Lũy tiến CV 7991'
                                        : 'Tùy chỉnh'}
                                    </span>
                                  </div>
                                  <div className="divide-y divide-slate-200">
                                    {draft.subStatements.map((sub, sIdx) => {
                                      const rawSubLvl = String(
                                        sub.cognitiveLevel ||
                                          (['BIẾT', 'BIẾT', 'HIỂU', 'VẬN DỤNG'][sIdx % 4])
                                      ).toUpperCase();
                                      const displaySubLvl = rawSubLvl.includes('VẬN DỤNG') || rawSubLvl.includes('VAN_DUNG')
                                        ? 'VẬN DỤNG'
                                        : rawSubLvl.includes('HIỂU') || rawSubLvl.includes('HIEU')
                                        ? 'HIỂU'
                                        : 'BIẾT';
                                      return (
                                        <div
                                          key={sIdx}
                                          className="p-2.5 text-xs space-y-1.5 bg-white"
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="font-medium text-slate-900">
                                              <span className="font-bold mr-1">
                                                {sub.label})
                                              </span>
                                              <MathFormulaView
                                                text={cleanStudentOptionOrStatement(sub.statement)}
                                              />
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200 text-[10px] font-bold uppercase">
                                                MỨC ĐỘ: {displaySubLvl}
                                              </span>
                                              <span
                                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                  sub.isTrue
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                                }`}
                                              >
                                                {sub.isTrue ? 'Đúng' : 'Sai'}
                                              </span>
                                            </div>
                                          </div>
                                          {sub.explanation && (
                                            <div className="text-[11px] text-slate-600 pl-4 border-l-2 border-slate-300">
                                              <em>Giải thích ý {sub.label}:</em>{' '}
                                              <MathFormulaView
                                                text={sub.explanation}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            {/* Biến thể đáp án được chấp nhận cho câu Trả lời ngắn */}
                            {draft.acceptedVariations &&
                              draft.acceptedVariations.length > 0 && (
                                <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 text-xs">
                                  <span className="font-bold text-indigo-900 mr-2">
                                    Các cách trả lời tương đương được chấp nhận:
                                  </span>
                                  <div className="inline-flex flex-wrap gap-1.5 mt-1">
                                    {draft.acceptedVariations.map((v, vIdx) => (
                                      <span
                                        key={vIdx}
                                        className="px-2 py-0.5 rounded bg-white border border-indigo-200 font-mono text-[11px] text-indigo-900"
                                      >
                                        {v}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Biểu điểm chia theo tiêu chí (Barem) cho câu Tự luận */}
                            {draft.rubricCriteria &&
                              draft.rubricCriteria.length > 0 && (
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                  <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 flex items-center justify-between gap-2">
                                    <span>
                                      Tiêu chí chấm tự luận — Barem chia nhỏ từng bước (Chấp nhận cách giải hợp lệ khác)
                                    </span>
                                    <span className="font-mono text-blue-700">
                                      Tổng: {draft.suggestedPoints} điểm
                                    </span>
                                  </div>
                                  <div className="divide-y divide-slate-200">
                                    {draft.rubricCriteria.map((rc) => (
                                      <div
                                        key={rc.id}
                                        className="p-2.5 text-xs flex items-start justify-between gap-3 bg-white"
                                      >
                                        <div className="space-y-0.5">
                                          <div className="font-medium text-slate-900">
                                            • {rc.criterion}
                                          </div>
                                          {rc.note && (
                                            <div className="text-[11px] text-slate-500 italic">
                                              Lưu ý chấm: {rc.note}
                                            </div>
                                          )}
                                        </div>
                                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                                          {rc.points} điểm
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Đáp án, Giải thích chi tiết 100% & Truy xuất nguồn gốc ngay bên dưới */}
                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
                              <div>
                                <span className="font-bold text-slate-800">
                                  Đáp án chính xác:{' '}
                                </span>
                                <span className="font-semibold text-emerald-700">
                                  <MathFormulaView
                                    text={cleanStudentOptionOrStatement(draft.correctAnswer)}
                                  />
                                </span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-800">
                                  Giải thích chi tiết 100% (Tại sao đáp án đúng & tại sao phương án nhiễu sai):{' '}
                                </span>
                                <span className="text-slate-700 leading-relaxed">
                                  <MathFormulaView text={draft.explanation} />
                                </span>
                              </div>

                              {/* Truy xuất nguồn gốc trực tiếp ngay dưới Đáp án (Nguyên tắc 4.2) */}
                              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2 rounded bg-white border border-blue-200/80">
                                  <span className="font-bold text-blue-900 block mb-0.5">
                                    Đáp ứng Yêu cầu cần đạt (GDPT 2018):
                                  </span>
                                  <span className="font-mono font-bold text-blue-700 mr-1">
                                    [{draft.learningOutcomeCode}]
                                  </span>
                                  <span className="text-slate-700">
                                    {draft.learningOutcomeText}
                                  </span>
                                </div>
                                <div className="p-2 rounded bg-white border border-amber-200/80">
                                  <span className="font-bold text-amber-900 block mb-0.5">
                                    Truy xuất nguồn gốc (Bài học & Mục trong sách):
                                  </span>
                                  <span className="text-slate-700">
                                    {draft.lessonTitle ? `${draft.lessonTitle}` : draft.topicTitle}
                                    {draft.knowledgeUnit &&
                                    draft.knowledgeUnit !== draft.lessonTitle
                                      ? ` · Mục: ${draft.knowledgeUnit}`
                                      : ''}
                                    {draft.usedSourceSummary
                                      ? ` (${draft.usedSourceSummary})`
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Hộp Thông tin chuyên môn & Yêu cầu cần đạt (Dành cho Giáo viên) */}
                            <details className="group rounded-lg bg-amber-50/40 border border-amber-200/80 text-xs overflow-hidden">
                              <summary className="px-3 py-2 cursor-pointer select-none flex items-center justify-between gap-2 font-semibold text-amber-900 hover:bg-amber-50/80 transition">
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>
                                    Thông tin Chương trình & Yêu cầu cần đạt (Dành cho Giáo viên)
                                  </span>
                                </span>
                                <span className="text-[11px] font-mono text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0">
                                  Xem chi tiết
                                </span>
                              </summary>
                              <div className="px-3 py-2.5 border-t border-amber-200/60 bg-white/80 space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                                <div>
                                  <span className="font-bold text-slate-800">
                                    Mã & Nội dung cần đạt (YCCĐ):{' '}
                                  </span>
                                  <span className="font-mono font-semibold text-blue-700">
                                    [{draft.learningOutcomeCode}]
                                  </span>{' '}
                                  <span>{draft.learningOutcomeText}</span>
                                </div>
                                {draft.topicTitle && (
                                  <div>
                                    <span className="font-bold text-slate-800">
                                      Mạch chủ đề / Bài học:{' '}
                                    </span>
                                    <span>
                                      {draft.topicTitle}
                                      {draft.lessonTitle ? ` — ${draft.lessonTitle}` : ''}
                                    </span>
                                  </div>
                                )}
                                <div className="text-slate-500">
                                  <span className="font-bold text-slate-700">
                                    Nguồn tham chiếu:{' '}
                                  </span>
                                  <span>{draft.usedSourceSummary}</span>
                                </div>
                              </div>
                            </details>
                          </>
                        )}

                        {/* Thanh công cụ Tinh chỉnh AI + Lưu & Gửi duyệt */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 mr-1">
                              Tinh chỉnh AI:
                            </span>
                            <button
                              type="button"
                              disabled={isRefining}
                              onClick={() =>
                                handleRefineSingleDraft(draft, 'REGENERATE')
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <RefreshCw
                                className={`w-3 h-3 ${
                                  isRefining ? 'animate-spin' : ''
                                }`}
                              />
                              Tạo lại câu này
                            </button>

                            <button
                              type="button"
                              disabled={isRefining}
                              onClick={() =>
                                handleRefineSingleDraft(draft, 'SIMILAR')
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              + Tạo câu tương tự
                            </button>

                            <button
                              type="button"
                              disabled={isRefining}
                              onClick={() =>
                                handleRefineSingleDraft(
                                  draft,
                                  'INCREASE_DIFFICULTY'
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3 text-rose-600" />
                              Tăng độ khó
                            </button>

                            <button
                              type="button"
                              disabled={isRefining}
                              onClick={() =>
                                handleRefineSingleDraft(
                                  draft,
                                  'DECREASE_DIFFICULTY'
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3 text-emerald-600" />
                              Giảm độ khó
                            </button>

                            <button
                              type="button"
                              disabled={isRefining}
                              onClick={() =>
                                handleRefineSingleDraft(draft, 'CHANGE_CONTEXT')
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <Wand2 className="w-3 h-3 text-blue-600" />
                              Đổi bối cảnh
                            </button>

                            <button
                              type="button"
                              disabled={isRefining}
                              onClick={() =>
                                handleRefineSingleDraft(
                                  draft,
                                  'CLARIFY_WORDING'
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              Viết rõ ràng hơn
                            </button>
                          </div>

                          {/* Hàng nút Giáo viên Sửa / Lưu Ngân hàng / Gửi duyệt */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditDraft(draft)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Giáo viên sửa nội dung
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveDraftFromBatch(draft.draftId)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Bỏ câu này
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveSingleDraftToBank(
                                    draft,
                                    ApprovalStatus.DRAFT
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Lưu vào Ngân hàng (Nháp)
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveSingleDraftToBank(
                                    draft,
                                    ApprovalStatus.PENDING
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Lưu & Gửi duyệt
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal quản lý Lịch sử các đợt tạo câu hỏi AI đã lưu */}
      {showBatchHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Các đợt bản nháp AI đã lưu ({savedBatches.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Khôi phục lại bất kỳ đợt tạo câu hỏi nào để tiếp tục chỉnh sửa hoặc gửi duyệt
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchHistoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {savedBatches.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Chưa có đợt tạo câu hỏi AI nào được lưu.
                </div>
              ) : (
                savedBatches.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      currentBatch?.id === b.id
                        ? 'bg-blue-50/60 border-blue-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {b.batchCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {b.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Nguồn: {b.sourceMode} · Tổng: {b.drafts.length} câu · Đã
                        lưu Ngân hàng:{' '}
                        {b.drafts.filter((d) => Boolean(d.savedQuestionId)).length}{' '}
                        câu · Cập nhật: {b.updatedAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentBatch(b);
                          setShowBatchHistoryModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Mở đợt này
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dataRepository.deleteAIGenerationBatch(b.id);
                          const remaining =
                            dataRepository.getAIGenerationBatches();
                          setSavedBatches(remaining);
                          if (currentBatch?.id === b.id) {
                            setCurrentBatch(remaining[0] || null);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
