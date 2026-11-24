import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  DollarSign,
  Lock,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  Users,
} from 'lucide-react';
import { AuthenticatedUserSession } from '../types/domain';

type ActiveSectionTab =
  | 'OPERATIONAL_OVERVIEW'
  | 'QUOTA_CONFIGURATION'
  | 'OPERATIONAL_ALERTS'
  | 'REDACTED_AI_LOGS';

interface AIUsageManagementWorkspaceProps {
  authSession?: AuthenticatedUserSession | null;
}

function getProgressWidthClass(pct: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  if (clamped === 0) return 'w-0';
  if (clamped <= 10) return 'w-1/12';
  if (clamped <= 20) return 'w-1/5';
  if (clamped <= 30) return 'w-3/10';
  if (clamped <= 40) return 'w-2/5';
  if (clamped <= 50) return 'w-1/2';
  if (clamped <= 60) return 'w-3/5';
  if (clamped <= 70) return 'w-7/10';
  if (clamped <= 80) return 'w-4/5';
  if (clamped <= 90) return 'w-11/12';
  return 'w-full';
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  NEAR_QUOTA_LIMIT: 'Gần chạm ngưỡng hạn mức',
  QUOTA_EXHAUSTED: 'Đã chạm trần hạn mức',
  TRAFFIC_SPIKE_DETECTED: 'Lưu lượng tăng đột biến',
  CONSECUTIVE_FAILURES: 'Lỗi kết nối liên tiếp',
};

const REQUEST_STATUS_LABELS: Record<string, string> = {
  SUCCESS: 'Thành công',
  BLOCKED_QUOTA_EXCEEDED: 'Chặn vượt hạn mức',
  BLOCKED_CONCURRENCY_GUARD: 'Chặn khóa đồng thời',
  FAILED_MODEL_ERROR: 'Lỗi dịch vụ AI',
};

export const AIUsageManagementWorkspace: React.FC<AIUsageManagementWorkspaceProps> = ({
  authSession,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveSectionTab>('OPERATIONAL_OVERVIEW');
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cleaningData, setCleaningData] = useState<boolean>(false);
  const [confirmCleanOpen, setConfirmCleanOpen] = useState<boolean>(false);
  const [pendingResetTarget, setPendingResetTarget] = useState<{
    schoolId: string;
    schoolName: string;
    cycleType: 'DAILY' | 'MONTHLY';
  } | null>(null);

  const [banner, setBanner] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'INFO';
    message: string;
  } | null>(null);

  // State cho Tab Cấu hình hạn mức theo trường
  const [selectedSchoolForQuota, setSelectedSchoolForQuota] = useState<string>('SCHOOL_A');
  const [quotaForm, setQuotaForm] = useState({
    dailyRequestLimit: 50,
    monthlyRequestLimit: 1000,
    schoolTotalMonthlyQuota: 1000,
    perUserDailyLimit: 20,
    perUserMonthlyLimit: 250,
    monthlyTokenLimit: 1000000,
    monthlyBudgetUsdLimit: 15.0,
    warningThresholdPercent: 80,
    funcQuestionGen: 500,
    funcQualityReview: 250,
    funcSmartImport: 150,
    funcMatrixSuggestion: 100,
  });

  // Bộ lọc Cảnh báo & Nhật ký
  const [alertFilter, setAlertFilter] = useState<'ACTIVE_ONLY' | 'ALL'>('ACTIVE_ONLY');
  const [logSchoolFilter, setLogSchoolFilter] = useState<string>('ALL');
  const [logFunctionFilter, setLogFunctionFilter] = useState<string>('ALL');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('ALL');

  const syncQuotaFormFromData = useCallback((data: any, schoolId: string) => {
    const list = data?.schoolsRanking || [];
    const found =
      list.find((s: any) => s.policy?.schoolId === schoolId) || list[0];
    if (found?.policy) {
      const p = found.policy;
      setSelectedSchoolForQuota(p.schoolId);
      setQuotaForm({
        dailyRequestLimit: p.dailyRequestLimit,
        monthlyRequestLimit: p.monthlyRequestLimit,
        schoolTotalMonthlyQuota: p.schoolTotalMonthlyQuota,
        perUserDailyLimit: p.perUserDailyLimit,
        perUserMonthlyLimit: p.perUserMonthlyLimit,
        monthlyTokenLimit: p.monthlyTokenLimit,
        monthlyBudgetUsdLimit: p.monthlyBudgetUsdLimit,
        warningThresholdPercent: p.warningThresholdPercent ?? 80,
        funcQuestionGen: p.perFunctionMonthlyLimits?.AI_QUESTION_GENERATOR ?? 150,
        funcQualityReview: p.perFunctionMonthlyLimits?.AI_QUALITY_REVIEW ?? 75,
        funcSmartImport: p.perFunctionMonthlyLimits?.AI_SMART_EXAM_IMPORT ?? 45,
        funcMatrixSuggestion: p.perFunctionMonthlyLimits?.AI_MATRIX_SUGGESTION ?? 30,
      });
    }
  }, []);

  const loadDashboard = useCallback(
    async (targetSchoolForForm = selectedSchoolForQuota, showNotice = false) => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai-usage/dashboard');
        const data = await res.json();
        if (data.ok) {
          setDashboardData(data);
          syncQuotaFormFromData(data, targetSchoolForForm);
          if (showNotice) {
            setBanner({
              type: 'SUCCESS',
              message: 'Đã đồng bộ số liệu thống kê vận hành thời gian thực toàn nền tảng.',
            });
          }
        }
      } catch (err: any) {
        setBanner({
          type: 'ERROR',
          message: err?.message || 'Không thể tải dữ liệu thống kê vận hành lúc này.',
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedSchoolForQuota, syncQuotaFormFromData]
  );

  useEffect(() => {
    void loadDashboard('SCHOOL_A', false);
  }, []);

  const handleSaveQuotaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-usage/quotas/${selectedSchoolForQuota}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: authSession?.user?.id || 'user-super-admin-platform',
          actorRole: 'SUPER_ADMIN',
          quotaUpdate: {
            dailyRequestLimit: Number(quotaForm.dailyRequestLimit),
            monthlyRequestLimit: Number(quotaForm.monthlyRequestLimit),
            schoolTotalMonthlyQuota: Number(quotaForm.schoolTotalMonthlyQuota),
            perUserDailyLimit: Number(quotaForm.perUserDailyLimit),
            perUserMonthlyLimit: Number(quotaForm.perUserMonthlyLimit),
            monthlyTokenLimit: Number(quotaForm.monthlyTokenLimit),
            monthlyBudgetUsdLimit: Number(quotaForm.monthlyBudgetUsdLimit),
            warningThresholdPercent: Number(quotaForm.warningThresholdPercent),
            perFunctionMonthlyLimits: {
              AI_QUESTION_GENERATOR: Number(quotaForm.funcQuestionGen),
              AI_QUALITY_REVIEW: Number(quotaForm.funcQualityReview),
              AI_SMART_EXAM_IMPORT: Number(quotaForm.funcSmartImport),
              AI_MATRIX_SUGGESTION: Number(quotaForm.funcMatrixSuggestion),
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          type: 'ERROR',
          message: data.message || 'Không thể lưu cấu hình hạn mức.',
        });
        return;
      }
      setDashboardData(data.dashboard);
      syncQuotaFormFromData(data.dashboard, selectedSchoolForQuota);
      setBanner({
        type: 'SUCCESS',
        message: data.message,
      });
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Lỗi khi lưu cấu hình hạn mức AI.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSchoolCycle = async (schoolId: string, cycleType: 'DAILY' | 'MONTHLY') => {
    setLoading(true);
    setPendingResetTarget(null);
    try {
      const res = await fetch(`/api/ai-usage/reset-cycle/${schoolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleType }),
      });
      const data = await res.json();
      if (data.ok) {
        setDashboardData(data.dashboard);
        setBanner({
          type: 'SUCCESS',
          message: data.message,
        });
      }
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Không thể đặt lại chu kỳ hạn mức.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-usage/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        setDashboardData(data.dashboard);
        setBanner({
          type: 'SUCCESS',
          message: data.message,
        });
      }
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Không thể cập nhật trạng thái cảnh báo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanOfficialOperationalData = async () => {
    setCleaningData(true);
    try {
      const res = await fetch('/api/ai-usage/clean-official', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: authSession?.user?.id || 'user-super-admin-platform',
          actorRole: 'SUPER_ADMIN',
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDashboardData(data.dashboard);
        syncQuotaFormFromData(data.dashboard, selectedSchoolForQuota);
        setConfirmCleanOpen(false);
        setBanner({
          type: 'SUCCESS',
          message:
            data.message ||
            'Đã làm sạch toàn bộ dữ liệu mẫu và nhật ký thử nghiệm, sẵn sàng vận hành chính thức.',
        });
      } else {
        setBanner({
          type: 'ERROR',
          message: data.message || 'Không thể thực hiện làm sạch dữ liệu vận hành.',
        });
      }
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Lỗi kết nối khi làm sạch dữ liệu vận hành.',
      });
    } finally {
      setCleaningData(false);
    }
  };

  const overview = dashboardData?.overview;
  const platformOps = dashboardData?.platformOperations;
  const schoolsRanking = dashboardData?.schoolsRanking || [];
  const allAlerts = dashboardData?.alerts || [];
  const activeAlertsCount = allAlerts.filter((a: any) => !a.resolved).length;
  const displayedAlerts = allAlerts.filter((a: any) =>
    alertFilter === 'ACTIVE_ONLY' ? !a.resolved : true
  );

  const recentLogs = (dashboardData?.recentLogs || []).filter((l: any) => {
    const matchSchool = logSchoolFilter === 'ALL' || l.schoolId === logSchoolFilter;
    const matchFunc = logFunctionFilter === 'ALL' || l.aiFunction === logFunctionFilter;
    const matchStatus = logStatusFilter === 'ALL' || l.requestStatus === logStatusFilter;
    return matchSchool && matchFunc && matchStatus;
  });

  const selectedSchoolEntry = schoolsRanking.find(
    (s: any) => s.policy?.schoolId === selectedSchoolForQuota
  );

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header chính thức: 5. Thống kê vận hành */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#087F8C] uppercase tracking-wider">
              Quản trị Nền tảng Đa trường · Giám sát Vận hành & Hạn mức Tài nguyên AI
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Thống kê vận hành toàn nền tảng
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              Theo dõi thời gian thực hoạt động của các đơn vị trường học, nhân sự, khối lượng học
              liệu, lưu lượng sử dụng dịch vụ AI, cấu hình hạn mức theo trường và cảnh báo vận hành.
              Nội dung câu hỏi và đáp án đề kiểm tra mật luôn được ẩn hoàn toàn trong nhật ký hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => loadDashboard(selectedSchoolForQuota, true)}
              disabled={loading || cleaningData}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới số liệu</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmCleanOpen((prev) => !prev)}
              disabled={loading || cleaningData}
              className="px-3.5 py-2 rounded-xl bg-[#123D75] hover:bg-[#0e315f] text-xs font-semibold text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#F4A340]" />
              <span>Rà soát & Làm sạch dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Thanh xác nhận làm sạch dữ liệu vận hành (không dùng hộp thoại trình duyệt) */}
        {confirmCleanOpen && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="space-y-1 text-amber-950">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Xác nhận rà soát & làm sạch dữ liệu thống kê vận hành chính thức</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Thao tác này sẽ xóa toàn bộ nhật ký gọi AI thử nghiệm, giải tỏa cảnh báo cũ và đưa bộ
                đếm chu kỳ về trạng thái sạch ban đầu. Danh sách trường học chính thức, tài khoản giáo
                viên, ngân hàng câu hỏi thật và cấu hình hạn mức của từng trường được giữ nguyên 100%.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmCleanOpen(false)}
                disabled={cleaningData}
                className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100/50 text-slate-700 font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleCleanOfficialOperationalData}
                disabled={cleaningData}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {cleaningData ? 'Đang làm sạch...' : 'Xác nhận làm sạch'}
              </button>
            </div>
          </div>
        )}

        {/* Thanh xác nhận đặt lại chu kỳ */}
        {pendingResetTarget && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="text-blue-950">
              Bạn có chắc chắn muốn đặt lại bộ đếm sử dụng AI chu kỳ{' '}
              <strong>
                {pendingResetTarget.cycleType === 'MONTHLY' ? 'Tháng & Ngày' : 'Ngày'}
              </strong>{' '}
              cho đơn vị <strong>{pendingResetTarget.schoolName}</strong>?
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPendingResetTarget(null)}
                className="px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-slate-700 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() =>
                  handleResetSchoolCycle(pendingResetTarget.schoolId, pendingResetTarget.cycleType)
                }
                className="px-3.5 py-1.5 rounded-lg bg-[#123D75] hover:bg-[#0e315f] text-white font-bold cursor-pointer"
              >
                Xác nhận đặt lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thông báo kết quả thao tác */}
      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            banner.type === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : banner.type === 'ERROR'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{banner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="underline font-semibold shrink-0 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Thanh chuyển Tab chức năng chính thức */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('OPERATIONAL_OVERVIEW')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'OPERATIONAL_OVERVIEW'
              ? 'bg-white text-[#123D75] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Tổng quan vận hành & Tài nguyên</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QUOTA_CONFIGURATION')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'QUOTA_CONFIGURATION'
              ? 'bg-white text-[#123D75] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Cấu hình hạn mức AI theo trường</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OPERATIONAL_ALERTS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'OPERATIONAL_ALERTS'
              ? 'bg-white text-[#123D75] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Cảnh báo vận hành</span>
          {activeAlertsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-mono">
              {activeAlertsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REDACTED_AI_LOGS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'REDACTED_AI_LOGS'
              ? 'bg-white text-[#123D75] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Nhật ký sử dụng AI ({dashboardData?.recentLogs?.length || 0})</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: TỔNG QUAN VẬN HÀNH & TÀI NGUYÊN THEO TRƯỜNG
         ===================================================================== */}
      {activeTab === 'OPERATIONAL_OVERVIEW' && overview && (
        <div className="space-y-6">
          {/* Nhóm 1: Chỉ số vận hành hạ tầng Đa trường */}
          {platformOps && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Đơn vị trường học hoạt động</span>
                  <Building2 className="w-4 h-4 text-[#123D75]" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                  {platformOps.activeSchools} / {platformOps.totalSchools}
                </div>
                <div className="text-xs text-emerald-700 font-medium mt-1">
                  {platformOps.suspendedSchools === 0
                    ? '100% đơn vị đang vận hành chính thức'
                    : `${platformOps.suspendedSchools} đơn vị đang tạm ngưng`}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Tài khoản & Nhân sự nền tảng</span>
                  <Users className="w-4 h-4 text-[#087F8C]" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                  {platformOps.totalAccounts.toLocaleString('vi-VN')}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {platformOps.superAdminAccountsCount} Super Admin · {platformOps.totalSchoolAdmins}{' '}
                  QT trường · {platformOps.totalTeachersAndStaff} Giáo viên
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Tổ chuyên môn & Học liệu</span>
                  <Database className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                  {platformOps.totalQuestionsCount.toLocaleString('vi-VN')}{' '}
                  <span className="text-sm font-sans font-semibold text-slate-600">câu hỏi</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {platformOps.totalDepartmentsCount} tổ CM · {platformOps.totalMatricesCount} ma
                  trận · {platformOps.totalExamsCount} đề kiểm tra
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Lưu trữ & Bảo mật đề mật</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
                  {platformOps.totalStorageUsedMb.toFixed(2)} MB
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Cô lập theo trường · Ẩn 100% nội dung đề mật
                </div>
              </div>
            </div>
          )}

          {/* Nhóm 2: 5 Chỉ số vận hành dịch vụ AI & Hạn mức */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Tổng lượt gọi AI</span>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                {overview.totalCalls.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Ghi nhận thực tế trên {schoolsRanking.length} trường
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Lượt xử lý thành công</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
                {overview.successCalls.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">Hợp lệ trong hạn mức được cấp</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Lượt bị chặn / lỗi</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-rose-700 mt-2">
                {overview.failedCalls.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Vượt hạn mức: {overview.blockedQuotaCalls} · Lỗi dịch vụ: {overview.failedModelCalls}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Tổng lượng Token</span>
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                {overview.totalTokens.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums mt-1">
                Vào: {overview.totalInputTokens.toLocaleString('vi-VN')} · Ra:{' '}
                {overview.totalOutputTokens.toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Chi phí AI ước tính</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                ${overview.totalEstimatedCostUsd.toFixed(4)}
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums mt-1">
                ≈ {overview.totalEstimatedCostVnd.toLocaleString('vi-VN')} VNĐ · Ẩn đề mật: 100%
              </div>
            </div>
          </div>

          {/* Bảng thống kê vận hành & hạn mức chi tiết theo từng trường chính thức */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bảng thống kê vận hành & sử dụng hạn mức AI theo đơn vị trường học
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Số liệu nhân sự, tổ chuyên môn, khối lượng học liệu (chỉ thống kê số lượng, không
                  hiển thị nội dung đề mật) và hạn mức sử dụng AI thực tế của từng trường.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Dữ liệu chính thức · Thời gian thực
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Đơn vị trường học</th>
                    <th className="py-2.5 px-3 font-semibold">Quản trị viên trường</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Tổ CM & Nhân sự</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Học liệu chuyên môn</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Hạn mức AI Ngày</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Hạn mức AI Tháng</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Token & Ngân sách</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schoolsRanking.map((item: any) => {
                    const { policy, counter, metrics, schoolOperational } = item;
                    const pct = metrics.dailyUtilizationPct;
                    const widthCls = getProgressWidthClass(pct);
                    return (
                      <tr key={policy.schoolId} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-[#123D75]">
                              {schoolOperational?.internalCode || policy.schoolId}
                            </span>
                            <span className="font-bold text-slate-900">{policy.schoolName}</span>
                          </div>
                          <div className="text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>{policy.educationLevelLabel}</span>
                            <span>·</span>
                            <span className="text-[#087F8C] font-semibold">
                              {policy.planTierName}
                            </span>
                            {schoolOperational?.province && (
                              <>
                                <span>·</span>
                                <span>{schoolOperational.province}</span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-800">
                            {schoolOperational?.schoolAdminName || 'Quản trị viên trường'}
                          </div>
                          {schoolOperational?.schoolAdminEmail && (
                            <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                              {schoolOperational.schoolAdminEmail}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                          <div className="font-bold text-slate-900">
                            {schoolOperational?.departmentCount ?? 0} tổ CM
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {schoolOperational?.teacherCount ?? 0} GV /{' '}
                            {schoolOperational?.accountCount ?? 0} TK
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <div className="font-bold text-slate-900">
                            {(schoolOperational?.questionCount ?? 0).toLocaleString('vi-VN')} câu hỏi
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {schoolOperational?.matrixCount ?? 0} ma trận ·{' '}
                            {schoolOperational?.examCount ?? 0} đề thi
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <div className="font-bold text-slate-900">
                            {counter.usedDailyRequests} / {policy.dailyRequestLimit} lượt ({pct}%)
                          </div>
                          <div className="w-28 ml-auto h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${widthCls} ${
                                pct >= 100
                                  ? 'bg-rose-600'
                                  : pct >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                              }`}
                            />
                          </div>
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            Còn {metrics.remainingDaily} lượt
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <div className="font-bold text-slate-900">
                            {counter.usedMonthlyRequests} / {policy.monthlyRequestLimit}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Còn {metrics.remainingMonthly.toLocaleString('vi-VN')} lượt
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <div className="font-semibold text-slate-900">
                            {counter.usedMonthlyTotalTokens.toLocaleString('vi-VN')} tok
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            ${counter.usedMonthlyCostUsd.toFixed(4)} / $
                            {policy.monthlyBudgetUsdLimit.toFixed(2)}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                syncQuotaFormFromData(dashboardData, policy.schoolId);
                                setActiveTab('QUOTA_CONFIGURATION');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold whitespace-nowrap cursor-pointer"
                            >
                              Hạn mức
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingResetTarget({
                                  schoolId: policy.schoolId,
                                  schoolName: policy.schoolName,
                                  cycleType: 'DAILY',
                                })
                              }
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold whitespace-nowrap cursor-pointer"
                              title="Đặt lại bộ đếm sử dụng AI trong ngày"
                            >
                              Đặt lại ngày
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Khối xác nhận tiêu chuẩn an toàn vận hành nền tảng */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dữ liệu vận hành chính thức</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Không chứa trường học mẫu, giáo viên giả lập hay lượt gọi AI kiểm thử tự sinh.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kiểm soát đồng thời nguyên tử</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Khóa đồng bộ theo từng trường bảo đảm không vượt trần hạn mức khi nhiều giáo viên sử
                dụng cùng lúc.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bảo mật tuyệt đối đề kiểm tra mật</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Tự động cắt bỏ câu hỏi và đáp án chi tiết trước khi ghi nhật ký sử dụng tài nguyên.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tự động làm mới theo chu kỳ</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Bộ đếm lượt gọi tự động chuyển tiếp khi sang ngày mới và tháng mới theo lịch hệ
                thống.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CẤU HÌNH HẠN MỨC AI THEO TRƯỜNG DÀNH CHO SUPER ADMIN
         ===================================================================== */}
      {activeTab === 'QUOTA_CONFIGURATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cấu hình hạn mức sử dụng AI theo đơn vị trường học
              </h3>
              <p className="text-slate-600 mt-0.5">
                Thiết lập trần sử dụng theo ngày, theo tháng, theo từng giáo viên, theo nghiệp vụ
                chuyên môn và ngưỡng cảnh báo sớm cho từng trường.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <label htmlFor="quota-school-select" className="font-semibold text-slate-700">
                Đơn vị trường học:
              </label>
              <select
                id="quota-school-select"
                value={selectedSchoolForQuota}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedSchoolForQuota(nextId);
                  syncQuotaFormFromData(dashboardData, nextId);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 cursor-pointer"
              >
                {schoolsRanking.map((s: any) => (
                  <option key={s.policy.schoolId} value={s.policy.schoolId}>
                    {s.policy.schoolName} ({s.schoolOperational?.internalCode || s.policy.schoolId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedSchoolEntry && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">
                  {selectedSchoolEntry.policy.schoolName} ·{' '}
                  <span className="text-[#087F8C]">{selectedSchoolEntry.policy.planTierName}</span>
                </div>
                <div className="text-slate-600">
                  Cấp học: {selectedSchoolEntry.policy.educationLevelLabel} · Đã dùng hôm nay:{' '}
                  <strong className="font-mono">
                    {selectedSchoolEntry.counter.usedDailyRequests}/
                    {selectedSchoolEntry.policy.dailyRequestLimit}
                  </strong>{' '}
                  lượt · Đã dùng trong tháng:{' '}
                  <strong className="font-mono">
                    {selectedSchoolEntry.counter.usedMonthlyRequests}/
                    {selectedSchoolEntry.policy.monthlyRequestLimit}
                  </strong>{' '}
                  lượt
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPendingResetTarget({
                      schoolId: selectedSchoolEntry.policy.schoolId,
                      schoolName: selectedSchoolEntry.policy.schoolName,
                      cycleType: 'DAILY',
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại chu kỳ Ngày</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPendingResetTarget({
                      schoolId: selectedSchoolEntry.policy.schoolId,
                      schoolName: selectedSchoolEntry.policy.schoolName,
                      cycleType: 'MONTHLY',
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại chu kỳ Tháng</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveQuotaConfig} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">
                  1. Hạn mức lượt gọi theo Ngày & Tháng của trường
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Số lượt gọi AI tối đa / Ngày
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quotaForm.dailyRequestLimit}
                    onChange={(e) =>
                      setQuotaForm({ ...quotaForm, dailyRequestLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Số lượt gọi AI tối đa / Tháng
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quotaForm.monthlyRequestLimit}
                    onChange={(e) =>
                      setQuotaForm({ ...quotaForm, monthlyRequestLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Tổng hạn mức / Tháng</label>
                    <input
                      type="number"
                      min={1}
                      value={quotaForm.schoolTotalMonthlyQuota}
                      onChange={(e) =>
                        setQuotaForm({
                          ...quotaForm,
                          schoolTotalMonthlyQuota: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Ngưỡng cảnh báo (%)</label>
                    <input
                      type="number"
                      min={50}
                      max={99}
                      value={quotaForm.warningThresholdPercent}
                      onChange={(e) =>
                        setQuotaForm({
                          ...quotaForm,
                          warningThresholdPercent: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">
                  2. Hạn mức theo Giáo viên & Ngân sách Token
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Hạn mức mỗi Giáo viên / Ngày (lượt)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quotaForm.perUserDailyLimit}
                    onChange={(e) =>
                      setQuotaForm({ ...quotaForm, perUserDailyLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Hạn mức mỗi Giáo viên / Tháng (lượt)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quotaForm.perUserMonthlyLimit}
                    onChange={(e) =>
                      setQuotaForm({ ...quotaForm, perUserMonthlyLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Hạn mức Token / Tháng</label>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={quotaForm.monthlyTokenLimit}
                      onChange={(e) =>
                        setQuotaForm({ ...quotaForm, monthlyTokenLimit: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Ngân sách USD / Tháng</label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={quotaForm.monthlyBudgetUsdLimit}
                      onChange={(e) =>
                        setQuotaForm({
                          ...quotaForm,
                          monthlyBudgetUsdLimit: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">
                  3. Hạn mức theo từng nghiệp vụ AI (Lượt / Tháng)
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">AI Tạo câu hỏi</label>
                    <input
                      type="number"
                      min={1}
                      value={quotaForm.funcQuestionGen}
                      onChange={(e) =>
                        setQuotaForm({ ...quotaForm, funcQuestionGen: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">AI Kiểm tra chất lượng</label>
                    <input
                      type="number"
                      min={1}
                      value={quotaForm.funcQualityReview}
                      onChange={(e) =>
                        setQuotaForm({ ...quotaForm, funcQualityReview: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">AI Bóc tách học liệu</label>
                    <input
                      type="number"
                      min={1}
                      value={quotaForm.funcSmartImport}
                      onChange={(e) =>
                        setQuotaForm({ ...quotaForm, funcSmartImport: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">AI Gợi ý ma trận</label>
                    <input
                      type="number"
                      min={1}
                      value={quotaForm.funcMatrixSuggestion}
                      onChange={(e) =>
                        setQuotaForm({
                          ...quotaForm,
                          funcMatrixSuggestion: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-slate-500">
                Cấu hình có hiệu lực ngay lập tức đối với mọi yêu cầu gọi AI phát sinh từ đơn vị đã
                chọn.
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#123D75] hover:bg-[#0e315f] text-white font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4 text-[#F4A340]" />
                <span>Lưu cấu hình hạn mức chính thức</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB 3: CẢNH BÁO VẬN HÀNH THỜI GIAN THỰC
         ===================================================================== */}
      {activeTab === 'OPERATIONAL_ALERTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Trung tâm cảnh báo vận hành & hạn mức tài nguyên
              </h3>
              <p className="text-slate-600 mt-0.5">
                Tự động ghi nhận khi đơn vị đạt ngưỡng cảnh báo sớm, chạm trần hạn mức ngày/tháng,
                tăng đột biến lưu lượng hoặc gặp lỗi dịch vụ liên tiếp.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setAlertFilter('ACTIVE_ONLY')}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                  alertFilter === 'ACTIVE_ONLY'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đang kích hoạt ({activeAlertsCount})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('ALL')}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                  alertFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({allAlerts.length})
              </button>
            </div>
          </div>

          {displayedAlerts.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                Hệ thống đang vận hành ổn định
              </div>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                Hiện không có cảnh báo vượt hạn mức hay sự cố kết nối dịch vụ AI nào tại các đơn vị
                trường học đang hoạt động.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedAlerts.map((alrt: any) => (
                <div
                  key={alrt.alertId}
                  className={`p-4 rounded-xl border space-y-2 ${
                    alrt.resolved
                      ? 'bg-slate-50 border-slate-200 opacity-80'
                      : alrt.severity === 'CRITICAL'
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 ${
                          alrt.resolved
                            ? 'text-slate-400'
                            : alrt.severity === 'CRITICAL'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      />
                      <span>{alrt.title}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shrink-0">
                      {ALERT_TYPE_LABELS[alrt.alertType] || alrt.alertType}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{alrt.message}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                    <div className="font-mono tabular-nums">
                      Đơn vị: {alrt.schoolName} · Chỉ số: {alrt.metricSnapshot}
                    </div>
                    {!alrt.resolved ? (
                      <button
                        type="button"
                        onClick={() => handleResolveAlert(alrt.alertId)}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold cursor-pointer"
                      >
                        Đánh dấu đã xử lý
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-semibold">Đã xử lý</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: NHẬT KÝ SỬ DỤNG AI (ĐÃ ẨN NỘI DUNG ĐỀ KIỂM TRA MẬT)
         ===================================================================== */}
      {activeTab === 'REDACTED_AI_LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhật ký vận hành dịch vụ AI (Bảo mật nội dung đề kiểm tra)
              </h3>
              <p className="text-slate-600 mt-0.5">
                Ghi nhận thời gian thực các lượt sử dụng AI của giáo viên tại các trường. Toàn bộ
                câu hỏi và đáp án đề mật đều được cắt bỏ tự động trước khi lưu trữ.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Lọc theo trường học"
                value={logSchoolFilter}
                onChange={(e) => setLogSchoolFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold cursor-pointer"
              >
                <option value="ALL">Tất cả trường học</option>
                {schoolsRanking.map((s: any) => (
                  <option key={s.policy.schoolId} value={s.policy.schoolId}>
                    {s.policy.schoolName}
                  </option>
                ))}
              </select>

              <select
                aria-label="Lọc theo nghiệp vụ AI"
                value={logFunctionFilter}
                onChange={(e) => setLogFunctionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold cursor-pointer"
              >
                <option value="ALL">Tất cả nghiệp vụ AI</option>
                <option value="AI_QUESTION_GENERATOR">AI Tạo câu hỏi theo YCCĐ</option>
                <option value="AI_QUALITY_REVIEW">AI Kiểm tra chất lượng đề</option>
                <option value="AI_SMART_EXAM_IMPORT">AI Bóc tách học liệu</option>
                <option value="AI_MATRIX_SUGGESTION">AI Gợi ý ma trận & đặc tả</option>
              </select>

              <select
                aria-label="Lọc theo trạng thái"
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold cursor-pointer"
              >
                <option value="ALL">Mọi trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="BLOCKED_QUOTA_EXCEEDED">Chặn vượt hạn mức</option>
                <option value="FAILED_MODEL_ERROR">Lỗi dịch vụ</option>
              </select>
            </div>
          </div>

          {recentLogs.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-slate-200/70 text-slate-600 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                Chưa phát sinh nhật ký gọi AI trong chu kỳ hiện tại
              </div>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                Dữ liệu thử nghiệm đã được làm sạch hoàn toàn. Khi giáo viên các trường thực hiện tạo
                câu hỏi, bóc tách học liệu hoặc kiểm tra chất lượng đề bằng AI, thông tin vận hành sẽ
                tự động hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3 font-semibold">Thời gian & Đơn vị</th>
                    <th className="py-2.5 px-3 font-semibold">Người thực hiện</th>
                    <th className="py-2.5 px-3 font-semibold">Nghiệp vụ AI</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Token (Vào / Ra)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Chi phí ước tính</th>
                    <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-3 font-semibold">Tóm tắt an toàn (Đã ẩn đề mật)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentLogs.map((log: any) => (
                    <tr key={log.logId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{log.schoolName}</div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{log.userFullName}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{log.aiFunctionLabel}</div>
                        <div className="font-mono text-[11px] text-indigo-700 mt-0.5">
                          {log.modelUsed}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <div className="font-bold text-slate-900">
                          {log.totalTokens.toLocaleString('vi-VN')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {log.inputTokens} / {log.outputTokens}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <div className="font-semibold text-slate-900">
                          ${log.estimatedCostUsd.toFixed(6)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {log.estimatedCostVnd.toLocaleString('vi-VN')} đ
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            log.requestStatus === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.requestStatus === 'FAILED_MODEL_ERROR'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {REQUEST_STATUS_LABELS[log.requestStatus] || log.requestStatus}
                        </span>
                        {log.failureOrBlockReason && (
                          <div
                            className="text-[11px] text-slate-500 max-w-xs truncate mt-0.5"
                            title={log.failureOrBlockReason}
                          >
                            {log.failureOrBlockReason}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-md">
                        <div className="font-mono">{log.sanitizedPromptSummary}</div>
                        <div className="text-emerald-700 font-semibold mt-0.5">
                          Đã ẩn 100% nội dung đề mật
                        </div>
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
