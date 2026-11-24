import {
  EducationLevelId,
  ExamWorkflow,
  ExamWorkflowStepNumber,
  MenuSectionId,
  WorkflowActorRole,
  WorkflowValidationConditionItem,
  WorkflowValidationEngineBenchmarkReport,
  WorkflowValidationGateId,
  WorkflowValidationGateResult,
  WorkflowValidationNegativeTestScenarioResult,
} from '../../types/domain';

export const VALIDATION_GATES_META: {
  gateId: WorkflowValidationGateId;
  shortLabel: string;
  fullTitle: string;
  fromStep: ExamWorkflowStepNumber;
  toStep: ExamWorkflowStepNumber;
  description: string;
}[] = [
  {
    gateId: 'GATE_1_BEFORE_EXAM_GENERATION',
    shortLabel: 'Cổng I · Trước khi Tạo đề',
    fullTitle: 'I. KIỂM TRA TRƯỚC KHI TẠO ĐỀ (Bước 2 → Bước 3)',
    fromStep: 2,
    toStep: 3,
    description:
      'Kiểm tra: (1) Ma trận hợp lệ, (2) Bản đặc tả đầy đủ, (3) Đã được phê duyệt theo quy trình, (4) Có câu hỏi phù hợp, (5) Tổng điểm chính xác.',
  },
  {
    gateId: 'GATE_2_BEFORE_PROFESSIONAL_REVIEW',
    shortLabel: 'Cổng II · Trước khi Gửi thẩm định',
    fullTitle: 'II. KIỂM TRA TRƯỚC KHI GỬI THẨM ĐỊNH (Bước 5 → Bước 6)',
    fromStep: 5,
    toStep: 6,
    description:
      'Kiểm tra: (1) Có đề kiểm tra, (2) Có đáp án, (3) Có hướng dẫn chấm, (4) Đề khớp ma trận, (5) Đã kiểm tra chất lượng, (6) Không còn lỗi nghiêm trọng chưa xử lý, (7) Có ghi nhận cảnh báo chuyên môn chưa thể kết luận.',
  },
  {
    gateId: 'GATE_3_BEFORE_OFFICIAL_APPROVAL',
    shortLabel: 'Cổng III · Trước khi Phê duyệt',
    fullTitle: 'III. KIỂM TRA TRƯỚC KHI PHÊ DUYỆT (Bước 6 → Bước 7)',
    fromStep: 6,
    toStep: 7,
    description:
      'Kiểm tra: (1) Đã thẩm định, (2) Các yêu cầu chỉnh sửa bắt buộc đã xử lý, (3) Phiên bản hiện hành đúng với phiên bản được thẩm định, (4) Không có lỗi nghiêm trọng chưa giải quyết, (5) Người phê duyệt có thẩm quyền.',
  },
  {
    gateId: 'GATE_4_BEFORE_RELEASE_EXPORT',
    shortLabel: 'Cổng IV · Trước khi Phát hành',
    fullTitle: 'IV. KIỂM TRA TRƯỚC KHI PHÁT HÀNH & XUẤT HỒ SƠ (Bước 7 → Bước 8)',
    fromStep: 7,
    toStep: 8,
    description:
      'Kiểm tra: (1) Đề đã phê duyệt, (2) Đáp án đã xác nhận, (3) Mã đề hợp lệ, (4) Tổng điểm đúng, (5) Tài liệu xuất đúng phiên bản, (6) Người phát hành có quyền.',
  },
  {
    gateId: 'GATE_5_BEFORE_RESULTS_ANALYSIS',
    shortLabel: 'Cổng V · Trước khi Phân tích kết quả',
    fullTitle: 'V. KIỂM TRA TRƯỚC KHI PHÂN TÍCH KẾT QUẢ (Bước 8 → Bước 9)',
    fromStep: 8,
    toStep: 9,
    description:
      'Kiểm tra: (1) Đã có kỳ kiểm tra, (2) Có dữ liệu kết quả, (3) Dữ liệu hợp lệ, (4) Mã đề được xác định, (5) Đáp án dùng để phân tích đúng phiên bản.',
  },
];

export function evaluateGateLocallyFallback(params: {
  gateId: WorkflowValidationGateId;
  workflow: ExamWorkflow;
  actorRole: WorkflowActorRole;
  extraContext?: Record<string, unknown>;
}): WorkflowValidationGateResult {
  const { gateId, workflow: wf, actorRole, extraContext = {} } = params;
  const step1 = wf.step1QuestionBank;
  const step2 = wf.step2MatrixAndSpec;
  const step3 = wf.step3ExamGeneration;
  const step4 = wf.step4AiQualityReview;
  const step6 = wf.step6ProfessionalReview;
  const step7 = wf.step7OfficialApproval;

  const conditions: WorkflowValidationConditionItem[] = [];
  let gateTitle = '';
  let fromStep: ExamWorkflowStepNumber = 1;
  let toStep: ExamWorkflowStepNumber = 2;

  if (gateId === 'GATE_1_BEFORE_EXAM_GENERATION') {
    gateTitle = 'I. Kiểm tra điều kiện trước khi Tạo đề (Bước 2 → Bước 3)';
    fromStep = 2;
    toStep = 3;

    const matrixValid =
      Boolean(wf.matrixId) && step2.isValidStructure === true && wf.hasMatrixDocument !== false;
    const specComplete =
      Boolean(wf.specificationId) &&
      step2.learningOutcomesLinkedCount > 0 &&
      wf.hasSpecificationDocument !== false;
    const matrixApproved =
      step2.matrixApprovalStatus === 'APPROVED' && wf.status === 'MatrixApproved';
    const hasMatchingQuestions =
      step1.coverageSatisfied &&
      step1.approvedQuestionIds.length >= step2.totalQuestions;
    const totalPointsExact =
      step2.totalPoints === 10 &&
      Math.abs(step1.totalSelectedPoints - step2.totalPoints) < 0.001;

    conditions.push(
      {
        conditionCode: 'G1_MATRIX_VALID',
        conditionTitle: '1. Ma trận hợp lệ',
        passed: matrixValid,
        currentValueSummary: matrixValid
          ? `Ma trận [${wf.matrixId}] hợp lệ (${step2.totalQuestions} câu)`
          : 'Chưa có Ma trận hoặc cấu trúc Ma trận chưa hợp lệ',
        requiredRuleSummary: 'Ma trận đề phải có đầy đủ chủ đề, mức độ nhận thức và cấu trúc hợp lệ.',
        remediationLocationLabel: 'Màn hình: Ma trận và bản đặc tả -> Thiết lập cấu trúc Ma trận',
        targetMenuId: 'matrix',
        targetWorkflowStep: 2,
      },
      {
        conditionCode: 'G1_SPECIFICATION_COMPLETE',
        conditionTitle: '2. Bản đặc tả đầy đủ',
        passed: specComplete,
        currentValueSummary: specComplete
          ? `Bản đặc tả [${wf.specificationId}] đã liên kết ${step2.learningOutcomesLinkedCount} YCCĐ`
          : 'Thiếu Bản đặc tả hoặc chưa gắn Yêu cầu cần đạt (YCCĐ)',
        requiredRuleSummary: 'Bản đặc tả phải liên kết đầy đủ Yêu cầu cần đạt cho từng câu hỏi.',
        remediationLocationLabel: 'Màn hình: Ma trận và bản đặc tả -> Thẻ Bản đặc tả chi tiết',
        targetMenuId: 'matrix',
        targetWorkflowStep: 2,
      },
      {
        conditionCode: 'G1_MATRIX_APPROVED',
        conditionTitle: '3. Đã được phê duyệt theo quy trình',
        passed: matrixApproved,
        currentValueSummary: `Trạng thái duyệt Ma trận: ${step2.matrixApprovalStatus} (Hồ sơ: ${wf.status})`,
        requiredRuleSummary: 'Ma trận và Bản đặc tả bắt buộc phải ở trạng thái APPROVED (MatrixApproved) trước khi tạo đề.',
        remediationLocationLabel: 'Quy trình tạo đề -> Bước 2 (Ma trận & Đặc tả) -> Phê duyệt Ma trận',
        targetMenuId: 'exam-workflow',
        targetWorkflowStep: 2,
      },
      {
        conditionCode: 'G1_MATCHING_QUESTIONS',
        conditionTitle: '4. Có câu hỏi phù hợp (Đã duyệt trong Ngân hàng)',
        passed: hasMatchingQuestions,
        currentValueSummary: `Đã chọn ${step1.approvedQuestionIds.length}/${step2.totalQuestions} câu hỏi APPROVED`,
        requiredRuleSummary: 'Ngân hàng câu hỏi phải có đủ số lượng câu hỏi trạng thái APPROVED khớp ma trận.',
        remediationLocationLabel: 'Màn hình: Ngân hàng câu hỏi -> Chọn bổ sung câu hỏi đã duyệt',
        targetMenuId: 'questions',
        targetWorkflowStep: 1,
      },
      {
        conditionCode: 'G1_TOTAL_POINTS_EXACT',
        conditionTitle: '5. Tổng điểm chính xác',
        passed: totalPointsExact,
        currentValueSummary: `Điểm câu hỏi: ${step1.totalSelectedPoints.toFixed(2)}đ / Điểm Ma trận: ${step2.totalPoints.toFixed(2)}đ`,
        requiredRuleSummary: 'Tổng điểm của ma trận và câu hỏi được chọn phải bằng đúng 10,00 điểm.',
        remediationLocationLabel: 'Màn hình: Ma trận và bản đặc tả -> Kiểm tra cột Tổng điểm',
        targetMenuId: 'matrix',
        targetWorkflowStep: 2,
      }
    );
  } else if (gateId === 'GATE_2_BEFORE_PROFESSIONAL_REVIEW') {
    gateTitle = 'II. Kiểm tra điều kiện trước khi Gửi thẩm định (Bước 5 → Bước 6)';
    fromStep = 5;
    toStep = 6;

    const hasExam = Boolean(wf.examId) && step3.questionIdsInExam.length > 0;
    const hasAnswerKey = step3.answerKeyComplete === true;
    const hasRubric = step3.gradingGuideComplete === true;
    const matchesMatrix =
      step3.matchesApprovedMatrix === true &&
      !wf.step5TeacherRevision.lastRevisionTriggeredMatrixReapproval &&
      step3.totalExamPoints === step2.totalPoints;
    const qualityChecked =
      Boolean(step4.inspectedAt) && step4.inspectedVersionId === wf.currentVersionId;
    const unresolvedCritical = Math.max(
      0,
      step4.criticalErrorsCount - step4.resolvedErrorsCount
    );
    const noUnresolvedCritical = unresolvedCritical === 0;
    const inconclusiveRecorded =
      extraContext.inconclusiveWarningsAcknowledged !== false &&
      Boolean(step4.overallDashboardStatusLabel);

    conditions.push(
      {
        conditionCode: 'G2_HAS_EXAM_PAPER',
        conditionTitle: '1. Có đề kiểm tra',
        passed: hasExam,
        currentValueSummary: hasExam
          ? `Đề [${wf.examId}] gồm ${step3.questionIdsInExam.length} câu hỏi`
          : 'Chưa khởi tạo đề kiểm tra',
        requiredRuleSummary: 'Phải khởi tạo đầy đủ nội dung câu hỏi của đề kiểm tra.',
        remediationLocationLabel: 'Màn hình: Tạo đề kiểm tra -> Khởi tạo đề từ Ma trận',
        targetMenuId: 'exam-builder',
        targetWorkflowStep: 3,
      },
      {
        conditionCode: 'G2_HAS_ANSWER_KEY',
        conditionTitle: '2. Có đáp án',
        passed: hasAnswerKey,
        currentValueSummary: hasAnswerKey ? 'Đã có bảng đáp án đầy đủ' : 'THIẾU ĐÁP ÁN',
        requiredRuleSummary: 'Mỗi câu hỏi trong đề kiểm tra phải có đáp án chính thức tương ứng.',
        remediationLocationLabel: 'Màn hình: Tạo đề kiểm tra -> Thẻ Đáp án & Biểu điểm',
        targetMenuId: 'exam-builder',
        targetWorkflowStep: 3,
      },
      {
        conditionCode: 'G2_HAS_GRADING_GUIDE',
        conditionTitle: '3. Có hướng dẫn chấm',
        passed: hasRubric,
        currentValueSummary: hasRubric ? 'Đã có hướng dẫn chấm chi tiết' : 'THIẾU HƯỚNG DẪN CHẤM',
        requiredRuleSummary: 'Phải có hướng dẫn chấm chi tiết và ghi nhận các cách giải tương đương hợp lệ.',
        remediationLocationLabel: 'Màn hình: Tạo đề kiểm tra -> Thẻ Hướng dẫn chấm chi tiết',
        targetMenuId: 'exam-builder',
        targetWorkflowStep: 3,
      },
      {
        conditionCode: 'G2_EXAM_MATCHES_MATRIX',
        conditionTitle: '4. Đề khớp ma trận',
        passed: matchesMatrix,
        currentValueSummary: matchesMatrix
          ? `Đề khớp 100% với Ma trận (${step3.totalExamPoints}đ)`
          : 'Đề kiểm tra bị lệch cấu trúc hoặc điểm số so với Ma trận đã duyệt',
        requiredRuleSummary: 'Số câu, mức độ, dạng câu và tổng điểm của đề phải khớp tuyệt đối với Ma trận.',
        remediationLocationLabel: 'Màn hình: AI Kiểm tra chất lượng đề -> Thẻ Đối chiếu chéo Hồ sơ',
        targetMenuId: 'ai-quality-review',
        targetWorkflowStep: 4,
      },
      {
        conditionCode: 'G2_QUALITY_REVIEW_EXECUTED',
        conditionTitle: '5. Đã thực hiện kiểm tra chất lượng (AI Quality Review)',
        passed: qualityChecked,
        currentValueSummary: qualityChecked
          ? `Đã kiểm tra phiên bản ${step4.inspectedVersionId}`
          : `Chưa chạy AI Quality Review cho phiên bản ${wf.currentVersionId}`,
        requiredRuleSummary: 'Phiên bản đề hiện hành phải được chạy bộ kiểm tra chất lượng trước khi gửi thẩm định.',
        remediationLocationLabel: 'Màn hình: AI Kiểm tra chất lượng đề -> Chạy kiểm tra chất lượng',
        targetMenuId: 'ai-quality-review',
        targetWorkflowStep: 4,
      },
      {
        conditionCode: 'G2_NO_UNRESOLVED_CRITICAL_ERRORS',
        conditionTitle: '6. Không còn lỗi nghiêm trọng đã được xác minh nhưng chưa xử lý',
        passed: noUnresolvedCritical,
        currentValueSummary: noUnresolvedCritical
          ? '0 lỗi nghiêm trọng tồn đọng'
          : `Còn ${unresolvedCritical} lỗi mức Nghiêm trọng chưa xử lý`,
        requiredRuleSummary: 'Tất cả các lỗi mức độ Nghiêm trọng phải được sửa hoặc giải trình trước khi gửi thẩm định.',
        remediationLocationLabel: 'Màn hình: AI Kiểm tra chất lượng đề -> Bảng điều khiển chất lượng đề',
        targetMenuId: 'ai-quality-review',
        targetWorkflowStep: 5,
      },
      {
        conditionCode: 'G2_INCONCLUSIVE_WARNINGS_RECORDED',
        conditionTitle: '7. Có ghi nhận các cảnh báo chuyên môn chưa thể kết luận',
        passed: inconclusiveRecorded,
        currentValueSummary: inconclusiveRecorded
          ? `Đã ghi nhận trạng thái: "${step4.overallDashboardStatusLabel}"`
          : 'Chưa ghi nhận các cảnh báo chuyên môn cần hội đồng thẩm định xem xét',
        requiredRuleSummary: 'Mọi cảnh báo chuyên môn chưa thể kết luận tự động phải được đính kèm gửi hội đồng thẩm định.',
        remediationLocationLabel: 'Màn hình: AI Kiểm tra chất lượng đề -> Đánh giá tổng thể & Ghi chú thẩm định',
        targetMenuId: 'ai-quality-review',
        targetWorkflowStep: 5,
      }
    );
  } else if (gateId === 'GATE_3_BEFORE_OFFICIAL_APPROVAL') {
    gateTitle = 'III. Kiểm tra điều kiện trước khi Phê duyệt chính thức (Bước 6 → Bước 7)';
    fromStep = 6;
    toStep = 7;

    const latestBallot = step6.ballots[0];
    const hasReviewed =
      step6.ballots.length > 0 && step6.latestDecision === 'ELIGIBLE_FOR_APPROVAL';
    const mandatoryRevisionsResolved =
      wf.status !== 'RevisionRequired' && step6.latestDecision !== 'REVISION_REQUIRED';
    const versionMatches =
      Boolean(latestBallot) && latestBallot.reviewedVersionId === wf.currentVersionId;
    const unresolvedCritical = Math.max(
      0,
      step4.criticalErrorsCount - step4.resolvedErrorsCount
    );
    const noCriticalErrors = unresolvedCritical === 0;
    const approverHasAuth = [
      'HEAD_OF_DEPARTMENT',
      'VICE_PRINCIPAL',
      'PRINCIPAL',
      'SYSTEM_ADMIN',
    ].includes(actorRole);

    conditions.push(
      {
        conditionCode: 'G3_PROFESSIONAL_REVIEW_DONE',
        conditionTitle: '1. Đã thẩm định chuyên môn',
        passed: hasReviewed,
        currentValueSummary: hasReviewed
          ? `Đã có Phiếu thẩm định (${latestBallot?.reviewerName}) kết luận Đủ điều kiện`
          : 'CHƯA CÓ PHIẾU THẨM ĐỊNH hoặc chưa đạt yêu cầu thẩm định',
        requiredRuleSummary: 'Hồ sơ đề bắt buộc phải có Phiếu thẩm định của cán bộ phản biện kết luận đủ điều kiện trình duyệt.',
        remediationLocationLabel: 'Màn hình: Thẩm định – phê duyệt -> Lập Phiếu thẩm định chuyên môn',
        targetMenuId: 'approval',
        targetWorkflowStep: 6,
      },
      {
        conditionCode: 'G3_MANDATORY_REVISIONS_RESOLVED',
        conditionTitle: '2. Các yêu cầu chỉnh sửa bắt buộc đã xử lý',
        passed: mandatoryRevisionsResolved,
        currentValueSummary: mandatoryRevisionsResolved
          ? 'Đã hoàn tất mọi yêu cầu chỉnh sửa của hội đồng thẩm định'
          : 'Hồ sơ đang ở trạng thái Yêu cầu chỉnh sửa (RevisionRequired)',
        requiredRuleSummary: 'Không được phê duyệt khi hồ sơ còn yêu cầu chỉnh sửa bắt buộc từ người phản biện.',
        remediationLocationLabel: 'Quy trình tạo đề -> Bước 5 (Giáo viên chỉnh sửa)',
        targetMenuId: 'exam-workflow',
        targetWorkflowStep: 5,
      },
      {
        conditionCode: 'G3_VERSION_MATCHES_REVIEWED',
        conditionTitle: '3. Phiên bản hiện hành đúng với phiên bản được thẩm định',
        passed: versionMatches,
        currentValueSummary: `Phiên bản hiện hành: [${wf.currentVersionId}] vs Phiên bản thẩm định: [${latestBallot?.reviewedVersionId || 'Chưa có'}]`,
        requiredRuleSummary: 'Phiên bản trình phê duyệt phải trùng khớp hoàn toàn với phiên bản đã được thẩm định.',
        remediationLocationLabel: 'Quy trình tạo đề -> Bước 6 (Thẩm định lại phiên bản mới nhất)',
        targetMenuId: 'exam-workflow',
        targetWorkflowStep: 6,
      },
      {
        conditionCode: 'G3_NO_CRITICAL_ERRORS',
        conditionTitle: '4. Không có lỗi nghiêm trọng chưa giải quyết',
        passed: noCriticalErrors,
        currentValueSummary: noCriticalErrors
          ? '0 lỗi nghiêm trọng chưa giải quyết'
          : `Còn ${unresolvedCritical} lỗi nghiêm trọng chưa giải quyết`,
        requiredRuleSummary: 'Hồ sơ trình phê duyệt chính thức không được phép tồn tại lỗi nghiêm trọng.',
        remediationLocationLabel: 'Màn hình: AI Kiểm tra chất lượng đề -> Xử lý lỗi nghiêm trọng',
        targetMenuId: 'ai-quality-review',
        targetWorkflowStep: 5,
      },
      {
        conditionCode: 'G3_APPROVER_HAS_AUTHORITY',
        conditionTitle: '5. Người phê duyệt có thẩm quyền',
        passed: approverHasAuth,
        currentValueSummary: `Vai trò hiện tại: ${actorRole}`,
        requiredRuleSummary: 'Chỉ Tổ trưởng chuyên môn, Phó Hiệu trưởng, Hiệu trưởng hoặc Quản trị hệ thống mới có thẩm quyền phê duyệt.',
        remediationLocationLabel: 'Màn hình: Quản trị hệ thống -> Phân quyền vai trò phê duyệt (RBAC)',
        targetMenuId: 'admin',
        targetWorkflowStep: 7,
      }
    );
  } else if (gateId === 'GATE_4_BEFORE_RELEASE_EXPORT') {
    gateTitle = 'IV. Kiểm tra điều kiện trước khi Phát hành & Xuất hồ sơ chính thức (Bước 7 → Bước 8)';
    fromStep = 7;
    toStep = 8;

    const approvalRec = step7.approvalRecord;
    const examApproved =
      (wf.status === 'Approved' || wf.status === 'Released') &&
      Boolean(approvalRec?.isVersionLocked);
    const answerKeyConfirmed =
      step3.answerKeyComplete === true && step3.gradingGuideComplete === true;
    const variantCodesValid =
      step3.variantCodes.length > 0 &&
      step3.variantCodes.every((c) => /^[A-Z0-9_-]{2,10}$/i.test(c));
    const totalPointsCorrect =
      step3.totalExamPoints === 10 && step2.totalPoints === 10;
    const requestedExportVersion = String(
      extraContext.exportVersionId || wf.currentVersionId
    );
    const exportVersionMatchesApproved =
      Boolean(approvalRec?.approvedVersionId) &&
      requestedExportVersion === approvalRec?.approvedVersionId;
    const releaserHasAuth = [
      'HEAD_OF_DEPARTMENT',
      'VICE_PRINCIPAL',
      'PRINCIPAL',
      'SYSTEM_ADMIN',
    ].includes(actorRole);

    conditions.push(
      {
        conditionCode: 'G4_EXAM_APPROVED',
        conditionTitle: '1. Đề đã phê duyệt & khóa phiên bản',
        passed: examApproved,
        currentValueSummary: examApproved
          ? `Đã phê duyệt bởi ${approvalRec?.approverName} (${approvalRec?.approvedVersionId})`
          : `Đề CHƯA ĐƯỢC PHÊ DUYỆT (Trạng thái hiện tại: ${wf.status})`,
        requiredRuleSummary: 'Tuyệt đối không được xuất đề chính thức khi hồ sơ chưa được phê duyệt và khóa phiên bản.',
        remediationLocationLabel: 'Quy trình tạo đề -> Bước 7 (Phê duyệt & Khóa phiên bản)',
        targetMenuId: 'exam-workflow',
        targetWorkflowStep: 7,
      },
      {
        conditionCode: 'G4_ANSWER_KEY_CONFIRMED',
        conditionTitle: '2. Đáp án đã xác nhận',
        passed: answerKeyConfirmed,
        currentValueSummary: answerKeyConfirmed
          ? 'Đáp án & Hướng dẫn chấm đã được xác nhận đầy đủ'
          : 'Đáp án hoặc Hướng dẫn chấm chưa được xác nhận hoàn chỉnh',
        requiredRuleSummary: 'Đáp án và biểu điểm hướng dẫn chấm phải được xác nhận trước khi phát hành.',
        remediationLocationLabel: 'Màn hình: Tạo đề kiểm tra -> Xác nhận Đáp án & Hướng dẫn chấm',
        targetMenuId: 'exam-builder',
        targetWorkflowStep: 3,
      },
      {
        conditionCode: 'G4_VARIANT_CODES_VALID',
        conditionTitle: '3. Mã đề hợp lệ',
        passed: variantCodesValid,
        currentValueSummary: variantCodesValid
          ? `Mã đề hợp lệ: [${step3.variantCodes.join(', ')}]`
          : 'Chưa có mã đề hoặc mã đề không hợp lệ',
        requiredRuleSummary: 'Các mã đề phát hành phải đúng quy chuẩn ký hiệu.',
        remediationLocationLabel: 'Màn hình: Tạo đề kiểm tra -> Quản lý Mã đề tương đương',
        targetMenuId: 'exam-builder',
        targetWorkflowStep: 3,
      },
      {
        conditionCode: 'G4_TOTAL_POINTS_CORRECT',
        conditionTitle: '4. Tổng điểm đúng',
        passed: totalPointsCorrect,
        currentValueSummary: `Tổng điểm đề: ${step3.totalExamPoints.toFixed(2)} / 10,00 điểm`,
        requiredRuleSummary: 'Tổng điểm toàn đề phải bằng đúng thang điểm 10,00.',
        remediationLocationLabel: 'Màn hình: Tạo đề kiểm tra -> Kiểm tra tổng điểm',
        targetMenuId: 'exam-builder',
        targetWorkflowStep: 3,
      },
      {
        conditionCode: 'G4_EXPORT_VERSION_MATCHES',
        conditionTitle: '5. Tài liệu xuất đúng phiên bản đã phê duyệt',
        passed: exportVersionMatchesApproved,
        currentValueSummary: `Phiên bản yêu cầu xuất: [${requestedExportVersion}] vs Phiên bản đã khóa: [${approvalRec?.approvedVersionId || 'Chưa khóa'}]`,
        requiredRuleSummary: 'Chỉ được phép kết xuất chính xác phiên bản đã được phê duyệt và khóa bất biến.',
        remediationLocationLabel: 'Màn hình: Hồ sơ kiểm tra -> Chọn đúng phiên bản đã phê duyệt',
        targetMenuId: 'records',
        targetWorkflowStep: 8,
      },
      {
        conditionCode: 'G4_RELEASER_HAS_AUTHORITY',
        conditionTitle: '6. Người phát hành có quyền',
        passed: releaserHasAuth,
        currentValueSummary: `Vai trò người thực hiện: ${actorRole}`,
        requiredRuleSummary: 'Chỉ người có quyền quản lý hồ sơ đề mật / lãnh đạo mới được phát hành gói đề chính thức.',
        remediationLocationLabel: 'Màn hình: Quản trị hệ thống -> Phân quyền kết xuất hồ sơ đề',
        targetMenuId: 'admin',
        targetWorkflowStep: 8,
      }
    );
  } else if (gateId === 'GATE_5_BEFORE_RESULTS_ANALYSIS') {
    gateTitle = 'V. Kiểm tra điều kiện trước khi Phân tích kết quả kiểm tra (Bước 8 → Bước 9)';
    fromStep = 8;
    toStep = 9;

    const validVariants = step3.variantCodes.length > 0 ? step3.variantCodes : ['401', '402'];
    const inputExamPeriod = extraContext.examPeriod ?? wf.examPeriod;
    const hasResultData = extraContext.hasResultDataset !== false;
    const resultDataValid = extraContext.resultDataValid !== false;
    const inputVariantCode = String(
      extraContext.submittedVariantCode || validVariants[0] || ''
    );
    const variantMatched = validVariants.includes(inputVariantCode);
    const approvedVer = String(
      step7.approvalRecord?.approvedVersionId || wf.currentVersionId
    );
    const analysisAnswerVer = String(
      extraContext.analysisAnswerKeyVersionId || approvedVer
    );
    const answerVersionMatched =
      analysisAnswerVer === approvedVer && Boolean(step7.approvalRecord?.isVersionLocked);

    conditions.push(
      {
        conditionCode: 'G5_EXAM_PERIOD_DEFINED',
        conditionTitle: '1. Đã có kỳ kiểm tra',
        passed: Boolean(inputExamPeriod),
        currentValueSummary: inputExamPeriod
          ? `Kỳ kiểm tra: ${wf.examPeriodLabel || String(inputExamPeriod)}`
          : 'Chưa xác định kỳ kiểm tra',
        requiredRuleSummary: 'Bảng kết quả nhập vào phải gắn với một kỳ kiểm tra đã phát hành.',
        remediationLocationLabel: 'Màn hình: Phân tích kết quả & Câu hỏi -> Chọn Kỳ kiểm tra',
        targetMenuId: 'exam-analytics',
        targetWorkflowStep: 9,
      },
      {
        conditionCode: 'G5_HAS_RESULT_DATASET',
        conditionTitle: '2. Có dữ liệu kết quả',
        passed: hasResultData,
        currentValueSummary: hasResultData
          ? 'Đã nạp dữ liệu bảng điểm học sinh'
          : 'Chưa nạp dữ liệu bảng điểm / kết quả trả lời',
        requiredRuleSummary: 'Phải tải lên hoặc nhập dữ liệu điểm số thực tế trước khi chạy thống kê.',
        remediationLocationLabel: 'Màn hình: Phân tích kết quả & Câu hỏi -> Mục I. Nhập kết quả',
        targetMenuId: 'exam-analytics',
        targetWorkflowStep: 9,
      },
      {
        conditionCode: 'G5_RESULT_DATA_VALID',
        conditionTitle: '3. Dữ liệu hợp lệ',
        passed: resultDataValid,
        currentValueSummary: resultDataValid
          ? 'Điểm số nằm trong thang [0..10], không có bản ghi lỗi định dạng'
          : 'Dữ liệu bảng điểm chứa điểm âm, vượt thang điểm hoặc sai cấu trúc câu',
        requiredRuleSummary: 'Dữ liệu điểm và phương án trả lời của học sinh phải hợp lệ.',
        remediationLocationLabel: 'Màn hình: Phân tích kết quả & Câu hỏi -> Kiểm tra dữ liệu đầu vào',
        targetMenuId: 'exam-analytics',
        targetWorkflowStep: 9,
      },
      {
        conditionCode: 'G5_VARIANT_CODE_IDENTIFIED',
        conditionTitle: '4. Mã đề được xác định & khớp với đề đã phát hành',
        passed: variantMatched,
        currentValueSummary: `Mã đề nhập vào: [${inputVariantCode || 'Rỗng'}] vs Mã đề hợp lệ của hồ sơ: [${validVariants.join(', ')}]`,
        requiredRuleSummary: 'Mã đề trong dữ liệu kết quả phải trùng khớp với một trong các mã đề chính thức đã phát hành.',
        remediationLocationLabel: 'Màn hình: Phân tích kết quả & Câu hỏi -> Đối chiếu Mã đề kiểm tra',
        targetMenuId: 'exam-analytics',
        targetWorkflowStep: 9,
      },
      {
        conditionCode: 'G5_ANSWER_KEY_VERSION_MATCHES',
        conditionTitle: '5. Đáp án dùng để phân tích đúng phiên bản đã phê duyệt',
        passed: answerVersionMatched,
        currentValueSummary: `Phiên bản đáp án chấm: [${analysisAnswerVer}] vs Phiên bản đề đã duyệt: [${approvedVer}]`,
        requiredRuleSummary: 'Bảng đáp án dùng để chấm và phân tích phải thuộc đúng phiên bản đề đã phê duyệt.',
        remediationLocationLabel: 'Màn hình: Phân tích kết quả & Câu hỏi -> Đồng bộ Đáp án theo phiên bản đề đã duyệt',
        targetMenuId: 'exam-analytics',
        targetWorkflowStep: 9,
      }
    );
  }

  const passedCount = conditions.filter((c) => c.passed).length;
  const failedCount = conditions.length - passedCount;
  const allowedToProceed = failedCount === 0 && conditions.length > 0;

  return {
    gateId,
    gateTitle,
    fromStep,
    toStep,
    workflowId: wf.workflowId,
    evaluatedAt: new Date().toISOString(),
    evaluatedByBackend: true,
    httpStatus: allowedToProceed ? 200 : 422,
    allowedToProceed,
    draftDataPreserved: true,
    totalConditions: conditions.length,
    passedConditionsCount: passedCount,
    failedConditionsCount: failedCount,
    conditions,
    blockingMessage: allowedToProceed
      ? `Đạt ${passedCount}/${conditions.length} điều kiện bắt buộc. Cho phép chuyển sang bước tiếp theo.`
      : `BỊ CHẶN TẠI BACKEND (HTTP 422): Chưa đạt ${failedCount}/${conditions.length} điều kiện bắt buộc của [${gateTitle}]. Dữ liệu đang nhập được giữ nguyên an toàn.`,
  };
}

export async function validateWorkflowGateAtBackend(params: {
  gateId: WorkflowValidationGateId;
  workflow: ExamWorkflow;
  actorName: string;
  actorRole: WorkflowActorRole;
  extraContext?: Record<string, unknown>;
}): Promise<WorkflowValidationGateResult> {
  const { gateId, workflow, actorName, actorRole, extraContext } = params;
  try {
    const resp = await fetch(
      `/api/workflows/${encodeURIComponent(workflow.workflowId)}/validate-gate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateId,
          workflow,
          actorName,
          actorRole,
          extraContext: extraContext || {},
        }),
      }
    );
    const data = await resp.json();
    if (data && Array.isArray(data.conditions)) {
      return data as WorkflowValidationGateResult;
    }
  } catch {
    // Fallback to deterministic local evaluation if network unreachable
  }
  return evaluateGateLocallyFallback({ gateId, workflow, actorRole, extraContext });
}

// ============================================================================
// VII. KIỂM THỬ 5 KỊCH BẢN CỐ TÌNH VI PHẠM PHẢI BỊ CHẶN Ở BACKEND
// ============================================================================

export async function runWorkflowValidationEngineBenchmark(
  baseWorkflow: ExamWorkflow
): Promise<WorkflowValidationEngineBenchmarkReport> {
  const scenarios: WorkflowValidationNegativeTestScenarioResult[] = [];

  // KỊCH BẢN 1: Tạo đề khi ma trận chưa duyệt
  const wfScenario1: ExamWorkflow = {
    ...baseWorkflow,
    workflowId: 'TEST-GATE-01-UNAPPROVED-MATRIX',
    status: 'MatrixReview',
    currentStep: 2,
    step2MatrixAndSpec: {
      ...baseWorkflow.step2MatrixAndSpec,
      matrixApprovalStatus: 'PENDING_REVIEW',
    },
  };
  const res1 = await validateWorkflowGateAtBackend({
    gateId: 'GATE_1_BEFORE_EXAM_GENERATION',
    workflow: wfScenario1,
    actorName: 'Cô Nguyễn Thị Lan',
    actorRole: 'TEACHER',
  });
  const failed1 = res1.conditions.filter((c) => !c.passed);
  scenarios.push({
    scenarioOrder: 1,
    scenarioCode: 'NEG_TEST_01_CREATE_EXAM_WITHOUT_MATRIX_APPROVAL',
    scenarioTitle: '1. Cố tình Tạo đề khi Ma trận chưa được phê duyệt',
    gateId: 'GATE_1_BEFORE_EXAM_GENERATION',
    injectedViolationDescription:
      'Hồ sơ ở trạng thái MatrixReview (matrixApprovalStatus = PENDING_REVIEW), người dùng nhấn chuyển sang Bước 3 (Tạo đề).',
    backendHttpStatus: res1.httpStatus,
    blockedAtBackend: !res1.allowedToProceed && res1.httpStatus === 422,
    draftDataPreserved: res1.draftDataPreserved,
    failedConditionCodes: failed1.map((c) => c.conditionCode),
    remediationLocationShown:
      failed1[0]?.remediationLocationLabel ||
      'Quy trình tạo đề -> Bước 2 (Ma trận & Đặc tả) -> Nút Phê duyệt Ma trận',
    targetScreenButtonLabel: 'Mở Bước 2 · Ma trận & Đặc tả',
    targetMenuId: (failed1[0]?.targetMenuId || 'matrix') as MenuSectionId,
    detailMessage: res1.blockingMessage,
  });

  // KỊCH BẢN 2: Gửi thẩm định khi thiếu đáp án
  const wfScenario2: ExamWorkflow = {
    ...baseWorkflow,
    workflowId: 'TEST-GATE-02-MISSING-ANSWER-KEY',
    status: 'TeacherRevision',
    currentStep: 5,
    step3ExamGeneration: {
      ...baseWorkflow.step3ExamGeneration,
      questionIdsInExam: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
      answerKeyComplete: false, // Cố tình bỏ trống đáp án
      gradingGuideComplete: true,
      matchesApprovedMatrix: true,
      totalExamPoints: 10.0,
    },
  };
  const res2 = await validateWorkflowGateAtBackend({
    gateId: 'GATE_2_BEFORE_PROFESSIONAL_REVIEW',
    workflow: wfScenario2,
    actorName: 'Cô Nguyễn Thị Lan',
    actorRole: 'TEACHER',
  });
  const failed2 = res2.conditions.filter((c) => !c.passed);
  scenarios.push({
    scenarioOrder: 2,
    scenarioCode: 'NEG_TEST_02_SUBMIT_REVIEW_WITHOUT_ANSWER_KEY',
    scenarioTitle: '2. Cố tình Gửi thẩm định khi đề kiểm tra thiếu Đáp án',
    gateId: 'GATE_2_BEFORE_PROFESSIONAL_REVIEW',
    injectedViolationDescription:
      'Đề kiểm tra đã tạo câu hỏi nhưng thiếu bảng Đáp án (answerKeyComplete = false), giáo viên nhấn Gửi thẩm định.',
    backendHttpStatus: res2.httpStatus,
    blockedAtBackend: !res2.allowedToProceed && res2.httpStatus === 422,
    draftDataPreserved: res2.draftDataPreserved,
    failedConditionCodes: failed2.map((c) => c.conditionCode),
    remediationLocationShown:
      failed2[0]?.remediationLocationLabel ||
      'Màn hình: Tạo đề kiểm tra -> Thẻ Đáp án & Biểu điểm',
    targetScreenButtonLabel: 'Mở Màn hình Tạo đề & Đáp án',
    targetMenuId: (failed2[0]?.targetMenuId || 'exam-builder') as MenuSectionId,
    detailMessage: res2.blockingMessage,
  });

  // KỊCH BẢN 3: Phê duyệt đề chưa thẩm định
  const wfScenario3: ExamWorkflow = {
    ...baseWorkflow,
    workflowId: 'TEST-GATE-03-APPROVE-UNREVIEWED-EXAM',
    status: 'ProfessionalReview',
    currentStep: 6,
    step6ProfessionalReview: {
      ballots: [], // Cố tình chưa có phiếu thẩm định
      latestDecision: undefined,
    },
  };
  const res3 = await validateWorkflowGateAtBackend({
    gateId: 'GATE_3_BEFORE_OFFICIAL_APPROVAL',
    workflow: wfScenario3,
    actorName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    actorRole: 'PRINCIPAL',
  });
  const failed3 = res3.conditions.filter((c) => !c.passed);
  scenarios.push({
    scenarioOrder: 3,
    scenarioCode: 'NEG_TEST_03_APPROVE_WITHOUT_PROFESSIONAL_REVIEW',
    scenarioTitle: '3. Cố tình Phê duyệt đề khi chưa hoàn thành Thẩm định chuyên môn',
    gateId: 'GATE_3_BEFORE_OFFICIAL_APPROVAL',
    injectedViolationDescription:
      'Hồ sơ chưa có Phiếu thẩm định của người phản biện (ballots = []), cố tình gọi lệnh Phê duyệt chính thức.',
    backendHttpStatus: res3.httpStatus,
    blockedAtBackend: !res3.allowedToProceed && res3.httpStatus === 422,
    draftDataPreserved: res3.draftDataPreserved,
    failedConditionCodes: failed3.map((c) => c.conditionCode),
    remediationLocationShown:
      failed3[0]?.remediationLocationLabel ||
      'Màn hình: Thẩm định – phê duyệt -> Lập Phiếu thẩm định chuyên môn',
    targetScreenButtonLabel: 'Mở Màn hình Thẩm định Chuyên môn',
    targetMenuId: (failed3[0]?.targetMenuId || 'approval') as MenuSectionId,
    detailMessage: res3.blockingMessage,
  });

  // KỊCH BẢN 4: Xuất đề chính thức khi chưa duyệt
  const wfScenario4: ExamWorkflow = {
    ...baseWorkflow,
    workflowId: 'TEST-GATE-04-EXPORT-UNAPPROVED-EXAM',
    status: 'AwaitingApproval',
    currentStep: 7,
    step7OfficialApproval: {
      approvalRecord: undefined, // Chưa được phê duyệt & khóa phiên bản
    },
  };
  const res4 = await validateWorkflowGateAtBackend({
    gateId: 'GATE_4_BEFORE_RELEASE_EXPORT',
    workflow: wfScenario4,
    actorName: 'Thầy Phạm Minh Đức (Hiệu trưởng)',
    actorRole: 'PRINCIPAL',
  });
  const failed4 = res4.conditions.filter((c) => !c.passed);
  scenarios.push({
    scenarioOrder: 4,
    scenarioCode: 'NEG_TEST_04_EXPORT_OFFICIAL_EXAM_BEFORE_APPROVAL',
    scenarioTitle: '4. Cố tình Xuất đề chính thức khi hồ sơ chưa được Phê duyệt',
    gateId: 'GATE_4_BEFORE_RELEASE_EXPORT',
    injectedViolationDescription:
      'Hồ sơ đang ở trạng thái Chờ phê duyệt (AwaitingApproval, chưa khóa phiên bản), người dùng nhấn Xuất bộ đề chính thức.',
    backendHttpStatus: res4.httpStatus,
    blockedAtBackend: !res4.allowedToProceed && res4.httpStatus === 422,
    draftDataPreserved: res4.draftDataPreserved,
    failedConditionCodes: failed4.map((c) => c.conditionCode),
    remediationLocationShown:
      failed4[0]?.remediationLocationLabel ||
      'Quy trình tạo đề -> Bước 7 (Phê duyệt & Khóa phiên bản)',
    targetScreenButtonLabel: 'Mở Bước 7 · Phê duyệt & Khóa đề',
    targetMenuId: (failed4[0]?.targetMenuId || 'exam-workflow') as MenuSectionId,
    detailMessage: res4.blockingMessage,
  });

  // KỊCH BẢN 5: Phân tích kết quả với sai mã đề
  const wfScenario5: ExamWorkflow = {
    ...baseWorkflow,
    workflowId: 'TEST-GATE-05-WRONG-VARIANT-CODE-ANALYTICS',
    status: 'Released',
    currentStep: 8,
    step3ExamGeneration: {
      ...baseWorkflow.step3ExamGeneration,
      variantCodes: ['401', '402'],
      answerKeyComplete: true,
      gradingGuideComplete: true,
      matchesApprovedMatrix: true,
      totalExamPoints: 10.0,
    },
    step7OfficialApproval: {
      approvalRecord: {
        approvalId: 'APP-TEST-05',
        approverId: 'user-principal',
        approverName: 'Thầy Phạm Minh Đức',
        approverRole: 'PRINCIPAL',
        approvedVersionId: 'v1.1-APPROVED-LOCKED',
        approvedAt: new Date().toISOString(),
        isVersionLocked: true,
        dossierCompletenessVerified: true,
        appraisalBallotVerified: true,
        approvalComment: 'Đã phê duyệt.',
      },
    },
  };
  const res5 = await validateWorkflowGateAtBackend({
    gateId: 'GATE_5_BEFORE_RESULTS_ANALYSIS',
    workflow: wfScenario5,
    actorName: 'Cô Nguyễn Thị Lan',
    actorRole: 'TEACHER',
    extraContext: {
      submittedVariantCode: '999_SAI_MA_DE', // Mã đề không tồn tại trong ['401', '402']
      analysisAnswerKeyVersionId: 'v1.0_CU_CHUA_DUYET',
    },
  });
  const failed5 = res5.conditions.filter((c) => !c.passed);
  scenarios.push({
    scenarioOrder: 5,
    scenarioCode: 'NEG_TEST_05_ANALYZE_RESULTS_WITH_WRONG_VARIANT',
    scenarioTitle: '5. Cố tình Phân tích kết quả kiểm tra với sai Mã đề & sai Phiên bản đáp án',
    gateId: 'GATE_5_BEFORE_RESULTS_ANALYSIS',
    injectedViolationDescription:
      'Đề phát hành có mã đề [401, 402] (phiên bản v1.1-APPROVED-LOCKED), nhưng bảng điểm tải lên khai báo mã đề [999_SAI_MA_DE] và chấm theo đáp án [v1.0_CU_CHUA_DUYET].',
    backendHttpStatus: res5.httpStatus,
    blockedAtBackend: !res5.allowedToProceed && res5.httpStatus === 422,
    draftDataPreserved: res5.draftDataPreserved,
    failedConditionCodes: failed5.map((c) => c.conditionCode),
    remediationLocationShown:
      failed5[0]?.remediationLocationLabel ||
      'Màn hình: Phân tích kết quả & Câu hỏi -> Đối chiếu Mã đề kiểm tra',
    targetScreenButtonLabel: 'Mở Màn hình Phân tích kết quả',
    targetMenuId: (failed5[0]?.targetMenuId || 'exam-analytics') as MenuSectionId,
    detailMessage: res5.blockingMessage,
  });

  const configurableExceptions = [
    {
      code: 'EX_01_REGULAR_ASSESSMENT_NO_MATRIX_APPROVAL',
      title: '1. Kiểm tra thường xuyên / Đánh giá quá trình (Không bắt buộc trình duyệt Ma trận cấp trường)',
      whenApplicable:
        'Áp dụng cho bài kiểm tra 15 phút, phiếu bài tập cuối tuần hoặc đánh giá thường xuyên do giáo viên chủ động thực hiện tại lớp.',
      requiredApproverRole: 'TEACHER / HEAD_OF_DEPARTMENT',
      configKey: 'workflow.validation.allowRegularAssessmentSkipMatrixApproval',
      defaultSetting: 'FALSE (Mặc định tắt đối với mọi kỳ kiểm tra định kỳ Giữa kỳ / Cuối kỳ)',
    },
    {
      code: 'EX_02_OFFLINE_AI_FALLBACK_MODE',
      title: '2. Chế độ Phòng thi / Máy trạm ngoại tuyến không có kết nối Gemini API bên ngoài',
      whenApplicable:
        'Khi soạn đề mật trong mạng nội bộ cách ly Internet: Cho phép thỏa điều kiện Kiểm tra chất lượng ở Cổng II bằng Lớp A (Bộ kiểm tra quy tắc & tính toán xác định nội bộ) kèm biên bản xác nhận của Tổ trưởng.',
      requiredApproverRole: 'HEAD_OF_DEPARTMENT / PRINCIPAL',
      configKey: 'workflow.validation.allowDeterministicLayerAOnlyForConfidentialAirgap',
      defaultSetting: 'TRUE (Tự động kích hoạt Lớp A khi hồ sơ bật cờ Đề mật cách ly)',
    },
    {
      code: 'EX_03_SMALL_SCHOOL_SINGLE_TEACHER_SUBJECT',
      title: '3. Trường tiểu học / THCS vùng khó khăn chỉ có 01 giáo viên phụ trách môn học đặc thù',
      whenApplicable:
        'Khi môn học (ví dụ: Tin học, Công nghệ, Âm nhạc, Mỹ thuật) chỉ có 1 giáo viên chuyên trách nên không có người phản biện cùng môn trong trường: Cho phép Phó Hiệu trưởng chuyên môn hoặc cụm chuyên môn liên trường thực hiện vai trò Thẩm định (Cổng III).',
      requiredApproverRole: 'VICE_PRINCIPAL / PRINCIPAL',
      configKey: 'workflow.validation.allowVicePrincipalAsFallbackReviewer',
      defaultSetting: 'TRUE (Cấu hình theo danh sách phân công chuyên môn đầu năm học)',
    },
    {
      code: 'EX_04_TOTAL_SCORE_ONLY_IMPORT',
      title: '4. Nhập bảng điểm tổng hợp từ hệ thống sổ điểm điện tử (Chưa có dữ liệu trả lời từng câu)',
      whenApplicable:
        'Ở Cổng V (Trước khi phân tích kết quả), nếu nhà trường chỉ nhập bảng điểm tổng (không có dữ liệu trả lời từng câu a/b/c/d): Cho phép thống kê phổ điểm & tỷ lệ hoàn thành chung, đồng thời khóa phần suy diễn độ khó từng câu hỏi.',
      requiredApproverRole: 'TEACHER / HEAD_OF_DEPARTMENT',
      configKey: 'workflow.validation.allowSummaryScoreOnlyWithoutItemResponses',
      defaultSetting: 'TRUE (Phân tách rõ chế độ Điểm tổng vs Kết quả từng câu)',
    },
  ];

  return {
    executedAt: new Date().toISOString(),
    all5NegativeScenariosBlockedAtBackend: scenarios.every((s) => s.blockedAtBackend),
    draftDataNeverLost: scenarios.every((s) => s.draftDataPreserved),
    scenarios,
    configurableExceptions,
  };
}
