import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Lock,
  Plus,
  RotateCcw,
  Settings,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import {
  ApprovalStatus,
  CognitiveLevelCode,
  DataSourceFilter,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  GradeNumber,
  MenuSectionId,
  QuestionItem,
  StorageConfig,
} from '../types/domain';
import {
  ASSESSMENT_RULES_BY_LEVEL,
  filterByDataSource,
  getApprovalStatusInfo,
  getCognitiveShortLabel,
  getExamPeriodLabel,
  getRuleSetForLevel,
} from '../services/business/assessmentRules';
import { SmartQuestionLinkAdminConfigPanel } from './SmartQuestionLinkWorkspace';
import { GitHubDataStoragePanel } from './GitHubDataStoragePanel';

interface MatrixSpecificationViewProps {
  matrices: ExamMatrix[];
  sourceFilter: DataSourceFilter;
  onAddMatrix: (m: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const MatrixSpecificationView: React.FC<MatrixSpecificationViewProps> = ({
  matrices,
  sourceFilter,
  onAddMatrix,
  onNotify,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<EducationLevelId>(EducationLevelId.PRIMARY);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const ruleSet = getRuleSetForLevel(selectedLevel);
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<GradeNumber>(3);
  const [subject, setSubject] = useState<string>('Toán');
  const [examPeriod, setExamPeriod] = useState<ExamMatrix['examPeriod']>('GIUA_KY_1');
  const [durationMinutes, setDurationMinutes] = useState<number>(40);
  const [rowTopic, setRowTopic] = useState('');
  const [rowSummary, setRowSummary] = useState('');

  const handleSwitchLevel = (lvl: EducationLevelId) => {
    setSelectedLevel(lvl);
    const r = getRuleSetForLevel(lvl);
    setGrade(r.grades[0]);
    setSubject(r.subjects[0]);
    setDurationMinutes(lvl === EducationLevelId.PRIMARY ? 40 : 60);
  };

  const filteredMatrices = filterByDataSource(matrices, sourceFilter).filter(
    (m) => m.levelId === selectedLevel
  );

  const handleCreateMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rowTopic.trim() || !rowSummary.trim()) {
      onNotify(
        'error',
        'Thiếu thông tin ma trận',
        'Vui lòng nhập đầy đủ Tên ma trận, Chủ đề kiến thức và Mô tả bản đặc tả.'
      );
      return;
    }

    const defaultCounts =
      selectedLevel === EducationLevelId.PRIMARY
        ? {
            [CognitiveLevelCode.PRIMARY_MUC_1]: 5,
            [CognitiveLevelCode.PRIMARY_MUC_2]: 3,
            [CognitiveLevelCode.PRIMARY_MUC_3]: 2,
          }
        : {
            [CognitiveLevelCode.SEC_NHAN_BIET]: 8,
            [CognitiveLevelCode.SEC_THONG_HIEU]: 6,
            [CognitiveLevelCode.SEC_VAN_DUNG]: 3,
            [CognitiveLevelCode.SEC_VAN_DUNG_CAO]: 1,
          };

    const defaultPoints =
      selectedLevel === EducationLevelId.PRIMARY
        ? {
            [CognitiveLevelCode.PRIMARY_MUC_1]: 4.0,
            [CognitiveLevelCode.PRIMARY_MUC_2]: 4.0,
            [CognitiveLevelCode.PRIMARY_MUC_3]: 2.0,
          }
        : {
            [CognitiveLevelCode.SEC_NHAN_BIET]: 3.5,
            [CognitiveLevelCode.SEC_THONG_HIEU]: 3.5,
            [CognitiveLevelCode.SEC_VAN_DUNG]: 2.0,
            [CognitiveLevelCode.SEC_VAN_DUNG_CAO]: 1.0,
          };

    const totalQuestions = Object.values(defaultCounts).reduce((a, b) => a + b, 0);

    onAddMatrix({
      title: title.trim(),
      levelId: selectedLevel,
      grade,
      subject,
      examPeriod,
      durationMinutes,
      totalPoints: 10,
      totalQuestions,
      status: ApprovalStatus.APPROVED,
      authorName: 'Tổ Chuyên môn Nhà trường',
      isSampleData: false,
      rows: [
        {
          id: `row-${Date.now()}`,
          topicTitle: rowTopic.trim(),
          learningOutcomeSummary: rowSummary.trim(),
          countsByCognitiveLevel: defaultCounts,
          pointsByCognitiveLevel: defaultPoints,
          formatSummary:
            selectedLevel === EducationLevelId.PRIMARY
              ? 'Kết hợp Trắc nghiệm khoanh tròn, Điền khuyết và Tự luận (TT 27/2020)'
              : 'Kết hợp TN nhiều lựa chọn, Đúng/Sai, Trả lời ngắn và Tự luận (TT 22/2021)',
        },
      ],
    });

    setTitle('');
    setRowTopic('');
    setRowSummary('');
    setShowCreateForm(false);
    onNotify(
      'success',
      'Đã lập Ma trận & Bản đặc tả mới',
      `Ma trận môn ${subject} Lớp ${grade} đã được lưu vào Dữ liệu thật.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Ma trận và Bản đặc tả Đề kiểm tra Định kỳ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết kế tách biệt cấu trúc cột mức độ nhận thức: Tiểu học (3 mức độ) và THCS (4 mức độ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleSwitchLevel(EducationLevelId.PRIMARY)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                selectedLevel === EducationLevelId.PRIMARY
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ma trận Tiểu học (3 mức)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchLevel(EducationLevelId.LOWER_SECONDARY)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                selectedLevel === EducationLevelId.LOWER_SECONDARY
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ma trận THCS (4 mức)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showCreateForm ? 'Đóng biểu mẫu' : 'Tạo ma trận mới'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateMatrix}
          className="bg-white border border-blue-200 rounded-xl p-6 space-y-4"
        >
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Khởi tạo Khung Ma trận & Bản đặc tả ({ruleSet.shortName} – Lưu vào Dữ liệu thật)
            </h3>
            <span className="text-xs text-blue-700 font-medium">{ruleSet.legalBasis}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Ma trận đề kiểm tra (*)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Ma trận Đề kiểm tra Cuối kỳ I – Toán 4"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeNumber)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {ruleSet.grades.map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {ruleSet.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kỳ kiểm tra định kỳ
              </label>
              <select
                value={examPeriod}
                onChange={(e) => setExamPeriod(e.target.value as ExamMatrix['examPeriod'])}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="GIUA_KY_1">Giữa học kỳ I</option>
                <option value="CUOI_KY_1">Cuối học kỳ I</option>
                <option value="GIUA_KY_2">Giữa học kỳ II</option>
                <option value="CUOI_KY_2">Cuối học kỳ II</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian làm bài (phút)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chủ đề / Mạch nội dung trọng tâm (*)
              </label>
              <input
                type="text"
                value={rowTopic}
                onChange={(e) => setRowTopic(e.target.value)}
                placeholder="VD: Số tự nhiên và Hình học phẳng"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung Bản đặc tả mức độ đánh giá (*)
            </label>
            <textarea
              rows={2}
              value={rowSummary}
              onChange={(e) => setRowSummary(e.target.value)}
              placeholder="Mô tả chuẩn kiến thức, kĩ năng cần kiểm tra..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              Lưu Ma trận & Bản đặc tả
            </button>
          </div>
        </form>
      )}

      {/* Danh sách ma trận */}
      <div className="space-y-5">
        {filteredMatrices.map((matrix) => {
          const statusInfo = getApprovalStatusInfo(matrix.status);
          return (
            <div
              key={matrix.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-blue-700">{matrix.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-800">
                    Lớp {matrix.grade} · Môn {matrix.subject}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{getExamPeriodLabel(matrix.examPeriod)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{matrix.durationMinutes} phút</span>
                </div>

                <div className="flex items-center gap-2">
                  {matrix.isSampleData ? (
                    <span className="text-amber-700 font-medium">Dữ liệu mẫu</span>
                  ) : (
                    <span className="text-blue-700 font-semibold">Dữ liệu thật</span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className={`font-semibold ${statusInfo.textClass}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{matrix.title}</h3>

              {/* Bảng chi tiết ma trận có cột mức độ nhận thức theo đúng Cấp học */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <th className="p-2.5 border-r border-slate-200">Mạch nội dung / Chủ đề</th>
                      <th className="p-2.5 border-r border-slate-200">Bản đặc tả Yêu cầu cần đạt</th>
                      {ruleSet.cognitiveLevels.map((cog) => (
                        <th
                          key={cog.code}
                          className="p-2.5 border-r border-slate-200 text-center whitespace-nowrap"
                        >
                          {cog.shortLabel}
                        </th>
                      ))}
                      <th className="p-2.5">Cấu trúc câu hỏi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {matrix.rows.map((row) => (
                      <tr key={row.id}>
                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-900">
                          {row.topicTitle}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-600">
                          {row.learningOutcomeSummary}
                        </td>
                        {ruleSet.cognitiveLevels.map((cog) => {
                          const count = row.countsByCognitiveLevel[cog.code] || 0;
                          const pts = row.pointsByCognitiveLevel[cog.code] || 0;
                          return (
                            <td
                              key={cog.code}
                              className="p-2.5 border-r border-slate-200 text-center font-mono tabular-nums"
                            >
                              {count > 0 ? (
                                <div>
                                  <span className="font-bold text-slate-900">{count} câu</span>
                                  <div className="text-slate-500">({pts}đ)</div>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-2.5 text-slate-700">{row.formatSummary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Tổng cộng: <strong className="font-mono tabular-nums">{matrix.totalQuestions}</strong> câu hỏi · Thang điểm{' '}
                  <strong className="font-mono tabular-nums">{matrix.totalPoints}</strong>
                </span>
                <span className="text-amber-700 font-medium">
                  Xuất file Word Phụ lục 1 & Phụ lục 2 chuẩn Bộ GD&ĐT: Chưa triển khai (Giai đoạn 2)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ExamBuilderViewProps {
  exams: ExamPaper[];
  matrices: ExamMatrix[];
  questions: QuestionItem[];
  sourceFilter: DataSourceFilter;
  onAddExam: (e: Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const ExamBuilderView: React.FC<ExamBuilderViewProps> = ({
  exams,
  matrices,
  questions,
  sourceFilter,
  onAddExam,
  onNotify,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [showBuilderForm, setShowBuilderForm] = useState(false);

  const [levelId, setLevelId] = useState<EducationLevelId>(EducationLevelId.PRIMARY);
  const ruleSet = getRuleSetForLevel(levelId);
  const [grade, setGrade] = useState<GradeNumber>(3);
  const [subject, setSubject] = useState<string>('Toán');
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(40);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const filteredExams = filterByDataSource(exams, sourceFilter);
  const activeExam = filteredExams.find((e) => e.id === selectedExamId) || filteredExams[0];

  // Chỉ câu hỏi đạt điều kiện phê duyệt (APPROVED) mới được sử dụng trong đề chính thức
  const candidateQuestions = questions.filter(
    (q) => q.levelId === levelId && q.status === ApprovalStatus.APPROVED
  );
  const nonApprovedCountForLevel = questions.filter(
    (q) => q.levelId === levelId && q.status !== ApprovalStatus.APPROVED
  ).length;

  const handleToggleQuestion = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedQuestionIds.length === 0) {
      onNotify(
        'error',
        'Chưa đủ thông tin tạo đề',
        'Vui lòng nhập tiêu đề đề kiểm tra và chọn ít nhất 01 câu hỏi Đã duyệt từ ngân hàng.'
      );
      return;
    }

    const approvedMatricesForLevel = matrices.filter(
      (m) => m.levelId === levelId && m.status === ApprovalStatus.APPROVED
    );
    const matchingMatrix =
      approvedMatricesForLevel.find(
        (m) => m.grade === grade && m.subject === subject
      ) || approvedMatricesForLevel[0];

    if (!matchingMatrix) {
      onNotify(
        'error',
        'Chưa có Ma trận & Bản đặc tả được phê duyệt',
        'Nguyên tắc bắt buộc: Ma trận và bản đặc tả phải được xây dựng và phê duyệt trước khi tạo đề chính thức.'
      );
      return;
    }

    onAddExam({
      title: title.trim(),
      levelId,
      grade,
      subject,
      examPeriod: matchingMatrix.examPeriod || 'GIUA_KY_1',
      matrixId: matchingMatrix.id,
      durationMinutes,
      questionIds: selectedQuestionIds,
      totalPoints: matchingMatrix.totalPoints || 10,
      status: ApprovalStatus.PENDING,
      authorName: 'Giáo viên Bộ môn',
      isSampleData: false,
    });

    setTitle('');
    setSelectedQuestionIds([]);
    setShowBuilderForm(false);
    onNotify(
      'success',
      'Đã tạo đề kiểm tra theo Ma trận & gửi chờ duyệt',
      `Đề kiểm tra đã liên kết với Ma trận ${matchingMatrix.code} và cập nhật lịch sử sử dụng câu hỏi.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Xây dựng Đề kiểm tra, Đáp án & Hướng dẫn chấm
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kết nối trực tiếp Ngân hàng câu hỏi và Ma trận đề · Chỉ câu hỏi Đã duyệt mới được đưa vào đề chính thức
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBuilderForm(!showBuilderForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showBuilderForm ? 'Đóng khung lắp ghép đề' : 'Lắp ghép đề kiểm tra mới'}
        </button>
      </div>

      {showBuilderForm && (
        <form
          onSubmit={handleCreateExam}
          className="bg-white border border-blue-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Lắp ghép Đề kiểm tra Mới từ Ngân hàng câu hỏi (Lưu vào Dữ liệu thật)
            </h3>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setLevelId(EducationLevelId.PRIMARY);
                  setGrade(3);
                  setSubject('Toán');
                  setSelectedQuestionIds([]);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  levelId === EducationLevelId.PRIMARY ? 'bg-blue-700 text-white' : 'text-slate-600'
                }`}
              >
                Tiểu học
              </button>
              <button
                type="button"
                onClick={() => {
                  setLevelId(EducationLevelId.LOWER_SECONDARY);
                  setGrade(8);
                  setSubject('Toán');
                  setSelectedQuestionIds([]);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  levelId === EducationLevelId.LOWER_SECONDARY
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600'
                }`}
              >
                THCS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu đề Đề kiểm tra (*)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Đề kiểm tra định kỳ Giữa kỳ I – Toán Lớp 3 (Đề số 2)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeNumber)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {ruleSet.grades.map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Chọn câu hỏi ĐÃ DUYỆT thuộc {ruleSet.shortName} đưa vào đề ({selectedQuestionIds.length} câu đã chọn):
              </label>
              {nonApprovedCountForLevel > 0 && (
                <span className="text-xs text-amber-700 font-medium">
                  Đã ẩn {nonApprovedCountForLevel} câu hỏi ở trạng thái Nháp / Chờ duyệt / Ngừng sử dụng
                </span>
              )}
            </div>
            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {candidateQuestions.map((q) => (
                <label
                  key={q.id}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.includes(q.id)}
                    onChange={() => handleToggleQuestion(q.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">
                      [{q.code} · v{q.version || 1}] Lớp {q.grade} · {q.subject} ·{' '}
                      {getCognitiveShortLabel(q.cognitiveLevel)} ({q.points}đ) — <span className="text-emerald-700">Đã duyệt</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{q.stem}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowBuilderForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              Đóng gói đề & Gửi Tổ chuyên môn duyệt
            </button>
          </div>
        </form>
      )}

      {/* Khung xem đề kiểm tra, đáp án và hướng dẫn chấm */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 px-1">
            Danh sách Đề kiểm tra ({filteredExams.length})
          </div>
          {filteredExams.map((ex) => {
            const st = getApprovalStatusInfo(ex.status);
            const isSelected = activeExam?.id === ex.id;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExamId(ex.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono font-semibold text-blue-700">{ex.code}</span>
                  <span className={`font-semibold ${st.textClass}`}>{st.label}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">{ex.title}</div>
                <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
                  <span>Lớp {ex.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ex.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{ex.durationMinutes} phút</span>
                  <span aria-hidden="true">·</span>
                  <span>{ex.isSampleData ? 'Dữ liệu mẫu' : 'Dữ liệu thật'}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          {activeExam ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="pb-4 border-b border-slate-200 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">
                    Mã đề: <strong className="font-mono text-slate-800">{activeExam.code}</strong> ·{' '}
                    {getExamPeriodLabel(activeExam.examPeriod)} · Thời gian:{' '}
                    <strong className="font-mono tabular-nums">{activeExam.durationMinutes} phút</strong>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{activeExam.title}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800">
                  I. NỘI DUNG CÂU HỎI TRONG ĐỀ & HƯỚNG DẪN CHẤM:
                </div>
                {activeExam.questionIds.map((qid, index) => {
                  const qObj = questions.find((q) => q.id === qid);
                  if (!qObj) return null;
                  return (
                    <div
                      key={qid}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>
                          Câu {index + 1} ({getCognitiveShortLabel(qObj.cognitiveLevel)} –{' '}
                          {qObj.points} điểm):
                        </span>
                        <span className="font-mono text-slate-500">{qObj.code}</span>
                      </div>
                      <p className="text-sm text-slate-900">{qObj.stem}</p>
                      {qObj.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-slate-700">
                          {qObj.options.map((o, i) => (
                            <div key={i}>{o}</div>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200/70 text-slate-700">
                        <strong className="text-emerald-700">Đáp án:</strong> {qObj.correctAnswer}
                        <div className="mt-1">
                          <strong>Hướng dẫn chấm:</strong> {qObj.gradingGuide}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thông báo rõ tính năng Giai đoạn 2 */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div className="text-slate-600">
                  <strong>Tính năng nâng cao:</strong> Trộn tự động 4–24 mã đề trắc nghiệm & Xuất file Word/PDF in ấn
                </div>
                <span className="font-semibold text-amber-700 whitespace-nowrap shrink-0">
                  Chưa triển khai (Giai đoạn 2)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
              Chọn một đề kiểm tra ở cột bên trái để xem chi tiết đề bài, đáp án và hướng dẫn chấm.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ApprovalWorkflowViewProps {
  exams: ExamPaper[];
  sourceFilter: DataSourceFilter;
  onUpdateApproval: (
    examId: string,
    status: ApprovalStatus,
    reviewerName: string,
    reviewComment: string
  ) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const ApprovalWorkflowView: React.FC<ApprovalWorkflowViewProps> = ({
  exams,
  sourceFilter,
  onUpdateApproval,
  onNotify,
}) => {
  const [reviewerName, setReviewerName] = useState('Ban Giám hiệu / Tổ trưởng Chuyên môn');
  const [commentByExam, setCommentByExam] = useState<Record<string, string>>({});

  const filteredExams = filterByDataSource(exams, sourceFilter);

  const handleDecision = (exam: ExamPaper, nextStatus: ApprovalStatus) => {
    const defaultComments: Record<ApprovalStatus, string> = {
      [ApprovalStatus.DRAFT]: 'Chuyển về Bản nháp để giáo viên tiếp tục biên soạn.',
      [ApprovalStatus.PENDING]: 'Gửi Tổ chuyên môn thẩm định.',
      [ApprovalStatus.IN_REVIEW]: 'Đang thực hiện phản biện và thẩm định chuyên môn.',
      [ApprovalStatus.REVISION_REQUIRED]:
        'Đề nghị rà soát lại câu lệnh và bổ sung biểu điểm chi tiết.',
      [ApprovalStatus.REVISED]:
        'Giáo viên đã tiếp thu góp ý và hoàn thành chỉnh sửa hồ sơ.',
      [ApprovalStatus.PENDING_APPROVAL]:
        'Tổ chuyên môn đã thẩm định đạt chuẩn, trình Ban Giám hiệu phê duyệt.',
      [ApprovalStatus.APPROVED]:
        'Đề kiểm tra đảm bảo đúng ma trận, đặc tả và quy tắc đánh giá của cấp học.',
      [ApprovalStatus.PUBLISHED]:
        'Phát hành chính thức bộ đề kiểm tra phục vụ kỳ thi định kỳ.',
      [ApprovalStatus.ARCHIVED]:
        'Đóng gói và lưu trữ vào kho Hồ sơ khảo thí nhà trường.',
      [ApprovalStatus.DEPRECATED]: 'Ngừng sử dụng.',
    };

    const comment = commentByExam[exam.id]?.trim() || defaultComments[nextStatus];

    onUpdateApproval(exam.id, nextStatus, reviewerName.trim() || 'Hội đồng thẩm định', comment);

    const stInfo = getApprovalStatusInfo(nextStatus);
    onNotify(
      nextStatus === ApprovalStatus.REVISION_REQUIRED ? 'warning' : 'success',
      `Đã chuyển trạng thái: ${stInfo.label}`,
      `Đề "${exam.code}" đã được cập nhật sang trạng thái "${stInfo.label}".`
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Quy trình Thẩm định, Phê duyệt & Phát hành Đề kiểm tra (6 Giai đoạn)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vòng đời: Bản nháp → Chờ thẩm định → Chờ phê duyệt → Đã phê duyệt → Đã phát hành → Lưu trữ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Người duyệt hiện tại:
          </label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white w-64"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredExams.map((exam) => {
          const st = getApprovalStatusInfo(exam.status);
          return (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-blue-700">{exam.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-800">
                    Lớp {exam.grade} ({exam.levelId === EducationLevelId.PRIMARY ? 'Tiểu học' : 'THCS'})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-800">Môn {exam.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>Người trình: {exam.authorName}</span>
                  {exam.seed && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-indigo-700">Seed: {exam.seed}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span>{exam.isSampleData ? 'Dữ liệu mẫu' : 'Dữ liệu thật'}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`font-bold ${st.textClass}`}>{st.label}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{exam.title}</h3>

              {exam.reviewComment && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <strong>Ý kiến thẩm định gần nhất ({exam.reviewerName}):</strong>{' '}
                  {exam.reviewComment}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <input
                  type="text"
                  value={commentByExam[exam.id] ?? ''}
                  onChange={(e) =>
                    setCommentByExam({ ...commentByExam, [exam.id]: e.target.value })
                  }
                  placeholder="Nhập nhận xét thẩm định / phê duyệt / phát hành..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecision(exam, ApprovalStatus.PENDING)}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg cursor-pointer"
                  >
                    1. Gửi Chờ thẩm định
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(exam, ApprovalStatus.PENDING_APPROVAL)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg cursor-pointer"
                  >
                    2. Chuyển Chờ phê duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(exam, ApprovalStatus.APPROVED)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    3. Phê duyệt chính thức
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(exam, ApprovalStatus.PUBLISHED)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                  >
                    4. Phát hành đề
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(exam, ApprovalStatus.ARCHIVED)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    5. Đưa vào Lưu trữ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(exam, ApprovalStatus.REVISION_REQUIRED)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                  >
                    Yêu cầu chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SecondaryModulesViewProps {
  section: MenuSectionId;
  exams: ExamPaper[];
  questions: QuestionItem[];
  matrices: ExamMatrix[];
  config: StorageConfig;
  onSaveConfig: (cfg: StorageConfig) => void;
  onResetSeedData: () => void;
  onReloadDataFromServer?: () => Promise<void> | void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const SecondaryModulesView: React.FC<SecondaryModulesViewProps> = ({
  section,
  exams,
  questions,
  matrices,
  config,
  onSaveConfig,
  onResetSeedData,
  onReloadDataFromServer,
  onNotify,
}) => {
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [departmentName, setDepartmentName] = useState(config.departmentName);
  const [academicYear, setAcademicYear] = useState(config.academicYear);

  if (section === 'records') {
    const approvedExams = exams.filter((e) => e.status === ApprovalStatus.APPROVED);
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-blue-700" />
              Hồ sơ Kiểm tra Định kỳ (Giai đoạn 1)
            </h2>
            <span className="text-xs font-semibold text-amber-700">
              Đóng gói lưu trữ chữ ký số điện tử: Chưa triển khai (Giai đoạn 2)
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Danh mục các bộ hồ sơ đề kiểm tra đã được phê duyệt (gồm Ma trận, Bản đặc tả, Đề chính thức, Đáp án và Hướng dẫn chấm).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {approvedExams.map((ex) => (
            <div key={ex.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  Mã hồ sơ: <strong className="font-mono text-blue-700">{ex.code}</strong> · Lớp {ex.grade} · Môn {ex.subject} ·{' '}
                  {ex.isSampleData ? 'Dữ liệu mẫu' : 'Dữ liệu thật'}
                </div>
                <div className="text-sm font-bold text-slate-900">{ex.title}</div>
                <div className="text-xs text-slate-600">
                  Người phê duyệt: {ex.reviewerName || 'Ban Giám hiệu'} · Ngày duyệt: {ex.updatedAt}
                </div>
              </div>
              <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg shrink-0">
                Xuất bộ hồ sơ PDF đóng dấu: Chưa triển khai
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'reports') {
    const primaryQ = questions.filter((q) => q.levelId === EducationLevelId.PRIMARY).length;
    const secQ = questions.filter((q) => q.levelId === EducationLevelId.LOWER_SECONDARY).length;
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            Báo cáo – Thống kê Chuyên môn
          </h2>
          <p className="text-xs text-slate-600">
            Tổng hợp số liệu ngân hàng câu hỏi và tiến độ xây dựng ma trận đề kiểm tra Giai đoạn 1.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-500">Câu hỏi Cấp Tiểu học (Lớp 1–5)</div>
            <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-2">
              {primaryQ} câu
            </div>
            <div className="text-xs text-slate-500 mt-1">Theo 3 mức độ Thông tư 27/2020</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-500">Câu hỏi Cấp THCS (Lớp 6–9)</div>
            <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-2">
              {secQ} câu
            </div>
            <div className="text-xs text-slate-500 mt-1">Theo 4 mức độ Thông tư 22/2021</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-500">Tỷ lệ Đề kiểm tra đã phê duyệt</div>
            <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-2">
              {exams.length > 0
                ? Math.round(
                    (exams.filter((e) => e.status === ApprovalStatus.APPROVED).length /
                      exams.length) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-slate-500 mt-1">Tổng số {matrices.length} ma trận đã lập</div>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 space-y-2">
          <div className="text-sm font-bold text-amber-950">
            Phân hệ Phân tích phổ điểm sau kiểm tra & Độ phân cách câu hỏi (IRT): Chưa triển khai
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Chức năng nhập bảng điểm học sinh sau kỳ thi để phân tích độ khó thực nghiệm, độ phân cách câu hỏi và xuất báo cáo thống kê gửi Phòng/Sở GD&ĐT thuộc phạm vi <strong>Giai đoạn 2</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (section === 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            Quản trị Hệ thống & Phân quyền Chuyên môn
          </h2>
          <p className="text-xs text-slate-600">
            Cấu trúc vai trò người dùng trong quy trình biên soạn, thẩm định và phê duyệt đề kiểm tra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="text-xs font-semibold text-blue-700">Vai trò 01</div>
            <h3 className="text-sm font-bold text-slate-900">Giáo viên Bộ môn</h3>
            <p className="text-xs text-slate-600">
              Biên soạn câu hỏi theo YCCĐ, sử dụng AI gợi ý câu hỏi, lập dự thảo ma trận và đề kiểm tra.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="text-xs font-semibold text-blue-700">Vai trò 02</div>
            <h3 className="text-sm font-bold text-slate-900">Tổ trưởng Chuyên môn</h3>
            <p className="text-xs text-slate-600">
              Thẩm định nội dung câu hỏi, kiểm tra tính cân đối của ma trận và bản đặc tả theo cấp học.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="text-xs font-semibold text-blue-700">Vai trò 03</div>
            <h3 className="text-sm font-bold text-slate-900">Ban Giám hiệu</h3>
            <p className="text-xs text-slate-600">
              Phê duyệt đề kiểm tra chính thức, quản lý hồ sơ kiểm tra định kỳ toàn trường.
            </p>
          </div>
        </div>

        <SmartQuestionLinkAdminConfigPanel
          schoolId="GLOBAL"
          actorRole="SUPER_ADMIN"
          actorName="Quản trị viên hệ thống"
          onNotify={onNotify}
        />

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 space-y-2">
          <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Các chức năng Quản trị nâng cao: Chưa triển khai (Giai đoạn 2)
          </div>
          <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
            <li>Đăng nhập SSO và phân quyền RBAC nhiều cấp theo tài khoản Firebase Auth: <strong>Chưa triển khai</strong></li>
            <li>Nhật ký kiểm toán (Audit Log) truy vết lịch sử mở niêm phong đề thi: <strong>Chưa triển khai</strong></li>
            <li>Đồng bộ danh sách giáo viên, học sinh với CSDL ngành Giáo dục: <strong>Chưa triển khai</strong></li>
          </ul>
        </div>
      </div>
    );
  }

  // section === 'settings'
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      schoolName: schoolName.trim() || config.schoolName,
      departmentName: departmentName.trim() || config.departmentName,
      academicYear: academicYear.trim() || config.academicYear,
    });
    onNotify(
      'success',
      'Đã lưu cài đặt hệ thống',
      'Thông tin đơn vị trường học và năm học đã được cập nhật.'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-700" />
          Cài đặt Hệ thống & Cấu hình Lớp Lưu trữ Dữ liệu
        </h2>
        <p className="text-xs text-slate-600">
          Quản lý thông tin đơn vị, cấu hình liên kết nút lệnh menu, kết nối cơ sở dữ liệu (Repository Layer) và quản lý dữ liệu mẫu thử nghiệm.
        </p>
      </div>

      <SmartQuestionLinkAdminConfigPanel
        schoolId="GLOBAL"
        actorRole="SUPER_ADMIN"
        actorName="Quản trị viên nền tảng"
        onNotify={onNotify}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSaveSettings}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
            Thông tin Đơn vị Trường học
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên trường / Đơn vị giáo dục
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tổ / Hội đồng chuyên môn
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm học áp dụng
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              Lưu thông tin cài đặt
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-700" />
            Lớp Lưu trữ Dữ liệu (Data Access Layer)
          </h3>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="font-semibold text-slate-900">
              Trạng thái hiện tại: LocalStorage Repository (Giai đoạn 1)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Dữ liệu được chuẩn hóa qua giao diện <code>IDataRepository</code>, tách biệt rõ cờ{' '}
              <code>isSampleData</code> (Dữ liệu mẫu) và dữ liệu thật. Sẵn sàng kết nối Firebase Firestore
              hoặc Cloud SQL ở Giai đoạn 2 mà không cần sửa đổi tầng giao diện.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                onResetSeedData();
                onNotify(
                  'info',
                  'Đã khôi phục dữ liệu gốc',
                  'Toàn bộ dữ liệu mẫu và dữ liệu khởi tạo đã được đặt lại về trạng thái mặc định.'
                );
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục bộ dữ liệu mẫu mặc định
            </button>
          </div>
        </div>
      </div>

      <GitHubDataStoragePanel
        onNotify={onNotify}
        onDataPulledFromGitHub={onReloadDataFromServer}
      />
    </div>
  );
};
