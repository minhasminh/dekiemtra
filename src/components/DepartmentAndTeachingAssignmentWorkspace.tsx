import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Copy,
  Edit3,
  FileSpreadsheet,
  GraduationCap,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import {
  DepartmentAndAssignmentQaReport,
  SchoolCurriculumSubjectCatalogItem,
  SchoolDepartmentRecord,
  TeacherAccountRecord,
  TeachingAssignmentLifecycleStatus,
  TeachingAssignmentPermissionProposal,
  TeachingAssignmentRecord,
  TeachingProfessionalRoleCode,
} from '../types/domain';

interface DepartmentAndTeachingAssignmentWorkspaceProps {
  schoolId?: string;
  initialTab?: 'DEPARTMENTS' | 'TEACHING_ASSIGNMENTS' | 'PERMISSION_PROPOSAL';
  currentAdminUserId?: string;
  currentAdminName?: string;
  initialSelectedTeacherId?: string;
  onOpenVisualPermissionForTeacher?: (userId: string, fullName: string) => void;
  onOpenAccountManagerForTeacher?: (userId: string) => void;
  onDataChanged?: () => void;
}

const PROFESSIONAL_ROLE_LABELS: Record<TeachingProfessionalRoleCode, string> = {
  SUBJECT_TEACHER: 'Giáo viên bộ môn',
  HOMEROOM_TEACHER: 'Giáo viên chủ nhiệm',
  HEAD_OF_DEPARTMENT: 'Tổ trưởng chuyên môn',
  DEPUTY_HEAD_OF_DEPARTMENT: 'Tổ phó chuyên môn',
  CORE_REVIEWER: 'Giáo viên cốt cán / Phản biện',
};

const ASSIGNMENT_STATUS_LABELS: Record<
  TeachingAssignmentLifecycleStatus,
  { label: string; textClass: string }
> = {
  ACTIVE: { label: 'Đang áp dụng', textClass: 'text-emerald-700 font-semibold' },
  DRAFT: { label: 'Bản nháp (Năm mới)', textClass: 'text-amber-700 font-semibold' },
  ARCHIVED: { label: 'Lưu trữ (Năm cũ)', textClass: 'text-slate-600 font-medium' },
  INACTIVE: { label: 'Ngừng phân công', textClass: 'text-rose-700 font-medium' },
};

const PERMISSION_CODE_VIETNAMESE: Record<string, string> = {
  VIEW_CURRICULUM: 'Xem chương trình giáo dục',
  VIEW_QUESTION_BANK: 'Xem ngân hàng câu hỏi',
  CREATE_QUESTION: 'Tạo câu hỏi mới',
  EDIT_QUESTION: 'Chỉnh sửa câu hỏi',
  DELETE_DRAFT_QUESTION: 'Xóa câu hỏi bản nháp',
  USE_AI_QUESTION_GENERATOR: 'Sử dụng AI tạo câu hỏi',
  CREATE_EXAM_MATRIX: 'Tạo ma trận đề kiểm tra',
  CREATE_EXAM_SPECIFICATION: 'Tạo bản đặc tả đề kiểm tra',
  CREATE_EXAM_PAPER: 'Tạo đề kiểm tra',
  GENERATE_MULTI_EXAM_CODES: 'Trộn nhiều mã đề',
  USE_AI_QUALITY_REVIEW: 'Sử dụng AI kiểm tra chất lượng đề',
  EDIT_EXAM_PAPER: 'Chỉnh sửa đề kiểm tra',
  SUBMIT_FOR_APPRAISAL: 'Gửi hồ sơ thẩm định',
  EXPORT_EXAM_WORD_PDF: 'Xuất đề bản nháp (Word/PDF)',
  APPRAISE_EXAM: 'Thẩm định đề kiểm tra',
  APPROVE_EXAM: 'Phê duyệt đề chính thức (Nhạy cảm)',
  EXPORT_ANSWER_KEY_RUBRIC: 'Xuất đáp án & hướng dẫn chấm / Đề mật (Nhạy cảm)',
  VIEW_RESULT_REPORTS: 'Xem báo cáo kết quả kiểm tra',
  ANALYZE_QUESTION_QUALITY: 'Phân tích chất lượng câu hỏi',
  MANAGE_DEPARTMENT_QUESTION_BANK: 'Quản lý ngân hàng câu hỏi của tổ',
};

export const DepartmentAndTeachingAssignmentWorkspace: React.FC<
  DepartmentAndTeachingAssignmentWorkspaceProps
> = ({
  schoolId,
  initialTab,
  currentAdminUserId = 'user-admin-sys',
  currentAdminName = 'Quản trị hệ thống (admin.nda)',
  initialSelectedTeacherId,
  onOpenVisualPermissionForTeacher,
  onOpenAccountManagerForTeacher,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<
    'DEPARTMENTS' | 'TEACHING_ASSIGNMENTS' | 'PERMISSION_PROPOSAL'
  >(initialTab || 'DEPARTMENTS');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const activeSchoolDisplayName = useMemo(() => {
    if (schoolId === 'SCHOOL_B' || schoolId === 'sch-tieu-hoc-a') {
      return 'Trường Tiểu học Sịa';
    }
    if (schoolId === 'SCHOOL_C' || schoolId === 'sch-thcs-b') {
      return 'Trường THCS Đặng Dung';
    }
    return 'Trường TH&THCS Nguyễn Đình Anh';
  }, [schoolId]);

  const [departments, setDepartments] = useState<SchoolDepartmentRecord[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignmentRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([
    '2025-2026',
    '2026-2027',
    '2027-2028',
  ]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026-2027');
  const [accounts, setAccounts] = useState<TeacherAccountRecord[]>([]);
  const [curriculumSubjects, setCurriculumSubjects] = useState<
    SchoolCurriculumSubjectCatalogItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // State Tab I: Tổ chuyên môn
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-to-khtn');
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState<{
    departmentCode: string;
    departmentName: string;
    educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
    headUserId: string;
    deputyUserId: string;
    status: 'ACTIVE' | 'INACTIVE';
    description: string;
  }>({
    departmentCode: '',
    departmentName: '',
    educationLevels: ['LOWER_SECONDARY'],
    headUserId: '',
    deputyUserId: '',
    status: 'ACTIVE',
    description: '',
  });

  // Modal Chuyển giáo viên giữa các tổ (Mục I)
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferUserIds, setTransferUserIds] = useState<string[]>([]);
  const [transferTargetDeptId, setTransferTargetDeptId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>(
    'Điều động chuyên môn theo kế hoạch năm học'
  );

  // State Tab II: Phân công giảng dạy
  const [assignmentSearch, setAssignmentSearch] = useState<string>('');
  const [filterAssignDept, setFilterAssignDept] = useState<string>('ALL');
  const [filterAssignLevel, setFilterAssignLevel] = useState<
    'ALL' | 'PRIMARY' | 'LOWER_SECONDARY'
  >('ALL');
  const [filterAssignStatus, setFilterAssignStatus] = useState<string>('ALL');
  const [teacherListViewMode, setTeacherListViewMode] = useState<
    'BY_TEACHER' | 'BY_ASSIGNMENT_ROW'
  >('BY_TEACHER');
  const [filterTeacherCoverage, setFilterTeacherCoverage] = useState<
    'ALL' | 'ASSIGNED' | 'UNASSIGNED'
  >('ALL');
  const [formTeacherFilterText, setFormTeacherFilterText] = useState<string>('');

  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState<{
    academicYear: string;
    teacherUserId: string;
    educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY';
    subjectId: string;
    grades: number[];
    assignedClassesText: string;
    professionalRole: TeachingProfessionalRoleCode;
    status: TeachingAssignmentLifecycleStatus;
    notes: string;
  }>({
    academicYear: '2026-2027',
    teacherUserId: initialSelectedTeacherId || '',
    educationLevelId: 'PRIMARY',
    subjectId: 'SUB_PRI_TOAN',
    grades: [4, 5],
    assignedClassesText: '4A1, 4A2, 5A1',
    professionalRole: 'SUBJECT_TEACHER',
    status: 'ACTIVE',
    notes: '',
  });

  // Modal Sao chép phân công sang năm học mới (Mục V)
  const [showCopyYearModal, setShowCopyYearModal] = useState<boolean>(false);
  const [copySourceYear, setCopySourceYear] = useState<string>('2026-2027');
  const [copyTargetYear, setCopyTargetYear] = useState<string>('2027-2028');

  // Modal Nhập Excel Phân công giảng dạy (Mục VI)
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [excelPreviewResult, setExcelPreviewResult] = useState<any | null>(null);
  const [confirmedExcelRowNums, setConfirmedExcelRowNums] = useState<number[]>([]);
  const [importingExcel, setImportingExcel] = useState<boolean>(false);

  // State Tab III/IV: Đề xuất & Xác nhận Quyền từ Phân công giảng dạy
  const [proposalTeacherId, setProposalTeacherId] = useState<string>(
    initialSelectedTeacherId || ''
  );
  const [permissionProposal, setPermissionProposal] =
    useState<TeachingAssignmentPermissionProposal | null>(null);
  const [selectedProposedPerms, setSelectedProposedPerms] = useState<string[]>([]);
  const [loadingProposal, setLoadingProposal] = useState<boolean>(false);
  const [adminConfirmedProposalCheckbox, setAdminConfirmedProposalCheckbox] =
    useState<boolean>(false);

  // State Mục VII: Báo cáo Kiểm thử Nghiệm thu 7 Bước
  const [qaReport, setQaReport] = useState<DepartmentAndAssignmentQaReport | null>(null);
  const [runningQa, setRunningQa] = useState<boolean>(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        adminUserId: currentAdminUserId,
      });
      if (schoolId) {
        qs.set('schoolId', schoolId);
      }
      const res = await fetch(`/api/admin/departments-and-assignments?${qs.toString()}`);
      const data = await res.json();
      if (data.ok) {
        const nextAccounts: TeacherAccountRecord[] = Array.isArray(data.accounts)
          ? data.accounts
          : [];
        const nextDepts: SchoolDepartmentRecord[] = Array.isArray(data.departments)
          ? data.departments
          : [];
        setDepartments(nextDepts);
        setTeachingAssignments(data.teachingAssignments || []);
        if (Array.isArray(data.academicYears) && data.academicYears.length > 0) {
          setAcademicYears(data.academicYears);
        }
        setAccounts(nextAccounts);
        setCurriculumSubjects(data.curriculumSubjects || []);
        if (nextDepts.length > 0) {
          setSelectedDeptId((prev) =>
            prev && nextDepts.some((d) => d.id === prev) ? prev : nextDepts[0].id
          );
        } else {
          setSelectedDeptId('');
        }
        if (nextAccounts.length > 0) {
          setProposalTeacherId((prev) =>
            prev && nextAccounts.some((a) => a.id === prev) ? prev : nextAccounts[0].id
          );
        } else {
          setProposalTeacherId('');
        }
      }
    } catch (err) {
      console.error('Failed to load departments and teaching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [currentAdminUserId, schoolId]);

  useEffect(() => {
    setFilterAssignDept('ALL');
    setBannerMessage(null);
    loadAllData();
  }, [loadAllData]);

  const loadPermissionProposal = useCallback(
    async (targetUserId: string, year: string) => {
      if (!targetUserId) return;
      setLoadingProposal(true);
      try {
        const res = await fetch(
          `/api/admin/teaching-assignments/propose-permissions/${encodeURIComponent(
            targetUserId
          )}?academicYear=${encodeURIComponent(year)}`
        );
        const data = await res.json();
        if (data.ok && data.proposal) {
          setPermissionProposal(data.proposal);
          setSelectedProposedPerms(data.proposal.proposedPermissionCodes || []);
          setAdminConfirmedProposalCheckbox(false);
        }
      } catch (err) {
        console.error('Failed to load permission proposal:', err);
      } finally {
        setLoadingProposal(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeTab === 'PERMISSION_PROPOSAL' && proposalTeacherId) {
      loadPermissionProposal(proposalTeacherId, selectedAcademicYear);
    }
  }, [activeTab, proposalTeacherId, selectedAcademicYear, loadPermissionProposal]);

  const selectedDepartment = useMemo(
    () => departments.find((d) => d.id === selectedDeptId) || departments[0] || null,
    [departments, selectedDeptId]
  );

  const allowedEducationLevels = useMemo<Array<'PRIMARY' | 'LOWER_SECONDARY'>>(() => {
    const levels = new Set<'PRIMARY' | 'LOWER_SECONDARY'>();
    curriculumSubjects.forEach((s) => {
      if (s.educationLevelId === 'PRIMARY' || s.educationLevelId === 'LOWER_SECONDARY') {
        levels.add(s.educationLevelId);
      }
    });
    if (levels.size > 0) {
      return Array.from(levels);
    }
    return ['PRIMARY', 'LOWER_SECONDARY'];
  }, [curriculumSubjects]);

  useEffect(() => {
    if (curriculumSubjects.length === 0) return;
    setAssignForm((prev) => {
      const nextLevel = allowedEducationLevels.includes(prev.educationLevelId)
        ? prev.educationLevelId
        : allowedEducationLevels[0] || 'PRIMARY';
      const levelSubjects = curriculumSubjects.filter(
        (s) => s.educationLevelId === nextLevel
      );
      const validSubject =
        levelSubjects.find((s) => s.subjectId === prev.subjectId) || levelSubjects[0];
      const nextSubjectId = validSubject ? validSubject.subjectId : prev.subjectId;
      const validGrades = prev.grades.filter((g) =>
        validSubject ? validSubject.allowedGrades.includes(g) : true
      );
      const nextGrades =
        validGrades.length > 0
          ? validGrades
          : validSubject && validSubject.allowedGrades.length > 0
          ? [validSubject.allowedGrades[0]]
          : nextLevel === 'PRIMARY'
          ? [4]
          : [6];
      const nextTeacherUserId =
        accounts.length > 0 && !accounts.some((a) => a.id === prev.teacherUserId)
          ? accounts[0].id
          : prev.teacherUserId;

      if (
        nextLevel === prev.educationLevelId &&
        nextSubjectId === prev.subjectId &&
        nextTeacherUserId === prev.teacherUserId &&
        nextGrades.length === prev.grades.length
      ) {
        return prev;
      }
      return {
        ...prev,
        teacherUserId: nextTeacherUserId,
        educationLevelId: nextLevel,
        subjectId: nextSubjectId,
        grades: nextGrades,
      };
    });
  }, [curriculumSubjects, allowedEducationLevels, accounts]);

  // Lọc môn học theo cấp học đang chọn trong biểu mẫu phân công (Mục III.2 & III.3)
  const availableSubjectsForAssignForm = useMemo(
    () =>
      curriculumSubjects.filter(
        (s) => s.educationLevelId === assignForm.educationLevelId
      ),
    [curriculumSubjects, assignForm.educationLevelId]
  );

  const selectedSubjectMeta = useMemo(
    () =>
      availableSubjectsForAssignForm.find((s) => s.subjectId === assignForm.subjectId) ||
      availableSubjectsForAssignForm[0] ||
      null,
    [availableSubjectsForAssignForm, assignForm.subjectId]
  );

  const allowedGradesForAssignForm = useMemo(() => {
    if (selectedSubjectMeta && Array.isArray(selectedSubjectMeta.allowedGrades)) {
      return selectedSubjectMeta.allowedGrades;
    }
    return assignForm.educationLevelId === 'PRIMARY' ? [1, 2, 3, 4, 5] : [6, 7, 8, 9];
  }, [selectedSubjectMeta, assignForm.educationLevelId]);

  const filteredAssignments = useMemo(() => {
    return teachingAssignments.filter((ta) => {
      if (selectedAcademicYear !== 'ALL' && ta.academicYear !== selectedAcademicYear) {
        return false;
      }
      if (filterAssignDept !== 'ALL' && ta.departmentName !== filterAssignDept) {
        return false;
      }
      if (filterAssignLevel !== 'ALL' && ta.educationLevelId !== filterAssignLevel) {
        return false;
      }
      if (filterAssignStatus !== 'ALL' && ta.status !== filterAssignStatus) {
        return false;
      }
      if (assignmentSearch.trim()) {
        const q = assignmentSearch.trim().toLowerCase();
        const matchName = ta.teacherFullName.toLowerCase().includes(q);
        const matchEmail = ta.teacherEmail.toLowerCase().includes(q);
        const matchSub = ta.subjectName.toLowerCase().includes(q);
        const matchClass = (ta.assignedClasses || []).some((c) =>
          c.toLowerCase().includes(q)
        );
        if (!matchName && !matchEmail && !matchSub && !matchClass) return false;
      }
      return true;
    });
  }, [
    teachingAssignments,
    selectedAcademicYear,
    filterAssignDept,
    filterAssignLevel,
    filterAssignStatus,
    assignmentSearch,
  ]);

  // Ánh xạ danh sách giáo viên chính thức của trường (accounts) kèm toàn bộ phân công năm học đang chọn
  const yearScopedAssignmentsByTeacher = useMemo(() => {
    const map = new Map<string, TeachingAssignmentRecord[]>();
    teachingAssignments.forEach((ta) => {
      if (selectedAcademicYear !== 'ALL' && ta.academicYear !== selectedAcademicYear) {
        return;
      }
      const list = map.get(ta.teacherUserId) || [];
      list.push(ta);
      map.set(ta.teacherUserId, list);
    });
    return map;
  }, [teachingAssignments, selectedAcademicYear]);

  const assignedTeachersTotalCount = useMemo(
    () => accounts.filter((acc) => (yearScopedAssignmentsByTeacher.get(acc.id)?.length || 0) > 0).length,
    [accounts, yearScopedAssignmentsByTeacher]
  );

  const unassignedTeachersTotalCount = useMemo(
    () => Math.max(0, accounts.length - assignedTeachersTotalCount),
    [accounts.length, assignedTeachersTotalCount]
  );

  const formSelectableAccounts = useMemo(() => {
    const q = formTeacherFilterText.trim().toLowerCase();
    if (!q) return accounts;
    const filtered = accounts.filter(
      (acc) =>
        acc.fullName.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.departmentName.toLowerCase().includes(q) ||
        String(acc.stt).includes(q)
    );
    // Luôn giữ giáo viên đang được chọn trong danh sách để không mất giá trị select
    if (
      assignForm.teacherUserId &&
      !filtered.some((a) => a.id === assignForm.teacherUserId)
    ) {
      const currentSelected = accounts.find((a) => a.id === assignForm.teacherUserId);
      if (currentSelected) return [currentSelected, ...filtered];
    }
    return filtered;
  }, [accounts, formTeacherFilterText, assignForm.teacherUserId]);

  const filteredTeacherRosterRows = useMemo(() => {
    const q = assignmentSearch.trim().toLowerCase();
    return accounts
      .map((acc) => {
        const allTeacherAssignments = yearScopedAssignmentsByTeacher.get(acc.id) || [];
        const visibleAssignments = allTeacherAssignments.filter((ta) => {
          if (filterAssignLevel !== 'ALL' && ta.educationLevelId !== filterAssignLevel) {
            return false;
          }
          if (filterAssignStatus !== 'ALL' && ta.status !== filterAssignStatus) {
            return false;
          }
          return true;
        });
        return {
          account: acc,
          allTeacherAssignments,
          visibleAssignments,
        };
      })
      .filter(({ account, allTeacherAssignments, visibleAssignments }) => {
        if (filterAssignDept !== 'ALL' && account.departmentName !== filterAssignDept) {
          return false;
        }
        if (filterTeacherCoverage === 'ASSIGNED' && allTeacherAssignments.length === 0) {
          return false;
        }
        if (filterTeacherCoverage === 'UNASSIGNED' && allTeacherAssignments.length > 0) {
          return false;
        }
        if (filterAssignLevel !== 'ALL') {
          const matchesLevel =
            visibleAssignments.length > 0 ||
            (allTeacherAssignments.length === 0 &&
              account.educationLevels.includes(filterAssignLevel));
          if (!matchesLevel) return false;
        }
        if (filterAssignStatus !== 'ALL' && allTeacherAssignments.length > 0 && visibleAssignments.length === 0) {
          return false;
        }
        if (q) {
          const matchTeacher =
            account.fullName.toLowerCase().includes(q) ||
            account.email.toLowerCase().includes(q) ||
            account.username.toLowerCase().includes(q) ||
            account.departmentName.toLowerCase().includes(q) ||
            (account.teacherCode || '').toLowerCase().includes(q);
          const matchAssign = allTeacherAssignments.some(
            (ta) =>
              ta.subjectName.toLowerCase().includes(q) ||
              (ta.assignedClasses || []).some((c) => c.toLowerCase().includes(q))
          );
          if (!matchTeacher && !matchAssign) return false;
        }
        return true;
      });
  }, [
    accounts,
    yearScopedAssignmentsByTeacher,
    filterAssignDept,
    filterAssignLevel,
    filterAssignStatus,
    filterTeacherCoverage,
    assignmentSearch,
  ]);

  // Mở modal tạo tổ mới
  const handleOpenCreateDeptModal = () => {
    setEditingDeptId(null);
    setDeptForm({
      departmentCode: '',
      departmentName: '',
      educationLevels: [allowedEducationLevels[0] || 'PRIMARY'],
      headUserId: '',
      deputyUserId: '',
      status: 'ACTIVE',
      description: '',
    });
    setShowDeptModal(true);
  };

  // Mở modal sửa tổ
  const handleOpenEditDeptModal = (dept: SchoolDepartmentRecord) => {
    setEditingDeptId(dept.id);
    setDeptForm({
      departmentCode: dept.departmentCode,
      departmentName: dept.departmentName,
      educationLevels: dept.educationLevels,
      headUserId: dept.headUserId || '',
      deputyUserId: dept.deputyUserId || '',
      status: dept.status,
      description: dept.description || '',
    });
    setShowDeptModal(true);
  };

  // Lưu tạo/sửa tổ chuyên môn
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingDeptId
      ? `/api/admin/departments/${encodeURIComponent(editingDeptId)}`
      : '/api/admin/departments';
    const method = editingDeptId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...deptForm,
        headUserId: deptForm.headUserId || null,
        deputyUserId: deptForm.deputyUserId || null,
        adminUserId: currentAdminUserId,
        schoolId,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBannerMessage({ type: 'error', text: data.message || 'Không thể lưu tổ chuyên môn.' });
      return;
    }
    setBannerMessage({ type: 'success', text: data.message });
    setShowDeptModal(false);
    await loadAllData();
    if (data.department?.id) {
      setSelectedDeptId(data.department.id);
    }
    onDataChanged?.();
  };

  // Kích hoạt / Ngừng sử dụng tổ chuyên môn
  const handleToggleDepartmentStatus = async (dept: SchoolDepartmentRecord) => {
    const nextStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await fetch(
      `/api/admin/departments/${encodeURIComponent(dept.id)}/status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, adminUserId: currentAdminUserId, schoolId }),
      }
    );
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBannerMessage({ type: 'error', text: data.message || 'Lỗi đổi trạng thái tổ.' });
      return;
    }
    setBannerMessage({ type: 'success', text: data.message });
    await loadAllData();
    onDataChanged?.();
  };

  // Thực hiện chuyển giáo viên giữa các tổ
  const handleExecuteTransferTeachers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferUserIds.length === 0 || !transferTargetDeptId) {
      setBannerMessage({
        type: 'error',
        text: 'Vui lòng chọn ít nhất 1 giáo viên và chọn tổ chuyên môn đích.',
      });
      return;
    }
    const res = await fetch('/api/admin/departments/transfer-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: transferUserIds,
        targetDepartmentId: transferTargetDeptId,
        reason: transferReason,
        adminUserId: currentAdminUserId,
        schoolId,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBannerMessage({ type: 'error', text: data.message || 'Lỗi chuyển tổ chuyên môn.' });
      return;
    }
    setBannerMessage({ type: 'success', text: data.message });
    setShowTransferModal(false);
    setTransferUserIds([]);
    setSelectedDeptId(transferTargetDeptId);
    await loadAllData();
    onDataChanged?.();
  };

  // Lưu phân công giảng dạy (Thêm mới hoặc cập nhật)
  const handleSaveTeachingAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const classesList = assignForm.assignedClassesText
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const subObj = availableSubjectsForAssignForm.find(
      (s) => s.subjectId === assignForm.subjectId
    );
    const payload = {
      academicYear: assignForm.academicYear,
      teacherUserId: assignForm.teacherUserId,
      educationLevelId: assignForm.educationLevelId,
      subjectId: assignForm.subjectId,
      subjectName: subObj ? subObj.subjectName : assignForm.subjectId,
      grades: assignForm.grades,
      assignedClasses: classesList,
      professionalRole: assignForm.professionalRole,
      status: assignForm.status,
      notes: assignForm.notes,
      adminUserId: currentAdminUserId,
    };

    const url = editingAssignmentId
      ? `/api/admin/teaching-assignments/${encodeURIComponent(editingAssignmentId)}`
      : '/api/admin/teaching-assignments';
    const method = editingAssignmentId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBannerMessage({
        type: 'error',
        text: data.message || 'Không thể lưu phân công giảng dạy.',
      });
      return;
    }
    setBannerMessage({ type: 'success', text: data.message });
    setEditingAssignmentId(null);
    await loadAllData();
    onDataChanged?.();
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    const res = await fetch(
      `/api/admin/teaching-assignments/${encodeURIComponent(assignmentId)}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (res.ok && data.ok) {
      setBannerMessage({ type: 'success', text: data.message });
      await loadAllData();
      onDataChanged?.();
    }
  };

  // Sao chép phân công sang năm học mới thành bản nháp (Mục V)
  const handleCopyAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/teaching-assignments/copy-academic-year', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceAcademicYear: copySourceYear,
        targetAcademicYear: copyTargetYear,
        adminUserId: currentAdminUserId,
        schoolId,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBannerMessage({ type: 'error', text: data.message || 'Lỗi sao chép năm học.' });
      return;
    }
    setBannerMessage({ type: 'success', text: data.message });
    setShowCopyYearModal(false);
    setSelectedAcademicYear(copyTargetYear);
    await loadAllData();
  };

  const handleActivateDraftYear = async () => {
    const res = await fetch('/api/admin/teaching-assignments/activate-draft-year', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        academicYear: selectedAcademicYear,
        adminUserId: currentAdminUserId,
        schoolId,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setBannerMessage({ type: 'success', text: data.message });
      await loadAllData();
    }
  };

  // Nạp bộ dữ liệu mẫu Excel 5 dòng và chạy bước Xem trước (dryRun: true)
  const handleLoadSampleExcelAndPreview = async () => {
    setShowExcelModal(true);
    setImportingExcel(true);
    try {
      const qs = new URLSearchParams({
        academicYear: selectedAcademicYear === 'ALL' ? '2026-2027' : selectedAcademicYear,
        adminUserId: currentAdminUserId,
      });
      if (schoolId) qs.set('schoolId', schoolId);
      const sampleRes = await fetch(
        `/api/admin/teaching-assignments/sample-excel-dataset?${qs.toString()}`
      );
      const sampleData = await sampleRes.json();
      const rows = sampleData.rows || [];
      setExcelRows(rows);

      const previewRes = await fetch('/api/admin/teaching-assignments/import-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows,
          dryRun: true,
          adminUserId: currentAdminUserId,
          schoolId,
        }),
      });
      const previewData = await previewRes.json();
      setExcelPreviewResult(previewData);
      const validNums = (previewData.rowResults || [])
        .filter((r: any) => r.valid)
        .map((r: any) => Number(r.rowNumber));
      setConfirmedExcelRowNums(validNums);
    } finally {
      setImportingExcel(false);
    }
  };

  const handleConfirmExcelImport = async () => {
    if (confirmedExcelRowNums.length === 0) {
      setBannerMessage({
        type: 'error',
        text: 'Vui lòng tích chọn xác nhận ít nhất 1 dòng hợp lệ để nhập.',
      });
      return;
    }
    setImportingExcel(true);
    try {
      const res = await fetch('/api/admin/teaching-assignments/import-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: excelRows,
          dryRun: false,
          confirmedRowNumbers: confirmedExcelRowNums,
          adminUserId: currentAdminUserId,
          schoolId,
        }),
      });
      const data = await res.json();
      setExcelPreviewResult(data);
      setBannerMessage({
        type: 'success',
        text: `Đã nhập thành công ${data.importedCount}/${data.totalRows} dòng phân công giảng dạy (Đã chặn ${data.failedCount} dòng lỗi, không tự tạo tài khoản trùng).`,
      });
      await loadAllData();
      onDataChanged?.();
    } finally {
      setImportingExcel(false);
    }
  };

  // Xác nhận và lưu riêng quyền phần mềm được đề xuất từ phân công giảng dạy (Mục IV)
  const handleConfirmAndSaveProposedPermissions = async () => {
    if (!adminConfirmedProposalCheckbox) {
      setBannerMessage({
        type: 'error',
        text: 'Vui lòng tích vào ô xác nhận của Quản trị viên trước khi lưu quyền phần mềm.',
      });
      return;
    }
    const res = await fetch(
      '/api/admin/teaching-assignments/confirm-proposed-permissions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherUserId: proposalTeacherId,
          academicYear: selectedAcademicYear === 'ALL' ? '2026-2027' : selectedAcademicYear,
          confirmedPermissionCodes: selectedProposedPerms,
          confirmedByAdmin: true,
          adminUserId: currentAdminUserId,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBannerMessage({
        type: 'error',
        text: data.message || 'Không thể lưu phân quyền đề xuất.',
      });
      return;
    }
    setBannerMessage({ type: 'success', text: data.message });
    await loadPermissionProposal(
      proposalTeacherId,
      selectedAcademicYear === 'ALL' ? '2026-2027' : selectedAcademicYear
    );
    await loadAllData();
    onDataChanged?.();
  };

  // Chạy Bộ Kiểm thử Nghiệm thu 7 Bước (Mục VII)
  const handleRunQaSuite = async () => {
    setRunningQa(true);
    try {
      const res = await fetch('/api/admin/departments-and-assignments/run-qa-suite', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.ok && data.report) {
        setQaReport(data.report);
        setBannerMessage({
          type: data.report.allPassed ? 'success' : 'error',
          text: `Đã hoàn tất Kiểm thử Nghiệm thu Mục VII: ĐẠT ${data.report.passedCases}/${data.report.totalCases} kịch bản.`,
        });
      }
    } finally {
      setRunningQa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Thanh tiêu đề & Điều khiển Năm học / Kiểm thử */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-blue-800">{activeSchoolDisplayName}</span>
              <span aria-hidden="true">·</span>
              <span>Quản trị viên trường</span>
              <span aria-hidden="true">·</span>
              <span>Tổ chuyên môn & Phân công giảng dạy</span>
              <span aria-hidden="true">·</span>
              <span>Người thực hiện: {currentAdminName}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-blue-700 shrink-0" />
              <span>
                {activeTab === 'TEACHING_ASSIGNMENTS'
                  ? 'PHÂN CÔNG GIẢNG DẠY TOÀN TRƯỜNG'
                  : 'QUẢN LÝ TỔ CHUYÊN MÔN VÀ PHÂN CÔNG GIẢNG DẠY'}
              </span>
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Đồng bộ trực tiếp với danh sách {accounts.length} giáo viên thực tế tại mục Tài khoản giáo viên. Quản lý phân công đa môn, đa khối, đa lớp theo năm học và tách biệt rõ giữa Phân công chuyên môn với Quyền phần mềm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <CalendarClock className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-medium text-slate-700">Năm học:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => {
                  const yr = e.target.value;
                  setSelectedAcademicYear(yr);
                  if (yr !== 'ALL') {
                    setAssignForm((prev) => ({ ...prev, academicYear: yr }));
                  }
                }}
                className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {academicYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr === '2026-2027' ? '(Hiện hành)' : ''}
                  </option>
                ))}
                <option value="ALL">Tất cả năm học</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowCopyYearModal(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-blue-700" />
              <span>Chuyển năm học (Sao chép nháp)</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSampleExcelAndPreview}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nhập Excel Phân công</span>
            </button>

            {false && (
              <button
                type="button"
                onClick={handleRunQaSuite}
                disabled={runningQa}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Play className="w-3.5 h-3.5" />
                <span>
                  {runningQa
                    ? 'Đang chạy kiểm thử...'
                    : 'Chạy Kiểm thử Nghiệm thu 7 Bước (Mục VII)'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Thống kê tổng quan đồng bộ 100% với danh sách giáo viên của trường */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500">Tổng số Giáo viên của trường:</span>{' '}
            <span className="font-bold text-slate-900">
              {accounts.length} giáo viên ({departments.filter((d) => d.status === 'ACTIVE').length}{' '}
              tổ chuyên môn)
            </span>
          </div>
          <div>
            <span className="text-slate-500">Đã phân công ({selectedAcademicYear}):</span>{' '}
            <span className="font-bold text-emerald-700">
              {assignedTeachersTotalCount}/{accounts.length} GV ({filteredAssignments.length} bản ghi)
            </span>
          </div>
          <div>
            <span className="text-slate-500">Chưa có phân công:</span>{' '}
            <span
              className={`font-bold ${
                unassignedTeachersTotalCount > 0 ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {unassignedTeachersTotalCount} giáo viên
            </span>
          </div>
          <div>
            <span className="text-slate-500">Nguyên tắc bảo mật:</span>{' '}
            <span className="font-semibold text-emerald-800">
              Tách biệt Phân công & Quyền phần mềm
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo phản hồi thao tác */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : bannerMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bảng kết quả Kiểm thử Nghiệm thu 7 Bước (Mục VII) */}
      {qaReport && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                BÁO CÁO NGHIỆM THU MODULE TỔ CHUYÊN MÔN & PHÂN CÔNG GIẢNG DẠY (MỤC VII)
              </h2>
              <p className="text-xs text-slate-500">
                Mã phiên: {qaReport.runId} · Thời gian: {qaReport.executedAt} · Kết quả:{' '}
                <span className="font-bold text-emerald-700">
                  ĐẠT {qaReport.passedCases}/{qaReport.totalCases} kịch bản
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQaReport(null)}
              className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer self-start"
            >
              Đóng báo cáo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold">Mã KT</th>
                  <th className="py-2.5 px-3 font-semibold">Kịch bản kiểm thử (Mục VII)</th>
                  <th className="py-2.5 px-3 font-semibold">Dữ liệu đầu vào</th>
                  <th className="py-2.5 px-3 font-semibold">Kết quả mong đợi</th>
                  <th className="py-2.5 px-3 font-semibold">Kết quả thực tế</th>
                  <th className="py-2.5 px-3 font-semibold">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {qaReport.rows.map((row) => (
                  <tr key={row.testCode} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.testCode}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {row.featureName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{row.inputData}</td>
                    <td className="py-2.5 px-3 text-slate-600">{row.expectedOutcome}</td>
                    <td className="py-2.5 px-3 text-slate-800">{row.actualOutcome}</td>
                    <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                      <span
                        className={
                          row.status === 'Đạt' ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Thanh chuyển đổi 3 phân khu chức năng */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'DEPARTMENTS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          I. Quản lý Tổ chuyên môn ({departments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TEACHING_ASSIGNMENTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'TEACHING_ASSIGNMENTS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          II. Phân công Giảng dạy ({accounts.length} GV · {filteredAssignments.length} phân công)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PERMISSION_PROPOSAL')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'PERMISSION_PROPOSAL'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          III & IV. Liên kết Tài khoản & Đề xuất Phân quyền
        </button>
      </div>

      {/* =====================================================================
          PHÂN KHU I: QUẢN LÝ TỔ CHUYÊN MÔN
         ===================================================================== */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Danh sách Tổ chuyên môn */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Danh mục Tổ chuyên môn toàn trường
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn một tổ để xem danh sách giáo viên, gán Tổ trưởng/Tổ phó hoặc chuyển giáo viên.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferTargetDeptId(selectedDepartment?.id || '');
                    setShowTransferModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Chuyển giáo viên giữa các tổ</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreateDeptModal}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo tổ mới</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Mã tổ</th>
                    <th className="py-2.5 px-3 font-semibold">Tên tổ chuyên môn</th>
                    <th className="py-2.5 px-3 font-semibold">Cấp học</th>
                    <th className="py-2.5 px-3 font-semibold">Tổ trưởng / Tổ phó</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Thành viên</th>
                    <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {departments.map((dept) => {
                    const isSelected = selectedDepartment?.id === dept.id;
                    return (
                      <tr
                        key={dept.id}
                        onClick={() => setSelectedDeptId(dept.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {dept.departmentCode}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {dept.departmentName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {dept.educationLevels
                            .map((lv) => (lv === 'PRIMARY' ? 'Tiểu học' : 'THCS'))
                            .join(' · ')}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <div>
                            <span className="text-slate-500">TT:</span>{' '}
                            <span className="font-medium">
                              {dept.headFullName || 'Chưa gán'}
                            </span>
                          </div>
                          {dept.deputyFullName && (
                            <div className="text-slate-500">
                              <span>TP:</span> <span>{dept.deputyFullName}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {dept.members.length}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={
                              dept.status === 'ACTIVE'
                                ? 'text-emerald-700 font-semibold'
                                : 'text-rose-700 font-medium'
                            }
                          >
                            {dept.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng sử dụng'}
                          </span>
                        </td>
                        <td
                          className="py-3 px-3 text-right whitespace-nowrap space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenEditDeptModal(dept)}
                            className="text-blue-700 hover:underline font-medium cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleDepartmentStatus(dept)}
                            className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            {dept.status === 'ACTIVE' ? 'Ngừng dùng' : 'Kích hoạt'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cột phải: Chi tiết Tổ chuyên môn & Danh sách Giáo viên trong tổ */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            {selectedDepartment ? (
              <>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 font-mono">
                      Mã tổ: {selectedDepartment.departmentCode} ·{' '}
                      {selectedDepartment.status === 'ACTIVE'
                        ? 'Đang hoạt động'
                        : 'Ngừng sử dụng'}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedDepartment.departmentName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Tổ trưởng:{' '}
                      <span className="font-semibold text-slate-900">
                        {selectedDepartment.headFullName || 'Chưa bổ nhiệm'}
                      </span>{' '}
                      · Tổ phó:{' '}
                      <span className="font-semibold text-slate-900">
                        {selectedDepartment.deputyFullName || 'Không có'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditDeptModal(selectedDepartment)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Gán TT / TP / Sửa tên</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Danh sách thành viên ({selectedDepartment.members.length} giáo viên)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setTransferTargetDeptId(selectedDepartment.id);
                      setShowTransferModal(true);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Thêm / Chuyển GV vào tổ này</span>
                  </button>
                </div>

                {selectedDepartment.members.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                    Chưa có giáo viên nào trong tổ chuyên môn này.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg max-h-96 overflow-y-auto">
                    {selectedDepartment.members.map((member) => (
                      <div
                        key={member.userId}
                        className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{member.fullName}</span>
                            {selectedDepartment.headUserId === member.userId && (
                              <span className="text-blue-700 font-bold">(Tổ trưởng)</span>
                            )}
                            {selectedDepartment.deputyUserId === member.userId && (
                              <span className="text-teal-700 font-semibold">(Tổ phó)</span>
                            )}
                          </div>
                          <div className="text-slate-500">{member.email}</div>
                          <div className="text-slate-600">
                            Môn dạy:{' '}
                            {member.assignedSubjectsDisplay.length > 0
                              ? member.assignedSubjectsDisplay.join('; ')
                              : 'Chưa phân công'}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setProposalTeacherId(member.userId);
                              setActiveTab('PERMISSION_PROPOSAL');
                            }}
                            className="text-blue-700 hover:underline font-medium cursor-pointer"
                          >
                            Đề xuất quyền
                          </button>
                          {onOpenVisualPermissionForTeacher && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenVisualPermissionForTeacher(
                                  member.userId,
                                  member.fullName
                                )
                              }
                              className="text-emerald-700 hover:underline font-medium cursor-pointer"
                            >
                              Mở Phân quyền
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-slate-500">Chọn một tổ chuyên môn để xem chi tiết.</div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PHÂN KHU II: PHÂN CÔNG GIẢNG DẠY THEO NĂM HỌC
         ===================================================================== */}
      {activeTab === 'TEACHING_ASSIGNMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Biểu mẫu Thêm / Điều chỉnh Phân công Giảng dạy */}
          <form
            onSubmit={handleSaveTeachingAssignment}
            className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
          >
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {editingAssignmentId
                    ? 'Chỉnh sửa Phân công Giảng dạy'
                    : 'Thêm Phân công Giảng dạy mới'}
                </h2>
                <p className="text-xs text-slate-500">
                  Cho phép 1 giáo viên dạy nhiều môn, nhiều khối và nhiều lớp.
                </p>
              </div>
              {editingAssignmentId && (
                <button
                  type="button"
                  onClick={() => setEditingAssignmentId(null)}
                  className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Hủy sửa
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Năm học phân công
                </label>
                <select
                  value={assignForm.academicYear}
                  onChange={(e) =>
                    setAssignForm((prev) => ({ ...prev, academicYear: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                >
                  {academicYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Năm học {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    2. Giáo viên được phân công ({accounts.length} GV)
                  </label>
                  {onOpenAccountManagerForTeacher && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenAccountManagerForTeacher(assignForm.teacherUserId || '')
                      }
                      className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                    >
                      Mở DS Tài khoản GV →
                    </button>
                  )}
                </div>
                {accounts.length > 8 && (
                  <input
                    type="text"
                    value={formTeacherFilterText}
                    onChange={(e) => setFormTeacherFilterText(e.target.value)}
                    placeholder="Lọc nhanh tên / email / tổ để chọn giáo viên..."
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 mb-1.5 text-xs text-slate-800"
                  />
                )}
                {accounts.length === 0 ? (
                  <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-xs">
                    Trường hiện chưa có tài khoản giáo viên nào. Vui lòng thêm hoặc nhập Excel tại mục &ldquo;2. Tài khoản giáo viên&rdquo; trước khi phân công.
                  </div>
                ) : (
                  <select
                    value={assignForm.teacherUserId}
                    onChange={(e) =>
                      setAssignForm((prev) => ({ ...prev, teacherUserId: e.target.value }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                  >
                    {formSelectableAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {String(acc.stt).padStart(2, '0')}. {acc.fullName} — {acc.departmentName} ({acc.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Cấp học giảng dạy
                </label>
                <div
                  className={`grid ${
                    allowedEducationLevels.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  } gap-2`}
                >
                  {allowedEducationLevels.map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => {
                        const firstSub = curriculumSubjects.find(
                          (s) => s.educationLevelId === lv
                        );
                        setAssignForm((prev) => ({
                          ...prev,
                          educationLevelId: lv,
                          subjectId: firstSub ? firstSub.subjectId : '',
                          grades:
                            firstSub && firstSub.allowedGrades.length > 0
                              ? [firstSub.allowedGrades[0]]
                              : lv === 'PRIMARY'
                              ? [4]
                              : [6],
                        }));
                      }}
                      className={`py-2 px-3 rounded-lg border font-semibold cursor-pointer ${
                        assignForm.educationLevelId === lv
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {lv === 'PRIMARY' ? 'Tiểu học (Khối 1–5)' : 'THCS (Khối 6–9)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. Môn học (Theo chương trình cấp học)
                </label>
                <select
                  value={assignForm.subjectId}
                  onChange={(e) => {
                    const nextSubId = e.target.value;
                    const meta = availableSubjectsForAssignForm.find(
                      (s) => s.subjectId === nextSubId
                    );
                    setAssignForm((prev) => ({
                      ...prev,
                      subjectId: nextSubId,
                      grades:
                        meta && meta.allowedGrades.length > 0
                          ? [meta.allowedGrades[0]]
                          : prev.grades,
                    }));
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                >
                  {availableSubjectsForAssignForm.map((sub) => (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {sub.subjectName} (Khối cho phép: {sub.allowedGrades.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  5. Khối lớp giảng dạy (Lọc theo cấp học & môn học)
                </label>
                <div className="flex flex-wrap gap-2">
                  {allowedGradesForAssignForm.map((g) => {
                    const checked = assignForm.grades.includes(g);
                    return (
                      <label
                        key={g}
                        className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer flex items-center gap-1.5 ${
                          checked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setAssignForm((prev) => {
                              const next = checked
                                ? prev.grades.filter((x) => x !== g)
                                : [...prev.grades, g].sort((a, b) => a - b);
                              return { ...prev, grades: next };
                            });
                          }}
                          className="sr-only"
                        />
                        <span>Khối {g}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  6. Lớp được phân công (nếu có, phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={assignForm.assignedClassesText}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      assignedClassesText: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: 6A1, 6A2, 7A1"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    7. Vai trò chuyên môn
                  </label>
                  <select
                    value={assignForm.professionalRole}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        professionalRole: e.target.value as TeachingProfessionalRoleCode,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  >
                    {Object.entries(PROFESSIONAL_ROLE_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    8. Trạng thái phân công
                  </label>
                  <select
                    value={assignForm.status}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        status: e.target.value as TeachingAssignmentLifecycleStatus,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  >
                    <option value="ACTIVE">Đang áp dụng (ACTIVE)</option>
                    <option value="DRAFT">Bản nháp (DRAFT)</option>
                    <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
                    <option value="INACTIVE">Ngừng phân công (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg cursor-pointer"
              >
                {editingAssignmentId
                  ? 'Cập nhật Bản ghi Phân công'
                  : 'Lưu Phân công Giảng dạy'}
              </button>
            </div>
          </form>

          {/* Danh sách Giáo viên & Bảng Phân công Giảng dạy */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {teacherListViewMode === 'BY_TEACHER'
                    ? `Danh sách Giáo viên & Phân công Giảng dạy (${filteredTeacherRosterRows.length}/${accounts.length} giáo viên)`
                    : `Bảng Chi tiết Bản ghi Phân công (${filteredAssignments.length} bản ghi)`}
                </h2>
                <p className="text-xs text-slate-500">
                  Hiển thị đồng bộ 100% danh sách giáo viên của trường từ mục &ldquo;2. Tài khoản giáo viên&rdquo;. Nhấn &ldquo;+ Giao môn&rdquo; để thêm môn/lớp hoặc &ldquo;Đề xuất quyền&rdquo; để đồng bộ quyền phần mềm.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setTeacherListViewMode('BY_TEACHER')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      teacherListViewMode === 'BY_TEACHER'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Theo Giáo viên ({accounts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherListViewMode('BY_ASSIGNMENT_ROW')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      teacherListViewMode === 'BY_ASSIGNMENT_ROW'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Theo Bản ghi ({filteredAssignments.length})
                  </button>
                </div>

                {filteredAssignments.some((a) => a.status === 'DRAFT') && (
                  <button
                    type="button"
                    onClick={handleActivateDraftYear}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer shrink-0"
                  >
                    Kích hoạt toàn bộ Bản nháp ({selectedAcademicYear})
                  </button>
                )}
              </div>
            </div>

            {/* Bộ lọc bảng phân công */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  placeholder="Tìm họ tên GV, email, môn, lớp (6A1)..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <select
                value={filterAssignDept}
                onChange={(e) => setFilterAssignDept(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="ALL">Tất cả Tổ chuyên môn</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.departmentName}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
              <select
                value={filterAssignLevel}
                onChange={(e) => setFilterAssignLevel(e.target.value as any)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="ALL">Tất cả Cấp học</option>
                {allowedEducationLevels.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv === 'PRIMARY' ? 'Tiểu học (Khối 1–5)' : 'THCS (Khối 6–9)'}
                  </option>
                ))}
              </select>
              {teacherListViewMode === 'BY_TEACHER' ? (
                <select
                  value={filterTeacherCoverage}
                  onChange={(e) =>
                    setFilterTeacherCoverage(
                      e.target.value as 'ALL' | 'ASSIGNED' | 'UNASSIGNED'
                    )
                  }
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                >
                  <option value="ALL">Tất cả GV ({accounts.length})</option>
                  <option value="ASSIGNED">
                    Đã phân công ({assignedTeachersTotalCount})
                  </option>
                  <option value="UNASSIGNED">
                    Chưa phân công ({unassignedTeachersTotalCount})
                  </option>
                </select>
              ) : (
                <select
                  value={filterAssignStatus}
                  onChange={(e) => setFilterAssignStatus(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="ACTIVE">Đang áp dụng (ACTIVE)</option>
                  <option value="DRAFT">Bản nháp (DRAFT)</option>
                  <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
                  <option value="INACTIVE">Ngừng phân công</option>
                </select>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Đang tải danh sách giáo viên và dữ liệu phân công giảng dạy của trường...
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl space-y-2">
                <div className="text-sm font-semibold text-slate-800">
                  Chưa có giáo viên nào trong danh sách của trường
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Vui lòng tạo tài khoản hoặc nhập danh sách giáo viên từ Excel tại mục &ldquo;2. Tài khoản giáo viên&rdquo; hoặc &ldquo;3. Nhập Excel&rdquo; trước khi thực hiện phân công giảng dạy.
                </p>
              </div>
            ) : teacherListViewMode === 'BY_TEACHER' ? (
              <div className="overflow-x-auto max-h-[680px] overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-2.5 px-3 font-semibold w-12 text-center">STT</th>
                      <th className="py-2.5 px-3 font-semibold">Họ và tên Giáo viên</th>
                      <th className="py-2.5 px-3 font-semibold">Tổ chuyên môn</th>
                      <th className="py-2.5 px-3 font-semibold">
                        Phân công giảng dạy ({selectedAcademicYear})
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTeacherRosterRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                          Không tìm thấy giáo viên phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      filteredTeacherRosterRows.map(({ account, visibleAssignments }) => {
                        const isSelectedInForm = assignForm.teacherUserId === account.id;
                        return (
                          <tr
                            key={account.id}
                            className={`transition-colors ${
                              isSelectedInForm ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 align-top">
                              {String(account.stt).padStart(2, '0')}
                            </td>
                            <td className="py-3 px-3 align-top">
                              <div className="font-semibold text-slate-900 flex flex-wrap items-center gap-1.5">
                                <span>{account.fullName}</span>
                                {account.roles.includes('PRINCIPAL') && (
                                  <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                                    Hiệu trưởng
                                  </span>
                                )}
                                {account.roles.includes('VICE_PRINCIPAL') && (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                    Phó HT
                                  </span>
                                )}
                                {account.roles.includes('HEAD_OF_DEPARTMENT') && (
                                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                    Tổ trưởng
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 mt-0.5">{account.email}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-medium align-top whitespace-nowrap">
                              {account.departmentName}
                            </td>
                            <td className="py-3 px-3 align-top">
                              {visibleAssignments.length === 0 ? (
                                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                                  Chưa phân công năm học {selectedAcademicYear}
                                </span>
                              ) : (
                                <div className="space-y-1.5">
                                  {visibleAssignments.map((ta) => (
                                    <div
                                      key={ta.id}
                                      className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2"
                                    >
                                      <div>
                                        <span className="font-semibold text-slate-900">
                                          {ta.subjectName}
                                        </span>{' '}
                                        <span className="text-slate-600">
                                          ({ta.educationLevelId === 'PRIMARY' ? 'Tiểu học' : 'THCS'} · Khối{' '}
                                          {ta.grades.join(', ')})
                                        </span>
                                        {ta.assignedClasses && ta.assignedClasses.length > 0 && (
                                          <span className="text-slate-500 font-mono ml-1.5">
                                            [Lớp: {ta.assignedClasses.join(', ')}]
                                          </span>
                                        )}
                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                          {PROFESSIONAL_ROLE_LABELS[ta.professionalRole] ||
                                            ta.professionalRole}{' '}
                                          ·{' '}
                                          <span
                                            className={
                                              ASSIGNMENT_STATUS_LABELS[ta.status]?.textClass ||
                                              'text-slate-700'
                                            }
                                          >
                                            {ASSIGNMENT_STATUS_LABELS[ta.status]?.label || ta.status}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingAssignmentId(ta.id);
                                            setAssignForm({
                                              academicYear: ta.academicYear,
                                              teacherUserId: ta.teacherUserId,
                                              educationLevelId: ta.educationLevelId,
                                              subjectId: ta.subjectId,
                                              grades: ta.grades,
                                              assignedClassesText: (ta.assignedClasses || []).join(
                                                ', '
                                              ),
                                              professionalRole: ta.professionalRole,
                                              status: ta.status,
                                              notes: ta.notes || '',
                                            });
                                          }}
                                          className="text-blue-700 hover:underline font-medium cursor-pointer"
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteAssignment(ta.id)}
                                          className="text-rose-700 hover:underline cursor-pointer"
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right align-top whitespace-nowrap">
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAssignmentId(null);
                                    const prefAlloc = account.subjectAllocations?.[0];
                                    const prefLevel =
                                      prefAlloc?.educationLevelId &&
                                      allowedEducationLevels.includes(prefAlloc.educationLevelId)
                                        ? prefAlloc.educationLevelId
                                        : allowedEducationLevels.includes(
                                            account.educationLevels?.[0]
                                          )
                                        ? account.educationLevels[0]
                                        : allowedEducationLevels[0] || 'PRIMARY';
                                    const levelSubs = curriculumSubjects.filter(
                                      (s) => s.educationLevelId === prefLevel
                                    );
                                    const matchedSub =
                                      (prefAlloc &&
                                        levelSubs.find(
                                          (s) => s.subjectId === prefAlloc.subjectId
                                        )) ||
                                      levelSubs[0];
                                    const nextGrades =
                                      prefAlloc?.grades && prefAlloc.grades.length > 0
                                        ? prefAlloc.grades
                                        : matchedSub?.allowedGrades?.length
                                        ? [matchedSub.allowedGrades[0]]
                                        : prefLevel === 'PRIMARY'
                                        ? [4]
                                        : [6];
                                    setAssignForm((prev) => ({
                                      ...prev,
                                      academicYear:
                                        selectedAcademicYear === 'ALL'
                                          ? '2026-2027'
                                          : selectedAcademicYear,
                                      teacherUserId: account.id,
                                      educationLevelId: prefLevel,
                                      subjectId: matchedSub ? matchedSub.subjectId : prev.subjectId,
                                      grades: nextGrades,
                                      assignedClassesText: nextGrades
                                        .map((g) => `${g}A1`)
                                        .join(', '),
                                      professionalRole: account.roles.includes('HEAD_OF_DEPARTMENT')
                                        ? 'HEAD_OF_DEPARTMENT'
                                        : 'SUBJECT_TEACHER',
                                      status: 'ACTIVE',
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                                >
                                  + Giao môn
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProposalTeacherId(account.id);
                                    setActiveTab('PERMISSION_PROPOSAL');
                                  }}
                                  className="text-emerald-700 hover:underline font-medium cursor-pointer"
                                >
                                  Đề xuất quyền
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
            ) : (
              <div className="overflow-x-auto max-h-[680px] overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-2.5 px-3 font-semibold">Giáo viên / Tổ CM</th>
                      <th className="py-2.5 px-3 font-semibold">Năm học</th>
                      <th className="py-2.5 px-3 font-semibold">Cấp học</th>
                      <th className="py-2.5 px-3 font-semibold">Môn học & Khối lớp</th>
                      <th className="py-2.5 px-3 font-semibold">Lớp phân công</th>
                      <th className="py-2.5 px-3 font-semibold">Vai trò CM</th>
                      <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAssignments.map((ta) => (
                      <tr key={ta.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">
                            {ta.teacherFullName}
                          </div>
                          <div className="text-slate-500">
                            {ta.departmentName} · {ta.teacherEmail}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                          {ta.academicYear}
                        </td>
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          {ta.educationLevelId === 'PRIMARY' ? 'Tiểu học' : 'THCS'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900">
                            {ta.subjectName}
                          </span>{' '}
                          <span className="text-slate-600">
                            (Khối {ta.grades.join(', ')})
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {ta.assignedClasses && ta.assignedClasses.length > 0
                            ? ta.assignedClasses.join(', ')
                            : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {PROFESSIONAL_ROLE_LABELS[ta.professionalRole] ||
                            ta.professionalRole}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={
                              ASSIGNMENT_STATUS_LABELS[ta.status]?.textClass ||
                              'text-slate-700'
                            }
                          >
                            {ASSIGNMENT_STATUS_LABELS[ta.status]?.label || ta.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setProposalTeacherId(ta.teacherUserId);
                              setActiveTab('PERMISSION_PROPOSAL');
                            }}
                            className="text-blue-700 hover:underline font-semibold cursor-pointer"
                          >
                            Đề xuất quyền
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAssignmentId(ta.id);
                              setAssignForm({
                                academicYear: ta.academicYear,
                                teacherUserId: ta.teacherUserId,
                                educationLevelId: ta.educationLevelId,
                                subjectId: ta.subjectId,
                                grades: ta.grades,
                                assignedClassesText: (ta.assignedClasses || []).join(', '),
                                professionalRole: ta.professionalRole,
                                status: ta.status,
                                notes: ta.notes || '',
                              });
                            }}
                            className="text-slate-700 hover:underline cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(ta.id)}
                            className="text-rose-700 hover:underline cursor-pointer"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PHÂN KHU III & IV: LIÊN KẾT TÀI KHOẢN & ĐỀ XUẤT PHÂN QUYỀN TỪ PHÂN CÔNG
         ===================================================================== */}
      {activeTab === 'PERMISSION_PROPOSAL' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                LIÊN KẾT PHÂN CÔNG GIẢNG DẠY VỚI TÀI KHOẢN & PHÂN QUYỀN (MỤC III & IV)
              </h2>
              <p className="text-xs text-slate-600">
                Sử dụng Phân công giảng dạy làm cơ sở đề xuất quyền tạo câu hỏi và tạo đề. Không tự coi việc được phân công môn học là quyền phê duyệt hoặc truy cập đề mật.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={proposalTeacherId}
                onChange={(e) => setProposalTeacherId(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.fullName} ({acc.email}) — {acc.departmentName}
                  </option>
                ))}
              </select>

              {onOpenVisualPermissionForTeacher && permissionProposal && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenVisualPermissionForTeacher(
                      permissionProposal.teacherUserId,
                      permissionProposal.teacherFullName
                    )
                  }
                  className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                >
                  Mở Trang Phân quyền Trực quan
                </button>
              )}
            </div>
          </div>

          {loadingProposal || !permissionProposal ? (
            <div className="p-6 text-xs text-slate-500">
              Đang tải dữ liệu đối chiếu Phân công giảng dạy và Quyền phần mềm...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              {/* Cột 1: Phân công giảng dạy thực tế */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-900 text-sm">
                  1. Phân công giảng dạy thực tế ({permissionProposal.academicYear})
                </div>
                <p className="text-slate-500">
                  Xác định giáo viên thực tế phụ trách môn, khối, lớp nào trong năm học.
                </p>
                {permissionProposal.activeAssignments.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-slate-500">
                    Chưa có phân công giảng dạy trong năm học này.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {permissionProposal.activeAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
                      >
                        <div className="font-bold text-slate-900">
                          {a.subjectName} (
                          {a.educationLevelId === 'PRIMARY' ? 'Tiểu học' : 'THCS'} — Khối{' '}
                          {a.grades.join(', ')})
                        </div>
                        <div className="text-slate-600">
                          Lớp dạy:{' '}
                          <span className="font-mono font-semibold">
                            {a.assignedClasses?.join(', ') || '—'}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          Vai trò:{' '}
                          {PROFESSIONAL_ROLE_LABELS[a.professionalRole] ||
                            a.professionalRole}{' '}
                          · Trạng thái: {a.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cột 2: Quyền phần mềm hiện tại */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-900 text-sm">
                  2. Quyền phần mềm hiện tại ({permissionProposal.currentPermissionCodes.length}{' '}
                  quyền)
                </div>
                <p className="text-slate-500">
                  Quyền đang lưu trong TeacherPermissionGrants. Không tự động biến đổi khi sửa bảng phân công.
                </p>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {permissionProposal.currentPermissionCodes.map((code) => (
                    <div
                      key={code}
                      className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">
                        {PERMISSION_CODE_VIETNAMESE[code] || code}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{code}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột 3: Đề xuất quyền tạo câu hỏi & tạo đề + Xác nhận lưu riêng */}
              <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-4">
                <div className="font-bold text-slate-900 text-sm">
                  3. Đề xuất Quyền tạo câu hỏi & tạo đề (Cần xác nhận riêng)
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Chốt chặn Bảo mật Mục IV:</span>
                  </div>
                  <p className="leading-relaxed">
                    Hệ thống đã tự động khóa không đề xuất các quyền nhạy cảm:{' '}
                    <span className="font-mono font-bold">
                      {permissionProposal.blockedAutoSensitivePermissions.join(', ')}
                    </span>{' '}
                    (Phê duyệt đề & Truy cập đề mật).
                  </p>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {permissionProposal.proposedPermissionCodes.map((code) => {
                    const checked = selectedProposedPerms.includes(code);
                    return (
                      <label
                        key={code}
                        className="p-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedProposedPerms((prev) =>
                              checked ? prev.filter((c) => c !== code) : [...prev, code]
                            );
                          }}
                        />
                        <span className="font-medium text-slate-900">
                          {PERMISSION_CODE_VIETNAMESE[code] || code}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <label className="flex items-start gap-2 pt-2 border-t border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminConfirmedProposalCheckbox}
                    onChange={(e) => setAdminConfirmedProposalCheckbox(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-slate-800 font-medium leading-relaxed">
                    Tôi (Quản trị viên) xác nhận cấp các quyền tạo câu hỏi/tạo đề trên theo phạm vi môn học của phân công giảng dạy năm {permissionProposal.academicYear}.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleConfirmAndSaveProposedPermissions}
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Xác nhận và Lưu riêng Phân quyền
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL TẠO / SỬA TỔ CHUYÊN MÔN
         ===================================================================== */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDepartment}
            className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 text-xs shadow-lg"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingDeptId ? 'Cập nhật Tổ chuyên môn' : 'Tạo Tổ chuyên môn mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã tổ (Bắt buộc)
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.departmentCode}
                  onChange={(e) =>
                    setDeptForm((prev) => ({
                      ...prev,
                      departmentCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="VD: TO-KHTN"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trạng thái tổ
                </label>
                <select
                  value={deptForm.status}
                  onChange={(e) =>
                    setDeptForm((prev) => ({
                      ...prev,
                      status: e.target.value as 'ACTIVE' | 'INACTIVE',
                    }))
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Ngừng sử dụng (INACTIVE)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên tổ chuyên môn (Bắt buộc)
              </label>
              <input
                type="text"
                required
                value={deptForm.departmentName}
                onChange={(e) =>
                  setDeptForm((prev) => ({ ...prev, departmentName: e.target.value }))
                }
                placeholder="VD: Tổ khoa học tự nhiên"
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cấp học phụ trách
              </label>
              <div className="flex gap-3">
                {allowedEducationLevels.map((lv) => {
                  const checked = deptForm.educationLevels.includes(lv);
                  return (
                    <label key={lv} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setDeptForm((prev) => ({
                            ...prev,
                            educationLevels: checked
                              ? prev.educationLevels.filter((x) => x !== lv)
                              : [...prev.educationLevels, lv],
                          }))
                        }
                      />
                      <span>{lv === 'PRIMARY' ? 'Tiểu học (Khối 1–5)' : 'THCS (Khối 6–9)'}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổ trưởng chuyên môn
                </label>
                <select
                  value={deptForm.headUserId}
                  onChange={(e) =>
                    setDeptForm((prev) => ({ ...prev, headUserId: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                >
                  <option value="">-- Chưa chọn Tổ trưởng --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.fullName} ({acc.username})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổ phó chuyên môn (Nếu có)
                </label>
                <select
                  value={deptForm.deputyUserId}
                  onChange={(e) =>
                    setDeptForm((prev) => ({ ...prev, deputyUserId: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                >
                  <option value="">-- Không có / Chưa chọn --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.fullName} ({acc.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
              >
                Lưu Tổ chuyên môn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL CHUYỂN GIÁO VIÊN GIỮA CÁC TỔ (MỤC I)
         ===================================================================== */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteTransferTeachers}
            className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 space-y-4 text-xs shadow-lg"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Thêm / Chuyển giáo viên giữa các Tổ chuyên môn
              </h3>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                1. Chọn Tổ chuyên môn đích (Đang hoạt động)
              </label>
              <select
                value={transferTargetDeptId}
                onChange={(e) => setTransferTargetDeptId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-semibold"
              >
                <option value="">-- Chọn tổ chuyên môn đích --</option>
                {departments
                  .filter((d) => d.status === 'ACTIVE')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.departmentName} ({d.departmentCode})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                2. Tích chọn giáo viên cần chuyển tổ ({transferUserIds.length} đã chọn)
              </label>
              <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                {accounts.map((acc) => {
                  const checked = transferUserIds.includes(acc.id);
                  return (
                    <label
                      key={acc.id}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setTransferUserIds((prev) =>
                              checked
                                ? prev.filter((x) => x !== acc.id)
                                : [...prev, acc.id]
                            )
                          }
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {acc.fullName}
                          </div>
                          <div className="text-slate-500">{acc.email}</div>
                        </div>
                      </div>
                      <span className="text-slate-600 font-medium">
                        Tổ hiện tại: {acc.departmentName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
              >
                Xác nhận Chuyển tổ chuyên môn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL SAO CHÉP PHÂN CÔNG SANG NĂM HỌC MỚI (MỤC V)
         ===================================================================== */}
      {showCopyYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCopyAcademicYear}
            className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 text-xs shadow-lg"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Sao chép Phân công sang Năm học mới (Mục V)
              </h3>
              <button
                type="button"
                onClick={() => setShowCopyYearModal(false)}
                className="text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Sao chép bảng phân công năm trước thành <strong>Bản nháp (DRAFT)</strong> để điều chỉnh cho năm học mới. Hệ thống đảm bảo:
              <br />• Không tự ghi đè dữ liệu năm cũ.
              <br />• Không làm thay đổi quyền truy cập hồ sơ lưu trữ.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Năm học nguồn
                </label>
                <input
                  type="text"
                  value={copySourceYear}
                  onChange={(e) => setCopySourceYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Năm học mới (Đích)
                </label>
                <input
                  type="text"
                  value={copyTargetYear}
                  onChange={(e) => setCopyTargetYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCopyYearModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
              >
                Sao chép thành Bản nháp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL NHẬP EXCEL BẢNG PHÂN CÔNG GIẢNG DẠY (MỤC VI)
         ===================================================================== */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full p-6 space-y-4 text-xs shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Nhập Bảng Phân công Giảng dạy từ Excel — Xem trước & Xác nhận (Mục VI)
                </h3>
                <p className="text-slate-500">
                  Kiểm tra hợp lệ từng dòng trước khi lưu. Tuyệt đối không tự động tạo tài khoản trùng hoặc tài khoản ảo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {excelPreviewResult && (
              <>
                <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    Tổng số dòng: <strong>{excelPreviewResult.totalRows}</strong>
                  </div>
                  <div className="text-emerald-700">
                    Hợp lệ: <strong>{excelPreviewResult.validRowsCount}</strong>
                  </div>
                  <div className="text-rose-700">
                    Bị chặn / Lỗi: <strong>{excelPreviewResult.failedCount}</strong>
                  </div>
                  <div className="text-blue-700">
                    Đã chọn xác nhận nhập: <strong>{confirmedExcelRowNums.length}</strong>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                        <th className="py-2 px-3 font-semibold">Xác nhận</th>
                        <th className="py-2 px-3 font-semibold">Dòng</th>
                        <th className="py-2 px-3 font-semibold">Giáo viên & Email</th>
                        <th className="py-2 px-3 font-semibold">Môn & Khối</th>
                        <th className="py-2 px-3 font-semibold">Lớp</th>
                        <th className="py-2 px-3 font-semibold">Kết quả kiểm tra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(excelPreviewResult.rowResults || []).map((r: any) => {
                        const checked = confirmedExcelRowNums.includes(r.rowNumber);
                        return (
                          <tr key={r.rowNumber} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-center">
                              {r.valid ? (
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setConfirmedExcelRowNums((prev) =>
                                      checked
                                        ? prev.filter((n) => n !== r.rowNumber)
                                        : [...prev, r.rowNumber]
                                    )
                                  }
                                />
                              ) : (
                                <span className="text-rose-600 font-bold">✕</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold">#{r.rowNumber}</td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-900">
                                {r.teacherFullName}
                              </div>
                              <div className="text-slate-500">{r.teacherEmail}</div>
                            </td>
                            <td className="py-2 px-3 font-medium">{r.subjectSummary}</td>
                            <td className="py-2 px-3 font-mono">{r.classesSummary}</td>
                            <td className="py-2 px-3">
                              <span
                                className={
                                  r.valid
                                    ? 'text-emerald-700 font-medium'
                                    : 'text-rose-700 font-medium'
                                }
                              >
                                {r.message}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={importingExcel || confirmedExcelRowNums.length === 0}
                onClick={handleConfirmExcelImport}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-60"
              >
                Xác nhận Nhập {confirmedExcelRowNums.length} dòng hợp lệ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
