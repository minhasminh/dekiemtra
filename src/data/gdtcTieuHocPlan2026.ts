import {
  CognitiveLevelCode,
  CurriculumTopic,
  EducationLevelId,
  GradeNumber,
} from '../types/domain';
import { extractIntegrationTags } from './grade4TvAndMathPlan2026';

export const SOURCE_DOC_GDTC_TH =
  'Kế hoạch dạy học Tổ Tiếng Anh – Giáo dục thể chất (Khối lớp 1, 2, 3, 4, 5 – Môn Giáo dục thể chất, năm học 2026–2027) – Trường TH&THCS Nguyễn Đình Anh (Đan Điền, ngày 28/8/2026)';

interface RawGdtcLessonInput {
  id: string;
  lessonCode: string;
  lessonTitle: string;
  periods: number;
  weekLabel: string;
  requiredOutcome: string;
  integrationNote: string;
}

function parseGradeNumber(gradeStr: string): GradeNumber {
  const num = parseInt(gradeStr.replace(/\D+/g, ''), 10);
  if (num >= 1 && num <= 12) {
    return num as GradeNumber;
  }
  return 1;
}

function buildPrimaryGdtcTopic(params: {
  id: string;
  grade: string;
  semester: 'HK1' | 'HK2';
  chapterCode: string;
  chapterTitle: string;
  topicTitle: string;
  weekRange: string;
  durationText: string;
  totalPeriods: number;
  adjustedContentSummary: string;
  lessons: RawGdtcLessonInput[];
  outcomes: [string, string, string];
}): CurriculumTopic {
  const mappedLessons = params.lessons.map((ls) => {
    const combinedContent = `${ls.requiredOutcome} ${ls.integrationNote}`.trim();
    return {
      id: ls.id,
      week: ls.weekLabel,
      lessonName: ls.lessonTitle,
      periodAllocation: ls.lessonCode,
      periodsCount: ls.periods,
      adjustedContent: combinedContent,
      integrationTags: extractIntegrationTags(combinedContent),
      note: ls.integrationNote,
    };
  });

  const learningOutcomes = [
    ...mappedLessons.map((ls, idx) => ({
      code: `${params.chapterCode}-YCCĐ${idx + 1}`,
      lessonName: ls.lessonName,
      duration: `${ls.periodAllocation} (${ls.periodsCount} tiết)`,
      week: ls.week,
      description: `${ls.lessonName} (${ls.week} – ${ls.periodAllocation}): ${ls.adjustedContent}`,
      suggestedCognitiveLevel:
        idx % 3 === 0
          ? CognitiveLevelCode.PRIMARY_MUC_1
          : idx % 3 === 1
            ? CognitiveLevelCode.PRIMARY_MUC_2
            : CognitiveLevelCode.PRIMARY_MUC_3,
    })),
    {
      code: `${params.chapterCode}.M1`,
      lessonName: params.chapterTitle,
      duration: params.durationText,
      week: params.weekRange,
      description: params.outcomes[0],
      suggestedCognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_1,
    },
    {
      code: `${params.chapterCode}.M2`,
      lessonName: params.chapterTitle,
      duration: params.durationText,
      week: params.weekRange,
      description: params.outcomes[1],
      suggestedCognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_2,
    },
    {
      code: `${params.chapterCode}.M3`,
      lessonName: params.chapterTitle,
      duration: params.durationText,
      week: params.weekRange,
      description: params.outcomes[2],
      suggestedCognitiveLevel: CognitiveLevelCode.PRIMARY_MUC_3,
    },
  ];

  return {
    id: params.id,
    levelId: EducationLevelId.PRIMARY,
    grade: parseGradeNumber(params.grade),
    subject: 'Giáo dục thể chất',
    semester: params.semester,
    chapterCode: params.chapterCode,
    chapterTitle: params.chapterTitle,
    topicTitle: params.topicTitle,
    weekRange: params.weekRange,
    durationText: params.durationText,
    totalPeriods: params.totalPeriods,
    adjustedContentSummary: params.adjustedContentSummary,
    sourceDocument: SOURCE_DOC_GDTC_TH,
    lessons: mappedLessons,
    learningOutcomes,
    isSampleData: false,
  };
}

// ============================================================================
// KHỐI 1 - GIÁO DỤC THỂ CHẤT 1 (70 TIẾT / 35 TUẦN, 02 TIẾT/TUẦN)
// ============================================================================
export const GRADE1_GDTC_TOPICS: CurriculumTopic[] = [
  buildPrimaryGdtcTopic({
    id: 'g1-gdtc-2026-hk1-cd1',
    grade: 'Lớp 1',
    semester: 'HK1',
    chapterCode: 'GDTC1-CĐ1',
    chapterTitle: 'Chủ đề 1: Đội hình đội ngũ (15 tiết)',
    topicTitle:
      'Tư thế đứng nghiêm, đứng nghỉ; Tập hợp hàng dọc, hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng; Quay các hướng',
    weekRange: 'Tuần 1 – Tuần 8',
    durationText: '15 tiết (Tiết 1 – Tiết 15)',
    totalPeriods: 15,
    adjustedContentSummary:
      'Tích hợp GDQP-AN (rèn tác phong nhanh nhẹn, nghiêm túc, chấp hành khẩu lệnh, giữ đội hình và tinh thần đoàn kết); ATGT (xếp hàng, giữ khoảng cách, quan sát hướng di chuyển, chấp hành hiệu lệnh khi tham gia giao thông); KNS (lắng nghe hiệu lệnh, chờ đến lượt, phối hợp nhóm, nhắc bạn lịch sự); BVMT (giữ vệ sinh sân tập, thu dọn dụng cụ gọn gàng); NLS (5.2TC1a).',
    lessons: [
      {
        id: 'g1-gdtc-cd1-b1',
        lessonCode: 'Tiết 1–3 (Tuần 1–2)',
        lessonTitle:
          'Bài 1: Các tư thế đứng nghiêm, đứng nghỉ (Tiết 1: Phổ biến nội quy tập luyện, biên chế tổ, chọn cán sự, học tư thế đứng nghiêm, đứng nghỉ; Tiết 2–3: Ôn tư thế đứng nghiêm, đứng nghỉ; Trò chơi vận động)',
        periods: 3,
        weekLabel: 'Tuần 1 – Tuần 2',
        requiredOutcome:
          'Biết và thực hiện được tư thế đứng nghiêm, đứng nghỉ đúng khẩu lệnh; nắm được nội quy tập luyện và tham gia trò chơi vận động an toàn, hào hứng.',
        integrationNote:
          'Hình thành nề nếp, kỷ luật sân bãi và thói quen khởi động an toàn.',
      },
      {
        id: 'g1-gdtc-cd1-b2',
        lessonCode: 'Tiết 4–7 (Tuần 2–4)',
        lessonTitle:
          'Bài 2: Tập hợp đội hình hàng dọc, dóng hàng, điểm số (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 2 – Tuần 4',
        requiredOutcome:
          'Biết khẩu lệnh và thực hiện được cách tập hợp đội hình hàng dọc, dóng hàng dọc và điểm số từ 1 đến hết đúng quy định.',
        integrationNote:
          'Tích hợp GDQP-AN (Tiết 1 - Tuần 2): Rèn tác phong nhanh nhẹn, nghiêm túc, chấp hành khẩu lệnh, giữ đội hình và tinh thần đoàn kết. Tích hợp ATGT (Tiết 3 - Tuần 3): Biết xếp hàng, giữ khoảng cách, quan sát hướng di chuyển và chấp hành hiệu lệnh; liên hệ đi đúng hàng, không chen lấn khi tham gia giao thông.',
      },
      {
        id: 'g1-gdtc-cd1-b3',
        lessonCode: 'Tiết 8–11 (Tuần 4–6)',
        lessonTitle:
          'Bài 3: Tập hợp hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 4 – Tuần 6',
        requiredOutcome:
          'Nhận biết và thực hiện đúng khẩu lệnh tập hợp hàng ngang, dóng hàng ngang, điểm số, dàn hàng và dồn hàng đều, thẳng.',
        integrationNote:
          'Tích hợp KNS (Tiết 1 - Tuần 4): Biết lắng nghe hiệu lệnh, chờ đến lượt, phối hợp với nhóm và nhắc bạn bằng lời lịch sự khi đội hình chưa đúng. Tích hợp BVMT (Tiết 3 - Tuần 5): Giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập. Tích hợp NLS (5.2TC1a - Tiết 4, Tuần 6): Xem lại video ngắn (10–15 giây) ghi cảnh cả lớp tập hợp hàng ngang và tự nhận ra vị trí đứng của mình đã thẳng hàng với bạn chưa.',
      },
      {
        id: 'g1-gdtc-cd1-b4',
        lessonCode: 'Tiết 12–15 (Tuần 6–8)',
        lessonTitle:
          'Bài 4: Động tác quay các hướng: Quay phải, Quay trái, Quay sau (Tiết 1–3) & Ôn tập chủ đề Đội hình đội ngũ (Tiết 1)',
        periods: 4,
        weekLabel: 'Tuần 6 – Tuần 8',
        requiredOutcome:
          'Phân biệt đúng hướng phải, trái, sau; thực hiện được động tác quay phải, quay trái, quay sau đúng khẩu lệnh và giữ thăng bằng; hoàn thành kiểm tra đánh giá chủ đề Đội hình đội ngũ.',
        integrationNote:
          'Rèn khả năng định hướng không gian và phối hợp đồng đội.',
      },
    ],
    outcomes: [
      'Nhận biết khẩu lệnh và tư thế chuẩn của đứng nghiêm, đứng nghỉ, tập hợp hàng dọc/hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng và quay các hướng.',
      'Thực hiện đúng kỹ thuật cơ bản các động tác đội hình đội ngũ theo hiệu lệnh của giáo viên và cán sự lớp.',
      'Vận dụng nề nếp xếp hàng, giữ khoảng cách, trật tự khi sinh hoạt tập thể và tham gia giao thông an toàn.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g1-gdtc-2026-hk1-cd2',
    grade: 'Lớp 1',
    semester: 'HK1',
    chapterCode: 'GDTC1-CĐ2',
    chapterTitle: 'Chủ đề 2: Bài thể dục phát triển chung (09 tiết)',
    topicTitle:
      '7 động tác Bài thể dục phát triển chung (Vươn thở, Tay, Chân, Vặn mình, Bụng, Phối hợp, Điều hòa) & Ôn tập giữa học kì I',
    weekRange: 'Tuần 8 – Tuần 12',
    durationText: '09 tiết (Tiết 16 – Tiết 24)',
    totalPeriods: 9,
    adjustedContentSummary:
      'Tích hợp NLS (1.1TC1a: Quan sát hình ảnh hoặc video mẫu trên màn hình để nhận biết tư thế đúng của động tác vươn thở và động tác tay).',
    lessons: [
      {
        id: 'g1-gdtc-cd2-b1',
        lessonCode: 'Tiết 16–18 (Tuần 8–9)',
        lessonTitle:
          'Bài 1: Động tác vươn thở, động tác tay (Tiết 1–2) & Ôn tập đánh giá giữa học kì 1 (Tiết 1)',
        periods: 3,
        weekLabel: 'Tuần 8 – Tuần 9',
        requiredOutcome:
          'Biết tên và thực hiện được động tác vươn thở, động tác tay theo nhịp hô; hoàn thành nội dung ôn tập và đánh giá giữa học kì I.',
        integrationNote:
          'Tích hợp NLS (1.1TC1a - Tiết 16, Tuần 8): Quan sát hình ảnh hoặc video mẫu trên màn hình để nhận biết tư thế đúng của động tác vươn thở và động tác tay.',
      },
      {
        id: 'g1-gdtc-cd2-b2',
        lessonCode: 'Tiết 19–21 (Tuần 10–11)',
        lessonTitle:
          'Bài 2: Động tác chân, động tác vặn mình, động tác bụng (Tiết 1–3)',
        periods: 3,
        weekLabel: 'Tuần 10 – Tuần 11',
        requiredOutcome:
          'Biết tên và thực hiện được động tác chân, động tác vặn mình, động tác bụng đúng biên độ và nhịp hô 1–8.',
        integrationNote:
          'Rèn luyện tính nhịp điệu, sự dẻo dai và phối hợp vận động.',
      },
      {
        id: 'g1-gdtc-cd2-b3',
        lessonCode: 'Tiết 22–24 (Tuần 11–12)',
        lessonTitle:
          'Bài 3: Động tác phối hợp, động tác điều hòa (Tiết 1–2) & Ôn tập chủ đề Bài thể dục (Tiết 1)',
        periods: 3,
        weekLabel: 'Tuần 11 – Tuần 12',
        requiredOutcome:
          'Thực hiện được động tác phối hợp, động tác điều hòa và liên kết hoàn chỉnh 7 động tác bài thể dục phát triển chung.',
        integrationNote:
          'Hình thành thói quen tập thể dục buổi sáng, giữa giờ để rèn luyện sức khỏe.',
      },
    ],
    outcomes: [
      'Nhớ tên và thứ tự 7 động tác của bài thể dục phát triển chung lớp 1.',
      'Thực hiện đúng phương hướng, biên độ và nhịp điệu từng động tác theo nhịp đếm 1–8.',
      'Tự giác tập luyện bài thể dục phát triển chung hằng ngày để nâng cao sức khỏe.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g1-gdtc-2026-hk1-cd3',
    grade: 'Lớp 1',
    semester: 'HK1',
    chapterCode: 'GDTC1-CĐ3-P1',
    chapterTitle:
      'Chủ đề 3: Bài tập rèn luyện tư thế và kỹ năng vận động cơ bản – Phần 1 (12 tiết)',
    topicTitle:
      'Vận động của đầu, cổ; Vận động của tay; Vận động của chân (Phần đầu) & Ôn tập, Đánh giá cuối Học kì I',
    weekRange: 'Tuần 13 – Tuần 18',
    durationText: '12 tiết (Tiết 25 – Tiết 36)',
    totalPeriods: 12,
    adjustedContentSummary:
      'Tích hợp AI (1.B3.2: Nêu được ví dụ đơn giản về việc máy thông minh có thể sai như đếm nhầm nhịp vỗ tay hoặc nhận diện nhầm khi học sinh đứng quá xa màn hình).',
    lessons: [
      {
        id: 'g1-gdtc-cd3-b1',
        lessonCode: 'Tiết 25–27 (Tuần 13–14)',
        lessonTitle:
          'Bài 1: Vận động của đầu, cổ (Cúi đầu, ngửa đầu, nghiêng đầu sang trái/phải, quay đầu sang trái/phải, xoay đầu & Bài tập phối hợp 1, 2) (Tiết 1–3)',
        periods: 3,
        weekLabel: 'Tuần 13 – Tuần 14',
        requiredOutcome:
          'Biết và thực hiện được các động tác cúi đầu, ngửa đầu, nghiêng đầu, quay đầu, xoay đầu và 2 bài tập phối hợp vận động đầu, cổ.',
        integrationNote:
          'Rèn tư thế thân người ngay ngắn, phòng tránh cong vẹo cột sống.',
      },
      {
        id: 'g1-gdtc-cd3-b2',
        lessonCode: 'Tiết 28–31 (Tuần 14–16)',
        lessonTitle:
          'Bài 2: Vận động của tay (Đưa hai tay ra trước, lên cao, dang ngang, ra sau & Bài tập phối hợp các động tác của tay 1, 2) (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 14 – Tuần 16',
        requiredOutcome:
          'Biết và thực hiện đúng phương hướng các tư thế đưa hai tay ra trước, lên cao, dang ngang, ra sau và 2 bài tập phối hợp tay.',
        integrationNote:
          'Tích hợp AI (1.B3.2 - Tiết 28, Tuần 14): Nêu được ví dụ đơn giản về việc máy thông minh có thể sai (ví dụ: đếm nhầm nhịp vỗ tay hoặc nhận diện nhầm khi học sinh đứng quá xa màn hình).',
      },
      {
        id: 'g1-gdtc-cd3-b3-hk1',
        lessonCode: 'Tiết 32–36 (Tuần 16–18)',
        lessonTitle:
          'Bài 3: Vận động của chân (Tiết 1–3: Đứng kiễng gót, đưa một chân ra trước, sang ngang, ra sau; Bài tập phối hợp 1), Ôn tập cuối HKI (Tiết 35) & Sơ kết học kì 1 (Tiết 36)',
        periods: 5,
        weekLabel: 'Tuần 16 – Tuần 18',
        requiredOutcome:
          'Thực hiện được tư thế đứng kiễng gót, đưa một chân ra trước/sang ngang/ra sau, bài tập phối hợp chân 1; hoàn thành kiểm tra đánh giá cuối HKI.',
        integrationNote:
          'Đánh giá sự tiến bộ về tư thế và kỹ năng vận động cơ bản cuối học kì I.',
      },
    ],
    outcomes: [
      'Nhận biết các tư thế vận động cơ bản của đầu, cổ, tay và chân theo khẩu lệnh.',
      'Thực hiện đúng phương hướng, biên độ các bài tập vận động đầu, cổ, tay, chân và giữ thăng bằng cơ thể.',
      'Vận dụng các tư thế đúng vào sinh hoạt, học tập hằng ngày và tham gia trò chơi vận động an toàn.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g1-gdtc-2026-hk2-cd3',
    grade: 'Lớp 1',
    semester: 'HK2',
    chapterCode: 'GDTC1-CĐ3-P2',
    chapterTitle:
      'Chủ đề 3: Bài tập rèn luyện tư thế và kỹ năng vận động cơ bản – Phần 2 (14 tiết)',
    topicTitle:
      'Vận động của chân (tiếp theo); Vận động phối hợp của cơ thể & Vận động phối hợp của cơ thể (tiếp theo)',
    weekRange: 'Tuần 19 – Tuần 25',
    durationText: '14 tiết (Tiết 37 – Tiết 50)',
    totalPeriods: 14,
    adjustedContentSummary:
      'Tích hợp BVMT (giữ vệ sinh sân tập, sử dụng dụng cụ tiết kiệm, thu dọn gọn gàng); GDQP-AN (rèn ý thức tổ chức kỷ luật, chấp hành hiệu lệnh, bình tĩnh xử lý tình huống); ATGT (giữ khoảng cách, di chuyển trật tự, chấp hành tín hiệu giao thông); NLS (4.1TC1a).',
    lessons: [
      {
        id: 'g1-gdtc-cd3-b3-hk2',
        lessonCode: 'Tiết 37–38 (Tuần 19)',
        lessonTitle:
          'Bài 3: Vận động của chân (tiếp theo: Ôn bài tập phối hợp các động tác chân bài tập 1, 2) (Tiết 1–2)',
        periods: 2,
        weekLabel: 'Tuần 19',
        requiredOutcome:
          'Thực hiện thuần thục bài tập phối hợp các động tác chân (bài tập 1 và bài tập 2) đúng nhịp và giữ thăng bằng tốt.',
        integrationNote:
          'Tích hợp BVMT (Tiết 38 - Tuần 19): Giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.',
      },
      {
        id: 'g1-gdtc-cd3-b4',
        lessonCode: 'Tiết 39–44 (Tuần 20–22)',
        lessonTitle:
          'Bài 4: Vận động phối hợp của cơ thể (Bài tập 1, Bài tập 2 & Kiến thức chung) (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 20 – Tuần 22',
        requiredOutcome:
          'Biết và thực hiện được Bài tập 1, Bài tập 2 vận động phối hợp của cơ thể nhịp nhàng, đúng nhịp hô.',
        integrationNote:
          'Tích hợp GDQP-AN (Tiết 40 - Tuần 20): Rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống. Tích hợp ATGT (Tiết 42 - Tuần 21): Biết giữ khoảng cách, di chuyển trật tự, không vui chơi ở lòng đường và chấp hành tín hiệu khi ra vào sân trường.',
      },
      {
        id: 'g1-gdtc-cd3-b5',
        lessonCode: 'Tiết 45–50 (Tuần 23–25)',
        lessonTitle:
          'Bài 5: Vận động phối hợp của cơ thể tiếp theo (Nhịp 1–8 và Nhịp 9–16) (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 23 – Tuần 25',
        requiredOutcome:
          'Thực hiện hoàn chỉnh 16 nhịp bài tập vận động phối hợp của cơ thể (tiếp theo) và tham gia trò chơi vận động tích cực.',
        integrationNote:
          'Tích hợp NLS (4.1TC1a - Tiết 45, Tuần 23): Biết đứng đúng vị trí an toàn, không chạm tay vào máy chiếu, loa, tivi và không chạy nhảy gần khu vực đặt thiết bị số của giáo viên.',
      },
    ],
    outcomes: [
      'Nhận biết trình tự nhịp 1–8 và 9–16 của các bài tập vận động phối hợp cơ thể.',
      'Thực hiện nhịp nhàng sự phối hợp giữa tay, chân, thân người theo nhịp đếm.',
      'Giữ khoảng cách an toàn, bảo vệ thiết bị dạy học và vệ sinh môi trường sân tập.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g1-gdtc-2026-hk2-cd4',
    grade: 'Lớp 1',
    semester: 'HK2',
    chapterCode: 'GDTC1-CĐ4',
    chapterTitle: 'Chủ đề 4: Môn thể thao tự chọn – Bóng rổ (20 tiết)',
    topicTitle:
      'Làm quen với bóng; Động tác di chuyển không bóng; Động tác dẫn bóng; Động tác ném rổ hai tay trước ngực & Tổng kết năm học',
    weekRange: 'Tuần 26 – Tuần 35',
    durationText: '20 tiết (Tiết 51 – Tiết 70)',
    totalPeriods: 20,
    adjustedContentSummary:
      'Tích hợp KNS (giao tiếp, phối hợp, chờ lượt, kiểm soát cảm xúc khi thi đua và động viên bạn); NLS (1.2TC1a); AI (1.D1.2: Lựa chọn phương án công bằng cho mọi bạn cùng được tham gia khi chia lượt ném bóng hoặc trò chơi).',
    lessons: [
      {
        id: 'g1-gdtc-cd4-b1',
        lessonCode: 'Tiết 51–54 (Tuần 26–27)',
        lessonTitle:
          'Bài 1: Làm quen với bóng (Hai tay chuyền bóng cho nhau, tung bóng lên cao bắt bóng, đón bóng nảy, chuyền bóng qua lại) (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 26 – Tuần 27',
        requiredOutcome:
          'Làm quen với bóng rổ; thực hiện được động tác hai tay chuyền bóng, tung bóng lên cao bắt bóng, đón bóng nảy và chuyền bóng qua lại.',
        integrationNote:
          'Tích hợp KNS (Tiết 51 - Tuần 26): Biết giao tiếp, phối hợp, chờ lượt, kiểm soát cảm xúc khi thi đua và động viên bạn. Tích hợp NLS (1.2TC1a - Tiết 54, Tuần 27): Xem tranh/video mẫu về cách cầm bóng và lăn bóng, chỉ ra được hình ảnh thực hiện đúng yêu cầu an toàn.',
      },
      {
        id: 'g1-gdtc-cd4-b2',
        lessonCode: 'Tiết 55–58 (Tuần 28–29)',
        lessonTitle:
          'Bài 2: Động tác di chuyển không bóng (Chạy theo đường thẳng, chạy đổi hướng) (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 28 – Tuần 29',
        requiredOutcome:
          'Thực hiện được động tác di chuyển không bóng: chạy theo đường thẳng và chạy đổi hướng linh hoạt, giữ thăng bằng.',
        integrationNote:
          'Rèn luyện sức nhanh, sự khéo léo và quan sát không gian sân tập.',
      },
      {
        id: 'g1-gdtc-cd4-b3',
        lessonCode: 'Tiết 59–63 (Tuần 30–32)',
        lessonTitle:
          'Bài 3: Động tác dẫn bóng (Dẫn bóng tại chỗ, dẫn bóng di chuyển lên trước) (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 30 – Tuần 32',
        requiredOutcome:
          'Bước đầu thực hiện được động tác dẫn bóng tại chỗ và dẫn bóng di chuyển lên trước đúng tư thế tay tiếp xúc bóng.',
        integrationNote:
          'Tích hợp AI (1.D1.2 - Tiết 59, Tuần 30): Trong tình huống chia lượt ném bóng hoặc trò chơi do máy gợi ý, học sinh biết lựa chọn phương án công bằng cho mọi bạn cùng được tham gia.',
      },
      {
        id: 'g1-gdtc-cd4-b4',
        lessonCode: 'Tiết 64–70 (Tuần 32–35)',
        lessonTitle:
          'Bài 4: Động tác ném rổ hai tay trước ngực (Tiết 1–5), Ôn tập đánh giá cuối học kỳ 2 (Tiết 69) & Tổng kết năm học (Tiết 70)',
        periods: 7,
        weekLabel: 'Tuần 32 – Tuần 35',
        requiredOutcome:
          'Thực hiện được động tác ném rổ hai tay trước ngực; hoàn thành kiểm tra đánh giá cuối HKII và tổng kết chương trình GDTC lớp 1.',
        integrationNote:
          'Phát triển niềm yêu thích môn Bóng rổ và tinh thần đồng đội công bằng.',
      },
    ],
    outcomes: [
      'Nhận biết cách cầm bóng, chuyền bóng, di chuyển không bóng, dẫn bóng và ném rổ hai tay trước ngực.',
      'Thực hiện được các kỹ năng cơ bản làm quen với bóng rổ ở mức độ bước đầu đúng kỹ thuật.',
      'Chơi trò chơi vận động bổ trợ bóng rổ đoàn kết, công bằng, biết chờ lượt và động viên bạn.',
    ],
  }),
];

// ============================================================================
// KHỐI 2 - GIÁO DỤC THỂ CHẤT 2 (70 TIẾT / 35 TUẦN, 02 TIẾT/TUẦN)
// ============================================================================
export const GRADE2_GDTC_TOPICS: CurriculumTopic[] = [
  buildPrimaryGdtcTopic({
    id: 'g2-gdtc-2026-hk1-cd1',
    grade: 'Lớp 2',
    semester: 'HK1',
    chapterCode: 'GDTC2-CĐ1',
    chapterTitle: 'Chủ đề 1: Đội hình đội ngũ (14 tiết)',
    topicTitle:
      'Chuyển đội hình hàng dọc, hàng ngang thành vòng tròn và ngược lại; Giậm chân tại chỗ, đứng lại',
    weekRange: 'Tuần 1 – Tuần 7',
    durationText: '14 tiết (Tiết 1 – Tiết 14)',
    totalPeriods: 14,
    adjustedContentSummary:
      'Tích hợp NLS (1.3.CB1a: Nhận biết và đọc đúng kí hiệu sơ đồ đội hình hàng dọc, vòng tròn hiển thị trên bảng/màn hình); ATGT (liên hệ hiệu lệnh, hướng di chuyển và khoảng cách an toàn khi tham gia giao thông); AI (2.A1.3: Nêu được máy đếm nhịp phát khẩu lệnh tự động do con người tạo ra).',
    lessons: [
      {
        id: 'g2-gdtc-cd1-b1',
        lessonCode: 'Tiết 1–5 (Tuần 1–3)',
        lessonTitle:
          'Bài 1: Chuyển đội hình hàng dọc thành đội hình vòng tròn và ngược lại (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 1 – Tuần 3',
        requiredOutcome:
          'Biết khẩu lệnh và thực hiện được cách chuyển đội hình hàng dọc thành đội hình vòng tròn và từ vòng tròn về hàng dọc đúng hướng, đều khoảng cách.',
        integrationNote:
          'Tích hợp NLS (1.3.CB1a - Tiết 3, Tuần 2): Nhận biết và đọc đúng kí hiệu sơ đồ đội hình hàng dọc, vòng tròn hiển thị trên bảng/màn hình để đứng đúng vị trí của tổ mình. Tích hợp ATGT (Tiết 5, Tuần 3): Liên hệ hiệu lệnh, hướng di chuyển và khoảng cách an toàn trong tập luyện với việc chấp hành tín hiệu, đi đúng phần đường và không chen lấn khi tham gia giao thông.',
      },
      {
        id: 'g2-gdtc-cd1-b2',
        lessonCode: 'Tiết 6–10 (Tuần 3–5)',
        lessonTitle:
          'Bài 2: Chuyển đội hình hàng ngang thành đội hình vòng tròn và ngược lại (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 3 – Tuần 5',
        requiredOutcome:
          'Biết khẩu lệnh và thực hiện được cách chuyển đội hình hàng ngang thành đội hình vòng tròn và ngược lại trật tự, đúng cự ly.',
        integrationNote:
          'Rèn luyện khả năng phối hợp tập thể và định hướng đội hình vòng tròn.',
      },
      {
        id: 'g2-gdtc-cd1-b3',
        lessonCode: 'Tiết 11–14 (Tuần 6–7)',
        lessonTitle: 'Bài 3: Giậm chân tại chỗ, đứng lại (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 6 – Tuần 7',
        requiredOutcome:
          'Thực hiện đúng động tác giậm chân tại chỗ và đứng lại đúng nhịp 1–2 theo khẩu lệnh.',
        integrationNote:
          'Tích hợp AI (2.A1.3 - Tiết 11, Tuần 6): Nêu được rằng máy đếm nhịp hoặc ứng dụng phát khẩu lệnh tự động là công cụ do con người tạo ra để giúp lớp giậm chân đều nhịp hơn.',
      },
    ],
    outcomes: [
      'Nhận biết khẩu lệnh, sơ đồ chuyển đội hình hàng dọc/hàng ngang thành vòng tròn và động tác giậm chân tại chỗ, đứng lại.',
      'Thực hiện đúng kỹ thuật chuyển đội hình vòng tròn và giậm chân tại chỗ, đứng lại đúng nhịp 1–2.',
      'Giữ khoảng cách, trật tự khi di chuyển đội hình và liên hệ chấp hành quy tắc giao thông đường bộ.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g2-gdtc-2026-hk1-cd2',
    grade: 'Lớp 2',
    semester: 'HK1',
    chapterCode: 'GDTC2-CĐ2',
    chapterTitle: 'Chủ đề 2: Bài tập thể dục (11 tiết)',
    topicTitle:
      '8 động tác Bài thể dục phát triển chung lớp 2 (Vươn thở, Tay, Chân, Lườn, Bụng, Phối hợp, Nhảy, Điều hòa)',
    weekRange: 'Tuần 8 – Tuần 13',
    durationText: '11 tiết (Tiết 15 – Tiết 25)',
    totalPeriods: 11,
    adjustedContentSummary:
      'Tích hợp GDQP-AN (rèn ý thức kỉ luật, chấp hành khẩu lệnh, giữ đội hình, đoàn kết hỗ trợ bạn); NLS (4.3.CB1a: Khởi động kỹ trước khi tập và đứng cách màn hình khoảng cách an toàn); BVMT (giữ vệ sinh sân tập, thu gom dụng cụ, bảo vệ cây xanh); KNS (giao tiếp, hợp tác, chờ lượt, kiểm soát cảm xúc).',
    lessons: [
      {
        id: 'g2-gdtc-cd2-b1',
        lessonCode: 'Tiết 15–16 (Tuần 8)',
        lessonTitle: 'Bài 1: Động tác vươn thở, động tác tay (Tiết 1–2)',
        periods: 2,
        weekLabel: 'Tuần 8',
        requiredOutcome:
          'Biết tên và thực hiện đúng động tác vươn thở, động tác tay theo nhịp đếm 1–8.',
        integrationNote:
          'Tích hợp GDQP-AN (Tiết 15): Rèn ý thức kỉ luật, tác phong nhanh nhẹn, chấp hành khẩu lệnh, giữ đội hình và tinh thần đoàn kết, hỗ trợ bạn trong tập luyện. Tích hợp NLS (4.3.CB1a - Tiết 16): Biết khởi động kĩ trước khi tập theo video hướng dẫn và đứng cách màn hình ở khoảng cách an toàn cho mắt và cơ thể.',
      },
      {
        id: 'g2-gdtc-cd2-b2',
        lessonCode: 'Tiết 17–19 (Tuần 9–10)',
        lessonTitle:
          'Bài 2: Động tác chân, động tác lườn, động tác bụng (Tiết 1–3)',
        periods: 3,
        weekLabel: 'Tuần 9 – Tuần 10',
        requiredOutcome:
          'Thực hiện được động tác chân, động tác lườn, động tác bụng đúng biên độ và kết hợp nhịp thở.',
        integrationNote:
          'Tích hợp BVMT (Tiết 17 - Tuần 9): Giữ vệ sinh sân tập, không xả rác, thu gom dụng cụ đúng nơi quy định và bảo vệ cây xanh quanh khu vực học tập. Tích hợp KNS (Tiết 18 - Tuần 9): Rèn kĩ năng giao tiếp, hợp tác, chờ đến lượt, tự kiểm soát cảm xúc và xử lí tình huống an toàn khi tập luyện, vui chơi.',
      },
      {
        id: 'g2-gdtc-cd2-b3',
        lessonCode: 'Tiết 20–25 (Tuần 10–13)',
        lessonTitle:
          'Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hòa (Tiết 1–2); Hoàn thiện bài thể dục (Tiết 1–2) & Ôn tập bài thể dục (Tiết 1–2)',
        periods: 6,
        weekLabel: 'Tuần 10 – Tuần 13',
        requiredOutcome:
          'Thực hiện đúng động tác phối hợp, nhảy, điều hòa; liên kết hoàn thiện cả 8 động tác bài thể dục lớp 2 và hoàn thành kiểm tra chủ đề.',
        integrationNote:
          'Rèn luyện thói quen tự giác tập thể dục hằng ngày bảo vệ sức khỏe.',
      },
    ],
    outcomes: [
      'Nhớ tên và thứ tự 8 động tác của bài thể dục phát triển chung lớp 2.',
      'Thực hiện đúng biên độ, phương hướng và nhịp điệu cả 8 động tác theo nhịp hô.',
      'Phối hợp tập đồng diễn theo tổ/nhóm đều, đẹp và giữ vệ sinh khu vực tập luyện.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g2-gdtc-2026-hk1-cd3',
    grade: 'Lớp 2',
    semester: 'HK1',
    chapterCode: 'GDTC2-CĐ3-P1',
    chapterTitle:
      'Chủ đề 3: Tư thế và kỹ năng vận động cơ bản – Phần 1 (11 tiết)',
    topicTitle:
      'Bài tập di chuyển theo vạch kẻ thẳng; Phối hợp di chuyển vòng trái, vòng phải & Ôn tập đánh giá Học kì I',
    weekRange: 'Tuần 13 – Tuần 18',
    durationText: '11 tiết (Tiết 26 – Tiết 36)',
    totalPeriods: 11,
    adjustedContentSummary:
      'Rèn luyện tư thế đi thường, đi kiễng gót, đi hai tay chống hông/dang ngang theo vạch kẻ thẳng và vòng trái, vòng phải; ôn tập và kiểm tra đánh giá cuối HKI.',
    lessons: [
      {
        id: 'g2-gdtc-cd3-b1',
        lessonCode: 'Tiết 26–30 (Tuần 13–15)',
        lessonTitle:
          'Bài 1: Bài tập di chuyển theo vạch kẻ thẳng (Đi thường, đi kiễng gót, đi hai tay chống hông, đi hai tay dang ngang theo vạch kẻ thẳng) (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 13 – Tuần 15',
        requiredOutcome:
          'Thực hiện được các bài tập đi thường, đi kiễng gót, đi hai tay chống hông và dang ngang theo vạch kẻ thẳng giữ thăng bằng tốt.',
        integrationNote:
          'Rèn tư thế đi đúng, mắt nhìn thẳng, giữ cột sống ngay ngắn.',
      },
      {
        id: 'g2-gdtc-cd3-b2',
        lessonCode: 'Tiết 31–36 (Tuần 16–18)',
        lessonTitle:
          'Bài 2: Bài tập phối hợp di chuyển vòng trái, vòng phải (Đi thường, đi kiễng gót hai tay chống hông, đi nhanh dần theo vạch kẻ vòng trái, vòng phải) (Tiết 1–4); Ôn tập đánh giá HKI (Tiết 35) & Sơ kết HKI (Tiết 36)',
        periods: 6,
        weekLabel: 'Tuần 16 – Tuần 18',
        requiredOutcome:
          'Thực hiện được các bài tập phối hợp di chuyển vòng trái, vòng phải theo vạch kẻ; hoàn thành đánh giá cuối học kì I.',
        integrationNote:
          'Củng cố khả năng giữ thăng bằng khi chuyển hướng di chuyển.',
      },
    ],
    outcomes: [
      'Nhận biết cách di chuyển đi thường, đi kiễng gót, hai tay chống hông/dang ngang theo vạch kẻ thẳng và vòng trái/phải.',
      'Thực hiện đúng kỹ thuật giữ thăng bằng và đặt bàn chân theo vạch kẻ.',
      'Vận dụng tư thế đi đúng, an toàn trong học tập và sinh hoạt hằng ngày.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g2-gdtc-2026-hk2-cd3',
    grade: 'Lớp 2',
    semester: 'HK2',
    chapterCode: 'GDTC2-CĐ3-P2',
    chapterTitle:
      'Chủ đề 3: Tư thế và kỹ năng vận động cơ bản – Phần 2 (15 tiết)',
    topicTitle:
      'Phối hợp di chuyển nhanh dần theo vạch kẻ thẳng và sang trái/phải; Các động tác quỳ, ngồi cơ bản và bài tập phối hợp',
    weekRange: 'Tuần 19 – Tuần 26',
    durationText: '15 tiết (Tiết 37 – Tiết 51)',
    totalPeriods: 15,
    adjustedContentSummary:
      'Tích hợp NLS (1.2.CB1a & 5.1.CB1a: So sánh hai hình minh họa tư thế chạy theo vạch kẻ thẳng; nhận biết và báo giáo viên khi video bị đứng hình/mất tiếng); ATGT; GDQP-AN; BVMT.',
    lessons: [
      {
        id: 'g2-gdtc-cd3-b3',
        lessonCode: 'Tiết 37–40 (Tuần 19–20)',
        lessonTitle:
          'Bài 3: Bài tập phối hợp di chuyển nhanh dần theo vạch kẻ thẳng (Đi nhanh chuyển sang chạy thường, chạy theo vạch kẻ thẳng hai tay phối hợp tự nhiên, hai tay chống hông) (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 19 – Tuần 20',
        requiredOutcome:
          'Thực hiện được động tác đi nhanh chuyển sang chạy thường và phối hợp di chuyển nhanh dần theo vạch kẻ thẳng.',
        integrationNote:
          'Tích hợp NLS (1.2.CB1a - Tiết 37, Tuần 19): So sánh hai hình minh họa tư thế chạy theo vạch kẻ thẳng và chọn được hình thể hiện tư thế đúng, an toàn. Tích hợp NLS (5.1.CB1a - Tiết 40, Tuần 20): Nhận biết khi video minh họa bị đứng hình hoặc mất tiếng và biết báo ngay cho giáo viên để được hỗ trợ.',
      },
      {
        id: 'g2-gdtc-cd3-b4',
        lessonCode: 'Tiết 41–44 (Tuần 21–22)',
        lessonTitle:
          'Bài 4: Bài tập phối hợp di chuyển nhanh dần theo vạch kẻ sang trái, sang phải (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 21 – Tuần 22',
        requiredOutcome:
          'Thực hiện được bài tập đi nhanh chuyển sang chạy theo vạch kẻ vòng trái, vòng phải an toàn, đúng hướng.',
        integrationNote:
          'Tích hợp ATGT (Tiết 41 - Tuần 21): Liên hệ hiệu lệnh, hướng di chuyển và khoảng cách an toàn với việc chấp hành tín hiệu, đi đúng phần đường. Tích hợp GDQP-AN (Tiết 43 - Tuần 22): Rèn ý thức kỉ luật, tác phong nhanh nhẹn, chấp hành khẩu lệnh. Tích hợp BVMT (Tiết 44 - Tuần 22): Giữ vệ sinh sân tập, thu gom dụng cụ đúng nơi quy định và bảo vệ cây xanh.',
      },
      {
        id: 'g2-gdtc-cd3-b5-b6',
        lessonCode: 'Tiết 45–51 (Tuần 23–26)',
        lessonTitle:
          'Bài 5: Các động tác quỳ, ngồi cơ bản (Quỳ cao, quỳ thấp, ngồi xổm, ngồi bệt thẳng chân, ngồi kiễng gót) (Tiết 1–3) & Bài 6: Bài tập phối hợp các tư thế quỳ, ngồi cơ bản (Tiết 1–4)',
        periods: 7,
        weekLabel: 'Tuần 23 – Tuần 26',
        requiredOutcome:
          'Thực hiện đúng các tư thế quỳ cao, quỳ thấp, ngồi xổm, ngồi bệt thẳng chân, ngồi kiễng gót và các bài tập phối hợp chuyển đổi tư thế nhịp nhàng.',
        integrationNote:
          'Phát triển sự mềm dẻo của khớp gối, hông và khả năng giữ thăng bằng tĩnh/động.',
      },
    ],
    outcomes: [
      'Nhận biết kỹ thuật di chuyển nhanh dần theo vạch kẻ thẳng/vòng và các tư thế quỳ, ngồi cơ bản.',
      'Thực hiện đúng sự chuyển tiếp từ đi nhanh sang chạy và phối hợp các tư thế quỳ, ngồi cơ bản.',
      'Biết giữ khoảng cách an toàn khi chạy đổi hướng và bảo vệ môi trường sân bãi.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g2-gdtc-2026-hk2-cd4',
    grade: 'Lớp 2',
    semester: 'HK2',
    chapterCode: 'GDTC2-CĐ4',
    chapterTitle: 'Chủ đề 4: Môn thể thao tự chọn – Bóng rổ (19 tiết)',
    topicTitle:
      'Động tác di chuyển không bóng; Động tác dẫn bóng; Động tác tung – bắt bóng bằng hai tay; Động tác ném rổ hai tay trước ngực',
    weekRange: 'Tuần 26 – Tuần 35',
    durationText: '19 tiết (Tiết 52 – Tiết 70)',
    totalPeriods: 19,
    adjustedContentSummary:
      'Tích hợp KNS (rèn kĩ năng giao tiếp, hợp tác, chờ đến lượt, tự kiểm soát cảm xúc và xử lí tình huống an toàn); AI (2.B1.1: Biết rằng thiết bị thông minh muốn gợi ý bài tập ném rổ phù hợp thì cần thông tin đầu vào như khoảng cách đứng và số lần ném trúng).',
    lessons: [
      {
        id: 'g2-gdtc-cd4-b1',
        lessonCode: 'Tiết 52–55 (Tuần 26–28)',
        lessonTitle:
          'Bài 1: Động tác di chuyển không bóng (Di chuyển trượt ngang, chạy biến tốc, dừng nhanh) (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 26 – Tuần 28',
        requiredOutcome:
          'Thực hiện được các động tác di chuyển không bóng trong bóng rổ, giữ trọng tâm thấp và thăng bằng khi dừng.',
        integrationNote:
          'Rèn luyện phản xạ nhanh với tín hiệu của giáo viên.',
      },
      {
        id: 'g2-gdtc-cd4-b2',
        lessonCode: 'Tiết 56–59 (Tuần 28–30)',
        lessonTitle:
          'Bài 2: Động tác dẫn bóng (Dẫn bóng tại chỗ và dẫn bóng di chuyển) (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 28 – Tuần 30',
        requiredOutcome:
          'Thực hiện được động tác dẫn bóng tại chỗ và dẫn bóng di chuyển về trước liên tục, kiểm soát được hướng bóng.',
        integrationNote:
          'Phát triển cảm giác bóng và sự phối hợp tay – mắt.',
      },
      {
        id: 'g2-gdtc-cd4-b3',
        lessonCode: 'Tiết 60–64 (Tuần 30–32)',
        lessonTitle:
          'Bài 3: Động tác tung – bắt bóng bằng hai tay (Tung bóng lên cao bắt bóng, tung – bắt bóng phối hợp theo cặp) (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 30 – Tuần 32',
        requiredOutcome:
          'Thực hiện được động tác tung – bắt bóng bằng hai tay cá nhân và phối hợp với bạn đúng kỹ thuật, không làm rơi bóng.',
        integrationNote:
          'Tích hợp KNS (Tiết 62 - Tuần 31): Rèn kĩ năng giao tiếp, hợp tác, chờ đến lượt, tự kiểm soát cảm xúc và xử lí tình huống an toàn khi tập luyện, vui chơi.',
      },
      {
        id: 'g2-gdtc-cd4-b4',
        lessonCode: 'Tiết 65–70 (Tuần 33–35)',
        lessonTitle:
          'Bài 4: Động tác ném rổ hai tay trước ngực (Tiết 1–4), Ôn tập và đánh giá HKII (Tiết 69) & Tổng kết môn học (Tiết 70)',
        periods: 6,
        weekLabel: 'Tuần 33 – Tuần 35',
        requiredOutcome:
          'Thực hiện được động tác ném rổ hai tay trước ngực ở cự ly phù hợp; hoàn thành đánh giá cuối năm học.',
        integrationNote:
          'Tích hợp AI (2.B1.1 - Tiết 65, Tuần 33): Biết rằng thiết bị thông minh muốn gợi ý bài tập ném rổ phù hợp thì cần có thông tin đầu vào như khoảng cách đứng và số lần ném trúng rổ.',
      },
    ],
    outcomes: [
      'Nhận biết kỹ thuật di chuyển không bóng, dẫn bóng, tung – bắt bóng bằng hai tay và ném rổ hai tay trước ngực.',
      'Thực hiện tương đối ổn định các kỹ năng cơ bản của môn Bóng rổ lớp 2.',
      'Hợp tác tích cực với bạn trong các bài tập đôi/nhóm và trò chơi vận động bóng rổ.',
    ],
  }),
];

// ============================================================================
// KHỐI 3 - GIÁO DỤC THỂ CHẤT 3 (70 TIẾT / 35 TUẦN, 02 TIẾT/TUẦN)
// ============================================================================
export const GRADE3_GDTC_TOPICS: CurriculumTopic[] = [
  buildPrimaryGdtcTopic({
    id: 'g3-gdtc-2026-hk1-cd1',
    grade: 'Lớp 3',
    semester: 'HK1',
    chapterCode: 'GDTC3-CĐ1',
    chapterTitle: 'Chủ đề 1: Đội hình đội ngũ (16 tiết)',
    topicTitle:
      'Biến đổi đội hình từ một hàng dọc/ngang thành hai, ba hàng dọc/ngang; Từ một vòng tròn thành hai vòng tròn; Động tác đi đều, đứng lại',
    weekRange: 'Tuần 1 – Tuần 8',
    durationText: '16 tiết (Tiết 1 – Tiết 16)',
    totalPeriods: 16,
    adjustedContentSummary:
      'Tích hợp AI (3.C5.1: Trình bày được quy tắc từng bước dưới dạng "Nếu có khẩu lệnh ... thì thực hiện bước ..." khi biến đổi đội hình từ một hàng dọc thành hai, ba hàng dọc).',
    lessons: [
      {
        id: 'g3-gdtc-cd1-b1',
        lessonCode: 'Tiết 1–4 (Tuần 1–2)',
        lessonTitle:
          'Bài 1: Biến đổi đội hình từ một hàng dọc thành hai, ba hàng dọc và ngược lại (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 1 – Tuần 2',
        requiredOutcome:
          'Biết khẩu lệnh và thực hiện đúng cách điểm số theo chu kỳ 1–2 hoặc 1–2–3 để biến đổi đội hình từ một hàng dọc thành hai, ba hàng dọc và ngược lại.',
        integrationNote:
          'Tích hợp AI (3.C5.1 - Tiết 4, Tuần 2): Trình bày được quy tắc từng bước dưới dạng "Nếu có khẩu lệnh ... thì thực hiện bước ..." khi biến đổi đội hình từ một hàng dọc thành hai, ba hàng dọc.',
      },
      {
        id: 'g3-gdtc-cd1-b2',
        lessonCode: 'Tiết 5–8 (Tuần 3–4)',
        lessonTitle:
          'Bài 2: Biến đổi đội hình từ một hàng ngang thành hai, ba hàng ngang và ngược lại (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 3 – Tuần 4',
        requiredOutcome:
          'Thực hiện đúng khẩu lệnh và bước di chuyển biến đổi đội hình từ một hàng ngang thành hai, ba hàng ngang và ngược lại.',
        integrationNote:
          'Rèn tính kỷ luật, sự tập trung lắng nghe khẩu lệnh và phối hợp đồng đội.',
      },
      {
        id: 'g3-gdtc-cd1-b3',
        lessonCode: 'Tiết 9–10 (Tuần 5)',
        lessonTitle:
          'Bài 3: Biến đổi đội hình từ một vòng tròn thành hai vòng tròn và ngược lại (Tiết 1–2)',
        periods: 2,
        weekLabel: 'Tuần 5',
        requiredOutcome:
          'Thực hiện được cách biến đổi đội hình từ một vòng tròn thành hai vòng tròn đồng tâm và ngược lại đều, đẹp.',
        integrationNote:
          'Phát triển cảm giác không gian đội hình tập thể.',
      },
      {
        id: 'g3-gdtc-cd1-b4',
        lessonCode: 'Tiết 11–16 (Tuần 6–8)',
        lessonTitle:
          'Bài 4: Động tác đi đều, đứng lại (Tiết 1–4) & Ôn động tác đi đều, đứng lại (Tiết 1–2)',
        periods: 6,
        weekLabel: 'Tuần 6 – Tuần 8',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật đi đều, đánh tay nhịp nhàng và đứng lại đúng nhịp 1–2 theo khẩu lệnh.',
        integrationNote:
          'Hoàn thiện tác phong đội ngũ nghiêm trang, đều nhịp.',
      },
    ],
    outcomes: [
      'Hiểu quy tắc điểm số và cách di chuyển biến đổi đội hình hàng dọc, hàng ngang, vòng tròn và động tác đi đều, đứng lại.',
      'Thực hiện đúng bước chân, hướng di chuyển và nhịp 1–2 trong đội hình đội ngũ lớp 3.',
      'Phối hợp nhịp nhàng với tập thể lớp trong sinh hoạt Sao Nhi đồng và Đội Thiếu niên Tiền phong.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g3-gdtc-2026-hk1-cd2',
    grade: 'Lớp 3',
    semester: 'HK1',
    chapterCode: 'GDTC3-CĐ2',
    chapterTitle: 'Chủ đề 2: Bài tập thể dục (08 tiết)',
    topicTitle:
      '8 động tác Bài thể dục phát triển chung lớp 3 (Vươn thở, Tay, Chân, Lườn, Bụng, Phối hợp, Nhảy, Điều hòa)',
    weekRange: 'Tuần 9 – Tuần 12',
    durationText: '08 tiết (Tiết 17 – Tiết 24)',
    totalPeriods: 8,
    adjustedContentSummary:
      'Tích hợp BVMT (giữ vệ sinh sân tập, thu gom dụng cụ đúng nơi quy định); KNS (giao tiếp, hợp tác, chờ đến lượt, tự kiểm soát cảm xúc); NLS (1.2.CB1a: So sánh hình ảnh tư thế đúng và sai của động tác nhảy, điều hòa); GDQP-AN (rèn tác phong nhanh nhẹn, kỉ luật, chấp hành hiệu lệnh).',
    lessons: [
      {
        id: 'g3-gdtc-cd2-b1',
        lessonCode: 'Tiết 17–18 (Tuần 9)',
        lessonTitle: 'Bài 1: Động tác vươn thở, động tác tay (Tiết 1–2)',
        periods: 2,
        weekLabel: 'Tuần 9',
        requiredOutcome:
          'Thực hiện đúng biên độ, phương hướng và nhịp hô của động tác vươn thở, động tác tay.',
        integrationNote:
          'Rèn luyện tư thế đúng và kết hợp hít thở sâu.',
      },
      {
        id: 'g3-gdtc-cd2-b2',
        lessonCode: 'Tiết 19–20 (Tuần 10)',
        lessonTitle:
          'Bài 2: Động tác chân, động tác lườn, động tác bụng (Tiết 1–2)',
        periods: 2,
        weekLabel: 'Tuần 10',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật động tác chân, động tác lườn, động tác bụng theo nhịp 1–8.',
        integrationNote:
          'Tích hợp BVMT (Tiết 19): Giữ vệ sinh sân tập, không xả rác, thu gom dụng cụ đúng nơi quy định và bảo vệ cây xanh, cảnh quan trường học. Tích hợp KNS (Tiết 20): Rèn kĩ năng giao tiếp, hợp tác, chờ đến lượt, tự kiểm soát cảm xúc và xử lí tình huống an toàn khi tập luyện, thi đua.',
      },
      {
        id: 'g3-gdtc-cd2-b3',
        lessonCode: 'Tiết 21–24 (Tuần 11–12)',
        lessonTitle:
          'Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hòa (Tiết 1–3) & Ôn Bài thể dục (Tiết 1)',
        periods: 4,
        weekLabel: 'Tuần 11 – Tuần 12',
        requiredOutcome:
          'Thực hiện đúng động tác phối hợp, nhảy, điều hòa và liên kết hoàn chỉnh 8 động tác bài thể dục lớp 3.',
        integrationNote:
          'Tích hợp NLS (1.2.CB1a - Tiết 21, Tuần 11): Quan sát trên màn hình và so sánh hình ảnh tư thế đúng – sai của động tác nhảy, động tác điều hòa để tự sửa tư thế. Tích hợp GDQP-AN (Tiết 22, Tuần 11): Rèn tác phong nhanh nhẹn, tính kỉ luật, chấp hành hiệu lệnh, giữ đội hình và tinh thần đoàn kết hỗ trợ đồng đội.',
      },
    ],
    outcomes: [
      'Nhớ tên, thứ tự và nhịp hô của 8 động tác bài thể dục phát triển chung lớp 3.',
      'Thực hiện đúng biên độ, phương hướng, nhịp điệu cả bài thể dục cá nhân và theo tổ.',
      'Biết tự quan sát, sửa sai tư thế và duy trì thói quen tập thể dục rèn luyện sức khỏe.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g3-gdtc-2026-hk1-cd3',
    grade: 'Lớp 3',
    semester: 'HK1',
    chapterCode: 'GDTC3-CĐ3-P1',
    chapterTitle:
      'Chủ đề 3: Tư thế và kỹ năng vận động cơ bản – Phần 1 (12 tiết)',
    topicTitle:
      'Phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng và trên đường gấp khúc & Ôn tập, Đánh giá HKI',
    weekRange: 'Tuần 13 – Tuần 18',
    durationText: '12 tiết (Tiết 25 – Tiết 36)',
    totalPeriods: 12,
    adjustedContentSummary:
      'Tích hợp AI (3.C5.2: Sắp xếp đúng thứ tự các bước vượt chướng ngại vật trên đường thẳng thành quy trình rõ ràng như cách máy tính thực hiện theo thuật toán); NLS (1.1.CB1a); ATGT (quan sát chướng ngại vật, giữ khoảng cách và chọn hướng di chuyển an toàn).',
    lessons: [
      {
        id: 'g3-gdtc-cd3-b1',
        lessonCode: 'Tiết 25–28 (Tuần 13–14)',
        lessonTitle:
          'Bài 1: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng (Đi, chạy vượt qua chướng ngại vật thấp trên đường thẳng) (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 13 – Tuần 14',
        requiredOutcome:
          'Thực hiện được các bài tập đi, chạy kết hợp bước hoặc nhảy vượt qua chướng ngại vật trên đường thẳng an toàn, nhịp nhàng.',
        integrationNote:
          'Tích hợp AI (3.C5.2 - Tiết 25, Tuần 13): Sắp xếp đúng thứ tự các bước vượt chướng ngại vật trên đường thẳng (quan sát – chạy đà – giậm nhảy – tiếp đất) thành quy trình rõ ràng như cách máy tính thực hiện theo thuật toán. Tích hợp NLS (1.1.CB1a - Tiết 26, Tuần 13): Tìm và xem lại đoạn video hướng dẫn kĩ thuật vượt chướng ngại vật trong thư mục bài học số do giáo viên cung cấp. Tích hợp ATGT (Tiết 27, Tuần 14): Liên hệ kĩ năng quan sát chướng ngại vật, giữ khoảng cách và chọn hướng di chuyển an toàn với việc đi bộ, sang đường.',
      },
      {
        id: 'g3-gdtc-cd3-b2',
        lessonCode: 'Tiết 29–36 (Tuần 15–18)',
        lessonTitle:
          'Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (Tiết 1–6), Ôn tập và đánh giá HKI (Tiết 35) & Sơ kết HKI (Tiết 36)',
        periods: 8,
        weekLabel: 'Tuần 15 – Tuần 18',
        requiredOutcome:
          'Thực hiện được bài tập phối hợp di chuyển đổi hướng vượt qua chướng ngại vật trên đường gấp khúc; hoàn thành đánh giá cuối học kì I.',
        integrationNote:
          'Phát triển sự khéo léo, khả năng định hướng và giữ thăng bằng khi vừa đổi hướng vừa vượt vật cản.',
      },
    ],
    outcomes: [
      'Nhận biết quy trình các bước chạy đà, giậm nhảy vượt chướng ngại vật và tiếp đất trên đường thẳng, đường gấp khúc.',
      'Thực hiện đúng kỹ thuật phối hợp di chuyển vượt qua chướng ngại vật an toàn, không chạm đổ vật cản.',
      'Vận dụng kỹ năng quan sát vật cản và giữ khoảng cách an toàn khi di chuyển, tham gia giao thông.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g3-gdtc-2026-hk2-cd3',
    grade: 'Lớp 3',
    semester: 'HK2',
    chapterCode: 'GDTC3-CĐ3-P2',
    chapterTitle:
      'Chủ đề 3: Tư thế và kỹ năng vận động cơ bản – Phần 2 (14 tiết)',
    topicTitle:
      'Phối hợp di chuyển vượt qua chướng ngại vật trên địa hình tự nhiên; Tại chỗ tung – bắt bóng bằng hai tay và bài tập phối hợp',
    weekRange: 'Tuần 19 – Tuần 25',
    durationText: '14 tiết (Tiết 37 – Tiết 50)',
    totalPeriods: 14,
    adjustedContentSummary:
      'Tích hợp ATGT; BVMT; GDQP-AN; AI (3.A2.2: Phân biệt được việc tự tập luyện của bản thân với sự hỗ trợ từ video phân tích động tác trên thiết bị thông minh); KNS; NLS (5.4.CB1a: Tự đánh giá mức độ biết sử dụng bảng điểm/phiếu theo dõi điện tử).',
    lessons: [
      {
        id: 'g3-gdtc-cd3-b3',
        lessonCode: 'Tiết 37–42 (Tuần 19–21)',
        lessonTitle:
          'Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 19 – Tuần 21',
        requiredOutcome:
          'Thực hiện được các bài tập phối hợp đi, chạy, bật nhảy vượt qua các chướng ngại vật mô phỏng địa hình tự nhiên an toàn.',
        integrationNote:
          'Tích hợp ATGT (Tiết 38 - Tuần 19): Liên hệ kĩ năng quan sát chướng ngại vật, giữ khoảng cách và chọn hướng di chuyển an toàn khi tham gia giao thông. Tích hợp BVMT (Tiết 42 - Tuần 21): Giữ vệ sinh sân tập, không xả rác, thu gom dụng cụ đúng nơi quy định và bảo vệ cây xanh, cảnh quan trường học.',
      },
      {
        id: 'g3-gdtc-cd3-b4',
        lessonCode: 'Tiết 43–50 (Tuần 22–25)',
        lessonTitle:
          'Bài 4: Bài tập tại chỗ tung – bắt bóng bằng hai tay (Tiết 1–4) & Bài tập phối hợp các tư thế tại chỗ tung – bắt bóng bằng hai tay (Tiết 1–4)',
        periods: 8,
        weekLabel: 'Tuần 22 – Tuần 25',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật tại chỗ tung – bắt bóng bằng hai tay và phối hợp các tư thế (quỳ, ngồi, đứng) tung – bắt bóng bằng hai tay.',
        integrationNote:
          'Tích hợp GDQP-AN (Tiết 44 - Tuần 22): Rèn tác phong nhanh nhẹn, tính kỉ luật, chấp hành hiệu lệnh. Tích hợp AI (3.A2.2 - Tiết 45, Tuần 23): Phân biệt được việc tự tập luyện của bản thân với sự hỗ trợ từ video phân tích động tác trên thiết bị thông minh, không phụ thuộc hoàn toàn vào máy. Tích hợp KNS (Tiết 47 - Tuần 24): Rèn kĩ năng giao tiếp, hợp tác, chờ đến lượt, tự kiểm soát cảm xúc. Tích hợp NLS (5.4.CB1a - Tiết 49, Tuần 25): Tự đánh giá mức độ biết sử dụng bảng điểm/phiếu theo dõi điện tử đơn giản của lớp và nêu được nội dung mình cần giáo viên hướng dẫn thêm.',
      },
    ],
    outcomes: [
      'Nhận biết cách vượt chướng ngại vật trên địa hình và kỹ thuật tung – bắt bóng bằng hai tay ở các tư thế khác nhau.',
      'Thực hiện nhịp nhàng, chính xác các bài tập phối hợp tư thế tung – bắt bóng và vượt vật cản.',
      'Biết hợp tác nhóm, giữ gìn dụng cụ sân tập và bước đầu làm quen với công cụ theo dõi kết quả tập luyện.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g3-gdtc-2026-hk2-cd4',
    grade: 'Lớp 3',
    semester: 'HK2',
    chapterCode: 'GDTC3-CĐ4',
    chapterTitle: 'Chủ đề 4: Môn thể thao tự chọn – Bóng rổ (20 tiết)',
    topicTitle:
      'Bài tập bổ trợ với bóng; Dẫn bóng theo hướng thẳng và đổi hướng; Chuyền bóng hai tay trước ngực; Phối hợp dẫn bóng – ném rổ hai tay trước ngực',
    weekRange: 'Tuần 26 – Tuần 35',
    durationText: '20 tiết (Tiết 51 – Tiết 70)',
    totalPeriods: 20,
    adjustedContentSummary:
      'Tích hợp NLS (4.1.CB1a: Tuân thủ quy định bảo vệ thiết bị số trên sân tập như giữ khoảng cách bóng lăn, không ném bóng về phía máy tính/máy chiếu/điện thoại ghi hình).',
    lessons: [
      {
        id: 'g3-gdtc-cd4-b1',
        lessonCode: 'Tiết 51–54 (Tuần 26–27)',
        lessonTitle: 'Bài 1: Bài tập bổ trợ với bóng (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 26 – Tuần 27',
        requiredOutcome:
          'Thực hiện được các bài tập cảm giác bóng, lăn bóng, tung bắt bóng bổ trợ môn Bóng rổ.',
        integrationNote:
          'Tạo hứng thú và nâng cao khả năng kiểm soát bóng bằng hai tay.',
      },
      {
        id: 'g3-gdtc-cd4-b2',
        lessonCode: 'Tiết 55–58 (Tuần 28–29)',
        lessonTitle:
          'Bài 2: Bài tập dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 28 – Tuần 29',
        requiredOutcome:
          'Thực hiện được động tác dẫn bóng theo hướng thẳng và dẫn bóng đổi hướng qua cọc chuẩn.',
        integrationNote:
          'Tích hợp NLS (4.1.CB1a - Tiết 55, Tuần 28): Tuân thủ quy định bảo vệ thiết bị số trên sân tập (giữ khoảng cách bóng lăn, không ném bóng về phía máy tính/máy chiếu/điện thoại ghi hình).',
      },
      {
        id: 'g3-gdtc-cd4-b3',
        lessonCode: 'Tiết 59–63 (Tuần 30–32)',
        lessonTitle:
          'Bài 3: Động tác chuyền bóng bằng hai tay trước ngực (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 30 – Tuần 32',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật chuyền và bắt bóng bằng hai tay trước ngực phối hợp theo cặp, nhóm.',
        integrationNote:
          'Rèn luyện kỹ năng phối hợp đồng đội và phán đoán điểm rơi của bóng.',
      },
      {
        id: 'g3-gdtc-cd4-b4',
        lessonCode: 'Tiết 64–70 (Tuần 32–35)',
        lessonTitle:
          'Bài 4: Bài tập phối hợp dẫn bóng – ném rổ bằng hai tay trước ngực (Tiết 1–5), Ôn tập và kiểm tra đánh giá HKII (Tiết 69) & Tổng kết năm học (Tiết 70)',
        periods: 7,
        weekLabel: 'Tuần 32 – Tuần 35',
        requiredOutcome:
          'Thực hiện được chuỗi phối hợp dẫn bóng – dừng hai bước – ném rổ bằng hai tay trước ngực; hoàn thành đánh giá cuối năm học.',
        integrationNote:
          'Tổng kết và đánh giá sự phát triển thể lực, kỹ năng bóng rổ lớp 3.',
      },
    ],
    outcomes: [
      'Nắm vững kỹ thuật dẫn bóng thẳng/đổi hướng, chuyền bóng hai tay trước ngực và phối hợp dẫn bóng – ném rổ.',
      'Thực hiện liên hoàn động tác dẫn bóng kết hợp dừng và ném rổ hai tay trước ngực đúng luật cơ bản.',
      'Vận dụng kỹ năng bóng rổ vào trò chơi thi đấu tập thể an toàn, bảo vệ thiết bị sân bãi.',
    ],
  }),
];

// ============================================================================
// KHỐI 4 - GIÁO DỤC THỂ CHẤT 4 (70 TIẾT / 35 TUẦN, 02 TIẾT/TUẦN)
// ============================================================================
export const GRADE4_GDTC_TOPICS: CurriculumTopic[] = [
  buildPrimaryGdtcTopic({
    id: 'g4-gdtc-2026-hk1-cd1',
    grade: 'Lớp 4',
    semester: 'HK1',
    chapterCode: 'GDTC4-CĐ1',
    chapterTitle: 'Chủ đề 1: Đội hình đội ngũ (14 tiết)',
    topicTitle: 'Đi đều vòng bên phải, đi đều vòng bên trái, đi đều vòng sau',
    weekRange: 'Tuần 1 – Tuần 7',
    durationText: '14 tiết (Tiết 1 – Tiết 14)',
    totalPeriods: 14,
    adjustedContentSummary:
      'Tích hợp AI (4.A1.1: Nhận biết ứng dụng tạo nhịp/mô phỏng đội hình trên máy tính là công cụ hỗ trợ luyện tập đi đều vòng phải, không thay thế việc rèn luyện thực tế trên sân); ATGT (đi đúng hàng, giữ khoảng cách, quan sát hướng di chuyển).',
    lessons: [
      {
        id: 'g4-gdtc-cd1-b1',
        lessonCode: 'Tiết 1–5 (Tuần 1–3)',
        lessonTitle: 'Bài 1: Đi đều vòng bên phải (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 1 – Tuần 3',
        requiredOutcome:
          'Biết khẩu lệnh và thực hiện đúng kỹ thuật đi đều vòng bên phải cá nhân và trong đội hình hàng dọc, giữ đúng nhịp 1–2.',
        integrationNote:
          'Tích hợp AI (4.A1.1 - Tiết 5, Tuần 3): Nhận biết ứng dụng tạo nhịp/mô phỏng đội hình trên máy tính là công cụ hỗ trợ luyện tập đi đều vòng phải, không thay thế việc rèn luyện thực tế trên sân.',
      },
      {
        id: 'g4-gdtc-cd1-b2',
        lessonCode: 'Tiết 6–10 (Tuần 3–5)',
        lessonTitle: 'Bài 2: Đi đều vòng bên trái (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 3 – Tuần 5',
        requiredOutcome:
          'Thực hiện đúng khẩu lệnh và động tác đi đều vòng bên trái đều nhịp, thẳng hàng.',
        integrationNote:
          'Phối hợp nhịp bước chân làm trụ khi chuyển hướng vòng trái.',
      },
      {
        id: 'g4-gdtc-cd1-b3',
        lessonCode: 'Tiết 11–14 (Tuần 6–7)',
        lessonTitle: 'Bài 3: Đi đều vòng sau (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 6 – Tuần 7',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật đi đều vòng sau theo khẩu lệnh và hoàn thành kiểm tra chủ đề Đội hình đội ngũ.',
        integrationNote:
          'Tích hợp ATGT (Tiết 11 - Tuần 6): Biết đi đúng hàng, giữ khoảng cách, quan sát hướng di chuyển và không chen lấn; liên hệ chấp hành tín hiệu khi tham gia giao thông.',
      },
    ],
    outcomes: [
      'Phân biệt khẩu lệnh và kỹ thuật bước chân trụ khi đi đều vòng bên phải, vòng bên trái và vòng sau.',
      'Thực hiện đúng nhịp 1–2 và giữ cự ly đội hình khi đi đều chuyển hướng.',
      'Rèn luyện tác phong kỷ luật, nghiêm túc trong nghi thức Đội và chấp hành trật tự an toàn giao thông.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g4-gdtc-2026-hk1-cd2',
    grade: 'Lớp 4',
    semester: 'HK1',
    chapterCode: 'GDTC4-CĐ2',
    chapterTitle: 'Chủ đề 2: Bài thể dục phát triển chung với vòng (10 tiết)',
    topicTitle:
      '8 động tác Bài thể dục phát triển chung với vòng (Vươn thở, Tay, Chân, Lườn, Lưng – bụng, Toàn thân, Nhảy, Điều hòa)',
    weekRange: 'Tuần 8 – Tuần 12',
    durationText: '10 tiết (Tiết 15 – Tiết 24)',
    totalPeriods: 10,
    adjustedContentSummary:
      'Tích hợp NLS (1.3.CB2a: Ghi lại và đọc đúng bảng tổng hợp thứ tự 8 động tác bài thể dục với vòng; 5.1.CB2a: Biết xử lí tình huống đơn giản khi xem video hướng dẫn như tua lại đoạn động tác nhảy với vòng); BVMT; KNS (tự đánh giá trung thực, nhận ra điểm tiến bộ và đặt mục tiêu).',
    lessons: [
      {
        id: 'g4-gdtc-cd2-b1',
        lessonCode: 'Tiết 15–16 (Tuần 8)',
        lessonTitle:
          'Bài 1: Động tác vươn thở, động tác tay, động tác chân với vòng (Tiết 1–2)',
        periods: 2,
        weekLabel: 'Tuần 8',
        requiredOutcome:
          'Thực hiện đúng cách cầm vòng và kỹ thuật động tác vươn thở, động tác tay, động tác chân với vòng.',
        integrationNote:
          'Tích hợp NLS (1.3.CB2a - Tiết 15, Tuần 8): Ghi lại và đọc đúng bảng tổng hợp thứ tự 8 động tác bài thể dục với vòng trên phiếu học tập số của tổ.',
      },
      {
        id: 'g4-gdtc-cd2-b2',
        lessonCode: 'Tiết 17–20 (Tuần 9–10)',
        lessonTitle:
          'Bài 2: Động tác lườn, động tác lưng – bụng, động tác toàn thân với vòng (Tiết 1–3) & Ôn 6 động tác với vòng (Tiết 1)',
        periods: 4,
        weekLabel: 'Tuần 9 – Tuần 10',
        requiredOutcome:
          'Thực hiện đúng động tác lườn, lưng – bụng, toàn thân với vòng và liên kết ôn tập 6 động tác đầu tiên.',
        integrationNote:
          'Rèn luyện độ mềm dẻo cột sống và phối hợp tay cầm vòng đúng mặt phẳng.',
      },
      {
        id: 'g4-gdtc-cd2-b3',
        lessonCode: 'Tiết 21–24 (Tuần 11–12)',
        lessonTitle:
          'Bài 3: Động tác nhảy, động tác điều hòa với vòng (Tiết 1–2) & Hoàn thiện Bài Thể Dục với vòng (Tiết 1–2)',
        periods: 4,
        weekLabel: 'Tuần 11 – Tuần 12',
        requiredOutcome:
          'Thực hiện đúng động tác nhảy, điều hòa với vòng và hoàn thiện cả 8 động tác bài thể dục phát triển chung với vòng.',
        integrationNote:
          'Tích hợp NLS (5.1.CB2a - Tiết 21, Tuần 11): Biết xử lí tình huống đơn giản khi xem video hướng dẫn (tạm dừng, tua lại đoạn động tác nhảy với vòng hoặc điều chỉnh âm lượng vừa đủ nghe). Tích hợp BVMT (Tiết 22, Tuần 11): Giữ vệ sinh sân tập, sử dụng vòng đúng mục đích, xếp gọn gàng sau giờ học. Tích hợp KNS (Tiết 23, Tuần 12): Biết tự đánh giá trung thực, nhận ra điểm tiến bộ, điểm cần cố gắng và đặt mục tiêu rèn luyện phù hợp.',
      },
    ],
    outcomes: [
      'Nhớ tên, thứ tự 8 động tác và cách cầm vòng đúng kỹ thuật.',
      'Thực hiện đúng biên độ, phương hướng và nhịp điệu 8 động tác bài thể dục với vòng.',
      'Biết bảo quản dụng cụ vòng tập, tự đánh giá kết quả tập luyện và hỗ trợ bạn cùng tiến bộ.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g4-gdtc-2026-hk1-cd3',
    grade: 'Lớp 4',
    semester: 'HK1',
    chapterCode: 'GDTC4-CĐ3-P1',
    chapterTitle:
      'Chủ đề 3: Bài tập rèn luyện tư thế và kỹ năng vận động cơ bản – Phần 1 (12 tiết)',
    topicTitle:
      'Bài tập rèn luyện kĩ năng thăng bằng; Bài tập rèn luyện kĩ năng bật xa (Phần 1) & Ôn tập, Đánh giá HKI',
    weekRange: 'Tuần 13 – Tuần 18',
    durationText: '12 tiết (Tiết 25 – Tiết 36)',
    totalPeriods: 12,
    adjustedContentSummary:
      'Tích hợp GDQP-AN (rèn ý thức thực hiện nhiệm vụ nghiêm túc, trung thực, chấp hành yêu cầu và có trách nhiệm với kết quả của bản thân).',
    lessons: [
      {
        id: 'g4-gdtc-cd3-b1',
        lessonCode: 'Tiết 25–30 (Tuần 13–15)',
        lessonTitle:
          'Bài 1: Bài tập rèn luyện kĩ năng thăng bằng (Đi kiễng gót trên vạch kẻ thẳng, đi trên ghế thể dục, đứng một chân giữ thăng bằng) (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 13 – Tuần 15',
        requiredOutcome:
          'Thực hiện vững vàng các bài tập rèn luyện kỹ năng thăng bằng tĩnh và thăng bằng động.',
        integrationNote:
          'Tích hợp GDQP-AN (Tiết 27 - Tuần 14): Rèn ý thức thực hiện nhiệm vụ nghiêm túc, trung thực, chấp hành yêu cầu và có trách nhiệm với kết quả của bản thân.',
      },
      {
        id: 'g4-gdtc-cd3-b2-hk1',
        lessonCode: 'Tiết 31–36 (Tuần 16–18)',
        lessonTitle:
          'Bài 2: Bài tập rèn luyện kĩ năng bật xa (Tiết 1–4), Ôn tập và đánh giá HKI (Tiết 35) & Sơ kết HKI (Tiết 36)',
        periods: 6,
        weekLabel: 'Tuần 16 – Tuần 18',
        requiredOutcome:
          'Thực hiện đúng các giai đoạn tạo đà, giậm nhảy hai chân, trên không và tiếp đất khuỵu gối giảm chấn động trong bật xa tại chỗ; hoàn thành đánh giá cuối HKI.',
        integrationNote:
          'Phát triển sức mạnh bột phát của hai chân và kỹ năng tiếp đất an toàn.',
      },
    ],
    outcomes: [
      'Nắm được yêu cầu kỹ thuật của các bài tập thăng bằng và bật xa tại chỗ.',
      'Thực hiện đúng kỹ thuật giữ thăng bằng và phối hợp đánh tay – giậm nhảy – tiếp đất trong bật xa.',
      'Rèn luyện tính kiên trì, trung thực và đảm bảo an toàn khi thực hiện các bài tập bật nhảy.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g4-gdtc-2026-hk2-cd3',
    grade: 'Lớp 4',
    semester: 'HK2',
    chapterCode: 'GDTC4-CĐ3-P2',
    chapterTitle:
      'Chủ đề 3: Bài tập rèn luyện tư thế và kỹ năng vận động cơ bản – Phần 2 (14 tiết)',
    topicTitle:
      'Bài tập rèn luyện kĩ năng bật xa (tiếp theo); Bài tập rèn luyện kĩ năng bật cao; Nhảy dây',
    weekRange: 'Tuần 19 – Tuần 25',
    durationText: '14 tiết (Tiết 37 – Tiết 50)',
    totalPeriods: 14,
    adjustedContentSummary:
      'Tích hợp KNS (tự đánh giá trung thực, nhận ra điểm tiến bộ và đặt mục tiêu rèn luyện); ATGT (quan sát khu vực phía trước, giữ khoảng cách, dừng đúng tín hiệu và không thực hiện động tác ở lòng đường).',
    lessons: [
      {
        id: 'g4-gdtc-cd3-b2-hk2',
        lessonCode: 'Tiết 37–38 (Tuần 19)',
        lessonTitle:
          'Bài 2: Bài tập rèn luyện kĩ năng bật xa (Tiết 5–6: Phối hợp chạy đà bật xa và trò chơi vận động)',
        periods: 2,
        weekLabel: 'Tuần 19',
        requiredOutcome:
          'Thực hiện hoàn chỉnh bài tập bật xa và phối hợp di chuyển bật xa an toàn.',
        integrationNote:
          'Củng cố sức bật và kỹ năng khuỵu gối hoãn xung khi tiếp đất.',
      },
      {
        id: 'g4-gdtc-cd3-b3',
        lessonCode: 'Tiết 39–44 (Tuần 20–22)',
        lessonTitle:
          'Bài 3: Bài tập rèn luyện kĩ năng bật cao (Tại chỗ bật cao, chạy đà bật cao chạm vật chuẩn) (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 20 – Tuần 22',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật tại chỗ bật cao và chạy đà nhẹ nhàng bật cao bằng một hoặc hai chân chạm vật chuẩn.',
        integrationNote:
          'Tích hợp KNS (Tiết 40 - Tuần 20): Biết tự đánh giá trung thực, nhận ra điểm tiến bộ, điểm cần cố gắng và đặt mục tiêu rèn luyện phù hợp. Tích hợp ATGT (Tiết 43 - Tuần 22): Biết quan sát khu vực phía trước, giữ khoảng cách, dừng đúng tín hiệu và không thực hiện động tác ở lòng đường hoặc nơi có phương tiện qua lại.',
      },
      {
        id: 'g4-gdtc-cd3-b4',
        lessonCode: 'Tiết 45–50 (Tuần 23–25)',
        lessonTitle:
          'Bài 4: Nhảy dây (Nhảy dây kiểu chụm hai chân, nhảy dây kiểu chân trước chân sau) (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 23 – Tuần 25',
        requiredOutcome:
          'Thực hiện được kỹ thuật so dây, trao dây và nhảy dây kiểu chụm hai chân, kiểu chân trước chân sau liên tục.',
        integrationNote:
          'Phát triển sức bền, sự khéo léo cổ tay và cảm giác nhịp điệu.',
      },
    ],
    outcomes: [
      'Nhận biết kỹ thuật bật xa, bật cao và nhảy dây cá nhân (kiểu chụm hai chân, chân trước chân sau).',
      'Thực hiện đúng kỹ thuật bật cao, bật xa và nhảy dây liên tục nhiều lần không vướng dây.',
      'Tự giác rèn luyện nhảy dây ngoài giờ học để nâng cao sức bền và sự nhanh nhẹn.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g4-gdtc-2026-hk2-cd4',
    grade: 'Lớp 4',
    semester: 'HK2',
    chapterCode: 'GDTC4-CĐ4',
    chapterTitle: 'Chủ đề 4: Môn thể thao tự chọn – Bóng rổ (20 tiết)',
    topicTitle:
      'Tăng khả năng điều khiển bóng; Tại chỗ dẫn bóng chữ V và dẫn bóng vượt chướng ngại vật; Chuyền, bắt bóng bật sàn hai tay trước ngực; Ném rổ một tay trên vai',
    weekRange: 'Tuần 26 – Tuần 35',
    durationText: '20 tiết (Tiết 51 – Tiết 70)',
    totalPeriods: 20,
    adjustedContentSummary:
      'Tích hợp NLS (1.3.CB2a: Ghi chép số lần điều khiển bóng thành công vào bảng theo dõi của nhóm; 4.3.CB2a: Giữ cân bằng giữa thời gian xem video mẫu và thời gian vận động thực tế ngoài sân); BVMT; AI (4.A3.1: Nhận biết phần mềm hỗ trợ chỉ nhận diện hình ảnh chuyển động, không có cảm xúc hay ý thức); GDQP-AN.',
    lessons: [
      {
        id: 'g4-gdtc-cd4-b1',
        lessonCode: 'Tiết 51–55 (Tuần 26–28)',
        lessonTitle:
          'Bài 1: Các động tác làm tăng khả năng điều khiển bóng (Chuyền bóng quanh thân, lăn bóng số 8, tung – bắt bóng biến đổi) (Tiết 1–5)',
        periods: 5,
        weekLabel: 'Tuần 26 – Tuần 28',
        requiredOutcome:
          'Thực hiện thuần thục các bài tập làm tăng cảm giác và khả năng điều khiển bóng rổ bằng hai tay.',
        integrationNote:
          'Tích hợp NLS (1.3.CB2a - Tiết 51, Tuần 26): Ghi chép số lần điều khiển bóng thành công vào bảng theo dõi của nhóm để so sánh sự tiến bộ qua các lượt tập. Tích hợp BVMT (Tiết 53, Tuần 27): Giữ vệ sinh sân tập, sử dụng bóng đúng mục đích; kiểm đếm và xếp bóng, cọc, rổ gọn gàng sau giờ học.',
      },
      {
        id: 'g4-gdtc-cd4-b2',
        lessonCode: 'Tiết 56–59 (Tuần 28–30)',
        lessonTitle:
          'Bài 2: Động tác tại chỗ dẫn bóng theo hình chữ V, dẫn bóng vượt chướng ngại vật (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 28 – Tuần 30',
        requiredOutcome:
          'Thực hiện được động tác tại chỗ dẫn bóng luân phiên hai tay theo hình chữ V và dẫn bóng di chuyển vượt qua chướng ngại vật.',
        integrationNote:
          'Tích hợp AI (4.A3.1 - Tiết 57, Tuần 29): Hiểu rằng phần mềm hỗ trợ đếm số lần dẫn bóng chữ V chỉ nhận diện hình ảnh chuyển động, không có cảm xúc hay ý thức như giáo viên và bạn học.',
      },
      {
        id: 'g4-gdtc-cd4-b3',
        lessonCode: 'Tiết 60–63 (Tuần 30–32)',
        lessonTitle:
          'Bài 3: Động tác chuyền, bắt bóng bật sàn bằng hai tay trước ngực (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 30 – Tuần 32',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật chuyền bóng bật sàn bằng hai tay trước ngực và bắt bóng nảy từ sàn.',
        integrationNote:
          'Tích hợp NLS (4.3.CB2a - Tiết 60, Tuần 30): Biết giữ cân bằng giữa thời gian xem video mẫu và thời gian vận động thực tế ngoài sân để bảo vệ thị lực và nâng cao thể lực. Tích hợp GDQP-AN (Tiết 62, Tuần 31): Rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp đồng đội và bình tĩnh xử lí tình huống.',
      },
      {
        id: 'g4-gdtc-cd4-b4',
        lessonCode: 'Tiết 64–70 (Tuần 32–35)',
        lessonTitle:
          'Bài 4: Động tác ném rổ bằng một tay trên vai (Tiết 1–5), Ôn tập và kiểm tra đánh giá HKII (Tiết 69) & Tổng kết năm học (Tiết 70)',
        periods: 7,
        weekLabel: 'Tuần 32 – Tuần 35',
        requiredOutcome:
          'Thực hiện được kỹ thuật tại chỗ ném rổ bằng một tay trên vai; hoàn thành kiểm tra đánh giá cuối năm học.',
        integrationNote:
          'Phát triển kỹ năng phối hợp lực đạp chân, duỗi tay và gập cổ tay khi ném rổ.',
      },
    ],
    outcomes: [
      'Nắm được kỹ thuật dẫn bóng chữ V, dẫn bóng vượt vật cản, chuyền bóng bật sàn và ném rổ một tay trên vai.',
      'Thực hiện đúng kỹ thuật cơ bản các động tác bóng rổ lớp 4 trong tập luyện cá nhân và phối hợp nhóm.',
      'Có ý thức kỷ luật, tinh thần đồng đội, bảo quản dụng cụ và cân bằng thời gian vận động thể chất.',
    ],
  }),
];

// ============================================================================
// KHỐI 5 - GIÁO DỤC THỂ CHẤT 5 (70 TIẾT / 35 TUẦN, 02 TIẾT/TUẦN)
// ============================================================================
export const GRADE5_GDTC_TOPICS: CurriculumTopic[] = [
  buildPrimaryGdtcTopic({
    id: 'g5-gdtc-2026-hk1-cd1',
    grade: 'Lớp 5',
    semester: 'HK1',
    chapterCode: 'GDTC5-CĐ1',
    chapterTitle: 'Chủ đề 1: Đội hình đội ngũ (14 tiết)',
    topicTitle:
      'Phối hợp đội hình hàng dọc, quay các hướng, hàng ngang; Phối hợp biến đổi đội hình hàng dọc – vòng tròn – hàng ngang; Phối hợp đi đều vòng các hướng',
    weekRange: 'Tuần 1 – Tuần 7',
    durationText: '14 tiết (Tiết 1 – Tiết 14)',
    totalPeriods: 14,
    adjustedContentSummary:
      'Tích hợp KNS (lắng nghe hiệu lệnh, chờ đến lượt, phối hợp nhóm và nhắc bạn lịch sự); BVMT (giữ vệ sinh sân tập, sử dụng dụng cụ tiết kiệm, thu dọn gọn gàng); AI (5.A1.1: So sánh được sự khác nhau giữa việc học sinh tự nghe khẩu lệnh, quan sát đội hình để điều chỉnh bước đi với ứng dụng chỉ phát nhịp tự động theo cài đặt sẵn).',
    lessons: [
      {
        id: 'g5-gdtc-cd1-b1',
        lessonCode: 'Tiết 1–4 (Tuần 1–2)',
        lessonTitle:
          'Bài 1: Bài tập phối hợp đội hình hàng dọc, quay các hướng và đội hình hàng ngang (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 1 – Tuần 2',
        requiredOutcome:
          'Thực hiện thuần thục chuỗi bài tập phối hợp tập hợp đội hình hàng dọc, quay các hướng và đội hình hàng ngang đúng khẩu lệnh.',
        integrationNote:
          'Rèn luyện tác phong chỉ huy của cán sự lớp và sự phối hợp đồng đều của toàn đội hình.',
      },
      {
        id: 'g5-gdtc-cd1-b2',
        lessonCode: 'Tiết 5–10 (Tuần 3–5)',
        lessonTitle:
          'Bài 2: Bài tập phối hợp biến đổi đội hình hàng dọc – vòng tròn – hàng ngang; 1 hàng dọc – 2 hàng dọc – 1 vòng tròn – 2 vòng tròn; 1 hàng ngang – 3 hàng ngang – 1 vòng tròn và ngược lại (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 3 – Tuần 5',
        requiredOutcome:
          'Thực hiện chính xác các bài tập phối hợp biến đổi liên hoàn giữa đội hình hàng dọc, hàng ngang và vòng tròn (1–2–3 hàng/vòng tròn).',
        integrationNote:
          'Tích hợp KNS (Tiết 6 - Tuần 3): Biết lắng nghe hiệu lệnh, chờ đến lượt, phối hợp với nhóm và nhắc bạn bằng lời lịch sự khi đội hình chưa đúng. Tích hợp BVMT (Tiết 8 - Tuần 4): Giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.',
      },
      {
        id: 'g5-gdtc-cd1-b3',
        lessonCode: 'Tiết 11–14 (Tuần 6–7)',
        lessonTitle:
          'Bài 3: Bài tập phối hợp đi đều vòng các hướng; phối hợp giậm chân tại chỗ, đi đều, đi đều vòng sau (Tiết 1–4)',
        periods: 4,
        weekLabel: 'Tuần 6 – Tuần 7',
        requiredOutcome:
          'Thực hiện đúng nhịp và giữ cự ly đội hình trong bài tập phối hợp giậm chân tại chỗ, đi đều và đi đều vòng các hướng (phải, trái, sau).',
        integrationNote:
          'Tích hợp AI (5.A1.1 - Tiết 13, Tuần 7): So sánh được sự khác nhau giữa việc học sinh tự nghe khẩu lệnh, quan sát đội hình để điều chỉnh bước đi với ứng dụng chỉ phát nhịp tự động theo cài đặt sẵn.',
      },
    ],
    outcomes: [
      'Nắm vững khẩu lệnh và quy trình biến đổi liên hoàn các đội hình hàng dọc, hàng ngang, vòng tròn và đi đều vòng các hướng.',
      'Thực hiện thuần thục, đều, đẹp các bài tập phối hợp đội hình đội ngũ lớp 5.',
      'Phát huy năng lực tự quản, chỉ huy đội hình và tinh thần kỷ luật tập thể.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g5-gdtc-2026-hk1-cd2',
    grade: 'Lớp 5',
    semester: 'HK1',
    chapterCode: 'GDTC5-CĐ2',
    chapterTitle: 'Chủ đề 2: Bài tập thể dục với gậy (10 tiết)',
    topicTitle:
      '8 động tác Bài thể dục phát triển chung với gậy (Vươn thở, Tay, Chân, Bụng, Vặn mình, Toàn thân, Nhảy, Điều hòa)',
    weekRange: 'Tuần 8 – Tuần 12',
    durationText: '10 tiết (Tiết 15 – Tiết 24)',
    totalPeriods: 10,
    adjustedContentSummary:
      'Tích hợp NLS (1.1TC1a: Quan sát video/hình ảnh mẫu để nhận biết cách cầm gậy và phương hướng đúng; 6.1TC2a: Nhận biết ứng dụng đếm nhịp hoặc phát nhạc có thể hỗ trợ tập đều nhịp nhưng không thay thế sự cố gắng tự tập); GDQP-AN; ATGT.',
    lessons: [
      {
        id: 'g5-gdtc-cd2-b1',
        lessonCode: 'Tiết 15–16 (Tuần 8)',
        lessonTitle:
          'Bài 1: Động tác vươn thở, động tác tay, động tác chân với gậy (Tiết 1–2)',
        periods: 2,
        weekLabel: 'Tuần 8',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật cầm gậy và thực hiện động tác vươn thở, động tác tay, động tác chân với gậy.',
        integrationNote:
          'Tích hợp NLS (1.1TC1a - Tiết 16, Tuần 8): Quan sát video/hình ảnh mẫu để nhận biết cách cầm gậy và phương hướng đúng của động tác vươn thở, tay, chân.',
      },
      {
        id: 'g5-gdtc-cd2-b2',
        lessonCode: 'Tiết 17–19 (Tuần 9–10)',
        lessonTitle:
          'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (Tiết 1–3)',
        periods: 3,
        weekLabel: 'Tuần 9 – Tuần 10',
        requiredOutcome:
          'Thực hiện đúng biên độ, phương hướng động tác bụng, động tác vặn mình, động tác toàn thân với gậy.',
        integrationNote:
          'Tích hợp NLS (6.1TC2a - Tiết 17, Tuần 9): Nhận biết ứng dụng đếm nhịp hoặc phát nhạc trên thiết bị thông minh có thể hỗ trợ cả lớp tập đều nhịp hơn nhưng không thay thế sự cố gắng tự tập luyện.',
      },
      {
        id: 'g5-gdtc-cd2-b3',
        lessonCode: 'Tiết 20–24 (Tuần 10–12)',
        lessonTitle:
          'Bài 3: Động tác nhảy, động tác điều hòa với gậy (Tiết 20–21) & Ôn tập bài thể dục phát triển chung với gậy (Tiết 22–24)',
        periods: 5,
        weekLabel: 'Tuần 10 – Tuần 12',
        requiredOutcome:
          'Thực hiện đúng động tác nhảy, điều hòa với gậy và liên kết hoàn chỉnh 8 động tác bài thể dục phát triển chung với gậy.',
        integrationNote:
          'Tích hợp GDQP-AN (Tiết 21 - Tuần 11): Rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, bình tĩnh xử lí tình huống và phối hợp hỗ trợ đồng đội. Tích hợp ATGT (Tiết 23 - Tuần 12): Biết di chuyển trật tự, giữ khoảng cách, quan sát xung quanh và chấp hành tín hiệu khi ra vào sân tập; liên hệ đi bộ, qua đường an toàn.',
      },
    ],
    outcomes: [
      'Nhớ tên, thứ tự 8 động tác và quy tắc cầm gậy thể dục an toàn.',
      'Thực hiện đúng biên độ, phương hướng và nhịp điệu 8 động tác bài thể dục với gậy theo nhạc/nhịp hô.',
      'Giữ khoảng cách an toàn khi tập luyện với gậy thể dục và bảo quản dụng cụ sau giờ học.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g5-gdtc-2026-hk1-cd3',
    grade: 'Lớp 5',
    semester: 'HK1',
    chapterCode: 'GDTC5-CĐ3-P1',
    chapterTitle:
      'Chủ đề 3: Tư thế và kĩ năng vận động cơ bản – Phần 1 (12 tiết)',
    topicTitle:
      'Bài tập lăn phải/trái nửa vòng và một vòng; Bài tập rèn luyện kĩ năng lộn xuôi (Phần 1) & Ôn tập, Sơ kết Học kì I',
    weekRange: 'Tuần 13 – Tuần 18',
    durationText: '12 tiết (Tiết 25 – Tiết 36)',
    totalPeriods: 12,
    adjustedContentSummary:
      'Rèn luyện kỹ năng lăn phải/trái nửa vòng, một vòng và kỹ năng lộn xuôi trên đệm thể dục đảm bảo tuyệt đối an toàn, khởi động kỹ khớp cổ, lưng.',
    lessons: [
      {
        id: 'g5-gdtc-cd3-b1',
        lessonCode: 'Tiết 25–30 (Tuần 13–15)',
        lessonTitle:
          'Bài 1: Bài tập lăn phải nửa vòng, lăn trái nửa vòng; lăn phải một vòng, lăn trái một vòng (Tiết 1–6)',
        periods: 6,
        weekLabel: 'Tuần 13 – Tuần 15',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật lăn phải/trái nửa vòng và lăn phải/trái một vòng trên đệm đúng hướng, giữ trục cơ thể thẳng.',
        integrationNote:
          'Tuân thủ nghiêm ngặt quy định an toàn khi tập luyện trên đệm thể dục.',
      },
      {
        id: 'g5-gdtc-cd3-b2-hk1',
        lessonCode: 'Tiết 31–36 (Tuần 16–18)',
        lessonTitle:
          'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 31–34), Ôn tập Học kỳ 1 (Tiết 35) & Sơ kết Học kỳ I (Tiết 36)',
        periods: 6,
        weekLabel: 'Tuần 16 – Tuần 18',
        requiredOutcome:
          'Biết tư thế chuẩn bị, cúi đầu thu cằm sát ngực, đặt gáy lên đệm và thực hiện kỹ năng lộn xuôi có sự hỗ trợ/bảo hiểm; hoàn thành đánh giá cuối HKI.',
        integrationNote:
          'Rèn luyện lòng dũng cảm, sự mềm dẻo và kỹ năng tự bảo hiểm an toàn.',
      },
    ],
    outcomes: [
      'Nắm vững yêu cầu kỹ thuật và quy tắc an toàn khi thực hiện động tác lăn nửa vòng, một vòng và lộn xuôi.',
      'Thực hiện đúng kỹ thuật lăn ngang trên đệm và lộn xuôi thu tròn lưng, cằm sát ngực.',
      'Biết chờ lượt, hỗ trợ bảo hiểm cho bạn và tuân thủ tuyệt đối hiệu lệnh của giáo viên.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g5-gdtc-2026-hk2-cd3',
    grade: 'Lớp 5',
    semester: 'HK2',
    chapterCode: 'GDTC5-CĐ3-P2',
    chapterTitle:
      'Chủ đề 3: Tư thế và kĩ năng vận động cơ bản – Phần 2 (14 tiết)',
    topicTitle:
      'Ôn kĩ năng lộn xuôi; Leo từng chân và leo đổi chân luân phiên lên, xuống thang chữ A; Trèo qua vật cản, trèo qua thang chữ A và phối hợp',
    weekRange: 'Tuần 19 – Tuần 25',
    durationText: '14 tiết (Tiết 37 – Tiết 50)',
    totalPeriods: 14,
    adjustedContentSummary:
      'Tích hợp NLS (1.1TC1a: Quan sát hình ảnh/video hướng dẫn cách đặt tay, đặt chân trên thang chữ A để nắm đúng quy tắc an toàn trước khi thực hành); KNS (bình tĩnh, tự đánh giá khả năng, chờ đến lượt, chủ động xin hỗ trợ và động viên bạn); GDQP-AN.',
    lessons: [
      {
        id: 'g5-gdtc-cd3-b2-hk2',
        lessonCode: 'Tiết 37–38 (Tuần 19)',
        lessonTitle:
          'Bài 2 (tiếp theo): Ôn bài tập rèn luyện kĩ năng lộn xuôi & Trò chơi vận động (Tiết 37–38)',
        periods: 2,
        weekLabel: 'Tuần 19',
        requiredOutcome:
          'Hoàn thiện kỹ năng lộn xuôi trên đệm ổn định, đúng tư thế kết thúc.',
        integrationNote:
          'Củng cố khả năng định hướng cơ thể trong không gian.',
      },
      {
        id: 'g5-gdtc-cd3-b3',
        lessonCode: 'Tiết 39–44 (Tuần 20–22)',
        lessonTitle:
          'Bài 3: Bài tập leo từng chân lên xuống thang chữ A; leo đổi chân luân phiên lên, xuống thang chữ A (Tiết 39–44)',
        periods: 6,
        weekLabel: 'Tuần 20 – Tuần 22',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật phối hợp tay nắm gióng thang và chân bước leo từng chân, leo đổi chân luân phiên lên, xuống thang chữ A an toàn.',
        integrationNote:
          'Tích hợp NLS (1.1TC1a - Tiết 39, Tuần 20): Quan sát hình ảnh/video hướng dẫn cách đặt tay, đặt chân trên thang chữ A để nắm đúng quy tắc an toàn trước khi thực hành. Tích hợp KNS (Tiết 42 - Tuần 21): Biết bình tĩnh, tự đánh giá khả năng, chờ đến lượt, chủ động xin hỗ trợ khi cần và động viên bạn khi vượt vật cản. Tích hợp GDQP-AN (Tiết 44 - Tuần 22): Rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, bình tĩnh xử lí tình huống và phối hợp hỗ trợ đồng đội.',
      },
      {
        id: 'g5-gdtc-cd3-b4',
        lessonCode: 'Tiết 45–50 (Tuần 23–25)',
        lessonTitle:
          'Bài 4: Bài tập trèo qua vật cản, trèo qua thang chữ A và phối hợp trèo qua vật cản và thang chữ A (Tiết 45–50)',
        periods: 6,
        weekLabel: 'Tuần 23 – Tuần 25',
        requiredOutcome:
          'Thực hiện được kỹ thuật trèo qua vật cản, trèo qua thang chữ A và bài tập phối hợp liên hoàn đảm bảo an toàn.',
        integrationNote:
          'Phát triển sức mạnh tay, chân, sự khéo léo và lòng tự tin vượt thử thách.',
      },
    ],
    outcomes: [
      'Nắm vững quy tắc an toàn (3 điểm tiếp xúc) khi leo, trèo thang chữ A và vượt vật cản.',
      'Thực hiện đúng kỹ thuật leo từng chân, leo đổi chân luân phiên và phối hợp trèo qua vật cản – thang chữ A.',
      'Rèn luyện bản lĩnh bình tĩnh, kỷ luật và biết hỗ trợ đồng đội đảm bảo an toàn tuyệt đối.',
    ],
  }),
  buildPrimaryGdtcTopic({
    id: 'g5-gdtc-2026-hk2-cd4',
    grade: 'Lớp 5',
    semester: 'HK2',
    chapterCode: 'GDTC5-CĐ4',
    chapterTitle:
      'Phần 4 – Chủ đề 1: Thể thao tự chọn (TTTC) – Môn Bóng rổ (20 tiết)',
    topicTitle:
      'Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng bên phải/trái; Chuyền và bắt bóng bằng hai tay trên cao; Động tác hai bước ném rổ một tay trên vai',
    weekRange: 'Tuần 26 – Tuần 35',
    durationText: '20 tiết (Tiết 51 – Tiết 70)',
    totalPeriods: 20,
    adjustedContentSummary:
      'Tích hợp NLS (5.2TC1a: Xem lại đoạn video ngắn ghi động tác dẫn bóng thay đổi tốc độ của nhóm để tự nhận xét tư thế tay và khoảng cách bóng); BVMT; ATGT; AI (5.B1.2: Nêu được rằng dữ liệu đầu vào như chiều cao học sinh, khoảng cách đứng và số lần chuyền bóng chính xác giúp hệ thống gợi ý bài tập phù hợp hơn).',
    lessons: [
      {
        id: 'g5-gdtc-cd4-b1',
        lessonCode: 'Tiết 51–56 (Tuần 26–28)',
        lessonTitle:
          'Bài 1: Dẫn bóng thay đổi tốc độ; dẫn bóng theo đường vòng bên phải, bên trái (Tiết 51–56)',
        periods: 6,
        weekLabel: 'Tuần 26 – Tuần 28',
        requiredOutcome:
          'Thực hiện được kỹ thuật dẫn bóng thay đổi tốc độ (chậm – nhanh – chậm) và dẫn bóng theo đường vòng bên phải, bên trái.',
        integrationNote:
          'Tích hợp NLS (5.2TC1a - Tiết 51, Tuần 26): Xem lại đoạn video ngắn ghi động tác dẫn bóng thay đổi tốc độ của nhóm để tự nhận xét tư thế tay và khoảng cách bóng. Tích hợp BVMT (Tiết 52 - Tuần 26): Giữ vệ sinh sân tập, sử dụng bóng đúng mục đích; kiểm đếm, thu gom và xếp bóng, dụng cụ gọn gàng sau giờ học. Tích hợp ATGT (Tiết 56 - Tuần 28): Biết chơi bóng trong khu vực quy định, quan sát trước khi đổi hướng và không chạy theo bóng ra đường hoặc nơi có phương tiện qua lại.',
      },
      {
        id: 'g5-gdtc-cd4-b2',
        lessonCode: 'Tiết 57–60 (Tuần 29–30)',
        lessonTitle:
          'Bài 2: Động tác chuyền bóng bằng hai tay trên cao; bắt bóng bằng hai tay trên cao (Tiết 57–60)',
        periods: 4,
        weekLabel: 'Tuần 29 – Tuần 30',
        requiredOutcome:
          'Thực hiện đúng kỹ thuật chuyền bóng bằng hai tay trên đầu (trên cao) và bắt bóng bằng hai tay trên cao phối hợp theo cặp, nhóm.',
        integrationNote:
          'Tích hợp AI (5.B1.2 - Tiết 57, Tuần 29): Nêu được rằng dữ liệu đầu vào như chiều cao học sinh, khoảng cách đứng và số lần chuyền bóng chính xác giúp hệ thống gợi ý bài tập phù hợp hơn.',
      },
      {
        id: 'g5-gdtc-cd4-b3',
        lessonCode: 'Tiết 61–70 (Tuần 31–35)',
        lessonTitle:
          'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 61–68), Ôn tập và kiểm tra học kì 2 (Tiết 69) & Tổng kết môn học (Tiết 70)',
        periods: 10,
        weekLabel: 'Tuần 31 – Tuần 35',
        requiredOutcome:
          'Thực hiện được nhịp bước 1–2 (hai bước lên rổ) kết hợp ném rổ bằng một tay trên vai; hoàn thành kiểm tra đánh giá cuối HKII và tổng kết chương trình GDTC cấp Tiểu học.',
        integrationNote:
          'Hoàn thiện kỹ năng vận động bóng rổ nâng cao và thi đấu tập thể lành mạnh.',
      },
    ],
    outcomes: [
      'Nắm vững kỹ thuật dẫn bóng thay đổi tốc độ, dẫn bóng đường vòng, chuyền – bắt bóng hai tay trên cao và hai bước ném rổ một tay trên vai.',
      'Thực hiện nhịp nhàng chuỗi phối hợp dẫn bóng – hai bước ném rổ một tay trên vai và chuyền bóng đồng đội.',
      'Vận dụng kỹ năng bóng rổ vào thi đấu giao hữu đúng luật, đoàn kết và an toàn.',
    ],
  }),
];
