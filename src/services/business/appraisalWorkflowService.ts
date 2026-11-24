import {
  AppraisalCriterionConfigItem,
  AppraisalCriterionEvaluation,
  AppraisalSubmissionSheet,
  AppraisalTargetType,
  ApprovalStatus,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  ItemFeedbackRecord,
  OfficialAppraisalMinutes,
  SchoolPermissionConfig,
  SchoolRoleCode,
  SchoolUserProfile,
  VersionDiffChangeEntry,
} from '../../types/domain';
import { getApprovalStatusInfo } from './assessmentRules';

// ============================================================================
// 1. DANH MỤC 5 VAI TRÒ & HỒ SƠ CÁN BỘ / GIÁO VIÊN TRONG NHÀ TRƯỜNG (MỤC II)
// ============================================================================

export const ROLE_DEFINITIONS: Record<
  SchoolRoleCode,
  {
    code: SchoolRoleCode;
    title: string;
    shortBadge: string;
    responsibilities: string[];
  }
> = {
  TEACHER_AUTHOR: {
    code: 'TEACHER_AUTHOR',
    title: '1. Giáo viên ra đề',
    shortBadge: 'GV Ra đề',
    responsibilities: [
      'Xây dựng ma trận và lập bản đặc tả',
      'Biên soạn đề kiểm tra từ ma trận đã duyệt',
      'Gửi hồ sơ thẩm định / phản biện',
      'Tiếp nhận góp ý, chỉnh sửa và gửi lại (tạo phiên bản đối chiếu)',
    ],
  },
  HEAD_OF_DEPARTMENT: {
    code: 'HEAD_OF_DEPARTMENT',
    title: '2. Tổ trưởng chuyên môn',
    shortBadge: 'Tổ trưởng CM',
    responsibilities: [
      'Tiếp nhận hồ sơ thuộc tổ chuyên môn',
      'Kiểm tra ma trận và bản đặc tả',
      'Phân công giáo viên phản biện độc lập',
      'Nhận xét, đề nghị chỉnh sửa và xác nhận kết quả thẩm định theo quyền được giao',
    ],
  },
  PEER_REVIEWER: {
    code: 'PEER_REVIEWER',
    title: '3. Giáo viên phản biện',
    shortBadge: 'GV Phản biện',
    responsibilities: [
      'Xem hồ sơ được phân công phản biện',
      'Đánh giá chất lượng chuyên môn theo Phiếu 12 tiêu chí',
      'Ghi nhận lỗi trực tiếp vào từng câu & đề xuất phương án sửa',
      'Kết luận Đạt hoặc Cần chỉnh sửa',
    ],
  },
  VICE_PRINCIPAL: {
    code: 'VICE_PRINCIPAL',
    title: '4. Phó hiệu trưởng chuyên môn',
    shortBadge: 'Phó Hiệu trưởng',
    responsibilities: [
      'Theo dõi hồ sơ của các tổ chuyên môn',
      'Kiểm tra việc thực hiện quy trình khảo thí',
      'Phê duyệt hoặc trình phê duyệt theo phân quyền cấu hình của nhà trường',
      'Yêu cầu điều chỉnh, theo dõi tiến độ và chất lượng đề',
    ],
  },
  PRINCIPAL: {
    code: 'PRINCIPAL',
    title: '5. Hiệu trưởng',
    shortBadge: 'Hiệu trưởng',
    responsibilities: [
      'Quản lý và phê duyệt theo thẩm quyền cao nhất',
      'Theo dõi toàn bộ quy trình và lịch sử xử lý',
      'Quyết định phát hành đề chính thức theo quy định của đơn vị',
    ],
  },
};

export const SCHOOL_USERS: SchoolUserProfile[] = [
  {
    id: 'user-gv-a',
    code: 'GV-A',
    fullName: 'Cô Nguyễn Thị Lan (Giáo viên A – Ra đề)',
    role: 'TEACHER_AUTHOR',
    roleLabel: 'Giáo viên ra đề',
    departmentName: 'Tổ Chuyên môn Toán – KHTN & Tiểu học',
    subjects: ['Toán', 'Tiếng Việt', 'Khoa học tự nhiên'],
  },
  {
    id: 'user-tt-b',
    code: 'TT-B',
    fullName: 'Thầy Trần Văn Bình (Tổ trưởng B – Tổ CM)',
    role: 'HEAD_OF_DEPARTMENT',
    roleLabel: 'Tổ trưởng chuyên môn',
    departmentName: 'Tổ Chuyên môn Toán – KHTN & Tiểu học',
    subjects: ['Toán', 'Khoa học tự nhiên'],
  },
  {
    id: 'user-gv-c',
    code: 'GV-C',
    fullName: 'Thầy Lê Minh Châu (Giáo viên C – Phản biện)',
    role: 'PEER_REVIEWER',
    roleLabel: 'Giáo viên phản biện',
    departmentName: 'Tổ Chuyên môn Toán – KHTN & Tiểu học',
    subjects: ['Toán', 'Tiếng Việt'],
  },
  {
    id: 'user-pht-d',
    code: 'PHT-D',
    fullName: 'Cô Phạm Thu Dung (Phó Hiệu trưởng chuyên môn)',
    role: 'VICE_PRINCIPAL',
    roleLabel: 'Phó hiệu trưởng chuyên môn',
    departmentName: 'Ban Giám hiệu Phụ trách Chuyên môn',
    subjects: ['Toán', 'Tiếng Việt', 'Khoa học tự nhiên', 'Ngữ văn'],
  },
  {
    id: 'user-ht-e',
    code: 'HT-E',
    fullName: 'Thầy Hoàng Quốc Khánh (Hiệu trưởng)',
    role: 'PRINCIPAL',
    roleLabel: 'Hiệu trưởng',
    departmentName: 'Ban Giám hiệu Nhà trường',
    subjects: ['Toán', 'Tiếng Việt', 'Khoa học tự nhiên', 'Ngữ văn'],
  },
];

// Cấu hình phân quyền mặc định theo quy chế nhà trường
// Lưu ý Mục II: Không mặc định mọi Phó hiệu trưởng đều có quyền phê duyệt cuối cùng đối với Đề kiểm tra
export const DEFAULT_SCHOOL_PERMISSIONS: SchoolPermissionConfig = {
  allowHeadOfDepartmentApproveMatrix: false,
  allowVicePrincipalFinalApproveMatrix: true,
  allowVicePrincipalFinalApproveExam: false, // Mặc định false: Phó hiệu trưởng rà soát & trình Hiệu trưởng phê duyệt cuối cùng (Quản trị viên có thể bật ủy quyền)
  allowVicePrincipalPublishExam: false, // Chỉ Hiệu trưởng quyết định phát hành đề chính thức (trừ khi được ủy quyền)
  requirePeerReviewBeforeDepartmentConfirm: true,
};

// ============================================================================
// 2. BỘ 12 TIÊU CHÍ PHIẾU THẨM ĐỊNH CHUẨN BỘ GD&ĐT (MỤC IV)
// ============================================================================

export const DEFAULT_12_APPRAISAL_CRITERIA: AppraisalCriterionConfigItem[] = [
  {
    code: 'CRIT_01',
    order: 1,
    title: '1. Phù hợp yêu cầu cần đạt',
    description:
      'Câu hỏi và bài tập bám sát đúng Yêu cầu cần đạt của Chương trình GDPT 2018 ở từng khối lớp.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_02',
    order: 2,
    title: '2. Đúng phạm vi kiến thức',
    description:
      'Nội dung kiểm tra nằm hoàn toàn trong phạm vi kế hoạch dạy học tính đến thời điểm kiểm tra.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_03',
    order: 3,
    title: '3. Phù hợp ma trận và bản đặc tả',
    description:
      'Số lượng câu hỏi, dạng thức, mức độ nhận thức và tỷ lệ điểm khớp tuyệt đối với Ma trận đã phê duyệt.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_04',
    order: 4,
    title: '4. Chính xác về khoa học',
    description:
      'Các dữ kiện, khái niệm, công thức, quy tắc và ngữ liệu hoàn toàn chuẩn xác về mặt khoa học bộ môn.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_05',
    order: 5,
    title: '5. Chính xác về ngôn ngữ',
    description:
      'Diễn đạt trong sáng, đơn nghĩa, đúng chính tả, ngữ pháp và thuật ngữ chuyên môn tiếng Việt.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_06',
    order: 6,
    title: '6. Phù hợp tâm lý, nhận thức học sinh',
    description:
      'Độ dài ngữ liệu, câu lệnh và bối cảnh thực tiễn vừa sức với đặc điểm tâm sinh lý lứa tuổi học sinh.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_07',
    order: 7,
    title: '7. Phân hóa hợp lý',
    description:
      'Đảm bảo phân hóa đúng các mức độ nhận thức (Tiểu học 3 mức TT 27; THCS 4 mức TT 22 & CV 7991).',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_08',
    order: 8,
    title: '8. Đáp án chính xác',
    description:
      'Đáp án đúng duy nhất cho câu trắc nghiệm, chính xác cho mọi mã đề và đầy đủ cho phần tự luận.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_09',
    order: 9,
    title: '9. Hướng dẫn chấm rõ ràng',
    description:
      'Biểu điểm chi tiết từng ý/bước giải rõ ràng, có phương án trả lời tương đương được chấp nhận.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_10',
    order: 10,
    title: '10. Hình thức trình bày phù hợp',
    description:
      'Quốc hiệu, tiêu đề, phông chữ, công thức toán học và hình vẽ rõ nét, đúng thể thức văn bản nhà trường.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_11',
    order: 11,
    title: '11. Không có câu trùng lặp hoặc gây hiểu nhầm',
    description:
      'Các câu hỏi độc lập, không lộ đáp án của nhau và không có phương án nhiễu gây tranh cãi.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
  {
    code: 'CRIT_12',
    order: 12,
    title: '12. Bảo đảm tính công bằng và khách quan',
    description:
      'Nội dung đề không thiên vị vùng miền, giới tính; các mã đề tương đương tuyệt đối về độ khó.',
    enabledForPrimary: true,
    enabledForSecondary: true,
    applicableSubjects: 'ALL',
  },
];

export function getApplicableCriteriaForTarget(
  allCriteria: AppraisalCriterionConfigItem[],
  levelId: EducationLevelId,
  subject: string
): AppraisalCriterionConfigItem[] {
  return allCriteria.filter((c) => {
    const levelOk =
      levelId === EducationLevelId.PRIMARY
        ? c.enabledForPrimary
        : c.enabledForSecondary;
    if (!levelOk) return false;
    if (c.applicableSubjects === 'ALL') return true;
    return c.applicableSubjects.includes(subject);
  });
}

export function createInitialCriteriaEvaluations(
  criteriaList: AppraisalCriterionConfigItem[]
): AppraisalCriterionEvaluation[] {
  return criteriaList.map((c) => ({
    criterionCode: c.code,
    order: c.order,
    title: c.title,
    rating: 'DAT',
    comment: '',
    questionPositions: '',
  }));
}

// ============================================================================
// 3. QUY TẮC KIỂM TRA THẨM QUYỀN THEO VAI TRÒ & QUY TRÌNH 2 CẤP (MỤC I, II, III, VI)
// ============================================================================

export const NINE_LIFECYCLE_STATUS_ORDER: ApprovalStatus[] = [
  ApprovalStatus.DRAFT, // 1. Bản nháp
  ApprovalStatus.PENDING, // 2. Chờ thẩm định
  ApprovalStatus.IN_REVIEW, // 3. Đang thẩm định
  ApprovalStatus.REVISION_REQUIRED, // 4. Yêu cầu chỉnh sửa
  ApprovalStatus.REVISED, // 5. Đã chỉnh sửa
  ApprovalStatus.PENDING_APPROVAL, // 6. Chờ phê duyệt
  ApprovalStatus.APPROVED, // 7. Đã phê duyệt
  ApprovalStatus.PUBLISHED, // 8. Đã phát hành
  ApprovalStatus.ARCHIVED, // 9. Lưu trữ
];

export function verifyWorkflowTransitionAuthorization(params: {
  targetType: AppraisalTargetType;
  currentStatus: ApprovalStatus;
  nextStatus: ApprovalStatus;
  actor: SchoolUserProfile;
  permissions: SchoolPermissionConfig;
  hasPeerReviewSheet?: boolean;
  hasOpenUnresolvedFeedback?: boolean;
  matrixStatusOfExam?: ApprovalStatus;
}): {
  allowed: boolean;
  reason: string;
} {
  const {
    targetType,
    currentStatus,
    nextStatus,
    actor,
    permissions,
    hasPeerReviewSheet = false,
    matrixStatusOfExam,
  } = params;

  const role = actor.role;
  const targetLabel =
    targetType === 'MATRIX' ? 'Ma trận & Bản đặc tả' : 'Đề kiểm tra';

  // Ràng buộc 1: Không cho phép tạo hoặc trình duyệt Đề kiểm tra nếu Ma trận gốc chưa được phê duyệt
  if (
    targetType === 'EXAM' &&
    nextStatus !== ApprovalStatus.DRAFT &&
    matrixStatusOfExam &&
    matrixStatusOfExam !== ApprovalStatus.APPROVED
  ) {
    return {
      allowed: false,
      reason: `Ma trận gốc của đề chưa được phê duyệt. Theo Quy trình hai cấp, Ma trận & Bản đặc tả phải được phê duyệt và khóa phiên bản trước khi thẩm định/phê duyệt Đề kiểm tra.`,
    };
  }

  // Bước chuyển sang Chờ thẩm định (PENDING) hoặc Đã chỉnh sửa (REVISED) -> Dành cho Giáo viên ra đề (hoặc Tổ trưởng)
  if (
    nextStatus === ApprovalStatus.PENDING ||
    nextStatus === ApprovalStatus.REVISED
  ) {
    if (role !== 'TEACHER_AUTHOR' && role !== 'HEAD_OF_DEPARTMENT') {
      return {
        allowed: false,
        reason: `Chỉ Giáo viên ra đề (hoặc Tổ trưởng CM) mới thực hiện gửi hồ sơ thẩm định / gửi lại bản đã chỉnh sửa. Vai trò hiện tại (${actor.roleLabel}) không phù hợp.`,
      };
    }
    return {
      allowed: true,
      reason: `${actor.fullName} gửi hồ sơ ${targetLabel} sang trạng thái "${
        getApprovalStatusInfo(nextStatus).label
      }".`,
    };
  }

  // Bước chuyển sang Đang thẩm định (IN_REVIEW) -> Tổ trưởng chuyên môn hoặc Giáo viên phản biện
  if (nextStatus === ApprovalStatus.IN_REVIEW) {
    if (role !== 'HEAD_OF_DEPARTMENT' && role !== 'PEER_REVIEWER') {
      return {
        allowed: false,
        reason: `Chỉ Tổ trưởng chuyên môn hoặc Giáo viên phản biện được phân công mới có quyền tiếp nhận hồ sơ sang trạng thái "Đang thẩm định".`,
      };
    }
    return {
      allowed: true,
      reason: `${actor.fullName} tiếp nhận thẩm định / phản biện chuyên môn.`,
    };
  }

  // Bước Yêu cầu chỉnh sửa / Trả lại hồ sơ (REVISION_REQUIRED) -> Tổ trưởng, GV phản biện, Phó HT, Hiệu trưởng
  if (nextStatus === ApprovalStatus.REVISION_REQUIRED) {
    if (role === 'TEACHER_AUTHOR') {
      return {
        allowed: false,
        reason: `Giáo viên ra đề không tự trả lại hồ sơ thẩm định của chính mình. Quyền yêu cầu chỉnh sửa thuộc về Giáo viên phản biện, Tổ trưởng chuyên môn hoặc Ban Giám hiệu.`,
      };
    }
    return {
      allowed: true,
      reason: `${actor.fullName} (${actor.roleLabel}) gửi trả hồ sơ và yêu cầu chỉnh sửa.`,
    };
  }

  // Bước Xác nhận cấp Tổ & Trình chờ phê duyệt (PENDING_APPROVAL)
  if (nextStatus === ApprovalStatus.PENDING_APPROVAL) {
    if (role !== 'HEAD_OF_DEPARTMENT' && role !== 'VICE_PRINCIPAL') {
      return {
        allowed: false,
        reason: `Chỉ Tổ trưởng chuyên môn (hoặc Phó hiệu trưởng chuyên môn khi trình Hiệu trưởng) mới có thẩm quyền xác nhận kết quả thẩm định để chuyển sang "Chờ phê duyệt". Vai trò "${actor.roleLabel}" không có thẩm quyền này.`,
      };
    }
    if (
      targetType === 'EXAM' &&
      permissions.requirePeerReviewBeforeDepartmentConfirm &&
      !hasPeerReviewSheet
    ) {
      return {
        allowed: false,
        reason: `Theo cấu hình quy chế nhà trường, Đề kiểm tra bắt buộc phải có Phiếu thẩm định 12 tiêu chí của Giáo viên phản biện trước khi Tổ chuyên môn xác nhận trình Ban Giám hiệu phê duyệt.`,
      };
    }
    return {
      allowed: true,
      reason: `${actor.fullName} xác nhận hồ sơ đạt yêu cầu chuyên môn và trình cấp có thẩm quyền phê duyệt.`,
    };
  }

  // Bước PHÊ DUYỆT CHÍNH THỨC (APPROVED) -> Kiểm tra nghiêm ngặt theo cấu hình phân quyền nhà trường!
  if (nextStatus === ApprovalStatus.APPROVED) {
    if (role === 'TEACHER_AUTHOR' || role === 'PEER_REVIEWER') {
      return {
        allowed: false,
        reason: `CHẶN THẨM QUYỀN: "${actor.roleLabel}" (${actor.fullName}) tuyệt đối không có quyền phê duyệt ${targetLabel}.`,
      };
    }

    if (targetType === 'MATRIX') {
      // Quy trình A: Phê duyệt Ma trận & Bản đặc tả
      if (
        role === 'HEAD_OF_DEPARTMENT' &&
        !permissions.allowHeadOfDepartmentApproveMatrix
      ) {
        return {
          allowed: false,
          reason: `CHẶN THẨM QUYỀN: Theo quy chế hiện hành của nhà trường, Tổ trưởng chuyên môn chưa được ủy quyền phê duyệt cuối cùng Ma trận đề kiểm tra (phải trình Ban Giám hiệu phê duyệt).`,
        };
      }
      if (
        role === 'VICE_PRINCIPAL' &&
        !permissions.allowVicePrincipalFinalApproveMatrix
      ) {
        return {
          allowed: false,
          reason: `CHẶN THẨM QUYỀN: Quy chế hiện hành quy định Hiệu trưởng trực tiếp phê duyệt Ma trận đề kiểm tra.`,
        };
      }
      return {
        allowed: true,
        reason: `${actor.fullName} (${actor.roleLabel}) phê duyệt chính thức và khóa phiên bản Ma trận & Bản đặc tả.`,
      };
    } else {
      // Quy trình B: Phê duyệt Đề kiểm tra
      if (role === 'HEAD_OF_DEPARTMENT') {
        return {
          allowed: false,
          reason: `CHẶN THẨM QUYỀN: Tổ trưởng chuyên môn chỉ có quyền xác nhận thẩm định cấp Tổ và trình duyệt, không có quyền phê duyệt cuối cùng Đề kiểm tra.`,
        };
      }
      if (
        role === 'VICE_PRINCIPAL' &&
        !permissions.allowVicePrincipalFinalApproveExam
      ) {
        return {
          allowed: false,
          reason: `CHẶN THẨM QUYỀN: Theo quy chế nhà trường đang cấu hình, Phó hiệu trưởng chuyên môn không mặc định có quyền phê duyệt cuối cùng Đề kiểm tra (chỉ có quyền kiểm tra quy trình và trình Hiệu trưởng phê duyệt). Quản trị viên có thể cấp ủy quyền trong mục Cấu hình Quy chế nếu được Hiệu trưởng phân công.`,
        };
      }
      return {
        allowed: true,
        reason: `${actor.fullName} (${actor.roleLabel}) phê duyệt chính thức và khóa phiên bản Đề kiểm tra.`,
      };
    }
  }

  // Bước PHÁT HÀNH ĐỀ CHÍNH THỨC (PUBLISHED) -> Nguyên tắc Mục I.6: Đề chưa phê duyệt tuyệt đối không được phát hành!
  if (nextStatus === ApprovalStatus.PUBLISHED) {
    if (
      currentStatus !== ApprovalStatus.APPROVED &&
      currentStatus !== ApprovalStatus.PUBLISHED
    ) {
      return {
        allowed: false,
        reason: `CHẶN QUY TRÌNH: Hồ sơ đang ở trạng thái "${
          getApprovalStatusInfo(currentStatus).label
        }" (chưa được phê duyệt chính thức) nên không được phát hành hoặc đưa vào kho đề chính thức.`,
      };
    }
    if (role === 'PRINCIPAL') {
      return {
        allowed: true,
        reason: `Hiệu trưởng (${actor.fullName}) quyết định phát hành chính thức Đề kiểm tra.`,
      };
    }
    if (role === 'VICE_PRINCIPAL' && permissions.allowVicePrincipalPublishExam) {
      return {
        allowed: true,
        reason: `Phó hiệu trưởng chuyên môn (${actor.fullName}) phát hành đề kiểm tra theo ủy quyền của Hiệu trưởng.`,
      };
    }
    return {
      allowed: false,
      reason: `CHẶN THẨM QUYỀN: Chỉ Hiệu trưởng (hoặc Phó hiệu trưởng được ủy quyền phát hành) mới có quyền quyết định phát hành đề chính thức.`,
    };
  }

  // Bước LƯU TRỮ (ARCHIVED)
  if (nextStatus === ApprovalStatus.ARCHIVED) {
    if (
      currentStatus !== ApprovalStatus.APPROVED &&
      currentStatus !== ApprovalStatus.PUBLISHED
    ) {
      return {
        allowed: false,
        reason: `Chỉ những hồ sơ Đã phê duyệt hoặc Đã phát hành mới được đóng gói đưa vào kho Lưu trữ chính thức.`,
      };
    }
    if (role !== 'PRINCIPAL' && role !== 'VICE_PRINCIPAL' && role !== 'HEAD_OF_DEPARTMENT') {
      return {
        allowed: false,
        reason: `Chỉ Ban Giám hiệu hoặc Tổ trưởng chuyên môn mới có quyền đóng gói lưu trữ hồ sơ khảo thí.`,
      };
    }
    return {
      allowed: true,
      reason: `${actor.fullName} đưa hồ sơ vào kho Lưu trữ khảo thí.`,
    };
  }

  return {
    allowed: true,
    reason: 'Thao tác hợp lệ.',
  };
}

// ============================================================================
// 4. TỰ ĐỘNG LẬP BIÊN BẢN THẨM ĐỊNH CHÍNH THỨC (MỤC VII)
// Chỉ ghi nhận chữ ký điện tử khi có cơ chế ký hợp lệ. Không tự tạo chữ ký giả.
// ============================================================================

export function generateOfficialAppraisalMinutes(params: {
  schoolName: string;
  departmentName: string;
  targetType: AppraisalTargetType;
  matrix?: ExamMatrix;
  exam?: ExamPaper;
}): OfficialAppraisalMinutes {
  const { schoolName, departmentName, targetType, matrix, exam } = params;

  const isMatrix = targetType === 'MATRIX';
  const recordCode = isMatrix ? matrix?.code || 'MT-00' : exam?.code || 'ĐỀ-00';
  const recordTitle = isMatrix
    ? matrix?.title || 'Ma trận & Bản đặc tả'
    : exam?.title || 'Đề kiểm tra định kỳ';
  const version = isMatrix ? matrix?.version || 1 : exam?.version || 1;
  const subject = isMatrix ? matrix?.subject || 'Toán' : exam?.subject || 'Toán';
  const grade = (isMatrix ? matrix?.grade : exam?.grade) || 4;
  const levelId =
    (isMatrix ? matrix?.levelId : exam?.levelId) || EducationLevelId.PRIMARY;

  const sheets: AppraisalSubmissionSheet[] =
    (isMatrix ? matrix?.appraisalSheets : exam?.appraisalSheets) || [];
  const feedbacks: ItemFeedbackRecord[] =
    (isMatrix ? matrix?.itemFeedbacks : exam?.itemFeedbacks) || [];
  const latestSheet = sheets[0];

  const counts = {
    dat: 0,
    canChinhSua: 0,
    khongDat: 0,
    khongApDung: 0,
  };

  if (latestSheet) {
    latestSheet.criteriaEvaluations.forEach((ev) => {
      if (ev.rating === 'DAT') counts.dat += 1;
      else if (ev.rating === 'CAN_CHINH_SUA') counts.canChinhSua += 1;
      else if (ev.rating === 'KHONG_DAT') counts.khongDat += 1;
      else counts.khongApDung += 1;
    });
  }

  const adjustmentRequests: string[] = [];
  if (latestSheet) {
    latestSheet.criteriaEvaluations
      .filter((c) => c.rating === 'CAN_CHINH_SUA' || c.rating === 'KHONG_DAT')
      .forEach((c) => {
        adjustmentRequests.push(
          `[${c.title}] (${
            c.rating === 'CAN_CHINH_SUA' ? 'Cần chỉnh sửa' : 'Không đạt'
          }${
            c.questionPositions ? ` – Vị trí: ${c.questionPositions}` : ''
          }): ${c.comment || 'Đề nghị rà soát điều chỉnh.'}`
        );
      });
  }

  feedbacks.forEach((fb) => {
    adjustmentRequests.push(
      `[Góp ý tại ${fb.itemNumberOrCode} – v${fb.versionAtFeedback}] ${
        fb.feedbackContent
      }${fb.answerErrorNote ? ` | Lỗi đáp án: ${fb.answerErrorNote}` : ''} → Đề xuất sửa: ${
        fb.proposedFix
      } (${
        fb.resolutionStatus === 'RESOLVED'
          ? `Đã khắc phục bởi ${fb.resolvedByName || 'GV ra đề'}`
          : 'Đang chờ xử lý'
      })`
    );
  });

  const authorName =
    (isMatrix ? matrix?.authorName : exam?.authorName) ||
    'Chưa ghi nhận người ra đề';
  const headOfDeptName =
    (isMatrix ? matrix?.headOfDepartmentName : exam?.headOfDepartmentName) ||
    'Chưa ghi nhận Tổ trưởng chuyên môn';
  const peerReviewerName =
    latestSheet?.reviewerName ||
    (isMatrix ? matrix?.assignedReviewerName : exam?.assignedReviewerName) ||
    'Chưa phân công giáo viên phản biện';
  const approverName =
    (isMatrix ? matrix?.finalApproverName : exam?.finalApproverName) ||
    exam?.reviewerName ||
    'Chưa phê duyệt cuối cùng';
  const approverRoleLabel =
    (isMatrix ? matrix?.finalApproverRole : exam?.finalApproverRole) ===
    'PRINCIPAL'
      ? 'Hiệu trưởng'
      : (isMatrix ? matrix?.finalApproverRole : exam?.finalApproverRole) ===
        'VICE_PRINCIPAL'
      ? 'Phó hiệu trưởng chuyên môn'
      : 'Lãnh đạo phê duyệt';

  const currentStatus =
    (isMatrix ? matrix?.status : exam?.status) || ApprovalStatus.DRAFT;
  const isApprovedOrPublished =
    currentStatus === ApprovalStatus.APPROVED ||
    currentStatus === ApprovalStatus.PUBLISHED ||
    currentStatus === ApprovalStatus.ARCHIVED;

  const evaluationSummary = latestSheet
    ? `Đã thực hiện thẩm định trên ${latestSheet.criteriaEvaluations.length} tiêu chí chuyên môn: ${counts.dat} tiêu chí Đạt, ${counts.canChinhSua} tiêu chí Cần chỉnh sửa, ${counts.khongDat} tiêu chí Không đạt, ${counts.khongApDung} tiêu chí Không áp dụng. Nhận xét tổng quát: "${latestSheet.generalSummaryNote}"`
    : 'Hồ sơ đang trong quá trình tiếp nhận thẩm định, chưa có phiếu kết luận phản biện hoàn chỉnh.';

  const conclusionText = isApprovedOrPublished
    ? `Hồ sơ ${
        isMatrix ? 'Ma trận và Bản đặc tả' : 'Đề kiểm tra, Đáp án và Hướng dẫn chấm'
      } (${recordCode} – Phiên bản v${version}) đáp ứng đầy đủ các tiêu chí chuyên môn theo Chương trình GDPT 2018. Đủ điều kiện phê duyệt khóa phiên bản và đưa vào sử dụng chính thức.`
    : latestSheet?.overallConclusion === 'DAT'
    ? 'Hội đồng phản biện kết luận ĐẠT yêu cầu chuyên môn, đề nghị cấp có thẩm quyền xem xét phê duyệt.'
    : 'Yêu cầu giáo viên ra đề tiếp thu các nội dung góp ý, chỉnh sửa và trình thẩm định lại.';

  return {
    minutesCode: `BB-TĐ-${recordCode}-V${version}`,
    schoolName,
    departmentName,
    subject,
    grade,
    levelId,
    targetType,
    targetCode: recordCode,
    targetTitle: recordTitle,
    targetVersion: version,
    appraisalTime:
      latestSheet?.submittedAt ||
      (isMatrix ? matrix?.updatedAt : exam?.updatedAt) ||
      new Date().toISOString().slice(0, 16).replace('T', ' '),
    authorName,
    headOfDepartmentName: headOfDeptName,
    peerReviewerName,
    approverName,
    approverRoleLabel,
    evaluationSummary,
    criteriaSummaryCounts: counts,
    adjustmentRequests,
    conclusionText,
    confirmations: [
      {
        partyTitle: 'Người ra đề',
        personName: authorName,
        statusLabel: 'Đã xác nhận nộp hồ sơ trên hệ thống',
        confirmedAt: isMatrix ? matrix?.createdAt : exam?.createdAt,
        hasValidDigitalSignature: false,
      },
      {
        partyTitle: 'Người phản biện',
        personName: peerReviewerName,
        statusLabel: latestSheet
          ? `Đã xác nhận kết luận: ${
              latestSheet.overallConclusion === 'DAT'
                ? 'ĐẠT'
                : 'YÊU CẦU CHỈNH SỬA'
            }`
          : 'Chờ hoàn thành phiếu phản biện',
        confirmedAt: latestSheet?.submittedAt,
        hasValidDigitalSignature: false,
      },
      {
        partyTitle: 'Tổ trưởng chuyên môn',
        personName: headOfDeptName,
        statusLabel:
          currentStatus === ApprovalStatus.PENDING_APPROVAL ||
          isApprovedOrPublished
            ? 'Đã xác nhận rà soát cấp Tổ chuyên môn'
            : 'Đang theo dõi quy trình thẩm định',
        confirmedAt: exam?.departmentConfirmedAt || matrix?.updatedAt,
        hasValidDigitalSignature: false,
      },
      {
        partyTitle: 'Người phê duyệt',
        personName: approverName,
        statusLabel: isApprovedOrPublished
          ? `Đã phê duyệt & khóa phiên bản v${version}`
          : 'Chưa ký phê duyệt cuối cùng',
        confirmedAt: isApprovedOrPublished
          ? isMatrix
            ? matrix?.updatedAt
            : exam?.updatedAt
          : undefined,
        hasValidDigitalSignature: false,
      },
    ],
  };
}
