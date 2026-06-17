/**
 * LeaveApplyForm.jsx
 * Staff Leave Application Form — converted from ASPX to React + Tailwind
 * Fully responsive: Desktop ERP table-style | Mobile card/stack layout
 * All ASPX functionality preserved with modern UI
 */

import { useState, useCallback, useMemo } from 'react'
import {
  CalendarDays, User, UserCheck, FileText, MapPin,
  Clock, Upload, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, X, Check, Loader2, RefreshCw,
  ClipboardList, Briefcase, Info, Shield,
  Calendar, Home, ChevronRight, Eye, EyeOff,
  RotateCcw, Send, Bell
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const EMPLOYEE_INFO = {
  name: 'Rajesh Kumar Sharma',
  empId: 'EMP-20240012',
  department: 'Mathematics',
  reportingTo: 'Dr. Anita Verma (Principal)',
  reportingId: 'EMP-20190003',
  applyDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
}

const LEAVE_TYPES = [
  { id: '1', label: 'Casual Leave (CL)',    balance: 8,  color: 'emerald' },
  { id: '2', label: 'Sick Leave (SL)',       balance: 5,  color: 'rose'    },
  { id: '3', label: 'Earned Leave (EL)',     balance: 14, color: 'blue'    },
  { id: '4', label: 'Leave Without Pay (LWP)', balance: 0, color: 'amber' },
  { id: '5', label: 'Other Leave',           balance: 2,  color: 'violet'  },
]

const LEAVE_PERIOD = [
  { value: '1', label: 'Full Day'     },
  { value: '2', label: 'First Half'   },
  { value: '3', label: 'Second Half'  },
]

const LEAVE_BALANCE_COLORS = {
  emerald: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  rose:    { dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'       },
  blue:    { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'       },
  amber:   { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  violet:  { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20' },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function calcDays(from, to, period) {
  if (!from || !to) return 0
  const f = new Date(from), t = new Date(to)
  if (isNaN(f) || isNaN(t) || t < f) return 0
  const diff = Math.floor((t - f) / (1000 * 60 * 60 * 24)) + 1
  if (period === '2' || period === '3') return Math.max(diff * 0.5, 0.5)
  return diff
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function Field({ label, required, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />{hint}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function StyledSelect({ value, onChange, children, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800 cursor-pointer
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function StyledInput({ value, onChange, placeholder, error, disabled, type = 'text', className = '', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
        ${className}`}
      {...rest}
    />
  )
}

function StyledTextarea({ value, onChange, placeholder, error, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
    />
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── CONFIRMATION MODAL ───────────────────────────────────────────────────────

function ConfirmModal({ open, data, onConfirm, onCancel, loading }) {
  if (!open) return null

  const leaveType = LEAVE_TYPES.find(l => l.id === data.leaveType)
  const days = calcDays(data.dateFrom, data.dateTo, data.leavePeriod)
  const period = LEAVE_PERIOD.find(p => p.value === data.leavePeriod)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] w-full max-w-md"
          style={{ animation: 'modalIn .2s ease' }}
        >
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>

          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Confirm Leave Application</h3>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">Please review before submitting</p>
            </div>
            <button onClick={onCancel} className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-3">
            {[
              { label: 'Leave Type',        value: leaveType?.label || '—',             icon: Briefcase    },
              { label: 'Reporting Manager', value: EMPLOYEE_INFO.reportingTo,            icon: UserCheck    },
              { label: 'Leave Period',      value: period?.label || '—',                icon: Clock        },
              { label: 'From Date',         value: formatDateDisplay(data.dateFrom),    icon: CalendarDays },
              { label: 'To Date',           value: formatDateDisplay(data.dateTo),      icon: CalendarDays },
              { label: 'Total Days',        value: `${days} day${days !== 1 ? 's' : ''}`, icon: Calendar  },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-[rgba(99,102,241,0.06)] last:border-0">
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all active:scale-[.98]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Submitting…' : 'Confirm & Submit'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── LEAVE BALANCE STRIP ──────────────────────────────────────────────────────

function LeaveBalanceStrip({ selectedType }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-4 rounded-full bg-emerald-500 flex-shrink-0" />
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Leave Balance</span>
        <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">as of today</span>
      </div>

      {/* Desktop: horizontal strip */}
      <div className="hidden sm:flex flex-wrap gap-3 px-5 py-4">
        {LEAVE_TYPES.map(lt => {
          const colors = LEAVE_BALANCE_COLORS[lt.color]
          const isSelected = selectedType === lt.id
          return (
            <div key={lt.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all
                ${isSelected
                  ? `${colors.badge} scale-105 shadow-md ring-2 ring-offset-1 ring-current`
                  : `${colors.badge}`}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
              <span className="whitespace-nowrap">{lt.label.split('(')[0].trim()}</span>
              <span className="font-bold text-[14px] ml-1 tabular-nums">{lt.balance}</span>
            </div>
          )
        })}
      </div>

      {/* Mobile: 2-col grid */}
      <div className="sm:hidden grid grid-cols-2 gap-2 px-4 py-3">
        {LEAVE_TYPES.map(lt => {
          const colors = LEAVE_BALANCE_COLORS[lt.color]
          const isSelected = selectedType === lt.id
          return (
            <div key={lt.id}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-semibold transition-all
                ${isSelected ? `${colors.badge} ring-2 ring-current` : colors.badge}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
              <div className="min-w-0">
                <p className="text-[10px] opacity-70 leading-tight truncate">{lt.label.split('(')[0].trim()}</p>
                <p className="text-[16px] font-bold tabular-nums leading-tight">{lt.balance}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── EMPLOYEE INFO CARD ───────────────────────────────────────────────────────

function EmployeeInfoCard() {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-blue-600 dark:bg-indigo-600 flex items-center justify-center text-white font-bold text-[18px] flex-shrink-0 shadow-md shadow-blue-200 dark:shadow-indigo-900">
          {EMPLOYEE_INFO.name.split(' ').map(n => n[0]).slice(0,2).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight truncate">{EMPLOYEE_INFO.name}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{EMPLOYEE_INFO.empId} · {EMPLOYEE_INFO.department}</p>
        </div>

        {/* Right meta */}
        <div className="flex flex-col sm:items-end gap-1">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
            <UserCheck className="w-3.5 h-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <span className="truncate max-w-[200px]">{EMPLOYEE_INFO.reportingTo}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <span>Apply Date: <strong className="text-slate-700 dark:text-slate-300">{EMPLOYEE_INFO.applyDate}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DAYS PREVIEW BADGE ───────────────────────────────────────────────────────

function DaysPreview({ dateFrom, dateTo, leavePeriod }) {
  const days = calcDays(dateFrom, dateTo, leavePeriod)
  if (!dateFrom || !dateTo || days <= 0) return null
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <span className="text-[13px] font-semibold text-blue-700 dark:text-blue-300">
        {days} day{days !== 1 ? 's' : ''} of leave applied
      </span>
    </div>
  )
}

// ─── FILE UPLOAD BUTTON ───────────────────────────────────────────────────────

function FileUploadBtn({ file, onChange }) {
  return (
    <label className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all
      ${file
        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/40'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] hover:border-blue-300 dark:hover:border-indigo-400/50 bg-white dark:bg-[#1e2238]'
      }`}>
      <input type="file" className="hidden" onChange={onChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
      {file
        ? <><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" /><span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[180px]">{file.name}</span></>
        : <><Upload className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="text-[12px] text-slate-400">Attach supporting document <span className="text-slate-300">(optional)</span></span></>
      }
    </label>
  )
}

// ─── SECTION CARD WRAPPER ─────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, accent = 'blue', children }) {
  const accents = {
    blue:    'bg-blue-500',
    emerald: 'bg-emerald-500',
    violet:  'bg-violet-500',
    amber:   'bg-amber-500',
  }
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className={`w-1 h-5 rounded-full flex-shrink-0 ${accents[accent]}`} />
        <Icon className={`w-4 h-4 flex-shrink-0 text-${accent}-600 dark:text-${accent}-400`} />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
      {['Home', 'Leave', 'Staff Leave Application'].map((crumb, i, arr) => (
        <span key={crumb} className="flex items-center gap-1.5">
          <span className={i === arr.length - 1
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors'}>
            {crumb}
          </span>
          {i < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
        </span>
      ))}
    </nav>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function LeaveApplyForm() {
  // Form state
  const [leaveType,   setLeaveType]   = useState('')
  const [leavePeriod, setLeavePeriod] = useState('1')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')
  const [reason,      setReason]      = useState('')
  const [address,     setAddress]     = useState('')
  const [file,        setFile]        = useState(null)

  // UI state
  const [errors,      setErrors]      = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [toast,       setToast]       = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const err = {}
    if (!leaveType)                         err.leaveType   = 'Please select leave type'
    if (!dateFrom)                          err.dateFrom    = 'Please select from date'
    if (!dateTo)                            err.dateTo      = 'Please select to date'
    if (dateFrom && dateTo && dateTo < dateFrom) err.dateTo = 'To date must be after from date'
    if (!reason.trim())                     err.reason      = 'Please enter reason for leave'
    if (!address.trim())                    err.address     = 'Please enter your contact address'
    return err
  }, [leaveType, dateFrom, dateTo, reason, address])

  // ── Apply button → open confirm modal ────────────────────────────────────
  const handleApply = useCallback(() => {
    const err = validate()
    setErrors(err)
    if (Object.keys(err).length) {
      showToast('Please fill all required fields.', 'error')
      return
    }
    setShowConfirm(true)
  }, [validate])

  // ── Confirm submit (API placeholder) ─────────────────────────────────────
  const handleConfirm = useCallback(() => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setShowConfirm(false)
      setSubmitted(true)
      showToast('Leave application submitted successfully!')
    }, 1500)
  }, [])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setLeaveType(''); setLeavePeriod('1'); setDateFrom(''); setDateTo('')
    setReason(''); setAddress(''); setFile(null); setErrors({})
    setSubmitted(false)
  }

  // ── Computed values ───────────────────────────────────────────────────────
  const days        = useMemo(() => calcDays(dateFrom, dateTo, leavePeriod), [dateFrom, dateTo, leavePeriod])
  const selectedLT  = LEAVE_TYPES.find(l => l.id === leaveType)
  const formData    = { leaveType, leavePeriod, dateFrom, dateTo, reason, address }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="space-y-4 pb-10">
        <Breadcrumb />
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-800 dark:text-slate-100">Application Submitted!</h2>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              Your leave application has been sent to <strong className="text-slate-700 dark:text-slate-300">{EMPLOYEE_INFO.reportingTo}</strong> for approval.
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm w-full max-w-sm p-5 text-left space-y-3">
            {[
              { label: 'Leave Type', value: selectedLT?.label },
              { label: 'Period',     value: LEAVE_PERIOD.find(p => p.value === leavePeriod)?.label },
              { label: 'From',       value: formatDateDisplay(dateFrom) },
              { label: 'To',         value: formatDateDisplay(dateTo)   },
              { label: 'Days',       value: `${days} day${days !== 1 ? 's' : ''}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-[13px] border-b border-slate-50 dark:border-[rgba(99,102,241,0.06)] pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95">
              <RotateCcw className="w-4 h-4" /> Apply Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN FORM ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Staff Leave Application
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Submit your leave request — it will go to your reporting manager for approval.
          </p>
        </div>
        <button onClick={handleReset}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
            bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors self-start">
          <RefreshCw className="w-3.5 h-3.5" /> Reset Form
        </button>
      </div>

      {/* ── Employee Info ───────────────────────────────────────────────────── */}
      <EmployeeInfoCard />

      {/* ── Leave Balance ───────────────────────────────────────────────────── */}
      <LeaveBalanceStrip selectedType={leaveType} />

      {/* ── Section 1: Leave Details ────────────────────────────────────────── */}
      <SectionCard title="Leave Details" icon={Briefcase} accent="blue">
        {/* Desktop: 4-col grid | Mobile: 1-col stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Leave Type */}
          <Field label="Leave Type" required error={errors.leaveType}>
            <StyledSelect value={leaveType} onChange={e => { setLeaveType(e.target.value); setErrors(p => ({...p, leaveType: undefined})) }} error={errors.leaveType}>
              <option value="">-- Select Leave Type --</option>
              {LEAVE_TYPES.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.label} (Bal: {lt.balance})</option>
              ))}
            </StyledSelect>
          </Field>

          {/* Leave Time */}
          <Field label="Leave Time" required>
            <StyledSelect value={leavePeriod} onChange={e => setLeavePeriod(e.target.value)}>
              {LEAVE_PERIOD.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </StyledSelect>
          </Field>

          {/* Date From */}
          <Field label="Date From" required error={errors.dateFrom}>
            <StyledInput
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setErrors(p => ({...p, dateFrom: undefined})) }}
              error={errors.dateFrom}
              max={dateTo || undefined}
            />
          </Field>

          {/* Date To */}
          <Field label="Date To" required error={errors.dateTo}>
            <StyledInput
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setErrors(p => ({...p, dateTo: undefined})) }}
              error={errors.dateTo}
              min={dateFrom || undefined}
            />
          </Field>
        </div>

        {/* Days preview */}
        {days > 0 && (
          <div className="mt-3">
            <DaysPreview dateFrom={dateFrom} dateTo={dateTo} leavePeriod={leavePeriod} />
          </div>
        )}

        {/* Balance warning */}
        {selectedLT && days > selectedLT.balance && selectedLT.id !== '4' && (
          <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">
              You are applying for <strong>{days} day{days !== 1 ? 's' : ''}</strong> but only have <strong>{selectedLT.balance} day{selectedLT.balance !== 1 ? 's' : ''}</strong> balance. Excess leave may be Leave Without Pay.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── Section 2: Reason & Address ─────────────────────────────────────── */}
      <SectionCard title="Reason & Contact Details" icon={FileText} accent="violet">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Reason for Leave" required error={errors.reason}
            hint="Briefly describe why you're applying for leave">
            <StyledTextarea
              value={reason}
              onChange={e => { setReason(e.target.value); setErrors(p => ({...p, reason: undefined})) }}
              placeholder="e.g. Fever and doctor's advice to rest for 2 days…"
              error={errors.reason}
              rows={4}
            />
          </Field>

          <Field label="Contact Address / Number on Leave" required error={errors.address}
            hint="Provide your address or phone number if away from usual residence">
            <StyledTextarea
              value={address}
              onChange={e => { setAddress(e.target.value); setErrors(p => ({...p, address: undefined})) }}
              placeholder="House address or mobile number where you can be reached…"
              error={errors.address}
              rows={4}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 3: Attachment & Submit ──────────────────────────────────── */}
      <SectionCard title="Supporting Document & Submit" icon={Upload} accent="emerald">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* File Upload */}
          <div className="flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
              Attach Document <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </p>
            <FileUploadBtn file={file} onChange={e => setFile(e.target.files?.[0] || null)} />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />Supported: PDF, JPG, PNG, DOC · Max 5MB
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile reset */}
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors sm:hidden">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-[14px] font-bold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-lg shadow-blue-500/25 transition-all active:scale-[.98] w-full sm:w-auto justify-center">
              <Send className="w-4 h-4" />
              Submit Application
            </button>
          </div>
        </div>

        {/* Quick summary strip (if form is filled) */}
        {leaveType && dateFrom && dateTo && days > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-[rgba(99,102,241,0.1)]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />Application Summary
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Type',   value: selectedLT?.label.split('(')[0].trim() },
                { label: 'Period', value: LEAVE_PERIOD.find(p => p.value === leavePeriod)?.label },
                { label: 'From',   value: formatDateDisplay(dateFrom) },
                { label: 'To',     value: formatDateDisplay(dateTo)   },
                { label: 'Days',   value: `${days} day${days !== 1 ? 's' : ''}` },
              ].map(({ label, value }) => value && (
                <span key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.15)] text-[12px]">
                  <span className="text-slate-400 dark:text-slate-500">{label}:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{value}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Confirmation Modal ───────────────────────────────────────────────── */}
      <ConfirmModal
        open={showConfirm}
        data={formData}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        loading={submitting}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
