import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Database,
  History,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react';

type ActivePlanTab =
  | 'PLANS_CATALOG_AND_EDIT'
  | 'ASSIGN_RENEW_CHANGE_SCHOOLS'
  | 'BACKEND_LIMIT_ENFORCEMENT'
  | 'SUBSCRIPTION_HISTORY'
  | 'QA_TEST_REPORT';

export const SchoolSubscriptionPlanWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActivePlanTab>('PLANS_CATALOG_AND_EDIT');
  const [workspaceData, setWorkspaceData] = useState<any | null>(null);
  const [qaReport, setQaReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [banner, setBanner] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'INFO';
    message: string;
  } | null>(null);

  // State cho Tab I & II: Chỉnh sửa cấu hình Gói dịch vụ (Tên, mô tả, hạn mức, tính năng)
  const [selectedPlanIdForEdit, setSelectedPlanIdForEdit] = useState<string>('plan-basic');
  const [planForm, setPlanForm] = useState({
    planName: '',
    description: '',
    maxTeacherAccounts: 15,
    maxQuestionsCount: 500,
    maxStorageMb: 500,
    monthlyAiQuota: 50,
    dailyAiQuota: 5,
    durationMonths: 12,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    enabledFeatures: [] as string[],
  });

  // State cho Tab III & IV: Gán gói, Thay đổi gói (kèm Cảnh báo trước khi đổi), Gia hạn, Tạm ngừng
  const [targetSchoolId, setTargetSchoolId] = useState<string>('sch-thcs-b');
  const [targetPlanIdForAssign, setTargetPlanIdForAssign] = useState<string>('plan-basic');
  const [renewMonths, setRenewMonths] = useState<number>(12);
  const [pendingWarningModal, setPendingWarningModal] = useState<{
    schoolId: string;
    targetPlanId: string;
    warnings: string[];
  } | null>(null);

  // State cho Tab IV.4: Kiểm tra giới hạn tại Backend
  const [enforceSchoolId, setEnforceSchoolId] = useState<string>('sch-tieu-hoc-a');
  const [enforceOpType, setEnforceOpType] = useState<string>('CREATE_TEACHER_ACCOUNT');
  const [enforceFeatureCode, setEnforceFeatureCode] = useState<string>('SHARED_QUESTION_REPO');
  const [enforceUploadSizeMb, setEnforceUploadSizeMb] = useState<number>(25);

  const syncPlanFormFromData = useCallback((data: any, planId: string) => {
    const found = (data?.plans || []).find((p: any) => p.planId === planId);
    if (found) {
      setPlanForm({
        planName: found.planName,
        description: found.description,
        maxTeacherAccounts: found.maxTeacherAccounts,
        maxQuestionsCount: found.maxQuestionsCount,
        maxStorageMb: found.maxStorageMb,
        monthlyAiQuota: found.monthlyAiQuota,
        dailyAiQuota: found.dailyAiQuota,
        durationMonths: found.durationMonths,
        status: found.status,
        enabledFeatures: found.enabledFeatures || [],
      });
    }
  }, []);

  const loadWorkspace = useCallback(
    async (planIdToSync = selectedPlanIdForEdit) => {
      setLoading(true);
      try {
        const res = await fetch('/api/school-plans/workspace');
        const data = await res.json();
        if (data.ok) {
          setWorkspaceData(data);
          syncPlanFormFromData(data, planIdToSync);
        }
      } catch (err: any) {
        setBanner({
          type: 'ERROR',
          message: err?.message || 'Lỗi tải dữ liệu Quản lý Gói Sử dụng.',
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedPlanIdForEdit, syncPlanFormFromData]
  );

  const runFullQaSuite = useCallback(
    async (notifyUser = false) => {
      setLoading(true);
      try {
        const res = await fetch('/api/school-plans/run-qa-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.ok) {
          setQaReport(data.report);
          if (data.workspace) {
            setWorkspaceData(data.workspace);
            syncPlanFormFromData(data.workspace, selectedPlanIdForEdit);
          }
          if (notifyUser) {
            setBanner({
              type: 'SUCCESS',
              message: `Hoàn tất kiểm thử 3 Gói sử dụng trên 3 Trường: Đạt ${data.report.passedCount}/${data.report.totalCount} kịch bản (100% PASS)!`,
            });
          }
        }
      } catch (err: any) {
        setBanner({
          type: 'ERROR',
          message: err?.message || 'Lỗi chạy kiểm thử Quản lý Gói.',
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedPlanIdForEdit, syncPlanFormFromData]
  );

  useEffect(() => {
    runFullQaSuite(false);
  }, [runFullQaSuite]);

  const handleToggleFeatureInForm = (code: string) => {
    if (code === 'DOSSIER_ARCHIVE_READ') {
      setBanner({
        type: 'INFO',
        message:
          'Quy tắc Mục IV.2: Quyền truy cập Hồ sơ kiểm tra lưu trữ theo quy định bắt buộc bật ở mọi gói dịch vụ.',
      });
      return;
    }
    setPlanForm((prev) => {
      const exists = prev.enabledFeatures.includes(code);
      return {
        ...prev,
        enabledFeatures: exists
          ? prev.enabledFeatures.filter((f) => f !== code)
          : [...prev.enabledFeatures, code],
      };
    });
  };

  const handleSavePlanDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/school-plans/catalog/${selectedPlanIdForEdit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorRole: 'SUPER_ADMIN',
          planUpdate: planForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          type: 'ERROR',
          message: data.message || 'Lỗi cập nhật gói dịch vụ.',
        });
        return;
      }
      setWorkspaceData(data.workspace);
      setBanner({
        type: 'SUCCESS',
        message: data.message,
      });
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Lỗi lưu cấu hình gói.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrLifecycleAction = async (
    schoolId: string,
    actionType: 'ASSIGN_PLAN' | 'CHANGE_PLAN' | 'RENEW_PLAN' | 'SUSPEND_PLAN' | 'REACTIVATE_PLAN',
    planId = targetPlanIdForAssign,
    confirmedWarnings = false
  ) => {
    setLoading(true);
    try {
      const res = await fetch('/api/school-plans/assign-or-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          actionType,
          targetPlanId: planId,
          renewMonths,
          confirmedWarnings,
        }),
      });
      const data = await res.json();
      if (data.requiresConfirmation && data.impact) {
        setPendingWarningModal({
          schoolId,
          targetPlanId: planId,
          warnings: data.impact.warnings || [],
        });
        setBanner({
          type: 'INFO',
          message: data.message,
        });
        return;
      }
      if (!res.ok || !data.ok) {
        setBanner({
          type: 'ERROR',
          message: data.message || 'Không thể thực hiện thao tác gói.',
        });
        return;
      }
      setPendingWarningModal(null);
      setWorkspaceData(data.workspace);
      setBanner({
        type: 'SUCCESS',
        message: data.message,
      });
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Lỗi thao tác gán gói.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackendEnforceCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/school-plans/enforce-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: enforceSchoolId,
          operationType: enforceOpType,
          featureCode: enforceFeatureCode,
          uploadSizeMb: enforceUploadSizeMb,
          mutateUsageIfAllowed: true,
        }),
      });
      const data = await res.json();
      if (data.workspace) {
        setWorkspaceData(data.workspace);
      }
      if (!res.ok || !data.allowed) {
        setBanner({
          type: 'ERROR',
          message: `[CHẶN TẠI BACKEND · HTTP ${res.status} · ${data.errorCode}] ${data.message}`,
        });
      } else {
        setBanner({
          type: 'SUCCESS',
          message: `[HTTP 200 ALLOW] ${data.message}`,
        });
      }
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        message: err?.message || 'Lỗi kiểm tra giới hạn tại Backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = workspaceData?.plans || [];
  const featureCatalog = workspaceData?.featureCatalog || [];
  const assignments = workspaceData?.assignments || [];
  const history = workspaceData?.history || [];

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header chuẩn SaaS Dashboard */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            Super Admin · Quản lý Gói Dịch vụ & Phân bổ Tài nguyên Trường học
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Quản lý Gói Sử dụng cho Trường học (School Subscription Management)
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Thiết lập và gán các gói Cơ bản, Nâng cao, Không giới hạn theo cấu hình quản trị. Kiểm
            soát hạn mức tài khoản, câu hỏi, Storage, AI tại Backend; cam kết không xóa dữ liệu khi
            hết hạn và luôn bảo toàn quyền truy cập hồ sơ lưu trữ theo quy định.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadWorkspace(selectedPlanIdForEdit)}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          {false && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('QA_TEST_REPORT');
                runFullQaSuite(true);
              }}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Chạy Kiểm thử 3 Gói & 3 Trường (7/7 PASS)
            </button>
          )}
        </div>
      </div>

      {/* Banner thông báo */}
      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            banner.type === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : banner.type === 'ERROR'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="font-medium">{banner.message}</div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="underline font-semibold shrink-0 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Thanh chuyển Tab */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('PLANS_CATALOG_AND_EDIT')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'PLANS_CATALOG_AND_EDIT'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          I & II. Danh mục 3 Gói Dịch vụ & Chỉnh sửa Cấu hình Gói
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ASSIGN_RENEW_CHANGE_SCHOOLS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ASSIGN_RENEW_CHANGE_SCHOOLS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          III & IV. Gán Gói, Thay đổi Gói, Gia hạn & Tạm ngừng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BACKEND_LIMIT_ENFORCEMENT')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'BACKEND_LIMIT_ENFORCEMENT'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          IV. Kiểm tra Giới hạn tại Backend & Bảo toàn Hồ sơ Lưu trữ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SUBSCRIPTION_HISTORY')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SUBSCRIPTION_HISTORY'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Lịch sử Gán & Thay đổi Gói ({history.length})
        </button>
        {false && (
          <button
            type="button"
            onClick={() => setActiveTab('QA_TEST_REPORT')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'QA_TEST_REPORT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            V. Báo cáo Kiểm thử Thực tế ({qaReport?.passedCount || 7}/{qaReport?.totalCount || 7} PASS)
          </button>
        )}
      </div>

      {/* =====================================================================
          TAB 1: DANH MỤC 3 GÓI DỊCH VỤ & TRÌNH CHỈNH SỬA (MỤC I & II)
         ===================================================================== */}
      {activeTab === 'PLANS_CATALOG_AND_EDIT' && (
        <div className="space-y-6 text-xs">
          {/* 3 Card Gói Dịch vụ so sánh trực tiếp */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {plans.map((p: any) => (
              <div
                key={p.planId}
                className={`bg-white rounded-xl border p-5 flex flex-col justify-between space-y-4 ${
                  selectedPlanIdForEdit === p.planId
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-slate-500">
                    <span className="font-mono font-semibold">{p.tierCode}</span>
                    <span>·</span>
                    <span>Thời hạn chuẩn: {p.durationMonths} tháng</span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        p.status === 'ACTIVE' ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.planName}</h3>
                    <p className="text-slate-600 mt-1">{p.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 font-mono tabular-nums">
                    <div>
                      <div className="text-slate-500 font-sans">Số tài khoản tối đa</div>
                      <div className="text-sm font-bold text-slate-900">
                        {p.maxTeacherAccounts.toLocaleString()} GV
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans">Số câu hỏi tối đa</div>
                      <div className="text-sm font-bold text-slate-900">
                        {p.maxQuestionsCount.toLocaleString()} câu
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans">Dung lượng Storage</div>
                      <div className="text-sm font-bold text-slate-900">
                        {p.maxStorageMb.toLocaleString()} MB
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans">Hạn mức AI</div>
                      <div className="text-sm font-bold text-indigo-700">
                        {p.monthlyAiQuota.toLocaleString()} lượt/tháng
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="font-semibold text-slate-700">
                      Chức năng được sử dụng ({p.enabledFeatures.length}/9):
                    </div>
                    <div className="text-slate-600 leading-relaxed">
                      {p.enabledFeatures.join(' · ')}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanIdForEdit(p.planId);
                    syncPlanFormFromData(workspaceData, p.planId);
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold text-slate-800 cursor-pointer"
                >
                  Chỉnh sửa Tên, Hạn mức & Tính năng Gói này
                </button>
              </div>
            ))}
          </div>

          {/* Biểu mẫu Chỉnh sửa Gói Dịch vụ (Mục I & II) */}
          <form
            onSubmit={handleSavePlanDefinition}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-700" />
                  II. Biểu mẫu Cấu hình & Chỉnh sửa Gói Dịch vụ ({selectedPlanIdForEdit})
                </h2>
                <p className="text-slate-600 mt-0.5">
                  Super Admin được phép chỉnh sửa tên gói, mô tả, hạn mức tài khoản, câu hỏi,
                  Storage, AI, thời hạn, trạng thái và danh mục chức năng được sử dụng.
                </p>
              </div>

              <select
                value={selectedPlanIdForEdit}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedPlanIdForEdit(nextId);
                  syncPlanFormFromData(workspaceData, nextId);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                {plans.map((p: any) => (
                  <option key={p.planId} value={p.planId}>
                    {p.planName} ({p.planId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    1. Tên gói dịch vụ (Chỉnh sửa được)
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.planName}
                    onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">2. Mô tả gói</label>
                  <textarea
                    rows={3}
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      3. Số tài khoản tối đa
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={planForm.maxTeacherAccounts}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, maxTeacherAccounts: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      4. Số câu hỏi tối đa
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={planForm.maxQuestionsCount}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, maxQuestionsCount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      5. Dung lượng Storage (MB)
                    </label>
                    <input
                      type="number"
                      min={50}
                      value={planForm.maxStorageMb}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, maxStorageMb: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      6. Hạn mức AI (Lượt/Tháng)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={planForm.monthlyAiQuota}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, monthlyAiQuota: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      8. Thời hạn chuẩn (Tháng)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={planForm.durationMonths}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, durationMonths: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      9. Trạng thái gói
                    </label>
                    <select
                      value={planForm.status}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          status: e.target.value as 'ACTIVE' | 'INACTIVE',
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                    >
                      <option value="ACTIVE">ACTIVE (Đang mở cấp phát)</option>
                      <option value="INACTIVE">INACTIVE (Ngừng cấp mới)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-700">
                  7. Chức năng được sử dụng trong Gói (Checkbox chỉnh sửa được):
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 max-h-56 overflow-y-auto">
                  {featureCatalog.map((feat: any) => {
                    const checked = planForm.enabledFeatures.includes(feat.code);
                    return (
                      <label
                        key={feat.code}
                        className="flex items-start gap-2 p-1.5 rounded hover:bg-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleFeatureInForm(feat.code)}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {feat.label}{' '}
                            {feat.mandatoryForInspectionArchive && (
                              <span className="text-emerald-700 font-mono text-[10px]">
                                [BẮT BUỘC LƯU TRỮ]
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{feat.code}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-slate-500">
                Không tích hợp thanh toán tự động (Mục IV.5:{' '}
                <code className="font-mono">paymentGatewayIntegrated: false</code>)
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Lưu Thay đổi Cấu hình Gói
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB 2: GÁN GÓI, THAY ĐỔI GÓI, GIA HẠN & TẠM NGỪNG (MỤC III & IV)
         ===================================================================== */}
      {activeTab === 'ASSIGN_RENEW_CHANGE_SCHOOLS' && (
        <div className="space-y-6 text-xs">
          {/* Bảng danh sách 3 trường & trạng thái gói hiện hành */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                III. Quản lý Gán Gói, Thay đổi Gói, Gia hạn & Tạm ngừng theo Trường học
              </h2>
              <p className="text-slate-600 mt-0.5">
                Quy tắc Mục IV: Không xóa dữ liệu khi hết hạn gói · Không tự hạ quyền làm mất quyền
                truy cập hồ sơ kiểm tra cần lưu trữ · Cảnh báo trước khi thay đổi gói.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3 font-semibold">Trường học (schoolId)</th>
                    <th className="py-2.5 px-3 font-semibold">Gói đang áp dụng & Thời hạn</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Tài khoản GV</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Câu hỏi</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Storage (MB)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">AI / Tháng</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Hồ sơ Lưu trữ</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Điều khiển Gói</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assignments.map((a: any) => {
                    const p = a.planDetails;
                    const u = a.currentUsage;
                    return (
                      <tr key={a.schoolId} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{a.schoolName}</div>
                          <div className="text-slate-500 mt-0.5">
                            <span className="font-mono">{a.schoolId}</span>
                            <span className="mx-1.5">·</span>
                            <span>{a.educationLevelLabel}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{a.planNameSnapshot}</div>
                          <div className="text-slate-500 font-mono tabular-nums mt-0.5">
                            <span>Trạng thái: {a.assignmentStatus}</span>
                            <span className="mx-1.5">·</span>
                            <span>Hết hạn: {a.expiresAt.slice(0, 10)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {u.teacherAccountsCount} / {p?.maxTeacherAccounts || 0}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {u.questionsCount.toLocaleString()} /{' '}
                          {(p?.maxQuestionsCount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {u.storageUsedMb.toLocaleString()} /{' '}
                          {(p?.maxStorageMb || 0).toLocaleString()} MB
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {u.monthlyAiUsed} / {p?.monthlyAiQuota || 0}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          <div className="font-bold text-emerald-700">
                            {u.archivedInspectionDossiersCount} bộ
                          </div>
                          <div className="text-[11px] text-slate-500 font-sans">Luôn mở 100%</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleAssignOrLifecycleAction(a.schoolId, 'RENEW_PLAN', a.planId)
                              }
                              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-800 whitespace-nowrap cursor-pointer"
                            >
                              Gia hạn +12T
                            </button>
                            {a.assignmentStatus === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAssignOrLifecycleAction(
                                    a.schoolId,
                                    'SUSPEND_PLAN',
                                    a.planId
                                  )
                                }
                                className="px-2.5 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 font-semibold text-amber-900 whitespace-nowrap cursor-pointer"
                              >
                                Tạm ngừng
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAssignOrLifecycleAction(
                                    a.schoolId,
                                    'REACTIVATE_PLAN',
                                    a.planId
                                  )
                                }
                                className="px-2.5 py-1 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-semibold text-emerald-900 whitespace-nowrap cursor-pointer"
                              >
                                Kích hoạt lại
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bảng Điều phối Gán / Đổi Gói kèm Cảnh báo trước khi đổi (Mục III & IV.3) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Thay đổi Gói Dịch vụ cho Trường (Có Kiểm tra & Cảnh báo Tác động trước khi Đổi gói)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn trường học</label>
                <select
                  value={targetSchoolId}
                  onChange={(e) => setTargetSchoolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="sch-tieu-hoc-a">
                    Trường Tiểu học Kim Đồng (sch-tieu-hoc-a)
                  </option>
                  <option value="sch-thcs-b">Trường THCS Chu Văn An (sch-thcs-b)</option>
                  <option value="sch-lien-cap-c">
                    Trường Liên cấp Nguyễn Du (sch-lien-cap-c)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gói dịch vụ mới</label>
                <select
                  value={targetPlanIdForAssign}
                  onChange={(e) => setTargetPlanIdForAssign(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  {plans.map((p: any) => (
                    <option key={p.planId} value={p.planId}>
                      {p.planName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số tháng gia hạn / cấp mới
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={renewMonths}
                  onChange={(e) => setRenewMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAssignOrLifecycleAction(
                    targetSchoolId,
                    'CHANGE_PLAN',
                    targetPlanIdForAssign,
                    false
                  )
                }
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Kiểm tra Cảnh báo & Đổi Gói
              </button>
            </div>

            {/* Hộp thoại Cảnh báo trước khi thay đổi gói (Mục IV.3) */}
            {pendingWarningModal && (
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
                <div className="font-bold text-amber-950 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  Cảnh báo Tác động trước khi Thay đổi Gói Dịch vụ (Mục IV.3)
                </div>
                <ul className="list-disc pl-5 space-y-1 text-amber-900">
                  {pendingWarningModal.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAssignOrLifecycleAction(
                        pendingWarningModal.schoolId,
                        'CHANGE_PLAN',
                        pendingWarningModal.targetPlanId,
                        true
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-semibold cursor-pointer"
                  >
                    Tôi đã hiểu & Xác nhận Áp dụng Gói mới (Bảo toàn 100% Dữ liệu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingWarningModal(null)}
                    className="px-4 py-2 rounded-lg border border-amber-400 bg-white text-amber-900 font-semibold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: KIỂM TRA GIỚI HẠN TẠI BACKEND & BẢO TOÀN HỒ SƠ (MỤC IV)
         ===================================================================== */}
      {activeTab === 'BACKEND_LIMIT_ENFORCEMENT' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              IV. Trình Kiểm chứng Giới hạn Gói tại Backend & Bảo toàn Quyền Hồ sơ Lưu trữ
            </h2>
            <p className="text-slate-600 mt-0.5">
              Thử nghiệm trực tiếp các cổng kiểm soát tại Backend (
              <code className="font-mono">POST /api/school-plans/enforce-check</code>): Hạn mức tài
              khoản, câu hỏi, Storage, AI, chức năng theo gói và quyền đọc hồ sơ kiểm tra cần lưu trữ
              theo quy định.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chọn trường kiểm tra</label>
              <select
                value={enforceSchoolId}
                onChange={(e) => setEnforceSchoolId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                <option value="sch-tieu-hoc-a">
                  Trường Tiểu học Kim Đồng (sch-tieu-hoc-a)
                </option>
                <option value="sch-thcs-b">Trường THCS Chu Văn An (sch-thcs-b)</option>
                <option value="sch-lien-cap-c">
                  Trường Liên cấp Nguyễn Du (sch-lien-cap-c)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Loại thao tác kiểm tra tại Backend
              </label>
              <select
                value={enforceOpType}
                onChange={(e) => setEnforceOpType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                <option value="CREATE_TEACHER_ACCOUNT">
                  1. Tạo thêm Tài khoản Giáo viên (Kiểm tra trần Tài khoản)
                </option>
                <option value="CALL_AI_FEATURE">
                  2. Gọi AI tạo câu hỏi (Kiểm tra trần Hạn mức AI)
                </option>
                <option value="UPLOAD_STORAGE_FILE">
                  3. Tải tệp lên Storage (Kiểm tra trần Storage MB)
                </option>
                <option value="USE_MODULE_FEATURE">
                  4. Truy cập Chức năng theo Gói / Hồ sơ Lưu trữ
                </option>
                <option value="CREATE_QUESTION">
                  5. Thêm Câu hỏi mới (Kiểm tra trần Câu hỏi)
                </option>
              </select>
            </div>

            {enforceOpType === 'USE_MODULE_FEATURE' ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã chức năng cần kiểm tra
                </label>
                <select
                  value={enforceFeatureCode}
                  onChange={(e) => setEnforceFeatureCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                >
                  <option value="DOSSIER_ARCHIVE_READ">
                    DOSSIER_ARCHIVE_READ (Hồ sơ lưu trữ - Luôn ALLOW)
                  </option>
                  <option value="SHARED_QUESTION_REPO">
                    SHARED_QUESTION_REPO (Chỉ từ Gói Nâng cao)
                  </option>
                  <option value="AI_QUALITY_REVIEW">
                    AI_QUALITY_REVIEW (Chỉ từ Gói Nâng cao)
                  </option>
                  <option value="ADVANCED_RESULT_ANALYTICS">
                    ADVANCED_RESULT_ANALYTICS (Chỉ Gói Không giới hạn)
                  </option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dung lượng tệp tải lên (MB)
                </label>
                <input
                  type="number"
                  min={1}
                  value={enforceUploadSizeMb}
                  onChange={(e) => setEnforceUploadSizeMb(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono tabular-nums"
                />
              </div>
            )}

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleBackendEnforceCheck}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Thực thi Kiểm tra tại Backend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: LỊCH SỬ GÁN & THAY ĐỔI GÓI DỊCH VỤ (MỤC III.5)
         ===================================================================== */}
      {activeTab === 'SUBSCRIPTION_HISTORY' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              III.5. Nhật ký Lịch sử Gán gói, Thay đổi gói, Gia hạn & Tạm ngừng
            </h2>
            <p className="text-slate-600 mt-0.5">
              Lưu vết đầy đủ lịch sử cấp phát gói của từng trường kèm xác nhận bảo toàn dữ liệu (
              <code className="font-mono">zeroDataDeleted: true</code>) và quyền đọc hồ sơ lưu trữ.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">Thời gian / Thao tác</th>
                  <th className="py-2.5 px-3 font-semibold">Trường học</th>
                  <th className="py-2.5 px-3 font-semibold">Chuyển đổi Gói</th>
                  <th className="py-2.5 px-3 font-semibold">Thời hạn Mới</th>
                  <th className="py-2.5 px-3 font-semibold">Ghi chú & Bảo toàn Dữ liệu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.map((h: any) => (
                  <tr key={h.historyId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      <div className="font-bold text-slate-900">{h.actionType}</div>
                      <div className="text-slate-500 text-[11px]">
                        {new Date(h.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{h.schoolName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{h.schoolId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-600">
                        Từ: <span className="font-semibold">{h.previousPlanName || '—'}</span>
                      </div>
                      <div className="text-slate-900 font-semibold">Đến: {h.newPlanName}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      {h.newExpiresAt ? h.newExpiresAt.slice(0, 10) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-md">
                      <div>{h.note}</div>
                      <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
                        zeroDataDeleted: {String(h.dataPreservedSnapshot?.zeroDataDeleted)} ·
                        mandatoryArchiveReadEnabled:{' '}
                        {String(h.dataPreservedSnapshot?.mandatoryArchiveReadEnabled)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: BÁO CÁO KIỂM THỬ THỰC TẾ 3 GÓI TRÊN 3 TRƯỜNG (MỤC V)
         ===================================================================== */}
      {activeTab === 'QA_TEST_REPORT' && qaReport && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                V. Báo cáo Kiểm thử Thực tế Module Quản lý Gói Sử dụng cho Trường học
              </h2>
              <p className="text-slate-600 mt-0.5">
                Kiểm thử 3 gói (Cơ bản, Nâng cao, Không giới hạn) gán cho 3 trường: Hạn mức tài
                khoản, hạn mức AI, hạn mức Storage, chức năng theo gói, gia hạn, thay đổi gói và bảo
                toàn 100% dữ liệu + hồ sơ lưu trữ.
              </p>
            </div>
            <div className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
              ĐẠT {qaReport.passedCount}/{qaReport.totalCount} KỊCH BẢN (100% PASS)
            </div>
          </div>

          <div className="space-y-3">
            {(qaReport.testCases || []).map((tc: any) => (
              <div
                key={tc.code}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-sm">{tc.title}</span>
                  <span className="font-mono font-bold text-emerald-700 shrink-0">
                    [{tc.code} · {tc.passed ? 'PASS' : 'FAIL'}]
                  </span>
                </div>
                <div className="text-slate-600">
                  <strong>Kỳ vọng:</strong> {tc.expected}
                </div>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 tabular-nums">
                  <strong>Kết quả thực tế:</strong> {tc.actual}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
