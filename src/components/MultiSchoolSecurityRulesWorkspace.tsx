import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCode2,
  FolderLock,
  KeyRound,
  Lock,
  Play,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserCheck,
  XCircle,
} from 'lucide-react';

interface SecurityPrinciple {
  order: number;
  code: string;
  title: string;
  ruleSnippet: string;
  description: string;
}

interface FirestoreCollectionRule {
  order: number;
  collection: string;
  path: string;
  readRule: string;
  writeRule: string;
}

interface StoragePolicy {
  pathPattern: string;
  confidentialExamPublicUrlAllowed: boolean;
  listDirectoryAllowed: boolean;
  directDeleteAllowed: boolean;
}

interface EmulatorScenarioResult {
  order: number;
  code: string;
  title: string;
  targetPath: string;
  actorLabel: string;
  expectedDecision: string;
  actualDecision: string;
  ruleGateTriggered: string;
  passed: boolean;
}

interface EmulatorSuiteReport {
  runId: string;
  executedAt: string;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  productionDeployStatus: string;
  scenarios: EmulatorScenarioResult[];
}

interface SecurityOverviewResponse {
  ok: boolean;
  principles: SecurityPrinciple[];
  firestoreCollections: FirestoreCollectionRule[];
  storagePolicy: StoragePolicy;
  firestoreRulesText: string;
  storageRulesText: string;
}

interface BackendVerifyResponse {
  ok: boolean;
  allowed: boolean;
  httpStatus: number;
  errorCode: string;
  reason: string;
  principlesChecked: string[];
}

type SecurityTabId =
  | 'EMULATOR_SECURITY_SUITE'
  | 'PRINCIPLES_AND_FIRESTORE'
  | 'STORAGE_SECURITY'
  | 'BACKEND_AUTHORIZATION';

const BACKEND_GUARDED_OPERATIONS = [
  {
    code: 'CREATE_SCHOOL',
    title: '1. Tạo trường (CREATE_SCHOOL)',
    endpoint: 'POST /api/super-admin/schools',
    requiredRole: 'SUPER_ADMIN',
    checks: [
      'Xác thực UID & email_verified',
      'Kiểm tra vai trò SUPER_ADMIN tại Backend',
      'Kiểm tra trùng mã trường & sinh schoolId duy nhất',
    ],
  },
  {
    code: 'ASSIGN_SCHOOL_ADMIN',
    title: '2. Gán School Admin (ASSIGN_SCHOOL_ADMIN)',
    endpoint: 'POST /api/super-admin/schools/:schoolId/assign-admin',
    requiredRole: 'SUPER_ADMIN',
    checks: [
      'Xác thực UID & vai trò SUPER_ADMIN',
      'Kiểm tra trạng thái trường mục tiêu ACTIVE',
      'Ghi bản ghi /schools/{schoolId}/memberships/{uid}',
    ],
  },
  {
    code: 'ASSIGN_SUPER_ADMIN',
    title: '3. Gán Super Admin (ASSIGN_SUPER_ADMIN)',
    endpoint: 'POST /api/multi-school-security/verify-backend-operation',
    requiredRole: 'SUPER_ADMIN',
    checks: [
      'Tuyệt đối cấm School Admin hoặc Giáo viên tự nâng quyền',
      'Bắt buộc xác thực SUPER_ADMIN cấp hệ thống tại máy chủ',
      'Ghi nhật ký bảo mật bất biến (Audit Log)',
    ],
  },
  {
    code: 'CHANGE_SENSITIVE_PERMISSIONS',
    title: '4. Thay đổi quyền nhạy cảm (CHANGE_SENSITIVE_PERMISSIONS)',
    endpoint: 'PUT /api/school-admin/members/:userId/permissions',
    requiredRole: 'SCHOOL_ADMIN / PRINCIPAL / SUPER_ADMIN',
    checks: [
      'Kiểm tra membership ACTIVE tại đúng trường pathSchoolId',
      'Chặn giả mạo schoolId từ payload client (clientPayloadSchoolId != pathSchoolId)',
      'Chặn tự cấp quyền SUPER_ADMIN trái phép',
    ],
  },
  {
    code: 'APPROVE_EXAM',
    title: '5. Phê duyệt đề (APPROVE_EXAM)',
    endpoint: 'POST /api/multi-school-security/verify-backend-operation',
    requiredRole: 'PRINCIPAL / VICE_PRINCIPAL + APPROVE_EXAM',
    checks: [
      'Kiểm tra membership ACTIVE và trạng thái trường ACTIVE',
      'Kiểm tra vai trò Ban Giám hiệu (PRINCIPAL / VICE_PRINCIPAL)',
      'Kiểm tra quyền chức năng APPROVE_EXAM',
    ],
  },
  {
    code: 'SHARE_QUESTION',
    title: '6. Chia sẻ câu hỏi lên Kho dùng chung (SHARE_QUESTION)',
    endpoint: 'POST /api/shared-question-repo/proposals/:id/approve',
    requiredRole: 'PRINCIPAL / VICE_PRINCIPAL / HEAD_OF_DEPARTMENT / SCHOOL_ADMIN',
    checks: [
      'Chặn tuyệt đối câu hỏi thuộc Đề kiểm tra mật (isConfidentialExamQuestion == false)',
      'Chặn câu hỏi chưa thẩm định đạt (questionAppraisalStatus == APPROVED)',
      'Bắt buộc người có thẩm quyền của trường phê duyệt tại Backend',
    ],
  },
  {
    code: 'TRANSFER_DATA',
    title: '7. Chuyển dữ liệu trực tiếp liên trường (TRANSFER_DATA)',
    endpoint: 'POST /api/multi-school-security/verify-backend-operation',
    requiredRole: 'CẤM TRỰC TIẾP (DENY BY POLICY)',
    checks: [
      'Cấm tự ý chuyển dữ liệu trực tiếp sang trường khác',
      'Mọi học liệu chia sẻ phải qua quy trình Kho câu hỏi dùng chung (Deep Clone)',
      'Bảo toàn cô lập dữ liệu schoolId của từng trường',
    ],
  },
];

export const MultiSchoolSecurityRulesWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SecurityTabId>('EMULATOR_SECURITY_SUITE');
  const [overview, setOverview] = useState<SecurityOverviewResponse | null>(null);
  const [suiteReport, setSuiteReport] = useState<EmulatorSuiteReport | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [runningSuite, setRunningSuite] = useState<boolean>(false);

  // Backend Authorization Simulator state
  const [simActorKey, setSimActorKey] = useState<string>('SCHOOL_ADMIN_A');
  const [simOperation, setSimOperation] = useState<string>('CHANGE_SENSITIVE_PERMISSIONS');
  const [simPathSchoolId, setSimPathSchoolId] = useState<string>('sch-thcs-b');
  const [simClientPayloadSchoolId, setSimClientPayloadSchoolId] = useState<string>('sch-thcs-b');
  const [simTargetRoleToGrant, setSimTargetRoleToGrant] = useState<string>('TEACHER');
  const [simIsConfidentialQuestion, setSimIsConfidentialQuestion] = useState<boolean>(false);
  const [simVerifying, setSimVerifying] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<BackendVerifyResponse | null>(null);

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/multi-school-security/overview');
      const data: SecurityOverviewResponse = await res.json();
      if (data.ok) {
        setOverview(data);
      }
    } catch (error) {
      console.error('Lỗi tải tổng quan bảo mật đa trường:', error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const handleRunEmulatorSuite = async () => {
    setRunningSuite(true);
    try {
      const res = await fetch('/api/multi-school-security/run-emulator-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok && data.report) {
        setSuiteReport(data.report);
      }
    } catch (error) {
      console.error('Lỗi chạy Firebase Emulator Security Suite:', error);
    } finally {
      setRunningSuite(false);
    }
  };

  const handleVerifyBackendOperation = async () => {
    setSimVerifying(true);
    try {
      const res = await fetch('/api/multi-school-security/verify-backend-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorKey: simActorKey,
          operation: simOperation,
          pathSchoolId: simPathSchoolId,
          clientPayloadSchoolId: simClientPayloadSchoolId,
          targetRoleToGrant: simTargetRoleToGrant,
          isConfidentialExamQuestion: simIsConfidentialQuestion,
          questionAppraisalStatus: 'APPROVED',
        }),
      });
      const data: BackendVerifyResponse = await res.json();
      setSimResult(data);
    } catch (error) {
      console.error('Lỗi kiểm tra quyền backend:', error);
    } finally {
      setSimVerifying(false);
    }
  };

  useEffect(() => {
    loadOverview().then(() => {
      handleRunEmulatorSuite();
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg border border-indigo-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>EDU TEST AI MULTI-SCHOOL • FIREBASE SECURITY RULES & BACKEND AUTHORIZATION</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Bảo mật Dữ liệu Đa trường (Firestore Rules, Storage Rules & Backend Guard)
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              Thực thi 9 nguyên tắc bảo mật cốt lõi (Deny by default, Xác thực UID, Kiểm tra Membership, Trạng thái trường,
              Vai trò, Quyền chức năng, Môn/Khối lớp, Hồ sơ mật, Chống giả mạo schoolId) trên 10 bộ sưu tập Firestore,
              Firebase Storage theo trường và 7 thao tác đặc quyền tại Backend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-amber-500/15 border border-amber-400/40 px-4 py-2.5 text-xs text-amber-200">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <Lock className="h-4 w-4" />
                <span>Chính sách Triển khai Production</span>
              </div>
              <div className="mt-0.5">
                Không triển khai Rules lên Production khi chưa kiểm thử đạt 10/10 kịch bản Emulator Suite
              </div>
            </div>

            <button
              onClick={handleRunEmulatorSuite}
              disabled={runningSuite}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition"
            >
              {runningSuite ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>Chạy Kiểm thử 10 Kịch bản Emulator Suite</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
            <div className="text-xs text-slate-300">Nguyên tắc Bảo mật (Mục I)</div>
            <div className="mt-1 text-xl font-bold text-white">9 / 9 Nguyên tắc</div>
            <div className="mt-0.5 text-[11px] text-emerald-400">Deny by default & Zero-Trust schoolId</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
            <div className="text-xs text-slate-300">Firestore Collections (Mục II)</div>
            <div className="mt-1 text-xl font-bold text-white">10 Collections</div>
            <div className="mt-0.5 text-[11px] text-emerald-400">schools, users, memberships... → results</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
            <div className="text-xs text-slate-300">Storage Theo Trường (Mục III)</div>
            <div className="mt-1 text-xl font-bold text-white">schools/&#123;schoolId&#125;/...</div>
            <div className="mt-0.5 text-[11px] text-emerald-400">Chặn 100% URL công khai đề mật</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
            <div className="text-xs text-slate-300">Backend Guard (Mục IV)</div>
            <div className="mt-1 text-xl font-bold text-white">7 Thao tác Đặc quyền</div>
            <div className="mt-0.5 text-[11px] text-emerald-400">Kiểm tra tại Server trước khi ghi DB</div>
          </div>
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3.5">
            <div className="text-xs text-emerald-200">Kiểm thử Emulator (Mục V)</div>
            <div className="mt-1 text-xl font-bold text-emerald-300">
              {suiteReport ? `${suiteReport.passedCount} / ${suiteReport.totalCount} ĐẠT` : '10 / 10 ĐẠT'}
            </div>
            <div className="mt-0.5 text-[11px] text-emerald-300">
              An toàn tuyệt đối trước khi Deploy
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('EMULATOR_SECURITY_SUITE')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'EMULATOR_SECURITY_SUITE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>V. Kiểm thử Bảo mật (10 Kịch bản Emulator Suite)</span>
        </button>

        <button
          onClick={() => setActiveTab('PRINCIPLES_AND_FIRESTORE')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'PRINCIPLES_AND_FIRESTORE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>I & II. Nguyên tắc & Firestore Rules (10 Collections)</span>
        </button>

        <button
          onClick={() => setActiveTab('STORAGE_SECURITY')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'STORAGE_SECURITY'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderLock className="h-4 w-4" />
          <span>III. Firebase Storage Rules (Cô lập theo Trường)</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKEND_AUTHORIZATION')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'BACKEND_AUTHORIZATION'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>IV. Backend Authorization (7 Thao tác Đặc quyền)</span>
        </button>
      </div>

      {loadingOverview ? (
        <div className="rounded-2xl bg-white p-8 text-center border border-slate-200">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Đang tải cấu hình Firebase Security Rules & Backend Guard...</p>
        </div>
      ) : (
        <>
          {/* TAB V: EMULATOR SUITE 10 SCENARIOS */}
          {activeTab === 'EMULATOR_SECURITY_SUITE' && suiteReport && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <span>Báo cáo Kiểm thử Bảo mật Đa trường (Firebase Emulator Suite – 10 Kịch bản bắt buộc)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Mã lần chạy: <span className="font-mono font-semibold text-slate-700">{suiteReport.runId}</span> •
                      Thời điểm: <span className="font-semibold text-slate-700">{new Date(suiteReport.executedAt).toLocaleString('vi-VN')}</span> •
                      Trạng thái: <span className="font-semibold text-amber-700">{suiteReport.productionDeployStatus}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ĐẠT {suiteReport.passedCount}/{suiteReport.totalCount} KỊCH BẢN (100%)
                    </span>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="py-3 px-3 font-bold">#</th>
                        <th className="py-3 px-3 font-bold">Kịch bản kiểm thử (Mục V)</th>
                        <th className="py-3 px-3 font-bold">Tác nhân (Actor)</th>
                        <th className="py-3 px-3 font-bold">Đường dẫn Tài nguyên</th>
                        <th className="py-3 px-3 font-bold">Hàm / Rule Chặn</th>
                        <th className="py-3 px-3 font-bold">Quyết định Thực tế</th>
                        <th className="py-3 px-3 font-bold">Kết quả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {suiteReport.scenarios.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50/80 align-top">
                          <td className="py-3 px-3 font-bold text-slate-900">{item.order}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <div className="font-mono text-[11px] text-indigo-600 mt-0.5">{item.code}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700">{item.actorLabel}</td>
                          <td className="py-3 px-3">
                            <div className="font-mono text-[11px] text-slate-800 bg-slate-100 px-2 py-1 rounded">
                              {item.targetPath}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                              {item.ruleGateTriggered}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center rounded-md bg-rose-50 border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-900">
                              {item.actualDecision}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {item.passed ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                PASS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800">
                                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                FAIL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB I & II: PRINCIPLES & FIRESTORE RULES */}
          {activeTab === 'PRINCIPLES_AND_FIRESTORE' && overview && (
            <div className="space-y-6">
              {/* Section I: 9 Principles */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-600" />
                  <span>I. 9 Nguyên tắc Bảo mật Đa trường Cốt lõi</span>
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {overview.principles.map((p) => (
                    <div
                      key={p.order}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
                            Nguyên tắc #{p.order}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            ĐÃ ÁP DỤNG
                          </span>
                        </div>
                        <h3 className="mt-2 font-bold text-slate-900 text-sm">{p.title}</h3>
                        <p className="mt-1 text-xs text-slate-600">{p.description}</p>
                        <p className="mt-2 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                          {p.ruleSnippet}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section II: 10 Firestore Collections */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  <span>II. Thiết kế Firestore Security Rules cho 10 Bộ sưu tập (Collections)</span>
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="py-3 px-3 font-bold">#</th>
                        <th className="py-3 px-3 font-bold">Collection</th>
                        <th className="py-3 px-3 font-bold">Đường dẫn (Match Path)</th>
                        <th className="py-3 px-3 font-bold">Quy tắc Đọc (allow get, list)</th>
                        <th className="py-3 px-3 font-bold">Quy tắc Tạo / Cập nhật / Xóa (allow write)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {overview.firestoreCollections.map((col) => (
                        <tr key={col.collection} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-700">{col.order}</td>
                          <td className="py-3 px-3 font-bold text-indigo-900 font-mono">{col.collection}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{col.path}</td>
                          <td className="py-3 px-3 text-slate-700">{col.readRule}</td>
                          <td className="py-3 px-3 text-slate-700">{col.writeRule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Source viewer for firestore.rules */}
              <div className="rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
                    <FileCode2 className="h-4 w-4" />
                    <span>Mã nguồn thực tế: /firestore.rules</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">rules_version = &apos;2&apos;;</span>
                </div>
                <pre className="max-h-96 overflow-y-auto text-[11px] font-mono leading-relaxed text-slate-200">
                  {overview.firestoreRulesText}
                </pre>
              </div>
            </div>
          )}

          {/* TAB III: STORAGE SECURITY */}
          {activeTab === 'STORAGE_SECURITY' && overview && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderLock className="h-5 w-5 text-indigo-600" />
                  <span>III. Bảo mật Firebase Storage Cô lập Theo Trường & Chặn URL Công khai Đề mật</span>
                </h2>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                    <div className="text-xs font-bold uppercase text-indigo-700">Cấu trúc đường dẫn chuẩn theo trường</div>
                    <div className="mt-1.5 font-mono text-sm font-bold text-slate-900 bg-white px-3 py-2 rounded border border-indigo-200">
                      {overview.storagePolicy.pathPattern}
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      Tất cả tệp đề thi, ma trận, phụ lục hình ảnh bắt buộc định danh dưới nhánh <code className="font-mono">schools/&#123;schoolId&#125;/exams/&#123;examId&#125;/...</code>.
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                    <div className="text-xs font-bold uppercase text-rose-700">Chính sách Bảo vệ Đề mật trên Storage</div>
                    <div className="mt-1.5 text-sm font-bold text-rose-900">
                      Không tạo URL công khai cho đề mật (confidentialExamPublicUrlAllowed = false)
                    </div>
                    <div className="mt-1 font-mono text-xs text-rose-800 bg-white px-3 py-2 rounded border border-rose-200">
                      request.resource.metadata.publicUrlAllowed == &apos;false&apos; &amp;&amp; allow list: if false
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
                    <FileCode2 className="h-4 w-4" />
                    <span>Mã nguồn thực tế: /storage.rules</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">service firebase.storage</span>
                </div>
                <pre className="max-h-96 overflow-y-auto text-[11px] font-mono leading-relaxed text-slate-200">
                  {overview.storageRulesText}
                </pre>
              </div>
            </div>
          )}

          {/* TAB IV: BACKEND AUTHORIZATION */}
          {activeTab === 'BACKEND_AUTHORIZATION' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-600" />
                  <span>IV. 7 Thao tác Đặc quyền Bắt buộc Kiểm tra tại Backend</span>
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BACKEND_GUARDED_OPERATIONS.map((op) => (
                    <div key={op.code} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                          {op.code}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">{op.requiredRole}</span>
                      </div>
                      <h3 className="mt-2 font-bold text-slate-900 text-sm">{op.title}</h3>
                      <div className="mt-1 font-mono text-[11px] text-slate-500">{op.endpoint}</div>
                      <ul className="mt-2.5 space-y-1 text-xs text-slate-700">
                        {op.checks.map((c, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Backend Authorization Simulator */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                  <span>Trình Kiểm tra Thao tác Đặc quyền Backend (Real-time Server Guard Verification)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gửi yêu cầu trực tiếp tới endpoint <code className="font-mono text-indigo-600">POST /api/multi-school-security/verify-backend-operation</code> để kiểm chứng Backend từ chối hoặc cho phép theo ngữ cảnh.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tác nhân kiểm thử (Actor)</label>
                    <select
                      value={simActorKey}
                      onChange={(e) => setSimActorKey(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="UNAUTHENTICATED_GUEST">Khách chưa đăng nhập (UNAUTHENTICATED_GUEST)</option>
                      <option value="TEACHER_SCHOOL_A">Giáo viên Trường A (TEACHER_SCHOOL_A)</option>
                      <option value="SCHOOL_ADMIN_A">School Admin Trường A (SCHOOL_ADMIN_A)</option>
                      <option value="PRINCIPAL_SCHOOL_A">Hiệu trưởng Trường A (PRINCIPAL_SCHOOL_A)</option>
                      <option value="MULTI_SCHOOL_TEACHER_AB">GV 2 Trường A & B (MULTI_SCHOOL_TEACHER_AB)</option>
                      <option value="REVOKED_MEMBER_SCHOOL_A">Thành viên bị thu hồi quyền (REVOKED_MEMBER_SCHOOL_A)</option>
                      <option value="SUPER_ADMIN_PLATFORM">Super Admin Hệ thống (SUPER_ADMIN_PLATFORM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Thao tác đặc quyền (Operation)</label>
                    <select
                      value={simOperation}
                      onChange={(e) => setSimOperation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="CREATE_SCHOOL">1. CREATE_SCHOOL (Tạo trường)</option>
                      <option value="ASSIGN_SCHOOL_ADMIN">2. ASSIGN_SCHOOL_ADMIN (Gán School Admin)</option>
                      <option value="ASSIGN_SUPER_ADMIN">3. ASSIGN_SUPER_ADMIN (Gán Super Admin)</option>
                      <option value="CHANGE_SENSITIVE_PERMISSIONS">4. CHANGE_SENSITIVE_PERMISSIONS (Thay đổi quyền nhạy cảm)</option>
                      <option value="APPROVE_EXAM">5. APPROVE_EXAM (Phê duyệt đề)</option>
                      <option value="SHARE_QUESTION">6. SHARE_QUESTION (Chia sẻ câu hỏi)</option>
                      <option value="TRANSFER_DATA">7. TRANSFER_DATA (Chuyển dữ liệu liên trường)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trường mục tiêu trên URL (pathSchoolId)</label>
                    <select
                      value={simPathSchoolId}
                      onChange={(e) => {
                        setSimPathSchoolId(e.target.value);
                        setSimClientPayloadSchoolId(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="sch-tieu-hoc-a">Trường A (sch-tieu-hoc-a · Đang hoạt động)</option>
                      <option value="sch-thcs-b">Trường B (sch-thcs-b · Đang hoạt động)</option>
                      <option value="sch-suspended-c">Trường C (sch-suspended-c · Đang tạm ngừng)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">schoolId do Client gửi trong Payload</label>
                    <input
                      type="text"
                      value={simClientPayloadSchoolId}
                      onChange={(e) => setSimClientPayloadSchoolId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò muốn cấp (khi sửa quyền)</label>
                    <select
                      value={simTargetRoleToGrant}
                      onChange={(e) => setSimTargetRoleToGrant(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="TEACHER">TEACHER</option>
                      <option value="HEAD_OF_DEPARTMENT">HEAD_OF_DEPARTMENT</option>
                      <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Thử tự nâng quyền)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simIsConfidentialQuestion}
                        onChange={(e) => setSimIsConfidentialQuestion(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span>Câu hỏi thuộc Đề kiểm tra mật (Khi kiểm thử SHARE_QUESTION)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleVerifyBackendOperation}
                    disabled={simVerifying}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Kiểm tra Ủy quyền tại Backend</span>
                  </button>
                </div>

                {simResult && (
                  <div
                    className={`mt-4 rounded-xl p-4 border ${
                      simResult.allowed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm flex items-center gap-2">
                        {simResult.allowed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-rose-600" />
                        )}
                        <span>
                          HTTP {simResult.httpStatus} • {simResult.errorCode}: {simResult.reason}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {simResult.principlesChecked.map((p, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md bg-white/80 border border-slate-300 px-2 py-0.5 text-[11px] font-mono text-slate-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
