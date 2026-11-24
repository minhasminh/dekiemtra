import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  CheckSquare,
  Copy,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  FileWarning,
  Image as ImageIcon,
  Layers,
  Link2,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
  QuestionFormatCode,
  QuestionGroup,
  QuestionItem,
} from '../types/domain';
import {
  ASSESSMENT_RULES_BY_LEVEL,
  getAllowedFormatsForContext,
  getCognitiveShortLabel,
  getFormatLabel,
  getLevelForGrade,
  getRuleSetForLevel,
} from '../services/business/assessmentRules';
import { cleanLearningOutcomeText } from '../services/business/examGenerationEngine';
import {
  analyzeDocumentWithSmartAI,
  buildAiSuggestedAnswerForQuestion,
  createSamplePdfExamFile,
  createSampleScannedImagePdfExamFile,
  createTestScenarioFile,
  ExtractedDocumentPage,
  extractStructuredQuestionsFromPages,
  formatSubStatementsAnswerSummary,
  normalizeInlineMathFormulas,
  parseDocxFileToPages,
  parseImageFileToPages,
  parsePdfFileToPages,
  parseXlsxFileToPages,
  runDuplicateCheckOnDrafts,
  runSmartImportVerificationSuite,
  saveImportedQuestionsAsDraftsToBank,
  SmartExtractedQuestionDraft,
  SmartImportFileRecord,
  SmartImportScenarioTestReport,
  SmartImportSourceType,
  SmartImportTestScenarioId,
  syncSubStatementsFromAnswerText,
} from '../services/import/smartExamImportService';
import { MathFormulaView } from './MathFormulaView';
import { SEED_CURRICULUM_TOPICS } from '../data/seedData';
import {
  cleanSingleTopicOrChapterTitle,
  formatTopicOptionDisplay,
  getSelectableLessonsForMatrix,
  groupLessonsByChapter,
} from '../data/matrixLessonCatalog';

export interface SmartExamImportWorkspaceProps {
  topics: CurriculumTopic[];
  existingQuestions: QuestionItem[];
  globalLevelFilter: EducationLevelId | 'ALL';
  onBulkAddQuestions: (
    items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]
  ) => QuestionItem[];
  onAddGroup: (group: Omit<QuestionGroup, 'id' | 'code' | 'createdAt'>) => QuestionGroup;
  onAssignToGroup: (groupId: string, questionIds: string[]) => QuestionGroup | null;
  onNavigateToBank?: () => void;
  onNotify: (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => void;
}

const PIPELINE_STEPS = [
  { step: 1, title: 'Bước 1: Tải tài liệu lên', desc: 'Word, PDF, Excel, Ảnh, Văn bản' },
  { step: 2, title: 'Bước 2: Trích xuất nội dung', desc: 'Văn bản, Ảnh, Bảng, Công thức, Ngữ liệu' },
  { step: 3, title: 'Bước 3: AI phân tích cấu trúc', desc: 'Nhận diện & đề xuất tách câu hỏi' },
  { step: 4, title: 'Bước 4: Đối chiếu 2 cột', desc: 'Trái: Tài liệu gốc · Phải: Câu hỏi' },
  { step: 5, title: 'Bước 5: Đối chiếu & xác nhận', desc: 'Sửa nội dung, xác nhận đáp án & mức độ' },
  { step: 6, title: 'Bước 6: Liên kết chương trình', desc: 'Gắn Chủ đề, Bài học & Mã YCCĐ' },
  { step: 7, title: 'Bước 7: Kiểm tra trùng lặp', desc: 'So khớp với Ngân hàng câu hỏi' },
  { step: 8, title: 'Bước 8: Lưu bản nháp', desc: 'Lưu trạng thái DRAFT & kiểm chứng' },
];

const DEFAULT_DIRECT_TEXT_SAMPLE = `ĐỀ KIỂM TRA ĐỊNH KÌ MÔN TOÁN & ĐỌC HIỂU (VĂN BẢN TRỰC TIẾP)
Đọc đoạn trích sau và trả lời các câu hỏi từ Câu 1 đến Câu 2:
Biển Việt Nam trải dài từ Bắc vào Nam với hàng nghìn hòn đảo lớn nhỏ. Quần đảo Hoàng Sa và quần đảo Trường Sa là bộ phận lãnh thổ thiêng liêng không thể tách rời của Tổ quốc Việt Nam.
(Theo SGK Lịch sử và Địa lí 8 - Chương trình GDPT 2018)

Câu 1: (0.5 điểm) Hai quần đảo lớn xa bờ thuộc chủ quyền thiêng liêng của Việt Nam được nhắc tới trong đoạn ngữ liệu trên là gì?
A. Cô Tô và Cát Bà
B. Hoàng Sa và Trường Sa
C. Phú Quốc và Côn Đảo
D. Lý Sơn và Bình Ba
Đáp án: B

Câu 2: (0.5 điểm) Em hãy nêu ý nghĩa của việc bảo vệ chủ quyền biển đảo đối với sự phát triển kinh tế và an ninh quốc phòng của đất nước.

Câu 3: (0.5 điểm) Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng hai nghiệm $x_1 + x_2$ theo định lí Viète bằng bao nhiêu?
A. $5$
B. $-5$
C. $6$
D. $-6$`;

const relabelMcqOptions = (opts: string[]): string[] =>
  opts.map((opt, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const body = opt.replace(/^[A-Za-z][.):]\s*/, '').trim();
    return body ? `${letter}. ${body}` : `${letter}. Phương án ${letter}`;
  });

const padMcqOptionsToFour = (opts: string[]): string[] => {
  const relabeled = relabelMcqOptions(opts);
  const next = [...relabeled];
  while (next.length < 4) {
    const letter = String.fromCharCode(65 + next.length);
    next.push(`${letter}. Phương án ${letter}`);
  }
  return next;
};

const syncMcqIndicesFromAnswerText = (
  options: string[],
  rawVal: string,
  isMultiple: boolean
): number[] | null => {
  const trimmed = rawVal.trim();
  if (!trimmed || options.length === 0) return null;

  if (isMultiple) {
    const letters = Array.from(trimmed.matchAll(/\b([A-Z])\b/gi)).map((m) =>
      m[1].toUpperCase()
    );
    const indices = letters
      .map((l) => l.charCodeAt(0) - 65)
      .filter((idx) => idx >= 0 && idx < options.length);
    if (indices.length > 0) {
      return Array.from(new Set(indices)).sort((a, b) => a - b);
    }
  } else {
    const singleLetterMatch = trimmed.match(/^(?:Chọn\s+|Đáp\s+án\s+)?([A-Z])(?:[.):]\s*|\b)/i);
    if (singleLetterMatch) {
      const idx = singleLetterMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < options.length) {
        return [idx];
      }
    }
    const exactIdx = options.findIndex(
      (o) =>
        o.trim().toLowerCase() === trimmed.toLowerCase() ||
        o.replace(/^[A-Za-z][.):]\s*/, '').trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exactIdx >= 0) {
      return [exactIdx];
    }
  }
  return null;
};

export const SmartExamImportWorkspace: React.FC<SmartExamImportWorkspaceProps> = ({
  topics,
  existingQuestions,
  globalLevelFilter,
  onBulkAddQuestions,
  onAddGroup,
  onAssignToGroup,
  onNavigateToBank,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Danh sách tệp đã tải lên và tệp đang chọn xem
  const [uploadedFiles, setUploadedFiles] = useState<SmartImportFileRecord[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Chế độ nhập văn bản sao chép trực tiếp
  const [showDirectTextModal, setShowDirectTextModal] = useState(false);
  const [directTextTitle, setDirectTextTitle] = useState('De_Sao_Chep_Truc_Tiep.txt');
  const [directTextInput, setDirectTextInput] = useState(DEFAULT_DIRECT_TEXT_SAMPLE);

  const allowedImportLevels = useMemo<EducationLevelId[]>(() => {
    if (topics.length > 0) {
      const s = new Set(topics.map((t) => t.levelId));
      const lvls: EducationLevelId[] = [];
      if (s.has(EducationLevelId.PRIMARY)) lvls.push(EducationLevelId.PRIMARY);
      if (s.has(EducationLevelId.LOWER_SECONDARY)) lvls.push(EducationLevelId.LOWER_SECONDARY);
      if (lvls.length > 0) return lvls;
    }
    return [EducationLevelId.PRIMARY, EducationLevelId.LOWER_SECONDARY];
  }, [topics]);

  // Cấu hình liên kết chương trình giáo dục (Bước 6)
  const initialLevel =
    globalLevelFilter !== 'ALL' && allowedImportLevels.includes(globalLevelFilter)
      ? globalLevelFilter
      : allowedImportLevels[0] || EducationLevelId.LOWER_SECONDARY;
  const [selectedLevelId, setSelectedLevelId] = useState<EducationLevelId>(initialLevel);
  const [selectedGrade, setSelectedGrade] = useState<GradeNumber>(
    initialLevel === EducationLevelId.PRIMARY ? 4 : 8
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('Toán');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedLessonName, setSelectedLessonName] = useState<string>('');
  const [selectedOutcomeCode, setSelectedOutcomeCode] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('Giáo viên Bộ môn');
  const [autoSuggestAiAnswerWhenMissing, setAutoSuggestAiAnswerWhenMissing] =
    useState<boolean>(false);

  useEffect(() => {
    if (!allowedImportLevels.includes(selectedLevelId)) {
      const nextLv = allowedImportLevels[0];
      setSelectedLevelId(nextLv);
      const r = getRuleSetForLevel(nextLv);
      setSelectedGrade(r.grades[0]);
      setSelectedSubject(r.subjects[0]);
    }
  }, [allowedImportLevels, selectedLevelId]);

  // Bộ lọc & Trạng thái hiển thị ở khung đối chiếu 2 cột (Bước 4 & 5)
  const [activeLeftPageFilter, setActiveLeftPageFilter] = useState<number | 'ALL'>('ALL');
  const [leftViewTab, setLeftViewTab] = useState<'FULL_PAGE' | 'PASSAGES' | 'MEDIA_TABLES'>(
    'FULL_PAGE'
  );
  const [rightQuestionFilter, setRightQuestionFilter] = useState<
    | 'ALL'
    | 'NEEDS_ATTENTION'
    | 'MISSING_OR_AI_ANSWER'
    | 'UNCONFIRMED_COGNITIVE'
    | 'HAS_MEDIA_OR_PASSAGE'
    | 'DUPLICATE'
  >('ALL');
  const [focusedDraftId, setFocusedDraftId] = useState<string | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState<number | null>(null);

  // Kết quả lưu bản nháp gần nhất & Kết quả chạy Kiểm thử 6 kịch bản (Phần V)
  const [lastSavedBatchInfo, setLastSavedBatchInfo] = useState<{
    savedAt: string;
    fileName: string;
    savedCount: number;
    savedCodes: string[];
    createdGroupCodes: string[];
  } | null>(null);
  const [isRunningTestSuite, setIsRunningTestSuite] = useState(false);
  const [testSuiteReports, setTestSuiteReports] = useState<SmartImportScenarioTestReport[]>([]);

  const currentRuleSet = useMemo(
    () => getRuleSetForLevel(selectedLevelId),
    [selectedLevelId]
  );

  const mergedCatalogTopics = useMemo<CurriculumTopic[]>(() => {
    const map = new Map<string, CurriculumTopic>();
    for (const t of topics) map.set(t.id, t);
    for (const t of SEED_CURRICULUM_TOPICS) map.set(t.id, t);
    return Array.from(map.values());
  }, [topics]);

  const matchingTopics = useMemo<CurriculumTopic[]>(() => {
    const lessons = getSelectableLessonsForMatrix(
      selectedLevelId,
      selectedGrade,
      selectedSubject,
      mergedCatalogTopics
    );
    const groups = groupLessonsByChapter(lessons);
    if (groups.length > 0) {
      return groups.map((cg, idx) => {
        const code = (cg.chapterCode || `CĐ-${idx + 1}`).trim();
        const title = cleanSingleTopicOrChapterTitle(cg.chapterTitle || '');
        const rawDisplayTitle =
          code &&
          title &&
          !title.toLowerCase().startsWith(code.toLowerCase()) &&
          /^(?:chương|chủ\s*đề|mạch|phần|mô\s*đun|unit|theme)(?:\s|[.:\-–(]|$)/i.test(code)
            ? `${code}: ${title}`
            : title || code;
        const displayTitle = cleanSingleTopicOrChapterTitle(rawDisplayTitle);
        return {
          id: `chap-grp-${selectedGrade}-${idx}-${cg.chapterKey}`,
          levelId: selectedLevelId,
          grade: selectedGrade,
          subject: selectedSubject,
          chapterCode: code,
          chapterTitle: displayTitle,
          topicTitle: displayTitle,
          semester: cg.semester,
          lessons: cg.lessons.map((ls) => ({
            id: ls.id,
            week: cg.semester,
            lessonName: ls.lessonName,
            periodAllocation: `${ls.periodsCount} tiết`,
            periodsCount: ls.periodsCount,
            adjustedContent: ls.learningOutcomeText,
          })),
          learningOutcomes: cg.lessons.map((ls) => ({
            code: ls.learningOutcomeCode,
            lessonName: ls.lessonName,
            description: ls.learningOutcomeText,
            suggestedCognitiveLevel: currentRuleSet.cognitiveLevels[0].code,
          })),
          isSampleData: false,
        };
      });
    }
    return mergedCatalogTopics.filter(
      (t) =>
        t.levelId === selectedLevelId &&
        t.grade === selectedGrade &&
        t.subject.toLowerCase() === selectedSubject.toLowerCase()
    );
  }, [
    mergedCatalogTopics,
    selectedLevelId,
    selectedGrade,
    selectedSubject,
    currentRuleSet.cognitiveLevels,
  ]);

  const activeCurriculumTopic = useMemo(() => {
    if (selectedTopicId) {
      const found = matchingTopics.find((t) => t.id === selectedTopicId);
      if (found) return found;
    }
    return matchingTopics[0];
  }, [matchingTopics, selectedTopicId]);

  const activeFileRecord = useMemo(() => {
    if (!activeFileId) return uploadedFiles[0] || null;
    return uploadedFiles.find((f) => f.fileId === activeFileId) || uploadedFiles[0] || null;
  }, [uploadedFiles, activeFileId]);

  const activeDrafts = useMemo(
    () => activeFileRecord?.extractedQuestions || [],
    [activeFileRecord]
  );

  const filteredDrafts = useMemo(() => {
    return activeDrafts.filter((q) => {
      if (activeLeftPageFilter !== 'ALL' && q.pageNumber !== activeLeftPageFilter) {
        return false;
      }
      if (rightQuestionFilter === 'NEEDS_ATTENTION') {
        return (
          q.answerOrigin === 'MISSING' ||
          q.answerOrigin === 'AI_SUGGESTED' ||
          !q.cognitiveConfirmed ||
          Boolean(q.duplicateCheck?.isDuplicate)
        );
      }
      if (rightQuestionFilter === 'MISSING_OR_AI_ANSWER') {
        return q.answerOrigin === 'MISSING' || q.answerOrigin === 'AI_SUGGESTED';
      }
      if (rightQuestionFilter === 'UNCONFIRMED_COGNITIVE') {
        return !q.cognitiveConfirmed;
      }
      if (rightQuestionFilter === 'HAS_MEDIA_OR_PASSAGE') {
        return (
          Boolean(q.sharedPassage) ||
          (q.attachments && q.attachments.length > 0)
        );
      }
      if (rightQuestionFilter === 'DUPLICATE') {
        return Boolean(q.duplicateCheck?.isDuplicate);
      }
      return true;
    });
  }, [activeDrafts, activeLeftPageFilter, rightQuestionFilter]);

  // Xác định định dạng tệp tải lên
  const detectSourceTypeFromFile = (file: File): SmartImportSourceType => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mime = (file.type || '').toLowerCase();
    if (ext === 'docx' || ext === 'doc' || mime.includes('wordprocessingml')) return 'DOCX';
    if (ext === 'pdf' || mime.includes('pdf')) return 'PDF';
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || mime.includes('spreadsheet') || mime.includes('excel')) {
      return 'XLSX';
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || mime.startsWith('image/')) {
      return 'IMAGE';
    }
    return 'DOCX';
  };

  // Cập nhật một bản ghi tệp trong danh sách
  const updateFileRecord = (
    fileId: string,
    updater: (prev: SmartImportFileRecord) => SmartImportFileRecord
  ) => {
    setUploadedFiles((prev) =>
      prev.map((item) => (item.fileId === fileId ? updater(item) : item))
    );
  };

  // Cập nhật một câu hỏi nháp trong tệp đang mở
  const updateDraftInActiveFile = (
    draftId: string,
    updater: (prev: SmartExtractedQuestionDraft) => SmartExtractedQuestionDraft
  ) => {
    if (!activeFileRecord) return;
    updateFileRecord(activeFileRecord.fileId, (rec) => ({
      ...rec,
      extractedQuestions: rec.extractedQuestions.map((q) =>
        q.draftId === draftId ? updater(q) : q
      ),
    }));
  };

  // Quy trình xử lý 1 tệp tài liệu tải lên (Bước 1 -> Bước 4)
  const processSingleUploadedFile = async (
    file: File,
    overrideContext?: { grade?: GradeNumber; subject?: string }
  ) => {
    const fileId = `imp-file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const fileType = detectSourceTypeFromFile(file);
    const targetGrade = overrideContext?.grade || selectedGrade;
    const targetLevelId = getLevelForGrade(targetGrade);
    const targetSubject = overrideContext?.subject || selectedSubject;
    const matchedTopic =
      topics.find(
        (t) =>
          t.grade === targetGrade &&
          t.subject.toLowerCase().includes(targetSubject.toLowerCase())
      ) || activeCurriculumTopic;

    const initialRecord: SmartImportFileRecord = {
      fileId,
      fileName: file.name,
      fileType,
      fileSizeBytes: file.size,
      uploadedAt: new Date().toLocaleTimeString('vi-VN'),
      status: 'EXTRACTING',
      progressPercent: 25,
      currentStepIndex: 2,
      currentStepLabel: 'Bước 2: Đang trích xuất văn bản, hình ảnh, bảng biểu và công thức...',
      pages: [],
      extractedQuestions: [],
      detectedGrade: targetGrade,
      detectedSubject: targetSubject,
    };

    setUploadedFiles((prev) => [initialRecord, ...prev]);
    setActiveFileId(fileId);
    setActiveLeftPageFilter('ALL');

    try {
      let pages: ExtractedDocumentPage[] = [];
      let inlineData: { mimeType: string; data: string } | undefined;

      if (fileType === 'DOCX') {
        pages = await parseDocxFileToPages(file);
      } else if (fileType === 'XLSX') {
        pages = await parseXlsxFileToPages(file);
      } else if (fileType === 'PDF') {
        const pdfRes = await parsePdfFileToPages(file, (stepMsg) => {
          updateFileRecord(fileId, (rec) => ({
            ...rec,
            progressPercent: 45,
            currentStepLabel: stepMsg,
          }));
        });
        pages = pdfRes.pages;
        inlineData = { mimeType: 'application/pdf', data: pdfRes.base64Data };
      } else if (fileType === 'IMAGE') {
        const imgRes = await parseImageFileToPages(file, (stepMsg) => {
          updateFileRecord(fileId, (rec) => ({
            ...rec,
            progressPercent: 45,
            currentStepLabel: stepMsg,
          }));
        });
        pages = imgRes.pages;
        inlineData = { mimeType: file.type || 'image/png', data: imgRes.base64Data };
      }

      // Chuyển sang Bước 3: AI phân tích cấu trúc tài liệu và đề xuất tách câu hỏi
      updateFileRecord(fileId, (rec) => ({
        ...rec,
        status: 'AI_ANALYZING',
        progressPercent: 60,
        currentStepIndex: 3,
        currentStepLabel: 'Bước 3: AI đang phân tích cấu trúc đề và tách câu hỏi...',
        pages,
      }));

      const { questions: extractedDrafts, engineUsed } = await analyzeDocumentWithSmartAI({
        fileId,
        fileName: file.name,
        fileType,
        pages,
        inlineData,
        defaultLevelId: targetLevelId,
        defaultGrade: targetGrade,
        defaultSubject: targetSubject,
        defaultTopic: matchedTopic,
        requestAiAnswerSuggestion: autoSuggestAiAnswerWhenMissing,
      });

      // Tự động chạy kiểm tra trùng lặp sơ bộ với Ngân hàng câu hỏi
      const draftsWithDupCheck = runDuplicateCheckOnDrafts(
        extractedDrafts,
        existingQuestions
      );

      updateFileRecord(fileId, (rec) => ({
        ...rec,
        status: 'READY',
        progressPercent: 100,
        currentStepIndex: 4,
        currentStepLabel: `Bước 4–5: Đã trích xuất ${draftsWithDupCheck.length} câu hỏi từ ${pages.length} trang. Sẵn sàng đối chiếu 2 cột.`,
        pages,
        extractedQuestions: draftsWithDupCheck,
        engineUsed,
      }));

      if (draftsWithDupCheck.length > 0) {
        setFocusedDraftId(draftsWithDupCheck[0].draftId);
      }

      onNotify(
        'success',
        'Trích xuất tài liệu thành công',
        `Đã nhận diện ${draftsWithDupCheck.length} câu hỏi từ tệp "${file.name}" (${pages.length} trang). Vui lòng đối chiếu ở 2 cột bên dưới.`
      );
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : 'Không thể đọc nội dung tệp tải lên (Tệp bị hỏng hoặc sai định dạng).';

      updateFileRecord(fileId, (rec) => ({
        ...rec,
        status: 'ERROR',
        progressPercent: 0,
        currentStepIndex: 2,
        currentStepLabel: `Lỗi xử lý tệp: ${errMsg}`,
        errorMessage: errMsg,
      }));

      onNotify('error', `Lỗi đọc tệp "${file.name}"`, errMsg);
    }
  };

  // Xử lý kéo thả hoặc chọn nhiều tệp
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    for (const file of filesArray) {
      await processSingleUploadedFile(file);
    }
  };

  // Xử lý nhập văn bản sao chép trực tiếp (Nguồn 5)
  const handleProcessDirectText = async () => {
    const cleanText = directTextInput.trim();
    if (!cleanText) {
      onNotify('warning', 'Văn bản trống', 'Vui lòng dán nội dung đề kiểm tra cần trích xuất.');
      return;
    }

    const fileId = `imp-text-${Date.now()}`;
    const rawPages = cleanText.split(/\f|=== TRANG \d+ ===/i).filter((s) => s.trim().length > 0);
    const pages: ExtractedDocumentPage[] = (rawPages.length > 0 ? rawPages : [cleanText]).map(
      (pageStr, idx) => {
        const { normalizedText, extractedFormulas } = normalizeInlineMathFormulas(pageStr);
        return {
          pageNumber: idx + 1,
          rawText: normalizedText,
          tables: [],
          images: [],
          formulas: extractedFormulas,
          passages: [],
        };
      }
    );

    const { questions: extractedDrafts, engineUsed } = await analyzeDocumentWithSmartAI({
      fileId,
      fileName: directTextTitle || 'Van_Ban_Sao_Chep_Truc_Tiep.txt',
      fileType: 'DIRECT_TEXT',
      pages,
      defaultLevelId: selectedLevelId,
      defaultGrade: selectedGrade,
      defaultSubject: selectedSubject,
      defaultTopic: activeCurriculumTopic,
      requestAiAnswerSuggestion: autoSuggestAiAnswerWhenMissing,
    });

    const draftsWithDup = runDuplicateCheckOnDrafts(extractedDrafts, existingQuestions);

    const newRecord: SmartImportFileRecord = {
      fileId,
      fileName: directTextTitle || 'Van_Ban_Sao_Chep_Truc_Tiep.txt',
      fileType: 'DIRECT_TEXT',
      fileSizeBytes: new Blob([cleanText]).size,
      uploadedAt: new Date().toLocaleTimeString('vi-VN'),
      status: 'READY',
      progressPercent: 100,
      currentStepIndex: 4,
      currentStepLabel: `Đã phân tích văn bản trực tiếp: Nhận diện ${draftsWithDup.length} câu hỏi.`,
      pages,
      extractedQuestions: draftsWithDup,
      engineUsed,
      detectedGrade: selectedGrade,
      detectedSubject: selectedSubject,
    };

    setUploadedFiles((prev) => [newRecord, ...prev]);
    setActiveFileId(fileId);
    setShowDirectTextModal(false);
    if (draftsWithDup.length > 0) {
      setFocusedDraftId(draftsWithDup[0].draftId);
    }

    onNotify(
      'success',
      'Đã tách câu hỏi từ văn bản trực tiếp',
      `Nhận diện thành công ${draftsWithDup.length} câu hỏi. Giáo viên vui lòng đối chiếu và xác nhận.`
    );
  };

  // Nạp 1 kịch bản kiểm thử cụ thể lên giao diện 2 cột để giáo viên/người chấm trực tiếp trải nghiệm
  const handleLoadSingleTestScenario = async (scenarioId: SmartImportTestScenarioId) => {
    const scenario = await createTestScenarioFile(scenarioId);
    const levelId = getLevelForGrade(scenario.defaultGrade);
    setSelectedLevelId(levelId);
    setSelectedGrade(scenario.defaultGrade);
    setSelectedSubject(scenario.defaultSubject);
    await processSingleUploadedFile(scenario.file, {
      grade: scenario.defaultGrade,
      subject: scenario.defaultSubject,
    });
  };

  // Nạp tệp PDF đề kiểm tra mẫu thực tế (%PDF-1.4, 2 trang) để kiểm thử trích xuất PDF
  const handleLoadSamplePdfFile = async () => {
    const pdfSample = createSamplePdfExamFile();
    const levelId = getLevelForGrade(pdfSample.defaultGrade);
    setSelectedLevelId(levelId);
    setSelectedGrade(pdfSample.defaultGrade);
    setSelectedSubject(pdfSample.defaultSubject);
    await processSingleUploadedFile(pdfSample.file, {
      grade: pdfSample.defaultGrade,
      subject: pdfSample.defaultSubject,
    });
  };

  // Nạp tệp PDF dạng hình ảnh chụp (Scanned Image PDF — 100% ảnh nhúng DCTDecode, không có lớp text) để kiểm thử OCR
  const handleLoadSampleScannedPdfFile = async () => {
    const scannedPdfSample = await createSampleScannedImagePdfExamFile();
    const levelId = getLevelForGrade(scannedPdfSample.defaultGrade);
    setSelectedLevelId(levelId);
    setSelectedGrade(scannedPdfSample.defaultGrade);
    setSelectedSubject(scannedPdfSample.defaultSubject);
    await processSingleUploadedFile(scannedPdfSample.file, {
      grade: scannedPdfSample.defaultGrade,
      subject: scannedPdfSample.defaultSubject,
    });
  };

  // Cập nhật nội dung văn bản gốc của 1 trang (sau khi OCR) và tự động tách lại câu hỏi
  const handleReparseActiveFileFromEditedPageText = (pageNumber: number, newRawText: string) => {
    if (!activeFileRecord) return;
    const updatedPages = activeFileRecord.pages.map((p) =>
      p.pageNumber === pageNumber ? { ...p, rawText: newRawText } : p
    );
    const reExtracted = extractStructuredQuestionsFromPages({
      fileId: activeFileRecord.fileId,
      fileName: activeFileRecord.fileName,
      fileType: activeFileRecord.fileType,
      pages: updatedPages,
      defaultLevelId: selectedLevelId,
      defaultGrade: selectedGrade,
      defaultSubject: selectedSubject,
      defaultTopic: activeCurriculumTopic,
      requestAiAnswerSuggestion: autoSuggestAiAnswerWhenMissing,
    });
    const checkedDrafts = runDuplicateCheckOnDrafts(reExtracted, existingQuestions);
    updateFileRecord(activeFileRecord.fileId, (rec) => ({
      ...rec,
      pages: updatedPages,
      extractedQuestions: checkedDrafts,
      status: checkedDrafts.length > 0 ? 'READY' : rec.status,
      errorMessage: checkedDrafts.length > 0 ? undefined : rec.errorMessage,
    }));
    setEditingPageNumber(null);
    onNotify(
      'success',
      `Đã cập nhật văn bản Trang ${pageNumber} & tách lại câu hỏi`,
      `Hệ thống đã phân tích lại và nhận diện được ${checkedDrafts.length} câu hỏi từ tài liệu.`
    );
  };

  const hasAutoInitializedRef = useRef(false);
  useEffect(() => {
    if (hasAutoInitializedRef.current) return;
    hasAutoInitializedRef.current = true;
    void (async () => {
      try {
        await handleLoadSingleTestScenario('TEST_MATH_FORMULA');
      } catch {
        // ignore initial load error
      }
    })();
  }, []);

  // Chạy toàn bộ 6 kịch bản kiểm thử tự động (Mục V)
  const handleRunAllSixTestScenarios = async () => {
    setIsRunningTestSuite(true);
    try {
      const reports = await runSmartImportVerificationSuite({
        topics,
        onBulkAddQuestions,
        onAddGroup,
        onAssignToGroup,
      });
      setTestSuiteReports(reports);

      // Đồng thời nạp kịch bản 1 (Đề Toán có công thức) lên màn hình đối chiếu 2 cột nếu chưa có tệp nào
      if (uploadedFiles.length === 0) {
        await handleLoadSingleTestScenario('TEST_MATH_FORMULA');
      }

      const passedCount = reports.filter((r) => r.overallPassed).length;
      onNotify(
        passedCount === reports.length ? 'success' : 'warning',
        `Hoàn tất Kiểm thử ${passedCount}/${reports.length} kịch bản`,
        'Toàn bộ câu hỏi hợp lệ từ các đề thử nghiệm đã được lưu thực sự vào Ngân hàng ở trạng thái Bản nháp (DRAFT).'
      );
    } catch (error) {
      onNotify(
        'error',
        'Lỗi chạy bộ kiểm thử',
        error instanceof Error ? error.message : 'Không thể hoàn tất bộ kiểm thử.'
      );
    } finally {
      setIsRunningTestSuite(false);
    }
  };

  // Bước 5: Yêu cầu AI đề xuất đáp án cho các câu chưa có đáp án trong tài liệu gốc (Gắn nhãn rõ ràng)
  const handleRequestAiSuggestionsForMissingAnswers = () => {
    if (!activeFileRecord) return;
    let updatedCount = 0;

    updateFileRecord(activeFileRecord.fileId, (rec) => ({
      ...rec,
      currentStepIndex: 5,
      currentStepLabel:
        'Bước 5: Đã gắn gợi ý đáp án AI ("Đáp án do AI đề xuất – cần xác minh") cho các câu thiếu đáp án.',
      extractedQuestions: rec.extractedQuestions.map((q) => {
        if (q.hasExplicitAnswerInDoc || q.answerOrigin === 'TEACHER_CONFIRMED') {
          return q;
        }
        updatedCount += 1;
        const aiSug = buildAiSuggestedAnswerForQuestion({
          stem: q.stem,
          options: q.options,
          subStatements: q.subStatements,
          format: q.format,
        });
        const newWarnings = q.extractionWarnings.filter(
          (w) => !w.includes('Tài liệu gốc không có đáp án')
        );
        newWarnings.unshift(
          'Đáp án do AI đề xuất – cần xác minh (Tài liệu gốc không có đáp án).'
        );

        return {
          ...q,
          answerOrigin: 'AI_SUGGESTED',
          correctAnswer: aiSug.suggestedAnswer,
          aiSuggestedAnswer: aiSug.suggestedAnswer,
          aiSuggestedExplanation: aiSug.explanation,
          gradingGuide: aiSug.explanation,
          extractionWarnings: newWarnings,
        };
      }),
    }));

    onNotify(
      'info',
      'Đã tạo gợi ý đáp án từ AI',
      `Đã đề xuất đáp án cho ${updatedCount} câu hỏi chưa có đáp án gốc. Mỗi câu đều gắn nhãn "Đáp án do AI đề xuất – cần xác minh" để giáo viên kiểm tra.`
    );
  };

  // Bước 5: Xác nhận mức độ nhận thức cho tất cả các câu đã chọn sau khi giáo viên rà soát
  const handleConfirmAllSelectedCognitiveLevels = () => {
    if (!activeFileRecord) return;
    let count = 0;
    updateFileRecord(activeFileRecord.fileId, (rec) => ({
      ...rec,
      currentStepIndex: 5,
      extractedQuestions: rec.extractedQuestions.map((q) => {
        if (!q.selectedForImport) return q;
        count += 1;
        return {
          ...q,
          cognitiveConfirmed: true,
          extractionWarnings: q.extractionWarnings.filter(
            (w) => !w.includes('Mức độ nhận thức chưa được tự động xác nhận')
          ),
        };
      }),
    }));
    onNotify(
      'success',
      'Đã xác nhận mức độ nhận thức',
      `Giáo viên đã xác nhận mức độ nhận thức cho ${count} câu hỏi đang chọn.`
    );
  };

  // Bước 6: Liên kết hàng loạt các câu hỏi đang chọn với Chương trình, Chủ đề, Bài học và Yêu cầu cần đạt
  const handleApplyCurriculumLinkToSelected = () => {
    if (!activeFileRecord) return;
    const topicObj = activeCurriculumTopic;
    const chosenLo =
      topicObj?.learningOutcomes.find((lo) => lo.code === selectedOutcomeCode) ||
      topicObj?.learningOutcomes[0];

    const finalTopicTitle =
      topicObj?.chapterTitle || topicObj?.topicTitle || 'Chủ đề chương trình GDPT 2018';
    const finalLessonTitle =
      selectedLessonName ||
      topicObj?.lessons?.[0]?.lessonName ||
      chosenLo?.lessonName ||
      finalTopicTitle;
    const finalLoCode = chosenLo?.code || `YCCĐ-K${selectedGrade}-1.1`;
    const finalLoText = cleanLearningOutcomeText(
      chosenLo?.description ||
        `Đáp ứng yêu cầu cần đạt môn ${selectedSubject} Lớp ${selectedGrade}.`
    );

    let linkedCount = 0;
    updateFileRecord(activeFileRecord.fileId, (rec) => ({
      ...rec,
      currentStepIndex: 6,
      currentStepLabel: `Bước 6: Đã liên kết ${rec.extractedQuestions.filter((q) => q.selectedForImport).length} câu hỏi với chủ đề "${finalTopicTitle}" [${finalLoCode}].`,
      extractedQuestions: rec.extractedQuestions.map((q) => {
        if (!q.selectedForImport) return q;
        linkedCount += 1;
        return {
          ...q,
          levelId: selectedLevelId,
          grade: selectedGrade,
          subject: selectedSubject,
          topicId: topicObj?.id,
          topicTitle: finalTopicTitle,
          lessonTitle: finalLessonTitle,
          knowledgeUnit: finalLessonTitle,
          learningOutcomeCode: finalLoCode,
          learningOutcomeText: finalLoText,
          curriculumLinked: true,
        };
      }),
    }));

    onNotify(
      'success',
      'Đã liên kết Chương trình & YCCĐ',
      `Đã gắn Chủ đề "${finalTopicTitle}" và mã YCCĐ [${finalLoCode}] cho ${linkedCount} câu hỏi.`
    );
  };

  // Bước 7: Nút Kiểm tra trùng lặp
  const handleRunDuplicateCheck = () => {
    if (!activeFileRecord) return;
    const checked = runDuplicateCheckOnDrafts(
      activeFileRecord.extractedQuestions,
      existingQuestions
    );
    const dupCount = checked.filter((q) => q.duplicateCheck?.isDuplicate).length;

    updateFileRecord(activeFileRecord.fileId, (rec) => ({
      ...rec,
      currentStepIndex: 7,
      currentStepLabel: `Bước 7: Đã kiểm tra trùng lặp với ${existingQuestions.length} câu trong Ngân hàng — Phát hiện ${dupCount} câu có độ tương đồng cao.`,
      extractedQuestions: checked,
    }));

    onNotify(
      dupCount > 0 ? 'warning' : 'success',
      'Hoàn tất kiểm tra trùng lặp',
      dupCount > 0
        ? `Phát hiện ${dupCount} câu hỏi có nội dung trùng hoặc tương đồng ≥ 65% với Ngân hàng câu hỏi. Bạn có thể bỏ chọn hoặc chỉnh sửa trước khi lưu.`
        : `Tất cả ${checked.length} câu hỏi đều không bị trùng lặp với Ngân hàng câu hỏi hiện có.`
    );
  };

  // Bước 8: Lưu vào Ngân hàng ở trạng thái Bản nháp (DRAFT) và xác thực dữ liệu đã được lưu thực sự
  const handleSaveSelectedAsDrafts = () => {
    if (!activeFileRecord) return;
    const selectedDrafts = activeFileRecord.extractedQuestions.filter(
      (q) => q.selectedForImport
    );

    if (selectedDrafts.length === 0) {
      onNotify(
        'warning',
        'Chưa chọn câu hỏi',
        'Vui lòng tích chọn ít nhất 01 câu hỏi ở cột bên phải để lưu vào Ngân hàng.'
      );
      return;
    }

    const saveResult = saveImportedQuestionsAsDraftsToBank({
      draftsToSave: selectedDrafts,
      authorName,
      onBulkAddQuestions,
      onAddGroup,
      onAssignToGroup,
    });

    if (!saveResult.success) {
      onNotify(
        'error',
        'Không thể lưu dữ liệu vào Ngân hàng',
        saveResult.errorMessage || 'Dữ liệu chưa được lưu thực sự vào kho lưu trữ.'
      );
      return;
    }

    updateFileRecord(activeFileRecord.fileId, (rec) => ({
      ...rec,
      currentStepIndex: 8,
      currentStepLabel: `Bước 8: Đã lưu thực sự ${saveResult.verifiedSavedCount} câu hỏi vào Ngân hàng ở trạng thái Bản nháp (DRAFT).`,
    }));

    setLastSavedBatchInfo({
      savedAt: new Date().toLocaleTimeString('vi-VN'),
      fileName: activeFileRecord.fileName,
      savedCount: saveResult.verifiedSavedCount,
      savedCodes: saveResult.savedQuestions.map((q) => q.code),
      createdGroupCodes: saveResult.createdGroups.map((g) => `${g.code} (${g.name})`),
    });

    onNotify(
      'success',
      `Đã lưu ${saveResult.verifiedSavedCount} câu hỏi ở trạng thái Bản nháp`,
      `Đã kiểm chứng dữ liệu lưu thực tế trong Ngân hàng câu hỏi: ${saveResult.savedQuestions
        .map((q) => q.code)
        .slice(0, 6)
        .join(', ')}${saveResult.savedQuestions.length > 6 ? '...' : ''}.`
    );
  };

  // Thống kê nhanh của tệp đang mở
  const stats = useMemo(() => {
    const total = activeDrafts.length;
    const selected = activeDrafts.filter((q) => q.selectedForImport).length;
    const fromDocAnswer = activeDrafts.filter((q) => q.answerOrigin === 'FROM_DOCUMENT').length;
    const missingAnswer = activeDrafts.filter((q) => q.answerOrigin === 'MISSING').length;
    const aiSuggestedAnswer = activeDrafts.filter((q) => q.answerOrigin === 'AI_SUGGESTED').length;
    const cognitiveConfirmed = activeDrafts.filter((q) => q.cognitiveConfirmed).length;
    const duplicates = activeDrafts.filter((q) => q.duplicateCheck?.isDuplicate).length;
    const withPassageOrMedia = activeDrafts.filter(
      (q) => Boolean(q.sharedPassage) || q.attachments.length > 0
    ).length;

    return {
      total,
      selected,
      fromDocAnswer,
      missingAnswer,
      aiSuggestedAnswer,
      cognitiveConfirmed,
      duplicates,
      withPassageOrMedia,
    };
  }, [activeDrafts]);

  return (
    <div className="space-y-4">
      {/* TIÊU ĐỀ TRANG, THANH CÔNG CỤ THAO TÁC & TIẾN TRÌNH 8 BƯỚC THEO DÒNG ĐƠN */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        {/* Dòng 1: Tiêu đề & mô tả hiển thị trên dòng đơn toàn chiều rộng */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              Nhập đề từ tài liệu (Smart Exam Document Import)
            </h1>
            <span className="hidden lg:inline-block text-xs text-slate-500 whitespace-nowrap shrink-0">
              Hỗ trợ: Word (.docx) · PDF (.pdf) · PDF Scan (OCR) · Excel (.xlsx) · Ảnh (.png, .jpg) · Văn bản
            </span>
          </div>
          <p className="text-xs text-slate-600 truncate">
            Chuyển đổi thông minh đề kiểm tra thành câu hỏi chuẩn GDPT 2018 · Bảo toàn công thức LaTeX/OMML, hình ảnh, bảng biểu và liên kết ngữ liệu đọc hiểu chung.
          </p>
        </div>

        {/* Dòng 2: Thanh nút thao tác nhanh trên một dòng đơn */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleLoadSamplePdfFile()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Nạp thử Đề PDF mẫu (.pdf)</span>
            </button>

            <button
              type="button"
              onClick={() => void handleLoadSampleScannedPdfFile()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Kiểm thử trích xuất OCR với tệp PDF được tạo hoàn toàn từ hình ảnh chụp (không có lớp văn bản)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Nạp thử PDF ảnh chụp (Scan OCR)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDirectTextModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dán văn bản trực tiếp</span>
            </button>

            <button
              type="button"
              disabled={isRunningTestSuite}
              onClick={handleRunAllSixTestScenarios}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {isRunningTestSuite
                  ? 'Đang chạy kiểm thử 6 kịch bản...'
                  : 'Chạy Kiểm thử 6 Kịch bản & Lưu thật'}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải tài liệu đề thi lên</span>
          </button>
        </div>

        {/* Dòng 3: Thanh tiến trình xử lý 8 bước gọn trên dòng đơn */}
        <div className="border-t border-slate-100 pt-2.5 space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs min-w-0">
            <span className="font-semibold text-slate-800 truncate">
              {activeFileRecord
                ? activeFileRecord.currentStepLabel
                : 'Bước 1: Sẵn sàng nhận tài liệu đề kiểm tra (.docx, .pdf, .xlsx, .png, .jpg hoặc văn bản)'}
            </span>
            <span className="font-mono font-semibold text-blue-700 tabular-nums whitespace-nowrap shrink-0">
              Tiến độ: {activeFileRecord ? activeFileRecord.progressPercent : 0}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                activeFileRecord?.status === 'ERROR'
                  ? 'bg-rose-600'
                  : 'bg-blue-700'
              }`}
              style={{
                width: `${
                  activeFileRecord
                    ? activeFileRecord.status === 'ERROR'
                      ? 100
                      : activeFileRecord.progressPercent
                    : 8
                }%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-1.5">
            {PIPELINE_STEPS.map((s) => {
              const activeStep = activeFileRecord?.currentStepIndex || 1;
              const isCompleted = activeFileRecord && activeStep > s.step;
              const isCurrent = activeStep === s.step;
              return (
                <div
                  key={s.step}
                  title={`${s.title} — ${s.desc}`}
                  className={`px-2 py-1.5 rounded-md border text-left transition-colors truncate ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-semibold'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950 font-medium'
                      : 'border-slate-200 bg-slate-50/60 text-slate-500'
                  }`}
                >
                  <div className="text-[11px] leading-tight truncate">
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KHU VỰC KÉO THẢ TỆP + NẠP NHANH 6 ĐỀ MẪU KIỂM THỬ + DANH SÁCH TỆP ĐÃ TẢI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Khu vực kéo thả tệp (7 cột) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              1. Khu vực kéo thả tệp đề kiểm tra & Nạp đề mẫu kiểm thử
            </h2>
            <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
              .docx · .pdf · .xlsx · .png · .jpg
            </span>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              void handleFilesSelected(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
              isDraggingOver
                ? 'border-blue-600 bg-blue-50/70'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".docx,.doc,.pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                void handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
            <div className="flex items-center gap-3 min-w-0">
              <Upload className="w-6 h-6 text-blue-700 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                  Kéo thả tệp đề kiểm tra vào đây hoặc nhấp để chọn tệp từ máy tính
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Tự động giải nén cấu trúc Word (.docx), đọc bảng tính (.xlsx), nhận diện PDF (.pdf) và OCR PDF/Hình ảnh chụp
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg whitespace-nowrap shrink-0">
              Chọn tệp...
            </span>
          </div>

          {/* 6 Nút nạp nhanh 6 bộ đề kiểm thử thực tế theo dòng đơn gọn gàng */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-700 truncate">
              Nạp nhanh 01 trong 06 bộ tài liệu chuẩn để kiểm thử ngay trên giao diện 2 cột:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => void handleLoadSingleTestScenario('TEST_MATH_FORMULA')}
                className="px-2.5 py-1.5 text-left text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 transition-colors cursor-pointer truncate"
                title="1. Đề Toán có công thức (OMML & LaTeX · 2 trang · 3 câu)"
              >
                <span className="font-semibold text-blue-900">1. Đề Toán công thức</span>
                <span className="text-[11px] text-slate-500"> · OMML/LaTeX</span>
              </button>

              <button
                type="button"
                onClick={() => void handleLoadSingleTestScenario('TEST_VIETNAMESE_PASSAGE')}
                className="px-2.5 py-1.5 text-left text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 transition-colors cursor-pointer truncate"
                title="2. Đề Tiếng Việt đọc hiểu (Ngữ liệu chung · Liên kết 3 câu)"
              >
                <span className="font-semibold text-blue-900">2. Tiếng Việt đọc hiểu</span>
                <span className="text-[11px] text-slate-500"> · Ngữ liệu</span>
              </button>

              <button
                type="button"
                onClick={() => void handleLoadSingleTestScenario('TEST_MCQ_MULTI_CHOICE')}
                className="px-2.5 py-1.5 text-left text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 transition-colors cursor-pointer truncate"
                title="3. Đề trắc nghiệm 4 lựa chọn (Tin học 7 · Khớp bảng đáp án)"
              >
                <span className="font-semibold text-blue-900">3. Trắc nghiệm 4 lựa chọn</span>
                <span className="text-[11px] text-slate-500"> · Có đáp án</span>
              </button>

              <button
                type="button"
                onClick={() => void handleLoadSingleTestScenario('TEST_IMAGE_AND_TABLE')}
                className="px-2.5 py-1.5 text-left text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 transition-colors cursor-pointer truncate"
                title="4. Tài liệu có Ảnh & Bảng (Sơ đồ mạch điện & Bảng đo)"
              >
                <span className="font-semibold text-blue-900">4. Đề có Ảnh & Bảng</span>
                <span className="text-[11px] text-slate-500"> · KHTN 8</span>
              </button>

              <button
                type="button"
                onClick={() => void handleLoadSingleTestScenario('TEST_NO_ANSWER_KEY')}
                className="px-2.5 py-1.5 text-left text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 transition-colors cursor-pointer truncate"
                title="5. Tệp không có đáp án (Kiểm tra không tự bịa đáp án)"
              >
                <span className="font-semibold text-amber-900">5. Đề không có đáp án</span>
                <span className="text-[11px] text-slate-500"> · Giữ trống</span>
              </button>

              <button
                type="button"
                onClick={() => void handleLoadSingleTestScenario('TEST_CORRUPTED_FILE')}
                className="px-2.5 py-1.5 text-left text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-slate-800 transition-colors cursor-pointer truncate"
                title="6. Tệp lỗi / Không đọc được (Kiểm tra chặn tệp hỏng an toàn)"
              >
                <span className="font-semibold text-rose-900">6. Tệp lỗi / Hỏng</span>
                <span className="text-[11px] text-slate-500"> · Chặn an toàn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách tệp đã tải lên (5 cột) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              2. Danh sách tệp đã tải ({uploadedFiles.length})
            </h2>
            {uploadedFiles.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setUploadedFiles([]);
                  setActiveFileId(null);
                }}
                className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Xóa danh sách
              </button>
            )}
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <FileSpreadsheet className="w-7 h-7 text-slate-400 mb-2" />
              <div className="text-xs font-semibold text-slate-700">
                Chưa có tài liệu nào trong phiên làm việc
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Hãy tải tệp lên hoặc bấm chọn 1 trong 6 đề mẫu kiểm thử ở khung bên trái để bắt đầu.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {uploadedFiles.map((f) => {
                const isSelected = activeFileRecord?.fileId === f.fileId;
                return (
                  <div
                    key={f.fileId}
                    onClick={() => setActiveFileId(f.fileId)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{f.fileName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 tabular-nums">
                        <span>{f.fileType}</span>
                        <span>·</span>
                        <span>{Math.max(1, Math.round(f.fileSizeBytes / 1024))} KB</span>
                        <span>·</span>
                        <span>{f.pages.length} trang</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">
                          {f.extractedQuestions.length} câu hỏi
                        </span>
                      </div>
                      {f.status === 'ERROR' && (
                        <div className="text-[11px] text-rose-700 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{f.errorMessage}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-semibold ${
                          f.status === 'READY'
                            ? 'text-emerald-700'
                            : f.status === 'ERROR'
                            ? 'text-rose-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {f.status === 'READY'
                          ? 'Hoàn tất'
                          : f.status === 'ERROR'
                          ? 'Tệp lỗi'
                          : 'Đang xử lý...'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFiles((prev) =>
                            prev.filter((item) => item.fileId !== f.fileId)
                          );
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Xóa tệp này khỏi danh sách"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tùy chọn nguyên tắc xử lý đáp án AI */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSuggestAiAnswerWhenMissing}
                onChange={(e) => setAutoSuggestAiAnswerWhenMissing(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>
                Tự động nhờ AI gợi ý đáp án nếu tài liệu gốc không có (Gắn nhãn cần xác minh)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* BẢNG KẾT QUẢ KIỂM THỬ 6 KỊCH BẢN (PHẦN V) NẾU ĐÃ CHẠY */}
      {testSuiteReports.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>
                  Báo cáo Kết quả Kiểm thử Tự động 06 Kịch bản Thực tế (Đã lưu thật vào Ngân hàng ở trạng thái Bản nháp)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm chứng đầy đủ: Số câu trích xuất · Độ chính xác công thức/ngữ liệu/hình ảnh/bảng biểu · Không tự bịa đáp án · Chặn tệp hỏng · Lưu thật vào kho dữ liệu.
              </p>
            </div>
            {onNavigateToBank && (
              <button
                type="button"
                onClick={onNavigateToBank}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Mở Ngân hàng câu hỏi để xem các câu vừa lưu
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 text-left">
                  <th className="py-2.5 px-3 font-semibold">Kịch bản kiểm thử</th>
                  <th className="py-2.5 px-3 font-semibold">Tệp thử nghiệm</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Số câu trích xuất</th>
                  <th className="py-2.5 px-3 font-semibold">Độ chính xác & Quy tắc</th>
                  <th className="py-2.5 px-3 font-semibold">Chi tiết nghiệm thu & Mã câu đã lưu</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Kết luận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {testSuiteReports.map((rep) => (
                  <tr key={rep.scenarioId} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {rep.scenarioTitle}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{rep.fileName}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">
                      {rep.extractedQuestionCount}/{rep.expectedQuestionCount} câu
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {rep.passedContentAccuracy && rep.passedSpecialRules
                        ? 'Đạt 100% quy tắc'
                        : 'Cần kiểm tra'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 space-y-1">
                      {rep.details.map((d, i) => (
                        <div key={i} className="leading-snug">
                          • {d}
                        </div>
                      ))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {rep.overallPassed ? (
                        <span className="text-emerald-700">ĐẠT (PASS)</span>
                      ) : (
                        <span className="text-rose-700">KHÔNG ĐẠT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* THÔNG BÁO XÁC NHẬN LƯU THỰC TẾ GẦN NHẤT */}
      {lastSavedBatchInfo && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-emerald-950">
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Đã lưu và kiểm chứng thực tế {lastSavedBatchInfo.savedCount} câu hỏi từ "{lastSavedBatchInfo.fileName}" vào Ngân hàng câu hỏi (Trạng thái: Bản nháp - DRAFT) lúc {lastSavedBatchInfo.savedAt}
              </span>
            </div>
            <div className="text-emerald-800">
              Mã câu hỏi đã tạo: <span className="font-mono font-semibold">{lastSavedBatchInfo.savedCodes.join(', ')}</span>
              {lastSavedBatchInfo.createdGroupCodes.length > 0 && (
                <span>
                  {' '}
                  · Nhóm ngữ liệu đọc hiểu đã liên kết:{' '}
                  <span className="font-semibold">{lastSavedBatchInfo.createdGroupCodes.join(', ')}</span>
                </span>
              )}
            </div>
          </div>
          {onNavigateToBank && (
            <button
              type="button"
              onClick={onNavigateToBank}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              Xem trong Ngân hàng câu hỏi
            </button>
          )}
        </div>
      )}

      {/* BƯỚC 6: KHUNG LIÊN KẾT CÂU HỎI VỚI CHƯƠNG TRÌNH, CHỦ ĐỀ VÀ YÊU CẦU CẦN ĐẠT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-700" />
              <span>
                Bước 6: Liên kết câu hỏi với Chương trình giáo dục, Chủ đề và Yêu cầu cần đạt (GDPT 2018)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Chọn Cấp học, Khối lớp, Môn học, Chủ đề và Yêu cầu cần đạt rồi bấm "Áp dụng cho các câu đã chọn" (hoặc chỉnh riêng ở từng câu hỏi).
            </p>
          </div>
          <button
            type="button"
            disabled={!activeFileRecord || activeDrafts.length === 0}
            onClick={handleApplyCurriculumLinkToSelected}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Áp dụng Chủ đề & YCCĐ cho câu đã chọn ({stats.selected})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cấp học</label>
            <select
              value={selectedLevelId}
              onChange={(e) => {
                const lv = e.target.value as EducationLevelId;
                setSelectedLevelId(lv);
                const r = getRuleSetForLevel(lv);
                setSelectedGrade(r.grades[0]);
                setSelectedSubject(r.subjects[0]);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
            >
                {Object.values(ASSESSMENT_RULES_BY_LEVEL)
                  .filter((r) => allowedImportLevels.includes(r.levelId))
                  .map((r) => (
                    <option key={r.levelId} value={r.levelId}>
                      {r.shortName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Khối lớp</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value) as GradeNumber)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
              >
                {currentRuleSet.grades.map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
              >
                {currentRuleSet.subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Chủ đề / Mạch nội dung chương trình
              </label>
              <select
                value={activeCurriculumTopic?.id || ''}
                onChange={(e) => {
                  setSelectedTopicId(e.target.value);
                  setSelectedOutcomeCode('');
                  setSelectedLessonName('');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
              >
                {matchingTopics.length === 0 ? (
                  <option value="">Chủ đề chung môn {selectedSubject} Lớp {selectedGrade}</option>
                ) : (
                  matchingTopics.map((t) => {
                    const rawTitle = t.chapterTitle || t.topicTitle;
                    return (
                      <option key={t.id} value={t.id} title={rawTitle}>
                        {formatTopicOptionDisplay(rawTitle, 58)} ({t.semester === 'HK2' ? 'HKII' : 'HKI'})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mã Yêu cầu cần đạt (YCCĐ)
            </label>
            <select
              value={
                selectedOutcomeCode ||
                activeCurriculumTopic?.learningOutcomes?.[0]?.code ||
                ''
              }
              onChange={(e) => setSelectedOutcomeCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
            >
              {(activeCurriculumTopic?.learningOutcomes || []).map((lo) => (
                <option key={lo.code} value={lo.code}>
                  [{lo.code}] {cleanLearningOutcomeText(lo.description).slice(0, 65)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* THANH ĐIỀU KHIỂN TỔNG HỢP TRƯỚC KHI ĐỐI CHIẾU 2 CỘT (BƯỚC 5, 7, 8) */}
      {activeFileRecord && activeFileRecord.status === 'READY' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 tabular-nums">
            <span className="font-bold text-slate-900">
              Tài liệu: {activeFileRecord.fileName}
            </span>
            <span>·</span>
            <span>
              Đã chọn: <strong className="text-blue-700">{stats.selected}/{stats.total}</strong> câu
            </span>
            <span>·</span>
            <span>
              Đáp án gốc: <strong className="text-emerald-700">{stats.fromDocAnswer}</strong>
            </span>
            <span>·</span>
            <span>
              Chưa có đáp án: <strong className="text-amber-700">{stats.missingAnswer}</strong>
            </span>
            <span>·</span>
            <span>
              AI đề xuất: <strong className="text-amber-700">{stats.aiSuggestedAnswer}</strong>
            </span>
            <span>·</span>
            <span>
              Đã xác nhận mức độ: <strong className="text-slate-900">{stats.cognitiveConfirmed}/{stats.total}</strong>
            </span>
            <span>·</span>
            <span>
              Trùng lặp: <strong className={stats.duplicates > 0 ? 'text-rose-700' : 'text-slate-700'}>{stats.duplicates}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRequestAiSuggestionsForMissingAnswers}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Gợi ý đáp án bằng AI cho những câu tài liệu gốc không có đáp án và gắn nhãn cần xác minh"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI gợi ý đáp án cho câu thiếu</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAllSelectedCognitiveLevels}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Xác nhận mức độ các câu đã chọn</span>
            </button>

            <button
              type="button"
              onClick={handleRunDuplicateCheck}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Kiểm tra trùng ({stats.duplicates})</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSelectedAsDrafts}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu bản nháp ({stats.selected} câu)</span>
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 4 & BƯỚC 5: HIỂN THỊ KẾT QUẢ THEO HAI CỘT (TRÁI: TÀI LIỆU GỐC · PHẢI: CÂU HỎI ĐÃ TRÍCH XUẤT) */}
      {activeFileRecord && activeFileRecord.status === 'ERROR' ? (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-8 text-center space-y-3">
          <FileWarning className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-rose-950">
            Không thể trích xuất tệp "{activeFileRecord.fileName}"
          </h3>
          <p className="text-xs text-rose-900 max-w-xl mx-auto leading-relaxed">
            {activeFileRecord.errorMessage}
          </p>
          <p className="text-xs text-rose-700">
            Hệ thống đã chặn tệp lỗi an toàn, không sinh dữ liệu giả và không lưu câu hỏi lỗi vào Ngân hàng. Vui lòng kiểm tra lại tệp nguồn hoặc chọn tệp khác.
          </p>
        </div>
      ) : activeFileRecord && activeFileRecord.pages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ==================== CỘT BÊN TRÁI: XEM TRƯỚC TÀI LIỆU GỐC (5 CỘT) ==================== */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-700" />
                  <span>CỘT TRÁI: TÀI LIỆU GỐC ({activeFileRecord.fileName})</span>
                </div>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {activeFileRecord.pages.length} trang
                </span>
              </div>

              {/* Bộ lọc trang & chế độ xem cột trái */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveLeftPageFilter('ALL')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                      activeLeftPageFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả trang ({activeFileRecord.pages.length})
                  </button>
                  {activeFileRecord.pages.map((p) => (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => setActiveLeftPageFilter(p.pageNumber)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                        activeLeftPageFilter === p.pageNumber
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Trang {p.pageNumber}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLeftViewTab('FULL_PAGE')}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                      leftViewTab === 'FULL_PAGE'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Văn bản & Trang
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftViewTab('MEDIA_TABLES')}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                      leftViewTab === 'MEDIA_TABLES'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Ảnh, Bảng & Công thức
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-5 max-h-[820px] overflow-y-auto">
              {activeFileRecord.pages
                .filter(
                  (p) =>
                    activeLeftPageFilter === 'ALL' || p.pageNumber === activeLeftPageFilter
                )
                .map((page) => {
                  const focusedDraft = activeDrafts.find((d) => d.draftId === focusedDraftId);
                  return (
                    <div
                      key={page.pageNumber}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                        <span className="font-bold text-slate-800">
                          Trang {page.pageNumber} · Nguồn: {activeFileRecord.fileName}
                        </span>
                        <span className="text-[11px] text-slate-500 tabular-nums">
                          {page.images.length} hình · {page.tables.length} bảng ·{' '}
                          {page.formulas.length} công thức
                        </span>
                      </div>

                      {/* Hiển thị Hình ảnh gốc trong trang (Không làm mất hình ảnh) */}
                      {page.images.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                            <span>Hình ảnh trích xuất từ Trang {page.pageNumber}:</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {page.images.map((img) => (
                              <div
                                key={img.id}
                                className="border border-slate-200 rounded-lg p-2.5 bg-white space-y-1.5"
                              >
                                <img
                                  src={img.dataUrl}
                                  alt={img.caption || img.fileName}
                                  referrerPolicy="no-referrer"
                                  className="max-h-52 w-auto mx-auto object-contain rounded"
                                />
                                <div className="text-[11px] text-center text-slate-600 font-medium">
                                  {img.caption || img.fileName}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hiển thị Bảng biểu gốc trong trang (Không làm mất bảng biểu) */}
                      {page.tables.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <TableIcon className="w-3.5 h-3.5 text-blue-700" />
                            <span>Bảng biểu trích xuất từ Trang {page.pageNumber}:</span>
                          </div>
                          {page.tables.map((tbl) => (
                            <div
                              key={tbl.id}
                              className="border border-slate-200 rounded-lg bg-white overflow-x-auto"
                            >
                              <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] font-semibold text-slate-800">
                                {tbl.title}
                              </div>
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200">
                                    {tbl.headers.map((h, hIdx) => (
                                      <th
                                        key={hIdx}
                                        className="px-2.5 py-1.5 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0"
                                      >
                                        <MathFormulaView text={h} />
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tbl.rows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className="border-b border-slate-100 last:border-b-0"
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="px-2.5 py-1.5 text-slate-700 border-r border-slate-100 last:border-r-0"
                                        >
                                          <MathFormulaView text={cell} />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Hiển thị Ngữ liệu đọc hiểu chung nếu có */}
                      {page.passages && page.passages.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                            <span>Ngữ liệu đọc hiểu chung được nhận diện:</span>
                          </div>
                          {page.passages.map((pas) => (
                            <div
                              key={pas.groupKey}
                              className="p-3 rounded-lg border border-blue-200 bg-blue-50/40 text-xs space-y-1"
                            >
                              <div className="font-bold text-blue-950">{pas.title}</div>
                              <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                                {pas.content}
                              </p>
                              {pas.author && (
                                <div className="text-[11px] italic text-slate-600 text-right">
                                  — {pas.author}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Hiển thị văn bản gốc của trang & làm nổi bật câu đang đối chiếu */}
                      {leftViewTab === 'FULL_PAGE' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[11px] font-bold text-slate-700">
                              Nội dung văn bản gốc / OCR (Trang {page.pageNumber}):
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingPageNumber(
                                  editingPageNumber === page.pageNumber ? null : page.pageNumber
                                )
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>
                                {editingPageNumber === page.pageNumber
                                  ? 'Đóng chỉnh sửa văn bản'
                                  : 'Sửa văn bản OCR & Tách lại câu'}
                              </span>
                            </button>
                          </div>

                          {editingPageNumber === page.pageNumber ? (
                            <div className="space-y-2 p-3 rounded-lg border border-blue-300 bg-blue-50/40">
                              <textarea
                                rows={10}
                                value={page.rawText}
                                onChange={(e) => {
                                  const nextText = e.target.value;
                                  if (!activeFileRecord) return;
                                  updateFileRecord(activeFileRecord.fileId, (rec) => ({
                                    ...rec,
                                    pages: rec.pages.map((p) =>
                                      p.pageNumber === page.pageNumber
                                        ? { ...p, rawText: nextText }
                                        : p
                                    ),
                                  }));
                                }}
                                placeholder="Nội dung văn bản trích xuất từ trang PDF/Ảnh..."
                                className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPageNumber(null)}
                                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                                >
                                  Đóng
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReparseActiveFileFromEditedPageText(
                                      page.pageNumber,
                                      page.rawText
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Phân tích & Tách lại câu hỏi từ văn bản này</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                              <MathFormulaView text={page.rawText} />
                            </div>
                          )}

                          {focusedDraft && focusedDraft.pageNumber === page.pageNumber && (
                            <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/70 text-xs space-y-1">
                              <div className="font-bold text-amber-950">
                                Đang đối chiếu đoạn gốc của {focusedDraft.questionLabel} (Trang{' '}
                                {focusedDraft.pageNumber}):
                              </div>
                              <div className="text-slate-800 whitespace-pre-wrap">
                                <MathFormulaView text={focusedDraft.sourceSnippet} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hiển thị danh sách công thức toán trích xuất */}
                      {page.formulas.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-700">
                            Công thức toán đã nhận diện trên Trang {page.pageNumber}:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {page.formulas.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="px-2.5 py-1 rounded border border-slate-200 bg-white text-xs text-slate-900"
                              >
                                <MathFormulaView text={`$${f.replace(/^\$|\$$/g, '')}$`} />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ==================== CỘT BÊN PHẢI: DANH SÁCH CÂU HỎI ĐÃ TRÍCH XUẤT (7 CỘT) ==================== */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>
                    CỘT PHẢI: CÂU HỎI ĐÃ TRÍCH XUẤT ({filteredDrafts.length}/{activeDrafts.length})
                  </span>
                </div>

                {/* Chọn tất cả / Bỏ chọn tất cả */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      updateFileRecord(activeFileRecord.fileId, (rec) => ({
                        ...rec,
                        extractedQuestions: rec.extractedQuestions.map((q) => ({
                          ...q,
                          selectedForImport: true,
                        })),
                      }))
                    }
                    className="text-blue-700 hover:underline font-semibold cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateFileRecord(activeFileRecord.fileId, (rec) => ({
                        ...rec,
                        extractedQuestions: rec.extractedQuestions.map((q) => ({
                          ...q,
                          selectedForImport: false,
                        })),
                      }))
                    }
                    className="text-slate-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              {/* Thanh lọc câu hỏi bên phải */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setRightQuestionFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    rightQuestionFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({activeDrafts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRightQuestionFilter('MISSING_OR_AI_ANSWER')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    rightQuestionFilter === 'MISSING_OR_AI_ANSWER'
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thiếu đáp án / AI đề xuất ({stats.missingAnswer + stats.aiSuggestedAnswer})
                </button>
                <button
                  type="button"
                  onClick={() => setRightQuestionFilter('UNCONFIRMED_COGNITIVE')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    rightQuestionFilter === 'UNCONFIRMED_COGNITIVE'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chưa xác nhận mức độ ({stats.total - stats.cognitiveConfirmed})
                </button>
                <button
                  type="button"
                  onClick={() => setRightQuestionFilter('HAS_MEDIA_OR_PASSAGE')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    rightQuestionFilter === 'HAS_MEDIA_OR_PASSAGE'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Có Ảnh / Bảng / Công thức / Ngữ liệu ({stats.withPassageOrMedia})
                </button>
                <button
                  type="button"
                  onClick={() => setRightQuestionFilter('DUPLICATE')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    rightQuestionFilter === 'DUPLICATE'
                      ? 'bg-white text-rose-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trùng lặp ({stats.duplicates})
                </button>
              </div>
            </div>

            {/* Danh sách thẻ câu hỏi đã nhận diện */}
            <div className="p-4 space-y-4 max-h-[820px] overflow-y-auto">
              {filteredDrafts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Không có câu hỏi nào khớp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredDrafts.map((q) => {
                  const isFocused = focusedDraftId === q.draftId;
                  const isEditing = editingDraftId === q.draftId;
                  const ruleForQ = getRuleSetForLevel(q.levelId);
                  const allowedFormats = getAllowedFormatsForContext(
                    q.levelId,
                    q.grade,
                    q.subject
                  );

                  return (
                    <div
                      key={q.draftId}
                      onClick={() => setFocusedDraftId(q.draftId)}
                      className={`rounded-xl border p-4 space-y-3 transition-colors ${
                        isFocused
                          ? 'border-blue-600 bg-blue-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Dòng đầu: Checkbox chọn nhập + Nhãn câu + Nguồn & Số trang + Nút sửa */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={q.selectedForImport}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateDraftInActiveFile(q.draftId, (prev) => ({
                                ...prev,
                                selectedForImport: e.target.checked,
                              }));
                            }}
                            className="rounded border-slate-300 text-blue-600 cursor-pointer"
                          />
                          <span className="font-bold text-slate-900">{q.questionLabel}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-medium">
                            Trang {q.pageNumber} ({q.sourceFileName})
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-blue-700 font-semibold">
                            {getFormatLabel(q.format)}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono font-semibold text-slate-800 tabular-nums">
                            {q.points} điểm
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDraftId(isEditing ? null : q.draftId);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border cursor-pointer ${
                              isEditing
                                ? 'border-blue-600 bg-blue-700 text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isEditing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa câu'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Khối liên kết Ngữ liệu đọc hiểu chung (nếu có) */}
                      {q.sharedPassage && (
                        <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 text-xs space-y-1">
                          <div className="font-bold text-blue-950 flex items-center justify-between">
                            <span>
                              Liên kết ngữ liệu đọc hiểu chung ({q.sharedPassageGroupId || 'PASSAGE_1'})
                            </span>
                            {q.sharedPassageAuthor && (
                              <span className="text-[11px] font-normal italic text-blue-800">
                                Nguồn: {q.sharedPassageAuthor}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 line-clamp-2">{q.sharedPassage}</p>
                        </div>
                      )}

                      {/* Nội dung câu dẫn (Stem) có hiển thị công thức LaTeX */}
                      <div className="text-sm text-slate-900 leading-relaxed font-medium">
                        <MathFormulaView text={q.stem} />
                      </div>

                      {/* Hiển thị & Thêm / Bớt nhanh Phương án trả lời A, B, C, D cho câu Trắc nghiệm */}
                      {(q.format === QuestionFormatCode.MCQ_SINGLE ||
                        q.format === QuestionFormatCode.MCQ_MULTIPLE ||
                        (q.options.length > 0 &&
                          q.format !== QuestionFormatCode.TRUE_FALSE_CLUSTER)) && (
                        <div className="space-y-2 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-700">
                                Các phương án trắc nghiệm (Bấm vào phương án để chọn đáp án đúng):
                              </span>
                              {q.options.length < 4 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                                  Thiếu phương án ({q.options.length}/4)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {q.options.length < 4 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateDraftInActiveFile(q.draftId, (prev) => {
                                      const nextOpts = padMcqOptionsToFour(prev.options);
                                      return {
                                        ...prev,
                                        options: nextOpts,
                                        extractionWarnings: prev.extractionWarnings.filter(
                                          (w) => !w.includes('phương án lựa chọn')
                                        ),
                                      };
                                    });
                                    setEditingDraftId(q.draftId);
                                  }}
                                  className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer"
                                >
                                  + Đủ 4 phương án (A–D)
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDraftInActiveFile(q.draftId, (prev) => {
                                    const nextLetter = String.fromCharCode(
                                      65 + prev.options.length
                                    );
                                    const nextOpts = [
                                      ...relabelMcqOptions(prev.options),
                                      `${nextLetter}. Phương án ${nextLetter}`,
                                    ];
                                    return {
                                      ...prev,
                                      options: nextOpts,
                                      extractionWarnings:
                                        nextOpts.length >= 4
                                          ? prev.extractionWarnings.filter(
                                              (w) => !w.includes('phương án lựa chọn')
                                            )
                                          : prev.extractionWarnings,
                                    };
                                  });
                                  setEditingDraftId(q.draftId);
                                }}
                                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold hover:bg-blue-100 cursor-pointer"
                              >
                                + Thêm phương án ({String.fromCharCode(65 + q.options.length)})
                              </button>
                            </div>
                          </div>

                          {q.options.length === 0 ? (
                            <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 flex items-center justify-between gap-2">
                              <span>
                                Chưa nhận diện được phương án A, B, C, D cho câu trắc nghiệm này.
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDraftInActiveFile(q.draftId, (prev) => ({
                                    ...prev,
                                    options: padMcqOptionsToFour(prev.options),
                                    extractionWarnings: prev.extractionWarnings.filter(
                                      (w) => !w.includes('phương án lựa chọn')
                                    ),
                                  }));
                                  setEditingDraftId(q.draftId);
                                }}
                                className="px-2.5 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 shrink-0 cursor-pointer"
                              >
                                + Khởi tạo 4 phương án A, B, C, D
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isCorrectOpt = q.correctOptionIndices.includes(oIdx);
                                return (
                                  <div
                                    key={oIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateDraftInActiveFile(q.draftId, (prev) => {
                                        const isMulti =
                                          prev.format === QuestionFormatCode.MCQ_MULTIPLE;
                                        const nextIndices = isMulti
                                          ? prev.correctOptionIndices.includes(oIdx)
                                            ? prev.correctOptionIndices.filter((i) => i !== oIdx)
                                            : [...prev.correctOptionIndices, oIdx].sort()
                                          : [oIdx];
                                        const nextAns = isMulti
                                          ? nextIndices
                                              .map(
                                                (i) =>
                                                  prev.options[i] || String.fromCharCode(65 + i)
                                              )
                                              .join('; ')
                                          : prev.options[oIdx] || String.fromCharCode(65 + oIdx);
                                        return {
                                          ...prev,
                                          correctOptionIndices: nextIndices,
                                          correctAnswer: nextAns,
                                          hasExplicitAnswerInDoc: true,
                                          answerOrigin: 'TEACHER_CONFIRMED',
                                          extractionWarnings: prev.extractionWarnings.filter(
                                            (w) => !w.includes('Tài liệu gốc không có đáp án')
                                          ),
                                        };
                                      });
                                    }}
                                    title="Bấm để chọn phương án này làm đáp án đúng"
                                    className={`p-2 rounded-lg border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                                      isCorrectOpt && q.answerOrigin !== 'MISSING'
                                        ? 'border-emerald-400 bg-emerald-50/80 font-semibold text-emerald-950'
                                        : 'border-slate-200 bg-slate-50/60 text-slate-800 hover:border-blue-300 hover:bg-blue-50/30'
                                    }`}
                                  >
                                    <span className="flex-1 min-w-0 break-words">
                                      <MathFormulaView text={opt} />
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {isCorrectOpt && q.answerOrigin !== 'MISSING' && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-600 text-white">
                                          Đúng
                                        </span>
                                      )}
                                      {q.options.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateDraftInActiveFile(q.draftId, (prev) => {
                                              const filtered = prev.options.filter(
                                                (_, idx) => idx !== oIdx
                                              );
                                              const relabeled = relabelMcqOptions(filtered);
                                              const nextIndices = prev.correctOptionIndices
                                                .filter((i) => i !== oIdx)
                                                .map((i) => (i > oIdx ? i - 1 : i));
                                              const isMulti =
                                                prev.format === QuestionFormatCode.MCQ_MULTIPLE;
                                              const nextAns =
                                                nextIndices.length > 0
                                                  ? isMulti
                                                    ? nextIndices
                                                        .map((i) => relabeled[i] || '')
                                                        .filter(Boolean)
                                                        .join('; ')
                                                    : relabeled[nextIndices[0]] || ''
                                                  : prev.correctOptionIndices.includes(oIdx)
                                                  ? ''
                                                  : prev.correctAnswer;
                                              return {
                                                ...prev,
                                                options: relabeled,
                                                correctOptionIndices: nextIndices,
                                                correctAnswer: nextAns,
                                              };
                                            });
                                          }}
                                          title="Xóa (bớt) phương án này"
                                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hiển thị & Chỉnh sửa nhanh các mệnh đề Đúng - Sai a, b, c, d ngay trên thẻ câu hỏi */}
                      {(q.subStatements.length > 0 ||
                        q.format === QuestionFormatCode.TRUE_FALSE_CLUSTER) && (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">
                              Các mệnh đề Đúng – Sai (Bấm trực tiếp Đúng / Sai ở từng ý để sửa đáp án):
                            </span>
                            {q.subStatements.length === 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDraftInActiveFile(q.draftId, (prev) => {
                                    const initSubs =
                                      prev.options.length > 0
                                        ? prev.options.map((opt, idx) => ({
                                            label:
                                              ['a', 'b', 'c', 'd'][idx] ||
                                              String.fromCharCode(97 + idx),
                                            statement: opt.replace(/^[A-Da-d][.)]\s*/, '').trim(),
                                            isTrue: idx % 2 === 0,
                                          }))
                                        : [
                                            { label: 'a', statement: 'Mệnh đề a', isTrue: true },
                                            { label: 'b', statement: 'Mệnh đề b', isTrue: false },
                                            { label: 'c', statement: 'Mệnh đề c', isTrue: true },
                                            { label: 'd', statement: 'Mệnh đề d', isTrue: false },
                                          ];
                                    const summary = formatSubStatementsAnswerSummary(initSubs);
                                    return {
                                      ...prev,
                                      format: QuestionFormatCode.TRUE_FALSE_CLUSTER,
                                      subStatements: initSubs,
                                      options: [],
                                      correctAnswer: summary,
                                      hasExplicitAnswerInDoc: true,
                                      answerOrigin: 'TEACHER_CONFIRMED',
                                      extractionWarnings: prev.extractionWarnings.filter(
                                        (w) => !w.includes('Tài liệu gốc không có đáp án')
                                      ),
                                    };
                                  });
                                }}
                                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold hover:bg-blue-100 cursor-pointer"
                              >
                                + Khởi tạo 4 mệnh đề a, b, c, d
                              </button>
                            )}
                          </div>

                          {q.subStatements.map((sub, sIdx) => {
                            const hasAnswerSet =
                              q.hasExplicitAnswerInDoc || q.answerOrigin !== 'MISSING';
                            return (
                              <div
                                key={sIdx}
                                className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <span className="text-slate-900">
                                  <strong className="text-blue-900">{sub.label})</strong>{' '}
                                  <MathFormulaView text={sub.statement} />
                                </span>

                                <div
                                  className="flex items-center gap-1.5 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDraftInActiveFile(q.draftId, (prev) => {
                                        const nextSubs = prev.subStatements.map((item, i) =>
                                          i === sIdx ? { ...item, isTrue: true } : item
                                        );
                                        const summary = formatSubStatementsAnswerSummary(nextSubs);
                                        return {
                                          ...prev,
                                          subStatements: nextSubs,
                                          correctAnswer: summary,
                                          hasExplicitAnswerInDoc: true,
                                          answerOrigin: 'TEACHER_CONFIRMED',
                                          extractionWarnings: prev.extractionWarnings.filter(
                                            (w) => !w.includes('Tài liệu gốc không có đáp án')
                                          ),
                                        };
                                      });
                                    }}
                                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] border transition cursor-pointer ${
                                      hasAnswerSet && sub.isTrue
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                        : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                                    }`}
                                  >
                                    Đúng
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDraftInActiveFile(q.draftId, (prev) => {
                                        const nextSubs = prev.subStatements.map((item, i) =>
                                          i === sIdx ? { ...item, isTrue: false } : item
                                        );
                                        const summary = formatSubStatementsAnswerSummary(nextSubs);
                                        return {
                                          ...prev,
                                          subStatements: nextSubs,
                                          correctAnswer: summary,
                                          hasExplicitAnswerInDoc: true,
                                          answerOrigin: 'TEACHER_CONFIRMED',
                                          extractionWarnings: prev.extractionWarnings.filter(
                                            (w) => !w.includes('Tài liệu gốc không có đáp án')
                                          ),
                                        };
                                      });
                                    }}
                                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] border transition cursor-pointer ${
                                      hasAnswerSet && !sub.isTrue
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                        : 'bg-white text-slate-600 border-slate-300 hover:border-rose-400 hover:text-rose-700'
                                    }`}
                                  >
                                    Sai
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Hiển thị Hình ảnh, Bảng biểu, Công thức đính kèm của câu hỏi */}
                      {q.attachments.filter((a) => a.type === 'IMAGE' || a.type === 'TABLE')
                        .length > 0 && (
                        <div className="space-y-2 pt-1">
                          {q.attachments
                            .filter((a) => a.type === 'IMAGE' && a.fileUrl)
                            .map((imgAtt) => (
                              <div
                                key={imgAtt.id}
                                className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-3 text-xs"
                              >
                                <img
                                  src={imgAtt.fileUrl}
                                  alt={imgAtt.title}
                                  referrerPolicy="no-referrer"
                                  className="h-16 w-auto object-contain rounded border border-slate-200 bg-white p-1"
                                />
                                <div>
                                  <div className="font-semibold text-slate-800">
                                    Đã gắn hình ảnh: {imgAtt.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Bảo toàn hình ảnh gốc khi lưu vào Ngân hàng câu hỏi
                                  </div>
                                </div>
                              </div>
                            ))}

                          {q.attachments
                            .filter((a) => a.type === 'TABLE' && a.tableData)
                            .map((tblAtt) => (
                              <div
                                key={tblAtt.id}
                                className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1 overflow-x-auto"
                              >
                                <div className="font-semibold text-slate-800">
                                  Đã gắn bảng biểu: {tblAtt.title} ({tblAtt.tableData?.headers.join(' | ')})
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* KHỐI KIỂM SOÁT ĐÁP ÁN & MỨC ĐỘ NHẬN THỨC (TUÂN THỦ NGHIÊM NGẶT MỤC III) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Cột 1: Trạng thái Đáp án (Không tự bịa đáp án / Ghi rõ nếu do AI đề xuất) */}
                        <div
                          className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                            q.answerOrigin === 'MISSING'
                              ? 'border-amber-300 bg-amber-50/70 text-amber-950'
                              : q.answerOrigin === 'AI_SUGGESTED'
                              ? 'border-amber-400 bg-amber-50 text-amber-950'
                              : 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between gap-2">
                            <span>
                              {q.answerOrigin === 'FROM_DOCUMENT' &&
                                'Đáp án trích xuất từ tài liệu gốc'}
                              {q.answerOrigin === 'TEACHER_CONFIRMED' &&
                                'Đáp án đã được giáo viên xác nhận'}
                              {q.answerOrigin === 'AI_SUGGESTED' &&
                                'Đáp án do AI đề xuất – cần xác minh'}
                              {q.answerOrigin === 'MISSING' &&
                                'Tài liệu gốc không có đáp án (Chưa điền)'}
                            </span>

                            {q.answerOrigin === 'MISSING' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const aiSug = buildAiSuggestedAnswerForQuestion({
                                    stem: q.stem,
                                    options: q.options,
                                    subStatements: q.subStatements,
                                    format: q.format,
                                  });
                                  updateDraftInActiveFile(q.draftId, (prev) => ({
                                    ...prev,
                                    answerOrigin: 'AI_SUGGESTED',
                                    correctAnswer: aiSug.suggestedAnswer,
                                    aiSuggestedAnswer: aiSug.suggestedAnswer,
                                    aiSuggestedExplanation: aiSug.explanation,
                                    gradingGuide: aiSug.explanation,
                                  }));
                                }}
                                className="px-2 py-0.5 text-[11px] font-semibold bg-amber-200 hover:bg-amber-300 text-amber-950 rounded cursor-pointer"
                              >
                                Gợi ý bằng AI
                              </button>
                            )}

                            {q.answerOrigin === 'AI_SUGGESTED' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDraftInActiveFile(q.draftId, (prev) => ({
                                    ...prev,
                                    hasExplicitAnswerInDoc: true,
                                    answerOrigin: 'TEACHER_CONFIRMED',
                                    correctAnswer: prev.correctAnswer
                                      .replace(/\s*\(Đáp án do AI đề xuất – cần xác minh\)/g, '')
                                      .trim(),
                                    extractionWarnings: prev.extractionWarnings.filter(
                                      (w) => !w.includes('Tài liệu gốc không có đáp án')
                                    ),
                                  }));
                                }}
                                className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded cursor-pointer"
                              >
                                Xác nhận đáp án
                              </button>
                            )}
                          </div>

                          <div className="text-slate-800">
                            {q.correctAnswer ? (
                              <MathFormulaView text={q.correctAnswer} />
                            ) : (
                              <span className="italic text-amber-900">
                                Hệ thống không tự bịa đáp án khi tài liệu không cung cấp. Hãy bấm trực tiếp Đúng/Sai hoặc bấm "Chỉnh sửa câu" để nhập đáp án.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cột 2: Xác nhận Mức độ nhận thức (Không tự xác nhận mức độ nhận thức) */}
                        <div
                          className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                            q.cognitiveConfirmed
                              ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                              : 'border-amber-300 bg-amber-50/70 text-amber-950'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between gap-2">
                            <span>
                              {q.cognitiveConfirmed
                                ? `Đã xác nhận mức độ: ${getCognitiveShortLabel(q.cognitiveLevel)}`
                                : 'Chưa xác nhận mức độ nhận thức'}
                            </span>
                            {!q.cognitiveConfirmed && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDraftInActiveFile(q.draftId, (prev) => ({
                                    ...prev,
                                    cognitiveConfirmed: true,
                                    extractionWarnings: prev.extractionWarnings.filter(
                                      (w) =>
                                        !w.includes(
                                          'Mức độ nhận thức chưa được tự động xác nhận'
                                        )
                                    ),
                                  }));
                                }}
                                className="px-2 py-0.5 text-[11px] font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded cursor-pointer"
                              >
                                Xác nhận mức này
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-600 shrink-0">
                              Chọn mức độ:
                            </span>
                            <select
                              value={q.cognitiveLevel}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const newCog = e.target.value as typeof q.cognitiveLevel;
                                updateDraftInActiveFile(q.draftId, (prev) => ({
                                  ...prev,
                                  cognitiveLevel: newCog,
                                  cognitiveConfirmed: true,
                                  extractionWarnings: prev.extractionWarnings.filter(
                                    (w) =>
                                      !w.includes(
                                        'Mức độ nhận thức chưa được tự động xác nhận'
                                      )
                                  ),
                                }));
                              }}
                              className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                            >
                              {ruleForQ.cognitiveLevels.map((cl) => (
                                <option key={cl.code} value={cl.code}>
                                  {cl.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Cảnh báo trùng lặp hoặc nội dung trích xuất không chắc chắn */}
                      {(q.duplicateCheck?.isDuplicate || q.extractionWarnings.length > 0) && (
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-700 space-y-1">
                          {q.duplicateCheck?.isDuplicate && (
                            <div className="font-bold text-rose-700 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                Cảnh báo trùng lặp ({q.duplicateCheck.maxSimilarityPercent}%) với câu hỏi{' '}
                                {q.duplicateCheck.matchedQuestionCode}: "{q.duplicateCheck.matchedQuestionStem?.slice(0, 85)}..."
                              </span>
                            </div>
                          )}
                          {q.extractionWarnings.map((w, wIdx) => (
                            <div key={wIdx} className="flex items-start gap-1.5 text-slate-600">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Dòng hiển thị Chủ đề & Mã YCCĐ đã gắn */}
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <div>
                          Chương trình: <strong className="text-slate-700">{q.subject} Lớp {q.grade}</strong> · Chủ đề:{' '}
                          <strong className="text-slate-700">{q.topicTitle}</strong> · Mã YCCĐ:{' '}
                          <strong className="font-mono text-blue-700">[{q.learningOutcomeCode}]</strong>
                        </div>
                        <div>Trạng thái lưu: Bản nháp (DRAFT)</div>
                      </div>

                      {/* KHUNG CHỈNH SỬA CHI TIẾT TỪNG CÂU HỎI (BƯỚC 5) */}
                      {isEditing && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-slate-50/80 p-3.5 rounded-lg text-xs"
                        >
                          <div className="font-bold text-slate-900">
                            Chỉnh sửa chi tiết {q.questionLabel} (Trang {q.pageNumber})
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Dạng câu hỏi
                              </label>
                              <select
                                value={q.format}
                                onChange={(e) => {
                                  const nextFmt = e.target.value as QuestionFormatCode;
                                  updateDraftInActiveFile(q.draftId, (prev) => {
                                    if (
                                      nextFmt === QuestionFormatCode.TRUE_FALSE_CLUSTER &&
                                      prev.subStatements.length === 0
                                    ) {
                                      const nextSubs =
                                        prev.options.length > 0
                                          ? prev.options.map((opt, idx) => ({
                                              label:
                                                ['a', 'b', 'c', 'd'][idx] ||
                                                String.fromCharCode(97 + idx),
                                              statement: opt
                                                .replace(/^[A-Da-d][.)]\s*/, '')
                                                .trim(),
                                              isTrue: idx % 2 === 0,
                                            }))
                                          : [
                                              { label: 'a', statement: 'Mệnh đề a', isTrue: true },
                                              { label: 'b', statement: 'Mệnh đề b', isTrue: false },
                                              { label: 'c', statement: 'Mệnh đề c', isTrue: true },
                                              { label: 'd', statement: 'Mệnh đề d', isTrue: false },
                                            ];
                                      return {
                                        ...prev,
                                        format: nextFmt,
                                        subStatements: nextSubs,
                                        correctAnswer: formatSubStatementsAnswerSummary(nextSubs),
                                        hasExplicitAnswerInDoc: true,
                                        answerOrigin: 'TEACHER_CONFIRMED',
                                        extractionWarnings: prev.extractionWarnings.filter(
                                          (w) => !w.includes('Tài liệu gốc không có đáp án')
                                        ),
                                      };
                                    }
                                    if (
                                      (nextFmt === QuestionFormatCode.MCQ_SINGLE ||
                                        nextFmt === QuestionFormatCode.MCQ_MULTIPLE) &&
                                      prev.options.length === 0
                                    ) {
                                      const initOpts =
                                        prev.subStatements.length > 0
                                          ? prev.subStatements.map(
                                              (st, idx) =>
                                                `${String.fromCharCode(65 + idx)}. ${st.statement}`
                                            )
                                          : padMcqOptionsToFour([]);
                                      return {
                                        ...prev,
                                        format: nextFmt,
                                        options: initOpts,
                                      };
                                    }
                                    return {
                                      ...prev,
                                      format: nextFmt,
                                    };
                                  });
                                }}
                                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                              >
                                {allowedFormats.map((f) => (
                                  <option key={f.code} value={f.code}>
                                    {f.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Điểm số
                              </label>
                              <input
                                type="number"
                                step="0.05"
                                min="0.1"
                                value={q.points}
                                onChange={(e) =>
                                  updateDraftInActiveFile(q.draftId, (prev) => ({
                                    ...prev,
                                    points: Math.max(0.05, Number(e.target.value) || 0.25),
                                  }))
                                }
                                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Số trang trong tài liệu gốc
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={q.pageNumber}
                                onChange={(e) =>
                                  updateDraftInActiveFile(q.draftId, (prev) => ({
                                    ...prev,
                                    pageNumber: Math.max(1, Number(e.target.value) || 1),
                                  }))
                                }
                                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Nội dung câu hỏi (Hỗ trợ công thức LaTeX $...$)
                            </label>
                            <textarea
                              rows={3}
                              value={q.stem}
                              onChange={(e) =>
                                updateDraftInActiveFile(q.draftId, (prev) => ({
                                  ...prev,
                                  stem: e.target.value,
                                }))
                              }
                              className="w-full rounded border border-slate-300 bg-white p-2 text-xs"
                            />
                          </div>

                          {/* Chỉnh sửa, Thêm / Bớt phương án lựa chọn A, B, C, D cho câu Trắc nghiệm */}
                          {(q.format === QuestionFormatCode.MCQ_SINGLE ||
                            q.format === QuestionFormatCode.MCQ_MULTIPLE ||
                            (q.options.length > 0 &&
                              q.format !== QuestionFormatCode.TRUE_FALSE_CLUSTER)) && (
                            <div className="p-3 rounded-lg border border-blue-200 bg-white space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <label className="block font-bold text-slate-800">
                                    Các phương án lựa chọn (Chọn phương án đúng, sửa nội dung hoặc thêm / bớt đáp án)
                                  </label>
                                  {q.options.length < 4 && (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px]">
                                      Đang có {q.options.length}/4 phương án
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {q.options.length < 4 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateDraftInActiveFile(q.draftId, (prev) => {
                                          const nextOpts = padMcqOptionsToFour(prev.options);
                                          return {
                                            ...prev,
                                            options: nextOpts,
                                            extractionWarnings: prev.extractionWarnings.filter(
                                              (w) => !w.includes('phương án lựa chọn')
                                            ),
                                          };
                                        })
                                      }
                                      className="px-2.5 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer"
                                    >
                                      + Bổ sung đủ 4 phương án (A–D)
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateDraftInActiveFile(q.draftId, (prev) => {
                                        const nextLetter = String.fromCharCode(
                                          65 + prev.options.length
                                        );
                                        const nextOpts = [
                                          ...relabelMcqOptions(prev.options),
                                          `${nextLetter}. Phương án ${nextLetter}`,
                                        ];
                                        return {
                                          ...prev,
                                          options: nextOpts,
                                          extractionWarnings:
                                            nextOpts.length >= 4
                                              ? prev.extractionWarnings.filter(
                                                  (w) => !w.includes('phương án lựa chọn')
                                                )
                                              : prev.extractionWarnings,
                                        };
                                      })
                                    }
                                    className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold hover:bg-blue-100 cursor-pointer"
                                  >
                                    + Thêm phương án ({String.fromCharCode(65 + q.options.length)})
                                  </button>
                                </div>
                              </div>

                              {q.options.length === 0 ? (
                                <div className="p-2.5 rounded border border-amber-200 bg-amber-50 text-amber-900 flex items-center justify-between gap-2">
                                  <span>
                                    Câu hỏi này chưa có phương án lựa chọn nào. Bấm nút bên cạnh để tạo 4 phương án A, B, C, D.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateDraftInActiveFile(q.draftId, (prev) => ({
                                        ...prev,
                                        options: padMcqOptionsToFour(prev.options),
                                        extractionWarnings: prev.extractionWarnings.filter(
                                          (w) => !w.includes('phương án lựa chọn')
                                        ),
                                      }))
                                    }
                                    className="px-2.5 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 shrink-0 cursor-pointer"
                                  >
                                    + Tạo 4 phương án A, B, C, D
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {q.options.map((opt, optIdx) => {
                                    const isSelected = q.correctOptionIndices.includes(optIdx);
                                    const letter = String.fromCharCode(65 + optIdx);
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`flex items-center gap-2 p-1.5 rounded border ${
                                          isSelected && q.answerOrigin !== 'MISSING'
                                            ? 'border-emerald-300 bg-emerald-50/50'
                                            : 'border-slate-200 bg-slate-50/60'
                                        }`}
                                      >
                                        <input
                                          type={
                                            q.format === QuestionFormatCode.MCQ_MULTIPLE
                                              ? 'checkbox'
                                              : 'radio'
                                          }
                                          name={`correct-opt-${q.draftId}`}
                                          checked={isSelected && q.answerOrigin !== 'MISSING'}
                                          onChange={() =>
                                            updateDraftInActiveFile(q.draftId, (prev) => {
                                              const isMulti =
                                                prev.format === QuestionFormatCode.MCQ_MULTIPLE;
                                              const nextIndices = isMulti
                                                ? prev.correctOptionIndices.includes(optIdx)
                                                  ? prev.correctOptionIndices.filter(
                                                      (i) => i !== optIdx
                                                    )
                                                  : [...prev.correctOptionIndices, optIdx].sort()
                                                : [optIdx];
                                              const nextAns = isMulti
                                                ? nextIndices
                                                    .map((i) => prev.options[i] || '')
                                                    .filter(Boolean)
                                                    .join('; ')
                                                : prev.options[optIdx] || '';
                                              return {
                                                ...prev,
                                                correctOptionIndices: nextIndices,
                                                correctAnswer: nextAns,
                                                hasExplicitAnswerInDoc: true,
                                                answerOrigin: 'TEACHER_CONFIRMED',
                                                extractionWarnings:
                                                  prev.extractionWarnings.filter(
                                                    (w) =>
                                                      !w.includes('Tài liệu gốc không có đáp án')
                                                  ),
                                              };
                                            })
                                          }
                                          title="Đánh dấu là phương án đúng"
                                          className="cursor-pointer"
                                        />
                                        <span className="font-mono font-bold text-blue-900 w-5 shrink-0">
                                          {letter}.
                                        </span>
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            updateDraftInActiveFile(q.draftId, (prev) => {
                                              const nextOpts = [...prev.options];
                                              nextOpts[optIdx] = val;
                                              const isMulti =
                                                prev.format === QuestionFormatCode.MCQ_MULTIPLE;
                                              const nextAns = prev.correctOptionIndices.includes(
                                                optIdx
                                              )
                                                ? isMulti
                                                  ? prev.correctOptionIndices
                                                      .map((i) => nextOpts[i] || '')
                                                      .filter(Boolean)
                                                      .join('; ')
                                                  : val
                                                : prev.correctAnswer;
                                              return {
                                                ...prev,
                                                options: nextOpts,
                                                correctAnswer: nextAns,
                                              };
                                            });
                                          }}
                                          placeholder={`Nhập nội dung phương án ${letter}...`}
                                          className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateDraftInActiveFile(q.draftId, (prev) => {
                                              const isMulti =
                                                prev.format === QuestionFormatCode.MCQ_MULTIPLE;
                                              const nextIndices = isMulti
                                                ? prev.correctOptionIndices.includes(optIdx)
                                                  ? prev.correctOptionIndices.filter(
                                                      (i) => i !== optIdx
                                                    )
                                                  : [...prev.correctOptionIndices, optIdx].sort()
                                                : [optIdx];
                                              const nextAns = isMulti
                                                ? nextIndices
                                                    .map((i) => prev.options[i] || '')
                                                    .filter(Boolean)
                                                    .join('; ')
                                                : prev.options[optIdx] || '';
                                              return {
                                                ...prev,
                                                correctOptionIndices: nextIndices,
                                                correctAnswer: nextAns,
                                                hasExplicitAnswerInDoc: true,
                                                answerOrigin: 'TEACHER_CONFIRMED',
                                                extractionWarnings:
                                                  prev.extractionWarnings.filter(
                                                    (w) =>
                                                      !w.includes('Tài liệu gốc không có đáp án')
                                                  ),
                                              };
                                            })
                                          }
                                          className={`px-2 py-1 rounded text-[11px] font-bold border shrink-0 cursor-pointer ${
                                            isSelected && q.answerOrigin !== 'MISSING'
                                              ? 'bg-emerald-600 text-white border-emerald-600'
                                              : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                                          }`}
                                        >
                                          {isSelected && q.answerOrigin !== 'MISSING'
                                            ? 'Đáp án đúng'
                                            : 'Chọn đúng'}
                                        </button>
                                        {q.options.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateDraftInActiveFile(q.draftId, (prev) => {
                                                const filtered = prev.options.filter(
                                                  (_, idx) => idx !== optIdx
                                                );
                                                const relabeled = relabelMcqOptions(filtered);
                                                const nextIndices = prev.correctOptionIndices
                                                  .filter((i) => i !== optIdx)
                                                  .map((i) => (i > optIdx ? i - 1 : i));
                                                const isMulti =
                                                  prev.format === QuestionFormatCode.MCQ_MULTIPLE;
                                                const nextAns =
                                                  nextIndices.length > 0
                                                    ? isMulti
                                                      ? nextIndices
                                                          .map((i) => relabeled[i] || '')
                                                          .filter(Boolean)
                                                          .join('; ')
                                                      : relabeled[nextIndices[0]] || ''
                                                    : prev.correctOptionIndices.includes(optIdx)
                                                    ? ''
                                                    : prev.correctAnswer;
                                                return {
                                                  ...prev,
                                                  options: relabeled,
                                                  correctOptionIndices: nextIndices,
                                                  correctAnswer: nextAns,
                                                };
                                              })
                                            }
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
                              )}
                            </div>
                          )}

                          {/* Chỉnh sửa chi tiết các mệnh đề Đúng – Sai (a, b, c, d) */}
                          {(q.format === QuestionFormatCode.TRUE_FALSE_CLUSTER ||
                            q.subStatements.length > 0) && (
                            <div className="p-3 rounded-lg border border-blue-200 bg-white space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="block font-bold text-slate-800">
                                  Các mệnh đề Đúng – Sai (Chỉnh sửa nội dung và chọn đáp án Đúng / Sai cho từng ý a, b, c, d)
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateDraftInActiveFile(q.draftId, (prev) => {
                                      const nextLabel = String.fromCharCode(
                                        97 + prev.subStatements.length
                                      );
                                      const nextSubs = [
                                        ...prev.subStatements,
                                        {
                                          label: nextLabel,
                                          statement: `Mệnh đề ${nextLabel}`,
                                          isTrue: true,
                                        },
                                      ];
                                      const summary = formatSubStatementsAnswerSummary(nextSubs);
                                      return {
                                        ...prev,
                                        format: QuestionFormatCode.TRUE_FALSE_CLUSTER,
                                        subStatements: nextSubs,
                                        correctAnswer: summary,
                                        hasExplicitAnswerInDoc: true,
                                        answerOrigin: 'TEACHER_CONFIRMED',
                                        extractionWarnings: prev.extractionWarnings.filter(
                                          (w) => !w.includes('Tài liệu gốc không có đáp án')
                                        ),
                                      };
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold hover:bg-blue-100 cursor-pointer"
                                >
                                  + Thêm ý ({String.fromCharCode(97 + q.subStatements.length)})
                                </button>
                              </div>

                              <div className="space-y-2">
                                {q.subStatements.map((sub, sIdx) => {
                                  const hasAns =
                                    q.hasExplicitAnswerInDoc || q.answerOrigin !== 'MISSING';
                                  return (
                                    <div
                                      key={sIdx}
                                      className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded border border-slate-200 bg-slate-50/70"
                                    >
                                      <span className="font-mono font-bold text-blue-900 w-6 shrink-0">
                                        {sub.label})
                                      </span>
                                      <input
                                        type="text"
                                        value={sub.statement}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateDraftInActiveFile(q.draftId, (prev) => {
                                            const nextSubs = prev.subStatements.map((item, i) =>
                                              i === sIdx ? { ...item, statement: val } : item
                                            );
                                            return {
                                              ...prev,
                                              subStatements: nextSubs,
                                            };
                                          });
                                        }}
                                        placeholder={`Nhập nội dung mệnh đề ${sub.label}...`}
                                        className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                                      />
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateDraftInActiveFile(q.draftId, (prev) => {
                                              const nextSubs = prev.subStatements.map((item, i) =>
                                                i === sIdx ? { ...item, isTrue: true } : item
                                              );
                                              const summary =
                                                formatSubStatementsAnswerSummary(nextSubs);
                                              return {
                                                ...prev,
                                                subStatements: nextSubs,
                                                correctAnswer: summary,
                                                hasExplicitAnswerInDoc: true,
                                                answerOrigin: 'TEACHER_CONFIRMED',
                                                extractionWarnings:
                                                  prev.extractionWarnings.filter(
                                                    (w) =>
                                                      !w.includes('Tài liệu gốc không có đáp án')
                                                  ),
                                              };
                                            })
                                          }
                                          className={`px-3 py-1 rounded font-bold text-xs border transition cursor-pointer ${
                                            hasAns && sub.isTrue
                                              ? 'bg-emerald-600 text-white border-emerald-600'
                                              : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                                          }`}
                                        >
                                          Đúng
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateDraftInActiveFile(q.draftId, (prev) => {
                                              const nextSubs = prev.subStatements.map((item, i) =>
                                                i === sIdx ? { ...item, isTrue: false } : item
                                              );
                                              const summary =
                                                formatSubStatementsAnswerSummary(nextSubs);
                                              return {
                                                ...prev,
                                                subStatements: nextSubs,
                                                correctAnswer: summary,
                                                hasExplicitAnswerInDoc: true,
                                                answerOrigin: 'TEACHER_CONFIRMED',
                                                extractionWarnings:
                                                  prev.extractionWarnings.filter(
                                                    (w) =>
                                                      !w.includes('Tài liệu gốc không có đáp án')
                                                  ),
                                              };
                                            })
                                          }
                                          className={`px-3 py-1 rounded font-bold text-xs border transition cursor-pointer ${
                                            hasAns && !sub.isTrue
                                              ? 'bg-rose-600 text-white border-rose-600'
                                              : 'bg-white text-slate-600 border-slate-300 hover:border-rose-400 hover:text-rose-700'
                                          }`}
                                        >
                                          Sai
                                        </button>
                                        {q.subStatements.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateDraftInActiveFile(q.draftId, (prev) => {
                                                const filtered = prev.subStatements
                                                  .filter((_, i) => i !== sIdx)
                                                  .map((item, idx) => ({
                                                    ...item,
                                                    label:
                                                      ['a', 'b', 'c', 'd'][idx] ||
                                                      String.fromCharCode(97 + idx),
                                                  }));
                                                const summary =
                                                  formatSubStatementsAnswerSummary(filtered);
                                                return {
                                                  ...prev,
                                                  subStatements: filtered,
                                                  correctAnswer: summary,
                                                };
                                              })
                                            }
                                            title="Xóa mệnh đề này"
                                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Đáp án chính thức (Giáo viên xác nhận)
                              </label>
                              <input
                                type="text"
                                value={q.correctAnswer}
                                onChange={(e) => {
                                  const rawVal = e.target.value;
                                  updateDraftInActiveFile(q.draftId, (prev) => {
                                    let nextSubs = prev.subStatements;
                                    let nextIndices = prev.correctOptionIndices;
                                    if (
                                      prev.format === QuestionFormatCode.TRUE_FALSE_CLUSTER ||
                                      prev.subStatements.length > 0
                                    ) {
                                      const synced = syncSubStatementsFromAnswerText(
                                        prev.subStatements,
                                        rawVal
                                      );
                                      if (synced.matchedAny) {
                                        nextSubs = synced.updated;
                                      }
                                    } else if (
                                      prev.format === QuestionFormatCode.MCQ_SINGLE ||
                                      prev.format === QuestionFormatCode.MCQ_MULTIPLE ||
                                      prev.options.length > 0
                                    ) {
                                      const matchedIndices = syncMcqIndicesFromAnswerText(
                                        prev.options,
                                        rawVal,
                                        prev.format === QuestionFormatCode.MCQ_MULTIPLE
                                      );
                                      if (matchedIndices) {
                                        nextIndices = matchedIndices;
                                      }
                                    }
                                    return {
                                      ...prev,
                                      subStatements: nextSubs,
                                      correctOptionIndices: nextIndices,
                                      correctAnswer: rawVal,
                                      hasExplicitAnswerInDoc: Boolean(rawVal.trim()),
                                      answerOrigin: rawVal.trim()
                                        ? 'TEACHER_CONFIRMED'
                                        : 'MISSING',
                                      extractionWarnings: rawVal.trim()
                                        ? prev.extractionWarnings.filter(
                                            (w) => !w.includes('Tài liệu gốc không có đáp án')
                                          )
                                        : prev.extractionWarnings,
                                    };
                                  });
                                }}
                                placeholder={
                                  q.format === QuestionFormatCode.TRUE_FALSE_CLUSTER
                                    ? 'VD: a) Đúng; b) Sai; c) Đúng; d) Sai'
                                    : 'Nhập đáp án đúng...'
                                }
                                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Hướng dẫn chấm / Giải thích
                              </label>
                              <input
                                type="text"
                                value={q.gradingGuide}
                                onChange={(e) =>
                                  updateDraftInActiveFile(q.draftId, (prev) => ({
                                    ...prev,
                                    gradingGuide: e.target.value,
                                  }))
                                }
                                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Ngữ liệu đọc hiểu chung (Nếu có)
                            </label>
                            <textarea
                              rows={2}
                              value={q.sharedPassage || ''}
                              onChange={(e) =>
                                updateDraftInActiveFile(q.draftId, (prev) => ({
                                  ...prev,
                                  sharedPassage: e.target.value || undefined,
                                }))
                              }
                              placeholder="Nội dung đoạn văn / ngữ liệu đọc hiểu chung..."
                              className="w-full rounded border border-slate-300 bg-white p-2 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL NHẬP VĂN BẢN SAO CHÉP TRỰC TIẾP (NGUỒN 5) */}
      {showDirectTextModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Nhập đề từ Văn bản sao chép trực tiếp
              </h3>
              <button
                type="button"
                onClick={() => setShowDirectTextModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên nguồn tài liệu / Tên đề kiểm tra
                </label>
                <input
                  type="text"
                  value={directTextTitle}
                  onChange={(e) => setDirectTextTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung đề kiểm tra (Hỗ trợ "Câu 1:", phương án A. B. C. D., công thức LaTeX $...$, ngữ liệu đọc hiểu)
                </label>
                <textarea
                  rows={12}
                  value={directTextInput}
                  onChange={(e) => setDirectTextInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDirectTextModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleProcessDirectText()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Phân tích & Tách câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
