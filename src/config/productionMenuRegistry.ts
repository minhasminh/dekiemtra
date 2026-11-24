import {
  AuthenticatedUserSession,
  MenuSectionId,
  TeacherPermissionProfileSummary,
} from '../types/domain';
import {
  getRuntimeFeatureFlags,
  RuntimeFeatureFlags,
} from './runtimeEnvironment';

export type ProductionMenuScope = 'PLATFORM' | 'SCHOOL' | 'DEPARTMENT' | 'TEACHER_PERSONAL';

export type ProductionMenuStatus = 'ACTIVE' | 'INACTIVE';

export interface ProductionMenuItemConfig {
  id: MenuSectionId;
  label: string;
  icon: string;
  route: string;
  permissionCode: string;
  scope: ProductionMenuScope;
  order: number;
  status: ProductionMenuStatus;
  allowedRoles: string[];
}

export type PrimaryProductionRoleKey =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'HEAD_OF_DEPARTMENT'
  | 'TEACHER';

/**
 * VIII. MENU ĐỘNG THEO QUYỀN – BẢNG CẤU HÌNH MENU TRUNG TÂM (PRODUCTION MENU REGISTRY)
 * Mỗi menu có:
 * - Tên (label)
 * - Icon (icon)
 * - Route (route / id)
 * - PermissionCode (permissionCode)
 * - Scope (scope)
 * - Thứ tự (order)
 * - Trạng thái (status)
 */
export const PRODUCTION_ROLE_MENUS: Record<PrimaryProductionRoleKey, ProductionMenuItemConfig[]> = {
  SUPER_ADMIN: [
    {
      id: 'dashboard',
      label: 'Tổng quan hệ thống',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      permissionCode: 'MANAGE_SYSTEM_SETTINGS',
      scope: 'PLATFORM',
      order: 1,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'super-admin-schools',
      label: 'Quản lý trường học',
      icon: 'Building2',
      route: '/super-admin-schools',
      permissionCode: 'MANAGE_SCHOOL_INFO',
      scope: 'PLATFORM',
      order: 2,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'admin-accounts',
      label: 'Quản trị viên trường',
      icon: 'UserCog',
      route: '/admin-accounts',
      permissionCode: 'MANAGE_USERS',
      scope: 'PLATFORM',
      order: 3,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'school-plan-management',
      label: 'Gói sử dụng',
      icon: 'CreditCard',
      route: '/school-plan-management',
      permissionCode: 'MANAGE_SYSTEM_SETTINGS',
      scope: 'PLATFORM',
      order: 4,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'ai-usage-management',
      label: 'Thống kê vận hành',
      icon: 'Sparkles',
      route: '/ai-usage-management',
      permissionCode: 'MANAGE_AI_LIMITS',
      scope: 'PLATFORM',
      order: 5,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'smart-question-link',
      label: 'Tạo câu hỏi thông minh',
      icon: 'ExternalLink',
      route: '/smart-question-link',
      permissionCode: 'MANAGE_SYSTEM_SETTINGS',
      scope: 'PLATFORM',
      order: 6,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'admin-system-settings',
      label: 'Cấu hình nền tảng',
      icon: 'Settings',
      route: '/admin-system-settings',
      permissionCode: 'MANAGE_SYSTEM_SETTINGS',
      scope: 'PLATFORM',
      order: 7,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'my-profile',
      label: 'Tài khoản cá nhân',
      icon: 'UserCheck',
      route: '/my-profile',
      permissionCode: 'MANAGE_SYSTEM_SETTINGS',
      scope: 'PLATFORM',
      order: 8,
      status: 'ACTIVE',
      allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    },
  ],

  SCHOOL_ADMIN: [
    {
      id: 'dashboard',
      label: 'Tổng quan trường',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      permissionCode: 'MANAGE_SCHOOL_INFO',
      scope: 'SCHOOL',
      order: 1,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'admin-accounts',
      label: 'Tài khoản giáo viên',
      icon: 'Users',
      route: '/admin-accounts',
      permissionCode: 'MANAGE_USERS',
      scope: 'SCHOOL',
      order: 2,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'school-admin-workspace',
      label: 'Nhập Excel',
      icon: 'FileSpreadsheet',
      route: '/school-admin-workspace',
      permissionCode: 'MANAGE_USERS',
      scope: 'SCHOOL',
      order: 3,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'admin-departments',
      label: 'Tổ chuyên môn',
      icon: 'Network',
      route: '/admin-departments',
      permissionCode: 'MANAGE_DEPARTMENTS',
      scope: 'SCHOOL',
      order: 4,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'bgh-assign-exam',
      label: 'Phân công giảng dạy',
      icon: 'Briefcase',
      route: '/bgh-assign-exam',
      permissionCode: 'ASSIGN_EXAM_CREATION',
      scope: 'SCHOOL',
      order: 5,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'admin-teacher-permissions',
      label: 'Phân quyền',
      icon: 'KeyRound',
      route: '/admin-teacher-permissions',
      permissionCode: 'MANAGE_ROLES',
      scope: 'SCHOOL',
      order: 6,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'smart-question-link',
      label: 'Tạo câu hỏi thông minh',
      icon: 'ExternalLink',
      route: '/smart-question-link',
      permissionCode: 'MANAGE_SCHOOL_INFO',
      scope: 'SCHOOL',
      order: 7,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'admin-school-config',
      label: 'Cấu hình trường',
      icon: 'Building2',
      route: '/admin-school-config',
      permissionCode: 'MANAGE_SCHOOL_INFO',
      scope: 'SCHOOL',
      order: 8,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
    {
      id: 'my-profile',
      label: 'Tài khoản cá nhân',
      icon: 'UserCheck',
      route: '/my-profile',
      permissionCode: 'MANAGE_SCHOOL_INFO',
      scope: 'SCHOOL',
      order: 9,
      status: 'ACTIVE',
      allowedRoles: ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'],
    },
  ],

  PRINCIPAL: [
    {
      id: 'dashboard',
      label: 'Tổng quan nhà trường',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 1,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
    {
      id: 'progress-management',
      label: 'Kế hoạch kiểm tra',
      icon: 'CalendarRange',
      route: '/progress-management',
      permissionCode: 'MANAGE_EXAM_PLAN',
      scope: 'SCHOOL',
      order: 2,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
    {
      id: 'bgh-progress-tracking',
      label: 'Quản lý tiến độ',
      icon: 'TrendingUp',
      route: '/bgh-progress-tracking',
      permissionCode: 'TRACK_SCHOOL_PROGRESS',
      scope: 'SCHOOL',
      order: 3,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
    {
      id: 'bgh-approval',
      label: 'Thẩm định và phê duyệt',
      icon: 'CheckSquare',
      route: '/bgh-approval',
      permissionCode: 'APPROVE_FINAL_EXAM',
      scope: 'SCHOOL',
      order: 4,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
    {
      id: 'bgh-quality-report',
      label: 'Báo cáo chất lượng',
      icon: 'Award',
      route: '/bgh-quality-report',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 5,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
    {
      id: 'bgh-result-analytics',
      label: 'Phân tích kết quả',
      icon: 'BarChart3',
      route: '/bgh-result-analytics',
      permissionCode: 'ANALYZE_SCHOOL_RESULTS',
      scope: 'SCHOOL',
      order: 6,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
    {
      id: 'smart-question-link',
      label: 'Tạo câu hỏi thông minh',
      icon: 'ExternalLink',
      route: '/smart-question-link',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 7,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
    {
      id: 'my-profile',
      label: 'Tài khoản cá nhân',
      icon: 'UserCheck',
      route: '/my-profile',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 8,
      status: 'ACTIVE',
      allowedRoles: ['PRINCIPAL'],
    },
  ],

  VICE_PRINCIPAL: [
    {
      id: 'dashboard',
      label: 'Tổng quan chuyên môn',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 1,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'progress-management',
      label: 'Kế hoạch kiểm tra',
      icon: 'CalendarRange',
      route: '/progress-management',
      permissionCode: 'MANAGE_EXAM_PLAN',
      scope: 'SCHOOL',
      order: 2,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'bgh-assign-exam',
      label: 'Phân công ra đề',
      icon: 'UserCog',
      route: '/bgh-assign-exam',
      permissionCode: 'ASSIGN_EXAM_CREATION',
      scope: 'SCHOOL',
      order: 3,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'bgh-progress-tracking',
      label: 'Tiến độ hồ sơ',
      icon: 'TrendingUp',
      route: '/bgh-progress-tracking',
      permissionCode: 'TRACK_SCHOOL_PROGRESS',
      scope: 'SCHOOL',
      order: 4,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'approval',
      label: 'Thẩm định',
      icon: 'ClipboardCheck',
      route: '/approval',
      permissionCode: 'REVIEW_EXAM_VICE_PRINCIPAL',
      scope: 'SCHOOL',
      order: 5,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'bgh-approval',
      label: 'Phê duyệt theo phân quyền',
      icon: 'CheckSquare',
      route: '/bgh-approval',
      permissionCode: 'APPROVE_FINAL_EXAM',
      scope: 'SCHOOL',
      order: 6,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'bgh-quality-report',
      label: 'Báo cáo chuyên môn',
      icon: 'BarChart3',
      route: '/bgh-quality-report',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 7,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'smart-question-link',
      label: 'Tạo câu hỏi thông minh',
      icon: 'ExternalLink',
      route: '/smart-question-link',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 8,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
    {
      id: 'my-profile',
      label: 'Tài khoản cá nhân',
      icon: 'UserCheck',
      route: '/my-profile',
      permissionCode: 'VIEW_SCHOOL_REPORTS',
      scope: 'SCHOOL',
      order: 9,
      status: 'ACTIVE',
      allowedRoles: ['VICE_PRINCIPAL'],
    },
  ],

  HEAD_OF_DEPARTMENT: [
    {
      id: 'dashboard',
      label: 'Tổng quan tổ',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      permissionCode: 'TRACK_DEPT_PROGRESS',
      scope: 'DEPARTMENT',
      order: 1,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'questions',
      label: 'Ngân hàng câu hỏi',
      icon: 'Database',
      route: '/questions',
      permissionCode: 'VIEW_DEPT_QUESTIONS',
      scope: 'DEPARTMENT',
      order: 2,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'smart-question-link',
      label: 'Tạo câu hỏi thông minh',
      icon: 'ExternalLink',
      route: '/smart-question-link',
      permissionCode: 'VIEW_DEPT_QUESTIONS',
      scope: 'DEPARTMENT',
      order: 3,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'dept-dossiers',
      label: 'Hồ sơ tổ chuyên môn',
      icon: 'FolderKanban',
      route: '/dept-dossiers',
      permissionCode: 'VIEW_DEPT_DOSSIERS',
      scope: 'DEPARTMENT',
      order: 4,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'dept-assign-reviewer',
      label: 'Phân công phản biện',
      icon: 'UserCheck',
      route: '/dept-assign-reviewer',
      permissionCode: 'ASSIGN_DEPT_REVIEWER',
      scope: 'DEPARTMENT',
      order: 5,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'dept-review-exam',
      label: 'Thẩm định đề',
      icon: 'ClipboardCheck',
      route: '/dept-review-exam',
      permissionCode: 'REVIEW_DEPT_EXAM',
      scope: 'DEPARTMENT',
      order: 6,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'dept-progress',
      label: 'Tiến độ tổ',
      icon: 'TrendingUp',
      route: '/dept-progress',
      permissionCode: 'TRACK_DEPT_PROGRESS',
      scope: 'DEPARTMENT',
      order: 7,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'dept-report',
      label: 'Báo cáo',
      icon: 'BarChart3',
      route: '/dept-report',
      permissionCode: 'VIEW_DEPT_REPORTS',
      scope: 'DEPARTMENT',
      order: 8,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
    {
      id: 'my-profile',
      label: 'Tài khoản cá nhân',
      icon: 'UserCheck',
      route: '/my-profile',
      permissionCode: 'TRACK_DEPT_PROGRESS',
      scope: 'DEPARTMENT',
      order: 9,
      status: 'ACTIVE',
      allowedRoles: ['HEAD_OF_DEPARTMENT'],
    },
  ],

  TEACHER: [
    {
      id: 'dashboard',
      label: 'Trang chủ',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      permissionCode: 'VIEW_ASSIGNED_CURRICULUM',
      scope: 'TEACHER_PERSONAL',
      order: 1,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'curriculum',
      label: 'Công việc của tôi',
      icon: 'Briefcase',
      route: '/curriculum',
      permissionCode: 'VIEW_ASSIGNED_CURRICULUM',
      scope: 'TEACHER_PERSONAL',
      order: 2,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'questions',
      label: 'Ngân hàng câu hỏi',
      icon: 'Database',
      route: '/questions',
      permissionCode: 'VIEW_QUESTION_BANK',
      scope: 'TEACHER_PERSONAL',
      order: 3,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'ai-generator',
      label: 'AI tạo câu hỏi',
      icon: 'Sparkles',
      route: '/ai-generator',
      permissionCode: 'USE_AI_QUESTION_GENERATOR',
      scope: 'TEACHER_PERSONAL',
      order: 4,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'smart-question-link',
      label: 'Tạo câu hỏi thông minh',
      icon: 'ExternalLink',
      route: '/smart-question-link',
      permissionCode: 'VIEW_ASSIGNED_CURRICULUM',
      scope: 'TEACHER_PERSONAL',
      order: 5,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'matrix',
      label: 'Ma trận và bản đặc tả',
      icon: 'Grid',
      route: '/matrix',
      permissionCode: 'CREATE_EXAM_MATRIX',
      scope: 'TEACHER_PERSONAL',
      order: 6,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'exam-builder',
      label: 'Tạo đề kiểm tra',
      icon: 'FileText',
      route: '/exam-builder',
      permissionCode: 'CREATE_EXAM_PAPER',
      scope: 'TEACHER_PERSONAL',
      order: 7,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'ai-quality-review',
      label: 'AI kiểm tra chất lượng đề',
      icon: 'CheckCircle',
      route: '/ai-quality-review',
      permissionCode: 'USE_AI_QUALITY_REVIEW',
      scope: 'TEACHER_PERSONAL',
      order: 8,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'exam-workflow',
      label: 'Hồ sơ của tôi',
      icon: 'FolderKanban',
      route: '/exam-workflow',
      permissionCode: 'CREATE_EXAM_PAPER',
      scope: 'TEACHER_PERSONAL',
      order: 9,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'notification-center',
      label: 'Thông báo',
      icon: 'Bell',
      route: '/notification-center',
      permissionCode: 'VIEW_ASSIGNED_CURRICULUM',
      scope: 'TEACHER_PERSONAL',
      order: 10,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    {
      id: 'my-profile',
      label: 'Tài khoản cá nhân',
      icon: 'UserCheck',
      route: '/my-profile',
      permissionCode: 'VIEW_ASSIGNED_CURRICULUM',
      scope: 'TEACHER_PERSONAL',
      order: 11,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
  ],
};

/**
 * Các chức năng mở rộng của Giáo viên chỉ hiển thị trên Sidebar khi tài khoản được cấp quyền tương ứng
 */
export const TEACHER_CONDITIONAL_PERMISSION_MENUS: Array<{
  item: ProductionMenuItemConfig;
  requiredAnyPermissions: string[];
}> = [
  {
    item: {
      id: 'approval',
      label: 'Phản biện & Thẩm định',
      icon: 'ClipboardCheck',
      route: '/approval',
      permissionCode: 'REVIEW_DEPT_EXAM',
      scope: 'TEACHER_PERSONAL',
      order: 12,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    requiredAnyPermissions: [
      'REVIEW_DEPT_EXAM',
      'PEER_REVIEW_EXAM',
      'REVIEW_EXAM_VICE_PRINCIPAL',
    ],
  },
  {
    item: {
      id: 'records',
      label: 'Xuất hồ sơ kiểm tra',
      icon: 'FileText',
      route: '/records',
      permissionCode: 'EXPORT_APPROVED_DOSSIER',
      scope: 'TEACHER_PERSONAL',
      order: 13,
      status: 'ACTIVE',
      allowedRoles: ['TEACHER', 'REVIEWER'],
    },
    requiredAnyPermissions: [
      'EXPORT_APPROVED_DOSSIER',
      'EXPORT_EXAM_PACKAGE',
      'EXPORT_ANSWER_KEY_RUBRIC',
    ],
  },
];

/**
 * VII. DANH SÁCH ROUTE THỬ NGHIỆM / NGHIỆM THU BỊ ẨN TRÊN GIAO DIỆN NGƯỜI DÙNG CHÍNH THỨC
 */
export const HIDDEN_DEV_AND_TEST_ROUTES = new Set<string>([
  'stage16-acceptance',
  'multi-tenant-stage19',
  'smart-autosave-conflict',
  'stage21-production-ui',
]);

/**
 * Khu vực công cụ quản trị vận hành cần thiết được bảo vệ riêng cho Super Admin
 */
export const PROTECTED_OPERATIONAL_ADMIN_ROUTES = new Set<string>([
  'admin-firebase-data',
  'admin-backups',
  'multi-school-security',
  'admin-audit-logs',
]);

export function normalizeToPrimaryRoleKey(
  role?: string | null,
  email?: string | null,
  username?: string | null,
  positionTitle?: string | null
): PrimaryProductionRoleKey {
  const upper = String(role || '').toUpperCase();
  const lowerEmail = String(email || '').toLowerCase();
  const lowerUser = String(username || '').toLowerCase();
  const lowerPos = String(positionTitle || '').toLowerCase();

  if (
    upper === 'SUPER_ADMIN' ||
    lowerEmail.includes('superadmin') ||
    lowerUser.includes('superadmin') ||
    lowerPos.includes('super admin')
  ) {
    return 'SUPER_ADMIN';
  }
  if (
    upper === 'SCHOOL_ADMIN' ||
    lowerEmail === 'minhld@hue.edu.vn' ||
    lowerEmail === 'admin_sia@hue.edu.vn' ||
    lowerEmail === 'admin_ddung@hue.edu.vn' ||
    lowerEmail.includes('schooladmin') ||
    lowerUser === 'minhld' ||
    lowerUser === 'minhld@hue.edu.vn' ||
    lowerUser === 'admin_sia' ||
    lowerUser === 'admin_sia@hue.edu.vn' ||
    lowerUser === 'admin_ddung' ||
    lowerUser === 'admin_ddung@hue.edu.vn' ||
    lowerUser.includes('schooladmin') ||
    lowerPos.includes('quản trị viên trường')
  ) {
    return 'SCHOOL_ADMIN';
  }
  if (upper === 'SYSTEM_ADMIN') {
    if (
      lowerEmail === 'minhld@hue.edu.vn' ||
      lowerEmail === 'admin_sia@hue.edu.vn' ||
      lowerEmail === 'admin_ddung@hue.edu.vn' ||
      lowerEmail.includes('schooladmin') ||
      lowerPos.includes('trường')
    ) {
      return 'SCHOOL_ADMIN';
    }
    return 'SUPER_ADMIN';
  }
  if (upper === 'PRINCIPAL') return 'PRINCIPAL';
  if (upper === 'VICE_PRINCIPAL') return 'VICE_PRINCIPAL';
  if (upper === 'HEAD_OF_DEPARTMENT') return 'HEAD_OF_DEPARTMENT';
  return 'TEACHER';
}

export function getOfficialRoleDisplayLabel(roleKey: PrimaryProductionRoleKey | string): string {
  switch (roleKey) {
    case 'SUPER_ADMIN':
      return 'Super Admin (Quản trị nền tảng)';
    case 'SCHOOL_ADMIN':
      return 'Quản trị viên trường (School Admin)';
    case 'PRINCIPAL':
      return 'Hiệu trưởng';
    case 'VICE_PRINCIPAL':
      return 'Phó Hiệu trưởng';
    case 'HEAD_OF_DEPARTMENT':
      return 'Tổ trưởng chuyên môn';
    case 'TEACHER':
    default:
      return 'Giáo viên bộ môn';
  }
}

/**
 * VI & VIII. TỔNG HỢP MENU ĐỘNG THEO QUYỀN VÀ VAI TRÒ (KHÔNG TRÙNG LẶP MENU)
 */
export function resolveAuthorizedProductionMenus(params: {
  session: AuthenticatedUserSession | null;
  teacherProfile?: TeacherPermissionProfileSummary | null;
  workingRoleOverride?: PrimaryProductionRoleKey | null;
  combineMultiRoleMenus?: boolean;
  runtimeFlags?: RuntimeFeatureFlags;
}): ProductionMenuItemConfig[] {
  const {
    session,
    teacherProfile,
    workingRoleOverride,
    combineMultiRoleMenus = false,
    runtimeFlags = getRuntimeFeatureFlags(),
  } = params;
  if (!session || !session.user) return [];

  const primaryRoleKey =
    workingRoleOverride ||
    normalizeToPrimaryRoleKey(
      session.user.activeRole,
      session.user.email,
      session.user.username,
      session.user.positionTitle
    );

  const roleKeysToInclude: PrimaryProductionRoleKey[] = [primaryRoleKey];

  if (combineMultiRoleMenus || session.user.multiRoleMode === 'COMBINED_PERMISSIONS') {
    const rawRoles = new Set<string>([
      ...(session.user.roles || []),
      session.user.activeRole,
    ]);
    rawRoles.forEach((r) => {
      const normalized = normalizeToPrimaryRoleKey(
        r,
        session.user.email,
        session.user.username,
        session.user.positionTitle
      );
      if (!roleKeysToInclude.includes(normalized)) {
        roleKeysToInclude.push(normalized);
      }
    });
  }

  const seenMenuIds = new Set<string>();
  const resolvedMenus: ProductionMenuItemConfig[] = [];

  for (const roleKey of roleKeysToInclude) {
    const roleMenuList = PRODUCTION_ROLE_MENUS[roleKey] || PRODUCTION_ROLE_MENUS.TEACHER;
    for (const item of roleMenuList) {
      if (item.status !== 'ACTIVE') continue;
      if (
        (runtimeFlags.isProduction || runtimeFlags.hideExperimentalFeatures) &&
        HIDDEN_DEV_AND_TEST_ROUTES.has(item.id)
      ) {
        continue;
      }
      if (seenMenuIds.has(item.id)) continue;

      // Đối với Giáo viên, kiểm tra nếu hồ sơ phân quyền thu hồi quyền cụ thể
      if (
        roleKey === 'TEACHER' &&
        teacherProfile &&
        Array.isArray(teacherProfile.permissionCodes) &&
        teacherProfile.permissionCodes.length > 0
      ) {
        const permCodes = teacherProfile.permissionCodes as string[];
        if (
          item.id === 'ai-quality-review' &&
          !permCodes.includes('USE_AI_QUALITY_REVIEW') &&
          !permCodes.includes('AI_REVIEW_EXAM')
        ) {
          continue;
        }
        if (
          item.id === 'ai-generator' &&
          !permCodes.includes('USE_AI_QUESTION_GENERATOR') &&
          !permCodes.includes('AI_GENERATE_QUESTION')
        ) {
          continue;
        }
      }

      seenMenuIds.add(item.id);
      resolvedMenus.push(item);
    }

    // Bổ sung các chức năng mở rộng của Giáo viên chỉ khi có quyền được cấp rõ ràng
    if (roleKey === 'TEACHER' && teacherProfile && Array.isArray(teacherProfile.permissionCodes)) {
      for (const cond of TEACHER_CONDITIONAL_PERMISSION_MENUS) {
        if (seenMenuIds.has(cond.item.id)) continue;
        const hasExplicitPerm = cond.requiredAnyPermissions.some((code) =>
          (teacherProfile.permissionCodes as string[]).includes(code)
        );
        if (hasExplicitPerm) {
          seenMenuIds.add(cond.item.id);
          resolvedMenus.push(cond.item);
        }
      }
    }
  }

  return resolvedMenus;
}

/**
 * IX. BẢO VỆ ROUTE (ProtectedRoute) THEO CHẾ ĐỘ PRODUCTION-ONLY & FEATURE FLAGS
 */
export function verifyProductionRouteAccess(params: {
  tabId: MenuSectionId;
  session: AuthenticatedUserSession | null;
  teacherProfile?: TeacherPermissionProfileSummary | null;
  workingRoleOverride?: PrimaryProductionRoleKey | null;
  combineMultiRoleMenus?: boolean;
  runtimeFlags?: RuntimeFeatureFlags;
}): {
  allowed: boolean;
  reason?:
    | 'UNAUTHENTICATED'
    | 'ACCOUNT_LOCKED'
    | 'SCHOOL_SUSPENDED'
    | 'DEV_ROUTE_BLOCKED'
    | 'INSUFFICIENT_PERMISSION';
  message?: string;
} {
  const {
    tabId,
    session,
    teacherProfile,
    workingRoleOverride,
    runtimeFlags = getRuntimeFeatureFlags(),
  } = params;

  if (!session || !session.user?.id) {
    return {
      allowed: false,
      reason: 'UNAUTHENTICATED',
      message: 'Vui lòng đăng nhập để truy cập hệ thống.',
    };
  }

  if (session.user.status === 'LOCKED' || session.user.status === 'DISABLED') {
    return {
      allowed: false,
      reason: 'ACCOUNT_LOCKED',
      message:
        'Tài khoản của bạn hiện đang bị khóa hoặc ngừng kích hoạt. Vui lòng liên hệ Quản trị viên nhà trường.',
    };
  }

  const primaryRoleKey =
    workingRoleOverride ||
    normalizeToPrimaryRoleKey(
      session.user.activeRole,
      session.user.email,
      session.user.username,
      session.user.positionTitle
    );

  // Trong môi trường PRODUCTION: khóa cứng 100% các route phát triển, demo, kiểm thử
  if (HIDDEN_DEV_AND_TEST_ROUTES.has(tabId)) {
    if (
      runtimeFlags.isProduction ||
      (!runtimeFlags.enableDemoPages && !runtimeFlags.enableQaTestButtons) ||
      primaryRoleKey !== 'SUPER_ADMIN'
    ) {
      return {
        allowed: false,
        reason: 'DEV_ROUTE_BLOCKED',
        message:
          'Chế độ Production Only: Các trang phát triển, dữ liệu Demo và công cụ kiểm thử đã bị vô hiệu hóa trên giao diện hoạt động chính thức.',
      };
    }
    return { allowed: true };
  }

  // Khu vực công cụ quản trị vận hành bảo vệ riêng cho Super Admin
  if (PROTECTED_OPERATIONAL_ADMIN_ROUTES.has(tabId)) {
    if (primaryRoleKey === 'SUPER_ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'INSUFFICIENT_PERMISSION',
      message:
        'Khu vực công cụ quản trị vận hành kỹ thuật chỉ dành riêng cho Quản trị viên nền tảng (Super Admin).',
    };
  }

  if (
    tabId === 'dashboard' ||
    tabId === 'my-profile' ||
    tabId === 'notification-center' ||
    tabId === 'smart-question-link' ||
    (primaryRoleKey === 'TEACHER' && tabId === 'curriculum') ||
    (primaryRoleKey === 'SCHOOL_ADMIN' && tabId === 'admin-academic-year') ||
    (primaryRoleKey === 'PRINCIPAL' &&
      (tabId === 'bgh-assign-exam' || tabId === 'bgh-school-dossiers')) ||
    (primaryRoleKey === 'VICE_PRINCIPAL' && tabId === 'ai-quality-review') ||
    (primaryRoleKey === 'HEAD_OF_DEPARTMENT' && tabId === 'matrix')
  ) {
    return { allowed: true };
  }

  const authorizedMenus = resolveAuthorizedProductionMenus({
    session,
    teacherProfile,
    workingRoleOverride,
    combineMultiRoleMenus: true,
    runtimeFlags,
  });

  if (authorizedMenus.some((m) => m.id === tabId)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'INSUFFICIENT_PERMISSION',
    message: 'Bạn không có quyền truy cập chức năng này theo phân quyền chức vụ hiện tại.',
  };
}
