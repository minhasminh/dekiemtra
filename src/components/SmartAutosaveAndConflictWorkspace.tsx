import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  FileEdit,
  GitBranch,
  GitMerge,
  History,
  Lock,
  Play,
  RefreshCw,
  Save,
  ShieldAlert,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import {
  AUTOSAVE_STATE_META,
  Autosave8ScenarioSuiteReport,
  AutosaveEntityContent,
  AutosaveManagedRecord,
  AutosaveVisualStateCode,
  branchApprovedRecordForEditService,
  ConflictDetailPayload,
  ConflictResolutionStrategy,
  fetchAutosaveEntitiesService,
  resolveDataConflictService,
  runAutosave8ScenariosQaService,
  saveEntityWithOccTransactionService,
  simulateColleagueConcurrentUpdateService,
} from '../services/firebase/smartAutosaveAndConflictService';
import { ToastNotification } from '../types/domain';

interface SmartAutosaveAndConflictWorkspaceProps {
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: string;
  schoolId?: string;
  onNotify?: (type: ToastNotification['type'], title: string, message: string) => void;
}

const LOCAL_OFFLINE_DRAFT_STORAGE_KEY = 'edutest_smart_autosave_offline_draft_v1';

export const SmartAutosaveAndConflictWorkspace: React.FC<
  SmartAutosaveAndConflictWorkspaceProps
> = ({
  currentUserId = 'uid_gv_nd_thcs_002',
  currentUserName = 'Thầy Trần Quốc Tuấn (GV KHTN – Máy tính A)',
  currentUserRole = 'TEACHER',
  schoolId = 'sch-th-thcs-nguyen-du',
  onNotify,
}) => {
  const [entities, setEntities] = useState<AutosaveManagedRecord[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('as_question_khtn8_01');
  const [loadingEntities, setLoadingEntities] = useState<boolean>(false);

  // Cấu hình thời gian Debounce không thao tác (Mục II)
  const [debounceMs, setDebounceMs] = useState<number>(1500);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(true);

  // Trạng thái trình soạn thảo & phiên bản cơ sở (expectedBaseVersion)
  const [editingContent, setEditingContent] = useState<AutosaveEntityContent>({
    title: '',
    mainBodyText: '',
    answerOrRubricKey: '',
    pointsOrMatrixAllocation: '',
    professionalNote: '',
  });
  const [expectedBaseVersion, setExpectedBaseVersion] = useState<number>(1);
  const [visualState, setVisualState] = useState<AutosaveVisualStateCode>('SERVER_CONFIRMED');
  const [statusBannerDetail, setStatusBannerDetail] = useState<string>(
    'Dữ liệu đồng bộ với phiên bản trên máy chủ Cloud Firestore.'
  );

  // Bộ đếm chứng minh không ghi Firestore sau mỗi ký tự (Mục II)
  const [totalKeystrokesCount, setTotalKeystrokesCount] = useState<number>(0);
  const [pendingBatchKeystrokes, setPendingBatchKeystrokes] = useState<number>(0);
  const [totalServerWritesCount, setTotalServerWritesCount] = useState<number>(0);

  // Dữ liệu xung đột phiên bản (Mục IV & V)
  const [activeConflict, setActiveConflict] = useState<ConflictDetailPayload | null>(null);
  const [manualMergeDraft, setManualMergeDraft] = useState<AutosaveEntityContent | null>(null);
  const [resolvingConflict, setResolvingConflict] = useState<boolean>(false);

  // Bộ kiểm thử 8 kịch bản bắt buộc (Mục VII)
  const [qaSuiteReport, setQaSuiteReport] = useState<Autosave8ScenarioSuiteReport | null>(null);
  const [runningQaSuite, setRunningQaSuite] = useState<boolean>(false);

  const debounceTimerRef = useRef<number | null>(null);
  const isDirtyRef = useRef<boolean>(false);

  const selectedRecord = useMemo(
    () => entities.find((e) => e.entityId === selectedEntityId) || entities[0] || null,
    [entities, selectedEntityId]
  );

  const loadEntitiesFromServer = useCallback(
    async (keepCurrentSelection = true, targetIdOverride?: string) => {
      setLoadingEntities(true);
      try {
        const res = await fetchAutosaveEntitiesService(schoolId);
        setEntities(res.entities);
        const targetId = targetIdOverride || (keepCurrentSelection ? selectedEntityId : 'as_question_khtn8_01');
        const found = res.entities.find((e) => e.entityId === targetId) || res.entities[0];
        if (found && !isDirtyRef.current) {
          setSelectedEntityId(found.entityId);
          setEditingContent(found.content);
          setExpectedBaseVersion(found.version);
          setVisualState('SERVER_CONFIRMED');
          setStatusBannerDetail(
            `Đã xác nhận lưu trên máy chủ (${found.versionLabel} · SHA-256: ${found.sha256Digest}).`
          );
        }
      } catch (err: unknown) {
        if (onNotify) {
          onNotify(
            'error',
            'Lỗi tải dữ liệu Autosave',
            err instanceof Error ? err.message : 'Không thể kết nối máy chủ.'
          );
        }
      } finally {
        setLoadingEntities(false);
      }
    },
    [schoolId, selectedEntityId, onNotify]
  );

  useEffect(() => {
    void loadEntitiesFromServer(false);
  }, [loadEntitiesFromServer]);

  const executeServerSaveTransaction = useCallback(
    async (
      contentToSave: AutosaveEntityContent,
      baseVer: number,
      batchKeys: number,
      triggerSource: 'DEBOUNCED_AUTOSAVE' | 'MANUAL_SAVE' | 'RECONNECT_SYNC'
    ) => {
      if (!selectedRecord) return;

      // Nếu đang mất mạng (Mục III): Giữ bản nháp cục bộ, hiển thị "Đang chờ đồng bộ", KHÔNG báo "Đã lưu"
      if (!isNetworkOnline) {
        setVisualState('PENDING_SYNC');
        setStatusBannerDetail(
          'Mất kết nối mạng: Đã giữ nội dung trong bộ nhớ nháp cục bộ và đang chờ đồng bộ lên máy chủ (Không hiển thị "Đã lưu").'
        );
        try {
          localStorage.setItem(
            LOCAL_OFFLINE_DRAFT_STORAGE_KEY,
            JSON.stringify({
              entityId: selectedRecord.entityId,
              expectedBaseVersion: baseVer,
              content: contentToSave,
              savedOfflineAt: new Date().toISOString(),
              batchKeys,
            })
          );
        } catch {
          // Bỏ qua lỗi quota localStorage nếu có
        }
        return;
      }

      setVisualState('SAVING');
      setStatusBannerDetail('Đang thực thi Transaction kiểm tra phiên bản và ghi lên Cloud Firestore...');

      try {
        const res = await saveEntityWithOccTransactionService({
          schoolId,
          entityId: selectedRecord.entityId,
          expectedBaseVersion: baseVer,
          actorUid: currentUserId,
          actorName: currentUserName,
          actorRole: currentUserRole,
          content: contentToSave,
          keystrokesCountInBatch: Math.max(1, batchKeys),
          triggerSource,
        });

        setTotalServerWritesCount((c) => c + 1);
        setPendingBatchKeystrokes(0);

        if (res.ok && res.record) {
          isDirtyRef.current = false;
          setVisualState('SERVER_CONFIRMED');
          setExpectedBaseVersion(res.record.version);
          setEditingContent(res.record.content);
          setActiveConflict(null);
          setManualMergeDraft(null);
          setStatusBannerDetail(res.message);
          localStorage.removeItem(LOCAL_OFFLINE_DRAFT_STORAGE_KEY);

          setEntities((prev) =>
            prev.map((item) => (item.entityId === res.record!.entityId ? res.record! : item))
          );
          return;
        }

        // Trường hợp có xung đột phiên bản (HTTP 409 - Mục IV & V)
        if (res.outcomeCode === 'CONFLICT_DETECTED_409' && res.conflict) {
          setVisualState('CONFLICT_DETECTED');
          setActiveConflict(res.conflict);
          setManualMergeDraft({
            title: res.conflict.latestServerContent.title,
            mainBodyText: `${res.conflict.editingLocalContent.mainBodyText}\n--- [Hợp nhất thủ công với bản ${res.record?.versionLabel || ''}] ---\n${res.conflict.latestServerContent.mainBodyText}`,
            answerOrRubricKey: res.conflict.latestServerContent.answerOrRubricKey,
            pointsOrMatrixAllocation: res.conflict.latestServerContent.pointsOrMatrixAllocation,
            professionalNote: `Đã kiểm tra và hợp nhất thủ công giữa ${currentUserName} và ${res.conflict.latestServerUpdatedByName}`,
          });
          setStatusBannerDetail(res.message);
          if (res.record) {
            setEntities((prev) =>
              prev.map((item) => (item.entityId === res.record!.entityId ? res.record! : item))
            );
          }
          if (onNotify) {
            onNotify('warning', 'Phát hiện xung đột dữ liệu (HTTP 409)', res.message);
          }
          return;
        }

        // Trường hợp hồ sơ đã phê duyệt bị khóa ghi đè (HTTP 403 - Mục VI)
        if (res.outcomeCode === 'APPROVED_RECORD_LOCKED_403') {
          setVisualState('SAVE_FAILED');
          setStatusBannerDetail(res.message);
          if (onNotify) {
            onNotify('error', 'Chặn Autosave ghi đè hồ sơ đã phê duyệt', res.message);
          }
          return;
        }

        setVisualState('SAVE_FAILED');
        setStatusBannerDetail(res.message || 'Lưu thất bại.');
      } catch (err: unknown) {
        setVisualState('SAVE_FAILED');
        setStatusBannerDetail(
          err instanceof Error ? err.message : 'Lỗi kết nối khi lưu lên máy chủ.'
        );
      }
    },
    [
      selectedRecord,
      isNetworkOnline,
      schoolId,
      currentUserId,
      currentUserName,
      currentUserRole,
      onNotify,
    ]
  );

  // Khi người dùng chỉnh sửa trường nội dung: Đánh dấu thay đổi & hẹn giờ Debounce (không ghi mỗi ký tự)
  const handleFieldChange = (field: keyof AutosaveEntityContent, value: string) => {
    const nextContent: AutosaveEntityContent = {
      ...editingContent,
      [field]: value,
    };
    setEditingContent(nextContent);
    isDirtyRef.current = true;

    const nextBatchKeys = pendingBatchKeystrokes + 1;
    setTotalKeystrokesCount((k) => k + 1);
    setPendingBatchKeystrokes(nextBatchKeys);

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    if (!isNetworkOnline) {
      setVisualState('PENDING_SYNC');
      setStatusBannerDetail(
        `Đang mất mạng: Đã lưu tạm ${nextBatchKeys} thao tác gõ vào bộ đệm cục bộ (Đang chờ đồng bộ — Không báo "Đã lưu").`
      );
      try {
        localStorage.setItem(
          LOCAL_OFFLINE_DRAFT_STORAGE_KEY,
          JSON.stringify({
            entityId: selectedEntityId,
            expectedBaseVersion,
            content: nextContent,
            savedOfflineAt: new Date().toISOString(),
            batchKeys: nextBatchKeys,
          })
        );
      } catch {
        // ignore
      }
      return;
    }

    setVisualState('UNSAVED');
    setStatusBannerDetail(
      `Chưa lưu: Đã ghi nhận ${nextBatchKeys} thao tác gõ. Sẽ tự động lưu sau ${debounceMs}ms ngừng gõ...`
    );

    debounceTimerRef.current = window.setTimeout(() => {
      void executeServerSaveTransaction(
        nextContent,
        expectedBaseVersion,
        nextBatchKeys,
        'DEBOUNCED_AUTOSAVE'
      );
    }, debounceMs);
  };

  // Xử lý chuyển đổi trạng thái mạng Online / Offline (Mục III)
  const handleToggleNetworkMode = async (nextOnline: boolean) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    setIsNetworkOnline(nextOnline);

    if (!nextOnline) {
      if (isDirtyRef.current) {
        setVisualState('PENDING_SYNC');
        setStatusBannerDetail(
          'Cảnh báo mất kết nối mạng: Nội dung đang soạn được giữ an toàn trong bộ nhớ đệm cục bộ và đang chờ đồng bộ.'
        );
      } else {
        setStatusBannerDetail(
          'Đang ở chế độ Mất kết nối mạng (Offline). Mọi chỉnh sửa mới sẽ được giữ trong bản nháp cục bộ.'
        );
      }
      if (onNotify) {
        onNotify(
          'warning',
          'Mất kết nối mạng (Chế độ Offline)',
          'Hệ thống giữ nguyên nội dung đang soạn và chuyển sang trạng thái "Đang chờ đồng bộ".'
        );
      }
      return;
    }

    // Khi kết nối mạng trở lại: Nếu có bản nháp đang chờ đồng bộ thì tự động thử đồng bộ với kiểm soát phiên bản OCC
    if (isDirtyRef.current || visualState === 'PENDING_SYNC') {
      if (onNotify) {
        onNotify(
          'info',
          'Đã kết nối mạng trở lại',
          'Đang kiểm tra phiên bản trên máy chủ và đồng bộ bản nháp cục bộ...'
        );
      }
      await executeServerSaveTransaction(
        editingContent,
        expectedBaseVersion,
        Math.max(1, pendingBatchKeystrokes),
        'RECONNECT_SYNC'
      );
    } else {
      setStatusBannerDetail('Đã kết nối mạng trở lại. Trạng thái đồng bộ ổn định.');
    }
  };

  const handleSelectEntity = (entity: AutosaveManagedRecord) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    isDirtyRef.current = false;
    setSelectedEntityId(entity.entityId);
    setEditingContent(entity.content);
    setExpectedBaseVersion(entity.version);
    setActiveConflict(null);
    setManualMergeDraft(null);
    setPendingBatchKeystrokes(0);
    setVisualState('SERVER_CONFIRMED');
    setStatusBannerDetail(
      `Đang mở [${entity.entityTypeVietnamese}] · Phiên bản máy chủ: ${entity.versionLabel} (SHA-256: ${entity.sha256Digest}).`
    );
  };

  // Giả lập Giáo viên B lưu phiên bản mới trên máy tính khác trong lúc Giáo viên A đang sửa (Mục IV & VII.6)
  const handleSimulateColleagueEditOnServer = async () => {
    if (!selectedRecord) return;
    try {
      const res = await simulateColleagueConcurrentUpdateService({
        schoolId,
        entityId: selectedRecord.entityId,
      });
      setEntities((prev) =>
        prev.map((item) => (item.entityId === res.record.entityId ? res.record : item))
      );
      setStatusBannerDetail(
        `Cảnh báo đồng thời: Máy chủ vừa tăng lên ${res.record.versionLabel} bởi ${res.record.updatedByName}, trong khi trình soạn thảo của bạn vẫn ở v${expectedBaseVersion}. Hãy bấm "Lưu ngay / Kiểm tra xung đột" hoặc gõ thêm để thấy hệ thống chặn ghi đè!`
      );
      if (onNotify) {
        onNotify('warning', 'Đồng nghiệp vừa cập nhật trên máy chủ', res.message);
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Lỗi giả lập đồng nghiệp sửa',
          err instanceof Error ? err.message : 'Không thể thực hiện.'
        );
      }
    }
  };

  // Xử lý 1 trong 3 lựa chọn giải quyết xung đột (Mục V)
  const handleResolveConflict = async (strategy: ConflictResolutionStrategy) => {
    if (!selectedRecord || !activeConflict) return;
    setResolvingConflict(true);
    try {
      const res = await resolveDataConflictService({
        schoolId,
        entityId: selectedRecord.entityId,
        strategy,
        actorUid: currentUserId,
        actorName: currentUserName,
        actorRole: currentUserRole,
        editingLocalContent: editingContent,
        manualMergedContent: manualMergeDraft || editingContent,
      });

      isDirtyRef.current = false;
      setActiveConflict(null);
      setManualMergeDraft(null);
      setVisualState('SERVER_CONFIRMED');
      setStatusBannerDetail(res.message);

      await loadEntitiesFromServer(
        true,
        res.copiedRecord ? res.copiedRecord.entityId : res.primaryRecord.entityId
      );
      setEditingContent(
        res.copiedRecord ? res.copiedRecord.content : res.primaryRecord.content
      );
      setExpectedBaseVersion(
        res.copiedRecord ? res.copiedRecord.version : res.primaryRecord.version
      );

      if (onNotify) {
        onNotify('success', 'Đã xử lý xung đột dữ liệu an toàn', res.message);
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Lỗi xử lý xung đột',
          err instanceof Error ? err.message : 'Không thể hoàn tất.'
        );
      }
    } finally {
      setResolvingConflict(false);
    }
  };

  // Tách nhánh phiên bản mới cho hồ sơ đã phê duyệt (Mục VI)
  const handleBranchApprovedRecord = async () => {
    if (!selectedRecord) return;
    try {
      const res = await branchApprovedRecordForEditService({
        schoolId,
        entityId: selectedRecord.entityId,
        actorUid: currentUserId,
        actorName: currentUserName,
        actorRole: currentUserRole,
        changeReason: 'Chỉnh sửa nội dung chuyên môn và trình thẩm định lại phiên bản mới',
        proposedContent: editingContent,
      });
      isDirtyRef.current = false;
      setEntities((prev) =>
        prev.map((item) => (item.entityId === res.record.entityId ? res.record : item))
      );
      setEditingContent(res.record.content);
      setExpectedBaseVersion(res.record.version);
      setVisualState('SERVER_CONFIRMED');
      setStatusBannerDetail(res.message);
      if (onNotify) {
        onNotify('success', 'Đã tạo nhánh phiên bản mới & yêu cầu thẩm định lại', res.message);
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Không thể tạo phiên bản mới',
          err instanceof Error ? err.message : 'Lỗi máy chủ.'
        );
      }
    }
  };

  // Chạy bộ kiểm thử 8 kịch bản bắt buộc (Mục VII)
  const handleRun8ScenariosQa = async () => {
    setRunningQaSuite(true);
    try {
      const report = await runAutosave8ScenariosQaService(schoolId);
      setQaSuiteReport(report);
      isDirtyRef.current = false;
      await loadEntitiesFromServer(true);
      if (onNotify) {
        onNotify(
          report.overallPassed ? 'success' : 'warning',
          `Hoàn tất Kiểm thử 8 Kịch bản Autosave (${report.passedCount}/${report.totalScenarios} ĐẠT)`,
          'Đã xác minh đầy đủ: Tự lưu Debounce, Tải lại trang, Đồng bộ máy khác, Mất mạng, Kết nối lại, Xung đột 2 giáo viên, Hồ sơ đã duyệt và Lịch sử phiên bản.'
        );
      }
    } catch (err: unknown) {
      if (onNotify) {
        onNotify(
          'error',
          'Lỗi chạy kiểm thử 8 kịch bản',
          err instanceof Error ? err.message : 'Không thể thực thi.'
        );
      }
    } finally {
      setRunningQaSuite(false);
    }
  };

  const renderVisualStateBadge = (code: AutosaveVisualStateCode) => {
    const meta = AUTOSAVE_STATE_META[code];
    switch (code) {
      case 'SERVER_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{meta.label}</span>
          </span>
        );
      case 'SAVING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            <span>{meta.label}</span>
          </span>
        );
      case 'UNSAVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{meta.label}</span>
          </span>
        );
      case 'PENDING_SYNC':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <WifiOff className="w-4 h-4 text-amber-700" />
            <span>{meta.label}</span>
          </span>
        );
      case 'CONFLICT_DETECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{meta.label}</span>
          </span>
        );
      case 'SAVE_FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{meta.label}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Smart Autosave & Conflict Control */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>EDU TEST AI</span>
              <span aria-hidden="true">·</span>
              <span>Smart Autosave &amp; Conflict Control</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">Optimistic Concurrency (OCC)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <GitMerge className="w-6 h-6 text-blue-700 shrink-0" />
              <span>HỆ THỐNG TỰ ĐỘNG LƯU VÀ KIỂM SOÁT XUNG ĐỘT DỮ LIỆU</span>
            </h1>
            <p className="text-sm text-slate-600 max-w-4xl">
              Bảo vệ dữ liệu soạn thảo trên 7 phạm vi nghiệp vụ (Câu hỏi, Ngữ liệu, Ma trận, Bản đặc tả, Đề kiểm tra, Hướng dẫn chấm, Góp ý thẩm định): Tự động lưu sau khoảng ngừng gõ (Debounce), giữ bản nháp khi mất mạng, phát hiện xung đột phiên bản đa người dùng và khóa bất biến hồ sơ đã phê duyệt.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void loadEntitiesFromServer(true)}
              disabled={loadingEntities}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingEntities ? 'animate-spin' : ''}`} />
              <span>Tải lại từ máy chủ</span>
            </button>

            <button
              type="button"
              onClick={() => void handleRun8ScenariosQa()}
              disabled={runningQaSuite}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>
                {runningQaSuite
                  ? 'Đang chạy 8 kịch bản kiểm thử...'
                  : 'Chạy Kiểm thử 8 Kịch bản (Mục VII)'}
              </span>
            </button>
          </div>
        </div>

        {/* Thanh chỉ số thực tế: 6 Trạng thái lưu, Bộ đếm gõ phím vs Số lần ghi Firestore, Cấu hình Debounce & Chế độ Mạng */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5">
            <div className="text-xs text-slate-500">Trạng thái lưu hiện tại (Mục II)</div>
            <div>{renderVisualStateBadge(visualState)}</div>
            <div className="text-[11px] text-slate-600 leading-snug">{statusBannerDetail}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
            <div className="text-xs text-slate-500">
              Chứng minh không ghi mỗi ký tự (Mục II)
            </div>
            <div className="flex items-baseline gap-3 pt-0.5">
              <div>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {totalKeystrokesCount}
                </span>
                <span className="text-xs text-slate-600 ml-1">phím gõ</span>
              </div>
              <span className="text-slate-400">→</span>
              <div>
                <span className="text-xl font-bold font-mono tabular-nums text-blue-700">
                  {totalServerWritesCount}
                </span>
                <span className="text-xs text-slate-600 ml-1">lần ghi Firestore</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Đang gom nhóm chờ lưu: {pendingBatchKeystrokes} ký tự
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Thời gian chờ tự lưu (Debounce):</span>
              <span className="font-mono font-bold text-slate-900">{debounceMs} ms</span>
            </div>
            <div className="flex gap-1.5">
              {[1000, 1500, 2500].map((ms) => (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setDebounceMs(ms)}
                  className={`flex-1 py-1 text-xs font-mono rounded border cursor-pointer ${
                    debounceMs === ms
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {ms}ms
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Kết nối mạng (Mục III):</span>
              <span
                className={`font-semibold ${
                  isNetworkOnline ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {isNetworkOnline ? 'Đang trực tuyến (Online)' : 'Mất mạng (Offline)'}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => void handleToggleNetworkMode(true)}
                className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded border cursor-pointer ${
                  isNetworkOnline
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Trực tuyến</span>
              </button>
              <button
                type="button"
                onClick={() => void handleToggleNetworkMode(false)}
                className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded border cursor-pointer ${
                  !isNetworkOnline
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Giả lập Mất mạng</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mục I: Chọn 1 trong 7 phạm vi đối tượng áp dụng Autosave & Kiểm soát xung đột */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            I. Phạm vi 7 loại đối tượng áp dụng Tự động lưu &amp; Kiểm soát xung đột
          </h2>
          <span className="text-xs text-slate-500">
            Chọn đối tượng bên dưới để chỉnh sửa trực tiếp hoặc kiểm thử xung đột
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {entities.map((ent) => {
            const active = selectedRecord?.entityId === ent.entityId;
            return (
              <button
                key={ent.entityId}
                type="button"
                onClick={() => handleSelectEntity(ent)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold leading-snug">
                  {ent.entityTypeVietnamese}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/30 flex items-center justify-between text-[11px] font-mono">
                  <span>{ent.versionLabel}</span>
                  <span>
                    {ent.approvalStatus === 'APPROVED' ? 'ĐÃ DUYỆT' : ent.approvalStatus}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* GIAO DIỆN XUNG ĐỘT DỮ LIỆU SONG SONG & 3 LỰA CHỌN XỬ LÝ (MỤC IV & V) */}
      {activeConflict && (
        <section className="bg-white border-2 border-rose-300 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-4 border-b border-rose-200">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <ShieldAlert className="w-4 h-4" />
                <span>
                  PHÁT HIỆN XUNG ĐỘT PHIÊN BẢN (HTTP 409) · ĐÃ DỪNG GHI ĐÈ TỰ ĐỘNG (MỤC IV &amp; V)
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                So sánh Phiên bản đang chỉnh sửa (v{activeConflict.expectedBaseVersion}) và Phiên bản mới nhất trên máy chủ (v{activeConflict.latestServerVersion})
              </h2>
              <p className="text-xs text-slate-700">
                Người cập nhật gần nhất trên máy chủ:{' '}
                <strong className="text-slate-900">
                  {activeConflict.latestServerUpdatedByName}
                </strong>{' '}
                · Thời gian cập nhật:{' '}
                <span className="font-mono">
                  {new Date(activeConflict.latestServerUpdatedAt).toLocaleString('vi-VN')}
                </span>
              </p>
            </div>

            <div className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-3.5 py-2 max-w-md">
              {activeConflict.autoMergeBlockedReason}
            </div>
          </div>

          {/* Bảng đối chiếu chi tiết từng trường khác biệt */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-3 px-4 w-44">Trường dữ liệu</th>
                  <th className="py-3 px-4">
                    Phiên bản đang chỉnh sửa của bạn (Dựa trên v{activeConflict.expectedBaseVersion})
                  </th>
                  <th className="py-3 px-4">
                    Phiên bản mới nhất trên máy chủ (v{activeConflict.latestServerVersion} –{' '}
                    {activeConflict.latestServerUpdatedByName})
                  </th>
                  <th className="py-3 px-4 w-36">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {activeConflict.fieldDiffs.map((diff) => (
                  <tr
                    key={diff.fieldKey}
                    className={diff.isDifferent ? 'bg-rose-50/40' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">{diff.fieldLabel}</td>
                    <td className="py-3 px-4 text-slate-800 whitespace-pre-wrap">
                      {diff.editingLocalValue}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium whitespace-pre-wrap">
                      {diff.latestServerValue}
                    </td>
                    <td className="py-3 px-4">
                      {diff.isDifferent ? (
                        <span className="font-bold text-rose-700">
                          Khác biệt {diff.affectsAnswerOrMatrixSafety ? '(Ảnh hưởng Đáp án/Điểm)' : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-700">Giống nhau</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Khung soạn thảo hợp nhất thủ công (Manual Merge Editor) */}
          {manualMergeDraft && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="text-xs font-bold text-slate-800">
                Khung kiểm tra &amp; chỉnh sửa nội dung Hợp nhất thủ công (Dành cho lựa chọn 3):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Nội dung câu hỏi / văn bản sau khi hợp nhất thủ công:
                  </label>
                  <textarea
                    rows={3}
                    value={manualMergeDraft.mainBodyText}
                    onChange={(e) =>
                      setManualMergeDraft({
                        ...manualMergeDraft,
                        mainBodyText: e.target.value,
                      })
                    }
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Đáp án đúng / Hướng dẫn chấm &amp; Điểm số đã xác nhận:
                  </label>
                  <textarea
                    rows={3}
                    value={manualMergeDraft.answerOrRubricKey}
                    onChange={(e) =>
                      setManualMergeDraft({
                        ...manualMergeDraft,
                        answerOrRubricKey: e.target.value,
                      })
                    }
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3 Lựa chọn xử lý xung đột bắt buộc (Mục V) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={resolvingConflict}
              onClick={() => void handleResolveConflict('LOAD_LATEST_SERVER')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-700" />
              <span>1. Tải phiên bản mới nhất trên máy chủ (v{activeConflict.latestServerVersion})</span>
            </button>

            <button
              type="button"
              disabled={resolvingConflict}
              onClick={() => void handleResolveConflict('SAVE_AS_COPY')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <Copy className="w-4 h-4 text-emerald-700" />
              <span>2. Lưu nội dung hiện tại thành bản sao độc lập</span>
            </button>

            <button
              type="button"
              disabled={resolvingConflict}
              onClick={() => void handleResolveConflict('MANUAL_COMPARE_AND_MERGE')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 cursor-pointer"
            >
              <GitMerge className="w-4 h-4" />
              <span>
                3. Xác nhận So sánh &amp; Hợp nhất thủ công (Lưu thành v
                {activeConflict.latestServerVersion + 1})
              </span>
            </button>
          </div>
        </section>
      )}

      {/* TRÌNH SOẠN THẢO THÔNG MINH & LỊCH SỬ PHIÊN BẢN */}
      {selectedRecord && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái (2/3): Trình soạn thảo có gắn Debounced Autosave, Khóa APPROVED & Giả lập xung đột */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>ID: {selectedRecord.entityId}</span>
                  <span aria-hidden="true">·</span>
                  <span>Phiên bản cơ sở đang mở: v{expectedBaseVersion}</span>
                  <span aria-hidden="true">·</span>
                  <span>Máy chủ hiện tại: {selectedRecord.versionLabel}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-blue-700" />
                  <span>{selectedRecord.entityTypeVietnamese}</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleSimulateColleagueEditOnServer()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Giả lập Giáo viên B sửa trên Máy khác</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void executeServerSaveTransaction(
                      editingContent,
                      expectedBaseVersion,
                      Math.max(1, pendingBatchKeystrokes),
                      'MANUAL_SAVE'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu &amp; Kiểm tra xung đột ngay</span>
                </button>
              </div>
            </div>

            {/* Cảnh báo khóa bất biến nếu hồ sơ đang ở trạng thái ĐÃ PHÊ DUYỆT (Mục VI) */}
            {selectedRecord.approvalStatus === 'APPROVED' && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>
                      HỒ SƠ ĐÃ PHÊ DUYỆT ({selectedRecord.versionLabel}) – CẤM AUTOSAVE GHI ĐÈ TRỰC TIẾP (MỤC VI)
                    </span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Mọi thao tác sửa trực tiếp lên phiên bản đã duyệt sẽ bị chặn (HTTP 403). Để chỉnh sửa, hãy tạo nhánh phiên bản mới (v{selectedRecord.version + 1}) và thực hiện lại các bước thẩm định.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleBranchApprovedRecord()}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 cursor-pointer"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>Tạo phiên bản mới (v{selectedRecord.version + 1}) &amp; Thẩm định lại</span>
                </button>
              </div>
            )}

            {/* Nếu hồ sơ đang ở trạng thái PENDING_REAPPRAISAL, hiển thị các bước thẩm định cần thực hiện lại */}
            {selectedRecord.approvalStatus === 'PENDING_REAPPRAISAL' &&
              selectedRecord.reappraisalRequiredSteps.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-blue-900">
                    Phiên bản mới ({selectedRecord.versionLabel}) được tách từ hồ sơ đã duyệt — Các bước thẩm định cần thực hiện lại:
                  </div>
                  <ul className="text-xs text-blue-800 space-y-0.5 list-disc list-inside">
                    {selectedRecord.reappraisalRequiredSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Các trường soạn thảo có kích hoạt Debounced Smart Autosave */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề bản ghi ({selectedRecord.subject} – Khối {selectedRecord.grade}):
                </label>
                <input
                  type="text"
                  value={editingContent.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung chính (Câu dẫn / Văn bản ngữ liệu / Cấu trúc ma trận / Nội dung đề):
                </label>
                <textarea
                  rows={4}
                  value={editingContent.mainBodyText}
                  onChange={(e) => handleFieldChange('mainBodyText', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đáp án đúng / Hướng dẫn chấm / Quy tắc ánh xạ:
                  </label>
                  <textarea
                    rows={3}
                    value={editingContent.answerOrRubricKey}
                    onChange={(e) => handleFieldChange('answerOrRubricKey', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Điểm số / Phân bổ mức độ nhận thức:
                  </label>
                  <textarea
                    rows={3}
                    value={editingContent.pointsOrMatrixAllocation}
                    onChange={(e) => handleFieldChange('pointsOrMatrixAllocation', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú chuyên môn / Lý do cập nhật:
                </label>
                <input
                  type="text"
                  value={editingContent.professionalNote}
                  onChange={(e) => handleFieldChange('professionalNote', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </section>

          {/* Cột phải (1/3): Lịch sử phiên bản chi tiết (Version, UpdatedAt, UpdatedBy, SHA-256) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-700" />
                <span>Lịch sử Phiên bản ({selectedRecord.versionHistory.length})</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Hiện hành: {selectedRecord.versionLabel}
              </span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {selectedRecord.versionHistory.map((ver) => (
                <div
                  key={`${ver.versionLabel}_${ver.updatedAt}`}
                  className="border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">
                      Phiên bản {ver.versionLabel}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        ver.approvalStatus === 'APPROVED'
                          ? 'text-emerald-700'
                          : ver.approvalStatus === 'PENDING_REAPPRAISAL'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                      }`}
                    >
                      {ver.approvalStatus}
                    </span>
                  </div>

                  <div className="text-slate-700 font-medium">{ver.updatedByName}</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {new Date(ver.updatedAt).toLocaleString('vi-VN')} · SHA-256: {ver.sha256Digest}
                  </div>
                  <div className="text-slate-600 pt-1 border-t border-slate-100">
                    {ver.operationNote}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* BẢNG KẾT QUẢ KIỂM THỬ 8 KỊCH BẢN NGHIỆM THU BẮT BUỘC (MỤC VII) */}
      {qaSuiteReport && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Báo cáo Kiểm thử 8 Kịch bản Smart Autosave &amp; Conflict Control (Mục VII)
              </h2>
              <p className="text-xs text-slate-600">
                Mã phiên kiểm thử: <span className="font-mono">{qaSuiteReport.runId}</span> · Thời điểm:{' '}
                {new Date(qaSuiteReport.executedAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-700">
              KẾT QUẢ: {qaSuiteReport.passedCount} / {qaSuiteReport.totalScenarios} KỊCH BẢN ĐẠT
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-3 px-4">TT</th>
                  <th className="py-3 px-4">Kịch bản kiểm thử (Mục VII)</th>
                  <th className="py-3 px-4">Chuỗi trạng thái quan sát</th>
                  <th className="py-3 px-4 text-right">Phím gõ / Lần ghi</th>
                  <th className="py-3 px-4">Bằng chứng kỹ thuật thực tế</th>
                  <th className="py-3 px-4">Kết luận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {qaSuiteReport.results.map((r) => (
                  <tr key={r.scenarioCode} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-slate-500">{r.order}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.scenarioTitle}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {r.stateTransitionObserved}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {r.keystrokesSimulated} phím / {r.serverWritesExecuted} ghi
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.technicalEvidence}</td>
                    <td className="py-3 px-4 font-bold">
                      {r.passed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ĐẠT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700">
                          <XCircle className="w-4 h-4" />
                          <span>CHƯA ĐẠT</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
