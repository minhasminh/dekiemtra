import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebaseClient';

export enum FirestoreOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreCollectionArchitectureSpec {
  order: number;
  collectionId: string;
  firestorePathPattern: string;
  vietnameseTitle: string;
  primaryKeyFormat: string;
  keyFields: string[];
  hasVersionSubcollection: boolean;
  versionSubcollectionPath?: string;
  antiDuplicationAndSizeRule: string;
  securityRuleSummary: string;
}

export interface FirestoreCompositeIndexSpec {
  indexId: string;
  queryUseCaseTitle: string;
  collectionGroup: string;
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
  fields: Array<{
    fieldPath: string;
    order: 'ASCENDING' | 'DESCENDING';
  }>;
  firestoreQueryPattern: string;
}

export const STAGE17_FIRESTORE_COLLECTIONS_SPEC: FirestoreCollectionArchitectureSpec[] = [
  {
    order: 1,
    collectionId: 'schools',
    firestorePathPattern: 'schools/{schoolId}',
    vietnameseTitle: '1. Đơn vị Trường học (Multi-Tenant Root)',
    primaryKeyFormat: 'sch_{code} (VD: sch-th-thcs-nguyen-du)',
    keyFields: ['id', 'code', 'name', 'governingBody', 'educationLevels', 'academicYear', 'configJson', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Chỉ lưu thông tin định danh và cấu hình cấp trường (< 8 KB/document).',
    securityRuleSummary: 'belongsToSchool(schoolId) được đọc; chỉ isSchoolLeadership(schoolId) được cập nhật.',
  },
  {
    order: 2,
    collectionId: 'users',
    firestorePathPattern: 'schools/{schoolId}/users/{userId}',
    vietnameseTitle: '2. Hồ sơ Giáo viên & Cán bộ thuộc Trường',
    primaryKeyFormat: 'usr_{uuid/uid} (Không dùng email hoặc họ tên làm khóa chính)',
    keyFields: ['id', 'schoolId', 'username', 'fullName', 'departmentId', 'departmentName', 'roles', 'assignedSubjects', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Mỗi giáo viên là 1 document độc lập; tách dữ liệu PII sang /users/{userId}/private/pii; tuyệt đối không lưu mật khẩu.',
    securityRuleSummary: 'Chặn client tự nâng quyền quản trị (roles phải giữ nguyên nếu không phải Admin/Lãnh đạo).',
  },
  {
    order: 3,
    collectionId: 'departments',
    firestorePathPattern: 'schools/{schoolId}/departments/{departmentId}',
    vietnameseTitle: '3. Tổ Chuyên môn',
    primaryKeyFormat: 'dept_{code} (VD: dept-khtn, dept-123)',
    keyFields: ['id', 'schoolId', 'code', 'name', 'educationLevelsCsv', 'headUserId', 'headFullName', 'deputyUserId', 'memberCount', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Không lưu danh sách giáo viên lớn trong một mảng duy nhất; liên kết qua departmentId trên users và teachingAssignments.',
    securityRuleSummary: 'belongsToSchool(schoolId) được đọc; chỉ Lãnh đạo/Admin được tạo hoặc sửa tổ chuyên môn.',
  },
  {
    order: 4,
    collectionId: 'teachingAssignments',
    firestorePathPattern: 'schools/{schoolId}/teachingAssignments/{assignmentId}',
    vietnameseTitle: '4. Phân công Giảng dạy',
    primaryKeyFormat: 'asg_{year}_{userId}_{subjectCode}_G{grade}',
    keyFields: ['id', 'schoolId', 'userId', 'teacherName', 'departmentId', 'academicYear', 'levelId', 'subject', 'grade', 'classNamesCsv', 'professionalRole', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Tách từng bản ghi phân công theo giáo viên - năm học - môn - khối để truy vấn nhanh.',
    securityRuleSummary: 'Chỉ Lãnh đạo/Admin được phép tạo hoặc cập nhật phân công giảng dạy.',
  },
  {
    order: 5,
    collectionId: 'permissions',
    firestorePathPattern: 'schools/{schoolId}/permissions/{permissionId}',
    vietnameseTitle: '5. Phân quyền Chuyên môn (RBAC/ABAC)',
    primaryKeyFormat: 'perm_{userId}_{levelId}_{subjectCode}_G{grade}',
    keyFields: ['id', 'schoolId', 'userId', 'roleCode', 'levelId', 'subject', 'grade', 'permissionCodesCsv', 'canApproveExam', 'canAccessSecretExam', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Khóa permissionId xác định (deterministic ID) giúp Security Rules kiểm tra trực tiếp bằng exists()/get().',
    securityRuleSummary: 'Không để client tự cấp quyền; chỉ isSchoolLeadership(schoolId) hoặc isAdmin() mới được ghi.',
  },
  {
    order: 6,
    collectionId: 'curriculum',
    firestorePathPattern: 'schools/{schoolId}/curriculum/{curriculumId}',
    vietnameseTitle: '6. Chương trình Giáo dục, Chủ đề & Yêu cầu cần đạt',
    primaryKeyFormat: 'cur_{levelId}_G{grade}_{subjectCode}_{topicNo}',
    keyFields: ['id', 'schoolId', 'levelId', 'grade', 'subject', 'chapterCode', 'chapterTitle', 'topicTitle', 'learningOutcomesSummary', 'sourceReference', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Mỗi chủ đề/mạch nội dung là 1 document gọn nhẹ (< 10 KB).',
    securityRuleSummary: 'Giáo viên trong trường được đọc; cập nhật được kiểm soát theo schoolId.',
  },
  {
    order: 7,
    collectionId: 'questions',
    firestorePathPattern: 'schools/{schoolId}/questions/{questionId}',
    vietnameseTitle: '7. Ngân hàng Câu hỏi Chuẩn hóa (+ Bộ sưu tập Phiên bản)',
    primaryKeyFormat: 'q_{timestamp}_{hash} (Không lưu cả ngân hàng trong 1 document)',
    keyFields: ['id', 'schoolId', 'code', 'levelId', 'grade', 'subject', 'curriculumId', 'format', 'cognitiveLevel', 'stem', 'optionsJson', 'correctAnswer', 'points', 'mediaStoragePath', 'securityClassification', 'status', 'version', 'isSoftDeleted', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: true,
    versionSubcollectionPath: 'schools/{schoolId}/questions/{questionId}/versions/{versionId}',
    antiDuplicationAndSizeRule: 'Mỗi câu hỏi là 1 document độc lập; hình ảnh/âm thanh lưu trên Firebase Storage qua mediaStoragePath; lịch sử sửa lưu tại subcollection versions.',
    securityRuleSummary: 'Tác giả được tạo/sửa bản nháp; chặn client thường tự ghi status = APPROVED.',
  },
  {
    order: 8,
    collectionId: 'matrices',
    firestorePathPattern: 'schools/{schoolId}/matrices/{matrixId}',
    vietnameseTitle: '8. Ma trận Đề kiểm tra Định kỳ',
    primaryKeyFormat: 'mtx_{year}_{subjectCode}_G{grade}_{seq}',
    keyFields: ['id', 'schoolId', 'code', 'title', 'academicYear', 'levelId', 'grade', 'subject', 'structureJson', 'totalPoints', 'version', 'isSoftDeleted', 'status', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Lưu cấu trúc tỷ lệ nhận thức và tổng điểm; không sao chép nội dung câu hỏi vào ma trận.',
    securityRuleSummary: 'Chặn client thường tự ghi trạng thái APPROVED.',
  },
  {
    order: 9,
    collectionId: 'specifications',
    firestorePathPattern: 'schools/{schoolId}/specifications/{specificationId}',
    vietnameseTitle: '9. Bản Đặc tả Đề kiểm tra',
    primaryKeyFormat: 'spec_{matrixId}_v{version}',
    keyFields: ['id', 'schoolId', 'matrixId', 'code', 'title', 'levelId', 'grade', 'subject', 'specCellsJson', 'version', 'status', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Liên kết 1-1 hoặc 1-N với ma trận qua matrixId.',
    securityRuleSummary: 'Cô lập theo schoolId và kiểm tra quyền tạo bản đặc tả.',
  },
  {
    order: 10,
    collectionId: 'exams',
    firestorePathPattern: 'schools/{schoolId}/exams/{examId}',
    vietnameseTitle: '10. Đề Kiểm tra Định kỳ (+ Bộ sưu tập Phiên bản)',
    primaryKeyFormat: 'exam_{year}_{subjectCode}_G{grade}_{seq}',
    keyFields: ['id', 'schoolId', 'code', 'title', 'academicYear', 'levelId', 'grade', 'subject', 'departmentId', 'matrixId', 'specificationId', 'questionIdsCsv', 'variantCodesCsv', 'totalPoints', 'exportedFileStoragePath', 'securityClassification', 'version', 'isSoftDeleted', 'status', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: true,
    versionSubcollectionPath: 'schools/{schoolId}/exams/{examId}/versions/{versionId}',
    antiDuplicationAndSizeRule: 'Chỉ lưu danh sách ID câu hỏi (questionIdsCsv) và đường dẫn tệp DOCX/PDF trên Firebase Storage (exportedFileStoragePath).',
    securityRuleSummary: 'Đề mật (SECRET_EXAM) chỉ mở cho người tạo/Lãnh đạo; chặn client tự ghi APPROVED/PUBLISHED; khóa sửa khi ARCHIVED.',
  },
  {
    order: 11,
    collectionId: 'aiReviews',
    firestorePathPattern: 'schools/{schoolId}/aiReviews/{reviewId}',
    vietnameseTitle: '11. Báo cáo AI Kiểm định Chất lượng Đề',
    primaryKeyFormat: 'air_{examId}_v{testedVersion}',
    keyFields: ['id', 'schoolId', 'examId', 'testedVersion', 'qualityScore', 'issuesJson', 'recommendationsJson', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Tách báo cáo AI khỏi document đề kiểm tra để giữ document đề luôn nhẹ.',
    securityRuleSummary: 'Cô lập theo schoolId; liên kết chặt với examId và testedVersion.',
  },
  {
    order: 12,
    collectionId: 'approvals',
    firestorePathPattern: 'schools/{schoolId}/approvals/{approvalId}',
    vietnameseTitle: '12. Hồ sơ Thẩm định & Quyết định Phê duyệt',
    primaryKeyFormat: 'apv_{targetId}_{timestamp}',
    keyFields: ['id', 'schoolId', 'targetType', 'targetId', 'reviewerUserId', 'approverUserId', 'approverRole', 'decision', 'comment', 'approvedAt', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Lưu quyết định phê duyệt độc lập, tham chiếu tới targetId (Matrix/Exam/Workflow).',
    securityRuleSummary: 'Chỉ isSchoolLeadership(schoolId) hoặc Admin mới được tạo/cập nhật quyết định phê duyệt.',
  },
  {
    order: 13,
    collectionId: 'examWorkflows',
    firestorePathPattern: 'schools/{schoolId}/examWorkflows/{workflowId}',
    vietnameseTitle: '13. Hồ sơ Quy trình 9 Bước (Theo dõi Tiến độ)',
    primaryKeyFormat: 'wf_{year}_{deptCode}_{subjectCode}_G{grade}',
    keyFields: ['id', 'schoolId', 'code', 'title', 'academicYear', 'levelId', 'grade', 'subject', 'departmentId', 'departmentName', 'currentStep', 'assigneeUserId', 'matrixId', 'specificationId', 'examId', 'aiReviewId', 'approvalId', 'submittedAt', 'status', 'version', 'isSoftDeleted', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Liên kết toàn bộ mã hồ sơ (matrixId, specificationId, examId, aiReviewId, approvalId) mà không sao chép nội dung.',
    securityRuleSummary: 'Hỗ trợ truy vấn theo người tạo, tổ chuyên môn, chờ phê duyệt và tiến độ toàn trường; chặn client tự ghi APPROVED.',
  },
  {
    order: 14,
    collectionId: 'examResults',
    firestorePathPattern: 'schools/{schoolId}/examResults/{resultId}',
    vietnameseTitle: '14. Kết quả Kiểm tra & Thống kê Phổ điểm / CTT',
    primaryKeyFormat: 'res_{examId}_{variantCode}',
    keyFields: ['id', 'schoolId', 'examId', 'workflowId', 'academicYear', 'subject', 'grade', 'variantCode', 'studentCount', 'meanScore', 'passRatePercent', 'statisticsJson', 'status', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Lưu chỉ số tổng hợp (meanScore, passRatePercent, CTT) theo mã đề.',
    securityRuleSummary: 'Cô lập theo schoolId.',
  },
  {
    order: 15,
    collectionId: 'auditLogs',
    firestorePathPattern: 'schools/{schoolId}/auditLogs/{logId}',
    vietnameseTitle: '15. Nhật ký Thao tác & Kiểm toán Bảo mật (Append-Only)',
    primaryKeyFormat: 'log_{timestamp}_{random}',
    keyFields: ['id', 'schoolId', 'actorUserId', 'actorName', 'actorRole', 'action', 'targetType', 'targetId', 'summary', 'status', 'createdBy', 'createdAt', 'updatedAt'],
    hasVersionSubcollection: false,
    antiDuplicationAndSizeRule: 'Không bao giờ lưu mật khẩu hoặc nội dung đáp án đề mật vào summary.',
    securityRuleSummary: 'Chỉ cho phép create (Append-Only); cấm tuyệt đối update và delete (allow update, delete: if false).',
  },
];

export const STAGE17_COMPOSITE_INDEXES_SPEC: FirestoreCompositeIndexSpec[] = [
  {
    indexId: 'IDX_01_QUESTIONS_LEVEL_GRADE_SUBJECT',
    queryUseCaseTitle: '1. Lọc câu hỏi theo cấp học, khối lớp, môn học và trạng thái xóa mềm',
    collectionGroup: 'questions',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'levelId', order: 'ASCENDING' },
      { fieldPath: 'grade', order: 'ASCENDING' },
      { fieldPath: 'subject', order: 'ASCENDING' },
      { fieldPath: 'isSoftDeleted', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'questions'), where('levelId','==',levelId), where('grade','==',grade), where('subject','==',subject), where('isSoftDeleted','==',false), orderBy('updatedAt','desc'), limit(pageSize))",
  },
  {
    indexId: 'IDX_02_EXAMS_YEAR_SUBJECT_STATUS',
    queryUseCaseTitle: '2. Lọc đề kiểm tra theo năm học, môn học và trạng thái',
    collectionGroup: 'exams',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'academicYear', order: 'ASCENDING' },
      { fieldPath: 'subject', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'exams'), where('academicYear','==',year), where('subject','==',subject), where('status','==',status), orderBy('updatedAt','desc'), limit(pageSize))",
  },
  {
    indexId: 'IDX_03_WORKFLOWS_BY_CREATOR',
    queryUseCaseTitle: '3. Tìm hồ sơ kiểm tra theo người tạo (Hồ sơ của tôi)',
    collectionGroup: 'examWorkflows',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'createdBy', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'examWorkflows'), where('createdBy','==',userId), where('status','==',status), orderBy('updatedAt','desc'), limit(pageSize))",
  },
  {
    indexId: 'IDX_04_WORKFLOWS_BY_DEPARTMENT',
    queryUseCaseTitle: '4. Xem hồ sơ của tổ chuyên môn theo năm học và trạng thái',
    collectionGroup: 'examWorkflows',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'departmentId', order: 'ASCENDING' },
      { fieldPath: 'academicYear', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'examWorkflows'), where('departmentId','==',deptId), where('academicYear','==',year), where('status','==',status), orderBy('updatedAt','desc'), limit(pageSize))",
  },
  {
    indexId: 'IDX_05_WORKFLOWS_PENDING_APPROVAL',
    queryUseCaseTitle: '5. Xem danh sách hồ sơ chờ thẩm định / chờ phê duyệt theo thứ tự thời gian nộp',
    collectionGroup: 'examWorkflows',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'submittedAt', order: 'ASCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'examWorkflows'), where('status','in',['PENDING_REVIEW','PENDING_APPROVAL']), orderBy('submittedAt','asc'), limit(pageSize))",
  },
  {
    indexId: 'IDX_06_WORKFLOWS_SCHOOL_WIDE_PROGRESS',
    queryUseCaseTitle: '6. Xem tiến độ hồ sơ toàn trường theo năm học, bước quy trình (1..9) và trạng thái',
    collectionGroup: 'examWorkflows',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'academicYear', order: 'ASCENDING' },
      { fieldPath: 'currentStep', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'examWorkflows'), where('academicYear','==',year), where('currentStep','==',step), where('status','==',status), orderBy('updatedAt','desc'), limit(pageSize))",
  },
  {
    indexId: 'IDX_07_PERMISSIONS_USER_SCOPE',
    queryUseCaseTitle: '7. Tra cứu nhanh quyền hạn của giáo viên theo cấp học - môn học - khối lớp',
    collectionGroup: 'permissions',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'levelId', order: 'ASCENDING' },
      { fieldPath: 'subject', order: 'ASCENDING' },
      { fieldPath: 'grade', order: 'ASCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'permissions'), where('userId','==',userId), where('status','==','ACTIVE'), where('levelId','==',levelId), where('subject','==',subject), where('grade','==',grade))",
  },
  {
    indexId: 'IDX_08_TEACHING_ASSIGNMENTS_USER_YEAR',
    queryUseCaseTitle: '8. Tra cứu phân công giảng dạy của giáo viên theo năm học',
    collectionGroup: 'teachingAssignments',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'academicYear', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
    ],
    firestoreQueryPattern:
      "query(collection(db, 'schools', schoolId, 'teachingAssignments'), where('userId','==',userId), where('academicYear','==',year), where('status','==','ACTIVE'))",
  },
];

// ============================================================================
// CÁC HÀM TRUY VẤN CHUẨN FIRESTORE (MỤC IV: 6 TRUY VẤN TRỌNG TÂM + PHÂN TRANG)
// ============================================================================

export function buildFirestoreQuestionsByScopeQuery(params: {
  schoolId: string;
  levelId: 'PRIMARY' | 'LOWER_SECONDARY';
  grade: number;
  subject: string;
  pageSize?: number;
  afterDoc?: DocumentSnapshot;
}) {
  const constraints: QueryConstraint[] = [
    where('levelId', '==', params.levelId),
    where('grade', '==', params.grade),
    where('subject', '==', params.subject),
    where('isSoftDeleted', '==', false),
    orderBy('updatedAt', 'desc'),
    limit(params.pageSize || 20),
  ];
  if (params.afterDoc) {
    constraints.push(startAfter(params.afterDoc));
  }
  return query(collection(db, 'schools', params.schoolId, 'questions'), ...constraints);
}

export function buildFirestoreExamsByYearSubjectStatusQuery(params: {
  schoolId: string;
  academicYear: string;
  subject: string;
  status: string;
  pageSize?: number;
  afterDoc?: DocumentSnapshot;
}) {
  const constraints: QueryConstraint[] = [
    where('academicYear', '==', params.academicYear),
    where('subject', '==', params.subject),
    where('status', '==', params.status),
    orderBy('updatedAt', 'desc'),
    limit(params.pageSize || 20),
  ];
  if (params.afterDoc) {
    constraints.push(startAfter(params.afterDoc));
  }
  return query(collection(db, 'schools', params.schoolId, 'exams'), ...constraints);
}

export function buildFirestoreWorkflowsByCreatorQuery(params: {
  schoolId: string;
  createdByUserId: string;
  status?: string;
  pageSize?: number;
  afterDoc?: DocumentSnapshot;
}) {
  const constraints: QueryConstraint[] = [where('createdBy', '==', params.createdByUserId)];
  if (params.status) {
    constraints.push(where('status', '==', params.status));
  }
  constraints.push(orderBy('updatedAt', 'desc'), limit(params.pageSize || 20));
  if (params.afterDoc) {
    constraints.push(startAfter(params.afterDoc));
  }
  return query(collection(db, 'schools', params.schoolId, 'examWorkflows'), ...constraints);
}

export function buildFirestoreWorkflowsByDepartmentQuery(params: {
  schoolId: string;
  departmentId: string;
  academicYear: string;
  status?: string;
  pageSize?: number;
  afterDoc?: DocumentSnapshot;
}) {
  const constraints: QueryConstraint[] = [
    where('departmentId', '==', params.departmentId),
    where('academicYear', '==', params.academicYear),
  ];
  if (params.status) {
    constraints.push(where('status', '==', params.status));
  }
  constraints.push(orderBy('updatedAt', 'desc'), limit(params.pageSize || 20));
  if (params.afterDoc) {
    constraints.push(startAfter(params.afterDoc));
  }
  return query(collection(db, 'schools', params.schoolId, 'examWorkflows'), ...constraints);
}

export function buildFirestorePendingApprovalsQuery(params: {
  schoolId: string;
  pageSize?: number;
  afterDoc?: DocumentSnapshot;
}) {
  const constraints: QueryConstraint[] = [
    where('status', 'in', ['PENDING_REVIEW', 'PENDING_APPROVAL']),
    orderBy('submittedAt', 'asc'),
    limit(params.pageSize || 20),
  ];
  if (params.afterDoc) {
    constraints.push(startAfter(params.afterDoc));
  }
  return query(collection(db, 'schools', params.schoolId, 'examWorkflows'), ...constraints);
}

export function buildFirestoreSchoolWideProgressQuery(params: {
  schoolId: string;
  academicYear: string;
  currentStep?: number;
  status?: string;
  pageSize?: number;
  afterDoc?: DocumentSnapshot;
}) {
  const constraints: QueryConstraint[] = [where('academicYear', '==', params.academicYear)];
  if (typeof params.currentStep === 'number') {
    constraints.push(where('currentStep', '==', params.currentStep));
  }
  if (params.status) {
    constraints.push(where('status', '==', params.status));
  }
  constraints.push(orderBy('updatedAt', 'desc'), limit(params.pageSize || 50));
  if (params.afterDoc) {
    constraints.push(startAfter(params.afterDoc));
  }
  return query(collection(db, 'schools', params.schoolId, 'examWorkflows'), ...constraints);
}

// ============================================================================
// HÀM GHI KÈM LỊCH SỬ PHIÊN BẢN BẤT BIẾN (QUESTION VERSIONS & EXAM VERSIONS)
// ============================================================================

export async function saveQuestionWithVersionSnapshotFirestore(params: {
  schoolId: string;
  questionId: string;
  questionData: Record<string, unknown>;
  actorUserId: string;
  changeNote: string;
}): Promise<{ versionNumber: number; versionId: string }> {
  const batch = writeBatch(db);
  const nowIso = new Date().toISOString();
  const nextVersion = Number(params.questionData.version || 1);
  const versionId = `${params.questionId}_v${nextVersion}`;

  const questionRef = doc(db, 'schools', params.schoolId, 'questions', params.questionId);
  const versionRef = doc(
    db,
    'schools',
    params.schoolId,
    'questions',
    params.questionId,
    'versions',
    versionId
  );

  batch.set(
    questionRef,
    {
      ...params.questionData,
      id: params.questionId,
      schoolId: params.schoolId,
      version: nextVersion,
      updatedBy: params.actorUserId,
      updatedAt: nowIso,
    },
    { merge: true }
  );

  batch.set(versionRef, {
    id: versionId,
    schoolId: params.schoolId,
    questionId: params.questionId,
    versionNumber: nextVersion,
    stemSnapshot: String(params.questionData.stem || ''),
    correctAnswerSnapshot: String(params.questionData.correctAnswer || ''),
    pointsSnapshot: Number(params.questionData.points || 0),
    changeNote: params.changeNote,
    status: 'IMMUTABLE_SNAPSHOT',
    createdBy: params.actorUserId,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await batch.commit();
  return { versionNumber: nextVersion, versionId };
}

export async function saveExamWithVersionSnapshotFirestore(params: {
  schoolId: string;
  examId: string;
  examData: Record<string, unknown>;
  actorUserId: string;
  changeSummary: string;
}): Promise<{ versionNumber: number; versionId: string }> {
  const batch = writeBatch(db);
  const nowIso = new Date().toISOString();
  const nextVersion = Number(params.examData.version || 1);
  const versionId = `${params.examId}_v${nextVersion}`;

  const examRef = doc(db, 'schools', params.schoolId, 'exams', params.examId);
  const versionRef = doc(
    db,
    'schools',
    params.schoolId,
    'exams',
    params.examId,
    'versions',
    versionId
  );

  batch.set(
    examRef,
    {
      ...params.examData,
      id: params.examId,
      schoolId: params.schoolId,
      version: nextVersion,
      updatedBy: params.actorUserId,
      updatedAt: nowIso,
    },
    { merge: true }
  );

  batch.set(versionRef, {
    id: versionId,
    schoolId: params.schoolId,
    examId: params.examId,
    versionNumber: nextVersion,
    questionIdsCsvSnapshot: String(params.examData.questionIdsCsv || ''),
    variantCodesCsvSnapshot: String(params.examData.variantCodesCsv || ''),
    changeSummary: params.changeSummary,
    status: 'IMMUTABLE_SNAPSHOT',
    createdBy: params.actorUserId,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await batch.commit();
  return { versionNumber: nextVersion, versionId };
}

export { getDoc, getDocs, setDoc, updateDoc };
