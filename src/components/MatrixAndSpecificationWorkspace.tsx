import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookmarkPlus,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  GitBranch,
  History,
  Layers,
  Lock,
  Plus,
  Printer,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import {
  ApprovalStatus,
  CurriculumTopic,
  DataSourceFilter,
  EducationLevelId,
  ExamMatrix,
  FormatScoringRuleConfig,
  GradeNumber,
  MatrixCellValue,
  MatrixFormatGroupCode,
  MatrixLevelColumnCode,
  MatrixRowLessonItem,
  MatrixSpecificationRow,
  MatrixTemplateCode,
  QuestionItem,
  SavedDepartmentMatrixPreset,
  StorageConfig,
  TeacherPermissionProfileSummary,
} from '../types/domain';
import {
  filterByDataSource,
  getApprovalStatusInfo,
  getExamPeriodLabel,
  getRuleSetForLevel,
} from '../services/business/assessmentRules';
import { formatMathForWordHtml } from '../services/export/dossierExportService';
import {
  buildTestScenarioMatrix,
  computeMatrixSummary,
  createEmptyCellsForRow,
  distributeRowCellsAcrossLessonItems,
  ensureMatrixHasSpecRows,
  exactAdd,
  exactMul,
  exactPercentage,
  exactRound2,
  exactSub,
  getLessonItemCell,
  MATRIX_FORMAT_GROUPS,
  MATRIX_LEVEL_COLUMNS,
  MATRIX_TEMPLATES,
  rebalanceScoringRulesForActiveFormats,
  sumLessonItemsCells,
  syncSpecRowsToLegacyRows,
  validateMatrixForConfirmation,
  validateTemplateApplicability,
} from '../services/business/matrixCalculationService';
import { dataRepository, UpdateMatrixOutcome } from '../services/storage/repository';
import {
  cleanLearningOutcomeText,
  getSelectableLessonsForMatrix,
  groupLessonsByChapter,
  MatrixChapterGroup,
  SelectableMatrixLesson,
  splitCombinedChapterTitle,
  splitLessonOutcomes,
} from '../data/matrixLessonCatalog';

interface MatrixAndSpecificationWorkspaceProps {
  matrices: ExamMatrix[];
  topics: CurriculumTopic[];
  questions: QuestionItem[];
  config: StorageConfig;
  sourceFilter: DataSourceFilter;
  globalLevelFilter: EducationLevelId | 'ALL';
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  enforceTeacherScope?: boolean;
  onAddMatrix: (m: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>) => ExamMatrix;
  onUpdateMatrix: (
    id: string,
    updates: Partial<Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion?: boolean,
    editorNote?: string
  ) => UpdateMatrixOutcome | null;
  onDeleteMatrix: (id: string) => { deleted: boolean; message: string };
  onNotify: (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => void;
}

export const MatrixAndSpecificationWorkspace: React.FC<
  MatrixAndSpecificationWorkspaceProps
> = ({
  matrices,
  topics,
  questions,
  config,
  sourceFilter,
  globalLevelFilter,
  teacherPermissionProfile,
  enforceTeacherScope = false,
  onAddMatrix,
  onUpdateMatrix,
  onDeleteMatrix,
  onNotify,
}) => {
  const filteredMatrices = useMemo(() => {
    const bySource = filterByDataSource(matrices, sourceFilter);
    if (globalLevelFilter === 'ALL') return bySource;
    return bySource.filter((m) => m.levelId === globalLevelFilter);
  }, [matrices, sourceFilter, globalLevelFilter]);

  // Đang chọn xem/sửa ma trận nào trong danh sách
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(
    () => matrices[0]?.id || ''
  );

  // Tab chế độ làm việc: EDITOR (Thiết kế Ma trận & Cấu hình), SPECIFICATION (Bản đặc tả chi tiết & Lịch sử YCCĐ), A4_PREVIEW (Xem trước khổ A4 ngang & Xuất Word/Excel/PDF)
  const [activeTab, setActiveTab] = useState<
    'EDITOR' | 'SPECIFICATION' | 'A4_PREVIEW'
  >('EDITOR');

  // 1. State Thông tin chung của Đề kiểm tra (Mục 1)
  const [schoolName, setSchoolName] = useState<string>(config.schoolName);
  const [academicYear, setAcademicYear] = useState<string>(config.academicYear);
  const [title, setTitle] = useState<string>(
    'Ma trận & Bản đặc tả Đề kiểm tra Định kỳ Cuối kỳ I – Toán 6'
  );
  const [levelId, setLevelId] = useState<EducationLevelId>(
    EducationLevelId.LOWER_SECONDARY
  );
  const [grade, setGrade] = useState<GradeNumber>(6);
  const [subject, setSubject] = useState<string>('Toán');
  const [semester, setSemester] = useState<'HOC_KY_1' | 'HOC_KY_2' | 'CA_NAM'>(
    'HOC_KY_1'
  );
  const [examPeriod, setExamPeriod] =
    useState<ExamMatrix['examPeriod']>('CUOI_KY_1');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [targetTotalPoints, setTargetTotalPoints] = useState<number>(10);
  const [knowledgeScope, setKnowledgeScope] = useState<string>(
    'Theo phân phối chương trình Học kỳ I – GDPT 2018'
  );
  const [authorName, setAuthorName] = useState<string>(
    config.departmentName || 'Tổ Chuyên môn Nhà trường'
  );

  const ruleSet = useMemo(() => getRuleSetForLevel(levelId), [levelId]);

  // MỤC III: Đồng bộ Ma trận với phân quyền giáo viên (Chỉ hiển thị Cấp học, Môn học, Khối lớp được cấp)
  const isMatrixScopeRestricted = Boolean(
    enforceTeacherScope &&
      teacherPermissionProfile &&
      teacherPermissionProfile.subjectAllocations.length > 0
  );

  const allowedMatrixLevels = useMemo<EducationLevelId[]>(() => {
    if (!isMatrixScopeRestricted || !teacherPermissionProfile) {
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
  }, [isMatrixScopeRestricted, teacherPermissionProfile]);

  const allowedMatrixSubjects = useMemo<string[]>(() => {
    if (!isMatrixScopeRestricted || !teacherPermissionProfile) {
      return ruleSet.subjects;
    }
    const targetLvl =
      levelId === EducationLevelId.PRIMARY ? 'PRIMARY' : 'LOWER_SECONDARY';
    const subjects = teacherPermissionProfile.subjectAllocations
      .filter((a) => a.educationLevelId === targetLvl)
      .map((a) => a.subjectName);
    return subjects.length > 0 ? Array.from(new Set(subjects)) : ruleSet.subjects;
  }, [isMatrixScopeRestricted, teacherPermissionProfile, levelId, ruleSet.subjects]);

  const allowedMatrixGrades = useMemo<GradeNumber[]>(() => {
    if (!isMatrixScopeRestricted || !teacherPermissionProfile) {
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
  }, [
    isMatrixScopeRestricted,
    teacherPermissionProfile,
    levelId,
    subject,
    ruleSet.grades,
  ]);

  useEffect(() => {
    if (!isMatrixScopeRestricted || !teacherPermissionProfile) return;
    if (!allowedMatrixLevels.includes(levelId)) {
      setLevelId(allowedMatrixLevels[0]);
      return;
    }
    if (!allowedMatrixSubjects.includes(subject)) {
      setSubject(allowedMatrixSubjects[0]);
      return;
    }
    if (!allowedMatrixGrades.includes(grade)) {
      setGrade(allowedMatrixGrades[0]);
    }
  }, [
    isMatrixScopeRestricted,
    teacherPermissionProfile,
    allowedMatrixLevels,
    allowedMatrixSubjects,
    allowedMatrixGrades,
    levelId,
    subject,
    grade,
  ]);

  // 2. Bộ mẫu ma trận & Cấu hình cơ cấu đề (Mục 2, 3, 4)
  const [templateCode, setTemplateCode] =
    useState<MatrixTemplateCode>('TEMPLATE_A_CV7991');
  const [templateConfirmed, setTemplateConfirmed] = useState<boolean>(true);
  const [activeFormatGroups, setActiveFormatGroups] = useState<
    MatrixFormatGroupCode[]
  >(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']);
  const [targetLevelPercentages, setTargetLevelPercentages] = useState<
    Record<MatrixLevelColumnCode, number>
  >({
    BIET: 40,
    HIEU: 30,
    VAN_DUNG: 30,
  });
  const [scoringRules, setScoringRules] = useState<FormatScoringRuleConfig[]>(
    MATRIX_TEMPLATES.TEMPLATE_A_CV7991.defaultScoringRules
  );

  // 3. Các hàng của Ma trận & Bản đặc tả đồng bộ 2 chiều
  const [specRows, setSpecRows] = useState<MatrixSpecificationRow[]>([]);
  const [currentStatus, setCurrentStatus] = useState<ApprovalStatus>(
    ApprovalStatus.DRAFT
  );
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Quản lý cấu trúc dùng chung của Tổ chuyên môn
  const [departmentPresets, setDepartmentPresets] = useState<
    SavedDepartmentMatrixPreset[]
  >(() => dataRepository.getDepartmentMatrixPresets());
  const [presetNameInput, setPresetNameInput] = useState<string>('');
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);

  // Modal chỉnh sửa Yêu cầu cần đạt có lưu nguồn & lịch sử (Mục 6)
  const [editingOutcomeRowId, setEditingOutcomeRowId] = useState<string | null>(
    null
  );
  const [editingOutcomeText, setEditingOutcomeText] = useState<string>('');
  const [editingOutcomeReason, setEditingOutcomeReason] = useState<string>('');
  const [editorVersionNote, setEditorVersionNote] = useState<string>('');

  // Tải dữ liệu khi chọn một ma trận từ danh sách
  const loadMatrixIntoWorkspace = (matrix: ExamMatrix) => {
    setSelectedMatrixId(matrix.id);
    setSchoolName(matrix.schoolName || config.schoolName);
    setAcademicYear(matrix.academicYear || config.academicYear);
    setTitle(matrix.title);
    setLevelId(matrix.levelId);
    setGrade(matrix.grade);
    setSubject(matrix.subject);
    setSemester(matrix.semester || 'HOC_KY_1');
    setExamPeriod(matrix.examPeriod);
    setDurationMinutes(matrix.durationMinutes);
    setTargetTotalPoints(matrix.targetTotalPoints || matrix.totalPoints || 10);
    setKnowledgeScope(
      matrix.knowledgeScope || 'Theo kế hoạch giáo dục nhà trường'
    );
    setAuthorName(matrix.authorName || 'Tổ Chuyên môn');

    const defaultTpl: MatrixTemplateCode =
      matrix.templateCode ||
      (matrix.levelId === EducationLevelId.PRIMARY
        ? 'TEMPLATE_C_PRIMARY_APPROVED'
        : 'TEMPLATE_A_CV7991');

    const nextActiveFormats: MatrixFormatGroupCode[] =
      matrix.id === 'mat-test-2-viet4-approved' &&
      matrix.activeFormatGroups &&
      matrix.activeFormatGroups.length > 0
        ? matrix.activeFormatGroups
        : ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'];

    const rawRules: FormatScoringRuleConfig[] =
      matrix.scoringRules && matrix.scoringRules.length > 0
        ? matrix.scoringRules
        : MATRIX_TEMPLATES[defaultTpl].defaultScoringRules;

    const nextTotalPoints =
      matrix.targetTotalPoints || matrix.totalPoints || 10;
    const rawLoadedSpecRows = ensureMatrixHasSpecRows(matrix);

    // Chuẩn hóa dữ liệu cũ trong localStorage nếu kịch bản Toán 6 CV 7991 bị lưu 2 câu Tự luận ở Chương IV
    const loadedSpecRows =
      matrix.id === 'mat-test-1-math6-cv7991'
        ? rawLoadedSpecRows.map((r) => {
            if (r.id !== 'spec-m6-row-3') return r;
            const fixedCells = r.cells.map((c) =>
              c.formatGroup === 'ESSAY' &&
              c.levelColumn === 'VAN_DUNG' &&
              c.questionCount === 2 &&
              Math.abs(c.points - 1.0) < 1e-3
                ? { ...c, questionCount: 1, points: 1.0 }
                : c
            );
            return {
              ...r,
              cells: fixedCells,
              lessonItems: r.lessonItems
                ? distributeRowCellsAcrossLessonItems(fixedCells, r.lessonItems)
                : r.lessonItems,
            };
          })
        : rawLoadedSpecRows;

    const fallbackBalancedRules = rebalanceScoringRulesForActiveFormats(
      rawRules,
      nextActiveFormats,
      nextTotalPoints,
      matrix.levelId
    );

    const candidateRules: FormatScoringRuleConfig[] = MATRIX_FORMAT_GROUPS.map(
      (fgDef) => {
        const raw = rawRules.find((r) => r.formatGroup === fgDef.code);
        const balanced = fallbackBalancedRules.find(
          (r) => r.formatGroup === fgDef.code
        );
        const qInLoadedRows = loadedSpecRows.reduce(
          (sum, r) =>
            sum +
            r.cells
              .filter((c) => c.formatGroup === fgDef.code)
              .reduce((s, c) => s + Math.max(0, Math.round(c.questionCount || 0)), 0),
          0
        );
        const isFormatActive = nextActiveFormats.includes(fgDef.code);
        return {
          formatGroup: fgDef.code,
          defaultPointsPerQuestion:
            raw?.defaultPointsPerQuestion ||
            balanced?.defaultPointsPerQuestion ||
            0.25,
          targetQuestionCount: !isFormatActive
            ? 0
            : qInLoadedRows > 0
            ? qInLoadedRows
            : raw?.targetQuestionCount && raw.targetQuestionCount > 0
            ? raw.targetQuestionCount
            : balanced?.targetQuestionCount || 1,
          gradingRuleDescription:
            raw?.gradingRuleDescription ||
            balanced?.gradingRuleDescription ||
            '',
        };
      }
    );

    const candidatePointsSum = nextActiveFormats.reduce((sum, fg) => {
      const r = candidateRules.find((item) => item.formatGroup === fg);
      return exactAdd(
        sum,
        exactMul(r?.targetQuestionCount || 0, r?.defaultPointsPerQuestion || 0)
      );
    }, 0);

    const rawPointsSum = nextActiveFormats.reduce((sum, fg) => {
      const r = rawRules.find((item) => item.formatGroup === fg);
      return exactAdd(
        sum,
        exactMul(r?.targetQuestionCount || 0, r?.defaultPointsPerQuestion || 0)
      );
    }, 0);

    const isIntentionalWrongPointsScenario =
      matrix.id === 'mat-test-3-wrong-points' ||
      Math.abs((matrix.totalPoints || nextTotalPoints) - nextTotalPoints) > 0.01;

    const normalizedRules: FormatScoringRuleConfig[] =
      isIntentionalWrongPointsScenario ||
      Math.abs(candidatePointsSum - nextTotalPoints) <= 1e-3
        ? candidateRules
        : Math.abs(rawPointsSum - nextTotalPoints) <= 1e-3
        ? MATRIX_FORMAT_GROUPS.map((fgDef) => {
            const raw = rawRules.find((r) => r.formatGroup === fgDef.code);
            const balanced = fallbackBalancedRules.find(
              (r) => r.formatGroup === fgDef.code
            );
            const isFormatActive = nextActiveFormats.includes(fgDef.code);
            return {
              formatGroup: fgDef.code,
              defaultPointsPerQuestion:
                raw?.defaultPointsPerQuestion ||
                balanced?.defaultPointsPerQuestion ||
                0.25,
              targetQuestionCount: isFormatActive
                ? raw?.targetQuestionCount || balanced?.targetQuestionCount || 1
                : 0,
              gradingRuleDescription:
                raw?.gradingRuleDescription ||
                balanced?.gradingRuleDescription ||
                '',
            };
          })
        : fallbackBalancedRules;

    const lessonsForLoadedMatrix = getSelectableLessonsForMatrix(
      matrix.levelId,
      matrix.grade,
      matrix.subject,
      topics
    );
    const groupsForLoadedMatrix = groupLessonsByChapter(lessonsForLoadedMatrix);
    const { expanded: normalizedSpecRows } = expandCombinedRowsToSingleChapters(
      loadedSpecRows,
      groupsForLoadedMatrix
    );

    setTemplateCode(defaultTpl);
    setTemplateConfirmed(
      matrix.templateConfirmed !== undefined ? matrix.templateConfirmed : true
    );
    setActiveFormatGroups(nextActiveFormats);
    setTargetLevelPercentages(
      matrix.targetLevelPercentages ||
        MATRIX_TEMPLATES[defaultTpl].recommendedLevelPercentages
    );
    setScoringRules(normalizedRules);
    setSpecRows(normalizedSpecRows);
    setCurrentStatus(matrix.status);
    setCurrentVersion(matrix.version || 1);
    setIsLocked(
      matrix.status === ApprovalStatus.APPROVED || Boolean(matrix.isLocked)
    );
  };

  const hasAutoLoadedInitialMatrix = React.useRef(false);

  useEffect(() => {
    if (matrices.length === 0) return;
    if (!matrices.some((m) => m.id === selectedMatrixId)) {
      hasAutoLoadedInitialMatrix.current = true;
      loadMatrixIntoWorkspace(matrices[0]);
    } else if (!hasAutoLoadedInitialMatrix.current && specRows.length === 0) {
      hasAutoLoadedInitialMatrix.current = true;
      const found =
        matrices.find((m) => m.id === selectedMatrixId) || matrices[0];
      loadMatrixIntoWorkspace(found);
    }
  }, [matrices]);

  const activeMatrixRecord = useMemo(
    () => matrices.find((m) => m.id === selectedMatrixId) || null,
    [matrices, selectedMatrixId]
  );

  // Lọc danh sách Chủ đề từ CSDL Chương trình theo Cấp học, Lớp, Môn
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

  // Danh mục Bài sẽ kiểm tra (chia Học kì 1 & Học kì 2 kèm số tiết) và gom theo từng Chủ đề / Chương đơn lẻ
  const availableLessons = useMemo(
    () => getSelectableLessonsForMatrix(levelId, grade, subject, topics),
    [levelId, grade, subject, topics]
  );

  const hk1Lessons = useMemo(
    () => availableLessons.filter((l) => l.semester === 'HK1'),
    [availableLessons]
  );

  const hk2Lessons = useMemo(
    () => availableLessons.filter((l) => l.semester === 'HK2'),
    [availableLessons]
  );

  const chapterGroups = useMemo(
    () => groupLessonsByChapter(availableLessons),
    [availableLessons]
  );

  const hk1ChapterGroups = useMemo(
    () => chapterGroups.filter((cg) => cg.semester === 'HK1'),
    [chapterGroups]
  );

  const hk2ChapterGroups = useMemo(
    () => chapterGroups.filter((cg) => cg.semester === 'HK2'),
    [chapterGroups]
  );

  // Tìm nhóm Chủ đề / Chương khớp với một dòng specRow
  const findMatchingChapterGroupForRow = (
    row: MatrixSpecificationRow,
    groupsToSearch: MatrixChapterGroup[] = chapterGroups
  ): MatrixChapterGroup | undefined => {
    const codeNorm = (row.chapterCode || '').trim().toLowerCase();
    const titleNorm = (row.topicTitle || '').trim().toLowerCase();
    return groupsToSearch.find((cg) => {
      const cgCode = cg.chapterCode.trim().toLowerCase();
      const cgTitle = cg.chapterTitle.trim().toLowerCase();
      if (codeNorm && titleNorm && cgCode === codeNorm && cgTitle === titleNorm)
        return true;
      if (titleNorm && cgTitle === titleNorm) return true;
      if (
        codeNorm &&
        cgCode === codeNorm &&
        (cgTitle.includes(titleNorm) || titleNorm.includes(cgTitle))
      )
        return true;
      return false;
    });
  };

  // Chuyển đổi 1 bài học (SelectableMatrixLesson) thành N dòng Yêu cầu cần đạt (nếu bài có nhiều YCCĐ thì mỗi YCCĐ nằm trên 1 dòng riêng)
  const buildOutcomeRowsFromLesson = (
    ls: SelectableMatrixLesson,
    isSelected: boolean
  ): MatrixRowLessonItem[] => {
    const outcomes =
      ls.outcomesList && ls.outcomesList.length > 0
        ? ls.outcomesList
        : splitLessonOutcomes(ls.learningOutcomeText, ls.lessonName);
    const totalOut = Math.max(1, outcomes.length);

    return outcomes.map((outText, oIdx) => ({
      id: totalOut === 1 ? ls.id : `${ls.id}__yccd-${oIdx + 1}`,
      lessonId: ls.id,
      lessonName: ls.lessonName,
      periodsCount: ls.periodsCount,
      learningOutcomeCode:
        totalOut === 1
          ? ls.learningOutcomeCode
          : `${ls.learningOutcomeCode}.${oIdx + 1}`,
      learningOutcomeText: outText,
      outcomeIndex: oIdx + 1,
      totalOutcomesInLesson: totalOut,
      selected: isSelected,
    }));
  };

  // Chuẩn hóa danh sách lessonItems: Lược bỏ ký hiệu NLS/AI và tách bài có nhiều YCCĐ thành từng dòng YCCĐ độc lập
  const normalizeAndSplitLessonItems = (
    items: MatrixRowLessonItem[]
  ): MatrixRowLessonItem[] => {
    if (!items || items.length === 0) return [];

    // Đếm số lượng dòng hiện có theo từng bài học
    const countByLessonKey = new Map<string, number>();
    for (const item of items) {
      const lKey = (item.lessonId || item.lessonName || item.id)
        .trim()
        .toLowerCase();
      countByLessonKey.set(lKey, (countByLessonKey.get(lKey) || 0) + 1);
    }

    const expanded: MatrixRowLessonItem[] = [];

    for (const item of items) {
      const lKey = (item.lessonId || item.lessonName || item.id)
        .trim()
        .toLowerCase();
      const existingCountForLesson = countByLessonKey.get(lKey) || 1;
      const baseLessonId =
        item.lessonId || item.id.replace(/__yccd-\d+$/, '');
      const baseCode = (item.learningOutcomeCode || '').replace(/\.\d+$/, '');

      // Nếu bài học hiện mới có 1 dòng và có nhiều Yêu cầu cần đạt -> tách thành nhiều dòng (mỗi YCCĐ 1 dòng)
      if (existingCountForLesson === 1 && !item.outcomeIndex) {
        const outs = splitLessonOutcomes(
          item.learningOutcomeText,
          item.lessonName
        );
        if (outs.length > 1) {
          const subItems: MatrixRowLessonItem[] = outs.map((outText, oIdx) => ({
            id: `${baseLessonId}__yccd-${oIdx + 1}`,
            lessonId: baseLessonId,
            lessonName: item.lessonName,
            periodsCount: item.periodsCount,
            learningOutcomeCode: baseCode
              ? `${baseCode}.${oIdx + 1}`
              : `YCCĐ.${oIdx + 1}`,
            learningOutcomeText: outText,
            outcomeIndex: oIdx + 1,
            totalOutcomesInLesson: outs.length,
            selected: item.selected,
          }));
          const distributedSub =
            item.cells && item.cells.length > 0
              ? distributeRowCellsAcrossLessonItems(item.cells, subItems)
              : subItems;
          expanded.push(...distributedSub);
          continue;
        }
      }

      const cleanedText = cleanLearningOutcomeText(
        item.learningOutcomeText,
        item.lessonName
      );
      expanded.push({
        ...item,
        lessonId: baseLessonId,
        learningOutcomeText: cleanedText,
      });
    }

    // Cập nhật lại outcomeIndex và totalOutcomesInLesson chuẩn xác cho từng bài học
    const finalGroupMap = new Map<string, MatrixRowLessonItem[]>();
    for (const it of expanded) {
      const lKey = (it.lessonId || it.lessonName || it.id).trim().toLowerCase();
      const list = finalGroupMap.get(lKey) || [];
      list.push(it);
      finalGroupMap.set(lKey, list);
    }

    return expanded.map((it) => {
      const lKey = (it.lessonId || it.lessonName || it.id).trim().toLowerCase();
      const group = finalGroupMap.get(lKey) || [it];
      const pos = group.indexOf(it);
      return {
        ...it,
        outcomeIndex: pos >= 0 ? pos + 1 : 1,
        totalOutcomesInLesson: group.length,
      };
    });
  };

  // Thống kê số bài học duy nhất và tổng số tiết (không cộng trùng số tiết khi 1 bài có nhiều dòng YCCĐ)
  const getUniqueLessonSummary = (items: MatrixRowLessonItem[]) => {
    const allLessonMap = new Map<
      string,
      { lessonName: string; periodsCount: number; selected: boolean }
    >();
    for (const li of items) {
      const lKey = (li.lessonId || li.lessonName || li.id).trim().toLowerCase();
      const prev = allLessonMap.get(lKey);
      if (!prev) {
        allLessonMap.set(lKey, {
          lessonName: li.lessonName,
          periodsCount: li.periodsCount || 1,
          selected: Boolean(li.selected),
        });
      } else if (li.selected) {
        prev.selected = true;
      }
    }
    const allLessons = Array.from(allLessonMap.values());
    const selectedLessons = allLessons.filter((l) => l.selected);
    const totalSelectedPeriods = selectedLessons.reduce(
      (sum, l) => sum + (l.periodsCount || 1),
      0
    );
    return {
      totalUniqueLessons: allLessons.length,
      selectedUniqueLessonsCount: selectedLessons.length,
      selectedUniqueLessons: selectedLessons,
      totalSelectedPeriods,
    };
  };

  // Lấy danh sách bài học & từng dòng Yêu cầu cần đạt (kèm trạng thái selected và cells riêng từng dòng YCCĐ) của một dòng Chủ đề / Chương
  const getResolvedLessonItemsForRow = (
    row: MatrixSpecificationRow,
    groupsToSearch: MatrixChapterGroup[] = chapterGroups
  ): MatrixRowLessonItem[] => {
    if (row.lessonItems && row.lessonItems.length > 0) {
      const normalized = normalizeAndSplitLessonItems(row.lessonItems);
      return distributeRowCellsAcrossLessonItems(row.cells, normalized);
    }
    const matchedGroup = findMatchingChapterGroupForRow(row, groupsToSearch);
    if (!matchedGroup || matchedGroup.lessons.length === 0) {
      return [];
    }
    const unitNorm = (row.knowledgeUnit || '').trim().toLowerCase();
    const anyExplicitMatch = matchedGroup.lessons.some((ls) =>
      unitNorm.includes(ls.lessonName.trim().toLowerCase())
    );
    const initialItems: MatrixRowLessonItem[] = matchedGroup.lessons.flatMap(
      (ls) =>
        buildOutcomeRowsFromLesson(
          ls,
          anyExplicitMatch
            ? unitNorm.includes(ls.lessonName.trim().toLowerCase())
            : true
        )
    );
    return distributeRowCellsAcrossLessonItems(row.cells, initialItems);
  };

  // Đảm bảo mọi dòng đưa vào tính toán đều có sẵn lessonItems đã được phân bổ câu & điểm
  const resolvedSpecRows = useMemo(
    () =>
      specRows.map((row) => {
        const resolved = getResolvedLessonItemsForRow(row);
        if (resolved.length === 0) return row;
        return {
          ...row,
          lessonItems: resolved,
        };
      }),
    [specRows, chapterGroups]
  );

  // 5. Tính toán tự động toàn bộ số liệu Ma trận & Đối chiếu Ngân hàng câu hỏi
  const computedSummary = useMemo(
    () =>
      computeMatrixSummary(
        levelId,
        grade,
        subject,
        targetTotalPoints,
        resolvedSpecRows,
        questions,
        activeFormatGroups
      ),
    [
      levelId,
      grade,
      subject,
      targetTotalPoints,
      resolvedSpecRows,
      questions,
      activeFormatGroups,
    ]
  );

  // Kiểm tra tính hợp lệ toàn diện
  const validationReport = useMemo(
    () =>
      validateMatrixForConfirmation({
        title,
        levelId,
        grade,
        subject,
        templateCode,
        templateConfirmed,
        activeFormatGroups,
        targetLevelPercentages,
        scoringRules,
        specRows: resolvedSpecRows,
        summary: computedSummary,
      }),
    [
      title,
      levelId,
      grade,
      subject,
      templateCode,
      templateConfirmed,
      activeFormatGroups,
      targetLevelPercentages,
      scoringRules,
      resolvedSpecRows,
      computedSummary,
    ]
  );

  // Xử lý đổi Cấp học (Tự động nạp danh mục bài học của cấp học/môn mới và phân bổ câu hỏi)
  const handleLevelChange = (nextLevel: EducationLevelId) => {
    const nextRule = getRuleSetForLevel(nextLevel);
    const nextGrade = nextRule.grades[0];
    const nextSubject = nextRule.subjects[0];
    const nextTpl: MatrixTemplateCode =
      nextLevel === EducationLevelId.PRIMARY
        ? 'TEMPLATE_C_PRIMARY_APPROVED'
        : 'TEMPLATE_A_CV7991';
    const tplDef = MATRIX_TEMPLATES[nextTpl];
    const nextActiveFormats = [...tplDef.defaultActiveFormats];
    const nextLevelPct = { ...tplDef.recommendedLevelPercentages };
    const nextRules = rebalanceScoringRulesForActiveFormats(
      tplDef.defaultScoringRules,
      nextActiveFormats,
      targetTotalPoints,
      nextLevel
    );

    setLevelId(nextLevel);
    setGrade(nextGrade);
    setSubject(nextSubject);
    setDurationMinutes(nextLevel === EducationLevelId.PRIMARY ? 40 : 90);
    setTemplateCode(nextTpl);
    setTemplateConfirmed(true);
    setActiveFormatGroups(nextActiveFormats);
    setTargetLevelPercentages(nextLevelPct);
    setScoringRules(nextRules);

    rebuildRowsForSubjectAndScope(
      nextLevel,
      nextGrade,
      nextSubject,
      semester,
      nextActiveFormats,
      nextRules,
      nextLevelPct,
      targetTotalPoints
    );
  };

  // Xác nhận áp dụng Mẫu Ma trận (Mẫu A, B, C, D) -> Điền tỷ lệ điểm mặc định & phân bổ lại câu hỏi
  const handleConfirmApplyTemplate = (codeToApply: MatrixTemplateCode) => {
    const check = validateTemplateApplicability(
      codeToApply,
      levelId,
      grade,
      subject
    );
    if (!check.valid) {
      onNotify(
        'error',
        'Không được áp dụng mẫu sai cấp học / môn học',
        check.reason || 'Mẫu không hợp lệ với cấp học hiện tại.'
      );
      return;
    }

    const tpl = MATRIX_TEMPLATES[codeToApply];
    const nextActiveFormats = [...tpl.defaultActiveFormats];
    const nextLevelPercentages = { ...tpl.recommendedLevelPercentages };
    const nextRules = rebalanceScoringRulesForActiveFormats(
      tpl.defaultScoringRules,
      nextActiveFormats,
      targetTotalPoints,
      levelId
    );

    setTemplateCode(codeToApply);
    setActiveFormatGroups(nextActiveFormats);
    setTargetLevelPercentages(nextLevelPercentages);
    setScoringRules(nextRules);
    setTemplateConfirmed(true);

    if (specRows.length > 0) {
      const nextRows = allocateCellsAcrossSpecRows(
        specRows,
        nextActiveFormats,
        nextRules,
        nextLevelPercentages,
        targetTotalPoints,
        levelId
      );
      setSpecRows(nextRows);
      setTargetLevelPercentages(
        computeSyncedLevelPercentages(
          nextRows,
          nextActiveFormats,
          nextLevelPercentages
        )
      );
    }

    onNotify(
      'success',
      `Đã xác nhận áp dụng ${tpl.shortName}`,
      `Đã nạp tỷ lệ điểm mặc định (${tpl.recommendedLevelPercentages.BIET}% Biết – ${tpl.recommendedLevelPercentages.HIEU}% Hiểu – ${tpl.recommendedLevelPercentages.VAN_DUNG}% Vận dụng) và cân đối số câu theo ${tpl.legalDocument}.`
    );
  };

  // Bật / Tắt (Ẩn) dạng câu hỏi không áp dụng -> Tự động cân đối lại số câu, điểm số & tỷ lệ các dạng đang bật
  const handleToggleFormatGroup = (fgCode: MatrixFormatGroupCode) => {
    if (activeFormatGroups.includes(fgCode) && activeFormatGroups.length <= 1) {
      onNotify(
        'warning',
        'Cần giữ tối thiểu 01 dạng câu hỏi',
        'Ma trận phải hiển thị ít nhất một nhóm dạng câu hỏi.'
      );
      return;
    }

    const canonicalOrder: MatrixFormatGroupCode[] = [
      'MCQ',
      'TRUE_FALSE',
      'SHORT_ANSWER',
      'ESSAY',
    ];
    const isRemoving = activeFormatGroups.includes(fgCode);
    const nextActiveFormats = isRemoving
      ? activeFormatGroups.filter((c) => c !== fgCode)
      : canonicalOrder.filter(
          (c) => activeFormatGroups.includes(c) || c === fgCode
        );

    const nextRules = rebalanceScoringRulesForActiveFormats(
      scoringRules,
      nextActiveFormats,
      targetTotalPoints,
      levelId
    );

    setActiveFormatGroups(nextActiveFormats);
    setScoringRules(nextRules);

    if (specRows.length > 0) {
      const nextRows = allocateCellsAcrossSpecRows(
        specRows,
        nextActiveFormats,
        nextRules,
        targetLevelPercentages,
        targetTotalPoints,
        levelId
      );
      setSpecRows(nextRows);
      const syncedPct = computeSyncedLevelPercentages(
        nextRows,
        nextActiveFormats,
        targetLevelPercentages
      );
      setTargetLevelPercentages(syncedPct);
    }

    const summaryParts = nextActiveFormats.map((code) => {
      const fgDef = MATRIX_FORMAT_GROUPS.find((g) => g.code === code);
      const r = nextRules.find((item) => item.formatGroup === code);
      const q = r?.targetQuestionCount || 0;
      const pts = exactMul(q, r?.defaultPointsPerQuestion || 0);
      const pct = exactPercentage(pts, targetTotalPoints);
      return `${fgDef?.shortLabel}: ${q} câu (${pts.toFixed(2)}đ • ${pct}%)`;
    });

    const toggledDef = MATRIX_FORMAT_GROUPS.find((g) => g.code === fgCode);
    onNotify(
      'info',
      `${isRemoving ? 'Đã ẩn' : 'Đã bật'} dạng "${
        toggledDef?.shortLabel || fgCode
      }" & tự động cân đối tỷ lệ`,
      `Cơ cấu mới (${targetTotalPoints.toFixed(2)}đ): ${summaryParts.join(
        ' | '
      )}.`
    );
  };

  // Cập nhật số câu hoặc số điểm trong 1 ô của Ma trận (và đồng bộ ngược lên tổng số câu của dạng đó)
  const handleUpdateCell = (
    rowId: string,
    formatGroup: MatrixFormatGroupCode,
    levelColumn: MatrixLevelColumnCode,
    field: 'questionCount' | 'points',
    rawValue: number
  ) => {
    const unitRule = scoringRules.find((r) => r.formatGroup === formatGroup);
    const unitPts = unitRule ? unitRule.defaultPointsPerQuestion : 0.25;

    const nextRows = specRows.map((row) => {
      if (row.id !== rowId) return row;
      const nextCells = row.cells.map((cell) => {
        if (
          cell.formatGroup !== formatGroup ||
          cell.levelColumn !== levelColumn
        ) {
          return cell;
        }
        if (field === 'questionCount') {
          const count = Math.max(0, Math.round(rawValue || 0));
          return {
            ...cell,
            questionCount: count,
            points: exactMul(count, unitPts),
          };
        } else {
          const pts = Math.max(0, exactRound2(rawValue || 0));
          return {
            ...cell,
            points: pts,
          };
        }
      });
      return { ...row, cells: nextCells };
    });

    setSpecRows(nextRows);

    if (field === 'questionCount') {
      const updatedFormatTotalQ = nextRows.reduce(
        (sum, r) =>
          sum +
          r.cells
            .filter((c) => c.formatGroup === formatGroup)
            .reduce((s, c) => s + Math.max(0, Math.round(c.questionCount || 0)), 0),
        0
      );
      setScoringRules((prev) =>
        prev.map((item) =>
          item.formatGroup === formatGroup
            ? { ...item, targetQuestionCount: updatedFormatTotalQ }
            : item
        )
      );
    }
  };

  // Cập nhật số câu hoặc số điểm trong 1 ô của từng Bài học (lessonItem) và đồng bộ lên dòng Chủ đề / Chương + tổng dạng câu hỏi
  const handleUpdateLessonCell = (
    rowId: string,
    lessonItemId: string,
    formatGroup: MatrixFormatGroupCode,
    levelColumn: MatrixLevelColumnCode,
    field: 'questionCount' | 'points',
    rawValue: number
  ) => {
    const unitRule = scoringRules.find((r) => r.formatGroup === formatGroup);
    const unitPts = unitRule ? unitRule.defaultPointsPerQuestion : 0.25;

    const nextRows = specRows.map((row) => {
      if (row.id !== rowId) return row;
      const currentItems = getResolvedLessonItemsForRow(row);
      const nextLessonItems = currentItems.map((li) => {
        if (li.id !== lessonItemId) return li;
        const baseCells =
          li.cells && li.cells.length > 0 ? li.cells : createEmptyCellsForRow();
        const nextCells = baseCells.map((cell) => {
          if (
            cell.formatGroup !== formatGroup ||
            cell.levelColumn !== levelColumn
          ) {
            return cell;
          }
          if (field === 'questionCount') {
            const count = Math.max(0, Math.round(rawValue || 0));
            return {
              ...cell,
              questionCount: count,
              points: exactMul(count, unitPts),
            };
          } else {
            const pts = Math.max(0, exactRound2(rawValue || 0));
            return {
              ...cell,
              points: pts,
            };
          }
        });
        const hasAnyQ = nextCells.some(
          (c) => (c.questionCount || 0) > 0 || (c.points || 0) > 0
        );
        return {
          ...li,
          selected: hasAnyQ ? true : li.selected,
          cells: nextCells,
        };
      });

      const summedRowCells = sumLessonItemsCells(nextLessonItems);
      return syncRowWithLessonItems(
        { ...row, cells: summedRowCells },
        nextLessonItems
      );
    });

    setSpecRows(nextRows);

    if (field === 'questionCount') {
      const updatedFormatTotalQ = nextRows.reduce(
        (sum, r) =>
          sum +
          r.cells
            .filter((c) => c.formatGroup === formatGroup)
            .reduce((s, c) => s + Math.max(0, Math.round(c.questionCount || 0)), 0),
        0
      );
      setScoringRules((prev) =>
        prev.map((item) =>
          item.formatGroup === formatGroup
            ? { ...item, targetQuestionCount: updatedFormatTotalQ }
            : item
        )
      );
    }
  };

  // Trạng thái thu gọn/mở rộng danh sách bài học trong từng dòng Chủ đề / Chương
  const [collapsedChapterRows, setCollapsedChapterRows] = useState<
    Record<string, boolean>
  >({});

  const toggleCollapseChapterRow = (rowId: string) => {
    setCollapsedChapterRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Đồng bộ nội dung Đơn vị kiến thức, Mã YCCĐ, Nội dung YCCĐ, Ghi chú số tiết và tổng cells từ danh sách bài được tích chọn trong Chủ đề / Chương
  const syncRowWithLessonItems = (
    row: MatrixSpecificationRow,
    nextLessonItems: MatrixRowLessonItem[]
  ): MatrixSpecificationRow => {
    const normalizedItems = normalizeAndSplitLessonItems(nextLessonItems);
    const selectedItems = normalizedItems.filter((li) => li.selected);
    const uniqueSummary = getUniqueLessonSummary(normalizedItems);
    const totalSelectedPeriods = uniqueSummary.totalSelectedPeriods;
    const summedCells = sumLessonItemsCells(normalizedItems);

    if (selectedItems.length === 0) {
      return {
        ...row,
        cells: createEmptyCellsForRow(),
        lessonItems: normalizedItems.map((li) => ({
          ...li,
          cells: createEmptyCellsForRow(),
        })),
        knowledgeUnit: 'Chưa chọn bài học nào trong Chủ đề / Chương này',
        note: `Đã chọn 0/${uniqueSummary.totalUniqueLessons} bài (0 tiết)`,
      };
    }

    const knowledgeUnit = uniqueSummary.selectedUniqueLessons
      .map((l) => `${l.lessonName} (${l.periodsCount} tiết)`)
      .join('; ');

    const uniqueOutcomeCodes = Array.from(
      new Set(selectedItems.map((li) => li.learningOutcomeCode).filter(Boolean))
    );
    const learningOutcomeCode =
      uniqueOutcomeCodes.slice(0, 3).join(', ') || row.learningOutcomeCode;

    const uniqueOutcomeTexts = Array.from(
      new Set(
        selectedItems
          .map((li) =>
            cleanLearningOutcomeText(li.learningOutcomeText, li.lessonName)
          )
          .filter(Boolean)
      )
    );
    const learningOutcomeText =
      uniqueOutcomeTexts.join('\n') ||
      cleanLearningOutcomeText(row.learningOutcomeText);

    return {
      ...row,
      cells: summedCells,
      lessonItems: normalizedItems,
      knowledgeUnit,
      learningOutcomeCode,
      learningOutcomeText,
      outcomeSource: `KHDH ${subject} Lớp ${grade} (${row.chapterCode} – Đã chọn ${uniqueSummary.selectedUniqueLessonsCount}/${uniqueSummary.totalUniqueLessons} bài, ${totalSelectedPeriods} tiết)`,
      note: `Đã chọn ${uniqueSummary.selectedUniqueLessonsCount}/${uniqueSummary.totalUniqueLessons} bài (${totalSelectedPeriods} tiết)`,
    };
  };

  const getDefaultCompetencyForSubject = () =>
    subject.toLowerCase().includes('toán')
      ? 'Năng lực tư duy và lập luận toán học; Giải quyết vấn đề toán học'
      : subject.toLowerCase().includes('văn') ||
        subject.toLowerCase().includes('tiếng việt')
      ? 'Năng lực ngôn ngữ (Đọc – Viết) và Năng lực thẩm mỹ'
      : subject.toLowerCase().includes('khoa học')
      ? 'Năng lực nhận thức khoa học tự nhiên; Tìm hiểu tự nhiên; Vận dụng kiến thức, kĩ năng đã học'
      : `Năng lực nhận thức và vận dụng kiến thức môn ${subject}`;

  // Khởi tạo 1 dòng Ma trận đại diện cho 1 Chủ đề / Chương duy nhất (kèm danh sách các bài học và từng dòng YCCĐ của bài học đó)
  const buildSpecRowFromChapterGroup = (
    cg: MatrixChapterGroup,
    selectedLessonIds?: Set<string>,
    customCells?: MatrixCellValue[]
  ): MatrixSpecificationRow => {
    const baseRowCells = customCells || createEmptyCellsForRow();
    const rawLessonItems: MatrixRowLessonItem[] = cg.lessons.flatMap((ls) =>
      buildOutcomeRowsFromLesson(
        ls,
        selectedLessonIds ? selectedLessonIds.has(ls.id) : true
      )
    );
    const lessonItems = distributeRowCellsAcrossLessonItems(
      baseRowCells,
      rawLessonItems
    );

    const activeItems = lessonItems.filter((li) => li.selected);
    const fallbackItems = activeItems.length > 0 ? activeItems : lessonItems;
    const uniqueSummary = getUniqueLessonSummary(lessonItems);
    const totalPeriods =
      uniqueSummary.totalSelectedPeriods > 0
        ? uniqueSummary.totalSelectedPeriods
        : cg.totalPeriods;

    const knowledgeUnit = (
      uniqueSummary.selectedUniqueLessons.length > 0
        ? uniqueSummary.selectedUniqueLessons
        : cg.lessons
    )
      .map((li) => `${li.lessonName} (${li.periodsCount} tiết)`)
      .join('; ');
    const uniqueCodes = Array.from(
      new Set(fallbackItems.map((li) => li.learningOutcomeCode).filter(Boolean))
    );
    const uniqueTexts = Array.from(
      new Set(
        fallbackItems
          .map((li) =>
            cleanLearningOutcomeText(li.learningOutcomeText, li.lessonName)
          )
          .filter(Boolean)
      )
    );

    return {
      id: `chap-row-${cg.semester}-${cg.chapterCode
        .replace(/\s+/g, '-')
        .toLowerCase()}-${cg.lessons[0]?.id || '1'}`,
      chapterCode: cg.chapterCode,
      topicTitle: cg.chapterTitle,
      knowledgeUnit,
      learningOutcomeCode: uniqueCodes.slice(0, 3).join(', ') || cg.chapterCode,
      learningOutcomeText: uniqueTexts.join('\n'),
      originalOutcomeText: uniqueTexts.join('\n'),
      outcomeSource: `KHDH ${subject} Lớp ${grade} (${
        cg.semester === 'HK1' ? 'Học kì 1' : 'Học kì 2'
      } • Đã chọn ${
        uniqueSummary.selectedUniqueLessonsCount || cg.lessons.length
      }/${uniqueSummary.totalUniqueLessons} bài, ${totalPeriods} tiết)`,
      outcomeEditHistory: [],
      competencyAssessed: getDefaultCompetencyForSubject(),
      cells: baseRowCells,
      note: `${cg.semester === 'HK1' ? 'Học kì 1' : 'Học kì 2'} • Đã chọn ${
        uniqueSummary.selectedUniqueLessonsCount || cg.lessons.length
      }/${uniqueSummary.totalUniqueLessons} bài (${totalPeriods} tiết)`,
      lessonItems,
    };
  };

  // Chia tỉ lệ câu hỏi và điểm của một dòng gộp sang N dòng Chủ đề / Chương tách rời
  const splitCellsAcrossRows = (
    sourceCells: MatrixCellValue[],
    partCount: number,
    weights: number[]
  ): MatrixCellValue[][] => {
    if (partCount <= 1) return [sourceCells];
    const totalWeight =
      weights.reduce((s, w) => s + Math.max(1, w), 0) || partCount;

    const result: MatrixCellValue[][] = Array.from({ length: partCount }, () =>
      createEmptyCellsForRow()
    );

    sourceCells.forEach((cell, cellIdx) => {
      const totalQ = Math.max(0, Math.round(cell.questionCount || 0));
      const totalPts = Math.max(0, cell.points || 0);
      if (totalQ === 0 && totalPts === 0) return;

      const ptsPerQ = totalQ > 0 ? exactRound2(totalPts / totalQ) : 0;

      // Chia số câu hỏi nguyên theo trọng số tiết
      const rawAlloc = weights.map(
        (w) => (totalQ * Math.max(1, w)) / totalWeight
      );
      const floors = rawAlloc.map((v) => Math.floor(v));
      let remQ = totalQ - floors.reduce((s, v) => s + v, 0);

      const order = rawAlloc
        .map((v, idx) => ({ idx, frac: v - floors[idx] }))
        .sort((a, b) => b.frac - a.frac);

      for (let i = 0; i < remQ; i++) {
        floors[order[i % order.length].idx] += 1;
      }

      let allocatedPts = 0;
      for (let rIdx = 0; rIdx < partCount; rIdx++) {
        const q = floors[rIdx];
        const pts =
          rIdx === partCount - 1
            ? Math.max(0, exactSub(totalPts, allocatedPts))
            : exactMul(q, ptsPerQ);
        allocatedPts = exactAdd(allocatedPts, pts);

        result[rIdx][cellIdx] = {
          ...cell,
          questionCount: q,
          points: q > 0 ? pts : 0,
        };
      }
    });

    return result;
  };

  // Tự động tách mọi dòng đang gộp nhiều Chủ đề / Chương (VD: "TH7-HK1: Chủ đề 1...; Chủ đề 2...; Chủ đề 3... & Chủ đề 4...")
  // thành từng dòng riêng biệt (Mỗi chủ đề = 1 dòng duy nhất)
  function expandCombinedRowsToSingleChapters(
    rows: MatrixSpecificationRow[],
    groups: MatrixChapterGroup[]
  ): { expanded: MatrixSpecificationRow[]; changed: boolean } {
    let changed = false;
    const expanded: MatrixSpecificationRow[] = [];
    const seenChapterKeys = new Set<string>();

    const pushUniqueRow = (candidateRow: MatrixSpecificationRow) => {
      const key = `${candidateRow.chapterCode.trim().toLowerCase()}__${candidateRow.topicTitle
        .trim()
        .toLowerCase()}`;
      if (seenChapterKeys.has(key)) return;
      seenChapterKeys.add(key);
      expanded.push(candidateRow);
    };

    for (const row of rows) {
      const splitParts = splitCombinedChapterTitle(
        row.chapterCode,
        row.topicTitle
      );
      const isSemesterCode = /[-_](?:HK1|HK2|C\d)/i.test(
        (row.chapterCode || '').trim()
      );

      let matchedSubGroups: MatrixChapterGroup[] = [];
      if (groups.length > 0 && (splitParts.length > 1 || isSemesterCode)) {
        if (splitParts.length > 1) {
          matchedSubGroups = groups.filter((cg) =>
            splitParts.some(
              (sp) =>
                sp.chapterCode.trim().toLowerCase() ===
                  cg.chapterCode.trim().toLowerCase() ||
                cg.chapterTitle
                  .trim()
                  .toLowerCase()
                  .includes(sp.chapterTitle.trim().toLowerCase()) ||
                sp.chapterTitle
                  .trim()
                  .toLowerCase()
                  .includes(cg.chapterTitle.trim().toLowerCase())
            )
          );
        }

        if (matchedSubGroups.length <= 1 && isSemesterCode) {
          const isHk2 = /HK2/i.test(row.chapterCode);
          const semGroups = groups.filter(
            (cg) => cg.semester === (isHk2 ? 'HK2' : 'HK1')
          );
          if (semGroups.length > 1) {
            matchedSubGroups = semGroups;
          }
        }
      }

      if (matchedSubGroups.length > 1) {
        changed = true;
        const weights = matchedSubGroups.map((cg) =>
          Math.max(1, cg.totalPeriods)
        );
        const splitCellsList = splitCellsAcrossRows(
          row.cells,
          matchedSubGroups.length,
          weights
        );
        matchedSubGroups.forEach((cg, idx) => {
          pushUniqueRow(
            buildSpecRowFromChapterGroup(cg, undefined, splitCellsList[idx])
          );
        });
      } else if (splitParts.length > 1) {
        changed = true;
        const weights = splitParts.map(() => 1);
        const splitCellsList = splitCellsAcrossRows(
          row.cells,
          splitParts.length,
          weights
        );
        splitParts.forEach((sp, idx) => {
          pushUniqueRow({
            ...row,
            id: `${row.id}-sub-${idx + 1}`,
            chapterCode: sp.chapterCode,
            topicTitle: sp.chapterTitle,
            cells: splitCellsList[idx],
            lessonItems: undefined,
          });
        });
      } else {
        pushUniqueRow(row);
      }
    }

    return { expanded, changed };
  }

  // Thêm dòng Chủ đề / Chương mới (Mỗi dòng chỉ có 1 Chủ đề / Chương, kèm đầy đủ danh sách bài để chọn / bỏ chọn)
  const handleAddRowFromChapterGroup = (cg: MatrixChapterGroup) => {
    const existingRow = specRows.find(
      (r) =>
        r.chapterCode.trim().toLowerCase() ===
          cg.chapterCode.trim().toLowerCase() &&
        r.topicTitle.trim().toLowerCase() ===
          cg.chapterTitle.trim().toLowerCase()
    );
    if (existingRow) {
      onNotify(
        'info',
        `${cg.chapterCode}: ${cg.chapterTitle} đã có trong bảng`,
        'Mỗi dòng trong Ma trận đại diện cho 1 Chủ đề / Chương. Bạn có thể tích chọn / bỏ chọn từng bài học ngay trong dòng đó.'
      );
      return;
    }
    const newRow = buildSpecRowFromChapterGroup(cg);
    setSpecRows((prev) => allocateCellsAcrossSpecRows([...prev, newRow]));
  };

  const handleAddRowFromCurriculum = (topic?: CurriculumTopic) => {
    // Nếu không truyền topic cụ thể và có sẵn chapterGroups -> thêm Chủ đề / Chương tiếp theo chưa có trong bảng
    if (!topic && chapterGroups.length > 0) {
      const nextUnaddedGroup =
        chapterGroups.find(
          (cg) =>
            !specRows.some(
              (r) =>
                r.chapterCode.trim().toLowerCase() ===
                  cg.chapterCode.trim().toLowerCase() &&
                r.topicTitle.trim().toLowerCase() ===
                  cg.chapterTitle.trim().toLowerCase()
            )
        ) || chapterGroups[0];

      if (nextUnaddedGroup) {
        handleAddRowFromChapterGroup(nextUnaddedGroup);
        return;
      }
    }

    const selectedTopic = topic || matchingTopics[0];
    if (selectedTopic && chapterGroups.length > 0) {
      const splitParts = splitCombinedChapterTitle(
        selectedTopic.chapterCode,
        selectedTopic.chapterTitle || selectedTopic.topicTitle
      );
      const matchedGroups = chapterGroups.filter((cg) =>
        splitParts.some(
          (sp) =>
            sp.chapterCode.trim().toLowerCase() ===
              cg.chapterCode.trim().toLowerCase() ||
            cg.chapterTitle
              .trim()
              .toLowerCase()
              .includes(sp.chapterTitle.trim().toLowerCase()) ||
            sp.chapterTitle
              .trim()
              .toLowerCase()
              .includes(cg.chapterTitle.trim().toLowerCase())
        )
      );

      if (matchedGroups.length > 0) {
        const newRowsToAdd: MatrixSpecificationRow[] = [];
        for (const cg of matchedGroups) {
          const alreadyExists = specRows.some(
            (r) =>
              r.chapterCode.trim().toLowerCase() ===
                cg.chapterCode.trim().toLowerCase() &&
              r.topicTitle.trim().toLowerCase() ===
                cg.chapterTitle.trim().toLowerCase()
          );
          if (!alreadyExists) {
            newRowsToAdd.push(buildSpecRowFromChapterGroup(cg));
          }
        }
        if (newRowsToAdd.length > 0) {
          setSpecRows((prev) =>
            allocateCellsAcrossSpecRows([...prev, ...newRowsToAdd])
          );
        } else {
          onNotify(
            'info',
            'Các Chủ đề / Chương đã có trong bảng',
            'Mỗi dòng trong Ma trận đại diện cho 1 Chủ đề / Chương đơn lẻ.'
          );
        }
        return;
      }
    }

    const firstOutcome = selectedTopic?.learningOutcomes[0];
    const singleChap = splitCombinedChapterTitle(
      selectedTopic?.chapterCode || '',
      selectedTopic?.chapterTitle || selectedTopic?.topicTitle || ''
    )[0];

    const newRow: MatrixSpecificationRow = {
      id: `spec-row-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      chapterCode:
        singleChap?.chapterCode || `Chủ đề ${specRows.length + 1}`,
      topicTitle:
        singleChap?.chapterTitle || `Chủ đề kiến thức ${specRows.length + 1}`,
      knowledgeUnit:
        selectedTopic?.topicTitle ||
        `Đơn vị kiến thức trọng tâm ${specRows.length + 1}`,
      learningOutcomeCode:
        firstOutcome?.code || `YCCD-K${grade}-0${specRows.length + 1}`,
      learningOutcomeText:
        firstOutcome?.description ||
        `Nhận biết, thông hiểu và vận dụng kiến thức trọng tâm môn ${subject} Lớp ${grade}.`,
      originalOutcomeText:
        firstOutcome?.description ||
        `Nhận biết, thông hiểu và vận dụng kiến thức trọng tâm môn ${subject} Lớp ${grade}.`,
      outcomeSource: selectedTopic
        ? `CSDL Chương trình GDPT 2018 (${singleChap?.chapterCode || selectedTopic.chapterCode})`
        : 'Tổ Chuyên môn biên soạn bổ sung',
      outcomeEditHistory: [],
      competencyAssessed: getDefaultCompetencyForSubject(),
      cells: createEmptyCellsForRow(),
      note: '',
    };

    setSpecRows((prev) => allocateCellsAcrossSpecRows([...prev, newRow]));
  };

  // Kiểm tra 1 bài học có đang được tích chọn trong các dòng Chủ đề / Chương của Ma trận hay không
  const isLessonSelectedInRows = (
    lesson: SelectableMatrixLesson,
    rows: MatrixSpecificationRow[]
  ): boolean => {
    const lessonNameNorm = lesson.lessonName.trim().toLowerCase();
    for (const r of rows) {
      if (r.lessonItems && r.lessonItems.length > 0) {
        const matchingItems = r.lessonItems.filter(
          (li) =>
            li.lessonId === lesson.id ||
            li.id === lesson.id ||
            li.lessonName.trim().toLowerCase() === lessonNameNorm
        );
        if (matchingItems.length > 0) {
          return matchingItems.some((li) => li.selected);
        }
      }
      if (
        r.id === lesson.id ||
        r.knowledgeUnit.trim().toLowerCase().includes(lessonNameNorm)
      ) {
        return true;
      }
    }
    return false;
  };

  const selectedLessonsList = useMemo(
    () => availableLessons.filter((l) => isLessonSelectedInRows(l, specRows)),
    [availableLessons, specRows]
  );

  const selectedTotalPeriods = useMemo(
    () => selectedLessonsList.reduce((acc, l) => acc + l.periodsCount, 0),
    [selectedLessonsList]
  );

  // Trích xuất thời lượng (số tiết) của một dòng Chủ đề / Chương trong Ma trận (tính tổng số tiết của các bài được đánh dấu chọn, không cộng trùng khi 1 bài có nhiều dòng YCCĐ)
  const getPeriodsForSpecRow = (row: MatrixSpecificationRow): number => {
    const resolvedItems = getResolvedLessonItemsForRow(row);
    if (resolvedItems.length > 0) {
      const uniqueSummary = getUniqueLessonSummary(resolvedItems);
      if (uniqueSummary.totalSelectedPeriods > 0) {
        return uniqueSummary.totalSelectedPeriods;
      }
    }
    const matchedLesson = availableLessons.find(
      (l) =>
        l.id === row.id ||
        row.knowledgeUnit
          .trim()
          .toLowerCase()
          .includes(l.lessonName.trim().toLowerCase())
    );
    if (matchedLesson && matchedLesson.periodsCount > 0) {
      return matchedLesson.periodsCount;
    }
    const allMatches = Array.from(
      row.knowledgeUnit.matchAll(/\((\d+)\s*tiết\)/gi)
    );
    if (allMatches.length > 0) {
      return Math.max(
        1,
        allMatches.reduce((acc, m) => acc + (Number(m[1]) || 0), 0)
      );
    }
    const matchFromNote = (row.note || '').match(/(\d+)\s*tiết/i);
    if (matchFromNote) return Math.max(1, Number(matchFromNote[1]));
    return 2;
  };

  const totalMatrixPeriods = useMemo(() => {
    if (specRows.length > 0) {
      return specRows.reduce((acc, r) => acc + getPeriodsForSpecRow(r), 0);
    }
    return selectedTotalPeriods;
  }, [specRows, selectedTotalPeriods, availableLessons]);

  // Đồng bộ tỷ lệ % mục tiêu (Biết - Hiểu - Vận dụng) khớp với tổng điểm thực tế của 3 cột mức độ sau khi phân bổ
  function computeSyncedLevelPercentages(
    rows: MatrixSpecificationRow[],
    activeFormats: MatrixFormatGroupCode[],
    currentTargetPct: Record<MatrixLevelColumnCode, number>
  ): Record<MatrixLevelColumnCode, number> {
    if (rows.length === 0) return currentTargetPct;
    let bPts = 0;
    let hPts = 0;
    let vPts = 0;
    for (const r of rows) {
      for (const c of r.cells) {
        if (!activeFormats.includes(c.formatGroup)) continue;
        if (c.levelColumn === 'BIET') bPts = exactAdd(bPts, c.points || 0);
        if (c.levelColumn === 'HIEU') hPts = exactAdd(hPts, c.points || 0);
        if (c.levelColumn === 'VAN_DUNG') vPts = exactAdd(vPts, c.points || 0);
      }
    }
    const sumPts = exactAdd(bPts, hPts, vPts);
    if (sumPts <= 0) return currentTargetPct;

    const bPct = exactRound2((bPts / sumPts) * 100);
    const hPct = exactRound2((hPts / sumPts) * 100);
    const vPct = exactRound2(Math.max(0, exactSub(100, exactAdd(bPct, hPct))));

    if (
      Math.abs(bPct - currentTargetPct.BIET) > 0.05 ||
      Math.abs(hPct - currentTargetPct.HIEU) > 0.05 ||
      Math.abs(vPct - currentTargetPct.VAN_DUNG) > 0.05
    ) {
      return { BIET: bPct, HIEU: hPct, VAN_DUNG: vPct };
    }
    return currentTargetPct;
  }

  // Phân bổ tự động số câu & số điểm cho ĐẦY ĐỦ các dạng thức câu hỏi đang bật (MCQ, TRUE_FALSE, SHORT_ANSWER, ESSAY)
  // theo đúng số câu đã chọn của từng dạng (targetQuestionCount), tỷ lệ mức độ nhận thức (Biết - Hiểu - Vận dụng)
  // và thời lượng (số tiết) của từng Bài học (lessonItem) và từng Chủ đề / Chương
  function allocateCellsAcrossSpecRows(
    rowsToAllocate: MatrixSpecificationRow[],
    overrideActiveFormats?: MatrixFormatGroupCode[],
    overrideScoringRules?: FormatScoringRuleConfig[],
    overrideLevelPercentages?: Record<MatrixLevelColumnCode, number>,
    overrideTotalPoints?: number,
    overrideLevelId?: EducationLevelId,
    preserveCustomFormatCounts = false,
    customChapterGroups?: MatrixChapterGroup[]
  ): MatrixSpecificationRow[] {
    if (rowsToAllocate.length === 0) return [];

    const effLevelId = overrideLevelId ?? levelId;
    const effTotalPoints = overrideTotalPoints ?? targetTotalPoints;
    const effActiveFormats: MatrixFormatGroupCode[] =
      overrideActiveFormats && overrideActiveFormats.length > 0
        ? overrideActiveFormats
        : activeFormatGroups.length > 0
        ? activeFormatGroups
        : ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'];
    const rawEffRules = overrideScoringRules ?? scoringRules;
    const effLevelPct = overrideLevelPercentages ?? targetLevelPercentages;
    const effChapterGroups = customChapterGroups ?? chapterGroups;

    const getUnitPts = (fg: MatrixFormatGroupCode): number => {
      const rule = rawEffRules.find((r) => r.formatGroup === fg);
      if (rule && rule.defaultPointsPerQuestion > 0) {
        return rule.defaultPointsPerQuestion;
      }
      if (fg === 'MCQ')
        return effLevelId === EducationLevelId.PRIMARY ? 0.5 : 0.25;
      if (fg === 'TRUE_FALSE')
        return effLevelId === EducationLevelId.PRIMARY ? 0.5 : 1.0;
      if (fg === 'SHORT_ANSWER')
        return effLevelId === EducationLevelId.PRIMARY ? 1.0 : 0.5;
      return effLevelId === EducationLevelId.PRIMARY ? 2.0 : 1.0;
    };

    const fallbackBalanced = rebalanceScoringRulesForActiveFormats(
      rawEffRules,
      effActiveFormats,
      effTotalPoints,
      effLevelId
    );

    const getRawFormatTargetQ = (fg: MatrixFormatGroupCode): number => {
      if (!effActiveFormats.includes(fg)) return 0;
      const rule = rawEffRules.find((r) => r.formatGroup === fg);
      if (rule && rule.targetQuestionCount && rule.targetQuestionCount > 0) {
        return Math.max(1, Math.round(rule.targetQuestionCount));
      }
      const fb = fallbackBalanced.find((r) => r.formatGroup === fg);
      return Math.max(1, fb?.targetQuestionCount || 1);
    };

    const rawConfiguredPoints = effActiveFormats.reduce(
      (acc, fg) =>
        exactAdd(acc, exactMul(getRawFormatTargetQ(fg), getUnitPts(fg))),
      0
    );

    // Nếu không phải người dùng đang cố tình chỉnh lệch tổng điểm của dạng câu hỏi,
    // tự động dùng bộ số câu đã cân đối khớp effTotalPoints (10,00 điểm)
    const shouldUseBalancedCounts =
      !preserveCustomFormatCounts &&
      Math.abs(rawConfiguredPoints - effTotalPoints) > 1e-3;

    const getFormatTargetQ = (fg: MatrixFormatGroupCode): number => {
      if (!effActiveFormats.includes(fg)) return 0;
      if (shouldUseBalancedCounts) {
        const fb = fallbackBalanced.find((r) => r.formatGroup === fg);
        return Math.max(1, fb?.targetQuestionCount || 1);
      }
      return getRawFormatTargetQ(fg);
    };

    const sumConfiguredPoints = effActiveFormats.reduce(
      (acc, fg) =>
        exactAdd(acc, exactMul(getFormatTargetQ(fg), getUnitPts(fg))),
      0
    );
    const effectiveExamPoints =
      sumConfiguredPoints > 0 ? sumConfiguredPoints : effTotalPoints;

    const pctSum = Math.max(
      1,
      exactAdd(
        effLevelPct.BIET || 0,
        effLevelPct.HIEU || 0,
        effLevelPct.VAN_DUNG || 0
      )
    );
    const targetBietPts = exactRound2(
      (effectiveExamPoints * (effLevelPct.BIET || 0)) / pctSum
    );
    const targetHieuPts = exactRound2(
      (effectiveExamPoints * (effLevelPct.HIEU || 0)) / pctSum
    );
    const targetVdPts = exactRound2(
      Math.max(
        0,
        exactSub(effectiveExamPoints, exactAdd(targetBietPts, targetHieuPts))
      )
    );

    // Sắp xếp thứ tự phân bổ dạng câu hỏi vào 3 cột mức độ nhận thức:
    // Tự luận (ESSAY) trước -> các dạng đơn giá lớn -> cuối cùng là MCQ (đơn giá nhỏ nhất) để khớp chính xác tỷ lệ
    const orderedFormats = [...effActiveFormats].sort((a, b) => {
      if (a === 'ESSAY' && b !== 'ESSAY') return -1;
      if (b === 'ESSAY' && a !== 'ESSAY') return 1;
      if (a === 'MCQ' && b !== 'MCQ') return 1;
      if (b === 'MCQ' && a !== 'MCQ') return -1;
      return getUnitPts(b) - getUnitPts(a);
    });

    const remLevelPts: Record<MatrixLevelColumnCode, number> = {
      BIET: targetBietPts,
      HIEU: targetHieuPts,
      VAN_DUNG: targetVdPts,
    };

    const allPools: {
      formatGroup: MatrixFormatGroupCode;
      levelColumn: MatrixLevelColumnCode;
      totalQ: number;
      totalPts: number;
      unitPts: number;
    }[] = [];

    orderedFormats.forEach((fg, idx) => {
      const totalFormatQ = getFormatTargetQ(fg);
      const u = getUnitPts(fg);
      if (totalFormatQ <= 0 || u <= 0) return;

      const isOnlyFormat = orderedFormats.length === 1;
      const isLastFormat = idx === orderedFormats.length - 1;

      // Trọng số ưu tiên mức độ nhận thức tự nhiên theo từng dạng câu hỏi
      const affinity: Record<MatrixLevelColumnCode, number> = isOnlyFormat
        ? { BIET: 1.0, HIEU: 1.0, VAN_DUNG: 1.0 }
        : fg === 'ESSAY'
        ? { BIET: 0.2, HIEU: 0.9, VAN_DUNG: 1.35 }
        : fg === 'TRUE_FALSE'
        ? { BIET: 1.15, HIEU: 1.15, VAN_DUNG: 0.65 }
        : fg === 'SHORT_ANSWER'
        ? { BIET: 0.85, HIEU: 1.25, VAN_DUNG: 1.1 }
        : { BIET: 1.15, HIEU: 1.0, VAN_DUNG: 1.0 };

      const qByLevel: Record<MatrixLevelColumnCode, number> = {
        BIET: 0,
        HIEU: 0,
        VAN_DUNG: 0,
      };

      // Phân bổ từng câu của dạng fg vào 3 mức độ nhận thức (BIET, HIEU, VAN_DUNG)
      // sao cho không vượt quá quỹ điểm còn lại của mỗi mức độ (remLevelPts[lc] >= u)
      for (let qStep = 0; qStep < totalFormatQ; qStep++) {
        const fittingLevels = MATRIX_LEVEL_COLUMNS.map((lc) => lc.code).filter(
          (code) => remLevelPts[code] >= u - 1e-4
        );
        const candidateLevels =
          fittingLevels.length > 0
            ? fittingLevels
            : MATRIX_LEVEL_COLUMNS.map((lc) => lc.code);

        let chosenLc: MatrixLevelColumnCode = candidateLevels[0];
        let bestScore = -Infinity;

        for (const lc of candidateLevels) {
          let score = remLevelPts[lc] * affinity[lc] - qByLevel[lc] * (u * 0.2);

          // Nếu là Tự luận (ESSAY) có từ 2 câu trở lên và phía sau vẫn còn dạng khác (MCQ/SA),
          // tránh để ESSAY chiếm hết 100% quỹ điểm Vận dụng khi cột Hiểu vẫn còn chỗ
          if (
            fg === 'ESSAY' &&
            !isLastFormat &&
            totalFormatQ >= 2 &&
            lc === 'VAN_DUNG' &&
            qByLevel.VAN_DUNG >= Math.ceil(totalFormatQ * 0.67) &&
            candidateLevels.includes('HIEU')
          ) {
            score -= 2.5;
          }

          // Khuyến khích rải đều các mức độ phù hợp cho Đúng-Sai và Trả lời ngắn
          if (
            fg === 'TRUE_FALSE' &&
            totalFormatQ >= 2 &&
            (lc === 'BIET' || lc === 'HIEU') &&
            qByLevel[lc] === 0 &&
            remLevelPts[lc] >= u - 1e-4
          ) {
            score += 0.6;
          }
          if (
            fg === 'SHORT_ANSWER' &&
            totalFormatQ >= 3 &&
            qByLevel[lc] === 0 &&
            remLevelPts[lc] >= u - 1e-4
          ) {
            score += 0.45;
          }

          if (score > bestScore + 1e-6) {
            bestScore = score;
            chosenLc = lc;
          } else if (Math.abs(score - bestScore) <= 1e-6) {
            if (remLevelPts[lc] > remLevelPts[chosenLc]) {
              chosenLc = lc;
            }
          }
        }

        qByLevel[chosenLc] += 1;
        remLevelPts[chosenLc] = exactRound2(
          Math.max(0, exactSub(remLevelPts[chosenLc], u))
        );
      }

      for (const lc of MATRIX_LEVEL_COLUMNS) {
        const q = qByLevel[lc.code];
        if (q > 0) {
          const pts = exactRound2(exactMul(q, u));
          allPools.push({
            formatGroup: fg,
            levelColumn: lc.code,
            totalQ: q,
            totalPts: pts,
            unitPts: u,
          });
        }
      }
    });

    // Chuẩn bị danh sách bài học (lessonItems) cho từng dòng Chủ đề / Chương
    const resolvedRowItemsList: MatrixRowLessonItem[][] = rowsToAllocate.map(
      (row) => {
        const baseItems = getResolvedLessonItemsForRow(
          row,
          effChapterGroups
        ).map((li) => ({
          ...li,
          cells: createEmptyCellsForRow(),
        }));
        // Nếu người dùng lỡ bỏ chọn hết bài trong 1 dòng đang có trong bảng, tự động bật lại bài đầu tiên để dòng đó có nhận câu hỏi
        if (baseItems.length > 0 && !baseItems.some((li) => li.selected)) {
          baseItems[0] = { ...baseItems[0], selected: true };
        }
        return baseItems;
      }
    );

    // Xây dựng danh sách các đơn vị nhận câu hỏi (Mỗi bài học được chọn là 1 đơn vị; nếu dòng không có bài học con thì chính dòng đó là 1 đơn vị)
    interface AllocationUnit {
      rowIdx: number;
      lessonIdx: number; // -1 nếu dòng không có lessonItems
      periods: number;
      cells: MatrixCellValue[];
      assignedQ: number;
      assignedPts: number;
    }

    const allocUnits: AllocationUnit[] = [];
    rowsToAllocate.forEach((row, rIdx) => {
      const items = resolvedRowItemsList[rIdx];
      if (items.length > 0) {
        const selectedOutcomeCountByLesson = new Map<string, number>();
        items.forEach((li) => {
          if (li.selected) {
            const lKey = (li.lessonId || li.lessonName || li.id)
              .trim()
              .toLowerCase();
            selectedOutcomeCountByLesson.set(
              lKey,
              (selectedOutcomeCountByLesson.get(lKey) || 0) + 1
            );
          }
        });

        items.forEach((li, lIdx) => {
          if (li.selected) {
            const lKey = (li.lessonId || li.lessonName || li.id)
              .trim()
              .toLowerCase();
            const countForLesson = Math.max(
              1,
              selectedOutcomeCountByLesson.get(lKey) || 1
            );
            allocUnits.push({
              rowIdx: rIdx,
              lessonIdx: lIdx,
              periods: Math.max(0.25, (li.periodsCount || 1) / countForLesson),
              cells: createEmptyCellsForRow(),
              assignedQ: 0,
              assignedPts: 0,
            });
          }
        });
      } else {
        allocUnits.push({
          rowIdx: rIdx,
          lessonIdx: -1,
          periods: Math.max(1, getPeriodsForSpecRow(row)),
          cells: createEmptyCellsForRow(),
          assignedQ: 0,
          assignedPts: 0,
        });
      }
    });

    if (allocUnits.length === 0) return rowsToAllocate;

    const totalUnitPeriods = Math.max(
      1,
      allocUnits.reduce((sum, u) => sum + u.periods, 0)
    );
    const idealUnitPoints = allocUnits.map(
      (u) => (effectiveExamPoints * u.periods) / totalUnitPeriods
    );

    const rowPeriods = rowsToAllocate.map((_, rIdx) => {
      const sumP = allocUnits
        .filter((u) => u.rowIdx === rIdx)
        .reduce((s, u) => s + u.periods, 0);
      return Math.max(1, sumP);
    });
    const idealRowPoints = rowPeriods.map(
      (p) => (effectiveExamPoints * p) / totalUnitPeriods
    );
    const rowAssignedQ = rowsToAllocate.map(() => 0);
    const rowAssignedPts = rowsToAllocate.map(() => 0);

    // Sắp xếp các Pool theo đơn giá điểm giảm dần (ESSAY -> TRUE_FALSE -> SHORT_ANSWER -> MCQ)
    // để phân bổ các câu điểm lớn trước và dùng các câu điểm nhỏ (MCQ 0.25đ) cân đối chính xác cho mọi bài học & mọi Chủ đề / Chương
    const sortedPools = [...allPools].sort((a, b) => {
      if (Math.abs(b.unitPts - a.unitPts) > 1e-6) return b.unitPts - a.unitPts;
      return a.totalQ - b.totalQ;
    });

    const minPoolUnitPts =
      sortedPools.length > 0
        ? Math.min(...sortedPools.map((p) => p.unitPts))
        : 0.25;

    let remainingQuestionsAcrossExam = sortedPools.reduce(
      (sum, p) => sum + Math.max(0, p.totalQ),
      0
    );

    for (const pool of sortedPools) {
      const { formatGroup, levelColumn, totalQ, totalPts, unitPts } = pool;
      if (totalQ <= 0 || totalPts <= 0) continue;

      const unitCounts = allocUnits.map(() => 0);

      for (let qStep = 0; qStep < totalQ; qStep++) {
        // Kiểm tra các Chương chưa có câu hỏi nào
        const emptyRowSet = new Set<number>();
        rowsToAllocate.forEach((_, rIdx) => {
          let rowQInStep = 0;
          allocUnits.forEach((u, uIdx) => {
            if (u.rowIdx === rIdx) {
              rowQInStep += unitCounts[uIdx];
            }
          });
          if (rowAssignedQ[rIdx] + rowQInStep === 0) {
            emptyRowSet.add(rIdx);
          }
        });

        // Kiểm tra các Bài học chưa có câu hỏi nào
        const emptyUnitIndices = allocUnits
          .map((u, uIdx) => (u.assignedQ + unitCounts[uIdx] === 0 ? uIdx : -1))
          .filter((uIdx) => uIdx !== -1);

        const getUnitAndRowCurrentPts = (uIdx: number) => {
          const unit = allocUnits[uIdx];
          const rIdx = unit.rowIdx;
          const curUnitPts = unit.assignedPts + unitCounts[uIdx] * unitPts;
          const curUnitQ = unit.assignedQ + unitCounts[uIdx];
          let extraRowPtsInPool = 0;
          let extraRowQInPool = 0;
          allocUnits.forEach((otherU, otherIdx) => {
            if (otherU.rowIdx === rIdx && unitCounts[otherIdx] > 0) {
              extraRowQInPool += unitCounts[otherIdx];
              extraRowPtsInPool += unitCounts[otherIdx] * unitPts;
            }
          });
          const curRowPts = rowAssignedPts[rIdx] + extraRowPtsInPool;
          const curRowQ = rowAssignedQ[rIdx] + extraRowQInPool;
          return {
            curUnitPts,
            curUnitQ,
            curRowPts,
            curRowQ,
            extraRowQInPool,
            unitDeficit: idealUnitPoints[uIdx] - curUnitPts,
            rowDeficit: idealRowPoints[rIdx] - curRowPts,
          };
        };

        let candidateUnitIndices = allocUnits.map((_, uIdx) => uIdx);

        const mustPickEmptyRow =
          emptyRowSet.size > 0 &&
          remainingQuestionsAcrossExam <= emptyRowSet.size;
        const mustPickEmptyUnit =
          !mustPickEmptyRow &&
          emptyUnitIndices.length > 0 &&
          remainingQuestionsAcrossExam <= emptyUnitIndices.length;

        if (mustPickEmptyRow) {
          const filtered = candidateUnitIndices.filter((uIdx) =>
            emptyRowSet.has(allocUnits[uIdx].rowIdx)
          );
          if (filtered.length > 0) candidateUnitIndices = filtered;
        } else if (mustPickEmptyUnit) {
          candidateUnitIndices = emptyUnitIndices;
        } else {
          // Chỉ phân bổ câu hỏi có mệnh giá unitPts vào các Bài học & Chương còn đủ quỹ điểm thiếu hụt (deficit)
          const strictFitting = candidateUnitIndices.filter((uIdx) => {
            const { unitDeficit, rowDeficit } = getUnitAndRowCurrentPts(uIdx);
            return (
              unitDeficit >= unitPts - 0.125 && rowDeficit >= unitPts - 0.125
            );
          });
          if (strictFitting.length > 0) {
            candidateUnitIndices = strictFitting;
          } else {
            const moderateFitting = candidateUnitIndices.filter((uIdx) => {
              const { unitDeficit, rowDeficit } = getUnitAndRowCurrentPts(uIdx);
              return (
                unitDeficit >= unitPts * 0.5 && rowDeficit >= unitPts * 0.45
              );
            });
            if (moderateFitting.length > 0) {
              candidateUnitIndices = moderateFitting;
            } else {
              const unitOnlyFitting = candidateUnitIndices.filter((uIdx) => {
                const { unitDeficit } = getUnitAndRowCurrentPts(uIdx);
                return unitDeficit >= unitPts * 0.45;
              });
              if (unitOnlyFitting.length > 0) {
                candidateUnitIndices = unitOnlyFitting;
              } else {
                const positiveDeficit = candidateUnitIndices.filter((uIdx) => {
                  const { unitDeficit } = getUnitAndRowCurrentPts(uIdx);
                  return unitDeficit > 0.01;
                });
                if (positiveDeficit.length > 0) {
                  candidateUnitIndices = positiveDeficit;
                }
              }
            }
          }
        }

        let bestUnitIdx = candidateUnitIndices[0];
        let bestScore = -Infinity;

        const isSmallestUnitPool = unitPts <= minPoolUnitPts + 0.05;

        for (const uIdx of candidateUnitIndices) {
          const unit = allocUnits[uIdx];
          const {
            curUnitQ,
            curRowQ,
            extraRowQInPool,
            unitDeficit,
            rowDeficit,
          } = getUnitAndRowCurrentPts(uIdx);

          // Chỉ cộng điểm thưởng phủ bài trống ở pool câu nhỏ (MCQ) hoặc khi bài còn đủ quỹ điểm
          const emptyUnitBonus =
            curUnitQ === 0 &&
            (isSmallestUnitPool || unitDeficit >= unitPts * 0.75)
              ? 0.35
              : 0;
          const emptyRowBonus =
            curRowQ === 0 &&
            (isSmallestUnitPool || rowDeficit >= unitPts * 0.75)
              ? 0.45
              : 0;

          // Với câu điểm lớn (Tự luận, Đúng-Sai, Trả lời ngắn), tránh dồn 2 câu cùng 1 ô vào 1 bài;
          // với câu điểm nhỏ (MCQ 0.25đ), phạt nhẹ để phân bổ đúng tỷ lệ số tiết
          const sameUnitPoolPenalty =
            unitPts >= 0.5
              ? unitCounts[uIdx] * (unitPts * 0.45)
              : unitCounts[uIdx] * 0.03;
          const sameRowPoolPenalty =
            unitPts >= 0.5 ? extraRowQInPool * (unitPts * 0.25) : 0;

          const score =
            unitDeficit * 0.75 +
            rowDeficit * 0.25 +
            emptyUnitBonus +
            emptyRowBonus -
            sameUnitPoolPenalty -
            sameRowPoolPenalty;

          if (score > bestScore + 1e-6) {
            bestScore = score;
            bestUnitIdx = uIdx;
          } else if (Math.abs(score - bestScore) <= 1e-6) {
            const bestUnit = allocUnits[bestUnitIdx];
            const bestUnitCurQ = bestUnit.assignedQ + unitCounts[bestUnitIdx];
            if (curUnitQ !== bestUnitCurQ) {
              if (curUnitQ < bestUnitCurQ) bestUnitIdx = uIdx;
            } else if (unit.periods > bestUnit.periods) {
              bestUnitIdx = uIdx;
            }
          }
        }

        unitCounts[bestUnitIdx] += 1;
        remainingQuestionsAcrossExam = Math.max(
          0,
          remainingQuestionsAcrossExam - 1
        );
      }

      // Gán số câu và điểm chính xác cho các đơn vị nhận câu hỏi trong pool này
      const activeUnitIndices = unitCounts
        .map((c, uIdx) => (c > 0 ? uIdx : -1))
        .filter((uIdx) => uIdx !== -1);

      const isExactUnitMultiple =
        Math.abs(exactMul(totalQ, unitPts) - totalPts) < 1e-4;
      let ptsDistributedSoFar = 0;

      activeUnitIndices.forEach((uIdx, pos) => {
        const qCount = unitCounts[uIdx];
        const isLastActive = pos === activeUnitIndices.length - 1;
        let cellPts = 0;

        if (isExactUnitMultiple && !isLastActive) {
          cellPts = exactMul(qCount, unitPts);
        } else if (!isLastActive) {
          cellPts = exactRound2((qCount / totalQ) * totalPts);
        } else {
          cellPts = exactRound2(
            Math.max(0, exactSub(totalPts, ptsDistributedSoFar))
          );
        }

        ptsDistributedSoFar = exactAdd(ptsDistributedSoFar, cellPts);
        const unit = allocUnits[uIdx];
        unit.assignedQ += qCount;
        unit.assignedPts = exactAdd(unit.assignedPts, cellPts);
        rowAssignedQ[unit.rowIdx] += qCount;
        rowAssignedPts[unit.rowIdx] = exactAdd(
          rowAssignedPts[unit.rowIdx],
          cellPts
        );

        unit.cells = unit.cells.map((cell) =>
          cell.formatGroup === formatGroup && cell.levelColumn === levelColumn
            ? {
                ...cell,
                questionCount: qCount,
                points: cellPts,
              }
            : cell
        );
      });
    }

    // Tổng hợp ngược từ từng bài học (allocUnits) lên từng dòng Chủ đề / Chương (specRows)
    return rowsToAllocate.map((row, rIdx) => {
      const items = resolvedRowItemsList[rIdx];
      if (items.length > 0) {
        const populatedItems = items.map((li, lIdx) => {
          const matchedUnit = allocUnits.find(
            (u) => u.rowIdx === rIdx && u.lessonIdx === lIdx
          );
          return {
            ...li,
            cells: matchedUnit ? matchedUnit.cells : createEmptyCellsForRow(),
          };
        });
        return syncRowWithLessonItems(row, populatedItems);
      }

      const directUnit = allocUnits.find(
        (u) => u.rowIdx === rIdx && u.lessonIdx === -1
      );
      return {
        ...row,
        cells: directUnit ? directUnit.cells : createEmptyCellsForRow(),
      };
    });
  }

  // Nạp lại danh sách Chủ đề / Chương theo Cấp học, Khối lớp, Môn học, Học kỳ và phân bổ tự động câu & điểm
  function rebuildRowsForSubjectAndScope(
    targetLevel: EducationLevelId,
    targetGrade: GradeNumber,
    targetSubject: string,
    targetSemester: 'HOC_KY_1' | 'HOC_KY_2' | 'CA_NAM',
    overrideActiveFormats?: MatrixFormatGroupCode[],
    overrideRules?: FormatScoringRuleConfig[],
    overrideLevelPct?: Record<MatrixLevelColumnCode, number>,
    overrideTotalPts?: number
  ) {
    const lessonsForSubj = getSelectableLessonsForMatrix(
      targetLevel,
      targetGrade,
      targetSubject,
      topics
    );
    const groupsForSubj = groupLessonsByChapter(lessonsForSubj);
    const filteredLessons =
      targetSemester === 'HOC_KY_1'
        ? lessonsForSubj.filter((l) => l.semester === 'HK1')
        : targetSemester === 'HOC_KY_2'
        ? lessonsForSubj.filter((l) => l.semester === 'HK2')
        : lessonsForSubj;
    const effectiveLessons =
      filteredLessons.length > 0 ? filteredLessons : lessonsForSubj;

    if (effectiveLessons.length === 0) {
      setSpecRows([]);
      return;
    }

    const selectedIds = new Set(effectiveLessons.map((l) => l.id));
    const activeGroups = groupsForSubj.filter((cg) =>
      cg.lessons.some((l) => selectedIds.has(l.id))
    );
    const initialRows = activeGroups.map((cg) =>
      buildSpecRowFromChapterGroup(cg, selectedIds)
    );

    const effFormats = overrideActiveFormats ?? activeFormatGroups;
    const effPts = overrideTotalPts ?? targetTotalPoints;
    const balancedRules = rebalanceScoringRulesForActiveFormats(
      overrideRules ?? scoringRules,
      effFormats,
      effPts,
      targetLevel
    );
    setScoringRules(balancedRules);

    const allocatedRows = allocateCellsAcrossSpecRows(
      initialRows,
      effFormats,
      balancedRules,
      overrideLevelPct ?? targetLevelPercentages,
      effPts,
      targetLevel,
      false,
      groupsForSubj
    );
    setSpecRows(allocatedRows);
  }

  // Thay đổi Số câu mục tiêu (targetQuestionCount) cho một dạng câu hỏi và tự động phân bổ vào bảng
  const handleUpdateFormatQuestionCount = (
    fgCode: MatrixFormatGroupCode,
    rawCount: number
  ) => {
    const clampedCount = Math.max(1, Math.min(100, Math.round(rawCount || 1)));
    const nextRules = scoringRules.map((item) =>
      item.formatGroup === fgCode
        ? { ...item, targetQuestionCount: clampedCount }
        : item
    );
    setScoringRules(nextRules);

    if (specRows.length > 0) {
      const nextRows = allocateCellsAcrossSpecRows(
        specRows,
        activeFormatGroups,
        nextRules,
        targetLevelPercentages,
        targetTotalPoints,
        levelId,
        true
      );
      setSpecRows(nextRows);
      setTargetLevelPercentages(
        computeSyncedLevelPercentages(
          nextRows,
          activeFormatGroups,
          targetLevelPercentages
        )
      );
    }
  };

  // Thay đổi Điểm/câu mặc định (defaultPointsPerQuestion) cho một dạng câu hỏi và cập nhật bảng
  const handleUpdateFormatUnitPoints = (
    fgCode: MatrixFormatGroupCode,
    rawPoints: number
  ) => {
    const nextVal = Math.max(0.05, exactRound2(rawPoints || 0.25));
    const nextRules = scoringRules.map((item) =>
      item.formatGroup === fgCode
        ? { ...item, defaultPointsPerQuestion: nextVal }
        : item
    );
    setScoringRules(nextRules);

    if (specRows.length > 0) {
      const nextRows = allocateCellsAcrossSpecRows(
        specRows,
        activeFormatGroups,
        nextRules,
        targetLevelPercentages,
        targetTotalPoints,
        levelId,
        true
      );
      setSpecRows(nextRows);
      setTargetLevelPercentages(
        computeSyncedLevelPercentages(
          nextRows,
          activeFormatGroups,
          targetLevelPercentages
        )
      );
    }
  };

  // Tự động cân đối số câu của các dạng đang bật để khớp đúng Tổng điểm quy định (VD: 10,00 điểm)
  const handleRebalanceFormatsToTargetPoints = () => {
    const nextRules = rebalanceScoringRulesForActiveFormats(
      scoringRules,
      activeFormatGroups,
      targetTotalPoints,
      levelId
    );
    setScoringRules(nextRules);

    if (specRows.length > 0) {
      const nextRows = allocateCellsAcrossSpecRows(
        specRows,
        activeFormatGroups,
        nextRules,
        targetLevelPercentages,
        targetTotalPoints,
        levelId
      );
      setSpecRows(nextRows);
      setTargetLevelPercentages(
        computeSyncedLevelPercentages(
          nextRows,
          activeFormatGroups,
          targetLevelPercentages
        )
      );
    }

    onNotify(
      'success',
      `Đã tự động cân đối số câu khớp ${targetTotalPoints.toFixed(2)} điểm`,
      'Số câu hỏi và điểm số của các dạng đang bật đã được tự động tính toán và phân bổ vào bảng ma trận.'
    );
  };

  // Thay đổi Tỷ lệ % mức độ nhận thức (Biết / Hiểu / Vận dụng) -> tự động phân bổ lại bảng nếu tổng = 100%
  const handleUpdateLevelPercentage = (
    colCode: MatrixLevelColumnCode,
    rawVal: number
  ) => {
    const nextLevelPercentages = {
      ...targetLevelPercentages,
      [colCode]: Math.max(0, Math.min(100, Number(rawVal) || 0)),
    };
    setTargetLevelPercentages(nextLevelPercentages);

    const sumPct = exactAdd(
      nextLevelPercentages.BIET,
      nextLevelPercentages.HIEU,
      nextLevelPercentages.VAN_DUNG
    );
    if (Math.abs(sumPct - 100) < 0.01 && specRows.length > 0) {
      const nextRows = allocateCellsAcrossSpecRows(
        specRows,
        activeFormatGroups,
        scoringRules,
        nextLevelPercentages,
        targetTotalPoints,
        levelId
      );
      setSpecRows(nextRows);
    }
  };

  // Phân bổ tự động số câu & số điểm theo từng Chủ đề / Chương (Mỗi dòng = 1 Chủ đề / Chương duy nhất)
  const distributeCellsAcrossLessons = (
    lessonsToDistribute: SelectableMatrixLesson[],
    overrideRules?: FormatScoringRuleConfig[]
  ): MatrixSpecificationRow[] => {
    if (lessonsToDistribute.length === 0) return [];
    const selectedIds = new Set(lessonsToDistribute.map((l) => l.id));
    const activeChapterGroups = chapterGroups.filter((cg) =>
      cg.lessons.some((l) => selectedIds.has(l.id))
    );
    const initialRows = activeChapterGroups.map((cg) =>
      buildSpecRowFromChapterGroup(cg, selectedIds)
    );
    return allocateCellsAcrossSpecRows(
      initialRows,
      activeFormatGroups,
      overrideRules ?? scoringRules,
      targetLevelPercentages,
      targetTotalPoints,
      levelId
    );
  };

  // Đánh dấu chọn / bỏ chọn 1 bài học trực tiếp bên trong dòng Chủ đề / Chương (trên Bảng Ma trận hoặc Bản đặc tả)
  // và tự động phân bổ lại câu & điểm trên toàn bảng để luôn khớp 10,00 điểm
  const handleToggleRowLessonItem = (rowId: string, lessonItemId: string) => {
    setSpecRows((prev) => {
      const updatedRows = prev
        .map((row) => {
          if (row.id !== rowId) return row;
          const currentItems = getResolvedLessonItemsForRow(row);
          if (currentItems.length === 0) return row;
          const nextItems = currentItems.map((li) =>
            li.id === lessonItemId
              ? { ...li, selected: !li.selected, cells: undefined }
              : { ...li, cells: undefined }
          );
          return syncRowWithLessonItems(row, nextItems);
        })
        .filter((row) => {
          const items = getResolvedLessonItemsForRow(row);
          return items.length === 0 || items.some((li) => li.selected);
        });

      return allocateCellsAcrossSpecRows(updatedRows);
    });
  };

  // Chọn tất cả hoặc chỉ giữ bài đầu tiên trong một dòng Chủ đề / Chương và tự động phân bổ lại toàn bảng
  const handleSetAllRowLessonsSelected = (
    rowId: string,
    selectAll: boolean
  ) => {
    setSpecRows((prev) => {
      const updatedRows = prev.map((row) => {
        if (row.id !== rowId) return row;
        const currentItems = getResolvedLessonItemsForRow(row);
        if (currentItems.length === 0) return row;
        const rawToggled = currentItems.map((li, idx) => ({
          ...li,
          selected: selectAll ? true : idx === 0,
          cells: undefined,
        }));
        return syncRowWithLessonItems(row, rawToggled);
      });
      return allocateCellsAcrossSpecRows(updatedRows);
    });
  };

  // Cập nhật trực tiếp nội dung Yêu cầu cần đạt của một dòng YCCĐ
  const handleUpdateLessonOutcomeText = (
    rowId: string,
    lessonItemId: string,
    nextText: string
  ) => {
    setSpecRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const currentItems = getResolvedLessonItemsForRow(row);
        const nextItems = currentItems.map((li) =>
          li.id === lessonItemId
            ? { ...li, learningOutcomeText: nextText }
            : li
        );
        return syncRowWithLessonItems(row, nextItems);
      })
    );
  };

  // Thêm một dòng Yêu cầu cần đạt mới cho một bài học
  const handleAddOutcomeRowForLesson = (
    rowId: string,
    sourceItem: MatrixRowLessonItem
  ) => {
    setSpecRows((prev) => {
      const updatedRows = prev.map((row) => {
        if (row.id !== rowId) return row;
        const currentItems = getResolvedLessonItemsForRow(row);
        const baseLessonId =
          sourceItem.lessonId || sourceItem.id.replace(/__yccd-\d+$/, '');
        const existingForLesson = currentItems.filter(
          (li) =>
            (li.lessonId || li.id.replace(/__yccd-\d+$/, '')) === baseLessonId ||
            li.lessonName.trim().toLowerCase() ===
              sourceItem.lessonName.trim().toLowerCase()
        );
        const nextIdx = existingForLesson.length + 1;
        const baseCode = (sourceItem.learningOutcomeCode || '').replace(
          /\.\d+$/,
          ''
        );
        const newOutcomeItem: MatrixRowLessonItem = {
          id: `${baseLessonId}__yccd-${Date.now().toString(36).slice(-4)}`,
          lessonId: baseLessonId,
          lessonName: sourceItem.lessonName,
          periodsCount: sourceItem.periodsCount,
          learningOutcomeCode: baseCode
            ? `${baseCode}.${nextIdx}`
            : `YCCĐ.${nextIdx}`,
          learningOutcomeText: `Yêu cầu cần đạt ${nextIdx} của ${sourceItem.lessonName}.`,
          outcomeIndex: nextIdx,
          totalOutcomesInLesson: nextIdx,
          selected: true,
          cells: createEmptyCellsForRow(),
        };

        const insertPos = currentItems.findIndex(
          (li) => li.id === sourceItem.id
        );
        const nextItems = [...currentItems];
        if (insertPos !== -1) {
          nextItems.splice(insertPos + 1, 0, newOutcomeItem);
        } else {
          nextItems.push(newOutcomeItem);
        }
        return syncRowWithLessonItems(
          row,
          nextItems.map((li) => ({ ...li, cells: undefined }))
        );
      });
      return allocateCellsAcrossSpecRows(updatedRows);
    });
  };

  // Xóa một dòng Yêu cầu cần đạt của bài học (khi bài học có từ 2 dòng YCCĐ trở lên)
  const handleRemoveOutcomeRowFromLesson = (
    rowId: string,
    lessonItemId: string
  ) => {
    setSpecRows((prev) => {
      const updatedRows = prev.map((row) => {
        if (row.id !== rowId) return row;
        const currentItems = getResolvedLessonItemsForRow(row);
        if (currentItems.length <= 1) return row;
        const nextItems = currentItems
          .filter((li) => li.id !== lessonItemId)
          .map((li) => ({ ...li, cells: undefined }));
        return syncRowWithLessonItems(row, nextItems);
      });
      return allocateCellsAcrossSpecRows(updatedRows);
    });
  };

  // Chọn / Bỏ chọn cả một Chủ đề / Chương từ khung chọn phía trên và tự động phân bổ lại toàn bảng
  const handleToggleChapterGroup = (cg: MatrixChapterGroup) => {
    const someSelected = cg.lessons.some((l) =>
      isLessonSelectedInRows(l, specRows)
    );
    const cgCodeNorm = cg.chapterCode.trim().toLowerCase();
    const cgTitleNorm = cg.chapterTitle.trim().toLowerCase();
    const cgLessonIds = new Set(cg.lessons.map((l) => l.id));

    if (someSelected) {
      setSpecRows((prev) => {
        const remaining = prev.filter((r) => {
          const rCode = r.chapterCode.trim().toLowerCase();
          const rTitle = r.topicTitle.trim().toLowerCase();
          const sameChapter =
            (rCode === cgCodeNorm && rTitle === cgTitleNorm) ||
            rTitle === cgTitleNorm ||
            Boolean(
              r.lessonItems && r.lessonItems.some((li) => cgLessonIds.has(li.id))
            );
          return !sameChapter;
        });
        return remaining.length > 0
          ? allocateCellsAcrossSpecRows(remaining)
          : [];
      });
    } else {
      setSpecRows((prev) => {
        const existingIdx = prev.findIndex((r) => {
          const rCode = r.chapterCode.trim().toLowerCase();
          const rTitle = r.topicTitle.trim().toLowerCase();
          return (
            (rCode === cgCodeNorm && rTitle === cgTitleNorm) ||
            rTitle === cgTitleNorm ||
            Boolean(
              r.lessonItems && r.lessonItems.some((li) => cgLessonIds.has(li.id))
            )
          );
        });

        let nextRows: MatrixSpecificationRow[];
        if (existingIdx !== -1) {
          nextRows = [...prev];
          const currentItems = getResolvedLessonItemsForRow(
            nextRows[existingIdx]
          );
          const allTrueItems = (
            currentItems.length > 0
              ? currentItems
              : cg.lessons.map((ls) => ({
                  id: ls.id,
                  lessonName: ls.lessonName,
                  periodsCount: ls.periodsCount,
                  learningOutcomeCode: ls.learningOutcomeCode,
                  learningOutcomeText: ls.learningOutcomeText,
                  selected: true,
                }))
          ).map((li) => ({ ...li, selected: true, cells: undefined }));
          nextRows[existingIdx] = syncRowWithLessonItems(
            nextRows[existingIdx],
            allTrueItems
          );
        } else {
          const newRow = buildSpecRowFromChapterGroup(cg);
          nextRows = [...prev, newRow];
        }

        return allocateCellsAcrossSpecRows(nextRows);
      });
    }
  };

  // Chỉ chọn duy nhất 1 Chủ đề / Chương (giữ các bài đang chọn trong Chủ đề đó, hoặc chọn toàn bộ bài của Chủ đề đó nếu chưa chọn bài nào) và loại bỏ các Chủ đề khác
  const handleSelectOnlyChapterGroup = (cg: MatrixChapterGroup) => {
    const currentlySelectedInCg = cg.lessons.filter((l) =>
      isLessonSelectedInRows(l, specRows)
    );
    const selectedIds =
      currentlySelectedInCg.length > 0
        ? new Set(currentlySelectedInCg.map((l) => l.id))
        : new Set(cg.lessons.map((l) => l.id));

    const singleRow = buildSpecRowFromChapterGroup(cg, selectedIds);
    const allocated = allocateCellsAcrossSpecRows([singleRow]);
    setSpecRows(allocated);
    onNotify(
      'success',
      `Chỉ chọn ${cg.chapterCode}: ${cg.chapterTitle}`,
      `Bảng Ma trận hiện chỉ giữ lại ${cg.chapterCode} (${selectedIds.size}/${cg.lessons.length} bài) và đã phân bổ lại đủ ${targetTotalPoints.toFixed(2)} điểm.`
    );
  };

  // Chọn / Bỏ chọn từng bài trong danh sách "Bài sẽ kiểm tra" và tự động phân bổ lại toàn bảng
  const handleToggleLesson = (lesson: SelectableMatrixLesson) => {
    const cg = chapterGroups.find((g) =>
      g.lessons.some((l) => l.id === lesson.id)
    );
    const cgCodeNorm = (cg?.chapterCode || lesson.chapterCode)
      .trim()
      .toLowerCase();
    const cgTitleNorm = (cg?.chapterTitle || lesson.chapterTitle)
      .trim()
      .toLowerCase();

    setSpecRows((prev) => {
      const existingIdx = prev.findIndex((r) => {
        const rCode = r.chapterCode.trim().toLowerCase();
        const rTitle = r.topicTitle.trim().toLowerCase();
        if (
          (rCode === cgCodeNorm && rTitle === cgTitleNorm) ||
          rTitle === cgTitleNorm
        ) {
          return true;
        }
        return Boolean(
          r.lessonItems && r.lessonItems.some((li) => li.id === lesson.id)
        );
      });

      let nextRows: MatrixSpecificationRow[];
      if (existingIdx !== -1) {
        const targetRow = prev[existingIdx];
        const currentItems = getResolvedLessonItemsForRow(targetRow);
        if (currentItems.length > 0) {
          const nextItems = currentItems.map((li) => {
            const isTarget =
              li.id === lesson.id ||
              li.lessonName.trim().toLowerCase() ===
                lesson.lessonName.trim().toLowerCase();
            if (!isTarget) return { ...li, cells: undefined };
            return {
              ...li,
              selected: !li.selected,
              cells: undefined,
            };
          });
          const remainingSelected = nextItems.filter((li) => li.selected);
          if (remainingSelected.length === 0) {
            nextRows = prev.filter((_, idx) => idx !== existingIdx);
          } else {
            nextRows = [...prev];
            nextRows[existingIdx] = syncRowWithLessonItems(
              targetRow,
              nextItems
            );
          }
          return nextRows.length > 0
            ? allocateCellsAcrossSpecRows(nextRows)
            : [];
        }
      }

      if (cg) {
        const newRow = buildSpecRowFromChapterGroup(
          cg,
          new Set([lesson.id])
        );
        nextRows = [...prev, newRow];
        return allocateCellsAcrossSpecRows(nextRows);
      }

      const fallbackItem: MatrixRowLessonItem = {
        id: lesson.id,
        lessonName: lesson.lessonName,
        periodsCount: lesson.periodsCount,
        learningOutcomeCode: lesson.learningOutcomeCode,
        learningOutcomeText: lesson.learningOutcomeText,
        selected: true,
      };
      const fallbackRow: MatrixSpecificationRow = {
        id: lesson.id,
        chapterCode: lesson.chapterCode,
        topicTitle: lesson.chapterTitle,
        knowledgeUnit: `${lesson.lessonName} (${lesson.periodsCount} tiết)`,
        learningOutcomeCode: lesson.learningOutcomeCode,
        learningOutcomeText: lesson.learningOutcomeText,
        originalOutcomeText: lesson.learningOutcomeText,
        outcomeSource: `KHDH ${subject} Lớp ${grade}`,
        outcomeEditHistory: [],
        competencyAssessed: getDefaultCompetencyForSubject(),
        cells: createEmptyCellsForRow(),
        note: `Đã chọn 1/1 bài (${lesson.periodsCount} tiết)`,
        lessonItems: [fallbackItem],
      };
      nextRows = [...prev, fallbackRow];
      return allocateCellsAcrossSpecRows(nextRows);
    });
  };

  // Chọn nhanh: Học kì 1 | Học kì 2 | Tất cả | Bỏ chọn
  const handleSelectLessonsByScope = (
    scope: 'HK1' | 'HK2' | 'ALL' | 'NONE'
  ) => {
    if (scope === 'NONE') {
      setSpecRows([]);
      onNotify(
        'info',
        'Đã bỏ chọn tất cả Chủ đề / Chương và bài học',
        'Hiện có 0 bài được chọn. Hãy tích chọn các Chủ đề / Chương hoặc từng bài học để đưa vào Bảng Ma trận.'
      );
      return;
    }

    const targetLessons =
      scope === 'HK1'
        ? hk1Lessons
        : scope === 'HK2'
        ? hk2Lessons
        : availableLessons;

    if (scope === 'HK1') setSemester('HOC_KY_1');
    if (scope === 'HK2') setSemester('HOC_KY_2');
    if (scope === 'ALL') setSemester('CA_NAM');

    const balancedRules = rebalanceScoringRulesForActiveFormats(
      scoringRules,
      activeFormatGroups,
      targetTotalPoints,
      levelId
    );
    setScoringRules(balancedRules);

    const nextRows = distributeCellsAcrossLessons(targetLessons, balancedRules);
    setSpecRows(nextRows);

    const totalPeriodsSelected = targetLessons.reduce(
      (s, l) => s + l.periodsCount,
      0
    );
    onNotify(
      'success',
      `Đã gom ${targetLessons.length} bài vào ${nextRows.length} dòng Chủ đề / Chương (${
        scope === 'HK1'
          ? 'Học kì 1'
          : scope === 'HK2'
          ? 'Học kì 2'
          : 'Tất cả cả năm'
      })`,
      `Mỗi dòng tương ứng 1 Chủ đề / Chương (${totalPeriodsSelected} tiết) — Đã tự động phân bổ câu hỏi và điểm vào Bảng Ma trận.`
    );
  };

  const handleAutoDistributeSelectedLessons = () => {
    // Tự động cân đối lại scoringRules khớp targetTotalPoints (10,00 điểm) trước khi phân bổ
    const balancedRules = rebalanceScoringRulesForActiveFormats(
      scoringRules,
      activeFormatGroups,
      targetTotalPoints,
      levelId
    );
    setScoringRules(balancedRules);

    const fallbackLessons =
      selectedLessonsList.length > 0
        ? selectedLessonsList
        : semester === 'HOC_KY_2' && hk2Lessons.length > 0
        ? hk2Lessons
        : hk1Lessons.length > 0
        ? hk1Lessons
        : availableLessons;

    if (specRows.length === 0 && fallbackLessons.length === 0) {
      onNotify(
        'warning',
        'Chưa có bài học hoặc chủ đề nào trong bảng',
        'Vui lòng tích chọn ít nhất 1 bài trong khung "Bài sẽ kiểm tra" hoặc thêm dòng từ Chủ đề Chương trình trước khi phân bổ tự động.'
      );
      return;
    }

    const baseRows =
      specRows.length > 0
        ? specRows
        : distributeCellsAcrossLessons(fallbackLessons, balancedRules);

    const nextRows = allocateCellsAcrossSpecRows(
      baseRows,
      activeFormatGroups,
      balancedRules,
      targetLevelPercentages,
      targetTotalPoints,
      levelId
    );
    setSpecRows(nextRows);
    setTargetLevelPercentages(
      computeSyncedLevelPercentages(
        nextRows,
        activeFormatGroups,
        targetLevelPercentages
      )
    );

    // Thống kê chi tiết số câu và điểm theo từng dạng câu hỏi đang bật để báo cho giáo viên
    const formatSummaryText = activeFormatGroups
      .map((fg) => {
        const fgDef = MATRIX_FORMAT_GROUPS.find((g) => g.code === fg);
        let qSum = 0;
        let ptSum = 0;
        for (const r of nextRows) {
          for (const c of r.cells) {
            if (c.formatGroup === fg) {
              qSum += c.questionCount;
              ptSum = exactAdd(ptSum, c.points);
            }
          }
        }
        return `${fgDef?.shortLabel || fg}: ${qSum} câu (${ptSum.toFixed(2)}đ)`;
      })
      .join(' • ');

    onNotify(
      'success',
      `Đã phân bổ tự động câu & điểm cho từng bài học (${targetTotalPoints.toFixed(2)} điểm)`,
      `${formatSummaryText} — Khớp tỷ lệ Biết ${targetLevelPercentages.BIET}% – Hiểu ${targetLevelPercentages.HIEU}% – Vận dụng ${targetLevelPercentages.VAN_DUNG}%.`
    );
  };

  const handleRemoveRow = (rowId: string) => {
    setSpecRows((prev) => {
      const remaining = prev.filter((r) => r.id !== rowId);
      return remaining.length > 0 ? allocateCellsAcrossSpecRows(remaining) : [];
    });
  };

  // Lưu chỉnh sửa Yêu cầu cần đạt trên Bản đặc tả (kèm lưu nguồn & lịch sử chỉnh sửa)
  const handleSaveOutcomeEdit = () => {
    if (!editingOutcomeRowId) return;
    if (editingOutcomeText.trim().length < 10) {
      onNotify(
        'error',
        'Yêu cầu cần đạt quá ngắn',
        'Nội dung Yêu cầu cần đạt phải có tối thiểu 10 ký tự.'
      );
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setSpecRows((prev) =>
      prev.map((row) => {
        if (row.id !== editingOutcomeRowId) return row;
        if (row.learningOutcomeText.trim() === editingOutcomeText.trim()) {
          return row;
        }
        return {
          ...row,
          learningOutcomeText: editingOutcomeText.trim(),
          outcomeSource: `Giáo viên hiệu chỉnh từ gốc [${row.learningOutcomeCode}]`,
          outcomeEditHistory: [
            {
              id: `out-hist-${Date.now()}`,
              editedAt: nowStr,
              editorName: authorName || 'Giáo viên bộ môn',
              previousText: row.learningOutcomeText,
              newText: editingOutcomeText.trim(),
              sourceNote:
                editingOutcomeReason.trim() ||
                'Tinh chỉnh diễn đạt sát phạm vi kiểm tra định kỳ của trường',
            },
            ...(row.outcomeEditHistory || []),
          ],
        };
      })
    );

    setEditingOutcomeRowId(null);
    setEditingOutcomeText('');
    setEditingOutcomeReason('');
    onNotify(
      'success',
      'Đã cập nhật Yêu cầu cần đạt & Lưu lịch sử',
      'Bản đặc tả đã ghi nhận nội dung mới cùng nguồn gốc và lịch sử chỉnh sửa.'
    );
  };

  // Lưu cấu trúc dùng chung cho Tổ chuyên môn (Mục 4)
  const handleSaveDepartmentPreset = () => {
    if (!presetNameInput.trim()) {
      onNotify(
        'warning',
        'Thiếu tên cấu trúc mẫu',
        'Vui lòng nhập tên cấu trúc dùng chung cho Tổ chuyên môn.'
      );
      return;
    }

    dataRepository.saveDepartmentMatrixPreset({
      name: presetNameInput.trim(),
      departmentName: authorName || config.departmentName,
      levelId,
      grade,
      subject,
      templateCode,
      activeFormatGroups,
      targetLevelPercentages,
      scoringRules,
    });
    setDepartmentPresets(dataRepository.getDepartmentMatrixPresets());
    setPresetNameInput('');
    onNotify(
      'success',
      'Đã lưu cấu trúc dùng chung cho Tổ chuyên môn',
      'Các giáo viên trong tổ có thể nạp lại cấu trúc cơ cấu đề này bất kỳ lúc nào.'
    );
  };

  // Xây dựng payload ExamMatrix từ state hiện tại
  const buildCurrentMatrixPayload = (
    targetStatus: ApprovalStatus
  ): Omit<ExamMatrix, 'id' | 'code' | 'createdAt'> => {
    return {
      title: title.trim(),
      schoolName: schoolName.trim(),
      academicYear: academicYear.trim(),
      semester,
      examTypeLabel: getExamPeriodLabel(examPeriod),
      knowledgeScope: knowledgeScope.trim(),
      appliedRuleBasis: ruleSet.legalBasis,
      templateCode,
      templateConfirmed,
      activeFormatGroups,
      scoringRules,
      targetLevelPercentages,
      specRows: resolvedSpecRows,
      version: currentVersion,
      isLocked: targetStatus === ApprovalStatus.APPROVED,
      levelId,
      grade,
      subject,
      examPeriod,
      durationMinutes,
      totalPoints: computedSummary.totalPoints,
      targetTotalPoints,
      totalQuestions: computedSummary.totalQuestions,
      rows: syncSpecRowsToLegacyRows(levelId, specRows, activeFormatGroups),
      status: targetStatus,
      authorName: authorName.trim() || 'Tổ Chuyên môn',
      isSampleData: false,
    };
  };

  // Lưu bản nháp / Gửi thẩm định / Phê duyệt chính thức (Mục 5 & Mục 8)
  const handlePersistMatrix = (
    targetStatus: ApprovalStatus,
    forceNewVersion = false
  ) => {
    // Nếu Xác nhận gửi thẩm định (PENDING) hoặc Phê duyệt (APPROVED), bắt buộc kiểm tra hợp lệ 100%
    if (
      targetStatus === ApprovalStatus.PENDING ||
      targetStatus === ApprovalStatus.APPROVED
    ) {
      if (!validationReport.canConfirm) {
        onNotify(
          'error',
          'Không cho phép xác nhận Ma trận chưa hợp lệ',
          validationReport.blockingErrors[0] ||
            'Vui lòng khắc phục các lỗi tổng điểm / số câu / yêu cầu cần đạt trước khi xác nhận.'
        );
        return;
      }
    }

    const payload = buildCurrentMatrixPayload(targetStatus);

    if (selectedMatrixId && matrices.some((m) => m.id === selectedMatrixId)) {
      const outcome = onUpdateMatrix(
        selectedMatrixId,
        payload,
        forceNewVersion,
        editorVersionNote.trim() || undefined
      );
      setEditorVersionNote('');
      if (outcome) {
        loadMatrixIntoWorkspace(outcome.matrix);
        if (outcome.createdNewVersion) {
          onNotify(
            'info',
            `Đã tách phiên bản mới ${outcome.matrix.code}`,
            outcome.reason ||
              'Ma trận đã phê duyệt được giữ nguyên; bản chỉnh sửa được lưu sang phiên bản mới.'
          );
        } else {
          onNotify(
            'success',
            targetStatus === ApprovalStatus.APPROVED
              ? `Đã phê duyệt & Khóa ma trận ${outcome.matrix.code}`
              : targetStatus === ApprovalStatus.PENDING
              ? `Đã gửi thẩm định ma trận ${outcome.matrix.code}`
              : `Đã lưu bản nháp ${outcome.matrix.code}`,
            `Tổng số câu: ${outcome.matrix.totalQuestions} câu · Tổng điểm: ${outcome.matrix.totalPoints.toFixed(
              2
            )} điểm.`
          );
        }
      }
    } else {
      const created = onAddMatrix(payload);
      loadMatrixIntoWorkspace(created);
      onNotify(
        'success',
        `Đã khởi tạo Ma trận ${created.code}`,
        `Đã lưu ma trận và bản đặc tả đồng bộ (${created.totalQuestions} câu – ${created.totalPoints.toFixed(
          2
        )} điểm).`
      );
    }
  };

  // Nạp nhanh 4 Kịch bản Kiểm thử thực tế (Mục 9)
  const handleLoadTestScenario = (
    scenario:
      | 'MATH6_THCS_CV7991'
      | 'VIET4_CUSTOM_APPROVED'
      | 'WRONG_TOTAL_POINTS'
      | 'SHORTAGE_BANK_CELL'
  ) => {
    const seedIdMap: Record<typeof scenario, string> = {
      MATH6_THCS_CV7991: 'mat-test-1-math6-cv7991',
      VIET4_CUSTOM_APPROVED: 'mat-test-2-viet4-approved',
      WRONG_TOTAL_POINTS: 'mat-test-3-wrong-points',
      SHORTAGE_BANK_CELL: 'mat-test-4-shortage-cell',
    };
    const existingSeed = matrices.find((m) => m.id === seedIdMap[scenario]);
    const payload = buildTestScenarioMatrix(
      scenario,
      config.schoolName,
      config.academicYear
    );

    const targetMatrix = existingSeed
      ? {
          ...existingSeed,
          ...payload,
          id: existingSeed.id,
          code: existingSeed.code,
          createdAt: existingSeed.createdAt,
        }
      : onAddMatrix(payload);

    loadMatrixIntoWorkspace(targetMatrix);

    const scenarioTitles = {
      MATH6_THCS_CV7991:
        'Đã nạp Kịch bản 1: Ma trận Toán Lớp 6 theo mẫu THCS (Mẫu A – CV 7991)',
      VIET4_CUSTOM_APPROVED:
        'Đã nạp Kịch bản 2: Ma trận Tiếng Việt Lớp 4 (Mẫu tùy chỉnh đã phê duyệt & khóa)',
      WRONG_TOTAL_POINTS:
        'Đã nạp Kịch bản 3: Ma trận kiểm thử bị sai Tổng điểm (8,50 / 10,00 điểm)',
      SHORTAGE_BANK_CELL:
        'Đã nạp Kịch bản 4: Ma trận kiểm thử có ô thiếu câu hỏi trong Ngân hàng',
    };

    onNotify(
      scenario === 'WRONG_TOTAL_POINTS' || scenario === 'SHORTAGE_BANK_CELL'
        ? 'warning'
        : 'success',
      scenarioTitles[scenario],
      `Mã ma trận: ${targetMatrix.code}. Toàn bộ phép tính và Bản đặc tả đã được đồng bộ.`
    );
  };

  // Xuất file Excel (.csv chuẩn UTF-8 BOM)
  const handleExportExcelCsv = () => {
    const lines: string[] = [];
    lines.push(`"TRƯỜNG: ${schoolName}","NĂM HỌC: ${academicYear}"`);
    lines.push(`"MA TRẬN VÀ BẢN ĐẶC TẢ ĐỀ KIỂM TRA: ${title.toUpperCase()}"`);
    lines.push(
      `"Môn: ${subject} - Lớp ${grade}","Thời gian: ${durationMinutes} phút","Tổng điểm: ${computedSummary.totalPoints.toFixed(
        2
      )}/${targetTotalPoints.toFixed(2)}"`
    );
    lines.push('');

    const headerCols = [
      '"TT"',
      '"Chương/Chủ đề"',
      '"Tên bài học / Đơn vị kiến thức"',
      '"Số tiết"',
      '"Yêu cầu cần đạt"',
    ];
    for (const fg of MATRIX_FORMAT_GROUPS) {
      for (const lc of MATRIX_LEVEL_COLUMNS) {
        headerCols.push(`"${fg.label} - ${lc.label} (Số câu)"`);
        headerCols.push(`"${fg.label} - ${lc.label} (Điểm)"`);
      }
    }
    headerCols.push('"Tổng số câu"', '"Tổng điểm"', '"Tỷ lệ %"', '"Năng lực đánh giá"');
    lines.push(headerCols.join(','));

    specRows.forEach((row, idx) => {
      const selectedLessons = getResolvedLessonItemsForRow(row).filter(
        (li) => li.selected
      );
      if (selectedLessons.length === 0) {
        const rMetric = computedSummary.rowMetrics[row.id];
        const cleanedRowYccd = cleanLearningOutcomeText(
          row.learningOutcomeText,
          row.knowledgeUnit
        );
        const cols = [
          `"${idx + 1}"`,
          `"${row.chapterCode} - ${row.topicTitle.replace(/"/g, '""')}"`,
          `"${row.knowledgeUnit.replace(/"/g, '""')} — YCCĐ: ${cleanedRowYccd.replace(/"/g, '""')}"`,
          `"${getPeriodsForSpecRow(row)}"`,
          `"${cleanedRowYccd.replace(/"/g, '""')}"`,
        ];
        for (const fg of MATRIX_FORMAT_GROUPS) {
          for (const lc of MATRIX_LEVEL_COLUMNS) {
            const cell = activeFormatGroups.includes(fg.code)
              ? row.cells.find(
                  (c) => c.formatGroup === fg.code && c.levelColumn === lc.code
                )
              : undefined;
            cols.push(`"${cell?.questionCount || 0}"`);
            cols.push(`"${(cell?.points || 0).toFixed(2)}"`);
          }
        }
        cols.push(
          `"${rMetric?.totalQuestions || 0}"`,
          `"${(rMetric?.totalPoints || 0).toFixed(2)}"`,
          `"${(rMetric?.percentageOfExam || 0).toFixed(1)}%"`,
          `"${row.competencyAssessed.replace(/"/g, '""')}"`
        );
        lines.push(cols.join(','));
        return;
      }

      selectedLessons.forEach((li) => {
        const lm = computedSummary.lessonMetrics[`${row.id}__${li.id}`];
        const yccdText = cleanLearningOutcomeText(
          li.learningOutcomeText || row.learningOutcomeText,
          li.lessonName
        );
        const multiSuffix =
          (li.totalOutcomesInLesson || 1) > 1
            ? ` (YCCĐ ${li.outcomeIndex || 1}/${li.totalOutcomesInLesson})`
            : '';
        const cols = [
          `"${idx + 1}"`,
          `"${row.chapterCode} - ${row.topicTitle.replace(/"/g, '""')}"`,
          `"${(li.lessonName + multiSuffix).replace(/"/g, '""')} — YCCĐ: ${yccdText.replace(/"/g, '""')}"`,
          `"${li.periodsCount}"`,
          `"${yccdText.replace(/"/g, '""')}"`,
        ];
        for (const fg of MATRIX_FORMAT_GROUPS) {
          for (const lc of MATRIX_LEVEL_COLUMNS) {
            const cell = activeFormatGroups.includes(fg.code)
              ? getLessonItemCell(li, fg.code, lc.code)
              : { questionCount: 0, points: 0 };
            cols.push(`"${cell.questionCount || 0}"`);
            cols.push(`"${(cell.points || 0).toFixed(2)}"`);
          }
        }
        cols.push(
          `"${lm?.totalQuestions || 0}"`,
          `"${(lm?.totalPoints || 0).toFixed(2)}"`,
          `"${(lm?.percentageOfExam || 0).toFixed(1)}%"`,
          `"${row.competencyAssessed.replace(/"/g, '""')}"`
        );
        lines.push(cols.join(','));
      });
    });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ma-tran-Dac-ta-${subject}-Khoi-${grade}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(
      'success',
      'Đã xuất tệp Excel (.CSV)',
      'Tệp dữ liệu Ma trận & Bản đặc tả (chia chi tiết từng bài học) đã được tải xuống.'
    );
  };

  // Xuất file Word (.doc khổ A4 ngang)
  const handleExportWordDoc = () => {
    const matrixBodyHtml = specRows
      .map((r, i) => {
        const rm = computedSummary.rowMetrics[r.id];
        const selectedLessons = getResolvedLessonItemsForRow(r).filter(
          (li) => li.selected
        );

        if (selectedLessons.length === 0) {
          const cleanRowOutcome = cleanLearningOutcomeText(
            r.learningOutcomeText,
            r.knowledgeUnit
          );
          return `<tr>
            <td>${i + 1}</td>
            <td class="text-left"><strong>${r.chapterCode}: ${r.topicTitle}</strong><br/>(${getPeriodsForSpecRow(r)} tiết)</td>
            <td class="text-left"><strong>${r.knowledgeUnit}</strong><br/><span>- YCCĐ: ${cleanRowOutcome}</span></td>
            ${MATRIX_FORMAT_GROUPS.map((fg) =>
              MATRIX_LEVEL_COLUMNS.map((lc) => {
                const c = activeFormatGroups.includes(fg.code)
                  ? r.cells.find(
                      (x) =>
                        x.formatGroup === fg.code && x.levelColumn === lc.code
                    )
                  : undefined;
                return `<td>${
                  c && c.questionCount > 0
                    ? `<strong>${c.questionCount} câu</strong><br/>(${c.points.toFixed(2)}đ)`
                    : '-'
                }</td>`;
              }).join('')
            ).join('')}
            <td><strong>${rm?.totalQuestions || 0}</strong></td>
            <td><strong>${(rm?.totalPoints || 0).toFixed(2)}</strong></td>
            <td><strong>${(rm?.percentageOfExam || 0).toFixed(1)}%</strong></td>
          </tr>`;
        }

        return selectedLessons
          .map((li, lIdx) => {
            const isFirst = lIdx === 0;
            const lm = computedSummary.lessonMetrics[`${r.id}__${li.id}`];
            const cleanOutcome = cleanLearningOutcomeText(
              li.learningOutcomeText || r.learningOutcomeText,
              li.lessonName
            );
            const outcomeBadge =
              (li.totalOutcomesInLesson || 1) > 1
                ? ` <em>(YCCĐ ${li.outcomeIndex || 1}/${li.totalOutcomesInLesson})</em>`
                : '';
            return `<tr>
              ${
                isFirst
                  ? `<td rowspan="${selectedLessons.length}">${i + 1}</td>
                     <td rowspan="${selectedLessons.length}" class="text-left"><strong>${r.chapterCode}: ${r.topicTitle}</strong><br/>(${getPeriodsForSpecRow(r)} tiết)</td>`
                  : ''
              }
              <td class="text-left"><strong>${li.lessonName}</strong> (${li.periodsCount} tiết)${outcomeBadge}<br/><span>• YCCĐ: ${cleanOutcome}</span></td>
              ${MATRIX_FORMAT_GROUPS.map((fg) =>
                MATRIX_LEVEL_COLUMNS.map((lc) => {
                  const c = activeFormatGroups.includes(fg.code)
                    ? getLessonItemCell(li, fg.code, lc.code)
                    : { questionCount: 0, points: 0 };
                  return `<td>${
                    c.questionCount > 0
                      ? `<strong>${c.questionCount} câu</strong><br/>(${c.points.toFixed(2)}đ)`
                      : '-'
                  }</td>`;
                }).join('')
              ).join('')}
              <td><strong>${lm?.totalQuestions || 0}</strong></td>
              <td><strong>${(lm?.totalPoints || 0).toFixed(2)}</strong></td>
              <td><strong>${(lm?.percentageOfExam || 0).toFixed(1)}%</strong></td>
            </tr>`;
          })
          .join('');
      })
      .join('');

    const specBodyHtml = specRows
      .map((r, i) => {
        const rm = computedSummary.rowMetrics[r.id];
        const selectedLessons = getResolvedLessonItemsForRow(r).filter(
          (li) => li.selected
        );

        if (selectedLessons.length === 0) {
          const cleanRowOutcome = formatMathForWordHtml(
            cleanLearningOutcomeText(r.learningOutcomeText, r.knowledgeUnit)
          );
          return `<tr>
            <td>${i + 1}</td>
            <td class="text-left"><strong>${r.chapterCode}: ${formatMathForWordHtml(r.topicTitle)}</strong><br/>(${getPeriodsForSpecRow(r)} tiết)</td>
            <td class="text-left"><strong>${formatMathForWordHtml(r.knowledgeUnit)}</strong></td>
            <td class="text-left">${cleanRowOutcome}</td>
            ${MATRIX_FORMAT_GROUPS.map((fg) =>
              MATRIX_LEVEL_COLUMNS.map((lc) => {
                const c = activeFormatGroups.includes(fg.code)
                  ? r.cells.find(
                      (x) =>
                        x.formatGroup === fg.code && x.levelColumn === lc.code
                    )
                  : undefined;
                return `<td>${
                  c && c.questionCount > 0
                    ? `<strong>${c.questionCount}</strong>`
                    : '-'
                }</td>`;
              }).join('')
            ).join('')}
            <td><strong>${rm?.totalQuestions || 0}</strong></td>
            <td><strong>${(rm?.totalPoints || 0).toFixed(2)}</strong></td>
          </tr>`;
        }

        return selectedLessons
          .map((li, lIdx) => {
            const isFirst = lIdx === 0;
            const lm = computedSummary.lessonMetrics[`${r.id}__${li.id}`];
            const yccdText = formatMathForWordHtml(
              cleanLearningOutcomeText(
                li.learningOutcomeText || r.learningOutcomeText,
                li.lessonName
              )
            );
            const outcomeBadge =
              (li.totalOutcomesInLesson || 1) > 1
                ? ` <em>(YCCĐ ${li.outcomeIndex || 1}/${li.totalOutcomesInLesson})</em>`
                : '';
            return `<tr>
              ${
                isFirst
                  ? `<td rowspan="${selectedLessons.length}">${i + 1}</td>
                     <td rowspan="${selectedLessons.length}" class="text-left"><strong>${r.chapterCode}: ${formatMathForWordHtml(r.topicTitle)}</strong><br/>(${getPeriodsForSpecRow(r)} tiết)</td>`
                  : ''
              }
              <td class="text-left"><strong>${formatMathForWordHtml(li.lessonName)}</strong> (${li.periodsCount} tiết)${outcomeBadge}</td>
              <td class="text-left">${yccdText}</td>
              ${MATRIX_FORMAT_GROUPS.map((fg) =>
                MATRIX_LEVEL_COLUMNS.map((lc) => {
                  const c = activeFormatGroups.includes(fg.code)
                    ? getLessonItemCell(li, fg.code, lc.code)
                    : { questionCount: 0, points: 0 };
                  return `<td>${
                    c.questionCount > 0
                      ? `<strong>${c.questionCount}</strong>`
                      : '-'
                  }</td>`;
                }).join('')
              ).join('')}
              <td><strong>${lm?.totalQuestions || 0}</strong></td>
              <td><strong>${(lm?.totalPoints || 0).toFixed(2)}</strong></td>
            </tr>`;
          })
          .join('');
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    size: A4 landscape;
    margin-top: 2.0cm;
    margin-bottom: 2.0cm;
    margin-left: 2.5cm;
    margin-right: 2.0cm;
  }
  @page WordSection1 {
    size: 29.7cm 21.0cm;
    mso-page-orientation: landscape;
    margin: 2.0cm 2.0cm 2.0cm 2.5cm;
    margin-top: 2.0cm;
    margin-bottom: 2.0cm;
    margin-left: 2.5cm;
    margin-right: 2.0cm;
    mso-header-margin: 1.0cm;
    mso-footer-margin: 1.0cm;
    mso-paper-source: 0;
  }
  div.WordSection1 {
    page: WordSection1;
  }
  body { font-family: "Times New Roman", serif; font-size: 11pt; line-height: 1.0; mso-line-height-rule: at-least; color: #000; margin: 0; padding: 0; }
  sup, sub { font-size: 75%; line-height: 0; }
  h1, h2, h3 { text-align: center; margin: 6px 0; line-height: 1.0; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10pt; line-height: 1.0; }
  th, td { border: 1px solid #000; padding: 4px 5px; text-align: center; vertical-align: middle; line-height: 1.0; }
  .text-left { text-align: justify; }
  .header-table { width: 100%; border-collapse: collapse; border: none; margin-bottom: 12px; }
  .header-table td { border: none; padding: 2px 6px; text-align: center; vertical-align: top; font-size: 12pt; line-height: 1.0; }
</style>
</head>
<body>
  <div class="WordSection1">
    <table class="header-table">
      <tr>
        <td style="width:44%;">
          <p style="margin:0; font-weight:normal; text-transform:uppercase;">UBND XÃ ĐAN ĐIỀN</p>
          <p style="margin:2px 0 0 0; font-weight:bold; text-transform:uppercase;">${(schoolName && !schoolName.toLowerCase().includes('chuẩn quốc gia') && !schoolName.toLowerCase().includes('edutest') ? schoolName : 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH').toUpperCase()}</p>
          <div style="width:130px; border-bottom:1px solid #000; margin:3px auto 0 auto; height:1px;"></div>
        </td>
        <td style="width:56%;">
          <p style="margin:0; font-weight:bold; text-transform:uppercase;">ĐỀ KIỂM TRA ${
            examPeriod === 'GIUA_KY_1'
              ? 'GIỮA KÌ I'
              : examPeriod === 'CUOI_KY_1'
              ? 'CUỐI KÌ I'
              : examPeriod === 'GIUA_KY_2'
              ? 'GIỮA KÌ II'
              : examPeriod === 'CUOI_KY_2'
              ? 'CUỐI KÌ II'
              : 'ĐỊNH KÌ'
          } NĂM HỌC ${(academicYear || '2026-2027').replace(/\s*[–—-]\s*/g, '-')}</p>
          <p style="margin:2px 0 0 0; font-weight:normal;">MÔN: ${subject.toUpperCase()} - Lớp ${grade}</p>
          <p style="margin:2px 0 0 0; font-weight:normal;">Thời gian: ${durationMinutes} phút</p>
          <p style="margin:2px 0 0 0; font-style:italic; font-weight:normal; font-size:11.5pt;">(không kể thời gian giao đề)</p>
        </td>
      </tr>
    </table>
    <h3>I. KHUNG MA TRẬN ĐỀ KIỂM TRA</h3>
    <table>
      <thead>
        <tr>
          <th rowspan="3">TT</th>
          <th rowspan="3">Chủ đề / Chương</th>
          <th rowspan="3">Nội dung / Đơn vị kiến thức (Từng bài học)</th>
          <th colspan="${MATRIX_FORMAT_GROUPS.length * 3}">Mức độ đánh giá theo từng phần</th>
          <th rowspan="3">Tổng số câu</th>
          <th rowspan="3">Tổng điểm</th>
          <th rowspan="3">Tỷ lệ %</th>
        </tr>
        <tr>
          ${MATRIX_FORMAT_GROUPS.map(
            (fg) => `<th colspan="3">${fg.label}</th>`
          ).join('')}
        </tr>
        <tr>
          ${MATRIX_FORMAT_GROUPS.map(
            () => `<th>Biết</th><th>Hiểu</th><th>Vận dụng</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${matrixBodyHtml}
        <tr>
          <td colspan="3"><strong>TỔNG CỘNG TOÀN ĐỀ</strong></td>
          ${MATRIX_FORMAT_GROUPS.map((fg) =>
            MATRIX_LEVEL_COLUMNS.map((lc) => {
              const col = computedSummary.byCellColumn[`${fg.code}__${lc.code}`];
              const count = activeFormatGroups.includes(fg.code)
                ? col?.count || 0
                : 0;
              const pts = activeFormatGroups.includes(fg.code)
                ? col?.points || 0
                : 0;
              return `<td><strong>${count}c<br/>(${pts.toFixed(2)}đ)</strong></td>`;
            }).join('')
          ).join('')}
          <td><strong>${computedSummary.totalQuestions}</strong></td>
          <td><strong>${computedSummary.totalPoints.toFixed(2)}</strong></td>
          <td><strong>100%</strong></td>
        </tr>
      </tbody>
    </table>

    <h3 style="margin-top:18px;">II. BẢN ĐẶC TẢ ĐỀ KIỂM TRA</h3>
    <table>
      <thead>
        <tr>
          <th rowspan="3">TT</th>
          <th rowspan="3">Chủ đề / Chương</th>
          <th rowspan="3">Nội dung / Đơn vị kiến thức (Từng bài học)</th>
          <th rowspan="3">Mức độ & Yêu cầu cần đạt</th>
          <th colspan="${MATRIX_FORMAT_GROUPS.length * 3}">Số câu hỏi theo mức độ nhận thức ở từng phần</th>
          <th rowspan="3">Tổng số câu</th>
          <th rowspan="3">Điểm số</th>
        </tr>
        <tr>
          ${MATRIX_FORMAT_GROUPS.map(
            (fg) => `<th colspan="3">${fg.label}</th>`
          ).join('')}
        </tr>
        <tr>
          ${MATRIX_FORMAT_GROUPS.map(
            () => `<th>Biết</th><th>Hiểu</th><th>Vận dụng</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${specBodyHtml}
        <tr>
          <td colspan="4"><strong>TỔNG SỐ CÂU THEO PHẦN & MỨC ĐỘ</strong></td>
          ${MATRIX_FORMAT_GROUPS.map((fg) =>
            MATRIX_LEVEL_COLUMNS.map((lc) => {
              const col = computedSummary.byCellColumn[`${fg.code}__${lc.code}`];
              const count = activeFormatGroups.includes(fg.code)
                ? col?.count || 0
                : 0;
              return `<td><strong>${count}</strong></td>`;
            }).join('')
          ).join('')}
          <td><strong>${computedSummary.totalQuestions}</strong></td>
          <td><strong>${computedSummary.totalPoints.toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td colspan="4"><strong>TỶ LỆ % ĐIỂM THEO TỪNG PHẦN</strong></td>
          ${MATRIX_FORMAT_GROUPS.map((fg) => {
            const fgStat = computedSummary.byFormatGroup[fg.code];
            const pct = activeFormatGroups.includes(fg.code)
              ? fgStat?.percentage || 0
              : 0;
            const pts = activeFormatGroups.includes(fg.code)
              ? fgStat?.points || 0
              : 0;
            return `<td colspan="3"><strong>${pct.toFixed(1)}% (${pts.toFixed(2)}đ)</strong></td>`;
          }).join('')}
          <td><strong>100%</strong></td>
          <td><strong>${computedSummary.totalPoints.toFixed(2)}đ</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ma-tran-Dac-ta-A4-${subject}-Lop-${grade}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(
      'success',
      'Đã xuất hồ sơ Word (.DOC khổ A4 ngang)',
      'Định dạng khổ giấy A4 nằm ngang (Lề trên 2cm, dưới 2cm, trái 2,5cm, phải 2cm) đã được tải về máy.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Thanh tiêu đề & Kịch bản kiểm thử thực tế (Mục 9) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                MA TRẬN & BẢN ĐẶC TẢ ĐỀ KIỂM TRA
              </span>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <Lock className="w-3.5 h-3.5" />
                  ĐÃ PHÊ DUYỆT & KHÓA PHIÊN BẢN (v{currentVersion})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                  Phiên bản làm việc: v{currentVersion} ({getApprovalStatusInfo(currentStatus).label})
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5">
              Xây Dựng Ma Trận Đề Kiểm Tra & Bản Đặc Tả Liên Kết Ngân Hàng Câu Hỏi
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4 text-blue-600" />
              Cấu trúc Tổ chuyên môn ({departmentPresets.length})
            </button>
            <button
              type="button"
              onClick={handleExportWordDoc}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              Xuất Word A4
            </button>
            <button
              type="button"
              onClick={handleExportExcelCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Xuất Excel (.CSV)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('A4_PREVIEW');
                setTimeout(() => window.print(), 150);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              Xuất PDF / In A4
            </button>
          </div>
        </div>

        {/* Danh sách các Ma trận đã lưu để chuyển đổi nhanh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 shrink-0">
            Danh sách ma trận ({filteredMatrices.length}):
          </span>
          {filteredMatrices.map((m) => {
            const active = m.id === selectedMatrixId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => loadMatrixIntoWorkspace(m)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m.status === ApprovalStatus.APPROVED && (
                  <Lock className="w-3 h-3" />
                )}
                <span className="font-mono font-bold">{m.code}</span>
                <span className="max-w-[200px] truncate">{m.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cảnh báo Khóa phiên bản nếu Ma trận đã được phê duyệt (Mục 8) */}
      {isLocked && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase">
                Phiên bản Ma trận đã phê duyệt chính thức – Đang khóa chống sửa âm thầm
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Theo quy định quản lý khảo thí, ma trận đã duyệt không được phép ghi đè âm thầm. Nếu bạn điều chỉnh cấu trúc và nhấn Lưu, hệ thống sẽ tự động khởi tạo <strong>Phiên bản mới (v{currentVersion + 1})</strong> và bảo toàn bản gốc.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handlePersistMatrix(ApprovalStatus.DRAFT, true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 shrink-0 cursor-pointer"
          >
            <GitBranch className="w-4 h-4" />
            Tạo phiên bản mới (v{currentVersion + 1})
          </button>
        </div>
      )}

      {/* Bảng điều khiển Chuyển Tab: 1. Ma trận & Cơ cấu đề | 2. Bản đặc tả đồng bộ | 3. Xem trước Khổ A4 ngang */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('EDITOR')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'EDITOR'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            1. Thiết kế Ma trận nhiều tầng & Cơ cấu đề
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SPECIFICATION')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'SPECIFICATION'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Bản đặc tả đồng bộ & Lịch sử sửa YCCĐ ({specRows.length} mạch nội dung)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('A4_PREVIEW')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'A4_PREVIEW'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            3. Bản xem trước Khổ A4 ngang (Chuẩn in ấn)
          </button>
        </div>

        {/* Các nút Lưu nháp / Gửi thẩm định / Phê duyệt */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePersistMatrix(ApprovalStatus.DRAFT)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Lưu bản nháp
          </button>
          <button
            type="button"
            disabled={!validationReport.canConfirm}
            onClick={() => handlePersistMatrix(ApprovalStatus.PENDING)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Gửi thẩm định
          </button>
          <button
            type="button"
            disabled={!validationReport.canConfirm}
            onClick={() => handlePersistMatrix(ApprovalStatus.APPROVED)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Xác nhận & Phê duyệt Ma trận
          </button>
        </div>
      </div>

      {/* Hộp Kiểm tra tính hợp lệ & Cảnh báo Ngân hàng câu hỏi theo thời gian thực (Mục 5) */}
      <div
        className={`rounded-xl border p-4 space-y-2.5 ${
          validationReport.canConfirm
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-rose-50/80 border-rose-300'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {validationReport.canConfirm ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            )}
            <span
              className={`text-xs font-bold uppercase ${
                validationReport.canConfirm ? 'text-emerald-950' : 'text-rose-950'
              }`}
            >
              {validationReport.canConfirm
                ? 'Ma trận & Bản đặc tả hợp lệ — Đủ điều kiện xác nhận và phê duyệt'
                : `Chưa đủ điều kiện xác nhận Ma trận (${validationReport.blockingErrors.length} lỗi cần khắc phục)`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800">
              Tổng số câu: <strong>{computedSummary.totalQuestions} câu</strong>
            </span>
            <span
              className={`px-2.5 py-1 rounded border ${
                Math.abs(computedSummary.pointsDiff) <= 0.001
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-rose-100 border-rose-300 text-rose-900 font-bold'
              }`}
            >
              Tổng điểm:{' '}
              <strong>
                {computedSummary.totalPoints.toFixed(2)} /{' '}
                {computedSummary.targetTotalPoints.toFixed(2)} điểm
              </strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800">
              Tỷ lệ nhận thức:{' '}
              <strong>
                Biết {computedSummary.byLevelColumn.BIET.percentage}% – Hiểu{' '}
                {computedSummary.byLevelColumn.HIEU.percentage}% – Vận dụng{' '}
                {computedSummary.byLevelColumn.VAN_DUNG.percentage}%
              </strong>
            </span>
          </div>
        </div>

        {validationReport.blockingErrors.length > 0 && (
          <div className="space-y-1 pt-1">
            {validationReport.blockingErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-rose-900 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {validationReport.bankWarnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Cảnh báo đối chiếu Ngân hàng câu hỏi ({validationReport.bankWarnings.length} ô thiếu nguồn câu hỏi):
            </div>
            {validationReport.bankWarnings.map((w, i) => (
              <div key={i} className="text-xs text-amber-900 pl-5">
                • {w}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NỘI DUNG TAB 1: THIẾT KẾ MA TRẬN & CẤU HÌNH CƠ CẤU ĐỀ */}
      {activeTab === 'EDITOR' && (
        <div className="space-y-5">
          {/* MỤC 1 (1 CỘT TOÀN MÀN HÌNH): THÔNG TIN HÀNH CHÍNH & PHẠM VI ĐỀ KIỂM TRA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Thông tin hành chính & Phạm vi đề kiểm tra
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thiết lập thông tin trường, khối lớp, môn học, thời lượng và phạm vi kiến thức của đề kiểm tra.
                </p>
              </div>

              {/* Thanh chỉ số tóm tắt nhanh ngay trên tiêu đề Mục 1 */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-lg px-3.5 py-2 text-xs">
                <div>
                  <span className="text-slate-500">Đơn vị kiến thức: </span>
                  <strong className="font-mono text-slate-900">
                    {specRows.length} bài
                  </strong>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-slate-500">Thời lượng: </span>
                  <strong className="font-mono text-slate-900">
                    {totalMatrixPeriods} tiết
                  </strong>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-slate-500">Tổng số câu: </span>
                  <strong className="font-mono text-blue-700">
                    {computedSummary.totalQuestions} câu ({activeFormatGroups.length} dạng)
                  </strong>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-slate-500">Điểm ma trận: </span>
                  <strong
                    className={`font-mono ${
                      Math.abs(computedSummary.pointsDiff) < 0.001
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {computedSummary.totalPoints.toFixed(2)} /{' '}
                    {targetTotalPoints.toFixed(2)}đ
                  </strong>
                </div>
              </div>
            </div>

            {/* Hàng 1: Trường học (4/12) - Năm học (2/12) - Tên Ma trận & Bản đặc tả (6/12) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-4 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trường học
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Năm học
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-6 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Ma trận & Bản đặc tả
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Hàng 2: Cấp học - Khối lớp - Môn học - Học kỳ - Loại kiểm tra - Thời gian - Tổng điểm quy định */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3.5">
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cấp học {isMatrixScopeRestricted && <span className="text-indigo-700">(Theo quyền)</span>}
                </label>
                <select
                  value={levelId}
                  onChange={(e) =>
                    handleLevelChange(e.target.value as EducationLevelId)
                  }
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
                >
                  {allowedMatrixLevels.includes(EducationLevelId.PRIMARY) && (
                    <option value={EducationLevelId.PRIMARY}>
                      Tiểu học (Lớp 1–5)
                    </option>
                  )}
                  {allowedMatrixLevels.includes(EducationLevelId.LOWER_SECONDARY) && (
                    <option value={EducationLevelId.LOWER_SECONDARY}>
                      THCS (Lớp 6–9)
                    </option>
                  )}
                </select>
              </div>
              <div className="lg:col-span-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khối lớp
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const nextGrade = Number(e.target.value) as GradeNumber;
                    setGrade(nextGrade);
                    rebuildRowsForSubjectAndScope(
                      levelId,
                      nextGrade,
                      subject,
                      semester
                    );
                  }}
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
                >
                  {allowedMatrixGrades.map((g) => (
                    <option key={g} value={g}>
                      Lớp {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-3 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Môn học {isMatrixScopeRestricted && <span className="text-indigo-700">(Theo quyền)</span>}
                </label>
                <select
                  value={subject}
                  onChange={(e) => {
                    const nextSubj = e.target.value;
                    setSubject(nextSubj);
                    rebuildRowsForSubjectAndScope(
                      levelId,
                      grade,
                      nextSubj,
                      semester
                    );
                  }}
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
                >
                  {allowedMatrixSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Học kỳ
                </label>
                <select
                  value={semester}
                  onChange={(e) => {
                    const nextSem = e.target.value as
                      | 'HOC_KY_1'
                      | 'HOC_KY_2'
                      | 'CA_NAM';
                    setSemester(nextSem);
                    rebuildRowsForSubjectAndScope(
                      levelId,
                      grade,
                      subject,
                      nextSem
                    );
                  }}
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                >
                  <option value="HOC_KY_1">Học kỳ I</option>
                  <option value="HOC_KY_2">Học kỳ II</option>
                  <option value="CA_NAM">Cả năm</option>
                </select>
              </div>
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại kiểm tra
                </label>
                <select
                  value={examPeriod}
                  onChange={(e) =>
                    setExamPeriod(e.target.value as ExamMatrix['examPeriod'])
                  }
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                >
                  <option value="GIUA_KY_1">Giữa học kỳ I</option>
                  <option value="CUOI_KY_1">Cuối học kỳ I</option>
                  <option value="GIUA_KY_2">Giữa học kỳ II</option>
                  <option value="CUOI_KY_2">Cuối học kỳ II</option>
                </select>
              </div>
              <div className="lg:col-span-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời gian (p)
                </label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(Number(e.target.value) || 45)
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div className="lg:col-span-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thang điểm
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={100}
                  value={targetTotalPoints}
                  onChange={(e) => {
                    const nextPts = Number(e.target.value) || 10;
                    setTargetTotalPoints(nextPts);
                    const nextRules = rebalanceScoringRulesForActiveFormats(
                      scoringRules,
                      activeFormatGroups,
                      nextPts,
                      levelId
                    );
                    setScoringRules(nextRules);
                    if (specRows.length > 0) {
                      setSpecRows(
                        allocateCellsAcrossSpecRows(
                          specRows,
                          activeFormatGroups,
                          nextRules,
                          targetLevelPercentages,
                          nextPts,
                          levelId
                        )
                      );
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-blue-700"
                />
              </div>
            </div>

            {/* Hàng 3: Phạm vi kiến thức (6/12) & Bộ quy tắc đánh giá áp dụng (6/12) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-6 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phạm vi kiến thức
                </label>
                <input
                  type="text"
                  value={knowledgeScope}
                  onChange={(e) => setKnowledgeScope(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-6 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bộ quy tắc đánh giá áp dụng
                </label>
                <input
                  type="text"
                  readOnly
                  value={ruleSet.legalBasis}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* MỤC 2 (1 CỘT TOÀN MÀN HÌNH): BỘ MẪU MA TRẬN & CẤU HÌNH CƠ CẤU ĐỀ */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Bộ mẫu Ma trận & Cấu hình cơ cấu đề
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn mẫu ma trận chuẩn theo Công văn/Thông tư và tùy chỉnh các dạng câu hỏi, tỷ lệ mức độ nhận thức, số câu và thang điểm.
                </p>
              </div>
              <div className="text-xs text-slate-600 bg-blue-50 border border-blue-200/80 rounded-lg px-3 py-1.5">
                Đang áp dụng:{' '}
                <strong className="text-blue-700">
                  {MATRIX_TEMPLATES[templateCode]?.shortName}
                </strong>
              </div>
            </div>

            {/* Lưới 4 cột ngang cho 4 Bộ mẫu Ma trận (Mẫu A, Mẫu B, Mẫu C, Mẫu D) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {(Object.keys(MATRIX_TEMPLATES) as MatrixTemplateCode[]).map(
                (tCode) => {
                  const tpl = MATRIX_TEMPLATES[tCode];
                  const isSelected = templateCode === tCode;
                  const applicability = validateTemplateApplicability(
                    tCode,
                    levelId,
                    grade,
                    subject
                  );

                  return (
                    <div
                      key={tCode}
                      className={`p-3.5 rounded-lg border transition flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500'
                          : applicability.valid
                          ? 'bg-white border-slate-200 hover:bg-slate-50/80'
                          : 'bg-slate-50/70 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {tpl.name}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {tpl.scopeNote}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                        {!applicability.valid ? (
                          <span className="text-[10px] font-semibold text-rose-700 whitespace-nowrap">
                            • Khác cấp học
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-700 whitespace-nowrap">
                            • Phù hợp cấp học
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleConfirmApplyTemplate(tCode)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold shrink-0 whitespace-nowrap cursor-pointer transition ${
                            isSelected && templateConfirmed
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-800 hover:bg-blue-600 hover:text-white'
                          }`}
                        >
                          {isSelected && templateConfirmed
                            ? 'Đã xác nhận mẫu'
                            : 'Chọn & Xác nhận'}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Khung cấu hình: Hàng trên gồm (Các cột dạng câu hỏi áp dụng 7/12 + Tỷ lệ nhận thức 5/12), Hàng dưới gồm 4 thẻ cấu hình dạng câu hỏi */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                {/* Bên trái (7/12): 4 nút bật/tắt dạng thức câu hỏi */}
                <div className="xl:col-span-7">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Các cột dạng câu hỏi áp dụng (Nhấn để bật / ẩn dạng không dùng):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {MATRIX_FORMAT_GROUPS.map((fg) => {
                      const active = activeFormatGroups.includes(fg.code);
                      const rule = scoringRules.find(
                        (r) => r.formatGroup === fg.code
                      );
                      const qCount = active
                        ? Math.max(1, rule?.targetQuestionCount || 1)
                        : 0;
                      const fmtPts = active
                        ? exactMul(qCount, rule?.defaultPointsPerQuestion || 0)
                        : 0;
                      const fmtPct = active
                        ? exactPercentage(fmtPts, targetTotalPoints)
                        : 0;
                      return (
                        <button
                          key={fg.code}
                          type="button"
                          onClick={() => handleToggleFormatGroup(fg.code)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border flex flex-col items-start justify-between gap-0.5 cursor-pointer transition ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 w-full">
                            {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                            <span
                              className={`truncate ${
                                !active ? 'line-through' : ''
                              }`}
                            >
                              {fg.shortLabel}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-mono ${
                              active ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {active
                              ? `${qCount} câu • ${fmtPts.toFixed(2)}đ (${fmtPct}%)`
                              : 'Đang ẩn'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bên phải (5/12): 3 ô Tỷ lệ mức độ nhận thức */}
                <div className="xl:col-span-5">
                  <div className="grid grid-cols-3 gap-2.5">
                    {MATRIX_LEVEL_COLUMNS.map((lc) => {
                      const levelPts = exactRound2(
                        (targetTotalPoints *
                          (targetLevelPercentages[lc.code] || 0)) /
                          100
                      );
                      return (
                        <div
                          key={lc.code}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-700">
                              Tỷ lệ {lc.label} (%)
                            </label>
                            <span className="text-[10px] font-mono text-slate-500">
                              ≈ {levelPts.toFixed(2)}đ
                            </span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={targetLevelPercentages[lc.code]}
                            onChange={(e) =>
                              handleUpdateLevelPercentage(
                                lc.code,
                                Number(e.target.value) || 0
                              )
                            }
                            className="w-full rounded border border-slate-300 bg-slate-50/60 px-2 py-1 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Thiết lập Số câu, Điểm mặc định & Quy tắc chấm từng dạng (Lưới 4 cột ngang trên màn hình rộng) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Số câu, Điểm mặc định & Quy tắc chấm từng dạng:
                  </label>

                  {/* Thanh trạng thái tổng cấu hình & nút thao tác nằm gọn trên cùng 1 hàng */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {(() => {
                      const totalConfiguredQ = activeFormatGroups.reduce(
                        (acc, fgCode) => {
                          const r = scoringRules.find(
                            (item) => item.formatGroup === fgCode
                          );
                          return acc + Math.max(1, r?.targetQuestionCount || 1);
                        },
                        0
                      );
                      const totalConfiguredPts = activeFormatGroups.reduce(
                        (acc, fgCode) => {
                          const r = scoringRules.find(
                            (item) => item.formatGroup === fgCode
                          );
                          const q = Math.max(1, r?.targetQuestionCount || 1);
                          const u = r?.defaultPointsPerQuestion || 0.25;
                          return exactAdd(acc, exactMul(q, u));
                        },
                        0
                      );
                      const ptsDiff = exactSub(
                        totalConfiguredPts,
                        targetTotalPoints
                      );
                      const isExactMatch = Math.abs(ptsDiff) < 0.001;

                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs border ${
                            isExactMatch
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          <span>
                            Tổng cấu hình ({activeFormatGroups.length} dạng):{' '}
                            <strong>{totalConfiguredQ} câu</strong> •{' '}
                            <strong>
                              {totalConfiguredPts.toFixed(2)} /{' '}
                              {targetTotalPoints.toFixed(2)} điểm
                            </strong>{' '}
                            (
                            {exactPercentage(
                              totalConfiguredPts,
                              targetTotalPoints
                            )}
                            %)
                          </span>
                          {!isExactMatch && (
                            <button
                              type="button"
                              onClick={handleRebalanceFormatsToTargetPoints}
                              className="font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                            >
                              Tự động sửa lệch ({ptsDiff > 0 ? '+' : ''}
                              {ptsDiff.toFixed(2)}đ)
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    <button
                      type="button"
                      onClick={handleRebalanceFormatsToTargetPoints}
                      className="text-xs font-semibold px-3 py-1 rounded-md bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                      title="Tự động tính lại số câu hỏi của các dạng đang bật để khớp đúng Tổng điểm quy định"
                    >
                      Cân đối = {targetTotalPoints}đ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (specRows.length > 0) {
                          const nextRows = allocateCellsAcrossSpecRows(
                            specRows,
                            activeFormatGroups,
                            scoringRules,
                            targetLevelPercentages,
                            targetTotalPoints,
                            levelId,
                            true
                          );
                          setSpecRows(nextRows);
                          setTargetLevelPercentages(
                            computeSyncedLevelPercentages(
                              nextRows,
                              activeFormatGroups,
                              targetLevelPercentages
                            )
                          );
                        }
                        onNotify(
                          'info',
                          'Đã áp dụng số câu & đơn giá điểm vào bảng Ma trận',
                          'Số câu hỏi và điểm số từng ô trong ma trận đã được phân bổ đồng bộ theo cấu hình của từng dạng.'
                        );
                      }}
                      className="text-xs font-semibold px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    >
                      Áp dụng số câu & điểm vào bảng
                    </button>
                  </div>
                </div>

                {/* Lưới ngang hiển thị các dạng câu hỏi đang bật (Tối đa 4 cột trên màn hình rộng) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {activeFormatGroups.map((fgCode) => {
                    const fgDef = MATRIX_FORMAT_GROUPS.find(
                      (g) => g.code === fgCode
                    );
                    const rule = scoringRules.find(
                      (r) => r.formatGroup === fgCode
                    ) || {
                      formatGroup: fgCode,
                      defaultPointsPerQuestion: 0.25,
                      targetQuestionCount: 4,
                      gradingRuleDescription: '',
                    };
                    const qCount = Math.max(
                      1,
                      Math.round(rule.targetQuestionCount || 1)
                    );
                    const formatTotalPts = exactMul(
                      qCount,
                      rule.defaultPointsPerQuestion
                    );
                    const formatPct = exactPercentage(
                      formatTotalPts,
                      targetTotalPoints
                    );

                    return (
                      <div
                        key={`rule-${fgCode}`}
                        className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {fgDef?.label}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                            {formatTotalPts.toFixed(2)}đ · {formatPct}%
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                          {/* Bộ chọn Số câu cho từng dạng */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-600">
                              Số câu:
                            </span>
                            <div className="inline-flex items-center rounded border border-slate-300 bg-slate-50">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateFormatQuestionCount(
                                    fgCode,
                                    Math.max(1, qCount - 1)
                                  )
                                }
                                className="px-1.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                                title="Giảm 1 câu"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                step={1}
                                value={qCount}
                                onChange={(e) =>
                                  handleUpdateFormatQuestionCount(
                                    fgCode,
                                    Number(e.target.value) || 1
                                  )
                                }
                                className="w-10 border-x border-slate-300 bg-white px-1 py-0.5 text-center font-mono text-xs font-bold text-emerald-700 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateFormatQuestionCount(
                                    fgCode,
                                    qCount + 1
                                  )
                                }
                                className="px-1.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                                title="Tăng 1 câu"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Bộ chọn Điểm/câu */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold text-slate-600">
                              Điểm/câu:
                            </span>
                            <input
                              type="number"
                              step="0.05"
                              min={0.05}
                              max={10}
                              value={rule.defaultPointsPerQuestion}
                              onChange={(e) =>
                                handleUpdateFormatUnitPoints(
                                  fgCode,
                                  Number(e.target.value) || 0.25
                                )
                              }
                              className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-right font-mono text-xs font-bold text-blue-700"
                            />
                            <span className="text-[11px] text-slate-500">
                              đ
                            </span>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={rule.gradingRuleDescription}
                          onChange={(e) => {
                            const nextDesc = e.target.value;
                            setScoringRules((prev) =>
                              prev.map((item) =>
                                item.formatGroup === fgCode
                                  ? {
                                      ...item,
                                      gradingRuleDescription: nextDesc,
                                    }
                                  : item
                              )
                            );
                          }}
                          placeholder="Quy tắc chấm riêng cho dạng câu hỏi này..."
                          className="w-full rounded border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-[11px] text-slate-700 focus:bg-white focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>


          {/* BẢNG MA TRẬN ĐỀ KIỂM TRA NHIỀU TẦNG TIÊU ĐỀ (Mục 3, 4, 5) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/40">
              {/* Hàng 1: Tiêu đề và mô tả chiếm trọn chiều ngang */}
              <div className="w-full">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  3. Bảng Ma trận Đề kiểm tra nhiều tầng tiêu đề (Tự động tính chính xác & Đối chiếu Ngân hàng)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Tích chọn <strong>Bài sẽ kiểm tra</strong> theo Học kì 1 / Học kì 2 để nạp tự động đơn vị kiến thức, thời lượng (số tiết) và đối chiếu Ngân hàng (<strong>NH: Có/Cần</strong>).
                </p>
              </div>

              {/* Hàng 2: Thanh công cụ thao tác nhanh (chia 2 cụm trái – phải cân đối) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/80">
                <div className="flex flex-wrap items-center gap-2">
                  {!(
                    levelId === EducationLevelId.LOWER_SECONDARY &&
                    grade === 6 &&
                    subject.toLowerCase().includes('khoa học tự nhiên')
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        setLevelId(EducationLevelId.LOWER_SECONDARY);
                        setGrade(6 as GradeNumber);
                        setSubject('Khoa học tự nhiên');
                        setDurationMinutes(90);
                        rebuildRowsForSubjectAndScope(
                          EducationLevelId.LOWER_SECONDARY,
                          6 as GradeNumber,
                          'Khoa học tự nhiên',
                          semester
                        );
                        onNotify(
                          'info',
                          'Đã nạp danh mục Khoa học tự nhiên 6 (55 bài) & phân bổ câu hỏi',
                          'Danh sách Chủ đề / Chương và các bài học Khoa học tự nhiên 6 đã được nạp và tự động phân bổ câu & điểm.'
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 cursor-pointer whitespace-nowrap"
                    >
                      Xem mẫu KHTN 6 (55 bài)
                    </button>
                  )}
                  {(specRows.length > 0 ||
                    selectedLessonsList.length > 0 ||
                    availableLessons.length > 0) && (
                    <button
                      type="button"
                      onClick={handleAutoDistributeSelectedLessons}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      <Sliders className="w-3.5 h-3.5 shrink-0" />
                      Tự động phân bổ câu & điểm ({totalMatrixPeriods} tiết •{' '}
                      {activeFormatGroups.length} dạng câu hỏi)
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {chapterGroups.length > 0 ? (
                    <select
                      onChange={(e) => {
                        const found = chapterGroups.find(
                          (cg) => cg.chapterKey === e.target.value
                        );
                        if (found) handleAddRowFromChapterGroup(found);
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="w-64 sm:w-80 truncate rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="" disabled>
                        + Thêm dòng Chủ đề / Chương ({chapterGroups.length} chủ đề)
                      </option>
                      {chapterGroups.map((cg) => (
                        <option
                          key={cg.chapterKey}
                          value={cg.chapterKey}
                          title={`[${cg.semester}] ${cg.chapterCode}: ${cg.chapterTitle} (${cg.totalPeriods} tiết • ${cg.lessons.length} bài)`}
                        >
                          [{cg.semester} • {cg.chapterCode}] {cg.chapterTitle} ({cg.totalPeriods} tiết • {cg.lessons.length} bài)
                        </option>
                      ))}
                    </select>
                  ) : (
                    matchingTopics.length > 0 && (
                      <select
                        onChange={(e) => {
                          const found = matchingTopics.find(
                            (t) => t.id === e.target.value
                          );
                          if (found) handleAddRowFromCurriculum(found);
                          e.target.value = '';
                        }}
                        defaultValue=""
                        className="w-64 sm:w-72 truncate rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="" disabled>
                          + Thêm dòng từ Chủ đề Chương trình ({matchingTopics.length})
                        </option>
                        {matchingTopics.map((t) => (
                          <option
                            key={t.id}
                            value={t.id}
                            title={`[${t.chapterCode}] ${t.chapterTitle} — ${t.topicTitle}`}
                          >
                            [{t.chapterCode}] {t.chapterTitle}
                          </option>
                        ))}
                      </select>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => handleAddRowFromCurriculum()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    Thêm dòng nội dung kiến thức
                  </button>
                </div>
              </div>
            </div>

            {/* KHUNG CHỌN "CHỦ ĐỀ / CHƯƠNG & BÀI SẼ KIỂM TRA" (TÁCH RIÊNG TỪNG CHỦ ĐỀ / CHƯƠNG & CHO PHÉP ĐÁNH DẤU CHỌN / BỎ CHỌN TỪNG BÀI) */}
            {availableLessons.length > 0 && (
              <div className="border-b border-slate-200 border-l-4 border-l-amber-400 bg-white px-5 py-4">
                {/* Thanh công cụ đầu khung */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-5 text-sm">
                    <span className="font-bold text-slate-900">
                      Chọn Chủ đề / Chương & Bài sẽ kiểm tra
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectLessonsByScope('HK1')}
                      className={`font-medium transition cursor-pointer ${
                        selectedLessonsList.length > 0 &&
                        selectedLessonsList.length === hk1Lessons.length &&
                        selectedLessonsList.every((l) => l.semester === 'HK1')
                          ? 'text-blue-700 font-bold underline underline-offset-4'
                          : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      Học kì 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectLessonsByScope('HK2')}
                      className={`font-medium transition cursor-pointer ${
                        selectedLessonsList.length > 0 &&
                        selectedLessonsList.length === hk2Lessons.length &&
                        selectedLessonsList.every((l) => l.semester === 'HK2')
                          ? 'text-blue-700 font-bold underline underline-offset-4'
                          : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      Học kì 2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectLessonsByScope('ALL')}
                      className={`font-medium transition cursor-pointer ${
                        selectedLessonsList.length === availableLessons.length &&
                        availableLessons.length > 0
                          ? 'text-blue-700 font-bold underline underline-offset-4'
                          : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectLessonsByScope('NONE')}
                      className={`font-medium transition cursor-pointer ${
                        selectedLessonsList.length === 0
                          ? 'text-slate-400'
                          : 'text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      Bỏ chọn
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                      {specRows.length} Chủ đề / Chương trong bảng
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      {selectedLessonsList.length} bài được chọn
                      {selectedTotalPeriods > 0
                        ? ` (${selectedTotalPeriods} tiết)`
                        : ''}
                    </span>
                  </div>
                </div>

                {/* Danh sách Chủ đề / Chương chia theo Học kì 1 & Học kì 2 — Mỗi Chủ đề / Chương là 1 thẻ độc lập có danh sách bài học để tích chọn / bỏ chọn */}
                <div className="mt-3 space-y-4">
                  {hk1ChapterGroups.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-bold text-blue-800 text-xs uppercase tracking-wide flex items-center gap-2">
                        <span>Học kì 1 ({hk1ChapterGroups.length} Chủ đề / Chương)</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          — Mỗi Chủ đề / Chương được chọn sẽ tạo 1 dòng riêng trên Bảng Ma trận
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {hk1ChapterGroups.map((cg) => {
                          const selectedInCg = cg.lessons.filter((l) =>
                            isLessonSelectedInRows(l, specRows)
                          );
                          const allChecked =
                            selectedInCg.length === cg.lessons.length &&
                            cg.lessons.length > 0;
                          const someChecked = selectedInCg.length > 0;
                          const selectedPeriods = selectedInCg.reduce(
                            (s, l) => s + l.periodsCount,
                            0
                          );

                          return (
                            <div
                              key={cg.chapterKey}
                              className={`rounded-lg border p-3 transition ${
                                someChecked
                                  ? 'border-blue-300 bg-blue-50/25'
                                  : 'border-slate-200 bg-slate-50/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-200/80">
                                <label className="flex items-start gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={someChecked}
                                    onChange={() => handleToggleChapterGroup(cg)}
                                    className="mt-0.5 h-4 w-4 rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <div>
                                    <span className="text-xs font-bold text-blue-900">
                                      {cg.chapterCode}:
                                    </span>{' '}
                                    <span className="text-xs font-bold text-slate-900">
                                      {cg.chapterTitle}
                                    </span>
                                  </div>
                                </label>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectOnlyChapterGroup(cg)}
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 cursor-pointer"
                                    title="Chỉ kiểm tra duy nhất Chủ đề này (xóa các Chủ đề khác khỏi bảng)"
                                  >
                                    Chỉ chọn CĐ này
                                  </button>
                                  <span
                                    className={`text-[11px] font-mono px-2 py-0.5 rounded shrink-0 ${
                                      someChecked
                                        ? 'bg-blue-100 text-blue-800 font-bold'
                                        : 'bg-slate-200/70 text-slate-600'
                                    }`}
                                  >
                                    {selectedInCg.length}/{cg.lessons.length} bài
                                    {someChecked ? ` • ${selectedPeriods}t` : ''}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1 pl-1">
                                {cg.lessons.map((lesson) => {
                                  const checked = isLessonSelectedInRows(
                                    lesson,
                                    specRows
                                  );
                                  return (
                                    <label
                                      key={lesson.id}
                                      className="flex items-start gap-2 py-0.5 cursor-pointer select-none group text-[12px] leading-snug"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          handleToggleLesson(lesson)
                                        }
                                        className="mt-0.5 h-3.5 w-3.5 rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                      />
                                      <span
                                        className={`${
                                          checked
                                            ? 'font-semibold text-slate-950'
                                            : 'text-slate-700 group-hover:text-slate-950'
                                        }`}
                                      >
                                        {lesson.lessonName}{' '}
                                        <span className="text-slate-500 font-normal">
                                          ({lesson.periodsCount} tiết)
                                        </span>
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {hk2ChapterGroups.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="font-bold text-blue-800 text-xs uppercase tracking-wide flex items-center gap-2">
                        <span>Học kì 2 ({hk2ChapterGroups.length} Chủ đề / Chương)</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          — Tích chọn Chủ đề / Chương hoặc đánh dấu chọn / bỏ chọn từng bài học bên trong
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {hk2ChapterGroups.map((cg) => {
                          const selectedInCg = cg.lessons.filter((l) =>
                            isLessonSelectedInRows(l, specRows)
                          );
                          const allChecked =
                            selectedInCg.length === cg.lessons.length &&
                            cg.lessons.length > 0;
                          const someChecked = selectedInCg.length > 0;
                          const selectedPeriods = selectedInCg.reduce(
                            (s, l) => s + l.periodsCount,
                            0
                          );

                          return (
                            <div
                              key={cg.chapterKey}
                              className={`rounded-lg border p-3 transition ${
                                someChecked
                                  ? 'border-blue-300 bg-blue-50/25'
                                  : 'border-slate-200 bg-slate-50/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-200/80">
                                <label className="flex items-start gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={someChecked}
                                    onChange={() => handleToggleChapterGroup(cg)}
                                    className="mt-0.5 h-4 w-4 rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <div>
                                    <span className="text-xs font-bold text-blue-900">
                                      {cg.chapterCode}:
                                    </span>{' '}
                                    <span className="text-xs font-bold text-slate-900">
                                      {cg.chapterTitle}
                                    </span>
                                  </div>
                                </label>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectOnlyChapterGroup(cg)}
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 cursor-pointer"
                                    title="Chỉ kiểm tra duy nhất Chủ đề này (xóa các Chủ đề khác khỏi bảng)"
                                  >
                                    Chỉ chọn CĐ này
                                  </button>
                                  <span
                                    className={`text-[11px] font-mono px-2 py-0.5 rounded shrink-0 ${
                                      someChecked
                                        ? 'bg-blue-100 text-blue-800 font-bold'
                                        : 'bg-slate-200/70 text-slate-600'
                                    }`}
                                  >
                                    {selectedInCg.length}/{cg.lessons.length} bài
                                    {someChecked ? ` • ${selectedPeriods}t` : ''}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1 pl-1">
                                {cg.lessons.map((lesson) => {
                                  const checked = isLessonSelectedInRows(
                                    lesson,
                                    specRows
                                  );
                                  return (
                                    <label
                                      key={lesson.id}
                                      className="flex items-start gap-2 py-0.5 cursor-pointer select-none group text-[12px] leading-snug"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          handleToggleLesson(lesson)
                                        }
                                        className="mt-0.5 h-3.5 w-3.5 rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                      />
                                      <span
                                        className={`${
                                          checked
                                            ? 'font-semibold text-slate-950'
                                            : 'text-slate-700 group-hover:text-slate-950'
                                        }`}
                                      >
                                        {lesson.lessonName}{' '}
                                        <span className="text-slate-500 font-normal">
                                          ({lesson.periodsCount} tiết)
                                        </span>
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  {/* Tầng tiêu đề 1 */}
                  <tr className="bg-slate-900 text-white">
                    <th
                      rowSpan={3}
                      className="border border-slate-700 px-2.5 py-2 text-center w-10"
                    >
                      TT
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-700 px-3 py-2 text-left min-w-[175px]"
                    >
                      Chủ đề / Chương
                      <div className="text-[10px] font-normal text-slate-300 mt-0.5">
                        (1 dòng = 1 Chủ đề / Chương)
                      </div>
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-700 px-3 py-2 text-left min-w-[320px]"
                    >
                      Nội dung / Đơn vị kiến thức & Yêu cầu cần đạt
                      <div className="text-[10px] font-normal text-slate-300 mt-0.5">
                        (Hiển thị bài học & từng Yêu cầu cần đạt trên 1 dòng riêng – đã lược bỏ ký hiệu NLS/AI)
                      </div>
                    </th>
                    <th
                      colSpan={activeFormatGroups.length * 3}
                      className="border border-slate-700 px-3 py-1.5 text-center font-bold uppercase tracking-wider bg-slate-800"
                    >
                      Mức độ đánh giá theo dạng thức câu hỏi
                    </th>
                    <th
                      colSpan={3}
                      rowSpan={2}
                      className="border border-slate-700 px-2.5 py-1.5 text-center bg-slate-800"
                    >
                      Tổng theo mức độ
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-700 px-2.5 py-2 text-center w-16"
                    >
                      Tổng số câu
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-700 px-2.5 py-2 text-center w-20"
                    >
                      Tổng điểm
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-700 px-2.5 py-2 text-center w-16"
                    >
                      Tỷ lệ %
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-700 px-2 py-2 text-center w-10"
                    >
                      Xóa
                    </th>
                  </tr>

                  {/* Tầng tiêu đề 2: Tên các nhóm dạng câu hỏi đang bật */}
                  <tr className="bg-slate-800 text-white">
                    {activeFormatGroups.map((fgCode) => {
                      const fg = MATRIX_FORMAT_GROUPS.find(
                        (f) => f.code === fgCode
                      );
                      return (
                        <th
                          key={fgCode}
                          colSpan={3}
                          className="border border-slate-700 px-2 py-1.5 text-center font-semibold"
                        >
                          {fg?.label}
                        </th>
                      );
                    })}
                  </tr>

                  {/* Tầng tiêu đề 3: Biết - Hiểu - Vận dụng */}
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    {activeFormatGroups.map((fgCode) =>
                      MATRIX_LEVEL_COLUMNS.map((lc) => (
                        <th
                          key={`${fgCode}-${lc.code}`}
                          className="border border-slate-300 px-2 py-1.5 text-center min-w-[82px]"
                        >
                          {lc.label}
                        </th>
                      ))
                    )}
                    {MATRIX_LEVEL_COLUMNS.map((lc) => (
                      <th
                        key={`sum-lvl-${lc.code}`}
                        className="border border-slate-300 px-2 py-1.5 text-center bg-slate-200/70"
                      >
                        {lc.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {specRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={activeFormatGroups.length * 3 + 10}
                        className="border border-slate-200 px-4 py-8 text-center text-slate-500 bg-slate-50/60"
                      >
                        Chưa có Chủ đề / Chương nào được chọn (<strong>0 bài được chọn</strong>). Hãy tích chọn các Chủ đề / Chương hoặc bài học trong mục{' '}
                        <strong className="text-slate-800">Chọn Chủ đề / Chương & Bài sẽ kiểm tra</strong> phía trên (hoặc nhấn{' '}
                        <button
                          type="button"
                          onClick={() => handleSelectLessonsByScope('HK1')}
                          className="font-bold text-blue-700 underline cursor-pointer"
                        >
                          Học kì 1
                        </button>{' '}
                        /{' '}
                        <button
                          type="button"
                          onClick={() => handleSelectLessonsByScope('HK2')}
                          className="font-bold text-blue-700 underline cursor-pointer"
                        >
                          Học kì 2
                        </button>{' '}
                        /{' '}
                        <button
                          type="button"
                          onClick={() => handleSelectLessonsByScope('ALL')}
                          className="font-bold text-blue-700 underline cursor-pointer"
                        >
                          Tất cả
                        </button>
                        ) để lập Bảng Ma trận Đề kiểm tra.
                      </td>
                    </tr>
                  )}
                  {specRows.map((row, rIdx) => {
                    const rm = computedSummary.rowMetrics[row.id];
                    const resolvedLessonItems = getResolvedLessonItemsForRow(row);
                    const uniqueLessonStats =
                      getUniqueLessonSummary(resolvedLessonItems);
                    const selectedLessonCount = resolvedLessonItems.filter(
                      (li) => li.selected
                    ).length;
                    const rowPeriods = getPeriodsForSpecRow(row);
                    const showAllLessonsInRow = Boolean(
                      collapsedChapterRows[row.id]
                    );

                    // Nếu Chủ đề / Chương có danh sách bài học & YCCĐ: Mỗi Yêu cầu cần đạt của bài học được hiển thị trên 1 dòng riêng kèm đủ các phần & mức độ câu hỏi
                    if (resolvedLessonItems.length > 0) {
                      const selectedOnly = resolvedLessonItems.filter(
                        (li) => li.selected
                      );
                      const displayedLessons =
                        !showAllLessonsInRow && selectedOnly.length > 0
                          ? selectedOnly
                          : resolvedLessonItems;
                      const spanCount = Math.max(1, displayedLessons.length);

                      return (
                        <React.Fragment key={row.id}>
                          {displayedLessons.map((li, lIdx) => {
                            const lm =
                              computedSummary.lessonMetrics[
                                `${row.id}__${li.id}`
                              ];
                            const cleanYccdText = cleanLearningOutcomeText(
                              li.learningOutcomeText || row.learningOutcomeText,
                              li.lessonName
                            );
                            const totalOutcomesForThisLesson =
                              li.totalOutcomesInLesson || 1;
                            const outcomeIdxForThisLesson =
                              li.outcomeIndex || 1;

                            return (
                              <tr
                                key={`${row.id}__${li.id}`}
                                className={
                                  li.selected
                                    ? 'hover:bg-slate-50/80'
                                    : 'bg-slate-50/50 opacity-65'
                                }
                              >
                                {lIdx === 0 && (
                                  <>
                                    <td
                                      rowSpan={spanCount}
                                      className="border border-slate-200 px-2 py-2 text-center font-bold text-slate-700 align-top"
                                    >
                                      {rIdx + 1}
                                    </td>
                                    <td
                                      rowSpan={spanCount}
                                      className="border border-slate-200 p-2 align-top space-y-1.5 bg-slate-50/30"
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                          Chủ đề / Chương #{rIdx + 1}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                            {rowPeriods} tiết
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveRow(row.id)}
                                            className="p-0.5 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                            title="Xóa toàn bộ Chủ đề / Chương này khỏi bảng"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                      <input
                                        type="text"
                                        value={row.chapterCode}
                                        onChange={(e) =>
                                          setSpecRows((prev) =>
                                            prev.map((r) =>
                                              r.id === row.id
                                                ? {
                                                    ...r,
                                                    chapterCode: e.target.value,
                                                  }
                                                : r
                                            )
                                          )
                                        }
                                        placeholder="Mã Chương / Chủ đề"
                                        className="w-full font-bold text-blue-800 bg-transparent border-b border-dashed border-slate-300 pb-0.5 focus:outline-hidden"
                                      />
                                      <textarea
                                        rows={2}
                                        value={row.topicTitle}
                                        onChange={(e) =>
                                          setSpecRows((prev) =>
                                            prev.map((r) =>
                                              r.id === row.id
                                                ? {
                                                    ...r,
                                                    topicTitle: e.target.value,
                                                  }
                                                : r
                                            )
                                          )
                                        }
                                        placeholder="Tên Chủ đề / Chương"
                                        className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded p-1.5"
                                      />
                                      <div className="rounded border border-blue-200 bg-blue-50/60 px-2 py-1 space-y-1">
                                        <div className="text-[10px] font-bold text-blue-900">
                                          Đang chọn trong {row.chapterCode}:{' '}
                                          {
                                            uniqueLessonStats.selectedUniqueLessonsCount
                                          }
                                          /{uniqueLessonStats.totalUniqueLessons}{' '}
                                          bài ({selectedLessonCount}/
                                          {resolvedLessonItems.length} dòng YCCĐ)
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                          {selectedLessonCount <
                                            resolvedLessonItems.length && (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleSetAllRowLessonsSelected(
                                                    row.id,
                                                    true
                                                  )
                                                }
                                                className="font-semibold text-blue-700 hover:underline cursor-pointer"
                                              >
                                                Chọn tất cả
                                              </button>
                                              <span className="text-slate-300">
                                                |
                                              </span>
                                            </>
                                          )}
                                          {selectedLessonCount <
                                            resolvedLessonItems.length && (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  toggleCollapseChapterRow(
                                                    row.id
                                                  )
                                                }
                                                className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                                              >
                                                {showAllLessonsInRow
                                                  ? 'Ẩn mục bỏ chọn'
                                                  : `Hiện cả ${
                                                      resolvedLessonItems.length -
                                                      selectedLessonCount
                                                    } mục bỏ chọn`}
                                              </button>
                                              <span className="text-slate-300">
                                                |
                                              </span>
                                            </>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveRow(row.id)
                                            }
                                            className="font-semibold text-rose-600 hover:underline cursor-pointer"
                                          >
                                            Xóa Chủ đề
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </>
                                )}

                                {/* Cột Nội dung / Đơn vị kiến thức: Hiển thị Tên bài học + Yêu cầu cần đạt (đã lược bỏ ký hiệu NLS/AI). Nếu bài có nhiều YCCĐ thì mỗi YCCĐ hiển thị trên 1 dòng riêng */}
                                <td className="border border-slate-200 p-2 align-top min-w-[300px]">
                                  <div className="space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <label className="flex items-start gap-2 cursor-pointer select-none group min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={li.selected}
                                          onChange={() =>
                                            handleToggleRowLessonItem(
                                              row.id,
                                              li.id
                                            )
                                          }
                                          className="mt-0.5 h-4 w-4 rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                        />
                                        <div
                                          className={
                                            li.selected
                                              ? 'font-bold text-slate-900 text-xs leading-snug'
                                              : 'text-slate-400 line-through text-xs leading-snug'
                                          }
                                        >
                                          {li.lessonName}{' '}
                                          <span className="text-slate-500 font-normal no-underline">
                                            ({li.periodsCount}t)
                                          </span>
                                        </div>
                                      </label>

                                      <div className="flex items-center gap-1 shrink-0">
                                        {totalOutcomesForThisLesson > 1 && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            YCCĐ {outcomeIdxForThisLesson}/
                                            {totalOutcomesForThisLesson}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleAddOutcomeRowForLesson(
                                              row.id,
                                              li
                                            )
                                          }
                                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                                          title="Tách / Thêm 1 dòng Yêu cầu cần đạt mới cho bài học này để gán số câu hỏi riêng"
                                        >
                                          + YCCĐ
                                        </button>
                                        {totalOutcomesForThisLesson > 1 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveOutcomeRowFromLesson(
                                                row.id,
                                                li.id
                                              )
                                            }
                                            className="px-1 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                                            title="Xóa dòng Yêu cầu cần đạt này"
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Hiển thị & cho phép sửa trực tiếp Yêu cầu cần đạt của dòng này (đã lược bỏ ký hiệu NLS/AI) */}
                                    <div className="pl-6 space-y-1">
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                        <span className="font-semibold text-blue-700">
                                          Yêu cầu cần đạt
                                          {totalOutcomesForThisLesson > 1
                                            ? ` #${outcomeIdxForThisLesson}`
                                            : ''}
                                          :
                                        </span>
                                        {!li.selected && (
                                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-medium">
                                            Đang bỏ chọn
                                          </span>
                                        )}
                                      </div>
                                      <textarea
                                        rows={2}
                                        value={cleanYccdText}
                                        disabled={!li.selected}
                                        onChange={(e) =>
                                          handleUpdateLessonOutcomeText(
                                            row.id,
                                            li.id,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Nhập yêu cầu cần đạt của bài học..."
                                        className="w-full text-[11px] leading-relaxed text-slate-800 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded px-2 py-1 focus:outline-hidden disabled:opacity-60"
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* Tương ứng với mỗi bài học: Các câu hỏi của từng phần (Trắc nghiệm nhiều lựa chọn, Đúng - Sai, Trả lời ngắn, Tự luận) x 3 mức độ (Biết, Hiểu, Vận dụng) */}
                                {activeFormatGroups.map((fgCode) =>
                                  MATRIX_LEVEL_COLUMNS.map((lc) => {
                                    const cell = getLessonItemCell(
                                      li,
                                      fgCode,
                                      lc.code
                                    );
                                    const cov =
                                      computedSummary.cellBankCoverage[
                                        `${row.id}__${li.id}__${fgCode}__${lc.code}`
                                      ];
                                    const hasShortage =
                                      cell.questionCount > 0 &&
                                      cov &&
                                      cov.shortageCount > 0;

                                    return (
                                      <td
                                        key={`${row.id}-${li.id}-${fgCode}-${lc.code}`}
                                        className={`border border-slate-200 p-1.5 align-top ${
                                          hasShortage
                                            ? 'bg-amber-50/90'
                                            : cell.questionCount > 0
                                            ? 'bg-blue-50/30'
                                            : ''
                                        }`}
                                      >
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={50}
                                              disabled={!li.selected}
                                              value={cell.questionCount}
                                              onChange={(e) =>
                                                handleUpdateLessonCell(
                                                  row.id,
                                                  li.id,
                                                  fgCode,
                                                  lc.code,
                                                  'questionCount',
                                                  Number(e.target.value)
                                                )
                                              }
                                              title={`Số câu hỏi (${li.lessonName})`}
                                              className="w-14 rounded border border-slate-300 bg-white px-1 py-0.5 text-center font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                            <span className="text-[10px] text-slate-500">
                                              câu
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <input
                                              type="number"
                                              step="0.25"
                                              min={0}
                                              max={10}
                                              disabled={!li.selected}
                                              value={cell.points}
                                              onChange={(e) =>
                                                handleUpdateLessonCell(
                                                  row.id,
                                                  li.id,
                                                  fgCode,
                                                  lc.code,
                                                  'points',
                                                  Number(e.target.value)
                                                )
                                              }
                                              title={`Số điểm (${li.lessonName})`}
                                              className="w-14 rounded border border-slate-200 bg-white px-1 py-0.5 text-center font-mono text-[11px] text-blue-700 disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                            <span className="text-[10px] text-slate-500">
                                              đ
                                            </span>
                                          </div>
                                          <div
                                            className={`text-[10px] font-mono px-1 py-0.5 rounded text-center ${
                                              hasShortage
                                                ? 'bg-amber-200/80 text-amber-950 font-bold'
                                                : cell.questionCount > 0
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'text-slate-400'
                                            }`}
                                          >
                                            NH: {cov?.availableTotalCount ?? 2}/
                                            {cell.questionCount}
                                          </div>
                                        </div>
                                      </td>
                                    );
                                  })
                                )}

                                {/* Tổng theo 3 mức độ của từng bài học */}
                                {MATRIX_LEVEL_COLUMNS.map((lc) => {
                                  const lv = lm?.byLevel[lc.code];
                                  return (
                                    <td
                                      key={`${row.id}-${li.id}-lvl-${lc.code}`}
                                      className="border border-slate-200 px-2 py-2 text-center bg-slate-50 font-mono"
                                    >
                                      <div className="font-bold text-slate-900">
                                        {lv?.count || 0}c
                                      </div>
                                      <div className="text-[11px] text-slate-600">
                                        {(lv?.points || 0).toFixed(2)}đ
                                      </div>
                                    </td>
                                  );
                                })}

                                <td className="border border-slate-200 px-2 py-2 text-center font-bold text-slate-900 bg-slate-50">
                                  {lm?.totalQuestions || 0}
                                </td>
                                <td className="border border-slate-200 px-2 py-2 text-center font-mono font-bold text-blue-700 bg-blue-50/40">
                                  {(lm?.totalPoints || 0).toFixed(2)}
                                </td>
                                <td className="border border-slate-200 px-2 py-2 text-center font-mono font-semibold text-slate-800 bg-slate-50">
                                  {(lm?.percentageOfExam || 0).toFixed(1)}%
                                </td>
                                <td className="border border-slate-200 px-2 py-2 text-center align-middle">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      selectedLessonCount > 1
                                        ? handleToggleRowLessonItem(
                                            row.id,
                                            li.id
                                          )
                                        : handleRemoveRow(row.id)
                                    }
                                    className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    title={
                                      selectedLessonCount > 1
                                        ? `Xóa / bỏ chọn "${li.lessonName}" khỏi bảng`
                                        : `Xóa Chủ đề "${row.chapterCode}" khỏi bảng`
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    }

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="border border-slate-200 px-2 py-2 text-center font-bold text-slate-700">
                          {rIdx + 1}
                        </td>
                        <td className="border border-slate-200 p-2 align-top space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              Chủ đề / Chương #{rIdx + 1}
                            </span>
                            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {rowPeriods} tiết
                            </span>
                          </div>
                          <input
                            type="text"
                            value={row.chapterCode}
                            onChange={(e) =>
                              setSpecRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, chapterCode: e.target.value }
                                    : r
                                )
                              )
                            }
                            placeholder="Mã Chương / Chủ đề (VD: Chương I)"
                            className="w-full font-bold text-blue-800 bg-transparent border-b border-dashed border-slate-300 pb-0.5 focus:outline-hidden"
                          />
                          <textarea
                            rows={2}
                            value={row.topicTitle}
                            onChange={(e) =>
                              setSpecRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, topicTitle: e.target.value }
                                    : r
                                )
                              )
                            }
                            placeholder="Tên Chủ đề / Chương"
                            className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded p-1.5"
                          />
                        </td>
                        <td className="border border-slate-200 p-2 align-top space-y-2">
                          <textarea
                            rows={2}
                            value={row.knowledgeUnit}
                            onChange={(e) =>
                              setSpecRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, knowledgeUnit: e.target.value }
                                    : r
                                )
                              )
                            }
                            placeholder="Tên bài học / Đơn vị kiến thức"
                            className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded p-1.5"
                          />
                          <div className="space-y-1">
                            <div className="text-[10px] font-semibold text-blue-700">
                              Yêu cầu cần đạt (đã lược bỏ ký hiệu NLS/AI):
                            </div>
                            <textarea
                              rows={2}
                              value={cleanLearningOutcomeText(
                                row.learningOutcomeText,
                                row.knowledgeUnit
                              )}
                              onChange={(e) =>
                                setSpecRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? {
                                          ...r,
                                          learningOutcomeText: e.target.value,
                                        }
                                      : r
                                  )
                                )
                              }
                              placeholder="Yêu cầu cần đạt của bài học..."
                              className="w-full text-[11px] leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded p-1.5"
                            />
                          </div>
                        </td>

                        {/* Các ô nhập Số câu & Điểm theo từng dạng và mức độ */}
                        {activeFormatGroups.map((fgCode) =>
                          MATRIX_LEVEL_COLUMNS.map((lc) => {
                            const cell = row.cells.find(
                              (c) =>
                                c.formatGroup === fgCode &&
                                c.levelColumn === lc.code
                            ) || {
                              formatGroup: fgCode,
                              levelColumn: lc.code,
                              questionCount: 0,
                              points: 0,
                            };

                            const cov =
                              computedSummary.cellBankCoverage[
                                `${row.id}__${fgCode}__${lc.code}`
                              ];
                            const hasShortage =
                              cell.questionCount > 0 &&
                              cov &&
                              cov.shortageCount > 0;

                            return (
                              <td
                                key={`${row.id}-${fgCode}-${lc.code}`}
                                className={`border border-slate-200 p-1.5 align-top ${
                                  hasShortage
                                    ? 'bg-amber-50/90'
                                    : cell.questionCount > 0
                                    ? 'bg-blue-50/30'
                                    : ''
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      max={50}
                                      value={cell.questionCount}
                                      onChange={(e) =>
                                        handleUpdateCell(
                                          row.id,
                                          fgCode,
                                          lc.code,
                                          'questionCount',
                                          Number(e.target.value)
                                        )
                                      }
                                      title="Số câu hỏi"
                                      className="w-11 rounded border border-slate-300 bg-white px-1 py-0.5 text-center font-bold text-slate-900"
                                    />
                                    <span className="text-[10px] text-slate-500">
                                      câu
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step="0.25"
                                      min={0}
                                      max={10}
                                      value={cell.points}
                                      onChange={(e) =>
                                        handleUpdateCell(
                                          row.id,
                                          fgCode,
                                          lc.code,
                                          'points',
                                          Number(e.target.value)
                                        )
                                      }
                                      title="Số điểm của ô"
                                      className="w-11 rounded border border-slate-200 bg-white px-1 py-0.5 text-center font-mono text-[11px] text-blue-700"
                                    />
                                    <span className="text-[10px] text-slate-500">
                                      đ
                                    </span>
                                  </div>
                                  {/* Hiển thị số câu Ngân hàng đáp ứng */}
                                  <div
                                    className={`text-[10px] font-mono px-1 py-0.5 rounded text-center ${
                                      hasShortage
                                        ? 'bg-amber-200/80 text-amber-950 font-bold'
                                        : cell.questionCount > 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    NH: {cov?.availableTotalCount || 0}/
                                    {cell.questionCount}
                                  </div>
                                </div>
                              </td>
                            );
                          })
                        )}

                        {/* Tổng theo 3 mức độ của hàng */}
                        {MATRIX_LEVEL_COLUMNS.map((lc) => {
                          const lv = rm?.byLevel[lc.code];
                          return (
                            <td
                              key={`${row.id}-lvl-${lc.code}`}
                              className="border border-slate-200 px-2 py-2 text-center bg-slate-50 font-mono"
                            >
                              <div className="font-bold text-slate-900">
                                {lv?.count || 0}c
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {(lv?.points || 0).toFixed(2)}đ
                              </div>
                            </td>
                          );
                        })}

                        <td className="border border-slate-200 px-2 py-2 text-center font-bold text-slate-900 bg-slate-50">
                          {rm?.totalQuestions || 0}
                        </td>
                        <td className="border border-slate-200 px-2 py-2 text-center font-mono font-bold text-blue-700 bg-blue-50/40">
                          {(rm?.totalPoints || 0).toFixed(2)}
                        </td>
                        <td className="border border-slate-200 px-2 py-2 text-center font-mono font-semibold text-slate-800 bg-slate-50">
                          {(rm?.percentageOfExam || 0).toFixed(1)}%
                        </td>
                        <td className="border border-slate-200 px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Chân bảng tổng hợp: Tổng số câu, Tổng điểm, Tỷ lệ % */}
                <tfoot className="bg-slate-100 font-bold text-slate-900">
                  <tr>
                    <td
                      colSpan={3}
                      className="border border-slate-300 px-3 py-2 text-right uppercase"
                    >
                      Tổng số câu & Điểm theo cột:
                    </td>
                    {activeFormatGroups.map((fgCode) =>
                      MATRIX_LEVEL_COLUMNS.map((lc) => {
                        const col =
                          computedSummary.byCellColumn[`${fgCode}__${lc.code}`];
                        return (
                          <td
                            key={`foot-${fgCode}-${lc.code}`}
                            className="border border-slate-300 px-2 py-2 text-center font-mono"
                          >
                            <div>{col?.count || 0} câu</div>
                            <div className="text-blue-700">
                              {(col?.points || 0).toFixed(2)}đ
                            </div>
                          </td>
                        );
                      })
                    )}
                    {MATRIX_LEVEL_COLUMNS.map((lc) => {
                      const lv = computedSummary.byLevelColumn[lc.code];
                      return (
                        <td
                          key={`foot-lvl-${lc.code}`}
                          className="border border-slate-300 px-2 py-2 text-center font-mono bg-slate-200"
                        >
                          <div>{lv.count}c</div>
                          <div className="text-blue-800">
                            {lv.points.toFixed(2)}đ
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-slate-300 px-2 py-2 text-center text-sm">
                      {computedSummary.totalQuestions}
                    </td>
                    <td
                      className={`border border-slate-300 px-2 py-2 text-center font-mono text-sm ${
                        Math.abs(computedSummary.pointsDiff) <= 0.001
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-100'
                      }`}
                    >
                      {computedSummary.totalPoints.toFixed(2)}đ
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-mono">
                      {exactRound2(
                        (computedSummary.totalPoints /
                          computedSummary.targetTotalPoints) *
                          100
                      )}
                      %
                    </td>
                    <td className="border border-slate-300" />
                  </tr>

                  {/* Hàng Tỷ lệ % theo từng nhóm dạng câu hỏi & mức độ nhận thức */}
                  <tr className="bg-slate-200/80 text-xs">
                    <td
                      colSpan={3}
                      className="border border-slate-300 px-3 py-2 text-right uppercase"
                    >
                      Tỷ lệ phần trăm (%) theo nhóm dạng & mức độ:
                    </td>
                    {activeFormatGroups.map((fgCode) => {
                      const fgSummary = computedSummary.byFormatGroup[fgCode];
                      return (
                        <td
                          key={`pct-fg-${fgCode}`}
                          colSpan={3}
                          className="border border-slate-300 px-2 py-2 text-center font-mono text-indigo-900"
                        >
                          {fgSummary.count} câu · {fgSummary.points.toFixed(2)}đ (
                          {fgSummary.percentage}%)
                        </td>
                      );
                    })}
                    {MATRIX_LEVEL_COLUMNS.map((lc) => {
                      const lv = computedSummary.byLevelColumn[lc.code];
                      return (
                        <td
                          key={`pct-lvl-${lc.code}`}
                          className="border border-slate-300 px-2 py-2 text-center font-mono text-emerald-900"
                        >
                          {lv.percentage}%
                        </td>
                      );
                    })}
                    <td colSpan={4} className="border border-slate-300 px-2 py-2 text-center">
                      Chuẩn: Biết {targetLevelPercentages.BIET}% / Hiểu{' '}
                      {targetLevelPercentages.HIEU}% / VD{' '}
                      {targetLevelPercentages.VAN_DUNG}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Mục 8: Quản lý phiên bản, Khóa phiên bản đã duyệt & Ghi nhận lịch sử chỉnh sửa */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  4. Quản lý phiên bản & Nhật ký ghi nhận chỉnh sửa (Phiên bản hiện tại: v{currentVersion})
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Người biên soạn / Tổ chuyên môn:</span>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={editorVersionNote}
                onChange={(e) => setEditorVersionNote(e.target.value)}
                placeholder="Nhập ghi chú chỉnh sửa phiên bản trước khi Lưu nháp / Gửi thẩm định / Phê duyệt..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={() => handlePersistMatrix(ApprovalStatus.DRAFT)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shrink-0"
              >
                Ghi nhận & Lưu nháp
              </button>
            </div>

            {activeMatrixRecord?.versionHistory &&
              activeMatrixRecord.versionHistory.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700">
                    Lịch sử các phiên bản của Ma trận ({activeMatrixRecord.versionHistory.length} bản ghi):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeMatrixRecord.versionHistory.map((vh, idx) => (
                      <div
                        key={`${vh.version}-${idx}`}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-blue-700">
                              Phiên bản v{vh.version}
                            </span>
                            <span>·</span>
                            <span>{vh.editorName}</span>
                            <span>·</span>
                            <span className="text-slate-500 font-normal">
                              {vh.updatedAt}
                            </span>
                          </div>
                          <div className="text-slate-600 mt-0.5">{vh.note}</div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                          {getApprovalStatusInfo(vh.status).label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* NỘI DUNG TAB 2: BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỒNG BỘ & CHỈNH SỬA YCCĐ CÓ LƯU LỊCH SỬ (Mục 6) */}
      {activeTab === 'SPECIFICATION' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bản Đặc Tả Đề Kiểm Tra Liên Kết Trực Tiếp Với Ma Trận
              </h3>
              <p className="text-xs text-slate-500">
                Mọi thay đổi về số câu, điểm số bên Ma trận tự động cập nhật sang Bản đặc tả. Khi chỉnh sửa Yêu cầu cần đạt, hệ thống lưu rõ nguồn gốc và lịch sử chỉnh sửa.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th
                    rowSpan={3}
                    className="border border-slate-700 px-2.5 py-2 w-10 text-center"
                  >
                    TT
                  </th>
                  <th
                    rowSpan={3}
                    className="border border-slate-700 px-3 py-2 text-left w-44"
                  >
                    Chủ đề / Chương
                  </th>
                  <th
                    rowSpan={3}
                    className="border border-slate-700 px-3 py-2 text-left w-52"
                  >
                    Nội dung / Đơn vị kiến thức
                    <div className="text-[10px] font-normal text-slate-300 mt-0.5">
                      (Chia theo từng bài học)
                    </div>
                  </th>
                  <th
                    rowSpan={3}
                    className="border border-slate-700 px-3 py-2 text-left min-w-[260px]"
                  >
                    Mức độ & Yêu cầu cần đạt (Từng bài)
                  </th>
                  <th
                    colSpan={MATRIX_FORMAT_GROUPS.length * 3}
                    className="border border-slate-700 px-3 py-1.5 text-center bg-indigo-950 font-bold uppercase tracking-wider"
                  >
                    Số câu hỏi theo mức độ nhận thức ở từng phần
                  </th>
                  <th
                    rowSpan={3}
                    className="border border-slate-700 px-2.5 py-2 text-center w-16 bg-slate-950"
                  >
                    Tổng số câu
                  </th>
                  <th
                    rowSpan={3}
                    className="border border-slate-700 px-2.5 py-2 text-center w-20 bg-slate-950"
                  >
                    Tổng điểm
                  </th>
                  <th
                    rowSpan={3}
                    className="border border-slate-700 px-3 py-2 text-left w-36"
                  >
                    Ghi chú
                  </th>
                </tr>
                <tr className="bg-slate-800 text-white">
                  {MATRIX_FORMAT_GROUPS.map((fg) => {
                    const isFgActive = activeFormatGroups.includes(fg.code);
                    return (
                      <th
                        key={`spec-hdr-fg-${fg.code}`}
                        colSpan={3}
                        className={`border border-slate-700 px-2 py-1.5 text-center ${
                          isFgActive ? 'text-amber-300' : 'text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">{fg.label}</div>
                      </th>
                    );
                  })}
                </tr>
                <tr className="bg-slate-100 text-slate-800 font-semibold">
                  {MATRIX_FORMAT_GROUPS.map((fg) =>
                    MATRIX_LEVEL_COLUMNS.map((lc) => (
                      <th
                        key={`spec-hdr-col-${fg.code}-${lc.code}`}
                        className="border border-slate-300 px-1.5 py-1 text-center min-w-[46px] text-[11px]"
                      >
                        {lc.label}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {specRows.map((row, idx) => {
                  const rm = computedSummary.rowMetrics[row.id];
                  const resolvedLessonItems = getResolvedLessonItemsForRow(row);
                  const selectedOnly = resolvedLessonItems.filter(
                    (li) => li.selected
                  );
                  const selectedLessonCount = selectedOnly.length;
                  const showAllInSpec = Boolean(collapsedChapterRows[row.id]);
                  const displayedLessons =
                    !showAllInSpec && selectedOnly.length > 0
                      ? selectedOnly
                      : resolvedLessonItems;
                  const spanCount = Math.max(1, displayedLessons.length);

                  if (resolvedLessonItems.length === 0) {
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="border border-slate-200 px-2.5 py-3 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 p-3 align-top">
                          <div className="font-bold text-blue-800">
                            {row.chapterCode}
                          </div>
                          <div className="font-medium text-slate-900 mt-0.5">
                            {row.topicTitle}
                          </div>
                          <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {getPeriodsForSpecRow(row)} tiết
                          </div>
                        </td>
                        <td className="border border-slate-200 p-3 align-top font-medium text-slate-800">
                          <div className="text-xs text-slate-800">
                            {row.knowledgeUnit}
                          </div>
                        </td>
                        <td className="border border-slate-200 p-3 align-top space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono font-bold text-blue-700 mr-1.5">
                                [{row.learningOutcomeCode}]
                              </span>
                              <span className="text-slate-900 leading-relaxed">
                                {row.learningOutcomeText}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOutcomeRowId(row.id);
                                setEditingOutcomeText(row.learningOutcomeText);
                                setEditingOutcomeReason('');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold shrink-0 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              Sửa YCCĐ
                            </button>
                          </div>
                        </td>
                        {MATRIX_FORMAT_GROUPS.map((fg) =>
                          MATRIX_LEVEL_COLUMNS.map((lc) => {
                            const c = activeFormatGroups.includes(fg.code)
                              ? row.cells.find(
                                  (x) =>
                                    x.formatGroup === fg.code &&
                                    x.levelColumn === lc.code
                                )
                              : undefined;
                            const count = c?.questionCount || 0;
                            return (
                              <td
                                key={`spec-empty-cell-${row.id}-${fg.code}-${lc.code}`}
                                className={`border border-slate-200 px-1.5 py-2 text-center font-mono ${
                                  count > 0
                                    ? 'bg-blue-50/60 font-bold text-blue-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {count > 0 ? `${count} câu` : '-'}
                              </td>
                            );
                          })
                        )}
                        <td className="border border-slate-200 px-2 py-2 text-center font-mono font-bold text-slate-900 bg-slate-50">
                          {rm?.totalQuestions || 0}
                        </td>
                        <td className="border border-slate-200 px-2 py-2 text-center font-mono font-bold text-blue-700 bg-slate-50">
                          {(rm?.totalPoints || 0).toFixed(2)}đ
                        </td>
                        <td className="border border-slate-200 p-3 align-top">
                          <textarea
                            rows={2}
                            value={row.note || ''}
                            onChange={(e) =>
                              setSpecRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, note: e.target.value }
                                    : r
                                )
                              )
                            }
                            placeholder="Ghi chú đặc tả..."
                            className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded p-1.5"
                          />
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <React.Fragment key={row.id}>
                      {displayedLessons.map((li, lIdx) => {
                        const isFirstLesson = lIdx === 0;
                        const lm =
                          computedSummary.lessonMetrics[`${row.id}__${li.id}`];
                        const lessonYccdText = cleanLearningOutcomeText(
                          li.learningOutcomeText || row.learningOutcomeText,
                          li.lessonName
                        );
                        const totalOutcomesForThisLesson =
                          li.totalOutcomesInLesson || 1;
                        const outcomeIdxForThisLesson = li.outcomeIndex || 1;

                        return (
                          <tr
                            key={`spec-${row.id}-${li.id}`}
                            className={`hover:bg-slate-50/70 ${
                              !li.selected ? 'bg-slate-50/60 opacity-60' : ''
                            }`}
                          >
                            {isFirstLesson && (
                              <td
                                rowSpan={spanCount}
                                className="border border-slate-200 px-2.5 py-3 text-center font-bold align-top"
                              >
                                {idx + 1}
                              </td>
                            )}
                            {isFirstLesson && (
                              <td
                                rowSpan={spanCount}
                                className="border border-slate-200 p-3 align-top"
                              >
                                <div className="font-bold text-blue-800">
                                  {row.chapterCode}
                                </div>
                                <div className="font-medium text-slate-900 mt-0.5">
                                  {row.topicTitle}
                                </div>
                                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {getPeriodsForSpecRow(row)} tiết
                                  </span>
                                  <span className="text-[10px] font-semibold text-blue-700">
                                    ({selectedLessonCount}/
                                    {resolvedLessonItems.length} dòng YCCĐ)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSetAllRowLessonsSelected(
                                        row.id,
                                        true
                                      )
                                    }
                                    className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                                  >
                                    Chọn tất cả
                                  </button>
                                </div>
                              </td>
                            )}
                            <td className="border border-slate-200 p-2.5 align-top font-medium text-slate-800">
                              <div className="space-y-1">
                                <label className="flex items-start gap-2 cursor-pointer select-none text-xs leading-snug">
                                  <input
                                    type="checkbox"
                                    checked={li.selected}
                                    onChange={() =>
                                      handleToggleRowLessonItem(row.id, li.id)
                                    }
                                    className="mt-0.5 h-3.5 w-3.5 rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <span
                                    className={
                                      li.selected
                                        ? 'font-semibold text-slate-900'
                                        : 'text-slate-400 line-through font-normal'
                                    }
                                  >
                                    {li.lessonName}{' '}
                                    <span className="text-[10px] font-mono text-slate-500">
                                      ({li.periodsCount}t)
                                    </span>
                                  </span>
                                </label>
                                {totalOutcomesForThisLesson > 1 && (
                                  <div className="pl-5">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      YCCĐ {outcomeIdxForThisLesson}/
                                      {totalOutcomesForThisLesson}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="border border-slate-200 p-2.5 align-top space-y-1.5">
                              <textarea
                                rows={2}
                                value={lessonYccdText}
                                disabled={!li.selected}
                                onChange={(e) =>
                                  handleUpdateLessonOutcomeText(
                                    row.id,
                                    li.id,
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-slate-900 leading-relaxed bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded p-1.5 focus:outline-hidden"
                              />
                            </td>
                            {MATRIX_FORMAT_GROUPS.map((fg) =>
                              MATRIX_LEVEL_COLUMNS.map((lc) => {
                                const c =
                                  li.selected &&
                                  activeFormatGroups.includes(fg.code)
                                    ? getLessonItemCell(li, fg.code, lc.code)
                                    : { questionCount: 0, points: 0 };
                                return (
                                  <td
                                    key={`spec-cell-${row.id}-${li.id}-${fg.code}-${lc.code}`}
                                    className={`border border-slate-200 px-1.5 py-2 text-center font-mono ${
                                      c.questionCount > 0
                                        ? 'bg-blue-50/70 font-bold text-blue-800'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {c.questionCount > 0 ? (
                                      <div>
                                        <div>{c.questionCount} câu</div>
                                        <div className="text-[10px] font-normal text-slate-500">
                                          ({c.points.toFixed(2)}đ)
                                        </div>
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                );
                              })
                            )}
                            <td className="border border-slate-200 px-2 py-2 text-center font-mono font-bold text-slate-900 bg-slate-50/70">
                              {li.selected ? lm?.totalQuestions || 0 : 0}
                            </td>
                            <td className="border border-slate-200 px-2 py-2 text-center font-mono font-bold text-blue-700 bg-slate-50/70">
                              {li.selected
                                ? `${(lm?.totalPoints || 0).toFixed(2)}đ`
                                : '0.00đ'}
                            </td>
                            {isFirstLesson && (
                              <td
                                rowSpan={spanCount}
                                className="border border-slate-200 p-2.5 align-top"
                              >
                                <textarea
                                  rows={2}
                                  value={row.note || ''}
                                  onChange={(e) =>
                                    setSpecRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, note: e.target.value }
                                          : r
                                      )
                                    )
                                  }
                                  placeholder="Ghi chú đặc tả..."
                                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded p-1.5"
                                />
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                {/* Dòng tổng cộng cuối Bảng Đặc Tả */}
                <tr className="bg-slate-900 text-white font-bold">
                  <td
                    colSpan={4}
                    className="border border-slate-700 px-3 py-2 text-right uppercase"
                  >
                    Tổng số câu theo từng phần & mức độ
                  </td>
                  {MATRIX_FORMAT_GROUPS.map((fg) =>
                    MATRIX_LEVEL_COLUMNS.map((lc) => {
                      const col =
                        computedSummary.byCellColumn[`${fg.code}__${lc.code}`];
                      const count = activeFormatGroups.includes(fg.code)
                        ? col?.count || 0
                        : 0;
                      return (
                        <td
                          key={`spec-total-${fg.code}-${lc.code}`}
                          className="border border-slate-700 px-1.5 py-2 text-center font-mono text-amber-300"
                        >
                          {count}
                        </td>
                      );
                    })
                  )}
                  <td className="border border-slate-700 px-2 py-2 text-center font-mono text-emerald-300">
                    {computedSummary.totalQuestions}
                  </td>
                  <td className="border border-slate-700 px-2 py-2 text-center font-mono text-amber-300">
                    {computedSummary.totalPoints.toFixed(2)}đ
                  </td>
                  <td className="border border-slate-700 px-2 py-2 text-center text-[11px] text-slate-300">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NỘI DUNG TAB 3: BẢN XEM TRƯỚC KHỔ A4 NGANG (Mục 7) */}
      {activeTab === 'A4_PREVIEW' && (
        <div className="bg-slate-200/70 p-6 rounded-2xl border border-slate-300 overflow-x-auto">
          <div className="bg-white mx-auto shadow-lg border border-slate-300 p-8 min-w-[1040px] max-w-[1160px] text-slate-900 space-y-6">
            {/* Tiêu đề hành chính 2 cột chuẩn (UBND XÃ ĐAN ĐIỀN / TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH) */}
            <div
              className="grid grid-cols-12 gap-4 pb-3"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              <div className="col-span-5 text-center leading-snug">
                <div className="text-[13pt] font-normal uppercase text-slate-950">
                  UBND XÃ ĐAN ĐIỀN
                </div>
                <div className="text-[13pt] font-bold uppercase text-slate-950">
                  {(schoolName &&
                  !schoolName.toLowerCase().includes('chuẩn quốc gia') &&
                  !schoolName.toLowerCase().includes('edutest')
                    ? schoolName
                    : 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH'
                  ).toUpperCase()}
                </div>
                <div className="w-36 mx-auto border-b border-slate-950 mt-0.5" />
              </div>
              <div className="col-span-7 text-center leading-snug">
                <div className="text-[13pt] font-bold uppercase text-slate-950">
                  ĐỀ KIỂM TRA{' '}
                  {examPeriod === 'GIUA_KY_1'
                    ? 'GIỮA KÌ I'
                    : examPeriod === 'CUOI_KY_1'
                    ? 'CUỐI KÌ I'
                    : examPeriod === 'GIUA_KY_2'
                    ? 'GIỮA KÌ II'
                    : examPeriod === 'CUOI_KY_2'
                    ? 'CUỐI KÌ II'
                    : 'ĐỊNH KÌ'}{' '}
                  NĂM HỌC{' '}
                  {(academicYear || '2026-2027').replace(/\s*[–—-]\s*/g, '-')}
                </div>
                <div className="text-[13pt] font-normal text-slate-950">
                  MÔN: {subject.toUpperCase()} - Lớp {grade}
                </div>
                <div className="text-[13pt] font-normal text-slate-950">
                  Thời gian: {durationMinutes} phút
                </div>
                <div className="text-[12.5pt] italic font-normal text-slate-950">
                  (không kể thời gian giao đề)
                </div>
              </div>
            </div>

            {/* Phần I: Khung Ma trận trên trang A4 ngang */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase">
                I. KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ
              </h4>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th rowSpan={2} className="border border-slate-800 px-2 py-1.5">
                      TT
                    </th>
                    <th rowSpan={2} className="border border-slate-800 px-2 py-1.5 text-left">
                      Chủ đề / Chương
                    </th>
                    <th rowSpan={2} className="border border-slate-800 px-2 py-1.5 text-left">
                      Nội dung / Đơn vị kiến thức
                    </th>
                    {activeFormatGroups.map((fgCode) => {
                      const fg = MATRIX_FORMAT_GROUPS.find(
                        (f) => f.code === fgCode
                      );
                      return (
                        <th
                          key={fgCode}
                          colSpan={3}
                          className="border border-slate-800 px-2 py-1 text-center"
                        >
                          {fg?.label}
                        </th>
                      );
                    })}
                    <th rowSpan={2} className="border border-slate-800 px-2 py-1.5">
                      Tổng câu
                    </th>
                    <th rowSpan={2} className="border border-slate-800 px-2 py-1.5">
                      Tổng điểm
                    </th>
                    <th rowSpan={2} className="border border-slate-800 px-2 py-1.5">
                      Tỷ lệ %
                    </th>
                  </tr>
                  <tr className="bg-slate-50">
                    {activeFormatGroups.map((fgCode) =>
                      MATRIX_LEVEL_COLUMNS.map((lc) => (
                        <th
                          key={`a4-${fgCode}-${lc.code}`}
                          className="border border-slate-800 px-1.5 py-1 text-center"
                        >
                          {lc.label}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {specRows.map((r, i) => {
                    const rm = computedSummary.rowMetrics[r.id];
                    const selectedLessons = getResolvedLessonItemsForRow(
                      r
                    ).filter((li) => li.selected);

                    if (selectedLessons.length === 0) {
                      return (
                        <tr key={r.id}>
                          <td className="border border-slate-800 px-2 py-1.5 text-center">
                            {i + 1}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5 font-semibold">
                            {r.chapterCode}: {r.topicTitle}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5">
                            {r.knowledgeUnit}
                          </td>
                          {activeFormatGroups.map((fgCode) =>
                            MATRIX_LEVEL_COLUMNS.map((lc) => {
                              const c = r.cells.find(
                                (x) =>
                                  x.formatGroup === fgCode &&
                                  x.levelColumn === lc.code
                              );
                              return (
                                <td
                                  key={`a4-cell-${r.id}-${fgCode}-${lc.code}`}
                                  className="border border-slate-800 px-1.5 py-1.5 text-center font-mono"
                                >
                                  {c && c.questionCount > 0
                                    ? `${c.questionCount} (${c.points.toFixed(2)}đ)`
                                    : '-'}
                                </td>
                              );
                            })
                          )}
                          <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                            {rm?.totalQuestions || 0}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                            {(rm?.totalPoints || 0).toFixed(2)}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                            {(rm?.percentageOfExam || 0).toFixed(1)}%
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <React.Fragment key={r.id}>
                        {selectedLessons.map((li, lIdx) => {
                          const isFirst = lIdx === 0;
                          const lm =
                            computedSummary.lessonMetrics[`${r.id}__${li.id}`];
                          return (
                            <tr key={`a4-${r.id}-${li.id}`}>
                              {isFirst && (
                                <td
                                  rowSpan={selectedLessons.length}
                                  className="border border-slate-800 px-2 py-1.5 text-center align-top"
                                >
                                  {i + 1}
                                </td>
                              )}
                              {isFirst && (
                                <td
                                  rowSpan={selectedLessons.length}
                                  className="border border-slate-800 px-2 py-1.5 font-semibold align-top"
                                >
                                  {r.chapterCode}: {r.topicTitle}
                                </td>
                              )}
                              <td className="border border-slate-800 px-2 py-1.5">
                                <div className="font-semibold">
                                  {li.lessonName} ({li.periodsCount} tiết)
                                  {(li.totalOutcomesInLesson || 1) > 1
                                    ? ` — YCCĐ ${li.outcomeIndex || 1}/${li.totalOutcomesInLesson}`
                                    : ''}
                                </div>
                                <div className="text-slate-700 mt-0.5">
                                  • YCCĐ:{' '}
                                  {cleanLearningOutcomeText(
                                    li.learningOutcomeText ||
                                      r.learningOutcomeText,
                                    li.lessonName
                                  )}
                                </div>
                              </td>
                              {activeFormatGroups.map((fgCode) =>
                                MATRIX_LEVEL_COLUMNS.map((lc) => {
                                  const c = getLessonItemCell(
                                    li,
                                    fgCode,
                                    lc.code
                                  );
                                  return (
                                    <td
                                      key={`a4-cell-${r.id}-${li.id}-${fgCode}-${lc.code}`}
                                      className="border border-slate-800 px-1.5 py-1.5 text-center font-mono"
                                    >
                                      {c.questionCount > 0
                                        ? `${c.questionCount} (${c.points.toFixed(2)}đ)`
                                        : '-'}
                                    </td>
                                  );
                                })
                              )}
                              <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                                {lm?.totalQuestions || 0}
                              </td>
                              <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                                {(lm?.totalPoints || 0).toFixed(2)}
                              </td>
                              <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                                {(lm?.percentageOfExam || 0).toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  <tr className="bg-slate-100 font-bold">
                    <td
                      colSpan={3}
                      className="border border-slate-800 px-2 py-1.5 text-right uppercase"
                    >
                      Tổng cộng toàn đề
                    </td>
                    {activeFormatGroups.map((fgCode) =>
                      MATRIX_LEVEL_COLUMNS.map((lc) => {
                        const col =
                          computedSummary.byCellColumn[`${fgCode}__${lc.code}`];
                        return (
                          <td
                            key={`a4-sum-${fgCode}-${lc.code}`}
                            className="border border-slate-800 px-1.5 py-1.5 text-center font-mono"
                          >
                            {col.count} ({col.points.toFixed(2)}đ)
                          </td>
                        );
                      })
                    )}
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      {computedSummary.totalQuestions}
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      {computedSummary.totalPoints.toFixed(2)}
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Phần II: Bản đặc tả trên trang A4 ngang */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase">
                II. BẢN ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA
              </h4>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th
                      rowSpan={3}
                      className="border border-slate-800 px-2 py-1.5 w-8 text-center"
                    >
                      TT
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-800 px-2 py-1.5 text-left w-40"
                    >
                      Chủ đề / Chương
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-800 px-2 py-1.5 text-left w-44"
                    >
                      Nội dung / Đơn vị kiến thức (Từng bài)
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-800 px-2 py-1.5 text-left"
                    >
                      Mức độ & Yêu cầu cần đạt
                    </th>
                    <th
                      colSpan={MATRIX_FORMAT_GROUPS.length * 3}
                      className="border border-slate-800 px-2 py-1 text-center"
                    >
                      Số câu hỏi theo mức độ nhận thức ở từng phần
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-800 px-2 py-1.5 text-center w-14"
                    >
                      Tổng câu
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-800 px-2 py-1.5 text-center w-16"
                    >
                      Điểm số
                    </th>
                  </tr>
                  <tr className="bg-slate-100">
                    {MATRIX_FORMAT_GROUPS.map((fg) => (
                      <th
                        key={`a4-spec-fg-${fg.code}`}
                        colSpan={3}
                        className="border border-slate-800 px-1.5 py-1 text-center"
                      >
                        {fg.label}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-slate-50">
                    {MATRIX_FORMAT_GROUPS.map((fg) =>
                      MATRIX_LEVEL_COLUMNS.map((lc) => (
                        <th
                          key={`a4-spec-col-${fg.code}-${lc.code}`}
                          className="border border-slate-800 px-1 py-1 text-center"
                        >
                          {lc.label}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {specRows.map((r, i) => {
                    const rm = computedSummary.rowMetrics[r.id];
                    const selectedLessons = getResolvedLessonItemsForRow(
                      r
                    ).filter((li) => li.selected);

                    if (selectedLessons.length === 0) {
                      return (
                        <tr key={r.id}>
                          <td className="border border-slate-800 px-2 py-1.5 text-center">
                            {i + 1}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5 font-semibold">
                            {r.chapterCode}: {r.topicTitle}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5">
                            {r.knowledgeUnit}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5">
                            <strong>[{r.learningOutcomeCode}]</strong>{' '}
                            {r.learningOutcomeText}
                          </td>
                          {MATRIX_FORMAT_GROUPS.map((fg) =>
                            MATRIX_LEVEL_COLUMNS.map((lc) => {
                              const c = activeFormatGroups.includes(fg.code)
                                ? r.cells.find(
                                    (x) =>
                                      x.formatGroup === fg.code &&
                                      x.levelColumn === lc.code
                                  )
                                : undefined;
                              return (
                                <td
                                  key={`a4-spec-empty-${r.id}-${fg.code}-${lc.code}`}
                                  className="border border-slate-800 px-1 py-1.5 text-center font-mono"
                                >
                                  {c && c.questionCount > 0
                                    ? c.questionCount
                                    : '-'}
                                </td>
                              );
                            })
                          )}
                          <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                            {rm?.totalQuestions || 0}
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                            {(rm?.totalPoints || 0).toFixed(2)}đ
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <React.Fragment key={r.id}>
                        {selectedLessons.map((li, lIdx) => {
                          const isFirst = lIdx === 0;
                          const lm =
                            computedSummary.lessonMetrics[`${r.id}__${li.id}`];
                          const yccdCode =
                            li.learningOutcomeCode || r.learningOutcomeCode;
                          const yccdText =
                            li.learningOutcomeText || r.learningOutcomeText;
                          return (
                            <tr key={`a4-spec-${r.id}-${li.id}`}>
                              {isFirst && (
                                <td
                                  rowSpan={selectedLessons.length}
                                  className="border border-slate-800 px-2 py-1.5 text-center align-top"
                                >
                                  {i + 1}
                                </td>
                              )}
                              {isFirst && (
                                <td
                                  rowSpan={selectedLessons.length}
                                  className="border border-slate-800 px-2 py-1.5 font-semibold align-top"
                                >
                                  {r.chapterCode}: {r.topicTitle}
                                </td>
                              )}
                              <td className="border border-slate-800 px-2 py-1.5">
                                <span className="font-semibold">
                                  {li.lessonName}
                                </span>{' '}
                                ({li.periodsCount} tiết)
                                {(li.totalOutcomesInLesson || 1) > 1
                                  ? ` — YCCĐ ${li.outcomeIndex || 1}/${li.totalOutcomesInLesson}`
                                  : ''}
                              </td>
                              <td className="border border-slate-800 px-2 py-1.5">
                                {cleanLearningOutcomeText(
                                  li.learningOutcomeText ||
                                    r.learningOutcomeText,
                                  li.lessonName
                                )}
                              </td>
                              {MATRIX_FORMAT_GROUPS.map((fg) =>
                                MATRIX_LEVEL_COLUMNS.map((lc) => {
                                  const c = activeFormatGroups.includes(fg.code)
                                    ? getLessonItemCell(li, fg.code, lc.code)
                                    : { questionCount: 0, points: 0 };
                                  return (
                                    <td
                                      key={`a4-spec-cell-${r.id}-${li.id}-${fg.code}-${lc.code}`}
                                      className="border border-slate-800 px-1 py-1.5 text-center font-mono font-semibold"
                                    >
                                      {c.questionCount > 0
                                        ? c.questionCount
                                        : '-'}
                                    </td>
                                  );
                                })
                              )}
                              <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                                {lm?.totalQuestions || 0}
                              </td>
                              <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                                {(lm?.totalPoints || 0).toFixed(2)}đ
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  <tr className="bg-slate-100 font-bold">
                    <td
                      colSpan={4}
                      className="border border-slate-800 px-2 py-1.5 text-right uppercase"
                    >
                      Tổng số câu theo phần & mức độ
                    </td>
                    {MATRIX_FORMAT_GROUPS.map((fg) =>
                      MATRIX_LEVEL_COLUMNS.map((lc) => {
                        const col =
                          computedSummary.byCellColumn[`${fg.code}__${lc.code}`];
                        const count = activeFormatGroups.includes(fg.code)
                          ? col?.count || 0
                          : 0;
                        return (
                          <td
                            key={`a4-spec-sum-${fg.code}-${lc.code}`}
                            className="border border-slate-800 px-1 py-1.5 text-center font-mono"
                          >
                            {count}
                          </td>
                        );
                      })
                    )}
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      {computedSummary.totalQuestions}
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      {computedSummary.totalPoints.toFixed(2)}đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chữ ký xác nhận */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center text-xs">
              <div>
                <div className="font-bold uppercase">NGƯỜI LẬP MA TRẬN</div>
                <div className="text-[11px] text-slate-500 mt-10">
                  {authorName}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase">TỔ TRƯỞNG CHUYÊN MÔN</div>
                <div className="text-[11px] text-slate-500 mt-10">
                  (Ký và ghi rõ họ tên)
                </div>
              </div>
              <div>
                <div className="font-bold uppercase">BAN GIÁM HIỆU PHÊ DUYỆT</div>
                <div className="text-[11px] text-slate-500 mt-10">
                  (Ký tên, đóng dấu)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Yêu cầu cần đạt trên Bản đặc tả (Lưu nguồn gốc & lịch sử) */}
      {editingOutcomeRowId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Hiệu chỉnh Yêu cầu cần đạt (Có lưu nguồn & lịch sử chỉnh sửa)
              </h3>
              <button
                type="button"
                onClick={() => setEditingOutcomeRowId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung Yêu cầu cần đạt
              </label>
              <textarea
                rows={3}
                value={editingOutcomeText}
                onChange={(e) => setEditingOutcomeText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do chỉnh sửa / Căn cứ điều chỉnh
              </label>
              <input
                type="text"
                value={editingOutcomeReason}
                onChange={(e) => setEditingOutcomeReason(e.target.value)}
                placeholder="VD: Cụ thể hóa biểu hiện năng lực theo kế hoạch dạy học của Tổ..."
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingOutcomeRowId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveOutcomeEdit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
              >
                Lưu & Ghi nhận lịch sử
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lưu & Nạp cấu trúc dùng chung cho Tổ chuyên môn */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Cấu trúc Cơ cấu đề dùng chung của Tổ chuyên môn
              </h3>
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                placeholder="Nhập tên cấu trúc để lưu dùng chung (VD: Khung đề Toán THCS 90 phút)..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleSaveDepartmentPreset}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shrink-0"
              >
                Lưu cấu trúc hiện tại
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {departmentPresets.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Chưa có cấu trúc dùng chung nào được lưu.
                </div>
              ) : (
                departmentPresets.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.subject} Lớp {p.grade} · Mẫu: {p.templateCode} · Tỷ lệ:{' '}
                        {p.targetLevelPercentages.BIET}/
                        {p.targetLevelPercentages.HIEU}/
                        {p.targetLevelPercentages.VAN_DUNG}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleConfirmApplyTemplate(p.templateCode);
                          setActiveFormatGroups(p.activeFormatGroups);
                          setTargetLevelPercentages(p.targetLevelPercentages);
                          setScoringRules(p.scoringRules);
                          setShowPresetModal(false);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-semibold"
                      >
                        Nạp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dataRepository.deleteDepartmentMatrixPreset(p.id);
                          setDepartmentPresets(
                            dataRepository.getDepartmentMatrixPresets()
                          );
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
