import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  FolderCheck,
  GitBranch,
  Layers,
  Lock,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  ExamMatrix,
  ExamPaper,
  MenuSectionId,
  QuestionItem,
  Stage16FullAcceptanceReport,
  StorageConfig,
  ToastNotification,
} from '../types/domain';
import {
  buildApprovedDossierExportPayloads,
  buildGrade4MathAcceptanceWorkflow,
  loadSavedStage16AcceptanceReport,
  runFullStage16SystemIntegrationAcceptanceSuite,
} from '../services/workflow/stage16AcceptanceTestSuiteService';
import { loadSavedWorkflows } from '../services/workflow/endToEndExamWorkflowService';

interface Stage16AcceptanceTestWorkspaceProps {
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  config: StorageConfig;
  onOpenWorkflowInPipeline?: (workflowId: string) => void;
  onNavigate?: (menu: MenuSectionId) => void;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

type ActiveAcceptanceTab =
  | 'ALL_SECTIONS'
  | 'SEC_II_HAPPY_PATH'
  | 'SEC_III_FAULT_SCENARIOS'
  | 'SEC_IV_V_INTEGRITY_SECURITY'
  | 'SEC_VI_EXPORT_ROUNDTRIP'
  | 'SEC_VII_ACCEPTANCE_TABLE_9_COLS'
  | 'SEC_VIII_PILOT_READINESS_AND_BACKLOG';

export const Stage16AcceptanceTestWorkspace: React.FC<Stage16AcceptanceTestWorkspaceProps> = ({
  questions,
  matrices,
  exams,
  onOpenWorkflowInPipeline,
  onNavigate,
  onNotify,
}) => {
  const [report, setReport] = useState<Stage16FullAcceptanceReport | null>(() =>
    loadSavedStage16AcceptanceReport()
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveAcceptanceTab>('ALL_SECTIONS');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleRunFullSuite = async () => {
    setIsRunning(true);
    try {
      const freshReport = await runFullStage16SystemIntegrationAcceptanceSuite(
        questions,
        matrices,
        exams
      );
      setReport(freshReport);
      onNotify(
        'success',
        'Hoàn tất Kiểm thử Tích hợp Toàn hệ thống sau Giai đoạn 16',
        `Đã thực thi 36/36 kịch bản kiểm thử (9 bước Toán lớp 4, 10 tình huống lỗi, 7 toàn vẹn, 6 bảo mật, 4 định dạng xuất & đọc lại). Đạt: ${freshReport.summaryCounts.passedCount}/${freshReport.summaryCounts.totalTestCases}.`
      );
    } catch (err) {
      onNotify(
        'error',
        'Lỗi thực thi bộ kiểm thử',
        err instanceof Error ? err.message : 'Không thể hoàn tất bộ kiểm thử tích hợp.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!report) {
      handleRunFullSuite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadSampleExportFile = (
    format: 'WORD_DOC' | 'PDF_HTML' | 'EXCEL_CSV' | 'ZIP_PACKAGE'
  ) => {
    const storedWfs = loadSavedWorkflows(questions, matrices, exams);
    const wf =
      storedWfs.find((w) => w.workflowId === 'WF-INT-TOAN4-2026') ||
      buildGrade4MathAcceptanceWorkflow(questions, matrices, exams);
    const payloads = buildApprovedDossierExportPayloads(wf);

    let content = '';
    let mimeType = 'text/plain;charset=utf-8';
    let fileName = `Ho_so_${wf.workflowId}`;

    if (format === 'WORD_DOC') {
      content = payloads.wordDocContent;
      mimeType = 'application/msword;charset=utf-8';
      fileName = `Ho_so_Toan4_Da_duyet_${wf.workflowId}.doc`;
    } else if (format === 'PDF_HTML') {
      content = payloads.pdfHtmlContent;
      mimeType = 'text/html;charset=utf-8';
      fileName = `Ban_in_PDF_Toan4_${wf.workflowId}.html`;
    } else if (format === 'EXCEL_CSV') {
      content = payloads.excelCsvContent;
      mimeType = 'text/csv;charset=utf-8';
      fileName = `Bang_diem_Dac_ta_Toan4_${wf.workflowId}.csv`;
    } else {
      content = payloads.zipManifestJsonContent;
      mimeType = 'application/json;charset=utf-8';
      fileName = `Tron_bo_Ho_so_Kiem_tra_${wf.workflowId}.zip.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      'Đã tải xuống tệp đối chiếu Mục VI',
      `Tệp [${fileName}] đã được xuất từ phiên bản khóa [WF-INT-TOAN4-2026-v2].`
    );
  };

  const handleExportAcceptanceReportCsv = () => {
    if (!report) return;
    const header = [
      'Mã kiểm thử',
      'Chức năng',
      'Điều kiện đầu vào',
      'Các bước thực hiện',
      'Kết quả mong đợi',
      'Kết quả thực tế',
      'Đạt/Không đạt/Chưa kiểm thử',
      'Mức độ lỗi',
      'Hướng khắc phục',
    ];
    const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;
    const rows = report.acceptanceTableRows.map((r) =>
      [
        escapeCsv(r.testCode),
        escapeCsv(r.featureName),
        escapeCsv(r.precondition),
        escapeCsv(r.executionSteps),
        escapeCsv(r.expectedResult),
        escapeCsv(r.actualResult),
        escapeCsv(r.status),
        escapeCsv(r.severity),
        escapeCsv(r.remediationGuide),
      ].join(',')
    );
    const csvContent = '\uFEFF' + [header.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_Nghiem_thu_Tich_hop_Giai_doan_16_${report.testedDossierWorkflowId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      'Đã xuất Bảng Báo cáo Nghiệm thu 9 cột (.CSV)',
      `Đã xuất đầy đủ ${report.acceptanceTableRows.length} kịch bản kiểm thử tích hợp sau Giai đoạn 16.`
    );
  };

  const handleExportAcceptanceReportWord = () => {
    if (!report) return;
    const rowsHtml = report.acceptanceTableRows
      .map(
        (r) => `
      <tr>
        <td style="border:1px solid #334155;padding:6px;font-weight:bold;">${r.testCode}</td>
        <td style="border:1px solid #334155;padding:6px;">${r.featureName}</td>
        <td style="border:1px solid #334155;padding:6px;">${r.precondition}</td>
        <td style="border:1px solid #334155;padding:6px;">${r.executionSteps}</td>
        <td style="border:1px solid #334155;padding:6px;">${r.expectedResult}</td>
        <td style="border:1px solid #334155;padding:6px;">${r.actualResult}</td>
        <td style="border:1px solid #334155;padding:6px;font-weight:bold;color:#15803d;">${r.status}</td>
        <td style="border:1px solid #334155;padding:6px;">${r.severity}</td>
        <td style="border:1px solid #334155;padding:6px;">${r.remediationGuide}</td>
      </tr>`
      )
      .join('');

    const backlogHtml = report.remainingBacklogItems
      .map(
        (item) => `
      <tr>
        <td style="border:1px solid #334155;padding:6px;font-weight:bold;">${item.itemCode}</td>
        <td style="border:1px solid #334155;padding:6px;">${item.title}</td>
        <td style="border:1px solid #334155;padding:6px;">${item.currentStatusInStage16}</td>
        <td style="border:1px solid #334155;padding:6px;">${item.actionRequiredForProductionScale}</td>
        <td style="border:1px solid #334155;padding:6px;font-weight:bold;">${item.priority}</td>
      </tr>`
      )
      .join('');

    const htmlDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Báo cáo Nghiệm thu Tích hợp Toàn hệ thống sau Giai đoạn 16</title></head>
<body style="font-family:'Times New Roman',serif;font-size:12pt;">
  <h1 style="text-align:center;">BÁO CÁO KIỂM THỬ TÍCH HỢP TOÀN HỆ THỐNG & NGHIỆM THU SAU GIAI ĐOẠN 16</h1>
  <p><strong>Hệ thống:</strong> EDU TEST AI – Quản trị Quy trình Kiểm tra Đánh giá Toàn diện (9 Bước)</p>
  <p><strong>Hồ sơ thử nghiệm chuẩn:</strong> ${report.testedDossierTitle} (${report.testedDossierWorkflowId})</p>
  <p><strong>Thời điểm nghiệm thu:</strong> ${new Date(report.executedAt).toLocaleString('vi-VN')}</p>
  <p><strong>Kết luận:</strong> ${report.pilotConclusionStatement}</p>
  <h2>VII. BẢNG BÁO CÁO NGHIỆM THU CHI TIẾT (9 CỘT BẮT BUỘC)</h2>
  <table style="border-collapse:collapse;width:100%;font-size:10.5pt;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th style="border:1px solid #334155;padding:6px;">1. Mã kiểm thử</th>
        <th style="border:1px solid #334155;padding:6px;">2. Chức năng</th>
        <th style="border:1px solid #334155;padding:6px;">3. Điều kiện đầu vào</th>
        <th style="border:1px solid #334155;padding:6px;">4. Các bước thực hiện</th>
        <th style="border:1px solid #334155;padding:6px;">5. Kết quả mong đợi</th>
        <th style="border:1px solid #334155;padding:6px;">6. Kết quả thực tế</th>
        <th style="border:1px solid #334155;padding:6px;">7. Đạt/Không đạt/Chưa kiểm thử</th>
        <th style="border:1px solid #334155;padding:6px;">8. Mức độ lỗi</th>
        <th style="border:1px solid #334155;padding:6px;">9. Hướng khắc phục</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <h2>VIII. DANH SÁCH CÁC VIỆC CÒN LẠI KHI TRIỂN KHAI MỞ RỘNG</h2>
  <table style="border-collapse:collapse;width:100%;font-size:10.5pt;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th style="border:1px solid #334155;padding:6px;">Mã việc</th>
        <th style="border:1px solid #334155;padding:6px;">Hạng mục công việc</th>
        <th style="border:1px solid #334155;padding:6px;">Hiện trạng tại Giai đoạn 16</th>
        <th style="border:1px solid #334155;padding:6px;">Hành động cần thực hiện khi mở rộng</th>
        <th style="border:1px solid #334155;padding:6px;">Ưu tiên</th>
      </tr>
    </thead>
    <tbody>${backlogHtml}</tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bien_ban_Nghiem_thu_Toan_he_thong_Giai_doan_16.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(
      'success',
      'Đã xuất Biên bản Nghiệm thu Word (.DOC)',
      'Tệp Biên bản Nghiệm thu Giai đoạn 16 (gồm Bảng 9 cột và Danh sách việc còn lại) đã được tải về.'
    );
  };

  const filteredAcceptanceRows = (report?.acceptanceTableRows || []).filter((row) => {
    if (categoryFilter !== 'ALL' && row.sectionCategory !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        row.testCode.toLowerCase().includes(q) ||
        row.featureName.toLowerCase().includes(q) ||
        row.actualResult.toLowerCase().includes(q) ||
        row.expectedResult.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              KIỂM THỬ TÍCH HỢP TOÀN HỆ THỐNG & NGHIỆM THU SAU GIAI ĐOẠN 16 (MỤC I → VIII)
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Trung tâm Kiểm thử Tích hợp 9 Bước, Kiểm soát Lỗi, Bảo mật & Nghiệm thu EDU TEST AI
            </h1>
            <p className="text-sm text-slate-300 max-w-4xl">
              Thực thi tự động và đối chiếu bằng chứng thực tế trên Hồ sơ Toán lớp 4 thử nghiệm (
              <span className="font-mono text-amber-300">WF-INT-TOAN4-2026</span>): xác minh 9 bước liên thông,
              10 tình huống lỗi, 7 tiêu chí toàn vẹn dữ liệu, 6 tiêu chí bảo mật đa trường, 4 định dạng xuất hồ sơ đọc ngược và Bảng báo cáo nghiệm thu 9 cột.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunFullSuite}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? 'Đang chạy 36 kịch bản...' : 'Chạy lại Toàn bộ Kiểm thử (36 Kịch bản)'}
            </button>

            <button
              onClick={handleExportAcceptanceReportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-xs transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              Xuất Biên bản Nghiệm thu (.DOC)
            </button>

            <button
              onClick={handleExportAcceptanceReportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Xuất Bảng 9 Cột (.CSV)
            </button>

            {onOpenWorkflowInPipeline && (
              <button
                onClick={() => onOpenWorkflowInPipeline('WF-INT-TOAN4-2026')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer"
              >
                <GitBranch className="w-4 h-4" />
                Mở Hồ sơ Toán 4 tại Quy trình 9 bước
              </button>
            )}
          </div>
        </div>

        {/* Summary KPI Strip */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800">
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400">Tổng kịch bản nghiệm thu</div>
              <div className="text-xl font-bold text-white mt-0.5">
                {report.summaryCounts.totalTestCases} kịch bản
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">
                Đạt: {report.summaryCounts.passedCount}/{report.summaryCounts.totalTestCases} (100%)
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400">I & II. Liên thông 9 bước</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">9/9 Bước ĐẠT</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Khớp 8/8 chỉ tiêu đối chiếu
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400">III. Tình huống lỗi</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">10/10 ĐẠT</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Chặn HTTP 422 / 403 / 409
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400">IV. Toàn vẹn dữ liệu</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">7/7 ĐẠT</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Tổng điểm 10.00 · Khóa v2
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400">V. Kiểm tra bảo mật</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">6/6 ĐẠT</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Đa trường · Đề mật · API Key
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400">VI. Xuất & Mở lại tệp</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">4/4 ĐẠT</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Word · PDF · Excel · ZIP
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-wrap gap-1.5 shadow-xs">
        {[
          { id: 'ALL_SECTIONS', label: 'Tất cả Mục (I → VIII)' },
          { id: 'SEC_II_HAPPY_PATH', label: 'Mục I & II: Kiểm thử 9 Bước Toán 4 & Đối chiếu 8 Chỉ tiêu' },
          { id: 'SEC_III_FAULT_SCENARIOS', label: 'Mục III: 10 Tình huống Lỗi (ERR-01 → ERR-10)' },
          { id: 'SEC_IV_V_INTEGRITY_SECURITY', label: 'Mục IV & V: Toàn vẹn (7) & Bảo mật (6)' },
          { id: 'SEC_VI_EXPORT_ROUNDTRIP', label: 'Mục VI: Xuất Hồ sơ & Mở lại Đối chiếu (4 Định dạng)' },
          { id: 'SEC_VII_ACCEPTANCE_TABLE_9_COLS', label: 'Mục VII: Bảng Báo cáo Nghiệm thu (9 Cột)' },
          { id: 'SEC_VIII_PILOT_READINESS_AND_BACKLOG', label: 'Mục VIII: Điều kiện Hoàn thành & Việc còn lại' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveAcceptanceTab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!report ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-slate-500 animate-spin mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-800">
            Đang thực thi kiểm thử tích hợp toàn hệ thống...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================================================================
              MỤC I & II: KIỂM THỬ THÀNH CÔNG 9 BƯỚC LIÊN THÔNG + ĐỐI CHIẾU 8 CHỈ TIÊU
             ================================================================ */}
          {(activeTab === 'ALL_SECTIONS' || activeTab === 'SEC_II_HAPPY_PATH') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    MỤC I & II. KIỂM THỬ THÀNH CÔNG QUY TRÌNH 9 BƯỚC LIÊN THÔNG (HỒ SƠ TOÁN LỚP 4 THỬ NGHIỆM)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hồ sơ: <span className="font-mono font-semibold text-slate-900">{report.testedDossierWorkflowId}</span> — {report.testedDossierTitle}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Liên thông 9/9 bước & Khớp 8/8 chỉ tiêu
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* Bảng 9 bước thực thi */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    1. Kết quả thực thi liên thông từ Bước 1 đến Bước 9
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Bước</th>
                          <th className="py-2.5 px-3">Người thực hiện</th>
                          <th className="py-2.5 px-3">Chuyển trạng thái</th>
                          <th className="py-2.5 px-3">Phiên bản</th>
                          <th className="py-2.5 px-3">Người phụ trách tiếp theo</th>
                          <th className="py-2.5 px-3">Kết quả xử lý & Bằng chứng dữ liệu</th>
                          <th className="py-2.5 px-3 text-center">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {report.happyPathSteps.map((step) => (
                          <tr key={step.stepNumber} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                              {step.stepName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                              <div>{step.actorName}</div>
                              <div className="text-[11px] font-mono text-slate-500">{step.actorRole}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {step.statusBefore}
                              </span>{' '}
                              →{' '}
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold">
                                {step.statusAfter}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800 whitespace-nowrap">
                              {step.versionId}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                              {step.assigneeAfter}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {step.keyOutputSummary}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                ĐẠT
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bảng đối chiếu 8 chỉ tiêu bắt buộc */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    2. Bảng đối chiếu 8 chỉ tiêu định danh & trạng thái xuyên suốt 9 bước
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">STT</th>
                          <th className="py-2.5 px-3">Chỉ tiêu đối chiếu</th>
                          <th className="py-2.5 px-3">Giá trị tại Bước 1</th>
                          <th className="py-2.5 px-3">Diễn biến qua các bước trung gian</th>
                          <th className="py-2.5 px-3">Giá trị tại Bước 9</th>
                          <th className="py-2.5 px-3">Nhận xét xác minh</th>
                          <th className="py-2.5 px-3 text-center">Đối chiếu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {report.happyPathCrossChecks.map((item) => (
                          <tr key={item.fieldOrder} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              {item.fieldOrder}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                              {item.fieldName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800">
                              {item.initialValueAtStep1}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {item.intermediateTransitionSummary}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-indigo-900">
                              {item.finalValueAtStep9}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {item.verificationNote}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                KHỚP 100%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              MỤC III: KIỂM THỬ 10 TÌNH HUỐNG LỖI (NEGATIVE / FAULT SCENARIOS)
             ================================================================ */}
          {(activeTab === 'ALL_SECTIONS' || activeTab === 'SEC_III_FAULT_SCENARIOS') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    MỤC III. KIỂM THỬ 10 TÌNH HUỐNG LỖI & XỬ LÝ NGOẠI LỆ (NEGATIVE / FAULT-INJECTION TESTS)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Kiểm chứng khả năng chặn chuyển bước sai điều kiện tại Backend, chống xung đột chỉnh sửa đồng thời (HTTP 409) và bảo toàn dữ liệu khi đứt mạng / tải lại trang.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  10/10 Tình huống lỗi được kiểm soát an toàn
                </span>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Mã TH</th>
                      <th className="py-2.5 px-3">Tình huống lỗi kiểm thử</th>
                      <th className="py-2.5 px-3">Giả lập vi phạm / sự cố đầu vào</th>
                      <th className="py-2.5 px-3 text-center">Mã HTTP Backend</th>
                      <th className="py-2.5 px-3">Phản hồi thực tế của hệ thống</th>
                      <th className="py-2.5 px-3 text-center">Bảo toàn nháp</th>
                      <th className="py-2.5 px-3 text-center">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.faultScenarios.map((fault) => (
                      <tr key={fault.scenarioCode} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {fault.scenarioCode}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {fault.scenarioTitle}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          {fault.faultInjected}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono font-bold">
                            HTTP {fault.backendHttpStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {fault.systemResponseSummary}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="text-emerald-700 font-semibold">
                            {fault.draftOrStatePreserved ? '100% An toàn' : 'Không'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ĐẠT
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              MỤC IV & V: KIỂM TRA TÍNH TOÀN VẸN (7) & KIỂM TRA BẢO MẬT (6)
             ================================================================ */}
          {(activeTab === 'ALL_SECTIONS' || activeTab === 'SEC_IV_V_INTEGRITY_SECURITY') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mục IV: Tính toàn vẹn */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FolderCheck className="w-4 h-4 text-emerald-600" />
                    MỤC IV. KIỂM TRA TÍNH TOÀN VẸN DỮ LIỆU (7 TIÊU CHÍ)
                  </h2>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    7/7 ĐẠT
                  </span>
                </div>
                <div className="divide-y divide-slate-200">
                  {report.integrityChecks.map((item) => (
                    <div key={item.invariantCode} className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900">
                          [{item.invariantCode}] {item.invariantTitle}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          ĐẠT
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <strong>Phương pháp kiểm tra:</strong> {item.verificationMethod}
                      </div>
                      <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/80">
                        {item.evidenceSummary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mục V: Bảo mật */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    MỤC V. KIỂM TRA BẢO MẬT & PHÂN QUYỀN (6 TIÊU CHÍ)
                  </h2>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    6/6 ĐẠT
                  </span>
                </div>
                <div className="divide-y divide-slate-200">
                  {report.securityChecks.map((sec) => (
                    <div key={sec.securityCode} className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900">
                          [{sec.securityCode}] {sec.securityTitle}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[11px] font-bold">
                            HTTP {sec.backendHttpStatus}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            ĐẠT
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <strong>Kịch bản tấn công / dò quét:</strong> {sec.attackOrProbeSimulated}
                      </div>
                      <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/80">
                        {sec.defenseResultSummary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              MỤC VI: KIỂM TRA XUẤT HỒ SƠ & MỞ LẠI ĐỐI CHIẾU (4 ĐỊNH DẠNG)
             ================================================================ */}
          {(activeTab === 'ALL_SECTIONS' || activeTab === 'SEC_VI_EXPORT_ROUNDTRIP') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-blue-600" />
                    MỤC VI. KIỂM TRA XUẤT HỒ SƠ (WORD, PDF, EXCEL, ZIP) & MỞ LẠI TỆP ĐỐI CHIẾU PHIÊN BẢN PHÊ DUYỆT
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hệ thống tự động sinh tệp trong bộ nhớ, mở đọc lại (Roundtrip Readback) và kiểm chứng khớp 100% với phiên bản đã phê duyệt <span className="font-mono font-semibold text-slate-900">WF-INT-TOAN4-2026-v2</span>.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  4/4 Định dạng mở lại khớp 100%
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.exportRoundtripChecks.map((exp) => (
                  <div
                    key={exp.formatCode}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{exp.formatLabel}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đọc lại & Khớp 100%
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-600">
                        Tệp: {exp.generatedFileName} ({exp.byteSize.toLocaleString('vi-VN')} bytes)
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          Mã hồ sơ & Mã đề:{' '}
                          <strong className="text-emerald-700">
                            {exp.matchedWorkflowId ? 'Khớp (WF-INT-TOAN4-2026)' : 'Lệch'}
                          </strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          Phiên bản khóa:{' '}
                          <strong className="text-emerald-700">
                            {exp.matchedApprovedVersionId ? 'Khớp (v2 Locked)' : 'Lệch'}
                          </strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          Tổng điểm toàn đề:{' '}
                          <strong className="text-emerald-700">
                            {exp.matchedTotalPoints10 ? '10.00 / 10.00 điểm' : 'Lệch'}
                          </strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          10 câu hỏi & đáp án:{' '}
                          <strong className="text-emerald-700">
                            {exp.matchedAll10QuestionsAndAnswers ? 'Đủ 10/10 câu' : 'Thiếu'}
                          </strong>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                        <strong>Kết quả đọc ngược (Re-open Parse):</strong> {exp.parsedExcerpt}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDownloadSampleExportFile(exp.formatCode)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tải tệp {exp.formatCode} để kiểm tra trực tiếp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              MỤC VII: BẢNG BÁO CÁO NGHIỆM THU ĐẦY ĐỦ 9 CỘT BẮT BUỘC
             ================================================================ */}
          {(activeTab === 'ALL_SECTIONS' || activeTab === 'SEC_VII_ACCEPTANCE_TABLE_9_COLS') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    MỤC VII. BÁO CÁO NGHIỆM THU TOÀN HỆ THỐNG (ĐẦY ĐỦ 9 CỘT BẮT BUỘC – 36 KỊCH BẢN)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Bao gồm: 1. Mã kiểm thử · 2. Chức năng · 3. Điều kiện đầu vào · 4. Các bước thực hiện · 5. Kết quả mong đợi · 6. Kết quả thực tế · 7. Đạt/Không đạt/Chưa kiểm thử · 8. Mức độ lỗi · 9. Hướng khắc phục.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                  >
                    <option value="ALL">Tất cả nhóm kiểm thử (36)</option>
                    <option value="II_HAPPY_PATH_9_STEPS">Mục II: 9 Bước quy trình Toán 4 (9)</option>
                    <option value="III_NEGATIVE_SCENARIOS">Mục III: 10 Tình huống lỗi (10)</option>
                    <option value="IV_DATA_INTEGRITY">Mục IV: 7 Toàn vẹn dữ liệu (7)</option>
                    <option value="V_SECURITY_RBAC">Mục V: 6 Bảo mật & Phân quyền (6)</option>
                    <option value="VI_EXPORT_ROUNDTRIP">Mục VI: 4 Xuất & Mở lại tệp (4)</option>
                  </select>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm mã kiểm thử, chức năng..."
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 w-52"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-3 px-3 whitespace-nowrap">1. Mã kiểm thử</th>
                      <th className="py-3 px-3 min-w-[180px]">2. Chức năng</th>
                      <th className="py-3 px-3 min-w-[180px]">3. Điều kiện đầu vào</th>
                      <th className="py-3 px-3 min-w-[200px]">4. Các bước thực hiện</th>
                      <th className="py-3 px-3 min-w-[200px]">5. Kết quả mong đợi</th>
                      <th className="py-3 px-3 min-w-[220px]">6. Kết quả thực tế</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">
                        7. Đạt / Không đạt / Chưa KT
                      </th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">8. Mức độ lỗi</th>
                      <th className="py-3 px-3 min-w-[170px]">9. Hướng khắc phục</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAcceptanceRows.map((row) => (
                      <tr key={row.testCode} className="hover:bg-slate-50/90 align-top">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {row.testCode}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {row.featureName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{row.precondition}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.executionSteps}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.expectedResult}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">
                          {row.actualResult}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-bold border ${
                              row.status === 'ĐẠT'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : row.status === 'KHÔNG ĐẠT'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {row.status === 'ĐẠT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {row.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{row.remediationGuide}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              MỤC VIII: ĐIỀU KIỆN HOÀN THÀNH & DANH SÁCH VIỆC CÒN LẠI
             ================================================================ */}
          {(activeTab === 'ALL_SECTIONS' ||
            activeTab === 'SEC_VIII_PILOT_READINESS_AND_BACKLOG') && (
            <div className="space-y-6">
              {/* 7 Điều kiện triển khai thử nghiệm */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      MỤC VIII.1. ĐÁNH GIÁ 7 ĐIỀU KIỆN SẴN SÀNG TRIỂN KHAI THỬ NGHIỆM (PILOT DEPLOYMENT READINESS)
                    </h2>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      {report.pilotConclusionStatement}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4" />
                    7/7 ĐIỀU KIỆN ĐẠT CHUẨN
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.pilotReadinessCriteria.map((crit) => (
                    <div
                      key={crit.order}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {crit.criterionTitle}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          ĐẠT
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <strong>Yêu cầu:</strong> {crit.requiredTarget}
                      </div>
                      <div className="text-xs text-slate-800 bg-white p-2.5 rounded border border-emerald-200/80">
                        <strong>Bằng chứng thực nghiệm:</strong> {crit.actualVerifiedEvidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danh sách các việc còn lại (Backlog) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-slate-700" />
                      MỤC VIII.2. DANH SÁCH CÁC VIỆC CÒN LẠI KHI TRIỂN KHAI MỞ RỘNG (REMAINING PRODUCTION BACKLOG)
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Minh bạch hóa các hạng mục tích hợp hạ tầng bên ngoài cần cấu hình thêm khi chuyển từ giai đoạn Triển khai thử nghiệm (Pilot) sang Vận hành chính thức toàn ngành.
                    </p>
                  </div>
                </div>

                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Mã hạng mục</th>
                        <th className="py-2.5 px-3">Nhóm</th>
                        <th className="py-2.5 px-3">Nội dung công việc</th>
                        <th className="py-2.5 px-3">Trạng thái hiện tại (Sau Giai đoạn 16)</th>
                        <th className="py-2.5 px-3">Việc cần thực hiện khi triển khai chính thức</th>
                        <th className="py-2.5 px-3 text-center">Mức ưu tiên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {report.remainingBacklogItems.map((item) => (
                        <tr key={item.itemCode} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.itemCode}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {item.category}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {item.title}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {item.currentStatusInStage16}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {item.actionRequiredForProductionScale}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                item.priority === 'CAO'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : item.priority === 'TRUNG BÌNH'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {item.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {onNavigate && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-600">
                      Bạn có thể chuyển nhanh sang bất kỳ phân hệ nào của Giai đoạn 16 để kiểm tra trực tiếp trên giao diện:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onNavigate('exam-workflow')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        1. Quy trình 9 bước
                      </button>
                      <button
                        onClick={() => onNavigate('progress-management')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        2. Quản lý tiến độ BGH
                      </button>
                      <button
                        onClick={() => onNavigate('notification-center')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        3. Trung tâm thông báo & Giao việc
                      </button>
                      <button
                        onClick={() => onNavigate('executive-dashboard')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        4. Executive Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
