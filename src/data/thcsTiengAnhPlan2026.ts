import { CurriculumTopic } from '../types/domain';
import { buildThcsTopic } from './thcsToanAndTinPlan2026';

export const NDA_THCS_TA_SOURCE_DOC =
  'Phụ lục I – Kế hoạch dạy học của Tổ Chuyên môn: Tiếng Anh - GDTC (Môn Tiếng Anh Khối 6, 7, 8, 9 & Thiết bị dạy học GDTC 6-9) năm học 2026 – 2027 (Trường TH&THCS Nguyễn Đình Anh)';

export const THCS_TA_GDTC_DEPT_METADATA = {
  schoolName: 'TRƯỜNG TH&THCS NGUYỄN ĐÌNH ANH',
  departmentName: 'TỔ: TIẾNG ANH - GDTC',
  locationAndDate: 'Năm học 2026 – 2027',
  planTitle:
    'KẾ HOẠCH DẠY HỌC CỦA TỔ CHUYÊN MÔN: MÔN HỌC/HOẠT ĐỘNG GIÁO DỤC: TIẾNG ANH, GDTC KHỐI LỚP 1, 2, 3, 4, 5, 6, 7, 8, 9',
  academicYear: '2026 – 2027',
  headOfDepartment: 'Tổ trưởng Tổ Tiếng Anh - GDTC',
  principal: 'Phan Đức Quý',
  studentAndClassSummary:
    'Số lớp: 33 lớp | Số học sinh: 1.014 HS (Nữ: 499 HS) | Số học sinh học chuyên đề lựa chọn (nếu có): 0',
  teacherForceSummary:
    'Số giáo viên: 09 GV / 05 nữ (Tiếng Anh: 05 GV; GDTC: 04 GV) | Trình độ đào tạo: Cao đẳng: 01; Đại học: 08 | Mức đạt chuẩn nghề nghiệp giáo viên: Tốt: 02; Khá: 07; Đạt: 0',
  facilitiesSummary: [
    'Thiết bị dạy học môn Tiếng Anh 6, 7, 8, 9: Mỗi khối trang bị TV (03 cái) và Computer (03 cái) phục vụ thực hành tiết dạy PowerPoint (Nhà trường trang bị).',
    'Thiết bị dạy học môn Giáo dục thể chất 6: Bóng ném (40 quả – 3 bài), Bóng đá (06 quả – 4 bài), Cờ, Còi, đồng hồ thể thao (02 cái – Tất cả các bài), Tranh bài TD (01 bộ – 3 bài).',
    'Thiết bị dạy học môn Giáo dục thể chất 7: Hố cát (01 hố – 4 bài), Bóng đá (06 quả – 3 bài), Cuốc, xẻng (02 cái – 4 bài), Đồng hồ thể thao (02 cái – 6 bài), Tranh bài TD (01 bộ – 3 bài).',
    'Thiết bị dạy học môn Giáo dục thể chất 8: Hố cát (01 hố – 4 bài), Bóng đá (06 quả – 3 bài), Cuốc, xẻng (02 cái – 4 bài), Đồng hồ thể thao (02 cái – 6 bài), Bàn đạp (02 cái – 3 bài).',
    'Thiết bị dạy học môn Giáo dục thể chất 9: Hố cát (01 hố – 4 bài), Bóng đá (20 quả – 3 bài), Cuốc, xẻng (02 cái – 4 bài), Đồng hồ thể thao (02 cái – 6 bài), Bàn đạp (02 cái – 3 bài), Đệm (04 cái – 4 bài).',
    'Phòng học bộ môn/phòng thí nghiệm/phòng đa năng/sân chơi, bãi tập: Sân tập thể dục (01 sân) – Giảng dạy môn Giáo dục thể chất.',
  ],
  subjectAllocationByGrade: {
    6: [
      {
        subject: 'Tiếng Anh',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 18 tuần x 3 tiết = 54 tiết; HKII: 17 tuần x 3 tiết = 51 tiết) | 12 Units (Unit 1–12), 4 Reviews & Kiểm tra định kì | Tích hợp NLS (5.3 TC1a) & Năng lực AI (6.A1.1)',
      },
    ],
    7: [
      {
        subject: 'Tiếng Anh',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 18 tuần x 3 tiết = 54 tiết; HKII: 17 tuần x 3 tiết = 51 tiết) | 12 Units (Unit 1–12), 4 Reviews & Kiểm tra định kì | Tích hợp NLS (1.1.TC1b, 1.1TC1a) & Năng lực AI (7.A3.1, 7.A1.1)',
      },
    ],
    8: [
      {
        subject: 'Tiếng Anh',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 18 tuần x 3 tiết = 54 tiết; HKII: 17 tuần x 3 tiết = 51 tiết) | 12 Units (Unit 1–12), 4 Reviews & Kiểm tra định kì | Tích hợp NLS (3.1.TC2b, 1.1.TC2b) & Năng lực AI (8.D1.1, 8.C1.1)',
      },
    ],
    9: [
      {
        subject: 'Tiếng Anh',
        totalPeriods: 105,
        detail:
          'Cả năm: 35 tuần x 3 tiết = 105 tiết (HKI: 18 tuần x 3 tiết = 54 tiết; HKII: 17 tuần x 3 tiết = 51 tiết) | 12 Units (Unit 1–12), 4 Reviews & Kiểm tra định kì | Tích hợp NLS (3.1.TC2b, 2.2.TC2a, 5.3 TC1a, 1.1.TC2b) & Năng lực AI (9.A3.1, 9.C2.2)',
      },
    ],
  },
};

// ============================================================================
// 1.1.1. MÔN TIẾNG ANH 6 (CẢ NĂM: 35 TUẦN x 3 TIẾT = 105 TIẾT | HKI: 54 TIẾT, HKII: 51 TIẾT)
// ============================================================================
export const GRADE6_TIENG_ANH_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'thcs-ta6-hk1-intro-u1',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U1',
    chapterTitle: 'Introduction & Unit 1: My new school (Tiết 1 – 8)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 3',
    totalPeriods: 8,
    adjustedContentSummary:
      'Ôn tập từ vựng, ngữ pháp lớp 5; chủ đề My new school; phát âm /ɑː/ và /ʌ/; thì hiện tại đơn (Present simple) và trạng từ chỉ tần suất (adverbs of frequency); kỹ năng Nghe - Nói - Đọc - Viết về trường học mới.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t1',
        week: 'Tuần 1',
        lessonName: 'Introduction',
        periodAllocation: 'Tiết 1',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary and grammar points that they have learnt in grade 5.',
      },
      {
        id: 'ta6-t2',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 1: Getting started',
        periodAllocation: 'Tiết 2',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: My new school; Introduce some vocabulary related to the topic of the unit and the grammar point of this unit: the present simple.',
      },
      {
        id: 'ta6-t3',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 3',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic; Pronounce the sounds /ɑː/ and /ʌ/ correctly.',
      },
      {
        id: 'ta6-t4',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 4',
        periodsCount: 1,
        adjustedContent: 'Use the Present simple and adverbs of frequency.',
      },
      {
        id: 'ta6-t5',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 4: Communication',
        periodAllocation: 'Tiết 5',
        periodsCount: 1,
        adjustedContent: 'Introduce someone to someone else.',
      },
      {
        id: 'ta6-t6',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 6',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about schools; Talk about the type of school one would like to go to.',
      },
      {
        id: 'ta6-t7',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 7',
        periodsCount: 1,
        adjustedContent:
          "Listen for specific information about school activities; Write a paragraph about one's school.",
      },
      {
        id: 'ta6-t8',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 8',
        periodsCount: 1,
        adjustedContent:
          'Revise vocabulary items they have learnt in the unit, the present simple tense and the position of adverbs of frequency in sentences.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk1-u2',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U2',
    chapterTitle: 'Unit 2: My house (Tiết 9 – 15)',
    semester: 'HK1',
    weekRange: 'Tuần 3 – Tuần 5',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về các kiểu nhà, phòng và đồ nội thất; phát âm âm cuối /s/ và /z/; sở hữu cách (possessive case) và giới từ chỉ nơi chốn (prepositions of place). Tích hợp Năng lực số (NLS: 5.3 TC1a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t9',
        week: 'Tuần 3',
        lessonName: 'Unit 2: Lesson 1: Getting started',
        periodAllocation: 'Tiết 9',
        periodsCount: 1,
        adjustedContent:
          "Set the context for the introductory text; Introduce the topic of the unit: My house; Develop Ss' knowledge of the vocabulary about types of house.",
      },
      {
        id: 'ta6-t10',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 10',
        periodsCount: 1,
        adjustedContent:
          'Use the words for types of house, rooms and furniture; Pronounce the final sounds /s/ and /z/ correctly.',
      },
      {
        id: 'ta6-t11',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 11',
        periodsCount: 1,
        adjustedContent:
          'Use possessive case to describe possessions; Use prepositions of place to describe where people or things are. [Tích hợp NLS: 5.3 TC1a]',
        note: 'Tích hợp NLS: 5.3 TC1a',
      },
      {
        id: 'ta6-t12',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 4: Communication',
        periodAllocation: 'Tiết 12',
        periodsCount: 1,
        adjustedContent: 'Give suggestions.',
      },
      {
        id: 'ta6-t13',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 13',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about rooms and furniture; Describe houses, rooms and furniture.',
      },
      {
        id: 'ta6-t14',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 14',
        periodsCount: 1,
        adjustedContent:
          "Listen for specific information about someone's house; Write an email to a friend describing a house.",
      },
      {
        id: 'ta6-t15',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 15',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary items they have learnt in the unit, the possessive case and the prepositions of place.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk1-u3',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U3',
    chapterTitle: 'Unit 3: My friends (Tiết 16 – 22)',
    semester: 'HK1',
    weekRange: 'Tuần 6 – Tuần 8',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về các bộ phận cơ thể, ngoại hình và tính cách; phát âm /b/ và /p/; thì hiện tại tiếp diễn (present continuous); hỏi đáp về ngoại hình, tính cách và viết nhật ký về người bạn thân.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t16',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 1: Getting started',
        periodAllocation: 'Tiết 16',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: My friend; Revise and provide Ss with some vocabulary to describe parts of the body and appearance.',
      },
      {
        id: 'ta6-t17',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 17',
        periodsCount: 1,
        adjustedContent:
          'Use the words for body parts, appearance and personality; Pronounce the sounds /b/ and /p/ correctly.',
      },
      {
        id: 'ta6-t18',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 18',
        periodsCount: 1,
        adjustedContent: 'Use the present continuous to talk about things happening now.',
      },
      {
        id: 'ta6-t19',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 4: Communication',
        periodAllocation: 'Tiết 19',
        periodsCount: 1,
        adjustedContent: 'Ask about appearance and personality.',
      },
      {
        id: 'ta6-t20',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 20',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about friends and summer camps; talk about friends and summer camps.',
      },
      {
        id: 'ta6-t21',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 21',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about best friends; Write a diary entry about best friends.',
      },
      {
        id: 'ta6-t22',
        week: 'Tuần 8',
        lessonName: 'Unit 3: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 22',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary items they have learnt in the unit; Revise the present continuous tense; Revise the differences between the present simple and the present continuous.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk1-u4-rev1',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U4-R1',
    chapterTitle: 'Unit 4: My neighbourhood, Review 1 & Kiểm tra giữa kì I (Tiết 23 – 34)',
    semester: 'HK1',
    weekRange: 'Tuần 8 – Tuần 12',
    totalPeriods: 12,
    adjustedContentSummary:
      'Từ vựng về các địa điểm trong khu phố; phát âm /ɪ/ và /iː/; tính từ so sánh hơn (comparative adjectives); hỏi và chỉ đường; Ôn tập Review 1 (Units 1–3) và Kiểm tra Giữa học kì I. Tích hợp NLS (5.3 TC1a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t23',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 1: Getting started',
        periodAllocation: 'Tiết 23',
        periodsCount: 1,
        adjustedContent:
          "Set the context for the listening and reading text; Introduce the topic of the unit: My neighbourhood; Know how to use let's and shall we to make suggestions; Know how to give directions through the conversation.",
      },
      {
        id: 'ta6-t24',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 24',
        periodsCount: 1,
        adjustedContent:
          'Use the words for places in a neighbourhood; Pronounce the sounds /ɪ/ and /iː/ correctly.',
      },
      {
        id: 'ta6-t25',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 25',
        periodsCount: 1,
        adjustedContent: 'Compare two people or things using comparative adjectives.',
      },
      {
        id: 'ta6-t26',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 4: Communication',
        periodAllocation: 'Tiết 26',
        periodsCount: 1,
        adjustedContent: 'Ask for and give directions to some places.',
      },
      {
        id: 'ta6-t27',
        week: 'Tuần 9',
        lessonName: 'REVIEW 1 (Language)',
        periodAllocation: 'Tiết 27',
        periodsCount: 1,
        adjustedContent:
          'Revise the language they have learnt and the skills they have practised in Units 1-3.',
      },
      {
        id: 'ta6-t28',
        week: 'Tuần 10',
        lessonName: 'REVIEW 1 (Skills)',
        periodAllocation: 'Tiết 28',
        periodsCount: 1,
        adjustedContent:
          'Revise the language they have learnt and the skills they have practised in Units 1-3.',
      },
      {
        id: 'ta6-t29',
        week: 'Tuần 10',
        lessonName: 'REVIEW FOR THE MID FIRST TERM TEST + THE MID FIRST TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 29',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 1-3; Revise the language of unit 1-3 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta6-t30',
        week: 'Tuần 10',
        lessonName: 'THE MID FIRST TERM TEST',
        periodAllocation: 'Tiết 30',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 1-3; Revise the language of unit 1-3 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta6-t31',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 31',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about a neighbourhood; Talk about a neighbourhood.',
      },
      {
        id: 'ta6-t32',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 32',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about a neighbourhood; Write a paragraph to describe a neighbourhood.',
      },
      {
        id: 'ta6-t33',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 33',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary items they have learnt in the unit; Revise the form and use of comparative adjectives. [Tích hợp NLS: 5.3 TC1a]',
        note: 'Tích hợp NLS: 5.3 TC1a',
      },
      {
        id: 'ta6-t34',
        week: 'Tuần 12',
        lessonName: 'THE MID FIRST TERM TEST CORRECTION',
        periodAllocation: 'Tiết 34',
        periodsCount: 1,
        adjustedContent:
          'Check their knowledge of Units 1-4 that they have learnt by doing a test, then to have solution to review their knowledge again.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk1-u5',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U5',
    chapterTitle: 'Unit 5: Natural Wonders of Viet Nam (Tiết 35 – 41)',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 14',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về thiên nhiên và vật dụng du lịch; phát âm /t/ và /d/; danh từ đếm được/không đếm được (countable/uncountable nouns); động từ khuyết thiếu must/mustn’t. Tích hợp Năng lực AI (6.A1.1).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t35',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 1: Getting started',
        periodAllocation: 'Tiết 35',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: Natural Wonder of Viet Nam; Revise and learn more nouns for things in nature. [Tích hợp AI: 6.A1.1]',
        note: 'Tích hợp AI: 6.A1.1',
      },
      {
        id: 'ta6-t36',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 36',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to things in nature and travel items; Pronounce the sounds /t/ and /d/ correctly.',
      },
      {
        id: 'ta6-t37',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 37',
        periodsCount: 1,
        adjustedContent:
          "Use countable and uncountable nouns; Use the modal verb must / mustn't to give orders.",
      },
      {
        id: 'ta6-t38',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 4: Communication',
        periodAllocation: 'Tiết 38',
        periodsCount: 1,
        adjustedContent: 'Make and accept appointments.',
      },
      {
        id: 'ta6-t39',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 39',
        periodsCount: 1,
        adjustedContent:
          "Read for specific information about natural wonders; Talk about famous places, and what you must / mustn't do there.",
      },
      {
        id: 'ta6-t40',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 40',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about a natural wonder; Write a paragraph about a natural wonder.',
      },
      {
        id: 'ta6-t41',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 41',
        periodsCount: 1,
        adjustedContent:
          "Revise the vocabulary items they have learnt in the unit; Revise the use of countable and uncountable nouns in sentences; Revise the use of must / mustn't in context.",
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk1-u6-rev2',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U6-R2',
    chapterTitle: 'Unit 6: Our Tet holiday, Review 2 & Kiểm tra cuối kì I (Tiết 42 – 54)',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 13,
    adjustedContentSummary:
      'Từ vựng về ngày Tết cổ truyền; phát âm /s/ và /ʃ/; cấu trúc khuyên nhủ should/shouldn’t và lượng từ some/any; chúc Tết, viết email về ngày Tết; Ôn tập Review 2 (Units 4–6) và Kiểm tra Cuối học kì I.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t42',
        week: 'Tuần 14',
        lessonName: 'Unit 6: Lesson 1: Getting started',
        periodAllocation: 'Tiết 42',
        periodsCount: 1,
        adjustedContent:
          "Set the context for the introductory text; Introduce the topic of the unit: Our Tet holiday; Develop Ss' knowledge of the vocabulary relating to Tet.",
      },
      {
        id: 'ta6-t43',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 43',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to things and activities at Tet; Pronounce the sounds /s/ and /ʃ/ correctly.',
      },
      {
        id: 'ta6-t44',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 44',
        periodsCount: 1,
        adjustedContent: "Use should / shouldn't for advice; Use some / any for amount.",
      },
      {
        id: 'ta6-t45',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 4: Communication',
        periodAllocation: 'Tiết 45',
        periodsCount: 1,
        adjustedContent: "Say New Year's wishes.",
      },
      {
        id: 'ta6-t46',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 46',
        periodsCount: 1,
        adjustedContent:
          "Read for specific information about New Year's practices; Talk about what children should / shouldn't do at Tet.",
      },
      {
        id: 'ta6-t47',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 47',
        periodsCount: 1,
        adjustedContent:
          "Listen for general and specific information about preparations for Tet; Write an email about what children should / shouldn't do at Tet.",
      },
      {
        id: 'ta6-t48',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 48',
        periodsCount: 1,
        adjustedContent:
          "Revise the vocabulary about Tet, revise the use of should / shouldn't and the use of some and any.",
      },
      {
        id: 'ta6-t49',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Language)',
        periodAllocation: 'Tiết 49',
        periodsCount: 1,
        adjustedContent: 'Revise the language they have learnt in Units 4-6.',
      },
      {
        id: 'ta6-t50',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Skills)',
        periodAllocation: 'Tiết 50',
        periodsCount: 1,
        adjustedContent: 'Revise the skills they have practised in Units 4-6.',
      },
      {
        id: 'ta6-t51',
        week: 'Tuần 17',
        lessonName: 'The 1st semester exam (Speaking)',
        periodAllocation: 'Tiết 51',
        periodsCount: 1,
        adjustedContent: "Evaluate Ss' levels.",
      },
      {
        id: 'ta6-t52',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 52',
        periodsCount: 1,
        adjustedContent:
          'Revise the language they have learnt and the skills they have practised in Units 4-6.',
      },
      {
        id: 'ta6-t53',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 53',
        periodsCount: 1,
        adjustedContent:
          'Revise the language they have learnt and the skills they have practised in Units 4-6.',
      },
      {
        id: 'ta6-t54',
        week: 'Tuần 18',
        lessonName: 'The 1st semester exam',
        periodAllocation: 'Tiết 54',
        periodsCount: 1,
        adjustedContent: "Evaluate Ss' levels.",
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk2-u7',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U7',
    chapterTitle: 'Unit 7: Television (Tiết 55 – 61)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 21',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về chương trình truyền hình và nhân vật; phát âm /θ/ và /ð/; từ để hỏi Wh-questions và liên từ (conjunctions) trong câu ghép; đọc lịch phát sóng TV và viết đoạn văn về thói quen xem TV. Tích hợp NLS (5.3 TC1a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t55',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 1: Getting started',
        periodAllocation: 'Tiết 55',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Television; Learn the names of some TV programmes; Focus on the use of adjectives to describe TV programmes and characters, talk about what TV programme(s) they like.',
      },
      {
        id: 'ta6-t56',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 56',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to TV programmes and people; Pronounce the sounds /θ/ and /ð/ correctly.',
      },
      {
        id: 'ta6-t57',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 57',
        periodsCount: 1,
        adjustedContent:
          'Use wh-question words to make questions; Use conjunctions to connect and clauses in compound sentences.',
      },
      {
        id: 'ta6-t58',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 4: Communication',
        periodAllocation: 'Tiết 58',
        periodsCount: 1,
        adjustedContent: 'Ask for and give information about TV programmes.',
      },
      {
        id: 'ta6-t59',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 59',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about a TV guide; Talk about a favourite TV programme.',
      },
      {
        id: 'ta6-t60',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 60',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about different TV programmes; Write a paragraph about TV-watching habits.',
      },
      {
        id: 'ta6-t61',
        week: 'Tuần 21',
        lessonName: 'Unit 7: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 61',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary about television; Revise the use of question words and the use of conjunctions. [Tích hợp NLS: 5.3 TC1a]',
        note: 'Tích hợp NLS: 5.3 TC1a',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk2-u8',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U8',
    chapterTitle: 'Unit 8: Sports and Games (Tiết 62 – 68)',
    semester: 'HK2',
    weekRange: 'Tuần 21 – Tuần 23',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng chủ đề Thể thao và Trò chơi; phát âm /e/ và /æ/; thì quá khứ đơn (past simple) và câu mệnh lệnh (imperatives); bày tỏ và đáp lại lời chúc mừng; nói và viết về môn thể thao/trò chơi yêu thích.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t62',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 1: Getting started',
        periodAllocation: 'Tiết 62',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Sports and Games; Revise / learn names of some sports and games through pictures.',
      },
      {
        id: 'ta6-t63',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 63',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic Sports and Games; Pronounce the sounds /e/ and /æ/ correctly.',
      },
      {
        id: 'ta6-t64',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 64',
        periodsCount: 1,
        adjustedContent:
          'Use the past simple; Use imperatives to tell someone to do something.',
      },
      {
        id: 'ta6-t65',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 4: Communication',
        periodAllocation: 'Tiết 65',
        periodsCount: 1,
        adjustedContent: 'Express and respond to congratulations.',
      },
      {
        id: 'ta6-t66',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 66',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about favourite sports stars; Talk about famous sports people, traditional game.',
      },
      {
        id: 'ta6-t67',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 67',
        periodsCount: 1,
        adjustedContent:
          'Listen for general and specific information about sport(s) / game(s); Write a paragraph about a sport / game.',
      },
      {
        id: 'ta6-t68',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 68',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary about sports and games; Revise the use of past simple tense.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk2-u9-rev3',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U9-R3',
    chapterTitle: 'Unit 9: Cities of the world, Review 3 & Kiểm tra giữa kì II (Tiết 69 – 79)',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 27',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về các thành phố và địa danh nổi tiếng thế giới; phát âm /əʊ/ và /aʊ/; tính từ sở hữu và đại từ sở hữu; câu cảm thán với What; viết bưu thiếp kỳ nghỉ; Ôn tập Review 3 (Units 7–9) và Kiểm tra Giữa học kì II. Tích hợp NLS (5.3 TC1a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t69',
        week: 'Tuần 23',
        lessonName: 'Unit 9: Lesson 1: Getting started',
        periodAllocation: 'Tiết 69',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Cities of the world; Focus on the use of adjectives to describe cities; Visualise some landmarks of the cities.',
      },
      {
        id: 'ta6-t70',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 70',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to cities and landmarks; Pronounce the sounds /əʊ/ and /aʊ/ correctly.',
      },
      {
        id: 'ta6-t71',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 71',
        periodsCount: 1,
        adjustedContent:
          'Use possessive adjectives and possessive pronouns. [Tích hợp NLS: 5.3 TC1a]',
        note: 'Tích hợp NLS: 5.3 TC1a',
      },
      {
        id: 'ta6-t72',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 4: Communication',
        periodAllocation: 'Tiết 72',
        periodsCount: 1,
        adjustedContent: 'Express exclamations with What.',
      },
      {
        id: 'ta6-t73',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 73',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about a holiday postcard; talk about a city.',
      },
      {
        id: 'ta6-t74',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 74',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about a description of a city; Write a holiday postcard.',
      },
      {
        id: 'ta6-t75',
        week: 'Tuần 25',
        lessonName: 'REVIEW 3 (Language)',
        periodAllocation: 'Tiết 75',
        periodsCount: 1,
        adjustedContent:
          'Revise the language they have learnt and the skills they have practised in Units 7-9.',
      },
      {
        id: 'ta6-t76',
        week: 'Tuần 26',
        lessonName: 'REVIEW 3 (Skills)',
        periodAllocation: 'Tiết 76',
        periodsCount: 1,
        adjustedContent:
          'Revise the language they have learnt and the skills they have practised in Units 7-9.',
      },
      {
        id: 'ta6-t77',
        week: 'Tuần 26',
        lessonName: 'REVIEW FOR THE MID SECOND TERM TEST + THE MID SECOND TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 77',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 7-9; Revise the language of unit 7-9 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta6-t78',
        week: 'Tuần 26',
        lessonName: 'THE MID SECOND TERM TEST',
        periodAllocation: 'Tiết 78',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 7-9; Revise the language of unit 7-9 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta6-t79',
        week: 'Tuần 27',
        lessonName: 'Unit 9: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 79',
        periodsCount: 1,
        adjustedContent:
          'Revise the adjectives used to describe cities and landmarks; Revise the possessive adjectives and possessive pronouns in context.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk2-u10',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U10',
    chapterTitle: 'Unit 10: Our Houses in the Future & Sửa bài KT giữa kì II (Tiết 80 – 87)',
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 29',
    totalPeriods: 8,
    adjustedContentSummary:
      'Từ vựng về các kiểu nhà và thiết bị thông minh trong tương lai; trọng âm từ có 2 âm tiết; thì tương lai đơn (future simple) và động từ khuyết thiếu might; nói và viết về ngôi nhà mơ ước. Tích hợp Năng lực AI (6.A1.1).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t80',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 1: Getting started',
        periodAllocation: 'Tiết 80',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Our Houses in the Future. [Tích hợp AI: 6.A1.1]',
        note: 'Tích hợp AI: 6.A1.1',
      },
      {
        id: 'ta6-t81',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 81',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to types of houses and appliances in the house; Pronounce the two-syllable words correctly.',
      },
      {
        id: 'ta6-t82',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 82',
        periodsCount: 1,
        adjustedContent:
          "Use future simple and might for future possibility; Know how much progress they've learnt, how well they've made, which language area they must practice more.",
      },
      {
        id: 'ta6-t83',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 4: Communication',
        periodAllocation: 'Tiết 83',
        periodsCount: 1,
        adjustedContent: 'Express surprise.',
      },
      {
        id: 'ta6-t84',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 84',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about houses and appliances in the future; Talk about different house in the future.',
      },
      {
        id: 'ta6-t85',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 85',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about dream houses; Write a paragraph about a dream house.',
      },
      {
        id: 'ta6-t86',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 86',
        periodsCount: 1,
        adjustedContent: 'Revise the use of might for future possibility.',
      },
      {
        id: 'ta6-t87',
        week: 'Tuần 29',
        lessonName: 'THE MID SECOND TERM TEST CORRECTION',
        periodAllocation: 'Tiết 87',
        periodsCount: 1,
        adjustedContent:
          'Check their knowledge of Units 7-9 that they have learnt by doing a test, then to have solution to review their knowledge again.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk2-u11',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U11',
    chapterTitle: 'Unit 11: Our greener world (Tiết 88 – 94)',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 32',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về bảo vệ môi trường (reduce, reuse, recycle); nhịp điệu câu (sentence rhythm); mạo từ a/an/the và câu điều kiện loại 1 (first conditional); đưa ra lời cảnh báo và viết ý tưởng cho câu lạc bộ xanh.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t88',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 1: Getting started',
        periodAllocation: 'Tiết 88',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: Our greener world.',
      },
      {
        id: 'ta6-t89',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 89',
        periodsCount: 1,
        adjustedContent:
          'Use the words for things that can be reduced, reused and recycled; Say sentences with correct rhythm.',
      },
      {
        id: 'ta6-t90',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 90',
        periodsCount: 1,
        adjustedContent:
          'Use the articles correctly; Use the first conditional to talk about possibilities.',
      },
      {
        id: 'ta6-t91',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 4: Communication',
        periodAllocation: 'Tiết 91',
        periodsCount: 1,
        adjustedContent: 'Give warnings.',
      },
      {
        id: 'ta6-t92',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 92',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about ways to go green at school; Talk about tips for going green.',
      },
      {
        id: 'ta6-t93',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 93',
        periodsCount: 1,
        adjustedContent:
          'Listen for details about ideas for a green club; Write a paragraph about ideas for a green club.',
      },
      {
        id: 'ta6-t94',
        week: 'Tuần 32',
        lessonName: 'Unit 11: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 94',
        periodsCount: 1,
        adjustedContent:
          'Revise the words Ss have learnt in the unit; Practise using the articles a / an and the and the first conditional.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta6-hk2-u12-rev4',
    grade: 6,
    subject: 'Tiếng Anh',
    chapterCode: 'TA6-U12-R4',
    chapterTitle: 'Unit 12: Robots, Review 4 & Kiểm tra cuối kì II (Tiết 95 – 105)',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về các hoạt động hằng ngày và khả năng của người máy (Robots); ngữ điệu câu trần thuật; tính từ so sánh nhất (superlative adjectives); bày tỏ đồng tình/không đồng tình; Ôn tập Review 4 (Units 10–12) và Kiểm tra Cuối học kì II.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta6-t95',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 1: Getting started',
        periodAllocation: 'Tiết 95',
        periodsCount: 1,
        adjustedContent:
          "Set the context for the introductory; Introduce the topic of the unit: Robots; Develop Ss' knowledge of vocabulary about daily activities.",
      },
      {
        id: 'ta6-t96',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 96',
        periodsCount: 1,
        adjustedContent:
          'Use the words for daily activities; Say statements with correct tones.',
      },
      {
        id: 'ta6-t97',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 97',
        periodsCount: 1,
        adjustedContent: 'Compare people and things using superlative adjectives.',
      },
      {
        id: 'ta6-t98',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 4: Communication',
        periodAllocation: 'Tiết 98',
        periodsCount: 1,
        adjustedContent: 'Express agreement and disagreement about something.',
      },
      {
        id: 'ta6-t99',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 99',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about an international robot show; Talk about what robots can do.',
      },
      {
        id: 'ta6-t100',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 100',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about what robots can do; Write a paragraph about a robot one would like to have.',
      },
      {
        id: 'ta6-t101',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 101',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary items they have learnt in the unit; Revise the form and use of superlative adjectives.',
      },
      {
        id: 'ta6-t102',
        week: 'Tuần 34',
        lessonName: 'Review 4 (Language)',
        periodAllocation: 'Tiết 102',
        periodsCount: 1,
        adjustedContent: 'Revise the language they have learnt in Units 10-12.',
      },
      {
        id: 'ta6-t103',
        week: 'Tuần 35',
        lessonName: 'Review 4 (Skills)',
        periodAllocation: 'Tiết 103',
        periodsCount: 1,
        adjustedContent: 'Revise the skills they have learnt in Units 10-12.',
      },
      {
        id: 'ta6-t104',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam (Speaking)',
        periodAllocation: 'Tiết 104',
        periodsCount: 1,
        adjustedContent: "Evaluate Ss' levels.",
      },
      {
        id: 'ta6-t105',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam',
        periodAllocation: 'Tiết 105',
        periodsCount: 1,
        adjustedContent: "Evaluate Ss' levels.",
      },
    ],
  }),
];

// ============================================================================
// 1.1.2. MÔN TIẾNG ANH 7 (CẢ NĂM: 35 TUẦN x 3 TIẾT = 105 TIẾT | HKI: 54 TIẾT, HKII: 51 TIẾT)
// ============================================================================
export const GRADE7_TIENG_ANH_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'thcs-ta7-hk1-intro-u1',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U1',
    chapterTitle: 'Introduction & Unit 1: Hobbies (Tiết 1 – 8)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 3',
    totalPeriods: 8,
    adjustedContentSummary:
      'Ôn tập kiến thức lớp 6; từ vựng về sở thích (Hobbies) và động từ chỉ sự yêu/ghét (verbs of liking and disliking); phát âm /ə/ và /ɜː/; thì hiện tại đơn; nói và viết về sở thích cá nhân.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t1',
        week: 'Tuần 1',
        lessonName: 'Introduction',
        periodAllocation: 'Tiết 1',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary and grammar points that they have learnt in grade 6.',
      },
      {
        id: 'ta7-t2',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 1: Getting started',
        periodAllocation: 'Tiết 2',
        periodsCount: 1,
        adjustedContent: 'Use the words related to hobbies to talk about hobbies.',
      },
      {
        id: 'ta7-t3',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 3',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to hobbies and verbs of liking and disliking to talk about different hobbies; Pronounce the sounds /ə/ and /ɜː/ correctly.',
      },
      {
        id: 'ta7-t4',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 4',
        periodsCount: 1,
        adjustedContent: 'Use the present simple tense.',
      },
      {
        id: 'ta7-t5',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 4: Communication',
        periodAllocation: 'Tiết 5',
        periodsCount: 1,
        adjustedContent: 'Talk about likes and dislikes.',
      },
      {
        id: 'ta7-t6',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 6',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about a hobby; Talk about the benefits of hobbies.',
      },
      {
        id: 'ta7-t7',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 7',
        periodsCount: 1,
        adjustedContent:
          "Listen for specific information about one's hobby; Write a paragraph about one's hobby.",
      },
      {
        id: 'ta7-t8',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 8',
        periodsCount: 1,
        adjustedContent:
          'Revise the vocabulary items they have learnt in the unit; Revise the present simple (questions and negative sentences); Develop the skill of working in groups to do a project; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk1-u2',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U2',
    chapterTitle: 'Unit 2: Healthy living (Tiết 9 – 15)',
    semester: 'HK1',
    weekRange: 'Tuần 3 – Tuần 5',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về lối sống lành mạnh (Healthy living) và các vấn đề sức khỏe; phát âm /f/ và /v/; nhận diện và viết câu đơn (simple sentences); đưa ra lời khuyên bảo vệ sức khỏe và phòng tránh vi-rút.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t9',
        week: 'Tuần 3',
        lessonName: 'Unit 2: Lesson 1: Getting started',
        periodAllocation: 'Tiết 9',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Healthy living; Identify and talk about the daily activities and decide if they are good or bad for health.',
      },
      {
        id: 'ta7-t10',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 10',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Healthy living; Use the words about healthy activities and health problems; Pronounce and recognize the sounds /f/ and /v/ in isolation and in context.',
      },
      {
        id: 'ta7-t11',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 11',
        periodsCount: 1,
        adjustedContent: 'Know how to recognize and write simple sentences.',
      },
      {
        id: 'ta7-t12',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 4: Communication',
        periodAllocation: 'Tiết 12',
        periodsCount: 1,
        adjustedContent:
          'Ask for and give health tips; Practice using some grammar points and vocabulary related to the topic.',
      },
      {
        id: 'ta7-t13',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 13',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about acne; Talk about how to deal with some health problems.',
      },
      {
        id: 'ta7-t14',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 14',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about some advice about healthy habits; Write a paragraph of some advice to avoid viruses.',
      },
      {
        id: 'ta7-t15',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 15',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 2; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk1-u3',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U3',
    chapterTitle: 'Unit 3: Community service (Tiết 16 – 22)',
    semester: 'HK1',
    weekRange: 'Tuần 6 – Tuần 8',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về các hoạt động vì cộng đồng (Community activities); phát âm đuôi -ed (/t/, /d/, /ɪd/); thì quá khứ đơn (past simple); đưa ra lời khen (giving compliments) và viết email về hoạt động tình nguyện. Tích hợp NLS (1.1.TC1b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t16',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 1: Getting started',
        periodAllocation: 'Tiết 16',
        periodsCount: 1,
        adjustedContent: 'Use the words related to community activities.',
      },
      {
        id: 'ta7-t17',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 17',
        periodsCount: 1,
        adjustedContent:
          'Use words related to community activities; Pronounce the sounds /t/, /d/ and /ɪd/ correctly. [Tích hợp NLS: 1.1.TC1b]',
        note: 'Tích hợp NLS: 1.1.TC1b',
      },
      {
        id: 'ta7-t18',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 18',
        periodsCount: 1,
        adjustedContent:
          'Understand the use of the past simple tense; Practice using the past simple to talk about past activities.',
      },
      {
        id: 'ta7-t19',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 4: Communication',
        periodAllocation: 'Tiết 19',
        periodsCount: 1,
        adjustedContent:
          'Know how to give compliments; Discuss and present the benefits of community activities.',
      },
      {
        id: 'ta7-t20',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 20',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about community activities at a school; Talk about the reasons why students join different community activities.',
      },
      {
        id: 'ta7-t21',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 21',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about some community activities and their benefits; Write an email about community activities one did last summer.',
      },
      {
        id: 'ta7-t22',
        week: 'Tuần 8',
        lessonName: 'Unit 3: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 22',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 3; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk1-u4-rev1',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U4-R1',
    chapterTitle: 'Unit 4: Music and arts, Review 1 & Kiểm tra giữa kì I (Tiết 23 – 34)',
    semester: 'HK1',
    weekRange: 'Tuần 8 – Tuần 12',
    totalPeriods: 12,
    adjustedContentSummary:
      'Từ vựng về Âm nhạc và Nghệ thuật; phát âm /ʃ/ và /ʒ/; cấu trúc so sánh với like, different from, (not) as ... as; bày tỏ sự yêu thích (expressing preferences); Ôn tập Review 1 (Units 1–3) và Kiểm tra Giữa học kì I.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t23',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 1: Getting started',
        periodAllocation: 'Tiết 23',
        periodsCount: 1,
        adjustedContent:
          'Have an overview about the topic Music and arts; Use the vocabulary to talk about Music and arts.',
      },
      {
        id: 'ta7-t24',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 24',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Music and arts; Pronounce and recognize the sounds /ʃ/ and /ʒ/.',
      },
      {
        id: 'ta7-t25',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 25',
        periodsCount: 1,
        adjustedContent:
          'Know how to recognize and write comparisons with like, different from, (not) as ... as.',
      },
      {
        id: 'ta7-t26',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 4: Communication',
        periodAllocation: 'Tiết 26',
        periodsCount: 1,
        adjustedContent:
          'Learn how to deal with some ways of expressing preferences; Practise using some grammar points and vocabulary related to the topic.',
      },
      {
        id: 'ta7-t27',
        week: 'Tuần 9',
        lessonName: 'REVIEW 1 (Language)',
        periodAllocation: 'Tiết 27',
        periodsCount: 1,
        adjustedContent:
          'Revise the words related to hobbies and verbs of liking and disliking, healthy activities and health problems, and words related to community activities; Pronounce the sounds /ə/, /ɜː/, /f/, /v/, /t/, /d/, /ɪd/ correctly in isolation and in context; Revise the present simple tense, past simple to talk about past activities; Revise how to ask for and give health tips, how to give compliments.',
      },
      {
        id: 'ta7-t28',
        week: 'Tuần 10',
        lessonName: 'REVIEW 1 (Skills)',
        periodAllocation: 'Tiết 28',
        periodsCount: 1,
        adjustedContent:
          'Practise reading for general and specific information about a healthy life; Practise talking about things related to community service; Practise listening for specific information about a hobby; Practise writing complete sentences from the prompts provided.',
      },
      {
        id: 'ta7-t29',
        week: 'Tuần 10',
        lessonName: 'REVIEW FOR THE MID FIRST TERM TEST + THE MID FIRST TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 29',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 1-3; Revise the language of unit 1-3 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta7-t30',
        week: 'Tuần 10',
        lessonName: 'THE MID FIRST TERM TEST',
        periodAllocation: 'Tiết 30',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 1-3; Revise the language of unit 1-3 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta7-t31',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 31',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about how English people continue their culinary traditions; Talk about a typical traditional Vietnamese dish.',
      },
      {
        id: 'ta7-t32',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 32',
        periodsCount: 1,
        adjustedContent:
          'Listen for general and specific information about old school days; Write about old school days.',
      },
      {
        id: 'ta7-t33',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 33',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 4; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta7-t34',
        week: 'Tuần 12',
        lessonName: 'THE MID FIRST TERM TEST CORRECTION',
        periodAllocation: 'Tiết 34',
        periodsCount: 1,
        adjustedContent:
          'Check their knowledge of Units 1-4 that they have learnt by doing a test, then to have solution to review their knowledge again.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk1-u5',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U5',
    chapterTitle: 'Unit 5: Food and Drink (Tiết 35 – 41)',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 14',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Đồ ăn và Thức uống (Food and Drink), các cụm từ chỉ định lượng; phát âm /ɒ/ và /ɔː/; lượng từ some, a lot of / lots of và câu hỏi How many / How much; hỏi đáp về giá cả và viết đoạn văn về thói quen ăn uống. Tích hợp NLS (1.1.TC1b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t35',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 1: Getting started',
        periodAllocation: 'Tiết 35',
        periodsCount: 1,
        adjustedContent: 'Use the words related to the topic Food and Drink.',
      },
      {
        id: 'ta7-t36',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 36',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Food and Drink; Know how to use the measurement words and phrases often used with food and drink; Pronounce the sounds /ɒ/ and /ɔː/ correctly. [Tích hợp NLS: 1.1.TC1b]',
        note: 'Tích hợp NLS: 1.1.TC1b',
      },
      {
        id: 'ta7-t37',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 37',
        periodsCount: 1,
        adjustedContent:
          'Know how to use the measurement words and phrases such as some and a lot of / lots of with countable and uncountable nouns; Understand and use the How many / How much to ask and answer about quantities.',
      },
      {
        id: 'ta7-t38',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 4: Communication',
        periodAllocation: 'Tiết 38',
        periodsCount: 1,
        adjustedContent:
          'Use lexical items related to the favourite food and drink in everyday life; Understand and use ways to ask and answer about prices and favourite food and drink in English.',
      },
      {
        id: 'ta7-t39',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 39',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about a typical traditional food; Talk about a popular food or drink.',
      },
      {
        id: 'ta7-t40',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 40',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about eating habits; Write a paragraph describing eating habits.',
      },
      {
        id: 'ta7-t41',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 41',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 5; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk1-u6-rev2',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U6-R2',
    chapterTitle: 'Unit 6: A Visit to a School, Review 2 & Kiểm tra cuối kì I (Tiết 42 – 54)',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 13,
    adjustedContentSummary:
      'Từ vựng chủ đề A Visit to a School; phát âm /tʃ/ và /dʒ/; giới từ chỉ thời gian và nơi chốn (prepositions of time and place); viết đoạn văn về hoạt động ngoài trời ở trường; Ôn tập Review 2 (Units 4–6) và Kiểm tra Cuối học kì I. Tích hợp AI (7.A3.1).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t42',
        week: 'Tuần 14',
        lessonName: 'Unit 6: Lesson 1: Getting started',
        periodAllocation: 'Tiết 42',
        periodsCount: 1,
        adjustedContent: 'Use the words related to the topic A Visit to a School.',
      },
      {
        id: 'ta7-t43',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 43',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic A Visit to a School; Pronounce the sounds /tʃ/ and /dʒ/ correctly.',
      },
      {
        id: 'ta7-t44',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 44',
        periodsCount: 1,
        adjustedContent: 'Use the prepositions of time and place.',
      },
      {
        id: 'ta7-t45',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 4: Communication',
        periodAllocation: 'Tiết 45',
        periodsCount: 1,
        adjustedContent: 'Revise vocabulary related to topic A visit to a school; Ask for details.',
      },
      {
        id: 'ta7-t46',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 46',
        periodsCount: 1,
        adjustedContent:
          "Read for specific information about a famous school; Talk about one's school.",
      },
      {
        id: 'ta7-t47',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 47',
        periodsCount: 1,
        adjustedContent:
          "Listen for general and specific information about school activities; Write a paragraph about an outdoor activity at one's school.",
      },
      {
        id: 'ta7-t48',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 48',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 6; Apply what they have learnt (vocabulary and grammar) into practice through a project. [Tích hợp AI: 7.A3.1]',
        note: 'Tích hợp AI: 7.A3.1',
      },
      {
        id: 'ta7-t49',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Language)',
        periodAllocation: 'Tiết 49',
        periodsCount: 1,
        adjustedContent:
          'Use words related to music and arts; Use words about food and drinks; Use words related to school facilities and school activities; Pronounce the sounds /ʃ/, /ʒ/, /ɒ/, /ɔː/, /tʃ/ and /dʒ/ correctly; Use comparisons; Use some, a lot of, lots of; Use prepositions of time and place.',
      },
      {
        id: 'ta7-t50',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Skills)',
        periodAllocation: 'Tiết 50',
        periodsCount: 1,
        adjustedContent:
          "Express preferences; Ask and answer about prices; Ask for details; Practice reading for specific information about one's favourite kind of music; Practice talking about a visit to a lower secondary school; Practice listening for specific information about a meal at a restaurant; Practice writing a paragraph about a meal at a restaurant.",
      },
      {
        id: 'ta7-t51',
        week: 'Tuần 17',
        lessonName: 'The 1st semester exam (Speaking)',
        periodAllocation: 'Tiết 51',
        periodsCount: 1,
        adjustedContent: "Evaluate Ss' levels.",
      },
      {
        id: 'ta7-t52',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 52',
        periodsCount: 1,
        adjustedContent:
          'Review and practice the four skills through exercises vocabulary and grammar notes they have learnt from unit 1 to 6.',
      },
      {
        id: 'ta7-t53',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 53',
        periodsCount: 1,
        adjustedContent:
          'Review and practice the four skills through exercises vocabulary and grammar notes they have learnt from unit 1 to 6.',
      },
      {
        id: 'ta7-t54',
        week: 'Tuần 18',
        lessonName: 'The 1st semester exam',
        periodAllocation: 'Tiết 54',
        periodsCount: 1,
        adjustedContent: "Evaluate Ss' levels.",
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk2-u7',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U7',
    chapterTitle: 'Unit 7: Traffic (Tiết 55 – 61)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 21',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Giao thông và phương tiện đi lại (Traffic & means of transport); phát âm /aɪ/ và /eɪ/; cấu trúc It chỉ khoảng cách và should/shouldn’t; đọc hiểu quy tắc an toàn giao thông và viết đoạn văn về vấn đề giao thông đô thị.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t55',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 1: Getting started',
        periodAllocation: 'Tiết 55',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic Traffic to talk about means of transport.',
      },
      {
        id: 'ta7-t56',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 56',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic Traffic; Pronounce the sounds /aɪ/ and /eɪ/ correctly.',
      },
      {
        id: 'ta7-t57',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 57',
        periodsCount: 1,
        adjustedContent: "Know how to use: It to indicate distance, should and shouldn't.",
      },
      {
        id: 'ta7-t58',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 4: Communication',
        periodAllocation: 'Tiết 58',
        periodsCount: 1,
        adjustedContent:
          'Learn how to ask and answer about means of transport and some strange traffic rules; Practise using some grammar points and vocabulary related to the topic.',
      },
      {
        id: 'ta7-t59',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 59',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about traffic rules; Talk about obeying traffic rules.',
      },
      {
        id: 'ta7-t60',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 60',
        periodsCount: 1,
        adjustedContent:
          'Listen for general and specific information about traffic problems in a city; Write a paragraph about traffic problems.',
      },
      {
        id: 'ta7-t61',
        week: 'Tuần 21',
        lessonName: 'Unit 7: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 61',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 7; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk2-u8',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U8',
    chapterTitle: 'Unit 8: Films (Tiết 62 – 68)',
    semester: 'HK2',
    weekRange: 'Tuần 21 – Tuần 23',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về các thể loại phim và tính từ miêu tả bộ phim; phát âm /ɪə/ và /eə/; liên từ chỉ sự nhượng bộ although/though và however; đọc bài đánh giá phim (film review) và viết về bộ phim yêu thích. Tích hợp NLS (1.1TC1a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t62',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 1: Getting started',
        periodAllocation: 'Tiết 62',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic films, types of films, adjectives describing films.',
      },
      {
        id: 'ta7-t63',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 63',
        periodsCount: 1,
        adjustedContent:
          'Use adjectives related to the topic Films describing films; Pronounce the sounds /ɪə/ and /eə/ correctly.',
      },
      {
        id: 'ta7-t64',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 64',
        periodsCount: 1,
        adjustedContent:
          'Understand the use of the connectors: although/ though and however; Practice using the connectors: although/ though and however in contexts.',
      },
      {
        id: 'ta7-t65',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 4: Communication',
        periodAllocation: 'Tiết 65',
        periodsCount: 1,
        adjustedContent:
          "Accept and decline suggestions; Do a survey about group members' favorite film; Report the survey's result to class.",
      },
      {
        id: 'ta7-t66',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 66',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about a film review; Talk about a film. [Tích hợp NLS: 1.1TC1a]',
        note: 'Tích hợp NLS: 1.1TC1a',
      },
      {
        id: 'ta7-t67',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 67',
        periodsCount: 1,
        adjustedContent:
          "Listen for specific information about a film; Write a paragraph about one's favourite film.",
      },
      {
        id: 'ta7-t68',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 68',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 8; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk2-u9-rev3',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U9-R3',
    chapterTitle: 'Unit 9: Festivals around the world, Review 3 & Kiểm tra giữa kì II (Tiết 69 – 79)',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 27',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về các lễ hội trên thế giới (Festivals around the world); trọng âm từ có 2 âm tiết; câu hỏi Yes/No questions; biểu tượng lễ hội và viết email miêu tả lễ hội; Ôn tập Review 3 (Units 7–9) và Kiểm tra Giữa học kì II.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t69',
        week: 'Tuần 23',
        lessonName: 'Unit 9: Lesson 1: Getting started',
        periodAllocation: 'Tiết 69',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic "Festivals": names of different festivals around the world.',
      },
      {
        id: 'ta7-t70',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 70',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to types of festivals and festival activities; Pronounce two-syllable words with correct stress.',
      },
      {
        id: 'ta7-t71',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 71',
        periodsCount: 1,
        adjustedContent: 'Practice Yes/No questions.',
      },
      {
        id: 'ta7-t72',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 4: Communication',
        periodAllocation: 'Tiết 72',
        periodsCount: 1,
        adjustedContent:
          'Express disappointment; Understand the concept of festival symbols and their meanings; Talk about the concept of festival symbols and their meanings.',
      },
      {
        id: 'ta7-t73',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 73',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about an unusual festival; Talk about a festival that someone joined.',
      },
      {
        id: 'ta7-t74',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 74',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about a festival; Write an email to describe a festival.',
      },
      {
        id: 'ta7-t75',
        week: 'Tuần 25',
        lessonName: 'REVIEW 3 (Language)',
        periodAllocation: 'Tiết 75',
        periodsCount: 1,
        adjustedContent:
          'Review and practice on the vocabulary items and grammar points Ss have already studied in Units 7-9.',
      },
      {
        id: 'ta7-t76',
        week: 'Tuần 26',
        lessonName: 'REVIEW 3 (Skills)',
        periodAllocation: 'Tiết 76',
        periodsCount: 1,
        adjustedContent:
          'Practice on the vocabulary items and grammar points Ss have already studied and the skills they have practised in Units 7-9.',
      },
      {
        id: 'ta7-t77',
        week: 'Tuần 26',
        lessonName: 'REVIEW FOR THE MID SECOND TERM TEST + THE MID SECOND TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 77',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 7-9; Revise the language of unit 7-9 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta7-t78',
        week: 'Tuần 26',
        lessonName: 'THE MID SECOND TERM TEST',
        periodAllocation: 'Tiết 78',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 7-9; Revise the language of unit 7-9 that Ss have studied; Evaluate Ss' levels.",
      },
      {
        id: 'ta7-t79',
        week: 'Tuần 27',
        lessonName: 'Unit 9: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 79',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 9; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk2-u10',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U10',
    chapterTitle: 'Unit 10: Energy sources & Sửa bài KT giữa kì II (Tiết 80 – 87)',
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 29',
    totalPeriods: 8,
    adjustedContentSummary:
      'Từ vựng về các nguồn năng lượng (Energy sources); trọng âm từ có 3 âm tiết; thì hiện tại tiếp diễn; ưu và nhược điểm của các nguồn năng lượng và cách tiết kiệm năng lượng tại nhà. Tích hợp NLS (1.1TC1a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t80',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 1: Getting started',
        periodAllocation: 'Tiết 80',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to types of energy sources to talk about types of different energy sources. [Tích hợp NLS: 1.1TC1a]',
        note: 'Tích hợp NLS: 1.1TC1a',
      },
      {
        id: 'ta7-t81',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 81',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to types of energy sources; Pronounce three-syllable words with correct stress.',
      },
      {
        id: 'ta7-t82',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 82',
        periodsCount: 1,
        adjustedContent: 'Use the present continuous.',
      },
      {
        id: 'ta7-t83',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 4: Communication',
        periodAllocation: 'Tiết 83',
        periodsCount: 1,
        adjustedContent:
          'Everyday English: Asking for explanations; Speaking skill: how well your partner saves energy.',
      },
      {
        id: 'ta7-t84',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 84',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about types of energy sources; Talk about the advantages and disadvantages of different energy sources.',
      },
      {
        id: 'ta7-t85',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 85',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about how to save energy at home; Write a paragraph about how to save energy at home.',
      },
      {
        id: 'ta7-t86',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 86',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 10; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta7-t87',
        week: 'Tuần 29',
        lessonName: 'THE MID SECOND TERM TEST CORRECTION',
        periodAllocation: 'Tiết 87',
        periodsCount: 1,
        adjustedContent:
          'Check their knowledge of Units 7, 8, 9 that they have learnt by doing a test, then to have solution to review their knowledge again.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk2-u11',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U11',
    chapterTitle: 'Unit 11: Travelling in the future (Tiết 88 – 94)',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 32',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về phương tiện giao thông trong tương lai (Travelling in the future); trọng âm câu; thì tương lai đơn (future simple) và đại từ sở hữu (possessive pronouns); đưa ra dự đoán và viết về lợi ích của phương tiện tương lai. Tích hợp AI (7.A1.1).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t88',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 1: Getting started',
        periodAllocation: 'Tiết 88',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to future means of transport to talk about future means of transport. [Tích hợp AI: 7.A1.1]',
        note: 'Tích hợp AI: 7.A1.1',
      },
      {
        id: 'ta7-t89',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 89',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Travelling in the future; Pronunciation: say sentences with correct stress.',
      },
      {
        id: 'ta7-t90',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 90',
        periodsCount: 1,
        adjustedContent:
          'Use the future simple to talk about future activities and make predictions; Use possessive pronouns correctly.',
      },
      {
        id: 'ta7-t91',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 4: Communication',
        periodAllocation: 'Tiết 91',
        periodsCount: 1,
        adjustedContent:
          'Learn how to make predictions; Practise using some grammar points and vocabulary related to the topic.',
      },
      {
        id: 'ta7-t92',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 92',
        periodsCount: 1,
        adjustedContent:
          "Read for general and specific information about cars; Talk about why a means of transport will / won't be popular.",
      },
      {
        id: 'ta7-t93',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 93',
        periodsCount: 1,
        adjustedContent:
          'Listen for general and specific information about some future means of transport; Write a paragraph about the advantages of a future means of transport.',
      },
      {
        id: 'ta7-t94',
        week: 'Tuần 32',
        lessonName: 'Unit 11: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 94',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 11; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta7-hk2-u12-rev4',
    grade: 7,
    subject: 'Tiếng Anh',
    chapterCode: 'TA7-U12-R4',
    chapterTitle: 'Unit 12: English-speaking countries, Review 4 & Kiểm tra cuối kì II (Tiết 95 – 105)',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về con người và địa danh tại các quốc gia nói tiếng Anh (English-speaking countries); ngữ điệu lên/xuống trong câu hỏi; cách dùng mạo từ (articles); viết nhật ký về chuyến tham quan thành phố; Ôn tập Review 4 (Units 10–12) và Kiểm tra Cuối học kì II.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta7-t95',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 1: Getting started',
        periodAllocation: 'Tiết 95',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to people and places in English-speaking countries.',
      },
      {
        id: 'ta7-t96',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 96',
        periodsCount: 1,
        adjustedContent:
          'Use words related to people and places in the English-speaking countries; Pronunciation: ask questions with the correct rising and falling intonation.',
      },
      {
        id: 'ta7-t97',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 97',
        periodsCount: 1,
        adjustedContent:
          'Understand the use of articles; Practice using articles correctly.',
      },
      {
        id: 'ta7-t98',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 4: Communication',
        periodAllocation: 'Tiết 98',
        periodsCount: 1,
        adjustedContent:
          'Express amazement; Know interesting facts about English-speaking countries.',
      },
      {
        id: 'ta7-t99',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 99',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about New Zealand; talk about Scotland.',
      },
      {
        id: 'ta7-t100',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 100',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about a tour of a city; Write a diary entry about a tour of a city.',
      },
      {
        id: 'ta7-t101',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 101',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 12; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta7-t102',
        week: 'Tuần 34',
        lessonName: 'Review 4 (Language)',
        periodAllocation: 'Tiết 102',
        periodsCount: 1,
        adjustedContent:
          'Review pronunciation, vocabulary and the grammar points they have learnt in unit 10-12.',
      },
      {
        id: 'ta7-t103',
        week: 'Tuần 35',
        lessonName: 'Review 4 (Skills)',
        periodAllocation: 'Tiết 103',
        periodsCount: 1,
        adjustedContent:
          'Review and practice on the vocabulary items and grammar points Ss have already studied and the skills they have practised in Units 10-12.',
      },
      {
        id: 'ta7-t104',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam (Speaking)',
        periodAllocation: 'Tiết 104',
        periodsCount: 1,
        adjustedContent: "Evaluate Ss' levels.",
      },
      {
        id: 'ta7-t105',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam',
        periodAllocation: 'Tiết 105',
        periodsCount: 1,
        adjustedContent:
          "Make sure of vocabulary and grammars of unit 7-12; Revise the language of unit 7-12 that Ss have studied; Evaluate Ss' levels.",
      },
    ],
  }),
];

// ============================================================================
// 1.1.3. MÔN TIẾNG ANH 8 (CẢ NĂM: 35 TUẦN x 3 TIẾT = 105 TIẾT | HKI: 54 TIẾT, HKII: 51 TIẾT)
// ============================================================================
export const GRADE8_TIENG_ANH_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'thcs-ta8-hk1-intro-u1',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U1',
    chapterTitle: 'Introduction & Unit 1: Leisure time (Tiết 1 – 8)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 3',
    totalPeriods: 8,
    adjustedContentSummary:
      'Giới thiệu tổng quan chương trình Tiếng Anh 8 Global Success; từ vựng chủ đề Thời gian rảnh rỗi (Leisure time); phát âm /ʊ/ và /uː/; động từ chỉ sự yêu/ghét + danh động từ (gerunds) hoặc động từ nguyên mẫu có to (to-infinitives); đọc và viết về hoạt động giải trí cùng gia đình, bạn bè.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t1',
        week: 'Tuần 1',
        lessonName: 'Introduction',
        periodAllocation: 'Tiết 1',
        periodsCount: 1,
        adjustedContent:
          'Obtain the brief introduction of the course; Learn how to make use of global success resources.',
      },
      {
        id: 'ta8-t2',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 1: Getting started',
        periodAllocation: 'Tiết 2',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Leisure time; Introduce some vocabulary related to the topic of the unit and the grammar point of this unit: verbs of liking/ disliking + gerunds OR to-infinitives.',
      },
      {
        id: 'ta8-t3',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 3',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to the topic Leisure time; Pronounce the sounds /ʊ/ and /uː/ correctly.',
      },
      {
        id: 'ta8-t4',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 4',
        periodsCount: 1,
        adjustedContent:
          'Use Verbs of liking/ disliking + gerunds OR to-infinitives.',
      },
      {
        id: 'ta8-t5',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 4: Communication',
        periodAllocation: 'Tiết 5',
        periodsCount: 1,
        adjustedContent: 'Invite and accept invitations.',
      },
      {
        id: 'ta8-t6',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 6',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about leisure activities with family; Talk about leisure activities with family.',
      },
      {
        id: 'ta8-t7',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 7',
        periodsCount: 1,
        adjustedContent:
          'Listen to someone talking about their leisure activities with friends; Write a paragraph about leisure activities with friends.',
      },
      {
        id: 'ta8-t8',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 8',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 1; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk1-u2',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U2',
    chapterTitle: 'Unit 2: Life in the countryside (Tiết 9 – 15)',
    semester: 'HK1',
    weekRange: 'Tuần 3 – Tuần 5',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Cuộc sống ở nông thôn (Life in the countryside); phát âm /ə/ và /ɪ/; dạng so sánh hơn của trạng từ (comparative forms of adverbs); đưa ra và đáp lại lời khen; nói và viết về cuộc sống ở làng quê. Tích hợp NLS (3.1.TC2b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t9',
        week: 'Tuần 3',
        lessonName: 'Unit 2: Lesson 1: Getting started',
        periodAllocation: 'Tiết 9',
        periodsCount: 1,
        adjustedContent:
          "Set the context for the introductory text; Introduce the topic of the unit: Life in the countryside; Develop Ss' knowledge of the vocabulary about Life in the countryside.",
      },
      {
        id: 'ta8-t10',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 10',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to Life in the countryside; Pronounce the final sounds /ə/ and /ɪ/ correctly.',
      },
      {
        id: 'ta8-t11',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 11',
        periodsCount: 1,
        adjustedContent: 'Use the comparative forms of adverbs.',
      },
      {
        id: 'ta8-t12',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 4: Communication',
        periodAllocation: 'Tiết 12',
        periodsCount: 1,
        adjustedContent: 'Give and respond to compliments.',
      },
      {
        id: 'ta8-t13',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 13',
        periodsCount: 1,
        adjustedContent:
          'Read about different aspects of a Vietnamese village; Talk about a village or town where one lives or which one knows.',
      },
      {
        id: 'ta8-t14',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 14',
        periodsCount: 1,
        adjustedContent:
          "Listen to someone's opinion about life in the countryside; Write a paragraph about what someone likes or dislikes about life in the countryside.",
      },
      {
        id: 'ta8-t15',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 15',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 2; Apply what they have learnt (vocabulary and grammar) into practice through a project. [Tích hợp NLS: 3.1.TC2b]',
        note: 'Tích hợp NLS: 3.1.TC2b',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk1-u3',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U3',
    chapterTitle: 'Unit 3: Teenagers (Tiết 16 – 22)',
    semester: 'HK1',
    weekRange: 'Tuần 6 – Tuần 8',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Thanh thiếu niên (Teenagers), câu lạc bộ học đường, mạng xã hội và áp lực tuổi học trò; phát âm /ʊə/ và /ɔɪ/; phân biệt câu đơn (simple sentences) và câu ghép (compound sentences) dùng liên từ kết hợp và trạng từ liên kết.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t16',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 1: Getting started',
        periodAllocation: 'Tiết 16',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: Teenagers; Revise and provide Ss with some vocabulary to talk about teenagers.',
      },
      {
        id: 'ta8-t17',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 17',
        periodsCount: 1,
        adjustedContent:
          'Identify the combination of some verbs and verb phrases that are often used when teens talk about using social media; Distinguish two sounds /ʊə/ and /ɔɪ/ correctly.',
      },
      {
        id: 'ta8-t18',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 18',
        periodsCount: 1,
        adjustedContent:
          'Review the knowledge of simple sentences; distinguish between simple sentences and compound sentences; Identify words that connect independent clauses; Apply the coordinating conjunctions or conjunctive adverbs to combine two sentences.',
      },
      {
        id: 'ta8-t19',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 4: Communication',
        periodAllocation: 'Tiết 19',
        periodsCount: 1,
        adjustedContent:
          'Identify how to make requests in English; Understand some everyday English phrases and expressions about the different social media that are popular among teens, how often and what they use these media for; Practise reading for specific information.',
      },
      {
        id: 'ta8-t20',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 20',
        periodsCount: 1,
        adjustedContent:
          'Recognise reading skills for specific information and general information about school clubs; Remember the lexical items related to school clubs; Recognise how to make a conversation to ask and answer about school clubs.',
      },
      {
        id: 'ta8-t21',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 21',
        periodsCount: 1,
        adjustedContent:
          'Listen for general and specific information about teen stress; Recall the lexical items related to pressures teens face; Write a paragraph about the causes and solutions.',
      },
      {
        id: 'ta8-t22',
        week: 'Tuần 8',
        lessonName: 'Unit 3: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 22',
        periodsCount: 1,
        adjustedContent:
          "Repeat and distinguish the structures of simple sentences and compound sentences; Memorise the uses of some conjunctions; Memorise some words related to teen school clubs, teens' use of social media, and teen stress and pressure.",
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk1-u4-rev1',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U4-R1',
    chapterTitle: 'Unit 4: Ethnic groups of Viet Nam, Review 1 & Kiểm tra giữa kì I (Tiết 23 – 34)',
    semester: 'HK1',
    weekRange: 'Tuần 8 – Tuần 12',
    totalPeriods: 12,
    adjustedContentSummary:
      'Từ vựng về đời sống và văn hóa các dân tộc Việt Nam (Ethnic groups of Viet Nam); phát âm /k/ và /g/; câu hỏi Yes/No và Wh-questions, danh từ đếm được/không đếm được; Ôn tập Review 1 (Units 1–3) và Kiểm tra Giữa học kì I. Tích hợp AI (8.D1.1).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t23',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 1: Getting started',
        periodAllocation: 'Tiết 23',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the listening and reading text; Introduce the topic of the unit: Ethnic groups of Viet Nam.',
      },
      {
        id: 'ta8-t24',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 24',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the life of the ethnic people; pronounce the sounds /k/ and /g/ correctly.',
      },
      {
        id: 'ta8-t25',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 25',
        periodsCount: 1,
        adjustedContent:
          'Use Yes/No and WH-questions; Countable and uncountable nouns.',
      },
      {
        id: 'ta8-t26',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 4: Communication',
        periodAllocation: 'Tiết 26',
        periodsCount: 1,
        adjustedContent:
          'Give opinions about the lifestyle of ethnic minority groups; Ask and answer about the Jrai people.',
      },
      {
        id: 'ta8-t27',
        week: 'Tuần 9',
        lessonName: 'REVIEW 1 (Language)',
        periodAllocation: 'Tiết 27',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 1 – 3.',
      },
      {
        id: 'ta8-t28',
        week: 'Tuần 10',
        lessonName: 'REVIEW 1 (Skills)',
        periodAllocation: 'Tiết 28',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 1 – 3.',
      },
      {
        id: 'ta8-t29',
        week: 'Tuần 10',
        lessonName: 'REVIEW FOR THE MID FIRST TERM TEST + THE MID FIRST TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 29',
        periodsCount: 1,
        adjustedContent: 'Revise all the knowledge learnt in unit 1, 2, 3; Take the test.',
      },
      {
        id: 'ta8-t30',
        week: 'Tuần 10',
        lessonName: 'THE MID FIRST TERM TEST',
        periodAllocation: 'Tiết 30',
        periodsCount: 1,
        adjustedContent: 'Take the test.',
      },
      {
        id: 'ta8-t31',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 31',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to a stilt house; Give opinions about the features of a stilt house; Ask and answer about the type of house they live in.',
      },
      {
        id: 'ta8-t32',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 32',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic of the listening text; Develop the skill of listening for specific information; Write a paragraph about the things they do to help their family. [Tích hợp AI: 8.D1.1]',
        note: 'Tích hợp AI: 8.D1.1',
      },
      {
        id: 'ta8-t33',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 33',
        periodsCount: 1,
        adjustedContent:
          'Revise more vocabulary items they have learnt in the unit in different contexts; Revise Yes/No questions and Wh-questions; Revise the use of countable and uncountable nouns; Have an opportunity to research more deeply into an ethnic group they are interested in.',
      },
      {
        id: 'ta8-t34',
        week: 'Tuần 12',
        lessonName: 'THE MID FIRST TERM TEST CORRECTION',
        periodAllocation: 'Tiết 34',
        periodsCount: 1,
        adjustedContent: 'To correct the mistakes in the test.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk1-u5',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U5',
    chapterTitle: 'Unit 5: Our customs and traditions (Tiết 35 – 41)',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 14',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Phong tục và Truyền thống (Our customs and traditions); phát âm /n/ và /ŋ/; cách dùng mạo từ (a/an, the, zero article); đưa ra lời khuyên và viết email tư vấn tham gia lễ hội truyền thống. Tích hợp NLS (3.1.TC2b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t35',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 1: Getting started',
        periodAllocation: 'Tiết 35',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: Customs and Traditions; Gain vocabulary to talk about Customs and Traditions.',
      },
      {
        id: 'ta8-t36',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 36',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Customs and Traditions; Know how to use words and phrases often used with Customs and Traditions; Pronounce the sounds /n/ and /ŋ/ correctly.',
      },
      {
        id: 'ta8-t37',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 37',
        periodsCount: 1,
        adjustedContent: 'Use the article (a / an, the, the zero articles).',
      },
      {
        id: 'ta8-t38',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 4: Communication',
        periodAllocation: 'Tiết 38',
        periodsCount: 1,
        adjustedContent:
          'Give advice; Read about a local festival; Compare two local festivals.',
      },
      {
        id: 'ta8-t39',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 39',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about village festival day; Talk about family event.',
      },
      {
        id: 'ta8-t40',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 40',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about festival; Write an email to give advice on participating in a traditional festival.',
      },
      {
        id: 'ta8-t41',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 41',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 5; Apply what they have learnt (vocabulary and grammar) into practice through a project. [Tích hợp NLS: 3.1.TC2b]',
        note: 'Tích hợp NLS: 3.1.TC2b',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk1-u6-rev2',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U6-R2',
    chapterTitle: 'Unit 6: Lifestyles, Review 2 & Kiểm tra cuối kì I (Tiết 42 – 54)',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 13,
    adjustedContentSummary:
      'Từ vựng về Lối sống (Lifestyles); phát âm /br/ và /pr/; thì tương lai đơn và câu điều kiện loại 1; viết đoạn văn về ưu/nhược điểm của học trực tuyến; Ôn tập Review 2 (Units 4–6) và Kiểm tra Cuối học kì I.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t42',
        week: 'Tuần 14',
        lessonName: 'Unit 6: Lesson 1: Getting started',
        periodAllocation: 'Tiết 42',
        periodsCount: 1,
        adjustedContent:
          "Set the context for the introductory text; Introduce the topic of the unit: Lifestyle; Develop Ss' knowledge of the vocabulary relating to Lifestyle.",
      },
      {
        id: 'ta8-t43',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 43',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to Lifestyles; Pronounce the sounds /br/ and /pr/ correctly.',
      },
      {
        id: 'ta8-t44',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 44',
        periodsCount: 1,
        adjustedContent: 'Use the future simple and first conditional.',
      },
      {
        id: 'ta8-t45',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 4: Communication',
        periodAllocation: 'Tiết 45',
        periodsCount: 1,
        adjustedContent: 'Express certainty.',
      },
      {
        id: 'ta8-t46',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 46',
        periodsCount: 1,
        adjustedContent:
          'Read about Alaska; Talk about how people in their area maintain traditional lifestyles.',
      },
      {
        id: 'ta8-t47',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 47',
        periodsCount: 1,
        adjustedContent:
          "Listening to someone's opinion about the impact of modern technology; Writing a paragraph about the advantages or disadvantages of online learning.",
      },
      {
        id: 'ta8-t48',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 48',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 6; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta8-t49',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Language)',
        periodAllocation: 'Tiết 49',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 4-6.',
      },
      {
        id: 'ta8-t50',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Skills)',
        periodAllocation: 'Tiết 50',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 4-6.',
      },
      {
        id: 'ta8-t51',
        week: 'Tuần 17',
        lessonName: 'The 1st semester exam (Speaking)',
        periodAllocation: 'Tiết 51',
        periodsCount: 1,
        adjustedContent: 'Take the test.',
      },
      {
        id: 'ta8-t52',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 52',
        periodsCount: 1,
        adjustedContent: 'Revise all the knowledge learnt in unit 1, 2, 3, 4, 5, 6.',
      },
      {
        id: 'ta8-t53',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 53',
        periodsCount: 1,
        adjustedContent: 'Revise all the knowledge learnt in unit 1, 2, 3, 4, 5, 6.',
      },
      {
        id: 'ta8-t54',
        week: 'Tuần 18',
        lessonName: 'The 1st semester exam',
        periodAllocation: 'Tiết 54',
        periodsCount: 1,
        adjustedContent: 'Take the test.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk2-u7',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U7',
    chapterTitle: 'Unit 7: Environmental protection (Tiết 55 – 61)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 21',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Bảo vệ môi trường (Environmental protection); phát âm /bl/ và /kl/; câu phức với mệnh đề trạng ngữ chỉ thời gian (complex sentences with adverb clauses of time); đọc về Vườn quốc gia Côn Đảo/Vũ Quang và viết thông báo (notice). Tích hợp NLS (3.1.TC2b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t55',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 1: Getting started',
        periodAllocation: 'Tiết 55',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Environmental protection; Gain vocabulary to talk about Environmental protection.',
      },
      {
        id: 'ta8-t56',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 56',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to Environmental Protection; Pronounce the sounds /bl/ and /kl/ correctly.',
      },
      {
        id: 'ta8-t57',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 57',
        periodsCount: 1,
        adjustedContent: 'Use the Complex sentences with adverb clauses of time.',
      },
      {
        id: 'ta8-t58',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 4: Communication',
        periodAllocation: 'Tiết 58',
        periodsCount: 1,
        adjustedContent: 'Ask for clarification.',
      },
      {
        id: 'ta8-t59',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 59',
        periodsCount: 1,
        adjustedContent:
          'Reading about Con Dao National Park; Talking about Vu Quang.',
      },
      {
        id: 'ta8-t60',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 60',
        periodsCount: 1,
        adjustedContent: 'Listening about water pollution; Writing a notice.',
      },
      {
        id: 'ta8-t61',
        week: 'Tuần 21',
        lessonName: 'Unit 7: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 61',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 7; Apply what they have learnt (vocabulary and grammar) into practice through a project. [Tích hợp NLS: 3.1.TC2b]',
        note: 'Tích hợp NLS: 3.1.TC2b',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk2-u8',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U8',
    chapterTitle: 'Unit 8: Shopping (Tiết 62 – 68)',
    semester: 'HK2',
    weekRange: 'Tuần 21 – Tuần 23',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Mua sắm (Shopping) và các loại cửa hàng; phát âm /sp/ và /st/; trạng từ chỉ tần suất và thì hiện tại đơn mang nghĩa tương lai (present simple for future actions); viết đoạn văn về ưu/nhược điểm của một hình thức mua sắm.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t62',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 1: Getting started',
        periodAllocation: 'Tiết 62',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Shopping; Gain vocabulary to talk about shopping.',
      },
      {
        id: 'ta8-t63',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 63',
        periodsCount: 1,
        adjustedContent:
          'Identify some nouns related to the topic of shopping, some types of shops and their characteristics as well; Pronounce the sounds /sp/ and /st/ correctly.',
      },
      {
        id: 'ta8-t64',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 64',
        periodsCount: 1,
        adjustedContent:
          'Revise and use some adverbs of frequency; Identify how to use the present simple for future actions; Understand the difference in the use of present simple and future simple when talking about future activities.',
      },
      {
        id: 'ta8-t65',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 4: Communication',
        periodAllocation: 'Tiết 65',
        periodsCount: 1,
        adjustedContent:
          "Identify how to make complaints in English; Know about one's favourite shopping place.",
      },
      {
        id: 'ta8-t66',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 66',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the reason(s) people go shopping; Make a conversation to ask and answer about a new shopping centre.',
      },
      {
        id: 'ta8-t67',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 67',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about online shopping; Recall the lexical items related to online shopping; Write a paragraph about the advantages and disadvantages of a type of shopping.',
      },
      {
        id: 'ta8-t68',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 68',
        periodsCount: 1,
        adjustedContent:
          'Repeat and distinguish the uses of adverbs of frequency; Memorise the use of the present simple with future actions; Memorise some words related to shopping and online shopping.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk2-u9-rev3',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U9-R3',
    chapterTitle: 'Unit 9: Natural disasters, Review 3 & Kiểm tra giữa kì II (Tiết 69 – 79)',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 27',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về Thiên tai (Natural disasters); trọng âm từ tận cùng bằng -al và -ous; thì quá khứ tiếp diễn (past continuous); viết hướng dẫn những việc cần làm trước, trong và sau thiên tai; Ôn tập Review 3 (Units 7–9) và Kiểm tra Giữa học kì II.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t69',
        week: 'Tuần 23',
        lessonName: 'Unit 9: Lesson 1: Getting started',
        periodAllocation: 'Tiết 69',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Natural disasters; Gain vocabulary to talk about Natural disasters.',
      },
      {
        id: 'ta8-t70',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 70',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to natural disasters; Stress in words ending in -al and -ous.',
      },
      {
        id: 'ta8-t71',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 71',
        periodsCount: 1,
        adjustedContent: 'How to use "The past continuous".',
      },
      {
        id: 'ta8-t72',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 4: Communication',
        periodAllocation: 'Tiết 72',
        periodsCount: 1,
        adjustedContent:
          'Use lexical items related to natural disasters; Practise giving and responding to bad news; Get some information about natural disasters.',
      },
      {
        id: 'ta8-t73',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 73',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about natural disasters; Talk about a natural disaster.',
      },
      {
        id: 'ta8-t74',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 74',
        periodsCount: 1,
        adjustedContent:
          'Listen and get general and specific about things to do before, during, and after a natural disaster; Write instructions about things to do before, during, and after a natural disaster.',
      },
      {
        id: 'ta8-t75',
        week: 'Tuần 25',
        lessonName: 'REVIEW 3 (Language)',
        periodAllocation: 'Tiết 75',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 7-9.',
      },
      {
        id: 'ta8-t76',
        week: 'Tuần 26',
        lessonName: 'REVIEW 3 (Skills)',
        periodAllocation: 'Tiết 76',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 7-9.',
      },
      {
        id: 'ta8-t77',
        week: 'Tuần 26',
        lessonName: 'REVIEW FOR THE MID SECOND TERM TEST + THE MID SECOND TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 77',
        periodsCount: 1,
        adjustedContent: 'Revise all the knowledge learnt in unit 7, 8, 9; Take the test.',
      },
      {
        id: 'ta8-t78',
        week: 'Tuần 26',
        lessonName: 'THE MID SECOND TERM TEST',
        periodAllocation: 'Tiết 78',
        periodsCount: 1,
        adjustedContent: 'Take the test.',
      },
      {
        id: 'ta8-t79',
        week: 'Tuần 27',
        lessonName: 'Unit 9: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 79',
        periodsCount: 1,
        adjustedContent:
          'Revise more vocabulary items they have learnt in the unit; Revise the differences between the past simple and past continuous; Revise the past continuous; Have an opportunity to research more deeply into a natural disaster.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk2-u10',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U10',
    chapterTitle: 'Unit 10: Communication in the future & Sửa bài KT giữa kì II (Tiết 80 – 87)',
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 29',
    totalPeriods: 8,
    adjustedContentSummary:
      'Từ vựng về Giao tiếp trong tương lai (Communication in the future); trọng âm từ tận cùng bằng -ese và -ee; giới từ chỉ thời gian, nơi chốn và đại từ sở hữu; viết đoạn văn về các phương thức giao tiếp hiện đại. Tích hợp NLS (1.1.TC2b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t80',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 1: Getting started',
        periodAllocation: 'Tiết 80',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Communication; Gain vocabulary to talk about Communication.',
      },
      {
        id: 'ta8-t81',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 81',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to Communication; Correctly stress words that ending with -ese and -ee. [Tích hợp NLS: 1.1.TC2b]',
        note: 'Tích hợp NLS: 1.1.TC2b',
      },
      {
        id: 'ta8-t82',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 82',
        periodsCount: 1,
        adjustedContent: 'Use the prepositions of time and place, possessive pronouns.',
      },
      {
        id: 'ta8-t83',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 4: Communication',
        periodAllocation: 'Tiết 83',
        periodsCount: 1,
        adjustedContent: 'Interrupt politely.',
      },
      {
        id: 'ta8-t84',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 84',
        periodsCount: 1,
        adjustedContent:
          'Read about ways of communication; Talk about ways of communication.',
      },
      {
        id: 'ta8-t85',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 85',
        periodsCount: 1,
        adjustedContent:
          'Listening to someone making an announcement of art exhibition; Writing a paragraph about modern ways of communication.',
      },
      {
        id: 'ta8-t86',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 86',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 10; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta8-t87',
        week: 'Tuần 29',
        lessonName: 'THE MID SECOND TERM TEST CORRECTION',
        periodAllocation: 'Tiết 87',
        periodsCount: 1,
        adjustedContent: 'Correct the mistakes in the test.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk2-u11',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U11',
    chapterTitle: 'Unit 11: Science and technology (Tiết 88 – 94)',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 32',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Khoa học và Công nghệ (Science and technology), các phát minh và sáng chế; trọng âm câu; câu tường thuật (reported speech - statements); viết đoạn văn nêu quan điểm về việc robot giáo viên có thay thế giáo viên con người hay không. Tích hợp AI (8.C1.1).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t88',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 1: Getting started',
        periodAllocation: 'Tiết 88',
        periodsCount: 1,
        adjustedContent:
          'Gain an overview about the topic Science and technology; Gain vocabulary to talk about Science and technology.',
      },
      {
        id: 'ta8-t89',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 89',
        periodsCount: 1,
        adjustedContent:
          'Identify some nouns related to the topic of science and technology and some new technologies; Identify some new verb phrases that used to talk about inventions, discoveries, creations and development; Identify sentence stress.',
      },
      {
        id: 'ta8-t90',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 90',
        periodsCount: 1,
        adjustedContent:
          'Identify what direct speech and reported speech are; Realise some differences between a direct speech and a reported speech (statements); Be aware of changes in tenses, pronouns, time, and place expressions.',
      },
      {
        id: 'ta8-t91',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 4: Communication',
        periodAllocation: 'Tiết 91',
        periodsCount: 1,
        adjustedContent:
          'Identify how to give and respond to good news; Know about the benefits and problems of online learning.',
      },
      {
        id: 'ta8-t92',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 92',
        periodsCount: 1,
        adjustedContent:
          'Read advertisements about new technologies; Talk about a technology or an invention.',
      },
      {
        id: 'ta8-t93',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 93',
        periodsCount: 1,
        adjustedContent:
          "Listen about what a robot teacher can do and can't do; Write a paragraph expressing opinions about whether a robot teacher will replace human teachers at school. [Tích hợp AI: 8.C1.1]",
        note: 'Tích hợp AI: 8.C1.1',
      },
      {
        id: 'ta8-t94',
        week: 'Tuần 32',
        lessonName: 'Unit 11: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 94',
        periodsCount: 1,
        adjustedContent:
          'Use the vocabulary about new technologies and words and phrases that are used to talk about inventions, discoveries, inventions, and creations to do exercises; Apply the knowledge of reported speech (statements) to do exercises; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta8-hk2-u12-rev4',
    grade: 8,
    subject: 'Tiếng Anh',
    chapterCode: 'TA8-U12-R4',
    chapterTitle: 'Unit 12: Life on other planets, Review 4 & Kiểm tra cuối kì II (Tiết 95 – 105)',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về Sự sống trên các hành tinh khác (Life on other planets) và không gian vũ trụ; ngữ điệu khi liệt kê; câu tường thuật dạng câu hỏi (reported speech - questions); viết đoạn văn miêu tả hành tinh và sinh vật ngoài hành tinh; Ôn tập Review 4 (Units 10–12) và Kiểm tra Cuối học kì II.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta8-t95',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 1: Getting started',
        periodAllocation: 'Tiết 95',
        periodsCount: 1,
        adjustedContent:
          "Set the context for the introductory; Introduce the topic of the unit: Life on other planets; Develop Ss' knowledge of vocabulary about Life on other planets.",
      },
      {
        id: 'ta8-t96',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 96',
        periodsCount: 1,
        adjustedContent:
          'Use the words related to outer space; Use intonation for making lists correctly.',
      },
      {
        id: 'ta8-t97',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 97',
        periodsCount: 1,
        adjustedContent: 'Use reported speech to report questions.',
      },
      {
        id: 'ta8-t98',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 4: Communication',
        periodAllocation: 'Tiết 98',
        periodsCount: 1,
        adjustedContent: 'Express uncertainty; Talk about the planet.',
      },
      {
        id: 'ta8-t99',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 99',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about the possibility of life on other planets; Talk about the conditions needed for planets to support human life.',
      },
      {
        id: 'ta8-t100',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 100',
        periodsCount: 1,
        adjustedContent:
          'Listen about an imaginary planet and its creatures; Write a paragraph to describe an imaginary planet and its creatures.',
      },
      {
        id: 'ta8-t101',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 101',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 12; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta8-t102',
        week: 'Tuần 34',
        lessonName: 'Review 4 (Language)',
        periodAllocation: 'Tiết 102',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 10-12.',
      },
      {
        id: 'ta8-t103',
        week: 'Tuần 35',
        lessonName: 'Review 4 (Skills)',
        periodAllocation: 'Tiết 103',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and the skills they have practised in Units 10-12.',
      },
      {
        id: 'ta8-t104',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam (Speaking)',
        periodAllocation: 'Tiết 104',
        periodsCount: 1,
        adjustedContent: 'Take the test.',
      },
      {
        id: 'ta8-t105',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam',
        periodAllocation: 'Tiết 105',
        periodsCount: 1,
        adjustedContent: 'Take the test.',
      },
    ],
  }),
];

// ============================================================================
// 1.1.4. MÔN TIẾNG ANH 9 (CẢ NĂM: 35 TUẦN x 3 TIẾT = 105 TIẾT | HKI: 54 TIẾT, HKII: 51 TIẾT)
// ============================================================================
export const GRADE9_TIENG_ANH_TOPICS_2026: CurriculumTopic[] = [
  buildThcsTopic({
    id: 'thcs-ta9-hk1-intro-u1',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U1',
    chapterTitle: 'Introduction & Unit 1: Local community (Tiết 1 – 8)',
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 3',
    totalPeriods: 8,
    adjustedContentSummary:
      'Giới thiệu tổng quan chương trình Tiếng Anh 9 Global Success; từ vựng chủ đề Cộng đồng địa phương (Local community); phát âm nguyên âm /æ/, /ɑː/, /e/; từ để hỏi trước to-infinitives và cụm động từ (phrasal verbs); thuyết trình về sản phẩm đặc sản và viết về người phục vụ cộng đồng. Tích hợp AI (9.A3.1).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t1',
        week: 'Tuần 1',
        lessonName: 'Introduction',
        periodAllocation: 'Tiết 1',
        periodsCount: 1,
        adjustedContent:
          'Obtain the brief introduction of the course; Learn how to make use of Global Success resources.',
      },
      {
        id: 'ta9-t2',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 1: Getting started',
        periodAllocation: 'Tiết 2',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Local community; Gain vocabulary to talk about community.',
      },
      {
        id: 'ta9-t3',
        week: 'Tuần 1',
        lessonName: 'Unit 1: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 3',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Local community; Pronounce the vowel sounds /æ/, /ɑː/, and /e/ in words and sentences correctly; Use question words before to-infinitives and some phrasal verbs.',
      },
      {
        id: 'ta9-t4',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 4',
        periodsCount: 1,
        adjustedContent:
          'Use question words before to-infinitives and some phrasal verbs.',
      },
      {
        id: 'ta9-t5',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 4: Communication',
        periodAllocation: 'Tiết 5',
        periodsCount: 1,
        adjustedContent:
          'Know how to seek for help and respond; Know some places of interest.',
      },
      {
        id: 'ta9-t6',
        week: 'Tuần 2',
        lessonName: 'Unit 1: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 6',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about special products in some areas; Give a short presentation about a speciality. [Tích hợp AI: 9.A3.1]',
        note: 'Tích hợp AI: 9.A3.1',
      },
      {
        id: 'ta9-t7',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 7',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about a community helper; Write a paragraph about a community helper.',
      },
      {
        id: 'ta9-t8',
        week: 'Tuần 3',
        lessonName: 'Unit 1: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 8',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 1; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk1-u2',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U2',
    chapterTitle: 'Unit 2: City life (Tiết 9 – 15)',
    semester: 'HK1',
    weekRange: 'Tuần 3 – Tuần 5',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Cuộc sống đô thị (City life); phát âm nguyên âm đôi /aʊ/, /əʊ/, /eə/; cấu trúc so sánh kép (double comparatives) và cụm động từ; thảo luận các vấn đề đô thị và giải pháp.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t9',
        week: 'Tuần 3',
        lessonName: 'Unit 2: Lesson 1: Getting started',
        periodAllocation: 'Tiết 9',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: City life; Gain vocabulary to talk about life in the city.',
      },
      {
        id: 'ta9-t10',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 10',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic City life; Pronounce the diphthong sounds /aʊ/, /əʊ/, and /eə/ in words and sentences correctly.',
      },
      {
        id: 'ta9-t11',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 11',
        periodsCount: 1,
        adjustedContent:
          'Recognise and use double comparatives and some phrasal verbs.',
      },
      {
        id: 'ta9-t12',
        week: 'Tuần 4',
        lessonName: 'Unit 2: Lesson 4: Communication',
        periodAllocation: 'Tiết 12',
        periodsCount: 1,
        adjustedContent:
          'Offer help and respond to an offer; Talk about means of transport that they use.',
      },
      {
        id: 'ta9-t13',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 13',
        periodsCount: 1,
        adjustedContent:
          'Read for main idea and specific information in an article about a competition to find solutions to city problems; Talk about city problems and their solutions.',
      },
      {
        id: 'ta9-t14',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 14',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information in an interview about life in the city; Write a paragraph on what they like or dislike about city life.',
      },
      {
        id: 'ta9-t15',
        week: 'Tuần 5',
        lessonName: 'Unit 2: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 15',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 2; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk1-u3',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U3',
    chapterTitle: 'Unit 3: Healthy living for teens (Tiết 16 – 22)',
    semester: 'HK1',
    weekRange: 'Tuần 6 – Tuần 8',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Lối sống lành mạnh và cân bằng cho học sinh trung học (Healthy living for teens); phát âm /h/ và /r/; động từ khuyết thiếu trong câu điều kiện loại 1 (modal verbs in first conditional sentences); kỹ năng quản lý thời gian hiệu quả.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t16',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 1: Getting started',
        periodAllocation: 'Tiết 16',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: Healthy living for teens; Gain vocabulary to talk about how to have a well-balanced life as a secondary student.',
      },
      {
        id: 'ta9-t17',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 17',
        periodsCount: 1,
        adjustedContent:
          "Use the lexical items related to the topic students' life and schoolwork; Identify the combination of some words/phrases that are often used when teens talk about students' life and schoolwork; Pronounce correctly the sounds /h/ and /r/.",
      },
      {
        id: 'ta9-t18',
        week: 'Tuần 6',
        lessonName: 'Unit 3: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 18',
        periodsCount: 1,
        adjustedContent:
          'Review the knowledge of first conditional sentences; Distinguish the uses of modal verbs in first conditional sentences; Use modal verbs in first conditional sentences in real-life situations.',
      },
      {
        id: 'ta9-t19',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 4: Communication',
        periodAllocation: 'Tiết 19',
        periodsCount: 1,
        adjustedContent:
          'Ask for repetition and respond; Practice reading for specific information.',
      },
      {
        id: 'ta9-t20',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 20',
        periodsCount: 1,
        adjustedContent:
          "Read for information about how a successful teen celebrity kept a well-balanced life when he was at school; Talk about their partner's ideas about how to have a well-balanced life.",
      },
      {
        id: 'ta9-t21',
        week: 'Tuần 7',
        lessonName: 'Unit 3: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 21',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about how some students manage their time; Write a paragraph about how to manage time effectively.',
      },
      {
        id: 'ta9-t22',
        week: 'Tuần 8',
        lessonName: 'Unit 3: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 22',
        periodsCount: 1,
        adjustedContent:
          "Revise vocabulary items related to the topic students' life and schoolwork; Use modal verbs in first conditional sentences; Apply what they have learnt (vocabulary and grammar) into practice through a project.",
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk1-u4-rev1',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U4-R1',
    chapterTitle: 'Unit 4: Remembering the past, Review 1 & Kiểm tra giữa kì I (Tiết 23 – 34)',
    semester: 'HK1',
    weekRange: 'Tuần 8 – Tuần 12',
    totalPeriods: 12,
    adjustedContentSummary:
      'Từ vựng về Di tích lịch sử và Ký ức quá khứ (Remembering the past); phát âm /m/ và /l/; thì quá khứ tiếp diễn và cấu trúc wish + past simple; giữ gìn truyền thống văn hóa; Ôn tập Review 1 (Units 1–3) và Kiểm tra Giữa học kì I. Tích hợp NLS (3.1.TC2b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t23',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 1: Getting started',
        periodAllocation: 'Tiết 23',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the listening and reading text; Introduce the topic of the unit: remembering the past; Gain vocabulary to talk about some historical places. [Tích hợp NLS: 3.1.TC2b]',
        note: 'Tích hợp NLS: 3.1.TC2b',
      },
      {
        id: 'ta9-t24',
        week: 'Tuần 8',
        lessonName: 'Unit 4: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 24',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Remembering the past; Pronounce the sounds /m/ and /l/ in words and sentences correctly.',
      },
      {
        id: 'ta9-t25',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 25',
        periodsCount: 1,
        adjustedContent:
          'Recognize and use past continuous and wish + past simple.',
      },
      {
        id: 'ta9-t26',
        week: 'Tuần 9',
        lessonName: 'Unit 4: Lesson 4: Communication',
        periodAllocation: 'Tiết 26',
        periodsCount: 1,
        adjustedContent:
          'Know how to thank and respond; Talk how to keep traditions alive.',
      },
      {
        id: 'ta9-t27',
        week: 'Tuần 9',
        lessonName: 'REVIEW 1 (Language)',
        periodAllocation: 'Tiết 27',
        periodsCount: 1,
        adjustedContent: 'Revise the language students have learnt in Units 1-3.',
      },
      {
        id: 'ta9-t28',
        week: 'Tuần 10',
        lessonName: 'REVIEW 1 (Skills)',
        periodAllocation: 'Tiết 28',
        periodsCount: 1,
        adjustedContent: 'Revise the skills they have practiced in Unit 1-3.',
      },
      {
        id: 'ta9-t29',
        week: 'Tuần 10',
        lessonName: 'REVIEW FOR THE MID FIRST TERM TEST + THE MID FIRST TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 29',
        periodsCount: 1,
        adjustedContent:
          'Review all the knowledge learnt in unit 1, 2, 3; Take listening test.',
      },
      {
        id: 'ta9-t30',
        week: 'Tuần 10',
        lessonName: 'THE MID FIRST TERM TEST',
        periodAllocation: 'Tiết 30',
        periodsCount: 1,
        adjustedContent: 'Take the test.',
      },
      {
        id: 'ta9-t31',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 31',
        periodsCount: 1,
        adjustedContent:
          'Read for specific information about how English people continue their culinary traditions; Talk about a typical traditional Vietnamese dish.',
      },
      {
        id: 'ta9-t32',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 32',
        periodsCount: 1,
        adjustedContent:
          'Listen for general and specific information about old school days; Write about old school days.',
      },
      {
        id: 'ta9-t33',
        week: 'Tuần 11',
        lessonName: 'Unit 4: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 33',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 4; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta9-t34',
        week: 'Tuần 12',
        lessonName: 'THE MID FIRST TERM TEST CORRECTION',
        periodAllocation: 'Tiết 34',
        periodsCount: 1,
        adjustedContent: 'Correct the mistakes in the test.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk1-u5',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U5',
    chapterTitle: 'Unit 5: Our experiences (Tiết 35 – 41)',
    semester: 'HK1',
    weekRange: 'Tuần 12 – Tuần 14',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Trải nghiệm của chúng ta (Our experiences); phát âm /j/ và /w/; thì hiện tại hoàn thành (present perfect tense); xin lỗi và đáp lại lời xin lỗi; viết đoạn văn về trải nghiệm đáng nhớ ở trường học.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t35',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 1: Getting started',
        periodAllocation: 'Tiết 35',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: our experiences; Gain vocabulary to talk about experiences.',
      },
      {
        id: 'ta9-t36',
        week: 'Tuần 12',
        lessonName: 'Unit 5: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 36',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Our experiences; Pronounce correctly the sounds /j/ and /w/.',
      },
      {
        id: 'ta9-t37',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 37',
        periodsCount: 1,
        adjustedContent: 'Use the present perfect tense.',
      },
      {
        id: 'ta9-t38',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 4: Communication',
        periodAllocation: 'Tiết 38',
        periodsCount: 1,
        adjustedContent:
          "Know how to apologise and respond to apologies; Have language input to describe their past experiences of a camping day; Talk and report about one's experiences.",
      },
      {
        id: 'ta9-t39',
        week: 'Tuần 13',
        lessonName: 'Unit 5: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 39',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about experiences in a summer course; Talk about their experiences of a course.',
      },
      {
        id: 'ta9-t40',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 40',
        periodsCount: 1,
        adjustedContent:
          'Listen for information about a bad experience at school; Write a paragraph about their most pleasant / unpleasant experience at school.',
      },
      {
        id: 'ta9-t41',
        week: 'Tuần 14',
        lessonName: 'Unit 5: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 41',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 5; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk1-u6-rev2',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U6-R2',
    chapterTitle: 'Unit 6: Vietnamese lifestyle: Then and Now, Review 2 & Kiểm tra cuối kì I (Tiết 42 – 54)',
    semester: 'HK1',
    weekRange: 'Tuần 14 – Tuần 18',
    totalPeriods: 13,
    adjustedContentSummary:
      'Từ vựng về Lối sống Việt Nam xưa và nay (Vietnamese lifestyle: Then and Now); phát âm cụm phụ âm /fl/ và /fr/; động từ theo sau bởi to-infinitive và V-ing; viết về những thay đổi trong đời sống gia đình; Ôn tập Review 2 (Units 4–6) và Kiểm tra Cuối học kì I. Tích hợp NLS (2.2.TC2a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t42',
        week: 'Tuần 14',
        lessonName: 'Unit 6: Lesson 1: Getting started',
        periodAllocation: 'Tiết 42',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory text; Introduce the topic of the unit: lifestyle; Gain vocabulary to talk about changes in lifestyle.',
      },
      {
        id: 'ta9-t43',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 43',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic VIETNAMESE LIFESTYLE: THEN AND NOW; Pronounce the cluster /fl/ and /fr/ in words and sentences correctly.',
      },
      {
        id: 'ta9-t44',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 44',
        periodsCount: 1,
        adjustedContent: 'Use correctly to-infinitive and V-ing after a verb.',
      },
      {
        id: 'ta9-t45',
        week: 'Tuần 15',
        lessonName: 'Unit 6: Lesson 4: Communication',
        periodAllocation: 'Tiết 45',
        periodsCount: 1,
        adjustedContent:
          'Know how to make promises; Talk about Changes in Lifestyle.',
      },
      {
        id: 'ta9-t46',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 46',
        periodsCount: 1,
        adjustedContent:
          "Read for specific information about the differences in the learning styles of past and present; Talk about changes in one's learning style.",
      },
      {
        id: 'ta9-t47',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 47',
        periodsCount: 1,
        adjustedContent:
          "Listen for general and specific information to talk about changes in family life; Write about the changes in one's family. [Tích hợp NLS: 2.2.TC2a]",
        note: 'Tích hợp NLS: 2.2.TC2a',
      },
      {
        id: 'ta9-t48',
        week: 'Tuần 16',
        lessonName: 'Unit 6: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 48',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 6; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta9-t49',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Language)',
        periodAllocation: 'Tiết 49',
        periodsCount: 1,
        adjustedContent: 'Revise the language students have learnt in Units 4-6.',
      },
      {
        id: 'ta9-t50',
        week: 'Tuần 17',
        lessonName: 'Review 2 (Skills)',
        periodAllocation: 'Tiết 50',
        periodsCount: 1,
        adjustedContent: 'Revise the skills they have practiced in Units 4-6.',
      },
      {
        id: 'ta9-t51',
        week: 'Tuần 17',
        lessonName: 'The 1st semester exam (Speaking)',
        periodAllocation: 'Tiết 51',
        periodsCount: 1,
        adjustedContent: "Check Ss' ability in speaking skill.",
      },
      {
        id: 'ta9-t52',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 52',
        periodsCount: 1,
        adjustedContent: 'Review all the knowledge learnt in unit 1-6.',
      },
      {
        id: 'ta9-t53',
        week: 'Tuần 18',
        lessonName: 'Review for the 1st semester test',
        periodAllocation: 'Tiết 53',
        periodsCount: 1,
        adjustedContent: "Check Ss' ability in speaking skill.",
      },
      {
        id: 'ta9-t54',
        week: 'Tuần 18',
        lessonName: 'The 1st semester exam',
        periodAllocation: 'Tiết 54',
        periodsCount: 1,
        adjustedContent: 'Take the 1st semester exam.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk2-u7',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U7',
    chapterTitle: 'Unit 7: Natural wonders of the world (Tiết 55 – 61)',
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 21',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Các kỳ quan thiên nhiên thế giới (Natural wonders of the world); phát âm /sl/ và /sn/; câu tường thuật dạng câu hỏi Yes/No (reported speech - Yes/No questions); đọc về dãy Dolomites, rạn san hô Great Barrier Reef, rừng mưa Amazon và viết về thắng cảnh thiên nhiên.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t55',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 1: Getting started',
        periodAllocation: 'Tiết 55',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: natural wonders of the world; Gain vocabulary to talk about natural wonders of the world.',
      },
      {
        id: 'ta9-t56',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 56',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic NATURAL WONDERS; Pronounce the sounds /sl/ and /sn/ in words and sentences correctly.',
      },
      {
        id: 'ta9-t57',
        week: 'Tuần 19',
        lessonName: 'Unit 7: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 57',
        periodsCount: 1,
        adjustedContent: 'Change Yes / No questions into reported speech.',
      },
      {
        id: 'ta9-t58',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 4: Communication',
        periodAllocation: 'Tiết 58',
        periodsCount: 1,
        adjustedContent:
          'Know how to ask for permission and respond; Talk about Natural wonders and tourism.',
      },
      {
        id: 'ta9-t59',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 59',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about the Dolomites - a travel destination; Talk about the Great Barrier Reef.',
      },
      {
        id: 'ta9-t60',
        week: 'Tuần 20',
        lessonName: 'Unit 7: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 60',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information about the Amazon Rainforest; Write about a natural wonder / landscape in their area.',
      },
      {
        id: 'ta9-t61',
        week: 'Tuần 21',
        lessonName: 'Unit 7: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 61',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 7; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk2-u8',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U8',
    chapterTitle: 'Unit 8: Tourism (Tiết 62 – 68)',
    semester: 'HK2',
    weekRange: 'Tuần 21 – Tuần 23',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Du lịch (Tourism) và trải nghiệm lữ hành; trọng âm từ kết thúc bằng -ic và -ious; đại từ quan hệ (relative pronouns: which, who, whose); viết đoạn văn giới thiệu tour du lịch nửa ngày tại Huế. Tích hợp AI (9.C2.2).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t62',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 1: Getting started',
        periodAllocation: 'Tiết 62',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Tourism; Gain vocabulary to talk about travel experience. [Tích hợp AI: 9.C2.2]',
        note: 'Tích hợp AI: 9.C2.2',
      },
      {
        id: 'ta9-t63',
        week: 'Tuần 21',
        lessonName: 'Unit 8: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 63',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic tourism; Pronounce endings -ic and -ious in words and in sentences correctly.',
      },
      {
        id: 'ta9-t64',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 64',
        periodsCount: 1,
        adjustedContent:
          'Use relative pronouns: which, who, and whose in sentences in real-life situations.',
      },
      {
        id: 'ta9-t65',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 4: Communication',
        periodAllocation: 'Tiết 65',
        periodsCount: 1,
        adjustedContent:
          'Express obligation and respond; Practice reading for specific information.',
      },
      {
        id: 'ta9-t66',
        week: 'Tuần 22',
        lessonName: 'Unit 8: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 66',
        periodsCount: 1,
        adjustedContent:
          "Read for specific information about two popular types of tours and their advantages and disadvantages; Talk about their partner's travel experience and share their opinion about it.",
      },
      {
        id: 'ta9-t67',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 67',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific and general information about a one-day trip to the home of the Brontes; Write a paragraph introducing a half day tour in Hue.',
      },
      {
        id: 'ta9-t68',
        week: 'Tuần 23',
        lessonName: 'Unit 8: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 68',
        periodsCount: 1,
        adjustedContent:
          'Revise vocabulary items related to the topic tourism; Use vocabulary items in new context; Correctly use relative pronouns which, who, or whose in sentences; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk2-u9-rev3',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U9-R3',
    chapterTitle: 'Unit 9: World Englishes, Review 3 & Kiểm tra giữa kì II (Tiết 69 – 79)',
    semester: 'HK2',
    weekRange: 'Tuần 23 – Tuần 27',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về Tiếng Anh trên thế giới (World Englishes); trọng âm từ tận cùng bằng -ion và -ity; mệnh đề quan hệ xác định (defining relative clauses); viết đoạn văn về cách cải thiện việc học tiếng Anh; Ôn tập Review 3 (Units 7–9) và Kiểm tra Giữa học kì II.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t69',
        week: 'Tuần 23',
        lessonName: 'Unit 9: Lesson 1: Getting started',
        periodAllocation: 'Tiết 69',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: World Englishes; Gain vocabulary to talk about World Englishes.',
      },
      {
        id: 'ta9-t70',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 70',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic WORLD ENGLISHES; Pronounce the words ending in –ion and –ity with correct stress.',
      },
      {
        id: 'ta9-t71',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 71',
        periodsCount: 1,
        adjustedContent: 'Use defining relative clauses.',
      },
      {
        id: 'ta9-t72',
        week: 'Tuần 24',
        lessonName: 'Unit 9: Lesson 4: Communication',
        periodAllocation: 'Tiết 72',
        periodsCount: 1,
        adjustedContent:
          'Say good luck and respond; Talk about WORLD ENGLISHES and tourism.',
      },
      {
        id: 'ta9-t73',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 73',
        periodsCount: 1,
        adjustedContent:
          'Read for general and specific information about the three circles in English; Talk about borrowed words.',
      },
      {
        id: 'ta9-t74',
        week: 'Tuần 25',
        lessonName: 'Unit 9: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 74',
        periodsCount: 1,
        adjustedContent:
          "Listen for specific information about ways to improve one's English vocabulary; Write a paragraph about ways to improve an area of English learning.",
      },
      {
        id: 'ta9-t75',
        week: 'Tuần 25',
        lessonName: 'REVIEW 3 (Language)',
        periodAllocation: 'Tiết 75',
        periodsCount: 1,
        adjustedContent:
          'Revise the language students have learnt and they have practiced in Units 7-9.',
      },
      {
        id: 'ta9-t76',
        week: 'Tuần 26',
        lessonName: 'REVIEW 3 (Skills)',
        periodAllocation: 'Tiết 76',
        periodsCount: 1,
        adjustedContent:
          'Revise the skills students have learnt and they have practiced in Units 7-9.',
      },
      {
        id: 'ta9-t77',
        week: 'Tuần 26',
        lessonName: 'REVIEW FOR THE MID SECOND TERM TEST + THE MID SECOND TERM TEST (LISTENING)',
        periodAllocation: 'Tiết 77',
        periodsCount: 1,
        adjustedContent:
          'Revise the language and students have learnt and they have practiced in Units 7-9; Do listening test.',
      },
      {
        id: 'ta9-t78',
        week: 'Tuần 26',
        lessonName: 'THE MID SECOND TERM TEST',
        periodAllocation: 'Tiết 78',
        periodsCount: 1,
        adjustedContent: "Check students' abilities in a writing test.",
      },
      {
        id: 'ta9-t79',
        week: 'Tuần 27',
        lessonName: 'Unit 9: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 79',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 9; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk2-u10',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U10',
    chapterTitle: 'Unit 10: Planet Earth & Sửa bài KT giữa kì II (Tiết 80 – 87)',
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 29',
    totalPeriods: 8,
    adjustedContentSummary:
      'Từ vựng về Hành tinh Trái Đất (Planet Earth), hệ sinh thái và hệ động thực vật (flora and fauna); nhịp điệu câu; mệnh đề quan hệ không xác định (non-defining relative clauses); viết bản tóm tắt (summary) về bảo vệ môi trường sống. Tích hợp NLS (5.3 TC1a).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t80',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 1: Getting started',
        periodAllocation: 'Tiết 80',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: planet Earth, habitats, and flora and fauna; Gain vocabulary to talk about the planet Earth.',
      },
      {
        id: 'ta9-t81',
        week: 'Tuần 27',
        lessonName: 'Unit 10: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 81',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Planet Earth; Have the right rhythm in sentences.',
      },
      {
        id: 'ta9-t82',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 82',
        periodsCount: 1,
        adjustedContent:
          'Use non-defining relative clauses. [Tích hợp NLS: 5.3 TC1a]',
        note: 'Tích hợp NLS: 5.3 TC1a',
      },
      {
        id: 'ta9-t83',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 4: Communication',
        periodAllocation: 'Tiết 83',
        periodsCount: 1,
        adjustedContent:
          'Persuade someone to do something and responding to persuasions; Read for general and specific information about new technology.',
      },
      {
        id: 'ta9-t84',
        week: 'Tuần 28',
        lessonName: 'Unit 10: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 84',
        periodsCount: 1,
        adjustedContent:
          'Read for main idea and specific about role of plant and animals; Talk about threats to flora and fauna and how to protect them.',
      },
      {
        id: 'ta9-t85',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 85',
        periodsCount: 1,
        adjustedContent:
          'Listen about the effects of living things on the environment; Write a summary.',
      },
      {
        id: 'ta9-t86',
        week: 'Tuần 29',
        lessonName: 'Unit 10: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 86',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 10; apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta9-t87',
        week: 'Tuần 29',
        lessonName: 'THE MID SECOND TERM TEST CORRECTION',
        periodAllocation: 'Tiết 87',
        periodsCount: 1,
        adjustedContent: "Check students' mistakes.",
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk2-u11',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U11',
    chapterTitle: 'Unit 11: Electronic devices (Tiết 88 – 94)',
    semester: 'HK2',
    weekRange: 'Tuần 30 – Tuần 32',
    totalPeriods: 7,
    adjustedContentSummary:
      'Từ vựng về Thiết bị điện tử (Electronic devices); trọng âm câu; cấu trúc suggest / advise / recommend + V-ing hoặc mệnh đề với should; đọc, nói và viết đoạn văn về các thiết bị điện tử thông minh phục vụ học tập và đời sống.',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t88',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 1: Getting started',
        periodAllocation: 'Tiết 88',
        periodsCount: 1,
        adjustedContent:
          'Gain an overview about the topic Electronic devices; Gain vocabulary to talk about Electronic devices.',
      },
      {
        id: 'ta9-t89',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 89',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic Electronic devices; Pronounce stress on all words in sentences correctly.',
      },
      {
        id: 'ta9-t90',
        week: 'Tuần 30',
        lessonName: 'Unit 11: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 90',
        periodsCount: 1,
        adjustedContent:
          'Use suggest / advise / recommend + V-ing or a clause with should.',
      },
      {
        id: 'ta9-t91',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 4: Communication',
        periodAllocation: 'Tiết 91',
        periodsCount: 1,
        adjustedContent:
          'Know how to check understanding and respond; Know some electronic devices in modern classrooms.',
      },
      {
        id: 'ta9-t92',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 92',
        periodsCount: 1,
        adjustedContent:
          'Read about electronic devices; Talk about an electronic device which is important to you.',
      },
      {
        id: 'ta9-t93',
        week: 'Tuần 31',
        lessonName: 'Unit 11: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 93',
        periodsCount: 1,
        adjustedContent:
          'Listen for information about electronic devices; Write a paragraph about electronic devices.',
      },
      {
        id: 'ta9-t94',
        week: 'Tuần 32',
        lessonName: 'Unit 11: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 94',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 11; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
    ],
  }),
  buildThcsTopic({
    id: 'thcs-ta9-hk2-u12-rev4',
    grade: 9,
    subject: 'Tiếng Anh',
    chapterCode: 'TA9-U12-R4',
    chapterTitle: 'Unit 12: Career choices, Review 4 & Kiểm tra cuối kì II (Tiết 95 – 105)',
    semester: 'HK2',
    weekRange: 'Tuần 32 – Tuần 35',
    totalPeriods: 11,
    adjustedContentSummary:
      'Từ vựng về Định hướng và lựa chọn nghề nghiệp tương lai (Career choices); ngữ điệu câu trần thuật dùng như câu hỏi; mệnh đề trạng ngữ chỉ kết quả, nguyên nhân và nhượng bộ (adverbial clauses of result, reasons, and concession); viết email về nghề nghiệp mơ ước; Ôn tập Review 4 (Units 10–12) và Kiểm tra Cuối học kì II. Tích hợp NLS (1.1.TC2b).',
    sourceDocument: NDA_THCS_TA_SOURCE_DOC,
    rawLessons: [
      {
        id: 'ta9-t95',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 1: Getting started',
        periodAllocation: 'Tiết 95',
        periodsCount: 1,
        adjustedContent:
          'Set the context for the introductory; Introduce the topic of the unit: Jobs; Gain vocabulary to talk about Future Jobs.',
      },
      {
        id: 'ta9-t96',
        week: 'Tuần 32',
        lessonName: 'Unit 12: Lesson 2: A closer look 1',
        periodAllocation: 'Tiết 96',
        periodsCount: 1,
        adjustedContent:
          'Use the lexical items related to the topic CAREER CHOICES; Say statements used as questions with correct intonation. [Tích hợp NLS: 1.1.TC2b]',
        note: 'Tích hợp NLS: 1.1.TC2b',
      },
      {
        id: 'ta9-t97',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 3: A closer look 2',
        periodAllocation: 'Tiết 97',
        periodsCount: 1,
        adjustedContent:
          'Use adverbial clauses of result, reasons, and concession.',
      },
      {
        id: 'ta9-t98',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 4: Communication',
        periodAllocation: 'Tiết 98',
        periodsCount: 1,
        adjustedContent:
          'Know how to express hope and respond; Talk about Jobs.',
      },
      {
        id: 'ta9-t99',
        week: 'Tuần 33',
        lessonName: 'Unit 12: Lesson 5: Skills 1',
        periodAllocation: 'Tiết 99',
        periodsCount: 1,
        adjustedContent:
          'Read for main idea and specific information in an article about the future world of work; Talk about the job they want to do in the future.',
      },
      {
        id: 'ta9-t100',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 6: Skills 2',
        periodAllocation: 'Tiết 100',
        periodsCount: 1,
        adjustedContent:
          'Listen for specific information in two talks about career paths; Write an email about their favourite future job.',
      },
      {
        id: 'ta9-t101',
        week: 'Tuần 34',
        lessonName: 'Unit 12: Lesson 7: Looking back + Project',
        periodAllocation: 'Tiết 101',
        periodsCount: 1,
        adjustedContent:
          'Review the vocabulary and grammar of Unit 12; Apply what they have learnt (vocabulary and grammar) into practice through a project.',
      },
      {
        id: 'ta9-t102',
        week: 'Tuần 34',
        lessonName: 'Review 4 (Language)',
        periodAllocation: 'Tiết 102',
        periodsCount: 1,
        adjustedContent: 'Revise the language students have learnt in Units 10-12.',
      },
      {
        id: 'ta9-t103',
        week: 'Tuần 35',
        lessonName: 'Review 4 (Skills)',
        periodAllocation: 'Tiết 103',
        periodsCount: 1,
        adjustedContent: 'Review the skills they have practiced in Units 10-12.',
      },
      {
        id: 'ta9-t104',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam (Speaking)',
        periodAllocation: 'Tiết 104',
        periodsCount: 1,
        adjustedContent: "Check Ss' ability in speaking skill.",
      },
      {
        id: 'ta9-t105',
        week: 'Tuần 35',
        lessonName: 'The 2nd semester exam',
        periodAllocation: 'Tiết 105',
        periodsCount: 1,
        adjustedContent: 'Take the 2nd semester exam.',
      },
    ],
  }),
];

export const THCS_TIENG_ANH_TOPICS_2026: CurriculumTopic[] = [
  ...GRADE6_TIENG_ANH_TOPICS_2026,
  ...GRADE7_TIENG_ANH_TOPICS_2026,
  ...GRADE8_TIENG_ANH_TOPICS_2026,
  ...GRADE9_TIENG_ANH_TOPICS_2026,
];
