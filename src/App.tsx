import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  ClipboardList,
  Database,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  FolderKanban,
  GitBranch,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UserCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import {
  ApprovalStatus,
  AuthenticatedUserSession,
  CurriculumTopic,
  DataSourceFilter,
  EducationLevelId,
  ExamMatrix,
  ExamPaper,
  MenuSectionId,
  QuestionGroup,
  QuestionItem,
  SchoolBrandingConfig,
  SmartQuestionLinkConfig,
  StorageConfig,
  TeacherPermissionProfileSummary,
  ToastNotification,
  WorkflowActorRole,
} from './types/domain';
import { dataRepository } from './services/storage/repository';
import { areSubjectNamesEquivalent } from './data/matrixLessonCatalog';
import {
  fetchSchoolBranding,
  loginWithServerRoleScenario,
  logoutCurrentSession,
  restoreAuthSession,
  selectWorkingRoleOrPolicy,
} from './services/auth/authSessionService';
import { EduTestLoginWorkspace } from './components/EduTestLoginWorkspace';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TeacherMyWorkWorkspace } from './components/TeacherMyWorkWorkspace';
import { QuestionBankWorkspace } from './components/QuestionBankWorkspace';
import { AIQuestionGeneratorWorkspace } from './components/AIQuestionGeneratorWorkspace';
import { MatrixAndSpecificationWorkspace } from './components/MatrixAndSpecificationWorkspace';
import { ExamGeneratorWorkspace } from './components/ExamGeneratorWorkspace';
import { AppraisalAndApprovalWorkspace } from './components/AppraisalAndApprovalWorkspace';
import { DossierExportWorkspace } from './components/DossierExportWorkspace';
import { SystemAdministrationWorkspace } from './components/SystemAdministrationWorkspace';
import { QualityAssuranceAndAcceptanceWorkspace } from './components/QualityAssuranceAndAcceptanceWorkspace';
import { SecondaryModulesView } from './components/MatrixExamAndWorkflowViews';
import { SmartExamImportWorkspace } from './components/SmartExamImportWorkspace';
import { CorpusAndQuestionGroupWorkspace } from './components/CorpusAndQuestionGroupWorkspace';
import { PrimaryAssessmentWorkspace } from './components/PrimaryAssessmentWorkspace';
import { ExamResultAnalyticsWorkspace } from './components/ExamResultAnalyticsWorkspace';
import { AIQualityReviewWorkspace } from './components/AIQualityReviewWorkspace';
import { BghProfessionalReportWorkspace } from './components/BghProfessionalReportWorkspace';
import { EndToEndExamWorkflowWorkspace } from './components/EndToEndExamWorkflowWorkspace';
import { DossierProgressManagementWorkspace } from './components/DossierProgressManagementWorkspace';
import {
  NotificationBellDropdown,
  WorkflowNotificationCenterWorkspace,
} from './components/WorkflowNotificationCenterWorkspace';
import { ExecutiveDashboardWorkspace } from './components/ExecutiveDashboardWorkspace';
import { Stage16AcceptanceTestWorkspace } from './components/Stage16AcceptanceTestWorkspace';
import { RoleBasedWorkspaceHub } from './components/RoleBasedWorkspaceHub';
import { TeacherPermissionManagerWorkspace } from './components/TeacherPermissionManagerWorkspace';
import { TeacherAccountManagementWorkspace } from './components/TeacherAccountManagementWorkspace';
import { DepartmentAndTeachingAssignmentWorkspace } from './components/DepartmentAndTeachingAssignmentWorkspace';
import { CrossModulePermissionSyncBanner } from './components/CrossModulePermissionSyncBanner';
import { FirebaseDataManagementDashboard } from './components/FirebaseDataManagementDashboard';
import { SmartAutosaveAndConflictWorkspace } from './components/SmartAutosaveAndConflictWorkspace';
import {
  SelfProfileTabId,
  TeacherSelfProfileAndPasswordWorkspace,
} from './components/TeacherSelfProfileAndPasswordWorkspace';
import { SchoolContextProvider } from './contexts/SchoolContext';
import { MultiTenantStage19Workspace } from './components/MultiTenantStage19Workspace';
import { SuperAdminSchoolManagementWorkspace } from './components/SuperAdminSchoolManagementWorkspace';
import { SchoolAdminWorkspace } from './components/SchoolAdminWorkspace';
import { SharedQuestionRepositoryWorkspace } from './components/SharedQuestionRepositoryWorkspace';
import { MultiSchoolSecurityRulesWorkspace } from './components/MultiSchoolSecurityRulesWorkspace';
import { HeaderSchoolSwitcherBar } from './components/MultiSchoolLoginAndSelectorModal';
import { SchoolConfigurationModuleWorkspace } from './components/SchoolConfigurationModuleWorkspace';
import { AIUsageManagementWorkspace } from './components/AIUsageManagementWorkspace';
import { SchoolSubscriptionPlanWorkspace } from './components/SchoolSubscriptionPlanWorkspace';
import { Stage21OfficialProductionUIWorkspace } from './components/Stage21OfficialProductionUIWorkspace';
import { ProductionRoleDashboardWorkspace } from './components/ProductionRoleDashboardWorkspace';
import { SmartQuestionLinkWorkspace } from './components/SmartQuestionLinkWorkspace';
import {
  SMART_QUESTION_LINK_UPDATED_EVENT,
  fetchSmartQuestionLinkConfig,
  getCachedSmartQuestionLinkConfig,
  normalizeClientSmartUrl,
} from './services/smartQuestionLinkService';
import {
  PrimaryProductionRoleKey,
  getOfficialRoleDisplayLabel,
  normalizeToPrimaryRoleKey,
  resolveAuthorizedProductionMenus,
  verifyProductionRouteAccess,
} from './config/productionMenuRegistry';
import {
  RuntimeFeatureFlags,
  getRuntimeFeatureFlags,
  syncRuntimeEnvironmentFromBackend,
} from './config/runtimeEnvironment';
import { Award, Briefcase, CalendarRange, CreditCard, Grid, History, Network, TrendingUp } from 'lucide-react';

interface MenuItemConfig {
  id: MenuSectionId;
  orderNumber: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  phaseStatus: 'ACTIVE_P1' | 'PARTIAL_P2';
  roleGroupBadge?: string;
}

// Danh mục đầy đủ 16 Giai đoạn (Chế độ Kiểm thử Tổng thể)
const ALL_STAGE_MENU_ITEMS: MenuItemConfig[] = [
  { id: 'dashboard', orderNumber: '01', label: 'Trang chủ theo Vai trò', icon: LayoutDashboard, phaseStatus: 'ACTIVE_P1' },
  { id: 'stage21-production-ui', orderNumber: 'UI21', label: 'GIAO DIỆN CHÍNH THỨC (GĐ 21)', icon: Sparkles, phaseStatus: 'ACTIVE_P1' },
  { id: 'stage16-acceptance', orderNumber: 'QA16', label: 'NGHIỆM THU TÍCH HỢP GIAI ĐOẠN 16', icon: CheckCircle2, phaseStatus: 'ACTIVE_P1' },
  { id: 'executive-dashboard', orderNumber: 'EXEC', label: 'EXECUTIVE DASHBOARD (BGH)', icon: LayoutDashboard, phaseStatus: 'ACTIVE_P1' },
  { id: 'notification-center', orderNumber: 'TB', label: 'CÔNG VIỆC CỦA TÔI & THÔNG BÁO', icon: Bell, phaseStatus: 'ACTIVE_P1' },
  { id: 'progress-management', orderNumber: 'BGH', label: 'QUẢN LÝ TIẾN ĐỘ HỒ SƠ (BGH)', icon: ClipboardList, phaseStatus: 'ACTIVE_P1' },
  { id: 'exam-workflow', orderNumber: '00', label: 'QUY TRÌNH TẠO ĐỀ (9 Bước)', icon: GitBranch, phaseStatus: 'ACTIVE_P1' },
  { id: 'curriculum', orderNumber: '02', label: 'Chương trình giáo dục', icon: BookOpen, phaseStatus: 'ACTIVE_P1' },
  { id: 'corpus', orderNumber: '03', label: 'Kho ngữ liệu & Nhóm câu hỏi', icon: Layers, phaseStatus: 'ACTIVE_P1' },
  { id: 'primary-assessment', orderNumber: '04', label: 'Đánh giá Tiểu học (TT27)', icon: GraduationCap, phaseStatus: 'ACTIVE_P1' },
  { id: 'exam-analytics', orderNumber: '05', label: 'Phân tích kết quả & Câu hỏi', icon: BarChart3, phaseStatus: 'ACTIVE_P1' },
  { id: 'ai-quality-review', orderNumber: '06', label: 'AI KIỂM TRA CHẤT LƯỢNG ĐỀ', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'questions', orderNumber: '07', label: 'Ngân hàng câu hỏi', icon: HelpCircle, phaseStatus: 'ACTIVE_P1' },
  { id: 'shared-question-repo', orderNumber: '07B', label: 'KHO CÂU HỎI DÙNG CHUNG', icon: Layers, phaseStatus: 'ACTIVE_P1' },
  { id: 'smart-import', orderNumber: '08', label: 'Nhập đề từ tài liệu', icon: Upload, phaseStatus: 'ACTIVE_P1' },
  { id: 'ai-generator', orderNumber: '09', label: 'AI tạo câu hỏi', icon: Sparkles, phaseStatus: 'ACTIVE_P1' },
  { id: 'smart-question-link', orderNumber: '09B', label: 'Tạo câu hỏi thông minh', icon: ExternalLink, phaseStatus: 'ACTIVE_P1' },
  { id: 'matrix', orderNumber: '10', label: 'Ma trận và bản đặc tả', icon: FileSpreadsheet, phaseStatus: 'ACTIVE_P1' },
  { id: 'exam-builder', orderNumber: '11', label: 'Tạo đề kiểm tra', icon: FileText, phaseStatus: 'ACTIVE_P1' },
  { id: 'approval', orderNumber: '12', label: 'Thẩm định – phê duyệt', icon: CheckSquare, phaseStatus: 'ACTIVE_P1' },
  { id: 'records', orderNumber: '13', label: 'Hồ sơ kiểm tra', icon: FolderArchive, phaseStatus: 'ACTIVE_P1' },
  { id: 'reports', orderNumber: '14', label: 'Báo cáo – Nghiệm thu', icon: BarChart3, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-accounts', orderNumber: 'TK', label: 'QUẢN LÝ TÀI KHOẢN', icon: Users, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-departments', orderNumber: 'TCM', label: 'Tổ chuyên môn', icon: Building2, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-teacher-permissions', orderNumber: 'PQ', label: 'PHÂN QUYỀN GIÁO VIÊN', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-firebase-data', orderNumber: 'FB', label: 'QUẢN LÝ DỮ LIỆU FIREBASE', icon: Database, phaseStatus: 'ACTIVE_P1' },
  { id: 'super-admin-schools', orderNumber: 'TRG', label: 'QUẢN LÝ TRƯỜNG HỌC', icon: Building2, phaseStatus: 'ACTIVE_P1' },
  { id: 'school-admin-workspace', orderNumber: 'SA', label: 'SCHOOL ADMIN (QUẢN TRỊ TRƯỜNG)', icon: UserCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-school-config', orderNumber: 'CFG', label: 'CẤU HÌNH TRƯỜNG HỌC', icon: SlidersHorizontal, phaseStatus: 'ACTIVE_P1' },
  { id: 'ai-usage-management', orderNumber: 'AIQ', label: 'QUẢN LÝ HẠN MỨC AI (AI USAGE)', icon: Sparkles, phaseStatus: 'ACTIVE_P1' },
  { id: 'school-plan-management', orderNumber: 'PLN', label: 'QUẢN LÝ GÓI SỬ DỤNG TRƯỜNG HỌC', icon: Layers, phaseStatus: 'ACTIVE_P1' },
  { id: 'multi-school-security', orderNumber: 'SEC', label: 'BẢO MẬT ĐA TRƯỜNG & RULES', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'multi-tenant-stage19', orderNumber: 'MT19', label: 'ĐA TRƯỜNG (MULTI-TENANT GĐ19)', icon: Building2, phaseStatus: 'ACTIVE_P1' },
  { id: 'smart-autosave-conflict', orderNumber: 'AS', label: 'AUTOSAVE & KIỂM SOÁT XUNG ĐỘT', icon: Save, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin', orderNumber: '15', label: 'Quản trị hệ thống & Phân quyền', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'my-profile', orderNumber: '16', label: 'Tài khoản cá nhân', icon: UserCog, phaseStatus: 'ACTIVE_P1' },
  { id: 'settings', orderNumber: '17', label: 'Thiết lập hệ thống', icon: Settings, phaseStatus: 'ACTIVE_P1' },
];

// Mục II: Menu chuẩn của GIÁO VIÊN
const TEACHER_ROLE_MENU_ITEMS: MenuItemConfig[] = [
  { id: 'dashboard', orderNumber: '1', label: 'Trang chủ', icon: LayoutDashboard, phaseStatus: 'ACTIVE_P1' },
  { id: 'stage21-production-ui', orderNumber: '1B', label: 'Giao diện Production (GĐ 21)', icon: Sparkles, phaseStatus: 'ACTIVE_P1' },
  { id: 'curriculum', orderNumber: '2', label: 'Chương trình giáo dục', icon: BookOpen, phaseStatus: 'ACTIVE_P1' },
  { id: 'questions', orderNumber: '3', label: 'Ngân hàng câu hỏi', icon: HelpCircle, phaseStatus: 'ACTIVE_P1' },
  { id: 'shared-question-repo', orderNumber: '3B', label: 'KHO CÂU HỎI DÙNG CHUNG', icon: Layers, phaseStatus: 'ACTIVE_P1' },
  { id: 'ai-generator', orderNumber: '4', label: 'AI tạo câu hỏi', icon: Sparkles, phaseStatus: 'ACTIVE_P1' },
  { id: 'smart-question-link', orderNumber: '5', label: 'Tạo câu hỏi thông minh', icon: ExternalLink, phaseStatus: 'ACTIVE_P1' },
  { id: 'matrix', orderNumber: '6', label: 'Ma trận và bản đặc tả', icon: FileSpreadsheet, phaseStatus: 'ACTIVE_P1' },
  { id: 'exam-builder', orderNumber: '7', label: 'Tạo đề kiểm tra', icon: FileText, phaseStatus: 'ACTIVE_P1' },
  { id: 'ai-quality-review', orderNumber: '8', label: 'AI kiểm tra chất lượng', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'exam-workflow', orderNumber: '9', label: 'Hồ sơ của tôi', icon: FolderKanban, phaseStatus: 'ACTIVE_P1' },
  { id: 'approval', orderNumber: '10', label: 'Phản hồi thẩm định', icon: ClipboardCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'notification-center', orderNumber: '11', label: 'Thông báo', icon: Bell, phaseStatus: 'ACTIVE_P1' },
  { id: 'my-profile', orderNumber: '12', label: 'Tài khoản cá nhân', icon: UserCog, phaseStatus: 'ACTIVE_P1' },
];

// Mục III: Bổ sung 5 Menu của TỔ TRƯỞNG CHUYÊN MÔN
const HOD_EXTENDED_MENU_ITEMS: MenuItemConfig[] = [
  { id: 'dept-dossiers', orderNumber: '12', label: 'Hồ sơ của tổ', icon: FolderKanban, phaseStatus: 'ACTIVE_P1', roleGroupBadge: 'Tổ CM' },
  { id: 'dept-assign-reviewer', orderNumber: '13', label: 'Phân công phản biện', icon: Users, phaseStatus: 'ACTIVE_P1', roleGroupBadge: 'Tổ CM' },
  { id: 'dept-review-exam', orderNumber: '14', label: 'Thẩm định đề', icon: ClipboardCheck, phaseStatus: 'ACTIVE_P1', roleGroupBadge: 'Tổ CM' },
  { id: 'dept-progress', orderNumber: '15', label: 'Tiến độ tổ', icon: ClipboardList, phaseStatus: 'ACTIVE_P1', roleGroupBadge: 'Tổ CM' },
  { id: 'dept-report', orderNumber: '16', label: 'Báo cáo tổ chuyên môn', icon: BarChart3, phaseStatus: 'ACTIVE_P1', roleGroupBadge: 'Tổ CM' },
];

// Mục IV: 6 Menu chuyên biệt của BAN GIÁM HIỆU (Phó Hiệu trưởng & Hiệu trưởng)
const BGH_EXTENDED_MENU_ITEMS: MenuItemConfig[] = [
  { id: 'bgh-school-dossiers', orderNumber: '2', label: 'Quản lý hồ sơ toàn trường theo quyền', icon: FolderKanban, phaseStatus: 'ACTIVE_P1' },
  { id: 'bgh-assign-exam', orderNumber: '3', label: 'Phân công ra đề', icon: Users, phaseStatus: 'ACTIVE_P1' },
  { id: 'bgh-progress-tracking', orderNumber: '4', label: 'Theo dõi tiến độ', icon: ClipboardList, phaseStatus: 'ACTIVE_P1' },
  { id: 'bgh-approval', orderNumber: '5', label: 'Thẩm định và phê duyệt', icon: FileCheck2, phaseStatus: 'ACTIVE_P1' },
  { id: 'bgh-quality-report', orderNumber: '6', label: 'Báo cáo chất lượng', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'bgh-result-analytics', orderNumber: '7', label: 'Phân tích kết quả kiểm tra', icon: BarChart3, phaseStatus: 'ACTIVE_P1' },
];

// Mục V: Menu chuyên biệt của QUẢN TRỊ HỆ THỐNG (bổ sung QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN GIÁO VIÊN)
const ADMIN_EXTENDED_MENU_ITEMS: MenuItemConfig[] = [
  { id: 'stage21-production-ui', orderNumber: '1A', label: 'GIAO DIỆN CHÍNH THỨC (GĐ 21)', icon: Sparkles, phaseStatus: 'ACTIVE_P1' },
  { id: 'super-admin-schools', orderNumber: '1B', label: 'QUẢN LÝ TRƯỜNG HỌC', icon: Building2, phaseStatus: 'ACTIVE_P1' },
  { id: 'school-admin-workspace', orderNumber: '1C', label: 'SCHOOL ADMIN (QUẢN TRỊ TRƯỜNG)', icon: UserCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'shared-question-repo', orderNumber: '1D', label: 'KHO CÂU HỎI DÙNG CHUNG', icon: Layers, phaseStatus: 'ACTIVE_P1' },
  { id: 'multi-school-security', orderNumber: '1E', label: 'BẢO MẬT ĐA TRƯỜNG & RULES', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-firebase-data', orderNumber: '2', label: 'QUẢN LÝ DỮ LIỆU FIREBASE', icon: Database, phaseStatus: 'ACTIVE_P1' },
  { id: 'multi-tenant-stage19', orderNumber: '2A', label: 'ĐA TRƯỜNG (MULTI-TENANT GĐ19)', icon: Building2, phaseStatus: 'ACTIVE_P1' },
  { id: 'smart-autosave-conflict', orderNumber: '2B', label: 'AUTOSAVE & KIỂM SOÁT XUNG ĐỘT', icon: Save, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-accounts', orderNumber: '3', label: 'QUẢN LÝ TÀI KHOẢN', icon: Users, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-departments', orderNumber: '4', label: 'Tổ chuyên môn', icon: Building2, phaseStatus: 'ACTIVE_P1' },
  { id: 'bgh-assign-exam', orderNumber: '4B', label: 'Phân công giảng dạy', icon: Users, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-teacher-permissions', orderNumber: '5', label: 'PHÂN QUYỀN GIÁO VIÊN', icon: ShieldCheck, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-roles', orderNumber: '6', label: 'Vai trò và quyền', icon: KeyRound, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-school-config', orderNumber: '7', label: 'CẤU HÌNH TRƯỜNG HỌC', icon: SlidersHorizontal, phaseStatus: 'ACTIVE_P1' },
  { id: 'ai-usage-management', orderNumber: '7B', label: 'QUẢN LÝ HẠN MỨC AI (AI USAGE)', icon: Sparkles, phaseStatus: 'ACTIVE_P1' },
  { id: 'school-plan-management', orderNumber: '7C', label: 'QUẢN LÝ GÓI SỬ DỤNG TRƯỜNG HỌC', icon: Layers, phaseStatus: 'ACTIVE_P1' },
  { id: 'smart-question-link', orderNumber: '7D', label: 'Tạo câu hỏi thông minh', icon: ExternalLink, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-academic-year', orderNumber: '8', label: 'Cấu hình năm học', icon: CalendarClock, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-audit-logs', orderNumber: '9', label: 'Nhật ký', icon: ClipboardList, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-backups', orderNumber: '10', label: 'Sao lưu', icon: Database, phaseStatus: 'ACTIVE_P1' },
  { id: 'admin-system-settings', orderNumber: '11', label: 'Thiết lập hệ thống', icon: Settings, phaseStatus: 'ACTIVE_P1' },
];

function getMenusForActiveRole(
  activeRole: WorkflowActorRole | undefined,
  roleScopedSidebarMode: boolean,
  teacherPermProfile?: TeacherPermissionProfileSummary | null
): MenuItemConfig[] {
  if (!roleScopedSidebarMode) {
    return ALL_STAGE_MENU_ITEMS;
  }
  const role = activeRole || 'TEACHER';
  if (role === 'TEACHER' || role === 'REVIEWER') {
    if (!teacherPermProfile || !Array.isArray(teacherPermProfile.permissionCodes)) {
      return TEACHER_ROLE_MENU_ITEMS;
    }
    const perms = teacherPermProfile.permissionCodes;
    const dynamicTeacherMenus = TEACHER_ROLE_MENU_ITEMS.filter((item) => {
      if (item.id === 'ai-generator') {
        return perms.includes('USE_AI_QUESTION_GENERATOR');
      }
      if (item.id === 'ai-quality-review') {
        return perms.includes('USE_AI_QUALITY_REVIEW');
      }
      if (item.id === 'questions') {
        return perms.includes('VIEW_QUESTION_BANK') || perms.includes('CREATE_QUESTION');
      }
      if (item.id === 'matrix') {
        return (
          perms.includes('CREATE_EXAM_MATRIX') ||
          perms.includes('CREATE_EXAM_SPECIFICATION')
        );
      }
      if (item.id === 'exam-builder') {
        return perms.includes('CREATE_EXAM_PAPER') || perms.includes('EDIT_EXAM_PAPER');
      }
      return true;
    });
    if (
      (perms.includes('EXPORT_EXAM_WORD_PDF') ||
        perms.includes('EXPORT_ANSWER_KEY_RUBRIC')) &&
      !dynamicTeacherMenus.some((m) => m.id === 'records')
    ) {
      dynamicTeacherMenus.splice(8, 0, {
        id: 'records',
        orderNumber: '8B',
        label: 'Xuất hồ sơ kiểm tra',
        icon: FolderArchive,
        phaseStatus: 'ACTIVE_P1',
      });
    }
    return dynamicTeacherMenus;
  }
  if (role === 'HEAD_OF_DEPARTMENT') {
    return [...TEACHER_ROLE_MENU_ITEMS, ...HOD_EXTENDED_MENU_ITEMS];
  }
  if (role === 'VICE_PRINCIPAL' || role === 'PRINCIPAL') {
    return [
      { id: 'dashboard', orderNumber: '1', label: 'Trang chủ Ban Giám hiệu', icon: LayoutDashboard, phaseStatus: 'ACTIVE_P1' },
      ...BGH_EXTENDED_MENU_ITEMS,
      { id: 'curriculum', orderNumber: '8', label: 'Chương trình giáo dục', icon: BookOpen, phaseStatus: 'ACTIVE_P1' },
      { id: 'questions', orderNumber: '9', label: 'Ngân hàng câu hỏi', icon: HelpCircle, phaseStatus: 'ACTIVE_P1' },
      { id: 'smart-question-link', orderNumber: '9B', label: 'Tạo câu hỏi thông minh', icon: ExternalLink, phaseStatus: 'ACTIVE_P1' },
      { id: 'matrix', orderNumber: '10', label: 'Ma trận và bản đặc tả', icon: FileSpreadsheet, phaseStatus: 'ACTIVE_P1' },
      { id: 'notification-center', orderNumber: '11', label: 'Thông báo', icon: Bell, phaseStatus: 'ACTIVE_P1' },
      { id: 'my-profile', orderNumber: '12', label: 'Tài khoản cá nhân', icon: UserCog, phaseStatus: 'ACTIVE_P1' },
    ];
  }
  if (role === 'SYSTEM_ADMIN') {
    return [
      { id: 'dashboard', orderNumber: '1', label: 'Trang chủ Quản trị', icon: LayoutDashboard, phaseStatus: 'ACTIVE_P1' },
      ...ADMIN_EXTENDED_MENU_ITEMS,
      { id: 'notification-center', orderNumber: '9', label: 'Thông báo', icon: Bell, phaseStatus: 'ACTIVE_P1' },
      { id: 'my-profile', orderNumber: '10', label: 'Tài khoản cá nhân', icon: UserCog, phaseStatus: 'ACTIVE_P1' },
    ];
  }
  return TEACHER_ROLE_MENU_ITEMS;
}

const SIDEBAR_VISIBLE_STORAGE_KEY = 'edutest_dashboard_sidebar_visible';
const SIDEBAR_COMPACT_STORAGE_KEY = 'edutest_dashboard_sidebar_compact';
const FILTER_BAR_VISIBLE_STORAGE_KEY = 'edutest_dashboard_filter_bar_visible';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuSectionId>('dashboard');
  const [selfProfileTab, setSelfProfileTab] = useState<SelfProfileTabId>('PERSONAL_INFO');
  const [userAccountMenuOpen, setUserAccountMenuOpen] = useState<boolean>(false);
  const [focusedWorkflowId, setFocusedWorkflowId] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [roleScopedSidebarMode, setRoleScopedSidebarMode] = useState<boolean>(true);

  // Mục VI: Bảo vệ dữ liệu biểu mẫu đang chỉnh sửa khi chuyển vai trò hoặc điều hướng
  const [unsavedDraftText, setUnsavedDraftText] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [pendingGuardAction, setPendingGuardAction] = useState<
    | { type: 'NAVIGATE'; targetMenuId: MenuSectionId }
    | { type: 'SWITCH_ROLE'; nextRole: WorkflowActorRole }
    | null
  >(null);

  // Trạng thái Đăng nhập, Xác thực & Thông tin trường học (Mục I -> V)
  const [authSession, setAuthSession] = useState<AuthenticatedUserSession | null>(null);
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [combineMultiRoleMenus, setCombineMultiRoleMenus] = useState<boolean>(false);
  const [workingRoleOverride, setWorkingRoleOverride] = useState<PrimaryProductionRoleKey | null>(null);
  const [runtimeFlags, setRuntimeFlags] = useState<RuntimeFeatureFlags>(() =>
    getRuntimeFeatureFlags()
  );
  const [interceptedProtectedRoute, setInterceptedProtectedRoute] = useState<{
    menuId: MenuSectionId;
    label: string;
  } | null>(null);
  const [schoolBranding, setSchoolBranding] = useState<SchoolBrandingConfig>({
    schoolId: 'SCH-DAN-DIEN-NDA',
    softwareTitle: 'EDU TEST AI',
    softwareSubtitle: 'NGÂN HÀNG ĐỀ KIỂM TRA THÔNG MINH',
    schoolName: 'Trường TH &THCS Nguyễn Đình Anh',
    governingBody: 'UBND XÃ ĐAN ĐIỀN',
    academicYear: '2026 - 2027',
    logoUrl: '',
    multiRolePolicy: 'SELECT_WORKING_ROLE',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống',
  });

  // Trạng thái ẩn/hiện và thu gọn thanh Dashboard bên trái (lưu vào localStorage)
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_VISIBLE_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [desktopSidebarCompact, setDesktopSidebarCompact] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_COMPACT_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [filterBarVisible, setFilterBarVisible] = useState<boolean>(false);

  const toggleDesktopSidebar = () => {
    setDesktopSidebarVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_VISIBLE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const toggleDesktopSidebarCompact = () => {
    setDesktopSidebarCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COMPACT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const toggleFilterBar = () => {
    setFilterBarVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(FILTER_BAR_VISIBLE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Phím tắt Ctrl+B / Cmd+B để ẩn/hiện nhanh thanh Dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        toggleDesktopSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bộ lọc Nguồn dữ liệu (Mẫu vs Thật) & Cấp học
  const [sourceFilter, setSourceFilter] = useState<DataSourceFilter>('ALL');
  const [levelFilter, setLevelFilter] = useState<EducationLevelId | 'ALL'>('ALL');

  // Dữ liệu từ Repository Layer
  const [config, setConfig] = useState<StorageConfig>(() => dataRepository.getConfig());
  const [topics, setTopics] = useState<CurriculumTopic[]>(() => dataRepository.getTopics());
  const [questions, setQuestions] = useState<QuestionItem[]>(() => dataRepository.getQuestions());
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>(() =>
    dataRepository.getQuestionGroups()
  );
  const [matrices, setMatrices] = useState<ExamMatrix[]>(() => dataRepository.getMatrices());
  const [exams, setExams] = useState<ExamPaper[]>(() => dataRepository.getExams());

  const canSwitchWorkspaceSchool = Boolean(
    authSession?.user?.email?.toLowerCase() === 'lanhuong.gv@edutest.vn' ||
      authSession?.user?.roles?.some((r) => ['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(String(r)))
  );

  const activeWorkspaceSchoolId = canSwitchWorkspaceSchool
    ? schoolBranding.schoolId || authSession?.user?.schoolId || 'SCHOOL_A'
    : authSession?.user?.schoolId || schoolBranding.schoolId || 'SCHOOL_A';

  // Giai đoạn 17: Đồng bộ dữ liệu từ Kho lưu trữ tập trung (Central Server & Firestore) khi tải trang
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const targetSchoolId = activeWorkspaceSchoolId || 'sch-th-thcs-nguyen-du';
      dataRepository.setActiveTenant(
        targetSchoolId,
        authSession?.user?.id || 'usr-admin-01'
      );
      await dataRepository.initializeFromCentralServer(targetSchoolId);
      if (!cancelled) {
        const repoCfg = dataRepository.getConfig();
        const derivedSchoolName =
          targetSchoolId === 'SCHOOL_B'
            ? 'Trường Tiểu học Sịa'
            : targetSchoolId === 'SCHOOL_C'
            ? 'Trường THCS Đặng Dung'
            : schoolBranding.schoolName || repoCfg.schoolName;
        setConfig({
          ...repoCfg,
          schoolName: derivedSchoolName,
          academicYear: schoolBranding.academicYear || repoCfg.academicYear,
        });
        setQuestions(dataRepository.getQuestions());
        setQuestionGroups(dataRepository.getQuestionGroups());
        setMatrices(dataRepository.getMatrices());
        setExams(dataRepository.getExams());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceSchoolId, authSession?.user?.id, schoolBranding.schoolName, schoolBranding.academicYear]);

  const effectiveConfig = React.useMemo<StorageConfig>(
    () => ({
      ...config,
      schoolName: schoolBranding.schoolName || config.schoolName,
      academicYear: schoolBranding.academicYear || config.academicYear,
    }),
    [config, schoolBranding.schoolName, schoolBranding.academicYear]
  );

  // Cấu hình đường liên kết nút lệnh Menu "Tạo câu hỏi thông minh" (do Quản trị viên nhập)
  const [smartQuestionLinkConfig, setSmartQuestionLinkConfig] =
    useState<SmartQuestionLinkConfig>(() => getCachedSmartQuestionLinkConfig());

  useEffect(() => {
    let cancelled = false;
    const activeSid = activeWorkspaceSchoolId;
    void fetchSmartQuestionLinkConfig(activeSid).then((cfg) => {
      if (!cancelled) setSmartQuestionLinkConfig(cfg);
    });
    const handleLinkUpdated = (evt: Event) => {
      const customEvt = evt as CustomEvent<SmartQuestionLinkConfig>;
      if (customEvt.detail) {
        setSmartQuestionLinkConfig(customEvt.detail);
      }
    };
    window.addEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, handleLinkUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(SMART_QUESTION_LINK_UPDATED_EVENT, handleLinkUpdated);
    };
  }, [activeWorkspaceSchoolId]);

  const directSidebarSmartQuestionUrl = React.useMemo(
    () =>
      smartQuestionLinkConfig.openMode === 'DIRECT_NEW_TAB'
        ? normalizeClientSmartUrl(smartQuestionLinkConfig.url)
        : '',
    [smartQuestionLinkConfig.openMode, smartQuestionLinkConfig.url]
  );

  // Hệ thống thông báo Toast
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const notify = (
    type: ToastNotification['type'],
    title: string,
    message: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [{ id, type, title, message }, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Hồ sơ phân quyền chi tiết của giáo viên đang đăng nhập (Mục I -> X)
  const [activeTeacherPermissionProfile, setActiveTeacherPermissionProfile] =
    useState<TeacherPermissionProfileSummary | null>(null);
  const [enforceCrossModuleScopeLock, setEnforceCrossModuleScopeLock] =
    useState<boolean>(true);
  const [permRefreshTick, setPermRefreshTick] = useState<number>(0);

  useEffect(() => {
    const uid = authSession?.user?.id || '';
    if (
      !uid ||
      [
        'user-admin-sys',
        'user-sys-admin',
        'user-school-admin-a',
        'user-school-admin-sia',
        'user-school-admin-ddung',
        'user-super-admin-platform',
      ].includes(uid)
    ) {
      setActiveTeacherPermissionProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/security/teacher-permissions/${encodeURIComponent(uid)}`
        );
        if (!res.ok) {
          if (!cancelled) setActiveTeacherPermissionProfile(null);
          return;
        }
        const json = await res.json();
        if (!cancelled && json.ok && json.profile) {
          setActiveTeacherPermissionProfile(json.profile);
        }
      } catch {
        if (!cancelled) setActiveTeacherPermissionProfile(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authSession?.user?.id, permRefreshTick]);

  const isTeacherScopedActor = Boolean(
    enforceCrossModuleScopeLock &&
      !authSession?.user?.roles?.some((r) =>
        ['SYSTEM_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(r)
      ) &&
      ((activeTeacherPermissionProfile &&
        activeTeacherPermissionProfile.normalizedRecords.length > 0) ||
        (authSession?.user?.assignedSubjects && authSession.user.assignedSubjects.length > 0))
  );

  const doesComboMatchGrantedScope = (
    levelId: EducationLevelId | string,
    subjectName: string,
    gradeNum: number
  ): boolean => {
    if (!isTeacherScopedActor) return true;
    const normLevel =
      levelId === EducationLevelId.PRIMARY || levelId === 'PRIMARY'
        ? 'PRIMARY'
        : 'LOWER_SECONDARY';
    if (
      activeTeacherPermissionProfile &&
      activeTeacherPermissionProfile.normalizedRecords.length > 0
    ) {
      return activeTeacherPermissionProfile.normalizedRecords.some(
        (r) =>
          r.EducationLevelId === normLevel &&
          areSubjectNamesEquivalent(r.SubjectName, subjectName) &&
          Number(r.GradeId) === Number(gradeNum)
      );
    }
    const assignedSubjs = authSession?.user?.assignedSubjects || [];
    const assignedGrds = (authSession?.user?.assignedGrades || []).map(Number);
    if (assignedSubjs.length > 0) {
      const subjOk = assignedSubjs.some((s) => areSubjectNamesEquivalent(s, subjectName));
      const gradeOk = assignedGrds.length === 0 || assignedGrds.includes(Number(gradeNum));
      return subjOk && gradeOk;
    }
    return true;
  };

  const schoolAllowedGrades = React.useMemo<number[]>(() => {
    const activeSid = activeWorkspaceSchoolId;
    const sName = (schoolBranding.schoolName || '').toLowerCase();
    if (
      activeSid === 'SCHOOL_B' ||
      (sName.includes('tiểu học') && !sName.includes('th&thcs') && !sName.includes('th &thcs') && !sName.includes('thcs'))
    ) {
      return [1, 2, 3, 4, 5];
    }
    if (
      activeSid === 'SCHOOL_C' ||
      (sName.includes('thcs') && !sName.includes('th&thcs') && !sName.includes('th &thcs') && !sName.includes('tiểu học'))
    ) {
      return [6, 7, 8, 9];
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }, [activeWorkspaceSchoolId, schoolBranding.schoolName]);

  const allowedGlobalLevels = React.useMemo<EducationLevelId[]>(() => {
    const schoolLevels: EducationLevelId[] = [];
    if (schoolAllowedGrades.some((g) => g >= 1 && g <= 5)) {
      schoolLevels.push(EducationLevelId.PRIMARY);
    }
    if (schoolAllowedGrades.some((g) => g >= 6 && g <= 9)) {
      schoolLevels.push(EducationLevelId.LOWER_SECONDARY);
    }
    if (isTeacherScopedActor) {
      const teacherLevels: EducationLevelId[] = [];
      if (
        activeTeacherPermissionProfile &&
        activeTeacherPermissionProfile.educationLevels.length > 0
      ) {
        if (
          activeTeacherPermissionProfile.educationLevels.includes('PRIMARY') &&
          schoolLevels.includes(EducationLevelId.PRIMARY)
        ) {
          teacherLevels.push(EducationLevelId.PRIMARY);
        }
        if (
          activeTeacherPermissionProfile.educationLevels.includes('LOWER_SECONDARY') &&
          schoolLevels.includes(EducationLevelId.LOWER_SECONDARY)
        ) {
          teacherLevels.push(EducationLevelId.LOWER_SECONDARY);
        }
      } else if (authSession?.user?.assignedGrades && authSession.user.assignedGrades.length > 0) {
        const uGrades = authSession.user.assignedGrades.map(Number);
        if (
          uGrades.some((g) => g >= 1 && g <= 5) &&
          schoolLevels.includes(EducationLevelId.PRIMARY)
        ) {
          teacherLevels.push(EducationLevelId.PRIMARY);
        }
        if (
          uGrades.some((g) => g >= 6 && g <= 9) &&
          schoolLevels.includes(EducationLevelId.LOWER_SECONDARY)
        ) {
          teacherLevels.push(EducationLevelId.LOWER_SECONDARY);
        }
      }
      if (teacherLevels.length > 0) return teacherLevels;
    }
    return schoolLevels.length > 0
      ? schoolLevels
      : [EducationLevelId.PRIMARY, EducationLevelId.LOWER_SECONDARY];
  }, [
    schoolAllowedGrades,
    isTeacherScopedActor,
    activeTeacherPermissionProfile,
    authSession?.user?.assignedGrades,
  ]);

  useEffect(() => {
    if (allowedGlobalLevels.length === 1) {
      if (levelFilter !== allowedGlobalLevels[0]) {
        setLevelFilter(allowedGlobalLevels[0]);
      }
    } else if (levelFilter !== 'ALL' && !allowedGlobalLevels.includes(levelFilter)) {
      setLevelFilter('ALL');
    }
  }, [allowedGlobalLevels, levelFilter]);

  const scopedTopics = React.useMemo(() => {
    const bySchool = topics.filter(
      (t) => !t.isSampleData && schoolAllowedGrades.includes(Number(t.grade))
    );
    if (!isTeacherScopedActor) return bySchool;
    const hasExplicitScope =
      Boolean(
        activeTeacherPermissionProfile &&
          activeTeacherPermissionProfile.normalizedRecords.length > 0
      ) || Boolean(authSession?.user?.assignedSubjects?.length);
    if (!hasExplicitScope) return bySchool;
    return bySchool.filter((t) =>
      doesComboMatchGrantedScope(t.levelId, t.subject, Number(t.grade))
    );
  }, [
    topics,
    schoolAllowedGrades,
    isTeacherScopedActor,
    activeTeacherPermissionProfile,
    authSession?.user?.assignedSubjects,
    authSession?.user?.assignedGrades,
  ]);

  const scopedQuestions = React.useMemo(() => {
    const bySchool = questions.filter((q) => schoolAllowedGrades.includes(Number(q.grade)));
    if (!isTeacherScopedActor) return bySchool;
    return bySchool.filter((q) =>
      doesComboMatchGrantedScope(q.levelId, q.subject, Number(q.grade))
    );
  }, [
    questions,
    schoolAllowedGrades,
    isTeacherScopedActor,
    activeTeacherPermissionProfile,
    authSession?.user?.assignedSubjects,
    authSession?.user?.assignedGrades,
  ]);

  const scopedMatrices = React.useMemo(() => {
    const bySchool = matrices.filter((m) => schoolAllowedGrades.includes(Number(m.grade)));
    if (!isTeacherScopedActor) return bySchool;
    return bySchool.filter((m) =>
      doesComboMatchGrantedScope(m.levelId, m.subject, Number(m.grade))
    );
  }, [
    matrices,
    schoolAllowedGrades,
    isTeacherScopedActor,
    activeTeacherPermissionProfile,
    authSession?.user?.assignedSubjects,
    authSession?.user?.assignedGrades,
  ]);

  const scopedExams = React.useMemo(() => {
    const bySchool = exams.filter((ex) => schoolAllowedGrades.includes(Number(ex.grade)));
    if (!isTeacherScopedActor || authSession?.user?.roles?.includes('PRINCIPAL')) {
      return bySchool;
    }
    return bySchool.filter((ex) =>
      doesComboMatchGrantedScope(ex.levelId, ex.subject, Number(ex.grade))
    );
  }, [
    exams,
    schoolAllowedGrades,
    isTeacherScopedActor,
    activeTeacherPermissionProfile,
    authSession?.user?.roles,
    authSession?.user?.assignedSubjects,
    authSession?.user?.assignedGrades,
  ]);

  const verifyBackendModuleActionAsync = async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/security/module-guard/verify-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authSession?.user?.id || 'user-gv-a',
          openSessionTimestamp: new Date().toISOString(),
          ...payload,
        }),
      });
      const json = await res.json();
      if (!json.allowed) {
        notify(
          'error',
          `Từ chối tại Backend (HTTP ${res.status} · ${json.errorCode})`,
          String(json.message || 'Thao tác vượt quá quyền được cấp.')
        );
      }
      return Boolean(json.allowed);
    } catch {
      return true;
    }
  };

  const handleAddTopic = (newTopic: Omit<CurriculumTopic, 'id'>) => {
    dataRepository.addTopic(newTopic);
    setTopics(dataRepository.getTopics());
  };

  const handleAddQuestion = (newQuestion: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>) => {
    if (isTeacherScopedActor && activeTeacherPermissionProfile) {
      if (!activeTeacherPermissionProfile.permissionCodes.includes('CREATE_QUESTION')) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'QUESTION_BANK',
          operationCode: 'CREATE_QUESTION',
          subjectName: newQuestion.subject,
          grade: newQuestion.grade,
        });
        notify(
          'error',
          'Bị chặn: Không có quyền Tạo câu hỏi (CREATE_QUESTION)',
          `Tài khoản ${activeTeacherPermissionProfile.fullName} không được cấp quyền tạo câu hỏi mới.`
        );
        return questions[0];
      }
      if (!doesComboMatchGrantedScope(newQuestion.levelId, newQuestion.subject, Number(newQuestion.grade))) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'QUESTION_BANK',
          operationCode: 'CREATE_QUESTION',
          subjectName: newQuestion.subject,
          grade: newQuestion.grade,
        });
        notify(
          'error',
          'Bị chặn: Ngoài phạm vi Môn / Khối được cấp (Mục II)',
          `Giáo viên ${activeTeacherPermissionProfile.fullName} không được tạo câu hỏi môn ${newQuestion.subject} Lớp ${newQuestion.grade}.`
        );
        return questions[0];
      }
    }
    void verifyBackendModuleActionAsync({
      moduleCode: 'QUESTION_BANK',
      operationCode: 'CREATE_QUESTION',
      subjectName: newQuestion.subject,
      grade: newQuestion.grade,
    });
    const created = dataRepository.addQuestion(newQuestion);
    setQuestions(dataRepository.getQuestions());
    return created;
  };

  const handleUpdateQuestion = (
    id: string,
    updates: Partial<Omit<QuestionItem, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion = false
  ) => {
    const existingQ = questions.find((q) => q.id === id);
    if (isTeacherScopedActor && activeTeacherPermissionProfile && existingQ) {
      if (!activeTeacherPermissionProfile.permissionCodes.includes('EDIT_QUESTION')) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'QUESTION_BANK',
          operationCode: 'EDIT_QUESTION',
          subjectName: existingQ.subject,
          grade: existingQ.grade,
        });
        notify(
          'error',
          'Bị chặn: Không có quyền Chỉnh sửa câu hỏi (EDIT_QUESTION)',
          `Tài khoản ${activeTeacherPermissionProfile.fullName} không có quyền sửa câu hỏi.`
        );
        return null;
      }
      const nextSubj = updates.subject || existingQ.subject;
      const nextGrade = updates.grade || existingQ.grade;
      const nextLevel = updates.levelId || existingQ.levelId;
      if (!doesComboMatchGrantedScope(nextLevel, nextSubj, Number(nextGrade))) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'QUESTION_BANK',
          operationCode: 'EDIT_QUESTION',
          subjectName: nextSubj,
          grade: nextGrade,
        });
        notify(
          'error',
          'Bị chặn: Câu hỏi nằm ngoài phạm vi Môn / Khối được cấp',
          `Không được chỉnh sửa câu hỏi thuộc [${nextSubj} Lớp ${nextGrade}].`
        );
        return null;
      }
    }
    const outcome = dataRepository.updateQuestion(id, updates, forceNewVersion);
    setQuestions(dataRepository.getQuestions());
    return outcome;
  };

  const handleDuplicateQuestion = (id: string) => {
    const copy = dataRepository.duplicateQuestion(id);
    setQuestions(dataRepository.getQuestions());
    return copy;
  };

  const handleBulkAddQuestions = (items: Omit<QuestionItem, 'id' | 'code' | 'createdAt'>[]) => {
    const validItems = isTeacherScopedActor
      ? items.filter((it) =>
          doesComboMatchGrantedScope(it.levelId, it.subject, Number(it.grade))
        )
      : items;
    if (isTeacherScopedActor && validItems.length < items.length) {
      notify(
        'warning',
        'Đã lọc câu hỏi theo phạm vi phân quyền (Mục II)',
        `Chỉ lưu ${validItems.length}/${items.length} câu hỏi nằm trong phạm vi môn và khối được cấp.`
      );
    }
    const created = dataRepository.bulkAddQuestions(validItems);
    setQuestions(dataRepository.getQuestions());
    return created;
  };

  const handleDeleteQuestion = (id: string) => {
    const res = dataRepository.deleteQuestion(id);
    setQuestions(dataRepository.getQuestions());
    return res;
  };

  const handleAddQuestionGroup = (group: Omit<QuestionGroup, 'id' | 'code' | 'createdAt'>) => {
    const created = dataRepository.addQuestionGroup(group);
    setQuestionGroups(dataRepository.getQuestionGroups());
    setQuestions(dataRepository.getQuestions());
    return created;
  };

  const handleAssignQuestionsToGroup = (groupId: string, questionIds: string[]) => {
    const updated = dataRepository.assignQuestionsToGroup(groupId, questionIds);
    setQuestionGroups(dataRepository.getQuestionGroups());
    setQuestions(dataRepository.getQuestions());
    return updated;
  };

  const handleDeleteQuestionGroup = (groupId: string) => {
    dataRepository.deleteQuestionGroup(groupId);
    setQuestionGroups(dataRepository.getQuestionGroups());
    setQuestions(dataRepository.getQuestions());
  };

  const handleAddMatrix = (newMatrix: Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>) => {
    if (isTeacherScopedActor && activeTeacherPermissionProfile) {
      if (!activeTeacherPermissionProfile.permissionCodes.includes('CREATE_EXAM_MATRIX')) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'MATRIX_SPECIFICATION',
          operationCode: 'SAVE_MATRIX',
          subjectName: newMatrix.subject,
          grade: newMatrix.grade,
        });
        notify(
          'error',
          'Bị chặn: Không có quyền Tạo ma trận (CREATE_EXAM_MATRIX)',
          `Tài khoản ${activeTeacherPermissionProfile.fullName} không được cấp quyền tạo ma trận.`
        );
        return matrices[0];
      }
      if (!doesComboMatchGrantedScope(newMatrix.levelId, newMatrix.subject, Number(newMatrix.grade))) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'MATRIX_SPECIFICATION',
          operationCode: 'SAVE_MATRIX',
          subjectName: newMatrix.subject,
          grade: newMatrix.grade,
        });
        notify(
          'error',
          'Bị chặn lưu Ma trận ngoài phạm vi (Mục III)',
          `Giáo viên ${activeTeacherPermissionProfile.fullName} không được phép lưu ma trận môn ${newMatrix.subject} Lớp ${newMatrix.grade}.`
        );
        return matrices[0];
      }
    }
    void verifyBackendModuleActionAsync({
      moduleCode: 'MATRIX_SPECIFICATION',
      operationCode: 'SAVE_MATRIX',
      subjectName: newMatrix.subject,
      grade: newMatrix.grade,
    });
    const created = dataRepository.addMatrix(newMatrix);
    setMatrices(dataRepository.getMatrices());
    return created;
  };

  const handleUpdateMatrix = (
    id: string,
    updates: Partial<Omit<ExamMatrix, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion = false,
    editorNote?: string
  ) => {
    const existingM = matrices.find((m) => m.id === id);
    if (isTeacherScopedActor && activeTeacherPermissionProfile && existingM) {
      const nextSubj = updates.subject || existingM.subject;
      const nextGrade = updates.grade || existingM.grade;
      const nextLevel = updates.levelId || existingM.levelId;
      if (!doesComboMatchGrantedScope(nextLevel, nextSubj, Number(nextGrade))) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'MATRIX_SPECIFICATION',
          operationCode: 'SAVE_MATRIX',
          subjectName: nextSubj,
          grade: nextGrade,
        });
        notify(
          'error',
          'Bị chặn cập nhật Ma trận ngoài phạm vi (Mục III)',
          `Không được phép lưu ma trận ngoài phạm vi môn/khối được cấp (${nextSubj} Lớp ${nextGrade}).`
        );
        return null;
      }
    }
    const outcome = dataRepository.updateMatrix(id, updates, forceNewVersion, editorNote);
    setMatrices(dataRepository.getMatrices());
    return outcome;
  };

  const handleDeleteMatrix = (id: string) => {
    const res = dataRepository.deleteMatrix(id);
    setMatrices(dataRepository.getMatrices());
    return res;
  };

  const handleAddExam = (newExam: Omit<ExamPaper, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    if (isTeacherScopedActor && activeTeacherPermissionProfile) {
      if (!activeTeacherPermissionProfile.permissionCodes.includes('CREATE_EXAM_PAPER')) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'EXAM_GENERATOR',
          operationCode: 'SAVE_EXAM',
          subjectName: newExam.subject,
          grade: newExam.grade,
        });
        notify(
          'error',
          'Bị chặn: Không có quyền Tạo/Lưu đề (CREATE_EXAM_PAPER)',
          `Tài khoản ${activeTeacherPermissionProfile.fullName} không có quyền lưu đề kiểm tra.`
        );
        return exams[0];
      }
      if (!doesComboMatchGrantedScope(newExam.levelId, newExam.subject, Number(newExam.grade))) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'EXAM_GENERATOR',
          operationCode: 'SAVE_EXAM',
          subjectName: newExam.subject,
          grade: newExam.grade,
        });
        notify(
          'error',
          'Bị chặn lưu đề ngoài phạm vi (Mục IV)',
          `Không thể lưu đề môn ${newExam.subject} Lớp ${newExam.grade} ngoài phạm vi được cấp.`
        );
        return exams[0];
      }
    }
    void verifyBackendModuleActionAsync({
      moduleCode: 'EXAM_GENERATOR',
      operationCode: 'SAVE_EXAM',
      subjectName: newExam.subject,
      grade: newExam.grade,
    });
    const created = dataRepository.addExam(newExam);
    setExams(dataRepository.getExams());
    setQuestions(dataRepository.getQuestions());
    return created;
  };

  const handleUpdateExam = (
    examId: string,
    updates: Partial<Omit<ExamPaper, 'id' | 'code' | 'createdAt'>>,
    forceNewVersion = false,
    editorNote?: string
  ) => {
    const existingEx = exams.find((e) => e.id === examId);
    if (isTeacherScopedActor && activeTeacherPermissionProfile && existingEx) {
      if (!activeTeacherPermissionProfile.permissionCodes.includes('EDIT_EXAM_PAPER')) {
        void verifyBackendModuleActionAsync({
          moduleCode: 'EXAM_GENERATOR',
          operationCode: 'EDIT_EXAM',
          subjectName: existingEx.subject,
          grade: existingEx.grade,
        });
        notify(
          'error',
          'Bị chặn: Không có quyền Chỉnh sửa đề (EDIT_EXAM_PAPER)',
          `Tài khoản ${activeTeacherPermissionProfile.fullName} không có quyền sửa đề.`
        );
        return null;
      }
    }
    const updated = dataRepository.updateExam(examId, updates, forceNewVersion, editorNote);
    setExams(dataRepository.getExams());
    return updated;
  };

  const handleUpdateApproval = (
    examId: string,
    status: ApprovalStatus,
    reviewerName: string,
    reviewComment: string
  ) => {
    if (
      status === ApprovalStatus.APPROVED &&
      isTeacherScopedActor &&
      activeTeacherPermissionProfile &&
      !activeTeacherPermissionProfile.permissionCodes.includes('APPROVE_EXAM')
    ) {
      void verifyBackendModuleActionAsync({
        moduleCode: 'APPROVAL',
        operationCode: 'OFFICIAL_APPROVE',
        dossierId: examId,
      });
      notify(
        'error',
        'Từ chối Phê duyệt đề (Mục VI & VII)',
        `Tài khoản ${activeTeacherPermissionProfile.fullName} không có quyền phê duyệt chính thức (APPROVE_EXAM).`
      );
      return;
    }
    dataRepository.updateExamApproval(examId, status, reviewerName, reviewComment);
    setExams(dataRepository.getExams());
    setQuestions(dataRepository.getQuestions());
  };

  const handleSaveConfig = (nextConfig: StorageConfig) => {
    dataRepository.saveConfig(nextConfig);
    setConfig(dataRepository.getConfig());
  };

  const handleCleanSampleAppraisalData = () => {
    const res = dataRepository.purgeSampleMatricesAndExams();
    setMatrices(dataRepository.getMatrices());
    setExams(dataRepository.getExams());
    return res;
  };

  const handleCleanSampleReportData = () => {
    const removedQuestions = dataRepository.purgeSampleQuestions();
    const res = dataRepository.purgeSampleMatricesAndExams();
    setQuestions(dataRepository.getQuestions());
    setMatrices(dataRepository.getMatrices());
    setExams(dataRepository.getExams());
    return {
      removedQuestions,
      removedMatrices: res.removedMatrices,
      removedExams: res.removedExams,
    };
  };

  const handleCleanSampleTeacherWorkData = () => {
    const removedTopics = dataRepository.purgeSampleTopics();
    const removedQuestions = dataRepository.purgeSampleQuestions();
    const res = dataRepository.purgeSampleMatricesAndExams();
    setTopics(dataRepository.getTopics());
    setQuestions(dataRepository.getQuestions());
    setQuestionGroups(dataRepository.getQuestionGroups());
    setMatrices(dataRepository.getMatrices());
    setExams(dataRepository.getExams());
    return {
      removedTopics,
      removedQuestions,
      removedMatrices: res.removedMatrices,
      removedExams: res.removedExams,
    };
  };

  const handleResetSeedData = () => {
    dataRepository.resetToDefaultSeedData();
    setConfig(dataRepository.getConfig());
    setTopics(dataRepository.getTopics());
    setQuestions(dataRepository.getQuestions());
    setQuestionGroups(dataRepository.getQuestionGroups());
    setMatrices(dataRepository.getMatrices());
    setExams(dataRepository.getExams());
  };

  // Khôi phục thông tin trường học và phiên đăng nhập khi tải lại trang
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [loadedBranding, restoredSession] = await Promise.all([
        fetchSchoolBranding(),
        restoreAuthSession(),
      ]);
      if (!mounted) return;
      const effectiveBranding: SchoolBrandingConfig =
        restoredSession?.user?.schoolId === 'SCHOOL_B' ||
        restoredSession?.user?.email?.toLowerCase() === 'admin_sia@hue.edu.vn'
          ? {
              ...loadedBranding,
              schoolId: 'SCHOOL_B',
              schoolName: 'Trường Tiểu học Sịa',
              governingBody: 'UBND XÃ QUẢNG ĐIỀN',
              academicYear: '2026 - 2027',
            }
          : restoredSession?.user?.schoolId === 'SCHOOL_C' ||
            restoredSession?.user?.email?.toLowerCase() === 'admin_ddung@hue.edu.vn'
          ? {
              ...loadedBranding,
              schoolId: 'SCHOOL_C',
              schoolName: 'Trường THCS Đặng Dung',
              governingBody: 'UBND XÃ QUẢNG ĐIỀN',
              academicYear: '2026 - 2027',
            }
          : loadedBranding;
      setSchoolBranding(effectiveBranding);
      if (
        effectiveBranding.schoolName &&
        (effectiveBranding.schoolName !== config.schoolName ||
          effectiveBranding.academicYear !== config.academicYear)
      ) {
        const nextCfg: StorageConfig = {
          ...dataRepository.getConfig(),
          schoolName: effectiveBranding.schoolName,
          academicYear: effectiveBranding.academicYear,
        };
        dataRepository.saveConfig(nextCfg);
        setConfig(nextCfg);
      }

      const verifiedFlags = await syncRuntimeEnvironmentFromBackend({
        userId: restoredSession?.user?.id,
        role: restoredSession?.user?.activeRole,
      });
      if (mounted) {
        setRuntimeFlags(verifiedFlags);
      }

      if (restoredSession) {
        setAuthSession(restoredSession);
        setActiveMenu('dashboard');
        setShowLoginScreen(false);
      } else {
        // Mục II (Giai đoạn 22): Khi mở EDU TEST AI, nếu chưa đăng nhập -> Hiển thị màn hình đăng nhập chính thức
        setAuthSession(null);
        setShowLoginScreen(true);
      }
      setAuthInitialized(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Điều hướng tự động theo vai trò sau khi đăng nhập (Mục II & IV)
  const handleLoginSuccess = (
    session: AuthenticatedUserSession,
    selectedSchool?: {
      schoolId: string;
      schoolName: string;
      academicYear: string;
    }
  ) => {
    setAuthSession(session);
    setWorkingRoleOverride(null);
    setInterceptedProtectedRoute(null);
    const resolvedSchoolId =
      selectedSchool?.schoolId ||
      session.user.schoolId ||
      (session.user.email.toLowerCase() === 'admin_sia@hue.edu.vn'
        ? 'SCHOOL_B'
        : session.user.email.toLowerCase() === 'admin_ddung@hue.edu.vn'
        ? 'SCHOOL_C'
        : 'SCHOOL_A');
    const resolvedSchoolName =
      selectedSchool?.schoolName ||
      (resolvedSchoolId === 'SCHOOL_B'
        ? 'Trường Tiểu học Sịa'
        : resolvedSchoolId === 'SCHOOL_C'
        ? 'Trường THCS Đặng Dung'
        : 'Trường TH&THCS Nguyễn Đình Anh');
    const resolvedAcademicYear = selectedSchool?.academicYear || '2026 - 2027';

    setSchoolBranding((prev) => ({
      ...prev,
      schoolId: resolvedSchoolId,
      schoolName: resolvedSchoolName,
      academicYear: resolvedAcademicYear,
    }));
    setConfig((prev) => ({
      ...prev,
      schoolName: resolvedSchoolName,
      academicYear: resolvedAcademicYear,
    }));
    setActiveMenu('dashboard');
    setShowLoginScreen(false);
    const primaryRole = normalizeToPrimaryRoleKey(
      session.user.activeRole,
      session.user.email,
      session.user.username,
      session.user.positionTitle
    );
    notify(
      'success',
      `Đăng nhập thành công (${getOfficialRoleDisplayLabel(primaryRole)})`,
      `Xin chào ${session.user.fullName}. Hệ thống đã nạp phân quyền và giao diện làm việc chính thức.`
    );
  };

  const handleSessionUpdated = (session: AuthenticatedUserSession) => {
    setAuthSession(session);
    setWorkingRoleOverride(null);
    setActiveMenu('dashboard');
    notify(
      'info',
      `Đã chuyển sang vai trò: ${session.landingNavigation.roleDisplayName}`,
      `Menu bên trái, thao tác cho phép và phạm vi dữ liệu (${session.user.departmentName || 'Toàn trường'}) đã được cập nhật đồng bộ.`
    );
  };

  const handleLogout = async () => {
    await logoutCurrentSession();
    setAuthSession(null);
    setWorkingRoleOverride(null);
    setShowLoginScreen(true);
    notify(
      'info',
      'Đã đăng xuất an toàn',
      'Phiên đăng nhập đã được thu hồi trên máy chủ và xóa khỏi trình duyệt.'
    );
  };

  const handleBrandingUpdated = (nextBranding: SchoolBrandingConfig) => {
    setSchoolBranding(nextBranding);
    const updatedCfg: StorageConfig = {
      ...config,
      schoolName: nextBranding.schoolName,
      academicYear: nextBranding.academicYear,
    };
    dataRepository.saveConfig(updatedCfg);
    setConfig(updatedCfg);
    notify(
      'success',
      'Đã cập nhật thông tin đơn vị',
      `${nextBranding.schoolName} · Năm học ${nextBranding.academicYear}`
    );
  };

  // Mục V, VI, VIII (Giai đoạn 22): Bảng cấu hình menu động theo quyền & chức vụ thực tế
  const activeProductionRoleKey: PrimaryProductionRoleKey =
    workingRoleOverride ||
    normalizeToPrimaryRoleKey(
      authSession?.user.activeRole,
      authSession?.user.email,
      authSession?.user.username,
      authSession?.user.positionTitle
    );

  const distinctNormalizedRoles = React.useMemo(() => {
    const rawRoles = authSession?.user?.roles || [];
    const seen = new Set<PrimaryProductionRoleKey>();
    const result: { rawRole: WorkflowActorRole; primaryKey: PrimaryProductionRoleKey }[] = [];
    for (const r of rawRoles) {
      const pk = normalizeToPrimaryRoleKey(
        r,
        authSession?.user?.email,
        authSession?.user?.username,
        authSession?.user?.positionTitle
      );
      if (!seen.has(pk)) {
        seen.add(pk);
        result.push({ rawRole: r, primaryKey: pk });
      }
    }
    return result;
  }, [
    authSession?.user?.roles,
    authSession?.user?.email,
    authSession?.user?.username,
    authSession?.user?.positionTitle,
  ]);

  const authorizedProductionMenus = React.useMemo(
    () =>
      resolveAuthorizedProductionMenus({
        session: authSession,
        teacherProfile: activeTeacherPermissionProfile,
        workingRoleOverride,
        combineMultiRoleMenus,
        runtimeFlags,
      }),
    [
      authSession,
      activeTeacherPermissionProfile,
      workingRoleOverride,
      combineMultiRoleMenus,
      runtimeFlags,
    ]
  );

  const PRODUCTION_ICON_COMPONENTS: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    LayoutDashboard,
    Building2,
    Users,
    FileSpreadsheet,
    Network,
    Briefcase,
    KeyRound,
    CalendarRange,
    TrendingUp,
    FolderKanban,
    CheckSquare,
    Award,
    BarChart3,
    Sparkles,
    ClipboardCheck,
    Database,
    Grid,
    FileText,
    CheckCircle: CheckCircle2,
    Bell,
    UserCheck,
    UserCog,
    CreditCard,
    ShieldCheck,
    History,
    Settings,
    ExternalLink,
  };

  const displayedSidebarMenus: MenuItemConfig[] = React.useMemo(() => {
    const isAdminRole = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'SYSTEM_ADMIN'].includes(
      activeProductionRoleKey
    );
    if (!roleScopedSidebarMode) {
      const rawMenus = getMenusForActiveRole(
        authSession?.user.activeRole,
        false,
        activeTeacherPermissionProfile
      );
      return rawMenus.filter(
        (m) => m.id !== 'smart-question-link' || smartQuestionLinkConfig.isEnabled || isAdminRole
      );
    }
    const filteredAuthorized = authorizedProductionMenus.filter(
      (m) => m.id !== 'smart-question-link' || smartQuestionLinkConfig.isEnabled || isAdminRole
    );
    return filteredAuthorized.map((m, idx) => ({
      id: m.id,
      orderNumber: String(idx + 1),
      label:
        m.id === 'smart-question-link' && smartQuestionLinkConfig.buttonLabel
          ? smartQuestionLinkConfig.buttonLabel
          : m.label,
      icon: PRODUCTION_ICON_COMPONENTS[m.icon] || LayoutDashboard,
      phaseStatus: 'ACTIVE_P1',
    }));
  }, [
    roleScopedSidebarMode,
    authorizedProductionMenus,
    authSession?.user.activeRole,
    activeTeacherPermissionProfile,
    activeProductionRoleKey,
    smartQuestionLinkConfig.isEnabled,
    smartQuestionLinkConfig.buttonLabel,
  ]);

  // Thực thi chuyển vai trò thực sự sau khi đã qua kiểm tra biểu mẫu chưa lưu
  const executeRoleSwitch = async (nextRole: WorkflowActorRole) => {
    if (!authSession) return;
    const outcome = await selectWorkingRoleOrPolicy({
      activeRole: nextRole,
      multiRoleMode: authSession.user.multiRoleMode,
    });
    if (outcome.ok && outcome.session) {
      handleSessionUpdated(outcome.session);
    } else {
      notify(
        'error',
        'Không thể chuyển vai trò',
        outcome.message || 'Vai trò yêu cầu không nằm trong danh sách quyền được cấp.'
      );
    }
  };

  // Mục VI: Kiểm tra biểu mẫu chưa lưu trước khi rời trang hoặc chuyển vai trò
  const handleProtectedMenuNavigate = (targetMenuId: MenuSectionId) => {
    const targetMeta =
      displayedSidebarMenus.find((m) => m.id === targetMenuId) ||
      ALL_STAGE_MENU_ITEMS.find((m) => m.id === targetMenuId) ||
      ALL_STAGE_MENU_ITEMS[0];

    if (!authSession) {
      setInterceptedProtectedRoute({
        menuId: targetMenuId,
        label: targetMeta.label,
      });
      setShowLoginScreen(true);
      notify(
        'warning',
        'Yêu cầu đăng nhập',
        `Vui lòng đăng nhập để truy cập chức năng bảo vệ: ${targetMeta.label}.`
      );
      return;
    }

    if (hasUnsavedChanges && targetMenuId !== activeMenu) {
      setPendingGuardAction({ type: 'NAVIGATE', targetMenuId });
      return;
    }

    setActiveMenu(targetMenuId);
    setMobileSidebarOpen(false);
  };

  const handleRequestRoleSwitchWithGuard = (nextRole: WorkflowActorRole) => {
    if (!authSession || nextRole === authSession.user.activeRole) return;
    if (hasUnsavedChanges) {
      setPendingGuardAction({ type: 'SWITCH_ROLE', nextRole });
      return;
    }
    void executeRoleSwitch(nextRole);
  };

  const handleSaveDraftSafely = () => {
    setHasUnsavedChanges(false);
    notify(
      'success',
      'Đã lưu tạm biểu mẫu đang chỉnh sửa',
      `Nội dung nháp ("${unsavedDraftText.slice(0, 45)}...") đã được bảo toàn an toàn.`
    );
  };

  const currentMenuMeta =
    displayedSidebarMenus.find((m) => m.id === activeMenu) ||
    ALL_STAGE_MENU_ITEMS.find((m) => m.id === activeMenu) ||
    displayedSidebarMenus[0];

  const sampleCount = questions.filter((q) => q.isSampleData).length;
  const realCount = questions.filter((q) => !q.isSampleData).length;

  const routeAccessVerification = verifyProductionRouteAccess({
    tabId: activeMenu,
    session: authSession,
    teacherProfile: activeTeacherPermissionProfile,
    workingRoleOverride,
    combineMultiRoleMenus,
    runtimeFlags,
  });

  // Mục II: Trong lúc kiểm tra phiên xác thực, hiển thị màn hình chờ ngắn gọn, không nháy màn hình
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg">
          <BookOpen className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div className="text-base font-bold tracking-tight">EDU TEST AI</div>
        <div className="text-xs text-slate-400 mt-1">
          Đang kiểm tra phiên xác thực và phân quyền đơn vị...
        </div>
      </div>
    );
  }

  // Mục II & IX: Nếu chưa đăng nhập hoặc đang ở Màn hình Đăng nhập -> Hiển thị Giao diện Đăng nhập Chính thức
  if (showLoginScreen || !authSession) {
    return (
      <>
        <EduTestLoginWorkspace
          branding={schoolBranding}
          currentSession={authSession}
          interceptedProtectedRoute={interceptedProtectedRoute}
          onLoginSuccess={handleLoginSuccess}
          onSessionUpdated={handleSessionUpdated}
          onLogout={handleLogout}
          onBrandingUpdated={handleBrandingUpdated}
          onTriggerProtectedRouteAttempt={(menuId, label) => {
            setInterceptedProtectedRoute({ menuId, label });
          }}
          onContinueToWorkspace={
            authSession ? () => setShowLoginScreen(false) : undefined
          }
        />

        {toasts.length > 0 && (
          <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-md w-full px-4 pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`pointer-events-auto p-4 rounded-xl border shadow-md flex items-start justify-between gap-3 ${
                  t.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : t.type === 'error'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : t.type === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-blue-50 border-blue-300 text-blue-950'
                }`}
              >
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t.title}</span>
                  </div>
                  <p className="opacity-90 leading-relaxed">{t.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setToasts((prev) => prev.filter((item) => item.id !== t.id))
                  }
                  className="text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <SchoolContextProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Lớp phủ mờ trên thiết bị di động khi mở Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mục VI: Hộp thoại cảnh báo trước khi rời biểu mẫu chưa lưu */}
      {pendingGuardAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-amber-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cảnh báo: Biểu mẫu đang chỉnh sửa chưa được lưu!
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Bạn đang có nội dung chỉnh sửa chưa lưu:{' '}
                  <span className="font-mono font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                    &ldquo;{unsavedDraftText || 'Dữ liệu nháp'}&rdquo;
                  </span>
                  . Hệ thống bảo vệ không làm mất dữ liệu khi{' '}
                  {pendingGuardAction.type === 'SWITCH_ROLE'
                    ? `chuyển sang vai trò [${pendingGuardAction.nextRole}]`
                    : `chuyển sang mục menu [${pendingGuardAction.targetMenuId}]`}
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPendingGuardAction(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Ở lại tiếp tục chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveDraftSafely();
                  const action = pendingGuardAction;
                  setPendingGuardAction(null);
                  if (action.type === 'NAVIGATE') {
                    setActiveMenu(action.targetMenuId);
                    setMobileSidebarOpen(false);
                  } else {
                    void executeRoleSwitch(action.nextRole);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu bản nháp & Chuyển tiếp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasUnsavedChanges(false);
                  setUnsavedDraftText('');
                  const action = pendingGuardAction;
                  setPendingGuardAction(null);
                  if (action.type === 'NAVIGATE') {
                    setActiveMenu(action.targetMenuId);
                    setMobileSidebarOpen(false);
                  } else {
                    void executeRoleSwitch(action.nextRole);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
              >
                Bỏ thay đổi & Rời ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar / Thanh Dashboard bên trái (Chuẩn màu Primary #123D75 & Active #F4A340 Giai đoạn 21) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#123D75] text-white flex flex-col justify-between transition-all duration-200 shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
        } ${
          desktopSidebarVisible
            ? desktopSidebarCompact
              ? 'lg:static lg:translate-x-0 lg:w-20'
              : 'lg:static lg:translate-x-0 lg:w-72'
            : 'lg:hidden'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Logo & Tên phần mềm + Nút Thu gọn / Ẩn thanh Dashboard */}
          <div
            className={`border-b border-blue-800 flex items-center ${
              desktopSidebarCompact
                ? 'lg:px-2 lg:py-4 lg:justify-center px-5 py-4 justify-between'
                : 'px-5 py-4 justify-between'
            }`}
          >
            <div className={desktopSidebarCompact ? 'lg:hidden' : ''}>
              <div className="text-base font-bold tracking-tight text-white">
                {schoolBranding.softwareTitle || 'EDU TEST AI'}
              </div>
              <div className="text-xs text-teal-300 font-medium mt-0.5">
                {schoolBranding.softwareSubtitle || 'Ngân hàng Đề kiểm tra Thông minh'}
              </div>
            </div>

            {desktopSidebarCompact && (
              <div className="hidden lg:flex flex-col items-center">
                <span className="text-xs font-extrabold tracking-tighter text-teal-300 bg-blue-950 px-2 py-1 rounded-md border border-blue-700">
                  EDU AI
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleDesktopSidebarCompact}
                title={
                  desktopSidebarCompact
                    ? 'Mở rộng thanh Dashboard'
                    : 'Thu gọn thanh Dashboard thành biểu tượng'
                }
                className="hidden lg:inline-flex p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/80 transition-colors cursor-pointer"
              >
                {desktopSidebarCompact ? (
                  <ChevronsRight className="w-4 h-4" />
                ) : (
                  <ChevronsLeft className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleDesktopSidebar}
                title="Ẩn thanh Dashboard (Ctrl + B)"
                className="hidden lg:inline-flex p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/80 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden text-blue-200 hover:text-white cursor-pointer p-1"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thông tin đơn vị & Chức vụ làm việc chính thức (Mục VI & VIII) */}
          <div
            className={`px-4 py-3 bg-blue-950/60 border-b border-blue-800/80 text-xs text-blue-200 space-y-2 ${
              desktopSidebarCompact ? 'lg:hidden' : ''
            }`}
          >
            <div>
              <div className="font-semibold text-white truncate">
                {activeProductionRoleKey === 'SUPER_ADMIN'
                  ? 'Nền tảng Đa trường EDU TEST AI'
                  : schoolBranding.schoolName || config.schoolName}
              </div>
              <div className="mt-1 text-teal-300 flex items-center justify-between gap-1">
                <span>
                  Năm học:{' '}
                  <span className="font-mono">
                    {schoolBranding.academicYear || config.academicYear}
                  </span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] truncate">
                  {getOfficialRoleDisplayLabel(activeProductionRoleKey)}
                </span>
              </div>
            </div>

            {/* Mục VI: Xử lý người có nhiều vai trò (Chọn vai trò làm việc hoặc Gộp quyền hợp lệ, không trùng menu) */}
            {distinctNormalizedRoles.length > 1 && (
              <div className="pt-1 border-t border-blue-800/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-blue-200">
                  <span>Chế độ đa vai trò:</span>
                  <button
                    type="button"
                    onClick={() => setCombineMultiRoleMenus((prev) => !prev)}
                    className="text-amber-300 hover:text-amber-200 font-semibold underline cursor-pointer"
                  >
                    {combineMultiRoleMenus ? 'Đang gộp quyền' : 'Theo vai trò chọn'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mục Menu Chính */}
          <nav
            className={`p-3 space-y-1 overflow-y-auto flex-1 ${
              desktopSidebarCompact ? 'lg:px-2' : ''
            }`}
            aria-label="Menu chính theo vai trò"
          >
            {displayedSidebarMenus.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              const itemClassName = `w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                desktopSidebarCompact
                  ? 'lg:justify-center lg:px-2 lg:py-2.5 justify-between gap-2 px-3 py-2.5'
                  : 'justify-between gap-2 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-[#F4A340] text-slate-950 font-semibold shadow-2xs'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`;
              const itemInner = (
                <>
                  <span
                    className={`flex items-center truncate ${
                      desktopSidebarCompact ? 'lg:flex-col lg:gap-0.5 gap-2.5' : 'gap-2.5'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-slate-950' : 'text-blue-300'
                      }`}
                    />
                    <span className={`truncate ${desktopSidebarCompact ? 'lg:hidden' : ''}`}>
                      {item.orderNumber}. {item.label}
                    </span>
                    {desktopSidebarCompact && (
                      <span className="hidden lg:inline text-[10px] font-mono leading-none">
                        {item.orderNumber}
                      </span>
                    )}
                  </span>
                  {item.roleGroupBadge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        desktopSidebarCompact ? 'lg:hidden' : ''
                      } ${
                        isActive
                          ? 'bg-slate-950/15 text-slate-950 font-bold'
                          : 'bg-blue-950/60 text-teal-300'
                      }`}
                    >
                      {item.roleGroupBadge}
                    </span>
                  )}
                </>
              );

              if (item.id === 'smart-question-link' && directSidebarSmartQuestionUrl) {
                return (
                  <a
                    key={item.id}
                    href={directSidebarSmartQuestionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${item.orderNumber}. ${item.label} (Mở liên kết trong tab mới)`}
                    onClick={() => handleProtectedMenuNavigate(item.id)}
                    className={itemClassName}
                  >
                    {itemInner}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.orderNumber}. ${item.label}`}
                  onClick={() => handleProtectedMenuNavigate(item.id)}
                  className={itemClassName}
                >
                  {itemInner}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Chân Sidebar: Phạm vi dữ liệu theo tài khoản */}
        <div
          className={`p-4 border-t border-blue-800 text-xs text-blue-200 space-y-1 ${
            desktopSidebarCompact ? 'lg:hidden' : ''
          }`}
        >
          <div className="font-semibold text-white">Phạm vi dữ liệu đang lọc</div>
          {activeProductionRoleKey === 'SUPER_ADMIN' ? (
            <div className="truncate">
              Phạm vi:{' '}
              <span className="text-teal-300 font-semibold">Toàn nền tảng (Đa trường)</span>
            </div>
          ) : (
            <div className="truncate">
              Tổ/Bộ phận:{' '}
              <span className="text-teal-300 font-semibold">
                {authSession?.user.departmentName || 'Toàn trường'}
              </span>
            </div>
          )}
          <div className="truncate">
            Chức vụ:{' '}
            <span className="text-amber-300 font-semibold">
              {activeProductionRoleKey === 'SUPER_ADMIN'
                ? 'Super Admin (Nền tảng)'
                : authSession?.user.positionTitle ||
                  authSession?.landingNavigation.roleDisplayName ||
                  'Giáo viên'}
            </span>
          </div>
        </div>
      </aside>

      {/* Khu vực chính bên phải */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mục X. HEADER CHÍNH THỨC: Chỉ hiển thị Logo, Tên trường, Năm học, Thông báo, Họ tên, Chức vụ/Vai trò, Avatar, Đổi mật khẩu, Đăng xuất */}
        <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-30">
          {/* Khu vực 1: Logo + Tên trường + Năm học */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={toggleDesktopSidebar}
              title={
                desktopSidebarVisible
                  ? 'Ẩn thanh menu bên trái (Ctrl + B)'
                  : 'Hiện thanh menu bên trái (Ctrl + B)'
              }
              className="hidden lg:inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
            >
              {desktopSidebarVisible ? (
                <PanelLeftClose className="w-4 h-4 text-slate-600" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-blue-700" />
              )}
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#123D75] text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-slate-900 truncate">
                    {activeProductionRoleKey === 'SUPER_ADMIN'
                      ? 'EDU TEST AI · Quản trị Nền tảng Đa trường'
                      : schoolBranding.schoolName || config.schoolName}
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 shrink-0">
                    Năm học {schoolBranding.academicYear || config.academicYear}
                  </span>
                  {canSwitchWorkspaceSchool && (
                    <select
                      aria-label="Chọn trường làm việc"
                      value={activeWorkspaceSchoolId}
                      onChange={(e) => {
                        const nextSchoolId = e.target.value;
                        const nextName =
                          nextSchoolId === 'SCHOOL_B'
                            ? 'Trường Tiểu học Sịa'
                            : nextSchoolId === 'SCHOOL_C'
                            ? 'Trường THCS Đặng Dung'
                            : 'Trường TH&THCS Nguyễn Đình Anh';
                        handleBrandingUpdated({
                          ...schoolBranding,
                          schoolId: nextSchoolId,
                          schoolName: nextName,
                        });
                      }}
                      className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-800 cursor-pointer outline-none"
                    >
                      <option value="SCHOOL_A">Trường: Trường TH&THCS Nguyễn Đình Anh</option>
                      <option value="SCHOOL_B">Trường: Trường Tiểu học Sịa</option>
                      <option value="SCHOOL_C">Trường: Trường THCS Đặng Dung</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Khu vực 2: Thông báo, Họ tên người dùng, Chức vụ/vai trò đang làm việc, Avatar, Đổi mật khẩu, Đăng xuất */}
          <div className="flex items-center gap-2.5 shrink-0">
            <NotificationBellDropdown
              authSession={authSession}
              actorRole={authSession.user.activeRole}
              questions={scopedQuestions}
              matrices={scopedMatrices}
              exams={scopedExams}
              onOpenWorkflowDossier={(wfId, menuId) => {
                setFocusedWorkflowId(wfId);
                handleProtectedMenuNavigate(menuId);
              }}
              onOpenNotificationCenterPage={() =>
                handleProtectedMenuNavigate('notification-center')
              }
              onNotify={notify}
            />

            {distinctNormalizedRoles.length > 1 && (
              <select
                aria-label="Chuyển vai trò làm việc"
                value={authSession.user.activeRole}
                onChange={(e) => {
                  const nextRole = e.target.value as WorkflowActorRole;
                  handleRequestRoleSwitchWithGuard(nextRole);
                }}
                className="hidden sm:inline-block px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer outline-none"
              >
                {distinctNormalizedRoles.map(({ rawRole, primaryKey }) => (
                  <option key={primaryKey} value={rawRole}>
                    Vai trò: {getOfficialRoleDisplayLabel(primaryKey)}
                  </option>
                ))}
              </select>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserAccountMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                title="Tài khoản cá nhân · Đổi mật khẩu · Đăng xuất"
              >
                <div className="w-7 h-7 rounded-full bg-[#123D75] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {authSession.user.fullName
                    .split(' ')
                    .slice(-1)[0]
                    ?.charAt(0)
                    ?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-40">
                    {authSession.user.fullName}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 truncate max-w-40">
                    {getOfficialRoleDisplayLabel(activeProductionRoleKey)}
                  </div>
                </div>
              </button>

              {userAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 truncate">
                      {authSession.user.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {getOfficialRoleDisplayLabel(activeProductionRoleKey)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAccountMenuOpen(false);
                      setSelfProfileTab('PERSONAL_INFO');
                      handleProtectedMenuNavigate('my-profile');
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <UserCog className="w-4 h-4 text-blue-600" />
                    <span>Tài khoản cá nhân</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAccountMenuOpen(false);
                      setSelfProfileTab('SECURITY_AND_PASSWORD');
                      handleProtectedMenuNavigate('my-profile');
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserAccountMenuOpen(false);
                      void handleLogout();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-700 font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelfProfileTab('SECURITY_AND_PASSWORD');
                handleProtectedMenuNavigate('my-profile');
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Đổi mật khẩu đăng nhập"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Đổi mật khẩu</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Đăng xuất khỏi phiên làm việc"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Thanh công cụ phân tách Dữ liệu mẫu chỉ mở khi Feature Flag enableSampleDataGenerator=true (tắt trong Production Only) */}
        {runtimeFlags.enableSampleDataGenerator && filterBarVisible && (
          <div className="bg-slate-100/80 border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Chế độ Nguồn dữ liệu:</span>
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSourceFilter('ALL')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    sourceFilter === 'ALL'
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter('SAMPLE')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    sourceFilter === 'SAMPLE'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dữ liệu mẫu thử nghiệm ({sampleCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter('REAL')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    sourceFilter === 'REAL'
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dữ liệu thật nhà trường ({realCount})
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Phạm vi cấp học:</span>
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
                {allowedGlobalLevels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLevelFilter('ALL')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      levelFilter === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Toàn trường (Lớp 1–9)
                  </button>
                )}
                {allowedGlobalLevels.includes(EducationLevelId.PRIMARY) && (
                  <button
                    type="button"
                    onClick={() => setLevelFilter(EducationLevelId.PRIMARY)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      levelFilter === EducationLevelId.PRIMARY
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tiểu học (Lớp 1–5)
                  </button>
                )}
                {allowedGlobalLevels.includes(EducationLevelId.LOWER_SECONDARY) && (
                  <button
                    type="button"
                    onClick={() => setLevelFilter(EducationLevelId.LOWER_SECONDARY)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      levelFilter === EducationLevelId.LOWER_SECONDARY
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    THCS (Lớp 6–9)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Khung hiển thị Toast Notifications */}
        {toasts.length > 0 && (
          <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-md w-full px-4 pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`pointer-events-auto p-4 rounded-xl border shadow-md flex items-start justify-between gap-3 ${
                  t.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : t.type === 'error'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : t.type === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-blue-50 border-blue-300 text-blue-950'
                }`}
              >
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t.title}</span>
                  </div>
                  <p className="opacity-90 leading-relaxed">{t.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                  className="text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Nội dung chính theo từng mục Menu (Được bảo vệ bởi ProtectedRoute - Mục IX) */}
        <main
          className={`flex-1 p-6 w-full mx-auto transition-all duration-200 ${
            !desktopSidebarVisible || desktopSidebarCompact ? 'max-w-full' : 'max-w-7xl'
          }`}
        >
          {/* Thanh Breadcrumb & Tiêu đề Trang Chuẩn Production */}
          <div className="mb-5 bg-white rounded-xl border border-[#E5E7EB] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => handleProtectedMenuNavigate('dashboard')}
                  className="hover:text-[#123D75] font-medium cursor-pointer"
                >
                  EDU TEST AI
                </button>
                <span>/</span>
                <span className="text-[#087F8C] font-semibold">
                  {activeProductionRoleKey === 'SUPER_ADMIN'
                    ? 'Nền tảng Đa trường'
                    : schoolBranding.schoolName || config.schoolName}
                </span>
                <span>/</span>
                <span className="text-[#123D75] font-bold">{currentMenuMeta.label}</span>
              </div>
              <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
                {currentMenuMeta.orderNumber}. {currentMenuMeta.label}
              </h1>
            </div>

            {authorizedProductionMenus.some((m) => m.id === 'exam-builder') && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleProtectedMenuNavigate('exam-builder')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#123D75] hover:bg-[#0e315f] text-white transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#F4A340]" />
                  Tạo đề kiểm tra mới
                </button>
              </div>
            )}
          </div>

          {/* Mục IX. BẢO VỆ ROUTE (ProtectedRoute): Nếu không có quyền -> hiển thị "Bạn không có quyền truy cập" */}
          {!routeAccessVerification.allowed ? (
            <div className="bg-white border border-rose-200 rounded-2xl p-10 text-center max-w-xl mx-auto my-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Bạn không có quyền truy cập
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {routeAccessVerification.message ||
                  'Chức năng này không nằm trong danh mục phân quyền của chức vụ hiện tại.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveMenu('dashboard')}
                className="mt-6 px-5 py-2.5 rounded-xl bg-[#123D75] text-white text-xs font-semibold hover:bg-[#0e315f] transition-colors cursor-pointer"
              >
                Quay về Trang chủ
              </button>
            </div>
          ) : (
            <>
              {/* Mục V & XI: Trang chủ chính thức theo từng Chức vụ / Vai trò */}
              {activeMenu === 'dashboard' && (
                <ProductionRoleDashboardWorkspace
                  authSession={authSession}
                  activeRoleKey={activeProductionRoleKey}
                  authorizedMenus={authorizedProductionMenus}
                  branding={schoolBranding}
                  teacherProfile={activeTeacherPermissionProfile}
                  questions={scopedQuestions}
                  matrices={scopedMatrices}
                  exams={scopedExams}
                  onNavigateTab={handleProtectedMenuNavigate}
                  onCleanSampleData={handleCleanSampleTeacherWorkData}
                />
              )}

          {/* Mục 11 (Giáo viên): Tài khoản cá nhân & Tự đổi mật khẩu (Mục I -> XII) */}
          {activeMenu === 'my-profile' && (
            <div className="space-y-6">
              <TeacherSelfProfileAndPasswordWorkspace
                initialTab={selfProfileTab}
                currentUserId={authSession?.user?.id}
                onProfileFullNameUpdated={(newFullName) => {
                  if (authSession) {
                    setAuthSession({
                      ...authSession,
                      user: {
                        ...authSession.user,
                        fullName: newFullName,
                      },
                    });
                  }
                  setPermRefreshTick((t) => t + 1);
                  notify(
                    'success',
                    'Đã cập nhật Họ và tên cá nhân',
                    `Họ và tên hiển thị đã được đồng bộ thành "${newFullName}" (UID và phân quyền giữ nguyên).`
                  );
                }}
                onRequestLogout={handleLogout}
              />
            </div>
          )}

          {activeMenu === 'stage16-acceptance' && (
            <Stage16AcceptanceTestWorkspace
              questions={questions}
              matrices={matrices}
              exams={exams}
              config={config}
              onOpenWorkflowInPipeline={(wfId) => {
                setFocusedWorkflowId(wfId);
                handleProtectedMenuNavigate('exam-workflow');
                notify(
                  'info',
                  'Đã mở Hồ sơ trong Quy trình 9 bước',
                  `Đang hiển thị chi tiết hồ sơ [${wfId}] tại màn hình Quy trình tạo đề.`
                );
              }}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {(activeMenu === 'executive-dashboard' ||
            activeMenu === 'bgh-school-dossiers' ||
            (activeMenu === 'bgh-assign-exam' &&
              activeProductionRoleKey !== 'SCHOOL_ADMIN' &&
              activeProductionRoleKey !== 'SUPER_ADMIN')) && (
            <ExecutiveDashboardWorkspace
              questions={scopedQuestions}
              matrices={scopedMatrices}
              exams={scopedExams}
              config={effectiveConfig}
              activeMenu={activeMenu}
              schoolId={activeWorkspaceSchoolId}
              schoolName={schoolBranding.schoolName || config.schoolName}
              actorUserId={authSession?.user?.id}
              actorFullName={authSession?.user?.fullName}
              actorRole={activeProductionRoleKey}
              actorRoleTitle={getOfficialRoleDisplayLabel(activeProductionRoleKey)}
              onOpenWorkflowInPipeline={(wfId) => {
                setFocusedWorkflowId(wfId);
                handleProtectedMenuNavigate('exam-workflow');
                notify(
                  'info',
                  'Đã mở Hồ sơ trong Quy trình 9 bước',
                  `Đang hiển thị chi tiết hồ sơ [${wfId}] tại màn hình Quy trình tạo đề.`
                );
              }}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {activeMenu === 'notification-center' && (
            <WorkflowNotificationCenterWorkspace
              questions={scopedQuestions}
              matrices={scopedMatrices}
              exams={scopedExams}
              config={effectiveConfig}
              authSession={authSession}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              schoolBranding={schoolBranding}
              schoolAllowedGrades={schoolAllowedGrades}
              actorRole={authSession.user.activeRole}
              onOpenWorkflowDossier={(wfId, menuId) => {
                setFocusedWorkflowId(wfId);
                handleProtectedMenuNavigate(menuId);
              }}
              onCleanSampleData={handleCleanSampleTeacherWorkData}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {(activeMenu === 'progress-management' ||
            activeMenu === 'dept-dossiers' ||
            activeMenu === 'dept-progress' ||
            activeMenu === 'bgh-progress-tracking') && (
            <DossierProgressManagementWorkspace
              questions={scopedQuestions}
              matrices={scopedMatrices}
              exams={scopedExams}
              config={effectiveConfig}
              activeMenu={activeMenu}
              schoolId={activeWorkspaceSchoolId}
              schoolName={schoolBranding.schoolName || config.schoolName}
              actorUserId={authSession?.user?.id}
              actorFullName={authSession?.user?.fullName}
              actorRole={activeProductionRoleKey}
              actorDepartmentName={authSession?.user?.departmentName}
              onOpenWorkflowInPipeline={(wfId) => {
                setFocusedWorkflowId(wfId);
                handleProtectedMenuNavigate('exam-workflow');
                notify(
                  'info',
                  'Đã mở Hồ sơ trong Quy trình 9 bước',
                  `Đang hiển thị chi tiết hồ sơ [${wfId}] tại màn hình Quy trình tạo đề.`
                );
              }}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {activeMenu === 'exam-workflow' && (
            <EndToEndExamWorkflowWorkspace
              questions={scopedQuestions}
              matrices={scopedMatrices}
              exams={scopedExams}
              config={effectiveConfig}
              authSession={authSession}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              schoolBranding={schoolBranding}
              schoolAllowedGrades={schoolAllowedGrades}
              initialWorkflowId={focusedWorkflowId}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {activeMenu === 'curriculum' && (
            <TeacherMyWorkWorkspace
              topics={scopedTopics}
              questions={scopedQuestions}
              matrices={scopedMatrices}
              exams={scopedExams}
              config={effectiveConfig}
              authSession={authSession}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              schoolBranding={schoolBranding}
              schoolAllowedGrades={schoolAllowedGrades}
              onAddTopic={handleAddTopic}
              onCleanSampleData={handleCleanSampleTeacherWorkData}
              onOpenWorkflowDossier={(wfId, menuId) => {
                setFocusedWorkflowId(wfId);
                handleProtectedMenuNavigate(menuId || 'exam-workflow');
              }}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {activeMenu === 'corpus' && (
            <CorpusAndQuestionGroupWorkspace
              topics={scopedTopics}
              questions={scopedQuestions}
              exams={scopedExams}
              config={effectiveConfig}
              globalLevelFilter={levelFilter}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onBulkAddQuestions={handleBulkAddQuestions}
              onRefreshGlobalState={() => {
                setQuestions(dataRepository.getQuestions());
                setExams(dataRepository.getExams());
              }}
              onNotify={notify}
            />
          )}

          {activeMenu === 'primary-assessment' && (
            <PrimaryAssessmentWorkspace onNotify={notify} />
          )}

          {(activeMenu === 'exam-analytics' || activeMenu === 'bgh-result-analytics') && (
            <ExamResultAnalyticsWorkspace
              schoolName={effectiveConfig.schoolName}
              academicYear={effectiveConfig.academicYear}
              onNotify={notify}
            />
          )}

          {activeMenu === 'ai-quality-review' && (
            <AIQualityReviewWorkspace
              questions={scopedQuestions}
              savedExams={scopedExams}
              savedMatrices={scopedMatrices}
              config={effectiveConfig}
              authSession={authSession}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              schoolBranding={schoolBranding}
              schoolAllowedGrades={schoolAllowedGrades}
              onCleanSampleData={handleCleanSampleTeacherWorkData}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {(activeMenu === 'bgh-quality-report' ||
            activeMenu === 'dept-report') && (
            <BghProfessionalReportWorkspace
              questions={scopedQuestions}
              matrices={scopedMatrices}
              exams={scopedExams}
              config={effectiveConfig}
              activeMenu={activeMenu}
              actorRole={activeProductionRoleKey}
              schoolId={activeWorkspaceSchoolId}
              schoolName={schoolBranding.schoolName || effectiveConfig.schoolName}
              governingBody={schoolBranding.governingBody}
              schoolAllowedGrades={schoolAllowedGrades}
              actorUserId={authSession?.user?.id}
              actorFullName={authSession?.user?.fullName}
              actorRoleTitle={getOfficialRoleDisplayLabel(activeProductionRoleKey)}
              actorDepartmentName={authSession?.user?.departmentName}
              onCleanSampleReportData={handleCleanSampleReportData}
              onNavigate={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {activeMenu === 'questions' && (
            <QuestionBankWorkspace
              questions={scopedQuestions}
              groups={questionGroups}
              topics={scopedTopics}
              exams={scopedExams}
              sourceFilter={sourceFilter}
              globalLevelFilter={levelFilter}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              enforceTeacherScope={isTeacherScopedActor}
              schoolAllowedGrades={schoolAllowedGrades}
              userAssignedSubjects={authSession?.user?.assignedSubjects}
              userAssignedGrades={authSession?.user?.assignedGrades}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDuplicateQuestion={handleDuplicateQuestion}
              onBulkAddQuestions={handleBulkAddQuestions}
              onDeleteQuestion={handleDeleteQuestion}
              onAddGroup={handleAddQuestionGroup}
              onAssignToGroup={handleAssignQuestionsToGroup}
              onDeleteGroup={handleDeleteQuestionGroup}
              onNotify={notify}
            />
          )}

          {activeMenu === 'smart-import' && (
            <SmartExamImportWorkspace
              topics={scopedTopics}
              existingQuestions={scopedQuestions}
              globalLevelFilter={levelFilter}
              onBulkAddQuestions={handleBulkAddQuestions}
              onAddGroup={handleAddQuestionGroup}
              onAssignToGroup={handleAssignQuestionsToGroup}
              onNavigateToBank={() => handleProtectedMenuNavigate('questions')}
              onNotify={notify}
            />
          )}

          {activeMenu === 'ai-generator' && (
            <AIQuestionGeneratorWorkspace
              topics={scopedTopics}
              existingQuestions={scopedQuestions}
              globalLevelFilter={levelFilter}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              enforceTeacherScope={isTeacherScopedActor}
              onSaveQuestionToBank={handleAddQuestion}
              onBulkSaveQuestionsToBank={handleBulkAddQuestions}
              onNotify={notify}
            />
          )}

          {activeMenu === 'matrix' && (
            <MatrixAndSpecificationWorkspace
              matrices={scopedMatrices}
              topics={scopedTopics}
              questions={scopedQuestions}
              config={config}
              sourceFilter={sourceFilter}
              globalLevelFilter={levelFilter}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              enforceTeacherScope={isTeacherScopedActor}
              onAddMatrix={handleAddMatrix}
              onUpdateMatrix={handleUpdateMatrix}
              onDeleteMatrix={handleDeleteMatrix}
              onNotify={notify}
            />
          )}

          {activeMenu === 'exam-builder' && (
            <ExamGeneratorWorkspace
              exams={scopedExams}
              matrices={scopedMatrices}
              questions={scopedQuestions}
              config={config}
              sourceFilter={sourceFilter}
              globalLevelFilter={levelFilter}
              currentUserId={authSession?.user?.id}
              onQuickSwitchTeacherAccount={async (targetUserId) => {
                const outcome = await loginWithServerRoleScenario({
                  userId: targetUserId,
                  rememberMe: true,
                });
                if (outcome.ok && outcome.session) {
                  setAuthSession(outcome.session);
                  notify(
                    'success',
                    'Đã chuyển tài khoản Giáo viên',
                    `Đang làm việc dưới tài khoản: ${outcome.session.user.fullName} (${outcome.session.user.username})`
                  );
                }
              }}
              onOpenTeacherPermissionManager={() =>
                handleProtectedMenuNavigate('admin-teacher-permissions')
              }
              onAddExam={handleAddExam}
              onUpdateExam={handleUpdateExam}
              onUpdateApproval={handleUpdateApproval}
              onBulkAddQuestions={handleBulkAddQuestions}
              onUpdateQuestion={handleUpdateQuestion}
              onUpdateMatrix={handleUpdateMatrix}
              onNotify={notify}
            />
          )}

          {(activeMenu === 'approval' ||
            activeMenu === 'dept-assign-reviewer' ||
            activeMenu === 'dept-review-exam' ||
            activeMenu === 'bgh-approval') && (
            <AppraisalAndApprovalWorkspace
              matrices={scopedMatrices}
              exams={scopedExams}
              questions={scopedQuestions}
              config={effectiveConfig}
              sourceFilter={sourceFilter}
              activeMenu={activeMenu}
              actorRole={activeProductionRoleKey}
              schoolId={activeWorkspaceSchoolId}
              schoolName={schoolBranding.schoolName || effectiveConfig.schoolName}
              actorUserId={authSession?.user?.id}
              actorFullName={authSession?.user?.fullName}
              actorRoleTitle={getOfficialRoleDisplayLabel(activeProductionRoleKey)}
              actorDepartmentName={authSession?.user?.departmentName}
              actorPermissionCodes={activeTeacherPermissionProfile?.permissionCodes}
              onAddMatrix={handleAddMatrix}
              onUpdateMatrix={handleUpdateMatrix}
              onAddExam={handleAddExam}
              onUpdateExam={handleUpdateExam}
              onUpdateApproval={handleUpdateApproval}
              onCleanSampleAppraisalData={handleCleanSampleAppraisalData}
              onNavigate={handleProtectedMenuNavigate}
              onSaveConfig={handleSaveConfig}
              onNotify={notify}
            />
          )}

          {activeMenu === 'records' && (
            <DossierExportWorkspace
              exams={scopedExams}
              matrices={scopedMatrices}
              questions={scopedQuestions}
              config={config}
              sourceFilter={sourceFilter}
              globalLevelFilter={levelFilter}
              teacherPermissionProfile={activeTeacherPermissionProfile}
              enforceTeacherScope={isTeacherScopedActor}
              onAddMatrix={handleAddMatrix}
              onAddExam={handleAddExam}
              onSaveConfig={handleSaveConfig}
              onNotify={notify}
            />
          )}

          {activeMenu === 'reports' && (
            <QualityAssuranceAndAcceptanceWorkspace
              topics={topics}
              questions={questions}
              matrices={matrices}
              exams={exams}
              config={config}
              onResetSeedData={handleResetSeedData}
              onNotify={notify}
            />
          )}

          {activeMenu === 'admin-accounts' && (
            <TeacherAccountManagementWorkspace
              schoolId={activeWorkspaceSchoolId}
              currentAdminUserId={authSession?.user?.id || 'user-admin-sys'}
              currentAdminName={authSession?.user?.fullName || 'Quản trị hệ thống'}
              onOpenVisualPermissionForTeacher={(teacherUserId, teacherFullName) => {
                setFocusedWorkflowId(teacherUserId);
                setActiveMenu('admin-teacher-permissions');
                notify(
                  'info',
                  `Mở Phân quyền trực quan: ${teacherFullName}`,
                  `Đã chuyển sang giao diện Phân quyền giáo viên và chọn sẵn tài khoản [${teacherUserId}] (Mục VIII).`
                );
              }}
              onOpenDepartmentsAndAssignments={(teacherUserId) => {
                if (teacherUserId) setFocusedWorkflowId(teacherUserId);
                setActiveMenu('bgh-assign-exam');
              }}
              onAccountsChanged={() => setPermRefreshTick((t) => t + 1)}
            />
          )}

          {(activeMenu === 'admin-departments' ||
            (activeMenu === 'bgh-assign-exam' &&
              (activeProductionRoleKey === 'SCHOOL_ADMIN' ||
                activeProductionRoleKey === 'SUPER_ADMIN'))) && (
            <DepartmentAndTeachingAssignmentWorkspace
              schoolId={activeWorkspaceSchoolId}
              initialTab={
                activeMenu === 'bgh-assign-exam' ? 'TEACHING_ASSIGNMENTS' : 'DEPARTMENTS'
              }
              currentAdminUserId={authSession?.user?.id || 'user-admin-sys'}
              currentAdminName={authSession?.user?.fullName || 'Quản trị hệ thống'}
              initialSelectedTeacherId={
                focusedWorkflowId && focusedWorkflowId.startsWith('user-')
                  ? focusedWorkflowId
                  : undefined
              }
              onOpenVisualPermissionForTeacher={(teacherUserId, teacherFullName) => {
                setFocusedWorkflowId(teacherUserId);
                setActiveMenu('admin-teacher-permissions');
                notify(
                  'info',
                  `Mở Phân quyền trực quan: ${teacherFullName}`,
                  `Đã chuyển sang giao diện Phân quyền giáo viên và chọn sẵn tài khoản [${teacherUserId}].`
                );
              }}
              onOpenAccountManagerForTeacher={(teacherUserId) => {
                setFocusedWorkflowId(teacherUserId);
                setActiveMenu('admin-accounts');
              }}
              onDataChanged={() => setPermRefreshTick((t) => t + 1)}
            />
          )}

          {activeMenu === 'admin-teacher-permissions' && (
            <TeacherPermissionManagerWorkspace
              currentActorUserId={authSession?.user?.id || 'user-sys-admin'}
              schoolId={activeWorkspaceSchoolId}
              schoolName={schoolBranding.schoolName || config.schoolName}
              initialSelectedTeacherId={
                focusedWorkflowId && focusedWorkflowId.startsWith('user-')
                  ? focusedWorkflowId
                  : undefined
              }
              onQuickSwitchAccountSession={(nextSession) => {
                setAuthSession(nextSession);
                notify(
                  'success',
                  'Đã chuyển phiên đăng nhập',
                  `Đang kiểm tra quyền dưới tài khoản: ${nextSession.user.fullName} (${nextSession.user.username})`
                );
              }}
              onNavigateSection={handleProtectedMenuNavigate}
            />
          )}

          {activeMenu === 'admin-firebase-data' && (
            <FirebaseDataManagementDashboard
              currentUserId={authSession?.user?.id || 'user-admin-sys'}
              currentUserName={authSession?.user?.fullName || 'Quản trị hệ thống'}
              currentUserRole={authSession?.user?.activeRole || 'SYSTEM_ADMIN'}
              onNotify={notify}
            />
          )}

          {activeMenu === 'smart-autosave-conflict' && (
            <SmartAutosaveAndConflictWorkspace
              currentUserId={authSession?.user?.id || 'uid_gv_nd_thcs_002'}
              currentUserName={authSession?.user?.fullName || 'Thầy Trần Quốc Tuấn (GV KHTN)'}
              currentUserRole={authSession?.user?.activeRole || 'TEACHER'}
              onNotify={notify}
            />
          )}

          {activeMenu === 'multi-tenant-stage19' && <MultiTenantStage19Workspace />}

          {activeMenu === 'super-admin-schools' && <SuperAdminSchoolManagementWorkspace />}

          {activeMenu === 'school-admin-workspace' && (
            <SchoolAdminWorkspace
              schoolId={activeWorkspaceSchoolId}
              schoolName={schoolBranding.schoolName || config.schoolName}
              actorUserId={authSession?.user?.id}
              actorFullName={authSession?.user?.fullName}
            />
          )}

          {activeMenu === 'shared-question-repo' && <SharedQuestionRepositoryWorkspace />}

          {activeMenu === 'multi-school-security' && <MultiSchoolSecurityRulesWorkspace />}

          {activeMenu === 'admin-school-config' && (
            <SchoolConfigurationModuleWorkspace
              schoolId={activeWorkspaceSchoolId}
              actorUserId={authSession?.user?.id}
            />
          )}

          {activeMenu === 'ai-usage-management' && (
            <AIUsageManagementWorkspace authSession={authSession} />
          )}

          {activeMenu === 'school-plan-management' && <SchoolSubscriptionPlanWorkspace />}

          {(activeMenu === 'admin' ||
            activeMenu === 'admin-roles' ||
            activeMenu === 'admin-academic-year' ||
            activeMenu === 'admin-audit-logs' ||
            activeMenu === 'admin-backups') && (
            <SystemAdministrationWorkspace
              onNotify={notify}
              onQuickSwitchAccountSession={(nextSession) => {
                setAuthSession(nextSession);
                notify(
                  'success',
                  'Đã chuyển phiên đăng nhập',
                  `Đang kiểm tra quyền dưới tài khoản: ${nextSession.user.fullName} (${nextSession.user.username})`
                );
              }}
              onNavigateSection={handleProtectedMenuNavigate}
            />
          )}

          {activeMenu === 'smart-question-link' && (
            <SmartQuestionLinkWorkspace
              authSession={authSession}
              activeRoleKey={activeProductionRoleKey}
              schoolId={activeWorkspaceSchoolId}
              onNavigateMenu={handleProtectedMenuNavigate}
              onNotify={notify}
            />
          )}

          {(activeMenu === 'settings' || activeMenu === 'admin-system-settings') && (
            <SecondaryModulesView
              section="settings"
              exams={exams}
              questions={questions}
              matrices={matrices}
              config={config}
              onSaveConfig={handleSaveConfig}
              onResetSeedData={handleResetSeedData}
              onNotify={notify}
            />
          )}
            </>
          )}
        </main>

        {/* Footer chính thức */}
        <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            EDU TEST AI – Ngân hàng Đề kiểm tra Thông minh · Chương trình GDPT 2018
          </div>
          <div>
            Hệ thống Quản trị Ngân hàng Đề kiểm tra Đa trường học
          </div>
        </footer>
      </div>
      </div>
    </SchoolContextProvider>
  );
}
