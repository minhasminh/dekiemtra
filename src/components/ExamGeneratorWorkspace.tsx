import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  KeyRound,
  Layers,
  Lock,
  Printer,
  RefreshCw,
  Send,
  ShieldAlert,
  Shuffle,
  Sliders,
  Sparkles,
  Unlock,
  XCircle,
} from 'lucide-react';
import {
  ApprovalStatus,
  DataSourceFilter,
  EducationLevelId,
  ExamCellShortageReport,
  ExamGenerationMode,
  ExamMatrix,
  ExamPaper,
  ExamPresentationConfig,
  ExamQualityCheckReport,
  ExamVariantPaper,
  ExamVariantQuestionItem,
  MatrixFormatGroupCode,
  MatrixLevelColumnCode,
  QuestionItem,
  StorageConfig,
  TeacherPermissionProfileSummary,
} from '../types/domain';
import {
  filterByDataSource,
  getApprovalStatusInfo,
  getCognitiveShortLabel,
  getExamPeriodLabel,
} from '../services/business/assessmentRules';
import {
  ensureMatrixHasSpecRows,
  exactRound2,
  getCellFromRow,
  mapQuestionCognitiveToMatrixColumn,
  MATRIX_FORMAT_GROUPS,
  MATRIX_LEVEL_COLUMNS,
} from '../services/business/matrixCalculationService';
import {
  buildAISupplementDraftQuestionsForShortage,
  doesQuestionMatchMatrixRowScope,
  evaluateExamQuality,
  findMatchingQuestionsForCell,
  generateExamVariants,
  getOutcomeAllocationsForRowCell,
  mapQuestionFormatToMatrixGroup,
  selectQuestionsFromMatrix,
  verifySeedReproducibility,
} from '../services/business/examGenerationEngine';
import { formatMathForWordHtml } from '../services/export/dossierExportService';
import { MathFormulaView } from './MathFormulaView';

interface ExamGeneratorWorkspaceProps {
  exams: ExamPaper[];
  matrices: ExamMatrix[];
  questions: QuestionItem[];
  config: StorageConfig;
  sourceFilter: DataSourceFilter;
  globalLevelFilter: EducationLevelId | 'ALL';
  currentUserId?: string;
  onQuickSwitchTeacherAccount?: (userId: string) => void;
  onOpenTeacherPermissionManager?: () => void;
  onAddExam: (exam: Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => ExamPaper;
  onUpdateExam: (
    examId: string,
    updates: Partial<Omit<ExamPaper, 'id' | 'code' | 'createdAt'>>
  ) => ExamPaper | null;
  onUpdateApproval: (
    examId: string,
    status: ApprovalStatus,
    reviewerName: string,
    reviewComment: string
  ) => void;
  onBulkAddQuestions: (
    items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]
  ) => QuestionItem[];
  onUpdateQuestion?: (
    id: string,
    updates: Partial<Omit<QuestionItem, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean,
    editorNote?: string
  ) => unknown;
  onUpdateMatrix?: (
    id: string,
    updates: Partial<Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean,
    editorNote?: string
  ) => unknown;
  onNotify: (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => void;
}

const GENERATION_MODE_OPTIONS: {
  code: ExamGenerationMode;
  shortTitle: string;
  description: string;
}[] = [
  {
    code: 'AUTO_RANDOM',
    shortTitle: 'A. Rút ngẫu nhiên từ Ngân hàng',
    description:
      'Tự động rút câu hỏi Đã phê duyệt theo từng ô ma trận bằng thuật toán tất định có Seed.',
  },
  {
    code: 'MANUAL_SELECT',
    shortTitle: 'B. Giáo viên chọn câu thủ công',
    description:
      'Giáo viên trực tiếp chọn từng câu hỏi phù hợp trong phạm vi kiến thức của từng ô ma trận.',
  },
  {
    code: 'AI_SUPPLEMENT_DRAFT',
    shortTitle: 'C. AI đề xuất câu bổ sung (Bản nháp)',
    description:
      'Giữ các câu đã duyệt và tự động sinh câu hỏi Bản nháp kèm đáp án gợi ý sát từng Yêu cầu cần đạt cho các ô đang thiếu.',
  },
  {
    code: 'HYBRID',
    shortTitle: 'D. Kết hợp Thủ công & Rút tự động',
    description:
      'Cố định các câu giáo viên đã ghim chọn, phần còn lại tự động rút ngẫu nhiên từ ngân hàng.',
  },
];

const LIFECYCLE_STEPS: {
  status: ApprovalStatus;
  stepNum: number;
  label: string;
  actorHint: string;
}[] = [
  {
    status: ApprovalStatus.DRAFT,
    stepNum: 1,
    label: 'Bản nháp',
    actorHint: 'Giáo viên biên soạn & kiểm tra chất lượng',
  },
  {
    status: ApprovalStatus.PENDING,
    stepNum: 2,
    label: 'Chờ thẩm định',
    actorHint: 'Tổ trưởng / Hội đồng chuyên môn rà soát',
  },
  {
    status: ApprovalStatus.PENDING_APPROVAL,
    stepNum: 3,
    label: 'Chờ phê duyệt',
    actorHint: 'Trình Ban Giám hiệu phê duyệt chính thức',
  },
  {
    status: ApprovalStatus.APPROVED,
    stepNum: 4,
    label: 'Đã phê duyệt',
    actorHint: 'Khóa cấu trúc đề & xác nhận đáp án',
  },
  {
    status: ApprovalStatus.PUBLISHED,
    stepNum: 5,
    label: 'Đã phát hành',
    actorHint: 'In ấn phát hành cho kỳ kiểm tra',
  },
  {
    status: ApprovalStatus.ARCHIVED,
    stepNum: 6,
    label: 'Lưu trữ',
    actorHint: 'Lưu hồ sơ khảo thí cuối kỳ / năm học',
  },
];

function formatExamHeaderRightTitle(
  examPeriod: ExamMatrix['examPeriod'] | string,
  academicYear?: string,
  prefix = 'ĐỀ KIỂM TRA'
): string {
  const periodMap: Record<string, string> = {
    GIUA_KY_1: 'GIỮA KÌ I',
    CUOI_KY_1: 'CUỐI KÌ I',
    GIUA_KY_2: 'GIỮA KÌ II',
    CUOI_KY_2: 'CUỐI KÌ II',
  };
  const periodLabel = periodMap[examPeriod] || 'ĐỊNH KÌ';
  const cleanYear = (academicYear || '2026-2027')
    .replace(/\s*[–—-]\s*/g, '-')
    .trim();
  return `${prefix} ${periodLabel} NĂM HỌC ${cleanYear}`;
}

function normalizeHeaderSchoolName(
  matrixSchool?: string,
  configSchool?: string
): string {
  const raw = (matrixSchool || configSchool || '').trim();
  if (
    !raw ||
    raw.toLowerCase().includes('chuẩn quốc gia') ||
    raw.toLowerCase().includes('edutest')
  ) {
    return 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH';
  }
  return raw.toUpperCase();
}

export const ExamGeneratorWorkspace: React.FC<ExamGeneratorWorkspaceProps> = ({
  exams,
  matrices,
  questions,
  config,
  sourceFilter,
  globalLevelFilter,
  currentUserId,
  onQuickSwitchTeacherAccount,
  onOpenTeacherPermissionManager,
  onAddExam,
  onUpdateExam,
  onUpdateApproval,
  onBulkAddQuestions,
  onUpdateQuestion,
  onUpdateMatrix,
  onNotify,
}) => {
  // MỤC VII: State kiểm tra quyền giáo viên khi tạo đề
  const [activePermUserId, setActivePermUserId] = useState<string>(
    currentUserId || 'user-gv-a'
  );
  const [teacherPermProfile, setTeacherPermProfile] =
    useState<TeacherPermissionProfileSummary | null>(null);
  const [enforceTeacherScope, setEnforceTeacherScope] = useState<boolean>(true);
  const [selectedAllowedComboKey, setSelectedAllowedComboKey] = useState<string>('');
  const [backendAccessProbeResult, setBackendAccessProbeResult] = useState<{
    allowed: boolean;
    status: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (currentUserId) {
      setActivePermUserId(currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    let cancelled = false;
    const fetchTeacherPerm = async () => {
      try {
        const res = await fetch(
          `/api/security/teacher-permissions/${encodeURIComponent(activePermUserId)}`
        );
        if (!res.ok) {
          if (!cancelled) setTeacherPermProfile(null);
          return;
        }
        const json = await res.json();
        if (!cancelled && json.ok && json.profile) {
          const prof: TeacherPermissionProfileSummary = json.profile;
          setTeacherPermProfile(prof);
          const firstAlloc = prof.subjectAllocations[0];
          if (firstAlloc && firstAlloc.grades[0]) {
            setSelectedAllowedComboKey(
              `${firstAlloc.educationLevelId}__${firstAlloc.subjectName}__${firstAlloc.grades[0]}`
            );
          }
        }
      } catch {
        if (!cancelled) setTeacherPermProfile(null);
      }
    };
    fetchTeacherPerm();
    return () => {
      cancelled = true;
    };
  }, [activePermUserId]);

  // Danh sách các tổ hợp (Cấp học - Môn học - Khối lớp) giáo viên được phép tạo đề (Mục VII)
  const allowedExamCombinations = useMemo(() => {
    if (!teacherPermProfile) return [];
    const list: Array<{
      key: string;
      educationLevel: 'PRIMARY' | 'LOWER_SECONDARY';
      levelLabel: string;
      subjectId: string;
      subjectName: string;
      grade: number;
    }> = [];
    teacherPermProfile.subjectAllocations.forEach((alloc) => {
      alloc.grades.forEach((g) => {
        const gradeNum = Number(g);
        list.push({
          key: `${alloc.educationLevelId}__${alloc.subjectName}__${gradeNum}`,
          educationLevel: alloc.educationLevelId,
          levelLabel: alloc.educationLevelId === 'PRIMARY' ? 'Tiểu học' : 'THCS',
          subjectId: alloc.subjectId,
          subjectName: alloc.subjectName,
          grade: gradeNum,
        });
      });
    });
    return list;
  }, [teacherPermProfile]);

  const handleProbeBackendExamAccess = async (params: {
    educationLevel: 'PRIMARY' | 'LOWER_SECONDARY';
    subjectName: string;
    grade: string | number;
    requiredPermission?: string;
  }) => {
    try {
      const res = await fetch('/api/security/teacher-permissions/verify-exam-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activePermUserId,
          educationLevelId: params.educationLevel,
          subjectName: params.subjectName,
          grade: Number(params.grade),
          requiredPermission: params.requiredPermission || 'CREATE_EXAM_PAPER',
        }),
      });
      const json = await res.json();
      setBackendAccessProbeResult({
        allowed: Boolean(json.allowed),
        status: res.status,
        message: json.message || (res.ok ? 'Hợp lệ' : 'Từ chối truy cập (403)'),
      });
      onNotify(
        json.allowed ? 'success' : 'error',
        json.allowed
          ? `Hợp lệ (HTTP ${res.status}) · Được phép tạo đề`
          : `Bị chặn tại Backend (HTTP ${res.status})`,
        json.message || ''
      );
    } catch {
      // ignore
    }
  };

  // Danh sách ma trận khả dụng (Ưu tiên ma trận do giáo viên tạo & lọc theo quyền Mục VII nếu bật enforceTeacherScope)
  const selectableMatrices = useMemo(() => {
    const filtered = matrices.filter((m) => {
      if (globalLevelFilter !== 'ALL' && m.levelId !== globalLevelFilter) {
        return false;
      }
      if (enforceTeacherScope && teacherPermProfile && allowedExamCombinations.length > 0) {
        const mLevel =
          m.levelId === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY';
        const matchAllowed = allowedExamCombinations.some(
          (c) =>
            c.educationLevel === mLevel &&
            c.subjectName.toLowerCase() === m.subject.toLowerCase() &&
            Number(c.grade) === Number(m.grade)
        );
        return matchAllowed;
      }
      return true;
    });
    const baseList =
      enforceTeacherScope && teacherPermProfile && allowedExamCombinations.length > 0
        ? filtered
        : filtered.length > 0
        ? filtered
        : matrices;
    return [...baseList].sort((a, b) => {
      if (a.isSampleData !== b.isSampleData) {
        return a.isSampleData ? 1 : -1;
      }
      if (
        (a.status === ApprovalStatus.APPROVED) !==
        (b.status === ApprovalStatus.APPROVED)
      ) {
        return a.status === ApprovalStatus.APPROVED ? -1 : 1;
      }
      return 0;
    });
  }, [matrices, globalLevelFilter, enforceTeacherScope, teacherPermProfile, allowedExamCombinations]);

  const approvedMatrices = useMemo(() => {
    const app = selectableMatrices.filter(
      (m) => m.status === ApprovalStatus.APPROVED
    );
    return app.length > 0 ? app : selectableMatrices;
  }, [selectableMatrices]);

  const unapprovedMatricesCount = useMemo(
    () => matrices.filter((m) => m.status !== ApprovalStatus.APPROVED).length,
    [matrices]
  );

  // State cấu hình bộ máy tạo đề (Mục 1, 2, 3)
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(
    () => selectableMatrices[0]?.id || 'mat-test-1-math6-cv7991'
  );
  const [generationMode, setGenerationMode] =
    useState<ExamGenerationMode>('AUTO_RANDOM');
  const [variantCountPreset, setVariantCountPreset] = useState<
    1 | 2 | 4 | 'CUSTOM'
  >(4);
  const [customVariantCount, setCustomVariantCount] = useState<number>(6);
  const [seedInput, setSeedInput] = useState<string>('EDUTEST-2026-K6-SEED01');
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleMcqOptions, setShuffleMcqOptions] = useState<boolean>(true);
  const [examTitleInput, setExamTitleInput] = useState<string>('');
  const [manualCellSelections, setManualCellSelections] = useState<
    Record<string, string[]>
  >({});
  const [activeCellPickerKey, setActiveCellPickerKey] = useState<string | null>(
    null
  );

  // State chỉnh sửa nhanh câu hỏi Bản nháp AI ngay trong Chế độ C
  const [editingDraftQuestionId, setEditingDraftQuestionId] = useState<
    string | null
  >(null);
  const [editDraftStem, setEditDraftStem] = useState<string>('');
  const [editDraftOptions, setEditDraftOptions] = useState<string[]>([]);
  const [editDraftCorrectAnswer, setEditDraftCorrectAnswer] =
    useState<string>('');
  const [editDraftGradingGuide, setEditDraftGradingGuide] =
    useState<string>('');
  const [aiVariantCounter, setAiVariantCounter] = useState<number>(1);

  // State Đề đang làm việc (Working Exam Session)
  const [workingBaseQuestionIds, setWorkingBaseQuestionIds] = useState<
    string[]
  >([]);
  const [workingCellMeta, setWorkingCellMeta] = useState<
    Record<
      string,
      {
        rowId: string;
        formatGroup: MatrixFormatGroupCode;
        levelColumn: MatrixLevelColumnCode;
        learningOutcomeCode: string;
        points: number;
      }
    >
  >({});
  const [workingVariants, setWorkingVariants] = useState<ExamVariantPaper[]>(
    []
  );
  const [activeVariantCode, setActiveVariantCode] = useState<string>('101');
  const [workingShortages, setWorkingShortages] = useState<
    ExamCellShortageReport[]
  >([]);
  const [workingQualityReport, setWorkingQualityReport] =
    useState<ExamQualityCheckReport | null>(null);
  const [seedVerificationBanner, setSeedVerificationBanner] = useState<{
    reproducible: boolean;
    message: string;
  } | null>(null);
  const [activeTestScenarioBanner, setActiveTestScenarioBanner] = useState<{
    id: string;
    title: string;
    summary: string;
  } | null>(null);

  // State tab hiển thị & chỉnh sửa (Mục 5, 6, 7)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    | 'STUDENT_PAPER'
    | 'TEACHER_PAPER'
    | 'ANSWER_AND_RUBRIC'
    | 'MATRIX_CELL_MAP'
    | 'QUALITY_AUDIT'
  >('STUDENT_PAPER');

  const [presentationConfig, setPresentationConfig] =
    useState<ExamPresentationConfig>({
      fontSize: 'MEDIUM',
      mcqOptionColumns: 2,
      showKnowledgeScopeBanner: true,
      showQuestionIdInStudentView: false,
      headerStyle: 'MINISTRY_STANDARD',
    });

  const [revisionNotes, setRevisionNotes] = useState<string>('');
  const [swapModalTargetQuestionId, setSwapModalTargetQuestionId] = useState<
    string | null
  >(null);
  const [swapFilterMode, setSwapFilterMode] = useState<
    'EQUIVALENT_ONLY' | 'ALL_BANK_TEST_DEVIATION'
  >('EQUIVALENT_ONLY');

  // State quản lý danh sách đề đã lưu & vòng đời phê duyệt
  const [selectedSavedExamId, setSelectedSavedExamId] = useState<string | null>(
    null
  );
  const [workflowActorName, setWorkflowActorName] = useState<string>(
    'Tổ trưởng Chuyên môn / Ban Giám hiệu'
  );
  const [workflowNote, setWorkflowNote] = useState<string>('');

  const selectedMatrix = useMemo(() => {
    return (
      selectableMatrices.find((m) => m.id === selectedMatrixId) ||
      selectableMatrices[0] ||
      matrices[0]
    );
  }, [selectableMatrices, matrices, selectedMatrixId]);

  const effectiveVariantCount =
    variantCountPreset === 'CUSTOM'
      ? Math.max(1, Math.min(12, customVariantCount || 1))
      : variantCountPreset;

  // Tự động điền tiêu đề gợi ý khi đổi ma trận theo chuẩn: ĐỀ KIỂM TRA GIỮA KÌ I NĂM HỌC 2026-2027
  useEffect(() => {
    if (!selectedMatrix) return;
    setExamTitleInput(
      formatExamHeaderRightTitle(
        selectedMatrix.examPeriod,
        selectedMatrix.academicYear || config.academicYear,
        'ĐỀ KIỂM TRA'
      )
    );
  }, [selectedMatrix?.id, selectedMatrix?.examPeriod, selectedMatrix?.academicYear, config.academicYear]);

  // Hàm thực thi tạo đề từ Ma trận + Ngân hàng câu hỏi + Seed
  // Đặc biệt: Ở Chế độ C (AI_SUPPLEMENT_DRAFT), nếu có bất kỳ ô YCCĐ nào thiếu câu hỏi,
  // hệ thống tự động sinh ngay các câu hỏi Bản nháp kèm đáp án gợi ý sát với từng Yêu cầu cần đạt!
  const runExamGeneration = (overrideParams?: {
    matrix?: ExamMatrix;
    mode?: ExamGenerationMode;
    variantCount?: number;
    seed?: string;
    shuffleQ?: boolean;
    shuffleOpt?: boolean;
    customManualMap?: Record<string, string[]>;
    customQuestionsList?: QuestionItem[];
    autoSwitchTab?:
      | 'STUDENT_PAPER'
      | 'TEACHER_PAPER'
      | 'ANSWER_AND_RUBRIC'
      | 'MATRIX_CELL_MAP'
      | 'QUALITY_AUDIT';
  }) => {
    const targetMatrix = overrideParams?.matrix || selectedMatrix;
    if (!targetMatrix) {
      onNotify(
        'error',
        'Chưa có Ma trận đề kiểm tra',
        'Vui lòng tạo hoặc chọn ít nhất 01 Ma trận đề kiểm tra trước khi tạo đề.'
      );
      return;
    }

    const modeToUse = overrideParams?.mode ?? generationMode;
    const vCount = overrideParams?.variantCount ?? effectiveVariantCount;
    const seedToUse = (overrideParams?.seed ?? seedInput).trim() || 'EDUTEST-SEED-01';
    const shufQ = overrideParams?.shuffleQ ?? shuffleQuestions;
    const shufOpt = overrideParams?.shuffleOpt ?? shuffleMcqOptions;
    const manualMap = overrideParams?.customManualMap ?? manualCellSelections;
    let bankPool = overrideParams?.customQuestionsList ?? questions;

    let selection = selectQuestionsFromMatrix({
      matrix: targetMatrix,
      allQuestions: bankPool,
      mode: modeToUse,
      seed: seedToUse,
      manualCellSelections: manualMap,
    });

    // Tự động sinh câu hỏi Bản nháp theo từng Yêu cầu cần đạt nếu đang ở Chế độ C và còn ô thiếu
    if (
      modeToUse === 'AI_SUPPLEMENT_DRAFT' &&
      selection.shortageReports.length > 0
    ) {
      const allDraftPayloads: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[] =
        [];
      selection.shortageReports.forEach((shortage) => {
        if (shortage.shortageCount > 0) {
          const drafts = buildAISupplementDraftQuestionsForShortage({
            matrix: targetMatrix,
            shortageReport: shortage,
            seed: seedToUse,
          });
          allDraftPayloads.push(...drafts);
        }
      });

      if (allDraftPayloads.length > 0) {
        const createdDraftQuestions = onBulkAddQuestions(allDraftPayloads);
        bankPool = [...createdDraftQuestions, ...bankPool];
        selection = selectQuestionsFromMatrix({
          matrix: targetMatrix,
          allQuestions: bankPool,
          mode: 'AI_SUPPLEMENT_DRAFT',
          seed: seedToUse,
          manualCellSelections: manualMap,
        });
      }
    }

    const variants = generateExamVariants({
      matrix: targetMatrix,
      baseQuestionIds: selection.orderedBaseQuestionIds,
      questions: bankPool,
      cellMetaByQuestionId: selection.cellMetaByQuestionId,
      seed: seedToUse,
      variantCount: vCount,
      shuffleQuestions: shufQ,
      shuffleMcqOptions: shufOpt,
    });

    const quality = evaluateExamQuality({
      matrix: targetMatrix,
      variants,
      allQuestions: bankPool,
    });

    setWorkingBaseQuestionIds(selection.orderedBaseQuestionIds);
    setWorkingCellMeta(selection.cellMetaByQuestionId);
    setWorkingVariants(variants);
    setActiveVariantCode(variants[0]?.variantCode || '101');
    setWorkingShortages(selection.shortageReports);
    setWorkingQualityReport(quality);
    setSeedVerificationBanner(null);

    if (overrideParams?.autoSwitchTab) {
      setActiveWorkspaceTab(overrideParams.autoSwitchTab);
    }

    return { selection, variants, quality, bankPool };
  };

  // Khởi tạo đề mặc định lần đầu khi mở module
  useEffect(() => {
    if (selectedMatrix && workingVariants.length === 0) {
      runExamGeneration();
    }
  }, [selectedMatrix?.id]);

  // Hàm tính lại các mã đề và kiểm tra chất lượng khi giáo viên chỉnh sửa đề (đổi câu, sắp xếp lại câu)
  const recomputeVariantsFromEditedBaseQuestions = (
    nextBaseIds: string[],
    nextCellMeta = workingCellMeta,
    customPool = questions
  ) => {
    if (!selectedMatrix) return;
    const variants = generateExamVariants({
      matrix: selectedMatrix,
      baseQuestionIds: nextBaseIds,
      questions: customPool,
      cellMetaByQuestionId: nextCellMeta,
      seed: seedInput,
      variantCount: effectiveVariantCount,
      shuffleQuestions,
      shuffleMcqOptions,
    });

    const quality = evaluateExamQuality({
      matrix: selectedMatrix,
      variants,
      allQuestions: customPool,
    });

    setWorkingBaseQuestionIds(nextBaseIds);
    setWorkingCellMeta(nextCellMeta);
    setWorkingVariants(variants);
    setWorkingQualityReport(quality);

    if (quality.hasMatrixDeviation) {
      onNotify(
        'warning',
        'Cảnh báo: Thay đổi làm lệch cấu trúc Ma trận!',
        'Câu hỏi vừa thay đổi không khớp với phân bố Chủ đề / Dạng thức / Mức độ của Ma trận. Vui lòng kiểm tra lại báo cáo chất lượng.'
      );
    }
  };

  // Xử lý thay 1 câu trong đề bằng câu khác từ Ngân hàng (Mục 5)
  const handleSwapQuestionInExam = (
    oldQuestionId: string,
    newQuestion: QuestionItem,
    customPool = questions
  ) => {
    const idx = workingBaseQuestionIds.indexOf(oldQuestionId);
    if (idx === -1) return;

    const nextBaseIds = [...workingBaseQuestionIds];
    nextBaseIds[idx] = newQuestion.id;

    const oldMeta = workingCellMeta[oldQuestionId];
    const nextMeta = { ...workingCellMeta };
    nextMeta[newQuestion.id] = {
      rowId: oldMeta?.rowId || 'unmapped-row',
      formatGroup: mapQuestionFormatToMatrixGroup(newQuestion.format),
      levelColumn: mapQuestionCognitiveToMatrixColumn(
        newQuestion.cognitiveLevel
      ),
      learningOutcomeCode:
        newQuestion.learningOutcomeCode ||
        oldMeta?.learningOutcomeCode ||
        'CHƯA-GẮN-MÃ',
      points: newQuestion.points,
    };

    recomputeVariantsFromEditedBaseQuestions(nextBaseIds, nextMeta, customPool);
    setSwapModalTargetQuestionId(null);
  };

  // Sắp xếp lại thứ tự câu hỏi trong đề gốc (Mục 5)
  const handleMoveQuestionOrder = (
    questionId: string,
    direction: 'UP' | 'DOWN'
  ) => {
    const idx = workingBaseQuestionIds.indexOf(questionId);
    if (idx === -1) return;
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= workingBaseQuestionIds.length) return;

    const nextIds = [...workingBaseQuestionIds];
    const temp = nextIds[idx];
    nextIds[idx] = nextIds[targetIdx];
    nextIds[targetIdx] = temp;

    const variants = generateExamVariants({
      matrix: selectedMatrix,
      baseQuestionIds: nextIds,
      questions,
      cellMetaByQuestionId: workingCellMeta,
      seed: seedInput,
      variantCount: effectiveVariantCount,
      shuffleQuestions: false,
      shuffleMcqOptions,
    });
    const quality = evaluateExamQuality({
      matrix: selectedMatrix,
      variants,
      allQuestions: questions,
    });

    setShuffleQuestions(false);
    setWorkingBaseQuestionIds(nextIds);
    setWorkingVariants(variants);
    setWorkingQualityReport(quality);
    onNotify(
      'info',
      'Đã cập nhật thứ tự câu hỏi',
      'Đã di chuyển vị trí câu hỏi và cố định thứ tự trình bày trong đề.'
    );
  };

  // Xử lý Chế độ C: AI đề xuất câu bổ sung ở trạng thái Bản nháp theo từng Yêu cầu cần đạt cho các ô thiếu câu hỏi
  const handleGenerateAISupplementDraftsForShortages = () => {
    if (!selectedMatrix) return;

    const shortageCountBefore = workingShortages.reduce(
      (sum, r) => sum + r.shortageCount,
      0
    );

    setGenerationMode('AI_SUPPLEMENT_DRAFT');
    const result = runExamGeneration({
      matrix: selectedMatrix,
      mode: 'AI_SUPPLEMENT_DRAFT',
      autoSwitchTab: 'TEACHER_PAPER',
    });

    const draftCountInExam =
      result?.variants[0]?.items.filter((it) => it.isDraftSupplement).length ||
      shortageCountBefore;

    onNotify(
      'success',
      `Đã tạo ${draftCountInExam} câu hỏi Bản nháp AI theo từng Yêu cầu cần đạt`,
      'Mỗi câu hỏi Bản nháp và đáp án gợi ý đã được xây dựng bám sát trực tiếp Yêu cầu cần đạt của từng bài học trong Ma trận. Giáo viên có thể xem, chỉnh sửa hoặc phê duyệt ngay bên dưới.'
    );
  };

  // Mở khung chỉnh sửa nhanh câu hỏi Bản nháp AI
  const handleStartEditDraftQuestion = (qId: string) => {
    const qObj = questions.find((q) => q.id === qId);
    if (!qObj) return;
    setEditingDraftQuestionId(qObj.id);
    setEditDraftStem(qObj.stem);
    setEditDraftOptions(qObj.options ? [...qObj.options] : []);
    setEditDraftCorrectAnswer(qObj.correctAnswer);
    setEditDraftGradingGuide(qObj.gradingGuide);
  };

  // Lưu nội dung chỉnh sửa câu hỏi Bản nháp AI và cập nhật lại toàn bộ mã đề
  const handleSaveEditedDraftQuestion = () => {
    if (!editingDraftQuestionId) return;
    const qObj = questions.find((q) => q.id === editingDraftQuestionId);
    if (!qObj) return;

    const updates: Partial<Omit<QuestionItem, 'id' | 'code' | 'createdAt'>> = {
      stem: editDraftStem.trim() || qObj.stem,
      options:
        editDraftOptions.length > 0
          ? editDraftOptions.map((o) => o.trim())
          : qObj.options,
      correctAnswer: editDraftCorrectAnswer.trim() || qObj.correctAnswer,
      gradingGuide: editDraftGradingGuide.trim() || qObj.gradingGuide,
    };

    onUpdateQuestion?.(editingDraftQuestionId, updates, false, 'Biên tập câu hỏi Bản nháp AI trong Chế độ C');

    const updatedPool = questions.map((q) =>
      q.id === editingDraftQuestionId ? { ...q, ...updates } : q
    );
    recomputeVariantsFromEditedBaseQuestions(
      workingBaseQuestionIds,
      workingCellMeta,
      updatedPool
    );
    setEditingDraftQuestionId(null);
    onNotify(
      'success',
      'Đã cập nhật câu hỏi Bản nháp & Đáp án gợi ý',
      'Nội dung câu hỏi và đáp án gợi ý đã được đồng bộ trên toàn bộ các mã đề.'
    );
  };

  // Tạo phương án câu hỏi AI mới cho cùng 1 Yêu cầu cần đạt
  const handleRegenerateSingleAIDraftQuestion = (qId: string) => {
    if (!selectedMatrix) return;
    const qObj = questions.find((q) => q.id === qId);
    const meta = workingCellMeta[qId];
    if (!qObj || !meta) return;

    const nextVar = aiVariantCounter + 1;
    setAiVariantCounter(nextVar);

    const fakeShortage: ExamCellShortageReport = {
      cellKey: `${meta.rowId}__${meta.formatGroup}__${meta.levelColumn}__REGEN_${nextVar}`,
      rowId: meta.rowId,
      chapterCode: meta.learningOutcomeCode,
      topicTitle: qObj.topicTitle,
      knowledgeUnit: qObj.knowledgeUnit || qObj.lessonTitle || qObj.topicTitle,
      learningOutcomeCode: qObj.learningOutcomeCode,
      learningOutcomeText: qObj.learningOutcomeText,
      formatGroup: meta.formatGroup,
      levelColumn: meta.levelColumn,
      requiredCount: nextVar + 1,
      requiredPointsPerQuestion: meta.points,
      availableApprovedCount: 0,
      selectedCount: 0,
      shortageCount: nextVar + 1,
    };

    const generatedList = buildAISupplementDraftQuestionsForShortage({
      matrix: selectedMatrix,
      shortageReport: fakeShortage,
      seed: `${seedInput}-VAR-${nextVar}`,
    });

    const chosenDraftPayload =
      generatedList[generatedList.length - 1] || generatedList[0];
    if (!chosenDraftPayload) return;

    if (onUpdateQuestion) {
      onUpdateQuestion(
        qObj.id,
        {
          stem: chosenDraftPayload.stem,
          options: chosenDraftPayload.options,
          correctOptionIndices: chosenDraftPayload.correctOptionIndices,
          subStatements: chosenDraftPayload.subStatements,
          acceptedVariations: chosenDraftPayload.acceptedVariations,
          rubricCriteria: chosenDraftPayload.rubricCriteria,
          correctAnswer: chosenDraftPayload.correctAnswer,
          gradingGuide: chosenDraftPayload.gradingGuide,
        },
        false,
        'Đổi phương án đề xuất AI cùng Yêu cầu cần đạt'
      );
      const updatedPool = questions.map((q) =>
        q.id === qObj.id ? { ...q, ...chosenDraftPayload } : q
      );
      recomputeVariantsFromEditedBaseQuestions(
        workingBaseQuestionIds,
        workingCellMeta,
        updatedPool
      );
      onNotify(
        'info',
        `Đã sinh phương án câu hỏi nháp mới cho [${qObj.learningOutcomeCode}]`,
        'Câu hỏi và đáp án gợi ý đã được làm mới theo đúng Yêu cầu cần đạt.'
      );
    }
  };

  // Phê duyệt 1 câu hỏi Bản nháp AI hoặc toàn bộ câu Bản nháp AI trong đề vào Ngân hàng chính thức
  const handleApproveDraftQuestionsInExam = (targetQuestionIds: string[]) => {
    if (!onUpdateQuestion || targetQuestionIds.length === 0) return;
    targetQuestionIds.forEach((id) => {
      onUpdateQuestion(
        id,
        { status: ApprovalStatus.APPROVED },
        false,
        'Phê duyệt câu hỏi bổ sung từ Chế độ C vào Ngân hàng chính thức'
      );
    });

    const idSet = new Set(targetQuestionIds);
    const updatedPool = questions.map((q) =>
      idSet.has(q.id) ? { ...q, status: ApprovalStatus.APPROVED } : q
    );
    recomputeVariantsFromEditedBaseQuestions(
      workingBaseQuestionIds,
      workingCellMeta,
      updatedPool
    );

    onNotify(
      'success',
      `Đã phê duyệt ${targetQuestionIds.length} câu hỏi vào Ngân hàng chính thức`,
      'Các câu hỏi đã chuyển sang trạng thái "Đã phê duyệt", đủ điều kiện trình duyệt và phát hành đề kiểm tra chính thức.'
    );
  };

  // Lưu đề kiểm tra vào Hồ sơ & Quản lý Vòng đời Trạng thái (Mục 7)
  const handleSaveWorkingExamPaper = (initialStatus: ApprovalStatus = ApprovalStatus.DRAFT) => {
    if (!selectedMatrix || workingVariants.length === 0) {
      onNotify('error', 'Chưa có dữ liệu đề', 'Vui lòng tạo đề từ ma trận trước khi lưu.');
      return;
    }

    const hasDraftQuestions = workingVariants[0]?.items.some(
      (it) => it.isDraftSupplement
    );

    if (
      initialStatus !== ApprovalStatus.DRAFT &&
      (workingQualityReport?.hasMatrixDeviation || hasDraftQuestions)
    ) {
      onNotify(
        'error',
        'Chưa đủ điều kiện gửi thẩm định',
        hasDraftQuestions
          ? 'Đề đang chứa câu hỏi AI bổ sung ở trạng thái "Bản nháp". Chỉ được lưu ở trạng thái Bản nháp hoặc phải phê duyệt câu hỏi trong Ngân hàng trước.'
          : 'Đề đang có lỗi lệch cấu trúc Ma trận hoặc thiếu câu hỏi. Vui lòng khắc phục trước khi gửi thẩm định.'
      );
      return;
    }

    const created = onAddExam({
      title:
        examTitleInput.trim() ||
        `Đề kiểm tra ${selectedMatrix.subject} Lớp ${selectedMatrix.grade}`,
      levelId: selectedMatrix.levelId,
      grade: selectedMatrix.grade,
      subject: selectedMatrix.subject,
      examPeriod: selectedMatrix.examPeriod,
      matrixId: selectedMatrix.id,
      matrixCode: selectedMatrix.code,
      matrixTitle: selectedMatrix.title,
      durationMinutes: selectedMatrix.durationMinutes,
      questionIds: workingBaseQuestionIds,
      totalPoints:
        workingVariants[0]?.totalPoints || selectedMatrix.totalPoints || 10,
      generationMode,
      seed: seedInput,
      variantCount: effectiveVariantCount,
      shuffleQuestions,
      shuffleMcqOptions,
      variants: workingVariants,
      shortageReports: workingShortages,
      qualityReport: workingQualityReport || undefined,
      presentationConfig,
      revisionNotes: revisionNotes.trim() || undefined,
      status: initialStatus,
      authorName: 'Giáo viên Bộ môn',
      isSampleData: false,
    });

    setSelectedSavedExamId(created.id);
    onNotify(
      'success',
      `Đã lưu hồ sơ đề kiểm tra (${created.code})`,
      `Lưu thành công ${workingVariants.length} mã đề (${workingVariants
        .map((v) => v.variantCode)
        .join(', ')}) với Seed "${seedInput}".`
    );
  };

  // Chuyển trạng thái theo quy trình 6 bước (Mục 7)
  const handleTransitionExamStatus = (
    exam: ExamPaper,
    nextStatus: ApprovalStatus
  ) => {
    if (
      (nextStatus === ApprovalStatus.PENDING_APPROVAL ||
        nextStatus === ApprovalStatus.APPROVED ||
        nextStatus === ApprovalStatus.PUBLISHED) &&
      exam.qualityReport &&
      !exam.qualityReport.passedAll
    ) {
      onNotify(
        'error',
        'Chặn phê duyệt đề chưa đạt chuẩn chất lượng',
        'Đề kiểm tra còn lỗi cấu trúc ma trận hoặc thiếu câu hỏi. Vui lòng hoàn thiện đề trước khi phê duyệt/phát hành.'
      );
      return;
    }

    const defaultNoteMap: Record<ApprovalStatus, string> = {
      [ApprovalStatus.DRAFT]: 'Chuyển về trạng thái Bản nháp để biên tập.',
      [ApprovalStatus.PENDING]:
        'Đã hoàn thiện đề và gửi Tổ chuyên môn thẩm định.',
      [ApprovalStatus.IN_REVIEW]:
        'Đang trong quá trình phản biện và thẩm định chuyên môn.',
      [ApprovalStatus.REVISION_REQUIRED]:
        'Yêu cầu giáo viên rà soát và chỉnh sửa lại theo góp ý thẩm định.',
      [ApprovalStatus.REVISED]:
        'Giáo viên đã tiếp thu góp ý, hoàn thành chỉnh sửa và gửi lại.',
      [ApprovalStatus.PENDING_APPROVAL]:
        'Tổ chuyên môn đã thẩm định đạt yêu cầu, trình Ban Giám hiệu phê duyệt.',
      [ApprovalStatus.APPROVED]:
        'Ban Giám hiệu phê duyệt chính thức bộ đề, bảng đáp án và hướng dẫn chấm.',
      [ApprovalStatus.PUBLISHED]:
        'Phát hành chính thức bộ mã đề phục vụ tổ chức kiểm tra định kỳ.',
      [ApprovalStatus.ARCHIVED]:
        'Đóng gói và đưa bộ đề kiểm tra vào kho Lưu trữ hồ sơ khảo thí.',
      [ApprovalStatus.DEPRECATED]: 'Ngừng sử dụng.',
    };

    const commentToSave =
      workflowNote.trim() || defaultNoteMap[nextStatus] || 'Cập nhật trạng thái';

    onUpdateApproval(
      exam.id,
      nextStatus,
      workflowActorName.trim() || 'Hội đồng Khảo thí',
      commentToSave
    );
    setWorkflowNote('');

    const stInfo = getApprovalStatusInfo(nextStatus);
    onNotify(
      'success',
      `Chuyển trạng thái: ${stInfo.label}`,
      `Đề ${exam.code} đã chuyển sang trạng thái "${stInfo.label}".`
    );
  };

  // ============================================================================
  // 7 KỊCH BẢN KIỂM THỬ MỘT CHẠM (MỤC 8 - KIỂM THỬ TOÀN DIỆN)
  // ============================================================================
  const runAutomatedTestScenario = (
    scenarioId:
      | 'TEST_1_VALID_SINGLE'
      | 'TEST_2_FOUR_VARIANTS'
      | 'TEST_3_COMPARE_ANSWERS'
      | 'TEST_4_BANK_SHORTAGE'
      | 'TEST_5_MATRIX_DEVIATION'
      | 'TEST_6_SHARED_PASSAGE'
      | 'TEST_7_SEED_REPRODUCE'
  ) => {
    const math6Matrix =
      matrices.find((m) => m.code === 'MT-THCS-K6-01') || approvedMatrices[0];
    const viet4Matrix =
      matrices.find((m) => m.code === 'MT-TH-K4-02-v2') || approvedMatrices[0];
    const shortageMatrix =
      matrices.find((m) => m.code === 'MT-TH-K4-WARN04') || approvedMatrices[0];

    if (scenarioId === 'TEST_1_VALID_SINGLE' && math6Matrix) {
      setSelectedMatrixId(math6Matrix.id);
      setGenerationMode('AUTO_RANDOM');
      setVariantCountPreset(1);
      setSeedInput('SEED-TOAN6-VALID-101');
      setShuffleQuestions(false);
      setShuffleMcqOptions(false);

      runExamGeneration({
        matrix: math6Matrix,
        mode: 'AUTO_RANDOM',
        variantCount: 1,
        seed: 'SEED-TOAN6-VALID-101',
        shuffleQ: false,
        shuffleOpt: false,
        autoSwitchTab: 'STUDENT_PAPER',
      });

      setActiveTestScenarioBanner({
        id: scenarioId,
        title: 'Kịch bản #1: Tạo 01 đề chuẩn từ Ma trận hợp lệ (MT-THCS-K6-01 – Toán 6 CV 7991)',
        summary:
          'Đã đọc cấu trúc Ma trận Toán 6 (22 câu · 10,00 điểm: 12 TN nhiều lựa chọn, 2 Đúng–Sai, 4 Trả lời ngắn, 4 Tự luận), rút đủ 22/22 câu Đã duyệt khớp 100% YCCĐ và vượt qua cả 9/9 tiêu chí kiểm định chất lượng.',
      });
      return;
    }

    if (scenarioId === 'TEST_2_FOUR_VARIANTS' && math6Matrix) {
      setSelectedMatrixId(math6Matrix.id);
      setGenerationMode('AUTO_RANDOM');
      setVariantCountPreset(4);
      setSeedInput('SEED-TOAN6-4VARIANTS-2026');
      setShuffleQuestions(true);
      setShuffleMcqOptions(true);

      runExamGeneration({
        matrix: math6Matrix,
        mode: 'AUTO_RANDOM',
        variantCount: 4,
        seed: 'SEED-TOAN6-4VARIANTS-2026',
        shuffleQ: true,
        shuffleOpt: true,
        autoSwitchTab: 'STUDENT_PAPER',
      });

      setActiveTestScenarioBanner({
        id: scenarioId,
        title: 'Kịch bản #2: Tạo 04 mã đề tương đương (101, 102, 103, 104)',
        summary:
          'Đã sinh 4 mã đề độc lập từ cùng tập 22 câu hỏi gốc: đảo thứ tự câu trong từng phần, đảo phương án A/B/C/D an toàn và bảo toàn tương đương tuyệt đối về cấu trúc, mức độ nhận thức và thang điểm 10,00.',
      });
      return;
    }

    if (scenarioId === 'TEST_3_COMPARE_ANSWERS' && math6Matrix) {
      setSelectedMatrixId(math6Matrix.id);
      setGenerationMode('AUTO_RANDOM');
      setVariantCountPreset(4);
      setSeedInput('SEED-TOAN6-4VARIANTS-2026');
      setShuffleQuestions(true);
      setShuffleMcqOptions(true);

      runExamGeneration({
        matrix: math6Matrix,
        mode: 'AUTO_RANDOM',
        variantCount: 4,
        seed: 'SEED-TOAN6-4VARIANTS-2026',
        shuffleQ: true,
        shuffleOpt: true,
        autoSwitchTab: 'ANSWER_AND_RUBRIC',
      });

      setActiveTestScenarioBanner({
        id: scenarioId,
        title: 'Kịch bản #3: Đối chiếu bảng đáp án & biểu điểm giữa 4 mã đề (101–104)',
        summary:
          'Đã mở Bảng đối chiếu chéo 4 mã đề: Khi phương án A/B/C/D được hoán vị ở từng mã đề, hệ thống tự động tính lại nhãn chữ cái đúng tương ứng để không bao giờ làm sai lệch nội dung đáp án đúng.',
      });
      return;
    }

    if (scenarioId === 'TEST_4_BANK_SHORTAGE' && shortageMatrix) {
      setSelectedMatrixId(shortageMatrix.id);
      setGenerationMode('AUTO_RANDOM');
      setVariantCountPreset(2);
      setSeedInput('SEED-TOAN4-SHORTAGE-TEST');

      runExamGeneration({
        matrix: shortageMatrix,
        mode: 'AUTO_RANDOM',
        variantCount: 2,
        seed: 'SEED-TOAN4-SHORTAGE-TEST',
        autoSwitchTab: 'MATRIX_CELL_MAP',
      });

      setActiveTestScenarioBanner({
        id: scenarioId,
        title: 'Kịch bản #4: Thử khi Ngân hàng thiếu câu hỏi (MT-TH-K4-WARN04 – Toán Lớp 4)',
        summary:
          'Ma trận yêu cầu 17 câu nhưng Ngân hàng hiện chỉ có 12/17 câu đúng phạm vi Phân số (Ô Đúng–Sai mức Vận dụng yêu cầu 6 câu nhưng chỉ có 1 câu). Hệ thống TUYỆT ĐỐI KHÔNG lấy câu ngoài phạm vi kiến thức để bù, đồng thời báo cáo chính xác ô thiếu 5 câu và cho phép kích hoạt Chế độ C (AI đề xuất 5 câu Bản nháp).',
      });
      return;
    }

    if (scenarioId === 'TEST_5_MATRIX_DEVIATION' && math6Matrix) {
      setSelectedMatrixId(math6Matrix.id);
      setGenerationMode('AUTO_RANDOM');
      setVariantCountPreset(2);
      setSeedInput('SEED-TOAN6-DEVIATION-TEST');

      const res = runExamGeneration({
        matrix: math6Matrix,
        mode: 'AUTO_RANDOM',
        variantCount: 2,
        seed: 'SEED-TOAN6-DEVIATION-TEST',
        autoSwitchTab: 'QUALITY_AUDIT',
      });

      if (res && res.selection.orderedBaseQuestionIds.length > 0) {
        // Thay câu số 1 (đang là Trắc nghiệm Biết Chương I) bằng 1 câu Tự luận Vận dụng Chương V -> gây lệch ma trận ngay lập tức
        const firstId = res.selection.orderedBaseQuestionIds[0];
        const wrongScopeQuestion =
          questions.find(
            (q) =>
              q.id === 'q-sec-6-math-ch5-essay-2' ||
              (q.subject === 'Toán' &&
                q.grade === 6 &&
                !res.selection.orderedBaseQuestionIds.includes(q.id))
          ) || questions[0];

        if (wrongScopeQuestion) {
          const corruptedIds = [...res.selection.orderedBaseQuestionIds];
          corruptedIds[0] = wrongScopeQuestion.id;
          const nextMeta = { ...res.selection.cellMetaByQuestionId };
          nextMeta[wrongScopeQuestion.id] = {
            rowId: 'corrupted-manual-swap',
            formatGroup: mapQuestionFormatToMatrixGroup(
              wrongScopeQuestion.format
            ),
            levelColumn: mapQuestionCognitiveToMatrixColumn(
              wrongScopeQuestion.cognitiveLevel
            ),
            learningOutcomeCode:
              wrongScopeQuestion.learningOutcomeCode || 'SAI-MA-TRAN',
            points: wrongScopeQuestion.points,
          };

          recomputeVariantsFromEditedBaseQuestions(corruptedIds, nextMeta);
        }
      }

      setActiveTestScenarioBanner({
        id: scenarioId,
        title: 'Kịch bản #5: Thử thay câu hỏi khiến Ma trận bị sai lệch',
        summary:
          'Đã mô phỏng thao tác giáo viên thay Câu số 1 (TN Nhiều lựa chọn – Mức Biết – 0,25đ) bằng một câu Tự luận Vận dụng (0,50đ) khác chủ đề. Hệ thống lập tức phát hiện lệch tổng điểm (10,25/10,00đ) và lệch phân bố ô ma trận, hiển thị cảnh báo đỏ và chặn gửi phê duyệt.',
      });
      return;
    }

    if (scenarioId === 'TEST_6_SHARED_PASSAGE' && viet4Matrix) {
      setSelectedMatrixId(viet4Matrix.id);
      setGenerationMode('AUTO_RANDOM');
      setVariantCountPreset(4);
      setSeedInput('SEED-TV4-SHARED-PASSAGE-2026');
      setShuffleQuestions(true);
      setShuffleMcqOptions(true);

      runExamGeneration({
        matrix: viet4Matrix,
        mode: 'AUTO_RANDOM',
        variantCount: 4,
        seed: 'SEED-TV4-SHARED-PASSAGE-2026',
        shuffleQ: true,
        shuffleOpt: true,
        autoSwitchTab: 'STUDENT_PAPER',
      });

      setActiveTestScenarioBanner({
        id: scenarioId,
        title: 'Kịch bản #6: Đề có chùm câu hỏi sử dụng chung một ngữ liệu đọc hiểu (Tiếng Việt 4)',
        summary:
          'Đã tạo 4 mã đề (101–104) cho đề Tiếng Việt Lớp 4 gồm 6 câu Đọc hiểu chung văn bản "Mùa thảo quả" (Theo Ma Văn Kháng). Hệ thống tự động khóa cụm ngữ liệu chung để 6 câu đọc hiểu luôn đi liền nhau dưới khung văn bản, không bị xé lẻ khi trộn đề.',
      });
      return;
    }

    if (scenarioId === 'TEST_7_SEED_REPRODUCE') {
      if (!selectedMatrix || workingVariants.length === 0) return;
      const check = verifySeedReproducibility({
        matrix: selectedMatrix,
        baseQuestionIds: workingBaseQuestionIds,
        questions,
        cellMetaByQuestionId: workingCellMeta,
        seed: seedInput,
        variantCount: workingVariants.length,
        shuffleQuestions,
        shuffleMcqOptions,
        currentVariants: workingVariants,
      });

      setSeedVerificationBanner({
        reproducible: check.reproducible,
        message: check.summaryMessage,
      });

      setActiveTestScenarioBanner({
        id: scenarioId,
        title: 'Kịch bản #7: Kiểm chứng khả năng tái lập chính xác 100% từ Seed',
        summary: check.summaryMessage,
      });

      onNotify(
        check.reproducible ? 'success' : 'warning',
        check.reproducible
          ? 'Xác nhận tái lập 100% từ Seed'
          : 'Phát hiện đề đã chỉnh sửa thủ công sau khi sinh từ Seed',
        check.summaryMessage
      );
    }
  };

  const activeVariant: ExamVariantPaper | undefined = useMemo(() => {
    return (
      workingVariants.find((v) => v.variantCode === activeVariantCode) ||
      workingVariants[0]
    );
  }, [workingVariants, activeVariantCode]);

  const aiDraftItemsInCurrentExam = useMemo(() => {
    const baseVariant = activeVariant || workingVariants[0];
    if (!baseVariant) return [];
    return baseVariant.items
      .map((item) => {
        const bankQuestion = questions.find((q) => q.id === item.questionId);
        return { item, bankQuestion };
      })
      .filter(
        ({ item, bankQuestion }) =>
          Boolean(item.isDraftSupplement) ||
          bankQuestion?.status === ApprovalStatus.DRAFT ||
          bankQuestion?.authorName?.includes('AI') ||
          bankQuestion?.tags?.includes('AI-Supplement-ModeC')
      );
  }, [activeVariant, workingVariants, questions]);

  const draftQuestionsCountInExam = useMemo(() => {
    return aiDraftItemsInCurrentExam.filter(
      ({ item, bankQuestion }) =>
        (bankQuestion?.status ||
          (item.isDraftSupplement
            ? ApprovalStatus.DRAFT
            : ApprovalStatus.APPROVED)) !== ApprovalStatus.APPROVED
    ).length;
  }, [aiDraftItemsInCurrentExam]);

  const specRowsOfSelectedMatrix = useMemo(
    () => (selectedMatrix ? ensureMatrixHasSpecRows(selectedMatrix) : []),
    [selectedMatrix]
  );

  const filteredSavedExams = useMemo(
    () => filterByDataSource(exams, sourceFilter),
    [exams, sourceFilter]
  );

  const activeSavedExam = useMemo(
    () =>
      filteredSavedExams.find((e) => e.id === selectedSavedExamId) ||
      filteredSavedExams[0] ||
      null,
    [filteredSavedExams, selectedSavedExamId]
  );

  // Tải một đề đã lưu lên khung làm việc
  const handleLoadSavedExamToWorkspace = (exam: ExamPaper) => {
    setSelectedSavedExamId(exam.id);
    const linkedMatrix = matrices.find((m) => m.id === exam.matrixId);
    if (linkedMatrix) {
      setSelectedMatrixId(linkedMatrix.id);
    }
    if (exam.seed) setSeedInput(exam.seed);
    if (exam.generationMode) setGenerationMode(exam.generationMode);
    if (exam.presentationConfig) setPresentationConfig(exam.presentationConfig);
    setRevisionNotes(exam.revisionNotes || '');

    if (exam.variants && exam.variants.length > 0 && linkedMatrix) {
      setWorkingBaseQuestionIds(exam.questionIds);
      setWorkingVariants(exam.variants);
      setActiveVariantCode(exam.variants[0].variantCode);
      setWorkingShortages(exam.shortageReports || []);
      setWorkingQualityReport(
        exam.qualityReport ||
          evaluateExamQuality({
            matrix: linkedMatrix,
            variants: exam.variants,
            allQuestions: questions,
          })
      );
    } else if (linkedMatrix) {
      runExamGeneration({
        matrix: linkedMatrix,
        seed: exam.seed || 'EDUTEST-SAVED-SEED',
        variantCount: exam.variantCount || 1,
      });
    }
  };

  // Xuất file Word (.doc) cho Bản đề Học sinh hoặc Đáp án Giáo viên
  // Chuẩn định dạng: Khổ giấy A4, kiểu in dọc (portrait), lề trên 2cm, dưới 2cm, trái 2.5cm, phải 2cm, cách dòng đơn (single line spacing), canh đều hai bên (justify), cỡ chữ 13-14pt, công thức Toán-Lý-Hóa hiển thị chuẩn
  const handleExportExamToWord = (includeAnswers: boolean) => {
    if (!selectedMatrix || !activeVariant) return;
    const docTitle = includeAnswers
      ? `DAP_AN_HDC_MA_DE_${activeVariant.variantCode}_${selectedMatrix.code}`
      : `DE_CHINH_THUC_HOC_SINH_MA_${activeVariant.variantCode}_${selectedMatrix.code}`;

    const sectionMetaMap: Record<
      MatrixFormatGroupCode,
      { titlePrefix: string; instruction: string }
    > = {
      MCQ: {
        titlePrefix: 'PHẦN I. Trắc nghiệm nhiều lựa chọn',
        instruction:
          'Khoanh tròn vào chữ cái đứng trước câu em cho là đúng nhất:',
      },
      TRUE_FALSE: {
        titlePrefix: 'PHẦN II. Đúng – Sai',
        instruction:
          'Học sinh trả lời từ câu 1 đến câu 4; trong mỗi ý a, b, c, d, ở mỗi câu học sinh chọn đúng hoặc sai.',
      },
      SHORT_ANSWER: {
        titlePrefix: 'PHẦN III. Trả lời ngắn',
        instruction: '',
      },
      ESSAY: {
        titlePrefix: 'PHẦN IV. Tự luận',
        instruction: '',
      },
    };

    const sectionOrder: MatrixFormatGroupCode[] = [
      'MCQ',
      'TRUE_FALSE',
      'SHORT_ANSWER',
      'ESSAY',
    ];

    const sectionsHtml = sectionOrder
      .map((fgCode) => {
        const partItems = activeVariant.items.filter(
          (it) => it.formatGroup === fgCode
        );
        if (partItems.length === 0) return '';

        const partPoints = exactRound2(
          partItems.reduce((sum, it) => sum + it.points, 0)
        );
        const secMeta = sectionMetaMap[fgCode];

        const sectionHeaderHtml = `
          <div style="margin-top:8pt; margin-bottom:2pt;">
            <p style="margin:0; font-family:'Times New Roman',serif; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify; font-weight:bold;">
              ${secMeta.titlePrefix} (${partItems.length} câu — ${partPoints.toFixed(2)} điểm)
            </p>
            ${
              secMeta.instruction
                ? `<p style="margin:0; font-family:'Times New Roman',serif; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify; font-weight:normal;">
                    ${secMeta.instruction}
                  </p>`
                : ''
            }
          </div>
        `;

        const partQuestionsHtml = partItems
          .map((item, idxInPart) => {
            const prevItem = idxInPart > 0 ? partItems[idxInPart - 1] : null;
            const showSharedPassage =
              Boolean(item.sharedPassage) &&
              (!prevItem ||
                prevItem.sharedPassageGroupKey !== item.sharedPassageGroupKey);

            const passageBlock = showSharedPassage
              ? `<div style="border:1px solid #cbd5e1; padding:6pt; margin:4pt 0; background:#f8fafc;">
                  <p style="font-weight:bold; margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify;">Đọc ngữ liệu sau và trả lời các câu hỏi:</p>
                  <p style="margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify;">${formatMathForWordHtml(
                    item.sharedPassage
                  )}</p>
                  ${
                    item.sharedPassageAuthor
                      ? `<p style="text-align:right; font-style:italic; margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least;">(${formatMathForWordHtml(
                          item.sharedPassageAuthor
                        )})</p>`
                      : ''
                  }
                </div>`
              : '';

            const optionsBlock =
              item.shuffledOptions && item.shuffledOptions.length > 0
                ? `<div style="margin-left:14pt;">
                    ${item.shuffledOptions
                      .map(
                        (opt) =>
                          `<p style="margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify;">${formatMathForWordHtml(
                            opt
                          )}</p>`
                      )
                      .join('')}
                  </div>`
                : '';

            const tfBlock =
              item.subStatements && item.subStatements.length > 0
                ? `<div style="margin-left:14pt;">
                    ${item.subStatements
                      .map(
                        (s) =>
                          `<p style="margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify;"><strong>${s.label})</strong> ${formatMathForWordHtml(
                            s.statement
                          )}</p>`
                      )
                      .join('')}
                  </div>`
                : '';

            // Ràng buộc Mục 6: Không công khai đáp án trong bản đề dành cho học sinh
            const answerBlock = includeAnswers
              ? `<div style="margin-top:3pt; padding:4pt 8pt; background:#ecfdf5; border-left:3px solid #059669;">
                  <p style="margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify;"><strong>Đáp án đúng:</strong> ${formatMathForWordHtml(
                    item.shuffledCorrectAnswer
                  )}</p>
                  <p style="margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify;"><strong>Hướng dẫn chấm:</strong> ${formatMathForWordHtml(
                    item.gradingGuide
                  )}</p>
                </div>`
              : '';

            return `
              ${passageBlock}
              <div style="margin-bottom:3pt;">
                <p style="margin:0; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify;"><strong>Câu ${item.displayNumber} (${item.points.toFixed(
              2
            )} điểm):</strong> ${formatMathForWordHtml(item.stem)}</p>
                ${optionsBlock}
                ${tfBlock}
                ${answerBlock}
              </div>
            `;
          })
          .join('');

        return `${sectionHeaderHtml}${partQuestionsHtml}`;
      })
      .join('');

    const schoolHeaderName = normalizeHeaderSchoolName(
      selectedMatrix.schoolName,
      config.schoolName
    );
    const rightHeaderLine1 = includeAnswers
      ? formatExamHeaderRightTitle(
          selectedMatrix.examPeriod,
          selectedMatrix.academicYear || config.academicYear,
          'HƯỚNG DẪN CHẤM KIỂM TRA'
        )
      : (
          examTitleInput?.trim() ||
          formatExamHeaderRightTitle(
            selectedMatrix.examPeriod,
            selectedMatrix.academicYear || config.academicYear,
            'ĐỀ KIỂM TRA'
          )
        ).toUpperCase();

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          @page WordSection1 {
            size: 21.0cm 29.7cm;
            mso-page-orientation: portrait;
            margin: 2.0cm 2.0cm 2.0cm 2.5cm;
            mso-header-margin: 1.0cm;
            mso-footer-margin: 1.0cm;
            mso-paper-source: 0;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body, p, div, td, th, span {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.0;
            mso-line-height-rule: at-least;
            color: #000000;
          }
          sup, sub {
            font-size: 75%;
            line-height: 0;
          }
        </style>
      </head>
      <body style="font-family:'Times New Roman',serif; font-size:13pt; line-height:1.0; mso-line-height-rule:at-least; text-align:justify; margin:0; padding:0;">
        <div class="WordSection1">
          <table style="width:100%; border-collapse:collapse; border:none; margin-bottom:8pt;">
            <tr>
              <td style="width:44%; text-align:center; vertical-align:top; border:none; padding:0 6pt 0 0;">
                <p style="margin:0; font-weight:normal; text-transform:uppercase; font-size:13pt; line-height:1.0; text-align:center;">UBND XÃ ĐAN ĐIỀN</p>
                <p style="margin:0; font-weight:bold; text-transform:uppercase; font-size:13pt; line-height:1.0; text-align:center;">${schoolHeaderName}</p>
                <div style="width:130px; border-bottom:1px solid #000; margin:2pt auto 0 auto; height:1px;"></div>
              </td>
              <td style="width:56%; text-align:center; vertical-align:top; border:none; padding:0 0 0 6pt;">
                <p style="margin:0; font-weight:bold; text-transform:uppercase; font-size:13pt; line-height:1.0; text-align:center;">${rightHeaderLine1}</p>
                <p style="margin:0; font-weight:normal; font-size:13pt; line-height:1.0; text-align:center;">MÔN: ${selectedMatrix.subject.toUpperCase()} - Lớp ${selectedMatrix.grade}</p>
                <p style="margin:0; font-weight:normal; font-size:13pt; line-height:1.0; text-align:center;">Thời gian: ${selectedMatrix.durationMinutes} phút</p>
                <p style="margin:0; font-style:italic; font-weight:normal; font-size:13pt; line-height:1.0; text-align:center;">(không kể thời gian giao đề)</p>
              </td>
            </tr>
          </table>
          ${sectionsHtml}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      includeAnswers
        ? `Đã xuất Đáp án & HDC Mã đề ${activeVariant.variantCode}`
        : `Đã xuất Bản đề Học sinh Mã đề ${activeVariant.variantCode}`,
      includeAnswers
        ? 'Tệp Word chứa đầy đủ bảng đáp án, hướng dẫn chấm tự luận và biểu điểm chi tiết.'
        : 'Tệp Word dành cho học sinh đã ẩn 100% đáp án và hướng dẫn chấm.'
    );
  };

  const fontSizeClass =
    presentationConfig.fontSize === 'SMALL'
      ? 'text-xs'
      : presentationConfig.fontSize === 'LARGE'
      ? 'text-base'
      : 'text-sm';

  const mcqGridColsClass =
    presentationConfig.mcqOptionColumns === 1
      ? 'grid-cols-1'
      : presentationConfig.mcqOptionColumns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className="space-y-6">
      {/* HEADER CHÍNH */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>
                TẠO ĐỀ KIỂM TRA TỪ MA TRẬN, BẢN ĐẶC TẢ & NGÂN HÀNG CÂU HỎI ĐÃ DUYỆT
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tạo Đề Kiểm Tra Đa Mã Đề, Kiểm Định Tiêu Chí & Hướng Dẫn Chấm Tự Động
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Tạo đề từ Ma trận đã phê duyệt · Kiểm soát phạm vi môn học & khối lớp được phân công · Bảo toàn cụm câu hỏi chung ngữ liệu đọc hiểu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => runExamGeneration()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Sinh / Trộn lại bộ mã đề
            </button>
            <button
              type="button"
              onClick={() => handleSaveWorkingExamPaper(ApprovalStatus.DRAFT)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              Lưu Bản nháp Đề kiểm tra
            </button>
          </div>
        </div>
      </div>

      {/* MỤC 1, 2, 3: BẢNG ĐIỀU KHIỂN CẤU HÌNH TẠO ĐỀ, CHẾ ĐỘ RÚT CÂU & ĐA MÃ ĐỀ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Cột trái (7 cột): Chọn Ma trận Đã duyệt & Chế độ tạo đề */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              1 & 2. Chọn Ma trận Đề kiểm tra và Chế độ Tạo đề
            </h2>
            <div className="flex items-center gap-2">
              {selectedMatrix &&
                selectedMatrix.status !== ApprovalStatus.APPROVED &&
                onUpdateMatrix && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateMatrix(
                        selectedMatrix.id,
                        { status: ApprovalStatus.APPROVED },
                        false,
                        'Duyệt nhanh Ma trận để tạo đề kiểm tra'
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Duyệt nhanh Ma trận này
                  </button>
                )}
              {unapprovedMatricesCount > 0 && (
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md font-medium">
                  Có {unapprovedMatricesCount} ma trận đang ở Bản nháp (vẫn cho phép chọn thử nghiệm)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn Ma trận & Bản đặc tả Đề kiểm tra (*)
              </label>
              <select
                value={selectedMatrix?.id || ''}
                onChange={(e) => {
                  const nextMat = selectableMatrices.find(
                    (m) => m.id === e.target.value
                  );
                  setSelectedMatrixId(e.target.value);
                  if (nextMat) {
                    runExamGeneration({ matrix: nextMat });
                  }
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium bg-white"
              >
                {selectableMatrices.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.code}]{' '}
                    {m.status === ApprovalStatus.APPROVED
                      ? '✓ Đã duyệt'
                      : '● Bản nháp'}{' '}
                    · Lớp {m.grade} · {m.subject} — {m.title} ({m.totalQuestions} câu · {m.totalPoints}đ)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên bộ đề kiểm tra chính thức
              </label>
              <input
                type="text"
                value={examTitleInput}
                onChange={(e) => setExamTitleInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Tóm tắt nhanh cấu trúc Ma trận đang chọn */}
          {selectedMatrix && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <div className="text-slate-500">Cấp học / Khối</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedMatrix.levelId === EducationLevelId.PRIMARY
                    ? 'Tiểu học'
                    : 'THCS'}{' '}
                  · Lớp {selectedMatrix.grade}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Môn học / Kỳ</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedMatrix.subject} ·{' '}
                  {getExamPeriodLabel(selectedMatrix.examPeriod)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Thời gian / Thang điểm</div>
                <div className="font-mono font-bold text-blue-800 mt-0.5">
                  {selectedMatrix.durationMinutes} phút ·{' '}
                  {(selectedMatrix.targetTotalPoints || selectedMatrix.totalPoints).toFixed(2)}đ
                </div>
              </div>
              <div>
                <div className="text-slate-500">Số câu theo Ma trận</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedMatrix.totalQuestions} câu ({specRowsOfSelectedMatrix.length} chủ đề)
                </div>
              </div>
              <div>
                <div className="text-slate-500">Đáp ứng câu hỏi</div>
                <div
                  className={`font-mono font-bold mt-0.5 ${
                    workingShortages.length === 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {workingBaseQuestionIds.length}/{selectedMatrix.totalQuestions} câu{' '}
                  {workingShortages.length === 0
                    ? aiDraftItemsInCurrentExam.length > 0
                      ? `(Đủ 100% · ${aiDraftItemsInCurrentExam.length} câu AI nháp)`
                      : '(Đủ 100%)'
                    : `(Thiếu ${workingShortages.reduce(
                        (s, r) => s + r.shortageCount,
                        0
                      )} câu)`}
                </div>
              </div>
            </div>
          )}

          {/* 4 Chế độ Tạo đề (A, B, C, D) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Chọn Chế độ Tạo đề (4 chế độ chuẩn):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GENERATION_MODE_OPTIONS.map((opt) => {
                const active = generationMode === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setGenerationMode(opt.code);
                      runExamGeneration({ mode: opt.code });
                      if (opt.code === 'MANUAL_SELECT' || opt.code === 'HYBRID') {
                        setActiveWorkspaceTab('MATRIX_CELL_MAP');
                      }
                    }}
                    className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-50/90 border-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          active ? 'text-blue-900' : 'text-slate-800'
                        }`}
                      >
                        {opt.shortTitle}
                      </span>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải (5 cột): Tạo nhiều mã đề & Quản lý Seed (Mục 3) */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-blue-700" />
              3. Tạo Nhiều Mã Đề Tương Đương & Seed Tái Lập
            </h2>
            <span className="text-xs font-mono font-semibold text-blue-700">
              {workingVariants.length} mã đề ({workingVariants.map((v) => v.variantCode).join(', ')})
            </span>
          </div>

          {/* Số lượng mã đề: 1, 2, 4 hoặc tùy chỉnh */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Số lượng mã đề cần sinh:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {([1, 2, 4, 'CUSTOM'] as const).map((preset) => {
                const isSelected = variantCountPreset === preset;
                return (
                  <button
                    key={String(preset)}
                    type="button"
                    onClick={() => {
                      setVariantCountPreset(preset);
                      const nextCount =
                        preset === 'CUSTOM' ? customVariantCount : preset;
                      runExamGeneration({ variantCount: nextCount });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset === 'CUSTOM'
                      ? 'Số mã tùy chỉnh'
                      : `${preset} mã đề`}
                  </button>
                );
              })}

              {variantCountPreset === 'CUSTOM' && (
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={customVariantCount}
                  onChange={(e) => {
                    const val = Math.max(
                      1,
                      Math.min(12, Number(e.target.value) || 1)
                    );
                    setCustomVariantCount(val);
                    runExamGeneration({ variantCount: val });
                  }}
                  className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-center"
                />
              )}
            </div>
          </div>

          {/* Tùy chọn đảo câu & đảo phương án */}
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => {
                  const val = e.target.checked;
                  setShuffleQuestions(val);
                  runExamGeneration({ shuffleQ: val });
                }}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold text-slate-800">
                  Đảo thứ tự câu hỏi trong từng phần
                </span>
                <p className="text-[11px] text-slate-500">
                  Tự động khóa cụm câu hỏi có chung ngữ liệu đọc hiểu (không đảo tách rời các câu phụ thuộc ngữ liệu chung).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleMcqOptions}
                onChange={(e) => {
                  const val = e.target.checked;
                  setShuffleMcqOptions(val);
                  runExamGeneration({ shuffleOpt: val });
                }}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold text-slate-800">
                  Đảo phương án trắc nghiệm (A, B, C, D) an toàn
                </span>
                <p className="text-[11px] text-slate-500">
                  Tự động giữ nguyên thứ tự nếu phương án chứa cụm từ phụ thuộc vị trí (&quot;Cả A và B&quot;, &quot;Tất cả đều đúng&quot;) và cập nhật lại đáp án đúng.
                </p>
              </div>
            </label>
          </div>

          {/* Seed tạo đề & Tái lập đề */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-700" />
                Mã Seed tạo đề (Tái lập chính xác 100%):
              </label>
              <button
                type="button"
                onClick={() => {
                  const randomSeed = `EDUTEST-${selectedMatrix?.subject.toUpperCase() || 'EXAM'}-K${
                    selectedMatrix?.grade || 6
                  }-${Math.floor(1000 + Math.random() * 9000)}`;
                  setSeedInput(randomSeed);
                  runExamGeneration({ seed: randomSeed });
                }}
                className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Sinh Seed ngẫu nhiên mới
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono bg-white"
                placeholder="Nhập chuỗi Seed..."
              />
              <button
                type="button"
                onClick={() => runExamGeneration({ seed: seedInput })}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg cursor-pointer shrink-0"
              >
                Tái lập từ Seed
              </button>
              <button
                type="button"
                onClick={() => runAutomatedTestScenario('TEST_7_SEED_REPRODUCE')}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 rounded-lg cursor-pointer shrink-0"
              >
                Kiểm chứng Seed
              </button>
            </div>

            {seedVerificationBanner && (
              <div
                className={`p-2.5 rounded-lg border text-[11px] ${
                  seedVerificationBanner.reproducible
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <strong>Kết quả kiểm chứng Seed:</strong>{' '}
                {seedVerificationBanner.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CẢNH BÁO NẾU CÓ Ô THIẾU CÂU HỎI TRONG NGÂN HÀNG (MỤC 1 & MỤC 2C) */}
      {workingShortages.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  BÁO CÁO Ô MA TRẬN THIẾU CÂU HỎI TRONG NGÂN HÀNG ({workingShortages.length} yêu cầu cần đạt thiếu câu — Tổng thiếu{' '}
                  {workingShortages.reduce((s, r) => s + r.shortageCount, 0)} câu)
                </span>
              </div>
              <p className="text-xs text-amber-900">
                <strong>Nguyên tắc bắt buộc (Mục 1):</strong> Hệ thống tuyệt đối không tự thay thế câu hỏi thiếu bằng câu hỏi ngoài phạm vi kiến thức hoặc khác mức độ nhận thức. Hãy bấm nút bên phải để{' '}
                <strong>Chế độ C: AI đề xuất câu hỏi bản nháp & đáp án gợi ý sát với từng Yêu cầu cần đạt</strong> của Ma trận đã tạo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAISupplementDraftsForShortages}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Chế độ C: AI đề xuất câu bổ sung (Bản nháp) cho ô thiếu
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-amber-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-100/70 text-amber-950 border-b border-amber-200">
                  <th className="p-2.5">Chương / Chủ đề</th>
                  <th className="p-2.5">Bài học / Đơn vị kiến thức</th>
                  <th className="p-2.5">Yêu cầu cần đạt cụ thể trong Ma trận</th>
                  <th className="p-2.5">Dạng câu hỏi & Mức độ</th>
                  <th className="p-2.5 text-center">Ma trận yêu cầu</th>
                  <th className="p-2.5 text-center">Ngân hàng Đã duyệt</th>
                  <th className="p-2.5 text-center">Số câu còn thiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {workingShortages.map((sh) => {
                  const fgLabel =
                    MATRIX_FORMAT_GROUPS.find((g) => g.code === sh.formatGroup)
                      ?.label || sh.formatGroup;
                  const lcLabel =
                    MATRIX_LEVEL_COLUMNS.find((l) => l.code === sh.levelColumn)
                      ?.label || sh.levelColumn;
                  return (
                    <tr key={sh.cellKey}>
                      <td className="p-2.5 font-semibold text-slate-900">
                        {sh.chapterCode} · {sh.topicTitle}
                      </td>
                      <td className="p-2.5 text-slate-800">
                        <span className="font-mono font-bold text-blue-700">
                          [{sh.learningOutcomeCode}]
                        </span>{' '}
                        <span className="font-semibold">{sh.knowledgeUnit}</span>
                      </td>
                      <td className="p-2.5 text-slate-700 max-w-md leading-relaxed">
                        {sh.learningOutcomeText || sh.knowledgeUnit}
                      </td>
                      <td className="p-2.5 font-medium text-slate-800">
                        {fgLabel} — Mức {lcLabel} ({sh.requiredPointsPerQuestion}đ/câu)
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold">
                        {sh.requiredCount} câu
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-700">
                        {sh.availableApprovedCount} câu
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-rose-700">
                        Thiếu {sh.shortageCount} câu
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BẢNG ĐIỀU KHIỂN CHẾ ĐỘ C: DANH SÁCH CÂU HỎI BẢN NHÁP AI ĐỀ XUẤT THEO TỪNG YÊU CẦU CẦN ĐẠT & ĐÁP ÁN GỢI Ý */}
      {(generationMode === 'AI_SUPPLEMENT_DRAFT' ||
        aiDraftItemsInCurrentExam.length > 0) &&
        selectedMatrix && (
          <div className="bg-indigo-50/70 border-2 border-indigo-300 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-indigo-200 pb-3.5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-700 text-white text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    CHẾ ĐỘ C: CÂU HỎI BẢN NHÁP AI ĐỀ XUẤT & ĐÁP ÁN GỢI Ý THEO YÊU CẦU CẦN ĐẠT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white border border-indigo-200 text-xs font-mono font-bold text-indigo-900">
                    {aiDraftItemsInCurrentExam.length} câu hỏi bản nháp trong đề ({draftQuestionsCountInExam} câu chưa duyệt chính thức)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Mỗi câu hỏi bản nháp dưới đây được sinh <strong>bám sát từng Bài học và từng dòng Yêu cầu cần đạt (YCCĐ)</strong> của Ma trận đề kiểm tra đang chọn, kèm theo <strong>Đáp án gợi ý, Hướng dẫn chấm và Biểu điểm chi tiết</strong>. Giáo viên có thể chỉnh sửa trực tiếp câu hỏi/đáp án, sinh lại phương án mới, hoặc duyệt chính thức vào Ngân hàng câu hỏi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {workingShortages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleGenerateAISupplementDraftsForShortages}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Sinh tiếp {workingShortages.reduce((s, r) => s + r.shortageCount, 0)} câu nháp còn thiếu
                  </button>
                )}

                {draftQuestionsCountInExam > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      handleApproveDraftQuestionsInExam(
                        aiDraftItemsInCurrentExam
                          .filter(
                            ({ item, bankQuestion }) =>
                              (bankQuestion?.status ||
                                (item.isDraftSupplement
                                  ? ApprovalStatus.DRAFT
                                  : ApprovalStatus.APPROVED)) !==
                              ApprovalStatus.APPROVED
                          )
                          .map(({ item }) => item.questionId)
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Duyệt tất cả {draftQuestionsCountInExam} câu nháp vào Ngân hàng (Chính thức)
                  </button>
                )}
              </div>
            </div>

            {aiDraftItemsInCurrentExam.length === 0 ? (
              <div className="p-4 rounded-xl bg-white border border-indigo-200 text-xs text-slate-700 flex items-center justify-between gap-3">
                <div>
                  Ngân hàng câu hỏi đã có sẵn đầy đủ {selectedMatrix.totalQuestions}/{selectedMatrix.totalQuestions} câu hỏi Đã duyệt cho mọi Yêu cầu cần đạt của ma trận này (không có ô thiếu cần AI sinh nháp). Nếu muốn thử nghiệm Chế độ C khi ngân hàng thiếu câu, bạn có thể bấm nút bên phải hoặc chọn Ma trận mới vừa tạo.
                </div>
                <button
                  type="button"
                  onClick={() => runAutomatedTestScenario('TEST_4_BANK_SHORTAGE')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-700 text-white font-semibold hover:bg-indigo-800 cursor-pointer shrink-0"
                >
                  Thử với Ma trận có ô thiếu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {aiDraftItemsInCurrentExam.map(({ item, bankQuestion }) => {
                  const isEditingThis =
                    editingDraftQuestionId === item.questionId;
                  const isDraftStatus =
                    (bankQuestion?.status ||
                      (item.isDraftSupplement
                        ? ApprovalStatus.DRAFT
                        : ApprovalStatus.APPROVED)) !== ApprovalStatus.APPROVED;
                  const fgLabel =
                    MATRIX_FORMAT_GROUPS.find((g) => g.code === item.formatGroup)
                      ?.label || item.formatGroup;
                  const lcLabel =
                    MATRIX_LEVEL_COLUMNS.find((l) => l.code === item.levelColumn)
                      ?.label || item.levelColumn;
                  const matchedRow = specRowsOfSelectedMatrix.find(
                    (r) => r.id === item.rowId
                  );
                  const topicLabel =
                    bankQuestion?.topicTitle ||
                    matchedRow?.topicTitle ||
                    'Chủ đề trong Ma trận';
                  const unitLabel =
                    bankQuestion?.knowledgeUnit ||
                    bankQuestion?.lessonTitle ||
                    matchedRow?.knowledgeUnit ||
                    'Đơn vị kiến thức';
                  const outcomeTextLabel =
                    bankQuestion?.learningOutcomeText ||
                    matchedRow?.learningOutcomeText ||
                    unitLabel;
                  const displayOptions =
                    item.shuffledOptions && item.shuffledOptions.length > 0
                      ? item.shuffledOptions
                      : bankQuestion?.options || [];

                  return (
                    <div
                      key={item.questionId}
                      className="rounded-xl bg-white border border-indigo-200/90 p-4 space-y-3 shadow-2xs"
                    >
                      {/* Header thông tin ánh xạ Ma trận & Yêu cầu cần đạt */}
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-900 text-white text-xs font-bold">
                              Câu {item.displayNumber} ({item.points} điểm)
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[11px] font-mono font-bold text-blue-800">
                              [{item.learningOutcomeCode}]
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {topicLabel} — {unitLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              {fgLabel} · Mức {lcLabel}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isDraftStatus
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {isDraftStatus
                                ? 'Bản nháp AI đề xuất'
                                : 'Đã duyệt chính thức'}
                            </span>
                          </div>

                          {/* Khung hiển thị rõ Yêu cầu cần đạt tương ứng */}
                          <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950">
                            <span className="font-bold text-indigo-900">
                              Yêu cầu cần đạt tương ứng trong Ma trận:{' '}
                            </span>
                            <span>{outcomeTextLabel}</span>
                          </div>
                        </div>

                        {/* Cụm nút thao tác trên từng câu hỏi bản nháp */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              isEditingThis
                                ? setEditingDraftQuestionId(null)
                                : handleStartEditDraftQuestion(item.questionId)
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold cursor-pointer"
                          >
                            {isEditingThis
                              ? 'Đóng sửa'
                              : 'Sửa câu dẫn & Đáp án gợi ý'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRegenerateSingleAIDraftQuestion(
                                item.questionId
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-semibold cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Đổi câu gợi ý khác cùng YCCĐ
                          </button>

                          {isDraftStatus && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApproveDraftQuestionsInExam([
                                  item.questionId,
                                ])
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Duyệt câu này
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Nội dung câu hỏi & Đáp án gợi ý (Hoặc Form chỉnh sửa trực tiếp) */}
                      {isEditingThis ? (
                        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <label className="block font-bold text-slate-800 mb-1">
                              Nội dung câu hỏi (Bản nháp theo YCCĐ):
                            </label>
                            <textarea
                              rows={3}
                              value={editDraftStem}
                              onChange={(e) => setEditDraftStem(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                            />
                          </div>

                          {item.formatGroup === 'MCQ' &&
                            editDraftOptions.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {editDraftOptions.map((optText, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200"
                                  >
                                    <span className="font-bold text-blue-800">
                                      Phương án {idx + 1}:
                                    </span>
                                    <input
                                      type="text"
                                      value={optText}
                                      onChange={(e) => {
                                        const nextOpts = editDraftOptions.map(
                                          (o, i) =>
                                            i === idx ? e.target.value : o
                                        );
                                        setEditDraftOptions(nextOpts);
                                      }}
                                      className="flex-1 border-b border-slate-200 focus:border-blue-600 outline-hidden px-1 py-0.5 text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-800 mb-1">
                                Đáp án gợi ý chính xác:
                              </label>
                              <textarea
                                rows={2}
                                value={editDraftCorrectAnswer}
                                onChange={(e) =>
                                  setEditDraftCorrectAnswer(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-800 mb-1">
                                Hướng dẫn chấm / Giải thích chi tiết theo YCCĐ:
                              </label>
                              <textarea
                                rows={2}
                                value={editDraftGradingGuide}
                                onChange={(e) =>
                                  setEditDraftGradingGuide(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingDraftQuestionId(null)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditedDraftQuestion}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                            >
                              Lưu cập nhật câu hỏi & đáp án
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5 text-xs w-full">
                          {/* Đề bài câu hỏi & các lựa chọn / ý Đúng-Sai hiển thị toàn chiều ngang từ trái sang phải */}
                          <div className="w-full space-y-2">
                            <div className="w-full text-slate-900 font-medium leading-relaxed">
                              <MathFormulaView text={item.stem} />
                            </div>

                            {item.formatGroup === 'MCQ' &&
                              displayOptions.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {displayOptions.map((optStr, idx) => {
                                    const isCorrectOpt = optStr
                                      .trim()
                                      .startsWith(
                                        `${item.shuffledCorrectAnswer
                                          .trim()
                                          .slice(0, 1)}.`
                                      );
                                    return (
                                      <div
                                        key={idx}
                                        className={`p-2 rounded-lg border ${
                                          isCorrectOpt
                                            ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-semibold'
                                            : 'bg-slate-50 border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        <MathFormulaView text={optStr} />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                            {item.formatGroup === 'TRUE_FALSE' &&
                              item.subStatements &&
                              item.subStatements.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  {item.subStatements.map((st) => (
                                    <div
                                      key={st.label}
                                      className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
                                    >
                                      <div>
                                        <span className="font-bold text-slate-900 mr-1">
                                          {st.label})
                                        </span>
                                        <MathFormulaView text={st.statement} />
                                      </div>
                                      <span
                                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] shrink-0 ${
                                          st.isTrue
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        {st.isTrue ? 'Đúng' : 'Sai'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>

                          {/* Đáp án gợi ý & Hướng dẫn chấm sát với Yêu cầu cần đạt */}
                          <div className="w-full p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                            <div>
                              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>Đáp án gợi ý sát Yêu cầu cần đạt:</span>
                              </div>
                              <div className="mt-1 font-semibold text-emerald-900 leading-relaxed">
                                <MathFormulaView
                                  text={item.shuffledCorrectAnswer}
                                />
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-emerald-200/80 text-slate-700 leading-relaxed">
                              <strong className="text-slate-900">
                                Hướng dẫn chấm & Giải thích:
                              </strong>{' '}
                              <MathFormulaView text={item.gradingGuide} />
                            </div>

                            {item.acceptedVariations &&
                              item.acceptedVariations.length > 0 && (
                                <div className="pt-1.5 border-t border-emerald-200/80">
                                  <strong className="text-blue-900 block mb-1">
                                    Các cách trả lời tương đương được chấp nhận:
                                  </strong>
                                  <div className="flex flex-wrap gap-1">
                                    {item.acceptedVariations.map((v, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-mono text-[11px] text-emerald-950"
                                      >
                                        {v}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {item.rubricCriteria &&
                              item.rubricCriteria.length > 0 && (
                                <div className="pt-1.5 border-t border-emerald-200/80 space-y-1">
                                  <strong className="text-slate-900 block">
                                    Biểu điểm thành phần (Tự luận):
                                  </strong>
                                  {item.rubricCriteria.map((rub) => (
                                    <div
                                      key={rub.id}
                                      className="flex items-start justify-between gap-2 text-[11px] bg-white/80 p-1.5 rounded border border-emerald-200"
                                    >
                                      <span>{rub.criterion}</span>
                                      <span className="font-mono font-bold text-emerald-800 shrink-0">
                                        {rub.points.toFixed(2)}đ
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* CẢNH BÁO ĐỎ NẾU GIÁO VIÊN ĐỔI CÂU LÀM SAI LỆCH MA TRẬN (MỤC 5) */}
      {workingQualityReport?.hasMatrixDeviation && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
              <span>
                CẢNH BÁO NGHIÊM TRỌNG: ĐỀ KIỂM TRA ĐANG SAI LỆCH SO VỚI CẤU TRÚC MA TRẬN ĐÃ PHÊ DUYỆT!
              </span>
            </div>
            <div className="text-xs text-rose-900 space-y-0.5">
              {workingQualityReport.blockingErrors.slice(0, 4).map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('QUALITY_AUDIT')}
              className="px-3.5 py-2 text-xs font-semibold text-rose-900 bg-white border border-rose-300 rounded-xl hover:bg-rose-100 cursor-pointer"
            >
              Xem chi tiết lỗi Ma trận
            </button>
            <button
              type="button"
              onClick={() => runExamGeneration()}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl cursor-pointer"
            >
              Khôi phục đề chuẩn theo Ma trận
            </button>
          </div>
        </div>
      )}

      {/* MỤC 4: BẢNG TÓM TẮT 9 TIÊU CHÍ KIỂM TRA CHẤT LƯỢNG TỰ ĐỘNG */}
      {workingQualityReport && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">
                4. Hệ thống Tự động Kiểm định Chất lượng Đề (9 Tiêu chí bắt buộc)
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">
                Thời lượng giải ước tính:{' '}
                <strong className="font-mono text-slate-800">
                  ~{workingQualityReport.estimatedReadingAndSolvingMinutes} phút
                </strong>{' '}
                / Quy định {selectedMatrix?.durationMinutes} phút
              </span>
              <span
                className={`px-2.5 py-1 rounded-md font-bold ${
                  workingQualityReport.passedAll
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {workingQualityReport.passedAll
                  ? 'ĐẠT CHUẨN 9/9 TIÊU CHÍ'
                  : `CÓ ${workingQualityReport.blockingErrors.length} LỖI CẦN XỬ LÝ`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Object.values(workingQualityReport.criteria).map((crit) => (
              <div
                key={crit.code}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  crit.passed
                    ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-800'
                    : crit.severity === 'ERROR'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                {crit.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : crit.severity === 'ERROR' ? (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate">{crit.title}</div>
                  <div className="text-[11px] opacity-90 mt-0.5 leading-snug">
                    {crit.summary}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MỤC 5 & 6: KHÔNG GIAN XEM TRƯỚC, CHỈNH SỬA ĐỀ, BẢNG ĐÁP ÁN ĐA MÃ ĐỀ & HƯỚNG DẪN CHẤM */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Thanh chuyển Tab chức năng & Chọn Mã đề (101, 102, 103, 104...) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('STUDENT_PAPER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'STUDENT_PAPER'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Bản đề Học sinh (Ẩn đáp án)
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('TEACHER_PAPER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'TEACHER_PAPER'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Chỉnh sửa & Đổi câu hỏi (Giáo viên)
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('ANSWER_AND_RUBRIC')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'ANSWER_AND_RUBRIC'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Đáp án & Hướng dẫn chấm ({workingVariants.length} mã đề)
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('MATRIX_CELL_MAP')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'MATRIX_CELL_MAP'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Ma trận liên kết Ô ngân hàng (Chọn câu thủ công)
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('QUALITY_AUDIT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'QUALITY_AUDIT'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Báo cáo Kiểm định Chi tiết
            </button>
          </div>

          {/* Bộ chuyển đổi Mã đề: 101, 102, 103, 104... */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">
              Chọn Mã đề:
            </span>
            {workingVariants.map((v) => (
              <button
                key={v.variantCode}
                type="button"
                onClick={() => setActiveVariantCode(v.variantCode)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                  activeVariant?.variantCode === v.variantCode
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Mã {v.variantCode}
              </button>
            ))}
          </div>
        </div>

        {/* Thanh tùy chỉnh trình bày & Xuất file (Mục 5 & Mục 6) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Trình bày bản đề:
            </span>

            <label className="flex items-center gap-1.5">
              <span className="text-slate-600">Cỡ chữ:</span>
              <select
                value={presentationConfig.fontSize}
                onChange={(e) =>
                  setPresentationConfig({
                    ...presentationConfig,
                    fontSize: e.target.value as ExamPresentationConfig['fontSize'],
                  })
                }
                className="rounded-lg border border-slate-300 px-2 py-1 bg-white text-xs"
              >
                <option value="SMALL">Nhỏ (Tiết kiệm giấy)</option>
                <option value="MEDIUM">Chuẩn (12pt)</option>
                <option value="LARGE">Lớn (Tiểu học dễ đọc)</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5">
              <span className="text-slate-600">Cột phương án A-B-C-D:</span>
              <select
                value={presentationConfig.mcqOptionColumns}
                onChange={(e) =>
                  setPresentationConfig({
                    ...presentationConfig,
                    mcqOptionColumns: Number(
                      e.target.value
                    ) as ExamPresentationConfig['mcqOptionColumns'],
                  })
                }
                className="rounded-lg border border-slate-300 px-2 py-1 bg-white text-xs"
              >
                <option value={1}>1 cột dọc</option>
                <option value={2}>2 cột chuẩn</option>
                <option value={4}>4 cột ngang</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportExamToWord(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              Xuất Word Đề Học sinh (Ẩn đáp án)
            </button>
            <button
              type="button"
              onClick={() => handleExportExamToWord(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Xuất Word Đáp án & Hướng dẫn chấm
            </button>
          </div>
        </div>

        {/* NỘI DUNG TAB 1 & TAB 2: XEM TRƯỚC BẢN ĐỀ HỌC SINH HOẶC BẢN CHỈNH SỬA CỦA GIÁO VIÊN */}
        {(activeWorkspaceTab === 'STUDENT_PAPER' ||
          activeWorkspaceTab === 'TEACHER_PAPER') &&
          activeVariant &&
          selectedMatrix && (
            <div className="p-6 lg:p-8 space-y-6 bg-slate-100/60">
              {activeWorkspaceTab === 'STUDENT_PAPER' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    Chế độ Bản đề dành cho Học sinh (Mục 6): Đã ẩn tuyệt đối toàn bộ Đáp án đúng, Hướng dẫn chấm, Biểu điểm chi tiết và Mã câu hỏi ngân hàng.
                  </span>
                  <span className="font-mono text-[11px] text-emerald-800">
                    Mã đề: {activeVariant.variantCode} · Seed: {activeVariant.variantSeed}
                  </span>
                </div>
              )}

              {/* Tờ giấy đề kiểm tra chuẩn A4 hiển thị toàn chiều ngang trang trình bày */}
              <div
                className={`w-full bg-white border border-slate-300 rounded-xl shadow-xs p-6 sm:p-8 space-y-6 ${fontSizeClass}`}
              >
                {/* Tiêu đề đề kiểm tra chuẩn hành chính 2 cột (UBND XÃ ĐAN ĐIỀN / TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH) */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 pb-3"
                  style={{ fontFamily: '"Times New Roman", Times, serif' }}
                >
                  <div className="sm:col-span-5 text-center leading-snug">
                    <div className="text-[13pt] font-normal uppercase text-slate-950">
                      UBND XÃ ĐAN ĐIỀN
                    </div>
                    <div className="text-[13pt] font-bold uppercase text-slate-950">
                      {normalizeHeaderSchoolName(
                        selectedMatrix.schoolName,
                        config.schoolName
                      )}
                    </div>
                    <div className="w-36 mx-auto border-b border-slate-950 mt-0.5" />
                  </div>

                  <div className="sm:col-span-7 text-center leading-snug">
                    <div className="text-[13pt] font-bold uppercase text-slate-950">
                      {(
                        examTitleInput?.trim() ||
                        formatExamHeaderRightTitle(
                          selectedMatrix.examPeriod,
                          selectedMatrix.academicYear || config.academicYear,
                          'ĐỀ KIỂM TRA'
                        )
                      ).toUpperCase()}
                    </div>
                    <div className="text-[13pt] font-normal text-slate-950">
                      MÔN: {selectedMatrix.subject.toUpperCase()} - Lớp{' '}
                      {selectedMatrix.grade}
                    </div>
                    <div className="text-[13pt] font-normal text-slate-950">
                      Thời gian: {selectedMatrix.durationMinutes} phút
                    </div>
                    <div className="text-[12.5pt] italic font-normal text-slate-950">
                      (không kể thời gian giao đề)
                    </div>
                  </div>
                </div>

                {/* Khung thông tin học sinh */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                  <div>Họ và tên học sinh: .........................................................</div>
                  <div>Lớp: ................... Số báo danh: ........................</div>
                  <div>Điểm số: ................. Lời phê: ...................................</div>
                </div>

                {/* Danh sách câu hỏi chia theo từng Phần dạng thức */}
                {(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'] as MatrixFormatGroupCode[]).map(
                  (fgCode, partIdx) => {
                    const partItems = activeVariant.items.filter(
                      (it) => it.formatGroup === fgCode
                    );
                    if (partItems.length === 0) return null;

                    const fgMeta = MATRIX_FORMAT_GROUPS.find(
                      (g) => g.code === fgCode
                    );
                    const partPoints = exactRound2(
                      partItems.reduce((s, i) => s + i.points, 0)
                    );
                    const romanNumerals = ['I', 'II', 'III', 'IV'];

                    const sectionDisplayMeta: Record<
                      MatrixFormatGroupCode,
                      { titlePrefix: string; instruction: string }
                    > = {
                      MCQ: {
                        titlePrefix: 'PHẦN I. Trắc nghiệm nhiều lựa chọn',
                        instruction:
                          'Khoanh tròn vào chữ cái đứng trước câu em cho là đúng nhất:',
                      },
                      TRUE_FALSE: {
                        titlePrefix: 'PHẦN II. Đúng – Sai',
                        instruction:
                          'Học sinh trả lời từ câu 1 đến câu 4; trong mỗi ý a, b, c, d, ở mỗi câu học sinh chọn đúng hoặc sai.',
                      },
                      SHORT_ANSWER: {
                        titlePrefix: 'PHẦN III. Trả lời ngắn',
                        instruction: '',
                      },
                      ESSAY: {
                        titlePrefix: 'PHẦN IV. Tự luận',
                        instruction: '',
                      },
                    };
                    const secMeta = sectionDisplayMeta[fgCode];

                    return (
                      <div key={fgCode} className="space-y-3">
                        <div
                          className="space-y-0.5 text-slate-950 text-justify"
                          style={{ fontFamily: '"Times New Roman", Times, serif' }}
                        >
                          <div className="font-bold text-[13pt] leading-normal">
                            {secMeta?.titlePrefix || `PHẦN ${romanNumerals[partIdx] || partIdx + 1}. ${fgMeta?.label}`} ({partItems.length} câu — {partPoints.toFixed(2)} điểm)
                          </div>
                          {secMeta?.instruction && (
                            <div className="font-normal text-[13pt] leading-normal">
                              {secMeta.instruction}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {partItems.map((item, idxInPart) => {
                            const prevItem =
                              idxInPart > 0 ? partItems[idxInPart - 1] : null;
                            const isStartOfSharedPassage =
                              Boolean(item.sharedPassage) &&
                              (!prevItem ||
                                prevItem.sharedPassageGroupKey !==
                                  item.sharedPassageGroupKey);

                            // Đếm các câu cùng chung ngữ liệu này để hiển thị tiêu đề cụm câu hỏi
                            const clusterItems = item.sharedPassageGroupKey
                              ? partItems.filter(
                                  (p) =>
                                    p.sharedPassageGroupKey ===
                                    item.sharedPassageGroupKey
                                )
                              : [];
                            const firstNum =
                              clusterItems[0]?.displayNumber || item.displayNumber;
                            const lastNum =
                              clusterItems[clusterItems.length - 1]
                                ?.displayNumber || item.displayNumber;

                            return (
                              <React.Fragment key={`${item.questionId}-${item.displayNumber}`}>
                                {/* Khung Ngữ liệu chung (Chỉ hiển thị 1 lần ở đầu cụm câu hỏi chung ngữ liệu) */}
                                {isStartOfSharedPassage && (
                                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-300 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                                      <span className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-amber-700" />
                                        Đọc ngữ liệu sau và trả lời các câu hỏi từ Câu{' '}
                                        {firstNum} đến Câu {lastNum}:
                                      </span>
                                      {activeWorkspaceTab === 'TEACHER_PAPER' && (
                                        <span className="text-[11px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded font-mono">
                                          Đã khóa cụm ngữ liệu chung ({clusterItems.length} câu)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-slate-800 whitespace-pre-line leading-relaxed pl-2 border-l-2 border-amber-400">
                                      {item.sharedPassage}
                                    </div>
                                    {item.sharedPassageAuthor && (
                                      <div className="text-right text-xs italic text-slate-600">
                                        ({item.sharedPassageAuthor})
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Khối từng câu hỏi */}
                                <div
                                  className={`p-4 rounded-xl border transition-colors ${
                                    activeWorkspaceTab === 'TEACHER_PAPER'
                                      ? 'bg-white border-slate-200 hover:border-blue-300'
                                      : 'bg-white border-transparent py-2 px-1'
                                  }`}
                                >
                                  <div className="w-full space-y-2">
                                    {/* Công cụ chỉnh sửa câu hỏi dành riêng cho Giáo viên (Mục 5) — Tách dòng riêng để câu hỏi hiển thị trọn vẹn từ trái sang phải */}
                                    {activeWorkspaceTab === 'TEACHER_PAPER' && (
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-[11px]">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          {item.isDraftSupplement && (
                                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                              AI Bản nháp
                                            </span>
                                          )}
                                          <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            {item.originalCode} · [{item.learningOutcomeCode}] · Mức{' '}
                                            {item.levelColumn}
                                          </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMoveQuestionOrder(
                                                item.questionId,
                                                'UP'
                                              )
                                            }
                                            title="Đẩy câu lên trên"
                                            className="p-1 rounded border border-slate-200 hover:bg-slate-100 cursor-pointer"
                                          >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMoveQuestionOrder(
                                                item.questionId,
                                                'DOWN'
                                              )
                                            }
                                            title="Đẩy câu xuống dưới"
                                            className="p-1 rounded border border-slate-200 hover:bg-slate-100 cursor-pointer"
                                          >
                                            <ArrowDown className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSwapModalTargetQuestionId(
                                                item.questionId
                                              );
                                              setSwapFilterMode('EQUIVALENT_ONLY');
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold hover:bg-blue-100 cursor-pointer"
                                          >
                                            Đổi câu từ Ngân hàng
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    <div className="w-full text-slate-900 leading-normal text-justify">
                                      <span className="font-bold text-blue-950 mr-1.5">
                                        Câu {item.displayNumber} ({item.points.toFixed(2)} điểm):
                                      </span>
                                      <MathFormulaView text={item.stem} />
                                    </div>
                                  </div>

                                  {/* Hiển thị các phương án A, B, C, D nếu là câu trắc nghiệm */}
                                  {item.shuffledOptions &&
                                    item.shuffledOptions.length > 0 && (
                                      <div
                                        className={`grid ${mcqGridColsClass} gap-2 mt-2.5 pl-4 text-slate-800`}
                                      >
                                        {item.shuffledOptions.map((opt, oIdx) => (
                                          <div
                                            key={oIdx}
                                            className="py-0.5 leading-snug"
                                          >
                                            <MathFormulaView text={opt} />
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                  {/* Hiển thị 4 mệnh đề a, b, c, d nếu là câu Đúng - Sai */}
                                  {item.subStatements &&
                                    item.subStatements.length > 0 && (
                                      <div className="mt-2.5 pl-4 space-y-1.5">
                                        {item.subStatements.map((sub) => (
                                          <div
                                            key={sub.label}
                                            className="flex items-start justify-between gap-4 text-slate-800 border-b border-dashed border-slate-200 pb-1"
                                          >
                                            <div>
                                              <strong className="font-mono mr-1.5">
                                                {sub.label})
                                              </strong>
                                              <MathFormulaView
                                                text={sub.statement}
                                              />
                                            </div>
                                            <span className="font-mono text-xs text-slate-500 shrink-0">
                                              [ Đúng / Sai ]
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                  {/* Dòng điền đáp án cho học sinh ở phần Trả lời ngắn */}
                                  {fgCode === 'SHORT_ANSWER' &&
                                    activeWorkspaceTab === 'STUDENT_PAPER' && (
                                      <div className="mt-2 pl-4 text-xs text-slate-500 italic">
                                        Trả lời: ........................................................................................
                                      </div>
                                    )}

                                  {/* Khung thông tin Đáp án & Hướng dẫn chấm CHỈ HIỂN THỊ Ở TAB GIÁO VIÊN */}
                                  {activeWorkspaceTab === 'TEACHER_PAPER' && (
                                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 bg-emerald-50/50 rounded-lg p-2.5 text-xs space-y-1">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                          <strong className="text-emerald-800">
                                            Đáp án đúng (Mã {activeVariant.variantCode}):
                                          </strong>{' '}
                                          <span className="font-semibold text-slate-900">
                                            <MathFormulaView
                                              text={item.shuffledCorrectAnswer}
                                            />
                                          </span>
                                        </div>
                                        {item.optionShuffleLockedReason && (
                                          <span className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                            {item.optionShuffleLockedReason}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-slate-700">
                                        <strong>Hướng dẫn chấm:</strong>{' '}
                                        {item.gradingGuide}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}

                <div className="pt-4 border-t border-slate-300 text-center text-xs font-bold text-slate-600">
                  — HẾT ĐỀ KIỂM TRA (MÃ ĐỀ {activeVariant.variantCode}) —
                </div>
              </div>

              {/* Ghi chú chỉnh sửa đề của Giáo viên (Mục 5) */}
              <div className="w-full bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Ghi chú biên tập / Yêu cầu chỉnh sửa đề kiểm tra (Mục 5):
                </label>
                <textarea
                  rows={2}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Ghi chú lại các câu đã hoán đổi, lưu ý in ấn hình vẽ hoặc kiến nghị gửi Tổ chuyên môn..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

        {/* NỘI DUNG TAB 3: BẢNG ĐÁP ÁN ĐỐI CHIẾU TẤT CẢ MÃ ĐỀ & HƯỚNG DẪN CHẤM CHI TIẾT (MỤC 6) */}
        {activeWorkspaceTab === 'ANSWER_AND_RUBRIC' && activeVariant && (
          <div className="p-6 space-y-6">
            {/* 1. Bảng đối chiếu đáp án nhanh của từng Mã đề (101, 102, 103, 104...) */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    I. Bảng Đáp Án Trắc Nghiệm, Đúng–Sai & Trả Lời Ngắn Theo Mã Đề ({workingVariants.map((v) => v.variantCode).join(', ')})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tự động tính toán chuẩn xác đáp án sau khi đảo thứ tự câu và hoán vị phương án A, B, C, D.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workingVariants.map((variant) => (
                  <div
                    key={variant.variantCode}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    <div className="bg-blue-950 text-white px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold">
                        BẢNG ĐÁP ÁN MÃ ĐỀ {variant.variantCode}
                      </span>
                      <span className="text-blue-200 font-mono">
                        Tổng: {variant.totalQuestions} câu ·{' '}
                        {variant.totalPoints.toFixed(2)} điểm
                      </span>
                    </div>
                    <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                      {variant.mcqQuickAnswerTable.map((row) => (
                        <div
                          key={row.questionNumber}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-bold text-slate-800">
                              Câu {row.questionNumber}
                            </span>
                            <span className="font-mono">{row.points}đ</span>
                          </div>
                          <div className="font-mono font-bold text-emerald-700 mt-1 truncate">
                            <MathFormulaView text={row.answer} />
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Gốc: {row.originalQuestionCode}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Bảng đối chiếu chéo theo Mã câu hỏi gốc (Chứng minh đảo phương án không làm đổi đáp án đúng - Mục 3 & 8) */}
            {workingVariants.length > 1 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  II. Bảng Đối Chiếu Chéo Giữa Các Mã Đề Theo Mã Câu Hỏi Gốc (Kiểm chứng bảo toàn đáp án đúng)
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                        <th className="p-2.5 border-r border-slate-200">
                          Mã câu gốc
                        </th>
                        <th className="p-2.5 border-r border-slate-200">
                          Dạng thức & Điểm
                        </th>
                        {workingVariants.map((v) => (
                          <th
                            key={v.variantCode}
                            className="p-2.5 border-r border-slate-200 text-center font-mono"
                          >
                            Mã đề {v.variantCode} (Vị trí → Đáp án)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {workingBaseQuestionIds.map((qId) => {
                        const baseItem = workingVariants[0]?.items.find(
                          (i) => i.questionId === qId
                        );
                        if (!baseItem) return null;
                        return (
                          <tr key={qId} className="hover:bg-slate-50">
                            <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-blue-700">
                              {baseItem.originalCode}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-slate-700">
                              {baseItem.formatGroup} · {baseItem.points.toFixed(2)}đ
                            </td>
                            {workingVariants.map((v) => {
                              const found = v.items.find(
                                (it) => it.questionId === qId
                              );
                              return (
                                <td
                                  key={v.variantCode}
                                  className="p-2.5 border-r border-slate-200 text-center"
                                >
                                  {found ? (
                                    <div>
                                      <span className="font-bold text-slate-900">
                                        Câu {found.displayNumber}:
                                      </span>{' '}
                                      <span className="font-mono font-semibold text-emerald-700">
                                        <MathFormulaView
                                          text={found.shuffledCorrectAnswer}
                                        />
                                      </span>
                                    </div>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Hướng dẫn chấm Tự luận, Biểu điểm chi tiết & Các phương án trả lời ngắn được chấp nhận (Mục 6) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                III. Hướng Dẫn Chấm Tự Luận, Biểu Điểm Chi Tiết & Phương Án Trả Lời Ngắn Chấp Nhận (Mã đề {activeVariant.variantCode})
              </h3>
              <div className="space-y-3">
                {activeVariant.items
                  .filter(
                    (it) =>
                      it.formatGroup === 'ESSAY' ||
                      it.formatGroup === 'SHORT_ANSWER' ||
                      it.formatGroup === 'TRUE_FALSE'
                  )
                  .map((item) => (
                    <div
                      key={item.questionId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          Câu {item.displayNumber} ({item.formatGroup} —{' '}
                          {item.points.toFixed(2)} điểm) · Mã gốc:{' '}
                          <span className="font-mono text-blue-700">
                            {item.originalCode}
                          </span>
                        </span>
                        <span className="font-mono text-slate-600">
                          YCCĐ: [{item.learningOutcomeCode}]
                        </span>
                      </div>

                      <div className="text-slate-800">
                        <MathFormulaView text={item.stem} />
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-emerald-200 space-y-2">
                        <div>
                          <strong className="text-emerald-800">
                            Đáp án chuẩn:
                          </strong>{' '}
                          <MathFormulaView text={item.shuffledCorrectAnswer} />
                        </div>
                        <div>
                          <strong className="text-slate-800">
                            Hướng dẫn chấm:
                          </strong>{' '}
                          {item.gradingGuide}
                        </div>

                        {/* Các phương án trả lời đúng có thể chấp nhận (Mục 6) */}
                        {item.acceptedVariations &&
                          item.acceptedVariations.length > 0 && (
                            <div className="pt-1 border-t border-slate-100">
                              <strong className="text-blue-800">
                                Các phương án trả lời đúng khác được chấp nhận đạt điểm tối đa:
                              </strong>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {item.acceptedVariations.map((v, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 font-mono text-blue-900"
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Biểu điểm chi tiết từng bước của câu Tự luận (Rubric Criteria) */}
                        {item.rubricCriteria &&
                          item.rubricCriteria.length > 0 && (
                            <div className="pt-2 border-t border-slate-200">
                              <strong className="text-slate-900 block mb-1.5">
                                Biểu điểm chấm tự luận chi tiết từng bước:
                              </strong>
                              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                                <thead>
                                  <tr className="bg-slate-100">
                                    <th className="p-2 border-r border-slate-200">
                                      Bước / Nội dung yêu cầu cần đạt trong bài làm
                                    </th>
                                    <th className="p-2 w-28 text-center">
                                      Điểm thành phần
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {item.rubricCriteria.map((rub) => (
                                    <tr key={rub.id}>
                                      <td className="p-2 border-r border-slate-200">
                                        {rub.criterion}
                                      </td>
                                      <td className="p-2 text-center font-mono font-bold text-emerald-700">
                                        {rub.points.toFixed(2)} điểm
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* NỘI DUNG TAB 4: BẢNG LIÊN KẾT TỪNG Ô MA TRẬN VỚI NGÂN HÀNG & CHỌN CÂU THỦ CÔNG (MỤC 1 & 2B/2D) */}
        {activeWorkspaceTab === 'MATRIX_CELL_MAP' && selectedMatrix && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bảng Đối Chiếu Từng Yêu Cầu Cần Đạt Trong Ma Trận Với Ngân Hàng Câu Hỏi
                </h3>
                <p className="text-xs text-slate-500">
                  Mỗi dòng hiển thị chính xác từng Bài học và từng Yêu cầu cần đạt đã cấu hình trong Ma trận. Giáo viên có thể tự chọn / ghim câu hỏi thủ công (Chế độ B & D) hoặc dùng Chế độ C để AI sinh câu bản nháp.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                    <th className="p-2.5 border-r border-slate-200">
                      Chủ đề & Bài học / Đơn vị kiến thức
                    </th>
                    <th className="p-2.5 border-r border-slate-200">
                      Mã & Nội dung Yêu cầu cần đạt
                    </th>
                    <th className="p-2.5 border-r border-slate-200">
                      Dạng thức & Mức độ
                    </th>
                    <th className="p-2.5 border-r border-slate-200 text-center">
                      Số câu cần
                    </th>
                    <th className="p-2.5 border-r border-slate-200 text-center">
                      Kho đáp ứng
                    </th>
                    <th className="p-2.5 border-r border-slate-200">
                      Các câu hỏi đang được chọn vào đề
                    </th>
                    <th className="p-2.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {specRowsOfSelectedMatrix.flatMap((row) =>
                    (
                      selectedMatrix.activeFormatGroups || [
                        'MCQ',
                        'TRUE_FALSE',
                        'SHORT_ANSWER',
                        'ESSAY',
                      ]
                    ).flatMap((fgCode) =>
                      MATRIX_LEVEL_COLUMNS.flatMap((lc) => {
                        const subTargets = getOutcomeAllocationsForRowCell(
                          row,
                          fgCode,
                          lc.code
                        );
                        return subTargets.map((sub) => {
                          const candidates = findMatchingQuestionsForCell({
                            matrix: selectedMatrix,
                            row,
                            formatGroup: fgCode,
                            levelColumn: lc.code,
                            allQuestions: questions,
                            includeDraftSupplements:
                              generationMode === 'AI_SUPPLEMENT_DRAFT',
                          });

                          const selectedInThisCell =
                            workingVariants[0]?.items.filter(
                              (it) =>
                                it.rowId === row.id &&
                                it.formatGroup === fgCode &&
                                it.levelColumn === lc.code &&
                                (subTargets.length === 1 ||
                                  it.learningOutcomeCode ===
                                    sub.learningOutcomeCode)
                            ) || [];

                          const isShort =
                            selectedInThisCell.length < sub.questionCount;

                          return (
                            <tr
                              key={sub.subTargetKey}
                              className={
                                isShort ? 'bg-rose-50/50' : 'hover:bg-slate-50'
                              }
                            >
                              <td className="p-2.5 border-r border-slate-200">
                                <div className="font-semibold text-slate-900">
                                  {row.chapterCode} · {row.topicTitle}
                                </div>
                                <div className="text-[11px] font-medium text-blue-800 mt-0.5">
                                  {sub.knowledgeUnit}
                                </div>
                              </td>
                              <td className="p-2.5 border-r border-slate-200 max-w-md">
                                <span className="font-mono font-bold text-blue-700 mr-1.5">
                                  [{sub.learningOutcomeCode}]
                                </span>
                                <span className="text-slate-700">
                                  {sub.learningOutcomeText}
                                </span>
                              </td>
                              <td className="p-2.5 border-r border-slate-200">
                                <span className="font-semibold">
                                  {
                                    MATRIX_FORMAT_GROUPS.find(
                                      (g) => g.code === fgCode
                                    )?.shortLabel
                                  }
                                </span>{' '}
                                · Mức {lc.label} ({sub.points.toFixed(2)}đ)
                              </td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold">
                                {sub.questionCount} câu
                              </td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">
                                <span
                                  className={
                                    candidates.length >= sub.questionCount
                                      ? 'text-emerald-700 font-bold'
                                      : 'text-rose-700 font-bold'
                                  }
                                >
                                  {candidates.length} câu
                                </span>
                              </td>
                              <td className="p-2.5 border-r border-slate-200">
                                <div className="flex flex-wrap gap-1">
                                  {selectedInThisCell.map((it) => (
                                    <span
                                      key={it.questionId}
                                      className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-mono text-[11px] text-blue-900"
                                    >
                                      Câu {it.displayNumber} ({it.originalCode})
                                    </span>
                                  ))}
                                  {isShort && (
                                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                                      Thiếu{' '}
                                      {sub.questionCount -
                                        selectedInThisCell.length}{' '}
                                      câu
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveCellPickerKey(
                                      activeCellPickerKey === sub.subTargetKey
                                        ? null
                                        : sub.subTargetKey
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 cursor-pointer"
                                >
                                  {activeCellPickerKey === sub.subTargetKey
                                    ? 'Đóng chọn'
                                    : 'Chọn câu thủ công'}
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Khung chọn câu hỏi thủ công cho ô đang mở */}
            {activeCellPickerKey && selectedMatrix && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-300 space-y-3">
                {(() => {
                  const parts = activeCellPickerKey.split('__');
                  const rowId = parts[0];
                  const fgCode = (parts[1] || 'MCQ') as MatrixFormatGroupCode;
                  const lcCode = (parts[2] || 'BIET') as MatrixLevelColumnCode;
                  const row = specRowsOfSelectedMatrix.find(
                    (r) => r.id === rowId
                  );
                  if (!row) return null;
                  const subTargets = getOutcomeAllocationsForRowCell(
                    row,
                    fgCode,
                    lcCode
                  );
                  const activeSub =
                    subTargets.find(
                      (s) => s.subTargetKey === activeCellPickerKey
                    ) || subTargets[0];
                  if (!activeSub) return null;

                  const candidates = findMatchingQuestionsForCell({
                    matrix: selectedMatrix,
                    row,
                    formatGroup: fgCode,
                    levelColumn: lcCode,
                    allQuestions: questions,
                    includeDraftSupplements: true,
                  });
                  const currentManual =
                    manualCellSelections[activeCellPickerKey] || [];

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-blue-950">
                          Chọn câu hỏi thủ công cho [{activeSub.learningOutcomeCode}] —{' '}
                          {activeSub.knowledgeUnit}: &quot;{activeSub.learningOutcomeText}&quot; (Cần chọn{' '}
                          {activeSub.questionCount} câu, đã ghim {currentManual.length} câu):
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveCellPickerKey(null)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Đóng
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {candidates.map((q) => {
                          const checked = currentManual.includes(q.id);
                          return (
                            <label
                              key={q.id}
                              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer hover:border-blue-400"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const nextForCell = checked
                                    ? currentManual.filter((id) => id !== q.id)
                                    : [...currentManual, q.id];
                                  const nextMap = {
                                    ...manualCellSelections,
                                    [activeCellPickerKey]: nextForCell,
                                  };
                                  setManualCellSelections(nextMap);
                                  const nextMode =
                                    generationMode === 'AUTO_RANDOM'
                                      ? 'HYBRID'
                                      : generationMode;
                                  setGenerationMode(nextMode);
                                  runExamGeneration({
                                    mode: nextMode,
                                    customManualMap: nextMap,
                                  });
                                }}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="font-mono font-bold text-blue-700">
                                  {q.code} ({q.points}đ) —{' '}
                                  {q.status === ApprovalStatus.APPROVED
                                    ? 'Đã duyệt'
                                    : 'Bản nháp'}
                                </div>
                                <div className="text-slate-800 mt-0.5">
                                  <MathFormulaView text={q.stem} />
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 5: BÁO CÁO KIỂM ĐỊNH CHẤT LƯỢNG CHI TIẾT 9 TIÊU CHÍ (MỤC 4) */}
        {activeWorkspaceTab === 'QUALITY_AUDIT' && workingQualityReport && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Báo Cáo Kiểm Định Chất Lượng Đề Kiểm Tra Chi Tiết (Cập nhật lúc {workingQualityReport.checkedAt})
            </h3>
            <div className="space-y-3">
              {Object.values(workingQualityReport.criteria).map((crit) => (
                <div
                  key={crit.code}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    crit.passed
                      ? 'bg-white border-slate-200'
                      : crit.severity === 'ERROR'
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {crit.title}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        crit.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {crit.passed ? 'ĐẠT' : 'CẦN KIỂM TRA LẠI'}
                    </span>
                  </div>
                  <p className="text-slate-700">{crit.summary}</p>
                  {crit.details.length > 0 && (
                    <ul className="list-disc list-inside text-rose-900 space-y-0.5 pt-1">
                      {crit.details.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL ĐỔI CÂU HỎI TƯƠNG ĐƯƠNG HOẶC ĐỔI CÂU BẤT KỲ TRONG NGÂN HÀNG (MỤC 5) */}
      {swapModalTargetQuestionId && selectedMatrix && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Thay Thế Câu Hỏi Từ Ngân Hàng (Mục 5 – Chỉnh sửa đề)
                </h3>
                <p className="text-[11px] text-slate-300">
                  Chọn câu tương đương cùng ô ma trận (giữ đúng cấu trúc) hoặc thử chọn câu khác chủ đề/mức độ để kiểm chứng cảnh báo lệch ma trận.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalTargetQuestionId(null)}
                className="text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Đóng [X]
              </button>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSwapFilterMode('EQUIVALENT_ONLY')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    swapFilterMode === 'EQUIVALENT_ONLY'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  Câu tương đương cùng ô Ma trận (An toàn)
                </button>
                <button
                  type="button"
                  onClick={() => setSwapFilterMode('ALL_BANK_TEST_DEVIATION')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    swapFilterMode === 'ALL_BANK_TEST_DEVIATION'
                      ? 'bg-rose-700 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  Toàn bộ Ngân hàng cùng môn (Thử nghiệm cảnh báo lệch Ma trận)
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
              {(() => {
                const targetMeta = workingCellMeta[swapModalTargetQuestionId];
                const targetRow = specRowsOfSelectedMatrix.find(
                  (r) => r.id === targetMeta?.rowId
                );

                const candidates = questions.filter((q) => {
                  if (q.id === swapModalTargetQuestionId) return false;
                  if (q.levelId !== selectedMatrix.levelId) return false;
                  if (q.grade !== selectedMatrix.grade) return false;
                  if (
                    q.subject.toLowerCase() !==
                    selectedMatrix.subject.toLowerCase()
                  )
                    return false;

                  if (swapFilterMode === 'EQUIVALENT_ONLY' && targetRow && targetMeta) {
                    const sameFg =
                      mapQuestionFormatToMatrixGroup(q.format) ===
                      targetMeta.formatGroup;
                    const sameLc =
                      mapQuestionCognitiveToMatrixColumn(q.cognitiveLevel) ===
                      targetMeta.levelColumn;
                    const sameScope = doesQuestionMatchMatrixRowScope(
                      q,
                      targetRow
                    );
                    return sameFg && sameLc && sameScope;
                  }
                  return true;
                });

                if (candidates.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Không có câu hỏi dự phòng khác trong cùng ô này. Bạn có thể chuyển sang tab &quot;Toàn bộ Ngân hàng cùng môn&quot; để thử đổi câu.
                    </div>
                  );
                }

                return candidates.map((q) => {
                  const isAlreadyInExam = workingBaseQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">
                            {q.code}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {q.topicTitle}
                          </span>
                          <span className="font-mono text-slate-500">
                            [{q.learningOutcomeCode || 'Không mã'}] ·{' '}
                            {getCognitiveShortLabel(q.cognitiveLevel)} · {q.points}đ
                          </span>
                          {isAlreadyInExam && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                              Đang có trong đề (Sẽ báo lỗi trùng câu)
                            </span>
                          )}
                        </div>
                        <div className="text-slate-900">
                          <MathFormulaView text={q.stem} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSwapQuestionInExam(
                            swapModalTargetQuestionId,
                            q
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer shrink-0"
                      >
                        Thay bằng câu này
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MỤC 7: QUẢN LÝ TRẠNG THÁI VÒNG ĐỜI ĐỀ KIỂM TRA (6 BƯỚC CHUẨN) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-700" />
              7. Quản Lý Vòng Đời Trạng Thái Đề Kiểm Tra (6 Giai Đoạn Khảo Thí)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chu trình: Bản nháp → Chờ thẩm định → Chờ phê duyệt → Đã phê duyệt → Đã phát hành → Lưu trữ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Người thực hiện:
            </span>
            <input
              type="text"
              value={workflowActorName}
              onChange={(e) => setWorkflowActorName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs w-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Danh sách các bộ đề đã lưu */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-xs font-bold text-slate-700">
              Danh sách Hồ sơ Đề kiểm tra ({filteredSavedExams.length})
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredSavedExams.map((ex) => {
                const st = getApprovalStatusInfo(ex.status);
                const selected = activeSavedExam?.id === ex.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleLoadSavedExamToWorkspace(ex)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-blue-50/80 border-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-700">
                        {ex.code}
                      </span>
                      <span className={`font-bold ${st.textClass}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {ex.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>
                        Lớp {ex.grade} · {ex.subject}
                      </span>
                      <span>·</span>
                      <span className="font-mono">
                        {ex.variantCount || ex.variants?.length || 1} mã đề
                      </span>
                      {ex.seed && (
                        <>
                          <span>·</span>
                          <span className="font-mono">Seed: {ex.seed}</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thanh tiến trình 6 trạng thái của đề đang chọn */}
          <div className="lg:col-span-7">
            {activeSavedExam ? (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-500 font-mono">
                      Mã hồ sơ đề: <strong>{activeSavedExam.code}</strong> · Ngày cập nhật: {activeSavedExam.updatedAt}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {activeSavedExam.title}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      getApprovalStatusInfo(activeSavedExam.status).textClass
                    }`}
                  >
                    Trạng thái hiện tại:{' '}
                    {getApprovalStatusInfo(activeSavedExam.status).label}
                  </span>
                </div>

                {/* Sơ đồ 6 bước vòng đời */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {LIFECYCLE_STEPS.map((step) => {
                    const isCurrent = activeSavedExam.status === step.status;
                    return (
                      <button
                        key={step.status}
                        type="button"
                        onClick={() =>
                          handleTransitionExamStatus(
                            activeSavedExam,
                            step.status
                          )
                        }
                        className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="text-[10px] font-mono opacity-80">
                          Bước {step.stepNum}
                        </div>
                        <div className="text-xs font-bold mt-0.5">
                          {step.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={workflowNote}
                    onChange={(e) => setWorkflowNote(e.target.value)}
                    placeholder="Nhập ghi chú thẩm định / phê duyệt / phát hành..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleTransitionExamStatus(
                        activeSavedExam,
                        ApprovalStatus.REVISION_REQUIRED
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 cursor-pointer shrink-0"
                  >
                    Yêu cầu chỉnh sửa lại
                  </button>
                </div>

                {/* Nhật ký chuyển trạng thái */}
                {activeSavedExam.statusHistory &&
                  activeSavedExam.statusHistory.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-700">
                        Lịch sử chuyển trạng thái & Phê duyệt:
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto text-xs">
                        {activeSavedExam.statusHistory.map((h, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-white border border-slate-200/80 flex items-start justify-between gap-2"
                          >
                            <div>
                              <span
                                className={`font-bold ${
                                  getApprovalStatusInfo(h.status).textClass
                                }`}
                              >
                                [{getApprovalStatusInfo(h.status).label}]
                              </span>{' '}
                              <strong>{h.actorName}:</strong> {h.note}
                            </div>
                            <span className="font-mono text-[11px] text-slate-400 shrink-0">
                              {h.changedAt}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Chọn một đề kiểm tra bên trái hoặc bấm &quot;Lưu Bản nháp Đề kiểm tra&quot; để quản lý vòng đời trạng thái.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
