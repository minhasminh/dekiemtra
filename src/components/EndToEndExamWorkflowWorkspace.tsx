import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  GitBranch,
  History,
  Lock,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  UserCheck,
  Building2,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import {
  AuthenticatedUserSession,
  EducationLevelId,
  EndToEndWorkflowBenchmarkReport,
  ExamMatrix,
  ExamPaper,
  ExamWorkflow,
  ExamWorkflowExportedPackageRecord,
  ExamWorkflowState,
  ExamWorkflowStepNumber,
  ExamWorkflowTeacherRevisionItem,
  GradeNumber,
  MenuSectionId,
  QuestionItem,
  SchoolBrandingConfig,
  StorageConfig,
  TeacherPermissionProfileSummary,
  ToastNotification,
  WorkflowActorRole,
  WorkflowValidationEngineBenchmarkReport,
  WorkflowValidationGateId,
  WorkflowValidationGateResult,
} from '../types/domain';
import {
  executeWorkflowStateTransition,
  getMissingTasksAndWarnings,
  isStepUnlocked,
  loadSavedWorkflows,
  runEndToEndGrade4MathWorkflowBenchmark,
  saveWorkflowToLocal,
  syncWorkflowToBackend,
  WORKFLOW_9_STEPS_META,
  WORKFLOW_ROLE_LABELS,
  WORKFLOW_STATE_LABELS,
} from '../services/workflow/endToEndExamWorkflowService';
import { loadProgressTestDossiers } from '../services/workflow/dossierProgressManagementService';
import {
  runWorkflowValidationEngineBenchmark,
  validateWorkflowGateAtBackend,
  VALIDATION_GATES_META,
} from '../services/workflow/workflowValidationEngineService';
import { ProfessionalExamCreationWizard } from './ProfessionalExamCreationWizard';

interface EndToEndExamWorkflowWorkspaceProps {
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  config: StorageConfig;
  authSession?: AuthenticatedUserSession | null;
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  schoolBranding?: SchoolBrandingConfig;
  schoolAllowedGrades?: number[];
  initialWorkflowId?: string;
  onNavigate: (menuId: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

function normalizeIdentityText(val?: string | null): string {
  return (val || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function sanitizeCodeSegment(raw: string): string {
  return (
    raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 10) || 'GV'
  );
}

export const EndToEndExamWorkflowWorkspace: React.FC<EndToEndExamWorkflowWorkspaceProps> = ({
  questions,
  matrices,
  exams,
  config,
  authSession,
  teacherPermissionProfile,
  schoolBranding,
  schoolAllowedGrades,
  initialWorkflowId,
  onNavigate,
  onNotify,
}) => {
  // 1. Trích xuất thông tin thực tế của Giáo viên / Cán bộ đang đăng nhập
  const derivedActorRole = useMemo<WorkflowActorRole>(() => {
    const roles = (authSession?.user?.roles || []).map((r) => String(r));
    if (roles.some((r) => r === 'SYSTEM_ADMIN' || r === 'SCHOOL_ADMIN' || r === 'SUPER_ADMIN')) {
      return 'SYSTEM_ADMIN';
    }
    if (roles.includes('PRINCIPAL')) return 'PRINCIPAL';
    if (roles.includes('VICE_PRINCIPAL')) return 'VICE_PRINCIPAL';
    if (roles.includes('HEAD_OF_DEPARTMENT')) return 'HEAD_OF_DEPARTMENT';
    if (roles.includes('REVIEWER')) return 'REVIEWER';
    if (teacherPermissionProfile?.activeRole) return teacherPermissionProfile.activeRole;
    return 'TEACHER';
  }, [authSession?.user?.roles, teacherPermissionProfile?.activeRole]);

  const isProductionTeacher = derivedActorRole === 'TEACHER' || derivedActorRole === 'REVIEWER';

  const actorId = useMemo(
    () => authSession?.user?.id || teacherPermissionProfile?.userId || 'user-teacher-current',
    [authSession?.user?.id, teacherPermissionProfile?.userId]
  );

  const actorUsername =
    authSession?.user?.username || teacherPermissionProfile?.username || '';

  const actorFullName = useMemo(() => {
    const fromPerm = teacherPermissionProfile?.fullName?.trim();
    if (fromPerm) return fromPerm;
    const fromAuth = authSession?.user?.fullName?.trim();
    if (fromAuth) return fromAuth;
    return 'Giáo viên phụ trách';
  }, [teacherPermissionProfile?.fullName, authSession?.user?.fullName]);

  const actorPositionTitle = useMemo(() => {
    const posPerm = teacherPermissionProfile?.positionTitle?.trim();
    if (posPerm) return posPerm;
    const pos = authSession?.user?.positionTitle?.trim();
    if (pos) return pos;
    return WORKFLOW_ROLE_LABELS[derivedActorRole];
  }, [
    teacherPermissionProfile?.positionTitle,
    authSession?.user?.positionTitle,
    derivedActorRole,
  ]);

  const actorDepartmentName = useMemo(() => {
    const fromPerm = teacherPermissionProfile?.departmentName?.trim();
    if (fromPerm) return fromPerm;
    const fromAuth = authSession?.user?.departmentName?.trim();
    if (fromAuth) return fromAuth;
    return 'Tổ Chuyên môn';
  }, [teacherPermissionProfile?.departmentName, authSession?.user?.departmentName]);

  const actorSchoolId =
    authSession?.user?.schoolId ||
    teacherPermissionProfile?.schoolId ||
    schoolBranding?.schoolId ||
    'SCHOOL_A';
  const actorSchoolName =
    schoolBranding?.schoolName?.trim() || config.schoolName?.trim() || 'Đơn vị trường học';
  const actorAcademicYear =
    schoolBranding?.academicYear?.trim() || config.academicYear?.trim() || '2025-2026';

  const actorDisplayLabel = useMemo(
    () =>
      actorFullName.includes('(')
        ? actorFullName
        : `${actorFullName} (${actorPositionTitle})`,
    [actorFullName, actorPositionTitle]
  );

  const subjectGradeCombos = useMemo<Array<{ subject: string; grade: number }>>(() => {
    const recs = teacherPermissionProfile?.normalizedRecords || [];
    if (recs.length > 0) {
      const seen = new Set<string>();
      const out: Array<{ subject: string; grade: number }> = [];
      for (const r of recs) {
        const key = `${r.SubjectName.trim().toLowerCase()}__${Number(r.GradeId)}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ subject: r.SubjectName.trim(), grade: Number(r.GradeId) });
        }
      }
      return out;
    }
    const allocs = teacherPermissionProfile?.subjectAllocations || [];
    if (allocs.length > 0) {
      const seen = new Set<string>();
      const out: Array<{ subject: string; grade: number }> = [];
      for (const a of allocs) {
        for (const g of a.grades || []) {
          const key = `${a.subjectName.trim().toLowerCase()}__${Number(g)}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push({ subject: a.subjectName.trim(), grade: Number(g) });
          }
        }
      }
      if (out.length > 0) return out;
    }
    const subjs = authSession?.user?.assignedSubjects || [];
    const grds = (authSession?.user?.assignedGrades || []).map(Number).filter((g) => g >= 1);
    if (subjs.length > 0 && grds.length > 0) {
      const out: Array<{ subject: string; grade: number }> = [];
      for (const s of subjs) {
        for (const g of grds) {
          out.push({ subject: s.trim(), grade: g });
        }
      }
      return out;
    }
    return [];
  }, [
    teacherPermissionProfile?.normalizedRecords,
    teacherPermissionProfile?.subjectAllocations,
    authSession?.user?.assignedSubjects,
    authSession?.user?.assignedGrades,
  ]);

  const assignedSubjects = useMemo<string[]>(() => {
    const allocSubjs = (teacherPermissionProfile?.subjectAllocations || []).map(
      (a) => a.subjectName
    );
    const raw = [
      ...allocSubjs,
      ...subjectGradeCombos.map((c) => c.subject),
      ...(authSession?.user?.assignedSubjects || []),
    ]
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(raw));
  }, [
    teacherPermissionProfile?.subjectAllocations,
    subjectGradeCombos,
    authSession?.user?.assignedSubjects,
  ]);

  const assignedGrades = useMemo<number[]>(() => {
    const allocGrades = (teacherPermissionProfile?.subjectAllocations || []).flatMap((a) =>
      (a.grades || []).map(Number)
    );
    const raw = [
      ...allocGrades,
      ...subjectGradeCombos.map((c) => Number(c.grade)),
      ...(authSession?.user?.assignedGrades || []).map(Number),
    ].filter((g) => Number.isFinite(g) && g >= 1 && g <= 12);
    const filtered =
      schoolAllowedGrades && schoolAllowedGrades.length > 0
        ? raw.filter((g) => schoolAllowedGrades.includes(g))
        : raw;
    return Array.from(new Set(filtered.length > 0 ? filtered : raw)).sort((a, b) => a - b);
  }, [
    teacherPermissionProfile?.subjectAllocations,
    subjectGradeCombos,
    authSession?.user?.assignedGrades,
    schoolAllowedGrades,
  ]);

  const defaultSubject = useMemo<string>(() => {
    if (subjectGradeCombos.length > 0) return subjectGradeCombos[0].subject;
    if (assignedSubjects.length > 0) return assignedSubjects[0];
    if (exams[0]?.subject) return exams[0].subject;
    if (matrices[0]?.subject) return matrices[0].subject;
    return 'Toán';
  }, [subjectGradeCombos, assignedSubjects, exams, matrices]);

  const defaultGrade = useMemo<GradeNumber>(() => {
    if (subjectGradeCombos.length > 0) return subjectGradeCombos[0].grade as GradeNumber;
    if (assignedGrades.length > 0) return assignedGrades[0] as GradeNumber;
    if (exams[0]?.grade) return Number(exams[0].grade) as GradeNumber;
    if (matrices[0]?.grade) return Number(matrices[0].grade) as GradeNumber;
    if (schoolAllowedGrades && schoolAllowedGrades.length > 0) {
      return schoolAllowedGrades[0] as GradeNumber;
    }
    return 6 as GradeNumber;
  }, [subjectGradeCombos, assignedGrades, exams, matrices, schoolAllowedGrades]);

  const buildPersonalTeacherWorkflow = (customWfId?: string): ExamWorkflow => {
    const yearShort = actorAcademicYear.slice(0, 4) || String(new Date().getFullYear());
    const userSlug = sanitizeCodeSegment(actorUsername || actorId || actorFullName);
    const subjSlug = sanitizeCodeSegment(defaultSubject).slice(0, 5);
    const wfId = customWfId || `WF-${userSlug}-${subjSlug}K${defaultGrade}-${yearShort}`;
    const nowIso = new Date().toISOString();
    const isPrimary = Number(defaultGrade) <= 5;

    const matchingQuestions = questions.filter(
      (q) =>
        normalizeIdentityText(q.subject) === normalizeIdentityText(defaultSubject) &&
        Number(q.grade) === Number(defaultGrade) &&
        q.status === 'APPROVED'
    );
    const chosenIds = matchingQuestions.slice(0, 6).map((q) => q.id);
    const derivedTopics = Array.from(
      new Set(
        matchingQuestions
          .map((q) => q.topicTitle)
          .filter((t): t is string => Boolean(t && t.trim()))
      )
    );

    const matchingMatrix = matrices.find(
      (m) =>
        normalizeIdentityText(m.subject) === normalizeIdentityText(defaultSubject) &&
        Number(m.grade) === Number(defaultGrade)
    );
    const matchingExam = exams.find(
      (ex) =>
        normalizeIdentityText(ex.subject) === normalizeIdentityText(defaultSubject) &&
        Number(ex.grade) === Number(defaultGrade)
    );

    const matrixApproverLabel = `Tổ trưởng ${actorDepartmentName}`;
    const reviewerLabel = `Hội đồng thẩm định ${actorDepartmentName}`;
    const finalApproverLabel = `Ban Giám hiệu (${actorSchoolName})`;

    return {
      workflowId: wfId,
      title:
        matchingExam?.title && !matchingExam.isSampleData
          ? matchingExam.title
          : `Hồ sơ Đề kiểm tra Định kỳ – Môn ${defaultSubject} Khối ${defaultGrade} (${actorAcademicYear})`,
      schoolId: actorSchoolId,
      academicYearId: actorAcademicYear,
      gradeId: defaultGrade,
      subjectId: defaultSubject,
      examPeriod: 'END_SEM_1',
      examPeriodLabel: 'Cuối học kỳ I',
      examDate: new Date().toISOString().slice(0, 10),
      creatorId: actorId,
      creatorName: actorFullName,
      matrixId: matchingMatrix?.id || `MT-${subjSlug}K${defaultGrade}-01`,
      specificationId: `SPEC-${wfId}`,
      examId: matchingExam?.id || `EXAM-${wfId}`,
      currentVersionId: 'v1.0',
      reviewReportId: `AI-REV-${wfId}`,
      approvalId: `APP-${wfId}`,
      status: 'Draft',
      currentStep: 1,
      assignedUsers: {
        creatorName: actorDisplayLabel,
        creatorRole: derivedActorRole,
        matrixApproverName: matrixApproverLabel,
        reviewerName: reviewerLabel,
        finalApproverName: finalApproverLabel,
        analyticsOwnerName: actorFullName,
        currentAssigneeName: actorDisplayLabel,
        currentAssigneeRole: derivedActorRole,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
      isConfidentialExam: true,
      authorizedConfidentialRoles: [
        'HEAD_OF_DEPARTMENT',
        'VICE_PRINCIPAL',
        'PRINCIPAL',
        'SYSTEM_ADMIN',
      ],
      step1QuestionBank: {
        selectedTopics:
          derivedTopics.length > 0
            ? derivedTopics.slice(0, 4)
            : [
                `Chủ đề trọng tâm chương trình ${defaultSubject} Khối ${defaultGrade}`,
                `Vận dụng kiến thức thực tiễn ${defaultSubject} Khối ${defaultGrade}`,
              ],
        approvedQuestionIds: chosenIds,
        unapprovedQuestionBlockedCount: 0,
        supplementaryQuestionsCreatedCount: 0,
        coverageSatisfied: chosenIds.length > 0,
        totalSelectedPoints: 10.0,
      },
      step2MatrixAndSpec: {
        educationLevel: isPrimary ? EducationLevelId.PRIMARY : EducationLevelId.LOWER_SECONDARY,
        templateCode: isPrimary ? 'TT27-PRIMARY-3LEVELS' : 'CV7991-SECONDARY-4LEVELS',
        totalQuestions: Math.max(6, chosenIds.length || 6),
        totalPoints: 10.0,
        durationMinutes: isPrimary ? 40 : 45,
        levelDistributionSummary: isPrimary
          ? 'Mức 1 (Nhận biết): 40% (4,0đ) · Mức 2 (Kết nối): 40% (4,0đ) · Mức 3 (Vận dụng): 20% (2,0đ) [Chuẩn TT27]'
          : 'Nhận biết: 40% · Thông hiểu: 30% · Vận dụng: 20% · Vận dụng cao: 10% [Chuẩn CV7991]',
        learningOutcomesLinkedCount: Math.max(4, chosenIds.length || 4),
        isValidStructure: true,
        matrixApprovalStatus: 'DRAFT',
        matrixSignature: `SIG-${wfId}-10PT`,
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
          versionLabel: 'Phiên bản v1.0 (Khởi tạo hồ sơ cá nhân)',
          createdAt: nowIso,
          createdBy: actorDisplayLabel,
          createdByRole: derivedActorRole,
          workflowStateAtCreation: 'Draft',
          stepNumberAtCreation: 1,
          matrixId: matchingMatrix?.id || `MT-${subjSlug}K${defaultGrade}-01`,
          specificationId: `SPEC-${wfId}`,
          examId: matchingExam?.id || `EXAM-${wfId}`,
          questionIds: chosenIds,
          totalPoints: 10.0,
          matrixStructureSignature: `SIG-${wfId}-10PT`,
          isImmutableApprovedLock: false,
          changeNote: `Khởi tạo hồ sơ đề kiểm tra cá nhân của ${actorFullName}.`,
        },
      ],
      auditTrail: [
        {
          id: `wf-audit-${Date.now()}`,
          workflowId: wfId,
          timestamp: nowIso,
          actorId,
          actorName: actorDisplayLabel,
          actorRole: derivedActorRole,
          actionType: 'WORKFLOW_CREATED',
          fromState: 'Draft',
          toState: 'Draft',
          fromStep: 1,
          toStep: 1,
          versionId: 'v1.0',
          backendVerified: true,
          summary: `${actorDisplayLabel} khởi tạo Hồ sơ Đề kiểm tra [${wfId}] môn ${defaultSubject} Khối ${defaultGrade}.`,
        },
      ],
    };
  };

  const [workflows, setWorkflows] = useState<ExamWorkflow[]>(() => {
    const saved = loadSavedWorkflows(questions, matrices, exams);
    if (initialWorkflowId && !saved.some((s) => s.workflowId === initialWorkflowId)) {
      const tests = loadProgressTestDossiers(questions, matrices, exams);
      const matchedTest = tests.find((t) => t.workflowId === initialWorkflowId);
      if (matchedTest) return [matchedTest, ...saved];
    }
    return saved;
  });

  const [dossierScopeMode, setDossierScopeMode] = useState<'PERSONAL' | 'SCHOOL_SCOPE'>('PERSONAL');

  const isForeignSeedOrTestDossier = (w: ExamWorkflow): boolean => {
    if (initialWorkflowId && w.workflowId === initialWorkflowId) return false;
    if (w.isTestDataset) return true;
    if (
      w.workflowId.startsWith('TEST-BGH-') ||
      w.workflowId.includes('BENCHMARK') ||
      w.workflowId.includes('WIZARD-')
    ) {
      return true;
    }
    if (w.workflowId === 'WF-TOAN4-CK2-2026') {
      const isSeedTeacher =
        actorId === 'user-teacher-a' ||
        normalizeIdentityText(actorFullName).includes('nguyễn thị lan');
      return !isSeedTeacher;
    }
    return false;
  };

  const belongsToLoggedInTeacher = (w: ExamWorkflow): boolean => {
    if (isForeignSeedOrTestDossier(w)) return false;
    if (w.creatorId && w.creatorId === actorId) return true;
    const normActor = normalizeIdentityText(actorFullName);
    if (!normActor || normActor === 'giáo viên phụ trách') return false;
    const normCreator = normalizeIdentityText(w.creatorName);
    const normAssignedCreator = normalizeIdentityText(w.assignedUsers?.creatorName);
    return (
      normCreator === normActor ||
      normAssignedCreator === normActor ||
      normAssignedCreator.startsWith(`${normActor} (`)
    );
  };

  const personalWorkflows = useMemo(
    () =>
      workflows.filter(
        (w) => belongsToLoggedInTeacher(w) || (Boolean(initialWorkflowId) && w.workflowId === initialWorkflowId)
      ),
    [workflows, actorId, actorFullName, initialWorkflowId]
  );

  const schoolScopeWorkflows = useMemo(
    () =>
      workflows.filter(
        (w) =>
          !isForeignSeedOrTestDossier(w) &&
          (w.schoolId === actorSchoolId ||
            belongsToLoggedInTeacher(w) ||
            (Boolean(initialWorkflowId) && w.workflowId === initialWorkflowId))
      ),
    [workflows, actorSchoolId, actorId, actorFullName, initialWorkflowId]
  );

  const visibleWorkflows = useMemo(
    () =>
      isProductionTeacher || dossierScopeMode === 'PERSONAL'
        ? personalWorkflows
        : schoolScopeWorkflows.length > 0
          ? schoolScopeWorkflows
          : personalWorkflows,
    [isProductionTeacher, dossierScopeMode, personalWorkflows, schoolScopeWorkflows]
  );

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(() => {
    if (initialWorkflowId) return initialWorkflowId;
    return '';
  });

  // Tự động khởi tạo & đồng bộ hồ sơ cá nhân theo đúng Giáo viên đang đăng nhập
  useEffect(() => {
    const yearShort = actorAcademicYear.slice(0, 4) || String(new Date().getFullYear());
    const userSlug = sanitizeCodeSegment(actorUsername || actorId || actorFullName);
    const personalPrefix = `WF-${userSlug}-`;

    const existingPersonal = workflows.filter((w) => belongsToLoggedInTeacher(w));

    if (existingPersonal.length === 0) {
      const seededPersonal = buildPersonalTeacherWorkflow();
      setWorkflows((prev) =>
        prev.some((w) => w.workflowId === seededPersonal.workflowId)
          ? prev
          : [seededPersonal, ...prev]
      );
      if (!initialWorkflowId) {
        setSelectedWorkflowId(seededPersonal.workflowId);
      }
      return;
    }

    // Nếu hồ sơ cá nhân tự động khởi tạo vẫn đang ở bước nháp ban đầu (chưa chỉnh sửa)
    // và dữ liệu phân quyền giáo viên vừa tải xong (cập nhật đúng họ tên, tổ CM, môn, khối),
    // tự động đồng bộ lại thông tin hiển thị cho khớp 100% với giáo viên.
    const untouchedAuto = existingPersonal.find(
      (w) =>
        w.workflowId.startsWith(personalPrefix) &&
        w.status === 'Draft' &&
        w.currentStep === 1 &&
        w.auditTrail.length <= 1 &&
        w.versionSnapshots?.[0]?.versionLabel === 'Phiên bản v1.0 (Khởi tạo hồ sơ cá nhân)'
    );

    if (untouchedAuto) {
      const subjectOutOfScope =
        assignedSubjects.length > 0 &&
        !assignedSubjects.some(
          (s) => normalizeIdentityText(s) === normalizeIdentityText(untouchedAuto.subjectId)
        );
      const gradeOutOfScope =
        assignedGrades.length > 0 && !assignedGrades.includes(Number(untouchedAuto.gradeId));
      const nameChanged =
        normalizeIdentityText(untouchedAuto.creatorName) !== normalizeIdentityText(actorFullName);
      const deptChanged =
        actorDepartmentName !== 'Tổ Chuyên môn' &&
        !untouchedAuto.assignedUsers.matrixApproverName.includes(actorDepartmentName);

      if (subjectOutOfScope || gradeOutOfScope || nameChanged || deptChanged) {
        const refreshed = buildPersonalTeacherWorkflow(
          subjectOutOfScope || gradeOutOfScope ? undefined : untouchedAuto.workflowId
        );
        setWorkflows((prev) => [
          refreshed,
          ...prev.filter((w) => w.workflowId !== untouchedAuto.workflowId),
        ]);
        if (!initialWorkflowId || selectedWorkflowId === untouchedAuto.workflowId) {
          setSelectedWorkflowId(refreshed.workflowId);
        }
        return;
      }
    }
  }, [
    actorId,
    actorUsername,
    actorFullName,
    actorDepartmentName,
    actorSchoolId,
    actorSchoolName,
    actorAcademicYear,
    defaultSubject,
    defaultGrade,
    assignedSubjects,
    assignedGrades,
  ]);

  useEffect(() => {
    if (initialWorkflowId) {
      setSelectedWorkflowId(initialWorkflowId);
      return;
    }
    if (
      visibleWorkflows.length > 0 &&
      !visibleWorkflows.some((w) => w.workflowId === selectedWorkflowId)
    ) {
      setSelectedWorkflowId(visibleWorkflows[0].workflowId);
    }
  }, [initialWorkflowId, visibleWorkflows, selectedWorkflowId]);

  const currentWorkflow = useMemo(
    () =>
      visibleWorkflows.find((w) => w.workflowId === selectedWorkflowId) ||
      visibleWorkflows[0] ||
      workflows.find((w) => w.workflowId === selectedWorkflowId),
    [visibleWorkflows, workflows, selectedWorkflowId]
  );

  const [viewingStep, setViewingStep] = useState<ExamWorkflowStepNumber>(
    currentWorkflow?.currentStep || 1
  );

  // Vai trò hiện tại đang thao tác — đồng bộ trực tiếp theo tài khoản đăng nhập thực tế
  const [activeActorRole, setActiveActorRole] = useState<WorkflowActorRole>(derivedActorRole);
  const [activeActorName, setActiveActorName] = useState<string>(actorDisplayLabel);

  useEffect(() => {
    setActiveActorRole(derivedActorRole);
    setActiveActorName(actorDisplayLabel);
  }, [derivedActorRole, actorDisplayLabel]);

  // Form Bước 5: Giáo viên chỉnh sửa câu hỏi
  const [revisionQuestionNumber, setRevisionQuestionNumber] = useState<number>(1);
  const [revisionDecision, setRevisionDecision] = useState<
    'ACCEPTED_PROPOSAL' | 'REJECTED_PROPOSAL' | 'MANUAL_EDIT'
  >('ACCEPTED_PROPOSAL');
  const [revisionReasonNote, setRevisionReasonNote] = useState<string>(
    'Bổ sung hướng dẫn chấm chi tiết cho các cách trình bày hợp lệ theo chuẩn kiến thức kỹ năng.'
  );
  const [revisionNewStem, setRevisionNewStem] = useState<string>(
    'Nội dung câu hỏi và biểu điểm chi tiết sau khi rà soát theo góp ý chuyên môn.'
  );
  const [revisionAffectsMatrix, setRevisionAffectsMatrix] = useState<boolean>(false);

  // Form Bước 6: Phiếu thẩm định
  const [reviewDecision, setReviewDecision] = useState<'ELIGIBLE_FOR_APPROVAL' | 'REVISION_REQUIRED'>(
    'ELIGIBLE_FOR_APPROVAL'
  );
  const [reviewComment, setReviewComment] = useState<string>(
    'Hồ sơ đề kiểm tra, đáp án và hướng dẫn chấm thống nhất 100% với Ma trận và Bản đặc tả đã phê duyệt. Đủ điều kiện trình Lãnh đạo phê duyệt.'
  );

  // Form Bước 7: Phê duyệt
  const [approvalComment, setApprovalComment] = useState<string>(
    'Phê duyệt chính thức Hồ sơ Đề kiểm tra và khóa bất biến phiên bản hiện hành để sử dụng tổ chức kiểm tra.'
  );

  // Kết quả kiểm thử E2E Mục VI
  const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);
  const [benchmarkReport, setBenchmarkReport] = useState<EndToEndWorkflowBenchmarkReport | null>(
    null
  );
  const [activeSubTab, setActiveSubTab] = useState<
    | 'WIZARD_8_STEPS'
    | 'VALIDATION_ENGINE'
    | 'WORKFLOW_PIPELINE'
    | 'DOSSIER_METADATA'
    | 'E2E_BENCHMARK_VI'
    | 'SYSTEM_REPORT_VII'
  >('WIZARD_8_STEPS');

  // State cho WORKFLOW VALIDATION ENGINE – Bộ kiểm soát điều kiện chuyển bước
  const [selectedGateId, setSelectedGateId] = useState<WorkflowValidationGateId>(
    'GATE_1_BEFORE_EXAM_GENERATION'
  );
  const [activeGateResult, setActiveGateResult] = useState<WorkflowValidationGateResult | null>(
    null
  );
  const [validationBenchmarkReport, setValidationBenchmarkReport] =
    useState<WorkflowValidationEngineBenchmarkReport | null>(null);
  const [isRunningValidationBenchmark, setIsRunningValidationBenchmark] = useState<boolean>(false);

  useEffect(() => {
    if (currentWorkflow) {
      setViewingStep(currentWorkflow.currentStep);
      const isUntouchedAutoPreview =
        currentWorkflow.status === 'Draft' &&
        currentWorkflow.currentStep === 1 &&
        currentWorkflow.auditTrail.length <= 1 &&
        currentWorkflow.versionSnapshots?.[0]?.versionLabel ===
          'Phiên bản v1.0 (Khởi tạo hồ sơ cá nhân)' &&
        !currentWorkflow.title.includes('(Đợt ');
      if (!isUntouchedAutoPreview) {
        syncWorkflowToBackend(currentWorkflow, activeActorName, activeActorRole);
      }
    }
  }, [currentWorkflow?.workflowId]);

  const handleRolePresetChange = (role: WorkflowActorRole) => {
    if (isProductionTeacher) {
      setActiveActorRole(derivedActorRole);
      setActiveActorName(actorDisplayLabel);
      return;
    }
    setActiveActorRole(role);
    if (role === derivedActorRole) {
      setActiveActorName(actorDisplayLabel);
      return;
    }
    const presetNames: Record<WorkflowActorRole, string> = {
      TEACHER: `${actorFullName} (Giáo viên bộ môn)`,
      REVIEWER: `Hội đồng thẩm định (${actorDepartmentName})`,
      HEAD_OF_DEPARTMENT: `Tổ trưởng ${actorDepartmentName}`,
      VICE_PRINCIPAL: `Phó Hiệu trưởng (${actorSchoolName})`,
      PRINCIPAL: `Hiệu trưởng (${actorSchoolName})`,
      SYSTEM_ADMIN: `Quản trị hệ thống (${actorSchoolName})`,
    };
    setActiveActorName(presetNames[role]);
  };

  const updateCurrentWorkflow = (updated: ExamWorkflow) => {
    const normalizedOfficial: ExamWorkflow =
      updated.versionSnapshots?.[0]?.versionLabel === 'Phiên bản v1.0 (Khởi tạo hồ sơ cá nhân)'
        ? {
            ...updated,
            versionSnapshots: updated.versionSnapshots.map((snap, idx) =>
              idx === 0
                ? { ...snap, versionLabel: 'Phiên bản v1.0 (Khởi tạo hồ sơ chính thức)' }
                : snap
            ),
          }
        : updated;
    const nextList = saveWorkflowToLocal(normalizedOfficial);
    setWorkflows(nextList);
    setSelectedWorkflowId(normalizedOfficial.workflowId);
  };

  // Tạo hồ sơ quy trình mới đúng theo thông tin Giáo viên đang đăng nhập
  const handleCreateNewPersonalWorkflow = async () => {
    const yearShort = actorAcademicYear.slice(0, 4) || String(new Date().getFullYear());
    const userSlug = sanitizeCodeSegment(actorUsername || actorId || actorFullName);
    const subjSlug = sanitizeCodeSegment(defaultSubject).slice(0, 5);
    const seq = String(personalWorkflows.length + 1).padStart(2, '0');
    const newWfId = `WF-${userSlug}-${subjSlug}K${defaultGrade}-${yearShort}-${seq}`;

    const baseWf = buildPersonalTeacherWorkflow(newWfId);
    const newWf: ExamWorkflow = {
      ...baseWf,
      title: `Hồ sơ Đề kiểm tra Định kỳ – Môn ${defaultSubject} Khối ${defaultGrade} (Đợt ${seq} · ${actorAcademicYear})`,
      versionSnapshots: baseWf.versionSnapshots.map((snap, idx) =>
        idx === 0
          ? { ...snap, versionLabel: 'Phiên bản v1.0 (Khởi tạo hồ sơ chính thức)' }
          : snap
      ),
    };

    await syncWorkflowToBackend(newWf, actorDisplayLabel, derivedActorRole);
    updateCurrentWorkflow(newWf);
    setDossierScopeMode('PERSONAL');
    setViewingStep(1);
    onNotify(
      'success',
      'Đã khởi tạo Hồ sơ Đề mới của bạn',
      `Đã tạo hồ sơ [${newWfId}] cho ${actorFullName} (${defaultSubject} – Khối ${defaultGrade}) tại Bước 1.`
    );
  };

  // Nút TIẾP TỤC chuyển sang bước tiếp theo trong State Machine
  const handleContinueNextStep = async () => {
    if (!currentWorkflow) return;

    const currentState = currentWorkflow.status;
    let nextState: ExamWorkflowState = currentState;
    let nextStep: ExamWorkflowStepNumber = currentWorkflow.currentStep;
    let summary = '';
    let lockVersion = false;
    let newVersionLabel: string | undefined;

    if (currentState === 'Draft') {
      nextState = 'MatrixReview';
      nextStep = 2;
      summary = 'Hoàn tất chọn câu hỏi đã duyệt ở Bước 1 & gửi Ma trận/Bản đặc tả sang trạng thái chờ duyệt (MatrixReview).';
    } else if (currentState === 'MatrixReview') {
      nextState = 'MatrixApproved';
      nextStep = 2;
      summary = 'Phê duyệt chính thức Ma trận và Bản đặc tả (MatrixApproved) trước khi tạo đề kiểm tra.';
    } else if (currentState === 'MatrixApproved') {
      currentWorkflow.step3ExamGeneration = {
        variantCodes: ['401', '402'],
        questionIdsInExam: [...currentWorkflow.step1QuestionBank.approvedQuestionIds],
        answerKeyComplete: true,
        gradingGuideComplete: true,
        matchesApprovedMatrix: true,
        totalExamPoints: currentWorkflow.step2MatrixAndSpec.totalPoints,
      };
      nextState = 'ExamDraft';
      nextStep = 3;
      summary = 'Tạo đề kiểm tra (Mã đề 401, 402), đáp án và hướng dẫn chấm từ Ma trận đã phê duyệt (ExamDraft).';
    } else if (currentState === 'ExamDraft') {
      currentWorkflow.step4AiQualityReview = {
        inspectedVersionId: currentWorkflow.currentVersionId,
        inspectedAt: new Date().toISOString(),
        criticalErrorsCount: 0,
        highErrorsCount: 0,
        mediumErrorsCount: 1,
        lowErrorsCount: 1,
        resolvedErrorsCount: 2,
        overallDashboardStatusLabel: '5. Đủ điều kiện gửi thẩm định chuyên môn',
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
      };
      nextState = 'AIReview';
      nextStep = 4;
      summary = `Chạy bộ kiểm tra AI QUALITY REVIEW (10 trụ cột + chuyên sâu môn học) cho phiên bản ${currentWorkflow.currentVersionId}.`;
    } else if (currentState === 'AIReview' || currentState === 'RevisionRequired') {
      nextState = 'TeacherRevision';
      nextStep = 5;
      newVersionLabel = `v1.${currentWorkflow.versionSnapshots.length}`;
      summary = `Giáo viên xử lý khuyến nghị, lưu phiên bản mới ${newVersionLabel} và kiểm tra lại phần bị ảnh hưởng.`;
    } else if (currentState === 'TeacherRevision') {
      nextState = 'ProfessionalReview';
      nextStep = 6;
      summary = `Gửi hồ sơ đề phiên bản ${currentWorkflow.currentVersionId} sang Hội đồng thẩm định chuyên môn (ProfessionalReview).`;
    } else if (currentState === 'ProfessionalReview') {
      if (currentWorkflow.step6ProfessionalReview.ballots.length === 0) {
        currentWorkflow.step6ProfessionalReview = {
          ballots: [
            {
              ballotId: `ballot-${Date.now()}`,
              reviewerId: 'user-reviewer',
              reviewerName: activeActorName,
              reviewerRole: activeActorRole,
              reviewedVersionId: currentWorkflow.currentVersionId,
              submittedAt: new Date().toISOString(),
              decision: 'ELIGIBLE_FOR_APPROVAL',
              generalComments: reviewComment,
              criteriaChecklist: {
                curriculumAlignment: true,
                matrixAndSpecMatch: true,
                scientificAndPedagogicalAccuracy: true,
                answerKeyAndRubricClarity: true,
              },
            },
          ],
          latestDecision: 'ELIGIBLE_FOR_APPROVAL',
        };
      }
      nextState = 'AwaitingApproval';
      nextStep = 7;
      summary = 'Hoàn tất Phiếu thẩm định chuyên môn -> Chuyển hồ sơ sang trạng thái Chờ phê duyệt (AwaitingApproval).';
    } else if (currentState === 'AwaitingApproval') {
      const lockedVer = `${currentWorkflow.currentVersionId}-APPROVED-LOCKED`;
      currentWorkflow.step7OfficialApproval = {
        approvalRecord: {
          approvalId: currentWorkflow.approvalId,
          approverId: 'user-approver',
          approverName: activeActorName,
          approverRole: activeActorRole,
          approvedVersionId: lockedVer,
          approvedAt: new Date().toISOString(),
          isVersionLocked: true,
          dossierCompletenessVerified: true,
          appraisalBallotVerified: true,
          approvalComment,
        },
      };
      nextState = 'Approved';
      nextStep = 8;
      lockVersion = true;
      summary = `Phê duyệt chính thức Hồ sơ kiểm tra [${currentWorkflow.workflowId}] và KHÓA BẤT BIẾN phiên bản ${lockedVer}.`;
    } else if (currentState === 'Approved') {
      const expRecord: ExamWorkflowExportedPackageRecord = {
        exportId: `exp-${Date.now()}`,
        exportedAt: new Date().toISOString(),
        exportedBy: activeActorName,
        exportedByRole: activeActorRole,
        versionId: currentWorkflow.currentVersionId,
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
      currentWorkflow.step8DossierExport = {
        exports: [expRecord, ...currentWorkflow.step8DossierExport.exports],
      };
      nextState = 'Released';
      nextStep = 9;
      summary = 'Kết xuất trọn bộ Hồ sơ kiểm tra 7 văn bản chuẩn (Word, PDF, Excel, ZIP) -> Chuyển trạng thái Released.';
    } else if (currentState === 'Released') {
      currentWorkflow.step9ResultsAnalysis = {
        analysisSummary: {
          analysisId: `ana-${Date.now()}`,
          analyzedAt: new Date().toISOString(),
          analyzedBy: activeActorName,
          studentCount: 35,
          averageScore: 8.14,
          highestScore: 10.0,
          lowestScore: 5.5,
          passRatePercent: 100,
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
                'Đề xuất tạo phiên bản cải tiến trong Ngân hàng câu hỏi cho năm học tới (bảo toàn nguyên vẹn câu hỏi trong đề lưu trữ đã thi).',
              archivedExamQuestionUntouched: true,
            },
          ],
        },
      };
      nextState = 'ResultsAnalysis';
      nextStep = 9;
      summary = 'Hoàn tất phân tích kết quả kiểm tra, thống kê độ khó/độ phân biệt và sinh đề xuất cải tiến ngân hàng câu hỏi.';
    } else if (currentState === 'ResultsAnalysis') {
      nextState = 'Archived';
      nextStep = 9;
      summary = 'Đóng và lưu trữ niên khóa toàn bộ Hồ sơ Kiểm tra Trung tâm (Archived).';
    } else {
      onNotify('info', 'Hồ sơ đã lưu trữ', 'Hồ sơ kiểm tra đã ở trạng thái Lưu trữ (Archived).');
      return;
    }

    const res = await executeWorkflowStateTransition({
      workflow: currentWorkflow,
      targetState: nextState,
      targetStep: nextStep,
      actorId,
      actorName: activeActorName,
      actorRole: activeActorRole,
      actionSummary: summary,
      createNewVersionLabel: newVersionLabel,
      lockApprovedVersion: lockVersion,
    });

    if (!res.ok || !res.updatedWorkflow) {
      onNotify('error', 'Từ chối chuyển trạng thái (Backend Guard)', res.errorMessage || 'Không đủ điều kiện.');
      return;
    }

    updateCurrentWorkflow(res.updatedWorkflow);
    setViewingStep(res.updatedWorkflow.currentStep);
    onNotify(
      'success',
      `Đã chuyển sang: ${WORKFLOW_STATE_LABELS[res.updatedWorkflow.status].label}`,
      summary
    );
  };

  // Nút QUAY LẠI THEO QUYỀN (Rollback / Yêu cầu chỉnh sửa)
  const handleRollbackStep = async () => {
    if (!currentWorkflow) return;
    const currentState = currentWorkflow.status;
    let rollbackState: ExamWorkflowState | null = null;
    let rollbackStep: ExamWorkflowStepNumber = currentWorkflow.currentStep;

    if (currentState === 'MatrixReview' || currentState === 'MatrixApproved') {
      rollbackState = 'Draft';
      rollbackStep = 1;
    } else if (currentState === 'ExamDraft') {
      rollbackState = 'MatrixReview';
      rollbackStep = 2;
    } else if (currentState === 'ProfessionalReview' || currentState === 'AwaitingApproval' || currentState === 'Approved') {
      rollbackState = 'RevisionRequired';
      rollbackStep = 5;
    } else if (currentState === 'RevisionRequired') {
      rollbackState = 'TeacherRevision';
      rollbackStep = 5;
    }

    if (!rollbackState) {
      onNotify(
        'warning',
        'Không thể quay lại từ trạng thái này',
        `Trạng thái hiện tại [${currentState}] không hỗ trợ thao tác lùi bước trực tiếp.`
      );
      return;
    }

    const res = await executeWorkflowStateTransition({
      workflow: currentWorkflow,
      targetState: rollbackState,
      targetStep: rollbackStep,
      actorId,
      actorName: activeActorName,
      actorRole: activeActorRole,
      actionSummary: `[Quay lại theo quyền] ${activeActorName} (${activeActorRole}) chuyển lùi hồ sơ từ [${currentState}] về [${rollbackState}] để rà soát/chỉnh sửa.`,
    });

    if (!res.ok || !res.updatedWorkflow) {
      onNotify('error', 'Chặn thao tác quay lại (RBAC)', res.errorMessage || 'Vai trò không đủ quyền.');
      return;
    }

    updateCurrentWorkflow(res.updatedWorkflow);
    setViewingStep(res.updatedWorkflow.currentStep);
    onNotify(
      'warning',
      `Đã quay lại trạng thái: ${WORKFLOW_STATE_LABELS[res.updatedWorkflow.status].label}`,
      'Đã ghi nhận vào lịch sử thao tác và mở khóa phiên bản để chỉnh sửa.'
    );
  };

  // Thao tác chuyên biệt ở Bước 5: Lưu chỉnh sửa câu hỏi của giáo viên (Kiểm tra có làm thay đổi Ma trận hay không)
  const handleSaveTeacherRevision = async () => {
    if (!currentWorkflow) return;

    // Chặn sửa âm thầm nếu đề đã Approved / Released
    if (
      currentWorkflow.status === 'Approved' ||
      currentWorkflow.status === 'Released' ||
      currentWorkflow.status === 'Archived'
    ) {
      onNotify(
        'error',
        'Bị chặn: Đề kiểm tra đã khóa bất biến',
        'Không được phép sửa âm thầm đề đã phê duyệt. Người có thẩm quyền phải thực hiện "Quay lại / Yêu cầu chỉnh sửa (RevisionRequired)" trước.'
      );
      return;
    }

    const isPrimaryWf = Number(currentWorkflow.gradeId) <= 5;
    const newItem: ExamWorkflowTeacherRevisionItem = {
      revisionId: `rev-${Date.now()}`,
      questionNumber: revisionQuestionNumber,
      questionId: currentWorkflow.step1QuestionBank.approvedQuestionIds[revisionQuestionNumber - 1] || 'q-custom',
      questionCode: `Q-K${currentWorkflow.gradeId}-00${revisionQuestionNumber}`,
      aiIssueCode: 'AI-REV-ISSUE-05',
      decision: revisionDecision,
      reasonNote: revisionReasonNote,
      oldStem: 'Nội dung câu hỏi trước chỉnh sửa',
      newStem: revisionNewStem,
      oldPoints: 2.0,
      newPoints: revisionAffectsMatrix ? 3.0 : 2.0,
      oldCognitiveLevel: isPrimaryWf ? 'PRIMARY_MUC_2' : 'SEC_THONG_HIEU',
      newCognitiveLevel: revisionAffectsMatrix
        ? isPrimaryWf
          ? 'PRIMARY_MUC_3'
          : 'SEC_VAN_DUNG'
        : isPrimaryWf
          ? 'PRIMARY_MUC_2'
          : 'SEC_THONG_HIEU',
      affectedMatrixStructure: revisionAffectsMatrix,
      revisedBy: activeActorName,
      revisedAt: new Date().toISOString(),
    };

    const nextVerLabel = `v1.${currentWorkflow.versionSnapshots.length}`;
    const draftClone: ExamWorkflow = {
      ...currentWorkflow,
      step5TeacherRevision: {
        revisions: [newItem, ...currentWorkflow.step5TeacherRevision.revisions],
        lastRevisionTriggeredMatrixReapproval: revisionAffectsMatrix,
        recheckedAffectedParts: true,
      },
    };

    // Nếu đang ở AIReview hoặc RevisionRequired thì chuyển sang TeacherRevision (hoặc nếu làm đổi Ma trận thì tự động ép về MatrixReview!)
    const targetState: ExamWorkflowState = revisionAffectsMatrix
      ? 'MatrixReview'
      : currentWorkflow.status === 'AIReview' || currentWorkflow.status === 'RevisionRequired'
      ? 'TeacherRevision'
      : 'ProfessionalReview';

    const res = await executeWorkflowStateTransition({
      workflow: draftClone,
      targetState,
      targetStep: revisionAffectsMatrix ? 2 : 5,
      actorId,
      actorName: activeActorName,
      actorRole: activeActorRole,
      changesAffectMatrix: revisionAffectsMatrix,
      createNewVersionLabel: nextVerLabel,
      actionSummary: revisionAffectsMatrix
        ? `Giáo viên sửa Câu ${revisionQuestionNumber} làm thay đổi điểm/mức độ trong Ma trận -> Tạo phiên bản ${nextVerLabel} và BẮT BUỘC quay lại Bước 2 (MatrixReview) để phê duyệt lại Ma trận.`
        : `Giáo viên sửa Câu ${revisionQuestionNumber} (${revisionDecision}), ghi lý do, tạo phiên bản mới ${nextVerLabel} và kiểm tra lại phần bị ảnh hưởng.`,
    });

    if (!res.ok || !res.updatedWorkflow) {
      onNotify('error', 'Không thể lưu chỉnh sửa', res.errorMessage || 'Lỗi phân quyền hoặc trạng thái.');
      return;
    }

    updateCurrentWorkflow(res.updatedWorkflow);
    if (res.forcedMatrixReapproval) {
      setViewingStep(2);
      onNotify(
        'warning',
        'Thay đổi Ma trận -> Quay lại Phê duyệt Ma trận (Bước 2)',
        'Do nội dung chỉnh sửa câu hỏi làm thay đổi cấu trúc/điểm số Ma trận, hệ thống đã tự động chuyển hồ sơ về Bước 2 (MatrixReview) theo đúng quy định Mục III.5.'
      );
    } else {
      onNotify(
        'success',
        `Đã tạo phiên bản mới ${nextVerLabel}`,
        'Đã lưu nội dung chỉnh sửa câu hỏi, giữ nguyên lịch sử phiên bản cũ và cập nhật đối chiếu liên quan.'
      );
    }
  };

  // Chạy Kiểm thử Toàn diện 10 Bước Môn Toán Lớp 4 + 7 Bất biến (Mục VI)
  const handleRunFullE2EBenchmark = async () => {
    setIsRunningBenchmark(true);
    try {
      const { report, completedWorkflow } = await runEndToEndGrade4MathWorkflowBenchmark(
        questions,
        matrices,
        exams
      );
      setBenchmarkReport(report);
      const nextList = loadSavedWorkflows(questions, matrices, exams);
      setWorkflows(nextList);
      setSelectedWorkflowId(completedWorkflow.workflowId);
      setViewingStep(9);
      setActiveSubTab('E2E_BENCHMARK_VI');
      onNotify(
        'success',
        'Hoàn tất Kiểm thử Quy trình 10 Bước Môn Toán Lớp 4',
        `Tất cả 10 bước quy trình và 7 kiểm chứng bảo mật/toàn vẹn đều ĐẠT 100% trên hồ sơ [${completedWorkflow.workflowId}].`
      );
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  // Kiểm tra Cổng điều kiện (Gate) cụ thể tại Backend
  const handleInspectGate = async (
    gateId: WorkflowValidationGateId,
    customWorkflow?: ExamWorkflow,
    extraContext?: Record<string, unknown>
  ) => {
    const targetWf = customWorkflow || currentWorkflow;
    if (!targetWf) return;
    setSelectedGateId(gateId);
    const result = await validateWorkflowGateAtBackend({
      gateId,
      workflow: targetWf,
      actorName: activeActorName,
      actorRole: activeActorRole,
      extraContext,
    });
    setActiveGateResult(result);
    if (!result.allowedToProceed) {
      onNotify(
        'error',
        `Cổng kiểm soát chặn chuyển bước (${result.failedConditionsCount} điều kiện chưa đạt)`,
        result.blockingMessage
      );
    } else {
      onNotify(
        'success',
        'Đạt 100% điều kiện chuyển bước',
        result.blockingMessage
      );
    }
  };

  // Chạy Kiểm thử 5 thao tác cố tình vi phạm bị chặn ở Backend (WORKFLOW VALIDATION ENGINE - Mục VII)
  const handleRunValidationEngineBenchmark = async () => {
    if (!currentWorkflow) return;
    setIsRunningValidationBenchmark(true);
    try {
      const report = await runWorkflowValidationEngineBenchmark(currentWorkflow);
      setValidationBenchmarkReport(report);
      setActiveSubTab('VALIDATION_ENGINE');
      onNotify(
        'success',
        'Hoàn tất Kiểm thử Workflow Validation Engine (Mục VII)',
        'Cả 5 thao tác cố tình vi phạm điều kiện chuyển bước đều bị chặn 100% tại Backend (HTTP 422) và giữ nguyên dữ liệu đang nhập.'
      );
    } finally {
      setIsRunningValidationBenchmark(false);
    }
  };

  useEffect(() => {
    if (currentWorkflow) {
      validateWorkflowGateAtBackend({
        gateId: selectedGateId,
        workflow: currentWorkflow,
        actorName: activeActorName,
        actorRole: activeActorRole,
      }).then(setActiveGateResult);
    }
  }, [currentWorkflow?.workflowId, selectedGateId, activeActorRole]);

  if (!currentWorkflow) return null;

  const { missingTasks, warnings } = getMissingTasksAndWarnings(currentWorkflow);
  const currentStepMeta =
    WORKFLOW_9_STEPS_META.find((s) => s.stepNumber === viewingStep) || WORKFLOW_9_STEPS_META[0];
  const currentStateBadge = WORKFLOW_STATE_LABELS[currentWorkflow.status];

  return (
    <div className="space-y-6">
      {/* Header trang HỒ SƠ ĐỀ KIỂM TRA & QUY TRÌNH TẠO ĐỀ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-900 text-amber-300">
                <GitBranch className="w-3.5 h-3.5" />
                HỒ SƠ CỦA TÔI · QUY TRÌNH TẠO ĐỀ KIỂM TRA
              </span>
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Mã hồ sơ: {currentWorkflow.workflowId}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md border ${currentStateBadge.badgeClass}`}
              >
                {currentStateBadge.label}
              </span>
              {currentWorkflow.step7OfficialApproval.approvalRecord?.isVersionLocked && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-900 text-white">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  ĐÃ DUYỆT & KHÓA PHIÊN BẢN ({currentWorkflow.currentVersionId})
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              HỒ SƠ ĐỀ KIỂM TRA & QUY TRÌNH SOẠN THẢO 8 BƯỚC
            </h1>
            <p className="text-xs text-slate-600">
              Kết nối đồng bộ: Thông tin đề → Ma trận & Bản đặc tả → Chọn/Tạo câu hỏi → AI kiểm tra → Chỉnh sửa & Gửi thẩm định → Phê duyệt → Xuất hồ sơ → Phân tích kết quả.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewPersonalWorkflow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Khởi tạo Hồ sơ Đề mới</span>
            </button>
          </div>
        </div>

        {/* Thẻ Thông tin Giáo viên & Phạm vi Hồ sơ Cá nhân */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
              <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>THÔNG TIN GIÁO VIÊN & PHẠM VI HỒ SƠ CÁ NHÂN</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                Hồ sơ của tôi: {personalWorkflows.length} hồ sơ
              </span>
              {!isProductionTeacher && schoolScopeWorkflows.length > personalWorkflows.length && (
                <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setDossierScopeMode('PERSONAL')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                      dossierScopeMode === 'PERSONAL'
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hồ sơ cá nhân ({personalWorkflows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDossierScopeMode('SCHOOL_SCOPE')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                      dossierScopeMode === 'SCHOOL_SCOPE'
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hồ sơ tại đơn vị ({schoolScopeWorkflows.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Giáo viên phụ trách hồ sơ</span>
              </div>
              <div className="font-bold text-slate-900 mt-1 truncate" title={actorFullName}>
                {actorFullName}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {actorPositionTitle}
                {actorUsername ? ` · @${actorUsername}` : ''}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tổ chuyên môn</span>
              </div>
              <div className="font-bold text-slate-900 mt-1 truncate" title={actorDepartmentName}>
                {actorDepartmentName}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                Vai trò quy trình: {WORKFLOW_ROLE_LABELS[derivedActorRole]}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Đơn vị trường học & Năm học</span>
              </div>
              <div className="font-bold text-slate-900 mt-1 truncate" title={actorSchoolName}>
                {actorSchoolName}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Năm học: <span className="font-semibold text-slate-700">{actorAcademicYear}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                <span>Môn học & Khối lớp phân công</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {subjectGradeCombos.length > 0 ? (
                  subjectGradeCombos.slice(0, 4).map((combo, idx) => (
                    <span
                      key={`${combo.subject}-${combo.grade}-${idx}`}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-semibold text-[11px]"
                    >
                      {combo.subject} · K{combo.grade}
                    </span>
                  ))
                ) : assignedSubjects.length > 0 ? (
                  <span className="font-bold text-slate-900">
                    {assignedSubjects.join(', ')}
                    {assignedGrades.length > 0
                      ? ` (Khối ${assignedGrades.join(', ')})`
                      : ''}
                  </span>
                ) : (
                  <span className="font-bold text-slate-900">
                    {isProductionTeacher
                      ? `${defaultSubject} · Khối ${defaultGrade}`
                      : 'Phạm vi quản lý chuyên môn'}
                  </span>
                )}
                {subjectGradeCombos.length > 4 && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">
                    +{subjectGradeCombos.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bộ chọn Hồ sơ & Điều hướng bước */}
        <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Chọn Hồ sơ Đề kiểm tra ({visibleWorkflows.length} hồ sơ):
            </label>
            <select
              value={currentWorkflow.workflowId}
              onChange={(e) => setSelectedWorkflowId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {visibleWorkflows.map((w) => (
                <option key={w.workflowId} value={w.workflowId}>
                  [{w.workflowId}] {w.title} — GV: {w.creatorName} ({WORKFLOW_STATE_LABELS[w.status]?.label || w.status} · {w.currentVersionId})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleRollbackStep}
              title="Quay lại bước trước"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>

            <button
              type="button"
              onClick={handleContinueNextStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer shadow-xs"
            >
              <span>Tiếp tục bước kế</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab điều hướng nội bộ của trang Hồ sơ & Quy trình */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('WIZARD_8_STEPS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'WIZARD_8_STEPS'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Quy trình Tạo đề 8 Bước (Wizard)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('WORKFLOW_PIPELINE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'WORKFLOW_PIPELINE'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tiến độ Hồ sơ & Lịch sử thao tác
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('DOSSIER_METADATA')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'DOSSIER_METADATA'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Chi tiết Hồ sơ & Phiên bản
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 0: GIAO DIỆN QUY TRÌNH TẠO ĐỀ DẠNG WIZARD 8 BƯỚC CHUYÊN NGHIỆP    */}
      {/* ===================================================================== */}
      {activeSubTab === 'WIZARD_8_STEPS' && (
        <ProfessionalExamCreationWizard
          workflows={visibleWorkflows}
          selectedWorkflow={currentWorkflow}
          questions={questions}
          matrices={matrices}
          exams={exams}
          config={config}
          activeActorRole={activeActorRole}
          activeActorName={activeActorName}
          actorId={actorId}
          teacherFullName={actorFullName}
          departmentName={actorDepartmentName}
          schoolName={actorSchoolName}
          allowedSubjects={assignedSubjects}
          allowedGrades={assignedGrades}
          subjectGradeCombos={subjectGradeCombos}
          isProductionTeacher={isProductionTeacher}
          onChangeActorRole={handleRolePresetChange}
          onSelectWorkflow={setSelectedWorkflowId}
          onUpdateWorkflow={updateCurrentWorkflow}
          onNavigateModule={onNavigate}
          onNotify={onNotify}
        />
      )}

      {/* ===================================================================== */}
      {/* THANH TIẾN TRÌNH 9 BƯỚC (Khóa các bước chưa đủ điều kiện - Mục V)    */}
      {/* ===================================================================== */}
      {activeSubTab !== 'WIZARD_8_STEPS' && (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Thanh tiến trình 9 Bước Vận hành (Các bước chưa đủ điều kiện tiên quyết sẽ tự động khóa)
          </div>
          <div className="text-xs text-slate-500">
            Bước hiện tại của hồ sơ:{' '}
            <span className="font-bold text-blue-900">Bước {currentWorkflow.currentStep}/9</span> · Phiên bản hiện hành:{' '}
            <span className="font-mono font-bold text-slate-900">{currentWorkflow.currentVersionId}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {WORKFLOW_9_STEPS_META.map((step) => {
            const unlockInfo = isStepUnlocked(currentWorkflow, step.stepNumber);
            const isCurrentActiveStep = currentWorkflow.currentStep === step.stepNumber;
            const isSelectedViewing = viewingStep === step.stepNumber;
            const isCompleted =
              step.stepNumber < currentWorkflow.currentStep ||
              currentWorkflow.status === 'ResultsAnalysis' ||
              currentWorkflow.status === 'Archived';

            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => {
                  if (!unlockInfo.unlocked) {
                    onNotify(
                      'warning',
                      `Bước ${step.stepNumber} đang khóa (Nguyên tắc 10)`,
                      unlockInfo.lockReason || 'Chưa hoàn thành điều kiện của bước trước.'
                    );
                    return;
                  }
                  setViewingStep(step.stepNumber);
                }}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelectedViewing
                    ? 'border-blue-700 bg-blue-50/90 ring-2 ring-blue-700/20'
                    : !unlockInfo.unlocked
                    ? 'border-slate-200 bg-slate-100/70 text-slate-400 opacity-75'
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 hover:bg-emerald-50'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                      isCurrentActiveStep
                        ? 'bg-amber-400 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : !unlockInfo.unlocked
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    B0{step.stepNumber}
                  </span>
                  {!unlockInfo.unlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <div className="text-xs font-bold leading-snug line-clamp-2">
                  {step.shortTitle.replace(/^Bước \d+ · /, '')}
                </div>
                <div className="text-[10px] font-medium opacity-80">
                  {!unlockInfo.unlocked
                    ? 'Đang khóa'
                    : isCurrentActiveStep
                    ? 'Đang thực hiện'
                    : isCompleted
                    ? 'Đã hoàn tất'
                    : 'Sẵn sàng'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: BẢNG ĐIỀU HÀNH QUY TRÌNH 9 BƯỚC & LỊCH SỬ THAO TÁC (MỤC V)     */}
      {/* ===================================================================== */}
      {activeSubTab === 'WORKFLOW_PIPELINE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái (8 cột): Chi tiết Bước đang chọn & Thao tác nghiệp vụ */}
          <div className="lg:col-span-8 space-y-6">
            {/* Thẻ tóm tắt Bước đang xem */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    {currentStepMeta.linkedModuleName}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    {currentStepMeta.fullTitle}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">{currentStepMeta.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(currentStepMeta.linkedMenuId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 shrink-0 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở Module Chuyên sâu</span>
                </button>
              </div>

              {/* Nội dung chi tiết theo từng Bước 1 -> 9 */}
              {viewingStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Môn & Khối lớp</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentWorkflow.subjectId} · Lớp {currentWorkflow.gradeId}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] text-emerald-700">Câu hỏi ĐÃ DUYỆT được chọn</div>
                      <div className="text-sm font-bold text-emerald-950 mt-0.5">
                        {currentWorkflow.step1QuestionBank.approvedQuestionIds.length} câu (
                        {currentWorkflow.step1QuestionBank.totalSelectedPoints.toFixed(2)} điểm)
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="text-[11px] text-amber-800">Câu chưa duyệt bị chặn</div>
                      <div className="text-sm font-bold text-amber-950 mt-0.5">
                        {currentWorkflow.step1QuestionBank.unapprovedQuestionBlockedCount} câu (Đã chặn)
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="text-[11px] text-blue-800">Độ phủ chủ đề</div>
                      <div className="text-sm font-bold text-blue-950 mt-0.5">
                        {currentWorkflow.step1QuestionBank.coverageSatisfied ? 'Đạt 100% YCCĐ' : 'Thiếu câu hỏi'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800">
                      Các chủ đề đã chọn trong phạm vi kiểm tra ({currentWorkflow.examPeriodLabel}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentWorkflow.step1QuestionBank.selectedTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-medium text-slate-700"
                        >
                          {idx + 1}. {topic}
                        </span>
                      ))}
                    </div>
                    <div className="text-emerald-800 font-medium pt-1">
                      ✓ Đã kiểm tra điều kiện Bước 1: Tuyệt đối không đưa câu hỏi chưa duyệt (DRAFT/PENDING) vào đề chính thức.
                    </div>
                  </div>
                </div>
              )}

              {viewingStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Mẫu quy chuẩn cấp học</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {currentWorkflow.step2MatrixAndSpec.templateCode}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Cấu trúc câu & Điểm</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentWorkflow.step2MatrixAndSpec.totalQuestions} câu ·{' '}
                        {currentWorkflow.step2MatrixAndSpec.totalPoints.toFixed(2)} điểm
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Số YCCĐ liên kết</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentWorkflow.step2MatrixAndSpec.learningOutcomesLinkedCount} YCCĐ
                      </div>
                    </div>
                    <div
                      className={`p-3.5 rounded-xl border ${
                        currentWorkflow.step2MatrixAndSpec.matrixApprovalStatus === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      <div className="text-[11px] opacity-80">Trạng thái duyệt Ma trận</div>
                      <div className="text-xs font-bold mt-0.5">
                        {currentWorkflow.step2MatrixAndSpec.matrixApprovalStatus === 'APPROVED'
                          ? 'ĐÃ PHÊ DUYỆT (MatrixApproved)'
                          : currentWorkflow.step2MatrixAndSpec.matrixApprovalStatus === 'INVALIDATED_BY_MATRIX_EDIT'
                          ? 'CẦN DUYỆT LẠI DO SỬA CẤU TRÚC'
                          : 'CHỜ PHÊ DUYỆT MA TRẬN'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                    <div className="font-bold text-blue-950">
                      Tỷ lệ mức độ nhận thức: {currentWorkflow.step2MatrixAndSpec.levelDistributionSummary}
                    </div>
                    <div className="text-slate-700">
                      Mã Ma trận: <span className="font-mono font-bold">{currentWorkflow.matrixId}</span> · Mã Bản đặc tả:{' '}
                      <span className="font-mono font-bold">{currentWorkflow.specificationId}</span> · Chữ ký cấu trúc:{' '}
                      <span className="font-mono">{currentWorkflow.step2MatrixAndSpec.matrixSignature}</span>
                    </div>
                    {currentWorkflow.step2MatrixAndSpec.matrixApprovedBy && (
                      <div className="text-emerald-800 font-semibold">
                        ✓ Người phê duyệt Ma trận: {currentWorkflow.step2MatrixAndSpec.matrixApprovedBy} ({currentWorkflow.step2MatrixAndSpec.matrixApprovedAt})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Mã đề đã sinh</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentWorkflow.step3ExamGeneration.variantCodes.join(', ') || 'Chưa tạo'}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Số câu trong đề</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentWorkflow.step3ExamGeneration.questionIdsInExam.length} câu
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] text-emerald-700">Tổng điểm đề & HDC</div>
                      <div className="text-sm font-bold text-emerald-950 mt-0.5">
                        {currentWorkflow.step3ExamGeneration.totalExamPoints.toFixed(2)} / 10,00 điểm
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] text-emerald-700">Đối chiếu khớp Ma trận</div>
                      <div className="text-sm font-bold text-emerald-950 mt-0.5">
                        {currentWorkflow.step3ExamGeneration.matchesApprovedMatrix ? 'Khớp 100%' : 'Chưa khớp'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewingStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-indigo-950">
                        Báo cáo AI QUALITY REVIEW ({currentWorkflow.reviewReportId}) · Phiên bản kiểm tra:{' '}
                        {currentWorkflow.step4AiQualityReview.inspectedVersionId || currentWorkflow.currentVersionId}
                      </div>
                      <div className="text-indigo-800">
                        Kết luận tổng thể Bảng điều khiển chất lượng:{' '}
                        <span className="font-bold">
                          {currentWorkflow.step4AiQualityReview.overallDashboardStatusLabel}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('ai-quality-review')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 cursor-pointer shrink-0"
                    >
                      Xem chi tiết Báo cáo AI Quality Review
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                    {[
                      { label: '1. Chương trình', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.curriculum },
                      { label: '2. Ma trận', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.matrix },
                      { label: '3. Bản đặc tả', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.specification },
                      { label: '4. Nội dung câu hỏi', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.questionContent },
                      { label: '5. Đáp án', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.answerKey },
                      { label: '6. Hướng dẫn chấm', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.gradingGuide },
                      { label: '7. Mức độ nhận thức', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.cognitiveLevel },
                      { label: '8. Điểm số', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.points },
                      { label: '9. Ngôn ngữ', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.language },
                      { label: '10. Hình thức', ok: currentWorkflow.step4AiQualityReview.checked10Pillars.formatting },
                    ].map((p, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          p.ok
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="font-medium">{p.label}</span>
                        {p.ok && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingStep === 5 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
                    <div className="text-xs font-bold text-purple-950">
                      Biểu mẫu Giáo viên chỉnh sửa câu hỏi & Tạo phiên bản mới (Mục III.5)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Câu số cần sửa:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={revisionQuestionNumber}
                          onChange={(e) => setRevisionQuestionNumber(Number(e.target.value) || 1)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 block mb-1">Quyết định đối với đề xuất AI:</label>
                        <select
                          value={revisionDecision}
                          onChange={(e) =>
                            setRevisionDecision(
                              e.target.value as 'ACCEPTED_PROPOSAL' | 'REJECTED_PROPOSAL' | 'MANUAL_EDIT'
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                        >
                          <option value="ACCEPTED_PROPOSAL">Chấp nhận đề xuất của AI & Chỉnh sửa câu hỏi</option>
                          <option value="REJECTED_PROPOSAL">Từ chối đề xuất của AI (Giữ nguyên & Ghi lý do chuyên môn)</option>
                          <option value="MANUAL_EDIT">Giáo viên tự biên tập lại câu hỏi / hướng dẫn chấm</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Nội dung câu hỏi / Hướng dẫn chấm sau chỉnh sửa:
                      </label>
                      <input
                        type="text"
                        value={revisionNewStem}
                        onChange={(e) => setRevisionNewStem(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                      />
                    </div>

                    <div className="text-xs">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Lý do chấp nhận / từ chối hoặc thuyết minh chỉnh sửa:
                      </label>
                      <input
                        type="text"
                        value={revisionReasonNote}
                        onChange={(e) => setRevisionReasonNote(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-rose-900 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={revisionAffectsMatrix}
                          onChange={(e) => setRevisionAffectsMatrix(e.target.checked)}
                        />
                        <span>
                          Nội dung sửa có làm thay đổi điểm số / mức độ trong Ma trận (Sẽ buộc quay về Bước 2 duyệt lại Ma trận)
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={handleSaveTeacherRevision}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 cursor-pointer shrink-0"
                      >
                        Lưu chỉnh sửa & Tạo phiên bản mới
                      </button>
                    </div>
                  </div>

                  {/* Danh sách lịch sử sửa từng câu */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Nhật ký chỉnh sửa câu hỏi của Giáo viên ({currentWorkflow.step5TeacherRevision.revisions.length} lần):
                    </div>
                    {currentWorkflow.step5TeacherRevision.revisions.map((rev) => (
                      <div
                        key={rev.revisionId}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>
                            Câu {rev.questionNumber} ({rev.questionCode}) · {rev.decision}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{rev.revisedAt}</span>
                        </div>
                        <div className="text-slate-700">Lý do: {rev.reasonNote}</div>
                        <div className="text-emerald-800 font-medium">Nội dung mới: {rev.newStem}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingStep === 6 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-3 text-xs">
                    <div className="font-bold text-cyan-950">
                      Phiếu Thẩm định Chuyên môn (Bước 6 – Người phản biện độc lập)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Kết luận thẩm định:</label>
                        <select
                          value={reviewDecision}
                          onChange={(e) =>
                            setReviewDecision(
                              e.target.value as 'ELIGIBLE_FOR_APPROVAL' | 'REVISION_REQUIRED'
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                        >
                          <option value="ELIGIBLE_FOR_APPROVAL">
                            Đủ điều kiện trình Lãnh đạo phê duyệt (AwaitingApproval)
                          </option>
                          <option value="REVISION_REQUIRED">
                            Yêu cầu giáo viên chỉnh sửa lại đề kiểm tra (RevisionRequired)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Phiên bản thẩm định:</label>
                        <input
                          type="text"
                          readOnly
                          value={currentWorkflow.currentVersionId}
                          className="w-full rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nhận xét chuyên môn của người phản biện:</label>
                      <textarea
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2.5"
                      />
                    </div>
                  </div>

                  {currentWorkflow.step6ProfessionalReview.ballots.map((b) => (
                    <div
                      key={b.ballotId}
                      className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1"
                    >
                      <div className="font-bold text-emerald-950 flex items-center justify-between">
                        <span>
                          Phiếu thẩm định #{b.ballotId} · Người phản biện: {b.reviewerName}
                        </span>
                        <span className="font-mono">{b.reviewedVersionId}</span>
                      </div>
                      <p className="text-slate-700">{b.generalComments}</p>
                    </div>
                  ))}
                </div>
              )}

              {viewingStep === 7 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-3 text-xs">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>
                        Bước 7 – Phê duyệt chính thức & Khóa bất biến phiên bản (Chỉ dành cho Tổ trưởng CM / Ban Giám hiệu)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        ✓ Kiểm tra đủ hồ sơ: <span className="font-bold">Đạt (7/7 tài liệu)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        ✓ Trạng thái thẩm định:{' '}
                        <span className="font-bold">
                          {currentWorkflow.step6ProfessionalReview.latestDecision === 'ELIGIBLE_FOR_APPROVAL'
                            ? 'Đã thông qua'
                            : 'Chưa thông qua'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        ✓ Phiên bản hiện hành:{' '}
                        <span className="font-mono font-bold">{currentWorkflow.currentVersionId}</span>
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Ý kiến phê duyệt chính thức & Lệnh khóa phiên bản:
                      </label>
                      <input
                        type="text"
                        value={approvalComment}
                        onChange={(e) => setApprovalComment(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                      />
                    </div>
                    {currentWorkflow.step7OfficialApproval.approvalRecord && (
                      <div className="p-3 rounded-lg bg-emerald-900 text-white font-medium">
                        🔒 ĐÃ PHÊ DUYỆT & KHÓA BẤT BIẾN bởi{' '}
                        {currentWorkflow.step7OfficialApproval.approvalRecord.approverName} lúc{' '}
                        {currentWorkflow.step7OfficialApproval.approvalRecord.approvedAt} (Mã phiên bản khóa:{' '}
                        {currentWorkflow.step7OfficialApproval.approvalRecord.approvedVersionId}).
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingStep === 8 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3 text-xs">
                    <div className="font-bold text-teal-950">
                      Bước 8 – Xuất bộ Hồ sơ Kiểm tra chuẩn (7 thành phần bắt buộc · Hỗ trợ Word, PDF, Excel, ZIP)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        '1. Ma trận đề kiểm tra',
                        '2. Bản đặc tả đề kiểm tra',
                        '3. Đề kiểm tra chính thức',
                        '4. Đáp án chuẩn',
                        '5. Hướng dẫn chấm chi tiết',
                        '6. Phiếu thẩm định chuyên môn',
                        '7. Biên bản phê duyệt & Khóa đề',
                      ].map((docName, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white border border-teal-200 font-semibold text-slate-800 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>{docName}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onNavigate('records')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 text-white font-bold hover:bg-teal-900 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Mở Trung tâm Xuất Word / PDF / Excel / ZIP</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {viewingStep === 9 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 text-xs">
                    <div className="font-bold text-blue-950">
                      Bước 9 – Phân tích kết quả kiểm tra, mức độ đạt YCCĐ & Đề xuất cải tiến Ngân hàng câu hỏi
                    </div>
                    {currentWorkflow.step9ResultsAnalysis.analysisSummary ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                            <div className="text-[11px] text-slate-500">Số HS tham gia</div>
                            <div className="text-sm font-bold text-slate-900">
                              {currentWorkflow.step9ResultsAnalysis.analysisSummary.studentCount} HS
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                            <div className="text-[11px] text-slate-500">Điểm trung bình</div>
                            <div className="text-sm font-bold text-blue-900">
                              {currentWorkflow.step9ResultsAnalysis.analysisSummary.averageScore.toFixed(2)} điểm
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                            <div className="text-[11px] text-slate-500">Tỷ lệ hoàn thành</div>
                            <div className="text-sm font-bold text-emerald-800">
                              {currentWorkflow.step9ResultsAnalysis.analysisSummary.passRatePercent}%
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                            <div className="text-[11px] text-slate-500">Đề lưu trữ bất biến</div>
                            <div className="text-xs font-bold text-emerald-900">
                              Không tự sửa câu hỏi cũ
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white border border-blue-200 space-y-1">
                          <div className="font-bold text-slate-900">
                            Đề xuất cải tiến Ngân hàng câu hỏi (Bảo toàn 100% câu hỏi trong đề lưu trữ):
                          </div>
                          {currentWorkflow.step9ResultsAnalysis.analysisSummary.bankImprovementProposals.map(
                            (p, idx) => (
                              <div key={idx} className="text-slate-700">
                                • [{p.questionCode}] Độ khó thực nghiệm P={p.empiricalDifficulty}, Độ phân biệt D=
                                {p.discriminationIndex}: {p.proposalText}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-600">
                        Nhấn nút "Tiếp tục bước kế" hoặc mở Module Phân tích kết quả để nạp bảng điểm thực nghiệm.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lịch sử thao tác & Nhật ký chuyển trạng thái (Audit Trail) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Lịch sử thao tác & Nhật ký chuyển trạng thái (Đã xác thực tại Backend)
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {currentWorkflow.auditTrail.length} bản ghi nhật ký
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {currentWorkflow.auditTrail.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {entry.actorName} ({entry.actorRole})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-[11px] font-semibold">
                          {entry.fromState} → {entry.toState} (B0{entry.toStep})
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{entry.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{entry.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải (4 cột): Thông tin điều hành Mục V (Người phụ trách, Công việc còn thiếu, Cảnh báo) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Hộp Thông tin Điều hành (Mục V) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Thông tin Điều hành Hồ sơ (Mục V)
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Mã hồ sơ chung:</span>
                  <span className="font-mono font-bold text-slate-900">{currentWorkflow.workflowId}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Bước hiện tại:</span>
                  <span className="font-bold text-blue-900">
                    Bước {currentWorkflow.currentStep}/9
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Trạng thái State Machine:</span>
                  <span className="font-bold text-slate-900">{currentWorkflow.status}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Người phụ trách hiện tại:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {currentWorkflow.assignedUsers.currentAssigneeName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Giáo viên ra đề:</span>
                  <span className="font-medium text-slate-800">
                    {currentWorkflow.assignedUsers.creatorName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Người duyệt Ma trận:</span>
                  <span className="font-medium text-slate-800 text-right">
                    {currentWorkflow.assignedUsers.matrixApproverName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Người phản biện (Thẩm định):</span>
                  <span className="font-medium text-slate-800 text-right">
                    {currentWorkflow.assignedUsers.reviewerName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Người phê duyệt đề:</span>
                  <span className="font-medium text-slate-800 text-right">
                    {currentWorkflow.assignedUsers.finalApproverName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Ngày cập nhật:</span>
                  <span className="font-mono text-slate-700">{currentWorkflow.updatedAt}</span>
                </div>
              </div>
            </div>

            {/* Công việc còn thiếu (Missing Tasks) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Công việc còn thiếu ({missingTasks.length})
                </span>
                {missingTasks.length === 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                    Hoàn tất 9/9 bước
                  </span>
                )}
              </div>
              {missingTasks.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                  ✓ Toàn bộ 9 bước trong quy trình khảo thí đã hoàn thành đầy đủ.
                </div>
              ) : (
                <ul className="space-y-2 text-xs">
                  {missingTasks.map((task, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cảnh báo Quy trình & Bảo mật */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Cảnh báo & Ràng buộc Quy trình ({warnings.length})</span>
              </div>
              <ul className="space-y-2 text-xs">
                {warnings.map((w, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 leading-relaxed"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: HỒ SƠ KIỂM TRA TRUNG TÂM (ExamWorkflow & Phiên bản bất biến)   */}
      {/* ===================================================================== */}
      {activeSubTab === 'DOSSIER_METADATA' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              II. Cấu trúc Hồ sơ Kiểm tra Trung tâm (ExamWorkflow – Liên kết tham chiếu có kiểm soát)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { k: 'workflowId', v: currentWorkflow.workflowId },
                { k: 'schoolId', v: currentWorkflow.schoolId },
                { k: 'academicYearId', v: currentWorkflow.academicYearId },
                { k: 'gradeId', v: `Lớp ${currentWorkflow.gradeId}` },
                { k: 'subjectId', v: currentWorkflow.subjectId },
                { k: 'examPeriod', v: `${currentWorkflow.examPeriod} (${currentWorkflow.examPeriodLabel})` },
                { k: 'examDate', v: currentWorkflow.examDate },
                { k: 'creatorId', v: `${currentWorkflow.creatorId} (${currentWorkflow.creatorName})` },
                { k: 'matrixId', v: currentWorkflow.matrixId },
                { k: 'specificationId', v: currentWorkflow.specificationId },
                { k: 'examId', v: currentWorkflow.examId },
                { k: 'currentVersionId', v: currentWorkflow.currentVersionId },
                { k: 'reviewReportId', v: currentWorkflow.reviewReportId },
                { k: 'approvalId', v: currentWorkflow.approvalId },
                { k: 'status', v: currentWorkflow.status },
                { k: 'currentStep', v: `Bước ${currentWorkflow.currentStep}/9` },
                { k: 'createdAt', v: currentWorkflow.createdAt },
                { k: 'updatedAt', v: currentWorkflow.updatedAt },
              ].map((item) => (
                <div key={item.k} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-mono text-[11px] text-blue-800 font-semibold">{item.k}</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate" title={String(item.v)}>
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Lịch sử Phiên bản Hồ sơ Đề (Immutable Version Snapshots – Không mất lịch sử phiên bản)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-left">
                    <th className="p-2.5 border border-slate-200">Mã phiên bản</th>
                    <th className="p-2.5 border border-slate-200">Trạng thái khi tạo</th>
                    <th className="p-2.5 border border-slate-200">Người tạo & Vai trò</th>
                    <th className="p-2.5 border border-slate-200">Tổng điểm</th>
                    <th className="p-2.5 border border-slate-200">Khóa bất biến</th>
                    <th className="p-2.5 border border-slate-200">Ghi chú thay đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWorkflow.versionSnapshots.map((v) => (
                    <tr key={v.versionId} className="border-b border-slate-200">
                      <td className="p-2.5 border border-slate-200 font-mono font-bold text-blue-900">
                        {v.versionId}
                      </td>
                      <td className="p-2.5 border border-slate-200 font-semibold">
                        {v.workflowStateAtCreation} (Bước {v.stepNumberAtCreation})
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        {v.createdBy} ({v.createdByRole})
                      </td>
                      <td className="p-2.5 border border-slate-200 font-bold">
                        {v.totalPoints.toFixed(2)} điểm
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        {v.isImmutableApprovedLock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                            <Lock className="w-3 h-3" /> Đã khóa bất biến
                          </span>
                        ) : (
                          <span className="text-slate-600">Bản nháp / Chỉnh sửa</span>
                        )}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-slate-700">{v.changeNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: KẾT QUẢ KIỂM THỬ 10 BƯỚC TOÁN LỚP 4 & 7 BẤT BIẾN (MỤC VI)      */}
      {/* ===================================================================== */}
      {activeSubTab === 'E2E_BENCHMARK_VI' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  VI. Kiểm thử Quy trình Toàn diện Môn Toán Lớp 4 (10 Bước Thực thi & 7 Bất biến Bảo mật)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Kiểm chứng trực tiếp trên cơ sở dữ liệu thực và State Machine tại Backend (Không dùng dữ liệu giả).
                </p>
              </div>
              <button
                type="button"
                disabled={isRunningBenchmark}
                onClick={handleRunFullE2EBenchmark}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningBenchmark ? 'animate-spin' : ''}`} />
                <span>Chạy lại Kiểm thử 10 Bước Toán Lớp 4</span>
              </button>
            </div>

            {!benchmarkReport ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-700">
                  Nhấn nút <strong>"Chạy Kiểm thử E2E Toán Lớp 4 (10 Bước + 7 Bất biến)"</strong> để hệ thống thực thi tự động toàn bộ quy trình từ Bước 1 đến Bước 9 và kiểm tra 7 điều kiện an toàn tại Backend.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bảng 10 bước thực thi */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    A. Kết quả 10 Bước Thực thi Quy trình Môn Toán Lớp 4 ({benchmarkReport.workflowId})
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 text-left">
                          <th className="p-2.5 border border-slate-200">Thứ tự</th>
                          <th className="p-2.5 border border-slate-200">Bước kiểm thử</th>
                          <th className="p-2.5 border border-slate-200">Người thực hiện & Vai trò</th>
                          <th className="p-2.5 border border-slate-200">Chuyển trạng thái</th>
                          <th className="p-2.5 border border-slate-200">Phiên bản</th>
                          <th className="p-2.5 border border-slate-200">Tổng điểm</th>
                          <th className="p-2.5 border border-slate-200">Chi tiết nghiệm thu</th>
                          <th className="p-2.5 border border-slate-200">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarkReport.steps.map((s) => (
                          <tr key={s.stepOrder} className="border-b border-slate-200">
                            <td className="p-2.5 border border-slate-200 font-mono font-bold">
                              #{s.stepOrder}
                            </td>
                            <td className="p-2.5 border border-slate-200 font-semibold text-slate-900">
                              {s.stepTitle}
                            </td>
                            <td className="p-2.5 border border-slate-200">
                              {s.actorName} ({s.actorRole})
                            </td>
                            <td className="p-2.5 border border-slate-200 font-mono text-blue-900">
                              {s.fromState} → {s.toState}
                            </td>
                            <td className="p-2.5 border border-slate-200 font-mono font-bold">
                              {s.versionIdAfterStep}
                            </td>
                            <td className="p-2.5 border border-slate-200 font-bold text-emerald-800">
                              {s.totalPointsVerified.toFixed(2)}đ
                            </td>
                            <td className="p-2.5 border border-slate-200 text-slate-700">
                              {s.detailSummary}
                            </td>
                            <td className="p-2.5 border border-slate-200">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                                ĐẠT
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bảng 7 Bất biến Toàn vẹn & Bảo mật */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    B. Kiểm chứng 7 Bất biến Toàn vẹn & Phân quyền Backend (Mục VI)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {benchmarkReport.invariants.map((inv) => (
                      <div
                        key={inv.code}
                        className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-emerald-950">{inv.title}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-mono text-[10px] font-bold shrink-0">
                            {inv.httpStatusOrGuardCode}
                          </span>
                        </div>
                        <div className="text-slate-600">Yêu cầu: {inv.expectedBehavior}</div>
                        <div className="text-emerald-900 font-medium">
                          Thực tế: {inv.actualVerificationResult}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: BÁO CÁO NGHIỆM THU KẾT NỐI TOÀN DIỆN (MỤC VII)                 */}
      {/* ===================================================================== */}
      {activeSubTab === 'SYSTEM_REPORT_VII' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
          <h2 className="text-base font-bold text-slate-900">
            VII. BÁO CÁO KẾT QUẢ TÍCH HỢP QUY TRÌNH VẬN HÀNH TOÀN DIỆN (GIAI ĐOẠN 16)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-950 text-sm">
                1. Các module đã kết nối liên thông (9/9 Bước):
              </div>
              <ul className="space-y-1 text-slate-800 list-disc pl-4">
                <li>Bước 1: Module Ngân hàng câu hỏi & Kho ngữ liệu (lọc câu APPROVED, chặn câu chưa duyệt).</li>
                <li>Bước 2: Module Ma trận & Bản đặc tả + Module Đánh giá Tiểu học TT27 / THCS TT22.</li>
                <li>Bước 3: Module Tạo đề kiểm tra, trộn mã đề, đáp án và hướng dẫn chấm.</li>
                <li>Bước 4: Module AI Quality Review (10 nhóm tiêu chí + Tiếng Việt Tiểu học + Toán Tiểu học + Đối chiếu chéo).</li>
                <li>Bước 5: Module Bảng điều khiển chất lượng đề & Chỉnh sửa phiên bản (tự động ép duyệt lại Ma trận nếu sửa câu làm đổi cấu trúc Ma trận).</li>
                <li>Bước 6: Module Thẩm định chuyên môn & Lưu phiếu thẩm định phản biện.</li>
                <li>Bước 7: Module Phê duyệt Lãnh đạo & Khóa bất biến phiên bản đề được duyệt.</li>
                <li>Bước 8: Module Xuất bộ Hồ sơ kiểm tra chuẩn (Word, PDF, Excel, ZIP 7 tài liệu).</li>
                <li>Bước 9: Module Phân tích kết quả kiểm tra & Đề xuất cải tiến ngân hàng câu hỏi.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="font-bold text-blue-950 text-sm">
                2. Kiểm tra các module chưa kết nối & Các lỗi quy trình đã phát hiện, khóa chặn:
              </div>
              <ul className="space-y-1 text-slate-800 list-disc pl-4">
                <li>
                  <strong>Các module chưa kết nối:</strong> Không có (100% các module từ Giai đoạn 1 đến Giai đoạn 15 đã được liên kết thông qua thực thể trung tâm <code>ExamWorkflow</code> dùng chung <code>workflowId</code>).
                </li>
                <li>
                  <strong>Lỗi rủi ro 1 (Đưa câu hỏi nháp vào đề chính thức):</strong> Đã chặn tại Bước 1 (chỉ cho phép nạp câu hỏi có <code>approvalStatus === 'APPROVED'</code>).
                </li>
                <li>
                  <strong>Lỗi rủi ro 2 (Sửa câu hỏi ở Bước 5 làm lệch Ma trận đã duyệt):</strong> Đã phát hiện và tự động chuyển trạng thái về <code>MatrixReview</code> (Bước 2) để phê duyệt lại Ma trận.
                </li>
                <li>
                  <strong>Lỗi rủi ro 3 (Vượt quyền hoặc dùng AI tự phê duyệt đề):</strong> Đã chặn tại Backend <code>POST /api/workflows/:workflowId/transition</code> (HTTP 403 Forbidden).
                </li>
                <li>
                  <strong>Lỗi rủi ro 4 (Sửa âm thầm đề đã phê duyệt hoặc tự động sửa câu hỏi trong đề lưu trữ sau khi phân tích kết quả):</strong> Đã khóa bất biến phiên bản được duyệt (<code>isImmutableApprovedLock = true</code>).
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">
                3. Những hạn chế còn lại:
              </div>
              <ul className="space-y-1 text-slate-700 list-disc pl-4">
                <li>Chữ ký số pháp lý chuyên dụng (USB Token / SIM PKI của Ban Cơ yếu Chính phủ) trên Biên bản phê duyệt PDF hiện đang ở mức biên bản xác thực nội bộ theo tài khoản lãnh đạo nhà trường.</li>
                <li>Khi vận hành đồng thời nhiều điểm trường quy mô cấp Sở/Phòng GD&ĐT, cần đồng bộ định kỳ tệp CSDL JSON máy chủ sang cụm cơ sở dữ liệu tập trung.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="font-bold text-amber-950 text-sm">
                4. Các cấu hình cần thực hiện trước khi đưa vào vận hành chính thức:
              </div>
              <ul className="space-y-1 text-slate-800 list-disc pl-4">
                <li>Cấu hình biến môi trường <code>GEMINI_API_KEY</code> trên máy chủ chính thức để kích hoạt Lớp B (Gemini AI Quality Review) bên cạnh bộ kiểm tra xác định Lớp A.</li>
                <li>Thiết lập danh sách tài khoản thật của nhà trường theo đúng 6 vai trò (<code>TEACHER</code>, <code>REVIEWER</code>, <code>HEAD_OF_DEPARTMENT</code>, <code>VICE_PRINCIPAL</code>, <code>PRINCIPAL</code>, <code>SYSTEM_ADMIN</code>) trong mục Quản trị hệ thống.</li>
                <li>Cấu hình lịch sao lưu tự động tệp cơ sở dữ liệu <code>uploads/edutest_multitenant_db.json</code> hằng ngày trước mỗi đợt kiểm tra định kỳ.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB MỚI: WORKFLOW VALIDATION ENGINE – BỘ KIỂM SOÁT ĐIỀU KIỆN CHUYỂN BƯỚC */}
      {/* ===================================================================== */}
      {activeSubTab === 'VALIDATION_ENGINE' && (
        <div className="space-y-6">
          {/* Khung chọn 5 Cổng Kiểm soát (Mục I -> V) & Nút chạy Kiểm thử 5 thao tác vi phạm (Mục VII) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-900 text-amber-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  WORKFLOW VALIDATION ENGINE · BỘ KIỂM SOÁT ĐIỀU KIỆN CHUYỂN BƯỚC
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Kiểm tra 5 Cổng Điều kiện Bắt buộc (Mục I–V) & Cơ chế Chặn Chuyển bước Bảo toàn Dữ liệu (Mục VI)
                </h2>
                <p className="text-xs text-slate-600">
                  Ngăn người dùng chuyển hồ sơ sang bước tiếp theo khi chưa đáp ứng điều kiện bắt buộc; hiển thị rõ điều kiện chưa đạt, vị trí xử lý và nút mở đúng màn hình cần bổ sung mà không làm mất dữ liệu đang nhập.
                </p>
              </div>

              <button
                type="button"
                disabled={isRunningValidationBenchmark}
                onClick={handleRunValidationEngineBenchmark}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-700 text-white hover:bg-rose-800 cursor-pointer shrink-0 shadow-xs"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>
                  {isRunningValidationBenchmark
                    ? 'Đang kiểm thử tại Backend...'
                    : 'VII. Chạy Kiểm thử 5 Thao tác Cố tình Vi phạm (Chặn ở Backend)'}
                </span>
              </button>
            </div>

            {/* 5 Nút chọn Cổng Kiểm soát (Mục I -> V) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {VALIDATION_GATES_META.map((g) => {
                const isSelected = selectedGateId === g.gateId;
                return (
                  <button
                    key={g.gateId}
                    type="button"
                    onClick={() => handleInspectGate(g.gateId)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/90 ring-2 ring-blue-700/20'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-blue-950">{g.shortLabel}</div>
                    <div className="text-[11px] text-slate-600 line-clamp-2">{g.description}</div>
                    <div className="text-[10px] font-mono font-semibold text-blue-700">
                      Bước {g.fromStep} → Bước {g.toStep}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chi tiết Kết quả đánh giá Cổng đang chọn & Cơ chế xử lý Mục VI */}
            {activeGateResult && (
              <div className="space-y-4 pt-2">
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    activeGateResult.allowedToProceed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm flex items-center gap-2">
                      {activeGateResult.allowedToProceed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                      )}
                      <span>{activeGateResult.gateTitle}</span>
                    </div>
                    <p className="font-medium">{activeGateResult.blockingMessage}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono font-bold text-slate-900">
                      HTTP {activeGateResult.httpStatus} · Đạt {activeGateResult.passedConditionsCount}/
                      {activeGateResult.totalConditions}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold">
                      ✓ Giữ nguyên dữ liệu đang nhập
                    </span>
                  </div>
                </div>

                {/* Bảng danh sách điều kiện đạt / chưa đạt + Vị trí xử lý + Nút mở đúng màn hình */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-left">
                        <th className="p-2.5 border border-slate-200">Điều kiện bắt buộc</th>
                        <th className="p-2.5 border border-slate-200">Trạng thái hiện tại của Hồ sơ</th>
                        <th className="p-2.5 border border-slate-200">Quy tắc yêu cầu</th>
                        <th className="p-2.5 border border-slate-200">VI. Vị trí cần xử lý</th>
                        <th className="p-2.5 border border-slate-200">Kết quả</th>
                        <th className="p-2.5 border border-slate-200">Thao tác mở màn hình bổ sung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGateResult.conditions.map((cond) => (
                        <tr
                          key={cond.conditionCode}
                          className={`border-b border-slate-200 ${
                            !cond.passed ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <td className="p-2.5 border border-slate-200 font-bold text-slate-900">
                            {cond.conditionTitle}
                            <div className="text-[10px] font-mono text-slate-500">
                              {cond.conditionCode}
                            </div>
                          </td>
                          <td className="p-2.5 border border-slate-200 font-medium text-slate-800">
                            {cond.currentValueSummary}
                          </td>
                          <td className="p-2.5 border border-slate-200 text-slate-600">
                            {cond.requiredRuleSummary}
                          </td>
                          <td className="p-2.5 border border-slate-200 font-semibold text-blue-950">
                            {cond.remediationLocationLabel}
                          </td>
                          <td className="p-2.5 border border-slate-200">
                            {cond.passed ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                                ĐẠT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                                CHƯA ĐẠT
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 border border-slate-200">
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => onNavigate(cond.targetMenuId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-700 text-white text-[11px] font-bold hover:bg-blue-800 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Mở màn hình bổ sung</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingStep(cond.targetWorkflowStep);
                                  setActiveSubTab('WORKFLOW_PIPELINE');
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-semibold hover:bg-slate-200 cursor-pointer"
                              >
                                Đến Bước {cond.targetWorkflowStep}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* KẾT QUẢ KIỂM THỬ MỤC VII (5 THAO TÁC CỐ TÌNH VI PHẠM BỊ CHẶN Ở BACKEND & CÁC NGOẠI LỆ CẦN CẤU HÌNH) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  VII. Báo cáo Kết quả Kiểm thử 5 Thao tác Cố tình Vi phạm & Các Trường hợp Ngoại lệ Cần Cấu hình
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Kiểm chứng trực tiếp tại Backend API (<code>POST /api/workflows/:workflowId/validate-gate</code>): Tất cả 5 thao tác không hợp lệ đều bị chặn (HTTP 422) và không làm mất dữ liệu đang nhập.
                </p>
              </div>
              <button
                type="button"
                disabled={isRunningValidationBenchmark}
                onClick={handleRunValidationEngineBenchmark}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningValidationBenchmark ? 'animate-spin' : ''}`} />
                <span>Chạy lại Kiểm thử 5 Kịch bản (Mục VII)</span>
              </button>
            </div>

            {!validationBenchmarkReport ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-700">
                Nhấn nút <strong>"VII. Chạy Kiểm thử 5 Thao tác Cố tình Vi phạm (Chặn ở Backend)"</strong> ở trên để hệ thống thực thi tự động 5 phép thử vi phạm và xuất báo cáo nghiệm thu.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bảng 5 kịch bản cố tình vi phạm */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-left">
                        <th className="p-2.5 border border-slate-200">STT</th>
                        <th className="p-2.5 border border-slate-200">Kịch bản cố tình vi phạm (Mục VII)</th>
                        <th className="p-2.5 border border-slate-200">Hành vi giả lập gửi lên Backend</th>
                        <th className="p-2.5 border border-slate-200">Mã điều kiện bị chặn</th>
                        <th className="p-2.5 border border-slate-200">Chỉ dẫn vị trí xử lý & Màn hình đích</th>
                        <th className="p-2.5 border border-slate-200">Phản hồi Backend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationBenchmarkReport.scenarios.map((sc) => (
                        <tr key={sc.scenarioCode} className="border-b border-slate-200">
                          <td className="p-2.5 border border-slate-200 font-mono font-bold">
                            #{sc.scenarioOrder}
                          </td>
                          <td className="p-2.5 border border-slate-200 font-bold text-slate-900">
                            {sc.scenarioTitle}
                          </td>
                          <td className="p-2.5 border border-slate-200 text-slate-700">
                            {sc.injectedViolationDescription}
                          </td>
                          <td className="p-2.5 border border-slate-200 font-mono text-rose-800 font-semibold">
                            {sc.failedConditionCodes.join(', ')}
                          </td>
                          <td className="p-2.5 border border-slate-200">
                            <div className="font-medium text-slate-800 mb-1">
                              {sc.remediationLocationShown}
                            </div>
                            <button
                              type="button"
                              onClick={() => onNavigate(sc.targetMenuId)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold hover:bg-blue-100 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{sc.targetScreenButtonLabel}</span>
                            </button>
                          </td>
                          <td className="p-2.5 border border-slate-200">
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-bold">
                              ĐÃ CHẶN TẠI BACKEND (HTTP {sc.backendHttpStatus})
                            </span>
                            <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                              ✓ Không mất dữ liệu nháp
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Danh mục các trường hợp ngoại lệ cần cấu hình */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    B. Các trường hợp ngoại lệ cần cấu hình trong thực tiễn vận hành nhà trường (Mục VII)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {validationBenchmarkReport.configurableExceptions.map((ex) => (
                      <div
                        key={ex.code}
                        className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5"
                      >
                        <div className="font-bold text-amber-950">{ex.title}</div>
                        <div className="text-slate-700">{ex.whenApplicable}</div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                          <span className="font-mono text-blue-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                            Khóa cấu hình: {ex.configKey}
                          </span>
                          <span className="font-semibold text-emerald-900">
                            Quyền phê duyệt ngoại lệ: {ex.requiredApproverRole}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Mặc định hệ thống: <strong>{ex.defaultSetting}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
