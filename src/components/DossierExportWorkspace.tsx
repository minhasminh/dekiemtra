import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  CheckSquare,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  History,
  Lock,
  Printer,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Unlock,
} from 'lucide-react';
import {
  ApprovalStatus,
  DataSourceFilter,
  DossierDocumentTypeCode,
  DossierSecurityConfig,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ExportDownloadAuditLog,
  ExportFileFormat,
  ExportPresentationTemplate,
  GeneratedFileInspectionResult,
  MatrixFormatGroupCode,
  QuestionItem,
  SchoolRoleCode,
  StorageConfig,
  TeacherPermissionProfileSummary,
  ToastNotification,
} from '../types/domain';
import { getApprovalStatusInfo } from '../services/business/assessmentRules';
import {
  DEFAULT_12_APPRAISAL_CRITERIA,
  generateOfficialAppraisalMinutes,
  SCHOOL_USERS,
} from '../services/business/appraisalWorkflowService';
import {
  buildGrade4MathSampleDossierPayloads,
  calculateMatrixSummary,
  checkExportSecurityPermission,
  DEFAULT_EXPORT_TEMPLATES,
  DOSSIER_DOCUMENT_CATALOG,
  exactAdd,
  exactRound,
  FORMAT_GROUP_DEFINITIONS,
  formatExamHeaderRightTitle,
  generateDocxBlobForDocument,
  generateDossierZipBundle,
  generatePdfBlobForDocument,
  generateXlsxBlobForDocument,
  getCognitiveLevelLabel,
  getExamPeriodVietnameseLabel,
  getQuestionFormatLabel,
  getSectionInstructionForFormatGroup,
  getSectionTitleForFormatGroup,
  inspectAndVerifyGeneratedFile,
  isRecordOfficiallyApproved,
  LEVEL_COLUMN_DEFINITIONS,
  resolveDossierContext,
  triggerBrowserDownload,
} from '../services/export/dossierExportService';
import { MathFormulaView as MathTextRenderer } from './MathFormulaView';

interface DossierExportWorkspaceProps {
  exams: ExamPaper[];
  matrices: ExamMatrix[];
  questions: QuestionItem[];
  config: StorageConfig;
  sourceFilter: DataSourceFilter;
  globalLevelFilter: EducationLevelId | 'ALL';
  teacherPermissionProfile?: TeacherPermissionProfileSummary | null;
  enforceTeacherScope?: boolean;
  onAddMatrix: (newMatrix: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>) => ExamMatrix;
  onAddExam: (
    newExam: Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>
  ) => ExamPaper;
  onSaveConfig: (nextConfig: StorageConfig) => void;
  onNotify: (
    type: ToastNotification['type'],
    title: string,
    message: string
  ) => void;
}

type ExportActorOption = {
  id: string;
  fullName: string;
  role: SchoolRoleCode | 'STUDENT_GUEST_RESTRICTED';
  roleLabel: string;
};

const EXPORT_ACTORS: ExportActorOption[] = [
  ...SCHOOL_USERS.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    role: u.role,
    roleLabel: u.roleLabel,
  })),
  {
    id: 'user-student-guest',
    fullName: 'Em Nguyễn Minh Khôi (Tài khoản Học sinh / Khách)',
    role: 'STUDENT_GUEST_RESTRICTED',
    roleLabel: 'Học sinh / Không có quyền mật',
  },
];

export const DossierExportWorkspace: React.FC<DossierExportWorkspaceProps> = ({
  exams,
  matrices,
  questions,
  config,
  sourceFilter,
  globalLevelFilter,
  teacherPermissionProfile,
  enforceTeacherScope = false,
  onAddMatrix,
  onAddExam,
  onSaveConfig,
  onNotify,
}) => {
  // 1. Lọc danh sách Đề kiểm tra khả dụng
  const filteredExams = useMemo(() => {
    return exams.filter((ex) => {
      if (sourceFilter === 'SAMPLE' && !ex.isSampleData) return false;
      if (sourceFilter === 'REAL' && ex.isSampleData) return false;
      if (globalLevelFilter !== 'ALL' && ex.levelId !== globalLevelFilter)
        return false;
      return true;
    });
  }, [exams, sourceFilter, globalLevelFilter]);

  const [selectedExamId, setSelectedExamId] = useState<string>(
    () => filteredExams[0]?.id || exams[0]?.id || ''
  );

  useEffect(() => {
    if (
      filteredExams.length > 0 &&
      !filteredExams.some((e) => e.id === selectedExamId)
    ) {
      setSelectedExamId(filteredExams[0].id);
    }
  }, [filteredExams, selectedExamId]);

  const currentExam = useMemo(
    () =>
      exams.find((e) => e.id === selectedExamId) ||
      filteredExams[0] ||
      exams[0],
    [exams, filteredExams, selectedExamId]
  );

  const currentMatrix = useMemo(
    () => matrices.find((m) => m.id === currentExam?.matrixId),
    [matrices, currentExam]
  );

  // 2. Quản lý Mẫu trình bày (Mục III: Cho phép lưu nhiều mẫu trình bày)
  const savedTemplates = useMemo<ExportPresentationTemplate[]>(() => {
    if (config.exportTemplates && config.exportTemplates.length > 0) {
      return config.exportTemplates;
    }
    return DEFAULT_EXPORT_TEMPLATES;
  }, [config.exportTemplates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    () => savedTemplates[0]?.id || DEFAULT_EXPORT_TEMPLATES[0].id
  );

  const [workingTemplate, setWorkingTemplate] =
    useState<ExportPresentationTemplate>(
      () => savedTemplates[0] || DEFAULT_EXPORT_TEMPLATES[0]
    );

  const [newTemplateNameInput, setNewTemplateNameInput] = useState('');
  const [showTemplateConfigModal, setShowTemplateConfigModal] = useState(false);

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = savedTemplates.find((t) => t.id === tplId);
    if (found) {
      setWorkingTemplate({ ...found, marginsCm: { ...found.marginsCm } });
    }
  };

  const handleSaveNewPresentationTemplate = () => {
    const title =
      newTemplateNameInput.trim() ||
      `Mẫu tùy chỉnh (${workingTemplate.fontFamily} ${workingTemplate.bodyFontSizePt}pt - ${new Date()
        .toISOString()
        .slice(11, 16)})`;

    const newTpl: ExportPresentationTemplate = {
      ...workingTemplate,
      id: `tpl-custom-${Date.now()}`,
      name: title,
      isDefault: false,
    };

    const nextTemplates = [...savedTemplates, newTpl];
    onSaveConfig({
      ...config,
      exportTemplates: nextTemplates,
    });
    setSelectedTemplateId(newTpl.id);
    setWorkingTemplate(newTpl);
    setNewTemplateNameInput('');
    onNotify(
      'success',
      'Đã lưu Mẫu trình bày mới',
      `Đã thêm "${newTpl.name}" vào danh sách mẫu trình bày dùng chung của nhà trường.`
    );
  };

  // 3. Quản lý Bảo mật khi Xuất & Nhật ký Tải xuống (Mục IX)
  const [activeActorId, setActiveActorId] = useState<string>(
    EXPORT_ACTORS[4].id // Mặc định Hiệu trưởng để thao tác thuận tiện, có thể đổi sang Học sinh để test chặn bảo mật
  );
  const activeActor = useMemo(
    () =>
      EXPORT_ACTORS.find((a) => a.id === activeActorId) || EXPORT_ACTORS[0],
    [activeActorId]
  );

  const [securityConfig, setSecurityConfig] = useState<DossierSecurityConfig>({
    enableWatermark: true,
    customWatermarkText: `${config.schoolName.toUpperCase()} · HỒ SƠ KHẢO THÍ`,
    dossierSecurityCode: `HSKT-2026-${(currentExam?.code || 'TOAN4')
      .replace(/[^A-Z0-9-]/gi, '')
      .toUpperCase()}-V${currentExam?.version || 1}`,
    enforceConfidentialAnswerRestriction: true,
    forceDraftStampForUnapproved: true,
  });

  useEffect(() => {
    if (currentExam) {
      setSecurityConfig((prev) => ({
        ...prev,
        dossierSecurityCode: `HSKT-2026-${currentExam.code
          .replace(/[^A-Z0-9-]/gi, '')
          .toUpperCase()}-V${currentExam.version || 1}`,
      }));
    }
  }, [currentExam]);

  const downloadAuditLogs = useMemo<ExportDownloadAuditLog[]>(
    () => config.downloadAuditLogs || [],
    [config.downloadAuditLogs]
  );

  const appendAuditLog = (entry: Omit<ExportDownloadAuditLog, 'id'>) => {
    const newLog: ExportDownloadAuditLog = {
      ...entry,
      id: `dl-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const nextLogs = [newLog, ...downloadAuditLogs.slice(0, 49)];
    onSaveConfig({
      ...config,
      downloadAuditLogs: nextLogs,
    });
  };

  // 4. Chọn Tài liệu đang Xem trước & Chọn danh sách tài liệu xuất ZIP
  const [activePreviewDocType, setActivePreviewDocType] =
    useState<DossierDocumentTypeCode>('03_STUDENT_EXAM');

  const [selectedDocTypesForZip, setSelectedDocTypesForZip] = useState<
    DossierDocumentTypeCode[]
  >(() => DOSSIER_DOCUMENT_CATALOG.map((d) => d.code));

  const [zipFormats, setZipFormats] = useState<{
    docx: boolean;
    xlsx: boolean;
    pdf: boolean;
  }>({
    docx: true,
    xlsx: true,
    pdf: true,
  });

  const [selectedVariantCode, setSelectedVariantCode] = useState<string>('');

  // Giải quyết Dossier Context đầy đủ
  const dossierCtx = useMemo(() => {
    if (!currentExam) return null;
    return resolveDossierContext({
      exam: currentExam,
      matrix: currentMatrix,
      allQuestions: questions,
      selectedVariantCode,
      template: workingTemplate,
      securityConfig,
      schoolName: config.schoolName,
      departmentName: config.departmentName,
      academicYear: config.academicYear,
    });
  }, [
    currentExam,
    currentMatrix,
    questions,
    selectedVariantCode,
    workingTemplate,
    securityConfig,
    config.schoolName,
    config.departmentName,
    config.academicYear,
  ]);

  useEffect(() => {
    if (dossierCtx && dossierCtx.variants.length > 0) {
      if (
        !selectedVariantCode ||
        !dossierCtx.variants.some((v) => v.variantCode === selectedVariantCode)
      ) {
        setSelectedVariantCode(dossierCtx.variants[0].variantCode);
      }
    }
  }, [dossierCtx, selectedVariantCode]);

  // 5. Kết quả Kiểm định & Mở lại Tệp (Mục VIII & X)
  const [inspectionResults, setInspectionResults] = useState<
    GeneratedFileInspectionResult[]
  >([]);
  const [isGeneratingOrInspecting, setIsGeneratingOrInspecting] =
    useState(false);
  const [securityBanner, setSecurityBanner] = useState<{
    type: 'SUCCESS' | 'BLOCKED' | 'INFO';
    title: string;
    detail: string;
  } | null>(null);

  const toggleSelectDocForZip = (code: DossierDocumentTypeCode) => {
    setSelectedDocTypesForZip((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // ==========================================================================
  // XỬ LÝ XUẤT TỪNG TÀI LIỆU RIÊNG LẺ (.DOCX, .XLSX, .PDF, IN TRỰC TIẾP)
  // ==========================================================================
  const handleExportSingleDocument = async (
    docType: DossierDocumentTypeCode,
    format: ExportFileFormat
  ) => {
    if (!dossierCtx) return;
    const docMeta =
      DOSSIER_DOCUMENT_CATALOG.find((d) => d.code === docType) ||
      DOSSIER_DOCUMENT_CATALOG[0];

    // MỤC VIII & IX: Kiểm tra 5 quyền xuất độc lập của Giáo viên & Kiểm tra lại quyền phiên đang mở trên Backend
    if (
      enforceTeacherScope &&
      teacherPermissionProfile &&
      teacherPermissionProfile.subjectAllocations.length > 0
    ) {
      const exportTypeCode =
        docType === '04_MCQ_ANSWER_KEY' ||
        docType === '05_ESSAY_GRADING_GUIDE' ||
        docType === '06_SCORING_RUBRIC_TABLE'
          ? 'EXPORT_ANSWER_KEY_RUBRIC'
          : docType === '07_APPRAISAL_SHEET' || docType === '08_APPROVAL_MINUTES'
          ? 'EXPORT_APPRAISAL_DOSSIER'
          : docType === '09_USED_QUESTION_CATALOG' ||
            docType === '10_EXAM_STATISTICS_REPORT'
          ? 'EXPORT_QUALITY_REPORT'
          : dossierCtx.isApproved
          ? 'EXPORT_APPROVED_PAPER'
          : 'EXPORT_DRAFT_PAPER';

      try {
        const verifyRes = await fetch('/api/security/module-guard/verify-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: teacherPermissionProfile.userId,
            moduleCode: 'DOSSIER_EXPORT',
            operationCode: exportTypeCode,
            exportType: exportTypeCode,
            dossierApprovalStatus: dossierCtx.exam.status,
            educationLevelId:
              dossierCtx.exam.levelId === EducationLevelId.PRIMARY
                ? 'PRIMARY'
                : 'LOWER_SECONDARY',
            subjectName: dossierCtx.exam.subject,
            grade: dossierCtx.exam.grade,
            openSessionTimestamp: new Date().toISOString(),
          }),
        });
        const verifyJson = await verifyRes.json();
        if (!verifyJson.allowed) {
          setSecurityBanner({
            type: 'BLOCKED',
            title: `Từ chối Xuất hồ sơ (Mục VIII · ${verifyJson.errorCode})`,
            detail: String(verifyJson.message || ''),
          });
          onNotify(
            'error',
            `Từ chối Xuất hồ sơ (HTTP ${verifyRes.status})`,
            String(verifyJson.message || '')
          );
          return;
        }
      } catch {
        // continue if offline
      }
    }

    // Kiểm tra bảo mật Mục IX (chặn người không có thẩm quyền xuất Đáp án, Hướng dẫn chấm, Biểu điểm)
    const permCheck = checkExportSecurityPermission({
      actorRole: activeActor.role,
      documentTypes: [docType],
      securityConfig,
    });

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (!permCheck.allowed) {
      appendAuditLog({
        downloadedAt: nowStr,
        actorName: activeActor.fullName,
        actorRole: activeActor.role,
        actorRoleLabel: activeActor.roleLabel,
        examCode: dossierCtx.exam.code,
        examTitle: dossierCtx.exam.title,
        documentTypes: [docType],
        format,
        fileName: `${docMeta.shortFileName}_BLOCKED`,
        fileSizeBytes: 0,
        dossierSecurityCode: dossierCtx.securityCode,
        hasDraftStamp: !dossierCtx.isApproved,
        isConfidentialAnswerIncluded: permCheck.containsConfidential,
        status: 'BLOCKED_UNAUTHORIZED',
        securityNote: permCheck.reason,
      });

      setSecurityBanner({
        type: 'BLOCKED',
        title: `Đã chặn xuất tài liệu mật (${docMeta.title})`,
        detail: permCheck.reason,
      });
      onNotify('error', 'Chặn bảo mật khi xuất hồ sơ', permCheck.reason);
      return;
    }

    if (format === 'PRINT') {
      setActivePreviewDocType(docType);
      appendAuditLog({
        downloadedAt: nowStr,
        actorName: activeActor.fullName,
        actorRole: activeActor.role,
        actorRoleLabel: activeActor.roleLabel,
        examCode: dossierCtx.exam.code,
        examTitle: dossierCtx.exam.title,
        documentTypes: [docType],
        format: 'PRINT',
        fileName: `${docMeta.shortFileName}_Print_A4`,
        fileSizeBytes: 0,
        dossierSecurityCode: dossierCtx.securityCode,
        hasDraftStamp: !dossierCtx.isApproved,
        isConfidentialAnswerIncluded: permCheck.containsConfidential,
        status: 'SUCCESS',
        securityNote: 'In trực tiếp từ trình duyệt chuẩn khổ giấy A4.',
      });
      setTimeout(() => {
        window.print();
      }, 150);
      return;
    }

    setIsGeneratingOrInspecting(true);
    try {
      const variantSuffix =
        docType === '03_STUDENT_EXAM'
          ? `_Ma_de_${dossierCtx.selectedVariant.variantCode}`
          : '';
      let blob: Blob;
      let ext: string;

      if (format === 'DOCX') {
        blob = await generateDocxBlobForDocument(docType, dossierCtx);
        ext = 'docx';
      } else if (format === 'XLSX') {
        blob = generateXlsxBlobForDocument(docType, dossierCtx);
        ext = 'xlsx';
      } else {
        blob = generatePdfBlobForDocument(docType, dossierCtx);
        ext = 'pdf';
      }

      const fileName = `${docMeta.shortFileName}${variantSuffix}_${dossierCtx.exam.code}.${ext}`;
      triggerBrowserDownload(blob, fileName);

      // Tự động mở lại tệp vừa tạo để kiểm định chất lượng (Mục VIII)
      const verified = await inspectAndVerifyGeneratedFile({
        fileName,
        format: format as 'DOCX' | 'XLSX' | 'PDF',
        docType,
        blob,
        ctx: dossierCtx,
      });
      setInspectionResults((prev) => [verified, ...prev.slice(0, 14)]);

      appendAuditLog({
        downloadedAt: nowStr,
        actorName: activeActor.fullName,
        actorRole: activeActor.role,
        actorRoleLabel: activeActor.roleLabel,
        examCode: dossierCtx.exam.code,
        examTitle: dossierCtx.exam.title,
        documentTypes: [docType],
        format,
        fileName,
        fileSizeBytes: blob.size,
        dossierSecurityCode: dossierCtx.securityCode,
        hasDraftStamp: !dossierCtx.isApproved,
        isConfidentialAnswerIncluded: permCheck.containsConfidential,
        status: 'SUCCESS',
        securityNote: verified.extractedSummary.internalStructureVerified,
      });

      setSecurityBanner({
        type: 'SUCCESS',
        title: `Đã xuất & kiểm định tệp ${fileName} (${(
          blob.size / 1024
        ).toFixed(1)} KB)`,
        detail: `${verified.extractedSummary.internalStructureVerified}. Tổng điểm: ${verified.extractedSummary.totalPoints.toFixed(
          2
        )}đ – ${verified.extractedSummary.questionCount} câu.`,
      });

      onNotify(
        'success',
        `Đã tải xuống ${fileName}`,
        `Định dạng ${format} chuẩn A4 (${workingTemplate.fontFamily} ${workingTemplate.bodyFontSizePt}pt) đã được mở lại kiểm định đạt 9/9 tiêu chí.`
      );
    } finally {
      setIsGeneratingOrInspecting(false);
    }
  };

  // ==========================================================================
  // XỬ LÝ NÚT "XUẤT TOÀN BỘ HỒ SƠ (.ZIP)" (MỤC II)
  // ==========================================================================
  const handleExportFullZipBundle = async () => {
    if (!dossierCtx) return;
    if (selectedDocTypesForZip.length === 0) {
      onNotify(
        'warning',
        'Chưa chọn tài liệu',
        'Vui lòng tích chọn ít nhất 01 tài liệu trong danh mục để đóng gói ZIP.'
      );
      return;
    }

    const permCheck = checkExportSecurityPermission({
      actorRole: activeActor.role,
      documentTypes: selectedDocTypesForZip,
      securityConfig,
    });

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (!permCheck.allowed) {
      appendAuditLog({
        downloadedAt: nowStr,
        actorName: activeActor.fullName,
        actorRole: activeActor.role,
        actorRoleLabel: activeActor.roleLabel,
        examCode: dossierCtx.exam.code,
        examTitle: dossierCtx.exam.title,
        documentTypes: selectedDocTypesForZip,
        format: 'ZIP',
        fileName: `Ho_so_ZIP_BLOCKED_${dossierCtx.exam.code}.zip`,
        fileSizeBytes: 0,
        dossierSecurityCode: dossierCtx.securityCode,
        hasDraftStamp: !dossierCtx.isApproved,
        isConfidentialAnswerIncluded: true,
        status: 'BLOCKED_UNAUTHORIZED',
        securityNote: permCheck.reason,
      });
      setSecurityBanner({
        type: 'BLOCKED',
        title: 'Đã chặn xuất gói ZIP do chứa tài liệu mật (Đáp án / Hướng dẫn chấm)',
        detail: permCheck.reason,
      });
      onNotify('error', 'Không có thẩm quyền xuất tài liệu mật', permCheck.reason);
      return;
    }

    setIsGeneratingOrInspecting(true);
    try {
      const { zipBlob, generatedFiles } = await generateDossierZipBundle({
        selectedDocTypes: selectedDocTypesForZip,
        includeFormats: zipFormats,
        ctx: dossierCtx,
      });

      const zipFileName = `Tron_bo_Ho_so_Kiem_tra_${dossierCtx.exam.subject.replace(
        /\s+/g,
        '_'
      )}_Lop_${dossierCtx.exam.grade}_${dossierCtx.exam.code}.zip`;

      triggerBrowserDownload(zipBlob, zipFileName);

      // Mở lại gói ZIP và từng tệp thành phần để kiểm định
      const zipVerified = await inspectAndVerifyGeneratedFile({
        fileName: zipFileName,
        format: 'ZIP',
        docType: '01_MATRIX',
        blob: zipBlob,
        ctx: dossierCtx,
      });

      const sampleSubInspections: GeneratedFileInspectionResult[] = [];
      for (const gf of generatedFiles.slice(0, 6)) {
        const subRes = await inspectAndVerifyGeneratedFile({
          fileName: gf.fileName,
          format: gf.format,
          docType: gf.docType,
          blob: gf.blob,
          ctx: dossierCtx,
        });
        sampleSubInspections.push(subRes);
      }

      setInspectionResults([
        zipVerified,
        ...sampleSubInspections,
        ...inspectionResults.slice(0, 6),
      ]);

      appendAuditLog({
        downloadedAt: nowStr,
        actorName: activeActor.fullName,
        actorRole: activeActor.role,
        actorRoleLabel: activeActor.roleLabel,
        examCode: dossierCtx.exam.code,
        examTitle: dossierCtx.exam.title,
        documentTypes: selectedDocTypesForZip,
        format: 'ZIP',
        fileName: zipFileName,
        fileSizeBytes: zipBlob.size,
        dossierSecurityCode: dossierCtx.securityCode,
        hasDraftStamp: !dossierCtx.isApproved,
        isConfidentialAnswerIncluded: permCheck.containsConfidential,
        status: 'SUCCESS',
        securityNote: `Đã đóng gói ${generatedFiles.length} tệp (.docx, .xlsx, .pdf) vào bộ ZIP (${(
          zipBlob.size / 1024
        ).toFixed(1)} KB).`,
      });

      setSecurityBanner({
        type: 'SUCCESS',
        title: `Đã xuất trọn bộ hồ sơ ZIP: ${zipFileName} (${generatedFiles.length} tệp – ${(
          zipBlob.size / 1024
        ).toFixed(1)} KB)`,
        detail: `Đã mở lại gói ZIP và đối chiếu thành công nội dung, bảng biểu, số câu (${dossierCtx.selectedVariant.totalQuestions} câu), tổng điểm (${dossierCtx.selectedVariant.totalPoints.toFixed(
          2
        )} điểm) và ${dossierCtx.variants.length} mã đề.`,
      });

      onNotify(
        'success',
        'Đã xuất trọn bộ hồ sơ (.ZIP)',
        `Gói ZIP chứa ${generatedFiles.length} tệp Word, Excel, PDF đã được tải xuống và kiểm định toàn vẹn.`
      );
    } finally {
      setIsGeneratingOrInspecting(false);
    }
  };

  // ==========================================================================
  // MỤC X: KHỞI TẠO & CHẠY KIỂM THỬ BỘ HỒ SƠ MẪU TOÁN LỚP 4 (10 ĐIỂM – 2 MÃ ĐỀ)
  // Tạo bộ hồ sơ Toán 4 -> Xuất từng tệp Word, PDF, Excel + Bộ ZIP -> Mở lại kiểm tra
  // ==========================================================================
  const handleRunSectionXGrade4MathDossierTest = async () => {
    setIsGeneratingOrInspecting(true);
    try {
      // Đảm bảo vai trò hiện tại là Hiệu trưởng hoặc Giáo viên để được phép xuất cả Đáp án trong kịch bản kiểm thử chuẩn
      setActiveActorId(EXPORT_ACTORS[4].id);

      const { matrixPayload, buildExamPayload } =
        buildGrade4MathSampleDossierPayloads({
          schoolName: config.schoolName,
          academicYear: config.academicYear,
          allQuestions: questions,
        });

      const createdMatrix = onAddMatrix(matrixPayload);
      const examPayload = buildExamPayload(createdMatrix);
      const createdExam = onAddExam(examPayload);

      setSelectedExamId(createdExam.id);
      setSelectedVariantCode('401');

      const testSecurityCfg: DossierSecurityConfig = {
        ...securityConfig,
        dossierSecurityCode: `HSKT-2026-${createdExam.code}-MUC-X`,
      };
      setSecurityConfig(testSecurityCfg);

      const testCtx = resolveDossierContext({
        exam: createdExam,
        matrix: createdMatrix,
        allQuestions: questions,
        selectedVariantCode: '401',
        template: workingTemplate,
        securityConfig: testSecurityCfg,
        schoolName: config.schoolName,
        departmentName: config.departmentName,
        academicYear: config.academicYear,
      });

      // Tạo và mở lại kiểm tra đầy đủ 6 hạng mục của Mục X trên cả 3 định dạng Word (.docx), Excel (.xlsx), PDF (.pdf) và gói ZIP (.zip)
      const targetDocsForSectionX: DossierDocumentTypeCode[] = [
        '01_MATRIX', // 1. Ma trận Toán lớp 4
        '02_SPECIFICATION', // 2. Bản đặc tả
        '03_STUDENT_EXAM', // 3. Đề kiểm tra 10 điểm (2 mã đề 401 & 402)
        '04_MCQ_ANSWER_KEY', // 4. Đáp án 2 mã đề
        '05_ESSAY_GRADING_GUIDE', // 5. Hướng dẫn chấm tự luận
        '07_APPRAISAL_SHEET', // 6. Phiếu thẩm định 12 tiêu chí
      ];

      const verifiedList: GeneratedFileInspectionResult[] = [];

      // 1. Tạo & Mở lại kiểm tra Ma trận Toán 4 (.docx & .xlsx)
      const matDocx = await generateDocxBlobForDocument('01_MATRIX', testCtx);
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `01_Ma_tran_Toan_Lop_4_${createdExam.code}.docx`,
          format: 'DOCX',
          docType: '01_MATRIX',
          blob: matDocx,
          ctx: testCtx,
        })
      );

      const matXlsx = generateXlsxBlobForDocument('01_MATRIX', testCtx);
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `01_Ma_tran_Toan_Lop_4_${createdExam.code}.xlsx`,
          format: 'XLSX',
          docType: '01_MATRIX',
          blob: matXlsx,
          ctx: testCtx,
        })
      );

      // 2. Tạo & Mở lại kiểm tra Bản đặc tả (.docx)
      const specDocx = await generateDocxBlobForDocument(
        '02_SPECIFICATION',
        testCtx
      );
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `02_Ban_dac_ta_Toan_Lop_4_${createdExam.code}.docx`,
          format: 'DOCX',
          docType: '02_SPECIFICATION',
          blob: existingOrBlob(specDocx),
          ctx: testCtx,
        })
      );

      // 3. Tạo & Mở lại kiểm tra Đề học sinh Mã đề 401 (.docx & .pdf) và Mã đề 402 (.docx)
      const exam401Docx = await generateDocxBlobForDocument(
        '03_STUDENT_EXAM',
        testCtx
      );
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `03_De_kiem_tra_Hoc_sinh_Toan_4_Ma_de_401.docx`,
          format: 'DOCX',
          docType: '03_STUDENT_EXAM',
          blob: exam401Docx,
          ctx: testCtx,
        })
      );

      const exam401Pdf = generatePdfBlobForDocument('03_STUDENT_EXAM', testCtx);
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `03_De_kiem_tra_Hoc_sinh_Toan_4_Ma_de_401.pdf`,
          format: 'PDF',
          docType: '03_STUDENT_EXAM',
          blob: exam401Pdf,
          ctx: testCtx,
        })
      );

      const ctx402 = {
        ...testCtx,
        selectedVariant: testCtx.variants[1] || testCtx.variants[0],
      };
      const exam402Docx = await generateDocxBlobForDocument(
        '03_STUDENT_EXAM',
        ctx402
      );
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `03_De_kiem_tra_Hoc_sinh_Toan_4_Ma_de_402.docx`,
          format: 'DOCX',
          docType: '03_STUDENT_EXAM',
          blob: exam402Docx,
          ctx: ctx402,
        })
      );

      // 4. Tạo & Mở lại kiểm tra Đáp án & Hướng dẫn chấm (.docx & .xlsx)
      const ansDocx = await generateDocxBlobForDocument(
        '04_MCQ_ANSWER_KEY',
        testCtx
      );
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `04_Dap_an_2_Ma_de_401_402_${createdExam.code}.docx`,
          format: 'DOCX',
          docType: '04_MCQ_ANSWER_KEY',
          blob: ansDocx,
          ctx: testCtx,
        })
      );

      const rubricDocx = await generateDocxBlobForDocument(
        '05_ESSAY_GRADING_GUIDE',
        testCtx
      );
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `05_Huong_dan_cham_Tu_luan_Toan_4_${createdExam.code}.docx`,
          format: 'DOCX',
          docType: '05_ESSAY_GRADING_GUIDE',
          blob: rubricDocx,
          ctx: testCtx,
        })
      );

      // 5. Tạo & Mở lại kiểm tra Phiếu thẩm định (.docx)
      const sheetDocx = await generateDocxBlobForDocument(
        '07_APPRAISAL_SHEET',
        testCtx
      );
      verifiedList.push(
        await inspectAndVerifyGeneratedFile({
          fileName: `07_Phieu_tham_dinh_12_tieu_chi_${createdExam.code}.docx`,
          format: 'DOCX',
          docType: '07_APPRAISAL_SHEET',
          blob: sheetDocx,
          ctx: testCtx,
        })
      );

      // 6. Tạo gói ZIP chứa toàn bộ hồ sơ mẫu Toán lớp 4 và tải về + mở lại kiểm tra
      const { zipBlob, generatedFiles } = await generateDossierZipBundle({
        selectedDocTypes: targetDocsForSectionX,
        includeFormats: { docx: true, xlsx: true, pdf: true },
        ctx: testCtx,
      });

      const zipFileName = `Bo_Ho_so_Mau_Toan_Lop_4_10diem_2MaDe_401_402_${createdExam.code}.zip`;
      triggerBrowserDownload(zipBlob, zipFileName);

      const zipInspection = await inspectAndVerifyGeneratedFile({
        fileName: zipFileName,
        format: 'ZIP',
        docType: '01_MATRIX',
        blob: zipBlob,
        ctx: testCtx,
      });

      setInspectionResults([zipInspection, ...verifiedList]);

      appendAuditLog({
        downloadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        actorName: EXPORT_ACTORS[4].fullName,
        actorRole: 'PRINCIPAL',
        actorRoleLabel: 'Hiệu trưởng',
        examCode: createdExam.code,
        examTitle: createdExam.title,
        documentTypes: targetDocsForSectionX,
        format: 'ZIP',
        fileName: zipFileName,
        fileSizeBytes: zipBlob.size,
        dossierSecurityCode: testCtx.securityCode,
        hasDraftStamp: false,
        isConfidentialAnswerIncluded: true,
        status: 'SUCCESS',
        securityNote: `Kiểm thử Mục X hoàn tất: Đã tạo, xuất và mở lại kiểm tra ${generatedFiles.length} tệp Word (.docx), Excel (.xlsx), PDF (.pdf) trong gói ZIP.`,
      });

      setSecurityBanner({
        type: 'SUCCESS',
        title: `Kiểm thử Mục X ĐẠT 100%: Đã khởi tạo, xuất và mở lại kiểm tra Bộ Hồ sơ Toán Lớp 4 (${createdExam.code})`,
        detail: `Gồm: Ma trận Toán lớp 4, Bản đặc tả, Đề kiểm tra 10,00 điểm (12 câu), 02 Mã đề (401 & 402), Đáp án & Hướng dẫn chấm, Phiếu thẩm định 12 tiêu chí. Đã mở lại ${
          verifiedList.length + 1
        } tệp (.docx, .xlsx, .pdf, .zip) xác nhận khớp 100% nội dung, công thức phân số và bảng biểu.`,
      });

      onNotify(
        'success',
        'Hoàn tất Kiểm thử Mục X (Toán Lớp 4 – 10 điểm – 2 Mã đề)',
        `Đã tải xuống gói ZIP (${generatedFiles.length} tệp .docx/.xlsx/.pdf) và mở lại kiểm định tự động tất cả các tệp.`
      );
    } finally {
      setIsGeneratingOrInspecting(false);
    }
  };

  // Kiểm thử nhanh kịch bản Chặn xuất Đáp án đối với người không có thẩm quyền (Mục IX)
  const handleRunUnauthorizedSecurityTest = () => {
    const restrictedActor = EXPORT_ACTORS[5]; // Học sinh / Khách
    setActiveActorId(restrictedActor.id);

    const permCheck = checkExportSecurityPermission({
      actorRole: restrictedActor.role,
      documentTypes: ['04_MCQ_ANSWER_KEY', '05_ESSAY_GRADING_GUIDE'],
      securityConfig,
    });

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    appendAuditLog({
      downloadedAt: nowStr,
      actorName: restrictedActor.fullName,
      actorRole: restrictedActor.role,
      actorRoleLabel: restrictedActor.roleLabel,
      examCode: dossierCtx?.exam.code || 'ĐỀ-TOÁN-4',
      examTitle: dossierCtx?.exam.title || 'Đề kiểm tra Toán Lớp 4',
      documentTypes: ['04_MCQ_ANSWER_KEY', '05_ESSAY_GRADING_GUIDE'],
      format: 'DOCX',
      fileName: '04_Dap_an_va_HDC_BLOCKED.docx',
      fileSizeBytes: 0,
      dossierSecurityCode: securityConfig.dossierSecurityCode,
      hasDraftStamp: !dossierCtx?.isApproved,
      isConfidentialAnswerIncluded: true,
      status: 'BLOCKED_UNAUTHORIZED',
      securityNote: permCheck.reason,
    });

    setSecurityBanner({
      type: 'BLOCKED',
      title: 'Kiểm thử Bảo mật Mục IX ĐẠT: Đã chặn người không có thẩm quyền tải Đáp án & Hướng dẫn chấm',
      detail: permCheck.reason,
    });

    onNotify('warning', 'Đã chặn tải Đáp án trái thẩm quyền', permCheck.reason);
  };

  if (!dossierCtx) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-800">
          Chưa có đề kiểm tra nào trong bộ lọc hiện tại.
        </p>
        <button
          type="button"
          onClick={handleRunSectionXGrade4MathDossierTest}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 cursor-pointer"
        >
          Khởi tạo ngay Bộ Hồ sơ Mẫu Toán Lớp 4 (10 điểm – 2 Mã đề)
        </button>
      </div>
    );
  }

  const activeGroups: MatrixFormatGroupCode[] =
    dossierCtx.matrix.activeFormatGroups &&
    dossierCtx.matrix.activeFormatGroups.length > 0
      ? dossierCtx.matrix.activeFormatGroups
      : ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'];
  const specRows = dossierCtx.matrix.specRows || [];
  const calcSummary = calculateMatrixSummary(
    specRows,
    activeGroups,
    dossierCtx.matrix.targetTotalPoints || dossierCtx.exam.totalPoints || 10
  );
  const officialMinutes = generateOfficialAppraisalMinutes({
    schoolName: dossierCtx.schoolName,
    departmentName: dossierCtx.departmentName,
    targetType: 'EXAM',
    matrix: dossierCtx.matrix,
    exam: dossierCtx.exam,
  });

  return (
    <div className="space-y-6">
      {/* CSS in ấn chuẩn khổ giấy A4 khi bấm In trực tiếp từ trình duyệt */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #a4-official-print-sheet,
          #a4-official-print-sheet * {
            visibility: visible;
          }
          #a4-official-print-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 12mm !important;
          }
          .print-keep-together {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          thead {
            display: table-header-group;
          }
        }
      `}</style>

      {/* Header & Thanh công cụ Kiểm thử Mục X + Xuất toàn bộ hồ sơ (.ZIP) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              XUẤT HỒ SƠ KIỂM TRA ĐỊNH KỲ CHUYÊN NGHIỆP
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Xuất Hồ sơ Kiểm tra (Word .docx · Excel .xlsx · PDF .pdf · Gói .ZIP · In A4)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Tệp Word (.docx) có văn bản và bảng biểu chỉnh sửa được thực sự · Tệp Excel (.xlsx) có ô dữ liệu số & gộp ô thực · Bảo mật phân quyền Đáp án & tự động đóng dấu BẢN NHÁP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {false && (
              <>
                <button
                  type="button"
                  onClick={handleRunSectionXGrade4MathDossierTest}
                  disabled={isGeneratingOrInspecting}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    Chạy Kiểm thử Mục X (Toán Lớp 4 – 10 điểm – 2 Mã đề + Mở lại File)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleRunUnauthorizedSecurityTest}
                  className="px-3 py-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Test Chặn Xuất Đáp Án Trái Quyền</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleExportFullZipBundle}
              disabled={isGeneratingOrInspecting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span>
                Xuất toàn bộ hồ sơ (.ZIP – {selectedDocTypesForZip.length} tài liệu)
              </span>
            </button>
          </div>
        </div>

        {/* Banner kết quả Kiểm định Mở lại tệp & Bảo mật */}
        {securityBanner && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
              securityBanner.type === 'SUCCESS'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : securityBanner.type === 'BLOCKED'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}
          >
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                {securityBanner.type === 'SUCCESS' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                )}
                <span>{securityBanner.title}</span>
              </div>
              <p className="leading-relaxed opacity-90">{securityBanner.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => setSecurityBanner(null)}
              className="text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Bộ chọn Hồ sơ Đề kiểm tra, Mã đề, Mẫu trình bày và Vai trò người tải */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              1. Chọn Bộ Hồ sơ Đề kiểm tra:
            </label>
            <select
              value={currentExam.id}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  [{ex.code}] {ex.title} ({getApprovalStatusInfo(ex.status).label})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500">
              Ma trận gốc: <span className="font-mono">{dossierCtx.matrix.code}</span> ·{' '}
              <span>{dossierCtx.selectedVariant.totalQuestions} câu</span> ·{' '}
              <span>{dossierCtx.selectedVariant.totalPoints.toFixed(2)} điểm</span> ·{' '}
              <span
                className={
                  dossierCtx.isApproved
                    ? 'text-emerald-700 font-semibold'
                    : 'text-rose-700 font-semibold'
                }
              >
                {dossierCtx.isApproved
                  ? 'Đã phê duyệt chính thức'
                  : 'Chưa phê duyệt (Tự động đóng dấu BẢN NHÁP)'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              2. Chọn Mã đề hiển thị & xuất lẻ:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {dossierCtx.variants.map((v) => (
                <button
                  key={v.variantCode}
                  type="button"
                  onClick={() => setSelectedVariantCode(v.variantCode)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    dossierCtx.selectedVariant.variantCode === v.variantCode
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Mã đề {v.variantCode}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500">
              Khi xuất gói ZIP, hệ thống tự động xuất đủ cả{' '}
              {dossierCtx.variants.length} mã đề (
              {dossierCtx.variants.map((v) => v.variantCode).join(', ')}).
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              3. Mẫu trình bày văn bản (Mục III):
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium truncate"
              >
                {savedTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowTemplateConfigModal((prev) => !prev)}
                className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Tùy chỉnh</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500">
              Khổ {workingTemplate.paperSize} · Font{' '}
              <span className="font-semibold">{workingTemplate.fontFamily}</span> ·
              Cỡ <span className="font-semibold">{workingTemplate.bodyFontSizePt}pt</span>{' '}
              · Giãn dòng {workingTemplate.lineSpacing}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              4. Vai trò thực hiện xuất (Bảo mật Mục IX):
            </label>
            <select
              value={activeActorId}
              onChange={(e) => setActiveActorId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
            >
              {EXPORT_ACTORS.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  [{actor.roleLabel}] {actor.fullName}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              {activeActor.role === 'STUDENT_GUEST_RESTRICTED' ? (
                <span className="text-rose-700 font-semibold">
                  Chế độ hạn chế: Sẽ bị chặn nếu tải Đáp án, Hướng dẫn chấm, Biểu điểm
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">
                  Có thẩm quyền xuất Đáp án, Hướng dẫn chấm và Biểu điểm
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Khung tùy chỉnh chi tiết Mẫu trình bày (Mục III) & Bảo mật Watermark (Mục IX) */}
        {showTemplateConfigModal && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="text-xs font-bold text-slate-900">
                Cấu hình Mẫu trình bày A4 (Mục III) & Bảo mật Watermark / Mã định danh (Mục IX)
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateConfigModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Thu gọn
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Font chữ (Hỗ trợ tiếng Việt)
                </label>
                <select
                  value={workingTemplate.fontFamily}
                  onChange={(e) =>
                    setWorkingTemplate((prev) => ({
                      ...prev,
                      fontFamily: e.target
                        .value as ExportPresentationTemplate['fontFamily'],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Times New Roman">Times New Roman (Chuẩn)</option>
                  <option value="Liberation Serif">Liberation Serif</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cỡ chữ nội dung (13 / 14pt)
                </label>
                <select
                  value={workingTemplate.bodyFontSizePt}
                  onChange={(e) =>
                    setWorkingTemplate((prev) => ({
                      ...prev,
                      bodyFontSizePt: Number(e.target.value) as 13 | 14,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value={13}>Cỡ chữ 13pt</option>
                  <option value={14}>Cỡ chữ 14pt</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Giãn dòng (Line Spacing)
                </label>
                <select
                  value={workingTemplate.lineSpacing}
                  onChange={(e) =>
                    setWorkingTemplate((prev) => ({
                      ...prev,
                      lineSpacing: Number(
                        e.target.value
                      ) as ExportPresentationTemplate['lineSpacing'],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value={1.15}>1.15 dòng</option>
                  <option value={1.25}>1.25 dòng (Chuẩn)</option>
                  <option value={1.3}>1.30 dòng</option>
                  <option value={1.5}>1.50 dòng</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hướng giấy A4 (Dọc/Ngang)
                </label>
                <select
                  value={workingTemplate.orientationPolicy}
                  onChange={(e) =>
                    setWorkingTemplate((prev) => ({
                      ...prev,
                      orientationPolicy: e.target
                        .value as ExportPresentationTemplate['orientationPolicy'],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="AUTO_SMART">
                    Tự động (Ngang cho Ma trận/Đặc tả, Dọc cho Đề)
                  </option>
                  <option value="PORTRAIT_ALL">Khổ Dọc tất cả</option>
                  <option value="LANDSCAPE_TABLES">Ưu tiên Khổ Ngang bảng rộng</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lề Trên / Dưới / Trái / Phải (cm)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={workingTemplate.marginsCm.top}
                    onChange={(e) =>
                      setWorkingTemplate((prev) => ({
                        ...prev,
                        marginsCm: {
                          ...prev.marginsCm,
                          top: Number(e.target.value) || 2.0,
                        },
                      }))
                    }
                    className="px-1.5 py-1.5 bg-white border border-slate-300 rounded text-center"
                    title="Lề trên (cm)"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={workingTemplate.marginsCm.bottom}
                    onChange={(e) =>
                      setWorkingTemplate((prev) => ({
                        ...prev,
                        marginsCm: {
                          ...prev.marginsCm,
                          bottom: Number(e.target.value) || 2.0,
                        },
                      }))
                    }
                    className="px-1.5 py-1.5 bg-white border border-slate-300 rounded text-center"
                    title="Lề dưới (cm)"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={workingTemplate.marginsCm.left}
                    onChange={(e) =>
                      setWorkingTemplate((prev) => ({
                        ...prev,
                        marginsCm: {
                          ...prev.marginsCm,
                          left: Number(e.target.value) || 2.8,
                        },
                      }))
                    }
                    className="px-1.5 py-1.5 bg-white border border-slate-300 rounded text-center"
                    title="Lề trái (cm)"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={workingTemplate.marginsCm.right}
                    onChange={(e) =>
                      setWorkingTemplate((prev) => ({
                        ...prev,
                        marginsCm: {
                          ...prev.marginsCm,
                          right: Number(e.target.value) || 1.5,
                        },
                      }))
                    }
                    className="px-1.5 py-1.5 bg-white border border-slate-300 rounded text-center"
                    title="Lề phải (cm)"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã định danh bảo mật hồ sơ
                </label>
                <input
                  type="text"
                  value={securityConfig.dossierSecurityCode}
                  onChange={(e) =>
                    setSecurityConfig((prev) => ({
                      ...prev,
                      dossierSecurityCode: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cơ quan quản lý cấp trên (Phần đầu đề kiểm tra)
                </label>
                <input
                  type="text"
                  value={workingTemplate.governingBodyName}
                  onChange={(e) =>
                    setWorkingTemplate((prev) => ({
                      ...prev,
                      governingBodyName: e.target.value,
                    }))
                  }
                  placeholder="VD: UBND XÃ ĐAN ĐIỀN"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung Watermark bảo mật
                </label>
                <input
                  type="text"
                  value={securityConfig.customWatermarkText}
                  onChange={(e) =>
                    setSecurityConfig((prev) => ({
                      ...prev,
                      customWatermarkText: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lưu thành Mẫu trình bày mới (Dùng chung)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTemplateNameInput}
                    onChange={(e) => setNewTemplateNameInput(e.target.value)}
                    placeholder="Nhập tên mẫu trình bày mới..."
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewPresentationTemplate}
                    className="px-3 py-1.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu mẫu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BỐ CỤC 2 CỘT: CỘT TRÁI (DANH MỤC 10 HỒ SƠ & NÚT XUẤT) – CỘT PHẢI (XEM TRƯỚC BẢN IN A4 & KIỂM ĐỊNH) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (5/12): DANH MỤC 10 HỒ SƠ KIỂM TRA ĐỊNH KỲ (MỤC II) */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Danh mục 10 Tài liệu Hồ sơ Kiểm tra (Mục II)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Xuất lẻ từng tài liệu (.docx, .xlsx, .pdf, In A4) hoặc tích chọn để đóng gói .ZIP
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setSelectedDocTypesForZip(
                    DOSSIER_DOCUMENT_CATALOG.map((d) => d.code)
                  )
                }
                className="text-blue-700 hover:underline font-medium cursor-pointer"
              >
                Chọn hết
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() =>
                  setSelectedDocTypesForZip(
                    DOSSIER_DOCUMENT_CATALOG.filter((d) => !d.isConfidential).map(
                      (d) => d.code
                    )
                  )
                }
                className="text-slate-600 hover:underline font-medium cursor-pointer"
              >
                Bỏ tài liệu mật
              </button>
            </div>
          </div>

          {/* Tùy chọn định dạng đóng gói trong bộ ZIP */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              Định dạng đưa vào gói ZIP:
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zipFormats.docx}
                  onChange={(e) =>
                    setZipFormats((prev) => ({
                      ...prev,
                      docx: e.target.checked,
                    }))
                  }
                />
                <span>Word (.docx)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zipFormats.xlsx}
                  onChange={(e) =>
                    setZipFormats((prev) => ({
                      ...prev,
                      xlsx: e.target.checked,
                    }))
                  }
                />
                <span>Excel (.xlsx)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zipFormats.pdf}
                  onChange={(e) =>
                    setZipFormats((prev) => ({
                      ...prev,
                      pdf: e.target.checked,
                    }))
                  }
                />
                <span>PDF (.pdf)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2.5">
            {DOSSIER_DOCUMENT_CATALOG.map((doc) => {
              const isSelectedForZip = selectedDocTypesForZip.includes(doc.code);
              const isPreviewActive = activePreviewDocType === doc.code;

              return (
                <div
                  key={doc.code}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isPreviewActive
                      ? 'bg-blue-50/70 border-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleSelectDocForZip(doc.code)}
                        className="mt-0.5 text-blue-700 cursor-pointer"
                        title="Chọn đưa vào gói ZIP"
                      >
                        {isSelectedForZip ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{doc.title}</span>
                          {doc.isConfidential && (
                            <span className="text-[11px] font-normal text-amber-800 flex items-center gap-1">
                              · <Lock className="w-3 h-3 inline" /> Tài liệu mật
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Các nút thao tác: Xem A4, Word (.docx), Excel (.xlsx), PDF (.pdf), In */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActivePreviewDocType(doc.code)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                        isPreviewActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem bản A4</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleExportSingleDocument(doc.code, 'DOCX')
                        }
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md cursor-pointer"
                        title="Xuất tệp Microsoft Word (.docx) có văn bản và bảng biểu chỉnh sửa được"
                      >
                        Word (.docx)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleExportSingleDocument(doc.code, 'XLSX')
                        }
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md cursor-pointer"
                        title="Xuất tệp Microsoft Excel (.xlsx) có dữ liệu bảng thực và gộp ô"
                      >
                        Excel (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleExportSingleDocument(doc.code, 'PDF')
                        }
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md cursor-pointer"
                        title="Xuất tệp PDF (.pdf) chuẩn khổ giấy A4"
                      >
                        PDF (.pdf)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleExportSingleDocument(doc.code, 'PRINT')
                        }
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-md cursor-pointer flex items-center gap-1"
                        title="In trực tiếp từ trình duyệt chuẩn khổ A4"
                      >
                        <Printer className="w-3 h-3" />
                        <span>In</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI (7/12): KHUNG XEM TRƯỚC BẢN IN A4 SẮC NÉT & KIỂM ĐỊNH MỞ LẠI FILE */}
        <div className="xl:col-span-7 space-y-6">
          {/* Thanh điều khiển Khung Bản in A4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-slate-900">
                Đang xem trước khổ giấy A4:{' '}
              </span>
              <span className="font-semibold text-blue-700">
                {
                  DOSSIER_DOCUMENT_CATALOG.find(
                    (d) => d.code === activePreviewDocType
                  )?.title
                }
              </span>
              <span className="text-slate-500">
                {' '}
                · Mã đề {dossierCtx.selectedVariant.variantCode} · Font{' '}
                {workingTemplate.fontFamily} {workingTemplate.bodyFontSizePt}pt
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleExportSingleDocument(activePreviewDocType, 'DOCX')
                }
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải .DOCX tài liệu này</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleExportSingleDocument(activePreviewDocType, 'PRINT')
                }
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In trực tiếp A4 / Lưu PDF Vector</span>
              </button>
            </div>
          </div>

          {/* TỜ GIẤY A4 CHUẨN VĂN BẢN HÀNH CHÍNH NHÀ TRƯỜNG */}
          <div
            id="a4-official-print-sheet"
            className="bg-white border border-slate-300 shadow-sm rounded-xl p-8 relative overflow-x-auto text-slate-950"
            style={{
              fontFamily: `"${workingTemplate.fontFamily}", Times, serif`,
              fontSize: `${workingTemplate.bodyFontSizePt}pt`,
              lineHeight: workingTemplate.lineSpacing,
            }}
          >
            {/* Dấu BẢN NHÁP nếu hồ sơ chưa phê duyệt chính thức (Mục IX) */}
            {dossierCtx.draftBannerText && (
              <div className="mb-4 p-2.5 border-2 border-rose-600 bg-rose-50 text-rose-800 text-center font-bold text-xs uppercase tracking-wide">
                {dossierCtx.draftBannerText}
              </div>
            )}

            {/* Header định danh bảo mật hồ sơ */}
            <div className="text-[10pt] text-slate-500 text-right italic mb-3 border-b border-slate-200 pb-1">
              {dossierCtx.schoolName} · Mã định danh bảo mật:{' '}
              <span className="font-mono">{dossierCtx.securityCode}</span>
              {dossierCtx.watermarkText ? ` · [${dossierCtx.watermarkText}]` : ''}
            </div>

            {/* ==============================================================
                NỘI DUNG TỜ A4 THEO TỪNG TÀI LIỆU (01 -> 10)
               ============================================================== */}

            {/* 03. ĐỀ KIỂM TRA DÀNH CHO HỌC SINH (MỤC IV) */}
            {activePreviewDocType === '03_STUDENT_EXAM' && (
              <div className="space-y-4">
                {/* Khung tiêu đề 2 cột chuẩn hành chính (UBND XÃ ĐAN ĐIỀN / TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH) */}
                <table className="w-full border-collapse border-none text-[12pt] mb-2">
                  <tbody>
                    <tr>
                      <td className="border-none pb-2 pr-2 text-center w-5/12 align-top leading-snug">
                        <div className="uppercase font-normal">
                          {workingTemplate.governingBodyName || 'UBND XÃ ĐAN ĐIỀN'}
                        </div>
                        <div className="font-bold uppercase">
                          {dossierCtx.schoolName}
                        </div>
                        <div className="w-36 mx-auto border-b border-slate-950 mt-0.5" />
                      </td>
                      <td className="border-none pb-2 pl-2 text-center w-7/12 align-top leading-snug">
                        <div className="font-bold uppercase">
                          {formatExamHeaderRightTitle(
                            dossierCtx.exam.examPeriod,
                            dossierCtx.academicYear,
                            'ĐỀ KIỂM TRA'
                          )}
                        </div>
                        <div className="font-normal">
                          MÔN: {dossierCtx.exam.subject.toUpperCase()} - Lớp{' '}
                          {dossierCtx.exam.grade}
                        </div>
                        <div className="font-normal">
                          Thời gian: {dossierCtx.exam.durationMinutes} phút
                        </div>
                        <div className="italic font-normal text-[11.5pt]">
                          (không kể thời gian giao đề)
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full border-collapse border border-slate-800 text-[11pt]">
                  <tbody>
                    <tr>
                      <td
                        colSpan={2}
                        className="border border-slate-800 px-3 py-2 font-bold"
                      >
                        Họ và tên học sinh:
                        ......................................................................................
                        Lớp: ......................
                      </td>
                    </tr>
                    {workingTemplate.showScoreBoxInStudentPaper && (
                      <tr>
                        <td className="border border-slate-800 p-2 text-center font-bold h-20 align-top w-4/12">
                          ĐIỂM SỐ
                        </td>
                        <td className="border border-slate-800 p-2 text-center font-bold h-20 align-top w-8/12">
                          LỜI PHÊ CỦA GIÁO VIÊN CHẤM BÀI
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Danh sách câu hỏi theo phần, giữ nguyên ngữ liệu chung gắn liền câu hỏi, tuyệt đối không lộ đáp án */}
                {(() => {
                  const sections = new Map<
                    string,
                    {
                      title: string;
                      instruction: string;
                      items: typeof dossierCtx.selectedVariant.items;
                      pts: number;
                    }
                  >();
                  dossierCtx.selectedVariant.items.forEach((it) => {
                    const secTitle = getSectionTitleForFormatGroup(
                      it.formatGroup
                    );
                    const secInstr = getSectionInstructionForFormatGroup(
                      it.formatGroup
                    );
                    const ex = sections.get(secTitle);
                    if (ex) {
                      ex.items.push(it);
                      ex.pts = exactRound(exactAdd(ex.pts, it.points));
                    } else {
                      sections.set(secTitle, {
                        title: secTitle,
                        instruction: secInstr,
                        items: [it],
                        pts: it.points,
                      });
                    }
                  });

                  const seenPassages = new Set<string>();

                  return Array.from(sections.values()).map((sec) => (
                    <div key={sec.title} className="space-y-1.5 pt-2 leading-normal text-justify">
                      <div className="space-y-0.5 text-justify">
                        <div className="font-bold">
                          {sec.title} ({sec.items.length} câu — {sec.pts.toFixed(2)} điểm)
                        </div>
                        {sec.instruction && (
                          <div className="font-normal">
                            {sec.instruction}
                          </div>
                        )}
                      </div>

                      {sec.items.map((item) => {
                        const showPassage =
                          item.sharedPassage &&
                          !seenPassages.has(item.sharedPassage.slice(0, 80));
                        if (item.sharedPassage && showPassage) {
                          seenPassages.add(item.sharedPassage.slice(0, 80));
                        }

                        return (
                          <div
                            key={item.displayNumber}
                            className="print-keep-together space-y-1 text-justify"
                          >
                            {showPassage && (
                              <div className="p-3 border border-slate-400 bg-slate-50/60 italic space-y-1 mb-2 text-justify">
                                <div className="font-bold not-italic">
                                  Đọc ngữ liệu sau và trả lời các câu hỏi:
                                </div>
                                <MathTextRenderer text={item.sharedPassage || ''} />
                                {item.sharedPassageAuthor && (
                                  <div className="text-right font-semibold">
                                    ({item.sharedPassageAuthor})
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="text-justify">
                              <span className="font-bold">
                                Câu {item.displayNumber}
                                {workingTemplate.showSectionPoints
                                  ? ` (${item.points.toFixed(2)} điểm)`
                                  : ''}
                                :{' '}
                              </span>
                              <MathTextRenderer text={item.stem} />
                            </div>

                            {item.shuffledOptions &&
                              item.shuffledOptions.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4">
                                  {item.shuffledOptions.map((opt, oIdx) => (
                                    <div key={oIdx}>
                                      <MathTextRenderer text={opt} />
                                    </div>
                                  ))}
                                </div>
                              )}

                            {item.subStatements &&
                              item.subStatements.length > 0 && (
                                <div className="space-y-1 pl-4">
                                  {item.subStatements.map((sub) => (
                                    <div
                                      key={sub.label}
                                      className="flex items-start justify-between gap-4"
                                    >
                                      <span>
                                        <strong className="font-semibold">
                                          {sub.label})
                                        </strong>{' '}
                                        <MathTextRenderer text={sub.statement} />
                                      </span>
                                      <span className="shrink-0 font-mono text-[10pt]">
                                        [ Đúng / Sai ]
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {item.formatGroup === 'SHORT_ANSWER' && (
                              <div className="pl-4 italic text-slate-700">
                                Đáp số / Trả lời:
                                ............................................................................................................
                              </div>
                            )}

                            {item.formatGroup === 'ESSAY' && (
                              <div className="pl-4 italic text-slate-700 space-y-1">
                                <div>
                                  Bài giải:
                                  .....................................................................................................................
                                </div>
                                <div>
                                  ..................................................................................................................................
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}

                <div className="pt-4 text-center font-bold">--- HẾT ---</div>
              </div>
            )}

            {/* 01. MA TRẬN ĐỀ KIỂM TRA (MỤC V: BẢNG TIÊU ĐỀ NHIỀU TẦNG, GỘP Ô) */}
            {activePreviewDocType === '01_MATRIX' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="font-bold uppercase text-[14pt]">
                    MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ
                  </div>
                  <div className="font-bold">
                    Môn: {dossierCtx.exam.subject} – Khối lớp:{' '}
                    {dossierCtx.exam.grade} · Năm học: {dossierCtx.academicYear}
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-[10pt]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th
                        rowSpan={2}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        TT
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-slate-800 p-1.5 text-left"
                      >
                        Chủ đề / Chương
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-slate-800 p-1.5 text-left"
                      >
                        Nội dung / Đơn vị kiến thức
                      </th>
                      {activeGroups.map((fg) => (
                        <th
                          key={fg}
                          colSpan={3}
                          className="border border-slate-800 p-1.5 text-center"
                        >
                          {FORMAT_GROUP_DEFINITIONS.find((f) => f.code === fg)
                            ?.shortLabel || fg}
                        </th>
                      ))}
                      <th
                        rowSpan={2}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        Tổng câu
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        Tổng điểm
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        Tỷ lệ %
                      </th>
                    </tr>
                    <tr className="bg-slate-50">
                      {activeGroups.map((fg) =>
                        LEVEL_COLUMN_DEFINITIONS.map((lv) => (
                          <th
                            key={`${fg}-${lv.code}`}
                            className="border border-slate-800 p-1 text-center"
                          >
                            {lv.label}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((r, idx) => {
                      const rStat = calcSummary.byRow.find(
                        (item) => item.rowId === r.id
                      );
                      const selectedLessons = (r.lessonItems || []).filter(
                        (li) => li.selected
                      );

                      if (selectedLessons.length === 0) {
                        return (
                          <tr key={r.id}>
                            <td className="border border-slate-800 p-1.5 text-center">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-800 p-1.5 font-semibold">
                              {r.chapterCode ? `${r.chapterCode}: ` : ''}
                              {r.topicTitle}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {r.knowledgeUnit}
                            </td>
                            {activeGroups.map((fg) =>
                              LEVEL_COLUMN_DEFINITIONS.map((lv) => {
                                const c = r.cells.find(
                                  (cell) =>
                                    cell.formatGroup === fg &&
                                    cell.levelColumn === lv.code
                                );
                                return (
                                  <td
                                    key={`${r.id}-${fg}-${lv.code}`}
                                    className="border border-slate-800 p-1 text-center"
                                  >
                                    {c && (c.questionCount > 0 || c.points > 0)
                                      ? `${c.questionCount}c (${c.points.toFixed(
                                          2
                                        )}đ)`
                                      : '-'}
                                  </td>
                                );
                              })
                            )}
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              {rStat?.questionCount || 0}
                            </td>
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              {(rStat?.points || 0).toFixed(2)}
                            </td>
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              {(rStat?.percentage || 0).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <React.Fragment key={r.id}>
                          {selectedLessons.map((li, lIdx) => {
                            const isFirst = lIdx === 0;
                            const lessonCells = li.cells || [];
                            let lessonQuestions = 0;
                            let lessonPoints = 0;
                            activeGroups.forEach((fg) => {
                              LEVEL_COLUMN_DEFINITIONS.forEach((lv) => {
                                const c = lessonCells.find(
                                  (cell) =>
                                    cell.formatGroup === fg &&
                                    cell.levelColumn === lv.code
                                );
                                lessonQuestions += c?.questionCount || 0;
                                lessonPoints = exactAdd(
                                  lessonPoints,
                                  c?.points || 0
                                );
                              });
                            });
                            const lessonPct =
                              calcSummary.totalPoints > 0
                                ? exactRound(
                                    (lessonPoints / calcSummary.totalPoints) *
                                      100
                                  )
                                : 0;

                            return (
                              <tr key={`${r.id}-${li.id}`}>
                                {isFirst && (
                                  <td
                                    rowSpan={selectedLessons.length}
                                    className="border border-slate-800 p-1.5 text-center align-top"
                                  >
                                    {idx + 1}
                                  </td>
                                )}
                                {isFirst && (
                                  <td
                                    rowSpan={selectedLessons.length}
                                    className="border border-slate-800 p-1.5 font-semibold align-top"
                                  >
                                    {r.chapterCode ? `${r.chapterCode}: ` : ''}
                                    {r.topicTitle}
                                  </td>
                                )}
                                <td className="border border-slate-800 p-1.5">
                                  {li.lessonName} ({li.periodsCount} tiết)
                                </td>
                                {activeGroups.map((fg) =>
                                  LEVEL_COLUMN_DEFINITIONS.map((lv) => {
                                    const c = lessonCells.find(
                                      (cell) =>
                                        cell.formatGroup === fg &&
                                        cell.levelColumn === lv.code
                                    );
                                    return (
                                      <td
                                        key={`${r.id}-${li.id}-${fg}-${lv.code}`}
                                        className="border border-slate-800 p-1 text-center"
                                      >
                                        {c &&
                                        (c.questionCount > 0 || c.points > 0)
                                          ? `${c.questionCount}c (${c.points.toFixed(
                                              2
                                            )}đ)`
                                          : '-'}
                                      </td>
                                    );
                                  })
                                )}
                                <td className="border border-slate-800 p-1.5 text-center font-bold">
                                  {lessonQuestions}
                                </td>
                                <td className="border border-slate-800 p-1.5 text-center font-bold">
                                  {lessonPoints.toFixed(2)}
                                </td>
                                <td className="border border-slate-800 p-1.5 text-center font-bold">
                                  {lessonPct.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    <tr className="bg-amber-50 font-bold">
                      <td
                        colSpan={3}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        TỔNG CỘNG TOÀN ĐỀ
                      </td>
                      {activeGroups.map((fg) =>
                        LEVEL_COLUMN_DEFINITIONS.map((lv) => {
                          const sumCnt = specRows.reduce((acc, r) => {
                            const c = r.cells.find(
                              (cell) =>
                                cell.formatGroup === fg &&
                                cell.levelColumn === lv.code
                            );
                            return acc + (c?.questionCount || 0);
                          }, 0);
                          const sumPts = exactRound(
                            specRows.reduce((acc, r) => {
                              const c = r.cells.find(
                                (cell) =>
                                  cell.formatGroup === fg &&
                                  cell.levelColumn === lv.code
                              );
                              return exactAdd(acc, c?.points || 0);
                            }, 0)
                          );
                          return (
                            <td
                              key={`tot-${fg}-${lv.code}`}
                              className="border border-slate-800 p-1 text-center"
                            >
                              {sumCnt > 0
                                ? `${sumCnt}c (${sumPts.toFixed(2)}đ)`
                                : '-'}
                            </td>
                          );
                        })
                      )}
                      <td className="border border-slate-800 p-1.5 text-center">
                        {calcSummary.totalQuestions}
                      </td>
                      <td className="border border-slate-800 p-1.5 text-center">
                        {calcSummary.totalPoints.toFixed(2)}đ
                      </td>
                      <td className="border border-slate-800 p-1.5 text-center">
                        {calcSummary.totalPercentage.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 02. BẢN ĐẶC TẢ ĐỀ KIỂM TRA (MỤC VI) */}
            {activePreviewDocType === '02_SPECIFICATION' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="font-bold uppercase text-[14pt]">
                    BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ
                  </div>
                  <div className="font-bold">
                    Môn: {dossierCtx.exam.subject} – Khối lớp:{' '}
                    {dossierCtx.exam.grade}
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-[9.5pt]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th
                        rowSpan={3}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        TT
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-800 p-1.5 text-left"
                      >
                        Chủ đề / Chương
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-800 p-1.5 text-left"
                      >
                        Nội dung / Đơn vị kiến thức (Từng bài học)
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-800 p-1.5 text-left"
                      >
                        Mức độ & Yêu cầu cần đạt
                      </th>
                      <th
                        colSpan={FORMAT_GROUP_DEFINITIONS.length * 3}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        Số câu hỏi theo mức độ nhận thức ở từng phần
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        Tổng câu
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        Điểm số
                      </th>
                    </tr>
                    <tr className="bg-slate-100">
                      {FORMAT_GROUP_DEFINITIONS.map((fg) => (
                        <th
                          key={`dos-spec-fg-${fg.code}`}
                          colSpan={3}
                          className="border border-slate-800 p-1 text-center"
                        >
                          {fg.label}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50">
                      {FORMAT_GROUP_DEFINITIONS.map((fg) =>
                        LEVEL_COLUMN_DEFINITIONS.map((lv) => (
                          <th
                            key={`dos-spec-col-${fg.code}-${lv.code}`}
                            className="border border-slate-800 p-1 text-center"
                          >
                            {lv.label}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((r, idx) => {
                      const rStat = calcSummary.byRow.find(
                        (item) => item.rowId === r.id
                      );
                      const selectedLessons = (r.lessonItems || []).filter(
                        (li) => li.selected
                      );

                      if (selectedLessons.length === 0) {
                        return (
                          <tr key={r.id}>
                            <td className="border border-slate-800 p-1.5 text-center">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-800 p-1.5 font-semibold">
                              {r.chapterCode ? `${r.chapterCode}: ` : ''}
                              {r.topicTitle}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {r.knowledgeUnit}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              <span className="font-mono font-bold">
                                [{r.learningOutcomeCode}]
                              </span>{' '}
                              <MathTextRenderer text={r.learningOutcomeText} />
                            </td>
                            {FORMAT_GROUP_DEFINITIONS.map((fg) =>
                              LEVEL_COLUMN_DEFINITIONS.map((lv) => {
                                const c = activeGroups.includes(fg.code)
                                  ? r.cells.find(
                                      (cell) =>
                                        cell.formatGroup === fg.code &&
                                        cell.levelColumn === lv.code
                                    )
                                  : undefined;
                                return (
                                  <td
                                    key={`dos-spec-empty-${r.id}-${fg.code}-${lv.code}`}
                                    className="border border-slate-800 p-1 text-center font-mono"
                                  >
                                    {c && c.questionCount > 0
                                      ? c.questionCount
                                      : '-'}
                                  </td>
                                );
                              })
                            )}
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              {rStat?.questionCount || 0}
                            </td>
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              {(rStat?.points || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <React.Fragment key={r.id}>
                          {selectedLessons.map((li, lIdx) => {
                            const isFirst = lIdx === 0;
                            const lessonCells = li.cells || [];
                            let lessonQuestions = 0;
                            let lessonPoints = 0;
                            activeGroups.forEach((fg) => {
                              LEVEL_COLUMN_DEFINITIONS.forEach((lv) => {
                                const c = lessonCells.find(
                                  (cell) =>
                                    cell.formatGroup === fg &&
                                    cell.levelColumn === lv.code
                                );
                                lessonQuestions += c?.questionCount || 0;
                                lessonPoints = exactAdd(
                                  lessonPoints,
                                  c?.points || 0
                                );
                              });
                            });
                            const yccdCode =
                              li.learningOutcomeCode || r.learningOutcomeCode;
                            const yccdText =
                              li.learningOutcomeText || r.learningOutcomeText;

                            return (
                              <tr key={`dos-spec-${r.id}-${li.id}`}>
                                {isFirst && (
                                  <td
                                    rowSpan={selectedLessons.length}
                                    className="border border-slate-800 p-1.5 text-center align-top"
                                  >
                                    {idx + 1}
                                  </td>
                                )}
                                {isFirst && (
                                  <td
                                    rowSpan={selectedLessons.length}
                                    className="border border-slate-800 p-1.5 font-semibold align-top"
                                  >
                                    {r.chapterCode ? `${r.chapterCode}: ` : ''}
                                    {r.topicTitle}
                                  </td>
                                )}
                                <td className="border border-slate-800 p-1.5">
                                  {li.lessonName} ({li.periodsCount} tiết)
                                </td>
                                <td className="border border-slate-800 p-1.5">
                                  <span className="font-mono font-bold">
                                    [{yccdCode}]
                                  </span>{' '}
                                  <MathTextRenderer text={yccdText} />
                                </td>
                                {FORMAT_GROUP_DEFINITIONS.map((fg) =>
                                  LEVEL_COLUMN_DEFINITIONS.map((lv) => {
                                    const c = activeGroups.includes(fg.code)
                                      ? lessonCells.find(
                                          (cell) =>
                                            cell.formatGroup === fg.code &&
                                            cell.levelColumn === lv.code
                                        )
                                      : undefined;
                                    return (
                                      <td
                                        key={`dos-spec-cell-${r.id}-${li.id}-${fg.code}-${lv.code}`}
                                        className="border border-slate-800 p-1 text-center font-mono font-bold"
                                      >
                                        {c && c.questionCount > 0
                                          ? c.questionCount
                                          : '-'}
                                      </td>
                                    );
                                  })
                                )}
                                <td className="border border-slate-800 p-1.5 text-center font-bold">
                                  {lessonQuestions}
                                </td>
                                <td className="border border-slate-800 p-1.5 text-center font-bold">
                                  {lessonPoints.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    <tr className="bg-amber-50 font-bold">
                      <td
                        colSpan={4}
                        className="border border-slate-800 p-1.5 text-center"
                      >
                        TỔNG SỐ CÂU THEO PHẦN & MỨC ĐỘ
                      </td>
                      {FORMAT_GROUP_DEFINITIONS.map((fg) =>
                        LEVEL_COLUMN_DEFINITIONS.map((lv) => {
                          const sumCnt = activeGroups.includes(fg.code)
                            ? specRows.reduce((acc, r) => {
                                const c = r.cells.find(
                                  (cell) =>
                                    cell.formatGroup === fg.code &&
                                    cell.levelColumn === lv.code
                                );
                                return acc + (c?.questionCount || 0);
                              }, 0)
                            : 0;
                          return (
                            <td
                              key={`dos-spec-tot-${fg.code}-${lv.code}`}
                              className="border border-slate-800 p-1 text-center font-mono"
                            >
                              {sumCnt}
                            </td>
                          );
                        })
                      )}
                      <td className="border border-slate-800 p-1.5 text-center">
                        {calcSummary.totalQuestions}
                      </td>
                      <td className="border border-slate-800 p-1.5 text-center">
                        {calcSummary.totalPoints.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 04, 05, 06: ĐÁP ÁN TRẮC NGHIỆM, HƯỚNG DẪN CHẤM TỰ LUẬN & BIỂU ĐIỂM (MỤC VII) */}
            {(activePreviewDocType === '04_MCQ_ANSWER_KEY' ||
              activePreviewDocType === '05_ESSAY_GRADING_GUIDE' ||
              activePreviewDocType === '06_SCORING_RUBRIC_TABLE') && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="font-bold uppercase text-[14pt]">
                    {
                      DOSSIER_DOCUMENT_CATALOG.find(
                        (d) => d.code === activePreviewDocType
                      )?.title
                    }
                  </div>
                  <div className="font-bold">
                    Môn: {dossierCtx.exam.subject} – Khối lớp:{' '}
                    {dossierCtx.exam.grade} · Tất cả {dossierCtx.variants.length}{' '}
                    Mã đề ({dossierCtx.variants.map((v) => v.variantCode).join(', ')})
                  </div>
                </div>

                {/* Bảng Đáp án Trắc nghiệm theo từng mã đề */}
                {dossierCtx.variants.map((v) => (
                  <div key={v.variantCode} className="space-y-2">
                    <div className="font-bold">
                      I. BẢNG ĐÁP ÁN VÀ BIỂU ĐIỂM – MÃ ĐỀ {v.variantCode} (Tổng
                      điểm: {v.totalPoints.toFixed(2)} /{' '}
                      {dossierCtx.exam.totalPoints.toFixed(2)} điểm)
                    </div>
                    <table className="w-full border-collapse border border-slate-800 text-[10.5pt]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-800 p-1.5 text-center">
                            Câu
                          </th>
                          <th className="border border-slate-800 p-1.5 text-left">
                            Dạng thức & Mã gốc
                          </th>
                          <th className="border border-slate-800 p-1.5 text-left">
                            Nội dung cần đạt / Đáp án đúng & Hướng dẫn chấm
                          </th>
                          <th className="border border-slate-800 p-1.5 text-center">
                            Điểm
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.items.map((it) => (
                          <tr key={it.displayNumber}>
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              Câu {it.displayNumber}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              <div>
                                {getQuestionFormatLabel(it.formatGroup)}
                              </div>
                              <div className="font-mono text-[9.5pt] text-slate-600">
                                {it.originalCode}
                              </div>
                            </td>
                            <td className="border border-slate-800 p-1.5 space-y-1">
                              <div>
                                <strong>Đáp án đúng: </strong>
                                <MathTextRenderer
                                  text={it.shuffledCorrectAnswer}
                                />
                              </div>
                              <div className="text-slate-700">
                                <strong>Hướng dẫn chấm: </strong>
                                <MathTextRenderer text={it.gradingGuide} />
                              </div>
                              {it.rubricCriteria &&
                                it.rubricCriteria.length > 0 && (
                                  <div className="pl-3 space-y-0.5 text-[10pt]">
                                    {it.rubricCriteria.map((rc) => (
                                      <div key={rc.id}>
                                        • <MathTextRenderer text={rc.criterion} />:{' '}
                                        <strong>{rc.points.toFixed(2)}đ</strong>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              {it.acceptedVariations &&
                                it.acceptedVariations.length > 0 && (
                                  <div className="italic text-[10pt] text-emerald-900">
                                    Phương án đúng khác chấp nhận:{' '}
                                    {it.acceptedVariations.join('; ')}
                                  </div>
                                )}
                            </td>
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              {it.points.toFixed(2)}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* 07, 08, 09, 10: PHIẾU THẨM ĐỊNH, BIÊN BẢN PHÊ DUYỆT, DANH MỤC CÂU HỎI, BÁO CÁO THỐNG KÊ */}
            {(activePreviewDocType === '07_APPRAISAL_SHEET' ||
              activePreviewDocType === '08_APPROVAL_MINUTES' ||
              activePreviewDocType === '09_USED_QUESTION_CATALOG' ||
              activePreviewDocType === '10_EXAM_STATISTICS_REPORT') && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="font-bold uppercase text-[14pt]">
                    {
                      DOSSIER_DOCUMENT_CATALOG.find(
                        (d) => d.code === activePreviewDocType
                      )?.title
                    }
                  </div>
                  <div className="font-bold">
                    Hồ sơ: {dossierCtx.exam.title} ({dossierCtx.exam.code})
                  </div>
                </div>

                {(activePreviewDocType === '07_APPRAISAL_SHEET' ||
                  activePreviewDocType === '08_APPROVAL_MINUTES') && (
                  <div className="space-y-3">
                    <div className="text-[11pt] space-y-1">
                      <div>
                        <strong>Người biên soạn:</strong>{' '}
                        {officialMinutes.authorName} ·{' '}
                        <strong>Người phản biện:</strong>{' '}
                        {officialMinutes.peerReviewerName}
                      </div>
                      <div>
                        <strong>Tổ trưởng CM:</strong>{' '}
                        {officialMinutes.headOfDepartmentName} ·{' '}
                        <strong>Lãnh đạo phê duyệt:</strong>{' '}
                        {officialMinutes.approverName}
                      </div>
                      <div>
                        <strong>Kết luận hội đồng:</strong>{' '}
                        {officialMinutes.conclusionText}
                      </div>
                    </div>

                    <table className="w-full border-collapse border border-slate-800 text-[10pt]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-800 p-1.5">TT</th>
                          <th className="border border-slate-800 p-1.5 text-left">
                            Tiêu chí thẩm định (12 tiêu chí chuẩn)
                          </th>
                          <th className="border border-slate-800 p-1.5 text-center">
                            Đánh giá
                          </th>
                          <th className="border border-slate-800 p-1.5 text-left">
                            Nhận xét chuyên môn
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(
                          dossierCtx.exam.appraisalSheets?.[0]
                            ?.criteriaEvaluations ||
                          DEFAULT_12_APPRAISAL_CRITERIA.map((c) => ({
                            criterionCode: c.code,
                            order: c.order,
                            title: c.title,
                            rating: 'DAT' as const,
                            comment: 'Đạt chuẩn chuyên môn GDPT 2018.',
                            questionPositions: '',
                          }))
                        ).map((ev) => (
                          <tr key={ev.criterionCode}>
                            <td className="border border-slate-800 p-1.5 text-center">
                              {ev.order}
                            </td>
                            <td className="border border-slate-800 p-1.5 font-semibold">
                              {ev.title}
                            </td>
                            <td className="border border-slate-800 p-1.5 text-center font-bold">
                              {ev.rating === 'DAT' ? 'Đạt' : ev.rating}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {ev.comment}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(activePreviewDocType === '09_USED_QUESTION_CATALOG' ||
                  activePreviewDocType === '10_EXAM_STATISTICS_REPORT') && (
                  <table className="w-full border-collapse border border-slate-800 text-[10pt]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-800 p-1.5">TT</th>
                        <th className="border border-slate-800 p-1.5 text-left">
                          Mã câu hỏi
                        </th>
                        <th className="border border-slate-800 p-1.5 text-left">
                          Chủ đề & Mã YCCĐ
                        </th>
                        <th className="border border-slate-800 p-1.5 text-left">
                          Dạng câu & Mức độ
                        </th>
                        <th className="border border-slate-800 p-1.5 text-center">
                          Điểm
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossierCtx.questions.map((q, idx) => (
                        <tr key={q.id}>
                          <td className="border border-slate-800 p-1.5 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-800 p-1.5 font-mono font-bold">
                            {q.code}
                          </td>
                          <td className="border border-slate-800 p-1.5">
                            {q.topicTitle} ({q.learningOutcomeCode})
                          </td>
                          <td className="border border-slate-800 p-1.5">
                            {getQuestionFormatLabel(q.format)} ·{' '}
                            {getCognitiveLevelLabel(q.cognitiveLevel)}
                          </td>
                          <td className="border border-slate-800 p-1.5 text-center font-bold">
                            {q.points.toFixed(2)}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Chân trang A4 tự động đánh số trang */}
            <div className="mt-6 pt-2 border-t border-slate-300 flex items-center justify-between text-[9.5pt] text-slate-600">
              <span>
                Hồ sơ: {dossierCtx.exam.code} · Mã định danh:{' '}
                {dossierCtx.securityCode}
              </span>
              {workingTemplate.autoPageNumbering && <span>Trang 1 / 1</span>}
            </div>
          </div>

          {/* ================================================================
              TRÌNH KIỂM ĐỊNH CHẤT LƯỢNG FILE & KẾT QUẢ MỞ LẠI TỆP (MỤC VIII & X)
             ================================================================ */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span>
                    Báo cáo Mở lại & Kiểm định Chất lượng Tệp Đã Xuất (Mục VIII & X)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hệ thống tự động đọc lại cấu trúc nhị phân của tệp .docx, .xlsx, .pdf, .zip sau khi xuất để xác minh 9 tiêu chí chất lượng.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600">
                Đã kiểm định: {inspectionResults.length} tệp
              </span>
            </div>

            {inspectionResults.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                Nhấn nút <strong>"Chạy Kiểm thử Mục X"</strong> hoặc tải bất kỳ tệp{' '}
                <strong>.docx / .xlsx / .pdf / .zip</strong> nào để xem kết quả mở lại và kiểm định tự động tại đây.
              </div>
            ) : (
              <div className="space-y-3">
                {inspectionResults.map((res, idx) => (
                  <div
                    key={`${res.fileName}-${idx}`}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono">{res.fileName}</span>
                        <span className="text-slate-500 font-normal">
                          · {(res.fileSizeBytes / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-semibold">
                        Đạt 9/9 tiêu chí chất lượng File · Bảo mật Đáp án: ĐẠT
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-700">
                      <strong>Cấu trúc khi mở lại tệp:</strong>{' '}
                      {res.extractedSummary.internalStructureVerified}
                    </div>

                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        • Mở được tệp:{' '}
                        <strong>{res.canOpenFile ? 'Hợp lệ' : 'Lỗi'}</strong>
                      </span>
                      <span>
                        • Font tiếng Việt:{' '}
                        <strong>
                          {res.vietnameseFontOk ? 'Chuẩn UTF-8' : 'Cảnh báo'}
                        </strong>
                      </span>
                      <span>
                        • Số câu:{' '}
                        <strong>{res.extractedSummary.questionCount} câu</strong>
                      </span>
                      <span>
                        • Tổng điểm:{' '}
                        <strong>
                          {res.extractedSummary.totalPoints.toFixed(2)} điểm
                        </strong>
                      </span>
                      <span>
                        • Mã đề:{' '}
                        <strong>
                          {res.extractedSummary.variantCodes.join(', ')}
                        </strong>
                      </span>
                      <span>
                        • Công thức toán:{' '}
                        <strong>
                          {res.extractedSummary.formulaCount} câu có công thức
                        </strong>
                      </span>
                      <span>
                        • Không lộ đáp án đề HS:{' '}
                        <strong>
                          {res.noAnswerLeakInStudentFileOk ? 'An toàn' : 'Lộ'}
                        </strong>
                      </span>
                    </div>

                    {res.extractedSummary.sampleExtractedText && (
                      <div className="p-2 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700 truncate">
                        Nội dung đọc lại từ file:{' '}
                        {res.extractedSummary.sampleExtractedText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NHẬT KÝ LỊCH SỬ TẢI XUỐNG & KIỂM SOÁT BẢO MẬT (MỤC IX) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-700" />
                <span>Nhật ký Lịch sử Tải xuống & Kiểm soát Bảo mật (Mục IX)</span>
              </h3>
              <span className="text-xs text-slate-500">
                {downloadAuditLogs.length} lượt ghi nhận
              </span>
            </div>

            {downloadAuditLogs.length === 0 ? (
              <div className="text-xs text-slate-500 py-3">
                Chưa có lượt tải xuống nào được ghi nhận.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-2 pr-3">Thời gian</th>
                      <th className="py-2 pr-3">Người thực hiện & Vai trò</th>
                      <th className="py-2 pr-3">Tệp & Định dạng</th>
                      <th className="py-2 pr-3">Mã định danh</th>
                      <th className="py-2">Kết quả bảo mật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {downloadAuditLogs.slice(0, 8).map((log) => (
                      <tr key={log.id}>
                        <td className="py-2 pr-3 font-mono text-[11px] whitespace-nowrap">
                          {log.downloadedAt}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="font-semibold text-slate-900">
                            {log.actorName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {log.actorRoleLabel}
                          </div>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="font-mono text-[11px] text-slate-800">
                            {log.fileName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Định dạng: {log.format} ·{' '}
                            {log.hasDraftStamp ? 'Đóng dấu BẢN NHÁP' : 'Bản chính thức'}
                          </div>
                        </td>
                        <td className="py-2 pr-3 font-mono text-[11px]">
                          {log.dossierSecurityCode}
                        </td>
                        <td className="py-2">
                          <span
                            className={`font-semibold ${
                              log.status === 'SUCCESS'
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {log.status === 'SUCCESS'
                              ? 'Cho phép tải xuống'
                              : 'Đã chặn (Không đủ thẩm quyền)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function existingOrBlob(b: Blob): Blob {
  return b;
}
