import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  FileCheck2,
  FileDown,
  FileText,
  History,
  Layers,
  Lock,
  Plus,
  Printer,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Unlock,
} from 'lucide-react';
import {
  ApprovalStatus,
  CognitiveLevelCode,
  CorpusAcceptanceTestReport,
  CorpusItem,
  CorpusQualityReport,
  CorpusType,
  CorpusUsageRightsCode,
  CurriculumTopic,
  EducationLevelId,
  ExamPaper,
  GradeNumber,
  QuestionFormatCode,
  QuestionItem,
  StorageConfig,
} from '../types/domain';
import {
  APPROVAL_STATUS_LABELS,
  buildCorpusExamWordAndPdfPayloads,
  buildExamPaperFromCorpusGroup,
  calculateTextMetrics,
  COGNITIVE_LEVEL_LABELS,
  CORPUS_TYPE_LABELS,
  CORPUS_USAGE_RIGHTS_LABELS,
  createCorpusItem,
  ensureCorpusSeedDataSynced,
  GeneratedCorpusQuestionDraft,
  generateQuestionsFromCorpusWithAI,
  getCorpusItems,
  QUESTION_FORMAT_LABELS,
  replaceQuestionInCorpus,
  runCorpusQualityCheck,
  runGrade4VietnameseCorpusAcceptanceSuite,
  triggerBrowserDownload,
  updateCorpusItem,
} from '../services/corpus/corpusService';

interface CorpusAndQuestionGroupWorkspaceProps {
  topics: CurriculumTopic[];
  questions: QuestionItem[];
  exams: ExamPaper[];
  config: StorageConfig;
  globalLevelFilter: EducationLevelId | 'ALL';
  onAddQuestion: (q: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>) => QuestionItem;
  onUpdateQuestion: (
    id: string,
    updates: Partial<Omit<QuestionItem, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean
  ) => { question: QuestionItem; createdNewVersion: boolean; reason?: string } | null;
  onBulkAddQuestions: (items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]) => QuestionItem[];
  onRefreshGlobalState: () => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

type ActiveCorpusTab =
  | 'CORPUS_MANAGER'
  | 'QUESTION_GROUP_LINKS'
  | 'AI_CORPUS_GENERATOR'
  | 'EXAM_BUILDER_SINGLE_PASSAGE'
  | 'QUALITY_CHECKER'
  | 'ACCEPTANCE_TEST_7_STEPS';

const LEVEL_OPTIONS: { id: EducationLevelId; name: string }[] = [
  { id: EducationLevelId.PRIMARY, name: 'Tiểu học (Lớp 1–5)' },
  { id: EducationLevelId.LOWER_SECONDARY, name: 'THCS (Lớp 6–9)' },
  { id: EducationLevelId.UPPER_SECONDARY, name: 'THPT (Lớp 10–12)' },
];

export const CorpusAndQuestionGroupWorkspace: React.FC<CorpusAndQuestionGroupWorkspaceProps> = ({
  topics,
  questions,
  config,
  globalLevelFilter,
  onAddQuestion,
  onUpdateQuestion,
  onBulkAddQuestions,
  onRefreshGlobalState,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveCorpusTab>('CORPUS_MANAGER');
  const [corpora, setCorpora] = useState<CorpusItem[]>(() => ensureCorpusSeedDataSynced());
  const [selectedCorpusId, setSelectedCorpusId] = useState<string>('corpus-tv4-001');

  // Bộ lọc danh sách ngữ liệu
  const [searchKeyword, setSearchKeyword] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<CorpusType | 'ALL'>('ALL');

  // Form tạo mới / chỉnh sửa Ngữ liệu (Mục I)
  const [showCorpusModal, setShowCorpusModal] = useState(false);
  const [editingCorpusId, setEditingCorpusId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formProvenance, setFormProvenance] = useState('');
  const [formSourceVerified, setFormSourceVerified] = useState(false);
  const [formCorpusType, setFormCorpusType] = useState<CorpusType>('VAN_BAN');
  const [formLevelId, setFormLevelId] = useState<EducationLevelId>(EducationLevelId.PRIMARY);
  const [formGrade, setFormGrade] = useState<GradeNumber>(4);
  const [formSubject, setFormSubject] = useState('Tiếng Việt');
  const [formTopicTitle, setFormTopicTitle] = useState('Mái ấm gia đình & Tình yêu thiên nhiên');
  const [formUsageRights, setFormUsageRights] =
    useState<CorpusUsageRightsCode>('GIAO_VIEN_BIEN_SOAN');
  const [formStatus, setFormStatus] = useState<ApprovalStatus>(ApprovalStatus.DRAFT);
  const [formPreserveOrder, setFormPreserveOrder] = useState(true);

  // State Chỉnh sửa 1 câu hỏi trong nhóm (Mục II & Bước 2 Kiểm thử)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [editQStem, setEditQStem] = useState('');
  const [editQOutcomeCode, setEditQOutcomeCode] = useState('');
  const [editQOutcomeText, setEditQOutcomeText] = useState('');
  const [editQLevel, setEditQLevel] = useState<CognitiveLevelCode>(
    CognitiveLevelCode.PRIMARY_MUC_1
  );
  const [editQFormat, setEditQFormat] = useState<QuestionFormatCode>(QuestionFormatCode.MCQ_SINGLE);
  const [editQPoints, setEditQPoints] = useState<number>(0.5);
  const [editQOptions, setEditQOptions] = useState<string[]>(['A. ', 'B. ', 'C. ', 'D. ']);
  const [editQAnswer, setEditQAnswer] = useState('A');
  const [editQGuide, setEditQGuide] = useState('');

  // State Thay thế 1 câu hỏi trong nhóm (Mục II & Bước 3 Kiểm thử)
  const [replacingTargetQuestion, setReplacingTargetQuestion] = useState<QuestionItem | null>(null);
  const [replaceStem, setReplaceStem] = useState('');
  const [replaceFormat, setReplaceFormat] = useState<QuestionFormatCode>(
    QuestionFormatCode.MCQ_SINGLE
  );
  const [replaceLevel, setReplaceLevel] = useState<CognitiveLevelCode>(
    CognitiveLevelCode.PRIMARY_MUC_1
  );
  const [replacePoints, setReplacePoints] = useState<number>(0.5);
  const [replaceOptions, setReplaceOptions] = useState<string[]>([
    'A. Phương án A có căn cứ trong bài đọc.',
    'B. Phương án B (đáp án đúng trích từ văn bản).',
    'C. Phương án C nhiễu hợp lý.',
    'D. Phương án D nhiễu hợp lý.',
  ]);
  const [replaceAnswer, setReplaceAnswer] = useState('B');
  const [replaceGuide, setReplaceGuide] = useState('');

  // State Mục III: Tạo câu hỏi bằng AI từ ngữ liệu
  const [aiCognitiveLevel, setAiCognitiveLevel] = useState<CognitiveLevelCode>(
    CognitiveLevelCode.PRIMARY_MUC_1
  );
  const [aiFormat, setAiFormat] = useState<QuestionFormatCode>(QuestionFormatCode.MCQ_SINGLE);
  const [aiOutcomeCode, setAiOutcomeCode] = useState('TV4-ĐH-01');
  const [aiOutcomeText, setAiOutcomeText] = useState(
    'Nhận biết được chi tiết, hình ảnh nhân vật và sự việc trong văn bản đọc hiểu.'
  );
  const [aiPoints, setAiPoints] = useState<number>(0.5);
  const [aiQuantity, setAiQuantity] = useState<number>(3);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedDrafts, setAiGeneratedDrafts] = useState<GeneratedCorpusQuestionDraft[]>([]);

  // State Mục IV: Tạo đề Đọc hiểu & Xuất Word/PDF (Ngữ liệu xuất hiện 1 lần)
  const [selectedQuestionIdsForExam, setSelectedQuestionIdsForExam] = useState<string[]>([]);
  const [examTitleInput, setExamTitleInput] = useState(
    'ĐỀ KIỂM TRA ĐỌC HIỂU MÔN TIẾNG VIỆT LỚP 4'
  );
  const [examDurationInput, setExamDurationInput] = useState<number>(35);
  const [examPeriodInput, setExamPeriodInput] = useState<
    'GIUA_KY_1' | 'CUOI_KY_1' | 'GIUA_KY_2' | 'CUOI_KY_2'
  >('GIUA_KY_1');
  const [lastCreatedCorpusExam, setLastCreatedCorpusExam] = useState<{
    exam: ExamPaper;
    previewText: string;
    occurrenceCount: number;
    docxFileName: string;
    docxBlob: Blob;
    pdfFileName: string;
    pdfBlob: Blob;
  } | null>(null);

  // State Mục VI: Báo cáo Kiểm thử nghiệm thu 7 bước
  const [acceptanceReport, setAcceptanceReport] = useState<CorpusAcceptanceTestReport | null>(null);

  useEffect(() => {
    const synced = ensureCorpusSeedDataSynced();
    setCorpora(synced);
    onRefreshGlobalState();
  }, []);

  const filteredCorpora = useMemo(() => {
    return corpora.filter((c) => {
      if (globalLevelFilter !== 'ALL' && c.levelId !== globalLevelFilter) return false;
      if (subjectFilter !== 'ALL' && c.subject !== subjectFilter) return false;
      if (typeFilter !== 'ALL' && c.corpusType !== typeFilter) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const hit =
          c.code.toLowerCase().includes(kw) ||
          c.title.toLowerCase().includes(kw) ||
          c.content.toLowerCase().includes(kw) ||
          c.topicTitle.toLowerCase().includes(kw) ||
          c.author.toLowerCase().includes(kw);
        if (!hit) return false;
      }
      return true;
    });
  }, [corpora, globalLevelFilter, subjectFilter, typeFilter, searchKeyword]);

  const selectedCorpus = useMemo(() => {
    return (
      corpora.find((c) => c.id === selectedCorpusId) ||
      filteredCorpora[0] ||
      corpora[0]
    );
  }, [corpora, selectedCorpusId, filteredCorpora]);

  const linkedQuestions = useMemo(() => {
    if (!selectedCorpus) return [];
    const qMap = new Map(questions.map((q) => [q.id, q]));
    const ordered = selectedCorpus.questionIds
      .map((id) => qMap.get(id))
      .filter((q): q is QuestionItem => Boolean(q));

    const extra = questions.filter(
      (q) =>
        (q.sharedPassageGroupId === selectedCorpus.id || q.groupId === selectedCorpus.id) &&
        !selectedCorpus.questionIds.includes(q.id)
    );
    return [...ordered, ...extra];
  }, [selectedCorpus, questions]);

  useEffect(() => {
    if (!selectedCorpus) return;
    if (linkedQuestions.length >= 6) {
      const default6 = [
        linkedQuestions[0]?.id,
        linkedQuestions[1]?.id,
        linkedQuestions[3]?.id,
        linkedQuestions[4]?.id,
        linkedQuestions[7]?.id,
        linkedQuestions[9]?.id,
      ].filter((id): id is string => Boolean(id));
      setSelectedQuestionIdsForExam(
        default6.length === 6 ? default6 : linkedQuestions.slice(0, 6).map((q) => q.id)
      );
    } else {
      setSelectedQuestionIdsForExam(linkedQuestions.map((q) => q.id));
    }
    setExamTitleInput(
      `ĐỀ KIỂM TRA ĐỌC HIỂU – MÔN ${selectedCorpus.subject.toUpperCase()} LỚP ${selectedCorpus.grade}`
    );
  }, [selectedCorpus?.id, linkedQuestions.length]);

  const qualityReport: CorpusQualityReport | null = useMemo(() => {
    if (!selectedCorpus) return null;
    return runCorpusQualityCheck(selectedCorpus, linkedQuestions);
  }, [selectedCorpus, linkedQuestions]);

  const refreshCorporaAndQuestions = () => {
    setCorpora(getCorpusItems());
    onRefreshGlobalState();
  };

  const handleOpenCreateCorpus = () => {
    setEditingCorpusId(null);
    setFormTitle('');
    setFormContent('');
    setFormAuthor('');
    setFormSource('');
    setFormProvenance('');
    setFormSourceVerified(false);
    setFormCorpusType('VAN_BAN');
    setFormLevelId(EducationLevelId.PRIMARY);
    setFormGrade(4);
    setFormSubject('Tiếng Việt');
    setFormTopicTitle('Chủ đề Đọc hiểu & Rèn luyện Tiếng Việt');
    setFormUsageRights('CHUA_XAC_MINH_NGUON');
    setFormStatus(ApprovalStatus.DRAFT);
    setFormPreserveOrder(true);
    setShowCorpusModal(true);
  };

  const handleOpenEditCorpus = (corpus: CorpusItem) => {
    setEditingCorpusId(corpus.id);
    setFormTitle(corpus.title);
    setFormContent(corpus.content);
    setFormAuthor(corpus.author);
    setFormSource(corpus.source);
    setFormProvenance(corpus.provenanceInfo);
    setFormSourceVerified(corpus.isSourceVerified);
    setFormCorpusType(corpus.corpusType);
    setFormLevelId(corpus.levelId);
    setFormGrade(corpus.grade);
    setFormSubject(corpus.subject);
    setFormTopicTitle(corpus.topicTitle);
    setFormUsageRights(corpus.usageRights);
    setFormStatus(corpus.status);
    setFormPreserveOrder(corpus.preserveQuestionOrder);
    setShowCorpusModal(true);
  };

  const handleSaveCorpusForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      onNotify('warning', 'Thiếu thông tin', 'Vui lòng nhập Tên/nhan đề và Nội dung ngữ liệu.');
      return;
    }

    const cleanAuthor = formAuthor.trim();
    const cleanSource = formSource.trim();
    const verified = Boolean(formSourceVerified && cleanAuthor && cleanSource);

    if (editingCorpusId) {
      const updated = updateCorpusItem(editingCorpusId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        author: cleanAuthor,
        source: cleanSource,
        provenanceInfo: formProvenance.trim(),
        isSourceVerified: verified,
        corpusType: formCorpusType,
        levelId: formLevelId,
        grade: formGrade,
        subject: formSubject,
        topicTitle: formTopicTitle.trim(),
        usageRights: verified ? formUsageRights : 'CHUA_XAC_MINH_NGUON',
        status: formStatus,
        preserveQuestionOrder: formPreserveOrder,
      });
      if (updated) {
        refreshCorporaAndQuestions();
        setShowCorpusModal(false);
        onNotify(
          'success',
          'Đã cập nhật ngữ liệu',
          `Ngữ liệu "${updated.title}" (${updated.code}) đã được lưu. ${
            !verified
              ? 'Lưu ý: Tác giả/nguồn chưa xác minh nên hệ thống giữ nguyên trạng thái chưa xác minh, tuyệt đối không tự bịa.'
              : ''
          }`
        );
      }
    } else {
      const created = createCorpusItem({
        title: formTitle.trim(),
        content: formContent.trim(),
        author: cleanAuthor,
        source: cleanSource,
        provenanceInfo: formProvenance.trim(),
        isSourceVerified: verified,
        corpusType: formCorpusType,
        levelId: formLevelId,
        grade: formGrade,
        subject: formSubject,
        topicId: topics[0]?.id || 'cur-tv-4-doc-hieu',
        topicTitle: formTopicTitle.trim(),
        usageRights: verified ? formUsageRights : 'CHUA_XAC_MINH_NGUON',
        status: formStatus,
        preserveQuestionOrder: formPreserveOrder,
        questionIds: [],
        isSampleData: false,
      });
      refreshCorporaAndQuestions();
      setSelectedCorpusId(created.id);
      setShowCorpusModal(false);
      onNotify(
        'success',
        'Đã thêm ngữ liệu mới',
        `Đã khởi tạo mã ngữ liệu ${created.code} (${created.wordCount} từ).`
      );
    }
  };

  const handleStartEditQuestion = (q: QuestionItem) => {
    setEditingQuestion(q);
    setEditQStem(q.stem);
    setEditQOutcomeCode(q.learningOutcomeCode);
    setEditQOutcomeText(q.learningOutcomeText);
    setEditQLevel(q.cognitiveLevel);
    setEditQFormat(q.format);
    setEditQPoints(q.points);
    setEditQOptions(
      Array.isArray(q.options) && q.options.length >= 2
        ? [...q.options]
        : ['A. ', 'B. ', 'C. ', 'D. ']
    );
    setEditQAnswer(q.correctAnswer);
    setEditQGuide(q.gradingGuide);
  };

  const handleSaveEditedQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !selectedCorpus) return;

    const outcome = onUpdateQuestion(editingQuestion.id, {
      stem: editQStem.trim(),
      learningOutcomeCode: editQOutcomeCode.trim(),
      learningOutcomeText: editQOutcomeText.trim(),
      cognitiveLevel: editQLevel,
      format: editQFormat,
      points: Number(editQPoints) || 0.5,
      options: editQFormat === QuestionFormatCode.MCQ_SINGLE ? editQOptions : undefined,
      correctAnswer: editQAnswer.trim(),
      gradingGuide: editQGuide.trim(),
    });

    if (outcome) {
      if (outcome.createdNewVersion && outcome.question.id !== editingQuestion.id) {
        replaceQuestionInCorpus(selectedCorpus.id, editingQuestion.id, outcome.question);
      }
      refreshCorporaAndQuestions();
      setEditingQuestion(null);
      onNotify(
        'success',
        'Đã lưu chỉnh sửa câu hỏi',
        `Câu hỏi ${outcome.question.code} trong ngữ liệu ${selectedCorpus.code} đã được cập nhật.`
      );
    }
  };

  const handleStartReplaceQuestion = (q: QuestionItem) => {
    setReplacingTargetQuestion(q);
    setReplaceStem(
      `Theo bài đọc "${selectedCorpus?.title || ''}", ông ngoại đã hái mấy bông cúc vàng tươi tặng Minh để Minh đặt ở đâu?`
    );
    setReplaceFormat(q.format);
    setReplaceLevel(q.cognitiveLevel);
    setReplacePoints(q.points);
    setReplaceOptions([
      'A. Đặt ở bàn tiếp khách ngoài phòng lớn.',
      'B. Cắm ở góc bàn học của Minh.',
      'C. Treo bên khung cửa sổ nhà bếp.',
      'D. Đặt trên chiếc ghế đá ngoài sân.',
    ]);
    setReplaceAnswer('B');
    setReplaceGuide(
      'Đáp án đúng: B (0,5 điểm). Căn cứ đoạn 3: "...hái mấy bông cúc vàng tươi tặng Minh mang về cắm ở góc bàn học."'
    );
  };

  const handleConfirmReplaceQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingTargetQuestion || !selectedCorpus) return;

    const newQuestion = onAddQuestion({
      levelId: selectedCorpus.levelId,
      grade: selectedCorpus.grade,
      subject: selectedCorpus.subject,
      topicTitle: selectedCorpus.topicTitle,
      learningOutcomeCode: replacingTargetQuestion.learningOutcomeCode,
      learningOutcomeText: replacingTargetQuestion.learningOutcomeText,
      format: replaceFormat,
      cognitiveLevel: replaceLevel,
      stem: replaceStem.trim(),
      sharedPassage: selectedCorpus.content,
      sharedPassageAuthor: selectedCorpus.isSourceVerified ? selectedCorpus.author : undefined,
      sharedPassageGroupId: selectedCorpus.id,
      groupId: selectedCorpus.id,
      options: replaceFormat === QuestionFormatCode.MCQ_SINGLE ? replaceOptions : undefined,
      correctAnswer: replaceAnswer.trim(),
      gradingGuide: replaceGuide.trim(),
      points: Number(replacePoints) || 0.5,
      status: ApprovalStatus.APPROVED,
      authorName: 'Giáo viên Bộ môn',
      isSampleData: false,
      version: 1,
      sourceDocumentName: `Thay thế câu ${replacingTargetQuestion.code} trong ngữ liệu ${selectedCorpus.code}`,
    });

    replaceQuestionInCorpus(selectedCorpus.id, replacingTargetQuestion.id, newQuestion);
    refreshCorporaAndQuestions();
    setReplacingTargetQuestion(null);
    onNotify(
      'success',
      'Đã thay thế câu hỏi thành công',
      `Đã thay thế câu ${replacingTargetQuestion.code} bằng câu hỏi mới ${newQuestion.code} ở đúng vị trí thứ tự trong ngữ liệu ${selectedCorpus.code}.`
    );
  };

  const handleMoveQuestionOrder = (index: number, direction: 'UP' | 'DOWN') => {
    if (!selectedCorpus) return;
    const ids = linkedQuestions.map((q) => q.id);
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    const swapped = [...ids];
    const temp = swapped[index];
    swapped[index] = swapped[targetIdx];
    swapped[targetIdx] = temp;
    updateCorpusItem(selectedCorpus.id, { questionIds: swapped });
    refreshCorporaAndQuestions();
  };

  const handleGenerateQuestionsWithAI = async () => {
    if (!selectedCorpus) return;
    setIsAiGenerating(true);
    try {
      const drafts = await generateQuestionsFromCorpusWithAI({
        corpus: selectedCorpus,
        cognitiveLevel: aiCognitiveLevel,
        format: aiFormat,
        learningOutcomeCode: aiOutcomeCode,
        learningOutcomeText: aiOutcomeText,
        points: aiPoints,
        quantity: aiQuantity,
        existingQuestions: linkedQuestions,
      });
      setAiGeneratedDrafts(drafts);
      onNotify(
        'success',
        `AI đã tạo ${drafts.length} câu hỏi bám sát ngữ liệu`,
        `Tất cả câu hỏi và đáp án đều trích dẫn trực tiếp từ ngữ liệu "${selectedCorpus.title}" (${selectedCorpus.code}), không tự thêm tình tiết ngoài văn bản.`
      );
    } catch {
      onNotify('error', 'Lỗi tạo câu hỏi', 'Không thể tạo câu hỏi từ ngữ liệu lúc này.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSaveAiDraftsToCorpus = () => {
    if (!selectedCorpus || aiGeneratedDrafts.length === 0) return;

    const payloads: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[] = aiGeneratedDrafts.map(
      (d) => ({
        levelId: selectedCorpus.levelId,
        grade: selectedCorpus.grade,
        subject: selectedCorpus.subject,
        topicTitle: selectedCorpus.topicTitle,
        learningOutcomeCode: d.learningOutcomeCode,
        learningOutcomeText: d.learningOutcomeText,
        format: d.format,
        cognitiveLevel: d.cognitiveLevel,
        stem: d.stem,
        sharedPassage: selectedCorpus.content,
        sharedPassageAuthor: selectedCorpus.isSourceVerified ? selectedCorpus.author : undefined,
        sharedPassageGroupId: selectedCorpus.id,
        groupId: selectedCorpus.id,
        options: d.options,
        correctAnswer: d.correctAnswer,
        gradingGuide: d.gradingGuide,
        rubricCriteria: d.rubricCriteria,
        points: d.points,
        status: ApprovalStatus.DRAFT,
        authorName: 'AI & Giáo viên thẩm định',
        isSampleData: false,
        version: 1,
        sourceDocumentName: `Kho ngữ liệu ${selectedCorpus.code}`,
      })
    );

    const createdItems = onBulkAddQuestions(payloads);
    const nextQuestionIds = [
      ...selectedCorpus.questionIds,
      ...createdItems.map((q) => q.id),
    ];
    updateCorpusItem(selectedCorpus.id, { questionIds: nextQuestionIds });
    setAiGeneratedDrafts([]);
    refreshCorporaAndQuestions();
    onNotify(
      'success',
      'Đã liên kết câu hỏi vào Ngữ liệu',
      `Đã lưu ${createdItems.length} câu hỏi mới vào nhóm câu hỏi của ngữ liệu ${selectedCorpus.code}.`
    );
  };

  const handleBuildExamFromCorpus = () => {
    if (!selectedCorpus) return;
    const chosenQuestions = linkedQuestions.filter((q) =>
      selectedQuestionIdsForExam.includes(q.id)
    );
    if (chosenQuestions.length === 0) {
      onNotify(
        'warning',
        'Chưa chọn câu hỏi',
        'Vui lòng chọn ít nhất 1 câu hỏi từ nhóm ngữ liệu để đưa vào đề.'
      );
      return;
    }

    const built = buildExamPaperFromCorpusGroup({
      corpus: selectedCorpus,
      selectedQuestions: chosenQuestions,
      examTitle: examTitleInput.trim() || `Đề kiểm tra Đọc hiểu – ${selectedCorpus.title}`,
      examPeriod: examPeriodInput,
      durationMinutes: examDurationInput,
      schoolName: config.schoolName,
      authorName: 'Tổ Chuyên môn',
    });

    const exportFiles = buildCorpusExamWordAndPdfPayloads(
      selectedCorpus,
      chosenQuestions,
      built.exam,
      config.schoolName
    );

    setLastCreatedCorpusExam({
      exam: built.exam,
      previewText: built.renderedPreviewText,
      occurrenceCount: built.corpusOccurrenceCount,
      docxFileName: exportFiles.docxFileName,
      docxBlob: exportFiles.docxBlob,
      pdfFileName: exportFiles.pdfFileName,
      pdfBlob: exportFiles.pdfBlob,
    });

    refreshCorporaAndQuestions();
    onNotify(
      'success',
      `Đã tạo đề ${built.exam.code} (${chosenQuestions.length} câu)`,
      `Ngữ liệu "${selectedCorpus.title}" chỉ xuất hiện đúng ${built.corpusOccurrenceCount} lần ở đầu phần Đọc hiểu, giữ nguyên thứ tự các câu hỏi bên dưới.`
    );
  };

  const handleRun7StepAcceptanceTest = () => {
    const report = runGrade4VietnameseCorpusAcceptanceSuite(config.schoolName);
    setAcceptanceReport(report);
    refreshCorporaAndQuestions();
    onNotify(
      report.allPassed ? 'success' : 'warning',
      report.allPassed
        ? 'Hoàn tất Kiểm thử 7/7 bước: ĐẠT 100%'
        : 'Kiểm thử hoàn tất có cảnh báo',
      `Bài đọc Tiếng Việt lớp 4 (${report.corpusCode}) với ${report.totalLinkedQuestions} câu hỏi, tạo đề ${report.examQuestionCount} câu, ngữ liệu xuất hiện đúng ${report.corpusOccurrenceCountInExam} lần.`
    );
  };

  const formMetrics = calculateTextMetrics(formContent);

  return (
    <div className="space-y-6">
      {/* Header giới thiệu Module Kho ngữ liệu & Nhóm câu hỏi */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <BookOpen className="w-4 h-4" />
              <span>MODULE CHUYÊN BIỆT · TIẾNG VIỆT, NGỮ VĂN & CÁC MÔN CÓ NGỮ LIỆU CHUNG</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Kho Ngữ liệu & Quản lý Nhóm Câu hỏi Đọc hiểu / Tình huống
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Quản lý tập trung văn bản, thơ, tranh, bảng số liệu, biểu đồ và tình huống chung; liên kết chuỗi câu hỏi theo thứ tự sư phạm; tạo câu hỏi bằng AI bám sát 100% văn bản gốc (không tự bịa tác giả/tình tiết); xuất đề Word & PDF đảm bảo ngữ liệu chỉ xuất hiện đúng một lần.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreateCorpus}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm ngữ liệu mới</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCorpusId('corpus-tv4-001');
                setActiveTab('ACCEPTANCE_TEST_7_STEPS');
                handleRun7StepAcceptanceTest();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Chạy Kiểm thử Tiếng Việt 4 (10 câu)</span>
            </button>
          </div>
        </div>

        {/* Thanh điều hướng 6 Phân khu chức năng */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
          {[
            {
              id: 'CORPUS_MANAGER' as ActiveCorpusTab,
              label: 'I. Kho Ngữ liệu',
              icon: BookOpen,
              badge: corpora.length,
            },
            {
              id: 'QUESTION_GROUP_LINKS' as ActiveCorpusTab,
              label: 'II. Liên kết & Nhóm Câu hỏi',
              icon: Layers,
              badge: linkedQuestions.length,
            },
            {
              id: 'AI_CORPUS_GENERATOR' as ActiveCorpusTab,
              label: 'III. AI Tạo câu hỏi từ Ngữ liệu',
              icon: Sparkles,
            },
            {
              id: 'EXAM_BUILDER_SINGLE_PASSAGE' as ActiveCorpusTab,
              label: 'IV. Tạo đề Đọc hiểu & Xuất Word/PDF',
              icon: FileText,
            },
            {
              id: 'QUALITY_CHECKER' as ActiveCorpusTab,
              label: 'V. Kiểm tra Chất lượng (6 tiêu chí)',
              icon: ShieldAlert,
              badge: qualityReport ? qualityReport.warnings.length : 0,
            },
            {
              id: 'ACCEPTANCE_TEST_7_STEPS' as ActiveCorpusTab,
              label: 'VI. Báo cáo Kiểm thử (7 bước)',
              icon: FileCheck2,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                      active ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thanh chọn nhanh Ngữ liệu đang làm việc */}
      <div className="bg-blue-950 text-white rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-amber-300 font-semibold uppercase tracking-wide">
            Ngữ liệu đang chọn:
          </span>
          <select
            value={selectedCorpus?.id || ''}
            onChange={(e) => setSelectedCorpusId(e.target.value)}
            className="bg-blue-900 border border-blue-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {corpora.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.code}] {c.title} ({c.subject} Lớp {c.grade} · {c.questionIds.length} câu hỏi)
              </option>
            ))}
          </select>
          {selectedCorpus && (
            <span className="text-blue-200">
              Loại: <strong className="text-white">{CORPUS_TYPE_LABELS[selectedCorpus.corpusType]}</strong> · Độ dài:{' '}
              <strong className="text-white">{selectedCorpus.wordCount} từ</strong> ({selectedCorpus.charCount} ký tự) · Lịch sử dùng:{' '}
              <strong className="text-amber-300">{selectedCorpus.usageHistory.length} đề</strong>
            </span>
          )}
        </div>

        {selectedCorpus && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-2.5 py-1 rounded-md font-semibold ${
                selectedCorpus.isSourceVerified
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
              }`}
            >
              {selectedCorpus.isSourceVerified ? 'Đã xác minh nguồn & tác giả' : 'Chưa xác minh nguồn'}
            </span>
            <button
              type="button"
              onClick={() => handleOpenEditCorpus(selectedCorpus)}
              className="px-2.5 py-1 rounded-md bg-blue-800 hover:bg-blue-700 text-white font-medium cursor-pointer"
            >
              Sửa thông tin ngữ liệu
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          PHÂN KHU I: QUẢN LÝ KHO NGỮ LIỆU
      ===================================================================== */}
      {activeTab === 'CORPUS_MANAGER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Bộ lọc & Danh sách Ngữ liệu */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Danh mục Ngữ liệu ({filteredCorpora.length})
              </h2>
              <button
                type="button"
                onClick={handleOpenCreateCorpus}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo ngữ liệu</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm mã, nhan đề, nội dung..."
                className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="ALL">Tất cả môn học</option>
                <option value="Tiếng Việt">Tiếng Việt (Tiểu học)</option>
                <option value="Ngữ văn">Ngữ văn (THCS)</option>
                <option value="Khoa học">Khoa học / KHTN</option>
                <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as CorpusType | 'ALL')}
                className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="ALL">Tất cả loại ngữ liệu</option>
                {Object.entries(CORPUS_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredCorpora.map((item) => {
                const isSelected = selectedCorpus?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCorpusId(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className="ml-2 text-[11px] font-medium text-slate-600">
                          {item.subject} · Lớp {item.grade}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          item.status === ApprovalStatus.APPROVED
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {APPROVAL_STATUS_LABELS[item.status]}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                      <span>
                        Loại: <strong>{CORPUS_TYPE_LABELS[item.corpusType]}</strong> · {item.wordCount} từ
                      </span>
                      <span className="font-semibold text-blue-800">
                        {item.questionIds.length} câu hỏi liên kết
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Chi tiết đầy đủ của Ngữ liệu & Lịch sử sử dụng */}
          <div className="lg:col-span-7 space-y-6">
            {selectedCorpus && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-blue-900 text-white px-2.5 py-1 rounded">
                        {selectedCorpus.code}
                      </span>
                      <span className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                        {CORPUS_TYPE_LABELS[selectedCorpus.corpusType]}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        {APPROVAL_STATUS_LABELS[selectedCorpus.status]}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">
                      {selectedCorpus.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCorpus(selectedCorpus)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa ngữ liệu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('QUESTION_GROUP_LINKS')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Quản lý {linkedQuestions.length} câu hỏi</span>
                    </button>
                  </div>
                </div>

                {/* Bảng thông tin metadata bắt buộc theo Mục I */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500">Môn học & Khối lớp:</span>{' '}
                    <strong className="text-slate-900">
                      {selectedCorpus.subject} – Khối {selectedCorpus.grade}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Chủ đề:</span>{' '}
                    <strong className="text-slate-900">{selectedCorpus.topicTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Độ dài văn bản:</span>{' '}
                    <strong className="text-slate-900">
                      {selectedCorpus.wordCount} từ ({selectedCorpus.charCount} ký tự)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Thứ tự câu hỏi:</span>{' '}
                    <strong className="text-slate-900">
                      {selectedCorpus.preserveQuestionOrder
                        ? 'Giữ cố định thứ tự có ý nghĩa (Không đảo)'
                        : 'Cho phép hoán vị câu hỏi'}
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Tác giả:</span>{' '}
                    <strong className="text-slate-900">
                      {selectedCorpus.author || 'Chưa xác minh (Hệ thống không tự tạo tên tác giả)'}
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Nguồn & Xuất xứ:</span>{' '}
                    <strong className="text-slate-900">
                      {selectedCorpus.source || 'Chưa xác minh nguồn'}
                    </strong>
                    {selectedCorpus.provenanceInfo && (
                      <p className="text-slate-600 mt-0.5">{selectedCorpus.provenanceInfo}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Quyền sử dụng:</span>{' '}
                    <strong className="text-blue-900">
                      {CORPUS_USAGE_RIGHTS_LABELS[selectedCorpus.usageRights]}
                    </strong>
                  </div>
                </div>

                {/* Nội dung toàn văn Ngữ liệu */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nội dung Ngữ liệu gốc
                  </div>
                  <div className="p-5 rounded-xl bg-amber-50/40 border border-amber-200/80 text-slate-900 text-sm leading-relaxed whitespace-pre-line font-serif">
                    {selectedCorpus.content}
                  </div>

                  {selectedCorpus.tableData && (
                    <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg">
                      <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">
                        {selectedCorpus.tableData.caption}
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {selectedCorpus.tableData.headers.map((h, i) => (
                              <th key={i} className="px-3 py-2 font-semibold text-slate-700">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedCorpus.tableData.rows.map((r, rIdx) => (
                            <tr key={rIdx}>
                              {r.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 text-slate-800">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Lịch sử sử dụng ngữ liệu trong các đề kiểm tra (Mục II) */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-blue-700" />
                      <span>
                        Lịch sử sử dụng Ngữ liệu trong các Đề kiểm tra ({selectedCorpus.usageHistory.length} lượt)
                      </span>
                    </h3>
                  </div>

                  {selectedCorpus.usageHistory.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Ngữ liệu này chưa được đưa vào đề kiểm tra nào.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCorpus.usageHistory.map((h) => (
                        <div
                          key={h.id}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-blue-800">{h.examCode}</span>
                            <span className="mx-1.5 text-slate-400">·</span>
                            <strong className="text-slate-800">{h.examTitle}</strong>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Ngày sử dụng: {h.usedDate} · Đã chọn {h.selectedQuestionCount} câu ({h.selectedQuestionCodes.join(', ')})
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              h.isOfficialExam
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {h.isOfficialExam ? 'Đề chính thức' : 'Đề nháp / Thử nghiệm'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PHÂN KHU II: LIÊN KẾT CÂU HỎI VÀ QUẢN LÝ NHÓM CÂU HỎI ĐỌC HIỂU
      ===================================================================== */}
      {activeTab === 'QUESTION_GROUP_LINKS' && selectedCorpus && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4 h-fit lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold bg-blue-900 text-white px-2.5 py-1 rounded">
                {selectedCorpus.code}
              </span>
              <button
                type="button"
                onClick={() => {
                  updateCorpusItem(selectedCorpus.id, {
                    preserveQuestionOrder: !selectedCorpus.preserveQuestionOrder,
                  });
                  refreshCorporaAndQuestions();
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                  selectedCorpus.preserveQuestionOrder
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                {selectedCorpus.preserveQuestionOrder ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Khóa thứ tự câu hỏi có ý nghĩa</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Cho phép đảo thứ tự</span>
                  </>
                )}
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900">{selectedCorpus.title}</h3>
            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 text-xs leading-relaxed whitespace-pre-line font-serif text-slate-900 max-h-[420px] overflow-y-auto">
              {selectedCorpus.content}
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>
                <strong>Tác giả:</strong>{' '}
                {selectedCorpus.author || 'Chưa xác minh'}
              </div>
              <div>
                <strong>Nguồn:</strong> {selectedCorpus.source || 'Chưa xác minh'}
              </div>
              <div>
                <strong>Tổng số câu hỏi liên kết:</strong> {linkedQuestions.length} câu (Tổng điểm:{' '}
                {linkedQuestions.reduce((s, q) => s + q.points, 0).toFixed(2)} điểm)
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Danh sách Câu hỏi thuộc Ngữ liệu {selectedCorpus.code} ({linkedQuestions.length} câu)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mỗi câu hỏi gắn chặt với Mã ngữ liệu, Yêu cầu cần đạt, Mức độ, Dạng câu, Điểm số, Đáp án và Hướng dẫn chấm.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('AI_CORPUS_GENERATOR')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Tạo thêm câu hỏi</span>
                </button>
              </div>
            </div>

            {linkedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-900 text-white text-xs font-bold">
                      Câu {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {q.code}
                    </span>
                    <span className="font-mono text-[11px] text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      Ngữ liệu: {selectedCorpus.code}
                    </span>
                    <span className="text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                      {COGNITIVE_LEVEL_LABELS[q.cognitiveLevel]}
                    </span>
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {QUESTION_FORMAT_LABELS[q.format]} · {q.points.toFixed(2)} điểm
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveQuestionOrder(idx, 'UP')}
                      disabled={idx === 0}
                      title="Đưa câu hỏi lên trên"
                      className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQuestionOrder(idx, 'DOWN')}
                      disabled={idx === linkedQuestions.length - 1}
                      title="Đưa câu hỏi xuống dưới"
                      className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditQuestion(q)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa câu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartReplaceQuestion(q)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Thay câu khác</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  <strong>Yêu cầu cần đạt [{q.learningOutcomeCode}]:</strong> {q.learningOutcomeText}
                </div>

                <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {q.stem}
                </div>

                {q.format === QuestionFormatCode.MCQ_SINGLE && Array.isArray(q.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx];
                      const isCorrect =
                        q.correctAnswer.trim().toUpperCase().startsWith(letter);
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border text-xs ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                  <div>
                    <strong className="text-emerald-900">Đáp án đúng:</strong>{' '}
                    <span className="font-bold text-emerald-800">{q.correctAnswer}</span>
                  </div>
                  <div>
                    <strong className="text-emerald-900">Hướng dẫn chấm:</strong>{' '}
                    <span className="text-slate-700">{q.gradingGuide}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          PHÂN KHU III: TẠO CÂU HỎI BẰNG AI TỪ NGỮ LIỆU ĐÃ CHỌN
      ===================================================================== */}
      {activeTab === 'AI_CORPUS_GENERATOR' && selectedCorpus && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Sparkles className="w-4 h-4" />
              <span>Cấu hình AI Tạo câu hỏi từ Ngữ liệu ({selectedCorpus.code})</span>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold">Cam kết Kiểm soát AI (Mục III):</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Sử dụng chính xác 100% nội dung ngữ liệu "{selectedCorpus.title}".</li>
                <li>Tuyệt đối không tự thêm tình tiết, nhân vật hoặc số liệu ngoài văn bản.</li>
                <li>Đề xuất đầy đủ Đáp án và Hướng dẫn chấm có trích dẫn câu văn căn cứ.</li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Chọn Mức độ nhận thức cần tạo:
                </label>
                <select
                  value={aiCognitiveLevel}
                  onChange={(e) => setAiCognitiveLevel(e.target.value as CognitiveLevelCode)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  {selectedCorpus.levelId === EducationLevelId.PRIMARY ? (
                    <>
                      <option value={CognitiveLevelCode.PRIMARY_MUC_1}>
                        Tạo câu hỏi Nhận biết (Mức 1 – Tiểu học)
                      </option>
                      <option value={CognitiveLevelCode.PRIMARY_MUC_2}>
                        Tạo câu hỏi Thông hiểu (Mức 2 – Tiểu học)
                      </option>
                      <option value={CognitiveLevelCode.PRIMARY_MUC_3}>
                        Tạo câu hỏi Vận dụng (Mức 3 – Tiểu học)
                      </option>
                    </>
                  ) : (
                    <>
                      <option value={CognitiveLevelCode.SEC_NHAN_BIET}>
                        Tạo câu hỏi Nhận biết (THCS)
                      </option>
                      <option value={CognitiveLevelCode.SEC_THONG_HIEU}>
                        Tạo câu hỏi Thông hiểu (THCS)
                      </option>
                      <option value={CognitiveLevelCode.SEC_VAN_DUNG}>
                        Tạo câu hỏi Vận dụng (THCS)
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Chọn Dạng câu hỏi:
                </label>
                <select
                  value={aiFormat}
                  onChange={(e) => {
                    const fmt = e.target.value as QuestionFormatCode;
                    setAiFormat(fmt);
                    setAiPoints(fmt === QuestionFormatCode.ESSAY ? 1.5 : 0.5);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value={QuestionFormatCode.MCQ_SINGLE}>
                    Tạo câu hỏi Trắc nghiệm (4 phương án A, B, C, D)
                  </option>
                  <option value={QuestionFormatCode.ESSAY}>
                    Tạo câu hỏi Tự luận đọc hiểu (kèm biểu điểm hướng dẫn chấm)
                  </option>
                  <option value={QuestionFormatCode.SHORT_ANSWER}>
                    Tạo câu hỏi Trả lời ngắn
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã Yêu cầu cần đạt:
                  </label>
                  <input
                    type="text"
                    value={aiOutcomeCode}
                    onChange={(e) => setAiOutcomeCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Điểm mỗi câu:
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="5"
                    value={aiPoints}
                    onChange={(e) => setAiPoints(Number(e.target.value) || 0.5)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung Yêu cầu cần đạt:
                </label>
                <textarea
                  rows={2}
                  value={aiOutcomeText}
                  onChange={(e) => setAiOutcomeText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số lượng câu hỏi cần tạo trong đợt này:
                </label>
                <select
                  value={aiQuantity}
                  onChange={(e) => setAiQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value={1}>1 câu hỏi</option>
                  <option value={2}>2 câu hỏi</option>
                  <option value={3}>3 câu hỏi</option>
                  <option value={4}>4 câu hỏi</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateQuestionsWithAI}
                disabled={isAiGenerating}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích ngữ liệu & tạo câu hỏi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Yêu cầu AI Tạo câu hỏi & Đề xuất Hướng dẫn chấm</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Kết quả Câu hỏi do AI đề xuất từ Ngữ liệu ({aiGeneratedDrafts.length} câu)
                </h2>
                <p className="text-xs text-slate-500">
                  Kiểm tra căn cứ trích dẫn từ ngữ liệu trước khi lưu vào Nhóm câu hỏi.
                </p>
              </div>
              {aiGeneratedDrafts.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveAiDraftsToCorpus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu cả {aiGeneratedDrafts.length} câu vào Ngữ liệu {selectedCorpus.code}</span>
                </button>
              )}
            </div>

            {aiGeneratedDrafts.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-blue-600 mx-auto opacity-75" />
                <div className="font-semibold text-slate-700">
                  Chưa có câu hỏi nháp nào trong phiên hiện tại
                </div>
                <p className="max-w-md mx-auto">
                  Hãy chọn Mức độ (Nhận biết / Thông hiểu / Vận dụng) và Dạng câu (Trắc nghiệm / Tự luận) ở cột bên trái rồi nhấn nút tạo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiGeneratedDrafts.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-blue-900">
                        Câu đề xuất #{idx + 1} · {COGNITIVE_LEVEL_LABELS[d.cognitiveLevel]} ·{' '}
                        {QUESTION_FORMAT_LABELS[d.format]} ({d.points} điểm)
                      </span>
                      <span className="text-[11px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                        YCCĐ: {d.learningOutcomeCode}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">{d.stem}</div>

                    {d.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {d.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="p-2 rounded bg-white border border-slate-200 text-slate-800"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                      <div>
                        <strong>Đáp án đề xuất:</strong>{' '}
                        <span className="font-bold text-emerald-900">{d.correctAnswer}</span>
                      </div>
                      <div>
                        <strong>Hướng dẫn chấm đề xuất:</strong> {d.gradingGuide}
                      </div>
                      <div className="text-[11px] text-slate-600 italic">
                        Căn cứ trích dẫn trong ngữ liệu: "{d.groundedSentenceQuote}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PHÂN KHU IV: TẠO ĐỀ TỪ NHÓM CÂU HỎI ĐỌC HIỂU & XUẤT WORD / PDF
      ===================================================================== */}
      {activeTab === 'EXAM_BUILDER_SINGLE_PASSAGE' && selectedCorpus && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Cấu hình Tạo đề Đọc hiểu từ Ngữ liệu {selectedCorpus.code}
            </h2>

            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
              <div className="font-bold">Quy tắc Tạo đề Đọc hiểu (Mục IV):</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Đưa ngữ liệu vào đề <strong>một lần duy nhất</strong> ở đầu phần đọc hiểu.</li>
                <li>Giữ các câu hỏi liên quan liền kề ngay bên dưới ngữ liệu.</li>
                <li>Không tách câu hỏi khỏi ngữ liệu; không đảo thứ tự các câu.</li>
                <li>Không lặp lại toàn bộ ngữ liệu khi xuất nhiều câu hỏi ra Word/PDF.</li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề đề kiểm tra:</label>
                <input
                  type="text"
                  value={examTitleInput}
                  onChange={(e) => setExamTitleInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kỳ kiểm tra:</label>
                  <select
                    value={examPeriodInput}
                    onChange={(e) => setExamPeriodInput(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="GIUA_KY_1">Giữa Học kỳ I</option>
                    <option value="CUOI_KY_1">Cuối Học kỳ I</option>
                    <option value="GIUA_KY_2">Giữa Học kỳ II</option>
                    <option value="CUOI_KY_2">Cuối Học kỳ II</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời gian (phút):</label>
                  <input
                    type="number"
                    value={examDurationInput}
                    onChange={(e) => setExamDurationInput(Number(e.target.value) || 35)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-800">
                  Chọn câu hỏi đưa vào đề ({selectedQuestionIdsForExam.length}/{linkedQuestions.length} câu):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pick6 =
                        linkedQuestions.length >= 6
                          ? [
                              linkedQuestions[0]?.id,
                              linkedQuestions[1]?.id,
                              linkedQuestions[3]?.id,
                              linkedQuestions[4]?.id,
                              linkedQuestions[7]?.id,
                              linkedQuestions[9]?.id,
                            ].filter((id): id is string => Boolean(id))
                          : linkedQuestions.map((q) => q.id);
                      setSelectedQuestionIdsForExam(pick6);
                    }}
                    className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Chọn chuẩn 6 câu
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionIdsForExam(linkedQuestions.map((q) => q.id))}
                    className="text-[11px] font-semibold text-slate-600 hover:underline cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {linkedQuestions.map((q, idx) => {
                  const checked = selectedQuestionIdsForExam.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer ${
                        checked
                          ? 'bg-blue-50/70 border-blue-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIdsForExam((prev) => [...prev, q.id]);
                          } else {
                            setSelectedQuestionIdsForExam((prev) =>
                              prev.filter((id) => id !== q.id)
                            );
                          }
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">
                          Câu {idx + 1} ({q.code}) · {COGNITIVE_LEVEL_LABELS[q.cognitiveLevel]} ·{' '}
                          {q.points}đ
                        </div>
                        <div className="text-slate-600 truncate">{q.stem}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleBuildExamFromCorpus}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>
                  Tạo đề Đọc hiểu ({selectedQuestionIdsForExam.length} câu) & Kiểm tra Ngữ liệu 1 lần
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Bản xem trước Đề Đọc hiểu (Chuẩn A4 · Ngữ liệu chỉ xuất hiện 1 lần)
                </h2>
                {lastCreatedCorpusExam && (
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Đã kiểm chứng tự động: Ngữ liệu "{selectedCorpus.title}" xuất hiện đúng{' '}
                    {lastCreatedCorpusExam.occurrenceCount} lần duy nhất.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!lastCreatedCorpusExam) {
                      handleBuildExamFromCorpus();
                      return;
                    }
                    triggerBrowserDownload(
                      lastCreatedCorpusExam.docxBlob,
                      lastCreatedCorpusExam.docxFileName
                    );
                    onNotify(
                      'success',
                      'Đã tải xuống tệp Word (.doc)',
                      `Tệp ${lastCreatedCorpusExam.docxFileName} đã được xuất với khổ A4, lề chuẩn và ngữ liệu xuất hiện đúng 1 lần.`
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Xuất Word (.doc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!lastCreatedCorpusExam) {
                      handleBuildExamFromCorpus();
                      return;
                    }
                    triggerBrowserDownload(
                      lastCreatedCorpusExam.pdfBlob,
                      lastCreatedCorpusExam.pdfFileName
                    );
                    onNotify(
                      'success',
                      'Đã tải xuống tệp PDF (.pdf)',
                      `Tệp ${lastCreatedCorpusExam.pdfFileName} đã được kết xuất thành công.`
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Xuất PDF (.pdf)</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-300 bg-white shadow-xs space-y-4 font-serif text-slate-900">
              <div className="grid grid-cols-2 gap-4 text-center border-b border-slate-300 pb-3 text-xs font-sans">
                <div>
                  <div className="font-bold uppercase">{config.schoolName}</div>
                  <div className="font-semibold">TỔ CHUYÊN MÔN</div>
                </div>
                <div>
                  <div className="font-bold uppercase">{examTitleInput}</div>
                  <div>
                    Môn: {selectedCorpus.subject} – Lớp {selectedCorpus.grade} · Thời gian:{' '}
                    {examDurationInput} phút
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-800 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold uppercase font-sans text-blue-900">
                  I. ĐỌC THẦM VĂN BẢN SAU (Mã ngữ liệu: {selectedCorpus.code} – Chỉ hiển thị 1 lần duy nhất):
                </div>
                <div className="text-center font-bold text-base uppercase">
                  {selectedCorpus.title}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line text-justify">
                  {selectedCorpus.content}
                </div>
                <div className="text-right text-xs italic">
                  {selectedCorpus.isSourceVerified && selectedCorpus.author
                    ? `(${selectedCorpus.author} – ${selectedCorpus.source})`
                    : `(${selectedCorpus.source || 'Tài liệu đọc hiểu nội bộ'})`}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase font-sans text-blue-900">
                  II. CÂU HỎI ĐÁNH GIÁ DỰA TRÊN NGỮ LIỆU (
                  {
                    linkedQuestions.filter((q) =>
                      selectedQuestionIdsForExam.includes(q.id)
                    ).length
                  }{' '}
                  câu — Giữ nguyên thứ tự đọc hiểu):
                </div>

                {linkedQuestions
                  .filter((q) => selectedQuestionIdsForExam.includes(q.id))
                  .map((q, idx) => (
                    <div key={q.id} className="space-y-1.5 text-sm">
                      <div>
                        <strong>
                          Câu {idx + 1} ({q.points.toFixed(2).replace('.', ',')} điểm):
                        </strong>{' '}
                        {q.stem}
                      </div>
                      {q.format === QuestionFormatCode.MCQ_SINGLE && Array.isArray(q.options) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx}>{opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PHÂN KHU V: KIỂM TRA CHẤT LƯỢNG TỰ ĐỘNG (6 TIÊU CHÍ)
      ===================================================================== */}
      {activeTab === 'QUALITY_CHECKER' && selectedCorpus && qualityReport && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Hệ thống Kiểm tra Chất lượng Ngữ liệu & Nhóm câu hỏi tự động (6 Tiêu chí Mục V)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đang kiểm tra ngữ liệu <strong>{selectedCorpus.title}</strong> ({selectedCorpus.code}) cùng{' '}
                  <strong>{qualityReport.totalQuestionsChecked} câu hỏi</strong> liên kết.
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  qualityReport.passedAll
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {qualityReport.passedAll
                  ? 'ĐẠT CHUẨN 6/6 TIÊU CHÍ (0 CẢNH BÁO)'
                  : `PHÁT HIỆN ${qualityReport.warnings.length} CẢNH BÁO CẦN RÀ SOÁT`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {qualityReport.criteriaSummary.map((crit) => (
                <div
                  key={crit.code}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    crit.passed
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/60 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="font-bold">{crit.label}</div>
                    <div className="text-[11px] opacity-80">
                      {crit.passed
                        ? 'Đã kiểm tra hợp lệ 100%'
                        : `Có ${crit.issueCount} cảnh báo cần xử lý`}
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 ${
                      crit.passed ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  />
                </div>
              ))}
            </div>

            {qualityReport.warnings.length === 0 ? (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">
                    Ngữ liệu {selectedCorpus.code} và tất cả {linkedQuestions.length} câu hỏi liên kết đạt chuẩn chất lượng!
                  </div>
                  <div className="mt-0.5">
                    Tất cả câu hỏi đều có căn cứ trực tiếp trong văn bản, đáp án khớp hướng dẫn chấm, không có câu trùng ý, đúng Yêu cầu cần đạt và đầy đủ nguồn xuất xứ hợp lệ.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {qualityReport.warnings.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{w.title}</span>
                    </div>
                    <p className="text-slate-800">{w.message}</p>
                    <p className="text-blue-900 font-medium">
                      Hướng xử lý: {w.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PHÂN KHU VI: KIỂM THỬ NGHIỆM THU 7 BƯỚC (TIẾNG VIỆT LỚP 4 - 10 CÂU HỎI)
      ===================================================================== */}
      {activeTab === 'ACCEPTANCE_TEST_7_STEPS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Báo cáo Kiểm thử Nghiệm thu 7 Bước (Mục VI – Bài đọc hiểu Tiếng Việt Lớp 4 có 10 câu hỏi)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Kiểm chứng tự động toàn trình: Liên kết 10 câu hỏi → Chỉnh sửa 1 câu → Thay thế 1 câu khác → Tạo đề 6 câu → Xuất Word & PDF → Ngữ liệu chỉ xuất hiện 1 lần → Đáp án & Hướng dẫn chấm chính xác.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRun7StepAcceptanceTest}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Chạy lại Kiểm thử 7 Bước</span>
            </button>
          </div>

          {!acceptanceReport ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs text-slate-600">
                Nhấn nút bên dưới để thực thi kịch bản kiểm thử tự động trên bài đọc hiểu Tiếng Việt lớp 4 (10 câu hỏi).
              </p>
              <button
                type="button"
                onClick={handleRun7StepAcceptanceTest}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
              >
                Thực thi Kiểm thử 7 Bước ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Ngữ liệu kiểm thử</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {acceptanceReport.corpusCode} (Lớp {acceptanceReport.grade})
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Số câu hỏi liên kết</div>
                  <div className="font-bold text-blue-900 mt-0.5">
                    {acceptanceReport.totalLinkedQuestions} / 10 câu hỏi
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Số câu trong đề & Số lần in ngữ liệu</div>
                  <div className="font-bold text-emerald-800 mt-0.5">
                    {acceptanceReport.examQuestionCount} câu · Ngữ liệu xuất hiện {acceptanceReport.corpusOccurrenceCountInExam} lần
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
                  <div className="text-emerald-800">Kết luận nghiệm thu</div>
                  <div className="font-bold text-emerald-950 mt-0.5">
                    {acceptanceReport.allPassed ? 'ĐẠT 7/7 BƯỚC (100%)' : 'CẦN RÀ SOÁT'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {acceptanceReport.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      step.passed
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{step.title}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                        {step.passed ? 'ĐẠT (PASSED)' : 'KHÔNG ĐẠT'}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{step.summary}</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                      {step.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL THÊM / SỬA NGỮ LIỆU (MỤC I)
      ===================================================================== */}
      {showCorpusModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCorpusId ? 'Chỉnh sửa thông tin Ngữ liệu' : 'Thêm Ngữ liệu mới vào Kho'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCorpusModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveCorpusForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên hoặc nhan đề ngữ liệu (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Khu vườn mùa xuân của ông ngoại"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Loại ngữ liệu (*):
                  </label>
                  <select
                    value={formCorpusType}
                    onChange={(e) => setFormCorpusType(e.target.value as CorpusType)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {Object.entries(CORPUS_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cấp học:</label>
                  <select
                    value={formLevelId}
                    onChange={(e) => setFormLevelId(e.target.value as EducationLevelId)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {LEVEL_OPTIONS.map((lv) => (
                      <option key={lv.id} value={lv.id}>
                        {lv.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp:</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value) as GradeNumber)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                      <option key={g} value={g}>
                        Lớp {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học:</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chủ đề:</label>
                <input
                  type="text"
                  value={formTopicTitle}
                  onChange={(e) => setFormTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Nội dung ngữ liệu (*):
                  </label>
                  <span className="text-[11px] font-mono text-blue-700">
                    Độ dài tự động: {formMetrics.wordCount} từ ({formMetrics.charCount} ký tự)
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Nhập toàn văn ngữ liệu đọc hiểu, bài thơ hoặc mô tả tình huống..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-serif"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-950">
                  Thông tin Tác giả & Nguồn xuất xứ (Quy tắc: Không tự tạo tên tác giả hoặc nguồn khi chưa xác minh)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tác giả (Để trống nếu chưa xác minh):
                    </label>
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="Không tự bịa tên tác giả..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nguồn trích dẫn:
                    </label>
                    <input
                      type="text"
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value)}
                      placeholder="VD: Tiếng Việt 4, Tập 1..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thông tin xuất xứ chi tiết (NXB, năm, trang):
                  </label>
                  <input
                    type="text"
                    value={formProvenance}
                    onChange={(e) => setFormProvenance(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSourceVerified}
                    onChange={(e) => setFormSourceVerified(e.target.checked)}
                  />
                  <span className="font-semibold text-slate-800">
                    Tôi xác nhận thông tin Tác giả và Nguồn xuất xứ trên đã được kiểm chứng từ ấn phẩm gốc
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quyền sử dụng:</label>
                  <select
                    value={formUsageRights}
                    onChange={(e) => setFormUsageRights(e.target.value as CorpusUsageRightsCode)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {Object.entries(CORPUS_USAGE_RIGHTS_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trạng thái thẩm định:
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ApprovalStatus)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {(Object.entries(APPROVAL_STATUS_LABELS) as [ApprovalStatus, string][]).map(
                      ([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCorpusModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 cursor-pointer"
                >
                  Lưu Ngữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL CHỈNH SỬA 1 CÂU HỎI TRONG NGỮ LIỆU (BƯỚC 2 KIỂM THỬ)
      ===================================================================== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Chỉnh sửa Câu hỏi {editingQuestion.code} (Ngữ liệu {selectedCorpus?.code})
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung câu hỏi:</label>
                <textarea
                  rows={3}
                  required
                  value={editQStem}
                  onChange={(e) => setEditQStem(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã YCCĐ:</label>
                  <input
                    type="text"
                    value={editQOutcomeCode}
                    onChange={(e) => setEditQOutcomeCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điểm số:</label>
                  <input
                    type="number"
                    step="0.25"
                    value={editQPoints}
                    onChange={(e) => setEditQPoints(Number(e.target.value) || 0.5)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {editQFormat === QuestionFormatCode.MCQ_SINGLE && (
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Các phương án lựa chọn:
                  </label>
                  {editQOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...editQOptions];
                        next[idx] = e.target.value;
                        setEditQOptions(next);
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đáp án đúng:</label>
                <input
                  type="text"
                  value={editQAnswer}
                  onChange={(e) => setEditQAnswer(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hướng dẫn chấm & Căn cứ trong ngữ liệu:
                </label>
                <textarea
                  rows={2}
                  value={editQGuide}
                  onChange={(e) => setEditQGuide(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 cursor-pointer"
                >
                  Lưu chỉnh sửa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL THAY THẾ 1 CÂU HỎI TRONG NGỮ LIỆU (BƯỚC 3 KIỂM THỬ)
      ===================================================================== */}
      {replacingTargetQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Thay thế Câu hỏi {replacingTargetQuestion.code} bằng Câu hỏi khác
              </h3>
              <button
                type="button"
                onClick={() => setReplacingTargetQuestion(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleConfirmReplaceQuestion} className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
                <strong>Câu hiện tại sẽ được thay ra:</strong> "{replacingTargetQuestion.stem}"
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung câu hỏi mới thay vào cùng vị trí:
                </label>
                <textarea
                  rows={3}
                  required
                  value={replaceStem}
                  onChange={(e) => setReplaceStem(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {replaceFormat === QuestionFormatCode.MCQ_SINGLE && (
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Phương án lựa chọn A, B, C, D:
                  </label>
                  {replaceOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...replaceOptions];
                        next[idx] = e.target.value;
                        setReplaceOptions(next);
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đáp án đúng:</label>
                  <input
                    type="text"
                    value={replaceAnswer}
                    onChange={(e) => setReplaceAnswer(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điểm số:</label>
                  <input
                    type="number"
                    step="0.25"
                    value={replacePoints}
                    onChange={(e) => setReplacePoints(Number(e.target.value) || 0.5)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hướng dẫn chấm:
                </label>
                <textarea
                  rows={2}
                  value={replaceGuide}
                  onChange={(e) => setReplaceGuide(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReplacingTargetQuestion(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                >
                  Xác nhận Thay thế câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
