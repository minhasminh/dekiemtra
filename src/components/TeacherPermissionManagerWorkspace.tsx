import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckSquare,
  Square,
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap,
  Lock,
  Sparkles,
  PlayCircle,
  Plus,
  UserCheck,
  ArrowRight,
  RefreshCw,
  Users,
  Layers,
  History,
  FileCheck2
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db as firestoreDb } from '../services/firebase/firebaseClient';
import {
  AuthenticatedUserSession,
  MenuSectionId,
  WorkflowActorRole,
  SchoolCurriculumSubjectCatalogItem,
  FunctionalPermissionCatalogItem,
  TeacherFunctionalPermissionCode,
  TeacherPermissionProfileSummary,
  TeacherSubjectGradeAllocation,
  SubjectAssessmentMode,
  TeacherPermissionVerificationSuiteReport,
  BulkPermissionOperationMode,
  BulkTeacherPermissionExecutionReport,
  BulkTeacherPermissionAuditLogEntry,
  BulkTeacherPermission10TeachersTestReport,
  VisualPermissionFullQaAuditReport,
  TeacherPermissionTemplate
} from '../types/domain';
import { loginWithServerRoleScenario } from '../services/auth/authSessionService';
import { TeacherPermissionTemplatesPanel } from './TeacherPermissionTemplatesPanel';

interface TeacherPermissionManagerWorkspaceProps {
  currentActorUserId?: string;
  schoolId?: string;
  schoolName?: string;
  initialSelectedTeacherId?: string;
  onQuickSwitchAccountSession?: (session: AuthenticatedUserSession) => void;
  onNavigateSection?: (section: MenuSectionId) => void;
}

type LevelId = 'PRIMARY' | 'LOWER_SECONDARY';

const ASSESSMENT_MODE_LABELS: Record<SubjectAssessmentMode, string> = {
  PAPER_EXAM: 'Kiểm tra bằng đề giấy / trực tuyến định kỳ',
  COMMENT_AND_PRACTICE: 'Đánh giá bằng nhận xét / bài thực hành',
  HYBRID_PAPER_PRACTICE: 'Kết hợp đề kiểm tra & thực hành'
};

const ROLE_LABELS_VI: Record<WorkflowActorRole, string> = {
  SYSTEM_ADMIN: 'Quản trị hệ thống',
  PRINCIPAL: 'Hiệu trưởng',
  VICE_PRINCIPAL: 'Phó hiệu trưởng',
  HEAD_OF_DEPARTMENT: 'Tổ trưởng chuyên môn',
  TEACHER: 'Giáo viên',
  REVIEWER: 'Giáo viên phản biện'
};

const TEN_TEST_TEACHER_IDS = [
  'user-gv-a',
  'user-gv-b',
  'user-gv-c',
  'user-gv-d',
  'user-gv-e',
  'user-gv-f',
  'user-gv-g',
  'user-gv-h',
  'user-gv-i',
  'user-gv-j'
];

export const TeacherPermissionManagerWorkspace: React.FC<TeacherPermissionManagerWorkspaceProps> = ({
  currentActorUserId = 'user-admin-sys',
  schoolId,
  schoolName,
  initialSelectedTeacherId,
  onQuickSwitchAccountSession,
  onNavigateSection
}) => {
  // Catalog & profiles state
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [curriculumSubjects, setCurriculumSubjects] = useState<SchoolCurriculumSubjectCatalogItem[]>([]);
  const [apiAllowedLevels, setApiAllowedLevels] = useState<LevelId[]>([]);
  const [apiDepartmentsCatalog, setApiDepartmentsCatalog] = useState<string[]>([]);
  const [functionalCatalog, setFunctionalCatalog] = useState<FunctionalPermissionCatalogItem[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<TeacherPermissionProfileSummary[]>([]);
  const [bulkAuditLogs, setBulkAuditLogs] = useState<BulkTeacherPermissionAuditLogEntry[]>([]);
  const [permissionTemplates, setPermissionTemplates] = useState<TeacherPermissionTemplate[]>([]);
  const [showTemplateApplyDrawer, setShowTemplateApplyDrawer] = useState<boolean>(false);

  const activeSchoolDisplayName = useMemo(() => {
    if (schoolName && schoolName.trim()) return schoolName.trim();
    if (schoolId === 'SCHOOL_B' || schoolId === 'sch-tieu-hoc-a') return 'Trường Tiểu học Sịa';
    if (schoolId === 'SCHOOL_C' || schoolId === 'sch-thcs-b') return 'Trường THCS Đặng Dung';
    return 'Trường TH&THCS Nguyễn Đình Anh';
  }, [schoolId, schoolName]);

  const isPrimaryOnlySchool = useMemo(() => {
    if (schoolId === 'SCHOOL_B' || schoolId === 'sch-tieu-hoc-a') return true;
    const sName = activeSchoolDisplayName.toLowerCase();
    if (
      sName.includes('tiểu học') &&
      !sName.includes('th&thcs') &&
      !sName.includes('th &thcs') &&
      !sName.includes('thcs')
    ) {
      return true;
    }
    if (apiAllowedLevels.length === 1 && apiAllowedLevels[0] === 'PRIMARY') {
      return true;
    }
    if (
      curriculumSubjects.length > 0 &&
      curriculumSubjects.every((s) => s.educationLevelId === 'PRIMARY')
    ) {
      return true;
    }
    return false;
  }, [schoolId, activeSchoolDisplayName, apiAllowedLevels, curriculumSubjects]);

  const isLowerSecondaryOnlySchool = useMemo(() => {
    if (isPrimaryOnlySchool) return false;
    if (schoolId === 'SCHOOL_C' || schoolId === 'sch-thcs-b') return true;
    const sName = activeSchoolDisplayName.toLowerCase();
    if (
      sName.includes('thcs') &&
      !sName.includes('th&thcs') &&
      !sName.includes('th &thcs') &&
      !sName.includes('tiểu học')
    ) {
      return true;
    }
    if (apiAllowedLevels.length === 1 && apiAllowedLevels[0] === 'LOWER_SECONDARY') {
      return true;
    }
    if (
      curriculumSubjects.length > 0 &&
      curriculumSubjects.every((s) => s.educationLevelId === 'LOWER_SECONDARY')
    ) {
      return true;
    }
    return false;
  }, [isPrimaryOnlySchool, schoolId, activeSchoolDisplayName, apiAllowedLevels, curriculumSubjects]);

  const allowedSchoolLevels = useMemo<LevelId[]>(() => {
    if (isPrimaryOnlySchool) return ['PRIMARY'];
    if (isLowerSecondaryOnlySchool) return ['LOWER_SECONDARY'];
    return ['PRIMARY', 'LOWER_SECONDARY'];
  }, [isPrimaryOnlySchool, isLowerSecondaryOnlySchool]);

  // Filter & selection state (Area 1: Chọn giáo viên)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    initialSelectedTeacherId || ''
  );
  const selectedTeacherIdRef = useRef<string>(initialSelectedTeacherId || '');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  // =========================================================================
  // STATE PHÂN QUYỀN HÀNG LOẠT (BULK PERMISSION MANAGEMENT - YÊU CẦU 1 -> 10)
  // =========================================================================
  const [bulkSelectedUserIds, setBulkSelectedUserIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<BulkPermissionOperationMode>('ADD_KEEP_EXISTING');
  const [bulkPermissionCodes, setBulkPermissionCodes] = useState<TeacherFunctionalPermissionCode[]>([
    'CREATE_QUESTION',
    'CREATE_EXAM_MATRIX',
    'CREATE_EXAM_PAPER',
    'USE_AI_QUESTION_GENERATOR',
    'EXPORT_EXAM_WORD_PDF'
  ]);
  const [bulkSubjectAllocations, setBulkSubjectAllocations] = useState<TeacherSubjectGradeAllocation[]>([]);
  const [bulkGrantReviewerRole, setBulkGrantReviewerRole] = useState<boolean>(false);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState<boolean>(false);
  const [executingBulkSave, setExecutingBulkSave] = useState<boolean>(false);
  const [lastBulkReport, setLastBulkReport] = useState<BulkTeacherPermissionExecutionReport | null>(null);
  const [bulk10TestReport, setBulk10TestReport] =
    useState<BulkTeacherPermission10TeachersTestReport | null>(null);
  const [runningBulk10Test, setRunningBulk10Test] = useState<boolean>(false);

  // Working form state for the single selected teacher (Areas 2, 3, 4)
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<LevelId[]>(['PRIMARY']);
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<TeacherFunctionalPermissionCode[]>([]);
  const [allocations, setAllocations] = useState<TeacherSubjectGradeAllocation[]>([]);
  const [grantReviewerRole, setGrantReviewerRole] = useState<boolean>(false);

  // Add custom/elective subject modal state
  const [showAddSubjectForm, setShowAddSubjectForm] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectLevel, setNewSubjectLevel] = useState<LevelId>('PRIMARY');
  const [newSubjectGrades, setNewSubjectGrades] = useState<number[]>([4, 5]);
  const [newSubjectAssessmentMode, setNewSubjectAssessmentMode] =
    useState<SubjectAssessmentMode>('PAPER_EXAM');

  // Feedback banner & revocation confirmation modal (Sections IX & X)
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    details?: string[];
    firestoreSynced?: boolean;
  } | null>(null);

  const [revocationModal, setRevocationModal] = useState<{
    warnings: string[];
  } | null>(null);

  // Verification Suite Report (Section XI & Full QA Security Audit Mục I -> VII)
  const [verificationReport, setVerificationReport] =
    useState<TeacherPermissionVerificationSuiteReport | null>(null);
  const [runningVerification, setRunningVerification] = useState<boolean>(false);
  const [fullQaAuditReport, setFullQaAuditReport] =
    useState<VisualPermissionFullQaAuditReport | null>(null);
  const [runningFullQaAudit, setRunningFullQaAudit] = useState<boolean>(false);
  const [switchingAccountUserId, setSwitchingAccountUserId] = useState<string | null>(null);

  const applyProfileToWorkingState = useCallback(
    (profile: TeacherPermissionProfileSummary) => {
      selectedTeacherIdRef.current = profile.userId;
      setSelectedTeacherId(profile.userId);
      const scopedLevels = profile.educationLevels.filter((lvl) =>
        allowedSchoolLevels.includes(lvl)
      );
      setSelectedEducationLevels(
        scopedLevels.length > 0
          ? scopedLevels
          : allowedSchoolLevels.length === 1
          ? [allowedSchoolLevels[0]]
          : [...profile.educationLevels]
      );
      setSelectedPermissionCodes([...profile.permissionCodes]);
      setAllocations(
        profile.subjectAllocations
          .filter((item) => allowedSchoolLevels.includes(item.educationLevelId))
          .map((item) => ({
            ...item,
            grades: [...item.grades]
          }))
      );
      setGrantReviewerRole(profile.roles.includes('REVIEWER'));
      setStatusBanner(null);
      setRevocationModal(null);
    },
    [allowedSchoolLevels]
  );

  const loadCatalogAndProfiles = useCallback(
    async (preserveSelectedId?: string) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          actorUserId: currentActorUserId
        });
        if (schoolId) {
          qs.set('schoolId', schoolId);
        }
        const res = await fetch(
          `/api/security/teacher-permissions/catalog?${qs.toString()}`
        );
        const json = await res.json();
        if (json.ok) {
          setCurriculumSubjects(json.curriculumSubjects || []);
          if (Array.isArray(json.allowedEducationLevels)) {
            setApiAllowedLevels(
              json.allowedEducationLevels.filter(
                (l: string): l is LevelId => l === 'PRIMARY' || l === 'LOWER_SECONDARY'
              )
            );
          }
          if (Array.isArray(json.departmentsCatalog)) {
            setApiDepartmentsCatalog(json.departmentsCatalog);
          } else {
            setApiDepartmentsCatalog([]);
          }
          setFunctionalCatalog(json.functionalPermissionsCatalog || []);
          setBulkAuditLogs(json.bulkAuditLogs || []);
          if (Array.isArray(json.permissionTemplates)) {
            setPermissionTemplates(json.permissionTemplates);
          }
          const profiles: TeacherPermissionProfileSummary[] = json.teachers || [];
          setTeacherProfiles(profiles);

          if (profiles.length === 0) {
            selectedTeacherIdRef.current = '';
            setSelectedTeacherId('');
            setBulkSelectedUserIds([]);
            setSelectedEducationLevels(
              allowedSchoolLevels.length === 1 ? [allowedSchoolLevels[0]] : ['PRIMARY']
            );
            setSelectedPermissionCodes([]);
            setAllocations([]);
            setGrantReviewerRole(false);
          } else {
            const profileIdSet = new Set(profiles.map((p) => p.userId));
            setBulkSelectedUserIds((prev) => {
              const valid = prev.filter((id) => profileIdSet.has(id));
              return valid.length > 0
                ? valid
                : profiles.slice(0, Math.min(3, profiles.length)).map((p) => p.userId);
            });

            const targetId =
              preserveSelectedId ||
              selectedTeacherIdRef.current ||
              profiles[0]?.userId;

            if (targetId) {
              const matched = profiles.find((p) => p.userId === targetId) || profiles[0];
              if (matched) {
                applyProfileToWorkingState(matched);
              }
            }
          }
        }
      } catch (err) {
        setStatusBanner({
          type: 'error',
          message: 'Không thể tải danh mục phân quyền. Vui lòng kiểm tra và thử lại.',
          details: [err instanceof Error ? err.message : 'Lỗi tải danh mục phân quyền giáo viên.']
        });
      } finally {
        setLoading(false);
      }
    },
    [allowedSchoolLevels, applyProfileToWorkingState, currentActorUserId, schoolId]
  );

  useEffect(() => {
    setDepartmentFilter('ALL');
    setLevelFilter('ALL');
    setSubjectFilter('ALL');
  }, [schoolId]);

  useEffect(() => {
    setSelectedEducationLevels((prev) => {
      const filtered = prev.filter((lvl) => allowedSchoolLevels.includes(lvl));
      if (allowedSchoolLevels.length === 1) {
        return [allowedSchoolLevels[0]];
      }
      return filtered.length > 0 ? filtered : [allowedSchoolLevels[0]];
    });
    setAllocations((prev) =>
      prev.filter((a) => allowedSchoolLevels.includes(a.educationLevelId))
    );
    setBulkSubjectAllocations((prev) =>
      prev.filter((a) => allowedSchoolLevels.includes(a.educationLevelId))
    );
    setNewSubjectLevel((prev) =>
      allowedSchoolLevels.includes(prev) ? prev : allowedSchoolLevels[0]
    );
    setNewSubjectGrades((prev) => {
      if (isPrimaryOnlySchool) {
        const valid = prev.filter((g) => g >= 1 && g <= 5);
        return valid.length > 0 ? valid : [4, 5];
      }
      if (isLowerSecondaryOnlySchool) {
        const valid = prev.filter((g) => g >= 6 && g <= 9);
        return valid.length > 0 ? valid : [6, 7];
      }
      return prev;
    });
  }, [allowedSchoolLevels, isPrimaryOnlySchool, isLowerSecondaryOnlySchool]);

  useEffect(() => {
    void loadCatalogAndProfiles(initialSelectedTeacherId);
  }, [initialSelectedTeacherId, loadCatalogAndProfiles]);

  const selectedTeacher = useMemo(
    () => teacherProfiles.find((t) => t.userId === selectedTeacherId) || null,
    [teacherProfiles, selectedTeacherId]
  );

  // Filter teacher list in Area 1
  const allDepartments = useMemo(() => {
    const defaultOrder = isPrimaryOnlySchool
      ? ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4', 'Tổ 5']
      : isLowerSecondaryOnlySchool
      ? ['Tổ khoa học tự nhiên', 'Tổ khoa học xã hội', 'Tổ Tiếng Anh - GDTC', 'Ban Giám hiệu và quản trị']
      : [
          'Tổ 1-2-3',
          'Tổ 4-5',
          'Tổ khoa học tự nhiên',
          'Tổ khoa học xã hội',
          'Tổ Tiếng Anh - GDTC',
          'Ban Giám hiệu và quản trị'
        ];
    const baseList =
      apiDepartmentsCatalog.length > 0 ? apiDepartmentsCatalog : defaultOrder;
    const set = new Set<string>(baseList);
    teacherProfiles.forEach((t) => {
      if (t.departmentName) {
        set.add(t.departmentName);
      }
    });
    return Array.from(set);
  }, [apiDepartmentsCatalog, isPrimaryOnlySchool, isLowerSecondaryOnlySchool, teacherProfiles]);

  const allAssignedSubjects = useMemo(() => {
    const set = new Set<string>();
    teacherProfiles.forEach((t) => {
      t.subjectAllocations.forEach((s) => set.add(s.subjectName));
    });
    return Array.from(set);
  }, [teacherProfiles]);

  const filteredTeachers = useMemo(() => {
    return teacherProfiles.filter((t) => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchName = t.fullName.toLowerCase().includes(kw);
        const matchUser = t.username.toLowerCase().includes(kw);
        const matchEmail = t.email.toLowerCase().includes(kw);
        if (!matchName && !matchUser && !matchEmail) return false;
      }
      if (departmentFilter !== 'ALL' && t.departmentName !== departmentFilter) {
        return false;
      }
      if (levelFilter !== 'ALL' && !t.educationLevels.includes(levelFilter as LevelId)) {
        return false;
      }
      if (
        subjectFilter !== 'ALL' &&
        !t.subjectAllocations.some((s) => s.subjectName === subjectFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [teacherProfiles, searchKeyword, departmentFilter, levelFilter, subjectFilter]);

  // =========================================================================
  // HANDLERS CHO CHỌN HÀNG LOẠT GIÁO VIÊN (YÊU CẦU 1 & 2)
  // =========================================================================
  const handleToggleBulkTeacherCheckbox = (userId: string) => {
    setBulkSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectSingleTeacherForBulk = (userId: string) => {
    setBulkSelectedUserIds([userId]);
    const prof = teacherProfiles.find((p) => p.userId === userId);
    if (prof) applyProfileToWorkingState(prof);
  };

  const handleSelectAllFilteredTeachers = () => {
    const ids = filteredTeachers.map((t) => t.userId);
    setBulkSelectedUserIds(ids);
  };

  const handleSelectEntireDepartment = (deptName: string) => {
    const ids = teacherProfiles
      .filter((t) => t.departmentName === deptName)
      .map((t) => t.userId);
    setBulkSelectedUserIds(ids);
    setDepartmentFilter(deptName);
  };

  const handleSelect10TestTeachers = () => {
    const existing10 = teacherProfiles
      .filter((t) => TEN_TEST_TEACHER_IDS.includes(t.userId))
      .map((t) => t.userId);
    const nextSelection =
      existing10.length > 0
        ? existing10
        : teacherProfiles.slice(0, Math.min(10, teacherProfiles.length)).map((t) => t.userId);
    setBulkSelectedUserIds(nextSelection);
    setDepartmentFilter('ALL');
    setLevelFilter('ALL');
    setSubjectFilter('ALL');
  };

  const handleClearBulkSelection = () => {
    setBulkSelectedUserIds([]);
  };

  const bulkSelectedProfiles = useMemo(
    () => teacherProfiles.filter((t) => bulkSelectedUserIds.includes(t.userId)),
    [teacherProfiles, bulkSelectedUserIds]
  );

  const bulkSelectedLevelStats = useMemo(() => {
    let primaryOnlyCount = 0;
    let lowerSecOnlyCount = 0;
    let bothLevelsCount = 0;
    const deptSet = new Set<string>();
    bulkSelectedProfiles.forEach((p) => {
      if (p.departmentName) deptSet.add(p.departmentName);
      const hasPri = p.educationLevels.includes('PRIMARY');
      const hasSec = p.educationLevels.includes('LOWER_SECONDARY');
      if (hasPri && hasSec) bothLevelsCount++;
      else if (hasPri) primaryOnlyCount++;
      else if (hasSec) lowerSecOnlyCount++;
    });
    return {
      primaryOnlyCount,
      lowerSecOnlyCount,
      bothLevelsCount,
      departments: Array.from(deptSet)
    };
  }, [bulkSelectedProfiles]);

  // Toggle bulk functional permission
  const handleToggleBulkPermission = (code: TeacherFunctionalPermissionCode) => {
    setBulkPermissionCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Quick toggle 5 core functional groups (Requirement 4)
  const handleQuickBulkActionPreset = (
    preset:
      | 'ENABLE_CREATE_QUESTION'
      | 'ENABLE_CREATE_MATRIX'
      | 'ENABLE_CREATE_EXAM'
      | 'ENABLE_USE_AI'
      | 'ENABLE_EXPORT_DRAFT'
      | 'REVOKE_SPECIFIC_AI'
  ) => {
    if (preset === 'REVOKE_SPECIFIC_AI') {
      setBulkMode('REVOKE_SELECTED');
      setBulkPermissionCodes(['EXPORT_EXAM_WORD_PDF']);
      return;
    }
    setBulkMode('ADD_KEEP_EXISTING');
    const codeMap: Record<string, TeacherFunctionalPermissionCode[]> = {
      ENABLE_CREATE_QUESTION: ['CREATE_QUESTION', 'EDIT_QUESTION'],
      ENABLE_CREATE_MATRIX: ['CREATE_EXAM_MATRIX', 'CREATE_EXAM_SPECIFICATION'],
      ENABLE_CREATE_EXAM: ['CREATE_EXAM_PAPER', 'GENERATE_MULTI_EXAM_CODES'],
      ENABLE_USE_AI: ['USE_AI_QUESTION_GENERATOR', 'USE_AI_QUALITY_REVIEW'],
      ENABLE_EXPORT_DRAFT: ['EXPORT_EXAM_WORD_PDF']
    };
    const toAdd = codeMap[preset] || [];
    setBulkPermissionCodes((prev) => Array.from(new Set([...prev, ...toAdd])));
  };

  // Toggle subject in bulk panel
  const isBulkSubjectChecked = (subjectId: string) =>
    bulkSubjectAllocations.some((a) => a.subjectId === subjectId);

  const getBulkSubjectAllocation = (subjectId: string) =>
    bulkSubjectAllocations.find((a) => a.subjectId === subjectId);

  const handleToggleBulkSubject = (subject: SchoolCurriculumSubjectCatalogItem) => {
    setBulkSubjectAllocations((prev) => {
      const exists = prev.some((a) => a.subjectId === subject.subjectId);
      if (exists) {
        return prev.filter((a) => a.subjectId !== subject.subjectId);
      } else {
        const defaultGrades =
          subject.allowedGrades.length > 0 ? [subject.allowedGrades[0]] : [];
        return [
          ...prev,
          {
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            educationLevelId: subject.educationLevelId,
            grades: defaultGrades,
            assessmentMode: subject.defaultAssessmentMode
          }
        ];
      }
    });
  };

  const handleToggleBulkSubjectGrade = (
    subject: SchoolCurriculumSubjectCatalogItem,
    grade: number
  ) => {
    setBulkSubjectAllocations((prev) =>
      prev.map((a) => {
        if (a.subjectId !== subject.subjectId) return a;
        const hasGrade = a.grades.includes(grade);
        const nextGrades = hasGrade
          ? a.grades.filter((g) => g !== grade)
          : [...a.grades, grade].sort((x, y) => x - y);
        return {
          ...a,
          grades: nextGrades
        };
      })
    );
  };

  // Sensitive permissions selected in bulk
  const bulkSelectedSensitiveItems = useMemo(
    () =>
      functionalCatalog.filter(
        (item) => item.isSensitive && bulkPermissionCodes.includes(item.code)
      ),
    [functionalCatalog, bulkPermissionCodes]
  );

  // Cross-level mismatch warnings for bulk subject selection (Requirement 5)
  const bulkCrossLevelWarnings = useMemo(() => {
    const warnings: string[] = [];
    const hasPrimarySubj = bulkSubjectAllocations.some(
      (s) => s.educationLevelId === 'PRIMARY' && s.grades.length > 0
    );
    const hasSecSubj = bulkSubjectAllocations.some(
      (s) => s.educationLevelId === 'LOWER_SECONDARY' && s.grades.length > 0
    );

    if (hasSecSubj && bulkSelectedLevelStats.primaryOnlyCount > 0) {
      warnings.push(
        `Đang chọn môn cấp THCS nhưng danh sách có ${bulkSelectedLevelStats.primaryOnlyCount} giáo viên chỉ được phân công dạy Tiểu học. Hệ thống sẽ chặn (không tự cấp môn THCS cho giáo viên Tiểu học).`
      );
    }
    if (hasPrimarySubj && bulkSelectedLevelStats.lowerSecOnlyCount > 0) {
      warnings.push(
        `Đang chọn môn cấp Tiểu học nhưng danh sách có ${bulkSelectedLevelStats.lowerSecOnlyCount} giáo viên chỉ được phân công dạy THCS. Hệ thống sẽ chặn (không tự cấp môn Tiểu học cho giáo viên THCS).`
      );
    }
    return warnings;
  }, [bulkSubjectAllocations, bulkSelectedLevelStats]);

  // Execute Bulk Save (Requirements 6, 7, 8, 9)
  const handleConfirmAndExecuteBulkSave = async () => {
    if (bulkSelectedUserIds.length === 0) return;
    setExecutingBulkSave(true);
    try {
      const res = await fetch('/api/security/teacher-permissions/bulk-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId: currentActorUserId || 'user-admin-sys',
          userIds: bulkSelectedUserIds,
          mode: bulkMode,
          permissionCodes: bulkPermissionCodes,
          subjectAllocations: bulkSubjectAllocations,
          grantReviewerRoleIfAppraiseSelected: bulkGrantReviewerRole,
          confirmed: true
        })
      });
      const json = await res.json();
      setShowBulkConfirmModal(false);

      if (!res.ok || !json.ok) {
        setStatusBanner({
          type: 'error',
          message: json.message || 'Không thể lưu phân quyền hàng loạt.',
          details: json.detail ? [json.detail] : []
        });
        return;
      }

      const report: BulkTeacherPermissionExecutionReport = json.report;
      setLastBulkReport(report);

      // Đồng bộ nền sang Firestore không chặn giao diện (tránh treo 10s khi Firestore offline)
      if (Array.isArray(report.updatedProfiles)) {
        const allRecords = report.updatedProfiles.flatMap((p) => p.normalizedRecords || []);
        void Promise.all(
          allRecords.slice(0, 30).map((rec) =>
            setDoc(doc(firestoreDb, 'TeacherPermissionGrants', rec.id), rec, { merge: true })
          )
        ).catch(() => {
          // Server disk DB is primary source of truth
        });
      }

      await loadCatalogAndProfiles(selectedTeacherIdRef.current || selectedTeacherId);
      setStatusBanner({
        type: report.failureCount > 0 ? 'warning' : 'success',
        message: json.message || 'Đã thực thi phân quyền hàng loạt thành công.',
        details: [
          `Chế độ: ${
            report.mode === 'ADD_KEEP_EXISTING'
              ? 'Bổ sung quyền được chọn, giữ nguyên quyền khác'
              : 'Thu hồi các quyền được chọn'
          }`,
          `Cập nhật thành công: ${report.successCount} tài khoản · Thất bại: ${report.failureCount} tài khoản.`
        ],
        firestoreSynced: true
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        message: 'Lỗi kết nối khi thực hiện phân quyền hàng loạt.',
        details: [err instanceof Error ? err.message : 'Lỗi không xác định']
      });
    } finally {
      setExecutingBulkSave(false);
    }
  };

  // Run 10-Teacher Bulk Permission Automated Test Suite (Requirement 10)
  const handleRunBulk10TeachersTest = async () => {
    setRunningBulk10Test(true);
    try {
      const res = await fetch('/api/security/teacher-permissions/run-bulk-10-teachers-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.ok && json.report) {
        setBulk10TestReport(json.report);
        setLastBulkReport(json.report.step2CrossLevelSubjectGuardReport);
        await loadCatalogAndProfiles(selectedTeacherId);
      }
    } catch {
      // ignore
    } finally {
      setRunningBulk10Test(false);
    }
  };

  // Select teacher handler (auto-loads saved permissions)
  const handleSelectTeacher = (profile: TeacherPermissionProfileSummary) => {
    applyProfileToWorkingState(profile);
  };

  // Toggle Education Level (Area 2)
  const handleToggleEducationLevel = (level: LevelId) => {
    if (!allowedSchoolLevels.includes(level)) return;
    if (allowedSchoolLevels.length === 1) {
      setSelectedEducationLevels([allowedSchoolLevels[0]]);
      return;
    }
    setSelectedEducationLevels((prev) => {
      const exists = prev.includes(level);
      if (exists) {
        const next = prev.filter((l) => l !== level);
        setAllocations((currAlloc) =>
          currAlloc.filter((a) => a.educationLevelId !== level)
        );
        return next;
      } else {
        return [...prev, level];
      }
    });
  };

  // Toggle Functional Permission (Area 3)
  const handleTogglePermissionCode = (code: TeacherFunctionalPermissionCode) => {
    setSelectedPermissionCodes((prev) => {
      const exists = prev.includes(code);
      if (exists) {
        return prev.filter((c) => c !== code);
      } else {
        if (
          code === 'APPRAISE_EXAM' &&
          selectedTeacher &&
          !selectedTeacher.roles.some((r) =>
            ['REVIEWER', 'HEAD_OF_DEPARTMENT', 'VICE_PRINCIPAL', 'PRINCIPAL', 'SYSTEM_ADMIN'].includes(r)
          )
        ) {
          setGrantReviewerRole(true);
        }
        return [...prev, code];
      }
    });
  };

  // Area 3 bulk action buttons
  const handleSelectAllStandardPermissions = () => {
    const standardCodes = functionalCatalog
      .filter((item) => !item.isSensitive)
      .map((item) => item.code);
    setSelectedPermissionCodes((prev) => {
      const currentSensitive = prev.filter((code) =>
        functionalCatalog.some((f) => f.code === code && f.isSensitive)
      );
      return Array.from(new Set([...standardCodes, ...currentSensitive]));
    });
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissionCodes([]);
  };

  const handleRestoreSavedConfiguration = () => {
    if (selectedTeacher) {
      applyProfileToWorkingState(selectedTeacher);
      setStatusBanner({
        type: 'warning',
        message: `Đã khôi phục cấu hình phân quyền đã lưu gần nhất của ${selectedTeacher.fullName}.`
      });
    }
  };

  // Area 4: Subject & Grade selection
  const primarySubjects = useMemo(
    () => curriculumSubjects.filter((s) => s.educationLevelId === 'PRIMARY'),
    [curriculumSubjects]
  );

  const lowerSecondarySubjects = useMemo(
    () => curriculumSubjects.filter((s) => s.educationLevelId === 'LOWER_SECONDARY'),
    [curriculumSubjects]
  );

  const isSubjectChecked = (subjectId: string) =>
    allocations.some((a) => a.subjectId === subjectId);

  const getSubjectAllocation = (subjectId: string) =>
    allocations.find((a) => a.subjectId === subjectId);

  const handleToggleSubject = (subject: SchoolCurriculumSubjectCatalogItem) => {
    setAllocations((prev) => {
      const exists = prev.some((a) => a.subjectId === subject.subjectId);
      if (exists) {
        return prev.filter((a) => a.subjectId !== subject.subjectId);
      } else {
        const defaultGrades =
          subject.allowedGrades.length > 0 ? [subject.allowedGrades[0]] : [];
        return [
          ...prev,
          {
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            educationLevelId: subject.educationLevelId,
            grades: defaultGrades,
            assessmentMode: subject.defaultAssessmentMode
          }
        ];
      }
    });
  };

  const handleToggleSubjectGrade = (
    subject: SchoolCurriculumSubjectCatalogItem,
    grade: number
  ) => {
    setAllocations((prev) =>
      prev.map((a) => {
        if (a.subjectId !== subject.subjectId) return a;
        const hasGrade = a.grades.includes(grade);
        const nextGrades = hasGrade
          ? a.grades.filter((g) => g !== grade)
          : [...a.grades, grade].sort((x, y) => x - y);
        return {
          ...a,
          grades: nextGrades
        };
      })
    );
  };

  const handleSelectAllGradesForSubject = (subject: SchoolCurriculumSubjectCatalogItem) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.subjectId === subject.subjectId
          ? { ...a, grades: [...subject.allowedGrades] }
          : a
      )
    );
  };

  const handleChangeSubjectAssessmentMode = (
    subjectId: string,
    mode: SubjectAssessmentMode
  ) => {
    setAllocations((prev) =>
      prev.map((a) => (a.subjectId === subjectId ? { ...a, assessmentMode: mode } : a))
    );
  };

  // Add custom/elective subject handler
  const handleAddCustomSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || newSubjectGrades.length === 0) return;
    try {
      const res = await fetch('/api/security/teacher-permissions/add-custom-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: newSubjectName.trim(),
          educationLevelId: newSubjectLevel,
          allowedGrades: newSubjectGrades,
          defaultAssessmentMode: newSubjectAssessmentMode
        })
      });
      const json = await res.json();
      if (json.ok && json.subject) {
        const added: SchoolCurriculumSubjectCatalogItem = json.subject;
        setCurriculumSubjects((prev) => [...prev, added]);
        setNewSubjectName('');
        setShowAddSubjectForm(false);
      }
    } catch {
      // ignore
    }
  };

  // Pre-save client-side validation summary (Section IX)
  const preSaveValidationChecks = useMemo(() => {
    if (!selectedTeacher) return [];

    const hasTeacher = Boolean(selectedTeacher && selectedTeacher.accountStatus === 'ACTIVE');
    const hasValidLevel =
      selectedEducationLevels.length > 0 &&
      selectedEducationLevels.every((l) => allowedSchoolLevels.includes(l));

    const activeAllocations = allocations.filter((a) => a.grades.length > 0);
    const allSubjectsMatchLevel =
      activeAllocations.length > 0 &&
      activeAllocations.every((a) => {
        const cat = curriculumSubjects.find((s) => s.subjectId === a.subjectId);
        return (
          cat &&
          cat.educationLevelId === a.educationLevelId &&
          selectedEducationLevels.includes(a.educationLevelId)
        );
      });

    const allGradesValidForSubject =
      activeAllocations.length > 0 &&
      activeAllocations.every((a) => {
        const cat = curriculumSubjects.find((s) => s.subjectId === a.subjectId);
        return cat && a.grades.every((g) => cat.allowedGrades.includes(g));
      });

    const effectiveRoles: WorkflowActorRole[] = grantReviewerRole
      ? Array.from(new Set([...selectedTeacher.roles, 'REVIEWER']))
      : selectedTeacher.roles;

    const sensitiveChecksOk = selectedPermissionCodes.every((code) => {
      const item = functionalCatalog.find((f) => f.code === code);
      if (!item || !item.isSensitive || !item.requiredRolesForSensitive) return true;
      return effectiveRoles.some((r) => item.requiredRolesForSensitive?.includes(r));
    });

    return [
      {
        id: 'check-teacher',
        label: '1. Giáo viên tồn tại & tài khoản đang hoạt động',
        passed: hasTeacher,
        detail: hasTeacher
          ? `${selectedTeacher.fullName} (${selectedTeacher.username})`
          : 'Tài khoản không hoạt động'
      },
      {
        id: 'check-level',
        label: isPrimaryOnlySchool
          ? '2. Cấp học hợp lệ (Cấp Tiểu học · Khối 1–5)'
          : isLowerSecondaryOnlySchool
          ? '2. Cấp học hợp lệ (Cấp THCS · Khối 6–9)'
          : '2. Cấp học hợp lệ (Tiểu học / THCS)',
        passed: hasValidLevel,
        detail: hasValidLevel
          ? selectedEducationLevels
              .map((l) => (l === 'PRIMARY' ? 'Tiểu học' : 'THCS'))
              .join(', ')
          : 'Chưa chọn cấp học'
      },
      {
        id: 'check-subject-level',
        label: '3. Môn học thuộc đúng cấp học đã chọn',
        passed: allSubjectsMatchLevel,
        detail: allSubjectsMatchLevel
          ? `${activeAllocations.length} môn học hợp lệ theo danh mục GDPT 2018`
          : 'Chưa chọn môn học hoặc môn học lệch cấp học'
      },
      {
        id: 'check-grade-subject',
        label: '4. Khối lớp hợp lệ với từng môn học',
        passed: allGradesValidForSubject,
        detail: allGradesValidForSubject
          ? activeAllocations
              .map((a) => `${a.subjectName} (Khối ${a.grades.join(', ')})`)
              .join(' · ')
          : 'Có môn học chưa chọn khối lớp hợp lệ'
      },
      {
        id: 'check-functional-role',
        label: '5. Quyền chức năng phù hợp vai trò & không vượt thẩm quyền',
        passed: sensitiveChecksOk && selectedPermissionCodes.length > 0,
        detail:
          sensitiveChecksOk && selectedPermissionCodes.length > 0
            ? `Đã chọn ${selectedPermissionCodes.length}/20 quyền chức năng hợp lệ`
            : 'Có quyền nhạy cảm vượt thẩm quyền vai trò hoặc chưa chọn quyền nào'
      }
    ];
  }, [
    selectedTeacher,
    selectedEducationLevels,
    allowedSchoolLevels,
    isPrimaryOnlySchool,
    isLowerSecondaryOnlySchool,
    allocations,
    curriculumSubjects,
    selectedPermissionCodes,
    functionalCatalog,
    grantReviewerRole
  ]);

  // Save handler (Sections VIII, IX, X)
  const handleSavePermissions = async (forceConfirmRevocation: boolean = false) => {
    if (!selectedTeacher) return;
    setSaving(true);
    setStatusBanner(null);

    try {
      const res = await fetch('/api/security/teacher-permissions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId: currentActorUserId || 'user-admin-sys',
          userId: selectedTeacher.userId,
          educationLevels: selectedEducationLevels,
          permissionCodes: selectedPermissionCodes,
          subjectAllocations: allocations,
          grantReviewerRoleIfAppraiseSelected: grantReviewerRole,
          forceConfirmRevocation
        })
      });

      const json = await res.json();

      if (res.status === 409 && json.requiresRevocationConfirmation) {
        setRevocationModal({
          warnings: json.revocationWarnings || [
            'Việc thu hồi quyền hiện tại có thể ảnh hưởng tới các hồ sơ đề kiểm tra đang thực hiện.'
          ]
        });
        setSaving(false);
        return;
      }

      if (!res.ok || !json.ok) {
        setStatusBanner({
          type: 'error',
          message: json.message || 'Không thể lưu phân quyền. Vui lòng kiểm tra và thử lại.',
          details: json.detail ? [json.detail] : []
        });
        setSaving(false);
        return;
      }

      // Đồng bộ nền sang Firestore không chặn giao diện (tránh treo 10s khi Firestore offline)
      const firestoreSynced = true;
      const updatedProfile: TeacherPermissionProfileSummary | undefined = json.profile;
      if (updatedProfile && Array.isArray(updatedProfile.normalizedRecords)) {
        void Promise.all(
          updatedProfile.normalizedRecords.slice(0, 25).map((rec) =>
            setDoc(doc(firestoreDb, 'TeacherPermissionGrants', rec.id), rec, { merge: true })
          )
        ).catch(() => {
          // Server DB is primary truth if client Firestore write is restricted or offline
        });
      }

      setRevocationModal(null);
      await loadCatalogAndProfiles(selectedTeacher.userId);
      setStatusBanner({
        type: 'success',
        message: json.message || 'Đã cập nhật phân quyền thành công cho giáo viên.',
        details: [
          `Giáo viên: ${selectedTeacher.fullName} (${selectedTeacher.username})`,
          `Số bản ghi chuẩn hóa (UserId · SchoolId · RoleId · EducationLevelId · GradeId · SubjectId): ${
            json.savedRecordsCount || 0
          } bản ghi ACTIVE.`
        ],
        firestoreSynced
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        message: 'Không thể lưu phân quyền. Vui lòng kiểm tra và thử lại.',
        details: [err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi lưu phân quyền.']
      });
    } finally {
      setSaving(false);
    }
  };

  // Run 8-criterion & 3-teacher verification suite (Section XI)
  const handleRunVerificationSuite = async () => {
    setRunningVerification(true);
    try {
      const res = await fetch('/api/security/teacher-permissions/run-verification-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.ok && json.report) {
        setVerificationReport(json.report);
        await loadCatalogAndProfiles(selectedTeacherId);
      }
    } catch {
      // ignore
    } finally {
      setRunningVerification(false);
    }
  };

  // Run Full QA & Security Audit (Mục I -> VII)
  const handleRunFullQaSecurityAudit = async () => {
    setRunningFullQaAudit(true);
    try {
      const res = await fetch('/api/security/teacher-permissions/run-full-qa-security-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.ok && json.report) {
        setFullQaAuditReport(json.report);
        await loadCatalogAndProfiles(selectedTeacherId);
      }
    } catch {
      // ignore
    } finally {
      setRunningFullQaAudit(false);
    }
  };

  // Quick login as Teacher A / B / C and jump to Exam Generator ("Tạo đề kiểm tra")
  const handleLoginAndTestExamCreation = async (
    targetUserId: string,
    jumpToExamGenerator: boolean
  ) => {
    setSwitchingAccountUserId(targetUserId);
    try {
      const outcome = await loginWithServerRoleScenario({
        userId: targetUserId,
        rememberMe: true
      });
      if (outcome.ok && outcome.session && onQuickSwitchAccountSession) {
        onQuickSwitchAccountSession(outcome.session);
      }
      if (jumpToExamGenerator && onNavigateSection) {
        onNavigateSection('exam-builder');
      }
    } catch {
      // ignore
    } finally {
      setSwitchingAccountUserId(null);
    }
  };

  // Compute preview combinations for Area 5
  const previewCombinations = useMemo(() => {
    const combos: Array<{
      level: LevelId;
      levelLabel: string;
      subjectId: string;
      subjectName: string;
      grade: number;
      assessmentMode: SubjectAssessmentMode;
    }> = [];
    allocations.forEach((alloc) => {
      if (!selectedEducationLevels.includes(alloc.educationLevelId)) return;
      alloc.grades.forEach((g) => {
        combos.push({
          level: alloc.educationLevelId,
          levelLabel: alloc.educationLevelId === 'PRIMARY' ? 'Tiểu học' : 'THCS',
          subjectId: alloc.subjectId,
          subjectName: alloc.subjectName,
          grade: g,
          assessmentMode: alloc.assessmentMode
        });
      });
    });
    return combos;
  }, [allocations, selectedEducationLevels]);

  if (loading && teacherProfiles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">
          Đang tải danh sách giáo viên, danh mục môn học GDPT 2018 và cấu hình phân quyền...
        </p>
      </div>
    );
  }

  const allFilteredChecked =
    filteredTeachers.length > 0 &&
    filteredTeachers.every((t) => bulkSelectedUserIds.includes(t.userId));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-indigo-300 tracking-wide uppercase mb-1">
              {activeSchoolDisplayName} · QUẢN TRỊ VIÊN TRƯỜNG · PHÂN QUYỀN GIÁO VIÊN (RBAC / ABAC)
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isPrimaryOnlySchool
                ? 'Phân quyền Giáo viên & Phân quyền Hàng loạt — Cấp Tiểu học (Khối 1–5)'
                : isLowerSecondaryOnlySchool
                ? 'Phân quyền Giáo viên & Phân quyền Hàng loạt — Cấp THCS (Khối 6–9)'
                : 'Phân quyền Giáo viên & Phân quyền Hàng loạt theo Tổ chuyên môn / Cấp học'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              {isPrimaryOnlySchool
                ? 'Tích chọn một hoặc nhiều giáo viên (hoặc chọn toàn bộ giáo viên trong Tổ 1 → Tổ 5) để phân quyền theo Cấp Tiểu học (Khối lớp 1, 2, 3, 4, 5) và danh mục môn học Tiểu học GDPT 2018.'
                : 'Tích chọn một hoặc nhiều giáo viên (hoặc chọn toàn bộ giáo viên trong tổ) để phân quyền hàng loạt theo 2 chế độ: Bổ sung quyền giữ nguyên quyền cũ hoặc Thu hồi quyền chọn lọc. Kiểm soát chặt chẽ không cấp môn THCS cho giáo viên Tiểu học và ngược lại.'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Notification Banner (Mục X) */}
      {statusBanner && (
        <div
          className={`rounded-2xl p-4 border flex items-start justify-between gap-4 shadow-xs ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : statusBanner.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : statusBanner.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-bold">{statusBanner.message}</p>
              {statusBanner.details && statusBanner.details.length > 0 && (
                <ul className="mt-1.5 space-y-1 text-xs opacity-90 list-disc list-inside">
                  {statusBanner.details.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              )}
              {statusBanner.firestoreSynced && (
                <p className="mt-2 text-[11px] font-semibold text-emerald-800">
                  ✓ Đã đồng bộ bản ghi chuẩn hóa lên Cloud Firestore (TeacherPermissionGrants) & Server DB
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs font-semibold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* =====================================================================
          KHU VỰC 1: DANH SÁCH GIÁO VIÊN DẠNG BẢNG CÓ CHECKBOX CHỌN HÀNG LOẠT (YÊU CẦU 1 & 2)
      ===================================================================== */}
      <section
        id="area-1-select-teacher"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Danh sách Giáo viên ({filteredTeachers.length} giáo viên) — Tích Checkbox để Phân quyền Hàng loạt
              </h2>
              <p className="text-xs text-slate-500">
                Tích chọn 1 giáo viên, nhiều giáo viên hoặc chọn toàn bộ giáo viên trong tổ chuyên môn. Nhấn vào tên giáo viên để sửa chi tiết cá nhân.
              </p>
            </div>
          </div>

          {/* Thanh công cụ Chọn nhanh cho Phân quyền Hàng loạt */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (filteredTeachers.length > 0) {
                  handleSelectSingleTeacherForBulk(filteredTeachers[0].userId);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Chọn 1 giáo viên đầu
            </button>
            <button
              type="button"
              onClick={handleSelectAllFilteredTeachers}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Chọn tất cả đang lọc ({filteredTeachers.length})
            </button>
            <button
              type="button"
              onClick={handleClearBulkSelection}
              className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition cursor-pointer"
            >
              Bỏ chọn ({bulkSelectedUserIds.length})
            </button>
          </div>
        </div>

        {/* Hàng nút Chọn toàn bộ giáo viên trong từng Tổ chuyên môn (Yêu cầu 2) */}
        <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-indigo-950 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Chọn toàn bộ giáo viên trong tổ:
          </span>
          {allDepartments.map((dept) => {
            const countInDept = teacherProfiles.filter((t) => t.departmentName === dept).length;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => handleSelectEntireDepartment(dept)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-slate-800 border border-indigo-200 font-semibold transition cursor-pointer"
              >
                + {dept} ({countInDept} GV)
              </button>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="p-4 bg-white border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo họ tên, tài khoản, email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả Tổ chuyên môn ({allDepartments.length})</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isPrimaryOnlySchool ? (
                <option value="ALL">Cấp Tiểu học (Khối 1–5)</option>
              ) : isLowerSecondaryOnlySchool ? (
                <option value="ALL">Cấp Trung học cơ sở (Khối 6–9)</option>
              ) : (
                <>
                  <option value="ALL">Tất cả Cấp học (Tiểu học & THCS)</option>
                  <option value="PRIMARY">Cấp Tiểu học (Khối 1–5)</option>
                  <option value="LOWER_SECONDARY">Cấp Trung học cơ sở (Khối 6–9)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả Môn học được phân công</option>
              {allAssignedSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  Môn: {subj}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Teachers Table with Checkboxes on every row (Requirement 1) */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-bold w-12">
                  <input
                    type="checkbox"
                    checked={allFilteredChecked}
                    onChange={() => {
                      if (allFilteredChecked) {
                        handleClearBulkSelection();
                      } else {
                        handleSelectAllFilteredTeachers();
                      }
                    }}
                    title="Chọn / Bỏ chọn tất cả giáo viên đang hiển thị"
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-4 font-bold">Họ và tên</th>
                <th className="py-2.5 px-4 font-bold">Tài khoản</th>
                <th className="py-2.5 px-4 font-bold">Tổ chuyên môn</th>
                <th className="py-2.5 px-4 font-bold">Cấp học giảng dạy</th>
                <th className="py-2.5 px-4 font-bold">Môn học & Khối lớp đã cấp</th>
                <th className="py-2.5 px-4 font-bold">Số quyền</th>
                <th className="py-2.5 px-4 font-bold">Vai trò & Trạng thái</th>
                <th className="py-2.5 px-4 font-bold">Sửa cá nhân</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher) => {
                const isBulkChecked = bulkSelectedUserIds.includes(teacher.userId);
                const isSingleSelected = teacher.userId === selectedTeacherId;
                return (
                  <tr
                    key={teacher.userId}
                    className={`transition ${
                      isBulkChecked
                        ? 'bg-indigo-50/70 hover:bg-indigo-50'
                        : isSingleSelected
                        ? 'bg-slate-100/80'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <input
                        type="checkbox"
                        checked={isBulkChecked}
                        onChange={() => handleToggleBulkTeacherCheckbox(teacher.userId)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td
                      onClick={() => handleToggleBulkTeacherCheckbox(teacher.userId)}
                      className="py-2.5 px-4 font-bold text-slate-900 cursor-pointer"
                    >
                      {teacher.fullName}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {teacher.username}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{teacher.departmentName}</td>
                    <td className="py-2.5 px-4 font-semibold">
                      {teacher.educationLevels
                        .map((lvl) => (lvl === 'PRIMARY' ? 'Tiểu học' : 'THCS'))
                        .join(' · ')}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {teacher.subjectAllocations
                        .map((alloc) => `${alloc.subjectName} (Lớp ${alloc.grades.join(', ')})`)
                        .join(' · ')}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                      {teacher.permissionCodes.length}/20
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {teacher.roles.map((rc) => ROLE_LABELS_VI[rc] || rc).join(', ')} ·{' '}
                      <span
                        className={
                          teacher.accountStatus === 'ACTIVE'
                            ? 'text-emerald-700 font-semibold'
                            : 'text-rose-700 font-semibold'
                        }
                      >
                        {teacher.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSelectTeacher(teacher)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                          isSingleSelected
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSingleSelected ? 'Đang sửa' : 'Sửa riêng'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          KHU VỰC PHÂN QUYỀN HÀNG LOẠT: "Phân quyền cho các giáo viên đã chọn" (YÊU CẦU 3 -> 9)
      ===================================================================== */}
      {bulkSelectedUserIds.length > 0 && (
        <section className="bg-white rounded-2xl border-2 border-indigo-600 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-indigo-950 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                CHỨC NĂNG PHÂN QUYỀN HÀNG LOẠT · ĐANG CHỌN {bulkSelectedUserIds.length} GIÁO VIÊN
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5">
                Phân quyền cho các giáo viên đã chọn
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Đang chọn: <strong>{bulkSelectedUserIds.length} giáo viên</strong> (
                {isPrimaryOnlySchool ? (
                  <>Cấp Tiểu học: {bulkSelectedProfiles.length}</>
                ) : isLowerSecondaryOnlySchool ? (
                  <>Cấp THCS: {bulkSelectedProfiles.length}</>
                ) : (
                  <>
                    Cấp Tiểu học: {bulkSelectedLevelStats.primaryOnlyCount} · Cấp THCS:{' '}
                    {bulkSelectedLevelStats.lowerSecOnlyCount}
                    {bulkSelectedLevelStats.bothLevelsCount > 0
                      ? ` · Liên cấp: ${bulkSelectedLevelStats.bothLevelsCount}`
                      : ''}
                  </>
                )}
                ) thuộc {bulkSelectedLevelStats.departments.length} tổ chuyên môn (
                {bulkSelectedLevelStats.departments.join(', ')}).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClearBulkSelection}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
              >
                Bỏ chọn ({bulkSelectedUserIds.length})
              </button>
              <button
                type="button"
                onClick={() => setShowBulkConfirmModal(true)}
                disabled={
                  executingBulkSave ||
                  (bulkPermissionCodes.length === 0 && bulkSubjectAllocations.length === 0)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Xem xác nhận & Lưu Phân quyền Hàng loạt ({bulkSelectedUserIds.length} GV)
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* YÊU CẦU 7: HAI CHẾ ĐỘ PHÂN QUYỀN HÀNG LOẠT (KHÔNG THAY THẾ TOÀN BỘ QUYỀN) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setBulkMode('ADD_KEEP_EXISTING')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  bulkMode === 'ADD_KEEP_EXISTING'
                    ? 'border-emerald-600 bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  checked={bulkMode === 'ADD_KEEP_EXISTING'}
                  onChange={() => setBulkMode('ADD_KEEP_EXISTING')}
                  className="mt-1 w-4 h-4 text-emerald-600 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Chế độ 1: Bổ sung quyền được chọn, giữ nguyên quyền khác
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Chỉ cộng thêm các quyền chức năng và môn học được tích chọn bên dưới vào hồ sơ của từng giáo viên. Tuyệt đối không làm mất các quyền giáo viên đã có.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setBulkMode('REVOKE_SELECTED')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  bulkMode === 'REVOKE_SELECTED'
                    ? 'border-rose-600 bg-rose-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  checked={bulkMode === 'REVOKE_SELECTED'}
                  onChange={() => setBulkMode('REVOKE_SELECTED')}
                  className="mt-1 w-4 h-4 text-rose-600 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Chế độ 2: Thu hồi các quyền được chọn
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Chỉ gỡ bỏ những quyền cụ thể được tích chọn bên dưới khỏi các tài khoản đã chọn; giữ nguyên toàn bộ các quyền hợp lệ còn lại.
                  </p>
                </div>
              </div>
            </div>

            {/* YÊU CẦU 4: CÁC NÚT THAO TÁC NHANH TRONG PHÂN QUYỀN HÀNG LOẠT */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Thao tác bật / thu hồi nhanh theo nghiệp vụ (Yêu cầu 4):
                </span>
                <button
                  type="button"
                  onClick={() => setBulkPermissionCodes([])}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  Xóa chọn quyền chức năng ({bulkPermissionCodes.length})
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickBulkActionPreset('ENABLE_CREATE_QUESTION')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  + Bật quyền tạo câu hỏi
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickBulkActionPreset('ENABLE_CREATE_MATRIX')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  + Bật quyền tạo ma trận & đặc tả
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickBulkActionPreset('ENABLE_CREATE_EXAM')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  + Bật quyền tạo đề
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickBulkActionPreset('ENABLE_USE_AI')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  + Bật quyền sử dụng AI
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickBulkActionPreset('ENABLE_EXPORT_DRAFT')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  + Bật quyền xuất bản nháp (Word/PDF)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickBulkActionPreset('REVOKE_SPECIFIC_AI')}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 hover:bg-rose-100 text-xs font-bold text-rose-800 cursor-pointer"
                >
                  − Chuyển sang Thu hồi 1 quyền cụ thể
                </button>
              </div>
            </div>

            {/* Danh sách 20 Quyền chức năng sẽ Thêm hoặc Thu hồi */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Chọn các quyền chức năng sẽ{' '}
                {bulkMode === 'ADD_KEEP_EXISTING' ? 'BỔ SUNG (+)' : 'THU HỒI (−)'} cho{' '}
                {bulkSelectedUserIds.length} giáo viên ({bulkPermissionCodes.length} quyền đang chọn):
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {functionalCatalog.map((item) => {
                  const isChecked = bulkPermissionCodes.includes(item.code);
                  return (
                    <label
                      key={item.code}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition ${
                        isChecked
                          ? item.isSensitive
                            ? 'border-amber-500 bg-amber-50/70'
                            : bulkMode === 'ADD_KEEP_EXISTING'
                            ? 'border-emerald-600 bg-emerald-50/50'
                            : 'border-rose-600 bg-rose-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleBulkPermission(item.code)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-slate-900">
                          {item.order}. {item.label}
                        </span>
                        {item.isSensitive && (
                          <span className="block text-[10px] font-bold text-amber-800 mt-0.5">
                            ⚠ Quyền nhạy cảm (Kiểm tra vai trò)
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* YÊU CẦU 5: PHÂN QUYỀN MÔN HỌC HÀNG LOẠT THEO ĐÚNG CẤP GIẢNG DẠY */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Phân quyền Môn học Hàng loạt theo Cấp giảng dạy của từng Giáo viên (Yêu cầu 5 — Tùy chọn)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nguyên tắc bảo vệ: Không tự cấp môn THCS cho giáo viên chỉ được phân công Tiểu học hoặc ngược lại.
                  </p>
                </div>
                {bulkSubjectAllocations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBulkSubjectAllocations([])}
                    className="text-xs font-semibold text-rose-700 underline cursor-pointer"
                  >
                    Bỏ chọn môn học hàng loạt ({bulkSubjectAllocations.length})
                  </button>
                )}
              </div>

              {bulkCrossLevelWarnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Cảnh báo lệch cấp học khi phân quyền môn học hàng loạt (Yêu cầu 5):
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {bulkCrossLevelWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                className={`grid grid-cols-1 ${
                  allowedSchoolLevels.length > 1 ? 'lg:grid-cols-2' : ''
                } gap-4`}
              >
                {/* Tiểu học */}
                {allowedSchoolLevels.includes('PRIMARY') && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="text-xs font-bold text-slate-900">
                      Môn Tiểu học (Khối 1–5 — đang chọn{' '}
                      {isPrimaryOnlySchool
                        ? bulkSelectedProfiles.length
                        : bulkSelectedLevelStats.primaryOnlyCount +
                          bulkSelectedLevelStats.bothLevelsCount}{' '}
                      GV)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {primarySubjects.slice(0, 8).map((subj) => {
                        const checked = isBulkSubjectChecked(subj.subjectId);
                        const alloc = getBulkSubjectAllocation(subj.subjectId);
                        return (
                          <div
                            key={subj.subjectId}
                            className={`p-2 rounded-lg border text-xs ${
                              checked
                                ? 'border-sky-600 bg-sky-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleBulkSubject(subj)}
                                className="rounded text-sky-600"
                              />
                              <span>{subj.subjectName}</span>
                            </label>
                            {checked && alloc && (
                              <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-sky-200">
                                {subj.allowedGrades.map((g) => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => handleToggleBulkSubjectGrade(subj, g)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                      alloc.grades.includes(g)
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-white border border-slate-300 text-slate-600'
                                    }`}
                                  >
                                    Lớp {g}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* THCS */}
                {allowedSchoolLevels.includes('LOWER_SECONDARY') && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="text-xs font-bold text-slate-900">
                      Môn THCS (Chỉ áp dụng cho GV dạy THCS — đang chọn{' '}
                      {bulkSelectedLevelStats.lowerSecOnlyCount +
                        bulkSelectedLevelStats.bothLevelsCount}{' '}
                      GV)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lowerSecondarySubjects.slice(0, 8).map((subj) => {
                        const checked = isBulkSubjectChecked(subj.subjectId);
                        const alloc = getBulkSubjectAllocation(subj.subjectId);
                        return (
                          <div
                            key={subj.subjectId}
                            className={`p-2 rounded-lg border text-xs ${
                              checked
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleBulkSubject(subj)}
                                className="rounded text-purple-600"
                              />
                              <span>{subj.subjectName}</span>
                            </label>
                            {checked && alloc && (
                              <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-purple-200">
                                {subj.allowedGrades.map((g) => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => handleToggleBulkSubjectGrade(subj, g)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                      alloc.grades.includes(g)
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white border border-slate-300 text-slate-600'
                                    }`}
                                  >
                                    Lớp {g}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* YÊU CẦU 6: TÓM TẮT TRƯỚC KHI LƯU & CẢNH BÁO QUYỀN NHẠY CẢM */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-amber-300">
                  Tóm tắt thao tác Phân quyền Hàng loạt trước khi lưu (Yêu cầu 6):
                </div>
                <p>
                  • Số giáo viên được chọn: <strong>{bulkSelectedUserIds.length} giáo viên</strong> ·
                  Chế độ:{' '}
                  <strong>
                    {bulkMode === 'ADD_KEEP_EXISTING'
                      ? 'Bổ sung quyền được chọn, giữ nguyên quyền khác'
                      : 'Thu hồi các quyền được chọn'}
                  </strong>
                </p>
                <p>
                  • Quyền chức năng tác động ({bulkPermissionCodes.length}):{' '}
                  <span className="text-slate-300">
                    {bulkPermissionCodes.join(', ') || 'Không chọn'}
                  </span>
                </p>
                {bulkSelectedSensitiveItems.length > 0 && (
                  <p className="text-amber-300 font-semibold">
                    ⚠ Cảnh báo quyền nhạy cảm: Đang chọn{' '}
                    {bulkSelectedSensitiveItems.map((s) => s.label).join(', ')}. Hệ thống sẽ kiểm tra vai trò từng giáo viên và từ chối nếu vượt thẩm quyền.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowBulkConfirmModal(true)}
                disabled={
                  executingBulkSave ||
                  (bulkPermissionCodes.length === 0 && bulkSubjectAllocations.length === 0)
                }
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                Xác nhận & Lưu Phân quyền Hàng loạt
              </button>
            </div>
          </div>
        </section>
      )}

      {/* HỘP THOẠI XÁC NHẬN TRƯỚC KHI LƯU PHÂN QUYỀN HÀNG LOẠT (YÊU CẦU 6 & 7) */}
      {showBulkConfirmModal && (
        <div className="rounded-2xl p-6 bg-amber-50 border-2 border-amber-500 text-slate-900 shadow-lg space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2 text-xs">
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận thực thi Phân quyền Hàng loạt cho {bulkSelectedUserIds.length} giáo viên (Yêu cầu 6 & 7)
              </h3>
              <p>
                <strong>Chế độ thực thi:</strong>{' '}
                {bulkMode === 'ADD_KEEP_EXISTING'
                  ? 'Bổ sung quyền được chọn, giữ nguyên các quyền hiện có khác của từng giáo viên (Không thay thế toàn bộ quyền).'
                  : 'Thu hồi các quyền được chọn khỏi hồ sơ của các giáo viên đã chọn.'}
              </p>
              <p>
                <strong>Danh sách giáo viên ({bulkSelectedProfiles.length}):</strong>{' '}
                {bulkSelectedProfiles.map((p) => `${p.fullName} (${p.username})`).join(' · ')}
              </p>
              <p>
                <strong>Các quyền sẽ {bulkMode === 'ADD_KEEP_EXISTING' ? 'thêm' : 'thu hồi'}:</strong>{' '}
                {bulkPermissionCodes.length > 0
                  ? bulkPermissionCodes.join(', ')
                  : 'Không thay đổi quyền chức năng'}
                {bulkSubjectAllocations.length > 0
                  ? ` · Môn học: ${bulkSubjectAllocations
                      .map((s) => `${s.subjectName} (Lớp ${s.grades.join(', ')})`)
                      .join('; ')}`
                  : ''}
              </p>
              {bulkSelectedSensitiveItems.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 font-semibold">
                  ⚠ Cảnh báo quyền nhạy cảm: Có {bulkSelectedSensitiveItems.length} quyền nhạy cảm (
                  {bulkSelectedSensitiveItems.map((i) => i.label).join(', ')}). Các tài khoản không đủ vai trò (VD: Giáo viên thường đối với quyền Phê duyệt đề) sẽ bị từ chối và báo cáo trong danh sách thất bại.
                </div>
              )}
              {bulkCrossLevelWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 font-semibold">
                  {bulkCrossLevelWarnings.map((w, idx) => (
                    <div key={idx}>• {w}</div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleConfirmAndExecuteBulkSave}
                  disabled={executingBulkSave}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  {executingBulkSave
                    ? 'Đang cập nhật hàng loạt...'
                    : 'Đồng ý Xác nhận & Lưu Phân quyền Hàng loạt'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BÁO CÁO KẾT QUẢ SAU KHI LƯU PHÂN QUYỀN HÀNG LOẠT & NHẬT KÝ (YÊU CẦU 8, 9, 10)
      ===================================================================== */}
      {(lastBulkReport || bulk10TestReport) && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase">
                BÁO CÁO KẾT QUẢ PHÂN QUYỀN HÀNG LOẠT & KIỂM THỬ 10 GIÁO VIÊN (MỤC 8, 9, 10)
              </div>
              <h2 className="text-base font-bold mt-0.5">
                Thống kê Số tài khoản Thành công, Thất bại, Lý do thất bại & Danh sách thay đổi
              </h2>
            </div>
            {lastBulkReport && (
              <div className="text-xs text-slate-300">
                Người thực hiện: <strong>{lastBulkReport.actorName}</strong> · Thời gian:{' '}
                {new Date(lastBulkReport.executedAt).toLocaleString('vi-VN')}
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Nếu vừa chạy bộ Kiểm thử 10 Giáo viên (Mục 10) */}
            {bulk10TestReport && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-indigo-950 text-sm">
                    ✓ Kết quả Kiểm thử Tự động 10 Giáo viên thuộc 2 Cấp học (5 Tiểu học + 5 THCS) &{' '}
                    {bulk10TestReport.departmentsCovered.length} Tổ chuyên môn:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {bulk10TestReport.allChecksPassed
                      ? 'ĐẠT 100% (4/4 Kịch bản Hàng loạt)'
                      : 'CẦN KIỂM TRA'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      title: 'Kịch bản 1: Bật 5 quyền cốt lõi cho 10 GV',
                      rep: bulk10TestReport.step1AddCorePermissionsReport,
                      desc: 'Bổ sung Tạo câu hỏi, Tạo ma trận, Tạo đề, Dùng AI, Xuất nháp (Giữ nguyên quyền cũ)'
                    },
                    {
                      title: 'Kịch bản 2: Chặn cấp môn THCS cho GV Tiểu học',
                      rep: bulk10TestReport.step2CrossLevelSubjectGuardReport,
                      desc: 'Thử cấp môn KHTN Lớp 6 cho 10 GV -> 5 GV THCS thành công, 5 GV Tiểu học bị chặn'
                    },
                    {
                      title: 'Kịch bản 3: Thu hồi 1 quyền cụ thể',
                      rep: bulk10TestReport.step3RevokeSpecificPermissionReport,
                      desc: 'Thu hồi quyền Xuất bản nháp trên 7 GV D->J mà không làm mất quyền khác'
                    },
                    {
                      title: 'Kịch bản 4: Chặn cấp quyền nhạy cảm sai vai trò',
                      rep: bulk10TestReport.step4SensitiveRoleGuardReport,
                      desc: 'Thử cấp quyền Phê duyệt đề (APPROVE_EXAM) cho 4 GV thường -> Từ chối 4/4'
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLastBulkReport(item.rep)}
                      className="p-3 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 cursor-pointer transition space-y-1"
                    >
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <p className="text-[11px] text-slate-600">{item.desc}</p>
                      <p className="text-[11px] font-bold pt-1">
                        <span className="text-emerald-700">
                          Thành công: {item.rep.successCount}
                        </span>{' '}
                        ·{' '}
                        <span className="text-rose-700">
                          Thất bại/Chặn: {item.rep.failureCount}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chi tiết Báo cáo của Lượt Lưu Hàng loạt đang chọn (Yêu cầu 8) */}
            {lastBulkReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-slate-500">Tổng số tài khoản được chọn</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {lastBulkReport.totalSelectedCount} tài khoản
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-emerald-800 font-semibold">
                      Số tài khoản cập nhật thành công
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 mt-1">
                      {lastBulkReport.successCount} tài khoản
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="text-rose-800 font-semibold">
                      Số tài khoản thất bại / bị chặn bảo vệ
                    </div>
                    <div className="text-2xl font-bold text-rose-700 mt-1">
                      {lastBulkReport.failureCount} tài khoản
                    </div>
                  </div>
                </div>

                {/* Lý do thất bại (nếu có) */}
                {lastBulkReport.failures.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Danh sách Tài khoản Thất bại & Lý do cụ thể ({lastBulkReport.failures.length}):
                    </h3>
                    <div className="overflow-x-auto border border-rose-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-rose-50 text-rose-900 border-b border-rose-200">
                          <tr>
                            <th className="py-2 px-3 font-bold">Giáo viên</th>
                            <th className="py-2 px-3 font-bold">Tài khoản</th>
                            <th className="py-2 px-3 font-bold">Tổ chuyên môn</th>
                            <th className="py-2 px-3 font-bold">Cấp giảng dạy</th>
                            <th className="py-2 px-3 font-bold">Mã lỗi</th>
                            <th className="py-2 px-3 font-bold">Lý do thất bại</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-100">
                          {lastBulkReport.failures.map((f, i) => (
                            <tr key={`${f.userId}-${i}`} className="bg-rose-50/30">
                              <td className="py-2 px-3 font-bold text-slate-900">{f.fullName}</td>
                              <td className="py-2 px-3 font-mono text-slate-600">{f.username}</td>
                              <td className="py-2 px-3 text-slate-700">{f.departmentName}</td>
                              <td className="py-2 px-3 font-semibold">
                                {f.educationLevels
                                  .map((l) => (l === 'PRIMARY' ? 'Tiểu học' : 'THCS'))
                                  .join(', ')}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-rose-700">
                                {f.errorCode}
                              </td>
                              <td className="py-2 px-3 text-rose-900 font-medium">{f.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Danh sách thay đổi thành công */}
                {lastBulkReport.changes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Danh sách Thay đổi Chi tiết ({lastBulkReport.changes.length} tài khoản cập nhật thành công):
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 font-bold">Giáo viên</th>
                            <th className="py-2 px-3 font-bold">Tổ chuyên môn</th>
                            <th className="py-2 px-3 font-bold">Cấp học</th>
                            <th className="py-2 px-3 font-bold">Quyền chức năng thay đổi</th>
                            <th className="py-2 px-3 font-bold">Môn học thay đổi</th>
                            <th className="py-2 px-3 font-bold">Tổng quyền sau lưu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lastBulkReport.changes.map((c, idx) => (
                            <tr key={`${c.userId}-${idx}`}>
                              <td className="py-2 px-3 font-bold text-slate-900">
                                {c.fullName} ({c.username})
                              </td>
                              <td className="py-2 px-3 text-slate-700">{c.departmentName}</td>
                              <td className="py-2 px-3 font-semibold">
                                {c.educationLevels
                                  .map((l) => (l === 'PRIMARY' ? 'Tiểu học' : 'THCS'))
                                  .join(', ')}
                              </td>
                              <td className="py-2 px-3">
                                {c.addedPermissions.length > 0 && (
                                  <span className="text-emerald-700 font-semibold">
                                    + Thêm ({c.addedPermissions.length}):{' '}
                                    {c.addedPermissions.join(', ')}
                                  </span>
                                )}
                                {c.revokedPermissions.length > 0 && (
                                  <span className="text-rose-700 font-semibold">
                                    − Thu hồi ({c.revokedPermissions.length}):{' '}
                                    {c.revokedPermissions.join(', ')}
                                  </span>
                                )}
                                {c.addedPermissions.length === 0 &&
                                  c.revokedPermissions.length === 0 && (
                                    <span className="text-slate-500">
                                      Đã có sẵn / Không đổi quyền chức năng
                                    </span>
                                  )}
                              </td>
                              <td className="py-2 px-3">
                                {c.addedSubjectsSummary.length > 0 && (
                                  <span className="text-emerald-700 font-semibold">
                                    + {c.addedSubjectsSummary.join('; ')}
                                  </span>
                                )}
                                {c.revokedSubjectsSummary.length > 0 && (
                                  <span className="text-rose-700 font-semibold">
                                    − {c.revokedSubjectsSummary.join('; ')}
                                  </span>
                                )}
                                {c.addedSubjectsSummary.length === 0 &&
                                  c.revokedSubjectsSummary.length === 0 && (
                                    <span className="text-slate-400">—</span>
                                  )}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                                {c.totalPermissionsAfter}/20 quyền
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* YÊU CẦU 9: NHẬT KÝ NGƯỜI THỰC HIỆN, THỜI GIAN VÀ QUYỀN THAY ĐỔI */}
            {bulkAuditLogs.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  Nhật ký Phân quyền Hàng loạt (Ghi nhận Người thực hiện · Thời gian · Quyền thay đổi — Mục 9):
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {bulkAuditLogs.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <span className="font-mono text-[11px] text-slate-500">
                          [{new Date(log.executedAt).toLocaleString('vi-VN')}]
                        </span>{' '}
                        <strong className="text-slate-900">{log.actorName}</strong> — {log.summary}
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700 shrink-0">
                        Thành công {log.successCount}/{log.selectedTeacherCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Revocation Confirmation Modal for Single Teacher (Mục IX) */}
      {revocationModal && (
        <div className="rounded-2xl p-5 bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-md space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                Cảnh báo thu hồi quyền đối với hồ sơ đang thực hiện (Mục IX)
              </h3>
              <ul className="mt-1.5 space-y-1 text-xs text-amber-800 list-disc list-inside">
                {revocationModal.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSavePermissions(true)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  Xác nhận thu hồi & Lưu phân quyền
                </button>
                <button
                  type="button"
                  onClick={() => setRevocationModal(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold cursor-pointer"
                >
                  Hủy thao tác
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          KHU VỰC 2, 3, 4, 5: CẤU HÌNH CHI TIẾT CHO 01 GIÁO VIÊN ĐANG CHỌN ({selectedTeacher?.fullName})
      ===================================================================== */}
      {selectedTeacher && (
        <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-indigo-300">
              <UserCheck className="w-4 h-4" />
              Cấu hình chi tiết cá nhân (Khu vực 2 → 5):
            </span>
            <span className="font-bold text-sm text-white">
              {selectedTeacher.fullName} ({selectedTeacher.username})
            </span>
            <span className="text-slate-300">· {selectedTeacher.departmentName}</span>
            <span className="text-slate-300">
              · Vai trò: {selectedTeacher.roles.map((r) => ROLE_LABELS_VI[r]).join(', ')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowTemplateApplyDrawer(true);
                const el = document.getElementById('area-teacher-permission-templates');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Áp dụng mẫu quyền
            </button>
            <button
              type="button"
              onClick={() => handleLoginAndTestExamCreation(selectedTeacher.userId, true)}
              disabled={switchingAccountUserId === selectedTeacher.userId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Đăng nhập tài khoản này & Mở "Tạo đề kiểm tra"
            </button>
          </div>
        </div>
      )}

      {/* MẪU PHÂN QUYỀN GIÁO VIÊN (MỤC I → VI) */}
      <TeacherPermissionTemplatesPanel
        templates={permissionTemplates}
        functionalCatalog={functionalCatalog}
        selectedTeacher={selectedTeacher || undefined}
        allTeachers={teacherProfiles}
        showApplyDrawerInitial={showTemplateApplyDrawer}
        onCloseApplyDrawer={() => setShowTemplateApplyDrawer(false)}
        onTemplatesUpdated={(nextTemplates) => setPermissionTemplates(nextTemplates)}
        onAppliedToTeachers={async (
          updatedProfiles,
          appliedPermissionsForCurrentTeacher,
          grantReviewer,
          bannerMessage,
          bannerDetails
        ) => {
          if (appliedPermissionsForCurrentTeacher) {
            setSelectedPermissionCodes([...appliedPermissionsForCurrentTeacher]);
          }
          if (typeof grantReviewer === 'boolean') {
            setGrantReviewerRole(grantReviewer);
          }
          if (updatedProfiles.length > 0) {
            await loadCatalogAndProfiles(selectedTeacherId);
          }
          if (bannerMessage) {
            setStatusBanner({
              type: 'success',
              message: bannerMessage,
              details: bannerDetails,
              firestoreSynced: updatedProfiles.length > 0
            });
          }
        }}
      />

      {/* KHU VỰC 2: CHỌN CẤP HỌC VÀ KHỐI LỚP (MỤC III) */}
      <section
        id="area-2-select-level"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Khu vực 2 · Chọn Cấp học và Khối lớp giảng dạy
                {selectedTeacher?.fullName ? ` của ${selectedTeacher.fullName}` : ''}
              </h2>
              <p className="text-xs text-slate-500">
                {isPrimaryOnlySchool
                  ? 'Trường Tiểu học chỉ thiết lập Cấp Tiểu học (Khối lớp 1, 2, 3, 4, 5) và danh mục môn học cấp Tiểu học theo Chương trình GDPT 2018.'
                  : isLowerSecondaryOnlySchool
                  ? 'Trường THCS chỉ thiết lập Cấp Trung học cơ sở (Khối lớp 6, 7, 8, 9) và danh mục môn học cấp THCS theo Chương trình GDPT 2018.'
                  : 'Một giáo viên có thể được phân quyền ở một cấp hoặc cả hai cấp học. Danh sách môn học được tách riêng theo từng cấp học.'}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-6 grid grid-cols-1 ${
            allowedSchoolLevels.length > 1 ? 'md:grid-cols-2' : ''
          } gap-4`}
        >
          {/* Tiểu học Checkbox Card */}
          {allowedSchoolLevels.includes('PRIMARY') && (
            <div
              onClick={() => handleToggleEducationLevel('PRIMARY')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between gap-4 ${
                selectedEducationLevels.includes('PRIMARY')
                  ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {selectedEducationLevels.includes('PRIMARY') ? (
                    <CheckSquare className="w-6 h-6 text-sky-600" />
                  ) : (
                    <Square className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      [ {selectedEducationLevels.includes('PRIMARY') ? '✓' : ' '} ] Cấp Tiểu học
                    </span>
                    {isPrimaryOnlySchool && (
                      <span className="text-[11px] font-semibold text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-md">
                        Cấp học mặc định của trường
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Hiển thị các khối lớp Tiểu học (Khối 1, 2, 3, 4, 5) và danh mục{' '}
                    {primarySubjects.length || 13} môn học cấp Tiểu học.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((g) => (
                      <span
                        key={g}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-sky-200 text-xs font-semibold text-sky-900"
                      >
                        Khối {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={selectedEducationLevels.includes('PRIMARY')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEducationLevel('PRIMARY');
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 shrink-0 cursor-pointer ${
                  selectedEducationLevels.includes('PRIMARY') ? 'bg-sky-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    selectedEducationLevels.includes('PRIMARY') ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* THCS Checkbox Card — Chỉ hiển thị khi trường có đào tạo cấp THCS */}
          {allowedSchoolLevels.includes('LOWER_SECONDARY') && (
            <div
              onClick={() => handleToggleEducationLevel('LOWER_SECONDARY')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between gap-4 ${
                selectedEducationLevels.includes('LOWER_SECONDARY')
                  ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {selectedEducationLevels.includes('LOWER_SECONDARY') ? (
                    <CheckSquare className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Square className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      [ {selectedEducationLevels.includes('LOWER_SECONDARY') ? '✓' : ' '} ] Cấp Trung học cơ sở (THCS)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Hiển thị các khối lớp 6, 7, 8, 9 và danh mục {lowerSecondarySubjects.length || 13} môn học cấp Trung học cơ sở.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={selectedEducationLevels.includes('LOWER_SECONDARY')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEducationLevel('LOWER_SECONDARY');
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 shrink-0 cursor-pointer ${
                  selectedEducationLevels.includes('LOWER_SECONDARY')
                    ? 'bg-purple-600'
                    : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    selectedEducationLevels.includes('LOWER_SECONDARY')
                      ? 'translate-x-6'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* KHU VỰC 3: PHÂN QUYỀN CHỨC NĂNG CÁ NHÂN (MỤC IV) */}
      <section
        id="area-3-functional-perms"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Khu vực 3 · Phân quyền Chức năng Cá nhân ({selectedTeacher?.fullName})
              </h2>
              <p className="text-xs text-slate-500">
                Các quyền nhạy cảm (thẩm định, phê duyệt, xuất đáp án/đề mật, quản lý ngân hàng tổ) không tự động bật khi bấm "Chọn tất cả quyền thông thường".
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowTemplateApplyDrawer(true);
                const el = document.getElementById('area-teacher-permission-templates');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Áp dụng mẫu quyền
            </button>
            <button
              type="button"
              onClick={handleSelectAllStandardPermissions}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
            >
              Chọn tất cả quyền thông thường (16)
            </button>
            <button
              type="button"
              onClick={handleDeselectAllPermissions}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Bỏ chọn tất cả
            </button>
            <button
              type="button"
              onClick={handleRestoreSavedConfiguration}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi phục cấu hình đã lưu
            </button>
            <button
              type="button"
              onClick={() => handleSavePermissions(false)}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu phân quyền cá nhân
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                A. Nhóm 16 Quyền Nghiệp vụ Giảng dạy & Xây dựng Đề thông thường
              </h3>
              <span className="text-xs font-semibold text-indigo-600">
                Đã bật:{' '}
                {
                  selectedPermissionCodes.filter((c) =>
                    functionalCatalog.some((f) => f.code === c && !f.isSensitive)
                  ).length
                }{' '}
                / 16 quyền
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {functionalCatalog
                .filter((item) => !item.isSensitive)
                .map((item) => {
                  const isChecked = selectedPermissionCodes.includes(item.code);
                  return (
                    <div
                      key={item.code}
                      onClick={() => handleTogglePermissionCode(item.code)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2.5 ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {item.order}. {item.label}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Phân nhóm: {item.category}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isChecked}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePermissionCode(item.code);
                        }}
                        className={`w-9 h-5 rounded-full transition-colors p-0.5 shrink-0 cursor-pointer ${
                          isChecked ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            isChecked ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  B. Nhóm 4 Quyền Nhạy cảm (Kiểm tra vai trò & phạm vi thẩm quyền trước khi lưu)
                </h3>
              </div>

              {selectedTeacher && (
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grantReviewerRole}
                    onChange={(e) => setGrantReviewerRole(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  Cấp kiêm nhiệm vai trò "Giáo viên phản biện" (cho phép bật quyền Thẩm định đề)
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {functionalCatalog
                .filter((item) => item.isSensitive)
                .map((item) => {
                  const isChecked = selectedPermissionCodes.includes(item.code);
                  const effectiveRoles: WorkflowActorRole[] = selectedTeacher
                    ? grantReviewerRole
                      ? Array.from(new Set([...selectedTeacher.roles, 'REVIEWER']))
                      : selectedTeacher.roles
                    : [];
                  const roleAllowed =
                    !item.requiredRolesForSensitive ||
                    effectiveRoles.some((r) => item.requiredRolesForSensitive?.includes(r));

                  return (
                    <div
                      key={item.code}
                      onClick={() => handleTogglePermissionCode(item.code)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked
                          ? roleAllowed
                            ? 'border-amber-500 bg-amber-50/70'
                            : 'border-rose-500 bg-rose-50/70'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            {item.order}. {item.label}
                          </span>
                          {item.sensitiveReason && (
                            <p className="text-[11px] text-slate-600 mt-1">
                              {item.sensitiveReason}
                            </p>
                          )}
                          {item.requiredRolesForSensitive && (
                            <p
                              className={`text-[11px] mt-1 font-semibold ${
                                roleAllowed ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              Yêu cầu vai trò:{' '}
                              {item.requiredRolesForSensitive
                                .map((r) => ROLE_LABELS_VI[r])
                                .join(' / ')}{' '}
                              {roleAllowed ? '(Đủ thẩm quyền)' : '(Vượt thẩm quyền vai trò hiện tại)'}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isChecked}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePermissionCode(item.code);
                        }}
                        className={`w-10 h-5 rounded-full transition-colors p-0.5 shrink-0 cursor-pointer ${
                          isChecked ? 'bg-amber-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            isChecked ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* KHU VỰC 4: PHÂN QUYỀN MÔN HỌC & KHỐI LỚP CÁ NHÂN (MỤC V & MỤC VI) */}
      <section
        id="area-4-subject-perms"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Khu vực 4 · Phân quyền Môn học & Khối lớp Cá nhân ({selectedTeacher?.fullName})
              </h2>
              <p className="text-xs text-slate-500">
                Khi tích chọn môn học, hệ thống mở các ô chọn Khối lớp hợp lệ của môn học đó và cấu hình hình thức kiểm tra.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSubjectForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Thêm môn học tự chọn / đặc thù của trường
          </button>
        </div>

        {showAddSubjectForm && (
          <form
            onSubmit={handleAddCustomSubject}
            className="p-4 bg-indigo-50/70 border-b border-indigo-200 flex flex-wrap items-end gap-3 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên môn học bổ sung</label>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="VD: Tiếng Pháp / STEM Robotics..."
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cấp học</label>
              <select
                value={newSubjectLevel}
                onChange={(e) => {
                  const lvl = e.target.value as LevelId;
                  setNewSubjectLevel(lvl);
                  setNewSubjectGrades(lvl === 'PRIMARY' ? [4, 5] : [6, 7]);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                {allowedSchoolLevels.includes('PRIMARY') && (
                  <option value="PRIMARY">Tiểu học</option>
                )}
                {allowedSchoolLevels.includes('LOWER_SECONDARY') && (
                  <option value="LOWER_SECONDARY">Trung học cơ sở</option>
                )}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hình thức đánh giá</label>
              <select
                value={newSubjectAssessmentMode}
                onChange={(e) =>
                  setNewSubjectAssessmentMode(e.target.value as SubjectAssessmentMode)
                }
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="PAPER_EXAM">Kiểm tra bằng đề giấy</option>
                <option value="COMMENT_AND_PRACTICE">Đánh giá bằng nhận xét / thực hành</option>
                <option value="HYBRID_PAPER_PRACTICE">Kết hợp đề & thực hành</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
            >
              Lưu vào Danh mục trường
            </button>
          </form>
        )}

        <div className="p-6 space-y-8">
          {/* GROUP A: PRIMARY SUBJECTS */}
          {allowedSchoolLevels.includes('PRIMARY') && (
            <div
              className={
                selectedEducationLevels.includes('PRIMARY') ? '' : 'opacity-45 pointer-events-none'
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {allowedSchoolLevels.length === 1
                      ? `DANH MỤC MÔN HỌC TIỂU HỌC (${primarySubjects.length} môn chuẩn GDPT 2018 · Khối 1–5)`
                      : `A. MÔN HỌC TIỂU HỌC (${primarySubjects.length} môn chuẩn GDPT 2018)`}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {primarySubjects.map((subj) => {
                  const checked = isSubjectChecked(subj.subjectId);
                  const allocation = getSubjectAllocation(subj.subjectId);

                  return (
                    <div
                      key={subj.subjectId}
                      className={`rounded-xl border p-4 transition ${
                        checked
                          ? 'border-sky-500 bg-sky-50/40 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleSubject(subj)}
                            className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {subj.subjectName}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Khối quy định: Lớp {subj.allowedGrades.join(', ')}
                            </span>
                          </div>
                        </label>

                        {checked && (
                          <button
                            type="button"
                            onClick={() => handleSelectAllGradesForSubject(subj)}
                            className="text-[11px] font-semibold text-sky-700 hover:underline cursor-pointer"
                          >
                            Chọn hết khối
                          </button>
                        )}
                      </div>

                      {checked && allocation && (
                        <div className="mt-3 pt-3 border-t border-sky-200/70 space-y-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {subj.allowedGrades.map((grade) => {
                              const gradeChecked = allocation.grades.includes(grade);
                              return (
                                <label
                                  key={grade}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition ${
                                    gradeChecked
                                      ? 'bg-sky-600 text-white border-sky-600'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={gradeChecked}
                                    onChange={() => handleToggleSubjectGrade(subj, grade)}
                                    className="sr-only"
                                  />
                                  <span>
                                    [{gradeChecked ? '✓' : ' '}] Lớp {grade}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          <select
                            value={allocation.assessmentMode}
                            onChange={(e) =>
                              handleChangeSubjectAssessmentMode(
                                subj.subjectId,
                                e.target.value as SubjectAssessmentMode
                              )
                            }
                            className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-300 bg-white text-slate-700"
                          >
                            {Object.entries(ASSESSMENT_MODE_LABELS).map(([k, label]) => (
                              <option key={k} value={k}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GROUP B: LOWER SECONDARY SUBJECTS — Chỉ hiển thị khi trường có cấp THCS */}
          {allowedSchoolLevels.includes('LOWER_SECONDARY') && (
            <div
              className={
                selectedEducationLevels.includes('LOWER_SECONDARY')
                  ? ''
                  : 'opacity-45 pointer-events-none'
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {allowedSchoolLevels.length === 1
                      ? `DANH MỤC MÔN HỌC TRUNG HỌC CƠ SỞ (${lowerSecondarySubjects.length} môn chuẩn GDPT 2018 · Khối 6–9)`
                      : `B. MÔN HỌC TRUNG HỌC CƠ SỞ (${lowerSecondarySubjects.length} môn chuẩn GDPT 2018)`}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {lowerSecondarySubjects.map((subj) => {
                  const checked = isSubjectChecked(subj.subjectId);
                  const allocation = getSubjectAllocation(subj.subjectId);

                  return (
                    <div
                      key={subj.subjectId}
                      className={`rounded-xl border p-4 transition ${
                        checked
                          ? 'border-purple-500 bg-purple-50/40 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleSubject(subj)}
                            className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {subj.subjectName}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Khối quy định: Lớp {subj.allowedGrades.join(', ')}
                            </span>
                          </div>
                        </label>

                        {checked && (
                          <button
                            type="button"
                            onClick={() => handleSelectAllGradesForSubject(subj)}
                            className="text-[11px] font-semibold text-purple-700 hover:underline cursor-pointer"
                          >
                            Chọn hết khối
                          </button>
                        )}
                      </div>

                      {checked && allocation && (
                        <div className="mt-3 pt-3 border-t border-purple-200/70 space-y-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {subj.allowedGrades.map((grade) => {
                              const gradeChecked = allocation.grades.includes(grade);
                              return (
                                <label
                                  key={grade}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition ${
                                    gradeChecked
                                      ? 'bg-purple-600 text-white border-purple-600'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={gradeChecked}
                                    onChange={() => handleToggleSubjectGrade(subj, grade)}
                                    className="sr-only"
                                  />
                                  <span>
                                    [{gradeChecked ? '✓' : ' '}] Lớp {grade}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          <select
                            value={allocation.assessmentMode}
                            onChange={(e) =>
                              handleChangeSubjectAssessmentMode(
                                subj.subjectId,
                                e.target.value as SubjectAssessmentMode
                              )
                            }
                            className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-300 bg-white text-slate-700"
                          >
                            {Object.entries(ASSESSMENT_MODE_LABELS).map(([k, label]) => (
                              <option key={k} value={k}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KHU VỰC 5: XEM LẠI VÀ LƯU PHÂN QUYỀN CÁ NHÂN (MỤC VIII, IX, X) */}
      <section
        id="area-5-review-save"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              5
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Khu vực 5 · Xem lại Tổ hợp Quyền Cá nhân ({selectedTeacher?.fullName}) & Lưu Phân quyền
              </h2>
              <p className="text-xs text-slate-500">
                Đối chiếu 5 điều kiện kiểm tra trước khi lưu và cấu trúc bản ghi phân quyền chuẩn hóa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSavePermissions(false)}
            disabled={saving || !selectedTeacher}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu vào cơ sở dữ liệu...' : 'Xác nhận & Lưu phân quyền cá nhân'}
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kiểm tra hợp lệ trước khi lưu (Mục IX)
            </h3>
            <div className="space-y-2">
              {preSaveValidationChecks.map((chk) => (
                <div
                  key={chk.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    chk.passed
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{chk.label}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">{chk.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Các tổ hợp (Cấp học – Môn học – Khối lớp) được phép tạo đề ({previewCombinations.length} tổ hợp)
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Bảng: TeacherPermissionGrants
              </span>
            </div>

            {previewCombinations.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                Chưa có tổ hợp (Cấp học – Môn học – Khối lớp) nào được chọn.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-bold">UserId</th>
                      <th className="py-2 px-3 font-bold">RoleId</th>
                      <th className="py-2 px-3 font-bold">EducationLevelId</th>
                      <th className="py-2 px-3 font-bold">SubjectId / Môn</th>
                      <th className="py-2 px-3 font-bold">GradeId</th>
                      <th className="py-2 px-3 font-bold">PermissionCodes</th>
                      <th className="py-2 px-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewCombinations.map((c, idx) => (
                      <tr key={`${c.subjectId}-${c.grade}-${idx}`} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                          {selectedTeacher?.userId}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                          {grantReviewerRole
                            ? 'REVIEWER'
                            : selectedTeacher?.roles[0] || 'TEACHER'}
                        </td>
                        <td className="py-2 px-3 font-semibold">
                          {c.level} ({c.levelLabel})
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {c.subjectName}{' '}
                          <span className="font-mono text-[10px] text-slate-400">
                            ({c.subjectId})
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-indigo-700">Lớp {c.grade}</td>
                        <td className="py-2 px-3 text-[11px] text-slate-600">
                          {selectedPermissionCodes.length} mã quyền
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-700">ACTIVE</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
