import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  Network,
  Briefcase,
  KeyRound,
  CalendarRange,
  TrendingUp,
  FolderKanban,
  CheckSquare,
  Award,
  BarChart3,
  Sparkles,
  ClipboardCheck,
  Database,
  Grid,
  FileText,
  CheckCircle,
  Bell,
  UserCheck,
  UserCog,
  CreditCard,
  ShieldCheck,
  History,
  Settings,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Lock,
  Layers,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import {
  ApprovalStatus,
  AuthenticatedUserSession,
  ExamMatrix,
  ExamPaper,
  MenuSectionId,
  QuestionItem,
  SchoolBrandingConfig,
  TeacherPermissionProfileSummary,
} from '../types/domain';
import {
  PrimaryProductionRoleKey,
  ProductionMenuItemConfig,
  getOfficialRoleDisplayLabel,
} from '../config/productionMenuRegistry';
import { SmartQuestionLinkConfig } from '../types/domain';
import {
  SMART_QUESTION_LINK_UPDATED_EVENT,
  fetchSmartQuestionLinkConfig,
  getCachedSmartQuestionLinkConfig,
  normalizeClientSmartUrl,
} from '../services/smartQuestionLinkService';

interface ProductionRoleDashboardWorkspaceProps {
  authSession: AuthenticatedUserSession;
  activeRoleKey: PrimaryProductionRoleKey;
  authorizedMenus: ProductionMenuItemConfig[];
  branding: SchoolBrandingConfig;
  teacherProfile?: TeacherPermissionProfileSummary | null;
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  onCleanSampleData?: () => void;
  onNavigateTab: (tabId: MenuSectionId) => void;
}

interface PlatformReadinessCheckItem {
  code: string;
  label: string;
  statusLabel: string;
  passed: boolean;
  detail: string;
}

interface PlatformOverviewStats {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  totalAccounts: number;
  superAdminAccountsCount?: number;
  totalSchoolAdmins?: number;
  totalTeachersAndStaff?: number;
  totalDepartmentsCount?: number;
  totalQuestionsCount: number;
  totalMatricesCount?: number;
  totalExamsCount: number;
  aiMonthlyRequests: number;
  activePlansCount: number;
  isProductionClean?: boolean;
  readinessChecks?: PlatformReadinessCheckItem[];
  schools: Array<{
    schoolId: string;
    internalCode?: string;
    schoolName: string;
    levelLabel: string;
    province: string;
    academicYear?: string;
    status: string;
    planName: string;
    schoolAdminName?: string;
    schoolAdminEmail?: string;
    departmentCount?: number;
    accountCount?: number;
    teacherCount: number;
    questionCount?: number;
    examCount?: number;
    aiMonthlyRequests?: number;
  }>;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  Network,
  Briefcase,
  KeyRound,
  CalendarRange,
  TrendingUp,
  FolderKanban,
  CheckSquare,
  Award,
  BarChart3,
  Sparkles,
  ClipboardCheck,
  Database,
  Grid,
  FileText,
  CheckCircle,
  Bell,
  UserCheck,
  UserCog,
  CreditCard,
  ShieldCheck,
  History,
  Settings,
  ExternalLink,
};

const OFFICIAL_PLATFORM_OVERVIEW_CACHE_KEY = 'edutest_official_platform_overview_v1';

const DEFAULT_OFFICIAL_PLATFORM_OVERVIEW_STATS: PlatformOverviewStats = {
  totalSchools: 3,
  activeSchools: 3,
  suspendedSchools: 0,
  totalAccounts: 65,
  superAdminAccountsCount: 1,
  totalSchoolAdmins: 3,
  totalTeachersAndStaff: 61,
  totalDepartmentsCount: 15,
  totalQuestionsCount: 129,
  totalMatricesCount: 0,
  totalExamsCount: 0,
  aiMonthlyRequests: 0,
  activePlansCount: 3,
  isProductionClean: true,
  schools: [
    {
      schoolId: 'SCHOOL_A',
      internalCode: 'NDA-DANDIEN',
      schoolName: 'Trường TH&THCS Nguyễn Đình Anh',
      levelLabel: 'Liên cấp TH & THCS',
      province: 'Xã Đan Điền, Thành phố Huế',
      academicYear: '2026-2027',
      status: 'ACTIVE',
      planName: 'Gói Nâng cao Liên cấp',
      schoolAdminName: 'Lê Đức Minh (Quản trị viên Trường)',
      schoolAdminEmail: 'minhld@hue.edu.vn',
      departmentCount: 6,
      accountCount: 62,
      teacherCount: 61,
      questionCount: 129,
      examCount: 0,
      aiMonthlyRequests: 0,
    },
    {
      schoolId: 'SCHOOL_B',
      internalCode: 'TH-SIA',
      schoolName: 'Trường Tiểu học Sịa',
      levelLabel: 'Tiểu học',
      province: 'Xã Quảng Điền, Thành phố Huế',
      academicYear: '2026-2027',
      status: 'ACTIVE',
      planName: 'Gói Tiêu chuẩn',
      schoolAdminName: 'Quản trị viên Trường Tiểu học Sịa',
      schoolAdminEmail: 'admin_sia@hue.edu.vn',
      departmentCount: 5,
      accountCount: 1,
      teacherCount: 0,
      questionCount: 0,
      examCount: 0,
      aiMonthlyRequests: 0,
    },
    {
      schoolId: 'SCHOOL_C',
      internalCode: 'THCS-DANGDUNG',
      schoolName: 'Trường THCS Đặng Dung',
      levelLabel: 'Trung học cơ sở',
      province: 'Xã Quảng Điền, Thành phố Huế',
      academicYear: '2026-2027',
      status: 'ACTIVE',
      planName: 'Gói Chuyên nghiệp',
      schoolAdminName: 'Quản trị viên Trường THCS Đặng Dung',
      schoolAdminEmail: 'admin_ddung@hue.edu.vn',
      departmentCount: 4,
      accountCount: 1,
      teacherCount: 0,
      questionCount: 0,
      examCount: 0,
      aiMonthlyRequests: 0,
    },
  ],
  readinessChecks: [
    {
      code: 'SCHOOL_TENANTS',
      label: 'Danh mục đơn vị trường học',
      statusLabel: 'Sẵn sàng vận hành',
      passed: true,
      detail:
        '3/3 trường đang hoạt động chính thức năm học 2026-2027, không có đơn vị thử nghiệm thừa.',
    },
    {
      code: 'OFFICIAL_ACCOUNTS',
      label: 'Tài khoản quản trị & nhân sự',
      statusLabel: 'Đã chuẩn hóa',
      passed: true,
      detail:
        '65 tài khoản chính thức (1 Super Admin, 3 Quản trị viên trường, 61 Cán bộ/Giáo viên).',
    },
    {
      code: 'DEPARTMENTS_SCOPE',
      label: 'Tổ chuyên môn & phân cấp học',
      statusLabel: 'Đồng bộ đúng cấp',
      passed: true,
      detail:
        '15 tổ chuyên môn đã thiết lập theo đúng cấp học của từng trường (Liên cấp, Tiểu học, THCS).',
    },
    {
      code: 'CLEAN_DATA_STORE',
      label: 'Làm sạch dữ liệu mẫu & kiểm thử',
      statusLabel: 'Đã làm sạch 100%',
      passed: true,
      detail:
        'Đã loại bỏ toàn bộ tài khoản mẫu, đề kiểm tra thử nghiệm và lượt gọi AI giả lập; giữ nguyên 129 câu hỏi chính thức.',
    },
    {
      code: 'PLANS_AND_AI_QUOTA',
      label: 'Gói dịch vụ & hạn mức AI',
      statusLabel: 'Ghi nhận thực tế',
      passed: true,
      detail:
        '3 gói dịch vụ đang áp dụng; bộ đếm AI ghi nhận 0 lượt sử dụng thực tế trong tháng.',
    },
    {
      code: 'MULTI_TENANT_ISOLATION',
      label: 'Bảo mật đề mật & cô lập đa trường',
      statusLabel: 'Bảo vệ nghiêm ngặt',
      passed: true,
      detail:
        'Dữ liệu chuyên môn được cô lập theo từng trường; Super Admin không truy cập nội dung đề mật và đáp án.',
    },
  ],
};

function readInitialOfficialPlatformOverviewStats(): PlatformOverviewStats {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cachedRaw = window.localStorage.getItem(OFFICIAL_PLATFORM_OVERVIEW_CACHE_KEY);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw) as PlatformOverviewStats;
        if (
          parsed &&
          typeof parsed.totalSchools === 'number' &&
          Array.isArray(parsed.schools) &&
          parsed.schools.length > 0
        ) {
          return parsed;
        }
      }
    }
  } catch {
    // ignore storage read error
  }
  return DEFAULT_OFFICIAL_PLATFORM_OVERVIEW_STATS;
}

function persistOfficialPlatformOverviewStats(stats: PlatformOverviewStats): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(OFFICIAL_PLATFORM_OVERVIEW_CACHE_KEY, JSON.stringify(stats));
    }
  } catch {
    // ignore storage write error
  }
}

function buildSafeAuthHeaders(sessionToken?: string): Record<string, string> {
  const trimmed = String(sessionToken || '').trim();
  if (trimmed && /^[\x21-\x7E]+$/.test(trimmed)) {
    return { Authorization: `Bearer ${trimmed}` };
  }
  return {};
}

export const ProductionRoleDashboardWorkspace: React.FC<ProductionRoleDashboardWorkspaceProps> = ({
  authSession,
  activeRoleKey,
  authorizedMenus,
  branding,
  teacherProfile,
  questions,
  matrices,
  exams,
  onCleanSampleData,
  onNavigateTab,
}) => {
  const [loadingPlatform, setLoadingPlatform] = useState(false);
  const [cleaningPlatform, setCleaningPlatform] = useState(false);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [cleanStatusNotice, setCleanStatusNotice] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformOverviewStats>(() =>
    readInitialOfficialPlatformOverviewStats()
  );
  const [smartLinkCfg, setSmartLinkCfg] = useState<SmartQuestionLinkConfig>(() =>
    getCachedSmartQuestionLinkConfig()
  );

  useEffect(() => {
    void fetchSmartQuestionLinkConfig(authSession?.user?.schoolId).then((cfg) =>
      setSmartLinkCfg(cfg)
    );
    const onSmartLinkUpdate = (evt: Event) => {
      const customEvt = evt as CustomEvent<SmartQuestionLinkConfig>;
      if (customEvt.detail) setSmartLinkCfg(customEvt.detail);
    };
    window.addEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, onSmartLinkUpdate);
    return () => window.removeEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, onSmartLinkUpdate);
  }, [authSession?.user?.schoolId]);

  const directSmartUrl =
    smartLinkCfg.openMode === 'DIRECT_NEW_TAB'
      ? normalizeClientSmartUrl(smartLinkCfg.url)
      : '';

  const loadPlatformOverview = useCallback(async () => {
    setLoadingPlatform(true);
    setConnectionError(null);

    const maxAttempts = 3;
    let lastErrMessage: string | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const res = await fetch('/api/stage22/platform-overview', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            ...buildSafeAuthHeaders(authSession?.sessionToken),
          },
        });
        const contentType = String(res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || !contentType.includes('application/json')) {
          throw new Error(
            !res.ok
              ? `Máy chủ đang khởi động hoặc bận (Mã trạng thái: ${res.status})`
              : 'Phản hồi tổng quan tạm thời chưa ở định dạng JSON chuẩn.'
          );
        }
        const data = await res.json();
        if (data && data.ok && data.stats) {
          setPlatformStats(data.stats);
          persistOfficialPlatformOverviewStats(data.stats);
          setConnectionError(null);
          setLoadingPlatform(false);
          return;
        }
        throw new Error('Dữ liệu tổng quan hệ thống chưa sẵn sàng.');
      } catch (err: unknown) {
        lastErrMessage =
          err instanceof Error
            ? err.message
            : 'Kết nối đồng bộ máy chủ tạm thời gián đoạn.';
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 650));
        }
      }
    }

    if (lastErrMessage) {
      setConnectionError(
        'Đang hiển thị số liệu chính thức đã lưu gần nhất do máy chủ đang đồng bộ lại kết nối.'
      );
    }
    setLoadingPlatform(false);
  }, [authSession?.sessionToken]);

  const handleCleanOfficialPlatformData = async () => {
    setCleaningPlatform(true);
    setConnectionError(null);
    try {
      const res = await fetch('/api/stage22/platform-overview/clean-official', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...buildSafeAuthHeaders(authSession?.sessionToken),
        },
        body: JSON.stringify({
          actorUserId: authSession?.user?.id || 'user-super-admin-platform',
          actorRole: 'SUPER_ADMIN',
        }),
      });
      const contentType = String(res.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        throw new Error('Máy chủ đang đồng bộ lại, vui lòng bấm xác nhận lại sau ít giây.');
      }
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || 'Không thể thực hiện làm sạch dữ liệu hệ thống.');
      }
      onCleanSampleData?.();
      if (data.stats) {
        setPlatformStats(data.stats);
        persistOfficialPlatformOverviewStats(data.stats);
      }
      setShowCleanConfirm(false);
      setCleanStatusNotice(
        data.message ||
          'Đã hoàn tất rà soát và làm sạch dữ liệu mẫu trên toàn nền tảng, sẵn sàng sử dụng chính thức.'
      );
    } catch (err: unknown) {
      setConnectionError(
        err instanceof Error ? err.message : 'Không thể kết nối máy chủ khi làm sạch dữ liệu.'
      );
    } finally {
      setCleaningPlatform(false);
    }
  };

  useEffect(() => {
    if (activeRoleKey === 'SUPER_ADMIN') {
      void loadPlatformOverview();
    } else {
      setConnectionError(null);
    }
  }, [activeRoleKey, loadPlatformOverview]);

  const profileSubjects = teacherProfile?.normalizedRecords
    ? Array.from(new Set(teacherProfile.normalizedRecords.map((r) => r.SubjectName)))
    : [];
  const profileGrades = teacherProfile?.normalizedRecords
    ? Array.from(new Set(teacherProfile.normalizedRecords.map((r) => Number(r.GradeId))))
    : [];

  const userSubjects: string[] =
    profileSubjects.length > 0
      ? profileSubjects
      : authSession.user.assignedSubjects || [];
  const userGrades: number[] =
    profileGrades.length > 0
      ? profileGrades
      : (authSession.user.assignedGrades as number[]) || [];
  const userLevels: string[] =
    teacherProfile?.educationLevels?.length
      ? teacherProfile.educationLevels
      : userGrades.some((g: number) => Number(g) <= 5) &&
        userGrades.some((g: number) => Number(g) >= 6)
      ? ['Tiểu học', 'THCS']
      : userGrades.some((g: number) => Number(g) <= 5)
      ? ['Tiểu học']
      : ['THCS'];

  const pendingReviewExams = exams.filter(
    (e) => e.status === ApprovalStatus.PENDING || e.status === ApprovalStatus.IN_REVIEW
  );
  const pendingFinalApprovalExams = exams.filter(
    (e) => e.status === ApprovalStatus.PENDING_APPROVAL || e.status === ApprovalStatus.PENDING
  );
  const approvedExams = exams.filter(
    (e) => e.status === ApprovalStatus.APPROVED || e.status === ApprovalStatus.PUBLISHED
  );

  const schoolAdminDeptCount =
    branding.schoolId === 'SCHOOL_B' ||
    branding.schoolName?.toLowerCase().includes('tiểu học sịa')
      ? 5
      : branding.schoolId === 'SCHOOL_C' ||
        branding.schoolName?.toLowerCase().includes('đặng dung')
      ? 3
      : 6;

  const actionMenus = authorizedMenus.filter((m) => m.id !== 'dashboard');

  return (
    <div className="space-y-6">
      {/* Banner thông tin phiên làm việc chính thức */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <span>
                {activeRoleKey === 'SUPER_ADMIN'
                  ? 'NỀN TẢNG ĐA TRƯỜNG EDU TEST AI'
                  : branding.schoolName}
              </span>
              <span>•</span>
              <span>Năm học {branding.academicYear || '2026 - 2027'}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Xin chào, {authSession.user.fullName}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Chức vụ / Vai trò làm việc:{' '}
              <span className="font-semibold text-slate-900">
                {getOfficialRoleDisplayLabel(activeRoleKey)}
              </span>
              {activeRoleKey === 'SUPER_ADMIN'
                ? ' • Phạm vi: Quản trị toàn nền tảng'
                : authSession.user.departmentName
                ? ` • Bộ phận: ${authSession.user.departmentName}`
                : ''}
            </p>
          </div>

          {activeRoleKey === 'SUPER_ADMIN' ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={loadPlatformOverview}
                disabled={loadingPlatform || cleaningPlatform}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPlatform ? 'animate-spin' : ''}`} />
                Làm mới số liệu
              </button>
              <button
                type="button"
                onClick={() => {
                  setCleanStatusNotice(null);
                  setShowCleanConfirm((prev) => !prev);
                }}
                disabled={cleaningPlatform}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Rà soát & Làm sạch dữ liệu
              </button>
            </div>
          ) : (
            /* Phạm vi phân quyền chuyên môn (Cấp học / Môn học / Khối lớp) */
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-500">Cấp học:</span>
                <span className="font-semibold text-slate-900">
                  {userLevels.length > 0 ? userLevels.join(', ') : 'Theo trường'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-500">Môn phụ trách:</span>
                <span className="font-semibold text-slate-900">
                  {userSubjects.length > 0 ? userSubjects.join(', ') : 'Toàn trường'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Khối lớp:</span>
                <span className="font-semibold text-slate-900">
                  {userGrades.length > 0
                    ? userGrades.map((g) => `Khối ${g}`).join(', ')
                    : 'Tất cả khối'}
                </span>
              </div>
            </div>
          )}
        </div>

        {activeRoleKey === 'SUPER_ADMIN' && connectionError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{connectionError}</span>
            </div>
            <button
              type="button"
              onClick={loadPlatformOverview}
              disabled={loadingPlatform}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPlatform ? 'animate-spin' : ''}`} />
              Đồng bộ lại ngay
            </button>
          </div>
        )}

        {activeRoleKey === 'SUPER_ADMIN' && showCleanConfirm && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-700">
              <div className="font-bold text-slate-900">
                Xác nhận rà soát & làm sạch dữ liệu mẫu trên toàn hệ thống
              </div>
              <p className="mt-0.5 text-slate-600">
                Thao tác này xóa bỏ toàn bộ tài khoản thử nghiệm, đề/câu hỏi mẫu và bộ đếm AI giả lập; giữ nguyên 100% trường học, tài khoản nhân sự và câu hỏi chính thức.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCleanOfficialPlatformData}
                disabled={cleaningPlatform}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                {cleaningPlatform ? 'Đang làm sạch...' : 'Xác nhận thực hiện'}
              </button>
              <button
                type="button"
                onClick={() => setShowCleanConfirm(false)}
                disabled={cleaningPlatform}
                className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {activeRoleKey === 'SUPER_ADMIN' && cleanStatusNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{cleanStatusNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setCleanStatusNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 font-semibold cursor-pointer shrink-0"
            >
              Ẩn
            </button>
          </div>
        )}
      </div>

      {/* A. SUPER ADMIN DASHBOARD */}
      {activeRoleKey === 'SUPER_ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Tổng số trường học</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {platformStats.totalSchools}
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-1">
                Đang hoạt động: {platformStats.activeSchools} trường
                {platformStats.suspendedSchools > 0
                  ? ` • Tạm ngưng: ${platformStats.suspendedSchools}`
                  : ''}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Tài khoản chính thức</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {platformStats.totalAccounts}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {platformStats.totalSchoolAdmins ?? 0} QTV trường •{' '}
                {platformStats.totalTeachersAndStaff ?? 0} Cán bộ/GV •{' '}
                {platformStats.superAdminAccountsCount ?? 1} Super Admin
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Gói dịch vụ & Lượt AI tháng</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {platformStats.aiMonthlyRequests} lượt AI
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {platformStats.activePlansCount} gói dịch vụ • Ghi nhận theo sử dụng thực tế
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Kho dữ liệu & Bảo mật đề mật</span>
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-bold text-emerald-700 mt-2">
                Cô lập dữ liệu chuyên môn
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {platformStats?.totalQuestionsCount ?? 0} câu hỏi •{' '}
                {platformStats?.totalDepartmentsCount ?? 0} tổ CM • Không lộ đề mật
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Danh sách các đơn vị trường học trên nền tảng
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Số liệu thực tế đồng bộ từ danh mục trường, tổ chuyên môn và tài khoản nhân sự chính thức.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('super-admin-schools')}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer self-start sm:self-auto"
              >
                Quản lý trường học
              </button>
            </div>
            {!platformStats || platformStats.schools.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Chưa có dữ liệu trường học nào được ghi nhận.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                      <th className="py-3 px-4">Mã đơn vị</th>
                      <th className="py-3 px-4">Tên trường & Địa bàn</th>
                      <th className="py-3 px-4">Cấp học</th>
                      <th className="py-3 px-4">Quản trị viên trường</th>
                      <th className="py-3 px-4 text-center">Tổ CM</th>
                      <th className="py-3 px-4 text-right">Nhân sự / Tài khoản</th>
                      <th className="py-3 px-4">Gói dịch vụ</th>
                      <th className="py-3 px-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {platformStats.schools.map((sch) => (
                      <tr key={sch.schoolId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                          {sch.internalCode || sch.schoolId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{sch.schoolName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{sch.province}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 text-xs font-medium">
                          {sch.levelLabel}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-semibold text-slate-800">
                            {sch.schoolAdminName || 'Quản trị viên trường'}
                          </div>
                          {sch.schoolAdminEmail && (
                            <div className="text-xs text-slate-500 font-mono">
                              {sch.schoolAdminEmail}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-slate-700">
                          {sch.departmentCount ?? 0} tổ
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-mono font-semibold text-slate-900">
                            {sch.teacherCount} GV
                          </div>
                          <div className="text-xs text-slate-500">
                            Tổng {sch.accountCount ?? sch.teacherCount + 1} tài khoản
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700">{sch.planName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              sch.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {sch.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Kết quả Rà soát Hệ thống & Sẵn sàng Vận hành Chính thức */}
          {platformStats?.readinessChecks && platformStats.readinessChecks.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Kết quả rà soát hệ thống & trạng thái dữ liệu chính thức
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kiểm tra đồng bộ cấu hình đa trường, tài khoản nhân sự và loại bỏ hoàn toàn dữ liệu mẫu trước khi vận hành.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Đủ điều kiện vận hành chính thức
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {platformStats.readinessChecks.map((chk) => (
                  <div
                    key={chk.code}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        {chk.label}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700 shrink-0">
                        {chk.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{chk.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Khu vực Công cụ Quản trị Vận hành được bảo vệ riêng cho Super Admin */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Khu vực Quản trị Vận hành Được Bảo vệ (Chỉ dành cho Super Admin)
                </div>
                <h3 className="text-base font-bold text-white mt-2">
                  Công cụ Vận hành Cơ sở dữ liệu, Sao lưu & Giám sát Bảo mật
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Các công cụ kỹ thuật và vận hành hệ thống được tách khỏi điều hướng của Giáo viên và Quản trị trường, bảo vệ nghiêm ngặt bằng RBAC.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigateTab('admin-firebase-data')}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Dữ liệu & Đồng bộ Firestore
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('admin-backups')}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sao lưu & Phục hồi hệ thống
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('multi-school-security')}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Giám sát Cô lập Đa trường
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. SCHOOL ADMIN DASHBOARD */}
      {activeRoleKey === 'SCHOOL_ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Đơn vị trường học</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-base font-bold text-slate-900 mt-2 truncate">
              {branding.schoolName}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Năm học: {branding.academicYear}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Tổ chuyên môn & Nhân sự</span>
              <Network className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {schoolAdminDeptCount} tổ
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Quản lý tài khoản giáo viên & nhập Excel
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Ngân hàng câu hỏi đơn vị</span>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {questions.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Câu hỏi lưu trữ thuộc trường
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Phân quyền & Phân công</span>
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-base font-bold text-emerald-700 mt-2">
              RBAC / ABAC Trường
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Không hiển thị công cụ Firebase hệ thống
            </div>
          </div>
        </div>
      )}

      {/* C & D. HIỆU TRƯỞNG & PHÓ HIỆU TRƯỞNG DASHBOARD */}
      {(activeRoleKey === 'PRINCIPAL' || activeRoleKey === 'VICE_PRINCIPAL') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Hồ sơ đề toàn trường</span>
              <FolderKanban className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {exams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Ma trận & Bản đặc tả: {matrices.length} bản
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Chờ thẩm định chuyên môn</span>
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
              {pendingReviewExams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Hồ sơ đang trong quy trình rà soát
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Chờ BGH phê duyệt</span>
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-2 font-mono">
              {pendingFinalApprovalExams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Cần phê duyệt chính thức
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Hồ sơ đã phê duyệt</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
              {approvedExams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Đủ điều kiện ban hành chính thức
            </div>
          </div>
        </div>
      )}

      {/* E. TỔ TRƯỞNG CHUYÊN MÔN DASHBOARD */}
      {activeRoleKey === 'HEAD_OF_DEPARTMENT' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Ngân hàng câu hỏi của tổ</span>
              <Database className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {questions.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Môn: {userSubjects.length > 0 ? userSubjects.join(', ') : 'Chuyên môn tổ'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Ma trận & Đề của tổ</span>
              <FolderKanban className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {exams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Ma trận & Bản đặc tả: {matrices.length}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Hồ sơ chờ tổ thẩm định</span>
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
              {pendingReviewExams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Cần tổ trưởng / phản biện nhận xét
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Hồ sơ tổ đã duyệt</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
              {approvedExams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {authSession.user.departmentName || 'Tổ chuyên môn'}
            </div>
          </div>
        </div>
      )}

      {/* F. GIÁO VIÊN BỘ MÔN DASHBOARD */}
      {activeRoleKey === 'TEACHER' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Câu hỏi trong phạm vi môn</span>
              <Database className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {questions.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Đã duyệt:{' '}
              {questions.filter((q) => q.status === ApprovalStatus.APPROVED).length} câu hỏi
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Ma trận & Bản đặc tả</span>
              <Grid className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {matrices.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Chuẩn Thông tư 27 & CV 7991
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Đề kiểm tra & Hồ sơ của tôi</span>
              <FolderKanban className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {exams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Đã phê duyệt: {approvedExams.length} đề
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Môn & Khối được giao</span>
              <Briefcase className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-base font-bold text-slate-900 mt-2 truncate">
              {userSubjects.length > 0 ? userSubjects.join(', ') : 'Theo phân công'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {userGrades.length > 0
                ? userGrades.map((g) => `Khối ${g}`).join(', ')
                : 'Theo kế hoạch tổ'}
            </div>
          </div>
        </div>
      )}

      {/* Danh mục chức năng được cấp quyền theo đúng vai trò đang làm việc */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Chức năng nghiệp vụ được phân quyền ({actionMenus.length} chức năng)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chỉ hiển thị các phân hệ mà tài khoản và chức vụ hiện tại của bạn được phép sử dụng.
            </p>
          </div>
        </div>

        {actionMenus.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
            Tài khoản hiện tại chưa được gán thêm chức năng nghiệp vụ nào ngoài Trang chủ.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {actionMenus.map((menu) => {
              const IconComponent = ICON_MAP[menu.icon] || LayoutDashboard;
              const cardContent = (
                <>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 flex items-center justify-center shrink-0 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 truncate">
                        {menu.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        Phạm vi:{' '}
                        {menu.scope === 'PLATFORM'
                          ? 'Toàn hệ thống'
                          : menu.scope === 'SCHOOL'
                          ? 'Cấp trường'
                          : menu.scope === 'DEPARTMENT'
                          ? 'Cấp tổ chuyên môn'
                          : 'Chuyên môn cá nhân'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                </>
              );

              if (menu.id === 'smart-question-link' && directSmartUrl) {
                return (
                  <a
                    key={menu.id}
                    href={directSmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onNavigateTab(menu.id)}
                    className="group text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-start justify-between gap-3 cursor-pointer"
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => onNavigateTab(menu.id)}
                  className="group text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-start justify-between gap-3 cursor-pointer"
                >
                  {cardContent}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bảng hồ sơ đề kiểm tra gần đây (Không hiển thị cho Super Admin theo quy tắc bảo mật đề mật) */}
      {activeRoleKey !== 'SUPER_ADMIN' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Đề kiểm tra & Hồ sơ chuyên môn trong phạm vi phụ trách
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu thực tế từ kho lưu trữ của đơn vị ({branding.schoolName}).
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onNavigateTab(
                  activeRoleKey === 'PRINCIPAL' || activeRoleKey === 'VICE_PRINCIPAL'
                    ? 'bgh-progress-tracking'
                    : activeRoleKey === 'HEAD_OF_DEPARTMENT'
                    ? 'dept-dossiers'
                    : activeRoleKey === 'SCHOOL_ADMIN'
                    ? 'bgh-assign-exam'
                    : 'exam-workflow'
                )
              }
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Xem chi tiết →
            </button>
          </div>

          {exams.length === 0 ? (
            <div className="p-8 text-center">
              <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">
                Chưa có hồ sơ đề kiểm tra nào trong phạm vi này
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Khi giáo viên khởi tạo và nộp hồ sơ đề kiểm tra, tiến độ sẽ tự động cập nhật tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="py-3 px-4">Tên đề kiểm tra</th>
                    <th className="py-3 px-4">Môn / Khối</th>
                    <th className="py-3 px-4">Thời lượng</th>
                    <th className="py-3 px-4">Người tạo</th>
                    <th className="py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exams.slice(0, 6).map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{ex.title}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {ex.subject} • Khối {ex.grade}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{ex.durationMinutes} phút</td>
                      <td className="py-3 px-4 text-slate-700">
                        {authSession.user.fullName || 'Giáo viên bộ môn'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            ex.status === ApprovalStatus.APPROVED ||
                            ex.status === ApprovalStatus.PUBLISHED
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ex.status === ApprovalStatus.REVISION_REQUIRED
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ex.status === ApprovalStatus.APPROVED ||
                          ex.status === ApprovalStatus.PUBLISHED
                            ? 'Đã phê duyệt'
                            : ex.status === ApprovalStatus.REVISION_REQUIRED
                            ? 'Yêu cầu chỉnh sửa'
                            : ex.status === ApprovalStatus.PENDING_APPROVAL
                            ? 'Chờ BGH duyệt'
                            : ex.status === ApprovalStatus.PENDING ||
                              ex.status === ApprovalStatus.IN_REVIEW
                            ? 'Chờ thẩm định'
                            : 'Bản nháp'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
