import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ApprovalStatus,
  CognitiveLevelCode,
  PrimaryAssessmentFormCode,
  PrimaryCompleteExamPackage,
  PrimaryExamPeriodCode,
  PrimaryGradeNumber,
  PrimaryMathQuestionCategory,
  PrimaryVietnameseComponentCode,
  ToastNotification,
} from '../types/domain';
import {
  PRIMARY_ASSESSMENT_FORM_LABELS,
  PRIMARY_COGNITIVE_LEVEL_METADATA,
  PRIMARY_EXAM_PERIOD_LABELS,
  PRIMARY_GRADES,
  PRIMARY_MATH_CATEGORY_LABELS,
  PRIMARY_SCHOOL_APPROVED_TEMPLATES,
  PRIMARY_SUBJECTS_BY_GRADE,
  PRIMARY_VIETNAMESE_COMPONENT_LABELS,
  buildPrimaryMatrixAndAnalytics,
  checkPrimaryExamApplicability,
  exportPrimaryExamPackageToWord,
  getPrebuiltPrimaryExamPackages,
  runPrimaryAcceptanceTestSuite,
} from '../services/primary/primaryAssessmentService';

interface PrimaryAssessmentWorkspaceProps {
  onNotify?: (type: ToastNotification['type'], title: string, message: string) => void;
}

type WorkspaceTabId =
  | 'CONFIG_AND_RULES'
  | 'MATRIX_SPEC_LEVELS'
  | 'MATH_SPECIALIZED'
  | 'VIETNAMESE_SPECIALIZED'
  | 'EXAM_ANSWER_RUBRIC'
  | 'ANALYTICS_AND_TEST_SUITE';

export const PrimaryAssessmentWorkspace: React.FC<PrimaryAssessmentWorkspaceProps> = ({
  onNotify,
}) => {
  const [packages, setPackages] = useState<PrimaryCompleteExamPackage[]>(() =>
    getPrebuiltPrimaryExamPackages()
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    'PKG-PRIMARY-TOAN4-GK1'
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('CONFIG_AND_RULES');

  // State cho Bộ cấu hình & kiểm tra kỳ kiểm tra áp dụng (Mục II)
  const [configGrade, setConfigGrade] = useState<PrimaryGradeNumber>(4);
  const [configSubject, setConfigSubject] = useState<string>('Toán');
  const [configPeriod, setConfigPeriod] = useState<PrimaryExamPeriodCode>('GIUA_KY_1');
  const [configScope, setConfigScope] = useState<string>(
    'Số tự nhiên đến lớp triệu, làm tròn số; Phép cộng, phép trừ nhiều chữ số; Tìm thành phần chưa biết; Đổi đơn vị đo khối lượng, diện tích; Góc và đường thẳng vuông góc/song song; Thống kê; Giải toán có lời văn.'
  );
  const [configTotalPoints, setConfigTotalPoints] = useState<number>(10);
  const [configDuration, setConfigDuration] = useState<number>(40);
  const [configForm, setConfigForm] = useState<PrimaryAssessmentFormCode>(
    'BAI_KIEM_TRA_VIET'
  );
  const [configTemplateId, setConfigTemplateId] = useState<string>(
    'TPL-TH-TOAN-45-CHUAN'
  );

  // State lọc chuyên sâu cho Môn Toán (Mục IV) và Môn Tiếng Việt (Mục V)
  const [selectedMathCategoryFilter, setSelectedMathCategoryFilter] = useState<
    PrimaryMathQuestionCategory | 'ALL'
  >('ALL');
  const [selectedQuestionForExplanationId, setSelectedQuestionForExplanationId] =
    useState<string | null>(null);

  // Tỷ trọng cấu hình các phần môn Tiếng Việt (Mục V)
  const [vnWeights, setVnWeights] = useState({
    docThanhTieng: 2.0,
    docHieu: 2.5,
    kienThucTiengViet: 1.5,
    viet: 4.0,
  });

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || packages[0],
    [packages, selectedPackageId]
  );

  const liveApplicability = useMemo(
    () => checkPrimaryExamApplicability(configGrade, configSubject, configPeriod),
    [configGrade, configSubject, configPeriod]
  );

  const acceptanceReport = useMemo(
    () => runPrimaryAcceptanceTestSuite(packages),
    [packages]
  );

  const handleSelectPrebuiltExam = (pkgId: string) => {
    const found = packages.find((p) => p.id === pkgId);
    if (!found) return;
    setSelectedPackageId(found.id);
    setConfigGrade(found.grade);
    setConfigSubject(found.subject);
    setConfigPeriod(found.period);
    setConfigScope(found.contentScopeDescription);
    setConfigTotalPoints(found.totalPoints);
    setConfigDuration(found.durationMinutes);
    setConfigForm(found.assessmentForm);
    setConfigTemplateId(found.schoolTemplateId);
    setSelectedQuestionForExplanationId(found.questions[0]?.id || null);
  };

  const handleApplyVietnameseWeightsToExam = () => {
    const sum = Number(
      (
        vnWeights.docThanhTieng +
        vnWeights.docHieu +
        vnWeights.kienThucTiengViet +
        vnWeights.viet
      ).toFixed(2)
    );
    if (Math.abs(sum - 10.0) > 0.01) {
      onNotify?.(
        'warning',
        'Tổng điểm 4 phần Tiếng Việt chưa bằng 10,0',
        `Tổng hiện tại đang là ${sum.toFixed(2)} điểm. Theo Thông tư 27/2020/TT-BGDĐT, thang điểm bài kiểm tra định kỳ là 10,0 điểm.`
      );
      return;
    }

    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id !== 'PKG-PRIMARY-TV4-GK1') return pkg;
        const dhQuestions = pkg.questions.filter(
          (q) => q.vietnameseComponent === 'DOC_HIEU'
        );
        const ktQuestions = pkg.questions.filter(
          (q) => q.vietnameseComponent === 'KIEN_THUC_TIENG_VIET'
        );

        const updatedQuestions = pkg.questions.map((q) => {
          if (q.vietnameseComponent === 'DOC_THANH_TIENG') {
            const perStep = Number((vnWeights.docThanhTieng / 4).toFixed(2));
            return {
              ...q,
              points: vnWeights.docThanhTieng,
              rubricSteps: q.rubricSteps.map((s, idx) => ({
                ...s,
                points:
                  idx === 3
                    ? Number((vnWeights.docThanhTieng - perStep * 3).toFixed(2))
                    : perStep,
              })),
            };
          }
          if (q.vietnameseComponent === 'VIET') {
            const ratio = vnWeights.viet / 4.0;
            return {
              ...q,
              points: vnWeights.viet,
              rubricSteps: q.rubricSteps.map((s) => ({
                ...s,
                points: Number((s.points * ratio).toFixed(2)),
              })),
            };
          }
          if (q.vietnameseComponent === 'DOC_HIEU' && dhQuestions.length > 0) {
            const baseShare = Number((vnWeights.docHieu / dhQuestions.length).toFixed(2));
            const idx = dhQuestions.findIndex((item) => item.id === q.id);
            const newPts =
              idx === dhQuestions.length - 1
                ? Number(
                    (vnWeights.docHieu - baseShare * (dhQuestions.length - 1)).toFixed(2)
                  )
                : baseShare;
            return {
              ...q,
              points: newPts,
              rubricSteps: [{ stepDescription: q.gradingGuide, points: newPts }],
            };
          }
          if (
            q.vietnameseComponent === 'KIEN_THUC_TIENG_VIET' &&
            ktQuestions.length > 0
          ) {
            const baseShare = Number(
              (vnWeights.kienThucTiengViet / ktQuestions.length).toFixed(2)
            );
            const idx = ktQuestions.findIndex((item) => item.id === q.id);
            const newPts =
              idx === ktQuestions.length - 1
                ? Number(
                    (
                      vnWeights.kienThucTiengViet -
                      baseShare * (ktQuestions.length - 1)
                    ).toFixed(2)
                  )
                : baseShare;
            return {
              ...q,
              points: newPts,
              rubricSteps: [{ stepDescription: q.gradingGuide, points: newPts }],
            };
          }
          return q;
        });

        const rebuilt = buildPrimaryMatrixAndAnalytics(
          updatedQuestions,
          10.0,
          'TIENG_VIET_4_GIUA_KY_1',
          'Tiếng Việt'
        );

        return {
          ...pkg,
          questions: updatedQuestions,
          matrixRows: rebuilt.matrixRows,
          specificationRows: rebuilt.specificationRows,
          analytics: rebuilt.analytics,
        };
      })
    );

    onNotify?.(
      'success',
      'Đã cập nhật tỷ trọng 4 phần môn Tiếng Việt',
      `Đọc thành tiếng (${vnWeights.docThanhTieng}đ) + Đọc hiểu (${vnWeights.docHieu}đ) + Kiến thức TV (${vnWeights.kienThucTiengViet}đ) + Viết (${vnWeights.viet}đ) = 10,0 điểm.`
    );
  };

  const handleExportWord = (pkg: PrimaryCompleteExamPackage) => {
    const res = exportPrimaryExamPackageToWord(pkg);
    onNotify?.(
      'success',
      'Đã xuất Hồ sơ Đề kiểm tra Tiểu học (.doc)',
      `Tệp "${res.fileName}" (${(res.sizeBytes / 1024).toFixed(1)} KB) gồm Ma trận, Bản đặc tả, Đề kiểm tra, Đáp án & Hướng dẫn chấm đã được tải về máy.`
    );
  };

  const mathPackageForTab = useMemo(() => {
    if (selectedPackage.subject === 'Toán') return selectedPackage;
    return (
      packages.find((p) => p.id === 'PKG-PRIMARY-TOAN4-GK1') || selectedPackage
    );
  }, [packages, selectedPackage]);

  const vietnamesePackageForTab = useMemo(() => {
    if (selectedPackage.subject === 'Tiếng Việt') return selectedPackage;
    return (
      packages.find((p) => p.id === 'PKG-PRIMARY-TV4-GK1') || selectedPackage
    );
  }, [packages, selectedPackage]);

  const highlightedQuestion = useMemo(() => {
    const found = selectedPackage.questions.find(
      (q) => q.id === selectedQuestionForExplanationId
    );
    return found || selectedPackage.questions[0];
  }, [selectedPackage, selectedQuestionForExplanationId]);

  return (
    <div className="space-y-6">
      {/* Banner Tiêu đề & Nguyên tắc cốt lõi Thông tư 27/2020/TT-BGDĐT (Mục I) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Thông tư 27/2020/TT-BGDĐT &amp; Chương trình GDPT 2018</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              MODULE KIỂM TRA ĐÁNH GIÁ TIỂU HỌC (LỚP 1 – LỚP 5)
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              Thiết kế chuyên biệt cho cấp Tiểu học theo <strong>3 mức độ nhận thức (Mức 1 – Mức 2 – Mức 3)</strong>, bám sát Yêu cầu cần đạt của từng khối lớp. Tuyệt đối <strong>không áp dụng máy móc cấu trúc đề THCS</strong>, không biến tỷ lệ mức độ hay dạng câu thành quy định bắt buộc nếu văn bản pháp quy không quy định, và <strong>không tự động phê duyệt đề do AI tạo</strong>.
            </p>
          </div>

          {/* Bộ chuyển nhanh 3 Đề Kiểm thử chuẩn (Mục VII) */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase">
              Chọn bộ đề kiểm tra đang làm việc:
            </span>
            <div className="flex flex-wrap gap-2">
              {packages.map((pkg, idx) => {
                const isSelected = pkg.id === selectedPackage.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelectPrebuiltExam(pkg.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <span>
                      Đề {idx + 1}: {pkg.subject} Lớp {pkg.grade} (
                      {PRIMARY_EXAM_PERIOD_LABELS[pkg.period]})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6 Nguyên tắc pháp lý Mục I */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
          {[
            {
              title: '1. Căn cứ TT 27/2020',
              desc: 'Tuân thủ Điều 7 Thông tư 27/2020/TT-BGDĐT và văn bản hiện hành.',
            },
            {
              title: '2. Bám sát YCCĐ',
              desc: 'Mỗi câu hỏi gắn trực tiếp Mã YCCĐ của Chương trình GDPT 2018.',
            },
            {
              title: '3. Phù hợp Khối 1–5',
              desc: 'Phân biệt rõ kỳ kiểm tra Giữa kỳ (chỉ Toán, TV lớp 4–5) và Cuối kỳ.',
            },
            {
              title: '4. Tách biệt THCS',
              desc: 'Dùng chuẩn 3 mức độ Tiểu học (Mức 1, 2, 3), không ép khung THCS.',
            },
            {
              title: '5. Mẫu đề linh hoạt',
              desc: 'Tỷ lệ mức độ & dạng câu cấu hình theo mẫu đề nhà trường phê duyệt.',
            },
            {
              title: '6. Không tự phê duyệt',
              desc: 'Mọi đề giữ trạng thái BẢN NHÁP (DRAFT) chờ giáo viên & BGH duyệt.',
            },
          ].map((rule, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{rule.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Thanh Điều hướng 6 Phân hệ chức năng (Mục II -> Mục VII) */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
        {[
          {
            id: 'CONFIG_AND_RULES' as WorkspaceTabId,
            label: '1. Cấu hình Đề & Quy định TT27 (Mục I–II)',
            icon: SlidersHorizontal,
          },
          {
            id: 'MATRIX_SPEC_LEVELS' as WorkspaceTabId,
            label: '2. Ma trận, Đặc tả & Giải thích Mức 1–2–3 (Mục III)',
            icon: FileSpreadsheet,
          },
          {
            id: 'MATH_SPECIALIZED' as WorkspaceTabId,
            label: '3. Đặc thù Môn Toán & Kiểm tra phép tính (Mục IV)',
            icon: Calculator,
          },
          {
            id: 'VIETNAMESE_SPECIALIZED' as WorkspaceTabId,
            label: '4. Đặc thù Môn Tiếng Việt 4 Phần (Mục V)',
            icon: BookOpen,
          },
          {
            id: 'EXAM_ANSWER_RUBRIC' as WorkspaceTabId,
            label: '5. Đề kiểm tra, Đáp án & Hướng dẫn chấm',
            icon: FileText,
          },
          {
            id: 'ANALYTICS_AND_TEST_SUITE' as WorkspaceTabId,
            label: '6. Phân tích Đề & Kiểm thử 3 Đề (Mục VI–VII)',
            icon: BarChart3,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: CẤU HÌNH ĐỀ KIỂM TRA & KIỂM TRA QUY ĐỊNH ÁP DỤNG (MỤC I & II)
      ===================================================================== */}
      {activeTab === 'CONFIG_AND_RULES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Biểu mẫu cấu hình đề kiểm tra (Mục II) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  II. Cấu hình Đề kiểm tra Tiểu học (Lớp 1 đến Lớp 5)
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn khối lớp, môn học, kỳ kiểm tra và mẫu đề được nhà trường phê duyệt.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                Trạng thái: Bản nháp (Không tự duyệt)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Khối lớp (Lớp 1 – Lớp 5)
                </label>
                <select
                  value={configGrade}
                  onChange={(e) => {
                    const nextGrade = Number(e.target.value) as PrimaryGradeNumber;
                    setConfigGrade(nextGrade);
                    const allowedSubs = PRIMARY_SUBJECTS_BY_GRADE[nextGrade];
                    if (!allowedSubs.includes(configSubject)) {
                      setConfigSubject(allowedSubs[0]);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                >
                  {PRIMARY_GRADES.map((g) => (
                    <option key={g} value={g}>
                      Khối Lớp {g} (Tiểu học)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Môn học theo Chương trình GDPT 2018
                </label>
                <select
                  value={configSubject}
                  onChange={(e) => setConfigSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                >
                  {PRIMARY_SUBJECTS_BY_GRADE[configGrade].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Kỳ kiểm tra định kỳ
                </label>
                <select
                  value={configPeriod}
                  onChange={(e) =>
                    setConfigPeriod(e.target.value as PrimaryExamPeriodCode)
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                >
                  {(
                    Object.keys(PRIMARY_EXAM_PERIOD_LABELS) as PrimaryExamPeriodCode[]
                  ).map((k) => (
                    <option key={k} value={k}>
                      {PRIMARY_EXAM_PERIOD_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Tổng điểm (Thang điểm 10 TT27)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={5}
                  max={20}
                  value={configTotalPoints}
                  onChange={(e) => setConfigTotalPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Thời gian làm bài (Phút)
                </label>
                <input
                  type="number"
                  step="5"
                  min={25}
                  max={90}
                  value={configDuration}
                  onChange={(e) => setConfigDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6. Hình thức kiểm tra
                </label>
                <select
                  value={configForm}
                  onChange={(e) =>
                    setConfigForm(e.target.value as PrimaryAssessmentFormCode)
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
                >
                  {(
                    Object.keys(
                      PRIMARY_ASSESSMENT_FORM_LABELS
                    ) as PrimaryAssessmentFormCode[]
                  ).map((formKey) => (
                    <option key={formKey} value={formKey}>
                      {PRIMARY_ASSESSMENT_FORM_LABELS[formKey]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                7. Phạm vi nội dung kiến thức – kĩ năng
              </label>
              <textarea
                rows={2}
                value={configScope}
                onChange={(e) => setConfigScope(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                8. Mẫu đề đã được Nhà trường / Hội đồng chuyên môn phê duyệt (Không ép tỷ lệ cứng)
              </label>
              <select
                value={configTemplateId}
                onChange={(e) => setConfigTemplateId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
              >
                {PRIMARY_SCHOOL_APPROVED_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    [{tpl.code}] {tpl.title}
                  </option>
                ))}
              </select>
              {(() => {
                const tpl = PRIMARY_SCHOOL_APPROVED_TEMPLATES.find(
                  (t) => t.id === configTemplateId
                );
                if (!tpl) return null;
                return (
                  <div className="mt-2 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                    <div className="font-semibold text-blue-950">
                      Căn cứ phê duyệt của trường: {tpl.schoolDecisionRef} ({tpl.approvedByRole})
                    </div>
                    <p className="text-slate-700 leading-relaxed">{tpl.description}</p>
                    <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-medium text-blue-900">
                      <span>
                        Gợi ý tỷ lệ mức độ (Linh hoạt): Mức 1 ({tpl.recommendedLevelPercents.muc1Percent}%) – Mức 2 ({tpl.recommendedLevelPercents.muc2Percent}%) – Mức 3 ({tpl.recommendedLevelPercents.muc3Percent}%)
                      </span>
                      <span>|</span>
                      <span>
                        Gợi ý hình thức: Trắc nghiệm ({tpl.recommendedFormatPercents.objectivePercent}%) – Tự luận ({tpl.recommendedFormatPercents.constructedPercent}%)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Cột phải: Kết quả kiểm tra tự động kỳ kiểm tra áp dụng theo Thông tư 27/2020/TT-BGDĐT */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`rounded-xl border p-5 space-y-3 ${
                liveApplicability.isMandatoryPeriodicExam
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {liveApplicability.isMandatoryPeriodicExam ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wide">
                    Kiểm tra Quy định Kỳ kiểm tra theo Thông tư 27/2020/TT-BGDĐT
                  </div>
                  <h3 className="text-sm font-bold">{liveApplicability.statusLabel}</h3>
                </div>
              </div>

              <p className="text-xs leading-relaxed">
                {liveApplicability.explanationMessage}
              </p>

              <div className="p-3 rounded-lg bg-white/90 border border-slate-200 text-xs space-y-1.5 text-slate-800">
                <div>
                  <strong>Căn cứ pháp lý:</strong> {liveApplicability.regulatoryClause}
                </div>
                <div>
                  <strong>Phương thức đánh giá môn học:</strong>{' '}
                  {liveApplicability.assessmentMethodType === 'DIEM_SO_KET_HOP_NHAN_XET'
                    ? 'Đánh giá bằng nhận xét kết hợp điểm số bài kiểm tra định kỳ (Thang điểm 10)'
                    : 'Đánh giá bằng nhận xét (Hoàn thành tốt / Hoàn thành / Chưa hoàn thành)'}
                </div>
                <div>
                  <strong>Các kỳ kiểm tra định kỳ bắt buộc áp dụng cho {configSubject} Lớp {configGrade}:</strong>{' '}
                  {liveApplicability.allowedPeriodsForGradeSubject.length > 0
                    ? liveApplicability.allowedPeriodsForGradeSubject
                        .map((p) => PRIMARY_EXAM_PERIOD_LABELS[p])
                        .join(', ')
                    : 'Không có bài kiểm tra định kỳ chấm điểm (Chỉ đánh giá thường xuyên bằng nhận xét)'}
                </div>
              </div>
            </div>

            {/* Bảng tra cứu tổng thể Kỳ kiểm tra định kỳ Lớp 1 - Lớp 5 theo Điều 7 TT 27/2020 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Bảng Quy định Kỳ kiểm tra định kỳ Cấp Tiểu học (Điều 7 TT 27/2020/TT-BGDĐT)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-2 text-left">Khối lớp</th>
                      <th className="border border-slate-300 p-2 text-left">
                        Giữa HK I &amp; Giữa HK II
                      </th>
                      <th className="border border-slate-300 p-2 text-left">
                        Cuối HK I &amp; Cuối năm học
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold">Lớp 1, Lớp 2</td>
                      <td className="border border-slate-300 p-2 text-slate-600">
                        Không quy định bài kiểm tra định kỳ bắt buộc
                      </td>
                      <td className="border border-slate-300 p-2 font-medium text-blue-900">
                        Tiếng Việt, Toán
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold">Lớp 3</td>
                      <td className="border border-slate-300 p-2 text-slate-600">
                        Không quy định bài kiểm tra định kỳ bắt buộc
                      </td>
                      <td className="border border-slate-300 p-2 font-medium text-blue-900">
                        Tiếng Việt, Toán, Ngoại ngữ 1, Tin học và Công nghệ
                      </td>
                    </tr>
                    <tr className="bg-blue-50/40">
                      <td className="border border-slate-300 p-2 font-bold text-blue-950">
                        Lớp 4, Lớp 5
                      </td>
                      <td className="border border-slate-300 p-2 font-bold text-emerald-800">
                        Tiếng Việt, Toán (Bắt buộc)
                      </td>
                      <td className="border border-slate-300 p-2 font-medium text-blue-900">
                        Tiếng Việt, Toán, Khoa học, Lịch sử và Địa lí, Ngoại ngữ 1, Tin học và Công nghệ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: MA TRẬN, BẢN ĐẶC TẢ & GIẢI THÍCH 3 MỨC ĐỘ ĐÁNH GIÁ (MỤC III)
      ===================================================================== */}
      {activeTab === 'MATRIX_SPEC_LEVELS' && (
        <div className="space-y-6">
          {/* Định nghĩa 3 Mức độ theo Thông tư 27/2020/TT-BGDĐT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                CognitiveLevelCode.PRIMARY_MUC_1,
                CognitiveLevelCode.PRIMARY_MUC_2,
                CognitiveLevelCode.PRIMARY_MUC_3,
              ] as const
            ).map((lvlKey, idx) => {
              const meta = PRIMARY_COGNITIVE_LEVEL_METADATA[lvlKey];
              const stat = selectedPackage.analytics.byLevel.find(
                (b) => b.level === lvlKey
              );
              return (
                <div
                  key={lvlKey}
                  className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        idx === 0
                          ? 'bg-emerald-100 text-emerald-900'
                          : idx === 1
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {meta.fullLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {stat?.questionCount || 0} câu ({stat?.points.toFixed(2)}đ –{' '}
                      {stat?.percentageOfPoints}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {meta.tt27Definition}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {meta.actionVerbs.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bảng Ma trận 3 Mức độ của đề đang chọn */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  MA TRẬN ĐỀ KIỂM TRA (3 MỨC ĐỘ TIỂU HỌC): {selectedPackage.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Mẫu đề áp dụng: {selectedPackage.schoolTemplateTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportWord(selectedPackage)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-800 text-white text-xs font-semibold hover:bg-blue-900 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Xuất Hồ sơ Đề (.doc)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2.5 text-center" rowSpan={2}>
                      TT
                    </th>
                    <th className="border border-slate-300 p-2.5 text-left" rowSpan={2}>
                      Chủ đề / Mạch nội dung
                    </th>
                    <th className="border border-slate-300 p-2 text-center" colSpan={2}>
                      Mức 1
                    </th>
                    <th className="border border-slate-300 p-2 text-center" colSpan={2}>
                      Mức 2
                    </th>
                    <th className="border border-slate-300 p-2 text-center" colSpan={2}>
                      Mức 3
                    </th>
                    <th className="border border-slate-300 p-2.5 text-center" rowSpan={2}>
                      Tổng số câu
                    </th>
                    <th className="border border-slate-300 p-2.5 text-center" rowSpan={2}>
                      Tổng điểm (Tỷ lệ)
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-700 text-[11px]">
                    <th className="border border-slate-300 p-1.5 text-center">TN</th>
                    <th className="border border-slate-300 p-1.5 text-center">TL</th>
                    <th className="border border-slate-300 p-1.5 text-center">TN</th>
                    <th className="border border-slate-300 p-1.5 text-center">TL</th>
                    <th className="border border-slate-300 p-1.5 text-center">TN</th>
                    <th className="border border-slate-300 p-1.5 text-center">TL</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPackage.matrixRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2.5 text-center font-medium">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 p-2.5">
                        <div className="font-bold text-slate-900">{row.topicTitle}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {row.learningOutcomesSummary.join(' | ')}
                        </div>
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {row.muc1ObjectiveCount > 0
                          ? `${row.muc1ObjectiveCount}c (${row.muc1ObjectivePoints}đ)`
                          : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {row.muc1ConstructedCount > 0
                          ? `${row.muc1ConstructedCount}c (${row.muc1ConstructedPoints}đ)`
                          : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {row.muc2ObjectiveCount > 0
                          ? `${row.muc2ObjectiveCount}c (${row.muc2ObjectivePoints}đ)`
                          : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {row.muc2ConstructedCount > 0
                          ? `${row.muc2ConstructedCount}c (${row.muc2ConstructedPoints}đ)`
                          : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {row.muc3ObjectiveCount > 0
                          ? `${row.muc3ObjectiveCount}c (${row.muc3ObjectivePoints}đ)`
                          : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {row.muc3ConstructedCount > 0
                          ? `${row.muc3ConstructedCount}c (${row.muc3ConstructedPoints}đ)`
                          : '-'}
                      </td>
                      <td className="border border-slate-300 p-2.5 text-center font-bold">
                        {row.totalQuestions} câu
                      </td>
                      <td className="border border-slate-300 p-2.5 text-center font-bold text-blue-900">
                        {row.totalPoints.toFixed(2)}đ ({row.percentOfExam}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bản đặc tả & Khung xem giải thích vì sao câu hỏi được phân loại ở Mức 1, Mức 2, Mức 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Bản đặc tả Kỹ thuật &amp; Yêu cầu cần đạt (Bấm vào từng câu để xem giải thích mức độ)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-2">Câu</th>
                      <th className="border border-slate-300 p-2 text-left">
                        Mã &amp; Nội dung Yêu cầu cần đạt
                      </th>
                      <th className="border border-slate-300 p-2 text-center">Mức độ</th>
                      <th className="border border-slate-300 p-2 text-left">
                        Dạng câu đặc thù
                      </th>
                      <th className="border border-slate-300 p-2 text-center">Điểm</th>
                      <th className="border border-slate-300 p-2 text-center">
                        Giải thích
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPackage.questions.map((q) => {
                      const isSelected = highlightedQuestion?.id === q.id;
                      return (
                        <tr
                          key={q.id}
                          onClick={() => setSelectedQuestionForExplanationId(q.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="border border-slate-300 p-2 font-bold text-center">
                            {q.questionNumberLabel}
                          </td>
                          <td className="border border-slate-300 p-2">
                            <span className="font-mono font-bold text-blue-800">
                              [{q.learningOutcomeCode}]
                            </span>{' '}
                            {q.learningOutcomeText}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {PRIMARY_COGNITIVE_LEVEL_METADATA[q.cognitiveLevel].shortLabel}
                          </td>
                          <td className="border border-slate-300 p-2 text-[11px]">
                            {q.mathCategory
                              ? PRIMARY_MATH_CATEGORY_LABELS[q.mathCategory]
                              : q.vietnameseComponent
                              ? PRIMARY_VIETNAMESE_COMPONENT_LABELS[q.vietnameseComponent]
                              : q.formatType}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {q.points.toFixed(2)}đ
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedQuestionForExplanationId(q.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-900 font-semibold text-[11px] cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Xem lý giải</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Khung chi tiết Giải thích vì sao câu hỏi được phân loại ở mức đó (Mục III) */}
            <div className="lg:col-span-4 bg-blue-950 text-white rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase">
                <HelpCircle className="w-4 h-4" />
                <span>Giải thích Phân loại Mức độ (Mục III)</span>
              </div>
              {highlightedQuestion && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-blue-900/80 border border-blue-700 space-y-1">
                    <div className="text-amber-300 font-bold">
                      {highlightedQuestion.questionNumberLabel} ({highlightedQuestion.points.toFixed(2)} điểm) –{' '}
                      {
                        PRIMARY_COGNITIVE_LEVEL_METADATA[
                          highlightedQuestion.cognitiveLevel
                        ].fullLabel
                      }
                    </div>
                    <div className="text-blue-100">
                      <strong>Chủ đề:</strong> {highlightedQuestion.topicTitle}
                    </div>
                    <div className="text-blue-100">
                      <strong>Mã YCCĐ:</strong> {highlightedQuestion.learningOutcomeCode} –{' '}
                      {highlightedQuestion.learningOutcomeText}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-400/15 border border-amber-400/40 space-y-1.5">
                    <div className="font-bold text-amber-300">
                      Vì sao câu hỏi này được xếp ở{' '}
                      {
                        PRIMARY_COGNITIVE_LEVEL_METADATA[
                          highlightedQuestion.cognitiveLevel
                        ].shortLabel
                      }
                      ?
                    </div>
                    <p className="text-white leading-relaxed">
                      {highlightedQuestion.cognitiveLevelJustification}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-900/50 border border-blue-800 space-y-1">
                    <div className="font-semibold text-blue-200">Nội dung câu hỏi:</div>
                    <p className="text-white whitespace-pre-line">
                      {highlightedQuestion.stem}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ĐẶC THÙ MÔN TOÁN (8 DẠNG CÂU & KIỂM TRA PHÉP TÍNH TỰ ĐỘNG - MỤC IV)
      ===================================================================== */}
      {activeTab === 'MATH_SPECIALIZED' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  IV. Đặc thù Môn Toán Tiểu học &amp; Bộ Kiểm tra Phép tính – Tổng điểm Tự động
                </h2>
                <p className="text-xs text-slate-600">
                  Đang hiển thị đề Toán: <strong>{mathPackageForTab.title}</strong>. Hỗ trợ đầy đủ 8 dạng câu đặc thù môn Toán Tiểu học.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPrebuiltExam('PKG-PRIMARY-TOAN4-GK1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                    mathPackageForTab.id === 'PKG-PRIMARY-TOAN4-GK1'
                      ? 'bg-blue-800 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  Xem Toán Lớp 4 Giữa HK I
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPrebuiltExam('PKG-PRIMARY-TOAN5-CK1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                    mathPackageForTab.id === 'PKG-PRIMARY-TOAN5-CK1'
                      ? 'bg-blue-800 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  Xem Toán Lớp 5 Cuối HK I
                </button>
              </div>
            </div>

            {/* Bộ lọc 8 dạng câu đặc thù môn Toán */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMathCategoryFilter('ALL')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left cursor-pointer ${
                  selectedMathCategoryFilter === 'ALL'
                    ? 'bg-blue-900 text-white border-blue-950'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Tất cả 8 dạng</div>
                <div className="text-[11px] opacity-80">
                  {mathPackageForTab.questions.length} câu ({mathPackageForTab.totalPoints}đ)
                </div>
              </button>
              {(
                Object.keys(
                  PRIMARY_MATH_CATEGORY_LABELS
                ) as PrimaryMathQuestionCategory[]
              ).map((catKey) => {
                const count = mathPackageForTab.questions.filter(
                  (q) => q.mathCategory === catKey
                ).length;
                const isSelected = selectedMathCategoryFilter === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedMathCategoryFilter(catKey)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-800 text-white border-blue-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="line-clamp-2 text-[11px]">
                      {PRIMARY_MATH_CATEGORY_LABELS[catKey]}
                    </div>
                    <div className="text-[10px] mt-1 font-mono text-emerald-700 bg-emerald-50 inline-block px-1.5 py-0.5 rounded">
                      {count} câu trong đề
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kết quả Tự động kiểm tra phép tính và tổng điểm */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                <div className="text-xs text-emerald-950">
                  <div className="font-bold text-sm">
                    Hệ thống Tự động Kiểm tra Phép tính &amp; Tổng điểm Môn Toán: ĐẠT 100%
                  </div>
                  <div>
                    Đã kiểm tra tự động{' '}
                    <strong>
                      {
                        mathPackageForTab.analytics.mathVerificationSummary
                          ?.totalArithmeticStepsChecked
                      }{' '}
                      bước phép tính số học &amp; đại lượng
                    </strong>{' '}
                    cùng tổng điểm toàn đề{' '}
                    <strong>
                      {mathPackageForTab.analytics.totalPoints.toFixed(2)} /{' '}
                      {mathPackageForTab.totalPoints.toFixed(2)} điểm
                    </strong>
                    .
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-md bg-emerald-700 text-white text-xs font-bold">
                Khớp đáp số &amp; biểu điểm 100%
              </span>
            </div>

            {/* Danh sách câu hỏi Toán kèm bảng kiểm tra phép tính từng bước */}
            <div className="space-y-4">
              {mathPackageForTab.questions
                .filter(
                  (q) =>
                    selectedMathCategoryFilter === 'ALL' ||
                    q.mathCategory === selectedMathCategoryFilter
                )
                .map((q) => (
                  <div
                    key={q.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-blue-900 text-white text-xs font-bold">
                          {q.questionNumberLabel} ({q.points.toFixed(2)} điểm)
                        </span>
                        {q.mathCategory && (
                          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
                            {PRIMARY_MATH_CATEGORY_LABELS[q.mathCategory]}
                          </span>
                        )}
                        <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-xs font-semibold">
                          {PRIMARY_COGNITIVE_LEVEL_METADATA[q.cognitiveLevel].shortLabel}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-600">
                        Mã YCCĐ: {q.learningOutcomeCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-900 font-medium whitespace-pre-line">
                      {q.stem}
                    </p>

                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt) => (
                          <div
                            key={opt}
                            className={`p-2 rounded border ${
                              opt === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bảng Tự động kiểm tra phép tính của câu hỏi */}
                    {q.mathCalculationChecks && q.mathCalculationChecks.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-blue-700" />
                          <span>
                            Kiểm tra tự động phép tính số học &amp; đơn vị đo trong câu hỏi:
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700">
                                <th className="border border-slate-200 p-1.5 text-center">
                                  Bước
                                </th>
                                <th className="border border-slate-200 p-1.5 text-left">
                                  Biểu thức / Phép tính kiểm tra
                                </th>
                                <th className="border border-slate-200 p-1.5 text-center">
                                  Giá trị trong Đáp án
                                </th>
                                <th className="border border-slate-200 p-1.5 text-center">
                                  Máy tính kiểm chứng
                                </th>
                                <th className="border border-slate-200 p-1.5 text-left">
                                  Kết luận
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.mathCalculationChecks.map((chk) => (
                                <tr key={chk.stepOrder}>
                                  <td className="border border-slate-200 p-1.5 text-center font-bold">
                                    #{chk.stepOrder}
                                  </td>
                                  <td className="border border-slate-200 p-1.5 font-mono">
                                    {chk.expressionLabel}
                                  </td>
                                  <td className="border border-slate-200 p-1.5 text-center font-bold">
                                    {chk.expectedValue} {chk.unitLabel || ''}
                                  </td>
                                  <td className="border border-slate-200 p-1.5 text-center font-bold text-blue-800">
                                    {chk.computedValue} {chk.unitLabel || ''}
                                  </td>
                                  <td className="border border-slate-200 p-1.5 text-emerald-800 font-semibold">
                                    ✓ Chính xác ({chk.verificationNote})
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: ĐẶC THÙ MÔN TIẾNG VIỆT (ĐỌC THÀNH TIẾNG, ĐỌC HIỂU, KIẾN THỨC TV, VIẾT - MỤC V)
      ===================================================================== */}
      {activeTab === 'VIETNAMESE_SPECIALIZED' && (
        <div className="space-y-6">
          {/* Khung cấu hình Tỷ trọng điểm 4 phần môn Tiếng Việt theo mẫu trường xác nhận */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  V. Đặc thù Môn Tiếng Việt: Cấu hình 4 Phần &amp; Tỷ trọng điểm theo Mẫu trường xác nhận
                </h2>
                <p className="text-xs text-slate-600">
                  Cho phép xây dựng đầy đủ 4 phần: <strong>Đọc thành tiếng</strong>, <strong>Đọc hiểu</strong>, <strong>Kiến thức tiếng Việt</strong> và <strong>Viết</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPrebuiltExam('PKG-PRIMARY-TV4-GK1')}
                className="px-3 py-2 rounded-lg bg-blue-800 text-white text-xs font-semibold cursor-pointer"
              >
                Đang mở: Đề Tiếng Việt Lớp 4 Giữa HK I
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Đọc thành tiếng (điểm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={4}
                  value={vnWeights.docThanhTieng}
                  onChange={(e) =>
                    setVnWeights((prev) => ({
                      ...prev,
                      docThanhTieng: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Đọc hiểu văn bản (điểm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={5}
                  value={vnWeights.docHieu}
                  onChange={(e) =>
                    setVnWeights((prev) => ({
                      ...prev,
                      docHieu: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Kiến thức tiếng Việt (điểm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={4}
                  value={vnWeights.kienThucTiengViet}
                  onChange={(e) =>
                    setVnWeights((prev) => ({
                      ...prev,
                      kienThucTiengViet: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Kiểm tra Viết (điểm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={2}
                  max={6}
                  value={vnWeights.viet}
                  onChange={(e) =>
                    setVnWeights((prev) => ({
                      ...prev,
                      viet: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleApplyVietnameseWeightsToExam}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Áp dụng tỷ trọng ({(vnWeights.docThanhTieng + vnWeights.docHieu + vnWeights.kienThucTiengViet + vnWeights.viet).toFixed(1)}đ)
                </button>
              </div>
            </div>
          </div>

          {/* Phần 1 & 2: Phiếu đánh giá Đọc thành tiếng + Ngân hàng ngữ liệu Đọc hiểu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phiếu đánh giá Đọc thành tiếng */}
            {vietnamesePackageForTab.oralReadingSheet && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-blue-800 uppercase">
                      Phần I – Đọc thành tiếng ({vietnamesePackageForTab.oralReadingSheet.totalPoints.toFixed(1)} điểm)
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {vietnamesePackageForTab.oralReadingSheet.title}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-900 text-xs font-semibold">
                    Tốc độ: {vietnamesePackageForTab.oralReadingSheet.readingSpeedRequirement}
                  </span>
                </div>

                <div className="space-y-3">
                  {vietnamesePackageForTab.oralReadingSheet.passages.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>
                          {p.code}: {p.title} ({p.wordCount} chữ)
                        </span>
                        <span className="text-[11px] font-normal text-slate-500">
                          {p.sourceCitation}
                        </span>
                      </div>
                      <p className="text-slate-700 italic leading-relaxed">
                        "{p.excerptText}"
                      </p>
                      <div className="pt-1 text-blue-950">
                        <strong>Câu hỏi trả lời miệng:</strong> {p.oralQuestion}
                      </div>
                      <div className="text-emerald-900">
                        <strong>Đáp án gợi ý:</strong> {p.expectedOralAnswer}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Bảng tiêu chí chấm Đọc thành tiếng:
                  </div>
                  {vietnamesePackageForTab.oralReadingSheet.rubricItems.map((rub) => (
                    <div
                      key={rub.id}
                      className="p-2.5 rounded border border-slate-200 text-xs bg-white space-y-1"
                    >
                      <div className="font-bold text-slate-900">{rub.criterionName}</div>
                      <div className="text-[11px] text-slate-600">
                        • Tối đa: {rub.levelDescriptors.fullPoints} | Đạt một phần:{' '}
                        {rub.levelDescriptors.partialPoints}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ngữ liệu Đọc hiểu & Đề viết + Tiêu chí chấm bài viết */}
            <div className="space-y-6">
              {vietnamesePackageForTab.readingPassageBlock && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">
                      Phần II &amp; III – Ngữ liệu Đọc hiểu &amp; Kiến thức Tiếng Việt
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Mã: {vietnamesePackageForTab.readingPassageBlock.corpusCode}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 text-center">
                    {vietnamesePackageForTab.readingPassageBlock.title.toUpperCase()}
                  </h3>
                  <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {vietnamesePackageForTab.readingPassageBlock.content}
                  </div>
                  <div className="text-[11px] text-slate-500 italic text-right">
                    Nguồn: {vietnamesePackageForTab.readingPassageBlock.authorOrSource}
                  </div>
                </div>
              )}

              {vietnamesePackageForTab.writingAssessmentSpec && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-800 uppercase">
                      {vietnamesePackageForTab.writingAssessmentSpec.promptTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-xs font-bold">
                      Mức 3 – Viết sáng tạo
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs font-bold text-purple-950">
                    {vietnamesePackageForTab.writingAssessmentSpec.promptText}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Tiêu chí chấm bài viết và Biểu điểm chi tiết:
                    </div>
                    {vietnamesePackageForTab.writingAssessmentSpec.criteria.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{c.sectionName}</span>
                          <span className="text-blue-900">{c.maxPoints.toFixed(2)} điểm</span>
                        </div>
                        <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                          {c.detailedIndicators.map((ind, i) => (
                            <li key={i}>{ind}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: ĐỀ KIỂM TRA, ĐÁP ÁN & HƯỚNG DẪN CHẤM (KHÔNG TỰ ĐỘNG PHÊ DUYỆT)
      ===================================================================== */}
      {activeTab === 'EXAM_ANSWER_RUBRIC' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          {/* Cảnh báo bắt buộc: Không tự động phê duyệt đề do AI tạo */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-0.5">
                <div className="font-bold">
                  TRẠNG THÁI PHÊ DUYỆT: BẢN NHÁP ({selectedPackage.approvalStatus}) – TUYỆT ĐỐI KHÔNG TỰ ĐỘNG PHÊ DUYỆT
                </div>
                <p>{selectedPackage.aiOriginNotice}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleExportWord(selectedPackage)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-950 shrink-0 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Xuất trọn bộ Word (.doc)</span>
            </button>
          </div>

          <div className="border-b border-slate-200 pb-4 text-center space-y-1">
            <div className="text-xs font-bold text-slate-600 uppercase">
              ĐỀ KIỂM TRA ĐỊNH KỲ THEO THÔNG TƯ 27/2020/TT-BGDĐT
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedPackage.title.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-600">
              Môn: <strong>{selectedPackage.subject}</strong> | Khối:{' '}
              <strong>Lớp {selectedPackage.grade}</strong> | Kỳ:{' '}
              <strong>{PRIMARY_EXAM_PERIOD_LABELS[selectedPackage.period]}</strong> | Thời gian:{' '}
              <strong>{selectedPackage.durationMinutes} phút</strong> | Tổng điểm:{' '}
              <strong>{selectedPackage.totalPoints.toFixed(1)} điểm</strong>
            </p>
          </div>

          {selectedPackage.readingPassageBlock && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
              <div className="text-xs font-bold text-center text-slate-900 uppercase">
                NGỮ LIỆU ĐỌC HIỂU: {selectedPackage.readingPassageBlock.title}
              </div>
              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {selectedPackage.readingPassageBlock.content}
              </p>
              <div className="text-[11px] text-slate-500 italic text-right">
                ({selectedPackage.readingPassageBlock.authorOrSource})
              </div>
            </div>
          )}

          {/* Danh sách câu hỏi + Đáp án + Hướng dẫn chấm từng bước */}
          <div className="space-y-4">
            {selectedPackage.questions.map((q) => (
              <div
                key={q.id}
                className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-bold">
                      {q.questionNumberLabel} ({q.points.toFixed(2)} điểm)
                    </span>
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                      {PRIMARY_COGNITIVE_LEVEL_METADATA[q.cognitiveLevel].shortLabel}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Chủ đề: {q.topicTitle}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    [{q.learningOutcomeCode}]
                  </span>
                </div>

                <div className="text-xs text-slate-900 font-medium whitespace-pre-line leading-relaxed">
                  {q.stem}
                </div>

                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt}
                        className={`p-2 rounded border ${
                          opt === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                    <div className="font-bold text-emerald-950">Đáp án chuẩn:</div>
                    <p className="text-emerald-900 whitespace-pre-line">
                      {q.correctAnswer}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                    <div className="font-bold text-blue-950">
                      Hướng dẫn chấm &amp; Biểu điểm chi tiết:
                    </div>
                    <p className="text-slate-700">{q.gradingGuide}</p>
                    <ul className="list-disc list-inside text-[11px] text-blue-950 space-y-0.5 pt-1">
                      {q.rubricSteps.map((st, idx) => (
                        <li key={idx}>
                          {st.stepDescription}: <strong>{st.points.toFixed(2)} điểm</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: PHÂN TÍCH ĐỀ TỰ ĐỘNG (MỤC VI) & KIỂM THỬ 3 ĐỀ CHUẨN (MỤC VII)
      ===================================================================== */}
      {activeTab === 'ANALYTICS_AND_TEST_SUITE' && (
        <div className="space-y-6">
          {/* MỤC VI: PHÂN TÍCH ĐỀ TỰ ĐỘNG */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  VI. Phân tích Đề Tự động: {selectedPackage.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Thống kê tự động số câu, điểm số theo mức độ, chủ đề, YCCĐ, tỷ lệ TN/TL và danh sách những YCCĐ chưa được đánh giá.
                </p>
              </div>
              <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold">
                Tổng điểm: {selectedPackage.analytics.totalPoints.toFixed(2)} /{' '}
                {selectedPackage.totalPoints.toFixed(2)} điểm
              </span>
            </div>

            {/* Thống kê theo Mức 1, Mức 2, Mức 3 và Tỷ lệ Trắc nghiệm / Tự luận */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {selectedPackage.analytics.byLevel.map((lvl) => (
                <div
                  key={lvl.level}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="text-xs font-bold text-slate-700">{lvl.label}</div>
                  <div className="text-xl font-bold text-blue-950">
                    {lvl.points.toFixed(2)} điểm ({lvl.percentageOfPoints}%)
                  </div>
                  <div className="text-xs text-slate-600">
                    Số câu: <strong>{lvl.questionCount} câu</strong>
                  </div>
                </div>
              ))}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="text-xs font-bold text-blue-900">
                  Tỷ lệ Trắc nghiệm / Tự luận
                </div>
                <div className="text-sm font-bold text-slate-900">
                  TN: {selectedPackage.analytics.formatDistribution.objectivePercent}% (
                  {selectedPackage.analytics.formatDistribution.objectivePoints.toFixed(2)}đ)
                </div>
                <div className="text-sm font-bold text-slate-900">
                  TL: {selectedPackage.analytics.formatDistribution.constructedPercent}% (
                  {selectedPackage.analytics.formatDistribution.constructedPoints.toFixed(2)}đ)
                </div>
              </div>
            </div>

            {/* Thống kê theo Chủ đề & Theo Yêu cầu cần đạt */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase">
                  1. Thống kê số câu &amp; điểm theo Chủ đề
                </h3>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-2 text-left">Chủ đề</th>
                      <th className="border border-slate-300 p-2 text-center">Số câu</th>
                      <th className="border border-slate-300 p-2 text-center">Điểm</th>
                      <th className="border border-slate-300 p-2 text-center">Tỷ lệ %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPackage.analytics.byTopic.map((t) => (
                      <tr key={t.topicTitle}>
                        <td className="border border-slate-300 p-2 font-medium">
                          {t.topicTitle}
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {t.questionCount}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {t.points.toFixed(2)}đ
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {t.percentageOfPoints}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase">
                  2. Thống kê số câu theo Yêu cầu cần đạt (YCCĐ)
                </h3>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-2 text-left">Mã YCCĐ</th>
                      <th className="border border-slate-300 p-2 text-left">
                        Nội dung Yêu cầu cần đạt
                      </th>
                      <th className="border border-slate-300 p-2 text-center">Số câu</th>
                      <th className="border border-slate-300 p-2 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPackage.analytics.byLearningOutcome.map((lo) => (
                      <tr key={lo.learningOutcomeCode}>
                        <td className="border border-slate-300 p-2 font-mono font-bold text-blue-800">
                          {lo.learningOutcomeCode}
                        </td>
                        <td className="border border-slate-300 p-2 text-[11px]">
                          {lo.learningOutcomeText}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {lo.questionCount} ({lo.questionLabels.join(', ')})
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {lo.points.toFixed(2)}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Danh sách Những yêu cầu cần đạt chưa được đánh giá trong đề (Mục VI) */}
            <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase">
                <Layers className="w-4 h-4 text-amber-800" />
                <span>
                  Những Yêu cầu cần đạt thuộc phạm vi chương trình nhưng chưa được đánh giá trong đề này ({selectedPackage.analytics.unassessedLearningOutcomes.length} YCCĐ)
                </span>
              </div>
              {selectedPackage.analytics.unassessedLearningOutcomes.map((u) => (
                <div
                  key={u.learningOutcomeCode}
                  className="p-3 rounded-lg bg-white border border-amber-200 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900">
                    [{u.learningOutcomeCode}] Chủ đề: {u.topicTitle}
                  </div>
                  <div className="text-slate-700">{u.learningOutcomeText}</div>
                  <div className="text-[11px] text-amber-800 italic">
                    Ghi chú chuyên môn: {u.reasonNote}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MỤC VII: BÁO CÁO KIỂM THỬ NGHIỆM THU 3 ĐỀ TIỂU HỌC */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  VII. Báo cáo Kiểm thử Nghiệm thu 3 Bộ đề Tiểu học (Thông tư 27/2020/TT-BGDĐT)
                </h2>
                <p className="text-xs text-slate-500">
                  Kiểm tra tự động: 1. Đề Toán lớp 4 giữa HK I | 2. Đề Tiếng Việt lớp 4 giữa HK I | 3. Đề Toán lớp 5 cuối HK I.
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  acceptanceReport.allPassed
                    ? 'bg-emerald-700 text-white'
                    : 'bg-rose-700 text-white'
                }`}
              >
                {acceptanceReport.allPassed
                  ? 'KẾT QUẢ NGHIỆM THU: ĐẠT 3/3 BỘ ĐỀ (100%)'
                  : 'CẦN RÀ SOÁT LẠI'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {acceptanceReport.examResults.map((res, idx) => (
                <div
                  key={res.examPackageId}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-blue-900 text-white text-xs font-bold">
                        Đề kiểm thử #{idx + 1}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-xs font-bold">
                        ✓ ĐẠT CHUẨN TT27
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{res.examTitle}</h3>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        Ma trận: <strong>{res.hasMatrix ? 'Có đủ ✓' : 'Thiếu'}</strong>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        Bản đặc tả:{' '}
                        <strong>{res.hasSpecification ? 'Có đủ ✓' : 'Thiếu'}</strong>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        Đề kiểm tra:{' '}
                        <strong>{res.hasExamPaper ? 'Có đủ ✓' : 'Thiếu'}</strong>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        Đáp án &amp; HDC:{' '}
                        <strong>
                          {res.hasAnswerKey && res.hasGradingGuide ? 'Có đủ ✓' : 'Thiếu'}
                        </strong>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        Tổng điểm:{' '}
                        <strong className="text-emerald-800">
                          {res.totalPointsVerified.toFixed(1)} / 10,0đ ✓
                        </strong>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        Trạng thái:{' '}
                        <strong className="text-amber-800">
                          {res.isKeptAsDraftNotAutoApproved ? 'Bản nháp ✓' : 'Lỗi'}
                        </strong>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-[11px] text-slate-700">
                      {res.verificationDetails.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectPrebuiltExam(res.examPackageId);
                        setActiveTab('EXAM_ANSWER_RUBRIC');
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                    >
                      Mở xem chi tiết đề
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const pkg = packages.find((p) => p.id === res.examPackageId);
                        if (pkg) handleExportWord(pkg);
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-800 text-white text-xs font-semibold hover:bg-blue-900 cursor-pointer"
                    >
                      Tải Word (.doc)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
