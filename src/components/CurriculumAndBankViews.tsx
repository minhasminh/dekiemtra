import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileSpreadsheet,
  Filter,
  HelpCircle,
  LayoutGrid,
  Plus,
  Search,
  Sparkles,
  Table,
  Trash2,
  Users,
} from 'lucide-react';
import {
  ApprovalStatus,
  CognitiveLevelCode,
  CurriculumLessonItem,
  CurriculumTopic,
  DataSourceFilter,
  EducationLevelId,
  GradeNumber,
  QuestionFormatCode,
  QuestionItem,
} from '../types/domain';
import {
  ASSESSMENT_RULES_BY_LEVEL,
  filterByDataSource,
  getApprovalStatusInfo,
  getCognitiveShortLabel,
  getFormatLabel,
  getRuleSetForLevel,
  validateQuestionByLevelRules,
} from '../services/business/assessmentRules';
import { generateQuestionWithAI } from '../services/ai/aiQuestionService';
import { GRADE1_PLAN_METADATA } from '../data/grade1CurriculumPlan2026';
import { GRADE2_PLAN_METADATA } from '../data/grade2CurriculumPlan2026';
import { GRADE3_PLAN_METADATA } from '../data/grade3CurriculumPlan2026';
import {
  GRADE4_PLAN_METADATA,
  extractIntegrationTags,
} from '../data/grade4CurriculumPlan2026';
import { GRADE5_PLAN_METADATA } from '../data/grade5CurriculumPlan2026';
import { THCS_KHTN_DEPT_METADATA } from '../data/thcsKhtnAndCongNghePlan2026';
import { THCS_KHXH_DEPT_METADATA } from '../data/thcsKhxhNguVanAndLsDlPlan2026';
import { THCS_TA_GDTC_DEPT_METADATA } from '../data/thcsTiengAnhPlan2026';

interface CurriculumViewProps {
  topics: CurriculumTopic[];
  sourceFilter: DataSourceFilter;
  onAddTopic: (topic: Omit<CurriculumTopic, 'id'>) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  topics,
  sourceFilter,
  onAddTopic,
  onNotify,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<EducationLevelId>(EducationLevelId.PRIMARY);
  const [thcsDeptTab, setThcsDeptTab] = useState<'KHXH' | 'KHTN' | 'TA_GDTC'>('TA_GDTC');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPlanHeaderInfo, setShowPlanHeaderInfo] = useState(true);
  const [viewMode, setViewMode] = useState<'TABLE_2345' | 'TOPIC_CARDS'>('TABLE_2345');

  // Bộ lọc chuyên sâu cho Chương trình giáo dục
  const [filterGrade, setFilterGrade] = useState<GradeNumber | 'ALL'>(1);
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterSemester, setFilterSemester] = useState<'ALL' | 'HK1' | 'HK2'>('ALL');
  const [filterIntegrationTag, setFilterIntegrationTag] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [expandedTopicIds, setExpandedTopicIds] = useState<Record<string, boolean>>({});

  const ruleSet = getRuleSetForLevel(selectedLevel);

  // State cho biểu mẫu thêm mới Mạch chủ đề / Bài học / Thời lượng / Nội dung cần đạt (điều chỉnh, bổ sung)
  const [grade, setGrade] = useState<GradeNumber>(1);
  const [subject, setSubject] = useState<string>(ruleSet.subjects[0]);
  const [semester, setSemester] = useState<'HK1' | 'HK2' | 'CA_NAM'>('HK1');
  const [weekRange, setWeekRange] = useState('Tuần 1');
  const [chapterCode, setChapterCode] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [subLessonName, setSubLessonName] = useState('');
  const [durationText, setDurationText] = useState('1 tiết');
  const [periodsCount, setPeriodsCount] = useState<number>(1);
  const [outcomeCode, setOutcomeCode] = useState('');
  const [outcomeDesc, setOutcomeDesc] = useState('');
  const [noteText, setNoteText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleLevelSwitch = (newLevel: EducationLevelId) => {
    setSelectedLevel(newLevel);
    const rules = getRuleSetForLevel(newLevel);
    setGrade(rules.grades.includes(4 as GradeNumber) ? 4 : rules.grades[0]);
    setFilterGrade(
      newLevel === EducationLevelId.PRIMARY
        ? 4
        : newLevel === EducationLevelId.LOWER_SECONDARY
          ? 6
          : 'ALL'
    );
    setFilterSubject('ALL');
    setSubject(rules.subjects[0]);
  };

  const levelTopics = useMemo(() => {
    return filterByDataSource(topics, sourceFilter).filter((t) => t.levelId === selectedLevel);
  }, [topics, sourceFilter, selectedLevel]);

  const filteredTopics = useMemo(() => {
    return levelTopics.filter((t) => {
      if (filterGrade !== 'ALL' && t.grade !== filterGrade) return false;
      if (filterSubject !== 'ALL' && t.subject !== filterSubject) return false;
      if (filterSemester !== 'ALL' && t.semester && t.semester !== filterSemester) return false;

      if (filterIntegrationTag !== 'ALL') {
        const hasTagInLessons = t.lessons?.some((ls) =>
          ls.integrationTags?.includes(filterIntegrationTag)
        );
        const hasTagInText = (t.adjustedContentSummary || '')
          .toLowerCase()
          .includes(filterIntegrationTag.toLowerCase());
        if (!hasTagInLessons && !hasTagInText) return false;
      }

      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchTopic =
          t.chapterTitle.toLowerCase().includes(kw) ||
          t.topicTitle.toLowerCase().includes(kw) ||
          t.chapterCode.toLowerCase().includes(kw) ||
          (t.adjustedContentSummary || '').toLowerCase().includes(kw) ||
          (t.weekRange || '').toLowerCase().includes(kw);
        const matchLessons = t.lessons?.some(
          (ls) =>
            ls.lessonName.toLowerCase().includes(kw) ||
            (ls.subLessonName || '').toLowerCase().includes(kw) ||
            ls.adjustedContent.toLowerCase().includes(kw) ||
            ls.week.toLowerCase().includes(kw) ||
            ls.periodAllocation.toLowerCase().includes(kw)
        );
        const matchOutcomes = t.learningOutcomes.some(
          (lo) =>
            lo.code.toLowerCase().includes(kw) || lo.description.toLowerCase().includes(kw)
        );
        if (!matchTopic && !matchLessons && !matchOutcomes) return false;
      }

      return true;
    });
  }, [
    levelTopics,
    filterGrade,
    filterSubject,
    filterSemester,
    filterIntegrationTag,
    searchKeyword,
  ]);

  // Phẳng hóa danh sách bài học để hiển thị Bảng Kế hoạch dạy học chuẩn Công văn 2345
  const flattenedLessonRows = useMemo(() => {
    const rows: {
      topic: CurriculumTopic;
      lesson: CurriculumLessonItem;
    }[] = [];
    const kw = searchKeyword.toLowerCase().trim();

    for (const topic of filteredTopics) {
      if (topic.lessons && topic.lessons.length > 0) {
        for (const ls of topic.lessons) {
          if (
            filterIntegrationTag !== 'ALL' &&
            !ls.integrationTags?.includes(filterIntegrationTag)
          ) {
            continue;
          }
          if (kw) {
            const topicMatches =
              topic.chapterTitle.toLowerCase().includes(kw) ||
              topic.subject.toLowerCase().includes(kw);
            const lessonMatches =
              ls.lessonName.toLowerCase().includes(kw) ||
              (ls.subLessonName || '').toLowerCase().includes(kw) ||
              ls.adjustedContent.toLowerCase().includes(kw) ||
              ls.week.toLowerCase().includes(kw) ||
              ls.periodAllocation.toLowerCase().includes(kw);
            if (!topicMatches && !lessonMatches) continue;
          }
          rows.push({ topic, lesson: ls });
        }
      } else {
        // Fallback cho các chủ đề chưa có mảng lessons chi tiết
        for (const lo of topic.learningOutcomes) {
          rows.push({
            topic,
            lesson: {
              id: `${topic.id}-${lo.code}`,
              week: topic.weekRange || 'Cả năm',
              lessonName: topic.topicTitle,
              subLessonName: lo.lessonName,
              periodAllocation: lo.duration || topic.durationText || 'Theo PPCT',
              periodsCount: topic.totalPeriods || 1,
              adjustedContent: lo.description,
              integrationTags: extractIntegrationTags(lo.description),
            },
          });
        }
      }
    }
    return rows;
  }, [filteredTopics, filterIntegrationTag, searchKeyword]);

  const totalLessonsCount = useMemo(
    () =>
      filteredTopics.reduce(
        (acc, t) => acc + (t.lessons ? t.lessons.length : t.learningOutcomes.length),
        0
      ),
    [filteredTopics]
  );

  const totalPeriodsSum = useMemo(
    () =>
      filteredTopics.reduce(
        (acc, t) =>
          acc +
          (t.totalPeriods ||
            t.lessons?.reduce((s, l) => s + (l.periodsCount || 0), 0) ||
            0),
        0
      ),
    [filteredTopics]
  );

  const toggleExpandTopic = (topicId: string) => {
    setExpandedTopicIds((prev) => ({
      ...prev,
      [topicId]: !(prev[topicId] ?? true),
    }));
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (ruleSet.isExpansionReadyOnly) {
      setFormError(
        'Khối THPT (Lớp 10–12) đang ở chế độ khung mở rộng, sẽ mở nhập liệu ở Giai đoạn 2.'
      );
      onNotify(
        'warning',
        'Chưa triển khai nhập liệu THPT',
        'Cấp THPT được cấu hình sẵn kiến trúc mở rộng cho Giai đoạn 2.'
      );
      return;
    }

    if (!chapterTitle.trim() || !topicTitle.trim() || !outcomeDesc.trim()) {
      setFormError(
        'Vui lòng nhập đầy đủ Mạch chủ đề/nội dung, Tên bài học, Tiết học (Thời lượng) và Nội dung cần đạt (Nội dung điều chỉnh, bổ sung).'
      );
      onNotify(
        'error',
        'Thiếu thông tin bắt buộc',
        'Vui lòng kiểm tra lại các trường đánh dấu sao (*).'
      );
      return;
    }

    const cleanWeek = weekRange.trim() || 'Tuần 1';
    const cleanDuration = durationText.trim() || `${periodsCount} tiết`;
    const generatedCode =
      chapterCode.trim() || `CĐ-K${grade}-${Date.now().toString().slice(-3)}`;

    onAddTopic({
      levelId: selectedLevel,
      grade,
      subject,
      semester,
      weekRange: cleanWeek,
      totalPeriods: periodsCount,
      durationText: `${cleanDuration} (${cleanWeek})`,
      adjustedContentSummary: outcomeDesc.trim(),
      sourceDocument: GRADE4_PLAN_METADATA.sourceDocument,
      chapterCode: generatedCode,
      chapterTitle: chapterTitle.trim(),
      topicTitle: topicTitle.trim(),
      lessons: [
        {
          id: `ls-custom-${Date.now()}`,
          week: cleanWeek.replace(/^Tuần\s*/i, ''),
          lessonName: topicTitle.trim(),
          subLessonName: subLessonName.trim() || undefined,
          periodAllocation: cleanDuration,
          periodsCount: Number(periodsCount) || 1,
          adjustedContent: outcomeDesc.trim(),
          integrationTags: extractIntegrationTags(outcomeDesc.trim()),
          note: noteText.trim() || undefined,
        },
      ],
      learningOutcomes: [
        {
          code: outcomeCode.trim() || `${generatedCode}-YCCĐ1`,
          description: `${topicTitle.trim()} (${cleanDuration}): ${outcomeDesc.trim()}`,
          suggestedCognitiveLevel: ruleSet.cognitiveLevels[0].code,
          lessonName: topicTitle.trim(),
          duration: cleanDuration,
          week: cleanWeek,
        },
      ],
      isSampleData: false,
    });

    setChapterCode('');
    setChapterTitle('');
    setTopicTitle('');
    setSubLessonName('');
    setDurationText('1 tiết');
    setPeriodsCount(1);
    setOutcomeCode('');
    setOutcomeDesc('');
    setNoteText('');
    setShowAddForm(false);
    onNotify(
      'success',
      'Đã bổ sung vào Chương trình giáo dục',
      `Đã lưu mạch "${chapterTitle.trim()}" – Bài học "${topicTitle.trim()}" (${cleanDuration}) vào dữ liệu nhà trường.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Thanh chọn cấp học */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Chương trình Giáo dục & Kế hoạch dạy học các môn học, hoạt động giáo dục
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý Mạch chủ đề / nội dung, Tên bài học, Tiết học (Thời lượng) và Nội dung cần đạt (Nội dung điều chỉnh, bổ sung: Tích hợp NLS, AI, QCN, BVMT, QPAN, STEM...)
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {Object.values(ASSESSMENT_RULES_BY_LEVEL).map((lvl) => (
            <button
              key={lvl.levelId}
              type="button"
              onClick={() => handleLevelSwitch(lvl.levelId)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedLevel === lvl.levelId
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Khung thông tin Kế hoạch dạy học Khối 1, Khối 2, Khối 3, Khối 4 & Khối 5 – Trường TH&THCS Nguyễn Đình Anh (từ File đính kèm) */}
      {selectedLevel === EducationLevelId.PRIMARY && (() => {
        const activePlanGrade: 1 | 2 | 3 | 4 | 5 =
          filterGrade === 1
            ? 1
            : filterGrade === 2
              ? 2
              : filterGrade === 3
                ? 3
                : filterGrade === 5
                  ? 5
                  : 4;
        const activePlanMeta =
          activePlanGrade === 1
            ? GRADE1_PLAN_METADATA
            : activePlanGrade === 2
              ? GRADE2_PLAN_METADATA
              : activePlanGrade === 3
                ? GRADE3_PLAN_METADATA
                : activePlanGrade === 5
                  ? GRADE5_PLAN_METADATA
                  : GRADE4_PLAN_METADATA;
        return (
          <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-2xs">
            {/* Header 1 cột toàn chiều rộng - Không bị ép chữ khi mở full màn hình */}
            <div className="bg-blue-900 text-white px-6 py-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-semibold">
                  <span>{activePlanMeta.schoolName}</span>
                  <span>·</span>
                  <span>{activePlanMeta.departmentName}</span>
                  <span>·</span>
                  <span>{activePlanMeta.locationAndDate}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPlanHeaderInfo(!showPlanHeaderInfo)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-xs font-medium text-blue-100 transition cursor-pointer shrink-0"
                >
                  {showPlanHeaderInfo ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Thu gọn thông tin KHGD</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Xem thông tin KHGD & Đội ngũ GV</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {activePlanMeta.planTitle} (Năm học {activePlanMeta.academicYear})
              </h3>

              <div className="pt-3.5 border-t border-blue-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-blue-200 flex flex-wrap items-center gap-3">
                  <span>
                    Bộ SGK: <strong className="text-white">Kết nối tri thức với cuộc sống</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Tổ trưởng chuyên môn:{' '}
                    <strong className="text-amber-300">{activePlanMeta.headOfDepartment}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1 bg-blue-950/80 p-1 rounded-lg border border-blue-700">
                  {([1, 2, 3, 4, 5] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFilterGrade(g)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                        activePlanGrade === g
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-blue-100 hover:bg-blue-800'
                      }`}
                    >
                      KHGD Khối lớp {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showPlanHeaderInfo && (
              <div className="p-6 space-y-4 bg-slate-50/60">
                {/* Mục I: Căn cứ xây dựng (1 cột toàn chiều rộng) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>
                        I. Căn cứ xây dựng & Nội dung giáo dục tích hợp (Khối lớp {activePlanGrade})
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Năm học {activePlanMeta.academicYear}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5 leading-relaxed">
                    {activePlanMeta.legalBases.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Mục II: Bảng Đội ngũ giáo viên & Sĩ số HS (1 cột toàn chiều rộng) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>
                        II. Đội ngũ giáo viên & Đối tượng học sinh Khối lớp {activePlanGrade} (
                        {activePlanMeta.studentSummary})
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {activePlanMeta.teacherSummary}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <th className="py-2 px-3 text-left font-semibold w-14">STT</th>
                          <th className="py-2 px-3 text-left font-semibold w-56">Họ và tên GV</th>
                          <th className="py-2 px-3 text-left font-semibold">Nhiệm vụ phân công</th>
                          <th className="py-2 px-3 text-left font-semibold w-44">Sĩ số HS</th>
                          <th className="py-2 px-3 text-left font-semibold w-48">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activePlanMeta.teachers.map((gv) => (
                          <tr key={gv.stt} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-500">{gv.stt}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{gv.fullName}</td>
                            <td className="py-2 px-3 text-slate-700">{gv.duty}</td>
                            <td className="py-2 px-3 font-mono font-semibold text-blue-800">
                              {gv.studentCountText}
                            </td>
                            <td className="py-2 px-3 text-amber-700 font-medium">{gv.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mục III: Danh sách 1 cột phân bổ thời lượng các môn học / hoạt động giáo dục */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      III. Phân phối thời lượng các môn học & hoạt động giáo dục Khối lớp {activePlanGrade} (Nhấn vào môn học để lọc nhanh)
                    </span>
                    {filterSubject !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setFilterSubject('ALL')}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                      >
                        Hiển thị tất cả môn ({activePlanMeta.subjectAllocationSummary.length} môn)
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activePlanMeta.subjectAllocationSummary.map((item, idx) => {
                      const isSelected =
                        filterSubject === item.subject &&
                        filterGrade === activePlanGrade;
                      return (
                        <button
                          key={item.subject}
                          type="button"
                          onClick={() => {
                            setFilterGrade(activePlanGrade);
                            setFilterSubject(isSelected ? 'ALL' : item.subject);
                          }}
                          className={`w-full text-left px-5 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/90'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  Môn: {item.subject} (Lớp {activePlanGrade})
                                </span>
                                {isSelected && (
                                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                    Đang chọn lọc
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-900">
                              {item.totalPeriods} tiết/năm
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Khung thông tin Kế hoạch dạy học Cấp THCS (Khối 6, 7, 8, 9) – Tổ Khoa học Xã hội & Tổ Khoa học Tự nhiên Trường TH&THCS Nguyễn Đình Anh */}
      {selectedLevel === EducationLevelId.LOWER_SECONDARY && (() => {
        const activeThcsGrade: 6 | 7 | 8 | 9 =
          filterGrade === 7
            ? 7
            : filterGrade === 8
              ? 8
              : filterGrade === 9
                ? 9
                : 6;
        const activeDeptMeta =
          thcsDeptTab === 'KHXH'
            ? THCS_KHXH_DEPT_METADATA
            : thcsDeptTab === 'KHTN'
              ? THCS_KHTN_DEPT_METADATA
              : THCS_TA_GDTC_DEPT_METADATA;
        const khxhSubjects =
          THCS_KHXH_DEPT_METADATA.subjectAllocationByGrade[activeThcsGrade];
        const khtnSubjects =
          THCS_KHTN_DEPT_METADATA.subjectAllocationByGrade[activeThcsGrade];
        const taGdtcSubjects =
          THCS_TA_GDTC_DEPT_METADATA.subjectAllocationByGrade[activeThcsGrade];
        const combinedSubjects = [...taGdtcSubjects, ...khxhSubjects, ...khtnSubjects];
        return (
          <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-2xs">
            {/* Header 1 cột toàn chiều rộng - Khắc phục triệt để lỗi bó hẹp tiêu đề ở chế độ Full màn hình */}
            <div className="bg-slate-900 text-white px-6 py-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-semibold">
                  <span>{activeDeptMeta.schoolName}</span>
                  <span>·</span>
                  <span>{activeDeptMeta.departmentName}</span>
                  <span>·</span>
                  <span>{activeDeptMeta.locationAndDate}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPlanHeaderInfo(!showPlanHeaderInfo)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-100 border border-slate-700 transition cursor-pointer shrink-0"
                >
                  {showPlanHeaderInfo ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Thu gọn thông tin Tổ CM</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Xem thông tin Tổ CM & Phân phối CT</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {activeDeptMeta.planTitle} (Năm học {activeDeptMeta.academicYear})
              </h3>

              <div className="pt-3.5 border-t border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Bộ chuyển đổi Tổ Tiếng Anh - GDTC / Tổ KHXH / Tổ KHTN */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 p-1 rounded-lg border border-slate-700 w-fit">
                  <button
                    type="button"
                    onClick={() => setThcsDeptTab('TA_GDTC')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      thcsDeptTab === 'TA_GDTC'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Tổ Tiếng Anh - GDTC (Tiếng Anh 6-9 & GDTC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThcsDeptTab('KHXH')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      thcsDeptTab === 'KHXH'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Tổ KHXH (Văn - Sử Địa - GDCD - HĐTN - GDĐP - Nghệ thuật)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThcsDeptTab('KHTN')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      thcsDeptTab === 'KHTN'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Tổ KHTN (Toán - Tin - KHTN - CN)
                  </button>
                </div>

                {/* Bộ chọn Khối 6, 7, 8, 9 */}
                <div className="flex flex-wrap items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-slate-700 w-fit">
                  {([6, 7, 8, 9] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFilterGrade(g)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                        activeThcsGrade === g
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      KHGD Khối {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showPlanHeaderInfo && (
              <div className="p-6 space-y-4 bg-slate-50/60">
                {/* Mục I: Đặc điểm tình hình Tổ chuyên môn (1 cột toàn chiều rộng) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>
                        I. Đặc điểm tình hình {activeDeptMeta.departmentName} (Năm học 2026 – 2027)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span>
                        Tổ trưởng chuyên môn:{' '}
                        <strong className="text-blue-900">
                          {activeDeptMeta.headOfDepartment}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Hiệu trưởng phê duyệt:{' '}
                        <strong className="text-slate-900">
                          {activeDeptMeta.principal}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    <p>
                      • <strong>Quy mô trường & lớp học:</strong> {activeDeptMeta.studentAndClassSummary}
                    </p>
                    <p>
                      • <strong>Đội ngũ giáo viên:</strong> {activeDeptMeta.teacherForceSummary}
                    </p>
                  </div>
                </div>

                {/* Mục II: Thiết bị dạy học, Phòng học bộ môn & Định hướng tích hợp (1 cột toàn chiều rộng) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <BookOpen className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>II. Thiết bị dạy học, Phòng học bộ môn & Định hướng tích hợp chuyên môn</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5 leading-relaxed">
                    {activeDeptMeta.facilitiesSummary.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                {/* Mục III: Danh sách 1 cột phân phối thời lượng 8 môn / hoạt động giáo dục của Khối đang chọn */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      III. Phân phối chương trình các môn học & hoạt động giáo dục Khối {activeThcsGrade} (Nhấn vào môn học để lọc chi tiết)
                    </span>
                    {filterSubject !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setFilterSubject('ALL')}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                      >
                        Hiển thị tất cả môn Khối {activeThcsGrade} ({combinedSubjects.length} môn)
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {combinedSubjects.map((item, idx) => {
                      const isSelected =
                        filterSubject === item.subject &&
                        filterGrade === activeThcsGrade;
                      const isKhxhSubject = khxhSubjects.some((s) => s.subject === item.subject);
                      const isTaGdtcSubject = taGdtcSubjects.some((s) => s.subject === item.subject);
                      return (
                        <button
                          key={item.subject}
                          type="button"
                          onClick={() => {
                            setFilterGrade(activeThcsGrade);
                            setFilterSubject(isSelected ? 'ALL' : item.subject);
                          }}
                          className={`w-full text-left px-5 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/90'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {item.subject} (Khối {activeThcsGrade})
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                    isTaGdtcSubject
                                      ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                      : isKhxhSubject
                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  }`}
                                >
                                  {isTaGdtcSubject
                                    ? 'Tổ Tiếng Anh - GDTC'
                                    : isKhxhSubject
                                      ? 'Tổ KHXH'
                                      : 'Tổ KHTN'}
                                </span>
                                {isSelected && (
                                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                    Đang chọn lọc
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-900">
                              {item.totalPeriods} tiết/năm
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Thanh công cụ Lọc & Chuyển đổi chế độ xem + Nút Thêm mới (Thiết kế 1 cột đồng bộ) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-700 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Tra cứu & Lọc phân phối chương trình giáo dục
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Chuyển chế độ hiển thị */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('TABLE_2345')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'TABLE_2345'
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Bảng Kế hoạch dạy học</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TOPIC_CARDS')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'TOPIC_CARDS'
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Danh sách Mạch chủ đề & YCCĐ</span>
              </button>
            </div>

            {!ruleSet.isExpansionReadyOnly && (
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? 'Đóng biểu mẫu' : 'Bổ sung Mạch chủ đề / Bài học'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Các điều khiển lọc bố trí 1 hàng ngang rõ nhãn trên màn hình rộng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Khối lớp
            </label>
            <select
              value={filterGrade}
              onChange={(e) =>
                setFilterGrade(
                  e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as GradeNumber)
                )
              }
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Tất cả khối ({ruleSet.shortName})</option>
              {ruleSet.grades.map((g) => (
                <option key={g} value={g}>
                  Khối lớp {g}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Môn học / HĐGD
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Tất cả môn học</option>
              {ruleSet.subjects.map((s) => (
                <option key={s} value={s}>
                  Môn {s}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Học kì
            </label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value as 'ALL' | 'HK1' | 'HK2')}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Cả năm học (Tuần 1 – 35)</option>
              <option value="HK1">Học kì I (Tuần 1 – 18)</option>
              <option value="HK2">Học kì II (Tuần 19 – 35)</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Nội dung tích hợp / Lồng ghép
            </label>
            <select
              value={filterIntegrationTag}
              onChange={(e) => setFilterIntegrationTag(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Tất cả nội dung tích hợp</option>
              <option value="AI">Tích hợp Trí tuệ nhân tạo (AI - QĐ 2422)</option>
              <option value="NLS">Tích hợp Năng lực số (NLS - TT 02/2025)</option>
              <option value="BĐKH & PCTT">Tích hợp BĐKH & Phòng chống thiên tai (PCTT)</option>
              <option value="STEM">Tích hợp Giáo dục STEM</option>
              <option value="QCN">Tích hợp Quyền con người (QCN)</option>
              <option value="BVMT">Tích hợp Bảo vệ môi trường (BVMT)</option>
              <option value="Tiết kiệm nước">Tích hợp Tiết kiệm & Bảo vệ nguồn nước</option>
              <option value="QPAN">Tích hợp Quốc phòng & An ninh (QPAN/ANQP)</option>
              <option value="KNS">Tích hợp Kỹ năng sống (KNS)</option>
              <option value="ĐĐLS">Tích hợp Lý tưởng CM, đạo đức, lối sống</option>
              <option value="ATGT">Tích hợp An toàn giao thông (ATGT)</option>
              <option value="TTHCM">Tích hợp Tư tưởng Hồ Chí Minh</option>
              <option value="GDĐP">Tích hợp Giáo dục địa phương (GDĐP)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm mạch chủ đề, tên bài học, mã NLS, AI..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Thanh thống kê nhanh kết quả hiển thị */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium">
              Mạch chủ đề: <strong className="text-slate-900">{filteredTopics.length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 font-medium">
              Bài học / Hoạt động: <strong>{totalLessonsCount}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-medium">
              Tổng thời lượng: <strong>{totalPeriodsSum} tiết</strong>
            </span>
          </div>

          {(filterSubject !== 'ALL' ||
            filterSemester !== 'ALL' ||
            filterIntegrationTag !== 'ALL' ||
            searchKeyword.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setFilterSubject('ALL');
                setFilterSemester('ALL');
                setFilterIntegrationTag('ALL');
                setSearchKeyword('');
              }}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              Xóa bộ lọc đang chọn
            </button>
          )}
        </div>
      </div>

      {/* Biểu mẫu bổ sung Mạch chủ đề / nội dung; Tên bài học; Tiết học (Thời lượng); Nội dung cần đạt (điều chỉnh, bổ sung) */}
      {showAddForm && !ruleSet.isExpansionReadyOnly && (
        <form
          onSubmit={handleCreateTopic}
          className="bg-white border-2 border-blue-600 rounded-xl p-6 space-y-4 shadow-sm"
        >
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-blue-950">
                Bổ sung Mạch chủ đề / nội dung, Tên bài học, Tiết học (Thời lượng) & Nội dung cần đạt (Điều chỉnh, bổ sung)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu lưu trực tiếp vào Chương trình giáo dục của nhà trường và liên kết ngay với Ngân hàng câu hỏi & Ma trận đề
              </p>
            </div>
            <span className="text-xs text-slate-500">Các mục có dấu (*) là bắt buộc</span>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối lớp (*)
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeNumber)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                Môn học / HĐGD (*)
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {ruleSet.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Học kì
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as 'HK1' | 'HK2' | 'CA_NAM')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="HK1">Học kì I</option>
                <option value="HK2">Học kì II</option>
                <option value="CA_NAM">Cả năm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tuần học
              </label>
              <input
                type="text"
                value={weekRange}
                onChange={(e) => setWeekRange(e.target.value)}
                placeholder="VD: Tuần 1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã chủ đề (Tùy chọn)
              </label>
              <input
                type="text"
                value={chapterCode}
                onChange={(e) => setChapterCode(e.target.value)}
                placeholder="VD: TV4-CĐ1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Chủ đề / Mạch nội dung (*)
              </label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="VD: Chủ điểm 1: Mỗi người một vẻ"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Tên bài học (*)
              </label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="VD: Bài 1: Điều kì diệu (3 tiết)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân môn / Tiết dạy cụ thể
              </label>
              <input
                type="text"
                value={subLessonName}
                onChange={(e) => setSubLessonName(e.target.value)}
                placeholder="VD: Đọc: Điều kì diệu / Tiết 1: Luyện tập"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="lg:col-span-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Tiết học / Thời lượng (*)
                </label>
                <input
                  type="text"
                  value={durationText}
                  onChange={(e) => setDurationText(e.target.value)}
                  placeholder="VD: 1 tiết"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tiết
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={periodsCount}
                  onChange={(e) => setPeriodsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                4. Nội dung cần đạt (Nội dung điều chỉnh, bổ sung: Tích hợp NLS, AI, QCN, BVMT, QPAN, STEM...) (*)
              </label>
              <textarea
                rows={3}
                value={outcomeDesc}
                onChange={(e) => setOutcomeDesc(e.target.value)}
                placeholder="VD: - Tích hợp NLS 2.3.CB2a, 4.1.CB2b: HS biết trao đổi ý kiến lịch sự khi làm việc nhóm...\n- Tích hợp AI (4.A1.1): HS nhận biết AI có thể hỗ trợ gợi ý câu hỏi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã YCCĐ (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={outcomeCode}
                  onChange={(e) => setOutcomeCode(e.target.value)}
                  placeholder="VD: TV4-CĐ1-B1"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Ghi chú thực hiện..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              Lưu vào Chương trình giáo dục
            </button>
          </div>
        </form>
      )}

      {/* Nội dung hiển thị chính */}
      {ruleSet.isExpansionReadyOnly ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <div className="text-sm font-bold text-slate-900">
            Phân hệ Cấp THPT (Lớp 10 – 12) · Chưa triển khai dữ liệu chi tiết ở Giai đoạn 1
          </div>
          <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
            Kiến trúc hệ thống đã định nghĩa đầy đủ 4 mức độ nhận thức và cấu trúc đề thi tốt nghiệp THPT mới
            (Trắc nghiệm nhiều lựa chọn, Đúng/Sai 4 ý tính điểm lũy tiến, Trả lời ngắn). Danh mục chuyên đề học tập
            lựa chọn Lớp 10–12 sẽ được nạp ở Giai đoạn 2.
          </p>
        </div>
      ) : viewMode === 'TABLE_2345' ? (
        /* CHẾ ĐỘ 1: BẢNG KẾ HOẠCH DẠY HỌC CHUẨN CÔNG VĂN 2345 (ĐÚNG MẪU FILE ĐÍNH KÈM) */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bảng Kế hoạch dạy học các môn học, hoạt động giáo dục (Mẫu Công văn 2345/BGDĐT-GDTH)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hiển thị đầy đủ: Tuần · Chủ đề / Mạch nội dung · Tên bài học · Tiết học / Thời lượng · Nội dung cần đạt (Nội dung điều chỉnh, bổ sung)
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              Đang hiển thị {flattenedLessonRows.length} mục bài học / hoạt động
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-blue-950 text-white">
                  <th className="py-3 px-3 text-center font-bold border-r border-blue-800 w-20">
                    Tuần
                  </th>
                  <th className="py-3 px-4 text-left font-bold border-r border-blue-800 w-56">
                    Chủ đề / Mạch nội dung
                  </th>
                  <th className="py-3 px-4 text-left font-bold border-r border-blue-800 w-64">
                    Tên bài học
                  </th>
                  <th className="py-3 px-3 text-center font-bold border-r border-blue-800 w-36">
                    Tiết học / Thời lượng
                  </th>
                  <th className="py-3 px-4 text-left font-bold border-r border-blue-800">
                    Nội dung cần đạt (Nội dung điều chỉnh, bổ sung)
                  </th>
                  <th className="py-3 px-3 text-left font-bold w-36">
                    Tích hợp / Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {flattenedLessonRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Không tìm thấy mạch nội dung hoặc bài học nào khớp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  flattenedLessonRows.map(({ topic, lesson }) => (
                    <tr key={lesson.id} className="hover:bg-blue-50/40 align-top transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-900 border-r border-slate-200 bg-slate-50/50">
                        <div>{lesson.week.startsWith('Tuần') ? lesson.week : `Tuần ${lesson.week}`}</div>
                        <div className="text-[10px] font-sans font-medium text-slate-500 mt-0.5">
                          Lớp {topic.grade} · {topic.semester === 'HK2' ? 'HKII' : 'HKI'}
                        </div>
                      </td>

                      <td className="py-3 px-4 border-r border-slate-200">
                        <div className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 mb-1">
                          {topic.subject} · {topic.chapterCode}
                        </div>
                        <div className="font-bold text-slate-900 leading-snug">
                          {topic.chapterTitle}
                        </div>
                        {topic.weekRange && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            Phạm vi: {topic.weekRange} ({topic.totalPeriods || 0} tiết)
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 border-r border-slate-200">
                        <div className="font-bold text-slate-900 leading-snug">
                          {lesson.lessonName}
                        </div>
                        {lesson.subLessonName && (
                          <div className="mt-1 text-slate-700 bg-slate-100/80 px-2 py-1 rounded border border-slate-200/80 leading-relaxed">
                            {lesson.subLessonName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center border-r border-slate-200">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100/90 text-amber-950 font-bold">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{lesson.periodAllocation}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 border-r border-slate-200">
                        <div className="text-slate-800 whitespace-pre-line leading-relaxed">
                          {lesson.adjustedContent}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {lesson.integrationTags && lesson.integrationTags.length > 0 ? (
                            lesson.integrationTags.map((tag) => (
                              <span
                                key={tag}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  tag === 'AI'
                                    ? 'bg-purple-50 text-purple-900 border-purple-300'
                                    : tag === 'NLS'
                                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                                    : tag === 'QCN'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : tag === 'BVMT' || tag === 'Tiết kiệm nước'
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                    : tag === 'QPAN'
                                    ? 'bg-rose-50 text-rose-900 border-rose-300'
                                    : 'bg-slate-100 text-slate-800 border-slate-300'
                                }`}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">Chuẩn KTKN</span>
                          )}
                        </div>
                        {lesson.note && (
                          <div className="mt-1.5 text-[11px] text-slate-600 italic">
                            {lesson.note}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CHẾ ĐỘ 2: THẺ MẠCH CHỦ ĐỀ & YÊU CẦU CẦN ĐẠT */
        <div className="grid grid-cols-1 gap-4">
          {filteredTopics.map((topic) => {
            const isExpanded = expandedTopicIds[topic.id] ?? true;
            return (
              <div
                key={topic.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {topic.chapterCode}
                    </span>
                    <span className="font-semibold text-slate-900">Lớp {topic.grade}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-blue-800">Môn {topic.subject}</span>
                    {topic.semester && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-700">
                          {topic.semester === 'HK1'
                            ? 'Học kì I'
                            : topic.semester === 'HK2'
                            ? 'Học kì II'
                            : 'Cả năm'}
                        </span>
                      </>
                    )}
                    {topic.durationText && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>Thời lượng: {topic.durationText}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-semibold">
                      Chương trình GDPT 2018 ({GRADE4_PLAN_METADATA.schoolName})
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpandTopic(topic.id)}
                      className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {isExpanded ? 'Thu gọn' : 'Mở chi tiết'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-800">
                    Mạch chủ đề / nội dung: {topic.chapterTitle}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Tên bài học: {topic.topicTitle}
                  </h4>
                  {topic.adjustedContentSummary && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                      <strong>Tóm tắt Nội dung cần đạt (Điều chỉnh, bổ sung):</strong>{' '}
                      {topic.adjustedContentSummary}
                    </p>
                  )}
                </div>

                {isExpanded && (
                  <div className="pt-2 space-y-3">
                    {topic.lessons && topic.lessons.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800">
                          Chi tiết Bài học · Tiết học (Thời lượng) · Nội dung cần đạt (Điều chỉnh, bổ sung):
                        </div>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                                <th className="py-2 px-3 text-left font-semibold w-20">Tuần</th>
                                <th className="py-2 px-3 text-left font-semibold w-64">Tên bài học</th>
                                <th className="py-2 px-3 text-center font-semibold w-32">
                                  Tiết học / Thời lượng
                                </th>
                                <th className="py-2 px-3 text-left font-semibold">
                                  Nội dung cần đạt (Nội dung điều chỉnh, bổ sung)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {topic.lessons.map((ls) => (
                                <tr key={ls.id} className="hover:bg-slate-50 align-top">
                                  <td className="py-2 px-3 font-mono font-semibold text-blue-900">
                                    Tuần {ls.week}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="font-semibold text-slate-900">{ls.lessonName}</div>
                                    {ls.subLessonName && (
                                      <div className="text-slate-600 mt-0.5">{ls.subLessonName}</div>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-center font-semibold text-amber-900">
                                    {ls.periodAllocation}
                                  </td>
                                  <td className="py-2 px-3 whitespace-pre-line text-slate-700 leading-relaxed">
                                    {ls.adjustedContent}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700">
                        Mã Yêu cầu cần đạt (YCCĐ) liên kết Ngân hàng câu hỏi & Ma trận đề ({topic.learningOutcomes.length} mục):
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {topic.learningOutcomes.map((lo) => (
                          <div
                            key={lo.code}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 text-xs"
                          >
                            <div className="leading-relaxed">
                              <span className="font-mono font-bold text-blue-900 mr-2">
                                [{lo.code}]
                              </span>
                              {lo.week && (
                                <span className="font-semibold text-slate-700 mr-1.5">
                                  ({lo.week} – {lo.duration || 'Theo PPCT'})
                                </span>
                              )}
                              <span className="text-slate-800">{lo.description}</span>
                            </div>
                            <span className="text-blue-700 font-semibold whitespace-nowrap shrink-0">
                              Gợi ý: {getCognitiveShortLabel(lo.suggestedCognitiveLevel)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface QuestionBankViewProps {
  questions: QuestionItem[];
  sourceFilter: DataSourceFilter;
  onAddQuestion: (q: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>) => void;
  onDeleteQuestion: (id: string) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  sourceFilter,
  onAddQuestion,
  onDeleteQuestion,
  onNotify,
}) => {
  const [filterLevel, setFilterLevel] = useState<EducationLevelId | 'ALL'>('ALL');
  const [filterGrade, setFilterGrade] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state cho câu hỏi mới
  const [formLevel, setFormLevel] = useState<EducationLevelId>(EducationLevelId.PRIMARY);
  const currentRuleSet = getRuleSetForLevel(formLevel);
  const [formGrade, setFormGrade] = useState<GradeNumber>(3);
  const [formSubject, setFormSubject] = useState<string>('Toán');
  const [formTopic, setFormTopic] = useState('');
  const [formOutcomeCode, setFormOutcomeCode] = useState('YCCĐ-1.1');
  const [formOutcomeText, setFormOutcomeText] = useState('');
  const [formCognitive, setFormCognitive] = useState<CognitiveLevelCode>(
    CognitiveLevelCode.PRIMARY_MUC_1
  );
  const [formFormat, setFormFormat] = useState<QuestionFormatCode>(QuestionFormatCode.MCQ_SINGLE);
  const [formStem, setFormStem] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formGradingGuide, setFormGradingGuide] = useState('');
  const [formPoints, setFormPoints] = useState<number>(0.5);
  const [formAuthor, setFormAuthor] = useState('Giáo viên Bộ môn');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const handleFormLevelChange = (lvl: EducationLevelId) => {
    setFormLevel(lvl);
    const rules = getRuleSetForLevel(lvl);
    setFormGrade(rules.grades[0]);
    setFormSubject(rules.subjects[0]);
    setFormCognitive(rules.cognitiveLevels[0].code);
    setFormFormat(rules.allowedFormats[0].code);
    setFormPoints(rules.allowedFormats[0].defaultPoints);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  const filteredQuestions = filterByDataSource(questions, sourceFilter).filter((q) => {
    if (filterLevel !== 'ALL' && q.levelId !== filterLevel) return false;
    if (filterGrade !== 'ALL' && q.grade !== filterGrade) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      return (
        q.stem.toLowerCase().includes(qLower) ||
        q.subject.toLowerCase().includes(qLower) ||
        q.topicTitle.toLowerCase().includes(qLower) ||
        q.code.toLowerCase().includes(qLower)
      );
    }
    return true;
  });

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateQuestionByLevelRules({
      levelId: formLevel,
      grade: formGrade,
      subject: formSubject,
      topicTitle: formTopic,
      learningOutcomeText: formOutcomeText,
      cognitiveLevel: formCognitive,
      format: formFormat,
      stem: formStem,
      correctAnswer: formCorrectAnswer,
      gradingGuide: formGradingGuide,
      points: formPoints,
    });

    setValidationErrors(check.errors);
    setValidationWarnings(check.warnings);

    if (!check.valid) {
      onNotify(
        'error',
        'Dữ liệu câu hỏi chưa hợp lệ',
        `Phát hiện ${check.errors.length} lỗi cần chỉnh sửa theo quy tắc ${currentRuleSet.shortName}.`
      );
      return;
    }

    const options =
      formFormat === QuestionFormatCode.MCQ_SINGLE
        ? [
            `A. ${formOptA || 'Phương án A'}`,
            `B. ${formOptB || 'Phương án B'}`,
            `C. ${formOptC || 'Phương án C'}`,
            `D. ${formOptD || 'Phương án D'}`,
          ]
        : undefined;

    onAddQuestion({
      levelId: formLevel,
      grade: formGrade,
      subject: formSubject,
      topicTitle: formTopic.trim(),
      learningOutcomeCode: formOutcomeCode.trim() || 'YCCĐ-1.1',
      learningOutcomeText: formOutcomeText.trim(),
      cognitiveLevel: formCognitive,
      format: formFormat,
      stem: formStem.trim(),
      options,
      correctAnswer: formCorrectAnswer.trim(),
      gradingGuide: formGradingGuide.trim() || `Trả lời đúng đạt ${formPoints} điểm.`,
      points: formPoints,
      status: ApprovalStatus.APPROVED,
      authorName: formAuthor.trim() || 'Giáo viên Bộ môn',
      isSampleData: false,
    });

    setFormStem('');
    setFormTopic('');
    setFormOutcomeText('');
    setFormCorrectAnswer('');
    setFormGradingGuide('');
    setShowCreateModal(false);
    onNotify(
      'success',
      'Đã lưu câu hỏi vào Ngân hàng thật',
      `Câu hỏi môn ${formSubject} Lớp ${formGrade} đã được kiểm tra quy tắc ${currentRuleSet.shortName} và lưu thành công.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Thanh công cụ & Bộ lọc Ngân hàng câu hỏi */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Ngân hàng Câu hỏi Chuẩn hóa GDPT 2018
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý câu hỏi theo từng cấp học (Tiểu học Lớp 1–5 theo TT 27/2020; THCS Lớp 6–9 theo TT 22/2021)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showCreateModal ? 'Đóng biểu mẫu nhập' : 'Biên soạn câu hỏi mới'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tìm kiếm theo mã, môn học, chủ đề hoặc nội dung
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Lọc theo Cấp học
            </label>
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value as EducationLevelId | 'ALL');
                setFilterGrade('ALL');
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Tất cả cấp học (Tiểu học & THCS)</option>
              <option value={EducationLevelId.PRIMARY}>Cấp Tiểu học (Lớp 1–5)</option>
              <option value={EducationLevelId.LOWER_SECONDARY}>Cấp THCS (Lớp 6–9)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Lọc theo Khối lớp
            </label>
            <select
              value={filterGrade}
              onChange={(e) =>
                setFilterGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Tất cả các khối lớp (1–9)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  Khối lớp {g} ({g <= 5 ? 'Tiểu học' : 'THCS'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Biểu mẫu nhập câu hỏi mới có kiểm tra hợp lệ theo cấp học */}
      {showCreateModal && (
        <form
          onSubmit={handleSaveQuestion}
          className="bg-white border border-blue-200 rounded-xl p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Biểu mẫu Biên soạn Câu hỏi Mới (Lưu trực tiếp vào Dữ liệu thật)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hệ thống tự động áp dụng bộ mức độ nhận thức và định dạng theo cấp học bạn chọn
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleFormLevelChange(EducationLevelId.PRIMARY)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  formLevel === EducationLevelId.PRIMARY
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tiểu học (Lớp 1–5)
              </button>
              <button
                type="button"
                onClick={() => handleFormLevelChange(EducationLevelId.LOWER_SECONDARY)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  formLevel === EducationLevelId.LOWER_SECONDARY
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                THCS (Lớp 6–9)
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
            <strong>Hướng dẫn quy tắc {currentRuleSet.shortName}:</strong> Áp dụng theo{' '}
            {currentRuleSet.legalBasis}. Thang đánh giá gồm{' '}
            <strong>
              {currentRuleSet.cognitiveLevels.map((c) => c.shortLabel).join(' · ')}
            </strong>
            .
          </div>

          {validationErrors.length > 0 && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
              <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Vui lòng khắc phục các lỗi sau trước khi lưu:
              </div>
              <ul className="list-disc list-inside text-xs text-rose-700 space-y-0.5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              {validationWarnings.map((w, idx) => (
                <div key={idx}>Lưu ý: {w}</div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối lớp (*)
              </label>
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(Number(e.target.value) as GradeNumber)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {currentRuleSet.grades.map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Môn học (*)
              </label>
              <select
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {currentRuleSet.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức độ nhận thức ({currentRuleSet.shortName}) (*)
              </label>
              <select
                value={formCognitive}
                onChange={(e) => setFormCognitive(e.target.value as CognitiveLevelCode)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {currentRuleSet.cognitiveLevels.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Định dạng câu hỏi (*)
              </label>
              <select
                value={formFormat}
                onChange={(e) => {
                  const code = e.target.value as QuestionFormatCode;
                  setFormFormat(code);
                  const found = currentRuleSet.allowedFormats.find((f) => f.code === code);
                  if (found) setFormPoints(found.defaultPoints);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {currentRuleSet.allowedFormats.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chủ đề / Bài học (*)
              </label>
              <input
                type="text"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                placeholder="VD: Phân số và phép chia số tự nhiên"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã YCCĐ & Điểm số (*)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formOutcomeCode}
                  onChange={(e) => setFormOutcomeCode(e.target.value)}
                  placeholder="YCCĐ-1.1"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="10"
                  value={formPoints}
                  onChange={(e) => setFormPoints(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giáo viên biên soạn
              </label>
              <input
                type="text"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả Yêu cầu cần đạt (GDPT 2018) (*)
            </label>
            <input
              type="text"
              value={formOutcomeText}
              onChange={(e) => setFormOutcomeText(e.target.value)}
              placeholder="Nhập biểu hiện năng lực cụ thể học sinh cần đạt (tối thiểu 10 ký tự)..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung câu dẫn / Đề bài (*)
            </label>
            <textarea
              rows={3}
              value={formStem}
              onChange={(e) => setFormStem(e.target.value)}
              placeholder="Nhập nội dung câu hỏi rõ ràng, chính xác..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {formFormat === QuestionFormatCode.MCQ_SINGLE && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phương án A</label>
                <input
                  type="text"
                  value={formOptA}
                  onChange={(e) => setFormOptA(e.target.value)}
                  placeholder="Nội dung phương án A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phương án B</label>
                <input
                  type="text"
                  value={formOptB}
                  onChange={(e) => setFormOptB(e.target.value)}
                  placeholder="Nội dung phương án B"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phương án C</label>
                <input
                  type="text"
                  value={formOptC}
                  onChange={(e) => setFormOptC(e.target.value)}
                  placeholder="Nội dung phương án C"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phương án D</label>
                <input
                  type="text"
                  value={formOptD}
                  onChange={(e) => setFormOptD(e.target.value)}
                  placeholder="Nội dung phương án D"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đáp án đúng (*)
              </label>
              <input
                type="text"
                value={formCorrectAnswer}
                onChange={(e) => setFormCorrectAnswer(e.target.value)}
                placeholder="VD: A hoặc kết quả cụ thể"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hướng dẫn chấm & Biểu điểm chi tiết
              </label>
              <input
                type="text"
                value={formGradingGuide}
                onChange={(e) => setFormGradingGuide(e.target.value)}
                placeholder="VD: Mỗi bước giải đúng đạt 0.5 điểm..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              Kiểm tra hợp lệ & Lưu câu hỏi thật
            </button>
          </div>
        </form>
      )}

      {/* Danh sách câu hỏi */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-800">
              Không tìm thấy câu hỏi nào phù hợp với điều kiện lọc
            </div>
            <p className="text-xs text-slate-500">
              Hãy thử chuyển bộ lọc Nguồn dữ liệu sang "Tất cả dữ liệu" hoặc thêm câu hỏi mới.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const statusInfo = getApprovalStatusInfo(q.status);
            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{q.code}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">
                      Lớp {q.grade} ({q.levelId === EducationLevelId.PRIMARY ? 'Tiểu học' : 'THCS'})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">Môn {q.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-blue-700 font-medium">
                      {getCognitiveShortLabel(q.cognitiveLevel)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{getFormatLabel(q.format)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {q.points} điểm
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-semibold">Ngân hàng nhà trường</span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-medium ${statusInfo.textClass}`}>
                      {statusInfo.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteQuestion(q.id);
                        onNotify('info', 'Đã xóa câu hỏi', `Đã xóa câu hỏi mã ${q.code} khỏi danh sách.`);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Chủ đề: <strong className="text-slate-700">{q.topicTitle}</strong> · [{q.learningOutcomeCode}]{' '}
                  {q.learningOutcomeText}
                </div>

                <div className="text-sm font-medium text-slate-900 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                  {q.stem}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/70 text-xs font-normal text-slate-700">
                      {q.options.map((opt, idx) => (
                        <div key={idx}>{opt}</div>
                      ))}
                    </div>
                  )}
                  {q.subStatements && q.subStatements.length > 0 && (
                    <div className="space-y-1.5 mt-3 pt-2 border-t border-slate-200/70 text-xs font-normal text-slate-700">
                      {q.subStatements.map((st) => (
                        <div key={st.label} className="flex items-center justify-between gap-2">
                          <span>
                            <strong>{st.label})</strong> {st.statement}
                          </span>
                          <span className="font-mono font-semibold text-slate-800 shrink-0">
                            {st.isTrue ? 'Đúng' : 'Sai'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="text-slate-700">
                    <span className="font-semibold text-emerald-700">Đáp án đúng: </span>
                    {q.correctAnswer}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">Hướng dẫn chấm: </span>
                    {q.gradingGuide}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface AIQuestionGeneratorViewProps {
  onSaveGeneratedQuestion: (q: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const AIQuestionGeneratorView: React.FC<AIQuestionGeneratorViewProps> = ({
  onSaveGeneratedQuestion,
  onNotify,
}) => {
  const [levelId, setLevelId] = useState<EducationLevelId>(EducationLevelId.PRIMARY);
  const ruleSet = getRuleSetForLevel(levelId);

  const [grade, setGrade] = useState<GradeNumber>(4);
  const [subject, setSubject] = useState<string>('Toán');
  const [topicTitle, setTopicTitle] = useState('Phân số và phép cộng hai phân số');
  const [learningOutcomeText, setLearningOutcomeText] = useState(
    'Thực hiện được phép cộng hai phân số cùng mẫu số và khác mẫu số, vận dụng giải bài toán thực tiễn.'
  );
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevelCode>(
    CognitiveLevelCode.PRIMARY_MUC_2
  );
  const [format, setFormat] = useState<QuestionFormatCode>(QuestionFormatCode.MCQ_SINGLE);
  const [points, setPoints] = useState<number>(0.5);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedDraft, setGeneratedDraft] = useState<{
    stem: string;
    options?: string[];
    correctAnswer: string;
    gradingGuide: string;
    pedagogicalNote: string;
    sourceMode: string;
  } | null>(null);

  const handleLevelChange = (newLevel: EducationLevelId) => {
    setLevelId(newLevel);
    const rules = getRuleSetForLevel(newLevel);
    setGrade(rules.grades[0]);
    setSubject(rules.subjects[0]);
    setCognitiveLevel(rules.cognitiveLevels[0].code);
    setFormat(rules.allowedFormats[0].code);
    setPoints(rules.allowedFormats[0].defaultPoints);
    setGeneratedDraft(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !learningOutcomeText.trim()) {
      onNotify('error', 'Thiếu thông tin đầu vào', 'Vui lòng nhập Chủ đề bài học và Yêu cầu cần đạt.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateQuestionWithAI({
        levelId,
        grade,
        subject,
        topicTitle: topicTitle.trim(),
        learningOutcomeText: learningOutcomeText.trim(),
        cognitiveLevel,
        format,
        points,
      });
      setGeneratedDraft(result);
      onNotify(
        'success',
        'Đã khởi tạo dự thảo câu hỏi',
        `Câu hỏi đã được biên soạn bám sát quy tắc ${ruleSet.shortName} (${ruleSet.legalBasis}).`
      );
    } catch {
      onNotify('error', 'Lỗi khởi tạo câu hỏi', 'Vui lòng kiểm tra lại thông số đầu vào.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToRealBank = () => {
    if (!generatedDraft) return;
    onSaveGeneratedQuestion({
      levelId,
      grade,
      subject,
      topicTitle: topicTitle.trim(),
      learningOutcomeCode: `YCCĐ-K${grade}-AI`,
      learningOutcomeText: learningOutcomeText.trim(),
      cognitiveLevel,
      format,
      stem: generatedDraft.stem,
      options: generatedDraft.options,
      correctAnswer: generatedDraft.correctAnswer,
      gradingGuide: generatedDraft.gradingGuide,
      points,
      status: ApprovalStatus.APPROVED,
      authorName: 'Giáo viên (Hỗ trợ bởi EDU TEST AI)',
      isSampleData: false,
    });

    onNotify(
      'success',
      'Đã lưu vào Ngân hàng câu hỏi thật',
      'Câu hỏi do AI gợi ý đã được thẩm định sơ bộ và lưu thành dữ liệu thật.'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700">
            Tích hợp AI qua Máy chủ Proxy an toàn (Không lưu API Key trên trình duyệt)
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Trợ lý AI Biên soạn Câu hỏi theo Yêu cầu cần đạt (GDPT 2018)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tự động đối chiếu quy tắc đánh giá của Tiểu học (Thông tư 27) hoặc THCS (Thông tư 22 & CV 7991)
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => handleLevelChange(EducationLevelId.PRIMARY)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
              levelId === EducationLevelId.PRIMARY
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiểu học (Lớp 1–5)
          </button>
          <button
            type="button"
            onClick={() => handleLevelChange(EducationLevelId.LOWER_SECONDARY)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
              levelId === EducationLevelId.LOWER_SECONDARY
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            THCS (Lớp 6–9)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
            1. Thiết lập thông số sư phạm ({ruleSet.shortName})
          </h3>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức độ nhận thức ({ruleSet.shortName})
              </label>
              <select
                value={cognitiveLevel}
                onChange={(e) => setCognitiveLevel(e.target.value as CognitiveLevelCode)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {ruleSet.cognitiveLevels.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại câu hỏi
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as QuestionFormatCode)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {ruleSet.allowedFormats.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mạch nội dung / Chủ đề bài học (*)
            </label>
            <input
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Yêu cầu cần đạt cụ thể (GDPT 2018) (*)
            </label>
            <textarea
              rows={3}
              value={learningOutcomeText}
              onChange={(e) => setLearningOutcomeText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-950 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Đang phân tích YCCĐ và sinh câu hỏi...' : 'AI Soạn dự thảo câu hỏi & hướng dẫn chấm'}
          </button>
        </form>

        {/* Kết quả sinh câu hỏi */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              2. Kết quả Dự thảo & Kiểm duyệt của Giáo viên
            </h3>
            {generatedDraft && (
              <span className="text-xs text-blue-700 font-medium">
                {generatedDraft.sourceMode === 'SERVER_GEMINI_API'
                  ? 'Máy chủ AI trực tuyến'
                  : 'Khung quy tắc GDPT 2018'}
              </span>
            )}
          </div>

          {!generatedDraft ? (
            <div className="py-12 text-center space-y-2 text-slate-500">
              <Sparkles className="w-7 h-7 text-amber-500 mx-auto" />
              <div className="text-sm font-medium text-slate-700">
                Chưa có dự thảo câu hỏi
              </div>
              <p className="text-xs max-w-md mx-auto">
                Chọn cấp học, khối lớp, mức độ nhận thức và nhấn nút bên trái để hệ thống tạo câu hỏi kèm đáp án và hướng dẫn chấm.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung đề bài (Có thể chỉnh sửa trực tiếp)
                </label>
                <textarea
                  rows={3}
                  value={generatedDraft.stem}
                  onChange={(e) =>
                    setGeneratedDraft({ ...generatedDraft, stem: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50"
                />
              </div>

              {generatedDraft.options && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700">Các phương án lựa chọn:</div>
                  {generatedDraft.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const nextOpts = [...(generatedDraft.options || [])];
                        nextOpts[idx] = e.target.value;
                        setGeneratedDraft({ ...generatedDraft, options: nextOpts });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đáp án đúng
                </label>
                <input
                  type="text"
                  value={generatedDraft.correctAnswer}
                  onChange={(e) =>
                    setGeneratedDraft({ ...generatedDraft, correctAnswer: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hướng dẫn chấm & Biểu điểm
                </label>
                <textarea
                  rows={2}
                  value={generatedDraft.gradingGuide}
                  onChange={(e) =>
                    setGeneratedDraft({ ...generatedDraft, gradingGuide: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-slate-700">
                <strong className="text-blue-800">Thẩm định sư phạm tự động: </strong>
                {generatedDraft.pedagogicalNote}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveToRealBank}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Đưa vào Ngân hàng câu hỏi (Dữ liệu thật)
                </button>
              </div>
            </div>
          )}

          {/* Ghi chú rõ tính năng Giai đoạn 2 */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Sinh câu hỏi hàng loạt từ file PDF/Word ngữ liệu:</span>
            <span className="font-semibold text-amber-700">Chưa triển khai (Giai đoạn 2)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
