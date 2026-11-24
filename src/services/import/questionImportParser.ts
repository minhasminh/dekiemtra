import {
  ApprovalStatus,
  CognitiveLevelCode,
  EducationLevelId,
  GradeNumber,
  QuestionFormatCode,
  QuestionItem,
} from '../../types/domain';
import { getLevelForGrade, getRuleSetForLevel } from '../business/assessmentRules';
import { cleanVietnameseExamOcrText } from './smartExamImportService';

export type ImportItemDraft = Omit<QuestionItem, 'id' | 'code' | 'createdAt'>;

/**
 * Tách một dòng CSV chuẩn RFC4180 (hỗ trợ dấu phẩy trong ngoặc kép và dấu chấm phẩy)
 */
function parseCsvRow(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function resolveCognitiveCode(
  raw: string,
  levelId: EducationLevelId
): CognitiveLevelCode {
  const upper = raw.toUpperCase().trim();
  if (levelId === EducationLevelId.PRIMARY) {
    if (upper.includes('3') || upper.includes('VAN_DUNG')) return CognitiveLevelCode.PRIMARY_MUC_3;
    if (upper.includes('2') || upper.includes('KET_NOI') || upper.includes('THONG_HIEU'))
      return CognitiveLevelCode.PRIMARY_MUC_2;
    return CognitiveLevelCode.PRIMARY_MUC_1;
  }
  if (upper.includes('VDC') || upper.includes('CAO')) return CognitiveLevelCode.SEC_VAN_DUNG_CAO;
  if (upper.includes('VD') || upper.includes('VAN_DUNG')) return CognitiveLevelCode.SEC_VAN_DUNG;
  if (upper.includes('TH') || upper.includes('THONG_HIEU')) return CognitiveLevelCode.SEC_THONG_HIEU;
  return CognitiveLevelCode.SEC_NHAN_BIET;
}

function resolveFormatCode(raw: string): QuestionFormatCode {
  const upper = raw.toUpperCase().trim();
  if (upper in QuestionFormatCode) {
    return upper as QuestionFormatCode;
  }
  if (upper.includes('NHIEU') || upper.includes('MULTIPLE')) return QuestionFormatCode.MCQ_MULTIPLE;
  if (upper.includes('DUNG') || upper.includes('TRUE_FALSE')) return QuestionFormatCode.TRUE_FALSE_CLUSTER;
  if (upper.includes('DIEN') || upper.includes('BLANK')) return QuestionFormatCode.FILL_IN_BLANK;
  if (upper.includes('GHEP') || upper.includes('NOI') || upper.includes('MATCH')) return QuestionFormatCode.MATCHING;
  if (upper.includes('SAP_XEP') || upper.includes('ORDER')) return QuestionFormatCode.ORDERING;
  if (upper.includes('DOC_HIEU') || upper.includes('READING')) return QuestionFormatCode.READING_COMPREHENSION;
  if (upper.includes('CONG_THUC') || upper.includes('BANG') || upper.includes('MEDIA'))
    return QuestionFormatCode.MEDIA_FORMULA;
  if (upper.includes('TU_LUAN_NGAN') || upper.includes('ESSAY_SHORT')) return QuestionFormatCode.ESSAY_SHORT;
  if (upper.includes('TU_LUAN') || upper.includes('ESSAY')) return QuestionFormatCode.ESSAY;
  if (upper.includes('TRA_LOI_NGAN') || upper.includes('SHORT')) return QuestionFormatCode.SHORT_ANSWER;
  return QuestionFormatCode.MCQ_SINGLE;
}

/**
 * Phân tích dữ liệu Excel (TSV copy/paste), CSV hoặc JSON thành danh sách câu hỏi chờ xác nhận
 */
export function parseStructuredImportData(
  rawText: string,
  formatMode: 'JSON' | 'CSV_EXCEL',
  defaultAuthor = 'Giáo viên Nhập liệu'
): { items: ImportItemDraft[]; errors: string[] } {
  const items: ImportItemDraft[] = [];
  const errors: string[] = [];

  if (!rawText.trim()) {
    return { items: [], errors: ['Nội dung dữ liệu nhập đang để trống.'] };
  }

  if (formatMode === 'JSON') {
    try {
      const parsed = JSON.parse(rawText);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      list.forEach((entry, idx) => {
        const grade = (Number(entry.grade) || 8) as GradeNumber;
        const levelId = (entry.levelId as EducationLevelId) || getLevelForGrade(grade);
        const ruleSet = getRuleSetForLevel(levelId);
        const subject = entry.subject || ruleSet.subjects[0];
        const stem = String(entry.stem || '').trim();
        if (!stem) {
          errors.push(`Bản ghi JSON #${idx + 1} thiếu nội dung câu hỏi (stem).`);
          return;
        }
        items.push({
          levelId,
          grade,
          subject,
          topicTitle: entry.topicTitle || 'Chủ đề tổng hợp',
          lessonTitle: entry.lessonTitle || 'Bài học theo phân phối chương trình',
          knowledgeUnit: entry.knowledgeUnit || 'Đơn vị kiến thức trọng tâm',
          learningOutcomeCode: entry.learningOutcomeCode || `YCCĐ-K${grade}-1.1`,
          learningOutcomeText:
            entry.learningOutcomeText ||
            'Đáp ứng yêu cầu cần đạt theo Chương trình GDPT 2018.',
          cognitiveLevel: resolveCognitiveCode(String(entry.cognitiveLevel || ''), levelId),
          format: resolveFormatCode(String(entry.format || 'MCQ_SINGLE')),
          stem,
          options: Array.isArray(entry.options) ? entry.options : undefined,
          correctOptionIndices: Array.isArray(entry.correctOptionIndices)
            ? entry.correctOptionIndices
            : undefined,
          subStatements: Array.isArray(entry.subStatements) ? entry.subStatements : undefined,
          matchingPairs: Array.isArray(entry.matchingPairs) ? entry.matchingPairs : undefined,
          orderingItems: Array.isArray(entry.orderingItems) ? entry.orderingItems : undefined,
          blanks: Array.isArray(entry.blanks) ? entry.blanks : undefined,
          sharedPassage: entry.sharedPassage,
          correctAnswer: String(entry.correctAnswer || 'Đáp án chuẩn'),
          gradingGuide:
            String(entry.gradingGuide || '') ||
            `Học sinh trả lời đúng đạt ${Number(entry.points) || 0.5} điểm.`,
          points: Number(entry.points) || 0.5,
          questionSource: entry.questionSource || 'Nhập hàng loạt từ JSON',
          tags: Array.isArray(entry.tags) ? entry.tags : ['Nhập JSON'],
          status:
            entry.status === ApprovalStatus.APPROVED
              ? ApprovalStatus.APPROVED
              : ApprovalStatus.PENDING,
          authorName: entry.authorName || defaultAuthor,
          isSampleData: false,
        });
      });
    } catch {
      errors.push('Định dạng JSON không hợp lệ. Vui lòng kiểm tra dấu ngoặc vuông [...] và dấu phẩy.');
    }
    return { items, errors };
  }

  // Phân tích CSV hoặc TSV (Copy trực tiếp từ bảng tính Excel)
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { items: [], errors: ['Không tìm thấy dòng dữ liệu nào.'] };
  }

  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t')
    ? '\t'
    : firstLine.includes(';')
    ? ';'
    : ',';

  // Nếu dòng đầu tiên là tiêu đề cột (chứa chữ "grade", "lớp", "stem", "nội dung") thì bỏ qua
  const startIndex = /grade|lớp|stem|nội dung|môn/i.test(firstLine) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i], delimiter);
    if (cols.length < 5) {
      errors.push(
        `Dòng ${i + 1}: Không đủ số cột tối thiểu (Cần ít nhất: Lớp, Môn, Chủ đề, Dạng câu, Mức độ, Điểm, Nội dung, Đáp án).`
      );
      continue;
    }

    // Cấu trúc cột chuẩn:
    // 0: Khối lớp | 1: Môn học | 2: Chủ đề | 3: Bài học | 4: Mã YCCĐ | 5: Nội dung YCCĐ | 6: Loại câu hỏi | 7: Mức độ | 8: Điểm | 9: Nội dung câu hỏi | 10: Các phương án (ngăn cách bởi |) | 11: Đáp án đúng | 12: Hướng dẫn chấm | 13: Thẻ phân loại (ngăn cách bởi |)
    const gradeRaw = Number(cols[0]) || 8;
    const grade = Math.min(12, Math.max(1, gradeRaw)) as GradeNumber;
    const levelId = getLevelForGrade(grade);
    const subject = cols[1] || (levelId === EducationLevelId.PRIMARY ? 'Toán' : 'Toán');
    const topicTitle = cols[2] || 'Chủ đề chương trình GDPT 2018';
    const lessonTitle = cols[3] || 'Bài học định kỳ';
    const outcomeCode = cols[4] || `YCCĐ-K${grade}-1.1`;
    const outcomeText =
      cols[5] || `Đạt chuẩn kiến thức kỹ năng môn ${subject} Lớp ${grade}.`;
    const format = resolveFormatCode(cols[6] || 'MCQ_SINGLE');
    const cognitiveLevel = resolveCognitiveCode(cols[7] || '', levelId);
    const points = Number(cols[8]) || 0.5;
    const stem = cols[9] || cols[4] || '';
    const optionsRaw = cols[10] || '';
    const correctAnswer = cols[11] || cols[5] || 'A';
    const gradingGuide = cols[12] || `Trả lời đúng đạt ${points} điểm.`;
    const tagsRaw = cols[13] || '';

    if (!stem.trim()) {
      errors.push(`Dòng ${i + 1}: Thiếu nội dung câu hỏi.`);
      continue;
    }

    const options = optionsRaw
      ? optionsRaw
          .split('|')
          .map((o) => o.trim())
          .filter(Boolean)
      : format === QuestionFormatCode.MCQ_SINGLE
      ? ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D']
      : undefined;

    const tags = tagsRaw
      ? tagsRaw
          .split('|')
          .map((t) => t.trim())
          .filter(Boolean)
      : ['Nhập Excel/CSV'];

    items.push({
      levelId,
      grade,
      subject,
      topicTitle,
      lessonTitle,
      knowledgeUnit: lessonTitle,
      learningOutcomeCode: outcomeCode,
      learningOutcomeText: outcomeText,
      cognitiveLevel,
      format,
      stem,
      options,
      correctAnswer,
      gradingGuide,
      points,
      questionSource: 'Nhập hàng loạt từ Excel/CSV',
      tags,
      status: ApprovalStatus.APPROVED,
      authorName: defaultAuthor,
      isSampleData: false,
    });
  }

  return { items, errors };
}

/**
 * Trích xuất tự động các câu hỏi từ văn bản Word / PDF thô
 * Hỗ trợ nhận diện cấu trúc: "Câu 1:", "Câu 2:", phương án A. B. C. D., mệnh đề Đúng/Sai a) b) c) d), Đáp án:, Hướng dẫn giải:
 */
export function extractQuestionsFromDocumentText(
  rawDocText: string,
  context: {
    levelId: EducationLevelId;
    grade: GradeNumber;
    subject: string;
    topicTitle: string;
    authorName: string;
  }
): ImportItemDraft[] {
  const cleaned = cleanVietnameseExamOcrText(rawDocText).replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const ruleSet = getRuleSetForLevel(context.levelId);
  const defaultCognitive = ruleSet.cognitiveLevels[0].code;

  // Thu thập bảng đáp án cuối đề nếu có (VD: 1.A  2-B  Câu 3: C)
  const docEndAnswerMap = new Map<number, string>();
  const answerSectionMatch = cleaned.match(
    /(?:BẢNG ĐÁP ÁN|ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM|ĐÁP ÁN THAM KHẢO|HƯỚNG DẪN CHẤM)([\s\S]*)$/i
  );
  if (answerSectionMatch) {
    const ansBody = answerSectionMatch[1];
    const pairRegex = /(?:Câu\s*)?(\d{1,3})\s*[:.\-–]\s*([A-D](?:[,\s]+[A-D])*|Đúng|Sai|[0-9.,/\-+]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = pairRegex.exec(ansBody)) !== null) {
      docEndAnswerMap.set(Number(m[1]), m[2].trim());
    }
  }

  // Cắt bỏ phần BẢNG ĐÁP ÁN cuối đề khỏi thân văn bản câu hỏi
  const mainBody = cleaned.replace(
    /\n\s*(?:BẢNG ĐÁP ÁN|ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM|ĐÁP ÁN THAM KHẢO)[\s\S]*$/i,
    ''
  );

  // Tách khối theo "Câu 1:", "Câu 1 (0,25 điểm):", "Câu 2.", "Bài 1:" hoặc "1. " (kể cả biến thể OCR)
  const hasCauOrBai = /(?:^|\n)\s*(?:Câu|Cầu|Càu|Cấu|Cau|Bài|Bải|Bai|Question)\s*(?:số\s*)?\d+/i.test(mainBody);
  const blockRegex = hasCauOrBai
    ? /(?:^|\n)(?=\s*(?:Câu|Cầu|Càu|Cấu|Cau|Bài|Bải|Bai|Question)\s*(?:số\s*)?\d+\s*(?:\([^)]*\))?\s*[:.)/\-–]?)/gi
    : /(?:^|\n)(?=\s*\d{1,3}\s*[.)/:\-]\s+\S)/gi;

  let rawBlocks = mainBody
    .split(blockRegex)
    .map((b) => b.trim())
    .filter(
      (b) =>
        b.length > 8 &&
        hasCauOrBai ===
          /^\s*(?:Câu|Cầu|Càu|Cấu|Cau|Bài|Bải|Bai|Question)\s*(?:số\s*)?\d+/i.test(b)
    );

  // Dự phòng cho văn bản OCR từ PDF ảnh chụp bị cắt lề mất chữ "Câu"
  if (rawBlocks.length === 0 && mainBody.trim().length >= 15) {
    const paragraphs = mainBody
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 10 && !/^(?:UBND|SỞ GD|PHÒNG GD|TRƯỜNG|ĐỀ KIỂM TRA|MÔN\s*:|Thời gian)/i.test(p));
    if (paragraphs.length > 0) {
      rawBlocks = paragraphs.map((p, idx) => `Câu ${idx + 1}: ${p}`);
    }
  }

  return rawBlocks.map((block, idx) => {
    const qNumMatch = block.match(/^\s*(?:(?:Câu|Cầu|Càu|Cấu|Cau|Bài|Bải|Bai|Question)\s*(?:số\s*)?)?(\d+)/i);
    const qNumber = qNumMatch ? Number(qNumMatch[1]) : idx + 1;

    // Loại bỏ các dòng tiêu đề PHẦN I, II, III, IV bị dính ở cuối câu trước
    const rawLines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .filter(
        (l) =>
          !/^(?:PHẦN\s+[I1V234X]+|[I1V234X]+\.\s*(?:TRẮC NGHIỆM|TỰ LUẬN)|---\s*HẾT\s*---)/i.test(
            l
          )
      );

    // Tách các phương án A. B. C. D. hoặc a) b) c) d) nằm trên cùng 1 dòng
    const lines: string[] = [];
    for (const rawLine of rawLines) {
      if (/(?:^|\s)[A-D]\s*[.)]\s+/.test(rawLine) && (rawLine.match(/(?:^|\s)[A-D]\s*[.)]\s+/g) || []).length >= 2) {
        const inlineParts = rawLine
          .split(/(?=(?:^|\s+)[A-D]\s*[.)]\s+)/g)
          .map((p) => p.trim())
          .filter(Boolean);
        lines.push(...inlineParts);
      } else if (/(?:^|\s)[a-d]\s*\)\s+/.test(rawLine) && (rawLine.match(/(?:^|\s)[a-d]\s*\)\s+/g) || []).length >= 2) {
        const inlineSub = rawLine
          .split(/(?=(?:^|\s+)[a-d]\s*\)\s+)/g)
          .map((p) => p.trim())
          .filter(Boolean);
        lines.push(...inlineSub);
      } else {
        lines.push(rawLine);
      }
    }

    const firstLine = (lines[0] || '').replace(
      /^\s*(?:(?:Câu|Bài|Question)\s*(?:số\s*)?\d+|\d{1,3})\s*(?:\([^)]*\))?\s*[:.)\-–]?\s*/i,
      ''
    );

    // Kiểm tra mức độ trong ngoặc đơn đầu câu: VD "(Thông hiểu - 0.5đ)" hoặc "[Nhận biết]"
    let cognitiveLevel = defaultCognitive;
    let points = 0.5;
    if (/vận dụng cao|vdc/i.test(lines[0] || '')) {
      cognitiveLevel =
        context.levelId === EducationLevelId.PRIMARY
          ? CognitiveLevelCode.PRIMARY_MUC_3
          : CognitiveLevelCode.SEC_VAN_DUNG_CAO;
      points = 1.0;
    } else if (/vận dụng|mức 3/i.test(lines[0] || '')) {
      cognitiveLevel =
        context.levelId === EducationLevelId.PRIMARY
          ? CognitiveLevelCode.PRIMARY_MUC_3
          : CognitiveLevelCode.SEC_VAN_DUNG;
      points = 1.0;
    } else if (/thông hiểu|kết nối|mức 2/i.test(lines[0] || '')) {
      cognitiveLevel =
        context.levelId === EducationLevelId.PRIMARY
          ? CognitiveLevelCode.PRIMARY_MUC_2
          : CognitiveLevelCode.SEC_THONG_HIEU;
      points = 0.5;
    }

    const pointMatch = (lines[0] || '').match(/(\d+(?:[.,]\d+)?)\s*(?:điểm|đ\b)/i);
    if (pointMatch) {
      points = Number(pointMatch[1].replace(',', '.')) || points;
    }

    const options: string[] = [];
    const subStatements: { label: string; statement: string; isTrue: boolean }[] = [];
    let correctAnswer = docEndAnswerMap.get(qNumber) || '';
    let gradingGuide = '';
    const stemLines: string[] = [
      firstLine.replace(/^\([^)]+\)\s*/, '').replace(/^\[[^\]]+\]\s*/, ''),
    ].filter(Boolean);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^(?:Đáp án|ĐÁP ÁN|Trả lời|ĐA)\s*[:\-]/i.test(line)) {
        correctAnswer = line.replace(/^(?:Đáp án|ĐÁP ÁN|Trả lời|ĐA)\s*[:\-]\s*/i, '').trim();
      } else if (/^(?:Hướng dẫn|Lời giải|HD chấm|Giải)\s*[:\-]/i.test(line)) {
        gradingGuide = line.replace(/^(?:Hướng dẫn|Lời giải|HD chấm|Giải)\s*[:\-]\s*/i, '').trim();
      } else if (/^[A-D]\s*[.)]\s+/.test(line)) {
        options.push(line);
      } else if (/^[a-d]\s*[.)]\s+/.test(line)) {
        const label = line[0].toLowerCase();
        const isTrue = /\(Đúng\)|\[Đ\]|-\s*Đúng$/i.test(line);
        const cleanStmt = line
          .replace(/^[a-d]\s*[.)]\s+/, '')
          .replace(/\((?:Đúng|Sai)\)|\[(?:Đ|S)\]/gi, '')
          .trim();
        subStatements.push({ label, statement: cleanStmt, isTrue });
      } else {
        stemLines.push(line);
      }
    }

    let format = QuestionFormatCode.ESSAY_SHORT;
    if (subStatements.length >= 2) {
      format = QuestionFormatCode.TRUE_FALSE_CLUSTER;
      if (!correctAnswer) {
        correctAnswer = subStatements
          .map((s) => `${s.label}) ${s.isTrue ? 'Đúng' : 'Sai'}`)
          .join('; ');
      }
    } else if (options.length >= 2) {
      format =
        correctAnswer.includes(',') && correctAnswer.length <= 10
          ? QuestionFormatCode.MCQ_MULTIPLE
          : QuestionFormatCode.MCQ_SINGLE;
      if (!correctAnswer) correctAnswer = options[0];
    } else if (stemLines.join(' ').includes('___') || stemLines.join(' ').includes('...')) {
      format = QuestionFormatCode.FILL_IN_BLANK;
    } else if (points >= 1.5) {
      format = QuestionFormatCode.ESSAY;
    } else {
      format = QuestionFormatCode.SHORT_ANSWER;
    }

    const stem = stemLines.join(' ').trim();

    return {
      levelId: context.levelId,
      grade: context.grade,
      subject: context.subject,
      topicTitle: context.topicTitle || 'Chủ đề trích xuất từ tài liệu Word/PDF',
      lessonTitle: 'Bài học trích xuất từ đề cương',
      knowledgeUnit: `Câu trích xuất #${idx + 1}`,
      learningOutcomeCode: `YCCĐ-K${context.grade}-DOC.${idx + 1}`,
      learningOutcomeText: `Đánh giá năng lực môn ${context.subject} Lớp ${context.grade} theo Chương trình GDPT 2018.`,
      cognitiveLevel,
      format,
      stem,
      options: options.length > 0 ? options : undefined,
      subStatements: subStatements.length > 0 ? subStatements : undefined,
      correctAnswer: correctAnswer || 'Giáo viên xác nhận đáp án',
      gradingGuide: gradingGuide || `Học sinh trả lời đúng đạt ${points} điểm.`,
      points,
      questionSource: 'Trích xuất từ tài liệu Word/PDF',
      tags: ['Trích xuất Word/PDF', context.subject, `Lớp ${context.grade}`],
      status: ApprovalStatus.APPROVED,
      authorName: context.authorName,
      isSampleData: false,
    };
  });
}

export const SAMPLE_CSV_TEMPLATE = `grade,subject,topicTitle,lessonTitle,learningOutcomeCode,learningOutcomeText,format,cognitiveLevel,points,stem,options,correctAnswer,gradingGuide,tags
8,Toán,Định lí Pythagore và Tứ giác,Hình thang cân,YCCĐ-T8-3.1,Nhận biết được dấu hiệu hình thang cân thông qua hai góc kề một đáy hoặc hai đường chéo.,MCQ_SINGLE,SEC_NHAN_BIET,0.25,"Hình thang $ABCD$ ($AB // CD$) có thêm điều kiện nào sau đây thì trở thành hình thang cân?","A. $AB = CD$|B. $\\widehat{A} = \\widehat{B}$|C. $AD // BC$|D. $\\widehat{A} = \\widehat{C}$","B. $\\widehat{A} = \\widehat{B}$","Hình thang có hai góc kề một đáy bằng nhau là hình thang cân (0.25đ).","Hình học 8|Hình thang cân|Giữa kỳ I"
4,Toán,Phân số và các phép tính,Rút gọn phân số,YCCĐ-T4-2.1,Thực hiện được việc rút gọn phân số về phân số tối giản.,SHORT_ANSWER,PRIMARY_MUC_2,0.5,"Rút gọn phân số $\\frac{18}{24}$ về phân số tối giản ta được kết quả là bao nhiêu?",,"3/4","Chia cả tử và mẫu của $\\frac{18}{24}$ cho 6 được $\\frac{3}{4}$ (0.5đ).","Phân số tối giản|Toán 4"`;

export const SAMPLE_JSON_TEMPLATE = JSON.stringify(
  [
    {
      grade: 8,
      subject: 'Toán',
      topicTitle: 'Đa thức nhiều biến',
      lessonTitle: 'Những hằng đẳng thức đáng nhớ',
      knowledgeUnit: 'Hiệu hai bình phương',
      learningOutcomeCode: 'YCCĐ-T8-1.2',
      learningOutcomeText: 'Vận dụng hằng đẳng thức hiệu hai bình phương để tính nhanh giá trị biểu thức.',
      format: 'SHORT_ANSWER',
      cognitiveLevel: 'SEC_THONG_HIEU',
      points: 0.5,
      stem: 'Tính nhanh giá trị của biểu thức $A = 105^2 - 5^2$.',
      correctAnswer: '11 000',
      gradingGuide: 'Áp dụng $105^2 - 5^2 = (105 - 5)(105 + 5) = 100 \\cdot 110 = 11\\,000$ (0.5 điểm).',
      questionSource: 'Tổ Toán - Tin nhập JSON',
      tags: ['Hằng đẳng thức', 'Tính nhanh', 'Toán 8'],
      status: 'APPROVED',
    },
  ],
  null,
  2
);

export const SAMPLE_WORD_PDF_EXTRACT_TEXT = `Câu 1: (Nhận biết - 0.25 điểm) Trong mặt phẳng tọa độ, cho tam giác vuông có hai cạnh góc vuông lần lượt là $6\\text{ cm}$ và $8\\text{ cm}$. Độ dài cạnh huyền của tam giác vuông đó bằng bao nhiêu?
A. $10\\text{ cm}$
B. $12\\text{ cm}$
C. $14\\text{ cm}$
D. $100\\text{ cm}$
Đáp án: A. 10 cm
Hướng dẫn: Áp dụng định lí Pythagore: $c = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10\\text{ cm}$.

Câu 2: (Thông hiểu - 1.0 điểm) Khi tìm hiểu về cấu tạo nguyên tử và bảng tuần hoàn các nguyên tố hóa học ở môn Khoa học tự nhiên, các phát biểu sau đây đúng hay sai?
a) Hạt nhân nguyên tử được cấu tạo bởi hạt proton và hạt neutron. (Đúng)
b) Khối lượng của electron rất lớn và chiếm gần trọn khối lượng nguyên tử. (Sai)
c) Trong nguyên tử trung hòa về điện, số hạt proton luôn bằng số hạt electron. (Đúng)
d) Các nguyên tố trong cùng một nhóm A có số lớp electron bằng nhau. (Sai)
Đáp án: a) Đúng; b) Sai; c) Đúng; d) Sai
Hướng dẫn: Đúng 1 ý 0.1đ; 2 ý 0.25đ; 3 ý 0.5đ; cả 4 ý đạt 1.0 điểm.

Câu 3: (Vận dụng - 1.0 điểm) Giải thích vì sao vào mùa đông, khi hà hơi vào mặt gương soi ta lại thấy mặt gương bị mờ đi do có lớp sương mỏng?
Đáp án: Do hơi nước ấm trong hơi thở gặp mặt gương lạnh bị ngưng tụ thành các hạt nước nhỏ li ti làm mờ gương.
Hướng dẫn: Nêu được hơi thở chứa hơi nước ấm (0.5đ) và giải thích đúng hiện tượng ngưng tụ khi gặp bề mặt gương lạnh (0.5đ).`;
