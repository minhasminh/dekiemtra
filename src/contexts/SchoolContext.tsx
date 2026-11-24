import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export type EducationLevelCode = 'PRIMARY' | 'LOWER_SECONDARY' | 'UPPER_SECONDARY';

export interface PlatformMembershipRecord {
  id: string;
  userId: string;
  userFullName: string;
  email: string;
  schoolId: string;
  schoolName: string;
  roles: string[];
  permissions: string[];
  departmentId: string;
  departmentName: string;
  allowedSubjects: string[];
  allowedGrades: number[];
  isSuperAdmin: boolean;
  canReadConfidentialExam: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  updatedAt: string;
}

export interface TenantSchoolDisplayData {
  schoolDoc: any;
  questions: any[];
  matrices: any[];
  specifications: any[];
  exams: any[];
  hiddenConfidentialExamCount: number;
  examPlans: any[];
  examWorkflows: any[];
  approvals: any[];
  examResults: any[];
  counts: {
    users: number;
    departments: number;
    permissions: number;
    questions: number;
    matrices: number;
    specifications: number;
    exams: number;
    visibleExams: number;
    hiddenConfidentialExams: number;
    examWorkflows: number;
    examPlans: number;
    approvals: number;
    examResults: number;
  };
}

export interface SchoolContextState {
  // 6 thuộc tính chuẩn Mục III (SCHOOL CONTEXT)
  activeSchoolId: string;
  schoolName: string;
  educationLevels: EducationLevelCode[];
  academicYearId: string;
  currentMembership: PlatformMembershipRecord | null;
  currentPermissions: string[];

  // Trạng thái vận hành & cô lập dữ liệu khi chuyển trường
  tenantDisplayCache: TenantSchoolDisplayData | null;
  activeSubscriptionCount: number;
  isSwitchingSchool: boolean;
  lastSwitchSteps: string[];
  lastSwitchError: string | null;

  // Các hành động điều khiển SchoolContext
  switchSchool: (targetSchoolId: string, actorUserId?: string) => Promise<{
    ok: boolean;
    message: string;
  }>;
  registerSchoolSubscription: (subscriptionId: string, unsubscribeFn: () => void) => void;
  clearOldSchoolDisplayCache: () => void;
  cancelInvalidSubscriptions: () => number;
  validateWriteSchoolScope: (payloadSchoolId: string) => {
    allowed: boolean;
    reason: string;
  };
}

const DEFAULT_SCHOOL_ID = 'sch-th-thcs-nguyen-du';
const DEFAULT_SCHOOL_NAME = 'Trường TH &THCS Nguyễn Đình Anh';

const SchoolContext = createContext<SchoolContextState | undefined>(undefined);

export const SchoolContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSchoolId, setActiveSchoolId] = useState<string>(DEFAULT_SCHOOL_ID);
  const [schoolName, setSchoolName] = useState<string>(DEFAULT_SCHOOL_NAME);
  const [educationLevels, setEducationLevels] = useState<EducationLevelCode[]>(['PRIMARY', 'LOWER_SECONDARY']);
  const [academicYearId, setAcademicYearId] = useState<string>('2026-2027');
  const [currentMembership, setCurrentMembership] = useState<PlatformMembershipRecord | null>({
    id: `user-admin-sys_${DEFAULT_SCHOOL_ID}`,
    userId: 'user-admin-sys',
    userFullName: 'Nguyễn Đình Anh (Hiệu trưởng / Quản trị hệ thống)',
    email: 'hieutruong@nguyendinhanh.edu.vn',
    schoolId: DEFAULT_SCHOOL_ID,
    schoolName: DEFAULT_SCHOOL_NAME,
    roles: ['PRINCIPAL', 'SYSTEM_ADMIN'],
    permissions: [
      'CREATE_QUESTION',
      'CREATE_MATRIX',
      'CREATE_EXAM',
      'APPRAISE_EXAM',
      'APPROVE_FINAL_EXAM',
      'MANAGE_USERS',
      'MANAGE_PERMISSIONS',
    ],
    departmentId: 'dept-bgh-qt',
    departmentName: 'Ban Giám hiệu và quản trị',
    allowedSubjects: ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Khoa học tự nhiên', 'Lịch sử và Địa lí', 'Tin học'],
    allowedGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    isSuperAdmin: true,
    canReadConfidentialExam: false,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  });
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([
    'CREATE_QUESTION',
    'CREATE_MATRIX',
    'CREATE_EXAM',
    'APPRAISE_EXAM',
    'APPROVE_FINAL_EXAM',
    'MANAGE_USERS',
    'MANAGE_PERMISSIONS',
  ]);
  const [tenantDisplayCache, setTenantDisplayCache] = useState<TenantSchoolDisplayData | null>(null);
  const [isSwitchingSchool, setIsSwitchingSchool] = useState<boolean>(false);
  const [lastSwitchSteps, setLastSwitchSteps] = useState<string[]>([]);
  const [lastSwitchError, setLastSwitchError] = useState<string | null>(null);

  // Quản lý danh sách subscription theo trường hiện tại để hủy ngay khi chuyển trường
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const [activeSubscriptionCount, setActiveSubscriptionCount] = useState<number>(0);

  const registerSchoolSubscription = useCallback((subscriptionId: string, unsubscribeFn: () => void) => {
    subscriptionsRef.current.set(subscriptionId, unsubscribeFn);
    setActiveSubscriptionCount(subscriptionsRef.current.size);
  }, []);

  // Bước 1 khi chuyển trường: Xóa dữ liệu trường cũ khỏi bộ nhớ hiển thị
  const clearOldSchoolDisplayCache = useCallback(() => {
    setTenantDisplayCache(null);
  }, []);

  // Bước 2 khi chuyển trường: Hủy các subscription không còn hợp lệ của trường cũ
  const cancelInvalidSubscriptions = useCallback((): number => {
    const count = subscriptionsRef.current.size;
    subscriptionsRef.current.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // Ignore cleanup errors
      }
    });
    subscriptionsRef.current.clear();
    setActiveSubscriptionCount(0);
    return count;
  }, []);

  // Bước 5 khi chuyển trường: Không cho phép lưu dữ liệu cũ vào nhầm trường
  const validateWriteSchoolScope = useCallback(
    (payloadSchoolId: string) => {
      if (!payloadSchoolId || !payloadSchoolId.startsWith('sch-')) {
        return {
          allowed: false,
          reason: `Từ chối lưu: "${payloadSchoolId}" không phải là mã schoolId hợp lệ (Nguyên tắc 4 & 5: Không dùng tên trường làm khóa chính).`,
        };
      }
      if (payloadSchoolId !== activeSchoolId) {
        return {
          allowed: false,
          reason: `Chặn lưu nhầm trường: Dữ liệu đang soạn thuộc trường "${payloadSchoolId}" nhưng ngữ cảnh đang hoạt động là "${activeSchoolId}" (${schoolName}).`,
        };
      }
      if (!currentMembership || currentMembership.schoolId !== activeSchoolId || currentMembership.status !== 'ACTIVE') {
        return {
          allowed: false,
          reason: `Chặn lưu: Không tìm thấy tư cách thành viên hợp lệ (platformMemberships) tại trường "${activeSchoolId}".`,
        };
      }
      return {
        allowed: true,
        reason: `Hợp lệ: Dữ liệu khớp với ngữ cảnh trường "${activeSchoolId}" (${schoolName}).`,
      };
    },
    [activeSchoolId, schoolName, currentMembership]
  );

  // Quy trình chuyển đổi trường an toàn 5 bước theo Mục III
  const switchSchool = useCallback(
    async (targetSchoolId: string, actorUserId = 'user-admin-sys') => {
      setIsSwitchingSchool(true);
      setLastSwitchError(null);

      const previousSchoolId = activeSchoolId;

      // 1. Xóa dữ liệu trường cũ khỏi bộ nhớ hiển thị
      clearOldSchoolDisplayCache();

      // 2. Hủy các subscription không còn hợp lệ của trường cũ
      const cancelledSubCount = cancelInvalidSubscriptions();

      try {
        // 3 & 4. Gọi Backend xác thực platformMemberships, tải quyền mới và tải dữ liệu mới
        const res = await fetch('/api/stage19/multi-tenant/switch-school', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorUserId,
            previousSchoolId,
            targetSchoolId,
          }),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          const errMsg =
            data.message || `Từ chối chuyển sang trường "${targetSchoolId}" do không có tư cách thành viên hợp lệ.`;
          setLastSwitchError(errMsg);
          setIsSwitchingSchool(false);
          return {
            ok: false,
            message: errMsg,
          };
        }

        const ctx = data.schoolContext;
        setActiveSchoolId(ctx.activeSchoolId);
        setSchoolName(ctx.schoolName);
        setEducationLevels(ctx.educationLevels || ['PRIMARY']);
        setAcademicYearId(ctx.academicYearId || '2026-2027');
        setCurrentMembership(ctx.currentMembership || null);
        setCurrentPermissions(ctx.currentPermissions || []);
        setTenantDisplayCache(data.tenantData || null);

        // Đăng ký subscription mới cho trường vừa chuyển sang
        const subId = `firestore_sub_${ctx.activeSchoolId}_${Date.now()}`;
        registerSchoolSubscription(subId, () => {});

        const steps: string[] = Array.isArray(data.transitionStepsExecuted)
          ? data.transitionStepsExecuted
          : [
              `1. Đã xóa cache hiển thị của trường cũ (${previousSchoolId}).`,
              `2. Đã hủy ${cancelledSubCount} subscription của trường cũ.`,
              `3. Đã tải tư cách thành viên & quyền mới (${(ctx.currentPermissions || []).length} quyền).`,
              `4. Đã tải dữ liệu cô lập của trường "${ctx.schoolName}" (${ctx.activeSchoolId}).`,
              `5. Đã kích hoạt khóa chống lưu nhầm dữ liệu sang trường khác.`,
            ];
        setLastSwitchSteps(steps);
        setIsSwitchingSchool(false);

        return {
          ok: true,
          message: `Đã chuyển sang "${ctx.schoolName}" (${ctx.activeSchoolId}) an toàn.`,
        };
      } catch (err: any) {
        const msg = err?.message || 'Lỗi kết nối khi chuyển đổi trường học.';
        setLastSwitchError(msg);
        setIsSwitchingSchool(false);
        return {
          ok: false,
          message: msg,
        };
      }
    },
    [activeSchoolId, clearOldSchoolDisplayCache, cancelInvalidSubscriptions, registerSchoolSubscription]
  );

  // Tải ngữ cảnh trường mặc định khi khởi tạo
  useEffect(() => {
    switchSchool(DEFAULT_SCHOOL_ID, 'user-admin-sys');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        activeSchoolId,
        schoolName,
        educationLevels,
        academicYearId,
        currentMembership,
        currentPermissions,
        tenantDisplayCache,
        activeSubscriptionCount,
        isSwitchingSchool,
        lastSwitchSteps,
        lastSwitchError,
        switchSchool,
        registerSchoolSubscription,
        clearOldSchoolDisplayCache,
        cancelInvalidSubscriptions,
        validateWriteSchoolScope,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export function useSchoolContext(): SchoolContextState {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    throw new Error('useSchoolContext must be used within a SchoolContextProvider');
  }
  return ctx;
}
