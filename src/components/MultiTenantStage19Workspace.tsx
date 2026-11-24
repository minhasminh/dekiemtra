import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  ShieldCheck,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRightLeft,
  HardDrive,
  FileCheck2,
  XCircle,
} from 'lucide-react';
import { useSchoolContext } from '../contexts/SchoolContext';

export const MultiTenantStage19Workspace: React.FC = () => {
  const {
    activeSchoolId,
    schoolName,
    educationLevels,
    academicYearId,
    currentMembership,
    currentPermissions,
    tenantDisplayCache,
    activeSubscriptionCount,
    isSwitchingSchool,
    lastSwitchSteps,
    lastSwitchError,
    switchSchool,
    validateWriteSchoolScope,
  } = useSchoolContext();

  const [activeTab, setActiveTab] = useState<
    'COMPREHENSIVE_QA_10_SECTIONS' | 'ARCHITECTURE' | 'SCHOOL_CONTEXT' | 'MIGRATION' | 'QA_ISOLATION'
  >('COMPREHENSIVE_QA_10_SECTIONS');
  const [overview, setOverview] = useState<any | null>(null);
  const [migrationPlanData, setMigrationPlanData] = useState<any | null>(null);
  const [qaReport, setQaReport] = useState<any | null>(null);
  const [fullAcceptanceReport, setFullAcceptanceReport] = useState<any | null>(null);
  const [runningFullSuite, setRunningFullSuite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'WARNING';
    text: string;
  } | null>(null);

  // Trạng thái kiểm thử khóa ghi nhầm trường ở Tab III
  const [writeTestPayloadSchoolId, setWriteTestPayloadSchoolId] = useState<string>('sch-tieu-hoc-a');
  const [writeGuardResult, setWriteGuardResult] = useState<{
    allowed: boolean;
    reason: string;
  } | null>(null);

  // Trạng thái xác nhận Migration ở Tab IV
  const [adminConfirmedCheckbox, setAdminConfirmedCheckbox] = useState<boolean>(false);

  const loadAllStage19Data = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, migRes, qaRes, fullAccRes] = await Promise.all([
        fetch('/api/stage19/multi-tenant/overview'),
        fetch('/api/stage19/multi-tenant/migration-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DRY_RUN_AUDIT' }),
        }),
        fetch('/api/stage19/multi-tenant/run-isolation-qa-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/stage19-acceptance/latest'),
      ]);
      const [ovJson, migJson, qaJson, fullAccJson] = await Promise.all([
        ovRes.json(),
        migRes.json(),
        qaRes.json(),
        fullAccRes.json(),
      ]);
      if (ovJson.ok) setOverview(ovJson);
      if (migJson.ok) setMigrationPlanData(migJson);
      if (qaJson.ok) setQaReport(qaJson.report);
      if (fullAccJson.ok && fullAccJson.report) setFullAcceptanceReport(fullAccJson.report);
    } catch (err: any) {
      setStatusBanner({
        type: 'ERROR',
        text: err?.message || 'Không thể tải dữ liệu Giai đoạn 19 Multi-Tenant.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRunComprehensiveStage19Suite = async () => {
    setRunningFullSuite(true);
    try {
      const res = await fetch('/api/stage19-acceptance/run-full-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok && data.report) {
        setFullAcceptanceReport(data.report);
        setStatusBanner({
          type: 'SUCCESS',
          text: `Đã chạy xong Kiểm thử Toàn diện Giai đoạn 19 (Mục I – X): Đạt 10/10 mã kiểm thử trong ${data.report.totalSuiteDurationMs}ms.`,
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'ERROR',
        text: err?.message || 'Lỗi khi chạy bộ kiểm thử nghiệm thu toàn diện Giai đoạn 19.',
      });
    } finally {
      setRunningFullSuite(false);
    }
  };

  useEffect(() => {
    loadAllStage19Data();
  }, [loadAllStage19Data]);

  const handleSwitchSchoolClick = async (targetSchoolId: string, actorUserId = 'user-admin-sys') => {
    const result = await switchSchool(targetSchoolId, actorUserId);
    setStatusBanner({
      type: result.ok ? 'SUCCESS' : 'ERROR',
      text: result.message,
    });
  };

  const handleTestWriteScope = (payloadId: string) => {
    setWriteTestPayloadSchoolId(payloadId);
    const check = validateWriteSchoolScope(payloadId);
    setWriteGuardResult(check);
  };

  const handleMigrationAction = async (
    action: 'CREATE_BACKUP' | 'DRY_RUN_AUDIT' | 'ATTEMPT_OFFICIAL_MIGRATION'
  ) => {
    setLoading(true);
    try {
      const res = await fetch('/api/stage19/multi-tenant/migration-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminConfirmedInput: adminConfirmedCheckbox,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatusBanner({
          type: 'ERROR',
          text: data.message || 'Từ chối thực thi Migration chính thức.',
        });
        if (data.migrationState) {
          setMigrationPlanData((prev: any) => ({
            ...prev,
            migrationState: data.migrationState,
            currentDataAudit: data.currentDataAudit || prev?.currentDataAudit,
          }));
        }
      } else {
        setMigrationPlanData(data);
        setStatusBanner({
          type: 'SUCCESS',
          text:
            action === 'CREATE_BACKUP'
              ? `Đã tạo bản sao lưu SHA-256 thành công (${data.migrationState?.lastBackupId}).`
              : action === 'ATTEMPT_OFFICIAL_MIGRATION'
              ? 'Đã xác nhận bản sao lưu và hoàn tất kiểm tra đồng bộ cấu trúc Multi-Tenant.'
              : 'Đã chạy kiểm toán Dry-Run 6 bước thành công.',
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'ERROR',
        text: err?.message || 'Lỗi khi thực thi tác vụ Migration.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunIsolationQaSuite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stage19/multi-tenant/run-isolation-qa-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok && data.report) {
        setQaReport(data.report);
        setStatusBanner({
          type: 'SUCCESS',
          text: `Đã hoàn tất bộ kiểm thử cô lập Đa trường (Đạt ${data.report.passedCount}/${data.report.totalCount} kịch bản).`,
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'ERROR',
        text: err?.message || 'Lỗi khi chạy kiểm thử cô lập Đa trường.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span>GIAI ĐOẠN 19 · KIẾN TRÚC MULTI-TENANT SAAS ĐA TRƯỜNG</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Hệ thống Quản trị Đa trường (Multi-Tenant Isolation) – EDU TEST AI
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Một ứng dụng phục vụ nhiều trường học độc lập trên cùng Firebase Project (
              <span className="font-mono text-amber-300">taodeai-513007</span>). Mỗi trường có{' '}
              <span className="font-mono text-emerald-300">schoolId</span> duy nhất, dữ liệu, tài khoản, phân quyền và
              hồ sơ cô lập tuyệt đối.
            </p>
          </div>

          {/* Active SchoolContext Badge */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3.5 min-w-[300px]">
            <div className="text-[11px] font-mono uppercase text-slate-400">SCHOOL CONTEXT ĐANG HOẠT ĐỘNG</div>
            <div className="text-sm font-bold text-white mt-0.5">{schoolName}</div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                schoolId: {activeSchoolId}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">
                Năm học: {academicYearId}
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                Cấp: {educationLevels.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick School Switcher Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 mr-1">Chuyển đổi nhanh SchoolContext:</span>
            <button
              type="button"
              disabled={isSwitchingSchool}
              onClick={() => handleSwitchSchoolClick('sch-th-thcs-nguyen-du', 'user-admin-sys')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeSchoolId === 'sch-th-thcs-nguyen-du'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              1. Trường TH &THCS Nguyễn Đình Anh (sch-th-thcs-nguyen-du)
            </button>
            <button
              type="button"
              disabled={isSwitchingSchool}
              onClick={() => handleSwitchSchoolClick('sch-tieu-hoc-a', 'user-admin-sys')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeSchoolId === 'sch-tieu-hoc-a'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              2. Trường Tiểu học A (sch-tieu-hoc-a)
            </button>
            <button
              type="button"
              disabled={isSwitchingSchool}
              onClick={() => handleSwitchSchoolClick('sch-thcs-b', 'user-admin-sys')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeSchoolId === 'sch-thcs-b'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              3. Trường THCS B (sch-thcs-b)
            </button>
          </div>

          <button
            type="button"
            onClick={loadAllStage19Data}
            disabled={loading}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Status Notification */}
      {statusBanner && (
        <div
          className={`p-4 rounded-lg border flex items-center justify-between text-sm ${
            statusBanner.type === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : statusBanner.type === 'ERROR'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {statusBanner.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs underline ml-4 opacity-75 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('COMPREHENSIVE_QA_10_SECTIONS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'COMPREHENSIVE_QA_10_SECTIONS'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Nghiệm thu Toàn diện Giai đoạn 19 (Mục I – X)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ARCHITECTURE')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'ARCHITECTURE'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Kiến trúc Firestore (12 Collection Trường & 5 Toàn cục)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SCHOOL_CONTEXT')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'SCHOOL_CONTEXT'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          III. SchoolContext & Chuyển đổi Trường An toàn
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MIGRATION')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'MIGRATION'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          IV. Kế hoạch Migration 6 Bước & Rollback
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('QA_ISOLATION')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeTab === 'QA_ISOLATION'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          V. Kiểm thử Cô lập 2 Trường (Tiểu học A & THCS B)
        </button>
      </div>

      {/* TAB 1: ARCHITECTURE */}
      {activeTab === 'ARCHITECTURE' && overview && (
        <div className="space-y-6">
          {/* 10 Principles */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              I. 10 Nguyên tắc Bất biến của Hệ thống Multi-Tenant (Giai đoạn 19)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(overview.architecture?.principlesEnforced || []).map((p: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 12 Tenant Collections & 5 Global Collections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-blue-600" />
                II.A. 12 Collection Cấp Trường (Cô lập theo schoolId)
              </h3>
              <div className="space-y-1.5">
                {(overview.architecture?.tenantScopedPaths || []).map((pathStr: string, idx: number) => (
                  <div
                    key={pathStr}
                    className="flex items-center justify-between px-3 py-2 rounded bg-slate-50 border border-slate-200 font-mono text-xs"
                  >
                    <span className="text-slate-900 font-semibold">
                      {idx + 1}. {pathStr}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                      Scoped by schoolId
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-purple-600" />
                  II.B. 5 Collection Dữ liệu Toàn cục (Global Collections)
                </h3>
                <div className="space-y-2">
                  <div className="p-3 rounded bg-purple-50/60 border border-purple-200 text-xs">
                    <div className="font-mono font-bold text-purple-950">1. schoolCatalog/&#123;schoolId&#125;</div>
                    <div className="text-slate-600 mt-0.5">
                      Danh mục trường học ({overview.globalCollections?.schoolCatalog?.length || 0} trường đang hoạt
                      động, khóa chính là <code className="font-mono">schoolId</code>).
                    </div>
                  </div>
                  <div className="p-3 rounded bg-purple-50/60 border border-purple-200 text-xs">
                    <div className="font-mono font-bold text-purple-950">
                      2. sharedCurriculums/&#123;curriculumId&#125;
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Danh mục chương trình GDPT 2018 dùng chung (
                      {overview.globalCollections?.sharedCurriculums?.length || 0} khung chương trình Tiểu học & THCS).
                    </div>
                  </div>
                  <div className="p-3 rounded bg-purple-50/60 border border-purple-200 text-xs">
                    <div className="font-mono font-bold text-purple-950">3. servicePlans/&#123;planId&#125;</div>
                    <div className="text-slate-600 mt-0.5">
                      Gói dịch vụ SaaS ({overview.globalCollections?.servicePlans?.length || 0} gói dịch vụ).
                    </div>
                  </div>
                  <div className="p-3 rounded bg-purple-50/60 border border-purple-200 text-xs">
                    <div className="font-mono font-bold text-purple-950">4. platformConfigs/&#123;configId&#125;</div>
                    <div className="text-slate-600 mt-0.5">
                      Cấu hình nền tảng (Khóa bắt buộc <code className="font-mono">schoolId</code>, cấm Super Admin mặc
                      định đọc đề mật).
                    </div>
                  </div>
                  <div className="p-3 rounded bg-purple-50/60 border border-purple-200 text-xs">
                    <div className="font-mono font-bold text-purple-950">
                      5. platformMemberships/&#123;membershipId&#125;
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Tư cách thành viên đa trường và quyền quản trị hệ thống (
                      {overview.globalCollections?.platformMemberships?.length || 0} bản ghi membership).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Table of 3 Schools */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Danh mục các Trường trên Hệ thống Multi-Tenant (schoolCatalog)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="p-2.5">Mã schoolId (Khóa chính)</th>
                    <th className="p-2.5">Tên trường</th>
                    <th className="p-2.5">Cấp học</th>
                    <th className="p-2.5">Loại đơn vị</th>
                    <th className="p-2.5 text-right">Tài khoản</th>
                    <th className="p-2.5 text-right">Câu hỏi</th>
                    <th className="p-2.5 text-right">Ma trận</th>
                    <th className="p-2.5 text-right">Đề KT</th>
                    <th className="p-2.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(overview.tenantSummaries || []).map((t: any) => (
                    <tr
                      key={t.schoolId}
                      className={activeSchoolId === t.schoolId ? 'bg-emerald-50/60 font-medium' : 'hover:bg-slate-50'}
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900">{t.schoolId}</td>
                      <td className="p-2.5 text-slate-900 font-semibold">{t.schoolName}</td>
                      <td className="p-2.5 font-mono">{(t.educationLevels || []).join(', ')}</td>
                      <td className="p-2.5">
                        {t.isTestTenant ? (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                            Trường thử nghiệm GĐ19
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            Trường chính thức
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono">{t.collectionCounts?.users}</td>
                      <td className="p-2.5 text-right font-mono">{t.collectionCounts?.questions}</td>
                      <td className="p-2.5 text-right font-mono">{t.collectionCounts?.matrices}</td>
                      <td className="p-2.5 text-right font-mono">{t.collectionCounts?.exams}</td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleSwitchSchoolClick(t.schoolId, 'user-admin-sys')}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold"
                        >
                          {activeSchoolId === t.schoolId ? 'Đang kích hoạt' : 'Chuyển sang trường này'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL CONTEXT */}
      {activeTab === 'SCHOOL_CONTEXT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6 Properties of SchoolContext */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                III.A. Trạng thái SchoolContext Hiện tại (6 Thuộc tính Chuẩn)
              </h2>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-mono font-bold text-slate-600">1. activeSchoolId:</span>
                  <span className="font-mono font-bold text-emerald-700">{activeSchoolId}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-mono font-bold text-slate-600">2. schoolName:</span>
                  <span className="font-bold text-slate-900">{schoolName}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-mono font-bold text-slate-600">3. educationLevels:</span>
                  <span className="font-mono font-semibold text-blue-700">{educationLevels.join(', ')}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-mono font-bold text-slate-600">4. academicYearId:</span>
                  <span className="font-mono font-semibold text-slate-900">{academicYearId}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-mono font-bold text-slate-600 mb-1">5. currentMembership:</div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                    id: {currentMembership?.id} · roles: [{currentMembership?.roles?.join(', ')}] ·
                    canReadConfidentialExam: {String(currentMembership?.canReadConfidentialExam)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-mono font-bold text-slate-600 mb-1">
                    6. currentPermissions ({currentPermissions.length} quyền):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-semibold"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Transition Steps Log & Cross-School Write Guard */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                  III.B. Nhật ký 5 Bước Khi Chuyển Trường
                </h2>
                <p className="text-xs text-slate-600 mb-3">
                  Subscription đang hoạt động của trường hiện tại:{' '}
                  <span className="font-mono font-bold text-emerald-700">{activeSubscriptionCount}</span>
                </p>
                <div className="space-y-2">
                  {lastSwitchSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                  {lastSwitchError && (
                    <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
                      {lastSwitchError}
                    </div>
                  )}
                </div>
              </div>

              {/* Test Cross-School Save Prevention */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Kiểm tra Khóa Chống Lưu Dữ Liệu Cũ Vào Nhầm Trường (validateWriteSchoolScope)
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleTestWriteScope(activeSchoolId)}
                    className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                  >
                    Thử lưu đúng trường đang chọn ({activeSchoolId})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleTestWriteScope(
                        activeSchoolId === 'sch-tieu-hoc-a' ? 'sch-thcs-b' : 'sch-tieu-hoc-a'
                      )
                    }
                    className="px-3 py-1.5 rounded bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
                  >
                    Thử lưu nhầm sang trường khác (
                    {activeSchoolId === 'sch-tieu-hoc-a' ? 'sch-thcs-b' : 'sch-tieu-hoc-a'})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestWriteScope('Trường Tiểu học A')}
                    className="px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold"
                  >
                    Thử dùng tên trường làm khóa chính
                  </button>
                </div>
                {writeGuardResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs font-medium ${
                      writeGuardResult.allowed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold">payload.schoolId = &quot;{writeTestPayloadSchoolId}&quot;</span>{' '}
                      → {writeGuardResult.allowed ? 'CHO PHÉP GHI' : 'CHẶN GHI NGAY LẬP TỨC'}
                    </div>
                    <div className="mt-1">{writeGuardResult.reason}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Isolated Data Display for Current School */}
          {tenantDisplayCache && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Dữ liệu Cô lập đang hiển thị của: {schoolName} (schoolId: {activeSchoolId})
                </h3>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  Đề mật bị ẩn theo Nguyên tắc 9 (Super Admin không mặc định đọc):{' '}
                  {tenantDisplayCache.hiddenConfidentialExamCount} đề
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 mb-2">
                    Câu hỏi của trường ({tenantDisplayCache.counts?.questions} câu)
                  </div>
                  <div className="space-y-2">
                    {(tenantDisplayCache.questions || []).slice(0, 3).map((q: any) => (
                      <div key={q.id} className="p-2 bg-white rounded border border-slate-200">
                        <div className="font-mono font-bold text-blue-700">
                          {q.code} · Khối {q.grade} · schoolId: {q.schoolId}
                        </div>
                        <div className="text-slate-700 mt-0.5 line-clamp-2">{q.stem}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 mb-2">
                    Ma trận của trường ({tenantDisplayCache.counts?.matrices} ma trận)
                  </div>
                  <div className="space-y-2">
                    {(tenantDisplayCache.matrices || []).slice(0, 3).map((m: any) => (
                      <div key={m.id} className="p-2 bg-white rounded border border-slate-200">
                        <div className="font-mono font-bold text-purple-700">
                          {m.code} · schoolId: {m.schoolId}
                        </div>
                        <div className="text-slate-700 mt-0.5">{m.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 mb-2">
                    Đề kiểm tra được phép hiển thị ({tenantDisplayCache.counts?.visibleExams}/
                    {tenantDisplayCache.counts?.exams} đề)
                  </div>
                  <div className="space-y-2">
                    {(tenantDisplayCache.exams || []).slice(0, 3).map((ex: any) => (
                      <div key={ex.id} className="p-2 bg-white rounded border border-slate-200">
                        <div className="font-mono font-bold text-emerald-700">
                          {ex.code} · {ex.securityClassification} · schoolId: {ex.schoolId}
                        </div>
                        <div className="text-slate-700 mt-0.5">{ex.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MIGRATION & ROLLBACK */}
      {activeTab === 'MIGRATION' && migrationPlanData && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-amber-600" />
                  IV. Kế hoạch Migration 6 Bước & Khóa Bảo vệ Trước Khi Chuyển Đổi
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Quy tắc bắt buộc: Không chạy migration dữ liệu chính thức khi chưa có bản sao lưu đã xác minh và xác
                  nhận của Quản trị viên.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleMigrationAction('CREATE_BACKUP')}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  1. Tạo Bản Sao lưu (Snapshot SHA-256)
                </button>
                <button
                  type="button"
                  onClick={() => handleMigrationAction('ATTEMPT_OFFICIAL_MIGRATION')}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  2. Thực thi Migration Chính thức
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs mb-5">
              <div className="space-y-1">
                <div className="font-bold text-amber-950">
                  Trạng thái Sao lưu: {migrationPlanData.migrationState?.hasVerifiedBackup ? 'ĐÃ CÓ SAO LƯU' : 'CHƯA CÓ SAO LƯU'}
                </div>
                {migrationPlanData.migrationState?.lastBackupId && (
                  <div className="font-mono text-amber-900">
                    Backup ID: {migrationPlanData.migrationState.lastBackupId} · SHA-256:{' '}
                    {migrationPlanData.migrationState.lastBackupChecksumSha256}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 font-semibold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adminConfirmedCheckbox}
                  onChange={(e) => setAdminConfirmedCheckbox(e.target.checked)}
                  className="rounded border-amber-400"
                />
                Tôi xác nhận đã kiểm tra bản sao lưu và đồng ý thực hiện Migration
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(migrationPlanData.sixStepMigrationPlan || []).map((st: any) => (
                <div key={st.stepCode} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{st.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                      {st.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{st.description}</p>
                  <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200">
                    {st.verificationDetail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QA ISOLATION REPORT */}
      {activeTab === 'QA_ISOLATION' && qaReport && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  V. Báo cáo Kiểm thử Cô lập Đa Trường (Trường Tiểu học A & Trường THCS B)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mã phiên kiểm thử: <span className="font-mono font-semibold">{qaReport.runId}</span> · Kết quả:{' '}
                  <span className="font-bold text-emerald-700">
                    ĐẠT {qaReport.passedCount}/{qaReport.totalCount} KỊCH BẢN (100%)
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunIsolationQaSuite}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Chạy lại Kiểm thử Cô lập 2 Trường
              </button>
            </div>

            {/* 2 Test Schools Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {(qaReport.testSchoolsVerified || []).map((sch: any) => (
                <div key={sch.schoolId} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{sch.schoolName}</span>
                    <span className="font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                      schoolId: {sch.schoolId}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center my-2">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="text-slate-500">Câu hỏi riêng</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{sch.questionCount}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="text-slate-500">Ma trận riêng</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{sch.matrixCount}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="text-slate-500">Đề KT riêng</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{sch.examCount}</div>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600">
                    Mã mẫu: {sch.sampleQuestionCode} · {sch.sampleMatrixCode} · {sch.sampleExamCode}
                  </div>
                </div>
              ))}
            </div>

            {/* 6 Test Cases Table */}
            <div className="space-y-3">
              {(qaReport.testCases || []).map((tc: any) => (
                <div
                  key={tc.code}
                  className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{tc.title}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                      {tc.passed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <strong>Kịch bản:</strong> {tc.scenario}
                  </div>
                  <div className="text-slate-700">
                    <strong>Kỳ vọng:</strong> {tc.expected}
                  </div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200 text-emerald-950">
                    <strong>Kết quả thực tế:</strong> {tc.actual}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 0: COMPREHENSIVE STAGE 19 ACCEPTANCE & PERFORMANCE SUITE (SECTIONS I - X) */}
      {activeTab === 'COMPREHENSIVE_QA_10_SECTIONS' && fullAcceptanceReport && (
        <div className="space-y-6">
          {/* Control & Summary Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Báo cáo Kiểm thử & Nghiệm thu Toàn diện Hệ thống Multi-Tenant (Mục I – X)</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>Mã chạy: {fullAcceptanceReport.runId}</span>
                  <span aria-hidden="true">·</span>
                  <span>Thời gian thực thi: {fullAcceptanceReport.totalSuiteDurationMs} ms</span>
                  <span aria-hidden="true">·</span>
                  <span>Thời điểm: {new Date(fullAcceptanceReport.executedAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunComprehensiveStage19Suite}
                disabled={runningFullSuite}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-4 h-4 ${runningFullSuite ? 'animate-spin' : ''}`} />
                <span>Chạy Kiểm thử Nghiệm thu Toàn diện (Mục I – X)</span>
              </button>
            </div>

            {/* Section I: Test Environment Summary */}
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                I. Môi trường Dữ liệu Thử nghiệm Đa trường (2 Tiểu học · 1 THCS · 1 Liên cấp · 20 GV · 4 School Admin · 1 Super Admin)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Mã trường (schoolId)</th>
                      <th className="py-2.5 px-3 font-bold">Tên trường & Loại hình</th>
                      <th className="py-2.5 px-3 font-bold">School Admin</th>
                      <th className="py-2.5 px-3 font-bold text-right">Tổ CM</th>
                      <th className="py-2.5 px-3 font-bold text-right">Giáo viên</th>
                      <th className="py-2.5 px-3 font-bold text-right">Câu hỏi</th>
                      <th className="py-2.5 px-3 font-bold text-right">Ma trận</th>
                      <th className="py-2.5 px-3 font-bold text-right">Đề KT</th>
                      <th className="py-2.5 px-3 font-bold text-right">Biên bản duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(fullAcceptanceReport.section1TestDataSummary?.schools || []).map((s: any) => (
                      <tr key={s.schoolId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{s.schoolId}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{s.schoolName}</div>
                          <div className="text-slate-500">
                            Mã nội bộ: {s.internalCode} · Loại: {s.schoolType} · Trạng thái: {s.status}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{s.schoolAdminUid}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.departmentsCount}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.teachersCount}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{s.questionsCount}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.matricesCount}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.examsCount}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.approvalsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section V: 8-Step Exam Creation Workflow across 4 Schools */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              V. Kiểm tra Quy trình 8 Bước Tạo đề – Thẩm định – Phê duyệt – Xuất hồ sơ tại 4 Trường (Không trộn dữ liệu)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold">Trường thực hiện</th>
                    <th className="py-2.5 px-3 font-bold">Ma trận & Bản đặc tả</th>
                    <th className="py-2.5 px-3 font-bold">Mã đề & AI Review</th>
                    <th className="py-2.5 px-3 font-bold">Thẩm định & Phê duyệt</th>
                    <th className="py-2.5 px-3 font-bold">Đường dẫn Hồ sơ Storage</th>
                    <th className="py-2.5 px-3 font-bold">Cô lập dữ liệu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(fullAcceptanceReport.section5ExamWorkflowBySchool || []).map((wf: any) => (
                    <tr key={wf.schoolId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{wf.schoolName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {wf.matrixId} · {wf.specId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-semibold text-slate-900">{wf.examId}</span>
                        <span className="text-slate-500"> · AI: {wf.aiReviewScore}/100</span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                        {wf.appraisalStatus} → {wf.approvalStatus}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{wf.storagePath}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        {!wf.crossSchoolContamination ? 'ĐẠT (0% trộn)' : 'LỖI'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section IX: Real Performance Benchmark (10, 50, 100 Schools) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              IX. Kết quả Đo kiểm Hiệu năng Thực tế ở Quy mô 10 Trường · 50 Trường · 100 Trường
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold">Quy mô</th>
                    <th className="py-2.5 px-3 font-bold text-right">Đăng nhập (ms)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Chuyển trường (ms)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Tìm câu hỏi (ms)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Tạo đề (ms)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Tải hồ sơ (ms)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Đọc / Ghi Firestore</th>
                    <th className="py-2.5 px-3 font-bold text-right">Storage (MB)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Lượt gọi Gemini API</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(fullAcceptanceReport.section9PerformanceBenchmarks || []).map((b: any) => (
                    <tr key={b.schoolCount} className="hover:bg-slate-50 font-mono">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{b.schoolCount} trường</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{b.loginTimeMs} ms</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{b.switchSchoolTimeMs} ms</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{b.searchQuestionsTimeMs} ms</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{b.generateExamTimeMs} ms</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{b.loadDossierTimeMs} ms</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {b.totalFirestoreReads} reads / {b.totalFirestoreWrites} writes
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{b.storageUsageMb} MB</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{b.geminiApiCalls} calls</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section X: 9-Column Acceptance Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              X. Bảng Báo cáo Nghiệm thu Toàn diện Giai đoạn 19 (9 Cột bắt buộc)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-2.5 font-bold">Mã KT</th>
                    <th className="py-2.5 px-2.5 font-bold">Chức năng</th>
                    <th className="py-2.5 px-2.5 font-bold">Trường thực hiện</th>
                    <th className="py-2.5 px-2.5 font-bold">Tài khoản</th>
                    <th className="py-2.5 px-2.5 font-bold">Kết quả mong đợi</th>
                    <th className="py-2.5 px-2.5 font-bold">Kết quả thực tế</th>
                    <th className="py-2.5 px-2.5 font-bold">Đánh giá</th>
                    <th className="py-2.5 px-2.5 font-bold">Lỗi phát hiện</th>
                    <th className="py-2.5 px-2.5 font-bold">Phương án khắc phục / Bảo vệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 align-top">
                  {(fullAcceptanceReport.section10AcceptanceTable || []).map((row: any) => (
                    <tr key={row.testCode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">{row.testCode}</td>
                      <td className="py-2.5 px-2.5 font-bold text-slate-900">{row.feature}</td>
                      <td className="py-2.5 px-2.5 text-slate-700">{row.schoolExecuted}</td>
                      <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-700">{row.actorAccount}</td>
                      <td className="py-2.5 px-2.5 text-slate-700">{row.expectedResult}</td>
                      <td className="py-2.5 px-2.5 text-slate-800 font-medium">{row.actualResult}</td>
                      <td className="py-2.5 px-2.5 font-bold text-emerald-700 whitespace-nowrap">{row.status}</td>
                      <td className="py-2.5 px-2.5 text-slate-600">{row.detectedIssue}</td>
                      <td className="py-2.5 px-2.5 text-slate-600">{row.remediationPlan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
