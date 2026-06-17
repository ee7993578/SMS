/**
 * LeaveStaffApproval.jsx
 * Folder: src/pages/Leave/LeaveStaffApproval.jsx
 *
 * Converts legacy ASPX "Staff Leave Approval" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Action (View), Apply Date, Employee Name, Leave Type,
 *          Leave Time, Date From, Date To, Days, Reason, Status
 * Features:
 *  - Session dropdown + Status dropdown filters
 *  - Show button
 *  - Modal popup for View → shows leave detail + Approve / Reject / Back
 *  - Status badge coloring
 *  - Desktop: ERP-style dense table
 *  - Mobile: card layout with expandable details + action drawer
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Calendar, Clock, User, FileText,
  CheckCircle2, XCircle, MinusCircle, Search, SlidersHorizontal,
  ClipboardList, Info, Building2, CalendarDays, Layers,
  ThumbsUp, ThumbsDown, ArrowLeft, Briefcase
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const STATUS_OPTIONS = [
  { value: '0', label: 'All Status' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Not Approved', label: 'Not Approved' },
]

const LEAVE_DATA = {
  '2024-25': [
    {
      id: 1, ApplicationId: 'APP001', name: 'Rajesh Kumar Singh',
      date_leave: '2024-04-03', NatureofLeaveapplied: 'Casual Leave',
      leavetypeid: 'CL', Leave_Time: 'Full Day',
      DatesFrom: '2024-04-05', DatesTo: '2024-04-06', NoOfDays: 2,
      Reason: 'Family function at home town',
      Leave_AppStaus: 'Approved',
    },
    {
      id: 2, ApplicationId: 'APP002', name: 'Priya Sharma',
      date_leave: '2024-04-07', NatureofLeaveapplied: 'Medical Leave',
      leavetypeid: 'ML', Leave_Time: 'Full Day',
      DatesFrom: '2024-04-08', DatesTo: '2024-04-10', NoOfDays: 3,
      Reason: 'Fever and doctor recommended rest',
      Leave_AppStaus: 'Not Approved',
    },
    {
      id: 3, ApplicationId: 'APP003', name: 'Ankit Verma',
      date_leave: '2024-04-10', NatureofLeaveapplied: 'Earned Leave',
      leavetypeid: 'EL', Leave_Time: 'Half Day',
      DatesFrom: '2024-04-12', DatesTo: '2024-04-12', NoOfDays: 0.5,
      Reason: 'Bank work in morning hours',
      Leave_AppStaus: 'Approved',
    },
    {
      id: 4, ApplicationId: 'APP004', name: 'Sunita Devi',
      date_leave: '2024-04-15', NatureofLeaveapplied: 'Casual Leave',
      leavetypeid: 'CL', Leave_Time: 'Full Day',
      DatesFrom: '2024-04-17', DatesTo: '2024-04-18', NoOfDays: 2,
      Reason: 'Personal work and household emergency',
      Leave_AppStaus: 'Not Approved',
    },
    {
      id: 5, ApplicationId: 'APP005', name: 'Mohit Gupta',
      date_leave: '2024-04-20', NatureofLeaveapplied: 'Medical Leave',
      leavetypeid: 'ML', Leave_Time: 'Full Day',
      DatesFrom: '2024-04-22', DatesTo: '2024-04-24', NoOfDays: 3,
      Reason: 'Surgical procedure and recovery',
      Leave_AppStaus: 'Approved',
    },
    {
      id: 6, ApplicationId: 'APP006', name: 'Kavita Joshi',
      date_leave: '2024-05-01', NatureofLeaveapplied: 'Earned Leave',
      leavetypeid: 'EL', Leave_Time: 'Full Day',
      DatesFrom: '2024-05-03', DatesTo: '2024-05-07', NoOfDays: 5,
      Reason: 'Vacation with family',
      Leave_AppStaus: 'Not Approved',
    },
    {
      id: 7, ApplicationId: 'APP007', name: 'Deepak Yadav',
      date_leave: '2024-05-08', NatureofLeaveapplied: 'Casual Leave',
      leavetypeid: 'CL', Leave_Time: 'Half Day',
      DatesFrom: '2024-05-09', DatesTo: '2024-05-09', NoOfDays: 0.5,
      Reason: 'Court hearing in afternoon',
      Leave_AppStaus: 'Approved',
    },
    {
      id: 8, ApplicationId: 'APP008', name: 'Rekha Pandey',
      date_leave: '2024-05-12', NatureofLeaveapplied: 'Medical Leave',
      leavetypeid: 'ML', Leave_Time: 'Full Day',
      DatesFrom: '2024-05-14', DatesTo: '2024-05-15', NoOfDays: 2,
      Reason: 'Eye checkup and prescribed rest',
      Leave_AppStaus: 'Not Approved',
    },
  ],
  '2025-26': [
    {
      id: 9, ApplicationId: 'APP009', name: 'Amit Tiwari',
      date_leave: '2025-04-02', NatureofLeaveapplied: 'Casual Leave',
      leavetypeid: 'CL', Leave_Time: 'Full Day',
      DatesFrom: '2025-04-04', DatesTo: '2025-04-05', NoOfDays: 2,
      Reason: 'Elder brother marriage ceremony',
      Leave_AppStaus: 'Approved',
    },
    {
      id: 10, ApplicationId: 'APP010', name: 'Neha Srivastava',
      date_leave: '2025-04-10', NatureofLeaveapplied: 'Medical Leave',
      leavetypeid: 'ML', Leave_Time: 'Full Day',
      DatesFrom: '2025-04-11', DatesTo: '2025-04-13', NoOfDays: 3,
      Reason: 'Migraine treatment',
      Leave_AppStaus: 'Not Approved',
    },
    {
      id: 11, ApplicationId: 'APP011', name: 'Ravi Shankar',
      date_leave: '2025-04-18', NatureofLeaveapplied: 'Earned Leave',
      leavetypeid: 'EL', Leave_Time: 'Half Day',
      DatesFrom: '2025-04-19', DatesTo: '2025-04-19', NoOfDays: 0.5,
      Reason: 'Child school admission work',
      Leave_AppStaus: 'Approved',
    },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Approved': {
    label: 'Approved',
    icon: CheckCircle2,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  'Not Approved': {
    label: 'Not Approved',
    icon: XCircle,
    cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    dot: 'bg-rose-500',
  },
  default: {
    label: 'Pending',
    icon: MinusCircle,
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    dot: 'bg-amber-500',
  },
}

const LEAVE_TYPE_COLORS = {
  CL: { bg: '#dbeafe', fg: '#1d4ed8' },
  ML: { bg: '#fee2e2', fg: '#dc2626' },
  EL: { bg: '#d1fae5', fg: '#059669' },
}

const getStatusCfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.default
const getLeaveColor = (id) => LEAVE_TYPE_COLORS[id] || { bg: '#f3e8ff', fg: '#7c3aed' }

const formatDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return isNaN(dt) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = getStatusCfg(status)
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── LEAVE DETAIL MODAL ───────────────────────────────────────────────────────
function LeaveDetailModal({ leave, onClose, onApprove, onReject, actionLoading }) {
  const [remark, setRemark] = useState('')
  const [remarkErr, setRemarkErr] = useState('')

  const handleApprove = () => {
    if (!remark.trim()) { setRemarkErr('Remark is required'); return }
    setRemarkErr('')
    onApprove(leave.id, remark)
  }

  const handleReject = () => {
    if (!remark.trim()) { setRemarkErr('Remark is required'); return }
    setRemarkErr('')
    onReject(leave.id, remark)
  }

  const ltColor = getLeaveColor(leave.leavetypeid)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={onClose} />

      {/* Panel — slides up on mobile, centered on desktop */}
      <div className="fixed z-[110] inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-t-3xl md:rounded-2xl w-full md:max-w-lg
            md:mx-4 shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            max-h-[90vh] flex flex-col overflow-hidden"
          style={{ animation: 'modalUp .25s ease' }}
        >
          <style>{`@keyframes modalUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

          {/* Handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate">Leave Application</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">App ID: {leave.ApplicationId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

            {/* Employee */}
            <InfoRow icon={User} label="Employee Name" value={leave.name} />

            {/* Reason */}
            <InfoRow icon={FileText} label="Reason" value={leave.Reason} />

            {/* Leave Type */}
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Leave Type</p>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold"
                  style={{ background: ltColor.bg, color: ltColor.fg }}
                >
                  {leave.NatureofLeaveapplied}
                </span>
              </div>
            </div>

            {/* Leave Time */}
            <InfoRow icon={Clock} label="Leave Time" value={leave.Leave_Time} />

            {/* Date From / To */}
            <div className="grid grid-cols-2 gap-3">
              <InfoRow icon={CalendarDays} label="Date From" value={formatDate(leave.DatesFrom)} />
              <InfoRow icon={CalendarDays} label="Date To" value={formatDate(leave.DatesTo)} />
            </div>

            {/* Days */}
            <InfoRow icon={Calendar} label="No. of Days" value={`${leave.NoOfDays} day${leave.NoOfDays > 1 ? 's' : ''}`} />

            {/* Current Status */}
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Current Status</p>
                <StatusBadge status={leave.Leave_AppStaus} />
              </div>
            </div>

            {/* Remark */}
            <div>
              <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                Remark <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={remark}
                onChange={e => { setRemark(e.target.value); if (e.target.value) setRemarkErr('') }}
                rows={3}
                placeholder="Enter remark before approving or rejecting..."
                className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none resize-none transition-all
                  bg-white text-slate-800 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                  dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${remarkErr ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
              {remarkErr && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />{remarkErr}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100
                dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/20
                transition-all disabled:opacity-60"
            >
              {actionLoading === 'reject'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ThumbsDown className="w-3.5 h-3.5" />}
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                dark:bg-emerald-600 dark:hover:bg-emerald-700
                transition-all active:scale-95 disabled:opacity-60"
            >
              {actionLoading === 'approve'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ThumbsUp className="w-3.5 h-3.5" />}
              Approve
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onView }) {
  const ltColor = getLeaveColor(row.leavetypeid)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">

      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Action */}
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => onView(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200
            dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 dark:hover:bg-blue-500/20
            transition-all active:scale-95"
        >
          <Eye className="w-3 h-3" /> View
        </button>
      </td>

      {/* Apply Date */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
        {formatDate(row.date_leave)}
      </td>

      {/* Employee Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
            {row.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </span>
          <span className="text-[13px] font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
            {row.name}
          </span>
        </div>
      </td>

      {/* Leave Type */}
      <td className="px-3 py-3">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: ltColor.bg, color: ltColor.fg }}
        >
          {row.NatureofLeaveapplied}
        </span>
      </td>

      {/* Leave Time */}
      <td className="px-3 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold
          ${row.Leave_Time === 'Full Day'
            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
          <Clock className="w-3 h-3" />
          {row.Leave_Time}
        </span>
      </td>

      {/* Date From */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
        {formatDate(row.DatesFrom)}
      </td>

      {/* Date To */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
        {formatDate(row.DatesTo)}
      </td>

      {/* Days */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[13px] font-bold
          bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 tabular-nums">
          {row.NoOfDays}
        </span>
      </td>

      {/* Reason */}
      <td className="px-3 py-3 max-w-[180px]">
        <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{row.Reason}</p>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <StatusBadge status={row.Leave_AppStaus} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onView }) {
  const [expanded, setExpanded] = useState(false)
  const ltColor = getLeaveColor(row.leavetypeid)
  const statusCfg = getStatusCfg(row.Leave_AppStaus)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Card header — always visible */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
              {row.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                Applied: {formatDate(row.date_leave)}
              </p>
            </div>
          </div>
          <StatusBadge status={row.Leave_AppStaus} />
        </div>
      </div>

      {/* Key info row */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: ltColor.bg, color: ltColor.fg }}
        >
          {row.NatureofLeaveapplied}
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold
          ${row.Leave_Time === 'Full Day'
            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
          <Clock className="w-3 h-3" />
          {row.Leave_Time}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Calendar className="w-3 h-3" />
          {row.NoOfDays} day{row.NoOfDays > 1 ? 's' : ''}
        </span>
      </div>

      {/* Date strip */}
      <div className="mx-4 mb-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">From</p>
          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{formatDate(row.DatesFrom)}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <div className="text-right">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">To</p>
          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{formatDate(row.DatesTo)}</p>
        </div>
      </div>

      {/* Reason preview */}
      <div className="px-4 pb-3">
        <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Reason: </span>
          {row.Reason}
        </p>
      </div>

      {/* Expandable extra details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-3">
          <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Full Detail</p>
          <div className="space-y-2">
            <DetailItem label="App ID" value={row.ApplicationId} />
          </div>
        </div>
      )}

      {/* Action footer */}
      <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Less' : 'More'}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onView(row)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
            text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
            dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" /> View & Action
        </button>
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 text-right">{value}</span>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, status, setStatus, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Status">
            <NativeSelect value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY STRIP ────────────────────────────────────────────────────────────
function SummaryStrip({ rows }) {
  const approved = rows.filter(r => r.Leave_AppStaus === 'Approved').length
  const notApproved = rows.filter(r => r.Leave_AppStaus === 'Not Approved').length
  const total = rows.length

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Total', value: total, cls: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { label: 'Approved', value: approved, cls: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { label: 'Not Approved', value: notApproved, cls: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
      ].map(s => (
        <div key={s.label} className={`rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] ${s.bg} px-4 py-3 text-center shadow-sm`}>
          <p className={`text-[22px] font-bold tabular-nums leading-tight ${s.cls}`}>{s.value}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LeaveStaffApproval() {
  const [session, setSession] = useState('')
  const [status, setStatus] = useState('0')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Simulate fetch ──────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = LEAVE_DATA[session] || []
      if (status !== '0') data = data.filter(r => r.Leave_AppStaus === status)
      setRows(data)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} leave application${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [session, status])

  const handleReset = () => {
    setSession(''); setStatus('0'); setRows([])
    setSearch(''); setErrors({}); setShown(false)
  }

  // ── Approve / Reject ────────────────────────────────────────────────────────
  const handleApprove = useCallback((id, remark) => {
    setActionLoading('approve')
    setTimeout(() => {
      setRows(prev => prev.map(r => r.id === id ? { ...r, Leave_AppStaus: 'Approved' } : r))
      setActionLoading(null)
      setSelectedLeave(null)
      showToast('Leave approved successfully!')
    }, 800)
  }, [])

  const handleReject = useCallback((id, remark) => {
    setActionLoading('reject')
    setTimeout(() => {
      setRows(prev => prev.map(r => r.id === id ? { ...r, Leave_AppStaus: 'Not Approved' } : r))
      setActionLoading(null)
      setSelectedLeave(null)
      showToast('Leave rejected.', 'error')
    }, 800)
  }, [])

  // ── Client-side search ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.NatureofLeaveapplied.toLowerCase().includes(q) ||
      r.Reason.toLowerCase().includes(q) ||
      r.Leave_AppStaus.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults = shown && rows.length > 0
  const activeFilters = [session, status !== '0' ? status : ''].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Staff Leave Approval
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Review and approve/reject staff leave applications session-wise.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Status">
              <NativeSelect value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>

            {/* spacer */}
            <div />

            <div className="flex gap-2">
              <button
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        status={status} setStatus={setStatus}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary strip */}
          <SummaryStrip rows={rows} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Leave Applications</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, type, status…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <EmptySearch />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Action', 'Apply Date', 'Employee Name', 'Leave Type', 'Leave Time', 'Date From', 'Date To', 'Days', 'Reason', 'Status'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} onView={setSelectedLeave} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <EmptySearch />
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap "View &amp; Action" to approve or reject a leave.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} onView={setSelectedLeave} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>{' '}
                of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span>{' '}
                records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No applications loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to load leave applications.
            </p>
          </div>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {selectedLeave && (
        <LeaveDetailModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          actionLoading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

function EmptySearch() {
  return (
    <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
      <Search className="w-6 h-6 opacity-40" />
      <span className="text-[13px]">No records match your search.</span>
    </div>
  )
}
