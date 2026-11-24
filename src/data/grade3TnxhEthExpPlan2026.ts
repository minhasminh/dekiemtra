import { CurriculumTopic } from '../types/domain';
import { buildGrade3Topic } from './grade3TvAndMathPlan2026';

/**
 * 3. MÔN TỰ NHIÊN VÀ XÃ HỘI LỚP 3 (70 TIẾT / 35 TUẦN – 2 TIẾT/TUẦN)
 * HKI: 18 tuần = 36 tiết (Chủ đề 1, 2, 3, 4; Bài 1–17 + Ôn tập & Kiểm tra cuối HKI)
 * HKII: 17 tuần = 34 tiết (Chủ đề 5, 6; Bài 18–30 + Ôn tập & Kiểm tra cuối HKII)
 */
export const GRADE3_TNXH_TOPICS: CurriculumTopic[] = [
  buildGrade3Topic({
    id: 'nda-2026-g3-tnxh-cd1',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    chapterCode: 'TNXH3-CĐ1',
    chapterTitle: 'Chủ đề 1: Gia đình (Bài 1 – Bài 4)',
    topicTitle: 'Họ hàng nội, ngoại; Ngày đáng nhớ của gia đình; Phòng tránh hỏa hoạn khi ở nhà; Giữ vệ sinh xung quanh nhà',
    weekRange: 'Tuần 1 – Tuần 5',
    lessons: [
      {
        id: 'g3-tnxh-w1-2',
        week: '1–2',
        lessonName: 'Bài 1: Họ hàng nội, ngoại',
        subLessonName: 'Tiết 1, 2, 3 (Bài học STEM: Họ hàng nội, ngoại – 2 tiết)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Nêu được mối quan hệ họ hàng nội, ngoại; xưng hô đúng với các thành viên trong gia đình thuộc họ nội, họ ngoại; vẽ hoặc sử dụng sơ đồ giới thiệu gia đình và họ hàng nội, ngoại; bày tỏ tình cảm, sự gắn bó với họ hàng nội, ngoại. Thực hiện Bài học STEM: Họ hàng nội, ngoại (2 tiết). Tích hợp KNS: tự nhận thức và xác định giá trị bản thân; lắng nghe tích cực, trình bày suy nghĩ, ý tưởng về mối quan hệ họ hàng nội, ngoại.',
      },
      {
        id: 'g3-tnxh-w2-3',
        week: '2–3',
        lessonName: 'Bài 2: Ngày đáng nhớ của gia đình',
        subLessonName: 'Tiết 4, 5',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được tên một số ngày kỉ niệm hay sự kiện quan trọng của gia đình; nhận biết được sự thay đổi của gia đình theo thời gian thông qua sử dụng đường thời gian đơn giản; đưa ra được ý kiến tham gia chuẩn bị cho sự kiện của gia đình.',
      },
      {
        id: 'g3-tnxh-w3-4',
        week: '3–4',
        lessonName: 'Bài 3: Phòng tránh hỏa hoạn khi ở nhà',
        subLessonName: 'Tiết 6, 7',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được một số nguyên nhân dẫn đến cháy nhà và thiệt hại có thể xảy ra do hỏa hoạn; đưa ra được cách ứng xử phù hợp trong tình huống có cháy xảy ra và nhận xét cách ứng xử của người khác; điều tra phát hiện những thứ có thể gây cháy trong nhà và nói với người lớn có biện pháp phòng cháy. Tích hợp KNS: tìm kiếm và xử lí thông tin về thiệt hại do cháy; làm chủ bản thân, ứng phó khi có hỏa hoạn.',
      },
      {
        id: 'g3-tnxh-w4-5',
        week: '4–5',
        lessonName: 'Bài 4: Giữ vệ sinh xung quanh nhà',
        subLessonName: 'Tiết 8, 9, 10 (Tiết 1, 2 + Ôn tập Chủ đề Gia đình)',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Làm được một số việc phù hợp để giữ vệ sinh xung quanh nhà; giải thích được một cách đơn giản tại sao cần phải giữ vệ sinh xung quanh nhà. Tích hợp BVMT (Bộ phận): Giáo dục HS ý thức giữ vệ sinh xung quanh nhà ở để bảo vệ môi trường sống trong lành. Tích hợp KNS: hợp tác cùng mọi người giữ vệ sinh xung quanh nhà.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-tnxh-cd2',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    chapterCode: 'TNXH3-CĐ2',
    chapterTitle: 'Chủ đề 2: Trường học (Bài 5 – Bài 8)',
    topicTitle: 'Hoạt động kết nối với cộng đồng; Truyền thống trường em; Giữ an toàn và vệ sinh ở trường; Ôn tập Chủ đề Trường học',
    weekRange: 'Tuần 6 – Tuần 9',
    lessons: [
      {
        id: 'g3-tnxh-w6',
        week: '6',
        lessonName: 'Bài 5: Hoạt động kết nối với cộng đồng',
        subLessonName: 'Tiết 11, 12',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được tên và ý nghĩa một số hoạt động kết nối với xã hội của trường học; mô tả được hoạt động của bản thân khi tham gia một số hoạt động kết nối xã hội của nhà trường; thực hiện được việc giữ an toàn và vệ sinh khi tham gia hoạt động. Tích hợp BVMT (Liên hệ): Giáo dục HS ý thức giữ vệ sinh khi tham gia các hoạt động ở trường. Tích hợp GDĐP Chủ đề 3: Lễ hội truyền thống ở tỉnh Thừa Thiên Huế.',
      },
      {
        id: 'g3-tnxh-w7',
        week: '7',
        lessonName: 'Bài 6: Truyền thống trường em',
        subLessonName: 'Tiết 13, 14',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Giới thiệu được một cách đơn giản về truyền thống nhà trường; đặt được một số câu hỏi để tìm hiểu về truyền thống nhà trường; thể hiện được tình cảm kính trọng, biết ơn thầy cô giáo và yêu quý các bạn thông qua lời nói, việc làm cụ thể; giữ gìn và phát huy truyền thống tốt đẹp của trường.',
      },
      {
        id: 'g3-tnxh-w8',
        week: '8',
        lessonName: 'Bài 7: Giữ an toàn và vệ sinh ở trường',
        subLessonName: 'Tiết 15, 16',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Chỉ ra hoặc nêu được tên một số trang thiết bị trong trường học nếu sử dụng không cẩn thận có thể dẫn đến nguy cơ không an toàn; khảo sát về sự an toàn của trường học theo nhóm được phân công; làm được việc phù hợp để giữ vệ sinh trường học và chỉnh sửa góc học tập của nhóm. Tích hợp BVMT (Bộ phận): Giáo dục HS ý thức giữ vệ sinh khi tham gia các hoạt động ở trường.',
      },
      {
        id: 'g3-tnxh-w9',
        week: '9',
        lessonName: 'Bài 8: Ôn tập Chủ đề Trường học',
        subLessonName: 'Tiết 17, 18',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hệ thống được những kiến thức đã học về chủ đề Trường học; làm được những sản phẩm sáng tạo và chia sẻ thông điệp về trường học hạnh phúc, an toàn; vận dụng được kiến thức, kĩ năng đã học từ chủ đề vào việc xử lí một số tình huống đơn giản trong cuộc sống hằng ngày ở trường. Tích hợp BVMT (Liên hệ): Giữ vệ sinh khi tham gia các hoạt động ở trường.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-tnxh-cd3',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    chapterCode: 'TNXH3-CĐ3',
    chapterTitle: 'Chủ đề 3: Cộng đồng địa phương (Bài 9 – Bài 12)',
    topicTitle: 'Hoạt động sản xuất nông nghiệp; Hoạt động sản xuất thủ công và công nghiệp; Di tích lịch sử - văn hóa và cảnh quan thiên nhiên',
    weekRange: 'Tuần 10 – Tuần 13',
    lessons: [
      {
        id: 'g3-tnxh-w10',
        week: '10',
        lessonName: 'Bài 9: Hoạt động sản xuất nông nghiệp',
        subLessonName: 'Tiết 19, 20',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Trình bày được tên, các sản phẩm và ích lợi của một số hoạt động sản xuất nông nghiệp ở địa phương dựa vào hình ảnh, thông tin sưu tầm và vốn hiểu biết của bản thân; chia sẻ với những người xung quanh về sự cần thiết phải tiêu dùng tiết kiệm, bảo vệ môi trường. Tích hợp BVMT (Liên hệ): Giáo dục HS hiểu sự cần thiết phải tiêu dùng tiết kiệm để bảo vệ môi trường.',
      },
      {
        id: 'g3-tnxh-w11',
        week: '11',
        lessonName: 'Bài 10: Hoạt động sản xuất thủ công và công nghiệp',
        subLessonName: 'Tiết 21, 22',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Trình bày được tên, các sản phẩm và ích lợi của một số hoạt động sản xuất thủ công và công nghiệp dựa vào hình ảnh, thông tin sưu tầm; chia sẻ với những người xung quanh về sự cần thiết phải tiêu dùng tiết kiệm, bảo vệ môi trường. Tích hợp BVMT (Liên hệ) & GDĐP Chủ đề 6: Làm đồ chơi dân gian (Đầu lân, conùng...).',
      },
      {
        id: 'g3-tnxh-w12',
        week: '12',
        lessonName: 'Bài 11: Di tích lịch sử - văn hóa và cảnh quan thiên nhiên',
        subLessonName: 'Tiết 23, 24',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Giới thiệu được một số di tích lịch sử - văn hóa hoặc cảnh quan thiên nhiên ở địa phương; bày tỏ được thái độ tôn trọng và lịch sự, giữ vệ sinh khi đi tham quan. Tích hợp BVMT (Bộ phận): Giữ vệ sinh khi đi tham quan. Tích hợp GDĐP Chủ đề 1: Danh lam thắng cảnh ở tỉnh Thừa Thiên Huế.',
      },
      {
        id: 'g3-tnxh-w13',
        week: '13',
        lessonName: 'Bài 12: Ôn tập chủ đề Cộng đồng địa phương',
        subLessonName: 'Tiết 25, 26',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hệ thống và củng cố kiến thức về chủ đề Cộng đồng địa phương; trình bày được các thông tin, sản phẩm sưu tầm được về hoạt động sản xuất, danh lam thắng cảnh ở địa phương; xử lí được một số tình huống liên quan đến việc tiêu dùng tiết kiệm, bảo vệ môi trường và giữ vệ sinh khi đi tham quan. Tích hợp BVMT (Bộ phận).',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-tnxh-cd4',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK1',
    chapterCode: 'TNXH3-CĐ4',
    chapterTitle: 'Chủ đề 4: Thực vật và động vật (Bài 13 – Bài 17) & Kiểm tra cuối HKI',
    topicTitle: 'Các bộ phận của thực vật và động vật, chức năng của chúng; Sử dụng hợp lí thực vật và động vật',
    weekRange: 'Tuần 14 – Tuần 18',
    lessons: [
      {
        id: 'g3-tnxh-w14-15',
        week: '14–15',
        lessonName: 'Bài 13: Một số bộ phận của thực vật',
        subLessonName: 'Tiết 27, 28, 29',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Vẽ hoặc sử dụng sơ đồ có sẵn để chỉ vị trí và nói (hoặc viết) được tên một số bộ phận của thực vật; trình bày được đặc điểm của rễ, thân, lá, hoa, quả của một số thực vật thông qua quan sát thực tế và tranh ảnh; phân loại được các nhóm cây theo đặc điểm của rễ, thân, lá dựa trên tiêu chí cho sẵn. Tích hợp KNS: quan sát, tìm kiếm và xử lí thông tin; hợp tác nhóm.',
      },
      {
        id: 'g3-tnxh-w15-16',
        week: '15–16',
        lessonName: 'Bài 14: Chức năng một số bộ phận của thực vật',
        subLessonName: 'Tiết 30, 31',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được chức năng của rễ, thân, lá, hoa, quả đối với đời sống của thực vật và ích lợi của chúng đối với đời sống con người; thực hiện được các hoạt động chăm sóc và bảo vệ cây cối ở trường hoặc ở nhà. Tích hợp BVMT (Liên hệ): Giáo dục HS tình yêu thiên nhiên và có hành động thiết thực bảo vệ cây cối.',
      },
      {
        id: 'g3-tnxh-w16-17',
        week: '16–17',
        lessonName: 'Bài 15: Một số bộ phận của động vật và chức năng của chúng',
        subLessonName: 'Tiết 32, 33',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Chỉ và nói được tên một số bộ phận của các con vật sưu tầm được; nêu được chức năng của một số bộ phận của động vật (cơ quan di chuyển, lớp bao phủ bên ngoài); so sánh được đặc điểm cấu tạo (lớp bao phủ, cơ quan di chuyển) của một số động vật; phân loại được động vật dựa trên một số tiêu chí (cơ quan di chuyển, môi trường sống).',
      },
      {
        id: 'g3-tnxh-w17',
        week: '17',
        lessonName: 'Bài 16: Sử dụng hợp lí thực vật và động vật',
        subLessonName: 'Tiết 34',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Nhận diện và phân류 được vai trò của thực vật và động vật đối với con người thông qua ví dụ, tranh ảnh; nhận xét được cách sử dụng thực vật và động vật của gia đình và cộng đồng địa phương; lựa chọn và đề xuất cách sử dụng thực vật và động vật hợp lí; chia sẻ với những người xung quanh để cùng thực hiện. Tích hợp BVMT (Bộ phận) & GDĐP Chủ đề 7: Trồng cây lưu niệm.',
      },
      {
        id: 'g3-tnxh-w18',
        week: '18',
        lessonName: 'Bài 17: Ôn tập chủ đề Thực vật và động vật – Kiểm tra cuối học kì I',
        subLessonName: 'Tiết 35, 36',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Củng cố những kiến thức đã học về các bộ phận của thực vật, động vật và chức năng của chúng; trình bày và giới thiệu được một số sản phẩm đã thực hiện ở các bài học trong chủ đề; vận dụng kiến thức để xử lí tình huống và hoàn thành bài kiểm tra định kì cuối học kì I.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-tnxh-cd5',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK2',
    chapterCode: 'TNXH3-CĐ5',
    chapterTitle: 'Chủ đề 5: Con người và sức khỏe (Bài 18 – Bài 25)',
    topicTitle: 'Cơ quan tiêu hóa, tuần hoàn, hô hấp, thần kinh; Thức ăn đồ uống có lợi; Phòng tránh xâm hại',
    weekRange: 'Tuần 19 – Tuần 27',
    lessons: [
      {
        id: 'g3-tnxh-w19-20',
        week: '19–20',
        lessonName: 'Bài 18: Cơ quan tiêu hóa',
        subLessonName: 'Tiết 37, 38, 39',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Chỉ và nói được tên các bộ phận chính của cơ quan tiêu hóa trên sơ đồ; nhận biết được chức năng của cơ quan tiêu hóa thông qua hoạt động ăn, uống và thải bã; vận dụng kiến thức về cơ quan tiêu hóa đểstep bước đầu biết phân tích sự tiêu hóa thức ăn trong cơ thể.',
      },
      {
        id: 'g3-tnxh-w20-21',
        week: '20–21',
        lessonName: 'Bài 19: Chăm sóc và bảo vệ cơ quan tiêu hóa',
        subLessonName: 'Tiết 40, 41',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được một số việc cần làm hoặc cần tránh để giữ gìn, bảo vệ cơ quan tiêu hóa; giải thích được lí do cần ăn phối hợp nhiều loại thức ăn và ăn đúng bữa, đúng cách; theo dõi và thực hiện việc ăn, uống đầy đủ, vệ sinh hằng ngày.',
      },
      {
        id: 'g3-tnxh-w21-22',
        week: '21–22',
        lessonName: 'Bài 20: Cơ quan tuần hoàn',
        subLessonName: 'Tiết 42, 43',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Chỉ và nói được tên các bộ phận chính của cơ quan tuần hoàn trên sơ đồ; nhận biết được chức năng của tim và mạch máu thông qua hoạt động thực hành đếm nhịp đập của tim và mạch; giải thích được tại sao cần vận động vừa sức để bảo vệ hệ tuần hoàn.',
      },
      {
        id: 'g3-tnxh-w22-23',
        week: '22–23',
        lessonName: 'Bài 21: Chăm sóc và bảo vệ cơ quan tuần hoàn',
        subLessonName: 'Tiết 44, 45',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Kể được tên một số việc nên làm và không nên làm để bảo vệ cơ quan tuần hoàn; thực hiện được các hoạt động vận động, nghỉ ngơi hợp lí để chăm sóc, bảo vệ tim mạch.',
      },
      {
        id: 'g3-tnxh-w23-24',
        week: '23–24',
        lessonName: 'Bài 22: Cơ quan thần kinh',
        subLessonName: 'Tiết 46, 47',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Chỉ và nói được tên các bộ phận chính của cơ quan thần kinh trên sơ đồ (não, tủy sống, các dây thần kinh); nêu được chức năng của cơ quan thần kinh đối với hoạt động của cơ thể.',
      },
      {
        id: 'g3-tnxh-w24-25',
        week: '24–25',
        lessonName: 'Bài 23: Chăm sóc và bảo vệ cơ quan thần kinh',
        subLessonName: 'Tiết 48, 49, 50',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Nêu được một số việc cần làm và cần tránh để giữ gìn, bảo vệ cơ quan thần kinh; lập được thời gian biểu hằng ngày (học tập, ăn, ngủ, vui chơi giải trí hợp lí) và thực hiện theo thời gian biểu; nhận biết những chất có hại cho cơ quan thần kinh (rượu, bia, thuốc lá, ma túy).',
      },
      {
        id: 'g3-tnxh-w26',
        week: '26',
        lessonName: 'Bài 24: Thu thập thông tin về các chất và hoạt động có hại cho sức khỏe',
        subLessonName: 'Tiết 51, 52',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Thu thập được thông tin về một số chất và hoạt động có hại cho các cơ quan tiêu hóa, tuần hoàn, thần kinh (thuốc lá, rượu, bia, ma túy, thức khuya, chơi trò chơi điện tử quá mức); trình bày và tuyên truyền phòng tránh các chất độc hại. Tích hợp KNS & NLS.',
      },
      {
        id: 'g3-tnxh-w27',
        week: '27',
        lessonName: 'Bài 25: Ôn tập chủ đề Con người và sức khỏe',
        subLessonName: 'Tiết 53, 54',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hệ thống hóa được kiến thức về cấu tạo, chức năng và cách chăm sóc, bảo vệ cơ quan tiêu hóa, tuần hoàn, thần kinh; vận dụng xử lí các tình huống chăm sóc sức khỏe bản thân và gia đình.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-tnxh-cd6',
    subject: 'Tự nhiên và Xã hội',
    semester: 'HK2',
    chapterCode: 'TNXH3-CĐ6',
    chapterTitle: 'Chủ đề 6: Trái Đất và bầu trời (Bài 26 – Bài 30) & Kiểm tra cuối năm',
    topicTitle: 'Phương hướng; Trái Đất và các đới khí hậu; Bề mặt Trái Đất; Mặt Trời, Trái Đất, Mặt Trăng',
    weekRange: 'Tuần 28 – Tuần 35',
    lessons: [
      {
        id: 'g3-tnxh-w28-29',
        week: '28–29',
        lessonName: 'Bài 26: Xác định phương hướng',
        subLessonName: 'Tiết 55, 56, 57',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Nêu được tên bốn phương chính trong không gian theo quy ước (Đông, Tây, Nam, Bắc); thực hành xác định được các phương chính dựa trên phương Mặt Trời mọc, lặn hoặc sử dụng la bàn.',
      },
      {
        id: 'g3-tnxh-w29-30',
        week: '29–30',
        lessonName: 'Bài 27: Trái Đất và các đới khí hậu',
        subLessonName: 'Tiết 58, 59, 60',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Chỉ được cực Bắc, cực Nam, đường Xích đạo, bán cầu Bắc, bán cầu Nam và các đới khí hậu trên quả địa cầu/bản đồ; nêu được một số đặc điểm tự nhiên cơ bản của các đới khí hậu (hàn đới, ôn đới, nhiệt đới).',
      },
      {
        id: 'g3-tnxh-w31-32',
        week: '31–32',
        lessonName: 'Bài 28: Bề mặt Trái Đất',
        subLessonName: 'Tiết 61, 62, 63, 64',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Chỉ và nói được tên các châu lục và các đại dương trên quả địa cầu hoặc bản đồ thế giới; nhận biết và mô tả được một số dạng địa hình chính trên Trái Đất (đồng bằng, đồi, núi, cao nguyên, sông, hồ, biển, đảo); nêu được tên châu lục và đại dương tiếp giáp Việt Nam. Tích hợp BVMT & ANQP biển đảo.',
      },
      {
        id: 'g3-tnxh-w33-34',
        week: '33–34',
        lessonName: 'Bài 29: Mặt Trời, Trái Đất, Mặt Trăng',
        subLessonName: 'Tiết 65, 66, 67, 68',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Chỉ được vị trí của Trái Đất trong Hệ Mặt Trời trên sơ đồ, tranh ảnh; nêu được Mặt Trời và các sao có ánh sáng tự phát ra, Mặt Trăng và Trái Đất phản chiếu ánh sáng Mặt Trời; mô tả được chiều chuyển động của Trái Đất quanh mình nó và quanh Mặt Trời; giải thích được hiện tượng ngày và đêm.',
      },
      {
        id: 'g3-tnxh-w35',
        week: '35',
        lessonName: 'Bài 30: Ôn tập chủ đề Trái Đất và bầu trời – Kiểm tra cuối học kì II',
        subLessonName: 'Tiết 69, 70',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Hệ thống hóa kiến thức chủ đề Trái Đất và bầu trời; hoàn thành sản phẩm học tập và bài kiểm tra đánh giá định kì cuối học kì II.',
      },
    ],
  }),
];

/**
 * 4. MÔN ĐẠO ĐỨC LỚP 3 (35 TIẾT / 35 TUẦN – 1 TIẾT/TUẦN)
 * HKI: 18 tiết (Chủ đề 1–4, Bài 1–5 + Ôn tập giữa HKI, Ôn tập cuối HKI)
 * HKII: 17 tiết (Chủ đề 5–8, Bài 6–10 + Thực hành rèn kĩ năng giữa HKII, Ôn tập cuối năm)
 */
export const GRADE3_DAO_DUC_TOPICS: CurriculumTopic[] = [
  buildGrade3Topic({
    id: 'nda-2026-g3-dd-cd1',
    subject: 'Đạo đức',
    semester: 'HK1',
    chapterCode: 'ĐĐ3-CĐ1',
    chapterTitle: 'Chủ đề 1: Em yêu Tổ quốc Việt Nam (Bài 1 – Bài 2)',
    topicTitle: 'Khám phá Việt Nam; Em yêu Tổ quốc Việt Nam',
    weekRange: 'Tuần 1 – Tuần 5',
    lessons: [
      {
        id: 'g3-dd-w1-2',
        week: '1–2',
        lessonName: 'Bài 1: Khám phá Việt Nam',
        subLessonName: 'Tiết 1, 2',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nhận biết được Quốc hiệu, Quốc kì, Quốc ca Việt Nam; nêu được một vài nét cơ bản về vẻ đẹp của thiên nhiên và con người Việt Nam; nhận biết được Tổ quốc Việt Nam đang phát triển mạnh mẽ và hội nhập quốc tế. Tích hợp GDĐP Chủ đề 1: Danh lam thắng cảnh ở tỉnh Thừa Thiên Huế.',
      },
      {
        id: 'g3-dd-w3-5',
        week: '3–5',
        lessonName: 'Bài 2: Em yêu Tổ quốc Việt Nam',
        subLessonName: 'Tiết 3, 4, 5',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện được hành vi nghiêm trang khi chào cờ và hát Quốc ca; nêu được cảm xúc tự hào, yêu thiết tha Tổ quốc Việt Nam; kể được tên và đóng góp của một số danh nhân văn hóa, anh hùng dân tộc; thể hiện được tình yêu Tổ quốc bằng những việc làm thiết thực phù hợp với lứa tuổi. Tích hợp GDĐP Chủ đề 4: Danh nhân ở tỉnh Thừa Thiên Huế (Tôn Thất Tùng) & Học tập làm theo tấm gương đạo đức, phong cách Hồ Chí Minh.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-dd-cd2',
    subject: 'Đạo đức',
    semester: 'HK1',
    chapterCode: 'ĐĐ3-CĐ2',
    chapterTitle: 'Chủ đề 2: Quan tâm hàng xóm láng giềng (Bài 3 & Ôn tập giữa HKI)',
    topicTitle: 'Quan tâm hàng xóm láng giềng',
    weekRange: 'Tuần 6 – Tuần 9',
    lessons: [
      {
        id: 'g3-dd-w6-8',
        week: '6–8',
        lessonName: 'Bài 3: Quan tâm hàng xóm láng giềng',
        subLessonName: 'Tiết 6, 7, 8',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Nêu được một số biểu hiện của việc quan tâm đến hàng xóm láng giềng; biết vì sao phải quan tâm đến hàng xóm láng giềng; thể hiện được sự quan tâm tới hàng xóm láng giềng bằng những lời nói, việc làm phù hợp với lứa tuổi. Tích hợp QCN: Quyền được tôn trọng và nghĩa vụ tôn trọng hàng xóm láng giềng.',
      },
      {
        id: 'g3-dd-w9',
        week: '9',
        lessonName: 'Ôn tập và thực hành kĩ năng giữa học kì I',
        subLessonName: 'Tiết 9',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Củng cố kiến thức và thực hành xử lí tình huống đạo đức thuộc Chủ đề 1 (Em yêu Tổ quốc Việt Nam) và Chủ đề 2 (Quan tâm hàng xóm láng giềng).',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-dd-cd3-4',
    subject: 'Đạo đức',
    semester: 'HK1',
    chapterCode: 'ĐĐ3-CĐ3-4',
    chapterTitle: 'Chủ đề 3 & 4: Ham học hỏi – Giữ lời hứa (Bài 4 – Bài 5 & Ôn tập cuối HKI)',
    topicTitle: 'Ham học hỏi; Giữ lời hứa',
    weekRange: 'Tuần 10 – Tuần 18',
    lessons: [
      {
        id: 'g3-dd-w10-13',
        week: '10–13',
        lessonName: 'Bài 4: Ham học hỏi',
        subLessonName: 'Tiết 10, 11, 12, 13',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nêu được một số biểu hiện của việc ham học hỏi; nhận biết được lợi ích của việc ham học hỏi đối với bản thân; thực hiện được việc làm thể hiện sự ham học hỏi trong học tập và cuộc sống hằng ngày. Tích hợp QCN: Quyền được học tập, tiếp cận thông tin và phát triển năng lực cá nhân.',
      },
      {
        id: 'g3-dd-w14-17',
        week: '14–17',
        lessonName: 'Bài 5: Giữ lời hứa',
        subLessonName: 'Tiết 14, 15, 16, 17',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nêu được một số biểu hiện của việc giữ lời hứa; giải thích được vì sao phải giữ lời hứa; thực hiện được việc giữ lời hứa bằng lời nói, việc làm cụ thể; biết xin lỗi khi không giữ được lời hứa vì lí do chính đáng. Tích hợp Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh (bài học về chữ tín của Bác Hồ).',
      },
      {
        id: 'g3-dd-w18',
        week: '18',
        lessonName: 'Ôn tập và đánh giá cuối học kì I',
        subLessonName: 'Tiết 18',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Hệ thống hóa các chuẩn mực hành vi đạo đức trong Học kì I; tự đánh giá và đánh giá đồng đẳng kết quả rèn luyện cuối học kì I.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-dd-cd5-6',
    subject: 'Đạo đức',
    semester: 'HK2',
    chapterCode: 'ĐĐ3-CĐ5-6',
    chapterTitle: 'Chủ đề 5 & 6: Tích cực hoàn thành nhiệm vụ – Khám phá bản thân (Bài 6 – Bài 7)',
    topicTitle: 'Tích cực hoàn thành nhiệm vụ; Khám phá bản thân',
    weekRange: 'Tuần 19 – Tuần 27',
    lessons: [
      {
        id: 'g3-dd-w19-22',
        week: '19–22',
        lessonName: 'Bài 6: Tích cực hoàn thành nhiệm vụ',
        subLessonName: 'Tiết 19, 20, 21, 22',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nêu được một số biểu hiện của việc tích cực hoàn thành nhiệm vụ ở nhà, ở trường; biết vì sao phải tích cực hoàn thành nhiệm vụ; hoàn thành được nhiệm vụ học tập, sinh hoạt đúng kế hoạch, có chất lượng; nhắc nhở bạn bè cùng tích cực hoàn thành nhiệm vụ. Tích hợp KNS: quản lí thời gian và tự giác chịu trách nhiệm.',
      },
      {
        id: 'g3-dd-w23-26',
        week: '23–26',
        lessonName: 'Bài 7: Khám phá bản thân',
        subLessonName: 'Tiết 23, 24, 25, 26',
        periodAllocation: '4 tiết',
        periodsCount: 4,
        adjustedContent:
          'Nêu được một số điểm mạnh, điểm yếu của bản thân; biết vì sao phải biết điểm mạnh, điểm yếu của mình; thực hiện được một số cách đơn giản để phát huy điểm mạnh, khắc phục điểm yếu của bản thân; tôn trọng điểm riêng biệt của bạn bè. Tích hợp QCN & KNS: tự nhận thức bản thân.',
      },
      {
        id: 'g3-dd-w27',
        week: '27',
        lessonName: 'Thực hành rèn kĩ năng giữa học kì II',
        subLessonName: 'Tiết 27',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Thực hành xử lí tình huống và đóng vai rèn kĩ năng tích cực hoàn thành nhiệm vụ và tự nhận thức, khám phá bản thân.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-dd-cd7-8',
    subject: 'Đạo đức',
    semester: 'HK2',
    chapterCode: 'ĐĐ3-CĐ7-8',
    chapterTitle: 'Chủ đề 7 & 8: Xử lí bất hòa với bạn bè – Tuân thủ quy tắc an toàn giao thông (Bài 8 – Bài 10)',
    topicTitle: 'Xử lí bất hòa với bạn bè; Tuân thủ quy tắc an toàn giao thông; Em tìm hiểu một số biển báo giao thông',
    weekRange: 'Tuần 28 – Tuần 35',
    lessons: [
      {
        id: 'g3-dd-w28-30',
        week: '28–30',
        lessonName: 'Bài 8: Xử lí bất hòa với bạn bè',
        subLessonName: 'Tiết 28, 29, 30',
        periodAllocation: '3 tiết',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết được một số biểu hiện của bất hòa với bạn bè; nêu được tác hại của việc bất hòa với bạn bè và lợi ích của việc xử lí bất hòa một cách hòa bình; thực hiện được một số cách đơn giản, phù hợp để xử lí bất hòa với bạn bè; sẵn sàng giúp đỡ bạn bè hòa giải mâu thuẫn. Tích hợp QCN & KNS: kiểm soát cảm xúc, thương lượng và giải quyết xung đột.',
      },
      {
        id: 'g3-dd-w31-32',
        week: '31–32',
        lessonName: 'Bài 9: Em tìm hiểu một số quy tắc an toàn giao thông',
        subLessonName: 'Tiết 31, 32',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Nêu được một số quy tắc an toàn giao thông thường gặp đối với người đi bộ, đi xe đạp, đi xe máy và ngồi trên các phương tiện giao thông đường bộ, đường thủy; nhận biết được sự cần thiết phải tuân thủ quy tắc an toàn giao thông. Tích hợp ATGT.',
      },
      {
        id: 'g3-dd-w33-34',
        week: '33–34',
        lessonName: 'Bài 10: Tuân thủ quy tắc an toàn giao thông',
        subLessonName: 'Tiết 33, 34',
        periodAllocation: '2 tiết',
        periodsCount: 2,
        adjustedContent:
          'Tuân thủ quy tắc an toàn giao thông phù hợp với lứa tuổi; đồng tình với những hành vi tuân thủ quy tắc an toàn giao thông; không đồng tình với những hành vi vi phạm quy tắc an toàn giao thông. Tích hợp ATGT & KNS: đảm bảo an toàn cá nhân khi tham gia giao thông.',
      },
      {
        id: 'g3-dd-w35',
        week: '35',
        lessonName: 'Ôn tập cuối học kì II và đánh giá cuối năm học',
        subLessonName: 'Tiết 35',
        periodAllocation: '1 tiết',
        periodsCount: 1,
        adjustedContent:
          'Tổng kết, đánh giá kết quả học tập và rèn luyện phẩm chất, năng lực môn Đạo đức lớp 3 cả năm học.',
      },
    ],
  }),
];

/**
 * 5. HOẠT ĐỘNG TRẢI NGHIỆM LỚP 3 (105 TIẾT / 35 TUẦN – 3 TIẾT/TUẦN)
 * Gồm Sinh hoạt dưới cờ (SHDC), Hoạt động giáo dục theo chủ đề (HĐGĐTCĐ), Sinh hoạt lớp (SHL)
 * HKI: 18 tuần = 54 tiết (Chủ đề 1–5, Bài 1–18)
 * HKII: 17 tuần = 51 tiết (Chủ đề 5 tiếp – Chủ đề 9, Bài 19–35)
 */
export const GRADE3_HDTN_TOPICS: CurriculumTopic[] = [
  buildGrade3Topic({
    id: 'nda-2026-g3-hdtn-cd1',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    chapterCode: 'HĐTN3-CĐ1',
    chapterTitle: 'Chủ đề 1: Tự giới thiệu về mình (Tuần 1 – Tuần 4)',
    topicTitle: 'Bài 1: Em đã lớn hơn; Bài 2: Nét riêng của em; Bài 3: Sở thích của em; Bài 4: Tài năng của em',
    weekRange: 'Tuần 1 – Tuần 4',
    lessons: [
      {
        id: 'g3-hdtn-w1',
        week: '1',
        lessonName: 'Bài 1: Em đã lớn hơn',
        subLessonName: 'SHDC: Chào năm học mới | HĐGĐTCĐ: Em đã lớn hơn | SHL: Xây dựng nội quy lớp học',
        periodAllocation: '3 tiết (Tiết 1–3)',
        periodsCount: 3,
        adjustedContent:
          'Tham gia lễ khai giảng và chào đón năm học mới; giới thiệu được một số đặc điểm bên ngoài và sự thay đổi của bản thân khi lên lớp 3; cùng thảo luận xây dựng nội quy lớp học. Tích hợp QCN & NLS (2.3.CB1a: Giao tiếp, hợp tác lịch sự trong tập thể và nhóm học tập số).',
      },
      {
        id: 'g3-hdtn-w2',
        week: '2',
        lessonName: 'Bài 2: Nét riêng của em',
        subLessonName: 'SHDC: Giao lưu giới thiệu nét riêng | HĐGĐTCĐ: Nét riêng của em | SHL: Tự hào nét riêng của mình',
        periodAllocation: '3 tiết (Tiết 4–6)',
        periodsCount: 3,
        adjustedContent:
          'Nhận diện được những nét riêng đáng yêu của bản thân và tôn trọng sự khác biệt của bạn bè; tự tin giới thiệu về mình trước lớp. Tích hợp QCN (Quyền được tôn trọng sự khác biệt cá nhân) & NLS (4.2.CB1a: Bảo vệ dữ liệu cá nhân đơn giản khi giới thiệu bản thân trên môi trường số).',
      },
      {
        id: 'g3-hdtn-w3',
        week: '3',
        lessonName: 'Bài 3: Sở thích của em',
        subLessonName: 'SHDC: Tuyên truyền ATGT | HĐGĐTCĐ: Sở thích của em | SHL: Chia sẻ sở thích cùng bạn',
        periodAllocation: '3 tiết (Tiết 7–9)',
        periodsCount: 3,
        adjustedContent:
          'Nêu được sở thích của bản thân và biết lắng nghe, tôn trọng sở thích lành mạnh của các bạn trong lớp; cam kết thực hiện an toàn giao thông. Tích hợp ATGT & AI (3.A1.2: Nhận biết sở thích, cảm xúc chân thật là của con người, khác với gợi ý tự động của máy tính/AI).',
      },
      {
        id: 'g3-hdtn-w4',
        week: '4',
        lessonName: 'Bài 4: Tài năng của em',
        subLessonName: 'SHDC: Vui Tết Trung thu | HĐGĐTCĐ: Tài năng của em | SHL: Biểu diễn tài năng của em',
        periodAllocation: '3 tiết (Tiết 10–12)',
        periodsCount: 3,
        adjustedContent:
          'Nhận ra được khả năng, sở trường của bản thân và tự tin thể hiện tài năng qua sản phẩm hoặc tiết mục biểu diễn trước tập thể lớp. Tích hợp QCN & NLS (3.1.CB1a: Trình bày, chia sẻ sản phẩm tài năng của bản thân bằng công cụ số đơn giản).',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-hdtn-cd2',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    chapterCode: 'HĐTN3-CĐ2',
    chapterTitle: 'Chủ đề 2: Nếp sống đẹp (Tuần 5 – Tuần 8)',
    topicTitle: 'Bài 5: Một ngày của em; Bài 6: Góc học tập của em; Bài 7: Giữ gìn vệ sinh trường, lớp; Bài 8: Ý tưởng sáng tạo của em',
    weekRange: 'Tuần 5 – Tuần 8',
    lessons: [
      {
        id: 'g3-hdtn-w5',
        week: '5',
        lessonName: 'Bài 5: Một ngày của em',
        subLessonName: 'SHDC: Nếp sống văn minh học đường | HĐGĐTCĐ: Một ngày của em | SHL: Thực hiện thời gian biểu',
        periodAllocation: '3 tiết (Tiết 13–15)',
        periodsCount: 3,
        adjustedContent:
          'Xây dựng được thời gian biểu hợp lí cho các hoạt động học tập, nghỉ ngơi, vui chơi trong ngày và rèn luyện thói quen đúng giờ. Tích hợp NLS (5.2.CB1a: Sử dụng công cụ số đơn giản lập thời gian biểu học tập, sinh hoạt) & AI (3.A2.1: Nhận biết đồng hồ thông minh/trợ lý ảo hỗ trợ nhắc lịch học tập).',
      },
      {
        id: 'g3-hdtn-w6',
        week: '6',
        lessonName: 'Bài 6: Góc học tập của em',
        subLessonName: 'SHDC: Học tập tốt – Rèn luyện chăm | HĐGĐTCĐ: Góc học tập của em | SHL: Trang trí góc học tập',
        periodAllocation: '3 tiết (Tiết 16–18)',
        periodsCount: 3,
        adjustedContent:
          'Biết sắp xếp, trang trí góc học tập gọn gàng, ngăn nắp, thuận tiện khi sử dụng; duy trì thói quen dọn góc học tập mỗi ngày. Tích hợp NLS (4.1.CB1b: Giữ an toàn khi sử dụng thiết bị điện, đèn bàn, máy tính ở góc học tập).',
      },
      {
        id: 'g3-hdtn-w7',
        week: '7',
        lessonName: 'Bài 7: Giữ gìn vệ sinh trường, lớp',
        subLessonName: 'SHDC: Trường học xanh - sạch - đẹp | HĐGĐTCĐ: Giữ gìn vệ sinh trường, lớp | SHL: Đội tự quản vệ sinh',
        periodAllocation: '3 tiết (Tiết 19–21)',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện tốt các quy định giữ gìn vệ sinh lớp học, sân trường; phân loại rác đúng nơi quy định. Tích hợp BVMT, Tiết kiệm & bảo vệ nguồn nước và AI (3.D1.1: Tìm hiểu cách máy thông minh học phân loại rác tái chế, rác hữu cơ qua hình ảnh).',
      },
      {
        id: 'g3-hdtn-w8',
        week: '8',
        lessonName: 'Bài 8: Ý tưởng sáng tạo của em',
        subLessonName: 'SHDC: Ngày hội ý tưởng sáng tạo | HĐGĐTCĐ: Ý tưởng sáng tạo của em | SHL: Trưng bày sản phẩm tái chế',
        periodAllocation: '3 tiết (Tiết 22–24)',
        periodsCount: 3,
        adjustedContent:
          'Đề xuất và làm được các đồ dùng trang trí góc học tập, lớp học từ vật liệu tái chế an toàn, thân thiện môi trường. Tích hợp STEM, BVMT & NLS (2.2.CB1a: Chia sẻ hình ảnh sản phẩm sáng tạo tái chế của nhóm).',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-hdtn-cd3',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    chapterCode: 'HĐTN3-CĐ3',
    chapterTitle: 'Chủ đề 3: Mái trường em yêu (Tuần 9 – Tuần 12)',
    topicTitle: 'Bài 9: Sao Nhi đồng của chúng em; Bài 10: Tình bạn của chúng mình; Bài 11: Kính yêu thầy cô; Bài 12: An toàn khi ở trường',
    weekRange: 'Tuần 9 – Tuần 12',
    lessons: [
      {
        id: 'g3-hdtn-w9',
        week: '9',
        lessonName: 'Bài 9: Sao Nhi đồng của chúng em',
        subLessonName: 'SHDC: Sinh hoạt Sao Nhi đồng mẫu | HĐGĐTCĐ: Sao Nhi đồng của chúng em | SHL: Cam kết rèn luyện Nhi đồng chăm ngoan',
        periodAllocation: '3 tiết (Tiết 25–27)',
        periodsCount: 3,
        adjustedContent:
          'Tích cực tham gia các hoạt động Sao Nhi đồng và Đội Thiếu niên Tiền phong Hồ Chí Minh; rèn luyện theo 5 điều Bác Hồ dạy. Tích hợp ĐĐLS & TTHCM.',
      },
      {
        id: 'g3-hdtn-w10',
        week: '10',
        lessonName: 'Bài 10: Tình bạn của chúng mình',
        subLessonName: 'SHDC: Tình bạn đẹp học đường | HĐGĐTCĐ: Tình bạn của chúng mình | SHL: Hộp thư điều em muốn nói',
        periodAllocation: '3 tiết (Tiết 28–30)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết được những việc làm vun đắp tình bạn đẹp; biết hòa giải mâu thuẫn, chia sẻ và giúp đỡ bạn cùng tiến bộ. Tích hợp QCN & NLS (2.3.CB1a: Ứng xử văn minh, thân thiện với bạn bè trong nhóm học tập trực tuyến).',
      },
      {
        id: 'g3-hdtn-w11',
        week: '11',
        lessonName: 'Bài 11: Kính yêu thầy cô',
        subLessonName: 'SHDC: Chào mừng Ngày Nhà giáo Việt Nam 20/11 | HĐGĐTCĐ: Kính yêu thầy cô | SHL: Làm thiệp tri ân thầy cô',
        periodAllocation: '3 tiết (Tiết 31–33)',
        periodsCount: 3,
        adjustedContent:
          'Thể hiện lòng biết ơn, kính trọng thầy giáo, cô giáo bằng lời nói lễ phép, việc làm thiết thực và những tấm thiệp chúc mừng 20/11. Tích hợp AI (3.A2.2: Nhận biết đối tượng trong trường học như thầy cô và học sinh được AI hỗ trợ tìm kiếm tư liệu, nhưng tình cảm kính yêu thầy cô là cảm xúc chân thành của con người).',
      },
      {
        id: 'g3-hdtn-w12',
        week: '12',
        lessonName: 'Bài 12: An toàn khi ở trường',
        subLessonName: 'SHDC: Trường học an toàn, thân thiện | HĐGĐTCĐ: An toàn khi ở trường | SHL: Cẩm nang phòng tránh tai nạn thương tích',
        periodAllocation: '3 tiết (Tiết 34–36)',
        periodsCount: 3,
        adjustedContent:
          'Nhận diện được các nguy cơ gây mất an toàn khi vui chơi, học tập ở trường và thực hành kĩ năng phòng tránh tai nạn thương tích. Tích hợp KNS, QCN & NLS (4.1.CB1b: Nhận diện nguy cơ mất an toàn khi sử dụng thiết bị điện, phòng máy tính ở trường).',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-hdtn-cd4-5',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK1',
    chapterCode: 'HĐTN3-CĐ4-5',
    chapterTitle: 'Chủ đề 4 & 5: Giữ gìn nhà cửa ngăn nắp, sạch đẹp – Gia đình yêu thương (Tuần 13 – Tuần 18)',
    topicTitle: 'Bài 13–16: Giữ gìn nhà cửa ngăn nắp, sạch đẹp; Bài 17–18: Người thân trong gia đình, Ngày cuối tuần yêu thương',
    weekRange: 'Tuần 13 – Tuần 18',
    lessons: [
      {
        id: 'g3-hdtn-w13',
        week: '13',
        lessonName: 'Bài 13: Ngôi nhà sạch đẹp',
        subLessonName: 'SHDC: Em yêu lao động | HĐGĐTCĐ: Ngôi nhà sạch đẹp | SHL: Chia sẻ việc làm giúp đỡ bố mẹ',
        periodAllocation: '3 tiết (Tiết 37–39)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết được những việc cần làm để giữ gìn nhà cửa gọn gàng, ngăn nắp, sạch đẹp; tự giác tham gia vệ sinh nhà ở vừa sức. Tích hợp BVMT & AI (3.A1.1: Nhận biết robot hút bụi lau nhà thông minh hỗ trợ con người dọn dẹp nhà cửa).',
      },
      {
        id: 'g3-hdtn-w14',
        week: '14',
        lessonName: 'Bài 14: Sắp xếp đồ dùng cá nhân và gia đình',
        subLessonName: 'SHDC: Rèn tính gọn gàng, ngăn nắp | HĐGĐTCĐ: Sắp xếp đồ dùng cá nhân và gia đình | SHL: Thực hành gấp quần áo, xếp đồ dùng',
        periodAllocation: '3 tiết (Tiết 40–42)',
        periodsCount: 3,
        adjustedContent:
          'Thực hành sắp xếp chăn màn, quần áo, đồ dùng cá nhân và một số vật dụng trong gia đình ngăn nắp, khoa học. Tích hợp KNS & QPAN (rèn tác phong gọn gàng, kỷ luật như chú bộ đội).',
      },
      {
        id: 'g3-hdtn-w15',
        week: '15',
        lessonName: 'Bài 15: Trang trí nhà cửa',
        subLessonName: 'SHDC: Khéo tay hay làm | HĐGĐTCĐ: Trang trí nhà cửa | SHL: Ý tưởng trang trí ngôi nhà đón lễ hội',
        periodAllocation: '3 tiết (Tiết 43–45)',
        periodsCount: 3,
        adjustedContent:
          'Đề xuất ý tưởng và cùng người thân trang trí không gian sống trong gia đình thêm ấm cúng, tươi đẹp. Tích hợp NLS (1.1.CB1b: Tham khảo hình ảnh ý tưởng trang trí góc học tập, ngôi nhà an toàn).',
      },
      {
        id: 'g3-hdtn-w16',
        week: '16',
        lessonName: 'Bài 16: Em làm việc nhà',
        subLessonName: 'SHDC: Uống nước nhớ nguồn (22/12) | HĐGĐTCĐ: Em làm việc nhà | SHL: Lập kế hoạch việc nhà hằng tuần',
        periodAllocation: '3 tiết (Tiết 46–48)',
        periodsCount: 3,
        adjustedContent:
          'Lập kế hoạch và thực hiện đều đặn các công việc nhà phù hợp với lứa tuổi; biết giữ an toàn khi sử dụng đồ dùng trong nhà. Tích hợp QPAN (kỉ niệm ngày thành lập QĐND Việt Nam 22/12) & NLS (4.1.CB1b: Sử dụng an toàn thiết bị điện gia dụng).',
      },
      {
        id: 'g3-hdtn-w17',
        week: '17',
        lessonName: 'Bài 17: Người thân trong gia đình',
        subLessonName: 'SHDC: Gia đình hạnh phúc | HĐGĐTCĐ: Người thân trong gia đình | SHL: Lời yêu thương gửi người thân',
        periodAllocation: '3 tiết (Tiết 49–51)',
        periodsCount: 3,
        adjustedContent:
          'Thể hiện sự quan tâm, chăm sóc, yêu thương đối với ông bà, cha mẹ, anh chị em và họ hàng nội, ngoại. Tích hợp QCN & ĐĐLS.',
      },
      {
        id: 'g3-hdtn-w18',
        week: '18',
        lessonName: 'Bài 18: Ngày cuối tuần yêu thương (Sơ kết Học kì I)',
        subLessonName: 'SHDC: Sơ kết Học kì I | HĐGĐTCĐ: Ngày cuối tuần yêu thương | SHL: Đánh giá rèn luyện cuối HKI',
        periodAllocation: '3 tiết (Tiết 52–54)',
        periodsCount: 3,
        adjustedContent:
          'Lên kế hoạch hoạt động gắn kết gia đình vào ngày cuối tuần; tự đánh giá kết quả rèn luyện phẩm chất và năng lực cuối Học kì I.',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-hdtn-cd5b-6',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    chapterCode: 'HĐTN3-CĐ5B-6',
    chapterTitle: 'Chủ đề 5 (tiếp) & Chủ đề 6: Gia đình yêu thương – Ăn uống an toàn, hợp vệ sinh (Tuần 19 – Tuần 24)',
    topicTitle: 'Bài 19–20: Chi tiêu tiết kiệm, Đón Tết cổ truyền; Bài 21–24: Ăn uống an toàn, hợp vệ sinh',
    weekRange: 'Tuần 19 – Tuần 24',
    lessons: [
      {
        id: 'g3-hdtn-w19',
        week: '19',
        lessonName: 'Bài 19: Chi tiêu tiết kiệm',
        subLessonName: 'SHDC: Tiết kiệm là thói quen tốt | HĐGĐTCĐ: Chi tiêu tiết kiệm | SHL: Heo đất tiết kiệm của lớp em',
        periodAllocation: '3 tiết (Tiết 55–57)',
        periodsCount: 3,
        adjustedContent:
          'Phân biệt được nhu cầu cần thiết và mong muốn nhất thời; biết tiết kiệm điện, nước, đồ dùng và tiền mừng tuổi. Tích hợp Tiết kiệm & bảo vệ nguồn nước, NLS (5.2.CB1a: Lập bảng dự kiến chi tiêu tiết kiệm đơn giản).',
      },
      {
        id: 'g3-hdtn-w20',
        week: '20',
        lessonName: 'Bài 20: Đón Tết cổ truyền',
        subLessonName: 'SHDC: Hương sắc mùa xuân quê hương | HĐGĐTCĐ: Đón Tết cổ truyền | SHL: Phong tục Tết quê em',
        periodAllocation: '3 tiết (Tiết 58–60)',
        periodsCount: 3,
        adjustedContent:
          'Tìm hiểu phong tục đón Tết cổ truyền của quê hương và tham gia chuẩn bị đón Tết cùng gia đình. Tích hợp GDĐP Huế (Chủ đề 3: Lễ hội truyền thống) & NLS (2.1.CB1a: Gửi lời chúc Tết văn minh, lịch sự tới ông bà, người thân).',
      },
      {
        id: 'g3-hdtn-w21',
        week: '21',
        lessonName: 'Bài 21: Thực phẩm an toàn',
        subLessonName: 'SHDC: An toàn vệ sinh thực phẩm | HĐGĐTCĐ: Thực phẩm an toàn | SHL: Nhận biết thực phẩm tươi sạch',
        periodAllocation: '3 tiết (Tiết 61–63)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết được dấu hiệu của thực phẩm tươi sạch, an toàn và cách xem hạn sử dụng trên bao bì sản phẩm. Tích hợp AI (3.B2.1: Cảnh giác với hình ảnh quảng cáo đồ ăn, thực phẩm do AI chỉnh sửa bắt mắt trên mạng nhưng không rõ nguồn gốc, chất lượng).',
      },
      {
        id: 'g3-hdtn-w22',
        week: '22',
        lessonName: 'Bài 22: Ăn uống hợp vệ sinh',
        subLessonName: 'SHDC: Giữ vệ sinh ăn uống phòng bệnh | HĐGĐTCĐ: Ăn uống hợp vệ sinh | SHL: Rèn thói quen rửa tay 6 bước',
        periodAllocation: '3 tiết (Tiết 64–66)',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện ăn chín, uống sôi, rửa tay sạch trước khi ăn và sau khi đi vệ sinh để phòng tránh ngộ độc thực phẩm. Tích hợp KNS & Tiết kiệm nguồn nước.',
      },
      {
        id: 'g3-hdtn-w23',
        week: '23',
        lessonName: 'Bài 23: Món ăn em yêu thích',
        subLessonName: 'SHDC: Ẩm thực truyền thống Huế | HĐGĐTCĐ: Món ăn em yêu thích | SHL: Giới thiệu món ngon gia đình',
        periodAllocation: '3 tiết (Tiết 67–69)',
        periodsCount: 3,
        adjustedContent:
          'Biết ăn đa dạng các nhóm chất dinh dưỡng và giới thiệu được một món ăn truyền thống hoặc món ăn yêu thích của gia đình. Tích hợp GDĐP Chủ đề 5: Ẩm thực truyền thống ở tỉnh Thừa Thiên Huế & NLS (1.1.CB1b: Tìm hiểu hình ảnh món ăn đặc sản quê hương).',
      },
      {
        id: 'g3-hdtn-w24',
        week: '24',
        lessonName: 'Bài 24: Em vào bếp',
        subLessonName: 'SHDC: Đầu bếp nhí tài năng | HĐGĐTCĐ: Em vào bếp | SHL: Chia sẻ niềm vui phụ giúp bữa cơm gia đình',
        periodAllocation: '3 tiết (Tiết 70–72)',
        periodsCount: 3,
        adjustedContent:
          'Thực hành phụ giúp người lớn chuẩn bị bữa ăn đơn giản, bày bàn ăn và đảm bảo an toàn khi ở trong bếp. Tích hợp KNS (phòng tránh bỏng, điện giật) & AI (3.C4.1: Tư duy sắp xếp các bước chuẩn bị món ăn theo trình tự hợp lí).',
      },
    ],
  }),
  buildGrade3Topic({
    id: 'nda-2026-g3-hdtn-cd7-8-9',
    subject: 'Hoạt động trải nghiệm',
    semester: 'HK2',
    chapterCode: 'HĐTN3-CĐ7-8-9',
    chapterTitle: 'Chủ đề 7, 8 & 9: Hoạt động vì cộng đồng – Làm bạn với thiên nhiên – Tìm hiểu thế giới nghề nghiệp (Tuần 25 – Tuần 35)',
    topicTitle: 'Bài 25–27: Hoạt động vì cộng đồng; Bài 28–31: Làm bạn với thiên nhiên; Bài 32–35: Tìm hiểu thế giới nghề nghiệp',
    weekRange: 'Tuần 25 – Tuần 35',
    lessons: [
      {
        id: 'g3-hdtn-w25',
        week: '25',
        lessonName: 'Bài 25: Yêu thương, chia sẻ (Chào mừng 8/3)',
        subLessonName: 'SHDC: Kỉ niệm Quốc tế Phụ nữ 8/3 | HĐGĐTCĐ: Yêu thương, chia sẻ | SHL: Làm quà tặng bà, tặng mẹ, cô giáo',
        periodAllocation: '3 tiết (Tiết 73–75)',
        periodsCount: 3,
        adjustedContent:
          'Bày tỏ lòng biết ơn đối với bà, mẹ, cô giáo nhân ngày 8/3 và tích cực tham gia các hoạt động thiện nguyện chia sẻ với bạn có hoàn cảnh khó khăn. Tích hợp QCN & ĐĐLS.',
      },
      {
        id: 'g3-hdtn-w26',
        week: '26',
        lessonName: 'Bài 26: Tuyên truyền viên nhí',
        subLessonName: 'SHDC: Thiếu nhi vui khỏe – Tiến bước lên Đoàn (26/3) | HĐGĐTCĐ: Tuyên truyền viên nhí | SHL: Thông điệp văn minh nơi công cộng',
        periodAllocation: '3 tiết (Tiết 76–78)',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện nếp sống văn minh nơi công cộng và tuyên truyền mọi người cùng giữ gìn trật tự, vệ sinh chung. Tích hợp NLS (2.2.CB1a, 3.1.CB1a: Tạo và chia sẻ thông điệp tuyên truyền văn minh công cộng).',
      },
      {
        id: 'g3-hdtn-w27',
        week: '27',
        lessonName: 'Bài 27: Chung tay vì cộng đồng',
        subLessonName: 'SHDC: Ngày hội Kế hoạch nhỏ | HĐGĐTCĐ: Chung tay vì cộng đồng | SHL: Đánh giá giữa Học kì II',
        periodAllocation: '3 tiết (Tiết 79–81)',
        periodsCount: 3,
        adjustedContent:
          'Tham gia phong trào Kế hoạch nhỏ và các hoạt động bảo vệ cảnh quan khu phố, thôn xóm nơi em sinh sống. Tích hợp BVMT & ĐĐLS.',
      },
      {
        id: 'g3-hdtn-w28',
        week: '28',
        lessonName: 'Bài 28: Cảnh đẹp quê hương',
        subLessonName: 'SHDC: Tự hào vẻ đẹp quê hương | HĐGĐTCĐ: Cảnh đẹp quê hương | SHL: Triển lãm tranh ảnh quê hương Huế',
        periodAllocation: '3 tiết (Tiết 82–84)',
        periodsCount: 3,
        adjustedContent:
          'Giới thiệu được vẻ đẹp thiên nhiên và danh lam thắng cảnh của quê hương; có ý thức giữ gìn cảnh quan thiên nhiên. Tích hợp GDĐP Chủ đề 1 (Danh lam thắng cảnh Huế) & Chủ đề 2 (Ca Huế), NLS (1.1.CB1b).',
      },
      {
        id: 'g3-hdtn-w29',
        week: '29',
        lessonName: 'Bài 29: Bảo vệ môi trường sống',
        subLessonName: 'SHDC: Giờ Trái Đất – Hành động vì môi trường | HĐGĐTCĐ: Bảo vệ môi trường sống | SHL: Cam kết giảm rác thải nhựa',
        periodAllocation: '3 tiết (Tiết 85–87)',
        periodsCount: 3,
        adjustedContent:
          'Thực hiện các việc làm thiết thực bảo vệ môi trường đất, nước, không khí; hạn chế sử dụng túi ni-lông và đồ nhựa dùng một lần. Tích hợp BVMT, Tiết kiệm nguồn nước & AI (3.D2.1: Nhận biết ứng dụng AI theo dõi chất lượng không khí và phân loại rác thải bảo vệ môi trường).',
      },
      {
        id: 'g3-hdtn-w30',
        week: '30',
        lessonName: 'Bài 30: Chăm sóc cây xanh',
        subLessonName: 'SHDC: Mỗi lớp một công trình măng non | HĐGĐTCĐ: Chăm sóc cây xanh | SHL: Nhật kí chăm sóc bồn hoa lớp em',
        periodAllocation: '3 tiết (Tiết 88–90)',
        periodsCount: 3,
        adjustedContent:
          'Trồng và chăm sóc cây xanh ở trường, ở nhà; tuyên truyền bảo vệ cây xanh và loài vật có ích. Tích hợp GDĐP Chủ đề 7: Trồng cây lưu niệm & BVMT.',
      },
      {
        id: 'g3-hdtn-w31',
        week: '31',
        lessonName: 'Bài 31: Ngày hội môi trường xanh',
        subLessonName: 'SHDC: Kỉ niệm Ngày Giải phóng miền Nam 30/4 | HĐGĐTCĐ: Ngày hội môi trường xanh | SHL: Trưng bày sản phẩm xanh',
        periodAllocation: '3 tiết (Tiết 91–93)',
        periodsCount: 3,
        adjustedContent:
          'Thuyết trình về sản phẩm tuyên truyền bảo vệ môi trường và ôn lại truyền thống lịch sử hào hùng ngày 30/4. Tích hợp QPAN, BVMT & STEM.',
      },
      {
        id: 'g3-hdtn-w32',
        week: '32',
        lessonName: 'Bài 32: Nghề nghiệp của người thân',
        subLessonName: 'SHDC: Tìm hiểu nghề truyền thống quê hương | HĐGĐTCĐ: Nghề nghiệp của người thân | SHL: Kể về công việc của bố mẹ',
        periodAllocation: '3 tiết (Tiết 94–96)',
        periodsCount: 3,
        adjustedContent:
          'Kể được tên, công việc chính và ý nghĩa nghề nghiệp của bố mẹ, người thân trong gia đình; trân trọng người lao động. Tích hợp GDĐP Chủ đề 6 (Làm đồ chơi dân gian) & AI (3.A2.1: Tìm hiểu cách AI hỗ trợ bố mẹ, người lao động trong các ngành nghề).',
      },
      {
        id: 'g3-hdtn-w33',
        week: '33',
        lessonName: 'Bài 33: Đức tính cần có trong công việc',
        subLessonName: 'SHDC: Kỉ niệm Ngày thành lập Đội 15/5 & Sinh nhật Bác 19/5 | HĐGĐTCĐ: Đức tính cần có trong công việc | SHL: Rèn tính cẩn thận, kiên trì',
        periodAllocation: '3 tiết (Tiết 97–99)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết được những đức tính cần thiết của người lao động (chăm chỉ, trung thực, cẩn thận, kỉ luật) và rèn luyện trong học tập. Tích hợp TTHCM & AI (3.A1.2: Máy móc AI có thể làm việc nhanh nhưng đức tính trung thực, trách nhiệm là phẩm chất riêng của con người).',
      },
      {
        id: 'g3-hdtn-w34',
        week: '34',
        lessonName: 'Bài 34: An toàn trong lao động',
        subLessonName: 'SHDC: Tuyên truyền phòng chống đuối nước mùa hè | HĐGĐTCĐ: An toàn trong lao động | SHL: Kĩ năng an toàn dịp nghỉ hè',
        periodAllocation: '3 tiết (Tiết 100–102)',
        periodsCount: 3,
        adjustedContent:
          'Nhận biết được sự cần thiết của trang phục và dụng cụ bảo hộ lao động; thực hành kĩ năng phòng chống đuối nước và tai nạn mùa hè. Tích hợp KNS & QCN.',
      },
      {
        id: 'g3-hdtn-w35',
        week: '35',
        lessonName: 'Bài 35: Ước mơ nghề nghiệp của em (Tổng kết năm học)',
        subLessonName: 'SHDC: Lễ tổng kết năm học | HĐGĐTCĐ: Ước mơ nghề nghiệp của em | SHL: Chia tay lớp 3 – Chào mùa hè vui',
        periodAllocation: '3 tiết (Tiết 103–105)',
        periodsCount: 3,
        adjustedContent:
          'Chia sẻ ước mơ nghề nghiệp tương lai của bản thân; tổng kết, đánh giá kết quả rèn luyện Hoạt động trải nghiệm lớp 3 và bàn giao học sinh về sinh hoạt hè. Tích hợp NLS (3.1.CB1a).',
      },
    ],
  }),
];

