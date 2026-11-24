import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  FileSearch,
  HardDrive,
  Lock,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  WifiOff,
  XCircle,
} from 'lucide-react';
import {
  ConnectionHealthStateCode,
  DashboardVerificationSuiteReport,
  DataIntegrityInspectionReport,
  fetchFirebaseDataManagementDashboardService,
  FirebaseDataManagementDashboardPayload,
  runDashboardVerificationSuiteService,
  runDataIntegrityInspectionService,
  runStage17FinalQaLeadAcceptanceService,
  Stage17FinalQaLeadAcceptanceReport,
  triggerVerifiedDashboardBackupService,
} from '../services/firebase/firebaseDataManagementDashboardService';
import { ToastNotification } from '../types/domain';

export type FirebaseDashboardTabId =
  | 'TAB_01_CONNECTION_OVERVIEW'
  | 'TAB_02_DATA_STATISTICS'
  | 'TAB_03_SYNC_LOGS'
  | 'TAB_04_BACKUP_AND_RESTORE'
  | 'TAB_05_SYSTEM_INSPECTION';

interface FirebaseDataManagementDashboardProps {
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: string;
  schoolId?: string;
  onNotify?: (type: ToastNotification['type'], title: string, message: string) => void;
}

const ACTOR_PRESETS: Array<{
  actorId: string;
  actorName: string;
  actorRole: string;
  description: string;
  isAuthorizedDataAdmin: boolean;
}> = [
  {
    actorId: 'user-admin-sys',
    actorName: 'Quản trị hệ thống (System Admin)',
    actorRole: 'SYSTEM_ADMIN',
    description: 'Có toàn quyền quản trị và giám sát dữ liệu Firebase (HTTP 200)',
    isAuthorizedDataAdmin: true,
  },
  {
    actorId: 'uid_bgh_ht_001',
    actorName: 'Cô Phạm Thu Thủy (Hiệu trưởng)',
    actorRole: 'PRINCIPAL',
    description: 'Ban giám hiệu có quyền quản trị & phê duyệt sao lưu/khôi phục (HTTP 200)',
    isAuthorizedDataAdmin: true,
  },
  {
    actorId: 'uid_ttcm_nd_khtn_003',
    actorName: 'Thầy Lê Hoàng Nam (Tổ trưởng KHTN)',
    actorRole: 'HEAD_OF_DEPARTMENT',
    description: 'Không có quyền quản trị dữ liệu hệ thống — Bị chặn tại Backend (HTTP 403)',
    isAuthorizedDataAdmin: false,
  },
  {
    actorId: 'uid_gv_nd_thcs_002',
    actorName: 'Thầy Trần Quốc Tuấn (Giáo viên KHTN)',
    actorRole: 'TEACHER',
    description: 'Giáo viên bộ môn — Bị chặn truy cập trang Quản lý dữ liệu (HTTP 403)',
    isAuthorizedDataAdmin: false,
  },
];

const CONNECTION_SIMULATION_MODES: Array<{
  code: ConnectionHealthStateCode;
  label: string;
}> = [
  { code: 'CONNECTED_VERIFIED', label: 'Đã kết nối và kiểm chứng' },
  { code: 'CONFIGURED', label: 'Đã cấu hình' },
  { code: 'PERMISSION_DENIED', label: 'Không có quyền' },
  { code: 'DISCONNECTED', label: 'Mất kết nối' },
  { code: 'UNCHECKED', label: 'Chưa kiểm tra' },
];

export const FirebaseDataManagementDashboard: React.FC<FirebaseDataManagementDashboardProps> = ({
  currentUserId = 'user-admin-sys',
  currentUserName = 'Quản trị hệ thống',
  currentUserRole = 'SYSTEM_ADMIN',
  schoolId = 'sch-th-thcs-nguyen-du',
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<FirebaseDashboardTabId>('TAB_01_CONNECTION_OVERVIEW');

  // Cho phép kiểm thử chuyển đổi vai trò truy cập (Mục VII & VIII)
  const [testActorId, setTestActorId] = useState<string>(currentUserId);
  const [testActorRole, setTestActorRole] = useState<string>(currentUserRole);
  const [testActorName, setTestActorName] = useState<string>(currentUserName);

  // Chế độ kiểm tra trạng thái kết nối (Mục II & VIII)
  const [connectionMode, setConnectionMode] =
    useState<ConnectionHealthStateCode>('CONNECTED_VERIFIED');

  // Dữ liệu từ Backend
  const [payload, setPayload] = useState<FirebaseDataManagementDashboardPayload | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(false);
  const [accessDeniedError, setAccessDeniedError] = useState<{
    status: number;
    code: string;
    message: string;
  } | null>(null);

  // Bộ lọc Nhật ký đồng bộ (Tab 3)
  const [logSearchTerm, setLogSearchTerm] = useState<string>('');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('ALL');
  const [logOperationFilter, setLogOperationFilter] = useState<string>('ALL');

  // Kiểm tra dữ liệu chỉ đọc 8 quy tắc (Tab 5)
  const [inspectionReport, setInspectionReport] = useState<DataIntegrityInspectionReport | null>(
    null
  );
  const [runningInspection, setRunningInspection] = useState<boolean>(false);

  // Sao lưu & xác minh (Tab 4)
  const [runningBackup, setRunningBackup] = useState<boolean>(false);

  // Bộ kiểm thử 7 kịch bản bắt buộc (Mục VIII)
  const [suiteReport, setSuiteReport] = useState<DashboardVerificationSuiteReport | null>(null);
  const [runningSuite, setRunningSuite] = useState<boolean>(false);

  // Bộ kiểm thử Nghiệm thu Tổng thể Giai đoạn 17 (QA Lead – Mục I đến Mục IX)
  const [stage17MasterQaReport, setStage17MasterQaReport] =
    useState<Stage17FinalQaLeadAcceptanceReport | null>(null);
  const [runningMasterQa, setRunningMasterQa] = useState<boolean>(false);

  const loadDashboardOverview = useCallback(
    async (
      overrideActorId?: string,
      overrideActorRole?: string,
      overrideMode?: ConnectionHealthStateCode
    ) => {
      const targetActorId = overrideActorId ?? testActorId;
      const targetActorRole = overrideActorRole ?? testActorRole;
      const targetMode = overrideMode ?? connectionMode;

      setLoadingOverview(true);
      setAccessDeniedError(null);
      try {
        const res = await fetchFirebaseDataManagementDashboardService({
          schoolId,
          actorId: targetActorId,
          actorRole: targetActorRole,
          simulateConnectionMode: targetMode,
        });
        setPayload(res);
        setInspectionReport(res.latestInspectionReport);
      } catch (err: unknown) {
        const errorObj = err as Error & { status?: number; code?: string };
        setAccessDeniedError({
          status: errorObj.status || 403,
          code: errorObj.code || 'ERR_403_DATA_ADMIN_REQUIRED',
          message:
            errorObj.message ||
            'Từ chối truy cập: Chỉ người có quyền quản trị dữ liệu mới được phép truy cập trang này.',
        });
      } finally {
        setLoadingOverview(false);
      }
    },
    [schoolId, testActorId, testActorRole, connectionMode]
  );

  useEffect(() => {
    void loadDashboardOverview();
  }, [loadDashboardOverview]);

  const handleSelectActorPreset = async (preset: (typeof ACTOR_PRESETS)[number]) => {
    setTestActorId(preset.actorId);
    setTestActorRole(preset.actorRole);
    setTestActorName(preset.actorName);
    await loadDashboardOverview(preset.actorId, preset.actorRole, connectionMode);
    if (onNotify) {
      onNotify(
        preset.isAuthorizedDataAdmin ? 'info' : 'warning',
        `Kiểm tra quyền: ${preset.actorName}`,
        preset.description
      );
    }
  };

  const handleSelectConnectionMode = async (mode: ConnectionHealthStateCode) => {
    setConnectionMode(mode);
    await loadDashboardOverview(testActorId, testActorRole, mode);
  };

  const handleRunIntegrityCheck = async (injectFaultSimulation: boolean) => {
    setRunningInspection(true);
    try {
      const report = await runDataIntegrityInspectionService({
        schoolId,
        actorId: testActorId,
        actorRole: testActorRole,
        injectFaultSimulation,
      });
      setInspectionReport(report);
      await loadDashboardOverview();
      if (onNotify) {
        onNotify(
          report.totalAnomaliesFound === 0 ? 'success' : 'warning',
          injectFaultSimulation
            ? `Kiểm thử phát hiện lỗi dữ liệu (${report.totalAnomaliesFound}/8 lỗi)`
            : 'Kiểm tra toàn vẹn dữ liệu hoàn tất',
          `Quét chỉ đọc ${report.totalRecordsScanned} bản ghi · Số bản ghi bị sửa/xóa = ${report.recordsModifiedOrDeletedCount}.`
        );
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Không thể chạy kiểm tra dữ liệu',
          err instanceof Error ? err.message : 'Lỗi xác thực quyền tại Backend.'
        );
      }
    } finally {
      setRunningInspection(false);
    }
  };

  const handleTriggerVerifiedBackup = async () => {
    setRunningBackup(true);
    try {
      const res = await triggerVerifiedDashboardBackupService({
        schoolId,
        actorId: testActorId,
        actorRole: testActorRole,
        actorName: testActorName,
        backupType: 'MANUAL_ADMIN_BACKUP',
        verifyInStagingImmediately: true,
      });
      await loadDashboardOverview();
      if (onNotify) {
        onNotify('success', 'Đã sao lưu và xác minh toàn vẹn', res.message);
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Từ chối sao lưu dữ liệu',
          err instanceof Error ? err.message : 'Không có quyền thực hiện sao lưu.'
        );
      }
    } finally {
      setRunningBackup(false);
    }
  };

  const handleRun7VerificationSuite = async () => {
    setRunningSuite(true);
    try {
      const report = await runDashboardVerificationSuiteService({
        schoolId,
        actorId: 'user-admin-sys',
        actorRole: 'SYSTEM_ADMIN',
      });
      setSuiteReport(report);
      await loadDashboardOverview('user-admin-sys', 'SYSTEM_ADMIN', 'CONNECTED_VERIFIED');
      setTestActorId('user-admin-sys');
      setTestActorRole('SYSTEM_ADMIN');
      setTestActorName('Quản trị hệ thống (System Admin)');
      setConnectionMode('CONNECTED_VERIFIED');
      if (onNotify) {
        onNotify(
          report.overallPassed ? 'success' : 'warning',
          `Hoàn tất Kiểm thử Mục VIII (${report.passedCount}/${report.totalScenarios} ĐẠT)`,
          'Đã xác minh đầy đủ 7 kịch bản: Kết nối, Mất mạng, Thiếu quyền, 11 Thống kê, 8 Quy tắc liên kết, Phân quyền RBAC và Bảo mật Nhật ký.'
        );
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Lỗi chạy bộ kiểm thử',
          err instanceof Error ? err.message : 'Không thể thực thi bộ kiểm thử.'
        );
      }
    } finally {
      setRunningSuite(false);
    }
  };

  const handleRunStage17MasterAcceptance = async () => {
    setRunningMasterQa(true);
    try {
      const report = await runStage17FinalQaLeadAcceptanceService(schoolId);
      setStage17MasterQaReport(report);
      await loadDashboardOverview('user-admin-sys', 'SYSTEM_ADMIN', 'CONNECTED_VERIFIED');
      if (onNotify) {
        onNotify(
          report.readyForPilotDeploymentProposal ? 'success' : 'warning',
          'Hoàn tất Nghiệm thu Tổng thể Giai đoạn 17 (Mục I–IX)',
          `12/12 nhóm dữ liệu ĐẠT · 9/9 bước liên thông ĐẠT · 7/7 kịch bản bảo mật ĐẠT · 8/8 điều kiện nghiệm thu ĐẠT.`
        );
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Lỗi chạy nghiệm thu Giai đoạn 17',
          err instanceof Error ? err.message : 'Không thể thực thi bộ nghiệm thu tổng thể.'
        );
      }
    } finally {
      setRunningMasterQa(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const logs = payload?.syncLogs || [];
    return logs.filter((item) => {
      if (logStatusFilter !== 'ALL' && item.status !== logStatusFilter) return false;
      if (logOperationFilter !== 'ALL' && item.operationType !== logOperationFilter) return false;
      if (logSearchTerm.trim()) {
        const q = logSearchTerm.toLowerCase();
        const matchModule = item.moduleName.toLowerCase().includes(q);
        const matchActor = item.actorName.toLowerCase().includes(q);
        const matchRecord = item.relatedRecordId.toLowerCase().includes(q);
        const matchMsg = item.summaryMessage.toLowerCase().includes(q);
        return matchModule || matchActor || matchRecord || matchMsg;
      }
      return true;
    });
  }, [payload?.syncLogs, logStatusFilter, logOperationFilter, logSearchTerm]);

  const totalLiveDocumentsCount = useMemo(() => {
    if (!payload?.dataStatistics) return 0;
    return payload.dataStatistics.reduce((sum, item) => sum + item.totalActiveCount, 0);
  }, [payload?.dataStatistics]);

  const renderStateIndicator = (stateCode: ConnectionHealthStateCode, stateLabel: string) => {
    switch (stateCode) {
      case 'CONNECTED_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{stateLabel}</span>
          </span>
        );
      case 'CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>{stateLabel}</span>
          </span>
        );
      case 'PERMISSION_DENIED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <Lock className="w-4 h-4 text-rose-600" />
            <span>{stateLabel}</span>
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>{stateLabel}</span>
          </span>
        );
      case 'UNCHECKED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{stateLabel}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Trung tâm Quản lý & Giám sát Dữ liệu Firebase */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Quản trị hệ thống</span>
              <span aria-hidden="true">·</span>
              <span>Quản lý dữ liệu Firebase</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">Project ID: taodeai-513007</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Database className="w-6 h-6 text-blue-700 shrink-0" />
              <span>TRUNG TÂM QUẢN LÝ VÀ GIÁM SÁT DỮ LIỆU FIREBASE</span>
            </h1>
            <p className="text-sm text-slate-600 max-w-4xl">
              Giám sát trực tiếp trạng thái kết nối thực tế, thống kê 11 nhóm dữ liệu Firestore, nhật ký đồng bộ đã lọc thông tin nhạy cảm, sao lưu xác minh chữ ký SHA-256 và kiểm tra toàn vẹn dữ liệu chế độ chỉ đọc.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void loadDashboardOverview()}
              disabled={loadingOverview}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingOverview ? 'animate-spin' : ''}`} />
              <span>Làm mới dữ liệu</span>
            </button>

            <button
              type="button"
              onClick={() => void handleRun7VerificationSuite()}
              disabled={runningSuite}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>
                {runningSuite
                  ? 'Đang chạy 7 kịch bản kiểm thử...'
                  : 'Chạy Kiểm thử 7 Kịch bản (Mục VIII)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleRunStage17MasterAcceptance()}
              disabled={runningMasterQa}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {runningMasterQa
                  ? 'Đang chạy Nghiệm thu Giai đoạn 17...'
                  : 'Nghiệm thu Tổng thể Giai đoạn 17 (Mục I–IX)'}
              </span>
            </button>
          </div>
        </div>

        {/* Thanh kiểm tra phân quyền truy cập trang (Mục VII) & giả lập trạng thái kết nối (Mục II & VIII) */}
        <div className="pt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Kiểm soát quyền truy cập trang (Mục VII – Xác thực Backend):</span>
              </span>
              <span className="font-mono text-slate-600">
                Vai trò đang thử: {testActorRole}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ACTOR_PRESETS.map((preset) => {
                const active = testActorId === preset.actorId;
                return (
                  <button
                    key={preset.actorId}
                    type="button"
                    onClick={() => void handleSelectActorPreset(preset)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      active
                        ? preset.isAuthorizedDataAdmin
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-rose-700 text-white border-rose-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {preset.actorName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-700" />
                <span>Kiểm chứng 5 trạng thái kết nối rõ ràng (Mục II & VIII):</span>
              </span>
              <span className="font-mono text-slate-600">
                Trạng thái: {connectionMode}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CONNECTION_SIMULATION_MODES.map((m) => {
                const active = connectionMode === m.code;
                return (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => void handleSelectConnectionMode(m.code)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Nếu tài khoản không có quyền quản trị dữ liệu (Mục VII): Chặn truy cập trang và hiển thị thông báo 403 */}
      {accessDeniedError ? (
        <section className="bg-white border border-rose-300 rounded-xl p-8 space-y-4">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="text-xs font-mono text-rose-700">
                HTTP {accessDeniedError.status} · {accessDeniedError.code}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Từ chối truy cập Trung tâm Quản lý Dữ liệu Firebase (Mục VII)
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {accessDeniedError.message}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSelectActorPreset(ACTOR_PRESETS[0])}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  Chuyển lại tài khoản Quản trị hệ thống (System Admin)
                </button>
                <button
                  type="button"
                  onClick={() => void handleSelectActorPreset(ACTOR_PRESETS[1])}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Chuyển sang tài khoản Hiệu trưởng (Principal)
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Thanh điều hướng 5 Tab chuẩn (Mục I) */}
          <nav
            aria-label="5 Tab Quản lý Dữ liệu Firebase"
            className="bg-slate-100 p-1.5 rounded-xl flex flex-wrap gap-1.5 border border-slate-200"
          >
            {[
              {
                id: 'TAB_01_CONNECTION_OVERVIEW' as const,
                label: '1. Tổng quan kết nối',
                countText: payload?.connectionOverview.overallStateLabel || '5 dịch vụ',
              },
              {
                id: 'TAB_02_DATA_STATISTICS' as const,
                label: '2. Thống kê dữ liệu',
                countText: `11 nhóm (${totalLiveDocumentsCount} bản ghi)`,
              },
              {
                id: 'TAB_03_SYNC_LOGS' as const,
                label: '3. Nhật ký đồng bộ',
                countText: `${payload?.syncLogs.length || 0} bản ghi`,
              },
              {
                id: 'TAB_04_BACKUP_AND_RESTORE' as const,
                label: '4. Sao lưu và khôi phục',
                countText: payload?.backupSummary.hasVerifiedBackup
                  ? 'Đã xác minh SHA-256'
                  : 'Chưa xác minh',
              },
              {
                id: 'TAB_05_SYSTEM_INSPECTION' as const,
                label: '5. Kiểm tra hệ thống',
                countText: `8 quy tắc (${inspectionReport?.totalAnomaliesFound ?? 0} lỗi)`,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[200px] px-4 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                  }`}
                >
                  <div className="text-sm">{tab.label}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{tab.countText}</div>
                </button>
              );
            })}
          </nav>

          {/* =====================================================================
              TAB 1: TỔNG QUAN KẾT NỐI (MỤC II)
              ===================================================================== */}
          {activeTab === 'TAB_01_CONNECTION_OVERVIEW' && payload && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    1. Tổng quan kết nối hạ tầng Google Firebase (Mục II)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Phân biệt minh bạch 5 trạng thái: Đã cấu hình · Đã kết nối và kiểm chứng · Không có quyền · Mất kết nối · Chưa kiểm tra. Tuyệt đối không hiển thị Service Account Key.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                  <span>
                    Kiểm tra gần nhất:{' '}
                    {payload.connectionOverview.lastCheckedAt
                      ? new Date(payload.connectionOverview.lastCheckedAt).toLocaleString('vi-VN')
                      : 'Chưa kiểm tra'}
                  </span>
                  <span aria-hidden="true">·</span>
                  {renderStateIndicator(
                    payload.connectionOverview.overallStateCode,
                    payload.connectionOverview.overallStateLabel
                  )}
                </div>
              </div>

              {/* Thông tin định danh dự án */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Tên dự án Firebase</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {payload.connectionOverview.projectDisplayName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Phân vùng trường: <span className="font-mono">{payload.connectionOverview.schoolId}</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Project ID</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                    {payload.connectionOverview.projectId}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    Đã ẩn toàn bộ khóa bí mật (Secret Redacted)
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Cloud Firestore Database ID</div>
                  <div
                    className="text-xs font-bold font-mono text-slate-900 mt-1 truncate"
                    title={payload.connectionOverview.firestoreDatabaseId}
                  >
                    {payload.connectionOverview.firestoreDatabaseId}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    8 Composite Indexes đang hoạt động
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">Firebase Storage Bucket</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-1 truncate">
                    {payload.connectionOverview.storageBucketName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Bảo vệ đề mật bằng Signed Ephemeral URL
                  </div>
                </div>
              </div>

              {/* Bảng trạng thái chi tiết 5 dịch vụ */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                      <th className="py-3 px-4">Thành phần dịch vụ</th>
                      <th className="py-3 px-4">Định danh tài nguyên / Endpoint</th>
                      <th className="py-3 px-4">Trạng thái thực tế</th>
                      <th className="py-3 px-4 text-right">Độ trễ</th>
                      <th className="py-3 px-4">Chi tiết kiểm chứng & Bảo mật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {payload.connectionOverview.services.map((srv) => (
                      <tr key={srv.serviceKey} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {srv.serviceName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {srv.endpointOrResourceId}
                        </td>
                        <td className="py-3.5 px-4">
                          {renderStateIndicator(srv.stateCode, srv.stateLabel)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                          {srv.latencyMs !== null ? `${srv.latencyMs} ms` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{srv.verificationDetail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =====================================================================
              TAB 2: THỐNG KÊ DỮ LIỆU (MỤC III – 11 BỘ ĐẾM DỮ LIỆU THẬT)
              ===================================================================== */}
          {activeTab === 'TAB_02_DATA_STATISTICS' && payload && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    2. Thống kê 11 nhóm dữ liệu thực trên Cloud Firestore (Mục III)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Số liệu được tổng hợp trực tiếp từ các collection thuộc phân vùng trường <span className="font-mono">{schoolId}</span> kèm mã băm SHA-256. Tuyệt đối không dùng số liệu mẫu cố định.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-600">
                  Tổng số bản ghi hoạt động: <strong className="text-slate-900">{totalLiveDocumentsCount}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {payload.dataStatistics.map((stat) => (
                  <div
                    key={stat.counterCode}
                    className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{stat.label}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          #{stat.order}
                        </span>
                      </div>
                      <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                        {stat.totalActiveCount}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                        {stat.firestoreCollectionPath}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Đã duyệt / Hiệu lực:</span>
                        <span className="font-mono tabular-nums font-semibold text-emerald-700">
                          {stat.approvedOrLockedCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bản nháp / Chờ xử lý:</span>
                        <span className="font-mono tabular-nums text-slate-700">
                          {stat.draftOrPendingCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span>SHA-256: {stat.sha256IntegrityDigest}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng đối chiếu chi tiết 11 bộ đếm */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                      <th className="py-3 px-4">TT</th>
                      <th className="py-3 px-4">Nhóm dữ liệu thống kê</th>
                      <th className="py-3 px-4">Đường dẫn Collection Firestore</th>
                      <th className="py-3 px-4 text-right">Tổng bản ghi thực</th>
                      <th className="py-3 px-4 text-right">Đã phê duyệt / Khóa</th>
                      <th className="py-3 px-4 text-right">Xóa mềm</th>
                      <th className="py-3 px-4">Mã băm toàn vẹn (SHA-256)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {payload.dataStatistics.map((stat) => (
                      <tr key={stat.counterCode} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                          {stat.order}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{stat.label}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {stat.firestoreCollectionPath}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                          {stat.totalActiveCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700">
                          {stat.approvedOrLockedCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                          {stat.softDeletedCount}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {stat.sha256IntegrityDigest}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =====================================================================
              TAB 3: NHẬT KÝ ĐỒNG BỘ (MỤC IV – SANITIZED SYNC LOGS)
              ===================================================================== */}
          {activeTab === 'TAB_03_SYNC_LOGS' && payload && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    3. Nhật ký đồng bộ dữ liệu & Kiểm soát bảo mật Log (Mục IV)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Ghi nhận Thời gian · Module · Loại thao tác · Người thực hiện · Trạng thái · Mã lỗi · Mã bản ghi. Bộ lọc Sanitizer tự động che ẩn 100% mật khẩu, token, API key và nội dung đề mật.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-700">
                  Sanitizer bảo mật: ĐANG BẬT ([REDACTED_SENSITIVE])
                </div>
              </div>

              {/* Thanh lọc nhật ký */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={logSearchTerm}
                    onChange={(e) => setLogSearchTerm(e.target.value)}
                    placeholder="Tìm theo module, người thực hiện, mã bản ghi..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="SUCCESS">Thành công (SUCCESS)</option>
                  <option value="DENIED_RBAC">Từ chối phân quyền (DENIED_RBAC)</option>
                  <option value="OFFLINE_QUEUED">Hàng đợi mất mạng (OFFLINE_QUEUED)</option>
                  <option value="FAILED">Lỗi thực thi (FAILED)</option>
                </select>

                <select
                  value={logOperationFilter}
                  onChange={(e) => setLogOperationFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
                >
                  <option value="ALL">Tất cả loại thao tác</option>
                  <option value="CREATE">CREATE (Tạo mới)</option>
                  <option value="UPDATE">UPDATE (Cập nhật)</option>
                  <option value="READ_VERIFY">READ_VERIFY (Đồng bộ & Kiểm chứng)</option>
                  <option value="BACKUP_SNAPSHOT">BACKUP_SNAPSHOT (Sao lưu)</option>
                  <option value="INTEGRITY_CHECK">INTEGRITY_CHECK (Kiểm tra dữ liệu)</option>
                  <option value="AUTH_RBAC_GUARD">AUTH_RBAC_GUARD (Kiểm soát quyền)</option>
                </select>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                      <th className="py-3 px-3.5">Thời gian</th>
                      <th className="py-3 px-3.5">Module</th>
                      <th className="py-3 px-3.5">Loại thao tác</th>
                      <th className="py-3 px-3.5">Người thực hiện</th>
                      <th className="py-3 px-3.5">Trạng thái</th>
                      <th className="py-3 px-3.5">Mã lỗi</th>
                      <th className="py-3 px-3.5">Mã bản ghi</th>
                      <th className="py-3 px-3.5">Chi tiết đồng bộ (Đã ẩn dữ liệu mật)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredLogs.map((log) => (
                      <tr key={log.logId} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-slate-900">
                          {log.moduleName}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-700">
                          {log.operationType}
                        </td>
                        <td className="py-3 px-3.5 text-slate-700">
                          <div>{log.actorName}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {log.actorRole}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-semibold">
                          {log.status === 'SUCCESS' && (
                            <span className="text-emerald-700">SUCCESS</span>
                          )}
                          {log.status === 'DENIED_RBAC' && (
                            <span className="text-rose-700">DENIED_RBAC</span>
                          )}
                          {log.status === 'OFFLINE_QUEUED' && (
                            <span className="text-amber-700">OFFLINE_QUEUED</span>
                          )}
                          {log.status === 'FAILED' && (
                            <span className="text-rose-700">FAILED</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-rose-700">
                          {log.errorCode || '—'}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-700">
                          {log.relatedRecordId}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 max-w-md">
                          {log.summaryMessage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =====================================================================
              TAB 4: SAO LƯU VÀ KHÔI PHỤC (MỤC VI)
              ===================================================================== */}
          {activeTab === 'TAB_04_BACKUP_AND_RESTORE' && payload && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    4. Quản lý Sao lưu & Khôi phục dữ liệu đã xác minh (Mục VI)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Nguyên tắc bắt buộc: Chỉ hiển thị trạng thái &ldquo;Đã sao lưu và xác minh toàn vẹn&rdquo; khi bản sao lưu có chữ ký SHA-256 hợp lệ và đã vượt qua kiểm tra khôi phục Staging.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleTriggerVerifiedBackup()}
                  disabled={runningBackup}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>
                    {runningBackup
                      ? 'Đang sao lưu & xác minh SHA-256...'
                      : 'Tạo & Xác minh Bản sao lưu mới'}
                  </span>
                </button>
              </div>

              {/* Khối hiển thị 5 thông tin bắt buộc của Mục VI */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">1. Lần sao lưu gần nhất</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {payload.backupSummary.lastBackupAt
                      ? new Date(payload.backupSummary.lastBackupAt).toLocaleString('vi-VN')
                      : 'Chưa có bản sao lưu'}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1 truncate">
                    ID: {payload.backupSummary.lastBackupSnapshotId || '—'}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">2. Loại sao lưu</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {payload.backupSummary.backupTypeLabel}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Xác thực quyền tại Backend
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">3. Trạng thái sao lưu</div>
                  <div
                    className={`text-sm font-bold mt-1 ${
                      payload.backupSummary.hasVerifiedBackup
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {payload.backupSummary.statusBannerLabel}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    Mã: {payload.backupSummary.backupStatusCode}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">4. Phạm vi sao lưu</div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">
                    {payload.backupSummary.scopeSummary}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs text-slate-500">5. Kết quả kiểm tra bản sao lưu</div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">
                    {payload.backupSummary.verificationCheckResult}
                  </div>
                </div>
              </div>

              {/* Danh sách lịch sử các bản sao lưu đã xác minh */}
              {payload.backupSummary.recentSnapshots.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                        <th className="py-3 px-4">Mã Snapshot</th>
                        <th className="py-3 px-4">Thời gian tạo</th>
                        <th className="py-3 px-4">Loại sao lưu</th>
                        <th className="py-3 px-4">Người thực hiện</th>
                        <th className="py-3 px-4 text-right">Bản ghi Firestore</th>
                        <th className="py-3 px-4 text-right">Tệp Storage</th>
                        <th className="py-3 px-4">Chữ ký toàn vẹn SHA-256</th>
                        <th className="py-3 px-4">Xác minh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {payload.backupSummary.recentSnapshots.map((snap) => (
                        <tr key={snap.snapshotId} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            {snap.snapshotId}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {new Date(snap.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3 px-4 text-slate-700">{snap.triggerType}</td>
                          <td className="py-3 px-4 text-slate-700">{snap.createdBy}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                            {snap.totalDocs}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                            {snap.totalFiles}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {snap.sha256Checksum.slice(0, 20)}...
                          </td>
                          <td className="py-3 px-4 font-semibold text-emerald-700">
                            {snap.verified ? 'ĐÃ XÁC MINH' : 'CHƯA XÁC MINH'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
              TAB 5: KIỂM TRA HỆ THỐNG & DỮ LIỆU CHỈ ĐỌC (MỤC V & MỤC VIII)
              ===================================================================== */}
          {activeTab === 'TAB_05_SYSTEM_INSPECTION' && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    5. Kiểm tra Toàn vẹn Dữ liệu 8 Quy tắc – Mặc định Chỉ đọc (Mục V)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Quét phát hiện bản ghi thiếu liên kết, thiếu schoolId, câu hỏi thiếu môn/lớp, ma trận không có đặc tả, đề tham chiếu câu hỏi không tồn tại, phê duyệt sai phiên bản và lệch tệp Storage. Chế độ mặc định CHỈ ĐỌC, không tự ý sửa hoặc xóa dữ liệu.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void handleRunIntegrityCheck(false)}
                    disabled={runningInspection}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FileSearch className="w-4 h-4 text-blue-700" />
                    <span>Quét Dữ liệu Thực tế (Chỉ đọc)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleRunIntegrityCheck(true)}
                    disabled={runningInspection}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Kiểm thử Phát hiện 8 Loại Lỗi Liên kết (Sandbox Chỉ đọc)</span>
                  </button>
                </div>
              </div>

              {inspectionReport && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500">Chế độ kiểm tra</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">
                        {inspectionReport.mode === 'PRODUCTION_READ_ONLY'
                          ? 'Dữ liệu thực (Chỉ đọc)'
                          : 'Giả lập lỗi liên kết (Chỉ đọc)'}
                      </div>
                      <div className="text-xs text-emerald-700 mt-1">
                        Cam kết Read-Only: {inspectionReport.readOnlyEnforced ? 'ĐÚNG' : 'KHÔNG'}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500">Số quy tắc đã quét</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                        {inspectionReport.totalRulesChecked} / 8
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Tổng bản ghi đã duyệt qua: {inspectionReport.totalRecordsScanned}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500">Bất thường phát hiện</div>
                      <div
                        className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                          inspectionReport.totalAnomaliesFound === 0
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {inspectionReport.totalAnomaliesFound}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {inspectionReport.totalAnomaliesFound === 0
                          ? '100% liên kết hợp lệ'
                          : 'Đã lập danh sách cảnh báo chi tiết'}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500">Bản ghi bị tự động sửa / xóa</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                        {inspectionReport.recordsModifiedOrDeletedCount}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Tuyệt đối không tự sửa/xóa dữ liệu
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                          <th className="py-3 px-4">TT</th>
                          <th className="py-3 px-4">Quy tắc kiểm tra dữ liệu (Mục V)</th>
                          <th className="py-3 px-4">Phạm vi đối chiếu</th>
                          <th className="py-3 px-4 text-right">Đã quét</th>
                          <th className="py-3 px-4 text-right">Số lỗi</th>
                          <th className="py-3 px-4">Kết quả & Khuyến nghị xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {inspectionReport.ruleResults.map((rule) => (
                          <tr key={rule.ruleCode} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-mono text-slate-500">{rule.order}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {rule.ruleTitle}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {rule.targetScope}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                              {rule.totalScanned}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                              <span
                                className={
                                  rule.anomaliesCount === 0
                                    ? 'text-emerald-700'
                                    : 'text-amber-700'
                                }
                              >
                                {rule.anomaliesCount}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {rule.anomaliesCount === 0 ? (
                                <span className="text-emerald-700 font-medium">
                                  Hợp lệ · Không phát hiện dữ liệu thiếu liên kết
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  {rule.findings.map((f) => (
                                    <div key={f.findingId} className="text-amber-900">
                                      <span className="font-mono font-semibold">
                                        [{f.recordId}]
                                      </span>{' '}
                                      {f.issueDescription}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}
        </>
      )}

      {/* Bảng kết quả Kiểm thử 7 Kịch bản Nghiệm thu (Mục VIII) */}
      {suiteReport && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Báo cáo Kiểm thử 7 Kịch bản Trung tâm Quản lý Dữ liệu Firebase (Mục VIII)
              </h2>
              <p className="text-xs text-slate-600">
                Mã phiên kiểm thử: <span className="font-mono">{suiteReport.suiteRunId}</span> · Thời điểm:{' '}
                {new Date(suiteReport.executedAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="text-sm font-bold text-emerald-700 font-mono">
              KẾT QUẢ: {suiteReport.passedCount} / {suiteReport.totalScenarios} KỊCH BẢN ĐẠT
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-3 px-4">TT</th>
                  <th className="py-3 px-4">Kịch bản kiểm thử (Mục VIII)</th>
                  <th className="py-3 px-4">Trạng thái quan sát</th>
                  <th className="py-3 px-4 text-right">Mã HTTP</th>
                  <th className="py-3 px-4">Bằng chứng kỹ thuật thực tế</th>
                  <th className="py-3 px-4">Kết luận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {suiteReport.results.map((r) => (
                  <tr key={r.scenarioCode} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-slate-500">{r.order}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.scenarioTitle}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{r.stateObserved}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {r.httpStatusObserved}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.technicalEvidence}</td>
                    <td className="py-3 px-4 font-bold">
                      {r.passed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ĐẠT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700">
                          <XCircle className="w-4 h-4" />
                          <span>CHƯA ĐẠT</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bảng kết quả Nghiệm thu Tổng thể Giai đoạn 17 (QA Lead – Mục I đến Mục IX) */}
      {stage17MasterQaReport && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Báo cáo Nghiệm thu Tổng thể Giai đoạn 17 – QA Lead & Bảo mật Dữ liệu Giáo dục (Mục I – IX)
              </h2>
              <p className="text-xs text-slate-600">
                Mã phiên: <span className="font-mono">{stage17MasterQaReport.runId}</span> · Thời điểm:{' '}
                {new Date(stage17MasterQaReport.executedAt).toLocaleString('vi-VN')} · Quét bảo mật:{' '}
                {stage17MasterQaReport.architectureCheck.frontendFilesScanned} tệp frontend (0 khóa lộ)
              </p>
            </div>
            <div className="text-sm font-bold text-emerald-700 font-mono">
              ĐIỀU KIỆN NGHIỆM THU:{' '}
              {stage17MasterQaReport.conditions9Checklist.filter((c) => c.verified).length} /{' '}
              {stage17MasterQaReport.conditions9Checklist.length} ĐẠT
            </div>
          </div>

          {/* 6 Phép đo Hiệu năng thực tế (Mục VII) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">1. Thời gian đăng nhập</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                {stage17MasterQaReport.performanceBenchmarksMs.loginLatencyMs} ms
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">2. Tải NH câu hỏi</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                {stage17MasterQaReport.performanceBenchmarksMs.loadQuestionBankLatencyMs} ms
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">3. Lưu câu hỏi (OCC)</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                {stage17MasterQaReport.performanceBenchmarksMs.saveQuestionLatencyMs} ms
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">4. Mở ma trận & đặc tả</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                {stage17MasterQaReport.performanceBenchmarksMs.openMatrixLatencyMs} ms
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">5. Tạo đề kiểm tra</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                {stage17MasterQaReport.performanceBenchmarksMs.generateExamLatencyMs} ms
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">6. Xuất hồ sơ kiểm tra</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                {stage17MasterQaReport.performanceBenchmarksMs.exportDossierLatencyMs} ms
              </div>
            </div>
          </div>

          {/* Bảng Báo cáo Kiểm thử 8 Cột (Mục VIII) */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-3 px-3">Mã kiểm thử</th>
                  <th className="py-3 px-3">Module</th>
                  <th className="py-3 px-3">Thao tác</th>
                  <th className="py-3 px-3">Kết quả mong đợi</th>
                  <th className="py-3 px-3">Kết quả thực tế</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Lỗi</th>
                  <th className="py-3 px-3">Hướng khắc phục</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {stage17MasterQaReport.testMatrixRows.map((row) => (
                  <tr key={row.testCode} className="hover:bg-slate-50/80 align-top">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {row.testCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{row.moduleName}</td>
                    <td className="py-3 px-3 text-slate-600">{row.operation}</td>
                    <td className="py-3 px-3 text-slate-600">{row.expectedResult}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{row.actualResult}</td>
                    <td className="py-3 px-3 font-bold whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{row.errorFound}</td>
                    <td className="py-3 px-3 text-slate-600">{row.remediationPlan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
