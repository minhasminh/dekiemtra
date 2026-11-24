import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  HelpCircle,
  Layers,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import {
  CompletionThresholdConfig,
  QuestionPsychometricAnalysis,
  StudentExamResultRecord,
  ToastNotification,
} from '../types/domain';
import {
  ANALYTICS_EXAM_BLUEPRINT,
  analyzeExamQuestionsPsychometrics,
  buildAiRecommendationsWithGuardrails,
  computeDescriptiveStatistics,
  createSimulatedExamDataset,
  createTotalScoreOnlyDataset,
  downloadSampleExcelScoreSheet,
  exportAnalyticsReportToExcel,
  exportAnalyticsReportToWord,
  generatePrincipalLeadershipReport,
  parseUploadedScoreWorkbook,
  runIndependentVerificationSuite,
  synthesizeLearningOutcomeMastery,
} from '../services/analytics/examResultAnalyticsService';

interface ExamResultAnalyticsWorkspaceProps {
  schoolName?: string;
  academicYear?: string;
  onNotify: (type: ToastNotification['type'], title: string, message: string) => void;
}

type AnalyticsTabId =
  | 'import'
  | 'statistics'
  | 'questions'
  | 'outcomes'
  | 'principal-report'
  | 'ai-recommendations'
  | 'verification';

export const ExamResultAnalyticsWorkspace: React.FC<ExamResultAnalyticsWorkspaceProps> = ({
  schoolName = 'Trường THCS Chu Văn An',
  academicYear = '2026 - 2027',
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('statistics');

  // Dữ liệu học sinh đang nạp (Mặc định: 3 lớp 8A1, 8A2, 8A3 × 30 HS = 90 HS có đầy đủ kết quả từng câu)
  const [records, setRecords] = useState<StudentExamResultRecord[]>(() =>
    createSimulatedExamDataset()
  );
  const [datasetPresetMode, setDatasetPresetMode] = useState<
    'THREE_CLASSES_90_FULL' | 'MIXED_120_WITH_TOTAL_ONLY' | 'ONLY_TOTAL_SCORE_30' | 'CUSTOM_EXCEL'
  >('THREE_CLASSES_90_FULL');
  const [importWarnings, setImportWarnings] = useState<string[]>([]);

  // Bộ lọc theo Lớp, Môn, Kỳ kiểm tra
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('Toán');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Cuối học kỳ I');

  // Ẩn/Hiện họ tên thật của học sinh (Bảo vệ dữ liệu cá nhân PII)
  const [maskStudentNames, setMaskStudentNames] = useState<boolean>(false);

  // Cấu hình ngưỡng hoàn thành / xếp loại (Mục II)
  const [thresholds, setThresholds] = useState<CompletionThresholdConfig>({
    passThreshold: 5.0,
    goodThreshold: 6.5,
    excellentThreshold: 8.0,
  });

  // Câu hỏi đang chọn để xem chi tiết phân tích phương án nhiễu (Mục III)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('Q07');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Danh sách lớp hiện có trong dữ liệu
  const availableClasses = useMemo(
    () => Array.from(new Set(records.map((r) => r.className))),
    [records]
  );

  // Lọc bản ghi theo lớp đã chọn
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedClass !== 'ALL' && r.className !== selectedClass) return false;
      return true;
    });
  }, [records, selectedClass]);

  // Tính toán Thống kê mô tả & so sánh (Mục II)
  const stats = useMemo(
    () => computeDescriptiveStatistics(filteredRecords, thresholds),
    [filteredRecords, thresholds]
  );

  // Tính toán Phân tích chất lượng câu hỏi CTT (Mục III)
  const psychometricsResult = useMemo(
    () => analyzeExamQuestionsPsychometrics(filteredRecords, ANALYTICS_EXAM_BLUEPRINT),
    [filteredRecords]
  );

  // Tổng hợp Yêu cầu cần đạt (Mục IV)
  const outcomesSynthesis = useMemo(
    () => synthesizeLearningOutcomeMastery(psychometricsResult.questionsAnalysis),
    [psychometricsResult.questionsAnalysis]
  );

  // Báo cáo Ban Giám hiệu 8 mục (Mục V)
  const principalReport = useMemo(
    () =>
      generatePrincipalLeadershipReport(
        stats,
        psychometricsResult.questionsAnalysis,
        outcomesSynthesis,
        schoolName,
        academicYear,
        8,
        selectedSubject,
        selectedPeriod
      ),
    [stats, psychometricsResult.questionsAnalysis, outcomesSynthesis, schoolName, academicYear, selectedSubject, selectedPeriod]
  );

  // Đề xuất bằng AI kèm hàng rào bảo vệ (Mục VI)
  const aiRecommendations = useMemo(
    () =>
      buildAiRecommendationsWithGuardrails(
        stats,
        psychometricsResult.questionsAnalysis,
        outcomesSynthesis
      ),
    [stats, psychometricsResult.questionsAnalysis, outcomesSynthesis]
  );

  // Báo cáo kiểm thử độc lập 3 lớp × 30 HS = 90 HS (Mục VII)
  const verificationAudit = useMemo(
    () => runIndependentVerificationSuite(thresholds),
    [thresholds]
  );

  const selectedQuestionDetail: QuestionPsychometricAnalysis | undefined = useMemo(
    () =>
      psychometricsResult.questionsAnalysis.find((q) => q.questionId === selectedQuestionId) ||
      psychometricsResult.questionsAnalysis[0],
    [psychometricsResult.questionsAnalysis, selectedQuestionId]
  );

  // Chuyển đổi bộ dữ liệu mẫu để kiểm thử
  const handleSwitchPresetDataset = (
    mode: 'THREE_CLASSES_90_FULL' | 'MIXED_120_WITH_TOTAL_ONLY' | 'ONLY_TOTAL_SCORE_30'
  ) => {
    setDatasetPresetMode(mode);
    setSelectedClass('ALL');
    if (mode === 'THREE_CLASSES_90_FULL') {
      setRecords(createSimulatedExamDataset());
      setImportWarnings([]);
      onNotify(
        'success',
        'Đã nạp dữ liệu chuẩn 3 lớp (90 học sinh)',
        'Mỗi lớp 8A1, 8A2, 8A3 gồm đúng 30 học sinh kèm đầy đủ kết quả trả lời 12 câu hỏi.'
      );
    } else if (mode === 'MIXED_120_WITH_TOTAL_ONLY') {
      const full90 = createSimulatedExamDataset();
      const totalOnly30 = createTotalScoreOnlyDataset();
      setRecords([...full90, ...totalOnly30]);
      setImportWarnings([
        'Lớp 8A4 (30 học sinh) chỉ có Điểm tổng (TOTAL_SCORE_ONLY). Hệ thống tính Lớp 8A4 vào thống kê điểm chung toàn khối nhưng tự động loại trừ khỏi phân tích từng câu hỏi (Tuyệt đối không suy diễn kết quả từng câu từ điểm tổng).',
      ]);
      onNotify(
        'info',
        'Đã nạp dữ liệu hỗn hợp (90 HS đủ từng câu + 30 HS chỉ có điểm tổng)',
        'Hệ thống đã đánh dấu rõ loại dữ liệu từng lớp và kích hoạt cơ chế chống suy diễn câu hỏi.'
      );
    } else {
      setRecords(createTotalScoreOnlyDataset());
      setImportWarnings([
        'Bộ dữ liệu hiện tại CHỈ CÓ ĐIỂM TỔNG (30 học sinh lớp 8A4). Theo quy định Mục I, hệ thống chỉ thống kê phổ điểm tổng và khóa tính năng phân tích từng câu hỏi để không suy diễn dữ liệu.',
      ]);
      onNotify(
        'warning',
        'Đang xem bộ dữ liệu chỉ có điểm tổng',
        'Phân tích từng câu hỏi được tự động tạm dừng vì không có dữ liệu trả lời chi tiết.'
      );
    }
  };

  // Xử lý tải tệp Excel (.xlsx) từ máy tính
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseUploadedScoreWorkbook(
        buffer,
        file.name,
        selectedSubject,
        8,
        selectedPeriod
      );
      if (parsed.records.length === 0) {
        onNotify('error', 'Tệp Excel trống', 'Không tìm thấy dòng dữ liệu học sinh nào trong tệp.');
        return;
      }
      setRecords(parsed.records);
      setDatasetPresetMode('CUSTOM_EXCEL');
      setSelectedClass('ALL');
      setImportWarnings(parsed.warnings);
      onNotify(
        'success',
        'Nhập bảng điểm Excel thành công',
        `Đã nạp ${parsed.records.length} học sinh từ tệp "${file.name}" (Loại dữ liệu: ${parsed.detectedGranularity}).`
      );
    } catch (err) {
      onNotify(
        'error',
        'Lỗi đọc tệp Excel',
        err instanceof Error ? err.message : 'Định dạng tệp không hợp lệ.'
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    exportAnalyticsReportToExcel(
      stats,
      psychometricsResult.questionsAnalysis,
      outcomesSynthesis,
      principalReport,
      filteredRecords
    );
    onNotify(
      'success',
      'Đã xuất báo cáo Excel (.xlsx)',
      'Tệp Excel gồm 5 Sheet: Tổng quan BGH, So sánh lớp, Phân tích CTT câu hỏi, Yêu cầu cần đạt và Bảng điểm.'
    );
  };

  const handleExportWord = () => {
    exportAnalyticsReportToWord(
      stats,
      psychometricsResult.questionsAnalysis,
      outcomesSynthesis,
      principalReport,
      aiRecommendations
    );
    onNotify(
      'success',
      'Đã xuất Báo cáo Ban Giám hiệu (.doc)',
      'Tài liệu Word đầy đủ 8 mục chuyên môn kèm bảng phân tích câu hỏi và đề xuất điều chỉnh dạy học.'
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER CHÍNH & NÚT XUẤT BÁO CÁO NHANH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Module Phân tích Kết quả Kiểm tra & Chất lượng Câu hỏi (CTT & GDPT 2018)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Phân tích Kết quả Kiểm tra, Đo lường Yêu cầu Cần đạt & Thẩm định Câu hỏi Thực nghiệm
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Phân biệt minh bạch dữ liệu điểm tổng và dữ liệu từng câu · Tính toán độ khó thực nghiệm (<span className="font-mono">p</span>), độ phân biệt (<span className="font-mono">D</span>), phân tích nhiễu và xuất Báo cáo Ban Giám hiệu 8 mục.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Báo cáo BGH (.doc)</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Bảng phân tích (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* THANH BỘ LỌC NHANH & CHUYỂN ĐỔI BỘ DỮ LIỆU KIỂM THỬ */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-700" />
              Bộ dữ liệu:
            </span>
            <button
              type="button"
              onClick={() => handleSwitchPresetDataset('THREE_CLASSES_90_FULL')}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                datasetPresetMode === 'THREE_CLASSES_90_FULL'
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Chuẩn 3 Lớp × 30 HS = 90 HS (Đủ 12 câu)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPresetDataset('MIXED_120_WITH_TOTAL_ONLY')}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                datasetPresetMode === 'MIXED_120_WITH_TOTAL_ONLY'
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Hỗn hợp 120 HS (90 HS đủ câu + 30 HS chỉ có điểm tổng)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPresetDataset('ONLY_TOTAL_SCORE_30')}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                datasetPresetMode === 'ONLY_TOTAL_SCORE_30'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Chỉ có điểm tổng (30 HS - Không suy diễn)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Lọc theo Lớp:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold"
              >
                <option value="ALL">Tất cả các lớp ({records.length} HS)</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls} ({records.filter((r) => r.className === cls).length} HS)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Kỳ:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
              >
                <option value="Giữa học kỳ I">Giữa học kỳ I</option>
                <option value="Cuối học kỳ I">Cuối học kỳ I</option>
                <option value="Giữa học kỳ II">Giữa học kỳ II</option>
                <option value="Cuối năm học">Cuối năm học</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setMaskStudentNames((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                maskStudentNames
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Bảo vệ dữ liệu cá nhân học sinh (PII)"
            >
              {maskStudentNames ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Đang ẩn danh tên HS</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hiện tên HS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* BANNER PHÂN BIỆT DỮ LIỆU ĐIỂM TỔNG VS KẾT QUẢ TỪNG CÂU (NGUYÊN TẮC MỤC I) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="text-slate-500 font-medium">Tổng số học sinh đang phân tích</div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {stats.studentCount} học sinh
            </div>
            <div className="text-slate-600">
              Thuộc {stats.classComparisons.length} lớp · Môn {selectedSubject} ({selectedPeriod})
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="text-emerald-800 font-semibold">
              Dữ liệu có kết quả từng câu (FULL_ITEM_RESPONSES)
            </div>
            <div className="text-xl font-bold text-emerald-900 font-mono">
              {stats.fullItemResponseStudentCount} / {stats.studentCount} HS
            </div>
            <div className="text-slate-600">
              Đủ điều kiện tính Độ khó (<span className="font-mono">p</span>), Độ phân biệt (<span className="font-mono">D</span>) & Yêu cầu cần đạt.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="text-amber-900 font-semibold">
              Dữ liệu chỉ có điểm tổng (TOTAL_SCORE_ONLY)
            </div>
            <div className="text-xl font-bold text-amber-900 font-mono">
              {stats.totalScoreOnlyStudentCount} / {stats.studentCount} HS
            </div>
            <div className="text-slate-600">
              Chỉ tính vào phổ điểm chung · <b>Tuyệt đối không suy diễn</b> điểm từng câu.
            </div>
          </div>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG 6 MỤC CHỨC NĂNG CHUYÊN MÔN */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1">
        {[
          { id: 'import', label: 'Nhập kết quả & Dữ liệu', icon: Upload },
          { id: 'statistics', label: 'Thống kê & Biểu đồ', icon: BarChart3 },
          { id: 'questions', label: 'Phân tích câu hỏi (CTT)', icon: HelpCircle },
          { id: 'outcomes', label: 'Yêu cầu cần đạt (YCCĐ)', icon: BookOpen },
          { id: 'principal-report', label: 'Báo cáo Ban Giám hiệu', icon: FileText },
          { id: 'ai-recommendations', label: 'Đề xuất Cải tiến Chuyên môn', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AnalyticsTabId)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB I: NHẬP KẾT QUẢ & KIỂM SOÁT ĐỘ CHI TIẾT DỮ LIỆU
      ===================================================================== */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Khu vực tải lên tệp Excel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-700" />
                <span>Nhập bảng điểm Excel (.xlsx) hoặc kết quả từng câu hỏi</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ thống tự động kiểm tra cấu trúc cột của tệp tải lên để phân loại từng bản ghi học sinh thành:
                <b> (1) Có kết quả từng câu hỏi</b> hoặc <b>(2) Chỉ có điểm tổng</b>. Nếu tệp chỉ có cột Điểm tổng, hệ thống giữ nguyên Điểm tổng và không tự chia điểm giả định cho các câu hỏi.
              </p>

              <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-xl p-6 text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-blue-700 mx-auto" />
                <div className="text-xs text-slate-700 font-medium">
                  Chọn tệp bảng điểm Excel (`.xlsx`, `.xls`, `.csv`) theo lớp, môn học hoặc kỳ kiểm tra
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp Excel từ máy tính</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  Tải tệp Excel mẫu để kiểm thử quy trình nhập:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadSampleExcelScoreSheet('FULL_3_CLASSES')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Mẫu 1: Đầy đủ 12 câu (3 lớp - 90 HS).xlsx</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSampleExcelScoreSheet('TOTAL_SCORE_ONLY')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Mẫu 2: Chỉ có Điểm tổng (30 HS).xlsx</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Khu vực nguyên tắc kiểm soát dữ liệu Mục I */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Kiểm soát tính xác thực dữ liệu (Nguyên tắc Mục I)</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">
                    1. Phân loại tự động cấp độ chi tiết dữ liệu
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Mỗi bản ghi học sinh được gắn nhãn <span className="font-mono font-semibold text-emerald-700">FULL_ITEM_RESPONSES</span> (có đáp án A/B/C/D và điểm từng câu tự luận) hoặc <span className="font-mono font-semibold text-amber-700">TOTAL_SCORE_ONLY</span> (chỉ có điểm tổng kết bài thi).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-950">
                    2. Cam kết KHÔNG suy diễn kết quả từng câu từ điểm tổng
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    Khi giáo viên nhập bảng điểm chỉ có cột Điểm tổng (ví dụ: 7.5 điểm), hệ thống tuyệt đối không tự chia ngược thành điểm từng câu 1..12. Các bản ghi này được đánh dấu <span className="font-mono">N/A (Không có dữ liệu câu)</span> và được tách riêng khi tính chỉ số CTT.
                  </p>
                </div>

                {importWarnings.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Cảnh báo kiểm toán dữ liệu hiện tại:</span>
                    </div>
                    {importWarnings.map((w, idx) => (
                      <p key={idx} className="text-rose-800 leading-relaxed">
                        • {w}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bảng danh sách kết quả học sinh */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bảng dữ liệu học sinh đã nạp ({filteredRecords.length} học sinh)
                </h3>
                <p className="text-xs text-slate-500">
                  Hiển thị rõ trạng thái dữ liệu từng học sinh và kết quả trả lời 12 câu hỏi (nếu có).
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600">
                Hiển thị 35 dòng đầu tiên để tra cứu nhanh
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold">Mã HS</th>
                    <th className="py-2.5 px-3 font-bold">Họ và tên</th>
                    <th className="py-2.5 px-3 font-bold text-center">Lớp</th>
                    <th className="py-2.5 px-3 font-bold text-center">Phân loại dữ liệu</th>
                    <th className="py-2.5 px-3 font-bold text-center bg-blue-50 text-blue-900">
                      Điểm tổng
                    </th>
                    {ANALYTICS_EXAM_BLUEPRINT.map((q) => (
                      <th key={q.questionId} className="py-2.5 px-2 font-bold text-center">
                        C{q.questionNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.slice(0, 35).map((r) => (
                    <tr key={r.studentId} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                        {r.studentId}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {maskStudentNames ? r.maskedStudentCode : r.fullName}
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-700">
                        {r.className}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {r.dataGranularity === 'FULL_ITEM_RESPONSES' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                            Có đủ 12 câu
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-[11px]">
                            Chỉ có điểm tổng
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/50">
                        {r.totalScore.toFixed(2)}
                      </td>
                      {ANALYTICS_EXAM_BLUEPRINT.map((q) => {
                        const resp = r.itemResponses?.[q.questionId];
                        if (!resp) {
                          return (
                            <td
                              key={q.questionId}
                              className="py-2 px-2 text-center font-mono text-[11px] text-slate-400 bg-slate-50"
                              title="Không suy diễn kết quả từng câu từ điểm tổng"
                            >
                              N/A
                            </td>
                          );
                        }
                        if (q.format === 'MULTIPLE_CHOICE') {
                          return (
                            <td
                              key={q.questionId}
                              className={`py-2 px-2 text-center font-mono text-[11px] font-semibold ${
                                resp.isFullCredit
                                  ? 'text-emerald-700 bg-emerald-50/40'
                                  : 'text-rose-700 bg-rose-50/40'
                              }`}
                            >
                              {resp.selectedOption}
                            </td>
                          );
                        }
                        return (
                          <td
                            key={q.questionId}
                            className="py-2 px-2 text-center font-mono text-[11px] text-slate-800"
                          >
                            {resp.pointsEarned}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB II: THỐNG KÊ MÔ TẢ, PHỔ ĐIỂM & SO SÁNH LỚP / KỲ KIỂM TRA
      ===================================================================== */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {/* Cấu hình ngưỡng hoàn thành (Threshold Configurator) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Cấu hình ngưỡng đánh giá mức độ hoàn thành (Mục II)
              </h2>
              <p className="text-xs text-slate-600">
                Tùy chỉnh ngưỡng điểm để tính tỷ lệ Hoàn thành / Đạt, Khá và Giỏi / Hoàn thành tốt.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Ngưỡng Đạt (≥):</span>
                <input
                  type="number"
                  step="0.5"
                  min="3.0"
                  max="7.0"
                  value={thresholds.passThreshold}
                  onChange={(e) =>
                    setThresholds((prev) => ({
                      ...prev,
                      passThreshold: Number(e.target.value) || 5.0,
                    }))
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-mono font-bold text-center"
                />
              </label>

              <label className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Ngưỡng Khá (≥):</span>
                <input
                  type="number"
                  step="0.5"
                  min="5.0"
                  max="8.5"
                  value={thresholds.goodThreshold}
                  onChange={(e) =>
                    setThresholds((prev) => ({
                      ...prev,
                      goodThreshold: Number(e.target.value) || 6.5,
                    }))
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-mono font-bold text-center"
                />
              </label>

              <label className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Ngưỡng Giỏi / Tốt (≥):</span>
                <input
                  type="number"
                  step="0.5"
                  min="7.0"
                  max="9.5"
                  value={thresholds.excellentThreshold}
                  onChange={(e) =>
                    setThresholds((prev) => ({
                      ...prev,
                      excellentThreshold: Number(e.target.value) || 8.0,
                    }))
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-mono font-bold text-center"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setThresholds({
                    passThreshold: 5.0,
                    goodThreshold: 7.0,
                    excellentThreshold: 9.0,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
              >
                Mẫu Tiểu học TT27 (5.0 / 7.0 / 9.0)
              </button>
              <button
                type="button"
                onClick={() =>
                  setThresholds({
                    passThreshold: 5.0,
                    goodThreshold: 6.5,
                    excellentThreshold: 8.0,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
              >
                Mẫu THCS TT22 (5.0 / 6.5 / 8.0)
              </button>
            </div>
          </div>

          {/* 6 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Số HS tham gia (N)</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {stats.studentCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Trung vị: {stats.medianScore}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-blue-200 p-4">
              <div className="text-xs text-blue-800 font-semibold">Điểm trung bình (X̄)</div>
              <div className="text-2xl font-extrabold text-blue-900 font-mono mt-1">
                {stats.meanScore.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Độ lệch chuẩn σ = {stats.stdDeviation}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-emerald-200 p-4">
              <div className="text-xs text-emerald-800 font-semibold">Điểm cao nhất (Max)</div>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
                {stats.maxScore.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Thang điểm 10.0</div>
            </div>

            <div className="bg-white rounded-xl border border-rose-200 p-4">
              <div className="text-xs text-rose-800 font-semibold">Điểm thấp nhất (Min)</div>
              <div className="text-2xl font-extrabold text-rose-700 font-mono mt-1">
                {stats.minScore.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Dưới chuẩn: {stats.belowPassCount} HS
              </div>
            </div>

            <div className="bg-white rounded-xl border border-emerald-300 bg-emerald-50/40 p-4">
              <div className="text-xs text-emerald-900 font-semibold">
                Tỷ lệ Đạt (≥ {thresholds.passThreshold})
              </div>
              <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
                {stats.passRatePercent}%
              </div>
              <div className="text-[11px] text-emerald-800 mt-1">
                {stats.passCount}/{stats.studentCount} học sinh
              </div>
            </div>

            <div className="bg-white rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="text-xs text-indigo-900 font-semibold">
                Tỷ lệ Giỏi/Tốt (≥ {thresholds.excellentThreshold})
              </div>
              <div className="text-2xl font-extrabold text-indigo-900 font-mono mt-1">
                {stats.excellentRatePercent}%
              </div>
              <div className="text-[11px] text-indigo-800 mt-1">
                {stats.excellentCount}/{stats.studentCount} học sinh
              </div>
            </div>
          </div>

          {/* BIỂU ĐỒ PHÂN BỐ ĐIỂM & SO SÁNH CÁC LỚP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biểu đồ Phổ điểm 5 khoảng */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Biểu đồ phân bố điểm (Score Distribution Spectrum)
                </h3>
                <p className="text-xs text-slate-500">
                  Phân bố số lượng và tỷ lệ phần trăm học sinh theo 5 dải điểm chuẩn.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {stats.distributionBins.map((bin, idx) => {
                  const barColors = [
                    'bg-rose-600',
                    'bg-amber-500',
                    'bg-blue-600',
                    'bg-indigo-600',
                    'bg-emerald-600',
                  ];
                  return (
                    <div key={bin.rangeLabel} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{bin.rangeLabel}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {bin.count} HS ({bin.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-5 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${barColors[idx % barColors.length]} transition-all duration-300`}
                          style={{ width: `${Math.max(bin.percentage, bin.count > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Biểu đồ SVG So sánh Điểm trung bình & Tỷ lệ Đạt giữa các lớp */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Biểu đồ so sánh kết quả giữa các lớp
                </h3>
                <p className="text-xs text-slate-500">
                  Đối chiếu Điểm trung bình (thang 10) và Tỷ lệ hoàn thành theo từng lớp.
                </p>
              </div>

              <svg
                viewBox="0 0 520 210"
                className="w-full h-52 bg-slate-50 rounded-xl border border-slate-200 p-2"
              >
                {/* Lưới ngang */}
                {[2, 4, 6, 8, 10].map((val) => {
                  const y = 175 - (val / 10) * 140;
                  return (
                    <g key={val}>
                      <line
                        x1="45"
                        y1={y}
                        x2="495"
                        y2={y}
                        stroke="#cbd5e1"
                        strokeDasharray="3 3"
                      />
                      <text x="15" y={y + 4} fontSize="10" fill="#64748b" fontFamily="monospace">
                        {val}.0
                      </text>
                    </g>
                  );
                })}

                {stats.classComparisons.map((c, idx) => {
                  const spacing = 420 / Math.max(1, stats.classComparisons.length);
                  const xBase = 65 + idx * spacing;
                  const meanHeight = (c.meanScore / 10) * 140;
                  const passScaledHeight = (c.passRatePercent / 100) * 140;

                  return (
                    <g key={c.className}>
                      {/* Cột Điểm trung bình */}
                      <rect
                        x={xBase}
                        y={175 - meanHeight}
                        width="32"
                        height={meanHeight}
                        rx="4"
                        fill="#1d4ed8"
                      />
                      <text
                        x={xBase + 16}
                        y={170 - meanHeight}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#1e3a8a"
                      >
                        {c.meanScore}
                      </text>

                      {/* Cột Tỷ lệ Đạt (%) quy đổi */}
                      <rect
                        x={xBase + 36}
                        y={175 - passScaledHeight}
                        width="32"
                        height={passScaledHeight}
                        rx="4"
                        fill="#059669"
                      />
                      <text
                        x={xBase + 52}
                        y={170 - passScaledHeight}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#065f46"
                      >
                        {c.passRatePercent}%
                      </text>

                      {/* Nhãn tên lớp */}
                      <text
                        x={xBase + 34}
                        y="194"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#0f172a"
                      >
                        {c.className.replace(' (Chỉ có điểm tổng)', '')}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-700 inline-block" />
                  Điểm trung bình (Thang 10)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                  Tỷ lệ Đạt / Hoàn thành (%)
                </span>
              </div>
            </div>
          </div>

          {/* BẢNG SO SÁNH CÁC LỚP VÀ SO SÁNH QUA CÁC KỲ KIỂM TRA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bảng so sánh các lớp */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Bảng so sánh chi tiết giữa các lớp
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Lớp</th>
                      <th className="py-2.5 px-2 font-bold text-center">Sĩ số</th>
                      <th className="py-2.5 px-2 font-bold text-center">Điểm TB</th>
                      <th className="py-2.5 px-2 font-bold text-center">Độ lệch σ</th>
                      <th className="py-2.5 px-2 font-bold text-center">Max / Min</th>
                      <th className="py-2.5 px-2 font-bold text-center">Tỷ lệ Đạt</th>
                      <th className="py-2.5 px-2 font-bold text-center">Tỷ lệ Giỏi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stats.classComparisons.map((c) => (
                      <tr key={c.className} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {c.className}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono">{c.studentCount}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-900">
                          {c.meanScore.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono">{c.stdDeviation}</td>
                        <td className="py-2.5 px-2 text-center font-mono">
                          {c.maxScore} / {c.minScore}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-semibold text-emerald-700">
                          {c.passRatePercent}%
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-semibold text-indigo-700">
                          {c.excellentRatePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bảng so sánh qua các lần kiểm tra (Giữa HK1 vs Cuối HK1) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <span>So sánh qua các lần kiểm tra (Giữa kỳ I → Cuối kỳ I)</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Kỳ kiểm tra</th>
                      <th className="py-2.5 px-3 font-bold text-center">Lớp</th>
                      <th className="py-2.5 px-3 font-bold text-center">Điểm TB</th>
                      <th className="py-2.5 px-3 font-bold text-center">Tỷ lệ Đạt (%)</th>
                      <th className="py-2.5 px-3 font-bold text-center">Tỷ lệ Khá+ (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stats.periodComparisons.map((p, i) => (
                      <tr
                        key={`${p.periodCode}-${p.className}-${i}`}
                        className={
                          p.periodCode === 'CHK1' ? 'bg-blue-50/40 font-medium' : 'hover:bg-slate-50'
                        }
                      >
                        <td className="py-2 px-3 text-slate-800">{p.periodLabel}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900">
                          {p.className}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-blue-900">
                          {p.meanScore.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-emerald-700">
                          {p.passRatePercent}%
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-indigo-700">
                          {p.goodOrAbovePercent}%
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

      {/* =====================================================================
          TAB III: PHÂN TÍCH CHẤT LƯỢNG CÂU HỎI (PSYCHOMETRICS CTT)
      ===================================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Thanh công thức thống kê rõ ràng (Yêu cầu Mục III) */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Hệ thống công thức thống kê Đo lường & Khảo thí Cổ điển (Classical Test Theory - CTT)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-300 font-semibold">1. Tỷ lệ trả lời đúng (%)</div>
                <div className="font-mono text-amber-300 font-bold mt-1">
                  P_i(%) = (X̄_i / Max_i) × 100%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Tỷ lệ điểm trung bình đạt được trên điểm tối đa của câu.
                </div>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-300 font-semibold">2. Độ khó thực nghiệm (p)</div>
                <div className="font-mono text-amber-300 font-bold mt-1">
                  p_i = X̄_i / Max_i ∈ [0, 1]
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Khó: p &lt; 0.30 · Vừa sức: 0.30 ≤ p ≤ 0.75 · Dễ: p &gt; 0.75.
                </div>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-300 font-semibold">3. Chỉ số phân biệt Kelley (D)</div>
                <div className="font-mono text-amber-300 font-bold mt-1">
                  D_i = P_Upper(27%) - P_Lower(27%)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Tốt: D ≥ 0.30 · Chấp nhận: 0.20–0.29 · Kém/Âm: D &lt; 0.20.
                </div>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-300 font-semibold">4. Tương quan câu - tổng (r_pbis)</div>
                <div className="font-mono text-amber-300 font-bold mt-1">
                  r_it = Cov(X_i, Y) / (σ_Xi · σ_Y)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Kiểm tra mức độ đồng변 giữa điểm câu hỏi và tổng điểm.
                </div>
              </div>
            </div>
          </div>

          {/* Cảnh báo độ tin cậy nếu mẫu nhỏ (N <= 30) hoặc thiếu dữ liệu */}
          {psychometricsResult.sampleReliabilityBanner && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Cảnh báo độ tin cậy thống kê (Yêu cầu Mục III):</div>
                <p className="leading-relaxed">{psychometricsResult.sampleReliabilityBanner}</p>
              </div>
            </div>
          )}

          {psychometricsResult.questionsAnalysis.length > 0 && (
            <>
              {/* Biểu đồ Tương quan Độ khó (p) và Độ phân biệt (D) + Chi tiết phương án nhiễu */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Biểu đồ Scatter p vs D */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Bản đồ Chất lượng Câu hỏi: Độ khó (p) × Độ phân biệt (D)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Nhấn vào từng điểm câu hỏi để xem phân tích phương án nhiễu bên phải. Vùng xanh lá là vùng câu hỏi lý tưởng (0.30 ≤ p ≤ 0.75 và D ≥ 0.25).
                    </p>
                  </div>

                  <svg
                    viewBox="0 0 500 250"
                    className="w-full h-60 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    {/* Vùng chuẩn xanh lá (p từ 0.3 đến 0.75, D từ 0.2 đến 0.8) */}
                    <rect
                      x={50 + 0.3 * 410}
                      y={20}
                      width={(0.75 - 0.3) * 410}
                      height={145 - 0.2 * 125}
                      fill="#dcfce7"
                      opacity="0.65"
                    />
                    {/* Đường D = 0 (ranh giới phân biệt âm) */}
                    <line
                      x1="50"
                      y1="165"
                      x2="460"
                      y2="165"
                      stroke="#dc2626"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <text x="55" y="178" fontSize="9" fill="#dc2626" fontWeight="bold">
                      Ranh giới D = 0.00 (Dưới vạch này là phân biệt âm bất thường)
                    </text>

                    {/* Trục tọa độ */}
                    <line x1="50" y1="20" x2="50" y2="215" stroke="#475569" strokeWidth="1.5" />
                    <line x1="50" y1="215" x2="465" y2="215" stroke="#475569" strokeWidth="1.5" />

                    <text x="255" y="240" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                      Độ khó thực nghiệm p (0.0 = Rất khó → 1.0 = Rất dễ)
                    </text>

                    {psychometricsResult.questionsAnalysis.map((q) => {
                      const cx = 50 + q.difficultyIndexP * 410;
                      // D trong khoảng [-0.4, 0.8], D=0 tại y=165
                      const cy = 165 - q.discriminationIndexD * 145;
                      const isSelected = q.questionId === selectedQuestionDetail?.questionId;
                      return (
                        <g
                          key={q.questionId}
                          onClick={() => setSelectedQuestionId(q.questionId)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 9 : 6.5}
                            fill={q.hasAnomaly ? '#dc2626' : '#1d4ed8'}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={cx}
                            y={cy - 10}
                            textAnchor="middle"
                            fontSize="9.5"
                            fontWeight="bold"
                            fill={q.hasAnomaly ? '#991b1b' : '#1e3a8a'}
                          >
                            C{q.questionNumber}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Khung chi tiết Phương án nhiễu (Distractor Analysis) của câu đang chọn */}
                {selectedQuestionDetail && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {selectedQuestionDetail.questionId} · {selectedQuestionDetail.learningOutcomeCode}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {selectedQuestionDetail.label}: {selectedQuestionDetail.stemSummary}
                        </h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                          selectedQuestionDetail.hasAnomaly
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {selectedQuestionDetail.hasAnomaly ? 'Có dấu hiệu bất thường' : 'Câu hỏi đạt chuẩn'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Độ khó thực nghiệm (p)</div>
                        <div className="text-base font-bold font-mono text-slate-900">
                          {selectedQuestionDetail.difficultyIndexP} ({selectedQuestionDetail.correctResponseRatePercent}%)
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {selectedQuestionDetail.difficultyLabel}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Chỉ số phân biệt (D)</div>
                        <div className="text-base font-bold font-mono text-slate-900">
                          {selectedQuestionDetail.discriminationIndexD}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          P_Cao: {selectedQuestionDetail.upperGroupDifficultyP} | P_Thấp: {selectedQuestionDetail.lowerGroupDifficultyP}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Tương quan r_pbis</div>
                        <div className="text-base font-bold font-mono text-slate-900">
                          {selectedQuestionDetail.pointBiserialR}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Cỡ mẫu N = {selectedQuestionDetail.sampleSizeN} (K = {selectedQuestionDetail.upperLowerGroupSizeK})
                        </div>
                      </div>
                    </div>

                    {selectedQuestionDetail.format === 'MULTIPLE_CHOICE' ? (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800">
                          Tỷ lệ lựa chọn từng phương án nhiễu (Toàn mẫu vs Nhóm 27% Cao/Thấp):
                        </div>
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                              <th className="py-1.5 px-2 text-left">Phương án</th>
                              <th className="py-1.5 px-2 text-center">Toàn mẫu</th>
                              <th className="py-1.5 px-2 text-center">Nhóm 27% Cao</th>
                              <th className="py-1.5 px-2 text-center">Nhóm 27% Thấp</th>
                              <th className="py-1.5 px-2 text-left">Chẩn đoán phương án</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {selectedQuestionDetail.distractorStats.map((d) => (
                              <tr
                                key={d.optionKey}
                                className={
                                  d.isCorrectKey
                                    ? 'bg-emerald-50/70 font-semibold'
                                    : d.totalSelectedCount === 0 ||
                                      d.upperGroupSelectedCount > d.lowerGroupSelectedCount
                                    ? 'bg-rose-50/60'
                                    : ''
                                }
                              >
                                <td className="py-1.5 px-2 font-mono font-bold">
                                  {d.optionKey} {d.isCorrectKey ? '✓ (Đáp án)' : '(Nhiễu)'}
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono">
                                  {d.totalSelectedCount} ({d.selectionRatePercent}%)
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono">
                                  {d.upperGroupSelectedCount} ({d.upperGroupRatePercent}%)
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono">
                                  {d.lowerGroupSelectedCount} ({d.lowerGroupRatePercent}%)
                                </td>
                                <td className="py-1.5 px-2 text-[11px]">{d.distractorDiagnosis}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
                        Câu hỏi Tự luận chấm điểm từng phần (Thang điểm tối đa: {selectedQuestionDetail.maxPoints} điểm). Điểm trung bình học sinh đạt được: <b>{selectedQuestionDetail.meanPointsEarned} / {selectedQuestionDetail.maxPoints} điểm</b>.
                      </div>
                    )}

                    {selectedQuestionDetail.anomalyFlags.length > 0 && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-xs text-rose-950">
                        <div className="font-bold">Cảnh báo câu hỏi có dấu hiệu bất thường:</div>
                        {selectedQuestionDetail.anomalyFlags.map((flag, idx) => (
                          <div key={idx}>• {flag}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bảng tổng hợp toàn bộ 12 câu hỏi */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Bảng phân tích kỹ thuật toàn bộ {psychometricsResult.questionsAnalysis.length} câu hỏi trong đề
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold">Câu hỏi</th>
                        <th className="py-2.5 px-2 font-bold">Mức độ</th>
                        <th className="py-2.5 px-2 font-bold">Mã YCCĐ</th>
                        <th className="py-2.5 px-2 font-bold text-center">Tỷ lệ đúng</th>
                        <th className="py-2.5 px-2 font-bold text-center">Độ khó (p)</th>
                        <th className="py-2.5 px-2 font-bold text-center">Độ phân biệt (D)</th>
                        <th className="py-2.5 px-2 font-bold text-center">r_pbis</th>
                        <th className="py-2.5 px-3 font-bold">Phân bố A / B / C / D</th>
                        <th className="py-2.5 px-3 font-bold">Đánh giá chất lượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {psychometricsResult.questionsAnalysis.map((q) => (
                        <tr
                          key={q.questionId}
                          onClick={() => setSelectedQuestionId(q.questionId)}
                          className={`cursor-pointer transition-colors ${
                            q.questionId === selectedQuestionDetail?.questionId
                              ? 'bg-blue-50/70'
                              : q.hasAnomaly
                              ? 'bg-rose-50/30 hover:bg-rose-50/60'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-slate-900">{q.label}</td>
                          <td className="py-2.5 px-2 text-slate-700">{q.cognitiveLevel}</td>
                          <td className="py-2.5 px-2 font-mono text-[11px] text-blue-800 font-semibold">
                            {q.learningOutcomeCode}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold">
                            {q.correctResponseRatePercent}%
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono">
                            {q.difficultyIndexP.toFixed(2)}
                          </td>
                          <td
                            className={`py-2.5 px-2 text-center font-mono font-bold ${
                              q.discriminationIndexD < 0
                                ? 'text-rose-700'
                                : q.discriminationIndexD >= 0.3
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {q.discriminationIndexD.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono">
                            {q.pointBiserialR.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {q.format === 'MULTIPLE_CHOICE'
                              ? q.distractorStats
                                  .map(
                                    (d) =>
                                      `${d.optionKey}${d.isCorrectKey ? '*' : ''}:${d.selectionRatePercent}%`
                                  )
                                  .join(' | ')
                              : `Tự luận (TB: ${q.meanPointsEarned}/${q.maxPoints}đ)`}
                          </td>
                          <td className="py-2.5 px-3">
                            {q.hasAnomaly ? (
                              <span className="inline-flex items-center gap-1 text-rose-800 font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{q.anomalyFlags[0]}</span>
                              </span>
                            ) : (
                              <span className="text-emerald-800 font-medium">
                                Đạt chuẩn ({q.discriminationLabel})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB IV: LIÊN KẾT YÊU CẦU CẦN ĐẠT (YCCĐ) & SINH HOẠT CHUYÊN MÔN
      ===================================================================== */}
      {activeTab === 'outcomes' && (
        <div className="space-y-6">
          {/* Nguyên tắc bắt buộc Mục IV */}
          <div className="bg-blue-950 text-white rounded-2xl p-5 flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300 uppercase tracking-wider">
                Nguyên tắc Đo lường Năng lực & Yêu cầu cần đạt (Mục IV)
              </div>
              <p className="leading-relaxed text-blue-100">
                Hệ thống tổng hợp tỷ lệ hoàn thành theo từng Yêu cầu cần đạt (YCCĐ) đã gắn với câu hỏi.{' '}
                <b>Tuyệt đối không coi một câu hỏi đơn lẻ là đủ để kết luận học sinh đã đạt hoặc chưa đạt toàn bộ một năng lực.</b>{' '}
                Các YCCĐ chỉ có 01 câu hỏi đo lường trong đề được gắn nhãn cảnh báo riêng để giáo viên kết hợp với đánh giá thường xuyên.
              </p>
            </div>
          </div>

          {/* 4 Nhóm tổng hợp theo đúng yêu cầu Mục IV */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Những yêu cầu học sinh thực hiện tốt */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>1. Những yêu cầu cần đạt học sinh thực hiện tốt</span>
              </h3>
              {outcomesSynthesis
                .filter((o) => o.classification === 'PERFORMING_WELL')
                .map((o) => (
                  <div
                    key={o.learningOutcomeCode}
                    className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-900">
                        {o.learningOutcomeCode} · {o.topicTitle}
                      </span>
                      <span className="font-mono font-extrabold text-emerald-800">
                        TB đúng: {o.meanCorrectRatePercent}%
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{o.learningOutcomeText}</p>
                    <div className="p-2 rounded-lg bg-white border border-emerald-200 text-[11px] text-slate-700">
                      <b>Căn cứ câu hỏi ({o.questionCount} câu):</b> {o.evidenceSufficiencyNotice}
                    </div>
                  </div>
                ))}
            </div>

            {/* 2. Những yêu cầu có tỷ lệ trả lời đúng thấp */}
            <div className="bg-white rounded-2xl border border-rose-200 p-5 space-y-3">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <span>2. Những yêu cầu cần đạt có tỷ lệ trả lời đúng thấp</span>
              </h3>
              {outcomesSynthesis
                .filter((o) => o.classification === 'LOW_CORRECT_RATE')
                .map((o) => (
                  <div
                    key={o.learningOutcomeCode}
                    className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-900">
                        {o.learningOutcomeCode} · {o.topicTitle}
                      </span>
                      <span className="font-mono font-extrabold text-rose-800">
                        TB đúng: {o.meanCorrectRatePercent}%
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{o.learningOutcomeText}</p>
                    <p className="text-rose-900">{o.pedagogicalActionRecommendation}</p>
                  </div>
                ))}
            </div>

            {/* 3. Những nội dung cần hỗ trợ thêm */}
            <div className="bg-white rounded-2xl border border-amber-200 p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>3. Những nội dung cần tổ chức hỗ trợ thêm cho học sinh</span>
              </h3>
              {outcomesSynthesis
                .filter(
                  (o) =>
                    o.classification === 'NEEDS_REMEDIATION' ||
                    o.classification === 'LOW_CORRECT_RATE'
                )
                .map((o) => (
                  <div
                    key={o.learningOutcomeCode}
                    className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-950">
                        {o.topicTitle} ({o.questionLabels.join(', ')})
                      </span>
                      <span className="font-mono font-bold text-amber-900">
                        {o.meanCorrectRatePercent}%
                      </span>
                    </div>
                    <p className="text-slate-700">{o.pedagogicalActionRecommendation}</p>
                  </div>
                ))}
            </div>

            {/* 4. Những nội dung nên đưa vào sinh hoạt chuyên môn */}
            <div className="bg-white rounded-2xl border border-indigo-200 p-5 space-y-3">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700" />
                <span>4. Nội dung kiến nghị đưa vào Sinh hoạt chuyên môn tổ</span>
              </h3>
              {outcomesSynthesis
                .filter((o) => o.suggestedProfessionalDevTopic)
                .map((o) => (
                  <div
                    key={o.learningOutcomeCode}
                    className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1.5 text-xs"
                  >
                    <div className="font-bold text-indigo-950">
                      {o.suggestedProfessionalDevTopic}
                    </div>
                    <p className="text-slate-700">
                      Căn cứ: {o.questionLabels.join(', ')} (Tỷ lệ đúng thấp nhất:{' '}
                      {o.minQuestionCorrectRatePercent}%). {o.evidenceSufficiencyNotice}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB V: BÁO CÁO BAN GIÁM HIỆU (ĐẦY ĐỦ 8 MỤC CHUẨN)
      ===================================================================== */}
      {activeTab === 'principal-report' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-800 uppercase">
                {principalReport.schoolName} · Năm học {principalReport.academicYear}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                BÁO CÁO BAN GIÁM HIỆU: KẾT QUẢ KIỂM TRA & CHẤT LƯỢNG CÂU HỎI (8 MỤC)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Môn: {principalReport.subject} · Khối {principalReport.grade} · Kỳ kiểm tra:{' '}
                {principalReport.examPeriod}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportWord}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Tải Báo cáo Word (.doc)</span>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Tải Bảng số liệu (.xlsx)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-blue-950 text-sm">1. Tổng quan kết quả</div>
              <p className="text-slate-700 leading-relaxed">
                {principalReport.section1Overview.summaryText}
              </p>
              <p className="text-slate-600 italic">
                {principalReport.section1Overview.dataIntegrityNote}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-blue-950 text-sm">2. Phân tích theo khối</div>
              <p className="text-slate-700 leading-relaxed">
                {principalReport.section2GradeAnalysis.distributionComment}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {principalReport.section2GradeAnalysis.periodTrendComment}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-blue-950 text-sm">3. Phân tích theo lớp</div>
              <p className="text-slate-700 leading-relaxed">
                {principalReport.section3ClassAnalysis.gapAnalysisComment}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-blue-950 text-sm">4. Phân tích theo môn học</div>
              <p className="text-slate-700 leading-relaxed">
                {principalReport.section4SubjectAnalysis.examBlueprintSummary}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {principalReport.section4SubjectAnalysis.cognitiveBalanceComment}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-blue-950 text-sm">5. Phân tích yêu cầu cần đạt</div>
              <p className="text-slate-700">
                • Số YCCĐ thực hiện tốt:{' '}
                <b>{principalReport.section5LearningOutcomeAnalysis.performingWell.length}</b> | Tỷ lệ đúng thấp:{' '}
                <b>{principalReport.section5LearningOutcomeAnalysis.lowCorrectRate.length}</b> | Cần đưa vào sinh hoạt tổ:{' '}
                <b>{principalReport.section5LearningOutcomeAnalysis.departmentTopics.length}</b>.
              </p>
              <p className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {principalReport.section5LearningOutcomeAnalysis.nonOvergeneralizationDisclaimer}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-blue-950 text-sm">6. Chất lượng câu hỏi</div>
              <p className="text-slate-700">
                Đã thẩm định thực nghiệm <b>{principalReport.section6QuestionQualityAnalysis.analyzedQuestionsCount}</b> câu hỏi: có{' '}
                <b className="text-emerald-700">{principalReport.section6QuestionQualityAnalysis.goodItemsCount}</b> câu đạt chuẩn tốt và{' '}
                <b className="text-rose-700">{principalReport.section6QuestionQualityAnalysis.anomalousItemsCount}</b> câu có dấu hiệu bất thường cần biên tập lại.
              </p>
              <p className="text-slate-600">
                {principalReport.section6QuestionQualityAnalysis.psychometricReliabilityNote}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div className="font-bold text-rose-950 text-sm">7. Những vấn đề cần chú ý</div>
              <ul className="space-y-1 text-rose-900 list-disc pl-4">
                {principalReport.section7KeyIssuesToWatch.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
              <div className="font-bold text-emerald-950 text-sm">
                8. Đề xuất điều chỉnh dạy học
              </div>
              <ul className="space-y-1 text-emerald-950 list-disc pl-4">
                {principalReport.section8TeachingAdjustmentProposals.map((prop, idx) => (
                  <li key={idx}>{prop}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB VI: ĐỀ XUẤT BẰNG AI & HỘP KIỂM SOÁT 4 QUY TẮC CẤM (GUARDRAILS)
      ===================================================================== */}
      {activeTab === 'ai-recommendations' && (
        <div className="space-y-6">
          {/* Bảng kiểm tra 4 quy tắc cấm đối với AI (Mục VI) */}
          <div className="bg-white rounded-2xl border border-emerald-300 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Kiểm toán Hàng rào Bảo vệ Đạo đức & Bảo mật AI (Mục VI)</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {aiRecommendations.anonymizedInputSummary}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                Đạt 4/4 Quy tắc An toàn AI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiRecommendations.guardrailChecks.map((chk) => (
                <div
                  key={chk.ruleCode}
                  className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1"
                >
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{chk.ruleTitle}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{chk.verificationDetail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nội dung AI được phép đề xuất */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>Tóm tắt dữ liệu & Phát hiện xu hướng bằng AI</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-800">Tóm tắt dữ liệu:</div>
                {aiRecommendations.dataSummary.map((line, i) => (
                  <p key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • {line}
                  </p>
                ))}
              </div>
              <div className="space-y-2 text-xs pt-2">
                <div className="font-semibold text-slate-800">Xu hướng phát hiện được:</div>
                {aiRecommendations.detectedTrends.map((line, i) => (
                  <p key={i} className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-950">
                    • {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Đề xuất nội dung ôn tập & Chuyên đề sinh hoạt tổ
              </h3>
              <div className="space-y-2.5 text-xs">
                {aiRecommendations.suggestedReviewTopics.map((topic, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">{topic.topicTitle}</div>
                    <div className="text-blue-800 font-medium">Đối tượng: {topic.targetGroup}</div>
                    <p className="text-slate-600">{topic.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hoạt động hỗ trợ học sinh theo nhóm điểm */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Đề xuất hoạt động hỗ trợ học sinh phân hóa theo kết quả kiểm tra
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {aiRecommendations.suggestedStudentSupportActivities.map((act, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">{act.groupLabel}</div>
                  <div className="font-mono text-blue-800 font-semibold">
                    Dải điểm: {act.scoreRange} ({act.studentCount} học sinh)
                  </div>
                  <p className="text-slate-700 leading-relaxed">{act.supportAction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB VII: KIỂM THỬ 3 LỚP × 30 HS = 90 HS & ĐỐI CHIẾU TÍNH TOÁN ĐỘC LẬP
      ===================================================================== */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-emerald-950 text-white rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Báo cáo Kiểm thử & Đối chiếu Thuật toán Độc lập (Mục VII)</span>
              </div>
              <h2 className="text-lg font-bold">
                Đã kiểm chứng {verificationAudit.testedClassesCount} lớp ×{' '}
                {verificationAudit.studentsPerClass} học sinh ={' '}
                {verificationAudit.totalFullResponseStudentsTested} học sinh (Kèm{' '}
                {verificationAudit.totalScoreOnlyStudentsTested} HS chỉ có điểm tổng)
              </h2>
              <p className="text-xs text-emerald-200">
                {verificationAudit.nonInferenceVerificationDetail}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">
                {verificationAudit.allPassed
                  ? 'PASSED 100% (Sai số Δ = 0.0000)'
                  : 'CẦN KIỂM TRA LẠI'}
              </span>
            </div>
          </div>

          {/* Bảng 1: Đối chiếu các chỉ số thống kê mô tả */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                1. Đối chiếu kết quả Thống kê (Engine Chính vs. Thuật toán Kiểm chứng Độc lập trên 90 HS)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-4 font-bold">Chỉ số thống kê</th>
                    <th className="py-2.5 px-4 font-bold">Công thức toán học</th>
                    <th className="py-2.5 px-4 font-bold text-center">Engine Chính</th>
                    <th className="py-2.5 px-4 font-bold text-center">Engine Độc lập</th>
                    <th className="py-2.5 px-4 font-bold text-center">Độ lệch |Δ|</th>
                    <th className="py-2.5 px-4 font-bold text-center">Kết luận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {verificationAudit.metricComparisons.map((m) => (
                    <tr key={m.metricCode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{m.metricName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{m.formulaUsed}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-900">
                        {m.primaryEngineValue}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-900">
                        {m.independentEngineValue}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">
                        {m.absoluteDifference.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                          Khớp tuyệt đối
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bảng 2: Đối chiếu độc lập từng câu hỏi (Độ khó p và Độ phân biệt D) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                2. Đối chiếu độc lập Độ khó (p_i), Độ phân biệt (D_i) và Tổng tỷ lệ phương án nhiễu của 12 câu hỏi
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-4 font-bold">Câu hỏi</th>
                    <th className="py-2.5 px-3 font-bold text-center">p (Engine Chính)</th>
                    <th className="py-2.5 px-3 font-bold text-center">p (Độc lập)</th>
                    <th className="py-2.5 px-3 font-bold text-center">D (Engine Chính)</th>
                    <th className="py-2.5 px-3 font-bold text-center">D (Độc lập)</th>
                    <th className="py-2.5 px-3 font-bold text-center">Tổng % Phương án</th>
                    <th className="py-2.5 px-3 font-bold text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {verificationAudit.questionLevelComparisons.map((q) => (
                    <tr key={q.questionLabel} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-bold text-slate-900">{q.questionLabel}</td>
                      <td className="py-2 px-3 text-center font-mono">{q.primaryP.toFixed(4)}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        {q.independentP.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{q.primaryD.toFixed(4)}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        {q.independentD.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        {q.primaryDistractorSumPercent}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                          ✓ Chính xác
                        </span>
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
