import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { TeacherPermissionProfileSummary } from '../types/domain';

interface ModuleSyncStatusItem {
  moduleOrder: number;
  moduleCode: string;
  moduleTitle: string;
  synchronized: boolean;
  uiSyncStatus: string;
  backendSyncStatus: string;
  summary: string;
}

interface DirectApiTestCaseItem {
  testId: string;
  moduleName: string;
  actorLabel: string;
  operation: string;
  httpStatus: number;
  expected: string;
  actual: string;
  passed: boolean;
}

interface CrossModuleSyncReport {
  runId: string;
  executedAt: string;
  totalModules: number;
  synchronizedModulesCount: number;
  missingModulesCount: number;
  allModulesSynchronized: boolean;
  totalApiTests: number;
  passedApiTests: number;
  moduleSyncStatuses: ModuleSyncStatusItem[];
  directApiTestCases: DirectApiTestCaseItem[];
}

export interface CrossModulePermissionSyncBannerProps {
  activeMenuId: string;
  currentUserId: string;
  teacherProfile: TeacherPermissionProfileSummary | null;
  enforceScopeLock: boolean;
  onToggleScopeLock: (next: boolean) => void;
  onSelectTestAccount: (userId: string) => void;
  onRefreshProfile: () => void;
  onOpenPermissionAdmin?: () => void;
  onNotify: (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => void;
}

const QUICK_TEST_ACCOUNTS: Array<{
  userId: string;
  shortLabel: string;
  badgeText: string;
}> = [
  {
    userId: 'user-gv-a',
    shortLabel: 'GV A (Tiểu học · Toán 4, 5)',
    badgeText: 'Có AI & Xuất nháp · Không duyệt',
  },
  {
    userId: 'user-gv-b',
    shortLabel: 'GV B (THCS · Ngữ văn 6, 7)',
    badgeText: 'Không AI · Không xuất đề · Không thẩm định',
  },
  {
    userId: 'user-gv-c',
    shortLabel: 'GV C (Liên cấp Toán 5, 6 · Phản biện)',
    badgeText: 'Có Thẩm định hồ sơ phân công · Không duyệt',
  },
  {
    userId: 'user-nda-pdf-09',
    shortLabel: 'Tổ trưởng (Thầy Thái Dũng)',
    badgeText: 'Quản lý NH câu hỏi tổ & Thẩm định',
  },
  {
    userId: 'user-principal-a',
    shortLabel: 'Hiệu trưởng (ThS. Nguyễn Văn Minh)',
    badgeText: 'Có quyền Phê duyệt (Chặn tự duyệt đề mình tạo)',
  },
];

export const CrossModulePermissionSyncBanner: React.FC<
  CrossModulePermissionSyncBannerProps
> = ({
  activeMenuId,
  currentUserId,
  teacherProfile,
  enforceScopeLock,
  onToggleScopeLock,
  onSelectTestAccount,
  onRefreshProfile,
  onOpenPermissionAdmin,
  onNotify,
}) => {
  const [syncReport, setSyncReport] = useState<CrossModuleSyncReport | null>(
    null
  );
  const [isRunningSuite, setIsRunningSuite] = useState(false);
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  const [liveProbeOutcome, setLiveProbeOutcome] = useState<{
    allowed: boolean;
    httpStatus: number;
    errorCode: string;
    message: string;
  } | null>(null);

  const runFullCrossModuleSyncSuite = async (openModal = true) => {
    setIsRunningSuite(true);
    try {
      const res = await fetch(
        '/api/security/module-guard/run-cross-module-sync-test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const json = await res.json();
      if (json.ok && json.report) {
        setSyncReport(json.report);
        if (openModal) {
          setShowReportDrawer(true);
        }
        onNotify(
          'success',
          `Đã kiểm thử đồng bộ ${json.report.synchronizedModulesCount}/${json.report.totalModules} Module`,
          `Đạt ${json.report.passedApiTests}/${json.report.totalApiTests} kịch bản gọi API trực tiếp tại Backend.`
        );
      }
    } catch {
      onNotify(
        'error',
        'Lỗi kết nối máy chủ',
        'Không thể chạy bộ kiểm thử đồng bộ đa module.'
      );
    } finally {
      setIsRunningSuite(false);
    }
  };

  useEffect(() => {
    runFullCrossModuleSyncSuite(false);
  }, []);

  const triggerDirectModuleApiProbe = async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/security/module-guard/verify-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          ...payload,
        }),
      });
      const json = await res.json();
      setLiveProbeOutcome({
        allowed: Boolean(json.allowed),
        httpStatus: res.status,
        errorCode: String(json.errorCode || ''),
        message: String(json.message || ''),
      });
      onNotify(
        json.allowed ? 'success' : 'error',
        json.allowed
          ? `Hợp lệ (HTTP ${res.status} · ${json.errorCode})`
          : `Bị chặn tại Backend (HTTP ${res.status} · ${json.errorCode})`,
        String(json.message || '')
      );
    } catch {
      onNotify('error', 'Lỗi kiểm tra API', 'Không thể kết nối Backend.');
    }
  };

  const getModuleSpecificContext = () => {
    switch (activeMenuId) {
      case 'questions':
        return {
          sectionCode: 'Mục II · Đồng bộ với Ngân hàng câu hỏi',
          ruleSummary:
            'Chỉ tạo câu hỏi trong môn & khối được cấp · Chỉ sửa câu hỏi do mình tạo hoặc được phân công · Xem ngân hàng theo phạm vi được phép.',
          validProbeLabel: 'Thử API Tạo câu hỏi đúng phạm vi',
          validProbePayload: {
            moduleCode: 'QUESTION_BANK',
            operationCode: 'CREATE_QUESTION',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
          },
          blockedProbeLabel: 'Thử API Sửa câu hỏi người khác (Không phân công)',
          blockedProbePayload: {
            moduleCode: 'QUESTION_BANK',
            operationCode: 'EDIT_QUESTION',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
            targetOwnerUserId: 'user-other-teacher',
            isAssignedToActor: false,
          },
        };
      case 'matrix':
        return {
          sectionCode: 'Mục III · Đồng bộ với Ma trận & Bản đặc tả',
          ruleSummary:
            'Chỉ hiển thị cấp học, môn học và khối lớp được cấp · Chặn lưu ma trận ngoài phạm vi tại cả giao diện và Backend.',
          validProbeLabel: 'Thử API Lưu ma trận đúng môn/khối được cấp',
          validProbePayload: {
            moduleCode: 'MATRIX_SPECIFICATION',
            operationCode: 'SAVE_MATRIX',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
          },
          blockedProbeLabel: 'Thử API Lưu ma trận ngoài phạm vi (Vật lí Lớp 9)',
          blockedProbePayload: {
            moduleCode: 'MATRIX_SPECIFICATION',
            operationCode: 'SAVE_MATRIX',
            educationLevelId: 'LOWER_SECONDARY',
            subjectName: 'Khoa học tự nhiên',
            grade: 9,
          },
        };
      case 'exams':
        return {
          sectionCode: 'Mục IV · Đồng bộ với Tạo đề kiểm tra',
          ruleSummary:
            'Tự động đọc phân quyền khi mở trang · Lọc cấp học, môn học, khối lớp · Kiểm tra quyền khi bấm Tạo đề, Lưu đề và Xuất đề.',
          validProbeLabel: 'Thử API Tạo & Lưu đề trong phạm vi',
          validProbePayload: {
            moduleCode: 'EXAM_GENERATOR',
            operationCode: 'GENERATE_EXAM',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
          },
          blockedProbeLabel: 'Thử API Xuất đề khi không có quyền / ngoài khối',
          blockedProbePayload: {
            moduleCode: 'EXAM_GENERATOR',
            operationCode: 'EXPORT_EXAM',
            educationLevelId: 'LOWER_SECONDARY',
            subjectName: 'Ngữ văn',
            grade: 9,
          },
        };
      case 'ai-generator':
      case 'ai-quality-review':
        return {
          sectionCode: 'Mục V · Đồng bộ với AI Tạo câu hỏi & Kiểm tra chất lượng',
          ruleSummary:
            'Chỉ dùng AI tạo câu hỏi / kiểm tra chất lượng / gợi ý chỉnh sửa nếu có quyền · Chặn AI tự cấp quyền hoặc mở rộng phạm vi môn học.',
          validProbeLabel: 'Thử API Gọi AI trong phạm vi được cấp',
          validProbePayload: {
            moduleCode: 'AI_ASSISTANT',
            operationCode:
              activeMenuId === 'ai-generator'
                ? 'AI_GENERATE_QUESTIONS'
                : 'AI_QUALITY_REVIEW',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
          },
          blockedProbeLabel: 'Thử API Yêu cầu AI tự mở rộng phạm vi môn học',
          blockedProbePayload: {
            moduleCode: 'AI_ASSISTANT',
            operationCode: 'AI_GENERATE_QUESTIONS',
            educationLevelId: 'PRIMARY',
            subjectName: 'Toán',
            grade: 4,
            aiRequestedExpandScope: true,
          },
        };
      case 'appraisal-approval':
        return {
          sectionCode: 'Mục VI & VII · Đồng bộ với Thẩm định & Phê duyệt đề',
          ruleSummary:
            'GV phản biện chỉ xem/thẩm định hồ sơ được phân công, không mặc định có quyền duyệt · Chặn tuyệt đối người tạo đề tự phê duyệt đề của mình.',
          validProbeLabel: 'Thử API Thẩm định hồ sơ được phân công (WF-2026-TOAN6-GK1)',
          validProbePayload: {
            moduleCode: 'APPRAISAL',
            operationCode: 'APPRAISE_ASSIGNED_DOSSIER',
            dossierId: 'WF-2026-TOAN6-GK1',
          },
          blockedProbeLabel: 'Thử API Người tạo đề tự phê duyệt đề của mình',
          blockedProbePayload: {
            moduleCode: 'APPROVAL',
            operationCode: 'OFFICIAL_APPROVE',
            dossierId: 'WF-2026-SELF-AUTHORED',
            dossierAuthorUserId: currentUserId,
          },
        };
      case 'dossier-export':
        return {
          sectionCode: 'Mục VIII · Đồng bộ với Xuất hồ sơ (5 Quyền xuất độc lập)',
          ruleSummary:
            'Phân biệt rõ 5 quyền: (1) Xuất bản nháp · (2) Xuất đề đã phê duyệt · (3) Xuất đáp án · (4) Xuất hồ sơ thẩm định · (5) Xuất báo cáo.',
          validProbeLabel: 'Thử API Xuất bản nháp (EXPORT_DRAFT_PAPER)',
          validProbePayload: {
            moduleCode: 'DOSSIER_EXPORT',
            operationCode: 'EXPORT_DRAFT_PAPER',
            exportType: 'EXPORT_DRAFT_PAPER',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
          },
          blockedProbeLabel: 'Thử API Xuất đáp án mật (EXPORT_ANSWER_KEY_RUBRIC)',
          blockedProbePayload: {
            moduleCode: 'DOSSIER_EXPORT',
            operationCode: 'EXPORT_ANSWER_KEY_RUBRIC',
            exportType: 'EXPORT_ANSWER_KEY_RUBRIC',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
          },
        };
      default:
        return {
          sectionCode: 'Mục I -> X · Đồng bộ Phân quyền Giáo viên Toàn hệ thống',
          ruleSummary:
            'Quyền do Quản trị viên cấp quyết định Menu hiển thị, Nút chức năng, Cấp học, Môn học, Khối lớp, Dữ liệu truy cập và Thao tác Backend.',
          validProbeLabel: 'Thử API Kiểm tra quyền hợp lệ',
          validProbePayload: {
            moduleCode: 'EXAM_GENERATOR',
            operationCode: 'GENERATE_EXAM',
            educationLevelId:
              teacherProfile?.subjectAllocations?.[0]?.educationLevelId ||
              'PRIMARY',
            subjectName:
              teacherProfile?.subjectAllocations?.[0]?.subjectName || 'Toán',
            grade: teacherProfile?.subjectAllocations?.[0]?.grades?.[0] || 4,
          },
          blockedProbeLabel: 'Thử API Tự phê duyệt đề của mình (403)',
          blockedProbePayload: {
            moduleCode: 'APPROVAL',
            operationCode: 'OFFICIAL_APPROVE',
            dossierAuthorUserId: currentUserId,
          },
        };
    }
  };

  const moduleCtx = getModuleSpecificContext();
  const grantedCombosText =
    teacherProfile && teacherProfile.normalizedRecords.length > 0
      ? teacherProfile.normalizedRecords
          .map(
            (r) =>
              `${r.EducationLevelId === 'PRIMARY' ? 'Tiểu học' : 'THCS'}: ${
                r.SubjectName
              } Lớp ${r.GradeId}`
          )
          .join(' · ')
      : 'Toàn trường (Ban Giám hiệu / Quản trị hệ thống)';

  return (
    <div className="mb-4 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-900 px-2.5 py-1 text-xs font-bold text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            {moduleCtx.sectionCode}
          </span>
          {teacherProfile && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-950">
              <UserCheck className="h-3.5 w-3.5 text-indigo-700" />
              {teacherProfile.fullName} ({teacherProfile.username})
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
            <KeyRound className="h-3.5 w-3.5 text-emerald-700" />
            Phạm vi được cấp: {grantedCombosText}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={enforceScopeLock}
              onChange={(e) => onToggleScopeLock(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Lock className="h-3.5 w-3.5 text-indigo-600" />
            Khóa Cấp – Môn – Khối theo quyền
          </label>

          <button
            type="button"
            onClick={() => {
              onRefreshProfile();
              onNotify(
                'info',
                'Đã đồng bộ lại quyền từ Máy chủ',
                'Đã đọc lại bảng TeacherPermissionGrants mới nhất cho phiên đang mở (Mục IX).'
              );
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
            Đồng bộ lại quyền
          </button>

          {onOpenPermissionAdmin && (
            <button
              type="button"
              onClick={onOpenPermissionAdmin}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900 hover:bg-indigo-100"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-700" />
              Mở Quản trị Phân quyền
            </button>
          )}

          <button
            type="button"
            disabled={isRunningSuite}
            onClick={() => runFullCrossModuleSyncSuite(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-indigo-800 disabled:opacity-60"
          >
            <FlaskConical className="h-3.5 w-3.5 text-amber-300" />
            {isRunningSuite
              ? 'Đang kiểm thử 9 Module...'
              : syncReport
              ? `Báo cáo Đồng bộ (${syncReport.synchronizedModulesCount}/${syncReport.totalModules} Module · ${syncReport.passedApiTests}/${syncReport.totalApiTests} API ĐẠT)`
              : 'Chạy Kiểm thử Đồng bộ 9 Module (Mục X)'}
          </button>
        </div>
      </div>

      {/* Hàng chuyển nhanh tài khoản thử nghiệm & thử API trực tiếp */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-600">
            Chuyển nhanh tài khoản kiểm thử (Mục X):
          </span>
          {QUICK_TEST_ACCOUNTS.map((acc) => {
            const isSelected = currentUserId === acc.userId;
            return (
              <button
                key={acc.userId}
                type="button"
                onClick={() => onSelectTestAccount(acc.userId)}
                title={acc.badgeText}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {acc.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              triggerDirectModuleApiProbe(moduleCtx.validProbePayload)
            }
            className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            {moduleCtx.validProbeLabel}
          </button>

          <button
            type="button"
            onClick={() =>
              triggerDirectModuleApiProbe(moduleCtx.blockedProbePayload)
            }
            className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900 hover:bg-rose-100"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-700" />
            {moduleCtx.blockedProbeLabel}
          </button>
        </div>
      </div>

      {/* Kết quả gọi API trực tiếp tại module đang mở */}
      {liveProbeOutcome && (
        <div
          className={`mt-2 flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs ${
            liveProbeOutcome.allowed
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-rose-300 bg-rose-50 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {liveProbeOutcome.allowed ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-700" />
            )}
            <span>
              <strong>
                [Kiểm tra Backend HTTP {liveProbeOutcome.httpStatus} ·{' '}
                {liveProbeOutcome.errorCode}]:
              </strong>{' '}
              {liveProbeOutcome.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLiveProbeOutcome(null)}
            className="text-xs font-semibold underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Bảng báo cáo chi tiết 9 Module & 14 Kịch bản API trực tiếp (Mục X) */}
      {showReportDrawer && syncReport && (
        <div className="mt-3 rounded-xl border border-indigo-300 bg-white p-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                BÁO CÁO ĐỒNG BỘ HỆ THỐNG PHÂN QUYỀN GIÁO VIÊN VỚI TẤT CẢ MODULE HIỆN CÓ (MỤC I → MỤC X)
              </h3>
              <p className="text-xs text-slate-600">
                Mã lần chạy: <span className="font-mono">{syncReport.runId}</span> ·
                Module đã đồng bộ:{' '}
                <strong className="text-emerald-700">
                  {syncReport.synchronizedModulesCount}/{syncReport.totalModules}
                </strong>{' '}
                · Module còn thiếu:{' '}
                <strong className="text-slate-800">
                  {syncReport.missingModulesCount}
                </strong>{' '}
                · Kiểm thử API trực tiếp:{' '}
                <strong className="text-emerald-700">
                  {syncReport.passedApiTests}/{syncReport.totalApiTests} ĐẠT
                </strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReportDrawer(false)}
              className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              Thu gọn báo cáo
            </button>
          </div>

          {/* Phần 1: Trạng thái đồng bộ từng module */}
          <div className="mt-3">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-950">
              1. Bảng trạng thái đồng bộ 9 Module (Giao diện UI & Backend API)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-bold">Module / Hạng mục</th>
                    <th className="px-3 py-2 font-bold">Đồng bộ Giao diện</th>
                    <th className="px-3 py-2 font-bold">Đồng bộ Backend</th>
                    <th className="px-3 py-2 font-bold">Chi tiết cơ chế kiểm soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {syncReport.moduleSyncStatuses.map((mod) => (
                    <tr key={mod.moduleCode} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {mod.moduleTitle}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-900">
                          <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                          {mod.uiSyncStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-900">
                          <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                          {mod.backendSyncStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{mod.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phần 2: Kết quả 14 kịch bản gọi API trực tiếp */}
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-950">
              2. Kết quả 14 Kịch bản Kiểm thử Thao tác Trực tiếp bằng API (GV A, GV B, GV C, Phản biện, Hiệu trưởng)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-2.5 py-2 font-bold">Mã</th>
                    <th className="px-2.5 py-2 font-bold">Module</th>
                    <th className="px-2.5 py-2 font-bold">Tài khoản thử nghiệm</th>
                    <th className="px-2.5 py-2 font-bold">Thao tác gọi API trực tiếp</th>
                    <th className="px-2.5 py-2 font-bold">HTTP</th>
                    <th className="px-2.5 py-2 font-bold">Kết quả thực tế tại Backend</th>
                    <th className="px-2.5 py-2 font-bold">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {syncReport.directApiTestCases.map((tc) => (
                    <tr key={tc.testId} className="hover:bg-slate-50">
                      <td className="px-2.5 py-2 font-mono font-bold text-indigo-900">
                        {tc.testId}
                      </td>
                      <td className="px-2.5 py-2 font-semibold text-slate-800">
                        {tc.moduleName}
                      </td>
                      <td className="px-2.5 py-2 text-slate-700">{tc.actorLabel}</td>
                      <td className="px-2.5 py-2 text-slate-800">{tc.operation}</td>
                      <td className="px-2.5 py-2 font-mono font-bold">
                        <span
                          className={`rounded px-1.5 py-0.5 ${
                            tc.httpStatus === 200
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {tc.httpStatus}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-slate-600">{tc.actual}</td>
                      <td className="px-2.5 py-2">
                        {tc.passed ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-900">
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                            ĐẠT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-900">
                            <AlertTriangle className="h-3 w-3 text-rose-700" />
                            CHƯA ĐẠT
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
    </div>
  );
};
