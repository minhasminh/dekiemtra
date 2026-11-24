import {
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
} from '../types/domain';

export interface SelectableMatrixLesson {
  id: string;
  semester: 'HK1' | 'HK2';
  lessonName: string; // VD: "Bài 1. Giới thiệu về Khoa học tự nhiên"
  periodsCount: number; // VD: 2
  chapterCode: string;
  chapterTitle: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  outcomesList?: string[]; // Danh sách từng Yêu cầu cần đạt đơn lẻ của bài học (đã lược bỏ ký hiệu NLS & AI)
}

/**
 * Lược bỏ triệt để các ký hiệu viết tắt Năng lực số (NLS), Trí tuệ nhân tạo (AI),
 * ghi chú tuần/tiết và ghi chú kiểm tra định kì để Yêu cầu cần đạt ngắn gọn, dễ nhìn.
 */
export function cleanLearningOutcomeText(
  rawText: string,
  lessonName?: string
): string {
  if (!rawText) return '';
  let text = rawText.trim();

  // 1. Bỏ phần tiền tố "[Tuần ... - Tiết ... (... tiết)]:" nếu chuỗi lấy từ lo.description
  text = text.replace(
    /^[\s\S]*?\[\s*(?:Tuần|Tiết)[^\]]*\]\s*:\s*/i,
    ''
  );

  // 2. Cắt bỏ hoàn toàn khối "Định hướng phát triển NLS..." / "Phát triển NLS..." ở cuối đoạn
  text = text.replace(
    /(?:[.;\n]|^)\s*(?:Định hướng\s+phát\s+triển|Phát\s+triển)\s+(?:NLS|năng\s+lực\s+số|AI\b)[\s\S]*$/i,
    ''
  );
  text = text.replace(
    /(?:[.;\n]|^)\s*NLS\s*[-–&/]\s*AI\s*:[\s\S]*$/i,
    ''
  );

  // 3. Xử lý các dòng gạch đầu dòng "- Tích hợp NLS ...:" / "- Tích hợp AI ...:" ở cấp Tiểu học / THCS:
  // Loại bỏ hoàn toàn dòng chỉ chứa mã hoặc lược bỏ phần tiền tố "Tích hợp NLS/AI ...:" giữ lại nội dung môn học
  text = text.replace(
    /(?:^|\n)\s*[-•+]?\s*(?:Tích\s+hợp|Lồng\s+ghép)\s+(?:NLS|AI|năng\s+lực\s+số|trí\s+tuệ\s+nhân\s+tạo)[^:\n]*:\s*/gi,
    '\n'
  );
  text = text.replace(
    /(?:^|\n)\s*[-•+]?\s*(?:Tích\s+hợp|Lồng\s+ghép)\s+(?:QCN|BVMT|ATGT|QPAN|ANQP|BĐKH(?:\s*&\s*PCTT)?|ĐĐLS|KNS|STEM|GDĐP|GDSK|TTHCM)[^:\n]*:\s*/gi,
    '\n'
  );
  text = text.replace(
    /(?:^|\n)\s*[-•+]?\s*Nội\s+dung\s+(?:điều\s+chỉnh(?:,\s*bổ\s+sung)?|giữ\s+nguyên|bổ\s+sung)\s*:\s*/gi,
    '\n'
  );

  // 4. Loại bỏ nhãn "YCCĐ:" hoặc "Yêu cầu cần đạt:"
  text = text.replace(/\b(?:YCCĐ|Yêu\s+cầu\s+cần\s+đạt)\s*:\s*/gi, '');

  // 5. Loại bỏ tất cả các mã ký hiệu viết tắt NLS (VD: 1.1.CB1a, 4.1.TC1a, 5.2.TC2b, 3.1.NC1a) và mã AI (VD: AI 7.A3.1, 4.A1.1, 8.B2.MR1)
  text = text.replace(
    /\(\s*(?:NLS|AI)?\s*[1-9]\.[0-9A-D][^)]*\)/gi,
    ''
  );
  text = text.replace(
    /\b(?:NLS\s*)?[1-6]\.[1-9]\.?(?:CB|TC|NC)[0-9]*[a-e]?\b/gi,
    ''
  );
  text = text.replace(
    /\b(?:AI\s*)?[1-9]\.[A-D][1-9]\.(?:[0-9]+|MR[0-9]+)\b/gi,
    ''
  );
  text = text.replace(/\bAI\s*\([^)]*\)/gi, '');
  text = text.replace(/\((?:[^)]*\b(?:NLS|AI)\b[^)]*)\)/gi, '');
  text = text.replace(/\bNL[a-e]\b/g, '');
  text = text.replace(/\bNLS\s*[-–&/]\s*AI\b/gi, '');
  text = text.replace(/\bNLS\b/g, '');

  // 6. Loại bỏ ghi chú "(Bài 1)", "(Bài 2, 3)" còn sót lại sau khi xóa mã NLS/AI
  text = text.replace(
    /\(\s*(?:Bài(?:\s+tập\s+cuối\s+chương)?|Unit|Chủ\s+đề|Tiết)\s+[^)]*\)/gi,
    ''
  );

  // 7. Loại bỏ ghi chú "Kiểm tra giữa/cuối học kì ... (90 phút)"
  text = text.replace(
    /(?:[.;]\s*|\s+)(?:Ôn\s+tập\s*(?:&|và|,)?\s*)?Kiểm\s+tra\s+(?:giữa|cuối|định\s+kì)\s*(?:học\s*)?(?:kì|HK)\s*[I12V]*\s*(?:\(\d+\s*phút\))?\.?/gi,
    ''
  );

  // 8. Làm sạch dấu câu thừa sau khi lược bỏ mã
  text = text
    .replace(/\s*[,;&]+\s*(?=[.;\n]|$)/g, '')
    .replace(/(?:^|\n)\s*[-•+,;:]+\s*/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  if (!text && lessonName) {
    return `Nắm vững và vận dụng kiến thức trọng tâm ${lessonName}.`;
  }
  return text;
}

// Bổ sung Yêu cầu cần đạt chi tiết theo từng bài học cho các bài học THCS có YCCĐ gộp ngắn
const DETAILED_LESSON_OUTCOMES_BY_NAME: Record<string, string[]> = {
  // Tin học 7
  'bài 1. thiết bị vào - ra': [
    'Nhận biết và nêu được chức năng của các thiết bị vào - ra cơ bản trong máy tính.',
    'Thực hiện kết nối đúng cách và sử dụng an toàn các thiết bị vào - ra thông dụng.',
  ],
  'bài 2. phần mềm máy tính': [
    'Phân biệt được chức năng của hệ điều hành và phần mềm ứng dụng trên máy tính.',
    'Nêu được tên một số phần mềm ứng dụng thông dụng, phần mềm nguồn mở và phần mềm thương mại.',
  ],
  'bài 3. quản lý dữ liệu trong máy tính': [
    'Thực hiện được các thao tác tạo, sao chép, di chuyển, đổi tên thư mục và tệp tin trong máy tính.',
    'Nêu và thực hiện được các biện pháp bảo vệ an toàn dữ liệu (sao lưu dữ liệu, phòng chống virus).',
  ],
  'bài 4. mạng xã hội và một số kênh trao đổi thông tin trên internet': [
    'Nêu được chức năng cơ bản của mạng xã hội và một số kênh trao đổi thông tin trên Internet.',
    'Sử dụng được một số chức năng cơ bản của mạng xã hội để giao lưu và chia sẻ thông tin an toàn.',
  ],
  'bài 5. ứng xử trên mạng': [
    'Thực hiện giao tiếp và ứng xử có văn hóa, đúng quy tắc đạo đức trong môi trường mạng.',
    'Biết cách tự bảo vệ thông tin cá nhân và tìm kiếm sự trợ giúp khi gặp tình huống bắt nạt trên mạng.',
  ],
  'bài 6. làm quen với phần mềm bảng tính': [
    'Nhận biết được các thành phần cơ bản trên màn hình làm việc của phần mềm bảng tính.',
    'Nhập, chỉnh sửa và định dạng được dữ liệu cơ bản trong trang tính.',
  ],
  'bài 7. tính toán tự động trên bảng tính': [
    'Biết cách nhập công thức tính toán tự động và sử dụng địa chỉ ô tính trong công thức.',
    'Thực hiện sao chép công thức và vận dụng tính toán dữ liệu thực tế trên trang tính.',
  ],
  'bài 8. công cụ hỗ trợ tính toán': [
    'Sử dụng được các hàm cơ bản (SUM, AVERAGE, MAX, MIN, COUNT) để tính toán trên bảng tính.',
    'Vận dụng đúng các hàm tính toán để giải quyết bài toán thống kê thực tiễn.',
  ],
  'bài 9. trình bày bảng tính': [
    'Định dạng được phông chữ, căn lề, kẻ khung và màu nền cho bảng dữ liệu.',
    'Thực hiện chèn, xóa hàng, cột và trình bày trang tính rõ ràng, thẩm mỹ.',
  ],
  'bài 10. hoàn thiện bảng tính': [
    'Thực hiện kiểm tra, thiết lập trang in và quản lý sổ tính có nhiều trang tính.',
    'Hoàn thiện bảng tính tổng hợp phục vụ bài toán quản lý thực tế.',
  ],
};

/**
 * Chuẩn hóa tên môn học từ hồ sơ phân quyền/phân công giảng dạy sang tên môn chuẩn trong Ngân hàng câu hỏi & Chương trình GDPT 2018
 */
export function normalizeCanonicalSubjectName(
  rawSubject: string,
  levelId?: EducationLevelId | string
): string {
  const s = (rawSubject || '').trim();
  if (!s) return s;
  const lower = s.toLowerCase();
  if (
    lower === 'ngoại ngữ 1' ||
    lower === 'ngoại ngữ 1 (tiếng anh)' ||
    lower === 'tiếng anh'
  ) {
    return 'Tiếng Anh';
  }
  if (
    lower === 'vật lí' ||
    lower === 'vật lý' ||
    lower === 'hóa học' ||
    lower === 'hoá học' ||
    lower === 'sinh học' ||
    lower === 'khoa học tự nhiên'
  ) {
    return levelId === EducationLevelId.PRIMARY || levelId === 'PRIMARY'
      ? 'Khoa học'
      : 'Khoa học tự nhiên';
  }
  if (
    lower === 'lịch sử' ||
    lower === 'địa lí' ||
    lower === 'địa lý' ||
    lower === 'lịch sử & địa lí' ||
    lower === 'lịch sử & địa lý' ||
    lower === 'lịch sử và địa lý' ||
    lower === 'lịch sử và địa lí'
  ) {
    return 'Lịch sử và Địa lí';
  }
  if (lower === 'gdcd' || lower === 'giáo dục công dân') {
    return 'Giáo dục công dân';
  }
  if (lower === 'gdđp' || lower === 'nội dung giáo dục của địa phương') {
    return 'Nội dung giáo dục của địa phương';
  }
  if (lower === 'hđtn' || lower === 'hđtn, hn' || lower.startsWith('hoạt động trải nghiệm')) {
    return levelId === EducationLevelId.PRIMARY || levelId === 'PRIMARY'
      ? 'Hoạt động trải nghiệm'
      : 'Hoạt động trải nghiệm, hướng nghiệp';
  }
  if (lower === 'gdkt&pl' || lower === 'giáo dục kinh tế và pháp luật') {
    return 'Giáo dục công dân';
  }
  if (lower === 'nghệ thuật (âm nhạc)' || lower === 'âm nhạc') {
    return levelId === EducationLevelId.PRIMARY || levelId === 'PRIMARY'
      ? 'Nghệ thuật (Âm nhạc)'
      : 'Âm nhạc';
  }
  if (
    lower === 'nghệ thuật (mĩ thuật)' ||
    lower === 'nghệ thuật (mỹ thuật)' ||
    lower === 'mĩ thuật' ||
    lower === 'mỹ thuật'
  ) {
    return levelId === EducationLevelId.PRIMARY || levelId === 'PRIMARY'
      ? 'Nghệ thuật (Mĩ thuật)'
      : 'Mĩ thuật';
  }
  if (lower === 'gdtc' || lower === 'thể dục' || lower === 'giáo dục thể chất') {
    return 'Giáo dục thể chất';
  }
  return s;
}

/**
 * Kiểm tra hai tên môn học có tương đương nhau theo Chương trình GDPT 2018 hay không
 */
export function areSubjectNamesEquivalent(subjA: string, subjB: string): boolean {
  const a = (subjA || '').trim();
  const b = (subjB || '').trim();
  if (!a || !b) return false;
  if (a.toLowerCase() === b.toLowerCase()) return true;
  const normAPrimary = normalizeCanonicalSubjectName(a, EducationLevelId.PRIMARY).toLowerCase();
  const normBPrimary = normalizeCanonicalSubjectName(b, EducationLevelId.PRIMARY).toLowerCase();
  if (normAPrimary === normBPrimary) return true;
  const normASec = normalizeCanonicalSubjectName(
    a,
    EducationLevelId.LOWER_SECONDARY
  ).toLowerCase();
  const normBSec = normalizeCanonicalSubjectName(
    b,
    EducationLevelId.LOWER_SECONDARY
  ).toLowerCase();
  return normASec === normBSec;
}

/**
 * Tách nội dung Yêu cầu cần đạt của một bài học thành danh sách từng Yêu cầu cần đạt riêng biệt
 * (Mỗi Yêu cầu cần đạt hiển thị trên 1 dòng và có bộ ô nhập số lượng câu hỏi riêng).
 */
export function splitLessonOutcomes(
  rawOrCleanedText: string,
  lessonName?: string
): string[] {
  if (lessonName) {
    const normName = lessonName
      .replace(/\s*\(\d+\s*tiết[^)]*\)\s*$/i, '')
      .trim()
      .toLowerCase();
    if (DETAILED_LESSON_OUTCOMES_BY_NAME[normName]) {
      return DETAILED_LESSON_OUTCOMES_BY_NAME[normName];
    }
  }

  const cleaned = cleanLearningOutcomeText(rawOrCleanedText, lessonName);
  if (!cleaned) {
    return lessonName
      ? [`Nắm vững và vận dụng kiến thức trọng tâm ${lessonName}.`]
      : ['Đạt chuẩn kiến thức, kĩ năng theo chương trình quy định.'];
  }

  // Bước 1: Tách theo xuống dòng, dấu chấm phẩy (;), hoặc dấu chấm câu kết thúc ý (. + Chữ hoa)
  const primaryParts = cleaned
    .split(
      /(?:\r?\n+|;\s*|\.\s+(?=[A-ZĐÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]))/
    )
    .map((s) => s.replace(/^[-•+*]+\s*/, '').trim())
    .filter((s) => s.length >= 8);

  const finalOutcomes: string[] = [];

  // Bước 2: Nếu một mệnh đề gộp nhiều động từ hành động nhận thức (VD: "Trình bày được ... và phân biệt được ...") -> tách thành từng dòng YCCĐ
  const verbSplitRegex =
    /(?:,\s*|\s+và\s+|\s+đồng\s+thời\s+)(?=(?:nêu|trình\s+bày|phân\s+biệt|nhận\s+biết|mô\s+tả|giải\s+thích|vận\s+dụng|thực\s+hiện|sử\s+dụng|xác\s+định|tính\s+toán|tính\s+được|vẽ\s+được|đọc\s+và\s+viết|so\s+sánh|phân\s+tích|đánh\s+giá|lựa\s+chọn|thiết\s+lập|biểu\s+diễn|chứng\s+minh|giải\s+quyết|nhận\s+diện|khắc\s+phục|rút\s+gọn|quy\s+đồng|ước\s+lượng|giải\s+bài\s+toán|giải\s+hệ|giải\s+phương\s+trình)\b)/i;

  for (const part of primaryParts) {
    const subParts = part
      .split(verbSplitRegex)
      .map((sp) => sp.trim())
      .filter((sp) => sp.length >= 12);

    if (subParts.length > 1) {
      for (const sp of subParts) {
        const cap = sp.charAt(0).toUpperCase() + sp.slice(1);
        finalOutcomes.push(cap.endsWith('.') ? cap : `${cap}.`);
      }
    } else {
      const cap = part.charAt(0).toUpperCase() + part.slice(1);
      finalOutcomes.push(cap.endsWith('.') ? cap : `${cap}.`);
    }
  }

  // Khử trùng lặp
  const unique = Array.from(new Set(finalOutcomes));
  return unique.length > 0
    ? unique
    : [
        cleaned.charAt(0).toUpperCase() +
          cleaned.slice(1) +
          (cleaned.endsWith('.') ? '' : '.'),
      ];
}

const KHTN6_LESSONS: Omit<
  SelectableMatrixLesson,
  'id' | 'chapterCode' | 'learningOutcomeCode'
>[] = [
  // HỌC KÌ 1 (Bài 1 -> Bài 29)
  {
    semester: 'HK1',
    lessonName: 'Bài 1. Giới thiệu về Khoa học tự nhiên',
    periodsCount: 2,
    chapterTitle: 'Mở đầu về Khoa học tự nhiên',
    learningOutcomeText: 'Nêu được khái niệm Khoa học tự nhiên và vai trò của Khoa học tự nhiên trong cuộc sống.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 2. An toàn trong phòng thực hành',
    periodsCount: 2,
    chapterTitle: 'Mở đầu về Khoa học tự nhiên',
    learningOutcomeText: 'Trình bày được quy định an toàn và phân biệt được các kí hiệu cảnh báo trong phòng thực hành.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 3. Sử dụng kính lúp',
    periodsCount: 1,
    chapterTitle: 'Mở đầu về Khoa học tự nhiên',
    learningOutcomeText: 'Mô tả được cấu tạo và sử dụng được kính lúp để quan sát vật nhỏ.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 4. Sử dụng kính hiển vi quang học',
    periodsCount: 2,
    chapterTitle: 'Mở đầu về Khoa học tự nhiên',
    learningOutcomeText: 'Nhận biết các bộ phận và hướng dẫn sử dụng kính hiển vi quang học đúng quy trình.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 5. Đo chiều dài',
    periodsCount: 3,
    chapterTitle: 'Các phép đo',
    learningOutcomeText: 'Lựa chọn thước đo phù hợp và thực hiện đúng thao tác đo chiều dài, đổi đơn vị đo.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 6. Đo khối lượng',
    periodsCount: 2,
    chapterTitle: 'Các phép đo',
    learningOutcomeText: 'Sử dụng cân để đo khối lượng của vật và nêu được đơn vị đo khối lượng chuẩn.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 7. Đo thời gian',
    periodsCount: 2,
    chapterTitle: 'Các phép đo',
    learningOutcomeText: 'Thực hiện đo thời gian bằng đồng hồ và khắc phục các sai số thường gặp.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 8. Đo nhiệt độ',
    periodsCount: 3,
    chapterTitle: 'Các phép đo',
    learningOutcomeText: 'Nêu được nguyên lí hoạt động của nhiệt kế và đo nhiệt độ theo thang Celsius.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 9. Sự đa dạng của chất',
    periodsCount: 2,
    chapterTitle: 'Các thể của chất',
    learningOutcomeText: 'Phân biệt được vật thể tự nhiên, vật thể nhân tạo, vật hữu sinh, vật vô sinh và tính chất của chất.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 10. Các thể của chất và sự chuyển thể',
    periodsCount: 2,
    chapterTitle: 'Các thể của chất',
    learningOutcomeText: 'So sánh đặc điểm 3 thể rắn, lỏng, khí và giải thích các quá trình nóng chảy, đông đặc, bay hơi, ngưng tụ.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 11. Oxygen. Không khí',
    periodsCount: 3,
    chapterTitle: 'Oxygen và không khí',
    learningOutcomeText: 'Nêu được tính chất của oxygen, thành phần phần trăm các khí trong không khí và biện pháp bảo vệ môi trường không khí.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 12. Một số vật liệu',
    periodsCount: 2,
    chapterTitle: 'Một số vật liệu, nguyên liệu, nhiên liệu, lương thực – thực phẩm',
    learningOutcomeText: 'Trình bày tính chất và ứng dụng của một số vật liệu thông dụng (kim loại, nhựa, gỗ, cao su, thủy tinh, gốm).',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 13. Một số nguyên liệu',
    periodsCount: 2,
    chapterTitle: 'Một số vật liệu, nguyên liệu, nhiên liệu, lương thực – thực phẩm',
    learningOutcomeText: 'Nêu được tính chất và cách khai thác, sử dụng an toàn, hiệu quả một số nguyên liệu tự nhiên.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 14. Một số nhiên liệu',
    periodsCount: 2,
    chapterTitle: 'Một số vật liệu, nguyên liệu, nhiên liệu, lương thực – thực phẩm',
    learningOutcomeText: 'Trình bày được tính chất, ứng dụng của nhiên liệu rắn, lỏng, khí và cách sử dụng nhiên liệu an toàn, tiết kiệm.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 15. Một số lương thực, thực phẩm',
    periodsCount: 2,
    chapterTitle: 'Một số vật liệu, nguyên liệu, nhiên liệu, lương thực – thực phẩm',
    learningOutcomeText: 'Nhận biết các nhóm chất dinh dưỡng trong lương thực, thực phẩm và cách bảo quản thực phẩm an toàn.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 16. Hỗn hợp các chất',
    periodsCount: 3,
    chapterTitle: 'Chất tinh khiết – Hỗn hợp',
    learningOutcomeText: 'Phân biệt được chất tinh khiết và hỗn hợp, dung dịch, huyền phù, nhũ tương.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 17. Tách chất khỏi hỗn hợp',
    periodsCount: 3,
    chapterTitle: 'Chất tinh khiết – Hỗn hợp',
    learningOutcomeText: 'Vận dụng các phương pháp lọc, cô cạn, chiết để tách các chất ra khỏi hỗn hợp.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 18. Tế bào – Đơn vị cơ bản của sự sống',
    periodsCount: 1,
    chapterTitle: 'Tế bào – Đơn vị cơ sở của sự sống',
    learningOutcomeText: 'Nêu được khái niệm tế bào, hình dạng và kích thước đa dạng của các loại tế bào.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 19. Cấu tạo và chức năng các thành phần của tế bào',
    periodsCount: 2,
    chapterTitle: 'Tế bào – Đơn vị cơ sở của sự sống',
    learningOutcomeText: 'Phân biệt được tế bào nhân sơ và nhân thực; tế bào thực vật và tế bào động vật.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 20. Sự lớn lên và sinh sản của tế bào',
    periodsCount: 2,
    chapterTitle: 'Tế bào – Đơn vị cơ sở của sự sống',
    learningOutcomeText: 'Trình bày quá trình lớn lên, phân chia của tế bào và ý nghĩa đối với sự sinh trưởng của sinh vật.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 21. Thực hành: Quan sát và phân biệt một số loại tế bào',
    periodsCount: 1,
    chapterTitle: 'Tế bào – Đơn vị cơ sở của sự sống',
    learningOutcomeText: 'Làm được tiêu bản và quan sát tế bào biểu bì vảy hành, tế bào thịt quả cà chua dưới kính hiển vi.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 22. Cơ thể sinh vật',
    periodsCount: 3,
    chapterTitle: 'Từ tế bào đến cơ thể',
    learningOutcomeText: 'Nhận biết các quá trình sống cơ bản của cơ thể và phân biệt cơ thể đơn bào với cơ thể đa bào.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 23. Tổ chức cơ thể đa bào',
    periodsCount: 4,
    chapterTitle: 'Từ tế bào đến cơ thể',
    learningOutcomeText: 'Mô tả được các cấp độ tổ chức trong cơ thể đa bào: Tế bào – Mô – Cơ quan – Hệ cơ quan – Cơ thể.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 24. Thực hành: Quan sát và mô tả cơ thể đơn bào, cơ thể đa bào',
    periodsCount: 3,
    chapterTitle: 'Từ tế bào đến cơ thể',
    learningOutcomeText: 'Quan sát, vẽ và mô tả cấu tạo cơ thể trùng roi, trùng giày và các cơ quan của cây xanh.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 25. Hệ thống phân loại sinh vật',
    periodsCount: 3,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Nêu được các bậc phân loại sinh vật từ thấp đến cao và đặc điểm của 5 giới sinh vật.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 26. Khoá lưỡng phân',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Biết cách xây dựng và sử dụng khoá lưỡng phân để phân loại một nhóm sinh vật.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 27. Vi khuẩn',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Mô tả hình dạng, cấu tạo của vi khuẩn; nêu được vai trò của vi khuẩn và cách phòng bệnh do vi khuẩn gây ra.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 28. Thực hành: Làm sữa chua và quan sát vi khuẩn',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Giải thích cơ sở khoa học và thực hiện quy trình làm sữa chua lên men lactic.',
  },
  {
    semester: 'HK1',
    lessonName: 'Bài 29. Virus',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Nêu được đặc điểm cấu tạo của virus, tác hại và các biện pháp phòng chống bệnh do virus.',
  },

  // HỌC KÌ 2 (Bài 30 -> Bài 55)
  {
    semester: 'HK2',
    lessonName: 'Bài 30. Nguyên sinh vật',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Nhận biết sự đa dạng, vai trò của nguyên sinh vật và cách phòng bệnh sốt rét, kiết lị.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 31. Thực hành: Quan sát nguyên sinh vật',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Quan sát và nhận biết trùng giày, trùng biến hình, tảo lục dưới kính hiển vi.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 32. Nấm',
    periodsCount: 3,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Phân biệt nấm đơn bào, đa bào, nấm đảm, nấm túi; nêu vai trò của nấm và cách phòng bệnh do nấm.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 33. Thực hành: Quan sát các loại nấm',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Quan sát hình thái nấm mốc, nấm rơm, nấm kim châm bằng kính lúp.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 34. Thực vật',
    periodsCount: 4,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Phân biệt các nhóm thực vật: Rêu, Dương xỉ, Hạt trần, Hạt kín và vai trò của thực vật.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 35. Thực hành: Quan sát và phân biệt một số nhóm thực vật',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Nhận dạng và phân loại mẫu vật đại diện của Rêu, Dương xỉ, Hạt trần, Hạt kín.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 36. Động vật',
    periodsCount: 4,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Phân biệt động vật không xương sống và động vật có xương sống (Cá, Lưỡng cư, Bò sát, Chim, Thú).',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 37. Thực hành: Quan sát và nhận biết một số nhóm động vật ngoài thiên nhiên',
    periodsCount: 2,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Quan sát, ghi chép và phân loại các loài động vật bắt gặp ngoài thiên nhiên.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 38. Đa dạng sinh học',
    periodsCount: 3,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Nêu được vai trò của đa dạng sinh học, nguyên nhân suy giảm và các biện pháp bảo tồn đa dạng sinh học.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 39. Tìm hiểu sinh vật ngoài thiên nhiên',
    periodsCount: 3,
    chapterTitle: 'Đa dạng thế giới sống',
    learningOutcomeText: 'Thực hành làm bộ sưu tập ảnh/mẫu vật và phân loại sinh vật ngoài thiên nhiên.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 40. Lực là gì?',
    periodsCount: 3,
    chapterTitle: 'Lực trong đời sống',
    learningOutcomeText: 'Nêu được khái niệm lực và các tác dụng của lực (làm biến đổi chuyển động, làm biến dạng vật).',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 41. Biểu diễn lực',
    periodsCount: 2,
    chapterTitle: 'Lực trong đời sống',
    learningOutcomeText: 'Nêu được đơn vị lực (N), dụng cụ đo lực (lực kế) và biểu diễn được lực bằng mũi tên.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 42. Biến dạng của lò xo',
    periodsCount: 2,
    chapterTitle: 'Lực trong đời sống',
    learningOutcomeText: 'Thực hiện thí nghiệm chứng minh độ dãn của lò xo tỉ lệ với khối lượng vật treo.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 43. Trọng lượng, lực hấp dẫn',
    periodsCount: 3,
    chapterTitle: 'Lực trong đời sống',
    learningOutcomeText: 'Phân biệt khối lượng và trọng lượng; vận dụng công thức P = 10.m.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 44. Lực ma sát',
    periodsCount: 3,
    chapterTitle: 'Lực trong đời sống',
    learningOutcomeText: 'Phân biệt ma sát trượt, ma sát nghỉ; nêu tác dụng có lợi, có hại của lực ma sát trong giao thông và đời sống.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 45. Lực cản của nước',
    periodsCount: 2,
    chapterTitle: 'Lực trong đời sống',
    learningOutcomeText: 'Nhận biết lực cản của nước phụ thuộc vào diện tích mặt cản và hình dạng vật.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 46. Năng lượng và sự truyền năng lượng',
    periodsCount: 2,
    chapterTitle: 'Năng lượng và cuộc sống',
    learningOutcomeText: 'Nhận biết mọi biến đổi trong tự nhiên đều cần năng lượng và sự truyền năng lượng giữa các vật.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 47. Một số dạng năng lượng',
    periodsCount: 2,
    chapterTitle: 'Năng lượng và cuộc sống',
    learningOutcomeText: 'Nhận diện các dạng năng lượng: động năng, thế năng, nhiệt năng, quang năng, điện năng, hóa năng.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 48. Sự chuyển hoá năng lượng',
    periodsCount: 2,
    chapterTitle: 'Năng lượng và cuộc sống',
    learningOutcomeText: 'Phát biểu định luật bảo toàn năng lượng và lấy ví dụ về sự chuyển hoá giữa các dạng năng lượng.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 49. Năng lượng hao phí',
    periodsCount: 1,
    chapterTitle: 'Năng lượng và cuộc sống',
    learningOutcomeText: 'Nhận biết năng lượng có ích và năng lượng hao phí khi sử dụng máy móc, thiết bị điện.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 50. Năng lượng tái tạo',
    periodsCount: 1,
    chapterTitle: 'Năng lượng và cuộc sống',
    learningOutcomeText: 'Phân biệt nguồn năng lượng tái tạo (mặt trời, gió, nước) và năng lượng không tái tạo (than đá, dầu mỏ).',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 51. Tiết kiệm năng lượng',
    periodsCount: 2,
    chapterTitle: 'Năng lượng và cuộc sống',
    learningOutcomeText: 'Đề xuất và thực hiện các biện pháp tiết kiệm năng lượng ở gia đình và nhà trường.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 52. Chuyển động nhìn thấy của Mặt Trời. Thiên thể',
    periodsCount: 3,
    chapterTitle: 'Trái Đất và bầu trời',
    learningOutcomeText: 'Giải thích chuyển động nhìn thấy của Mặt Trời từ Đông sang Tây do sự tự quay của Trái Đất.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 53. Mặt Trăng',
    periodsCount: 2,
    chapterTitle: 'Trái Đất và bầu trời',
    learningOutcomeText: 'Giải thích các pha nhìn thấy của Mặt Trăng trong tháng âm lịch.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 54. Hệ Mặt Trời',
    periodsCount: 3,
    chapterTitle: 'Trái Đất và bầu trời',
    learningOutcomeText: 'Mô tả cấu trúc Hệ Mặt Trời và thứ tự 8 hành tinh quay quanh Mặt Trời.',
  },
  {
    semester: 'HK2',
    lessonName: 'Bài 55. Ngân Hà',
    periodsCount: 2,
    chapterTitle: 'Trái Đất và bầu trời',
    learningOutcomeText: 'Nêu được khái niệm Ngân Hà và vị trí của Hệ Mặt Trời trong dải Ngân Hà.',
  },
];

// Danh mục bài học Toán 6 (Bộ sách Kết nối tri thức)
const TOAN6_LESSONS: Omit<
  SelectableMatrixLesson,
  'id' | 'chapterCode' | 'learningOutcomeCode'
>[] = [
  { semester: 'HK1', lessonName: 'Bài 1. Tập hợp', periodsCount: 2, chapterTitle: 'Chương I. Tập hợp các số tự nhiên', learningOutcomeText: 'Nhận biết tập hợp, phần tử của tập hợp và các cách mô tả một tập hợp.' },
  { semester: 'HK1', lessonName: 'Bài 2. Cách ghi số tự nhiên', periodsCount: 2, chapterTitle: 'Chương I. Tập hợp các số tự nhiên', learningOutcomeText: 'Nhận biết hệ thập phân, đọc và viết số La Mã từ 1 đến 30.' },
  { semester: 'HK1', lessonName: 'Bài 3. Thứ tự trong tập hợp các số tự nhiên', periodsCount: 2, chapterTitle: 'Chương I. Tập hợp các số tự nhiên', learningOutcomeText: 'So sánh hai số tự nhiên và biểu diễn số tự nhiên trên tia số.' },
  { semester: 'HK1', lessonName: 'Bài 4. Phép cộng và phép trừ số tự nhiên', periodsCount: 2, chapterTitle: 'Chương I. Tập hợp các số tự nhiên', learningOutcomeText: 'Vận dụng tính chất giao hoán, kết hợp để tính nhẩm, tính hợp lí.' },
  { semester: 'HK1', lessonName: 'Bài 5. Phép nhân và phép chia số tự nhiên', periodsCount: 3, chapterTitle: 'Chương I. Tập hợp các số tự nhiên', learningOutcomeText: 'Thực hiện phép nhân, phép chia hết và phép chia có dư với số tự nhiên.' },
  { semester: 'HK1', lessonName: 'Bài 6. Lũy thừa với số mũ tự nhiên', periodsCount: 3, chapterTitle: 'Chương I. Tập hợp các số tự nhiên', learningOutcomeText: 'Thực hiện phép nhân và phép chia hai lũy thừa cùng cơ số.' },
  { semester: 'HK1', lessonName: 'Bài 7. Thứ tự thực hiện các phép tính', periodsCount: 2, chapterTitle: 'Chương I. Tập hợp các số tự nhiên', learningOutcomeText: 'Vận dụng đúng quy tắc thứ tự thực hiện phép tính đối với biểu thức có dấu ngoặc và không có dấu ngoặc.' },
  { semester: 'HK1', lessonName: 'Bài 8. Quan hệ chia hết và tính chất', periodsCount: 2, chapterTitle: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', learningOutcomeText: 'Nhận biết ước và bội, vận dụng tính chất chia hết của một tổng.' },
  { semester: 'HK1', lessonName: 'Bài 9. Dấu hiệu chia hết', periodsCount: 3, chapterTitle: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', learningOutcomeText: 'Vận dụng dấu hiệu chia hết cho 2, 5, 3, 9 để giải toán.' },
  { semester: 'HK1', lessonName: 'Bài 10. Số nguyên tố', periodsCount: 3, chapterTitle: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', learningOutcomeText: 'Phân biệt số nguyên tố, hợp số và phân tích một số ra thừa số nguyên tố.' },
  { semester: 'HK1', lessonName: 'Bài 11. Ước chung. Ước chung lớn nhất', periodsCount: 3, chapterTitle: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', learningOutcomeText: 'Tìm ƯCLN của hai hay nhiều số và vận dụng rút gọn phân số, giải toán thực tiễn.' },
  { semester: 'HK1', lessonName: 'Bài 12. Bội chung. Bội chung nhỏ nhất', periodsCount: 3, chapterTitle: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', learningOutcomeText: 'Tìm BCNN của hai hay nhiều số và vận dụng quy đồng mẫu số, giải toán thực tiễn.' },
  { semester: 'HK1', lessonName: 'Bài 13. Tập hợp các số nguyên', periodsCount: 2, chapterTitle: 'Chương III. Số nguyên', learningOutcomeText: 'Nhận biết số nguyên âm, tập hợp Z và so sánh hai số nguyên.' },
  { semester: 'HK1', lessonName: 'Bài 14. Phép cộng và phép trừ số nguyên', periodsCount: 4, chapterTitle: 'Chương III. Số nguyên', learningOutcomeText: 'Thực hiện thành thạo phép cộng, phép trừ hai số nguyên.' },
  { semester: 'HK1', lessonName: 'Bài 15. Quy tắc dấu ngoặc', periodsCount: 2, chapterTitle: 'Chương III. Số nguyên', learningOutcomeText: 'Áp dụng quy tắc dấu ngoặc để tính tổng đại số nhanh, hợp lí.' },
  { semester: 'HK1', lessonName: 'Bài 16. Phép nhân số nguyên', periodsCount: 3, chapterTitle: 'Chương III. Số nguyên', learningOutcomeText: 'Thực hiện phép nhân hai số nguyên cùng dấu, khác dấu và vận dụng tính chất phép nhân.' },
  { semester: 'HK1', lessonName: 'Bài 17. Phép chia hết. Ước và bội của một số nguyên', periodsCount: 2, chapterTitle: 'Chương III. Số nguyên', learningOutcomeText: 'Thực hiện phép chia hết hai số nguyên và tìm ước, bội của một số nguyên.' },
  { semester: 'HK1', lessonName: 'Bài 18. Hình tam giác đều. Hình vuông. Hình lục giác đều', periodsCount: 3, chapterTitle: 'Chương IV. Một số hình phẳng trong thực tiễn', learningOutcomeText: 'Nhận dạng và mô tả đặc điểm cạnh, góc, đường chéo của tam giác đều, hình vuông, lục giác đều.' },
  { semester: 'HK1', lessonName: 'Bài 19. Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân', periodsCount: 3, chapterTitle: 'Chương IV. Một số hình phẳng trong thực tiễn', learningOutcomeText: 'Nhận biết và mô tả các yếu tố cơ bản của hình chữ nhật, hình thoi, hình bình hành, hình thang cân.' },
  { semester: 'HK1', lessonName: 'Bài 20. Chu vi và diện tích của một số tứ giác đã học', periodsCount: 4, chapterTitle: 'Chương IV. Một số hình phẳng trong thực tiễn', learningOutcomeText: 'Tính được chu vi và diện tích các hình phẳng gắn với bài toán thực tế.' },
  { semester: 'HK1', lessonName: 'Bài 21. Hình có trục đối xứng', periodsCount: 2, chapterTitle: 'Chương V. Tính đối xứng của hình phẳng trong tự nhiên', learningOutcomeText: 'Nhận biết hình có trục đối xứng và xác định trục đối xứng của hình phẳng.' },
  { semester: 'HK1', lessonName: 'Bài 22. Hình có tâm đối xứng', periodsCount: 2, chapterTitle: 'Chương V. Tính đối xứng của hình phẳng trong tự nhiên', learningOutcomeText: 'Nhận biết hình có tâm đối xứng trong hình học và trong tự nhiên.' },
  // HỌC KÌ 2
  { semester: 'HK2', lessonName: 'Bài 23. Mở rộng phân số. Phân số bằng nhau', periodsCount: 2, chapterTitle: 'Chương VI. Phân số', learningOutcomeText: 'Nhận biết phân số với tử và mẫu là số nguyên; hai phân số bằng nhau.' },
  { semester: 'HK2', lessonName: 'Bài 24. So sánh phân số. Hỗn số dương', periodsCount: 3, chapterTitle: 'Chương VI. Phân số', learningOutcomeText: 'Quy đồng mẫu nhiều phân số, so sánh phân số và đổi hỗn số ra phân số.' },
  { semester: 'HK2', lessonName: 'Bài 25. Phép cộng và phép trừ phân số', periodsCount: 3, chapterTitle: 'Chương VI. Phân số', learningOutcomeText: 'Thực hiện phép cộng, trừ phân số và vận dụng tính chất phép cộng phân số.' },
  { semester: 'HK2', lessonName: 'Bài 26. Phép nhân và phép chia phân số', periodsCount: 3, chapterTitle: 'Chương VI. Phân số', learningOutcomeText: 'Thực hiện phép nhân, chia phân số và tính giá trị biểu thức phân số.' },
  { semester: 'HK2', lessonName: 'Bài 27. Hai bài toán về phân số', periodsCount: 2, chapterTitle: 'Chương VI. Phân số', learningOutcomeText: 'Giải bài toán tìm giá trị phân số của một số cho trước và tìm một số biết giá trị phân số của nó.' },
  { semester: 'HK2', lessonName: 'Bài 28. Số thập phân', periodsCount: 2, chapterTitle: 'Chương VII. Số thập phân', learningOutcomeText: 'Nhận biết số thập phân âm, số đối và so sánh hai số thập phân.' },
  { semester: 'HK2', lessonName: 'Bài 29. Tính toán với số thập phân', periodsCount: 4, chapterTitle: 'Chương VII. Số thập phân', learningOutcomeText: 'Thực hiện cộng, trừ, nhân, chia số thập phân.' },
  { semester: 'HK2', lessonName: 'Bài 30. Làm tròn và ước lượng', periodsCount: 2, chapterTitle: 'Chương VII. Số thập phân', learningOutcomeText: 'Làm tròn số thập phân và ước lượng kết quả phép tính.' },
  { semester: 'HK2', lessonName: 'Bài 31. Một số bài toán về tỉ số và tỉ số phần trăm', periodsCount: 3, chapterTitle: 'Chương VII. Số thập phân', learningOutcomeText: 'Giải các bài toán thực tiễn về tỉ số phần trăm, lãi suất, giảm giá.' },
  { semester: 'HK2', lessonName: 'Bài 32. Điểm và đường thẳng', periodsCount: 3, chapterTitle: 'Chương VIII. Những hình học cơ bản', learningOutcomeText: 'Nhận biết điểm thuộc đường thẳng, ba điểm thẳng hàng, hai đường thẳng cắt nhau, song song.' },
  { semester: 'HK2', lessonName: 'Bài 33. Điểm nằm giữa hai điểm. Tia', periodsCount: 2, chapterTitle: 'Chương VIII. Những hình học cơ bản', learningOutcomeText: 'Nhận biết điểm nằm giữa hai điểm, tia và hai tia đối nhau.' },
  { semester: 'HK2', lessonName: 'Bài 34. Đoạn thẳng. Độ dài đoạn thẳng', periodsCount: 2, chapterTitle: 'Chương VIII. Những hình học cơ bản', learningOutcomeText: 'Đo và tính độ dài đoạn thẳng, so sánh hai đoạn thẳng.' },
  { semester: 'HK2', lessonName: 'Bài 35. Trung điểm của đoạn thẳng', periodsCount: 2, chapterTitle: 'Chương VIII. Những hình học cơ bản', learningOutcomeText: 'Xác định trung điểm của đoạn thẳng và tính độ dài đoạn thẳng.' },
  { semester: 'HK2', lessonName: 'Bài 36. Góc', periodsCount: 2, chapterTitle: 'Chương VIII. Những hình học cơ bản', learningOutcomeText: 'Nhận biết đỉnh, cạnh của góc và điểm trong của góc.' },
  { semester: 'HK2', lessonName: 'Bài 37. Số đo góc', periodsCount: 3, chapterTitle: 'Chương VIII. Những hình học cơ bản', learningOutcomeText: 'Đo góc và phân biệt góc vuông, góc nhọn, góc tù, góc bẹt.' },
  { semester: 'HK2', lessonName: 'Bài 38. Dữ liệu và thu thập dữ liệu', periodsCount: 2, chapterTitle: 'Chương IX. Dữ liệu và xác suất thực nghiệm', learningOutcomeText: 'Thu thập, phân loại dữ liệu và kiểm tra tính hợp lí của dữ liệu.' },
  { semester: 'HK2', lessonName: 'Bài 39. Bảng thống kê và biểu đồ tranh', periodsCount: 2, chapterTitle: 'Chương IX. Dữ liệu và xác suất thực nghiệm', learningOutcomeText: 'Đọc và lập bảng thống kê, biểu đồ tranh.' },
  { semester: 'HK2', lessonName: 'Bài 40. Biểu đồ cột', periodsCount: 2, chapterTitle: 'Chương IX. Dữ liệu và xác suất thực nghiệm', learningOutcomeText: 'Vẽ và phân tích dữ liệu từ biểu đồ cột.' },
  { semester: 'HK2', lessonName: 'Bài 41. Biểu đồ cột kép', periodsCount: 2, chapterTitle: 'Chương IX. Dữ liệu và xác suất thực nghiệm', learningOutcomeText: 'Đọc và so sánh số liệu trên biểu đồ cột kép.' },
  { semester: 'HK2', lessonName: 'Bài 42. Kết quả có thể và sự kiện trong trò chơi, thí nghiệm', periodsCount: 2, chapterTitle: 'Chương IX. Dữ liệu và xác suất thực nghiệm', learningOutcomeText: 'Liệt kê các kết quả có thể và nhận biết sự kiện có thể xảy ra.' },
  { semester: 'HK2', lessonName: 'Bài 43. Xác suất thực nghiệm', periodsCount: 2, chapterTitle: 'Chương IX. Dữ liệu và xác suất thực nghiệm', learningOutcomeText: 'Tính xác suất thực nghiệm của một sự kiện qua phép thử lặp lại.' },
];

/**
 * Lấy danh sách "Bài sẽ kiểm tra" phân theo Học kì 1 và Học kì 2 cho Cấp học, Khối lớp và Môn học đang chọn.
 * Ưu tiên trích xuất từ CSDL Chương trình Giáo dục (đặc biệt đầy đủ 100% cho 6 môn Khối 4 từ KHGD nhà trường),
 * và bổ sung danh mục chuẩn cho KHTN 6 (55 bài như ảnh mẫu), Toán 6, v.v.
 */
export interface MatrixChapterGroup {
  chapterKey: string;
  semester: 'HK1' | 'HK2';
  chapterCode: string;
  chapterTitle: string;
  totalPeriods: number;
  lessons: SelectableMatrixLesson[];
}

export function cleanSingleTopicOrChapterTitle(raw: string): string {
  let s = (raw || '').trim();
  if (!s) return '';

  // Loại bỏ các cụm Kiểm tra định kì / Ôn tập học kì ở cuối chuỗi (kể cả phần ngoặc số tiết đi kèm)
  s = s
    .replace(
      /\s*(?:&|;|\+|và|,)\s*(?:Ôn tập\s*(?:&|và|,)?\s*)?(?:Kiểm tra|Đánh giá|Thực hành kĩ năng)\s+(?:giữa|cuối|định kì)[^;]*(?:\([^)]*\))*\s*$/gi,
      ''
    )
    .replace(
      /\s*(?:&|;|\+|và|,)\s*Ôn tập\s+(?:giữa|cuối|học kì|HK|cuối năm)[^;]*(?:\([^)]*\))*\s*$/gi,
      ''
    )
    .replace(/,\s*Review\s+\d+(?:\s*&\s*Kiểm tra.*)?$/gi, '')
    .trim();

  // Loại bỏ các ghi chú số tiết / tuần / phạm vi bài ở cuối chuỗi (kể cả lặp 2 lần như "(2 tiết) (3 tiết)")
  let prev = '';
  while (s !== prev) {
    prev = s;
    s = s
      .replace(
        /\s*\(\s*(?:\d+\s*(?:tiết|t)[^)]*|Tuần\s+\d+[^)]*|Tiết\s+\d+[^)]*|(?:Tiết học đầu tiên\s*&\s*)?Bài\s+\d+\s*[-–]\s*Bài\s+\d+|HKI|HKII|HK1|HK2)\s*\)\s*$/gi,
        ''
      )
      .trim();
  }

  // Nếu chuỗi có dạng "Chủ đề 3: Bài 5. Ứng xử trên mạng" -> rút gọn thành "Chủ đề 3: Ứng xử trên mạng"
  s = s.replace(
    /^((?:Chương|Chủ đề|Phần|Mạch|Mô đun|Unit)\s+[^:.–-]+?)\s*[.:\-–]\s*Bài\s+\d+[a-z]?\s*[.:\-–]\s*(.+)$/i,
    '$1: $2'
  );

  return s.replace(/\s{2,}/g, ' ').trim();
}

export function extractCleanTopicTitles(rawChapterOrTopic: string): string[] {
  const raw = (rawChapterOrTopic || '').trim();
  if (!raw) return [];

  // Trường hợp 0: "GDCD 6 – Học kì I: Bài 1 đến Bài 6 (A, B, C...)" hoặc "... Chủ đề 1 đến Chủ đề 5 (A, B, C...)"
  const rangeParenMatch = raw.match(
    /^(?:[^:]+:\s*)?(Bài|Chủ đề)\s+(\d+)\s+đến\s+(?:Bài|Chủ đề)?\s*(\d+)\s*\(([^)]+)\)\s*$/i
  );
  if (rangeParenMatch) {
    const prefixWord = rangeParenMatch[1].trim();
    const startNum = parseInt(rangeParenMatch[2], 10);
    const items = rangeParenMatch[4]
      .split(/\s*,\s*/)
      .map((x) => cleanSingleTopicOrChapterTitle(x))
      .filter(Boolean);
    if (items.length > 1) {
      return items.map(
        (item, idx) => `${prefixWord} ${startNum + idx}: ${item}`
      );
    }
  }

  // Trường hợp 1: "Mĩ thuật 8 – Học kì I: Chủ đề 1 (Hình tượng...), Chủ đề 2 (...) & Chủ đề 4 (...)"
  const semHeaderMatch = raw.match(
    /^(?:Mĩ thuật|Âm nhạc|Nghệ thuật[^:]*|HĐTN[^:]*|GDĐP[^:]*|GDCD)\s+\d+\s*[-–]\s*Học kì\s+[I12V]+\s*:\s*(.+)$/i
  );
  if (semHeaderMatch) {
    const body = cleanSingleTopicOrChapterTitle(semHeaderMatch[1]);
    // Nếu body là "Chủ đề 5 (tiếp), Chủ đề 6, 7, 8, 9 (A, B, C, D, E)"
    const multiTopicParenMatch = body.match(
      /^Chủ đề\s+([\d]+(?:\s*\(tiếp\))?(?:\s*,\s*(?:Chủ đề\s*)?\d+)+)\s*\(([^)]+)\)$/i
    );
    if (multiTopicParenMatch) {
      const nums = multiTopicParenMatch[1]
        .split(/\s*,\s*/)
        .map((n) => n.replace(/^Chủ đề\s*/i, '').trim())
        .filter(Boolean);
      const titles = multiTopicParenMatch[2]
        .split(/\s*,\s*/)
        .map((t) => cleanSingleTopicOrChapterTitle(t))
        .filter(Boolean);
      if (titles.length > 1) {
        return titles.map((t, idx) =>
          nums[idx] ? `Chủ đề ${nums[idx]}: ${t}` : `Chủ đề: ${t}`
        );
      }
    }

    const subParts = body
      .split(
        /\s*;\s*|\s*,\s*(?=(?:Chủ đề|Chương|Phần|Mạch|Nghệ thuật|Địa lí|Lịch sử))|\s+&\s+(?=(?:Chủ đề|Chương|Phần|Mạch|Nghệ thuật|Địa lí|Lịch sử|Bài\s+\d+))/i
      )
      .map((p) => p.trim())
      .filter((p) => p && !/^Bài\s+\d+$/i.test(p));

    if (subParts.length > 0) {
      return subParts
        .map((sp) => {
          const parenMatch = sp.match(
            /^((?:Chủ đề|Chương|Phần|Mạch|Nghệ thuật|Địa lí\s*[-–]\s*Môi trường|Lịch sử\s*[-–]\s*Văn hóa)\s*[\dA-Za-z]*)\s*\(([^)]+)\)$/i
          );
          if (parenMatch) {
            return `${parenMatch[1].trim()}: ${parenMatch[2].trim()}`;
          }
          return cleanSingleTopicOrChapterTitle(sp);
        })
        .filter(Boolean);
    }
  }

  // Trường hợp 2: "Chủ đề 1, 2, 3 & 4: Tên 1 – Tên 2 – Tên 3 – Tên 4 (Tuần 1 – Tuần 17)"
  const multiNumDashMatch = raw.match(
    /^(?:Luyện tập tổng hợp\s*[-–]\s*)?Chủ đề\s+([\d]+(?:\s*\(tiếp\))?(?:\s*(?:,|&|và)\s*\d+)+)\s*:\s*(.+)$/i
  );
  if (multiNumDashMatch) {
    const nums = multiNumDashMatch[1]
      .split(/\s*(?:,|&|và)\s*/i)
      .map((n) => n.trim())
      .filter(Boolean);
    const cleanedBody = cleanSingleTopicOrChapterTitle(multiNumDashMatch[2]);
    const titles = cleanedBody
      .split(/\s+[–-]\s+/)
      .map((t) => cleanSingleTopicOrChapterTitle(t))
      .filter(Boolean);
    if (nums.length > 1 && titles.length === nums.length) {
      return nums.map((n, idx) => `Chủ đề ${n}: ${titles[idx]}`);
    }
    if (titles.length > 1) {
      return titles.map((t, idx) =>
        nums[idx] ? `Chủ đề ${nums[idx]}: ${t}` : t
      );
    }
  }

  // Trường hợp 3: Tách chuẩn theo `;`, `& Chủ đề/Chương...`, `– Chủ đề/Chương...`
  const parts = raw
    .split(
      /\s*;\s*|\s+(?:&|và)\s+(?=(?:Phân môn|Chương|Chủ đề|Phần|Mạch|Mô đun|Unit|Theme|Định hướng|Kinh tế|Văn học|Địa lí|Lịch sử)(?:\s|[.:\-–(]|$))|\s+[–-]\s+(?=(?:Chương|Chủ đề|Phần|Mạch|Mô đun|Unit|Theme)\s+[IVXLCDM0-9A-Za-z]+)/i
    )
    .map((p) => cleanSingleTopicOrChapterTitle(p))
    .filter(
      (p) =>
        Boolean(p) &&
        !/^(?:Ôn tập|Kiểm tra|Đánh giá|Thực hành kĩ năng)(?:\s|[.:\-–(]|$)/i.test(
          p
        )
    );

  // Nếu chuỗi gốc là danh sách bài học nối bằng `;` (có các phần tử bắt đầu bằng "Bài X.")
  // và trong đó đã có các phần tử "Chủ đề ...", loại bỏ các phần tử lẻ chỉ là "Bài X..."
  const hasChuDePrefix = parts.some((p) =>
    /^(?:Chương|Chủ đề|Phần|Mạch|Mô đun|Unit)(?:\s|[.:\-–(]|$)/i.test(p)
  );
  const filteredParts = hasChuDePrefix
    ? parts.filter((p) => !/^Bài\s+\d+/i.test(p))
    : parts;

  return filteredParts.length > 0 ? filteredParts : parts;
}

export function formatTopicOptionDisplay(
  topic: string,
  maxLen = 65
): string {
  const cleaned = cleanSingleTopicOrChapterTitle(topic);
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

function normalizeChapterCodeAndTitle(
  rawCode: string,
  rawTitle: string,
  fallbackIndex: number
): { chapterCode: string; chapterTitle: string } {
  const trimmedTitle = cleanSingleTopicOrChapterTitle(rawTitle);
  const trimmedCode = (rawCode || '').trim();

  // Nếu tiêu đề có dạng "Chương I. Tập hợp các số tự nhiên" hoặc "Chủ đề 1: Mở đầu..." hoặc "Chủ đề 4a. Soạn thảo..."
  const prefixMatch = trimmedTitle.match(
    /^((?:Phân môn\s+[^-–:]+\s*[-–]\s*)?(?:Chương|Chủ đề|Phần|Mạch|Mô đun|Unit|Theme)\s+[IVXLCDM0-9A-Za-z]+(?:\s*\([^)]+\))?)\s*[.:\-–]\s*(.+)$/i
  );
  if (prefixMatch) {
    return {
      chapterCode: prefixMatch[1].trim(),
      chapterTitle: cleanSingleTopicOrChapterTitle(prefixMatch[2]),
    };
  }

  // Nếu tiêu đề có dạng "Mạch Lịch sử – Văn hóa – Truyền thống" hoặc "Mô đun Lắp đặt mạng điện trong nhà (HKI)"
  const machOrModunMatch = trimmedTitle.match(
    /^((?:Mạch|Mô đun|Định hướng)\s+[^.:\-–]+)\s*[.:\-–]\s*(.+)$/i
  );
  if (machOrModunMatch) {
    return {
      chapterCode: machOrModunMatch[1].trim(),
      chapterTitle: cleanSingleTopicOrChapterTitle(machOrModunMatch[2]),
    };
  }

  // Nếu chapterCode đã có nhưng chapterTitle lặp lại chapterCode ở đầu
  if (
    trimmedCode &&
    trimmedTitle.toLowerCase().startsWith(trimmedCode.toLowerCase())
  ) {
    const stripped = trimmedTitle
      .slice(trimmedCode.length)
      .replace(/^\s*[.:\-–]\s*/, '')
      .trim();
    if (stripped) {
      return {
        chapterCode: trimmedCode,
        chapterTitle: cleanSingleTopicOrChapterTitle(stripped),
      };
    }
  }

  return {
    chapterCode: trimmedCode || `Chủ đề ${fallbackIndex}`,
    chapterTitle: trimmedTitle || trimmedCode || `Chủ đề ${fallbackIndex}`,
  };
}

/**
 * Tách một tiêu đề gộp nhiều Chủ đề / Chương (ngăn cách bởi dấu `;` hoặc `&` hoặc `–`)
 * thành danh sách từng Chủ đề / Chương đơn lẻ (Mỗi phần tử = 1 Chủ đề / Chương).
 */
export function splitCombinedChapterTitle(
  rawCode: string,
  rawChapterTitle: string
): Array<{ chapterCode: string; chapterTitle: string }> {
  const cleanTitle = (rawChapterTitle || '').trim();
  if (!cleanTitle) {
    return [normalizeChapterCodeAndTitle(rawCode, cleanTitle, 1)];
  }

  const parts = extractCleanTopicTitles(cleanTitle);

  if (parts.length <= 1) {
    return [normalizeChapterCodeAndTitle(rawCode, parts[0] || cleanTitle, 1)];
  }

  const isSemesterCode = /[-_](?:HK1|HK2|C\d)/i.test((rawCode || '').trim());
  return parts.map((part, idx) =>
    normalizeChapterCodeAndTitle(
      idx === 0 && !isSemesterCode ? rawCode : '',
      part,
      idx + 1
    )
  );
}

/**
 * Tách chuỗi gộp nhiều bài học (VD: "Bài 1. Thiết bị vào - ra (1 tiết); Bài 2. Phần mềm máy tính (2 tiết)")
 * thành từng bài học riêng lẻ kèm số tiết của từng bài.
 */
function splitLessonStringIntoIndividualLessons(
  rawLessonsBody: string,
  fallbackTotalPeriods: number
): Array<{ lessonName: string; periodsCount: number }> {
  const trimmed = (rawLessonsBody || '').trim();
  if (!trimmed) return [];

  const rawSegments = trimmed
    .split(
      /\s*;\s*|\s+&\s+(?=(?:Bài|Unit|Chủ đề|Ôn tập|Kiểm tra|Thực hành)(?:\s|[.:\-–(]|$))/i
    )
    .map((s) => s.trim())
    .filter(Boolean);

  const parsedSegments = rawSegments.map((seg) => {
    // Bắt số tiết ở cuối câu dạng "(2 tiết)", "(2t)", "- 2 tiết"
    const periodMatch =
      seg.match(/\(\s*(\d+)\s*(?:tiết|t)(?:\s|[^)]*)\)\s*$/i) ||
      seg.match(/[-–]\s*(\d+)\s*(?:tiết|t)\s*\)\s*$/i) ||
      seg.match(/[-–]\s*(\d+)\s*(?:tiết|t)\s*$/i);

    const parsedPeriods = periodMatch ? parseInt(periodMatch[1], 10) : 0;

    let cleanLessonName = seg
      .replace(/\s*\(\s*\d+\s*(?:tiết|t)(?:\s|[^)]*)\)\s*$/i, '')
      .replace(/\s*[-–]\s*\d+\s*(?:tiết|t)\s*$/i, '')
      .trim();

    // Nếu kết thúc bằng "(Bài X - Y tiết)" -> giữ "(Bài X)"
    cleanLessonName = cleanLessonName.replace(
      /\(\s*(Bài\s+[^)-]+?)\s*[-–]\s*\d+\s*(?:tiết|t)\s*\)$/i,
      '($1)'
    );

    const isExamOnly =
      /^(?:Ôn tập\s*(?:&|và|,)?\s*)?Kiểm tra\s+(?:giữa|cuối|định kì)/i.test(
        cleanLessonName
      ) || /^Ôn tập\s+(?:giữa|cuối)\s+(?:kì|học kì)/i.test(cleanLessonName);

    return {
      lessonName: cleanLessonName,
      periodsCount: parsedPeriods,
      isExamOnly,
    };
  });

  // Lọc bỏ các mục chỉ là Kiểm tra giữa kì / cuối kì nếu trong Chủ đề đã có bài học thực sự
  const nonExamSegments = parsedSegments.filter((s) => !s.isExamOnly);
  const examPeriods = parsedSegments
    .filter((s) => s.isExamOnly)
    .reduce((sum, s) => sum + (s.periodsCount || 1), 0);

  const activeSegments =
    nonExamSegments.length > 0 ? nonExamSegments : parsedSegments;

  const remainingTotalPeriods = Math.max(
    activeSegments.length,
    fallbackTotalPeriods - (nonExamSegments.length > 0 ? examPeriods : 0)
  );

  const knownPeriodsSum = activeSegments.reduce(
    (sum, s) => sum + s.periodsCount,
    0
  );
  const unknownCount = activeSegments.filter((s) => s.periodsCount <= 0).length;
  const defaultPerUnknown =
    unknownCount > 0
      ? Math.max(
          1,
          Math.round(
            Math.max(unknownCount, remainingTotalPeriods - knownPeriodsSum) /
              unknownCount
          )
        )
      : 1;

  return activeSegments.map((s) => ({
    lessonName: s.lessonName,
    periodsCount: s.periodsCount > 0 ? s.periodsCount : defaultPerUnknown,
  }));
}

/**
 * Lấy danh sách "Bài sẽ kiểm tra" phân theo Học kì 1 và Học kì 2 cho Cấp học, Khối lớp và Môn học đang chọn.
 * Đảm bảo mỗi bài học gắn đúng Mã Chương/Chủ đề và Tên Chương/Chủ đề đơn lẻ (1 dòng = 1 Chủ đề / Chương).
 */
export function getSelectableLessonsForMatrix(
  levelId: EducationLevelId,
  grade: GradeNumber,
  subject: string,
  topics: CurriculumTopic[]
): SelectableMatrixLesson[] {
  const subjLower = subject.toLowerCase().trim();

  // 1. Nếu là Khoa học tự nhiên Lớp 6 -> Trả về đúng 55 bài học chuẩn gom theo 11 Chủ đề
  if (
    levelId === EducationLevelId.LOWER_SECONDARY &&
    grade === 6 &&
    subjLower.includes('khoa học tự nhiên')
  ) {
    const chapterIndexMap = new Map<string, number>();
    return KHTN6_LESSONS.map((item, idx) => {
      let chapNo = chapterIndexMap.get(item.chapterTitle);
      if (!chapNo) {
        chapNo = chapterIndexMap.size + 1;
        chapterIndexMap.set(item.chapterTitle, chapNo);
      }
      const outcomesList = splitLessonOutcomes(
        item.learningOutcomeText,
        item.lessonName
      );
      return {
        ...item,
        id: `khtn6-b${idx + 1}`,
        chapterCode: `Chủ đề ${chapNo}`,
        chapterTitle: item.chapterTitle,
        learningOutcomeCode: `KHTN6-YCCĐ-${idx + 1}`,
        learningOutcomeText: outcomesList.join('\n'),
        outcomesList,
      };
    });
  }

  // 2. Nếu là Toán Lớp 6 -> Trả về 43 bài học chuẩn SGK Kết nối tri thức gom theo Chương I .. Chương IX
  if (
    levelId === EducationLevelId.LOWER_SECONDARY &&
    grade === 6 &&
    subjLower === 'toán'
  ) {
    return TOAN6_LESSONS.map((item, idx) => {
      const norm = normalizeChapterCodeAndTitle(
        '',
        item.chapterTitle,
        idx + 1
      );
      const outcomesList = splitLessonOutcomes(
        item.learningOutcomeText,
        item.lessonName
      );
      return {
        ...item,
        id: `toan6-b${idx + 1}`,
        chapterCode: norm.chapterCode,
        chapterTitle: norm.chapterTitle,
        learningOutcomeCode: `TOAN6-YCCĐ-${idx + 1}`,
        learningOutcomeText: outcomesList.join('\n'),
        outcomesList,
      };
    });
  }

  // 3. Trích xuất từ danh sách CurriculumTopic của hệ thống
  const matchingTopics = topics.filter(
    (t) =>
      t.levelId === levelId &&
      t.grade === grade &&
      (t.subject.toLowerCase() === subjLower || areSubjectNamesEquivalent(t.subject, subject))
  );

  const extracted: SelectableMatrixLesson[] = [];
  const seenLessonKey = new Set<string>();

  matchingTopics.forEach((topic, topicIdx) => {
    const sem: 'HK1' | 'HK2' = topic.semester === 'HK2' ? 'HK2' : 'HK1';

    // Quan trọng: Ưu tiên phân tích topic.chapterTitle (chứa danh sách Chương / Chủ đề)
    // Không lấy topic.topicTitle trước vì ở dữ liệu 2026 topicTitle là chuỗi nối tất cả bài học.
    const splitChapters = splitCombinedChapterTitle(
      topic.chapterCode,
      topic.chapterTitle || topic.topicTitle
    );

    if (topic.lessons && topic.lessons.length > 0) {
      let globalLessonIdx = 1;

      topic.lessons.forEach((ls, lsIdx) => {
        const rawLessonStr = (ls.lessonName || '').trim();

        // Bỏ qua nếu toàn bộ dòng chỉ là Kiểm tra định kì / Ôn tập học kì
        if (
          /^(?:Ôn tập\s*(?:&|và|,)?\s*)?Kiểm tra\s+(?:giữa|cuối|định kì)/i.test(
            rawLessonStr
          ) ||
          /^Ôn tập\s+(?:và\s+)?kiểm tra\s+(?:giữa|cuối)/i.test(rawLessonStr)
        ) {
          return;
        }

        let resolvedChapter = splitChapters[0] || {
          chapterCode: topic.chapterCode || `Chủ đề ${topicIdx + 1}`,
          chapterTitle:
            topic.chapterTitle || topic.topicTitle || `Chủ đề ${topicIdx + 1}`,
        };
        let lessonsBody = rawLessonStr;

        // Trường hợp A: ls.lessonName có tiền tố "Chủ đề X:", "Chương Y:", "Mô đun...:", "Định hướng...:", "Mạch...:"
        const prefixColonMatch = rawLessonStr.match(
          /^((?:Phân môn\s+[^:–]+\s*[-–]\s*)?(?:Chương|Chủ đề|Phần|Mạch|Mô đun|Định hướng|Unit|Theme)[^:]+?)\s*:\s*(.+)$/i
        );

        if (prefixColonMatch) {
          const rawPrefix = prefixColonMatch[1].trim();
          const afterColon = prefixColonMatch[2].trim();

          // Nếu sau dấu `:` bắt đầu bằng "Bài ...", "Unit ...", "Chủ đề ..." hoặc chứa `;` -> rawPrefix chính là tên Chương/Chủ đề
          if (
            /^(?:Bài|Unit|Tiết|Thực hành|Chủ đề|Phần)(?:\s|[.:\-–(]|$)/i.test(
              afterColon
            ) ||
            afterColon.includes(';')
          ) {
            lessonsBody = afterColon;

            // Đối chiếu rawPrefix (VD: "Chủ đề 1", "Chủ đề 4 (HKI)", "Chương II") với splitChapters từ topic.chapterTitle
            const cleanPrefixCore = rawPrefix
              .replace(/\s*\([^)]*\)\s*/g, '')
              .trim()
              .toLowerCase();

            const matchedFromHeader = splitChapters.find((sc) => {
              const scCodeLower = sc.chapterCode
                .replace(/\s*\([^)]*\)\s*/g, '')
                .trim()
                .toLowerCase();
              const scFullLower = `${sc.chapterCode} ${sc.chapterTitle}`.toLowerCase();
              return (
                scCodeLower === cleanPrefixCore ||
                cleanPrefixCore.startsWith(scCodeLower) ||
                scCodeLower.startsWith(cleanPrefixCore) ||
                scFullLower.includes(cleanPrefixCore)
              );
            });

            if (matchedFromHeader) {
              resolvedChapter = {
                chapterCode: matchedFromHeader.chapterCode,
                chapterTitle: matchedFromHeader.chapterTitle,
              };
            } else {
              resolvedChapter = normalizeChapterCodeAndTitle(
                '',
                rawPrefix,
                lsIdx + 1
              );
            }
          } else {
            // Ví dụ: "Chủ đề 1 (Tuần 1-4): Em với nhà trường" (HĐTN / Nghệ thuật / GDĐP) -> Toàn bộ ls là 1 Chủ đề riêng!
            resolvedChapter = {
              chapterCode: rawPrefix.replace(/\s*\([^)]*\)\s*/g, '').trim(),
              chapterTitle: afterColon
                .replace(/\s*\(\d+\s*tiết[^)]*\)\s*$/i, '')
                .trim(),
            };
            lessonsBody = afterColon;
          }
        } else if (splitChapters.length > 1) {
          // Trường hợp B: topic.chapterTitle có nhiều Chủ đề/Chương nhưng ls.lessonName không có dấu `:` ở đầu
          const totalLs = Math.max(1, topic.lessons?.length || 1);
          const mappedIdx =
            totalLs <= splitChapters.length
              ? Math.min(lsIdx, splitChapters.length - 1)
              : Math.min(
                  splitChapters.length - 1,
                  Math.floor((lsIdx * splitChapters.length) / totalLs)
                );
          const matchedByIdx = splitChapters[mappedIdx];
          if (matchedByIdx) {
            resolvedChapter = matchedByIdx;
          }
        } else if (
          (topic.lessons?.length || 0) > 1 &&
          (/[-_](?:HK1|HK2|C\d)/i.test(topic.chapterCode) ||
            rawLessonStr.includes(';'))
        ) {
          // Trường hợp C: Môn học gom cả Học kì vào 1 CurriculumTopic (VD: Ngữ văn Bài 1..5, KHTN 7-9, GDCD, Lịch sử & Địa lí)
          // Trong đó mỗi phần tử của topic.lessons là 1 Chủ đề / Bài học lớn độc lập
          const majorBaiMatch = rawLessonStr.match(
            /^(Bài\s+\d+|Chủ đề\s+\d+|Unit\s+\d+)\s*[.:\-–]\s*([^;(]+?)(?:\s*\(\d+\s*tiết[^)]*\))?$/i
          );
          if (majorBaiMatch) {
            resolvedChapter = {
              chapterCode: majorBaiMatch[1].trim(),
              chapterTitle: majorBaiMatch[2].trim(),
            };
          } else if (rawLessonStr.includes(';')) {
            // Nhiều chủ đề nhỏ hoặc nhiều bài gộp bằng dấu `;`
            resolvedChapter = {
              chapterCode: `Chủ đề ${lsIdx + 1} (${sem})`,
              chapterTitle:
                splitChapters[lsIdx]?.chapterTitle ||
                rawLessonStr
                  .split(';')[0]
                  .replace(/\s*\(\d+\s*tiết[^)]*\)\s*$/i, '')
                  .trim(),
            };
          }
        }

        // Đảm bảo resolvedChapter không bao giờ còn chứa tiêu đề gộp nhiều Chủ đề
        const singleSanitized = splitCombinedChapterTitle(
          resolvedChapter.chapterCode,
          resolvedChapter.chapterTitle
        )[0];
        if (singleSanitized) {
          resolvedChapter = singleSanitized;
        }

        // Tách lessonsBody thành danh sách từng bài học đơn lẻ
        const individualLessons = splitLessonStringIntoIndividualLessons(
          lessonsBody,
          ls.periodsCount || 1
        );

        // Nếu cụm bài học có nhiều bài và adjustedContent có các mệnh đề ngăn cách bởi dấu `;`,
        // ánh xạ mệnh đề tương ứng cho từng bài học để mỗi bài có Yêu cầu cần đạt sát thực tế nhất
        const rawCleanedGroupText = cleanLearningOutcomeText(
          ls.adjustedContent || ''
        );
        const groupSemicolonClauses = rawCleanedGroupText
          .split(/;\s*/)
          .map((c) => c.trim())
          .filter((c) => c.length >= 8);

        for (let itemIdx = 0; itemIdx < individualLessons.length; itemIdx++) {
          const item = individualLessons[itemIdx];
          const dedupKey = `${sem}__${resolvedChapter.chapterCode}__${resolvedChapter.chapterTitle}__${item.lessonName}`;
          if (seenLessonKey.has(dedupKey)) continue;
          seenLessonKey.add(dedupKey);

          const matchingLo =
            topic.learningOutcomes.find(
              (lo) =>
                lo.lessonName &&
                (lo.lessonName
                  .toLowerCase()
                  .includes(item.lessonName.toLowerCase()) ||
                  item.lessonName
                    .toLowerCase()
                    .includes(lo.lessonName.toLowerCase()))
            ) ||
            topic.learningOutcomes[
              Math.min(lsIdx, topic.learningOutcomes.length - 1)
            ] ||
            topic.learningOutcomes[0];

          let rawTextForThisLesson =
            rawCleanedGroupText ||
            cleanLearningOutcomeText(
              matchingLo?.description || '',
              item.lessonName
            ) ||
            `Đạt chuẩn kiến thức, kĩ năng bài ${item.lessonName}.`;

          if (
            individualLessons.length > 1 &&
            groupSemicolonClauses.length >= individualLessons.length
          ) {
            if (itemIdx < individualLessons.length - 1) {
              rawTextForThisLesson = groupSemicolonClauses[itemIdx];
            } else {
              rawTextForThisLesson = groupSemicolonClauses
                .slice(itemIdx)
                .join('; ');
            }
          }

          const outcomesList = splitLessonOutcomes(
            rawTextForThisLesson,
            item.lessonName
          );

          extracted.push({
            id: `${topic.id}-sel-${globalLessonIdx}`,
            semester: sem,
            lessonName: item.lessonName,
            periodsCount: item.periodsCount,
            chapterCode: resolvedChapter.chapterCode,
            chapterTitle: resolvedChapter.chapterTitle,
            learningOutcomeCode:
              matchingLo?.code ||
              `${resolvedChapter.chapterCode}-B${globalLessonIdx}`,
            learningOutcomeText: outcomesList.join('\n'),
            outcomesList,
          });
          globalLessonIdx++;
        }
      });
    } else {
      topic.learningOutcomes.forEach((lo, idx) => {
        const cleanName = (lo.lessonName || topic.topicTitle)
          .replace(/\s*\(\d+\s*tiết[^)]*\)\s*$/i, '')
          .trim();
        const parsedPeriods = lo.duration
          ? parseInt(lo.duration, 10) || 2
          : 2;
        const resolvedChapter =
          splitChapters[Math.min(idx, splitChapters.length - 1)] ||
          splitChapters[0];
        const outcomesList = splitLessonOutcomes(lo.description, cleanName);
        extracted.push({
          id: `${topic.id}-lo-${idx + 1}`,
          semester: sem,
          lessonName: cleanName,
          periodsCount: parsedPeriods,
          chapterCode: resolvedChapter.chapterCode,
          chapterTitle: resolvedChapter.chapterTitle,
          learningOutcomeCode: lo.code,
          learningOutcomeText: outcomesList.join('\n'),
          outcomesList,
        });
      });
    }
  });

  return extracted;
}

/**
 * Nhóm danh sách bài học theo từng Chủ đề / Chương đơn lẻ (Mỗi nhóm = 1 Chủ đề / Chương duy nhất).
 */
export function groupLessonsByChapter(
  lessons: SelectableMatrixLesson[]
): MatrixChapterGroup[] {
  const map = new Map<string, MatrixChapterGroup>();

  for (const ls of lessons) {
    const key = `${ls.semester}__${ls.chapterCode.trim().toLowerCase()}__${ls.chapterTitle.trim().toLowerCase()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        chapterKey: key,
        semester: ls.semester,
        chapterCode: ls.chapterCode,
        chapterTitle: ls.chapterTitle,
        totalPeriods: ls.periodsCount,
        lessons: [ls],
      });
    } else {
      existing.lessons.push(ls);
      existing.totalPeriods += ls.periodsCount;
    }
  }

  return Array.from(map.values());
}
