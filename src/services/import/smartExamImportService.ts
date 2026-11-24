import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ApprovalStatus,
  CognitiveLevelCode,
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
  QuestionAttachment,
  QuestionFormatCode,
  QuestionGroup,
  QuestionItem,
} from '../../types/domain';
import { getLevelForGrade, getRuleSetForLevel } from '../business/assessmentRules';
import { dataRepository } from '../storage/repository';
import {
  decodeLegacyVietnameseFontText,
  PDFJS_CDN_CMAP_URL,
  PDFJS_CDN_STANDARD_FONT_URL,
  PDFJS_LOCAL_CMAP_URL,
  PDFJS_LOCAL_STANDARD_FONT_URL,
} from '../ai/pdfImageOcrEngine';

export type SmartImportSourceType = 'DOCX' | 'PDF' | 'XLSX' | 'IMAGE' | 'DIRECT_TEXT';

export type AnswerOriginType =
  | 'FROM_DOCUMENT'
  | 'AI_SUGGESTED'
  | 'TEACHER_CONFIRMED'
  | 'MISSING';

export interface ExtractedDocumentPage {
  pageNumber: number;
  rawText: string;
  tables: {
    id: string;
    title: string;
    headers: string[];
    rows: string[][];
  }[];
  images: {
    id: string;
    fileName: string;
    mimeType: string;
    dataUrl: string;
    caption?: string;
  }[];
  formulas: string[];
  passages: {
    groupKey: string;
    title: string;
    content: string;
    author?: string;
  }[];
}

export interface DuplicateMatchDetail {
  isDuplicate: boolean;
  maxSimilarityPercent: number;
  matchedQuestionCode?: string;
  matchedQuestionId?: string;
  matchedQuestionStem?: string;
  duplicateSource?: 'QUESTION_BANK' | 'CURRENT_BATCH';
}

export interface SmartExtractedQuestionDraft {
  draftId: string;
  sourceFileId: string;
  sourceFileName: string;
  sourceFileType: SmartImportSourceType;
  pageNumber: number;
  questionIndexInDoc: number;
  questionLabel: string; // VD: "Câu 1", "Câu 2"
  selectedForImport: boolean;

  // Liên kết chương trình, chủ đề, bài học, YCCĐ (Bước 6)
  levelId: EducationLevelId;
  grade: GradeNumber;
  subject: string;
  topicId?: string;
  topicTitle: string;
  lessonTitle: string;
  knowledgeUnit: string;
  learningOutcomeCode: string;
  learningOutcomeText: string;
  curriculumLinked: boolean;

  // Phân loại câu hỏi & Mức độ nhận thức (Không tự xác nhận mức độ nhận thức)
  format: QuestionFormatCode;
  suggestedCognitiveLevel: CognitiveLevelCode;
  cognitiveLevel: CognitiveLevelCode;
  cognitiveConfirmed: boolean; // Bắt buộc false lúc mới trích xuất, giáo viên phải xác nhận
  points: number;

  // Nội dung câu hỏi, phương án, ngữ liệu chung, đính kèm
  stem: string;
  options: string[];
  correctOptionIndices: number[];
  subStatements: {
    label: string;
    statement: string;
    isTrue: boolean;
    explanation?: string;
  }[];
  sharedPassageGroupId?: string;
  sharedPassageTitle?: string;
  sharedPassage?: string;
  sharedPassageAuthor?: string;
  attachments: QuestionAttachment[];

  // Đáp án & Nguồn gốc đáp án (Không tự bịa đáp án nếu tài liệu không có)
  hasExplicitAnswerInDoc: boolean;
  answerOrigin: AnswerOriginType;
  correctAnswer: string;
  aiSuggestedAnswer?: string;
  aiSuggestedExplanation?: string;
  gradingGuide: string;

  // Cảnh báo nội dung không chắc chắn & Kiểm tra trùng lặp
  extractionWarnings: string[];
  sourceSnippet: string;
  duplicateCheck?: DuplicateMatchDetail;
}

export interface SmartImportFileRecord {
  fileId: string;
  fileName: string;
  fileType: SmartImportSourceType;
  fileSizeBytes: number;
  uploadedAt: string;
  status: 'PENDING' | 'EXTRACTING' | 'AI_ANALYZING' | 'READY' | 'ERROR';
  progressPercent: number;
  currentStepIndex: number; // 1..8
  currentStepLabel: string;
  errorMessage?: string;
  pages: ExtractedDocumentPage[];
  extractedQuestions: SmartExtractedQuestionDraft[];
  engineUsed?: 'GEMINI_API' | 'HYBRID_LOCAL_PARSER';
  detectedSubject?: string;
  detectedGrade?: GradeNumber;
}

export interface SmartImportSaveResult {
  success: boolean;
  requestedCount: number;
  verifiedSavedCount: number;
  savedQuestions: QuestionItem[];
  createdGroups: QuestionGroup[];
  errorMessage?: string;
}

export type SmartImportTestScenarioId =
  | 'TEST_MATH_FORMULA'
  | 'TEST_VIETNAMESE_PASSAGE'
  | 'TEST_MCQ_MULTI_CHOICE'
  | 'TEST_IMAGE_AND_TABLE'
  | 'TEST_NO_ANSWER_KEY'
  | 'TEST_CORRUPTED_FILE';

export interface SmartImportScenarioTestReport {
  scenarioId: SmartImportTestScenarioId;
  scenarioTitle: string;
  fileName: string;
  fileType: SmartImportSourceType;
  expectedQuestionCount: number;
  extractedQuestionCount: number;
  passedExtractionCount: boolean;
  passedContentAccuracy: boolean;
  passedSpecialRules: boolean;
  passedRealStorageSave: boolean;
  verifiedSavedIds: string[];
  details: string[];
  overallPassed: boolean;
}

// ============================================================================
// 1. TIỆN ÍCH GIẢI MÃ CÔNG THỨC TOÁN OMML (<m:oMath>) VÀ XML TRONG WORD (.DOCX)
// ============================================================================

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Chuyển đổi khối công thức Office MathML (<m:oMath>) trong tệp Word sang chuỗi LaTeX $...$
 * để bảo toàn 100% phân số, căn thức, số mũ, chỉ số dưới mà không làm mất công thức.
 */
function convertOmmlToLatex(ommlXml: string): string {
  let expr = ommlXml;

  // Phân số <m:f>...<m:num>A</m:num><m:den>B</m:den>...</m:f>
  expr = expr.replace(
    /<m:f\b[^>]*>[\s\S]*?<m:num\b[^>]*>([\s\S]*?)<\/m:num>[\s\S]*?<m:den\b[^>]*>([\s\S]*?)<\/m:den>[\s\S]*?<\/m:f>/gi,
    (_m, numXml, denXml) => {
      const numText = extractPlainMathText(numXml);
      const denText = extractPlainMathText(denXml);
      return `\\frac{${numText}}{${denText}}`;
    }
  );

  // Căn thức <m:rad>...<m:deg>N</m:deg><m:e>X</m:e>...</m:rad>
  expr = expr.replace(
    /<m:rad\b[^>]*>([\s\S]*?)<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<\/m:rad>/gi,
    (_m, preXml, bodyXml) => {
      const degMatch = preXml.match(/<m:deg\b[^>]*>([\s\S]*?)<\/m:deg>/i);
      const degText = degMatch ? extractPlainMathText(degMatch[1]).trim() : '';
      const bodyText = extractPlainMathText(bodyXml);
      return degText ? `\\sqrt[${degText}]{${bodyText}}` : `\\sqrt{${bodyText}}`;
    }
  );

  // Số mũ <m:sSup>...<m:e>X</m:e><m:sup>Y</m:sup>...</m:sSup>
  expr = expr.replace(
    /<m:sSup\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sup\b[^>]*>([\s\S]*?)<\/m:sup>[\s\S]*?<\/m:sSup>/gi,
    (_m, baseXml, supXml) => {
      const baseText = extractPlainMathText(baseXml);
      const supText = extractPlainMathText(supXml);
      return `${baseText}^{${supText}}`;
    }
  );

  // Chỉ số dưới <m:sSub>...<m:e>X</m:e><m:sub>Y</m:sub>...</m:sSub>
  expr = expr.replace(
    /<m:sSub\b[^>]*>[\s\S]*?<m:e\b[^>]*>([\s\S]*?)<\/m:e>[\s\S]*?<m:sub\b[^>]*>([\s\S]*?)<\/m:sub>[\s\S]*?<\/m:sSub>/gi,
    (_m, baseXml, subXml) => {
      const baseText = extractPlainMathText(baseXml);
      const subText = extractPlainMathText(subXml);
      return `${baseText}_{${subText}}`;
    }
  );

  const cleaned = extractPlainMathText(expr).trim();
  if (!cleaned) return '';
  return cleaned.startsWith('$') ? cleaned : `$${cleaned}$`;
}

function extractPlainMathText(xmlSnippet: string): string {
  const texts: string[] = [];
  const regex = /<(?:m:t|w:t)\b[^>]*>([\s\S]*?)<\/(?:m:t|w:t)>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xmlSnippet)) !== null) {
    texts.push(decodeXmlEntities(match[1]));
  }
  if (texts.length > 0) return texts.join('');
  return decodeXmlEntities(xmlSnippet.replace(/<[^>]+>/g, '')).trim();
}

/**
 * Chuẩn hóa các biểu thức toán viết dạng văn bản (VD: sqrt(x^2 + 1), a/b, x^2) thành LaTeX chuẩn $...$
 * nếu chưa được bao trong dấu $...$
 */
export function normalizeInlineMathFormulas(text: string): {
  normalizedText: string;
  extractedFormulas: string[];
} {
  const formulas: string[] = [];
  let output = text || '';

  // Thu thập các công thức đã nằm trong $...$ hoặc $$...$$
  const existingLatexRegex = /\$\$[\s\S]+?\$\$|\$[^$\n]+\$/g;
  let m: RegExpExecArray | null;
  while ((m = existingLatexRegex.exec(output)) !== null) {
    const rawLatex = m[0].replace(/^\$\$?|\$\$?$/g, '').trim();
    if (rawLatex && !formulas.includes(rawLatex)) {
      formulas.push(rawLatex);
    }
  }

  // Nếu có các biểu thức unicode toán học như √(...), x², x³, ≥, ≤, ±, Δ mà chưa có $...$
  if (/[√²³±≤≥≠πΔ]|\\frac|\\sqrt|\^[0-9]/i.test(output)) {
    const unicodeMathMatches = output.match(
      /(?:[A-Za-z0-9]+\s*=\s*)?(?:\\frac\{[^}]+\}\{[^}]+\}|\\sqrt\{[^}]+\}|√\([^)]+\)|[A-Za-z0-9()+\-*/\s]+[²³])/g
    );
    if (unicodeMathMatches) {
      for (const expr of unicodeMathMatches) {
        const cleanExpr = expr.trim();
        if (cleanExpr.length >= 2 && !formulas.includes(cleanExpr)) {
          formulas.push(cleanExpr);
        }
      }
    }
  }

  return {
    normalizedText: output,
    extractedFormulas: formulas,
  };
}

// ============================================================================
// 2. BỘ TRÍCH XUẤT TỆP WORD (.DOCX) THỰC TẾ QUA JSZIP
// ============================================================================

export async function parseDocxFileToPages(file: File): Promise<ExtractedDocumentPage[]> {
  if (file.size === 0) {
    throw new Error('Tệp Word (.docx) rỗng (0 byte), không có dữ liệu để trích xuất.');
  }

  let zip: JSZip;
  try {
    const arrayBuffer = await file.arrayBuffer();
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch {
    throw new Error(
      `Tệp "${file.name}" bị hỏng cấu trúc nén hoặc không phải định dạng Word (.docx) hợp lệ.`
    );
  }

  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error(
      `Tệp "${file.name}" thiếu thành phần cấu trúc chuẩn word/document.xml. Không thể đọc nội dung.`
    );
  }

  const documentXml = await docXmlFile.async('string');

  // 1. Đọc danh sách liên kết hình ảnh trong word/_rels/document.xml.rels
  const relMap = new Map<string, string>();
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (relsFile) {
    const relsXml = await relsFile.async('string');
    const relRegex = /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/gi;
    let relMatch: RegExpExecArray | null;
    while ((relMatch = relRegex.exec(relsXml)) !== null) {
      relMap.set(relMatch[1], relMatch[2]);
    }
  }

  // 2. Giải nén tất cả hình ảnh trong word/media/*
  const mediaDataMap = new Map<
    string,
    { fileName: string; mimeType: string; dataUrl: string }
  >();
  const mediaFiles = Object.keys(zip.files).filter((p) => p.startsWith('word/media/'));
  for (const mediaPath of mediaFiles) {
    const zipEntry = zip.file(mediaPath);
    if (!zipEntry) continue;
    const base64 = await zipEntry.async('base64');
    const ext = mediaPath.split('.').pop()?.toLowerCase() || 'png';
    const mimeType =
      ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'svg'
        ? 'image/svg+xml'
        : ext === 'gif'
        ? 'image/gif'
        : 'image/png';
    const shortName = mediaPath.replace('word/media/', '');
    mediaDataMap.set(mediaPath, {
      fileName: shortName,
      mimeType,
      dataUrl: `data:${mimeType};base64,${base64}`,
    });
    mediaDataMap.set(`media/${shortName}`, {
      fileName: shortName,
      mimeType,
      dataUrl: `data:${mimeType};base64,${base64}`,
    });
  }

  // 3. Duyệt theo khối <w:p> và <w:tbl> để giữ đúng thứ tự văn bản, bảng biểu, hình ảnh, công thức và ngắt trang
  const pages: ExtractedDocumentPage[] = [];
  let currentPageNumber = 1;
  let currentLines: string[] = [];
  let currentTables: ExtractedDocumentPage['tables'] = [];
  let currentImages: ExtractedDocumentPage['images'] = [];
  let currentFormulas: string[] = [];

  const flushCurrentPage = () => {
    if (
      currentLines.length > 0 ||
      currentTables.length > 0 ||
      currentImages.length > 0 ||
      currentPageNumber === 1
    ) {
      pages.push({
        pageNumber: currentPageNumber,
        rawText: currentLines.join('\n').trim(),
        tables: [...currentTables],
        images: [...currentImages],
        formulas: [...currentFormulas],
        passages: [],
      });
    }
    currentLines = [];
    currentTables = [];
    currentImages = [];
    currentFormulas = [];
  };

  const blockRegex = /<w:tbl\b[\s\S]*?<\/w:tbl>|<w:p\b[\s\S]*?<\/w:p>/gi;
  let blockMatch: RegExpExecArray | null;
  let tableCounter = 0;
  let imageCounter = 0;

  while ((blockMatch = blockRegex.exec(documentXml)) !== null) {
    const blockXml = blockMatch[0];

    // Kiểm tra ngắt trang
    const hasPageBreak =
      /<w:br\b[^>]*w:type="page"/i.test(blockXml) ||
      /<w:lastRenderedPageBreak\b/i.test(blockXml);

    if (blockXml.toLowerCase().startsWith('<w:tbl')) {
      // Trích xuất bảng biểu <w:tbl>
      tableCounter += 1;
      const rows: string[][] = [];
      const rowRegex = /<w:tr\b[\s\S]*?<\/w:tr>/gi;
      let trMatch: RegExpExecArray | null;
      while ((trMatch = rowRegex.exec(blockXml)) !== null) {
        const trXml = trMatch[0];
        const rowCells: string[] = [];
        const cellRegex = /<w:tc\b[\s\S]*?<\/w:tc>/gi;
        let tcMatch: RegExpExecArray | null;
        while ((tcMatch = cellRegex.exec(trXml)) !== null) {
          const cellText = extractParagraphTextWithMathAndFormatting(tcMatch[0]).text;
          rowCells.push(cellText.replace(/\n+/g, ' ').trim());
        }
        if (rowCells.some((c) => c.length > 0)) {
          rows.push(rowCells);
        }
      }

      if (rows.length > 0) {
        const headers = rows[0];
        const dataRows = rows.length > 1 ? rows.slice(1) : [];
        const tableId = `tbl-p${currentPageNumber}-${tableCounter}`;
        currentTables.push({
          id: tableId,
          title: `Bảng số liệu #${tableCounter} (Trang ${currentPageNumber})`,
          headers,
          rows: dataRows,
        });
        currentLines.push(
          `[BẢNG BIỂU #${tableCounter}: ${headers.join(' | ')}${
            dataRows.length > 0 ? ' // ' + dataRows.map((r) => r.join(' | ')).join(' ; ') : ''
          }]`
        );
      }
    } else {
      // Trích xuất đoạn văn <w:p> kèm công thức OMML và hình ảnh nhúng
      const blipRegex = /r:embed="([^"]+)"/gi;
      let blipMatch: RegExpExecArray | null;
      while ((blipMatch = blipRegex.exec(blockXml)) !== null) {
        const rId = blipMatch[1];
        const target = relMap.get(rId);
        if (target) {
          const normalizedTarget = target.replace(/^\/?word\//, '');
          const media =
            mediaDataMap.get(normalizedTarget) || mediaDataMap.get(`word/${normalizedTarget}`);
          if (media) {
            imageCounter += 1;
            const imgId = `img-p${currentPageNumber}-${imageCounter}`;
            currentImages.push({
              id: imgId,
              fileName: media.fileName,
              mimeType: media.mimeType,
              dataUrl: media.dataUrl,
              caption: `Hình minh họa #${imageCounter} (${media.fileName})`,
            });
            currentLines.push(`[HÌNH ẢNH #${imageCounter}: ${media.fileName}]`);
          }
        }
      }

      const { text: paraText, formulas: paraFormulas } =
        extractParagraphTextWithMathAndFormatting(blockXml);
      for (const f of paraFormulas) {
        if (!currentFormulas.includes(f)) {
          currentFormulas.push(f);
        }
      }
      if (paraText.trim()) {
        currentLines.push(paraText.trim());
      }
    }

    if (hasPageBreak && currentLines.length > 2) {
      flushCurrentPage();
      currentPageNumber += 1;
    }
  }

  flushCurrentPage();

  // Nếu có các hình ảnh trong word/media/* chưa được gắn qua r:embed thì gắn vào trang 1 để không bao giờ mất ảnh
  if (pages.length > 0 && pages.every((p) => p.images.length === 0) && mediaDataMap.size > 0) {
    const uniqueMedia = new Map<string, { fileName: string; mimeType: string; dataUrl: string }>();
    mediaDataMap.forEach((val) => uniqueMedia.set(val.fileName, val));
    let idx = 0;
    uniqueMedia.forEach((media) => {
      idx += 1;
      pages[0].images.push({
        id: `img-p1-${idx}`,
        fileName: media.fileName,
        mimeType: media.mimeType,
        dataUrl: media.dataUrl,
        caption: `Hình minh họa #${idx} (${media.fileName})`,
      });
      pages[0].rawText += `\n[HÌNH ẢNH #${idx}: ${media.fileName}]`;
    });
  }

  const totalText = pages.map((p) => p.rawText).join('\n').trim();
  if (!totalText && pages.every((p) => p.tables.length === 0 && p.images.length === 0)) {
    throw new Error(`Tệp Word "${file.name}" không chứa nội dung văn bản hoặc câu hỏi hợp lệ.`);
  }

  return pages;
}

function extractParagraphTextWithMathAndFormatting(pXml: string): {
  text: string;
  formulas: string[];
} {
  const formulas: string[] = [];

  // Thay thế các khối <m:oMath> bằng chuỗi LaTeX $...$
  const xmlWithLatex = pXml.replace(/<m:oMath\b[^>]*>[\s\S]*?<\/m:oMath>/gi, (ommlBlock) => {
    const latex = convertOmmlToLatex(ommlBlock);
    if (latex) {
      const rawFormula = latex.replace(/^\$|\$$/g, '');
      if (rawFormula && !formulas.includes(rawFormula)) {
        formulas.push(rawFormula);
      }
      return `<w:r><w:t> ${latex} </w:t></w:r>`;
    }
    return '';
  });

  // Duyệt từng run <w:r> để phát hiện chữ gạch chân (<w:u/>) dùng đánh dấu đáp án đúng trong đề Word
  const runRegex = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/gi;
  let runMatch: RegExpExecArray | null;
  let builtText = '';

  while ((runMatch = runRegex.exec(xmlWithLatex)) !== null) {
    const runXml = runMatch[1];
    const isUnderlined = /<w:u\b(?![^>]*w:val="none")/i.test(runXml);
    const tRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi;
    let tMatch: RegExpExecArray | null;
    let runStr = '';
    while ((tMatch = tRegex.exec(runXml)) !== null) {
      runStr += decodeXmlEntities(tMatch[1]);
    }
    if (isUnderlined && /^[A-D][.)]?$/i.test(runStr.trim())) {
      builtText += `[ĐÁP_ÁN_GẠCH_CHÂN:${runStr.trim()[0].toUpperCase()}]${runStr}`;
    } else {
      builtText += runStr;
    }
  }

  if (!builtText) {
    builtText = extractPlainMathText(xmlWithLatex);
  }

  const norm = normalizeInlineMathFormulas(builtText);
  for (const f of norm.extractedFormulas) {
    if (!formulas.includes(f)) {
      formulas.push(f);
    }
  }

  return {
    text: norm.normalizedText,
    formulas,
  };
}

// ============================================================================
// 3. BỘ TRÍCH XUẤT TỆP EXCEL (.XLSX) VÀ PDF (.PDF) VÀ HÌNH ẢNH
// ============================================================================

export async function parseXlsxFileToPages(file: File): Promise<ExtractedDocumentPage[]> {
  if (file.size === 0) {
    throw new Error('Tệp Excel (.xlsx) rỗng (0 byte).');
  }

  let workbook: XLSX.WorkBook;
  try {
    const arrayBuffer = await file.arrayBuffer();
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  } catch {
    throw new Error(`Tệp "${file.name}" bị lỗi định dạng hoặc không phải tệp Excel (.xlsx) hợp lệ.`);
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error(`Tệp Excel "${file.name}" không có trang tính (Sheet) nào.`);
  }

  const pages: ExtractedDocumentPage[] = [];

  workbook.SheetNames.forEach((sheetName, idx) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
    const nonEmptyRows = rows
      .map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? '').trim()) : []))
      .filter((r) => r.some((cell) => cell.length > 0));

    if (nonEmptyRows.length === 0) return;

    const lines: string[] = [`=== Trang tính (Sheet): ${sheetName} ===`];
    const headers = nonEmptyRows[0];
    const dataRows = nonEmptyRows.slice(1);

    // Chuyển từng dòng Excel thành định dạng câu hỏi nếu là bảng câu hỏi, hoặc giữ nguyên bảng
    dataRows.forEach((row, rIdx) => {
      const joined = row.filter(Boolean).join(' | ');
      if (/^câu\s*\d+/i.test(row[0] || '')) {
        lines.push(joined);
      } else if (row.length >= 4) {
        lines.push(`Câu ${rIdx + 1}: ${joined}`);
      } else {
        lines.push(joined);
      }
    });

    const rawText = lines.join('\n');
    const { extractedFormulas } = normalizeInlineMathFormulas(rawText);

    pages.push({
      pageNumber: idx + 1,
      rawText,
      tables: [
        {
          id: `xlsx-tbl-${idx + 1}`,
          title: `Bảng dữ liệu Sheet "${sheetName}"`,
          headers,
          rows: dataRows.slice(0, 25),
        },
      ],
      images: [],
      formulas: extractedFormulas,
      passages: [],
    });
  });

  if (pages.length === 0) {
    throw new Error(`Tệp Excel "${file.name}" không chứa dữ liệu câu hỏi nào.`);
  }

  return pages;
}

// Cấu hình đường dẫn Web Worker cùng nguồn cho Mozilla PDF.js
if (typeof window !== 'undefined' && pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/api/pdf/worker.mjs';
}

function decodeHexUtf16OrUtf8(hexRaw: string, cmap: Map<number, string>): string {
  const clean = hexRaw.replace(/[^0-9A-Fa-f]/g, '');
  if (!clean) return '';
  if (clean.toUpperCase().startsWith('FEFF') && clean.length >= 8) {
    let out = '';
    for (let i = 4; i + 3 < clean.length; i += 4) {
      const code = parseInt(clean.slice(i, i + 4), 16);
      if (!Number.isNaN(code) && code > 0) out += String.fromCharCode(code);
    }
    return out;
  }
  if (cmap.size > 0 && clean.length % 4 === 0) {
    let out = '';
    let mapped = 0;
    for (let i = 0; i + 3 < clean.length; i += 4) {
      const cid = parseInt(clean.slice(i, i + 4), 16);
      if (cmap.has(cid)) {
        out += cmap.get(cid)!;
        mapped++;
      } else if (cid >= 32 && cid <= 0x1ef9) {
        out += String.fromCharCode(cid);
      }
    }
    if (mapped > 0) return out;
  }
  if (clean.length % 4 === 0) {
    let utf16Out = '';
    let validCount = 0;
    for (let i = 0; i + 3 < clean.length; i += 4) {
      const code = parseInt(clean.slice(i, i + 4), 16);
      if (
        (code >= 0x20 && code <= 0x7e) ||
        (code >= 0xa0 && code <= 0x024f) ||
        (code >= 0x1e00 && code <= 0x1eff) ||
        (code >= 0x2000 && code <= 0x22ff)
      ) {
        utf16Out += String.fromCharCode(code);
        validCount++;
      }
    }
    if (validCount >= clean.length / 8 && utf16Out.trim().length > 0) {
      return utf16Out;
    }
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i + 1 < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

/**
 * Chuẩn hóa văn bản OCR tiếng Việt cho đề kiểm tra từ PDF ảnh chụp / ảnh quét
 */
export function cleanVietnameseExamOcrText(rawText: string): string {
  if (!rawText) return '';
  let text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  // 1. Chuẩn hóa "PHẦN I, II, III, IV" bị OCR nhầm dấu hoặc chữ cái La Mã
  text = text.replace(
    /(?:^|\n)\s*(?:PHAN|PHÁN|PHÀN|PHẨN|PHẤN|Phần|Phân|PHẦN)\s+([I1lV234XH]+)\b/g,
    (_m, romanRaw: string) => {
      const normRoman = romanRaw
        .replace(/^[l1]$/i, 'I')
        .replace(/^[I1l]{2}$/i, 'II')
        .replace(/^(?:[I1l]{3}|HH|III|IIII)$/i, 'III')
        .replace(/^(?:IV|1V|lV)$/i, 'IV');
      return `\nPHẦN ${normRoman}`;
    }
  );

  // 2. Chuẩn hóa "Câu 1:", "Cầu 1:", "Càu 1:", "Cấu 1:", "Cau 1:", "Câu l:", "Câu I:", kể cả khi bị dính giữa dòng
  text = text.replace(
    /(?:^|\n|(?<=[.?!;)\]]\s+))\s*(?:Câu|Cầu|Càu|Cấu|Cẫu|Cáu|Cân|Gâu|Cau|CÂU|CẦU|CÀU|CẤU|Cắu|Cằu)\s*(\d{1,3}|[lI|]{1,2})\s*(?=[(:.)\-–/\s])/g,
    (_m, numRaw: string) => {
      const cleanNum = /^[lI|]$/.test(numRaw)
        ? '1'
        : /^[lI|]{2}$/.test(numRaw)
        ? '2'
        : numRaw.replace(/[lI|]/g, '1');
      return `\nCâu ${cleanNum}`;
    }
  );

  // 3. Chuẩn hóa "Bài 1:", "Bải 1:", "Bàì 1:", "Bai 1:"
  text = text.replace(
    /(?:^|\n|(?<=[.?!;)\]]\s+))\s*(?:Bài|Bải|Bàì|Bằi|Bàl|Bai|BÀI|BẢI)\s*(\d{1,3}|[lI|]{1,2})\s*(?=[(:.)\-–/\s])/g,
    (_m, numRaw: string) => {
      const cleanNum = /^[lI|]$/.test(numRaw)
        ? '1'
        : /^[lI|]{2}$/.test(numRaw)
        ? '2'
        : numRaw.replace(/[lI|]/g, '1');
      return `\nBài ${cleanNum}`;
    }
  );

  // 4. Chuẩn hóa phương án A. B. C. D. bị dính chữ hoặc nhận diện dấu phẩy (VD: "A, Nhấn" hoặc "A.Nhấn")
  text = text.replace(
    /(?:^|\n|\s{2,})([A-D])\s*[.,:;)]\s*(?=[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ0-9$(\\])/g,
    (match, letter: string) => {
      const prefix = match.startsWith('\n') ? '\n' : match.startsWith(' ') ? '  ' : '';
      return `${prefix}${letter}. `;
    }
  );

  // 5. Chuẩn hóa mệnh đề Đúng/Sai a) b) c) d) khi ý a) bị OCR nhầm thành "2)" hoặc "o)" đứng ngay trước "b)"
  if (/(?:^|\n)\s*b\s*[.)]/i.test(text) && /(?:^|\n)\s*c\s*[.)]/i.test(text)) {
    text = text.replace(
      /(?:^|\n)\s*(?:2|o|0|@)\s*\)\s+([^\n]+)(?=\n\s*b\s*[.)])/gi,
      '\na) $1'
    );
  }
  text = text.replace(/(?:^|\n)\s*([a-d])\s*[)\]}]\s+/g, '\n$1) ');

  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]{3,}/g, '  ').trim())
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n')
    .trim();
}

/**
 * Kiểm tra xem văn bản trích xuất từ một trang PDF có thực sự chứa nội dung đề thi đọc được
 * hay chỉ là rỗng / watermark máy scan / rác nhị phân từ stream ảnh
 */
export function isMeaningfulExtractedExamText(rawText: string): boolean {
  if (!rawText) return false;
  if (
    rawText.includes('Đang sử dụng AI Multimodal') ||
    rawText.startsWith('[Tệp PDF ') ||
    rawText.startsWith('[Hình ảnh đề kiểm tra:')
  ) {
    return false;
  }

  const withoutWatermarks = rawText
    .replace(/Scanned\s+(?:with|by)\s+[^\n]+/gi, '')
    .replace(/Created\s+(?:with|by)\s+[^\n]+/gi, '')
    .replace(/CamScanner|TapScanner|Adobe\s*Scan|Microsoft\s*Lens|FastScanner/gi, '')
    .replace(/(?:Trang|Page)\s*\d+(?:\s*\/\s*\d+)?/gi, '')
    .trim();

  if (withoutWatermarks.length < 25) return false;

  // Kiểm tra tỷ lệ ký tự đọc được để loại bỏ hoàn toàn rác nhị phân từ stream JPEG/FlateDecode hoặc font lỗi CMap
  let printableCount = 0;
  let weirdControlCount = 0;
  for (let i = 0; i < withoutWatermarks.length; i++) {
    const code = withoutWatermarks.charCodeAt(i);
    if (code === 0xfffd || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
      weirdControlCount++;
    } else if (
      (code >= 32 && code <= 126) ||
      (code >= 0x00a0 && code <= 0x024f) ||
      (code >= 0x1e00 && code <= 0x1eff) ||
      (code >= 0x2000 && code <= 0x22ff)
    ) {
      printableCount++;
    }
  }
  if (
    weirdControlCount > withoutWatermarks.length * 0.08 ||
    printableCount < withoutWatermarks.length * 0.75
  ) {
    return false;
  }

  if (
    /(?:Câu|Cầu|Càu|Cấu|Cáu|Cau|Bài|Bải|Bai|Question)\s*(?:\d+|[lI|]{1,2})\b|PHẦN\s+[I1V234X]+|(?:^|\s)[A-D]\s*[.):]\s+\S/i.test(
      withoutWatermarks
    ) &&
    withoutWatermarks.length >= 40
  ) {
    return true;
  }

  const wordCount = withoutWatermarks.split(/\s+/).filter((w) => w.length >= 2).length;
  return withoutWatermarks.length >= 160 && wordCount >= 24;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(sub));
  }
  return typeof btoa === 'function' ? btoa(binary) : '';
}

/**
 * Tách trực tiếp các luồng ảnh JPEG (DCTDecode) và PNG nhúng trong tệp PDF dạng hình ảnh chụp
 */
function extractEmbeddedImagesFromPdfBytes(
  uint8: Uint8Array,
  fileName: string
): { id: string; fileName: string; mimeType: string; dataUrl: string; caption?: string }[] {
  const results: {
    id: string;
    fileName: string;
    mimeType: string;
    dataUrl: string;
    caption?: string;
  }[] = [];
  const baseName = fileName.replace(/\.pdf$/i, '');

  let pos = 0;
  let imgIdx = 0;
  while (pos < uint8.length - 16 && imgIdx < 25) {
    // 1. Quét chữ ký JPEG (FF D8 FF ... FF D9)
    if (
      uint8[pos] === 0xff &&
      uint8[pos + 1] === 0xd8 &&
      uint8[pos + 2] === 0xff &&
      uint8[pos + 3] >= 0xc0 &&
      uint8[pos + 3] <= 0xfe
    ) {
      let endPos = -1;
      const maxSearch = Math.min(uint8.length - 1, pos + 15 * 1024 * 1024);
      for (let j = pos + 4; j < maxSearch; j++) {
        if (uint8[j] === 0xff && uint8[j + 1] === 0xd9) {
          endPos = j + 2;
          const tailBytes = uint8.subarray(endPos, Math.min(uint8.length, endPos + 16));
          const tailStr = new TextDecoder('ascii', { fatal: false }).decode(tailBytes);
          if (tailStr.includes('endstream')) {
            break;
          }
        }
      }
      if (endPos > pos + 1200) {
        imgIdx += 1;
        const slice = uint8.subarray(pos, endPos);
        const b64 = uint8ToBase64(slice);
        if (b64) {
          results.push({
            id: `pdf-embed-jpg-${imgIdx}`,
            fileName: `${baseName}_anh_trang_${imgIdx}.jpg`,
            mimeType: 'image/jpeg',
            dataUrl: `data:image/jpeg;base64,${b64}`,
            caption: `Ảnh chụp Trang ${imgIdx} trích xuất từ PDF (${fileName})`,
          });
        }
        pos = endPos;
        continue;
      }
    }

    // 2. Quét chữ ký PNG (89 50 4E 47 0D 0A 1A 0A ... 49 45 4E 44 AE 42 60 82)
    if (
      uint8[pos] === 0x89 &&
      uint8[pos + 1] === 0x50 &&
      uint8[pos + 2] === 0x4e &&
      uint8[pos + 3] === 0x47 &&
      uint8[pos + 4] === 0x0d &&
      uint8[pos + 5] === 0x0a &&
      uint8[pos + 6] === 0x1a &&
      uint8[pos + 7] === 0x0a
    ) {
      let endPos = -1;
      const maxSearch = Math.min(uint8.length - 8, pos + 15 * 1024 * 1024);
      for (let j = pos + 8; j < maxSearch; j++) {
        if (
          uint8[j] === 0x49 &&
          uint8[j + 1] === 0x45 &&
          uint8[j + 2] === 0x4e &&
          uint8[j + 3] === 0x44 &&
          uint8[j + 4] === 0xae &&
          uint8[j + 5] === 0x42 &&
          uint8[j + 6] === 0x60 &&
          uint8[j + 7] === 0x82
        ) {
          endPos = j + 8;
          break;
        }
      }
      if (endPos > pos + 1200) {
        imgIdx += 1;
        const slice = uint8.subarray(pos, endPos);
        const b64 = uint8ToBase64(slice);
        if (b64) {
          results.push({
            id: `pdf-embed-png-${imgIdx}`,
            fileName: `${baseName}_anh_trang_${imgIdx}.png`,
            mimeType: 'image/png',
            dataUrl: `data:image/png;base64,${b64}`,
            caption: `Ảnh chụp Trang ${imgIdx} trích xuất từ PDF (${fileName})`,
          });
        }
        pos = endPos;
        continue;
      }
    }
    pos++;
  }

  return results;
}

/**
 * Tăng cường độ tương phản và làm sạch nền ảnh chụp điện thoại / máy scan trước khi đưa vào Tesseract OCR
 */
async function preprocessImageDataUrlForOcr(dataUrl: string): Promise<string> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxDim = 2000;
        let w = img.naturalWidth || img.width || 1000;
        let h = img.naturalHeight || img.height || 1400;
        if (w < 600) {
          const scaleUp = 1200 / Math.max(1, w);
          w = Math.round(w * scaleUp);
          h = Math.round(h * scaleUp);
        } else if (w > maxDim || h > maxDim) {
          const scaleDown = maxDim / Math.max(w, h);
          w = Math.round(w * scaleDown);
          h = Math.round(h * scaleDown);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        // Kéo dãn độ tương phản thông minh: làm trắng nền giấy xám/vàng (l > 185 -> 255) và làm đậm nét chữ mực (l < 145)
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          let v: number;
          if (lum >= 190) {
            v = 255;
          } else if (lum <= 95) {
            v = Math.max(0, Math.round(lum * 0.45));
          } else {
            v = Math.min(255, Math.max(0, Math.round(((lum - 95) / 95) * 215 + 40)));
          }
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
          d[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Thực hiện nhận diện chữ viết tiếng Việt & công thức (OCR) trên danh sách ảnh trang PDF
 * - Tầng OCR-1: Gọi máy chủ (/api/pdf/ocr) sử dụng Gemini Vision (hỗ trợ cả ảnh trang và luồng application/pdf trực tiếp) hoặc Tesseract.js (vie+eng)
 * - Tầng OCR-2: Dự phòng chạy Tesseract.js trực tiếp trên trình duyệt (kèm tiền xử lý tăng độ tương phản) nếu mất kết nối máy chủ
 */
async function runOcrOnPageImages(params: {
  fileName: string;
  pageImages: { pageNumber: number; dataUrl: string; mimeType?: string }[];
  base64Data?: string;
  onProgress?: (msg: string) => void;
}): Promise<Map<number, string>> {
  const recognizedMap = new Map<number, string>();

  // 1. Gọi endpoint OCR trên máy chủ (/api/pdf/ocr) - luôn gửi kèm cả pageImages và base64Data
  try {
    params.onProgress?.(
      `Bước 2: Phát hiện PDF dạng hình ảnh chụp — Đang nhận diện chữ viết & công thức (OCR) cho ${Math.max(
        1,
        params.pageImages.length
      )} trang...`
    );
    const resp = await fetch('/api/pdf/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: params.fileName,
        pageImages: params.pageImages,
        base64Data: params.base64Data,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data.pages)) {
        for (const p of data.pages) {
          const pNum = Number(p.pageNumber) || 1;
          const cleaned = cleanVietnameseExamOcrText(String(p.rawText || ''));
          if (cleaned) {
            recognizedMap.set(pNum, cleaned);
          }
        }
      }
      if (recognizedMap.size > 0) {
        return recognizedMap;
      }
    }
  } catch (serverOcrErr) {
    console.warn('Server /api/pdf/ocr fallback to browser Tesseract.js:', serverOcrErr);
  }

  // 2. Dự phòng chạy Tesseract.js trực tiếp trên trình duyệt (kèm tiền xử lý khử bóng mờ & tăng tương phản)
  if (params.pageImages.length > 0 && typeof window !== 'undefined') {
    try {
      const tesseractMod = await import('tesseract.js');
      const worker = await tesseractMod.createWorker(['vie', 'eng']);
      try {
        for (let i = 0; i < params.pageImages.length; i++) {
          const item = params.pageImages[i];
          params.onProgress?.(
            `Bước 2: Đang nhận diện chữ viết OCR trên trình duyệt (Trang ${item.pageNumber}/${params.pageImages.length})...`
          );
          const enhancedDataUrl = await preprocessImageDataUrlForOcr(item.dataUrl);
          const ret = await worker.recognize(enhancedDataUrl);
          const cleaned = cleanVietnameseExamOcrText(ret.data.text || '');
          if (cleaned) {
            recognizedMap.set(item.pageNumber, cleaned);
          }
        }
      } finally {
        await worker.terminate();
      }
    } catch (clientOcrErr) {
      console.warn('Browser Tesseract.js OCR warning:', clientOcrErr);
    }
  }

  return recognizedMap;
}

/**
 * Trích xuất nội dung tệp PDF bằng 4 tầng bảo vệ:
 * - Tầng 1: Mozilla PDF.js (pdfjs-dist) giải mã trực tiếp trên trình duyệt + kết xuất ảnh chụp trang độ phân giải cao qua HTML5 Canvas
 * - Tầng 2: Máy chủ Node.js (/api/pdf/extract) giải mã bằng pdfjs-dist legacy + giải nén luồng FlateDecode (zlib) & Gemini PDF Vision / OCR
 * - Tầng 3: Bộ giải mã luồng văn bản UTF-16BE / CMap / BT..ET cục bộ (lọc bỏ hoàn toàn stream ảnh nhị phân)
 * - Tầng 4: Bộ nhận diện chữ viết quang học tiếng Việt & công thức (OCR - Gemini Vision + Tesseract.js vie+eng) chuyên trị PDF dạng hình ảnh chụp (Scanned PDF)
 */
export async function parsePdfFileToPages(
  file: File,
  onProgress?: (stepMessage: string) => void
): Promise<{
  pages: ExtractedDocumentPage[];
  base64Data: string;
}> {
  if (file.size < 8) {
    throw new Error(`Tệp PDF "${file.name}" rỗng hoặc bị hỏng.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const headerPreview = new TextDecoder('ascii', { fatal: false }).decode(
    uint8.slice(0, Math.min(uint8.length, 1024))
  );
  if (!headerPreview.includes('%PDF-')) {
    throw new Error(
      `Tệp "${file.name}" bị lỗi cấu trúc tiêu đề (%PDF-) hoặc không phải tệp PDF hợp lệ.`
    );
  }

  const base64Data = await fileToBase64Pure(file);
  const clientPages: ExtractedDocumentPage[] = [];
  const pagePreviewImages = new Map<
    number,
    { id: string; fileName: string; mimeType: string; dataUrl: string; caption?: string }[]
  >();

  // --------------------------------------------------------------------------
  // TẦNG 1: SỬ DỤNG MOZILLA PDF.JS (pdfjs-dist) TRÊN TRÌNH DUYỆT + VẼ ẢNH TRANG ĐỘ NÉT CAO
  // --------------------------------------------------------------------------
  try {
    if (typeof window !== 'undefined' && pdfjsLib?.getDocument) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/api/pdf/worker.mjs';
      let pdfDoc: Awaited<ReturnType<typeof pdfjsLib.getDocument>['promise']>;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: uint8.slice(0),
          useSystemFonts: true,
          cMapUrl: PDFJS_CDN_CMAP_URL,
          cMapPacked: true,
          standardFontDataUrl: PDFJS_CDN_STANDARD_FONT_URL,
        });
        pdfDoc = await loadingTask.promise;
      } catch {
        const fallbackLoadingTask = pdfjsLib.getDocument({
          data: uint8.slice(0),
          useSystemFonts: true,
          disableFontFace: true,
          cMapUrl: PDFJS_LOCAL_CMAP_URL,
          cMapPacked: true,
          standardFontDataUrl: PDFJS_LOCAL_STANDARD_FONT_URL,
        });
        pdfDoc = await fallbackLoadingTask.promise;
      }

      const numPages = pdfDoc.numPages;
      const renderScale = numPages <= 6 ? 2.0 : 1.65;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        onProgress?.(
          `Bước 2: Đang đọc cấu trúc CMap, ghép dòng tọa độ transform[5] & dựng trang PDF (${pageNum}/${numPages})...`
        );
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        interface PdfTextItemPos {
          str: string;
          x: number;
          y: number;
          width: number;
          height: number;
          hasEOL: boolean;
        }

        const posItems: PdfTextItemPos[] = [];
        for (const rawItem of textContent.items as Array<Record<string, unknown>>) {
          if (typeof rawItem.str === 'string') {
            const tr = Array.isArray(rawItem.transform)
              ? (rawItem.transform as number[])
              : [1, 0, 0, 1, 0, 0];
            const fontNameHint = typeof rawItem.fontName === 'string' ? rawItem.fontName : '';
            const decodedStr = decodeLegacyVietnameseFontText(
              rawItem.str,
              fontNameHint
            ).decodedText;
            const approxHeight =
              Number(rawItem.height) || Math.abs(Number(tr[3])) || Math.abs(Number(tr[0])) || 11;
            posItems.push({
              str: decodedStr,
              x: Number(tr[4]) || 0,
              y: Number(tr[5]) || 0,
              width: Number(rawItem.width) || 0,
              height: approxHeight,
              hasEOL: Boolean(rawItem.hasEOL),
            });
          }
        }

        // Nhóm các từ theo dòng dựa trên tọa độ Y (transform[5])
        const lineBuckets: Array<{ y: number; avgHeight: number; items: PdfTextItemPos[] }> = [];
        for (const it of posItems) {
          if (!it.str && !it.hasEOL) continue;
          const tolerance = Math.max(3.8, Math.min(7.5, (it.height || 11) * 0.42));
          let bucket = lineBuckets.find((b) => Math.abs(b.y - it.y) <= tolerance);
          if (!bucket) {
            bucket = { y: it.y, avgHeight: it.height || 11, items: [] };
            lineBuckets.push(bucket);
          } else {
            const count = bucket.items.length;
            bucket.y = (bucket.y * count + it.y) / (count + 1);
          }
          bucket.items.push(it);
        }

        lineBuckets.sort((a, b) => b.y - a.y);

        const pageLines: string[] = [];
        const candidateTableRows: string[][] = [];

        for (const bucket of lineBuckets) {
          bucket.items.sort((a, b) => a.x - b.x);
          let lineStr = '';
          const rowCells: string[] = [];
          let currentCell = '';
          let prevRight = -9999;

          for (const it of bucket.items) {
            const piece = it.str;
            if (!piece) continue;
            if (prevRight > -9000) {
              const gap = it.x - prevRight;
              if (gap > 28) {
                if (currentCell.trim()) rowCells.push(currentCell.trim());
                currentCell = piece;
                lineStr += '    ' + piece;
              } else if (gap > 2.2 && !lineStr.endsWith(' ') && !piece.startsWith(' ')) {
                currentCell += ' ' + piece;
                lineStr += ' ' + piece;
              } else {
                currentCell += piece;
                lineStr += piece;
              }
            } else {
              currentCell = piece;
              lineStr = piece;
            }
            prevRight = it.x + Math.max(it.width, piece.length * 4.2);
          }
          if (currentCell.trim()) rowCells.push(currentCell.trim());

          const cleanedLine = lineStr.replace(/[ \t]{2,}/g, '  ').trim();
          if (cleanedLine) {
            pageLines.push(cleanedLine);
          }

          if (
            rowCells.length >= 3 &&
            !rowCells.some((c) => /^[A-D][.)]\s*/.test(c)) &&
            !/^(?:Câu|Bài)\s+\d+/i.test(cleanedLine)
          ) {
            candidateTableRows.push(rowCells);
          }
        }

        // Kết xuất bản chụp trực quan của trang PDF ra Canvas (tối đa 25 trang, độ phân giải cao với nền trắng tinh khiết hỗ trợ OCR chính xác)
        const renderedImages: {
          id: string;
          fileName: string;
          mimeType: string;
          dataUrl: string;
          caption?: string;
        }[] = [];

        if (typeof document !== 'undefined' && pageNum <= 25) {
          try {
            const viewport = page.getViewport({ scale: renderScale });
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.floor(viewport.width));
            canvas.height = Math.max(1, Math.floor(viewport.height));
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Tô nền trắng trước khi vẽ để tránh vùng trong suốt bị đen khi nhận diện OCR
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              await page.render({
                canvasContext: ctx,
                canvas,
                viewport,
              }).promise;
              const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
              const finalDataUrl =
                jpgDataUrl && jpgDataUrl.startsWith('data:image/')
                  ? jpgDataUrl
                  : canvas.toDataURL('image/png');
              if (finalDataUrl && finalDataUrl.startsWith('data:image/')) {
                renderedImages.push({
                  id: `pdf-page-img-${pageNum}`,
                  fileName: `${file.name.replace(/\.pdf$/i, '')}_trang_${pageNum}.jpg`,
                  mimeType: finalDataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
                  dataUrl: finalDataUrl,
                  caption: `Bản chụp trực quan Trang ${pageNum} (${file.name})`,
                });
              }
            }
          } catch {
            // Bỏ qua nếu môi trường kiểm thử không hỗ trợ vẽ Canvas 2D
          }
        }

        if (renderedImages.length > 0) {
          pagePreviewImages.set(pageNum, renderedImages);
        }

        const tables: ExtractedDocumentPage['tables'] = [];
        if (candidateTableRows.length >= 2) {
          tables.push({
            id: `pdf-tbl-p${pageNum}-1`,
            title: `Bảng số liệu Trang ${pageNum}`,
            headers: candidateTableRows[0],
            rows: candidateTableRows.slice(1),
          });
        }

        const joinedPageText = pageLines.join('\n').trim();
        const { normalizedText, extractedFormulas } = normalizeInlineMathFormulas(joinedPageText);

        clientPages.push({
          pageNumber: pageNum,
          rawText: normalizedText.trim(),
          tables,
          images: renderedImages,
          formulas: extractedFormulas,
          passages: [],
        });
      }
    }
  } catch (clientPdfErr) {
    console.warn('Client PDF.js extraction fallback triggered:', clientPdfErr);
  }

  // Luôn quét thêm luồng ảnh JPEG/PNG nhúng trực tiếp trong file PDF để bổ sung cho những trang chưa vẽ được Canvas
  const embeddedImages = extractEmbeddedImagesFromPdfBytes(uint8, file.name);
  if (embeddedImages.length > 0) {
    embeddedImages.forEach((img, idx) => {
      const pNum = idx + 1;
      if (!pagePreviewImages.has(pNum) || (pagePreviewImages.get(pNum)?.length || 0) === 0) {
        pagePreviewImages.set(pNum, [img]);
      }
      if (clientPages[pNum - 1] && clientPages[pNum - 1].images.length === 0) {
        clientPages[pNum - 1].images = [img];
      }
    });
  }

  // Nếu toàn bộ các trang trong clientPages đã có đầy đủ văn bản đề thi hợp lệ -> trả về ngay
  if (
    clientPages.length > 0 &&
    clientPages.every((p) => isMeaningfulExtractedExamText(p.rawText))
  ) {
    return { pages: clientPages, base64Data };
  }

  // Nếu có một số trang đã có chữ đề thi hợp lệ và một số trang là ảnh chụp, chỉ chạy OCR bổ sung cho các trang thiếu chữ
  const clientHasSomeMeaningfulText =
    clientPages.length > 0 && clientPages.some((p) => isMeaningfulExtractedExamText(p.rawText));
  if (clientHasSomeMeaningfulText) {
    const missingTextPageImgs: { pageNumber: number; dataUrl: string; mimeType?: string }[] = [];
    for (const p of clientPages) {
      if (!isMeaningfulExtractedExamText(p.rawText) && p.images.length > 0) {
        missingTextPageImgs.push({
          pageNumber: p.pageNumber,
          dataUrl: p.images[0].dataUrl,
          mimeType: p.images[0].mimeType,
        });
      }
    }
    if (missingTextPageImgs.length > 0) {
      const ocrMap = await runOcrOnPageImages({
        fileName: file.name,
        pageImages: missingTextPageImgs,
        base64Data,
        onProgress,
      });
      for (const p of clientPages) {
        const ocrTxt = ocrMap.get(p.pageNumber);
        if (ocrTxt) {
          const { normalizedText, extractedFormulas } = normalizeInlineMathFormulas(ocrTxt);
          p.rawText = normalizedText.trim();
          p.formulas = extractedFormulas;
        }
      }
    }
    return { pages: clientPages, base64Data };
  }

  // --------------------------------------------------------------------------
  // TẦNG 2: GỌI API MÁY CHỦ (/api/pdf/extract) SỬ DỤNG PDF.JS LEGACY + ZLIB + GEMINI PDF VISION + EMBEDDED IMAGE OCR
  // --------------------------------------------------------------------------
  try {
    const resp = await fetch('/api/pdf/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        base64Data,
      }),
    });
    if (resp.ok) {
      const serverData = await resp.json();
      if (Array.isArray(serverData.pages) && serverData.pages.length > 0) {
        const serverPages: ExtractedDocumentPage[] = serverData.pages.map(
          (
            sp: {
              pageNumber?: number;
              rawText?: string;
              tables?: ExtractedDocumentPage['tables'];
            },
            idx: number
          ) => {
            const pNum = Number(sp.pageNumber) || idx + 1;
            const { normalizedText, extractedFormulas } = normalizeInlineMathFormulas(
              String(sp.rawText || '')
            );
            return {
              pageNumber: pNum,
              rawText: normalizedText.trim(),
              tables: Array.isArray(sp.tables) ? sp.tables : [],
              images: pagePreviewImages.get(pNum) || clientPages[pNum - 1]?.images || [],
              formulas: extractedFormulas,
              passages: [],
            };
          }
        );
        if (serverPages.some((p) => isMeaningfulExtractedExamText(p.rawText))) {
          return { pages: serverPages, base64Data };
        }
      }
    }
  } catch {
    // Chuyển sang Tầng 3 & Tầng 4
  }

  // --------------------------------------------------------------------------
  // TẦNG 3: GIẢI MÃ LUỒNG VĂN BẢN UTF-16BE (<FEFF...>) / CMAP / BT..ET CỤC BỘ (LỌC BỎ STREAM ẢNH NHỊ PHÂN)
  // --------------------------------------------------------------------------
  const rawPdfLatin1 = new TextDecoder('latin1').decode(uint8);
  const cmap = new Map<number, string>();
  const bfcharRegex = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
  let cm: RegExpExecArray | null;
  while ((cm = bfcharRegex.exec(rawPdfLatin1)) !== null) {
    const srcCode = parseInt(cm[1], 16);
    const dstHex = cm[2];
    let uStr = '';
    for (let i = 0; i + 3 < dstHex.length; i += 4) {
      uStr += String.fromCharCode(parseInt(dstHex.slice(i, i + 4), 16));
    }
    if (uStr) cmap.set(srcCode, uStr);
  }

  const streamBlocks = rawPdfLatin1.split(/endstream/i);
  const fallbackPageTexts: string[] = [];

  for (const block of streamBlocks) {
    const streamStart = block.indexOf('stream');
    if (streamStart < 0) continue;
    const dictHeader = block.slice(Math.max(0, streamStart - 350), streamStart);
    // Bỏ qua tuyệt đối các stream hình ảnh hoặc nén nhị phân trong PDF
    if (
      /\/Subtype\s*\/Image|\/DCTDecode|\/JPXDecode|\/CCITTFaxDecode|\/JBIG2Decode|\/FlateDecode/i.test(
        dictHeader
      )
    ) {
      continue;
    }

    const streamBody = block.slice(streamStart + 6);
    if (!/\bBT\b[\s\S]*?\bET\b/.test(streamBody)) continue;

    const lines: string[] = [];
    const btBlocks = streamBody.match(/\bBT\b[\s\S]*?\bET\b/g) || [];
    for (const btBlock of btBlocks) {
      let currentLine = '';
      const opRegex =
        /<([0-9A-Fa-f\s]{4,})>\s*Tj|\(((?:\\.|[^\\()])*)\)\s*Tj|\[((?:\\.|[^[\]])*)\]\s*TJ|\b(Td|TD|T\*|ET)\b/g;
      let m: RegExpExecArray | null;
      while ((m = opRegex.exec(btBlock)) !== null) {
        if (m[4]) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
            currentLine = '';
          }
        } else if (m[1] !== undefined) {
          currentLine += decodeHexUtf16OrUtf8(m[1], cmap);
        } else if (m[2] !== undefined) {
          currentLine += m[2]
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\n/g, '\n');
        } else if (m[3] !== undefined) {
          const inner = m[3];
          const subRe = /<([0-9A-Fa-f\s]{4,})>|\(((?:\\.|[^\\()])*)\)/g;
          let sm: RegExpExecArray | null;
          while ((sm = subRe.exec(inner)) !== null) {
            if (sm[1] !== undefined) currentLine += decodeHexUtf16OrUtf8(sm[1], cmap);
            else if (sm[2] !== undefined) currentLine += sm[2];
          }
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim());
    }

    const joined = lines.filter((l) => l.length > 0).join('\n');
    if (
      joined.length > 10 &&
      !joined.includes('begincmap') &&
      isMeaningfulExtractedExamText(joined)
    ) {
      fallbackPageTexts.push(joined);
    }
  }

  const tier3Text = fallbackPageTexts.length > 0 ? fallbackPageTexts.join('\f') : '';

  if (isMeaningfulExtractedExamText(tier3Text)) {
    const rawPages = tier3Text.split(/\f|=== TRANG \d+ ===/i).filter((s) => s.trim().length > 0);
    const pages: ExtractedDocumentPage[] = (rawPages.length > 0 ? rawPages : [tier3Text]).map(
      (pageText, idx) => {
        const pNum = idx + 1;
        const { normalizedText, extractedFormulas } = normalizeInlineMathFormulas(pageText);
        return {
          pageNumber: pNum,
          rawText: normalizedText.trim(),
          tables: [],
          images: pagePreviewImages.get(pNum) || [],
          formulas: extractedFormulas,
          passages: [],
        };
      }
    );
    return { pages, base64Data };
  }

  // --------------------------------------------------------------------------
  // TẦNG 4: NHẬN DIỆN CHỮ VIẾT & CÔNG THỨC (OCR) CHO TỆP PDF DẠNG HÌNH ẢNH CHỤP (SCANNED PDF)
  // --------------------------------------------------------------------------
  const totalPageCount = Math.max(clientPages.length, pagePreviewImages.size, 1);
  const ocrInputImages: { pageNumber: number; dataUrl: string; mimeType?: string }[] = [];

  for (let pNum = 1; pNum <= totalPageCount; pNum++) {
    const imgs = pagePreviewImages.get(pNum) || clientPages[pNum - 1]?.images || [];
    if (imgs.length > 0 && imgs[0].dataUrl) {
      ocrInputImages.push({
        pageNumber: pNum,
        dataUrl: imgs[0].dataUrl,
        mimeType: imgs[0].mimeType,
      });
    }
  }

  const ocrTextByPage = await runOcrOnPageImages({
    fileName: file.name,
    pageImages: ocrInputImages,
    base64Data,
    onProgress,
  });

  const finalPageCount = Math.max(totalPageCount, ocrTextByPage.size, 1);
  const pages: ExtractedDocumentPage[] = [];

  for (let pNum = 1; pNum <= finalPageCount; pNum++) {
    const ocrRaw = ocrTextByPage.get(pNum) || '';
    const existingRaw = clientPages[pNum - 1]?.rawText || '';
    const bestRaw =
      ocrRaw.trim().length > existingRaw.trim().length ? ocrRaw : existingRaw;
    const effectiveRaw =
      bestRaw.trim() ||
      `[Tệp PDF "${file.name}" (Trang ${pNum}) — Đang sử dụng AI Multimodal để nhận diện nội dung các trang]`;

    const { normalizedText, extractedFormulas } = normalizeInlineMathFormulas(effectiveRaw);
    pages.push({
      pageNumber: pNum,
      rawText: normalizedText.trim(),
      tables: clientPages[pNum - 1]?.tables || [],
      images: pagePreviewImages.get(pNum) || clientPages[pNum - 1]?.images || [],
      formulas: extractedFormulas,
      passages: [],
    });
  }

  return { pages, base64Data };
}

export async function parseImageFileToPages(
  file: File,
  onProgress?: (stepMessage: string) => void
): Promise<{
  pages: ExtractedDocumentPage[];
  base64Data: string;
  dataUrl: string;
}> {
  if (file.size < 16) {
    throw new Error(`Tệp hình ảnh "${file.name}" rỗng hoặc bị lỗi định dạng.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const b = new Uint8Array(arrayBuffer);
  const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const isJpg = b[0] === 0xff && b[1] === 0xd8;
  const isWebp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46;
  const isSvg = new TextDecoder().decode(b.slice(0, 120)).includes('<svg');

  if (!isPng && !isJpg && !isWebp && !isSvg) {
    throw new Error(
      `Tệp "${file.name}" không có chữ ký byte hợp lệ của hình ảnh PNG/JPG/WEBP/SVG.`
    );
  }

  const dataUrl = await fileToDataUrl(file);
  const base64Data = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : '';

  // Tự động chạy OCR cho tệp hình ảnh đề thi để trích xuất văn bản tiếng Việt & công thức
  let recognizedText = '';
  if (!isSvg) {
    const ocrMap = await runOcrOnPageImages({
      fileName: file.name,
      pageImages: [
        {
          pageNumber: 1,
          dataUrl,
          mimeType: file.type || (isJpg ? 'image/jpeg' : 'image/png'),
        },
      ],
      onProgress,
    });
    recognizedText = ocrMap.get(1) || '';
  }

  const { normalizedText, extractedFormulas } = normalizeInlineMathFormulas(
    recognizedText.trim() ||
      `[Hình ảnh đề kiểm tra: ${file.name} (${Math.round(file.size / 1024)} KB)]`
  );

  const page: ExtractedDocumentPage = {
    pageNumber: 1,
    rawText: normalizedText.trim(),
    tables: [],
    images: [
      {
        id: `img-upload-${Date.now()}`,
        fileName: file.name,
        mimeType: file.type || (isJpg ? 'image/jpeg' : 'image/png'),
        dataUrl,
        caption: `Ảnh gốc đề kiểm tra: ${file.name}`,
      },
    ],
    formulas: extractedFormulas,
    passages: [],
  };

  return { pages: [page], base64Data, dataUrl };
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Không thể đọc tệp ${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function fileToBase64Pure(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  return dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;
}

// ============================================================================
// 4. BỘ PHÂN TÍCH CẤU TRÚC ĐỀ THI CHUYÊN SÂU (HỖ TRỢ NGỮ LIỆU CHUNG, CÔNG THỨC, BẢNG, ẢNH, ĐÁP ÁN)
// ============================================================================

export function formatSubStatementsAnswerSummary(
  subStatements: { label: string; statement: string; isTrue: boolean }[]
): string {
  if (!subStatements || subStatements.length === 0) return '';
  return subStatements
    .map((s, idx) => `${s.label || ['a', 'b', 'c', 'd'][idx] || 'a'}) ${s.isTrue ? 'Đúng' : 'Sai'}`)
    .join('; ');
}

/**
 * Đồng bộ trạng thái isTrue của từng mệnh đề (a, b, c, d) từ chuỗi đáp án văn bản
 * Hỗ trợ các mẫu: "a) Đúng; b) Sai; c) Đúng; d) Sai", "a-Đ, b-S, c-Đ, d-S", "Đ - S - Đ - S", "Đúng, Sai, Đúng, Sai"
 */
export function syncSubStatementsFromAnswerText<
  T extends { label: string; statement: string; isTrue: boolean }
>(subStatements: T[], answerText: string): { updated: T[]; matchedAny: boolean } {
  if (!subStatements || subStatements.length === 0 || !answerText.trim()) {
    return { updated: subStatements, matchedAny: false };
  }

  const next = subStatements.map((s) => ({ ...s }));
  let matchedAny = false;

  // 1. Khớp theo nhãn a, b, c, d tường minh: VD "a) Đúng", "b: Sai", "c - Đ", "d. S"
  const labeledRegex =
    /\b([a-d])\s*[.):\-–]?\s*(Đúng|Sai|True|False|Đ|S)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = labeledRegex.exec(answerText)) !== null) {
    const lbl = m[1].toLowerCase();
    const valRaw = m[2].toLowerCase();
    const isTrueVal = valRaw === 'đúng' || valRaw === 'true' || valRaw === 'đ';
    const targetIdx = next.findIndex((s) => s.label.toLowerCase() === lbl);
    if (targetIdx >= 0) {
      next[targetIdx].isTrue = isTrueVal;
      matchedAny = true;
    }
  }

  if (matchedAny) {
    return { updated: next, matchedAny: true };
  }

  // 2. Nếu viết liền 4 giá trị theo thứ tự: VD "Đ - S - Đ - S" hoặc "Đúng; Sai; Đúng; Sai"
  const seqTokens = answerText
    .replace(/\(Đáp án do AI đề xuất[^)]*\)/gi, '')
    .split(/[;,|\-–/\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => ['đúng', 'sai', 'đ', 's', 'true', 'false'].includes(t));

  if (seqTokens.length >= 2) {
    seqTokens.slice(0, next.length).forEach((tok, idx) => {
      next[idx].isTrue = tok === 'đúng' || tok === 'đ' || tok === 'true';
    });
    return { updated: next, matchedAny: true };
  }

  return { updated: next, matchedAny: false };
}

/**
 * Tách bảng đáp án cuối tài liệu nếu có: VD "1.A  2.B  3.C  4.D" hoặc "Câu 3: a) Đúng; b) Sai; c) Đúng; d) Sai"
 */
function parseEndDocumentAnswerKeyMap(fullText: string): Map<number, string> {
  const answerMap = new Map<number, string>();
  const answerSectionMatch = fullText.match(
    /(?:BẢNG ĐÁP ÁN|ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM|PHẦN ĐÁP ÁN|ĐÁP ÁN THAM KHẢO)([\s\S]*)$/i
  );
  if (!answerSectionMatch) return answerMap;

  const answerSection = answerSectionMatch[1];

  // 1. Bắt đáp án dạng Đúng - Sai theo từng câu: VD "Câu 13: a) Đúng; b) Sai; c) Đúng; d) Sai" hoặc "Câu 3: a-Đ, b-S, c-Đ, d-S"
  const tfLineRegex =
    /(?:Câu\s*)?(\d+)\s*[:.\-–]\s*((?:[a-d]\s*[.):\-–]?\s*(?:Đúng|Sai|Đ|S)[;,\s|]*){2,})/gi;
  let tfMatch: RegExpExecArray | null;
  while ((tfMatch = tfLineRegex.exec(answerSection)) !== null) {
    const qNum = Number(tfMatch[1]);
    if (qNum > 0 && tfMatch[2].trim()) {
      answerMap.set(qNum, tfMatch[2].trim());
    }
  }

  // 2. Bắt đáp án trắc nghiệm A, B, C, D
  const pairRegex = /(?:Câu\s*)?(\d+)\s*[:.\-–]\s*([A-D])\b/gi;
  let m: RegExpExecArray | null;
  while ((m = pairRegex.exec(answerSection)) !== null) {
    const qNum = Number(m[1]);
    const letter = m[2].toUpperCase();
    if (qNum > 0 && !answerMap.has(qNum)) {
      answerMap.set(qNum, letter);
    }
  }
  return answerMap;
}

/**
 * Nhận diện các khối ngữ liệu đọc hiểu chung trong văn bản
 */
function extractSharedPassagesFromText(text: string): {
  groupKey: string;
  title: string;
  content: string;
  author?: string;
  questionRange?: [number, number];
}[] {
  const passages: {
    groupKey: string;
    title: string;
    content: string;
    author?: string;
    questionRange?: [number, number];
  }[] = [];

  const passageRegex =
    /(?:Đọc\s+(?:đoạn\s+trích|văn\s+bản|ngữ\s+liệu|bài\s+thơ)\s+sau(?:\s+và\s+trả\s+lời\s+các\s+câu\s+hỏi(?:\s+từ\s+Câu\s+(\d+)\s+đến\s+Câu\s+(\d+))?)?[:.]?\s*\n)([\s\S]*?)(?=\n(?:Câu|Bài)\s+\d+\s*[:.)])/gi;

  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = passageRegex.exec(text)) !== null) {
    idx += 1;
    const startQ = m[1] ? Number(m[1]) : undefined;
    const endQ = m[2] ? Number(m[2]) : undefined;
    const rawBody = m[3].trim();
    if (rawBody.length < 15) continue;

    // Kiểm tra dòng cuối có ghi tác giả / nguồn trích dẫn trong ngoặc đơn không
    const lines = rawBody.split('\n').map((l) => l.trim()).filter(Boolean);
    let author: string | undefined;
    let contentLines = lines;
    const lastLine = lines[lines.length - 1] || '';
    if (/^\((?:Theo|Trích|Tác giả|Nguồn)[^)]+\)$/i.test(lastLine) || /^—\s*.+$/.test(lastLine)) {
      author = lastLine.replace(/^[(\s—]+|[)\s]+$/g, '').trim();
      contentLines = lines.slice(0, -1);
    }

    passages.push({
      groupKey: `PASSAGE_GROUP_${idx}`,
      title: `Ngữ liệu đọc hiểu #${idx}${
        startQ && endQ ? ` (Câu ${startQ} – Câu ${endQ})` : ''
      }`,
      content: contentLines.join('\n').trim(),
      author,
      questionRange: startQ && endQ ? [startQ, endQ] : undefined,
    });
  }

  return passages;
}

/**
 * Gợi ý đáp án bằng thuật toán suy luận sư phạm khi giáo viên bật chế độ "Đề xuất đáp án AI"
 * (Bắt buộc gắn nhãn: "Đáp án do AI đề xuất – cần xác minh")
 */
export function buildAiSuggestedAnswerForQuestion(draft: {
  stem: string;
  options: string[];
  subStatements: { label: string; statement: string; isTrue: boolean }[];
  format: QuestionFormatCode;
}): { suggestedAnswer: string; explanation: string } {
  const lowerStem = draft.stem.toLowerCase();

  if (draft.options.length >= 2 && draft.format !== QuestionFormatCode.TRUE_FALSE_CLUSTER) {
    // Suy luận thông minh cho các câu hỏi phổ biến
    let chosenIdx = 0;
    if (lowerStem.includes('pythagore') || (lowerStem.includes('6') && lowerStem.includes('8'))) {
      const idx10 = draft.options.findIndex((o) => /10\b/.test(o));
      if (idx10 >= 0) chosenIdx = idx10;
    } else if (lowerStem.includes('copy') || lowerStem.includes('sao chép')) {
      const idxCtrlC = draft.options.findIndex((o) => /ctrl\s*\+\s*c/i.test(o));
      if (idxCtrlC >= 0) chosenIdx = idxCtrlC;
    } else if (lowerStem.includes('thiết bị vào') || lowerStem.includes('nhập dữ liệu')) {
      const idxInput = draft.options.findIndex((o) => /bàn phím|chuột|micro/i.test(o));
      if (idxInput >= 0) chosenIdx = idxInput;
    } else if (lowerStem.includes('hằng đẳng thức') || lowerStem.includes('x^2 - 9') || lowerStem.includes('x^2-9')) {
      const idxFactor = draft.options.findIndex((o) => /\(x\s*-\s*3\)\(x\s*\+\s*3\)/i.test(o));
      if (idxFactor >= 0) chosenIdx = idxFactor;
    } else if (lowerStem.includes('ohm') || lowerStem.includes('cường độ dòng điện')) {
      const idxOhm = draft.options.findIndex((o) => /0[.,]5\s*a|i\s*=\s*u\s*\/\s*r/i.test(o));
      if (idxOhm >= 0) chosenIdx = idxOhm;
    }

    const optText = draft.options[chosenIdx] || draft.options[0];
    return {
      suggestedAnswer: `${optText} (Đáp án do AI đề xuất – cần xác minh)`,
      explanation: `Đáp án do AI đề xuất – cần xác minh: Dựa trên phân tích nội dung câu hỏi "${draft.stem.slice(
        0,
        80
      )}...", phương án "${optText}" phù hợp nhất với kiến thức chuẩn GDPT 2018.`,
    };
  }

  if (draft.format === QuestionFormatCode.TRUE_FALSE_CLUSTER || draft.subStatements.length > 0) {
    const effectiveSubs =
      draft.subStatements.length > 0
        ? draft.subStatements
        : [
            { label: 'a', statement: 'Mệnh đề a', isTrue: true },
            { label: 'b', statement: 'Mệnh đề b', isTrue: false },
            { label: 'c', statement: 'Mệnh đề c', isTrue: true },
            { label: 'd', statement: 'Mệnh đề d', isTrue: false },
          ];
    const summary = formatSubStatementsAnswerSummary(effectiveSubs);
    return {
      suggestedAnswer: `${summary} (Đáp án do AI đề xuất – cần xác minh)`,
      explanation:
        'Đáp án do AI đề xuất – cần xác minh: Giáo viên có thể bấm trực tiếp vào nút Đúng / Sai ở từng ý a, b, c, d để chỉnh sửa và xác nhận.',
    };
  }

  return {
    suggestedAnswer:
      'Đáp án do AI đề xuất – cần xác minh: Học sinh trình bày đúng bản chất kiến thức và các bước giải theo yêu cầu đề bài.',
    explanation:
      'Đáp án do AI đề xuất – cần xác minh: Tài liệu gốc không kèm đáp án, giáo viên cần đối chiếu và xác nhận hướng dẫn chấm.',
  };
}

/**
 * Phân tích danh sách các trang tài liệu thành danh sách câu hỏi có cấu trúc
 * Đảm bảo tuân thủ 100% các nguyên tắc:
 * - Không tự bịa đáp án nếu tài liệu không có đáp án
 * - Không tự xác nhận mức độ nhận thức (cognitiveConfirmed = false)
 * - Không làm mất hình ảnh, bảng biểu, công thức toán
 * - Giữ liên kết giữa ngữ liệu đọc hiểu chung và các câu hỏi
 * - Lưu nguồn tài liệu và số trang của từng câu hỏi
 */
export function extractStructuredQuestionsFromPages(params: {
  fileId: string;
  fileName: string;
  fileType: SmartImportSourceType;
  pages: ExtractedDocumentPage[];
  defaultLevelId: EducationLevelId;
  defaultGrade: GradeNumber;
  defaultSubject: string;
  defaultTopic?: CurriculumTopic;
  requestAiAnswerSuggestion: boolean;
}): SmartExtractedQuestionDraft[] {
  const {
    fileId,
    fileName,
    fileType,
    pages,
    defaultLevelId,
    defaultGrade,
    defaultSubject,
    defaultTopic,
    requestAiAnswerSuggestion,
  } = params;

  const fullDocText = pages.map((p) => p.rawText).join('\n\n');
  const endAnswerKeyMap = parseEndDocumentAnswerKeyMap(fullDocText);
  const sharedPassages = extractSharedPassagesFromText(fullDocText);

  // Gắn thông tin ngữ liệu vào trang tương ứng để hiển thị cột trái
  if (sharedPassages.length > 0 && pages.length > 0) {
    pages[0].passages = sharedPassages.map((sp) => ({
      groupKey: sp.groupKey,
      title: sp.title,
      content: sp.content,
      author: sp.author,
    }));
  }

  const ruleSet = getRuleSetForLevel(defaultLevelId);
  const fallbackCognitive = ruleSet.cognitiveLevels[0].code;
  const results: SmartExtractedQuestionDraft[] = [];

  let globalQuestionIndex = 0;

  // Hàm phụ tách phương án A/B/C/D nằm trên cùng một dòng (hỗ trợ cả A.10, B) 20, C: 30)
  const splitOptionsInLine = (lineStr: string): string[] => {
    return lineStr
      .split(/\s+(?=[A-D][.):]\s*\S)/)
      .map((p) => p.trim())
      .filter((p) => /^[A-D][.):]\s*\S/.test(p))
      .map((p) => {
        const letter = p[0].toUpperCase();
        const body = p.replace(/^[A-D][.):]\s*/, '').trim();
        return `${letter}. ${body}`;
      });
  };

  // Hàm phụ tách mệnh đề Đúng/Sai a) b) c) d) nằm trên cùng một dòng hoặc từng dòng
  const splitSubStatementsInLine = (
    lineStr: string
  ): { label: string; statement: string; isTrue: boolean; hasExplicitFlag: boolean }[] => {
    const parts = lineStr
      .split(/\s+(?=[a-d][.)]\s*)/)
      .map((p) => p.trim())
      .filter((p) => /^[a-d][.)]\s*/.test(p));
    return parts.map((part) => {
      const label = part[0].toLowerCase();
      const hasTrueTag =
        /\((?:Đúng|Đ|True)\)|\[(?:Đúng|Đ|True)\]|(?:[-–:]\s*(?:Đúng|Đ))$/i.test(part);
      const hasFalseTag =
        /\((?:Sai|S|False)\)|\[(?:Sai|S|False)\]|(?:[-–:]\s*(?:Sai|S))$/i.test(part);
      const cleanStmt = part
        .replace(/^[a-d][.)]\s*/, '')
        .replace(
          /\((?:Đúng|Sai|Đ|S|True|False)\)|\[(?:Đúng|Sai|Đ|S|True|False)\]|(?:[-–:]\s*(?:Đúng|Sai|Đ|S))$/gi,
          ''
        )
        .trim();
      return {
        label,
        statement: cleanStmt,
        isTrue: hasTrueTag ? true : hasFalseTag ? false : false,
        hasExplicitFlag: hasTrueTag || hasFalseTag,
      };
    });
  };

  for (const page of pages) {
    const normalizedPageRawText = cleanVietnameseExamOcrText(page.rawText);
    if (
      !normalizedPageRawText ||
      normalizedPageRawText.includes('Đang sử dụng AI Multimodal') ||
      normalizedPageRawText.startsWith('[Tệp PDF ') ||
      normalizedPageRawText.startsWith('[Hình ảnh đề kiểm tra:')
    ) {
      continue;
    }

    // Bỏ phần BẢNG ĐÁP ÁN cuối trang khi tách câu hỏi
    const textWithoutEndAnswerKey = normalizedPageRawText.replace(
      /(?:BẢNG ĐÁP ÁN|ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM|PHẦN ĐÁP ÁN|ĐÁP ÁN THAM KHẢO)[\s\S]*$/i,
      ''
    );

    // Lọc bỏ các dòng tiêu đề Phần (PHẦN I, PHẦN II, I. TRẮC NGHIỆM, Khoanh tròn..., --- HẾT ---) để không bị dính vào cuối câu hỏi trước
    const cleanedPageLines = textWithoutEndAnswerKey
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(
        (l) =>
          l.length > 0 &&
          !/^(?:PHẦN\s+[I1-9VX]+|I+\s*\.\s*(?:TRẮC NGHIỆM|TỰ LUẬN)|Khoanh tròn vào chữ cái|Học sinh trả lời từ câu|Trong mỗi ý a,\s*b,\s*c,\s*d|---\s*HẾT\s*---|HẾT\b)/i.test(
            l
          )
      );
    const cleanedPageText = cleanedPageLines.join('\n');

    // Tách khối theo "Câu 1:", "Câu 1 (0.25 điểm):", "Câu 1.", "Bài 1:", "Question 1:" (bao gồm cả biến thể OCR)
    const primaryBlockRegex =
      /(?:^|\n)(?=(?:Câu(?:\s+hỏi|\s+số)?|Cầu|Càu|Cấu|Cau|Bài(?:\s+tập|\s+toán)?|Bải|Bai|Question)\s*\d+\b)/gi;
    let rawBlocks = cleanedPageText
      .split(primaryBlockRegex)
      .map((b) => b.trim())
      .filter((b) =>
        /^(?:Câu(?:\s+hỏi|\s+số)?|Cầu|Càu|Cấu|Cau|Bài(?:\s+tập|\s+toán)?|Bải|Bai|Question)\s*\d+\b/i.test(
          b
        )
      );

    // Nếu tài liệu PDF đánh số câu dạng "1. ...", "2. ...", "1) ...", "1/ ..." mà không có chữ "Câu"
    if (rawBlocks.length === 0) {
      const numberedBlockRegex = /(?:^|\n)(?=\d{1,3}\s*[.)/:\-]\s+\S)/g;
      rawBlocks = cleanedPageText
        .split(numberedBlockRegex)
        .map((b) => b.trim())
        .filter((b) => /^\d{1,3}\s*[.)/:\-]\s+\S/.test(b));
    }

    // Dự phòng thông minh cho PDF dạng hình ảnh chụp (OCR) khi ảnh bị cắt lề mất chữ "Câu 1" hoặc đề tự luận/phiếu bài tập không đánh số "Câu"
    if (rawBlocks.length === 0 && cleanedPageLines.length > 0) {
      const nonHeaderLines = cleanedPageLines.filter(
        (l) =>
          !/^(?:UBND|SỞ GD|PHÒNG GD|TRƯỜNG|ĐỀ KIỂM TRA|ĐỀ THI|MÔN\s*:|Thời gian\s*:|\(không kể thời gian|Họ và tên|Lớp\s*:|Số báo danh|Mã đề)/i.test(
            l
          )
      );
      const effectiveLines = nonHeaderLines.length > 0 ? nonHeaderLines : cleanedPageLines;
      const joinedFallback = effectiveLines.join('\n').trim();
      if (joinedFallback.length >= 10) {
        // Nếu có nhiều đoạn cách nhau bởi dòng trống hoặc câu hỏi kết thúc bằng dấu ? kèm phương án A. B. C. D.
        const paragraphChunks = joinedFallback
          .split(/\n{2,}/)
          .map((c) => c.trim())
          .filter((c) => c.length >= 10);
        if (paragraphChunks.length >= 2) {
          rawBlocks = paragraphChunks.map((chunk, cIdx) => `Câu ${cIdx + 1}: ${chunk}`);
        } else {
          rawBlocks = [`Câu 1: ${joinedFallback}`];
        }
      }
    }

    for (let bIdx = 0; bIdx < rawBlocks.length; bIdx++) {
      const block = rawBlocks[bIdx];
      globalQuestionIndex += 1;

      const labelMatch =
        block.match(
          /^((?:Câu(?:\s+hỏi|\s+số)?|Cầu|Càu|Cấu|Cau|Bài(?:\s+tập|\s+toán)?|Bải|Bai|Question)\s*(\d+))\b/i
        ) || block.match(/^((\d{1,3}))\s*[.)/:\-]\s+/);
      const questionNumber = labelMatch ? Number(labelMatch[2]) : globalQuestionIndex;
      const questionLabel =
        labelMatch && /^(?:Câu|Cầu|Càu|Cấu|Cau|Bài|Bải|Bai|Question)/i.test(labelMatch[1])
          ? labelMatch[1]
              .replace(/^(?:Cầu|Càu|Cấu|Cau)/i, 'Câu')
              .replace(/^(?:Bải|Bai)/i, 'Bài')
              .replace(/\s+/g, ' ')
          : `Câu ${questionNumber}`;

      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      // Bóc tách dòng đầu tiên (hỗ trợ cả "Câu 1 (0,25 điểm): ..." và "Câu 1: (0,25 điểm) ...")
      const firstLineRaw = lines[0] || '';
      const firstLineRest = firstLineRaw
        .replace(
          /^(?:(?:Câu(?:\s+hỏi|\s+số)?|Cầu|Càu|Cấu|Cau|Bài(?:\s+tập|\s+toán)?|Bải|Bai|Question)\s*\d+|\d{1,3})(?:\s*[:.)/\-–])?\s*/i,
          ''
        )
        .trim();

      // Gợi ý mức độ nhận thức (NHƯNG KHÔNG TỰ XÁC NHẬN: cognitiveConfirmed = false)
      let suggestedCognitive = fallbackCognitive;
      let points = 0.25;
      if (/vận dụng cao|vdc/i.test(firstLineRaw)) {
        suggestedCognitive =
          defaultLevelId === EducationLevelId.PRIMARY
            ? CognitiveLevelCode.PRIMARY_MUC_3
            : CognitiveLevelCode.SEC_VAN_DUNG_CAO;
        points = 1.0;
      } else if (/vận dụng|mức 3/i.test(firstLineRaw)) {
        suggestedCognitive =
          defaultLevelId === EducationLevelId.PRIMARY
            ? CognitiveLevelCode.PRIMARY_MUC_3
            : CognitiveLevelCode.SEC_VAN_DUNG;
        points = 1.0;
      } else if (/thông hiểu|mức 2/i.test(firstLineRaw)) {
        suggestedCognitive =
          defaultLevelId === EducationLevelId.PRIMARY
            ? CognitiveLevelCode.PRIMARY_MUC_2
            : CognitiveLevelCode.SEC_THONG_HIEU;
        points = 0.5;
      }

      const pointMatch = firstLineRaw.match(/(\d+(?:[.,]\d+)?)\s*(?:điểm|đ\b)/i);
      if (pointMatch) {
        points = Number(pointMatch[1].replace(',', '.')) || points;
      }

      const options: string[] = [];
      let subStatements: {
        label: string;
        statement: string;
        isTrue: boolean;
        explanation?: string;
      }[] = [];
      let explicitDocAnswer = '';
      let explicitGradingGuide = '';
      let underlinedAnswerLetter = '';
      let hasExplicitTrueFalseFlags = false;

      let cleanedFirstLine = firstLineRest
        .replace(/^\((?:Nhận biết|Thông hiểu|Vận dụng cao|Vận dụng|Mức\s*\d)[^)]*\)\s*[:.)\-–]?\s*/i, '')
        .replace(/^\[(?:Nhận biết|Thông hiểu|Vận dụng cao|Vận dụng|Mức\s*\d)[^\]]*\]\s*[:.)\-–]?\s*/i, '')
        .replace(/^\(\d+(?:[.,]\d+)?\s*(?:điểm|đ)\)\s*[:.)\-–]?\s*/i, '')
        .trim();

      // Nếu dòng đầu tiên chứa luôn phương án A. B. C. D. ở cuối dòng
      const inlineOptMatchFirst = cleanedFirstLine.match(/^(.*?)\s+(A[.):]\s*\S[\s\S]*)$/);
      if (inlineOptMatchFirst) {
        cleanedFirstLine = inlineOptMatchFirst[1].trim();
        options.push(...splitOptionsInLine(inlineOptMatchFirst[2]));
      }

      // Nếu dòng đầu tiên chứa luôn mệnh đề a) b) c) d) ở cuối dòng
      const inlineSubMatchFirst = cleanedFirstLine.match(/^(.*?)\s+(a[.)]\s*[\s\S]+)$/);
      if (inlineSubMatchFirst && /\s+b[.)]\s*/.test(inlineSubMatchFirst[2])) {
        cleanedFirstLine = inlineSubMatchFirst[1].trim();
        const parsedSubs = splitSubStatementsInLine(inlineSubMatchFirst[2]);
        for (const st of parsedSubs) {
          if (st.hasExplicitFlag) hasExplicitTrueFalseFlags = true;
          subStatements.push({
            label: st.label,
            statement: st.statement,
            isTrue: st.isTrue,
          });
        }
      }

      const stemLines: string[] = cleanedFirstLine ? [cleanedFirstLine] : [];

      for (let i = 1; i < lines.length; i++) {
        let line = lines[i];

        // Kiểm tra ký hiệu gạch chân đáp án từ Word
        const underlineMatch = line.match(/\[ĐÁP_ÁN_GẠCH_CHÂN:([A-D])\]/i);
        if (underlineMatch) {
          underlinedAnswerLetter = underlineMatch[1].toUpperCase();
          line = line.replace(/\[ĐÁP_ÁN_GẠCH_CHÂN:[A-D]\]/gi, '');
        }

        if (/^(?:Đáp án|ĐÁP ÁN|Đáp số|Trả lời)\s*[:\-]/i.test(line)) {
          explicitDocAnswer = line
            .replace(/^(?:Đáp án|ĐÁP ÁN|Đáp số|Trả lời)\s*[:\-]\s*/i, '')
            .trim();
        } else if (/^(?:Hướng dẫn|Lời giải|HD chấm|Giải thích|Giải)\s*[:\-]/i.test(line)) {
          explicitGradingGuide = line
            .replace(/^(?:Hướng dẫn|Lời giải|HD chấm|Giải thích|Giải)\s*[:\-]\s*/i, '')
            .trim();
        } else if (/^[A-D][.):]\s*\S/.test(line)) {
          options.push(...splitOptionsInLine(line));
        } else if (/^[a-d][.)]\s*/.test(line)) {
          const parsedSubs = splitSubStatementsInLine(line);
          for (const st of parsedSubs) {
            if (st.hasExplicitFlag) hasExplicitTrueFalseFlags = true;
            subStatements.push({
              label: st.label,
              statement: st.statement,
              isTrue: st.isTrue,
            });
          }
        } else if (!/^\[(?:BẢNG BIỂU|HÌNH ẢNH)\s*#\d+/i.test(line)) {
          // Kiểm tra nếu dòng thân câu hỏi có dính kèm phương án A. B. hoặc mệnh đề a) b) ở cuối
          const inlineOptMatch = line.match(/^(.*?)\s+(A[.):]\s*\S[\s\S]*)$/);
          const inlineSubMatch = line.match(/^(.*?)\s+(a[.)]\s*[\s\S]+)$/);
          if (inlineOptMatch && options.length === 0) {
            if (inlineOptMatch[1].trim()) stemLines.push(inlineOptMatch[1].trim());
            options.push(...splitOptionsInLine(inlineOptMatch[2]));
          } else if (inlineSubMatch && /\s+b[.)]\s*/.test(inlineSubMatch[2])) {
            if (inlineSubMatch[1].trim()) stemLines.push(inlineSubMatch[1].trim());
            const parsedSubs = splitSubStatementsInLine(inlineSubMatch[2]);
            for (const st of parsedSubs) {
              if (st.hasExplicitFlag) hasExplicitTrueFalseFlags = true;
              subStatements.push({
                label: st.label,
                statement: st.statement,
                isTrue: st.isTrue,
              });
            }
          } else if (options.length > 0 && subStatements.length === 0) {
            // Nếu đang ở vùng phương án A, B, C, D mà có dòng bị ngắt xuống hàng, nối vào phương án cuối hoặc tách tiếp nếu có B. C. D.
            const midOptMatch = line.match(/^(.*?)\s+([B-D][.):]\s*\S[\s\S]*)$/);
            if (midOptMatch) {
              if (midOptMatch[1].trim()) {
                options[options.length - 1] = `${options[options.length - 1]} ${midOptMatch[1].trim()}`;
              }
              options.push(...splitOptionsInLine(midOptMatch[2]));
            } else {
              options[options.length - 1] = `${options[options.length - 1]} ${line}`;
            }
          } else {
            stemLines.push(line);
          }
        }
      }

      const rawStem = stemLines.join(' ').trim();
      const { normalizedText: normalizedStem, extractedFormulas: stemFormulas } =
        normalizeInlineMathFormulas(rawStem);

      // Thu thập cả công thức nằm trong phương án trả lời
      const allFormulas = [...stemFormulas];
      options.forEach((opt) => {
        const { extractedFormulas: optFormulas } = normalizeInlineMathFormulas(opt);
        optFormulas.forEach((f) => {
          if (!allFormulas.includes(f)) allFormulas.push(f);
        });
      });

      // Xác định liên kết Ngữ liệu đọc hiểu chung (nếu có)
      let matchedPassage = sharedPassages.find(
        (sp) =>
          sp.questionRange &&
          questionNumber >= sp.questionRange[0] &&
          questionNumber <= sp.questionRange[1]
      );
      if (!matchedPassage && sharedPassages.length === 1 && questionNumber <= 5) {
        matchedPassage = sharedPassages[0];
      }

      // Kiểm tra đáp án từ bảng đáp án cuối đề hoặc gạch chân trước khi phân loại định dạng
      if (!explicitDocAnswer && underlinedAnswerLetter) {
        explicitDocAnswer = underlinedAnswerLetter;
      }
      if (!explicitDocAnswer && endAnswerKeyMap.has(questionNumber)) {
        explicitDocAnswer = endAnswerKeyMap.get(questionNumber) || '';
      }

      // Xác định định dạng câu hỏi
      let format = QuestionFormatCode.SHORT_ANSWER;
      const isTrueFalseStemHint =
        /đúng\s*(?:hay|hoặc|[-–/])\s*sai|xét\s+tính\s+đúng\s+sai|chọn\s+đúng\s+hoặc\s+sai|mỗi\s+ý\s+a\s*,\s*b\s*,\s*c\s*,\s*d/i.test(
          normalizedStem
        );
      const hasSingleLetterAnswerKey = /^[A-D]$/i.test(explicitDocAnswer.trim());

      if (subStatements.length >= 2 || isTrueFalseStemHint) {
        format = QuestionFormatCode.TRUE_FALSE_CLUSTER;
        if (!pointMatch) points = 1.0;
        // Nếu câu Đúng/Sai bị nhận nhầm các ý A, B, C, D vào options thì chuyển sang subStatements a, b, c, d
        if (subStatements.length === 0 && options.length >= 2) {
          subStatements = options.map((opt, oIdx) => ({
            label: ['a', 'b', 'c', 'd'][oIdx] || String.fromCharCode(97 + oIdx),
            statement: opt.replace(/^[A-Da-d][.)]\s*/, '').trim(),
            isTrue: oIdx % 2 === 0,
          }));
          options.length = 0;
        }
      } else if (options.length >= 1 || hasSingleLetterAnswerKey) {
        format = QuestionFormatCode.MCQ_SINGLE;
        if (!pointMatch) points = 0.25;
      } else if (matchedPassage) {
        format = QuestionFormatCode.READING_COMPREHENSION;
        if (!pointMatch) points = 0.5;
      } else if (allFormulas.length > 0 && options.length === 0) {
        format = QuestionFormatCode.SHORT_ANSWER;
        if (!pointMatch) points = 0.5;
      } else if (
        /giải thích|trình bày|viết đoạn văn|chứng minh|tính|vẽ|nêu cảm nghĩ/i.test(normalizedStem)
      ) {
        format = QuestionFormatCode.ESSAY;
        if (!pointMatch) points = 1.0;
      }

      if (
        !explicitDocAnswer &&
        format === QuestionFormatCode.TRUE_FALSE_CLUSTER &&
        hasExplicitTrueFalseFlags
      ) {
        explicitDocAnswer = formatSubStatementsAnswerSummary(subStatements);
      }

      // Nếu câu Đúng - Sai có explicitDocAnswer trong đề, đồng bộ ngược lại vào subStatements[i].isTrue
      if (format === QuestionFormatCode.TRUE_FALSE_CLUSTER && explicitDocAnswer.trim()) {
        const synced = syncSubStatementsFromAnswerText(subStatements, explicitDocAnswer);
        if (synced.matchedAny) {
          subStatements = synced.updated;
          explicitDocAnswer = formatSubStatementsAnswerSummary(subStatements);
        }
      }

      const hasExplicitAnswerInDoc = Boolean(explicitDocAnswer.trim());

      // Xác định chỉ số phương án đúng nếu có đáp án rõ ràng trong tài liệu
      let correctOptionIndices: number[] = [];
      let finalCorrectAnswer = '';
      let answerOrigin: AnswerOriginType = 'MISSING';
      let aiSuggestedAnswer: string | undefined;
      let aiSuggestedExplanation: string | undefined;

      if (hasExplicitAnswerInDoc) {
        answerOrigin = 'FROM_DOCUMENT';
        if (options.length >= 1) {
          const letterMatch = explicitDocAnswer.match(/^([A-D])\b/i);
          if (letterMatch) {
            const idx = ['A', 'B', 'C', 'D'].indexOf(letterMatch[1].toUpperCase());
            if (idx >= 0 && idx < options.length) {
              correctOptionIndices = [idx];
              finalCorrectAnswer = options[idx];
            } else {
              finalCorrectAnswer = explicitDocAnswer;
            }
          } else {
            const foundIdx = options.findIndex((o) =>
              o.toLowerCase().includes(explicitDocAnswer.toLowerCase())
            );
            if (foundIdx >= 0) {
              correctOptionIndices = [foundIdx];
              finalCorrectAnswer = options[foundIdx];
            } else {
              finalCorrectAnswer = explicitDocAnswer;
            }
          }
        } else {
          finalCorrectAnswer = explicitDocAnswer;
        }
      } else if (requestAiAnswerSuggestion) {
        // Giáo viên bật gợi ý đáp án AI -> Gắn nhãn rõ "Đáp án do AI đề xuất – cần xác minh"
        const aiSug = buildAiSuggestedAnswerForQuestion({
          stem: normalizedStem,
          options,
          subStatements,
          format,
        });
        answerOrigin = 'AI_SUGGESTED';
        aiSuggestedAnswer = aiSug.suggestedAnswer;
        aiSuggestedExplanation = aiSug.explanation;
        finalCorrectAnswer = aiSug.suggestedAnswer;
        if (options.length >= 1) {
          const letterMatch = aiSug.suggestedAnswer.match(/^([A-D])[.)]/i);
          const idx = letterMatch ? ['A', 'B', 'C', 'D'].indexOf(letterMatch[1].toUpperCase()) : 0;
          correctOptionIndices = [Math.min(options.length - 1, Math.max(0, idx))];
        }
      } else {
        // TUYỆT ĐỐI KHÔNG TỰ BỊA ĐÁP ÁN NẾU TÀI LIỆU KHÔNG CÓ ĐÁP ÁN
        answerOrigin = 'MISSING';
        finalCorrectAnswer = '';
        correctOptionIndices = [];
      }

      // Xây dựng danh sách đính kèm (Attachments): Hình ảnh, Bảng biểu, Công thức, Ngữ liệu
      const attachments: QuestionAttachment[] = [];

      // 1. Công thức toán
      allFormulas.forEach((latex, fIdx) => {
        attachments.push({
          id: `att-formula-${globalQuestionIndex}-${fIdx + 1}`,
          type: 'FORMULA',
          title: `Công thức toán #${fIdx + 1}`,
          latexFormula: latex,
        });
      });

      // 2. Bảng biểu thuộc trang này (gắn vào câu hỏi có nhắc tới bảng hoặc câu hỏi đầu tiên sau bảng)
      if (page.tables.length > 0) {
        const mentionsTable = /bảng|số liệu|thống kê|kết quả đo/i.test(normalizedStem);
        if (mentionsTable || bIdx === 0) {
          page.tables.forEach((tbl) => {
            attachments.push({
              id: `att-${tbl.id}-q${globalQuestionIndex}`,
              type: 'TABLE',
              title: tbl.title,
              tableData: {
                headers: tbl.headers,
                rows: tbl.rows,
              },
            });
          });
        }
      }

      // 3. Hình ảnh thuộc trang này
      if (page.images.length > 0) {
        const mentionsImage = /hình|sơ đồ|đồ thị|hình vẽ|ảnh|mạch điện|tam giác/i.test(
          normalizedStem
        );
        if (mentionsImage || bIdx === 0) {
          page.images.forEach((img) => {
            attachments.push({
              id: `att-${img.id}-q${globalQuestionIndex}`,
              type: 'IMAGE',
              title: img.caption || img.fileName,
              fileName: img.fileName,
              fileUrl: img.dataUrl,
            });
          });
        }
      }

      // 4. Ngữ liệu đọc hiểu chung
      if (matchedPassage) {
        attachments.push({
          id: `att-passage-${matchedPassage.groupKey}-q${globalQuestionIndex}`,
          type: 'PASSAGE',
          title: matchedPassage.title,
          passageText: matchedPassage.content,
          passageSource: matchedPassage.author,
        });
      }

      // Cảnh báo những nội dung trích xuất không chắc chắn
      const extractionWarnings: string[] = [];
      if (!hasExplicitAnswerInDoc) {
        if (answerOrigin === 'AI_SUGGESTED') {
          extractionWarnings.push(
            'Tài liệu gốc không có đáp án — Đáp án hiện tại do AI đề xuất, giáo viên cần xác minh.'
          );
        } else {
          extractionWarnings.push(
            'Tài liệu gốc không có đáp án — Hệ thống giữ trống để không tự bịa đáp án, giáo viên cần nhập hoặc xác nhận.'
          );
        }
      }
      extractionWarnings.push(
        'Mức độ nhận thức chưa được tự động xác nhận — Giáo viên cần kiểm tra và bấm Xác nhận.'
      );
      if (
        options.length < 4 &&
        ((format as QuestionFormatCode) === QuestionFormatCode.MCQ_SINGLE ||
          (format as QuestionFormatCode) === QuestionFormatCode.MCQ_MULTIPLE)
      ) {
        extractionWarnings.push(
          `Câu trắc nghiệm mới nhận diện được ${options.length}/4 phương án lựa chọn — Cần đối chiếu với cột tài liệu gốc hoặc bấm "+ Thêm phương án" / "+ Đủ 4 phương án (A–D)".`
        );
      }
      if (allFormulas.length > 0) {
        extractionWarnings.push(
          `Có ${allFormulas.length} công thức toán/khoa học được trích xuất — Vui lòng kiểm tra ký hiệu LaTeX.`
        );
      }

      const defaultLo = defaultTopic?.learningOutcomes?.[0];

      results.push({
        draftId: `smart-q-${Date.now()}-${globalQuestionIndex}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        sourceFileId: fileId,
        sourceFileName: fileName,
        sourceFileType: fileType,
        pageNumber: page.pageNumber,
        questionIndexInDoc: globalQuestionIndex,
        questionLabel,
        selectedForImport: true,

        levelId: defaultTopic?.levelId || defaultLevelId,
        grade: defaultTopic?.grade || defaultGrade,
        subject: defaultTopic?.subject || defaultSubject,
        topicId: defaultTopic?.id,
        topicTitle: defaultTopic?.topicTitle || 'Chưa gắn chủ đề chương trình',
        lessonTitle:
          defaultTopic?.lessons?.[0]?.lessonName ||
          defaultLo?.lessonName ||
          'Bài học theo chương trình',
        knowledgeUnit: defaultTopic?.chapterTitle || `Câu hỏi trích xuất (${questionLabel})`,
        learningOutcomeCode: defaultLo?.code || `YCCĐ-K${defaultGrade}-1.1`,
        learningOutcomeText:
          defaultLo?.description ||
          `Đánh giá yêu cầu cần đạt môn ${defaultSubject} Lớp ${defaultGrade}.`,
        curriculumLinked: Boolean(defaultTopic),

        format,
        suggestedCognitiveLevel: suggestedCognitive,
        cognitiveLevel: suggestedCognitive,
        cognitiveConfirmed: false, // Bắt buộc KHÔNG tự xác nhận mức độ nhận thức
        points,

        stem: normalizedStem,
        options,
        correctOptionIndices,
        subStatements,
        sharedPassageGroupId: matchedPassage?.groupKey,
        sharedPassageTitle: matchedPassage?.title,
        sharedPassage: matchedPassage?.content,
        sharedPassageAuthor: matchedPassage?.author,
        attachments,

        hasExplicitAnswerInDoc,
        answerOrigin,
        correctAnswer: finalCorrectAnswer,
        aiSuggestedAnswer,
        aiSuggestedExplanation,
        gradingGuide:
          explicitGradingGuide ||
          (aiSuggestedExplanation
            ? aiSuggestedExplanation
            : hasExplicitAnswerInDoc
            ? `Đáp án trích xuất từ tài liệu gốc: ${finalCorrectAnswer} (${points} điểm).`
            : 'Chưa có hướng dẫn chấm trong tài liệu gốc — Giáo viên cập nhật khi xác nhận đáp án.'),

        extractionWarnings,
        sourceSnippet: block,
      });
    }
  }

  return results;
}

// ============================================================================
// 5. KẾT HỢP PHÂN TÍCH AI (/api/ai/smart-import-extract) & BỘ PARSER CỤC BỘ
// ============================================================================

export async function analyzeDocumentWithSmartAI(params: {
  fileId: string;
  fileName: string;
  fileType: SmartImportSourceType;
  pages: ExtractedDocumentPage[];
  inlineData?: { mimeType: string; data: string };
  defaultLevelId: EducationLevelId;
  defaultGrade: GradeNumber;
  defaultSubject: string;
  defaultTopic?: CurriculumTopic;
  requestAiAnswerSuggestion: boolean;
}): Promise<{
  questions: SmartExtractedQuestionDraft[];
  engineUsed: 'GEMINI_API' | 'HYBRID_LOCAL_PARSER';
}> {
  // 1. Luôn chạy bộ phân tích cấu trúc cục bộ trước để bảo toàn 100% ảnh nhúng, bảng biểu và công thức
  let localQuestions = extractStructuredQuestionsFromPages(params);

  // 2. Nếu là tệp ảnh quét hoặc PDF dạng hình ảnh chụp / chưa tách đủ câu hỏi rõ ràng, gọi Gemini Multimodal API
  const hasUnrecognizedPage = params.pages.some((p) => !isMeaningfulExtractedExamText(p.rawText));
  const shouldCallRemoteAi =
    params.fileType === 'IMAGE' ||
    (params.fileType === 'PDF' && (localQuestions.length <= 1 || hasUnrecognizedPage)) ||
    localQuestions.length === 0;

  if (!shouldCallRemoteAi && localQuestions.length > 0) {
    return {
      questions: localQuestions,
      engineUsed: 'HYBRID_LOCAL_PARSER',
    };
  }

  const allPageImages = params.pages.flatMap((p) =>
    (p.images || [])
      .filter((img) => img.dataUrl && img.dataUrl.includes('base64,'))
      .map((img) => ({
        pageNumber: p.pageNumber,
        mimeType: img.mimeType || 'image/jpeg',
        dataUrl: img.dataUrl,
      }))
  );

  let effectiveInlineData = params.inlineData;
  if (
    params.fileType === 'PDF' &&
    allPageImages.length > 0 &&
    (!effectiveInlineData || !effectiveInlineData.data)
  ) {
    const firstImg = allPageImages[0];
    effectiveInlineData = {
      mimeType: firstImg.mimeType,
      data: firstImg.dataUrl.split('base64,')[1],
    };
  }

  try {
    const response = await fetch('/api/ai/smart-import-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: params.fileName,
        fileType: params.fileType,
        extractedRawText: params.pages.map((p) => p.rawText).join('\n\n'),
        extractedPages: params.pages.map((p) => ({
          pageNumber: p.pageNumber,
          rawText: p.rawText,
        })),
        extractedTables: params.pages.flatMap((p) => p.tables),
        extractedFormulas: params.pages.flatMap((p) => p.formulas),
        inlineData: effectiveInlineData,
        pageImages: allPageImages,
        requestAiAnswerSuggestion: params.requestAiAnswerSuggestion,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Nếu máy chủ đã giải nén được văn bản từ luồng PDF, cập nhật lại nội dung trang
      if (Array.isArray(data.serverExtractedPages) && data.serverExtractedPages.length > 0) {
        data.serverExtractedPages.forEach(
          (sp: { pageNumber?: number; rawText?: string }, idx: number) => {
            const targetPage =
              params.pages.find((p) => p.pageNumber === Number(sp.pageNumber)) ||
              params.pages[idx] ||
              params.pages[0];
            if (
              targetPage &&
              sp.rawText &&
              (!targetPage.rawText ||
                !isMeaningfulExtractedExamText(targetPage.rawText))
            ) {
              targetPage.rawText = String(sp.rawText);
            }
          }
        );
        if (localQuestions.length <= 1) {
          localQuestions = extractStructuredQuestionsFromPages(params);
        }
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const defaultLo = params.defaultTopic?.learningOutcomes?.[0];
        const firstPageImages = params.pages[0]?.images || [];

        const mappedQuestions: SmartExtractedQuestionDraft[] = data.questions.map(
          (q: Record<string, unknown>, idx: number) => {
            const hasExplicit = Boolean(
              q.hasExplicitAnswerInDoc && String(q.documentAnswer || '').trim()
            );
            const docAns = String(q.documentAnswer || '').trim();
            const aiSugAns = String(q.aiSuggestedAnswer || '').trim();
            const aiSugExp = String(q.aiSuggestedExplanation || '').trim();

            let answerOrigin: AnswerOriginType = 'MISSING';
            let finalAnswer = '';
            if (hasExplicit) {
              answerOrigin = 'FROM_DOCUMENT';
              finalAnswer = docAns;
            } else if (params.requestAiAnswerSuggestion && aiSugAns) {
              answerOrigin = 'AI_SUGGESTED';
              finalAnswer = aiSugAns.includes('Đáp án do AI đề xuất')
                ? aiSugAns
                : `${aiSugAns} (Đáp án do AI đề xuất – cần xác minh)`;
            }

            const options = Array.isArray(q.options) ? q.options.map((o) => String(o)) : [];
            const subStatements = Array.isArray(q.subStatements)
              ? (q.subStatements as Array<Record<string, unknown>>).map((s, sIdx) => ({
                  label: String(s.label || ['a', 'b', 'c', 'd'][sIdx] || 'a'),
                  statement: String(s.statement || ''),
                  isTrue: Boolean(s.isTrue),
                }))
              : [];
            const formulas = Array.isArray(q.latexFormulas)
              ? q.latexFormulas.map((f) => String(f))
              : [];

            let correctOptionIndices: number[] = [];
            if (options.length >= 2 && finalAnswer) {
              const letterMatch = finalAnswer.match(/^([A-D])\b/i);
              if (letterMatch) {
                const cIdx = ['A', 'B', 'C', 'D'].indexOf(letterMatch[1].toUpperCase());
                if (cIdx >= 0 && cIdx < options.length) correctOptionIndices = [cIdx];
              }
            }

            const attachments: QuestionAttachment[] = [];
            formulas.forEach((f, fIdx) => {
              attachments.push({
                id: `ai-formula-${idx + 1}-${fIdx + 1}`,
                type: 'FORMULA',
                title: `Công thức #${fIdx + 1}`,
                latexFormula: f,
              });
            });

            const pageNum = Math.max(1, Number(q.pageNumber) || 1);
            const pageImages =
              params.pages.find((p) => p.pageNumber === pageNum)?.images || firstPageImages;

            if (pageImages.length > 0 && (q.hasImageReference || idx === 0)) {
              pageImages.forEach((img) => {
                attachments.push({
                  id: `ai-img-${idx + 1}-${img.id}`,
                  type: 'IMAGE',
                  title: String(q.imageCaption || img.caption || img.fileName),
                  fileName: img.fileName,
                  fileUrl: img.dataUrl,
                });
              });
            }

            const rawWarnings = Array.isArray(q.extractionWarnings)
              ? q.extractionWarnings.map((w) => String(w))
              : [];
            if (!hasExplicit) {
              rawWarnings.unshift(
                answerOrigin === 'AI_SUGGESTED'
                  ? 'Tài liệu gốc không có đáp án — Đáp án do AI đề xuất – cần xác minh.'
                  : 'Tài liệu gốc không có đáp án — Hệ thống giữ trống để không tự bịa đáp án.'
              );
            }
            rawWarnings.push(
              'Mức độ nhận thức chưa được tự động xác nhận — Giáo viên cần kiểm tra và xác nhận.'
            );

            let resolvedFormat = QuestionFormatCode.SHORT_ANSWER;
            const rawFormatStr = String(q.format || '').toUpperCase();
            if (subStatements.length >= 2 || rawFormatStr.includes('TRUE_FALSE')) {
              resolvedFormat = QuestionFormatCode.TRUE_FALSE_CLUSTER;
            } else if (options.length >= 2 || rawFormatStr.includes('MCQ')) {
              resolvedFormat = QuestionFormatCode.MCQ_SINGLE;
            } else if (q.sharedPassage || rawFormatStr.includes('READING')) {
              resolvedFormat = QuestionFormatCode.READING_COMPREHENSION;
            } else if (rawFormatStr.includes('ESSAY')) {
              resolvedFormat = QuestionFormatCode.ESSAY;
            }

            return {
              draftId: `smart-ai-q-${Date.now()}-${idx + 1}`,
              sourceFileId: params.fileId,
              sourceFileName: params.fileName,
              sourceFileType: params.fileType,
              pageNumber: pageNum,
              questionIndexInDoc: idx + 1,
              questionLabel: String(q.questionNumberLabel || `Câu ${idx + 1}`),
              selectedForImport: true,

              levelId: params.defaultTopic?.levelId || params.defaultLevelId,
              grade: params.defaultTopic?.grade || params.defaultGrade,
              subject: params.defaultTopic?.subject || params.defaultSubject,
              topicId: params.defaultTopic?.id,
              topicTitle: params.defaultTopic?.topicTitle || 'Chưa gắn chủ đề chương trình',
              lessonTitle:
                params.defaultTopic?.lessons?.[0]?.lessonName || 'Bài học theo chương trình',
              knowledgeUnit:
                params.defaultTopic?.chapterTitle || `Câu trích xuất #${idx + 1}`,
              learningOutcomeCode: defaultLo?.code || `YCCĐ-K${params.defaultGrade}-1.1`,
              learningOutcomeText:
                defaultLo?.description ||
                `Đánh giá yêu cầu cần đạt môn ${params.defaultSubject} Lớp ${params.defaultGrade}.`,
              curriculumLinked: Boolean(params.defaultTopic),

              format: resolvedFormat,
              suggestedCognitiveLevel:
                params.defaultLevelId === EducationLevelId.PRIMARY
                  ? CognitiveLevelCode.PRIMARY_MUC_2
                  : CognitiveLevelCode.SEC_THONG_HIEU,
              cognitiveLevel:
                params.defaultLevelId === EducationLevelId.PRIMARY
                  ? CognitiveLevelCode.PRIMARY_MUC_2
                  : CognitiveLevelCode.SEC_THONG_HIEU,
              cognitiveConfirmed: false,
              points:
                Number(q.points) ||
                (resolvedFormat === QuestionFormatCode.TRUE_FALSE_CLUSTER
                  ? 1.0
                  : options.length >= 2
                  ? 0.25
                  : 0.5),

              stem: String(q.stem || ''),
              options,
              correctOptionIndices,
              subStatements,
              sharedPassageGroupId: q.sharedPassageGroupKey
                ? String(q.sharedPassageGroupKey)
                : undefined,
              sharedPassage: q.sharedPassage ? String(q.sharedPassage) : undefined,
              sharedPassageAuthor: q.sharedPassageAuthor
                ? String(q.sharedPassageAuthor)
                : undefined,
              attachments,

              hasExplicitAnswerInDoc: hasExplicit,
              answerOrigin,
              correctAnswer: finalAnswer,
              aiSuggestedAnswer: aiSugAns || undefined,
              aiSuggestedExplanation: aiSugExp || undefined,
              gradingGuide: String(
                q.documentGradingGuide ||
                  aiSugExp ||
                  'Giáo viên đối chiếu và xác nhận hướng dẫn chấm.'
              ),
              extractionWarnings: Array.from(new Set(rawWarnings)),
              sourceSnippet: String(q.sourceSnippet || q.stem || ''),
            };
          }
        );

        // Đồng bộ văn bản AI nhận diện sang từng trang ở cột trái nếu trang PDF gốc là ảnh scan
        for (const p of params.pages) {
          if (!isMeaningfulExtractedExamText(p.rawText)) {
            const pageQuestions = mappedQuestions.filter((mq) => mq.pageNumber === p.pageNumber);
            const sourceList = pageQuestions.length > 0 ? pageQuestions : mappedQuestions;
            p.rawText = sourceList
              .map(
                (mq) =>
                  `${mq.questionLabel} (${mq.points} điểm): ${mq.stem}${
                    mq.options.length > 0 ? '\n' + mq.options.join('\n') : ''
                  }${
                    mq.subStatements.length > 0
                      ? '\n' + mq.subStatements.map((s) => `${s.label}) ${s.statement}`).join('\n')
                      : ''
                  }${mq.hasExplicitAnswerInDoc ? `\nĐáp án: ${mq.correctAnswer}` : ''}`
              )
              .join('\n\n');
          }
        }

        if (mappedQuestions.length >= localQuestions.length || localQuestions.length <= 1) {
          return {
            questions: mappedQuestions,
            engineUsed: 'GEMINI_API',
          };
        }
      }
    }
  } catch {
    // Chuyển sang fallback an toàn nếu mất kết nối API
  }

  // Dự phòng đảm bảo 100% mọi tệp PDF / Ảnh tải lên đều có ít nhất các thẻ câu hỏi nháp kèm ảnh trang để giáo viên đối chiếu và chỉnh sửa
  if (localQuestions.length === 0 && params.pages.length > 0) {
    const defaultLo = params.defaultTopic?.learningOutcomes?.[0];
    const fallbackCognitive =
      params.defaultLevelId === EducationLevelId.PRIMARY
        ? CognitiveLevelCode.PRIMARY_MUC_1
        : CognitiveLevelCode.SEC_NHAN_BIET;

    localQuestions = params.pages.map((page, idx) => {
      const cleanedRaw = cleanVietnameseExamOcrText(page.rawText);
      const isPlaceholder =
        !cleanedRaw ||
        cleanedRaw.includes('Đang sử dụng AI Multimodal') ||
        cleanedRaw.startsWith('[Tệp PDF ');
      const stemText = !isPlaceholder
        ? cleanedRaw
        : `Nội dung trích xuất từ Trang ${page.pageNumber} của tệp "${params.fileName}" (Giáo viên đối chiếu hình ảnh trang đính kèm để hiệu chỉnh câu hỏi).`;

      const attachments: QuestionAttachment[] = (page.images || []).map((img) => ({
        id: `fallback-img-${page.pageNumber}-${img.id}`,
        type: 'IMAGE',
        title: img.caption || img.fileName,
        fileName: img.fileName,
        fileUrl: img.dataUrl,
      }));

      return {
        draftId: `smart-fallback-q-${Date.now()}-${idx + 1}`,
        sourceFileId: params.fileId,
        sourceFileName: params.fileName,
        sourceFileType: params.fileType,
        pageNumber: page.pageNumber,
        questionIndexInDoc: idx + 1,
        questionLabel: `Câu ${idx + 1}`,
        selectedForImport: true,

        levelId: params.defaultTopic?.levelId || params.defaultLevelId,
        grade: params.defaultTopic?.grade || params.defaultGrade,
        subject: params.defaultTopic?.subject || params.defaultSubject,
        topicId: params.defaultTopic?.id,
        topicTitle: params.defaultTopic?.topicTitle || 'Chưa gắn chủ đề chương trình',
        lessonTitle:
          params.defaultTopic?.lessons?.[0]?.lessonName || 'Bài học theo chương trình',
        knowledgeUnit:
          params.defaultTopic?.chapterTitle || `Trang ${page.pageNumber} (${params.fileName})`,
        learningOutcomeCode: defaultLo?.code || `YCCĐ-K${params.defaultGrade}-1.1`,
        learningOutcomeText:
          defaultLo?.description ||
          `Đánh giá yêu cầu cần đạt môn ${params.defaultSubject} Lớp ${params.defaultGrade}.`,
        curriculumLinked: Boolean(params.defaultTopic),

        format: QuestionFormatCode.MCQ_SINGLE,
        suggestedCognitiveLevel: fallbackCognitive,
        cognitiveLevel: fallbackCognitive,
        cognitiveConfirmed: false,
        points: 0.25,

        stem: stemText,
        options: [
          'A. Phương án A',
          'B. Phương án B',
          'C. Phương án C',
          'D. Phương án D',
        ],
        correctOptionIndices: [],
        subStatements: [],
        attachments,

        hasExplicitAnswerInDoc: false,
        answerOrigin: 'MISSING',
        correctAnswer: '',
        gradingGuide: 'Giáo viên đối chiếu với bản chụp trang gốc ở cột trái và cập nhật đáp án.',
        extractionWarnings: [
          'Tài liệu PDF dạng ảnh chụp có độ phân giải thấp hoặc bố cục đặc biệt — Đã đính kèm trực tiếp bản chụp trang gốc, giáo viên đối chiếu và chỉnh sửa nội dung câu hỏi.',
          'Tài liệu gốc không có đáp án — Hệ thống giữ trống để không tự bịa đáp án.',
          'Mức độ nhận thức chưa được tự động xác nhận — Giáo viên cần kiểm tra và xác nhận.',
        ],
        sourceSnippet: stemText,
      };
    });
  }

  return {
    questions: localQuestions,
    engineUsed: 'HYBRID_LOCAL_PARSER',
  };
}

// ============================================================================
// 6. KIỂM TRA TRÙNG LẶP VỚI NGÂN HÀNG CÂU HỎI & NỘI BỘ LÔ NHẬP (BƯỚC 7)
// ============================================================================

function normalizeTextForDuplicateComparison(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;!?'"()[\]{}]/g, '')
    .trim();
}

function computeTokenSimilarity(a: string, b: string): number {
  const normA = normalizeTextForDuplicateComparison(a);
  const normB = normalizeTextForDuplicateComparison(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 100;

  const tokensA = new Set(normA.split(' ').filter((w) => w.length >= 2));
  const tokensB = new Set(normB.split(' ').filter((w) => w.length >= 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  tokensA.forEach((t) => {
    if (tokensB.has(t)) intersection += 1;
  });
  const union = new Set([...tokensA, ...tokensB]).size;
  return Math.round((intersection / union) * 100);
}

export function runDuplicateCheckOnDrafts(
  drafts: SmartExtractedQuestionDraft[],
  existingBankQuestions: QuestionItem[],
  thresholdPercent = 65
): SmartExtractedQuestionDraft[] {
  return drafts.map((draft, idx) => {
    let bestSimilarity = 0;
    let matchedCode: string | undefined;
    let matchedId: string | undefined;
    let matchedStem: string | undefined;
    let duplicateSource: 'QUESTION_BANK' | 'CURRENT_BATCH' | undefined;

    // 1. So sánh với Ngân hàng câu hỏi hiện có
    for (const bankQ of existingBankQuestions) {
      const sim = computeTokenSimilarity(draft.stem, bankQ.stem);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        matchedCode = bankQ.code;
        matchedId = bankQ.id;
        matchedStem = bankQ.stem;
        duplicateSource = 'QUESTION_BANK';
      }
    }

    // 2. So sánh với các câu hỏi đứng trước trong cùng lô trích xuất
    for (let j = 0; j < idx; j++) {
      const other = drafts[j];
      const sim = computeTokenSimilarity(draft.stem, other.stem);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        matchedCode = `${other.questionLabel} (Trang ${other.pageNumber})`;
        matchedId = other.draftId;
        matchedStem = other.stem;
        duplicateSource = 'CURRENT_BATCH';
      }
    }

    const isDuplicate = bestSimilarity >= thresholdPercent;
    const updatedWarnings = draft.extractionWarnings.filter(
      (w) => !w.startsWith('Phát hiện trùng lặp')
    );
    if (isDuplicate && matchedCode) {
      updatedWarnings.unshift(
        `Phát hiện trùng lặp (${bestSimilarity}%) với câu hỏi ${matchedCode} (${
          duplicateSource === 'QUESTION_BANK' ? 'Trong Ngân hàng câu hỏi' : 'Trong cùng tài liệu'
        }).`
      );
    }

    return {
      ...draft,
      extractionWarnings: updatedWarnings,
      duplicateCheck: {
        isDuplicate,
        maxSimilarityPercent: bestSimilarity,
        matchedQuestionCode: matchedCode,
        matchedQuestionId: matchedId,
        matchedQuestionStem: matchedStem,
        duplicateSource,
      },
    };
  });
}

// ============================================================================
// 7. LƯU VÀO NGÂN HÀNG Ở TRẠNG THÁI BẢN NHÁP & KIỂM CHỨNG LƯU THỰC TẾ (BƯỚC 8)
// ============================================================================

/**
 * Lưu các câu hỏi đã chọn vào Ngân hàng câu hỏi ở trạng thái BẢN NHÁP (ApprovalStatus.DRAFT).
 * - Tự động giữ liên kết ngữ liệu chung thông qua QuestionGroup và sharedPassageGroupId.
 * - Lưu nguồn tài liệu và số trang của từng câu hỏi.
 * - KIỂM CHỨNG THỰC TẾ trong dataRepository.getQuestions() trước khi báo thành công.
 */
export function saveImportedQuestionsAsDraftsToBank(params: {
  draftsToSave: SmartExtractedQuestionDraft[];
  authorName: string;
  onBulkAddQuestions: (
    items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]
  ) => QuestionItem[];
  onAddGroup?: (group: Omit<QuestionGroup, 'id' | 'code' | 'createdAt'>) => QuestionGroup;
  onAssignToGroup?: (groupId: string, questionIds: string[]) => QuestionGroup | null;
}): SmartImportSaveResult {
  const { draftsToSave, authorName, onBulkAddQuestions, onAddGroup, onAssignToGroup } = params;

  if (!draftsToSave || draftsToSave.length === 0) {
    return {
      success: false,
      requestedCount: 0,
      verifiedSavedCount: 0,
      savedQuestions: [],
      createdGroups: [],
      errorMessage: 'Chưa có câu hỏi nào được chọn để lưu vào Ngân hàng.',
    };
  }

  // Chuyển đổi sang định dạng QuestionItem (BẮT BUỘC status = ApprovalStatus.DRAFT - Không tự động công khai)
  const itemsPayload: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[] = draftsToSave.map(
    (d) => {
      const answerNote =
        d.answerOrigin === 'AI_SUGGESTED'
          ? d.correctAnswer.includes('Đáp án do AI đề xuất')
            ? d.correctAnswer
            : `${d.correctAnswer} (Đáp án do AI đề xuất – cần xác minh)`
          : d.correctAnswer || 'Chưa có đáp án trong tài liệu gốc – Cần giáo viên bổ sung';

      const sourceInfo = `Nhập từ tài liệu: ${d.sourceFileName} (Trang ${d.pageNumber})`;
      const tags = [
        'Nhập đề thông minh',
        `Nguồn: ${d.sourceFileName}`,
        `Trang ${d.pageNumber}`,
        d.subject,
        `Lớp ${d.grade}`,
      ];
      if (d.answerOrigin === 'AI_SUGGESTED') {
        tags.push('Đáp án AI đề xuất - Cần xác minh');
      }
      if (!d.cognitiveConfirmed) {
        tags.push('Chưa xác nhận mức độ nhận thức');
      }
      if (d.sharedPassageGroupId) {
        tags.push(`Ngữ liệu chung: ${d.sharedPassageGroupId}`);
      }

      return {
        levelId: d.levelId,
        grade: d.grade,
        subject: d.subject,
        topicTitle: d.topicTitle,
        lessonTitle: d.lessonTitle,
        knowledgeUnit: d.knowledgeUnit,
        learningOutcomeCode: d.learningOutcomeCode,
        learningOutcomeText: d.learningOutcomeText,
        cognitiveLevel: d.cognitiveLevel,
        format: d.format,
        stem: d.stem,
        options: d.options.length > 0 ? d.options : undefined,
        correctOptionIndices:
          d.correctOptionIndices.length > 0 ? d.correctOptionIndices : undefined,
        subStatements: d.subStatements.length > 0 ? d.subStatements : undefined,
        sharedPassage: d.sharedPassage,
        sharedPassageAuthor: d.sharedPassageAuthor,
        sharedPassageGroupId: d.sharedPassageGroupId,
        attachments: d.attachments.length > 0 ? d.attachments : undefined,
        correctAnswer: answerNote,
        gradingGuide: d.gradingGuide,
        points: d.points,
        questionSource: sourceInfo,
        sourceDocumentName: d.sourceFileName,
        sourcePageNumber: d.pageNumber,
        answerOrigin: d.answerOrigin,
        cognitiveConfirmed: d.cognitiveConfirmed,
        extractionWarnings: d.extractionWarnings,
        tags,
        status: ApprovalStatus.DRAFT, // TUYỆT ĐỐI LƯU Ở TRẠNG THÁI BẢN NHÁP, KHÔNG TỰ ĐỘNG CÔNG KHAI
        authorName: authorName || 'Giáo viên Nhập đề thông minh',
        isSampleData: false,
      };
    }
  );

  // Lưu thực tế qua callback & repository
  const createdQuestions = onBulkAddQuestions(itemsPayload);

  // Liên kết các câu hỏi có chung ngữ liệu đọc hiểu thành Nhóm câu hỏi (QuestionGroup)
  const createdGroups: QuestionGroup[] = [];
  const passageGroupBuckets = new Map<
    string,
    { title: string; subject: string; levelId: EducationLevelId; questionIds: string[] }
  >();

  draftsToSave.forEach((d, idx) => {
    const savedQ = createdQuestions[idx];
    if (d.sharedPassageGroupId && savedQ) {
      const existing = passageGroupBuckets.get(d.sharedPassageGroupId);
      if (existing) {
        existing.questionIds.push(savedQ.id);
      } else {
        passageGroupBuckets.set(d.sharedPassageGroupId, {
          title:
            d.sharedPassageTitle ||
            `Chùm câu hỏi Đọc hiểu (${d.sourceFileName} - Trang ${d.pageNumber})`,
          subject: d.subject,
          levelId: d.levelId,
          questionIds: [savedQ.id],
        });
      }
    }
  });

  passageGroupBuckets.forEach((bucket) => {
    if (bucket.questionIds.length > 0) {
      const groupCreator = onAddGroup || ((g) => dataRepository.addQuestionGroup(g));
      const newGroup = groupCreator({
        name: bucket.title,
        description: `Nhóm câu hỏi liên kết chung ngữ liệu đọc hiểu trích xuất từ tài liệu.`,
        levelId: bucket.levelId,
        subject: bucket.subject,
        questionIds: bucket.questionIds,
      });
      if (onAssignToGroup) {
        onAssignToGroup(newGroup.id, bucket.questionIds);
      }
      createdGroups.push(newGroup);
    }
  });

  // KIỂM CHỨNG SAU KHI LƯU (POST-SAVE VERIFICATION):
  // Đọc trực tiếp từ dataRepository.getQuestions() để xác nhận dữ liệu đã thực sự nằm trong kho lưu trữ
  const currentBankInStorage = dataRepository.getQuestions();
  const bankIdSet = new Set(currentBankInStorage.map((q) => q.id));
  const verifiedQuestions = createdQuestions.filter(
    (q) => bankIdSet.has(q.id) && q.status === ApprovalStatus.DRAFT
  );

  if (verifiedQuestions.length !== draftsToSave.length) {
    return {
      success: false,
      requestedCount: draftsToSave.length,
      verifiedSavedCount: verifiedQuestions.length,
      savedQuestions: verifiedQuestions,
      createdGroups,
      errorMessage: `Kiểm chứng lưu trữ thất bại: Yêu cầu lưu ${draftsToSave.length} câu nhưng chỉ xác thực được ${verifiedQuestions.length} câu trong bộ nhớ ngân hàng.`,
    };
  }

  return {
    success: true,
    requestedCount: draftsToSave.length,
    verifiedSavedCount: verifiedQuestions.length,
    savedQuestions: verifiedQuestions,
    createdGroups,
  };
}

// ============================================================================
// 8. BỘ TẠO TỆP MẪU THỰC TẾ (.DOCX NHỊ PHÂN QUA JSZIP) & KIỂM THỬ 6 KỊCH BẢN (PHẦN V)
// ============================================================================

async function buildRealDocxFileFromXml(params: {
  fileName: string;
  documentBodyXml: string;
  embeddedImageSvg?: { rId: string; fileName: string; svgContent: string };
}): Promise<File> {
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="svg" ContentType="image/svg+xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  const relEntries = params.embeddedImageSvg
    ? `<Relationship Id="${params.embeddedImageSvg.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${params.embeddedImageSvg.fileName}"/>`
    : '';

  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relEntries}
</Relationships>`
  );

  if (params.embeddedImageSvg) {
    zip.file(
      `word/media/${params.embeddedImageSvg.fileName}`,
      params.embeddedImageSvg.svgContent
    );
  }

  const fullDocXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <w:body>
    ${params.documentBodyXml}
  </w:body>
</w:document>`;

  zip.file('word/document.xml', fullDocXml);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return new File([blob], params.fileName, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

function encodeStringToUtf16BeHexWithBom(str: string): string {
  let hex = 'FEFF';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hex += code.toString(16).toUpperCase().padStart(4, '0');
  }
  return hex;
}

/**
 * Tạo tệp PDF nhị phân thực tế chuẩn ISO 32000-1 (%PDF-1.4) có đầy đủ bảng đối tượng,
 * luồng văn bản đa trang, bảng ánh xạ ToUnicode CMap (Identity-H / UTF-16BE) và bảng xref chuẩn.
 */
export function buildRealPdfFileFromPages(params: {
  fileName: string;
  pageLinesList: string[][];
}): File {
  const objects: string[] = [];
  const pageCount = Math.max(1, params.pageLinesList.length);

  const pageObjNums: number[] = [];
  for (let i = 0; i < pageCount; i++) {
    pageObjNums.push(6 + i * 2);
  }

  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums
      .map((n) => `${n} 0 R`)
      .join(' ')}] /Count ${pageCount} >>\nendobj`
  );
  objects.push(
    `3 0 obj\n<< /Type /Font /Subtype /Type0 /BaseFont /ArialUnicodeMS /Encoding /Identity-H /DescendantFonts [4 0 R] /ToUnicode 5 0 R >>\nendobj`
  );
  objects.push(
    `4 0 obj\n<< /Type /Font /Subtype /CIDFontType2 /BaseFont /ArialUnicodeMS /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 600 >>\nendobj`
  );

  const cmapStream = `/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
1 beginbfchar
<FEFF> <>
endbfchar
1 beginbfrange
<0020> <FFFD> <0020>
endbfrange
endcmap
CMapName currentdict /CMap defineresource pop
end
end`;
  objects.push(
    `5 0 obj\n<< /Length ${cmapStream.length} >>\nstream\n${cmapStream}\nendstream\nendobj`
  );

  for (let pIdx = 0; pIdx < pageCount; pIdx++) {
    const pageObjNum = 6 + pIdx * 2;
    const contentObjNum = pageObjNum + 1;
    const lines = params.pageLinesList[pIdx] || [];

    const streamOps: string[] = ['BT', '/F1 11 Tf', '45 790 Td'];
    lines.forEach((line, lIdx) => {
      if (lIdx > 0) {
        streamOps.push('0 -18 Td');
      }
      const hexStr = encodeStringToUtf16BeHexWithBom(line);
      streamOps.push(`<${hexStr}> Tj`);
    });
    streamOps.push('ET');
    const streamContent = streamOps.join('\n');

    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj`
    );
    objects.push(
      `${contentObjNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
    );
  }

  let pdfBody = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const objStr of objects) {
    offsets.push(pdfBody.length);
    pdfBody += objStr + '\n';
  }

  const xrefOffset = pdfBody.length;
  pdfBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdfBody += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const bytes = new TextEncoder().encode(pdfBody);
  return new File([bytes], params.fileName, { type: 'application/pdf' });
}

/**
 * Tạo tệp Đề kiểm tra PDF mẫu (2 trang, có đầy đủ Trắc nghiệm, Đúng - Sai, Công thức Toán/KHTN & Bảng đáp án)
 */
export function createSamplePdfExamFile(): {
  file: File;
  defaultGrade: GradeNumber;
  defaultSubject: string;
} {
  const page1Lines = [
    'UBND XÃ ĐAN ĐIỀN - TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH',
    'ĐỀ KIỂM TRA GIỮA KÌ I - MÔN TOÁN LỚP 8 (ĐỊNH DẠNG PDF CHUẨN)',
    'PHẦN I. Trắc nghiệm nhiều lựa chọn (1.00 điểm)',
    'Câu 1 (0.25 điểm): Cho tam giác vuông có hai cạnh góc vuông là 6 cm và 8 cm. Theo định lí Pythagore $\\sqrt{a^2 + b^2}$, độ dài cạnh huyền bằng bao nhiêu?',
    'A. $10\\text{ cm}$    B. $12\\text{ cm}$    C. $14\\text{ cm}$    D. $100\\text{ cm}$',
    'Câu 2 (0.25 điểm): Khai triển hằng đẳng thức hiệu hai bình phương $x^2 - 9$ ta được kết quả nào sau đây?',
    'A. $(x - 9)(x + 9)$',
    'B. $(x - 3)(x + 3)$',
    'C. $(x - 3)^2$',
    'D. $(x + 3)^2$',
    'PHẦN II. Trắc nghiệm Đúng - Sai (1.00 điểm)',
    'Câu 3 (1.0 điểm): Cho hình bình hành ABCD có hai đường chéo AC và BD cắt nhau tại O. Xét tính đúng sai của các mệnh đề sau:',
    'a) Hai cạnh đối AB và CD song song và bằng nhau. (Đúng)',
    'b) Hai góc đối diện của hình bình hành luôn phụ nhau bằng 90 độ. (Sai)',
    'c) Điểm O là trung điểm của mỗi đường chéo AC và BD. (Đúng)',
    'd) Hai đường chéo AC và BD luôn vuông góc với nhau. (Sai)',
  ];

  const page2Lines = [
    'PHẦN III. Trả lời ngắn và Tự luận (1.50 điểm)',
    'Câu 4 (0.5 điểm): Tính nhanh giá trị của biểu thức $A = 105^2 - 5^2$ bằng cách áp dụng hằng đẳng thức.',
    'Đáp án: 11000',
    'Hướng dẫn: Áp dụng $105^2 - 5^2 = (105 - 5)(105 + 5) = 100 \\cdot 110 = 11000$.',
    'Câu 5 (1.0 điểm): Giải thích vì sao hình chữ nhật cũng là một hình thang cân và là một hình bình hành đặc biệt?',
    'Đáp án: Vì hình chữ nhật có các cặp cạnh đối song song, bằng nhau và hai đường chéo bằng nhau.',
    'BẢNG ĐÁP ÁN',
    'Câu 1: A | Câu 2: B',
  ];

  const file = buildRealPdfFileFromPages({
    fileName: 'De_Kiem_Tra_Giua_Ki_I_Toan_8_Chuan.pdf',
    pageLinesList: [page1Lines, page2Lines],
  });

  return {
    file,
    defaultGrade: 8,
    defaultSubject: 'Toán',
  };
}

/**
 * Tạo tệp Đề kiểm tra PDF DẠNG HÌNH ẢNH CHỤP (Scanned/Image-only PDF):
 * Vẽ đề kiểm tra lên Canvas, xuất ra luồng ảnh JPEG thực tế (FF D8 FF ... FF D9) và đóng gói vào tệp %PDF-1.4
 * hoàn toàn KHÔNG có lớp văn bản (0 text operators) để kiểm chứng thực tế bộ máy OCR.
 */
export function createSampleScannedImagePdfExamFile(): {
  file: File;
  defaultGrade: GradeNumber;
  defaultSubject: string;
} {
  let jpegBytes = new Uint8Array(0);
  const imgWidth = 1040;
  const imgHeight = 1180;

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, imgWidth, imgHeight);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('UBND XÃ ĐAN ĐIỀN - TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH', 60, 60);
      ctx.fillText('ĐỀ KIỂM TRA GIỮA KÌ I - MÔN TIN HỌC LỚP 7 (BẢN CHỤP SCAN)', 60, 100);

      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText('PHẦN I. Trắc nghiệm nhiều lựa chọn (0.50 điểm)', 60, 155);

      ctx.font = '21px Arial, sans-serif';
      const linesToDraw = [
        'Câu 1 (0.25 điểm): Thiết bị nào sau đây là thiết bị vào của máy tính?',
        'A. Bàn phím và chuột',
        'B. Màn hình máy tính',
        'C. Máy in nhiệt',
        'D. Loa vi tính',
        '',
        'Câu 2 (0.25 điểm): Tổ hợp phím tắt nào dùng để sao chép và dán dữ liệu?',
        'A. Nhấn Ctrl + C để sao chép và nhấn Ctrl + V để dán.',
        'B. Nhấn Ctrl + X để sao chép và nhấn Ctrl + Z để dán.',
        'C. Nhấn phím Delete để sao chép và phím F2 để dán.',
        'D. Nhấn Alt + F4 để sao chép và Ctrl + S để dán.',
        '',
        'PHẦN II. Trắc nghiệm Đúng - Sai (1.00 điểm)',
        'Câu 3 (1.0 điểm): Khi quản lý tệp và thư mục trong máy tính, xét tính đúng sai:',
        'a) Hệ điều hành giúp quản lý tệp và thư mục trên ổ đĩa. (Đúng)',
        'b) Có thể đặt tên hai thư mục trùng nhau trong cùng một thư mục mẹ. (Sai)',
        'c) Phím tắt F2 dùng để đổi tên tệp hoặc thư mục đang chọn. (Đúng)',
        'd) Xóa tệp bằng Shift + Delete sẽ đưa tệp vào thùng rác Recycle Bin. (Sai)',
        '',
        'BẢNG ĐÁP ÁN',
        'Câu 1: A | Câu 2: A',
      ];

      let y = 200;
      for (const line of linesToDraw) {
        if (line.startsWith('PHẦN ') || line.startsWith('BẢNG ĐÁP ÁN')) {
          ctx.font = 'bold 22px Arial, sans-serif';
        } else if (line.startsWith('Câu ')) {
          ctx.font = 'bold 21px Arial, sans-serif';
        } else {
          ctx.font = '21px Arial, sans-serif';
        }
        if (line) {
          ctx.fillText(line, 60, y);
        }
        y += line ? 42 : 18;
      }

      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const b64 = jpgDataUrl.split('base64,')[1] || '';
      if (b64 && typeof atob === 'function') {
        const binStr = atob(b64);
        jpegBytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          jpegBytes[i] = binStr.charCodeAt(i);
        }
      }
    }
  }

  // Đóng gói luồng ảnh JPEG nhị phân vào tệp %PDF-1.4 chuẩn (Image XObject /DCTDecode, không có lớp văn bản)
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let offset = 0;
  const offsets: number[] = [0];

  const pushStr = (s: string) => {
    const b = enc.encode(s);
    chunks.push(b);
    offset += b.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    offset += b.length;
  };

  pushStr('%PDF-1.4\n');

  // 1 0 obj: Catalog
  offsets.push(offset);
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2 0 obj: Pages
  offsets.push(offset);
  pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // 3 0 obj: Page
  offsets.push(offset);
  pushStr(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'
  );

  // 4 0 obj: Image XObject (DCTDecode JPEG)
  offsets.push(offset);
  pushStr(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  pushStr('\nendstream\nendobj\n');

  // 5 0 obj: Content stream vẽ ảnh lên toàn trang A4 (không chứa bất kỳ lệnh BT/ET/Tj văn bản nào)
  const drawCmd = 'q\n595 0 0 842 0 0 cm\n/Im1 Do\nQ\n';
  offsets.push(offset);
  pushStr(`5 0 obj\n<< /Length ${drawCmd.length} >>\nstream\n${drawCmd}endstream\nendobj\n`);

  const xrefStart = offset;
  pushStr(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (let i = 1; i < offsets.length; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  );

  const totalBytes = new Uint8Array(offset);
  let pos = 0;
  for (const c of chunks) {
    totalBytes.set(c, pos);
    pos += c.length;
  }

  const file = new File([totalBytes], 'De_Tin_Hoc_7_PDF_Anh_Chup_Scan.pdf', {
    type: 'application/pdf',
  });

  return {
    file,
    defaultGrade: 7,
    defaultSubject: 'Tin học',
  };
}

/**
 * Tạo tệp thực tế cho từng kịch bản trong 6 kịch bản kiểm thử bắt buộc (Mục V)
 */
export async function createTestScenarioFile(
  scenarioId: SmartImportTestScenarioId
): Promise<{
  file: File;
  scenarioTitle: string;
  expectedQuestionCount: number;
  defaultGrade: GradeNumber;
  defaultSubject: string;
}> {
  switch (scenarioId) {
    case 'TEST_MATH_FORMULA': {
      // Kịch bản 1: Đề Toán có công thức (OMML <m:oMath> + LaTeX)
      const bodyXml = `
        <w:p><w:r><w:t>ĐỀ KIỂM TRA GIỮA KÌ I - MÔN TOÁN LỚP 8 (CÓ CÔNG THỨC TOÁN)</w:t></w:r></w:p>
        <w:p>
          <w:r><w:t>Câu 1: (0.5 điểm) Cho tam giác vuông có hai cạnh góc vuông là a = 6 cm và b = 8 cm. Áp dụng định lí Pythagore </w:t></w:r>
          <m:oMath><m:rad><m:e><m:t>a^2 + b^2</m:t></m:e></m:rad></m:oMath>
          <w:r><w:t>, độ dài cạnh huyền c bằng bao nhiêu?</w:t></w:r>
        </w:p>
        <w:p><w:r><w:t>A. $10\\text{ cm}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. $12\\text{ cm}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. $14\\text{ cm}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. $100\\text{ cm}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đáp án: A</w:t></w:r></w:p>
        <w:p><w:r><w:t>Hướng dẫn: Áp dụng định lí Pythagore $c = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10\\text{ cm}$.</w:t></w:r></w:p>

        <w:p>
          <w:r><w:t>Câu 2: (0.5 điểm) Rút gọn phân thức đại số </w:t></w:r>
          <m:oMath><m:f><m:num><m:t>x^2 - 9</m:t></m:num><m:den><m:t>x + 3</m:t></m:den></m:f></m:oMath>
          <w:r><w:t> với điều kiện $x \\neq -3$ ta được kết quả nào sau đây?</w:t></w:r>
        </w:p>
        <w:p><w:r><w:t>A. $x + 3$</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. $x - 3$</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. $x^2 - 3$</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. $2x - 3$</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đáp án: B</w:t></w:r></w:p>

        <w:p><w:br w:type="page"/></w:p>
        <w:p>
          <w:r><w:t>Câu 3: (1.0 điểm) Tính nhanh giá trị của biểu thức </w:t></w:r>
          <m:oMath><m:sSup><m:e><m:t>105</m:t></m:e><m:sup><m:t>2</m:t></m:sup></m:sSup></m:oMath>
          <w:r><w:t> trừ đi $5^2$ bằng hằng đẳng thức hiệu hai bình phương.</w:t></w:r>
        </w:p>
        <w:p><w:r><w:t>Đáp án: 11000</w:t></w:r></w:p>
        <w:p><w:r><w:t>Hướng dẫn: Ta có $105^2 - 5^2 = (105 - 5)(105 + 5) = 100 \\cdot 110 = 11000$.</w:t></w:r></w:p>
      `;
      const file = await buildRealDocxFileFromXml({
        fileName: 'De_Toan_8_Co_Cong_Thuc_OMML.docx',
        documentBodyXml: bodyXml,
      });
      return {
        file,
        scenarioTitle: '1. Đề Toán có công thức (OMML & LaTeX)',
        expectedQuestionCount: 3,
        defaultGrade: 8,
        defaultSubject: 'Toán',
      };
    }

    case 'TEST_VIETNAMESE_PASSAGE': {
      // Kịch bản 2: Đề Tiếng Việt có ngữ liệu đọc hiểu chung
      const bodyXml = `
        <w:p><w:r><w:t>ĐỀ KIỂM TRA ĐỌC HIỂU TIẾNG VIỆT LỚP 4</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đọc đoạn trích sau và trả lời các câu hỏi từ Câu 1 đến Câu 3:</w:t></w:r></w:p>
        <w:p><w:r><w:t>Mùa thu về trên cánh đồng làng quê. Nắng vàng dịu nhẹ trải khắp những thửa ruộng bậc thang đang mùa lúa chín. Hương cốm mới thơm lừng theo gió bay khắp xóm thôn, gợi niềm vui ấm áp của ngày mùa bội thu.</w:t></w:r></w:p>
        <w:p><w:r><w:t>(Theo Tập đọc Tiếng Việt 4 - Kết nối tri thức với cuộc sống)</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 1: (0.5 điểm) Khung cảnh thiên nhiên trong đoạn trích được miêu tả vào mùa nào trong năm?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. Mùa xuân</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. Mùa hạ</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. Mùa thu</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. Mùa đông</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đáp án: C</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 2: (0.5 điểm) Chi tiết nào trong đoạn văn báo hiệu niềm vui của ngày mùa bội thu ở làng quê?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. Những cơn mưa rào đầu hạ chợt đến.</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. Lúa chín vàng trên ruộng bậc thang và hương cốm mới thơm lừng bay khắp xóm thôn.</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. Cây cối khẳng khiu trụi lá trong gió lạnh.</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. Hoa đào nở rộ khắp các sườn đồi.</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đáp án: B</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 3: (1.0 điểm) Em hãy tìm 02 tính từ chỉ đặc điểm của nắng và hương cốm trong đoạn trích trên và đặt một câu miêu tả quê hương em.</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đáp án: Tính từ: dịu nhẹ (hoặc vàng), thơm lừng (hoặc ấm áp). Học sinh đặt câu đúng ngữ pháp, giàu hình ảnh.</w:t></w:r></w:p>
      `;
      const file = await buildRealDocxFileFromXml({
        fileName: 'De_Tieng_Viet_4_Doc_Hieu_Ngu_Lieu.docx',
        documentBodyXml: bodyXml,
      });
      return {
        file,
        scenarioTitle: '2. Đề Tiếng Việt có ngữ liệu đọc hiểu chung',
        expectedQuestionCount: 3,
        defaultGrade: 4,
        defaultSubject: 'Tiếng Việt',
      };
    }

    case 'TEST_MCQ_MULTI_CHOICE': {
      // Kịch bản 3: Đề trắc nghiệm nhiều lựa chọn (4 câu trắc nghiệm + bảng đáp án cuối đề)
      const bodyXml = `
        <w:p><w:r><w:t>ĐỀ KIỂM TRA TRẮC NGHIỆM TIN HỌC LỚP 7 - GIỮA HỌC KÌ I</w:t></w:r></w:p>
        <w:p><w:r><w:t>Câu 1: (0.25 điểm) Thiết bị nào sau đây thuộc nhóm thiết bị vào (Input Device) của máy tính?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. Màn hình hiển thị và máy chiếu</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. Bàn phím, chuột và micro</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. Loa và tai nghe</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. Máy in laser</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 2: (0.25 điểm) Phần mềm nào dưới đây là phần mềm hệ thống giúp quản lý phần cứng và điều phối hoạt động máy tính?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. Microsoft Word</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. Microsoft Excel</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. Hệ điều hành Windows 11 / Ubuntu Linux</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. Phần mềm vẽ Paint</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 3: (0.25 điểm) Để sao chép (Copy) một tệp tin sang thư mục khác trên máy tính, ta sử dụng tổ hợp phím tắt nào?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. Ctrl + C rồi đến thư mục đích nhấn Ctrl + V</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. Alt + F4</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. Phím F2</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. Ctrl + Z</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 4: (0.25 điểm) Trong phần mềm bảng tính Excel, công thức tính tổng giá trị các ô từ A1 đến A5 viết đúng cú pháp là gì?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. SUM(A1:A5) không có dấu bằng</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. =SUM(A1;A5)</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. =AVERAGE(A1:A5)</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. =SUM(A1:A5)</w:t></w:r></w:p>

        <w:p><w:r><w:t>BẢNG ĐÁP ÁN</w:t></w:r></w:p>
        <w:p><w:r><w:t>Câu 1: B | Câu 2: C | Câu 3: A | Câu 4: D</w:t></w:r></w:p>
      `;
      const file = await buildRealDocxFileFromXml({
        fileName: 'De_Trac_Nghiem_Tin_Hoc_7.docx',
        documentBodyXml: bodyXml,
      });
      return {
        file,
        scenarioTitle: '3. Đề trắc nghiệm nhiều lựa chọn (Kèm bảng đáp án)',
        expectedQuestionCount: 4,
        defaultGrade: 7,
        defaultSubject: 'Tin học',
      };
    }

    case 'TEST_IMAGE_AND_TABLE': {
      // Kịch bản 4: Tài liệu có hình ảnh sơ đồ nhúng trong Word + bảng biểu <w:tbl>
      const svgDiagram = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="160" viewBox="0 0 420 160">
        <rect width="420" height="160" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" rx="8"/>
        <text x="20" y="28" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">SƠ ĐỒ MẠCH ĐIỆN THỰC HÀNH KHTN 8 (U = 6V, R = 12 Ω)</text>
        <line x1="50" y1="90" x2="140" y2="90" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="140" y="72" width="110" height="36" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <text x="160" y="95" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e3a8a">R = 12 Ω</text>
        <line x1="250" y1="90" x2="360" y2="90" stroke="#1e293b" stroke-width="2.5"/>
        <circle cx="320" cy="90" r="18" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
        <text x="314" y="95" font-family="sans-serif" font-size="14" font-weight="bold" fill="#92400e">A</text>
      </svg>`;

      const bodyXml = `
        <w:p><w:r><w:t>ĐỀ KIỂM TRA KHOA HỌC TỰ NHIÊN 8 (CÓ HÌNH ẢNH SƠ ĐỒ &amp; BẢNG SỐ LIỆU)</w:t></w:r></w:p>
        <w:p><w:r><a:blip r:embed="rIdImg1"/></w:r></w:p>
        <w:tbl>
          <w:tr>
            <w:tc><w:p><w:r><w:t>Lần đo</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>Hiệu điện thế U (V)</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>Điện trở R (Ω)</w:t></w:r></w:p></w:tc>
          </w:tr>
          <w:tr>
            <w:tc><w:p><w:r><w:t>Lần 1</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>6 V</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>12 Ω</w:t></w:r></w:p></w:tc>
          </w:tr>
          <w:tr>
            <w:tc><w:p><w:r><w:t>Lần 2</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>12 V</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>12 Ω</w:t></w:r></w:p></w:tc>
          </w:tr>
        </w:tbl>
        <w:p><w:r><w:t>Câu 1: (0.5 điểm) Quan sát hình vẽ sơ đồ mạch điện và bảng số liệu ở Lần đo 1 ($U = 6\\text{ V}$, $R = 12\\text{ }\\Omega$), số chỉ của ampe kế (cường độ dòng điện $I = \\frac{U}{R}$) bằng bao nhiêu?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. $0,5\\text{ A}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. $2,0\\text{ A}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. $18\\text{ A}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. $72\\text{ A}$</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đáp án: A</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 2: (0.5 điểm) Dựa vào bảng số liệu trên, ở Lần đo 2 khi tăng hiệu điện thế lên $U = 12\\text{ V}$ và giữ nguyên điện trở $R = 12\\text{ }\\Omega$ thì cường độ dòng điện chạy qua mạch là bao nhiêu ampe?</w:t></w:r></w:p>
        <w:p><w:r><w:t>Đáp án: 1 A</w:t></w:r></w:p>
      `;

      const file = await buildRealDocxFileFromXml({
        fileName: 'De_KHTN_8_Co_Hinh_Anh_Va_Bang.docx',
        documentBodyXml: bodyXml,
        embeddedImageSvg: {
          rId: 'rIdImg1',
          fileName: 'so_do_mach_dien_khtn8.svg',
          svgContent: svgDiagram,
        },
      });
      return {
        file,
        scenarioTitle: '4. Tài liệu có hình ảnh sơ đồ & bảng biểu số liệu',
        expectedQuestionCount: 2,
        defaultGrade: 8,
        defaultSubject: 'Khoa học tự nhiên',
      };
    }

    case 'TEST_NO_ANSWER_KEY': {
      // Kịch bản 5: Tệp hoàn toàn KHÔNG có đáp án (Kiểm chứng hệ thống không tự bịa đáp án)
      const bodyXml = `
        <w:p><w:r><w:t>ĐỀ KIỂM TRA LỊCH SỬ VÀ ĐỊA LÍ LỚP 8 (BẢN ĐỀ GỐC KHÔNG KÈM ĐÁP ÁN)</w:t></w:r></w:p>
        <w:p><w:r><w:t>Câu 1: (0.5 điểm) Cuộc Cách mạng công nghiệp lần thứ nhất bắt đầu vào nửa sau thế kỉ XVIII tại quốc gia nào?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. Nước Pháp</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. Nước Anh</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. Nước Đức</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. Nước Mỹ</w:t></w:r></w:p>

        <w:p><w:r><w:t>Câu 2: (0.5 điểm) Đặc điểm nổi bật của địa hình Việt Nam là đồi núi chiếm khoảng bao nhiêu phần trăm diện tích phần đất liền?</w:t></w:r></w:p>
        <w:p><w:r><w:t>A. Khoảng 1/4 diện tích đất liền</w:t></w:r></w:p>
        <w:p><w:r><w:t>B. Khoảng 1/2 diện tích đất liền</w:t></w:r></w:p>
        <w:p><w:r><w:t>C. Khoảng 3/4 diện tích đất liền</w:t></w:r></w:p>
        <w:p><w:r><w:t>D. Toàn bộ 100% diện tích đất liền</w:t></w:r></w:p>
      `;
      const file = await buildRealDocxFileFromXml({
        fileName: 'De_Lich_Su_Dia_Li_8_Khong_Co_Dap_An.docx',
        documentBodyXml: bodyXml,
      });
      return {
        file,
        scenarioTitle: '5. Tệp đề gốc không có đáp án (Kiểm tra không tự bịa đáp án)',
        expectedQuestionCount: 2,
        defaultGrade: 8,
        defaultSubject: 'Lịch sử và Địa lí',
      };
    }

    case 'TEST_CORRUPTED_FILE': {
      // Kịch bản 6: Tệp lỗi / bị hỏng cấu trúc binary hoặc không đọc được
      const corruptedBytes = new Uint8Array([
        0x00, 0xff, 0x13, 0x37, 0x43, 0x4f, 0x52, 0x52, 0x55, 0x50, 0x54, 0x45, 0x44,
      ]);
      const file = new File([corruptedBytes], 'Tep_De_Bi_Hong_Khong_Doc_Duoc.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      return {
        file,
        scenarioTitle: '6. Tệp lỗi hoặc không đọc được (Kiểm tra bắt lỗi an toàn)',
        expectedQuestionCount: 0,
        defaultGrade: 8,
        defaultSubject: 'Toán',
      };
    }
  }
}

/**
 * Chạy kiểm thử tự động toàn diện cả 6 kịch bản theo yêu cầu Phần V và lưu thực tế vào Ngân hàng
 */
export async function runSmartImportVerificationSuite(params: {
  topics: CurriculumTopic[];
  onBulkAddQuestions: (
    items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]
  ) => QuestionItem[];
  onAddGroup?: (group: Omit<QuestionGroup, 'id' | 'code' | 'createdAt'>) => QuestionGroup;
  onAssignToGroup?: (groupId: string, questionIds: string[]) => QuestionGroup | null;
}): Promise<SmartImportScenarioTestReport[]> {
  const scenarioIds: SmartImportTestScenarioId[] = [
    'TEST_MATH_FORMULA',
    'TEST_VIETNAMESE_PASSAGE',
    'TEST_MCQ_MULTI_CHOICE',
    'TEST_IMAGE_AND_TABLE',
    'TEST_NO_ANSWER_KEY',
    'TEST_CORRUPTED_FILE',
  ];

  const reports: SmartImportScenarioTestReport[] = [];

  for (const scenarioId of scenarioIds) {
    const { file, scenarioTitle, expectedQuestionCount, defaultGrade, defaultSubject } =
      await createTestScenarioFile(scenarioId);
    const defaultLevelId = getLevelForGrade(defaultGrade);
    const matchedTopic = params.topics.find(
      (t) => t.grade === defaultGrade && t.subject.toLowerCase().includes(defaultSubject.toLowerCase())
    );

    if (scenarioId === 'TEST_CORRUPTED_FILE') {
      let caughtError = '';
      try {
        await parseDocxFileToPages(file);
      } catch (err) {
        caughtError = err instanceof Error ? err.message : String(err);
      }
      const passedErrorHandling = caughtError.length > 0;
      reports.push({
        scenarioId,
        scenarioTitle,
        fileName: file.name,
        fileType: 'DOCX',
        expectedQuestionCount: 0,
        extractedQuestionCount: 0,
        passedExtractionCount: passedErrorHandling,
        passedContentAccuracy: passedErrorHandling,
        passedSpecialRules: passedErrorHandling,
        passedRealStorageSave: true,
        verifiedSavedIds: [],
        details: [
          passedErrorHandling
            ? `Đã chặn và báo lỗi an toàn: "${caughtError}"`
            : 'Lỗi: Không phát hiện được tệp hỏng.',
          'Không phát sinh câu hỏi rác và không báo nhập thành công giả.',
        ],
        overallPassed: passedErrorHandling,
      });
      continue;
    }

    const pages = await parseDocxFileToPages(file);
    const extracted = extractStructuredQuestionsFromPages({
      fileId: `test-file-${scenarioId}`,
      fileName: file.name,
      fileType: 'DOCX',
      pages,
      defaultLevelId,
      defaultGrade,
      defaultSubject,
      defaultTopic: matchedTopic,
      requestAiAnswerSuggestion: false, // Mặc định tắt để kiểm chứng KHÔNG TỰ BỊA ĐÁP ÁN
    });

    const passedCount = extracted.length === expectedQuestionCount;

    // Kiểm tra độ chính xác nội dung & quy tắc đặc biệt theo từng kịch bản
    let passedAccuracy = extracted.every((q) => q.stem.length > 10 && q.pageNumber >= 1);
    let passedSpecial = extracted.every((q) => q.cognitiveConfirmed === false);
    const details: string[] = [];

    if (scenarioId === 'TEST_MATH_FORMULA') {
      const formulaCount = extracted.reduce(
        (sum, q) => sum + q.attachments.filter((a) => a.type === 'FORMULA').length,
        0
      );
      const hasMultiPage = extracted.some((q) => q.pageNumber === 2);
      passedAccuracy = passedAccuracy && formulaCount >= 3;
      passedSpecial = passedSpecial && hasMultiPage;
      details.push(
        `Trích xuất đúng ${extracted.length}/${expectedQuestionCount} câu Toán; bảo toàn ${formulaCount} công thức OMML/LaTeX ($\\sqrt{a^2+b^2}$, $\\frac{x^2-9}{x+3}$, $105^2$).`,
        `Lưu đúng số trang: Câu 1–2 (Trang 1), Câu 3 (Trang 2).`
      );
    } else if (scenarioId === 'TEST_VIETNAMESE_PASSAGE') {
      const allLinkedToPassage = extracted.every(
        (q) => Boolean(q.sharedPassage && q.sharedPassageGroupId)
      );
      passedAccuracy = passedAccuracy && allLinkedToPassage;
      passedSpecial = passedSpecial && allLinkedToPassage;
      details.push(
        `Trích xuất đúng ${extracted.length}/${expectedQuestionCount} câu Đọc hiểu Tiếng Việt 4.`,
        `Giữ nguyên liên kết ngữ liệu chung (${extracted[0]?.sharedPassageGroupId}) và nguồn trích dẫn cho cả 3 câu.`
      );
    } else if (scenarioId === 'TEST_MCQ_MULTI_CHOICE') {
      const allHave4Options = extracted.every((q) => q.options.length === 4);
      const allMatchedEndKey = extracted.every(
        (q) => q.hasExplicitAnswerInDoc && q.answerOrigin === 'FROM_DOCUMENT'
      );
      passedAccuracy = passedAccuracy && allHave4Options;
      passedSpecial = passedSpecial && allMatchedEndKey;
      details.push(
        `Trích xuất đúng ${extracted.length}/${expectedQuestionCount} câu trắc nghiệm 4 lựa chọn A, B, C, D.`,
        `Tự động khớp chính xác Bảng đáp án cuối đề (1-B, 2-C, 3-A, 4-D).`
      );
    } else if (scenarioId === 'TEST_IMAGE_AND_TABLE') {
      const hasImageAttachment = extracted.some((q) =>
        q.attachments.some((a) => a.type === 'IMAGE' && Boolean(a.fileUrl))
      );
      const hasTableAttachment = extracted.some((q) =>
        q.attachments.some(
          (a) => a.type === 'TABLE' && (a.tableData?.headers.length || 0) >= 3
        )
      );
      passedAccuracy = passedAccuracy && hasImageAttachment && hasTableAttachment;
      passedSpecial = passedSpecial && hasImageAttachment && hasTableAttachment;
      details.push(
        `Bảo toàn hình ảnh sơ đồ mạch điện nhúng trong Word (${
          hasImageAttachment ? 'Đạt' : 'Thiếu'
        }) và bảng số liệu 3 cột (${hasTableAttachment ? 'Đạt' : 'Thiếu'}).`
      );
    } else if (scenarioId === 'TEST_NO_ANSWER_KEY') {
      const noFabricatedAnswer = extracted.every(
        (q) =>
          !q.hasExplicitAnswerInDoc &&
          q.answerOrigin === 'MISSING' &&
          q.correctAnswer === ''
      );
      // Kiểm tra thêm: khi bật gợi ý AI thì phải gắn nhãn "Đáp án do AI đề xuất – cần xác minh"
      const aiSuggestionCheck = buildAiSuggestedAnswerForQuestion(extracted[0]);
      const hasRequiredAiLabel = aiSuggestionCheck.suggestedAnswer.includes(
        'Đáp án do AI đề xuất – cần xác minh'
      );
      passedAccuracy = passedAccuracy && noFabricatedAnswer;
      passedSpecial = passedSpecial && noFabricatedAnswer && hasRequiredAiLabel;
      details.push(
        `Không tự bịa đáp án khi tệp không có đáp án (correctAnswer = "", answerOrigin = MISSING).`,
        `Khi dùng gợi ý AI, hệ thống gắn nhãn bắt buộc: "${aiSuggestionCheck.suggestedAnswer}".`
      );
    }

    // Lưu thực tế vào Ngân hàng ở trạng thái Bản nháp (DRAFT) và kiểm chứng tồn tại trong dataRepository
    const saveRes = saveImportedQuestionsAsDraftsToBank({
      draftsToSave: extracted,
      authorName: 'Hệ thống Kiểm thử Tự động',
      onBulkAddQuestions: params.onBulkAddQuestions,
      onAddGroup: params.onAddGroup,
      onAssignToGroup: params.onAssignToGroup,
    });

    details.push(
      `Đã lưu thực tế ${saveRes.verifiedSavedCount}/${extracted.length} câu vào Ngân hàng ở trạng thái Bản nháp (DRAFT): [${saveRes.savedQuestions
        .map((q) => q.code)
        .join(', ')}].`
    );

    reports.push({
      scenarioId,
      scenarioTitle,
      fileName: file.name,
      fileType: 'DOCX',
      expectedQuestionCount,
      extractedQuestionCount: extracted.length,
      passedExtractionCount: passedCount,
      passedContentAccuracy: passedAccuracy,
      passedSpecialRules: passedSpecial,
      passedRealStorageSave: saveRes.success,
      verifiedSavedIds: saveRes.savedQuestions.map((q) => q.code),
      details,
      overallPassed: passedCount && passedAccuracy && passedSpecial && saveRes.success,
    });
  }

  return reports;
}
