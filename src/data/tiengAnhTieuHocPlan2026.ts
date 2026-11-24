import {
  CognitiveLevelCode,
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const NDA_TIEU_HOC_TIENG_ANH_SOURCE_DOC =
  'Phụ lục I – Kế hoạch dạy học môn Tiếng Anh Khối Tiểu học (Lớp 3, 4, 5 – Bộ sách Global Success) năm học 2026 – 2027 (Tổ Tiếng Anh - GDTC – Trường TH&THCS Nguyễn Đình Anh, 140 tiết/năm/lớp)';

interface RawPrimaryEnglishLessonInput {
  id?: string;
  week: string;
  lessonName: string;
  subLessonName?: string;
  periodAllocation: string;
  periodsCount: number;
  adjustedContent: string;
  note?: string;
}

function buildPrimaryEnglishTopic(params: {
  id: string;
  grade: GradeNumber;
  semester: 'HK1' | 'HK2';
  weekRange: string;
  totalPeriods: number;
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  adjustedContentSummary: string;
  rawLessons: RawPrimaryEnglishLessonInput[];
}): CurriculumTopic {
  const {
    id,
    grade,
    semester,
    weekRange,
    totalPeriods,
    chapterCode,
    chapterTitle,
    topicTitle,
    adjustedContentSummary,
    rawLessons,
  } = params;

  const lessons = rawLessons.map((ls, idx) => ({
    id: ls.id || `${id}-ls-${idx + 1}`,
    week: ls.week,
    lessonName: ls.lessonName,
    subLessonName: ls.subLessonName,
    periodAllocation: ls.periodAllocation,
    periodsCount: ls.periodsCount,
    adjustedContent: ls.adjustedContent,
    integrationTags: extractIntegrationTags(`${ls.adjustedContent} ${ls.note || ''}`),
    note: ls.note,
  }));

  const learningOutcomes = lessons.map((ls, idx) => ({
    code: `${chapterCode}-YCCĐ${idx + 1}`,
    lessonName: ls.lessonName,
    duration: `${ls.periodAllocation} (${ls.periodsCount} tiết)`,
    week: ls.week,
    description: `${ls.lessonName}${ls.subLessonName ? ` [${ls.subLessonName}]` : ''} (${ls.week} – ${ls.periodAllocation}): ${ls.adjustedContent}`,
    suggestedCognitiveLevel:
      idx % 3 === 0
        ? CognitiveLevelCode.PRIMARY_MUC_1
        : idx % 3 === 1
          ? CognitiveLevelCode.PRIMARY_MUC_2
          : CognitiveLevelCode.PRIMARY_MUC_3,
  }));

  return {
    id,
    levelId: EducationLevelId.PRIMARY,
    grade,
    subject: 'Tiếng Anh',
    chapterCode,
    chapterTitle,
    topicTitle,
    semester,
    weekRange,
    durationText: `${totalPeriods} tiết (${weekRange})`,
    totalPeriods,
    adjustedContentSummary,
    sourceDocument: NDA_TIEU_HOC_TIENG_ANH_SOURCE_DOC,
    lessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// 1.1.5. KẾ HOẠCH DẠY HỌC TIẾNG ANH 3 (GLOBAL SUCCESS – 35 TUẦN x 4 TIẾT = 140 TIẾT)
// - HKI: Tuần 1 – Tuần 18 (Tiết 1 – Tiết 72 = 72 tiết): Chủ đề 1 (36 tiết) + Chủ đề 2 (36 tiết)
// - HKII: Tuần 19 – Tuần 35 (Tiết 73 – Tiết 140 = 68 tiết): Chủ đề 3 (32 tiết) + Chủ đề 4 (36 tiết)
// ============================================================================

export const GRADE3_TIENG_ANH_TOPICS: CurriculumTopic[] = [
  buildPrimaryEnglishTopic({
    id: 'nda-2026-g3-ta-cd1',
    grade: 3,
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 9 (Tháng 9 – 11)',
    totalPeriods: 36,
    chapterCode: 'TA3-CĐ1',
    chapterTitle: 'Chủ đề 1: Me and my friends (Tiết 1 – Tiết 36)',
    topicTitle:
      'Chủ đề 1: Me and my friends (Làm quen & Starter, Unit 1: Hello, Unit 2: Our names, Unit 3: Our friends, Unit 4: Our bodies, Unit 5: My hobbies & Review 1 – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp KNS (rèn kĩ năng chào hỏi, giới thiệu bản thân ở Unit 1, Unit 2; giữ gìn đôi mắt ở Unit 4), AI (3.A1.MR1 ở Unit 1 Tiết 5), NLS (2.5.CB1.a ở Unit 3 Tiết 17), Giáo dục lý tưởng cách mạng, đạo đức, lối sống (tình bạn đoàn kết ở Unit 3; yêu quý bản thân ở Unit 4) và Quyền con người (quyền được tôn trọng, học tập, vui chơi ở Unit 5).',
    rawLessons: [
      {
        week: 'Tuần 1 (Tháng 9)',
        lessonName: 'Làm quen & Starter',
        subLessonName:
          'Chương trình & SGK Tiếng Anh 3 (Tiết 1); A. Numbers (Tiết 2); B. The Alphabet (Tiết 3); C. Fun Time (Tiết 4)',
        periodAllocation: 'Tiết 1 – Tiết 4',
        periodsCount: 4,
        adjustedContent:
          'Làm quen Chương trình và sách giáo khoa Tiếng Anh 3 và các tài liệu bổ trợ liên quan trên mạng (Tiết 1); Starter: A. Numbers (Tiết 2), B. The Alphabet (Tiết 3), C. Fun Time (Tiết 4).',
      },
      {
        week: 'Tuần 2 – 3 (Tháng 9)',
        lessonName: 'Unit 1: Hello',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 5]; Lesson 1 (4,5,6) [Tiết 6]; Lesson 2 (1,2,3) [Tiết 7]; Lesson 2 (4,5,6) [Tiết 8]; Lesson 3 (1,2,3) [Tiết 9]; Lesson 3 (4,5,6) [Tiết 10]',
        periodAllocation: 'Tiết 5 – Tiết 10',
        periodsCount: 6,
        adjustedContent:
          'Tiết 5 (Lesson 1: 1,2,3): Tích hợp KNS: Rèn kĩ năng chào hỏi, giới thiệu bản thân; Tích hợp AI: 3.A1.MR1. Thực hành chào hỏi, hỏi thăm sức khỏe (Hello/Hi, I’m...; How are you? – Fine, thank you) và phát âm /h/, /b/ (Tiết 6–10).',
      },
      {
        week: 'Tuần 3 – 4 (Tháng 9)',
        lessonName: 'Unit 2: Our names',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 11]; Lesson 1 (4,5,6) [Tiết 12]; Lesson 2 (1,2,3) [Tiết 13]; Lesson 2 (4,5,6) [Tiết 14]; Lesson 3 (1,2,3) [Tiết 15]; Lesson 3 (4,5,6) [Tiết 16]',
        periodAllocation: 'Tiết 11 – Tiết 16',
        periodsCount: 6,
        adjustedContent:
          'Tiết 13 (Lesson 2: 1,2,3): Tích hợp KNS: Rèn kĩ năng chào hỏi. Hỏi và trả lời về tên và tuổi của bạn (What’s your name? – My name’s...; How old are you? – I’m ... years old) và phát âm /m/, /n/ (Tiết 11–16).',
      },
      {
        week: 'Tuần 5 – 6 (Tháng 10)',
        lessonName: 'Unit 3: Our friends',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 17]; Lesson 1 (4,5,6) [Tiết 18]; Lesson 2 (1,2,3) [Tiết 19]; Lesson 2 (4,5,6) [Tiết 20]; Lesson 3 (1,2,3) [Tiết 21]; Lesson 3 (4,5,6) [Tiết 22]',
        periodAllocation: 'Tiết 17 – Tiết 22',
        periodsCount: 6,
        adjustedContent:
          'Tiết 17 (Lesson 1: 1,2,3): Tích hợp NLS: 2.5.CB1.a; Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Giáo dục tình bạn, đoàn kết, giúp đỡ bạn bè. Giới thiệu và hỏi đáp về bạn bè (This is / That’s...; Is this / that...?).',
      },
      {
        week: 'Tuần 6 – 7 (Tháng 10)',
        lessonName: 'Unit 4: Our bodies',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 23]; Lesson 1 (4,5,6) [Tiết 24]; Lesson 2 (1,2,3) [Tiết 25]; Lesson 2 (4,5,6) [Tiết 26]; Lesson 3 (1,2,3) [Tiết 27]; Lesson 3 (4,5,6) [Tiết 28]',
        periodAllocation: 'Tiết 23 – Tiết 28',
        periodsCount: 6,
        adjustedContent:
          'Tiết 23 (Lesson 1: 1,2,3): Tích hợp KNS: Giáo dục HS biết giữ gìn đôi mắt; Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Biết yêu quý bản thân. Nhận biết các bộ phận cơ thể và câu mệnh lệnh chăm sóc cơ thể (Touch your... / Open your...).',
      },
      {
        week: 'Tuần 8 – 9 (Tháng 10 – 11)',
        lessonName: 'Unit 5: My hobbies & Review 1',
        subLessonName:
          'Unit 5: Lesson 1 (1,2,3; 4,5,6), Lesson 2 (1,2,3; 4,5,6), Lesson 3 (1,2,3; 4,5,6) [Tiết 29–34]; Review 1: Activity 1-2 [Tiết 35], Activity 3-5 [Tiết 36]',
        periodAllocation: 'Tiết 29 – Tiết 36',
        periodsCount: 8,
        adjustedContent:
          'Tiết 29 (Unit 5 Lesson 1: 1,2,3): Tích hợp Quyền con người: Giáo dục quyền được tôn trọng, được học tập, được vui chơi. Hỏi đáp về sở thích (What’s your hobby? – It’s singing / drawing / swimming...) và Ôn tập Chủ đề 1 tại Review 1 (Activity 1-2, Activity 3-5).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g3-ta-cd2',
    grade: 3,
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 18 (Tháng 11 – 01)',
    totalPeriods: 36,
    chapterCode: 'TA3-CĐ2',
    chapterTitle: 'Chủ đề 2: Me and my school (Tiết 37 – Tiết 72)',
    topicTitle:
      'Chủ đề 2: Me and my school (Funtime, Unit 6: Our school, Unit 7: Classroom instructions, Unit 8: My school things, Unit 9: Colours, Unit 10: Break time activities, Review 2 & Kiểm tra HKI – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (3.4.CB1.a ở Unit 7 Tiết 44), AI (3.C5.1 ở Unit 7 Tiết 45), Giáo dục lý tưởng cách mạng, đạo đức, lối sống (biết giữ gìn đồ dùng học tập ở Unit 8 Tiết 50) và Kiểm tra đánh giá định kì Học kì I (Tiết 71–72).',
    rawLessons: [
      {
        week: 'Tuần 10 – 11 (Tháng 11)',
        lessonName: 'Funtime & Unit 6: Our school',
        subLessonName:
          'Funtime: Activity 1-3 [Tiết 37]; Unit 6: Lesson 1 (1,2,3; 4,5,6), Lesson 2 (1,2,3; 4,5,6), Lesson 3 (1,2,3; 4,5,6) [Tiết 38–43]',
        periodAllocation: 'Tiết 37 – Tiết 43',
        periodsCount: 7,
        adjustedContent:
          'Thực hành trò chơi ngôn ngữ Funtime (Activity 1-3 – Tiết 37). Unit 6 (Our school – Tiết 38–43): Giới thiệu và hỏi đáp về các phòng học, khu chức năng trong trường (Is this our school / classroom / library / playground / computer room / art room? – Yes, it is / No, it isn’t; Let’s go to the...).',
      },
      {
        week: 'Tuần 11 – 13 (Tháng 11)',
        lessonName: 'Unit 7: Classroom instructions',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 44]; Lesson 1 (4,5,6) [Tiết 45]; Lesson 2 (1,2,3) [Tiết 46]; Lesson 2 (4,5,6) [Tiết 47]; Lesson 3 (1,2,3) [Tiết 48]; Lesson 3 (4,5,6) [Tiết 49]',
        periodAllocation: 'Tiết 44 – Tiết 49',
        periodsCount: 6,
        adjustedContent:
          'Tiết 44 (Lesson 1: 1,2,3): Tích hợp NLS: 3.4.CB1.a. Tiết 45 (Lesson 1: 4,5,6): Tích hợp AI: 3.C5.1. Thực hiện mệnh lệnh lớp học (Open/Close your book, Stand up, Sit down) và câu xin phép lịch sự (May I come in / go out / speak Vietnamese? – Yes, you can / No, you can’t).',
      },
      {
        week: 'Tuần 13 – 14 (Tháng 11 – 12)',
        lessonName: 'Unit 8: My school things',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 50]; Lesson 1 (4,5,6) [Tiết 51]; Lesson 2 (1,2,3) [Tiết 52]; Lesson 2 (4,5,6) [Tiết 53]; Lesson 3 (1,2,3) [Tiết 54]; Lesson 3 (4,5,6) [Tiết 55]',
        periodAllocation: 'Tiết 50 – Tiết 55',
        periodsCount: 6,
        adjustedContent:
          'Tiết 50 (Lesson 1: 1,2,3): Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Biết giữ gìn đồ dùng học tập. Nói và hỏi đáp về các đồ dùng học tập (I have a pen / ruler / book / school bag...; Do you have a/an...? – Yes, I do / No, I don’t).',
      },
      {
        week: 'Tuần 14 – 16 (Tháng 12)',
        lessonName: 'Unit 9: Colours',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 56]; Lesson 1 (4,5,6) [Tiết 57]; Lesson 2 (1,2,3) [Tiết 58]; Lesson 2 (4,5,6) [Tiết 59]; Lesson 3 (1,2,3) [Tiết 60]; Lesson 3 (4,5,6) [Tiết 61]',
        periodAllocation: 'Tiết 56 – Tiết 61',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về màu sắc của các đồ dùng học tập số ít và số nhiều (What colour is it? – It’s blue / brown / red / yellow; What colour are they? – They’re orange / green / white / black).',
      },
      {
        week: 'Tuần 16 – 18 (Tháng 12 – 01)',
        lessonName: 'Unit 10: Break time activities, Review 2, Funtime & Kiểm tra Học kì 1',
        subLessonName:
          'Unit 10: Lesson 1–3 [Tiết 62–67]; Review 2: Activity 1-2 [Tiết 68], Activity 3-5 [Tiết 69]; Funtime: Activity 1-3 [Tiết 70]; Kiểm tra Học kì 1 (Semester 1 Test) [Tiết 71]; Chữa bài (Feedback) [Tiết 72]',
        periodAllocation: 'Tiết 62 – Tiết 72',
        periodsCount: 11,
        adjustedContent:
          'Unit 10 (Tiết 62–67): Nói và hỏi đáp về hoạt động giờ ra chơi (What do you do at break time? – I play badminton / chess / football / table tennis / word puzzles / chat with my friends). Ôn tập Review 2 (Tiết 68–69), Funtime (Tiết 70), Kiểm tra Học kì 1 (Semester 1 Test – Tiết 71) và Chữa bài (Feedback – Tiết 72).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g3-ta-cd3',
    grade: 3,
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 26 (Tháng 01 – 03)',
    totalPeriods: 32,
    chapterCode: 'TA3-CĐ3',
    chapterTitle: 'Chủ đề 3: Me and my family (Tiết 73 – Tiết 104)',
    topicTitle:
      'Chủ đề 3: Me and my family (Unit 11: My family, Unit 12: Jobs, Unit 13: My house, Unit 14: My bedroom, Unit 15: At the dining table & Review 3 – 32 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (4.2.CB1.b ở Unit 11 Tiết 78), Giáo dục lý tưởng cách mạng, đạo đức, lối sống (yêu quý gia đình, giữ gìn nhà cửa sạch đẹp ở Unit 13 Tiết 85), Bài học STEM (Thiết kế mô hình ngôi nhà thân thiện với môi trường ở Unit 13 Tiết 90) và KNS (ăn uống hợp vệ sinh, rửa tay trước khi ăn ở Unit 15 Tiết 97).',
    rawLessons: [
      {
        week: 'Tuần 19 – 20 (Tháng 01)',
        lessonName: 'Unit 11: My family',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 73]; Lesson 1 (4,5,6) [Tiết 74]; Lesson 2 (1,2,3) [Tiết 75]; Lesson 2 (4,5,6) [Tiết 76]; Lesson 3 (1,2,3) [Tiết 77]; Lesson 3 (4,5,6) [Tiết 78]',
        periodAllocation: 'Tiết 73 – Tiết 78',
        periodsCount: 6,
        adjustedContent:
          'Tiết 78 (Lesson 3: 4,5,6): Tích hợp NLS: 4.2.CB1.b. Hỏi và trả lời về các thành viên trong gia đình và tuổi của họ (Who’s this / that? – It’s my father / mother / brother / sister; How old is he / she? – He’s / She’s ... years old).',
      },
      {
        week: 'Tuần 20 – 21 (Tháng 01)',
        lessonName: 'Unit 12: Jobs',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 79]; Lesson 1 (4,5,6) [Tiết 80]; Lesson 2 (1,2,3) [Tiết 81]; Lesson 2 (4,5,6) [Tiết 82]; Lesson 3 (1,2,3) [Tiết 83]; Lesson 3 (4,5,6) [Tiết 84]',
        periodAllocation: 'Tiết 79 – Tiết 84',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về nghề nghiệp của các thành viên trong gia đình (What’s his / her job? – He’s / She’s a doctor / driver / teacher / worker / farmer / nurse / cook / singer; Is he / she a...? – Yes, he/she is / No, he/she isn’t).',
      },
      {
        week: 'Tuần 22 – 23 (Tháng 01 – 02)',
        lessonName: 'Unit 13: My house',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 85]; Lesson 1 (4,5,6) [Tiết 86]; Lesson 2 (1,2,3) [Tiết 87]; Lesson 2 (4,5,6) [Tiết 88]; Lesson 3 (1,2,3) [Tiết 89]; Lesson 3 (4,5,6) [Tiết 90]',
        periodAllocation: 'Tiết 85 – Tiết 90',
        periodsCount: 6,
        adjustedContent:
          'Tiết 85 (Lesson 1: 1,2,3): Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Giáo dục HS biết yêu quý gia đình, giữ gìn nhà cửa sạch đẹp, có trách nhiệm với công việc nhỏ trong gia đình. Tiết 90 (Lesson 3: 4,5,6): Tích hợp STEM: Thiết kế mô hình ngôi nhà thân thiện với môi trường.',
      },
      {
        week: 'Tuần 23 – 25 (Tháng 02 – 03)',
        lessonName: 'Unit 14: My bedroom',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 91]; Lesson 1 (4,5,6) [Tiết 92]; Lesson 2 (1,2,3) [Tiết 93]; Lesson 2 (4,5,6) [Tiết 94]; Lesson 3 (1,2,3) [Tiết 95]; Lesson 3 (4,5,6) [Tiết 96]',
        periodAllocation: 'Tiết 91 – Tiết 96',
        periodsCount: 6,
        adjustedContent:
          'Miêu tả các đồ vật và đặc điểm đồ vật trong phòng ngủ (There’s a desk / a bed in the room; There are two chairs / two windows in the room; The door is big / small / new / old).',
      },
      {
        week: 'Tuần 25 – 26 (Tháng 03)',
        lessonName: 'Unit 15: At the dining table & Review 3',
        subLessonName:
          'Unit 15: Lesson 1–3 [Tiết 97–102]; Review 3: Activity 1-2 [Tiết 103], Activity 3-5 [Tiết 104]',
        periodAllocation: 'Tiết 97 – Tiết 104',
        periodsCount: 8,
        adjustedContent:
          'Tiết 97 (Unit 15 Lesson 1: 1,2,3): Tích hợp KNS: Giáo dục HS biết ăn uống hợp vệ sinh, rửa tay trước khi ăn, không ăn quà vặt không rõ nguồn gốc. Thực hành mời ăn uống tại bàn ăn (Would you like some...? / What would you like to eat / drink?) và Ôn tập Chủ đề 3 tại Review 3 (Tiết 103–104).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g3-ta-cd4',
    grade: 3,
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 35 (Tháng 03 – 05)',
    totalPeriods: 36,
    chapterCode: 'TA3-CĐ4',
    chapterTitle: 'Chủ đề 4: Me and the world around (Tiết 105 – Tiết 140)',
    topicTitle:
      'Chủ đề 4: Me and the world around (Fun time, Unit 16: My pets, Unit 17: Our toys, Unit 18: What are you doing?, Unit 19: Our outdoor activities, Unit 20: At the zoo, Review 4 & Kiểm tra HKII – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp Quyền con người (yêu thương, chăm sóc và bảo vệ vật nuôi ở Unit 16 Tiết 106), Giáo dục đạo đức lối sống (giữ gìn đồ chơi, chia sẻ với bạn bè, không đòi hỏi lãng phí ở Unit 17 Tiết 112), AI (3.C5.3 ở Unit 20 Tiết 130), Bảo vệ môi trường (yêu quý động vật, bảo vệ môi trường sống ở Unit 20 Tiết 130) và Kiểm tra cuối Học kì II (Tiết 139–140).',
    rawLessons: [
      {
        week: 'Tuần 27 – 28 (Tháng 03)',
        lessonName: 'Fun time & Unit 16: My pets',
        subLessonName:
          'Fun time: Activity 1-3 [Tiết 105]; Unit 16: Lesson 1 (1,2,3; 4,5,6), Lesson 2 (1,2,3; 4,5,6), Lesson 3 (1,2,3; 4,5,6) [Tiết 106–111]',
        periodAllocation: 'Tiết 105 – Tiết 111',
        periodsCount: 7,
        adjustedContent:
          'Fun time: Activity 1-3 (Tiết 105). Tiết 106 (Unit 16 Lesson 1: 1,2,3): Tích hợp Quyền con người: Giáo dục tình yêu thương động vật, biết chăm sóc và bảo vệ vật nuôi. Hỏi và trả lời về thú cưng và số lượng thú cưng (Do you have any...? / How many ... do you have?).',
      },
      {
        week: 'Tuần 28 – 30 (Tháng 03 – 04)',
        lessonName: 'Unit 17: Our toys',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 112]; Lesson 1 (4,5,6) [Tiết 113]; Lesson 2 (1,2,3) [Tiết 114]; Lesson 2 (4,5,6) [Tiết 115]; Lesson 3 (1,2,3) [Tiết 116]; Lesson 3 (4,5,6) [Tiết 117]',
        periodAllocation: 'Tiết 112 – Tiết 117',
        periodsCount: 6,
        adjustedContent:
          'Tiết 112 (Lesson 1: 1,2,3): Giáo dục đạo đức lối sống: Giáo dục biết giữ gìn đồ chơi, chia sẻ với bạn bè, không đòi hỏi lãng phí. Nói và hỏi đáp về đồ chơi (He / She has...; They have...; How many kites / planes / trains / trucks... do you have?).',
      },
      {
        week: 'Tuần 30 – 31 (Tháng 04)',
        lessonName: 'Unit 18: What are you doing?',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 118]; Lesson 1 (4,5,6) [Tiết 119]; Lesson 2 (1,2,3) [Tiết 120]; Lesson 2 (4,5,6) [Tiết 121]; Lesson 3 (1,2,3) [Tiết 122]; Lesson 3 (4,5,6) [Tiết 123]',
        periodAllocation: 'Tiết 118 – Tiết 123',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các hoạt động đang diễn ra tại thời điểm nói (What are you doing? – I’m reading / cooking / listening to music / cleaning the floor...; What’s he / she doing? – He’s / She’s...).',
      },
      {
        week: 'Tuần 31 – 33 (Tháng 04 – 05)',
        lessonName: 'Unit 19: Our outdoor activities',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 124]; Lesson 1 (4,5,6) [Tiết 125]; Lesson 2 (1,2,3) [Tiết 126]; Lesson 2 (4,5,6) [Tiết 127]; Lesson 3 (1,2,3) [Tiết 128]; Lesson 3 (4,5,6) [Tiết 129]',
        periodAllocation: 'Tiết 124 – Tiết 129',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các hoạt động vui chơi ngoài trời tại công viên (What’s he / she doing? – He’s / She’s skating / cycling / flying a kite / skipping; What are they doing? – They’re painting / playing badminton...).',
      },
      {
        week: 'Tuần 33 – 35 (Tháng 05)',
        lessonName: 'Unit 20: At the zoo, Review 4, Funtime & Kiểm tra Học kì 2',
        subLessonName:
          'Unit 20: Lesson 1–3 [Tiết 130–135]; Review 4: Activity 1-2 [Tiết 136], Activity 3-5 [Tiết 137]; Funtime: Activity 1-3 [Tiết 138]; Kiểm tra Học kì 2 (Final Test 2) [Tiết 139]; Chữa bài [Tiết 140]',
        periodAllocation: 'Tiết 130 – Tiết 140',
        periodsCount: 11,
        adjustedContent:
          'Tiết 130 (Unit 20 Lesson 1: 1,2,3): Tích hợp AI: 3.C5.3; Tích hợp Bảo vệ môi trường: HS biết yêu quý động vật, không trêu chọc hoặc làm hại con vật; có ý thức bảo vệ môi trường sống của chúng. Ôn tập Review 4 (Tiết 136–137), Funtime (Tiết 138), Kiểm tra Học kì 2 (Final Test 2 – Tiết 139) và Chữa bài (Tiết 140).',
      },
    ],
  }),
];

// ============================================================================
// 1.1.6. KẾ HOẠCH DẠY HỌC TIẾNG ANH 4 (GLOBAL SUCCESS – 35 TUẦN x 4 TIẾT = 140 TIẾT)
// - HKI: Tuần 1 – Tuần 18 (Tiết 1 – Tiết 72 = 72 tiết): Chủ đề 1 (36 tiết) + Chủ đề 2 (36 tiết)
// - HKII: Tuần 19 – Tuần 35 (Tiết 73 – Tiết 140 = 68 tiết): Chủ đề 3 (32 tiết) + Chủ đề 4 (36 tiết)
// ============================================================================

export const GRADE4_TIENG_ANH_TOPICS: CurriculumTopic[] = [
  buildPrimaryEnglishTopic({
    id: 'nda-2026-g4-ta-cd1',
    grade: 4,
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 9 (Tháng 9 – 11)',
    totalPeriods: 36,
    chapterCode: 'TA4-CĐ1',
    chapterTitle: 'Chủ đề 1: Me and my friends (Tiết 1 – Tiết 36)',
    topicTitle:
      'Chủ đề 1: Me and my friends (Làm quen & Starter, Unit 1: My friends, Unit 2: Time and daily routines, Unit 3: My week, Unit 4: My birthday party, Unit 5: Things we can do & Review 1 – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (2.5.CB2.c ở Unit 1 Tiết 5; 4.2.CB2.b ở Unit 4 Tiết 23 & Tiết 28), GDQP-AN (trân trọng biểu tượng đất nước, niềm tự hào dân tộc ở Unit 1 Tiết 5), Giáo dục lý tưởng cách mạng, đạo đức, lối sống (thói quen sinh hoạt khoa học, đúng giờ ở Unit 2 Tiết 13), AI (4.A1.2 ở Unit 5 Tiết 29) và Quyền con người (mỗi người có khả năng khác nhau và đều cần được tôn trọng ở Unit 5 Tiết 31).',
    rawLessons: [
      {
        week: 'Tuần 1 (Tháng 9)',
        lessonName: 'Làm quen Chương trình & SGK Tiếng Anh 4 + Starter',
        subLessonName:
          'Hướng dẫn sử dụng sách và tài liệu bổ trợ mạng [Tiết 1]; Starter: A. Hello again! [Tiết 2], B. Classroom activities [Tiết 3], C. Outdoor activities [Tiết 4]',
        periodAllocation: 'Tiết 1 – Tiết 4',
        periodsCount: 4,
        adjustedContent:
          'Làm quen với Chương trình và SGK Tiếng Anh 4, hướng dẫn sử dụng sách và tài liệu bổ trợ mạng (Tiết 1); Starter: A. Hello again! (Tiết 2), B. Classroom activities (Tiết 3), C. Outdoor activities (Tiết 4).',
      },
      {
        week: 'Tuần 2 – 3 (Tháng 9)',
        lessonName: 'Unit 1: My friends',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 5]; Lesson 1 (4,5,6) [Tiết 6]; Lesson 2 (1,2,3) [Tiết 7]; Lesson 2 (4,5,6) [Tiết 8]; Lesson 3 (1,2,3) [Tiết 9]; Lesson 3 (4,5,6) [Tiết 10]',
        periodAllocation: 'Tiết 5 – Tiết 10',
        periodsCount: 6,
        adjustedContent:
          'Tiết 5 (Lesson 1: 1,2,3): Tích hợp NLS: 2.5.CB2.c; Tích hợp GDQP-AN: Giáo dục HS trân trọng biểu tượng của đất nước, bước đầu hình thành niềm tự hào dân tộc. Hỏi và trả lời về quốc gia nơi mình và bạn bè đến (Where are you from? / Where’s he/she from?).',
      },
      {
        week: 'Tuần 3 – 4 (Tháng 9)',
        lessonName: 'Unit 2: Time and daily routines',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 11]; Lesson 1 (4,5,6) [Tiết 12]; Lesson 2 (1,2,3) [Tiết 13]; Lesson 2 (4,5,6) [Tiết 14]; Lesson 3 (1,2,3) [Tiết 15]; Lesson 3 (4,5,6) [Tiết 16]',
        periodAllocation: 'Tiết 11 – Tiết 16',
        periodsCount: 6,
        adjustedContent:
          'Tiết 13 (Lesson 2: 1,2,3): Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Giáo dục ý thức tự giác, chăm chỉ, xây dựng thói quen sinh hoạt khoa học, đúng giờ. Hỏi đáp về thời gian và hoạt động hằng ngày (What time is it? / What time do you get up / go to school?).',
      },
      {
        week: 'Tuần 5 – 6 (Tháng 10)',
        lessonName: 'Unit 3: My week',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 17]; Lesson 1 (4,5,6) [Tiết 18]; Lesson 2 (1,2,3) [Tiết 19]; Lesson 2 (4,5,6) [Tiết 20]; Lesson 3 (1,2,3) [Tiết 21]; Lesson 3 (4,5,6) [Tiết 22]',
        periodAllocation: 'Tiết 17 – Tiết 22',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các thứ trong tuần và hoạt động vào các ngày trong tuần (What day is it today? – It’s Monday...; What do you do on Fridays? – I study at school / listen to music / do housework).',
      },
      {
        week: 'Tuần 6 – 7 (Tháng 10)',
        lessonName: 'Unit 4: My birthday party',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 23]; Lesson 1 (4,5,6) [Tiết 24]; Lesson 2 (1,2,3) [Tiết 25]; Lesson 2 (4,5,6) [Tiết 26]; Lesson 3 (1,2,3) [Tiết 27]; Lesson 3 (4,5,6) [Tiết 28]',
        periodAllocation: 'Tiết 23 – Tiết 28',
        periodsCount: 6,
        adjustedContent:
          'Tiết 23 (Lesson 1: 1,2,3) & Tiết 28 (Lesson 3: 4,5,6): Tích hợp NLS: 4.2.CB2.b. Hỏi và trả lời về tháng sinh nhật và món ăn, thức uống muốn dùng tại bữa tiệc sinh nhật (When’s your birthday? – It’s in...; What do you want to eat / drink?).',
      },
      {
        week: 'Tuần 8 – 9 (Tháng 10 – 11)',
        lessonName: 'Unit 5: Things we can do & Review 1',
        subLessonName:
          'Unit 5: Lesson 1–3 [Tiết 29–34]; Review 1: Activity 1-2 [Tiết 35], Activity 3-5 [Tiết 36]',
        periodAllocation: 'Tiết 29 – Tiết 36',
        periodsCount: 8,
        adjustedContent:
          'Tiết 29 (Unit 5 Lesson 1: 1,2,3): Tích hợp AI: 4.A1.2. Tiết 31 (Unit 5 Lesson 2: 1,2,3): Tích hợp Quyền con người: Mỗi người có khả năng khác nhau và đều cần được tôn trọng. Hỏi đáp về khả năng (Can you / he / she...?) và Ôn tập Chủ đề 1 tại Review 1 (Tiết 35–36).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g4-ta-cd2',
    grade: 4,
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 18 (Tháng 11 – 01)',
    totalPeriods: 36,
    chapterCode: 'TA4-CĐ2',
    chapterTitle: 'Chủ đề 2: Me and my school (Tiết 37 – Tiết 72)',
    topicTitle:
      'Chủ đề 2: Me and my school (Extension, Unit 6: Our school facilities, Unit 7: Our timetables, Unit 8: My favourite subjects, Unit 9: Our sports day, Unit 10: Our summer holiday, Review 2 & Kiểm tra HKI – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp Quyền con người (tôn trọng sở thích, năng lực và sự khác biệt trong học tập của mỗi học sinh ở Unit 8 Tiết 50) và Kiểm tra đánh giá định kì Học kì I (Tiết 71–72).',
    rawLessons: [
      {
        week: 'Tuần 10 – 11 (Tháng 11)',
        lessonName: 'Extension & Unit 6: Our school facilities',
        subLessonName:
          'Extension: Activity 1-3 [Tiết 37]; Unit 6: Lesson 1 (1,2,3; 4,5,6), Lesson 2 (1,2,3; 4,5,6), Lesson 3 (1,2,3; 4,5,6) [Tiết 38–43]',
        periodAllocation: 'Tiết 37 – Tiết 43',
        periodsCount: 7,
        adjustedContent:
          'Extension: Activity 1-3 (Tiết 37). Unit 6 (Our school facilities – Tiết 38–43): Hỏi và trả lời về vị trí của trường và số lượng cơ sở vật chất trong trường (Where’s your school? – It’s in the mountains / village / city / town; How many playgrounds / computer rooms / gardens / buildings are there at your school?).',
      },
      {
        week: 'Tuần 11 – 13 (Tháng 11)',
        lessonName: 'Unit 7: Our timetables',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 44]; Lesson 1 (4,5,6) [Tiết 45]; Lesson 2 (1,2,3) [Tiết 46]; Lesson 2 (4,5,6) [Tiết 47]; Lesson 3 (1,2,3) [Tiết 48]; Lesson 3 (4,5,6) [Tiết 49]',
        periodAllocation: 'Tiết 44 – Tiết 49',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các môn học trong thời khóa biểu và ngày học từng môn (What subjects do you have today? – I have...; When do you have...? – I have it on...).',
      },
      {
        week: 'Tuần 13 – 14 (Tháng 11 – 12)',
        lessonName: 'Unit 8: My favourite subjects',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 50]; Lesson 1 (4,5,6) [Tiết 51]; Lesson 2 (1,2,3) [Tiết 52]; Lesson 2 (4,5,6) [Tiết 53]; Lesson 3 (1,2,3) [Tiết 54]; Lesson 3 (4,5,6) [Tiết 55]',
        periodAllocation: 'Tiết 50 – Tiết 55',
        periodsCount: 6,
        adjustedContent:
          'Tiết 50 (Lesson 1: 1,2,3): Tích hợp Quyền con người: Tôn trọng sở thích, năng lực và sự khác biệt trong học tập của mỗi học sinh. Hỏi đáp về môn học yêu thích và lí do (What’s your favourite subject? / Why do you like...?).',
      },
      {
        week: 'Tuần 14 – 16 (Tháng 12)',
        lessonName: 'Unit 9: Our sports day',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 56]; Lesson 1 (4,5,6) [Tiết 57]; Lesson 2 (1,2,3) [Tiết 58]; Lesson 2 (4,5,6) [Tiết 59]; Lesson 3 (1,2,3) [Tiết 60]; Lesson 3 (4,5,6) [Tiết 61]',
        periodAllocation: 'Tiết 56 – Tiết 61',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về tháng tổ chức Ngày hội thể thao của trường (Is your sports day in...? – Yes, it is / No, it isn’t; When’s your sports day? – It’s in...).',
      },
      {
        week: 'Tuần 16 – 18 (Tháng 12 – 01)',
        lessonName: 'Unit 10: Our summer holiday, Review 2, Extension & Kiểm tra học kì 1',
        subLessonName:
          'Unit 10: Lesson 1–3 [Tiết 62–67]; Review 2: Activity 1-2 [Tiết 68], Activity 3-5 [Tiết 69]; Extension: Activity 1-3 [Tiết 70]; Kiểm tra học kì 1 (The first term test) [Tiết 71]; Chữa bài [Tiết 72]',
        periodAllocation: 'Tiết 62 – Tiết 72',
        periodsCount: 11,
        adjustedContent:
          'Unit 10 (Tiết 62–67): Hỏi và trả lời về nơi đã ở trong kì nghỉ hè đã qua (Were you in / on / at ... last weekend? / Where were you last summer?). Ôn tập Review 2 (Tiết 68–69), Extension (Tiết 70), Kiểm tra học kì 1 (The first term test – Tiết 71) và Chữa bài (Tiết 72).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g4-ta-cd3',
    grade: 4,
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 26 (Tháng 01 – 03)',
    totalPeriods: 32,
    chapterCode: 'TA4-CĐ3',
    chapterTitle: 'Chủ đề 3: Me and my Family (Tiết 73 – Tiết 104)',
    topicTitle:
      'Chủ đề 3: Me and my Family (Unit 11: My home, Unit 12: Jobs, Unit 13: Appearance, Unit 14: Daily activities, Unit 15: My family’s weekends & Review 3 – 32 tiết)',
    adjustedContentSummary:
      'Tích hợp QPAN (giới thiệu nghề nghiệp trong xã hội; tôn trọng, biết ơn những người lao động và lực lượng bảo vệ cộng đồng ở Unit 12 Tiết 79), AI (4.A2.2 ở Unit 12 Tiết 81) và Giáo dục đạo đức, lối sống (tôn trọng sự khác biệt về ngoại hình; không trêu chọc, bắt nạt ở Unit 13 Tiết 85).',
    rawLessons: [
      {
        week: 'Tuần 19 – 20 (Tháng 01)',
        lessonName: 'Unit 11: My home',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 73]; Lesson 1 (4,5,6) [Tiết 74]; Lesson 2 (1,2,3) [Tiết 75]; Lesson 2 (4,5,6) [Tiết 76]; Lesson 3 (1,2,3) [Tiết 77]; Lesson 3 (4,5,6) [Tiết 78]',
        periodAllocation: 'Tiết 73 – Tiết 78',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về địa chỉ nơi ở và đặc điểm đường phố/làng xóm nơi mình sống (Where do you live? – I live in ... Street / at ...; What’s the street / road / village like? – It’s a busy / quiet / noisy / big...).',
      },
      {
        week: 'Tuần 20 – 21 (Tháng 01)',
        lessonName: 'Unit 12: Jobs',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 79]; Lesson 1 (4,5,6) [Tiết 80]; Lesson 2 (1,2,3) [Tiết 81]; Lesson 2 (4,5,6) [Tiết 82]; Lesson 3 (1,2,3) [Tiết 83]; Lesson 3 (4,5,6) [Tiết 84]',
        periodAllocation: 'Tiết 79 – Tiết 84',
        periodsCount: 6,
        adjustedContent:
          'Tiết 79 (Lesson 1: 1,2,3): Tích hợp QPAN: Giới thiệu nghề nghiệp trong xã hội; giáo dục sự tôn trọng, biết ơn những người lao động, người làm nhiệm vụ bảo vệ cộng đồng. Tiết 81 (Lesson 2: 1,2,3): Tích hợp AI: 4.A2.2. Hỏi đáp về nghề nghiệp và nơi làm việc (What does he/she do? / Where does he/she work?).',
      },
      {
        week: 'Tuần 22 – 23 (Tháng 01 – 02)',
        lessonName: 'Unit 13: Appearance',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 85]; Lesson 1 (4,5,6) [Tiết 86]; Lesson 2 (1,2,3) [Tiết 87]; Lesson 2 (4,5,6) [Tiết 88]; Lesson 3 (1,2,3) [Tiết 89]; Lesson 3 (4,5,6) [Tiết 90]',
        periodAllocation: 'Tiết 85 – Tiết 90',
        periodsCount: 6,
        adjustedContent:
          'Tiết 85 (Lesson 1: 1,2,3): Tích hợp Giáo dục đạo đức, lối sống: Tôn trọng sự khác biệt về ngoại hình; không trêu chọc, bắt nạt. Hỏi và trả lời về ngoại hình của người thân, bạn bè (What does he / she look like? – He’s / She’s...; He / She has...).',
      },
      {
        week: 'Tuần 23 – 24 (Tháng 02)',
        lessonName: 'Unit 14: Daily activities',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 91]; Lesson 1 (4,5,6) [Tiết 92]; Lesson 2 (1,2,3) [Tiết 93]; Lesson 2 (4,5,6) [Tiết 94]; Lesson 3 (1,2,3) [Tiết 95]; Lesson 3 (4,5,6) [Tiết 96]',
        periodAllocation: 'Tiết 91 – Tiết 96',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các hoạt động thường làm vào các buổi trong ngày và việc nhà (When do you watch TV? / What do you do in the morning? – I wash the clothes / clean the floor / help with the cooking / wash the dishes).',
      },
      {
        week: 'Tuần 25 – 26 (Tháng 03)',
        lessonName: 'Unit 15: My family’s weekends & Review 3',
        subLessonName:
          'Unit 15: Lesson 1–3 [Tiết 97–102]; Review 3: Activity 1-2 [Tiết 103], Activity 3-5 [Tiết 104]',
        periodAllocation: 'Tiết 97 – Tiết 104',
        periodsCount: 8,
        adjustedContent:
          'Hỏi và trả lời về nơi các thành viên gia đình đi và hoạt động họ làm vào dịp cuối tuần (Where does he/she go on Saturdays? / What does he/she do on Sundays?) và Ôn tập Chủ đề 3 tại Review 3 (Activity 1-2, Activity 3-5 – Tiết 103–104).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g4-ta-cd4',
    grade: 4,
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 35 (Tháng 03 – 05)',
    totalPeriods: 36,
    chapterCode: 'TA4-CĐ4',
    chapterTitle: 'Chủ đề 4: Me and the world around (Tiết 105 – Tiết 140)',
    topicTitle:
      'Chủ đề 4: Me and the world around (Extension activities, Unit 16: Weather, Unit 17: In the city, Unit 18: At the shopping centre, Unit 19: The animal world, Unit 20: At summer camp, Review 4 & Kiểm tra HKII – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp Công dân số & AI (kỹ năng mua sắm an toàn, mua sắm trực tuyến an toàn & AI 4.B2.2 ở Unit 18 Tiết 120), Giáo dục đạo đức, lối sống & BVMT (yêu quý và bảo vệ động vật, không phá hủy môi trường sống, bảo vệ sông hồ ở Unit 19 Tiết 124), NLS & QPAN (NLS 2.2.CB2.a, 2.6.CB2.b và kỹ năng sinh tồn, đoàn kết tập thể ngoài trời ở Unit 20 Tiết 130) và Kiểm tra cuối năm (Tiết 139–140).',
    rawLessons: [
      {
        week: 'Tuần 27 – 28 (Tháng 03)',
        lessonName: 'Extension activities & Unit 16: Weather',
        subLessonName:
          'Extension activities: Activity 1-3 [Tiết 105]; Unit 16: Lesson 1 (1,2,3; 4,5,6), Lesson 2 (1,2,3; 4,5,6), Lesson 3 (1,2,3; 4,5,6) [Tiết 106–111]',
        periodAllocation: 'Tiết 105 – Tiết 111',
        periodsCount: 7,
        adjustedContent:
          'Extension activities: Activity 1-3 (Tiết 105). Unit 16 (Weather – Tiết 106–111): Hỏi và trả lời về thời tiết và đề xuất đi đâu (What was the weather like yesterday? – It was sunny / rainy / windy / cloudy; Do you want to go to the bakery / bookshop / supermarket / water park?).',
      },
      {
        week: 'Tuần 28 – 30 (Tháng 03 – 04)',
        lessonName: 'Unit 17: In the city',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 112]; Lesson 1 (4,5,6) [Tiết 113]; Lesson 2 (1,2,3) [Tiết 114]; Lesson 2 (4,5,6) [Tiết 115]; Lesson 3 (1,2,3) [Tiết 116]; Lesson 3 (4,5,6) [Tiết 117]',
        periodAllocation: 'Tiết 112 – Tiết 117',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về ý nghĩa biển báo giao thông và cách chỉ đường đến các địa điểm trong thành phố (What does it say? – It says ‘go straight’ / ‘turn left’ / ‘turn right’ / ‘stop’; How can I get to the...?).',
      },
      {
        week: 'Tuần 30 – 31 (Tháng 04)',
        lessonName: 'Unit 18: At the shopping centre',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 118]; Lesson 1 (4,5,6) [Tiết 119]; Lesson 2 (1,2,3) [Tiết 120]; Lesson 2 (4,5,6) [Tiết 121]; Lesson 3 (1,2,3) [Tiết 122]; Lesson 3 (4,5,6) [Tiết 123]',
        periodAllocation: 'Tiết 118 – Tiết 123',
        periodsCount: 6,
        adjustedContent:
          'Tiết 120 (Lesson 2: 1,2,3): Tích hợp Công dân số: Giáo dục kỹ năng mua sắm an toàn, biết lựa chọn sản phẩm phù hợp; liên hệ mua sắm trực tuyến an toàn; Tích hợp AI: 4.B2.2. Hỏi đáp vị trí cửa hàng và giá tiền (Where’s the...? / How much is the...?).',
      },
      {
        week: 'Tuần 31 – 33 (Tháng 04 – 05)',
        lessonName: 'Unit 19: The animal world',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 124]; Lesson 1 (4,5,6) [Tiết 125]; Lesson 2 (1,2,3) [Tiết 126]; Lesson 2 (4,5,6) [Tiết 127]; Lesson 3 (1,2,3) [Tiết 128]; Lesson 3 (4,5,6) [Tiết 129]',
        periodAllocation: 'Tiết 124 – Tiết 129',
        periodsCount: 6,
        adjustedContent:
          'Tiết 124 (Lesson 1: 1,2,3): Tích hợp Giáo dục đạo đức, lối sống & BVMT: Giáo dục yêu quý và bảo vệ động vật, không phá hủy môi trường sống; bảo vệ sông, hồ. Hỏi đáp về động vật hoang dã và lí do yêu thích (What are these animals? / Why do you like...?).',
      },
      {
        week: 'Tuần 33 – 35 (Tháng 05)',
        lessonName: 'Unit 20: At summer camp, Review 4, Extension activities & Kiểm tra học kì 2',
        subLessonName:
          'Unit 20: Lesson 1–3 [Tiết 130–135]; Review 4: Activity 1-2 [Tiết 136], Activity 3-5 [Tiết 137]; Extension activities: Activity 1-3 [Tiết 138]; Kiểm tra học kì 2 (The final term test) [Tiết 139]; Chữa bài (Feedback) [Tiết 140]',
        periodAllocation: 'Tiết 130 – Tiết 140',
        periodsCount: 11,
        adjustedContent:
          'Tiết 130 (Unit 20 Lesson 1: 1,2,3): Tích hợp NLS: 2.2.CB2.a, 2.6.CB2.b; Tích hợp QPAN: Giáo dục kỹ năng sinh tồn, tinh thần đoàn kết, hợp tác trong hoạt động tập thể ngoài trời. Ôn tập Review 4 (Tiết 136–137), Extension activities (Tiết 138), Kiểm tra học kì 2 (The final term test – Tiết 139) và Chữa bài (Feedback – Tiết 140).',
      },
    ],
  }),
];

// ============================================================================
// 1.1.7. KẾ HOẠCH DẠY HỌC TIẾNG ANH 5 (GLOBAL SUCCESS – 35 TUẦN x 4 TIẾT = 140 TIẾT)
// - HKI: Tuần 1 – Tuần 18 (Tiết 1 – Tiết 72 = 72 tiết): Chủ đề 1 (36 tiết) + Chủ đề 2 (36 tiết)
// - HKII: Tuần 19 – Tuần 35 (Tiết 73 – Tiết 140 = 68 tiết): Chủ đề 3 (32 tiết) + Chủ đề 4 (36 tiết)
// ============================================================================

export const GRADE5_TIENG_ANH_TOPICS: CurriculumTopic[] = [
  buildPrimaryEnglishTopic({
    id: 'nda-2026-g5-ta-cd1',
    grade: 5,
    semester: 'HK1',
    weekRange: 'Tuần 1 – Tuần 9 (Tháng 9 – 11)',
    totalPeriods: 36,
    chapterCode: 'TA5-CĐ1',
    chapterTitle: 'Chủ đề 1: Me and my friends (Tiết 1 – Tiết 36)',
    topicTitle:
      'Chủ đề 1: Me and my friends (Làm quen & STARTER, UNIT 1: All about me!, UNIT 2: Our homes, UNIT 3: My foreign friends, UNIT 4: Our free-time activities, UNIT 5: My future job & REVIEW 1 – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp NLS (4.2.CB2.b ở Unit 1 Tiết 10; 4.2.CB2.a ở Unit 2 Tiết 13), AI (5.A3.2 ở Unit 1 Tiết 10; 5.A2.1, 5.A2.MR1 ở Unit 3 Tiết 19), Quyền con người (bình đẳng, tôn trọng người khác không phân biệt quốc tịch, màu da, văn hóa ở Unit 3 Tiết 17) và Giáo dục lý tưởng cách mạng, đạo đức, lối sống (ước mơ nghề nghiệp, tinh thần lao động, đóng góp cho cộng đồng ở Unit 5 Tiết 29).',
    rawLessons: [
      {
        week: 'Tuần 1 (Tháng 9)',
        lessonName: 'Làm quen Chương trình & SGK Tiếng Anh 5 + STARTER',
        subLessonName:
          'Hướng dẫn sử dụng sách và học liệu mạng [Tiết 1]; STARTER: A. Back to school [Tiết 2], B. Classroom instructions [Tiết 3], C. Activities we can do [Tiết 4]',
        periodAllocation: 'Tiết 1 – Tiết 4',
        periodsCount: 4,
        adjustedContent:
          'Làm quen với Chương trình và SGK Tiếng Anh 5 và các tài liệu bổ trợ liên quan trên mạng (Tiết 1); STARTER: A. Back to school (Tiết 2), B. Classroom instructions (Tiết 3), C. Activities we can do (Tiết 4).',
      },
      {
        week: 'Tuần 2 – 3 (Tháng 9)',
        lessonName: 'UNIT 1: All about me!',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 5]; Lesson 1 (4,5,6) [Tiết 6]; Lesson 2 (1,2,3) [Tiết 7]; Lesson 2 (4,5,6) [Tiết 8]; Lesson 3 (1,2,3) [Tiết 9]; Lesson 3 (4,5,6) [Tiết 10]',
        periodAllocation: 'Tiết 5 – Tiết 10',
        periodsCount: 6,
        adjustedContent:
          'Tiết 10 (Lesson 3: 4,5,6): Tích hợp NLS: 4.2.CB2.b; Tích hợp AI: 5.A3.2. Hỏi và trả lời về thông tin cá nhân, lớp học, nơi sống và sở thích (Can you tell me about yourself? / What’s your favourite colour / animal / food / sport?).',
      },
      {
        week: 'Tuần 3 – 4 (Tháng 9)',
        lessonName: 'UNIT 2: Our homes',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 11]; Lesson 1 (4,5,6) [Tiết 12]; Lesson 2 (1,2,3) [Tiết 13]; Lesson 2 (4,5,6) [Tiết 14]; Lesson 3 (1,2,3) [Tiết 15]; Lesson 3 (4,5,6) [Tiết 16]',
        periodAllocation: 'Tiết 11 – Tiết 16',
        periodsCount: 6,
        adjustedContent:
          'Tiết 13 (Lesson 2: 1,2,3): Tích hợp NLS: 4.2.CB2.a. Hỏi và trả lời về loại hình nhà ở và địa chỉ cụ thể (Do you live in this / that house / flat / building / tower? / What’s your address? – It’s...).',
      },
      {
        week: 'Tuần 5 – 6 (Tháng 10)',
        lessonName: 'UNIT 3: My foreign friends',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 17]; Lesson 1 (4,5,6) [Tiết 18]; Lesson 2 (1,2,3) [Tiết 19]; Lesson 2 (4,5,6) [Tiết 20]; Lesson 3 (1,2,3) [Tiết 21]; Lesson 3 (4,5,6) [Tiết 22]',
        periodAllocation: 'Tiết 17 – Tiết 22',
        periodsCount: 6,
        adjustedContent:
          'Tiết 17 (Lesson 1: 1,2,3): Tích hợp Quyền con người: Giáo dục bình đẳng, tôn trọng người khác không phân biệt quốc tịch, màu da, văn hóa. Tiết 19 (Lesson 2: 1,2,3): Tích hợp AI: 5.A2.1, 5.A2.MR1. Hỏi đáp về quốc tịch và tính cách bạn bè quốc tế (What nationality is he/she? / What’s he/she like?).',
      },
      {
        week: 'Tuần 6 – 7 (Tháng 10)',
        lessonName: 'UNIT 4: Our free-time activities',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 23]; Lesson 1 (4,5,6) [Tiết 24]; Lesson 2 (1,2,3) [Tiết 25]; Lesson 2 (4,5,6) [Tiết 26]; Lesson 3 (1,2,3) [Tiết 27]; Lesson 3 (4,5,6) [Tiết 28]',
        periodAllocation: 'Tiết 23 – Tiết 28',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các hoạt động yêu thích lúc rảnh rỗi và mức độ thường xuyên thực hiện vào dịp cuối tuần (What do you like doing in your free time? / What do you do at the weekend? – I always / usually / often / sometimes...).',
      },
      {
        week: 'Tuần 8 – 9 (Tháng 10 – 11)',
        lessonName: 'UNIT 5: My future job & REVIEW 1',
        subLessonName:
          'UNIT 5: Lesson 1–3 [Tiết 29–34]; REVIEW 1: Activity 1-2 [Tiết 35], Activity 3-5 [Tiết 36]',
        periodAllocation: 'Tiết 29 – Tiết 36',
        periodsCount: 8,
        adjustedContent:
          'Tiết 29 (Unit 5 Lesson 1: 1,2,3): Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Giáo dục ước mơ nghề nghiệp, tinh thần lao động, trách nhiệm và mong muốn đóng góp cho cộng đồng. Hỏi đáp nghề nghiệp tương lai (What would you like to be in the future? / Why would you like to be a...?) và Ôn tập Chủ đề 1 tại REVIEW 1 (Tiết 35–36).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g5-ta-cd2',
    grade: 5,
    semester: 'HK1',
    weekRange: 'Tuần 10 – Tuần 18 (Tháng 11 – 01)',
    totalPeriods: 36,
    chapterCode: 'TA5-CĐ2',
    chapterTitle: 'Chủ đề 2: Me and my school (Tiết 37 – Tiết 72)',
    topicTitle:
      'Chủ đề 2: Me and my school (EXTENSION, UNIT 6: Our school rooms, UNIT 7: Our favourite school activities, UNIT 8: In our classroom, UNIT 9: Our outdoor activities, UNIT 10: Our school trip, REVIEW 2 & Kiểm tra HKI – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp Quyền con người (tôn trọng sở thích và năng lực khác nhau của bạn, không áp đặt hoặc chê bai hoạt động học tập của người khác ở Unit 7 Tiết 44), Bảo vệ môi trường & nguồn nước (giữ vệ sinh nơi công cộng, không xả rác xuống hồ/sông, bảo vệ cảnh quan khi cắm trại ở Unit 9 Tiết 56) và Kiểm tra đánh giá định kì Học kì I (Tiết 71–72).',
    rawLessons: [
      {
        week: 'Tuần 10 – 11 (Tháng 11)',
        lessonName: 'EXTENSION & UNIT 6: Our school rooms',
        subLessonName:
          'EXTENSION: Activity 1-3 [Tiết 37]; UNIT 6: Lesson 1 (1,2,3; 4,5,6), Lesson 2 (1,2,3; 4,5,6), Lesson 3 (1,2,3; 4,5,6) [Tiết 38–43]',
        periodAllocation: 'Tiết 37 – Tiết 43',
        periodsCount: 7,
        adjustedContent:
          'EXTENSION: Activity 1-3 (Tiết 37). UNIT 6 (Our school rooms – Tiết 38–43): Hỏi và trả lời về vị trí các phòng chức năng theo tầng và chỉ đường trong trường (Where’s the...? – It’s on the ground / first / second / third floor; Could you tell me the way to the..., please?).',
      },
      {
        week: 'Tuần 11 – 13 (Tháng 11)',
        lessonName: 'UNIT 7: Our favourite school activities',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 44]; Lesson 1 (4,5,6) [Tiết 45]; Lesson 2 (1,2,3) [Tiết 46]; Lesson 2 (4,5,6) [Tiết 47]; Lesson 3 (1,2,3) [Tiết 48]; Lesson 3 (4,5,6) [Tiết 49]',
        periodAllocation: 'Tiết 44 – Tiết 49',
        periodsCount: 6,
        adjustedContent:
          'Tiết 44 (Lesson 1: 1,2,3): Tích hợp Quyền con người: Tôn trọng sở thích và năng lực khác nhau của bạn; không áp đặt hoặc chê bai hoạt động học tập của người khác. Hỏi đáp về hoạt động học tập yêu thích và lí do (What school activity does he/she like? / Why does he/she like...?).',
      },
      {
        week: 'Tuần 13 – 14 (Tháng 11 – 12)',
        lessonName: 'UNIT 8: In our classroom',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 50]; Lesson 1 (4,5,6) [Tiết 51]; Lesson 2 (1,2,3) [Tiết 52]; Lesson 2 (4,5,6) [Tiết 53]; Lesson 3 (1,2,3) [Tiết 54]; Lesson 3 (4,5,6) [Tiết 55]',
        periodAllocation: 'Tiết 50 – Tiết 55',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về vị trí các đồ dùng trong lớp học và quyền sở hữu đồ vật (Where are the...? – They’re beside / under / above / in front of...; Whose ... is this? – It’s ...’s).',
      },
      {
        week: 'Tuần 14 – 16 (Tháng 12)',
        lessonName: 'UNIT 9: Our outdoor activities',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 56]; Lesson 1 (4,5,6) [Tiết 57]; Lesson 2 (1,2,3) [Tiết 58]; Lesson 2 (4,5,6) [Tiết 59]; Lesson 3 (1,2,3) [Tiết 60]; Lesson 3 (4,5,6) [Tiết 61]',
        periodAllocation: 'Tiết 56 – Tiết 61',
        periodsCount: 6,
        adjustedContent:
          'Tiết 56 (Lesson 1: 1,2,3): Tích hợp Bảo vệ môi trường, nguồn nước: Giữ vệ sinh nơi công cộng, không xả rác xuống hồ/sông; bảo vệ cảnh quan khi cắm trại. Kể về địa điểm và hoạt động ngoài trời đã qua (Were you at the ... yesterday? / What did you do yesterday?).',
      },
      {
        week: 'Tuần 16 – 18 (Tháng 12 – 01)',
        lessonName: 'UNIT 10: Our school trip, REVIEW 2, EXTENSION & Kiểm tra Học kì 1',
        subLessonName:
          'UNIT 10: Lesson 1–3 [Tiết 62–67]; REVIEW 2: Activity 1-2 [Tiết 68], Activity 3-5 [Tiết 69]; EXTENSION: Activity 1-3 [Tiết 70]; Kiểm tra Học kì 1 [Tiết 71]; Chữa bài [Tiết 72]',
        periodAllocation: 'Tiết 62 – Tiết 72',
        periodsCount: 11,
        adjustedContent:
          'UNIT 10 (Tiết 62–67): Hỏi và trả lời về chuyến tham quan dã ngoại của trường trong quá khứ (Did they go to...? / What did they do there?). Ôn tập REVIEW 2 (Tiết 68–69), EXTENSION (Tiết 70), Kiểm tra Học kì 1 (Tiết 71) và Chữa bài (Tiết 72).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g5-ta-cd3',
    grade: 5,
    semester: 'HK2',
    weekRange: 'Tuần 19 – Tuần 26 (Tháng 01 – 03)',
    totalPeriods: 32,
    chapterCode: 'TA5-CĐ3',
    chapterTitle: 'Chủ đề 3: Me and my family (Tiết 73 – Tiết 104)',
    topicTitle:
      'Chủ đề 3: Me and my family (UNIT 11: Family time, UNIT 12: Our Tet holiday, UNIT 13: Our special days, UNIT 14: Staying healthy, UNIT 15: Our health & REVIEW 3 – 32 tiết)',
    adjustedContentSummary:
      'Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống tại Unit 12 Tiết 81 (giữ gìn truyền thống gia đình, kính trọng ông bà, cha mẹ; đoàn kết và yêu thương trong dịp Tết) và tại Unit 15 Tiết 99 (hình thành trách nhiệm với sức khỏe bản thân; biết khuyên nhủ, hỗ trợ bạn một cách phù hợp).',
    rawLessons: [
      {
        week: 'Tuần 19 – 20 (Tháng 01)',
        lessonName: 'UNIT 11: Family time',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 73]; Lesson 1 (4,5,6) [Tiết 74]; Lesson 2 (1,2,3) [Tiết 75]; Lesson 2 (4,5,6) [Tiết 76]; Lesson 3 (1,2,3) [Tiết 77]; Lesson 3 (4,5,6) [Tiết 78]',
        periodAllocation: 'Tiết 73 – Tiết 78',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các hoạt động của gia đình trong chuyến du lịch đã qua với động từ quá khứ bất quy tắc (Did you swim / take photos / collect seashells / walk on the beach? / What did your family do in...?).',
      },
      {
        week: 'Tuần 20 – 21 (Tháng 01)',
        lessonName: 'UNIT 12: Our Tet holiday',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 79]; Lesson 1 (4,5,6) [Tiết 80]; Lesson 2 (1,2,3) [Tiết 81]; Lesson 2 (4,5,6) [Tiết 82]; Lesson 3 (1,2,3) [Tiết 83]; Lesson 3 (4,5,6) [Tiết 84]',
        periodAllocation: 'Tiết 79 – Tiết 84',
        periodsCount: 6,
        adjustedContent:
          'Tiết 81 (Lesson 2: 1,2,3): Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Giáo dục giữ gìn truyền thống gia đình, kính trọng ông bà, cha mẹ; đoàn kết và yêu thương trong dịp Tết. Hỏi đáp về chuẩn bị và hoạt động dịp Tết (Will you ... for Tet? / Where will you go at Tet?).',
      },
      {
        week: 'Tuần 22 – 23 (Tháng 01 – 02)',
        lessonName: 'UNIT 13: Our special days',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 85]; Lesson 1 (4,5,6) [Tiết 86]; Lesson 2 (1,2,3) [Tiết 87]; Lesson 2 (4,5,6) [Tiết 88]; Lesson 3 (1,2,3) [Tiết 89]; Lesson 3 (4,5,6) [Tiết 90]',
        periodAllocation: 'Tiết 85 – Tiết 90',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về các hoạt động và đồ ăn/thức uống sẽ có trong các ngày lễ đặc biệt như Children’s Day, Teachers’ Day, Sports Day, Mid-Autumn Festival (What will you do on...? / What food/drinks will you have at the party?).',
      },
      {
        week: 'Tuần 23 – 24 (Tháng 02)',
        lessonName: 'UNIT 14: Staying healthy',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 91]; Lesson 1 (4,5,6) [Tiết 92]; Lesson 2 (1,2,3) [Tiết 93]; Lesson 2 (4,5,6) [Tiết 94]; Lesson 3 (1,2,3) [Tiết 95]; Lesson 3 (4,5,6) [Tiết 96]',
        periodAllocation: 'Tiết 91 – Tiết 96',
        periodsCount: 6,
        adjustedContent:
          'Hỏi và trả lời về lối sống lành mạnh và tần suất tập luyện thể dục thể thao (How does he/she stay healthy? / How often does he/she...? – Every day / Once a week / Twice a week / Three times a week).',
      },
      {
        week: 'Tuần 25 – 26 (Tháng 03)',
        lessonName: 'UNIT 15: Our health & REVIEW 3',
        subLessonName:
          'UNIT 15: Lesson 1–3 [Tiết 97–102]; REVIEW 3: Activity 1-2 [Tiết 103], Activity 3-5 [Tiết 104]',
        periodAllocation: 'Tiết 97 – Tiết 104',
        periodsCount: 8,
        adjustedContent:
          'Tiết 99 (Unit 15 Lesson 2: 1,2,3): Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Hình thành trách nhiệm với sức khỏe bản thân; biết khuyên nhủ, hỗ trợ bạn một cách phù hợp. Hỏi thăm sức khỏe và đưa lời khuyên (What’s the matter? / You should...) và Ôn tập Chủ đề 3 tại REVIEW 3 (Tiết 103–104).',
      },
    ],
  }),

  buildPrimaryEnglishTopic({
    id: 'nda-2026-g5-ta-cd4',
    grade: 5,
    semester: 'HK2',
    weekRange: 'Tuần 27 – Tuần 35 (Tháng 03 – 05)',
    totalPeriods: 36,
    chapterCode: 'TA5-CĐ4',
    chapterTitle: 'Chủ đề 4: Me and the world around (Tiết 105 – Tiết 140)',
    topicTitle:
      'Chủ đề 4: Me and the world around (EXTENSION, UNIT 16: Seasons and the weather, UNIT 17: Stories for Children, UNIT 18: Means of transport, UNIT 19: Places of interest, UNIT 20: Our summer holidays, REVIEW 4 & Kiểm tra HKII – 36 tiết)',
    adjustedContentSummary:
      'Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống (giáo dục đạo đức qua truyện: kiên trì, chăm chỉ, không kiêu ngạo, biết suy nghĩ và chịu trách nhiệm ở Unit 17 Tiết 112), ATGT + NLS (1.1.CB2.c, 1.1.CB2.d) + AI (5.A3.1) ở Unit 18 Tiết 120, QPAN (lòng yêu quê hương, đất nước; trân trọng cảnh quan, di tích và chủ quyền đất nước ở Unit 19 Tiết 124) và Kiểm tra cuối năm (Tiết 139–140).',
    rawLessons: [
      {
        week: 'Tuần 27 – 28 (Tháng 03)',
        lessonName: 'EXTENSION & UNIT 16: Seasons and the weather',
        subLessonName:
          'EXTENSION: Activity 1-3 [Tiết 105]; UNIT 16: Lesson 1 (1,2,3; 4,5,6), Lesson 2 (1,2,3; 4,5,6), Lesson 3 (1,2,3; 4,5,6) [Tiết 106–111]',
        periodAllocation: 'Tiết 105 – Tiết 111',
        periodsCount: 7,
        adjustedContent:
          'EXTENSION: Activity 1-3 (Tiết 105). UNIT 16 (Seasons and the weather – Tiết 106–111): Hỏi và trả lời về thời tiết các mùa trong năm và trang phục thường mặc theo mùa (How’s the weather in ... in spring / summer / autumn / winter? / What do you usually wear in...?).',
      },
      {
        week: 'Tuần 28 – 30 (Tháng 03 – 04)',
        lessonName: 'UNIT 17: Stories for Children',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 112]; Lesson 1 (4,5,6) [Tiết 113]; Lesson 2 (1,2,3) [Tiết 114]; Lesson 2 (4,5,6) [Tiết 115]; Lesson 3 (1,2,3) [Tiết 116]; Lesson 3 (4,5,6) [Tiết 117]',
        periodAllocation: 'Tiết 112 – Tiết 117',
        periodsCount: 6,
        adjustedContent:
          'Tiết 112 (Lesson 1: 1,2,3): Tích hợp Giáo dục lý tưởng cách mạng, đạo đức, lối sống: Giáo dục đạo đức qua truyện: kiên trì, chăm chỉ, không kiêu ngạo, biết suy nghĩ và chịu trách nhiệm. Hỏi đáp về nhân vật chính và cách hành động trong truyện (Who are the main characters in the story? / How did he/she...?).',
      },
      {
        week: 'Tuần 30 – 31 (Tháng 04)',
        lessonName: 'UNIT 18: Means of transport',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 118]; Lesson 1 (4,5,6) [Tiết 119]; Lesson 2 (1,2,3) [Tiết 120]; Lesson 2 (4,5,6) [Tiết 121]; Lesson 3 (1,2,3) [Tiết 122]; Lesson 3 (4,5,6) [Tiết 123]',
        periodAllocation: 'Tiết 118 – Tiết 123',
        periodsCount: 6,
        adjustedContent:
          'Tiết 120 (Lesson 2: 1,2,3): Tích hợp ATGT: phương tiện giao thông, cách đi đến địa điểm, đi bộ, xe đạp, xe buýt… Giáo dục lựa chọn phương tiện phù hợp và tuân thủ quy tắc giao thông; Tích hợp NLS: 1.1.CB2.c, 1.1.CB2.d; Tích hợp AI: 5.A3.1. Hỏi đáp về địa điểm muốn thăm và phương tiện di chuyển (Where do you want to visit? / How can I get to...?).',
      },
      {
        week: 'Tuần 31 – 33 (Tháng 04 – 05)',
        lessonName: 'UNIT 19: Places of interest',
        subLessonName:
          'Lesson 1 (1,2,3) [Tiết 124]; Lesson 1 (4,5,6) [Tiết 125]; Lesson 2 (1,2,3) [Tiết 126]; Lesson 2 (4,5,6) [Tiết 127]; Lesson 3 (1,2,3) [Tiết 128]; Lesson 3 (4,5,6) [Tiết 129]',
        periodAllocation: 'Tiết 124 – Tiết 129',
        periodsCount: 6,
        adjustedContent:
          'Tiết 124 (Lesson 1: 1,2,3): Tích hợp QPAN: Giáo dục lòng yêu quê hương, đất nước; trân trọng cảnh quan, di tích và chủ quyền, vẻ đẹp của đất nước. Hỏi đáp về cảm nhận đối với danh lam thắng cảnh và khoảng cách (What do you think of...? / How far is it from ... to ...?).',
      },
      {
        week: 'Tuần 33 – 35 (Tháng 05)',
        lessonName: 'UNIT 20: Our summer holidays, REVIEW 4, EXTENSION & Kiểm tra Học kì 2',
        subLessonName:
          'UNIT 20: Lesson 1–3 [Tiết 130–135]; REVIEW 4: Activity 1-2 [Tiết 136], Activity 3-5 [Tiết 137]; EXTENSION: Activity 1-3 [Tiết 138]; Kiểm tra Học kì 2 [Tiết 139]; Chữa bài [Tiết 140]',
        periodAllocation: 'Tiết 130 – Tiết 140',
        periodsCount: 11,
        adjustedContent:
          'UNIT 20 (Tiết 130–135): Hỏi và trả lời về kế hoạch, dự định trong kì nghỉ hè sắp tới (Where are you going to visit this summer? / What are you going to do this summer?). Ôn tập REVIEW 4 (Tiết 136–137), EXTENSION (Tiết 138), Kiểm tra Học kì 2 (Tiết 139) và Chữa bài (Tiết 140).',
      },
    ],
  }),
];
