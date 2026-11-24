import React, { useEffect, useMemo, useState } from 'react';
import {
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  Edit3,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  UserX,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  X,
  Play,
  RefreshCw,
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase/firebaseClient';
import {
  SchoolCurriculumSubjectCatalogItem,
  TeacherAccountDeleteImpactPreview,
  TeacherAccountLifecycleStatus,
  TeacherAccountManagementQaReport,
  TeacherAccountRecord,
  TeacherPasswordSetupMethod,
  TeacherSubjectGradeAllocation,
  TeachingAssignmentRecord,
  WorkflowActorRole,
} from '../types/domain';
import { PostExcelImportAuditPanel } from './PostExcelImportAuditPanel';

interface TeacherAccountManagementWorkspaceProps {
  currentAdminUserId?: string;
  currentAdminName?: string;
  schoolId?: string;
  onOpenVisualPermissionForTeacher?: (userId: string, fullName: string) => void;
  onOpenDepartmentsAndAssignments?: (userId?: string) => void;
  onAccountsChanged?: () => void;
}

const ROLE_OPTIONS: Array<{ code: WorkflowActorRole; label: string; badgeClass: string }> = [
  {
    code: 'TEACHER',
    label: 'Giáo viên',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    code: 'HEAD_OF_DEPARTMENT',
    label: 'Tổ trưởng chuyên môn',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    code: 'REVIEWER',
    label: 'Giáo viên phản biện',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    code: 'VICE_PRINCIPAL',
    label: 'Phó hiệu trưởng',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  {
    code: 'PRINCIPAL',
    label: 'Hiệu trưởng',
    badgeClass: 'bg-purple-50 text-purple-900 border-purple-200',
  },
  {
    code: 'SYSTEM_ADMIN',
    label: 'Quản trị hệ thống',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-200',
  },
];

const STATUS_META: Record<
  TeacherAccountLifecycleStatus,
  { label: string; badgeClass: string; description: string }
> = {
  ACTIVE: {
    label: 'Đang hoạt động',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    description: 'Được đăng nhập và sử dụng các quyền được cấp.',
  },
  LOCKED: {
    label: 'Tạm khóa',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    description: 'Tạm ngưng đăng nhập và chặn mọi thao tác bảo vệ kể cả trên phiên đang mở.',
  },
  UNACTIVATED: {
    label: 'Chưa kích hoạt',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Tài khoản mới khởi tạo chờ thiết lập mật khẩu / kích hoạt.',
  },
  DISABLED: {
    label: 'Đã vô hiệu hóa',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-300',
    description: 'Ngừng hoạt động vĩnh viễn hoặc chuyển công tác, bảo toàn lịch sử hồ sơ cũ.',
  },
};

export const TeacherAccountManagementWorkspace: React.FC<
  TeacherAccountManagementWorkspaceProps
> = ({
  schoolId,
  currentAdminUserId = 'user-admin-sys',
  currentAdminName = 'Quản trị hệ thống (admin.nda)',
  onOpenVisualPermissionForTeacher,
  onOpenDepartmentsAndAssignments,
  onAccountsChanged,
}) => {
  const [accounts, setAccounts] = useState<TeacherAccountRecord[]>([]);
  const [curriculumSubjects, setCurriculumSubjects] = useState<
    SchoolCurriculumSubjectCatalogItem[]
  >([]);
  const [departmentsCatalog, setDepartmentsCatalog] = useState<string[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<
    TeachingAssignmentRecord[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Bộ lọc, tìm kiếm, sắp xếp, phân trang (Mục II)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'PRIMARY' | 'LOWER_SECONDARY'>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'stt' | 'fullName' | 'email' | 'lastLoginAt'>('stt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Thông báo kết quả thao tác & gợi ý phân quyền ngay sau khi tạo tài khoản (Mục VIII)
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    newlyCreatedAccount?: TeacherAccountRecord;
    resetInviteLink?: string | null;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Trạng thái Hộp thoại Thêm / Chỉnh sửa tài khoản (Mục III, IV, V)
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [editingImmutableId, setEditingImmutableId] = useState<string>('');
  const [formFullName, setFormFullName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPasswordMethod, setFormPasswordMethod] =
    useState<TeacherPasswordSetupMethod>('SEND_RESET_LINK');
  const [formInitialPassword, setFormInitialPassword] = useState<string>('');
  const [formConfirmPassword, setFormConfirmPassword] = useState<string>('');
  const [formMustChangePassword, setFormMustChangePassword] = useState<boolean>(true);
  const [formDepartment, setFormDepartment] = useState<string>(
    'Tổ khoa học tự nhiên'
  );
  const [formEducationLevels, setFormEducationLevels] = useState<
    ('PRIMARY' | 'LOWER_SECONDARY')[]
  >(['LOWER_SECONDARY']);
  const [formSubjectAllocations, setFormSubjectAllocations] = useState<
    TeacherSubjectGradeAllocation[]
  >([]);
  const [formRoles, setFormRoles] = useState<WorkflowActorRole[]>(['TEACHER']);
  const [formStatus, setFormStatus] = useState<TeacherAccountLifecycleStatus>('ACTIVE');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formSaving, setFormSaving] = useState<boolean>(false);
  const [openPermissionRightAfterCreate, setOpenPermissionRightAfterCreate] =
    useState<boolean>(false);

  // Hộp thoại Đặt lại mật khẩu an toàn (Mục VI)
  const [resetModalAccount, setResetModalAccount] =
    useState<TeacherAccountRecord | null>(null);
  const [resetMethod, setResetMethod] =
    useState<TeacherPasswordSetupMethod>('SEND_RESET_LINK');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>('');
  const [resetMustChangeNextLogin, setResetMustChangeNextLogin] = useState<boolean>(true);
  const [resetSubmitting, setResetSubmitting] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>('');

  // Hộp thoại Nhập từ Excel (Mục I)
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importCsvText, setImportCsvText] = useState<string>('');
  const [importingExcel, setImportingExcel] = useState<boolean>(false);

  // Hộp thoại Xóa tài khoản giáo viên an toàn
  const [deleteModalAccount, setDeleteModalAccount] =
    useState<TeacherAccountRecord | null>(null);
  const [deletePreview, setDeletePreview] =
    useState<TeacherAccountDeleteImpactPreview | null>(null);
  const [deleteLoadingPreview, setDeleteLoadingPreview] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>(
    'Chuyển công tác / Kết thúc hợp đồng giảng dạy tại trường'
  );
  const [deleteConfirmed, setDeleteConfirmed] = useState<boolean>(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  // Báo cáo kiểm thử 13 kịch bản (Mục X)
  const [qaRunning, setQaRunning] = useState<boolean>(false);
  const [qaReport, setQaReport] = useState<TeacherAccountManagementQaReport | null>(
    null
  );

  // Chế độ hiển thị: Danh sách Tài khoản hoặc Kiểm tra & Hoàn thiện sau nhập Excel
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    'ACCOUNTS_LIST' | 'POST_IMPORT_AUDIT'
  >('ACCOUNTS_LIST');
  const [postImportInitialScope, setPostImportInitialScope] = useState<
    'official' | 'sandbox20'
  >('official');

  const loadAccountsData = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        adminUserId: currentAdminUserId,
      });
      if (schoolId) {
        qs.set('schoolId', schoolId);
      }
      const res = await fetch(`/api/admin/teacher-accounts?${qs.toString()}`);
      const json = await res.json();
      if (json.ok) {
        const list: TeacherAccountRecord[] = json.accounts || [];
        setAccounts(list);
        setCurriculumSubjects(json.curriculumSubjects || []);
        setTeachingAssignments(json.teachingAssignments || []);
        setDepartmentsCatalog(
          Array.isArray(json.departmentsCatalog) && json.departmentsCatalog.length > 0
            ? json.departmentsCatalog
            : schoolId === 'SCHOOL_B' || schoolId === 'sch-tieu-hoc-a'
            ? ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4', 'Tổ 5']
            : [
                'Tổ 1-2-3',
                'Tổ 4-5',
                'Tổ khoa học tự nhiên',
                'Tổ khoa học xã hội',
                'Tổ Tiếng Anh - GDTC',
                'Ban Giám hiệu và quản trị',
              ]
        );
        if (list.length === 0) {
          setSelectedUserId('');
        } else if (!selectedUserId || !list.some((item) => item.id === selectedUserId)) {
          setSelectedUserId(list[0].id);
        }
      }
    } catch {
      // ignore network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccountsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAdminUserId, schoolId]);

  // Đồng bộ hồ sơ công khai & thông tin PII sang Firestore theo chế độ nền không chặn giao diện (tránh treo 10s khi Firestore offline)
  const syncAccountToFirestoreSafely = (account: TeacherAccountRecord): Promise<void> => {
    void Promise.all([
      setDoc(
        doc(db, 'users', account.id),
        {
          id: account.id,
          schoolId: account.schoolId || 'SCHOOL_A',
          username: account.username,
          fullName: account.fullName,
          roles: account.roles,
          status: account.status,
          departmentName: account.departmentName,
          assignedSubjects: account.assignedSubjectsDisplay.slice(0, 20),
          createdBy: account.createdBy || currentAdminName,
          createdAt: account.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ),
      setDoc(
        doc(db, 'users', account.id, 'private', 'info'),
        {
          userId: account.id,
          schoolId: account.schoolId || 'SCHOOL_A',
          email: account.email,
          lastLoginAt: account.lastLoginAt || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ),
    ]).catch(() => {
      // Nếu người dùng chưa đăng nhập Firebase Auth client hoặc Firestore offline, dữ liệu vẫn được bảo toàn tức thời tại Backend DB
    });
    return Promise.resolve();
  };

  // Danh sách môn học tách biệt theo cấp học từ CSDL chương trình (Mục IV)
  const primaryCurriculumSubjects = useMemo(
    () => curriculumSubjects.filter((s) => s.educationLevelId === 'PRIMARY'),
    [curriculumSubjects]
  );

  const lowerSecondaryCurriculumSubjects = useMemo(
    () => curriculumSubjects.filter((s) => s.educationLevelId === 'LOWER_SECONDARY'),
    [curriculumSubjects]
  );

  const allDistinctSubjectNames = useMemo(() => {
    return Array.from(new Set(curriculumSubjects.map((s) => s.subjectName))).sort();
  }, [curriculumSubjects]);

  // Lọc và sắp xếp danh sách tài khoản (Mục II)
  const filteredAndSortedAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = accounts.filter((acc) => {
      if (q) {
        const matchText =
          acc.fullName.toLowerCase().includes(q) ||
          acc.email.toLowerCase().includes(q) ||
          acc.username.toLowerCase().includes(q) ||
          acc.id.toLowerCase().includes(q) ||
          acc.departmentName.toLowerCase().includes(q);
        if (!matchText) return false;
      }
      if (filterDepartment !== 'ALL' && acc.departmentName !== filterDepartment) {
        return false;
      }
      if (
        filterLevel !== 'ALL' &&
        !acc.educationLevels.includes(filterLevel)
      ) {
        return false;
      }
      if (
        filterSubject !== 'ALL' &&
        !acc.subjectAllocations.some(
          (s) => s.subjectName.toLowerCase() === filterSubject.toLowerCase()
        )
      ) {
        return false;
      }
      if (
        filterRole !== 'ALL' &&
        !acc.roles.includes(filterRole as WorkflowActorRole)
      ) {
        return false;
      }
      if (filterStatus !== 'ALL' && acc.status !== filterStatus) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'stt') {
        cmp = a.stt - b.stt;
      } else if (sortBy === 'fullName') {
        cmp = a.fullName.localeCompare(b.fullName, 'vi');
      } else if (sortBy === 'email') {
        cmp = a.email.localeCompare(b.email, 'vi');
      } else if (sortBy === 'lastLoginAt') {
        const tA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const tB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        cmp = tA - tB;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [
    accounts,
    searchQuery,
    filterDepartment,
    filterLevel,
    filterSubject,
    filterRole,
    filterStatus,
    sortBy,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedAccounts.length / pageSize));
  const paginatedAccounts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredAndSortedAccounts.slice(start, start + pageSize);
  }, [filteredAndSortedAccounts, currentPage, totalPages]);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedUserId) || null,
    [accounts, selectedUserId]
  );

  // Mở biểu mẫu Thêm tài khoản mới (Mục III)
  const handleOpenCreateModal = () => {
    setFormMode('CREATE');
    setEditingImmutableId('');
    setFormFullName('');
    setFormEmail('');
    setFormPasswordMethod('SEND_RESET_LINK');
    setFormInitialPassword('');
    setFormConfirmPassword('');
    setFormMustChangePassword(true);
    setFormDepartment(
      departmentsCatalog[2] || 'Tổ khoa học tự nhiên'
    );
    setFormEducationLevels(['LOWER_SECONDARY']);
    setFormSubjectAllocations([]);
    setFormRoles(['TEACHER']);
    setFormStatus('ACTIVE');
    setFormNotes('');
    setFormError('');
    setOpenPermissionRightAfterCreate(false);
    setFormModalOpen(true);
  };

  // Mở biểu mẫu Chỉnh sửa tài khoản (Mục V)
  const handleOpenEditModal = (acc: TeacherAccountRecord) => {
    setSelectedUserId(acc.id);
    setFormMode('EDIT');
    setEditingImmutableId(acc.id);
    setFormFullName(acc.fullName);
    setFormEmail(acc.email);
    setFormDepartment(acc.departmentName);
    setFormEducationLevels(
      acc.educationLevels.length > 0 ? [...acc.educationLevels] : ['LOWER_SECONDARY']
    );
    setFormSubjectAllocations(
      JSON.parse(JSON.stringify(acc.subjectAllocations || []))
    );
    setFormRoles(acc.roles.length > 0 ? [...acc.roles] : ['TEACHER']);
    setFormStatus(acc.status);
    setFormNotes(acc.notes || '');
    setFormError('');
    setFormModalOpen(true);
  };

  // Bật / tắt cấp học trong biểu mẫu (Mục IV: Khi bỏ cấp học thì tự động gỡ các môn thuộc cấp đó)
  const toggleFormEducationLevel = (level: 'PRIMARY' | 'LOWER_SECONDARY') => {
    setFormEducationLevels((prev) => {
      const exists = prev.includes(level);
      if (exists) {
        const next = prev.filter((item) => item !== level);
        setFormSubjectAllocations((allocs) =>
          allocs.filter((a) => a.educationLevelId !== level)
        );
        return next;
      }
      return [...prev, level];
    });
  };

  // Bật / tắt môn học thuộc một cấp học cụ thể (Mục IV)
  const toggleSubjectInForm = (subjectItem: SchoolCurriculumSubjectCatalogItem) => {
    setFormSubjectAllocations((prev) => {
      const exists = prev.some(
        (a) =>
          a.educationLevelId === subjectItem.educationLevelId &&
          a.subjectId === subjectItem.subjectId
      );
      if (exists) {
        return prev.filter(
          (a) =>
            !(
              a.educationLevelId === subjectItem.educationLevelId &&
              a.subjectId === subjectItem.subjectId
            )
        );
      }
      const defaultGrade = subjectItem.allowedGrades[0] || (subjectItem.educationLevelId === 'PRIMARY' ? 4 : 6);
      return [
        ...prev,
        {
          subjectId: subjectItem.subjectId,
          subjectName: subjectItem.subjectName,
          educationLevelId: subjectItem.educationLevelId,
          grades: [defaultGrade],
          assessmentMode: 'PAPER_EXAM',
        },
      ];
    });
  };

  // Bật / tắt khối lớp của một môn học cụ thể (Mục IV)
  const toggleGradeForSubjectInForm = (
    educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY',
    subjectId: string,
    gradeNum: number
  ) => {
    setFormSubjectAllocations((prev) =>
      prev.map((alloc) => {
        if (
          alloc.educationLevelId !== educationLevelId ||
          alloc.subjectId !== subjectId
        ) {
          return alloc;
        }
        const hasGrade = alloc.grades.includes(gradeNum);
        const nextGrades = hasGrade
          ? alloc.grades.filter((g) => g !== gradeNum)
          : [...alloc.grades, gradeNum].sort((a, b) => a - b);
        return {
          ...alloc,
          grades: nextGrades,
        };
      })
    );
  };

  const toggleRoleInForm = (roleCode: WorkflowActorRole) => {
    setFormRoles((prev) => {
      if (prev.includes(roleCode)) {
        if (prev.length === 1) return prev; // Giữ ít nhất 1 vai trò
        return prev.filter((r) => r !== roleCode);
      }
      return [...prev, roleCode];
    });
  };

  // Lưu biểu mẫu Thêm mới hoặc Chỉnh sửa tài khoản (Mục III, IV, V, VIII, IX)
  const handleSubmitAccountForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formFullName.trim()) {
      setFormError('Vui lòng nhập Họ và tên giáo viên (bắt buộc).');
      return;
    }
    if (!formEmail.trim()) {
      setFormError('Vui lòng nhập Email đăng nhập (bắt buộc).');
      return;
    }
    if (formEducationLevels.length === 0) {
      setFormError('Vui lòng tích chọn ít nhất một Cấp học (Tiểu học hoặc THCS).');
      return;
    }

    setFormSaving(true);
    try {
      if (formMode === 'CREATE') {
        const res = await fetch('/api/admin/teacher-accounts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminUserId: currentAdminUserId,
            fullName: formFullName.trim(),
            email: formEmail.trim(),
            passwordSetupMethod: formPasswordMethod,
            initialPassword: formInitialPassword,
            confirmPassword: formConfirmPassword,
            mustChangePasswordOnNextLogin: formMustChangePassword,
            departmentName: formDepartment,
            educationLevels: formEducationLevels,
            subjectAllocations: formSubjectAllocations,
            roles: formRoles,
            status: formStatus,
            notes: formNotes,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setFormError(json.message || 'Không thể tạo tài khoản. Vui lòng kiểm tra lại.');
          setFormSaving(false);
          return;
        }

        const createdAcc: TeacherAccountRecord = json.account;
        await syncAccountToFirestoreSafely(createdAcc);
        await loadAccountsData();
        setSelectedUserId(createdAcc.id);
        setFormModalOpen(false);
        onAccountsChanged?.();

        if (openPermissionRightAfterCreate && onOpenVisualPermissionForTeacher) {
          onOpenVisualPermissionForTeacher(createdAcc.id, createdAcc.fullName);
          return;
        }

        setBannerNotice({
          type: 'success',
          title: `Đã tạo tài khoản giáo viên "${createdAcc.fullName}" thành công`,
          message:
            'Theo quy tắc bảo mật Mục VIII, hệ thống chỉ khởi tạo quyền xem cơ bản (không tự động cấp toàn bộ 20 quyền). Quản trị viên có thể bấm "Mở Phân quyền trực quan" bên dưới để cấp quyền chức năng chi tiết.',
          newlyCreatedAccount: createdAcc,
          resetInviteLink: json.resetInviteLink || null,
        });
      } else {
        const res = await fetch(
          `/api/admin/teacher-accounts/${encodeURIComponent(editingImmutableId)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              adminUserId: currentAdminUserId,
              fullName: formFullName.trim(),
              email: formEmail.trim(),
              departmentName: formDepartment,
              educationLevels: formEducationLevels,
              subjectAllocations: formSubjectAllocations,
              roles: formRoles,
              status: formStatus,
              notes: formNotes,
            }),
          }
        );
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setFormError(json.message || 'Không thể cập nhật tài khoản.');
          setFormSaving(false);
          return;
        }

        const updatedAcc: TeacherAccountRecord = json.account;
        await syncAccountToFirestoreSafely(updatedAcc);
        await loadAccountsData();
        setFormModalOpen(false);
        onAccountsChanged?.();

        setBannerNotice({
          type: 'success',
          title: `Đã cập nhật tài khoản "${updatedAcc.fullName}"`,
          message: json.message,
          newlyCreatedAccount: updatedAcc,
        });
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ khi lưu tài khoản.');
    } finally {
      setFormSaving(false);
    }
  };

  // Khóa / Mở khóa / Vô hiệu hóa tài khoản (Mục VII)
  const handleChangeAccountStatus = async (
    acc: TeacherAccountRecord,
    nextStatus: TeacherAccountLifecycleStatus
  ) => {
    setSelectedUserId(acc.id);
    try {
      const res = await fetch(
        `/api/admin/teacher-accounts/${encodeURIComponent(acc.id)}/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminUserId: currentAdminUserId,
            status: nextStatus,
            reason: `Quản trị viên cập nhật trạng thái sang ${STATUS_META[nextStatus].label}`,
          }),
        }
      );
      const json = await res.json();
      if (res.ok && json.ok) {
        await syncAccountToFirestoreSafely(json.account);
        await loadAccountsData();
        onAccountsChanged?.();
        setBannerNotice({
          type: nextStatus === 'ACTIVE' ? 'success' : 'warning',
          title: `Đã chuyển trạng thái tài khoản "${acc.fullName}" sang [${STATUS_META[nextStatus].label}]`,
          message:
            nextStatus === 'ACTIVE'
              ? 'Tài khoản đã được mở khóa và có thể đăng nhập, thực hiện các quyền trong phạm vi được cấp.'
              : 'Mọi phiên đăng nhập đang mở của tài khoản này đã bị thu hồi tức thời và bị chặn thực hiện thao tác bảo vệ tại Backend (Mục VII).',
        });
      }
    } catch {
      // ignore
    }
  };

  // Đặt lại mật khẩu an toàn (Mục VI)
  const handleOpenResetPasswordModal = (acc: TeacherAccountRecord) => {
    setSelectedUserId(acc.id);
    setResetModalAccount(acc);
    setResetMethod('SEND_RESET_LINK');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetMustChangeNextLogin(true);
    setResetError('');
  };

  const handleSubmitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAccount) return;
    setResetError('');
    setResetSubmitting(true);

    try {
      const res = await fetch(
        `/api/admin/teacher-accounts/${encodeURIComponent(
          resetModalAccount.id
        )}/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminUserId: currentAdminUserId,
            method: resetMethod,
            newPassword: resetNewPassword,
            confirmPassword: resetConfirmPassword,
            mustChangePasswordOnNextLogin: resetMustChangeNextLogin,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setResetError(json.message || 'Không thể đặt lại mật khẩu.');
        setResetSubmitting(false);
        return;
      }

      await loadAccountsData();
      setResetModalAccount(null);
      setBannerNotice({
        type: 'success',
        title: `Đã xử lý đặt lại mật khẩu an toàn cho "${resetModalAccount.fullName}"`,
        message: json.message,
        resetInviteLink: json.resetInviteLink || null,
      });
    } catch {
      setResetError('Lỗi kết nối máy chủ khi đặt lại mật khẩu.');
    } finally {
      setResetSubmitting(false);
    }
  };

  // Mở hộp thoại Xóa tài khoản giáo viên kèm kiểm tra tác động trước khi xóa
  const handleOpenDeleteAccountModal = async (acc: TeacherAccountRecord) => {
    setSelectedUserId(acc.id);
    setDeleteModalAccount(acc);
    setDeletePreview(null);
    setDeleteError('');
    setDeleteConfirmed(false);
    setDeleteReason('Chuyển công tác / Kết thúc hợp đồng giảng dạy tại trường');
    setDeleteLoadingPreview(true);

    try {
      const res = await fetch(
        `/api/admin/teacher-accounts/${encodeURIComponent(
          acc.id
        )}/delete-check?adminUserId=${encodeURIComponent(currentAdminUserId)}`
      );
      const json = await res.json();
      if (res.ok && json.ok && json.preview) {
        setDeletePreview(json.preview);
      } else {
        setDeleteError(json.message || 'Không thể kiểm tra trạng thái tài khoản trước khi xóa.');
      }
    } catch {
      setDeleteError('Lỗi kết nối máy chủ khi kiểm tra dữ liệu liên quan của tài khoản.');
    } finally {
      setDeleteLoadingPreview(false);
    }
  };

  const handleExecuteDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalAccount) return;
    if (!deleteConfirmed) {
      setDeleteError('Vui lòng tích chọn ô xác nhận trước khi thực hiện xóa tài khoản.');
      return;
    }

    setDeleteError('');
    setDeleteSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/teacher-accounts/${encodeURIComponent(deleteModalAccount.id)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminUserId: currentAdminUserId,
            confirmed: true,
            reason: deleteReason,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setDeleteError(json.message || 'Không thể xóa tài khoản giáo viên.');
        setDeleteSubmitting(false);
        return;
      }

      // Đồng bộ xóa trên Firestore ở chế độ nền không chặn giao diện
      const targetDeleteId = deleteModalAccount.id;
      void Promise.all([
        deleteDoc(doc(db, 'users', targetDeleteId, 'private', 'info')),
        deleteDoc(doc(db, 'users', targetDeleteId)),
      ]).catch(() => {
        // Nếu chưa đăng nhập Firebase Auth client hoặc Firestore offline thì Backend DB đã xóa hoàn tất
      });

      const deletedName = deleteModalAccount.fullName;
      const deletedEmail = deleteModalAccount.email;
      const deletedId = deleteModalAccount.id;
      setDeleteModalAccount(null);
      setDeletePreview(null);
      await loadAccountsData();
      onAccountsChanged?.();

      setBannerNotice({
        type: 'warning',
        title: `Đã xóa tài khoản giáo viên "${deletedName}" (${deletedEmail})`,
        message:
          json.message ||
          `Tài khoản [${deletedId}] đã được xóa khỏi hệ thống, thu hồi toàn bộ phiên đăng nhập & phân quyền môn học và ghi nhận vào AuditLogs.`,
      });
    } catch {
      setDeleteError('Lỗi kết nối máy chủ khi thực hiện xóa tài khoản.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Tải file Excel mẫu (CSV chuẩn UTF-8 BOM mở trực tiếp bằng Microsoft Excel)
  const handleDownloadSampleExcelTemplate = () => {
    const csvRows = [
      [
        'HoVaTen',
        'EmailDangNhap',
        'ToChuyenMon',
        'CapHoc(PRIMARY|LOWER_SECONDARY)',
        'MaMonHoc',
        'TenMonHoc',
        'KhoiLop(CachNhauDauChamPhay)',
        'VaiTro',
        'TrangThai',
        'GhiChu',
      ].join(','),
      [
        '"Trần Thị Mai Hương"',
        '"mai.huong.th@nguyendinhanh.edu.vn"',
        '"Tổ 4-5"',
        '"PRIMARY"',
        '"SUB_PRI_TOAN"',
        '"Toán"',
        '"4;5"',
        '"TEACHER"',
        '"ACTIVE"',
        '"Giáo viên Toán Tiểu học khối 4, 5"',
      ].join(','),
      [
        '"Đặng Quốc Khánh"',
        '"quoc.khanh.thcs@nguyendinhanh.edu.vn"',
        '"Tổ khoa học tự nhiên"',
        '"LOWER_SECONDARY"',
        '"SUB_SEC_KHTN"',
        '"Khoa học tự nhiên"',
        '"6;7"',
        '"TEACHER"',
        '"ACTIVE"',
        '"Giáo viên KHTN khối 6, 7"',
      ].join(','),
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_Nhap_Tai_Khoan_Giao_Vien_EDU_TEST_AI.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Xuất danh sách tài khoản ra file Excel/CSV (Mục I)
  const handleExportAccountsList = () => {
    const headers = [
      'STT',
      'MaDinhDanh(ID)',
      'HoVaTen',
      'EmailDangNhap',
      'ToChuyenMon',
      'CapHoc',
      'MonGiangDay',
      'KhoiLop',
      'VaiTro',
      'TrangThai',
      'LanDangNhapGanNhat',
    ];
    const rows = filteredAndSortedAccounts.map((acc, idx) =>
      [
        idx + 1,
        `"${acc.id}"`,
        `"${acc.fullName.replace(/"/g, '""')}"`,
        `"${acc.email}"`,
        `"${acc.departmentName}"`,
        `"${acc.educationLevels
          .map((lv) => (lv === 'PRIMARY' ? 'Tiểu học' : 'THCS'))
          .join('; ')}"`,
        `"${acc.assignedSubjectsDisplay.join('; ')}"`,
        `"${acc.assignedGradesDisplay.map((g) => `Khối ${g}`).join('; ')}"`,
        `"${acc.roles.join('; ')}"`,
        `"${STATUS_META[acc.status]?.label || acc.status}"`,
        `"${acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}"`,
      ].join(',')
    );

    const blob = new Blob(['\uFEFF' + [headers.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Tai_Khoan_Giao_Vien_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Xử lý Nhập từ Excel/CSV (Mục I)
  const handleOpenImportExcelModal = () => {
    const sampleBatch = [
      `Trần Thị Mai Hương,mai.huong.${Date.now().toString().slice(-3)}@nguyendinhanh.edu.vn,Tổ 4-5,PRIMARY,SUB_PRI_TOAN,Toán,4;5,TEACHER,ACTIVE`,
      `Đặng Quốc Khánh,quoc.khanh.${Date.now().toString().slice(-3)}@nguyendinhanh.edu.vn,Tổ khoa học tự nhiên,LOWER_SECONDARY,SUB_SEC_KHTN,Khoa học tự nhiên,6;7,TEACHER,ACTIVE`,
    ].join('\n');
    setImportCsvText(sampleBatch);
    setImportModalOpen(true);
  };

  const handleExecuteExcelImport = async () => {
    const lines = importCsvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setImportingExcel(true);
    try {
      const parsedRows = lines
        .filter((l) => !l.toLowerCase().startsWith('hovaten,'))
        .map((line) => {
          const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          const [
            fullName,
            email,
            departmentName,
            levelRaw = 'LOWER_SECONDARY',
            subjectId = 'SUB_SEC_TOAN',
            subjectName = 'Toán',
            gradesRaw = '6',
            roleRaw = 'TEACHER',
            statusRaw = 'ACTIVE',
          ] = cols;
          const levelId: 'PRIMARY' | 'LOWER_SECONDARY' =
            levelRaw === 'PRIMARY' ? 'PRIMARY' : 'LOWER_SECONDARY';
          const grades = gradesRaw
            .split(';')
            .map((g) => Number(g.trim()))
            .filter((n) => !Number.isNaN(n) && n > 0);
          return {
            fullName,
            email,
            departmentName,
            educationLevels: [levelId],
            subjectAllocations: [
              {
                subjectId,
                subjectName,
                educationLevelId: levelId,
                grades: grades.length > 0 ? grades : levelId === 'PRIMARY' ? [4] : [6],
              },
            ],
            roles: [roleRaw || 'TEACHER'],
            status: statusRaw || 'ACTIVE',
          };
        });

      const res = await fetch('/api/admin/teacher-accounts/import-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId: currentAdminUserId,
          rows: parsedRows,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        for (const acc of json.createdAccounts || []) {
          await syncAccountToFirestoreSafely(acc);
        }
        await loadAccountsData();
        setImportModalOpen(false);
        onAccountsChanged?.();
        setPostImportInitialScope('official');
        setActiveWorkspaceTab('POST_IMPORT_AUDIT');
        setBannerNotice({
          type: json.failedCount === 0 ? 'success' : 'warning',
          title: 'Hoàn tất nhập danh sách tài khoản từ Excel — Đã tự động chuyển sang Bảng Kiểm tra & Hoàn thiện',
          message: json.message,
        });
      }
    } catch {
      // ignore
    } finally {
      setImportingExcel(false);
    }
  };

  // Chạy bộ kiểm thử tự động 12 kịch bản (Mục X)
  const handleRun12ScenarioQaSuite = async () => {
    setQaRunning(true);
    try {
      const res = await fetch('/api/admin/teacher-accounts/run-qa-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.ok && json.report) {
        setQaReport(json.report);
      }
    } catch {
      // ignore
    } finally {
      setQaRunning(false);
    }
  };

  const toggleSortColumn = (col: 'stt' | 'fullName' | 'email' | 'lastLoginAt') => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & THANH CÔNG CỤ 9 NÚT CHỨC NĂNG (MỤC I) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-950 text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                QUẢN TRỊ HỆ THỐNG · QUẢN LÝ TÀI KHOẢN GIÁO VIÊN
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 tabular-nums">
                Tổng số: <strong>{accounts.length}</strong> tài khoản · Đang hoạt động:{' '}
                <strong className="text-emerald-700">
                  {accounts.filter((a) => a.status === 'ACTIVE').length}
                </strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách Tài khoản, Phân công Giảng dạy & Trạng thái Xác thực
            </h2>
            <p className="text-xs text-slate-600">
              Mỗi tài khoản định danh bằng ID ổn định duy nhất · Mật khẩu băm một chiều PBKDF2 tại Backend (không lưu plaintext vào Firestore) · Tách biệt danh mục môn học Tiểu học (Khối 1–5) và THCS (Khối 6–9).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('ACCOUNTS_LIST')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeWorkspaceTab === 'ACCOUNTS_LIST'
                    ? 'bg-blue-950 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Danh sách Tài khoản ({accounts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('POST_IMPORT_AUDIT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeWorkspaceTab === 'POST_IMPORT_AUDIT'
                    ? 'bg-indigo-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Kiểm tra & Hoàn thiện sau nhập Excel
              </button>
            </div>
          </div>
        </div>

        {/* MỤC I: 9 NÚT CHỨC NĂNG TRÊN THANH ĐIỀU KHIỂN */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Thêm tài khoản */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm tài khoản</span>
            </button>

            {/* 2. Nhập từ Excel */}
            <button
              type="button"
              onClick={handleOpenImportExcelModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nhập từ Excel</span>
            </button>

            {/* 3. Tải file Excel mẫu */}
            <button
              type="button"
              onClick={handleDownloadSampleExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
              <span>Tải file Excel mẫu</span>
            </button>

            {/* 4. Xuất danh sách */}
            <button
              type="button"
              onClick={handleExportAccountsList}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Xuất danh sách</span>
            </button>
          </div>

          {/* Các nút thao tác nhanh trên tài khoản đang chọn (5 -> 9) */}
          {selectedAccount && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 mr-1">
                Đang chọn:{' '}
                <strong className="text-slate-900">{selectedAccount.fullName}</strong>
              </span>

              {/* 5. Chỉnh sửa */}
              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedAccount)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 cursor-pointer whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-700" />
                <span>Chỉnh sửa</span>
              </button>

              {/* 6. Phân quyền */}
              <button
                type="button"
                onClick={() =>
                  onOpenVisualPermissionForTeacher?.(
                    selectedAccount.id,
                    selectedAccount.fullName
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-900 text-xs font-bold hover:bg-indigo-100 cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                <span>Phân quyền</span>
              </button>

              {/* 7. Đặt lại mật khẩu */}
              <button
                type="button"
                onClick={() => handleOpenResetPasswordModal(selectedAccount)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 text-xs font-semibold hover:bg-amber-100 cursor-pointer whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Đặt lại mật khẩu</span>
              </button>

              {/* 8. Khóa/mở khóa */}
              <button
                type="button"
                onClick={() =>
                  handleChangeAccountStatus(
                    selectedAccount,
                    selectedAccount.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 cursor-pointer whitespace-nowrap"
              >
                {selectedAccount.status === 'LOCKED' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mở khóa</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Khóa/mở khóa</span>
                  </>
                )}
              </button>

              {/* 9. Vô hiệu hóa tài khoản */}
              <button
                type="button"
                onClick={() =>
                  handleChangeAccountStatus(
                    selectedAccount,
                    selectedAccount.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED'
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 text-xs font-semibold hover:bg-rose-100 cursor-pointer whitespace-nowrap"
              >
                <UserX className="w-3.5 h-3.5 text-rose-700" />
                <span>
                  {selectedAccount.status === 'DISABLED'
                    ? 'Kích hoạt lại'
                    : 'Vô hiệu hóa'}
                </span>
              </button>

              {/* 10. Xóa tài khoản */}
              <button
                type="button"
                onClick={() => void handleOpenDeleteAccountModal(selectedAccount)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tài khoản</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BANNER THÔNG BÁO KẾT QUẢ & KẾT NỐI PHÂN QUYỀN TRỰC QUAN (MỤC VIII) */}
      {bannerNotice && (
        <div
          className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : bannerNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : bannerNotice.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
        >
          <div className="space-y-1.5 text-xs">
            <div className="font-bold flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{bannerNotice.title}</span>
            </div>
            <p className="leading-relaxed opacity-90">{bannerNotice.message}</p>
            {bannerNotice.resetInviteLink && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-semibold">
                  Liên kết thiết lập/đặt lại mật khẩu một lần:
                </span>
                <code className="px-2 py-1 rounded bg-white/90 border border-slate-300 font-mono text-[11px] text-slate-800">
                  {bannerNotice.resetInviteLink}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(bannerNotice.resetInviteLink || '');
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-300 text-[11px] font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép liên kết</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {bannerNotice.newlyCreatedAccount && onOpenVisualPermissionForTeacher && (
              <button
                type="button"
                onClick={() =>
                  onOpenVisualPermissionForTeacher(
                    bannerNotice.newlyCreatedAccount!.id,
                    bannerNotice.newlyCreatedAccount!.fullName
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mở Phân quyền trực quan ngay (Mục VIII)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODULE KIỂM TRA VÀ HOÀN THIỆN TÀI KHOẢN SAU KHI NHẬP EXCEL (MỤC I -> VII) */}
      {activeWorkspaceTab === 'POST_IMPORT_AUDIT' && (
        <PostExcelImportAuditPanel
          currentAdminUserId={currentAdminUserId}
          currentAdminName={currentAdminName}
          departmentsCatalog={departmentsCatalog}
          curriculumSubjects={curriculumSubjects}
          onOpenVisualPermissionForTeacher={onOpenVisualPermissionForTeacher}
          onMainAccountsRefreshRequested={loadAccountsData}
          initialScopeMode={postImportInitialScope}
        />
      )}

      {/* BÁO CÁO NGHIỆM THU TOÀN DIỆN MỤC I–VIII (48 KỊCH BẢN & FILE EXCEL 20 GIÁO VIÊN) */}
      {qaReport && (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xs overflow-hidden">
          <div className="bg-indigo-950 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold">
                  VIII. BÁO CÁO NGHIỆM THU MODULE QUẢN LÝ TÀI KHOẢN GIÁO VIÊN (48 KỊCH BẢN MỤC I–VII)
                </h3>
                <p className="text-[11px] text-indigo-200">
                  Mã phiên: {qaReport.runId} · Thực thi lúc:{' '}
                  {new Date(qaReport.executedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-md text-xs font-bold tabular-nums ${
                  qaReport.allPassed
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                Kết quả: {qaReport.passedCases}/{qaReport.totalCases} Kịch bản ĐẠT
              </span>
              <button
                type="button"
                onClick={() => setQaReport(null)}
                className="text-indigo-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="py-2.5 px-3 w-24">Mã kiểm thử</th>
                  <th className="py-2.5 px-3">Chức năng</th>
                  <th className="py-2.5 px-3">Dữ liệu đầu vào</th>
                  <th className="py-2.5 px-3">Kết quả mong đợi</th>
                  <th className="py-2.5 px-3">Kết quả thực tế</th>
                  <th className="py-2.5 px-3 w-28 text-center">Đạt/Không đạt</th>
                  <th className="py-2.5 px-3 w-28 text-center">Mức độ lỗi</th>
                  <th className="py-2.5 px-3">Phương án khắc phục</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {qaReport.rows.map((row: any) => (
                  <tr key={row.testCode} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-900 tabular-nums whitespace-nowrap">
                      {row.testCode}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div>{row.featureName || row.scenarioTitle}</div>
                      {row.section && (
                        <div className="text-[10px] font-semibold text-indigo-700 mt-0.5">
                          {row.section}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{row.inputSummary}</td>
                    <td className="py-2.5 px-3 text-slate-600">{row.expectedOutcome}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {row.actualOutcome}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold whitespace-nowrap ${
                          row.passed
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {row.statusLabel || (row.passed ? 'Đạt' : 'Không đạt')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-700 font-semibold whitespace-nowrap">
                      {row.severity || 'Không có lỗi'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.remediationPlan || row.securityNote}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BỘ LỌC TÌM KIẾM & BẢNG DANH SÁCH TÀI KHOẢN 11 CỘT (MỤC II) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Thanh tìm kiếm & 5 bộ lọc */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo Họ tên, Email đăng nhập, Mã ID, Tổ chuyên môn..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="ALL">Tất cả Tổ chuyên môn</option>
              {departmentsCatalog.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="ALL">Tất cả Cấp học</option>
              <option value="PRIMARY">Cấp Tiểu học (Khối 1–5)</option>
              <option value="LOWER_SECONDARY">Cấp THCS (Khối 6–9)</option>
            </select>
          </div>

          <div>
            <select
              value={filterSubject}
              onChange={(e) => {
                setFilterSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="ALL">Tất cả Môn giảng dạy</option>
              {allDistinctSubjectNames.map((subj) => (
                <option key={subj} value={subj}>
                  Môn: {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="ALL">Mọi vai trò</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Tạm khóa</option>
              <option value="UNACTIVATED">Chưa kích hoạt</option>
              <option value="DISABLED">Đã vô hiệu hóa</option>
            </select>
          </div>
        </div>

        {/* BẢNG 11 CỘT BẮT BUỘC (MỤC II) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-3 w-14">
                  <button
                    type="button"
                    onClick={() => toggleSortColumn('stt')}
                    className="inline-flex items-center gap-1 hover:text-blue-900 cursor-pointer"
                  >
                    <span>1. STT</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 min-w-[180px]">
                  <button
                    type="button"
                    onClick={() => toggleSortColumn('fullName')}
                    className="inline-flex items-center gap-1 hover:text-blue-900 cursor-pointer"
                  >
                    <span>2. Họ và tên</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => toggleSortColumn('email')}
                    className="inline-flex items-center gap-1 hover:text-blue-900 cursor-pointer"
                  >
                    <span>3. Tên đăng nhập (email)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 min-w-[150px]">4. Tổ chuyên môn</th>
                <th className="py-3 px-3 min-w-[110px]">5. Cấp học</th>
                <th className="py-3 px-3 min-w-[170px]">6. Môn giảng dạy</th>
                <th className="py-3 px-3 min-w-[110px]">7. Khối lớp</th>
                <th className="py-3 px-3 min-w-[140px]">8. Vai trò</th>
                <th className="py-3 px-3 min-w-[130px]">9. Trạng thái</th>
                <th className="py-3 px-3 min-w-[135px]">
                  <button
                    type="button"
                    onClick={() => toggleSortColumn('lastLoginAt')}
                    className="inline-flex items-center gap-1 hover:text-blue-900 cursor-pointer"
                  >
                    <span>10. Đăng nhập gần nhất</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 min-w-[240px] text-right">11. Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500">
                    Đang tải danh sách tài khoản giáo viên...
                  </td>
                </tr>
              ) : paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500">
                    Không tìm thấy tài khoản nào khớp với điều kiện lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((acc) => {
                  const isSelected = acc.id === selectedUserId;
                  const statusInfo = STATUS_META[acc.status] || STATUS_META.ACTIVE;
                  return (
                    <tr
                      key={acc.id}
                      onClick={() => setSelectedUserId(acc.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* 1. STT */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 tabular-nums">
                        {acc.stt}
                      </td>

                      {/* 2. Họ và tên + ID ổn định */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{acc.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          ID: {acc.id}
                        </div>
                      </td>

                      {/* 3. Tên đăng nhập (email) */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-medium text-slate-900">
                          {acc.email}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tài khoản: <span className="font-mono">{acc.username}</span>
                          {acc.mustChangePasswordOnNextLogin && (
                            <span className="ml-1.5 text-amber-700 font-semibold">
                              · Cần đổi MK
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Tổ chuyên môn */}
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {acc.departmentName}
                      </td>

                      {/* 5. Cấp học */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {acc.educationLevels.map((lv) => (
                            <span
                              key={lv}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                lv === 'PRIMARY'
                                  ? 'bg-teal-50 text-teal-900 border-teal-200'
                                  : 'bg-blue-50 text-blue-900 border-blue-200'
                              }`}
                            >
                              {lv === 'PRIMARY' ? 'Tiểu học' : 'THCS'}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 6. Môn giảng dạy */}
                      <td className="py-3 px-3">
                        {acc.assignedSubjectsDisplay.length === 0 ? (
                          <span className="text-slate-400 italic">Chưa phân công môn</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {acc.assignedSubjectsDisplay.map((subjText) => (
                              <span
                                key={subjText}
                                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-medium text-[11px]"
                              >
                                {subjText}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 7. Khối lớp */}
                      <td className="py-3 px-3">
                        {acc.assignedGradesDisplay.length === 0 ? (
                          <span className="text-slate-400 italic">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 tabular-nums">
                            {acc.assignedGradesDisplay.map((g) => (
                              <span
                                key={g}
                                className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-slate-800 text-[11px]"
                              >
                                K{g}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 8. Vai trò */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {acc.roles.map((r) => {
                            const meta = ROLE_OPTIONS.find((item) => item.code === r);
                            return (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                                  meta?.badgeClass ||
                                  'bg-slate-100 text-slate-800 border-slate-300'
                                }`}
                              >
                                {meta?.label || r}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* 9. Trạng thái */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                          {acc.grantedPermissionsCount}/20 quyền chức năng
                        </div>
                      </td>

                      {/* 10. Lần đăng nhập gần nhất */}
                      <td className="py-3 px-3 text-slate-600 tabular-nums">
                        {acc.lastLoginAt
                          ? new Date(acc.lastLoginAt).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Chưa đăng nhập'}
                      </td>

                      {/* 11. Thao tác */}
                      <td
                        className="py-3 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex flex-wrap items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(acc)}
                            className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
                            title="Chỉnh sửa thông tin tài khoản"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onOpenVisualPermissionForTeacher?.(acc.id, acc.fullName)
                            }
                            className="px-2 py-1 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 font-bold text-[11px] cursor-pointer"
                            title="Mở giao diện Phân quyền giáo viên"
                          >
                            Phân quyền
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenResetPasswordModal(acc)}
                            className="px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-[11px] cursor-pointer"
                            title="Đặt lại mật khẩu an toàn"
                          >
                            Mật khẩu
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeAccountStatus(
                                acc,
                                acc.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
                            title="Khóa hoặc mở khóa tài khoản"
                          >
                            {acc.status === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeAccountStatus(
                                acc,
                                acc.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED'
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold text-[11px] cursor-pointer"
                            title="Vô hiệu hóa tài khoản"
                          >
                            {acc.status === 'DISABLED' ? 'Kích hoạt' : 'Vô hiệu'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleOpenDeleteAccountModal(acc)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-700 text-white hover:bg-rose-800 font-bold text-[11px] cursor-pointer"
                            title="Xóa tài khoản giáo viên"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
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

        {/* Thanh phân trang (Mục II) */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="tabular-nums">
            Hiển thị <strong>{paginatedAccounts.length}</strong> /{' '}
            <strong>{filteredAndSortedAccounts.length}</strong> tài khoản phù hợp
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>
            <span className="px-3 py-1 font-bold text-slate-900 tabular-nums">
              Trang {Math.min(currentPage, totalPages)} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <span>Tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          HỘP THOẠI THÊM / CHỈNH SỬA TÀI KHOẢN GIÁO VIÊN (MỤC III, IV, V, VIII)
         ===================================================================== */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full my-8 overflow-hidden">
            <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {formMode === 'CREATE'
                    ? 'THÊM TÀI KHOẢN GIÁO VIÊN MỚI (MỤC III & IV)'
                    : 'CHỈNH SỬA THÔNG TIN TÀI KHOẢN GIÁO VIÊN (MỤC V)'}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  {formMode === 'CREATE'
                    ? 'Khởi tạo tài khoản định danh ổn định, phân công cấp học – môn học – khối lớp từ CSDL chương trình.'
                    : `Mã định danh gốc (ID bất biến): ${editingImmutableId} — Không cho phép sửa ID tài khoản.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitAccountForm}
              className="p-6 space-y-5 max-h-[82vh] overflow-y-auto text-xs"
            >
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div className="font-semibold">{formError}</div>
                </div>
              )}

              {/* Khi ở chế độ Sửa (Mục V): Hiển thị rõ trường ID bị khóa không cho sửa */}
              {formMode === 'EDIT' && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700">
                      Mã định danh tài khoản (ID cố định - Mục V & IX):
                    </span>{' '}
                    <code className="font-mono font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {editingImmutableId}
                    </code>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Khóa chính bất biến (Không cho phép chỉnh sửa)
                  </span>
                </div>
              )}

              {/* Khu vực 1: Họ tên, Email đăng nhập, Tổ chuyên môn, Trạng thái */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    1. Họ và tên giáo viên <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thị Minh Châu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    2. Email đăng nhập (Duy nhất trên toàn hệ thống){' '}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Ví dụ: minh.chau@nguyendinhanh.edu.vn"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    5. Tổ chuyên môn
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    {departmentsCatalog.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    10. Trạng thái tài khoản (Mục VII)
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as TeacherAccountLifecycleStatus)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                  >
                    <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                    <option value="LOCKED">Tạm khóa (LOCKED)</option>
                    <option value="UNACTIVATED">Chưa kích hoạt (UNACTIVATED)</option>
                    <option value="DISABLED">Đã vô hiệu hóa (DISABLED)</option>
                  </select>
                </div>
              </div>

              {/* Khu vực 2: Mật khẩu ban đầu (Chỉ hiển thị khi Tạo mới - Mục III.3, III.4 & Mục VI) */}
              {formMode === 'CREATE' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-blue-800" />
                      3 & 4. Thiết lập mật khẩu ban đầu an toàn (Mục VI)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Không lưu mật khẩu dạng văn bản thuần trong Firestore hoặc AuditLogs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                        formPasswordMethod === 'SEND_RESET_LINK'
                          ? 'bg-blue-50 border-blue-600 text-blue-950'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="passwordSetupMethod"
                        checked={formPasswordMethod === 'SEND_RESET_LINK'}
                        onChange={() => setFormPasswordMethod('SEND_RESET_LINK')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold">
                          Ưu tiên: Gửi liên kết thiết lập mật khẩu qua Email
                        </div>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          Hệ thống phát hành liên kết một lần để giáo viên tự đặt mật khẩu riêng.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                        formPasswordMethod === 'ADMIN_SET_INITIAL_PASSWORD'
                          ? 'bg-blue-50 border-blue-600 text-blue-950'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="passwordSetupMethod"
                        checked={formPasswordMethod === 'ADMIN_SET_INITIAL_PASSWORD'}
                        onChange={() =>
                          setFormPasswordMethod('ADMIN_SET_INITIAL_PASSWORD')
                        }
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold">
                          Đặt mật khẩu ban đầu (Xử lý băm PBKDF2 tại Backend)
                        </div>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          Mật khẩu chỉ băm một chiều tại máy chủ và yêu cầu đổi ở lần đăng nhập kế tiếp.
                        </p>
                      </div>
                    </label>
                  </div>

                  {formPasswordMethod === 'ADMIN_SET_INITIAL_PASSWORD' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          3. Mật khẩu ban đầu (Tối thiểu 8 ký tự)
                        </label>
                        <input
                          type="password"
                          value={formInitialPassword}
                          onChange={(e) => setFormInitialPassword(e.target.value)}
                          placeholder="Nhập mật khẩu ban đầu..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          4. Xác nhận mật khẩu
                        </label>
                        <input
                          type="password"
                          value={formConfirmPassword}
                          onChange={(e) => setFormConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-2 text-slate-800 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMustChangePassword}
                      onChange={(e) => setFormMustChangePassword(e.target.checked)}
                    />
                    <span>
                      Bắt buộc giáo viên đổi mật khẩu ngay ở lần đăng nhập kế tiếp
                    </span>
                  </label>
                </div>
              )}

              {/* Khu vực 3: Chọn Cấp học, Môn học & Khối lớp tách biệt theo CSDL chương trình (Mục IV) */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      6, 7 & 8. Phân công Cấp học, Môn học & Khối lớp giảng dạy (Mục IV)
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Một giáo viên có thể dạy nhiều môn, nhiều khối hoặc cả hai cấp. Danh mục môn học được tải trực tiếp từ CSDL chương trình của từng cấp.
                    </p>
                  </div>
                </div>

                {/* Chọn Cấp học */}
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-teal-300 bg-teal-50/70 text-teal-950 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEducationLevels.includes('PRIMARY')}
                      onChange={() => toggleFormEducationLevel('PRIMARY')}
                    />
                    <span>[✓] Cấp Tiểu học (Khối 1, 2, 3, 4, 5)</span>
                  </label>

                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/70 text-blue-950 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEducationLevels.includes('LOWER_SECONDARY')}
                      onChange={() => toggleFormEducationLevel('LOWER_SECONDARY')}
                    />
                    <span>[✓] Cấp THCS (Khối 6, 7, 8, 9)</span>
                  </label>
                </div>

                {/* Khung chọn môn & khối Cấp Tiểu học (Khối 1 -> 5) */}
                {formEducationLevels.includes('PRIMARY') && (
                  <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-200 space-y-2.5">
                    <div className="font-bold text-teal-950 flex items-center justify-between">
                      <span>
                        DANH MỤC MÔN HỌC CẤP TIỂU HỌC (Chỉ hiển thị Khối 1 – Khối 5 theo Chương trình Tiểu học)
                      </span>
                      <span className="text-[11px] font-normal text-teal-800">
                        Tích chọn môn học sau đó chọn các khối lớp giảng dạy
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {primaryCurriculumSubjects.map((subj) => {
                        const selectedAlloc = formSubjectAllocations.find(
                          (a) =>
                            a.educationLevelId === 'PRIMARY' &&
                            a.subjectId === subj.subjectId
                        );
                        return (
                          <div
                            key={subj.subjectId}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              selectedAlloc
                                ? 'bg-white border-teal-500 shadow-2xs'
                                : 'bg-white/60 border-slate-200'
                            }`}
                          >
                            <label className="flex items-center justify-between gap-2 font-bold text-slate-900 cursor-pointer">
                              <span className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(selectedAlloc)}
                                  onChange={() => toggleSubjectInForm(subj)}
                                />
                                <span>{subj.subjectName}</span>
                              </span>
                              <span className="text-[10px] font-normal text-slate-500">
                                Tiểu học
                              </span>
                            </label>

                            {selectedAlloc && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                                <span className="text-[11px] text-slate-600 mr-1">
                                  Khối lớp:
                                </span>
                                {subj.allowedGrades.map((g) => {
                                  const checked = selectedAlloc.grades.includes(g);
                                  return (
                                    <button
                                      key={g}
                                      type="button"
                                      onClick={() =>
                                        toggleGradeForSubjectInForm(
                                          'PRIMARY',
                                          subj.subjectId,
                                          g
                                        )
                                      }
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer tabular-nums ${
                                        checked
                                          ? 'bg-teal-700 text-white border-teal-700'
                                          : 'bg-slate-100 text-slate-700 border-slate-300'
                                      }`}
                                    >
                                      Lớp {g}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Khung chọn môn & khối Cấp THCS (Khối 6 -> 9) */}
                {formEducationLevels.includes('LOWER_SECONDARY') && (
                  <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 space-y-2.5">
                    <div className="font-bold text-blue-950 flex items-center justify-between">
                      <span>
                        DANH MỤC MÔN HỌC CẤP THCS (Chỉ hiển thị Khối 6 – Khối 9 theo Chương trình THCS)
                      </span>
                      <span className="text-[11px] font-normal text-blue-800">
                        Tách biệt hoàn toàn với danh mục Tiểu học
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {lowerSecondaryCurriculumSubjects.map((subj) => {
                        const selectedAlloc = formSubjectAllocations.find(
                          (a) =>
                            a.educationLevelId === 'LOWER_SECONDARY' &&
                            a.subjectId === subj.subjectId
                        );
                        return (
                          <div
                            key={subj.subjectId}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              selectedAlloc
                                ? 'bg-white border-blue-600 shadow-2xs'
                                : 'bg-white/60 border-slate-200'
                            }`}
                          >
                            <label className="flex items-center justify-between gap-2 font-bold text-slate-900 cursor-pointer">
                              <span className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(selectedAlloc)}
                                  onChange={() => toggleSubjectInForm(subj)}
                                />
                                <span>{subj.subjectName}</span>
                              </span>
                              <span className="text-[10px] font-normal text-slate-500">
                                THCS
                              </span>
                            </label>

                            {selectedAlloc && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                                <span className="text-[11px] text-slate-600 mr-1">
                                  Khối lớp:
                                </span>
                                {subj.allowedGrades.map((g) => {
                                  const checked = selectedAlloc.grades.includes(g);
                                  return (
                                    <button
                                      key={g}
                                      type="button"
                                      onClick={() =>
                                        toggleGradeForSubjectInForm(
                                          'LOWER_SECONDARY',
                                          subj.subjectId,
                                          g
                                        )
                                      }
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer tabular-nums ${
                                        checked
                                          ? 'bg-blue-800 text-white border-blue-800'
                                          : 'bg-slate-100 text-slate-700 border-slate-300'
                                      }`}
                                    >
                                      Lớp {g}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Khu vực 4: Chọn Vai trò (Mục III.9) & Ghi chú (Mục III.11) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">
                    9. Vai trò trong hệ thống (Một người có thể kiêm nhiệm nhiều vai trò)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ROLE_OPTIONS.map((roleOpt) => (
                      <label
                        key={roleOpt.code}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formRoles.includes(roleOpt.code)}
                          onChange={() => toggleRoleInForm(roleOpt.code)}
                        />
                        <span className="font-semibold text-slate-800">
                          {roleOpt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-900">
                    11. Ghi chú phân công (Không bắt buộc)
                  </label>
                  <textarea
                    rows={4}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ghi chú quyết định phân công chuyên môn, tổ bộ môn hoặc nhiệm vụ kiêm nhiệm..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Mục III: Hiển thị Phân công giảng dạy hiện tại & Nút mở trang Phân quyền trực tiếp */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      12. Phân công giảng dạy hiện tại & Liên kết Phân quyền (Mục III & IV)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tổ chuyên môn lấy từ danh mục · Môn học lấy từ chương trình · Khối lớp lọc theo cấp học · Phân biệt rõ Phân công chuyên môn và Quyền phần mềm.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {formMode === 'EDIT' &&
                      editingImmutableId &&
                      onOpenVisualPermissionForTeacher && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormModalOpen(false);
                            onOpenVisualPermissionForTeacher(
                              editingImmutableId,
                              formFullName
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Mở trang Phân quyền
                        </button>
                      )}
                    {onOpenDepartmentsAndAssignments && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormModalOpen(false);
                          onOpenDepartmentsAndAssignments(editingImmutableId || undefined);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-[11px] cursor-pointer"
                      >
                        Quản lý Tổ CM & Phân công giảng dạy
                      </button>
                    )}
                  </div>
                </div>

                {formMode === 'EDIT' && editingImmutableId ? (
                  (() => {
                    const currentAssigns = teachingAssignments.filter(
                      (ta) => ta.teacherUserId === editingImmutableId
                    );
                    return currentAssigns.length === 0 ? (
                      <div className="text-[11px] text-slate-500">
                        Chưa có bản ghi trong bảng Phân công giảng dạy theo năm học cho tài khoản này.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentAssigns.map((ta) => (
                          <div
                            key={ta.id}
                            className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-slate-900">
                                [{ta.academicYear}] {ta.subjectName}
                              </span>{' '}
                              <span className="text-slate-600">
                                ({ta.educationLevelId === 'PRIMARY' ? 'TH' : 'THCS'}: Khối{' '}
                                {(ta.grades || []).join(', ')})
                              </span>
                              <div className="text-slate-500">
                                Lớp dạy: {(ta.assignedClasses || []).join(', ') || '—'} · Trạng thái: {ta.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-[11px] text-slate-600">
                    Đang cấu hình phân công ban đầu: <strong>{formDepartment}</strong> ·{' '}
                    {formSubjectAllocations.length > 0
                      ? formSubjectAllocations
                          .map((a) => `${a.subjectName} (Khối ${a.grades.join(', ')})`)
                          .join('; ')
                      : 'Chưa chọn môn'}
                  </div>
                )}

                {formMode === 'CREATE' && onOpenVisualPermissionForTeacher && (
                  <label className="inline-flex items-center gap-2 font-bold text-indigo-950 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={openPermissionRightAfterCreate}
                      onChange={(e) =>
                        setOpenPermissionRightAfterCreate(e.target.checked)
                      }
                    />
                    <span>
                      Mở ngay giao diện Phân quyền trực quan cho giáo viên này sau khi lưu tài khoản
                    </span>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 disabled:opacity-60 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {formSaving
                      ? 'Đang xử lý tại Backend...'
                      : formMode === 'CREATE'
                      ? 'Tạo tài khoản giáo viên'
                      : 'Lưu cập nhật tài khoản'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          HỘP THOẠI QUẢN LÝ & ĐẶT LẠI MẬT KHẨU AN TOÀN (MỤC VI)
         ===================================================================== */}
      {resetModalAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden text-xs">
            <div className="bg-amber-950 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    QUẢN LÝ & ĐẶT LẠI MẬT KHẨU AN TOÀN (MỤC VI)
                  </h3>
                  <p className="text-[11px] text-amber-200">
                    Tài khoản: {resetModalAccount.fullName} ({resetModalAccount.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalAccount(null)}
                className="text-amber-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPasswordReset} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Nguyên tắc bảo mật mật khẩu (Mục VI):</span>
                </div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
                  <li>Hệ thống tuyệt đối không hiển thị mật khẩu hiện tại của giáo viên.</li>
                  <li>
                    Không lưu mật khẩu dạng văn bản thuần trong Firestore, không ghi mật khẩu vào AuditLogs.
                  </li>
                  <li>
                    Ưu tiên gửi liên kết đặt lại mật khẩu một lần tới email công vụ.
                  </li>
                </ul>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-semibold">
                  {resetError}
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-300 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    checked={resetMethod === 'SEND_RESET_LINK'}
                    onChange={() => setResetMethod('SEND_RESET_LINK')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-bold text-slate-900">
                      1. Gửi liên kết đặt lại mật khẩu (Khuyên dùng)
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Tạo đường dẫn đặt lại mật khẩu một lần cho địa chỉ{' '}
                      <span className="font-mono">{resetModalAccount.email}</span>.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-300 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    checked={resetMethod === 'ADMIN_SET_INITIAL_PASSWORD'}
                    onChange={() => setResetMethod('ADMIN_SET_INITIAL_PASSWORD')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-bold text-slate-900">
                      2. Đặt mật khẩu khởi tạo mới qua Backend (PBKDF2)
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Băm mật khẩu một chiều tại máy chủ và yêu cầu giáo viên đổi mật khẩu ở lần đăng nhập kế tiếp.
                    </p>
                  </div>
                </label>
              </div>

              {resetMethod === 'ADMIN_SET_INITIAL_PASSWORD' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Mật khẩu mới (Tối thiểu 8 ký tự)
                    </label>
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetMustChangeNextLogin}
                      onChange={(e) =>
                        setResetMustChangeNextLogin(e.target.checked)
                      }
                    />
                    <span>Yêu cầu đổi mật khẩu ở lần đăng nhập kế tiếp</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResetModalAccount(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-700 text-white font-bold hover:bg-amber-800 cursor-pointer"
                >
                  {resetSubmitting
                    ? 'Đang xử lý...'
                    : resetMethod === 'SEND_RESET_LINK'
                    ? 'Phát hành liên kết đặt lại mật khẩu'
                    : 'Lưu mật khẩu băm PBKDF2'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          HỘP THOẠI NHẬP TÀI KHOẢN TỪ EXCEL / CSV (MỤC I)
         ===================================================================== */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden text-xs">
            <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    NHẬP DANH SÁCH TÀI KHOẢN GIÁO VIÊN TỪ EXCEL / CSV
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Tự động kiểm tra định dạng email, chống trùng lặp và gán mã định danh ổn định.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-slate-600 leading-relaxed">
                Dán các dòng dữ liệu từ file Excel mẫu (Định dạng cột:{' '}
                <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  Họ tên, Email, Tổ chuyên môn, Cấp học, Mã môn, Tên môn, Khối lớp, Vai trò, Trạng thái
                </code>
                ):
              </div>
              <textarea
                rows={5}
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-mono text-[11px] text-slate-900"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDownloadSampleExcelTemplate}
                  className="inline-flex items-center gap-1.5 text-teal-800 font-bold hover:underline cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Tải file Excel mẫu (.csv)</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={importingExcel}
                    onClick={handleExecuteExcelImport}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer"
                  >
                    {importingExcel ? 'Đang nhập...' : 'Thực hiện nhập danh sách'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          HỘP THOẠI XÁC NHẬN XÓA TÀI KHOẢN GIÁO VIÊN AN TOÀN
         ===================================================================== */}
      {deleteModalAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-300 shadow-xl max-w-xl w-full overflow-hidden text-xs">
            <div className="bg-rose-950 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-rose-300" />
                <div>
                  <h3 className="text-sm font-bold">
                    XÁC NHẬN XÓA TÀI KHOẢN GIÁO VIÊN
                  </h3>
                  <p className="text-[11px] text-rose-200">
                    Mã định danh: {deleteModalAccount.id} · Email: {deleteModalAccount.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalAccount(null)}
                className="text-rose-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteDeleteAccount} className="p-5 space-y-4">
              {/* Thông tin tóm tắt tài khoản */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {deleteModalAccount.fullName}
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                    {deleteModalAccount.id}
                  </span>
                </div>
                <div className="text-slate-600">
                  Email đăng nhập: <strong className="font-mono">{deleteModalAccount.email}</strong> · Tổ:{' '}
                  <strong>{deleteModalAccount.departmentName}</strong>
                </div>
                <div className="text-slate-600">
                  Môn giảng dạy:{' '}
                  <strong>
                    {deleteModalAccount.assignedSubjectsDisplay.join(', ') || 'Chưa phân công'}
                  </strong>
                </div>
              </div>

              {deleteLoadingPreview ? (
                <div className="p-4 text-center text-slate-500">
                  Đang kiểm tra ràng buộc dữ liệu & hồ sơ liên quan...
                </div>
              ) : (
                deletePreview && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Bản ghi phân quyền</div>
                        <div className="text-sm font-bold text-slate-900 tabular-nums">
                          {deletePreview.activeGrantsCount}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Hồ sơ đề đã tạo</div>
                        <div className="text-sm font-bold text-slate-900 tabular-nums">
                          {deletePreview.authoredDossiersCount}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Hồ sơ đã phê duyệt</div>
                        <div className="text-sm font-bold text-emerald-800 tabular-nums">
                          {deletePreview.approvedDossiersCount}
                        </div>
                      </div>
                    </div>

                    {!deletePreview.canDelete ? (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Chặn xóa tài khoản đặc biệt:</div>
                          <p className="mt-0.5">{deletePreview.blockReason}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Lưu ý quan trọng trước khi xóa:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px]">
                          {deletePreview.warningMessages.map((msg, i) => (
                            <li key={i}>{msg}</li>
                          ))}
                          <li>
                            Nếu chỉ muốn ngừng quyền truy cập nhưng giữ lại tài khoản trong danh sách nhân sự, khuyến nghị chọn{' '}
                            <strong>Vô hiệu hóa tài khoản (DISABLED)</strong>.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )
              )}

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-semibold">
                  {deleteError}
                </div>
              )}

              {(!deletePreview || deletePreview.canDelete) && (
                <>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Lý do xóa tài khoản (Ghi vào Nhật ký kiểm toán AuditLogs)
                    </label>
                    <input
                      type="text"
                      required
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Nhập lý do xóa tài khoản..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>

                  <label className="flex items-start gap-2 p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteConfirmed}
                      onChange={(e) => setDeleteConfirmed(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      Tôi xác nhận xóa tài khoản giáo viên &ldquo;{deleteModalAccount.fullName}&rdquo; và thu hồi toàn bộ phiên đăng nhập, quyền truy cập của tài khoản này.
                    </span>
                  </label>
                </>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                {deleteModalAccount.status !== 'DISABLED' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = deleteModalAccount;
                      setDeleteModalAccount(null);
                      void handleChangeAccountStatus(target, 'DISABLED');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 font-bold hover:bg-amber-100 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5 text-amber-700" />
                    <span>Chỉ Vô hiệu hóa thay vì Xóa</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteModalAccount(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  {(!deletePreview || deletePreview.canDelete) && (
                    <button
                      type="submit"
                      disabled={deleteSubmitting || !deleteConfirmed}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-700 text-white font-bold hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        {deleteSubmitting
                          ? 'Đang xóa...'
                          : 'Xác nhận xóa tài khoản'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
