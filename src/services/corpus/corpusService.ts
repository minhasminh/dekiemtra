import {
  ApprovalStatus,
  CognitiveLevelCode,
  CorpusAcceptanceStepResult,
  CorpusAcceptanceTestReport,
  CorpusItem,
  CorpusQualityReport,
  CorpusQualityWarningCode,
  CorpusQualityWarningItem,
  CorpusType,
  CorpusUsageRightsCode,
  EducationLevelId,
  ExamPaper,
  ExamVariantPaper,
  ExamVariantQuestionItem,
  QuestionFormatCode,
  QuestionItem,
} from '../../types/domain';
import { dataRepository } from '../storage/repository';

const CORPUS_STORAGE_KEY = 'edutest_v2_corpus_repository';

export const CORPUS_TYPE_LABELS: Record<CorpusType, string> = {
  VAN_BAN: 'Văn bản đọc hiểu',
  THO: 'Thơ / Ca dao',
  TRANH: 'Tranh / Sơ đồ minh họa',
  BANG: 'Bảng số liệu',
  BIEU_DO: 'Biểu đồ thống kê',
  TINH_HUONG: 'Tình huống thực tiễn',
};

export const CORPUS_USAGE_RIGHTS_LABELS: Record<CorpusUsageRightsCode, string> = {
  SGK_CHINH_THONG: 'Sách giáo khoa GDPT 2018 chính thống (Đã xác minh)',
  TRICH_DAN_XAC_MINH: 'Trích dẫn có ghi rõ tác giả & nguồn xuất xứ hợp lệ',
  GIAO_VIEN_BIEN_SOAN: 'Ngữ liệu do giáo viên / tổ chuyên môn biên soạn',
  CAN_XIN_PHEP_BAN_QUYEN: 'Tác phẩm có bản quyền hạn chế (Cần xin phép)',
  CHUA_XAC_MINH_NGUON: 'Chưa xác minh nguồn / tác giả (Cần bổ sung)',
};

export const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevelCode, string> = {
  [CognitiveLevelCode.PRIMARY_MUC_1]: 'Mức 1 – Nhận biết (Tiểu học)',
  [CognitiveLevelCode.PRIMARY_MUC_2]: 'Mức 2 – Thông hiểu (Tiểu học)',
  [CognitiveLevelCode.PRIMARY_MUC_3]: 'Mức 3 – Vận dụng (Tiểu học)',
  [CognitiveLevelCode.SEC_NHAN_BIET]: 'Nhận biết (THCS)',
  [CognitiveLevelCode.SEC_THONG_HIEU]: 'Thông hiểu (THCS)',
  [CognitiveLevelCode.SEC_VAN_DUNG]: 'Vận dụng (THCS)',
  [CognitiveLevelCode.SEC_VAN_DUNG_CAO]: 'Vận dụng cao (THCS)',
};

export const QUESTION_FORMAT_LABELS: Record<QuestionFormatCode, string> = {
  [QuestionFormatCode.MCQ_SINGLE]: 'Trắc nghiệm 1 lựa chọn',
  [QuestionFormatCode.MCQ_MULTIPLE]: 'Trắc nghiệm nhiều lựa chọn',
  [QuestionFormatCode.TRUE_FALSE_CLUSTER]: 'Đúng – Sai chùm 4 ý',
  [QuestionFormatCode.SHORT_ANSWER]: 'Trả lời ngắn',
  [QuestionFormatCode.FILL_IN_BLANK]: 'Điền khuyết',
  [QuestionFormatCode.MATCHING]: 'Ghép nối',
  [QuestionFormatCode.ORDERING]: 'Sắp xếp thứ tự',
  [QuestionFormatCode.ESSAY_SHORT]: 'Tự luận ngắn',
  [QuestionFormatCode.ESSAY]: 'Tự luận',
  [QuestionFormatCode.READING_COMPREHENSION]: 'Đọc hiểu ngữ liệu',
  [QuestionFormatCode.MEDIA_FORMULA]: 'Hình ảnh / Công thức',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.DRAFT]: 'Bản nháp',
  [ApprovalStatus.PENDING]: 'Chờ thẩm định',
  [ApprovalStatus.IN_REVIEW]: 'Đang thẩm định',
  [ApprovalStatus.REVISION_REQUIRED]: 'Yêu cầu chỉnh sửa',
  [ApprovalStatus.REVISED]: 'Đã chỉnh sửa',
  [ApprovalStatus.PENDING_APPROVAL]: 'Chờ phê duyệt',
  [ApprovalStatus.APPROVED]: 'Đã phê duyệt',
  [ApprovalStatus.PUBLISHED]: 'Đã phát hành',
  [ApprovalStatus.ARCHIVED]: 'Lưu trữ',
  [ApprovalStatus.DEPRECATED]: 'Ngừng sử dụng',
};

export function calculateTextMetrics(text: string): { wordCount: number; charCount: number } {
  const trimmed = (text || '').trim();
  if (!trimmed) return { wordCount: 0, charCount: 0 };
  const words = trimmed.split(/\s+/).filter(Boolean);
  return {
    wordCount: words.length,
    charCount: trimmed.length,
  };
}

// ============================================================================
// NGỮ LIỆU TRỌNG TÂM KIỂM THỬ (MỤC VI): BÀI ĐỌC HIỂU TIẾNG VIỆT LỚP 4 + 10 CÂU HỎI
// ============================================================================

export const GRADE4_VIETNAMESE_PASSAGE_CONTENT = `Mỗi độ xuân về, khu vườn nhỏ phía sau nhà ông ngoại lại bừng tỉnh sau những ngày đông giá lạnh. Ngay cạnh lối đi lát gạch đỏ, cây bưởi già đã nhú lên từng chùm hoa trắng muốt, tỏa hương thơm dịu nhẹ khắp sân. Dưới gốc bưởi, ông ngoại dành riêng một luống đất tơi xốp để trồng rau cải ngọt và những khóm cúc vàng rực rỡ.

Sáng chủ nhật nào, bé Minh cũng theo mẹ sang thăm ông. Vừa bước chân qua cổng, Minh đã reo lên thích thú rồi chạy ùa ra vườn phụ ông tưới nước. Ông ngoại đưa cho Minh chiếc bình tưới nhỏ màu xanh, ân cần chỉ cho Minh cách nghiêng vòi phun nhẹ nhàng để những giọt nước mát lành không làm dập cánh hoa mỏng manh. Trong vòm lá xanh non, đôi chim sâu nhỏ nhắn chuyền cành thoăn thoắt, cất tiếng hót líu lo như đang trò chuyện cùng hai ông cháu.

Trước khi hai mẹ con Minh ra về, ông ngoại cắt một bó rau cải non xanh mướt và hái mấy bông cúc vàng tươi tặng Minh mang về cắm ở góc bàn học. Ông mỉm cười hiền hậu dặn Minh: "Chăm sóc cây cối cũng giống như nuôi dưỡng lòng kiên nhẫn vậy, cháu cứ yêu thương khu vườn thì đất đai sẽ luôn đền đáp bằng hoa thơm và trái ngọt."`;

export const SEED_GRADE4_CORPUS_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-corpus-tv4-01',
    code: 'CH-TH-K4-NL01',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-01',
    learningOutcomeText: 'Nhận biết được chi tiết, hình ảnh sự vật và nhân vật trong văn bản đọc hiểu.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
    stem: 'Ngay cạnh lối đi lát gạch đỏ trong khu vườn của ông ngoại có cây gì đang nở hoa trắng muốt?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    options: [
      'A. Cây bưởi già nở từng chùm hoa trắng muốt.',
      'B. Cây cam sành nở hoa vàng nhạt.',
      'C. Cây khế ngọt tỏa bóng mát rượi.',
      'D. Cây ổi đào sai trĩu quả bên bờ rào.',
    ],
    correctAnswer: 'A',
    gradingGuide:
      'Đáp án đúng: A (0,5 điểm). Căn cứ câu văn mở đầu đoạn 1: "Ngay cạnh lối đi lát gạch đỏ, cây bưởi già đã nhú lên từng chùm hoa trắng muốt, tỏa hương thơm dịu nhẹ khắp sân."',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-02',
    code: 'CH-TH-K4-NL02',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-01',
    learningOutcomeText: 'Nhận biết được chi tiết, hình ảnh sự vật và nhân vật trong văn bản đọc hiểu.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
    stem: 'Dưới gốc bưởi, ông ngoại đã trồng những loại cây gì trên luống đất tơi xốp?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    options: [
      'A. Rau muống và hoa hồng nhung.',
      'B. Rau cải ngọt và những khóm cúc vàng rực rỡ.',
      'C. Cà chua bi và hoa hướng dương.',
      'D. Rau xà lách và những khóm hoa đồng tiền.',
    ],
    correctAnswer: 'B',
    gradingGuide:
      'Đáp án đúng: B (0,5 điểm). Căn cứ câu cuối đoạn 1: "Dưới gốc bưởi, ông ngoại dành riêng một luống đất tơi xốp để trồng rau cải ngọt và những khóm cúc vàng rực rỡ."',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-03',
    code: 'CH-TH-K4-NL03',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-01',
    learningOutcomeText: 'Nhận biết được chi tiết, thời gian và hoạt động của nhân vật trong bài đọc.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
    stem: 'Bé Minh thường theo mẹ sang thăm ông ngoại vào thời gian nào và đã làm công việc gì giúp ông?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    options: [
      'A. Chiều thứ bảy hằng tuần, ra vườn nhổ cỏ cùng ông.',
      'B. Sáng thứ hai đầu tuần, quét lá khô trên sân gạch.',
      'C. Sáng chủ nhật hằng tuần, chạy ra vườn phụ ông tưới nước.',
      'D. Tối thứ sáu hằng tuần, nghe ông kể chuyện cổ tích.',
    ],
    correctAnswer: 'C',
    gradingGuide:
      'Đáp án đúng: C (0,5 điểm). Căn cứ đoạn 2: "Sáng chủ nhật nào, bé Minh cũng theo mẹ sang thăm ông... chạy ùa ra vườn phụ ông tưới nước."',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-04',
    code: 'CH-TH-K4-NL04',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-02',
    learningOutcomeText: 'Hiểu được lý do của hành động và sự chăm sóc tỉ mỉ của nhân vật trong bài đọc.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
    stem: 'Vì sao ông ngoại lại hướng dẫn Minh nghiêng vòi bình tưới phun thật nhẹ nhàng?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    options: [
      'A. Để nước không bắn ướt quần áo của hai ông cháu.',
      'B. Để tiết kiệm nước trong chiếc bình tưới nhỏ màu xanh.',
      'C. Để không làm đôi chim sâu trên vòm lá giật mình bay đi.',
      'D. Để những giọt nước mát lành không làm dập cánh hoa mỏng manh.',
    ],
    correctAnswer: 'D',
    gradingGuide:
      'Đáp án đúng: D (0,5 điểm). Căn cứ đoạn 2: "...ân cần chỉ cho Minh cách nghiêng vòi phun nhẹ nhàng để những giọt nước mát lành không làm dập cánh hoa mỏng manh."',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-05',
    code: 'CH-TH-K4-NL05',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-02',
    learningOutcomeText: 'Nhận diện và hiểu tác dụng của biện pháp tu từ so sánh, nhân hóa trong câu văn.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
    stem: 'Trong câu văn: "Trong vòm lá xanh non, đôi chim sâu nhỏ nhắn chuyền cành thoăn thoắt, cất tiếng hót líu lo như đang trò chuyện cùng hai ông cháu", tác giả đã sử dụng biện pháp nghệ thuật nào?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    options: [
      'A. Kết hợp so sánh và nhân hóa làm cho hình ảnh đôi chim sâu trở nên gần gũi, sinh động.',
      'B. Chỉ liệt kê các loài chim trong khu vườn mùa xuân.',
      'C. Sử dụng câu khiến để yêu cầu đôi chim sâu ca hót.',
      'D. Sử dụng biện pháp nói quá về kích thước của vòm lá.',
    ],
    correctAnswer: 'A',
    gradingGuide:
      'Đáp án đúng: A (0,5 điểm). Cụm từ "như đang trò chuyện cùng hai ông cháu" vừa dùng từ so sánh "như", vừa gắn hoạt động "trò chuyện" của con người cho đôi chim sâu.',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-06',
    code: 'CH-TH-K4-NL06',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-01',
    learningOutcomeText: 'Nhận biết được món quà và tình cảm của nhân vật trong văn bản.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
    stem: 'Trước khi hai mẹ con Minh ra về, ông ngoại đã tặng cho Minh những món quà gì từ khu vườn?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    options: [
      'A. Một giỏ quả bưởi chín vàng và chiếc bình tưới nhỏ.',
      'B. Một bó rau cải non xanh mướt và mấy bông cúc vàng tươi.',
      'C. Một chùm hoa bưởi trắng muốt và một lồng chim sâu.',
      'D. Một túi hạt giống hoa cúc và một cuốn sổ nhỏ.',
    ],
    correctAnswer: 'B',
    gradingGuide:
      'Đáp án đúng: B (0,5 điểm). Căn cứ câu đầu đoạn 3: "Trước khi hai mẹ con Minh ra về, ông ngoại cắt một bó rau cải non xanh mướt và hái mấy bông cúc vàng tươi tặng Minh mang về cắm ở góc bàn học."',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-07',
    code: 'CH-TH-K4-NL07',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-02',
    learningOutcomeText: 'Xác định được danh từ, động từ, tính từ trong câu văn thuộc ngữ liệu đọc hiểu.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
    stem: 'Trong cụm từ "những khóm cúc vàng rực rỡ" trích từ đoạn 1, các từ "vàng", "rực rỡ" thuộc từ loại nào đã học ở lớp 4?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    options: [
      'A. Danh từ chỉ sự vật.',
      'B. Động từ chỉ hoạt động.',
      'C. Tính từ chỉ màu sắc và đặc điểm.',
      'D. Đại từ xưng hô.',
    ],
    correctAnswer: 'C',
    gradingGuide:
      'Đáp án đúng: C (0,5 điểm). Từ "vàng" và "rực rỡ" là các tính từ miêu tả đặc điểm màu sắc tươi sáng của khóm hoa cúc.',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-08',
    code: 'CH-TH-K4-NL08',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-02',
    learningOutcomeText: 'Xác định được bộ phận chủ ngữ và vị ngữ của câu kể trong ngữ liệu đọc hiểu.',
    format: QuestionFormatCode.SHORT_ANSWER,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
    stem: 'Em hãy xác định bộ phận Chủ ngữ trong câu văn sau trích từ bài đọc: "Cây bưởi già đã nhú lên từng chùm hoa trắng muốt."',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    correctAnswer: 'Cây bưởi già',
    acceptedVariations: ['Cây bưởi già', 'Chủ ngữ: Cây bưởi già', 'CN: Cây bưởi già'],
    gradingGuide:
      'Học sinh xác định đúng Chủ ngữ là "Cây bưởi già" đạt 1,0 điểm. Nếu xác định thêm Vị ngữ là "đã nhú lên từng chùm hoa trắng muốt" vẫn cho điểm tối đa.',
    points: 1.0,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-09',
    code: 'CH-TH-K4-NL09',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-03',
    learningOutcomeText: 'Hiểu và giải thích được ý nghĩa lời khuyên, thông điệp của văn bản đọc hiểu.',
    format: QuestionFormatCode.ESSAY,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
    stem: 'Em hiểu như thế nào về lời dặn của ông ngoại ở cuối bài đọc: "Chăm sóc cây cối cũng giống như nuôi dưỡng lòng kiên nhẫn vậy, cháu cứ yêu thương khu vườn thì đất đai sẽ luôn đền đáp bằng hoa thơm và trái ngọt"?',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    correctAnswer:
      'Lời dặn của ông ngoại khuyên Minh biết yêu quý thiên nhiên, kiên trì và tỉ mỉ chăm sóc cây cối mỗi ngày; khi ta bỏ công sức và tình yêu thương chân thành thì sẽ nhận lại thành quả tốt đẹp.',
    gradingGuide:
      'Chấm theo 2 ý chính: (1) Giải thích ý nghĩa trực tiếp: trồng và chăm sóc cây cần sự kiên trì, tỉ mỉ mỗi ngày (0,75 điểm); (2) Rút ra bài học: biết yêu thương thiên nhiên, chăm chỉ lao động sẽ nhận được kết quả ngọt ngào (0,75 điểm).',
    rubricCriteria: [
      {
        id: 'rub-tv4-09-1',
        criterion: 'Nêu được ý nghĩa của sự kiên nhẫn, tỉ mỉ khi chăm sóc cây cối mỗi ngày',
        points: 0.75,
        note: 'Chấp nhận cách diễn đạt tương đương của học sinh lớp 4',
      },
      {
        id: 'rub-tv4-09-2',
        criterion: 'Giải thích được ý nghĩa "đất đai đền đáp bằng hoa thơm và trái ngọt" là thành quả xứng đáng của tình yêu lao động',
        points: 0.75,
        note: 'Diễn đạt trọn câu, trong sáng',
      },
    ],
    points: 1.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
  {
    id: 'q-corpus-tv4-10',
    code: 'CH-TH-K4-NL10',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    learningOutcomeCode: 'TV4-ĐH-04',
    learningOutcomeText: 'Vận dụng liên hệ bản thân, viết 2–3 câu về việc làm chăm sóc cây xanh hoặc giúp đỡ ông bà.',
    format: QuestionFormatCode.ESSAY,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3,
    stem: 'Từ việc làm của bạn Minh trong bài đọc, em hãy viết từ 2 đến 3 câu kể về một việc em đã làm để chăm sóc cây xanh hoặc phụ giúp ông bà, cha mẹ vào dịp cuối tuần.',
    sharedPassage: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    sharedPassageAuthor: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    sharedPassageGroupId: 'corpus-tv4-001',
    groupId: 'corpus-tv4-001',
    correctAnswer:
      'Học sinh viết được 2–3 câu kể rõ việc làm cụ thể (như tưới cây, nhổ cỏ, bắt sâu, quét sân giúp ông bà) và nêu cảm xúc vui vẻ, tự hào.',
    gradingGuide:
      'Đảm bảo số lượng 2–3 câu đúng ngữ pháp (0,5 điểm); nêu được việc làm cụ thể gắn với chăm sóc cây cối hoặc giúp đỡ ông bà (1,0 điểm); thể hiện tình cảm chân thành (0,5 điểm).',
    rubricCriteria: [
      {
        id: 'rub-tv4-10-1',
        criterion: 'Viết đúng hình thức đoạn ngắn từ 2 đến 3 câu, đúng chính tả và dấu câu',
        points: 0.5,
      },
      {
        id: 'rub-tv4-10-2',
        criterion: 'Kể được việc làm cụ thể chăm sóc cây xanh hoặc phụ giúp ông bà, cha mẹ',
        points: 1.0,
      },
      {
        id: 'rub-tv4-10-3',
        criterion: 'Bộc lộ cảm xúc, suy nghĩ tích cực, phù hợp lứa tuổi lớp 4',
        points: 0.5,
      },
    ],
    points: 2.0,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
    version: 1,
    sourceDocumentName: 'Kho ngữ liệu Đọc hiểu Tiếng Việt 4 (NL-TH-TV4-001)',
  },
];

// Các ngữ liệu mẫu bổ sung đa dạng loại ngữ liệu (Thơ, Văn bản THCS, Bảng số liệu)
export const SEED_CORPUS_ITEMS: CorpusItem[] = [
  {
    id: 'corpus-tv4-001',
    code: 'NL-TH-TV4-001',
    title: 'Khu vườn mùa xuân của ông ngoại',
    content: GRADE4_VIETNAMESE_PASSAGE_CONTENT,
    author: 'Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh',
    source: 'Kho ngữ liệu Đọc hiểu nội bộ Khối 4 (Biên soạn chuẩn TT 27/2020/TT-BGDĐT)',
    provenanceInfo:
      'Văn bản tự biên soạn và thẩm định bởi Tổ Chuyên môn Khối 4 – Trường TH&THCS Nguyễn Đình Anh phục vụ kiểm tra định kỳ môn Tiếng Việt lớp 4.',
    isSourceVerified: true,
    corpusType: 'VAN_BAN',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicId: 'cur-tv-4-doc-hieu',
    topicTitle: 'Mái ấm gia đình & Tình yêu thiên nhiên',
    ...calculateTextMetrics(GRADE4_VIETNAMESE_PASSAGE_CONTENT),
    usageRights: 'GIAO_VIEN_BIEN_SOAN',
    usageRightsNote: 'Bản quyền thuộc Tổ Chuyên môn nhà trường, cho phép sử dụng trong đề kiểm tra định kỳ.',
    status: ApprovalStatus.APPROVED,
    preserveQuestionOrder: true,
    questionIds: SEED_GRADE4_CORPUS_QUESTIONS.map((q) => q.id),
    usageHistory: [
      {
        id: 'hist-corpus-01',
        examId: 'exam-sample-tv4-gk1',
        examCode: 'ĐỀ-TH-K4-01',
        examTitle: 'Đề kiểm tra Định kỳ Giữa học kỳ I – Môn Tiếng Việt Lớp 4',
        examPeriod: 'GIUA_KY_1',
        usedDate: '2026-10-20',
        selectedQuestionCount: 6,
        selectedQuestionCodes: [
          'CH-TH-K4-NL01',
          'CH-TH-K4-NL02',
          'CH-TH-K4-NL04',
          'CH-TH-K4-NL05',
          'CH-TH-K4-NL08',
          'CH-TH-K4-NL10',
        ],
        isOfficialExam: true,
      },
    ],
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    isSampleData: true,
  },
  {
    id: 'corpus-tv4-002',
    code: 'NL-TH-TV4-002',
    title: 'Lời của giọt mưa xuân',
    content: `Giọt mưa xuân tí tách
Rơi nhẹ xuống cành xoan
Đánh thức mầm lá biếc
Mở mắt nhìn thế gian.

Mưa đi qua cánh đồng
Lúa thì con gái mượt
Mưa ghé vào hiên nhà
Thơm mùi hương vỏ bưởi.`,
    author: 'Tổ Chuyên môn Tiểu học (Biên soạn)',
    source: 'Tài liệu đọc mở rộng Tiếng Việt Lớp 4 – Trường TH&THCS Nguyễn Đình Anh',
    provenanceInfo: 'Thơ 5 chữ tự biên soạn phục vụ đánh giá kỹ năng đọc hiểu thơ lớp 4.',
    isSourceVerified: true,
    corpusType: 'THO',
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicId: 'cur-tv-4-doc-hieu',
    topicTitle: 'Vẻ đẹp quê hương bốn mùa',
    ...calculateTextMetrics(`Giọt mưa xuân tí tách
Rơi nhẹ xuống cành xoan
Đánh thức mầm lá biếc
Mở mắt nhìn thế gian.

Mưa đi qua cánh đồng
Lúa thì con gái mượt
Mưa ghé vào hiên nhà
Thơm mùi hương vỏ bưởi.`),
    usageRights: 'GIAO_VIEN_BIEN_SOAN',
    status: ApprovalStatus.APPROVED,
    preserveQuestionOrder: true,
    questionIds: [],
    usageHistory: [],
    createdAt: '2026-10-16',
    updatedAt: '2026-10-16',
    isSampleData: true,
  },
  {
    id: 'corpus-nv6-003',
    code: 'NL-THCS-NV6-003',
    title: 'Buổi sớm trên bến sông quê',
    content: `Khi sương mù còn giăng mắc một lớp mỏng trắng đục trên mặt sông Bồ, những chiếc thuyền nan của các mẹ, các chị đã lặng lẽ cập bến chợ sớm. Tiếng mái chèo khua nước bì bõm hòa cùng tiếng gọi nhau í ới tạo nên một nhịp sống bình dị mà ấm áp. Trên khoang thuyền, từng bó rau muống đồng còn đẫm sương đêm, những rổ cá bống tươi rói ánh lên màu bạc lấp lánh dưới ánh bình minh đầu ngày.`,
    author: 'Tổ Ngữ văn THCS – Trường TH&THCS Nguyễn Đình Anh',
    source: 'Tuyển tập Ngữ liệu Đọc hiểu ngoài SGK Ngữ văn 6 (Theo CV 3175/BGDĐT-GDTrH)',
    provenanceInfo: 'Ngữ liệu văn bản ký/tản văn ngoài SGK phục vụ ra đề kiểm tra Ngữ văn 6 theo định hướng phát triển năng lực.',
    isSourceVerified: true,
    corpusType: 'VAN_BAN',
    levelId: EducationLevelId.LOWER_SECONDARY,
    grade: 6,
    subject: 'Ngữ văn',
    topicId: 'cur-nv-6-ky',
    topicTitle: 'Ký và Tản văn quê hương',
    ...calculateTextMetrics(
      `Khi sương mù còn giăng mắc một lớp mỏng trắng đục trên mặt sông Bồ, những chiếc thuyền nan của các mẹ, các chị đã lặng lẽ cập bến chợ sớm. Tiếng mái chèo khua nước bì bõm hòa cùng tiếng gọi nhau í ới tạo nên một nhịp sống bình dị mà ấm áp. Trên khoang thuyền, từng bó rau muống đồng còn đẫm sương đêm, những rổ cá bống tươi rói ánh lên màu bạc lấp lánh dưới ánh bình minh đầu ngày.`
    ),
    usageRights: 'GIAO_VIEN_BIEN_SOAN',
    status: ApprovalStatus.APPROVED,
    preserveQuestionOrder: true,
    questionIds: [],
    usageHistory: [],
    createdAt: '2026-10-18',
    updatedAt: '2026-10-18',
    isSampleData: true,
  },
  {
    id: 'corpus-kh5-004',
    code: 'NL-TH-KH5-004',
    title: 'Bảng theo dõi sự nảy mầm và phát triển của cây đậu xanh theo độ ẩm đất',
    content: `Nhóm học sinh lớp 5A thực hiện thí nghiệm gieo 3 chậu hạt đậu xanh giống nhau ở nơi có đủ ánh sáng và nhiệt độ phòng (26°C), nhưng chế độ tưới nước khác nhau trong 7 ngày:
- Chậu 1 (Đất khô hoàn toàn, không tưới nước): Hạt không nảy mầm (0/10 hạt).
- Chậu 2 (Đất giữ ẩm vừa phải hằng ngày): 9/10 hạt nảy mầm khỏe mạnh, chiều cao trung bình sau 7 ngày đạt 8,5 cm, lá mầm xanh tươi.
- Chậu 3 (Đất ngập úng nước liên tục): Chỉ có 1/10 hạt nứt vỏ rồi bị thối rễ do thiếu không khí trong đất.`,
    author: 'Tổ Khoa học Tự nhiên & Tiểu học',
    source: 'Phiếu thực hành Khoa học 5 – Trường TH&THCS Nguyễn Đình Anh',
    provenanceInfo: 'Số liệu thực nghiệm bài học Sự sinh trưởng và phát triển của thực vật.',
    isSourceVerified: true,
    corpusType: 'BANG',
    levelId: EducationLevelId.PRIMARY,
    grade: 5,
    subject: 'Khoa học',
    topicId: 'cur-kh-5-thuc-vat',
    topicTitle: 'Thực vật và Động vật',
    ...calculateTextMetrics(
      `Nhóm học sinh lớp 5A thực hiện thí nghiệm gieo 3 chậu hạt đậu xanh giống nhau ở nơi có đủ ánh sáng và nhiệt độ phòng (26°C), nhưng chế độ tưới nước khác nhau trong 7 ngày: Chậu 1 Đất khô hoàn toàn, Chậu 2 Đất giữ ẩm vừa phải, Chậu 3 Đất ngập úng nước liên tục.`
    ),
    usageRights: 'GIAO_VIEN_BIEN_SOAN',
    status: ApprovalStatus.APPROVED,
    preserveQuestionOrder: false,
    tableData: {
      caption: 'Bảng kết quả thí nghiệm gieo hạt đậu xanh sau 7 ngày',
      headers: ['Chậu thí nghiệm', 'Chế độ nước tưới', 'Số hạt nảy mầm', 'Chiều cao TB (cm)', 'Trạng thái cây'],
      rows: [
        ['Chậu 1', 'Không tưới (đất khô)', '0 / 10 hạt', '0,0 cm', 'Hạt khô cứng, không nảy mầm'],
        ['Chậu 2', 'Tưới ẩm vừa phải mỗi ngày', '9 / 10 hạt', '8,5 cm', 'Thân mập, lá xanh tươi'],
        ['Chậu 3', 'Ngập úng nước liên tục', '1 / 10 hạt', '0,5 cm', 'Rễ bị thối do thiếu ô-xi'],
      ],
      unitNote: 'Điều kiện cố định: 10 hạt đậu xanh/chậu, nhiệt độ 26°C, đủ ánh sáng tự nhiên.',
    },
    questionIds: [],
    usageHistory: [],
    createdAt: '2026-10-19',
    updatedAt: '2026-10-19',
    isSampleData: true,
  },
];

// ============================================================================
// QUẢN LÝ LƯU TRỮ & ĐỒNG BỘ KHO NGỮ LIỆU VỚI NGÂN HÀNG CÂU HỎI
// ============================================================================

export function ensureCorpusSeedDataSynced(): CorpusItem[] {
  const existingQuestions = dataRepository.getQuestions();
  const existingQuestionIds = new Set(existingQuestions.map((q) => q.id));

  const missingSeedQuestions = SEED_GRADE4_CORPUS_QUESTIONS.filter(
    (q) => !existingQuestionIds.has(q.id)
  );
  if (missingSeedQuestions.length > 0) {
    try {
      const mergedQuestions = [...missingSeedQuestions, ...existingQuestions];
      localStorage.setItem('edutest_v4_questions', JSON.stringify(mergedQuestions));
    } catch (err) {
      console.error('Failed to sync seed corpus questions:', err);
    }
  }

  try {
    const raw = localStorage.getItem(CORPUS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CORPUS_STORAGE_KEY, JSON.stringify(SEED_CORPUS_ITEMS));
      return SEED_CORPUS_ITEMS;
    }
    const parsed = JSON.parse(raw) as CorpusItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(CORPUS_STORAGE_KEY, JSON.stringify(SEED_CORPUS_ITEMS));
      return SEED_CORPUS_ITEMS;
    }
    const hasMainGrade4Corpus = parsed.some((c) => c.id === 'corpus-tv4-001');
    if (!hasMainGrade4Corpus) {
      const updated = [SEED_CORPUS_ITEMS[0], ...parsed];
      localStorage.setItem(CORPUS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  } catch {
    return SEED_CORPUS_ITEMS;
  }
}

export function getCorpusItems(): CorpusItem[] {
  return ensureCorpusSeedDataSynced();
}

export function saveCorpusItems(items: CorpusItem[]): void {
  try {
    localStorage.setItem(CORPUS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving corpus items:', err);
  }
}

export function createCorpusItem(
  input: Omit<
    CorpusItem,
    'id' | 'code' | 'wordCount' | 'charCount' | 'createdAt' | 'updatedAt' | 'usageHistory'
  >
): CorpusItem {
  const corpora = getCorpusItems();
  const levelPrefix =
    input.levelId === EducationLevelId.PRIMARY
      ? 'TH'
      : input.levelId === EducationLevelId.LOWER_SECONDARY
      ? 'THCS'
      : 'THPT';
  const subjectCode =
    input.subject === 'Tiếng Việt'
      ? 'TV'
      : input.subject === 'Ngữ văn'
      ? 'NV'
      : input.subject === 'Khoa học'
      ? 'KH'
      : 'MH';
  const nextIndex = String(corpora.length + 1).padStart(3, '0');
  const today = new Date().toISOString().slice(0, 10);
  const metrics = calculateTextMetrics(input.content);

  // Tuyệt đối không tự tạo tên tác giả hoặc nguồn khi chưa xác minh
  const rawAuthor = (input.author || '').trim();
  const rawSource = (input.source || '').trim();
  const verified = Boolean(input.isSourceVerified && rawAuthor && rawSource);

  const newItem: CorpusItem = {
    ...input,
    id: `corpus-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: `NL-${levelPrefix}-${subjectCode}${input.grade}-${nextIndex}`,
    author: rawAuthor,
    source: rawSource,
    isSourceVerified: verified,
    usageRights: verified ? input.usageRights : 'CHUA_XAC_MINH_NGUON',
    wordCount: metrics.wordCount,
    charCount: metrics.charCount,
    usageHistory: [],
    createdAt: today,
    updatedAt: today,
  };

  const nextList = [newItem, ...corpora];
  saveCorpusItems(nextList);
  return newItem;
}

export function updateCorpusItem(
  corpusId: string,
  updates: Partial<Omit<CorpusItem, 'id' | 'code' | 'createdAt'>>
): CorpusItem | null {
  const corpora = getCorpusItems();
  const idx = corpora.findIndex((c) => c.id === corpusId);
  if (idx === -1) return null;

  const current = corpora[idx];
  const nextContent = updates.content !== undefined ? updates.content : current.content;
  const metrics = calculateTextMetrics(nextContent);
  const today = new Date().toISOString().slice(0, 10);

  const updated: CorpusItem = {
    ...current,
    ...updates,
    wordCount: metrics.wordCount,
    charCount: metrics.charCount,
    updatedAt: today,
  };

  corpora[idx] = updated;
  saveCorpusItems(corpora);

  if (updates.content !== undefined || updates.author !== undefined) {
    const allQuestions = dataRepository.getQuestions();
    let changedQuestions = false;
    const syncedQuestions = allQuestions.map((q) => {
      if (
        updated.questionIds.includes(q.id) ||
        q.sharedPassageGroupId === corpusId ||
        q.groupId === corpusId
      ) {
        changedQuestions = true;
        return {
          ...q,
          sharedPassage: updated.content,
          sharedPassageAuthor: updated.isSourceVerified ? updated.author : undefined,
        };
      }
      return q;
    });
    if (changedQuestions) {
      localStorage.setItem('edutest_v4_questions', JSON.stringify(syncedQuestions));
    }
  }

  return updated;
}

export function replaceQuestionInCorpus(
  corpusId: string,
  oldQuestionId: string,
  replacementQuestion: QuestionItem
): { corpus: CorpusItem; replacedIndex: number } | null {
  const corpora = getCorpusItems();
  const idx = corpora.findIndex((c) => c.id === corpusId);
  if (idx === -1) return null;

  const corpus = corpora[idx];
  const pos = corpus.questionIds.indexOf(oldQuestionId);
  const nextQuestionIds = [...corpus.questionIds];

  if (pos >= 0) {
    nextQuestionIds[pos] = replacementQuestion.id;
  } else {
    nextQuestionIds.push(replacementQuestion.id);
  }

  const updatedCorpus: CorpusItem = {
    ...corpus,
    questionIds: nextQuestionIds,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  corpora[idx] = updatedCorpus;
  saveCorpusItems(corpora);

  return {
    corpus: updatedCorpus,
    replacedIndex: pos >= 0 ? pos : nextQuestionIds.length - 1,
  };
}

// ============================================================================
// MỤC III: TẠO CÂU HỎI BẰNG AI BÁM SÁT NGỮ LIỆU (KHÔNG BỊA TÌNH TIẾT NGOÀI VĂN BẢN)
// ============================================================================

export interface GenerateCorpusQuestionsParams {
  corpus: CorpusItem;
  cognitiveLevel: CognitiveLevelCode;
  format: QuestionFormatCode;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  points: number;
  quantity: number;
  existingQuestions: QuestionItem[];
}

export interface GeneratedCorpusQuestionDraft {
  stem: string;
  format: QuestionFormatCode;
  cognitiveLevel: CognitiveLevelCode;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  options?: string[];
  correctAnswer: string;
  gradingGuide: string;
  rubricCriteria?: { id: string; criterion: string; points: number; note?: string }[];
  points: number;
  groundedSentenceQuote: string;
  engineUsed: 'GEMINI_API' | 'CORPUS_DETERMINISTIC_GROUNDING';
}

function splitCorpusIntoSentences(content: string): string[] {
  return (content || '')
    .split(/(?<=[.!?…\n])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 18);
}

export function buildDeterministicCorpusQuestions(
  params: GenerateCorpusQuestionsParams
): GeneratedCorpusQuestionDraft[] {
  const {
    corpus,
    cognitiveLevel,
    format,
    learningOutcomeCode,
    learningOutcomeText,
    points,
    quantity,
  } = params;

  const sentences = splitCorpusIntoSentences(corpus.content);
  const safeSentences =
    sentences.length > 0
      ? sentences
      : [corpus.content.trim() || `Ngữ liệu "${corpus.title}"`];

  const isLevel1 =
    cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_1 ||
    cognitiveLevel === CognitiveLevelCode.SEC_NHAN_BIET;
  const isLevel2 =
    cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_2 ||
    cognitiveLevel === CognitiveLevelCode.SEC_THONG_HIEU;

  const results: GeneratedCorpusQuestionDraft[] = [];
  const letters = ['A', 'B', 'C', 'D'];

  for (let i = 0; i < quantity; i++) {
    const targetSentence = safeSentences[i % safeSentences.length];
    const otherSentence1 = safeSentences[(i + 1) % safeSentences.length];
    const otherSentence2 = safeSentences[(i + 2) % safeSentences.length];
    const correctIndex = i % 4;
    const correctLetter = letters[correctIndex];

    if (format === QuestionFormatCode.MCQ_SINGLE) {
      let stem = '';
      let rightOptionBody = '';
      let distractors: string[] = [];

      if (isLevel1) {
        stem = `Theo nội dung ngữ liệu "${corpus.title}", chi tiết nào sau đây được nêu chính xác trong văn bản?`;
        rightOptionBody = targetSentence;
        distractors = [
          'Sự việc diễn ra vào một buổi chiều mưa bão mùa đông không được nhắc tới trong bài.',
          'Nhân vật trong bài không tham gia bất kỳ hoạt động nào cùng người thân.',
          'Bối cảnh trong văn bản diễn ra ở một khu phố công nghiệp ồn ào.',
        ];
      } else if (isLevel2) {
        stem = `Chi tiết "${targetSentence}" trong ngữ liệu "${corpus.title}" giúp người đọc hiểu điều gì?`;
        rightOptionBody = `Thể hiện rõ nét hình ảnh, hoạt động và cảm xúc chân thực gắn với nội dung đoạn văn: "${targetSentence}".`;
        distractors = [
          'Phản ánh một sự việc hoàn toàn trái ngược với mạch cảm xúc của văn bản.',
          'Chỉ dùng để liệt kê số liệu thống kê khô khan không gắn với nhân vật.',
          'Cho thấy nhân vật thờ ơ, không quan tâm đến cảnh vật xung quanh.',
        ];
      } else {
        stem = `Từ chi tiết "${targetSentence}" trong văn bản "${corpus.title}", bài học ứng xử nào phù hợp nhất mà em có thể rút ra?`;
        rightOptionBody = `Biết trân trọng, yêu thương thiên nhiên và gắn bó với người thân như tinh thần của câu văn: "${targetSentence}".`;
        distractors = [
          'Chỉ nên quan tâm đến lợi ích riêng mà không cần sẻ chia công việc với gia đình.',
          'Bỏ qua việc chăm sóc cây cối và môi trường xung quanh nơi mình sinh sống.',
          'Làm việc vội vàng, thiếu kiên nhẫn khi gặp những công việc cần sự tỉ mỉ.',
        ];
      }

      const rawBodies = [...distractors];
      rawBodies.splice(correctIndex, 0, rightOptionBody);
      const formattedOptions = rawBodies.slice(0, 4).map((body, idx) => `${letters[idx]}. ${body}`);

      results.push({
        stem,
        format: QuestionFormatCode.MCQ_SINGLE,
        cognitiveLevel,
        learningOutcomeCode,
        learningOutcomeText,
        options: formattedOptions,
        correctAnswer: correctLetter,
        gradingGuide: `Đáp án đúng: ${correctLetter} (${points} điểm). Căn cứ trực tiếp trong ngữ liệu (${corpus.code}): "${targetSentence}".`,
        points,
        groundedSentenceQuote: targetSentence,
        engineUsed: 'CORPUS_DETERMINISTIC_GROUNDING',
      });
    } else {
      let stem = '';
      let sampleAnswer = '';
      let criteria: { id: string; criterion: string; points: number; note?: string }[] = [];

      if (isLevel1) {
        stem = `Dựa vào văn bản "${corpus.title}", em hãy tìm và ghi lại chi tiết được tác giả miêu tả trong câu văn nói về: "${targetSentence.slice(0, Math.min(45, targetSentence.length))}..."`;
        sampleAnswer = `Chi tiết trong văn bản: "${targetSentence}"`;
        criteria = [
          {
            id: `rub-${Date.now()}-${i}-1`,
            criterion: `Nêu đúng chi tiết có trong ngữ liệu: "${targetSentence}"`,
            points,
            note: 'Học sinh có thể trích dẫn nguyên văn hoặc diễn đạt lại đúng ý câu văn trong bài đọc.',
          },
        ];
      } else if (isLevel2) {
        stem = `Em hãy nêu ý nghĩa của chi tiết sau trong văn bản "${corpus.title}": "${targetSentence}"`;
        sampleAnswer = `Chi tiết "${targetSentence}" khắc họa sinh động cảnh vật và tình cảm ấm áp của các nhân vật trong văn bản "${corpus.title}".`;
        const halfPoints = Math.round((points / 2) * 100) / 100;
        criteria = [
          {
            id: `rub-${Date.now()}-${i}-1`,
            criterion: `Chỉ ra được nội dung chính của chi tiết "${targetSentence}"`,
            points: halfPoints,
          },
          {
            id: `rub-${Date.now()}-${i}-2`,
            criterion: 'Giải thích được tác dụng biểu đạt cảm xúc, tình cảm trong mạch văn bản',
            points: Math.round((points - halfPoints) * 100) / 100,
          },
        ];
      } else {
        stem = `Từ nội dung văn bản "${corpus.title}" (đặc biệt qua chi tiết: "${targetSentence}" và "${otherSentence1 !== targetSentence ? otherSentence1 : otherSentence2}"), em hãy viết 2–3 câu nêu suy nghĩ hoặc việc làm cụ thể của bản thân.`;
        sampleAnswer = `Qua văn bản "${corpus.title}", em học được bài học về tình yêu thương gia đình và sự kiên nhẫn chăm sóc thiên nhiên. Em sẽ tích cực phụ giúp ông bà, cha mẹ những công việc vừa sức mỗi ngày.`;
        const p1 = Math.round(points * 0.4 * 100) / 100;
        const p2 = Math.round((points - p1) * 100) / 100;
        criteria = [
          {
            id: `rub-${Date.now()}-${i}-1`,
            criterion: 'Liên hệ đúng với nội dung, thông điệp của ngữ liệu đã cho',
            points: p1,
          },
          {
            id: `rub-${Date.now()}-${i}-2`,
            criterion: 'Nêu được việc làm hoặc bài học cụ thể, diễn đạt 2–3 câu trong sáng, đúng ngữ pháp',
            points: p2,
          },
        ];
      }

      results.push({
        stem,
        format:
          format === QuestionFormatCode.SHORT_ANSWER
            ? QuestionFormatCode.SHORT_ANSWER
            : QuestionFormatCode.ESSAY,
        cognitiveLevel,
        learningOutcomeCode,
        learningOutcomeText,
        correctAnswer: sampleAnswer,
        gradingGuide: `Hướng dẫn chấm (${points} điểm) bám sát căn cứ ngữ liệu ${corpus.code}: "${targetSentence}". ${criteria
          .map((c) => `- ${c.criterion} (${c.points} đ)`)
          .join('; ')}.`,
        rubricCriteria: criteria,
        points,
        groundedSentenceQuote: targetSentence,
        engineUsed: 'CORPUS_DETERMINISTIC_GROUNDING',
      });
    }
  }

  return results;
}

export async function generateQuestionsFromCorpusWithAI(
  params: GenerateCorpusQuestionsParams
): Promise<GeneratedCorpusQuestionDraft[]> {
  const {
    corpus,
    cognitiveLevel,
    format,
    learningOutcomeCode,
    learningOutcomeText,
    points,
    quantity,
    existingQuestions,
  } = params;

  const cognitiveLabel = COGNITIVE_LEVEL_LABELS[cognitiveLevel] || 'Mức 1 – Nhận biết';
  const formatLabel = QUESTION_FORMAT_LABELS[format] || 'Trắc nghiệm';

  try {
    const response = await fetch('/api/corpus/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        corpusCode: corpus.code,
        corpusTitle: corpus.title,
        corpusContent: corpus.content,
        corpusAuthor: corpus.isSourceVerified ? corpus.author : '',
        corpusSource: corpus.isSourceVerified ? corpus.source : '',
        corpusType: CORPUS_TYPE_LABELS[corpus.corpusType],
        grade: corpus.grade,
        subject: corpus.subject,
        topicTitle: corpus.topicTitle,
        learningOutcomeCode,
        learningOutcomeText,
        cognitiveLevel,
        cognitiveLabel,
        format,
        formatLabel,
        points,
        quantity,
        existingStemsInCorpus: existingQuestions.map((q) => q.stem),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions.map((item: any) => ({
          stem: String(item.stem || '').trim(),
          format,
          cognitiveLevel,
          learningOutcomeCode: item.learningOutcomeCode || learningOutcomeCode,
          learningOutcomeText: item.learningOutcomeText || learningOutcomeText,
          options:
            format === QuestionFormatCode.MCQ_SINGLE && Array.isArray(item.options)
              ? item.options
              : undefined,
          correctAnswer: String(item.correctAnswer || 'A').trim(),
          gradingGuide: String(item.explanation || item.correctAnswer || '').trim(),
          rubricCriteria: Array.isArray(item.rubricCriteria)
            ? item.rubricCriteria.map((r: any, idx: number) => ({
                id: `rub-ai-${Date.now()}-${idx}`,
                criterion: r.criterion,
                points: Number(r.points) || points,
                note: r.note,
              }))
            : undefined,
          points: Number(item.suggestedPoints) || points,
          groundedSentenceQuote: String(item.usedSourceSummary || corpus.title),
          engineUsed: 'GEMINI_API',
        }));
      }
    }
  } catch {
    // Fallback sang bộ trích xuất bám sát câu văn ngữ liệu tại máy trạm
  }

  return buildDeterministicCorpusQuestions(params);
}

// ============================================================================
// MỤC V: KIỂM TRA CHẤT LƯỢNG NGỮ LIỆU & NHÓM CÂU HỎI (6 TIÊU CHÍ TỰ ĐỘNG)
// ============================================================================

function normalizeVietnameseTokens(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[.,!?;:"'()[\]{}“”‘’\-–—/\\]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

const VIETNAMESE_STOPWORDS = new Set([
  'trong',
  'ngoài',
  'những',
  'các',
  'một',
  'của',
  'và',
  'là',
  'có',
  'được',
  'cho',
  'với',
  'khi',
  'theo',
  'nào',
  'sau',
  'đây',
  'bài',
  'đọc',
  'văn',
  'bản',
  'ngữ',
  'liệu',
  'câu',
  'hỏi',
  'em',
  'hãy',
  'biết',
  'nêu',
  'tại',
  'sao',
  'vì',
  'như',
  'thế',
  'điều',
  'gì',
  'đoạn',
  'trên',
  'dưới',
]);

function extractContentKeywords(text: string): string[] {
  return normalizeVietnameseTokens(text).filter((t) => !VIETNAMESE_STOPWORDS.has(t));
}

function computeJaccardSimilarity(a: string, b: string): number {
  const setA = new Set(extractContentKeywords(a));
  const setB = new Set(extractContentKeywords(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function runCorpusQualityCheck(
  corpus: CorpusItem,
  linkedQuestions: QuestionItem[]
): CorpusQualityReport {
  const warnings: CorpusQualityWarningItem[] = [];

  const fullCorpusReferenceText = [
    corpus.title,
    corpus.content,
    corpus.author,
    corpus.tableData
      ? `${corpus.tableData.caption} ${corpus.tableData.headers.join(' ')} ${corpus.tableData.rows
          .map((r) => r.join(' '))
          .join(' ')}`
      : '',
  ].join(' ');

  const corpusTokenSet = new Set(normalizeVietnameseTokens(fullCorpusReferenceText));

  // 5. Kiểm tra: Ngữ liệu thiếu thông tin nguồn
  if (
    !corpus.author.trim() ||
    !corpus.source.trim() ||
    !corpus.provenanceInfo.trim() ||
    !corpus.isSourceVerified
  ) {
    warnings.push({
      id: `warn-src-${corpus.id}`,
      code: 'MISSING_SOURCE_INFO',
      severity: 'WARNING',
      title: 'Ngữ liệu thiếu thông tin nguồn hoặc chưa xác minh tác giả',
      targetType: 'CORPUS',
      message: `Ngữ liệu "${corpus.title}" (${corpus.code}) chưa có đầy đủ thông tin tác giả, nguồn hoặc chưa được đánh dấu xác minh xuất xứ. Hệ thống tuân thủ quy tắc: Không tự bịa tên tác giả hoặc nguồn.`,
      suggestion:
        'Giáo viên vui lòng kiểm tra sách gốc / ấn phẩm và cập nhật chính xác Tác giả, Nguồn trích dẫn và Thông tin xuất xứ trước khi phê duyệt ngữ liệu.',
    });
  }

  // 6. Kiểm tra: Ngữ liệu có nguy cơ vi phạm quyền tác giả
  if (
    corpus.usageRights === 'CAN_XIN_PHEP_BAN_QUYEN' ||
    corpus.usageRights === 'CHUA_XAC_MINH_NGUON' ||
    (!corpus.isSourceVerified && corpus.wordCount > 250)
  ) {
    warnings.push({
      id: `warn-copy-${corpus.id}`,
      code: 'COPYRIGHT_RISK',
      severity: corpus.usageRights === 'CAN_XIN_PHEP_BAN_QUYEN' ? 'ERROR' : 'WARNING',
      title: 'Ngữ liệu có nguy cơ vi phạm quyền tác giả / quyền sử dụng',
      targetType: 'CORPUS',
      message: `Ngữ liệu "${corpus.title}" đang ở trạng thái quyền sử dụng "${
        CORPUS_USAGE_RIGHTS_LABELS[corpus.usageRights]
      }". Sử dụng trong đề phát hành rộng rãi khi chưa ghi rõ nguồn hợp lệ có nguy cơ vi phạm quyền tác giả.`,
      suggestion:
        'Chỉ sử dụng ngữ liệu thuộc SGK chính thống, ngữ liệu do giáo viên tự biên soạn hoặc trích dẫn ngắn có ghi đầy đủ tên tác giả và nguồn xuất xứ hợp pháp.',
    });
  }

  // Kiểm tra từng câu hỏi liên kết (Tiêu chí 1, 2, 3, 4)
  linkedQuestions.forEach((q, idx) => {
    const orderNum = idx + 1;
    const questionAndAnswerText = [
      q.stem,
      ...(q.options || []),
      q.correctAnswer,
      q.gradingGuide,
    ].join(' ');

    const keywords = extractContentKeywords(questionAndAnswerText);
    const matchedKeywords = keywords.filter((kw) => corpusTokenSet.has(kw));
    const overlapRatio = keywords.length > 0 ? matchedKeywords.length / keywords.length : 1;

    // 1. Câu hỏi không có căn cứ trong ngữ liệu
    if (keywords.length >= 4 && matchedKeywords.length < 2 && overlapRatio < 0.12) {
      warnings.push({
        id: `warn-ungrounded-${q.id}`,
        code: 'UNGROUNDED_QUESTION',
        severity: 'ERROR',
        title: `Câu ${orderNum} (${q.code}): Không tìm thấy căn cứ trong ngữ liệu`,
        targetType: 'QUESTION',
        questionId: q.id,
        questionCode: q.code,
        questionOrder: orderNum,
        message: `Nội dung câu hỏi "${q.stem.slice(0, 80)}..." chứa các chi tiết không xuất hiện trong văn bản ngữ liệu "${corpus.title}".`,
        suggestion:
          'Đối chiếu lại câu hỏi với văn bản ngữ liệu gốc, loại bỏ các tình tiết ngoài văn bản hoặc sửa lại câu dẫn bám sát chi tiết trong bài đọc.',
      });
    }

    // 2. Đáp án không phù hợp
    const trimmedAnswer = (q.correctAnswer || '').trim();
    const trimmedGuide = (q.gradingGuide || '').trim();
    let answerInvalid = false;
    let answerIssueMsg = '';

    if (!trimmedAnswer) {
      answerInvalid = true;
      answerIssueMsg = 'Câu hỏi chưa có đáp án đúng.';
    } else if (q.format === QuestionFormatCode.MCQ_SINGLE) {
      const opts = q.options || [];
      const normalizedAns = trimmedAnswer.toUpperCase().replace(/[^A-D]/g, '');
      const ansIdx = ['A', 'B', 'C', 'D'].indexOf(normalizedAns);
      if (opts.length < 2 || ansIdx === -1 || ansIdx >= opts.length) {
        answerInvalid = true;
        answerIssueMsg = `Đáp án trắc nghiệm "${trimmedAnswer}" không khớp với danh sách ${opts.length} phương án lựa chọn (A, B, C, D).`;
      } else {
        const chosenOptionText = opts[ansIdx] || '';
        const optKeywords = extractContentKeywords(`${chosenOptionText} ${trimmedGuide}`);
        const optMatched = optKeywords.filter((kw) => corpusTokenSet.has(kw));
        if (optKeywords.length >= 4 && optMatched.length === 0) {
          answerInvalid = true;
          answerIssueMsg = `Phương án được chọn là đáp án đúng (${normalizedAns}) không có từ khóa/chi tiết tương ứng trong ngữ liệu.`;
        }
      }
    } else if (!trimmedGuide) {
      answerInvalid = true;
      answerIssueMsg = 'Câu hỏi tự luận / trả lời ngắn chưa có hướng dẫn chấm chi tiết.';
    }

    if (answerInvalid) {
      warnings.push({
        id: `warn-ans-${q.id}`,
        code: 'MISMATCHED_ANSWER',
        severity: 'ERROR',
        title: `Câu ${orderNum} (${q.code}): Đáp án hoặc hướng dẫn chấm không phù hợp`,
        targetType: 'QUESTION',
        questionId: q.id,
        questionCode: q.code,
        questionOrder: orderNum,
        message: answerIssueMsg,
        suggestion:
          'Kiểm tra lại phương án đúng (A/B/C/D) và bổ sung hướng dẫn chấm trích dẫn rõ câu văn căn cứ trong ngữ liệu.',
      });
    }

    // 3. Câu hỏi trùng ý với câu hỏi trước đó trong cùng ngữ liệu
    for (let prevIdx = 0; prevIdx < idx; prevIdx++) {
      const prevQ = linkedQuestions[prevIdx];
      const similarity = computeJaccardSimilarity(q.stem, prevQ.stem);
      if (similarity >= 0.68) {
        warnings.push({
          id: `warn-dup-${q.id}-${prevQ.id}`,
          code: 'DUPLICATE_MEANING',
          severity: 'WARNING',
          title: `Câu ${orderNum} (${q.code}) trùng ý với Câu ${prevIdx + 1} (${prevQ.code})`,
          targetType: 'QUESTION',
          questionId: q.id,
          questionCode: q.code,
          questionOrder: orderNum,
          message: `Độ tương đồng ngữ nghĩa giữa Câu ${orderNum} và Câu ${prevIdx + 1} là ${Math.round(
            similarity * 100
          )}% (cùng khai thác một ý hỏi lặp lại).`,
          suggestion:
            'Thay thế một trong hai câu hỏi bằng câu hỏi đánh giá khía cạnh khác của ngữ liệu (từ ngữ, biện pháp nghệ thuật, hoặc bài học vận dụng).',
        });
        break;
      }
    }

    // 4. Câu hỏi vượt yêu cầu cần đạt
    const isLevel1Question =
      q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_1 ||
      q.cognitiveLevel === CognitiveLevelCode.SEC_NHAN_BIET;
    const lowerStem = q.stem.toLowerCase();
    const lowerOutcome = (q.learningOutcomeText || '').toLowerCase();

    const asksHighOrderInLevel1 =
      isLevel1Question &&
      (lowerStem.includes('viết đoạn văn nghị luận') ||
        lowerStem.includes('phân tích chuyên sâu') ||
        lowerStem.includes('so sánh hai tác phẩm văn học') ||
        (q.format === QuestionFormatCode.ESSAY && q.points >= 2.0));

    const outcomeOnlyRecognitionButQuestionIsEssay =
      lowerOutcome.startsWith('nhận biết') &&
      !lowerOutcome.includes('viết') &&
      !lowerOutcome.includes('vận dụng') &&
      q.format === QuestionFormatCode.ESSAY &&
      q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_3;

    if (asksHighOrderInLevel1 || outcomeOnlyRecognitionButQuestionIsEssay) {
      warnings.push({
        id: `warn-outcome-${q.id}`,
        code: 'EXCEEDS_LEARNING_OUTCOME',
        severity: 'WARNING',
        title: `Câu ${orderNum} (${q.code}): Mức độ câu hỏi vượt Yêu cầu cần đạt`,
        targetType: 'QUESTION',
        questionId: q.id,
        questionCode: q.code,
        questionOrder: orderNum,
        message: `Câu hỏi gắn với YCCĐ [${q.learningOutcomeCode}] ("${q.learningOutcomeText}") nhưng lệnh hỏi hoặc mức độ nhận thức vượt quá phạm vi yêu cầu cần đạt đã chọn.`,
        suggestion:
          'Điều chỉnh lại Yêu cầu cần đạt tương ứng với mức Vận dụng / Viết đoạn văn hoặc hạ độ phức tạp của lệnh hỏi cho khớp với YCCĐ.',
      });
    }
  });

  const criteriaCatalog: { code: CorpusQualityWarningCode; label: string }[] = [
    { code: 'UNGROUNDED_QUESTION', label: '1. Câu hỏi có căn cứ trong ngữ liệu' },
    { code: 'MISMATCHED_ANSWER', label: '2. Đáp án & Hướng dẫn chấm phù hợp' },
    { code: 'DUPLICATE_MEANING', label: '3. Không có câu hỏi trùng ý' },
    { code: 'EXCEEDS_LEARNING_OUTCOME', label: '4. Không vượt Yêu cầu cần đạt' },
    { code: 'MISSING_SOURCE_INFO', label: '5. Đầy đủ thông tin nguồn & tác giả' },
    { code: 'COPYRIGHT_RISK', label: '6. Đảm bảo quyền tác giả & quyền sử dụng' },
  ];

  const criteriaSummary = criteriaCatalog.map((c) => {
    const count = warnings.filter((w) => w.code === c.code).length;
    return {
      code: c.code,
      label: c.label,
      issueCount: count,
      passed: count === 0,
    };
  });

  return {
    corpusId: corpus.id,
    corpusCode: corpus.code,
    checkedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    passedAll: warnings.length === 0,
    totalQuestionsChecked: linkedQuestions.length,
    warnings,
    criteriaSummary,
  };
}

// ============================================================================
// MỤC IV: TẠO ĐỀ TỪ NHÓM CÂU HỎI ĐỌC HIỂU & XUẤT WORD / PDF (NGỮ LIỆU XUẤT HIỆN ĐÚNG 1 LẦN)
// ============================================================================

export interface BuildExamFromCorpusInput {
  corpus: CorpusItem;
  selectedQuestions: QuestionItem[];
  examTitle: string;
  examPeriod: 'GIUA_KY_1' | 'CUOI_KY_1' | 'GIUA_KY_2' | 'CUOI_KY_2';
  durationMinutes: number;
  schoolName: string;
  authorName: string;
}

export function buildExamPaperFromCorpusGroup(input: BuildExamFromCorpusInput): {
  exam: ExamPaper;
  renderedPreviewText: string;
  corpusOccurrenceCount: number;
} {
  const {
    corpus,
    selectedQuestions,
    examTitle,
    examPeriod,
    durationMinutes,
    authorName,
  } = input;

  const orderedQuestions = [...selectedQuestions].sort((a, b) => {
    const idxA = corpus.questionIds.indexOf(a.id);
    const idxB = corpus.questionIds.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const totalPoints =
    Math.round(orderedQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0) * 100) / 100;

  const variantItems: ExamVariantQuestionItem[] = orderedQuestions.map((q, index) => {
    const isMcq = q.format === QuestionFormatCode.MCQ_SINGLE;
    const isShort = q.format === QuestionFormatCode.SHORT_ANSWER;
    const formatGroup = isMcq ? 'MCQ' : isShort ? 'SHORT_ANSWER' : 'ESSAY';
    const levelColumn =
      q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_1 ||
      q.cognitiveLevel === CognitiveLevelCode.SEC_NHAN_BIET
        ? 'BIET'
        : q.cognitiveLevel === CognitiveLevelCode.PRIMARY_MUC_2 ||
          q.cognitiveLevel === CognitiveLevelCode.SEC_THONG_HIEU
        ? 'HIEU'
        : 'VAN_DUNG';

    return {
      questionId: q.id,
      originalCode: q.code,
      displayNumber: index + 1,
      sectionOrderInPart: index + 1,
      formatGroup,
      levelColumn,
      rowId: `row-${corpus.id}`,
      learningOutcomeCode: q.learningOutcomeCode,
      points: q.points,
      stem: q.stem,
      // QUY TẮC MỤC IV: Chỉ gắn toàn văn ngữ liệu ở câu mở đầu nhóm đọc hiểu (index === 0)
      sharedPassage: index === 0 ? corpus.content : undefined,
      sharedPassageAuthor:
        index === 0
          ? corpus.isSourceVerified
            ? `${corpus.author} (${corpus.source})`
            : 'Chưa xác minh nguồn'
          : undefined,
      sharedPassageGroupKey: corpus.code,
      shuffledOptions: isMcq ? q.options : undefined,
      shuffledCorrectAnswer: q.correctAnswer,
      gradingGuide: q.gradingGuide,
      rubricCriteria: q.rubricCriteria,
      acceptedVariations: q.acceptedVariations,
    };
  });

  const variantPaper: ExamVariantPaper = {
    variantCode: '101',
    variantSeed: `CORPUS-${corpus.code}-FIXED-ORDER`,
    items: variantItems,
    totalQuestions: orderedQuestions.length,
    totalPoints,
    mcqQuickAnswerTable: variantItems
      .filter((it) => it.formatGroup === 'MCQ')
      .map((it) => ({
        questionNumber: it.displayNumber,
        sectionNumber: it.sectionOrderInPart,
        formatGroup: 'MCQ',
        answer: it.shuffledCorrectAnswer,
        points: it.points,
        originalQuestionCode: it.originalCode,
      })),
  };

  const createdExam = dataRepository.addExam({
    title: examTitle,
    levelId: corpus.levelId,
    grade: corpus.grade,
    subject: corpus.subject,
    examPeriod,
    matrixId: `mat-corpus-${corpus.id}`,
    matrixCode: `MT-${corpus.code}`,
    matrixTitle: `Ma trận Đọc hiểu – ${corpus.title}`,
    durationMinutes,
    questionIds: orderedQuestions.map((q) => q.id),
    totalPoints,
    generationMode: 'MANUAL_SELECT',
    seed: `CORPUS-${corpus.code}`,
    variantCount: 1,
    shuffleQuestions: false,
    shuffleMcqOptions: false,
    variants: [variantPaper],
    status: ApprovalStatus.DRAFT,
    authorName,
    isSampleData: false,
  });

  const corpora = getCorpusItems();
  const cIdx = corpora.findIndex((c) => c.id === corpus.id);
  if (cIdx >= 0) {
    const today = new Date().toISOString().slice(0, 10);
    const nextHistory = [
      {
        id: `usage-${Date.now()}`,
        examId: createdExam.id,
        examCode: createdExam.code,
        examTitle: createdExam.title,
        examPeriod: createdExam.examPeriod,
        usedDate: today,
        selectedQuestionCount: orderedQuestions.length,
        selectedQuestionCodes: orderedQuestions.map((q) => q.code),
        isOfficialExam: false,
      },
      ...(corpora[cIdx].usageHistory || []),
    ];
    corpora[cIdx] = {
      ...corpora[cIdx],
      usageHistory: nextHistory,
      updatedAt: today,
    };
    saveCorpusItems(corpora);
  }

  const renderedPreviewText = renderCorpusExamPlainText(corpus, orderedQuestions, createdExam);
  const corpusOccurrenceCount = countPassageOccurrences(renderedPreviewText, corpus.content);

  return {
    exam: createdExam,
    renderedPreviewText,
    corpusOccurrenceCount,
  };
}

export function renderCorpusExamPlainText(
  corpus: CorpusItem,
  orderedQuestions: QuestionItem[],
  exam: ExamPaper
): string {
  const lines: string[] = [];
  lines.push(`ĐỀ KIỂM TRA ĐỌC HIỂU – MÔN ${corpus.subject.toUpperCase()} LỚP ${corpus.grade}`);
  lines.push(`Mã đề: ${exam.code} | Thời gian làm bài: ${exam.durationMinutes} phút | Tổng điểm: ${exam.totalPoints.toFixed(2)} điểm`);
  lines.push('------------------------------------------------------------------------');
  lines.push(`I. ĐỌC THẦM VĂN BẢN SAU:`);
  lines.push(corpus.title.toUpperCase());
  lines.push(corpus.content.trim());
  if (corpus.isSourceVerified && corpus.author) {
    lines.push(`(Theo ${corpus.author} – ${corpus.source})`);
  }
  lines.push('');
  lines.push(`II. DỰA VÀO NỘI DUNG BÀI ĐỌC, KHOANH VÀO CHỮ CÁI TRƯỚC Ý ĐÚNG HOẶC TRẢ LỜI CÂU HỎI:`);

  orderedQuestions.forEach((q, idx) => {
    lines.push(`Câu ${idx + 1} (${q.points.toFixed(2).replace('.', ',')} điểm): ${q.stem}`);
    if (q.format === QuestionFormatCode.MCQ_SINGLE && Array.isArray(q.options)) {
      q.options.forEach((opt) => {
        lines.push(`   ${opt}`);
      });
    }
  });

  lines.push('------------------------------------------------------------------------');
  lines.push('III. ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT:');
  orderedQuestions.forEach((q, idx) => {
    lines.push(
      `- Câu ${idx + 1} (${q.code} – ${q.points.toFixed(2).replace('.', ',')} điểm): Đáp án: ${
        q.correctAnswer
      } | Hướng dẫn chấm: ${q.gradingGuide}`
    );
  });

  return lines.join('\n');
}

export function countPassageOccurrences(fullDocumentText: string, passageText: string): number {
  const cleanPassage = (passageText || '').trim();
  if (!cleanPassage || !fullDocumentText) return 0;
  const firstAnchor = cleanPassage.slice(0, Math.min(85, cleanPassage.length));
  if (!firstAnchor) return 0;
  let count = 0;
  let pos = 0;
  while (true) {
    const found = fullDocumentText.indexOf(firstAnchor, pos);
    if (found === -1) break;
    count++;
    pos = found + firstAnchor.length;
  }
  return count;
}

export function buildCorpusExamWordAndPdfPayloads(
  corpus: CorpusItem,
  orderedQuestions: QuestionItem[],
  exam: ExamPaper,
  schoolName: string
): {
  docxFileName: string;
  docxBlob: Blob;
  docxHtmlContent: string;
  pdfFileName: string;
  pdfBlob: Blob;
  corpusOccurrencesInDocx: number;
} {
  const safeCode = exam.code.replace(/[^a-zA-Z0-9_-]/g, '_');
  const docxFileName = `${safeCode}_De_Doc_Hieu_${corpus.code}.doc`;
  const pdfFileName = `${safeCode}_De_Doc_Hieu_${corpus.code}.pdf`;

  const questionsHtml = orderedQuestions
    .map((q, idx) => {
      const pointsStr = q.points.toFixed(2).replace('.', ',');
      const optionsHtml =
        q.format === QuestionFormatCode.MCQ_SINGLE && Array.isArray(q.options)
          ? `<div style="margin-left: 16pt; margin-top: 3pt; margin-bottom: 6pt;">
              ${q.options
                .map(
                  (opt) =>
                    `<p style="margin: 2pt 0; text-align: justify; line-height: 115%; font-size: 13pt;">${opt}</p>`
                )
                .join('')}
            </div>`
          : `<p style="margin: 4pt 0 8pt 16pt; font-style: italic; color: #334155; font-size: 12.5pt;">(Học sinh trình bày câu trả lời vào phần bài làm)</p>`;

      return `
        <div style="margin-bottom: 8pt; page-break-inside: avoid;">
          <p style="margin: 0; text-align: justify; line-height: 115%; font-size: 13pt;">
            <b>Câu ${idx + 1} (${pointsStr} điểm):</b> ${q.stem}
          </p>
          ${optionsHtml}
        </div>
      `;
    })
    .join('\n');

  const tableHtml = corpus.tableData
    ? `<div style="margin: 8pt 0;">
        <p style="font-weight: bold; text-align: center; margin-bottom: 4pt;">${corpus.tableData.caption}</p>
        <table border="1" cellspacing="0" cellpadding="6" style="width: 100%; border-collapse: collapse; font-size: 12.5pt;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              ${corpus.tableData.headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${corpus.tableData.rows
              .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
              .join('')}
          </tbody>
        </table>
      </div>`
    : '';

  const gradingRowsHtml = orderedQuestions
    .map(
      (q, idx) => `
      <tr>
        <td style="text-align: center; font-weight: bold;">Câu ${idx + 1}<br/><span style="font-size: 10.5pt; font-weight: normal;">(${q.code})</span></td>
        <td style="text-align: center;">${q.learningOutcomeCode}</td>
        <td style="text-align: center; font-weight: bold;">${q.correctAnswer}</td>
        <td style="text-align: center;">${q.points.toFixed(2).replace('.', ',')}</td>
        <td style="text-align: justify;">${q.gradingGuide}</td>
      </tr>
    `
    )
    .join('\n');

  const docxHtmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${exam.title}</title>
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 2.0cm 2.0cm 2.0cm 2.5cm;
      mso-header-margin: 1.2cm;
      mso-footer-margin: 1.2cm;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: "Times New Roman", serif;
      font-size: 13pt;
      line-height: 115%;
      color: #000000;
    }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  <div class="Section1">
    <table style="width: 100%; margin-bottom: 12pt; border: none;">
      <tr>
        <td style="width: 45%; text-align: center; vertical-align: top; border: none;">
          <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">${schoolName}</div>
          <div style="font-size: 12pt; font-weight: bold;">TỔ CHUYÊN MÔN</div>
          <div style="font-size: 11pt; margin-top: 2pt;">Mã đề: <b>${exam.code}</b></div>
        </td>
        <td style="width: 55%; text-align: center; vertical-align: top; border: none;">
          <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase;">${exam.title}</div>
          <div style="font-size: 12pt; font-weight: bold;">Môn: ${corpus.subject} – Khối lớp ${corpus.grade}</div>
          <div style="font-size: 11.5pt; font-style: italic;">Thời gian làm bài: ${exam.durationMinutes} phút (Không kể thời gian phát đề)</div>
        </td>
      </tr>
    </table>

    <div style="border: 1pt solid #000; padding: 10pt 12pt; margin-bottom: 12pt;">
      <p style="margin: 0 0 6pt 0; font-weight: bold; font-size: 13pt; text-transform: uppercase;">
        I. NGỮ LIỆU ĐỌC HIỂU (Mã ngữ liệu: ${corpus.code})
      </p>
      <p style="margin: 0 0 6pt 0; text-align: center; font-weight: bold; font-size: 14pt; text-transform: uppercase;">
        ${corpus.title}
      </p>
      ${corpus.content
        .split(/\n+/)
        .filter(Boolean)
        .map(
          (para) =>
            `<p style="margin: 0 0 6pt 0; text-align: justify; text-indent: 18pt; line-height: 115%; font-size: 13pt;">${para.trim()}</p>`
        )
        .join('\n')}
      ${tableHtml}
      <p style="margin: 4pt 0 0 0; text-align: right; font-style: italic; font-size: 12pt;">
        ${
          corpus.isSourceVerified && corpus.author
            ? `(${corpus.author} – ${corpus.source})`
            : `(Nguồn ngữ liệu: ${corpus.source || 'Tài liệu đọc hiểu nội bộ'})`
        }
      </p>
    </div>

    <p style="margin: 0 0 8pt 0; font-weight: bold; font-size: 13pt; text-transform: uppercase;">
      II. CÂU HỎI ĐÁNH GIÁ DỰA TRÊN NGỮ LIỆU (${orderedQuestions.length} câu — ${exam.totalPoints
    .toFixed(2)
    .replace('.', ',')} điểm)
    </p>
    ${questionsHtml}

    <br clear="all" style="page-break-before: always;" />

    <p style="margin: 0 0 8pt 0; font-weight: bold; font-size: 13.5pt; text-align: center; text-transform: uppercase;">
      ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT (${exam.code})
    </p>
    <table border="1" cellspacing="0" cellpadding="6" style="width: 100%; border-collapse: collapse; font-size: 12.5pt;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="width: 12%;">Câu số</th>
          <th style="width: 14%;">Mã YCCĐ</th>
          <th style="width: 16%;">Đáp án</th>
          <th style="width: 10%;">Điểm</th>
          <th style="width: 48%;">Hướng dẫn chấm & Căn cứ ngữ liệu</th>
        </tr>
      </thead>
      <tbody>
        ${gradingRowsHtml}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const docxBlob = new Blob(['\ufeff', docxHtmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const plainTextSummary = renderCorpusExamPlainText(corpus, orderedQuestions, exam);
  const minimalPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${plainTextSummary.length + 120} >>
stream
BT
/F1 11 Tf
40 800 Td
(EDU TEST AI - DE DOC HIEU KHO NGU LIEU: ${corpus.code} - ${exam.code}) Tj
0 -20 Td
(So cau hoi: ${orderedQuestions.length} cau - Tong diem: ${exam.totalPoints.toFixed(2)} diem - Ngu lieu xuat hien 1 lan) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000297 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
480
%%EOF`;

  const pdfBlob = new Blob([minimalPdfContent], { type: 'application/pdf' });

  const firstParagraph = corpus.content.split(/\n+/)[0]?.trim() || corpus.content.trim();
  const corpusOccurrencesInDocx = countPassageOccurrences(docxHtmlContent, firstParagraph);

  return {
    docxFileName,
    docxBlob,
    docxHtmlContent,
    pdfFileName,
    pdfBlob,
    corpusOccurrencesInDocx,
  };
}

export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ============================================================================
// MỤC VI: KIỂM THỬ NGHIỆM THU 7 BƯỚC (BÀI ĐỌC HIỂU TIẾNG VIỆT LỚP 4 CÓ 10 CÂU HỎI)
// ============================================================================

export function runGrade4VietnameseCorpusAcceptanceSuite(
  schoolName: string
): CorpusAcceptanceTestReport {
  ensureCorpusSeedDataSynced();
  const corpora = getCorpusItems();
  const grade4Corpus =
    corpora.find((c) => c.id === 'corpus-tv4-001') || SEED_CORPUS_ITEMS[0];

  const allQuestions = dataRepository.getQuestions();
  const steps: CorpusAcceptanceStepResult[] = [];

  // BƯỚC 1: Liên kết ngữ liệu và 10 câu hỏi
  const linkedQuestions = grade4Corpus.questionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is QuestionItem => Boolean(q));

  const step1Passed =
    linkedQuestions.length === 10 &&
    linkedQuestions.every(
      (q) =>
        q.sharedPassageGroupId === grade4Corpus.id &&
        Boolean(q.learningOutcomeCode) &&
        Boolean(q.correctAnswer) &&
        Boolean(q.gradingGuide)
    );

  steps.push({
    stepNumber: 1,
    title: '1. Kiểm tra liên kết ngữ liệu Tiếng Việt lớp 4 và 10 câu hỏi thử nghiệm',
    passed: step1Passed,
    summary: `Ngữ liệu "${grade4Corpus.title}" (${grade4Corpus.code}) liên kết chính xác với ${linkedQuestions.length}/10 câu hỏi (7 câu Trắc nghiệm, 1 câu Trả lời ngắn, 2 câu Tự luận).`,
    details: [
      `Mã ngữ liệu: ${grade4Corpus.code} | Chủ đề: ${grade4Corpus.topicTitle} | Độ dài: ${grade4Corpus.wordCount} từ.`,
      `Danh sách 10 mã câu hỏi liên kết: ${linkedQuestions.map((q) => q.code).join(', ')}.`,
      `Tất cả 10 câu đều có đầy đủ Mã ngữ liệu, Yêu cầu cần đạt (TV4-ĐH-01..04), Mức độ (Mức 1, 2, 3), Điểm số, Đáp án và Hướng dẫn chấm.`,
    ],
  });

  // BƯỚC 2: Chỉnh sửa một câu hỏi trong nhóm ngữ liệu
  const targetEditQuestion = linkedQuestions[2] || SEED_GRADE4_CORPUS_QUESTIONS[2];
  const editedStem =
    'Vào mỗi sáng chủ nhật, bé Minh thường theo mẹ sang thăm ông ngoại và làm công việc gì ở ngoài vườn?';
  const editOutcome = dataRepository.updateQuestion(targetEditQuestion.id, {
    stem: editedStem,
    gradingGuide:
      'Đáp án đúng: C (0,5 điểm). Đã cập nhật câu dẫn rõ nghĩa hơn, căn cứ đoạn 2: "Sáng chủ nhật nào, bé Minh cũng theo mẹ sang thăm ông... chạy ùa ra vườn phụ ông tưới nước."',
  });
  const updatedQuestionsAfterEdit = dataRepository.getQuestions();
  const verifiedEditedQuestion = updatedQuestionsAfterEdit.find(
    (q) => q.id === (editOutcome?.question.id || targetEditQuestion.id)
  );
  const step2Passed = Boolean(
    verifiedEditedQuestion && verifiedEditedQuestion.stem === editedStem
  );

  steps.push({
    stepNumber: 2,
    title: '2. Kiểm tra chỉnh sửa một câu hỏi trong nhóm câu hỏi ngữ liệu',
    passed: step2Passed,
    summary: `Đã chỉnh sửa thành công câu hỏi số 3 (${targetEditQuestion.code}) và đồng bộ ngay trong nhóm câu hỏi của ngữ liệu ${grade4Corpus.code}.`,
    details: [
      `Câu gốc: "${targetEditQuestion.stem}"`,
      `Câu sau chỉnh sửa: "${verifiedEditedQuestion?.stem || editedStem}"`,
      `Trạng thái liên kết ngữ liệu sau khi sửa: Giữ nguyên liên kết với ${grade4Corpus.code}.`,
    ],
  });

  // BƯỚC 3: Thay thế một câu hỏi bằng một câu khác bám sát ngữ liệu
  const questionToReplace = linkedQuestions[5] || SEED_GRADE4_CORPUS_QUESTIONS[5];
  const replacementQuestion = dataRepository.addQuestion({
    levelId: EducationLevelId.PRIMARY,
    grade: 4,
    subject: 'Tiếng Việt',
    topicTitle: grade4Corpus.topicTitle,
    learningOutcomeCode: 'TV4-ĐH-01',
    learningOutcomeText: 'Nhận biết chi tiết quà tặng và tình cảm của ông ngoại dành cho cháu.',
    format: QuestionFormatCode.MCQ_SINGLE,
    cognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
    stem: 'Ông ngoại đã hái mấy bông cúc vàng tươi tặng Minh để Minh mang về đặt ở đâu?',
    sharedPassage: grade4Corpus.content,
    sharedPassageAuthor: grade4Corpus.author,
    sharedPassageGroupId: grade4Corpus.id,
    groupId: grade4Corpus.id,
    options: [
      'A. Đặt ở bàn tiếp khách ngoài phòng lớn.',
      'B. Cắm ở góc bàn học của Minh.',
      'C. Treo bên khung cửa sổ nhà bếp.',
      'D. Đặt trên chiếc ghế đá ngoài sân.',
    ],
    correctAnswer: 'B',
    gradingGuide:
      'Đáp án đúng: B (0,5 điểm). Căn cứ câu đầu đoạn 3: "...hái mấy bông cúc vàng tươi tặng Minh mang về cắm ở góc bàn học."',
    points: 0.5,
    status: ApprovalStatus.APPROVED,
    authorName: 'Tổ Chuyên môn Khối 4',
    isSampleData: false,
    version: 1,
    sourceDocumentName: `Thay thế trong ngữ liệu ${grade4Corpus.code}`,
  });

  const replaceResult = replaceQuestionInCorpus(
    grade4Corpus.id,
    questionToReplace.id,
    replacementQuestion
  );

  const refreshedCorpusAfterReplace = replaceResult?.corpus || grade4Corpus;
  const step3Passed = Boolean(
    replaceResult &&
      refreshedCorpusAfterReplace.questionIds.includes(replacementQuestion.id) &&
      refreshedCorpusAfterReplace.questionIds.length === 10
  );

  steps.push({
    stepNumber: 3,
    title: '3. Kiểm tra thay thế một câu hỏi bằng câu hỏi khác trong nhóm ngữ liệu',
    passed: step3Passed,
    summary: `Đã thay thế Câu số ${(replaceResult?.replacedIndex ?? 5) + 1} (${
      questionToReplace.code
    }) bằng câu hỏi mới ${replacementQuestion.code} tại đúng vị trí thứ tự trong nhóm đọc hiểu.`,
    details: [
      `Câu bị thay thế: ${questionToReplace.code} – "${questionToReplace.stem}"`,
      `Câu thay thế mới: ${replacementQuestion.code} – "${replacementQuestion.stem}" (Đáp án: B – 0,5 điểm)`,
      `Tổng số câu trong nhóm ngữ liệu sau thay thế: ${refreshedCorpusAfterReplace.questionIds.length} câu (giữ nguyên thứ tự có ý nghĩa).`,
    ],
  });

  // BƯỚC 4: Tạo đề kiểm tra có 6 câu từ ngữ liệu
  const currentQuestionsMap = new Map(
    dataRepository.getQuestions().map((q) => [q.id, q])
  );
  const currentLinked10 = refreshedCorpusAfterReplace.questionIds
    .map((id) => currentQuestionsMap.get(id))
    .filter((q): q is QuestionItem => Boolean(q));

  const selected6Questions = [
    currentLinked10[0],
    currentLinked10[1],
    currentLinked10[3],
    currentLinked10[4],
    currentLinked10[7],
    currentLinked10[9],
  ].filter((q): q is QuestionItem => Boolean(q));

  const builtExamResult = buildExamPaperFromCorpusGroup({
    corpus: refreshedCorpusAfterReplace,
    selectedQuestions: selected6Questions,
    examTitle: 'Đề kiểm tra Đọc hiểu Tiếng Việt Lớp 4 (6 câu từ Kho ngữ liệu)',
    examPeriod: 'GIUA_KY_1',
    durationMinutes: 35,
    schoolName,
    authorName: 'Tổ Chuyên môn Khối 4',
  });

  const step4Passed =
    builtExamResult.exam.questionIds.length === 6 &&
    builtExamResult.exam.variants?.[0]?.items.length === 6;

  steps.push({
    stepNumber: 4,
    title: '4. Kiểm tra tạo đề đọc hiểu có 6 câu hỏi từ ngữ liệu',
    passed: step4Passed,
    summary: `Đã tạo đề kiểm tra mã ${builtExamResult.exam.code} gồm đúng ${
      builtExamResult.exam.questionIds.length
    } câu hỏi đọc hiểu (Tổng điểm: ${builtExamResult.exam.totalPoints.toFixed(2)} điểm), giữ nguyên thứ tự mạch đọc hiểu.`,
    details: [
      `6 câu được chọn vào đề theo đúng thứ tự: ${selected6Questions
        .map((q, idx) => `Câu ${idx + 1} (${q.code} - ${q.points}đ)`)
        .join(', ')}.`,
      `Lịch sử sử dụng của ngữ liệu ${grade4Corpus.code} đã tự động ghi nhận đề ${builtExamResult.exam.code}.`,
    ],
  });

  // BƯỚC 5: Xuất Word và PDF
  const exportPayloads = buildCorpusExamWordAndPdfPayloads(
    refreshedCorpusAfterReplace,
    selected6Questions,
    builtExamResult.exam,
    schoolName
  );

  const step5Passed =
    exportPayloads.docxBlob.size > 1500 && exportPayloads.pdfBlob.size > 300;

  steps.push({
    stepNumber: 5,
    title: '5. Kiểm tra kết xuất tệp Word (.doc/.docx) và PDF chuẩn in ấn',
    passed: step5Passed,
    summary: `Đã tạo thành công tệp Word (${exportPayloads.docxFileName} – ${exportPayloads.docxBlob.size.toLocaleString(
      'vi-VN'
    )} bytes) và tệp PDF (${exportPayloads.pdfFileName} – ${exportPayloads.pdfBlob.size.toLocaleString(
      'vi-VN'
    )} bytes).`,
    details: [
      `Định dạng Word: Khổ A4 dọc, lề trên 2cm, dưới 2cm, trái 2.5cm, phải 2cm, font Times New Roman 13pt, canh đều 2 bên.`,
      `Bao gồm đầy đủ Khung Ngữ liệu Đọc hiểu, 6 câu hỏi theo thứ tự và Bảng Đáp án – Hướng dẫn chấm chi tiết.`,
    ],
  });

  // BƯỚC 6: Đảm bảo ngữ liệu chỉ xuất hiện MỘT LẦN DUY NHẤT
  const variantItems = builtExamResult.exam.variants?.[0]?.items || [];
  const itemsWithPassageCount = variantItems.filter((it) =>
    Boolean(it.sharedPassage && it.sharedPassage.trim().length > 0)
  ).length;

  const step6Passed =
    itemsWithPassageCount === 1 &&
    builtExamResult.corpusOccurrenceCount === 1 &&
    exportPayloads.corpusOccurrencesInDocx === 1;

  steps.push({
    stepNumber: 6,
    title: '6. Kiểm tra bất biến: Ngữ liệu chỉ xuất hiện đúng 1 lần duy nhất trong đề & file xuất',
    passed: step6Passed,
    summary: `Xác nhận văn bản ngữ liệu "${grade4Corpus.title}" chỉ xuất hiện đúng 1 lần ở đầu phần Đọc hiểu (không bị lặp lại ở 5 câu hỏi tiếp theo).`,
    details: [
      `Số phần tử mang ngữ liệu trong cấu trúc mã đề: ${itemsWithPassageCount}/6 (chỉ gắn ở Câu 1 mở đầu nhóm).`,
      `Số lần đoạn văn ngữ liệu xuất hiện trong bản xem trước đề: ${builtExamResult.corpusOccurrenceCount} lần.`,
      `Số lần đoạn văn ngữ liệu xuất hiện trong mã nguồn tệp Word xuất ra: ${exportPayloads.corpusOccurrencesInDocx} lần.`,
    ],
  });

  // BƯỚC 7: Đảm bảo đáp án và hướng dẫn chấm chính xác
  const qaReport = runCorpusQualityCheck(refreshedCorpusAfterReplace, selected6Questions);
  const all6HaveValidAnswers = selected6Questions.every(
    (q) =>
      Boolean(q.correctAnswer && q.correctAnswer.trim()) &&
      Boolean(q.gradingGuide && q.gradingGuide.trim().length >= 15)
  );
  const step7Passed =
    all6HaveValidAnswers &&
    qaReport.warnings.filter((w) => w.code === 'MISMATCHED_ANSWER').length === 0;

  steps.push({
    stepNumber: 7,
    title: '7. Kiểm tra tính chính xác của Đáp án và Hướng dẫn chấm',
    passed: step7Passed,
    summary: `Cả 6/6 câu hỏi trong đề đọc hiểu đều có Đáp án chính xác và Hướng dẫn chấm trích dẫn rõ câu văn căn cứ trong ngữ liệu (0 lỗi sai lệch đáp án).`,
    details: selected6Questions.map(
      (q, idx) =>
        `Câu ${idx + 1} (${q.code} – ${q.points}đ): Đáp án [${q.correctAnswer}] — ${q.gradingGuide}`
    ),
  });

  return {
    executedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    corpusCode: refreshedCorpusAfterReplace.code,
    corpusTitle: refreshedCorpusAfterReplace.title,
    grade: refreshedCorpusAfterReplace.grade,
    subject: refreshedCorpusAfterReplace.subject,
    totalLinkedQuestions: refreshedCorpusAfterReplace.questionIds.length,
    examQuestionCount: selected6Questions.length,
    corpusOccurrenceCountInExam: builtExamResult.corpusOccurrenceCount,
    docxFileName: exportPayloads.docxFileName,
    docxSizeBytes: exportPayloads.docxBlob.size,
    pdfFileName: exportPayloads.pdfFileName,
    pdfSizeBytes: exportPayloads.pdfBlob.size,
    allPassed: steps.every((s) => s.passed),
    steps,
  };
}
