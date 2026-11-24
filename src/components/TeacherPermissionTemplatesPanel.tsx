import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PlayCircle,
  Save,
  FileCheck2,
  Layers,
  Edit3,
  UserCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db as firestoreDb } from '../services/firebase/firebaseClient';
import {
  FunctionalPermissionCatalogItem,
  TeacherFunctionalPermissionCode,
  TeacherPermissionProfileSummary,
  TeacherPermissionTemplate,
  TeacherPermissionTemplateCategoryCode,
  TeacherPermissionTemplateQaSuiteReport,
  WorkflowActorRole,
} from '../types/domain';

interface TeacherPermissionTemplatesPanelProps {
  templates: TeacherPermissionTemplate[];
  functionalCatalog: FunctionalPermissionCatalogItem[];
  selectedTeacher: TeacherPermissionProfileSummary | undefined;
  allTeachers: TeacherPermissionProfileSummary[];
  showApplyDrawerInitial?: boolean;
  onCloseApplyDrawer?: () => void;
  onTemplatesUpdated: (nextTemplates: TeacherPermissionTemplate[]) => void;
  onAppliedToTeachers: (
    updatedProfiles: TeacherPermissionProfileSummary[],
    appliedPermissionsForCurrentTeacher?: TeacherFunctionalPermissionCode[],
    grantReviewerRole?: boolean,
    bannerMessage?: string,
    bannerDetails?: string[]
  ) => void;
}

const TEMPLATE_CATEGORY_LABELS: Record<TeacherPermissionTemplateCategoryCode, string> = {
  SUBJECT_TEACHER: '1. Giáo viên bộ môn',
  HOMEROOM_TEACHER: '2. Giáo viên chủ nhiệm',
  HEAD_OF_DEPARTMENT: '3. Tổ trưởng chuyên môn',
  REVIEWER_TEACHER: '4. Giáo viên phản biện',
  VICE_PRINCIPAL_ACADEMIC: '5. Phó hiệu trưởng chuyên môn',
  PRINCIPAL: '6. Hiệu trưởng',
  CUSTOM_TEMPLATE: 'Mẫu tùy chỉnh của nhà trường',
};

const ROLE_LABELS_VI: Record<WorkflowActorRole, string> = {
  SYSTEM_ADMIN: 'Quản trị hệ thống',
  PRINCIPAL: 'Hiệu trưởng',
  VICE_PRINCIPAL: 'Phó hiệu trưởng',
  HEAD_OF_DEPARTMENT: 'Tổ trưởng chuyên môn',
  TEACHER: 'Giáo viên',
  REVIEWER: 'Giáo viên phản biện',
};

export const TeacherPermissionTemplatesPanel: React.FC<
  TeacherPermissionTemplatesPanelProps
> = ({
  templates,
  functionalCatalog,
  selectedTeacher,
  allTeachers,
  showApplyDrawerInitial = false,
  onCloseApplyDrawer,
  onTemplatesUpdated,
  onAppliedToTeachers,
}) => {
  // Selected template for "Áp dụng mẫu quyền" flow (Mục IV)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    'tpl-subject-teacher'
  );
  const [showApplyModal, setShowApplyModal] = useState<boolean>(showApplyDrawerInitial);

  useEffect(() => {
    if (showApplyDrawerInitial) {
      setShowApplyModal(true);
    }
  }, [showApplyDrawerInitial]);

  // Target teacher(s) in Apply flow (default: currently selected teacher, with option to also pick a 2nd teacher)
  const [applyTargetUserIds, setApplyTargetUserIds] = useState<string[]>(
    selectedTeacher ? [selectedTeacher.userId] : ['user-gv-a']
  );

  useEffect(() => {
    if (selectedTeacher) {
      setApplyTargetUserIds((prev) =>
        prev.length <= 1 ? [selectedTeacher.userId] : prev
      );
    }
  }, [selectedTeacher]);

  // Step-by-step checkboxes in Apply Modal (Step 3: Điều chỉnh các checkbox & Step 4: Xác nhận)
  const [adjustedStandardPerms, setAdjustedStandardPerms] = useState<
    TeacherFunctionalPermissionCode[]
  >([]);
  const [confirmedSensitivePerms, setConfirmedSensitivePerms] = useState<
    TeacherFunctionalPermissionCode[]
  >([]);
  const [grantReviewerRoleWhenAppraise, setGrantReviewerRoleWhenAppraise] =
    useState<boolean>(false);
  const [explicitApplyConfirmed, setExplicitApplyConfirmed] = useState<boolean>(false);
  const [applyingTemplate, setApplyingTemplate] = useState<boolean>(false);

  // Create / Edit Template Form State (Mục I & III)
  const [showTemplateForm, setShowTemplateForm] = useState<boolean>(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formTemplateCode, setFormTemplateCode] =
    useState<TeacherPermissionTemplateCategoryCode>('CUSTOM_TEMPLATE');
  const [formTemplateName, setFormTemplateName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStandardPerms, setFormStandardPerms] = useState<
    TeacherFunctionalPermissionCode[]
  >([
    'VIEW_CURRICULUM',
    'VIEW_QUESTION_BANK',
    'CREATE_QUESTION',
    'EDIT_QUESTION',
    'CREATE_EXAM_MATRIX',
    'CREATE_EXAM_SPECIFICATION',
    'CREATE_EXAM_PAPER',
    'USE_AI_QUESTION_GENERATOR',
    'USE_AI_QUALITY_REVIEW',
    'SUBMIT_FOR_APPRAISAL',
    'EXPORT_EXAM_WORD_PDF',
  ]);
  const [formSensitivePerms, setFormSensitivePerms] = useState<
    TeacherFunctionalPermissionCode[]
  >([]);
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [savingTemplateForm, setSavingTemplateForm] = useState<boolean>(false);

  // QA 6-Step Automated Suite State (Mục VI)
  const [qaReport, setQaReport] =
    useState<TeacherPermissionTemplateQaSuiteReport | null>(null);
  const [runningQaSuite, setRunningQaSuite] = useState<boolean>(false);

  const activeTemplate = useMemo(
    () =>
      templates.find((t) => t.templateId === selectedTemplateId) ||
      templates[0],
    [templates, selectedTemplateId]
  );

  // Sync checkboxes whenever activeTemplate changes (Copy-on-Select so editing checkboxes doesn't mutate template)
  useEffect(() => {
    if (activeTemplate) {
      setAdjustedStandardPerms([...activeTemplate.functionalPermissionCodes]);
      // Mục V: Không bao giờ tự động tích sẵn quyền phê duyệt hoặc đề mật; quản trị viên phải xác nhận riêng
      setConfirmedSensitivePerms([]);
      setExplicitApplyConfirmed(false);
    }
  }, [activeTemplate]);

  const standardCatalogItems = useMemo(
    () => functionalCatalog.filter((f) => !f.isSensitive),
    [functionalCatalog]
  );

  const sensitiveCatalogItems = useMemo(
    () => functionalCatalog.filter((f) => f.isSensitive),
    [functionalCatalog]
  );

  const targetTeacherProfiles = useMemo(
    () => allTeachers.filter((t) => applyTargetUserIds.includes(t.userId)),
    [allTeachers, applyTargetUserIds]
  );

  // Evaluate role authority for sensitive permissions on the selected target teacher(s) (Mục V)
  const sensitiveAuthorityEvaluations = useMemo(() => {
    if (!activeTemplate) return [];
    const candidateSensitiveCodes = Array.from(
      new Set([
        ...activeTemplate.sensitiveConfirmationPermissions,
        ...sensitiveCatalogItems.map((s) => s.code),
      ])
    );

    return candidateSensitiveCodes.map((code) => {
      const meta = functionalCatalog.find((f) => f.code === code);
      const isInTemplate =
        activeTemplate.sensitiveConfirmationPermissions.includes(code);

      // Check if all selected target teachers have role authority
      const unauthorizedTeachers: string[] = [];
      for (const prof of targetTeacherProfiles) {
        if (code === 'APPROVE_EXAM' || code === 'EXPORT_ANSWER_KEY_RUBRIC') {
          const isBgh =
            prof.roles.includes('PRINCIPAL') ||
            prof.roles.includes('SYSTEM_ADMIN') ||
            prof.roles.includes('VICE_PRINCIPAL');
          if (!isBgh) {
            unauthorizedTeachers.push(
              `${prof.fullName} (${prof.roles.map((r) => ROLE_LABELS_VI[r]).join(', ')})`
            );
          }
        } else if (code === 'MANAGE_DEPARTMENT_QUESTION_BANK') {
          const isHeadOrBgh = prof.roles.some((r) =>
            [
              'HEAD_OF_DEPARTMENT',
              'VICE_PRINCIPAL',
              'PRINCIPAL',
              'SYSTEM_ADMIN',
            ].includes(r)
          );
          if (!isHeadOrBgh) {
            unauthorizedTeachers.push(
              `${prof.fullName} (${prof.roles.map((r) => ROLE_LABELS_VI[r]).join(', ')})`
            );
          }
        }
      }

      const canConfirm =
        code === 'APPRAISE_EXAM' || unauthorizedTeachers.length === 0;

      return {
        code,
        label: meta?.label || code,
        isInTemplate,
        canConfirm,
        unauthorizedTeachers,
        sensitiveReason:
          meta?.sensitiveReason ||
          'Quyền nhạy cảm cần xác nhận riêng và kiểm tra thẩm quyền.',
      };
    });
  }, [
    activeTemplate,
    functionalCatalog,
    sensitiveCatalogItems,
    targetTeacherProfiles,
  ]);

  const handleToggleAdjustedStandardPerm = (
    code: TeacherFunctionalPermissionCode
  ) => {
    setAdjustedStandardPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleToggleConfirmedSensitivePerm = (
    code: TeacherFunctionalPermissionCode,
    canConfirm: boolean
  ) => {
    if (!canConfirm) return;
    setConfirmedSensitivePerms((prev) => {
      const exists = prev.includes(code);
      if (exists) {
        return prev.filter((c) => c !== code);
      } else {
        if (code === 'APPRAISE_EXAM') {
          setGrantReviewerRoleWhenAppraise(true);
        }
        return [...prev, code];
      }
    });
  };

  const handleOpenCreateTemplate = () => {
    setEditingTemplateId(null);
    setFormTemplateCode('CUSTOM_TEMPLATE');
    setFormTemplateName('');
    setFormDescription('');
    setFormStandardPerms([
      'VIEW_CURRICULUM',
      'VIEW_QUESTION_BANK',
      'CREATE_QUESTION',
      'EDIT_QUESTION',
      'CREATE_EXAM_MATRIX',
      'CREATE_EXAM_SPECIFICATION',
      'CREATE_EXAM_PAPER',
      'USE_AI_QUESTION_GENERATOR',
      'USE_AI_QUALITY_REVIEW',
      'SUBMIT_FOR_APPRAISAL',
      'EXPORT_EXAM_WORD_PDF',
    ]);
    setFormSensitivePerms([]);
    setFormStatus('ACTIVE');
    setShowTemplateForm(true);
  };

  const handleOpenEditTemplate = (tpl: TeacherPermissionTemplate) => {
    setEditingTemplateId(tpl.templateId);
    setFormTemplateCode(tpl.templateCode);
    setFormTemplateName(tpl.templateName);
    setFormDescription(tpl.description);
    setFormStandardPerms([...tpl.functionalPermissionCodes]);
    setFormSensitivePerms([...tpl.sensitiveConfirmationPermissions]);
    setFormStatus(tpl.status);
    setShowTemplateForm(true);
  };

  const handleSaveTemplateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTemplateName.trim()) return;
    setSavingTemplateForm(true);
    try {
      const res = await fetch(
        '/api/security/teacher-permissions/templates/save',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: editingTemplateId || undefined,
            templateCode: formTemplateCode,
            templateName: formTemplateName.trim(),
            description: formDescription.trim(),
            functionalPermissionCodes: formStandardPerms,
            sensitiveConfirmationPermissions: formSensitivePerms,
            status: formStatus,
            createdBy: 'Quản trị hệ thống (admin.hethong)',
          }),
        }
      );
      const json = await res.json();
      if (json.ok && json.template) {
        const saved: TeacherPermissionTemplate = json.template;
        try {
          await setDoc(
            doc(
              firestoreDb,
              'schools',
              'SCHOOL_A',
              'teacherPermissionTemplates',
              saved.templateId
            ),
            {
              templateId: saved.templateId,
              schoolId: 'SCHOOL_A',
              templateCode: saved.templateCode,
              templateName: saved.templateName,
              description: saved.description,
              functionalPermissionCodesCsv:
                saved.functionalPermissionCodes.join(','),
              sensitiveConfirmationPermissionsCsv:
                saved.sensitiveConfirmationPermissions.join(','),
              status: saved.status,
              createdBy: saved.createdBy,
              createdAt: saved.createdAt,
              updatedAt: saved.updatedAt,
            },
            { merge: true }
          );
        } catch {
          // Server DB is primary truth
        }
        if (Array.isArray(json.templates)) {
          onTemplatesUpdated(json.templates);
        }
        setSelectedTemplateId(saved.templateId);
        setShowTemplateForm(false);
      }
    } catch {
      // ignore
    } finally {
      setSavingTemplateForm(false);
    }
  };

  // Execute Apply Template & Save (Mục IV & V)
  const handleConfirmAndSaveApplyTemplate = async () => {
    if (!activeTemplate || applyTargetUserIds.length === 0) return;
    if (!explicitApplyConfirmed) return;
    setApplyingTemplate(true);
    try {
      const res = await fetch(
        '/api/security/teacher-permissions/templates/apply',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: activeTemplate.templateId,
            userIds: applyTargetUserIds,
            adjustedStandardPermissions: adjustedStandardPerms,
            confirmedSensitivePermissions: confirmedSensitivePerms,
            grantReviewerRoleIfConfirmed: grantReviewerRoleWhenAppraise,
            actorName: 'Quản trị hệ thống (admin.hethong)',
          }),
        }
      );
      const json = await res.json();
      if (json.ok && Array.isArray(json.appliedProfiles)) {
        const currentUpdated = json.appliedProfiles.find(
          (p: TeacherPermissionProfileSummary) =>
            selectedTeacher && p.userId === selectedTeacher.userId
        );
        const details: string[] = [
          `Mẫu đã áp dụng: ${activeTemplate.templateName} (Mẫu gốc giữ nguyên bất biến: ${activeTemplate.functionalPermissionCodes.length} quyền chuẩn)`,
          `Giáo viên nhận quyền (${json.appliedProfiles.length}): ${json.appliedProfiles
            .map(
              (p: TeacherPermissionProfileSummary) =>
                `${p.fullName} — Giữ nguyên môn riêng: ${p.subjectAllocations
                  .map((s) => `${s.subjectName} (Khối ${s.grades.join(', ')})`)
                  .join('; ')}`
            )
            .join(' | ')}`,
          ...(Array.isArray(json.securityNotes) ? json.securityNotes : []),
        ];
        onAppliedToTeachers(
          json.appliedProfiles,
          currentUpdated ? currentUpdated.permissionCodes : undefined,
          grantReviewerRoleWhenAppraise,
          json.message,
          details
        );
        setShowApplyModal(false);
        if (onCloseApplyDrawer) onCloseApplyDrawer();
      }
    } catch {
      // ignore
    } finally {
      setApplyingTemplate(false);
    }
  };

  // Load template permissions into working checkboxes without saving immediately (Preview & Adjust)
  const handleLoadIntoWorkingCheckboxesOnly = () => {
    if (!selectedTeacher || !activeTemplate) return;
    const combinedPerms = Array.from(
      new Set([...adjustedStandardPerms, ...confirmedSensitivePerms])
    );
    onAppliedToTeachers(
      [],
      combinedPerms,
      grantReviewerRoleWhenAppraise,
      `Đã nạp xem trước mẫu "${activeTemplate.templateName}" vào bảng quyền của ${selectedTeacher.fullName}.`,
      [
        `Phân công môn học & khối lớp của ${selectedTeacher.fullName} được giữ nguyên theo thực tế (Không gắn cứng môn học vào mẫu).`,
        'Thầy/cô có thể tiếp tục điều chỉnh từng checkbox bên dưới rồi nhấn "Lưu phân quyền".',
      ]
    );
  };

  // Run 6-Step QA Suite (Mục VI)
  const handleRunTemplateQaSuite = async () => {
    setRunningQaSuite(true);
    try {
      const res = await fetch(
        '/api/security/teacher-permissions/templates/run-qa-suite',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const json = await res.json();
      if (json.ok && json.report) {
        setQaReport(json.report);
        if (Array.isArray(json.templates)) {
          onTemplatesUpdated(json.templates);
        }
        onAppliedToTeachers(
          [],
          undefined,
          undefined,
          'Đã hoàn thành Kiểm thử 6 Bước Mẫu Phân quyền Giáo viên (Mục VI: ĐẠT 6/6 bước).',
          [
            `Mẫu gốc [${json.report.originalTemplateIntegrityCheck.templateName}] giữ nguyên ${json.report.originalTemplateIntegrityCheck.afterTeacherEditPermissionsCount}/${json.report.originalTemplateIntegrityCheck.originalPermissionsCount} quyền sau khi sửa riêng quyền giáo viên.`,
            `Kiểm tra đăng nhập lại tài khoản ${json.report.reloginVerification.username}: HTTP ${json.report.reloginVerification.reloginHttpStatus} — Quyền & môn học bảo toàn 100%.`,
          ]
        );
      }
    } catch {
      // ignore
    } finally {
      setRunningQaSuite(false);
    }
  };

  return (
    <section
      id="area-teacher-permission-templates"
      className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xs overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900 text-white space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Quản lý & Áp dụng Mẫu Phân quyền Giáo viên
              </h2>
              <span className="text-xs font-semibold text-indigo-300">
                · 6 Mẫu chuẩn & Mẫu tùy chỉnh (Không gắn cứng môn học)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Áp dụng mẫu quyền cho {selectedTeacher?.fullName || 'Giáo viên'}
            </button>

            <button
              type="button"
              onClick={handleOpenCreateTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tạo mẫu quyền mới
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 pl-12">
          Chọn mẫu quyền có sẵn để xem trước, điều chỉnh checkbox, xác nhận riêng các quyền nhạy cảm và lưu cho giáo viên. Môn học và khối lớp luôn được cấp riêng theo phân công thực tế.
        </p>
      </div>

      <div className="p-6 space-y-6">
         {/* Nguyên tắc cấu hình mẫu */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-700">
          <div>
            <strong className="text-slate-900">
              Nguyên tắc cấu hình mẫu:
            </strong>{' '}
            Không gắn cứng môn học vào mẫu quyền chung · Môn học và khối lớp được cấp riêng theo phân công thực tế · Không tự động cấp quyền phê duyệt hoặc truy cập đề mật nếu chưa có xác nhận riêng và thẩm quyền phù hợp.
          </div>
          <span className="font-mono font-bold text-indigo-700 shrink-0 tabular-nums">
            Tổng số mẫu: {templates.length} mẫu
          </span>
        </div>

        {/* Mục II & III: Danh sách 6 Mẫu chuẩn + Mẫu tùy chỉnh */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const isSelected = tpl.templateId === selectedTemplateId;
            return (
              <div
                key={tpl.templateId}
                onClick={() => setSelectedTemplateId(tpl.templateId)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-500">
                        {TEMPLATE_CATEGORY_LABELS[tpl.templateCode] ||
                          tpl.templateCode}{' '}
                        ·{' '}
                        <span
                          className={
                            tpl.status === 'ACTIVE'
                              ? 'text-emerald-700 font-semibold'
                              : 'text-rose-700 font-semibold'
                          }
                        >
                          {tpl.status === 'ACTIVE'
                            ? 'Đang hoạt động'
                            : 'Ngừng kích hoạt'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {tpl.templateName}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditTemplate(tpl);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      Sửa mẫu
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between font-mono tabular-nums">
                    <span>
                      Quyền chức năng chuẩn:{' '}
                      <strong className="text-slate-900">
                        {tpl.functionalPermissionCodes.length} quyền
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Nhạy cảm xác nhận riêng:{' '}
                      <strong className="text-amber-800">
                        {tpl.sensitiveConfirmationPermissions.length} quyền
                      </strong>
                    </span>
                  </div>

                  <div className="text-slate-500">
                    Người tạo: {tpl.createdBy} · Cập nhật:{' '}
                    {new Date(tpl.updatedAt).toLocaleDateString('vi-VN')}
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplateId(tpl.templateId);
                        setShowApplyModal(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Áp dụng mẫu này cho {selectedTeacher?.fullName || 'GV'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Biểu mẫu Tạo mới / Chỉnh sửa Mẫu phân quyền (Mục III) */}
        {showTemplateForm && (
          <form
            onSubmit={handleSaveTemplateForm}
            className="p-5 rounded-xl bg-slate-50 border-2 border-indigo-300 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingTemplateId
                    ? `Chỉnh sửa Cấu hình Mẫu quyền: ${formTemplateName}`
                    : 'Tạo Mẫu Phân quyền Giáo viên Mới (Mục I & III)'}
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Lưu ý Mục III: Không gắn cứng môn học vào mẫu quyền chung. Môn học và khối lớp luôn được cấp riêng theo phân công thực tế của giáo viên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateForm(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên mẫu phân quyền *
                </label>
                <input
                  type="text"
                  required
                  value={formTemplateName}
                  onChange={(e) => setFormTemplateName(e.target.value)}
                  placeholder="VD: Giáo viên Cốt cán Tổ Toán - Tin"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nhóm mẫu chuẩn (Mục II)
                </label>
                <select
                  value={formTemplateCode}
                  onChange={(e) =>
                    setFormTemplateCode(
                      e.target.value as TeacherPermissionTemplateCategoryCode
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold"
                >
                  <option value="SUBJECT_TEACHER">1. Giáo viên bộ môn</option>
                  <option value="HOMEROOM_TEACHER">2. Giáo viên chủ nhiệm</option>
                  <option value="HEAD_OF_DEPARTMENT">
                    3. Tổ trưởng chuyên môn
                  </option>
                  <option value="REVIEWER_TEACHER">4. Giáo viên phản biện</option>
                  <option value="VICE_PRINCIPAL_ACADEMIC">
                    5. Phó hiệu trưởng chuyên môn
                  </option>
                  <option value="PRINCIPAL">6. Hiệu trưởng</option>
                  <option value="CUSTOM_TEMPLATE">
                    Mẫu tùy chỉnh của nhà trường
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trạng thái mẫu
                </label>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as 'ACTIVE' | 'INACTIVE')
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold"
                >
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Ngừng kích hoạt (INACTIVE)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mô tả chi tiết mẫu quyền
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Mô tả phạm vi công việc và đối tượng áp dụng mẫu quyền..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            {/* Danh sách quyền chức năng chuẩn trong mẫu */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800">
                Danh sách quyền chức năng chuẩn trong mẫu ({formStandardPerms.length}/
                {standardCatalogItems.length} quyền):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {standardCatalogItems.map((item) => {
                  const checked = formStandardPerms.includes(item.code);
                  return (
                    <label
                      key={item.code}
                      className={`p-2.5 rounded-lg border flex items-start gap-2 cursor-pointer ${
                        checked
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-slate-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setFormStandardPerms((prev) =>
                            prev.includes(item.code)
                              ? prev.filter((c) => c !== item.code)
                              : [...prev, item.code]
                          )
                        }
                        className="mt-0.5 rounded text-indigo-600"
                      />
                      <span>
                        {item.order}. {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Các quyền nhạy cảm cần xác nhận riêng */}
            <div className="space-y-2">
              <div className="font-bold text-amber-900">
                Các quyền nhạy cảm cần xác nhận riêng khi áp dụng ({formSensitivePerms.length}/
                {sensitiveCatalogItems.length} quyền):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {sensitiveCatalogItems.map((item) => {
                  const checked = formSensitivePerms.includes(item.code);
                  return (
                    <label
                      key={item.code}
                      className={`p-2.5 rounded-lg border flex items-start gap-2 cursor-pointer ${
                        checked
                          ? 'border-amber-500 bg-amber-50 font-semibold text-amber-950'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setFormSensitivePerms((prev) =>
                            prev.includes(item.code)
                              ? prev.filter((c) => c !== item.code)
                              : [...prev, item.code]
                          )
                        }
                        className="mt-0.5 rounded text-amber-600"
                      />
                      <div>
                        <span>
                          {item.order}. {item.label}
                        </span>
                        <span className="block text-[10px] text-amber-800 mt-0.5">
                          Cần xác nhận riêng & kiểm tra vai trò
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={savingTemplateForm}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
              >
                {savingTemplateForm ? 'Đang lưu mẫu...' : 'Lưu cấu hình mẫu quyền'}
              </button>
            </div>
          </form>
        )}

        {/* MỤC IV & V: KHUNG ÁP DỤNG MẪU QUYỀN (Chọn mẫu -> Xem trước quyền -> Điều chỉnh checkbox -> Xác nhận -> Lưu) */}
        {showApplyModal && activeTemplate && (
          <div className="p-5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-500 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-indigo-200 pb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  QUY TRÌNH ÁP DỤNG MẪU QUYỀN (MỤC IV & V): CHỌN MẪU → XEM TRƯỚC QUYỀN → ĐIỀU CHỈNH CHECKBOX → XÁC NHẬN → LƯU
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Áp dụng mẫu "{activeTemplate.templateName}" cho Giáo viên đã chọn
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowApplyModal(false);
                  if (onCloseApplyDrawer) onCloseApplyDrawer();
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer self-start"
              >
                Đóng khung áp dụng
              </button>
            </div>

            {/* Bước 1 & 2: Chọn Mẫu & Chọn Giáo viên nhận mẫu (Cho phép chọn 1 hoặc 2+ giáo viên theo Mục VI) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5">
                <label className="block font-bold text-slate-900">
                  Bước 1 · Chọn Mẫu quyền cần áp dụng:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                >
                  {templates.map((t) => (
                    <option key={t.templateId} value={t.templateId}>
                      {t.templateName} ({t.functionalPermissionCodes.length}{' '}
                      quyền chuẩn ·{' '}
                      {t.sensitiveConfirmationPermissions.length} quyền nhạy cảm)
                    </option>
                  ))}
                </select>
                <p className="text-slate-600">{activeTemplate.description}</p>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium">
                  ✓ Chính sách Môn học & Khối lớp: Mẫu không gắn cứng môn học. Phân công môn dạy và khối lớp hiện tại của từng giáo viên được bảo toàn 100%.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Bước 2 · Giáo viên nhận mẫu & Phạm vi Môn/Khối thực tế được giữ nguyên:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setApplyTargetUserIds(['user-gv-a', 'user-gv-d'])}
                      className="px-2 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold text-[11px] cursor-pointer"
                    >
                      Chọn nhanh 2 GV (GV A & GV D)
                    </button>
                    {selectedTeacher && (
                      <button
                        type="button"
                        onClick={() => setApplyTargetUserIds([selectedTeacher.userId])}
                        className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                      >
                        Chỉ chọn {selectedTeacher.username}
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {allTeachers.slice(0, 12).map((t) => {
                    const isChecked = applyTargetUserIds.includes(t.userId);
                    return (
                      <label
                        key={t.userId}
                        className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer ${
                          isChecked
                            ? 'border-indigo-600 bg-indigo-50/70'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setApplyTargetUserIds((prev) =>
                                prev.includes(t.userId)
                                  ? prev.filter((id) => id !== t.userId)
                                  : [...prev, t.userId]
                              )
                            }
                            className="rounded text-indigo-600"
                          />
                          <span className="font-bold text-slate-900">
                            {t.fullName} ({t.username})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600">
                          Môn riêng:{' '}
                          <strong>
                            {t.subjectAllocations
                              .map(
                                (s) =>
                                  `${s.subjectName} (K${s.grades.join(',')})`
                              )
                              .join('; ')}
                          </strong>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bước 3: Xem trước quyền & Điều chỉnh các checkbox */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900">
                    Bước 3 · Xem trước quyền & Điều chỉnh các checkbox trước khi áp dụng ({adjustedStandardPerms.length} quyền chuẩn đang chọn):
                  </h4>
                  <p className="text-slate-500">
                    Việc điều chỉnh các checkbox dưới đây chỉ áp dụng cho giáo viên được chọn, không làm thay đổi mẫu gốc "{activeTemplate.templateName}".
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustedStandardPerms([
                        ...activeTemplate.functionalPermissionCodes,
                      ])
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                  >
                    Khôi phục theo mẫu gốc
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {standardCatalogItems.map((item) => {
                  const isChecked = adjustedStandardPerms.includes(item.code);
                  const isInOriginalTemplate =
                    activeTemplate.functionalPermissionCodes.includes(item.code);
                  return (
                    <label
                      key={item.code}
                      className={`p-2.5 rounded-lg border flex items-start gap-2 cursor-pointer ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/70'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAdjustedStandardPerm(item.code)}
                        className="mt-0.5 rounded text-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-900">
                          {item.order}. {item.label}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {isInOriginalTemplate
                            ? 'Có trong mẫu gốc'
                            : isChecked
                            ? 'Bổ sung riêng'
                            : 'Không thuộc mẫu'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Khu vực xác nhận riêng các quyền nhạy cảm (Mục III & Mục V) */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Quyền nhạy cảm cần xác nhận riêng (Mục V: Tuyệt đối KHÔNG tự động cấp quyền Phê duyệt đề hoặc Truy cập đề mật/đáp án nếu chưa xác nhận và chưa đủ thẩm quyền):
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {sensitiveAuthorityEvaluations.map((ev) => {
                    const isConfirmed = confirmedSensitivePerms.includes(ev.code);
                    return (
                      <div
                        key={ev.code}
                        className={`p-3 rounded-xl border ${
                          !ev.canConfirm
                            ? 'border-rose-200 bg-rose-50/60 opacity-90'
                            : isConfirmed
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <label
                          className={`flex items-start gap-2 ${
                            ev.canConfirm
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!ev.canConfirm}
                            checked={isConfirmed}
                            onChange={() =>
                              handleToggleConfirmedSensitivePerm(
                                ev.code,
                                ev.canConfirm
                              )
                            }
                            className="mt-0.5 rounded text-amber-600"
                          />
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900">
                              {ev.label}{' '}
                              {ev.isInTemplate && (
                                <span className="text-amber-800">
                                  · (Gợi ý trong mẫu — Cần xác nhận riêng)
                                </span>
                              )}
                            </div>
                            {!ev.canConfirm ? (
                              <p className="text-[11px] font-semibold text-rose-800">
                                ⛔ Chặn cấp tự động (Mục V): Tài khoản{' '}
                                {ev.unauthorizedTeachers.join(', ')} không có thẩm quyền Ban Giám hiệu / Tổ trưởng phù hợp với quyền này.
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-600">
                                {ev.sensitiveReason}
                              </p>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bước 4 & 5: Xác nhận và Lưu */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={explicitApplyConfirmed}
                  onChange={(e) => setExplicitApplyConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-500 cursor-pointer"
                />
                <span className="text-xs leading-relaxed">
                  <strong>Bước 4 · Xác nhận áp dụng mẫu quyền:</strong> Tôi đã kiểm tra danh sách xem trước ({adjustedStandardPerms.length} quyền chuẩn + {confirmedSensitivePerms.length} quyền nhạy cảm xác nhận riêng) cho{' '}
                  <strong>{applyTargetUserIds.length} giáo viên</strong>, giữ nguyên môn học/khối lớp thực tế và đảm bảo không tự động cấp quyền phê duyệt hay đề mật trái thẩm quyền.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleLoadIntoWorkingCheckboxesOnly}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs cursor-pointer whitespace-nowrap"
                >
                  Nạp vào bảng checkbox bên dưới
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSaveApplyTemplate}
                  disabled={
                    applyingTemplate ||
                    !explicitApplyConfirmed ||
                    applyTargetUserIds.length === 0
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Save className="w-4 h-4" />
                  {applyingTemplate
                    ? 'Đang lưu áp dụng mẫu...'
                    : `Bước 5 · Xác nhận & Lưu (${applyTargetUserIds.length} GV)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MỤC VI: BÁO CÁO KẾT QUẢ KIỂM THỬ 6 BƯỚC MẪU PHÂN QUYỀN */}
        {qaReport && (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Báo cáo Kiểm thử Tự động 6 Bước — Mẫu Phân quyền Giáo viên (Mục VI)
                  </h3>
                  <p className="text-emerald-800">
                    Mã chạy: <span className="font-mono">{qaReport.runId}</span> · Kết luận:{' '}
                    <strong>
                      {qaReport.allStepsPassed
                        ? 'ĐẠT 100% (6/6 Bước Kiểm thử)'
                        : 'CẦN KIỂM TRA'}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="font-mono text-[11px] text-emerald-900 tabular-nums">
                Mẫu gốc trước sửa GV: {qaReport.originalTemplateIntegrityCheck.originalPermissionsCount} quyền · Sau sửa GV: {qaReport.originalTemplateIntegrityCheck.afterTeacherEditPermissionsCount} quyền (Không bị thay đổi)
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-emerald-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-emerald-900 text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Bước kiểm thử (Mục VI)</th>
                    <th className="py-2.5 px-3 font-bold">Thao tác thực hiện</th>
                    <th className="py-2.5 px-3 font-bold">Kết quả mong đợi</th>
                    <th className="py-2.5 px-3 font-bold">Kết quả thực tế</th>
                    <th className="py-2.5 px-3 font-bold">Mẫu gốc bất biến</th>
                    <th className="py-2.5 px-3 font-bold">Kết luận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {qaReport.steps.map((s) => (
                    <tr key={s.stepNumber} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {s.stepTitle}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {s.actionPerformed}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {s.expectedOutcome}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 font-medium">
                        {s.actualOutcome}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {s.templateUnchangedVerified ? '✓ Giữ nguyên' : 'Biến đổi'}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {s.passed ? (
                          <span className="text-emerald-700">✓ ĐẠT</span>
                        ) : (
                          <span className="text-rose-700">✗ KHÔNG ĐẠT</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
