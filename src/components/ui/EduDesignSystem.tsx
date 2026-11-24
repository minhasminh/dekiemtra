import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Info,
  Loader2,
  Upload,
  X,
} from 'lucide-react';

// ============================================================================
// GIAI ĐOẠN 21 – MỤC XII: DESIGN SYSTEM 20 COMPONENT DÙNG CHUNG CHO EDU TEST AI
// Bảng màu: Primary #123D75 · Secondary #087F8C · Accent #F4A340
// Background #F5F7FB · Surface #FFFFFF · Text #1F2937 · Border #E5E7EB
// ============================================================================

export type EduButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
export type EduComponentSize = 'sm' | 'md' | 'lg';

export interface DesignSystemRegistryItem {
  index: number;
  name: string;
  category: string;
}

export const DESIGN_SYSTEM_REGISTRY_20: DesignSystemRegistryItem[] = [
  { index: 1, name: 'Button', category: 'Action' },
  { index: 2, name: 'Input', category: 'Form' },
  { index: 3, name: 'Select', category: 'Form' },
  { index: 4, name: 'Checkbox', category: 'Form' },
  { index: 5, name: 'Radio', category: 'Form' },
  { index: 6, name: 'Tabs', category: 'Navigation' },
  { index: 7, name: 'Table', category: 'Data' },
  { index: 8, name: 'Modal', category: 'Overlay' },
  { index: 9, name: 'Drawer', category: 'Overlay' },
  { index: 10, name: 'Card', category: 'Layout' },
  { index: 11, name: 'Badge', category: 'Status' },
  { index: 12, name: 'Toast', category: 'Feedback' },
  { index: 13, name: 'Tooltip', category: 'Overlay' },
  { index: 14, name: 'Pagination', category: 'Navigation' },
  { index: 15, name: 'Date Picker', category: 'Form' },
  { index: 16, name: 'File Upload', category: 'Form' },
  { index: 17, name: 'Loading Skeleton', category: 'State' },
  { index: 18, name: 'Empty State', category: 'State' },
  { index: 19, name: 'Error State', category: 'State' },
  { index: 20, name: 'Confirmation Dialog', category: 'Overlay' },
];

// 1. BUTTON
export interface EduButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: EduButtonVariant;
  size?: EduComponentSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const EduButton: React.FC<EduButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : size === 'lg'
        ? 'px-5 py-2.5 text-sm'
        : 'px-4 py-2 text-xs';

  const variantClasses =
    variant === 'primary'
      ? 'bg-[#123D75] hover:bg-[#0D2D59] text-white border border-[#123D75]'
      : variant === 'secondary'
        ? 'bg-[#087F8C] hover:bg-[#066670] text-white border border-[#087F8C]'
        : variant === 'accent'
          ? 'bg-[#F4A340] hover:bg-[#e08f2c] text-[#1F2937] font-bold border border-[#F4A340]'
          : variant === 'danger'
            ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600'
            : variant === 'ghost'
              ? 'bg-transparent hover:bg-slate-100 text-[#1F2937] border border-transparent'
              : 'bg-white hover:bg-slate-50 text-[#1F2937] border border-[#E5E7EB]';

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : icon}
      <span className="inline-flex items-center">{children}</span>
    </button>
  );
};

// 2. INPUT
export interface EduInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const EduInput: React.FC<EduInputProps> = ({
  label,
  helperText,
  errorText,
  className = '',
  ...rest
}) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-[#1F2937]">{label}</label>}
    <input
      className={`w-full px-3 py-2 text-sm rounded-lg bg-white border ${
        errorText
          ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
          : 'border-[#E5E7EB] focus:border-[#123D75] focus:ring-2 focus:ring-[#123D75]/15'
      } text-[#1F2937] outline-none transition-colors ${className}`}
      {...rest}
    />
    {errorText ? (
      <div className="text-xs text-rose-600 font-medium">{errorText}</div>
    ) : helperText ? (
      <div className="text-xs text-slate-500">{helperText}</div>
    ) : null}
  </div>
);

// 3. SELECT
export interface EduSelectOption {
  value: string;
  label: string;
}

export interface EduSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: EduSelectOption[];
  errorText?: string;
}

export const EduSelect: React.FC<EduSelectProps> = ({
  label,
  options,
  errorText,
  className = '',
  ...rest
}) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-[#1F2937]">{label}</label>}
    <select
      className={`w-full px-3 py-2 text-sm rounded-lg bg-white border ${
        errorText ? 'border-rose-500' : 'border-[#E5E7EB] focus:border-[#123D75]'
      } text-[#1F2937] font-medium outline-none transition-colors ${className}`}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {errorText && <div className="text-xs text-rose-600 font-medium">{errorText}</div>}
  </div>
);

// 4. CHECKBOX
export interface EduCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const EduCheckbox: React.FC<EduCheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => (
  <label
    className={`flex items-start gap-2.5 p-2 rounded-lg border border-transparent hover:bg-slate-50 cursor-pointer ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 accent-[#123D75] rounded cursor-pointer"
    />
    <div>
      <div className="text-xs font-semibold text-[#1F2937]">{label}</div>
      {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
    </div>
  </label>
);

// 5. RADIO
export interface EduRadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (val: string) => void;
  label: string;
  description?: string;
}

export const EduRadio: React.FC<EduRadioProps> = ({
  name,
  value,
  checked,
  onChange,
  label,
  description,
}) => (
  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="mt-0.5 w-4 h-4 accent-[#123D75] cursor-pointer"
    />
    <div>
      <div className="text-xs font-semibold text-[#1F2937]">{label}</div>
      {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
    </div>
  </label>
);

// 6. TABS
export interface EduTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: string | number;
}

export const EduTabs: React.FC<{
  tabs?: EduTabItem[];
  items?: EduTabItem[];
  activeId: string;
  onChange: (id: string) => void;
}> = ({ tabs, items, activeId, onChange }) => {
  const list = items || tabs || [];
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-[#E5E7EB]">
      {list.map((tab) => {
        const active = tab.id === activeId;
        const badgeVal = tab.badge !== undefined ? tab.badge : tab.count;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              active
                ? 'bg-[#123D75] text-white shadow-xs'
                : 'text-[#1F2937] hover:bg-white/70'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {badgeVal !== undefined && (
              <span
                className={`font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] ${
                  active ? 'bg-[#F4A340] text-[#123D75] font-bold' : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {badgeVal}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// 7. TABLE
export interface EduTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T, index: number) => React.ReactNode;
}

export function EduTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
}: {
  columns: EduTableColumn<T>[];
  data: T[];
  rowKey?: (row: T, idx: number) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-[#F5F7FB] text-[#1F2937] border-b border-[#E5E7EB]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 font-semibold ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {data.map((row, idx) => {
            const computedKey = rowKey
              ? rowKey(row, idx)
              : String(row.id ?? row.dossierId ?? row.teacherId ?? row.stepNumber ?? idx);
            return (
              <tr key={computedKey} className="hover:bg-slate-50/80 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-4 ${
                      col.align === 'right'
                        ? 'text-right font-mono tabular-nums'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row, idx) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// 8. MODAL
export const EduModal: React.FC<{
  open?: boolean;
  isOpen?: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, isOpen, title, subtitle, onClose, children, footer }) => {
  const visible = isOpen ?? open ?? false;
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xl max-w-xl w-full overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#123D75]">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 text-xs space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3 bg-[#F5F7FB] border-t border-[#E5E7EB] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// 9. DRAWER
export const EduDrawer: React.FC<{
  open?: boolean;
  isOpen?: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, isOpen, title, onClose, children }) => {
  const visible = isOpen ?? open ?? false;
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex justify-end">
      <div className="bg-white w-full max-w-md h-full border-l border-[#E5E7EB] shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#123D75]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto text-xs space-y-4">{children}</div>
      </div>
    </div>
  );
};

// 10. CARD
export const EduCard: React.FC<{
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, actions, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-[#E5E7EB] p-5 ${className}`}>
    {(title || actions) && (
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-[#E5E7EB]">
        <div>
          {title && <h3 className="text-sm font-bold text-[#1F2937]">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

// 11. BADGE / SEMANTIC STATUS INDICATOR
export type EduBadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'neutral';

export const EduBadge: React.FC<{
  status?: EduBadgeVariant;
  variant?: EduBadgeVariant;
  children: React.ReactNode;
}> = ({ status, variant, children }) => {
  const mode = variant || status || 'neutral';
  const colorClass =
    mode === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
      : mode === 'warning'
        ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
        : mode === 'error' || mode === 'danger'
          ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
          : mode === 'info' || mode === 'secondary'
            ? 'bg-teal-50 text-[#087F8C] border-teal-200 font-semibold'
            : mode === 'primary'
              ? 'bg-blue-50 text-[#123D75] border-blue-200 font-semibold'
              : 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] ${colorClass}`}>
      {children}
    </span>
  );
};

// 12. TOAST
export const EduToast: React.FC<{
  type?: 'success' | 'warning' | 'error' | 'info';
  variant?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
}> = ({ type, variant, title, message, onClose }) => {
  const mode = variant || type || 'info';
  const styles =
    mode === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
      : mode === 'warning'
        ? 'bg-amber-50 border-amber-200 text-amber-950'
        : mode === 'error'
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : 'bg-sky-50 border-sky-200 text-sky-950';
  return (
    <div className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${styles}`}>
      <div className="flex items-start gap-2">
        {mode === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
        {mode === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
        {mode === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
        {mode === 'info' && <Info className="w-4 h-4 text-[#087F8C] shrink-0 mt-0.5" />}
        <div>
          <div className="font-bold">{title}</div>
          <div className="mt-0.5 opacity-90">{message}</div>
        </div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="opacity-70 hover:opacity-100 cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// 13. TOOLTIP
export const EduTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => (
  <span className="relative group inline-flex items-center">
    {children}
    <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded bg-[#123D75] text-white text-[11px] whitespace-nowrap z-40 shadow-md">
      {content}
    </span>
  </span>
);

// 14. PAGINATION
export const EduPagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-4 bg-white rounded-xl border border-[#E5E7EB] text-xs">
    <div className="text-slate-600 font-mono tabular-nums">
      Hiển thị trang <strong>{currentPage}</strong> / <strong>{Math.max(1, totalPages)}</strong> · Tổng{' '}
      <strong>{totalItems.toLocaleString()}</strong> bản ghi ({pageSize} bản ghi/trang)
    </div>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-2.5 py-1 rounded border border-[#E5E7EB] hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Trước
      </button>
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-2.5 py-1 rounded border border-[#E5E7EB] hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
      >
        Tiếp
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// 15. DATE PICKER
export const EduDatePicker: React.FC<{
  label?: string;
  value: string;
  onChange: (dateStr: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-[#1F2937]">{label}</label>}
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg bg-white border border-[#E5E7EB] text-[#1F2937] focus:border-[#123D75] outline-none"
      />
      <Calendar className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-2.5" />
    </div>
  </div>
);

// 16. FILE UPLOAD
export const EduFileUpload: React.FC<{
  label?: string;
  accept?: string;
  helperText?: string;
  onFileSelect?: (fileName: string) => void;
  onFilesSelected?: (files: FileList) => void;
}> = ({ label, accept = '.docx,.pdf,.xlsx', helperText, onFileSelect, onFilesSelected }) => {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  return (
    <div className="space-y-1.5">
      {label && <div className="text-xs font-semibold text-[#1F2937]">{label}</div>}
      <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-[#087F8C] bg-[#F5F7FB] hover:bg-slate-100/70 transition-colors cursor-pointer text-xs text-center">
        <Upload className="w-5 h-5 text-[#087F8C] mb-1.5" />
        <span className="font-semibold text-[#123D75]">
          {selectedName ? `Đã chọn tệp: ${selectedName}` : 'Nhấn để chọn tệp tải lên (.docx, .pdf, .xlsx)'}
        </span>
        {helperText && <span className="text-[11px] text-slate-500 mt-0.5">{helperText}</span>}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            const f = files?.[0];
            if (f) {
              setSelectedName(f.name);
              onFileSelect?.(f.name);
            }
            if (files && files.length > 0) {
              onFilesSelected?.(files);
            }
          }}
        />
      </label>
    </div>
  );
};

// 17. LOADING SKELETON
export const EduLoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-2.5 p-4 rounded-xl border border-[#E5E7EB] bg-white">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="animate-pulse flex items-center justify-between gap-4">
        <div className="h-3.5 bg-slate-200 rounded w-1/3" />
        <div className="h-3.5 bg-slate-200 rounded w-1/4" />
        <div className="h-3.5 bg-slate-200 rounded w-16" />
      </div>
    ))}
  </div>
);

// 18. EMPTY STATE
export const EduEmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="p-8 rounded-xl border border-[#E5E7EB] bg-white text-center space-y-2.5">
    <FolderOpen className="w-8 h-8 text-[#087F8C] mx-auto" />
    <div className="text-sm font-bold text-[#1F2937]">{title}</div>
    <p className="text-xs text-slate-500 max-w-md mx-auto">{description}</p>
    {actionLabel && onAction && (
      <div className="pt-1">
        <EduButton variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </EduButton>
      </div>
    )}
  </div>
);

// 19. ERROR STATE
export const EduErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Đã xảy ra lỗi tải dữ liệu', message, onRetry }) => (
  <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-950 flex flex-wrap items-center justify-between gap-4 text-xs">
    <div className="flex items-start gap-2.5">
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="mt-0.5 text-rose-800">{message}</div>
      </div>
    </div>
    {onRetry && (
      <EduButton variant="danger" size="sm" onClick={onRetry}>
        Thử lại ngay
      </EduButton>
    )}
  </div>
);

// 20. CONFIRMATION DIALOG
export const EduConfirmDialog: React.FC<{
  open?: boolean;
  isOpen?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận thực hiện',
  cancelLabel = 'Hủy bỏ',
  onConfirm,
  onCancel,
}) => (
  <EduModal
    open={isOpen ?? open ?? false}
    title={title}
    onClose={onCancel}
    footer={
      <>
        <EduButton variant="outline" size="sm" onClick={onCancel}>
          {cancelLabel}
        </EduButton>
        <EduButton variant="primary" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </EduButton>
      </>
    }
  >
    <p className="text-slate-700 leading-relaxed">{message}</p>
  </EduModal>
);
