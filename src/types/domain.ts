export enum EducationLevelId {
  PRIMARY = 'PRIMARY', // Tiểu học (Lớp 1 - 5)
  LOWER_SECONDARY = 'LOWER_SECONDARY', // THCS (Lớp 6 - 9)
  UPPER_SECONDARY = 'UPPER_SECONDARY', // THPT (Lớp 10 - 12 - Kiến trúc mở rộng)
}

export type GradeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type MenuSectionId =
  | 'stage16-acceptance'
  | 'executive-dashboard'
  | 'notification-center'
  | 'exam-workflow'
  | 'progress-management'
  | 'dashboard'
  | 'curriculum'
  | 'corpus'
  | 'primary-assessment'
  | 'exam-analytics'
  | 'ai-quality-review'
  | 'questions'
  | 'smart-import'
  | 'ai-generator'
  | 'matrix'
  | 'exam-builder'
  | 'approval'
  | 'records'
  | 'reports'
  | 'admin'
  | 'settings'
  | 'my-profile'
  | 'dept-dossiers'
  | 'dept-assign-reviewer'
  | 'dept-review-exam'
  | 'dept-progress'
  | 'dept-report'
  | 'bgh-school-dossiers'
  | 'bgh-assign-exam'
  | 'bgh-progress-tracking'
  | 'bgh-approval'
  | 'bgh-quality-report'
  | 'bgh-result-analytics'
  | 'admin-accounts'
  | 'admin-departments'
  | 'admin-roles'
  | 'admin-school-config'
  | 'admin-academic-year'
  | 'admin-audit-logs'
  | 'admin-backups'
  | 'admin-system-settings'
  | 'admin-teacher-permissions'
  | 'admin-firebase-data'
  | 'smart-autosave-conflict'
  | 'multi-tenant-stage19'
  | 'super-admin-schools'
  | 'school-admin-workspace'
  | 'shared-question-repo'
  | 'multi-school-security'
  | 'ai-usage-management'
  | 'school-plan-management'
  | 'stage21-production-ui'
  | 'smart-question-link';

export interface SmartQuestionLinkConfig {
  url: string;
  buttonLabel: string;
  description: string;
  openMode: 'DIRECT_NEW_TAB' | 'IN_APP_WORKSPACE';
  isEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
  updatedByRole?: string;
  schoolId?: string;
}

export type DataSourceFilter = 'ALL' | 'SAMPLE' | 'REAL';

export enum CognitiveLevelCode {
  // Tiểu học - Thông tư 27/2020/TT-BGDĐT (3 mức độ)
  PRIMARY_MUC_1 = 'PRIMARY_MUC_1',
  PRIMARY_MUC_2 = 'PRIMARY_MUC_2',
  PRIMARY_MUC_3 = 'PRIMARY_MUC_3',

  // THCS & THPT - Thông tư 22/2021/TT-BGDĐT & CV 7991 (4 mức độ)
  SEC_NHAN_BIET = 'SEC_NHAN_BIET',
  SEC_THONG_HIEU = 'SEC_THONG_HIEU',
  SEC_VAN_DUNG = 'SEC_VAN_DUNG',
  SEC_VAN_DUNG_CAO = 'SEC_VAN_DUNG_CAO',
}

export enum QuestionFormatCode {
  MCQ_SINGLE = 'MCQ_SINGLE', // 1. Trắc nghiệm một đáp án đúng
  MCQ_MULTIPLE = 'MCQ_MULTIPLE', // 2. Trắc nghiệm nhiều đáp án đúng
  TRUE_FALSE_CLUSTER = 'TRUE_FALSE_CLUSTER', // 3. Đúng – Sai, hỗ trợ các ý nhỏ
  SHORT_ANSWER = 'SHORT_ANSWER', // 4. Trả lời ngắn
  FILL_IN_BLANK = 'FILL_IN_BLANK', // 5. Điền khuyết
  MATCHING = 'MATCHING', // 6. Ghép nối
  ORDERING = 'ORDERING', // 7. Sắp xếp
  ESSAY_SHORT = 'ESSAY_SHORT', // 8. Tự luận ngắn
  ESSAY = 'ESSAY', // 9. Tự luận dài
  READING_COMPREHENSION = 'READING_COMPREHENSION', // 10. Đọc hiểu theo ngữ liệu chung
  MEDIA_FORMULA = 'MEDIA_FORMULA', // 11. Câu hỏi có hình ảnh, bảng biểu hoặc công thức
}

export enum ApprovalStatus {
  DRAFT = 'DRAFT', // Bản nháp
  PENDING = 'PENDING', // Chờ thẩm định
  IN_REVIEW = 'IN_REVIEW', // Đang thẩm định
  REVISION_REQUIRED = 'REVISION_REQUIRED', // Yêu cầu chỉnh sửa
  REVISED = 'REVISED', // Đã chỉnh sửa
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Chờ phê duyệt
  APPROVED = 'APPROVED', // Đã phê duyệt
  PUBLISHED = 'PUBLISHED', // Đã phát hành
  ARCHIVED = 'ARCHIVED', // Lưu trữ
  DEPRECATED = 'DEPRECATED', // Ngừng sử dụng
}

export interface CognitiveLevelDefinition {
  code: CognitiveLevelCode;
  shortLabel: string;
  name: string;
  description: string;
  recommendedPercentageRange: [number, number];
}

export interface QuestionFormatDefinition {
  code: QuestionFormatCode;
  name: string;
  description: string;
  defaultPoints: number;
  recommendedSubjects?: string[];
  recommendedGrades?: GradeNumber[];
}

export interface LevelAssessmentRuleSet {
  levelId: EducationLevelId;
  levelName: string;
  shortName: string;
  grades: GradeNumber[];
  isExpansionReadyOnly?: boolean;
  legalBasis: string;
  periodicAssessmentNote: string;
  scoringScale: number;
  allowHalfPointAtPrimary?: boolean;
  cognitiveLevels: CognitiveLevelDefinition[];
  allowedFormats: QuestionFormatDefinition[];
  recommendedDurationByGrade: Record<number, number[]>;
  subjects: string[];
}

export interface CurriculumLessonItem {
  id: string;
  week: string; // Tuần học (VD: "Tuần 1")
  lessonName: string; // Tên bài học (VD: "Bài 1: Điều kì diệu (3 tiết)")
  subLessonName?: string; // Phân môn / Hoạt động chi tiết (VD: "Đọc: Điều kì diệu")
  periodAllocation: string; // Tiết học / thời lượng (VD: "1 tiết", "2 tiết", "Tiết 1: Luyện tập (Tr 6)")
  periodsCount?: number; // Số tiết quy đổi
  adjustedContent: string; // Nội dung cần đạt (Nội dung điều chỉnh, bổ sung: Tích hợp NLS, AI, QCN, BVMT, QPAN, STEM, KNS...)
  integrationTags?: string[]; // Nhãn tích hợp: ['NLS', 'AI', 'QCN', 'BVMT', 'QPAN', 'STEM', 'KNS', 'ĐĐLS', 'ATGT', 'TTHCM', 'GDĐP']
  note?: string; // Ghi chú
}

export interface CurriculumTopic {
  id: string;
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  semester?: 'HK1' | 'HK2' | 'CA_NAM';
  weekRange?: string; // Phạm vi tuần học (VD: "Tuần 1 – 4")
  totalPeriods?: number; // Tổng số tiết của mạch chủ đề
  durationText?: string; // Tiết học / Thời lượng hiển thị (VD: "28 tiết (Tuần 1 – 4)")
  adjustedContentSummary?: string; // Tóm tắt Nội dung cần đạt (Nội dung điều chỉnh, bổ sung)
  sourceDocument?: string; // Nguồn KHGD (VD: "KHGD Khối 4 - Tổ 4, 5 Trường TH&THCS Nguyễn Đình Anh (28/8/2026)")
  chapterCode: string;
  chapterTitle: string; // Mạch chủ đề / nội dung
  topicTitle: string; // Tên bài học / cụm bài học
  lessons?: CurriculumLessonItem[]; // Danh sách chi tiết từng bài học, tiết học (thời lượng), nội dung cần đạt (điều chỉnh, bổ sung)
  learningOutcomes: {
    code: string;
    description: string;
    suggestedCognitiveLevel: CognitiveLevelCode;
    lessonName?: string;
    duration?: string;
    week?: string;
  }[];
  isSampleData: boolean;
}

export interface StoredFileAsset {
  fileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export interface QuestionAttachment {
  id: string;
  type: 'IMAGE' | 'TABLE' | 'FORMULA' | 'PASSAGE';
  title: string;
  fileId?: string;
  fileUrl?: string;
  fileName?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  latexFormula?: string;
  passageText?: string;
  passageSource?: string;
}

export interface QuestionUsageRecord {
  examId: string;
  examCode: string;
  examTitle: string;
  examPeriod: 'GIUA_KY_1' | 'CUOI_KY_1' | 'GIUA_KY_2' | 'CUOI_KY_2';
  usedDate: string;
  isOfficialExam: boolean;
}

export interface QuestionGroup {
  id: string;
  code: string;
  name: string;
  description: string;
  levelId: EducationLevelId | 'ALL';
  subject: string;
  questionIds: string[];
  createdAt: string;
}

export interface QuestionItem {
  id: string;
  code: string;
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  topicTitle: string; // Chủ đề
  lessonTitle?: string; // Bài học
  knowledgeUnit?: string; // Đơn vị kiến thức
  learningOutcomeCode: string; // Mã yêu cầu cần đạt
  learningOutcomeText: string; // Nội dung yêu cầu cần đạt
  cognitiveLevel: CognitiveLevelCode; // Mức độ đánh giá
  format: QuestionFormatCode; // Loại câu hỏi
  stem: string; // Nội dung câu hỏi (hỗ trợ LaTeX $...$ hoặc $$...$$)
  options?: string[]; // Phương án lựa chọn (MCQ 1 hoặc nhiều đáp án)
  correctOptionIndices?: number[]; // Chỉ số đáp án đúng cho MCQ nhiều lựa chọn
  subStatements?: { label: string; statement: string; isTrue: boolean; explanation?: string; cognitiveLevel?: CognitiveLevelCode | string }[]; // Đúng - Sai các ý nhỏ kèm giải thích & mức độ riêng từng ý (BIẾT, HIỂU, VẬN DỤNG)
  matchingPairs?: { id: string; leftText: string; rightText: string }[]; // Ghép nối 2 cột
  orderingItems?: string[]; // Các mục theo thứ tự đúng cho câu hỏi Sắp xếp
  blanks?: string[]; // Các từ/số điền khuyết theo thứ tự ___
  acceptedVariations?: string[]; // Các cách diễn đạt/đáp án đúng được chấp nhận (Trả lời ngắn)
  rubricCriteria?: { id: string; criterion: string; points: number; note?: string }[]; // Biểu điểm chi tiết theo tiêu chí (Tự luận)
  trueFalseScoringRule?: 'EQUAL_PER_ITEM' | 'PROGRESSIVE_CV7991' | 'CUSTOM'; // Quy tắc tính điểm Đúng - Sai theo cấp học
  sharedPassage?: string; // Ngữ liệu đọc hiểu chung
  sharedPassageAuthor?: string; // Tác giả / Nguồn ngữ liệu đã xác minh
  attachments?: QuestionAttachment[]; // Hình ảnh (lưu qua fileId), bảng biểu, công thức, ngữ liệu
  correctAnswer: string; // Đáp án hiển thị tổng quát
  gradingGuide: string; // Hướng dẫn giải hoặc hướng dẫn chấm
  points: number; // Điểm số
  questionSource?: string; // Nguồn câu hỏi (Tự biên soạn, Đề chính thức, Sách giáo khoa, Nhập từ Excel/Word...)
  sourceDocumentName?: string; // Tên tệp nguồn khi nhập đề thông minh
  sourcePageNumber?: number; // Số trang trong tài liệu gốc
  answerOrigin?: 'FROM_DOCUMENT' | 'AI_SUGGESTED' | 'TEACHER_CONFIRMED' | 'MISSING'; // Nguồn gốc đáp án
  cognitiveConfirmed?: boolean; // Đã được giáo viên xác nhận mức độ nhận thức chưa
  extractionWarnings?: string[]; // Cảnh báo trích xuất không chắc chắn
  sharedPassageGroupId?: string; // Mã liên kết chùm câu hỏi chung ngữ liệu đọc hiểu
  tags?: string[]; // Gắn nhiều thẻ phân loại
  groupId?: string; // Nhóm câu hỏi
  version?: number; // Phiên bản câu hỏi (v1, v2...)
  parentQuestionId?: string; // ID câu hỏi gốc nếu tách phiên bản mới
  versionNote?: string; // Ghi chú phiên bản
  usageHistory?: QuestionUsageRecord[]; // Lịch sử sử dụng trong các đề kiểm tra
  status: ApprovalStatus; // Nháp, Chờ duyệt, Đã duyệt, Ngừng sử dụng
  authorName: string; // Người biên soạn
  createdAt: string; // Ngày tạo
  updatedAt?: string; // Ngày chỉnh sửa
  isSampleData: boolean;
}

export type AISourceMode =
  | 'CURRICULUM_OUTCOMES' // A. Yêu cầu cần đạt đã lưu
  | 'TEACHER_PASSAGE' // B. Văn bản hoặc ngữ liệu do giáo viên nhập
  | 'UPLOADED_DOCUMENT' // C. Tài liệu giáo viên tải lên
  | 'COMBINED_VERIFIED'; // D. Kết hợp các nguồn đã được xác minh

export type AIRefineAction =
  | 'REGENERATE' // Tạo lại một câu
  | 'SIMILAR' // Tạo thêm câu tương tự
  | 'INCREASE_DIFFICULTY' // Tăng độ khó
  | 'DECREASE_DIFFICULTY' // Giảm độ khó
  | 'CHANGE_CONTEXT' // Đổi bối cảnh thực tiễn
  | 'CLARIFY_WORDING'; // Viết lại câu hỏi rõ ràng hơn

export interface AISixCriteriaQualityScore10 {
  accuracy: number; // 1. Độ chính xác (/10)
  alignment: number; // 2. Độ bám sát SGK & YCCĐ (/10)
  assessmentValue: number; // 3. Giá trị đánh giá năng lực (/10)
  differentiation: number; // 4. Tính phân hóa (/10)
  pedagogy: number; // 5. Tính sư phạm (/10)
  originality: number; // 6. Tính độc đáo & chống trùng lặp (/10)
  averageScore: number; // Điểm trung bình (/10)
  passedThreshold8: boolean; // Đạt >= 8/10 ở cả 6 tiêu chí
  internalAuditNote: string; // Ghi chú bước tự kiểm tra chất lượng nội bộ của hệ thống
}

export interface AIFiveRoundAuditSummary {
  round1SourcePassed: boolean; // Vòng 1: Kiểm tra nguồn (căn cứ tài liệu, đúng phạm vi, không mâu thuẫn SGK, không bịa trang)
  round1Detail: string;
  round2PedagogyPassed: boolean; // Vòng 2: Kiểm tra sư phạm (đúng lớp, đúng YCCĐ, đúng mức độ nhận thức)
  round2Detail: string;
  round3TechnicalPassed: boolean; // Vòng 3: Kiểm tra kỹ thuật (câu dẫn rõ, nhiễu hợp lý, độ dài cân bằng, không lộ đáp án)
  round3Detail: string;
  round4HolisticPassed: boolean; // Vòng 4: Kiểm tra tổng thể (bao phủ trọng tâm, không trùng ý, đúng số lượng & dạng câu)
  round4Detail: string;
  round5RemediationCount: number; // Vòng 5: Hoàn thiện (số lỗi/câu hỏi đã được tự động sửa hoặc thay thế)
  round5Detail: string;
  allRoundsPassed: boolean;
}

export interface AILessonKnowledgeStructure {
  foundationalKnowledge: string[]; // Kiến thức nền tảng
  coreKnowledge: string[]; // Kiến thức trọng tâm
  extendedKnowledge: string[]; // Kiến thức mở rộng trong phạm vi YCCĐ
  targetSkills: string[]; // Kỹ năng & năng lực cần hình thành
  commonMisconceptions: string[]; // Nội dung học sinh dễ nhầm lẫn (cơ sở tạo phương án nhiễu)
  practicalApplications: string[]; // Vấn đề vận dụng vào thực tiễn
  outcomeAlignmentNotes?: string[];
  // Mục III - Bước 2: Phân rã nội dung thành 8 đơn vị sư phạm
  conceptsAndTerms?: string[];
  characteristicsAndProperties?: string[];
  principlesAndRules?: string[];
  processesAndOperations?: string[];
  causeAndEffectRelations?: string[];
  illustrativeExamples?: string[];
}

export interface AIBatchCoverageReport {
  totalTargetOutcomes: number;
  coveredOutcomesCount: number;
  coveragePercentage: number;
  coveredOutcomeCodes: string[];
  uncoveredOutcomes: { code: string; description: string }[];
  distributionSummary: string;
  hasComprehensiveCoverage: boolean;
  coverageWarning?: string;
}

export interface AIQualityAnalysis {
  overallScore: number; // Thang 100
  alignmentScore: number; // Độ bám sát YCCĐ
  clarityScore: number; // Độ rõ ràng, đơn nghĩa
  ageAppropriatenessScore: number; // Phù hợp tâm lý lứa tuổi
  practicalContextScore: number; // Tính thực tiễn
  distractorOrRubricNote: string; // Đánh giá phương án nhiễu hoặc hướng dẫn chấm
  strengths: string[];
  improvementSuggestions: string[];
  sixCriteriaScores10?: AISixCriteriaQualityScore10;
}

export interface AIAutoCheckResult {
  passedAll: boolean;
  answerLeakDetected: boolean; // Phát hiện lộ đáp án trong câu dẫn
  duplicateMaxScore: number; // Điểm trùng lặp cao nhất so với Ngân hàng (0 - 1)
  duplicateMatchedCode?: string;
  duplicateMatchedStem?: string;
  mathCheckStatus: 'NOT_APPLICABLE' | 'VERIFIED' | 'NEEDS_MANUAL_CHECK';
  mathCheckDetail?: string;
  literatureSourceStatus: 'NOT_APPLICABLE' | 'VERIFIED_SOURCE' | 'UNVERIFIED_SOURCE_WARNING';
  literatureCheckDetail?: string;
  autoWarnings: string[];
  sixCriteriaScores10?: AISixCriteriaQualityScore10;
  fiveRoundAudit?: AIFiveRoundAuditSummary;
  tenCriteriaCheck?: AITenCriteriaQualityCheck; // Mục X: 10 tiêu chí tự đánh giá chất lượng sư phạm
}

export type AITextbookPageStatus =
  | 'UNPROCESSED' // Chưa xử lý
  | 'PROCESSING' // Đang xử lý
  | 'SUCCESS' // Đã đọc và trích xuất thành công
  | 'PARTIAL_UNRECOGNIZED' // Đã xử lý nhưng còn nội dung chưa nhận dạng được
  | 'FAILED'; // Xử lý thất bại

// Mục II: Tự động nhận diện 5 loại PDF
export type AIPdfClassificationType =
  | 'TEXT_LAYER_PDF' // 1. PDF chứa văn bản có thể trích xuất trực tiếp
  | 'SCANNED_IMAGE_PDF' // 2. PDF dạng ảnh quét hoàn toàn
  | 'HYBRID_MIXED_PDF' // 3. PDF hỗn hợp gồm văn bản và ảnh
  | 'VISUAL_TABLE_DIAGRAM_PDF' // 4. PDF có bảng biểu, sơ đồ, hình minh họa
  | 'COMPLEX_MULTIPAGE_LAYOUT_PDF'; // 5. PDF có nhiều trang và bố cục phức tạp

export type AIPdfPageProcessingMethod =
  | 'TEXT_EXTRACTION' // Trích xuất văn bản trực tiếp
  | 'OCR_VISION' // Sử dụng OCR hoặc Gemini Multimodal Vision
  | 'HYBRID_TEXT_AND_VISION'; // Kết hợp trích xuất văn bản và phân tích hình ảnh

// Mục VIII: 8 Trạng thái xử lý PDF thực tế
export type AIPdfProcessingStageCode =
  | 'CHECKING_PDF' // 1. Đang kiểm tra PDF
  | 'READING_PAGES' // 2. Đang đọc trang
  | 'RECOGNIZING_TEXT_OCR' // 3. Đang nhận dạng chữ
  | 'ANALYZING_KNOWLEDGE' // 4. Đang phân tích kiến thức
  | 'VERIFYING_CONTENT' // 5. Đang kiểm tra nội dung
  | 'COMPLETED_SUCCESS' // 6. Đã xử lý thành công
  | 'COMPLETED_INCOMPLETE' // 7. Xử lý chưa đầy đủ
  | 'FAILED'; // 8. Xử lý thất bại

// Mục VI: 9 Loại lỗi OCR thường gặp cần phát hiện và chống lỗi
export type AIOcrErrorCategoryCode =
  | 'DIACRITIC_CONFUSION' // 1. Nhầm chữ có dấu tiếng Việt
  | 'ZERO_O_CONFUSION' // 2. Nhầm số 0 với chữ O
  | 'ONE_L_I_CONFUSION' // 3. Nhầm số 1 với chữ l hoặc I
  | 'MATH_OPERATOR_CONFUSION' // 4. Nhầm dấu toán học
  | 'MISSING_SPECIAL_SYMBOL' // 5. Mất ký hiệu đặc biệt
  | 'MULTI_COLUMN_ORDER_ERROR' // 6. Đọc sai thứ tự các cột
  | 'MISSING_TABLE_ROW' // 7. Thiếu dòng trong bảng
  | 'PAGE_BOUNDARY_MERGE_ERROR' // 8. Ghép sai nội dung hai trang
  | 'HEADING_CAPTION_MISRECOGNITION'; // 9. Nhận dạng sai tiêu đề và chú thích

export interface AIOcrErrorDetectionItem {
  id: string;
  pageNumber: number;
  errorCategory: AIOcrErrorCategoryCode;
  errorCategoryLabel: string;
  rawOcrSnippet: string;
  resolvedTextOrStatus: string;
  resolutionStepApplied:
    | 'HIGH_RES_REREAD' // 1. Đọc lại vùng ảnh tương ứng ở độ phân giải cao hơn
    | 'SECONDARY_VISION_OCR' // 2. Sử dụng phương pháp OCR hoặc Vision bổ sung
    | 'CONTEXT_CROSS_CHECK' // 3. Đối chiếu với ngữ cảnh bài học
    | 'MARKED_UNVERIFIED'; // 5. Đánh dấu phần không thể xác minh (không tự sửa bằng suy đoán)
  isVerified: boolean; // 4. Chỉ chấp nhận nội dung khi có căn cứ xác minh
  blockedFromQuestionGeneration: boolean; // Không tạo câu hỏi từ đoạn văn có lỗi nhận dạng chưa giải quyết
}

export interface AIPdfSmartReaderMetadata {
  fileFingerprint: string; // Chữ ký tệp để lưu cache OCR, không OCR lại nếu tệp không đổi (Mục IX)
  reusedFromOcrCache: boolean;
  primaryPdfType: AIPdfClassificationType;
  primaryPdfTypeLabel: string;
  detectedPdfCharacteristics: AIPdfClassificationType[];
  selectedReadingStrategyLabel: string;
  processingStage: AIPdfProcessingStageCode;
  processingStageLabel: string;
  totalPages: number;
  readPagesCount: number; // "Đang đọc sách giáo khoa: X/Y trang."
  recognizedOcrPagesCount: number; // "Đã nhận dạng nội dung: Z trang."
  pagesNeedingRecheckCount: number; // "Có K trang cần kiểm tra lại."
  pagesNeedingRecheckNumbers: number[];
  rotatedPagesDetected: number[]; // Các trang nằm ngang hoặc bị xoay đã hiệu chỉnh
  multiColumnPagesDetected: number[]; // Các trang bố cục nhiều cột đã sắp xếp thứ tự đọc
  ocrEngineUsed:
    | 'DIRECT_TEXT_EXTRACTOR'
    | 'GEMINI_MULTIMODAL_VISION'
    | 'TESSERACT_VIE_OCR'
    | 'HYBRID_TEXT_AND_VISION';
  ocrErrorDetections: AIOcrErrorDetectionItem[];
  tenStepPipelineLog: {
    stepNumber: number;
    stepTitle: string;
    status: 'DONE' | 'WARNING' | 'ERROR';
    detail: string;
  }[];
  detectedSourceFormat?: string; // PDF_TEXT | PDF_SCANNED | PDF_HYBRID | DOCX | DOC | IMAGE_PHOTO | IMAGE_HANDWRITING | TXT
  hasHandwritingDetected?: boolean;
  handwritingModeSummary?: string;
  reconstructedStructureSummary?: {
    documentTitle: string; // 1. Tên tài liệu
    topicTitle?: string; // 2. Chủ đề
    chapterTitle?: string; // 3. Chương
    lessonTitle?: string; // 4. Bài học
    headingsCount: number; // 5. Tiêu đề
    sectionsCount: number; // 6. Mục và tiểu mục
    paragraphsCount: number; // 7. Đoạn văn
    listsCount: number; // 8. Danh sách
    tablesCount: number; // 9. Bảng biểu
    visualsCount: number; // 10. Hình ảnh và chú thích
    examplesCount: number; // 11. Ví dụ
    exercisesCount: number; // 12. Bài tập
    keyTakeawaysCount: number; // 13. Ghi nhớ
    learningOutcomesCount: number; // 14. Yêu cầu cần đạt
  };
}

export interface AIPdfOcrMandatoryTestCaseResult {
  caseNumber: number; // 1..13 (Mục XI / XII)
  testCode: string;
  scenarioTitle: string;
  inputSummary: string;
  expectedRequirement: string;
  actualVerificationResult: string;
  evidenceDetails: string[];
  passed: boolean;
}

export interface AIPdfOcrMandatory13TestSuiteReport {
  executedAt: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  allPassed: boolean;
  cases: AIPdfOcrMandatoryTestCaseResult[];
}

export interface AITextbookPageVisualOrTableItem {
  id: string;
  type: 'IMAGE' | 'DIAGRAM' | 'TABLE' | 'CHART';
  titleOrCaption: string;
  extractedContentSummary: string;
  linkedSectionTitle?: string;
  isClearAndVerified: boolean; // Nếu false: đánh dấu chưa xác minh và không dùng làm căn cứ duy nhất (Mục 6)
}

export interface AITextbookPageProcessingRecord {
  pageNumber: number;
  status: AITextbookPageStatus;
  statusLabel: string;
  charCount: number;
  rawText: string;
  detectedHeadings: string[];
  visualsAndTables: AITextbookPageVisualOrTableItem[];
  unrecognizedRegionsNote?: string;
  errorDetail?: string;
  processingMethod?: AIPdfPageProcessingMethod;
  detectedRotationDegrees?: number;
  isMultiColumnLayout?: boolean;
  isHandwrittenPage?: boolean;
  ocrConfidencePercent?: number;
  hasUnresolvedOcrError?: boolean;
  ocrErrorItems?: AIOcrErrorDetectionItem[];
}

export interface AITextbookLesson13Elements {
  lessonId: string;
  topicTitle: string;
  lessonTitle: string; // 1. Tên bài học
  pageRange: string; // VD: "Trang 1 - Trang 4"
  learningObjectives: string[]; // 2. Mục tiêu hoặc yêu cầu cần đạt
  openingLeadIn: string[]; // 3. Nội dung mở đầu và tình huống dẫn nhập
  sectionsAndSubsections: string[]; // 4. Từng mục và tiểu mục kiến thức
  conceptsAndTerms: string[]; // 5. Các khái niệm, định nghĩa và thuật ngữ
  rulesAndPrinciples: string[]; // 6. Các quy tắc, nguyên lý, tính chất
  processesAndSteps: string[]; // 7. Những quy trình, thao tác và các bước thực hiện
  illustrativeExamples: string[]; // 8. Ví dụ minh họa
  visualsTablesAndCaptions: string[]; // 9. Hình ảnh, sơ đồ, bảng biểu và chú thích
  discoveryAndPracticeActivities: string[]; // 10. Hoạt động khám phá, thực hành
  practiceExercises: string[]; // 11. Câu hỏi và bài tập luyện tập
  applicationTasks: string[]; // 12. Nội dung vận dụng
  keyTakeaways: string[]; // 13. Kiến thức trọng tâm cần ghi nhớ
}

export type AIKnowledgeAspectCategory =
  | 'CONCEPT_DEFINITION' // Nhận diện khái niệm, định nghĩa
  | 'ROLE_SIGNIFICANCE' // Vai trò, ý nghĩa, bản chất
  | 'PRINCIPLE_COMPARISON' // Quy tắc, tính chất, phân biệt, so sánh
  | 'EXAMPLE_VISUAL_TABLE' // Ví dụ minh họa, hình ảnh, sơ đồ, bảng biểu trong sách
  | 'PROCESS_APPLICATION'; // Quy trình thao tác, cách khai thác và vận dụng

export interface AITextbookKnowledgeUnitNode {
  unitId: string; // 1. Mã định danh (VD: DKT-SGK-B1-M1-01)
  bookTitleAndSeries: string; // 2. Tên sách và bộ sách
  subjectAndGrade: string; // 3. Môn học, lớp học
  topicTitle: string; // 4a. Tên chủ đề
  lessonTitle: string; // 4b. Tên bài học
  sectionTitle: string; // 5. Mục hoặc tiểu mục
  aspectCategory: AIKnowledgeAspectCategory;
  extractedKnowledgeContent: string; // 6. Nội dung kiến thức được trích xuất
  explanationContent: string; // 7. Nội dung giải thích bản chất
  illustrativeExamples: string[]; // 8. Ví dụ minh họa / Bảng biểu / Hình ảnh gắn kèm
  sourcePageOrRegion: string; // 9. Vị trí trang hoặc vùng nội dung nguồn (chỉ ghi trang thực tế)
  relatedOutcomeCodes: string[]; // 10. Yêu cầu cần đạt liên quan
  relatedUnitIds: string[]; // 11. Mối liên hệ với các đơn vị kiến thức khác
  rawSourceVerbatim: string; // Nội dung gốc nguyên văn để đối chiếu đáp án (Mục 3 & 9)
  hasUnverifiedVisualOnly?: boolean; // Nếu chỉ dựa trên ảnh mờ chưa xác minh thì không dùng làm căn cứ duy nhất
  sourceDocumentName?: string; // Tên tài liệu nguồn PDF
  pdfPageNumber?: number; // Trang PDF tương ứng (Mục VII)
  hasUnresolvedOcrError?: boolean; // Chặn tạo câu hỏi từ đoạn văn còn lỗi nhận dạng OCR chưa giải quyết (Mục VI)
}

export interface AITextbookPageBatchStatus {
  batchIndex: number;
  startPage: number;
  endPage: number;
  status: 'PENDING' | 'COMPLETED' | 'INTERRUPTED_OR_PARTIAL';
  boundaryCarryOverContext: string; // Giữ liên kết ngữ cảnh tại ranh giới giữa các nhóm trang (Mục 11)
  extractedUnitsCount: number;
}

export type AIScannedKnowledgeCategory =
  | 'DEFINITION' // 1. Định nghĩa & Khái niệm
  | 'RULE_PRINCIPLE' // 2. Quy tắc, Nguyên lý & Xu hướng
  | 'FACT_DATA'; // 3. Dữ kiện thực tế, Sự kiện, Nhân vật & Số liệu

export interface AIScannedKnowledgeItem {
  id: string;
  category: AIScannedKnowledgeCategory;
  categoryLabel: string;
  patternMatched: string; // Mẫu thuật toán nhận diện (VD: "Định nghĩa [X là Y]", "Quy tắc [Theo nguyên lí...]", "Dữ kiện [Năm / Số liệu / Nhân vật]")
  subjectTerm: string; // Thuật ngữ / Đối tượng / Thiết bị trung tâm
  predicateOrRule: string; // Nội dung định nghĩa / Quy tắc / Dữ kiện thực tế
  extractedEntities: {
    people: string[];
    years: string[];
    quantities: string[];
    devicesOrTerms: string[];
    formulas: string[];
  };
  sourceSentence: string;
  pageNumber?: number;
  sectionTitle?: string;
}

export interface AIScannedDocumentKnowledgeSummary {
  scannedAt: string;
  totalScannedSentences: number;
  definitions: AIScannedKnowledgeItem[];
  rulesAndPrinciples: AIScannedKnowledgeItem[];
  factsAndData: AIScannedKnowledgeItem[];
  entityPools: {
    people: string[];
    years: string[];
    quantities: string[];
    termsAndDevices: string[];
  };
}

export interface AITextbookKnowledgeRepository {
  repositoryId: string;
  builtAt: string;
  bookTitle: string;
  bookSeries: string;
  subject: string;
  grade: GradeNumber;
  totalPages: number;
  processedSuccessPagesCount: number;
  partialUnrecognizedPages: number[];
  failedPages: number[];
  isFullTextbookReadCompleted: boolean; // Chỉ true khi MỌI trang đều SUCCESS và không còn nội dung quan trọng chưa đọc được (Mục 2.3)
  completionStatusBanner: string;
  affectedScopeWarning?: string;
  pageRecords: AITextbookPageProcessingRecord[];
  pageBatches: AITextbookPageBatchStatus[];
  lessons13Analysis: AITextbookLesson13Elements[];
  knowledgeUnits: AITextbookKnowledgeUnitNode[];
  unsupportedOutcomePartsWarning?: string[]; // Mục 7: Thông báo phần YCCĐ rộng hơn chưa được tài liệu hỗ trợ
  scannedKnowledgeSummary?: AIScannedDocumentKnowledgeSummary; // Kết quả quét thuật toán Định nghĩa, Quy tắc & Dữ kiện thực tế
}

export interface AISourceVerificationRecord {
  questionCode: string; // 1. Mã câu hỏi
  knowledgeUnitId: string; // 2. Mã đơn vị kiến thức
  lessonTitle: string; // 3. Tên bài học
  sectionTitle: string; // 4. Mục kiến thức
  sourceLocation: string; // 5. Vị trí nguồn (Trang / Mục thực tế)
  groundingEvidenceVerbatim: string; // 6. Nội dung gốc làm căn cứ
  verifiedAnswer: string; // 7. Đáp án
  answerJustification: string; // 8. Giải thích đáp án từ nguồn
  sourceDocumentName?: string; // Tên tài liệu nguồn PDF (Mục VII)
  pdfPageNumber?: number; // Trang PDF tương ứng (Mục VII)
  sixPointSourceCheck: {
    matchesTextbookContent: boolean; // 1. Câu hỏi có đúng nội dung sách không?
    isAnswerSupportedBySource: boolean; // 2. Đáp án có được kiến thức nguồn hỗ trợ không?
    noUnauthorizedFabrication: boolean; // 3. Không có thông tin bị AI tự bổ sung ngoài sách?
    distractorsProvenFalse: boolean; // 4. Các phương án sai có thực sự sai không?
    singleUnambiguousCorrectAnswer: boolean; // 5. Không tồn tại nhiều đáp án đúng?
    ageAndCognitiveAppropriate: boolean; // 6. Câu hỏi có phù hợp độ tuổi và mức độ nhận thức không?
  };
  isVerifiedForDisplay: boolean; // Chỉ true khi đạt đủ 6 câu hỏi kiểm chứng nguồn
  rejectionOrRemedyNote?: string;
}

export interface AITextbookMandatoryTestCaseResult {
  caseNumber: number; // 1..12 (Mục 13)
  testCode: string;
  scenarioTitle: string;
  inputSummary: string;
  expectedRequirement: string;
  actualVerificationResult: string;
  evidenceDetails: string[];
  passed: boolean;
}

export interface AITextbookMandatoryTestSuiteReport {
  executedAt: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  allPassed: boolean;
  cases: AITextbookMandatoryTestCaseResult[];
}

// ============================================================================
// MỤC IX, X, XI & XIV: NÂNG CẤP CHẤT LƯỢNG SƯ PHẠM (9 CÁCH HỎI, 7 GIAI ĐOẠN, 10 TIÊU CHÍ)
// ============================================================================

export type AIPedagogicalQuestionApproach =
  | 'CONCEPT_IDENTIFICATION' // 1. Nhận diện khái niệm qua đặc điểm/ví dụ quen thuộc
  | 'PHENOMENON_EXPLANATION' // 2. Giải thích hiện tượng hoặc nguyên nhân ("Vì sao...")
  | 'COMPARISON_DISTINCTION' // 3. So sánh, phân biệt hai đối tượng/khái niệm dễ nhầm
  | 'SITUATION_ANALYSIS' // 4. Phân tích tình huống học tập / thực tiễn
  | 'ERROR_DETECTION' // 5. Phát hiện lỗi sai hoặc nhận định chưa chính xác
  | 'SOLUTION_SELECTION' // 6. Lựa chọn giải pháp phù hợp cho vấn đề cụ thể
  | 'SEQUENCE_ORDERING' // 7. Sắp xếp hoặc xác định trình tự các bước hợp lý
  | 'EVIDENCE_PREDICTION' // 8. Dự đoán kết quả có căn cứ khoa học
  | 'PRACTICAL_APPLICATION'; // 9. Vận dụng kiến thức vào hoạt động thực tế của học sinh

export interface AISevenStageGenerationRecord {
  stage1KnowledgeEssence: string; // Giai đoạn 1: Hiểu bản chất kiến thức, mục đích thực tiễn & nhầm lẫn thường gặp
  stage2AssessmentGoal: string; // Giai đoạn 2: Xác định mục tiêu năng lực & mức độ nhận thức cần đo
  stage3QuestionApproach: AIPedagogicalQuestionApproach; // Giai đoạn 3: Lựa chọn cách hỏi
  stage3ApproachLabel: string;
  stage4DraftingNote: string; // Giai đoạn 4: Diễn đạt câu dẫn tự nhiên, gần gũi với lứa tuổi học sinh
  stage5DistractorStrategy: string; // Giai đoạn 5: Xây dựng đáp án và phương án nhiễu từ lỗi tư duy thực tế
  stage6TeacherCritique: string; // Giai đoạn 6: Đóng vai giáo viên giỏi và học sinh làm thử để phản biện độc lập
  stage7OptimizationResult: string; // Giai đoạn 7: Tối ưu câu chữ, cân bằng độ dài các phương án và chốt câu hỏi
}

export interface AIFiveCoreCriteriaCheck {
  dungAccuracy: boolean; // 1. ĐÚNG: Chính xác về kiến thức và đáp án
  satAlignment: boolean; // 2. SÁT: Bám sát nội dung và yêu cầu cần đạt
  rongCoverage: boolean; // 3. RỘNG: Bao quát hợp lý các kiến thức trọng tâm của phạm vi được chọn
  hayPedagogy: boolean; // 4. HAY: Tự nhiên, có giá trị đánh giá và phân hóa
  gonConciseness: boolean; // 5. GỌN: Ngắn gọn, rõ ràng, không có từ ngữ thừa
  sevenPointPreOutputCheck: {
    matchesReadKnowledge: boolean; // 1. Câu hỏi có đúng kiến thức đã đọc không?
    alignedWithTopicAndOutcome: boolean; // 2. Có bám sát chủ đề và yêu cầu cần đạt không?
    coversCoreContentReasonably: boolean; // 3. Có bao quát hợp lý các nội dung trọng tâm không?
    conciseAndNaturalPhrasing: boolean; // 4. Có thể diễn đạt ngắn gọn, tự nhiên hơn không? (Đã tối ưu ngắn gọn)
    nonDuplicateAcrossBatchAndBank: boolean; // 5. Có trùng lặp với câu hỏi khác không?
    accurateCognitiveLevelByThinkingTask: boolean; // 6. Mức độ nhận thức có chính xác theo thao tác tư duy không?
    groundedAndUnambiguousAnswer: boolean; // 7. Đáp án có đúng, rõ ràng và có căn cứ không?
  };
  passedAllFiveCriteria: boolean;
  concisenessSummary: string;
}

export interface AITenCriteriaQualityCheck {
  accurateKnowledge: boolean; // 1. Đúng kiến thức
  coreFocus: boolean; // 2. Đúng trọng tâm bài học và YCCĐ
  naturalPhrasing: boolean; // 3. Tự nhiên (không giống câu chép máy móc từ sách)
  clearUnambiguous: boolean; // 4. Rõ ràng (học sinh đọc hiểu ngay yêu cầu)
  authenticAssessmentValue: boolean; // 5. Có giá trị đánh giá sự hiểu biết thực chất
  cognitiveDifferentiation: boolean; // 6. Có tính phân hóa mức độ nhận thức
  nonRepetitive: boolean; // 7. Không trùng lặp ý hoặc cấu trúc câu hỏi
  studentAppropriate: boolean; // 8. Phù hợp độ tuổi và tâm lý học sinh
  meaningfulContext: boolean; // 9. Tình huống hợp lý, tự nhiên, không gượng gạo
  reliableAnswer: boolean; // 10. Đáp án chính xác, phương án nhiễu hợp lý, giải thích thuyết phục
  passedAll10: boolean;
  remediatedAutomatically: boolean;
  critiqueSummary: string;
  fiveCoreCriteria?: AIFiveCoreCriteriaCheck; // Mục 5 & 7: 5 tiêu chí ĐÚNG – SÁT – RỘNG – HAY – GỌN & 7 bước tự kiểm tra trước khi xuất
}

export interface AIPedagogicalQualityBenchmarkCase {
  caseNumber: number;
  subjectAndGrade: string;
  lessonTitle: string;
  formatLabel: string;
  cognitiveLevelLabel: string;
  beforeMechanicalExample: {
    stem: string;
    optionsOrTask: string[];
    weaknessAnalysis: string;
  };
  afterUpgradedQuestion: {
    stem: string;
    optionsOrTask: string[];
    correctAnswer: string;
    explanation: string;
    approachLabel: string;
    sevenStageSummary: string;
  };
  eightDimensionScores: {
    naturalnessBefore: number;
    naturalnessAfter: number;
    clarityBefore: number;
    clarityAfter: number;
    studentClosenessBefore: number;
    studentClosenessAfter: number;
    knowledgeAccuracy: number;
    competencyAssessmentDepth: number;
    distractorQualityBefore: number;
    distractorQualityAfter: number;
    cognitiveDifferentiation: number;
    formatDiversity: number;
  };
  passed: boolean;
}

export interface AIPedagogicalQualityBenchmarkReport {
  executedAt: string;
  totalCases: number;
  passedCases: number;
  allPassed: boolean;
  averageScoreBefore10: number;
  averageScoreAfter10: number;
  cases: AIPedagogicalQualityBenchmarkCase[];
}

export interface AIGeneratedQuestionDraft {
  draftId: string;
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  topicTitle: string;
  lessonTitle?: string;
  knowledgeUnit?: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  format: QuestionFormatCode;
  cognitiveLevel: CognitiveLevelCode;
  stem: string;
  options?: string[];
  correctOptionIndices?: number[];
  subStatements?: { label: string; statement: string; isTrue: boolean; explanation: string; cognitiveLevel?: CognitiveLevelCode | string }[];
  trueFalseScoringRule?: 'EQUAL_PER_ITEM' | 'PROGRESSIVE_CV7991' | 'CUSTOM';
  acceptedVariations?: string[];
  rubricCriteria?: { id: string; criterion: string; points: number; note?: string }[];
  matchingPairs?: { id: string; leftText: string; rightText: string }[];
  orderingItems?: string[];
  blanks?: string[];
  sharedPassage?: string;
  sharedPassageCitation?: string;
  correctAnswer: string;
  explanation: string; // Giải thích chi tiết & hướng dẫn chấm
  suggestedPoints: number;
  usedSourceSummary: string; // Nguồn sử dụng để sinh câu hỏi
  aiWarnings: string[]; // Cảnh báo từ mô hình AI
  autoCheck: AIAutoCheckResult; // Kết quả kiểm tra tự động
  qualityAnalysis?: AIQualityAnalysis; // Phân tích chất lượng câu hỏi
  sourceVerification?: AISourceVerificationRecord; // Mục 9: Kiểm chứng đáp án trực tiếp từ Sách giáo khoa
  pedagogicalSevenStage?: AISevenStageGenerationRecord; // Mục XI: Quy trình 7 giai đoạn thiết kế câu hỏi sư phạm
  tenCriteriaCheck?: AITenCriteriaQualityCheck; // Mục X: Kết quả tự kiểm định 10 tiêu chí
  scannedItemBadge?: {
    category: AIScannedKnowledgeCategory;
    categoryLabel: string;
    patternMatched: string;
    extractedFocus: string;
  }; // Nhãn thuật toán quét tài liệu (Định nghĩa / Quy tắc / Dữ kiện thực tế)
  teacherVerified: boolean; // Trạng thái giáo viên đã xác minh
  savedQuestionId?: string; // ID câu hỏi sau khi đã lưu vào ngân hàng
  savedStatus?: ApprovalStatus;
}

export type AIDocumentCategory =
  | 'CURRICULUM_SPEC' // Ưu tiên 1: Yêu cầu cần đạt & Kế hoạch giáo dục / PPCT
  | 'TEXTBOOK' // Ưu tiên 2: Sách giáo khoa (SGK)
  | 'TEACHER_BOOK' // Ưu tiên 3: Sách giáo viên (SGV)
  | 'WORKBOOK' // Ưu tiên 4a: Sách bài tập (SBT)
  | 'REFERENCE_DOC'; // Ưu tiên 4b: Tài liệu chuyên môn, tài liệu tham khảo

export interface AIUploadedSourceDocument {
  id: string;
  fileName: string;
  category: AIDocumentCategory;
  mimeType: string;
  sizeBytes: number;
  pageCount?: number;
  extractedText: string;
  inlineData?: { mimeType: string; data: string };
  uploadedAt: string;
  pages?: AITextbookPageProcessingRecord[]; // Mục 2.1 & 2.3: Lưu đầy đủ từng trang (không cắt bỏ âm thầm)
  pdfReaderMeta?: AIPdfSmartReaderMetadata; // Mục II, III, IV, VI, VIII, IX: Thông tin bộ đọc PDF dạng ảnh & chống lỗi OCR
}

export interface AIDocumentAnalysisResult {
  analyzedAt: string;
  engineMode: 'GEMINI_API' | 'FALLBACK_VERIFIED_RULE';
  documentNames: string[];
  detectedTextbookSeries?: string;
  detectedLessonTitle: string;
  detectedKnowledgeUnit: string;
  extractedOutcomes: { code: string; description: string }[];
  knowledgeStructure: AILessonKnowledgeStructure;
  keyPassagesAndExamples: string[];
  pedagogicalNotesFromTeacherBook: string[];
  sourceConflictWarnings?: string[];
  ocrAndCompletenessWarnings?: string[];
  textbookRepository?: AITextbookKnowledgeRepository; // Mục 2, 3, 6, 7, 11: Kho kiến thức SGK phân cấp
  scannedKnowledgeSummary?: AIScannedDocumentKnowledgeSummary; // Kết quả quét thuật toán Định nghĩa, Quy tắc & Dữ kiện thực tế
}

export interface AIGenerationBatch {
  id: string;
  batchCode: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  topicTitle: string;
  lessonTitle?: string;
  knowledgeUnit?: string;
  selectedOutcomeCodes: string[];
  sourceMode: AISourceMode;
  sourcePassage?: string;
  uploadedFileName?: string;
  uploadedDocuments?: AIUploadedSourceDocument[];
  documentAnalysis?: AIDocumentAnalysisResult;
  textbookRepository?: AITextbookKnowledgeRepository;
  scannedKnowledgeSummary?: AIScannedDocumentKnowledgeSummary;
  language: string;
  additionalInstructions?: string;
  engineMode: 'GEMINI_API' | 'FALLBACK_VERIFIED_RULE';
  drafts: AIGeneratedQuestionDraft[];
  knowledgeAnalysis?: AILessonKnowledgeStructure;
  coverageReport?: AIBatchCoverageReport;
  fiveRoundAudit?: AIFiveRoundAuditSummary;
  cognitiveDistribution?: Record<string, number>;
}

export type MatrixTemplateCode =
  | 'TEMPLATE_A_CV7991' // Mẫu A: Phụ lục Công văn 7991/BGDĐT-GDTrH
  | 'TEMPLATE_B_CV4632_HUE' // Mẫu B: Phụ lục Công văn 4632/SGDĐT-GDPT Sở GDĐT Huế
  | 'TEMPLATE_C_PRIMARY_APPROVED' // Mẫu C: Ma trận kiểm tra Tiểu học do quản trị viên chuyên môn cấu hình & phê duyệt
  | 'TEMPLATE_D_CUSTOM'; // Mẫu D: Ma trận tùy chỉnh

export type MatrixFormatGroupCode =
  | 'MCQ' // Trắc nghiệm nhiều lựa chọn
  | 'TRUE_FALSE' // Đúng – Sai
  | 'SHORT_ANSWER' // Trả lời ngắn
  | 'ESSAY'; // Tự luận

export type MatrixLevelColumnCode = 'BIET' | 'HIEU' | 'VAN_DUNG';

export interface MatrixCellValue {
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  questionCount: number;
  points: number;
}

export interface OutcomeEditHistoryRecord {
  id: string;
  editedAt: string;
  editorName: string;
  previousText: string;
  newText: string;
  sourceNote: string;
}

export interface MatrixRowLessonItem {
  id: string;
  lessonId?: string; // ID gốc của bài học (khi 1 bài học có nhiều dòng Yêu cầu cần đạt)
  lessonName: string;
  periodsCount: number;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  outcomeIndex?: number; // Thứ tự Yêu cầu cần đạt trong bài học (1, 2, ...)
  totalOutcomesInLesson?: number; // Tổng số Yêu cầu cần đạt của bài học này
  selected: boolean;
  cells?: MatrixCellValue[]; // Các ô phân bổ số câu & điểm riêng của từng Yêu cầu cần đạt / bài học (4 phần x 3 mức độ)
}

export interface MatrixSpecificationRow {
  id: string;
  chapterCode: string; // Chương / Chủ đề (VD: Chương I)
  topicTitle: string; // Tên Chương / Chủ đề
  knowledgeUnit: string; // Nội dung / Đơn vị kiến thức
  learningOutcomeCode: string; // Mã YCCĐ
  learningOutcomeText: string; // Nội dung Yêu cầu cần đạt hiện tại
  originalOutcomeText?: string; // Nội dung YCCĐ gốc ban đầu từ CSDL Chương trình
  outcomeSource: string; // Nguồn YCCĐ (CSDL Chương trình / Giáo viên hiệu chỉnh)
  outcomeEditHistory: OutcomeEditHistoryRecord[]; // Lịch sử chỉnh sửa YCCĐ
  competencyAssessed: string; // Năng lực cần đánh giá
  cells: MatrixCellValue[]; // Các ô phân bổ số câu & điểm theo 4 nhóm dạng x 3 mức độ
  note?: string; // Ghi chú
  lessonItems?: MatrixRowLessonItem[]; // Danh sách các bài học trong Chủ đề / Chương (hỗ trợ đánh dấu chọn / bỏ chọn từng bài)
}

export interface FormatScoringRuleConfig {
  formatGroup: MatrixFormatGroupCode;
  defaultPointsPerQuestion: number;
  targetQuestionCount?: number; // Số câu hỏi mục tiêu cho từng dạng
  gradingRuleDescription: string; // Quy tắc chấm riêng cho từng dạng
}

export interface SavedDepartmentMatrixPreset {
  id: string;
  name: string;
  departmentName: string;
  createdAt: string;
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  templateCode: MatrixTemplateCode;
  activeFormatGroups: MatrixFormatGroupCode[];
  targetLevelPercentages: Record<MatrixLevelColumnCode, number>;
  scoringRules: FormatScoringRuleConfig[];
}

export interface MatrixRowItem {
  id: string;
  topicTitle: string;
  learningOutcomeSummary: string;
  countsByCognitiveLevel: Partial<Record<CognitiveLevelCode, number>>;
  pointsByCognitiveLevel: Partial<Record<CognitiveLevelCode, number>>;
  formatSummary: string;
}

export interface ExamMatrix {
  id: string;
  code: string;
  title: string;
  schoolName?: string;
  academicYear?: string;
  semester?: 'HOC_KY_1' | 'HOC_KY_2' | 'CA_NAM';
  examTypeLabel?: string;
  knowledgeScope?: string;
  appliedRuleBasis?: string;
  templateCode?: MatrixTemplateCode;
  templateConfirmed?: boolean;
  activeFormatGroups?: MatrixFormatGroupCode[];
  scoringRules?: FormatScoringRuleConfig[];
  targetLevelPercentages?: Record<MatrixLevelColumnCode, number>;
  specRows?: MatrixSpecificationRow[];
  version?: number;
  parentMatrixId?: string;
  isLocked?: boolean;
  versionHistory?: {
    version: number;
    updatedAt: string;
    editorName: string;
    editorRole?: SchoolRoleCode;
    note: string;
    status: ApprovalStatus;
  }[];
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  headOfDepartmentName?: string;
  finalApproverName?: string;
  finalApproverRole?: SchoolRoleCode;
  appraisalSheets?: AppraisalSubmissionSheet[];
  itemFeedbacks?: ItemFeedbackRecord[];
  versionDiffs?: VersionDiffChangeEntry[];
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  examPeriod: 'GIUA_KY_1' | 'CUOI_KY_1' | 'GIUA_KY_2' | 'CUOI_KY_2';
  durationMinutes: number;
  totalPoints: number;
  targetTotalPoints?: number;
  totalQuestions: number;
  rows: MatrixRowItem[];
  status: ApprovalStatus;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  isSampleData: boolean;
}

export type ExamGenerationMode =
  | 'AUTO_RANDOM' // A. Rút ngẫu nhiên từ ngân hàng
  | 'MANUAL_SELECT' // B. Giáo viên chọn câu thủ công
  | 'AI_SUPPLEMENT_DRAFT' // C. AI đề xuất câu bổ sung ở trạng thái bản nháp
  | 'HYBRID'; // D. Kết hợp chọn thủ công và rút tự động

export interface ExamCellShortageReport {
  cellKey: string; // `${rowId}__${formatGroup}__${levelColumn}`
  rowId: string;
  chapterCode: string;
  topicTitle: string;
  knowledgeUnit: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  requiredCount: number;
  requiredPointsPerQuestion: number;
  availableApprovedCount: number;
  selectedCount: number;
  shortageCount: number;
}

export interface ExamVariantQuestionItem {
  questionId: string;
  originalCode: string;
  displayNumber: number; // Câu số 1..N trong mã đề này
  sectionOrderInPart: number; // Câu số 1..M trong Phần I/II/III/IV
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  rowId: string; // Dòng chủ đề của ma trận
  learningOutcomeCode: string;
  points: number;
  stem: string;
  sharedPassage?: string;
  sharedPassageAuthor?: string;
  sharedPassageGroupKey?: string;
  shuffledOptions?: string[]; // Các phương án A, B, C, D sau khi đảo (đã đánh lại nhãn A., B., C., D.)
  optionPermutation?: number[]; // Mảng ánh xạ vị trí gốc: ví dụ [2, 0, 3, 1] nghĩa là phương án A mới lấy từ phương án gốc số 2
  optionShuffleLockedReason?: string; // Lý do khóa không đảo phương án (VD: có phương án "Cả A và B đều đúng")
  shuffledCorrectAnswer: string; // Đáp án đúng tương ứng chính xác với mã đề này
  gradingGuide: string;
  rubricCriteria?: { id: string; criterion: string; points: number; note?: string }[];
  acceptedVariations?: string[];
  subStatements?: { label: string; statement: string; isTrue: boolean; explanation?: string }[];
  isDraftSupplement?: boolean; // Câu bổ sung từ chế độ C (trạng thái Bản nháp)
  teacherRevisionNote?: string;
}

export interface ExamVariantPaper {
  variantCode: string; // VD: "101", "102", "103", "104"
  variantSeed: string; // Seed riêng của mã đề được dẫn xuất tất định từ baseSeed
  items: ExamVariantQuestionItem[];
  totalQuestions: number;
  totalPoints: number;
  mcqQuickAnswerTable: {
    questionNumber: number;
    sectionNumber: number;
    formatGroup: MatrixFormatGroupCode;
    answer: string;
    points: number;
    originalQuestionCode: string;
  }[];
}

export interface ExamQualityCriterionResult {
  code: string;
  title: string;
  passed: boolean;
  severity: 'OK' | 'WARNING' | 'ERROR';
  summary: string;
  details: string[];
}

export interface ExamQualityCheckReport {
  checkedAt: string;
  passedAll: boolean;
  hasMatrixDeviation: boolean;
  estimatedReadingAndSolvingMinutes: number;
  criteria: {
    scoreAndCount: ExamQualityCriterionResult; // 1. Số câu và tổng điểm
    matrixDistribution: ExamQualityCriterionResult; // 2. Phân bố theo ma trận
    outcomeDistribution: ExamQualityCriterionResult; // 3. Phân bố theo yêu cầu cần đạt
    duplicateCheck: ExamQualityCriterionResult; // 4. Câu trùng
    missingAnswerCheck: ExamQualityCriterionResult; // 5. Đáp án thiếu
    mcqOptionCheck: ExamQualityCriterionResult; // 6. Phương án trắc nghiệm lỗi
    mediaFormulaCheck: ExamQualityCriterionResult; // 7. Hình ảnh hoặc công thức thiếu
    examLengthCheck: ExamQualityCriterionResult; // 8. Độ dài đề
    variantEquivalenceCheck: ExamQualityCriterionResult; // 9. Tương đương giữa các mã đề
  };
  blockingErrors: string[];
  warnings: string[];
}

export interface ExamPresentationConfig {
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  mcqOptionColumns: 1 | 2 | 4;
  showKnowledgeScopeBanner: boolean;
  showQuestionIdInStudentView: boolean;
  headerStyle: 'MINISTRY_STANDARD' | 'COMPACT';
}

export interface ExamStatusHistoryRecord {
  status: ApprovalStatus;
  changedAt: string;
  actorName: string;
  actorRole?: SchoolRoleCode;
  note: string;
}

// ============================================================================
// GIAI ĐOẠN 7: HỆ THỐNG VAI TRÒ, QUY TRÌNH THẨM ĐỊNH 2 CẤP, PHIẾU 12 TIÊU CHÍ & BIÊN BẢN
// ============================================================================

export type SchoolRoleCode =
  | 'TEACHER_AUTHOR' // 1. Giáo viên ra đề
  | 'HEAD_OF_DEPARTMENT' // 2. Tổ trưởng chuyên môn
  | 'PEER_REVIEWER' // 3. Giáo viên phản biện
  | 'VICE_PRINCIPAL' // 4. Phó hiệu trưởng chuyên môn
  | 'PRINCIPAL'; // 5. Hiệu trưởng

export interface SchoolUserProfile {
  id: string;
  code: string;
  fullName: string;
  role: SchoolRoleCode;
  roleLabel: string;
  departmentName: string;
  subjects: string[];
}

export interface SchoolPermissionConfig {
  // Cấu hình theo quy chế nhà trường (Mục II: Không mặc định mọi Phó hiệu trưởng đều có quyền phê duyệt cuối cùng)
  allowHeadOfDepartmentApproveMatrix: boolean; // Tổ trưởng chuyên môn được ủy quyền duyệt cuối Ma trận
  allowVicePrincipalFinalApproveMatrix: boolean; // Phó hiệu trưởng chuyên môn được quyền phê duyệt cuối Ma trận
  allowVicePrincipalFinalApproveExam: boolean; // Phó hiệu trưởng chuyên môn được quyền phê duyệt cuối Đề kiểm tra (mặc định false để kiểm chứng phân quyền)
  allowVicePrincipalPublishExam: boolean; // Phó hiệu trưởng được quyền phát hành đề (nếu false: chỉ Hiệu trưởng quyết định phát hành)
  requirePeerReviewBeforeDepartmentConfirm: boolean; // Bắt buộc có Phiếu thẩm định của Giáo viên phản biện trước khi Tổ chuyên môn trình duyệt
}

export type AppraisalTargetType = 'MATRIX' | 'EXAM';

export type AppraisalCriterionRating =
  | 'DAT' // Đạt
  | 'CAN_CHINH_SUA' // Cần chỉnh sửa
  | 'KHONG_DAT' // Không đạt
  | 'KHONG_AP_DUNG'; // Không áp dụng

export interface AppraisalCriterionConfigItem {
  code: string; // CRIT_01 .. CRIT_12
  order: number;
  title: string;
  description: string;
  enabledForPrimary: boolean;
  enabledForSecondary: boolean;
  applicableSubjects: 'ALL' | string[];
}

export interface AppraisalCriterionEvaluation {
  criterionCode: string;
  order: number;
  title: string;
  rating: AppraisalCriterionRating;
  comment: string;
  questionPositions: string; // Vị trí câu hỏi / dòng ma trận cần sửa (VD: "Câu 3, Câu 7b")
}

export interface AppraisalSubmissionSheet {
  id: string;
  targetType: AppraisalTargetType;
  targetRecordId: string;
  targetVersion: number;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: SchoolRoleCode;
  submittedAt: string;
  criteriaEvaluations: AppraisalCriterionEvaluation[];
  overallConclusion: 'DAT' | 'CAN_CHINH_SUA' | 'KHONG_DAT';
  generalSummaryNote: string;
}

export interface ItemFeedbackRecord {
  id: string;
  targetType: AppraisalTargetType;
  targetRecordId: string;
  versionAtFeedback: number;
  itemNumberOrCode: string; // VD: "Câu 4 (CH-TH-T4-PS04)" hoặc "Dòng 1 – Phân số"
  questionIdOrRowId?: string;
  reviewerName: string;
  reviewerRole: SchoolRoleCode;
  createdAt: string;
  feedbackContent: string; // Nội dung góp ý chuyên môn
  answerErrorNote?: string; // Ghi chú lỗi đáp án / biểu điểm
  proposedFix: string; // Đề xuất chỉnh sửa
  resolutionStatus: 'OPEN' | 'RESOLVED';
  resolvedByName?: string;
  resolvedAt?: string;
  resolutionSummary?: string;
  beforeTextSnapshot?: string;
  afterTextSnapshot?: string;
}

export interface VersionDiffChangeEntry {
  id: string;
  fromVersion: number;
  toVersion: number;
  locationLabel: string; // VD: "Câu 2 – Đáp án & Biểu điểm" hoặc "Ma trận – Ô Đúng/Sai Vận dụng"
  beforeContent: string;
  afterContent: string;
  editorName: string;
  editorRole: SchoolRoleCode;
  editedAt: string;
  changeReason: string;
}

export interface OfficialAppraisalMinutes {
  minutesCode: string;
  schoolName: string;
  departmentName: string;
  subject: string;
  grade: GradeNumber;
  levelId: EducationLevelId;
  targetType: AppraisalTargetType;
  targetCode: string;
  targetTitle: string;
  targetVersion: number;
  appraisalTime: string;
  authorName: string;
  headOfDepartmentName: string;
  peerReviewerName: string;
  approverName: string;
  approverRoleLabel: string;
  evaluationSummary: string;
  criteriaSummaryCounts: {
    dat: number;
    canChinhSua: number;
    khongDat: number;
    khongApDung: number;
  };
  adjustmentRequests: string[];
  conclusionText: string;
  confirmations: {
    partyTitle: string;
    personName: string;
    statusLabel: string;
    confirmedAt?: string;
    hasValidDigitalSignature: boolean; // Chỉ true khi có cơ chế ký số hợp lệ thực tế; tuyệt đối không tạo chữ ký giả
  }[];
}

export interface ExamPaper {
  id: string;
  code: string;
  title: string;
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  examPeriod: 'GIUA_KY_1' | 'CUOI_KY_1' | 'GIUA_KY_2' | 'CUOI_KY_2';
  matrixId: string;
  matrixCode?: string;
  matrixTitle?: string;
  durationMinutes: number;
  questionIds: string[];
  totalPoints: number;
  generationMode?: ExamGenerationMode;
  seed?: string;
  variantCount?: number;
  shuffleQuestions?: boolean;
  shuffleMcqOptions?: boolean;
  variants?: ExamVariantPaper[];
  cellQuestionMap?: Record<string, string[]>; // key: `${rowId}__${formatGroup}__${levelColumn}` -> danh sách questionId
  shortageReports?: ExamCellShortageReport[];
  qualityReport?: ExamQualityCheckReport;
  presentationConfig?: ExamPresentationConfig;
  revisionNotes?: string;
  statusHistory?: ExamStatusHistoryRecord[];
  version?: number;
  parentExamId?: string;
  isLocked?: boolean;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  headOfDepartmentName?: string;
  departmentConfirmedAt?: string;
  finalApproverName?: string;
  finalApproverRole?: SchoolRoleCode;
  publishedAt?: string;
  publishedByName?: string;
  appraisalSheets?: AppraisalSubmissionSheet[];
  itemFeedbacks?: ItemFeedbackRecord[];
  versionDiffs?: VersionDiffChangeEntry[];
  status: ApprovalStatus;
  authorName: string;
  reviewerName?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
  isSampleData: boolean;
}

export interface StorageConfig {
  provider: 'LOCAL_STORAGE' | 'FIREBASE_READY' | 'FIREBASE_FIRESTORE' | 'GITHUB_REPOSITORY';
  schoolName: string;
  departmentName: string;
  academicYear: string;
  showSampleDataBanner: boolean;
  permissionConfig?: SchoolPermissionConfig;
  criteriaConfig?: AppraisalCriterionConfigItem[];
  exportTemplates?: ExportPresentationTemplate[];
  downloadAuditLogs?: ExportDownloadAuditLog[];
}

// ============================================================================
// GIAI ĐOẠN 8: HỆ THỐNG XUẤT HỒ SƠ KIỂM TRA ĐỊNH KỲ CHUYÊN NGHIỆP
// ============================================================================

export type ExportFileFormat = 'DOCX' | 'PDF' | 'XLSX' | 'PRINT' | 'ZIP';

export type DossierDocumentTypeCode =
  | '01_MATRIX' // 1. Ma trận đề kiểm tra
  | '02_SPECIFICATION' // 2. Bản đặc tả đề kiểm tra
  | '03_STUDENT_EXAM' // 3. Đề kiểm tra dành cho học sinh
  | '04_MCQ_ANSWER_KEY' // 4. Đáp án trắc nghiệm
  | '05_ESSAY_GRADING_GUIDE' // 5. Hướng dẫn chấm tự luận
  | '06_SCORING_RUBRIC_TABLE' // 6. Biểu điểm
  | '07_APPRAISAL_SHEET' // 7. Phiếu thẩm định
  | '08_APPROVAL_MINUTES' // 8. Biên bản phê duyệt
  | '09_USED_QUESTION_CATALOG' // 9. Danh mục câu hỏi đã sử dụng
  | '10_EXAM_STATISTICS_REPORT'; // 10. Báo cáo thống kê đề kiểm tra

export interface ExportPresentationTemplate {
  id: string;
  name: string;
  isDefault?: boolean;
  paperSize: 'A4';
  orientationPolicy: 'AUTO_SMART' | 'PORTRAIT_ALL' | 'LANDSCAPE_TABLES';
  fontFamily: 'Times New Roman' | 'Liberation Serif' | 'Arial';
  bodyFontSizePt: 13 | 14;
  titleFontSizePt: 14 | 15 | 16;
  marginsCm: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  lineSpacing: 1.15 | 1.25 | 1.3 | 1.5;
  autoPageNumbering: boolean;
  governingBodyName: string; // Cơ quan quản lý cấp trên (VD: UBND QUẬN BA ĐÌNH / PHÒNG GD&ĐT)
  showSectionPoints: boolean;
  showScoreBoxInStudentPaper: boolean;
  repeatTableHeaderOnNewPage: boolean;
}

export interface DossierSecurityConfig {
  enableWatermark: boolean;
  customWatermarkText: string;
  dossierSecurityCode: string; // Mã định danh hồ sơ
  enforceConfidentialAnswerRestriction: boolean; // Chỉ người có quyền mới được xuất đáp án và đề mật
  forceDraftStampForUnapproved: boolean; // Hồ sơ chưa phê duyệt bắt buộc có dấu "BẢN NHÁP"
}

export interface ExportDownloadAuditLog {
  id: string;
  downloadedAt: string;
  actorName: string;
  actorRole: SchoolRoleCode | 'STUDENT_GUEST_RESTRICTED';
  actorRoleLabel: string;
  examCode: string;
  examTitle: string;
  documentTypes: DossierDocumentTypeCode[];
  format: ExportFileFormat;
  fileName: string;
  fileSizeBytes: number;
  dossierSecurityCode: string;
  hasDraftStamp: boolean;
  isConfidentialAnswerIncluded: boolean;
  status: 'SUCCESS' | 'BLOCKED_UNAUTHORIZED';
  securityNote: string;
}

export interface GeneratedFileInspectionResult {
  fileName: string;
  format: 'DOCX' | 'PDF' | 'XLSX' | 'ZIP';
  documentTypeLabel: string;
  fileSizeBytes: number;
  canOpenFile: boolean;
  vietnameseFontOk: boolean;
  mediaAndFormulaOk: boolean;
  tableBoundsOk: boolean;
  totalPointsExactOk: boolean;
  questionSequenceOk: boolean;
  variantShuffledAnswerOk: boolean;
  noBlankPageAnomalyOk: boolean;
  noAnswerLeakInStudentFileOk: boolean;
  hasDraftStampIfUnapproved: boolean;
  extractedSummary: {
    questionCount: number;
    totalPoints: number;
    variantCodes: string[];
    tableCount: number;
    formulaCount: number;
    internalStructureVerified: string;
    sampleExtractedText: string;
  };
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

// ============================================================================
// GIAI ĐOẠN 9: HỆ THỐNG QUẢN TRỊ, TÀI KHOẢN, PHÂN QUYỀN ĐA TRƯỜNG, FIREBASE & BẢO MẬT
// ============================================================================

export type SystemRoleCode =
  | 'SYSTEM_ADMIN' // Quản trị hệ thống
  | 'PRINCIPAL' // Hiệu trưởng
  | 'VICE_PRINCIPAL' // Phó hiệu trưởng
  | 'HEAD_OF_DEPARTMENT' // Tổ trưởng chuyên môn
  | 'TEACHER' // Giáo viên
  | 'PEER_REVIEWER'; // Giáo viên phản biện

export type PermissionActionCode =
  | 'VIEW' // Xem
  | 'CREATE' // Tạo
  | 'UPDATE' // Sửa
  | 'SOFT_DELETE' // Xóa mềm
  | 'SUBMIT_REVIEW' // Gửi duyệt
  | 'PEER_REVIEW' // Phản biện
  | 'APPROVE' // Phê duyệt
  | 'EXPORT_DOSSIER' // Xuất hồ sơ
  | 'ADMINISTER'; // Quản trị

export type ConfidentialityClassificationCode =
  | 'DRAFT_QUESTION' // 1. Câu hỏi bản nháp
  | 'APPROVED_QUESTION' // 2. Câu hỏi đã duyệt
  | 'UNAPPROVED_MATRIX' // 3. Ma trận chưa phê duyệt
  | 'EXAM_IN_PREPARATION' // 4. Đề kiểm tra đang biên soạn
  | 'SECRET_EXAM' // 5. Đề kiểm tra mật
  | 'PUBLISHED_EXAM' // 6. Đề đã phát hành
  | 'ARCHIVED_RECORD'; // 7. Hồ sơ lưu trữ

export interface TenantScopedBaseRecord {
  id: string;
  schoolId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface SchoolTenantRecord extends TenantScopedBaseRecord {
  code: string;
  name: string;
  governingBody: string;
  educationLevels: EducationLevelId[];
  address: string;
  principalName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export interface AcademicYearRecord extends TenantScopedBaseRecord {
  code: string;
  name: string;
  semesters: ('HOC_KY_1' | 'HOC_KY_2')[];
  isCurrent: boolean;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
}

export interface UserLoginHistoryItem {
  id: string;
  timestamp: string;
  ipOrClient: string;
  authMethod: 'PBKDF2_BACKEND' | 'FIREBASE_GOOGLE_OAUTH' | 'SESSION_RESUME';
  status: 'SUCCESS' | 'BLOCKED_DISABLED' | 'INVALID_CREDENTIALS';
  note: string;
}

export interface ManagedUserAccount extends TenantScopedBaseRecord {
  orderNumber?: number;
  positionTitle?: string;
  username: string;
  email: string;
  fullName: string;
  passwordHashAlgorithm: 'PBKDF2-SHA256-100000'; // Tuyệt đối không lưu mật khẩu dạng văn bản thuần
  passwordHashPreview: string; // Hiển thị dạng rút gọn của băm PBKDF2 để kiểm chứng bảo mật
  roles: SystemRoleCode[]; // Một người có thể được giao nhiều vai trò
  departmentName: string; // Tổ chuyên môn được phân công
  assignedSubjects: string[]; // Môn dạy được phân công
  assignedGrades: GradeNumber[]; // Khối lớp được phân công
  assignedSecretExamIds: string[]; // Danh sách mã đề mật được phân công trực tiếp (Quyền truy cập tối thiểu)
  assignedDossierIds?: string[]; // Danh sách mã hồ sơ kiểm tra được phân công (Mục III)
  permissionValidFrom?: string; // Thời điểm bắt đầu hiệu lực phân quyền (Mục III)
  permissionExpiresAt?: string; // Thời hạn phân quyền nếu có (Mục III)
  delegatedApprovalAuthority?: boolean; // Phó hiệu trưởng được ủy quyền phê duyệt trong phạm vi (Mục II)
  hasSecretExamProfessionalClearance?: boolean; // Cấp quyền chuyên môn đọc đề mật cho Quản trị kỹ thuật (Mục II)
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'UNACTIVATED';
  lastLoginAt?: string;
  loginHistory: UserLoginHistoryItem[];
}

export interface RbacRoleCatalogEntry {
  order: number;
  roleCode: SystemRoleCode;
  roleTitle: string;
  allowedActions: string[];
  forbiddenActions: string[];
  scopeRuleSummary: string;
}

export interface RbacVerificationScenarioItem {
  scenarioNumber: number;
  scenarioCode:
    | 'RBAC_TEST_1_TEACHER_CANNOT_APPROVE_AND_ABAC_SUBJECT_GRADE'
    | 'RBAC_TEST_2_HOD_CANNOT_VIEW_OUT_OF_DEPT_DOSSIER'
    | 'RBAC_TEST_3_VP_ONLY_EXECUTES_DELEGATED_RIGHTS'
    | 'RBAC_TEST_4_NO_SELF_ROLE_ESCALATION_AND_TECH_ADMIN_SECRET_GUARD'
    | 'RBAC_TEST_5_LOCKED_ACCOUNT_CANNOT_ACCESS'
    | 'RBAC_TEST_6_MULTI_SCHOOL_TENANT_ISOLATION';
  title: string;
  testAccountLabel: string;
  testAccountRoles: SystemRoleCode[];
  scopeSummary: string;
  allowedSubCheck: {
    actionDescription: string;
    httpStatus: number;
    outcomeMessage: string;
    passed: boolean;
  };
  blockedSubCheck: {
    attackDescription: string;
    httpStatus: number;
    errorCode: string;
    outcomeMessage: string;
    auditLogId: string;
    passed: boolean;
  };
  passed: boolean;
}

export interface RbacVerificationSuiteReport {
  runId: string;
  executedAt: string;
  totalScenarios: number;
  passedScenarios: number;
  allPassed: boolean;
  scenarios: RbacVerificationScenarioItem[];
}

export interface RolePermissionMatrixRow {
  id: string;
  schoolId: string;
  roleCode: SystemRoleCode;
  roleName: string;
  description: string;
  scopeConstraintNote: string;
  permissions: Record<PermissionActionCode, boolean>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE';
}

export interface TeacherAssignmentRecord extends TenantScopedBaseRecord {
  academicYearId: string;
  userId: string;
  teacherName: string;
  departmentName: string;
  subjects: string[];
  grades: GradeNumber[];
  tasks: ('AUTHOR_QUESTION' | 'AUTHOR_EXAM' | 'PEER_REVIEW' | 'APPROVE_DEPT')[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ConfidentialitySecuredItem {
  id: string;
  schoolId: string;
  code: string;
  title: string;
  targetType: 'QUESTION' | 'MATRIX' | 'EXAM' | 'DOSSIER';
  classification: ConfidentialityClassificationCode;
  departmentName: string;
  subject: string;
  grade: number;
  createdByUserId: string;
  createdByName: string;
  assignedUserIds: string[]; // Những cá nhân được phân công trực tiếp
  hasSecretContent: boolean;
  secretPreviewMasked: string; // Đã che nội dung mật khi không có quyền
  secretFullContent?: string; // Chỉ trả về từ backend khi người dùng có quyền hợp lệ
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface SystemAuditLogRecord extends TenantScopedBaseRecord {
  actorUserId: string;
  actorName: string;
  actorRoles: SystemRoleCode[];
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'PASSWORD_RESET'
    | 'DATA_CREATE'
    | 'DATA_UPDATE'
    | 'DATA_SOFT_DELETE'
    | 'SUBMIT_REVIEW'
    | 'APPROVE_RECORD'
    | 'RETURN_REVISION'
    | 'EXPORT_DOSSIER'
    | 'ROLE_PERMISSION_CHANGE'
    | 'BACKUP_RESTORE'
    | 'UNAUTHORIZED_ACCESS_BLOCKED';
  targetType: string;
  targetId: string;
  summary: string; // Không bao giờ chứa nội dung đề mật hoặc đáp án mật
  httpStatus: number;
  status: 'ALLOWED' | 'DENIED';
}

export interface BackupSnapshotRecord {
  id: string;
  schoolId: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  backupMode: 'MANUAL_ON_DEMAND' | 'CONFIGURED_SCHEDULE_RUN';
  sha256Checksum: string;
  sizeBytes: number;
  collectionCounts: Record<string, number>;
  integrityVerified: boolean;
  status: 'VALID' | 'CORRUPTED';
}

export interface RestoreHistoryRecord {
  id: string;
  backupId: string;
  schoolId: string;
  restoredAt: string;
  restoredBy: string;
  restoredByName: string;
  checksumVerifiedBeforeRestore: boolean;
  restoredCollectionsCount: number;
  status: 'SUCCESS' | 'FAILED_CHECKSUM';
  note: string;
}

export interface SecurityTestStepResult {
  stepNumber: number;
  scenarioCode: string;
  title: string;
  actorLabel: string;
  actorSchoolId: string;
  targetResource: string;
  expectedOutcome: string;
  actualHttpStatus: number;
  actualOutcome: string;
  passed: boolean;
  auditLogId: string;
  executedAt: string;
}

export interface SecurityPenetrationTestReport {
  runId: string;
  executedAt: string;
  totalTests: number;
  passedTests: number;
  allPassed: boolean;
  steps: SecurityTestStepResult[];
}

// ============================================================================
// MODULE: KHO NGỮ LIỆU VÀ NHÓM CÂU HỎI (CORPUS REPOSITORY & QUESTION GROUPS)
// ============================================================================

export type CorpusType =
  | 'VAN_BAN' // Văn bản (truyện, tản văn, văn bản thông tin...)
  | 'THO' // Thơ, đồng dao, ca dao
  | 'TRANH' // Tranh minh họa, sơ đồ trực quan
  | 'BANG' // Bảng số liệu thống kê
  | 'BIEU_DO' // Biểu đồ trực quan
  | 'TINH_HUONG'; // Tình huống thực tiễn

export type CorpusUsageRightsCode =
  | 'SGK_CHINH_THONG' // Sách giáo khoa GDPT 2018 chính thống (đã xác minh nguồn)
  | 'TRICH_DAN_XAC_MINH' // Tác phẩm có ghi rõ tác giả, nguồn xuất xứ hợp lệ
  | 'GIAO_VIEN_BIEN_SOAN' // Ngữ liệu do giáo viên / tổ chuyên môn tự biên soạn
  | 'CAN_XIN_PHEP_BAN_QUYEN' // Tác phẩm có bản quyền hạn chế, cần xin phép trước khi phát hành rộng rãi
  | 'CHUA_XAC_MINH_NGUON'; // Chưa xác minh nguồn hoặc tác giả (Cảnh báo kiểm định)

export interface CorpusUsageHistoryRecord {
  id: string;
  examId: string;
  examCode: string;
  examTitle: string;
  examPeriod: 'GIUA_KY_1' | 'CUOI_KY_1' | 'GIUA_KY_2' | 'CUOI_KY_2';
  usedDate: string;
  selectedQuestionCount: number;
  selectedQuestionCodes: string[];
  isOfficialExam: boolean;
}

export interface CorpusTableData {
  caption: string;
  headers: string[];
  rows: string[][];
  unitNote?: string;
}

export interface CorpusItem {
  id: string;
  code: string; // Mã ngữ liệu (VD: NL-TH-TV4-001)
  title: string; // Tên hoặc nhan đề ngữ liệu
  content: string; // Nội dung văn bản / thơ / mô tả tình huống
  author: string; // Tác giả (Tuyệt đối không tự tạo tên tác giả khi chưa xác minh)
  source: string; // Nguồn trích dẫn (VD: Tiếng Việt 4, Tập 1...)
  provenanceInfo: string; // Thông tin xuất xứ chi tiết (nhà xuất bản, năm, trang, hoặc ghi chú nguồn)
  isSourceVerified: boolean; // Đã xác minh thông tin tác giả & nguồn hay chưa
  corpusType: CorpusType; // Loại ngữ liệu: văn bản, thơ, tranh, bảng, biểu đồ, tình huống
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string; // Môn học (Tiếng Việt, Ngữ văn, Khoa học, Lịch sử và Địa lí...)
  topicId: string;
  topicTitle: string; // Chủ đề
  wordCount: number; // Độ dài (số từ)
  charCount: number; // Độ dài (số ký tự)
  usageRights: CorpusUsageRightsCode; // Quyền sử dụng
  usageRightsNote?: string;
  status: ApprovalStatus; // Trạng thái thẩm định (DRAFT, PENDING, APPROVED, NEED_REVISION, DEPRECATED)
  preserveQuestionOrder: boolean; // Không đảo thứ tự các câu nếu thứ tự có ý nghĩa sư phạm
  imageDataUrl?: string; // Hình ảnh / tranh / biểu đồ đính kèm (nếu có)
  tableData?: CorpusTableData; // Dữ liệu bảng số liệu (nếu loại ngữ liệu là BANG / BIEU_DO)
  questionIds: string[]; // Danh sách câu hỏi liên kết theo đúng thứ tự của nhóm câu hỏi
  usageHistory: CorpusUsageHistoryRecord[]; // Lịch sử sử dụng ngữ liệu trong các đề kiểm tra
  createdAt: string;
  updatedAt: string;
  isSampleData: boolean;
}

export type CorpusQualityWarningCode =
  | 'UNGROUNDED_QUESTION' // 1. Câu hỏi không có căn cứ trong ngữ liệu
  | 'MISMATCHED_ANSWER' // 2. Đáp án không phù hợp
  | 'DUPLICATE_MEANING' // 3. Câu hỏi trùng ý
  | 'EXCEEDS_LEARNING_OUTCOME' // 4. Câu hỏi vượt yêu cầu cần đạt
  | 'MISSING_SOURCE_INFO' // 5. Ngữ liệu thiếu thông tin nguồn
  | 'COPYRIGHT_RISK'; // 6. Ngữ liệu có nguy cơ vi phạm quyền tác giả

export interface CorpusQualityWarningItem {
  id: string;
  code: CorpusQualityWarningCode;
  severity: 'WARNING' | 'ERROR';
  title: string;
  targetType: 'CORPUS' | 'QUESTION';
  questionId?: string;
  questionCode?: string;
  questionOrder?: number;
  message: string;
  suggestion: string;
}

export interface CorpusQualityReport {
  corpusId: string;
  corpusCode: string;
  checkedAt: string;
  passedAll: boolean;
  totalQuestionsChecked: number;
  warnings: CorpusQualityWarningItem[];
  criteriaSummary: {
    code: CorpusQualityWarningCode;
    label: string;
    issueCount: number;
    passed: boolean;
  }[];
}

export interface CorpusAcceptanceStepResult {
  stepNumber: number;
  title: string;
  passed: boolean;
  summary: string;
  details: string[];
}

export interface CorpusAcceptanceTestReport {
  executedAt: string;
  corpusCode: string;
  corpusTitle: string;
  grade: number;
  subject: string;
  totalLinkedQuestions: number;
  examQuestionCount: number;
  corpusOccurrenceCountInExam: number;
  docxFileName: string;
  docxSizeBytes: number;
  pdfFileName: string;
  pdfSizeBytes: number;
  allPassed: boolean;
  steps: CorpusAcceptanceStepResult[];
}

// ============================================================================
// MODULE: KIỂM TRA ĐÁNH GIÁ TIỂU HỌC (THÔNG TƯ 27/2020/TT-BGDĐT & GDPT 2018)
// ============================================================================

export type PrimaryGradeNumber = 1 | 2 | 3 | 4 | 5;

export type PrimaryExamPeriodCode =
  | 'GIUA_KY_1'
  | 'CUOI_KY_1'
  | 'GIUA_KY_2'
  | 'CUOI_NAM';

export type PrimaryAssessmentFormCode =
  | 'BAI_KIEM_TRA_VIET'
  | 'DOC_THANH_TIENG_KET_HOP_VIET'
  | 'LY_THUYET_KET_HOP_THUC_HANH'
  | 'BAI_THUC_HANH_DU_AN';

export type PrimaryCognitiveLevelCode =
  | CognitiveLevelCode.PRIMARY_MUC_1
  | CognitiveLevelCode.PRIMARY_MUC_2
  | CognitiveLevelCode.PRIMARY_MUC_3;

export type PrimaryMathQuestionCategory =
  | 'TRAC_NGHIEM'
  | 'DIEN_SO'
  | 'TINH_TOAN'
  | 'TIM_THANH_PHAN_CHUA_BIET'
  | 'GIAI_TOAN_CO_LOI_VAN'
  | 'HINH_HOC'
  | 'DO_LUONG'
  | 'THONG_KE_XAC_SUAT';

export type PrimaryVietnameseComponentCode =
  | 'DOC_THANH_TIENG'
  | 'DOC_HIEU'
  | 'KIEN_THUC_TIENG_VIET'
  | 'VIET';

export interface PrimaryPeriodApplicabilityResult {
  grade: PrimaryGradeNumber;
  subject: string;
  period: PrimaryExamPeriodCode;
  isMandatoryPeriodicExam: boolean;
  assessmentMethodType: 'DIEM_SO_KET_HOP_NHAN_XET' | 'NHAN_XET_THUONG_XUYEN';
  regulatoryClause: string;
  statusLabel: string;
  explanationMessage: string;
  allowedPeriodsForGradeSubject: PrimaryExamPeriodCode[];
  recommendedDurationMinutes: number;
  recommendedTotalPoints: number;
  recommendedForm: PrimaryAssessmentFormCode;
}

export interface PrimarySchoolApprovedTemplate {
  id: string;
  code: string;
  title: string;
  schoolDecisionRef: string;
  approvedByRole: string;
  applicableGrades: PrimaryGradeNumber[];
  applicableSubjects: string[];
  applicablePeriods: PrimaryExamPeriodCode[];
  description: string;
  recommendedLevelPercents: {
    muc1Percent: number;
    muc2Percent: number;
    muc3Percent: number;
  };
  recommendedFormatPercents: {
    objectivePercent: number;
    constructedPercent: number;
  };
  isFlexibleAdvisoryOnly: boolean;
  vietnameseComponentWeights?: {
    docThanhTiengPoints: number;
    docHieuPoints: number;
    kienThucTiengVietPoints: number;
    vietPoints: number;
    totalScaleDescription: string;
  };
}

export interface PrimaryMathCalculationStepCheck {
  stepOrder: number;
  expressionLabel: string;
  expectedValue: string;
  computedValue: string;
  unitLabel?: string;
  isAccurate: boolean;
  verificationNote: string;
}

export interface PrimaryOralReadingRubricItem {
  id: string;
  criterionName: string;
  maxPoints: number;
  levelDescriptors: {
    fullPoints: string;
    partialPoints: string;
    needsSupport: string;
  };
}

export interface PrimaryOralReadingSheet {
  id: string;
  sheetCode: string;
  title: string;
  grade: PrimaryGradeNumber;
  period: PrimaryExamPeriodCode;
  totalPoints: number;
  readingSpeedRequirement: string;
  passages: {
    id: string;
    code: string;
    title: string;
    excerptText: string;
    sourceCitation: string;
    wordCount: number;
    oralQuestion: string;
    expectedOralAnswer: string;
  }[];
  rubricItems: PrimaryOralReadingRubricItem[];
}

export interface PrimaryWritingRubricCriterion {
  id: string;
  orderIndex: number;
  sectionName: string;
  maxPoints: number;
  detailedIndicators: string[];
}

export interface PrimaryWritingAssessmentSpec {
  id: string;
  promptTitle: string;
  promptText: string;
  totalPoints: number;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  cognitiveLevel: PrimaryCognitiveLevelCode;
  cognitiveLevelJustification: string;
  criteria: PrimaryWritingRubricCriterion[];
  sampleOutlineOrNote: string;
}

export interface PrimaryExamQuestionItem {
  id: string;
  questionNumberLabel: string;
  partCode: 'TRAC_NGHIEM' | 'TU_LUAN' | 'DOC_THANH_TIENG' | 'VIET';
  topicId: string;
  topicTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  cognitiveLevel: PrimaryCognitiveLevelCode;
  cognitiveLevelJustification: string;
  formatType: 'TRAC_NGHIEM' | 'TU_LUAN';
  points: number;
  stem: string;
  options?: string[];
  correctAnswer: string;
  gradingGuide: string;
  rubricSteps: {
    stepDescription: string;
    points: number;
  }[];
  mathCategory?: PrimaryMathQuestionCategory;
  mathCalculationChecks?: PrimaryMathCalculationStepCheck[];
  vietnameseComponent?: PrimaryVietnameseComponentCode;
  readingPassageRefId?: string;
}

export interface PrimaryMatrixTopicRow {
  id: string;
  topicTitle: string;
  learningOutcomesSummary: string[];
  muc1ObjectiveCount: number;
  muc1ObjectivePoints: number;
  muc1ConstructedCount: number;
  muc1ConstructedPoints: number;
  muc2ObjectiveCount: number;
  muc2ObjectivePoints: number;
  muc2ConstructedCount: number;
  muc2ConstructedPoints: number;
  muc3ObjectiveCount: number;
  muc3ObjectivePoints: number;
  muc3ConstructedCount: number;
  muc3ConstructedPoints: number;
  totalQuestions: number;
  totalPoints: number;
  percentOfExam: number;
}

export interface PrimarySpecificationRow {
  id: string;
  topicTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  cognitiveLevel: PrimaryCognitiveLevelCode;
  cognitiveLevelJustification: string;
  questionNumbers: string[];
  questionFormatLabel: string;
  specializedCategoryLabel: string;
  points: number;
}

export interface PrimaryExamAnalyticsReport {
  totalQuestions: number;
  totalPoints: number;
  expectedTotalPoints: number;
  isTotalPointsExact: boolean;
  byLevel: {
    level: PrimaryCognitiveLevelCode;
    label: string;
    questionCount: number;
    points: number;
    percentageOfPoints: number;
  }[];
  byTopic: {
    topicTitle: string;
    questionCount: number;
    points: number;
    percentageOfPoints: number;
  }[];
  byLearningOutcome: {
    learningOutcomeCode: string;
    learningOutcomeText: string;
    questionCount: number;
    points: number;
    questionLabels: string[];
  }[];
  formatDistribution: {
    objectiveQuestionCount: number;
    objectivePoints: number;
    objectivePercent: number;
    constructedQuestionCount: number;
    constructedPoints: number;
    constructedPercent: number;
  };
  mathVerificationSummary?: {
    totalMathQuestionsChecked: number;
    totalArithmeticStepsChecked: number;
    allCalculationsAccurate: boolean;
    allRubricStepsMatchQuestionPoints: boolean;
    categoryBreakdown: {
      category: PrimaryMathQuestionCategory;
      label: string;
      questionCount: number;
      points: number;
    }[];
  };
  vietnameseComponentSummary?: {
    component: PrimaryVietnameseComponentCode;
    label: string;
    questionCount: number;
    points: number;
    percentageOfPoints: number;
  }[];
  unassessedLearningOutcomes: {
    topicTitle: string;
    learningOutcomeCode: string;
    learningOutcomeText: string;
    reasonNote: string;
  }[];
}

export interface PrimaryCompleteExamPackage {
  id: string;
  code: string;
  title: string;
  grade: PrimaryGradeNumber;
  subject: string;
  period: PrimaryExamPeriodCode;
  contentScopeDescription: string;
  totalPoints: number;
  durationMinutes: number;
  assessmentForm: PrimaryAssessmentFormCode;
  schoolTemplateId: string;
  schoolTemplateTitle: string;
  approvalStatus: ApprovalStatus;
  aiOriginNotice: string;
  createdAt: string;
  applicabilityCheck: PrimaryPeriodApplicabilityResult;
  readingPassageBlock?: {
    id: string;
    corpusCode: string;
    title: string;
    content: string;
    authorOrSource: string;
    genreLabel: string;
  };
  oralReadingSheet?: PrimaryOralReadingSheet;
  writingAssessmentSpec?: PrimaryWritingAssessmentSpec;
  questions: PrimaryExamQuestionItem[];
  matrixRows: PrimaryMatrixTopicRow[];
  specificationRows: PrimarySpecificationRow[];
  analytics: PrimaryExamAnalyticsReport;
}

export interface PrimaryAcceptanceExamCheckItem {
  examPackageId: string;
  examCode: string;
  examTitle: string;
  grade: PrimaryGradeNumber;
  subject: string;
  periodLabel: string;
  hasMatrix: boolean;
  hasSpecification: boolean;
  hasExamPaper: boolean;
  hasAnswerKey: boolean;
  hasGradingGuide: boolean;
  totalPointsVerified: number;
  isTotalPointsAccurate: boolean;
  levelsCovered: string[];
  learningOutcomesMappedCount: number;
  unassessedOutcomesIdentifiedCount: number;
  calculationsAndAnswersVerified: boolean;
  isKeptAsDraftNotAutoApproved: boolean;
  verificationDetails: string[];
  passed: boolean;
}

export interface PrimaryAcceptanceSuiteReport {
  executedAt: string;
  circularReference: string;
  totalExamsTested: number;
  allPassed: boolean;
  examResults: PrimaryAcceptanceExamCheckItem[];
}

// ============================================================================
// MODULE: PHÂN TÍCH KẾT QUẢ KIỂM TRA VÀ CHẤT LƯỢNG CÂU HỎI
// ============================================================================

export type ResultDataGranularity = 'TOTAL_SCORE_ONLY' | 'FULL_ITEM_RESPONSES';

export interface AnalyticsQuestionBlueprintItem {
  questionId: string;
  questionNumber: number;
  label: string;
  stemSummary: string;
  format: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  maxPoints: number;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  cognitiveLevel: string;
  topicId: string;
  topicTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
}

export interface StudentItemResponseRecord {
  questionId: string;
  selectedOption?: 'A' | 'B' | 'C' | 'D' | 'OMITTED';
  pointsEarned: number;
  isFullCredit: boolean;
}

export interface StudentExamResultRecord {
  studentId: string;
  maskedStudentCode: string;
  fullName: string;
  className: string;
  grade: number;
  subject: string;
  examPeriod: string;
  dataGranularity: ResultDataGranularity;
  totalScore: number;
  itemResponses?: Record<string, StudentItemResponseRecord>;
  importSourceLabel: string;
}

export interface ExamPeriodComparisonRecord {
  periodCode: string;
  periodLabel: string;
  className: string;
  studentCount: number;
  meanScore: number;
  passRatePercent: number;
  goodOrAbovePercent: number;
}

export interface ScoreDistributionBin {
  rangeLabel: string;
  minInclusive: number;
  maxInclusive: number;
  count: number;
  percentage: number;
}

export interface CompletionThresholdConfig {
  passThreshold: number;        // Ngưỡng Đạt / Hoàn thành (mặc định 5.0)
  goodThreshold: number;        // Ngưỡng Khá (mặc định 6.5)
  excellentThreshold: number;   // Ngưỡng Giỏi / Hoàn thành tốt (mặc định 8.0)
}

export interface ClassStatisticalComparisonRow {
  className: string;
  grade: number;
  dataGranularity: ResultDataGranularity;
  studentCount: number;
  meanScore: number;
  medianScore: number;
  stdDeviation: number;
  maxScore: number;
  minScore: number;
  passCount: number;
  passRatePercent: number;
  goodRatePercent: number;
  excellentRatePercent: number;
  belowPassCount: number;
  belowPassRatePercent: number;
}

export interface DescriptiveStatisticsPackage {
  studentCount: number;
  fullItemResponseStudentCount: number;
  totalScoreOnlyStudentCount: number;
  meanScore: number;
  medianScore: number;
  stdDeviation: number;
  maxScore: number;
  minScore: number;
  passCount: number;
  passRatePercent: number;
  goodOrAboveCount: number;
  goodOrAboveRatePercent: number;
  excellentCount: number;
  excellentRatePercent: number;
  belowPassCount: number;
  belowPassRatePercent: number;
  distributionBins: ScoreDistributionBin[];
  classComparisons: ClassStatisticalComparisonRow[];
  periodComparisons: ExamPeriodComparisonRecord[];
}

export interface DistractorOptionStat {
  optionKey: 'A' | 'B' | 'C' | 'D' | 'OMITTED';
  isCorrectKey: boolean;
  totalSelectedCount: number;
  selectionRatePercent: number;
  upperGroupSelectedCount: number;
  upperGroupRatePercent: number;
  lowerGroupSelectedCount: number;
  lowerGroupRatePercent: number;
  distractorDiagnosis: string;
}

export interface QuestionPsychometricAnalysis {
  questionId: string;
  questionNumber: number;
  label: string;
  stemSummary: string;
  format: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  maxPoints: number;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  cognitiveLevel: string;
  topicTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  sampleSizeN: number;
  upperLowerGroupSizeK: number;
  meanPointsEarned: number;
  correctResponseCount: number;
  correctResponseRatePercent: number; // Tỷ lệ trả lời đúng / tỷ lệ điểm đạt được (%)
  difficultyIndexP: number;           // Độ khó thực nghiệm p in [0, 1]
  difficultyClassification: 'KHO' | 'VUA_SUC' | 'DE';
  difficultyLabel: string;
  upperGroupDifficultyP: number;
  lowerGroupDifficultyP: number;
  discriminationIndexD: number;       // Chỉ số phân biệt D = P_upper27% - P_lower27%
  pointBiserialR: number;             // Hệ số tương quan câu hỏi - tổng điểm r_it
  discriminationClassification: 'RAT_TOT' | 'KHA_TOT' | 'CHAP_NHAN_DUOC' | 'KEM_CAN_XEM_XET';
  discriminationLabel: string;
  distractorStats: DistractorOptionStat[];
  hasAnomaly: boolean;
  anomalyFlags: string[];
  reliabilityWarning?: string;
}

export interface LearningOutcomeMasterySynthesis {
  learningOutcomeCode: string;
  learningOutcomeText: string;
  topicTitle: string;
  questionCount: number;
  questionLabels: string[];
  meanCorrectRatePercent: number;
  minQuestionCorrectRatePercent: number;
  maxQuestionCorrectRatePercent: number;
  isSingleQuestionOnly: boolean;
  evidenceSufficiencyNotice: string;
  classification:
    | 'PERFORMING_WELL'
    | 'LOW_CORRECT_RATE'
    | 'NEEDS_REMEDIATION'
    | 'DEPARTMENT_WORKSHOP_TOPIC';
  pedagogicalActionRecommendation: string;
  suggestedProfessionalDevTopic?: string;
}

export interface PrincipalLeadershipReport {
  generatedAt: string;
  schoolName: string;
  academicYear: string;
  grade: number;
  subject: string;
  examPeriod: string;
  section1Overview: {
    summaryText: string;
    totalStudents: number;
    classesIncluded: string[];
    meanScore: number;
    passRatePercent: number;
    excellentRatePercent: number;
    dataIntegrityNote: string;
  };
  section2GradeAnalysis: {
    grade: number;
    meanScore: number;
    stdDeviation: number;
    distributionComment: string;
    periodTrendComment: string;
  };
  section3ClassAnalysis: {
    classRows: ClassStatisticalComparisonRow[];
    gapAnalysisComment: string;
  };
  section4SubjectAnalysis: {
    subject: string;
    examBlueprintSummary: string;
    cognitiveBalanceComment: string;
  };
  section5LearningOutcomeAnalysis: {
    performingWell: LearningOutcomeMasterySynthesis[];
    lowCorrectRate: LearningOutcomeMasterySynthesis[];
    needsSupport: LearningOutcomeMasterySynthesis[];
    departmentTopics: LearningOutcomeMasterySynthesis[];
    nonOvergeneralizationDisclaimer: string;
  };
  section6QuestionQualityAnalysis: {
    analyzedQuestionsCount: number;
    goodItemsCount: number;
    anomalousItemsCount: number;
    anomalousQuestionsSummary: {
      label: string;
      difficultyP: number;
      discriminationD: number;
      issueDescription: string;
    }[];
    psychometricReliabilityNote: string;
  };
  section7KeyIssuesToWatch: string[];
  section8TeachingAdjustmentProposals: string[];
}

export interface AiGuardrailComplianceCheck {
  ruleCode:
    | 'NO_SCORE_MUTATION'
    | 'NO_UNSUBSTANTIATED_CAUSAL_CLAIM'
    | 'NO_TEACHER_COMPETENCE_JUDGMENT'
    | 'NO_STUDENT_PII_EXPOSURE';
  ruleTitle: string;
  passed: boolean;
  verificationDetail: string;
}

export interface AiAnalyticsRecommendationPackage {
  generatedAt: string;
  isAiGenerated: boolean;
  anonymizedInputSummary: string;
  dataSummary: string[];
  detectedTrends: string[];
  suggestedReviewTopics: {
    topicTitle: string;
    targetGroup: string;
    rationale: string;
  }[];
  suggestedDepartmentWorkshops: {
    workshopTitle: string;
    evidenceFromItems: string;
    expectedOutcome: string;
  }[];
  suggestedStudentSupportActivities: {
    groupLabel: string;
    scoreRange: string;
    studentCount: number;
    supportAction: string;
  }[];
  guardrailChecks: AiGuardrailComplianceCheck[];
}

export interface IndependentVerificationMetricComparison {
  metricCode: string;
  metricName: string;
  formulaUsed: string;
  primaryEngineValue: number;
  independentEngineValue: number;
  absoluteDifference: number;
  matched: boolean;
}

export interface IndependentVerificationAuditReport {
  executedAt: string;
  testedClassesCount: number;
  studentsPerClass: number;
  totalFullResponseStudentsTested: number;
  totalScoreOnlyStudentsTested: number;
  nonInferenceRuleVerified: boolean;
  nonInferenceVerificationDetail: string;
  singleItemCompetencyGuardrailVerified: boolean;
  metricComparisons: IndependentVerificationMetricComparison[];
  questionLevelComparisons: {
    questionLabel: string;
    primaryP: number;
    independentP: number;
    primaryD: number;
    independentD: number;
    primaryDistractorSumPercent: number;
    matched: boolean;
  }[];
  allPassed: boolean;
}

// ============================================================================
// GIAI ĐOẠN 15: BỘ KIỂM TRA CHẤT LƯỢNG ĐỀ KIỂM TRA BẰNG AI – AI QUALITY REVIEW
// ============================================================================

export type QualityReviewGroupId =
  | 'GROUP_01_CURRICULUM'
  | 'GROUP_02_MATRIX'
  | 'GROUP_03_SPECIFICATION'
  | 'GROUP_04_KNOWLEDGE'
  | 'GROUP_05_QUESTION_STEM'
  | 'GROUP_06_MULTIPLE_CHOICE'
  | 'GROUP_07_ESSAY'
  | 'GROUP_08_ANSWER_AND_RUBRIC'
  | 'GROUP_09_LANGUAGE_AND_FORMAT'
  | 'GROUP_10_OVERALL_QUALITY';

export type QualityIssueSeverityLevel =
  | 'LEVEL_1_CRITICAL'
  | 'LEVEL_2_HIGH'
  | 'LEVEL_3_MEDIUM'
  | 'LEVEL_4_LOW';

export type QualityDetectionSourceLayer = 'LAYER_A_RULE_ENGINE' | 'LAYER_B_GEMINI_AI';

export type QualityIssueStatus =
  | 'OPEN'
  | 'ACCEPTED_PROPOSAL'
  | 'REJECTED_PROPOSAL'
  | 'RESOLVED';

export type PrimaryVietnameseCorpusGenre =
  | 'TRUYEN'
  | 'THO'
  | 'VAN_BAN_THONG_TIN'
  | 'LOAI_KHAC';

export type PrimaryVietnameseReadingQuestionClass =
  | 'NHAN_BIET_TRUC_TIEP'
  | 'HIEU_GIAI_THICH_SUY_LUAN'
  | 'LIEN_HE_VAN_DUNG';

export type PrimaryVietnameseKnowledgeSubdomain =
  | 'TU_VA_NGHIA'
  | 'TU_LOAI'
  | 'CAU_TAO_CAU'
  | 'THANH_PHAN_CAU'
  | 'DAU_CAU'
  | 'BIEN_PHAP_TU_TU'
  | 'LIEN_KET_CAU_DOAN'
  | 'KHAC';

export interface PrimaryVietnameseCorpusInspectionNode {
  corpusCode: string;
  title: string;
  content: string;
  declaredGenre: PrimaryVietnameseCorpusGenre;
  author: string; // Tuyệt đối không tự bịa tên tác giả khi chưa có dữ liệu xác minh
  sourceCitation: string; // Tuyệt đối không tự bịa nguồn trích dẫn
  isSourceVerified: boolean;
  wordCount: number;
  recommendedWordRangeForGrade: { min: number; max: number };
  ageAppropriatenessNote?: string;
  hasInappropriateContentFlag?: boolean;
}

export interface PrimaryVietnameseWritingInspectionNode {
  questionNumber: number;
  promptText: string;
  declaredGenre: string;
  allocatedMinutes: number;
  points: number;
  hasClearRequirement: boolean;
  isGenreAlignedWithCurriculum: boolean;
  isDurationAppropriate: boolean;
  hasTooManySubRequirements: boolean;
  allowsCreativeExpression: boolean;
  avoidsSingleRigidExpression: boolean;
  rubricCheck: {
    hasContentCriterion: boolean;
    contentPoints: number;
    hasStructureCriterion: boolean;
    structurePoints: number;
    hasExpressionCriterion: boolean;
    expressionPoints: number;
    hasSpellingPresentationCriterion: boolean;
    spellingPresentationPoints: number;
    isScoreAllocationReasonable: boolean;
    treatsSampleEssayAsOnlyAnswer: boolean;
  };
}

export type PrimaryMathCalculationCheckType =
  | 'ARITHMETIC_BASIC'
  | 'ARITHMETIC_FOUR_OPS'
  | 'EXPRESSION_VALUE'
  | 'ORDER_OF_OPERATIONS'
  | 'FRACTION_DECIMAL'
  | 'UNIT_CONVERSION'
  | 'WORD_PROBLEM_RESULT_UNIT'
  | 'WORD_PROBLEM_WITH_UNIT'
  | 'GEOMETRY_FORMULA'
  | 'NONE';

export interface PrimaryMathGeometryMetadata {
  shapeType: string;
  shapeLabel?: string;
  declaredPointsAndSegments?: string[];
  diagramPointsAndSegments?: string[];
  declaredFormula?: string;
  correctFormula?: string;
  diagramDescription: string;
  hasLabelMismatch?: boolean;
  labelMismatchDetail?: string;
  isPointSegmentAngleConsistent?: boolean;
  hasFormulaError?: boolean;
  formulaErrorDetail?: string;
  hasMisleadingDiagram?: boolean;
  hasMisleadingIllustration?: boolean;
  misleadingDiagramDetail?: string;
  geometryAuditNote?: string;
}

export interface PrimaryMathQuestionAuditSpec {
  calculationType?: PrimaryMathCalculationCheckType;
  expressionOrFormulaText?: string;
  expressionToEvaluate?: string;
  expectedNumericResult?: number;
  declaredResultValue?: string;
  deterministicTrueResult?: string;
  declaredUnit?: string;
  expectedUnit?: string;
  deterministicSolutionSteps?: string;
  // 2. Kiểm tra đề bài
  hasInsufficientData?: boolean;
  insufficientDataDetail?: string;
  hasContradictoryData?: boolean;
  contradictoryDataDetail?: string;
  contradictionExplanation?: string;
  hasMultipleValidAnswers?: boolean;
  multipleValidAnswersDetail?: string;
  // 3. Kiểm tra mức độ (không chỉ dựa vào số bước tính)
  stepCount?: number;
  thinkingOperationsAnalysis?: string;
  thinkingOperationsRequired?: string[];
  recommendedCognitiveLevel?: 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng';
  cognitiveLevelJustification?: string;
  // 4. Kiểm tra hướng dẫn chấm
  rubricSubStepPoints?: { stepLabel: string; points: number }[];
  rubricSubPointsSum?: number;
  hasFlukeCorrectResultFromWrongMethod?: boolean;
  rubricHasFlukeCorrectResult?: boolean;
  flukeMethodDetail?: string;
  rubricFlukeExplanation?: string;
  hasMissingStepOrUnitInRubric?: boolean;
  rubricMissingIntermediateStep?: boolean;
  rubricMissingUnitInAnswer?: boolean;
  missingStepOrUnitDetail?: string;
  // 5. Kiểm tra hình học
  geometryMetadata?: PrimaryMathGeometryMetadata;
  geometryMeta?: PrimaryMathGeometryMetadata;
}

export interface QualityReviewQuestionNode {
  questionNumber: number;
  questionCode: string;
  format: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
  stem: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  declaredCorrectAnswer: string;
  points: number;
  declaredCognitiveLevel: 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng';
  topicTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  gradingGuide: string;
  acceptedAlternativeSolutions?: string;
  // Thuộc tính chuyên sâu cho đề Tiếng Việt lớp 1–5
  vietnameseSection?: 'DOC_HIEU' | 'KIEN_THUC_TIENG_VIET' | 'VIET';
  readingQuestionClassification?: PrimaryVietnameseReadingQuestionClass;
  vietnameseKnowledgeSubdomain?: PrimaryVietnameseKnowledgeSubdomain;
  isGroundedInCorpus?: boolean;
  requiresVerbatimAnswerInRubric?: boolean;
  // Thuộc tính chuyên sâu cho đề Toán Tiểu học lớp 1–5
  mathAuditSpec?: PrimaryMathQuestionAuditSpec;
  // Thuộc tính phục vụ Đối chiếu chéo 7 nguồn dữ liệu
  positionInExamLabel?: string;
  aiAssessedCognitiveLevel?: 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng';
  answerKeySheetValue?: string;
  answerKeySheetQuestionNumber?: number;
  answerKeySheetVariantCode?: string;
  gradingGuidePoints?: number;
  isWithinDeclaredCurriculumScope?: boolean;
  outOfScopeReason?: string;
}

export interface QualityReviewMatrixSlot {
  questionNumber: number;
  expectedTopicTitle: string;
  expectedKnowledgeUnit?: string;
  expectedLearningOutcomeCode: string;
  expectedCognitiveLevel: 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng';
  expectedFormat: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
  expectedPoints: number;
  expectedPointPercentage?: number;
}

export interface QualityReviewSpecificationSlot {
  questionNumber: number;
  topicTitle?: string;
  knowledgeUnit?: string;
  learningOutcomeCode: string;
  learningOutcomeDescription: string;
  competencyAssessed: string;
  cognitiveLevel: 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng';
  format: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
  expectedPoints?: number;
}

export interface QualityReviewDossierPackage {
  dossierId: string;
  dossierCode: string;
  title: string;
  subject: string;
  grade: number;
  examPeriod: string;
  examVariantCode: string;
  curriculumStandard: string;
  assessmentRuleSet: string;
  durationMinutes: number;
  targetTotalPoints: number;
  versionLabel: string;
  approvalStatus: ApprovalStatus;
  isConfidentialExam: boolean;
  hasSecurityPermissionForAi: boolean;
  // 5 tài liệu thành phần trong hồ sơ (+ Chương trình YCCĐ & Bộ quy tắc đánh giá = 7 nguồn đầu vào)
  hasMatrixDocument: boolean;
  hasSpecificationDocument: boolean;
  hasExamPaperDocument: boolean;
  hasAnswerKeyDocument: boolean;
  hasGradingGuideDocument: boolean;
  declaredCurriculumScopeSummary?: string;
  allowedCurriculumTopicTitles?: string[];
  answerKeyHeaderVariantCode?: string;
  extraOrphanAnswerKeys?: { questionNumber: number; declaredAnswer: string }[];
  questions: QualityReviewQuestionNode[];
  matrixSlots: QualityReviewMatrixSlot[];
  specificationSlots: QualityReviewSpecificationSlot[];
  // Thành phần chuyên biệt môn Tiếng Việt Tiểu học (Lớp 1–5)
  vietnameseCorpusBlock?: PrimaryVietnameseCorpusInspectionNode;
  vietnameseWritingBlock?: PrimaryVietnameseWritingInspectionNode;
}

export interface QualityReviewDetectedIssue {
  issueId: string;
  issueCode: string;
  groupId: QualityReviewGroupId;
  groupTitle: string;
  issueCategoryLabel: string;
  severity: QualityIssueSeverityLevel;
  severityLabel: string;
  detectionLayer: QualityDetectionSourceLayer;
  detectionLayerLabel: string;
  locationLabel: string;
  questionNumber?: number;
  currentContent: string;
  problemDescription: string;
  evidenceAndBasis: string;
  proposedFix: string;
  // 2 trường bắt buộc bổ sung cho Mục 6 Kiểm tra Toán Tiểu học:
  // Kết quả đúng hoặc phương án xử lý + Lời giải kiểm chứng từ bộ tính toán xác định
  correctResultOrHandling?: string;
  verificationSolutionProof?: string;
  confidenceScorePercent: number;
  confidenceLabel: string;
  status: QualityIssueStatus;
  impactAnalysis: {
    impactOnQuestionStem: string;
    impactOnAnswerKey: string;
    impactOnCognitiveLevel: string;
    impactOnMatrix: string;
    impactOnGradingGuide: string;
  };
  replacementDraft?: {
    updatedStem?: string;
    updatedOptions?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
    updatedCorrectAnswer?: string;
    updatedPoints?: number;
    updatedCognitiveLevel?: 'Mức 1 – Nhận biết' | 'Mức 2 – Thông hiểu' | 'Mức 3 – Vận dụng';
    updatedTopicTitle?: string;
    updatedGradingGuide?: string;
    updatedAcceptedAlternativeSolutions?: string;
  };
}

export interface QualityReviewVersionHistoryEntry {
  versionId: string;
  versionLabel: string;
  timestamp: string;
  appliedIssueCode: string;
  locationLabel: string;
  beforeSnapshot: string;
  afterSnapshot: string;
  actorNote: string;
}

export interface QualityReviewComprehensiveReport {
  generatedAt: string;
  dossierCode: string;
  dossierTitle: string;
  versionLabel: string;
  isComprehensiveCheckComplete: boolean;
  completenessBannerText: string;
  checkedScopeList: string[];
  unverifiedScopeList: string[];
  totalQuestionsChecked: number;
  countsBySeverity: {
    level1Critical: number;
    level2High: number;
    level3Medium: number;
    level4Low: number;
    total: number;
  };
  countsByLayer: {
    layerARuleEngine: number;
    layerBGeminiAi: number;
  };
  verifiedRuleIssues: QualityReviewDetectedIssue[];
  expertReviewAiWarnings: QualityReviewDetectedIssue[];
  professionalConclusionLabel: string;
  canSubmitForAppraisal: boolean;
}

export interface QualityReviewBenchmarkTestResult {
  executedAt: string;
  flawedExamDossierCode: string;
  validExamDossierCode: string;
  partialDossierCode: string;
  injectedErrorsTotal: number;
  detectedErrorsCount: number;
  missedErrorsCount: number;
  falsePositiveWarningsOnValidExam: number;
  injectedErrorVerificationRows: {
    order: number;
    injectedErrorType: string;
    targetQuestionLabel: string;
    expectedSeverity: string;
    detectedBySystem: boolean;
    detectedIssueCode: string;
    detectedLayer: string;
    classifiedSeverity: string;
    verificationNote: string;
  }[];
  executedFeaturesList: string[];
  remainingLimitationsList: string[];
}

export interface PrimaryVietnameseQualityAnalysisSummary {
  isVietnamesePrimaryDossier: boolean;
  grade: number;
  corpusEvaluation: {
    detectedGenreLabel: string;
    wordCount: number;
    recommendedWordRangeText: string;
    isLengthAppropriate: boolean;
    sourceVerificationLabel: string;
    ageAppropriatenessStatus: string;
    groundedQuestionsCount: number;
    ungroundedQuestionsCount: number;
  };
  readingQuestionsEvaluation: {
    questionNumber: number;
    questionCode: string;
    stemPreview: string;
    classificationLabel: string;
    declaredLevel: string;
    isClear: boolean;
    hasSufficientData: boolean;
    isGroundedInText: boolean;
    hasSingleValidKeyOrFlexibleOpen: boolean;
    isNonDuplicate: boolean;
    matchesLearningOutcome: boolean;
    isCognitiveLevelReasonable: boolean;
    note: string;
  }[];
  knowledgeQuestionsEvaluation: {
    questionNumber: number;
    questionCode: string;
    subdomainLabel: string;
    curriculumAlignmentNote: string;
    isScientificallyAccurate: boolean;
    issueSummary?: string;
  }[];
  writingEvaluation: {
    questionNumber: number;
    genreLabel: string;
    allocatedMinutes: number;
    points: number;
    criteriaChecklist: {
      label: string;
      passed: boolean;
      detail: string;
    }[];
  };
  gradingGuideEvaluation: {
    readingRubricFlexible: boolean;
    readingRubricNote: string;
    writingRubricComplete4Pillars: boolean;
    writingRubricAvoidsSampleLock: boolean;
    writingRubricNote: string;
  };
}

export interface PrimaryVietnameseBenchmarkSuiteResult {
  executedAt: string;
  grade4FlawedDossierCode: string;
  grade5FlawedDossierCode: string;
  validVietnameseDossierCode: string;
  totalInjectedErrorsAcrossGrade4And5: number;
  totalDetectedErrors: number;
  missedErrorsCount: number;
  falsePositivesOnValidVietnameseExam: number;
  autoModifiedWithoutConfirmation: boolean;
  autoApprovedWithoutCouncil: boolean;
  verificationRows: {
    order: number;
    examLabel: string;
    errorCategory: string;
    targetLocation: string;
    detectedBySystem: boolean;
    detectedIssueCode: string;
    severityLabel: string;
    detectionLayerLabel: string;
    evidenceSummary: string;
  }[];
}

export interface PrimaryMathDeterministicCheckItem {
  questionNumber: number;
  questionCode: string;
  calculationTypeLabel: string;
  expressionTested: string;
  declaredAnswerInDossier: string;
  deterministicVerifiedResult: string;
  unitVerificationStatus: string;
  isCalculationAccurate: boolean;
  verificationProofText: string;
}

export interface PrimaryMathQualityAnalysisSummary {
  isMathPrimaryDossier: boolean;
  grade: number;
  calculationVerificationItems: PrimaryMathDeterministicCheckItem[];
  problemStatementEvaluation: {
    questionNumber: number;
    questionCode: string;
    stemPreview: string;
    hasSufficientData: boolean;
    isQuestionClear: boolean;
    hasSingleOrValidAnswerSet: boolean;
    isDataNonContradictory: boolean;
    isGradeLevelAppropriate: boolean;
    note: string;
  }[];
  cognitiveLevelEvaluation: {
    questionNumber: number;
    questionCode: string;
    declaredLevel: string;
    recommendedLevel: string;
    thinkingOperations: string[];
    learningOutcomeCode: string;
    isClassificationValid: boolean;
    justification: string;
  }[];
  gradingGuideEvaluation: {
    totalDeclaredPoints: number;
    actualQuestionPointsSum: number;
    isPointAllocationReasonable: boolean;
    acceptsMultipleSolutionMethods: boolean;
    flukeMethodWarningsCount: number;
    missingStepOrUnitCount: number;
    questionRubricItems: {
      questionNumber: number;
      points: number;
      subPointsCheckText: string;
      hasFlukeCorrectResult: boolean;
      hasMissingStepsOrUnits: boolean;
      acceptsAlternativeMethods: boolean;
      auditNote: string;
    }[];
  };
  geometryEvaluation: {
    questionNumber: number;
    questionCode: string;
    shapeType: string;
    diagramMatchesData: boolean;
    pointsSegmentsAnglesValid: boolean;
    formulaAccurate: boolean;
    noMisleadingIllustration: boolean;
    auditNote: string;
  }[];
}

export interface PrimaryMathBenchmarkSuiteResult {
  executedAt: string;
  grade4FlawedDossierCode: string;
  grade5FlawedDossierCode: string;
  validMathDossierCode: string;
  totalInjectedErrorsAcrossGrade4And5: number;
  totalDetectedErrors: number;
  missedErrorsCount: number;
  falsePositivesOnValidMathExam: number;
  autoModifiedWithoutConfirmation: boolean;
  verificationRows: {
    order: number;
    examLabel: string;
    pillarCategory: string;
    questionNumber: number;
    errorDescription: string;
    correctResultOrHandling: string;
    verificationSolutionProof: string;
    severityLabel: string;
    proposedFix: string;
    detectedIssueCode: string;
    detectedBySystem: boolean;
  }[];
}

// ============================================================================
// ĐỐI CHIẾU CHÉO HỒ SƠ KIỂM TRA (7 ĐẦU VÀO - 4 CẶP ĐỐI CHIẾU - BẢNG 10 CỘT)
// ============================================================================

export interface CrossCheckQuestionResultRow {
  questionNumber: number;
  questionCode: string;
  positionInExam: string;
  topicTitle: string;
  learningOutcome: string;
  matrixCognitiveLevel: string;
  aiAssessedCognitiveLevel: string;
  matrixPoints: number;
  actualExamPoints: number;
  matchStatus: 'MATCHED' | 'MISMATCHED';
  recheckNotes: string;
  mismatchDimensions: string[];
}

export interface CrossCheckDocumentConflictWarning {
  warningId: string;
  questionNumber?: number;
  questionCode?: string;
  conflictingDocumentsLabel: string;
  citationDocumentA: {
    documentName: string;
    locationLabel: string;
    excerptText: string;
  };
  citationDocumentB: {
    documentName: string;
    locationLabel: string;
    excerptText: string;
  };
  causeExplanation: string;
  neutralAdjustmentOptions: {
    optionA_FollowSourceA: string;
    optionB_FollowSourceB: string;
    neutralityNote: string;
  };
  severity: QualityIssueSeverityLevel;
  severityLabel: string;
}

export interface DossierCrossCheckAnalysisResult {
  dossierCode: string;
  dossierTitle: string;
  executedAt: string;
  // 7 nguồn dữ liệu đầu vào
  sevenInputsStatus: {
    order: number;
    inputName: string;
    isAvailable: boolean;
    summaryDetail: string;
  }[];
  // I. Đối chiếu Ma trận với Bản đặc tả
  section1MatrixVsSpec: {
    totalMatrixSlots: number;
    totalSpecSlots: number;
    matrixTotalPoints: number;
    specTotalPoints: number;
    topicMatch: boolean;
    knowledgeContentMatch: boolean;
    learningOutcomeMatch: boolean;
    questionCountMatch: boolean;
    questionFormatMatch: boolean;
    cognitiveLevelMatch: boolean;
    totalPointsMatch: boolean;
    pointPercentageMatch: boolean;
    slotComparisons: {
      questionNumber: number;
      matrixTopic: string;
      specTopic: string;
      matrixOutcome: string;
      specOutcome: string;
      matrixFormat: string;
      specFormat: string;
      matrixLevel: string;
      specLevel: string;
      matrixPoints: number;
      matrixRatioPercent: number;
      isPresentInSpec: boolean;
      isMatched: boolean;
      mismatchNote: string;
    }[];
  };
  // II. Đối chiếu Bản đặc tả với Đề kiểm tra (+ Phạm vi Chương trình & YCCĐ)
  section2SpecVsExam: {
    allContentMatched: boolean;
    allLevelsMatched: boolean;
    allFormatsMatched: boolean;
    allOutcomesMatched: boolean;
    allPointsMatched: boolean;
    allWithinCurriculumScope: boolean;
    questionComparisons: {
      questionNumber: number;
      questionCode: string;
      isPresentInSpec: boolean;
      contentMatchesSpec: boolean;
      levelMatchesSpec: boolean;
      formatMatchesSpec: boolean;
      outcomeMatchesSpec: boolean;
      pointsMatchesSpec: boolean;
      withinCurriculumScope: boolean;
      detailNote: string;
    }[];
  };
  // III. Đối chiếu Đề kiểm tra với Đáp án
  section3ExamVsAnswerKey: {
    everyQuestionHasAnswer: boolean;
    noMissingOrExtraAnswers: boolean;
    allAnswersMatchQuestionContent: boolean;
    noMisalignedQuestionNumbers: boolean;
    noMisalignedExamVariantCode: boolean;
    noContradictoryOptions: boolean;
    itemChecks: {
      questionNumber: number;
      questionCode: string;
      examVariantInPaper: string;
      examVariantInAnswerKey: string;
      answerInQuestionNode: string;
      answerInAnswerKeySheet: string;
      verifiedCorrectAnswer: string;
      isMatched: boolean;
      detailNote: string;
    }[];
  };
  // IV. Đối chiếu Đáp án với Hướng dẫn chấm
  section4AnswerKeyVsGradingGuide: {
    allQuestionPointsMatched: boolean;
    allSubStepPointsMatched: boolean;
    allRequiredContentAligned: boolean;
    acceptsAlternativeValidAnswers: boolean;
    gradingScaleConsistent: boolean;
    itemChecks: {
      questionNumber: number;
      questionCode: string;
      examPoints: number;
      gradingGuidePoints: number;
      subStepSumPoints: number;
      acceptsAlternatives: boolean;
      isConsistent: boolean;
      detailNote: string;
    }[];
  };
  // V. Bảng kết quả 10 cột bắt buộc
  section5ResultTable: CrossCheckQuestionResultRow[];
  // VI. Danh sách cảnh báo mâu thuẫn (không tự quyết định tài liệu nào đúng)
  section6ConflictWarnings: CrossCheckDocumentConflictWarning[];
}

export interface DossierCrossCheckBenchmarkResult {
  executedAt: string;
  testDossierCode: string;
  testDossierTitle: string;
  totalInjectedDiscrepancies: number;
  detectedDiscrepanciesCount: number;
  missedDiscrepanciesCount: number;
  dataModifiedAutomatically: boolean;
  dossierApprovedAutomatically: boolean;
  scenarioVerifications: {
    order: number;
    scenarioTitle: string;
    targetQuestionCode: string;
    conflictingDocuments: string;
    detectedBySystem: boolean;
    detectedWarningId: string;
    citationExcerpt: string;
    rootCauseSummary: string;
    neutralProposalSummary: string;
  }[];
}

// ============================================================================
// BẢNG ĐIỀU KHIỂN CHẤT LƯỢNG ĐỀ (EXAM QUALITY CONTROL DASHBOARD - MỤC I -> VII)
// ============================================================================

export type QualityDashboardOverallStatusCode =
  | 'STATUS_1_UNINSPECTED'
  | 'STATUS_2_INSPECTING'
  | 'STATUS_3_HAS_ERRORS_TO_FIX'
  | 'STATUS_4_NEEDS_EXPERT_VERIFICATION'
  | 'STATUS_5_ELIGIBLE_FOR_APPRAISAL';

export interface QualityDashboardIssueActionMeta {
  issueId: string;
  assigneeName: string;
  reviewerNote: string;
  updatedAt: string;
}

export interface QualityDashboardComputedState {
  dossierCode: string;
  dossierTitle: string;
  versionLabel: string;
  computedAt: string;
  // I. Thông tin tổng quan (9 chỉ số tính từ dữ liệu thực)
  overviewMetrics: {
    totalQuestions: number;
    inspectedQuestions: number;
    uninspectedQuestions: number;
    criticalIssuesCount: number;
    highIssuesCount: number;
    mediumIssuesCount: number;
    lowIssuesCount: number;
    resolvedIssuesCount: number;
    unresolvedIssuesCount: number;
    totalIssuesCount: number;
  };
  // II. Dữ liệu 4 biểu đồ
  chartsData: {
    bySeverity: {
      severity: QualityIssueSeverityLevel;
      label: string;
      count: number;
      percentage: number;
    }[];
    byCriteriaGroup: {
      groupId: QualityReviewGroupId;
      groupCode: string;
      groupTitle: string;
      count: number;
      percentage: number;
    }[];
    byResolutionStatus: {
      statusKey: QualityIssueStatus;
      label: string;
      count: number;
      percentage: number;
    }[];
    byCognitiveLevel: {
      levelKey: string;
      label: string;
      matrixCount: number;
      actualExamCount: number;
      aiAssessedCount: number;
    }[];
  };
  // V. Đánh giá tổng thể (1 trong 5 trạng thái, không dùng "Đạt chuẩn tuyệt đối")
  overallEvaluation: {
    statusCode: QualityDashboardOverallStatusCode;
    statusNumber: 1 | 2 | 3 | 4 | 5;
    statusLabel:
      | '1. Chưa kiểm tra'
      | '2. Đang kiểm tra'
      | '3. Có lỗi cần khắc phục'
      | '4. Cần chuyên gia xác minh'
      | '5. Đủ điều kiện gửi thẩm định chuyên môn';
    statusRationale: string;
    mandatoryEpistemicDisclaimer: string;
  };
}

export interface QualityDashboardBenchmarkResult {
  executedAt: string;
  testDossierCode: string;
  allPassed: boolean;
  noSampleDataUsedAsRealMetrics: boolean;
  noAbsolutePerfectionLabelUsed: boolean;
  verificationItems: {
    order: number;
    testCategory: string;
    verificationTarget: string;
    actualResultDetail: string;
    passed: boolean;
  }[];
}

// ============================================================================
// GIAI ĐOẠN 16: TÍCH HỢP QUY TRÌNH VẬN HÀNH TOÀN DIỆN – END-TO-END EXAM WORKFLOW
// ============================================================================

export type ExamWorkflowState =
  | 'Draft'
  | 'MatrixReview'
  | 'MatrixApproved'
  | 'ExamDraft'
  | 'AIReview'
  | 'TeacherRevision'
  | 'ProfessionalReview'
  | 'RevisionRequired'
  | 'AwaitingApproval'
  | 'Approved'
  | 'Released'
  | 'ResultsAnalysis'
  | 'Archived';

export type ExamWorkflowStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type WorkflowActorRole =
  | 'TEACHER'
  | 'REVIEWER'
  | 'HEAD_OF_DEPARTMENT'
  | 'VICE_PRINCIPAL'
  | 'PRINCIPAL'
  | 'SYSTEM_ADMIN';

export interface ExamWorkflowVersionSnapshot {
  versionId: string;
  versionNumber: number;
  versionLabel: string;
  createdAt: string;
  createdBy: string;
  createdByRole: WorkflowActorRole;
  workflowStateAtCreation: ExamWorkflowState;
  stepNumberAtCreation: ExamWorkflowStepNumber;
  matrixId: string;
  specificationId: string;
  examId: string;
  questionIds: string[];
  totalPoints: number;
  matrixStructureSignature: string;
  isImmutableApprovedLock: boolean;
  changeNote: string;
}

export interface ExamWorkflowAuditLogEntry {
  id: string;
  workflowId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: WorkflowActorRole;
  actionType:
    | 'WORKFLOW_CREATED'
    | 'STATE_TRANSITION'
    | 'STEP_SAVED'
    | 'MATRIX_APPROVED'
    | 'MATRIX_INVALIDATED_BY_EDIT'
    | 'AI_REVIEW_COMPLETED'
    | 'TEACHER_REVISION_SAVED'
    | 'PROFESSIONAL_REVIEW_SUBMITTED'
    | 'EXAM_APPROVED_AND_LOCKED'
    | 'DOSSIER_EXPORTED'
    | 'RESULTS_ANALYZED'
    | 'ROLLBACK_EXECUTED'
    | 'SECURITY_VIOLATION_BLOCKED';
  fromState: ExamWorkflowState;
  toState: ExamWorkflowState;
  fromStep: ExamWorkflowStepNumber;
  toStep: ExamWorkflowStepNumber;
  versionId: string;
  backendVerified: boolean;
  summary: string;
}

export interface ExamWorkflowTeacherRevisionItem {
  revisionId: string;
  questionNumber: number;
  questionId: string;
  questionCode: string;
  aiIssueCode?: string;
  decision: 'ACCEPTED_PROPOSAL' | 'REJECTED_PROPOSAL' | 'MANUAL_EDIT';
  reasonNote: string;
  oldStem: string;
  newStem: string;
  oldPoints: number;
  newPoints: number;
  oldCognitiveLevel: string;
  newCognitiveLevel: string;
  affectedMatrixStructure: boolean;
  revisedBy: string;
  revisedAt: string;
}

export interface ExamWorkflowProfessionalReviewBallot {
  ballotId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: WorkflowActorRole;
  reviewedVersionId: string;
  submittedAt: string;
  decision: 'ELIGIBLE_FOR_APPROVAL' | 'REVISION_REQUIRED';
  generalComments: string;
  criteriaChecklist: {
    curriculumAlignment: boolean;
    matrixAndSpecMatch: boolean;
    scientificAndPedagogicalAccuracy: boolean;
    answerKeyAndRubricClarity: boolean;
  };
}

export interface ExamWorkflowOfficialApprovalRecord {
  approvalId: string;
  approverId: string;
  approverName: string;
  approverRole: WorkflowActorRole;
  approvedVersionId: string;
  approvedAt: string;
  isVersionLocked: boolean;
  dossierCompletenessVerified: boolean;
  appraisalBallotVerified: boolean;
  approvalComment: string;
}

export interface ExamWorkflowExportedPackageRecord {
  exportId: string;
  exportedAt: string;
  exportedBy: string;
  exportedByRole: WorkflowActorRole;
  versionId: string;
  format: 'WORD_DOCX' | 'PDF' | 'EXCEL_XLSX' | 'ZIP_FULL_DOSSIER';
  includedDocuments: (
    | 'MA_TRAN'
    | 'BAN_DAC_TA'
    | 'DE_KIEM_TRA'
    | 'DAP_AN'
    | 'HUONG_DAN_CHAM'
    | 'PHIEU_THAM_DINH'
    | 'BIEN_BAN_PHE_DUYET'
  )[];
  confidentialCheckPassed: boolean;
}

export interface ExamWorkflowResultsAnalysisSummary {
  analysisId: string;
  analyzedAt: string;
  analyzedBy: string;
  studentCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRatePercent: number;
  hasItemLevelData: boolean;
  flaggedQuestionsCount: number;
  learningOutcomeMasterySummary: {
    outcomeCode: string;
    outcomeLabel: string;
    masteryPercent: number;
  }[];
  bankImprovementProposals: {
    questionCode: string;
    empiricalDifficulty: number;
    discriminationIndex: number;
    proposalText: string;
    archivedExamQuestionUntouched: boolean;
  }[];
}

export interface ExamWorkflow {
  // II. HỒ SƠ KIỂM TRA TRUNG TÂM (ExamWorkflow)
  workflowId: string;
  title: string;
  schoolId: string;
  academicYearId: string;
  gradeId: GradeNumber;
  subjectId: string;
  examPeriod: 'MID_SEM_1' | 'END_SEM_1' | 'MID_SEM_2' | 'END_YEAR' | 'REGULAR';
  examPeriodLabel: string;
  examDate: string;
  creatorId: string;
  creatorName: string;
  matrixId: string;
  specificationId: string;
  examId: string;
  currentVersionId: string;
  reviewReportId: string;
  approvalId: string;
  status: ExamWorkflowState;
  currentStep: ExamWorkflowStepNumber;
  assignedUsers: {
    creatorName: string;
    creatorRole: WorkflowActorRole;
    matrixApproverName: string;
    reviewerName: string;
    finalApproverName: string;
    analyticsOwnerName: string;
    currentAssigneeName: string;
    currentAssigneeRole: WorkflowActorRole;
  };
  createdAt: string;
  updatedAt: string;

  // Bảo mật & Kiểm soát phiên bản
  isConfidentialExam: boolean;
  authorizedConfidentialRoles: WorkflowActorRole[];

  // Thông tin phục vụ Quản lý tiến độ Hồ sơ kiểm tra dành cho Ban Giám hiệu (Giai đoạn 16)
  departmentName?: string;
  dueDate?: string;
  hasMatrixDocument?: boolean;
  hasSpecificationDocument?: boolean;
  isTestDataset?: boolean;
  confidentialStemSample?: string;

  // Dữ liệu liên thông 9 Bước (có kiểm soát tham chiếu)
  step1QuestionBank: {
    selectedTopics: string[];
    approvedQuestionIds: string[];
    unapprovedQuestionBlockedCount: number;
    supplementaryQuestionsCreatedCount: number;
    coverageSatisfied: boolean;
    totalSelectedPoints: number;
  };
  step2MatrixAndSpec: {
    educationLevel: EducationLevelId;
    templateCode: string;
    totalQuestions: number;
    totalPoints: number;
    durationMinutes: number;
    levelDistributionSummary: string;
    learningOutcomesLinkedCount: number;
    isValidStructure: boolean;
    matrixApprovalStatus: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'INVALIDATED_BY_MATRIX_EDIT';
    matrixApprovedBy?: string;
    matrixApprovedAt?: string;
    matrixSignature: string;
  };
  step3ExamGeneration: {
    variantCodes: string[];
    questionIdsInExam: string[];
    answerKeyComplete: boolean;
    gradingGuideComplete: boolean;
    matchesApprovedMatrix: boolean;
    totalExamPoints: number;
  };
  step4AiQualityReview: {
    inspectedVersionId: string;
    inspectedAt?: string;
    criticalErrorsCount: number;
    highErrorsCount: number;
    mediumErrorsCount: number;
    lowErrorsCount: number;
    resolvedErrorsCount: number;
    overallDashboardStatusLabel: string;
    checked10Pillars: {
      curriculum: boolean;
      matrix: boolean;
      specification: boolean;
      questionContent: boolean;
      answerKey: boolean;
      gradingGuide: boolean;
      cognitiveLevel: boolean;
      points: boolean;
      language: boolean;
      formatting: boolean;
    };
  };
  step5TeacherRevision: {
    revisions: ExamWorkflowTeacherRevisionItem[];
    lastRevisionTriggeredMatrixReapproval: boolean;
    recheckedAffectedParts: boolean;
  };
  step6ProfessionalReview: {
    ballots: ExamWorkflowProfessionalReviewBallot[];
    latestDecision?: 'ELIGIBLE_FOR_APPROVAL' | 'REVISION_REQUIRED';
  };
  step7OfficialApproval: {
    approvalRecord?: ExamWorkflowOfficialApprovalRecord;
  };
  step8DossierExport: {
    exports: ExamWorkflowExportedPackageRecord[];
  };
  step9ResultsAnalysis: {
    analysisSummary?: ExamWorkflowResultsAnalysisSummary;
  };

  versionSnapshots: ExamWorkflowVersionSnapshot[];
  auditTrail: ExamWorkflowAuditLogEntry[];
}

export interface EndToEndWorkflowTestStepResult {
  stepOrder: number;
  stepTitle: string;
  workflowStepNumber: ExamWorkflowStepNumber;
  actorName: string;
  actorRole: WorkflowActorRole;
  fromState: ExamWorkflowState;
  toState: ExamWorkflowState;
  versionIdAfterStep: string;
  totalPointsVerified: number;
  backendPersisted: boolean;
  detailSummary: string;
  passed: boolean;
}

export interface EndToEndWorkflowInvariantCheck {
  code: string;
  title: string;
  expectedBehavior: string;
  actualVerificationResult: string;
  httpStatusOrGuardCode: string;
  passed: boolean;
}

export interface EndToEndWorkflowBenchmarkReport {
  executedAt: string;
  workflowId: string;
  workflowTitle: string;
  all10StepsPassed: boolean;
  all7InvariantsPassed: boolean;
  steps: EndToEndWorkflowTestStepResult[];
  invariants: EndToEndWorkflowInvariantCheck[];
}

// ============================================================================
// GIAI ĐOẠN 16 (TIẾP): TRANG "QUẢN LÝ TIẾN ĐỘ HỒ SƠ KIỂM TRA" DÀNH CHO BAN GIÁM HIỆU
// ============================================================================

export type DossierWarningCode =
  | 'OVERDUE'
  | 'MISSING_MATRIX'
  | 'MISSING_SPECIFICATION'
  | 'UNINSPECTED_BY_AI'
  | 'UNRESOLVED_CRITICAL_AI_ERROR'
  | 'UNREVIEWED'
  | 'UNAPPROVED'
  | 'MISSING_ANSWER_OR_RUBRIC';

export interface DossierAutoWarningItem {
  id: string;
  workflowId: string;
  gradeId: GradeNumber;
  subjectId: string;
  departmentName: string;
  teacherName: string;
  warningCode: DossierWarningCode;
  warningLabel: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  safeOverviewMessage: string; // Tuyệt đối không lộ nội dung đề mật
}

export interface PrincipalProgressAccountScope {
  accountId: string;
  fullName: string;
  role: WorkflowActorRole;
  roleTitle: string;
  assignedDepartments: string[] | 'ALL';
  assignedGrades: GradeNumber[] | 'ALL';
  canAssignReviewer: boolean;
  canRequestRevision: boolean;
  canExportProgressReport: boolean;
}

export interface DossierProgressStatistics {
  totalDossiers: number;
  buildingCount: number;
  awaitingReviewCount: number;
  revisionRequiredCount: number;
  awaitingApprovalCount: number;
  approvedCount: number;
  overdueCount: number;
}

export interface DossierProgressBenchmarkResult {
  executedAt: string;
  totalTestDossiersCreated: number;
  all7ChecksPassed: boolean;
  noFakeDataUsedAsOfficial: boolean;
  confidentialContentRedactedInOverview: boolean;
  checks: {
    order: number;
    category: string;
    expectedBehavior: string;
    actualVerification: string;
    passed: boolean;
  }[];
}

// ============================================================================
// GIAI ĐOẠN 16 (TIẾP): WORKFLOW VALIDATION ENGINE – BỘ KIỂM SOÁT ĐIỀU KIỆN CHUYỂN BƯỚC
// ============================================================================

export type WorkflowValidationGateId =
  | 'GATE_1_BEFORE_EXAM_GENERATION'
  | 'GATE_2_BEFORE_PROFESSIONAL_REVIEW'
  | 'GATE_3_BEFORE_OFFICIAL_APPROVAL'
  | 'GATE_4_BEFORE_RELEASE_EXPORT'
  | 'GATE_5_BEFORE_RESULTS_ANALYSIS';

export interface WorkflowValidationConditionItem {
  conditionCode: string;
  conditionTitle: string;
  passed: boolean;
  currentValueSummary: string;
  requiredRuleSummary: string;
  remediationLocationLabel: string; // Chỉ rõ vị trí cần xử lý
  targetMenuId: MenuSectionId; // Mở đúng màn hình cần bổ sung
  targetWorkflowStep: ExamWorkflowStepNumber; // Mở đúng bước trong quy trình 9 bước
}

export interface WorkflowValidationGateResult {
  gateId: WorkflowValidationGateId;
  gateTitle: string;
  fromStep: ExamWorkflowStepNumber;
  toStep: ExamWorkflowStepNumber;
  workflowId: string;
  evaluatedAt: string;
  evaluatedByBackend: boolean;
  httpStatus: number;
  allowedToProceed: boolean;
  draftDataPreserved: boolean;
  totalConditions: number;
  passedConditionsCount: number;
  failedConditionsCount: number;
  conditions: WorkflowValidationConditionItem[];
  blockingMessage: string;
}

export interface WorkflowValidationNegativeTestScenarioResult {
  scenarioOrder: number;
  scenarioCode: string;
  scenarioTitle: string;
  gateId: WorkflowValidationGateId;
  injectedViolationDescription: string;
  backendHttpStatus: number;
  blockedAtBackend: boolean;
  draftDataPreserved: boolean;
  failedConditionCodes: string[];
  remediationLocationShown: string;
  targetScreenButtonLabel: string;
  targetMenuId: MenuSectionId;
  detailMessage: string;
}

export interface WorkflowValidationEngineBenchmarkReport {
  executedAt: string;
  all5NegativeScenariosBlockedAtBackend: boolean;
  draftDataNeverLost: boolean;
  scenarios: WorkflowValidationNegativeTestScenarioResult[];
  configurableExceptions: {
    code: string;
    title: string;
    whenApplicable: string;
    requiredApproverRole: string;
    configKey: string;
    defaultSetting: string;
  }[];
}

// ============================================================================
// GIAI ĐOẠN 16 (TIẾP): WORKFLOW NOTIFICATION CENTER – TRUNG TÂM THÔNG BÁO & GIAO VIỆC TỰ ĐỘNG
// ============================================================================

export type WorkflowNotificationEventType =
  | 'MATRIX_SUBMITTED_FOR_REVIEW'      // 1. Giáo viên gửi ma trận thẩm định
  | 'MATRIX_REVISION_REQUESTED'        // 2. Ma trận được yêu cầu chỉnh sửa
  | 'MATRIX_APPROVED'                  // 3. Ma trận được phê duyệt
  | 'EXAM_DRAFT_COMPLETED'             // 4. Giáo viên hoàn thành bản nháp đề
  | 'AI_CRITICAL_ERROR_DETECTED'       // 5. AI phát hiện lỗi nghiêm trọng
  | 'EXAM_SUBMITTED_FOR_REVIEW'        // 6. Giáo viên gửi đề thẩm định
  | 'REVIEWER_ASSIGNED'                // 7. Người phản biện được phân công
  | 'REVIEWER_COMMENT_SUBMITTED'       // 8. Người phản biện gửi nhận xét
  | 'DOSSIER_RETURNED_FOR_REVISION'    // 9. Hồ sơ được trả lại để chỉnh sửa
  | 'DOSSIER_PENDING_APPROVAL'         // 10. Hồ sơ chờ phê duyệt
  | 'EXAM_APPROVED'                    // 11. Đề được phê duyệt
  | 'EXAM_RELEASED'                    // 12. Đề được phát hành
  | 'DOSSIER_OVERDUE'                  // 13. Hồ sơ quá hạn
  | 'NEW_TEST_RESULTS_AVAILABLE';      // 14. Có kết quả kiểm tra mới

export type WorkflowNotificationCategoryGroup =
  | 'MATRIX_GROUP'       // Nhóm Ma trận & Đặc tả (Sự kiện 1, 2, 3)
  | 'EXAM_AI_GROUP'      // Nhóm Soạn đề & Kiểm tra AI (Sự kiện 4, 5)
  | 'REVIEW_GROUP'       // Nhóm Thẩm định & Phản biện (Sự kiện 6, 7, 8, 9)
  | 'APPROVAL_GROUP'     // Nhóm Phê duyệt & Phát hành (Sự kiện 10, 11, 12)
  | 'ALERT_RESULT_GROUP';// Nhóm Cảnh báo Quá hạn & Kết quả (Sự kiện 13, 14)

export type WorkflowNotificationPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface NotificationDeliveryChannelState {
  inAppStatus: 'DELIVERED';
  emailStatus: 'QUEUED_PROVIDER_NOT_CONFIGURED' | 'DISABLED';
  pushStatus: 'QUEUED_PROVIDER_NOT_CONFIGURED' | 'DISABLED';
  honestyDisclosureNote: string; // Cam kết không tuyên bố đã gửi email khi chưa cấu hình dịch vụ thực tế
}

export interface WorkflowNotificationItem {
  notificationId: string;                     // Mã thông báo
  workflowId: string;                         // Mã hồ sơ
  dossierTitle: string;                       // Tên hồ sơ (không chứa nội dung đề mật)
  subjectId: string;                          // Môn học
  gradeId: GradeNumber;                       // Khối lớp
  departmentName: string;                     // Tổ chuyên môn
  senderType: 'USER' | 'SYSTEM';              // Người gửi hoặc hệ thống phát sinh
  senderUserId: string;
  senderName: string;
  senderRole: WorkflowActorRole | 'AI_ENGINE' | 'WORKFLOW_SCHEDULER';
  recipientUserId: string;                    // Người nhận
  recipientName: string;
  recipientRole: WorkflowActorRole;
  eventType: WorkflowNotificationEventType;   // Loại sự kiện (1..14)
  eventOrderNumber: number;                   // Số thứ tự loại sự kiện (1..14)
  categoryGroup: WorkflowNotificationCategoryGroup;
  title: string;                              // Tiêu đề
  content: string;                            // Nội dung (đã lọc bảo mật không lộ đề/đáp án)
  createdAt: string;                          // Thời gian
  isRead: boolean;                            // Trạng thái đã đọc/chưa đọc
  readAt?: string;
  priority: WorkflowNotificationPriority;     // Mức ưu tiên
  targetPath: {                               // Đường dẫn đến đúng hồ sơ
    menuId: MenuSectionId;
    workflowId: string;
    workflowStep: ExamWorkflowStepNumber;
    routeUri: string;
  };
  requiredAction: {                           // Hành động cần thực hiện
    actionCode: string;
    actionLabel: string;
    actionInstruction: string;
    dueDate: string;
  };
  securityMetadata: {
    containsConfidentialExamOrAnswer: false;  // Đảm bảo tuyệt đối = false
    redactedSnippetsCount: number;
    allowedActorRoles: WorkflowActorRole[];
    allowedUserIds: string[];
    allowedDepartments: string[];
  };
  idempotencyKey: string;                     // Chống tạo thông báo trùng khi xử lý lại sự kiện
  deliveryChannels: NotificationDeliveryChannelState;
}

export type MyAssignedTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED';

export interface MyAssignedTaskItem {
  taskId: string;
  notificationId: string;
  workflowId: string;
  dossierTitle: string;
  taskTitle: string;                          // Việc cần thực hiện
  actionInstruction: string;
  dueDate: string;                            // Hạn hoàn thành
  subjectId: string;                          // Môn học
  gradeId: GradeNumber;                       // Khối lớp
  departmentName: string;
  status: MyAssignedTaskStatus;               // Trạng thái
  assignedByUserId: string;                   // Người giao
  assignedByName: string;
  assignedByRoleLabel: string;
  assigneeUserId: string;
  assigneeName: string;
  assigneeRole: WorkflowActorRole;
  priority: WorkflowNotificationPriority;
  targetMenuId: MenuSectionId;
  targetWorkflowStep: ExamWorkflowStepNumber;
  createdAt: string;
  completedAt?: string;
}

export interface PrincipalNotificationDigestGroupItem {
  workflowId: string;
  dossierTitle: string;
  gradeId: GradeNumber;
  subjectId: string;
  departmentName: string;
  teacherName: string;
  currentStep: ExamWorkflowStepNumber;
  statusLabel: string;
  dueDate: string;
  detailSafeNote: string; // Không lộ đề kiểm tra mật hoặc đáp án
}

export interface PrincipalNotificationDigestSummary {
  generatedAt: string;
  pendingApprovalDossiers: PrincipalNotificationDigestGroupItem[];   // 1. Hồ sơ chờ phê duyệt
  overdueDossiers: PrincipalNotificationDigestGroupItem[];           // 2. Hồ sơ quá hạn
  criticalAiErrorDossiers: PrincipalNotificationDigestGroupItem[];   // 3. Hồ sơ có lỗi nghiêm trọng
  unreviewedDossiers: PrincipalNotificationDigestGroupItem[];        // 4. Hồ sơ chưa được thẩm định
  missingAnswerKeyDossiers: PrincipalNotificationDigestGroupItem[];  // 5. Hồ sơ thiếu đáp án
  completedDossiers: PrincipalNotificationDigestGroupItem[];         // 6. Hồ sơ đã hoàn thành
}

export interface NotificationBenchmarkStepRecord {
  stepOrder: number;
  actionName: string;
  eventEmitted: WorkflowNotificationEventType;
  notificationId: string;
  senderSummary: string;
  recipientSummary: string;
  titleGenerated: string;
  contentGenerated: string;
  taskStatusTransition: string;
  confidentialityVerified: boolean;
  deduplicationVerified: boolean;
  authorizedAccessHttpStatus: number;
  unauthorizedAccessHttpStatus: number;
  passed: boolean;
}

export interface WorkflowNotificationCenterBenchmarkReport {
  executedAt: string;
  testWorkflowId: string;
  testDossierTitle: string;
  all5LifecycleStepsPassed: boolean;
  idempotencyDeduplicationPassed: boolean;
  confidentialityScrubbingPassed: boolean;
  backendRbacEnforcementPassed: boolean;
  emailHonestyVerified: boolean;
  steps: NotificationBenchmarkStepRecord[];
}

// ============================================================================
// GIAI ĐOẠN 16 (TIẾP): EXECUTIVE DASHBOARD – BẢNG ĐIỀU KHIỂN QUẢN LÝ HỒ SƠ KIỂM TRA
// ============================================================================

export type ExecutiveSemesterCode = 'SEM_1' | 'SEM_2';

export type ExecutiveDatasetScopeMode =
  | 'REAL_SCHOOL_DATA_ONLY'      // Chỉ dữ liệu thực của nhà trường (Dùng cho Báo cáo chính thức)
  | 'SIMULATION_BENCHMARK_24';   // Bộ 24 hồ sơ giả lập đa trạng thái (Chỉ dùng cho Kiểm thử Mục VIII)

export interface ExecutiveDashboardFilterState {
  schoolId: string;
  academicYearId: string;        // 1. Năm học
  semester: ExecutiveSemesterCode | 'ALL'; // 2. Học kỳ
  examPeriod: 'MID_SEM_1' | 'END_SEM_1' | 'MID_SEM_2' | 'END_YEAR' | 'REGULAR' | 'ALL'; // 3. Kỳ kiểm tra
  gradeId: GradeNumber | 'ALL';  // 4. Khối lớp
  subjectId: string | 'ALL';     // 5. Môn học
  departmentName: string | 'ALL';// 6. Tổ chuyên môn
  teacherName: string | 'ALL';   // 7. Giáo viên
  statusCategory:
    | 'ALL'
    | 'BUILDING'
    | 'AWAITING_REVIEW'
    | 'REVISION_REQUIRED'
    | 'AWAITING_APPROVAL'
    | 'APPROVED'
    | 'OVERDUE'
    | 'UNRESOLVED_CRITICAL';     // 8. Trạng thái
}

export interface ExecutiveKpiCardsSummary {
  schoolId: string;
  academicYearId: string;
  datasetMode: ExecutiveDatasetScopeMode;
  totalDossiers: number;                     // 1. Tổng số hồ sơ
  buildingCount: number;                     // 2. Hồ sơ đang xây dựng
  awaitingReviewCount: number;               // 3. Hồ sơ chờ thẩm định
  revisionRequiredCount: number;             // 4. Hồ sơ yêu cầu chỉnh sửa
  awaitingApprovalCount: number;             // 5. Hồ sơ chờ phê duyệt
  approvedCount: number;                     // 6. Hồ sơ đã phê duyệt
  overdueCount: number;                      // 7. Hồ sơ quá hạn
  unresolvedCriticalErrorCount: number;      // 8. Hồ sơ có lỗi nghiêm trọng chưa xử lý
}

export type ExecutivePriorityAlertType =
  | 'OVERDUE_DOSSIER'                // 1. Hồ sơ quá hạn
  | 'UNASSIGNED_OWNER'               // 2. Hồ sơ chưa có người phụ trách
  | 'RETURNED_MULTIPLE_TIMES'        // 3. Hồ sơ bị trả lại nhiều lần
  | 'UNRESOLVED_CRITICAL_ERROR'      // 4. Hồ sơ có lỗi nghiêm trọng
  | 'UNAPPROVED_NEAR_EXAM_DATE';     // 5. Hồ sơ chưa được phê duyệt gần ngày kiểm tra

export interface ExecutivePriorityAlertItem {
  alertId: string;
  workflowId: string;
  dossierTitle: string;
  subjectId: string;
  gradeId: GradeNumber;
  departmentName: string;
  ownerName: string;
  alertType: ExecutivePriorityAlertType;
  alertTypeLabel: string;
  priorityRank: 1 | 2 | 3 | 4 | 5;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  detailReason: string;
  dueDate: string;
  examDate: string;
  recommendedAction: string;
}

export interface ExecutiveDashboardChartsData {
  // 1. Tiến độ theo tổ chuyên môn
  byDepartment: {
    departmentName: string;
    totalCount: number;
    completedCount: number;
    inProgressCount: number;
    overdueCount: number;
    completionPercent: number;
  }[];
  // 2. Tiến độ theo khối
  byGrade: {
    gradeId: GradeNumber;
    gradeLabel: string;
    totalCount: number;
    completedCount: number;
    inProgressCount: number;
    overdueCount: number;
    completionPercent: number;
  }[];
  // 3. Số hồ sơ theo trạng thái
  byStatus: {
    statusCode: string;
    statusLabel: string;
    count: number;
    percent: number;
  }[];
  // 4. Số lỗi chất lượng đề theo nhóm
  byQualityErrorGroup: {
    groupCode: string;
    groupLabel: string;
    criticalCount: number;
    highCount: number;
    mediumLowCount: number;
    totalCount: number;
  }[];
  // 5. Thời gian xử lý trung bình từng bước
  avgProcessingTimeByStep: {
    stepNumber: ExamWorkflowStepNumber;
    stepTitle: string;
    avgHours: number;
    slaTargetHours: number;
    isBottleneck: boolean;
  }[];
}

export interface ExecutiveDossierRowExtended {
  workflow: ExamWorkflow;
  semester: ExecutiveSemesterCode;
  returnedCount: number;             // Số lần bị trả lại chỉnh sửa
  isUnassignedOwner: boolean;        // Chưa có người phụ trách hiện tại
  isNearExamDateUnapproved: boolean; // Gần ngày kiểm tra (<= 3 ngày) chưa duyệt
  isOverdue: boolean;
  hasUnresolvedCriticalAiError: boolean;
  delayRootCause?: string;           // Nguyên nhân chậm tiến độ (nếu có dữ liệu)
  stepDurationsHours: Record<ExamWorkflowStepNumber, number>;
  errorCountsByGroup: {
    curriculumAndMatrix: number;
    questionAndCorpus: number;
    answerAndGrading: number;
    cognitiveLevel: number;
    languageAndFormat: number;
  };
}

export interface ExecutiveRolePermissionProfile {
  accountId: string;
  fullName: string;
  role: WorkflowActorRole;
  roleTitle: string;
  allowedDepartments: string[] | 'ALL';
  allowedGrades: GradeNumber[] | 'ALL';
  canViewAllSchool: boolean;
  canAssignOwnerOrReviewer: boolean;
  canSendInAppReminder: boolean;
  canRequestSupplement: boolean;
  canExportOfficialReport: boolean;
}

export interface ExecutiveDashboardBenchmarkReport {
  executedAt: string;
  simulatedDossiersCount: number; // >= 20 hồ sơ giả lập
  realOperationalDossiersCount: number;
  independentMathVerificationPassed: boolean;
  kpiComparisonTable: {
    metricName: string;
    dashboardEngineValue: number;
    independentLoopValue: number;
    matched: boolean;
  }[];
  roleRbacTests: {
    role: WorkflowActorRole;
    actorName: string;
    visibleDossiersCount: number;
    canAssignTestResult: string;
    bypassReviewDirectApproveBlockedAtBackend: boolean;
    backendHttpStatusForBypassAttempt: number;
    passed: boolean;
  }[];
  realVsSimulatedSeparationVerified: boolean;
}

// ============================================================================
// KIỂM THỬ TÍCH HỢP TOÀN HỆ THỐNG & NGHIỆM THU SAU GIAI ĐOẠN 16 (MỤC I -> VIII)
// ============================================================================

export type AcceptanceTestOutcomeStatus = 'ĐẠT' | 'KHÔNG ĐẠT' | 'CHƯA KIỂM THỬ';

export type AcceptanceTestDefectSeverity =
  | 'Không có lỗi'
  | 'Nghiêm trọng'
  | 'Cao'
  | 'Trung bình'
  | 'Thấp';

// VII. BÁO CÁO NGHIỆM THU (Bảng 9 cột bắt buộc)
export interface Stage16AcceptanceTestRow {
  testCode: string;                       // 1. Mã kiểm thử
  featureName: string;                    // 2. Chức năng
  precondition: string;                   // 3. Điều kiện đầu vào
  executionSteps: string;                 // 4. Các bước thực hiện
  expectedResult: string;                 // 5. Kết quả mong đợi
  actualResult: string;                   // 6. Kết quả thực tế
  status: AcceptanceTestOutcomeStatus;    // 7. Đạt / Không đạt / Chưa kiểm thử
  severity: AcceptanceTestDefectSeverity; // 8. Mức độ lỗi
  remediationGuide: string;               // 9. Hướng khắc phục
  sectionCategory:
    | 'II_HAPPY_PATH_9_STEPS'
    | 'III_NEGATIVE_SCENARIOS'
    | 'IV_DATA_INTEGRITY'
    | 'V_SECURITY_RBAC'
    | 'VI_EXPORT_ROUNDTRIP';
}

// II. KIỂM THỬ THÀNH CÔNG (Hồ sơ Toán lớp 4 thử nghiệm liên thông 9 bước)
export interface Stage16HappyPathCrossCheckItem {
  fieldOrder: number;
  fieldName: string; // Mã hồ sơ, Mã ma trận, Mã đề, Phiên bản, Trạng thái, Người phụ trách, Lịch sử xử lý, Dữ liệu kết quả
  initialValueAtStep1: string;
  intermediateTransitionSummary: string;
  finalValueAtStep9: string;
  matchedAcrossAll9Steps: boolean;
  verificationNote: string;
}

export interface Stage16HappyPathStepTrace {
  stepNumber: ExamWorkflowStepNumber;
  stepName: string;
  actorName: string;
  actorRole: WorkflowActorRole;
  workflowId: string;
  matrixId: string;
  examId: string;
  versionId: string;
  statusBefore: ExamWorkflowState;
  statusAfter: ExamWorkflowState;
  assigneeAfter: string;
  auditEntryId: string;
  keyOutputSummary: string;
  passed: boolean;
}

// III. KIỂM THỬ 10 TÌNH HUỐNG LỖI (Negative / Fault Injection)
export interface Stage16FaultScenarioResult {
  order: number;
  scenarioCode: string;
  scenarioTitle: string;
  faultInjected: string;
  backendHttpStatus: number;
  systemResponseSummary: string;
  draftOrStatePreserved: boolean;
  passed: boolean;
}

// IV. KIỂM TRA TÍNH TOÀN VẸN (7 tiêu chí bất biến)
export interface Stage16IntegrityCheckResult {
  order: number;
  invariantCode: string;
  invariantTitle: string;
  verificationMethod: string;
  evidenceSummary: string;
  passed: boolean;
}

// V. KIỂM TRA BẢO MẬT (6 tiêu chí bảo mật)
export interface Stage16SecurityCheckResult {
  order: number;
  securityCode: string;
  securityTitle: string;
  attackOrProbeSimulated: string;
  backendHttpStatus: number;
  defenseResultSummary: string;
  passed: boolean;
}

// VI. KIỂM TRA XUẤT HỒ SƠ & MỞ LẠI ĐỐI CHIẾU (Word, PDF, Excel, ZIP)
export interface Stage16ExportRoundtripCheckResult {
  formatCode: 'WORD_DOC' | 'PDF_HTML' | 'EXCEL_CSV' | 'ZIP_PACKAGE';
  formatLabel: string;
  generatedFileName: string;
  byteSize: number;
  reopenedAndParsedSuccessfully: boolean;
  matchedWorkflowId: boolean;
  matchedApprovedVersionId: boolean;
  matchedTotalPoints10: boolean;
  matchedAll10QuestionsAndAnswers: boolean;
  parsedExcerpt: string;
  passed: boolean;
}

// VIII. ĐIỀU KIỆN HOÀN THÀNH & DANH SÁCH VIỆC CÒN LẠI
export interface Stage16PilotReadinessCriterion {
  order: number;
  criterionTitle: string;
  requiredTarget: string;
  actualVerifiedEvidence: string;
  ready: boolean;
}

export interface Stage16RemainingBacklogItem {
  itemCode: string;
  category: 'INFRASTRUCTURE' | 'EXTERNAL_INTEGRATION' | 'OPERATIONAL_TRAINING' | 'ENHANCEMENT';
  title: string;
  currentStatusInStage16: string;
  actionRequiredForProductionScale: string;
  priority: 'CAO' | 'TRUNG BÌNH' | 'THẤP';
}

export interface Stage16FullAcceptanceReport {
  reportId: string;
  executedAt: string;
  testedDossierWorkflowId: string;
  testedDossierTitle: string;
  // I & II. Kiểm thử 9 bước thành công + 8 chỉ tiêu đối chiếu
  happyPathSteps: Stage16HappyPathStepTrace[];
  happyPathCrossChecks: Stage16HappyPathCrossCheckItem[];
  all9StepsConnected: boolean;
  // III. 10 tình huống lỗi
  faultScenarios: Stage16FaultScenarioResult[];
  all10FaultScenariosHandled: boolean;
  // IV. 7 tiêu chí toàn vẹn dữ liệu
  integrityChecks: Stage16IntegrityCheckResult[];
  all7IntegrityChecksPassed: boolean;
  // V. 6 tiêu chí bảo mật
  securityChecks: Stage16SecurityCheckResult[];
  all6SecurityChecksPassed: boolean;
  // VI. 4 định dạng xuất hồ sơ & mở lại đối chiếu
  exportRoundtripChecks: Stage16ExportRoundtripCheckResult[];
  all4ExportFormatsVerified: boolean;
  // VII. Bảng báo cáo nghiệm thu 9 cột
  acceptanceTableRows: Stage16AcceptanceTestRow[];
  summaryCounts: {
    totalTestCases: number;
    passedCount: number;
    failedCount: number;
    untestedCount: number;
    criticalDefectsCount: number;
  };
  // VIII. Đánh giá 7 điều kiện triển khai thử nghiệm & Danh sách việc còn lại
  pilotReadinessCriteria: Stage16PilotReadinessCriterion[];
  isReadyForPilotDeployment: boolean;
  pilotConclusionStatement: string;
  remainingBacklogItems: Stage16RemainingBacklogItem[];
}

// ============================================================================
// GIAI ĐOẠN ĐĂNG NHẬP, XÁC THỰC AN TOÀN & ĐIỀU HƯỚNG THEO VAI TRÒ (MỤC I -> V)
// ============================================================================

export type AuthNoticeCode =
  | 'INVALID_CREDENTIALS'        // 1. Sai thông tin đăng nhập (không lộ tài khoản có tồn tại hay không)
  | 'ACCOUNT_NOT_ACTIVATED'      // 2. Tài khoản chưa được kích hoạt
  | 'ACCOUNT_DISABLED'           // 3. Tài khoản bị vô hiệu hóa / khóa
  | 'NO_ACCESS_PERMISSION'       // 4. Không có quyền truy cập
  | 'NETWORK_DISCONNECTED'       // 5. Mất kết nối mạng
  | 'PASSWORD_RESET_REQUESTED'   // Thông báo quên mật khẩu an toàn
  | 'PROTECTED_ROUTE_REQUIRED';  // Cảnh báo khi truy cập đường dẫn bảo vệ lúc chưa đăng nhập

export type MultiRoleResolutionPolicy =
  | 'SELECT_WORKING_ROLE'        // Cho phép chọn vai trò làm việc hiện hành
  | 'COMBINED_PERMISSIONS';      // Xác định quyền tổng hợp theo chính sách đã cấu hình

export interface SchoolBrandingConfig {
  schoolId: string;
  softwareTitle: string;         // EDU TEST AI
  softwareSubtitle: string;      // NGÂN HÀNG ĐỀ KIỂM TRA THÔNG MINH
  schoolName: string;            // TRƯỜNG TIỂU HỌC VÀ TRUNG HỌC CƠ SỞ NGUYỄN ĐÌNH ANH
  governingBody: string;         // UBND XÃ ĐAN ĐIỀN
  academicYear: string;          // 2026 - 2027
  logoUrl: string;               // URL hoặc SVG Data URI logo trường
  multiRolePolicy: MultiRoleResolutionPolicy;
  updatedAt: string;
  updatedBy: string;
}

export interface AuthenticatedUserSession {
  sessionToken: string;
  issuedAt: string;
  expiresAt: string;
  rememberMe: boolean;
  authProvider: 'FIREBASE_OR_PBKDF2_BACKEND' | 'FIREBASE_GOOGLE_DIRECT';
  usernameMappedSafelyAtBackend: boolean;
  user: {
    id: string;
    schoolId: string;
    username: string;
    email: string;
    fullName: string;
    roles: WorkflowActorRole[];
    activeRole: WorkflowActorRole;
    multiRoleMode: MultiRoleResolutionPolicy;
    combinedPermissions: string[];
    departmentName: string;
    assignedSubjects: string[];
    assignedGrades: GradeNumber[];
    positionTitle?: string;
    status: 'ACTIVE' | 'UNACTIVATED' | 'DISABLED' | 'LOCKED';
  };
  landingNavigation: {
    role: WorkflowActorRole;
    roleDisplayName: string;
    targetMenuId: MenuSectionId;
    targetPageTitle: string;
    routePath: string;
  };
}

export interface SchoolStaffDirectoryEntry {
  orderNumber: number;
  id: string;
  schoolId: string;
  fullName: string;
  email: string;
  username: string;
  departmentName: string;
  subjectName: string;
  positionTitle: 'Phó hiệu trưởng' | 'Tổ trưởng' | 'Tổ phó' | 'Giáo viên';
  roles: WorkflowActorRole[];
  assignedGrades: GradeNumber[];
  status: 'ACTIVE';
  statusLabel: 'Hoạt động';
  passwordHashAlgorithm: string;
  passwordHashPreview: string;
}

export interface AuthVerificationScenarioResult {
  order: number;
  scenarioCode:
    | 'TEST_1_VALID_LOGIN'
    | 'TEST_2_INVALID_LOGIN_NO_ENUMERATION'
    | 'TEST_3_FORGOT_PASSWORD_SAFE'
    | 'TEST_4_LOGOUT_SESSION_REVOKED'
    | 'TEST_5_PAGE_RELOAD_PERSISTENCE'
    | 'TEST_6_LOCKED_UNACTIVATED_NO_ACCESS'
    | 'TEST_7_PROTECTED_ROUTE_GUARD';
  scenarioTitle: string;
  inputDescription: string;
  expectedBehavior: string;
  actualBackendResponse: string;
  httpStatus: number;
  noAccountExistenceLeaked: boolean;
  noPlaintextPasswordStored: boolean;
  passed: boolean;
}

export interface AuthVerificationSuiteReport {
  executedAt: string;
  all7ScenariosPassed: boolean;
  zeroHardcodedFrontendCredentialsVerified: boolean;
  zeroPlaintextPasswordsInDbVerified: boolean;
  roleRoutingVerified: {
    roleCode: WorkflowActorRole;
    roleLabel: string;
    targetMenuId: MenuSectionId;
    targetPageLabel: string;
  }[];
  scenarios: AuthVerificationScenarioResult[];
}

// ============================================================================
// GIAO DIỆN LÀM VIỆC THEO VAI TRÒ & QUYỀN NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP (MỤC I -> VII)
// ============================================================================

export interface RoleScopedMenuItem {
  id: MenuSectionId;
  orderNumber: string;
  label: string;
  roleGroup: 'TEACHER_CORE' | 'HEAD_OF_DEPARTMENT_EXT' | 'BGH_EXT' | 'ADMIN_EXT';
  description: string;
}

export interface TeacherUpcomingTaskItem {
  id: string;
  dossierCode: string;
  title: string;
  subject: string;
  grade: number;
  dueDate: string;
  daysRemaining: number;
  statusLabel: string;
  targetMenuId: MenuSectionId;
}

export interface RoleWorkspaceContextPayload {
  verifiedAtBackend: boolean;
  evaluatedAt: string;
  actor: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    schoolId: string;
    schoolName: string;
    departmentName: string;
    positionTitle: string;
    assignedSubjects: string[];
    assignedGrades: number[];
    grantedRoles: WorkflowActorRole[];
    activeRole: WorkflowActorRole;
    activeRoleDisplayName: string;
    delegatedApprovalAuthority: boolean;
    hasSecretExamProfessionalClearance: boolean;
  };
  allowedMenus: RoleScopedMenuItem[];
  allowedUiCapabilities: {
    canViewCurriculum: boolean;
    canCreateAndEditOwnQuestion: boolean;
    canBuildMatrixAndExam: boolean;
    canRunAiQualityCheck: boolean;
    canSubmitForReview: boolean;
    canViewDepartmentDossiers: boolean;
    canAssignPeerReviewer: boolean;
    canReviewDepartmentExam: boolean;
    canViewSchoolWideDossiers: boolean;
    canAssignExamCreation: boolean;
    canApproveOfficialExam: boolean;
    canManageAccountsAndRoles: boolean;
    canConfigureSchoolAndYear: boolean;
    canViewAuditAndBackup: boolean;
  };
  hiddenUnauthorizedActions: string[];
  teacherHomeMetrics: {
    createdQuestionsCount: number;
    examsInProgressCount: number;
    pendingReviewDossiersCount: number;
    revisionRequiredDossiersCount: number;
    approvedDossiersCount: number;
    upcomingTasks: TeacherUpcomingTaskItem[];
  };
  departmentHeadMetrics?: {
    departmentName: string;
    totalDepartmentDossiers: number;
    pendingPeerReviewAssignments: number;
    pendingDepartmentAppraisals: number;
    completedOnTimePercent: number;
    departmentDossiers: {
      code: string;
      title: string;
      subject: string;
      grade: number;
      authorName: string;
      reviewerName: string;
      status: string;
      dueDate: string;
    }[];
  };
  bghMetrics?: {
    scopeTitle: string;
    totalManagedDossiers: number;
    assignedExamTasksCount: number;
    pendingBghApprovalsCount: number;
    approvedAndPublishedCount: number;
    averageQualityScore: number;
    managedDossiers: {
      code: string;
      title: string;
      departmentName: string;
      subject: string;
      grade: number;
      authorName: string;
      aiStatus: string;
      appraisalStatus: string;
      approvalStatus: string;
      dueDate: string;
    }[];
  };
  adminMetrics?: {
    totalAccounts: number;
    activeAccounts: number;
    lockedOrDisabledAccounts: number;
    configuredRolesCount: number;
    schoolCode: string;
    academicYear: string;
    totalAuditLogs: number;
    deniedAuditLogsCount: number;
    totalBackups: number;
  };
}

export interface RoleWorkspaceTestScenarioResult {
  order: number;
  roleCode: WorkflowActorRole;
  roleTitle: string;
  accountTested: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    schoolId: string;
    departmentName: string;
    subjects: string[];
    grades: number[];
    grantedRoles: WorkflowActorRole[];
  };
  menuCount: number;
  menuLabels: string[];
  unauthorizedMenusHidden: boolean;
  unauthorizedActionsHiddenAndBlockedAtBackend: boolean;
  scopedDataSummary: string;
  defaultLandingMenuId: MenuSectionId;
  multiRoleSwitchVerified: boolean;
  unsavedFormProtectionVerified: boolean;
  backendForbiddenProbeResult: string;
  passed: boolean;
}

export interface RoleWorkspaceVerificationReport {
  runId: string;
  executedAt: string;
  all5RolesPassed: boolean;
  rolesTestedCount: number;
  passedCount: number;
  scenarios: RoleWorkspaceTestScenarioResult[];
}

// ============================================================================
// MODULE QUẢN TRỊ VIÊN PHÂN QUYỀN GIÁO VIÊN BẰNG Ô CHỌN & CÔNG TẮC BẬT/TẮT (MỤC I -> XI)
// ============================================================================

export type TeacherFunctionalPermissionCode =
  | 'VIEW_CURRICULUM' // 1. Xem chương trình giáo dục
  | 'VIEW_QUESTION_BANK' // 2. Xem ngân hàng câu hỏi
  | 'CREATE_QUESTION' // 3. Tạo câu hỏi
  | 'EDIT_QUESTION' // 4. Chỉnh sửa câu hỏi
  | 'DELETE_DRAFT_QUESTION' // 5. Xóa câu hỏi bản nháp
  | 'USE_AI_QUESTION_GENERATOR' // 6. Sử dụng AI tạo câu hỏi
  | 'CREATE_EXAM_MATRIX' // 7. Tạo ma trận đề
  | 'CREATE_EXAM_SPECIFICATION' // 8. Tạo bản đặc tả
  | 'CREATE_EXAM_PAPER' // 9. Tạo đề kiểm tra
  | 'GENERATE_MULTI_EXAM_CODES' // 10. Tạo nhiều mã đề
  | 'USE_AI_QUALITY_REVIEW' // 11. Sử dụng AI kiểm tra chất lượng
  | 'EDIT_EXAM_PAPER' // 12. Chỉnh sửa đề
  | 'SUBMIT_FOR_APPRAISAL' // 13. Gửi thẩm định
  | 'APPRAISE_EXAM' // 14. Thẩm định đề (Nhạy cảm)
  | 'APPROVE_EXAM' // 15. Phê duyệt đề (Nhạy cảm)
  | 'EXPORT_EXAM_WORD_PDF' // 16. Xuất đề Word/PDF
  | 'EXPORT_ANSWER_KEY_RUBRIC' // 17. Xuất đáp án và hướng dẫn chấm (Nhạy cảm)
  | 'VIEW_RESULT_REPORTS' // 18. Xem báo cáo kết quả
  | 'ANALYZE_QUESTION_QUALITY' // 19. Phân tích chất lượng câu hỏi
  | 'MANAGE_DEPARTMENT_QUESTION_BANK'; // 20. Quản lý ngân hàng câu hỏi của tổ (Nhạy cảm)

export type SubjectAssessmentMode =
  | 'PAPER_EXAM' // Tổ chức kiểm tra định kỳ bằng đề giấy
  | 'COMMENT_AND_PRACTICE' // Đánh giá bằng nhận xét / Thực hành / Sản phẩm học tập
  | 'HYBRID_PAPER_PRACTICE'; // Kết hợp đề giấy và bài thực hành / dự án

export interface SchoolCurriculumSubjectCatalogItem {
  subjectId: string;
  subjectName: string;
  educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY';
  educationLevelName: string;
  allowedGrades: number[];
  isElectiveOrSupplementary: boolean;
  defaultAssessmentMode: SubjectAssessmentMode;
  assessmentNote: string;
}

export interface FunctionalPermissionCatalogItem {
  code: TeacherFunctionalPermissionCode;
  order: number;
  label: string;
  category: 'CURRICULUM_BANK' | 'MATRIX_EXAM' | 'APPRAISAL_APPROVAL' | 'EXPORT_ANALYTICS';
  isSensitive: boolean;
  requiredRolesForSensitive?: WorkflowActorRole[];
  sensitiveReason?: string;
}

// Bản ghi chuẩn hóa trong cơ sở dữ liệu thực (Mục VIII)
export interface NormalizedTeacherPermissionRecord {
  id: string;
  UserId: string;
  SchoolId: string;
  RoleId: WorkflowActorRole;
  EducationLevelId: 'PRIMARY' | 'LOWER_SECONDARY';
  GradeId: number;
  SubjectId: string;
  SubjectName: string;
  AssessmentMode: SubjectAssessmentMode;
  PermissionCodes: TeacherFunctionalPermissionCode[];
  GrantedBy: string;
  GrantedAt: string;
  UpdatedAt: string;
  Status: 'ACTIVE' | 'REVOKED';
}

export interface TeacherSubjectGradeAllocation {
  subjectId: string;
  subjectName: string;
  educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY';
  grades: number[];
  assessmentMode: SubjectAssessmentMode;
}

export interface TeacherPermissionProfileSummary {
  userId: string;
  schoolId: string;
  fullName: string;
  username: string;
  email: string;
  departmentName: string;
  positionTitle: string;
  roles: WorkflowActorRole[];
  activeRole: WorkflowActorRole;
  accountStatus: 'ACTIVE' | 'LOCKED' | 'DISABLED' | 'UNACTIVATED';
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
  subjectAllocations: TeacherSubjectGradeAllocation[];
  permissionCodes: TeacherFunctionalPermissionCode[];
  normalizedRecords: NormalizedTeacherPermissionRecord[];
  activeWorkItemsCount: number;
  activeWorkItemsSummary: string[];
  grantedBy: string;
  grantedAt: string;
  updatedAt: string;
}

export interface TeacherPermissionVerificationScenario {
  order: number;
  criterionTitle: string;
  targetAccountLabel: string;
  expectedBehavior: string;
  actualVerificationDetail: string;
  httpStatus: number;
  passed: boolean;
}

export interface TeacherPermissionVerificationSuiteReport {
  runId: string;
  executedAt: string;
  all8CriteriaPassed: boolean;
  testAccountsSummary: {
    teacherA: {
      userId: string;
      fullName: string;
      combinations: string[];
      permissionCodes: TeacherFunctionalPermissionCode[];
      canApprove: boolean;
    };
    teacherB: {
      userId: string;
      fullName: string;
      combinations: string[];
      permissionCodes: TeacherFunctionalPermissionCode[];
      canAppraise: boolean;
    };
    teacherC: {
      userId: string;
      fullName: string;
      combinations: string[];
      permissionCodes: TeacherFunctionalPermissionCode[];
      canAppraiseAssigned: boolean;
    };
  };
  criteriaResults: TeacherPermissionVerificationScenario[];
}

// ============================================================================
// PHÂN QUYỀN HÀNG LOẠT CHO GIÁO VIÊN (BULK TEACHER PERMISSION MANAGEMENT)
// ============================================================================

export type BulkPermissionOperationMode =
  | 'ADD_KEEP_EXISTING' // Chế độ 1: Bổ sung quyền được chọn, giữ nguyên quyền khác
  | 'REVOKE_SELECTED';  // Chế độ 2: Thu hồi các quyền được chọn

export interface BulkTeacherPermissionChangeItem {
  userId: string;
  fullName: string;
  username: string;
  departmentName: string;
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
  mode: BulkPermissionOperationMode;
  addedPermissions: TeacherFunctionalPermissionCode[];
  revokedPermissions: TeacherFunctionalPermissionCode[];
  addedSubjectsSummary: string[];
  revokedSubjectsSummary: string[];
  skippedMismatchedLevelNotes: string[];
  totalPermissionsAfter: number;
}

export interface BulkTeacherPermissionFailureItem {
  userId: string;
  fullName: string;
  username: string;
  departmentName: string;
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
  reason: string;
  errorCode: string;
}

export interface BulkTeacherPermissionAuditLogEntry {
  id: string;
  executedAt: string;
  actorUserId: string;
  actorName: string;
  mode: BulkPermissionOperationMode;
  selectedTeacherCount: number;
  successCount: number;
  failureCount: number;
  requestedPermissions: TeacherFunctionalPermissionCode[];
  requestedSubjectsSummary: string[];
  summary: string;
}

export interface BulkTeacherPermissionExecutionReport {
  batchId: string;
  executedAt: string;
  actorUserId: string;
  actorName: string;
  mode: BulkPermissionOperationMode;
  totalSelectedCount: number;
  successCount: number;
  failureCount: number;
  changes: BulkTeacherPermissionChangeItem[];
  failures: BulkTeacherPermissionFailureItem[];
  auditLogEntry: BulkTeacherPermissionAuditLogEntry;
  updatedProfiles: TeacherPermissionProfileSummary[];
}

export interface BulkTeacherPermission10TeachersTestReport {
  runId: string;
  executedAt: string;
  actorName: string;
  totalTestTeachers: number;
  primaryTeachersCount: number;
  lowerSecondaryTeachersCount: number;
  departmentsCovered: string[];
  step1AddCorePermissionsReport: BulkTeacherPermissionExecutionReport;
  step2CrossLevelSubjectGuardReport: BulkTeacherPermissionExecutionReport;
  step3RevokeSpecificPermissionReport: BulkTeacherPermissionExecutionReport;
  step4SensitiveRoleGuardReport: BulkTeacherPermissionExecutionReport;
  allChecksPassed: boolean;
}

// ============================================================================
// KIỂM THỬ TOÀN DIỆN & BẢO MẬT PHÂN QUYỀN TRỰC QUAN (MỤC I -> VII)
// ============================================================================

export type QaTestVerdict = 'ĐẠT' | 'KHÔNG ĐẠT' | 'CHƯA KIỂM THỬ';

export interface VisualPermissionQaTestCaseRow {
  testCode: string; // 1. Mã kiểm thử
  sectionGroup:
    | 'I. GIAO DIỆN QUẢN TRỊ'
    | 'II. QUYỀN TẠO ĐỀ (GV A, B, C)'
    | 'III. ĐỒNG BỘ QUYỀN TỨC THỜI'
    | 'IV. KIỂM TRA BẢO MẬT BACKEND'
    | 'V. KIỂM TRA TÍNH TOÀN VẸN DỮ LIỆU'
    | 'VI. PHÂN QUYỀN HÀNG LOẠT (10 GV)';
  accountLabel: string; // 2. Tài khoản
  grantedPermissionsSummary: string; // 3. Quyền được cấp
  operationPerformed: string; // 4. Thao tác
  expectedResult: string; // 5. Kết quả mong đợi
  actualResult: string; // 6. Kết quả thực tế
  httpStatus: number;
  verdict: QaTestVerdict; // 7. Đạt/Không đạt/Chưa kiểm thử
  defectFound: string; // 8. Lỗi phát hiện
  remediationApplied: string; // 9. Phương án khắc phục
}

export interface VisualPermissionFullQaAuditReport {
  runId: string;
  executedAt: string;
  totalCases: number;
  passedCount: number;
  failedCount: number;
  untestedCount: number;
  allPassed: boolean;
  rows: VisualPermissionQaTestCaseRow[];
}

// ============================================================================
// MẪU PHÂN QUYỀN GIÁO VIÊN (TEACHER PERMISSION TEMPLATES - MỤC I -> VI)
// ============================================================================

export type TeacherPermissionTemplateCategoryCode =
  | 'SUBJECT_TEACHER'          // 1. Giáo viên bộ môn
  | 'HOMEROOM_TEACHER'         // 2. Giáo viên chủ nhiệm
  | 'HEAD_OF_DEPARTMENT'       // 3. Tổ trưởng chuyên môn
  | 'REVIEWER_TEACHER'         // 4. Giáo viên phản biện
  | 'VICE_PRINCIPAL_ACADEMIC'  // 5. Phó hiệu trưởng chuyên môn
  | 'PRINCIPAL'                // 6. Hiệu trưởng
  | 'CUSTOM_TEMPLATE';         // Mẫu tùy chỉnh do Quản trị viên tạo

export interface TeacherPermissionTemplate {
  templateId: string;
  templateCode: TeacherPermissionTemplateCategoryCode;
  templateName: string; // Tên mẫu
  description: string; // Mô tả
  functionalPermissionCodes: TeacherFunctionalPermissionCode[]; // Danh sách quyền chức năng chuẩn
  sensitiveConfirmationPermissions: TeacherFunctionalPermissionCode[]; // Các quyền nhạy cảm cần xác nhận riêng
  recommendedRoleCodes: WorkflowActorRole[];
  hasHardcodedSubjects: false; // Không gắn cứng môn học vào mẫu quyền chung
  subjectAllocationPolicyNote: string; // Môn học và khối lớp phải được cấp riêng theo phân công thực tế
  status: 'ACTIVE' | 'INACTIVE'; // Trạng thái
  createdBy: string; // Người tạo
  createdAt: string;
  updatedAt: string; // Ngày cập nhật
  isSystemPreset?: boolean;
}

export interface TeacherPermissionTemplateApplyPreview {
  template: TeacherPermissionTemplate;
  targetUserId: string;
  targetFullName: string;
  targetUsername: string;
  targetRoles: WorkflowActorRole[];
  preservedEducationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
  preservedSubjectAllocations: TeacherSubjectGradeAllocation[];
  standardPermissionsToApply: TeacherFunctionalPermissionCode[];
  sensitivePermissionsRequiringConfirmation: Array<{
    code: TeacherFunctionalPermissionCode;
    label: string;
    hasRoleAuthority: boolean;
    authorityReason: string;
    autoGrantedByDefault: false; // Không bao giờ tự động cấp khi chưa xác nhận & đủ thẩm quyền
  }>;
  blockedConfidentialOrApprovalReasons: string[];
}

export interface TeacherPermissionTemplateQaStepResult {
  stepNumber: number;
  stepTitle: string;
  actionPerformed: string;
  expectedOutcome: string;
  actualOutcome: string;
  templateUnchangedVerified: boolean;
  passed: boolean;
}

export interface TeacherPermissionTemplateQaSuiteReport {
  runId: string;
  executedAt: string;
  createdTemplate: TeacherPermissionTemplate;
  teacher1AfterApply: {
    userId: string;
    fullName: string;
    subjectsSummary: string[];
    permissionsCount: number;
    permissionCodes: TeacherFunctionalPermissionCode[];
  };
  teacher2AfterApply: {
    userId: string;
    fullName: string;
    subjectsSummary: string[];
    permissionsCount: number;
    permissionCodes: TeacherFunctionalPermissionCode[];
  };
  teacher1AfterCustomEditAndRevoke: {
    userId: string;
    fullName: string;
    addedPermission: TeacherFunctionalPermissionCode;
    revokedPermission: TeacherFunctionalPermissionCode;
    finalPermissionCodes: TeacherFunctionalPermissionCode[];
  };
  originalTemplateIntegrityCheck: {
    templateId: string;
    templateName: string;
    originalPermissionsCount: number;
    afterTeacherEditPermissionsCount: number;
    isUnchanged: boolean;
  };
  reloginVerification: {
    userId: string;
    username: string;
    reloginHttpStatus: number;
    persistedPermissionsMatch: boolean;
    persistedSubjectsMatch: boolean;
    autoGrantedApprovalOrSecretAccess: boolean;
  };
  steps: TeacherPermissionTemplateQaStepResult[];
  allStepsPassed: boolean;
}

// ============================================================================
// MODULE QUẢN LÝ TÀI KHOẢN GIÁO VIÊN (TEACHER ACCOUNT MANAGEMENT - MỤC I -> X)
// ============================================================================

export type TeacherAccountLifecycleStatus =
  | 'UNACTIVATED' // 1. Chưa kích hoạt
  | 'ACTIVE'      // 2. Đang hoạt động
  | 'LOCKED'      // 3. Tạm khóa
  | 'DISABLED';   // 4. Đã vô hiệu hóa

export type TeacherPasswordSetupMethod =
  | 'SEND_RESET_LINK'            // Ưu tiên: Gửi liên kết thiết lập/đặt lại mật khẩu
  | 'ADMIN_SET_INITIAL_PASSWORD'; // Đặt mật khẩu ban đầu qua Backend (PBKDF2), không lộ plaintext

export interface TeacherAccountRecord {
  id: string; // ID ổn định duy nhất (bất biến, không dùng email làm khóa chính)
  schoolId: string;
  stt: number; // 1. STT
  teacherCode?: string;
  positionTitle?: string;
  contactPhone?: string;
  fullName: string; // 2. Họ và tên
  email: string; // 3. Tên đăng nhập (email)
  username: string;
  departmentName: string; // 4. Tổ chuyên môn
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[]; // 5. Cấp học (Tiểu học / THCS)
  subjectAllocations: TeacherSubjectGradeAllocation[]; // 6. Môn giảng dạy & 7. Khối lớp theo cấp học
  assignedSubjectsDisplay: string[];
  assignedGradesDisplay: number[];
  roles: WorkflowActorRole[]; // 8. Vai trò
  status: TeacherAccountLifecycleStatus; // 9. Trạng thái
  lastLoginAt: string | null; // 10. Lần đăng nhập gần nhất
  notes: string; // Ghi chú
  mustChangePasswordOnNextLogin: boolean;
  passwordSetupMethod?: TeacherPasswordSetupMethod;
  lastPasswordResetLinkSentAt?: string | null;
  grantedPermissionsCount: number;
  grantedPermissionCodes: TeacherFunctionalPermissionCode[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateTeacherAccountPayload {
  adminUserId?: string;
  fullName: string;
  email: string;
  passwordSetupMethod?: TeacherPasswordSetupMethod;
  initialPassword?: string;
  confirmPassword?: string;
  mustChangePasswordOnNextLogin?: boolean;
  departmentName: string;
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[];
  subjectAllocations: TeacherSubjectGradeAllocation[];
  roles: WorkflowActorRole[];
  status: TeacherAccountLifecycleStatus;
  notes?: string;
}

export interface TeacherAccountQaTestCaseRow {
  stepOrder: number; // 1 -> 12
  testCode: string;
  scenarioTitle: string;
  inputSummary: string;
  expectedOutcome: string;
  actualOutcome: string;
  httpStatus: number;
  passed: boolean;
  securityNote: string;
}

export interface TeacherAccountManagementQaReport {
  runId: string;
  executedAt: string;
  actorName: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  allPassed: boolean;
  rows: TeacherAccountQaTestCaseRow[];
}

export interface TeacherAccountDeleteImpactPreview {
  userId: string;
  fullName: string;
  email: string;
  departmentName: string;
  roles: WorkflowActorRole[];
  status: TeacherAccountLifecycleStatus;
  activeGrantsCount: number;
  authoredDossiersCount: number;
  approvedDossiersCount: number;
  assignedReviewsCount: number;
  isSystemProtectedAccount: boolean;
  canDelete: boolean;
  blockReason?: string;
  warningMessages: string[];
}

// ============================================================================
// MODULE QUẢN LÝ TỔ CHUYÊN MÔN VÀ PHÂN CÔNG GIẢNG DẠY (MỤC I -> VII)
// ============================================================================

export type SchoolDepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface SchoolDepartmentMemberSummary {
  userId: string;
  fullName: string;
  email: string;
  username: string;
  roles: WorkflowActorRole[];
  assignedSubjectsDisplay: string[];
  assignedGradesDisplay: number[];
  status: TeacherAccountLifecycleStatus;
}

export interface SchoolDepartmentRecord {
  id: string;
  schoolId: string;
  departmentCode: string; // Mã tổ (VD: TO-123, TO-KHTN)
  departmentName: string; // Tên tổ
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[]; // Cấp học
  headUserId: string | null; // Tổ trưởng
  headFullName: string | null;
  deputyUserId: string | null; // Tổ phó nếu có
  deputyFullName: string | null;
  memberUserIds: string[]; // Danh sách ID thành viên
  members: SchoolDepartmentMemberSummary[]; // Danh sách thành viên chi tiết
  status: SchoolDepartmentStatus; // Trạng thái (ACTIVE / INACTIVE)
  description?: string;
  isCoreSystemDepartment?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TeachingProfessionalRoleCode =
  | 'SUBJECT_TEACHER' // Giáo viên bộ môn
  | 'HOMEROOM_TEACHER' // Giáo viên chủ nhiệm
  | 'HEAD_OF_DEPARTMENT' // Tổ trưởng chuyên môn
  | 'DEPUTY_HEAD_OF_DEPARTMENT' // Tổ phó chuyên môn
  | 'CORE_REVIEWER'; // Giáo viên cốt cán / Phản biện

export type TeachingAssignmentLifecycleStatus =
  | 'ACTIVE' // Đang áp dụng trong năm học
  | 'DRAFT' // Bản nháp (VD: Sao chép sang năm học mới chờ điều chỉnh)
  | 'ARCHIVED' // Lưu trữ năm học cũ
  | 'INACTIVE'; // Ngừng phân công

export interface TeachingAssignmentRecord {
  id: string;
  schoolId: string;
  academicYear: string; // Năm học (VD: 2025-2026, 2026-2027)
  teacherUserId: string; // Giáo viên ID
  teacherFullName: string;
  teacherEmail: string;
  departmentId: string;
  departmentName: string;
  educationLevelId: 'PRIMARY' | 'LOWER_SECONDARY'; // Cấp học
  grades: number[]; // Khối lớp (1..5 hoặc 6..9)
  subjectId: string; // Mã môn học từ chương trình
  subjectName: string; // Tên môn học
  assignedClasses: string[]; // Lớp được phân công nếu có (VD: ['6A1', '6A2'])
  professionalRole: TeachingProfessionalRoleCode; // Vai trò chuyên môn
  status: TeachingAssignmentLifecycleStatus; // Trạng thái phân công
  notes?: string;
  copiedFromAssignmentId?: string | null;
  copiedFromAcademicYear?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeachingAssignmentPermissionProposal {
  teacherUserId: string;
  teacherFullName: string;
  teacherEmail: string;
  departmentName: string;
  academicYear: string;
  activeAssignments: TeachingAssignmentRecord[];
  proposedSubjectAllocations: TeacherSubjectGradeAllocation[];
  currentPermissionCodes: TeacherFunctionalPermissionCode[];
  proposedPermissionCodes: TeacherFunctionalPermissionCode[];
  blockedAutoSensitivePermissions: TeacherFunctionalPermissionCode[];
  securitySeparationNote: string;
}

export interface DepartmentAndAssignmentQaRow {
  testCode: string;
  stepNumber: number;
  featureName: string;
  inputData: string;
  expectedOutcome: string;
  actualOutcome: string;
  status: 'Đạt' | 'Không đạt';
  securityNote: string;
}

export interface DepartmentAndAssignmentQaReport {
  runId: string;
  executedAt: string;
  actorName: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  allPassed: boolean;
  rows: DepartmentAndAssignmentQaRow[];
}

// ============================================================================
// MODULE KIỂM TRA VÀ HOÀN THIỆN TÀI KHOẢN SAU KHI NHẬP EXCEL (MỤC I -> VII)
// ============================================================================

export type PostImportAuditWarningCode =
  | 'MISSING_DEPARTMENT'          // 1. Chưa có tổ chuyên môn
  | 'MISSING_TEACHING_ASSIGNMENT' // 2. Chưa có phân công giảng dạy
  | 'MISSING_QUESTION_PERMISSION' // 3. Chưa có quyền tạo câu hỏi
  | 'MISSING_EXAM_PERMISSION'     // 4. Chưa có quyền tạo đề (Lưu ý thông tin - Không coi mọi tài khoản thiếu quyền tạo đề là lỗi)
  | 'SUBJECT_LEVEL_MISMATCH'      // 5. Môn học không phù hợp cấp học
  | 'INVALID_EMAIL'               // 6. Email không hợp lệ
  | 'ACCOUNT_UNACTIVATED'         // 7. Tài khoản chưa kích hoạt
  | 'ACCOUNT_LOCKED'              // 8. Tài khoản bị khóa
  | 'ROLE_PERMISSION_MISMATCH';   // 9. Vai trò và quyền có dấu hiệu không phù hợp

export type PostImportAuditWarningSeverity =
  | 'ERROR'     // Lỗi dữ liệu / cấu hình cần xử lý ngay (Email sai, lệch môn-cấp học, lệch vai trò-quyền)
  | 'WARNING'   // Cảnh báo thiếu thông tin cần bổ sung (Chưa có tổ, chưa có phân công, chưa kích hoạt, bị khóa, thiếu quyền tạo câu hỏi)
  | 'INFO_NOTE'; // Lưu ý tham khảo, không coi là lỗi (VD: Chưa có quyền tạo đề vì một số giáo viên không được phân công ra đề)

export interface PostImportAuditWarningItem {
  code: PostImportAuditWarningCode;
  orderNumber: number; // 1 -> 9
  label: string;
  detail: string;
  severity: PostImportAuditWarningSeverity;
  isNonErrorInfoNote?: boolean;
}

export type PostImportPermissionAuditStatus =
  | 'FULLY_CONFIGURED'       // Đã cấp đủ quyền tác nghiệp (Câu hỏi + Ma trận + Đề)
  | 'QUESTION_BANK_ONLY'     // Đã cấp quyền tạo câu hỏi (Không phân công ra đề - Hợp lệ)
  | 'BASIC_VIEW_ONLY'        // Chỉ mới có quyền xem cơ bản (Cần rà soát cấp quyền)
  | 'ROLE_PERMISSION_CONFLICT'; // Có dấu hiệu lệch vai trò và quyền

export type PostImportInvitationStatus =
  | 'ACTIVATED'        // Đã kích hoạt và sử dụng
  | 'INVITE_SENT'      // Đã gửi lời mời kích hoạt (còn hạn)
  | 'INVITE_NOT_SENT'  // Chưa gửi lời mời kích hoạt
  | 'INVITE_EXPIRED';  // Liên kết lời mời đã hết hạn

export interface PostImportAccountAuditRow {
  userId: string;
  stt: number;
  fullName: string; // Cột 1: Họ và tên
  email: string; // Cột 2: Email
  isEmailValid: boolean;
  departmentName: string; // Cột 3: Tổ chuyên môn
  hasDepartment: boolean;
  educationLevels: ('PRIMARY' | 'LOWER_SECONDARY')[]; // Cột 4: Cấp học
  subjectsDisplay: string[]; // Cột 5: Môn học
  gradesDisplay: number[]; // Cột 6: Khối lớp
  subjectAllocations: TeacherSubjectGradeAllocation[];
  hasTeachingAssignment: boolean;
  hasSubjectLevelMismatch: boolean;
  subjectLevelMismatchDetail?: string;
  roles: WorkflowActorRole[]; // Cột 7: Vai trò
  accountStatus: TeacherAccountLifecycleStatus; // Cột 8: Trạng thái tài khoản
  permissionAuditStatus: PostImportPermissionAuditStatus; // Cột 9: Trạng thái phân quyền
  permissionAuditStatusLabel: string;
  grantedPermissionCodes: TeacherFunctionalPermissionCode[];
  hasCreateQuestionPermission: boolean;
  hasCreateMatrixPermission: boolean;
  hasCreateExamPermission: boolean;
  hasUseAiPermission: boolean;
  hasRolePermissionMismatch: boolean;
  rolePermissionMismatchDetail?: string;
  invitationStatus: PostImportInvitationStatus; // Cột 10: Trạng thái lời mời kích hoạt
  invitationStatusLabel: string;
  invitationSentAt: string | null;
  invitationExpiresAt?: string | null;
  warnings: PostImportAuditWarningItem[]; // Mục III: 9 loại cảnh báo
  actionableWarningsCount: number; // Số cảnh báo cần xử lý (không tính MISSING_EXAM_PERMISSION đơn thuần là lỗi)
  needsAttention: boolean;
  needsPermissionReview: boolean;
  isSandboxTestAccount?: boolean;
  importBatchTag?: string;
}

export interface PostImportAuditStatistics {
  totalAccounts: number; // 1. Tổng số tài khoản
  activeAccounts: number; // 2. Tài khoản hoạt động
  unactivatedAccounts: number; // 3. Tài khoản chưa kích hoạt
  lockedAccounts: number; // 4. Tài khoản tạm khóa
  missingDepartmentAccounts: number; // 5. Tài khoản chưa có tổ
  missingAssignmentAccounts: number; // 6. Tài khoản chưa có phân công
  needsPermissionReviewAccounts: number; // 7. Tài khoản cần rà soát quyền
  accountsNeedingActionTotal: number;
}

export interface PostImportAuditQaStepRow {
  stepNumber: number;
  testCode: string;
  title: string;
  inputSummary: string;
  expectedOutcome: string;
  actualOutcome: string;
  status: 'Đạt' | 'Không đạt';
  securityAndIsolationNote: string;
}

export interface PostImportAuditQaReport {
  runId: string;
  executedAt: string;
  actorName: string;
  importedTestAccountsCount: number; // 20 tài khoản thử nghiệm
  officialDataUntouched: boolean; // Không dùng dữ liệu thử nghiệm làm dữ liệu chính thức
  officialAccountsCountBefore: number;
  officialAccountsCountAfter: number;
  statisticsBeforeRemediation: PostImportAuditStatistics;
  statisticsAfterRemediation: PostImportAuditStatistics;
  detectedWarningCountsByCode: Record<PostImportAuditWarningCode, number>;
  missingExamTreatedAsNonErrorVerified: boolean;
  bulkPermissionAllowedSuccessCount: number;
  bulkAppraisalApprovalBlockedHttpStatus: number;
  invitationsSentCount: number;
  exportedNeedsAttentionRowsCount: number;
  sampleTestAccountsAfterAudit: PostImportAccountAuditRow[];
  steps: PostImportAuditQaStepRow[];
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  allPassed: boolean;
}

// ============================================================================
// GIAI ĐOẠN 17: KẾT NỐI FIREBASE VÀ XÂY DỰNG HỆ THỐNG LƯU TRỮ DỮ LIỆU THỰC
// ============================================================================

export type Stage17DataSourceType =
  | 'SAMPLE_SEED_ONLY'
  | 'LOCAL_STORAGE_LEGACY'
  | 'CENTRAL_DB_AND_FIRESTORE_SYNCED'
  | 'HYBRID_MIGRATED_TO_CENTRAL_FIRESTORE';

export interface Stage17ModuleMigrationItem {
  stt: number;
  moduleCode: string;
  stageRange: string;
  moduleName: string;
  previousDataSource: string;
  usedSampleSeed: boolean;
  usedLocalStoragePreviously: boolean;
  connectedToFirestoreOrCentralDb: boolean;
  firestoreCollectionPath: string;
  tenantAndRbacIsolationRule: string;
  migrationStatus: 'ĐÃ ĐỒNG BỘ TẬP TRUNG & FIRESTORE' | 'SẴN SÀNG CHUYỂN ĐỔI TIẾP THEO';
  notes: string;
}

export interface Stage17FirebaseQaScenarioRow {
  scenarioNumber: number;
  scenarioCode:
    | 'STAGE17_SCENARIO_1_CONNECTION_SUCCESS'
    | 'STAGE17_SCENARIO_2_MISSING_CONFIG'
    | 'STAGE17_SCENARIO_3_INVALID_CONFIG'
    | 'STAGE17_SCENARIO_4_UNAUTHENTICATED_USER'
    | 'STAGE17_SCENARIO_5_FIRESTORE_PERMISSION_DENIED'
    | 'STAGE17_SCENARIO_6_NETWORK_LOSS_AND_RECOVERY'
    | 'STAGE17_SCENARIO_7_APP_RELOAD_PERSISTENCE';
  title: string;
  testInput: string;
  expectedBehavior: string;
  actualBehavior: string;
  passed: boolean;
  securityNote: string;
}

export interface Stage17FirebaseQaReport {
  runId: string;
  executedAt: string;
  actorName: string;
  projectId: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  maskedApiKey: string;
  noPlaintextPasswordInFirestore: boolean;
  noGeminiKeyInFrontend: boolean;
  noAdminPrivateKeyInFrontend: boolean;
  noLocalStoragePrimarySource: boolean;
  officialCollectionsUntouchedByTestProbes: boolean;
  moduleMigrationTable: Stage17ModuleMigrationItem[];
  scenarios: Stage17FirebaseQaScenarioRow[];
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  allPassed: boolean;
}

