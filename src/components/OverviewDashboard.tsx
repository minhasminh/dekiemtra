import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  DataSourceFilter,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  MenuSectionId,
  QuestionItem,
} from '../types/domain';
import {
  ASSESSMENT_RULES_BY_LEVEL,
  computeDashboardMetrics,
  getApprovalStatusInfo,
  getExamPeriodLabel,
} from '../services/business/assessmentRules';

interface OverviewDashboardProps {
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  exams: ExamPaper[];
  sourceFilter: DataSourceFilter;
  levelFilter: EducationLevelId | 'ALL';
  onNavigate: (section: MenuSectionId) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  questions,
  matrices,
  exams,
  sourceFilter,
  levelFilter,
  onNavigate,
}) => {
  const metrics = computeDashboardMetrics(questions, matrices, exams, sourceFilter, levelFilter);

  const primaryRules = ASSESSMENT_RULES_BY_LEVEL[EducationLevelId.PRIMARY];
  const secondaryRules = ASSESSMENT_RULES_BY_LEVEL[EducationLevelId.LOWER_SECONDARY];
  const highSchoolRules = ASSESSMENT_RULES_BY_LEVEL[EducationLevelId.UPPER_SECONDARY];

  return (
    <div className="space-y-8">
      {/* Khối thông tin phạm vi & nhanh thao tác */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-700">Giai đoạn 1 – Khởi tạo cốt lõi</span>
            <span aria-hidden="true">·</span>
            <span>Chương trình GDPT 2018</span>
            <span aria-hidden="true">·</span>
            <span>Tiểu học (Lớp 1–5) & THCS (Lớp 6–9)</span>
            <span aria-hidden="true">·</span>
            <span>Kiến trúc sẵn sàng mở rộng THPT (Lớp 10–12)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Bảng điều khiển Khảo thí & Ngân hàng Đề kiểm tra Thông minh
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hệ thống tách biệt bộ quy tắc đánh giá định kỳ theo từng cấp học: Tiểu học áp dụng 3 mức độ nhận thức
            (Thông tư 27/2020/TT-BGDĐT), THCS áp dụng 4 mức độ nhận thức và định dạng câu hỏi mới (Thông tư
            22/2021/TT-BGDĐT & Công văn 7991/BGDĐT-GDTrH).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('questions')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi mới
          </button>
          <button
            type="button"
            onClick={() => onNavigate('ai-generator')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            AI soạn câu hỏi
          </button>
        </div>
      </div>

      {/* 5 Chỉ số cốt lõi theo đúng yêu cầu Trang Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng số câu hỏi</span>
            <HelpCircle className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.totalQuestions}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 font-mono tabular-nums">
              <span>Mẫu: {metrics.sampleQuestionsCount}</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-700 font-medium">Thật: {metrics.realQuestionsCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Số ma trận & đặc tả</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.totalMatrices}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Chuẩn hóa theo từng cấp học
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng số đề kiểm tra</span>
            <FileText className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.totalExams}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Kèm đáp án & hướng dẫn chấm
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Đề đang chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-amber-600 font-mono tabular-nums">
              {metrics.pendingApprovalExams}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span>Cần sửa: {metrics.revisionRequiredExams}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onNavigate('approval')}
                className="text-blue-700 hover:underline font-medium cursor-pointer"
              >
                Xử lý ngay
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Đề đã phê duyệt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-emerald-600 font-mono tabular-nums">
              {metrics.approvedExams}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Đủ điều kiện đưa vào hồ sơ
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê theo Môn học & Thống kê theo Khối lớp (Lớp 1 - 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Bảng thống kê theo môn học */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Thống kê theo môn học và cấp học
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp số lượng câu hỏi, ma trận và đề kiểm tra hiện có theo bộ lọc dữ liệu
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('questions')}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Mở ngân hàng câu hỏi
              </button>
            </div>

            {metrics.bySubject.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Chưa có dữ liệu môn học khớp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-2.5 pr-4">Môn học</th>
                      <th className="py-2.5 px-3">Cấp học</th>
                      <th className="py-2.5 px-3 text-right">Số câu hỏi</th>
                      <th className="py-2.5 px-3 text-right">Số ma trận</th>
                      <th className="py-2.5 pl-3 text-right">Số đề kiểm tra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {metrics.bySubject.map((row) => (
                      <tr key={`${row.levelShortName}-${row.subject}`} className="hover:bg-slate-50/80">
                        <td className="py-3 pr-4 font-medium text-slate-900">{row.subject}</td>
                        <td className="py-3 px-3 text-xs text-slate-600">{row.levelShortName}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                          {row.questionsCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {row.matricesCount}
                        </td>
                        <td className="py-3 pl-3 text-right font-mono tabular-nums text-slate-700">
                          {row.examsCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu được cập nhật trực tiếp từ Lớp lưu trữ (Repository Layer)</span>
            <span className="font-mono tabular-nums">{metrics.bySubject.length} môn học hoạt động</span>
          </div>
        </div>

        {/* Thống kê theo Khối lớp (Lớp 1-5 & Lớp 6-9) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Phân bố theo khối lớp (Lớp 1 – Lớp 9)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tiểu học (Khối 1–5) và THCS (Khối 6–9) theo quy tắc đánh giá riêng
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              {metrics.byGrade.map((g) => {
                const isPrimary = g.levelId === EducationLevelId.PRIMARY;
                const maxBar = Math.max(...metrics.byGrade.map((x) => x.questionsCount), 4);
                const widthPercent = Math.min(100, Math.round((g.questionsCount / maxBar) * 100));

                return (
                  <div
                    key={g.grade}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-[115px]">
                      <div className="text-xs font-semibold text-slate-900">
                        Khối lớp {g.grade}{' '}
                        <span className="font-normal text-slate-500">
                          · {isPrimary ? 'Tiểu học' : 'THCS'}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPrimary ? 'bg-blue-600' : 'bg-amber-500'}`}
                          style={{ width: `${Math.max(widthPercent, g.questionsCount > 0 ? 15 : 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono tabular-nums shrink-0">
                      <span className="text-slate-700">
                        <strong>{g.questionsCount}</strong> câu
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-700">
                        <strong>{g.examsCount}</strong> đề
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-emerald-700">
                        Duyệt: <strong>{g.approvedCount}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Khối 10–12 (THPT): Đã định nghĩa khung quy tắc mở rộng</span>
            <button
              type="button"
              onClick={() => onNavigate('curriculum')}
              className="text-blue-700 font-medium hover:underline cursor-pointer"
            >
              Xem quy tắc cấp học
            </button>
          </div>
        </div>
      </div>

      {/* Bộ quy tắc đánh giá tách biệt theo từng cấp học (Không áp dụng chung 1 cấu trúc đề) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700" />
              Kiến trúc Bộ quy tắc Đánh giá theo Cấp học (Chương trình GDPT 2018)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi cấp học áp dụng độc lập thang mức độ nhận thức, định dạng câu hỏi và thời lượng theo Thông tư của Bộ GD&ĐT
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('matrix')}
            className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Thiết lập ma trận theo cấp học
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[primaryRules, secondaryRules, highSchoolRules].map((rule) => (
            <div
              key={rule.levelId}
              className={`rounded-xl border p-5 flex flex-col justify-between ${
                rule.isExpansionReadyOnly
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-blue-700">{rule.legalBasis}</span>
                  <span>
                    {rule.isExpansionReadyOnly ? 'Sẵn sàng mở rộng' : 'Đang hoạt động'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{rule.levelName}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.periodicAssessmentNote}</p>

                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-800 mb-2">
                    Thang mức độ nhận thức ({rule.cognitiveLevels.length} mức):
                  </div>
                  <div className="space-y-1.5">
                    {rule.cognitiveLevels.map((cog) => (
                      <div
                        key={cog.code}
                        className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-md"
                      >
                        <span className="font-medium text-slate-800">{cog.name}</span>
                        <span className="font-mono tabular-nums text-slate-600">
                          {cog.recommendedPercentageRange[0]}% – {cog.recommendedPercentageRange[1]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
                <span>Định dạng chuẩn: {rule.allowedFormats.length} loại câu hỏi</span>
                <span className="font-mono tabular-nums">Thang {rule.scoringScale} điểm</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách đề kiểm tra gần đây và trạng thái thẩm định */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              Đề kiểm tra & Trạng thái Phê duyệt gần đây
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân biệt rõ dữ liệu mẫu thử nghiệm và dữ liệu thật do giáo viên nhà trường khởi tạo
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('approval')}
            className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
          >
            Xem toàn bộ quy trình duyệt
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Mã đề / Tên đề kiểm tra</th>
                <th className="py-2.5 px-3">Khối / Môn</th>
                <th className="py-2.5 px-3">Kỳ kiểm tra</th>
                <th className="py-2.5 px-3">Nguồn dữ liệu</th>
                <th className="py-2.5 px-3">Trạng thái duyệt</th>
                <th className="py-2.5 pl-3 text-right">Thời lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {exams.slice(0, 5).map((exam) => {
                const statusInfo = getApprovalStatusInfo(exam.status);
                return (
                  <tr key={exam.id} className="hover:bg-slate-50/80">
                    <td className="py-3 pr-4">
                      <div className="font-mono text-xs text-slate-500">{exam.code}</div>
                      <div className="font-medium text-slate-900">{exam.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Người lập: {exam.authorName} · Cập nhật: {exam.updatedAt}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-700 whitespace-nowrap">
                      Lớp {exam.grade} · {exam.subject}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                      {getExamPeriodLabel(exam.examPeriod)}
                    </td>
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      {exam.isSampleData ? (
                        <span className="text-amber-700 font-medium">Dữ liệu mẫu</span>
                      ) : (
                        <span className="text-blue-700 font-semibold">Dữ liệu thật</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      <span className={`font-semibold ${statusInfo.textClass}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right font-mono tabular-nums text-xs text-slate-700 whitespace-nowrap">
                      {exam.durationMinutes} phút
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
