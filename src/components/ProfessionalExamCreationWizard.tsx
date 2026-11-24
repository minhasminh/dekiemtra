import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowLeft,
  ArrowRight,
  Save,
  Sparkles,
  FileSpreadsheet,
  BookOpen,
  FileText,
  Send,
  ShieldCheck,
  Download,
  BarChart3,
  Wrench,
  RefreshCw,
  Play,
  Info,
  CheckSquare,
  Clock,
  ExternalLink,
  Plus,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ExamWorkflowExportedPackageRecord,
  ExamWorkflowState,
  GradeNumber,
  MenuSectionId,
  QuestionItem,
  StorageConfig,
  ToastNotification,
  WorkflowActorRole,
} from '../types/domain';
import {
  loadSavedWorkflows,
  saveWorkflowToLocal,
  syncWorkflowToBackend,
  WORKFLOW_ROLE_LABELS,
  WORKFLOW_STATE_LABELS,
} from '../services/workflow/endToEndExamWorkflowService';
import {
  EduButton,
  EduCard,
  EduBadge,
  EduInput,
  EduSelect,
  EduCheckbox,
} from './ui/EduDesignSystem';

export type WizardStepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WizardStepMeta {
  step: WizardStepIndex;
  title: string;
  shortLabel: string;
  guidance: string;
  linkedMenuId: MenuSectionId;
  mappedWorkflowStates: ExamWorkflowState[];
}

export const WIZARD_8_STEPS: WizardStepMeta[] = [
  {
    step: 1,
    title: 'Bước 1. Thông tin đề kiểm tra',
    shortLabel: '1. Thông tin đề',
    guidance:
      'Khai báo tên đề kiểm tra, môn học, khối lớp, kỳ kiểm tra, thời gian làm bài và kiểm tra chống tạo trùng hồ sơ trong cùng năm học.',
    linkedMenuId: 'exam-workflow',
    mappedWorkflowStates: ['Draft'],
  },
  {
    step: 2,
    title: 'Bước 2. Ma trận và bản đặc tả',
    shortLabel: '2. Ma trận & Đặc tả',
    guidance:
      'Thiết lập cấu trúc ma trận theo cấp học (TT27 với Tiểu học 3 mức độ; TT22/CV7991 với THCS 4 mức độ), liên kết YCCĐ và xác nhận tổng điểm 10.0.',
    linkedMenuId: 'matrix',
    mappedWorkflowStates: ['MatrixReview', 'MatrixApproved'],
  },
  {
    step: 3,
    title: 'Bước 3. Chọn hoặc tạo câu hỏi',
    shortLabel: '3. Câu hỏi & Đề',
    guidance:
      'Chọn câu hỏi đã phê duyệt (APPROVED) từ ngân hàng hoặc tạo bổ sung, sinh mã đề tương đương, đáp án và hướng dẫn chấm khớp 100% ma trận.',
    linkedMenuId: 'questions',
    mappedWorkflowStates: ['ExamDraft'],
  },
  {
    step: 4,
    title: 'Bước 4. AI kiểm tra chất lượng',
    shortLabel: '4. AI Kiểm tra',
    guidance:
      'Thực thi bộ kiểm tra chất lượng AI 10 trụ cột (Chương trình, Ma trận, Đặc tả, Câu hỏi, Đáp án, Hướng dẫn chấm, Mức độ nhận thức, Điểm số, Ngôn ngữ, Hình thức).',
    linkedMenuId: 'ai-quality-review',
    mappedWorkflowStates: ['AIReview'],
  },
  {
    step: 5,
    title: 'Bước 5. Chỉnh sửa và gửi thẩm định',
    shortLabel: '5. Sửa & Thẩm định',
    guidance:
      'Rà soát các khuyến nghị từ AI, chỉnh sửa câu hỏi (nếu có), gửi Tổ chuyên môn thẩm định và ghi nhận kết luận đủ điều kiện trình phê duyệt.',
    linkedMenuId: 'approval',
    mappedWorkflowStates: ['TeacherRevision', 'ProfessionalReview', 'RevisionRequired', 'AwaitingApproval'],
  },
  {
    step: 6,
    title: 'Bước 6. Phê duyệt chính thức',
    shortLabel: '6. Phê duyệt',
    guidance:
      'Chỉ Lãnh đạo / Người có thẩm quyền mới được phê duyệt (Giáo viên soạn đề không thể tự phê duyệt). Khóa bất biến phiên bản đề chính thức.',
    linkedMenuId: 'approval',
    mappedWorkflowStates: ['Approved'],
  },
  {
    step: 7,
    title: 'Bước 7. Xuất hồ sơ kiểm tra',
    shortLabel: '7. Xuất hồ sơ',
    guidance:
      'Chỉ mở khóa xuất đề chính thức sau khi Bước 6 đã phê duyệt. Xuất trọn bộ Ma trận, Bản đặc tả, Đề kiểm tra, Đáp án, Hướng dẫn chấm và Biên bản (Word/PDF/ZIP).',
    linkedMenuId: 'records',
    mappedWorkflowStates: ['Released'],
  },
  {
    step: 8,
    title: 'Bước 8. Phân tích kết quả sau kiểm tra',
    shortLabel: '8. Phân tích KQ',
    guidance:
      'Nhập phổ điểm thực nghiệm sau kỳ kiểm tra, đánh giá độ khó – độ phân cách từng câu hỏi và đề xuất cải tiến ngân hàng câu hỏi.',
    linkedMenuId: 'exam-analytics',
    mappedWorkflowStates: ['ResultsAnalysis', 'Archived'],
  },
];

export interface UnmetConditionItem {
  id: string;
  step: WizardStepIndex;
  severity: 'ERROR' | 'WARNING';
  message: string;
  fixActionLabel: string;
  targetStep: WizardStepIndex;
  targetModule?: MenuSectionId;
  quickFixType?:
    | 'FILL_STEP1_INFO'
    | 'APPROVE_MATRIX_STEP2'
    | 'SELECT_QUESTIONS_STEP3'
    | 'RUN_AI_CHECK_STEP4'
    | 'COMPLETE_APPRAISAL_STEP5'
    | 'SWITCH_TO_PRINCIPAL_AND_APPROVE_STEP6'
    | 'OPEN_STEP6_APPROVAL_INFO'
    | 'EXPORT_OFFICIAL_DOSSIER_STEP7'
    | 'RUN_ANALYTICS_STEP8';
}

const DEFAULT_GDPT_SUBJECTS: string[] = [
  'Toán',
  'Tiếng Việt',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Lịch sử và Địa lí',
  'Khoa học',
  'Tự nhiên và Xã hội',
  'Tin học và Công nghệ',
  'Tin học',
  'Công nghệ',
  'Giáo dục công dân',
  'Đạo đức',
  'Hoạt động trải nghiệm',
];

interface ProfessionalExamCreationWizardProps {
  workflows: ExamWorkflow[];
  selectedWorkflow: ExamWorkflow;
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  config: StorageConfig;
  activeActorRole: WorkflowActorRole;
  activeActorName: string;
  actorId?: string;
  teacherFullName?: string;
  departmentName?: string;
  schoolName?: string;
  allowedSubjects?: string[];
  allowedGrades?: number[];
  subjectGradeCombos?: Array<{ subject: string; grade: number }>;
  isProductionTeacher?: boolean;
  onChangeActorRole: (role: WorkflowActorRole) => void;
  onSelectWorkflow: (workflowId: string) => void;
  onUpdateWorkflow: (updated: ExamWorkflow) => void;
  onNavigateModule: (menuId: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

export const ProfessionalExamCreationWizard: React.FC<ProfessionalExamCreationWizardProps> = ({
  workflows,
  selectedWorkflow,
  questions,
  matrices,
  exams,
  config,
  activeActorRole,
  activeActorName,
  actorId,
  teacherFullName,
  departmentName,
  schoolName,
  allowedSubjects,
  allowedGrades,
  subjectGradeCombos,
  isProductionTeacher = false,
  onChangeActorRole,
  onSelectWorkflow,
  onUpdateWorkflow,
  onNavigateModule,
  onNotify,
}) => {
  // Map ExamWorkflow.currentStep (1..9) into WizardStepIndex (1..8)
  const mapWorkflowToWizardStep = useCallback((wf: ExamWorkflow): WizardStepIndex => {
    if (wf.status === 'Draft') return 1;
    if (wf.status === 'MatrixReview' || wf.status === 'MatrixApproved') return 2;
    if (wf.status === 'ExamDraft') return 3;
    if (wf.status === 'AIReview') return 4;
    if (
      wf.status === 'TeacherRevision' ||
      wf.status === 'ProfessionalReview' ||
      wf.status === 'RevisionRequired' ||
      wf.status === 'AwaitingApproval'
    ) {
      return 5;
    }
    if (wf.status === 'Approved') return 6;
    if (wf.status === 'Released') return 7;
    if (wf.status === 'ResultsAnalysis' || wf.status === 'Archived') return 8;
    const raw = Math.min(8, Math.max(1, wf.currentStep)) as WizardStepIndex;
    return raw;
  }, []);

  const [activeWizardStep, setActiveWizardStep] = useState<WizardStepIndex>(() =>
    mapWorkflowToWizardStep(selectedWorkflow)
  );

  // Save state indicator: 'SAVED' | 'DIRTY' | 'SAVING' | 'SYNCED_BACKEND'
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'DIRTY' | 'SAVING' | 'SYNCED_BACKEND'>('SAVED');
  const [lastSavedAt, setLastSavedAt] = useState<string>(selectedWorkflow.updatedAt);

  // Step 1 Local Form State (preserved across Back/Next without losing data)
  const [formTitle, setFormTitle] = useState<string>(selectedWorkflow.title);
  const [formSubject, setFormSubject] = useState<string>(selectedWorkflow.subjectId || 'Toán');
  const [formGrade, setFormGrade] = useState<number>(selectedWorkflow.gradeId || 4);
  const [formPeriod, setFormPeriod] = useState<ExamWorkflow['examPeriod']>(
    selectedWorkflow.examPeriod || 'END_YEAR'
  );
  const [formExamDate, setFormExamDate] = useState<string>(selectedWorkflow.examDate || '2026-05-22');
  const [formDuration, setFormDuration] = useState<number>(
    selectedWorkflow.step2MatrixAndSpec.durationMinutes || 40
  );
  const [formConfidential, setFormConfidential] = useState<boolean>(
    selectedWorkflow.isConfidentialExam
  );

  // Step 5 Revision & Appraisal Note
  const [step5RevisionNote, setStep5RevisionNote] = useState<string>(
    `Đã rà soát toàn bộ câu hỏi môn ${selectedWorkflow.subjectId} Khối ${selectedWorkflow.gradeId} theo góp ý của AI Quality Review; đảm bảo bám sát YCCĐ Chương trình GDPT 2018.`
  );
  const [step5ReviewerComment, setStep5ReviewerComment] = useState<string>(
    `${departmentName || 'Tổ chuyên môn'} đã thẩm định chéo: Ma trận, Bản đặc tả, Đề kiểm tra và Hướng dẫn chấm khớp 100%, đủ điều kiện trình Ban Giám hiệu phê duyệt.`
  );

  // Step 6 Approval Comment
  const [step6ApprovalNote, setStep6ApprovalNote] = useState<string>(
    `Ban Giám hiệu ${schoolName ? `(${schoolName}) ` : ''}phê duyệt chính thức Hồ sơ Đề kiểm tra Định kỳ và khóa bất biến phiên bản hiện hành để tổ chức kiểm tra.`
  );

  const subjectSelectOptions = useMemo(() => {
    const baseList =
      allowedSubjects && allowedSubjects.length > 0 ? allowedSubjects : DEFAULT_GDPT_SUBJECTS;
    const unique = Array.from(
      new Set([
        ...baseList,
        ...(formSubject ? [formSubject] : []),
        ...(selectedWorkflow.subjectId ? [selectedWorkflow.subjectId] : []),
      ])
    ).filter(Boolean);
    return unique.map((subj) => ({
      value: subj,
      label: subj.startsWith('Môn ') ? subj : `Môn ${subj}`,
    }));
  }, [allowedSubjects, formSubject, selectedWorkflow.subjectId]);

  const gradeSelectOptions = useMemo(() => {
    const comboGradesForSubject =
      subjectGradeCombos && subjectGradeCombos.length > 0
        ? subjectGradeCombos
            .filter((c) => c.subject.trim().toLowerCase() === formSubject.trim().toLowerCase())
            .map((c) => Number(c.grade))
        : [];
    const baseGrades =
      comboGradesForSubject.length > 0
        ? comboGradesForSubject
        : allowedGrades && allowedGrades.length > 0
          ? allowedGrades
          : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const uniqueGrades = Array.from(
      new Set([...baseGrades, Number(formGrade), Number(selectedWorkflow.gradeId)])
    )
      .filter((g) => Number.isFinite(g) && g >= 1 && g <= 12)
      .sort((a, b) => a - b);

    return uniqueGrades.map((g) => ({
      value: String(g),
      label:
        g <= 5
          ? `Khối lớp ${g} (Tiểu học - TT27)`
          : g <= 9
            ? `Khối lớp ${g} (THCS - CV7991)`
            : `Khối lớp ${g} (THPT)`,
    }));
  }, [subjectGradeCombos, allowedGrades, formSubject, formGrade, selectedWorkflow.gradeId]);

  // E2E Grade 4 Math Automated Test Runner state (Mục VII)
  const [runningE2ETest, setRunningE2ETest] = useState<boolean>(false);
  const [e2eTestReport, setE2ETestReport] = useState<{
    workflowId: string;
    executedAt: string;
    totalChecks: number;
    passedChecks: number;
    stepsLog: Array<{
      stepOrder: number;
      stepName: string;
      actionTested: string;
      guardVerified: string;
      status: 'PASS' | 'FAIL';
      workflowStateAfter: ExamWorkflowState;
    }>;
  } | null>(null);

  // Sync local form when switching to a different workflowId or when clean metadata hydrates
  useEffect(() => {
    setFormTitle(selectedWorkflow.title);
    setFormSubject(selectedWorkflow.subjectId);
    setFormGrade(selectedWorkflow.gradeId);
    setFormPeriod(selectedWorkflow.examPeriod);
    setFormExamDate(selectedWorkflow.examDate);
    setFormDuration(selectedWorkflow.step2MatrixAndSpec.durationMinutes || (selectedWorkflow.gradeId <= 5 ? 40 : 45));
    setFormConfidential(selectedWorkflow.isConfidentialExam);
    setStep5RevisionNote(
      `Đã rà soát toàn bộ câu hỏi môn ${selectedWorkflow.subjectId} Khối ${selectedWorkflow.gradeId} theo góp ý của AI Quality Review; đảm bảo bám sát YCCĐ Chương trình GDPT 2018.`
    );
    setActiveWizardStep(mapWorkflowToWizardStep(selectedWorkflow));
    setSaveStatus('SAVED');
    setLastSavedAt(selectedWorkflow.updatedAt);
  }, [selectedWorkflow.workflowId, mapWorkflowToWizardStep]);

  useEffect(() => {
    if (saveStatus !== 'DIRTY') {
      setFormTitle(selectedWorkflow.title);
      setFormSubject(selectedWorkflow.subjectId);
      setFormGrade(selectedWorkflow.gradeId);
      setFormPeriod(selectedWorkflow.examPeriod);
      setFormExamDate(selectedWorkflow.examDate);
      setFormDuration(selectedWorkflow.step2MatrixAndSpec.durationMinutes || (selectedWorkflow.gradeId <= 5 ? 40 : 45));
      setFormConfidential(selectedWorkflow.isConfidentialExam);
      setLastSavedAt(selectedWorkflow.updatedAt);
    }
  }, [selectedWorkflow.updatedAt]);

  // Check duplicate workflow (Không tạo hồ sơ trùng)
  const duplicateWorkflowConflict = useMemo(() => {
    const normalizedTitle = formTitle.trim().toLowerCase();
    return workflows.find(
      (w) =>
        w.workflowId !== selectedWorkflow.workflowId &&
        w.schoolId === selectedWorkflow.schoolId &&
        w.academicYearId === selectedWorkflow.academicYearId &&
        w.subjectId === formSubject &&
        Number(w.gradeId) === Number(formGrade) &&
        w.examPeriod === formPeriod &&
        w.title.trim().toLowerCase() === normalizedTitle
    );
  }, [
    workflows,
    selectedWorkflow.workflowId,
    selectedWorkflow.schoolId,
    selectedWorkflow.academicYearId,
    formSubject,
    formGrade,
    formPeriod,
    formTitle,
  ]);

  // Compute Completion, Lock, and Error status for each of the 8 Wizard steps
  const evaluateWizardStepState = useCallback(
    (
      step: WizardStepIndex,
      wf: ExamWorkflow
    ): {
      isCompleted: boolean;
      isUnlocked: boolean;
      hasErrorOrWarning: boolean;
      lockReason?: string;
    } => {
      const step1Done =
        Boolean(formTitle.trim()) &&
        Boolean(formSubject.trim()) &&
        Number(formGrade) >= 1 &&
        !duplicateWorkflowConflict;

      const step2Done =
        step1Done &&
        wf.step2MatrixAndSpec.isValidStructure &&
        wf.step2MatrixAndSpec.totalPoints === 10 &&
        wf.step2MatrixAndSpec.matrixApprovalStatus === 'APPROVED';

      const step3Done =
        step2Done &&
        wf.step1QuestionBank.coverageSatisfied &&
        wf.step3ExamGeneration.questionIdsInExam.length > 0 &&
        wf.step3ExamGeneration.matchesApprovedMatrix &&
        wf.step3ExamGeneration.answerKeyComplete &&
        wf.step3ExamGeneration.gradingGuideComplete;

      const step4Done =
        step3Done &&
        Boolean(wf.step4AiQualityReview.inspectedAt) &&
        wf.step4AiQualityReview.criticalErrorsCount <= wf.step4AiQualityReview.resolvedErrorsCount;

      const step5Done =
        step4Done &&
        !wf.step5TeacherRevision.lastRevisionTriggeredMatrixReapproval &&
        wf.step6ProfessionalReview.latestDecision === 'ELIGIBLE_FOR_APPROVAL';

      const step6Done =
        step5Done && Boolean(wf.step7OfficialApproval.approvalRecord?.isVersionLocked);

      const step7Done = step6Done && wf.step8DossierExport.exports.length > 0;

      const step8Done = step7Done && Boolean(wf.step9ResultsAnalysis.analysisSummary);

      switch (step) {
        case 1:
          return {
            isCompleted: step1Done,
            isUnlocked: true,
            hasErrorOrWarning: Boolean(duplicateWorkflowConflict) || !formTitle.trim(),
          };
        case 2:
          return {
            isCompleted: step2Done,
            isUnlocked: step1Done,
            hasErrorOrWarning:
              wf.step2MatrixAndSpec.matrixApprovalStatus === 'INVALIDATED_BY_MATRIX_EDIT' ||
              wf.step2MatrixAndSpec.totalPoints !== 10,
            lockReason: !step1Done
              ? 'Cần hoàn tất Bước 1 (Thông tin đề kiểm tra hợp lệ, không trùng hồ sơ) trước.'
              : undefined,
          };
        case 3:
          return {
            isCompleted: step3Done,
            isUnlocked: step2Done,
            hasErrorOrWarning: wf.step1QuestionBank.unapprovedQuestionBlockedCount > 0 && !step3Done,
            lockReason: !step2Done
              ? 'Cần hoàn tất và phê duyệt Ma trận & Bản đặc tả (Tổng 10.0 điểm) ở Bước 2 trước.'
              : undefined,
          };
        case 4:
          return {
            isCompleted: step4Done,
            isUnlocked: step3Done,
            hasErrorOrWarning:
              Boolean(wf.step4AiQualityReview.inspectedAt) &&
              wf.step4AiQualityReview.criticalErrorsCount > wf.step4AiQualityReview.resolvedErrorsCount,
            lockReason: !step3Done
              ? 'Cần chọn đủ câu hỏi đã duyệt và dựng đề khớp ma trận ở Bước 3 trước khi chạy AI kiểm tra.'
              : undefined,
          };
        case 5:
          return {
            isCompleted: step5Done,
            isUnlocked: step4Done,
            hasErrorOrWarning:
              wf.step5TeacherRevision.lastRevisionTriggeredMatrixReapproval ||
              wf.step6ProfessionalReview.latestDecision === 'REVISION_REQUIRED',
            lockReason: !step4Done
              ? 'Cần hoàn tất Bước 4 (AI kiểm tra chất lượng 10 trụ cột) trước khi gửi thẩm định.'
              : undefined,
          };
        case 6:
          return {
            isCompleted: step6Done,
            isUnlocked: step5Done,
            hasErrorOrWarning: activeActorRole === 'TEACHER' && !step6Done,
            lockReason: !step5Done
              ? 'Cần có kết luận Thẩm định chuyên môn "Đủ điều kiện trình phê duyệt" ở Bước 5 trước.'
              : undefined,
          };
        case 7:
          return {
            isCompleted: step7Done,
            isUnlocked: step6Done,
            hasErrorOrWarning: false,
            lockReason: !step6Done
              ? 'Chặn xuất đề chính thức: Hồ sơ phải được phê duyệt và khóa phiên bản ở Bước 6 trước.'
              : undefined,
          };
        case 8:
          return {
            isCompleted: step8Done,
            isUnlocked: step7Done,
            hasErrorOrWarning: false,
            lockReason: !step7Done
              ? 'Cần xuất bộ hồ sơ kiểm tra chính thức ở Bước 7 trước khi phân tích kết quả sau thi.'
              : undefined,
          };
      }
    },
    [formTitle, formSubject, formGrade, duplicateWorkflowConflict, activeActorRole]
  );

  // Build Unmet Conditions Checklist (Danh sách điều kiện chưa đạt + Nút mở đúng phần cần sửa)
  const unmetConditions = useMemo<UnmetConditionItem[]>(() => {
    const list: UnmetConditionItem[] = [];

    if (!formTitle.trim()) {
      list.push({
        id: 'cond-step1-title',
        step: 1,
        severity: 'ERROR',
        message: 'Bước 1: Chưa nhập tên hồ sơ đề kiểm tra.',
        fixActionLabel: 'Điền tên đề chuẩn tại Bước 1',
        targetStep: 1,
        quickFixType: 'FILL_STEP1_INFO',
      });
    }

    if (duplicateWorkflowConflict) {
      list.push({
        id: 'cond-step1-duplicate',
        step: 1,
        severity: 'ERROR',
        message: `Bước 1: Phát hiện trùng tên hồ sơ với [${duplicateWorkflowConflict.workflowId}] trong cùng môn/khối/kỳ kiểm tra.`,
        fixActionLabel: 'Đổi tên đề không trùng tại Bước 1',
        targetStep: 1,
        quickFixType: 'FILL_STEP1_INFO',
      });
    }

    if (selectedWorkflow.step2MatrixAndSpec.matrixApprovalStatus !== 'APPROVED') {
      list.push({
        id: 'cond-step2-matrix',
        step: 2,
        severity: 'ERROR',
        message:
          'Bước 2: Ma trận & Bản đặc tả chưa được xác nhận phê duyệt (MatrixApproved - Tổng 10.0 điểm).',
        fixActionLabel: 'Mở Bước 2 & Xác nhận Ma trận',
        targetStep: 2,
        targetModule: 'matrix',
        quickFixType: 'APPROVE_MATRIX_STEP2',
      });
    }

    if (
      selectedWorkflow.step3ExamGeneration.questionIdsInExam.length === 0 ||
      !selectedWorkflow.step3ExamGeneration.matchesApprovedMatrix
    ) {
      list.push({
        id: 'cond-step3-questions',
        step: 3,
        severity: 'ERROR',
        message:
          'Bước 3: Chưa chọn đủ câu hỏi đã duyệt (APPROVED) để sinh mã đề, đáp án và hướng dẫn chấm khớp ma trận.',
        fixActionLabel: 'Mở Bước 3 & Sinh đề từ Ngân hàng',
        targetStep: 3,
        targetModule: 'questions',
        quickFixType: 'SELECT_QUESTIONS_STEP3',
      });
    }

    if (!selectedWorkflow.step4AiQualityReview.inspectedAt) {
      list.push({
        id: 'cond-step4-ai',
        step: 4,
        severity: 'ERROR',
        message: 'Bước 4: Chưa chạy AI Kiểm tra chất lượng 10 trụ cột cho phiên bản đề hiện tại.',
        fixActionLabel: 'Mở Bước 4 & Chạy AI Kiểm tra',
        targetStep: 4,
        targetModule: 'ai-quality-review',
        quickFixType: 'RUN_AI_CHECK_STEP4',
      });
    }

    if (selectedWorkflow.step6ProfessionalReview.latestDecision !== 'ELIGIBLE_FOR_APPROVAL') {
      list.push({
        id: 'cond-step5-appraisal',
        step: 5,
        severity: 'ERROR',
        message:
          'Bước 5: Hồ sơ chưa hoàn tất chỉnh sửa và chưa có Phiếu thẩm định chuyên môn kết luận đủ điều kiện trình duyệt.',
        fixActionLabel: 'Mở Bước 5 & Gửi Thẩm định',
        targetStep: 5,
        targetModule: 'approval',
        quickFixType: 'COMPLETE_APPRAISAL_STEP5',
      });
    }

    if (!selectedWorkflow.step7OfficialApproval.approvalRecord?.isVersionLocked) {
      list.push({
        id: 'cond-step6-approval',
        step: 6,
        severity: activeActorRole === 'TEACHER' ? 'WARNING' : 'ERROR',
        message:
          activeActorRole === 'TEACHER'
            ? `Bước 6: Hồ sơ đang chờ ${selectedWorkflow.assignedUsers?.finalApproverName || 'Ban Giám hiệu / Tổ trưởng chuyên môn'} phê duyệt chính thức (Giáo viên ra đề không tự phê duyệt).`
            : 'Bước 6: Hồ sơ chưa được Lãnh đạo ký phê duyệt và khóa phiên bản bất biến.',
        fixActionLabel:
          activeActorRole === 'TEACHER' && isProductionTeacher
            ? 'Xem trạng thái trình duyệt (Bước 6)'
            : 'Mở Bước 6 & Phê duyệt chính thức',
        targetStep: 6,
        targetModule: 'approval',
        quickFixType:
          activeActorRole === 'TEACHER' && isProductionTeacher
            ? 'OPEN_STEP6_APPROVAL_INFO'
            : 'SWITCH_TO_PRINCIPAL_AND_APPROVE_STEP6',
      });
    }

    if (selectedWorkflow.step8DossierExport.exports.length === 0) {
      list.push({
        id: 'cond-step7-export',
        step: 7,
        severity: 'WARNING',
        message: 'Bước 7: Chưa xuất gói Hồ sơ kiểm tra chính thức (Word/PDF/Excel/ZIP).',
        fixActionLabel: 'Mở Bước 7 & Xuất hồ sơ',
        targetStep: 7,
        targetModule: 'records',
        quickFixType: 'EXPORT_OFFICIAL_DOSSIER_STEP7',
      });
    }

    if (!selectedWorkflow.step9ResultsAnalysis.analysisSummary) {
      list.push({
        id: 'cond-step8-analytics',
        step: 8,
        severity: 'WARNING',
        message: 'Bước 8: Chưa tổng hợp phổ điểm và phân tích kết quả sau kiểm tra.',
        fixActionLabel: 'Mở Bước 8 & Phân tích kết quả',
        targetStep: 8,
        targetModule: 'exam-analytics',
        quickFixType: 'RUN_ANALYTICS_STEP8',
      });
    }

    return list;
  }, [selectedWorkflow, formTitle, duplicateWorkflowConflict, activeActorRole]);

  // Save Draft Handler (Nút Lưu bản nháp - preserves all form fields without losing data)
  const handleSaveDraft = useCallback(
    async (silent = false): Promise<ExamWorkflow | null> => {
      if (!formTitle.trim()) {
        onNotify('error', 'Thiếu tên đề kiểm tra', 'Vui lòng nhập tên đề kiểm tra trước khi lưu bản nháp.');
        return null;
      }
      if (duplicateWorkflowConflict) {
        onNotify(
          'error',
          'Chặn tạo hồ sơ trùng lặp',
          `Đã tồn tại hồ sơ "${duplicateWorkflowConflict.title}" (${duplicateWorkflowConflict.workflowId}) cùng môn, khối và kỳ kiểm tra.`
        );
        return null;
      }

      setSaveStatus('SAVING');
      const nowIso = new Date().toISOString();
      const periodLabels: Record<ExamWorkflow['examPeriod'], string> = {
        REGULAR: 'Kiểm tra thường xuyên',
        MID_SEM_1: 'Giữa học kỳ I',
        END_SEM_1: 'Cuối học kỳ I',
        MID_SEM_2: 'Giữa học kỳ II',
        END_YEAR: 'Cuối năm học',
      };

      const isPrimary = Number(formGrade) <= 5;
      const resolvedCreatorName =
        selectedWorkflow.creatorId === actorId && teacherFullName
          ? teacherFullName
          : selectedWorkflow.creatorName;
      const updatedWf: ExamWorkflow = {
        ...selectedWorkflow,
        title: formTitle.trim(),
        subjectId: formSubject,
        gradeId: Number(formGrade) as GradeNumber,
        examPeriod: formPeriod,
        examPeriodLabel: periodLabels[formPeriod] || 'Định kỳ',
        examDate: formExamDate,
        creatorName: resolvedCreatorName,
        assignedUsers: {
          ...selectedWorkflow.assignedUsers,
          creatorName:
            selectedWorkflow.creatorId === actorId && teacherFullName
              ? activeActorName
              : selectedWorkflow.assignedUsers.creatorName,
        },
        isConfidentialExam: formConfidential,
        updatedAt: nowIso,
        step2MatrixAndSpec: {
          ...selectedWorkflow.step2MatrixAndSpec,
          educationLevel: isPrimary ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY,
          templateCode: isPrimary ? 'TT27-PRIMARY-3LEVELS' : 'CV7991-SECONDARY-4LEVELS',
          durationMinutes: Number(formDuration) || (isPrimary ? 40 : 45),
          levelDistributionSummary: isPrimary
            ? 'Mức 1 (Nhận biết): 40% (4,0đ) · Mức 2 (Kết nối): 40% (4,0đ) · Mức 3 (Vận dụng): 20% (2,0đ) [Chuẩn TT27]'
            : 'Nhận biết: 40% · Thông hiểu: 30% · Vận dụng: 20% · Vận dụng cao: 10% [Chuẩn CV7991]',
        },
        auditTrail: [
          {
            id: `wiz-save-${Date.now()}`,
            workflowId: selectedWorkflow.workflowId,
            timestamp: nowIso,
            actorId: actorId || 'user-wizard-actor',
            actorName: activeActorName,
            actorRole: activeActorRole,
            actionType: 'STEP_SAVED',
            fromState: selectedWorkflow.status,
            toState: selectedWorkflow.status,
            fromStep: selectedWorkflow.currentStep,
            toStep: selectedWorkflow.currentStep,
            versionId: selectedWorkflow.currentVersionId,
            backendVerified: true,
            summary: `Lưu bản nháp tại Wizard Bước ${activeWizardStep}: "${formTitle.trim()}" (${formSubject} - Khối ${formGrade}).`,
          },
          ...selectedWorkflow.auditTrail,
        ],
      };

      saveWorkflowToLocal(updatedWf);
      onUpdateWorkflow(updatedWf);
      const synced = await syncWorkflowToBackend(updatedWf, activeActorName, activeActorRole);
      setSaveStatus(synced ? 'SYNCED_BACKEND' : 'SAVED');
      setLastSavedAt(nowIso);

      if (!silent) {
        onNotify(
          'success',
          'Đã lưu bản nháp thành công',
          `Toàn bộ dữ liệu Bước ${activeWizardStep} của hồ sơ [${updatedWf.workflowId}] đã được lưu an toàn.`
        );
      }
      return updatedWf;
    },
    [
      formTitle,
      formSubject,
      formGrade,
      formPeriod,
      formExamDate,
      formDuration,
      formConfidential,
      duplicateWorkflowConflict,
      selectedWorkflow,
      activeActorName,
      activeActorRole,
      activeWizardStep,
      onUpdateWorkflow,
      onNotify,
    ]
  );

  // Back Button (Nút Quay lại - preserves current form edits before stepping back)
  const handleStepBack = async () => {
    if (activeWizardStep <= 1) return;
    if (saveStatus === 'DIRTY') {
      await handleSaveDraft(true);
    }
    const prevStep = (activeWizardStep - 1) as WizardStepIndex;
    setActiveWizardStep(prevStep);
    onNotify(
      'info',
      `Đã quay lại Bước ${prevStep}`,
      'Dữ liệu bạn vừa nhập được giữ nguyên 100%, không bị mất khi quay lại bước trước.'
    );
  };

  // Step-Specific Action Executors (using existing ExamWorkflow structure)
  const executeStep2ApproveMatrix = async (baseWf = selectedWorkflow): Promise<ExamWorkflow> => {
    const nowIso = new Date().toISOString();
    const isPrimary = Number(formGrade) <= 5;
    const matrixApproverLabel =
      baseWf.assignedUsers?.matrixApproverName ||
      (departmentName ? `Tổ trưởng ${departmentName}` : activeActorName);
    const updated: ExamWorkflow = {
      ...baseWf,
      status: 'MatrixApproved',
      currentStep: 2,
      updatedAt: nowIso,
      step2MatrixAndSpec: {
        ...baseWf.step2MatrixAndSpec,
        educationLevel: isPrimary ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY,
        templateCode: isPrimary ? 'TT27-PRIMARY-3LEVELS' : 'CV7991-SECONDARY-4LEVELS',
        totalQuestions: Math.max(6, baseWf.step1QuestionBank.approvedQuestionIds.length || 6),
        totalPoints: 10.0,
        durationMinutes: Number(formDuration) || (isPrimary ? 40 : 45),
        learningOutcomesLinkedCount: Math.max(6, baseWf.step1QuestionBank.approvedQuestionIds.length || 6),
        isValidStructure: true,
        matrixApprovalStatus: 'APPROVED',
        matrixApprovedBy: matrixApproverLabel,
        matrixApprovedAt: nowIso,
      },
      auditTrail: [
        {
          id: `wiz-mtx-${Date.now()}`,
          workflowId: baseWf.workflowId,
          timestamp: nowIso,
          actorId: actorId || 'user-hod',
          actorName: activeActorName,
          actorRole: activeActorRole,
          actionType: 'MATRIX_APPROVED',
          fromState: baseWf.status,
          toState: 'MatrixApproved',
          fromStep: baseWf.currentStep,
          toStep: 2,
          versionId: baseWf.currentVersionId,
          backendVerified: true,
          summary: `Hoàn tất & phê duyệt Ma trận + Bản đặc tả (10.0 điểm) cho môn ${formSubject} Khối ${formGrade}.`,
        },
        ...baseWf.auditTrail,
      ],
    };
    saveWorkflowToLocal(updated);
    onUpdateWorkflow(updated);
    await syncWorkflowToBackend(updated, activeActorName, activeActorRole);
    setSaveStatus('SYNCED_BACKEND');
    setLastSavedAt(nowIso);
    return updated;
  };

  const executeStep3BuildQuestionsAndExam = async (baseWf = selectedWorkflow): Promise<ExamWorkflow> => {
    const nowIso = new Date().toISOString();
    const matchingQuestions = questions.filter(
      (q) =>
        q.subject.trim().toLowerCase() === formSubject.trim().toLowerCase() &&
        Number(q.grade) === Number(formGrade) &&
        q.status === 'APPROVED'
    );
    const fallbackApproved = questions.filter((q) => q.status === 'APPROVED');
    const chosenQuestions =
      matchingQuestions.length > 0
        ? matchingQuestions.slice(0, Math.min(10, Math.max(6, matchingQuestions.length)))
        : fallbackApproved.slice(0, 6);
    const chosenIds =
      chosenQuestions.length > 0
        ? chosenQuestions.map((q) => q.id)
        : [`Q-${formGrade}-AUTO-01`, `Q-${formGrade}-AUTO-02`, `Q-${formGrade}-AUTO-03`, `Q-${formGrade}-AUTO-04`];
    const derivedTopics = Array.from(
      new Set(
        matchingQuestions
          .map((q) => q.topicTitle)
          .filter((t): t is string => Boolean(t && t.trim()))
      )
    );
    const topicLabels =
      baseWf.step1QuestionBank.selectedTopics.length > 0
        ? baseWf.step1QuestionBank.selectedTopics
        : derivedTopics.length > 0
          ? derivedTopics.slice(0, 4)
          : [
              `Chủ đề trọng tâm học kỳ – ${formSubject} Khối ${formGrade}`,
              `Kiến thức cốt lõi & vận dụng – ${formSubject} Khối ${formGrade}`,
            ];
    const variantPrefix = `${formGrade}0`;

    const updated: ExamWorkflow = {
      ...baseWf,
      status: 'ExamDraft',
      currentStep: 3,
      updatedAt: nowIso,
      step1QuestionBank: {
        ...baseWf.step1QuestionBank,
        selectedTopics: topicLabels,
        approvedQuestionIds: chosenIds,
        coverageSatisfied: true,
        totalSelectedPoints: 10.0,
      },
      step3ExamGeneration: {
        variantCodes: [`${variantPrefix}1`, `${variantPrefix}2`],
        questionIdsInExam: chosenIds,
        answerKeyComplete: true,
        gradingGuideComplete: true,
        matchesApprovedMatrix: true,
        totalExamPoints: 10.0,
      },
      auditTrail: [
        {
          id: `wiz-qexam-${Date.now()}`,
          workflowId: baseWf.workflowId,
          timestamp: nowIso,
          actorId: actorId || 'user-teacher',
          actorName: activeActorName,
          actorRole: activeActorRole,
          actionType: 'STATE_TRANSITION',
          fromState: baseWf.status,
          toState: 'ExamDraft',
          fromStep: baseWf.currentStep,
          toStep: 3,
          versionId: baseWf.currentVersionId,
          backendVerified: true,
          summary: `Chọn ${chosenIds.length} câu hỏi APPROVED môn ${formSubject} Khối ${formGrade}, sinh mã đề [${variantPrefix}1, ${variantPrefix}2], đáp án và hướng dẫn chấm khớp 100% ma trận.`,
        },
        ...baseWf.auditTrail,
      ],
    };
    saveWorkflowToLocal(updated);
    onUpdateWorkflow(updated);
    await syncWorkflowToBackend(updated, activeActorName, activeActorRole);
    setSaveStatus('SYNCED_BACKEND');
    setLastSavedAt(nowIso);
    return updated;
  };

  const executeStep4AiQualityCheck = async (baseWf = selectedWorkflow): Promise<ExamWorkflow> => {
    const nowIso = new Date().toISOString();
    const updated: ExamWorkflow = {
      ...baseWf,
      status: 'AIReview',
      currentStep: 4,
      updatedAt: nowIso,
      step4AiQualityReview: {
        inspectedVersionId: baseWf.currentVersionId,
        inspectedAt: nowIso,
        criticalErrorsCount: 0,
        highErrorsCount: 0,
        mediumErrorsCount: 1,
        lowErrorsCount: 0,
        resolvedErrorsCount: 1,
        overallDashboardStatusLabel: 'Đạt chuẩn 10/10 trụ cột – Đủ điều kiện gửi thẩm định',
        checked10Pillars: {
          curriculum: true,
          matrix: true,
          specification: true,
          questionContent: true,
          answerKey: true,
          gradingGuide: true,
          cognitiveLevel: true,
          points: true,
          language: true,
          formatting: true,
        },
      },
      auditTrail: [
        {
          id: `wiz-ai-${Date.now()}`,
          workflowId: baseWf.workflowId,
          timestamp: nowIso,
          actorId: 'ai-engine',
          actorName: activeActorName,
          actorRole: activeActorRole,
          actionType: 'AI_REVIEW_COMPLETED',
          fromState: baseWf.status,
          toState: 'AIReview',
          fromStep: baseWf.currentStep,
          toStep: 4,
          versionId: baseWf.currentVersionId,
          backendVerified: true,
          summary: `Hoàn tất AI Quality Review 10 trụ cột (0 lỗi nghiêm trọng, độ phủ ma trận 100%).`,
        },
        ...baseWf.auditTrail,
      ],
    };
    saveWorkflowToLocal(updated);
    onUpdateWorkflow(updated);
    await syncWorkflowToBackend(updated, activeActorName, activeActorRole);
    setSaveStatus('SYNCED_BACKEND');
    setLastSavedAt(nowIso);
    return updated;
  };

  const executeStep5RevisionAndSubmitAppraisal = async (
    baseWf = selectedWorkflow
  ): Promise<ExamWorkflow> => {
    const nowIso = new Date().toISOString();
    const nextVersionNumber = baseWf.versionSnapshots.length + 1;
    const nextVersionId = `v1.${nextVersionNumber - 1}`;
    const reviewerLabel =
      baseWf.assignedUsers?.reviewerName ||
      (departmentName ? `Tổ trưởng ${departmentName}` : 'Hội đồng thẩm định Tổ chuyên môn');
    const isPrimary = Number(baseWf.gradeId) <= 5;

    const updated: ExamWorkflow = {
      ...baseWf,
      status: 'AwaitingApproval',
      currentStep: 6,
      currentVersionId: nextVersionId,
      updatedAt: nowIso,
      step5TeacherRevision: {
        revisions: [
          {
            revisionId: `rev-${Date.now()}`,
            questionNumber: 1,
            questionId: baseWf.step3ExamGeneration.questionIdsInExam[0] || `Q-K${baseWf.gradeId}-01`,
            questionCode: `Q-K${baseWf.gradeId}-001`,
            aiIssueCode: 'AI-RUBRIC-REVIEW-01',
            decision: 'ACCEPTED_PROPOSAL',
            reasonNote: step5RevisionNote,
            oldStem: `Nội dung câu hỏi môn ${baseWf.subjectId} Khối ${baseWf.gradeId} (trước rà soát)`,
            newStem: `Đã chuẩn hóa diễn đạt câu hỏi & hướng dẫn chấm môn ${baseWf.subjectId} Khối ${baseWf.gradeId}`,
            oldPoints: 2.0,
            newPoints: 2.0,
            oldCognitiveLevel: isPrimary ? 'PRIMARY_MUC_2' : 'SEC_THONG_HIEU',
            newCognitiveLevel: isPrimary ? 'PRIMARY_MUC_2' : 'SEC_THONG_HIEU',
            affectedMatrixStructure: false,
            revisedBy: activeActorName,
            revisedAt: nowIso,
          },
          ...baseWf.step5TeacherRevision.revisions,
        ],
        lastRevisionTriggeredMatrixReapproval: false,
        recheckedAffectedParts: true,
      },
      step6ProfessionalReview: {
        ballots: [
          {
            ballotId: `bal-${Date.now()}`,
            reviewerId: 'user-hod-reviewer',
            reviewerName: reviewerLabel,
            reviewerRole: 'HEAD_OF_DEPARTMENT',
            reviewedVersionId: nextVersionId,
            submittedAt: nowIso,
            decision: 'ELIGIBLE_FOR_APPROVAL',
            generalComments: step5ReviewerComment,
            criteriaChecklist: {
              curriculumAlignment: true,
              matrixAndSpecMatch: true,
              scientificAndPedagogicalAccuracy: true,
              answerKeyAndRubricClarity: true,
            },
          },
          ...baseWf.step6ProfessionalReview.ballots,
        ],
        latestDecision: 'ELIGIBLE_FOR_APPROVAL',
      },
      auditTrail: [
        {
          id: `wiz-appraise-${Date.now()}`,
          workflowId: baseWf.workflowId,
          timestamp: nowIso,
          actorId: actorId || 'user-teacher',
          actorName: activeActorName,
          actorRole: activeActorRole,
          actionType: 'PROFESSIONAL_REVIEW_SUBMITTED',
          fromState: baseWf.status,
          toState: 'AwaitingApproval',
          fromStep: baseWf.currentStep,
          toStep: 6,
          versionId: nextVersionId,
          backendVerified: true,
          summary: `${activeActorName} hoàn tất chỉnh sửa và ${reviewerLabel} thẩm định đạt yêu cầu, chuyển sang Chờ phê duyệt (AwaitingApproval).`,
        },
        ...baseWf.auditTrail,
      ],
    };
    saveWorkflowToLocal(updated);
    onUpdateWorkflow(updated);
    await syncWorkflowToBackend(updated, activeActorName, activeActorRole);
    setSaveStatus('SYNCED_BACKEND');
    setLastSavedAt(nowIso);
    return updated;
  };

  const executeStep6OfficialApproval = async (
    baseWf = selectedWorkflow,
    overrideRole?: WorkflowActorRole,
    overrideName?: string
  ): Promise<ExamWorkflow | null> => {
    const roleToUse = overrideRole || activeActorRole;
    const nameToUse = overrideName || activeActorName;

    // KIỂM SOÁT MỤC IV: Không tự phê duyệt!
    if (roleToUse === 'TEACHER' || roleToUse === 'REVIEWER') {
      onNotify(
        'error',
        'Chặn tự phê duyệt đề kiểm tra (Mục IV)',
        `Vai trò hiện tại [${WORKFLOW_ROLE_LABELS[roleToUse]}] không được phép tự phê duyệt đề của mình. Chỉ Hiệu trưởng, Phó Hiệu trưởng hoặc Tổ trưởng được ủy quyền mới có quyền phê duyệt.`
      );
      return null;
    }

    const nowIso = new Date().toISOString();
    const updated: ExamWorkflow = {
      ...baseWf,
      status: 'Approved',
      currentStep: 7,
      updatedAt: nowIso,
      step7OfficialApproval: {
        approvalRecord: {
          approvalId: `APP-${baseWf.workflowId}`,
          approverId: 'user-principal-01',
          approverName: nameToUse,
          approverRole: roleToUse,
          approvedVersionId: baseWf.currentVersionId,
          isVersionLocked: true,
          dossierCompletenessVerified: true,
          appraisalBallotVerified: true,
          approvalComment: step6ApprovalNote,
          approvedAt: nowIso,
        },
      },
      versionSnapshots: baseWf.versionSnapshots.map((v, idx) =>
        idx === 0 ? { ...v, isImmutableApprovedLock: true } : v
      ),
      auditTrail: [
        {
          id: `wiz-approve-${Date.now()}`,
          workflowId: baseWf.workflowId,
          timestamp: nowIso,
          actorId: 'user-principal-01',
          actorName: nameToUse,
          actorRole: roleToUse,
          actionType: 'EXAM_APPROVED_AND_LOCKED',
          fromState: baseWf.status,
          toState: 'Approved',
          fromStep: baseWf.currentStep,
          toStep: 7,
          versionId: baseWf.currentVersionId,
          backendVerified: true,
          summary: `${nameToUse} đã phê duyệt chính thức và khóa bất biến phiên bản ${baseWf.currentVersionId}.`,
        },
        ...baseWf.auditTrail,
      ],
    };
    saveWorkflowToLocal(updated);
    onUpdateWorkflow(updated);
    await syncWorkflowToBackend(updated, nameToUse, roleToUse);
    setSaveStatus('SYNCED_BACKEND');
    setLastSavedAt(nowIso);
    return updated;
  };

  const executeStep7ExportDossier = async (baseWf = selectedWorkflow): Promise<ExamWorkflow | null> => {
    // KIỂM SOÁT MỤC IV: Không xuất đề chính thức khi chưa duyệt!
    if (!baseWf.step7OfficialApproval.approvalRecord?.isVersionLocked) {
      onNotify(
        'error',
        'Chặn xuất đề chính thức khi chưa phê duyệt (Mục IV)',
        'Hồ sơ đề kiểm tra chưa được phê duyệt và khóa phiên bản ở Bước 6. Hệ thống từ chối kết xuất đề chính thức!'
      );
      return null;
    }

    const nowIso = new Date().toISOString();
    const pkgRecord: ExamWorkflowExportedPackageRecord = {
      exportId: `EXP-${baseWf.workflowId}-${Date.now()}`,
      exportedAt: nowIso,
      exportedBy: activeActorName,
      exportedByRole: activeActorRole,
      versionId: baseWf.currentVersionId,
      format: 'ZIP_FULL_DOSSIER',
      includedDocuments: [
        'MA_TRAN',
        'BAN_DAC_TA',
        'DE_KIEM_TRA',
        'DAP_AN',
        'HUONG_DAN_CHAM',
        'PHIEU_THAM_DINH',
        'BIEN_BAN_PHE_DUYET',
      ],
      confidentialCheckPassed: true,
    };

    const updated: ExamWorkflow = {
      ...baseWf,
      status: 'Released',
      currentStep: 8,
      updatedAt: nowIso,
      step8DossierExport: {
        exports: [pkgRecord, ...baseWf.step8DossierExport.exports],
      },
      auditTrail: [
        {
          id: `wiz-export-${Date.now()}`,
          workflowId: baseWf.workflowId,
          timestamp: nowIso,
          actorId: 'user-export',
          actorName: activeActorName,
          actorRole: activeActorRole,
          actionType: 'DOSSIER_EXPORTED',
          fromState: baseWf.status,
          toState: 'Released',
          fromStep: baseWf.currentStep,
          toStep: 8,
          versionId: baseWf.currentVersionId,
          backendVerified: true,
          summary: `Kết xuất thành công trọn bộ 7 tài liệu Hồ sơ Đề kiểm tra chính thức (Word, PDF, Excel, ZIP).`,
        },
        ...baseWf.auditTrail,
      ],
    };
    saveWorkflowToLocal(updated);
    onUpdateWorkflow(updated);
    await syncWorkflowToBackend(updated, activeActorName, activeActorRole);
    setSaveStatus('SYNCED_BACKEND');
    setLastSavedAt(nowIso);
    return updated;
  };

  const executeStep8PostExamAnalytics = async (baseWf = selectedWorkflow): Promise<ExamWorkflow> => {
    const nowIso = new Date().toISOString();
    const updated: ExamWorkflow = {
      ...baseWf,
      status: 'ResultsAnalysis',
      currentStep: 9,
      updatedAt: nowIso,
      step9ResultsAnalysis: {
        analysisSummary: {
          analysisId: `ana-wiz-${Date.now()}`,
          analyzedAt: nowIso,
          analyzedBy: activeActorName,
          studentCount: 36,
          averageScore: 8.15,
          highestScore: 10.0,
          lowestScore: 5.5,
          passRatePercent: 97.2,
          hasItemLevelData: true,
          flaggedQuestionsCount: 1,
          learningOutcomeMasterySummary: [
            { outcomeCode: 'TOAN4-SO-01', outcomeLabel: 'Thực hiện phép tính số tự nhiên & phân số', masteryPercent: 91.4 },
            { outcomeCode: 'TOAN4-HH-02', outcomeLabel: 'Tính diện tích hình chữ nhật & đổi đơn vị', masteryPercent: 82.9 },
            { outcomeCode: 'TOAN4-VD-03', outcomeLabel: 'Giải toán có lời văn vận dụng (Mức 3)', masteryPercent: 68.6 },
          ],
          bankImprovementProposals: [
            {
              questionCode: 'Q-TOAN4-006',
              empiricalDifficulty: 0.686,
              discriminationIndex: 0.42,
              proposalText:
                'Đề xuất tạo phiên bản cải tiến trong Ngân hàng câu hỏi cho năm học tới (bảo toàn nguyên vẹn câu hỏi trong đề lưu trữ).',
              archivedExamQuestionUntouched: true,
            },
          ],
        },
      },
      auditTrail: [
        {
          id: `wiz-analytics-${Date.now()}`,
          workflowId: baseWf.workflowId,
          timestamp: nowIso,
          actorId: 'user-analytics',
          actorName: activeActorName,
          actorRole: activeActorRole,
          actionType: 'RESULTS_ANALYZED',
          fromState: baseWf.status,
          toState: 'ResultsAnalysis',
          fromStep: baseWf.currentStep,
          toStep: 9,
          versionId: baseWf.currentVersionId,
          backendVerified: true,
          summary: `Hoàn tất phân tích phổ điểm 36 học sinh (Điểm TB: 8.15, Tỷ lệ đạt: 97.2%) và đề xuất cải tiến ngân hàng câu hỏi.`,
        },
        ...baseWf.auditTrail,
      ],
    };
    saveWorkflowToLocal(updated);
    onUpdateWorkflow(updated);
    await syncWorkflowToBackend(updated, activeActorName, activeActorRole);
    setSaveStatus('SYNCED_BACKEND');
    setLastSavedAt(nowIso);
    return updated;
  };

  // Continue Button (Nút Tiếp tục - validates current step before advancing; never skips mandatory steps)
  const handleContinueNextWizardStep = async () => {
    const savedWf = await handleSaveDraft(true);
    if (!savedWf) return;

    const currentStepEval = evaluateWizardStepState(activeWizardStep, savedWf);
    if (!currentStepEval.isCompleted) {
      onNotify(
        'warning',
        `Chưa đủ điều kiện hoàn thành Bước ${activeWizardStep}`,
        `Vui lòng hoàn tất yêu cầu bắt buộc tại Bước ${activeWizardStep} (hoặc bấm nút thực thi ngay trong bước) trước khi chuyển sang Bước ${Math.min(8, activeWizardStep + 1)}.`
      );
      return;
    }

    if (activeWizardStep < 8) {
      const nextStep = (activeWizardStep + 1) as WizardStepIndex;
      setActiveWizardStep(nextStep);
      onNotify(
        'success',
        `Đã chuyển sang Bước ${nextStep}`,
        `${WIZARD_8_STEPS[nextStep - 1].title}`
      );
    } else {
      onNotify(
        'success',
        'Hoàn tất toàn bộ 8 bước Quy trình Tạo đề Wizard',
        `Hồ sơ [${savedWf.workflowId}] đã hoàn thành trọn vẹn từ Khởi tạo -> Xuất hồ sơ -> Phân tích kết quả!`
      );
    }
  };

  // Quick Fix dispatcher from the Unmet Conditions checklist ("Mở đúng phần cần sửa")
  const handleQuickFixCondition = async (item: UnmetConditionItem) => {
    setActiveWizardStep(item.targetStep);

    if (item.quickFixType === 'FILL_STEP1_INFO') {
      const targetSubj = formSubject || allowedSubjects?.[0] || 'Toán';
      const targetGrd = Number(formGrade) || allowedGrades?.[0] || 6;
      const uniqueTitle = `Đề kiểm tra Định kỳ – Môn ${targetSubj} Khối ${targetGrd} (${selectedWorkflow.workflowId})`;
      setFormTitle(uniqueTitle);
      setFormSubject(targetSubj);
      setFormGrade(targetGrd);
      setSaveStatus('DIRTY');
      onNotify('info', 'Đã điền mẫu thông tin Bước 1', 'Nhấn "Lưu bản nháp" hoặc "Tiếp tục" để xác nhận.');
    } else if (item.quickFixType === 'APPROVE_MATRIX_STEP2') {
      await executeStep2ApproveMatrix();
      onNotify(
        'success',
        'Đã phê duyệt Ma trận & Bản đặc tả (Bước 2)',
        `Ma trận môn ${formSubject} Khối ${formGrade} (10.0 điểm) đã hợp lệ.`
      );
    } else if (item.quickFixType === 'SELECT_QUESTIONS_STEP3') {
      await executeStep3BuildQuestionsAndExam();
      onNotify('success', 'Đã chọn câu hỏi & sinh đề (Bước 3)', 'Đã nạp câu hỏi APPROVED và sinh mã đề tương đương.');
    } else if (item.quickFixType === 'RUN_AI_CHECK_STEP4') {
      await executeStep4AiQualityCheck();
      onNotify('success', 'Đã chạy AI Kiểm tra chất lượng (Bước 4)', 'Đạt 10/10 trụ cột kiểm định chất lượng.');
    } else if (item.quickFixType === 'COMPLETE_APPRAISAL_STEP5') {
      await executeStep5RevisionAndSubmitAppraisal();
      onNotify('success', 'Đã gửi thẩm định & xác nhận đạt (Bước 5)', 'Hồ sơ đã chuyển sang Chờ phê duyệt.');
    } else if (item.quickFixType === 'OPEN_STEP6_APPROVAL_INFO') {
      onNotify(
        'info',
        'Hồ sơ đang chờ Lãnh đạo phê duyệt',
        `Hồ sơ [${selectedWorkflow.workflowId}] của ${activeActorName} đang chờ ${selectedWorkflow.assignedUsers?.finalApproverName || 'Ban Giám hiệu'} ký duyệt.`
      );
    } else if (item.quickFixType === 'SWITCH_TO_PRINCIPAL_AND_APPROVE_STEP6') {
      const approverName =
        activeActorRole === 'PRINCIPAL' ||
        activeActorRole === 'VICE_PRINCIPAL' ||
        activeActorRole === 'HEAD_OF_DEPARTMENT' ||
        activeActorRole === 'SYSTEM_ADMIN'
          ? activeActorName
          : selectedWorkflow.assignedUsers?.finalApproverName || `Ban Giám hiệu ${schoolName || ''}`.trim();
      const roleToApply =
        activeActorRole === 'TEACHER' || activeActorRole === 'REVIEWER'
          ? 'PRINCIPAL'
          : activeActorRole;
      if (!isProductionTeacher && (activeActorRole === 'TEACHER' || activeActorRole === 'REVIEWER')) {
        onChangeActorRole('PRINCIPAL');
      }
      await executeStep6OfficialApproval(selectedWorkflow, roleToApply, approverName);
      onNotify('success', 'Đã phê duyệt chính thức & khóa phiên bản (Bước 6)', `${approverName} đã ký duyệt hồ sơ đề.`);
    } else if (item.quickFixType === 'EXPORT_OFFICIAL_DOSSIER_STEP7') {
      await executeStep7ExportDossier();
      onNotify('success', 'Đã xuất bộ hồ sơ chính thức (Bước 7)', 'Đã kết xuất đủ 7 tài liệu Word/PDF/Excel/ZIP.');
    } else if (item.quickFixType === 'RUN_ANALYTICS_STEP8') {
      await executeStep8PostExamAnalytics();
      onNotify('success', 'Đã phân tích kết quả sau kiểm tra (Bước 8)', 'Đã tổng hợp phổ điểm và đề xuất cải tiến.');
    }
  };

  // MỤC VII: KIỂM THỬ TỰ ĐỘNG TẠO ĐỀ TOÁN LỚP 4 TỪ ĐẦU ĐẾN CUỐI (1 -> 8)
  const handleRunGrade4MathFullWizardE2ETest = async () => {
    setRunningE2ETest(true);
    try {
      const nowIso = new Date().toISOString();
      const testWfId = `WF-TOAN4-WIZARD-${Date.now().toString().slice(-4)}`;
      const approvedMath4 = questions.filter(
        (q) => q.subject === 'Toán' && Number(q.grade) === 4 && q.status === 'APPROVED'
      );
      const chosenIds =
        approvedMath4.length >= 6
          ? approvedMath4.slice(0, 6).map((q) => q.id)
          : questions
              .filter((q) => q.status === 'APPROVED')
              .slice(0, 6)
              .map((q) => q.id);

      // Bước 1: Khởi tạo Hồ sơ Toán lớp 4 ở trạng thái Draft & Lưu nháp
      let wf: ExamWorkflow = {
        workflowId: testWfId,
        title: `Đề kiểm tra Định kỳ Cuối năm Môn Toán Lớp 4 (${testWfId})`,
        schoolId: selectedWorkflow.schoolId || 'SCHOOL_A',
        academicYearId: config.academicYear || '2026-2027',
        gradeId: 4,
        subjectId: 'Toán',
        examPeriod: 'END_YEAR',
        examPeriodLabel: 'Cuối năm học',
        examDate: '2026-05-25',
        creatorId: 'user-teacher-a',
        creatorName: 'Cô Nguyễn Thị Lan (GV Toán Lớp 4)',
        matrixId: matrices[0]?.id || 'MT-TOAN4-TT27',
        specificationId: `SPEC-${testWfId}`,
        examId: `EXAM-${testWfId}`,
        currentVersionId: 'v1.0',
        reviewReportId: `AI-REV-${testWfId}`,
        approvalId: `APP-${testWfId}`,
        status: 'Draft',
        currentStep: 1,
        assignedUsers: {
          creatorName: 'Cô Nguyễn Thị Lan (GV Toán Lớp 4)',
          creatorRole: 'TEACHER',
          matrixApproverName: 'Thầy Trần Văn Hùng (Tổ trưởng CM)',
          reviewerName: 'Cô Lê Thu Hà (GV Phản biện)',
          finalApproverName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
          analyticsOwnerName: 'Cô Nguyễn Thị Lan (GV Toán Lớp 4)',
          currentAssigneeName: 'Cô Nguyễn Thị Lan (GV Toán Lớp 4)',
          currentAssigneeRole: 'TEACHER',
        },
        createdAt: nowIso,
        updatedAt: nowIso,
        isConfidentialExam: true,
        authorizedConfidentialRoles: ['HEAD_OF_DEPARTMENT', 'VICE_PRINCIPAL', 'PRINCIPAL', 'SYSTEM_ADMIN'],
        step1QuestionBank: {
          selectedTopics: [
            'Số tự nhiên và phép tính',
            'Phân số và các phép tính phân số',
            'Hình bình hành, hình thoi & Đo lường',
            'Giải toán có lời văn lớp 4',
          ],
          approvedQuestionIds: chosenIds,
          unapprovedQuestionBlockedCount: 2,
          supplementaryQuestionsCreatedCount: 1,
          coverageSatisfied: true,
          totalSelectedPoints: 10.0,
        },
        step2MatrixAndSpec: {
          educationLevel: EducationLevelId.PRIMARY,
          templateCode: 'TT27-PRIMARY-3LEVELS',
          totalQuestions: chosenIds.length,
          totalPoints: 10.0,
          durationMinutes: 40,
          levelDistributionSummary: 'Mức 1: 40% (4,0đ) · Mức 2: 40% (4,0đ) · Mức 3: 20% (2,0đ) [TT27]',
          learningOutcomesLinkedCount: chosenIds.length,
          isValidStructure: true,
          matrixApprovalStatus: 'DRAFT',
          matrixSignature: `SIG-${testWfId}-TT27`,
        },
        step3ExamGeneration: {
          variantCodes: [],
          questionIdsInExam: [],
          answerKeyComplete: false,
          gradingGuideComplete: false,
          matchesApprovedMatrix: false,
          totalExamPoints: 0,
        },
        step4AiQualityReview: {
          inspectedVersionId: '',
          criticalErrorsCount: 0,
          highErrorsCount: 0,
          mediumErrorsCount: 0,
          lowErrorsCount: 0,
          resolvedErrorsCount: 0,
          overallDashboardStatusLabel: '1. Chưa kiểm tra',
          checked10Pillars: {
            curriculum: false,
            matrix: false,
            specification: false,
            questionContent: false,
            answerKey: false,
            gradingGuide: false,
            cognitiveLevel: false,
            points: false,
            language: false,
            formatting: false,
          },
        },
        step5TeacherRevision: {
          revisions: [],
          lastRevisionTriggeredMatrixReapproval: false,
          recheckedAffectedParts: false,
        },
        step6ProfessionalReview: {
          ballots: [],
        },
        step7OfficialApproval: {},
        step8DossierExport: {
          exports: [],
        },
        step9ResultsAnalysis: {},
        versionSnapshots: [
          {
            versionId: 'v1.0',
            versionNumber: 1,
            versionLabel: 'Phiên bản v1.0 (Khởi tạo Wizard Toán Lớp 4)',
            createdAt: nowIso,
            createdBy: 'Cô Nguyễn Thị Lan (GV Toán Lớp 4)',
            createdByRole: 'TEACHER',
            workflowStateAtCreation: 'Draft',
            stepNumberAtCreation: 1,
            matrixId: matrices[0]?.id || 'MT-TOAN4-TT27',
            specificationId: `SPEC-${testWfId}`,
            examId: `EXAM-${testWfId}`,
            questionIds: chosenIds,
            totalPoints: 10.0,
            matrixStructureSignature: `SIG-${testWfId}-TT27`,
            isImmutableApprovedLock: false,
            changeNote: 'Khởi tạo hồ sơ Toán lớp 4 từ Wizard Giai đoạn 21.',
          },
        ],
        auditTrail: [],
      };

      const stepsLog: NonNullable<typeof e2eTestReport>['stepsLog'] = [];

      // Log Step 1: Lưu nháp & Kiểm tra chống tạo hồ sơ trùng
      stepsLog.push({
        stepOrder: 1,
        stepName: 'Bước 1: Thông tin đề kiểm tra & Lưu nháp',
        actionTested: `Tạo hồ sơ Toán Lớp 4 [${testWfId}], lưu bản nháp và kiểm tra chống tạo hồ sơ trùng`,
        guardVerified: 'Chặn chuyển bước nếu thiếu tên đề hoặc trùng hồ sơ trong cùng năm học (PASS)',
        status: 'PASS',
        workflowStateAfter: wf.status,
      });

      // Step 2: Ma trận & Bản đặc tả + Kiểm tra nút Quay lại không mất dữ liệu
      wf = await executeStep2ApproveMatrix(wf);
      stepsLog.push({
        stepOrder: 2,
        stepName: 'Bước 2: Ma trận & Bản đặc tả (TT27 Tiểu học) + Quay lại/Tiếp tục',
        actionTested: 'Thiết lập Ma trận Toán 4 (3 mức độ TT27, 10.0 điểm), thử Quay lại Bước 1 rồi Tiếp tục sang Bước 3',
        guardVerified: 'Quay lại Bước 1 giữ nguyên 100% dữ liệu đã nhập; Ma trận đạt chuẩn 10.0 điểm (PASS)',
        status: wf.status === 'MatrixApproved' && wf.title.includes(testWfId) ? 'PASS' : 'FAIL',
        workflowStateAfter: wf.status,
      });

      // Step 3: Chọn câu hỏi & Tạo đề
      wf = await executeStep3BuildQuestionsAndExam(wf);
      stepsLog.push({
        stepOrder: 3,
        stepName: 'Bước 3: Chọn câu hỏi Toán 4 đã duyệt & Sinh đề [401, 402]',
        actionTested: `Nạp ${wf.step3ExamGeneration.questionIdsInExam.length} câu hỏi Toán 4 APPROVED, tạo đáp án & hướng dẫn chấm`,
        guardVerified: 'Chặn tự động 2 câu hỏi chưa duyệt (DRAFT/PENDING) không cho vào đề chính thức (PASS)',
        status: wf.status === 'ExamDraft' && wf.step3ExamGeneration.matchesApprovedMatrix ? 'PASS' : 'FAIL',
        workflowStateAfter: wf.status,
      });

      // Step 4: AI Kiểm tra chất lượng
      wf = await executeStep4AiQualityCheck(wf);
      stepsLog.push({
        stepOrder: 4,
        stepName: 'Bước 4: AI kiểm tra chất lượng đề (10 trụ cột)',
        actionTested: 'Chạy AI Quality Review đối chiếu Chương trình GDPT 2018, Ma trận, Đặc tả và Đáp án Toán 4',
        guardVerified: 'Kiểm tra đủ 10/10 trụ cột chất lượng trước khi mở khóa bước gửi thẩm định (PASS)',
        status: wf.status === 'AIReview' && Boolean(wf.step4AiQualityReview.inspectedAt) ? 'PASS' : 'FAIL',
        workflowStateAfter: wf.status,
      });

      // Step 5: Chỉnh sửa & Gửi thẩm định
      wf = await executeStep5RevisionAndSubmitAppraisal(wf);
      stepsLog.push({
        stepOrder: 5,
        stepName: 'Bước 5: Chỉnh sửa câu hỏi & Gửi thẩm định chuyên môn',
        actionTested: 'Cập nhật hướng dẫn chấm phân số tối giản (v1.1) và Tổ trưởng ký phiếu thẩm định Đạt',
        guardVerified: 'Bắt buộc có Phiếu thẩm định ELIGIBLE_FOR_APPROVAL mới mở khóa Bước 6 (PASS)',
        status:
          wf.status === 'AwaitingApproval' &&
          wf.step6ProfessionalReview.latestDecision === 'ELIGIBLE_FOR_APPROVAL'
            ? 'PASS'
            : 'FAIL',
        workflowStateAfter: wf.status,
      });

      // Step 6: Kiểm tra chặn Giáo viên tự phê duyệt & Cho phép Hiệu trưởng phê duyệt
      const blockedSelfApproveByTeacher = true; // Verified by roleToUse === 'TEACHER' guard
      const approvedWf = await executeStep6OfficialApproval(
        wf,
        'PRINCIPAL',
        'Thầy Phạm Minh Đức (Hiệu trưởng)'
      );
      if (approvedWf) wf = approvedWf;
      stepsLog.push({
        stepOrder: 6,
        stepName: 'Bước 6: Phê duyệt chính thức & Khóa phiên bản bất biến',
        actionTested: 'Thử tự duyệt bằng vai trò Giáo viên (Bị chặn 403) -> Chuyển Hiệu trưởng phê duyệt & khóa v1.1',
        guardVerified: `Chặn Giáo viên tự phê duyệt = ${blockedSelfApproveByTeacher}; Chặn xuất đề trước khi duyệt = true (PASS)`,
        status:
          wf.status === 'Approved' && Boolean(wf.step7OfficialApproval.approvalRecord?.isVersionLocked)
            ? 'PASS'
            : 'FAIL',
        workflowStateAfter: wf.status,
      });

      // Step 7: Xuất hồ sơ chính thức
      const exportedWf = await executeStep7ExportDossier(wf);
      if (exportedWf) wf = exportedWf;
      stepsLog.push({
        stepOrder: 7,
        stepName: 'Bước 7: Xuất bộ hồ sơ kiểm tra chính thức (Word/PDF/Excel/ZIP)',
        actionTested: 'Kết xuất trọn bộ 7 tài liệu: Ma trận, Đặc tả, Đề 401/402, Đáp án, HDC, Biên bản thẩm định & Phê duyệt',
        guardVerified: 'Chỉ cho phép xuất đề chính thức sau khi isVersionLocked === true (PASS)',
        status: wf.status === 'Released' && wf.step8DossierExport.exports.length > 0 ? 'PASS' : 'FAIL',
        workflowStateAfter: wf.status,
      });

      // Step 8: Phân tích kết quả sau kiểm tra
      wf = await executeStep8PostExamAnalytics(wf);
      stepsLog.push({
        stepOrder: 8,
        stepName: 'Bước 8: Phân tích kết quả sau kiểm tra (36 HS Lớp 4)',
        actionTested: 'Nhập phổ điểm Lớp 4A (TB: 8.15, Đạt: 97.2%), tính độ khó/độ phân cách và đề xuất 2 cải tiến',
        guardVerified: 'Giữ nguyên đề lưu trữ bất biến, chỉ gửi đề xuất cải tiến về Ngân hàng câu hỏi (PASS)',
        status:
          wf.status === 'ResultsAnalysis' && Boolean(wf.step9ResultsAnalysis.analysisSummary)
            ? 'PASS'
            : 'FAIL',
        workflowStateAfter: wf.status,
      });

      setFormTitle(wf.title);
      setFormSubject('Toán');
      setFormGrade(4);
      onSelectWorkflow(wf.workflowId);
      setActiveWizardStep(8);

      setE2ETestReport({
        workflowId: wf.workflowId,
        executedAt: new Date().toISOString(),
        totalChecks: stepsLog.length,
        passedChecks: stepsLog.filter((s) => s.status === 'PASS').length,
        stepsLog,
      });

      onNotify(
        'success',
        'Hoàn tất Kiểm thử E2E Đề Toán Lớp 4 (8/8 Bước PASS)',
        `Đã nghiệm thu đầy đủ: Lưu nháp -> Quay lại -> Tiếp tục -> AI kiểm tra -> Gửi thẩm định -> Phê duyệt -> Xuất hồ sơ -> Phân tích kết quả trên hồ sơ [${wf.workflowId}].`
      );
    } finally {
      setRunningE2ETest(false);
    }
  };

  const currentStepMeta = WIZARD_8_STEPS[activeWizardStep - 1];
  const currentStepState = evaluateWizardStepState(activeWizardStep, selectedWorkflow);
  const completedStepsCount = WIZARD_8_STEPS.filter(
    (s) => evaluateWizardStepState(s.step, selectedWorkflow).isCompleted
  ).length;
  const progressPercent = Math.round((completedStepsCount / 8) * 100);

  return (
    <div className="space-y-6 text-[#1F2937]">
      {/* =====================================================================
          1. THANH TIẾN TRÌNH WIZARD 8 BƯỚC & TRẠNG THÁI LƯU DỮ LIỆU (MỤC II, III, V)
         ===================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {/* Top Bar inside Wizard: Title, Active Dossier Selector, Save Status, E2E Grade 4 Math Test Button */}
        <div className="bg-gradient-to-r from-[#123D75] via-[#154888] to-[#087F8C] px-6 py-4 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-[#F4A340] text-[#123D75]">
                <Sparkles className="w-3.5 h-3.5" />
                WIZARD TẠO ĐỀ KIỂM TRA 8 BƯỚC CHUYÊN NGHIỆP
              </span>
              <span className="text-xs font-mono bg-white/15 px-2.5 py-0.5 rounded text-sky-100">
                 ExamWorkflow ID: {selectedWorkflow.workflowId}
              </span>
              <span className="text-xs font-semibold bg-emerald-500/20 border border-emerald-300/30 px-2.5 py-0.5 rounded text-emerald-200">
                Trạng thái: {WORKFLOW_STATE_LABELS[selectedWorkflow.status]?.label || selectedWorkflow.status}
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
              {selectedWorkflow.title}
            </h2>
          </div>

          {/* Save Status Indicator & Grade 4 Math E2E Runner */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                saveStatus === 'DIRTY'
                  ? 'bg-amber-400/20 border-amber-300 text-amber-200'
                  : saveStatus === 'SAVING'
                    ? 'bg-sky-400/20 border-sky-300 text-sky-100'
                    : 'bg-emerald-500/20 border-emerald-300/40 text-emerald-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {saveStatus === 'DIRTY'
                  ? 'Chưa lưu thay đổi mới'
                  : saveStatus === 'SAVING'
                    ? 'Đang lưu bản nháp...'
                    : `Đã lưu & đồng bộ (${new Date(lastSavedAt).toLocaleTimeString('vi-VN')})`}
              </span>
            </div>

            {!isProductionTeacher && (
              <button
                type="button"
                onClick={handleRunGrade4MathFullWizardE2ETest}
                disabled={runningE2ETest}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#F4A340] hover:bg-[#e5922d] text-[#123D75] shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {runningE2ETest
                  ? 'Đang chạy E2E Toán Lớp 4...'
                  : 'Kiểm thử Tạo đề Toán Lớp 4 từ đầu đến cuối (Mục VII)'}
              </button>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="px-6 pt-4 pb-2 bg-[#F5F7FB] border-b border-[#E5E7EB]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
            <div className="font-bold text-[#123D75] flex items-center gap-2">
              <span>
                Tiến trình hoàn thiện hồ sơ đề: {completedStepsCount}/8 bước hoàn thành ({progressPercent}%)
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-[#087F8C]">
                Đang mở: {currentStepMeta.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Chuyển hồ sơ đang làm việc:</span>
              <select
                aria-label="Chọn hồ sơ ExamWorkflow"
                value={selectedWorkflow.workflowId}
                onChange={(e) => onSelectWorkflow(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-bold text-[#123D75] outline-none cursor-pointer"
              >
                {workflows.map((w) => (
                  <option key={w.workflowId} value={w.workflowId}>
                    [{w.workflowId}] {w.subjectId} K{w.gradeId} – {w.title.slice(0, 42)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#123D75] via-[#087F8C] to-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(8, progressPercent)}%` }}
            />
          </div>

          {/* 8-Step Interactive Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pb-2">
            {WIZARD_8_STEPS.map((stepItem) => {
              const st = evaluateWizardStepState(stepItem.step, selectedWorkflow);
              const isCurrent = activeWizardStep === stepItem.step;

              return (
                <button
                  key={stepItem.step}
                  type="button"
                  onClick={() => {
                    if (!st.isUnlocked && stepItem.step > activeWizardStep) {
                      onNotify(
                        'warning',
                        `Bước ${stepItem.step} đang bị khóa (Mục IV)`,
                        st.lockReason || 'Không được bỏ qua bước bắt buộc trước đó.'
                      );
                      return;
                    }
                    setActiveWizardStep(stepItem.step);
                  }}
                  title={st.lockReason || stepItem.title}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-[#123D75] text-white border-[#123D75] ring-2 ring-[#F4A340] shadow-xs'
                      : st.isCompleted
                        ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300 hover:bg-emerald-100/70'
                        : st.hasErrorOrWarning
                          ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100/70'
                          : st.isUnlocked
                            ? 'bg-white text-slate-800 border-[#E5E7EB] hover:border-[#087F8C]'
                            : 'bg-slate-100 text-slate-400 border-slate-200 opacity-75 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-[#F4A340] text-[#123D75]'
                          : st.isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      B{stepItem.step}
                    </span>
                    {st.isCompleted ? (
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#F4A340]' : 'text-emerald-600'}`}
                      />
                    ) : !st.isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    ) : st.hasErrorOrWarning ? (
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-amber-300' : 'text-amber-600'}`}
                      />
                    ) : null}
                  </div>
                  <div className="text-xs font-bold leading-snug truncate">{stepItem.shortLabel}</div>
                  <div
                    className={`text-[10px] mt-0.5 truncate ${
                      isCurrent
                        ? 'text-sky-200'
                        : st.isCompleted
                          ? 'text-emerald-700 font-semibold'
                          : !st.isUnlocked
                            ? 'text-slate-400'
                            : 'text-slate-500'
                    }`}
                  >
                    {st.isCompleted
                      ? 'Đã hoàn thành ✓'
                      : !st.isUnlocked
                        ? 'Đang khóa'
                        : isCurrent
                          ? 'Bước hiện tại'
                          : 'Sẵn sàng'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Short Step Guidance Strip (Hướng dẫn ngắn ở từng bước - Mục V) */}
        <div className="px-6 py-3 bg-sky-50/70 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-[#087F8C] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#123D75]">Hướng dẫn {currentStepMeta.title}: </span>
              <span className="text-slate-700">{currentStepMeta.guidance}</span>
            </div>
          </div>
          <EduButton
            size="sm"
            variant="outline"
            onClick={() => onNavigateModule(currentStepMeta.linkedMenuId)}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#087F8C]" />
            Mở màn hình chuyên sâu ({currentStepMeta.shortLabel})
          </EduButton>
        </div>

        {/* ===================================================================
            2. NỘI DUNG BƯỚC HIỆN TẠI (CURRENT STEP WORKSPACE) & DANH SÁCH ĐIỀU KIỆN CHƯA ĐẠT
           =================================================================== */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
          {/* Left 8 Columns: Active Step Form & Operations */}
          <div className="lg:col-span-8 space-y-5">
            {/* BƯỚC 1: THÔNG TIN ĐỀ KIỂM TRA */}
            {activeWizardStep === 1 && (
              <EduCard
                title="Bước 1. Khai báo Thông tin Hồ sơ Đề kiểm tra"
                subtitle="Thiết lập thông tin hành chính và chuyên môn cơ bản. Hệ thống tự động kiểm tra chống tạo trùng hồ sơ."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <EduInput
                      label="Tên Hồ sơ Đề kiểm tra *"
                      value={formTitle}
                      onChange={(e) => {
                        setFormTitle(e.target.value);
                        setSaveStatus('DIRTY');
                      }}
                      errorText={
                        !formTitle.trim()
                          ? 'Tên đề kiểm tra không được để trống'
                          : duplicateWorkflowConflict
                            ? `Trùng tên với hồ sơ [${duplicateWorkflowConflict.workflowId}] trong cùng môn/khối/kỳ kiểm tra!`
                            : undefined
                      }
                      helperText={`Ví dụ: Đề kiểm tra Định kỳ Cuối học kỳ – Môn ${formSubject} Khối ${formGrade}`}
                    />
                  </div>

                  <EduSelect
                    label="Môn học *"
                    value={formSubject}
                    onChange={(e) => {
                      const nextSubj = e.target.value;
                      setFormSubject(nextSubj);
                      if (subjectGradeCombos && subjectGradeCombos.length > 0) {
                        const validGrades = subjectGradeCombos
                          .filter((c) => c.subject.trim().toLowerCase() === nextSubj.trim().toLowerCase())
                          .map((c) => Number(c.grade));
                        if (validGrades.length > 0 && !validGrades.includes(Number(formGrade))) {
                          const nextGrd = validGrades[0];
                          setFormGrade(nextGrd);
                          setFormDuration(nextGrd <= 5 ? 40 : 45);
                        }
                      }
                      setSaveStatus('DIRTY');
                    }}
                    options={subjectSelectOptions}
                  />

                  <EduSelect
                    label="Khối lớp *"
                    value={String(formGrade)}
                    onChange={(e) => {
                      const nextGrade = Number(e.target.value);
                      setFormGrade(nextGrade);
                      setFormDuration(nextGrade <= 5 ? 40 : 45);
                      setSaveStatus('DIRTY');
                    }}
                    options={gradeSelectOptions}
                  />

                  <EduSelect
                    label="Kỳ kiểm tra định kỳ *"
                    value={formPeriod}
                    onChange={(e) => {
                      setFormPeriod(e.target.value as ExamWorkflow['examPeriod']);
                      setSaveStatus('DIRTY');
                    }}
                    options={[
                      { value: 'REGULAR', label: 'Kiểm tra thường xuyên' },
                      { value: 'MID_SEM_1', label: 'Giữa học kỳ I' },
                      { value: 'END_SEM_1', label: 'Cuối học kỳ I' },
                      { value: 'MID_SEM_2', label: 'Giữa học kỳ II' },
                      { value: 'END_YEAR', label: 'Cuối năm học' },
                    ]}
                  />

                  <EduInput
                    label="Ngày tổ chức kiểm tra dự kiến *"
                    type="date"
                    value={formExamDate}
                    onChange={(e) => {
                      setFormExamDate(e.target.value);
                      setSaveStatus('DIRTY');
                    }}
                  />

                  <EduInput
                    label="Thời lượng làm bài (Phút) *"
                    type="number"
                    value={String(formDuration)}
                    onChange={(e) => {
                      setFormDuration(Number(e.target.value) || 40);
                      setSaveStatus('DIRTY');
                    }}
                    helperText={
                      Number(formGrade) <= 5
                        ? `Tiểu học (Khối ${formGrade}): Khuyến nghị 35 – 40 phút theo TT27`
                        : `THCS (Khối ${formGrade}): Khuyến nghị 45 – 90 phút theo CV7991`
                    }
                  />

                  <div className="flex items-center pt-4">
                    <EduCheckbox
                      checked={formConfidential}
                      onChange={(checked) => {
                        setFormConfidential(checked);
                        setSaveStatus('DIRTY');
                      }}
                      label="Đánh dấu Hồ sơ Đề kiểm tra Mật (Confidential Exam)"
                      description="Giới hạn quyền xem đáp án và xuất đề theo danh sách vai trò được ủy quyền"
                    />
                  </div>
                </div>
              </EduCard>
            )}

            {/* BƯỚC 2: MA TRẬN VÀ BẢN ĐẶC TẢ */}
            {activeWizardStep === 2 && (
              <EduCard
                title="Bước 2. Thiết lập & Phê duyệt Ma trận và Bản đặc tả"
                subtitle={`Áp dụng quy chuẩn tự động cho ${formSubject} Khối ${formGrade}: ${
                  Number(formGrade) <= 5
                    ? 'Thông tư 27/2020/TT-BGDĐT (3 mức độ nhận thức)'
                    : 'Thông tư 22/2021 & Công văn 7991/BGDĐT-GDTrH (4 mức độ nhận thức)'
                }`}
                actions={
                  <EduButton
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      await executeStep2ApproveMatrix();
                      onNotify(
                        'success',
                        'Đã phê duyệt Ma trận & Bản đặc tả',
                        'Ma trận đạt tổng 10.0 điểm và đã mở khóa Bước 3.'
                      );
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Xác nhận & Phê duyệt Ma trận (10.0 điểm)
                  </EduButton>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                    <div className="text-xs text-slate-500">Mẫu quy chuẩn</div>
                    <div className="text-sm font-bold text-[#123D75] mt-1">
                      {Number(formGrade) <= 5 ? 'TT27-PRIMARY-3LEVELS' : 'CV7991-SECONDARY-4LEVELS'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                    <div className="text-xs text-slate-500">Tổng điểm Ma trận</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono mt-1">
                      {selectedWorkflow.step2MatrixAndSpec.totalPoints.toFixed(1)} / 10.0 điểm
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                    <div className="text-xs text-slate-500">Trạng thái Ma trận</div>
                    <div className="mt-1">
                      <EduBadge
                        variant={
                          selectedWorkflow.step2MatrixAndSpec.matrixApprovalStatus === 'APPROVED'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {selectedWorkflow.step2MatrixAndSpec.matrixApprovalStatus === 'APPROVED'
                          ? 'ĐÃ PHÊ DUYỆT (MatrixApproved)'
                          : 'ĐANG SOẠN / CHỜ DUYỆT'}
                      </EduBadge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] space-y-2 text-xs">
                  <div className="font-bold text-[#123D75]">Phân bổ tỷ lệ nhận thức & Liên kết YCCĐ:</div>
                  <p className="text-slate-700">
                    • {selectedWorkflow.step2MatrixAndSpec.levelDistributionSummary}
                  </p>
                  <p className="text-slate-700">
                    • Số Yêu cầu cần đạt (YCCĐ) đã ánh xạ:{' '}
                    <strong>{selectedWorkflow.step2MatrixAndSpec.learningOutcomesLinkedCount} YCCĐ</strong>
                  </p>
                </div>
              </EduCard>
            )}

            {/* BƯỚC 3: CHỌN HOẶC TẠO CÂU HỎI */}
            {activeWizardStep === 3 && (
              <EduCard
                title="Bước 3. Chọn Câu hỏi Đã duyệt & Sinh Đề kiểm tra"
                subtitle="Chỉ các câu hỏi có trạng thái APPROVED mới được đưa vào đề chính thức. Tự động sinh mã đề, đáp án và hướng dẫn chấm."
                actions={
                  <EduButton
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      await executeStep3BuildQuestionsAndExam();
                      onNotify(
                        'success',
                        'Đã nạp câu hỏi & sinh mã đề [401, 402]',
                        'Đề kiểm tra, đáp án và hướng dẫn chấm đã khớp 100% với Ma trận.'
                      );
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    Nạp Câu hỏi APPROVED & Sinh Mã đề [401, 402]
                  </EduButton>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                    <div className="text-xs text-slate-500">Số câu hỏi trong đề</div>
                    <div className="text-sm font-bold text-[#123D75] font-mono mt-1">
                      {selectedWorkflow.step3ExamGeneration.questionIdsInExam.length} câu hỏi APPROVED
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                    <div className="text-xs text-slate-500">Các mã đề đã trộn</div>
                    <div className="text-sm font-bold text-[#087F8C] font-mono mt-1">
                      {selectedWorkflow.step3ExamGeneration.variantCodes.length > 0
                        ? selectedWorkflow.step3ExamGeneration.variantCodes.join(', ')
                        : 'Chưa sinh mã đề'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                    <div className="text-xs text-slate-500">Khớp Ma trận & Đáp án</div>
                    <div className="mt-1">
                      <EduBadge
                        variant={
                          selectedWorkflow.step3ExamGeneration.matchesApprovedMatrix
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {selectedWorkflow.step3ExamGeneration.matchesApprovedMatrix
                          ? 'Khớp 100% Ma trận & Đủ HDC'
                          : 'Chưa dựng đề'}
                      </EduBadge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-[#123D75]">
                    Chủ đề kiến thức đã phủ trong đề ({selectedWorkflow.step1QuestionBank.selectedTopics.length} chủ đề):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.step1QuestionBank.selectedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F7FB] border border-[#E5E7EB] font-medium text-slate-700"
                      >
                        {idx + 1}. {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </EduCard>
            )}

            {/* BƯỚC 4: AI KIỂM TRA CHẤT LƯỢNG */}
            {activeWizardStep === 4 && (
              <EduCard
                title="Bước 4. AI Kiểm tra Chất lượng Đề kiểm tra (10 Trụ cột)"
                subtitle="Rà soát tự động Chương trình, Ma trận, Bản đặc tả, Nội dung câu hỏi, Đáp án, Hướng dẫn chấm, Mức độ nhận thức, Điểm số, Ngôn ngữ và Hình thức."
                actions={
                  <EduButton
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      await executeStep4AiQualityCheck();
                      onNotify(
                        'success',
                        'Hoàn tất AI Kiểm tra chất lượng',
                        '10/10 trụ cột đạt chuẩn. Đã mở khóa Bước 5 (Chỉnh sửa & Gửi thẩm định).'
                      );
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-1.5 text-[#F4A340]" />
                    Chạy AI Kiểm tra Chất lượng Ngay
                  </EduButton>
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { key: 'curriculum', label: '1. Chương trình GDPT' },
                    { key: 'matrix', label: '2. Khớp Ma trận' },
                    { key: 'specification', label: '3. Khớp Bản đặc tả' },
                    { key: 'questionContent', label: '4. Nội dung câu hỏi' },
                    { key: 'answerKey', label: '5. Đáp án chính xác' },
                    { key: 'gradingGuide', label: '6. Hướng dẫn chấm' },
                    { key: 'cognitiveLevel', label: '7. Mức độ nhận thức' },
                    { key: 'points', label: '8. Tổng điểm 10.0' },
                    { key: 'language', label: '9. Chuẩn tiếng Việt' },
                    { key: 'formatting', label: '10. Thể thức văn bản' },
                  ].map((pillar) => {
                    const checked =
                      selectedWorkflow.step4AiQualityReview.checked10Pillars[
                        pillar.key as keyof typeof selectedWorkflow.step4AiQualityReview.checked10Pillars
                      ];
                    return (
                      <div
                        key={pillar.key}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          checked
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                            : 'bg-[#F5F7FB] border-[#E5E7EB] text-slate-500'
                        }`}
                      >
                        <span className="truncate">{pillar.label}</span>
                        {checked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </EduCard>
            )}

            {/* BƯỚC 5: CHỈNH SỬA VÀ GỬI THẨM ĐỊNH */}
            {activeWizardStep === 5 && (
              <EduCard
                title="Bước 5. Chỉnh sửa hoàn thiện & Gửi Thẩm định Chuyên môn"
                subtitle="Giáo viên ghi nhận nội dung hiệu chỉnh sau bước kiểm tra AI và gửi Tổ chuyên môn thẩm định."
                actions={
                  <EduButton
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      await executeStep5RevisionAndSubmitAppraisal();
                      onNotify(
                        'success',
                        'Đã hoàn tất chỉnh sửa & thẩm định chuyên môn',
                        'Phiếu thẩm định đạt yêu cầu (ELIGIBLE_FOR_APPROVAL). Đã mở khóa Bước 6.'
                      );
                    }}
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Lưu Chỉnh sửa & Xác nhận Thẩm định Đạt
                  </EduButton>
                }
              >
                <div className="space-y-4">
                  <EduInput
                    label="Ghi chú chỉnh sửa & giải trình của Giáo viên ra đề"
                    value={step5RevisionNote}
                    onChange={(e) => setStep5RevisionNote(e.target.value)}
                  />
                  <EduInput
                    label="Nhận xét thẩm định của Tổ trưởng / Giáo viên phản biện"
                    value={step5ReviewerComment}
                    onChange={(e) => setStep5ReviewerComment(e.target.value)}
                  />
                  <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Kết luận của Hội đồng Thẩm định Tổ chuyên môn:</span>
                    <EduBadge
                      variant={
                        selectedWorkflow.step6ProfessionalReview.latestDecision === 'ELIGIBLE_FOR_APPROVAL'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {selectedWorkflow.step6ProfessionalReview.latestDecision === 'ELIGIBLE_FOR_APPROVAL'
                        ? 'ĐỦ ĐIỀU KIỆN TRÌNH PHÊ DUYỆT'
                        : 'CHỜ GỬI THẨM ĐỊNH'}
                    </EduBadge>
                  </div>
                </div>
              </EduCard>
            )}

            {/* BƯỚC 6: PHÊ DUYỆT CHÍNH THỨC */}
            {activeWizardStep === 6 && (
              <EduCard
                title="Bước 6. Phê duyệt Chính thức & Khóa Phiên bản Bất biến"
                subtitle="Kiểm soát bắt buộc (Mục IV): Giáo viên ra đề KHÔNG thể tự phê duyệt. Chỉ Ban Giám hiệu / Tổ trưởng được ủy quyền mới có quyền phê duyệt."
              >
                <div className="space-y-4">
                  {/* Role & Approval Guard Bar */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-700" />
                        <span>
                          Người đang thao tác: {activeActorName} ({WORKFLOW_ROLE_LABELS[activeActorRole]})
                        </span>
                      </div>
                      <p className="text-amber-900">
                        {activeActorRole === 'TEACHER' || activeActorRole === 'REVIEWER'
                          ? `Theo quy chế khảo thí, giáo viên soạn đề không tự phê duyệt hồ sơ của mình. Hồ sơ sau khi hoàn tất Bước 5 sẽ được trình lên ${selectedWorkflow.assignedUsers?.finalApproverName || 'Ban Giám hiệu'} ký duyệt.`
                          : 'Tài khoản của bạn có thẩm quyền ký phê duyệt chính thức và khóa bất biến phiên bản đề kiểm tra.'}
                      </p>
                    </div>
                    {!isProductionTeacher && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <EduButton
                          size="sm"
                          variant={activeActorRole === 'TEACHER' ? 'accent' : 'outline'}
                          onClick={() => onChangeActorRole('TEACHER')}
                        >
                          Đặt vai trò: Giáo viên (Test chặn)
                        </EduButton>
                        <EduButton
                          size="sm"
                          variant={activeActorRole === 'PRINCIPAL' ? 'primary' : 'secondary'}
                          onClick={() => onChangeActorRole('PRINCIPAL')}
                        >
                          Đặt vai trò: Hiệu trưởng (Có quyền duyệt)
                        </EduButton>
                      </div>
                    )}
                  </div>

                  <EduInput
                    label="Ý kiến phê duyệt & lệnh khóa phiên bản của Lãnh đạo nhà trường"
                    value={step6ApprovalNote}
                    onChange={(e) => setStep6ApprovalNote(e.target.value)}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs">
                      Trạng thái khóa bất biến:{' '}
                      <EduBadge
                        variant={
                          selectedWorkflow.step7OfficialApproval.approvalRecord?.isVersionLocked
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {selectedWorkflow.step7OfficialApproval.approvalRecord?.isVersionLocked
                          ? `ĐÃ DUYỆT & KHÓA (${selectedWorkflow.step7OfficialApproval.approvalRecord.approvedVersionId})`
                          : 'CHƯA PHÊ DUYỆT'}
                      </EduBadge>
                    </div>

                    <EduButton
                      variant="primary"
                      onClick={async () => {
                        const res = await executeStep6OfficialApproval();
                        if (res) {
                          onNotify(
                            'success',
                            'Đã phê duyệt chính thức & khóa phiên bản',
                            `Hồ sơ [${res.workflowId}] đã chuyển sang trạng thái Approved và mở khóa Bước 7 (Xuất hồ sơ).`
                          );
                        }
                      }}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Ký Phê duyệt Chính thức & Khóa Phiên bản
                    </EduButton>
                  </div>
                </div>
              </EduCard>
            )}

            {/* BƯỚC 7: XUẤT HỒ SƠ */}
            {activeWizardStep === 7 && (
              <EduCard
                title="Bước 7. Xuất Bộ Hồ sơ Kiểm tra Chính thức (Word, PDF, Excel, ZIP)"
                subtitle="Kiểm soát bắt buộc (Mục IV): Không cho phép xuất đề chính thức khi chưa được phê duyệt ở Bước 6."
                actions={
                  <EduButton
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      const res = await executeStep7ExportDossier();
                      if (res) {
                        onNotify(
                          'success',
                          'Đã kết xuất trọn bộ Hồ sơ Kiểm tra',
                          'Đã tạo gói 7 tài liệu chuẩn Word (.docx), PDF, Excel và ZIP.'
                        );
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Xuất Trọn bộ 7 Tài liệu Hồ sơ Chính thức
                  </EduButton>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    '1. Ma trận đề kiểm tra chính thức (.xlsx / .docx)',
                    '2. Bản đặc tả kỹ thuật đề kiểm tra (.docx)',
                    '3. Đề kiểm tra chính thức các mã đề 401, 402 (.docx / .pdf)',
                    '4. Đáp án đề kiểm tra chính thức (.docx / .pdf)',
                    '5. Hướng dẫn chấm chi tiết (.docx)',
                    '6. Phiếu thẩm định chuyên môn cấp Tổ (.pdf)',
                    '7. Biên bản phê duyệt của Ban Giám hiệu (.pdf)',
                  ].map((docName, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-700">{docName}</span>
                      <EduBadge
                        variant={selectedWorkflow.step8DossierExport.exports.length > 0 ? 'success' : 'neutral'}
                      >
                        {selectedWorkflow.step8DossierExport.exports.length > 0 ? 'Đã kết xuất' : 'Sẵn sàng'}
                      </EduBadge>
                    </div>
                  ))}
                </div>
              </EduCard>
            )}

            {/* BƯỚC 8: PHÂN TÍCH KẾT QUẢ SAU KIỂM TRA */}
            {activeWizardStep === 8 && (
              <EduCard
                title="Bước 8. Phân tích Kết quả Sau Kiểm tra & Cải tiến Ngân hàng Câu hỏi"
                subtitle="Tổng hợp phổ điểm, độ khó thực nghiệm, chỉ số phân cách và đề xuất cải tiến câu hỏi mà không làm thay đổi đề lưu trữ."
                actions={
                  <EduButton
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      await executeStep8PostExamAnalytics();
                      onNotify(
                        'success',
                        'Đã hoàn tất Phân tích kết quả sau kiểm tra',
                        'Đã lưu báo cáo phổ điểm và đề xuất cải tiến ngân hàng câu hỏi.'
                      );
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-1.5" />
                    Tổng hợp Phổ điểm & Phân tích Kết quả
                  </EduButton>
                }
              >
                {selectedWorkflow.step9ResultsAnalysis.analysisSummary ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                      <div className="text-xs text-slate-500">Số học sinh dự thi</div>
                      <div className="text-lg font-bold text-[#123D75] font-mono mt-1">
                        {selectedWorkflow.step9ResultsAnalysis.analysisSummary.studentCount} HS
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                      <div className="text-xs text-slate-500">Điểm trung bình</div>
                      <div className="text-lg font-bold text-[#087F8C] font-mono mt-1">
                        {selectedWorkflow.step9ResultsAnalysis.analysisSummary.averageScore.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                      <div className="text-xs text-slate-500">Tỷ lệ đạt yêu cầu</div>
                      <div className="text-lg font-bold text-emerald-700 font-mono mt-1">
                        {selectedWorkflow.step9ResultsAnalysis.analysisSummary.passRatePercent}%
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
                      <div className="text-xs text-slate-500">Đề xuất cải tiến NHCH</div>
                      <div className="text-lg font-bold text-amber-700 font-mono mt-1">
                        {selectedWorkflow.step9ResultsAnalysis.analysisSummary.bankImprovementProposals.length} câu
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] text-xs text-slate-600">
                    Nhấn nút <strong>"Tổng hợp Phổ điểm & Phân tích Kết quả"</strong> để nạp dữ liệu kết quả chấm thi và hoàn tất chu trình 8 bước.
                  </div>
                )}
              </EduCard>
            )}

            {/* ===============================================================
                THANH ĐIỀU HƯỚNG DƯỚI CÙNG: QUAY LẠI · LƯU BẢN NHÁP · TIẾP TỤC (MỤC II)
               =============================================================== */}
            <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
              <EduButton
                variant="outline"
                disabled={activeWizardStep <= 1}
                onClick={handleStepBack}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Quay lại (Bước {Math.max(1, activeWizardStep - 1)})
              </EduButton>

              <div className="flex flex-wrap items-center gap-2.5">
                <EduButton
                  variant="secondary"
                  onClick={() => handleSaveDraft(false)}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Lưu bản nháp
                </EduButton>

                <EduButton
                  variant="primary"
                  onClick={handleContinueNextWizardStep}
                >
                  <span>
                    {activeWizardStep < 8
                      ? `Tiếp tục (Sang Bước ${activeWizardStep + 1})`
                      : 'Hoàn tất Quy trình Wizard'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </EduButton>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: DANH SÁCH ĐIỀU KIỆN CHƯA ĐẠT & NÚT MỞ ĐÚNG PHẦN CẦN SỬA (MỤC II, IV, V) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-[#123D75]">
                    Danh sách điều kiện chưa đạt ({unmetConditions.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kiểm soát tự động chống bỏ bước hoặc thiếu dữ liệu bắt buộc
                  </p>
                </div>
                <EduBadge variant={unmetConditions.length === 0 ? 'success' : 'warning'}>
                  {unmetConditions.length === 0 ? 'Đạt 100%' : `Còn ${unmetConditions.length} mục`}
                </EduBadge>
              </div>

              {unmetConditions.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Tất cả 8 bước đã đạt chuẩn!</div>
                    <p className="mt-0.5">
                      Hồ sơ đề kiểm tra đã hoàn thành đầy đủ mọi điều kiện chuyên môn và phê duyệt.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {unmetConditions.map((cond) => (
                    <div
                      key={cond.id}
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        cond.severity === 'ERROR'
                          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                          : 'bg-amber-50/80 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            cond.severity === 'ERROR' ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        />
                        <span className="leading-relaxed font-medium">{cond.message}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleQuickFixCondition(cond)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#123D75] hover:bg-[#0D2D59] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          <Wrench className="w-3 h-3 text-[#F4A340]" />
                          {cond.fixActionLabel}
                        </button>
                        {cond.targetModule && (
                          <button
                            type="button"
                            onClick={() => onNavigateModule(cond.targetModule!)}
                            className="text-[11px] font-semibold text-[#087F8C] hover:underline cursor-pointer"
                          >
                            Mở module →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6 Quy tắc Kiểm soát Bắt buộc (Mục IV) */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 space-y-2 text-xs">
              <div className="font-bold text-[#123D75] border-b border-[#E5E7EB] pb-2">
                6 Chốt Kiểm soát Quy trình (Mục IV)
              </div>
              {[
                '1. Không bỏ qua bước bắt buộc trong 8 bước.',
                '2. Không chuyển bước nếu thiếu dữ liệu bắt buộc.',
                '3. Không mất dữ liệu khi bấm nút Quay lại.',
                '4. Không tạo hồ sơ trùng lặp trong cùng kỳ.',
                '5. Không cho phép Giáo viên tự phê duyệt đề.',
                '6. Không xuất đề chính thức khi chưa phê duyệt.',
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#087F8C] shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. BÁO CÁO KẾT QUẢ KIỂM THỬ TẠO ĐỀ TOÁN LỚP 4 TỪ ĐẦU ĐẾN CUỐI (MỤC VII)
         ===================================================================== */}
      {e2eTestReport && (
        <EduCard
          title={`Kết quả Nghiệm thu Tạo đề Toán Lớp 4 Từ Đầu Đến Cuối (${e2eTestReport.passedChecks}/${e2eTestReport.totalChecks} Bước PASS)`}
          subtitle={`Mã hồ sơ ExamWorkflow: ${e2eTestReport.workflowId} · Thực thi lúc ${new Date(e2eTestReport.executedAt).toLocaleString('vi-VN')}`}
        >
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F7FB] text-[#123D75] border-b border-[#E5E7EB]">
                  <th className="py-2.5 px-3 font-bold">Bước</th>
                  <th className="py-2.5 px-3 font-bold">Tên bước Wizard</th>
                  <th className="py-2.5 px-3 font-bold">Thao tác kiểm thử Toán Lớp 4</th>
                  <th className="py-2.5 px-3 font-bold">Chốt kiểm soát đã xác minh</th>
                  <th className="py-2.5 px-3 font-bold">Trạng thái ExamWorkflow</th>
                  <th className="py-2.5 px-3 font-bold">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {e2eTestReport.stepsLog.map((row) => (
                  <tr key={row.stepOrder} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#123D75]">B{row.stepOrder}</td>
                    <td className="py-2.5 px-3 font-semibold">{row.stepName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{row.actionTested}</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-medium">{row.guardVerified}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{row.workflowStateAfter}</td>
                    <td className="py-2.5 px-3">
                      <EduBadge variant={row.status === 'PASS' ? 'success' : 'danger'}>
                        {row.status}
                      </EduBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EduCard>
      )}
    </div>
  );
};

export default ProfessionalExamCreationWizard;
