/**
 * LeaveApprovalByPrincipal.jsx
 * Folder: src/pages/Leave/LeaveApprovalByPrincipal.jsx
 *
 * Converts legacy ASPX "Faculty Leave Approval by Principal" to fully-responsive React + Tailwind.
 *
 * Columns: SNO, Name, Nature of Leave, Reason, From Date, To Date, Apply Date,
 *          Wing Incharge, Wing Incharge Status, Principal Status, Action, Remark
 * Features:
 *  - Session + Status dropdown filters
 *  - Show button with loading state
 *  - Approve / Reject action per row with remark input
 *  - Desktop: dense ERP-style table
 *  - Mobile: accordion cards with full detail & action
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Calendar,
  User, FileText, ClipboardList, Clock,
  CheckCircle2, XCircle, ChevronRight,
  Info, Shield, BookOpen, BarChart3,
  MessageSquare, BadgeCheck, Ban, Hourglass
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const STATUS_OPTIONS = [
  { value: '0', label: 'Select All Status' },
  { value: 'Approve', label: 'Approve' },
  { value: 'Not Approve', label: 'Not Approve' },
]

const LEAVE_DATA = {
  '2024-25': [
    {
      ApplicationId: 'APP001',
      name: 'Priya Sharma',
      NatureofLeaveapplied: 'Casual Leave',
      Reason: 'Personal work at home',
      DatesFrom: '2024-10-01',
      DatesTo: '2024-10-02',
      leaveapplyon: '2024-09-28',
      headofdepartment: 'Rajesh Kumar',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Pending',
      principal_approval: 'Approve',
      remark: '',
    },
    {
      ApplicationId: 'APP002',
      name: 'Amit Verma',
      NatureofLeaveapplied: 'Medical Leave',
      Reason: 'Fever and doctor visit',
      DatesFrom: '2024-10-05',
      DatesTo: '2024-10-07',
      leaveapplyon: '2024-10-04',
      headofdepartment: 'Sunita Patel',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Approve',
      principal_approval: 'Approve',
      remark: 'Approved with medical certificate',
    },
    {
      ApplicationId: 'APP003',
      name: 'Neha Gupta',
      NatureofLeaveapplied: 'Earned Leave',
      Reason: 'Family function',
      DatesFrom: '2024-10-10',
      DatesTo: '2024-10-12',
      leaveapplyon: '2024-10-06',
      headofdepartment: 'Rajesh Kumar',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Not Approve',
      principal_approval: 'Not Approve',
      remark: 'Insufficient leave balance',
    },
    {
      ApplicationId: 'APP004',
      name: 'Suresh Yadav',
      NatureofLeaveapplied: 'Casual Leave',
      Reason: 'Attending relative marriage',
      DatesFrom: '2024-10-15',
      DatesTo: '2024-10-16',
      leaveapplyon: '2024-10-12',
      headofdepartment: 'Sunita Patel',
      headofdepartment_approvalstatus: 'Pending',
      status: 'Pending',
      principal_approval: 'Approve',
      remark: '',
    },
    {
      ApplicationId: 'APP005',
      name: 'Kavita Singh',
      NatureofLeaveapplied: 'Half Day Leave',
      Reason: 'Bank work',
      DatesFrom: '2024-10-18',
      DatesTo: '2024-10-18',
      leaveapplyon: '2024-10-17',
      headofdepartment: 'Manoj Tiwari',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Approve',
      principal_approval: 'Approve',
      remark: 'Approved',
    },
    {
      ApplicationId: 'APP006',
      name: 'Rahul Mishra',
      NatureofLeaveapplied: 'Medical Leave',
      Reason: 'Surgery recovery',
      DatesFrom: '2024-10-20',
      DatesTo: '2024-10-25',
      leaveapplyon: '2024-10-19',
      headofdepartment: 'Manoj Tiwari',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Pending',
      principal_approval: 'Approve',
      remark: '',
    },
    {
      ApplicationId: 'APP007',
      name: 'Anita Joshi',
      NatureofLeaveapplied: 'Casual Leave',
      Reason: 'Visiting sick parent',
      DatesFrom: '2024-11-01',
      DatesTo: '2024-11-03',
      leaveapplyon: '2024-10-30',
      headofdepartment: 'Rajesh Kumar',
      headofdepartment_approvalstatus: 'Pending',
      status: 'Pending',
      principal_approval: 'Approve',
      remark: '',
    },
    {
      ApplicationId: 'APP008',
      name: 'Deepak Pandey',
      NatureofLeaveapplied: 'Earned Leave',
      Reason: 'Vacation trip',
      DatesFrom: '2024-11-10',
      DatesTo: '2024-11-15',
      leaveapplyon: '2024-11-05',
      headofdepartment: 'Sunita Patel',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Not Approve',
      principal_approval: 'Not Approve',
      remark: 'Exam period — leave not permissible',
    },
  ],
  '2025-26': [
    {
      ApplicationId: 'APP101',
      name: 'Meera Dixit',
      NatureofLeaveapplied: 'Casual Leave',
      Reason: 'House shifting work',
      DatesFrom: '2025-04-02',
      DatesTo: '2025-04-03',
      leaveapplyon: '2025-04-01',
      headofdepartment: 'Rajesh Kumar',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Pending',
      principal_approval: 'Approve',
      remark: '',
    },
    {
      ApplicationId: 'APP102',
      name: 'Vikas Tomar',
      NatureofLeaveapplied: 'Medical Leave',
      Reason: 'Dental treatment',
      DatesFrom: '2025-04-07',
      DatesTo: '2025-04-08',
      leaveapplyon: '2025-04-06',
      headofdepartment: 'Manoj Tiwari',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Approve',
      principal_approval: 'Approve',
      remark: '',
    },
    {
      ApplicationId: 'APP103',
      name: 'Sunita Rawat',
      NatureofLeaveapplied: 'Half Day Leave',
      Reason: 'Passport related work',
      DatesFrom: '2025-04-10',
      DatesTo: '2025-04-10',
      leaveapplyon: '2025-04-09',
      headofdepartment: 'Sunita Patel',
      headofdepartment_approvalstatus: 'Approved',
      status: 'Pending',
      principal_approval: 'Approve',
      remark: '',
    },
  ],
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const leaveDays = (from, to) => {
  if (!from || !to) return 1
  const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1
  return diff > 0 ? diff : 1
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    Approve: {
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
      icon: <BadgeCheck className="w-3 h-3" />,
      label: 'Approved',
    },
    'Not Approve': {
      cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
      icon: <Ban className="w-3 h-3" />,
      label: 'Not Approved',
    },
    Pending: {
      cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
      icon: <Hourglass className="w-3 h-3" />,
      label: 'Pending',
    },
  }
  const cfg = map[status] || map['Pending']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ─── PRIMITIVE: NATIVE SELECT ────────────────────────────────────────────────

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

// ─── PRIMITIVE: FIELD ────────────────────────────────────────────────────────

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY STAT CARD ───────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── REMARK CELL ─────────────────────────────────────────────────────────────

function RemarkInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Add remark…"
      className="w-full min-w-[140px] px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200
        dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238]
        text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:focus:border-indigo-400 transition-all"
    />
  )
}

// ─── ACTION BUTTON ───────────────────────────────────────────────────────────

function ActionButton({ current, onToggle }) {
  const isApprove = current === 'Approve'
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95 whitespace-nowrap
        ${isApprove
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
          : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25'
        }`}
    >
      {isApprove
        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Approve</>
        : <><XCircle className="w-3.5 h-3.5" /> Not Approve</>
      }
    </button>
  )
}

// ─── DESKTOP TABLE ROW ───────────────────────────────────────────────────────

function DesktopRow({ row, idx, onToggleAction, onRemarkChange }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>

      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-blue-700 dark:text-blue-400">
            {row.name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Nature of Leave */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[11px] font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">
          <FileText className="w-3 h-3" /> {row.NatureofLeaveapplied}
        </span>
      </td>

      {/* Reason */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 max-w-[140px] block truncate" title={row.Reason}>
          {row.Reason}
        </span>
      </td>

      {/* From */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
        {fmtDate(row.DatesFrom)}
      </td>

      {/* To */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
        {fmtDate(row.DatesTo)}
      </td>

      {/* Apply Date */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
        {fmtDate(row.leaveapplyon)}
      </td>

      {/* Wing Incharge */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.headofdepartment}</span>
      </td>

      {/* Wing Incharge Status */}
      <td className="px-3 py-3 text-center">
        <StatusBadge status={row.headofdepartment_approvalstatus} />
      </td>

      {/* Principal Status */}
      <td className="px-3 py-3 text-center">
        <StatusBadge status={row.status} />
      </td>

      {/* Action */}
      <td className="px-3 py-3 text-center">
        <ActionButton current={row.principal_approval} onToggle={() => onToggleAction(row.ApplicationId)} />
      </td>

      {/* Remark */}
      <td className="px-3 py-3">
        <RemarkInput value={row.remark} onChange={(v) => onRemarkChange(row.ApplicationId, v)} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────

function MobileCard({ row, idx, onToggleAction, onRemarkChange }) {
  const [expanded, setExpanded] = useState(false)
  const days = leaveDays(row.DatesFrom, row.DatesTo)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0 text-[14px] font-bold text-blue-700 dark:text-blue-400">
          {row.name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{row.NatureofLeaveapplied}</span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{days} day{days > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={row.status} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick info strip */}
      <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Calendar className="w-3 h-3" />
          {fmtDate(row.DatesFrom)} — {fmtDate(row.DatesTo)}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Shield className="w-3 h-3" />
          {row.headofdepartment}: <span className={`font-semibold ml-0.5 ${row.headofdepartment_approvalstatus === 'Approved' ? 'text-emerald-600' : row.headofdepartment_approvalstatus === 'Pending' ? 'text-amber-600' : 'text-rose-600'}`}>{row.headofdepartment_approvalstatus}</span>
        </span>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-4">
          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">From Date</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{fmtDate(row.DatesFrom)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">To Date</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{fmtDate(row.DatesTo)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Reason</p>
              <p className="text-[13px] text-slate-700 dark:text-slate-200">{row.Reason}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Applied On</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{fmtDate(row.leaveapplyon)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Wing Incharge</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.headofdepartment}</p>
            </div>
          </div>

          {/* Status row */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Wing Status</p>
              <StatusBadge status={row.headofdepartment_approvalstatus} />
            </div>
            <div className="flex-1 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Principal Status</p>
              <StatusBadge status={row.status} />
            </div>
          </div>

          {/* Action section */}
          <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-3 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Your Decision</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onToggleAction(row.ApplicationId)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95
                  ${row.principal_approval === 'Approve'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                type="button"
                onClick={() => row.principal_approval === 'Approve' && onToggleAction(row.ApplicationId)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95
                  ${row.principal_approval !== 'Approve'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
              >
                <XCircle className="w-4 h-4" /> Not Approve
              </button>
            </div>

            {/* Remark input */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Remark</p>
              <input
                type="text"
                value={row.remark}
                onChange={e => onRemarkChange(row.ApplicationId, e.target.value)}
                placeholder="Add remark…"
                className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200
                  dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238]
                  text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, status, setStatus, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
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
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function LeaveApprovalByPrincipal() {
  const [session,     setSession]     = useState('')
  const [status,      setStatus]      = useState('0')
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulated) ───────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = LEAVE_DATA[session] || []
      if (status !== '0') {
        data = data.filter(r => r.status === status)
      }
      // Deep clone for local mutation
      setRows(data.map(r => ({ ...r })))
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} record${data.length !== 1 ? 's' : ''} for ${session}.`)
    }, 700)
  }, [session, status])

  const handleReset = () => {
    setSession(''); setStatus('0'); setRows([])
    setSearch(''); setErrors({}); setShown(false); setShownSession('')
  }

  // ── Toggle approve / not approve ────────────────────────────────────────
  const handleToggleAction = useCallback((appId) => {
    setRows(prev => prev.map(r =>
      r.ApplicationId === appId
        ? { ...r, principal_approval: r.principal_approval === 'Approve' ? 'Not Approve' : 'Approve' }
        : r
    ))
  }, [])

  // ── Update remark ────────────────────────────────────────────────────────
  const handleRemarkChange = useCallback((appId, val) => {
    setRows(prev => prev.map(r =>
      r.ApplicationId === appId ? { ...r, remark: val } : r
    ))
  }, [])

  // ── Save (placeholder) ───────────────────────────────────────────────────
  const handleSave = () => {
    showToast('Changes saved successfully! (API integration pending)')
  }

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.NatureofLeaveapplied.toLowerCase().includes(q) ||
      r.headofdepartment.toLowerCase().includes(q) ||
      r.Reason.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary counts ───────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       filtered.length,
    pending:     filtered.filter(r => r.status === 'Pending').length,
    approved:    filtered.filter(r => r.status === 'Approve').length,
    notApproved: filtered.filter(r => r.status === 'Not Approve').length,
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = (session ? 1 : 0) + (status !== '0' ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty Leave Approval
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Review and approve faculty leave applications as Principal.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleSave}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20
              transition-all active:scale-95 flex-shrink-0"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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

            {/* Spacers */}
            <div /><div />

            {/* Buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
            <Check className="w-4 h-4" />
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        status={status}   setStatus={setStatus}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Applications" value={stats.total}       color="blue"    />
            <SummaryCard icon={Hourglass}     label="Pending"           value={stats.pending}      color="amber"   />
            <SummaryCard icon={BadgeCheck}    label="Approved"          value={stats.approved}     color="emerald" />
            <SummaryCard icon={Ban}           label="Not Approved"      value={stats.notApproved}  color="rose"    />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Leave Applications</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
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
                  placeholder="Search name, type, reason…"
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

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click the action button to toggle Approve / Not Approve. Add a remark and click <strong>Save Changes</strong> when done.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden lg:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        'SNO.', 'Name', 'Nature of Leave', 'Reason',
                        'From', 'To', 'Apply Date',
                        'Wing Incharge', 'Wing Status', 'Principal Status', 'Action', 'Remark'
                      ].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow
                        key={row.ApplicationId}
                        row={row}
                        idx={i + 1}
                        onToggleAction={handleToggleAction}
                        onRemarkChange={handleRemarkChange}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── TABLET TABLE (medium screens) ── */}
            <div className="hidden sm:block lg:hidden overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['#', 'Name', 'Leave Type', 'Dates', 'Principal Status', 'Action', 'Remark'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <tr key={row.ApplicationId} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
                              {row.name.charAt(0)}
                            </span>
                            <div>
                              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{row.Reason}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">{row.NatureofLeaveapplied}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
                          {fmtDate(row.DatesFrom)}<br /><span className="text-slate-400">to</span> {fmtDate(row.DatesTo)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ActionButton current={row.principal_approval} onToggle={() => handleToggleAction(row.ApplicationId)} />
                        </td>
                        <td className="px-3 py-3">
                          <RemarkInput value={row.remark} onChange={v => handleRemarkChange(row.ApplicationId, v)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="sm:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand and take action.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.ApplicationId}
                      row={row}
                      idx={i + 1}
                      onToggleAction={handleToggleAction}
                      onRemarkChange={handleRemarkChange}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              <div className="flex items-center gap-2">
                {search && (
                  <button onClick={() => setSearch('')}
                    className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear search
                  </button>
                )}
                {hasResults && (
                  <button type="button" onClick={handleSave}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                      bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95">
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No records loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and status, then click <strong>Show</strong> to load leave applications.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
