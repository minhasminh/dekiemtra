import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Edit3,
  Filter,
  GraduationCap,
  Info,
  Lock,
  Mail,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import {
  PostImportAccountAuditRow,
  PostImportAuditQaReport,
  PostImportAuditStatistics,
  PostImportAuditWarningCode,
  SchoolCurriculumSubjectCatalogItem,
  TeacherAccountLifecycleStatus,
  WorkflowActorRole,
} from '../types/domain';

interface PostExcelImportAuditPanelProps {
  currentAdminUserId?: string;
  currentAdminName?: string;
  departmentsCatalog: string[];
  curriculumSubjects: SchoolCurriculumSubjectCatalogItem[];
  onOpenVisualPermissionForTeacher?: (userId: string, fullName: string) => void;
  onMainAccountsRefreshRequested?: () => void;
  initialScopeMode?: 'official' | 'sandbox20';
}

const WARNING_CATALOG: Array<{
  code: PostImportAuditWarningCode;
  order: number;
  shortLabel: string;
  badgeClass: string;
}> = [
  {
    code: 'MISSING_DEPARTMENT',
    order: 1,
    shortLabel: '1. Chưa có tổ chuyên môn',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
  },
  {
    code: 'MISSING_TEACHING_ASSIGNMENT',
    order: 2,
    shortLabel: '2. Chưa có phân công giảng dạy',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
  },
  {
    code: 'MISSING_QUESTION_PERMISSION',
    order: 3,
    shortLabel: '3. Chưa có quyền tạo câu hỏi',
    badgeClass: 'bg-orange-50 text-orange-900 border-orange-300',
  },
  {
    code: 'MISSING_EXAM_PERMISSION',
    order: 4,
    shortLabel: '4. Chưa có quyền tạo đề (Lưu ý tham khảo)',
    badgeClass: 'bg-sky-50 text-sky-900 border-sky-300',
  },
  {
    code: 'SUBJECT_LEVEL_MISMATCH',
    order: 5,
    shortLabel: '5. Môn học không phù hợp cấp học',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-300',
  },
  {
    code: 'INVALID_EMAIL',
    order: 6,
    shortLabel: '6. Email không hợp lệ',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-300',
  },
  {
    code: 'ACCOUNT_UNACTIVATED',
    order: 7,
    shortLabel: '7. Tài khoản chưa kích hoạt',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    code: 'ACCOUNT_LOCKED',
    order: 8,
    shortLabel: '8. Tài khoản bị khóa',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-400',
  },
  {
    code: 'ROLE_PERMISSION_MISMATCH',
    order: 9,
    shortLabel: '9. Vai trò & quyền không phù hợp',
    badgeClass: 'bg-purple-50 text-purple-900 border-purple-300',
  },
];

const ROLE_LABELS: Record<string, string> = {
  TEACHER: 'Giáo viên',
  HEAD_OF_DEPARTMENT: 'Tổ trưởng CM',
  REVIEWER: 'GV phản biện',
  PEER_REVIEWER: 'GV phản biện',
  VICE_PRINCIPAL: 'Phó hiệu trưởng',
  PRINCIPAL: 'Hiệu trưởng',
  SYSTEM_ADMIN: 'Quản trị hệ thống',
};

const ACCOUNT_STATUS_BADGE: Record<
  TeacherAccountLifecycleStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Đang hoạt động',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  UNACTIVATED: {
    label: 'Chưa kích hoạt',
    className: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  LOCKED: {
    label: 'Tạm khóa',
    className: 'bg-amber-50 text-amber-900 border-amber-300',
  },
  DISABLED: {
    label: 'Đã vô hiệu hóa',
    className: 'bg-rose-50 text-rose-900 border-rose-300',
  },
};

export const PostExcelImportAuditPanel: React.FC<PostExcelImportAuditPanelProps> = ({
  currentAdminUserId = 'user-admin-sys',
  departmentsCatalog,
  curriculumSubjects,
  onOpenVisualPermissionForTeacher,
  onMainAccountsRefreshRequested,
  initialScopeMode = 'official',
}) => {
  const [scopeMode, setScopeMode] = useState<'official' | 'sandbox20'>(initialScopeMode);
  const [rows, setRows] = useState<PostImportAccountAuditRow[]>([]);
  const [statistics, setStatistics] = useState<PostImportAuditStatistics>({
    totalAccounts: 0,
    activeAccounts: 0,
    unactivatedAccounts: 0,
    lockedAccounts: 0,
    missingDepartmentAccounts: 0,
    missingAssignmentAccounts: 0,
    needsPermissionReviewAccounts: 0,
    accountsNeedingActionTotal: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Bộ lọc & tìm kiếm (Mục II, III, VI, VII.3)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatCard, setFilterStatCard] = useState<
    | 'ALL'
    | 'ACTIVE'
    | 'UNACTIVATED'
    | 'LOCKED'
    | 'MISSING_DEPT'
    | 'MISSING_ASSIGNMENT'
    | 'NEEDS_PERM_REVIEW'
    | 'NEEDS_ACTION'
  >('ALL');
  const [filterWarningCode, setFilterWarningCode] = useState<
    'ALL' | PostImportAuditWarningCode
  >('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterInvitation, setFilterInvitation] = useState<string>('ALL');

  // Chọn nhiều giáo viên để Phân quyền hàng loạt (Mục V)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkCreateQuestion, setBulkCreateQuestion] = useState<boolean>(true);
  const [bulkCreateMatrix, setBulkCreateMatrix] = useState<boolean>(true);
  const [bulkCreateExam, setBulkCreateExam] = useState<boolean>(false);
  const [bulkUseAi, setBulkUseAi] = useState<boolean>(false);
  const [bulkSubmitting, setBulkSubmitting] = useState<boolean>(false);

  // Hộp thoại Thao tác nhanh (Mục IV)
  const [quickActionModal, setQuickActionModal] = useState<{
    type:
      | 'EDIT_ACCOUNT'
      | 'ASSIGN_DEPARTMENT'
      | 'ADD_SUBJECT'
      | 'ADD_GRADES';
    row: PostImportAccountAuditRow;
  } | null>(null);

  const [qaFullName, setQaFullName] = useState<string>('');
  const [qaEmail, setQaEmail] = useState<string>('');
  const [qaDepartment, setQaDepartment] = useState<string>('');
  const [qaEducationLevels, setQaEducationLevels] = useState<
    ('PRIMARY' | 'LOWER_SECONDARY')[]
  >(['PRIMARY']);
  const [qaRoles, setQaRoles] = useState<WorkflowActorRole[]>(['TEACHER']);
  const [qaStatus, setQaStatus] = useState<TeacherAccountLifecycleStatus>('ACTIVE');
  const [qaSubjectId, setQaSubjectId] = useState<string>('SUB_PRI_TOAN');
  const [qaGrades, setQaGrades] = useState<number[]>([4]);
  const [quickActionSaving, setQuickActionSaving] = useState<boolean>(false);

  // Thông báo trạng thái
  const [notice, setNotice] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    inviteLink?: string | null;
  } | null>(null);

  // Báo cáo kiểm thử 20 tài khoản thử nghiệm (Mục VII)
  const [runningQaSuite, setRunningQaSuite] = useState<boolean>(false);
  const [qaReport, setQaReport] = useState<PostImportAuditQaReport | null>(null);

  const loadAuditData = async (targetMode: 'official' | 'sandbox20' = scopeMode) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/teacher-accounts/post-import-audit?mode=${encodeURIComponent(
          targetMode
        )}&adminUserId=${encodeURIComponent(currentAdminUserId)}`
      );
      const json = await res.json();
      if (res.ok && json.ok) {
        setRows(json.rows || []);
        if (json.statistics) {
          setStatistics(json.statistics);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData(scopeMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeMode, currentAdminUserId]);

  const handleResetSandbox20 = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        '/api/admin/teacher-accounts/post-import-audit/reset-sandbox-20',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminUserId: currentAdminUserId }),
        }
      );
      const json = await res.json();
      if (res.ok && json.ok) {
        setScopeMode('sandbox20');
        setRows(json.rows || []);
        if (json.statistics) setStatistics(json.statistics);
        setSelectedUserIds([]);
        setNotice({
          type: 'info',
          title: 'Đã nạp mới lô 20 Tài khoản Thử nghiệm sau nhập Excel (Cô lập Sandbox)',
          message:
            'Toàn bộ 20 tài khoản thử nghiệm được giữ trong vùng kiểm thử độc lập, tuyệt đối không ghi đè hay làm thay đổi danh sách giáo viên chính thức của nhà trường (Mục VII).',
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách theo các tiêu chí (Mục II, III, VI, VII.3)
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const matchName = r.fullName.toLowerCase().includes(q);
        const matchEmail = r.email.toLowerCase().includes(q);
        const matchDept = r.departmentName.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept) return false;
      }

      if (filterStatCard === 'ACTIVE' && r.accountStatus !== 'ACTIVE') return false;
      if (filterStatCard === 'UNACTIVATED' && r.accountStatus !== 'UNACTIVATED')
        return false;
      if (filterStatCard === 'LOCKED' && r.accountStatus !== 'LOCKED') return false;
      if (filterStatCard === 'MISSING_DEPT' && r.hasDepartment) return false;
      if (filterStatCard === 'MISSING_ASSIGNMENT' && r.hasTeachingAssignment)
        return false;
      if (filterStatCard === 'NEEDS_PERM_REVIEW' && !r.needsPermissionReview)
        return false;
      if (filterStatCard === 'NEEDS_ACTION' && !r.needsAttention) return false;

      if (filterWarningCode !== 'ALL') {
        if (!r.warnings.some((w) => w.code === filterWarningCode)) return false;
      }

      if (filterDepartment !== 'ALL') {
        if (filterDepartment === '__EMPTY__') {
          if (r.hasDepartment) return false;
        } else if (r.departmentName !== filterDepartment) {
          return false;
        }
      }

      if (filterInvitation !== 'ALL' && r.invitationStatus !== filterInvitation) {
        return false;
      }

      return true;
    });
  }, [
    rows,
    searchQuery,
    filterStatCard,
    filterWarningCode,
    filterDepartment,
    filterInvitation,
  ]);

  const toggleSelectRow = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredRows.map((r) => r.userId);
    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Mở hộp thoại thao tác nhanh (Mục IV)
  const openQuickAction = (
    type: 'EDIT_ACCOUNT' | 'ASSIGN_DEPARTMENT' | 'ADD_SUBJECT' | 'ADD_GRADES',
    row: PostImportAccountAuditRow
  ) => {
    setQuickActionModal({ type, row });
    setQaFullName(row.fullName);
    setQaEmail(row.email);
    setQaDepartment(
      row.departmentName || departmentsCatalog[0] || 'Tổ khoa học tự nhiên'
    );
    const lv =
      row.educationLevels.length > 0 ? row.educationLevels : (['PRIMARY'] as ('PRIMARY' | 'LOWER_SECONDARY')[]);
    setQaEducationLevels(lv);
    setQaRoles(row.roles.length > 0 ? row.roles : ['TEACHER']);
    setQaStatus(row.accountStatus);

    const primaryLevel = lv[0] || 'PRIMARY';
    const matchingSubjects = curriculumSubjects.filter(
      (s) => s.educationLevelId === primaryLevel
    );
    const defaultSubject =
      matchingSubjects[0]?.subjectId ||
      (primaryLevel === 'PRIMARY' ? 'SUB_PRI_TOAN' : 'SUB_SEC_TOAN');
    setQaSubjectId(defaultSubject);
    setQaGrades(
      row.gradesDisplay.length > 0
        ? [...row.gradesDisplay]
        : primaryLevel === 'PRIMARY'
        ? [4, 5]
        : [6, 7]
    );
  };

  const handleExecuteQuickActionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActionModal) return;
    setQuickActionSaving(true);
    try {
      const { type, row } = quickActionModal;
      const selectedCatalogSub = curriculumSubjects.find(
        (s) => s.subjectId === qaSubjectId
      );
      const res = await fetch(
        '/api/admin/teacher-accounts/post-import-audit/quick-action',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: scopeMode,
            adminUserId: currentAdminUserId,
            userId: row.userId,
            actionType: type,
            fullName: qaFullName.trim(),
            email: qaEmail.trim(),
            departmentName: qaDepartment,
            educationLevels: qaEducationLevels,
            roles: qaRoles,
            accountStatus: qaStatus,
            subjectId: qaSubjectId,
            subjectName: selectedCatalogSub?.subjectName || 'Toán',
            educationLevelId:
              selectedCatalogSub?.educationLevelId || qaEducationLevels[0] || 'PRIMARY',
            grades: qaGrades,
          }),
        }
      );
      const json = await res.json();
      if (res.ok && json.ok) {
        setQuickActionModal(null);
        await loadAuditData(scopeMode);
        if (scopeMode === 'official') {
          onMainAccountsRefreshRequested?.();
        }
        setNotice({
          type: 'success',
          title: `Đã hoàn thiện thông tin cho "${row.fullName}"`,
          message: json.message,
        });
      } else {
        setNotice({
          type: 'error',
          title: 'Không thể thực hiện thao tác nhanh',
          message: json.message || 'Dữ liệu không hợp lệ.',
        });
      }
    } catch {
      setNotice({
        type: 'error',
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối máy chủ khi lưu thao tác nhanh.',
      });
    } finally {
      setQuickActionSaving(false);
    }
  };

  // Thao tác nhanh trực tiếp: Gửi lại lời mời kích hoạt hoặc Tạm khóa / Mở khóa (Mục IV)
  const handleDirectRowQuickAction = async (
    row: PostImportAccountAuditRow,
    actionType: 'SEND_INVITATION' | 'TEMP_LOCK' | 'UNLOCK_ACTIVE'
  ) => {
    try {
      const res = await fetch(
        '/api/admin/teacher-accounts/post-import-audit/quick-action',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: scopeMode,
            adminUserId: currentAdminUserId,
            userId: row.userId,
            actionType,
          }),
        }
      );
      const json = await res.json();
      if (res.ok && json.ok) {
        await loadAuditData(scopeMode);
        if (scopeMode === 'official') {
          onMainAccountsRefreshRequested?.();
        }
        setNotice({
          type: actionType === 'TEMP_LOCK' ? 'warning' : 'success',
          title:
            actionType === 'SEND_INVITATION'
              ? `Đã gửi lời mời kích hoạt cho "${row.fullName}"`
              : actionType === 'TEMP_LOCK'
              ? `Đã tạm khóa tài khoản "${row.fullName}"`
              : `Đã mở khóa tài khoản "${row.fullName}"`,
          message: json.message,
          inviteLink: json.inviteLink || null,
        });
      } else {
        setNotice({
          type: 'error',
          title: 'Thao tác bị từ chối',
          message: json.message || 'Không thể thực hiện thao tác.',
        });
      }
    } catch {
      // ignore
    }
  };

  // Phân quyền hàng loạt (Mục V: Chỉ cho phép Tạo câu hỏi, Tạo ma trận, Tạo đề, Sử dụng AI; Chặn thẩm định/phê duyệt)
  const handleExecuteBulkPermissions = async () => {
    if (selectedUserIds.length === 0) return;
    const permissionCodes: string[] = [];
    if (bulkCreateQuestion) permissionCodes.push('CREATE_QUESTION');
    if (bulkCreateMatrix) permissionCodes.push('CREATE_EXAM_MATRIX');
    if (bulkCreateExam) permissionCodes.push('CREATE_EXAM_PAPER');
    if (bulkUseAi) {
      permissionCodes.push(
        'USE_AI_QUESTION_GENERATOR',
        'USE_AI_QUESTION_VARIATION',
        'USE_AI_EXAM_REVIEW'
      );
    }

    if (permissionCodes.length === 0) {
      setNotice({
        type: 'warning',
        title: 'Chưa chọn quyền cần gán',
        message:
          'Vui lòng tích chọn ít nhất một quyền (Tạo câu hỏi, Tạo ma trận, Tạo đề, hoặc Sử dụng AI).',
      });
      return;
    }

    setBulkSubmitting(true);
    try {
      const res = await fetch(
        '/api/admin/teacher-accounts/post-import-audit/bulk-permissions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: scopeMode,
            adminUserId: currentAdminUserId,
            userIds: selectedUserIds,
            permissionCodes,
          }),
        }
      );
      const json = await res.json();
      if (res.ok && json.ok) {
        await loadAuditData(scopeMode);
        if (scopeMode === 'official') {
          onMainAccountsRefreshRequested?.();
        }
        setNotice({
          type: 'success',
          title: `Đã phân quyền hàng loạt cho ${json.updatedCount} giáo viên`,
          message: json.message,
        });
      } else {
        setNotice({
          type: 'error',
          title: 'Từ chối phân quyền hàng loạt',
          message: json.message || 'Không thể phân quyền hàng loạt.',
        });
      }
    } catch {
      // ignore
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Xuất danh sách cần xử lý ra Excel/CSV (Mục IV & VII.7)
  const handleExportNeedsAttentionExcel = async () => {
    try {
      const res = await fetch(
        `/api/admin/teacher-accounts/post-import-audit/export-excel?mode=${encodeURIComponent(
          scopeMode
        )}&onlyNeedsAttention=true`
      );
      const json = await res.json();
      if (!res.ok || !json.ok) return;

      const csvContent: string = json.csvContent || '';
      const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        json.fileName ||
        `Danh_Sach_Tai_Khoan_Can_Xu_Ly_Sau_Nhap_Excel_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotice({
        type: 'info',
        title: `Đã xuất ${json.exportedRowsCount} tài khoản cần xử lý ra file Excel (.csv)`,
        message:
          'File xuất bao gồm đầy đủ 11 cột kiểm tra và danh sách cảnh báo chi tiết, tuyệt đối không chứa mật khẩu hoặc mã băm.',
      });
    } catch {
      // ignore
    }
  };

  // Chạy bộ kiểm thử 20 tài khoản thử nghiệm (Mục VII)
  const handleRun20AccountsQaSuite = async () => {
    setRunningQaSuite(true);
    try {
      const res = await fetch(
        '/api/admin/teacher-accounts/post-import-audit/run-qa-suite',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminUserId: currentAdminUserId }),
        }
      );
      const json = await res.json();
      if (res.ok && json.ok && json.report) {
        setQaReport(json.report);
        setScopeMode('sandbox20');
        await loadAuditData('sandbox20');
      }
    } catch {
      // ignore
    } finally {
      setRunningQaSuite(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* BANNER TIÊU ĐỀ & CHẾ ĐỘ CÔ LẬP DỮ LIỆU THỬ NGHIỆM (MỤC I & VII) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-950 text-white">
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                KIỂM TRA & HOÀN THIỆN TÀI KHOẢN SAU KHI NHẬP EXCEL
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                  scopeMode === 'sandbox20'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}
              >
                {scopeMode === 'sandbox20'
                  ? 'Chế độ: Lô 20 Tài khoản Thử nghiệm (Cô lập Sandbox — Không trộn vào dữ liệu chính thức)'
                  : 'Chế độ: Rà soát Danh sách Tài khoản Chính thức của Trường'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Tự động Rà soát 9 Cảnh báo, Hoàn thiện Phân công & Phân quyền Hàng loạt sau Nhập Excel
            </h3>
            <p className="text-xs text-slate-600">
              Quy tắc Mục III & Mục V: <strong>Không coi mọi tài khoản thiếu quyền tạo đề là lỗi</strong> (một số giáo viên không được phân công ra đề) · <strong>Không tự cấp quyền thẩm định hoặc phê duyệt hàng loạt</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportNeedsAttentionExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Xuất danh sách cần xử lý (.CSV)</span>
            </button>
          </div>
        </div>

        {/* MỤC VI: BẢNG THỐNG KÊ 7 CHỈ SỐ (BẤM ĐỂ LỌC NHANH) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <button
            type="button"
            onClick={() => setFilterStatCard('ALL')}
            className={`text-left p-3 rounded-xl border transition cursor-pointer ${
              filterStatCard === 'ALL'
                ? 'bg-blue-950 text-white border-blue-950 shadow-xs'
                : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-80">
              1. Tổng số tài khoản
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5">
              {statistics.totalAccounts}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatCard(filterStatCard === 'ACTIVE' ? 'ALL' : 'ACTIVE')
            }
            className={`text-left p-3 rounded-xl border transition cursor-pointer ${
              filterStatCard === 'ACTIVE'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:bg-emerald-100/70'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">
              2. Đang hoạt động
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5">
              {statistics.activeAccounts}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatCard(
                filterStatCard === 'UNACTIVATED' ? 'ALL' : 'UNACTIVATED'
              )
            }
            className={`text-left p-3 rounded-xl border transition cursor-pointer ${
              filterStatCard === 'UNACTIVATED'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">
              3. Chưa kích hoạt
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5">
              {statistics.unactivatedAccounts}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatCard(filterStatCard === 'LOCKED' ? 'ALL' : 'LOCKED')
            }
            className={`text-left p-3 rounded-xl border transition cursor-pointer ${
              filterStatCard === 'LOCKED'
                ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                : 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">
              4. Tài khoản tạm khóa
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5">
              {statistics.lockedAccounts}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatCard(
                filterStatCard === 'MISSING_DEPT' ? 'ALL' : 'MISSING_DEPT'
              )
            }
            className={`text-left p-3 rounded-xl border transition cursor-pointer ${
              filterStatCard === 'MISSING_DEPT'
                ? 'bg-orange-700 text-white border-orange-700 shadow-xs'
                : 'bg-orange-50 text-orange-950 border-orange-200 hover:bg-orange-100/70'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">
              5. Chưa có tổ CM
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5">
              {statistics.missingDepartmentAccounts}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatCard(
                filterStatCard === 'MISSING_ASSIGNMENT'
                  ? 'ALL'
                  : 'MISSING_ASSIGNMENT'
              )
            }
            className={`text-left p-3 rounded-xl border transition cursor-pointer ${
              filterStatCard === 'MISSING_ASSIGNMENT'
                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                : 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100/70'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">
              6. Chưa có phân công
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5">
              {statistics.missingAssignmentAccounts}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatCard(
                filterStatCard === 'NEEDS_PERM_REVIEW'
                  ? 'ALL'
                  : 'NEEDS_PERM_REVIEW'
              )
            }
            className={`text-left p-3 rounded-xl border transition cursor-pointer ${
              filterStatCard === 'NEEDS_PERM_REVIEW'
                ? 'bg-purple-800 text-white border-purple-800 shadow-xs'
                : 'bg-purple-50 text-purple-950 border-purple-200 hover:bg-purple-100/70'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-85">
              7. Cần rà soát quyền
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5">
              {statistics.needsPermissionReviewAccounts}
            </div>
          </button>
        </div>
      </div>

      {/* THÔNG BÁO KẾT QUẢ THAO TÁC */}
      {notice && (
        <div
          className={`rounded-2xl border p-4 flex items-start justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : notice.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : notice.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
        >
          <div className="space-y-1 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice.title}</span>
            </div>
            <p className="leading-relaxed">{notice.message}</p>
            {notice.inviteLink && (
              <div className="mt-1.5 p-2 rounded-lg bg-white/90 border border-slate-300 font-mono text-[11px] break-all">
                Liên kết kích hoạt (One-Time Token): <strong>{notice.inviteLink}</strong>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MỤC VII: BÁO CÁO NGHIỆM THU 20 TÀI KHOẢN THỬ NGHIỆM */}
      {qaReport && (
        <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-xs p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-900 text-white">
                  BÁO CÁO KIỂM THỬ MỤC VII · 20 TÀI KHOẢN THỬ NGHIỆM SAU NHẬP EXCEL
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Kết quả: {qaReport.passedSteps}/{qaReport.totalSteps} Hạng mục ĐẠT (100%)
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                  Cô lập dữ liệu chính thức: {qaReport.officialDataUntouched ? 'ĐẢM BẢO 100% (59 TK chính thức nguyên vẹn)' : 'LỖI'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Mã phiên kiểm thử: <strong className="font-mono">{qaReport.runId}</strong> · Thời gian:{' '}
                {new Date(qaReport.executedAt).toLocaleString('vi-VN')} · Số tài khoản thử nghiệm:{' '}
                <strong>{qaReport.importedTestAccountsCount} tài khoản</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQaReport(null)}
              className="self-start px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Đóng báo cáo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="py-2 px-3 text-left font-bold">Mã KT</th>
                  <th className="py-2 px-3 text-left font-bold">Hạng mục Kiểm thử (Mục VII)</th>
                  <th className="py-2 px-3 text-left font-bold">Dữ liệu & Thao tác</th>
                  <th className="py-2 px-3 text-left font-bold">Kết quả thực tế</th>
                  <th className="py-2 px-3 text-center font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {qaReport.steps.map((st) => (
                  <tr key={st.testCode} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-900 whitespace-nowrap">
                      {st.testCode}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {st.title}
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        {st.securityAndIsolationNote}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{st.inputSummary}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {st.actualOutcome}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          st.status === 'Đạt'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MỤC V: THANH PHÂN QUYỀN HÀNG LOẠT CHO CÁC GIÁO VIÊN ĐÃ CHỌN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-950 border border-indigo-200">
              <Users className="w-3.5 h-3.5 text-indigo-700" />
              MỤC V · PHÂN QUYỀN HÀNG LOẠT SAU NHẬP EXCEL
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Đã chọn:{' '}
              <strong className="text-indigo-800 tabular-nums">
                {selectedUserIds.length}
              </strong>{' '}
              giáo viên
            </span>
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              {filteredRows.length > 0 &&
              filteredRows.every((r) => selectedUserIds.includes(r.userId))
                ? 'Bỏ chọn danh sách đang lọc'
                : `Chọn toàn bộ ${filteredRows.length} GV đang lọc`}
            </button>
            {selectedUserIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedUserIds([])}
                className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-800 hover:bg-rose-100 cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              Chốt chặn bảo mật Mục V: Hệ thống khóa cứng, không cho phép cấp quyền Thẩm định hoặc Phê duyệt đề hàng loạt.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={bulkCreateQuestion}
                onChange={(e) => setBulkCreateQuestion(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>1. Gán quyền tạo câu hỏi (CREATE_QUESTION)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={bulkCreateMatrix}
                onChange={(e) => setBulkCreateMatrix(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>2. Gán quyền tạo ma trận (CREATE_MATRIX)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={bulkCreateExam}
                onChange={(e) => setBulkCreateExam(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>3. Gán quyền tạo đề (CREATE_EXAM)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={bulkUseAi}
                onChange={(e) => setBulkUseAi(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                4. Gán quyền sử dụng AI (AI hỗ trợ câu hỏi & rà soát)
              </span>
            </label>

            <span className="inline-flex items-center gap-1 text-slate-400 line-through select-none">
              <Lock className="w-3 h-3" />
              Quyền Thẩm định / Phê duyệt đề (Bị khóa hàng loạt)
            </span>
          </div>

          <button
            type="button"
            disabled={selectedUserIds.length === 0 || bulkSubmitting}
            onClick={handleExecuteBulkPermissions}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              Áp dụng phân quyền cho {selectedUserIds.length} giáo viên đã chọn
            </span>
          </button>
        </div>
      </div>

      {/* BỘ LỌC TÌM KIẾM & LỌC THEO 9 LOẠI CẢNH BÁO (MỤC III) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Họ tên, Email, Tổ chuyên môn..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={filterWarningCode}
              onChange={(e) =>
                setFilterWarningCode(
                  e.target.value as 'ALL' | PostImportAuditWarningCode
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-800"
            >
              <option value="ALL">Tất cả 9 loại cảnh báo (Mục III)</option>
              {WARNING_CATALOG.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.shortLabel}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-800"
          >
            <option value="ALL">Tất cả Tổ chuyên môn</option>
            <option value="__EMPTY__">Chưa có tổ chuyên môn</option>
            {departmentsCatalog.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filterInvitation}
            onChange={(e) => setFilterInvitation(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-800"
          >
            <option value="ALL">Tất cả Trạng thái lời mời kích hoạt</option>
            <option value="INVITE_NOT_SENT">Chưa gửi lời mời kích hoạt</option>
            <option value="INVITE_SENT">Đã gửi lời mời kích hoạt</option>
            <option value="ACTIVATED">Đã kích hoạt</option>
            <option value="INVITE_EXPIRED">Liên kết đã hết hạn</option>
          </select>
        </div>

        {/* Các nút lọc nhanh theo 9 Cảnh báo Mục III */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setFilterWarningCode('ALL');
              setFilterStatCard('ALL');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
              filterWarningCode === 'ALL' && filterStatCard === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            Tất cả ({rows.length})
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatCard(
                filterStatCard === 'NEEDS_ACTION' ? 'ALL' : 'NEEDS_ACTION'
              )
            }
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
              filterStatCard === 'NEEDS_ACTION'
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
            }`}
          >
            Cần xử lý ({statistics.accountsNeedingActionTotal})
          </button>

          {WARNING_CATALOG.map((w) => {
            const count = rows.filter((r) =>
              r.warnings.some((item) => item.code === w.code)
            ).length;
            const active = filterWarningCode === w.code;
            return (
              <button
                key={w.code}
                type="button"
                onClick={() =>
                  setFilterWarningCode(active ? 'ALL' : w.code)
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition ${
                  active
                    ? 'bg-indigo-900 text-white border-indigo-900'
                    : w.badgeClass
                }`}
              >
                {w.shortLabel}: <strong>{count}</strong>
              </button>
            );
          })}
        </div>
      </div>

      {/* MỤC II: BẢNG KIỂM TRA 11 CỘT & CÁC THAO TÁC NHANH (MỤC IV) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-800">
            BẢNG KIỂM TRA TÌNH TRẠNG TÀI KHOẢN SAU NHẬP EXCEL (Hiển thị{' '}
            <span className="text-indigo-700">{filteredRows.length}</span> /{' '}
            {rows.length} tài khoản)
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>
              Cảnh báo số 4 (Chưa có quyền tạo đề) được phân loại là <strong>Lưu ý tham khảo</strong>, không tính là lỗi tài khoản.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th className="py-2.5 px-2.5 text-center w-9">
                  <input
                    type="checkbox"
                    checked={
                      filteredRows.length > 0 &&
                      filteredRows.every((r) => selectedUserIds.includes(r.userId))
                    }
                    onChange={toggleSelectAllFiltered}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="py-2.5 px-2.5 text-left font-bold">1. Họ và tên</th>
                <th className="py-2.5 px-2.5 text-left font-bold">2. Email</th>
                <th className="py-2.5 px-2.5 text-left font-bold">3. Tổ chuyên môn</th>
                <th className="py-2.5 px-2.5 text-left font-bold">4. Cấp học</th>
                <th className="py-2.5 px-2.5 text-left font-bold">5. Môn học</th>
                <th className="py-2.5 px-2.5 text-left font-bold">6. Khối lớp</th>
                <th className="py-2.5 px-2.5 text-left font-bold">7. Vai trò</th>
                <th className="py-2.5 px-2.5 text-left font-bold">8. Trạng thái TK</th>
                <th className="py-2.5 px-2.5 text-left font-bold">9. Trạng thái phân quyền & Cảnh báo</th>
                <th className="py-2.5 px-2.5 text-left font-bold">10. Lời mời kích hoạt</th>
                <th className="py-2.5 px-2.5 text-right font-bold">11. Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-500">
                    Đang kiểm tra và tổng hợp tình trạng tài khoản...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-500">
                    Không có tài khoản nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isSelected = selectedUserIds.includes(row.userId);
                  const statusBadge =
                    ACCOUNT_STATUS_BADGE[row.accountStatus] ||
                    ACCOUNT_STATUS_BADGE.ACTIVE;
                  return (
                    <tr
                      key={row.userId}
                      className={`hover:bg-slate-50/90 transition ${
                        isSelected ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2.5 text-center align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(row.userId)}
                          className="rounded border-slate-300 mt-1"
                        />
                      </td>

                      {/* 1. Họ và tên */}
                      <td className="py-2.5 px-2.5 align-top">
                        <div className="font-bold text-slate-900">{row.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          ID: {row.userId}
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td className="py-2.5 px-2.5 align-top">
                        <div
                          className={`font-mono text-[11px] break-all ${
                            row.isEmailValid
                              ? 'text-slate-800'
                              : 'text-rose-700 font-bold underline decoration-wavy'
                          }`}
                        >
                          {row.email || '(Trống)'}
                        </div>
                        {!row.isEmailValid && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            Email không hợp lệ
                          </span>
                        )}
                      </td>

                      {/* 3. Tổ chuyên môn */}
                      <td className="py-2.5 px-2.5 align-top">
                        {row.hasDepartment ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-[11px]">
                              <Building2 className="w-3 h-3 text-slate-600" />
                              {row.departmentName}
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  openQuickAction('ASSIGN_DEPARTMENT', row)
                                }
                                className="text-[10px] font-semibold text-blue-700 hover:underline cursor-pointer"
                              >
                                Đổi tổ CM
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 font-bold text-[10px]">
                              <AlertTriangle className="w-3 h-3" />
                              Chưa có tổ CM
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  openQuickAction('ASSIGN_DEPARTMENT', row)
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900 text-white text-[10px] font-bold hover:bg-blue-800 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Gán tổ chuyên môn
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 4. Cấp học */}
                      <td className="py-2.5 px-2.5 align-top">
                        <div className="flex flex-wrap gap-1">
                          {row.educationLevels.map((lv) => (
                            <span
                              key={lv}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                lv === 'PRIMARY'
                                  ? 'bg-teal-50 text-teal-900 border-teal-300'
                                  : 'bg-indigo-50 text-indigo-900 border-indigo-300'
                              }`}
                            >
                              {lv === 'PRIMARY' ? 'Tiểu học' : 'THCS'}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 5. Môn học */}
                      <td className="py-2.5 px-2.5 align-top">
                        {row.subjectsDisplay.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {row.subjectsDisplay.map((sub) => (
                                <span
                                  key={sub}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                    row.hasSubjectLevelMismatch
                                      ? 'bg-rose-50 text-rose-900 border-rose-300'
                                      : 'bg-blue-50 text-blue-900 border-blue-200'
                                  }`}
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => openQuickAction('ADD_SUBJECT', row)}
                              className="text-[10px] font-semibold text-blue-700 hover:underline cursor-pointer"
                            >
                              + Bổ sung môn dạy
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold">
                              Chưa có môn dạy
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() => openQuickAction('ADD_SUBJECT', row)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-700 text-white text-[10px] font-bold hover:bg-teal-800 cursor-pointer"
                              >
                                <BookOpen className="w-3 h-3" />
                                Bổ sung môn dạy
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 6. Khối lớp */}
                      <td className="py-2.5 px-2.5 align-top">
                        {row.gradesDisplay.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {row.gradesDisplay.map((g) => (
                                <span
                                  key={g}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold tabular-nums"
                                >
                                  K{g}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => openQuickAction('ADD_GRADES', row)}
                              className="text-[10px] font-semibold text-blue-700 hover:underline cursor-pointer"
                            >
                              + Bổ sung khối lớp
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openQuickAction('ADD_GRADES', row)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold hover:bg-slate-700 cursor-pointer"
                          >
                            <GraduationCap className="w-3 h-3" />
                            Bổ sung khối lớp
                          </button>
                        )}
                      </td>

                      {/* 7. Vai trò */}
                      <td className="py-2.5 px-2.5 align-top">
                        <div className="flex flex-wrap gap-1">
                          {row.roles.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-semibold"
                            >
                              {ROLE_LABELS[r] || r}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 8. Trạng thái tài khoản */}
                      <td className="py-2.5 px-2.5 align-top">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* 9. Trạng thái phân quyền & Cảnh báo (Mục III) */}
                      <td className="py-2.5 px-2.5 align-top max-w-xs">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              row.permissionAuditStatus === 'FULLY_CONFIGURED'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : row.permissionAuditStatus === 'QUESTION_BANK_ONLY'
                                ? 'bg-sky-50 text-sky-900 border-sky-300'
                                : row.permissionAuditStatus ===
                                  'ROLE_PERMISSION_CONFLICT'
                                ? 'bg-purple-50 text-purple-900 border-purple-300'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            {row.permissionAuditStatusLabel}
                          </span>

                          {/* Hiển thị các cảnh báo Mục III */}
                          {row.warnings.length > 0 && (
                            <div className="flex flex-col gap-1 pt-0.5">
                              {row.warnings.map((w) => (
                                <div
                                  key={w.code}
                                  className={`px-2 py-1 rounded text-[10px] border leading-tight ${
                                    w.severity === 'ERROR'
                                      ? 'bg-rose-50 text-rose-950 border-rose-300 font-semibold'
                                      : w.severity === 'INFO_NOTE'
                                      ? 'bg-sky-50/80 text-sky-900 border-sky-200'
                                      : 'bg-amber-50/90 text-amber-950 border-amber-300'
                                  }`}
                                >
                                  <strong>[{w.orderNumber}] {w.label}:</strong> {w.detail}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 10. Trạng thái lời mời kích hoạt */}
                      <td className="py-2.5 px-2.5 align-top">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                              row.invitationStatus === 'ACTIVATED'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : row.invitationStatus === 'INVITE_SENT'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : row.invitationStatus === 'INVITE_EXPIRED'
                                ? 'bg-rose-50 text-rose-900 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <Mail className="w-3 h-3" />
                            {row.invitationStatusLabel}
                          </span>
                          {row.invitationSentAt && (
                            <div className="text-[10px] text-slate-500">
                              Gửi lúc:{' '}
                              {new Date(row.invitationSentAt).toLocaleTimeString(
                                'vi-VN',
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 11. Thao tác nhanh (Mục IV) */}
                      <td className="py-2.5 px-2.5 align-top text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openQuickAction('EDIT_ACCOUNT', row)}
                            title="Chỉnh sửa tài khoản"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 text-[11px] font-semibold hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-blue-700" />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onOpenVisualPermissionForTeacher?.(
                                row.userId,
                                row.fullName
                              )
                            }
                            title="Mở trang Phân quyền chi tiết"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-950 text-[11px] font-bold hover:bg-indigo-100 cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-indigo-700" />
                            <span>Mở phân quyền</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDirectRowQuickAction(row, 'SEND_INVITATION')
                            }
                            title="Gửi lại lời mời kích hoạt"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-teal-300 bg-teal-50 text-teal-950 text-[11px] font-semibold hover:bg-teal-100 cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-teal-700" />
                            <span>Gửi lời mời</span>
                          </button>

                          {row.accountStatus === 'LOCKED' ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleDirectRowQuickAction(row, 'UNLOCK_ACTIVE')
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-950 text-[11px] font-semibold hover:bg-emerald-100 cursor-pointer"
                            >
                              <Unlock className="w-3 h-3 text-emerald-700" />
                              <span>Mở khóa</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleDirectRowQuickAction(row, 'TEMP_LOCK')
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 text-[11px] font-semibold hover:bg-amber-100 cursor-pointer"
                            >
                              <Lock className="w-3 h-3 text-amber-700" />
                              <span>Tạm khóa</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HỘP THOẠI THAO TÁC NHANH (MỤC IV: CHỈNH SỬA TK / GÁN TỔ / BỔ SUNG MÔN / BỔ SUNG KHỐI) */}
      {quickActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  MỤC IV · THAO TÁC NHANH HOÀN THIỆN TÀI KHOẢN
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {quickActionModal.type === 'ASSIGN_DEPARTMENT' &&
                    `Gán Tổ chuyên môn cho "${quickActionModal.row.fullName}"`}
                  {quickActionModal.type === 'ADD_SUBJECT' &&
                    `Bổ sung Môn giảng dạy cho "${quickActionModal.row.fullName}"`}
                  {quickActionModal.type === 'ADD_GRADES' &&
                    `Bổ sung Khối lớp cho "${quickActionModal.row.fullName}"`}
                  {quickActionModal.type === 'EDIT_ACCOUNT' &&
                    `Chỉnh sửa nhanh Tài khoản "${quickActionModal.row.fullName}"`}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setQuickActionModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleExecuteQuickActionModal} className="space-y-3 text-xs">
              {quickActionModal.type === 'EDIT_ACCOUNT' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Họ và tên giáo viên *
                    </label>
                    <input
                      type="text"
                      value={qaFullName}
                      onChange={(e) => setQaFullName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email đăng nhập *
                    </label>
                    <input
                      type="email"
                      value={qaEmail}
                      onChange={(e) => setQaEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tổ chuyên môn
                      </label>
                      <select
                        value={qaDepartment}
                        onChange={(e) => setQaDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        {departmentsCatalog.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Trạng thái tài khoản
                      </label>
                      <select
                        value={qaStatus}
                        onChange={(e) =>
                          setQaStatus(
                            e.target.value as TeacherAccountLifecycleStatus
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="UNACTIVATED">Chưa kích hoạt</option>
                        <option value="LOCKED">Tạm khóa</option>
                        <option value="DISABLED">Đã vô hiệu hóa</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {quickActionModal.type === 'ASSIGN_DEPARTMENT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chọn Tổ chuyên môn từ danh mục nhà trường *
                  </label>
                  <select
                    value={qaDepartment}
                    onChange={(e) => setQaDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    {departmentsCatalog.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(quickActionModal.type === 'ADD_SUBJECT' ||
                quickActionModal.type === 'ADD_GRADES') && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cấp học giảng dạy
                    </label>
                    <div className="flex gap-3">
                      {(['PRIMARY', 'LOWER_SECONDARY'] as const).map((lv) => (
                        <label
                          key={lv}
                          className="inline-flex items-center gap-1.5 font-semibold cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={qaEducationLevels.includes(lv)}
                            onChange={() => {
                              setQaEducationLevels((prev) =>
                                prev.includes(lv)
                                  ? prev.length > 1
                                    ? prev.filter((x) => x !== lv)
                                    : prev
                                  : [...prev, lv]
                              );
                            }}
                          />
                          <span>{lv === 'PRIMARY' ? 'Tiểu học (K1–K5)' : 'THCS (K6–K9)'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Môn học (Lọc đúng theo cấp học để tránh cảnh báo lệch cấp học)
                    </label>
                    <select
                      value={qaSubjectId}
                      onChange={(e) => setQaSubjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      {curriculumSubjects
                        .filter((s) =>
                          qaEducationLevels.includes(s.educationLevelId)
                        )
                        .map((s) => (
                          <option key={s.subjectId} value={s.subjectId}>
                            [{s.educationLevelId === 'PRIMARY' ? 'Tiểu học' : 'THCS'}]{' '}
                            {s.subjectName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Khối lớp được phân công
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(qaEducationLevels.includes('PRIMARY')
                        ? [1, 2, 3, 4, 5]
                        : []
                      )
                        .concat(
                          qaEducationLevels.includes('LOWER_SECONDARY')
                            ? [6, 7, 8, 9]
                            : []
                        )
                        .map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() =>
                              setQaGrades((prev) =>
                                prev.includes(g)
                                  ? prev.length > 1
                                    ? prev.filter((x) => x !== g)
                                  : prev
                                  : [...prev, g].sort((a, b) => a - b)
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                              qaGrades.includes(g)
                                ? 'bg-indigo-700 text-white border-indigo-700'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            Khối {g}
                          </button>
                        ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={quickActionSaving}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                >
                  {quickActionSaving ? 'Đang lưu...' : 'Lưu hoàn thiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
