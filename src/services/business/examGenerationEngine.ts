import {
  ApprovalStatus,
  CognitiveLevelCode,
  EducationLevelId,
  ExamCellShortageReport,
  ExamGenerationMode,
  ExamMatrix,
  ExamQualityCheckReport,
  ExamVariantPaper,
  ExamVariantQuestionItem,
  MatrixFormatGroupCode,
  MatrixLevelColumnCode,
  MatrixSpecificationRow,
  QuestionFormatCode,
  QuestionItem,
} from '../../types/domain';
import {
  cleanLearningOutcomeText,
  splitLessonOutcomes,
} from '../../data/matrixLessonCatalog';
export { cleanLearningOutcomeText };
import {
  ensureMatrixHasSpecRows,
  exactAdd,
  exactRound2,
  exactSub,
  getCellFromRow,
  mapMatrixColumnToPrimaryOrSecondaryCode,
  mapQuestionCognitiveToMatrixColumn,
  MATRIX_FORMAT_GROUPS,
  MATRIX_LEVEL_COLUMNS,
} from './matrixCalculationService';

// ============================================================================
// 1. BỘ SINH SỐ GIẢ NGẪU NHIÊN TẤT ĐỊNH (DETERMINISTIC SEEDED PRNG)
// Hỗ trợ tái lập chính xác 100% từng mã đề và phương án từ chuỗi Seed
// ============================================================================

export function hashSeedString(seed: string): number {
  let h = 2166136261 >>> 0;
  const normalized = (seed || 'EDUTEST-DEFAULT-SEED').trim();
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seedString: string): () => number {
  let state = hashSeedString(seedString) || 1;
  return function mulberry32(): number {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(
  items: readonly T[],
  rng: () => number
): { shuffled: T[]; permutation: number[] } {
  const indices = items.map((_, idx) => idx);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }
  return {
    shuffled: indices.map((oldIdx) => items[oldIdx]),
    permutation: indices,
  };
}

// ============================================================================
// 2. ĐỐI CHIẾU CÂU HỎI NGÂN HÀNG THEO TỪNG Ô MA TRẬN & TỪNG YÊU CẦU CẦN ĐẠT
// ============================================================================

export function mapQuestionFormatToMatrixGroup(
  format: QuestionFormatCode
): MatrixFormatGroupCode {
  for (const fg of MATRIX_FORMAT_GROUPS) {
    if (fg.mappedQuestionFormats.includes(format)) {
      return fg.code;
    }
  }
  return 'MCQ';
}

/**
 * Phát hiện các bản nháp giữ chỗ (placeholder cũ) chưa có nội dung thực tế
 * để hệ thống tự động bỏ qua và thay thế bằng câu hỏi nháp bám sát YCCĐ.
 */
export function isLegacyPlaceholderDraftQuestion(q: QuestionItem): boolean {
  if (q.status !== ApprovalStatus.DRAFT) return false;
  const stem = q.stem || '';
  const ans = q.correctAnswer || '';
  if (
    stem.includes('phát biểu hoặc kết quả nào sau đây đáp ứng đúng yêu cầu cần đạt') ||
    stem.includes('Xác định giá trị hoặc từ khóa thích hợp cho bài toán thuộc đơn vị kiến thức') ||
    ans.includes('Phương án đúng thỏa mãn chuẩn kiến thức') ||
    ans.startsWith('Đáp án chuẩn #') ||
    ans.includes('Lời giải tự luận hoàn chỉnh đáp ứng 3 tiêu chí chấm điểm của')
  ) {
    return true;
  }
  if (
    q.subStatements &&
    q.subStatements.some((s) =>
      s.statement.includes('Nhận định a bám sát trực tiếp khái niệm cốt lõi')
    )
  ) {
    return true;
  }
  return false;
}

export function doesQuestionMatchMatrixRowScope(
  q: QuestionItem,
  row: MatrixSpecificationRow
): boolean {
  const qCodeNorm = (q.learningOutcomeCode || '').trim().toLowerCase();
  if (qCodeNorm && row.learningOutcomeCode?.trim()) {
    const rowCodes = row.learningOutcomeCode
      .split(/[,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (
      rowCodes.some(
        (rc) =>
          rc === qCodeNorm ||
          qCodeNorm.startsWith(`${rc}.`) ||
          qCodeNorm.startsWith(`${rc}-`) ||
          rc.startsWith(`${qCodeNorm}.`)
      )
    ) {
      return true;
    }
  }

  // Kiểm tra khớp theo danh sách bài học & YCCĐ đang được chọn trong dòng Chủ đề / Chương
  if (row.lessonItems && row.lessonItems.length > 0) {
    const activeLessonItems = row.lessonItems.filter((li) => li.selected);
    const qTopicNorm = (q.topicTitle || '').toLowerCase().trim();
    const qLessonNorm = (q.lessonTitle || '').toLowerCase().trim();
    const qUnitNorm = (q.knowledgeUnit || '').toLowerCase().trim();

    for (const li of activeLessonItems) {
      const liCode = (li.learningOutcomeCode || '').trim().toLowerCase();
      if (
        qCodeNorm &&
        liCode &&
        (liCode === qCodeNorm ||
          qCodeNorm.startsWith(`${liCode}.`) ||
          liCode.startsWith(`${qCodeNorm}.`))
      ) {
        return true;
      }
      const lName = li.lessonName
        .replace(/\(\s*\d+(?:[.,]\d+)?\s*tiết\s*\)/gi, '')
        .toLowerCase()
        .trim();
      if (
        lName.length > 2 &&
        (qLessonNorm.includes(lName) ||
          lName.includes(qLessonNorm && qLessonNorm.length > 2 ? qLessonNorm : '__none__') ||
          qUnitNorm.includes(lName) ||
          qTopicNorm.includes(lName))
      ) {
        return true;
      }
    }
  }

  const topicNorm = row.topicTitle.toLowerCase().trim();
  const unitNorm = row.knowledgeUnit.toLowerCase().trim();
  const qTopicNorm = q.topicTitle.toLowerCase().trim();
  const qLessonNorm = (q.lessonTitle || '').toLowerCase().trim();
  const qUnitNorm = (q.knowledgeUnit || '').toLowerCase().trim();

  const topicMatches =
    topicNorm.length > 2 &&
    (qTopicNorm.includes(topicNorm) || topicNorm.includes(qTopicNorm));

  const unitMatches =
    unitNorm.length > 2 &&
    (qTopicNorm.includes(unitNorm) ||
      qLessonNorm.includes(unitNorm) ||
      qUnitNorm.includes(unitNorm) ||
      unitNorm.includes(qTopicNorm));

  return Boolean(topicMatches || unitMatches);
}

export function findMatchingQuestionsForCell(params: {
  matrix: ExamMatrix;
  row: MatrixSpecificationRow;
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  allQuestions: QuestionItem[];
  includeDraftSupplements?: boolean;
}): QuestionItem[] {
  const {
    matrix,
    row,
    formatGroup,
    levelColumn,
    allQuestions,
    includeDraftSupplements = false,
  } = params;

  const fgDef = MATRIX_FORMAT_GROUPS.find((g) => g.code === formatGroup);
  if (!fgDef) return [];

  return allQuestions.filter((q) => {
    if (isLegacyPlaceholderDraftQuestion(q)) return false;
    if (q.levelId !== matrix.levelId) return false;
    if (q.grade !== matrix.grade) return false;
    if (q.subject.toLowerCase().trim() !== matrix.subject.toLowerCase().trim()) {
      return false;
    }

    const statusOk =
      q.status === ApprovalStatus.APPROVED ||
      (includeDraftSupplements && q.status === ApprovalStatus.DRAFT);
    if (!statusOk) return false;

    if (!fgDef.mappedQuestionFormats.includes(q.format)) return false;
    if (mapQuestionCognitiveToMatrixColumn(q.cognitiveLevel) !== levelColumn) {
      return false;
    }

    // Ràng buộc bắt buộc Mục 1: Không tự thay câu hỏi thiếu bằng câu ngoài phạm vi kiến thức
    return doesQuestionMatchMatrixRowScope(q, row);
  });
}

export interface MatrixOutcomeSubTarget {
  subTargetKey: string;
  parentCellKey: string;
  rowId: string;
  chapterCode: string;
  topicTitle: string;
  knowledgeUnit: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  questionCount: number;
  points: number;
  unitPoints: number;
}

export function cleanLessonUnitName(raw: string): string {
  return (raw || '')
    .replace(/\(\s*\d+(?:[.,]\d+)?\s*(?:tiết|t)\s*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Phân tách một ô Ma trận (row x formatGroup x levelColumn) thành các mục tiêu cụ thể
 * theo từng Bài học và từng Yêu cầu cần đạt (YCCĐ) đã chọn trong Ma trận.
 */
export function getOutcomeAllocationsForRowCell(
  row: MatrixSpecificationRow,
  fgCode: MatrixFormatGroupCode,
  lcCode: MatrixLevelColumnCode
): MatrixOutcomeSubTarget[] {
  const parentCell = getCellFromRow(row, fgCode, lcCode);
  if (parentCell.questionCount <= 0) return [];

  const parentCellKey = `${row.id}__${fgCode}__${lcCode}`;
  const unitPts =
    parentCell.questionCount > 0
      ? exactRound2(parentCell.points / parentCell.questionCount)
      : parentCell.points;

  const selectedLessons = (row.lessonItems || []).filter(
    (li) => li.selected !== false
  );

  if (selectedLessons.length > 0) {
    const rawCounts = selectedLessons.map((li) => {
      const c = (li.cells || []).find(
        (cell) => cell.formatGroup === fgCode && cell.levelColumn === lcCode
      );
      return c ? Math.max(0, c.questionCount || 0) : 0;
    });
    const sumCounts = rawCounts.reduce((acc, n) => acc + n, 0);

    const finalCounts = [...rawCounts];
    if (sumCounts !== parentCell.questionCount) {
      if (sumCounts === 0) {
        let rem = parentCell.questionCount;
        let idx = 0;
        while (rem > 0) {
          finalCounts[idx % selectedLessons.length] += 1;
          rem -= 1;
          idx += 1;
        }
      } else if (sumCounts < parentCell.questionCount) {
        let diff = parentCell.questionCount - sumCounts;
        let idx = 0;
        while (diff > 0) {
          finalCounts[idx % selectedLessons.length] += 1;
          diff -= 1;
          idx += 1;
        }
      } else {
        let excess = sumCounts - parentCell.questionCount;
        for (let i = finalCounts.length - 1; i >= 0 && excess > 0; i--) {
          const take = Math.min(finalCounts[i], excess);
          finalCounts[i] -= take;
          excess -= take;
        }
      }
    }

    const targets: MatrixOutcomeSubTarget[] = [];
    selectedLessons.forEach((li, idx) => {
      const qCount = finalCounts[idx];
      if (qCount <= 0) return;
      const liCell = (li.cells || []).find(
        (cell) => cell.formatGroup === fgCode && cell.levelColumn === lcCode
      );
      const pts =
        liCell && liCell.questionCount === qCount && liCell.points > 0
          ? liCell.points
          : exactRound2(qCount * unitPts);

      const cleanOutcome = cleanLearningOutcomeText(
        li.learningOutcomeText || row.learningOutcomeText
      );
      const cleanLesson = cleanLessonUnitName(
        li.lessonName || row.knowledgeUnit
      );

      targets.push({
        subTargetKey: `${parentCellKey}__${li.lessonId || idx}`,
        parentCellKey,
        rowId: row.id,
        chapterCode: row.chapterCode,
        topicTitle: row.topicTitle,
        knowledgeUnit: cleanLesson,
        learningOutcomeCode: li.learningOutcomeCode || row.learningOutcomeCode,
        learningOutcomeText: cleanOutcome || cleanLesson,
        formatGroup: fgCode,
        levelColumn: lcCode,
        questionCount: qCount,
        points: pts,
        unitPoints: qCount > 0 ? exactRound2(pts / qCount) : unitPts,
      });
    });

    if (targets.length > 0) {
      return targets;
    }
  }

  // Trường hợp dòng ma trận không có lessonItems: tách từ chuỗi learningOutcomeText & knowledgeUnit
  const outcomeLines = splitLessonOutcomes(row.learningOutcomeText || '');
  const unitParts = (row.knowledgeUnit || '')
    .split(';')
    .map((s) => cleanLessonUnitName(s))
    .filter(Boolean);
  const baseCodes = (row.learningOutcomeCode || row.chapterCode || 'YCCD')
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (outcomeLines.length > 1) {
    const counts = outcomeLines.map(() => 0);
    let rem = parentCell.questionCount;
    let idx = 0;
    while (rem > 0) {
      counts[idx % outcomeLines.length] += 1;
      rem -= 1;
      idx += 1;
    }

    const targets: MatrixOutcomeSubTarget[] = [];
    outcomeLines.forEach((line, i) => {
      const qCount = counts[i];
      if (qCount <= 0) return;
      const pts = exactRound2(qCount * unitPts);
      const matchedUnit =
        unitParts[i] || unitParts[0] || cleanLessonUnitName(row.knowledgeUnit);
      const matchedCode =
        baseCodes[i] ||
        (baseCodes[0] ? `${baseCodes[0]}.${i + 1}` : `${row.chapterCode}.${i + 1}`);

      targets.push({
        subTargetKey: `${parentCellKey}__OUT_${i + 1}`,
        parentCellKey,
        rowId: row.id,
        chapterCode: row.chapterCode,
        topicTitle: row.topicTitle,
        knowledgeUnit: matchedUnit,
        learningOutcomeCode: matchedCode,
        learningOutcomeText: cleanLearningOutcomeText(line),
        formatGroup: fgCode,
        levelColumn: lcCode,
        questionCount: qCount,
        points: pts,
        unitPoints: unitPts,
      });
    });

    if (targets.length > 0) return targets;
  }

  return [
    {
      subTargetKey: parentCellKey,
      parentCellKey,
      rowId: row.id,
      chapterCode: row.chapterCode,
      topicTitle: row.topicTitle,
      knowledgeUnit: cleanLessonUnitName(row.knowledgeUnit),
      learningOutcomeCode: row.learningOutcomeCode,
      learningOutcomeText: cleanLearningOutcomeText(row.learningOutcomeText),
      formatGroup: fgCode,
      levelColumn: lcCode,
      questionCount: parentCell.questionCount,
      points: parentCell.points,
      unitPoints: unitPts,
    },
  ];
}

// ============================================================================
// 3. SINH CÂU HỎI BỔ SUNG Ở TRẠNG THÁI BẢN NHÁP BÁM SÁT TỪNG YCCĐ (CHẾ ĐỘ C)
// ============================================================================

export interface SynthesizedQuestionContent {
  stem: string;
  options?: string[];
  correctOptionIndices?: number[];
  subStatements?: {
    label: string;
    statement: string;
    isTrue: boolean;
    explanation: string;
    cognitiveLevel?: string;
  }[];
  acceptedVariations?: string[];
  rubricCriteria?: {
    id: string;
    criterion: string;
    points: number;
    note?: string;
  }[];
  correctAnswer: string;
  gradingGuide: string;
}

/**
 * Xoay vị trí phương án đúng của câu hỏi trắc nghiệm sang vị trí targetIndex (0=A, 1=B, 2=C, 3=D)
 * để các câu hỏi trong cùng đợt không bị trùng đáp án ở phương án A.
 */
export function rotateMcqOptionsToIndex(
  content: SynthesizedQuestionContent,
  targetIndex: number
): SynthesizedQuestionContent {
  if (!content.options || content.options.length < 4) {
    return content;
  }
  const letters = ['A', 'B', 'C', 'D'];
  const currentCorrectIdx =
    content.correctOptionIndices && content.correctOptionIndices.length > 0
      ? Math.min(Math.max(content.correctOptionIndices[0], 0), 3)
      : 0;
  const safeTargetIdx = ((targetIndex % 4) + 4) % 4;

  const strippedOptions = content.options
    .slice(0, 4)
    .map((opt) => opt.replace(/^[A-D][.:)]\s*/i, '').trim());

  const correctBody = strippedOptions[currentCorrectIdx];
  const distractors = strippedOptions.filter((_, idx) => idx !== currentCorrectIdx);

  const reorderedBodies: string[] = [];
  let dPtr = 0;
  for (let i = 0; i < 4; i++) {
    if (i === safeTargetIdx) {
      reorderedBodies.push(correctBody);
    } else {
      reorderedBodies.push(distractors[dPtr++] || '');
    }
  }

  const newOptions = reorderedBodies.map((body, idx) => `${letters[idx]}. ${body}`);
  const targetLetter = letters[safeTargetIdx];
  const newCorrectAnswer = `${targetLetter}. ${correctBody}`;
  const newGradingGuide = (content.gradingGuide || '')
    .replace(/Chọn\s+[A-D]\b/g, `Chọn ${targetLetter}`)
    .replace(/Phương án\s+[A-D]\s+đúng/g, `Phương án ${targetLetter} đúng`);

  return {
    ...content,
    options: newOptions,
    correctOptionIndices: [safeTargetIdx],
    correctAnswer: newCorrectAnswer,
    gradingGuide: newGradingGuide,
  };
}

/**
 * Rút trích mệnh đề kiến thức cốt lõi từ câu Yêu cầu cần đạt (bỏ các động từ chỉ mức độ ở đầu câu)
 */
function extractCoreOutcomePhrase(outcomeText: string, fallbackUnit: string): string {
  const cleaned = cleanLearningOutcomeText(outcomeText || fallbackUnit)
    .replace(/^Bài\s*\d+[.:–-]\s*[^:]+:\s*/i, '')
    .trim();
  if (!cleaned) return fallbackUnit;

  const stripped = cleaned
    .replace(
      /^(?:Nhận biết và nêu được|Biết và nhận diện được|Nhận biết được|Nhận diện được|Nêu được|Trình bày được|Mô tả được|Giải thích được|Phân biệt được|So sánh được|Thực hiện đúng|Thực hiện được|Sử dụng được|Vận dụng được|Giải quyết được|Viết được|Tạo được|Biết cách|Hiểu được)\s+/i,
      ''
    )
    .trim();

  if (stripped.length > 4) {
    return stripped.charAt(0).toLowerCase() + stripped.slice(1).replace(/\.$/, '');
  }
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1).replace(/\.$/, '');
}

/**
 * Phân tách một YCCĐ dài thành các ý nhỏ để tạo câu hỏi đa dạng và xây dựng đáp án gợi ý chi tiết
 */
export function extractOutcomeClauses(outcomeText: string, lessonName: string): string[] {
  const cleaned = cleanLearningOutcomeText(outcomeText || lessonName)
    .replace(/^Bài\s*\d+[.:–-]\s*[^:]+:\s*/i, '')
    .trim();
  const rawParts = cleaned
    .split(/[;.\n]+\s*/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter((s) => s.length > 5);
  return rawParts.length > 0 ? rawParts : [cleaned || lessonName];
}

/**
 * Loại bỏ triệt để các yếu tố thừa (tên chủ đề, tên bài học, mã/nội dung YCCĐ, tên môn/lớp dạng khung quản lý)
 * ra khỏi câu dẫn (stem), phương án lựa chọn (options) và nhận định Đúng/Sai (subStatements).
 * Chỉ giữ lại nội dung chính của câu hỏi dành cho học sinh.
 */
export function stripRedundantTopicAndLessonFromText(rawText: string): string {
  if (!rawText) return '';
  let text = rawText.trim();

  // 1. Loại bỏ các cụm mở đầu chứa tên bài học / chủ đề / yêu cầu cần đạt
  const leadingMetaPatterns: RegExp[] = [
    /^Cho tình huống học tập thuộc bài\s+"[^"]*"(?:\s*\([^)]*\))?\s*nhằm đánh giá yêu cầu cần đạt:\s*"[^"]*"\.\s*/i,
    /^Trong nhiệm vụ thực hành thuộc bài\s+"[^"]*"(?:\s*\([^)]*\))?,\s*để vận dụng yêu cầu\s+"[^"]*"\s*vào giải quyết tình huống thực tế,\s*/i,
    /^Khi thực hiện dự án học tập môn\s+[^"]+?\s+gắn với bài\s+"[^"]*",\s*/i,
    /^Trong dự án học tập môn\s+[^"]+?\s+về chủ đề\s+"[^"]*"(?:\s*\(bài\s+"[^"]*"\))?,\s*/i,
    /^Vận dụng kiến thức bài\s+"[^"]*"(?:\s*thuộc chủ đề\s+"[^"]*")?(?:\s*\([^)]*\))?\s*(?:,\s*em hãy thực hiện yêu cầu sau nhằm đáp ứng mục tiêu\s*"[^"]*":|,\s*em hãy:|:\s*)/i,
    /^Dựa vào kiến thức bài\s+"[^"]*"(?:\s*\([^)]*\))?[,:]\s*/i,
    /^Dựa trên kiến thức bài\s+"[^"]*"(?:\s*\([^)]*\))?,\s*/i,
    /^Từ kiến thức đã học trong bài\s+"[^"]*"(?:\s*\([^)]*\))?:\s*/i,
    /^Tình huống thực tế bài\s+"[^"]*":\s*/i,
    /^Để phục vụ việc học tập trong năm học mới\s*\(bài\s+"[^"]*"[^)]*\):\s*/i,
    /^Theo nội dung bài\s+"[^"]*"(?:\s*\([^)]*\))?,\s*/i,
    /^Theo chuẩn kiến thức bài\s+"[^"]*",\s*/i,
    /^Khi tìm hiểu bài\s+"[^"]*"(?:\s*(?:\([^)]*\)|với yêu cầu cần đạt\s+"[^"]*"))?,\s*/i,
    /^Khi học bài\s+"[^"]*",\s*/i,
    /^Khi phân loại các kiến thức trọng tâm của bài\s+"[^"]*",\s*/i,
    /^Khi phân tích nội dung\s+"[^"]*"(?:\s*\(chủ đề\s+"[^"]*"\))?,\s*/i,
    /^Trong chương trình môn\s+[^,]+?\s*\(bài\s+"[^"]*"\),\s*/i,
    /^Trong giờ thực hành(?:\s+tìm hiểu)?\s+bài\s+"[^"]*"(?:\s*\([^)]*\))?,\s*học sinh thực hiện[^.]+\.\s*/i,
    /^Trong giờ thực hành(?:\s+tìm hiểu)?\s+bài\s+"[^"]*"(?:\s*\([^)]*\))?,\s*/i,
    /^Trong bài(?: học)?\s+"[^"]*"(?:\s*\([^)]*\))?,\s*học sinh[^.]+\.\s*/i,
    /^Trong bài(?: học)?\s+"[^"]*"(?:\s*\([^)]*\))?(?:\s*môn\s+[^,]+)?,\s*/i,
    /^Đọc các phát biểu tổng kết kiến thức bài\s+"[^"]*"(?:\s*thuộc chủ đề\s+"[^"]*")?\.\s*/i,
    /^Khi thực hành trên phần mềm bảng tính theo nội dung bài\s+"[^"]*"(?:\s*\([^)]*\))?,\s*/i,
  ];

  for (const pat of leadingMetaPatterns) {
    text = text.replace(pat, '');
  }

  // 2. Loại bỏ các cụm chú thích bài học / chủ đề nằm giữa câu
  text = text
    .replace(/\s*\((?:thuộc\s+)?bài\s+"[^"]*"[^)]*\)/gi, '')
    .replace(/\s*\((?:thuộc\s+)?chủ đề\s+"[^"]*"[^)]*\)/gi, '')
    .replace(/\s*\(Yêu cầu cần đạt:\s*"[^"]*"\)/gi, '')
    .replace(/\s*thuộc chủ đề\s+"[^"]*"(?:\s*\([^)]*\))?/gi, '')
    .replace(/\s*(?:theo|trong)\s+nội dung\s+bài\s+"[^"]*"/gi, '')
    .replace(/\s*theo\s+(?:quy tắc(?:\s+chuẩn)?\s+(?:của\s+)?)?bài\s+"[^"]*"/gi, '')
    .replace(/\s*(?:của|trong|thuộc)\s+bài(?: học)?\s+"[^"]*"/gi, '')
    .replace(/\s*với yêu cầu cần đạt\s+"[^"]*"/gi, '')
    .replace(/\s*theo yêu cầu\s+"[^"]*"/gi, '')
    .replace(/\s*\(Tình huống thực hành\s*#\d+[^)]*\)\s*$/gi, '')
    .replace(/\s*\(Trường hợp thực hành\s*#\d+[^)]*\)\s*$/gi, '');

  // 3. Làm sạch khoảng trắng và dấu câu thừa ở đầu câu
  text = text
    .replace(/^[,;:\s–-]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Nếu có tiền tố phương án A., B., C., D. thì viết hoa chữ cái đầu sau tiền tố
  const optMatch = text.match(/^([A-D]\.\s*)(.+)$/);
  if (optMatch) {
    const body = optMatch[2].trim();
    return `${optMatch[1]}${body.charAt(0).toUpperCase()}${body.slice(1)}`;
  }

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
}

/**
 * Kho tri thức chuyên môn theo từng mạch Yêu cầu cần đạt (Tin học, Toán, KHTN, Ngữ văn/Tiếng Việt, Tiếng Anh, Lịch sử & Địa lí, GDCD, Công nghệ)
 * kết hợp bộ tổng hợp ngữ nghĩa trực tiếp từ Yêu cầu cần đạt của bài học.
 * Đảm bảo mỗi variantIndex (0, 1, 2, 3, 4...) sinh ra câu hỏi và đáp án hoàn toàn khác nhau,
 * và chỉ giữ lại nội dung chính (không lặp lại tên bài học, chủ đề thừa trong câu hỏi).
 */
export function synthesizeQuestionForLearningOutcome(params: {
  subject: string;
  grade: number;
  topicTitle: string;
  lessonName: string;
  outcomeCode: string;
  outcomeText: string;
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  unitPoints: number;
  variantIndex: number;
}): SynthesizedQuestionContent {
  const raw = synthesizeQuestionForLearningOutcomeInternal(params);
  const cleanedRaw: SynthesizedQuestionContent = {
    ...raw,
    stem: stripRedundantTopicAndLessonFromText(raw.stem),
    options: raw.options?.map((opt) => stripRedundantTopicAndLessonFromText(opt)),
    correctAnswer:
      params.formatGroup === 'MCQ'
        ? stripRedundantTopicAndLessonFromText(raw.correctAnswer)
        : raw.correctAnswer,
    subStatements: raw.subStatements?.map((sub) => ({
      ...sub,
      statement: stripRedundantTopicAndLessonFromText(sub.statement),
    })),
  };
  if (params.formatGroup === 'MCQ') {
    return rotateMcqOptionsToIndex(cleanedRaw, params.variantIndex);
  }
  return cleanedRaw;
}

function synthesizeQuestionForLearningOutcomeInternal(params: {
  subject: string;
  grade: number;
  topicTitle: string;
  lessonName: string;
  outcomeCode: string;
  outcomeText: string;
  formatGroup: MatrixFormatGroupCode;
  levelColumn: MatrixLevelColumnCode;
  unitPoints: number;
  variantIndex: number;
}): SynthesizedQuestionContent {
  const {
    subject,
    grade,
    topicTitle,
    lessonName,
    outcomeCode,
    outcomeText,
    formatGroup,
    levelColumn,
    unitPoints,
    variantIndex,
  } = params;

  const cleanOutcome = cleanLearningOutcomeText(outcomeText || lessonName);
  const cleanLesson = cleanLessonUnitName(lessonName || topicTitle);
  const shortLesson = cleanLesson.replace(/^Bài\s*\d+[.:–-]?\s*/i, '').trim() || cleanLesson;
  const clauses = extractOutcomeClauses(cleanOutcome, shortLesson);
  const primaryClause = clauses[variantIndex % clauses.length];
  const corePhrase = extractCoreOutcomePhrase(primaryClause, shortLesson);
  const combinedNorm = `${cleanLesson} ${cleanOutcome}`.toLowerCase();
  const levelLabel =
    levelColumn === 'BIET'
      ? 'Nhận biết'
      : levelColumn === 'HIEU'
      ? 'Thông hiểu'
      : 'Vận dụng';

  const p1 = exactRound2(unitPoints * 0.4);
  const p2 = exactRound2(unitPoints * 0.4);
  const p3 = exactRound2(unitPoints - p1 - p2);

  // ==========================================================================
  // CHUYÊN BIỆT THEO MẠCH BÀI HỌC & YÊU CẦU CẦN ĐẠT PHỔ BIẾN
  // ==========================================================================

  // 0. Lược sử công cụ tính toán / Lịch sử phát triển máy tính (Tin học 8 - Chuẩn bộ câu hỏi mẫu Ngan_Hang_Cau_Hoi (4).pdf)
  if (
    /lược sử công cụ tính toán|lịch sử phát triển máy tính|công cụ tính toán|thế hệ máy tính|babbage|pascaline|von neumann|eniac/i.test(
      `${topicTitle} ${combinedNorm}`
    )
  ) {
    if (formatGroup === 'MCQ') {
      if (levelColumn === 'BIET') {
        const bietHistoryBank = [
          {
            stem: `Ai được coi là "cha đẻ" của công nghệ máy tính?`,
            options: [
              'A. Charles Babbage',
              'B. Blaise Pascal',
              'C. Gottfried Leibniz',
              'D. John Von Neumann',
            ],
            correctAnswer: 'A. Charles Babbage',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Nhà toán học Charles Babbage được coi là "cha đẻ" của công nghệ máy tính với dự án Máy sai phân và Máy phân tích có thiết kế giống máy tính ngày nay.`,
          },
          {
            stem: `Máy tính cơ học Pascaline ra đời năm 1642 được thiết kế để thực hiện phép tính nào?`,
            options: [
              'A. Cộng và trừ',
              'B. Nhân và chia',
              'C. Căn bậc hai',
              'D. Cả bốn phép tính số học',
            ],
            correctAnswer: 'A. Cộng và trừ',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Máy tính cơ học Pascaline do Blaise Pascal chế tạo năm 1642 dùng hệ thống bánh răng để thực hiện hai phép tính cộng và trừ.`,
          },
          {
            stem: `Đặc điểm chính về thành phần điện tử của máy tính thế hệ thứ nhất là gì?`,
            options: [
              'A. Đèn điện tử chân không',
              'B. Bóng bán dẫn',
              'C. Mạch tích hợp (IC)',
              'D. Bộ vi xử lí (Microprocessor)',
            ],
            correctAnswer: 'A. Đèn điện tử chân không',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Máy tính thế hệ thứ nhất (1945–1955, tiêu biểu là ENIAC) sử dụng đèn điện tử chân không với kích thước rất lớn và tiêu tốn nhiều điện năng.`,
          },
          {
            stem: `Dòng máy tính IBM System/360 thuộc thế hệ máy tính thứ mấy?`,
            options: [
              'A. Thế hệ thứ ba',
              'B. Thế hệ thứ nhất',
              'C. Thế hệ thứ hai',
              'D. Thế hệ thứ tư',
            ],
            correctAnswer: 'A. Thế hệ thứ ba',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Dòng máy tính IBM System/360 sử dụng công nghệ mạch tích hợp (IC), thuộc thế hệ máy tính thứ ba (1965–1974).`,
          },
          {
            stem: `Thiết bị nào sau đây là minh chứng cho máy tính thế hệ thứ năm?`,
            options: [
              'A. Điện thoại thông minh (Smartphone)',
              'B. Máy tính Micral',
              'C. Máy tính ENIAC',
              'D. Máy tính IBM 7090',
            ],
            correctAnswer: 'A. Điện thoại thông minh (Smartphone)',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Điện thoại thông minh với vi xử lí mật độ siêu cao (ULSI) và các tính năng trí tuệ nhân tạo là minh chứng điển hình cho máy tính thế hệ thứ năm.`,
          },
        ];
        return {
          ...bietHistoryBank[variantIndex % bietHistoryBank.length],
          correctOptionIndices: [0],
        };
      }

      if (levelColumn === 'HIEU') {
        const hieuHistoryBank = [
          {
            stem: `Theo nguyên lí Von Neumann, các lệnh của chương trình được lưu trữ ở đâu?`,
            options: [
              'A. Bộ nhớ',
              'B. Thiết bị vào',
              'C. Bộ xử lí',
              'D. Thiết bị ra',
            ],
            correctAnswer: 'A. Bộ nhớ',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Theo kiến trúc và nguyên lí Von Neumann (1945), chương trình được mã hóa và lưu trữ ngay trong bộ nhớ giống như dữ liệu.`,
          },
          {
            stem: `Máy tính thế hệ thứ tư có sự đột phá nào về công nghệ linh kiện?`,
            options: [
              'A. Sử dụng mạch tích hợp cỡ rất lớn (VLSI) tạo nên bộ vi xử lí',
              'B. Sử dụng mạch tích hợp cỡ siêu lớn (ULSI)',
              'C. Sử dụng lõi từ làm bộ nhớ chính',
              'D. Sử dụng băng đục lỗ để nhập dữ liệu',
            ],
            correctAnswer: 'A. Sử dụng mạch tích hợp cỡ rất lớn (VLSI) tạo nên bộ vi xử lí',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Máy tính thế hệ thứ tư (1974–1990) có bước đột phá nhờ mạch tích hợp cỡ rất lớn (VLSI) tích hợp hàng chục nghìn linh kiện tạo nên bộ vi xử lí (Microprocessor) và mở ra kỉ nguyên máy tính cá nhân (PC).`,
          },
          {
            stem: `Tại sao máy tính thế hệ thứ hai có ưu điểm hơn so với thế hệ thứ nhất?`,
            options: [
              'A. Kích thước nhỏ hơn, tiêu thụ ít điện năng hơn và chạy nhanh hơn',
              'B. Sử dụng trí tuệ nhân tạo để xử lí dữ liệu',
              'C. Có khả năng kết nối mạng toàn cầu Internet',
              'D. Lần đầu tiên sử dụng bàn phím và màn hình',
            ],
            correctAnswer: 'A. Kích thước nhỏ hơn, tiêu thụ ít điện năng hơn và chạy nhanh hơn',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Nhờ thay đèn điện tử chân không bằng bóng bán dẫn (Transistor), máy tính thế hệ thứ hai nhỏ gọn hơn, tỏa ít nhiệt hơn, tiêu thụ ít điện năng hơn và tốc độ tính toán nhanh hơn.`,
          },
          {
            stem: `Sự phát triển của máy tính từ thế hệ 1 đến nay chủ yếu theo xu hướng nào?`,
            options: [
              'A. Thu nhỏ linh kiện, tăng tốc độ xử lí, giảm tiêu thụ năng lượng',
              'B. Ngày càng lớn hơn về kích thước để chứa nhiều linh kiện',
              'C. Tiêu thụ nhiều điện năng hơn để tăng tốc độ',
              'D. Loại bỏ hoàn toàn bộ nhớ để tăng tốc độ xử lí',
            ],
            correctAnswer: 'A. Thu nhỏ linh kiện, tăng tốc độ xử lí, giảm tiêu thụ năng lượng',
            gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Xu hướng xuyên suốt lịch sử máy tính là thu nhỏ kích thước linh kiện điện tử, tăng tốc độ xử lí và dung lượng lưu trữ, đồng thời giảm điện năng tiêu thụ và giá thành.`,
          },
        ];
        return {
          ...hieuHistoryBank[variantIndex % hieuHistoryBank.length],
          correctOptionIndices: [0],
        };
      }

      const vanDungHistoryBank = [
        {
          stem: `Máy tính ENIAC (thế hệ 1) thực hiện được 5000 phép cộng/giây, trong khi IBM 7090 (thế hệ 2) thực hiện được 229 000 phép tính/giây. IBM 7090 nhanh hơn ENIAC khoảng bao nhiêu lần?`,
          options: [
            'A. Khoảng 45 lần',
            'B. Khoảng 10 lần',
            'C. Khoảng 25 lần',
            'D. Khoảng 100 lần',
          ],
          correctAnswer: 'A. Khoảng 45 lần',
          gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Tỉ số tốc độ: 229 000 / 5000 = 45,8 (lần) ≈ khoảng 45 lần.`,
        },
        {
          stem: `Chiếc máy tính điện tử ENIAC (thế hệ thứ nhất) nặng khoảng 27 tấn và chiếm diện tích gần 167 m², trong khi một chiếc máy tính xách tay hiện nay chỉ nặng khoảng 1,5 kg. Khối lượng của ENIAC gấp khoảng bao nhiêu lần máy tính xách tay hiện nay?`,
          options: [
            'A. Khoảng 18 000 lần',
            'B. Khoảng 1 800 lần',
            'C. Khoảng 180 lần',
            'D. Khoảng 270 lần',
          ],
          correctAnswer: 'A. Khoảng 18 000 lần',
          gradingGuide: `Đáp án đúng: Chọn A (${unitPoints}đ). Đổi 27 tấn = 27 000 kg. Tỉ số khối lượng: 27 000 / 1,5 = 18 000 lần.`,
        },
      ];
      return {
        ...vanDungHistoryBank[variantIndex % vanDungHistoryBank.length],
        correctOptionIndices: [0],
      };
    }

    if (formatGroup === 'TRUE_FALSE') {
      const tfHistoryBank = [
        {
          stem: `Khi tìm hiểu về lịch sử các công cụ tính toán trước thời đại điện tử:`,
          subStatements: [
            {
              label: 'a',
              statement: 'Bàn tính là công cụ tính toán đầu tiên trong lịch sử loài người.',
              isTrue: true,
              cognitiveLevel: 'BIẾT',
              explanation: 'Đúng (Mức độ: BIẾT). Bàn tính xuất hiện từ hơn 2000 năm trước Công nguyên, là công cụ tính toán thủ công đầu tiên của loài người.',
            },
            {
              label: 'b',
              statement: 'Nhà toán học Gottfried Leibniz đã cải tiến máy Pascaline để thực hiện được cả bốn phép tính cộng, trừ, nhân, chia.',
              isTrue: true,
              cognitiveLevel: 'BIẾT',
              explanation: 'Đúng (Mức độ: BIẾT). Năm 1672, Gottfried Leibniz bổ sung cơ cấu bánh răng trục bậc (Stepped Reckoner) giúp máy thực hiện được cả 4 phép tính cộng, trừ, nhân, chia.',
            },
            {
              label: 'c',
              statement: 'Ý tưởng cơ giới hóa việc tính toán chỉ dừng lại ở mức dùng các bánh răng mà không đặt nền móng cho máy tính hiện đại.',
              isTrue: false,
              cognitiveLevel: 'HIỂU',
              explanation: 'Sai (Mức độ: HIỂU). Các thiết kế cơ học (đặc biệt là Máy phân tích của Charles Babbage) đã đặt nền móng trực tiếp cho kiến trúc máy tính hiện đại.',
            },
            {
              label: 'd',
              statement: 'Máy tính của Leibniz có thể tự động thực hiện một chương trình tính toán hoàn chỉnh mà không cần sự can thiệp của con người.',
              isTrue: false,
              cognitiveLevel: 'HIỂU',
              explanation: 'Sai (Mức độ: HIỂU). Máy của Leibniz vẫn là máy tính cơ học điều khiển từng bước bằng tay, chưa có bộ nhớ lưu chương trình tự động.',
            },
          ],
          correctAnswer: 'a) Đúng | b) Đúng | c) Sai | d) Sai',
        },
        {
          stem: `Về dự án máy tính của Charles Babbage và kiến trúc máy tính hiện đại:`,
          subStatements: [
            {
              label: 'a',
              statement: 'Các máy tính của Babbage được thiết kế để hoạt động bằng động cơ hơi nước.',
              isTrue: true,
              cognitiveLevel: 'BIẾT',
              explanation: 'Đúng (Mức độ: BIẾT). Thiết kế Máy sai phân và Máy phân tích của Charles Babbage ở thế kỉ XIX sử dụng năng lượng từ động cơ hơi nước.',
            },
            {
              label: 'b',
              statement: 'Kiến trúc Von Neumann gồm các thành phần: bộ xử lí, bộ nhớ, các thiết bị vào - ra và đường truyền kết nối.',
              isTrue: true,
              cognitiveLevel: 'BIẾT',
              explanation: 'Đúng (Mức độ: BIẾT). Đây là cấu trúc chuẩn của máy tính điện tử theo nguyên lí Von Neumann (1945).',
            },
            {
              label: 'c',
              statement: 'Máy tính của Babbage có thiết kế hoàn toàn khác biệt và không có điểm chung nào với kiến trúc Von Neumann.',
              isTrue: false,
              cognitiveLevel: 'HIỂU',
              explanation: 'Sai (Mức độ: HIỂU). Máy phân tích của Babbage đã có đầy đủ các bộ phận tương ứng với kiến trúc Von Neumann (bộ xử lí Mill, bộ nhớ Store, thiết bị vào/ra bằng bìa đục lỗ).',
            },
            {
              label: 'd',
              statement: 'Một máy tính hoạt động theo nguyên lí Von Neumann có thể thay đổi công việc bằng cách nạp một chương trình mới vào bộ nhớ mà không cần lắp đặt lại phần cứng.',
              isTrue: true,
              cognitiveLevel: 'VẬN DỤNG',
              explanation: 'Đúng (Mức độ: VẬN DỤNG). Nhờ nguyên lí chương trình được lưu trữ trong bộ nhớ, máy tính trở thành thiết bị đa năng chỉ cần nạp chương trình mới để giải quyết bài toán mới.',
            },
          ],
          correctAnswer: 'a) Đúng | b) Đúng | c) Sai | d) Đúng',
        },
        {
          stem: `Xét đặc điểm của các thế hệ máy tính điện tử từ thế hệ 1 đến thế hệ 3:`,
          subStatements: [
            {
              label: 'a',
              statement: 'Máy tính ENIAC thuộc thế hệ thứ nhất, có kích thước rất lớn và nặng tới 27 tấn.',
              isTrue: true,
              cognitiveLevel: 'BIẾT',
              explanation: 'Đúng (Mức độ: BIẾT). ENIAC (1945) là máy tính điện tử thế hệ thứ nhất, nặng khoảng 27 tấn và chiếm diện tích gần 167 m².',
            },
            {
              label: 'b',
              statement: 'Máy tính thế hệ thứ ba bắt đầu sử dụng các thiết bị ngoại vi như màn hình và bàn phím để giao tiếp với người dùng.',
              isTrue: true,
              cognitiveLevel: 'BIẾT',
              explanation: 'Đúng (Mức độ: BIẾT). Thế hệ thứ ba (dùng mạch tích hợp IC) bắt đầu trang bị màn hình, bàn phím và hệ điều hành đa chương trình.',
            },
            {
              label: 'c',
              statement: 'Việc thay thế đèn điện tử chân không bằng bóng bán dẫn ở thế hệ thứ hai đã làm máy tính trở nên cồng kềnh hơn.',
              isTrue: false,
              cognitiveLevel: 'HIỂU',
              explanation: 'Sai (Mức độ: HIỂU). Bóng bán dẫn nhỏ hơn rất nhiều so với đèn chân không nên giúp máy tính thế hệ thứ hai thu nhỏ kích thước đáng kể.',
            },
            {
              label: 'd',
              statement: 'Do sử dụng mạch tích hợp (IC), máy tính thế hệ thứ ba có tốc độ tính toán chậm hơn so với thế hệ thứ hai nhưng bền hơn.',
              isTrue: false,
              cognitiveLevel: 'HIỂU',
              explanation: 'Sai (Mức độ: HIỂU). Mạch tích hợp IC giúp máy tính thế hệ thứ ba tăng tốc độ tính toán lên hàng triệu phép tính/giây, nhanh hơn nhiều so với thế hệ thứ hai.',
            },
          ],
          correctAnswer: 'a) Đúng | b) Đúng | c) Sai | d) Sai',
        },
        {
          stem: `Về sự phát triển của máy tính từ thế hệ thứ tư đến ngày nay:`,
          subStatements: [
            {
              label: 'a',
              statement: 'Máy tính thế hệ thứ tư gắn liền với sự ra đời của máy tính cá nhân (PC) nhờ công nghệ vi xử lí.',
              isTrue: true,
              cognitiveLevel: 'BIẾT',
              explanation: 'Đúng (Mức độ: BIẾT). Bộ vi xử lí (VLSI) giúp thu nhỏ máy tính để đặt vừa trên bàn làm việc, tạo ra máy tính cá nhân (PC).',
            },
            {
              label: 'b',
              statement: 'Máy tính thế hệ thứ năm hướng tới việc xử lí thông tin dựa trên trí tuệ nhân tạo (AI).',
              isTrue: true,
              cognitiveLevel: 'HIỂU',
              explanation: 'Đúng (Mức độ: HIỂU). Thế hệ thứ năm ứng dụng mạch tích hợp siêu lớn (ULSI), xử lí song song và trí tuệ nhân tạo (nhận dạng giọng nói, hình ảnh, ngôn ngữ tự nhiên).',
            },
            {
              label: 'c',
              statement: 'Một chiếc điện thoại thông minh hiện nay mạnh hơn rất nhiều so với chiếc máy tính ENIAC khổng lồ của thế hệ thứ nhất.',
              isTrue: true,
              cognitiveLevel: 'VẬN DỤNG',
              explanation: 'Đúng (Mức độ: VẬN DỤNG). Điện thoại thông minh hiện nay thực hiện hàng tỉ phép tính/giây, nhanh gấp hàng triệu lần so với 5000 phép cộng/giây của ENIAC.',
            },
            {
              label: 'd',
              statement: 'Máy tính cá nhân Altair 8800 (năm 1975) đã có sẵn màn hình cảm ứng và kết nối không dây hiện đại.',
              isTrue: false,
              cognitiveLevel: 'HIỂU',
              explanation: 'Sai (Mức độ: HIỂU). Altair 8800 (1975) thậm chí chưa có màn hình và bàn phím chuẩn, người dùng nhập lệnh bằng các công tắc gạt và đọc kết quả qua đèn LED.',
            },
          ],
          correctAnswer: 'a) Đúng | b) Đúng | c) Đúng | d) Sai',
        },
      ];
      const chosenTf = tfHistoryBank[variantIndex % tfHistoryBank.length];
      return {
        ...chosenTf,
        gradingGuide: `Đáp án chuẩn [${outcomeCode}]: ${chosenTf.correctAnswer} (Tổng ${unitPoints}đ). Phân hóa rõ mức độ nhận thức từng ý (BIẾT, HIỂU, VẬN DỤNG) theo đúng cấu trúc đề tham khảo.`,
      };
    }

    if (formatGroup === 'SHORT_ANSWER') {
      const saHistoryBank = [
        {
          stem: `Tên chiếc máy tính điện - cơ đa năng đầu tiên được chế tạo thành công năm 1943 bởi Howard Aiken là gì?`,
          acceptedVariations: ['Harvard Mark I', 'Mark I', 'ASCC (Harvard Mark I)'],
          correctAnswer: 'Harvard Mark I',
        },
        {
          stem: `Một bộ vi xử lí 80386 SX (năm 1988) có khả năng quản lí tối đa bao nhiêu dung lượng bộ nhớ?`,
          acceptedVariations: ['16 MB', '16MB', '16 mê-ga-bai'],
          correctAnswer: '16 MB',
        },
        {
          stem: `Dựa trên tiến bộ về công nghệ linh kiện, máy tính điện tử được chia làm mấy thế hệ?`,
          acceptedVariations: ['5 thế hệ', '5', 'Năm thế hệ'],
          correctAnswer: '5 thế hệ',
        },
      ];
      const chosenSa = saHistoryBank[variantIndex % saHistoryBank.length];
      return {
        ...chosenSa,
        gradingGuide: `Đáp án chuẩn: "${chosenSa.correctAnswer}" (${unitPoints}đ). Câu hỏi trả lời ngắn hỏi trực tiếp thông tin/con số xác định từ bài học.`,
      };
    }

    const essayHistoryBank = [
      {
        stem: `Tại sao Charles Babbage lại được coi là "cha đẻ của công nghệ máy tính" dù các cỗ máy của ông chưa bao giờ được hoàn thành do hạn chế công nghệ thời bấy giờ?`,
        correctAnswer: `Charles Babbage được tôn vinh là "cha đẻ của công nghệ máy tính" vì ông là người đầu tiên nêu ra ý tưởng thiết kế máy tính tự động đa năng (Máy phân tích - Analytical Engine, 1833) với đầy đủ các thành phần tương ứng với máy tính hiện đại: bộ xử lí (Mill), bộ nhớ (Store), thiết bị vào/ra dùng bìa đục lỗ và khả năng lập trình điều khiển tự động.`,
        rubricCriteria: [
          {
            id: `rub-${outcomeCode}-${variantIndex}-1`,
            criterion: 'Nêu được đóng góp đột phá của Charles Babbage: Thiết kế Máy sai phân và đặc biệt là Máy phân tích (Analytical Engine) có khả năng tính toán tự động đa năng theo chương trình.',
            points: p1,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-2`,
            criterion: 'Chỉ rõ sự tương đồng với kiến trúc máy tính hiện đại: Máy phân tích đã có các bộ phận tương ứng với Bộ xử lí, Bộ nhớ, Thiết bị vào và Thiết bị ra.',
            points: p2,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-3`,
            criterion: 'Giải thích lý do chưa hoàn thành thời đó là do giới hạn công nghệ cơ khí chính xác thế kỉ XIX, nhưng nguyên lí thiết kế của ông đã đặt nền móng cho máy tính điện tử sau này.',
            points: p3,
          },
        ],
      },
      {
        stem: `Hãy phân tích sự thay đổi về kích thước và khả năng ứng dụng của máy tính từ thế hệ thứ nhất đến thế hệ thứ năm. Sự thay đổi này đã tác động thế nào đến đời sống con người?`,
        correctAnswer: `1. Sự thay đổi về kích thước: Từ những cỗ máy khổng lồ chiếm cả căn phòng, nặng hàng chục tấn (như ENIAC thế hệ 1) thu nhỏ dần thành máy tính để bàn (PC thế hệ 4), máy tính xách tay, điện thoại thông minh và thiết bị đeo tay nhỏ gọn (thế hệ 5).\n2. Sự thay đổi về khả năng ứng dụng: Từ chỗ chỉ tính toán số học trong quân sự/khoa học chuyên biệt, nay mở rộng sang mọi lĩnh vực (xử lí đa phương tiện, kết nối Internet toàn cầu, trí tuệ nhân tạo AI).\n3. Tác động đến đời sống: Thay đổi căn bản cách con người học tập, làm việc, giao tiếp, giải trí, y tế và thúc đẩy xã hội số phát triển mạnh mẽ.`,
        rubricCriteria: [
          {
            id: `rub-${outcomeCode}-${variantIndex}-1`,
            criterion: 'Phân tích sự thay đổi về kích thước: Từ máy tính thế hệ 1 khổng lồ (chiếm cả căn phòng, nặng hàng chục tấn) thu nhỏ dần thành máy tính cá nhân, laptop, điện thoại thông minh cầm tay.',
            points: p1,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-2`,
            criterion: 'Phân tích sự thay đổi về khả năng ứng dụng: Từ tính toán chuyên biệt tốc độ thấp phát triển lên xử lí đa phương tiện tốc độ cực cao, kết nối mạng toàn cầu và tích hợp trí tuệ nhân tạo (AI).',
            points: p2,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-3`,
            criterion: 'Đánh giá tác động đến đời sống con người: Máy tính trở thành công cụ phổ cập, thay đổi phương thức học tập, lao động, giao tiếp, quản lí xã hội và nâng cao chất lượng cuộc sống.',
            points: p3,
          },
        ],
      },
    ];
    const chosenEssay = essayHistoryBank[variantIndex % essayHistoryBank.length];
    return {
      ...chosenEssay,
      gradingGuide: `Chấm theo 3 tiêu chí chi tiết (${p1}đ + ${p2}đ + ${p3}đ = ${unitPoints}đ). Khuyến khích học sinh phân tích logic và lấy ví dụ thực tế (ENIAC, PC, Smartphone, AI).`,
    };
  }

  // 1. Thiết bị vào - ra (Tin học)
  if (/thiết bị vào|thiết bị ra|ngoại vi|bàn phím|chuột|màn hình|máy in/.test(combinedNorm)) {
    if (formatGroup === 'MCQ') {
      if (levelColumn === 'BIET') {
        const mcqVariants = [
          {
            stem: `Khi làm việc với máy tính (thuộc bài "${cleanLesson}"), nhóm thiết bị nào dưới đây chỉ gồm các thiết bị vào (Input) có chức năng tiếp nhận thông tin từ người dùng đưa vào máy tính?`,
            options: [
              'A. Bàn phím (Keyboard), chuột (Mouse), micro (Microphone), máy quét (Scanner).',
              'B. Màn hình (Monitor), loa (Speaker), máy in (Printer), máy chiếu (Projector).',
              'C. Bàn phím (Keyboard), màn hình (Monitor), máy in (Printer), loa (Speaker).',
              'D. Máy chiếu (Projector), tai nghe (Headphone), loa (Speaker), chuột (Mouse).',
            ],
            correctAnswer: 'A. Bàn phím (Keyboard), chuột (Mouse), micro (Microphone), máy quét (Scanner).',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Bàn phím, chuột, micro và máy quét là các thiết bị vào cơ bản dùng để nhập văn bản, lệnh điều khiển, âm thanh và hình ảnh vào máy tính. Các phương án khác có chứa màn hình, loa, máy in, máy chiếu là thiết bị ra.`,
          },
          {
            stem: `Thiết bị nào dưới đây thuộc nhóm thiết bị ra (Output) giúp chuyển dữ liệu từ trong máy tính ra môi trường bên ngoài dưới dạng bản in trên giấy?`,
            options: [
              'A. Máy in (Printer).',
              'B. Máy quét (Scanner).',
              'C. Bàn phím (Keyboard).',
              'D. Micro (Microphone).',
            ],
            correctAnswer: 'A. Máy in (Printer).',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Máy in là thiết bị ra xuất thông tin từ máy tính ra giấy; máy quét, bàn phím và micro là các thiết bị vào.`,
          },
          {
            stem: `Để số hóa một bức ảnh in trên giấy hoặc một trang tài liệu giấy thành tệp hình ảnh lưu trữ trong máy tính, người dùng cần sử dụng thiết bị vào nào dưới đây?`,
            options: [
              'A. Máy quét (Scanner).',
              'B. Máy chiếu (Projector).',
              'C. Loa máy tính (Speaker).',
              'D. Tai nghe (Headphone).',
            ],
            correctAnswer: 'A. Máy quét (Scanner).',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Máy quét (Scanner) là thiết bị vào có chức năng chuyển hình ảnh, văn bản trên giấy thành dữ liệu số trong máy tính.`,
          },
          {
            stem: `Trong giờ học tại phòng trình chiếu đa năng, thiết bị ra nào dưới đây nhận tín hiệu hình ảnh từ máy tính của giáo viên để phóng to lên màn chiếu cho cả lớp cùng quan sát?`,
            options: [
              'A. Máy chiếu (Projector).',
              'B. Bàn phím (Keyboard).',
              'C. Chuột quang (Optical Mouse).',
              'D. Micro thu âm (Microphone).',
            ],
            correctAnswer: 'A. Máy chiếu (Projector).',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Máy chiếu (Projector) là thiết bị ra hiển thị nội dung hình ảnh từ máy tính lên màn chiếu kích thước lớn.`,
          },
        ];
        return mcqVariants[variantIndex % mcqVariants.length];
      }
      if (levelColumn === 'HIEU') {
        const hieuVariants = [
          {
            stem: `Vì sao màn hình cảm ứng (Touchscreen) trên máy tính bảng hoặc máy tính xách tay lại được xếp vào nhóm thiết bị vừa vào vừa ra?`,
            options: [
              'A. Vì thiết bị này vừa hiển thị hình ảnh kết quả xử lí (thiết bị ra), vừa nhận thao tác chạm để nhập dữ liệu và lệnh điều khiển (thiết bị vào).',
              'B. Vì thiết bị này chỉ dùng để phát âm thanh và in tài liệu ra giấy.',
              'C. Vì thiết bị này dùng để lưu trữ lâu dài toàn bộ hệ điều hành thay cho ổ cứng.',
              'D. Vì thiết bị này chỉ nhận lệnh từ bàn phím rời mà không hiển thị thông tin.',
            ],
            correctAnswer:
              'A. Vì thiết bị này vừa hiển thị hình ảnh kết quả xử lí (thiết bị ra), vừa nhận thao tác chạm để nhập dữ liệu và lệnh điều khiển (thiết bị vào).',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Màn hình cảm ứng tích hợp đồng thời chức năng hiển thị thông tin (Output) và tiếp nhận thao tác chạm trực tiếp của người dùng (Input).`,
          },
          {
            stem: `Điểm khác nhau cơ bản về hướng truyền thông tin giữa Máy quét (Scanner) và Máy in (Printer) là gì?`,
            options: [
              'A. Máy quét thu nhận hình ảnh trên giấy đưa vào máy tính (thiết bị vào), còn máy in xuất dữ liệu từ máy tính ra giấy (thiết bị ra).',
              'B. Máy quét xuất dữ liệu ra giấy, còn máy in thu nhận âm thanh đưa vào máy tính.',
              'C. Cả máy quét và máy in đều chỉ dùng để phát âm thanh ra loa ngoài.',
              'D. Máy quét là bộ xử lí trung tâm CPU, còn máy in là bộ nhớ trong RAM.',
            ],
            correctAnswer:
              'A. Máy quét thu nhận hình ảnh trên giấy đưa vào máy tính (thiết bị vào), còn máy in xuất dữ liệu từ máy tính ra giấy (thiết bị ra).',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Phân biệt rõ chiều truyền dữ liệu của thiết bị vào (Scanner: giấy -> số) và thiết bị ra (Printer: số -> giấy).`,
          },
          {
            stem: `Khi kết nối máy tính với tivi hoặc máy chiếu thế hệ mới qua một sợi cáp duy nhất để truyền đồng thời cả hình ảnh độ phân giải cao lẫn âm thanh, ta nên sử dụng cổng kết nối nào?`,
            options: [
              'A. Cổng HDMI.',
              'B. Cổng nguồn điện AC.',
              'C. Cổng mạng RJ45 (LAN).',
              'D. Cổng chuột PS/2 cổ điển.',
            ],
            correctAnswer: 'A. Cổng HDMI.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Chuẩn HDMI truyền đồng thời tín hiệu hình ảnh và âm thanh số chất lượng cao từ máy tính ra màn hình/máy chiếu.`,
          },
          {
            stem: `Vì sao khi kết nối các thiết bị ngoại vi với thân máy tính, người dùng không được dùng lực mạnh ấn đầu cắm vào cổng không khớp hình dạng?`,
            options: [
              'A. Vì mỗi cổng kết nối có chuẩn chân tiếp xúc riêng; cắm sai cổng sẽ làm cong gãy chân kim loại, gây chập mạch hoặc hỏng thiết bị.',
              'B. Vì cắm mạnh sẽ làm màn hình tự động đổi sang chế độ đen trắng.',
              'C. Vì mọi đầu cáp đều tự động co giãn vừa với tất cả các cổng trên máy tính.',
              'D. Vì chỉ cần đặt đầu cáp cạnh máy tính là thiết bị có dây đã tự kết nối.',
            ],
            correctAnswer:
              'A. Vì mỗi cổng kết nối có chuẩn chân tiếp xúc riêng; cắm sai cổng sẽ làm cong gãy chân kim loại, gây chập mạch hoặc hỏng thiết bị.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hiểu quy tắc an toàn khi kết nối thiết bị ngoại vi đúng chuẩn cổng giao tiếp.`,
          },
        ];
        return hieuVariants[variantIndex % hieuVariants.length];
      }
      const vanDungVariants = [
        {
          stem: `Trong buổi học trực tuyến, bạn Minh nghe rất rõ giọng cô giáo qua loa nhưng khi Minh bật mic trả lời thì cô giáo và cả lớp không nghe thấy tiếng của Minh. Để khắc phục đúng quy tắc theo bài "${cleanLesson}", Minh cần kiểm tra thiết bị và thao tác nào sau đây?`,
          options: [
            'A. Kiểm tra dây cắm micro (hoặc tai nghe có mic) đã cắm đúng cổng thu âm chưa và kiểm tra quyền bật micro trên phần mềm học trực tuyến.',
            'B. Thay thế máy in mới và tăng độ sáng của màn hình máy tính lên mức tối đa.',
            'C. Rút dây nguồn màn hình và khởi động lại máy chiếu trong phòng học.',
            'D. Đổi tốc độ di chuyển con trỏ chuột trong phần cài đặt chuột.',
          ],
          correctAnswer:
            'A. Kiểm tra dây cắm micro (hoặc tai nghe có mic) đã cắm đúng cổng thu âm chưa và kiểm tra quyền bật micro trên phần mềm học trực tuyến.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Micro là thiết bị vào thu âm thanh đưa vào máy tính; khi không truyền được giọng nói đi, cần kiểm tra kết nối cổng micro và trạng thái bật/tắt micro.`,
        },
        {
          stem: `Khi bạn An di chuyển chuột quang trên bàn nhưng con trỏ chuột trên màn hình đứng yên không nhúc nhích và đèn cảm biến dưới đáy chuột không sáng, cách kiểm tra và xử lí nào sau đây là phù hợp nhất?`,
          options: [
            'A. Kiểm tra đầu cáp USB của chuột đã cắm chặt vào cổng USB của máy tính chưa (hoặc kiểm tra công tắc và pin nếu là chuột không dây).',
            'B. Tắt loa máy tính và rút dây cáp mạng Internet ra cắm lại.',
            'C. Mở phần mềm bảng tính Excel để gõ lại văn bản.',
            'D. Lau mặt kính của máy quét ảnh và nạp thêm giấy vào máy in.',
          ],
          correctAnswer:
            'A. Kiểm tra đầu cáp USB của chuột đã cắm chặt vào cổng USB của máy tính chưa (hoặc kiểm tra công tắc và pin nếu là chuột không dây).',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Chuột không sáng đèn cảm biến chứng tỏ chưa có nguồn/tín hiệu kết nối qua cổng USB hoặc hết pin.`,
        },
        {
          stem: `Cô giáo giao nhiệm vụ cho nhóm em chuẩn bị thiết bị cho buổi thuyết trình dự án học tập gồm: trình chiếu slide lên màn chiếu lớn, phát nhạc nền cho cả lớp nghe và thu âm phần hỏi đáp. Nhóm em cần kết nối bộ thiết bị ngoại vi nào với máy tính xách tay?`,
          options: [
            'A. Máy chiếu (Projector) để chiếu hình ảnh, loa ngoài (Speaker) để phát âm thanh và micro (Microphone) để thu âm phần hỏi đáp.',
            'B. Máy in (Printer), máy quét (Scanner) và ổ đĩa mềm.',
            'C. Ba bàn phím rời và hai con chuột máy tính cắm cùng lúc.',
            'D. Chỉ cần cắm thêm máy in đen trắng vào cổng USB.',
          ],
          correctAnswer:
            'A. Máy chiếu (Projector) để chiếu hình ảnh, loa ngoài (Speaker) để phát âm thanh và micro (Microphone) để thu âm phần hỏi đáp.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Lựa chọn đúng thiết bị vào (micro) và thiết bị ra (máy chiếu, loa) phù hợp với tình huống thực tế.`,
        },
      ];
      return vanDungVariants[variantIndex % vanDungVariants.length];
    }

    if (formatGroup === 'TRUE_FALSE') {
      const tfVariants = [
        {
          stem: `Trong giờ thực hành bài "${cleanLesson}", học sinh thực hiện phân loại và kết nối các thiết bị thông dụng của máy tính theo yêu cầu "${cleanOutcome}". Xét tính Đúng (Đ) hoặc Sai (S) của mỗi phát biểu sau:`,
          subStatements: [
            {
              label: 'a',
              statement:
                'Bàn phím, chuột, micro và webcam là các thiết bị vào (Input) có chức năng thu nhận thông tin từ người dùng đưa vào máy tính.',
              isTrue: true,
              explanation:
                'Đúng, đây là các thiết bị tiếp nhận văn bản, thao tác điều khiển, âm thanh và hình ảnh đưa vào máy tính.',
            },
            {
              label: 'b',
              statement:
                'Máy quét ảnh (Scanner) là thiết bị ra vì nó xuất hình ảnh từ máy tính ra giấy.',
              isTrue: false,
              explanation:
                'Sai, máy quét (Scanner) chuyển hình ảnh/tài liệu trên giấy thành dữ liệu số đưa vào máy tính nên là thiết bị vào; thiết bị in ra giấy là máy in (Printer).',
            },
            {
              label: 'c',
              statement:
                'Màn hình cảm ứng vừa đóng vai trò là thiết bị ra (hiển thị hình ảnh) vừa là thiết bị vào (nhận thao tác chạm).',
              isTrue: true,
              explanation:
                'Đúng, màn hình cảm ứng kết hợp cả hai chức năng nhập lệnh chạm và xuất hình ảnh.',
            },
            {
              label: 'd',
              statement:
                'Khi lắp ghép thiết bị ngoại vi, có thể dùng lực mạnh cắm đầu cáp HDMI vào cổng USB nếu thấy gần vừa kích thước.',
              isTrue: false,
              explanation:
                'Sai, mỗi cổng kết nối có chuẩn hình dạng và chức năng riêng; cắm sai cổng sẽ làm gãy chân tiếp xúc và hỏng thiết bị.',
            },
          ],
          correctAnswer: 'a) Đúng | b) Sai | c) Đúng | d) Sai',
        },
        {
          stem: `Khi kiểm tra hệ thống máy tính tại phòng Tin học nhà trường (thuộc bài "${cleanLesson}"), nhóm học sinh đưa ra các nhận định về cách sử dụng thiết bị vào – ra. Xét tính Đúng (Đ) hoặc Sai (S) của mỗi nhận định sau:`,
          subStatements: [
            {
              label: 'a',
              statement:
                'Loa máy tính chỉ nhận dữ liệu giọng nói từ người dùng đưa vào máy tính chứ không phát âm thanh ra ngoài.',
              isTrue: false,
              explanation:
                'Sai, loa (Speaker) là thiết bị ra phát âm thanh từ máy tính ra ngoài; thiết bị thu giọng nói đưa vào là micro.',
            },
            {
              label: 'b',
              statement:
                'Cổng HDMI cho phép truyền đồng thời cả tín hiệu hình ảnh độ phân giải cao và âm thanh từ máy tính ra màn hình hoặc máy chiếu.',
              isTrue: true,
              explanation:
                'Đúng, cáp HDMI hỗ trợ truyền đồng thời tín hiệu hình ảnh và âm thanh số.',
            },
            {
              label: 'c',
              statement:
                'Tai nghe kèm micro (Headset) tích hợp cả thiết bị ra (tai nghe phát âm thanh) và thiết bị vào (micro thu âm giọng nói).',
              isTrue: true,
              explanation:
                'Đúng, bộ tai nghe kèm mic vừa xuất âm thanh vừa thu nhận giọng nói.',
            },
            {
              label: 'd',
              statement:
                'Có thể đổ trực tiếp nước lên bàn phím và chuột đang cắm điện để rửa sạch bụi bẩn.',
              isTrue: false,
              explanation:
                'Sai, nước làm chập mạch điện tử bên trong bàn phím và chuột, gây hỏng thiết bị và mất an toàn điện.',
            },
          ],
          correctAnswer: 'a) Sai | b) Đúng | c) Đúng | d) Sai',
        },
      ];
      const chosenTf = tfVariants[variantIndex % tfVariants.length];
      return {
        ...chosenTf,
        gradingGuide: `Đáp án gợi ý [${outcomeCode}]: ${chosenTf.correctAnswer} (Tổng ${unitPoints}đ — Đúng 1 ý: 25%, 2 ý: 50%, 3 ý: 75%, 4 ý: 100% số điểm). Giải thích chi tiết từng ý bám sát YCCĐ: "${cleanOutcome}".`,
      };
    }

    if (formatGroup === 'SHORT_ANSWER') {
      const saVariants = [
        {
          stem: `Trong các thiết bị ngoại vi của máy tính, thiết bị nào vừa thực hiện chức năng hiển thị hình ảnh (thiết bị ra), vừa cho phép người dùng chạm trực tiếp lên bề mặt để điều khiển và nhập dữ liệu (thiết bị vào)?`,
          acceptedVariations: ['Màn hình cảm ứng', 'Màn hình chạm cảm ứng', 'Touchscreen'],
          correctAnswer: 'Màn hình cảm ứng',
        },
        {
          stem: `Thiết bị vào nào có chức năng thu nhận hình ảnh hoặc văn bản trên trang giấy để chuyển đổi thành tệp dữ liệu số lưu trong máy tính?`,
          acceptedVariations: ['Máy quét', 'Máy scan', 'Scanner', 'Máy quét ảnh'],
          correctAnswer: 'Máy quét (Scanner)',
        },
        {
          stem: `Thiết bị ra nào thường được kết nối với máy tính qua cổng HDMI hoặc VGA trong lớp học để phóng to hình ảnh bài giảng lên màn chiếu cho cả lớp quan sát?`,
          acceptedVariations: ['Máy chiếu', 'Projector', 'Máy chiếu đa năng'],
          correctAnswer: 'Máy chiếu (Projector)',
        },
      ];
      const chosenSa = saVariants[variantIndex % saVariants.length];
      return {
        ...chosenSa,
        gradingGuide: `Đáp án gợi ý: "${chosenSa.correctAnswer}" đạt ${unitPoints}đ. Đánh giá trực tiếp YCCĐ [${outcomeCode}]: ${cleanOutcome}.`,
      };
    }

    const essayVariants = [
      {
        stem: `Dựa vào kiến thức bài "${cleanLesson}" (${cleanOutcome}):\na) Em hãy phân biệt chức năng của thiết bị vào và thiết bị ra của máy tính, mỗi nhóm kể tên ít nhất 3 thiết bị cụ thể.\nb) Nêu 2 lưu ý quan trọng để sử dụng và kết nối các thiết bị ngoại vi của máy tính an toàn, bền bỉ.`,
        rubricCriteria: [
          {
            id: `rub-${outcomeCode}-${variantIndex}-1`,
            criterion:
              'Phân biệt đúng chức năng: Thiết bị vào tiếp nhận dữ liệu đưa vào máy tính; Thiết bị ra chuyển thông tin từ máy tính ra ngoài dưới dạng hình ảnh, âm thanh, bản in.',
            points: p1,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-2`,
            criterion:
              'Kể tên đúng mỗi nhóm ít nhất 3 thiết bị (Thiết bị vào: bàn phím, chuột, micro, máy quét; Thiết bị ra: màn hình, loa, máy in, máy chiếu).',
            points: p2,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-3`,
            criterion:
              'Nêu được ít nhất 2 quy tắc thao tác an toàn: cắm đúng cổng kết nối nhẹ nhàng theo ký hiệu, giữ thiết bị khô ráo sạch sẽ, không tự ý rút nóng hoặc làm rơi va đập.',
            points: p3,
          },
        ],
        correctAnswer: `1. Thiết bị vào nhận thông tin đưa vào máy tính (bàn phím, chuột, micro, máy quét); Thiết bị ra xuất kết quả xử lí ra ngoài (màn hình, loa, máy in, máy chiếu).\n2. Quy tắc sử dụng an toàn: quan sát đúng cổng kết nối (USB, HDMI, Audio) trước khi cắm nhẹ nhàng; giữ tay và thiết bị khô ráo, vệ sinh định kỳ và tắt thiết bị đúng quy trình.`,
      },
      {
        stem: `Tình huống thực tế bài "${cleanLesson}": Phòng học bộ môn của lớp em được trang bị một bộ máy tính để bàn, một máy chiếu, một bộ loa ngoài và một micro không dây.\na) Hãy xác định mỗi thiết bị trên thuộc nhóm thiết bị vào hay thiết bị ra và nêu rõ vai trò của từng thiết bị.\nb) Khi bật máy chiếu nhưng màn chiếu báo "No Signal" (Không có tín hiệu), em sẽ kiểm tra những bộ phận nào để khắc phục?`,
        rubricCriteria: [
          {
            id: `rub-${outcomeCode}-${variantIndex}-1`,
            criterion:
              'Phân loại và nêu đúng vai trò: Bàn phím, chuột, micro là thiết bị vào; Màn hình máy tính, máy chiếu, loa ngoài là thiết bị ra.',
            points: p1,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-2`,
            criterion:
              'Nêu đúng cách kiểm tra cáp kết nối (HDMI/VGA) giữa máy tính và máy chiếu, đảm bảo cắm đúng cổng và chắc chắn.',
            points: p2,
          },
          {
            id: `rub-${outcomeCode}-${variantIndex}-3`,
            criterion:
              'Nêu đúng thao tác chọn nguồn tín hiệu (Input Source) trên máy chiếu và tổ hợp phím xuất màn hình (Windows + P) trên máy tính.',
            points: p3,
          },
        ],
        correctAnswer: `1. Phân loại: Thiết bị vào gồm bàn phím, chuột, micro (nhập lệnh và thu âm); Thiết bị ra gồm màn hình, máy chiếu, loa ngoài (hiển thị hình ảnh và phát âm thanh).\n2. Khắc phục lỗi "No Signal": Kiểm tra dây cáp HDMI/VGA đã cắm chặt vào cổng xuất hình của máy tính và máy chiếu chưa; kiểm tra chế độ chọn cổng đầu vào (Source) trên máy chiếu và nhấn tổ hợp phím Windows + P chọn chế độ Duplicate/Extend.`,
      },
    ];
    const chosenEssay = essayVariants[variantIndex % essayVariants.length];
    return {
      ...chosenEssay,
      gradingGuide: `Chấm theo 3 tiêu chí chi tiết bám sát YCCĐ [${outcomeCode}] (${p1}đ + ${p2}đ + ${p3}đ = ${unitPoints}đ).`,
    };
  }

  // 2. Phần mềm máy tính / Hệ điều hành và phần mềm ứng dụng (Tin học)
  if (/phần mềm hệ thống|phần mềm ứng dụng|hệ điều hành/.test(combinedNorm)) {
    if (formatGroup === 'MCQ') {
      if (levelColumn === 'BIET') {
        const bietVariants = [
          {
            stem: `Trong các phần mềm sau đây, phần mềm nào thuộc nhóm phần mềm hệ thống (System Software) đóng vai trò quản lí phần cứng và tạo môi trường cho các phần mềm khác chạy?`,
            options: [
              'A. Hệ điều hành Windows, macOS, Linux, Android.',
              'B. Phần mềm soạn thảo văn bản Microsoft Word.',
              'C. Phần mềm bảng tính điện tử Microsoft Excel.',
              'D. Trình duyệt web Google Chrome và phần mềm vẽ Paint.',
            ],
            correctAnswer: 'A. Hệ điều hành Windows, macOS, Linux, Android.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hệ điều hành (Windows, Linux, macOS, Android, iOS) là phần mềm hệ thống; Word, Excel, Chrome, Paint là phần mềm ứng dụng.`,
          },
          {
            stem: `Nhóm nào dưới đây chỉ gồm các phần mềm ứng dụng (Application Software) giúp người dùng thực hiện những công việc cụ thể như soạn thảo văn bản, tính toán, duyệt web?`,
            options: [
              'A. Microsoft Word, Microsoft Excel, Google Chrome, Scratch.',
              'B. Windows 10, Windows 11, Ubuntu Linux, macOS.',
              'C. Android, iOS, Windows, MS-DOS.',
              'D. Hệ điều hành Linux, trình điều khiển BIOS và Android.',
            ],
            correctAnswer: 'A. Microsoft Word, Microsoft Excel, Google Chrome, Scratch.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Word, Excel, Chrome, Scratch đều là phần mềm ứng dụng phục vụ trực tiếp nhu cầu học tập và làm việc.`,
          },
          {
            stem: `Trên điện thoại thông minh và máy tính bảng hiện nay, hai hệ điều hành phổ biến nhất là gì?`,
            options: [
              'A. Android và iOS.',
              'B. Microsoft Word và Microsoft PowerPoint.',
              'C. Google Search và Zalo.',
              'D. Unikey và Windows Media Player.',
            ],
            correctAnswer: 'A. Android và iOS.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Android và iOS là hai hệ điều hành di động phổ biến nhất quản lí điện thoại thông minh và máy tính bảng.`,
          },
          {
            stem: `Phần mềm nào dưới đây là phần mềm ứng dụng chuyên dùng để thiết kế bài trình chiếu (Slide) phục vụ thuyết trình trong học tập?`,
            options: [
              'A. Microsoft PowerPoint.',
              'B. Hệ điều hành Windows 11.',
              'C. Hệ điều hành Ubuntu Linux.',
              'D. Phần mềm diệt virus Windows Defender.',
            ],
            correctAnswer: 'A. Microsoft PowerPoint.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Microsoft PowerPoint là phần mềm ứng dụng tạo bài trình chiếu.`,
          },
        ];
        return bietVariants[variantIndex % bietVariants.length];
      }
      if (levelColumn === 'HIEU') {
        const hieuVariants = [
          {
            stem: `Điểm khác biệt cơ bản nhất giữa hệ điều hành và phần mềm ứng dụng theo nội dung bài "${cleanLesson}" là gì?`,
            options: [
              'A. Hệ điều hành điều khiển phần cứng và cung cấp môi trường hoạt động cho toàn hệ thống, còn phần mềm ứng dụng chạy trên hệ điều hành để phục vụ từng nhu cầu công việc cụ thể của người dùng.',
              'B. Phần mềm ứng dụng phải được cài đặt trước khi máy tính có hệ điều hành.',
              'C. Hệ điều hành chỉ dùng để gõ văn bản, còn phần mềm ứng dụng dùng để khởi động máy tính.',
              'D. Máy tính không cần hệ điều hành vẫn chạy được mọi phần mềm ứng dụng bình thường.',
            ],
            correctAnswer:
              'A. Hệ điều hành điều khiển phần cứng và cung cấp môi trường hoạt động cho toàn hệ thống, còn phần mềm ứng dụng chạy trên hệ điều hành để phục vụ từng nhu cầu công việc cụ thể của người dùng.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hệ điều hành là nền tảng quản lí thiết bị và tài nguyên máy tính; phần mềm ứng dụng chỉ hoạt động được khi đã có hệ điều hành.`,
          },
          {
            stem: `Vì sao một phần mềm ứng dụng cài đặt trên máy tính chạy hệ điều hành Windows (.exe) thường không thể cài đặt trực tiếp nguyên bản lên điện thoại chạy hệ điều hành Android (.apk)?`,
            options: [
              'A. Vì mỗi phần mềm ứng dụng được thiết kế để tương thích và phụ thuộc vào môi trường của một hệ điều hành cụ thể.',
              'B. Vì điện thoại thông minh không có màn hình hiển thị và bộ nhớ.',
              'C. Vì hệ điều hành Windows chỉ chạy được vào ban ngày.',
              'D. Vì điện thoại không cho phép cài đặt bất kì phần mềm ứng dụng nào.',
            ],
            correctAnswer:
              'A. Vì mỗi phần mềm ứng dụng được thiết kế để tương thích và phụ thuộc vào môi trường của một hệ điều hành cụ thể.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Phần mềm ứng dụng phụ thuộc vào hệ điều hành nền tảng nơi nó hoạt động.`,
          },
          {
            stem: `Nếu gỡ bỏ phần mềm soạn thảo văn bản Microsoft Word khỏi máy tính thì điều gì sẽ xảy ra đối với hệ thống máy tính?`,
            options: [
              'A. Hệ điều hành Windows và các phần mềm ứng dụng khác vẫn hoạt động bình thường, chỉ không mở/soạn thảo văn bản bằng Word được nữa.',
              'B. Máy tính sẽ lập tức tắt nguồn và không thể khởi động lại được nữa.',
              'C. Toàn bộ bàn phím, chuột và màn hình sẽ bị hỏng vĩnh viễn.',
              'D. Hệ điều hành sẽ tự động bị xóa sạch khỏi ổ cứng.',
            ],
            correctAnswer:
              'A. Hệ điều hành Windows và các phần mềm ứng dụng khác vẫn hoạt động bình thường, chỉ không mở/soạn thảo văn bản bằng Word được nữa.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Gỡ một phần mềm ứng dụng không làm ảnh hưởng đến sự sống còn của hệ điều hành.`,
          },
        ];
        return hieuVariants[variantIndex % hieuVariants.length];
      }
      const vanDungVariants = [
        {
          stem: `Bạn Lan cần hoàn thành 3 công việc trên máy tính: (1) Viết báo cáo tổng kết năm học, (2) Tính điểm trung bình của các bạn trong tổ, (3) Tra cứu tài liệu học tập trên Internet. Lan nên chọn bộ phần mềm ứng dụng nào dưới đây là phù hợp nhất?`,
          options: [
            'A. (1) Microsoft Word, (2) Microsoft Excel, (3) Google Chrome.',
            'B. (1) Windows 11, (2) Microsoft Paint, (3) Unikey.',
            'C. (1) Microsoft Excel, (2) Google Chrome, (3) Windows Media Player.',
            'D. (1) Linux, (2) Android, (3) iOS.',
          ],
          correctAnswer: 'A. (1) Microsoft Word, (2) Microsoft Excel, (3) Google Chrome.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Word dùng soạn thảo văn bản, Excel dùng tính toán bảng tính, Google Chrome dùng duyệt web tra cứu thông tin.`,
        },
        {
          stem: `Bố của Nam mới mua một chiếc máy tính để bàn mới tinh nhưng chưa cài đặt bất kì phần mềm nào. Để Nam có thể sử dụng máy tính học lập trình Scratch và soạn thảo văn bản, thứ tự cài đặt phần mềm nào sau đây là đúng quy trình kĩ thuật?`,
          options: [
            'A. Cài đặt hệ điều hành (như Windows hoặc Ubuntu Linux) trước, sau đó mới cài đặt phần mềm ứng dụng Scratch và phần mềm soạn thảo văn bản.',
            'B. Cài đặt phần mềm Scratch trước rồi mới cài đặt hệ điều hành sau.',
            'C. Chỉ cần cài đặt phần mềm Microsoft Word mà không cần cài đặt hệ điều hành.',
            'D. Cắm máy in vào là máy tính tự động chạy được mọi phần mềm mà không cần cài đặt.',
          ],
          correctAnswer:
            'A. Cài đặt hệ điều hành (như Windows hoặc Ubuntu Linux) trước, sau đó mới cài đặt phần mềm ứng dụng Scratch và phần mềm soạn thảo văn bản.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hệ điều hành là phần mềm hệ thống nền tảng phải được cài đặt trước tiên thì các phần mềm ứng dụng mới cài và chạy được.`,
        },
        {
          stem: `Trong khi đang làm bài tập trên máy tính, bạn Hùng thấy một phần mềm ứng dụng bị treo ("Not Responding") không bấm tiếp được, nhưng con trỏ chuột vẫn di chuyển bình thường. Hùng nên sử dụng công cụ nào của hệ điều hành Windows để đóng riêng phần mềm bị treo đó mà không làm mất dữ liệu đang mở ở các phần mềm khác?`,
          options: [
            'A. Mở trình quản lí tác vụ Task Manager (Ctrl + Shift + Esc), chọn phần mềm bị treo và nhấn End Task.',
            'B. Rút phích cắm nguồn điện của máy tính ra khỏi ổ điện ngay lập tức.',
            'C. Xóa toàn bộ hệ điều hành trên ổ đĩa C.',
            'D. Tháo rời bàn phím và màn hình ra khỏi thân máy.',
          ],
          correctAnswer:
            'A. Mở trình quản lí tác vụ Task Manager (Ctrl + Shift + Esc), chọn phần mềm bị treo và nhấn End Task.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hệ điều hành quản lí và điều phối các chương trình ứng dụng đang chạy thông qua Task Manager.`,
        },
      ];
      return vanDungVariants[variantIndex % vanDungVariants.length];
    }

    if (formatGroup === 'TRUE_FALSE') {
      const tfVariants = [
        {
          stem: `Khi tìm hiểu bài "${cleanLesson}" với yêu cầu cần đạt "${cleanOutcome}", hãy xét tính Đúng (Đ) hoặc Sai (S) của các phát biểu sau:`,
          subStatements: [
            {
              label: 'a',
              statement:
                'Hệ điều hành (như Windows, Linux, Android) là phần mềm hệ thống quan trọng nhất giúp quản lí phần cứng và điều phối hoạt động của máy tính.',
              isTrue: true,
              explanation:
                'Đúng, hệ điều hành quản lí toàn bộ thiết bị phần cứng và tạo môi trường chạy phần mềm ứng dụng.',
            },
            {
              label: 'b',
              statement:
                'Máy tính để bàn chưa cài đặt hệ điều hành vẫn có thể mở trực tiếp phần mềm Microsoft PowerPoint để thiết kế bài trình chiếu.',
              isTrue: false,
              explanation:
                'Sai, phần mềm ứng dụng như PowerPoint bắt buộc phải chạy trên nền tảng của một hệ điều hành.',
            },
            {
              label: 'c',
              statement:
                'Microsoft Word, Excel, Scratch và trình duyệt Google Chrome đều thuộc nhóm phần mềm ứng dụng phục vụ các công việc cụ thể của người dùng.',
              isTrue: true,
              explanation:
                'Đúng, đây là các phần mềm ứng dụng trực tiếp hỗ trợ soạn thảo, tính toán, lập trình và duyệt web.',
            },
            {
              label: 'd',
              statement:
                'Phần mềm ứng dụng có chức năng thay thế hoàn toàn hệ điều hành trong việc điều khiển CPU và bộ nhớ RAM khi khởi động máy tính.',
              isTrue: false,
              explanation:
                'Sai, việc quản lí CPU, bộ nhớ RAM và quá trình khởi động máy tính thuộc chức năng của hệ điều hành.',
            },
          ],
          correctAnswer: 'a) Đúng | b) Sai | c) Đúng | d) Sai',
        },
        {
          stem: `Trong buổi thảo luận nhóm về phân loại phần mềm máy tính (thuộc bài "${cleanLesson}"), các bạn học sinh nêu ra 4 ý kiến sau. Hãy xét tính Đúng (Đ) hoặc Sai (S) của mỗi ý kiến:`,
          subStatements: [
            {
              label: 'a',
              statement:
                'Trình duyệt web Google Chrome là một hệ điều hành vì nó có thể mở được nhiều trang web khác nhau.',
              isTrue: false,
              explanation:
                'Sai, Google Chrome chỉ là phần mềm ứng dụng dùng để truy cập web, chạy trên nền hệ điều hành.',
            },
            {
              label: 'b',
              statement:
                'Trên điện thoại thông minh, Android và iOS đóng vai trò là hệ điều hành quản lí thiết bị và các ứng dụng di động.',
              isTrue: true,
              explanation:
                'Đúng, Android và iOS là hai hệ điều hành phổ biến dành cho thiết bị di động.',
            },
            {
              label: 'c',
              statement:
                'Khi gỡ bỏ một trò chơi hoặc một phần mềm vẽ trên máy tính, hệ điều hành của máy tính sẽ bị hỏng và không khởi động được nữa.',
              isTrue: false,
              explanation:
                'Sai, gỡ bỏ một phần mềm ứng dụng thông thường không làm hỏng hệ điều hành.',
            },
            {
              label: 'd',
              statement:
                'Hệ điều hành đóng vai trò cầu nối trung gian giữa người dùng, phần mềm ứng dụng và thiết bị phần cứng máy tính.',
              isTrue: true,
              explanation:
                'Đúng, đây là vai trò cốt lõi của hệ điều hành trong hệ thống máy tính.',
            },
          ],
          correctAnswer: 'a) Sai | b) Đúng | c) Sai | d) Đúng',
        },
      ];
      const chosenTf = tfVariants[variantIndex % tfVariants.length];
      return {
        ...chosenTf,
        gradingGuide: `Đáp án gợi ý [${outcomeCode}]: ${chosenTf.correctAnswer} (Tổng ${unitPoints}đ). Giải thích chi tiết từng mệnh đề bám sát chức năng phần mềm hệ thống và phần mềm ứng dụng.`,
      };
    }

    if (formatGroup === 'SHORT_ANSWER') {
      const saVariants = [
        {
          stem: `Loại phần mềm nào bắt buộc phải được nạp đầu tiên khi máy tính khởi động để quản lí các thiết bị phần cứng và tạo môi trường cho các phần mềm ứng dụng hoạt động?`,
          acceptedVariations: ['Hệ điều hành', 'Phần mềm hệ thống', 'Hệ điều hành (Phần mềm hệ thống)'],
          correctAnswer: 'Hệ điều hành',
        },
        {
          stem: `Các phần mềm như Microsoft Word, Microsoft Excel, Google Chrome, Scratch được xếp chung vào nhóm phần mềm nào (phân biệt với phần mềm hệ thống)?`,
          acceptedVariations: ['Phần mềm ứng dụng', 'Ứng dụng', 'Application Software'],
          correctAnswer: 'Phần mềm ứng dụng',
        },
        {
          stem: `Để gõ tiếng Việt có dấu trên máy tính Windows, người dùng thường sử dụng phần mềm ứng dụng hỗ trợ bộ gõ phổ biến nào (ví dụ: UniKey, VietKey)?`,
          acceptedVariations: ['UniKey', 'Unikey', 'Bộ gõ tiếng Việt UniKey', 'VietKey'],
          correctAnswer: 'UniKey',
        },
      ];
      const chosenSa = saVariants[variantIndex % saVariants.length];
      return {
        ...chosenSa,
        gradingGuide: `Đáp án gợi ý: "${chosenSa.correctAnswer}" đạt ${unitPoints}đ. Bám sát YCCĐ [${outcomeCode}]: ${cleanOutcome}.`,
      };
    }

    return {
      stem: `Vận dụng kiến thức bài "${cleanLesson}" (${cleanOutcome}), em hãy:\na) Nêu chức năng của phần mềm hệ thống và phần mềm ứng dụng.\nb) Phân biệt hệ điều hành với phần mềm ứng dụng theo 3 tiêu chí: Vai trò đối với máy tính, sự phụ thuộc khi hoạt động và ví dụ minh họa (mỗi loại lấy 2 ví dụ).`,
      rubricCriteria: [
        {
          id: `rub-${outcomeCode}-${variantIndex}-1`,
          criterion:
            'Nêu đúng chức năng: Phần mềm hệ thống vận hành, quản lí phần cứng và tạo môi trường làm việc; Phần mềm ứng dụng giải quyết các nhu cầu công việc cụ thể của người dùng.',
          points: p1,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-2`,
          criterion:
            'Phân biệt rõ mối quan hệ phụ thuộc: Máy tính phải có hệ điều hành mới hoạt động được; phần mềm ứng dụng chỉ cài đặt và chạy được trên nền hệ điều hành.',
          points: p2,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-3`,
          criterion:
            'Lấy đúng ít nhất 2 ví dụ cho mỗi loại (Hệ điều hành: Windows, macOS/Android/Linux; Phần mềm ứng dụng: Word, Excel, Chrome, Paint...).',
          points: p3,
        },
      ],
      correctAnswer: `1. Chức năng: Phần mềm hệ thống (tiêu biểu là Hệ điều hành) điều khiển phần cứng và tạo môi trường cho phần mềm khác chạy; Phần mềm ứng dụng giúp người dùng thực hiện các tác vụ cụ thể (soạn thảo, tính toán, học tập, giải trí).\n2. Phân biệt: Hệ điều hành là phần mềm nền tảng bắt buộc phải có khi máy tính hoạt động (VD: Windows, Android); Phần mềm ứng dụng phụ thuộc vào hệ điều hành, chỉ cài theo nhu cầu người dùng (VD: MS Word, MS Excel, Google Chrome).`,
      gradingGuide: `Chấm theo 3 tiêu chí chi tiết bám sát YCCĐ [${outcomeCode}] (${p1}đ + ${p2}đ + ${p3}đ = ${unitPoints}đ).`,
    };
  }

  // 3. Quản lý dữ liệu trong máy tính / Tệp và thư mục (Tin học)
  if (/tệp|thư mục|quản lý dữ liệu|quản lí dữ liệu|sao chép|đổi tên/.test(combinedNorm)) {
    if (formatGroup === 'MCQ') {
      if (levelColumn === 'BIET') {
        const bietVariants = [
          {
            stem: `Khi quản lí tệp và thư mục trên máy tính (bài "${cleanLesson}"), tổ hợp phím tắt nào dưới đây dùng để sao chép (Copy) và dán (Paste) một tệp hoặc thư mục sang vị trí khác?`,
            options: [
              'A. Nhấn Ctrl + C để sao chép và nhấn Ctrl + V để dán.',
              'B. Nhấn Ctrl + X để sao chép và nhấn Ctrl + Z để dán.',
              'C. Nhấn phím Delete để sao chép và phím F2 để dán.',
              'D. Nhấn Alt + F4 để sao chép và Ctrl + S để dán.',
            ],
            correctAnswer: 'A. Nhấn Ctrl + C để sao chép và nhấn Ctrl + V để dán.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Ctrl + C là lệnh Copy (sao chép), Ctrl + V là lệnh Paste (dán). Ctrl + X là di chuyển (Cut), F2 là đổi tên (Rename), Delete là xóa.`,
          },
          {
            stem: `Trong tên tệp "Bai_tap_Tin_hoc.docx", phần mở rộng (extension) của tệp là phần nào và cho biết điều gì?`,
            options: [
              'A. Phần mở rộng là "docx", cho hệ điều hành biết đây là tệp văn bản Microsoft Word.',
              'B. Phần mở rộng là "Bai_tap", cho biết ngày giờ tạo tệp.',
              'C. Phần mở rộng là "Tin_hoc", cho biết dung lượng bộ nhớ RAM của máy tính.',
              'D. Tên tệp trên không có phần mở rộng.',
            ],
            correctAnswer: 'A. Phần mở rộng là "docx", cho hệ điều hành biết đây là tệp văn bản Microsoft Word.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Phần mở rộng đứng sau dấu chấm cuối cùng (.docx) giúp nhận diện kiểu tệp.`,
          },
          {
            stem: `Khi đặt tên cho tệp hoặc thư mục trên hệ điều hành Windows, kí tự nào dưới đây bị cấm KHÔNG được phép sử dụng trong tên tệp?`,
            options: [
              'A. Các kí tự đặc biệt như \\ / : * ? " < > |',
              'B. Các chữ cái tiếng Anh từ A đến Z.',
              'C. Các chữ số từ 0 đến 9.',
              'D. Dấu gạch dưới (_) và dấu gạch ngang (-).',
            ],
            correctAnswer: 'A. Các kí tự đặc biệt như \\ / : * ? " < > |',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hệ điều hành Windows không cho phép dùng các kí tự \\ / : * ? " < > | khi đặt tên tệp/thư mục.`,
          },
          {
            stem: `Để đổi tên nhanh một tệp hoặc thư mục đang được chọn trong cửa sổ File Explorer trên Windows, người dùng nhấn phím chức năng nào trên bàn phím?`,
            options: [
              'A. Phím F2.',
              'B. Phím F5.',
              'C. Phím Esc.',
              'D. Phím Tab.',
            ],
            correctAnswer: 'A. Phím F2.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Phím F2 là phím tắt chuẩn để thực hiện lệnh Rename (đổi tên) tệp hoặc thư mục.`,
          },
        ];
        return bietVariants[variantIndex % bietVariants.length];
      }
      if (levelColumn === 'HIEU') {
        const hieuVariants = [
          {
            stem: `Trong bài "${cleanLesson}", thao tác "Di chuyển" (Cut – Paste) một tệp từ thư mục A sang thư mục B khác với thao tác "Sao chép" (Copy – Paste) ở điểm nào?`,
            options: [
              'A. Sau khi di chuyển, tệp chỉ còn ở thư mục B và không còn ở thư mục A; còn sau khi sao chép, tệp tồn tại ở cả hai thư mục A và B.',
              'B. Sau khi di chuyển, tệp bị xóa vĩnh viễn khỏi cả hai thư mục A và B.',
              'C. Sao chép làm mất tệp gốc ở thư mục A, còn di chuyển giữ nguyên tệp gốc ở thư mục A.',
              'D. Hai thao tác hoàn toàn giống nhau, đều tạo ra hai bản sao ở cả hai thư mục.',
            ],
            correctAnswer:
              'A. Sau khi di chuyển, tệp chỉ còn ở thư mục B và không còn ở thư mục A; còn sau khi sao chép, tệp tồn tại ở cả hai thư mục A và B.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Sao chép tạo thêm bản sao ở đích mà vẫn giữ bản gốc; di chuyển chuyển hẳn tệp sang thư mục đích.`,
          },
          {
            stem: `Vì sao khi bạn Hoa thực hiện đổi tên tệp "Bao_cao.docx" trong File Explorer thì máy tính hiện thông báo lỗi "The action can't be completed because the file is open in Word"?`,
            options: [
              'A. Vì tệp "Bao_cao.docx" đang được mở trong phần mềm Microsoft Word; cần đóng tệp đó lại trước khi đổi tên hoặc di chuyển.',
              'B. Vì tệp văn bản không bao giờ được phép đổi tên trên máy tính.',
              'C. Vì bàn phím máy tính đã bị hỏng phím Enter.',
              'D. Vì ổ cứng máy tính không cho phép lưu tệp có chữ cái tiếng Việt.',
            ],
            correctAnswer:
              'A. Vì tệp "Bao_cao.docx" đang được mở trong phần mềm Microsoft Word; cần đóng tệp đó lại trước khi đổi tên hoặc di chuyển.',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hệ điều hành khóa tệp đang mở để bảo vệ dữ liệu; phải đóng tệp trước khi đổi tên, di chuyển hoặc xóa.`,
          },
          {
            stem: `Cho đường dẫn đến một tệp bài tập là "D:\\Hoc_tap\\Lop_7\\Tin_hoc\\Bai_3.pptx". Thư mục nào là thư mục mẹ trực tiếp chứa tệp "Bai_3.pptx"?`,
            options: [
              'A. Thư mục "Tin_hoc".',
              'B. Ổ đĩa "D:".',
              'C. Thư mục "Hoc_tap".',
              'D. Tệp "Bai_3.pptx".',
            ],
            correctAnswer: 'A. Thư mục "Tin_hoc".',
            gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Trong đường dẫn phân cấp, thành phần đứng ngay trước tên tệp ("Tin_hoc") là thư mục chứa trực tiếp tệp đó.`,
          },
        ];
        return hieuVariants[variantIndex % hieuVariants.length];
      }
      const vanDungVariants = [
        {
          stem: `Bạn Nam lưu tất cả bài tập của các môn Toán, Ngữ văn, Tin học, Tiếng Anh chung lẫn lộn trên màn hình nền (Desktop) với tên tệp "Bai1.docx", "Bai2.docx", "Bai3.xlsx" khiến việc tìm lại bài rất mất thời gian. Cách tổ chức nào dưới đây giúp Nam quản lí dữ liệu khoa học và tìm kiếm nhanh nhất?`,
          options: [
            'A. Tạo thư mục "Hoc_tap_Lop7", bên trong tạo các thư mục con theo từng môn học (Toan, Ngu_van, Tin_hoc, Tieng_anh) và đổi tên tệp gợi nhớ rõ nội dung bài.',
            'B. Giữ nguyên tất cả các tệp ngoài màn hình nền và đổi tên thành các con số ngẫu nhiên.',
            'C. Nén toàn bộ tệp vào thùng rác (Recycle Bin) để màn hình gọn gàng hơn.',
            'D. Đặt trùng tên tất cả các tệp trong cùng một thư mục để dễ nhớ.',
          ],
          correctAnswer:
            'A. Tạo thư mục "Hoc_tap_Lop7", bên trong tạo các thư mục con theo từng môn học (Toan, Ngu_van, Tin_hoc, Tieng_anh) và đổi tên tệp gợi nhớ rõ nội dung bài.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Phân cấp cây thư mục theo chủ đề/môn học kết hợp đặt tên tệp rõ nghĩa giúp quản lí dữ liệu khoa học, tránh thất lạc và tra cứu nhanh chóng.`,
        },
        {
          stem: `Để đề phòng trường hợp máy tính bị hỏng ổ cứng hoặc nhiễm virus làm mất toàn bộ thư mục bài tập dự án quan trọng, biện pháp sao lưu nào dưới đây là an toàn và hiệu quả nhất?`,
          options: [
            'A. Sao chép (Backup) thư mục dự án sang thiết bị lưu trữ ngoài (USB/ổ cứng di động) hoặc đưa lên dịch vụ lưu trữ đám mây (Google Drive, OneDrive).',
            'B. Đổi tên thư mục dự án thành chữ in hoa ngay trong cùng một ổ đĩa C.',
            'C. Xóa thư mục dự án đi để virus không nhìn thấy.',
            'D. Mở tất cả các tệp trong thư mục cùng một lúc và không bao giờ tắt máy tính.',
          ],
          correctAnswer:
            'A. Sao chép (Backup) thư mục dự án sang thiết bị lưu trữ ngoài (USB/ổ cứng di động) hoặc đưa lên dịch vụ lưu trữ đám mây (Google Drive, OneDrive).',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Sao lưu dữ liệu ra thiết bị lưu trữ độc lập hoặc đám mây giúp bảo toàn dữ liệu khi máy tính gặp sự cố.`,
        },
        {
          stem: `Khi bạn Mai vô tình nhấn phím Delete làm xóa nhầm tệp bài thuyết trình "Du_an_Tin_hoc.pptx" vào Thùng rác (Recycle Bin), Mai cần thực hiện thao tác nào để khôi phục tệp về đúng vị trí ban đầu?`,
          options: [
            'A. Mở Recycle Bin, nháy nút phải chuột vào tệp "Du_an_Tin_hoc.pptx" và chọn lệnh Restore.',
            'B. Mở Recycle Bin và nhấn chọn Empty Recycle Bin.',
            'C. Khởi động lại máy tính 3 lần liên tiếp.',
            'D. Rút dây bàn phím ra khỏi cổng USB.',
          ],
          correctAnswer:
            'A. Mở Recycle Bin, nháy nút phải chuột vào tệp "Du_an_Tin_hoc.pptx" và chọn lệnh Restore.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Lệnh Restore trong Recycle Bin giúp khôi phục tệp bị xóa nhầm về thư mục gốc ban đầu.`,
        },
      ];
      return vanDungVariants[variantIndex % vanDungVariants.length];
    }

    if (formatGroup === 'TRUE_FALSE') {
      const subStatements = [
        {
          label: 'a',
          statement:
            'Phần mở rộng của tên tệp (đứng sau dấu chấm cuối cùng, ví dụ .docx, .xlsx, .mp4) giúp hệ điều hành nhận biết kiểu tệp và chọn phần mềm thích hợp để mở.',
          isTrue: true,
          explanation:
            'Đúng, phần mở rộng cho biết định dạng dữ liệu của tệp và liên kết với phần mềm ứng dụng tương ứng.',
        },
        {
          label: 'b',
          statement:
            'Trong cùng một thư mục, người dùng có thể đặt hai tệp có phần tên và phần mở rộng hoàn toàn giống hệt nhau.',
          isTrue: false,
          explanation:
            'Sai, trong cùng một thư mục không thể có hai tệp trùng cả tên và phần mở rộng.',
        },
        {
          label: 'c',
          statement:
            'Khi đang mở một tệp văn bản trong phần mềm Microsoft Word, hệ điều hành sẽ ngăn không cho phép đổi tên hoặc xóa tệp đó để bảo vệ dữ liệu.',
          isTrue: true,
          explanation:
            'Đúng, cần đóng tệp đang mở trước khi thực hiện đổi tên, di chuyển hoặc xóa tệp.',
        },
        {
          label: 'd',
          statement:
            'Xóa một thư mục mẹ chỉ làm mất vỏ thư mục đó, còn các tệp và thư mục con bên trong vẫn tự động giữ nguyên ở ổ đĩa.',
          isTrue: false,
          explanation:
            'Sai, khi xóa một thư mục thì toàn bộ các tệp và thư mục con bên trong thư mục đó cũng bị xóa theo.',
        },
      ];
      return {
        stem: `Trong bài học "${cleanLesson}" (${cleanOutcome}), học sinh thực hành quản lí cây thư mục và tệp dữ liệu trên máy tính. Xét tính Đúng (Đ) hoặc Sai (S) của mỗi phát biểu sau:`,
        subStatements,
        correctAnswer: 'a) Đúng | b) Sai | c) Đúng | d) Sai',
        gradingGuide: `Đáp án gợi ý [${outcomeCode}]: a) Đúng; b) Sai; c) Đúng; d) Sai (Tổng ${unitPoints}đ). Giải thích chi tiết từng ý bám sát YCCĐ quản lí tệp và thư mục.`,
      };
    }

    if (formatGroup === 'SHORT_ANSWER') {
      const saVariants = [
        {
          stem: `Trên hệ điều hành Windows, khi chọn một tệp hoặc thư mục trong File Explorer, em nhấn phím chức năng nào (từ F1 đến F12) trên bàn phím để thực hiện nhanh thao tác đổi tên (Rename)?`,
          acceptedVariations: ['F2', 'Phím F2', 'f2'],
          correctAnswer: 'F2',
        },
        {
          stem: `Tổ hợp phím tắt chuẩn trên bàn phím dùng để Di chuyển (Cut) một tệp hoặc thư mục đang chọn sang vị trí khác là gì?`,
          acceptedVariations: ['Ctrl + X', 'Ctrl+X', 'ctrl + x'],
          correctAnswer: 'Ctrl + X',
        },
        {
          stem: `Cho đường dẫn tệp "E:\\Tai_lieu_hoc_tap\\Mon_Tin\\Bai_thuc_hanh.docx". Em hãy cho biết phần mở rộng của tệp trên là gì?`,
          acceptedVariations: ['.docx', 'docx', 'DOCX'],
          correctAnswer: '.docx',
        },
      ];
      const chosenSa = saVariants[variantIndex % saVariants.length];
      return {
        ...chosenSa,
        gradingGuide: `Đáp án gợi ý: "${chosenSa.correctAnswer}" đạt ${unitPoints}đ. Đánh giá trực tiếp thao tác quản lí tệp/thư mục thuộc YCCĐ [${outcomeCode}].`,
      };
    }

    return {
      stem: `Để phục vụ việc học tập trong năm học mới (bài "${cleanLesson}" – ${cleanOutcome}):\na) Em hãy thiết kế sơ đồ cây thư mục hợp lí để lưu trữ tài liệu của 3 môn Toán, Ngữ văn, Tin học (mỗi môn gồm Bài giảng và Bài tập) kèm theo quy tắc đặt tên tệp khoa học.\nb) Giải thích lợi ích của việc sắp xếp cây thư mục khoa học khi cần tìm kiếm hoặc sao lưu dữ liệu.`,
      rubricCriteria: [
        {
          id: `rub-${outcomeCode}-${variantIndex}-1`,
          criterion:
            'Vẽ hoặc mô tả đúng cấu trúc cây thư mục tối thiểu 3 cấp (Thư mục gốc Nam_hoc -> Các thư mục môn Toan, Ngu_van, Tin_hoc -> Thư mục con Bai_giang, Bai_tap).',
          points: p1,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-2`,
          criterion:
            'Nêu đúng quy tắc đặt tên tệp và thư mục: ngắn gọn, rõ nghĩa phản ánh nội dung, không chứa kí tự đặc biệt bị cấm (/, \\, :, *, ?, ", <, >, |).',
          points: p2,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-3`,
          criterion:
            'Giải thích rõ lợi ích: giúp phân loại ngăn nắp, tìm kiếm tệp nhanh chóng, tránh xóa nhầm và dễ dàng sao lưu dữ liệu.',
          points: p3,
        },
      ],
      correctAnswer: `1. Cấu trúc cây thư mục:\n- Hoc_Tap_Lop_${grade}\n  + Mon_Toan (gồm: Bai_Giang, Bai_Tap)\n  + Mon_Ngu_Van (gồm: Bai_Giang, Bai_Tap)\n  + Mon_Tin_Hoc (gồm: Bai_Giang, Bai_Tap)\nQuy tắc đặt tên tệp: gợi nhớ nội dung (VD: Bai3_QuanLyDuLieu.docx), không dùng kí tự bị cấm.\n2. Lợi ích: Tiết kiệm thời gian tìm kiếm, tránh thất lạc hoặc ghi đè nhầm tệp và thuận tiện khi sao lưu cả thư mục học tập.`,
      gradingGuide: `Chấm theo 3 tiêu chí chi tiết bám sát YCCĐ [${outcomeCode}] (${p1}đ + ${p2}đ + ${p3}đ = ${unitPoints}đ).`,
    };
  }

  // 4. Mạng xã hội & Ứng xử trên mạng (Tin học)
  if (/mạng xã hội|kênh trao đổi|ứng xử trên mạng|bắt nạt trên mạng|giao tiếp qua mạng/.test(combinedNorm)) {
    if (formatGroup === 'MCQ') {
      const socialMcqVariants = [
        {
          stem: `Theo nội dung bài "${cleanLesson}", hành vi nào dưới đây thể hiện cách giao tiếp qua mạng văn minh, lịch sự và đúng quy tắc an toàn?`,
          options: [
            'A. Sử dụng ngôn từ tôn trọng người đối thoại, bảo mật thông tin cá nhân và kiểm chứng thông tin trước khi chia sẻ.',
            'B. Tự ý đăng tải hình ảnh riêng tư và số điện thoại của bạn học lên mạng xã hội khi chưa được phép.',
            'C. Dùng lời lẽ xúc phạm, chế giễu bạn bè trong nhóm trò chuyện của lớp.',
            'D. Chia sẻ ngay lập tức các tin đồn giật gân chưa rõ nguồn gốc để câu lượt thích.',
          ],
          correctAnswer:
            'A. Sử dụng ngôn từ tôn trọng người đối thoại, bảo mật thông tin cá nhân và kiểm chứng thông tin trước khi chia sẻ.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Giao tiếp văn minh trên mạng đòi hỏi ngôn ngữ lịch sự, tôn trọng quyền riêng tư và có trách nhiệm với thông tin chia sẻ.`,
        },
        {
          stem: `Khi nhận được những tin nhắn đe dọa, xúc phạm hoặc phát hiện mình bị bắt nạt trên mạng xã hội, cách ứng phó nào dưới đây là đúng đắn và an toàn nhất cho học sinh?`,
          options: [
            'A. Không trả lời đôi co, lưu lại bằng chứng (chụp màn hình), chặn tài khoản gây hại và báo ngay cho cha mẹ, thầy cô giáo để được hỗ trợ.',
            'B. Giữ kín chuyện một mình và làm theo mọi yêu cầu của người lạ để họ không làm phiền nữa.',
            'C. Lập nhiều tài khoản ẩn danh để nhắn tin chửi bới, trả đũa lại người đó trên mạng.',
            'D. Cung cấp mật khẩu tài khoản và địa chỉ nhà cho người đó để giải thích.',
          ],
          correctAnswer:
            'A. Không trả lời đôi co, lưu lại bằng chứng (chụp màn hình), chặn tài khoản gây hại và báo ngay cho cha mẹ, thầy cô giáo để được hỗ trợ.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Khi gặp bắt nạt trên mạng, tuyệt đối không tự chịu đựng hay đôi co; cần lưu bằng chứng, chặn liên lạc và tìm sự giúp đỡ từ người lớn tin cậy (cha mẹ, thầy cô).`,
        },
        {
          stem: `Chức năng cơ bản nào dưới đây là đặc trưng của mạng xã hội và các kênh trao đổi thông tin trực tuyến trên Internet (bài "${cleanLesson}")?`,
          options: [
            'A. Kết nối người dùng, tạo hồ sơ cá nhân, đăng tải/chia sẻ nội dung (văn bản, ảnh, video) và nhắn tin, bình luận tương tác trực tuyến.',
            'B. Sửa chữa các hư hỏng vật lí của bàn phím, chuột và màn hình máy tính.',
            'C. Tự động nâng cấp dung lượng bộ nhớ RAM và ổ cứng mà không cần phần cứng.',
            'D. Giúp máy tính hoạt động không cần nguồn điện khi mất kết nối mạng.',
          ],
          correctAnswer:
            'A. Kết nối người dùng, tạo hồ sơ cá nhân, đăng tải/chia sẻ nội dung (văn bản, ảnh, video) và nhắn tin, bình luận tương tác trực tuyến.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Mạng xã hội cung cấp dịch vụ kết nối cộng đồng, chia sẻ thông tin đa phương tiện và trao đổi trực tuyến.`,
        },
        {
          stem: `Để bảo vệ tài khoản mạng xã hội và thư điện tử khỏi nguy cơ bị kẻ xấu đánh cắp, học sinh nên thiết lập mật khẩu và thói quen sử dụng như thế nào?`,
          options: [
            'A. Đặt mật khẩu đủ mạnh (kết hợp chữ hoa, chữ thường, chữ số, kí tự đặc biệt), bật xác thực hai lớp và đăng xuất ngay sau khi dùng trên máy tính công cộng.',
            'B. Đặt mật khẩu là "123456" hoặc ngày sinh của mình và ghi mật khẩu dán lên màn hình máy tính lớp học.',
            'C. Nhập mật khẩu tài khoản vào mọi đường dẫn nhận quà miễn phí không rõ nguồn gốc.',
            'D. Chia sẻ mật khẩu cho tất cả người quen trên mạng xã hội cùng sử dụng.',
          ],
          correctAnswer:
            'A. Đặt mật khẩu đủ mạnh (kết hợp chữ hoa, chữ thường, chữ số, kí tự đặc biệt), bật xác thực hai lớp và đăng xuất ngay sau khi dùng trên máy tính công cộng.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Bảo mật tài khoản số bằng mật khẩu mạnh và thói quen đăng xuất trên thiết bị dùng chung.`,
        },
      ];
      return socialMcqVariants[variantIndex % socialMcqVariants.length];
    }

    if (formatGroup === 'TRUE_FALSE') {
      const subStatements = [
        {
          label: 'a',
          statement:
            'Mạng xã hội cho phép người dùng kết nối bạn bè, chia sẻ thông tin, hình ảnh và trao đổi trực tuyến qua tin nhắn hoặc bình luận.',
          isTrue: true,
          explanation:
            'Đúng, đây là các chức năng cốt lõi của mạng xã hội và kênh trao đổi thông tin trên Internet.',
        },
        {
          label: 'b',
          statement:
            'Mọi thông tin, bài viết được chia sẻ nhiều lượt trên mạng xã hội đều hoàn toàn chính xác và không cần kiểm chứng nguồn.',
          isTrue: false,
          explanation:
            'Sai, thông tin trên mạng xã hội do nhiều người tự đăng tải nên có thể chứa tin giả, tin sai sự thật; cần kiểm chứng từ nguồn chính thống.',
        },
        {
          label: 'c',
          statement:
            'Khi giao tiếp qua mạng, cần sử dụng ngôn từ lịch sự, tôn trọng quyền riêng tư và xin phép trước khi đăng ảnh của người khác.',
          isTrue: true,
          explanation:
            'Đúng, đây là quy tắc ứng xử văn minh và tôn trọng pháp luật trên không gian mạng.',
        },
        {
          label: 'd',
          statement:
            'Nếu bị người lạ đe dọa hoặc bắt nạt trên mạng, học sinh nên giấu kín không nói với cha mẹ, thầy cô và tự mình gặp riêng người đó.',
          isTrue: false,
          explanation:
            'Sai, việc giấu kín và tự gặp người lạ rất nguy hiểm; cần lưu bằng chứng, chặn tài khoản và báo ngay cho cha mẹ, thầy cô.',
        },
      ];
      return {
        stem: `Trong bài học "${cleanLesson}" (${cleanOutcome}), học sinh tìm hiểu về cách sử dụng mạng xã hội và ứng xử văn minh, an toàn trên môi trường số. Xét tính Đúng (Đ) hoặc Sai (S) của mỗi nhận định sau:`,
        subStatements,
        correctAnswer: 'a) Đúng | b) Sai | c) Đúng | d) Sai',
        gradingGuide: `Đáp án gợi ý [${outcomeCode}]: a) Đúng; b) Sai; c) Đúng; d) Sai (Tổng ${unitPoints}đ). Giải thích chi tiết từng ý bám sát YCCĐ [${outcomeCode}]: "${cleanOutcome}".`,
      };
    }

    if (formatGroup === 'SHORT_ANSWER') {
      return {
        stem: `Khi gặp hành vi bắt nạt hoặc đe dọa trên mạng xã hội, bên cạnh việc không đôi co và chặn tài khoản gây hại, học sinh cần chia sẻ và báo ngay cho ai để được bảo vệ kịp thời?`,
        acceptedVariations: [
          'Cha mẹ và thầy cô giáo',
          'Bố mẹ, thầy cô giáo',
          'Người lớn tin cậy (cha mẹ, thầy cô)',
          'Cha mẹ hoặc giáo viên',
        ],
        correctAnswer: 'Cha mẹ và thầy cô giáo',
        gradingGuide: `Đáp án gợi ý: "Cha mẹ và thầy cô giáo" (hoặc người lớn tin cậy/cơ quan chức năng) đạt ${unitPoints}đ. Bám sát YCCĐ [${outcomeCode}]: ${cleanOutcome}.`,
      };
    }

    return {
      stem: `Vận dụng kiến thức bài "${cleanLesson}" (${cleanOutcome}):\na) Nêu 4 quy tắc giao tiếp văn minh, lịch sự và bảo vệ thông tin cá nhân khi tham gia mạng xã hội.\nb) Tình huống: Một người bạn trong lớp em bị kẻ xấu ghép ảnh trêu chọc và nhắn tin đe dọa trên mạng xã hội khiến bạn rất lo sợ. Em sẽ khuyên bạn xử lí theo những bước nào?`,
      rubricCriteria: [
        {
          id: `rub-${outcomeCode}-${variantIndex}-1`,
          criterion:
            'Nêu đúng các quy tắc ứng xử văn minh trên mạng: ngôn từ lịch sự, tôn trọng người khác, không phát tán tin giả, bảo mật thông tin cá nhân và mật khẩu.',
          points: p1,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-2`,
          criterion:
            'Hướng dẫn xử lí tình huống bắt nạt trên mạng đúng quy trình: Bình tĩnh, không trả lời đôi co; chụp màn hình lưu giữ bằng chứng; chặn/báo cáo (Report) tài khoản vi phạm.',
          points: p2,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-3`,
          criterion:
            'Khuyên bạn báo ngay cho cha mẹ, thầy cô chủ nhiệm để được can thiệp, bảo vệ và động viên tinh thần bạn.',
          points: p3,
        },
      ],
      correctAnswer: `1. Quy tắc giao tiếp văn minh trên mạng: Sử dụng ngôn ngữ lịch sự, tôn trọng sự khác biệt; không đăng tải thông tin riêng tư của người khác khi chưa xin phép; kiểm chứng thông tin trước khi chia sẻ; bảo mật mật khẩu và dữ liệu cá nhân.\n2. Cách xử lí khi bị bắt nạt trên mạng: Khuyên bạn giữ bình tĩnh, tuyệt đối không nhắn tin đôi co; chụp màn hình lưu lại bằng chứng; sử dụng chức năng Chặn (Block) và Báo cáo vi phạm (Report); đồng thời thông báo ngay cho cha mẹ và thầy cô giáo chủ nhiệm để được hỗ trợ giải quyết.`,
      gradingGuide: `Chấm theo 3 tiêu chí chi tiết bám sát YCCĐ [${outcomeCode}] (${p1}đ + ${p2}đ + ${p3}đ = ${unitPoints}đ).`,
    };
  }

  // 5. Phần mềm bảng tính / Công thức & Hàm tính toán tự động (Tin học)
  if (/bảng tính|trang tính|địa chỉ ô|công thức|sum|average|max|min|count/.test(combinedNorm)) {
    if (formatGroup === 'MCQ') {
      const sheetMcqVariants = [
        {
          stem: `Trong phần mềm bảng tính (bài "${cleanLesson}"), khi nhập một công thức hoặc hàm tính toán vào ô tính, kí tự nào dưới đây bắt buộc phải được gõ đầu tiên?`,
          options: [
            'A. Dấu bằng (=).',
            'B. Dấu hai chấm (:).',
            'C. Dấu chấm hỏi (?).',
            'D. Dấu thăng (#).',
          ],
          correctAnswer: 'A. Dấu bằng (=).',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Mọi công thức và hàm trong phần mềm bảng tính đều bắt đầu bằng dấu bằng (=).`,
        },
        {
          stem: `Trên trang tính, giả sử các ô A1, A2, A3 lần lượt chứa các số 10, 20, 30. Khi nhập công thức =AVERAGE(A1:A3) vào ô A4 và nhấn Enter thì kết quả hiển thị tại ô A4 là bao nhiêu?`,
          options: [
            'A. 20',
            'B. 60',
            'C. 30',
            'D. 3',
          ],
          correctAnswer: 'A. 20',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hàm AVERAGE tính trung bình cộng của vùng A1:A3 là (10 + 20 + 30) / 3 = 20. (60 là kết quả của hàm SUM; 30 là hàm MAX; 3 là hàm COUNT).`,
        },
        {
          stem: `Trong bảng theo dõi điểm kiểm tra môn Tin học của tổ 1, điểm của 5 bạn được lưu liên tiếp tại vùng ô C3:C7. Để tự động tìm điểm số cao nhất trong tổ tại ô C8 (sao cho khi sửa điểm trong vùng C3:C7 thì kết quả tự động cập nhật), công thức nào dưới đây là đúng?`,
          options: [
            'A. =MAX(C3:C7)',
            'B. =SUM(C3:C7)',
            'C. =MIN(C3:C7)',
            'D. =COUNT(C3:C7)',
          ],
          correctAnswer: 'A. =MAX(C3:C7)',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Hàm MAX trả về giá trị lớn nhất trong vùng dữ liệu số C3:C7.`,
        },
        {
          stem: `Trên trang tính điện tử (bài "${cleanLesson}"), giao của cột D và hàng 5 tạo thành một ô tính có địa chỉ được viết đúng chuẩn là gì?`,
          options: [
            'A. D5',
            'B. 5D',
            'C. D:5',
            'D. D-5',
          ],
          correctAnswer: 'A. D5',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Địa chỉ ô tính được xác định bởi tên cột (chữ cái) viết trước và tên hàng (chữ số) viết sau: D5.`,
        },
        {
          stem: `Khi nhập dữ liệu vào một ô tính trên phần mềm bảng tính mà chưa thiết lập căn lề thủ công, theo mặc định phần mềm sẽ tự động căn lề dữ liệu kiểu văn bản (chữ) và dữ liệu kiểu số như thế nào?`,
          options: [
            'A. Dữ liệu kiểu văn bản tự động căn thẳng lề trái; dữ liệu kiểu số tự động căn thẳng lề phải của ô tính.',
            'B. Dữ liệu kiểu văn bản tự động căn thẳng lề phải; dữ liệu kiểu số tự động căn thẳng lề trái của ô tính.',
            'C. Mọi kiểu dữ liệu khi nhập vào ô đều tự động căn giữa ô tính.',
            'D. Phần mềm không cho phép nhập cả chữ và số trên cùng một trang tính.',
          ],
          correctAnswer:
            'A. Dữ liệu kiểu văn bản tự động căn thẳng lề trái; dữ liệu kiểu số tự động căn thẳng lề phải của ô tính.',
          gradingGuide: `Đáp án gợi ý: Chọn A (${unitPoints}đ). Bám sát YCCĐ [${outcomeCode}] (${cleanOutcome}): Mặc định trong bảng tính, văn bản căn lề trái còn số, ngày tháng căn lề phải.`,
        },
      ];
      return sheetMcqVariants[variantIndex % sheetMcqVariants.length];
    }

    if (formatGroup === 'TRUE_FALSE') {
      const subStatements = [
        {
          label: 'a',
          statement:
            'Địa chỉ của một ô tính được xác định bởi tên cột ghép với tên hàng (ví dụ: B4, C10), và địa chỉ vùng dữ liệu hình chữ nhật được viết cách nhau bởi dấu hai chấm (ví dụ: B2:D6).',
          isTrue: true,
          explanation:
            'Đúng theo quy ước địa chỉ ô và địa chỉ vùng dữ liệu trên trang tính.',
        },
        {
          label: 'b',
          statement:
            'Khi nhập công thức tính toán vào ô tính, nếu bỏ qua dấu bằng (=) ở đầu (ví dụ chỉ gõ A1+B1) thì phần mềm vẫn tự động tính ra tổng hai ô.',
          isTrue: false,
          explanation:
            'Sai, nếu không có dấu "=" ở đầu, phần mềm bảng tính sẽ hiểu "A1+B1" là một chuỗi văn bản thông thường chứ không thực hiện tính toán.',
        },
        {
          label: 'c',
          statement:
            'Sử dụng địa chỉ ô trong công thức (như =B2*C2) có ưu điểm là khi giá trị trong ô B2 hoặc C2 thay đổi thì kết quả sẽ tự động được cập nhật lại chính xác.',
          isTrue: true,
          explanation:
            'Đúng, đây chính là tính năng tính toán tự động của phần mềm bảng tính.',
        },
        {
          label: 'd',
          statement:
            'Hàm =COUNT(A1:A5) dùng để tính tổng tất cả các giá trị số có trong vùng từ ô A1 đến ô A5.',
          isTrue: false,
          explanation:
            'Sai, hàm COUNT chỉ đếm số lượng các ô chứa dữ liệu kiểu số; hàm tính tổng là hàm SUM.',
        },
      ];
      return {
        stem: `Khi thực hành trên phần mềm bảng tính theo nội dung bài "${cleanLesson}" (${cleanOutcome}), hãy xét tính Đúng (Đ) hoặc Sai (S) của mỗi phát biểu dưới đây:`,
        subStatements,
        correctAnswer: 'a) Đúng | b) Sai | c) Đúng | d) Sai',
        gradingGuide: `Đáp án gợi ý [${outcomeCode}]: a) Đúng; b) Sai; c) Đúng; d) Sai (Tổng ${unitPoints}đ). Giải thích chi tiết từng ý bám sát YCCĐ bảng tính.`,
      };
    }

    if (formatGroup === 'SHORT_ANSWER') {
      const saVariants = [
        {
          stem: `Cho các ô B2, B3, B4 trên trang tính lần lượt chứa các số: 15, 25, 20. Em hãy viết công thức sử dụng hàm chuẩn (bắt đầu bằng dấu =) tại ô B5 để tính tổng các số trong vùng từ ô B2 đến ô B4.`,
          acceptedVariations: ['=SUM(B2:B4)', '=sum(b2:b4)', '=SUM(B2,B3,B4)'],
          correctAnswer: '=SUM(B2:B4)',
        },
        {
          stem: `Để tính trung bình cộng điểm kiểm tra của học sinh được lưu trong vùng ô từ C2 đến C10 trên trang tính, em nhập công thức hàm nào (bắt đầu bằng dấu =)?`,
          acceptedVariations: ['=AVERAGE(C2:C10)', '=average(c2:c10)'],
          correctAnswer: '=AVERAGE(C2:C10)',
        },
        {
          stem: `Tại ô D2 có công thức =B2*C2. Khi sao chép công thức từ ô D2 xuống ô D3 thì công thức tại ô D3 sẽ tự động điều chỉnh thành gì?`,
          acceptedVariations: ['=B3*C3', '=b3*c3'],
          correctAnswer: '=B3*C3',
        },
      ];
      const chosenSa = saVariants[variantIndex % saVariants.length];
      return {
        ...chosenSa,
        gradingGuide: `Đáp án gợi ý: "${chosenSa.correctAnswer}" đạt ${unitPoints}đ. Đánh giá trực tiếp kỹ năng sử dụng hàm và địa chỉ vùng theo YCCĐ [${outcomeCode}].`,
      };
    }

    return {
      stem: `Cho bảng dữ liệu "Quyên góp sách thư viện" trên trang tính gồm: Cột A là Tên tổ (từ A2 đến A5), Cột B là Số sách giáo khoa (từ B2 đến B5), Cột C là Số truyện thiếu nhi (từ C2 đến C5), Cột D là Tổng số sách của từng tổ (từ D2 đến D5).\nVận dụng kiến thức bài "${cleanLesson}" (${cleanOutcome}):\na) Hãy viết công thức sử dụng địa chỉ ô tại ô D2 để tính tổng số sách của Tổ 1 và nêu cách sao chép công thức đó xuống các ô D3, D4, D5.\nb) Viết các công thức sử dụng hàm tại ô D6 (tính tổng số sách của cả lớp), ô D7 (tính số sách trung bình mỗi tổ) và ô D8 (tìm số lượng sách nhiều nhất trong các tổ).`,
      rubricCriteria: [
        {
          id: `rub-${outcomeCode}-${variantIndex}-1`,
          criterion:
            'Viết đúng công thức tại ô D2: =B2+C2 (hoặc =SUM(B2:C2)) và nêu đúng thao tác sao chép công thức (dùng lệnh Copy/Paste hoặc kéo nút điền tự động Fill Handle từ D2 xuống D5).',
          points: p1,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-2`,
          criterion:
            'Viết đúng công thức dùng hàm tính tổng cả lớp tại ô D6: =SUM(D2:D5) và hàm tính trung bình mỗi tổ tại ô D7: =AVERAGE(D2:D5).',
          points: p2,
        },
        {
          id: `rub-${outcomeCode}-${variantIndex}-3`,
          criterion:
            'Viết đúng công thức tìm giá trị lớn nhất tại ô D8: =MAX(D2:D5) và giải thích ưu điểm tự động cập nhật kết quả khi dữ liệu nguồn thay đổi.',
          points: p3,
        },
      ],
      correctAnswer: `a) Tại ô D2 nhập công thức: =B2+C2 (hoặc =SUM(B2:C2)). Sau đó chọn ô D2, đưa con trỏ chuột vào góc dưới bên phải ô (nút điền) kéo thả xuống đến ô D5 để sao chép công thức tự động.\nb) Công thức tại các ô thống kê:\n- Ô D6 (Tổng số sách cả lớp): =SUM(D2:D5)\n- Ô D7 (Trung bình mỗi tổ): =AVERAGE(D2:D5)\n- Ô D8 (Số sách cao nhất): =MAX(D2:D5)`,
      gradingGuide: `Chấm theo 3 tiêu chí chi tiết bám sát YCCĐ [${outcomeCode}] (${p1}đ + ${p2}đ + ${p3}đ = ${unitPoints}đ).`,
    };
  }

  // ==========================================================================
  // BỘ TỔNG HỢP CHUYÊN SÂU ĐA BIẾN THỂ THEO TỪNG YÊU CẦU CẦN ĐẠT
  // Đảm bảo chỉ giữ nội dung chính của câu hỏi (bỏ hoàn toàn tên chủ đề/tên bài thừa)
  // và có tính phân hóa năng lực rõ rệt cùng giải thích chi tiết từng phương án.
  // ==========================================================================

  if (formatGroup === 'MCQ') {
    const secondaryClause = clauses[(variantIndex + 1) % clauses.length] || primaryClause;
    const secondaryPhrase = extractCoreOutcomePhrase(secondaryClause, shortLesson);

    if (levelColumn === 'BIET') {
      const bietBank = [
        {
          stem: `Nội dung chính nào sau đây phản ánh đúng kiến thức về ${corePhrase}?`,
          options: [
            `A. ${primaryClause.charAt(0).toUpperCase() + primaryClause.slice(1)}.`,
            `B. Chỉ dựa vào hình thức bên ngoài mà bỏ qua điều kiện xác định của ${corePhrase}.`,
            `C. Đồng nhất ${corePhrase} với các trường hợp ngoại lệ không cùng bản chất.`,
            `D. Thay đổi tùy ý quy tắc và đơn vị chuẩn khi xét ${corePhrase}.`,
          ],
          correctAnswer: `A. ${primaryClause.charAt(0).toUpperCase() + primaryClause.slice(1)}.`,
        },
        {
          stem: `Đặc điểm cơ bản nào sau đây là đúng khi xác định ${corePhrase}?`,
          options: [
            `A. Tuân thủ đúng khái niệm, đặc điểm đặc trưng và điều kiện của ${corePhrase}.`,
            `B. Không phụ thuộc vào dữ kiện đầu vào và điều kiện áp dụng.`,
            `C. Có thể hoán đổi ngẫu nhiên các bước quy ước mà kết quả không đổi.`,
            `D. Chỉ áp dụng cho một trường hợp cá biệt duy nhất ngoài thực tế.`,
          ],
          correctAnswer: `A. Tuân thủ đúng khái niệm, đặc điểm đặc trưng và điều kiện của ${corePhrase}.`,
        },
        {
          stem: `Phát biểu nào sau đây nêu đúng yêu cầu kỹ thuật của việc ${secondaryPhrase}?`,
          options: [
            `A. Sử dụng đúng thuật ngữ chuyên môn và quy tắc chuẩn để ${secondaryPhrase}.`,
            `B. Dùng lẫn lộn hai khái niệm có tên gọi gần giống nhau.`,
            `C. Bỏ qua bước kiểm tra điều kiện xác định ban đầu.`,
            `D. Chỉ ghi nhận kết quả cảm tính mà không đối chiếu dữ kiện.`,
          ],
          correctAnswer: `A. Sử dụng đúng thuật ngữ chuyên môn và quy tắc chuẩn để ${secondaryPhrase}.`,
        },
      ];
      const chosen = bietBank[variantIndex % bietBank.length];
      return {
        ...chosen,
        correctOptionIndices: [0],
        gradingGuide: `Đáp án đúng: Chọn A (${unitPoints} điểm). Giải thích: Phương án A nêu chính xác kiến thức trọng tâm (${cleanOutcome}). Các phương án B, C, D là các lỗi nhầm lẫn khái niệm hoặc bỏ qua điều kiện xác định.`,
      };
    }

    if (levelColumn === 'HIEU') {
      const hieuBank = [
        {
          stem: `Tại sao cần tuân thủ đúng nguyên tắc và điều kiện xác định khi ${corePhrase}?`,
          options: [
            `A. Để bảo đảm tính chính xác khoa học và tránh sai lệch kết quả khi ${corePhrase}.`,
            `B. Vì điều kiện xác định chỉ mang tính hình thức, không ảnh hưởng đến kết quả.`,
            `C. Vì mọi thông số đầu vào khác nhau đều cho cùng một kết quả duy nhất.`,
            `D. Để thay thế hoàn toàn việc phân tích dữ kiện bằng ước lượng cảm tính.`,
          ],
          correctAnswer: `A. Để bảo đảm tính chính xác khoa học và tránh sai lệch kết quả khi ${corePhrase}.`,
        },
        {
          stem: `Điểm khác biệt chính giữa việc thực hiện đúng quy tắc khi ${secondaryPhrase} với cách làm cảm tính là gì?`,
          options: [
            `A. Làm đúng quy tắc cho kết quả chính xác, có căn cứ; làm cảm tính dễ sai lệch khi dữ kiện thay đổi.`,
            `B. Làm cảm tính luôn chính xác tuyệt đối trong mọi bài toán phức tạp.`,
            `C. Hai cách làm có bản chất khoa học và độ tin cậy hoàn toàn giống nhau.`,
            `D. Quy tắc chuẩn chỉ dùng trong lý thuyết chứ không áp dụng được trong thực tế.`,
          ],
          correctAnswer: `A. Làm đúng quy tắc cho kết quả chính xác, có căn cứ; làm cảm tính dễ sai lệch khi dữ kiện thay đổi.`,
        },
        {
          stem: `Điều gì sẽ xảy ra nếu bỏ qua bước kiểm tra điều kiện cơ bản khi ${corePhrase}?`,
          options: [
            `A. Kết quả thu được dễ bị sai lệch bản chất hoặc không phù hợp với thực tiễn.`,
            `B. Các bước sau sẽ tự động triệt tiêu mọi sai số trước đó.`,
            `C. Kết quả cuối cùng vẫn luôn đúng trong mọi trường hợp.`,
            `D. Dữ liệu đầu vào sẽ tự động chuẩn hóa mà không cần xử lí.`,
          ],
          correctAnswer: `A. Kết quả thu được dễ bị sai lệch bản chất hoặc không phù hợp với thực tiễn.`,
        },
      ];
      const chosen = hieuBank[variantIndex % hieuBank.length];
      return {
        ...chosen,
        correctOptionIndices: [0],
        gradingGuide: `Đáp án đúng: Chọn A (${unitPoints} điểm). Giải thích: Phương án A làm rõ nguyên nhân và bản chất khoa học (${cleanOutcome}).`,
      };
    }

    // Mức VẬN DỤNG
    const vanDungBank = [
      {
        stem: `Khi giải quyết một tình huống thực tế đòi hỏi vận dụng ${corePhrase}, phương án xử lí nào sau đây là hiệu quả nhất?`,
        options: [
          `A. Phân tích dữ kiện thực tế, đối chiếu điều kiện áp dụng, thực hiện đúng quy trình ${corePhrase} và kiểm tra lại kết quả.`,
          `B. Sao chép nguyên mẫu kết quả của bài tập khác dù thông số đầu vào đã thay đổi.`,
          `C. Bỏ qua bước phân tích dữ kiện để lấy kết quả nhanh nhất.`,
          `D. Chọn ngẫu nhiên một công thức bất kì không phụ thuộc điều kiện bài toán.`,
        ],
        correctAnswer: `A. Phân tích dữ kiện thực tế, đối chiếu điều kiện áp dụng, thực hiện đúng quy trình ${corePhrase} và kiểm tra lại kết quả.`,
      },
      {
        stem: `Để hoàn thành nhiệm vụ thực hành vận dụng ${secondaryPhrase}, trình tự các bước nào sau đây là hợp lí nhất?`,
        options: [
          `A. Xác định dữ kiện đầu vào -> Chọn phương pháp phù hợp -> Thực hiện ${secondaryPhrase} -> Kiểm chứng kết quả.`,
          `B. Đưa ra kết luận trước -> Chọn dữ kiện khớp với dự đoán -> Bỏ qua kiểm nghiệm.`,
          `C. Thử ngẫu nhiên nhiều thao tác -> Ghi nhận kết quả đầu tiên xuất hiện.`,
          `D. Sửa đổi số liệu đề bài cho dễ tính rồi kết luận.`,
        ],
        correctAnswer: `A. Xác định dữ kiện đầu vào -> Chọn phương pháp phù hợp -> Thực hiện ${secondaryPhrase} -> Kiểm chứng kết quả.`,
      },
    ];
    const chosen = vanDungBank[variantIndex % vanDungBank.length];
    return {
      ...chosen,
      correctOptionIndices: [0],
      gradingGuide: `Đáp án đúng: Chọn A (${unitPoints} điểm). Giải thích: Phương án A vận dụng đúng quy trình khoa học để giải quyết vấn đề thực tiễn (${cleanOutcome}).`,
    };
  }

  if (formatGroup === 'TRUE_FALSE') {
    const clause1 = clauses[variantIndex % clauses.length] || cleanOutcome;
    const clause2 = clauses[(variantIndex + 1) % clauses.length] || `vận dụng ${corePhrase} vào thực tế`;
    const subStatements = [
      {
        label: 'a',
        statement: `${clause1.charAt(0).toUpperCase() + clause1.slice(1)}.`,
        isTrue: true,
        cognitiveLevel: 'BIẾT',
        explanation: `Đúng (Mức độ: BIẾT). Phản ánh chính xác kiến thức cơ bản theo Yêu cầu cần đạt [${outcomeCode}].`,
      },
      {
        label: 'b',
        statement: `Khi thực hiện ${corePhrase}, có thể bỏ qua điều kiện xác định mà kết quả vẫn luôn chính xác tuyệt đối.`,
        isTrue: false,
        cognitiveLevel: 'HIỂU',
        explanation: `Sai (Mức độ: HIỂU). Bỏ qua điều kiện xác định sẽ dẫn đến sai lệch bản chất kết quả.`,
      },
      {
        label: 'c',
        statement: `Nắm vững nguyên lí của ${corePhrase} giúp giải thích và phân biệt chính xác các trường hợp khi ${clause2.charAt(0).toLowerCase() + clause2.slice(1)}.`,
        isTrue: true,
        cognitiveLevel: 'HIỂU',
        explanation: `Đúng (Mức độ: HIỂU). Hiểu bản chất giúp phân biệt và lý giải đúng mối quan hệ nhân – quả.`,
      },
      {
        label: 'd',
        statement: `Khi vận dụng ${corePhrase} vào bài toán thực tế có thông số thay đổi, không cần kiểm tra lại tính hợp lí của kết quả.`,
        isTrue: false,
        cognitiveLevel: 'VẬN DỤNG',
        explanation: `Sai (Mức độ: VẬN DỤNG). Trong thực tiễn luôn phải đối chiếu và kiểm chứng lại kết quả với dữ kiện thực tế.`,
      },
    ];
    return {
      stem: `Khi tìm hiểu và vận dụng kiến thức về ${corePhrase}:`,
      subStatements,
      correctAnswer: 'a) Đúng | b) Sai | c) Đúng | d) Sai',
      gradingGuide: `Đáp án chuẩn [${outcomeCode}]: a) Đúng; b) Sai; c) Đúng; d) Sai (Tổng ${unitPoints} điểm). Các nhận định phân hóa rõ mức độ: a (BIẾT), b (HIỂU), c (HIỂU), d (VẬN DỤNG).`,
    };
  }

  if (formatGroup === 'SHORT_ANSWER') {
    const saBank = [
      {
        stem: `Yếu tố hoặc điều kiện tiên quyết cần xác định trước khi thực hiện ${corePhrase} là gì?`,
        acceptedVariations: ['Điều kiện xác định và dữ kiện đầu vào', 'Dữ kiện đầu vào', primaryClause],
        correctAnswer: 'Điều kiện xác định và dữ kiện đầu vào',
      },
      {
        stem: `Sau khi hoàn thành các bước tính toán hoặc xử lí khi ${corePhrase}, bước cuối cùng cần thực hiện để đảm bảo tính chính xác là gì?`,
        acceptedVariations: ['Kiểm tra và đối chiếu lại kết quả', 'Kiểm chứng kết quả', 'Đối chiếu điều kiện đề bài'],
        correctAnswer: 'Kiểm tra và đối chiếu lại kết quả',
      },
    ];
    const chosenSa = saBank[variantIndex % saBank.length];
    return {
      ...chosenSa,
      gradingGuide: `Đáp án chuẩn: "${chosenSa.correctAnswer}" (${unitPoints} điểm). Căn cứ đánh giá: YCCĐ [${outcomeCode}] — "${cleanOutcome}".`,
    };
  }

  // ESSAY (Tự luận) — ngắn gọn, sắc bén theo phong cách đề tham khảo
  const essayBank = [
    {
      stem: `Tại sao cần nắm vững nguyên tắc khi ${corePhrase}? Hãy phân tích quy trình thực hiện và nêu một ví dụ vận dụng trong thực tế.`,
      correctAnswer: `1. Nguyên tắc & Bản chất (${p1}đ): Làm rõ kiến thức cốt lõi (${cleanOutcome}) và lý do phải tuân thủ đúng điều kiện áp dụng.\n2. Quy trình thực hiện (${p2}đ): Trình bày mạch lạc các bước thực hiện chuẩn xác.\n3. Vận dụng thực tế (${p3}đ): Nêu ví dụ thực tiễn hợp lý và giải thích ý nghĩa kết quả.`,
    },
    {
      stem: `Hãy phân tích đặc điểm và quy trình thực hiện ${corePhrase}. Việc vận dụng đúng nội dung này mang lại hiệu quả thế nào trong học tập và đời sống?`,
      correctAnswer: `1. Phân tích đặc điểm & quy trình (${p1}đ): Trình bày chính xác bản chất và các bước thực hiện (${cleanOutcome}).\n2. Phân biệt và phòng tránh lỗi sai (${p2}đ): Chỉ rõ các sai sót thường gặp và cách kiểm soát.\n3. Tác động & hiệu quả thực tiễn (${p3}đ): Liên hệ ứng dụng thực tế giúp giải quyết công việc nhanh chóng, chính xác.`,
    },
  ];
  const chosenEssay = essayBank[variantIndex % essayBank.length];
  return {
    stem: chosenEssay.stem,
    rubricCriteria: [
      {
        id: `rub-${outcomeCode}-${variantIndex}-1`,
        criterion: `Trình bày chính xác bản chất và điều kiện áp dụng theo yêu cầu cần đạt: ${clauses[0] || cleanOutcome}.`,
        points: p1,
        note: 'Chấp nhận cách diễn đạt khác nhưng đúng thuật ngữ và bản chất khoa học.',
      },
      {
        id: `rub-${outcomeCode}-${variantIndex}-2`,
        criterion: `Phân tích rõ quy trình thực hiện và mối liên hệ nhân – quả khi ${corePhrase}.`,
        points: p2,
        note: 'Chấp nhận các phương án lập luận hoặc cách giải tương đương hợp lý.',
      },
      {
        id: `rub-${outcomeCode}-${variantIndex}-3`,
        criterion: `Nêu được ví dụ vận dụng thực tế phù hợp Lớp ${grade} và đánh giá đúng ý nghĩa/tác động thực tiễn.`,
        points: p3,
        note: 'Khuyến khích các ví dụ thực tiễn sáng tạo, gắn với đời sống.',
      },
    ],
    correctAnswer: chosenEssay.correctAnswer,
    gradingGuide: `Chấm theo biểu điểm 3 tiêu chí bám sát YCCĐ [${outcomeCode}] (${p1}đ + ${p2}đ + ${p3}đ = ${unitPoints} điểm).`,
  };
}

export function buildAISupplementDraftQuestionsForShortage(params: {
  matrix: ExamMatrix;
  shortageReport: ExamCellShortageReport;
  seed: string;
}): Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[] {
  const { matrix, shortageReport } = params;
  const countNeeded = shortageReport.shortageCount;
  if (countNeeded <= 0) return [];

  const cogCode = mapMatrixColumnToPrimaryOrSecondaryCode(
    matrix.levelId,
    shortageReport.levelColumn
  );

  let format: QuestionFormatCode = QuestionFormatCode.MCQ_SINGLE;
  if (shortageReport.formatGroup === 'TRUE_FALSE') {
    format = QuestionFormatCode.TRUE_FALSE_CLUSTER;
  } else if (shortageReport.formatGroup === 'SHORT_ANSWER') {
    format = QuestionFormatCode.SHORT_ANSWER;
  } else if (shortageReport.formatGroup === 'ESSAY') {
    format = QuestionFormatCode.ESSAY;
  }

  const unitPoints =
    shortageReport.requiredPointsPerQuestion > 0
      ? shortageReport.requiredPointsPerQuestion
      : shortageReport.formatGroup === 'MCQ'
      ? 0.25
      : shortageReport.formatGroup === 'SHORT_ANSWER'
      ? 0.5
      : 1.0;

  const cleanOutcome = cleanLearningOutcomeText(
    shortageReport.learningOutcomeText || shortageReport.knowledgeUnit
  );
  const cleanUnit = cleanLessonUnitName(
    shortageReport.knowledgeUnit || shortageReport.topicTitle
  );

  const drafts: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[] = [];
  const usedStemsInBatch = new Set<string>();

  for (let i = 0; i < countNeeded; i++) {
    let synth = synthesizeQuestionForLearningOutcome({
      subject: matrix.subject,
      grade: matrix.grade,
      topicTitle: shortageReport.topicTitle,
      lessonName: cleanUnit,
      outcomeCode: shortageReport.learningOutcomeCode,
      outcomeText: cleanOutcome,
      formatGroup: shortageReport.formatGroup,
      levelColumn: shortageReport.levelColumn,
      unitPoints,
      variantIndex: i,
    });

    // Đảm bảo nếu 1 ô YCCĐ cần nhiều hơn 1 câu cùng dạng & cùng mức độ thì nội dung đề bài tuyệt đối không trùng nhau
    if (usedStemsInBatch.has(synth.stem.toLowerCase().trim())) {
      const clauses = extractOutcomeClauses(cleanOutcome, cleanUnit);
      const specificClause = clauses[i % clauses.length] || cleanOutcome;
      synth = {
        ...synth,
        stem: `${synth.stem} (Trường hợp thực hành #${i + 1}: ${specificClause})`,
      };
    }
    usedStemsInBatch.add(synth.stem.toLowerCase().trim());

    drafts.push({
      levelId: matrix.levelId,
      grade: matrix.grade,
      subject: matrix.subject,
      topicTitle: shortageReport.topicTitle,
      lessonTitle: cleanUnit,
      knowledgeUnit: cleanUnit,
      learningOutcomeCode: shortageReport.learningOutcomeCode,
      learningOutcomeText: cleanOutcome,
      cognitiveLevel: cogCode,
      format,
      stem: synth.stem,
      options: synth.options,
      correctOptionIndices:
        synth.correctOptionIndices ??
        (shortageReport.formatGroup === 'MCQ' ? [0] : undefined),
      subStatements: synth.subStatements,
      trueFalseScoringRule:
        shortageReport.formatGroup === 'TRUE_FALSE'
          ? matrix.levelId === EducationLevelId.LOWER_SECONDARY
            ? 'PROGRESSIVE_CV7991'
            : 'EQUAL_PER_ITEM'
          : undefined,
      acceptedVariations: synth.acceptedVariations,
      rubricCriteria: synth.rubricCriteria,
      correctAnswer: synth.correctAnswer,
      gradingGuide: synth.gradingGuide,
      points: unitPoints,
      questionSource: `AI đề xuất Bản nháp bám sát YCCĐ [${shortageReport.learningOutcomeCode}]`,
      tags: [
        'AI bổ sung ma trận',
        shortageReport.learningOutcomeCode,
        cleanUnit,
        'Bản nháp',
      ],
      version: 1,
      status: ApprovalStatus.DRAFT,
      authorName: 'Trợ lý AI Khảo thí (Bản nháp)',
      isSampleData: false,
    });
  }

  return drafts;
}

// ============================================================================
// 4. RÚT CÂU HỎI TỪ NGÂN HÀNG THEO 4 CHẾ ĐỘ (A, B, C, D) & THEO TỪNG YCCĐ
// ============================================================================

export interface MatrixSelectionResult {
  cellQuestionMap: Record<string, string[]>; // cellKey -> questionIds[]
  orderedBaseQuestionIds: string[];
  cellTargetPointsMap: Record<string, number>; // questionId -> points allocated in matrix
  cellMetaByQuestionId: Record<
    string,
    {
      rowId: string;
      formatGroup: MatrixFormatGroupCode;
      levelColumn: MatrixLevelColumnCode;
      learningOutcomeCode: string;
      points: number;
    }
  >;
  shortageReports: ExamCellShortageReport[];
  totalRequiredQuestions: number;
  totalSelectedQuestions: number;
}

function doesQuestionPreferSubTarget(
  q: QuestionItem,
  subTarget: MatrixOutcomeSubTarget
): boolean {
  const qCode = (q.learningOutcomeCode || '').trim().toLowerCase();
  const tCode = (subTarget.learningOutcomeCode || '').trim().toLowerCase();
  if (qCode && tCode && qCode === tCode) return true;

  const qOutcomeText = cleanLearningOutcomeText(q.learningOutcomeText || '')
    .toLowerCase()
    .trim();
  const tOutcomeText = cleanLearningOutcomeText(
    subTarget.learningOutcomeText || ''
  )
    .toLowerCase()
    .trim();
  if (
    qOutcomeText.length > 8 &&
    tOutcomeText.length > 8 &&
    (qOutcomeText.includes(tOutcomeText) || tOutcomeText.includes(qOutcomeText))
  ) {
    return true;
  }

  const qUnit = cleanLessonUnitName(
    q.lessonTitle || q.knowledgeUnit || ''
  ).toLowerCase();
  const tUnit = cleanLessonUnitName(subTarget.knowledgeUnit || '').toLowerCase();
  if (qUnit.length > 3 && tUnit.length > 3 && (qUnit.includes(tUnit) || tUnit.includes(qUnit))) {
    return true;
  }
  return false;
}

export function selectQuestionsFromMatrix(params: {
  matrix: ExamMatrix;
  allQuestions: QuestionItem[];
  mode: ExamGenerationMode;
  seed: string;
  manualCellSelections?: Record<string, string[]>;
}): MatrixSelectionResult {
  const {
    matrix,
    allQuestions,
    mode,
    seed,
    manualCellSelections = {},
  } = params;

  const specRows = ensureMatrixHasSpecRows(matrix);
  const activeFormats = matrix.activeFormatGroups || [
    'MCQ',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'ESSAY',
  ];

  const cellQuestionMap: Record<string, string[]> = {};
  const cellTargetPointsMap: Record<string, number> = {};
  const cellMetaByQuestionId: Record<
    string,
    {
      rowId: string;
      formatGroup: MatrixFormatGroupCode;
      levelColumn: MatrixLevelColumnCode;
      learningOutcomeCode: string;
      points: number;
    }
  > = {};
  const shortageReports: ExamCellShortageReport[] = [];
  const usedQuestionIds = new Set<string>();
  const orderedBaseQuestionIds: string[] = [];

  let totalRequiredQuestions = 0;
  let totalSelectedQuestions = 0;

  // Duyệt theo thứ tự chuẩn của 4 nhóm dạng thức câu hỏi -> từng hàng -> từng mức độ -> từng YCCĐ
  for (const fgCode of activeFormats) {
    for (const row of specRows) {
      for (const lc of MATRIX_LEVEL_COLUMNS) {
        const cell = getCellFromRow(row, fgCode, lc.code);
        if (cell.questionCount <= 0) continue;

        const parentCellKey = `${row.id}__${fgCode}__${lc.code}`;
        const subTargets = getOutcomeAllocationsForRowCell(
          row,
          fgCode,
          lc.code
        );

        const rowCandidates = findMatchingQuestionsForCell({
          matrix,
          row,
          formatGroup: fgCode,
          levelColumn: lc.code,
          allQuestions,
          includeDraftSupplements: mode === 'AI_SUPPLEMENT_DRAFT',
        });

        const manualIdsForParentCell = (
          manualCellSelections[parentCellKey] || []
        ).filter((id) => allQuestions.some((q) => q.id === id));
        let manualCursor = 0;

        const chosenForParentCell: string[] = [];

        for (const subTarget of subTargets) {
          const reqCount = subTarget.questionCount;
          if (reqCount <= 0) continue;
          const unitPts = subTarget.unitPoints;

          totalRequiredQuestions += reqCount;

          const availableUnused = rowCandidates.filter(
            (q) => !usedQuestionIds.has(q.id)
          );

          // Ưu tiên các câu khớp trực tiếp với Bài học & Yêu cầu cần đạt của subTarget
          const exactMatches = availableUnused.filter((q) =>
            doesQuestionPreferSubTarget(q, subTarget)
          );
          const broaderMatches = availableUnused.filter(
            (q) => !doesQuestionPreferSubTarget(q, subTarget)
          );

          const manualForSub = (
            manualCellSelections[subTarget.subTargetKey] ||
            manualIdsForParentCell.slice(manualCursor, manualCursor + reqCount)
          ).filter((id) => !usedQuestionIds.has(id));
          manualCursor += reqCount;

          let chosenIds: string[] = [];

          if (mode === 'MANUAL_SELECT') {
            chosenIds = manualForSub.slice(0, reqCount);
          } else if (mode === 'HYBRID') {
            chosenIds = [...manualForSub.slice(0, reqCount)];
            const remaining = reqCount - chosenIds.length;
            if (remaining > 0) {
              const rng = createSeededRng(
                `${seed}__SUB_${subTarget.subTargetKey}`
              );
              const poolExact = exactMatches.filter(
                (q) => !chosenIds.includes(q.id)
              );
              const poolBroader = broaderMatches.filter(
                (q) => !chosenIds.includes(q.id)
              );
              const { shuffled: sExact } = seededShuffle(poolExact, rng);
              const { shuffled: sBroad } = seededShuffle(poolBroader, rng);
              chosenIds.push(
                ...[...sExact, ...sBroad].slice(0, remaining).map((q) => q.id)
              );
            }
          } else {
            // AUTO_RANDOM hoặc AI_SUPPLEMENT_DRAFT
            const rng = createSeededRng(
              `${seed}__SUB_${subTarget.subTargetKey}`
            );
            const exactApproved = exactMatches.filter(
              (q) => q.status === ApprovalStatus.APPROVED
            );
            const broaderApproved = broaderMatches.filter(
              (q) => q.status === ApprovalStatus.APPROVED
            );
            const exactDrafts = exactMatches.filter(
              (q) => q.status !== ApprovalStatus.APPROVED
            );
            const broaderDrafts = broaderMatches.filter(
              (q) => q.status !== ApprovalStatus.APPROVED
            );

            const { shuffled: sExactApp } = seededShuffle(exactApproved, rng);
            const { shuffled: sBroadApp } = seededShuffle(broaderApproved, rng);
            const { shuffled: sExactDraft } = seededShuffle(exactDrafts, rng);
            const { shuffled: sBroadDraft } = seededShuffle(broaderDrafts, rng);

            const combined = [
              ...sExactApp,
              ...sBroadApp,
              ...sExactDraft,
              ...sBroadDraft,
            ];
            chosenIds = combined.slice(0, reqCount).map((q) => q.id);
          }

          cellQuestionMap[subTarget.subTargetKey] = chosenIds;
          chosenForParentCell.push(...chosenIds);
          totalSelectedQuestions += chosenIds.length;

          chosenIds.forEach((qId) => {
            usedQuestionIds.add(qId);
            orderedBaseQuestionIds.push(qId);
            cellTargetPointsMap[qId] = unitPts;
            cellMetaByQuestionId[qId] = {
              rowId: row.id,
              formatGroup: fgCode,
              levelColumn: lc.code,
              learningOutcomeCode: subTarget.learningOutcomeCode,
              points: unitPts,
            };
          });

          const shortageCount = Math.max(0, reqCount - chosenIds.length);
          const approvedAvailableCount = exactMatches.filter(
            (q) => q.status === ApprovalStatus.APPROVED
          ).length;

          if (shortageCount > 0) {
            shortageReports.push({
              cellKey: subTarget.subTargetKey,
              rowId: row.id,
              chapterCode: row.chapterCode,
              topicTitle: row.topicTitle,
              knowledgeUnit: subTarget.knowledgeUnit,
              learningOutcomeCode: subTarget.learningOutcomeCode,
              learningOutcomeText: subTarget.learningOutcomeText,
              formatGroup: fgCode,
              levelColumn: lc.code,
              requiredCount: reqCount,
              requiredPointsPerQuestion: unitPts,
              availableApprovedCount: approvedAvailableCount,
              selectedCount: chosenIds.length,
              shortageCount,
            });
          }
        }

        cellQuestionMap[parentCellKey] = chosenForParentCell;
      }
    }
  }

  return {
    cellQuestionMap,
    orderedBaseQuestionIds,
    cellTargetPointsMap,
    cellMetaByQuestionId,
    shortageReports,
    totalRequiredQuestions,
    totalSelectedQuestions,
  };
}

// ============================================================================
// 5. ĐẢO PHƯƠNG ÁN TRẮC NGHIỆM AN TOÀN & TẠO NHIỀU MÃ ĐỀ TƯƠNG ĐƯƠNG (MỤC 3)
// - Không đảo tùy tiện câu hỏi phụ thuộc ngữ liệu chung (sharedPassage / groupId)
// - Không đảo phương án khi có đáp án phụ thuộc vị trí ("Cả A và B", "Tất cả...")
// - Cập nhật chính xác đáp án đúng theo từng mã đề
// ============================================================================

const OPTION_PREFIX_REGEX = /^[A-H]\s*[.:)]\s*/i;
const POSITION_DEPENDENT_OPTION_REGEX =
  /(cả\s+[a-d]\s+và\s+[a-d]|cả\s+hai|cả\s+ba|tất\s+cả\s+các|đều\s+đúng|đều\s+sai|a\s*,\s*b\s+đều)/i;

export function stripOptionLabelPrefix(opt: string): string {
  return opt.replace(OPTION_PREFIX_REGEX, '').trim();
}

export function canSafelyShuffleMcqOptions(options?: string[]): {
  safe: boolean;
  reason?: string;
} {
  if (!options || options.length < 2) {
    return { safe: false, reason: 'Không có phương án lựa chọn' };
  }
  for (const opt of options) {
    if (POSITION_DEPENDENT_OPTION_REGEX.test(opt)) {
      return {
        safe: false,
        reason:
          'Khóa đảo phương án vì có lựa chọn phụ thuộc vị trí (VD: "Cả A và B", "Tất cả đều đúng")',
      };
    }
  }
  return { safe: true };
}

export function detectOriginalCorrectOptionIndices(q: QuestionItem): number[] {
  if (q.correctOptionIndices && q.correctOptionIndices.length > 0) {
    return q.format === QuestionFormatCode.MCQ_SINGLE
      ? [q.correctOptionIndices[0]]
      : q.correctOptionIndices;
  }
  if (!q.options || q.options.length === 0) return [0];

  const rawAns = (q.correctAnswer || '').trim();
  const ansUpper = rawAns.toUpperCase();
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  // 1. Nếu đáp án bắt đầu bằng "A.", "B.", "C.", "D." hoặc "Chọn A", "Đáp án A" hoặc chỉ là 1 chữ cái "A"
  const prefixMatch = ansUpper.match(
    /^(?:CHỌN\s+|ĐÁP\s+ÁN\s+|PHƯƠNG\s+ÁN\s+)?([A-F])(?:\s*[.:)\-]|$)/i
  );
  if (prefixMatch && prefixMatch[1]) {
    const idx = letters.indexOf(prefixMatch[1].toUpperCase());
    if (idx !== -1 && idx < q.options.length) {
      return [idx];
    }
  }

  // 2. So khớp nội dung phương án nếu đáp án lưu nguyên văn nội dung phương án
  const strippedAns = stripOptionLabelPrefix(rawAns).toLowerCase();
  for (let i = 0; i < q.options.length; i++) {
    const strippedOpt = stripOptionLabelPrefix(q.options[i]).toLowerCase();
    if (strippedOpt && strippedOpt === strippedAns) {
      return [i];
    }
  }

  // 3. Nếu là câu hỏi chọn nhiều đáp án (MCQ_MULTIPLE), tách theo dấu phẩy/chấm phẩy
  if (q.format === QuestionFormatCode.MCQ_MULTIPLE) {
    const matched: number[] = [];
    for (let i = 0; i < q.options.length && i < letters.length; i++) {
      const letter = letters[i];
      const regex = new RegExp(`(^|[\\s,;:/])${letter}([\\s,.;:)]|$)`);
      if (ansUpper === letter || regex.test(ansUpper)) {
        matched.push(i);
      }
    }
    if (matched.length > 0) return matched;
  }

  return [0];
}

export function shuffleQuestionOptionsForVariant(
  q: QuestionItem,
  enableOptionShuffle: boolean,
  rng: () => number
): {
  shuffledOptions?: string[];
  optionPermutation?: number[];
  optionShuffleLockedReason?: string;
  shuffledCorrectAnswer: string;
  shortAnswerLetter: string;
} {
  const isMcq =
    q.format === QuestionFormatCode.MCQ_SINGLE ||
    q.format === QuestionFormatCode.MCQ_MULTIPLE;

  if (!isMcq || !q.options || q.options.length === 0) {
    return {
      shuffledCorrectAnswer: q.correctAnswer,
      shortAnswerLetter: q.correctAnswer,
    };
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const origCorrectIndices = detectOriginalCorrectOptionIndices(q);
  const safety = canSafelyShuffleMcqOptions(q.options);

  if (!enableOptionShuffle || !safety.safe) {
    const formattedOriginal = q.options.map(
      (opt, idx) => `${letters[idx] || String(idx + 1)}. ${stripOptionLabelPrefix(opt)}`
    );
    const ansLetters = origCorrectIndices
      .map((idx) => letters[idx] || 'A')
      .join(', ');
    const firstIdx = origCorrectIndices[0] ?? 0;
    const fullText =
      origCorrectIndices.length === 1
        ? formattedOriginal[firstIdx] || q.correctAnswer
        : ansLetters;

    return {
      shuffledOptions: formattedOriginal,
      optionPermutation: q.options.map((_, i) => i),
      optionShuffleLockedReason: !safety.safe ? safety.reason : undefined,
      shuffledCorrectAnswer: fullText,
      shortAnswerLetter: ansLetters,
    };
  }

  const { shuffled: rawShuffled, permutation } = seededShuffle(q.options, rng);
  const relabeledOptions = rawShuffled.map(
    (opt, newIdx) => `${letters[newIdx] || String(newIdx + 1)}. ${stripOptionLabelPrefix(opt)}`
  );

  // Tìm vị trí mới của các phương án đúng ban đầu
  const newCorrectIndices: number[] = [];
  origCorrectIndices.forEach((origIdx) => {
    const newPos = permutation.findIndex((p) => p === origIdx);
    if (newPos !== -1) {
      newCorrectIndices.push(newPos);
    }
  });
  newCorrectIndices.sort((a, b) => a - b);

  const newAnswerLetters = newCorrectIndices
    .map((idx) => letters[idx] || 'A')
    .join(', ');

  const fullShuffledCorrectAnswer =
    newCorrectIndices.length === 1
      ? relabeledOptions[newCorrectIndices[0]] || newAnswerLetters
      : `Chọn ${newAnswerLetters}`;

  return {
    shuffledOptions: relabeledOptions,
    optionPermutation: permutation,
    shuffledCorrectAnswer: fullShuffledCorrectAnswer,
    shortAnswerLetter: newAnswerLetters,
  };
}

export function buildDefaultVariantCodes(count: number): string[] {
  const safeCount = Math.max(1, Math.min(24, Math.round(count || 1)));
  return Array.from({ length: safeCount }, (_, idx) =>
    String(101 + idx)
  );
}

/**
 * Tạo danh sách các mã đề tương đương từ danh sách câu hỏi gốc và Seed.
 * Bảo toàn cụm câu hỏi chung ngữ liệu (sharedPassage) không bị xé lẻ!
 */
export function generateExamVariants(params: {
  matrix: ExamMatrix;
  baseQuestionIds: string[];
  questions: QuestionItem[];
  cellMetaByQuestionId: Record<
    string,
    {
      rowId: string;
      formatGroup: MatrixFormatGroupCode;
      levelColumn: MatrixLevelColumnCode;
      learningOutcomeCode: string;
      points: number;
    }
  >;
  seed: string;
  variantCount: number;
  shuffleQuestions: boolean;
  shuffleMcqOptions: boolean;
}): ExamVariantPaper[] {
  const {
    matrix,
    baseQuestionIds,
    questions,
    cellMetaByQuestionId,
    seed,
    variantCount,
    shuffleQuestions,
    shuffleMcqOptions,
  } = params;

  const questionMap = new Map<string, QuestionItem>();
  questions.forEach((q) => questionMap.set(q.id, q));

  const baseQuestions = baseQuestionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is QuestionItem => Boolean(q));

  const specRows = ensureMatrixHasSpecRows(matrix);
  const variantCodes = buildDefaultVariantCodes(variantCount);

  const sectionOrder: MatrixFormatGroupCode[] = [
    'MCQ',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'ESSAY',
  ];

  return variantCodes.map((variantCode, vIdx) => {
    const variantSeed = `${seed}__VARIANT_${variantCode}`;
    const rng = createSeededRng(variantSeed);

    const variantItems: ExamVariantQuestionItem[] = [];
    const mcqQuickAnswerTable: ExamVariantPaper['mcqQuickAnswerTable'] = [];
    let globalDisplayNumber = 1;
    let totalPoints = 0;

    for (const fgCode of sectionOrder) {
      const sectionQuestions = baseQuestions.filter((q) => {
        const meta = cellMetaByQuestionId[q.id];
        const fg = meta ? meta.formatGroup : mapQuestionFormatToMatrixGroup(q.format);
        return fg === fgCode;
      });

      if (sectionQuestions.length === 0) continue;

      // Gom cụm các câu hỏi có chung ngữ liệu đọc hiểu (sharedPassage) để KHÔNG đảo rời rạc
      const clusters: { key: string; items: QuestionItem[] }[] = [];
      const passageClusterMap = new Map<string, QuestionItem[]>();

      sectionQuestions.forEach((q) => {
        const passageKey = q.sharedPassage
          ? `PASSAGE__${q.sharedPassage.slice(0, 80).trim()}`
          : '';
        if (passageKey) {
          const existing = passageClusterMap.get(passageKey);
          if (existing) {
            existing.push(q);
          } else {
            const arr = [q];
            passageClusterMap.set(passageKey, arr);
            clusters.push({ key: passageKey, items: arr });
          }
        } else {
          clusters.push({ key: `SINGLE__${q.id}`, items: [q] });
        }
      });

      // Mã đề đầu tiên (101) nếu không bật đảo câu sẽ giữ nguyên thứ tự gốc; các mã đề hoặc khi bật shuffleQuestions sẽ đảo thứ tự các cụm
      const shouldShuffleSection = shuffleQuestions && (variantCount > 1 || vIdx >= 0);
      const orderedClusters = shouldShuffleSection
        ? seededShuffle(clusters, rng).shuffled
        : clusters;

      let sectionOrderInPart = 1;

      for (const cluster of orderedClusters) {
        for (const q of cluster.items) {
          const meta = cellMetaByQuestionId[q.id];
          const matchedRow =
            specRows.find((r) => r.id === meta?.rowId) ||
            specRows.find((r) => doesQuestionMatchMatrixRowScope(q, r)) ||
            specRows[0];

          const pts = meta?.points ?? q.points;
          const levelCol =
            meta?.levelColumn ?? mapQuestionCognitiveToMatrixColumn(q.cognitiveLevel);

          const optionResult = shuffleQuestionOptionsForVariant(
            q,
            shuffleMcqOptions,
            rng
          );

          const sharedPassageGroupKey = q.sharedPassage
            ? `PASSAGE_${hashSeedString(q.sharedPassage)}`
            : undefined;

          const item: ExamVariantQuestionItem = {
            questionId: q.id,
            originalCode: q.code,
            displayNumber: globalDisplayNumber,
            sectionOrderInPart,
            formatGroup: fgCode,
            levelColumn: levelCol,
            rowId: matchedRow?.id || 'unmapped-row',
            learningOutcomeCode:
              meta?.learningOutcomeCode || q.learningOutcomeCode,
            points: pts,
            stem: q.stem,
            sharedPassage: q.sharedPassage,
            sharedPassageAuthor: q.sharedPassageAuthor,
            sharedPassageGroupKey,
            shuffledOptions: optionResult.shuffledOptions,
            optionPermutation: optionResult.optionPermutation,
            optionShuffleLockedReason: optionResult.optionShuffleLockedReason,
            shuffledCorrectAnswer: optionResult.shuffledCorrectAnswer,
            gradingGuide: q.gradingGuide,
            rubricCriteria: q.rubricCriteria,
            acceptedVariations: q.acceptedVariations,
            subStatements: q.subStatements,
            isDraftSupplement: q.status === ApprovalStatus.DRAFT,
          };

          variantItems.push(item);

          // Đưa vào bảng đáp án nhanh cho Trắc nghiệm, Đúng-Sai, Trả lời ngắn
          if (fgCode !== 'ESSAY') {
            const quickAns =
              fgCode === 'MCQ'
                ? optionResult.shortAnswerLetter
                : fgCode === 'TRUE_FALSE' && q.subStatements
                ? q.subStatements
                    .map((s) => `${s.label}:${s.isTrue ? 'Đ' : 'S'}`)
                    .join(' | ')
                : q.correctAnswer;

            mcqQuickAnswerTable.push({
              questionNumber: globalDisplayNumber,
              sectionNumber: sectionOrderInPart,
              formatGroup: fgCode,
              answer: quickAns,
              points: pts,
              originalQuestionCode: q.code,
            });
          }

          globalDisplayNumber += 1;
          sectionOrderInPart += 1;
          totalPoints = exactAdd(totalPoints, pts);
        }
      }
    }

    return {
      variantCode,
      variantSeed,
      items: variantItems,
      totalQuestions: variantItems.length,
      totalPoints,
      mcqQuickAnswerTable,
    };
  });
}

// ============================================================================
// 6. KIỂM TRA CHẤT LƯỢNG ĐỀ KIỂM TRA TỰ ĐỘNG 9 TIÊU CHÍ (MỤC 4 & MỤC 5)
// ============================================================================

export function evaluateExamQuality(params: {
  matrix: ExamMatrix;
  variants: ExamVariantPaper[];
  allQuestions: QuestionItem[];
}): ExamQualityCheckReport {
  const { matrix, variants, allQuestions } = params;
  const specRows = ensureMatrixHasSpecRows(matrix);
  const primaryVariant = variants[0];
  const items = primaryVariant ? primaryVariant.items : [];
  const questionMap = new Map<string, QuestionItem>();
  allQuestions.forEach((q) => questionMap.set(q.id, q));

  const blockingErrors: string[] = [];
  const warnings: string[] = [];

  // 1. Kiểm tra Số câu và Tổng điểm
  const targetQuestions = matrix.totalQuestions;
  const targetPoints = matrix.targetTotalPoints || matrix.totalPoints || 10;
  const actualQuestions = items.length;
  const actualPoints = primaryVariant ? primaryVariant.totalPoints : 0;
  const pointsDiff = exactSub(actualPoints, targetPoints);

  const scoreAndCountDetails: string[] = [];
  if (actualQuestions !== targetQuestions) {
    scoreAndCountDetails.push(
      `Số câu trong đề (${actualQuestions} câu) không khớp với Ma trận (${targetQuestions} câu).`
    );
  }
  if (Math.abs(pointsDiff) > 0.001) {
    scoreAndCountDetails.push(
      `Tổng điểm của đề (${actualPoints.toFixed(2)} điểm) lệch so với Ma trận (${targetPoints.toFixed(2)} điểm).`
    );
  }
  const scoreAndCountPassed = scoreAndCountDetails.length === 0;
  if (!scoreAndCountPassed) {
    blockingErrors.push(...scoreAndCountDetails);
  }

  // 2. Kiểm tra Phân bố theo Ma trận (Chủ đề x Dạng câu hỏi x Mức độ)
  const matrixDistDetails: string[] = [];
  const activeFormats = matrix.activeFormatGroups || [
    'MCQ',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'ESSAY',
  ];

  for (const row of specRows) {
    for (const fgCode of activeFormats) {
      for (const lc of MATRIX_LEVEL_COLUMNS) {
        const expectedCell = getCellFromRow(row, fgCode, lc.code);
        // Đếm số câu thực tế trong đề khớp đúng bản chất với ô (kiểm tra cả khi giáo viên đổi câu làm lệch ma trận)
        const matchingInExam = items.filter((it) => {
          const qObj = questionMap.get(it.questionId);
          if (!qObj) return false;
          const actualFg = mapQuestionFormatToMatrixGroup(qObj.format);
          const actualLc = mapQuestionCognitiveToMatrixColumn(qObj.cognitiveLevel);
          const hasValidAssignedRow = specRows.some((r) => r.id === it.rowId);
          const belongsToRow = hasValidAssignedRow ? it.rowId === row.id : true;
          const inRowScope =
            belongsToRow && doesQuestionMatchMatrixRowScope(qObj, row);
          return actualFg === fgCode && actualLc === lc.code && inRowScope;
        });

        if (matchingInExam.length !== expectedCell.questionCount) {
          const fgLabel =
            MATRIX_FORMAT_GROUPS.find((g) => g.code === fgCode)?.shortLabel ||
            fgCode;
          const lcLabel =
            MATRIX_LEVEL_COLUMNS.find((l) => l.code === lc.code)?.label ||
            lc.code;
          matrixDistDetails.push(
            `Ô [${row.chapterCode} – ${row.topicTitle} | ${fgLabel} – ${lcLabel}]: Ma trận yêu cầu ${expectedCell.questionCount} câu nhưng đề hiện có ${matchingInExam.length} câu hợp lệ.`
          );
        }
      }
    }
  }
  const matrixDistributionPassed = matrixDistDetails.length === 0;
  if (!matrixDistributionPassed) {
    blockingErrors.push(...matrixDistDetails);
  }

  // 3. Kiểm tra Phân bố theo Yêu cầu cần đạt (YCCĐ)
  const outcomeDetails: string[] = [];
  for (const row of specRows) {
    const requiredForRow = row.cells.reduce(
      (sum, c) => sum + (c.questionCount || 0),
      0
    );
    if (requiredForRow <= 0) continue;
    const actualForOutcome = items.filter((it) => {
      const qObj = questionMap.get(it.questionId);
      if (!qObj) return false;
      const hasValidAssignedRow = specRows.some((r) => r.id === it.rowId);
      const belongsToRow = hasValidAssignedRow ? it.rowId === row.id : true;
      return belongsToRow && doesQuestionMatchMatrixRowScope(qObj, row);
    }).length;

    if (actualForOutcome < requiredForRow) {
      outcomeDetails.push(
        `YCCĐ [${row.learningOutcomeCode}] (${row.knowledgeUnit}): Cần ${requiredForRow} câu nhưng đề hiện đáp ứng ${actualForOutcome} câu.`
      );
    }
  }
  const outcomePassed = outcomeDetails.length === 0;
  if (!outcomePassed) {
    warnings.push(...outcomeDetails);
  }

  // 4. Kiểm tra Câu trùng lặp trong đề
  const duplicateDetails: string[] = [];
  const seenIds = new Set<string>();
  const seenStems = new Map<string, string>();
  items.forEach((it) => {
    if (seenIds.has(it.questionId)) {
      duplicateDetails.push(
        `Câu hỏi mã ${it.originalCode} bị đưa vào đề nhiều hơn 1 lần.`
      );
    }
    seenIds.add(it.questionId);

    const normStem = it.stem.toLowerCase().trim();
    if (seenStems.has(normStem) && seenStems.get(normStem) !== it.originalCode) {
      duplicateDetails.push(
        `Câu ${it.displayNumber} (${it.originalCode}) trùng nội dung đề bài với câu ${seenStems.get(normStem)}.`
      );
    }
    seenStems.set(normStem, it.originalCode);
  });
  const duplicatePassed = duplicateDetails.length === 0;
  if (!duplicatePassed) {
    blockingErrors.push(...duplicateDetails);
  }

  // 5. Kiểm tra Đáp án thiếu hoặc Hướng dẫn chấm thiếu
  const missingAnsDetails: string[] = [];
  items.forEach((it) => {
    if (!it.shuffledCorrectAnswer || !it.shuffledCorrectAnswer.trim()) {
      missingAnsDetails.push(
        `Câu ${it.displayNumber} (${it.originalCode}): Chưa có đáp án đúng.`
      );
    }
    if (!it.gradingGuide || !it.gradingGuide.trim()) {
      missingAnsDetails.push(
        `Câu ${it.displayNumber} (${it.originalCode}): Thiếu hướng dẫn chấm chi tiết.`
      );
    }
  });
  const missingAnswerPassed = missingAnsDetails.length === 0;
  if (!missingAnswerPassed) {
    blockingErrors.push(...missingAnsDetails);
  }

  // 6. Kiểm tra Phương án trắc nghiệm lỗi
  const mcqErrorDetails: string[] = [];
  items.forEach((it) => {
    const qObj = questionMap.get(it.questionId);
    if (
      qObj &&
      (qObj.format === QuestionFormatCode.MCQ_SINGLE ||
        qObj.format === QuestionFormatCode.MCQ_MULTIPLE)
    ) {
      const opts = it.shuffledOptions || qObj.options || [];
      if (opts.length < 3) {
        mcqErrorDetails.push(
          `Câu ${it.displayNumber} (${it.originalCode}): Câu trắc nghiệm có ít hơn 3 phương án lựa chọn.`
        );
      }
      const stripped = opts.map((o) => stripOptionLabelPrefix(o).toLowerCase());
      const uniqueOpts = new Set(stripped);
      if (uniqueOpts.size !== stripped.length) {
        mcqErrorDetails.push(
          `Câu ${it.displayNumber} (${it.originalCode}): Có các phương án lựa chọn trùng nội dung nhau.`
        );
      }
    }
  });
  const mcqOptionPassed = mcqErrorDetails.length === 0;
  if (!mcqOptionPassed) {
    blockingErrors.push(...mcqErrorDetails);
  }

  // 7. Kiểm tra Hình ảnh hoặc Công thức toán học thiếu/lỗi
  const mediaFormulaDetails: string[] = [];
  items.forEach((it) => {
    const qObj = questionMap.get(it.questionId);
    const dollarCount = (it.stem.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      mediaFormulaDetails.push(
        `Câu ${it.displayNumber} (${it.originalCode}): Công thức LaTeX thiếu dấu đóng '$'.`
      );
    }
    if (
      qObj?.format === QuestionFormatCode.MEDIA_FORMULA &&
      (!qObj.attachments || qObj.attachments.length === 0) &&
      dollarCount === 0
    ) {
      mediaFormulaDetails.push(
        `Câu ${it.displayNumber} (${it.originalCode}): Thuộc dạng câu hỏi có hình ảnh/công thức nhưng chưa đính kèm học liệu hoặc công thức.`
      );
    }
  });
  const mediaFormulaPassed = mediaFormulaDetails.length === 0;
  if (!mediaFormulaPassed) {
    warnings.push(...mediaFormulaDetails);
  }

  // 8. Kiểm tra Độ dài đề so với Thời gian làm bài quy định
  let estimatedMinutes = 0;
  items.forEach((it) => {
    if (it.formatGroup === 'MCQ') estimatedMinutes += 1.5;
    else if (it.formatGroup === 'TRUE_FALSE') estimatedMinutes += 4.0;
    else if (it.formatGroup === 'SHORT_ANSWER') estimatedMinutes += 2.5;
    else estimatedMinutes += 8.0;
    if (it.sharedPassage) estimatedMinutes += 2.0;
  });
  estimatedMinutes = Math.round(estimatedMinutes);

  const lengthDetails: string[] = [];
  const maxAllowedMinutes = Math.round(matrix.durationMinutes * 1.15);
  const minRecommendedMinutes = Math.round(matrix.durationMinutes * 0.35);
  if (estimatedMinutes > maxAllowedMinutes) {
    lengthDetails.push(
      `Thời lượng giải ước tính (~${estimatedMinutes} phút) vượt quá thời gian quy định của đề (${matrix.durationMinutes} phút).`
    );
  } else if (items.length > 0 && estimatedMinutes < minRecommendedMinutes) {
    lengthDetails.push(
      `Thời lượng giải ước tính (~${estimatedMinutes} phút) khá ngắn so với thời gian quy định (${matrix.durationMinutes} phút).`
    );
  }
  const examLengthPassed = lengthDetails.length === 0;
  if (!examLengthPassed) {
    warnings.push(...lengthDetails);
  }

  // 9. Kiểm tra Tương đương giữa các mã đề
  const equivDetails: string[] = [];
  if (variants.length > 1 && primaryVariant) {
    const baseIdSet = new Set(primaryVariant.items.map((i) => i.questionId));
    for (let i = 1; i < variants.length; i++) {
      const v = variants[i];
      if (v.totalQuestions !== primaryVariant.totalQuestions) {
        equivDetails.push(
          `Mã đề ${v.variantCode} có số câu (${v.totalQuestions}) khác Mã đề ${primaryVariant.variantCode} (${primaryVariant.totalQuestions}).`
        );
      }
      if (Math.abs(exactSub(v.totalPoints, primaryVariant.totalPoints)) > 0.001) {
        equivDetails.push(
          `Mã đề ${v.variantCode} có tổng điểm (${v.totalPoints}) khác Mã đề ${primaryVariant.variantCode} (${primaryVariant.totalPoints}).`
        );
      }
      const vSet = new Set(v.items.map((it) => it.questionId));
      if (vSet.size !== baseIdSet.size) {
        equivDetails.push(
          `Mã đề ${v.variantCode} không có cùng tập hợp câu hỏi gốc với Mã đề ${primaryVariant.variantCode}.`
        );
      }
    }
  }
  const variantEquivalencePassed = equivDetails.length === 0;
  if (!variantEquivalencePassed) {
    blockingErrors.push(...equivDetails);
  }

  return {
    checkedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    passedAll:
      scoreAndCountPassed &&
      matrixDistributionPassed &&
      duplicatePassed &&
      missingAnswerPassed &&
      mcqOptionPassed &&
      variantEquivalencePassed,
    hasMatrixDeviation: !matrixDistributionPassed || !scoreAndCountPassed,
    estimatedReadingAndSolvingMinutes: estimatedMinutes,
    criteria: {
      scoreAndCount: {
        code: 'SCORE_AND_COUNT',
        title: '1. Số câu và tổng điểm',
        passed: scoreAndCountPassed,
        severity: scoreAndCountPassed ? 'OK' : 'ERROR',
        summary: scoreAndCountPassed
          ? `Khớp chuẩn: ${actualQuestions}/${targetQuestions} câu · ${actualPoints.toFixed(2)}/${targetPoints.toFixed(2)} điểm`
          : scoreAndCountDetails[0],
        details: scoreAndCountDetails,
      },
      matrixDistribution: {
        code: 'MATRIX_DISTRIBUTION',
        title: '2. Phân bố theo ma trận',
        passed: matrixDistributionPassed,
        severity: matrixDistributionPassed ? 'OK' : 'ERROR',
        summary: matrixDistributionPassed
          ? 'Đúng 100% cơ cấu Chủ đề × Dạng câu hỏi × Mức độ nhận thức'
          : `Phát hiện ${matrixDistDetails.length} ô lệch cấu trúc ma trận`,
        details: matrixDistDetails,
      },
      outcomeDistribution: {
        code: 'OUTCOME_DISTRIBUTION',
        title: '3. Phân bố theo yêu cầu cần đạt',
        passed: outcomePassed,
        severity: outcomePassed ? 'OK' : 'WARNING',
        summary: outcomePassed
          ? `Bao phủ đầy đủ ${specRows.length} mạch Yêu cầu cần đạt trong Bản đặc tả`
          : outcomeDetails[0],
        details: outcomeDetails,
      },
      duplicateCheck: {
        code: 'DUPLICATE_CHECK',
        title: '4. Kiểm tra câu trùng',
        passed: duplicatePassed,
        severity: duplicatePassed ? 'OK' : 'ERROR',
        summary: duplicatePassed
          ? 'Không có câu hỏi trùng lặp trong đề'
          : duplicateDetails[0],
        details: duplicateDetails,
      },
      missingAnswerCheck: {
        code: 'MISSING_ANSWER',
        title: '5. Kiểm tra đáp án & hướng dẫn chấm',
        passed: missingAnswerPassed,
        severity: missingAnswerPassed ? 'OK' : 'ERROR',
        summary: missingAnswerPassed
          ? '100% câu hỏi có đầy đủ đáp án và hướng dẫn chấm'
          : missingAnsDetails[0],
        details: missingAnsDetails,
      },
      mcqOptionCheck: {
        code: 'MCQ_OPTION_ERROR',
        title: '6. Phương án trắc nghiệm',
        passed: mcqOptionPassed,
        severity: mcqOptionPassed ? 'OK' : 'ERROR',
        summary: mcqOptionPassed
          ? 'Các phương án A, B, C, D rõ ràng, không trùng lặp'
          : mcqErrorDetails[0],
        details: mcqErrorDetails,
      },
      mediaFormulaCheck: {
        code: 'MEDIA_FORMULA',
        title: '7. Hình ảnh & công thức toán học',
        passed: mediaFormulaPassed,
        severity: mediaFormulaPassed ? 'OK' : 'WARNING',
        summary: mediaFormulaPassed
          ? 'Cú pháp công thức LaTeX và học liệu hợp lệ'
          : mediaFormulaDetails[0],
        details: mediaFormulaDetails,
      },
      examLengthCheck: {
        code: 'EXAM_LENGTH',
        title: '8. Độ dài đề & thời lượng làm bài',
        passed: examLengthPassed,
        severity: examLengthPassed ? 'OK' : 'WARNING',
        summary: `Ước tính ~${estimatedMinutes} phút / Quy định ${matrix.durationMinutes} phút`,
        details: lengthDetails,
      },
      variantEquivalenceCheck: {
        code: 'VARIANT_EQUIVALENCE',
        title: '9. Tương đương giữa các mã đề',
        passed: variantEquivalencePassed,
        severity: variantEquivalencePassed ? 'OK' : 'ERROR',
        summary: variantEquivalencePassed
          ? `${variants.length} mã đề tương đương tuyệt đối về cấu trúc, mức độ và điểm số`
          : equivDetails[0],
        details: equivDetails,
      },
    },
    blockingErrors,
    warnings,
  };
}

// ============================================================================
// 7. KIỂM CHỨNG TÁI LẬP ĐỀ CHÍNH XÁC 100% TỪ SEED (MỤC 3 & MỤC 8)
// ============================================================================

export function verifySeedReproducibility(params: {
  matrix: ExamMatrix;
  baseQuestionIds: string[];
  questions: QuestionItem[];
  cellMetaByQuestionId: Record<
    string,
    {
      rowId: string;
      formatGroup: MatrixFormatGroupCode;
      levelColumn: MatrixLevelColumnCode;
      learningOutcomeCode: string;
      points: number;
    }
  >;
  seed: string;
  variantCount: number;
  shuffleQuestions: boolean;
  shuffleMcqOptions: boolean;
  currentVariants: ExamVariantPaper[];
}): {
  reproducible: boolean;
  checkedVariantsCount: number;
  summaryMessage: string;
} {
  const regenerated = generateExamVariants({
    matrix: params.matrix,
    baseQuestionIds: params.baseQuestionIds,
    questions: params.questions,
    cellMetaByQuestionId: params.cellMetaByQuestionId,
    seed: params.seed,
    variantCount: params.variantCount,
    shuffleQuestions: params.shuffleQuestions,
    shuffleMcqOptions: params.shuffleMcqOptions,
  });

  if (regenerated.length !== params.currentVariants.length) {
    return {
      reproducible: false,
      checkedVariantsCount: regenerated.length,
      summaryMessage: 'Số lượng mã đề tái lập khác với số mã đề hiện tại.',
    };
  }

  for (let vIdx = 0; vIdx < regenerated.length; vIdx++) {
    const vNew = regenerated[vIdx];
    const vCur = params.currentVariants[vIdx];
    if (vNew.variantCode !== vCur.variantCode) {
      return {
        reproducible: false,
        checkedVariantsCount: vIdx,
        summaryMessage: `Lệch mã đề tại vị trí ${vIdx + 1}.`,
      };
    }
    if (vNew.items.length !== vCur.items.length) {
      return {
        reproducible: false,
        checkedVariantsCount: vIdx,
        summaryMessage: `Mã đề ${vNew.variantCode} có số câu không khớp khi tái lập.`,
      };
    }

    for (let qIdx = 0; qIdx < vNew.items.length; qIdx++) {
      const itemA = vNew.items[qIdx];
      const itemB = vCur.items[qIdx];
      if (
        itemA.questionId !== itemB.questionId ||
        itemA.shuffledCorrectAnswer !== itemB.shuffledCorrectAnswer
      ) {
        return {
          reproducible: false,
          checkedVariantsCount: vIdx + 1,
          summaryMessage: `Mã đề ${vNew.variantCode} câu số ${qIdx + 1} bị thay đổi thủ công sau khi sinh từ seed (${itemA.originalCode} vs ${itemB.originalCode}). Nhấn "Tái lập từ Seed" để khôi phục đúng trạng thái gốc.`,
        };
      }
    }
  }

  return {
    reproducible: true,
    checkedVariantsCount: regenerated.length,
    summaryMessage: `Đã đối chiếu khớp 100% trên toàn bộ ${regenerated.length} mã đề (${regenerated
      .map((v) => v.variantCode)
      .join(', ')}) với Seed "${params.seed}": Thứ tự câu hỏi, hoán vị phương án A/B/C/D và bảng đáp án trùng khớp tuyệt đối.`,
  };
}
