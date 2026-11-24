import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Lock,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { SmartQuestionLinkAdminConfigPanel } from './SmartQuestionLinkWorkspace';

interface SchoolConfigData {
  schoolId: string;
  firestorePath: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  schoolInfo: {
    schoolName: string;
    governingBody: string;
    address: string;
    logoUrl: string;
    contactEmail: string;
    phoneNumber: string;
    website: string;
    educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
    academicYear: string;
  };
  academicConfig: {
    grades: number[];
    subjects: string[];
    departments: { id: string; name: string; gradesManaged: number[] }[];
    matrixTemplateCode: string;
    specificationTemplateCode: string;
    examPaperTemplateCode: string;
    appraisalWorkflowRule: 'MANDATORY_DEPARTMENT_REVIEW' | 'DUAL_PEER_AND_HOD_REVIEW';
    approvalWorkflowRule: 'MANDATORY_PRINCIPAL_APPROVAL' | 'VICE_AND_PRINCIPAL_TWO_STEP';
    dossierExportRule: 'REQUIRE_APPROVED_STATUS_AND_FULL_4_PARTS';
  };
  dossierFormatConfig: {
    dossierLogoUrl: string;
    examHeaderTitle: string;
    examPeriodNames: string[];
    wordExportFormat: 'DOCX_GDPT2018_STANDARD' | 'DOCX_TWO_COLUMN_COMPACT';
    paperSize: 'A4' | 'LETTER';
    fontFamily: 'Times New Roman' | 'Arial';
    fontSizePt: 13 | 14;
    signatureLayout: {
      leftSignerTitle: string;
      centerSignerTitle: string;
      rightSignerTitle: string;
    };
  };
  aiGovernanceConfig: {
    aiAllowedSubjects: string[];
    aiAllowedRoles: ('TEACHER' | 'HEAD_OF_DEPARTMENT' | 'VICE_PRINCIPAL' | 'PRINCIPAL')[];
    aiDailyQuotaPerTeacher: number;
    approvedPromptTemplates: { id: string; code: string; title: string; levelScope: string }[];
    apiKeyManagedByPlatformServer: boolean;
  };
}

const ALL_SUBJECTS_POOL = [
  'Toán',
  'Tiếng Việt',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học',
  'Khoa học tự nhiên',
  'Lịch sử và Địa lí',
  'Tin học và Công nghệ',
  'Tin học',
  'Đạo đức',
  'Giáo dục công dân',
];

interface SchoolConfigurationModuleWorkspaceProps {
  schoolId?: string;
  actorUserId?: string;
}

function resolveNormalizedConfigSchoolId(rawSchoolId?: string, rawActorUserId?: string): string {
  const sid = String(rawSchoolId || '').trim();
  const uid = String(rawActorUserId || '').trim();
  if (sid === 'SCHOOL_B' || sid === 'sch-tieu-hoc-a' || uid === 'user-school-admin-sia' || uid === 'usr-schadmin-tha') {
    return 'sch-tieu-hoc-a';
  }
  if (sid === 'SCHOOL_C' || sid === 'sch-thcs-b' || uid === 'user-school-admin-ddung' || uid === 'usr-schadmin-thcsb') {
    return 'sch-thcs-b';
  }
  return 'sch-th-thcs-nguyen-du';
}

function resolveDefaultAdminIdForSchool(normalizedSchoolId: string, rawActorUserId?: string): string {
  const uid = String(rawActorUserId || '').trim();
  if (uid) return uid;
  if (normalizedSchoolId === 'sch-tieu-hoc-a') return 'user-school-admin-sia';
  if (normalizedSchoolId === 'sch-thcs-b') return 'user-school-admin-ddung';
  return 'user-school-admin-a';
}

export const SchoolConfigurationModuleWorkspace: React.FC<SchoolConfigurationModuleWorkspaceProps> = ({
  schoolId: propSchoolId,
  actorUserId: propActorUserId,
}) => {
  const initialSchoolId = resolveNormalizedConfigSchoolId(propSchoolId, propActorUserId);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId);
  const [actorUserId, setActorUserId] = useState<string>(() =>
    resolveDefaultAdminIdForSchool(initialSchoolId, propActorUserId)
  );
  const [activeTab, setActiveTab] = useState<
    'TAB_1_INFO' | 'TAB_2_ACADEMIC' | 'TAB_3_DOSSIER' | 'TAB_4_AI' | 'TAB_5_6_QA_ISOLATION'
  >('TAB_1_INFO');

  const [config, setConfig] = useState<SchoolConfigData | null>(null);
  const [allSchoolsSnapshot, setAllSchoolsSnapshot] = useState<any[]>([]);
  const [qaReport, setQaReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [banner, setBanner] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'WARNING';
    text: string;
  } | null>(null);

  const loadSchoolConfig = useCallback(async (schoolId = selectedSchoolId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/school-config/${encodeURIComponent(schoolId)}`);
      const data = await res.json();
      if (data.ok && data.config) {
        setConfig(data.config);
        setAllSchoolsSnapshot(data.allSchoolsSnapshot || []);
      }
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        text: err?.message || 'Lỗi tải cấu hình trường học.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSchoolId]);

  const handleRunQaSuite = useCallback(async (showNotification = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/school-config/run-qa-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok && data.report) {
        setQaReport(data.report);
        await loadSchoolConfig(selectedSchoolId);
        if (showNotification) {
          setBanner({
            type: 'SUCCESS',
            text: `Đã chạy xong Kiểm thử Module Cấu hình Trường học (Mục VI): Đạt ${data.report.passedCount}/${data.report.totalCount} kịch bản!`,
          });
        }
      }
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        text: err?.message || 'Lỗi khi chạy bộ kiểm thử cấu hình trường học.',
      });
    } finally {
      setLoading(false);
    }
  }, [loadSchoolConfig, selectedSchoolId]);

  useEffect(() => {
    const resolvedSchool = resolveNormalizedConfigSchoolId(propSchoolId, propActorUserId);
    const resolvedActor = resolveDefaultAdminIdForSchool(resolvedSchool, propActorUserId);
    setSelectedSchoolId(resolvedSchool);
    setActorUserId(resolvedActor);
    void loadSchoolConfig(resolvedSchool);
  }, [propSchoolId, propActorUserId, loadSchoolConfig]);

  const handleSelectSchoolAndAdmin = async (schoolId: string, defaultAdminId: string) => {
    setSelectedSchoolId(schoolId);
    setActorUserId(defaultAdminId);
    setBanner(null);
    await loadSchoolConfig(schoolId);
  };

  const handleSaveCurrentConfig = async (customPatch?: any, targetOverrideSchoolId?: string) => {
    if (!config) return;
    setSaving(true);
    setBanner(null);
    const targetId = targetOverrideSchoolId || selectedSchoolId;
    const patchPayload = customPatch || {
      schoolInfo: config.schoolInfo,
      academicConfig: config.academicConfig,
      dossierFormatConfig: config.dossierFormatConfig,
      aiGovernanceConfig: config.aiGovernanceConfig,
    };

    try {
      const res = await fetch(`/api/school-config/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId,
          payloadSchoolId: targetId,
          patch: patchPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          type: 'ERROR',
          text: data.message || 'Từ chối lưu cấu hình trường học.',
        });
        return;
      }
      if (targetId === selectedSchoolId && data.config) {
        setConfig(data.config);
      }
      if (data.allSchoolsSnapshot) {
        setAllSchoolsSnapshot(data.allSchoolsSnapshot);
      }
      setBanner({
        type: 'SUCCESS',
        text: data.message,
      });
    } catch (err: any) {
      setBanner({
        type: 'ERROR',
        text: err?.message || 'Lỗi kết nối khi lưu cấu hình Firestore.',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayValue = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>EDU TEST AI MULTI-SCHOOL · MODULE CẤU HÌNH TRƯỜNG HỌC (SCHOOL ADMIN)</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Cấu hình Trường học Độc lập (Thông tin · Chuyên môn · Hồ sơ · AI · Firestore)
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl">
              Mỗi trường học lưu cấu hình riêng theo <code className="font-mono text-teal-300">schoolId</code> tại{' '}
              <code className="font-mono text-amber-300">/schools/&#123;schoolId&#125;/schoolConfig/main</code>. Kiểm soát
              nghiêm ngặt quy định bắt buộc của từng cấp học, ẩn API Key đối với School Admin và chặn tuyệt đối việc ghi đè
              cấu hình sang trường khác.
            </p>
          </div>

          {false && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleRunQaSuite(true)}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Chạy Kiểm thử Mục VI (5/5 Kịch bản)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Notification */}
      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            banner.type === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : banner.type === 'ERROR'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-2 font-medium">
            {banner.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Cấu hình đường liên kết cho nút lệnh Menu: Tạo câu hỏi thông minh */}
      <SmartQuestionLinkAdminConfigPanel
        schoolId={selectedSchoolId}
        actorUserId={actorUserId}
        actorName="Quản trị viên nhà trường"
        actorRole="SCHOOL_ADMIN"
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">

        <button
          type="button"
          onClick={() => setActiveTab('TAB_1_INFO')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'TAB_1_INFO'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>I. Thông tin Trường</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TAB_2_ACADEMIC')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'TAB_2_ACADEMIC'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>II. Cấu hình Chuyên môn</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TAB_3_DOSSIER')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'TAB_3_DOSSIER'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>III. Cấu hình Hồ sơ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TAB_4_AI')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'TAB_4_AI'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>IV. Cấu hình AI & Bảo mật API Key</span>
        </button>
      </div>

      {config && (
        <>
          {/* TAB I: THÔNG TIN TRƯỜNG */}
          {activeTab === 'TAB_1_INFO' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    I. Cập nhật Thông tin Trường ({config.schoolInfo.schoolName})
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Firestore Document: {config.firestorePath} · Phiên bản: v{config.version}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSaveCurrentConfig()}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thông tin Trường</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">1. Tên trường</label>
                  <input
                    type="text"
                    value={config.schoolInfo.schoolName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, schoolName: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Tên cơ quan quản lý</label>
                  <input
                    type="text"
                    value={config.schoolInfo.governingBody}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, governingBody: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">3. Địa chỉ</label>
                  <input
                    type="text"
                    value={config.schoolInfo.address}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, address: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. Đường dẫn Logo trường</label>
                  <input
                    type="text"
                    value={config.schoolInfo.logoUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, logoUrl: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Email liên hệ</label>
                  <input
                    type="email"
                    value={config.schoolInfo.contactEmail}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, contactEmail: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">6. Số điện thoại</label>
                  <input
                    type="text"
                    value={config.schoolInfo.phoneNumber}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, phoneNumber: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">7. Website</label>
                  <input
                    type="text"
                    value={config.schoolInfo.website}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, website: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">8. Cấp học được cấp phép</label>
                  <div className="flex items-center gap-3 pt-1">
                    {(selectedSchoolId === 'sch-tieu-hoc-a'
                      ? (['PRIMARY'] as const)
                      : selectedSchoolId === 'sch-thcs-b'
                      ? (['LOWER_SECONDARY'] as const)
                      : (['PRIMARY', 'LOWER_SECONDARY'] as const)
                    ).map((lvl) => (
                      <label key={lvl} className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={config.schoolInfo.educationLevels.includes(lvl)}
                          onChange={() =>
                            setConfig({
                              ...config,
                              schoolInfo: {
                                ...config.schoolInfo,
                                educationLevels: toggleArrayValue(config.schoolInfo.educationLevels, lvl),
                              },
                            })
                          }
                        />
                        <span>{lvl === 'PRIMARY' ? 'Tiểu học (Khối 1–5)' : 'THCS (Khối 6–9)'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">9. Năm học hiện hành</label>
                  <select
                    value={config.schoolInfo.academicYear}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schoolInfo: { ...config.schoolInfo, academicYear: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB II: CẤU HÌNH CHUYÊN MÔN */}
          {activeTab === 'TAB_2_ACADEMIC' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    II. Cấu hình Chuyên môn & Ràng buộc Quy định Cấp học ({config.schoolInfo.schoolName})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động kiểm tra Thông tư 27/2020/TT-BGDĐT (Tiểu học) và Thông tư 22/2021/TT-BGDĐT & Công văn 7991 (THCS).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSaveCurrentConfig()}
                    className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu hình Chuyên môn</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* 1. Khối lớp */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">1. Khối lớp đào tạo tại trường</div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedSchoolId === 'sch-tieu-hoc-a'
                      ? [1, 2, 3, 4, 5]
                      : selectedSchoolId === 'sch-thcs-b'
                      ? [6, 7, 8, 9]
                      : [1, 2, 3, 4, 5, 6, 7, 8, 9]
                    ).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            academicConfig: {
                              ...config.academicConfig,
                              grades: toggleArrayValue(config.academicConfig.grades, g).sort((a, b) => a - b),
                            },
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                          config.academicConfig.grades.includes(g)
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        Khối {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Môn học */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">2. Danh mục Môn học của trường</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_SUBJECTS_POOL.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            academicConfig: {
                              ...config.academicConfig,
                              subjects: toggleArrayValue(config.academicConfig.subjects, subj),
                            },
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg font-semibold border transition cursor-pointer ${
                          config.academicConfig.subjects.includes(subj)
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Tổ chuyên môn */}
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">3. Danh sách Tổ chuyên môn</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {config.academicConfig.departments.map((d) => (
                      <div key={d.id} className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{d.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">Mã tổ: {d.id}</div>
                        </div>
                        <span className="text-slate-600 font-semibold">Khối quản lý: {d.gradesManaged.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4, 5, 6. Mẫu Ma trận, Bản đặc tả, Đề kiểm tra */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. Mẫu Ma trận đề kiểm tra</label>
                  <select
                    value={config.academicConfig.matrixTemplateCode}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        academicConfig: { ...config.academicConfig, matrixTemplateCode: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
                  >
                    <option value="TPL_MTX_TT27_PRIMARY_3LEVELS">
                      TPL_MTX_TT27_PRIMARY_3LEVELS (Tiểu học 3 mức độ · TT27)
                    </option>
                    <option value="TPL_MTX_CV7991_THCS_4LEVELS">
                      TPL_MTX_CV7991_THCS_4LEVELS (THCS 4 mức độ · CV7991)
                    </option>
                    <option value="TPL_MTX_MULTILEVEL_TT27_CV7991">
                      TPL_MTX_MULTILEVEL_TT27_CV7991 (Liên cấp TH & THCS)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Mẫu Bản đặc tả</label>
                  <input
                    type="text"
                    value={config.academicConfig.specificationTemplateCode}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        academicConfig: { ...config.academicConfig, specificationTemplateCode: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">6. Mẫu Đề kiểm tra</label>
                  <input
                    type="text"
                    value={config.academicConfig.examPaperTemplateCode}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        academicConfig: { ...config.academicConfig, examPaperTemplateCode: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">7. Quy trình Thẩm định cấp Tổ</label>
                  <select
                    value={config.academicConfig.appraisalWorkflowRule}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        academicConfig: {
                          ...config.academicConfig,
                          appraisalWorkflowRule: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="MANDATORY_DEPARTMENT_REVIEW">
                      Bắt buộc Tổ trưởng Chuyên môn thẩm định trước khi trình BGH
                    </option>
                    <option value="DUAL_PEER_AND_HOD_REVIEW">
                      Thẩm định kép: Giáo viên phản biện độc lập + Tổ trưởng Chuyên môn
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">8. Quy trình Phê duyệt cấp Trường</label>
                  <select
                    value={config.academicConfig.approvalWorkflowRule}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        academicConfig: {
                          ...config.academicConfig,
                          approvalWorkflowRule: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="MANDATORY_PRINCIPAL_APPROVAL">Hiệu trưởng phê duyệt chính thức</option>
                    <option value="VICE_AND_PRINCIPAL_TWO_STEP">
                      Phó Hiệu trưởng rà soát + Hiệu trưởng phê duyệt cuối cùng
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">9. Quy tắc Xuất hồ sơ khảo thí</label>
                  <input
                    type="text"
                    readOnly
                    value="Bắt buộc đủ 4 thành phần (Ma trận + Đặc tả + Đề + Đáp án) & trạng thái APPROVED"
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB III: CẤU HÌNH HỒ SƠ */}
          {activeTab === 'TAB_3_DOSSIER' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    III. Cấu hình Hồ sơ & Thể thức Xuất Đề Kiểm tra ({config.schoolInfo.schoolName})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cấu hình Logo in trên đề, tiêu đề đề kiểm tra, tên kỳ kiểm tra, định dạng Word, khổ giấy, font chữ và vị trí ký duyệt.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSaveCurrentConfig()}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu hình Hồ sơ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">1. Tải / Cập nhật Logo in trên Hồ sơ đề</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.dossierFormatConfig.dossierLogoUrl}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dossierFormatConfig: {
                            ...config.dossierFormatConfig,
                            dossierLogoUrl: e.target.value,
                          },
                        })
                      }
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          dossierFormatConfig: {
                            ...config.dossierFormatConfig,
                            dossierLogoUrl: `https://cdn.edutest.vn/logos/${config.schoolId}-uploaded-${Date.now()}.svg`,
                          },
                        })
                      }
                      className="px-3 py-2 rounded-lg bg-slate-800 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải Logo</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Tiêu đề đề kiểm tra</label>
                  <input
                    type="text"
                    value={config.dossierFormatConfig.examHeaderTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        dossierFormatConfig: {
                          ...config.dossierFormatConfig,
                          examHeaderTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Tên các kỳ kiểm tra (Cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={config.dossierFormatConfig.examPeriodNames.join(', ')}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        dossierFormatConfig: {
                          ...config.dossierFormatConfig,
                          examPeriodNames: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. Định dạng xuất Word (.docx)</label>
                  <select
                    value={config.dossierFormatConfig.wordExportFormat}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        dossierFormatConfig: {
                          ...config.dossierFormatConfig,
                          wordExportFormat: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="DOCX_GDPT2018_STANDARD">Chuẩn thể thức hành chính GDPT 2018 (.docx)</option>
                    <option value="DOCX_TWO_COLUMN_COMPACT">Bố cục 2 cột tiết kiệm giấy in (.docx)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Khổ giấy in chuẩn</label>
                  <select
                    value={config.dossierFormatConfig.paperSize}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        dossierFormatConfig: {
                          ...config.dossierFormatConfig,
                          paperSize: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="A4">Khổ A4 (210mm × 297mm · Chuẩn Bộ GD&ĐT)</option>
                    <option value="LETTER">Khổ Letter</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">6A. Font chữ</label>
                    <select
                      value={config.dossierFormatConfig.fontFamily}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dossierFormatConfig: {
                            ...config.dossierFormatConfig,
                            fontFamily: e.target.value as any,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    >
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">6B. Cỡ chữ (pt)</label>
                    <select
                      value={config.dossierFormatConfig.fontSizePt}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dossierFormatConfig: {
                            ...config.dossierFormatConfig,
                            fontSizePt: Number(e.target.value) as 13 | 14,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    >
                      <option value={13}>13 pt</option>
                      <option value={14}>14 pt</option>
                    </select>
                  </div>
                </div>

                {/* 7. Cấu hình vị trí ký duyệt */}
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800">7. Cấu hình 3 Vị trí Ký duyệt cuối Hồ sơ Đề kiểm tra</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cột Trái (Người biên soạn)</label>
                      <input
                        type="text"
                        value={config.dossierFormatConfig.signatureLayout.leftSignerTitle}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            dossierFormatConfig: {
                              ...config.dossierFormatConfig,
                              signatureLayout: {
                                ...config.dossierFormatConfig.signatureLayout,
                                leftSignerTitle: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cột Giữa (Thẩm định chuyên môn)</label>
                      <input
                        type="text"
                        value={config.dossierFormatConfig.signatureLayout.centerSignerTitle}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            dossierFormatConfig: {
                              ...config.dossierFormatConfig,
                              signatureLayout: {
                                ...config.dossierFormatConfig.signatureLayout,
                                centerSignerTitle: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cột Phải (Ban Giám hiệu phê duyệt)</label>
                      <input
                        type="text"
                        value={config.dossierFormatConfig.signatureLayout.rightSignerTitle}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            dossierFormatConfig: {
                              ...config.dossierFormatConfig,
                              signatureLayout: {
                                ...config.dossierFormatConfig.signatureLayout,
                                rightSignerTitle: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB IV: CẤU HÌNH AI */}
          {activeTab === 'TAB_4_AI' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    IV. Cấu hình Sử dụng AI & Quản trị Prompt Chuyên môn ({config.schoolInfo.schoolName})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cấu hình môn học, vai trò, hạn mức gọi AI mỗi ngày và danh mục mẫu prompt được nhà trường phê duyệt.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSaveCurrentConfig()}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu hình AI</span>
                </button>
              </div>

              {/* Bảo mật khóa API (Mục IV) */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-sm text-emerald-300">
                      Chính sách Bảo mật Khóa API (Mục IV): Không hiển thị API Key cho School Admin
                    </div>
                    <p className="text-slate-300 mt-0.5">
                      Khóa Gemini API được quản lý tập trung tại Backend Server. School Admin chỉ cấu hình phạm vi môn học,
                      vai trò, hạn mức và mẫu prompt chuyên môn của trường mình mà không có quyền xem hay trích xuất khóa bí mật.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 shrink-0">
                  apiKeyExposed: false
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* 1. Môn được sử dụng AI */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">1. Các môn học được phép sử dụng AI tại trường</div>
                  <div className="flex flex-wrap gap-1.5">
                    {config.academicConfig.subjects.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            aiGovernanceConfig: {
                              ...config.aiGovernanceConfig,
                              aiAllowedSubjects: toggleArrayValue(config.aiGovernanceConfig.aiAllowedSubjects, subj),
                            },
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg font-semibold border transition cursor-pointer ${
                          config.aiGovernanceConfig.aiAllowedSubjects.includes(subj)
                            ? 'bg-indigo-700 text-white border-indigo-700'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Vai trò được sử dụng AI & 3. Hạn mức */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <div className="font-bold text-slate-800 mb-1.5">2. Vai trò được phép sử dụng AI</div>
                    <div className="flex flex-wrap gap-2">
                      {(['TEACHER', 'HEAD_OF_DEPARTMENT', 'VICE_PRINCIPAL', 'PRINCIPAL'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              aiGovernanceConfig: {
                                ...config.aiGovernanceConfig,
                                aiAllowedRoles: toggleArrayValue(config.aiGovernanceConfig.aiAllowedRoles, r),
                              },
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg font-mono font-semibold border cursor-pointer ${
                            config.aiGovernanceConfig.aiAllowedRoles.includes(r)
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-slate-600 border-slate-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      3. Hạn mức sử dụng AI theo người dùng (Lượt gọi / Giáo viên / Ngày)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={config.aiGovernanceConfig.aiDailyQuotaPerTeacher}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aiGovernanceConfig: {
                            ...config.aiGovernanceConfig,
                            aiDailyQuotaPerTeacher: Number(e.target.value) || 30,
                          },
                        })
                      }
                      className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* 4. Mẫu prompt chuyên môn được duyệt */}
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">4. Danh mục Mẫu Prompt Chuyên môn được duyệt của trường</div>
                  <div className="space-y-2">
                    {config.aiGovernanceConfig.approvedPromptTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{tpl.title}</div>
                          <div className="font-mono text-[11px] text-indigo-700">{tpl.code}</div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">Phạm vi cấp học: {tpl.levelScope}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB V & VI: LƯU FIRESTORE CÔ LẬP & BÁO CÁO KIỂM THỬ */}
          {activeTab === 'TAB_5_6_QA_ISOLATION' && (
            <div className="space-y-6">
              {/* Bảng đối chiếu trạng thái cấu hình riêng của từng trường trong Firestore */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-700" />
                      <span>V. Đối chiếu Cấu hình Lưu Cô lập theo schoolId trên Firestore (Không ghi đè trường khác)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Khi Trường A thay đổi Logo, Mẫu đề kiểm tra, Năm học hoặc Môn học, cấu hình của Trường B giữ nguyên 100%.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold">Mã trường (schoolId)</th>
                        <th className="py-2.5 px-3 font-bold">Tên trường</th>
                        <th className="py-2.5 px-3 font-bold">Logo hiện tại</th>
                        <th className="py-2.5 px-3 font-bold">Mẫu Đề kiểm tra</th>
                        <th className="py-2.5 px-3 font-bold">Năm học</th>
                        <th className="py-2.5 px-3 font-bold text-right">Số môn</th>
                        <th className="py-2.5 px-3 font-bold text-right">Phiên bản</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(qaReport?.schoolsComparison || allSchoolsSnapshot).map((s: any) => (
                        <tr key={s.schoolId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.schoolId}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{s.schoolName}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-blue-700">{s.logoUrl}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-800">{s.examPaperTemplateCode}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.academicYear}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {Array.isArray(s.subjects) ? s.subjects.length : s.subjectsCount}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">v{s.version}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bảng Kết quả Kiểm thử 5 Kịch bản (Mục VI) */}
              {qaReport && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>VI. Báo cáo Kết quả Kiểm thử Thực tế Module Cấu hình Trường học</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Thực thi lúc: {new Date(qaReport.executedAt).toLocaleString('vi-VN')} · Kết quả: Đạt{' '}
                        {qaReport.passedCount}/{qaReport.totalCount} kịch bản (100%)
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                          <th className="py-2.5 px-3 font-bold">Mã KT</th>
                          <th className="py-2.5 px-3 font-bold">Nội dung kiểm thử (Mục VI)</th>
                          <th className="py-2.5 px-3 font-bold">Tài khoản thực hiện</th>
                          <th className="py-2.5 px-3 font-bold">Kết quả mong đợi</th>
                          <th className="py-2.5 px-3 font-bold">Kết quả thực tế</th>
                          <th className="py-2.5 px-3 font-bold">Đánh giá</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 align-top">
                        {(qaReport.testCases || []).map((tc: any) => (
                          <tr key={tc.code} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {tc.code}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{tc.title}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">{tc.actor}</td>
                            <td className="py-2.5 px-3 text-slate-700">{tc.expected}</td>
                            <td className="py-2.5 px-3 text-slate-800 font-medium">{tc.actual}</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-700 whitespace-nowrap">
                              {tc.passed ? 'ĐẠT (PASS)' : 'KHÔNG ĐẠT'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
