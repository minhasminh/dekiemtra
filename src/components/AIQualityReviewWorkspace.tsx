import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  History,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ApprovalStatus,
  AuthenticatedUserSession,
  CognitiveLevelCode,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamVariantPaper,
  ExamWorkflow,
  GradeNumber,
  MatrixFormatGroupCode,
  MatrixLevelColumnCode,
  MenuSectionId,
  QualityDashboardIssueActionMeta,
  QualityDetectionSourceLayer,
  QualityIssueSeverityLevel,
  QualityIssueStatus,
  QualityReviewDetectedIssue,
  QualityReviewDossierPackage,
  QualityReviewGroupId,
  QualityReviewMatrixSlot,
  QualityReviewQuestionNode,
  QualityReviewSpecificationSlot,
  QualityReviewVersionHistoryEntry,
  QuestionFormatCode,
  QuestionItem,
  SchoolBrandingConfig,
  StorageConfig,
  TeacherPermissionProfileSummary,
  ToastNotification,
} from '../types/domain';
import { getRuleSetForLevel } from '../services/business/assessmentRules';
import {
  isSampleOrDemoExam,
  isSampleOrDemoMatrix,
  isSampleOrDemoQuestion,
} from '../services/storage/repository';
import {
  isSampleOrTestWorkflowDossier,
  loadSavedWorkflows,
  purgeAllSampleWorkflowsFromLocal,
  WORKFLOW_STATE_LABELS,
} from '../services/workflow/endToEndExamWorkflowService';
import { purgeSampleNotificationsAndTasksFromLocal } from '../services/workflow/workflowNotificationCenterService';
import {
  analyzePrimaryMathDossierDetails,
  analyzePrimaryVietnameseDossierDetails,
  buildQualityReviewReport,
  computeQualityDashboardState,
  exportInternalReviewMinutesToWord,
  exportQualityDashboardPdfReport,
  exportQualityIssueListToExcel,
  exportQualityReviewReportToWord,
  QUALITY_INSPECTION_GROUPS,
  runDossierCrossCheckAnalysis,
  runTwoLayerQualityReview,
} from '../services/quality/aiQualityReviewService';

export interface AIQualityReviewWorkspaceProps {
  questions?: QuestionItem[];
  savedExams?: ExamPaper[];
  savedMatrices?: ExamMatrix[];
  config?: StorageConfig;
  authSession?: AuthenticatedUserSession | null;
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  schoolBranding?: SchoolBrandingConfig;
  schoolAllowedGrades?: number[];
  onCleanSampleData?: () => {
    removedTopics: number;
    removedQuestions: number;
    removedMatrices: number;
    removedExams: number;
  };
  onNavigate?: (menuId: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

type QualityReviewTabId =
  | 'tab0-quality-dashboard'
  | 'tab6-cross-check'
  | 'tab1-select-dossier'
  | 'tab4-fix-proposals'
  | 'tab2-criteria-setup';

interface OfficialDossierSourceOption {
  sourceKey: string;
  sourceType: 'EXAM_PAPER' | 'WORKFLOW_DOSSIER';
  code: string;
  title: string;
  subject: string;
  grade: number;
  examPeriodLabel: string;
  questionCount: number;
  totalPoints: number;
  hasLinkedMatrix: boolean;
  statusLabel: string;
  updatedAt: string;
  examPaper?: ExamPaper;
  linkedMatrix?: ExamMatrix;
  workflow?: ExamWorkflow;
}

interface ManualQuestionDraft {
  stem: string;
  format: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY';
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  declaredCorrectAnswer: string;
  points: string;
  declaredCognitiveLevel: 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng';
  topicTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  gradingGuide: string;
}

interface GeminiFindingPayload {
  questionNumber?: number;
  severity?: string;
  issueCategoryLabel?: string;
  problemDescription?: string;
  correctResultOrHandling?: string;
  verificationSolutionProof?: string;
  evidenceAndBasis?: string;
  proposedFix?: string;
  confidenceScorePercent?: number;
}

const EXAM_PERIOD_LABELS: Record<string, string> = {
  GIUA_KY_1: 'Giữa học kỳ I',
  CUOI_KY_1: 'Cuối học kỳ I',
  GIUA_KY_2: 'Giữa học kỳ II',
  CUOI_KY_2: 'Cuối năm học',
  MID_SEM_1: 'Giữa học kỳ I',
  END_SEM_1: 'Cuối học kỳ I',
  MID_SEM_2: 'Giữa học kỳ II',
  END_YEAR: 'Cuối năm học',
  REGULAR: 'Kiểm tra thường xuyên',
};

function normalizeText(value?: string | null): string {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function areSubjectsEquivalent(a?: string | null, b?: string | null): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const aliasGroups: string[][] = [
    ['lịch sử và địa lí', 'lịch sử & địa lí', 'lịch sử - địa lí', 'ls&đl'],
    ['giáo dục công dân', 'gdcd'],
    ['khoa học tự nhiên', 'khtn'],
    ['hoạt động trải nghiệm, hướng nghiệp', 'hoạt động trải nghiệm', 'hđtn'],
    ['tin học và công nghệ', 'tin học', 'công nghệ'],
    ['tiếng anh', 'ngoại ngữ 1', 'anh văn'],
    ['ngữ văn', 'tiếng việt'],
  ];
  return aliasGroups.some((grp) => grp.includes(na) && grp.includes(nb));
}

function mapCognitiveCodeToQualityLevel(
  code?: CognitiveLevelCode | MatrixLevelColumnCode | string
): 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng' {
  const raw = String(code || '').toUpperCase();
  if (raw.includes('MUC_1') || raw.includes('NHAN_BIET') || raw === 'BIET' || raw.includes('MỨC 1')) {
    return 'Mức 1 – Nhận biết';
  }
  if (raw.includes('MUC_2') || raw.includes('THONG_HIEU') || raw === 'HIEU' || raw.includes('MỨC 2')) {
    return 'Mức 2 – Thông hiểu';
  }
  return 'Mức 3 – Vận dụng';
}

function mapFormatToQualityFormat(
  fmt?: QuestionFormatCode | MatrixFormatGroupCode | string
): 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER' {
  const raw = String(fmt || '').toUpperCase();
  if (raw === 'ESSAY' || raw.includes('TU_LUAN')) {
    return 'ESSAY';
  }
  if (raw === 'SHORT_ANSWER' || raw === 'FILL_IN_BLANK') {
    return 'SHORT_ANSWER';
  }
  return 'MULTIPLE_CHOICE';
}

function parseMcqOptions(
  rawOptions?: string[]
): { key: 'A' | 'B' | 'C' | 'D'; text: string }[] | undefined {
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) return undefined;
  const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  return rawOptions.slice(0, 4).map((opt, idx) => {
    const cleaned = String(opt || '')
      .replace(/^[A-D][\.\)\:\-]\s*/i, '')
      .trim();
    return {
      key: keys[idx] || 'A',
      text: cleaned || String(opt || '').trim(),
    };
  });
}

function getRuleBasisForGrade(grade: number): string {
  if (grade >= 1 && grade <= 5) {
    return 'Thông tư 27/2020/TT-BGDĐT (Đánh giá học sinh Tiểu học – GDPT 2018)';
  }
  return 'Thông tư 22/2021/TT-BGDĐT & Công văn 7991/BGDĐT-GDTrH (THCS – GDPT 2018)';
}

function getProgressWidthClass(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  if (clamped === 0) return 'w-0';
  if (clamped <= 8) return 'w-1/12';
  if (clamped <= 17) return 'w-2/12';
  if (clamped <= 25) return 'w-3/12';
  if (clamped <= 33) return 'w-4/12';
  if (clamped <= 42) return 'w-5/12';
  if (clamped <= 50) return 'w-6/12';
  if (clamped <= 58) return 'w-7/12';
  if (clamped <= 67) return 'w-8/12';
  if (clamped <= 75) return 'w-9/12';
  if (clamped <= 83) return 'w-10/12';
  if (clamped <= 92) return 'w-11/12';
  return 'w-full';
}

function buildOfficialDossierFromExamPaper(
  exam: ExamPaper,
  linkedMatrix: ExamMatrix | undefined,
  questionBank: QuestionItem[],
  selectedVariantCode?: string
): QualityReviewDossierPackage {
  const questionById = new Map<string, QuestionItem>();
  questionBank.forEach((q) => questionById.set(q.id, q));

  const chosenVariant: ExamVariantPaper | undefined =
    Array.isArray(exam.variants) && exam.variants.length > 0
      ? exam.variants.find((v) => v.variantCode === selectedVariantCode) || exam.variants[0]
      : undefined;

  const variantCode = chosenVariant?.variantCode || '101';
  const targetTotalPoints = Number(
    linkedMatrix?.targetTotalPoints || linkedMatrix?.totalPoints || exam.totalPoints || 10
  );

  const specRowById = new Map(
    (linkedMatrix?.specRows || []).map((row) => [row.id, row] as const)
  );
  const matrixRowById = new Map(
    (linkedMatrix?.rows || []).map((row) => [row.id, row] as const)
  );

  const questions: QualityReviewQuestionNode[] = [];
  const matrixSlots: QualityReviewMatrixSlot[] = [];
  const specificationSlots: QualityReviewSpecificationSlot[] = [];

  if (chosenVariant && Array.isArray(chosenVariant.items) && chosenVariant.items.length > 0) {
    const quickKeyMap = new Map<number, string>();
    (chosenVariant.mcqQuickAnswerTable || []).forEach((item) => {
      quickKeyMap.set(item.questionNumber, item.answer);
    });

    chosenVariant.items.forEach((vItem, idx) => {
      const qNum = vItem.displayNumber || idx + 1;
      const bankQ = questionById.get(vItem.questionId);
      const specRow = specRowById.get(vItem.rowId);
      const matRow = matrixRowById.get(vItem.rowId);

      const qFormat = mapFormatToQualityFormat(vItem.formatGroup || bankQ?.format);
      const declaredLevel = mapCognitiveCodeToQualityLevel(
        bankQ?.cognitiveLevel || vItem.levelColumn
      );
      const matrixExpectedLevel = mapCognitiveCodeToQualityLevel(
        vItem.levelColumn || bankQ?.cognitiveLevel
      );
      const topicTitle =
        bankQ?.topicTitle || specRow?.topicTitle || matRow?.topicTitle || 'Chủ đề trong chương trình';
      const outcomeCode =
        vItem.learningOutcomeCode ||
        bankQ?.learningOutcomeCode ||
        specRow?.learningOutcomeCode ||
        `YCCD-K${exam.grade}-${qNum}`;
      const outcomeText =
        bankQ?.learningOutcomeText ||
        specRow?.learningOutcomeText ||
        matRow?.learningOutcomeSummary ||
        topicTitle;
      const declaredAns = String(vItem.shuffledCorrectAnswer || bankQ?.correctAnswer || '').trim();
      const gradingGuideText = String(vItem.gradingGuide || bankQ?.gradingGuide || '').trim();
      const acceptedAlt =
        Array.isArray(vItem.acceptedVariations) && vItem.acceptedVariations.length > 0
          ? vItem.acceptedVariations.join('; ')
          : Array.isArray(bankQ?.acceptedVariations) && bankQ.acceptedVariations.length > 0
          ? bankQ.acceptedVariations.join('; ')
          : undefined;

      questions.push({
        questionNumber: qNum,
        questionCode: vItem.originalCode || bankQ?.code || `CH-${qNum}`,
        format: qFormat,
        stem: vItem.stem || bankQ?.stem || '',
        options:
          qFormat === 'MULTIPLE_CHOICE'
            ? parseMcqOptions(vItem.shuffledOptions || bankQ?.options)
            : undefined,
        declaredCorrectAnswer: declaredAns,
        points: Number(vItem.points || bankQ?.points || 0),
        declaredCognitiveLevel: declaredLevel,
        topicTitle,
        learningOutcomeCode: outcomeCode,
        learningOutcomeText: outcomeText,
        gradingGuide: gradingGuideText || (declaredAns ? `Đáp án đúng: ${declaredAns}` : ''),
        acceptedAlternativeSolutions: acceptedAlt,
        positionInExamLabel: `Mã đề ${variantCode} · Câu ${qNum}`,
        aiAssessedCognitiveLevel: declaredLevel,
        answerKeySheetValue: quickKeyMap.get(qNum) || declaredAns,
        answerKeySheetQuestionNumber: qNum,
        answerKeySheetVariantCode: variantCode,
        gradingGuidePoints: Number(vItem.points || bankQ?.points || 0),
        isWithinDeclaredCurriculumScope: true,
      });

      if (linkedMatrix) {
        const expectedPts = Number(vItem.points || bankQ?.points || 0);
        matrixSlots.push({
          questionNumber: qNum,
          expectedTopicTitle: specRow?.topicTitle || matRow?.topicTitle || topicTitle,
          expectedKnowledgeUnit: specRow?.knowledgeUnit || bankQ?.knowledgeUnit || topicTitle,
          expectedLearningOutcomeCode: specRow?.learningOutcomeCode || outcomeCode,
          expectedCognitiveLevel: matrixExpectedLevel,
          expectedFormat: mapFormatToQualityFormat(vItem.formatGroup),
          expectedPoints: expectedPts,
          expectedPointPercentage:
            targetTotalPoints > 0
              ? Number(((expectedPts / targetTotalPoints) * 100).toFixed(2))
              : 0,
        });

        if (!linkedMatrix.specRows || linkedMatrix.specRows.length > 0) {
          specificationSlots.push({
            questionNumber: qNum,
            topicTitle: specRow?.topicTitle || topicTitle,
            knowledgeUnit: specRow?.knowledgeUnit || bankQ?.knowledgeUnit || topicTitle,
            learningOutcomeCode: specRow?.learningOutcomeCode || outcomeCode,
            learningOutcomeDescription: specRow?.learningOutcomeText || outcomeText,
            competencyAssessed:
              specRow?.competencyAssessed || `Năng lực môn ${exam.subject}`,
            cognitiveLevel: matrixExpectedLevel,
            format: mapFormatToQualityFormat(vItem.formatGroup),
            expectedPoints: expectedPts,
          });
        }
      }
    });
  } else {
    exam.questionIds.forEach((qid, idx) => {
      const qNum = idx + 1;
      const bankQ = questionById.get(qid);
      if (!bankQ) return;

      const qFormat = mapFormatToQualityFormat(bankQ.format);
      const declaredLevel = mapCognitiveCodeToQualityLevel(bankQ.cognitiveLevel);
      const declaredAns = String(bankQ.correctAnswer || '').trim();
      const gradingGuideText = String(bankQ.gradingGuide || '').trim();

      questions.push({
        questionNumber: qNum,
        questionCode: bankQ.code || `CH-${qNum}`,
        format: qFormat,
        stem: bankQ.stem || '',
        options: qFormat === 'MULTIPLE_CHOICE' ? parseMcqOptions(bankQ.options) : undefined,
        declaredCorrectAnswer: declaredAns,
        points: Number(bankQ.points || 0),
        declaredCognitiveLevel: declaredLevel,
        topicTitle: bankQ.topicTitle || 'Chủ đề trong chương trình',
        learningOutcomeCode: bankQ.learningOutcomeCode || `YCCD-K${exam.grade}-${qNum}`,
        learningOutcomeText: bankQ.learningOutcomeText || bankQ.topicTitle || '',
        gradingGuide: gradingGuideText || (declaredAns ? `Đáp án đúng: ${declaredAns}` : ''),
        acceptedAlternativeSolutions:
          Array.isArray(bankQ.acceptedVariations) && bankQ.acceptedVariations.length > 0
            ? bankQ.acceptedVariations.join('; ')
            : undefined,
        positionInExamLabel: `Câu ${qNum}`,
        aiAssessedCognitiveLevel: declaredLevel,
        answerKeySheetValue: declaredAns,
        answerKeySheetQuestionNumber: qNum,
        answerKeySheetVariantCode: variantCode,
        gradingGuidePoints: Number(bankQ.points || 0),
        isWithinDeclaredCurriculumScope: true,
      });
    });

    if (linkedMatrix) {
      if (Array.isArray(linkedMatrix.specRows) && linkedMatrix.specRows.length > 0) {
        let slotOrder = 1;
        linkedMatrix.specRows.forEach((sRow) => {
          (sRow.cells || []).forEach((cell) => {
            if (cell.questionCount > 0) {
              const ptsPerQ = Number((cell.points / cell.questionCount).toFixed(2));
              for (let k = 0; k < cell.questionCount; k += 1) {
                const mappedLevel = mapCognitiveCodeToQualityLevel(cell.levelColumn);
                const mappedFmt = mapFormatToQualityFormat(cell.formatGroup);
                matrixSlots.push({
                  questionNumber: slotOrder,
                  expectedTopicTitle: sRow.topicTitle,
                  expectedKnowledgeUnit: sRow.knowledgeUnit,
                  expectedLearningOutcomeCode: sRow.learningOutcomeCode,
                  expectedCognitiveLevel: mappedLevel,
                  expectedFormat: mappedFmt,
                  expectedPoints: ptsPerQ,
                  expectedPointPercentage:
                    targetTotalPoints > 0
                      ? Number(((ptsPerQ / targetTotalPoints) * 100).toFixed(2))
                      : 0,
                });
                specificationSlots.push({
                  questionNumber: slotOrder,
                  topicTitle: sRow.topicTitle,
                  knowledgeUnit: sRow.knowledgeUnit,
                  learningOutcomeCode: sRow.learningOutcomeCode,
                  learningOutcomeDescription: sRow.learningOutcomeText,
                  competencyAssessed: sRow.competencyAssessed || `Năng lực môn ${exam.subject}`,
                  cognitiveLevel: mappedLevel,
                  format: mappedFmt,
                  expectedPoints: ptsPerQ,
                });
                slotOrder += 1;
              }
            }
          });
        });
      } else {
        questions.forEach((qNode) => {
          matrixSlots.push({
            questionNumber: qNode.questionNumber,
            expectedTopicTitle: qNode.topicTitle,
            expectedKnowledgeUnit: qNode.topicTitle,
            expectedLearningOutcomeCode: qNode.learningOutcomeCode,
            expectedCognitiveLevel: qNode.declaredCognitiveLevel,
            expectedFormat: qNode.format,
            expectedPoints: qNode.points,
            expectedPointPercentage:
              targetTotalPoints > 0
                ? Number(((qNode.points / targetTotalPoints) * 100).toFixed(2))
                : 0,
          });
        });
      }
    }
  }

  const allowedTopics = Array.from(
    new Set([
      ...questions.map((q) => q.topicTitle).filter(Boolean),
      ...(linkedMatrix?.rows || []).map((r) => r.topicTitle).filter(Boolean),
      ...(linkedMatrix?.specRows || []).map((r) => r.topicTitle).filter(Boolean),
    ])
  );

  const hasAnswerKey = questions.length > 0 && questions.every((q) => Boolean(q.declaredCorrectAnswer));
  const hasGradingGuide = questions.length > 0 && questions.every((q) => Boolean(q.gradingGuide));

  return {
    dossierId: exam.id,
    dossierCode: exam.code || `DE-K${exam.grade}`,
    title: exam.title,
    subject: exam.subject,
    grade: exam.grade,
    examPeriod: EXAM_PERIOD_LABELS[exam.examPeriod] || exam.examPeriod,
    examVariantCode: variantCode,
    curriculumStandard: `Chương trình GDPT 2018 – Môn ${exam.subject} Lớp ${exam.grade}`,
    assessmentRuleSet: linkedMatrix?.appliedRuleBasis || getRuleBasisForGrade(exam.grade),
    durationMinutes: exam.durationMinutes || linkedMatrix?.durationMinutes || 45,
    targetTotalPoints,
    versionLabel: `v${exam.version || 1}.0`,
    approvalStatus: exam.status || ApprovalStatus.DRAFT,
    isConfidentialExam: false,
    hasSecurityPermissionForAi: true,
    hasMatrixDocument: Boolean(linkedMatrix),
    hasSpecificationDocument: Boolean(
      linkedMatrix && ((linkedMatrix.specRows && linkedMatrix.specRows.length > 0) || specificationSlots.length > 0)
    ),
    hasExamPaperDocument: questions.length > 0,
    hasAnswerKeyDocument: hasAnswerKey,
    hasGradingGuideDocument: hasGradingGuide,
    declaredCurriculumScopeSummary:
      linkedMatrix?.knowledgeScope ||
      (allowedTopics.length > 0 ? allowedTopics.join('; ') : undefined),
    allowedCurriculumTopicTitles: allowedTopics.length > 0 ? allowedTopics : undefined,
    answerKeyHeaderVariantCode: variantCode,
    questions,
    matrixSlots,
    specificationSlots,
  };
}

function buildOfficialDossierFromWorkflow(
  wf: ExamWorkflow,
  savedExams: ExamPaper[],
  savedMatrices: ExamMatrix[],
  questionBank: QuestionItem[]
): QualityReviewDossierPackage {
  const matchedExam = savedExams.find((e) => e.id === wf.examId);
  const matchedMatrix = savedMatrices.find(
    (m) => m.id === wf.matrixId || (matchedExam && m.id === matchedExam.matrixId)
  );
  if (matchedExam) {
    const built = buildOfficialDossierFromExamPaper(matchedExam, matchedMatrix, questionBank);
    return {
      ...built,
      dossierId: wf.workflowId,
      dossierCode: wf.workflowId,
      title: wf.title || built.title,
      isConfidentialExam: Boolean(wf.isConfidentialExam),
      hasMatrixDocument: Boolean(wf.hasMatrixDocument ?? built.hasMatrixDocument),
      hasSpecificationDocument: Boolean(wf.hasSpecificationDocument ?? built.hasSpecificationDocument),
    };
  }

  const questionById = new Map(questionBank.map((q) => [q.id, q] as const));
  const wfQuestionIds =
    wf.step3ExamGeneration?.questionIdsInExam?.length > 0
      ? wf.step3ExamGeneration.questionIdsInExam
      : wf.step1QuestionBank?.approvedQuestionIds || [];

  const questions: QualityReviewQuestionNode[] = [];
  wfQuestionIds.forEach((qid, idx) => {
    const bankQ = questionById.get(qid);
    if (!bankQ) return;
    const qNum = idx + 1;
    const qFmt = mapFormatToQualityFormat(bankQ.format);
    const qLvl = mapCognitiveCodeToQualityLevel(bankQ.cognitiveLevel);
    questions.push({
      questionNumber: qNum,
      questionCode: bankQ.code || `CH-${qNum}`,
      format: qFmt,
      stem: bankQ.stem,
      options: qFmt === 'MULTIPLE_CHOICE' ? parseMcqOptions(bankQ.options) : undefined,
      declaredCorrectAnswer: String(bankQ.correctAnswer || '').trim(),
      points: Number(bankQ.points || 0),
      declaredCognitiveLevel: qLvl,
      topicTitle: bankQ.topicTitle || 'Chủ đề trong chương trình',
      learningOutcomeCode: bankQ.learningOutcomeCode || `YCCD-${qNum}`,
      learningOutcomeText: bankQ.learningOutcomeText || bankQ.topicTitle || '',
      gradingGuide: String(bankQ.gradingGuide || bankQ.correctAnswer || '').trim(),
      positionInExamLabel: `Câu ${qNum}`,
      aiAssessedCognitiveLevel: qLvl,
      answerKeySheetValue: String(bankQ.correctAnswer || '').trim(),
      answerKeySheetQuestionNumber: qNum,
      answerKeySheetVariantCode: wf.step3ExamGeneration?.variantCodes?.[0] || '101',
      gradingGuidePoints: Number(bankQ.points || 0),
      isWithinDeclaredCurriculumScope: true,
    });
  });

  const targetTotalPoints = Number(
    wf.step2MatrixAndSpec?.totalPoints || wf.step3ExamGeneration?.totalExamPoints || 10
  );

  return {
    dossierId: wf.workflowId,
    dossierCode: wf.workflowId,
    title: wf.title,
    subject: wf.subjectId,
    grade: wf.gradeId,
    examPeriod: wf.examPeriodLabel || EXAM_PERIOD_LABELS[wf.examPeriod] || 'Kiểm tra định kỳ',
    examVariantCode: wf.step3ExamGeneration?.variantCodes?.[0] || '101',
    curriculumStandard: `Chương trình GDPT 2018 – Môn ${wf.subjectId} Lớp ${wf.gradeId}`,
    assessmentRuleSet: getRuleBasisForGrade(wf.gradeId),
    durationMinutes: wf.step2MatrixAndSpec?.durationMinutes || 45,
    targetTotalPoints,
    versionLabel: wf.currentVersionId || 'v1.0',
    approvalStatus:
      wf.status === 'Approved' || wf.status === 'Released'
        ? ApprovalStatus.APPROVED
        : ApprovalStatus.DRAFT,
    isConfidentialExam: Boolean(wf.isConfidentialExam),
    hasSecurityPermissionForAi: !wf.isConfidentialExam,
    hasMatrixDocument: Boolean(wf.hasMatrixDocument || matchedMatrix),
    hasSpecificationDocument: Boolean(wf.hasSpecificationDocument || matchedMatrix?.specRows?.length),
    hasExamPaperDocument: questions.length > 0,
    hasAnswerKeyDocument: Boolean(wf.step3ExamGeneration?.answerKeyComplete && questions.length > 0),
    hasGradingGuideDocument: Boolean(wf.step3ExamGeneration?.gradingGuideComplete && questions.length > 0),
    allowedCurriculumTopicTitles:
      wf.step1QuestionBank?.selectedTopics?.length > 0
        ? wf.step1QuestionBank.selectedTopics
        : undefined,
    answerKeyHeaderVariantCode: wf.step3ExamGeneration?.variantCodes?.[0] || '101',
    questions,
    matrixSlots: questions.map((q) => ({
      questionNumber: q.questionNumber,
      expectedTopicTitle: q.topicTitle,
      expectedKnowledgeUnit: q.topicTitle,
      expectedLearningOutcomeCode: q.learningOutcomeCode,
      expectedCognitiveLevel: q.declaredCognitiveLevel,
      expectedFormat: q.format,
      expectedPoints: q.points,
      expectedPointPercentage:
        targetTotalPoints > 0 ? Number(((q.points / targetTotalPoints) * 100).toFixed(2)) : 0,
    })),
    specificationSlots: questions.map((q) => ({
      questionNumber: q.questionNumber,
      topicTitle: q.topicTitle,
      knowledgeUnit: q.topicTitle,
      learningOutcomeCode: q.learningOutcomeCode,
      learningOutcomeDescription: q.learningOutcomeText,
      competencyAssessed: `Năng lực môn ${wf.subjectId}`,
      cognitiveLevel: q.declaredCognitiveLevel,
      format: q.format,
      expectedPoints: q.points,
    })),
  };
}

export const AIQualityReviewWorkspace: React.FC<AIQualityReviewWorkspaceProps> = ({
  questions = [],
  savedExams = [],
  savedMatrices = [],
  config,
  authSession,
  teacherPermissionProfile,
  schoolBranding,
  schoolAllowedGrades,
  onCleanSampleData,
  onNavigate,
  onNotify,
}) => {
  const activeSchoolId = authSession?.user?.schoolId || schoolBranding?.schoolId || 'SCHOOL_A';
  const activeSchoolName =
    schoolBranding?.schoolName || config?.schoolName || 'Đơn vị trường học';
  const teacherFullName = authSession?.user?.fullName || 'Giáo viên bộ môn';

  const allowedGrades = useMemo<GradeNumber[]>(() => {
    if (Array.isArray(schoolAllowedGrades) && schoolAllowedGrades.length > 0) {
      return [...schoolAllowedGrades].sort((a, b) => a - b) as GradeNumber[];
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }, [schoolAllowedGrades]);

  const allowedSubjects = useMemo<string[]>(() => {
    if (
      teacherPermissionProfile &&
      Array.isArray(teacherPermissionProfile.subjectAllocations) &&
      teacherPermissionProfile.subjectAllocations.length > 0
    ) {
      return Array.from(
        new Set(
          teacherPermissionProfile.subjectAllocations
            .map((a) => a.subjectName)
            .filter(Boolean)
        )
      );
    }
    const hasPrimary = allowedGrades.some((g) => g <= 5);
    const hasSecondary = allowedGrades.some((g) => g >= 6);
    const set = new Set<string>();
    if (hasPrimary) {
      getRuleSetForLevel('PRIMARY' as EducationLevelId).subjects.forEach((s) => set.add(s));
    }
    if (hasSecondary) {
      getRuleSetForLevel('LOWER_SECONDARY' as EducationLevelId).subjects.forEach((s) =>
        set.add(s)
      );
    }
    return Array.from(set);
  }, [teacherPermissionProfile, allowedGrades]);

  // Tự động làm sạch dữ liệu mẫu tồn dư trong localStorage khi mở không gian làm việc chính thức
  const autoCleanedRef = useRef(false);
  useEffect(() => {
    if (autoCleanedRef.current) return;
    autoCleanedRef.current = true;
    purgeAllSampleWorkflowsFromLocal();
    purgeSampleNotificationsAndTasksFromLocal();
  }, []);

  // Tải danh sách hồ sơ quy trình chính thức từ máy chủ & bộ nhớ cục bộ
  const [officialWorkflows, setOfficialWorkflows] = useState<ExamWorkflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState<boolean>(false);

  const fetchOfficialWorkflows = useCallback(async () => {
    setIsLoadingWorkflows(true);
    try {
      const localClean = loadSavedWorkflows([], [], []).filter(
        (wf) => !isSampleOrTestWorkflowDossier(wf)
      );
      const res = await fetch(
        `/api/workflows?officialOnly=true&schoolId=${encodeURIComponent(activeSchoolId)}`
      );
      if (res.ok) {
        const data = await res.json();
        const serverItems: ExamWorkflow[] = Array.isArray(data?.workflows)
          ? data.workflows
          : Array.isArray(data)
          ? data
          : [];
        const merged = new Map<string, ExamWorkflow>();
        localClean.forEach((wf) => merged.set(wf.workflowId, wf));
        serverItems
          .filter((wf) => !isSampleOrTestWorkflowDossier(wf))
          .forEach((wf) => merged.set(wf.workflowId, wf));
        setOfficialWorkflows(Array.from(merged.values()));
      } else {
        setOfficialWorkflows(localClean);
      }
    } catch {
      const localClean = loadSavedWorkflows([], [], []).filter(
        (wf) => !isSampleOrTestWorkflowDossier(wf)
      );
      setOfficialWorkflows(localClean);
    } finally {
      setIsLoadingWorkflows(false);
    }
  }, [activeSchoolId]);

  useEffect(() => {
    void fetchOfficialWorkflows();
  }, [fetchOfficialWorkflows]);

  // Lọc dữ liệu chính thức 100% (tuyệt đối không nhận dữ liệu mẫu / thử nghiệm)
  const cleanQuestions = useMemo(
    () =>
      questions.filter(
        (q) => !isSampleOrDemoQuestion(q) && allowedGrades.includes(q.grade)
      ),
    [questions, allowedGrades]
  );

  const cleanMatrices = useMemo(
    () =>
      savedMatrices.filter(
        (m) => !isSampleOrDemoMatrix(m) && allowedGrades.includes(m.grade)
      ),
    [savedMatrices, allowedGrades]
  );

  const cleanExams = useMemo(
    () =>
      savedExams.filter(
        (e) => !isSampleOrDemoExam(e) && allowedGrades.includes(e.grade)
      ),
    [savedExams, allowedGrades]
  );

  // Danh sách nguồn hồ sơ đề chính thức để giáo viên chọn rà soát
  const officialSources = useMemo<OfficialDossierSourceOption[]>(() => {
    const list: OfficialDossierSourceOption[] = [];
    const seenExamIds = new Set<string>();

    cleanExams.forEach((exam) => {
      seenExamIds.add(exam.id);
      const linkedMatrix = cleanMatrices.find((m) => m.id === exam.matrixId);
      const qCount =
        exam.variants?.[0]?.items?.length || exam.questionIds?.length || 0;
      list.push({
        sourceKey: `EXAM::${exam.id}`,
        sourceType: 'EXAM_PAPER',
        code: exam.code || exam.id,
        title: exam.title,
        subject: exam.subject,
        grade: exam.grade,
        examPeriodLabel: EXAM_PERIOD_LABELS[exam.examPeriod] || exam.examPeriod,
        questionCount: qCount,
        totalPoints: exam.totalPoints || 10,
        hasLinkedMatrix: Boolean(linkedMatrix),
        statusLabel: exam.status,
        updatedAt: exam.updatedAt || exam.createdAt || '',
        examPaper: exam,
        linkedMatrix,
      });
    });

    officialWorkflows.forEach((wf) => {
      if (!allowedGrades.includes(wf.gradeId)) return;
      if (wf.examId && seenExamIds.has(wf.examId)) return;
      if (
        teacherPermissionProfile &&
        Array.isArray(teacherPermissionProfile.subjectAllocations) &&
        teacherPermissionProfile.subjectAllocations.length > 0 &&
        !teacherPermissionProfile.subjectAllocations.some((alloc) =>
          areSubjectsEquivalent(alloc.subjectName, wf.subjectId)
        ) &&
        normalizeText(wf.creatorName) !== normalizeText(teacherFullName)
      ) {
        return;
      }
      const qCount =
        wf.step3ExamGeneration?.questionIdsInExam?.length ||
        wf.step1QuestionBank?.approvedQuestionIds?.length ||
        0;
      if (qCount === 0 && !wf.examId) return;

      list.push({
        sourceKey: `WORKFLOW::${wf.workflowId}`,
        sourceType: 'WORKFLOW_DOSSIER',
        code: wf.workflowId,
        title: wf.title,
        subject: wf.subjectId,
        grade: wf.gradeId,
        examPeriodLabel:
          wf.examPeriodLabel || EXAM_PERIOD_LABELS[wf.examPeriod] || 'Kiểm tra định kỳ',
        questionCount: qCount,
        totalPoints:
          wf.step3ExamGeneration?.totalExamPoints ||
          wf.step2MatrixAndSpec?.totalPoints ||
          10,
        hasLinkedMatrix: Boolean(wf.hasMatrixDocument || wf.matrixId),
        statusLabel: WORKFLOW_STATE_LABELS[wf.status]?.label || wf.status,
        updatedAt: wf.updatedAt || wf.createdAt || '',
        workflow: wf,
      });
    });

    return list.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }, [
    cleanExams,
    cleanMatrices,
    officialWorkflows,
    allowedGrades,
    teacherPermissionProfile,
    teacherFullName,
  ]);

  const [activeTab, setActiveTab] = useState<QualityReviewTabId>('tab0-quality-dashboard');
  const [selectedSourceKey, setSelectedSourceKey] = useState<string>('');
  const [selectedVariantCode, setSelectedVariantCode] = useState<string>('101');

  // Hồ sơ đang mở để AI kiểm tra (null khi chưa có hồ sơ chính thức nào được chọn / khởi tạo)
  const [dossier, setDossier] = useState<QualityReviewDossierPackage | null>(null);
  const [liveGeminiIssues, setLiveGeminiIssues] = useState<QualityReviewDetectedIssue[]>([]);

  // Tự động chọn hồ sơ chính thức đầu tiên khi danh sách sẵn sàng
  useEffect(() => {
    if (dossier !== null) return;
    if (officialSources.length === 0) return;
    const first = officialSources[0];
    setSelectedSourceKey(first.sourceKey);
    if (first.examPaper) {
      const firstVariant = first.examPaper.variants?.[0]?.variantCode || '101';
      setSelectedVariantCode(firstVariant);
      setDossier(
        buildOfficialDossierFromExamPaper(
          first.examPaper,
          first.linkedMatrix,
          cleanQuestions,
          firstVariant
        )
      );
    } else if (first.workflow) {
      setDossier(
        buildOfficialDossierFromWorkflow(
          first.workflow,
          cleanExams,
          cleanMatrices,
          cleanQuestions
        )
      );
    }
  }, [officialSources, dossier, cleanQuestions, cleanExams, cleanMatrices]);

  // Cấu hình bật/tắt 10 nhóm kiểm tra chuyên môn
  const [enabledGroups, setEnabledGroups] = useState<Record<QualityReviewGroupId, boolean>>({
    GROUP_01_CURRICULUM: true,
    GROUP_02_MATRIX: true,
    GROUP_03_SPECIFICATION: true,
    GROUP_04_KNOWLEDGE: true,
    GROUP_05_QUESTION_STEM: true,
    GROUP_06_MULTIPLE_CHOICE: true,
    GROUP_07_ESSAY: true,
    GROUP_08_ANSWER_AND_RUBRIC: true,
    GROUP_09_LANGUAGE_AND_FORMAT: true,
    GROUP_10_OVERALL_QUALITY: true,
  });

  // Trạng thái xử lý từng lỗi do giáo viên quyết định
  const [issueStatusMap, setIssueStatusMap] = useState<Record<string, QualityIssueStatus>>({});
  const [versionCounter, setVersionCounter] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<QualityReviewVersionHistoryEntry[]>([]);

  // Bộ lọc trên Bảng điều khiển
  const [severityFilter, setSeverityFilter] = useState<QualityIssueSeverityLevel | 'ALL'>('ALL');
  const [questionFilter, setQuestionFilter] = useState<number | 'ALL'>('ALL');
  const [groupFilter, setGroupFilter] = useState<QualityReviewGroupId | 'ALL'>('ALL');
  const [layerFilter, setLayerFilter] = useState<QualityDetectionSourceLayer | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<QualityIssueStatus | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusedIssueId, setFocusedIssueId] = useState<string | null>(null);
  const [uninspectedQuestionNumbers, setUninspectedQuestionNumbers] = useState<number[]>([]);

  const [issueActionMetaMap, setIssueActionMetaMap] = useState<
    Record<string, QualityDashboardIssueActionMeta>
  >({});
  const [editingNoteIssueId, setEditingNoteIssueId] = useState<string | null>(null);
  const [noteDraftText, setNoteDraftText] = useState<string>('');
  const [assigneeDraftText, setAssigneeDraftText] = useState<string>('Giáo viên ra đề');

  // Trạng thái gọi Gemini API Lớp B trực tiếp
  const [isCallingGeminiApi, setIsCallingGeminiApi] = useState<boolean>(false);
  const [lastAiCheckTimestamp, setLastAiCheckTimestamp] = useState<string>('');

  // Modal xác nhận làm sạch dữ liệu mẫu
  const [showCleanModal, setShowCleanModal] = useState<boolean>(false);
  const [isCleaningData, setIsCleaningData] = useState<boolean>(false);

  // Modal khởi tạo hồ sơ rà soát trực tiếp (khi giáo viên muốn nhập nhanh đề cần kiểm tra)
  const [showManualBuilderModal, setShowManualBuilderModal] = useState<boolean>(false);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualSubject, setManualSubject] = useState<string>(allowedSubjects[0] || 'Toán');
  const [manualGrade, setManualGrade] = useState<number>(allowedGrades[0] || 6);
  const [manualExamPeriod, setManualExamPeriod] = useState<string>('Giữa học kỳ I');
  const [manualDuration, setManualDuration] = useState<number>(45);
  const [manualTargetPoints, setManualTargetPoints] = useState<number>(10);

  // Form thêm câu hỏi vào hồ sơ đang rà soát
  const [showAddQuestionForm, setShowAddQuestionForm] = useState<boolean>(false);
  const [questionDraft, setQuestionDraft] = useState<ManualQuestionDraft>({
    stem: '',
    format: 'MULTIPLE_CHOICE',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    declaredCorrectAnswer: 'A',
    points: '1.0',
    declaredCognitiveLevel: 'Mức 1 – Nhận biết',
    topicTitle: '',
    learningOutcomeCode: '',
    learningOutcomeText: '',
    gradingGuide: '',
  });

  const uploadJsonInputRef = useRef<HTMLInputElement | null>(null);

  const resetInspectionTrackingState = useCallback(() => {
    setIssueStatusMap({});
    setIssueActionMetaMap({});
    setUninspectedQuestionNumbers([]);
    setVersionCounter(0);
    setVersionHistory([]);
    setFocusedIssueId(null);
    setLiveGeminiIssues([]);
    setLastAiCheckTimestamp('');
    setQuestionFilter('ALL');
    setStatusFilter('ALL');
    setAssigneeFilter('ALL');
    setSearchQuery('');
  }, []);

  const handleSelectOfficialSource = (sourceKey: string) => {
    setSelectedSourceKey(sourceKey);
    resetInspectionTrackingState();

    const found = officialSources.find((s) => s.sourceKey === sourceKey);
    if (!found) {
      setDossier(null);
      return;
    }

    if (found.examPaper) {
      const defaultVar = found.examPaper.variants?.[0]?.variantCode || '101';
      setSelectedVariantCode(defaultVar);
      const nextDossier = buildOfficialDossierFromExamPaper(
        found.examPaper,
        found.linkedMatrix,
        cleanQuestions,
        defaultVar
      );
      setDossier(nextDossier);
      onNotify(
        'info',
        'Đã nạp đề kiểm tra chính thức',
        `Đang rà soát chất lượng "${nextDossier.title}" (${nextDossier.questions.length} câu hỏi).`
      );
    } else if (found.workflow) {
      const nextDossier = buildOfficialDossierFromWorkflow(
        found.workflow,
        cleanExams,
        cleanMatrices,
        cleanQuestions
      );
      setDossier(nextDossier);
      onNotify(
        'info',
        'Đã nạp hồ sơ đề từ Quy trình kiểm tra',
        `Đang rà soát hồ sơ "${nextDossier.title}" (${nextDossier.questions.length} câu hỏi).`
      );
    }
  };

  const handleSelectVariantCode = (variantCode: string) => {
    setSelectedVariantCode(variantCode);
    const found = officialSources.find((s) => s.sourceKey === selectedSourceKey);
    if (found?.examPaper) {
      resetInspectionTrackingState();
      setDossier(
        buildOfficialDossierFromExamPaper(
          found.examPaper,
          found.linkedMatrix,
          cleanQuestions,
          variantCode
        )
      );
    }
  };

  const handleConfirmCleanSampleData = async () => {
    setIsCleaningData(true);
    try {
      const repoRemoved = onCleanSampleData
        ? onCleanSampleData()
        : { removedTopics: 0, removedQuestions: 0, removedMatrices: 0, removedExams: 0 };
      const localWfRemoved = purgeAllSampleWorkflowsFromLocal();
      const localTasksRemoved = purgeSampleNotificationsAndTasksFromLocal();

      try {
        await Promise.all([
          fetch('/api/workflows/clean-samples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: activeSchoolId }),
          }),
          fetch('/api/bgh-reports/clean-samples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: activeSchoolId }),
          }),
        ]);
      } catch {
        // Bỏ qua lỗi mạng tạm thời nếu máy chủ đang ngoại tuyến
      }

      if (dossier && /^(DE-DOICHIEU|DE-TOAN|DE-TV|ĐỀ-QA-|DE-QA-|DE-DEMO|DE-SAMPLE)/i.test(dossier.dossierCode)) {
        setDossier(null);
        setSelectedSourceKey('');
      }

      await fetchOfficialWorkflows();
      setShowCleanModal(false);

      const totalRemoved =
        repoRemoved.removedQuestions +
        repoRemoved.removedMatrices +
        repoRemoved.removedExams +
        localWfRemoved +
        localTasksRemoved.removedNotifications +
        localTasksRemoved.removedTasks;

      onNotify(
        'success',
        'Đã làm sạch dữ liệu mẫu',
        totalRemoved > 0
          ? `Đã dọn sạch ${totalRemoved} bản ghi thử nghiệm/mẫu tồn dư. Hệ thống chỉ hiển thị hồ sơ đề chính thức.`
          : 'Không gian AI kiểm tra chất lượng đề đã sạch 100%, sẵn sàng sử dụng chính thức.'
      );
    } finally {
      setIsCleaningData(false);
    }
  };

  const handleCreateManualDossier = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = manualTitle.trim();
    if (!trimmedTitle) {
      onNotify('warning', 'Thiếu tên đề kiểm tra', 'Vui lòng nhập tên đề kiểm tra cần rà soát.');
      return;
    }

    resetInspectionTrackingState();
    setSelectedSourceKey('MANUAL_REVIEW');
    const code = `RA-SOAT-K${manualGrade}-${Date.now().toString().slice(-4)}`;
    const newDossier: QualityReviewDossierPackage = {
      dossierId: `manual-${Date.now()}`,
      dossierCode: code,
      title: trimmedTitle,
      subject: manualSubject,
      grade: manualGrade,
      examPeriod: manualExamPeriod,
      examVariantCode: '101',
      curriculumStandard: `Chương trình GDPT 2018 – Môn ${manualSubject} Lớp ${manualGrade}`,
      assessmentRuleSet: getRuleBasisForGrade(manualGrade),
      durationMinutes: Number(manualDuration) || 45,
      targetTotalPoints: Number(manualTargetPoints) || 10,
      versionLabel: 'v1.0',
      approvalStatus: ApprovalStatus.DRAFT,
      isConfidentialExam: false,
      hasSecurityPermissionForAi: true,
      hasMatrixDocument: false,
      hasSpecificationDocument: false,
      hasExamPaperDocument: true,
      hasAnswerKeyDocument: true,
      hasGradingGuideDocument: true,
      answerKeyHeaderVariantCode: '101',
      questions: [],
      matrixSlots: [],
      specificationSlots: [],
    };
    setDossier(newDossier);
    setShowManualBuilderModal(false);
    setShowAddQuestionForm(true);
    setActiveTab('tab1-select-dossier');
    onNotify(
      'success',
      'Đã khởi tạo hồ sơ rà soát trực tiếp',
      'Hãy thêm các câu hỏi của đề để AI kiểm tra chất lượng chuyên môn.'
    );
  };

  const handleAddQuestionToDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier) return;
    if (!questionDraft.stem.trim()) {
      onNotify('warning', 'Thiếu nội dung câu hỏi', 'Vui lòng nhập đề bài câu hỏi.');
      return;
    }
    const pts = Number(questionDraft.points);
    if (!Number.isFinite(pts) || pts <= 0) {
      onNotify('warning', 'Điểm số chưa hợp lệ', 'Điểm câu hỏi phải lớn hơn 0.');
      return;
    }

    const nextNum = dossier.questions.length + 1;
    const options =
      questionDraft.format === 'MULTIPLE_CHOICE'
        ? ([
            { key: 'A', text: questionDraft.optionA.trim() },
            { key: 'B', text: questionDraft.optionB.trim() },
            { key: 'C', text: questionDraft.optionC.trim() },
            { key: 'D', text: questionDraft.optionD.trim() },
          ].filter((o) => o.text.length > 0) as { key: 'A' | 'B' | 'C' | 'D'; text: string }[])
        : undefined;

    const newNode: QualityReviewQuestionNode = {
      questionNumber: nextNum,
      questionCode: `CH-${nextNum}`,
      format: questionDraft.format,
      stem: questionDraft.stem.trim(),
      options,
      declaredCorrectAnswer: questionDraft.declaredCorrectAnswer.trim(),
      points: pts,
      declaredCognitiveLevel: questionDraft.declaredCognitiveLevel,
      topicTitle: questionDraft.topicTitle.trim() || `Chủ đề môn ${dossier.subject}`,
      learningOutcomeCode:
        questionDraft.learningOutcomeCode.trim() || `YCCD-K${dossier.grade}-${nextNum}`,
      learningOutcomeText:
        questionDraft.learningOutcomeText.trim() ||
        questionDraft.topicTitle.trim() ||
        `Yêu cầu cần đạt môn ${dossier.subject} Lớp ${dossier.grade}`,
      gradingGuide:
        questionDraft.gradingGuide.trim() ||
        `Đáp án đúng: ${questionDraft.declaredCorrectAnswer.trim()} (${pts} điểm)`,
      positionInExamLabel: `Câu ${nextNum}`,
      aiAssessedCognitiveLevel: questionDraft.declaredCognitiveLevel,
      answerKeySheetValue: questionDraft.declaredCorrectAnswer.trim(),
      answerKeySheetQuestionNumber: nextNum,
      answerKeySheetVariantCode: dossier.examVariantCode,
      gradingGuidePoints: pts,
      isWithinDeclaredCurriculumScope: true,
    };

    setDossier((prev) => {
      if (!prev) return prev;
      const updatedQuestions = [...prev.questions, newNode];
      return {
        ...prev,
        hasExamPaperDocument: true,
        hasAnswerKeyDocument: updatedQuestions.every((q) => Boolean(q.declaredCorrectAnswer)),
        hasGradingGuideDocument: updatedQuestions.every((q) => Boolean(q.gradingGuide)),
        questions: updatedQuestions,
      };
    });

    setQuestionDraft((prev) => ({
      ...prev,
      stem: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      gradingGuide: '',
    }));
    onNotify('success', `Đã thêm Câu ${nextNum}`, 'Hệ thống đã cập nhật kết quả rà soát tự động.');
  };

  const handleUploadDossierJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (!parsed || !Array.isArray(parsed.questions)) {
          onNotify(
            'error',
            'Tệp JSON không đúng cấu trúc',
            'Tệp tải lên cần có danh sách câu hỏi (questions) hợp lệ.'
          );
          return;
        }
        resetInspectionTrackingState();
        setSelectedSourceKey('UPLOADED_JSON');
        const gradeVal = Number(parsed.grade) || allowedGrades[0] || 6;
        const nextDossier: QualityReviewDossierPackage = {
          dossierId: String(parsed.dossierId || `upload-${Date.now()}`),
          dossierCode: String(parsed.dossierCode || `DE-TAILEN-${Date.now().toString().slice(-4)}`),
          title: String(parsed.title || file.name.replace(/\.json$/i, '')),
          subject: String(parsed.subject || allowedSubjects[0] || 'Toán'),
          grade: gradeVal,
          examPeriod: String(parsed.examPeriod || 'Kiểm tra định kỳ'),
          examVariantCode: String(parsed.examVariantCode || '101'),
          curriculumStandard: String(
            parsed.curriculumStandard || `Chương trình GDPT 2018 – Lớp ${gradeVal}`
          ),
          assessmentRuleSet: String(parsed.assessmentRuleSet || getRuleBasisForGrade(gradeVal)),
          durationMinutes: Number(parsed.durationMinutes) || 45,
          targetTotalPoints: Number(parsed.targetTotalPoints) || 10,
          versionLabel: String(parsed.versionLabel || 'v1.0'),
          approvalStatus: ApprovalStatus.DRAFT,
          isConfidentialExam: Boolean(parsed.isConfidentialExam),
          hasSecurityPermissionForAi: parsed.hasSecurityPermissionForAi !== false,
          hasMatrixDocument: Array.isArray(parsed.matrixSlots) && parsed.matrixSlots.length > 0,
          hasSpecificationDocument:
            Array.isArray(parsed.specificationSlots) && parsed.specificationSlots.length > 0,
          hasExamPaperDocument: parsed.questions.length > 0,
          hasAnswerKeyDocument: true,
          hasGradingGuideDocument: true,
          questions: parsed.questions,
          matrixSlots: Array.isArray(parsed.matrixSlots) ? parsed.matrixSlots : [],
          specificationSlots: Array.isArray(parsed.specificationSlots)
            ? parsed.specificationSlots
            : [],
          vietnameseCorpusBlock: parsed.vietnameseCorpusBlock,
          vietnameseWritingBlock: parsed.vietnameseWritingBlock,
        };
        setDossier(nextDossier);
        onNotify(
          'success',
          'Đã nạp tệp hồ sơ đề kiểm tra',
          `Đã đọc ${nextDossier.questions.length} câu hỏi từ tệp "${file.name}".`
        );
      } catch {
        onNotify('error', 'Không thể đọc tệp JSON', 'Vui lòng kiểm tra lại định dạng tệp JSON.');
      }
    };
    reader.readAsText(file, 'utf-8');
    if (uploadJsonInputRef.current) uploadJsonInputRef.current.value = '';
  };

  // Chạy bộ phân tích 2 lớp khi có hồ sơ thật đang mở
  const reviewExecution = useMemo(() => {
    if (!dossier || dossier.questions.length === 0) {
      return null;
    }
    const raw = runTwoLayerQualityReview(dossier, enabledGroups);
    const combinedRaw = [...raw.issues];
    const existingKeys = new Set(
      combinedRaw.map((i) => `${i.questionNumber || 0}::${normalizeText(i.issueCategoryLabel)}`)
    );
    liveGeminiIssues.forEach((gIss) => {
      const key = `${gIss.questionNumber || 0}::${normalizeText(gIss.issueCategoryLabel)}`;
      if (!existingKeys.has(key)) {
        combinedRaw.push(gIss);
      }
    });

    const mergedIssues: QualityReviewDetectedIssue[] = combinedRaw.map((iss) => ({
      ...iss,
      status: issueStatusMap[iss.issueId] || iss.status,
    }));
    return {
      ...raw,
      issues: mergedIssues,
    };
  }, [dossier, enabledGroups, liveGeminiIssues, issueStatusMap]);

  const dashboardState = useMemo(() => {
    if (!dossier || !reviewExecution) return null;
    return computeQualityDashboardState(dossier, reviewExecution.issues, {
      uninspectedQuestionNumbers,
      isCurrentlyInspecting: isCallingGeminiApi,
      isComprehensiveCheckComplete: reviewExecution.isComprehensiveCheckComplete,
    });
  }, [
    dossier,
    reviewExecution,
    uninspectedQuestionNumbers,
    isCallingGeminiApi,
  ]);

  const vietnameseAnalysis = useMemo(() => {
    if (!dossier || !reviewExecution) return null;
    return analyzePrimaryVietnameseDossierDetails(dossier, reviewExecution.issues);
  }, [dossier, reviewExecution]);

  const mathAnalysis = useMemo(() => {
    if (!dossier || !reviewExecution) return null;
    return analyzePrimaryMathDossierDetails(dossier, reviewExecution.issues);
  }, [dossier, reviewExecution]);

  const qualityReport = useMemo(() => {
    if (!dossier || !reviewExecution) return null;
    return buildQualityReviewReport(
      dossier,
      reviewExecution.issues,
      reviewExecution.isComprehensiveCheckComplete,
      reviewExecution.completenessBannerText,
      reviewExecution.checkedScopeList,
      reviewExecution.unverifiedScopeList
    );
  }, [dossier, reviewExecution]);

  const crossCheckAnalysis = useMemo(() => {
    if (!dossier || dossier.questions.length === 0) return null;
    return runDossierCrossCheckAnalysis(dossier);
  }, [dossier]);

  const filteredIssues = useMemo(() => {
    if (!reviewExecution) return [];
    const qLower = searchQuery.trim().toLowerCase();
    return reviewExecution.issues.filter((iss) => {
      if (
        iss.questionNumber !== undefined &&
        uninspectedQuestionNumbers.includes(iss.questionNumber)
      ) {
        return false;
      }
      if (severityFilter !== 'ALL' && iss.severity !== severityFilter) return false;
      if (questionFilter !== 'ALL' && iss.questionNumber !== questionFilter) return false;
      if (groupFilter !== 'ALL' && iss.groupId !== groupFilter) return false;
      if (layerFilter !== 'ALL' && iss.detectionLayer !== layerFilter) return false;
      if (statusFilter !== 'ALL' && iss.status !== statusFilter) return false;
      const issAssignee =
        issueActionMetaMap[iss.issueId]?.assigneeName || 'Giáo viên ra đề';
      if (assigneeFilter !== 'ALL' && issAssignee !== assigneeFilter) return false;
      if (qLower) {
        const haystack = `${iss.issueCode} ${iss.locationLabel} ${iss.issueCategoryLabel} ${iss.problemDescription} ${iss.evidenceAndBasis} ${iss.proposedFix} ${issAssignee}`.toLowerCase();
        if (!haystack.includes(qLower)) return false;
      }
      return true;
    });
  }, [
    reviewExecution,
    uninspectedQuestionNumbers,
    severityFilter,
    questionFilter,
    groupFilter,
    layerFilter,
    statusFilter,
    assigneeFilter,
    searchQuery,
    issueActionMetaMap,
  ]);

  const selectedDetailIssue = useMemo(
    () =>
      reviewExecution?.issues.find((i) => i.issueId === focusedIssueId) ||
      filteredIssues[0] ||
      null,
    [reviewExecution, focusedIssueId, filteredIssues]
  );

  // Chấp nhận đề xuất chỉnh sửa (tạo phiên bản mới và ghi lịch sử, không tự ý sửa khi giáo viên chưa xác nhận)
  const handleAcceptProposal = (issue: QualityReviewDetectedIssue) => {
    if (!dossier) return;
    const nextCounter = versionCounter + 1;
    const nextVersionLabel = `v1.${nextCounter}`;

    let beforeSnapshot = issue.currentContent;
    let afterSnapshot = issue.proposedFix;

    setDossier((prev) => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.map((q) => {
        if (q.questionNumber !== issue.questionNumber || !issue.replacementDraft) {
          return q;
        }
        const draft = issue.replacementDraft;
        beforeSnapshot = `Câu ${q.questionNumber}: "${q.stem}" | Đáp án: ${q.declaredCorrectAnswer} | Điểm: ${q.points} | Mức độ: ${q.declaredCognitiveLevel}`;
        const nextPoints = draft.updatedPoints ?? q.points;
        const nextCogLevel = draft.updatedCognitiveLevel ?? q.declaredCognitiveLevel;
        const nextCorrectAns = draft.updatedCorrectAnswer ?? q.declaredCorrectAnswer;
        const nextQ: QualityReviewQuestionNode = {
          ...q,
          stem: draft.updatedStem ?? q.stem,
          options: draft.updatedOptions ?? q.options,
          declaredCorrectAnswer: nextCorrectAns,
          points: nextPoints,
          gradingGuidePoints:
            draft.updatedPoints !== undefined ? nextPoints : q.gradingGuidePoints,
          declaredCognitiveLevel: nextCogLevel,
          aiAssessedCognitiveLevel:
            draft.updatedCognitiveLevel !== undefined
              ? nextCogLevel
              : q.aiAssessedCognitiveLevel,
          answerKeySheetValue:
            draft.updatedCorrectAnswer !== undefined
              ? nextCorrectAns
              : q.answerKeySheetValue,
          topicTitle: draft.updatedTopicTitle ?? q.topicTitle,
          gradingGuide: draft.updatedGradingGuide ?? q.gradingGuide,
          acceptedAlternativeSolutions:
            draft.updatedAcceptedAlternativeSolutions ?? q.acceptedAlternativeSolutions,
        };
        afterSnapshot = `Câu ${nextQ.questionNumber}: "${nextQ.stem}" | Đáp án: ${nextQ.declaredCorrectAnswer} | Điểm: ${nextQ.points} | Mức độ: ${nextQ.declaredCognitiveLevel}`;
        return nextQ;
      });

      return {
        ...prev,
        versionLabel: nextVersionLabel,
        questions: updatedQuestions,
      };
    });

    setVersionCounter(nextCounter);
    setIssueStatusMap((prev) => ({
      ...prev,
      [issue.issueId]: 'ACCEPTED_PROPOSAL',
    }));

    const historyEntry: QualityReviewVersionHistoryEntry = {
      versionId: `VER-${Date.now()}`,
      versionLabel: nextVersionLabel,
      timestamp: new Date().toLocaleString('vi-VN'),
      appliedIssueCode: issue.issueCode,
      locationLabel: issue.locationLabel,
      beforeSnapshot,
      afterSnapshot,
      actorNote: `${teacherFullName} chấp nhận đề xuất chỉnh sửa (${issue.issueCategoryLabel}).`,
    };
    setVersionHistory((prev) => [historyEntry, ...prev]);

    onNotify(
      'success',
      `Đã tạo phiên bản ${nextVersionLabel}`,
      `Đã áp dụng đề xuất chỉnh sửa tại ${issue.locationLabel} vào bản nháp rà soát.`
    );
  };

  const handleUpdateIssueStatus = (
    issue: QualityReviewDetectedIssue,
    nextStatus: QualityIssueStatus
  ) => {
    setIssueStatusMap((prev) => ({
      ...prev,
      [issue.issueId]: nextStatus,
    }));
    onNotify(
      'info',
      'Đã cập nhật trạng thái xử lý',
      `Mục ${issue.issueCode} (${issue.locationLabel}) đã chuyển sang trạng thái mới.`
    );
  };

  // Gửi kiểm tra chuyên sâu bằng Lớp A (Rule Engine) + Lớp B (Gemini API thực)
  const handleRunLiveGeminiReview = async () => {
    if (!dossier || dossier.questions.length === 0) {
      onNotify(
        'warning',
        'Chưa có câu hỏi để kiểm tra',
        'Vui lòng chọn đề kiểm tra đã lưu hoặc thêm câu hỏi vào hồ sơ rà soát.'
      );
      return;
    }

    if (dossier.isConfidentialExam && !dossier.hasSecurityPermissionForAi) {
      onNotify(
        'warning',
        'Chặn gửi Đề mật tới dịch vụ AI bên ngoài',
        'Hồ sơ đang bật chế độ Đề mật chưa cấp quyền bảo mật AI. Hệ thống chỉ kiểm tra bằng Bộ quy tắc nội bộ (Lớp A).'
      );
      return;
    }

    setIsCallingGeminiApi(true);
    try {
      const response = await fetch('/api/ai-quality-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossierTitle: dossier.title,
          subject: dossier.subject,
          grade: dossier.grade,
          curriculumStandard: dossier.curriculumStandard,
          assessmentRuleSet: dossier.assessmentRuleSet,
          isConfidentialExam: dossier.isConfidentialExam,
          hasSecurityPermissionForAi: dossier.hasSecurityPermissionForAi,
          questions: dossier.questions,
          vietnameseCorpusBlock: dossier.vietnameseCorpusBlock,
          vietnameseWritingBlock: dossier.vietnameseWritingBlock,
        }),
      });

      const nowStr = new Date().toLocaleTimeString('vi-VN');
      if (response.ok) {
        const data = await response.json();
        const findings: GeminiFindingPayload[] = Array.isArray(data?.aiFindings)
          ? data.aiFindings
          : [];
        const mappedFindings: QualityReviewDetectedIssue[] = findings.map((f, idx) => {
          const rawSev = String(f.severity || 'LEVEL_3_MEDIUM');
          const sev: QualityIssueSeverityLevel =
            rawSev === 'LEVEL_1_CRITICAL' ||
            rawSev === 'LEVEL_2_HIGH' ||
            rawSev === 'LEVEL_3_MEDIUM' ||
            rawSev === 'LEVEL_4_LOW'
              ? rawSev
              : 'LEVEL_3_MEDIUM';
          const sevLabel =
            sev === 'LEVEL_1_CRITICAL'
              ? 'Mức 1 – Nghiêm trọng'
              : sev === 'LEVEL_2_HIGH'
              ? 'Mức 2 – Cao'
              : sev === 'LEVEL_3_MEDIUM'
              ? 'Mức 3 – Trung bình'
              : 'Mức 4 – Khuyến nghị';
          const qNum = Number(f.questionNumber) || undefined;
          const targetQ = qNum
            ? dossier.questions.find((q) => q.questionNumber === qNum)
            : undefined;
          const conf = Math.max(50, Math.min(99, Number(f.confidenceScorePercent) || 85));

          return {
            issueId: `gemini-live-${dossier.dossierId}-${idx + 1}`,
            issueCode: `AI-B-${String(idx + 1).padStart(2, '0')}`,
            groupId: 'GROUP_05_QUESTION_STEM',
            groupTitle: 'Nhóm 5 – Đề bài & Ngữ nghĩa chuyên môn',
            issueCategoryLabel: String(f.issueCategoryLabel || 'Nhận định chuyên môn AI'),
            severity: sev,
            severityLabel: sevLabel,
            detectionLayer: 'LAYER_B_GEMINI_AI',
            detectionLayerLabel: 'Lớp B – Chuyên gia AI phân tích ngữ nghĩa',
            locationLabel: qNum ? `Câu ${qNum}` : 'Toàn đề',
            questionNumber: qNum,
            currentContent: targetQ ? targetQ.stem : dossier.title,
            problemDescription: String(f.problemDescription || ''),
            evidenceAndBasis: String(f.evidenceAndBasis || dossier.assessmentRuleSet),
            proposedFix: String(f.proposedFix || f.correctResultOrHandling || ''),
            correctResultOrHandling: f.correctResultOrHandling,
            verificationSolutionProof: f.verificationSolutionProof,
            confidenceScorePercent: conf,
            confidenceLabel: `${conf}%`,
            status: 'OPEN',
            impactAnalysis: {
              impactOnQuestionStem: 'Cần giáo viên rà soát lại diễn đạt câu dẫn/dữ kiện.',
              impactOnAnswerKey: f.correctResultOrHandling || 'Đối chiếu lại đáp án.',
              impactOnCognitiveLevel: 'Rà soát sự phù hợp với mức độ nhận thức.',
              impactOnMatrix: 'Giữ nguyên cấu trúc ma trận nếu không đổi điểm.',
              impactOnGradingGuide: 'Bổ sung lưu ý chấp nhận cách diễn đạt/giải hợp lệ khác.',
            },
          };
        });
        setLiveGeminiIssues(mappedFindings);
        setLastAiCheckTimestamp(nowStr);
        onNotify(
          'success',
          'Đã hoàn tất phân tích AI 2 lớp',
          `Đã kiểm tra ${dossier.questions.length} câu hỏi lúc ${nowStr} (ghi nhận ${mappedFindings.length} nhận định bổ sung từ Lớp B).`
        );
      } else {
        setLastAiCheckTimestamp(nowStr);
        onNotify(
          'info',
          'Đã hoàn tất kiểm tra bằng Bộ quy tắc chuẩn (Lớp A)',
          `Đã rà soát ${dossier.questions.length} câu hỏi lúc ${nowStr}.`
        );
      }
    } catch {
      const nowStr = new Date().toLocaleTimeString('vi-VN');
      setLastAiCheckTimestamp(nowStr);
      onNotify(
        'info',
        'Đã hoàn tất kiểm tra nội bộ',
        `Đã kiểm tra toàn bộ 10 nhóm tiêu chí trên hồ sơ "${dossier.title}".`
      );
    } finally {
      setIsCallingGeminiApi(false);
    }
  };

  const renderSeverityLabel = (severity: QualityIssueSeverityLevel, label: string) => {
    if (severity === 'LEVEL_1_CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1 text-rose-800 font-bold text-xs whitespace-nowrap">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-700 shrink-0" />
          <span>{label}</span>
        </span>
      );
    }
    if (severity === 'LEVEL_2_HIGH') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-800 font-bold text-xs whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>{label}</span>
        </span>
      );
    }
    if (severity === 'LEVEL_3_MEDIUM') {
      return <span className="text-blue-800 font-semibold text-xs whitespace-nowrap">{label}</span>;
    }
    return <span className="text-slate-600 font-medium text-xs whitespace-nowrap">{label}</span>;
  };

  const selectedExamSource = useMemo(
    () => officialSources.find((s) => s.sourceKey === selectedSourceKey),
    [officialSources, selectedSourceKey]
  );

  const totalCurrentPoints = dossier
    ? Number(dossier.questions.reduce((acc, q) => acc + q.points, 0).toFixed(2))
    : 0;

  return (
    <div className="space-y-6">
      {/* HEADER CHÍNH THỨC */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{activeSchoolName}</span>
              <span aria-hidden="true">·</span>
              <span>Giáo viên: {teacherFullName}</span>
              <span aria-hidden="true">·</span>
              <span>
                Khối áp dụng: Lớp {allowedGrades[0]}–{allowedGrades[allowedGrades.length - 1]} (GDPT 2018)
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              AI kiểm tra chất lượng đề trước thẩm định
            </h1>
            <p className="text-sm text-slate-600">
              Rà soát đồng bộ Ma trận, Bản đặc tả, Đề kiểm tra, Đáp án và Hướng dẫn chấm theo 10 nhóm tiêu chí chuyên môn. Hệ thống hỗ trợ gợi ý chỉnh sửa, không tự động sửa đề hay phê duyệt thay hội đồng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowManualBuilderModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nhập đề rà soát trực tiếp</span>
            </button>

            <input
              ref={uploadJsonInputRef}
              type="file"
              accept=".json"
              onChange={handleUploadDossierJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => uploadJsonInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải tệp hồ sơ (.json)</span>
            </button>

            {dossier && dossier.questions.length > 0 && (
              <button
                type="button"
                onClick={handleRunLiveGeminiReview}
                disabled={isCallingGeminiApi}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCallingGeminiApi ? 'animate-spin' : ''}`} />
                <span>
                  {isCallingGeminiApi ? 'Đang phân tích AI...' : 'Gửi AI kiểm tra chuyên sâu'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCleanModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Làm sạch dữ liệu mẫu</span>
            </button>
          </div>
        </div>

        {/* THANH CHỌN NHANH ĐỀ KIỂM TRA CHÍNH THỨC */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-3 items-end text-xs">
          <div className="lg:col-span-6">
            <label className="font-semibold text-slate-700 block mb-1">
              Hồ sơ đề kiểm tra chính thức của giáo viên ({officialSources.length} hồ sơ đã lưu):
            </label>
            <select
              value={selectedSourceKey}
              onChange={(e) => handleSelectOfficialSource(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
            >
              <option value="">
                {officialSources.length === 0
                  ? '-- Chưa có đề kiểm tra đã lưu (Hãy tạo đề mới hoặc nhập đề rà soát trực tiếp) --'
                  : '-- Chọn đề kiểm tra chính thức cần rà soát --'}
              </option>
              {officialSources.map((src) => (
                <option key={src.sourceKey} value={src.sourceKey}>
                  [{src.code}] {src.title} · {src.subject} Lớp {src.grade} ({src.questionCount} câu ·{' '}
                  {src.totalPoints}đ)
                </option>
              ))}
              {selectedSourceKey === 'MANUAL_REVIEW' && dossier && (
                <option value="MANUAL_REVIEW">
                  [Rà soát trực tiếp] {dossier.title} · {dossier.subject} Lớp {dossier.grade} (
                  {dossier.questions.length} câu)
                </option>
              )}
              {selectedSourceKey === 'UPLOADED_JSON' && dossier && (
                <option value="UPLOADED_JSON">
                  [Tệp tải lên] {dossier.title} · {dossier.subject} Lớp {dossier.grade} (
                  {dossier.questions.length} câu)
                </option>
              )}
            </select>
          </div>

          {selectedExamSource?.examPaper?.variants &&
            selectedExamSource.examPaper.variants.length > 1 && (
              <div className="lg:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Mã đề kiểm tra:</label>
                <select
                  value={selectedVariantCode}
                  onChange={(e) => handleSelectVariantCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-semibold text-slate-900"
                >
                  {selectedExamSource.examPaper.variants.map((v) => (
                    <option key={v.variantCode} value={v.variantCode}>
                      Mã đề {v.variantCode}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <div
            className={
              selectedExamSource?.examPaper?.variants &&
              selectedExamSource.examPaper.variants.length > 1
                ? 'lg:col-span-4'
                : 'lg:col-span-6'
            }
          >
            {dossier ? (
              <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 font-mono tabular-nums text-slate-700">
                <span>
                  Mã: <b className="text-slate-900">{dossier.dossierCode}</b> · Phiên bản:{' '}
                  <b className="text-blue-800">{dossier.versionLabel}</b>
                </span>
                <span>
                  Tổng điểm:{' '}
                  <b
                    className={
                      Math.abs(totalCurrentPoints - dossier.targetTotalPoints) > 1e-3
                        ? 'text-rose-700'
                        : 'text-emerald-700'
                    }
                  >
                    {totalCurrentPoints}/{dossier.targetTotalPoints.toFixed(1)}đ
                  </b>
                  {lastAiCheckTimestamp ? ` · AI: ${lastAiCheckTimestamp}` : ''}
                </span>
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                {isLoadingWorkflows
                  ? 'Đang đồng bộ danh sách hồ sơ đề kiểm tra chính thức...'
                  : 'Chưa chọn hồ sơ đề kiểm tra nào.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TRẠNG THÁI CHƯA CÓ HỒ SƠ ĐỀ CHÍNH THỨC */}
      {!dossier && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Sẵn sàng kiểm tra chất lượng đề kiểm tra chính thức
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hiện chưa có đề kiểm tra nào được chọn. Thầy/Cô có thể tạo đề từ Ma trận đã phê duyệt trong mục Tạo đề kiểm tra, hoặc khởi tạo hồ sơ rà soát trực tiếp để AI đối chiếu câu hỏi, đáp án và hướng dẫn chấm ngay.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('exam-builder')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Đi tới Tạo đề kiểm tra</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('matrix')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Xây dựng Ma trận & Bản đặc tả</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowManualBuilderModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nhập đề rà soát trực tiếp</span>
            </button>
          </div>
        </div>
      )}

      {/* KHÔNG GIAN KIỂM TRA KHI ĐÃ MỞ HỒ SƠ ĐỀ */}
      {dossier && (
        <>
          {/* CẢNH BÁO KHI HỒ SƠ CHƯA ĐỦ TÀI LIỆU THÀNH PHẦN HOẶC ĐỀ MẬT */}
          {reviewExecution && !reviewExecution.isComprehensiveCheckComplete && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-950">
                  Hồ sơ chưa đầy đủ 5 tài liệu thành phần — Kiểm tra theo phạm vi hiện có
                </div>
                <p className="leading-relaxed">
                  Phạm vi đã kiểm tra: {reviewExecution.checkedScopeList.join('; ')}. Phần chưa đủ căn cứ đối chiếu:{' '}
                  {reviewExecution.unverifiedScopeList.join('; ')}.
                </p>
              </div>
            </div>
          )}

          {reviewExecution?.confidentialityWarning && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-950">
              <Lock className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Bảo mật Đề mật:</div>
                <p>{reviewExecution.confidentialityWarning}</p>
              </div>
            </div>
          )}

          {/* THANH ĐIỀU HƯỚNG TAB CHỨC NĂNG */}
          <div className="bg-slate-100 rounded-xl p-1 flex flex-wrap gap-1">
            {[
              {
                id: 'tab0-quality-dashboard',
                label: `Bảng điều khiển chất lượng (${dashboardState?.overviewMetrics.unresolvedIssuesCount ?? 0} cần rà soát)`,
                icon: ClipboardCheck,
              },
              {
                id: 'tab6-cross-check',
                label: `Đối chiếu chéo hồ sơ (${crossCheckAnalysis?.section6ConflictWarnings.length ?? 0} điểm lệch)`,
                icon: Layers,
              },
              {
                id: 'tab1-select-dossier',
                label: `Nội dung đề & Câu hỏi (${dossier.questions.length})`,
                icon: FileCheck2,
              },
              {
                id: 'tab4-fix-proposals',
                label: `Đề xuất chỉnh sửa & Lịch sử (${versionHistory.length})`,
                icon: Sparkles,
              },
              {
                id: 'tab2-criteria-setup',
                label: 'Tiêu chí kiểm tra (10 nhóm)',
                icon: Sliders,
              },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as QualityReviewTabId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TRƯỜNG HỢP HỒ SƠ MỚI TẠO CHƯA CÓ CÂU HỎI */}
          {dossier.questions.length === 0 && activeTab !== 'tab1-select-dossier' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Hồ sơ "{dossier.title}" hiện chưa có câu hỏi nào
              </h3>
              <p className="text-xs text-slate-600">
                Vui lòng chuyển sang thẻ "Nội dung đề & Câu hỏi" để thêm câu hỏi vào hồ sơ rà soát.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('tab1-select-dossier');
                  setShowAddQuestionForm(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm câu hỏi ngay</span>
              </button>
            </div>
          )}

          {/* =====================================================================
              TAB 0: BẢNG ĐIỀU KHIỂN CHẤT LƯỢNG ĐỀ
          ===================================================================== */}
          {activeTab === 'tab0-quality-dashboard' &&
            dossier.questions.length > 0 &&
            reviewExecution &&
            dashboardState &&
            qualityReport && (
              <div className="space-y-6">
                {/* ĐÁNH GIÁ TỔNG THỂ & 4 NÚT XUẤT BÁO CÁO CHÍNH THỨC */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="text-xs text-slate-500">
                        Đánh giá tổng thể hồ sơ · {dossier.dossierCode} · Phiên bản {dossier.versionLabel}
                      </div>
                      <h2
                        className={`text-lg font-bold ${
                          dashboardState.overallEvaluation.statusNumber === 5
                            ? 'text-emerald-800'
                            : dashboardState.overallEvaluation.statusNumber === 3
                            ? 'text-rose-800'
                            : dashboardState.overallEvaluation.statusNumber === 4
                            ? 'text-amber-800'
                            : 'text-blue-900'
                        }`}
                      >
                        {dashboardState.overallEvaluation.statusLabel}
                      </h2>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {dashboardState.overallEvaluation.statusRationale}
                      </p>
                      <p className="text-xs text-slate-500">
                        {dashboardState.overallEvaluation.mandatoryEpistemicDisclaimer}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          exportQualityReviewReportToWord(dossier, qualityReport);
                          onNotify(
                            'success',
                            'Đã xuất Báo cáo chất lượng (.doc)',
                            `Đã tải tệp báo cáo cho hồ sơ ${dossier.dossierCode}.`
                          );
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Báo cáo tổng hợp (.doc)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          exportQualityIssueListToExcel(
                            dossier,
                            reviewExecution.issues,
                            issueActionMetaMap
                          );
                          onNotify(
                            'success',
                            'Đã xuất Danh sách rà soát (.csv)',
                            `Đã kết xuất ${reviewExecution.issues.length} mục rà soát.`
                          );
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Danh sách lỗi (.csv)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          exportQualityDashboardPdfReport(
                            dossier,
                            dashboardState,
                            reviewExecution.issues,
                            issueActionMetaMap
                          );
                          onNotify(
                            'success',
                            'Đã xuất Báo cáo chuẩn in A4',
                            `Đã tải tệp báo cáo chuẩn in cho hồ sơ ${dossier.dossierCode}.`
                          );
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Báo cáo chuẩn in A4</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          exportInternalReviewMinutesToWord(
                            dossier,
                            dashboardState,
                            reviewExecution.issues,
                            issueActionMetaMap,
                            versionHistory.length
                          );
                          onNotify(
                            'success',
                            'Đã xuất Biên bản rà soát (.doc)',
                            `Đã kết xuất biên bản rà soát nội bộ (${dossier.versionLabel}).`
                          );
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Biên bản rà soát (.doc)</span>
                      </button>
                    </div>
                  </div>

                  {/* 9 CHỈ SỐ THỰC TẾ */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 text-xs tabular-nums">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-600">Tổng số câu</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                        {dashboardState.overviewMetrics.totalQuestions}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-600">Đã kiểm tra</div>
                      <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
                        {dashboardState.overviewMetrics.inspectedQuestions}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-600">Chưa kiểm tra</div>
                      <div className="text-xl font-bold font-mono text-slate-800 mt-1">
                        {dashboardState.overviewMetrics.uninspectedQuestions}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                      <div className="text-rose-900">Nghiêm trọng</div>
                      <div className="text-xl font-bold font-mono text-rose-800 mt-1">
                        {dashboardState.overviewMetrics.criticalIssuesCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div className="text-amber-950">Mức cao</div>
                      <div className="text-xl font-bold font-mono text-amber-800 mt-1">
                        {dashboardState.overviewMetrics.highIssuesCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                      <div className="text-blue-900">Trung bình</div>
                      <div className="text-xl font-bold font-mono text-blue-800 mt-1">
                        {dashboardState.overviewMetrics.mediumIssuesCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-600">Khuyến nghị</div>
                      <div className="text-xl font-bold font-mono text-slate-800 mt-1">
                        {dashboardState.overviewMetrics.lowIssuesCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <div className="text-emerald-900">Đã xử lý</div>
                      <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
                        {dashboardState.overviewMetrics.resolvedIssuesCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-700">Chưa xử lý</div>
                      <div className="text-xl font-bold font-mono text-rose-800 mt-1">
                        {dashboardState.overviewMetrics.unresolvedIssuesCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PHÂN BỐ MỨC ĐỘ NGHIÊM TRỌNG & ĐỐI SÁNH MỨC ĐỘ NHẬN THỨC */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5">
                      Phân bố cảnh báo theo mức độ ưu tiên
                    </h3>
                    <div className="space-y-3 text-xs tabular-nums">
                      {dashboardState.chartsData.bySeverity.map((bar) => (
                        <div key={bar.severity} className="space-y-1">
                          <div className="flex items-center justify-between text-slate-800">
                            <span>{bar.label}</span>
                            <span className="font-mono font-semibold">
                              {bar.count} mục ({bar.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressWidthClass(bar.percentage)} ${
                                bar.severity === 'LEVEL_1_CRITICAL'
                                  ? 'bg-rose-600'
                                  : bar.severity === 'LEVEL_2_HIGH'
                                  ? 'bg-amber-500'
                                  : bar.severity === 'LEVEL_3_MEDIUM'
                                  ? 'bg-blue-600'
                                  : 'bg-slate-500'
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5">
                      Đối sánh số câu theo mức độ nhận thức
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse tabular-nums">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600">
                            <th className="py-2 pr-3">Mức độ nhận thức</th>
                            <th className="py-2 px-3 text-right">Ma trận</th>
                            <th className="py-2 px-3 text-right">Đề thực tế</th>
                            <th className="py-2 pl-3 text-right">AI nhận định</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dashboardState.chartsData.byCognitiveLevel.map((cog) => (
                            <tr key={cog.levelKey}>
                              <td className="py-2.5 pr-3 font-medium text-slate-900">{cog.label}</td>
                              <td className="py-2.5 px-3 text-right font-mono">{cog.matrixCount}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-blue-800 font-semibold">
                                {cog.actualExamCount}
                              </td>
                              <td className="py-2.5 pl-3 text-right font-mono text-emerald-800 font-semibold">
                                {cog.aiAssessedCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* BẢNG DANH SÁCH LỖI & BÀN XỬ LÝ TRỰC TIẾP */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      Danh sách phát hiện & Đề xuất chỉnh sửa ({filteredIssues.length}/
                      {reviewExecution.issues.length})
                    </h3>
                    <div className="text-xs text-slate-500">
                      Lớp A: {qualityReport.countsByLayer.layerARuleEngine} mục · Lớp B:{' '}
                      {reviewExecution.issues.filter((i) => i.detectionLayer === 'LAYER_B_GEMINI_AI').length} mục
                    </div>
                  </div>

                  {/* Bộ lọc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
                    <div className="lg:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">Tìm kiếm:</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Mã lỗi, nội dung câu hỏi, căn cứ..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Mức độ:</label>
                      <select
                        value={severityFilter}
                        onChange={(e) =>
                          setSeverityFilter(e.target.value as QualityIssueSeverityLevel | 'ALL')
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="ALL">Tất cả mức độ</option>
                        <option value="LEVEL_1_CRITICAL">Mức 1 – Nghiêm trọng</option>
                        <option value="LEVEL_2_HIGH">Mức 2 – Cao</option>
                        <option value="LEVEL_3_MEDIUM">Mức 3 – Trung bình</option>
                        <option value="LEVEL_4_LOW">Mức 4 – Khuyến nghị</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Câu số:</label>
                      <select
                        value={questionFilter}
                        onChange={(e) =>
                          setQuestionFilter(
                            e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                          )
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="ALL">Tất cả câu hỏi</option>
                        {dossier.questions.map((q) => (
                          <option key={q.questionNumber} value={q.questionNumber}>
                            Câu {q.questionNumber} ({q.questionCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nhóm tiêu chí:</label>
                      <select
                        value={groupFilter}
                        onChange={(e) =>
                          setGroupFilter(e.target.value as QualityReviewGroupId | 'ALL')
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="ALL">Tất cả 10 nhóm</option>
                        {QUALITY_INSPECTION_GROUPS.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.shortTitle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Trạng thái:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(e.target.value as QualityIssueStatus | 'ALL')
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="OPEN">Chưa xử lý</option>
                        <option value="ACCEPTED_PROPOSAL">Đã chấp nhận đề xuất</option>
                        <option value="RESOLVED">Đã đánh dấu xử lý</option>
                        <option value="REJECTED_PROPOSAL">Đã từ chối đề xuất</option>
                      </select>
                    </div>
                  </div>

                  {/* Bảng kết quả */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-y border-slate-200 font-semibold">
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Mã</th>
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Vị trí</th>
                          <th className="py-2.5 px-3">Nội dung phát hiện</th>
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Mức độ</th>
                          <th className="py-2.5 px-3">Căn cứ chuyên môn</th>
                          <th className="py-2.5 px-3">Đề xuất chỉnh sửa</th>
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Thao tác xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredIssues.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              {reviewExecution.issues.length === 0
                                ? 'Không phát hiện lỗi sai lệch trên các tiêu chí đã kiểm tra.'
                                : 'Không có mục nào khớp với bộ lọc hiện tại.'}
                            </td>
                          </tr>
                        ) : (
                          filteredIssues.map((iss) => {
                            const meta = issueActionMetaMap[iss.issueId];
                            return (
                              <tr
                                key={iss.issueId}
                                className={`align-top hover:bg-slate-50 ${
                                  focusedIssueId === iss.issueId ? 'bg-blue-50/40' : ''
                                }`}
                              >
                                <td className="py-3 px-2.5 font-mono font-semibold text-blue-900 whitespace-nowrap">
                                  {iss.issueCode}
                                </td>
                                <td className="py-3 px-2.5 font-semibold text-slate-900 whitespace-nowrap">
                                  {iss.questionNumber ? `Câu ${iss.questionNumber}` : iss.locationLabel}
                                </td>
                                <td className="py-3 px-3 text-slate-800">
                                  <div className="font-semibold text-slate-900">
                                    {iss.issueCategoryLabel}
                                  </div>
                                  <div className="mt-0.5 leading-relaxed">{iss.problemDescription}</div>
                                  {meta?.reviewerNote && (
                                    <div className="mt-1 text-slate-600">
                                      Ghi chú ({meta.assigneeName}): {meta.reviewerNote}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-2.5 whitespace-nowrap">
                                  {renderSeverityLabel(iss.severity, iss.severityLabel)}
                                </td>
                                <td className="py-3 px-3 text-slate-700 leading-relaxed">
                                  <div>{iss.evidenceAndBasis}</div>
                                  {iss.verificationSolutionProof && (
                                    <div className="font-mono text-[11px] text-slate-600 mt-1">
                                      {iss.verificationSolutionProof}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-emerald-950 leading-relaxed">
                                  {iss.proposedFix}
                                </td>
                                <td className="py-3 px-2.5 space-y-1.5 whitespace-nowrap">
                                  <div className="text-[11px] font-semibold">
                                    {iss.status === 'OPEN' && (
                                      <span className="text-rose-700">Chưa xử lý</span>
                                    )}
                                    {iss.status === 'ACCEPTED_PROPOSAL' && (
                                      <span className="text-emerald-700">Đã áp dụng đề xuất</span>
                                    )}
                                    {iss.status === 'RESOLVED' && (
                                      <span className="text-blue-700">Đã đánh dấu xử lý</span>
                                    )}
                                    {iss.status === 'REJECTED_PROPOSAL' && (
                                      <span className="text-amber-700">Bảo lưu / Từ chối</span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setFocusedIssueId(iss.issueId)}
                                      className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-medium cursor-pointer"
                                    >
                                      Chi tiết
                                    </button>
                                    {iss.replacementDraft && (
                                      <button
                                        type="button"
                                        onClick={() => handleAcceptProposal(iss)}
                                        className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-medium cursor-pointer"
                                      >
                                        Áp dụng
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateIssueStatus(iss, 'RESOLVED')}
                                      className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-medium cursor-pointer"
                                    >
                                      Đã xử lý
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateIssueStatus(iss, 'REJECTED_PROPOSAL')
                                      }
                                      className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-medium cursor-pointer"
                                    >
                                      Từ chối
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingNoteIssueId(iss.issueId);
                                        setAssigneeDraftText(
                                          issueActionMetaMap[iss.issueId]?.assigneeName ||
                                            'Giáo viên ra đề'
                                        );
                                        setNoteDraftText(
                                          issueActionMetaMap[iss.issueId]?.reviewerNote || ''
                                        );
                                      }}
                                      className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium cursor-pointer"
                                    >
                                      Ghi chú
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Nhập ghi chú xử lý */}
                  {editingNoteIssueId && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-900">
                        Cập nhật người xử lý & ghi chú chuyên môn
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Người xử lý:
                          </label>
                          <select
                            value={assigneeDraftText}
                            onChange={(e) => setAssigneeDraftText(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="Giáo viên ra đề">Giáo viên ra đề</option>
                            <option value="Tổ trưởng chuyên môn">Tổ trưởng chuyên môn</option>
                            <option value="Hội đồng thẩm định">Hội đồng thẩm định</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 block mb-1">
                            Ghi chú rà soát / lý do bảo lưu:
                          </label>
                          <input
                            type="text"
                            value={noteDraftText}
                            onChange={(e) => setNoteDraftText(e.target.value)}
                            placeholder="Nhập nội dung ghi chú..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIssueActionMetaMap((prev) => ({
                              ...prev,
                              [editingNoteIssueId]: {
                                issueId: editingNoteIssueId,
                                assigneeName: assigneeDraftText,
                                reviewerNote: noteDraftText,
                                updatedAt: new Date().toLocaleString('vi-VN'),
                              },
                            }));
                            setEditingNoteIssueId(null);
                            onNotify('success', 'Đã lưu ghi chú rà soát', 'Thông tin ghi chú đã được cập nhật.');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold cursor-pointer"
                        >
                          Lưu ghi chú
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNoteIssueId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Xem chi tiết mục đang chọn */}
                  {selectedDetailIssue && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-900">
                        Chi tiết mục [{selectedDetailIssue.issueCode}] · {selectedDetailIssue.locationLabel} —{' '}
                        {selectedDetailIssue.issueCategoryLabel}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white border border-slate-200">
                          <div className="font-semibold text-slate-700">Nội dung hiện tại:</div>
                          <p className="font-mono text-slate-800 mt-1">
                            {selectedDetailIssue.currentContent}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-emerald-200">
                          <div className="font-semibold text-emerald-900">Phương án đề xuất:</div>
                          <p className="text-slate-800 mt-1">{selectedDetailIssue.proposedFix}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* =====================================================================
              TAB 6: ĐỐI CHIẾU CHÉO HỒ SƠ KIỂM TRA (7 ĐẦU VÀO - BẢNG 10 CỘT)
          ===================================================================== */}
          {activeTab === 'tab6-cross-check' && crossCheckAnalysis && (
            <div className="space-y-6">
              {/* Trạng thái 7 nguồn dữ liệu đầu vào */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">
                  Trạng thái 7 nguồn dữ liệu đầu vào của hồ sơ "{dossier.title}"
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {crossCheckAnalysis.sevenInputsStatus.map((inp) => (
                    <div
                      key={inp.order}
                      className={`p-3 rounded-xl border ${
                        inp.isAvailable
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-amber-50/60 border-amber-200'
                      }`}
                    >
                      <div className="font-bold text-slate-900">
                        {inp.order}. {inp.inputName}
                      </div>
                      <div className="text-slate-600 mt-1">{inp.summaryDetail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bảng kết quả đối chiếu chéo 10 cột */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Bảng đối chiếu chéo từng câu hỏi (Ma trận – Đặc tả – Đề – Đáp án – Hướng dẫn chấm)
                  </h3>
                  <span className="text-xs font-mono text-slate-600 tabular-nums">
                    Khớp đồng bộ:{' '}
                    <b>
                      {
                        crossCheckAnalysis.section5ResultTable.filter(
                          (r) => r.matchStatus === 'MATCHED'
                        ).length
                      }
                      /{crossCheckAnalysis.section5ResultTable.length}
                    </b>{' '}
                    câu
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse tabular-nums">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-y border-slate-200 font-semibold">
                        <th className="py-2.5 px-2.5">Câu</th>
                        <th className="py-2.5 px-2.5">Mã câu</th>
                        <th className="py-2.5 px-2.5">Vị trí</th>
                        <th className="py-2.5 px-3">Chủ đề</th>
                        <th className="py-2.5 px-3">Yêu cầu cần đạt</th>
                        <th className="py-2.5 px-2.5">Mức độ Ma trận</th>
                        <th className="py-2.5 px-2.5">AI nhận định</th>
                        <th className="py-2.5 px-2 text-right">Điểm MT</th>
                        <th className="py-2.5 px-2 text-right">Điểm Đề</th>
                        <th className="py-2.5 px-3">Kết luận đối chiếu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {crossCheckAnalysis.section5ResultTable.map((row) => (
                        <tr key={row.questionNumber} className="hover:bg-slate-50 align-top">
                          <td className="py-2.5 px-2.5 font-mono font-bold">Câu {row.questionNumber}</td>
                          <td className="py-2.5 px-2.5 font-mono text-slate-700">{row.questionCode}</td>
                          <td className="py-2.5 px-2.5 text-slate-600">{row.positionInExam}</td>
                          <td className="py-2.5 px-3 text-slate-800">{row.topicTitle}</td>
                          <td className="py-2.5 px-3 text-slate-700">{row.learningOutcome}</td>
                          <td className="py-2.5 px-2.5 text-slate-800">{row.matrixCognitiveLevel}</td>
                          <td className="py-2.5 px-2.5 text-slate-800">{row.aiAssessedCognitiveLevel}</td>
                          <td className="py-2.5 px-2 text-right font-mono">{row.matrixPoints}</td>
                          <td className="py-2.5 px-2 text-right font-mono font-semibold">
                            {row.actualExamPoints}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.matchStatus === 'MATCHED' ? (
                              <span className="text-emerald-800 font-semibold">Khớp đồng bộ</span>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="text-rose-800 font-bold">Lệch liên tài liệu</div>
                                <div className="text-slate-600">{row.recheckNotes}</div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cảnh báo mâu thuẫn liên tài liệu */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Danh sách cảnh báo sai lệch liên tài liệu ({crossCheckAnalysis.section6ConflictWarnings.length})
                </h3>
                {crossCheckAnalysis.section6ConflictWarnings.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Không phát hiện mâu thuẫn giữa các tài liệu thành phần hiện có của hồ sơ.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {crossCheckAnalysis.section6ConflictWarnings.map((warn) => (
                      <div
                        key={warn.warningId}
                        className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-bold text-slate-900">
                            [{warn.warningId}] {warn.conflictingDocumentsLabel}
                          </div>
                          {renderSeverityLabel(warn.severity, warn.severityLabel)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-white border border-slate-200">
                            <div className="font-semibold text-slate-800">
                              {warn.citationDocumentA.documentName} ({warn.citationDocumentA.locationLabel}):
                            </div>
                            <p className="font-mono text-slate-700 mt-1">
                              {warn.citationDocumentA.excerptText}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-white border border-slate-200">
                            <div className="font-semibold text-slate-800">
                              {warn.citationDocumentB.documentName} ({warn.citationDocumentB.locationLabel}):
                            </div>
                            <p className="font-mono text-slate-700 mt-1">
                              {warn.citationDocumentB.excerptText}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                          <div>
                            <b>Nguyên nhân:</b> {warn.causeExplanation}
                          </div>
                          <div>
                            <b>Phương án xử lý trung lập:</b>
                            <ul className="list-disc pl-5 mt-0.5 space-y-0.5 text-slate-700">
                              <li>{warn.neutralAdjustmentOptions.optionA_FollowSourceA}</li>
                              <li>{warn.neutralAdjustmentOptions.optionB_FollowSourceB}</li>
                            </ul>
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
              TAB 1: NỘI DUNG ĐỀ & CÂU HỎI ĐANG RÀ SOÁT
          ===================================================================== */}
          {activeTab === 'tab1-select-dossier' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Thông tin hồ sơ đề & Cấu hình bảo mật AI
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kiểm tra thông tin chung, trạng thái 5 tài liệu thành phần và danh sách câu hỏi thực tế.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionForm((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddQuestionForm ? 'Ẩn khung thêm câu hỏi' : 'Thêm câu hỏi vào bản rà soát'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tiêu đề đề kiểm tra:</label>
                    <input
                      type="text"
                      value={dossier.title}
                      onChange={(e) => setDossier((p) => (p ? { ...p, title: e.target.value } : p))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mã đề:</label>
                    <input
                      type="text"
                      value={dossier.examVariantCode}
                      onChange={(e) =>
                        setDossier((p) =>
                          p
                            ? {
                                ...p,
                                examVariantCode: e.target.value,
                                answerKeyHeaderVariantCode: e.target.value,
                              }
                            : p
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Thời lượng (phút):
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={dossier.durationMinutes}
                      onChange={(e) =>
                        setDossier((p) =>
                          p ? { ...p, durationMinutes: Number(e.target.value) || 45 } : p
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Thang điểm mục tiêu:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      max={100}
                      value={dossier.targetTotalPoints}
                      onChange={(e) =>
                        setDossier((p) =>
                          p ? { ...p, targetTotalPoints: Number(e.target.value) || 10 } : p
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Bảo mật đề mật */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={dossier.isConfidentialExam}
                      onChange={(e) =>
                        setDossier((p) =>
                          p ? { ...p, isConfidentialExam: e.target.checked } : p
                        )
                      }
                      className="rounded border-slate-300"
                    />
                    <span>Đánh dấu là Đề mật</span>
                  </label>
                  {dossier.isConfidentialExam && (
                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-rose-900">
                      <input
                        type="checkbox"
                        checked={dossier.hasSecurityPermissionForAi}
                        onChange={(e) =>
                          setDossier((p) =>
                            p ? { ...p, hasSecurityPermissionForAi: e.target.checked } : p
                          )
                        }
                        className="rounded border-slate-300"
                      />
                      <span>Cho phép gửi nội dung tới dịch vụ AI bên ngoài (Lớp B)</span>
                    </label>
                  )}
                </div>

                {/* Khung thêm câu hỏi thủ công */}
                {showAddQuestionForm && (
                  <form
                    onSubmit={handleAddQuestionToDossier}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                  >
                    <div className="font-bold text-slate-900">
                      Thêm câu hỏi cần rà soát vào hồ sơ "{dossier.title}"
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Dạng câu hỏi:</label>
                        <select
                          value={questionDraft.format}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({
                              ...p,
                              format: e.target.value as ManualQuestionDraft['format'],
                            }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="MULTIPLE_CHOICE">Trắc nghiệm khách quan</option>
                          <option value="SHORT_ANSWER">Trả lời ngắn</option>
                          <option value="ESSAY">Tự luận</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Mức độ nhận thức:
                        </label>
                        <select
                          value={questionDraft.declaredCognitiveLevel}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({
                              ...p,
                              declaredCognitiveLevel:
                                e.target.value as ManualQuestionDraft['declaredCognitiveLevel'],
                            }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Mức 1 – Nhận biết">Mức 1 – Nhận biết</option>
                          <option value="Mức 2 – Thông hiểu">Mức 2 – Thông hiểu</option>
                          <option value="Mức 3 – Vận dụng">Mức 3 – Vận dụng</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Điểm số:</label>
                        <input
                          type="number"
                          step="0.25"
                          min="0.25"
                          value={questionDraft.points}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({ ...p, points: e.target.value }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Đáp án đúng:
                        </label>
                        <input
                          type="text"
                          value={questionDraft.declaredCorrectAnswer}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({
                              ...p,
                              declaredCorrectAnswer: e.target.value,
                            }))
                          }
                          placeholder="VD: A hoặc 24,5 cm2"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Nội dung đề bài câu hỏi:
                      </label>
                      <textarea
                        rows={2}
                        value={questionDraft.stem}
                        onChange={(e) =>
                          setQuestionDraft((p) => ({ ...p, stem: e.target.value }))
                        }
                        placeholder="Nhập nội dung câu hỏi..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    {questionDraft.format === 'MULTIPLE_CHOICE' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        <input
                          type="text"
                          value={questionDraft.optionA}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({ ...p, optionA: e.target.value }))
                          }
                          placeholder="Phương án A"
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                        <input
                          type="text"
                          value={questionDraft.optionB}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({ ...p, optionB: e.target.value }))
                          }
                          placeholder="Phương án B"
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                        <input
                          type="text"
                          value={questionDraft.optionC}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({ ...p, optionC: e.target.value }))
                          }
                          placeholder="Phương án C"
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                        <input
                          type="text"
                          value={questionDraft.optionD}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({ ...p, optionD: e.target.value }))
                          }
                          placeholder="Phương án D"
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Chủ đề / Mạch kiến thức:
                        </label>
                        <input
                          type="text"
                          value={questionDraft.topicTitle}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({ ...p, topicTitle: e.target.value }))
                          }
                          placeholder="Nhập tên chủ đề/bài học..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Hướng dẫn chấm / Biểu điểm chi tiết:
                        </label>
                        <input
                          type="text"
                          value={questionDraft.gradingGuide}
                          onChange={(e) =>
                            setQuestionDraft((p) => ({ ...p, gradingGuide: e.target.value }))
                          }
                          placeholder="Nhập hướng dẫn chấm..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                      >
                        Lưu câu hỏi vào hồ sơ rà soát
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddQuestionForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Danh sách câu hỏi thực tế trong hồ sơ */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Danh sách câu hỏi trong đề ({dossier.questions.length} câu · Tổng {totalCurrentPoints} điểm)
                  </h3>
                  {mathAnalysis?.isMathPrimaryDossier && (
                    <span className="text-xs text-blue-800 font-medium">
                      Đã kích hoạt bộ kiểm chứng tính toán Toán Tiểu học
                    </span>
                  )}
                  {vietnameseAnalysis?.isVietnamesePrimaryDossier && (
                    <span className="text-xs text-blue-800 font-medium">
                      Đã kích hoạt bộ rà soát Ngữ liệu & Viết Tiếng Việt Tiểu học
                    </span>
                  )}
                </div>

                {dossier.questions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Chưa có câu hỏi nào trong hồ sơ rà soát này.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 text-xs">
                    {dossier.questions.map((q) => (
                      <div key={q.questionNumber} className="py-4 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-bold text-slate-900">
                            Câu {q.questionNumber} ({q.questionCode}) · {q.declaredCognitiveLevel} ·{' '}
                            <span className="font-mono">{q.points} điểm</span>
                          </div>
                          <div className="text-slate-500">
                            Chủ đề: {q.topicTitle} · YCCĐ: {q.learningOutcomeCode}
                          </div>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{q.stem}</p>
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt.key}
                                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                              >
                                <b>{opt.key}.</b> {opt.text}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-slate-600 pt-1">
                          <span>
                            Đáp án: <b className="font-mono text-emerald-800">{q.declaredCorrectAnswer || '(Trống)'}</b>
                          </span>
                          <span>Hướng dẫn chấm: {q.gradingGuide || '(Chưa nhập)'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 4: ĐỀ XUẤT CHỈNH SỬA & LỊCH SỬ PHIÊN BẢN
          ===================================================================== */}
          {activeTab === 'tab4-fix-proposals' && reviewExecution && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">
                  Các đề xuất chỉnh sửa từ hệ thống ({reviewExecution.issues.length})
                </h2>
                {reviewExecution.issues.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900">
                    Hồ sơ hiện tại không có cảnh báo cần chỉnh sửa.
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {reviewExecution.issues.map((iss) => (
                      <div
                        key={iss.issueId}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-bold text-slate-900">
                            [{iss.issueCode}] {iss.locationLabel} — {iss.issueCategoryLabel}
                          </div>
                          {renderSeverityLabel(iss.severity, iss.severityLabel)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-white border border-slate-200">
                            <div className="font-semibold text-slate-700">Nội dung gốc:</div>
                            <p className="mt-1 text-slate-800">{iss.currentContent}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white border border-emerald-200">
                            <div className="font-semibold text-emerald-900">Đề xuất điều chỉnh:</div>
                            <p className="mt-1 text-slate-800">{iss.proposedFix}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {iss.replacementDraft && iss.status !== 'ACCEPTED_PROPOSAL' && (
                            <button
                              type="button"
                              onClick={() => handleAcceptProposal(iss)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Chấp nhận đề xuất & tạo phiên bản mới</span>
                            </button>
                          )}
                          {iss.status !== 'RESOLVED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateIssueStatus(iss, 'RESOLVED')}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold cursor-pointer"
                            >
                              Đánh dấu đã tự chỉnh sửa
                            </button>
                          )}
                          {iss.status !== 'REJECTED_PROPOSAL' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateIssueStatus(iss, 'REJECTED_PROPOSAL')}
                              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold cursor-pointer"
                            >
                              Từ chối đề xuất
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lịch sử phiên bản */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-800" />
                  <span>Lịch sử chỉnh sửa phiên bản ({versionHistory.length})</span>
                </h3>
                {versionHistory.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Chưa có thay đổi phiên bản nào được áp dụng trong phiên rà soát này.
                  </p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {versionHistory.map((ver) => (
                      <div
                        key={ver.versionId}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-slate-900">
                          <span>
                            Phiên bản {ver.versionLabel} · Áp dụng mã {ver.appliedIssueCode} ({ver.locationLabel})
                          </span>
                          <span className="font-mono text-slate-500">{ver.timestamp}</span>
                        </div>
                        <div className="text-slate-600">Trước: {ver.beforeSnapshot}</div>
                        <div className="text-emerald-900 font-medium">Sau: {ver.afterSnapshot}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: CẤU HÌNH 10 NHÓM TIÊU CHÍ KIỂM TRA CHUYÊN MÔN
          ===================================================================== */}
          {activeTab === 'tab2-criteria-setup' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    10 nhóm tiêu chí kiểm tra chất lượng chuyên môn
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Áp dụng cho Chương trình GDPT 2018 ({dossier.assessmentRuleSet}).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEnabledGroups({
                      GROUP_01_CURRICULUM: true,
                      GROUP_02_MATRIX: true,
                      GROUP_03_SPECIFICATION: true,
                      GROUP_04_KNOWLEDGE: true,
                      GROUP_05_QUESTION_STEM: true,
                      GROUP_06_MULTIPLE_CHOICE: true,
                      GROUP_07_ESSAY: true,
                      GROUP_08_ANSWER_AND_RUBRIC: true,
                      GROUP_09_LANGUAGE_AND_FORMAT: true,
                      GROUP_10_OVERALL_QUALITY: true,
                    })
                  }
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Bật tất cả 10 nhóm
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {QUALITY_INSPECTION_GROUPS.map((grp) => {
                  const checked = enabledGroups[grp.id];
                  return (
                    <label
                      key={grp.id}
                      className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                        checked
                          ? 'bg-white border-blue-300'
                          : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setEnabledGroups((prev) => ({
                            ...prev,
                            [grp.id]: e.target.checked,
                          }))
                        }
                        className="mt-1 rounded border-slate-300"
                      />
                      <div className="space-y-1.5">
                        <div className="font-bold text-slate-900">{grp.fullTitle}</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                          {grp.criteriaItems.map((ci, idx) => (
                            <li key={idx}>{ci}</li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL KHỞI TẠO HỒ SƠ RÀ SOÁT TRỰC TIẾP */}
      {showManualBuilderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Khởi tạo hồ sơ rà soát đề kiểm tra trực tiếp
            </h3>
            <p className="text-xs text-slate-600">
              Dùng khi Thầy/Cô muốn nhập nhanh câu hỏi của một đề kiểm tra đang biên soạn để AI kiểm tra chất lượng trước khi lưu chính thức.
            </p>
            <form onSubmit={handleCreateManualDossier} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên đề kiểm tra:
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="VD: Đề kiểm tra Giữa học kỳ I"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Môn học:</label>
                  <select
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {allowedSubjects.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khối lớp:</label>
                  <select
                    value={manualGrade}
                    onChange={(e) => setManualGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {allowedGrades.map((g) => (
                      <option key={g} value={g}>
                        Lớp {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kỳ kiểm tra:</label>
                  <select
                    value={manualExamPeriod}
                    onChange={(e) => setManualExamPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Giữa học kỳ I">Giữa học kỳ I</option>
                    <option value="Cuối học kỳ I">Cuối học kỳ I</option>
                    <option value="Giữa học kỳ II">Giữa học kỳ II</option>
                    <option value="Cuối năm học">Cuối năm học</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Thời lượng (phút):
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value) || 45)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tổng điểm:</label>
                  <input
                    type="number"
                    step="0.5"
                    min={1}
                    max={100}
                    value={manualTargetPoints}
                    onChange={(e) => setManualTargetPoints(Number(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualBuilderModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold cursor-pointer"
                >
                  Khởi tạo & Thêm câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN LÀM SẠCH DỮ LIỆU MẪU */}
      {showCleanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Làm sạch dữ liệu mẫu & hồ sơ thử nghiệm
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thao tác này sẽ dọn sạch toàn bộ đề mẫu, ma trận mẫu và hồ sơ kiểm thử tồn dư, đồng thời giữ nguyên 100% các câu hỏi, ma trận và đề kiểm tra chính thức do giáo viên biên soạn.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isCleaningData}
                onClick={() => setShowCleanModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={isCleaningData}
                onClick={handleConfirmCleanSampleData}
                className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
              >
                {isCleaningData ? 'Đang làm sạch...' : 'Xác nhận làm sạch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
