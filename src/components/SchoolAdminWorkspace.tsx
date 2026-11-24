import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  CheckSquare,
  FileSpreadsheet,
  ArrowRightLeft,
  ShieldCheck,
  Lock,
  Unlock,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  FileCheck2,
  FileText,
  Sliders,
  Search,
  Plus,
  Edit3,
  Calendar,
  BookOpen,
  Layers,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useSchoolContext } from '../contexts/SchoolContext';
import { SchoolConfigurationModuleWorkspace } from './SchoolConfigurationModuleWorkspace';

const FUNCTIONAL_PERMISSION_CATALOG = [
  {
    code: 'CREATE_QUESTION',
    label: 'Soạn thảo & Quản lý Câu hỏi',
    desc: 'Tạo, sửa, nhân bản câu hỏi trong phạm vi môn và khối được giao',
    sensitive: false,
  },
  {
    code: 'CREATE_MATRIX',
    label: 'Xây dựng Ma trận đề',
    desc: 'Thiết lập ma trận đặc tả đề kiểm tra định kỳ',
    sensitive: false,
  },
  {
    code: 'CREATE_SPECIFICATION',
    label: 'Xây dựng Bản đặc tả',
    desc: 'Biên soạn yêu cầu cần đạt và mức độ nhận thức',
    sensitive: false,
  },
  {
    code: 'CREATE_EXAM',
    label: 'Tạo & Sinh Đề kiểm tra',
    desc: 'Lắp ghép đề kiểm tra từ ngân hàng câu hỏi',
    sensitive: false,
  },
  {
    code: 'USE_AI_GENERATOR',
    label: 'Sử dụng AI tạo câu hỏi',
    desc: 'Gọi trợ lý AI sinh câu hỏi gợi ý theo YCCĐ',
    sensitive: false,
  },
  {
    code: 'USE_AI_REVIEW',
    label: 'Sử dụng AI kiểm tra chất lượng đề',
    desc: 'Phân tích độ phủ ma trận và kiểm tra sư phạm bằng AI',
    sensitive: false,
  },
  {
    code: 'APPRAISE_EXAM',
    label: 'Thẩm định đề cấp Tổ chuyên môn',
    desc: 'Quyền nhạy cảm: Phản biện, yêu cầu chỉnh sửa hoặc thông qua hồ sơ đề của tổ',
    sensitive: true,
  },
  {
    code: 'EXPORT_DOSSIER',
    label: 'Xuất hồ sơ Đề chính thức & Đề mật (Word/PDF)',
    desc: 'Quyền nhạy cảm: Tải xuống tệp đề kiểm tra chính thức và hướng dẫn chấm mật',
    sensitive: true,
  },
];

const SUBJECT_CATALOG = [
  'Tiếng Việt',
  'Toán',
  'Tiếng Anh',
  'Khoa học',
  'Tin học',
  'Công nghệ',
  'Đạo đức',
  'Lịch sử và Địa lí',
  'Mĩ thuật',
  'Âm nhạc',
  'Giáo dục thể chất',
  'Hoạt động trải nghiệm',
  'Tự nhiên và Xã hội',
  'Tin học và Công nghệ',
  'Ngoại ngữ 1 (Tiếng Anh)',
  'Ngữ văn',
  'Khoa học tự nhiên',
  'Giáo dục công dân',
  'Hoạt động trải nghiệm, hướng nghiệp',
  'Giáo dục địa phương',
  'Nghệ thuật (Âm nhạc)',
  'Nghệ thuật (Mĩ thuật)',
];

type SchoolAdminPageId =
  | 'PAGE_1_SCHOOL_INFO'
  | 'PAGE_2_DEPARTMENTS'
  | 'PAGE_3_TEACHER_ACCOUNTS'
  | 'PAGE_4_EXCEL_IMPORT'
  | 'PAGE_5_PERMISSIONS'
  | 'PAGE_6_TEACHING_ASSIGNMENTS'
  | 'PAGE_7_EXAM_PLANS'
  | 'PAGE_8_DOSSIER_PROGRESS'
  | 'PAGE_9_QA_TEST_SUITE';

interface DepartmentRow {
  id: string;
  code: string;
  name: string;
  educationLevel: 'PRIMARY' | 'LOWER_SECONDARY' | 'BOTH';
  headTeacherName: string;
  headTeacherEmail: string;
  subjects: string[];
  memberCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface TeachingAssignmentRow {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  departmentName: string;
  educationLevel: 'PRIMARY' | 'LOWER_SECONDARY';
  subject: string;
  grade: number;
  assignedClasses: string;
  semester: 'HK1' | 'HK2' | 'CA_NAM';
  weeklyPeriods: number;
  status: 'ACTIVE' | 'PAUSED';
}

interface ExamPlanRow {
  id: string;
  planCode: string;
  examPeriod: 'GIUA_KY_1' | 'CUOI_KY_1' | 'GIUA_KY_2' | 'CUOI_KY_2';
  examTitle: string;
  subject: string;
  grade: number;
  departmentName?: string;
  durationMinutes: number;
  assignedAuthor: string;
  assignedReviewer: string;
  dueDate: string;
  status: 'DANG_SOAN' | 'CHO_THAM_DINH' | 'DA_PHE_DUYET' | 'CHUA_BAT_DAU';
}

interface DossierProgressRow {
  id: string;
  dossierCode: string;
  examTitle: string;
  subject: string;
  grade: number;
  authorName: string;
  reviewerName: string;
  currentStepIndex: number; // 1..8
  currentStepLabel: string;
  completionPercent: number;
  dueDate: string;
  status: 'ON_TRACK' | 'COMPLETED' | 'NEEDS_REVISION' | 'PENDING_APPROVAL';
}

export interface SchoolAdminWorkspaceProps {
  schoolId?: string;
  schoolName?: string;
  actorUserId?: string;
  actorFullName?: string;
}

function normalizeRealSchoolId(raw?: string | null, actorId?: string | null): string {
  const s = String(raw || '').trim();
  if (s === 'SCHOOL_B' || s === 'sch-tieu-hoc-a') return 'SCHOOL_B';
  if (s === 'SCHOOL_C' || s === 'sch-thcs-b') return 'SCHOOL_C';
  if (s === 'SCHOOL_A' || s === 'sch-th-thcs-nguyen-du' || s === 'SCH-DAN-DIEN-NDA') return 'SCHOOL_A';
  if (actorId === 'user-school-admin-sia') return 'SCHOOL_B';
  if (actorId === 'user-school-admin-ddung') return 'SCHOOL_C';
  if (actorId === 'user-school-admin-a') return 'SCHOOL_A';
  return 'SCHOOL_A';
}

function resolveDefaultAdminIdForSchool(schoolId: string, actorUserId?: string | null): string {
  if (actorUserId && actorUserId.trim()) return actorUserId.trim();
  if (schoolId === 'SCHOOL_B') return 'user-school-admin-sia';
  if (schoolId === 'SCHOOL_C') return 'user-school-admin-ddung';
  return 'user-school-admin-a';
}

export const SchoolAdminWorkspace: React.FC<SchoolAdminWorkspaceProps> = ({
  schoolId: propSchoolId,
  schoolName: propSchoolName,
  actorUserId: propActorUserId,
  actorFullName: propActorFullName,
}) => {
  const { activeSchoolId: ctxSchoolId, switchSchool } = useSchoolContext();

  const resolvedInitialSchoolId = normalizeRealSchoolId(
    propSchoolId || ctxSchoolId,
    propActorUserId
  );
  const resolvedInitialAdminId = resolveDefaultAdminIdForSchool(
    resolvedInitialSchoolId,
    propActorUserId
  );

  // 8 trang chính chuẩn Mục III
  const [activePage, setActivePage] = useState<SchoolAdminPageId>('PAGE_3_TEACHER_ACCOUNTS');

  // Ngữ cảnh School Admin theo đúng trường đang đăng nhập
  const [managedSchoolId, setManagedSchoolId] = useState<string>(resolvedInitialSchoolId);
  const [actorSchoolAdminId, setActorSchoolAdminId] = useState<string>(resolvedInitialAdminId);

  const [workspaceData, setWorkspaceData] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [qaReport, setQaReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [banner, setBanner] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'INFO';
    message: string;
  } | null>(null);

  // --- IV. STATE CHO PHÂN QUYỀN TRỰC QUAN (CHECKBOX + SWITCH + XÁC NHẬN QUYỀN NHẠY CẢM) ---
  const [permCheckboxes, setPermCheckboxes] = useState<string[]>([]);
  const [levelCheckboxes, setLevelCheckboxes] = useState<('PRIMARY' | 'LOWER_SECONDARY')[]>([]);
  const [subjectCheckboxes, setSubjectCheckboxes] = useState<string[]>([]);
  const [gradeCheckboxes, setGradeCheckboxes] = useState<number[]>([]);
  const [dossierCheckboxes, setDossierCheckboxes] = useState<string[]>([]);
  const [memberStatus, setMemberStatus] = useState<'ACTIVE' | 'LOCKED' | 'REVOKED'>('ACTIVE');
  const [enableAiQuotaSwitch, setEnableAiQuotaSwitch] = useState<boolean>(true);
  const [strictScopeSwitch, setStrictScopeSwitch] = useState<boolean>(true);
  const [allowCrossGradeReviewSwitch, setAllowCrossGradeReviewSwitch] = useState<boolean>(false);

  // Modal xác nhận quyền nhạy cảm (Mục IV) & thao tác nguy hiểm (Mục V)
  const [sensitiveConfirmModal, setSensitiveConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    warningItems: string[];
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // --- TRANG 2: TỔ CHUYÊN MÔN (TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL) ---
  const [deptSearch, setDeptSearch] = useState('');
  const [deptLevelFilter, setDeptLevelFilter] = useState<'ALL' | 'PRIMARY' | 'LOWER_SECONDARY'>('ALL');
  const [deptPage, setDeptPage] = useState(1);
  const [deptPageSize] = useState(5);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [editingDeptModal, setEditingDeptModal] = useState<DepartmentRow | null>(null);

  // --- TRANG 3: TÀI KHOẢN GIÁO VIÊN (TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL) ---
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState('ALL');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherPageSize, setTeacherPageSize] = useState(10);
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [editingTeacherModal, setEditingTeacherModal] = useState<any | null>(null);

  const [newTeacherForm, setNewTeacherForm] = useState({
    fullName: '',
    email: '',
    subject: 'Toán',
    grade: resolvedInitialSchoolId === 'SCHOOL_C' ? 6 : 5,
  });

  // --- TRANG 4: NHẬP EXCEL ---
  const [excelImportReport, setExcelImportReport] = useState<any[] | null>(null);
  const [excelRawInput, setExcelRawInput] = useState<string>('');

  // --- TRANG 6: PHÂN CÔNG GIẢNG DẠY (TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL) ---
  const [assignSearch, setAssignSearch] = useState('');
  const [assignSubjectFilter, setAssignSubjectFilter] = useState('ALL');
  const [assignGradeFilter, setAssignGradeFilter] = useState<number | 'ALL'>('ALL');
  const [assignPage, setAssignPage] = useState(1);
  const [assignPageSize] = useState(10);
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignmentRow[]>([]);
  const [editingAssignmentModal, setEditingAssignmentModal] = useState<TeachingAssignmentRow | null>(null);

  // --- TRANG 7: KẾ HOẠCH KIỂM TRA (TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL) ---
  const [planSearch, setPlanSearch] = useState('');
  const [planSubjectFilter, setPlanSubjectFilter] = useState<string>('ALL');
  const [planDepartmentFilter, setPlanDepartmentFilter] = useState<string>('ALL');
  const [planTeacherFilter, setPlanTeacherFilter] = useState<string>('ALL');
  const [planPeriodFilter, setPlanPeriodFilter] = useState<string>('ALL');
  const [planPage, setPlanPage] = useState(1);
  const [planPageSize] = useState(5);
  const [examPlans, setExamPlans] = useState<ExamPlanRow[]>([]);
  const [editingPlanModal, setEditingPlanModal] = useState<ExamPlanRow | null>(null);

  // --- TRANG 8: TIẾN ĐỘ HỒ SƠ (TÌM KIẾM, BỘ LỌC, PHÂN TRANG) ---
  const [progressSearch, setProgressSearch] = useState('');
  const [progressStatusFilter, setProgressStatusFilter] = useState<string>('ALL');
  const [progressPage, setProgressPage] = useState(1);
  const [progressPageSize] = useState(5);
  const [dossierProgressRows, setDossierProgressRows] = useState<DossierProgressRow[]>([]);

  // --- TRANG 9: MÔ PHỎNG ĐĂNG NHẬP ĐA TRƯỜNG & KIỂM THỬ MỤC VI ---
  const [loginInputEmailOrUid, setLoginInputEmailOrUid] = useState<string>('');
  const [loginResolutionResult, setLoginResolutionResult] = useState<any | null>(null);
  const [reloadedSchoolSession, setReloadedSchoolSession] = useState<any | null>(null);

  const allowedGradesForSchool: number[] = useMemo(() => {
    if (Array.isArray(workspaceData?.allowedGrades) && workspaceData.allowedGrades.length > 0) {
      return workspaceData.allowedGrades;
    }
    if (managedSchoolId === 'SCHOOL_B') return [1, 2, 3, 4, 5];
    if (managedSchoolId === 'SCHOOL_C') return [6, 7, 8, 9];
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }, [workspaceData, managedSchoolId]);

  const loadSchoolAdminWorkspace = useCallback(
    async (targetSchoolId = managedSchoolId, adminId = actorSchoolAdminId) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/school-admin/${encodeURIComponent(targetSchoolId)}/workspace?actorUserId=${encodeURIComponent(adminId)}`
        );
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setBanner({
            type: 'ERROR',
            message: data.message || 'Từ chối truy cập danh sách nội bộ trường khác.',
          });
          return;
        }
        setWorkspaceData(data);

        // Đồng bộ danh sách Tổ chuyên môn theo đúng trường đang đăng nhập
        if (Array.isArray(data.departments)) {
          const mappedDepts: DepartmentRow[] = data.departments.map((d: any) => {
            const levels: string[] = Array.isArray(d.educationLevels)
              ? d.educationLevels
              : d.educationLevel
              ? [d.educationLevel]
              : ['PRIMARY'];
            const eduLevel: 'PRIMARY' | 'LOWER_SECONDARY' | 'BOTH' =
              levels.includes('PRIMARY') && levels.includes('LOWER_SECONDARY')
                ? 'BOTH'
                : levels.includes('LOWER_SECONDARY')
                ? 'LOWER_SECONDARY'
                : 'PRIMARY';
            const deptName = d.departmentName || d.name || 'Tổ chuyên môn';
            const inferredSubjects = deptName.toLowerCase().includes('tự nhiên')
              ? ['Toán', 'Khoa học tự nhiên', 'Tin học', 'Công nghệ']
              : deptName.toLowerCase().includes('xã hội')
              ? ['Ngữ văn', 'Lịch sử và Địa lí', 'Giáo dục công dân']
              : deptName.toLowerCase().includes('tiếng anh')
              ? ['Tiếng Anh']
              : ['Toán', 'Tiếng Việt', 'Khoa học'];
            return {
              id: d.id,
              code: d.departmentCode || d.code || d.id,
              name: deptName,
              educationLevel: eduLevel,
              headTeacherName: d.headFullName || 'Chưa phân công Tổ trưởng',
              headTeacherEmail: '',
              subjects: inferredSubjects,
              memberCount: Array.isArray(d.members)
                ? d.members.length
                : Array.isArray(d.memberUserIds)
                ? d.memberUserIds.length
                : 0,
              status: d.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            };
          });
          setDepartments(mappedDepts);
        }

        // Đồng bộ danh sách Phân công giảng dạy theo đúng trường đang đăng nhập
        if (Array.isArray(data.teachingAssignments)) {
          const mappedAssignments: TeachingAssignmentRow[] = data.teachingAssignments.map(
            (ta: any) => ({
              id: ta.id,
              teacherId: ta.teacherUserId || ta.teacherId || '',
              teacherName: ta.teacherFullName || ta.teacherName || '',
              teacherEmail: ta.teacherEmail || '',
              departmentName: ta.departmentName || 'Tổ chuyên môn',
              educationLevel:
                ta.educationLevelId === 'LOWER_SECONDARY' ? 'LOWER_SECONDARY' : 'PRIMARY',
              subject: ta.subjectName || ta.subject || 'Toán',
              grade:
                Array.isArray(ta.grades) && ta.grades.length > 0
                  ? Number(ta.grades[0])
                  : Number(ta.grade || (targetSchoolId === 'SCHOOL_C' ? 6 : 5)),
              assignedClasses: Array.isArray(ta.assignedClasses)
                ? ta.assignedClasses.join(', ')
                : String(ta.assignedClasses || ''),
              semester: 'CA_NAM',
              weeklyPeriods: 15,
              status: ta.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            })
          );
          setTeachingAssignments(mappedAssignments);
        } else {
          setTeachingAssignments([]);
        }

        // Khởi tạo Kế hoạch kiểm tra & Tiến độ hồ sơ theo đúng trường (không dùng dữ liệu trường khác)
        if (targetSchoolId === 'SCHOOL_A') {
          setExamPlans([
            {
              id: 'ep-nda-01',
              planCode: 'KH-GK1-TOAN-K9',
              examPeriod: 'GIUA_KY_1',
              examTitle: 'Kiểm tra Định kỳ Giữa học kỳ 1 – Môn Toán Lớp 9',
              subject: 'Toán',
              grade: 9,
              departmentName: 'Tổ khoa học tự nhiên',
              durationMinutes: 90,
              assignedAuthor: 'Lê Đắc Minh',
              assignedReviewer: 'Phan Thanh Nhật',
              dueDate: '2026-10-25',
              status: 'DA_PHE_DUYET',
            },
            {
              id: 'ep-nda-02',
              planCode: 'KH-CK1-VAN-K8',
              examPeriod: 'CUOI_KY_1',
              examTitle: 'Kiểm tra Định kỳ Cuối học kỳ 1 – Môn Ngữ văn Lớp 8',
              subject: 'Ngữ văn',
              grade: 8,
              departmentName: 'Tổ khoa học xã hội',
              durationMinutes: 90,
              assignedAuthor: 'Đặng Thị Kiều',
              assignedReviewer: 'Dương Thị Bích Hạnh',
              dueDate: '2026-12-18',
              status: 'CHO_THAM_DINH',
            },
          ]);
          setDossierProgressRows([
            {
              id: 'dp-nda-01',
              dossierCode: 'HS-DE-2026-001',
              examTitle: 'Hồ sơ Đề kiểm tra Giữa kỳ I – Toán Lớp 9',
              subject: 'Toán',
              grade: 9,
              authorName: 'Lê Đắc Minh',
              reviewerName: 'Phan Thanh Nhật',
              currentStepIndex: 7,
              currentStepLabel: 'Bước 7/8: Đã phê duyệt & Xuất hồ sơ chính thức',
              completionPercent: 95,
              dueDate: '2026-10-25',
              status: 'COMPLETED',
            },
          ]);
        } else {
          setExamPlans([]);
          setDossierProgressRows([]);
        }

        const allMembers = data.memberships || [];
        const teacherList = allMembers.filter(
          (m: any) =>
            m.roles?.includes('SUBJECT_TEACHER') || m.roles?.includes('HEAD_OF_DEPARTMENT')
        );
        const firstMember = teacherList[0] || allMembers[0] || null;
        if (firstMember) {
          setSelectedMember(firstMember);
          setPermCheckboxes(firstMember.permissions || []);
          setLevelCheckboxes(
            firstMember.educationLevels || data.educationLevels || ['PRIMARY']
          );
          setSubjectCheckboxes(firstMember.allowedSubjects || []);
          setGradeCheckboxes(firstMember.allowedGrades || []);
          setDossierCheckboxes(firstMember.assignedDossierIds || []);
          setMemberStatus(firstMember.status || 'ACTIVE');
        } else {
          setSelectedMember(null);
        }
      } catch (err: any) {
        setBanner({
          type: 'ERROR',
          message: err?.message || 'Lỗi tải dữ liệu School Admin.',
        });
      } finally {
        setLoading(false);
      }
    },
    [managedSchoolId, actorSchoolAdminId]
  );

  const runQaSuite = useCallback(
    async (notifyUser = false) => {
      setLoading(true);
      try {
        const res = await fetch('/api/school-admin/run-qa-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.ok && data.report) {
          setQaReport(data.report);
          if (notifyUser) {
            setBanner({
              type: 'SUCCESS',
              message: `Hoàn tất kiểm thử Quản trị Đa trường: Đạt ${data.report.passedCount}/${data.report.totalCount} kịch bản!`,
            });
          }
          await loadSchoolAdminWorkspace(managedSchoolId, actorSchoolAdminId);
        }
      } catch (err: any) {
        setBanner({
          type: 'ERROR',
          message: err?.message || 'Lỗi chạy kiểm thử School Admin.',
        });
      } finally {
        setLoading(false);
      }
    },
    [loadSchoolAdminWorkspace, managedSchoolId, actorSchoolAdminId]
  );

  useEffect(() => {
    const nextSchoolId = normalizeRealSchoolId(propSchoolId || ctxSchoolId, propActorUserId);
    const nextAdminId = resolveDefaultAdminIdForSchool(nextSchoolId, propActorUserId);
    setManagedSchoolId(nextSchoolId);
    setActorSchoolAdminId(nextAdminId);
    setNewTeacherForm((prev) => ({
      ...prev,
      grade: nextSchoolId === 'SCHOOL_C' ? 6 : 5,
    }));
    loadSchoolAdminWorkspace(nextSchoolId, nextAdminId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propSchoolId, ctxSchoolId, propActorUserId]);

  const handleSelectMemberForPermission = (m: any) => {
    setSelectedMember(m);
    setPermCheckboxes(m.permissions || []);
    setLevelCheckboxes(m.educationLevels || workspaceData?.educationLevels || ['PRIMARY']);
    setSubjectCheckboxes(m.allowedSubjects || []);
    setGradeCheckboxes(m.allowedGrades || []);
    setDossierCheckboxes(m.assignedDossierIds || []);
    setMemberStatus(m.status || 'ACTIVE');
  };

  const toggleItemInArray = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  // Bật/tắt quyền chức năng — nếu là quyền nhạy cảm (Mục IV) thì mở Modal xác nhận riêng
  const handleTogglePermissionWithSensitiveCheck = (permCode: string) => {
    const permMeta = FUNCTIONAL_PERMISSION_CATALOG.find((p) => p.code === permCode);
    const isCurrentlyChecked = permCheckboxes.includes(permCode);

    if (!isCurrentlyChecked && permMeta?.sensitive) {
      setSensitiveConfirmModal({
        open: true,
        title: `Xác nhận cấp quyền nhạy cảm: ${permMeta.label}`,
        description: `Bạn đang cấp quyền nhạy cảm [${permMeta.code}] cho giáo viên "${selectedMember?.fullName}" tại trường ${workspaceData?.schoolName || managedSchoolId}.`,
        warningItems: [
          permMeta.desc,
          'Quyền này tác động trực tiếp đến quy trình thẩm định hoặc xuất bản đề mật của nhà trường.',
          'Mọi thao tác cấp quyền nhạy cảm đều được ghi vào Nhật ký Kiểm toán (Audit Log).',
        ],
        confirmLabel: `Xác nhận cấp quyền ${permMeta.code}`,
        onConfirm: () => {
          setPermCheckboxes((prev) => toggleItemInArray(prev, permCode));
          setSensitiveConfirmModal(null);
        },
      });
      return;
    }

    setPermCheckboxes((prev) => toggleItemInArray(prev, permCode));
  };

  const executeSaveCheckboxPermissions = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/school-admin/${managedSchoolId}/memberships/${selectedMember.userId}/permissions`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorUserId: actorSchoolAdminId,
            permissions: permCheckboxes,
            educationLevels: levelCheckboxes,
            allowedSubjects: subjectCheckboxes,
            allowedGrades: gradeCheckboxes,
            assignedDossierIds: dossierCheckboxes,
            status: memberStatus,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({ type: 'ERROR', message: data.message || 'Lỗi lưu phân quyền.' });
      } else {
        setBanner({
          type: 'SUCCESS',
          message: `Đã lưu phân quyền cho ${selectedMember.fullName} tại ${workspaceData?.schoolName || managedSchoolId}: ${data.message}`,
        });
        await loadSchoolAdminWorkspace(managedSchoolId, actorSchoolAdminId);
      }
    } catch (err: any) {
      setBanner({ type: 'ERROR', message: err?.message || 'Lỗi kết nối.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCheckboxPermissions = () => {
    if (!selectedMember) return;
    const hasSensitiveChanges =
      memberStatus === 'LOCKED' ||
      permCheckboxes.includes('APPRAISE_EXAM') ||
      permCheckboxes.includes('EXPORT_DOSSIER');

    if (hasSensitiveChanges) {
      setSensitiveConfirmModal({
        open: true,
        title: `Xác nhận lưu cấu hình quyền nhạy cảm cho ${selectedMember.fullName}`,
        description: `Hồ sơ phân quyền của ${selectedMember.fullName} tại trường ${workspaceData?.schoolName || managedSchoolId} có bao gồm quyền nhạy cảm hoặc thay đổi trạng thái hoạt động.`,
        warningItems: [
          `Trạng thái Membership: ${memberStatus === 'ACTIVE' ? 'Đang hoạt động (ACTIVE)' : 'Khóa / Thu hồi quyền (LOCKED)'}`,
          `Quyền nhạy cảm được bật: ${
            permCheckboxes.filter((p) => p === 'APPRAISE_EXAM' || p === 'EXPORT_DOSSIER').join(', ') || 'Không có'
          }`,
          `Phạm vi áp dụng: Chỉ có hiệu lực tại trường ${workspaceData?.schoolName || managedSchoolId} (${managedSchoolId}), không ảnh hưởng tới trường khác.`,
        ],
        confirmLabel: 'Xác nhận & Lưu Phân quyền',
        onConfirm: () => {
          setSensitiveConfirmModal(null);
          executeSaveCheckboxPermissions();
        },
      });
      return;
    }

    executeSaveCheckboxPermissions();
  };

  const handleCreateExamTestByTeacher = async () => {
    if (!selectedMember) return;
    const defaultSubject = subjectCheckboxes[0] || 'Toán';
    const defaultGrade =
      gradeCheckboxes[0] || (managedSchoolId === 'SCHOOL_C' ? 6 : 5);
    const res = await fetch(`/api/school-admin/${managedSchoolId}/create-exam-by-teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorUserId: selectedMember.userId,
        subject: defaultSubject,
        grade: defaultGrade,
      }),
    });
    const data = await res.json();
    setBanner({
      type: res.ok && data.ok ? 'SUCCESS' : 'ERROR',
      message: data.message,
    });
  };

  const handleCreateTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/school-admin/${managedSchoolId}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: actorSchoolAdminId,
          teacherPayload: {
            fullName: newTeacherForm.fullName,
            email: newTeacherForm.email,
            allowedSubjects: [newTeacherForm.subject],
            allowedGrades: [Number(newTeacherForm.grade)],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({ type: 'ERROR', message: data.message });
      } else {
        setBanner({ type: 'SUCCESS', message: data.message });
        setNewTeacherForm({
          fullName: '',
          email: '',
          subject: 'Toán',
          grade: managedSchoolId === 'SCHOOL_C' ? 6 : 5,
        });
        setShowCreateTeacherModal(false);
        await loadSchoolAdminWorkspace(managedSchoolId, actorSchoolAdminId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSampleExcelCsv = () => {
    const defaultGradeStr = managedSchoolId === 'SCHOOL_B' ? '4' : '6,7';
    const defaultDept =
      managedSchoolId === 'SCHOOL_B' ? 'Tổ 4' : 'Tổ khoa học tự nhiên';
    const secondDept =
      managedSchoolId === 'SCHOOL_B' ? 'Tổ 5' : 'Tổ Tiếng Anh - GDTC';
    const secondGradeStr = managedSchoolId === 'SCHOOL_B' ? '5' : '6,7';
    const csvContent = [
      'Họ và tên,Email,Môn giảng dạy,Khối lớp,Tổ chuyên môn',
      `Nguyễn Văn An,nguyenvanan.${managedSchoolId.toLowerCase()}@hue.edu.vn,Toán,"${defaultGradeStr}",${defaultDept}`,
      `Trần Thị Bình,tranthibinh.${managedSchoolId.toLowerCase()}@hue.edu.vn,Tiếng Anh,"${secondGradeStr}",${secondDept}`,
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mau_Nhap_Giao_Vien_${managedSchoolId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCustomExcelRows = async () => {
    const lines = excelRawInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setBanner({
        type: 'ERROR',
        message: 'Vui lòng dán dữ liệu từ Excel hoặc tải tệp CSV/Excel lên trước khi thực hiện nhập.',
      });
      return;
    }

    const parsedRows: any[] = [];
    for (const line of lines) {
      if (line.toLowerCase().startsWith('họ và tên') || line.toLowerCase().startsWith('ho va ten')) {
        continue;
      }
      const parts = line.includes('\t')
        ? line.split('\t').map((s) => s.trim())
        : line.split(',').map((s) => s.replace(/^"|"$/g, '').trim());
      const [fullName, email, subjectStr, gradeStr, deptName] = parts;
      if (!fullName || !email) continue;
      const subjects = subjectStr
        ? subjectStr
            .split(/[;|/]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : ['Toán'];
      const grades = gradeStr
        ? gradeStr
            .split(/[;|/,\s]+/)
            .map((n) => Number(n.trim()))
            .filter((n) => !Number.isNaN(n) && allowedGradesForSchool.includes(n))
        : [allowedGradesForSchool[0]];
      parsedRows.push({
        fullName,
        email,
        roles: ['SUBJECT_TEACHER'],
        subjects: subjects.length > 0 ? subjects : ['Toán'],
        grades: grades.length > 0 ? grades : [allowedGradesForSchool[0]],
        departmentName: deptName || undefined,
        targetSchoolId: managedSchoolId,
      });
    }

    if (parsedRows.length === 0) {
      setBanner({
        type: 'ERROR',
        message: 'Không tìm thấy dòng dữ liệu hợp lệ (cần tối thiểu Họ tên và Email).',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/school-admin/${managedSchoolId}/import-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: actorSchoolAdminId,
          rows: parsedRows,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setExcelImportReport(data.importedResults);
        setExcelRawInput('');
        setBanner({
          type: 'SUCCESS',
          message: `Đã nhập thành công ${data.importedCount} dòng dữ liệu giáo viên vào ${workspaceData?.schoolName || managedSchoolId} (${managedSchoolId}).`,
        });
        await loadSchoolAdminWorkspace(managedSchoolId, actorSchoolAdminId);
      } else {
        setBanner({
          type: 'ERROR',
          message: data.message || 'Lỗi khi nhập danh sách giáo viên từ Excel.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result || '');
      setExcelRawInput(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleAcceptInvitation = async (existingAuthUid: string) => {
    const res = await fetch(`/api/school-admin/${managedSchoolId}/accept-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        existingAuthUid,
        userConsentConfirmed: true,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setBanner({ type: 'SUCCESS', message: data.message });
      await loadSchoolAdminWorkspace(managedSchoolId, actorSchoolAdminId);
    }
  };

  const handleSimulateMultiSchoolLogin = async (emailOrUid: string) => {
    setLoginInputEmailOrUid(emailOrUid);
    const res = await fetch('/api/school-admin/multi-school-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUid }),
    });
    const data = await res.json();
    setLoginResolutionResult(data);
    if (data.loginResolution === 'SINGLE_SCHOOL_AUTO_OPEN' && data.selectedSchoolId) {
      await handleSelectWorkingSchoolForUser(data.authUser.uid, data.selectedSchoolId);
    } else {
      setReloadedSchoolSession(null);
    }
  };

  const handleSelectWorkingSchoolForUser = async (userId: string, targetSchoolId: string) => {
    const res = await fetch('/api/school-admin/select-or-switch-school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetSchoolId }),
    });
    const data = await res.json();
    if (data.ok) {
      setReloadedSchoolSession(data);
      await switchSchool(targetSchoolId, 'user-admin-sys');
      setBanner({
        type: 'SUCCESS',
        message: data.message,
      });
    }
  };

  // --- DỮ LIỆU ĐÃ LỌC & PHÂN TRANG CHO CÁC BẢNG ---
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (deptLevelFilter !== 'ALL' && d.educationLevel !== 'BOTH' && d.educationLevel !== deptLevelFilter) {
        return false;
      }
      if (deptSearch.trim()) {
        const q = deptSearch.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.headTeacherName.toLowerCase().includes(q) ||
          d.subjects.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [departments, deptLevelFilter, deptSearch]);

  const deptTotalPages = Math.max(1, Math.ceil(filteredDepartments.length / deptPageSize));
  const paginatedDepartments = filteredDepartments.slice(
    (Math.min(deptPage, deptTotalPages) - 1) * deptPageSize,
    Math.min(deptPage, deptTotalPages) * deptPageSize
  );

  const filteredTeachers = useMemo(() => {
    const list: any[] = workspaceData?.memberships || [];
    return list.filter((m) => {
      if (teacherStatusFilter !== 'ALL' && m.status !== teacherStatusFilter) return false;
      if (
        teacherSubjectFilter !== 'ALL' &&
        !(m.allowedSubjects || []).includes(teacherSubjectFilter)
      ) {
        return false;
      }
      if (teacherSearch.trim()) {
        const q = teacherSearch.toLowerCase();
        return (
          (m.fullName || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.userId || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [workspaceData, teacherStatusFilter, teacherSubjectFilter, teacherSearch]);

  const teacherTotalPages = Math.max(1, Math.ceil(filteredTeachers.length / teacherPageSize));
  const paginatedTeachers = filteredTeachers.slice(
    (Math.min(teacherPage, teacherTotalPages) - 1) * teacherPageSize,
    Math.min(teacherPage, teacherTotalPages) * teacherPageSize
  );

  const filteredAssignments = useMemo(() => {
    return teachingAssignments.filter((a) => {
      if (assignSubjectFilter !== 'ALL' && a.subject !== assignSubjectFilter) return false;
      if (assignGradeFilter !== 'ALL' && a.grade !== assignGradeFilter) return false;
      if (assignSearch.trim()) {
        const q = assignSearch.toLowerCase();
        return (
          a.teacherName.toLowerCase().includes(q) ||
          a.departmentName.toLowerCase().includes(q) ||
          a.assignedClasses.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [teachingAssignments, assignSubjectFilter, assignGradeFilter, assignSearch]);

  const assignTotalPages = Math.max(1, Math.ceil(filteredAssignments.length / assignPageSize));
  const paginatedAssignments = filteredAssignments.slice(
    (Math.min(assignPage, assignTotalPages) - 1) * assignPageSize,
    Math.min(assignPage, assignTotalPages) * assignPageSize
  );

  const filteredPlans = useMemo(() => {
    return examPlans.filter((p) => {
      if (planSubjectFilter !== 'ALL' && p.subject !== planSubjectFilter) return false;
      if (planDepartmentFilter !== 'ALL' && p.departmentName !== planDepartmentFilter) return false;
      if (planTeacherFilter !== 'ALL' && p.assignedAuthor !== planTeacherFilter) return false;
      if (planPeriodFilter !== 'ALL' && p.examPeriod !== planPeriodFilter) return false;
      if (planSearch.trim()) {
        const q = planSearch.toLowerCase();
        return (
          p.examTitle.toLowerCase().includes(q) ||
          p.planCode.toLowerCase().includes(q) ||
          p.assignedAuthor.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    examPlans,
    planSubjectFilter,
    planDepartmentFilter,
    planTeacherFilter,
    planPeriodFilter,
    planSearch,
  ]);

  const planTotalPages = Math.max(1, Math.ceil(filteredPlans.length / planPageSize));
  const paginatedPlans = filteredPlans.slice(
    (Math.min(planPage, planTotalPages) - 1) * planPageSize,
    Math.min(planPage, planTotalPages) * planPageSize
  );

  const filteredProgress = useMemo(() => {
    return dossierProgressRows.filter((dp) => {
      if (progressStatusFilter !== 'ALL' && dp.status !== progressStatusFilter) return false;
      if (progressSearch.trim()) {
        const q = progressSearch.toLowerCase();
        return (
          dp.examTitle.toLowerCase().includes(q) ||
          dp.dossierCode.toLowerCase().includes(q) ||
          dp.authorName.toLowerCase().includes(q) ||
          dp.subject.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dossierProgressRows, progressStatusFilter, progressSearch]);

  const progressTotalPages = Math.max(1, Math.ceil(filteredProgress.length / progressPageSize));
  const paginatedProgress = filteredProgress.slice(
    (Math.min(progressPage, progressTotalPages) - 1) * progressPageSize,
    Math.min(progressPage, progressTotalPages) * progressPageSize
  );

  const SCHOOL_ADMIN_NAV_ITEMS: Array<{
    id: SchoolAdminPageId;
    order: string;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'PAGE_1_SCHOOL_INFO',
      order: '1',
      label: 'Thông tin trường',
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'PAGE_2_DEPARTMENTS',
      order: '2',
      label: 'Tổ chuyên môn',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'PAGE_3_TEACHER_ACCOUNTS',
      order: '3',
      label: 'Tài khoản giáo viên',
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      id: 'PAGE_4_EXCEL_IMPORT',
      order: '4',
      label: 'Nhập Excel',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
    {
      id: 'PAGE_5_PERMISSIONS',
      order: '5',
      label: 'Phân quyền trực quan',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
    },
    {
      id: 'PAGE_6_TEACHING_ASSIGNMENTS',
      order: '6',
      label: 'Phân công giảng dạy',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      id: 'PAGE_7_EXAM_PLANS',
      order: '7',
      label: 'Kế hoạch kiểm tra',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: 'PAGE_8_DOSSIER_PROGRESS',
      order: '8',
      label: 'Tiến độ hồ sơ',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
  ];

  const resolvedDisplaySchoolName =
    workspaceData?.schoolName ||
    propSchoolName ||
    (managedSchoolId === 'SCHOOL_B'
      ? 'Trường Tiểu học Sịa'
      : managedSchoolId === 'SCHOOL_C'
      ? 'Trường THCS Đặng Dung'
      : 'Trường TH&THCS Nguyễn Đình Anh');

  return (
    <div className="space-y-5">
      {/* Header School Admin */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>QUẢN TRỊ ĐƠN VỊ TRƯỜNG HỌC · {resolvedDisplaySchoolName.toUpperCase()}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Không gian Quản trị Trường học ({resolvedDisplaySchoolName})
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              8 phân khu chuẩn hóa: Thông tin trường · Tổ chuyên môn · Tài khoản giáo viên · Nhập Excel · Phân quyền trực quan · Phân công giảng dạy · Kế hoạch kiểm tra · Tiến độ hồ sơ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow">
              {resolvedDisplaySchoolName} ({managedSchoolId})
            </span>
          </div>
        </div>

        {/* Thanh thông tin phạm vi quản trị của School Admin */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-300">
            Đang quản trị tại:{' '}
            <span className="font-bold text-white">{resolvedDisplaySchoolName}</span> (
            <code className="font-mono text-emerald-300">{managedSchoolId}</code>) · Cơ quan quản lý:{' '}
            <span className="font-semibold text-slate-100">
              {workspaceData?.governingBody ||
                (managedSchoolId === 'SCHOOL_A' ? 'UBND Xã Đan Điền' : 'UBND Xã Quảng Điền')}
            </span>{' '}
            · Quản trị viên:{' '}
            <span className="font-mono font-bold text-amber-300">
              {propActorFullName || actorSchoolAdminId}
            </span>{' '}
            · Tổng số tài khoản trong trường:{' '}
            <span className="font-mono font-bold text-emerald-400">
              {(workspaceData?.memberships || []).length}
            </span>
          </div>
        </div>
      </div>

      {/* V. Thông báo lưu / kết quả thao tác (Toast / Banner) */}
      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-xs ${
            banner.type === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : banner.type === 'ERROR'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {banner.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{banner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="underline ml-4 opacity-75 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* III. Thanh điều hướng 8 Trang Quản trị của School Admin */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-1.5 shadow-2xs">
        {SCHOOL_ADMIN_NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>
                {item.order}. {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TRANG 1: THÔNG TIN TRƯỜNG & CẤU HÌNH TRƯỜNG HỌC                        */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_1_SCHOOL_INFO' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                TRANG 1/8 · THÔNG TIN TRƯỜNG & CẤU HÌNH CHUYÊN MÔN
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Hồ sơ Đơn vị Trường học: {resolvedDisplaySchoolName} ({managedSchoolId})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật thông tin hành chính, cấp học, năm học hiện hành, mẫu ma trận/đặc tả, quy trình phê duyệt và cấu hình AI của trường.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
                Trạng thái: Đang hoạt động
              </span>
            </div>
          </div>

          <SchoolConfigurationModuleWorkspace
            schoolId={managedSchoolId}
            actorUserId={actorSchoolAdminId}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 2: TỔ CHUYÊN MÔN (TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL)          */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_2_DEPARTMENTS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                TRANG 2/8 · QUẢN LÝ TỔ CHUYÊN MÔN
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Danh sách Tổ Chuyên môn tại {resolvedDisplaySchoolName} ({managedSchoolId})
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingDeptModal({
                  id: '',
                  code: `TCM-MOI-${Date.now().toString().slice(-3)}`,
                  name: '',
                  educationLevel:
                    managedSchoolId === 'SCHOOL_C' ? 'LOWER_SECONDARY' : 'PRIMARY',
                  headTeacherName: '',
                  headTeacherEmail: '',
                  subjects: ['Toán'],
                  memberCount: 1,
                  status: 'ACTIVE',
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Tổ chuyên môn
            </button>
          </div>

          {/* Thanh Tìm kiếm & Bộ lọc Tổ chuyên môn */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={deptSearch}
                onChange={(e) => {
                  setDeptSearch(e.target.value);
                  setDeptPage(1);
                }}
                placeholder="Tìm theo mã tổ, tên tổ chuyên môn, tổ trưởng hoặc môn học..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2"
              />
            </div>
            <div className="md:col-span-5">
              <select
                value={deptLevelFilter}
                onChange={(e) => {
                  setDeptLevelFilter(e.target.value as any);
                  setDeptPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả cấp học</option>
                {managedSchoolId !== 'SCHOOL_C' && (
                  <option value="PRIMARY">Tiểu học (Khối 1–5)</option>
                )}
                {managedSchoolId !== 'SCHOOL_B' && (
                  <option value="LOWER_SECONDARY">THCS (Khối 6–9)</option>
                )}
              </select>
            </div>
          </div>

          {/* Bảng Tổ chuyên môn */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3">Mã tổ</th>
                  <th className="py-3 px-3">Tên Tổ chuyên môn</th>
                  <th className="py-3 px-3">Cấp học</th>
                  <th className="py-3 px-3">Tổ trưởng chuyên môn</th>
                  <th className="py-3 px-3">Môn phụ trách</th>
                  <th className="py-3 px-3 text-right">Số GV</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{dept.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3 px-3 text-slate-700">
                      {dept.educationLevel === 'PRIMARY'
                        ? 'Tiểu học'
                        : dept.educationLevel === 'LOWER_SECONDARY'
                        ? 'THCS'
                        : 'Liên cấp'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{dept.headTeacherName}</div>
                      {dept.headTeacherEmail && (
                        <div className="font-mono text-[11px] text-slate-500">
                          {dept.headTeacherEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{dept.subjects.join(', ')}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {dept.memberCount}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          dept.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dept.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingDeptModal(dept)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang Tổ chuyên môn */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-600">
              Hiển thị <strong>{paginatedDepartments.length}</strong> /{' '}
              <strong>{filteredDepartments.length}</strong> tổ chuyên môn
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={deptPage <= 1}
                onClick={() => setDeptPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <span className="font-mono font-bold px-2">
                Trang {deptPage}/{deptTotalPages}
              </span>
              <button
                type="button"
                disabled={deptPage >= deptTotalPages}
                onClick={() => setDeptPage((p) => Math.min(deptTotalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 3: TÀI KHOẢN GIÁO VIÊN (BẢNG CÓ TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL) */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_3_TEACHER_ACCOUNTS' && workspaceData && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                  TRANG 3/8 · QUẢN LÝ TÀI KHOẢN GIÁO VIÊN TRONG TRƯỜNG
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Danh sách Tài khoản Giáo viên tại {resolvedDisplaySchoolName} ({workspaceData.schoolId})
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Quản lý danh sách tài khoản cán bộ, giáo viên thuộc phạm vi đơn vị{' '}
                  <strong>{resolvedDisplaySchoolName}</strong> (
                  {workspaceData.governingBody || 'Thành phố Huế'} · Năm học 2026-2027).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTeacherModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Tạo Tài khoản Giáo viên Mới
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('PAGE_4_EXCEL_IMPORT')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                  Nhập từ Excel
                </button>
              </div>
            </div>

            {/* Thanh tìm kiếm & bộ lọc giáo viên */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => {
                    setTeacherSearch(e.target.value);
                    setTeacherPage(1);
                  }}
                  placeholder="Tìm theo họ tên giáo viên, email hoặc mã định danh (userId)..."
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2"
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={teacherSubjectFilter}
                  onChange={(e) => {
                    setTeacherSubjectFilter(e.target.value);
                    setTeacherPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                >
                  <option value="ALL">Tất cả môn dạy</option>
                  {SUBJECT_CATALOG.map((s) => (
                    <option key={s} value={s}>
                      Môn {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <select
                  value={teacherStatusFilter}
                  onChange={(e) => {
                    setTeacherStatusFilter(e.target.value as any);
                    setTeacherPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="LOCKED">Đã khóa (LOCKED)</option>
                </select>
              </div>
            </div>

            {/* Bảng danh sách Giáo viên */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="p-3">Mã định danh (userId)</th>
                    <th className="p-3">Họ và tên / Email</th>
                    <th className="p-3">Vai trò tại trường</th>
                    <th className="p-3">Môn dạy & Khối lớp</th>
                    <th className="p-3">Quyền chức năng</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedTeachers.map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{m.userId}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.fullName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{m.email}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px] font-semibold text-blue-800">
                        {(m.roles || []).join(', ')}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">
                          Môn: {(m.allowedSubjects || []).join(', ')}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          Khối: {(m.allowedGrades || []).join(', ')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(m.permissions || []).map((p: string) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingTeacherModal(m)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectMemberForPermission(m);
                              setActivePage('PAGE_5_PERMISSIONS');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Phân quyền
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextSt = m.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
                              setSensitiveConfirmModal({
                                open: true,
                                title:
                                  nextSt === 'LOCKED'
                                    ? `Xác nhận Khóa quyền thành viên của ${m.fullName}`
                                    : `Xác nhận Mở khóa quyền thành viên của ${m.fullName}`,
                                description: `Thao tác này sẽ chuyển trạng thái membership của ${m.fullName} tại trường ${resolvedDisplaySchoolName} sang [${nextSt}].`,
                                warningItems: [
                                  'Không xóa dữ liệu câu hỏi hoặc hồ sơ đề kiểm tra do giáo viên này đã tạo.',
                                  'Không ảnh hưởng tới quyền của giáo viên tại các trường học khác trên hệ thống.',
                                ],
                                confirmLabel:
                                  nextSt === 'LOCKED' ? 'Xác nhận Khóa' : 'Xác nhận Mở khóa',
                                onConfirm: async () => {
                                  setSensitiveConfirmModal(null);
                                  await fetch(
                                    `/api/school-admin/${managedSchoolId}/memberships/${m.userId}/permissions`,
                                    {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        actorUserId: actorSchoolAdminId,
                                        permissions: m.permissions || [],
                                        educationLevels:
                                          m.educationLevels ||
                                          workspaceData?.educationLevels || ['PRIMARY'],
                                        allowedSubjects: m.allowedSubjects || [],
                                        allowedGrades: m.allowedGrades || [],
                                        assignedDossierIds: m.assignedDossierIds || [],
                                        status: nextSt,
                                      }),
                                    }
                                  );
                                  setBanner({
                                    type: 'SUCCESS',
                                    message: `Đã cập nhật trạng thái membership của ${m.fullName} thành ${nextSt}.`,
                                  });
                                  await loadSchoolAdminWorkspace(
                                    managedSchoolId,
                                    actorSchoolAdminId
                                  );
                                },
                              });
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                              m.status === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {m.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang danh sách Giáo viên */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <span>
                  Hiển thị <strong>{paginatedTeachers.length}</strong> /{' '}
                  <strong>{filteredTeachers.length}</strong> tài khoản
                </span>
                <select
                  value={teacherPageSize}
                  onChange={(e) => {
                    setTeacherPageSize(Number(e.target.value));
                    setTeacherPage(1);
                  }}
                  className="rounded border border-slate-300 px-2 py-1 bg-white font-mono"
                >
                  {[5, 10, 20, 50].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz} dòng/trang
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={teacherPage <= 1}
                  onClick={() => setTeacherPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trước
                </button>
                <span className="font-mono font-bold px-2">
                  Trang {teacherPage}/{teacherTotalPages}
                </span>
                <button
                  type="button"
                  disabled={teacherPage >= teacherTotalPages}
                  onClick={() => setTeacherPage((p) => Math.min(teacherTotalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  Sau
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 4: NHẬP EXCEL & QUY TRÌNH MỜI TÀI KHOẢN HIỆN CÓ                 */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_4_EXCEL_IMPORT' && workspaceData && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                TRANG 4/8 · NHẬP DANH SÁCH GIÁO VIÊN TỪ EXCEL
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Nhập danh sách Giáo viên từ Excel tại {resolvedDisplaySchoolName} ({workspaceData.schoolId})
              </h2>
              <p className="text-slate-600 mt-0.5">
                Tải lên tệp CSV/Excel hoặc dán trực tiếp danh sách giáo viên của{' '}
                <strong>{resolvedDisplaySchoolName}</strong>. Mật khẩu mặc định khởi tạo:{' '}
                <code className="font-mono font-bold text-blue-700">Gv@2026#Edu</code>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleExcelCsv}
                className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Tải tệp mẫu Excel/CSV ({workspaceData.schoolId})
              </button>
              <label className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Chọn tệp CSV/Excel từ máy</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleExcelFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block font-bold text-slate-800">
              Dán dữ liệu từ bảng tính Excel hoặc chỉnh sửa danh sách trước khi nhập vào{' '}
              {resolvedDisplaySchoolName} (Định dạng: Họ và tên, Email, Môn dạy, Khối lớp, Tổ chuyên môn):
            </label>
            <textarea
              rows={5}
              value={excelRawInput}
              onChange={(e) => setExcelRawInput(e.target.value)}
              placeholder={`Ví dụ:\nNguyễn Văn An, nguyenvanan.${managedSchoolId.toLowerCase()}@hue.edu.vn, Toán, ${
                managedSchoolId === 'SCHOOL_B' ? '4' : '6|7'
              }, ${managedSchoolId === 'SCHOOL_B' ? 'Tổ 4' : 'Tổ khoa học tự nhiên'}`}
              className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleImportCustomExcelRows}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Thực thi Nhập Danh sách Giáo viên vào {resolvedDisplaySchoolName}
              </button>
            </div>
          </div>

          {excelImportReport ? (
            <div className="space-y-2.5">
              <div className="font-bold text-slate-900">Kết quả xử lý từng dòng Excel:</div>
              {excelImportReport.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border ${
                    item.outcome === 'REJECTED_FOREIGN_SCHOOL_ID'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : item.outcome === 'EXISTING_AUTH_EMAIL_INVITED_NO_DUPLICATE_UID'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      Dòng #{idx + 1}: {item.fullName} ({item.email})
                    </span>
                    <span className="font-mono text-[11px]">
                      {item.outcome} · duplicateUidCreated: {String(item.duplicateUidCreated)}
                    </span>
                  </div>
                  <div className="mt-1">{item.reason}</div>
                  {item.invitation && item.invitation.status === 'INVITED_PENDING_CONSENT' && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptInvitation(item.existingAuthUid)}
                        className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                      >
                        Xác nhận sự đồng ý của Giáo viên (Kích hoạt Membership với UID gốc{' '}
                        {item.existingAuthUid})
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
              <div className="text-sm font-bold text-slate-800">
                Sẵn sàng nhập danh sách Giáo viên cho {resolvedDisplaySchoolName} ({workspaceData.schoolId})
              </div>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Bạn có thể tải tệp mẫu CSV/Excel hoặc sao chép trực tiếp các dòng từ tệp Excel vào ô bên trên rồi nhấn nút{' '}
                <strong>"Thực thi Nhập Danh sách Giáo viên vào {resolvedDisplaySchoolName}"</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 5: IV. PHÂN QUYỀN TRỰC QUAN (CHECKBOX, SWITCH, CẤP/MÔN/KHỐI, XÁC NHẬN RIÊNG) */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_5_PERMISSIONS' && workspaceData && selectedMember && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                TRANG 5/8 · MỤC IV. PHÂN QUYỀN TRỰC QUAN (CHECKBOX · SWITCH · XÁC NHẬN QUYỀN NHẠY CẢM)
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Ma trận Phân quyền Trực quan tại {workspaceData.schoolName} ({workspaceData.schoolId})
              </h2>
              <p className="text-slate-600 mt-0.5">
                Sử dụng Checkbox, Switch, Chọn cấp học, Chọn môn, Chọn khối và Chọn quyền chức năng. Các quyền nhạy cảm bắt buộc có bước xác nhận riêng.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Chọn giáo viên:</span>
              <select
                value={selectedMember.userId}
                onChange={(e) => {
                  const found = (workspaceData.memberships || []).find(
                    (m: any) => m.userId === e.target.value
                  );
                  if (found) handleSelectMemberForPermission(found);
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                {(workspaceData.memberships || []).map((m: any) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName} ({m.userId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hàng Switch điều khiển chính sách nhanh (Mục IV: Sử dụng Switch) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">1. Switch Trạng thái Hoạt động</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Cho phép giáo viên truy cập dữ liệu của trường {workspaceData.schoolId}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMemberStatus((prev) => (prev === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'))
                }
                className="cursor-pointer shrink-0"
              >
                {memberStatus === 'ACTIVE' ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-rose-500" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">2. Switch Khóa phạm vi Môn & Khối</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Chỉ cho phép tạo câu hỏi & đề trong đúng môn/khối đã tích chọn
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStrictScopeSwitch((prev) => !prev)}
                className="cursor-pointer shrink-0"
              >
                {strictScopeSwitch ? (
                  <ToggleRight className="w-8 h-8 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">3. Switch Cấp hạn mức AI (Gemini)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Cho phép sử dụng hạn mức AI của trường để gợi ý và thẩm định câu hỏi
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !enableAiQuotaSwitch;
                  setEnableAiQuotaSwitch(next);
                  setAllowCrossGradeReviewSwitch(false);
                }}
                className="cursor-pointer shrink-0"
              >
                {enableAiQuotaSwitch ? (
                  <ToggleRight className="w-8 h-8 text-indigo-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cột 1: Chọn quyền chức năng (Có đánh dấu quyền nhạy cảm cần xác nhận riêng) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="font-bold text-slate-900 uppercase flex items-center justify-between">
                <span>Chọn Quyền Chức năng (Checkbox)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  Có xác nhận quyền nhạy cảm
                </span>
              </div>
              {FUNCTIONAL_PERMISSION_CATALOG.map((item) => {
                const checked = permCheckboxes.includes(item.code);
                return (
                  <label
                    key={item.code}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                      checked
                        ? item.sensitive
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-white border-blue-300'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePermissionWithSensitiveCheck(item.code)}
                      className="mt-0.5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.sensitive && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                            Nhạy cảm
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Cột 2: Chọn Cấp học & Chọn Môn học */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="space-y-2">
                <div className="font-bold text-slate-900 uppercase">Chọn Cấp học</div>
                {(
                  (Array.isArray(workspaceData?.educationLevels) &&
                  workspaceData.educationLevels.length > 0
                    ? workspaceData.educationLevels
                    : managedSchoolId === 'SCHOOL_B'
                    ? ['PRIMARY']
                    : managedSchoolId === 'SCHOOL_C'
                    ? ['LOWER_SECONDARY']
                    : ['PRIMARY', 'LOWER_SECONDARY']) as ('PRIMARY' | 'LOWER_SECONDARY')[]
                ).map((lvl) => (
                  <label
                    key={lvl}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={levelCheckboxes.includes(lvl)}
                      onChange={() =>
                        setLevelCheckboxes(toggleItemInArray(levelCheckboxes, lvl))
                      }
                    />
                    <span className="font-semibold text-slate-800">
                      {lvl === 'PRIMARY'
                        ? 'Cấp Tiểu học (PRIMARY · Lớp 1–5)'
                        : 'Cấp THCS (LOWER_SECONDARY · Lớp 6–9)'}
                    </span>
                  </label>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="font-bold text-slate-900 uppercase">Chọn Môn học phụ trách</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUBJECT_CATALOG.map((subj) => (
                    <label
                      key={subj}
                      className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer ${
                        subjectCheckboxes.includes(subj)
                          ? 'bg-blue-50 border-blue-300 font-semibold text-blue-950'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={subjectCheckboxes.includes(subj)}
                        onChange={() =>
                          setSubjectCheckboxes(toggleItemInArray(subjectCheckboxes, subj))
                        }
                      />
                      <span className="truncate">{subj}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột 3: Chọn Khối lớp & Hồ sơ được giao */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div>
                <div className="font-bold text-slate-900 uppercase mb-2">
                  Chọn Khối lớp được phép thao tác
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {allowedGradesForSchool.map((g) => (
                    <label
                      key={g}
                      className={`px-2.5 py-1.5 rounded-lg border cursor-pointer font-mono font-bold text-center ${
                        gradeCheckboxes.includes(g)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={gradeCheckboxes.includes(g)}
                        onChange={() =>
                          setGradeCheckboxes(toggleItemInArray(gradeCheckboxes, g))
                        }
                      />
                      Khối {g}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="font-bold text-slate-900 uppercase mb-2">
                  Hồ sơ đề được giao phụ trách
                </div>
                <div className="space-y-1.5">
                  {(workspaceData.availableExamsForDossierAssignment || []).map((ex: any) => (
                    <label
                      key={ex.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={dossierCheckboxes.includes(ex.id)}
                        onChange={() =>
                          setDossierCheckboxes(toggleItemInArray(dossierCheckboxes, ex.id))
                        }
                      />
                      <span className="font-mono text-[11px] font-bold text-blue-700">
                        {ex.code}:
                      </span>
                      <span className="truncate text-slate-800">{ex.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Switch Phản biện chéo khối lớp:
                </span>
                <button
                  type="button"
                  onClick={() => setAllowCrossGradeReviewSwitch((prev) => !prev)}
                  className="cursor-pointer"
                >
                  {allowCrossGradeReviewSwitch ? (
                    <ToggleRight className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCreateExamTestByTeacher}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Kiểm tra quyền: Thử Tạo Đề dưới tài khoản {selectedMember.fullName}
            </button>
            <button
              type="button"
              onClick={handleSaveCheckboxPermissions}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Lưu Phân quyền cho {selectedMember.fullName}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 6: PHÂN CÔNG GIẢNG DẠY (TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL)     */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_6_TEACHING_ASSIGNMENTS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                TRANG 6/8 · PHÂN CÔNG GIẢNG DẠY THEO MÔN, KHỐI & LỚP
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Bảng Phân công Giảng dạy Năm học Hiện hành ({workspaceData?.schoolName || managedSchoolId})
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingAssignmentModal({
                  id: '',
                  teacherId: 'uid_gv_moi',
                  teacherName: '',
                  teacherEmail: '',
                  departmentName: 'Tổ Toán – Tin học & Công nghệ',
                  educationLevel: 'PRIMARY',
                  subject: 'Toán',
                  grade: 5,
                  assignedClasses: '5A1, 5A2',
                  semester: 'CA_NAM',
                  weeklyPeriods: 15,
                  status: 'ACTIVE',
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Phân công Giảng dạy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={assignSearch}
                onChange={(e) => {
                  setAssignSearch(e.target.value);
                  setAssignPage(1);
                }}
                placeholder="Tìm theo tên giáo viên, tổ chuyên môn, lớp phụ trách..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={assignSubjectFilter}
                onChange={(e) => {
                  setAssignSubjectFilter(e.target.value);
                  setAssignPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả môn học</option>
                {SUBJECT_CATALOG.map((s) => (
                  <option key={s} value={s}>
                    Môn {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={assignGradeFilter}
                onChange={(e) => {
                  setAssignGradeFilter(
                    e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                  );
                  setAssignPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả khối lớp</option>
                {allowedGradesForSchool.map((g) => (
                  <option key={g} value={g}>
                    Khối {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Giáo viên</th>
                  <th className="p-3">Tổ chuyên môn</th>
                  <th className="p-3">Môn dạy</th>
                  <th className="p-3">Khối</th>
                  <th className="p-3">Lớp được phân công</th>
                  <th className="p-3">Học kỳ</th>
                  <th className="p-3 text-right">Số tiết/tuần</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedAssignments.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.teacherName}</div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {row.teacherEmail}
                      </div>
                    </td>
                    <td className="p-3 text-slate-700">{row.departmentName}</td>
                    <td className="p-3 font-semibold text-blue-800">{row.subject}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">Khối {row.grade}</td>
                    <td className="p-3 font-mono text-slate-800">{row.assignedClasses}</td>
                    <td className="p-3 text-slate-700">
                      {row.semester === 'CA_NAM' ? 'Cả năm' : row.semester}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">{row.weeklyPeriods}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingAssignmentModal(row)}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-600">
              Hiển thị <strong>{paginatedAssignments.length}</strong> /{' '}
              <strong>{filteredAssignments.length}</strong> bản phân công
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={assignPage <= 1}
                onClick={() => setAssignPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <span className="font-mono font-bold px-2">
                Trang {assignPage}/{assignTotalPages}
              </span>
              <button
                type="button"
                disabled={assignPage >= assignTotalPages}
                onClick={() => setAssignPage((p) => Math.min(assignTotalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 7: KẾ HOẠCH KIỂM TRA (TÌM KIẾM, BỘ LỌC, PHÂN TRANG, MODAL)       */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_7_EXAM_PLANS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                TRANG 7/8 · KẾ HOẠCH KIỂM TRA ĐỊNH KỲ CẤP TRƯỜNG
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Danh mục Kế hoạch Ra đề & Phản biện Định kỳ ({workspaceData?.schoolName || managedSchoolId})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const defaultTeachers = (workspaceData?.memberships || []).map(
                  (m: any) => m.fullName
                );
                setEditingPlanModal({
                  id: '',
                  planCode: `KH-MOI-${Date.now().toString().slice(-3)}`,
                  examPeriod: 'GIUA_KY_1',
                  examTitle: '',
                  subject: 'Toán',
                  grade: allowedGradesForSchool[0] || 5,
                  departmentName: departments[0]?.name || 'Tổ chuyên môn',
                  durationMinutes: 45,
                  assignedAuthor: defaultTeachers[0] || '',
                  assignedReviewer: defaultTeachers[1] || defaultTeachers[0] || '',
                  dueDate: '2026-12-25',
                  status: 'DANG_SOAN',
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo Kế hoạch Kiểm tra
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div className="md:col-span-12 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={planSearch}
                onChange={(e) => {
                  setPlanSearch(e.target.value);
                  setPlanPage(1);
                }}
                placeholder="Tìm theo mã kế hoạch, tên kỳ kiểm tra, môn học, giáo viên ra đề..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-600 mb-1">3. Môn học:</label>
              <select
                value={planSubjectFilter}
                onChange={(e) => {
                  setPlanSubjectFilter(e.target.value);
                  setPlanPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả môn học (Tiểu học & THCS)</option>
                {SUBJECT_CATALOG.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-600 mb-1">4. Tổ chuyên môn:</label>
              <select
                value={planDepartmentFilter}
                onChange={(e) => {
                  setPlanDepartmentFilter(e.target.value);
                  setPlanPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả tổ chuyên môn</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-600 mb-1">5. Giáo viên:</label>
              <select
                value={planTeacherFilter}
                onChange={(e) => {
                  setPlanTeacherFilter(e.target.value);
                  setPlanPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả giáo viên</option>
                {(workspaceData?.memberships || []).map((m: any) => (
                  <option key={m.userId || m.email} value={m.fullName}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-600 mb-1">6. Kỳ kiểm tra:</label>
              <select
                value={planPeriodFilter}
                onChange={(e) => {
                  setPlanPeriodFilter(e.target.value);
                  setPlanPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả kỳ kiểm tra</option>
                <option value="GIUA_KY_1">Giữa học kỳ 1</option>
                <option value="CUOI_KY_1">Cuối học kỳ 1</option>
                <option value="GIUA_KY_2">Giữa học kỳ 2</option>
                <option value="CUOI_KY_2">Cuối học kỳ 2</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Mã KH</th>
                  <th className="p-3">Tên kỳ kiểm tra</th>
                  <th className="p-3">Môn · Khối · Tổ CM</th>
                  <th className="p-3">GV Ra đề</th>
                  <th className="p-3">Người thẩm định</th>
                  <th className="p-3">Hạn nộp</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{plan.planCode}</td>
                    <td className="p-3 font-bold text-slate-900">{plan.examTitle}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {plan.subject} · Khối {plan.grade} ({plan.durationMinutes}p)
                      {plan.departmentName && (
                        <div className="text-[11px] font-normal text-slate-500">
                          {plan.departmentName}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-800">{plan.assignedAuthor}</td>
                    <td className="p-3 text-slate-700">{plan.assignedReviewer}</td>
                    <td className="p-3 font-mono text-slate-700">{plan.dueDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          plan.status === 'DA_PHE_DUYET'
                            ? 'bg-emerald-100 text-emerald-900'
                            : plan.status === 'CHO_THAM_DINH'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {plan.status === 'DA_PHE_DUYET'
                          ? 'Đã phê duyệt'
                          : plan.status === 'CHO_THAM_DINH'
                          ? 'Chờ thẩm định'
                          : plan.status === 'DANG_SOAN'
                          ? 'Đang biên soạn'
                          : 'Chưa bắt đầu'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingPlanModal(plan)}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 8: TIẾN ĐỘ HỒ SƠ ĐỀ KIỂM TRA (TÌM KIẾM, BỘ LỌC, PHÂN TRANG)      */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_8_DOSSIER_PROGRESS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-blue-700">
                TRANG 8/8 · GIÁM SÁT TIẾN ĐỘ HỒ SƠ ĐỀ KIỂM TRA (8 BƯỚC CHUẨN)
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Tiến độ Hoàn thành Hồ sơ Đề kiểm tra tại {workspaceData?.schoolName || managedSchoolId}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={progressSearch}
                onChange={(e) => {
                  setProgressSearch(e.target.value);
                  setProgressPage(1);
                }}
                placeholder="Tìm theo mã hồ sơ, tên đề kiểm tra, môn học, giáo viên..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2"
              />
            </div>
            <div className="md:col-span-5">
              <select
                value={progressStatusFilter}
                onChange={(e) => {
                  setProgressStatusFilter(e.target.value);
                  setProgressPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="ALL">Tất cả trạng thái tiến độ</option>
                <option value="COMPLETED">Đã hoàn thành & Xuất hồ sơ</option>
                <option value="PENDING_APPROVAL">Đang chờ thẩm định / phê duyệt</option>
                <option value="NEEDS_REVISION">Cần chỉnh sửa bổ sung</option>
                <option value="ON_TRACK">Đang thực hiện đúng hạn</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Mã hồ sơ</th>
                  <th className="p-3">Tên Hồ sơ Đề kiểm tra</th>
                  <th className="p-3">Môn · Khối</th>
                  <th className="p-3">Giáo viên / Người duyệt</th>
                  <th className="p-3 min-w-[220px]">Bước hiện tại & Tiến độ</th>
                  <th className="p-3">Hạn nộp</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedProgress.map((dp) => (
                  <tr key={dp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{dp.dossierCode}</td>
                    <td className="p-3 font-bold text-slate-900">{dp.examTitle}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {dp.subject} · Khối {dp.grade}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{dp.authorName}</div>
                      <div className="text-[11px] text-slate-500">Duyệt: {dp.reviewerName}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-medium text-slate-700">{dp.currentStepLabel}</span>
                        <span className="font-mono font-bold text-blue-700">
                          {dp.completionPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${dp.completionPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{dp.dueDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          dp.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : dp.status === 'NEEDS_REVISION'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {dp.status === 'COMPLETED'
                          ? 'Hoàn thành'
                          : dp.status === 'NEEDS_REVISION'
                          ? 'Cần sửa lại'
                          : dp.status === 'PENDING_APPROVAL'
                          ? 'Chờ duyệt'
                          : 'Đúng tiến độ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TRANG 9: CHUYỂN TRƯỜNG & BÁO CÁO KIỂM THỬ MỤC VI                       */}
      {/* ===================================================================== */}
      {activePage === 'PAGE_9_QA_TEST_SUITE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Kiểm thử Chuyển Trường Làm Việc & Cô lập Dữ liệu Đa Trường (Mục VI)
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSimulateMultiSchoolLogin('gv1.tha@tieuhoca.edu.vn')}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                1. Đăng nhập GV thuộc 1 trường (gv1.tha@tieuhoca.edu.vn → Mở thẳng Trường A)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateMultiSchoolLogin('lanhuong.gv@edutest.vn')}
                className="px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer"
              >
                2. Đăng nhập GV thuộc 2 trường (lanhuong.gv@edutest.vn / uid_gv_shared_ab → Hiện màn hình Chọn trường)
              </button>
            </div>

            {loginResolutionResult && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Kết quả Đăng nhập: {loginResolutionResult.message}
                  </span>
                  <span className="font-mono px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                    {loginResolutionResult.loginResolution}
                  </span>
                </div>

                {loginResolutionResult.loginResolution === 'MULTI_SCHOOL_SELECTOR_REQUIRED' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(loginResolutionResult.availableMemberships || []).map((mem: any) => (
                      <div
                        key={mem.id}
                        className="p-3.5 rounded-lg bg-white border border-purple-300 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{mem.schoolName}</div>
                          <div className="font-mono text-[11px] text-slate-500">
                            schoolId: {mem.schoolId} · Môn: {mem.allowedSubjects?.join(', ')} · Khối: {mem.allowedGrades?.join(', ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectWorkingSchoolForUser(mem.userId, mem.schoolId)
                          }
                          className="px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer"
                        >
                          Chuyển sang trường này
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {reloadedSchoolSession && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                    <div className="font-bold">
                      Đã nạp Quyền & Dữ liệu của trường:{' '}
                      {reloadedSchoolSession.reloadedSchoolData?.schoolName} (
                      {reloadedSchoolSession.reloadedSchoolData?.schoolId})
                    </div>
                    <div className="font-mono text-[11px]">
                      Cấp học: [{reloadedSchoolSession.reloadedSchoolData?.educationLevels?.join(', ')}] · Môn dạy: [
                      {reloadedSchoolSession.reloadedSchoolData?.allowedSubjects?.join(', ')}] · Khối lớp: [
                      {reloadedSchoolSession.reloadedSchoolData?.allowedGrades?.join(', ')}]
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {qaReport && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    VI. Báo cáo Nghiệm thu Quản trị Đa trường & Phân quyền
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cấu hình: Trường A ({qaReport.schoolATeacherCount} GV) · Trường B (
                    {qaReport.schoolBTeacherCount} GV) · Giáo viên thuộc cả 2 trường:{' '}
                    <span className="font-semibold text-purple-800">
                      {qaReport.sharedTeacherProfile?.fullName} (UID:{' '}
                      {qaReport.sharedTeacherProfile?.userId})
                    </span>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                  ĐẠT {qaReport.passedCount}/{qaReport.totalCount} KỊCH BẢN (100%)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {(qaReport.testCases || []).map((tc: any) => (
                  <div
                    key={tc.code}
                    className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{tc.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                        {tc.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="text-slate-700">
                      <strong>Kịch bản:</strong> {tc.scenario}
                    </div>
                    <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200 text-emerald-950">
                      <strong>Kết quả thực tế:</strong> {tc.actual}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* CÁC MODAL CHỈNH SỬA & MODAL XÁC NHẬN THAO TÁC NGUY HIỂM (MỤC IV & V)   */}
      {/* ===================================================================== */}

      {/* 1. Modal Tạo Tài khoản Giáo viên mới */}
      {showCreateTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTeacherSubmit}
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Tạo Tài khoản Giáo viên Mới ({workspaceData?.schoolName || managedSchoolId})
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateTeacherModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ và tên giáo viên *</label>
              <input
                type="text"
                required
                value={newTeacherForm.fullName}
                onChange={(e) =>
                  setNewTeacherForm({ ...newTeacherForm, fullName: e.target.value })
                }
                placeholder="VD: Cô Nguyễn Thị Minh Tâm"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email đăng nhập *</label>
              <input
                type="email"
                required
                value={newTeacherForm.email}
                onChange={(e) =>
                  setNewTeacherForm({ ...newTeacherForm, email: e.target.value })
                }
                placeholder="VD: minhtam.gv@edutest.vn"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn giảng dạy</label>
                <select
                  value={newTeacherForm.subject}
                  onChange={(e) =>
                    setNewTeacherForm({ ...newTeacherForm, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {SUBJECT_CATALOG.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={newTeacherForm.grade}
                  onChange={(e) =>
                    setNewTeacherForm({ ...newTeacherForm, grade: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {allowedGradesForSchool.map((g) => (
                    <option key={g} value={g}>
                      Khối {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateTeacherModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Lưu & Tạo Tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Modal Chỉnh sửa Giáo viên */}
      {editingTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Chỉnh sửa Hồ sơ Thành viên ({editingTeacherModal.userId})
              </h3>
              <button
                type="button"
                onClick={() => setEditingTeacherModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={editingTeacherModal.fullName || ''}
                onChange={(e) =>
                  setEditingTeacherModal({ ...editingTeacherModal, fullName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editingTeacherModal.email || ''}
                onChange={(e) =>
                  setEditingTeacherModal({ ...editingTeacherModal, email: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingTeacherModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSelectMemberForPermission(editingTeacherModal);
                  setEditingTeacherModal(null);
                  setBanner({
                    type: 'SUCCESS',
                    message: `Đã lưu cập nhật thông tin giáo viên ${editingTeacherModal.fullName}.`,
                  });
                }}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Chỉnh sửa Tổ chuyên môn */}
      {editingDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDeptModal.id ? 'Chỉnh sửa Tổ chuyên môn' : 'Thêm Tổ chuyên môn Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDeptModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã tổ chuyên môn</label>
              <input
                type="text"
                value={editingDeptModal.code}
                onChange={(e) =>
                  setEditingDeptModal({ ...editingDeptModal, code: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên Tổ chuyên môn</label>
              <input
                type="text"
                value={editingDeptModal.name}
                onChange={(e) =>
                  setEditingDeptModal({ ...editingDeptModal, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tổ trưởng chuyên môn</label>
              <input
                type="text"
                value={editingDeptModal.headTeacherName}
                onChange={(e) =>
                  setEditingDeptModal({
                    ...editingDeptModal,
                    headTeacherName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingDeptModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingDeptModal.id) {
                    setDepartments((prev) =>
                      prev.map((d) => (d.id === editingDeptModal.id ? editingDeptModal : d))
                    );
                  } else {
                    setDepartments((prev) => [
                      ...prev,
                      { ...editingDeptModal, id: `dept-${Date.now()}` },
                    ]);
                  }
                  setBanner({
                    type: 'SUCCESS',
                    message: `Đã lưu thông tin Tổ chuyên môn "${editingDeptModal.name}".`,
                  });
                  setEditingDeptModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
              >
                Lưu Tổ chuyên môn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Chỉnh sửa Phân công Giảng dạy */}
      {editingAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingAssignmentModal.id
                  ? 'Cập nhật Phân công Giảng dạy'
                  : 'Thêm Phân công Giảng dạy'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAssignmentModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ tên giáo viên</label>
              <input
                type="text"
                value={editingAssignmentModal.teacherName}
                onChange={(e) =>
                  setEditingAssignmentModal({
                    ...editingAssignmentModal,
                    teacherName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                <select
                  value={editingAssignmentModal.subject}
                  onChange={(e) =>
                    setEditingAssignmentModal({
                      ...editingAssignmentModal,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {SUBJECT_CATALOG.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={editingAssignmentModal.grade}
                  onChange={(e) =>
                    setEditingAssignmentModal({
                      ...editingAssignmentModal,
                      grade: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {allowedGradesForSchool.map((g) => (
                    <option key={g} value={g}>
                      Khối {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Các lớp phụ trách</label>
              <input
                type="text"
                value={editingAssignmentModal.assignedClasses}
                onChange={(e) =>
                  setEditingAssignmentModal({
                    ...editingAssignmentModal,
                    assignedClasses: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingAssignmentModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingAssignmentModal.id) {
                    setTeachingAssignments((prev) =>
                      prev.map((a) =>
                        a.id === editingAssignmentModal.id ? editingAssignmentModal : a
                      )
                    );
                  } else {
                    setTeachingAssignments((prev) => [
                      ...prev,
                      { ...editingAssignmentModal, id: `ta-${Date.now()}` },
                    ]);
                  }
                  setBanner({
                    type: 'SUCCESS',
                    message: `Đã lưu phân công giảng dạy cho giáo viên ${editingAssignmentModal.teacherName}.`,
                  });
                  setEditingAssignmentModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
              >
                Lưu Phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Chỉnh sửa Kế hoạch Kiểm tra */}
      {editingPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPlanModal.id
                  ? 'Chỉnh sửa Kế hoạch Kiểm tra'
                  : 'Tạo Kế hoạch Kiểm tra Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlanModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên kỳ kiểm tra</label>
              <input
                type="text"
                value={editingPlanModal.examTitle}
                onChange={(e) =>
                  setEditingPlanModal({ ...editingPlanModal, examTitle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kỳ kiểm tra</label>
                <select
                  value={editingPlanModal.examPeriod}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      examPeriod: e.target.value as ExamPlanRow['examPeriod'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="GIUA_KY_1">Giữa học kỳ 1</option>
                  <option value="CUOI_KY_1">Cuối học kỳ 1</option>
                  <option value="GIUA_KY_2">Giữa học kỳ 2</option>
                  <option value="CUOI_KY_2">Cuối học kỳ 2</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                <select
                  value={editingPlanModal.subject}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {SUBJECT_CATALOG.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tổ chuyên môn</label>
                <select
                  value={editingPlanModal.departmentName || departments[0]?.name || ''}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      departmentName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={editingPlanModal.grade}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      grade: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {allowedGradesForSchool.map((g) => (
                    <option key={g} value={g}>
                      Khối {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo viên ra đề</label>
                <select
                  value={editingPlanModal.assignedAuthor}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      assignedAuthor: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {(workspaceData?.memberships || []).map((m: any) => (
                    <option key={m.userId || m.email} value={m.fullName}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Người thẩm định</label>
                <select
                  value={editingPlanModal.assignedReviewer}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      assignedReviewer: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {(workspaceData?.memberships || []).map((m: any) => (
                    <option key={m.userId || m.email} value={m.fullName}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingPlanModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingPlanModal.id) {
                    setExamPlans((prev) =>
                      prev.map((p) => (p.id === editingPlanModal.id ? editingPlanModal : p))
                    );
                  } else {
                    setExamPlans((prev) => [
                      ...prev,
                      { ...editingPlanModal, id: `ep-${Date.now()}` },
                    ]);
                  }
                  setBanner({
                    type: 'SUCCESS',
                    message: `Đã lưu kế hoạch kiểm tra "${editingPlanModal.examTitle}".`,
                  });
                  setEditingPlanModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
              >
                Lưu Kế hoạch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Xác nhận Quyền nhạy cảm & Thao tác nguy hiểm (Mục IV & V) */}
      {sensitiveConfirmModal && sensitiveConfirmModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-amber-400 max-w-lg w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-700">
                  XÁC NHẬN RIÊNG CHO QUYỀN NHẠY CẢM / THAO TÁC QUẢN TRỊ
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {sensitiveConfirmModal.title}
                </h3>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {sensitiveConfirmModal.description}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-amber-950">
              <div className="font-bold">Lưu ý bảo mật & phạm vi ảnh hưởng:</div>
              <ul className="list-disc list-inside space-y-1">
                {sensitiveConfirmModal.warningItems.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSensitiveConfirmModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy thao tác
              </button>
              <button
                type="button"
                onClick={sensitiveConfirmModal.onConfirm}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
              >
                {sensitiveConfirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
