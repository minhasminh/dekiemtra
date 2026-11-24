import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  Copy,
  Edit3,
  FileCheck2,
  Filter,
  GitFork,
  Globe,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

interface SchoolPrivateQuestionItem {
  id: string;
  questionCode: string;
  schoolId: string;
  schoolName: string;
  bankCategory: 'SCHOOL_PRIVATE_BANK';
  visibility: 'PRIVATE_SCHOOL';
  educationLevel: 'PRIMARY' | 'LOWER_SECONDARY' | 'UPPER_SECONDARY';
  grade: number;
  subject: string;
  topic: string;
  learningOutcome: string;
  cognitiveLevel: string;
  questionFormat: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  stem: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceCitation: string;
  appraisalStatus: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED';
  isFromConfidentialExam: boolean;
  version: number;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isClonedFromSharedRepo?: boolean;
  clonedFromSharedQuestionId?: string;
  clonedFromSharedCode?: string;
  clonedFromSharedVersion?: number;
  originContributingSchoolDisplay?: string;
  originUsageRights?: string;
}

interface SharedRepoQuestionItem {
  id: string;
  questionCode: string;
  originQuestionId: string;
  originQuestionCode: string;
  sharingCategory: 'SYSTEM_INTERNAL_PUBLIC_BANK' | 'CONTROLLED_INTER_SCHOOL_SET';
  allowedSchoolIds: string[];
  sourceCitation: string;
  contributingSchoolId: string;
  contributingSchoolName: string;
  allowDisplayContributingSchool: boolean;
  contributingSchoolDisplay: string;
  sharedVersion: number;
  sharedAt: string;
  usageRights: string;
  usageRightsLabel: string;
  appraisalStatus: 'APPROVED';
  educationLevel: 'PRIMARY' | 'LOWER_SECONDARY' | 'UPPER_SECONDARY';
  grade: number;
  subject: string;
  topic: string;
  learningOutcome: string;
  cognitiveLevel: string;
  questionFormat: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  stem: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  proposedByName: string;
  approvedByAuthorityName: string;
  approvedByAuthorityRole: string;
  copyrightVerified: boolean;
  sensitiveDataCleared: boolean;
  cloneCount: number;
}

interface ShareProposalItem {
  id: string;
  sourceSchoolId: string;
  sourceSchoolName: string;
  sourceQuestionId: string;
  sourceQuestionCode: string;
  sharingCategory: 'SYSTEM_INTERNAL_PUBLIC_BANK' | 'CONTROLLED_INTER_SCHOOL_SET';
  allowedSchoolIds: string[];
  sourceCitation: string;
  allowDisplayContributingSchool: boolean;
  usageRights: string;
  proposedByName: string;
  proposedAt: string;
  workflowStage: string;
  copyrightVerified: boolean;
  sensitiveDataCleared: boolean;
  approvedByName?: string;
  approvedByRole?: string;
  approvedAt?: string;
  publishedSharedQuestionId?: string;
}

interface SharedRepoAuditLog {
  id: string;
  timestamp: string;
  actorSchoolId: string;
  actorUserId: string;
  actorName: string;
  actionCode: string;
  targetId: string;
  status: 'ALLOWED' | 'BLOCKED';
  httpStatus: number;
  detail: string;
}

interface SharedRepoQaTestCase {
  order: number;
  code: string;
  title: string;
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface SharedRepoQaReport {
  runId: string;
  executedAt: string;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  comparisonSnapshot?: {
    schoolAOriginal: {
      questionCode: string;
      schoolId: string;
      version: number;
      stem: string;
      firstOption: string;
    };
    schoolBEditedClone: {
      questionCode: string;
      schoolId: string;
      version: number;
      stem: string;
      firstOption: string;
      clonedFromSharedCode?: string;
    };
  };
  testCases: SharedRepoQaTestCase[];
}

const SCHOOL_OPTIONS = [
  {
    id: 'sch-tieu-hoc-a',
    name: 'Trường Tiểu học A (Đơn vị đóng góp câu hỏi gốc)',
    defaultTeacher: 'Cô Phạm Thu Hà (GV Trường A)',
    defaultAuthority: 'Cô Nguyễn Thị Minh Tâm (Tổ trưởng / Quản trị Trường A)',
  },
  {
    id: 'sch-thcs-b',
    name: 'Trường THCS B (Đơn vị tìm kiếm, sao chép & chỉnh sửa bản sao)',
    defaultTeacher: 'Thầy Đặng Quốc Khánh (GV Trường B)',
    defaultAuthority: 'Thầy Hoàng Văn Nghị (Phó Hiệu trưởng Trường B)',
  },
  {
    id: 'sch-th-thcs-nguyen-du',
    name: 'Trường TH &THCS Nguyễn Đình Anh (Liên cấp)',
    defaultTeacher: 'Thầy Phan Đức Quý (GV Toán - Tin)',
    defaultAuthority: 'Hiệu trưởng Trường TH &THCS Nguyễn Đình Anh',
  },
];

const QUESTION_FORMAT_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm 4 lựa chọn',
  TRUE_FALSE: 'Trắc nghiệm Đúng / Sai',
  SHORT_ANSWER: 'Trả lời ngắn',
  ESSAY: 'Tự luận',
};

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  PRIMARY: 'Tiểu học (Lớp 1–5)',
  LOWER_SECONDARY: 'THCS (Lớp 6–9)',
  UPPER_SECONDARY: 'THPT (Lớp 10–12)',
};

export const SharedQuestionRepositoryWorkspace: React.FC = () => {
  const [activeSchoolId, setActiveSchoolId] = useState<string>('sch-tieu-hoc-a');
  const [activeTab, setActiveTab] = useState<
    'SHARED_SEARCH' | 'PRIVATE_AND_CLONES' | 'SHARE_WORKFLOW' | 'QA_VERIFICATION'
  >('SHARED_SEARCH');

  // 7 Bộ lọc tìm kiếm chuyên môn (Mục IV)
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterTopic, setFilterTopic] = useState<string>('');
  const [filterOutcome, setFilterOutcome] = useState<string>('');
  const [filterCognitiveLevel, setFilterCognitiveLevel] = useState<string>('ALL');
  const [filterFormat, setFilterFormat] = useState<string>('ALL');

  const [privateQuestions, setPrivateQuestions] = useState<SchoolPrivateQuestionItem[]>([]);
  const [sharedQuestions, setSharedQuestions] = useState<SharedRepoQuestionItem[]>([]);
  const [proposals, setProposals] = useState<ShareProposalItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<SharedRepoAuditLog[]>([]);
  const [categorySummary, setCategorySummary] = useState({
    privateBankCount: 0,
    systemPublicBankCount: 0,
    controlledInterSchoolCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    detail: string;
  } | null>(null);

  // Biểu mẫu tạo câu hỏi riêng mới (Mục I.1 & II.1)
  const [newQLevel, setNewQLevel] = useState<'PRIMARY' | 'LOWER_SECONDARY'>('PRIMARY');
  const [newQGrade, setNewQGrade] = useState<number>(5);
  const [newQSubject, setNewQSubject] = useState<string>('Toán');
  const [newQTopic, setNewQTopic] = useState<string>('Số thập phân và Đo lường');
  const [newQOutcome, setNewQOutcome] = useState<string>(
    'Tính được diện tích hình chữ nhật có kích thước là số thập phân'
  );
  const [newQCognitive, setNewQCognitive] = useState<string>('Mức 2');
  const [newQFormat, setNewQFormat] = useState<
    'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY'
  >('MULTIPLE_CHOICE');
  const [newQStem, setNewQStem] = useState<string>(
    'Một tấm bảng hình chữ nhật có chiều dài 2,4 m và chiều rộng 1,5 m. Diện tích của tấm bảng đó là bao nhiêu mét vuông?'
  );
  const [newQSource, setNewQSource] = useState<string>(
    'Tổ Chuyên môn biên soạn theo Chương trình GDPT 2018'
  );

  // Biểu mẫu đề xuất chia sẻ (Mục III.1)
  const [selectedQuestionForShare, setSelectedQuestionForShare] = useState<string>('');
  const [shareCategory, setShareCategory] = useState<
    'SYSTEM_INTERNAL_PUBLIC_BANK' | 'CONTROLLED_INTER_SCHOOL_SET'
  >('SYSTEM_INTERNAL_PUBLIC_BANK');
  const [shareAllowedSchools, setShareAllowedSchools] = useState<string[]>([
    'sch-thcs-b',
    'sch-th-thcs-nguyen-du',
  ]);
  const [shareShowSchoolName, setShareShowSchoolName] = useState<boolean>(true);
  const [shareUsageRights, setShareUsageRights] = useState<string>(
    'INTERNAL_EDU_TEST_REUSE_AND_ADAPT'
  );
  const [shareCitationOverride, setShareCitationOverride] = useState<string>('');

  // Chỉnh sửa bản sao tại ngân hàng riêng
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingStemText, setEditingStemText] = useState<string>('');

  // Báo cáo kiểm thử 7 kịch bản (Mục VI)
  const [qaReport, setQaReport] = useState<SharedRepoQaReport | null>(null);
  const [runningQa, setRunningQa] = useState<boolean>(false);

  const activeSchoolInfo =
    SCHOOL_OPTIONS.find((s) => s.id === activeSchoolId) || SCHOOL_OPTIONS[0];

  const loadWorkspaceData = async (targetSchoolId = activeSchoolId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        schoolId: targetSchoolId,
        sharingCategory: filterCategory,
        educationLevel: filterLevel,
        grade: filterGrade,
        subject: filterSubject,
        topic: filterTopic,
        learningOutcome: filterOutcome,
        cognitiveLevel: filterCognitiveLevel,
        questionFormat: filterFormat,
      });
      const res = await fetch(`/api/shared-question-repo/workspace?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setPrivateQuestions(json.privateQuestions || []);
        setSharedQuestions(json.sharedQuestions || []);
        setProposals(json.proposals || []);
        setAuditLogs(json.auditLogs || []);
        if (json.categorySummary) {
          setCategorySummary(json.categorySummary);
        }
        if (
          json.privateQuestions?.length > 0 &&
          (!selectedQuestionForShare ||
            !json.privateQuestions.some(
              (q: SchoolPrivateQuestionItem) => q.id === selectedQuestionForShare
            ))
        ) {
          setSelectedQuestionForShare(json.privateQuestions[0].id);
        }
      }
    } catch {
      // ignore fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkspaceData(activeSchoolId);
  }, [
    activeSchoolId,
    filterCategory,
    filterLevel,
    filterGrade,
    filterSubject,
    filterCognitiveLevel,
    filterFormat,
  ]);

  const handleRunQaSuite = async () => {
    setRunningQa(true);
    try {
      const res = await fetch('/api/shared-question-repo/run-qa-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.ok && json.report) {
        setQaReport(json.report);
        await loadWorkspaceData(activeSchoolId);
        setBannerMessage({
          type: 'success',
          title: `Kiểm thử Nghiệm thu Kho câu hỏi dùng chung: ĐẠT ${json.report.passedCount}/${json.report.totalCount} kịch bản`,
          detail:
            'Đã xác minh toàn bộ luồng: Trường A tạo câu riêng -> Trường B không thể xem -> Trường A duyệt chia sẻ -> Trường B tìm thấy -> Trường B sao chép về ngân hàng riêng -> Trường B chỉnh sửa bản sao -> Bản gốc Trường A không thay đổi.',
        });
      }
    } catch {
      setBannerMessage({
        type: 'error',
        title: 'Lỗi khi chạy bộ kiểm thử',
        detail: 'Không thể kết nối máy chủ kiểm thử.',
      });
    } finally {
      setRunningQa(false);
    }
  };

  useEffect(() => {
    void handleRunQaSuite();
  }, []);

  const handleCreatePrivateQuestion = async () => {
    try {
      const res = await fetch('/api/shared-question-repo/private-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: activeSchoolId,
          actorName: activeSchoolInfo.defaultTeacher,
          educationLevel: newQLevel,
          grade: newQGrade,
          subject: newQSubject,
          topic: newQTopic,
          learningOutcome: newQOutcome,
          cognitiveLevel: newQCognitive,
          questionFormat: newQFormat,
          stem: newQStem,
          options: ['A. 3,6 m²', 'B. 7,8 m²', 'C. 3,9 m²', 'D. 4,2 m²'],
          correctAnswer: 'A',
          explanation: 'Diện tích tấm bảng hình chữ nhật là: 2,4 × 1,5 = 3,6 (m²).',
          sourceCitation: newQSource,
          appraisalStatus: 'APPROVED',
          isFromConfidentialExam: false,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setBannerMessage({
          type: 'success',
          title: `Đã tạo câu hỏi riêng "${json.question.questionCode}" tại ${activeSchoolInfo.name}`,
          detail:
            'Câu hỏi mặc định có trạng thái riêng tư (visibility = PRIVATE_SCHOOL). Các trường khác hoàn toàn không thể xem khi chưa được duyệt chia sẻ.',
        });
        await loadWorkspaceData(activeSchoolId);
      } else {
        setBannerMessage({
          type: 'error',
          title: 'Không thể tạo câu hỏi riêng',
          detail: String(json.message || 'Lỗi dữ liệu đầu vào.'),
        });
      }
    } catch {
      // ignore
    }
  };

  const handleProposeShare = async (questionIdOverride?: string) => {
    const qId = questionIdOverride || selectedQuestionForShare;
    if (!qId) return;
    try {
      const res = await fetch('/api/shared-question-repo/propose-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceSchoolId: activeSchoolId,
          sourceQuestionId: qId,
          proposedByName: activeSchoolInfo.defaultTeacher,
          sharingCategory: shareCategory,
          allowedSchoolIds:
            shareCategory === 'SYSTEM_INTERNAL_PUBLIC_BANK' ? ['ALL'] : shareAllowedSchools,
          sourceCitation: shareCitationOverride,
          allowDisplayContributingSchool: shareShowSchoolName,
          usageRights: shareUsageRights,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setBannerMessage({
          type: 'success',
          title: `Bước 1 hoàn tất: Đã tạo đề xuất chia sẻ câu hỏi "${json.proposal.sourceQuestionCode}"`,
          detail:
            'Đề xuất đang chờ Người có thẩm quyền của trường (Tổ trưởng chuyên môn / Ban Giám hiệu / Quản trị trường) kiểm duyệt bản quyền và dữ liệu nhạy cảm.',
        });
        await loadWorkspaceData(activeSchoolId);
        setActiveTab('SHARE_WORKFLOW');
      } else {
        setBannerMessage({
          type: 'error',
          title: `Bị chặn tại Backend (HTTP ${res.status} · ${json.errorCode})`,
          detail: String(json.message || 'Không đủ điều kiện chia sẻ.'),
        });
        await loadWorkspaceData(activeSchoolId);
      }
    } catch {
      // ignore
    }
  };

  const handleApproveAndPublish = async (proposalId: string) => {
    try {
      const res = await fetch('/api/shared-question-repo/approve-and-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          approverSchoolId: activeSchoolId,
          approverName: activeSchoolInfo.defaultAuthority,
          approverRole: 'HEAD_OF_DEPARTMENT',
          copyrightVerified: true,
          sensitiveDataCleared: true,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setBannerMessage({
          type: 'success',
          title: `Bước 2–5 hoàn tất: Đã phát hành "${json.sharedQuestion.questionCode}" (v${json.sharedQuestion.sharedVersion}) vào Kho dùng chung`,
          detail: `Đã kiểm duyệt bản quyền & dữ liệu nhạy cảm. Các trường được cấp quyền có thể tìm kiếm và sao chép bản độc lập về ngân hàng riêng.`,
        });
        await loadWorkspaceData(activeSchoolId);
      } else {
        setBannerMessage({
          type: 'error',
          title: `Từ chối phê duyệt chia sẻ (HTTP ${res.status})`,
          detail: String(json.message || 'Lỗi phê duyệt.'),
        });
      }
    } catch {
      // ignore
    }
  };

  const handleCloneSharedQuestion = async (sharedQuestionId: string) => {
    try {
      const res = await fetch('/api/shared-question-repo/clone-to-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedQuestionId,
          targetSchoolId: activeSchoolId,
          actorName: activeSchoolInfo.defaultTeacher,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setBannerMessage({
          type: 'success',
          title: `Bước 6 hoàn tất: Đã sao chép thành bản sao độc lập "${json.clonedQuestion.questionCode}"`,
          detail: `Câu hỏi đã được sao chép (Deep Clone) về ngân hàng câu hỏi riêng của ${activeSchoolInfo.name}. Không có tham chiếu sửa trực tiếp bản gốc của trường đóng góp.`,
        });
        await loadWorkspaceData(activeSchoolId);
        setActiveTab('PRIVATE_AND_CLONES');
      } else {
        setBannerMessage({
          type: 'error',
          title: `Không thể sao chép câu hỏi (HTTP ${res.status})`,
          detail: String(json.message || 'Trường hiện tại không có quyền sao chép bộ câu hỏi này.'),
        });
      }
    } catch {
      // ignore
    }
  };

  const handleSaveEditedQuestion = async (question: SchoolPrivateQuestionItem) => {
    try {
      const res = await fetch(
        `/api/shared-question-repo/private-questions/${encodeURIComponent(
          question.schoolId
        )}/${encodeURIComponent(question.id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorSchoolId: activeSchoolId,
            actorName: activeSchoolInfo.defaultTeacher,
            stem: editingStemText,
          }),
        }
      );
      const json = await res.json();
      if (res.ok && json.ok) {
        setEditingQuestionId(null);
        setBannerMessage({
          type: 'success',
          title: `Đã cập nhật bản sao "${json.question.questionCode}" (v${json.question.version}) tại ${activeSchoolInfo.name}`,
          detail:
            'Bản gốc tại trường đóng góp và bản trên Kho câu hỏi dùng chung được bảo toàn nguyên vẹn 100%, không bị thay đổi.',
        });
        await loadWorkspaceData(activeSchoolId);
      } else {
        setBannerMessage({
          type: 'error',
          title: `Chặn chỉnh sửa trái phép (HTTP ${res.status})`,
          detail: String(json.message || 'Không thể chỉnh sửa.'),
        });
      }
    } catch {
      // ignore
    }
  };

  const handleSimulateCrossSchoolViolation = async () => {
    // Giả lập Trường B cố đọc trực tiếp câu hỏi riêng của Trường A
    const res = await fetch(
      `/api/shared-question-repo/private-questions/sch-tieu-hoc-a/q_priv_tha_001?viewerSchoolId=sch-thcs-b`
    );
    const json = await res.json();
    setBannerMessage({
      type: 'error',
      title: `Đã chặn truy cập chéo ngân hàng riêng (HTTP ${res.status} · ${json.errorCode})`,
      detail: String(json.message),
    });
    await loadWorkspaceData(activeSchoolId);
  };

  return (
    <div className="space-y-6">
      {/* Header & Thanh chuyển đổi Trường làm việc */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>EDU TEST AI MULTI-SCHOOL · KHO CÂU HỎI DÙNG CHUNG LIÊN TRƯỜNG</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Kho Câu Hỏi Dùng Chung & Kiểm Soát Chia Sẻ Đa Trường
            </h1>
            <p className="text-xs text-slate-600">
              Cô lập mặc định ngân hàng riêng từng trường · Duyệt chia sẻ 6 bước qua cấp có thẩm quyền · Ghi rõ nguồn & quyền sử dụng · Sao chép độc lập (Deep Clone) không làm biến đổi bản gốc.
            </p>
          </div>

          {/* Chọn trường đang đóng vai */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-[330px]">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Trường đang thao tác (Multi-School Context):
            </label>
            <select
              value={activeSchoolId}
              onChange={(e) => setActiveSchoolId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
            >
              {SCHOOL_OPTIONS.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name}
                </option>
              ))}
            </select>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>Mã trường: {activeSchoolId}</span>
              <span className="font-medium text-indigo-700">{activeSchoolInfo.defaultTeacher}</span>
            </div>
          </div>
        </div>

        {/* 3 Thẻ Phân loại Ngân hàng câu hỏi (Mục I) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                1. Ngân hàng câu hỏi riêng của trường
              </span>
              <Lock className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {categorySummary.privateBankCount} câu
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Mặc định riêng tư (`PRIVATE_SCHOOL`) tại `schools/{activeSchoolId}/questions`. Trường khác không thể xem hoặc tự sao chép.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                2. Ngân hàng công khai nội bộ hệ thống
              </span>
              <Globe className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-emerald-950 mt-1">
              {categorySummary.systemPublicBankCount} câu đã duyệt
            </div>
            <p className="text-[11px] text-emerald-800 mt-1">
              Đã qua kiểm duyệt chuyên môn, bản quyền & dữ liệu nhạy cảm. Các trường thành viên được tìm kiếm và sao chép theo quyền.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">
                3. Bộ câu hỏi chia sẻ có kiểm soát giữa các trường
              </span>
              <Users className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="text-2xl font-bold text-indigo-950 mt-1">
              {categorySummary.controlledInterSchoolCount} bộ/câu khả dụng
            </div>
            <p className="text-[11px] text-indigo-800 mt-1">
              Chỉ hiển thị và cho phép sao chép đối với các trường đối tác nằm trong danh sách được cấp quyền (`allowedSchoolIds`).
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo phản hồi */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : bannerMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
        >
          <div className="space-y-1 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              {bannerMessage.type === 'error' ? (
                <ShieldAlert className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{bannerMessage.title}</span>
            </div>
            <p className="opacity-90 leading-relaxed">{bannerMessage.detail}</p>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-xs font-semibold underline cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Thanh Điều hướng 4 Tab */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('SHARED_SEARCH')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'SHARED_SEARCH'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>1. Kho Dùng Chung & Tìm Kiếm 7 Tiêu Chí (Mục IV & V)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PRIVATE_AND_CLONES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'PRIVATE_AND_CLONES'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>
            2. Ngân Hàng Riêng Của Trường & Bản Sao Đã Nhận ({privateQuestions.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SHARE_WORKFLOW')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'SHARE_WORKFLOW'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>3. Quy Trình Chia Sẻ 6 Bước & Duyệt Thẩm Quyền (Mục II & III)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QA_VERIFICATION')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'QA_VERIFICATION'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            4. Kiểm Thử Nghiệm Thu 7 Kịch Bản (Mục VI){' '}
            {qaReport ? `· ${qaReport.passedCount}/${qaReport.totalCount} PASS` : ''}
          </span>
        </button>
      </div>

      {/* TAB 1: KHO DÙNG CHUNG & BỘ LỌC 7 TIÊU CHÍ (MỤC IV & V) */}
      {activeTab === 'SHARED_SEARCH' && (
        <div className="space-y-6">
          {/* Bộ lọc 7 tiêu chí chuyên môn */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter className="w-4 h-4 text-indigo-700" />
                <span>Bộ lọc tìm kiếm 7 tiêu chí chuyên môn (Mục IV)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('ALL');
                    setFilterLevel('ALL');
                    setFilterGrade('ALL');
                    setFilterSubject('ALL');
                    setFilterTopic('');
                    setFilterOutcome('');
                    setFilterCognitiveLevel('ALL');
                    setFilterFormat('ALL');
                    void loadWorkspaceData(activeSchoolId);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
                <button
                  type="button"
                  onClick={() => void loadWorkspaceData(activeSchoolId)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  1. Cấp học
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Tất cả cấp học</option>
                  <option value="PRIMARY">Tiểu học (Lớp 1–5)</option>
                  <option value="LOWER_SECONDARY">THCS (Lớp 6–9)</option>
                  <option value="UPPER_SECONDARY">THPT (Lớp 10–12)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  2. Khối lớp
                </label>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Tất cả khối lớp</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                    <option key={g} value={String(g)}>
                      Khối {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  3. Môn học
                </label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Tất cả môn học</option>
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  4. Chủ đề
                </label>
                <input
                  type="text"
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  placeholder="Nhập từ khóa chủ đề (VD: Số thập phân...)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  5. Yêu cầu cần đạt
                </label>
                <input
                  type="text"
                  value={filterOutcome}
                  onChange={(e) => setFilterOutcome(e.target.value)}
                  placeholder="Nhập từ khóa YCCĐ (VD: diện tích...)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  6. Mức độ nhận thức
                </label>
                <select
                  value={filterCognitiveLevel}
                  onChange={(e) => setFilterCognitiveLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Tất cả mức độ</option>
                  <option value="Mức 1">Mức 1 (Tiểu học)</option>
                  <option value="Mức 2">Mức 2 (Tiểu học)</option>
                  <option value="Mức 3">Mức 3 (Tiểu học)</option>
                  <option value="Nhận biết">Nhận biết (THCS)</option>
                  <option value="Thông hiểu">Thông hiểu (THCS)</option>
                  <option value="Vận dụng">Vận dụng (THCS)</option>
                  <option value="Vận dụng cao">Vận dụng cao (THCS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  7. Dạng câu hỏi
                </label>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Tất cả dạng câu hỏi</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm 4 lựa chọn</option>
                  <option value="TRUE_FALSE">Trắc nghiệm Đúng / Sai</option>
                  <option value="SHORT_ANSWER">Trả lời ngắn</option>
                  <option value="ESSAY">Tự luận</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phân loại Kho chia sẻ (Mục I)
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Tất cả kho dùng chung được phép xem</option>
                  <option value="SYSTEM_INTERNAL_PUBLIC_BANK">
                    Ngân hàng công khai nội bộ hệ thống
                  </option>
                  <option value="CONTROLLED_INTER_SCHOOL_SET">
                    Bộ câu hỏi chia sẻ có kiểm soát giữa các trường
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Danh sách câu hỏi trong Kho dùng chung kèm 7 trường Quản lý nguồn (Mục V) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Danh sách câu hỏi dùng chung khả dụng cho {activeSchoolInfo.name} (
                {sharedQuestions.length} câu)
              </h2>
              <span className="text-xs text-slate-500">
                Mọi thao tác sao chép đều tạo bản sao độc lập (Deep Clone) về ngân hàng riêng của trường
              </span>
            </div>

            {sharedQuestions.map((sq) => (
              <div
                key={sq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-xs font-bold">
                        {sq.questionCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          sq.sharingCategory === 'SYSTEM_INTERNAL_PUBLIC_BANK'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {sq.sharingCategory === 'SYSTEM_INTERNAL_PUBLIC_BANK'
                          ? 'Ngân hàng công khai nội bộ hệ thống'
                          : `Chia sẻ có kiểm soát (${sq.allowedSchoolIds.join(', ')})`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {EDUCATION_LEVEL_LABELS[sq.educationLevel] || sq.educationLevel} · Khối{' '}
                        {sq.grade} · {sq.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-medium">
                        {sq.cognitiveLevel} · {QUESTION_FORMAT_LABELS[sq.questionFormat]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Chủ đề:</span> {sq.topic} ·{' '}
                      <span className="font-semibold text-slate-800">Yêu cầu cần đạt:</span>{' '}
                      {sq.learningOutcome}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCloneSharedQuestion(sq.id)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép về ngân hàng riêng ({activeSchoolId})</span>
                  </button>
                </div>

                {/* Nội dung câu hỏi */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{sq.stem}</p>
                  {sq.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {sq.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-1 text-xs text-slate-700 flex flex-wrap gap-4">
                    <span>
                      <strong className="text-emerald-800">Đáp án đúng:</strong> {sq.correctAnswer}
                    </span>
                    <span>
                      <strong>Giải thích / Hướng dẫn chấm:</strong> {sq.explanation}
                    </span>
                  </div>
                </div>

                {/* Mục V: Bảng 7 thông tin Quản lý nguồn bắt buộc */}
                <div className="bg-indigo-50/40 rounded-xl p-3.5 border border-indigo-100">
                  <div className="text-[11px] font-bold text-indigo-950 uppercase mb-2">
                    Thông tin Quản lý nguồn & Bản quyền (Mục V – 7 thông tin bắt buộc):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">1. Mã câu chia sẻ:</span>
                      <span className="font-bold text-slate-900">
                        {sq.questionCode} (Gốc: {sq.originQuestionCode})
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">2. Nguồn biên soạn:</span>
                      <span className="font-semibold text-slate-800">{sq.sourceCitation}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">
                        3. Trường đóng góp (theo cấu hình hiển thị):
                      </span>
                      <span className="font-semibold text-indigo-900">
                        {sq.contributingSchoolDisplay}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">
                        4. Phiên bản & 5. Ngày chia sẻ:
                      </span>
                      <span className="font-semibold text-slate-800">
                        Phiên bản v{sq.sharedVersion}.0 ·{' '}
                        {new Date(sq.sharedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 sm:col-span-2">
                      <span className="text-[11px] text-slate-500 block">6. Quyền sử dụng:</span>
                      <span className="font-semibold text-slate-800">{sq.usageRightsLabel}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 sm:col-span-2">
                      <span className="text-[11px] text-slate-500 block">
                        7. Trạng thái thẩm định & Người duyệt:
                      </span>
                      <span className="font-semibold text-emerald-800">
                        Đã thẩm định ({sq.appraisalStatus}) · Duyệt bởi:{' '}
                        {sq.approvedByAuthorityName} · Đã sao chép: {sq.cloneCount} lượt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NGÂN HÀNG CÂU HỎI RIÊNG CỦA TRƯỜNG & CHỈNH SỬA BẢN SAO ĐỘC LẬP */}
      {activeTab === 'PRIVATE_AND_CLONES' && (
        <div className="space-y-6">
          {/* Khung tạo câu hỏi riêng mới */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-700" />
                  <span>
                    Tạo câu hỏi mới trong Ngân hàng riêng của {activeSchoolInfo.name}
                  </span>
                </h2>
                <p className="text-xs text-slate-600">
                  Mặc định mọi câu hỏi mới tạo có `visibility = PRIVATE_SCHOOL` (riêng tư tuyệt đối trong phạm vi `schoolId = {activeSchoolId}`).
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleSimulateCrossSchoolViolation()}
                className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-100 cursor-pointer"
              >
                Kiểm thử: Trường B cố xem câu hỏi riêng của Trường A (Chặn 403)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cấp học & Khối lớp
                </label>
                <div className="flex gap-2">
                  <select
                    value={newQLevel}
                    onChange={(e) =>
                      setNewQLevel(e.target.value as 'PRIMARY' | 'LOWER_SECONDARY')
                    }
                    className="w-2/3 px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PRIMARY">Tiểu học</option>
                    <option value="LOWER_SECONDARY">THCS</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newQGrade}
                    onChange={(e) => setNewQGrade(Number(e.target.value))}
                    className="w-1/3 px-2.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Môn học & Mức độ
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQSubject}
                    onChange={(e) => setNewQSubject(e.target.value)}
                    className="w-1/2 px-2.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newQCognitive}
                    onChange={(e) => setNewQCognitive(e.target.value)}
                    className="w-1/2 px-2.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chủ đề
                </label>
                <input
                  type="text"
                  value={newQTopic}
                  onChange={(e) => setNewQTopic(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nội dung câu hỏi riêng
                </label>
                <input
                  type="text"
                  value={newQStem}
                  onChange={(e) => setNewQStem(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => void handleCreatePrivateQuestion()}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold cursor-pointer"
                >
                  Lưu vào Ngân hàng riêng ({activeSchoolId})
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách câu hỏi riêng & bản sao của trường */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Danh sách câu hỏi thuộc Ngân hàng riêng của {activeSchoolInfo.name} (
              {privateQuestions.length} câu)
            </h3>

            {privateQuestions.map((pq) => (
              <div
                key={pq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-bold">
                      {pq.questionCode} (v{pq.version})
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Riêng tư ({pq.visibility})</span>
                    </span>
                    {pq.isClonedFromSharedRepo && (
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-xs font-bold">
                        Bản sao độc lập từ Kho chung ({pq.clonedFromSharedCode} v
                        {pq.clonedFromSharedVersion})
                      </span>
                    )}
                    {pq.isFromConfidentialExam && (
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-900 text-xs font-bold">
                        Thuộc Đề kiểm tra mật (Cấm chia sẻ)
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        pq.appraisalStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      Trạng thái: {pq.appraisalStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestionId(pq.id);
                        setEditingStemText(pq.stem);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa câu hỏi / bản sao</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleProposeShare(pq.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Đề xuất chia sẻ lên Kho chung</span>
                    </button>
                  </div>
                </div>

                {editingQuestionId === pq.id ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-amber-950">
                      Chỉnh sửa nội dung câu hỏi trong ngân hàng riêng của {pq.schoolName} (Không ảnh hưởng bản gốc của trường khác):
                    </label>
                    <textarea
                      rows={3}
                      value={editingStemText}
                      onChange={(e) => setEditingStemText(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-amber-300 rounded-lg"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleSaveEditedQuestion(pq)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Lưu bản chỉnh sửa (Tăng version)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingQuestionId(null)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    {pq.stem}
                  </p>
                )}

                <div className="text-xs text-slate-600 flex flex-wrap justify-between gap-2">
                  <span>
                    <strong>Nguồn:</strong> {pq.sourceCitation}
                  </span>
                  <span>
                    <strong>Tác giả / Người lưu:</strong> {pq.createdByName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUY TRÌNH CHIA SẺ 6 BƯỚC & DUYỆT THẨM QUYỀN (MỤC II & III) */}
      {activeTab === 'SHARE_WORKFLOW' && (
        <div className="space-y-6">
          {/* Sơ đồ 6 bước quy trình chia sẻ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Quy trình Chia sẻ Câu hỏi 6 Bước Có Kiểm Soát (Mục III)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
              {[
                {
                  step: 'Bước 1',
                  title: 'Giáo viên đề xuất chia sẻ',
                  desc: 'Chọn câu hỏi đã duyệt, khai báo nguồn & quyền sử dụng.',
                },
                {
                  step: 'Bước 2',
                  title: 'Người có thẩm quyền duyệt',
                  desc: 'Tổ trưởng CM / Ban Giám hiệu / Quản trị trường phê duyệt.',
                },
                {
                  step: 'Bước 3',
                  title: 'Kiểm tra bản quyền & dữ liệu nhạy cảm',
                  desc: 'Chặn đề mật, câu nháp, rà soát bản quyền & PII.',
                },
                {
                  step: 'Bước 4',
                  title: 'Tạo phiên bản chia sẻ',
                  desc: 'Đóng gói bản chụp (Snapshot v1, v2...) tách biệt bản gốc.',
                },
                {
                  step: 'Bước 5',
                  title: 'Đưa vào Kho dùng chung',
                  desc: 'Phát hành lên Kho công khai nội bộ hoặc Bộ chia sẻ có kiểm soát.',
                },
                {
                  step: 'Bước 6',
                  title: 'Tìm kiếm & Sao chép độc lập',
                  desc: 'Trường khác Deep Clone về ngân hàng riêng, không sửa bản gốc.',
                },
              ].map((st) => (
                <div
                  key={st.step}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="text-[11px] font-bold text-indigo-700">{st.step}</div>
                  <div className="font-bold text-slate-900">{st.title}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* Biểu mẫu Đề xuất chia sẻ (Bước 1) */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn câu hỏi từ Ngân hàng riêng ({activeSchoolId}):
                </label>
                <select
                  value={selectedQuestionForShare}
                  onChange={(e) => setSelectedQuestionForShare(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {privateQuestions.map((pq) => (
                    <option key={pq.id} value={pq.id}>
                      {pq.questionCode} · {pq.subject} Khối {pq.grade} ({pq.appraisalStatus}
                      {pq.isFromConfidentialExam ? ' - ĐỀ MẬT' : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phân loại chia sẻ (Mục I):
                </label>
                <select
                  value={shareCategory}
                  onChange={(e) =>
                    setShareCategory(
                      e.target.value as
                        | 'SYSTEM_INTERNAL_PUBLIC_BANK'
                        | 'CONTROLLED_INTER_SCHOOL_SET'
                    )
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="SYSTEM_INTERNAL_PUBLIC_BANK">
                    2. Ngân hàng câu hỏi công khai nội bộ hệ thống
                  </option>
                  <option value="CONTROLLED_INTER_SCHOOL_SET">
                    3. Bộ câu hỏi được chia sẻ có kiểm soát giữa các trường
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quyền sử dụng & Hiển thị tên trường đóng góp (Mục V):
                </label>
                <div className="flex items-center gap-3 pt-1.5">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareShowSchoolName}
                      onChange={(e) => setShareShowSchoolName(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Cho phép hiển thị tên trường đóng góp</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleProposeShare()}
                    className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold cursor-pointer ml-auto"
                  >
                    Gửi Đề Xuất Chia Sẻ (Bước 1)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách Hồ sơ đề xuất chia sẻ chờ duyệt (Bước 2 -> 5) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Danh sách Đề xuất Chia sẻ của {activeSchoolInfo.name} ({proposals.length} hồ sơ)
            </h3>
            {proposals.map((prop) => (
              <div
                key={prop.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Mã câu gốc: {prop.sourceQuestionCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-semibold">
                      {prop.sharingCategory === 'SYSTEM_INTERNAL_PUBLIC_BANK'
                        ? 'Công khai nội bộ hệ thống'
                        : `Chia sẻ có kiểm soát (${prop.allowedSchoolIds.join(', ')})`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        prop.workflowStage === 'STEP_5_PUBLISHED_TO_SHARED_REPO'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {prop.workflowStage === 'STEP_5_PUBLISHED_TO_SHARED_REPO'
                        ? 'Đã duyệt & Đưa vào Kho chung (Bước 5)'
                        : 'Chờ cấp có thẩm quyền của trường duyệt (Bước 1 -> 2)'}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Người đề xuất: <strong>{prop.proposedByName}</strong> · Nguồn:{' '}
                    {prop.sourceCitation}
                  </div>
                </div>

                {prop.workflowStage !== 'STEP_5_PUBLISHED_TO_SHARED_REPO' && (
                  <button
                    type="button"
                    onClick={() => void handleApproveAndPublish(prop.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>
                      Duyệt Thẩm Quyền, Kiểm Tra Bản Quyền & Phát Hành (Bước 2–5)
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BÁO CÁO KIỂM THỬ NGHIỆM THU 7 KỊCH BẢN (MỤC VI) */}
      {activeTab === 'QA_VERIFICATION' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Báo cáo Kiểm thử Nghiệm thu Kho Câu Hỏi Dùng Chung Đa Trường (Mục VI)
                </h2>
                <p className="text-xs text-slate-600">
                  Kiểm chứng tự động 7 bước giữa Trường A (`sch-tieu-hoc-a`) và Trường B (`sch-thcs-b`) đảm bảo cô lập dữ liệu và bảo toàn bản gốc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleRunQaSuite()}
                disabled={runningQa}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${runningQa ? 'animate-spin' : ''}`} />
                <span>Chạy lại Kiểm thử Nghiệm thu 7 Kịch bản</span>
              </button>
            </div>

            {qaReport && (
              <>
                {/* Đối chiếu trực quan Bản gốc Trường A vs Bản sao đã chỉnh sửa tại Trường B */}
                {qaReport.comparisonSnapshot && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                        <span>
                          BẢN GỐC TẠI TRƯỜNG A ({qaReport.comparisonSnapshot.schoolAOriginal.schoolId})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-950">
                          Giữ nguyên v{qaReport.comparisonSnapshot.schoolAOriginal.version}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900">
                        Mã câu: {qaReport.comparisonSnapshot.schoolAOriginal.questionCode}
                      </div>
                      <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-200">
                        {qaReport.comparisonSnapshot.schoolAOriginal.stem}
                      </p>
                      <div className="text-[11px] font-semibold text-emerald-900">
                        Đáp án A gốc: {qaReport.comparisonSnapshot.schoolAOriginal.firstOption}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-indigo-300 bg-indigo-50/60 space-y-1.5">
                      <div className="text-xs font-bold text-indigo-950 flex items-center justify-between">
                        <span>
                          BẢN SAO ĐÃ SỬA TẠI TRƯỜNG B (
                          {qaReport.comparisonSnapshot.schoolBEditedClone.schoolId})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-950">
                          Đã nâng lên v{qaReport.comparisonSnapshot.schoolBEditedClone.version}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900">
                        Mã bản sao: {qaReport.comparisonSnapshot.schoolBEditedClone.questionCode}{' '}
                        (Sao chép từ:{' '}
                        {qaReport.comparisonSnapshot.schoolBEditedClone.clonedFromSharedCode})
                      </div>
                      <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-indigo-200">
                        {qaReport.comparisonSnapshot.schoolBEditedClone.stem}
                      </p>
                      <div className="text-[11px] font-semibold text-indigo-900">
                        Đáp án A sau khi Trường B sửa:{' '}
                        {qaReport.comparisonSnapshot.schoolBEditedClone.firstOption}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bảng kết quả 7 bước kiểm thử */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-3 font-bold">Bước</th>
                        <th className="p-3 font-bold">Kịch bản nghiệm thu (Mục VI)</th>
                        <th className="p-3 font-bold">Kết quả kỳ vọng</th>
                        <th className="p-3 font-bold">Kết quả thực tế</th>
                        <th className="p-3 font-bold text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {qaReport.testCases.map((tc) => (
                        <tr key={tc.code} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                            Bước {tc.order}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{tc.title}</div>
                            <div className="text-slate-500 mt-0.5">{tc.scenario}</div>
                          </td>
                          <td className="p-3 text-slate-700">{tc.expected}</td>
                          <td className="p-3 font-medium text-slate-900">{tc.actual}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold ${
                                tc.passed
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{tc.passed ? 'PASS' : 'FAIL'}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
