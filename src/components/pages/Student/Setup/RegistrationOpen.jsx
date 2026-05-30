/**
 * RegistrationOpen.jsx
 * Folder: src/pages/Registration/RegistrationOpen.jsx
 *
 * Converts legacy ASPX "Registration Open" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session & Class dropdowns
 *  - Open/Close date pickers
 *  - Min/Max Age (Year + Month)
 *  - Fee Amount
 *  - Status (Active/Inactive)
 *  - Student Type (External/Internal) — conditionally visible
 *  - Save / Cancel form actions
 *  - GridView with Edit inline
 *  - Session filter for grid
 *  - Desktop: ERP-style dense table
 *  - Mobile: card-based layout with expandable rows
 *  - Full validation matching ASPX logic
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Plus, X, Check, AlertCircle, Loader2, ChevronDown,
  Edit2, RefreshCw, Filter, SlidersHorizontal,
  Calendar, DollarSign, Users, BookOpen,
  Clock, ChevronRight, Info, Search,
  CheckCircle2, XCircle, Tag, GraduationCap,
  Home, ArrowRight, Save
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: '1',  name: 'Nursery' },
  { id: '2',  name: 'LKG' },
  { id: '3',  name: 'UKG' },
  { id: '4',  name: 'Class I' },
  { id: '5',  name: 'Class II' },
  { id: '6',  name: 'Class III' },
  { id: '7',  name: 'Class IV' },
  { id: '8',  name: 'Class V' },
  { id: '9',  name: 'Class VI' },
  { id: '10', name: 'Class VII' },
  { id: '11', name: 'Class VIII' },
  { id: '12', name: 'Class IX' },
  { id: '13', name: 'Class X' },
  { id: '14', name: 'Class XI' },
  { id: '15', name: 'Class XII' },
]

// Classes that require student type selection (XI & XII = external/internal stream)
const CLASSES_NEEDING_STUDENT_TYPE = ['14', '15']

const INITIAL_GRID_DATA = [
  {
    id: 1,
    class_Id: '14', class_name: 'Class XI',
    openDate: '2025-03-01', closeDate: '2025-04-30',
    minAge: '14Y 0M', maxAge: '17Y 6M',
    feeAmount: 1500,
    studentType: 'External',
    status: 'Active',
    session: '2025-26',
  },
  {
    id: 2,
    class_Id: '1', class_name: 'Nursery',
    openDate: '2025-02-15', closeDate: '2025-03-31',
    minAge: '3Y 0M', maxAge: '4Y 6M',
    feeAmount: 500,
    studentType: '',
    status: 'Active',
    session: '2025-26',
  },
  {
    id: 3,
    class_Id: '4', class_name: 'Class I',
    openDate: '2025-02-15', closeDate: '2025-03-31',
    minAge: '5Y 6M', maxAge: '7Y 0M',
    feeAmount: 600,
    studentType: '',
    status: 'InActive',
    session: '2025-26',
  },
  {
    id: 4,
    class_Id: '9', class_name: 'Class VI',
    openDate: '2024-12-01', closeDate: '2025-01-31',
    minAge: '10Y 0M', maxAge: '12Y 6M',
    feeAmount: 800,
    studentType: '',
    status: 'Active',
    session: '2024-25',
  },
  {
    id: 5,
    class_Id: '15', class_name: 'Class XII',
    openDate: '2024-11-01', closeDate: '2024-12-31',
    minAge: '15Y 0M', maxAge: '18Y 0M',
    feeAmount: 1500,
    studentType: 'Internal',
    status: 'Active',
    session: '2024-25',
  },
]

// ─── EMPTY FORM STATE ─────────────────────────────────────────────────────────
const emptyForm = () => ({
  session: '',
  classId: '',
  openDate: '',
  closeDate: '',
  minAgeYear: '',
  minAgeMonth: '',
  maxAgeYear: '',
  maxAgeMonth: '',
  feeAmount: '',
  status: '1',
  studentType: '',
})

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
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
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, maxLength, onKeyPress, disabled, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      onKeyPress={onKeyPress}
      disabled={disabled}
      className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
  )
}

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 mb-4">
      <Home className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="hover:text-blue-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Home</span>
      <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-50" />
      <span className="font-semibold text-slate-700 dark:text-slate-200">Registration Open</span>
    </nav>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = status === 'Active'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold
      ${isActive
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
      }`}>
      {isActive
        ? <CheckCircle2 className="w-3 h-3" />
        : <XCircle className="w-3 h-3" />}
      {status}
    </span>
  )
}

// ─── MOBILE GRID CARD ─────────────────────────────────────────────────────────
function MobileGridCard({ row, onEdit }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
          <GraduationCap className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.class_name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={row.status} />
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{row.session}</span>
            {row.studentType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                <Tag className="w-3 h-3" />{row.studentType}
              </span>
            )}
          </div>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 mt-0.5 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Summary Row */}
      <div className="px-4 pb-3 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-semibold">Open</p>
          <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(row.openDate)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-semibold">Close</p>
          <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(row.closeDate)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-semibold">Fee</p>
          <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(row.feeAmount)}</p>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Min Age</p>
              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{row.minAge || '—'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Max Age</p>
              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{row.maxAge || '—'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit Record
          </button>
        </div>
      )}
    </div>
  )
}

// ─── FORM PANEL ───────────────────────────────────────────────────────────────
function FormPanel({ form, setForm, onSave, onCancel, loading, isEdit }) {
  const [errors, setErrors] = useState({})

  // Only numeric keys
  const onlyNumbers = (e) => {
    const c = e.which || e.keyCode
    if (c > 31 && (c < 48 || c > 57)) e.preventDefault()
  }

  const needsStudentType = CLASSES_NEEDING_STUDENT_TYPE.includes(form.classId)

  const validate = () => {
    const err = {}
    if (!form.session) err.session = 'Required'
    if (!form.classId) err.classId = 'Required'
    if (!form.openDate) err.openDate = 'Required'
    if (!form.closeDate) err.closeDate = 'Required'
    if (!form.status) err.status = 'Required'
    if (needsStudentType && !form.studentType) err.studentType = 'Required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSave = () => {
    if (validate()) onSave(form)
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-blue-50/70 to-indigo-50/30 dark:from-white/[0.03] dark:to-transparent">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
          {isEdit ? 'Edit Registration' : 'Add New Registration'}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Row 1: Session + Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={form.session} onChange={set('session')} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.classId} required>
            <NativeSelect
              value={form.classId}
              onChange={(e) => {
                setForm(f => ({ ...f, classId: e.target.value, studentType: '' }))
                setErrors(p => ({ ...p, classId: undefined }))
              }}
              placeholder="-- Select Class --"
              error={errors.classId}
            >
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Row 2: Open + Close Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Open Date" error={errors.openDate} required>
            <TextInput type="date" value={form.openDate} onChange={set('openDate')} error={errors.openDate} />
          </Field>
          <Field label="Close Date" error={errors.closeDate} required>
            <TextInput type="date" value={form.closeDate} onChange={set('closeDate')} error={errors.closeDate} />
          </Field>
        </div>

        {/* Row 3: Age */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Age Range</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Min Age (Year)">
              <TextInput value={form.minAgeYear} onChange={set('minAgeYear')} placeholder="0" maxLength={2} onKeyPress={onlyNumbers} />
            </Field>
            <Field label="Min Age (Month)">
              <TextInput value={form.minAgeMonth} onChange={set('minAgeMonth')} placeholder="0" maxLength={2} onKeyPress={onlyNumbers} />
            </Field>
            <Field label="Max Age (Year)">
              <TextInput value={form.maxAgeYear} onChange={set('maxAgeYear')} placeholder="0" maxLength={2} onKeyPress={onlyNumbers} />
            </Field>
            <Field label="Max Age (Month)">
              <TextInput value={form.maxAgeMonth} onChange={set('maxAgeMonth')} placeholder="0" maxLength={2} onKeyPress={onlyNumbers} />
            </Field>
          </div>
        </div>

        {/* Row 4: Fee + Status + Student Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Fee Amount">
            <TextInput value={form.feeAmount} onChange={set('feeAmount')} placeholder="0" onKeyPress={onlyNumbers} />
          </Field>
          <Field label="Status" error={errors.status} required>
            <NativeSelect value={form.status} onChange={set('status')} error={errors.status}>
              <option value="1">Active</option>
              <option value="0">InActive</option>
            </NativeSelect>
          </Field>
          {needsStudentType && (
            <Field label="Student Type" error={errors.studentType} required>
              <NativeSelect value={form.studentType} onChange={set('studentType')} placeholder="-- Select Type --" error={errors.studentType}>
                <option value="External">External</option>
                <option value="Internal">Internal</option>
              </NativeSelect>
            </Field>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Update' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
              dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
      <td className="px-4 py-3">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.class_name}</span>
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
        {formatDate(row.openDate)}
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
        {formatDate(row.closeDate)}
      </td>
      <td className="px-4 py-3 text-center text-[12px] text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
          {row.minAge || '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-[12px] text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
          {row.maxAge || '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {formatCurrency(row.feeAmount)}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {row.studentType
          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
              <Tag className="w-3 h-3" />{row.studentType}
            </span>
          : <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
        }
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3 text-center text-[12px] text-slate-500 dark:text-slate-400">
        {row.session}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, gridSession, setGridSession }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Records</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Session">
            <NativeSelect value={gridSession} onChange={e => setGridSession(e.target.value)} placeholder="-- All Sessions --">
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button type="button" onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 transition-colors">
            Apply Filter
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RegistrationOpen() {
  const [gridData,     setGridData]     = useState(INITIAL_GRID_DATA)
  const [showForm,     setShowForm]     = useState(false)
  const [form,         setForm]         = useState(emptyForm())
  const [editId,       setEditId]       = useState(null)
  const [formLoading,  setFormLoading]  = useState(false)
  const [gridSession,  setGridSession]  = useState('')
  const [mobileFilter, setMobileFilter] = useState(false)
  const [search,       setSearch]       = useState('')
  const [toast,        setToast]        = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Edit row ──────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    const ageToYM = (ageStr = '') => {
      const [y = '', m = ''] = ageStr.replace(/[YM]/g, '').split(' ').filter(Boolean)
      return { year: y.trim(), month: m.trim() }
    }
    const minParts = ageToYM(row.minAge)
    const maxParts = ageToYM(row.maxAge)

    setForm({
      session: row.session,
      classId: row.class_Id,
      openDate: row.openDate,
      closeDate: row.closeDate,
      minAgeYear:  minParts.year,
      minAgeMonth: minParts.month,
      maxAgeYear:  maxParts.year,
      maxAgeMonth: maxParts.month,
      feeAmount: String(row.feeAmount),
      status: row.status === 'Active' ? '1' : '0',
      studentType: row.studentType || '',
    })
    setEditId(row.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback((f) => {
    setFormLoading(true)
    const className = CLASSES.find(c => c.id === f.classId)?.name || ''
    const buildAge = (y, m) => (y || m) ? `${y || 0}Y ${m || 0}M` : ''

    setTimeout(() => {
      if (editId !== null) {
        setGridData(prev => prev.map(r =>
          r.id === editId ? {
            ...r,
            class_Id: f.classId, class_name: className,
            openDate: f.openDate, closeDate: f.closeDate,
            minAge: buildAge(f.minAgeYear, f.minAgeMonth),
            maxAge: buildAge(f.maxAgeYear, f.maxAgeMonth),
            feeAmount: Number(f.feeAmount) || 0,
            status: f.status === '1' ? 'Active' : 'InActive',
            studentType: f.studentType,
            session: f.session,
          } : r
        ))
        showToast('Record updated successfully!')
      } else {
        const newRow = {
          id: Date.now(),
          class_Id: f.classId, class_name: className,
          openDate: f.openDate, closeDate: f.closeDate,
          minAge: buildAge(f.minAgeYear, f.minAgeMonth),
          maxAge: buildAge(f.maxAgeYear, f.maxAgeMonth),
          feeAmount: Number(f.feeAmount) || 0,
          status: f.status === '1' ? 'Active' : 'InActive',
          studentType: f.studentType,
          session: f.session,
        }
        setGridData(prev => [newRow, ...prev])
        showToast('Registration added successfully!')
      }
      setFormLoading(false)
      setShowForm(false)
      setForm(emptyForm())
      setEditId(null)
    }, 700)
  }, [editId])

  const handleCancel = () => {
    setShowForm(false)
    setForm(emptyForm())
    setEditId(null)
  }

  // ── Grid filter ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = gridData
    if (gridSession) data = data.filter(r => r.session === gridSession)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.class_name.toLowerCase().includes(q) ||
        r.session.toLowerCase().includes(q) ||
        (r.studentType || '').toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      )
    }
    return data
  }, [gridData, gridSession, search])

  return (
    <div className="space-y-5 pb-12">
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .form-appear{animation:fadeIn .25s ease}
      `}</style>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Registration Open
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage open/close dates, fee &amp; age criteria per class.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => { setForm(emptyForm()); setEditId(null); setShowForm(true) }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {/* FORM PANEL */}
      {showForm && (
        <div className="form-appear">
          <FormPanel
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={formLoading}
            isEdit={editId !== null}
          />
        </div>
      )}

      {/* GRID SECTION */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Grid Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Registration Records</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {/* Session filter */}
            <div className="w-36">
              <NativeSelect value={gridSession} onChange={e => setGridSession(e.target.value)} placeholder="All Sessions">
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </div>
            {/* Search */}
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-7 py-2 text-[12px] rounded-xl border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Reset */}
            <button type="button" onClick={() => { setGridSession(''); setSearch('') }}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {/* Add New */}
            {!showForm && (
              <button type="button"
                onClick={() => { setForm(emptyForm()); setEditId(null); setShowForm(true) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-2 text-[12px] rounded-xl border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]"
              />
            </div>
            <button type="button" onClick={() => setMobileFilter(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <SlidersHorizontal className="w-4 h-4" />
              {gridSession && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">1</span>
              )}
            </button>
            {!showForm && (
              <button type="button"
                onClick={() => { setForm(emptyForm()); setEditId(null); setShowForm(true) }}
                className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Add New FAB hint */}
        {!showForm && (
          <div className="sm:hidden flex items-center gap-2 px-4 py-2 bg-blue-50/50 dark:bg-blue-500/[0.04] border-b border-blue-100/50 dark:border-blue-500/10">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[11px] text-blue-600 dark:text-blue-400">Tap + to add a new registration. Tap any card to expand details.</p>
          </div>
        )}

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No records found.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Class', 'Open Date', 'Close Date', 'Min Age', 'Max Age', 'Fee', 'Student Type', 'Status', 'Session', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} onEdit={handleEdit} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No records found.</span>
            </div>
          ) : (
            filtered.map(row => (
              <MobileGridCard key={row.id} row={row} onEdit={handleEdit} />
            ))
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.01]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{gridData.length}</span> records
          </p>
          {(search || gridSession) && (
            <button onClick={() => { setSearch(''); setGridSession('') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={mobileFilter}
        onClose={() => setMobileFilter(false)}
        gridSession={gridSession}
        setGridSession={setGridSession}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
