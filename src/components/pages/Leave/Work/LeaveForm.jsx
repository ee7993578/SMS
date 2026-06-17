/**
 * LeaveForm.jsx
 * Faculty Leave Application — converted from ASPX to React + Tailwind
 *
 * Features:
 *  - Wing Incharge selection (dropdown)
 *  - Full leave application form (name, designation, dept, nature, reason, dates, etc.)
 *  - Medical certificate section with file upload
 *  - Leave Record grid (type, due, now applied, balance)
 *  - HR remarks + principal signature area
 *  - Full client-side validation (required fields highlighted)
 *  - Toast notifications
 *  - Mobile: stacked card layout, thumb-friendly
 *  - Desktop: dense ERP-style two-column form
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  User, Briefcase, Building2, FileText, Calendar,
  AlertCircle, Check, X, Loader2, ChevronDown,
  Upload, ClipboardList, MessageSquare, MapPin,
  PenLine, Save, RefreshCw, Info, Shield,
  ChevronRight, ChevronUp, Clock, Users,
  BookOpen, SlidersHorizontal, Eye
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const WING_INCHARGES = [
  { id: '0', name: '-- Select Wing Incharge --' },
  { id: '1', name: 'Dr. Rajesh Kumar Sharma' },
  { id: '2', name: 'Mrs. Sunita Agarwal' },
  { id: '3', name: 'Mr. Pankaj Verma' },
  { id: '4', name: 'Dr. Meena Chauhan' },
  { id: '5', name: 'Mr. Arvind Singh Rawat' },
]

const LEAVE_TYPES = [
  { id: 1, leavetypeid: 'CL',  leavetypeDisplay: 'Casual Leave',     balance: 12 },
  { id: 2, leavetypeid: 'EL',  leavetypeDisplay: 'Earned Leave',     balance: 18 },
  { id: 3, leavetypeid: 'ML',  leavetypeDisplay: 'Medical Leave',    balance: 8  },
  { id: 4, leavetypeid: 'COL', leavetypeDisplay: 'Commuted Leave',   balance: 5  },
  { id: 5, leavetypeid: 'HPL', leavetypeDisplay: 'Half Pay Leave',   balance: 10 },
]

const TODAY = new Date().toISOString().split('T')[0]

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

/** Dropdown with chevron */
function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
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

/** Form field wrapper with label + error */
function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** Text input */
function Input({ value, onChange, placeholder, error, disabled, readOnly, type = 'text', multiline = false }) {
  const base = `w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
    bg-white text-slate-800 placeholder-slate-300
    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
    disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-slate-50 read-only:text-slate-500
    ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`

  if (multiline) return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={3}
      className={`${base} resize-none`}
    />
  )
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={base}
    />
  )
}

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
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

/** Section card wrapper */
function SectionCard({ title, icon: Icon, children, accent = 'blue', collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const colors = {
    blue:    'bg-blue-50 text-blue-600 border-blue-500',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-500',
    violet:  'bg-violet-50 text-violet-600 border-violet-500',
    amber:   'bg-amber-50 text-amber-600 border-amber-500',
  }
  const accentBar = {
    blue: 'bg-blue-500', emerald: 'bg-emerald-500',
    violet: 'bg-violet-500', amber: 'bg-amber-500',
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setOpen(p => !p) : undefined}
      >
        <span className={`w-1 h-5 rounded-full flex-shrink-0 ${accentBar[accent]}`} />
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[accent]}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">{title}</span>
        {collapsible && (
          <span className="text-slate-400">{open ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
        )}
      </div>
      {(!collapsible || open) && (
        <div className="p-5">{children}</div>
      )}
    </div>
  )
}

/** Leave record row in the grid */
function LeaveRow({ row, idx, onNowChange }) {
  const balance = row.balance - (Number(row.nowApplied) || 0)
  const isNegative = balance < 0

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* Leave Type */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            {row.leavetypeid}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.leavetypeDisplay}</span>
        </div>
      </td>
      {/* Leave Due */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-10 h-7 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {row.balance}
        </span>
      </td>
      {/* Now Applied */}
      <td className="px-3 py-2.5 text-center">
        <input
          type="number"
          min="0"
          max={row.balance}
          value={row.nowApplied}
          onChange={e => onNowChange(idx, e.target.value)}
          className="w-16 text-center py-1.5 px-2 rounded-lg border text-[13px] font-semibold outline-none transition-all
            border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="0"
        />
      </td>
      {/* Balance if sanctioned */}
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center w-10 h-7 rounded-lg text-[13px] font-bold tabular-nums
          ${isNegative
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
          {balance}
        </span>
      </td>
    </tr>
  )
}

/** Mobile leave record card */
function LeaveCardMobile({ row, idx, onNowChange }) {
  const balance = row.balance - (Number(row.nowApplied) || 0)
  const isNegative = balance < 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-[#1e2238] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
            {row.leavetypeid}
          </span>
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{row.leavetypeDisplay}</span>
        </div>
        <span className="text-[12px] font-semibold text-slate-400">Due: <span className="text-blue-600 dark:text-blue-400">{row.balance}</span></span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Now Applied</p>
          <input
            type="number"
            min="0"
            max={row.balance}
            value={row.nowApplied}
            onChange={e => onNowChange(idx, e.target.value)}
            className="w-full py-2 px-3 rounded-lg border text-[13px] font-semibold outline-none text-center
              border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1a1f35] text-slate-800 dark:text-slate-200
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="0"
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Balance if Sanctioned</p>
          <div className={`py-2 px-3 rounded-lg text-[13px] font-bold text-center
            ${isNegative
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'}`}>
            {balance}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function LeaveForm() {
  // ── Form State ────────────────────────────────────────────────────────────
  const [wingIncharge, setWingIncharge] = useState('0')
  const [name,         setName]         = useState('')
  const [appointment,  setAppointment]  = useState('')
  const [department,   setDepartment]   = useState('')
  const [natureLeave,  setNatureLeave]  = useState('')
  const [reason,       setReason]       = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [sinceDate,    setSinceDate]    = useState('')
  const [medDate,      setMedDate]      = useState('')
  const [doctor,       setDoctor]       = useState('')
  const [medFile,      setMedFile]      = useState(null)
  const [completeAdd,  setCompleteAdd]  = useState('')
  const [appDate,      setAppDate]      = useState(TODAY)
  const [remarks,      setRemarks]      = useState('')

  // Leave grid rows (with nowApplied per row)
  const [leaveRows, setLeaveRows] = useState(
    LEAVE_TYPES.map(r => ({ ...r, nowApplied: '' }))
  )

  // UI State
  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState(null)

  const fileInputRef = useRef(null)

  // ── Auto-fill name on wing incharge select ────────────────────────────────
  const selectedIncharge = useMemo(
    () => WING_INCHARGES.find(w => w.id === wingIncharge),
    [wingIncharge]
  )

  // ── Leave row update ──────────────────────────────────────────────────────
  const handleNowChange = useCallback((idx, val) => {
    setLeaveRows(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], nowApplied: val }
      return next
    })
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (wingIncharge === '0') err.wingIncharge = 'Please select wing incharge'
    if (!name.trim())         err.name         = 'Name is required'
    if (!appointment.trim())  err.appointment  = 'Appointment / designation is required'
    if (!department.trim())   err.department   = 'Department / branch is required'
    if (!natureLeave.trim())  err.natureLeave  = 'Nature of leave is required'
    if (!reason.trim())       err.reason       = 'Reason is required'
    if (!dateFrom)            err.dateFrom     = 'From date is required'
    if (!dateTo)              err.dateTo       = 'To date is required'
    if (dateFrom && dateTo && dateTo < dateFrom) err.dateTo = 'To date cannot be before From date'
    return err
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const err = validate()
    if (Object.keys(err).length) {
      setErrors(err)
      showToast('Please fill all required fields.', 'error')
      // scroll to first error
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      showToast('Leave application submitted successfully!')
      handleReset()
    }, 1500)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setWingIncharge('0'); setName(''); setAppointment(''); setDepartment('')
    setNatureLeave(''); setReason(''); setDateFrom(''); setDateTo('')
    setSinceDate(''); setMedDate(''); setDoctor(''); setMedFile(null)
    setCompleteAdd(''); setAppDate(TODAY); setRemarks('')
    setLeaveRows(LEAVE_TYPES.map(r => ({ ...r, nowApplied: '' })))
    setErrors({})
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1221] py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span>Leave</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Faculty Leave Application</span>
            </nav>
            <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </span>
              Faculty Leave Application
            </h1>
            <p className="text-[13px] text-slate-400 mt-1">Fill the form carefully. All <span className="text-rose-500 font-semibold">*</span> fields are mandatory.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
                text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </div>

        {/* ── SECTION 1: Applicant Details ─────────────────────────────────── */}
        <SectionCard title="Applicant Details" icon={User} accent="blue">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Wing Incharge */}
            <div className="sm:col-span-2" data-error={!!errors.wingIncharge}>
              <Field label="Wing Incharge" icon={Users} error={errors.wingIncharge} required>
                <NativeSelect
                  value={wingIncharge}
                  onChange={e => { setWingIncharge(e.target.value); setErrors(p => ({ ...p, wingIncharge: undefined })) }}
                  error={errors.wingIncharge}
                >
                  {WING_INCHARGES.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            {/* Name (auto-filled in real app, here manual) */}
            <div className="sm:col-span-2" data-error={!!errors.name}>
              <Field label="Full Name" icon={User} error={errors.name} required>
                <Input
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                  placeholder="Enter full name"
                  error={errors.name}
                />
              </Field>
            </div>

            {/* Appointment / Designation */}
            <div data-error={!!errors.appointment}>
              <Field label="Appointment / Designation" icon={Briefcase} error={errors.appointment} required>
                <Input
                  value={appointment}
                  onChange={e => { setAppointment(e.target.value); setErrors(p => ({ ...p, appointment: undefined })) }}
                  placeholder="e.g. Assistant Professor"
                  error={errors.appointment}
                />
              </Field>
            </div>

            {/* Department */}
            <div data-error={!!errors.department}>
              <Field label="Department / Branch / Office" icon={Building2} error={errors.department} required>
                <Input
                  value={department}
                  onChange={e => { setDepartment(e.target.value); setErrors(p => ({ ...p, department: undefined })) }}
                  placeholder="e.g. Science Department"
                  error={errors.department}
                />
              </Field>
            </div>

            {/* Nature of Leave */}
            <div data-error={!!errors.natureLeave}>
              <Field label="Nature of Leave Applied" icon={ClipboardList} error={errors.natureLeave} required>
                <Input
                  value={natureLeave}
                  onChange={e => { setNatureLeave(e.target.value); setErrors(p => ({ ...p, natureLeave: undefined })) }}
                  placeholder="e.g. Casual Leave"
                  error={errors.natureLeave}
                />
              </Field>
            </div>

            {/* Reason */}
            <div data-error={!!errors.reason}>
              <Field label="Reason for Leave" icon={MessageSquare} error={errors.reason} required>
                <Input
                  value={reason}
                  onChange={e => { setReason(e.target.value); setErrors(p => ({ ...p, reason: undefined })) }}
                  placeholder="Brief reason for leave"
                  error={errors.reason}
                  multiline
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 2: Leave Dates ───────────────────────────────────────── */}
        <SectionCard title="Leave Duration" icon={Calendar} accent="emerald">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* From */}
            <div data-error={!!errors.dateFrom}>
              <Field label="Date From" icon={Calendar} error={errors.dateFrom} required>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setErrors(p => ({ ...p, dateFrom: undefined })) }}
                  error={errors.dateFrom}
                />
              </Field>
            </div>

            {/* To */}
            <div data-error={!!errors.dateTo}>
              <Field label="Date To" icon={Calendar} error={errors.dateTo} required>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setErrors(p => ({ ...p, dateTo: undefined })) }}
                  error={errors.dateTo}
                />
              </Field>
            </div>

            {/* Duration pill */}
            {dateFrom && dateTo && dateTo >= dateFrom && (
              <div className="sm:col-span-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold">
                  <Clock className="w-4 h-4" />
                  Duration: {Math.ceil((new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                </div>
              </div>
            )}

            {/* Extension info */}
            <div className="sm:col-span-2">
              <Field label="Extension of Previous Leave — Date Since on Leave (if applicable)" icon={Info}>
                <Input
                  value={sinceDate}
                  onChange={e => setSinceDate(e.target.value)}
                  placeholder="Leave this blank if not an extension"
                  multiline
                />
              </Field>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                <Info className="w-3 h-3 flex-shrink-0" />
                Fill only if you are applying for an extension of previously approved leave.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 3: Medical Certificate ──────────────────────────────── */}
        <SectionCard title="Medical Certificate (Commuted Leave Only)" icon={Shield} accent="violet" collapsible defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Certificate Date" icon={Calendar}>
              <Input
                type="date"
                value={medDate}
                onChange={e => setMedDate(e.target.value)}
              />
            </Field>

            <Field label="Issued by Dr." icon={User}>
              <Input
                value={doctor}
                onChange={e => setDoctor(e.target.value)}
                placeholder="Doctor's name"
              />
            </Field>

            {/* File Upload */}
            <div className="sm:col-span-2">
              <Field label="Upload Medical Certificate" icon={Upload}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    hover:border-blue-400 dark:hover:border-indigo-400 cursor-pointer transition-all
                    bg-slate-50 dark:bg-[#1e2238]/50 group"
                >
                  <span className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  <div className="flex-1 min-w-0">
                    {medFile
                      ? <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{medFile.name}</p>
                      : <p className="text-[13px] text-slate-400">Click to upload PDF / Image</p>
                    }
                    <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5">Max 5MB · PDF, JPG, PNG</p>
                  </div>
                  {medFile && (
                    <button
                      onClick={e => { e.stopPropagation(); setMedFile(null) }}
                      className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => setMedFile(e.target.files?.[0] || null)}
                />
              </Field>
            </div>

            {/* Approval note */}
            <div className="sm:col-span-2">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 dark:text-amber-400">
                  Medical certificate must be approved by the school, along with fitness certificate upon return.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 4: Address & Signature ──────────────────────────────── */}
        <SectionCard title="Address & Applicant Signature" icon={MapPin} accent="amber">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <Field label="Complete Address on Leave (if away from formal residence)" icon={MapPin}>
                <Input
                  value={completeAdd}
                  onChange={e => setCompleteAdd(e.target.value)}
                  placeholder="Enter address where you can be reached during leave"
                  multiline
                />
              </Field>
            </div>

            <Field label="Application Date" icon={Calendar}>
              <Input
                type="date"
                value={appDate}
                onChange={e => setAppDate(e.target.value)}
                readOnly
              />
            </Field>

            {/* Signature placeholder */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 text-slate-400" />
                Signature of Applicant
              </label>
              <div className="h-[42px] rounded-xl border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50 dark:bg-[#1e2238]/50 flex items-center justify-center">
                <span className="text-[12px] text-slate-300 dark:text-slate-600 italic">Physical signature required on printout</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 5: Leave Record (To be filled by Faculty) ────────────── */}
        <SectionCard title="Leave Record — To Be Filled By Faculty" icon={BookOpen} accent="blue">

          {/* Subtitle */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <ClipboardList className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-[13px] font-semibold text-blue-700 dark:text-blue-400 underline decoration-dotted">Leave Record</span>
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
                  {['Leave Type', 'Leave Due', 'Leave Now Applied For', 'Balance, If Sanctioned'].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaveRows.map((row, idx) => (
                  <LeaveRow key={row.id} row={row} idx={idx} onNowChange={handleNowChange} />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden space-y-3">
            <p className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium pb-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Enter the number of days for each leave type you are applying for.
            </p>
            {leaveRows.map((row, idx) => (
              <LeaveCardMobile key={row.id} row={row} idx={idx} onNowChange={handleNowChange} />
            ))}
          </div>

          {/* Total applied summary */}
          {leaveRows.some(r => Number(r.nowApplied) > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {leaveRows.filter(r => Number(r.nowApplied) > 0).map(r => (
                <span key={r.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
                    bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400
                    border border-indigo-100 dark:border-indigo-500/20">
                  <ClipboardList className="w-3 h-3" />
                  {r.leavetypeDisplay}: <span className="font-bold">{r.nowApplied}</span> day(s)
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 6: HR Remarks & Principal ───────────────────────────── */}
        <SectionCard title="HR & Principal Section" icon={PenLine} accent="violet">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <Field label="Remarks by In-charge (HR)" icon={MessageSquare}>
                <Input
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Remarks by the HR in-charge"
                  multiline
                />
              </Field>
            </div>

            {/* Principal signature */}
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <PenLine className="w-3.5 h-3.5 text-slate-400" />
                Signature of Principal
              </label>
              <div className="h-20 rounded-xl border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50 dark:bg-[#1e2238]/50 flex flex-col items-center justify-center gap-1">
                <span className="text-[12px] text-slate-300 dark:text-slate-600 italic">Physical signature required</span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">(Principal)</span>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 w-full">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  This section is to be completed by the HR department after reviewing the leave application.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Validation Summary ───────────────────────────────────────────── */}
        {Object.keys(errors).length > 0 && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-500/25 bg-rose-50 dark:bg-rose-500/[0.07] px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span className="text-[13px] font-bold text-rose-700 dark:text-rose-400">Please fix the following errors:</span>
            </div>
            <ul className="space-y-1">
              {Object.values(errors).filter(Boolean).map((e, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[12px] text-rose-600 dark:text-rose-400">
                  <span className="w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Bottom Actions ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[14px] font-bold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'Submitting Application…' : 'Submit Application'}
          </button>
          <button onClick={handleReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold
              bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
              text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Reset Form
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
