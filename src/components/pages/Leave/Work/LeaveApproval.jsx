/**
 * LeaveApproval.jsx
 * Folder: src/pages/Leave/LeaveApproval.jsx
 *
 * Converts legacy ASPX "Faculty Leave Approval" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Name, Nature of Leave, Reason, From, To, Applied On,
 *          Wing Incharge, Wing Status, Principal Status, Action (Approve/Reject), Remark
 *
 * Features:
 *  - Session dropdown + Status filter
 *  - Show button → loads data
 *  - Per-row Approve / Reject / Pending toggle
 *  - Remark input per row
 *  - Status badge display
 *  - Summary stat cards
 *  - Desktop: dense ERP table with sticky header
 *  - Tablet: scrollable condensed table
 *  - Mobile: card-per-leave with expandable detail + quick action buttons
 *  - Mobile filter drawer
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty state
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  FileText, Clock, CalendarDays, User, Building2,
  CheckCircle2, XCircle, MinusCircle, MessageSquare,
  GraduationCap, BadgeCheck, ShieldAlert, BarChart3,
  ClipboardList, Pen, Info
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Not Approved', label: 'Not Approved' },
]

const LEAVE_TYPES = [
  'Casual Leave', 'Medical Leave', 'Earned Leave',
  'Half Day Leave', 'Compensatory Leave', 'Maternity Leave',
]

const DUMMY_LEAVES = {
  '2025-26': [
    {
      ApplicationId: 'APP001', name: 'Dr. Priya Sharma', NatureofLeaveapplied: 'Medical Leave',
      Reason: 'Fever and throat infection', DatesFrom: '2025-06-02', DatesTo: '2025-06-04',
      leaveapplyon: '2025-06-01', headofdepartment: 'Mr. Ramesh Kumar',
      status: 'Approved', principal_approval: 'Approved', headofdepartment_approval: 'Approve',
      remark: '', days: 3,
    },
    {
      ApplicationId: 'APP002', name: 'Mr. Suresh Tiwari', NatureofLeaveapplied: 'Casual Leave',
      Reason: 'Family function attendance', DatesFrom: '2025-06-10', DatesTo: '2025-06-10',
      leaveapplyon: '2025-06-08', headofdepartment: 'Ms. Kavita Singh',
      status: 'Not Approved', principal_approval: 'Pending', headofdepartment_approval: 'Approve',
      remark: '', days: 1,
    },
    {
      ApplicationId: 'APP003', name: 'Ms. Anjali Gupta', NatureofLeaveapplied: 'Earned Leave',
      Reason: 'Personal work out of station', DatesFrom: '2025-06-15', DatesTo: '2025-06-17',
      leaveapplyon: '2025-06-12', headofdepartment: 'Mr. Ramesh Kumar',
      status: 'Approved', principal_approval: 'Pending', headofdepartment_approval: 'Approve',
      remark: 'Approved for 2 days only', days: 3,
    },
    {
      ApplicationId: 'APP004', name: 'Mr. Vikram Yadav', NatureofLeaveapplied: 'Half Day Leave',
      Reason: 'Doctor appointment', DatesFrom: '2025-06-18', DatesTo: '2025-06-18',
      leaveapplyon: '2025-06-17', headofdepartment: 'Ms. Kavita Singh',
      status: 'Approved', principal_approval: 'Approved', headofdepartment_approval: 'Approve',
      remark: '', days: 0.5,
    },
    {
      ApplicationId: 'APP005', name: 'Mrs. Rekha Mishra', NatureofLeaveapplied: 'Medical Leave',
      Reason: 'Hospitalization for minor surgery', DatesFrom: '2025-06-20', DatesTo: '2025-06-25',
      leaveapplyon: '2025-06-18', headofdepartment: 'Mr. Deepak Verma',
      status: 'Not Approved', principal_approval: 'Not Approved', headofdepartment_approval: 'Reject',
      remark: 'Medical certificate required', days: 6,
    },
    {
      ApplicationId: 'APP006', name: 'Mr. Arun Saxena', NatureofLeaveapplied: 'Compensatory Leave',
      Reason: 'Worked on annual day function', DatesFrom: '2025-07-01', DatesTo: '2025-07-01',
      leaveapplyon: '2025-06-28', headofdepartment: 'Mr. Deepak Verma',
      status: 'Approved', principal_approval: 'Pending', headofdepartment_approval: 'Approve',
      remark: '', days: 1,
    },
    {
      ApplicationId: 'APP007', name: 'Ms. Pooja Rawat', NatureofLeaveapplied: 'Casual Leave',
      Reason: 'Sibling's wedding ceremony', DatesFrom: '2025-07-05', DatesTo: '2025-07-07',
      leaveapplyon: '2025-07-01', headofdepartment: 'Ms. Kavita Singh',
      status: 'Not Approved', principal_approval: 'Pending', headofdepartment_approval: 'Pending',
      remark: '', days: 3,
    },
    {
      ApplicationId: 'APP008', name: 'Dr. Manish Joshi', NatureofLeaveapplied: 'Maternity Leave',
      Reason: 'Maternity leave as per policy', DatesFrom: '2025-07-10', DatesTo: '2025-09-10',
      leaveapplyon: '2025-07-05', headofdepartment: 'Mr. Ramesh Kumar',
      status: 'Approved', principal_approval: 'Approved', headofdepartment_approval: 'Approve',
      remark: 'Full maternity entitlement granted', days: 62,
    },
  ],
  '2024-25': [
    {
      ApplicationId: 'APP101', name: 'Mr. Rahul Pandey', NatureofLeaveapplied: 'Casual Leave',
      Reason: 'Local travel emergency', DatesFrom: '2024-08-12', DatesTo: '2024-08-12',
      leaveapplyon: '2024-08-11', headofdepartment: 'Mr. Ramesh Kumar',
      status: 'Approved', principal_approval: 'Approved', headofdepartment_approval: 'Approve',
      remark: '', days: 1,
    },
    {
      ApplicationId: 'APP102', name: 'Ms. Nisha Chauhan', NatureofLeaveapplied: 'Medical Leave',
      Reason: 'Dengue fever treatment', DatesFrom: '2024-09-05', DatesTo: '2024-09-10',
      leaveapplyon: '2024-09-04', headofdepartment: 'Ms. Kavita Singh',
      status: 'Approved', principal_approval: 'Approved', headofdepartment_approval: 'Approve',
      remark: 'Medical docs verified', days: 6,
    },
    {
      ApplicationId: 'APP103', name: 'Mr. Deepak Verma', NatureofLeaveapplied: 'Earned Leave',
      Reason: 'Annual family visit', DatesFrom: '2024-10-15', DatesTo: '2024-10-20',
      leaveapplyon: '2024-10-10', headofdepartment: 'Mr. Ramesh Kumar',
      status: 'Not Approved', principal_approval: 'Not Approved', headofdepartment_approval: 'Reject',
      remark: 'Exam duty conflict', days: 6,
    },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusMeta = (s) => {
  if (s === 'Approved') return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckCircle2 }
  if (s === 'Not Approved') return { color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', icon: XCircle }
  return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', icon: MinusCircle }
}

const approvalMeta = (a) => {
  if (a === 'Approve') return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', label: 'Approved', icon: CheckCircle2 }
  if (a === 'Reject') return { color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', label: 'Rejected', icon: XCircle }
  return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', label: 'Pending', icon: MinusCircle }
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
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

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ value }) {
  const { color, icon: Icon } = statusMeta(value)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${color}`}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      {value || 'Pending'}
    </span>
  )
}

// ─── ACTION BUTTON GROUP ──────────────────────────────────────────────────────

function ActionButton({ current, onAction }) {
  const options = ['Approve', 'Reject', 'Pending']
  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => {
        const isActive = current === opt
        const styles = {
          Approve: isActive
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
            : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400',
          Reject: isActive
            ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
            : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
          Pending: isActive
            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
            : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-400',
        }
        const icons = { Approve: CheckCircle2, Reject: XCircle, Pending: MinusCircle }
        const Icon = icons[opt]
        return (
          <button
            key={opt}
            onClick={() => onAction(opt)}
            title={opt}
            className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${styles[opt]}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden lg:inline">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, onAction, onRemark }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
            {row.name.split(' ').slice(-1)[0][0]}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Nature */}
      <td className="px-3 py-3">
        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.NatureofLeaveapplied}</span>
      </td>

      {/* Reason */}
      <td className="px-3 py-3 max-w-[140px]">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">{row.Reason}</span>
      </td>

      {/* From */}
      <td className="px-3 py-3 text-center whitespace-nowrap text-[12px] text-slate-600 dark:text-slate-300">{fmtDate(row.DatesFrom)}</td>

      {/* To */}
      <td className="px-3 py-3 text-center whitespace-nowrap text-[12px] text-slate-600 dark:text-slate-300">{fmtDate(row.DatesTo)}</td>

      {/* Applied On */}
      <td className="px-3 py-3 text-center whitespace-nowrap text-[12px] text-slate-500 dark:text-slate-400">{fmtDate(row.leaveapplyon)}</td>

      {/* Wing Incharge */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.headofdepartment}</span>
      </td>

      {/* Wing Status */}
      <td className="px-3 py-3 text-center"><StatusBadge value={row.status} /></td>

      {/* Principal Status */}
      <td className="px-3 py-3 text-center"><StatusBadge value={row.principal_approval} /></td>

      {/* Action */}
      <td className="px-3 py-3">
        <ActionButton current={row.headofdepartment_approval} onAction={(a) => onAction(row.ApplicationId, a)} />
      </td>

      {/* Remark */}
      <td className="px-3 py-3 min-w-[130px]">
        <input
          type="text"
          value={row.remark}
          onChange={(e) => onRemark(row.ApplicationId, e.target.value)}
          placeholder="Add remark…"
          className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600
            outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
        />
      </td>
    </tr>
  )
}

// ─── MOBILE LEAVE CARD ────────────────────────────────────────────────────────

function MobileCard({ row, idx, onAction, onRemark }) {
  const [expanded, setExpanded] = useState(false)
  const { color: actionColor, label: actionLabel } = approvalMeta(row.headofdepartment_approval)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
          {row.name.split(' ').slice(-1)[0][0]}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${actionColor}`}>
              {actionLabel}
            </span>
          </div>
          <p className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{row.NatureofLeaveapplied}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {fmtDate(row.DatesFrom)} → {fmtDate(row.DatesTo)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {row.days} {row.days === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 mt-1 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-4">

          {/* Reason */}
          <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Reason</p>
            <p className="text-[13px] text-slate-700 dark:text-slate-300">{row.Reason}</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <InfoCell label="Applied On" value={fmtDate(row.leaveapplyon)} icon={Clock} />
            <InfoCell label="Wing Incharge" value={row.headofdepartment} icon={User} />
            <InfoCell label="Wing Status" value={row.status || 'Pending'} icon={BadgeCheck} badge />
            <InfoCell label="Principal Status" value={row.principal_approval || 'Pending'} icon={ShieldAlert} badge />
          </div>

          {/* Action Buttons */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Your Decision</p>
            <div className="flex gap-2">
              {['Approve', 'Reject', 'Pending'].map((opt) => {
                const isActive = row.headofdepartment_approval === opt
                const styles = {
                  Approve: isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  Reject:  isActive ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  Pending: isActive ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                }
                const icons = { Approve: CheckCircle2, Reject: XCircle, Pending: MinusCircle }
                const Icon = icons[opt]
                return (
                  <button
                    key={opt}
                    onClick={() => onAction(row.ApplicationId, opt)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 ${styles[opt]}`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Remark */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
              <Pen className="w-3 h-3" /> Remark
            </p>
            <input
              type="text"
              value={row.remark}
              onChange={(e) => onRemark(row.ApplicationId, e.target.value)}
              placeholder="Add remark (optional)…"
              className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
                bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600
                outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCell({ label, value, icon: Icon, badge }) {
  const meta = badge ? statusMeta(value) : null
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] p-2.5">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 text-slate-400" />
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      </div>
      {badge ? (
        <StatusBadge value={value} />
      ) : (
        <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{value}</p>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, statusFilter, setStatusFilter, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
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
            <NativeSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
            Show Records
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function LeaveApproval() {
  const [session,      setSession]      = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load data ───────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = DUMMY_LEAVES[session] || []
      if (statusFilter === 'Approved')     data = data.filter(r => r.status === 'Approved')
      if (statusFilter === 'Not Approved') data = data.filter(r => r.status === 'Not Approved')
      setRows(data)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} leave application${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [session, statusFilter])

  const handleReset = () => {
    setSession(''); setStatusFilter(''); setRows([])
    setSearch(''); setErrors({}); setShown(false)
  }

  // ── Per-row action / remark ─────────────────────────────────────────────────
  const handleAction = useCallback((id, action) => {
    setRows(prev => prev.map(r =>
      r.ApplicationId === id ? { ...r, headofdepartment_approval: action } : r
    ))
    const labels = { Approve: 'approved', Reject: 'rejected', Pending: 'set to pending' }
    showToast(`Leave ${labels[action] || 'updated'} successfully.`)
  }, [])

  const handleRemark = useCallback((id, val) => {
    setRows(prev => prev.map(r => r.ApplicationId === id ? { ...r, remark: val } : r))
  }, [])

  // ── Search filter ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.NatureofLeaveapplied.toLowerCase().includes(q) ||
      r.Reason.toLowerCase().includes(q) ||
      r.headofdepartment.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Totals ────────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    total: rows.length,
    approved: rows.filter(r => r.headofdepartment_approval === 'Approve').length,
    rejected: rows.filter(r => r.headofdepartment_approval === 'Reject').length,
    pending:  rows.filter(r => r.headofdepartment_approval === 'Pending').length,
  }), [rows])

  const hasResults = shown && rows.length > 0
  const activeFilters = [session, statusFilter].filter(Boolean).length

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty Leave Approval
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Review and approve faculty leave applications session-wise.
          </p>
        </div>

        {/* Breadcrumb — desktop only */}
        <nav className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Leave</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Faculty Approval</span>
        </nav>
      </div>

      {/* ── DESKTOP Filter Card ────────────────────────────────────────────── */}
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
              <NativeSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session}` : 'Set Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {shown && (
          <button
            type="button"
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
        session={session}
        setSession={setSession}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Applications" value={totals.total}    color="blue"    />
            <SummaryCard icon={CheckCircle2} label="Approved"            value={totals.approved} color="emerald" />
            <SummaryCard icon={XCircle}      label="Rejected"            value={totals.rejected} color="rose"    />
            <SummaryCard icon={MinusCircle}  label="Pending"             value={totals.pending}  color="amber"   />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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
                  placeholder="Search name, leave type…"
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
                Use Approve / Reject / Pending buttons to update each application. Add remarks as needed.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        'S.No.', 'Faculty Name', 'Leave Type', 'Reason',
                        'From', 'To', 'Applied On', 'Wing Incharge',
                        'Wing Status', 'Principal Status', 'Action', 'Remark'
                      ].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
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
                        onAction={handleAction}
                        onRemark={handleRemark}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand details and take action.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.ApplicationId}
                      row={row}
                      idx={i + 1}
                      onAction={handleAction}
                      onRemark={handleRemark}
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

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No applications loaded yet</p>
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
