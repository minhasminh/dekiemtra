// ============================================================================
// EDU TEST AI – GIAI ĐOẠN 17: FIREBASE SECURITY RULES & ACCESS CONTROL ENGINE
// Đáp ứng đầy đủ Mục I -> X:
// - Nguyên tắc DENY BY DEFAULT (Mặc định từ chối).
// - Phân biệt Firebase Auth UID (request.auth.uid) và mã hồ sơ giáo viên (teacherProfileId).
// - Ma trận phân quyền chi tiết cho 15 Bộ sưu tập Firestore (Read, Create, Update, Delete).
// - Kiểm soát 6 loại tệp trên Firebase Storage (Tải lên, Đọc, Tải xuống, Thay thế phiên bản, Xóa).
// - Backend Guard cho Firebase Admin SDK (vì Admin SDK bỏ qua Firestore Rules).
// - Bộ kiểm thử tự động 10 kịch bản Security Rules (chỉ rõ trường hợp ALLOWED và DENIED).
// ============================================================================

export interface FirestoreCollectionRuleMatrixRow {
  order: number;
  collectionName: string;
  firestorePath: string;
  vietnameseTitle: string;
  readRule: string;
  createRule: string;
  updateRule: string;
  deleteRule: string;
  clientDirectWriteBlockedFields: string[];
}

export const STAGE17_15_COLLECTIONS_RULES_MATRIX: FirestoreCollectionRuleMatrixRow[] = [
  {
    order: 1,
    collectionName: 'schools',
    firestorePath: 'schools/{schoolId}',
    vietnameseTitle: '1. Thông tin & cấu hình trường học',
    readRule: 'isSignedIn() && belongsToSchool(schoolId) (Tài khoản đang ACTIVE thuộc trường)',
    createRule: 'Chỉ Platform Bootstrap Admin / Backend Provisioning',
    updateRule: 'Chỉ Ban Giám hiệu (PRINCIPAL / VICE_PRINCIPAL) của đúng trường; giữ nguyên id, createdAt',
    deleteRule: 'if false (Cấm xóa trường học từ Client)',
    clientDirectWriteBlockedFields: ['id', 'createdAt', 'createdBy'],
  },
  {
    order: 2,
    collectionName: 'users',
    firestorePath: 'schools/{schoolId}/users/{authUid}',
    vietnameseTitle: '2. Hồ sơ tài khoản & phạm vi quyền giáo viên (Khóa = Firebase UID, tách biệt teacherProfileId)',
    readRule: 'belongsToSchool(schoolId) (Thông tin PII nhạy cảm tách riêng tại /users/{uid}/private)',
    createRule: 'isSchoolLeadershipOrAdmin(schoolId) && cấm tự gán SYSTEM_ADMIN / PRINCIPAL từ Client',
    updateRule: 'Chủ tài khoản chỉ sửa fullName; cấm tự sửa roles, status, allowedSubjectsCsv, canApproveFinalExam',
    deleteRule: 'if false (Chỉ cho phép khóa/ngừng kích hoạt qua Backend)',
    clientDirectWriteBlockedFields: [
      'roles (tự nâng quyền)',
      'status',
      'canApproveFinalExam',
      'canReadConfidentialExam',
      'password / passwordHash (cấm lưu)',
    ],
  },
  {
    order: 3,
    collectionName: 'departments',
    firestorePath: 'schools/{schoolId}/departments/{departmentId}',
    vietnameseTitle: '3. Tổ chuyên môn (6 tổ mặc định của trường)',
    readRule: 'belongsToSchool(schoolId)',
    createRule: 'isSchoolLeadershipOrAdmin(schoolId) && incoming().schoolId == schoolId',
    updateRule: 'isSchoolLeadershipOrAdmin(schoolId) && giữ nguyên createdAt',
    deleteRule: 'if false (Sử dụng trạng thái INACTIVE thay vì xóa vật lý)',
    clientDirectWriteBlockedFields: ['schoolId', 'createdAt'],
  },
  {
    order: 4,
    collectionName: 'teachingAssignments',
    firestorePath: 'schools/{schoolId}/teachingAssignments/{assignmentId}',
    vietnameseTitle: '4. Phân công giảng dạy (Môn học, Khối lớp, Lớp phụ trách)',
    readRule: 'belongsToSchool(schoolId)',
    createRule: 'isSchoolLeadershipOrAdmin(schoolId) && incoming().schoolId == schoolId',
    updateRule: 'isSchoolLeadershipOrAdmin(schoolId) && giữ nguyên createdAt',
    deleteRule: 'isSchoolLeadershipOrAdmin(schoolId)',
    clientDirectWriteBlockedFields: ['schoolId', 'createdAt'],
  },
  {
    order: 5,
    collectionName: 'permissions',
    firestorePath: 'schools/{schoolId}/permissions/{permissionId}',
    vietnameseTitle: '5. Phân quyền chuyên môn & thẩm quyền phê duyệt',
    readRule: 'Chủ sở hữu quyền (userId == request.auth.uid) hoặc Ban Giám hiệu / Quản trị viên trường',
    createRule: 'if false từ Client (Bắt buộc cấp quyền qua Backend Admin Guard có kiểm tra thẩm quyền)',
    updateRule: 'if false từ Client (Chặn tuyệt đối tự cấp quyền hoặc tự bật quyền phê duyệt)',
    deleteRule: 'if false từ Client',
    clientDirectWriteBlockedFields: [
      'Toàn bộ thao tác ghi trực tiếp từ Client bị chặn (chỉ ghi qua Backend Guard)',
    ],
  },
  {
    order: 6,
    collectionName: 'curriculum',
    firestorePath: 'schools/{schoolId}/curriculum/{curriculumId}',
    vietnameseTitle: '6. Chương trình GDPT 2018, chủ đề & yêu cầu cần đạt',
    readRule: 'belongsToSchool(schoolId) (Giáo viên đọc chương trình trong phạm vi trường)',
    createRule: '(isHeadOfDepartment || isBoardOfDirectors) && hasSubjectAndGradeScope(subject, grade)',
    updateRule: '(isHeadOfDepartment || isBoardOfDirectors) && !isLockedOrApprovedStatus(existing().status)',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: ['schoolId', 'createdAt'],
  },
  {
    order: 7,
    collectionName: 'questions',
    firestorePath: 'schools/{schoolId}/questions/{questionId}',
    vietnameseTitle: '7. Ngân hàng câu hỏi & câu hỏi thuộc đề mật',
    readRule: 'belongsToSchool(schoolId) && canReadConfidentialExamData (Chặn đọc câu hỏi SECRET_EXAM trái phép)',
    createRule: 'hasFunctionalPermission("CREATE_QUESTION") && hasSubjectAndGradeScope(subject, grade) && status == "DRAFT"',
    updateRule: '!isLockedOrApprovedStatus(existing.status) && (Chủ sở hữu sửa bản DRAFT của mình || Tổ trưởng cùng tổ thẩm định APPRAISED)',
    deleteRule: 'if false (Chỉ xóa mềm isSoftDeleted)',
    clientDirectWriteBlockedFields: ['createdBy', 'subject', 'grade', 'status = APPROVED'],
  },
  {
    order: 8,
    collectionName: 'matrices',
    firestorePath: 'schools/{schoolId}/matrices/{matrixId}',
    vietnameseTitle: '8. Ma trận đề kiểm tra định kỳ (Công văn 7991)',
    readRule: 'Người tạo, Tổ trưởng cùng tổ, BGH hoặc Giáo viên được phân công cùng Môn & Khối',
    createRule: 'hasFunctionalPermission("CREATE_MATRIX") && hasSubjectAndGradeScope(subject, grade) && status == "DRAFT"',
    updateRule: '!isLockedOrApprovedStatus(existing.status) && (Chủ sở hữu sửa DRAFT || Tổ trưởng thẩm định APPRAISED)',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: ['status = APPROVED', 'createdBy', 'createdAt'],
  },
  {
    order: 9,
    collectionName: 'specifications',
    firestorePath: 'schools/{schoolId}/specifications/{specificationId}',
    vietnameseTitle: '9. Bản đặc tả đề kiểm tra',
    readRule: 'belongsToSchool(schoolId)',
    createRule: 'hasFunctionalPermission("CREATE_MATRIX") && hasSubjectAndGradeScope(subject, grade) && status == "DRAFT"',
    updateRule: '!isLockedOrApprovedStatus(existing.status) && (Chủ sở hữu sửa DRAFT || Tổ trưởng thẩm định APPRAISED)',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: ['status = APPROVED', 'createdBy'],
  },
  {
    order: 10,
    collectionName: 'exams',
    firestorePath: 'schools/{schoolId}/exams/{examId}',
    vietnameseTitle: '10. Đề kiểm tra chính thức, đề nháp & đề mật (SECRET_EXAM)',
    readRule: 'canReadConfidentialExamData (Chặn GV không được phân công, chặn Tổ trưởng ngoài tổ & chặn cả SYSTEM_ADMIN đọc đề mật)',
    createRule: 'hasFunctionalPermission("CREATE_EXAM") && hasSubjectAndGradeScope(subject, grade) && status == "DRAFT"',
    updateRule: '!isLockedOrApprovedStatus(existing.status) && (Người tạo/được gán sửa DRAFT || Tổ trưởng cùng tổ chuyển sang APPRAISED; cấm tự ghi APPROVED)',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: [
      'status = APPROVED / PUBLISHED',
      'createdBy',
      'subject',
      'grade',
    ],
  },
  {
    order: 11,
    collectionName: 'aiReviews',
    firestorePath: 'schools/{schoolId}/aiReviews/{reviewId}',
    vietnameseTitle: '11. Báo cáo AI kiểm tra chất lượng câu hỏi & đề kiểm tra',
    readRule: 'belongsToSchool(schoolId)',
    createRule: 'belongsToSchool(schoolId) && createdBy == request.auth.uid',
    updateRule: 'existing.createdBy == request.auth.uid && !isLockedOrApprovedStatus(existing.status)',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: ['createdBy', 'createdAt'],
  },
  {
    order: 12,
    collectionName: 'approvals',
    firestorePath: 'schools/{schoolId}/approvals/{approvalId}',
    vietnameseTitle: '12. Hồ sơ thẩm định cấp Tổ & Quyết định phê duyệt của Ban Giám hiệu',
    readRule: 'Ban Giám hiệu, Tổ trưởng cùng tổ hoặc người tạo/người thẩm định hồ sơ',
    createRule: 'Tổ trưởng chỉ được tạo biên bản thẩm định cấp tổ (status == "APPRAISED") của chính mình; Quyết định phê duyệt cuối cùng (APPROVED) bắt buộc qua Backend Guard của BGH',
    updateRule: 'if false (Hồ sơ phê duyệt là bản ghi kiểm toán bất biến)',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: [
      'status = APPROVED (tự phê duyệt cuối cùng từ Client)',
      'reviewerUserId != request.auth.uid (giả mạo xác nhận của người khác)',
    ],
  },
  {
    order: 13,
    collectionName: 'examWorkflows',
    firestorePath: 'schools/{schoolId}/examWorkflows/{workflowId}',
    vietnameseTitle: '13. Hồ sơ quy trình khảo thí 9 bước',
    readRule: 'BGH, Tổ trưởng cùng tổ hoặc Giáo viên trong phạm vi Môn & Khối',
    createRule: 'belongsToSchool(schoolId) && hasSubjectAndGradeScope(subject, grade) && status == "DRAFT"',
    updateRule: '!isLockedOrApprovedStatus(existing.status) && chỉ chuyển trạng thái tuần tự (DRAFT -> IN_PROGRESS -> SUBMITTED_FOR_REVIEW -> APPRAISED); cấm nhảy cóc sang APPROVED',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: ['status = APPROVED / PUBLISHED'],
  },
  {
    order: 14,
    collectionName: 'examResults',
    firestorePath: 'schools/{schoolId}/examResults/{resultId}',
    vietnameseTitle: '14. Kết quả chấm điểm & phân tích phổ điểm sau kiểm tra',
    readRule: 'BGH, Tổ trưởng cùng tổ hoặc Giáo viên dạy đúng Môn & Khối',
    createRule: 'belongsToSchool(schoolId) && hasSubjectAndGradeScope(subject, grade) && createdBy == request.auth.uid',
    updateRule: 'existing.createdBy == request.auth.uid && !isLockedOrApprovedStatus(existing.status)',
    deleteRule: 'if false',
    clientDirectWriteBlockedFields: ['createdBy', 'createdAt'],
  },
  {
    order: 15,
    collectionName: 'auditLogs',
    firestorePath: 'schools/{schoolId}/auditLogs/{logId}',
    vietnameseTitle: '15. Nhật ký bảo mật & kiểm toán hệ thống (Immutable Security Audit Logs)',
    readRule: 'Chỉ Ban Giám hiệu (PRINCIPAL / VICE_PRINCIPAL) và Quản trị viên (SYSTEM_ADMIN) của trường',
    createRule: 'if false từ Client (Mục VII: Cấm Client tự ghi/chèn giả nhật ký bảo mật; chỉ Backend Admin SDK ghi)',
    updateRule: 'if false (Bất biến 100%)',
    deleteRule: 'if false (Bất biến 100%)',
    clientDirectWriteBlockedFields: ['Toàn bộ thao tác create/update/delete từ Client bị chặn'],
  },
];

// ============================================================================
// MỤC VIII: MA TRẬN KIỂM SOÁT 6 PHÂN LOẠI TỆP TRÊN FIREBASE STORAGE
// ============================================================================

export interface StorageCategorySecurityRow {
  categoryCode: string;
  vietnameseName: string;
  mappedModules: string[];
  accessLevel: string;
  uploadRule: string;
  readAndDownloadRule: string;
  replaceVersionRule: string;
  deleteRule: string;
  publicUrlPolicy: string;
}

export const STAGE17_STORAGE_6_CATEGORIES_SECURITY: StorageCategorySecurityRow[] = [
  {
    categoryCode: 'NORMAL_DOCUMENT',
    vietnameseName: '1. Tài liệu thông thường (Chương trình, Ngữ liệu, Bảng tính mẫu)',
    mappedModules: ['WORD_DOCUMENT', 'EXCEL_SPREADSHEET', 'CORPUS_MATERIAL'],
    accessLevel: 'SCHOOL_INTERNAL',
    uploadRule: 'Đã đăng nhập + thuộc trường + đúng định dạng MIME + dung lượng <= 15 MB',
    readAndDownloadRule: 'Giáo viên, Tổ trưởng, BGH đang hoạt động (ACTIVE) thuộc cùng trường (schoolId)',
    replaceVersionRule: 'Tạo versionId mới (v1 -> v2) hoặc cập nhật khi tệp chưa khóa (status != LOCKED/APPROVED)',
    deleteRule: 'Cấm xóa vật lý từ Client (allow delete: if false); chỉ xóa mềm metadata',
    publicUrlPolicy: 'Truy cập nội bộ trường có xác thực Firebase Auth',
  },
  {
    categoryCode: 'QUESTION_ASSET',
    vietnameseName: '2. Tệp hình ảnh & học liệu câu hỏi',
    mappedModules: ['QUESTION_IMAGE'],
    accessLevel: 'SCHOOL_INTERNAL / DEPARTMENT_SCOPED',
    uploadRule: 'Giáo viên có quyền CREATE_QUESTION trong phạm vi Môn/Khối + ảnh <= 10 MB',
    readAndDownloadRule: 'Giáo viên cùng trường (nếu câu hỏi thuộc đề mật thì áp dụng quy tắc CONFIDENTIAL_EXAM)',
    replaceVersionRule: 'Chủ sở hữu câu hỏi tạo phiên bản mới khi câu hỏi đang ở trạng thái DRAFT',
    deleteRule: 'allow delete: if false (Xóa mềm metadata)',
    publicUrlPolicy: 'Không mở public cho hình ảnh thuộc câu hỏi đề mật',
  },
  {
    categoryCode: 'CONFIDENTIAL_EXAM',
    vietnameseName: '3. Đề kiểm tra mật (Đề chính thức, Đề dự bị, Gói hồ sơ đề)',
    mappedModules: ['PDF_DOCUMENT', 'EXAM_DOSSIER_PACKAGE'],
    accessLevel: 'CONFIDENTIAL_EXAM',
    uploadRule: 'Người tạo đề / Hội đồng ra đề + bắt buộc publicUrlAllowed == false',
    readAndDownloadRule:
      'Chỉ người tạo, thành viên Hội đồng đề được phân công (assignedUserIdsCsv) hoặc Ban Giám hiệu có quyền đọc đề mật. Quản trị viên kỹ thuật (SYSTEM_ADMIN) bị chặn!',
    replaceVersionRule: 'Cấm ghi đè sau khi đã phê duyệt (APPROVED); phải tạo versionId mới trước khi khóa',
    deleteRule: 'allow delete: if false (Niêm phong lưu trữ)',
    publicUrlPolicy: 'CẤM TUYỆT ĐỐI URL CÔNG KHAI VĨNH VIỄN (Chỉ cấp Signed Ephemeral Token 5 phút)',
  },
  {
    categoryCode: 'SECRET_ANSWER_KEY',
    vietnameseName: '4. Đáp án & Hướng dẫn chấm mật',
    mappedModules: ['PDF_DOCUMENT', 'WORD_DOCUMENT'],
    accessLevel: 'SECRET_ANSWER_KEY',
    uploadRule: 'Người ra đề / Tổ trưởng thẩm định + bắt buộc publicUrlAllowed == false',
    readAndDownloadRule:
      'Bảo vệ riêng biệt: Chỉ mở cho Hội đồng chấm/thẩm định được gán hoặc Ban Giám hiệu sau thời điểm mở niêm phong',
    replaceVersionRule: 'Chỉ cho phép tạo phiên bản mới trước khi đề chuyển sang APPROVED',
    deleteRule: 'allow delete: if false',
    publicUrlPolicy: 'CẤM TUYỆT ĐỐI URL CÔNG KHAI VĨNH VIỄN',
  },
  {
    categoryCode: 'APPRAISAL_DOSSIER',
    vietnameseName: '5. Hồ sơ & Biên bản thẩm định chuyên môn',
    mappedModules: ['APPRAISAL_REPORT'],
    accessLevel: 'DEPARTMENT_SCOPED',
    uploadRule: 'Tổ trưởng chuyên môn / Giáo viên phản biện thuộc đúng Tổ chuyên môn',
    readAndDownloadRule: 'Thành viên thuộc đúng Tổ chuyên môn (departmentId) và Ban Giám hiệu',
    replaceVersionRule: 'Tạo phiên bản biên bản mới theo từng vòng phản biện (v1, v2)',
    deleteRule: 'allow delete: if false',
    publicUrlPolicy: 'Giới hạn trong nội bộ Tổ chuyên môn & BGH',
  },
  {
    categoryCode: 'RESULT_REPORT',
    vietnameseName: '6. Báo cáo kết quả & Thống kê phổ điểm',
    mappedModules: ['RESULT_ANALYSIS_REPORT'],
    accessLevel: 'LEADERSHIP_ONLY',
    uploadRule: 'Giáo viên bộ môn / Tổ trưởng / BGH tải lên báo cáo thống kê',
    readAndDownloadRule: 'Ban Giám hiệu, Tổ trưởng chuyên môn và người lập báo cáo',
    replaceVersionRule: 'Tạo phiên bản cập nhật sau phúc khảo',
    deleteRule: 'allow delete: if false',
    publicUrlPolicy: 'Không tạo URL công khai; kiểm soát theo vai trò lãnh đạo',
  },
];

// ============================================================================
// MỤC X: CẤU TRÚC KẾT QUẢ KIỂM THỬ TỰ ĐỘNG 10 KỊCH BẢN SECURITY RULES
// ============================================================================

export interface SecurityRulesScenarioAssertion {
  caseLabel: string;
  operation: string;
  targetPath: string;
  actorDescription: string;
  expectedDecision: 'ALLOW' | 'DENY';
  actualDecision: 'ALLOW' | 'DENY';
  httpStatus: number;
  ruleEvaluated: string;
  explanation: string;
  passed: boolean;
}

export interface SecurityRules10ScenarioItem {
  order: number;
  scenarioCode: string;
  title: string;
  requirementRef: string;
  deniedAssertion: SecurityRulesScenarioAssertion;
  allowedCounterpartAssertion: SecurityRulesScenarioAssertion;
  passed: boolean;
}

export interface SecurityRules10ScenariosReport {
  runId: string;
  executedAt: string;
  engineMode: string;
  firestoreRulesLinesCount: number;
  storageRulesLinesCount: number;
  denyByDefaultVerified: boolean;
  noOpenWildcardRulesVerified: boolean;
  uidVsTeacherCodeSeparated: boolean;
  adminSdkBackendGuardActive: boolean;
  totalScenarios: number;
  passedScenarios: number;
  allPassed: boolean;
  scenarios: SecurityRules10ScenarioItem[];
}

export async function run10SecurityRulesEmulatorScenariosService(): Promise<SecurityRules10ScenariosReport | null> {
  try {
    const res = await fetch('/api/firebase/security-rules/run-10-emulator-scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.report || null;
  } catch {
    return null;
  }
}

export async function executeProtectedAdminActionViaBackendService(params: {
  schoolId: string;
  actorAuthUid: string;
  actorTeacherProfileId: string;
  actorRole: string;
  actorCanApproveFinalExam?: boolean;
  actionType:
    | 'GRANT_ADMIN_ROLE'
    | 'GRANT_APPROVAL_PERMISSION'
    | 'FINAL_APPROVE_EXAM'
    | 'WRITE_SECURITY_AUDIT_LOG'
    | 'CONFIRM_ON_BEHALF_OF_OTHER_USER';
  targetId: string;
  payload: Record<string, unknown>;
}): Promise<{
  ok: boolean;
  httpStatus: number;
  decision: 'ALLOW' | 'DENY';
  message: string;
  ruleTriggered: string;
}> {
  try {
    const res = await fetch('/api/firebase/security-rules/protected-admin-mutation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      httpStatus: res.status,
      decision: data.decision || (res.ok ? 'ALLOW' : 'DENY'),
      message: data.message || '',
      ruleTriggered: data.ruleTriggered || '',
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 500,
      decision: 'DENY',
      message: err instanceof Error ? err.message : 'Lỗi kết nối Backend Security Guard.',
      ruleTriggered: 'NETWORK_ERROR',
    };
  }
}
