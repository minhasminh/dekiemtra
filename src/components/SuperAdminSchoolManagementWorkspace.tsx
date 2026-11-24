import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Sparkles,
  FileCheck2,
  Plus,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Play,
  RefreshCw,
  ArrowRightLeft,
  UserPlus,
  Search,
  Filter,
  Activity,
  HelpCircle,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useSchoolContext } from '../contexts/SchoolContext';
import { SchoolAdminWorkspace } from './SchoolAdminWorkspace';

interface SchoolItem {
  id: string;
  code: string;
  name: string;
  educationLevel: 'PRIMARY' | 'LOWER_SECONDARY' | 'PRIMARY_AND_LOWER_SECONDARY';
  province: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  governingBody: string;
  currentAcademicYear: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  servicePlan: 'BASIC' | 'STANDARD' | 'ENTERPRISE';
  enabledFeatures: string[];
  aiQuotaMonthly: number;
  aiUsedThisMonth: number;
  maxTeacherAccounts: number;
  currentAccountCount: number;
  totalQuestionsCount: number;
  totalExamDossiersCount: number;
  schoolAdminUserId?: string;
  schoolAdminEmail?: string;
  schoolAdminName?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardTotals {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  deactivatedSchools: number;
  totalAccounts: number;
  totalQuestions: number;
  totalExamDossiers: number;
  totalAiRequestsThisMonth: number;
  totalAiQuotaMonthly: number;
}

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  PRIMARY: 'Tiểu học',
  LOWER_SECONDARY: 'THCS',
  PRIMARY_AND_LOWER_SECONDARY: 'Liên cấp TH & THCS',
};

const SERVICE_PLAN_LABELS: Record<string, string> = {
  BASIC: 'Cơ bản (BASIC)',
  STANDARD: 'Tiêu chuẩn (STANDARD)',
  ENTERPRISE: 'Toàn diện (ENTERPRISE)',
};

const AVAILABLE_FEATURES = [
  { code: 'MATRIX_BUILDER', label: 'Ma trận & Bản đặc tả (CV 7991)' },
  { code: 'AI_GENERATOR', label: 'Sinh câu hỏi & Gợi ý bằng AI' },
  { code: 'QUESTION_BANK', label: 'Ngân hàng Câu hỏi Chuẩn hóa' },
  { code: 'DOSSIER_WORKFLOW', label: 'Quy trình Thẩm định & Phê duyệt Hồ sơ' },
  { code: 'WORD_EXPORT', label: 'Xuất Hồ sơ Word (.docx) Chuẩn Mẫu Bộ' },
  { code: 'ANALYTICS_REPORT', label: 'Thống kê & Phân tích Phổ điểm' },
];

type MultiSchoolTopMode =
  | 'SUPER_ADMIN_DASHBOARD_AND_SCHOOLS'
  | 'SCHOOL_ADMIN_8_PAGES_AND_RBAC'
  | 'QA_MULTI_SCHOOL_8_SCENARIOS';

export const SuperAdminSchoolManagementWorkspace: React.FC = () => {
  const { activeSchoolId, schoolName, switchSchool } = useSchoolContext();

  const [topMode, setTopMode] = useState<MultiSchoolTopMode>('SUPER_ADMIN_DASHBOARD_AND_SCHOOLS');
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [totals, setTotals] = useState<DashboardTotals | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'WARNING';
    message: string;
  } | null>(null);

  // --- II. BỘ LỌC, TÌM KIẾM & PHÂN TRANG DANH SÁCH TRƯỜNG ---
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'PRIMARY' | 'LOWER_SECONDARY' | 'PRIMARY_AND_LOWER_SECONDARY'>('ALL');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- V. MODAL TẠO MỚI / CHỈNH SỬA TRƯỜNG HỌC ---
  const [schoolFormModal, setSchoolFormModal] = useState<{
    open: boolean;
    mode: 'CREATE' | 'EDIT';
    schoolId?: string;
    code: string;
    name: string;
    educationLevel: 'PRIMARY' | 'LOWER_SECONDARY' | 'PRIMARY_AND_LOWER_SECONDARY';
    province: string;
    district: string;
    address: string;
    phone: string;
    email: string;
    governingBody: string;
    currentAcademicYear: string;
    servicePlan: 'BASIC' | 'STANDARD' | 'ENTERPRISE';
    aiQuotaMonthly: number;
    maxTeacherAccounts: number;
    enabledFeatures: string[];
    schoolAdminName: string;
    schoolAdminEmail: string;
  } | null>(null);

  // --- MODAL GÁN SCHOOL ADMIN ---
  const [assignAdminModal, setAssignAdminModal] = useState<{
    open: boolean;
    school: SchoolItem;
    adminEmail: string;
    adminFullName: string;
    adminUserId: string;
  } | null>(null);

  // --- V. MODAL XÁC NHẬN TRƯỚC THAO TÁC NGUY HIỂM (TẠM NGỪNG / NGỪNG SỬ DỤNG TRƯỜNG) ---
  const [dangerousStatusModal, setDangerousStatusModal] = useState<{
    open: boolean;
    school: SchoolItem;
    targetStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
    reason: string;
  } | null>(null);

  // --- VI. KẾT QUẢ KIỂM THỬ 8 KỊCH BẢN ĐA TRƯỜNG ---
  const [qaReportSuperAdmin, setQaReportSuperAdmin] = useState<any | null>(null);
  const [qaReportSchoolAdmin, setQaReportSchoolAdmin] = useState<any | null>(null);
  const [runningQa, setRunningQa] = useState(false);

  const loadDashboard = async (actorRoleOverride?: string) => {
    setLoading(true);
    try {
      const effectiveRole = actorRoleOverride || 'SUPER_ADMIN';
      const res = await fetch(
        `/api/super-admin/schools/dashboard?actorUserId=user-admin-sys&actorRole=${effectiveRole}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          type: 'ERROR',
          message: data.message || 'Không thể tải dữ liệu Quản trị Đa trường.',
        });
        return;
      }
      const rawSchools: any[] = Array.isArray(data.schools) ? data.schools : [];
      const normalizedSchools: SchoolItem[] = rawSchools.map((raw: any, idx: number) => {
        const mappedStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' =
          raw.status === 'ACTIVE' || raw.status === 'SUSPENDED' || raw.status === 'DEACTIVATED'
            ? raw.status
            : raw.lifecycleStatus === 'TAM_NGUNG'
            ? 'SUSPENDED'
            : raw.lifecycleStatus === 'NGUNG_SU_DUNG'
            ? 'DEACTIVATED'
            : 'ACTIVE';

        const levels: string[] = Array.isArray(raw.educationLevels) ? raw.educationLevels : [];
        const mappedLevel: 'PRIMARY' | 'LOWER_SECONDARY' | 'PRIMARY_AND_LOWER_SECONDARY' =
          raw.educationLevel ||
          (levels.includes('PRIMARY') && levels.includes('LOWER_SECONDARY')
            ? 'PRIMARY_AND_LOWER_SECONDARY'
            : levels.includes('PRIMARY')
            ? 'PRIMARY'
            : 'LOWER_SECONDARY');

        const isNdaSchool =
          String(raw.id || raw.schoolId || '') === 'sch-th-thcs-nguyen-du' ||
          String(raw.code || raw.internalCode || '') === 'SCH-NDA-OFFICIAL';
        const rawProvince = String(raw.province || raw.provinceCity || 'TP. Hà Nội');
        const rawDistrict = String(raw.district || raw.communeWard || '');

        return {
          id: String(raw.id || raw.schoolId || `school-${idx}`),
          code: String(raw.code || raw.internalCode || raw.schoolId || `SCH-${idx + 1}`),
          name: String(raw.name || raw.schoolName || `Trường học #${idx + 1}`),
          educationLevel: mappedLevel,
          province:
            isNdaSchool && (!rawProvince || rawProvince === 'Tỉnh Kon Tum')
              ? 'Thành phố Huế'
              : rawProvince,
          district:
            isNdaSchool && (!rawDistrict || rawDistrict.toLowerCase().includes('đăk tờ kan'))
              ? 'Xã Đan Điền'
              : rawDistrict,
          address:
            isNdaSchool &&
            (!raw.address ||
              String(raw.address).toLowerCase().includes('đăk tờ kan') ||
              String(raw.address).includes('Kon Tum'))
              ? 'Xã Đan Điền, Thành phố Huế'
              : String(raw.address || ''),
          phone: String(raw.phone || raw.contactPhone || ''),
          email: String(raw.email || raw.contactEmail || ''),
          governingBody: String(raw.governingBody || raw.representativeName || ''),
          currentAcademicYear:
            !raw.currentAcademicYear ||
            String(raw.currentAcademicYear).includes('2024') ||
            String(raw.currentAcademicYear).includes('2025')
              ? '2026-2027'
              : String(raw.currentAcademicYear),
          status: mappedStatus,
          servicePlan:
            raw.servicePlan === 'BASIC' ||
            raw.servicePlan === 'STANDARD' ||
            raw.servicePlan === 'ENTERPRISE'
              ? raw.servicePlan
              : String(raw.servicePlanId || '').includes('enterprise')
              ? 'ENTERPRISE'
              : String(raw.servicePlanId || '').includes('basic')
              ? 'BASIC'
              : 'STANDARD',
          enabledFeatures: Array.isArray(raw.enabledFeatures)
            ? raw.enabledFeatures
            : [
                'MATRIX_BUILDER',
                'AI_GENERATOR',
                'QUESTION_BANK',
                'DOSSIER_WORKFLOW',
                'WORD_EXPORT',
              ],
          aiQuotaMonthly: Number(
            raw.aiQuotaMonthly ?? raw.usageMetrics?.aiQuotaMonthly ?? 25000
          ),
          aiUsedThisMonth: Number(
            raw.aiUsedThisMonth ??
              raw.aiRequestsThisMonth ??
              raw.usageMetrics?.aiRequestsThisMonth ??
              0
          ),
          maxTeacherAccounts: Number(raw.maxTeacherAccounts ?? 150),
          currentAccountCount: Number(
            raw.currentAccountCount ?? raw.usageMetrics?.accountCount ?? 0
          ),
          totalQuestionsCount: Number(
            raw.totalQuestionsCount ?? raw.usageMetrics?.questionCount ?? 0
          ),
          totalExamDossiersCount: Number(
            raw.totalExamDossiersCount ?? raw.usageMetrics?.examDossierCount ?? 0
          ),
          schoolAdminUserId:
            raw.schoolAdminUserId || raw.assignedSchoolAdmin?.userId || '',
          schoolAdminEmail:
            raw.schoolAdminEmail || raw.assignedSchoolAdmin?.email || '',
          schoolAdminName:
            raw.schoolAdminName || raw.assignedSchoolAdmin?.fullName || '',
          createdAt: String(raw.createdAt || '2025-09-01T00:00:00.000Z'),
          updatedAt: String(raw.updatedAt || new Date().toISOString()),
        };
      });

      setSchools(normalizedSchools);
      const rawTotals = data.totals || data.platformOverview || null;
      if (rawTotals) {
        setTotals({
          totalSchools: Number(rawTotals.totalSchools ?? normalizedSchools.length),
          activeSchools: Number(
            rawTotals.activeSchools ??
              normalizedSchools.filter((s) => s.status === 'ACTIVE').length
          ),
          suspendedSchools: Number(
            rawTotals.suspendedSchools ??
              normalizedSchools.filter((s) => s.status === 'SUSPENDED').length
          ),
          deactivatedSchools: Number(
            rawTotals.deactivatedSchools ??
              normalizedSchools.filter((s) => s.status === 'DEACTIVATED').length
          ),
          totalAccounts: Number(
            rawTotals.totalAccounts ??
              normalizedSchools.reduce((sum, s) => sum + s.currentAccountCount, 0)
          ),
          totalQuestions: Number(
            rawTotals.totalQuestions ??
              normalizedSchools.reduce((sum, s) => sum + s.totalQuestionsCount, 0)
          ),
          totalExamDossiers: Number(
            rawTotals.totalExamDossiers ??
              normalizedSchools.reduce((sum, s) => sum + s.totalExamDossiersCount, 0)
          ),
          totalAiRequestsThisMonth: Number(
            rawTotals.totalAiRequestsThisMonth ??
              normalizedSchools.reduce((sum, s) => sum + s.aiUsedThisMonth, 0)
          ),
          totalAiQuotaMonthly: Number(
            rawTotals.totalAiQuotaMonthly ??
              normalizedSchools.reduce((sum, s) => sum + s.aiQuotaMonthly, 0)
          ),
        });
      }
      if (normalizedSchools.length > 0 && !selectedSchool) {
        setSelectedSchool(normalizedSchools[0]);
      } else if (selectedSchool) {
        const updated = normalizedSchools.find((s: SchoolItem) => s.id === selectedSchool.id);
        if (updated) setSelectedSchool(updated);
      }
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Lỗi kết nối máy chủ.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard('SUPER_ADMIN');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Danh sách địa phương phục vụ bộ lọc
  const provinceOptions = useMemo(() => {
    const set = new Set<string>();
    schools.forEach((s) => {
      if (s.province) set.add(s.province);
    });
    return Array.from(set);
  }, [schools]);

  // Danh sách trường đã lọc
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      if (levelFilter !== 'ALL' && s.educationLevel !== levelFilter) return false;
      if (provinceFilter !== 'ALL' && s.province !== provinceFilter) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCode = s.code.toLowerCase().includes(q);
        const matchProvince = (s.province || '').toLowerCase().includes(q);
        const matchAdmin =
          (s.schoolAdminName || '').toLowerCase().includes(q) ||
          (s.schoolAdminEmail || '').toLowerCase().includes(q);
        return matchName || matchCode || matchProvince || matchAdmin;
      }
      return true;
    });
  }, [schools, levelFilter, provinceFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSchools = filteredSchools.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Mở Modal Tạo trường mới
  const openCreateSchoolModal = () => {
    setSchoolFormModal({
      open: true,
      mode: 'CREATE',
      code: `THCS_MOI_${Math.floor(100 + Math.random() * 899)}`,
      name: '',
      educationLevel: 'LOWER_SECONDARY',
      province: 'TP. Hà Nội',
      district: 'Phường Dịch Vọng Hậu',
      address: 'Số 68 Đường Xuân Thủy, Dịch Vọng Hậu, Hà Nội',
      phone: '02438889999',
      email: 'vanphong@thcsmoi.edu.vn',
      governingBody: 'Sở Giáo dục và Đào tạo Hà Nội',
      currentAcademicYear: '2026-2027',
      servicePlan: 'STANDARD',
      aiQuotaMonthly: 1500,
      maxTeacherAccounts: 80,
      enabledFeatures: [
        'MATRIX_BUILDER',
        'AI_GENERATOR',
        'QUESTION_BANK',
        'DOSSIER_WORKFLOW',
        'WORD_EXPORT',
      ],
      schoolAdminName: 'Thầy Nguyễn Quốc Bảo (School Admin)',
      schoolAdminEmail: 'admin@thcsmoi.edu.vn',
    });
  };

  // Mở Modal Chỉnh sửa trường
  const openEditSchoolModal = (school: SchoolItem) => {
    setSelectedSchool(school);
    setSchoolFormModal({
      open: true,
      mode: 'EDIT',
      schoolId: school.id,
      code: school.code,
      name: school.name,
      educationLevel: school.educationLevel,
      province: school.province || 'TP. Hà Nội',
      district: school.district || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      governingBody: school.governingBody || '',
      currentAcademicYear: school.currentAcademicYear || '2026-2027',
      servicePlan: school.servicePlan,
      aiQuotaMonthly: school.aiQuotaMonthly,
      maxTeacherAccounts: school.maxTeacherAccounts,
      enabledFeatures: school.enabledFeatures || [],
      schoolAdminName: school.schoolAdminName || '',
      schoolAdminEmail: school.schoolAdminEmail || '',
    });
  };

  // Lưu Tạo mới hoặc Cập nhật Trường học (Modal chỉnh sửa)
  const handleSaveSchoolModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolFormModal) return;
    setLoading(true);
    try {
      if (schoolFormModal.mode === 'CREATE') {
        const res = await fetch('/api/super-admin/schools/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorUserId: 'user-admin-sys',
            actorRole: 'SUPER_ADMIN',
            schoolPayload: {
              code: schoolFormModal.code,
              name: schoolFormModal.name,
              educationLevel: schoolFormModal.educationLevel,
              province: schoolFormModal.province,
              district: schoolFormModal.district,
              address: schoolFormModal.address,
              phone: schoolFormModal.phone,
              email: schoolFormModal.email,
              governingBody: schoolFormModal.governingBody,
              currentAcademicYear: schoolFormModal.currentAcademicYear,
              servicePlan: schoolFormModal.servicePlan,
              aiQuotaMonthly: Number(schoolFormModal.aiQuotaMonthly),
              maxTeacherAccounts: Number(schoolFormModal.maxTeacherAccounts),
              enabledFeatures: schoolFormModal.enabledFeatures,
              schoolAdminName: schoolFormModal.schoolAdminName,
              schoolAdminEmail: schoolFormModal.schoolAdminEmail,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setBanner({ type: 'ERROR', message: data.message || 'Lỗi tạo trường mới.' });
        } else {
          setBanner({
            type: 'SUCCESS',
            message: `Thông báo lưu thành công: ${data.message}`,
          });
          setSchoolFormModal(null);
          await loadDashboard('SUPER_ADMIN');
        }
      } else if (schoolFormModal.mode === 'EDIT' && schoolFormModal.schoolId) {
        const res = await fetch(`/api/super-admin/schools/${schoolFormModal.schoolId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorUserId: 'user-admin-sys',
            actorRole: 'SUPER_ADMIN',
            updates: {
              name: schoolFormModal.name,
              schoolName: schoolFormModal.name,
              educationLevel: schoolFormModal.educationLevel,
              schoolType:
                schoolFormModal.educationLevel === 'PRIMARY'
                  ? 'TIEU_HOC'
                  : schoolFormModal.educationLevel === 'LOWER_SECONDARY'
                  ? 'THCS'
                  : 'LIEN_CAP',
              province: schoolFormModal.province,
              provinceCity: schoolFormModal.province,
              district: schoolFormModal.district,
              communeWard: schoolFormModal.district,
              address: schoolFormModal.address,
              phone: schoolFormModal.phone,
              contactPhone: schoolFormModal.phone,
              email: schoolFormModal.email,
              contactEmail: schoolFormModal.email,
              governingBody: schoolFormModal.governingBody,
              representativeName: schoolFormModal.governingBody,
              currentAcademicYear: schoolFormModal.currentAcademicYear,
              servicePlan: schoolFormModal.servicePlan,
              aiQuotaMonthly: Number(schoolFormModal.aiQuotaMonthly),
              maxTeacherAccounts: Number(schoolFormModal.maxTeacherAccounts),
              enabledFeatures: schoolFormModal.enabledFeatures,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setBanner({ type: 'ERROR', message: data.message || 'Lỗi cập nhật trường.' });
        } else {
          setBanner({
            type: 'SUCCESS',
            message: `Thông báo lưu thành công: Đã cập nhật hồ sơ trường "${schoolFormModal.name}".`,
          });
          setSchoolFormModal(null);
          await loadDashboard('SUPER_ADMIN');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Mở Modal xác nhận trước thao tác nguy hiểm (Tạm ngừng / Ngừng sử dụng) hoặc Kích hoạt lại
  const requestChangeSchoolStatus = (
    school: SchoolItem,
    targetStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
  ) => {
    setDangerousStatusModal({
      open: true,
      school,
      targetStatus,
      reason:
        targetStatus === 'ACTIVE'
          ? 'Kích hoạt lại toàn bộ quyền hoạt động của trường'
          : targetStatus === 'SUSPENDED'
          ? 'Tạm ngừng sử dụng để bảo trì định kỳ — Giữ nguyên 100% dữ liệu câu hỏi và hồ sơ đề'
          : 'Ngừng sử dụng theo quyết định cuối năm học — Lưu trữ toàn bộ dữ liệu lịch sử (Không xóa dữ liệu)',
    });
  };

  const confirmExecuteChangeStatus = async () => {
    if (!dangerousStatusModal) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/super-admin/schools/${dangerousStatusModal.school.id}/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorUserId: 'user-admin-sys',
            actorRole: 'SUPER_ADMIN',
            newStatus: dangerousStatusModal.targetStatus,
            reason: dangerousStatusModal.reason,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({ type: 'ERROR', message: data.message || 'Lỗi đổi trạng thái trường.' });
      } else {
        setBanner({
          type: dangerousStatusModal.targetStatus === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
          message: `${data.message} (${data.preservationGuarantee || 'Dữ liệu được bảo toàn 100%'})`,
        });
        setDangerousStatusModal(null);
        await loadDashboard('SUPER_ADMIN');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gán School Admin cho trường
  const handleConfirmAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAdminModal) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/super-admin/schools/${assignAdminModal.school.id}/assign-admin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorUserId: 'user-admin-sys',
            actorRole: 'SUPER_ADMIN',
            adminUserId: assignAdminModal.adminUserId,
            adminEmail: assignAdminModal.adminEmail,
            adminFullName: assignAdminModal.adminFullName,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({ type: 'ERROR', message: data.message || 'Lỗi gán School Admin.' });
      } else {
        setBanner({
          type: 'SUCCESS',
          message: `Thông báo lưu thành công: ${data.message}`,
        });
        setAssignAdminModal(null);
        await loadDashboard('SUPER_ADMIN');
      }
    } finally {
      setLoading(false);
    }
  };

  // VI. Chạy bộ kiểm thử 8 hạng mục: Tạo trường, Sửa trường, Tạo tài khoản, Nhập Excel, Phân quyền, Chuyển trường, Kiểm tra dữ liệu, Kiểm tra quyền
  const handleRunComprehensiveMultiSchoolQa = async () => {
    setRunningQa(true);
    try {
      const [resSuper, resSchool] = await Promise.all([
        fetch('/api/super-admin/schools/run-qa-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/school-admin/run-qa-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);
      const [dataSuper, dataSchool] = await Promise.all([
        resSuper.json(),
        resSchool.json(),
      ]);
      setQaReportSuperAdmin(dataSuper);
      setQaReportSchoolAdmin(dataSchool);
      await loadDashboard('SUPER_ADMIN');
      setBanner({
        type: 'SUCCESS',
        message:
          'Hoàn tất Kiểm thử Toàn diện 8 Kịch bản Quản trị Đa trường (Tạo trường · Sửa trường · Tạo tài khoản · Nhập Excel · Phân quyền · Chuyển trường · Kiểm tra dữ liệu · Kiểm tra quyền): 100% PASSED!',
      });
    } finally {
      setRunningQa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header trung tâm Quản trị Đa trường (Giai đoạn 21) */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>HỆ THỐNG QUẢN TRỊ ĐA TRƯỜNG CHUYÊN NGHIỆP</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Trung tâm Quản trị Đa Trường (Super Admin & School Admin)
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Quản lý danh mục trường học, tài khoản quản trị viên trường, gói dịch vụ và phân quyền đa cấp.
            </p>
          </div>

          {/* Bộ chuyển trường làm việc nhanh (Context Switcher) */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5">
            <div className="text-xs">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Ngữ cảnh Trường đang chọn
              </div>
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{schoolName || 'Chưa chọn trường'}</span>
              </div>
            </div>
            <select
              value={activeSchoolId || ''}
              onChange={(e) => {
                if (e.target.value) {
                  switchSchool(e.target.value, 'user-admin-sys');
                  setBanner({
                    type: 'SUCCESS',
                    message: `Đã chuyển ngữ cảnh làm việc sang trường: ${e.target.value}. Toàn bộ dữ liệu câu hỏi, ma trận và đề kiểm tra đã tự động đồng bộ theo trường mới.`,
                  });
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-xs font-semibold text-white cursor-pointer"
            >
              {schools.map((sch: SchoolItem, idx: number) => (
                <option key={sch.id || `opt-school-${idx}`} value={sch.id}>
                  {sch.name} ({sch.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thanh chuyển phân hệ: I & II. SUPER ADMIN | III & IV. SCHOOL ADMIN (8 TRANG) | VI. KIỂM THỬ ĐA TRƯỜNG */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTopMode('SUPER_ADMIN_DASHBOARD_AND_SCHOOLS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                topMode === 'SUPER_ADMIN_DASHBOARD_AND_SCHOOLS'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Tổng quan Hệ thống & Danh sách Trường học
            </button>

            <button
              type="button"
              onClick={() => setTopMode('SCHOOL_ADMIN_8_PAGES_AND_RBAC')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                topMode === 'SCHOOL_ADMIN_8_PAGES_AND_RBAC'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              Quản trị Trường học & Phân quyền
            </button>

            {false && (
              <button
                type="button"
                onClick={() => setTopMode('QA_MULTI_SCHOOL_8_SCENARIOS')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  topMode === 'QA_MULTI_SCHOOL_8_SCENARIOS'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                VI. Kiểm thử Đa trường (8 Hạng mục Nghiệm thu)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateSchoolModal}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo Trường Mới
            </button>
            <button
              type="button"
              onClick={() => loadDashboard('SUPER_ADMIN')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Thông báo lưu / cảnh báo (Mục V: Thông báo lưu) */}
      {banner && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            banner.type === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : banner.type === 'WARNING'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-2.5 text-xs font-medium">
            {banner.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span>{banner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs font-bold underline cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHẾ ĐỘ 1: I. SUPER ADMIN DASHBOARD & II. BẢNG QUẢN LÝ TRƯỜNG           */}
      {/* ===================================================================== */}
      {topMode === 'SUPER_ADMIN_DASHBOARD_AND_SCHOOLS' && (
        <div className="space-y-6">
          {/* I. SUPER ADMIN DASHBOARD (ĐỦ 7 CHỈ SỐ BẮT BUỘC) */}
          {totals && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                  I. SUPER ADMIN DASHBOARD · 7 CHỈ SỐ VẬN HÀNH TOÀN HỆ THỐNG ĐA TRƯỜNG
                </h2>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  Đồng bộ thời gian thực từ tất cả các trường thành viên
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {/* 1. Tổng số trường */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>1. Tổng số trường</span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
                    {totals.totalSchools}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Đơn vị trường học đã khởi tạo
                  </div>
                </div>

                {/* 2. Trường đang hoạt động */}
                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                    <span>2. Trường hoạt động</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">
                    {totals.activeSchools}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tạm ngừng: {totals.suspendedSchools} · Ngừng: {totals.deactivatedSchools}
                  </div>
                </div>

                {/* 3. Tổng tài khoản */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>3. Tổng tài khoản</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
                    {totals.totalAccounts}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    School Admin, Tổ trưởng & GV
                  </div>
                </div>

                {/* 4. Số câu hỏi */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>4. Số câu hỏi</span>
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
                    {totals.totalQuestions}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Ngân hàng câu hỏi các trường
                  </div>
                </div>

                {/* 5. Số đề */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>5. Số đề kiểm tra</span>
                    <FileText className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
                    {totals.totalExamDossiers}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Hồ sơ đề kiểm tra chuẩn CV 7991
                  </div>
                </div>

                {/* 6. Mức sử dụng AI */}
                <div className="bg-white rounded-xl p-4 border border-indigo-200 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-700">
                    <span>6. Mức sử dụng AI</span>
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-lg font-bold font-mono text-indigo-900 mt-1.5">
                    {totals.totalAiRequestsThisMonth}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {totals.totalAiQuotaMonthly}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-1">
                    {Math.round(
                      (totals.totalAiRequestsThisMonth /
                        Math.max(1, totals.totalAiQuotaMonthly)) *
                        100
                    )}
                    % hạn mức Gemini tháng
                  </div>
                </div>

                {/* 7. Trạng thái hệ thống */}
                <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-800 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300">
                    <span>7. Trạng thái hệ thống</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-300 mt-2">
                    ỔN ĐỊNH 100%
                  </div>
                  <div className="text-[10px] text-emerald-200/90 mt-1">
                    Cách ly đa trường · Bảo toàn dữ liệu
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* II. QUẢN LÝ TRƯỜNG — DANH SÁCH DẠNG BẢNG (8 CỘT + TÌM KIẾM + BỘ LỌC + PHÂN TRANG) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                    II. QUẢN LÝ TRƯỜNG HỌC · DANH SÁCH DẠNG BẢNG CHUẨN HÓA
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    Danh sách Trường học Thành viên ({filteredSchools.length} / {schools.length} trường)
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openCreateSchoolModal}
                    className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Trường học Mới
                  </button>
                </div>
              </div>

              {/* Thanh Tìm kiếm & Bộ lọc (Cấp học, Địa phương, Trạng thái) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm theo Tên trường, Mã trường, Địa phương, tên/email School Admin..."
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-slate-900"
                  />
                </div>

                <div className="md:col-span-3">
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={levelFilter}
                      onChange={(e) => {
                        setLevelFilter(e.target.value as any);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 bg-white text-slate-800"
                    >
                      <option value="ALL">Tất cả cấp học</option>
                      <option value="PRIMARY">Cấp Tiểu học (PRIMARY)</option>
                      <option value="LOWER_SECONDARY">Cấp THCS (LOWER_SECONDARY)</option>
                      <option value="PRIMARY_AND_LOWER_SECONDARY">Liên cấp TH & THCS</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={provinceFilter}
                    onChange={(e) => {
                      setProvinceFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="ALL">Tất cả địa phương</option>
                    {provinceOptions.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="ALL">Mọi trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                    <option value="SUSPENDED">Tạm ngừng (SUSPENDED)</option>
                    <option value="DEACTIVATED">Ngừng sử dụng (DEACTIVATED)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bảng 8 cột chuẩn Mục II: Tên trường | Cấp học | Địa phương | School Admin | Số tài khoản | Trạng thái | Ngày tạo | Thao tác */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3.5">1. Tên trường</th>
                    <th className="p-3.5">2. Cấp học</th>
                    <th className="p-3.5">3. Địa phương</th>
                    <th className="p-3.5">4. School Admin</th>
                    <th className="p-3.5 text-center">5. Số tài khoản</th>
                    <th className="p-3.5">6. Trạng thái</th>
                    <th className="p-3.5">7. Ngày tạo</th>
                    <th className="p-3.5 text-right">8. Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedSchools.map((sch, idx) => {
                    const isActiveWorking = activeSchoolId === sch.id;
                    return (
                      <tr
                        key={sch.id || `row-school-${idx}`}
                        className={`hover:bg-slate-50/90 transition ${
                          selectedSchool?.id === sch.id ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {/* 1. Tên trường */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{sch.name}</span>
                            {isActiveWorking && (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                                ĐANG CHỌN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Mã: {sch.code} · ID: {sch.id} · Gói: {sch.servicePlan}
                          </div>
                        </td>

                        {/* 2. Cấp học */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                            {EDUCATION_LEVEL_LABELS[sch.educationLevel] || sch.educationLevel}
                          </span>
                        </td>

                        {/* 3. Địa phương */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">
                            {sch.province || 'TP. Hà Nội'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {sch.district || sch.governingBody}
                          </div>
                        </td>

                        {/* 4. School Admin */}
                        <td className="p-3.5">
                          {sch.schoolAdminEmail ? (
                            <div>
                              <div className="font-semibold text-slate-900">
                                {sch.schoolAdminName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {sch.schoolAdminEmail}
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-700 font-semibold">
                              Chưa gán School Admin
                            </span>
                          )}
                        </td>

                        {/* 5. Số tài khoản */}
                        <td className="p-3.5 text-center font-mono">
                          <div className="font-bold text-slate-900">
                            {sch.currentAccountCount}{' '}
                            <span className="text-slate-400 font-normal">
                              / {sch.maxTeacherAccounts}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {sch.totalQuestionsCount} câu · {sch.totalExamDossiersCount} đề
                          </div>
                        </td>

                        {/* 6. Trạng thái */}
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              sch.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sch.status === 'SUSPENDED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sch.status === 'ACTIVE'
                              ? 'Đang hoạt động'
                              : sch.status === 'SUSPENDED'
                              ? 'Tạm ngừng'
                              : 'Ngừng sử dụng'}
                          </span>
                        </td>

                        {/* 7. Ngày tạo */}
                        <td className="p-3.5 font-mono text-slate-700">
                          {sch.createdAt
                            ? new Date(sch.createdAt).toLocaleDateString('vi-VN')
                            : '01/09/2025'}
                        </td>

                        {/* 8. Thao tác */}
                        <td className="p-3.5 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditSchoolModal(sch)}
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                              title="Chỉnh sửa thông tin trường"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setAssignAdminModal({
                                  open: true,
                                  school: sch,
                                  adminEmail:
                                    sch.schoolAdminEmail || `admin@${sch.code.toLowerCase()}.edu.vn`,
                                  adminFullName:
                                    sch.schoolAdminName || `Quản trị viên ${sch.name}`,
                                  adminUserId:
                                    sch.schoolAdminUserId ||
                                    `usr-schadmin-${sch.code.toLowerCase()}`,
                                })
                              }
                              className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                              title="Gán hoặc thay đổi School Admin"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Gán Admin
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await switchSchool(sch.id, 'user-admin-sys');
                                setBanner({
                                  type: 'SUCCESS',
                                  message: `Đã chuyển ngữ cảnh làm việc sang ${sch.name} (${sch.id}).`,
                                });
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                              title="Vào làm việc tại trường này"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Vào trường
                            </button>

                            {sch.status !== 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => requestChangeSchoolStatus(sch, 'ACTIVE')}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                              >
                                Kích hoạt
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => requestChangeSchoolStatus(sch, 'SUSPENDED')}
                                  className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold cursor-pointer"
                                >
                                  Tạm ngừng
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestChangeSchoolStatus(sch, 'DEACTIVATED')}
                                  className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold cursor-pointer"
                                >
                                  Ngừng
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedSchools.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Không tìm thấy trường học nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang (Mục V: Phân trang) */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-600">
                Hiển thị <strong>{paginatedSchools.length}</strong> trên tổng số{' '}
                <strong>{filteredSchools.length}</strong> trường học (Trang{' '}
                <strong>{safePage}</strong>/{totalPages})
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trước
                </button>
                <span className="font-mono font-bold px-2.5">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  Sau
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHẾ ĐỘ 2: III & IV. SCHOOL ADMIN (8 TRANG QUẢN TRỊ & PHÂN QUYỀN)       */}
      {/* ===================================================================== */}
      {topMode === 'SCHOOL_ADMIN_8_PAGES_AND_RBAC' && <SchoolAdminWorkspace />}

      {/* ===================================================================== */}
      {/* CHẾ ĐỘ 3: VI. KIỂM THỬ TOÀN DIỆN 8 KỊCH BẢN ĐA TRƯỜNG                 */}
      {/* ===================================================================== */}
      {topMode === 'QA_MULTI_SCHOOL_8_SCENARIOS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-amber-700">
                VI. KIỂM THỬ NGHIỆM THU QUẢN TRỊ ĐA TRƯỜNG (8 HẠNG MỤC BẮT BUỘC)
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Kiểm thử Tự động: Tạo trường · Sửa trường · Tạo tài khoản · Nhập Excel · Phân quyền · Chuyển trường · Kiểm tra dữ liệu · Kiểm tra quyền
              </h2>
            </div>

            <button
              type="button"
              onClick={handleRunComprehensiveMultiSchoolQa}
              disabled={runningQa}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {runningQa
                ? 'Đang thực thi 8 kịch bản kiểm thử...'
                : 'Chạy Kiểm thử Toàn diện 8 Kịch bản'}
            </button>
          </div>

          {/* 8 thẻ tóm tắt kịch bản kiểm thử theo đúng Mục VI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              {
                code: '1. Tạo trường',
                desc: 'Super Admin tạo trường mới với mã trường, cấp học, địa phương, gói dịch vụ và School Admin.',
              },
              {
                code: '2. Sửa trường',
                desc: 'Cập nhật thông tin trường, hạn mức AI, số tài khoản tối đa và trạng thái hoạt động (không mất dữ liệu).',
              },
              {
                code: '3. Tạo tài khoản',
                desc: 'School Admin tạo tài khoản giáo viên trực tiếp trong phạm vi trường mình quản lý.',
              },
              {
                code: '4. Nhập Excel',
                desc: 'Nhập danh sách giáo viên từ Excel: giữ nguyên UID cho email đã tồn tại, chặn ghi chéo trường.',
              },
              {
                code: '5. Phân quyền',
                desc: 'Phân quyền trực quan bằng Checkbox & Switch theo Cấp học, Môn, Khối, Quyền nhạy cảm có xác nhận riêng.',
              },
              {
                code: '6. Chuyển trường',
                desc: 'Giáo viên/Quản trị viên thuộc nhiều trường chuyển đổi ngữ cảnh trường làm việc tức thời.',
              },
              {
                code: '7. Kiểm tra dữ liệu',
                desc: 'Đảm bảo dữ liệu câu hỏi, ma trận, đề kiểm tra của Trường A và Trường B tách biệt 100%.',
              },
              {
                code: '8. Kiểm tra quyền',
                desc: 'Chặn giáo viên tạo đề ngoài môn/khối được cấp và chặn School Admin tự nâng quyền Super Admin.',
              },
            ].map((item) => (
              <div
                key={item.code}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{item.code}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    READY
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {(qaReportSuperAdmin || qaReportSchoolAdmin) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3">
              {qaReportSuperAdmin?.results && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-700">
                    Kết quả Kiểm thử Super Admin ({qaReportSuperAdmin.summary})
                  </h3>
                  {qaReportSuperAdmin.results.map((r: any, idx: number) => (
                    <div
                      key={r.step || `super-qa-${idx}`}
                      className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs"
                    >
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>
                          [{r.step || idx + 1}] {r.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px]">
                          {r.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1">{r.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {qaReportSchoolAdmin?.results && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-700">
                    Kết quả Kiểm thử School Admin & Phân quyền ({qaReportSchoolAdmin.summary})
                  </h3>
                  {qaReportSchoolAdmin.results.map((r: any, idx: number) => (
                    <div
                      key={r.step || `school-qa-${idx}`}
                      className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs"
                    >
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>
                          [{r.step || idx + 1}] {r.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px]">
                          {r.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1">{r.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL TẠO MỚI / CHỈNH SỬA TRƯỜNG HỌC (MỤC V: MODAL CHỈNH SỬA)         */}
      {/* ===================================================================== */}
      {schoolFormModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                  {schoolFormModal.mode === 'CREATE'
                    ? 'KHỞI TẠO ĐƠN VỊ TRƯỜNG HỌC MỚI'
                    : `CHỈNH SỬA HỒ SƠ TRƯỜNG · ${schoolFormModal.schoolId}`}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {schoolFormModal.mode === 'CREATE'
                    ? 'Tạo Trường học Mới trên Hệ thống Đa trường'
                    : `Cập nhật Thông tin & Hạn mức: ${schoolFormModal.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSchoolFormModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchoolModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã trường (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={schoolFormModal.mode === 'EDIT'}
                    value={schoolFormModal.code}
                    onChange={(e) =>
                      setSchoolFormModal({
                        ...schoolFormModal,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono disabled:bg-slate-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên trường chính thức *
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolFormModal.name}
                    onChange={(e) =>
                      setSchoolFormModal({ ...schoolFormModal, name: e.target.value })
                    }
                    placeholder="VD: Trường THCS Chu Văn An"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cấp học *</label>
                  <select
                    value={schoolFormModal.educationLevel}
                    onChange={(e) =>
                      setSchoolFormModal({
                        ...schoolFormModal,
                        educationLevel: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="PRIMARY">Tiểu học (PRIMARY)</option>
                    <option value="LOWER_SECONDARY">THCS (LOWER_SECONDARY)</option>
                    <option value="PRIMARY_AND_LOWER_SECONDARY">Liên cấp TH & THCS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Địa phương (Tỉnh/TP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolFormModal.province}
                    onChange={(e) =>
                      setSchoolFormModal({ ...schoolFormModal, province: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Xã / Phường
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Xã Đan Điền / Phường Thuận Hóa"
                    value={schoolFormModal.district}
                    onChange={(e) =>
                      setSchoolFormModal({ ...schoolFormModal, district: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gói dịch vụ</label>
                  <select
                    value={schoolFormModal.servicePlan}
                    onChange={(e) =>
                      setSchoolFormModal({
                        ...schoolFormModal,
                        servicePlan: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="BASIC">{SERVICE_PLAN_LABELS.BASIC}</option>
                    <option value="STANDARD">{SERVICE_PLAN_LABELS.STANDARD}</option>
                    <option value="ENTERPRISE">{SERVICE_PLAN_LABELS.ENTERPRISE}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hạn mức AI / tháng
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={schoolFormModal.aiQuotaMonthly}
                    onChange={(e) =>
                      setSchoolFormModal({
                        ...schoolFormModal,
                        aiQuotaMonthly: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số tài khoản tối đa
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={schoolFormModal.maxTeacherAccounts}
                    onChange={(e) =>
                      setSchoolFormModal({
                        ...schoolFormModal,
                        maxTeacherAccounts: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {schoolFormModal.mode === 'CREATE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Họ tên School Admin khởi tạo
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolFormModal.schoolAdminName}
                      onChange={(e) =>
                        setSchoolFormModal({
                          ...schoolFormModal,
                          schoolAdminName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email School Admin khởi tạo
                    </label>
                    <input
                      type="email"
                      required
                      value={schoolFormModal.schoolAdminEmail}
                      onChange={(e) =>
                        setSchoolFormModal({
                          ...schoolFormModal,
                          schoolAdminEmail: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Các chức năng nghiệp vụ được kích hoạt cho trường:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_FEATURES.map((feat) => {
                    const checked = schoolFormModal.enabledFeatures.includes(feat.code);
                    return (
                      <label
                        key={feat.code}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? schoolFormModal.enabledFeatures.filter((f) => f !== feat.code)
                              : [...schoolFormModal.enabledFeatures, feat.code];
                            setSchoolFormModal({
                              ...schoolFormModal,
                              enabledFeatures: next,
                            });
                          }}
                        />
                        <span>{feat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSchoolFormModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                >
                  {schoolFormModal.mode === 'CREATE'
                    ? 'Tạo Trường & Cấp quyền School Admin'
                    : 'Lưu Cập nhật Hồ sơ Trường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL GÁN SCHOOL ADMIN CHO TRƯỜNG                                     */}
      {/* ===================================================================== */}
      {assignAdminModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Gán / Cập nhật School Admin ({assignAdminModal.school.name})
              </h3>
              <button
                type="button"
                onClick={() => setAssignAdminModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmAssignAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên School Admin *
                </label>
                <input
                  type="text"
                  required
                  value={assignAdminModal.adminFullName}
                  onChange={(e) =>
                    setAssignAdminModal({
                      ...assignAdminModal,
                      adminFullName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email đăng nhập *
                </label>
                <input
                  type="email"
                  required
                  value={assignAdminModal.adminEmail}
                  onChange={(e) =>
                    setAssignAdminModal({
                      ...assignAdminModal,
                      adminEmail: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignAdminModal(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Xác nhận Gán School Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL XÁC NHẬN TRƯỚC THAO TÁC NGUY HIỂM (MỤC V: XÁC NHẬN NGUY HIỂM)    */}
      {/* ===================================================================== */}
      {dangerousStatusModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-rose-700">
                  XÁC NHẬN TRƯỚC THAO TÁC QUẢN TRỊ QUAN TRỌNG
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Chuyển trạng thái trường &ldquo;{dangerousStatusModal.school.name}&rdquo; sang{' '}
                  {dangerousStatusModal.targetStatus}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Hệ thống cam kết bảo toàn 100% ngân hàng câu hỏi, ma trận và hồ sơ đề kiểm tra của trường (tuyệt đối không xóa dữ liệu).
                </p>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Lý do thực hiện (lưu vào Audit Log):
              </label>
              <textarea
                rows={2}
                value={dangerousStatusModal.reason}
                onChange={(e) =>
                  setDangerousStatusModal({
                    ...dangerousStatusModal,
                    reason: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDangerousStatusModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Hủy thao tác
              </button>
              <button
                type="button"
                onClick={confirmExecuteChangeStatus}
                className={`px-4 py-2 rounded-lg text-white font-bold cursor-pointer ${
                  dangerousStatusModal.targetStatus === 'ACTIVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Xác nhận Thực thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
